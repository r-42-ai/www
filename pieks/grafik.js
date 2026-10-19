'use strict';

/* =====================================================================
   GRAFIK: Pieks, seine Garderobe und alle Besucher als SVG.
   Alles ist von Hand gezeichnet, im Koordinatensystem der jeweiligen
   viewBox. Pieks schaut nach vorne (viewBox 0 -24 200 224, Platz für
   Hüte), die Besucher schauen nach rechts und werden für den Weg nach
   links gespiegelt.
   ===================================================================== */

// Stachelmantel (zweilagig, mit hellen Spitzen wie echte Igelstacheln)
const STACHELN_HINTEN = 'M65.9 177.7 Q54.6 184.8 48.6 189.3 Q51.4 180.6 52.7 168.4 Q43.1 172.9 37.7 174.7 Q40.8 168.2 41.8 156.4 Q29.1 157.9 22.0 159.2 Q27.9 152.7 33.7 142.3 Q19.5 143.7 10.1 144.2 Q19.3 138.2 28.9 126.6 Q17.2 121.5 10.9 119.4 Q18.4 116.3 27.5 110.3 Q14.7 104.1 6.6 100.5 Q16.9 99.2 29.6 94.0 Q23.4 84.6 20.5 80.8 Q26.5 80.6 35.2 78.6 Q29.8 68.2 26.9 63.3 Q33.7 64.9 43.9 64.8 Q41.8 53.2 40.5 48.1 Q46.4 50.9 55.3 53.4 Q54.2 40.1 52.9 33.0 Q59.2 38.8 69.0 44.8 Q69.7 34.9 70.7 30.4 Q74.8 34.7 84.1 39.4 Q90.3 23.5 92.2 13.4 Q95.6 24.7 100.0 37.6 Q104.6 26.5 107.7 20.3 Q109.4 28.5 115.9 39.4 Q126.7 32.6 130.6 29.0 Q130.7 35.9 131.0 44.8 Q141.6 37.0 147.4 32.2 Q145.1 41.0 144.7 53.4 Q156.5 50.4 162.0 48.4 Q158.9 55.1 156.1 64.8 Q170.3 59.6 179.9 56.2 Q172.0 64.9 164.8 78.6 Q176.0 80.1 181.6 80.7 Q176.3 85.3 170.4 94.0 Q181.7 98.4 187.6 100.2 Q180.8 103.6 172.5 110.3 Q185.5 115.0 193.7 118.2 Q183.6 120.1 171.1 126.6 Q179.9 134.6 184.7 138.7 Q177.0 138.9 166.3 142.3 Q177.1 152.3 184.1 159.3 Q173.3 156.2 158.2 156.4 Q165.8 169.2 170.8 177.4 Q161.2 172.1 147.3 168.4 Q148.5 180.0 149.3 185.7 Q143.6 181.6 134.1 177.7 Z';
const STACHELN_VORNE = 'M63.8 167.2 Q51.9 173.4 43.3 176.1 Q47.7 167.6 51.9 156.6 Q38.9 158.9 30.3 159.1 Q36.3 152.3 42.9 143.5 Q31.9 141.3 25.8 138.7 Q31.0 134.5 37.2 128.4 Q28.8 126.3 24.6 122.4 Q29.2 119.5 35.2 112.4 Q26.3 102.9 22.0 97.4 Q28.8 96.4 37.0 96.4 Q27.5 89.0 22.6 82.1 Q31.1 82.9 42.5 81.3 Q35.6 69.5 32.2 61.1 Q40.7 64.6 51.3 68.0 Q46.7 57.4 45.9 49.6 Q52.6 53.9 63.1 57.3 Q64.8 44.9 66.6 38.1 Q71.4 43.2 76.9 49.8 Q78.7 39.7 82.0 34.1 Q85.4 39.4 92.2 45.9 Q96.1 34.4 100.7 27.7 Q102.9 35.9 107.8 45.9 Q118.2 36.0 124.7 30.3 Q124.3 39.4 123.1 49.8 Q133.6 41.1 141.4 36.4 Q138.9 45.7 136.9 57.3 Q150.1 51.8 159.1 49.1 Q154.1 57.7 148.7 68.0 Q159.4 69.2 164.7 71.2 Q161.6 75.6 157.5 81.3 Q171.3 82.7 180.1 84.6 Q172.2 89.8 163.0 96.4 Q175.4 102.0 182.8 106.2 Q174.6 109.1 164.8 112.4 Q175.7 121.0 182.1 126.9 Q173.2 127.7 162.8 128.4 Q170.3 140.2 174.4 147.2 Q166.3 145.9 157.1 143.5 Q161.1 155.5 162.6 162.5 Q156.0 160.0 148.1 156.6 Q150.5 165.4 149.4 171.0 Q144.7 168.7 136.2 167.2 Z';

// Eine Stachelkugel mit n Stacheln (für die eingerollte Kugel und kleine Igel)
function stachelkranz(cx, cy, r, n, lang, seed, a0 = 0, a1 = Math.PI * 2) {
  let s = seed;
  const zz = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const P = (a, k) => [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k];
  const f = x => x.toFixed(1);
  const voll = Math.abs(a1 - a0 - Math.PI * 2) < 1e-6;
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = a0 + (a1 - a0) * i / n;
    const [vx, vy] = P(a, 0.9);
    if (i === 0) d += `M${f(vx)} ${f(vy)}`;
    if (i === n) break;
    const am = a0 + (a1 - a0) * (i + 0.5 + (zz() - 0.5) * 0.3) / n;
    const k = lang * (0.93 + zz() * 0.14);
    const [tx, ty] = P(am, k);
    const [nx, ny] = P(a0 + (a1 - a0) * (i + 1) / n, 0.9);
    const [c1x, c1y] = P(am - 0.04, (0.9 + k) / 2 + 0.03);
    const [c2x, c2y] = P(am + 0.04, (0.9 + k) / 2 + 0.01);
    d += ` Q${f(c1x)} ${f(c1y)} ${f(tx)} ${f(ty)} Q${f(c2x)} ${f(c2y)} ${f(nx)} ${f(ny)}`;
  }
  return d + (voll ? ' Z' : '');
}

