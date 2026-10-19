#!/usr/bin/env node
/**
 * Vertont alles, was Pieks sagt (texte.js und fakten.js), mit ElevenLabs und
 * legt es als audio/<kennung>.mp3 ab. Die Kennung ist ein Prüfwert über den
 * gesprochenen Text (siehe kennung() in texte.js): ändert sich ein Satz,
 * entsteht eine neue Datei, und die alte wird als verwaist gemeldet.
 *
 * Nutzung:
 *   ELEVENLABS_API_KEY=... node pieks/make-audio.mjs     fehlende Aufnahmen erzeugen
 *
 * Optionen:
 *   --dry          nur zeigen, was erzeugt würde (und wie viele Zeichen)
 *   --force        alles neu erzeugen, z.B. nach einem Stimmwechsel
 *   --aufraeumen   verwaiste Dateien löschen
 *   --nur <gruppe> nur pieks, besuch oder fakt
 *   --voice <id>   andere Stimme (Standard: STIMME unten)
 *   --speed <n>    Sprechtempo 0.7–1.2 (Standard: 1)
 *
 * Reihenfolge: zuerst Pieks' eigene Sätze, dann die Besucher, zuletzt die
 * Fakten. Reicht das Kontingent nicht, fehlen also höchstens Fakten, und
 * die zeigt die App dann einfach ohne Ton. Nochmal starten macht weiter.
 *
 * Der Schlüssel kommt nur aus der Umgebung und landet nie im Repo.
 */
import { createRequire } from 'node:module';
import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const AUDIO = join(DIR, 'audio');
const require = createRequire(import.meta.url);
const T = require('./texte.js');
T.setFakten(require('./fakten.js').FAKTEN);

// «Lucy Fennek – Trendy Lifestyle Promoter»: peppig und frech, für Pieks
// ausgewählt (Probe B, 19.10.2026)
const STIMME = 'egBwWoDtXGCSMgwiS3vn';
const MODELL = 'eleven_multilingual_v2';
const GLEICHZEITIG = 3;
const REIHE = ['pieks', 'besuch', 'fakt'];

const args = process.argv.slice(2);
const has = f => args.includes(f);
const opt = f => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };

// Jeder Satz nur einmal, auch wenn er in mehreren Listen steht
const saetze = [...new Map(T.alleSaetze().map(x => [T.kennung(x.s), x])).entries()]
  .map(([id, x]) => ({ id, ...x }))
  .sort((a, b) => REIHE.indexOf(a.gruppe) - REIHE.indexOf(b.gruppe));

mkdirSync(AUDIO, { recursive: true });
const vorhanden = new Set(readdirSync(AUDIO).filter(f => f.endsWith('.mp3')).map(f => f.slice(0, -4)));
// Welche Aufnahmen es gibt: die App erzählt damit bevorzugt Fakten mit Ton,
// solange noch nicht alle vertont sind
function listeSchreiben() {
  const ids = readdirSync(AUDIO).filter(f => f.endsWith('.mp3')).map(f => f.slice(0, -4)).sort();
  writeFileSync(join(AUDIO, 'vorhanden.json'), JSON.stringify(ids));
  const fehlen = saetze.filter(x => !ids.includes(x.id)).length;
  console.log('audio/vorhanden.json: ' + ids.length + ' Aufnahmen' + (fehlen ? ', ' + fehlen + ' fehlen noch.' : ', alle da.'));
}
const verwaist = [...vorhanden].filter(id => !saetze.some(x => x.id === id));
if (verwaist.length) {
  if (has('--aufraeumen')) {
    verwaist.forEach(id => unlinkSync(join(AUDIO, id + '.mp3')));
    console.log(verwaist.length + ' verwaiste Dateien gelöscht.');
  } else {
    console.log(verwaist.length + ' verwaiste Dateien (löschen mit --aufraeumen): ' + verwaist.join(', '));
  }
}

const nur = opt('--nur');
const todo = saetze.filter(x => (has('--force') || !vorhanden.has(x.id)) && (!nur || x.gruppe === nur));
const zeichen = todo.reduce((n, x) => n + x.s.length, 0);
const proGruppe = REIHE.map(g => g + ' ' + todo.filter(x => x.gruppe === g).length).join(', ');
console.log(saetze.length + ' Sätze, davon ' + todo.length + ' zu vertonen (' + proGruppe + '; ' + zeichen + ' Zeichen).');
if (has('--dry')) {
  todo.forEach(x => console.log('  ' + x.id + ' [' + x.gruppe + ']  «' + x.s + '»'));
  process.exit(0);
}
if (!todo.length) { listeSchreiben(); process.exit(0); }

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) { console.error('ELEVENLABS_API_KEY fehlt.'); process.exit(1); }
const voice = opt('--voice') || STIMME;
const speed = Math.min(1.2, Math.max(0.7, parseFloat(opt('--speed') || '1')));

class Kontingent extends Error {}
let kosten = 0;
async function vertonen(x) {
  const body = { text: x.s, model_id: MODELL };
  if (speed !== 1) body.voice_settings = { speed };
  if (x.vorher) body.previous_text = x.vorher;
  if (x.nachher) body.next_text = x.nachher;
  for (let versuch = 1; versuch <= 5; versuch++) {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_64`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (r.ok) {
      writeFileSync(join(AUDIO, x.id + '.mp3'), Buffer.from(await r.arrayBuffer()));
      kosten += +(r.headers.get('character-cost') || 0);
      return;
    }
    const fehler = await r.text();
    if (/quota_exceeded|insufficient|credits/i.test(fehler)) throw new Kontingent('Kontingent aufgebraucht: ' + fehler.slice(0, 300));
    if ((r.status === 429 || r.status >= 500) && versuch < 5) {
      await new Promise(res => setTimeout(res, 1500 * versuch));
      continue;
    }
    throw new Error('ElevenLabs ' + r.status + ' bei «' + x.s + '»: ' + fehler.slice(0, 300));
  }
}

// Ein paar gleichzeitig, wie es das Konto erlaubt
let naechster = 0, fertig = 0, abbruch = null;
async function arbeiter() {
  while (naechster < todo.length && !abbruch) {
    const x = todo[naechster++];
    try {
      await vertonen(x);
    } catch (e) {
      abbruch = e;
      return;
    }
    fertig++;
    if (fertig % 10 === 0 || fertig === todo.length) console.log(`  [${fertig}/${todo.length}] ${x.gruppe}  «${x.s.length > 60 ? x.s.slice(0, 57) + '…' : x.s}»`);
  }
}
await Promise.all(Array.from({ length: GLEICHZEITIG }, arbeiter));
console.log(`Verbraucht laut ElevenLabs: ${kosten} Credits für ${fertig} Aufnahmen.`);
listeSchreiben();
if (abbruch) {
  console.error(abbruch.message);
  console.error('Abgebrochen; ' + fertig + ' Aufnahmen sind gespeichert. Nochmal starten macht beim Rest weiter.');
  process.exit(1);
}
console.log('Fertig. Neue Dateien in pieks/audio/ committen.');