const PIEKS_DEFS = `
  <radialGradient id="pk-st" cx="100" cy="112" r="96" gradientUnits="userSpaceOnUse">
    <stop offset=".62" stop-color="#5E3E25"/><stop offset=".86" stop-color="#7E5230"/><stop offset="1" stop-color="#CFAE7E"/>
  </radialGradient>
  <radialGradient id="pk-st2" cx="100" cy="112" r="88" gradientUnits="userSpaceOnUse">
    <stop offset=".6" stop-color="#7A4E2C"/><stop offset=".88" stop-color="#93633A"/><stop offset="1" stop-color="#E2C596"/>
  </radialGradient>
  <radialGradient id="pk-kugel" cx="50" cy="52" r="50" gradientUnits="userSpaceOnUse">
    <stop offset=".55" stop-color="#5E3E25"/><stop offset=".84" stop-color="#83552F"/><stop offset="1" stop-color="#D8B886"/>
  </radialGradient>
  <radialGradient id="pk-kugel2" cx="50" cy="52" r="42" gradientUnits="userSpaceOnUse">
    <stop offset=".5" stop-color="#7A4E2C"/><stop offset=".85" stop-color="#93633A"/><stop offset="1" stop-color="#E2C596"/>
  </radialGradient>
  <linearGradient id="pk-glas" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#E9F7FF" stop-opacity=".55"/><stop offset="1" stop-color="#9FD6F5" stop-opacity=".18"/>
  </linearGradient>
  <linearGradient id="pk-gold" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FFE27A"/><stop offset="1" stop-color="#F2A813"/>
  </linearGradient>
  <linearGradient id="gk-gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#FFF0A6"/><stop offset=".5" stop-color="#F7C22E"/><stop offset="1" stop-color="#C98A0B"/>
  </linearGradient>`;

/* Pieks von vorne. Gesichtsausdrücke über Klassen am <svg>:
   froh · oops · spricht · schlaeft · staunt. Der Mund beim Sprechen
   folgt der Lautstärke über die CSS-Variable --mund (0 … 1). */
function pieksSVG(extra = '') {
  return `<svg class="pieks ${extra}" viewBox="0 -24 200 224" aria-hidden="true" focusable="false">
  <g class="pk-ganz">
    <g class="slot-ruecken"></g>
    <path class="pk-stacheln" d="${STACHELN_HINTEN}" fill="url(#pk-st)"/>
    <path class="pk-stacheln2" d="${STACHELN_VORNE}" fill="url(#pk-st2)"/>
    <g class="pk-koerper">
      <path d="M56 150 C56 128 76 116 100 116 C124 116 144 128 144 150 C144 176 126 194 100 194 C74 194 56 176 56 150 Z" fill="#E8C597"/>
      <ellipse cx="100" cy="166" rx="27" ry="24" fill="#F4E0BE"/>
      <ellipse class="pk-fuss" cx="78" cy="192" rx="14" ry="7" fill="#8A5B38"/>
      <ellipse class="pk-fuss" cx="122" cy="192" rx="14" ry="7" fill="#8A5B38"/>
    </g>
    <g class="pk-kopf">
      <ellipse cx="56" cy="74" rx="13" ry="12" fill="#E8C597"/><ellipse cx="56" cy="75" rx="6.5" ry="6" fill="#EFA59B"/>
      <ellipse cx="144" cy="74" rx="13" ry="12" fill="#E8C597"/><ellipse cx="144" cy="75" rx="6.5" ry="6" fill="#EFA59B"/>
      <path d="M100 58 C130 58 160 78 162 106 C164 134 128 156 100 166 C72 156 36 134 38 106 C40 78 70 58 100 58 Z" fill="#F1D4A8"/>
      <path d="M86 56 Q84 40 76 30 Q90 36 96 46 Q99 30 105 20 Q108 34 106 47 Q114 37 126 33 Q116 44 114 57 Q100 52 86 56 Z" fill="#7E5230"/>
      <path d="M97 46 Q99 32 105 20 Q103 34 101 47 Z" fill="#B48455" opacity=".7"/>
      <ellipse cx="100" cy="144" rx="24" ry="16" fill="#FAE8CB"/>
      <g class="pk-brauen" fill="none" stroke="#5A3420" stroke-width="3.2" stroke-linecap="round">
        <path d="M65 90 Q75 87 86 80"/><path d="M114 80 Q125 87 135 90"/>
      </g>
      <g class="pk-augen">
        <ellipse cx="77" cy="104" rx="8.4" ry="10.4" fill="#2B1A10"/>
        <ellipse cx="123" cy="104" rx="8.4" ry="10.4" fill="#2B1A10"/>
        <circle cx="80.2" cy="99.8" r="3.2" fill="#fff"/><circle cx="126.2" cy="99.8" r="3.2" fill="#fff"/>
        <circle cx="74.8" cy="108.5" r="1.4" fill="#fff" opacity=".8"/><circle cx="120.8" cy="108.5" r="1.4" fill="#fff" opacity=".8"/>
      </g>
      <g class="pk-augen-froh" fill="none" stroke="#2B1A10" stroke-width="3.6" stroke-linecap="round">
        <path d="M68 107 Q77 96 86 107"/><path d="M114 107 Q123 96 132 107"/>
      </g>
      <g class="pk-augen-zu" fill="none" stroke="#2B1A10" stroke-width="3.2" stroke-linecap="round">
        <path d="M68 104 Q77 111 86 104"/><path d="M114 104 Q123 111 132 104"/>
      </g>
      <ellipse cx="100" cy="140" rx="10.5" ry="8" fill="#2B1A10"/>
      <ellipse cx="96.5" cy="137" rx="3.4" ry="2.2" fill="#fff" opacity=".55"/>
      <path class="pk-mund-zu" d="M91 153 Q100 161 109 153" stroke="#5A3420" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <g class="pk-mund-auf">
        <path d="M89 151 Q100 151 111 151 Q110 166 100 167 Q90 166 89 151 Z" fill="#6E2A22"/>
        <ellipse cx="100" cy="162" rx="6" ry="3.2" fill="#EE7B7F"/>
      </g>
      <ellipse class="pk-mund-o" cx="100" cy="157" rx="5" ry="4.4" fill="#6E2A22"/>
      <ellipse cx="61" cy="125" rx="10" ry="6.5" fill="#F59E95" opacity=".6"/>
      <ellipse cx="139" cy="125" rx="10" ry="6.5" fill="#F59E95" opacity=".6"/>
    </g>
    <g class="slot-augen"></g>
    <g class="slot-hals"></g>
    <g class="pk-haende">
      <ellipse cx="72" cy="168" rx="9" ry="10" fill="#8A5B38"/>
      <ellipse cx="128" cy="168" rx="9" ry="10" fill="#8A5B38"/>
    </g>
    <g class="slot-pfote"></g>
    <g class="slot-kopf"></g>
  </g>
</svg>`;
}

// Eingerollte Stachelkugel, die Nase schaut noch heraus (viewBox 0 0 100 100)
const KUGEL_PFAD = stachelkranz(50, 52, 38, 22, 1.25, 4);
const KUGEL_PFAD2 = stachelkranz(50, 52, 33, 18, 1.18, 8);
function kugelSVG(extra = '') {
  return `<svg class="kugel ${extra}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <path d="${KUGEL_PFAD}" fill="url(#pk-kugel)"/>
    <path d="${KUGEL_PFAD2}" fill="url(#pk-kugel2)"/>
    <g stroke="#C9A06C" stroke-width="2.2" stroke-linecap="round" opacity=".75">
      <path d="M30 30 L22 20"/><path d="M50 22 L50 10"/><path d="M70 30 L78 20"/><path d="M24 52 L12 50"/><path d="M34 74 L26 82"/>
    </g>
    <ellipse cx="66" cy="74" rx="20" ry="14" fill="#E8C597"/>
    <path d="M56 70 C64 62 80 62 88 72 C82 82 66 84 56 78 Z" fill="#F1D4A8"/>
    <ellipse cx="88" cy="72" rx="4.6" ry="3.8" fill="#2B1A10"/><ellipse cx="86.6" cy="70.6" rx="1.4" ry="1" fill="#fff" opacity=".6"/>
    <path d="M64 68 Q68 72 72 68" stroke="#2B1A10" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="66" cy="77" rx="4" ry="2.4" fill="#F59E95" opacity=".7"/>
    <ellipse cx="56" cy="62" rx="5" ry="4.5" fill="#E8C597"/><ellipse cx="56" cy="62.5" rx="2.5" ry="2.2" fill="#EFA59B"/>
  </svg>`;
}

// Kleiner Igel von der Seite, läuft nach rechts (viewBox 0 0 100 64)
const IGELCHEN_STACHELN = stachelkranz(44, 42, 34, 15, 1.22, 9, Math.PI * 1.02, Math.PI * 1.98);
const IGELCHEN = `
  <ellipse class="bein a" cx="28" cy="56" rx="5" ry="6.5" fill="#7A4E2C"/>
  <ellipse class="bein b" cx="40" cy="57" rx="5" ry="6.5" fill="#8A5B38"/>
  <ellipse class="bein b" cx="56" cy="56" rx="5" ry="6.5" fill="#7A4E2C"/>
  <ellipse class="bein a" cx="66" cy="57" rx="5" ry="6.5" fill="#8A5B38"/>
  <path d="${IGELCHEN_STACHELN} L78 42 C78 52 66 58 44 58 C22 58 10 52 10 42 Z" fill="url(#pk-kugel)"/>
  <path d="M62 30 C72 28 84 34 96 44 C88 50 74 54 62 50 C56 44 56 34 62 30 Z" fill="#F1D4A8"/>
  <ellipse cx="96" cy="44" rx="3.6" ry="3" fill="#2B1A10"/>
  <ellipse cx="74" cy="38" rx="3" ry="3.6" fill="#2B1A10"/><circle cx="75" cy="37" r="1" fill="#fff"/>
  <ellipse cx="66" cy="29" rx="5" ry="4.5" fill="#E8C597"/>
  <ellipse cx="76" cy="46" rx="4" ry="2.4" fill="#F59E95" opacity=".6"/>`;

/* =====================================================================
   GARDEROBE: was Pieks anziehen kann. Jedes Teil sitzt in einem Platz
   (kopf, augen, hals, pfote) und ist im Koordinatensystem von Pieks
   gezeichnet. Namen, Preise und Sprüche stehen in texte.js (ITEMS).
   ===================================================================== */
const BLUME = (x, y, c, r = 7) => `<g transform="translate(${x} ${y})"><g fill="${c}">
  <circle cx="0" cy="${-r * .7}" r="${r * .62}"/><circle cx="${r * .67}" cy="${-r * .2}" r="${r * .62}"/><circle cx="${r * .41}" cy="${r * .6}" r="${r * .62}"/>
  <circle cx="${-r * .41}" cy="${r * .6}" r="${r * .62}"/><circle cx="${-r * .67}" cy="${-r * .2}" r="${r * .62}"/></g>
  <circle r="${r * .42}" fill="#FFD43B"/></g>`;
const ITEM_SVG = {
  schleife: `<g transform="translate(140 40) rotate(18)">
      <path d="M0 0 C-10 -14 -30 -14 -30 0 C-30 14 -10 14 0 0 Z" fill="#FF6FA5"/>
      <path d="M0 0 C10 -14 30 -14 30 0 C30 14 10 14 0 0 Z" fill="#FF6FA5"/>
      <path d="M-3 2 L-12 22 L-5 19 L-2 26 L2 4 Z M3 2 L12 22 L5 19 L2 26 L-2 4 Z" fill="#E94F8C"/>
      <circle cx="-17" cy="-2" r="2.6" fill="#fff" opacity=".7"/><circle cx="19" cy="-3" r="2.6" fill="#fff" opacity=".7"/>
      <rect x="-6" y="-7" width="12" height="14" rx="5" fill="#E94F8C"/></g>`,
  muetze: `<g>
      <path d="M50 66 C46 10 154 10 150 66 Z" fill="#E2483D"/>
      <path d="M62 30 C80 22 120 22 138 30 M54 46 C80 38 120 38 146 46" stroke="#F47A6E" stroke-width="5" fill="none" stroke-linecap="round"/>
      <rect x="44" y="56" width="112" height="20" rx="10" fill="#F6EFE4"/>
      <path d="M52 66 H148" stroke="#E2DACB" stroke-width="2" stroke-dasharray="4 5"/>
      <circle cx="100" cy="6" r="13" fill="#F6EFE4"/><circle cx="96" cy="2" r="4" fill="#fff"/></g>`,
  kranz: `<g>
      <path d="M48 62 Q100 34 152 62" stroke="#5DAA45" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M62 52 l-8 -6 l10 0 Z M90 43 l-6 -8 l10 3 Z M118 44 l4 -9 l4 9 Z M142 54 l9 -4 l-4 9 Z" fill="#5DAA45"/>
      ${BLUME(52, 60, '#FF8FB8', 8)}${BLUME(76, 47, '#FFFFFF', 8)}${BLUME(100, 42, '#B48CFF', 9)}${BLUME(124, 47, '#FFB65C', 8)}${BLUME(148, 60, '#FF8FB8', 8)}</g>`,
  kopfhoerer: `<g>
      <path d="M44 86 C40 20 160 20 156 86" stroke="#3A3F4B" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M50 72 C52 34 148 34 150 72" stroke="#5A6070" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>
      <rect x="30" y="70" width="26" height="36" rx="12" fill="#2EC4B6"/><rect x="144" y="70" width="26" height="36" rx="12" fill="#2EC4B6"/>
      <rect x="35" y="76" width="9" height="24" rx="4.5" fill="#9BEDE5"/><rect x="156" y="76" width="9" height="24" rx="4.5" fill="#9BEDE5"/></g>`,
  zauberhut: `<g>
      <path d="M58 58 L112 -22 L142 58 Z" fill="#4D5BD8"/>
      <path d="M112 -22 L126 20 L142 58 L120 58 Z" fill="#3B47B5"/>
      <ellipse cx="100" cy="58" rx="58" ry="10" fill="#3B47B5"/>
      <path d="M62 54 Q100 64 138 54" stroke="#FFD43B" stroke-width="5" fill="none"/>
      <path d="M95 22 l3 7 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1 Z" fill="#FFD43B"/>
      <circle cx="117" cy="6" r="3" fill="#fff"/><circle cx="84" cy="44" r="2.4" fill="#fff"/><circle cx="124" cy="38" r="3.2" fill="#FFD43B"/></g>`,
  piratenhut: `<g>
      <path d="M36 62 C44 30 76 20 100 20 C124 20 156 30 164 62 C140 52 60 52 36 62 Z" fill="#26262E"/>
      <path d="M36 62 C60 52 140 52 164 62" stroke="#E8B530" stroke-width="4" fill="none"/>
      <circle cx="100" cy="38" r="9" fill="#F6F1E6"/>
      <rect x="95" y="44" width="10" height="6" rx="2" fill="#F6F1E6"/>
      <circle cx="96.5" cy="37" r="2.2" fill="#26262E"/><circle cx="103.5" cy="37" r="2.2" fill="#26262E"/>
      <path d="M84 50 L116 58 M116 50 L84 58" stroke="#F6F1E6" stroke-width="3.6" stroke-linecap="round"/></g>`,
  krone: `<g>
      <path d="M62 60 L56 22 L78 40 L100 14 L122 40 L144 22 L138 60 Z" fill="url(#pk-gold)" stroke="#D48C0B" stroke-width="2.5" stroke-linejoin="round"/>
      <rect x="60" y="52" width="80" height="12" rx="4" fill="#F2A813"/>
      <circle cx="56" cy="22" r="5" fill="#FFE27A"/><circle cx="100" cy="14" r="5.5" fill="#FFE27A"/><circle cx="144" cy="22" r="5" fill="#FFE27A"/>
      <circle cx="80" cy="58" r="4" fill="#E2483D"/><circle cx="100" cy="58" r="4.6" fill="#2EC4B6"/><circle cx="120" cy="58" r="4" fill="#E2483D"/>
      <path d="M88 30 L92 46" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/></g>`,
  astronaut: `<g>
      <circle cx="100" cy="100" r="96" fill="url(#pk-glas)" stroke="#DDEFFA" stroke-width="5"/>
      <path d="M40 60 C52 30 80 14 108 12" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" opacity=".7"/>
      <circle cx="150" cy="44" r="6" fill="#fff" opacity=".6"/>
      <path d="M30 168 C60 186 140 186 170 168 L176 186 C140 204 60 204 24 186 Z" fill="#C9D3DE"/>
      <rect x="88" y="182" width="24" height="10" rx="3" fill="#E2483D"/></g>`,
  einhorn: `<g>
      <path d="M90 58 L102 -10 L114 58 Z" fill="#FFF3FA"/>
      <path d="M92 48 L112 40 M94 36 L110 28 M97 22 L108 16 M99 10 L105 6" stroke="#FF8FB8" stroke-width="5" stroke-linecap="round"/>
      <path d="M91 54 L113 47" stroke="#B48CFF" stroke-width="5" stroke-linecap="round"/>
      <path d="M100 -6 L102 -10 L104 -4" stroke="#fff" stroke-width="2" fill="none"/>
      ${BLUME(78, 60, '#B48CFF', 6)}${BLUME(124, 60, '#FF8FB8', 6)}</g>`,
  sonnenbrille: `<g>
      <path d="M54 96 H146" stroke="#26262E" stroke-width="5" stroke-linecap="round"/>
      <path d="M58 94 H96 C96 112 90 120 77 120 C64 120 58 112 58 94 Z" fill="#26262E"/>
      <path d="M104 94 H142 C142 112 136 120 123 120 C110 120 104 112 104 94 Z" fill="#26262E"/>
      <path d="M64 100 L74 100 M110 100 L120 100" stroke="#8C95A8" stroke-width="3.5" stroke-linecap="round"/></g>`,
  brille: `<g fill="none" stroke="#8C5A2B" stroke-width="4">
      <circle cx="77" cy="104" r="16" fill="#fff" fill-opacity=".18"/><circle cx="123" cy="104" r="16" fill="#fff" fill-opacity=".18"/>
      <path d="M93 102 Q100 96 107 102"/><path d="M61 100 L46 94 M139 100 L154 94" stroke-linecap="round"/></g>`,
  herzbrille: `<g>
      <path d="M77 122 C60 110 56 102 56 96 C56 88 62 84 68 84 C72 84 75 86 77 90 C79 86 82 84 86 84 C92 84 98 88 98 96 C98 102 94 110 77 122 Z" fill="#FF4F8B" opacity=".9"/>
      <path d="M123 122 C106 110 102 102 102 96 C102 88 108 84 114 84 C118 84 121 86 123 90 C125 86 128 84 132 84 C138 84 144 88 144 96 C144 102 140 110 123 122 Z" fill="#FF4F8B" opacity=".9"/>
      <path d="M98 96 H102" stroke="#C2185B" stroke-width="4"/>
      <path d="M64 94 Q66 89 71 89 M110 94 Q112 89 117 89" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/></g>`,
  augenklappe: `<g>
      <path d="M48 64 L154 120" stroke="#26262E" stroke-width="3.5"/>
      <path d="M108 92 C112 88 134 88 138 92 C142 100 138 116 123 118 C108 116 104 100 108 92 Z" fill="#26262E"/></g>`,
  fliege: `<g transform="translate(100 156)">
      <path d="M0 0 L-22 -12 C-28 -8 -28 8 -22 12 Z" fill="#E2483D"/>
      <path d="M0 0 L22 -12 C28 -8 28 8 22 12 Z" fill="#E2483D"/>
      <circle cx="-16" cy="-3" r="2.2" fill="#fff"/><circle cx="-12" cy="5" r="2.2" fill="#fff"/><circle cx="16" cy="-3" r="2.2" fill="#fff"/><circle cx="12" cy="5" r="2.2" fill="#fff"/>
      <rect x="-6" y="-6" width="12" height="12" rx="4" fill="#B8322A"/></g>`,
  schal: `<g>
      <path d="M58 150 C80 162 120 162 142 150 L144 166 C120 178 80 178 56 166 Z" fill="#2EC4B6"/>
      <path d="M68 156 L66 171 M86 160 L85 175 M104 161 L104 176 M122 159 L123 174" stroke="#F6EFE4" stroke-width="6"/>
      <path d="M118 166 L132 166 L138 200 L120 200 Z" fill="#2EC4B6"/>
      <path d="M120 178 L134 178 M121 190 L136 190" stroke="#F6EFE4" stroke-width="5"/>
      <path d="M120 200 L122 207 M126 200 L127 207 M132 200 L133 207" stroke="#2EC4B6" stroke-width="2.5" stroke-linecap="round"/></g>`,
  medaille: `<g>
      <path d="M80 150 L94 182 L100 182 L88 148 Z M120 150 L106 182 L100 182 L112 148 Z" fill="#4D5BD8"/>
      <path d="M86 149 L96 172 M114 149 L104 172" stroke="#E2483D" stroke-width="3"/>
      <circle cx="100" cy="186" r="13" fill="url(#pk-gold)" stroke="#D48C0B" stroke-width="2.5"/>
      <path d="M100 179 l2.4 5 5.4 .6 -4 3.7 1.1 5.3 -4.9 -2.8 -4.9 2.8 1.1 -5.3 -4 -3.7 5.4 -.6 Z" fill="#FFF3C4"/></g>`,
  bleistift: `<g transform="translate(132 170) rotate(-38)">
      <rect x="-5" y="-46" width="10" height="44" fill="#FFC233"/>
      <rect x="-5" y="-46" width="3.4" height="44" fill="#FFD76B"/>
      <rect x="-5" y="-54" width="10" height="9" rx="2" fill="#FF8FB8"/><rect x="-5" y="-47" width="10" height="3" fill="#C9C9C9"/>
      <path d="M-5 -2 L0 10 L5 -2 Z" fill="#F4D6A8"/><path d="M-1.8 5 L0 10 L1.8 5 Z" fill="#3A3A3A"/></g>`,
  zauberstab: `<g transform="translate(68 170) rotate(28)">
      <rect x="-3" y="-50" width="6" height="52" rx="3" fill="#3A2A55"/>
      <rect x="-3" y="-12" width="6" height="12" rx="2" fill="#FFE27A"/>
      <path d="M0 -76 l6 13 14 1.6 -10.6 9.6 3 14 -12.4 -7.2 -12.4 7.2 3 -14 -10.6 -9.6 14 -1.6 Z" fill="url(#pk-gold)" stroke="#E8A20E" stroke-width="2"/>
      <circle cx="16" cy="-74" r="2.4" fill="#fff"/><circle cx="-18" cy="-60" r="1.8" fill="#fff"/></g>`,
};

/* =====================================================================
   BESUCHER: Tiere (und ein paar Überraschungen), die über die Lichtung
   ziehen. vb = viewBox, die Zeichnung schaut nach rechts. Beine mit
   class="bein a|b" laufen, class="fluegel" schlägt. Wer wann kommt und
   was Pieks dazu sagt, steht in texte.js (BESUCHER).
   ===================================================================== */
const GANS = (x, y, p) => `
    <g transform="translate(${x - 20} ${y - 10})">
      <path d="M2 10 C8 6 22 6 30 9 C36 8 42 8 46 9 C42 11 36 12 30 12 C22 15 8 15 2 10 Z" fill="#6E6A66"/>
      <circle cx="47" cy="9" r="3.4" fill="#2A2724"/><path d="M50 9 L54 9.6 L50 10.6 Z" fill="#2A2724"/>
      <path d="M38 9.6 L44 9.6" stroke="#F4F1EC" stroke-width="1.6"/>
      <g class="fluegel" style="animation-delay:-${p}s"><path d="M16 9 C14 0 20 -6 26 -8 C26 0 24 6 22 10 Z" fill="#57534F"/></g>
    </g>`;
const GLUEH = (x, y, d) => `
    <g class="gluehen" style="animation-delay:-${d}s"><circle cx="${x}" cy="${y}" r="9" fill="#E9FF7A" opacity=".25"/><circle cx="${x}" cy="${y}" r="4" fill="#F4FF9A"/><circle cx="${x - 3}" cy="${y - 3}" r="1.6" fill="#3A3A20"/></g>`;
const BESUCHER_ART = {
  fuchs: { vb: '0 0 130 80', svg: `
    <path d="M44 46 C30 54 12 52 2 38 C14 40 26 36 38 32 Z" fill="#E8742B"/>
    <path d="M2 38 C6 46 13 49 19 49 C14 45 11 42 9 39 Z" fill="#FFF4E6"/>
    <rect class="bein b" x="42" y="52" width="7" height="22" rx="3.5" fill="#3A2418"/>
    <rect class="bein a" x="52" y="52" width="7" height="22" rx="3.5" fill="#2A1A10"/>
    <rect class="bein a" x="80" y="52" width="7" height="22" rx="3.5" fill="#3A2418"/>
    <rect class="bein b" x="90" y="52" width="7" height="22" rx="3.5" fill="#2A1A10"/>
    <ellipse cx="68" cy="47" rx="31" ry="15" fill="#E8742B"/>
    <path d="M44 40 C56 34 76 33 92 37" stroke="#F49A57" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>
    <ellipse cx="90" cy="53" rx="10" ry="7" fill="#FFF4E6"/>
    <g class="kopf">
      <path d="M92 24 L95 7 L104 21 Z" fill="#E8742B"/><path d="M94 18 L95.5 9 L100 17 Z" fill="#3A2418"/>
      <path d="M101 21 L108 5 L113 22 Z" fill="#D9631F"/>
      <circle cx="102" cy="33" r="14" fill="#E8742B"/>
      <path d="M106 28 L127 39 L106 46 Z" fill="#E8742B"/>
      <path d="M104 39 L126 40.5 L106 47 C100 47 96 44 96 41 Z" fill="#FFF4E6"/>
      <circle cx="126.5" cy="39.5" r="2.8" fill="#2A1A10"/>
      <ellipse cx="108" cy="31" rx="2.2" ry="2.8" fill="#2A1A10"/><circle cx="108.8" cy="30" r=".8" fill="#fff"/>
    </g>` },
  eichhoernchen: { vb: '0 0 100 90', svg: `
    <path d="M46 74 C20 76 4 58 10 36 C14 18 30 6 48 8 C60 10 62 22 52 27 C42 31 32 28 30 40 C28 54 42 62 54 64 Z" fill="#C4612B"/>
    <path d="M20 50 C18 36 26 22 40 16" stroke="#DB7A43" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
    <ellipse class="bein a" cx="54" cy="83" rx="11" ry="4.6" fill="#A9531F"/>
    <ellipse cx="58" cy="62" rx="16" ry="21" fill="#D06A33"/>
    <ellipse cx="64" cy="67" rx="8" ry="13" fill="#F6D9B6"/>
    <ellipse class="bein b" cx="69" cy="84" rx="6" ry="3.6" fill="#A9531F"/>
    <path d="M60 28 L57 10 L70 22 Z" fill="#C4612B"/><path d="M59 13 L57 6 L62 12 Z" fill="#8E3F14"/>
    <circle cx="68" cy="36" r="13" fill="#D06A33"/>
    <ellipse cx="78" cy="41" rx="7" ry="5" fill="#E58A52"/>
    <circle cx="84" cy="39.5" r="2.2" fill="#2A1A10"/>
    <ellipse cx="72" cy="32" rx="2.4" ry="2.9" fill="#2A1A10"/><circle cx="72.9" cy="31" r=".8" fill="#fff"/>
    <ellipse cx="76" cy="55" rx="6" ry="7" fill="#9C6B3E"/><path d="M71 51 C73 47 79 47 81 51 Z" fill="#6B4423"/>
    <ellipse cx="72" cy="56" rx="3.6" ry="3" fill="#D06A33"/>` },
  dachs: { vb: '0 0 124 70', svg: `
    <path d="M24 38 L10 34 L18 44 Z" fill="#8E949C"/>
    <rect class="bein b" x="28" y="48" width="9" height="16" rx="4" fill="#2E2E33"/>
    <rect class="bein a" x="40" y="48" width="9" height="16" rx="4" fill="#3A3A40"/>
    <rect class="bein a" x="76" y="48" width="9" height="16" rx="4" fill="#2E2E33"/>
    <rect class="bein b" x="88" y="48" width="9" height="16" rx="4" fill="#3A3A40"/>
    <ellipse cx="58" cy="41" rx="38" ry="18" fill="#9AA0A8"/>
    <path d="M24 34 C40 22 76 21 92 30 C80 28 40 30 24 38 Z" fill="#7A8088"/>
    <path d="M84 26 C98 23 114 31 121 40 C112 47 98 51 84 49 C78 42 78 31 84 26 Z" fill="#F4F4F2"/>
    <path d="M86 30 C98 29 110 35 118 40 L116 43 C106 40 95 37 85 37 Z" fill="#26262B"/>
    <ellipse cx="88" cy="24" rx="5" ry="4" fill="#9AA0A8"/>
    <circle cx="121" cy="40.5" r="3" fill="#1F1F24"/>
    <circle cx="102" cy="36.5" r="1.7" fill="#fff"/>` },
  schnecke: { vb: '0 0 92 56', svg: `
    <g class="koerper">
      <path d="M10 50 C10 44 30 42 60 42 C70 42 76 40 80 32 C84 24 90 28 88 38 C86 48 74 52 58 52 L14 52 C10 52 10 50 10 50 Z" fill="#C5D394"/>
      <path d="M78 32 L80 14 M84 31 L89 16" stroke="#B3C27E" stroke-width="3" stroke-linecap="round"/>
      <circle cx="80" cy="13" r="3" fill="#3A2A20"/><circle cx="89" cy="15" r="3" fill="#3A2A20"/>
      <path d="M78 42 Q82 44 85 41" stroke="#7E8C4E" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    </g>
    <circle cx="42" cy="30" r="20" fill="#E3963F"/>
    <path d="M42 30 m-14 0 a14 14 0 1 1 28 0 a10 10 0 1 1 -20 0 a6 6 0 1 1 12 0 a3 3 0 1 1 -6 0" stroke="#A85F22" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path d="M28 18 Q34 12 42 11" stroke="#FFD08A" stroke-width="3" fill="none" stroke-linecap="round"/>` },
  igelkind: { vb: '0 0 100 64', svg: IGELCHEN },
  maus: { vb: '0 0 84 46', svg: `
    <path d="M18 34 C8 34 4 26 0 22" stroke="#E8A3A3" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <ellipse class="bein b" cx="28" cy="42" rx="4" ry="2.6" fill="#E8A3A3"/>
    <ellipse class="bein a" cx="46" cy="42" rx="4" ry="2.6" fill="#E8A3A3"/>
    <ellipse cx="38" cy="32" rx="21" ry="12" fill="#A7A2A8"/>
    <ellipse cx="42" cy="36" rx="12" ry="6" fill="#C9C4CA"/>
    <circle cx="58" cy="28" r="10.5" fill="#A7A2A8"/>
    <path d="M62 23 C68 25 74 29 76 32 C72 35 66 36 62 34 Z" fill="#A7A2A8"/>
    <circle cx="53" cy="16" r="8.5" fill="#A7A2A8"/><circle cx="53" cy="16.5" r="5.4" fill="#F2B6BC"/>
    <circle cx="76" cy="31.5" r="2.4" fill="#F28C9A"/>
    <circle cx="63" cy="26" r="2" fill="#2A1A10"/><circle cx="63.6" cy="25.4" r=".7" fill="#fff"/>
    <path d="M72 33 L82 31 M72 34 L82 36" stroke="#6E6970" stroke-width="1" stroke-linecap="round"/>` },
  frosch: { vb: '0 0 72 58', svg: `
    <ellipse cx="22" cy="46" rx="16" ry="9" fill="#5DB84B"/>
    <ellipse cx="11" cy="54" rx="10" ry="3.4" fill="#4EA63A"/>
    <ellipse cx="34" cy="37" rx="22" ry="15" fill="#7ED36B"/>
    <ellipse cx="38" cy="44" rx="13" ry="7" fill="#B8EDA6"/>
    <circle cx="52" cy="29" r="12" fill="#7ED36B"/>
    <circle cx="51" cy="17" r="8" fill="#7ED36B"/><circle cx="52" cy="16" r="5.6" fill="#fff"/><circle cx="53.5" cy="16.5" r="3.2" fill="#2A1A10"/><circle cx="54.4" cy="15.4" r="1" fill="#fff"/>
    <path d="M50 34 Q58 37 63 31" stroke="#2F6B2A" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="48" cy="31" rx="3.6" ry="2.2" fill="#FF9E9E" opacity=".6"/>
    <ellipse cx="52" cy="52" rx="7" ry="3" fill="#5DB84B"/>
    <circle cx="26" cy="32" r="2.6" fill="#5DB84B"/><circle cx="34" cy="27" r="2" fill="#5DB84B"/>` },
  kaefer: { vb: '0 0 92 52', svg: `
    <g stroke="#2A1A10" stroke-width="2.4" stroke-linecap="round" fill="none">
      <path class="bein a" d="M28 38 L22 48"/><path class="bein b" d="M40 40 L38 50"/><path class="bein a" d="M52 39 L56 49"/>
    </g>
    <ellipse cx="40" cy="30" rx="25" ry="14" fill="#6B2F1E"/>
    <path d="M40 17 L40 43" stroke="#4A1E12" stroke-width="2"/>
    <path d="M24 22 Q32 18 38 19" stroke="#A5553B" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
    <ellipse cx="67" cy="29" rx="9" ry="8" fill="#3A1A10"/>
    <path d="M72 24 C78 14 86 12 90 18 C86 18 82 20 80 24 M82 15 L84 9" stroke="#5A2716" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M72 33 C80 36 86 34 90 30 C86 34 82 38 76 38" stroke="#5A2716" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <circle cx="69" cy="26" r="1.6" fill="#fff"/>` },
  maulwurf: { vb: '0 0 84 74', svg: `
    <g class="maulwurf-koerper">
      <ellipse cx="42" cy="38" rx="17" ry="19" fill="#3F3A40"/>
      <path d="M30 26 Q42 18 54 26" stroke="#5A545C" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>
      <ellipse cx="42" cy="48" rx="7" ry="5" fill="#F2A0A6"/><ellipse cx="42" cy="46.6" rx="3.4" ry="2.4" fill="#C9707A"/>
      <circle cx="35" cy="37" r="1.5" fill="#111"/><circle cx="49" cy="37" r="1.5" fill="#111"/>
      <ellipse cx="25" cy="50" rx="8" ry="5.4" fill="#F2A0A6"/><ellipse cx="59" cy="50" rx="8" ry="5.4" fill="#F2A0A6"/>
      <path d="M19 49 l-3 -2 M20 52 l-4 0 M64 47 l3 -2 M65 51 l4 0" stroke="#C9707A" stroke-width="1.8" stroke-linecap="round"/>
    </g>
    <path d="M0 74 C8 52 26 46 42 46 C58 46 76 52 84 74 Z" fill="#7A5235"/>
    <circle cx="20" cy="62" r="3" fill="#5E3E25"/><circle cx="52" cy="58" r="2.4" fill="#5E3E25"/><circle cx="64" cy="66" r="3.4" fill="#8E6444"/><circle cx="34" cy="68" r="2" fill="#8E6444"/>` },
  eule: { vb: '0 0 120 84', svg: `
    <g class="fluegel l"><path d="M44 44 C30 30 12 30 2 38 C12 42 18 48 22 56 C28 50 36 48 44 52 Z" fill="#8C6239"/>
      <path d="M8 40 L14 46 M16 38 L22 46 M26 38 L30 47" stroke="#B58A5B" stroke-width="2.4" stroke-linecap="round"/></g>
    <g class="fluegel r"><path d="M76 44 C90 30 108 30 118 38 C108 42 102 48 98 56 C92 50 84 48 76 52 Z" fill="#8C6239"/>
      <path d="M112 40 L106 46 M104 38 L98 46 M94 38 L90 47" stroke="#B58A5B" stroke-width="2.4" stroke-linecap="round"/></g>
    <ellipse cx="60" cy="50" rx="19" ry="24" fill="#A97845"/>
    <ellipse cx="60" cy="58" rx="12" ry="14" fill="#E8D2AE"/>
    <path d="M54 54 l3 3 3 -3 M60 62 l3 3 3 -3 M52 64 l3 3 3 -3" stroke="#A97845" stroke-width="1.6" fill="none"/>
    <g class="eulenkopf">
      <path d="M45 26 L40 12 L52 22 Z M75 26 L80 12 L68 22 Z" fill="#8C6239"/>
      <circle cx="60" cy="34" r="17" fill="#A97845"/>
      <circle cx="52" cy="33" r="9" fill="#F0DDBA"/><circle cx="68" cy="33" r="9" fill="#F0DDBA"/>
      <circle cx="52" cy="33" r="6" fill="#FFC21F"/><circle cx="68" cy="33" r="6" fill="#FFC21F"/>
      <circle cx="52.6" cy="33.4" r="3.4" fill="#1F1610"/><circle cx="68.6" cy="33.4" r="3.4" fill="#1F1610"/>
      <circle cx="53.6" cy="32" r="1.1" fill="#fff"/><circle cx="69.6" cy="32" r="1.1" fill="#fff"/>
      <path d="M57 40 L63 40 L60 46 Z" fill="#F28C28"/>
    </g>` },
  fledermaus: { vb: '0 0 100 52', svg: `
    <g class="fluegel l"><path d="M46 24 C36 12 18 10 2 18 C8 22 10 28 10 32 C16 28 22 30 24 34 C28 30 34 30 38 34 C40 30 44 28 46 30 Z" fill="#4B3F5E"/></g>
    <g class="fluegel r"><path d="M54 24 C64 12 82 10 98 18 C92 22 90 28 90 32 C84 28 78 30 76 34 C72 30 66 30 62 34 C60 30 56 28 54 30 Z" fill="#4B3F5E"/></g>
    <path d="M42 14 L44 4 L49 12 Z M58 14 L56 4 L51 12 Z" fill="#5D4F72"/>
    <ellipse cx="50" cy="24" rx="9" ry="12" fill="#5D4F72"/>
    <circle cx="46.5" cy="20" r="2" fill="#fff"/><circle cx="53.5" cy="20" r="2" fill="#fff"/>
    <circle cx="46.8" cy="20.4" r="1" fill="#1F1610"/><circle cx="53.8" cy="20.4" r="1" fill="#1F1610"/>
    <path d="M47.6 27 l1 2.4 1 -2.4 M50.4 27 l1 2.4 1 -2.4" stroke="#fff" stroke-width="1" fill="#fff"/>
    <ellipse cx="50" cy="25" rx="3" ry="1.6" fill="#F59EB5" opacity=".7"/>` },
  rotkehlchen: { vb: '0 0 66 46', svg: `
    <path d="M18 24 L2 18 L4 30 Z" fill="#7A5C44"/>
    <ellipse cx="30" cy="26" rx="17" ry="12" fill="#8C6A4F"/>
    <ellipse cx="38" cy="29" rx="10" ry="9" fill="#F27A3A"/>
    <ellipse cx="34" cy="34" rx="9" ry="5" fill="#F4ECE0"/>
    <circle cx="45" cy="19" r="9.5" fill="#8C6A4F"/>
    <path d="M38 21 C40 15 48 13 52 18 C52 24 46 28 40 27 Z" fill="#F27A3A"/>
    <path d="M54 18 L61 19.6 L54 21.6 Z" fill="#3A2A20"/>
    <circle cx="48.5" cy="16.5" r="1.8" fill="#1F1610"/><circle cx="49" cy="16" r=".6" fill="#fff"/>
    <g class="fluegel"><path d="M22 20 C24 6 36 2 42 8 C36 14 30 20 22 24 Z" fill="#6E523C"/></g>` },
  marienkaefer: { vb: '0 0 52 40', svg: `
    <g class="fluegel" opacity=".55"><path d="M22 14 C14 2 4 4 4 12 C10 14 16 16 22 18 Z M26 14 C30 0 42 2 42 10 C36 12 32 14 26 18 Z" fill="#E6F4FF"/></g>
    <g stroke="#1F1610" stroke-width="1.8" stroke-linecap="round"><path d="M16 30 L12 36 M24 32 L24 38 M32 30 L36 36"/></g>
    <path d="M6 26 C6 14 16 10 24 10 C32 10 42 14 42 26 C42 32 32 34 24 34 C16 34 6 32 6 26 Z" fill="#E2483D"/>
    <path d="M24 10 L24 34" stroke="#1F1610" stroke-width="1.8"/>
    <circle cx="15" cy="20" r="3" fill="#1F1610"/><circle cx="33" cy="20" r="3" fill="#1F1610"/><circle cx="13" cy="28" r="2.4" fill="#1F1610"/><circle cx="35" cy="28" r="2.4" fill="#1F1610"/><circle cx="24" cy="26" r="2.2" fill="#1F1610"/>
    <circle cx="44" cy="24" r="6" fill="#1F1610"/><circle cx="46" cy="22" r="1.4" fill="#fff"/>
    <path d="M47 19 L50 13 M45 18 L46 12" stroke="#1F1610" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M12 16 Q16 13 20 13" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>` },
  schmetterling: { vb: '0 0 60 50', svg: `
    <g class="flatter">
      <path d="M29 22 C22 6 6 2 4 12 C2 22 14 26 29 24 Z" fill="#F7E04B"/>
      <path d="M31 22 C38 6 54 2 56 12 C58 22 46 26 31 24 Z" fill="#F7E04B"/>
      <path d="M29 25 C18 26 10 34 14 41 C18 47 26 40 29 28 Z" fill="#EFD232"/>
      <path d="M31 25 C42 26 50 34 46 41 C42 47 34 40 31 28 Z" fill="#EFD232"/>
      <circle cx="15" cy="14" r="2.4" fill="#F28C28"/><circle cx="45" cy="14" r="2.4" fill="#F28C28"/>
    </g>
    <rect x="28" y="14" width="4.4" height="25" rx="2.2" fill="#5A4A2A"/>
    <path d="M29 15 C27 9 24 6 21 5 M31 15 C33 9 36 6 39 5" stroke="#5A4A2A" stroke-width="1.5" fill="none" stroke-linecap="round"/>` },
  gaense: { vb: '0 0 210 100', svg: GANS(178, 50, 0) + GANS(146, 32, 0.15) + GANS(146, 68, 0.3) + GANS(114, 16, 0.45) + GANS(114, 84, 0.6) },
  gluehwuermchen: { vb: '0 0 140 70', svg: GLUEH(20, 30, 0) + GLUEH(44, 16, 0.7) + GLUEH(60, 44, 1.3) + GLUEH(84, 24, 0.4) + GLUEH(100, 52, 1.8) + GLUEH(118, 20, 1.1) + GLUEH(32, 56, 2.2) },
  ufo: { vb: '0 0 120 76', svg: `
    <path class="strahl" d="M40 44 L80 44 L104 76 L16 76 Z" fill="#FFF3A0" opacity="0"/>
    <ellipse cx="60" cy="30" rx="22" ry="17" fill="#9FE7F5" opacity=".8"/>
    <circle cx="60" cy="28" r="7" fill="#7ED36B"/><circle cx="57.6" cy="27" r="1.6" fill="#1F1610"/><circle cx="62.4" cy="27" r="1.6" fill="#1F1610"/>
    <path d="M57 31 Q60 33 63 31" stroke="#1F1610" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    <path d="M60 21 L60 15" stroke="#7ED36B" stroke-width="1.6"/><circle cx="60" cy="14" r="2" fill="#FF6FA5"/>
    <path d="M44 22 Q50 16 58 15" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".7"/>
    <ellipse cx="60" cy="40" rx="52" ry="13" fill="#C9D3DE"/>
    <ellipse cx="60" cy="37" rx="52" ry="8" fill="#E4EAF0"/>
    <g class="lichter"><circle cx="22" cy="42" r="3.2" fill="#FF6FA5"/><circle cx="41" cy="46" r="3.2" fill="#FFD43B"/><circle cx="60" cy="47" r="3.2" fill="#7ED36B"/><circle cx="79" cy="46" r="3.2" fill="#2EC4B6"/><circle cx="98" cy="42" r="3.2" fill="#B48CFF"/></g>` },
  goldkaefer: { vb: '0 0 92 56', svg: `
    <g stroke="#7A5208" stroke-width="2.4" stroke-linecap="round" fill="none">
      <path class="bein a" d="M30 40 L24 50"/><path class="bein b" d="M42 42 L40 52"/><path class="bein a" d="M54 41 L58 51"/>
    </g>
    <ellipse cx="42" cy="32" rx="25" ry="15" fill="url(#gk-gold)"/>
    <path d="M42 18 L42 46" stroke="#C98A0B" stroke-width="1.8"/>
    <path d="M26 24 Q34 19 40 20" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/>
    <ellipse cx="69" cy="31" rx="9" ry="8" fill="#E0A615"/>
    <path d="M76 26 L84 20 M77 34 L85 38" stroke="#C98A0B" stroke-width="2" stroke-linecap="round"/>
    <circle cx="71" cy="28" r="1.6" fill="#fff"/>
    <g class="funkeln" fill="#FFF7C4"><path d="M12 10 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z"/><path d="M80 6 l1.4 3.6 3.6 1.4 -3.6 1.4 -1.4 3.6 -1.4 -3.6 -3.6 -1.4 3.6 -1.4 Z"/><path d="M62 50 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 Z"/></g>` },
  drache: { vb: '0 0 96 136', svg: `
    <path d="M48 70 C40 86 52 96 42 108 C34 118 44 126 36 134" stroke="#7A5C44" stroke-width="1.6" fill="none"/>
    <path d="M44 88 l-6 -4 0 8 Z M44 88 l6 -4 0 8 Z" fill="#FF6FA5"/><path d="M40 112 l-6 -4 0 8 Z M40 112 l6 -4 0 8 Z" fill="#FFD43B"/>
    <g class="drachen-koerper">
      <path d="M48 4 L86 38 L48 70 Z" fill="#2EC4B6"/><path d="M48 4 L10 38 L48 70 Z" fill="#FF8FB8"/>
      <path d="M48 4 L86 38 L48 38 Z" fill="#FFD43B"/><path d="M48 4 L10 38 L48 38 Z" fill="#B48CFF"/>
      <path d="M48 4 L48 70 M10 38 L86 38" stroke="#fff" stroke-width="1.6" opacity=".8"/>
      <circle cx="40" cy="32" r="3" fill="#1F1610"/><circle cx="56" cy="32" r="3" fill="#1F1610"/>
      <path d="M40 44 Q48 51 56 44" stroke="#1F1610" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    </g>` },
};
