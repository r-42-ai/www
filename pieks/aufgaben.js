'use strict';

/* =====================================================================
   AUFGABEN für den Mathe-Igel
   Brüche, Volumen (Hohlmasse) und Dreisätze, je Einfach, Mittel, Schwer.
   Alles wird mit Zufallszahlen erzeugt, es gibt keine Aufgaben-Liste.

   Eine Aufgabe ist ein Objekt:
     topic, level   'brueche' | 'volumen' | 'dreisatz', 'easy' | 'medium' | 'hard'
     text           Aufgabentext (HTML, darf Brüche enthalten) oder ''
     equation       Rechnung (HTML) oder ''
     answerType     'fraction' | 'whole' | 'volume' | 'num'
     correctNum, correctDen      bei 'fraction' (muss gekürzt eingegeben werden)
     correctValue, correctUnit   sonst
     hint           Schlüssel in TIPPS (texte.js): was Pieks als Tipp sagt
     kind           Art der Rechnung, z.B. 'addDiff' (für die Fehler-Diagnose)
     diag           Zahlen der Rechnung, ebenfalls für die Fehler-Diagnose
     steps          Lösungsweg: [{ txt, math }] als HTML, oder fehlt

   Neue Textaufgaben einfach in die passende Liste unten schreiben.
   ===================================================================== */
const Aufgaben = (() => {

const gcd=(a,b)=>b===0?Math.abs(a):gcd(b,a%b);
const lcm=(a,b)=>a/gcd(a,b)*b;
function simplify(n,d){if(d===0)return[n,d];const g=gcd(n,d);return[n/g,d/g]}
function isSimplified(n,d){return gcd(Math.abs(n),Math.abs(d))===1}
function rand(min,max){return Math.floor(Math.random()*(max-min+1))+min}
const pick=a=>a[rand(0,a.length-1)];
const rund=x=>Math.round(x*1000)/1000;
function fracHTML(n,d){return`<span class="fraction"><span class="num">${n}</span><span class="bar"></span><span class="den">${d}</span></span>`}
function mixedHTML(g,n,d){return`<span class="mixed"><span class="whole">${g}</span>${fracHTML(n,d)}</span>`}
function vol(v,u){return`<span class="vol"><span class="vol-val">${v}</span><span class="vol-unit">${u}</span></span>`}
const F=fracHTML, OP=s=>`<span class="op">${s}</span>`;
// Bruch oder ganze Zahl, je nachdem, was nach dem Kürzen übrig bleibt
const FZ=(n,d)=>d===1?String(n):F(n,d);

// Viele Aufgaben sagen «sie» zur Person darin, darum gibt es zwei Listen:
// pickGirl() für Aufgaben mit «sie/ihr», pickName() für alle anderen.
const GIRLS=['Nea','Yuna','Mia','Lea','Anna','Emma','Lina','Sara','Zoe','Lara','Mila','Nina','Elin','Julia','Hanna','Sofia','Ella','Leonie','Alina','Jana'];
const BOYS=['Lukas','Ben','Tim','Noah','Felix','Jonas','Leo','Luca','Elias','Nico','Levin','Samuel','Matteo'];
const NAMES=GIRLS.concat(BOYS);
function pickName(){return pick(NAMES)}
function pickGirl(){return pick(GIRLS)}
function pickTwoNames(){const a=pickName();let b=pickName();while(b===a)b=pickName();return[a,b]}

// Fertige Bruch-Aufgabe. n/d ist das ungekürzte Ergebnis der letzten Zeile
// im Lösungsweg; lässt es sich kürzen, kommt der Kürz-Schritt dazu.
function opBruch(kind,equation,n,d,diag,steps,text){
  const s=steps.slice(),[sn,sd]=simplify(n,d);
  if(sd!==d)s.push({txt:'Kürzen, so weit es geht:',math:`${F(n,d)} = ${FZ(sn,sd)}`});
  return{text:text||'',equation,answerType:'fraction',correctNum:n,correctDen:d,kind,diag,steps:s,hint:kind};
}

// ============ BRÜCHE: Operationen ============
function addSame(lv){const m=lv==='easy'?8:12;const d=rand(3,m),a=rand(1,d-1),b=rand(1,d-a);
  return opBruch('addSame',`${F(a,d)} ${OP('+')} ${F(b,d)} ${OP('=')}`,a+b,d,{op:'+',a,d1:d,b,d2:d},[
    {txt:'Gleiche Nenner: Du zählst nur die Zähler zusammen, der Nenner bleibt.',math:`${F(a,d)} + ${F(b,d)} = ${F(a+b,d)}`}])}
function subSame(lv){const m=lv==='easy'?8:12;const d=rand(3,m),a=rand(2,d-1),b=rand(1,a-1);
  return opBruch('subSame',`${F(a,d)} ${OP('−')} ${F(b,d)} ${OP('=')}`,a-b,d,{op:'−',a,d1:d,b,d2:d},[
    {txt:'Gleiche Nenner: Du rechnest nur mit den Zählern, der Nenner bleibt.',math:`${F(a,d)} − ${F(b,d)} = ${F(a-b,d)}`}])}
function gleichnamig(a,d1,b,d2){const L=lcm(d1,d2);return{L,x:a*L/d1,y:b*L/d2}}
function addDiff(){const d1=rand(2,8);let d2=rand(2,8);while(d2===d1)d2=rand(2,8);const a=rand(1,d1-1),b=rand(1,d2-1);
  const{L,x,y}=gleichnamig(a,d1,b,d2);
  return opBruch('addDiff',`${F(a,d1)} ${OP('+')} ${F(b,d2)} ${OP('=')}`,x+y,L,{op:'+',a,d1,b,d2},[
    {txt:`Mach zuerst die Nenner gleich. Der kleinste gemeinsame Nenner ist ${L}.`,math:`${F(a,d1)} = ${F(x,L)}&emsp;${F(b,d2)} = ${F(y,L)}`},
    {txt:'Jetzt zählst du die Zähler zusammen:',math:`${F(x,L)} + ${F(y,L)} = ${F(x+y,L)}`}])}
function subDiff(){const d1=rand(2,8);let d2=rand(2,8);while(d2===d1)d2=rand(2,8);const a=rand(1,d1-1),b=rand(1,d2-1);if(a*d2<=b*d1)return subDiff();
  const{L,x,y}=gleichnamig(a,d1,b,d2);
  return opBruch('subDiff',`${F(a,d1)} ${OP('−')} ${F(b,d2)} ${OP('=')}`,x-y,L,{op:'−',a,d1,b,d2},[
    {txt:`Mach zuerst die Nenner gleich. Der kleinste gemeinsame Nenner ist ${L}.`,math:`${F(a,d1)} = ${F(x,L)}&emsp;${F(b,d2)} = ${F(y,L)}`},
    {txt:'Jetzt ziehst du die Zähler voneinander ab:',math:`${F(x,L)} − ${F(y,L)} = ${F(x-y,L)}`}])}
function mulFrac(){const d1=rand(2,8),d2=rand(2,8),a=rand(1,d1-1),b=rand(1,d2-1);
  return opBruch('mulFrac',`${F(a,d1)} ${OP('·')} ${F(b,d2)} ${OP('=')}`,a*b,d1*d2,{op:'·',a,d1,b,d2},[
    {txt:'Zähler mal Zähler, Nenner mal Nenner:',math:`${F(a,d1)} · ${F(b,d2)} = ${F(a+' · '+b,d1+' · '+d2)} = ${F(a*b,d1*d2)}`}])}
function divFrac(){const d1=rand(2,8),d2=rand(2,8),a=rand(1,d1-1),b=rand(1,d2-1);
  return opBruch('divFrac',`${F(a,d1)} ${OP(':')} ${F(b,d2)} ${OP('=')}`,a*d2,d1*b,{op:':',a,d1,b,d2},[
    {txt:'Durch einen Bruch teilen heisst: mit seinem Kehrwert malnehmen.',math:`${F(a,d1)} : ${F(b,d2)} = ${F(a,d1)} · ${F(d2,b)}`},
    {txt:'Zähler mal Zähler, Nenner mal Nenner:',math:`${F(a,d1)} · ${F(d2,b)} = ${F(a*d2,d1*b)}`}])}
function mixedAdd(){const g=rand(1,4),d=rand(3,8),a=rand(1,d-1),b=rand(1,d-1);
  return opBruch('mixedAdd',`${mixedHTML(g,a,d)} ${OP('+')} ${F(b,d)} ${OP('=')}`,g*d+a+b,d,{op:'+',g,a,d1:d,b,d2:d},[
    {txt:'Verwandle die gemischte Zahl in einen unechten Bruch:',math:`${mixedHTML(g,a,d)} = ${F(g*d+a,d)}`},
    {txt:'Gleiche Nenner: Zähler zusammenzählen.',math:`${F(g*d+a,d)} + ${F(b,d)} = ${F(g*d+a+b,d)}`}],
    'Berechne und gib das Ergebnis als unechten Bruch an:')}
function mixedSub(){const g=rand(1,3),d=rand(3,8),a=rand(1,d-1),b=rand(1,d-1);
  return opBruch('mixedSub',`${mixedHTML(g,a,d)} ${OP('−')} ${F(b,d)} ${OP('=')}`,g*d+a-b,d,{op:'−',g,a,d1:d,b,d2:d},[
    {txt:'Verwandle die gemischte Zahl in einen unechten Bruch:',math:`${mixedHTML(g,a,d)} = ${F(g*d+a,d)}`},
    {txt:'Gleiche Nenner: Zähler abziehen.',math:`${F(g*d+a,d)} − ${F(b,d)} = ${F(g*d+a-b,d)}`}],
    'Berechne und gib das Ergebnis als unechten Bruch an:')}
function simplifyFrac(){const b=rand(4,9),a=rand(1,b-1),g=gcd(a,b),sa=a/g,sb=b/g,k=rand(2,4);
  const t=opBruch('simplifyFrac',`${F(sa*k,sb*k)} ${OP('=')}`,sa,sb,{k},[
    {txt:`Zähler und Nenner lassen sich beide durch ${k} teilen:`,math:`${F(sa*k,sb*k)} = ${F(sa*k+' : '+k,sb*k+' : '+k)} = ${F(sa,sb)}`}],
    'Kürze den Bruch so weit wie möglich:');
  return t}
function mulFracWhole(){const d=rand(2,9),a=rand(1,d-1),k=rand(2,5);
  return opBruch('mulFracWhole',`${k} ${OP('·')} ${F(a,d)} ${OP('=')}`,k*a,d,{op:'·',k,a,d},[
    {txt:'Nur den Zähler nimmst du mal, der Nenner bleibt:',math:`${k} · ${F(a,d)} = ${F(k+' · '+a,d)} = ${F(k*a,d)}`}])}
function fracOfNumber(lv){const ds=lv==='easy'?[2,3,4]:[2,3,4,5,6,8];const d=pick(ds);const a=lv==='easy'?1:rand(1,d-1);const t=d*rand(2,lv==='hard'?9:6);
  const st=[{txt:`Zuerst ein Teil: ${t} geteilt durch ${d}.`,math:`${t} : ${d} = ${t/d}`}];
  if(a>1)st.push({txt:`Du brauchst ${a} solche Teile:`,math:`${t/d} · ${a} = ${t/d*a}`});
  return{text:'Berechne:',equation:`${F(a,d)} ${OP('von')} ${t} ${OP('=')}`,answerType:'whole',correctValue:(t/d)*a,kind:'fracOfNumber',diag:{a,d,t},steps:st,hint:'fracOfNumber'}}
const fp=(t,n,d)=>({text:t,equation:'',answerType:'fraction',correctNum:n,correctDen:d,kind:'bruchText',hint:'bruchText'});
const wp=(t,v)=>({text:t,equation:'',answerType:'whole',correctValue:v,kind:'bruchMenge',hint:'bruchMenge'});

// ============ BRÜCHE: Textaufgaben ============
const TEMPLATES_EASY=[
()=>{const d=rand(4,12),n=rand(1,d-1);return fp(`Eine Pizza wird in ${d} gleich grosse Stücke geteilt. ${pickName()} isst ${n} Stück${n===1?'':'e'}. Welcher Bruch der Pizza ist gegessen?`,n,d)},
()=>{const d=rand(4,10),n=rand(1,d-1);return fp(`Eine Tafel Schoggi hat ${d} Reihen. ${pickName()} isst ${n} Reihe${n===1?'':'n'}. Welcher Bruch der Tafel ist gegessen?`,n,d)},
()=>{const d=rand(4,8),n=rand(1,d-1);return fp(`Im Garten gibt es ${d} gleich grosse Beete. In ${n} davon wachsen Tomaten. Welcher Bruch der Beete hat Tomaten?`,n,d)},
()=>{const d=rand(8,16),n=rand(2,d-2);return fp(`In ${pickName()}s Klasse sind ${d} Kinder. ${n} davon tragen eine Brille. Welcher Bruch der Kinder trägt eine Brille?`,n,d)},
()=>{const d=rand(4,8),n=rand(1,d-1);return fp(`Eine Banane wird in ${d} Stücke geschnitten. ${pickName()} isst ${n} Stück${n===1?'':'e'}. Welcher Bruch der Banane ist gegessen?`,n,d)},
()=>{const n=rand(1,5);return fp(`Ein Würfel hat 6 mögliche Augenzahlen. Welcher Bruch davon ist ${n} oder kleiner?`,n,6)},
()=>{const d=rand(6,10),n=rand(1,d-1);return fp(`${pickName()} hat eine Schachtel mit ${d} Keksen und isst ${n} davon. Welcher Bruch der Kekse ist gegessen?`,n,d)},
()=>{const d=rand(6,12),n=rand(1,d-1);return fp(`Ein Buch hat ${d} Kapitel. ${pickName()} hat ${n} davon gelesen. Welcher Bruch des Buches ist gelesen?`,n,d)},
()=>{const d=rand(8,12),n=rand(2,d-1);return fp(`Beim Memory mit ${d} Kartenpaaren hat ${pickName()} ${n} Paare gefunden. Welcher Bruch ist gefunden?`,n,d)},
()=>{const d=rand(8,16),n=rand(2,d-2);return fp(`Im Aquarium schwimmen ${d} Fische. ${n} davon ${n===1?'ist':'sind'} rot. Welcher Bruch der Fische ist rot?`,n,d)},
()=>{const n=rand(1,5);return fp(`Eine Woche hat 7 Tage. ${pickName()} hat an ${n} Tag${n===1?'':'en'} Sport gemacht. Welcher Bruch der Woche war Sport?`,n,7)},
()=>{const d=rand(8,12),n=rand(2,d-1);return fp(`${pickName()} hat ${d} Sammelkarten und ${n} davon ${n===1?'ist':'sind'} doppelt. Welcher Bruch der Karten ist doppelt?`,n,d)},
()=>{const n=rand(2,9);return fp(`Ein Eierkarton enthält 12 Eier. ${n} davon ${n===1?'ist':'sind'} gekocht. Welcher Bruch der Eier ist gekocht?`,n,12)},
()=>{const d=rand(8,15),n=rand(2,d-1);return fp(`In ${pickName()}s Mäppchen sind ${d} Stifte. ${n} davon ${n===1?'ist':'sind'} blau. Welcher Bruch der Stifte ist blau?`,n,d)},
()=>{const d=rand(6,9),n=rand(1,d-1);return fp(`Ein Schultag hat ${d} Lektionen. ${n} davon ${n===1?'ist':'sind'} Mathe. Welcher Bruch der Lektionen ist Mathe?`,n,d)},
()=>{const d=rand(8,16),n=rand(2,d-2);return fp(`In einer Tüte sind ${d} Gummibärli. ${n} davon ${n===1?'ist':'sind'} rot. Welcher Bruch ist rot?`,n,d)},
()=>{const d=rand(5,9),n=rand(1,d-1);return fp(`${pickName()} hat ${d} T-Shirts und ${n} davon ${n===1?'ist':'sind'} blau. Welcher Bruch der T-Shirts ist blau?`,n,d)},
()=>{const d=rand(10,16),n=rand(2,d-2);return fp(`Auf einer Wiese sind ${d} Schafe. ${n} davon ${n===1?'ist':'sind'} schwarz. Welcher Bruch der Schafe ist schwarz?`,n,d)},
()=>{const d=rand(6,10),n=rand(1,d-1);return fp(`Im Schwimmbad sind ${d} Bahnen. ${pickGirl()} schwimmt ${n} davon. Welcher Bruch der Bahnen schwimmt sie?`,n,d)},
()=>{const d=rand(6,12),n=rand(1,d-1);return fp(`In einem Korb sind ${d} Äpfel, ${n} davon ${n===1?'ist':'sind'} grün. Welcher Bruch der Äpfel ist grün?`,n,d)},
()=>{const d=rand(5,10),a=rand(1,d-2),b=rand(1,d-a);const[n1,n2]=pickTwoNames();return fp(`${n1} isst ${fracHTML(a,d)} eines Kuchens, dann ${n2} ${fracHTML(b,d)}. Wie viel Kuchen wurde insgesamt gegessen?`,a+b,d)},
()=>{const d=rand(4,8),a=rand(1,d-2),b=rand(1,d-a);return fp(`Am Morgen trinkt ${pickGirl()} ${fracHTML(a,d)} einer Wasserflasche, am Nachmittag noch ${fracHTML(b,d)}. Wie viel hat sie zusammen getrunken?`,a+b,d)},
()=>{const d=rand(5,8),a=rand(1,d-2),b=rand(1,d-a);return fp(`${pickGirl()} isst ${fracHTML(a,d)} einer Tafel Schoggi, ihre Schwester ${fracHTML(b,d)}. Wie viel der Tafel ist insgesamt gegessen?`,a+b,d)},
()=>{const d=rand(5,8),a=rand(1,d-2),b=rand(1,d-a);return fp(`Auf einem Wandertag legt ${pickGirl()} am Vormittag ${fracHTML(a,d)} der Strecke zurück, am Nachmittag ${fracHTML(b,d)}. Welchen Bruch ist sie insgesamt gewandert?`,a+b,d)},
()=>{const d=rand(5,10),a=rand(2,d-1),b=rand(1,a-1);return fp(`Ein Kuchen ist zu ${fracHTML(a,d)} voll. ${pickName()} isst ${fracHTML(b,d)} davon. Wie viel Kuchen ist noch da?`,a-b,d)},
()=>{const d=rand(5,10),a=rand(2,d-1),b=rand(1,a-1);return fp(`Eine Saftflasche ist zu ${fracHTML(a,d)} voll. ${pickName()} trinkt ${fracHTML(b,d)} davon. Wie viel ist noch in der Flasche?`,a-b,d)},
()=>{const d=rand(5,10),n=rand(1,d-1);return fp(`Eine Pizza ist in ${d} Stücke geteilt. ${n} Stück${n===1?'':'e'} sind gegessen. Welcher Bruch der Pizza ist noch übrig?`,d-n,d)},
()=>{const d=rand(5,10),n=rand(1,d-1);return fp(`Ein Schultag hat ${d} Lektionen. ${n} davon ${n===1?'ist':'sind'} vorbei. Welcher Bruch des Schultags ist noch übrig?`,d-n,d)},
()=>{const d=rand(8,12),n=rand(2,d-1);return fp(`Im Karton sind ${d} Eier. ${n} davon ${n===1?'ist':'sind'} schon gebraucht. Welcher Bruch der Eier ist noch da?`,d-n,d)},
()=>{const d=rand(6,10),n=rand(1,d-1);return fp(`${pickName()} hat ${d} Hausaufgaben. ${n} davon ${n===1?'ist':'sind'} noch offen. Welcher Bruch der Aufgaben ist noch offen?`,n,d)},
()=>{const d=rand(8,16),n=rand(2,d-2);return fp(`Auf der Wiese stehen ${d} Blumen. ${n} sind schon gepflückt. Welcher Bruch der Blumen ist noch auf der Wiese?`,d-n,d)},
()=>{const d=rand(6,12),n=rand(1,d-1);return fp(`${pickName()} baut einen Turm aus ${d} Legosteinen. ${n} davon ${n===1?'ist':'sind'} rot. Welcher Bruch der Steine ist rot?`,n,d)},
()=>{const d=rand(6,12),n=rand(1,d-1);return fp(`Mama backt ${d} Muffins. ${n} davon ${n===1?'hat':'haben'} Schoggistückli. Welcher Bruch der Muffins hat Schoggi?`,n,d)},
()=>{const n=rand(1,11);return fp(`Ein Jahr hat 12 Monate. In ${n} Monat${n===1?'':'en'} hat es geschneit. Welcher Bruch des Jahres ist das?`,n,12)},
()=>{const d=rand(6,12),n=rand(1,d-1);return fp(`An einer Kette sind ${d} Perlen. ${n} davon ${n===1?'glitzert':'glitzern'}. Welcher Bruch der Perlen glitzert?`,n,d)},
()=>{const d=rand(8,16),n=rand(2,d-2);return fp(`${pickName()} hat ${d} Fussballkarten. ${n} davon zeigen Torhüter. Welcher Bruch der Karten zeigt Torhüter?`,n,d)},
()=>{const d=rand(6,10),n=rand(1,d-1);return fp(`Auf dem Geburtstagskuchen brennen ${d} Kerzen. ${pickName()} bläst ${n} aus. Welcher Bruch der Kerzen brennt noch?`,d-n,d)},
()=>{const d=rand(6,12),n=rand(1,d-1);return fp(`Im Parkhaus sind ${d} Parkplätze. ${n} davon ${n===1?'ist':'sind'} besetzt. Welcher Bruch der Plätze ist noch frei?`,d-n,d)},
()=>{const d=rand(6,10),n=rand(1,d-1);return fp(`${pickName()} pflanzt ${d} Samen. Aus ${n} davon wächst eine Blume. Welcher Bruch der Samen ist aufgegangen?`,n,d)},
()=>{const d=rand(8,14),n=rand(2,d-2);return fp(`Im Bus hat es ${d} Sitzplätze. ${n} sind besetzt. Welcher Bruch der Plätze ist besetzt?`,n,d)},
()=>{const d=rand(5,9),a=rand(1,d-2),b=rand(1,d-a);return fp(`${pickName()} malt am Montag ${fracHTML(a,d)} eines Bildes und am Dienstag ${fracHTML(b,d)}. Wie viel des Bildes ist fertig?`,a+b,d)},
()=>{const d=rand(5,10),a=rand(2,d-1),b=rand(1,a-1);return fp(`Eine Kerze ist noch ${fracHTML(a,d)} lang. Sie brennt um ${fracHTML(b,d)} ab. Wie lang ist sie jetzt noch?`,a-b,d)},
()=>{const d=rand(6,12),n=rand(1,d-1);return fp(`Ein Zug hat ${d} Wagen. ${n} davon ${n===1?'ist ein Wagen':'sind Wagen'} der 1. Klasse. Welcher Bruch der Wagen ist 1. Klasse?`,n,d)},
()=>{const d=rand(6,12),n=rand(1,d-1);return fp(`In der Bäckerei liegen ${d} Gipfeli im Korb. ${n} davon ${n===1?'ist':'sind'} schon verkauft. Welcher Bruch der Gipfeli ist verkauft?`,n,d)},
()=>{const d=rand(6,14),n=rand(2,d-2);return fp(`Im Zoo leben ${d} Pinguine. ${n} davon schwimmen gerade im Wasser. Welcher Bruch der Pinguine schwimmt?`,n,d)},
()=>{const d=rand(6,10),n=rand(1,d-1);return fp(`Am Sporttag gibt es ${d} Posten. ${pickName()} hat ${n} Posten geschafft. Welcher Bruch der Posten fehlt noch?`,d-n,d)},
()=>{const d=rand(5,9),n=rand(1,d-1);return fp(`${pickName()} leiht in der Bibliothek ${d} Bücher aus und bringt ${n} davon zurück. Welcher Bruch der Bücher ist noch ausgeliehen?`,d-n,d)},
()=>{const d=rand(6,12),n=rand(1,d-1);return fp(`Im Zeltlager sollen ${d} Zelte aufgestellt werden. ${n} ${n===1?'Zelt steht':'Zelte stehen'} schon. Welcher Bruch der Zelte steht schon?`,n,d)},
()=>{const d=rand(8,16),n=rand(2,d-2);return fp(`Auf dem Bauernhof erntet ${pickName()} ${d} Rüebli. ${n} davon bekommen die Kaninchen. Welcher Bruch der Rüebli ist für die Kaninchen?`,n,d)},
()=>{const d=rand(10,16),n=rand(2,d-2);return fp(`Auf der Schulreise sind ${d} Kinder. ${n} davon ${n===1?'hat':'haben'} eine Regenjacke dabei. Welcher Bruch der Kinder hat eine Regenjacke?`,n,d)},
()=>{const d=rand(4,8),n=rand(1,d-1);return fp(`In der Musikstunde übt ${pickName()} ein Lied mit ${d} Strophen. ${n} davon ${n===1?'klappt':'klappen'} schon. Welcher Bruch der Strophen muss noch geübt werden?`,d-n,d)},
()=>{const d=rand(8,16),n=rand(2,d-2);return fp(`Ein Brettspiel hat einen Weg mit ${d} Feldern. ${pickName()}s Figur ist schon ${n} Felder weit gekommen. Welcher Bruch des Weges ist geschafft?`,n,d)},
()=>{const d=rand(6,12),n=rand(2,d-2);return fp(`Im Zirkus treten ${d} Tiere auf. ${n} davon ${n===1?'ist':'sind'} Ponys. Welcher Bruch der Tiere ist das?`,n,d)},
()=>{const d=rand(6,10),n=rand(1,d-1);return fp(`Eine Piraten-Schatzkarte ist in ${d} Teile zerrissen. ${pickName()} hat ${n} Teil${n===1?'':'e'} gefunden. Welcher Bruch der Karte fehlt noch?`,d-n,d)},
()=>{const d=rand(4,9),n=rand(1,d-1);return fp(`Eine Ritterburg hat ${d} Türme. Auf ${n} ${n===1?'Turm weht eine Fahne':'Türmen wehen Fahnen'}. Welcher Bruch der Türme hat eine Fahne?`,n,d)},
()=>{const d=rand(5,10),a=rand(2,d-1),b=rand(1,a-1);return fp(`Der Tank einer Rakete ist zu ${fracHTML(a,d)} voll. Beim Start werden ${fracHTML(b,d)} verbraucht. Welcher Bruch des Tanks ist noch voll?`,a-b,d)},
()=>{const d=rand(5,10),a=rand(1,d-2),b=rand(1,d-a);return fp(`Auf dem Markt kauft ${pickName()} ${fracHTML(a,d)} kg Zwetschgen und ${fracHTML(b,d)} kg Trauben. Wie viel kg Früchte sind das zusammen?`,a+b,d)},
()=>{const d=rand(5,9),a=rand(1,d-2),b=rand(1,d-a);return fp(`Für das Theaterstück lernt ${pickName()} am Montag ${fracHTML(a,d)} des Textes und am Dienstag ${fracHTML(b,d)}. Welcher Bruch des Textes ist jetzt gelernt?`,a+b,d)},
()=>{const d=rand(5,10),a=rand(2,d-1),b=rand(1,a-1);return fp(`Ein Vogel-Futterhäuschen ist zu ${fracHTML(a,d)} mit Körnern gefüllt. Die Vögel fressen ${fracHTML(b,d)}. Welcher Bruch des Häuschens ist jetzt noch gefüllt?`,a-b,d)},
];
const TEMPLATES_MEDIUM=[
()=>{const ds=[2,3,4,5,6];const d=ds[rand(0,4)];const t=d*rand(2,6);return wp(`${pickName()} hat ${t} Bonbons und gibt ${fracHTML(1,d)} davon an Yuna. Wie viele Bonbons bekommt Yuna?`,t/d)},
()=>{const ds=[2,3,4,5];const d=ds[rand(0,3)];const t=d*rand(2,5);const a=rand(1,d-1);return wp(`Ein Pizzaservice liefert ${t} Pizzen. ${fracHTML(a,d)} sind Margherita. Wie viele Margherita-Pizzen sind das?`,(t/d)*a)},
()=>{const ds=[2,3,4,5,6];const d=ds[rand(0,4)];const t=d*rand(3,7);return wp(`In einer Klasse sind ${t} Kinder. ${fracHTML(1,d)} davon spielen Tennis. Wie viele Kinder sind das?`,t/d)},
()=>{const ds=[3,4,5,6];const d=ds[rand(0,3)];const t=d*rand(2,5);const a=rand(1,d-1);return wp(`In einer Klasse sind ${t} Kinder. ${fracHTML(a,d)} davon spielen Fussball. Wie viele Kinder spielen Fussball?`,(t/d)*a)},
()=>{const ds=[2,3,4,5];const d=ds[rand(0,3)];const t=d*rand(3,7);return wp(`${pickGirl()} hat ${t} Bücher und schenkt ${fracHTML(1,d)} davon weg. Wie viele Bücher schenkt sie weg?`,t/d)},
()=>{const ds=[2,3,4];const d=ds[rand(0,2)];const t=d*rand(2,5);return wp(`Eine Schultüte enthält ${t} Bonbons. ${pickGirl()} isst ${fracHTML(1,d)} davon. Wie viele Bonbons hat sie gegessen?`,t/d)},
()=>{const ds=[2,3,4,6];const d=ds[rand(0,3)];const t=d*rand(2,5);return wp(`Ein Beutel hat ${t} Murmeln. ${fracHTML(1,d)} sind blau. Wie viele Murmeln sind blau?`,t/d)},
()=>{const ds=[2,3,4,6,8];const d=ds[rand(0,4)];return wp(`Ein Tag hat 24 Stunden. ${fracHTML(1,d)} davon schläft ${pickGirl()}. Wie viele Stunden schläft sie?`,24/d)},
()=>{const ds=[2,3,4,5,6];const d=ds[rand(0,4)];return wp(`Eine Stunde hat 60 Minuten. ${fracHTML(1,d)} der Stunde ist Pause. Wie viele Minuten Pause sind das?`,60/d)},
()=>{const ds=[2,3,4,6];const d=ds[rand(0,3)];const t=d*rand(3,5);const a=rand(1,d-1);return wp(`Auf einer Geburtstagsparty sind ${t} Kinder. ${fracHTML(a,d)} davon haben blonde Haare. Wie viele sind das?`,(t/d)*a)},
()=>{const ds=[2,4,5];const d=ds[rand(0,2)];const t=d*rand(2,5);return wp(`${pickGirl()} hat ${t} Franken Sackgeld. Sie gibt ${fracHTML(1,d)} davon für Süssigkeiten aus. Wie viele Franken gibt sie aus?`,t/d)},
()=>{let d1=rand(3,6),d2=rand(3,6);if(d1===d2)d2++;const a=rand(1,d1-1),b=rand(1,d2-1);return fp(`${pickGirl()} trinkt ${fracHTML(a,d1)} Liter Wasser am Morgen und ${fracHTML(b,d2)} Liter am Mittag. Wie viel Wasser hat sie zusammen getrunken?`,a*d2+b*d1,d1*d2)},
()=>{let d1=rand(3,6),d2=rand(3,6);if(d1===d2)d2++;const a=rand(1,d1-1),b=rand(1,d2-1);return fp(`Vom Kuchen isst ${pickName()} ${fracHTML(a,d1)}, dann Yuna noch ${fracHTML(b,d2)}. Wie viel Kuchen wurde gegessen?`,a*d2+b*d1,d1*d2)},
()=>{let d1=rand(3,6),d2=rand(3,6);if(d1===d2)d2++;const a=rand(1,d1-1),b=rand(1,d2-1);return fp(`Auf einer Wanderung läuft ${pickGirl()} am Vormittag ${fracHTML(a,d1)} der Strecke und am Nachmittag ${fracHTML(b,d2)}. Welchen Bruch ist sie zusammen gelaufen?`,a*d2+b*d1,d1*d2)},
()=>{let d1=rand(3,6),d2=rand(3,6);if(d1===d2)d2++;const a=rand(1,d1-1),b=rand(1,d2-1);return fp(`Im ersten Glas sind ${fracHTML(a,d1)} Liter Saft, im zweiten ${fracHTML(b,d2)} Liter. Wie viel Saft ist insgesamt da?`,a*d2+b*d1,d1*d2)},
()=>{let d1=rand(3,6),d2=rand(3,6);if(d1===d2)d2++;const a=rand(1,d1-1),b=rand(1,d2-1);return fp(`${pickGirl()} liest ${fracHTML(a,d1)} eines Buches und ihre Schwester ${fracHTML(b,d2)}. Wie viel des Buches haben sie zusammen gelesen?`,a*d2+b*d1,d1*d2)},
()=>{let d1=rand(3,6),d2=rand(3,6);if(d1===d2)d2++;let a=rand(1,d1-1),b=rand(1,d2-1);if(a*d2===b*d1)b=b>1?b-1:b+1;if(a*d2<b*d1){[a,b,d1,d2]=[b,a,d2,d1]}return fp(`Ein Rezept braucht ${fracHTML(a,d1)} Liter Milch. Du hast nur ${fracHTML(b,d2)} Liter. Wie viel Milch fehlt dir noch?`,a*d2-b*d1,d1*d2)},
()=>{let d1=rand(3,6),d2=rand(3,6);if(d1===d2)d2++;let a=rand(1,d1-1),b=rand(1,d2-1);if(a*d2===b*d1)b=b>1?b-1:b+1;if(a*d2<b*d1){[a,b,d1,d2]=[b,a,d2,d1]}return fp(`Eine Wasserflasche enthält ${fracHTML(a,d1)} Liter. ${pickName()} trinkt ${fracHTML(b,d2)} Liter. Wie viel ist noch in der Flasche?`,a*d2-b*d1,d1*d2)},
()=>{let d1=rand(3,6),d2=rand(3,6);if(d1===d2)d2++;let a=rand(1,d1-1),b=rand(1,d2-1);if(a*d2===b*d1)b=b>1?b-1:b+1;if(a*d2<b*d1){[a,b,d1,d2]=[b,a,d2,d1]}return fp(`${pickGirl()}s Sparschwein ist zu ${fracHTML(a,d1)} voll. Sie nimmt ${fracHTML(b,d2)} raus für ein Geschenk. Welcher Bruch ist noch im Sparschwein?`,a*d2-b*d1,d1*d2)},
()=>{const d=rand(4,8),a=rand(1,d-1);return fp(`${pickGirl()} läuft eine Strecke. Nach ${fracHTML(a,d)} macht sie eine Pause. Welcher Bruch der Strecke muss sie noch laufen?`,d-a,d)},
()=>{const d=rand(4,8),a=rand(1,d-1);return fp(`Yuna ist ${fracHTML(a,d)} mit ihrem Buch durch. Welcher Bruch fehlt ihr noch?`,d-a,d)},
()=>{const d=rand(5,8),a=rand(1,d-1);return fp(`Eine Velotour ist ${fracHTML(a,d)} geschafft. Welcher Bruch ist noch zu fahren?`,d-a,d)},
()=>{const d=rand(4,8),a=rand(1,d-1);return fp(`${pickGirl()} hat ein Puzzle. Sie hat ${fracHTML(a,d)} schon gelegt. Welcher Bruch fehlt noch?`,d-a,d)},
()=>{const d=rand(4,8),a=rand(1,d-1);return fp(`Ein Rezept braucht ${fracHTML(a,d)} Liter Milch. Du machst die doppelte Menge. Wie viel Milch brauchst du?`,2*a,d)},
()=>{const d=rand(4,8),a=2*rand(1,Math.floor((d-1)/2)||1);return fp(`Ein Rezept braucht ${fracHTML(a,d)} Liter Saft. Du machst die halbe Menge. Wie viel Saft brauchst du?`,a/2,d)},
()=>{const ds=[2,3,4,5,6];const d=ds[rand(0,4)];const t=d*rand(2,6);return wp(`Im Kino hat es ${t} Plätze. ${fracHTML(1,d)} davon sind noch frei. Wie viele Plätze sind frei?`,t/d)},
()=>{const ds=[2,3,4,5];const d=ds[rand(0,3)];const t=d*rand(2,6);const a=rand(1,d-1);return wp(`${pickName()} hat ${t} Fotos gemacht. ${fracHTML(a,d)} davon sind verwackelt. Wie viele Fotos sind verwackelt?`,(t/d)*a)},
()=>{const ds=[2,3,4,6];const d=ds[rand(0,3)];const t=d*rand(2,5);return wp(`Im Obstkorb liegen ${t} Früchte. ${fracHTML(1,d)} davon sind Bananen. Wie viele Bananen sind es?`,t/d)},
()=>{const ds=[2,3,4,5];const d=ds[rand(0,3)];const t=d*rand(3,6);const a=rand(1,d-1);return wp(`Ein Zug hat ${t} Sitzplätze. ${fracHTML(a,d)} davon sind reserviert. Wie viele Plätze sind reserviert?`,(t/d)*a)},
()=>{let d1=rand(3,6),d2=rand(3,6);if(d1===d2)d2++;const a=rand(1,d1-1),b=rand(1,d2-1);return fp(`${pickGirl()} übt ${fracHTML(a,d1)} Stunden Klavier und ${fracHTML(b,d2)} Stunden Gitarre. Wie lange übt sie insgesamt?`,a*d2+b*d1,d1*d2)},
()=>{const d=rand(4,9),a=rand(1,d-1);return fp(`Ein Film ist zu ${fracHTML(a,d)} vorbei. Welcher Bruch des Films kommt noch?`,d-a,d)},
()=>{const d=rand(5,8),a=rand(1,Math.floor((d-1)/2)||1);return fp(`${pickGirl()} giesst ${fracHTML(a,d)} Liter Wasser in eine Vase und gleich viel in eine zweite. Wie viel Wasser hat sie gebraucht?`,2*a,d)},
()=>{const ds=[2,4,5,10];const d=ds[rand(0,3)];const t=d*rand(2,6);return wp(`Auf dem Flohmarkt verkauft ${pickGirl()} ${fracHTML(1,d)} ihrer ${t} Bücher. Wie viele Bücher verkauft sie?`,t/d)},
()=>{const ds=[2,3,4,6];const d=ds[rand(0,3)];const t=d*rand(2,5);return wp(`Die Bäckerei backt am Morgen ${t} Gipfeli. ${fracHTML(1,d)} davon sind schon verkauft. Wie viele Gipfeli sind verkauft?`,t/d)},
()=>{const ds=[3,4,5,6];const d=ds[rand(0,3)];const t=d*rand(2,5);const a=rand(1,d-1);return wp(`Im Zoo leben ${t} Affen. ${fracHTML(a,d)} davon sind Jungtiere. Wie viele Jungtiere sind das?`,(t/d)*a)},
()=>{const ds=[2,3,4,5];const d=ds[rand(0,3)];const t=d*rand(3,6);return wp(`Am Sporttag machen ${t} Kinder mit. ${fracHTML(1,d)} davon starten beim Sackhüpfen. Wie viele Kinder starten beim Sackhüpfen?`,t/d)},
()=>{const ds=[3,4,5,6];const d=ds[rand(0,3)];const t=d*rand(2,6);const a=rand(1,d-1);return wp(`In der Bibliothek stehen ${t} Bücher auf dem Rückgabewagen. ${fracHTML(a,d)} davon sind Comics. Wie viele Comics sind das?`,(t/d)*a)},
()=>{const ds=[2,3,4,6];const d=ds[rand(0,3)];const t=d*rand(2,5);return wp(`Im Zeltlager sind ${t} Kinder. ${fracHTML(1,d)} davon schlafen im blauen Zelt. Wie viele Kinder schlafen im blauen Zelt?`,t/d)},
()=>{const ds=[2,3,4,5];const d=ds[rand(0,3)];const t=d*rand(3,6);const a=rand(1,d-1);return wp(`Auf dem Bauernhof erntet ${pickName()} ${t} Rüebli. ${fracHTML(a,d)} davon bekommen die Hasen. Wie viele Rüebli bekommen die Hasen?`,(t/d)*a)},
()=>{const ds=[2,3,4,6];const d=ds[rand(0,3)];const t=d*rand(2,6);const a=rand(1,d-1);return wp(`Im Zirkus verteilt der Clown ${t} Ballone. ${fracHTML(a,d)} davon sind rot. Wie viele Ballone sind rot?`,(t/d)*a)},
()=>{const ds=[3,4,5,6];const d=ds[rand(0,3)];const t=d*rand(2,6);const a=rand(1,d-1);return wp(`Die Piraten finden ${t} Goldmünzen. ${fracHTML(a,d)} davon bekommt der Kapitän. Wie viele Goldmünzen bekommt der Kapitän?`,(t/d)*a)},
()=>{let d1=rand(3,6),d2=rand(3,6);if(d1===d2)d2++;const a=rand(1,d1-1),b=rand(1,d2-1);return fp(`Auf dem Markt kauft ${pickName()} ${fracHTML(a,d1)} kg Trauben und ${fracHTML(b,d2)} kg Erdbeeren. Wie viel kg Früchte sind das zusammen?`,a*d2+b*d1,d1*d2)},
()=>{let d1=rand(3,6),d2=rand(3,6);if(d1===d2)d2++;const a=rand(1,d1-1),b=rand(1,d2-1);return fp(`Im Hallenbad schwimmt ${pickName()} ${fracHTML(a,d1)} Stunden am Morgen und ${fracHTML(b,d2)} Stunden am Nachmittag. Wie viel Stunden sind das zusammen?`,a*d2+b*d1,d1*d2)},
()=>{let d1=rand(3,6),d2=rand(3,6);if(d1===d2)d2++;let a=rand(1,d1-1),b=rand(1,d2-1);while(a*d2<=b*d1){a=rand(1,d1-1);b=rand(1,d2-1)}return fp(`Ein Lieferwagen soll ${fracHTML(a,d1)} Tonnen Sand laden. Aufgeladen sind erst ${fracHTML(b,d2)} Tonnen. Wie viel Tonnen fehlen noch?`,a*d2-b*d1,d1*d2)},
()=>{let d1=rand(3,6),d2=rand(3,6);if(d1===d2)d2++;let a=rand(1,d1-1),b=rand(1,d2-1);while(a*d2<=b*d1){a=rand(1,d1-1);b=rand(1,d2-1)}return fp(`Ein Schneehaufen ist ${fracHTML(a,d1)} Meter hoch. Am Nachmittag schmilzt er um ${fracHTML(b,d2)} Meter. Wie viel Meter hoch ist der Schneehaufen noch?`,a*d2-b*d1,d1*d2)},
()=>{const d=rand(4,8),a=rand(1,d-1);return fp(`Auf der Ritterburg ist ${fracHTML(a,d)} der Burgmauer frisch gestrichen. Welcher Bruch der Mauer ist noch nicht gestrichen?`,d-a,d)},
()=>{const d=rand(4,8),a=rand(1,d-1);return fp(`Beim Brettspiel hat ${pickName()} schon ${fracHTML(a,d)} der Felder bis zum Ziel geschafft. Welcher Bruch der Felder fehlt noch bis zum Ziel?`,d-a,d)},
()=>{const d=rand(4,8),a=rand(1,d-1);return fp(`Für einen Zaubertrank braucht die Hexe ${fracHTML(a,d)} Liter Beerensaft. Wie viel Liter Beerensaft braucht die Hexe für zwei Zaubertränke?`,2*a,d)},
()=>{const d=rand(4,8),a=2*rand(1,Math.floor((d-1)/2));return fp(`In der Flasche sind ${fracHTML(a,d)} Liter Eistee. ${pickName()} giesst die Hälfte davon in ein Glas. Wie viel Liter Eistee sind im Glas?`,a/2,d)},
];
const TEMPLATES_HARD=[
()=>{let d1=rand(3,6),d2=rand(3,6);if(d1===d2)d2++;let a=rand(1,d1-1),b=rand(1,d2-1);if(a*d2+b*d1>=d1*d2)return TEMPLATES_HARD[0]();return fp(`${pickName()} isst ${fracHTML(a,d1)} einer Tafel Schoggi. Yuna isst dann ${fracHTML(b,d2)} der Tafel. Wie viel ist noch übrig?`,d1*d2-a*d2-b*d1,d1*d2)},
()=>{let d1=rand(3,6),d2=rand(3,6);if(d1===d2)d2++;let a=rand(1,d1-1),b=rand(1,d2-1);if(a*d2+b*d1>=d1*d2)return TEMPLATES_HARD[1]();return fp(`Von einer Pizza essen ${pickName()} und Yuna ${fracHTML(a,d1)} bzw. ${fracHTML(b,d2)}. Wie viel der Pizza ist noch da?`,d1*d2-a*d2-b*d1,d1*d2)},
()=>{const ds=[4,5,8,10];const d=ds[rand(0,3)];const t=d*rand(3,5);const a=rand(2,d-1);return wp(`In einer Schulklasse sind ${t} Kinder. ${fracHTML(a,d)} davon spielen Fussball. Wie viele Kinder spielen Fussball?`,(t/d)*a)},
()=>{const ds=[4,5,6,8];const d=ds[rand(0,3)];const t=d*rand(3,5);const a=rand(2,d-1);return wp(`Ein Verein hat ${t} Mitglieder. ${fracHTML(a,d)} davon sind Frauen. Wie viele Frauen sind im Verein?`,(t/d)*a)},
()=>{const ds=[3,4,5,6];const d=ds[rand(0,3)];const t=d*rand(3,6);const a=rand(2,d-1);return wp(`${pickGirl()} hat ${t} Franken Sackgeld. Sie spart ${fracHTML(a,d)} davon. Wie viele Franken spart sie?`,(t/d)*a)},
()=>{const ds=[3,4,5,6];const d=ds[rand(0,3)];const t=d*rand(3,5);const a=rand(2,d-1);return wp(`Ein Marathon ist ${t} km lang. ${pickGirl()} hat ${fracHTML(a,d)} davon geschafft. Wie viele Kilometer ist sie gelaufen?`,(t/d)*a)},
()=>{const ds=[3,4,5,6];const d=ds[rand(0,3)];const t=d*rand(3,5);const a=rand(2,d-1);return wp(`Eine Bibliothek hat ${t} Bücher. ${fracHTML(a,d)} davon sind Kinderbücher. Wie viele Kinderbücher sind das?`,(t/d)*a)},
()=>{let d1=rand(3,6),d2=rand(3,6);if(d1===d2)d2++;const a=rand(1,d1-1),b=rand(1,d2-1);return fp(`Ein Smoothie braucht ${fracHTML(a,d1)} Liter Saft und ${fracHTML(b,d2)} Liter Milch. Wie viel Flüssigkeit ist das insgesamt?`,a*d2+b*d1,d1*d2)},
()=>{const d=rand(5,10),a=rand(2,d-1);return wp(`Ein Kuchen ist in ${d} gleiche Stücke geteilt. ${pickName()} hat ${fracHTML(a,d)} schon gegessen. Wie viele einzelne Stücke wurden gegessen?`,a)},
()=>{const d=rand(6,12),a=rand(2,d-1);return wp(`Eine Pizza hat ${d} Stücke. ${pickName()} und Yuna haben zusammen ${fracHTML(a,d)} der Pizza gegessen. Wie viele Stücke?`,a)},
()=>{const d=rand(5,8),a=rand(1,Math.floor((d-1)/2));return fp(`${pickName()} isst ${fracHTML(a,d)} eines Kuchens, Yuna isst doppelt so viel. Welcher Bruch isst Yuna?`,2*a,d)},
()=>{const d=rand(5,8),a=2*rand(1,Math.floor((d-1)/2)||1);return fp(`${pickName()} isst ${fracHTML(a,d)} eines Kuchens. Yuna isst halb so viel. Welcher Bruch isst Yuna?`,a/2,d)},
()=>{const d=rand(5,8),a=rand(1,Math.floor((d-1)/3)||1);return fp(`${pickName()} läuft ${fracHTML(a,d)} der Strecke. Lukas läuft drei Mal so viel. Welcher Bruch ist das?`,3*a,d)},
()=>{const a=[3,4,6,8][rand(0,3)];return wp(`Ein Tag hat 24 Stunden. ${pickGirl()} schläft ${fracHTML(1,a)} des Tages. Wie viele Stunden ist sie wach?`,24-24/a)},
()=>{const d=[3,4,6][rand(0,2)];const t=d*rand(3,5);return wp(`In einer Klasse sind ${t} Kinder. ${fracHTML(1,d)} sind krank. Wie viele Kinder sind gesund?`,t-t/d)},
()=>{const d1=rand(3,5),d2=rand(3,5);const a=rand(1,d1-1),b=rand(1,d2-1);return fp(`${pickGirl()} hat ${fracHTML(a,d1)} eines Kuchens. Sie isst ${fracHTML(b,d2)} davon. Welchen Bruch des ganzen Kuchens hat sie gegessen?`,a*b,d1*d2)},
()=>{const ds=[4,6,8,10];const d=ds[rand(0,3)];const t=d*rand(2,5);const a=rand(2,d-1);return wp(`Ein Schwimmbecken fasst ${t} hl Wasser. Es ist zu ${fracHTML(a,d)} gefüllt. Wie viele hl Wasser sind im Becken?`,(t/d)*a)},
()=>{const d=[4,5,6,8][rand(0,3)];const t=d*rand(3,6);const a=rand(2,d-1);return wp(`Von ${t} Schülern haben ${fracHTML(a,d)} das Turnzeug dabei. Wie viele Schüler sind das?`,(t/d)*a)},
()=>{let d1=rand(3,6),d2=rand(3,6);if(d1===d2)d2++;let a=rand(1,d1-1),b=rand(1,d2-1);if(a*d2+b*d1>=d1*d2){a=1;b=1}return fp(`${pickName()} verbringt ${fracHTML(a,d1)} des Tages in der Schule und ${fracHTML(b,d2)} mit Schlafen. Welcher Bruch des Tages bleibt übrig?`,d1*d2-a*d2-b*d1,d1*d2)},
()=>{const d=rand(4,6),a=rand(1,d-1),k=rand(2,4);return fp(`Ein Rezept braucht ${fracHTML(a,d)} Liter Rahm. ${pickGirl()} kocht die ${k===2?'doppelte':k===3?'dreifache':'vierfache'} Menge. Wie viel Rahm braucht sie?`,k*a,d)},
()=>{const d1=rand(2,4),d2=rand(2,4);const a=rand(1,d1-1),b=rand(1,d2-1);return fp(`${pickGirl()} hat ${fracHTML(a,d1)} einer Pizza übrig und gibt ${fracHTML(b,d2)} davon ihrem Bruder. Welchen Bruch der ganzen Pizza bekommt der Bruder?`,a*b,d1*d2)},
()=>{const t=[12,18,24,30][rand(0,3)];return wp(`${pickGirl()} hat ${t} Franken. Sie gibt ${fracHTML(1,3)} für ein Buch und ${fracHTML(1,6)} für Glace aus. Wie viele Franken bleiben ihr?`,t-t/3-t/6)},
()=>{const d=rand(5,9),a=rand(2,d-1),b=rand(1,a-1);return fp(`Ein Wassertank ist zu ${fracHTML(a,d)} gefüllt. Nach dem Giessen sind noch ${fracHTML(b,d)} drin. Welcher Bruch wurde verbraucht?`,a-b,d)},
()=>{const d=[3,4,6][rand(0,2)],t=d*rand(4,8);return wp(`In der Bäckerei liegen am Morgen ${t} Gipfeli. Bis zum Mittag wird ${fracHTML(1,d)} davon verkauft, am Nachmittag werden noch einmal gleich viele Gipfeli verkauft. Wie viele Gipfeli sind am Abend übrig?`,t-2*(t/d))},
()=>{const t=12*rand(2,5);return wp(`Im Zoo leben ${t} Papageien. ${fracHTML(1,3)} davon sitzen im Baum, ${fracHTML(1,4)} baden im Wasser. Der Rest frisst Körner. Wie viele Papageien fressen Körner?`,t-t/3-t/4)},
()=>{let d1=rand(3,6),d2=rand(3,6);if(d1===d2)d2=d1===6?5:d1+1;return fp(`Am Sporttag macht ${fracHTML(1,d1)} der Kinder beim Sprint mit und ${fracHTML(1,d2)} beim Weitsprung. Der Rest spielt Völkerball. Welcher Bruch der Kinder spielt Völkerball?`,d1*d2-d1-d2,d1*d2)},
()=>{const t=4*rand(4,12);return wp(`Im Zeltlager sind ${t} Würstli im Vorrat. Am ersten Abend wird ${fracHTML(1,4)} des Vorrats gebraten, am zweiten Abend ${fracHTML(1,2)} des Vorrats. Wie viele Würstli bleiben übrig?`,t-t/4-t/2)},
()=>{const d=[4,5,6][rand(0,2)],a=rand(2,d-1),t=d*rand(3,6);return wp(`Auf dem Bauernhof erntet ${pickName()} ${t} Rüebli. ${fracHTML(a,d)} davon bekommen die Hasen. Wie viele Rüebli bleiben für die Küche?`,t-(t/d)*a)},
()=>{const d=[4,5,6][rand(0,2)],a=rand(1,d-2),t=d*rand(2,5);return wp(`Die Schulreise ist ${t} km lang. Bis zur Mittagsrast schafft die Klasse ${fracHTML(a,d)} der Strecke. Wie viele Kilometer fehlen noch bis zum Ziel?`,t-(t/d)*a)},
()=>{const d=[3,4,6][rand(0,2)];return wp(`Die Musikstunde dauert 60 Minuten. ${fracHTML(1,2)} der Zeit übt die Klasse Flöte, ${fracHTML(1,d)} der Zeit wird gesungen. Wie viele Minuten bleiben für Rhythmusspiele?`,60-30-60/d)},
()=>{const d1=rand(2,4),d2=rand(2,4);return fp(`In einem Brettspiel sind ${fracHTML(1,d1)} aller Karten Ereigniskarten. ${fracHTML(1,d2)} der Ereigniskarten glitzert golden. Welcher Bruch aller Karten glitzert golden?`,1,d1*d2)},
()=>{const d=rand(6,10),a=rand(2,d-3),b=rand(1,d-a-1);return fp(`Eine Rakete fliegt zum Mond. Am ersten Tag schafft sie ${fracHTML(a,d)} des Weges, am zweiten Tag ${fracHTML(b,d)}. Welcher Bruch des Weges fehlt noch?`,d-a-b,d)},
()=>{const d=[3,4,6][rand(0,2)],t=2*d*rand(2,5);return wp(`Eine Piratenbande findet eine Truhe mit ${t} Goldmünzen. ${fracHTML(1,d)} der Münzen bekommt der Kapitän, die Hälfte des Restes wird auf der Insel vergraben. Wie viele Münzen bleiben in der Truhe?`,(t-t/d)/2)},
()=>{let d1=rand(3,6),d2=rand(3,6);if(d1===d2)d2=d1===6?5:d1+1;const a=rand(1,d1-1),b=rand(1,d2-1);return fp(`Beim Fest auf der Ritterburg trinkt ein Ritter ${fracHTML(a,d1)} Liter Most und ein Knappe ${fracHTML(b,d2)} Liter. Wie viel Most trinken die beiden zusammen?`,a*d2+b*d1,d1*d2)},
()=>{const d=[2,3][rand(0,1)],t=2*d*rand(2,6);return wp(`Im Zirkus treten ${t} Tiere auf. ${fracHTML(1,d)} davon sind Pferde, und die Hälfte der Pferde ist weiss. Wie viele weisse Pferde treten auf?`,t/d/2)},
()=>{const d=rand(5,6),a=rand(1,3),b=rand(1,d-a-1),t=d*rand(3,8);return wp(`Am Glace-Stand werden ${t} Kugeln Glace verkauft. ${fracHTML(a,d)} davon sind Schoggi, ${fracHTML(b,d)} sind Erdbeer. Wie viele Kugeln sind andere Sorten?`,t-(t/d)*(a+b))},
()=>{const d=rand(4,6),a=rand(1,d-1),k=rand(2,3),n=pickName();return fp(`Eine Velorunde ums Quartier ist ${fracHTML(a,d)} km lang. ${n} fährt die Runde ${k} Mal. Wie viel km fährt ${n} insgesamt?`,k*a,d)},
()=>{const d=rand(3,6),n=pickName();return fp(`Für den Znüni nimmt ${n} ${fracHTML(1,2)} eines Zopfs mit. In der Pause isst ${n} ${fracHTML(1,d)} des ganzen Zopfs. Welcher Bruch des Zopfs bleibt ${n} vom Znüni übrig?`,d-2,2*d)},
];

// ============ VOLUMEN: Operationen ============
const vTask=(t,e,v,u)=>({text:t,equation:e,answerType:'volume',correctValue:v,correctUnit:u,kind:'volumenText',hint:'volumenText'});
// Wie viele kleine Einheiten in eine grosse passen
const FAKTOR={hl:{l:100,dl:1000,cl:10000,ml:100000},l:{dl:10,cl:100,ml:1000},dl:{cl:10,ml:100},cl:{ml:10}};
const zahl=x=>String(rund(x));
function vOp(kind,e,v,u,steps,diag,text){return{text:text||'',equation:e,answerType:'volume',correctValue:rund(v),correctUnit:u,kind,diag,steps,hint:kind}}
function vAddSameOp(){const r=rand(0,3);let a,b,u;if(r===0){u='ml';a=rand(1,7)*100;b=rand(1,Math.max(1,9-a/100))*100}else if(r===1){u='cl';a=rand(10,70);b=rand(10,90-a)}else if(r===2){u='dl';a=rand(1,7);b=rand(1,9-a)}else{u='l';a=rand(1,5);b=rand(1,8-a)}
  return vOp('vGleich',`${vol(a,u)} ${OP('+')} ${vol(b,u)} ${OP('=')}`,a+b,u,[{txt:'Gleiche Einheit: Du kannst direkt zusammenzählen.',math:`${a} ${u} + ${b} ${u} = ${a+b} ${u}`}])}
function vSubSameOp(){const r=rand(0,3);let a,b,u;if(r===0){u='ml';a=rand(3,9)*100;b=rand(1,(a/100)-1)*100}else if(r===1){u='cl';a=rand(20,90);b=rand(5,a-5)}else if(r===2){u='dl';a=rand(3,9);b=rand(1,a-1)}else{u='l';a=rand(2,9);b=rand(1,a-1)}
  return vOp('vGleich',`${vol(a,u)} ${OP('−')} ${vol(b,u)} ${OP('=')}`,a-b,u,[{txt:'Gleiche Einheit: Du kannst direkt abziehen.',math:`${a} ${u} − ${b} ${u} = ${a-b} ${u}`}])}
// a in der grossen Einheit gross, b in der kleinen Einheit u: zuerst alles in u
function vMisch(op,a,gross,b,u){const f=FAKTOR[gross][u],A=a*f,v=op==='+'?A+b:A-b;
  return vOp('vMisch',`${vol(a,gross)} ${OP(op)} ${vol(b,u)} ${OP('=')}`,v,u,[
    {txt:`Rechne zuerst alles in ${u} um. 1 ${gross} = ${f} ${u}.`,math:`${a} ${gross} = ${A} ${u}`},
    {txt:op==='+'?'Dann zusammenzählen:':'Dann abziehen:',math:`${A} ${u} ${op} ${b} ${u} = ${v} ${u}`}],{a,b,f,op})}
function vAddDiffOp(){return pick([
  ()=>vMisch('+',rand(1,4),'l',rand(1,9)*100,'ml'),
  ()=>vMisch('+',rand(1,5),'l',rand(1,8),'dl'),
  ()=>vMisch('+',rand(1,4),'l',rand(10,80),'cl'),
  ()=>vMisch('+',rand(1,8),'dl',rand(20,200),'ml'),
  ()=>vMisch('+',rand(10,80),'cl',rand(50,300),'ml')])()}
function vSubDiffOp(){return pick([
  ()=>vMisch('−',rand(2,5),'l',rand(1,9)*100,'ml'),
  ()=>vMisch('−',rand(2,5),'l',rand(1,9),'dl'),
  ()=>vMisch('−',rand(2,4),'l',rand(10,90),'cl'),
  ()=>vMisch('−',rand(5,9),'dl',rand(20,300),'ml')])()}
function vMulOp(){const[b,u,a]=pick([[rand(1,5)*100,'ml',rand(2,5)],[rand(1,9),'dl',rand(2,5)],[rand(1,5),'l',rand(2,4)],[rand(10,40),'cl',rand(2,4)]]);
  return vOp('vMal',`${vol(b,u)} ${OP('·')} ${a} ${OP('=')}`,a*b,u,[{txt:'Die Einheit bleibt gleich, du rechnest nur mit der Zahl:',math:`${b} ${u} · ${a} = ${a*b} ${u}`}])}
function vDivOp(){const[a,u,d]=pick([[rand(1,5)*100,'ml',pick([2,4,5])],[rand(1,5),'dl',pick([2,3,4,5])],[rand(1,4),'l',pick([2,4,5])]]);
  return vOp('vMal',`${vol(a*d,u)} ${OP(':')} ${d} ${OP('=')}`,a,u,[{txt:'Die Einheit bleibt gleich, du rechnest nur mit der Zahl:',math:`${a*d} ${u} : ${d} = ${a} ${u}`}])}
// Umrechnen: einfach nur von gross nach klein, mittel auch zurück, schwer mit Kommazahlen
function vConvertOp(lv){
  const PAARE=[['l','ml'],['l','cl'],['l','dl'],['dl','ml'],['dl','cl'],['cl','ml'],['hl','l']];
  let von,nach,v;
  const art=lv==='easy'?0:lv==='medium'?rand(0,1):rand(0,2);
  if(art===0){[von,nach]=pick(PAARE);v=lv==='easy'?rand(1,9):pick([rand(2,20),25,50,75]);}
  else if(art===1){[nach,von]=pick(PAARE);v=rand(1,9)*FAKTOR[nach][von];}
  else{
    // Kommazahlen: 2.5 l = 2500 ml oder 2500 ml = 2.5 l
    const[gr,kl]=pick(PAARE.concat([['hl','dl'],['l','ml']]));const halb=rand(2,19)/2;
    if(Math.random()<0.5){von=gr;nach=kl;v=halb}else{von=kl;nach=gr;v=rund(halb*FAKTOR[gr][kl])}
  }
  const grossNachKlein=!!(FAKTOR[von]&&FAKTOR[von][nach]);
  const f=grossNachKlein?FAKTOR[von][nach]:FAKTOR[nach][von];
  const w=grossNachKlein?rund(v*f):rund(v/f);
  return vOp('vUmrechnen',`${vol(zahl(v),von)} ${OP('=')}`,w,nach,[
    {txt:`1 ${grossNachKlein?von:nach} = ${f} ${grossNachKlein?nach:von}. `+(grossNachKlein?`Von ${von} nach ${nach} wird die Zahl grösser: mal ${f}.`:`Von ${von} nach ${nach} wird die Zahl kleiner: durch ${f}.`),
     math:`${zahl(v)} ${von} ${grossNachKlein?'·':':'} ${f} = ${zahl(w)} ${nach}`}],{v,f,grossNachKlein},'Rechne um:')}

// ============ VOLUMEN: Textaufgaben ============
const V_TEMPLATES_EASY=[
()=>{const a=rand(1,5)*100,b=rand(1,9-a/100)*100;return vTask(`${pickGirl()} trinkt am Morgen ${a} ml Wasser und am Nachmittag ${b} ml. Wie viel hat sie zusammen getrunken?`,'',a+b,'ml')},
()=>{const a=rand(2,5),b=rand(1,4);return vTask(`Eine Flasche enthält ${a} l Saft, eine andere ${b} l. Wie viel Saft sind das zusammen?`,'',a+b,'l')},
()=>{const a=rand(2,6),b=rand(1,3);return vTask(`In einem Krug sind ${a} dl Milch. ${pickName()} giesst ${b} dl dazu. Wie viel Milch ist jetzt im Krug?`,'',a+b,'dl')},
()=>{const a=rand(20,60),b=rand(10,30);return vTask(`Ein Glas hat ${a} cl Saft, ein zweites ${b} cl. Wie viel ist zusammen?`,'',a+b,'cl')},
()=>{const a=rand(1,4)*100,b=rand(1,5)*100;return vTask(`Im Aquarium sind ${a} ml Wasser. ${pickName()} fügt ${b} ml dazu. Wie viel Wasser ist im Aquarium?`,'',a+b,'ml')},
()=>{const a=rand(1,4),b=rand(1,4);return vTask(`Eine Ente trinkt ${a} dl Wasser, ein Hund ${b} dl. Wie viel haben sie zusammen getrunken?`,'',a+b,'dl')},
()=>{const a=rand(1,5),b=rand(1,4);return vTask(`In einen Topf giesst ${pickName()} ${a} l Wasser und ${b} l Brühe. Wie viel ist im Topf?`,'',a+b,'l')},
()=>{const a=rand(100,400),b=rand(50,300);return vTask(`Ein Smoothie hat ${a} ml Saft und ${b} ml Joghurt. Wie viel Smoothie ist es zusammen?`,'',a+b,'ml')},
()=>{const a=rand(2,5),b=rand(1,4);return vTask(`Ein Eimer hat ${a} l Wasser. ${pickName()} kippt noch ${b} l dazu. Wie viel Wasser ist im Eimer?`,'',a+b,'l')},
()=>{const a=rand(2,5),b=rand(2,4);return vTask(`${pickName()} macht eine Limonade mit ${a} dl Wasser und ${b} dl Zitronensaft. Wie viel Limonade ist das?`,'',a+b,'dl')},
()=>{const a=rand(20,50),b=rand(10,40);return vTask(`Eine Cola-Dose hat ${a} cl, eine Sprite-Dose ${b} cl. Wie viel Flüssigkeit zusammen?`,'',a+b,'cl')},
()=>{const a=rand(150,400),b=rand(100,400);return vTask(`${pickName()} kocht eine Suppe mit ${a} ml Wasser und ${b} ml Brühe. Wie viel Flüssigkeit ist das?`,'',a+b,'ml')},
()=>{const a=rand(1,4),b=rand(1,5);return vTask(`Ein Sirup-Mix braucht ${a} dl Sirup und ${b} dl Wasser. Wie viel ist zusammen?`,'',a+b,'dl')},
()=>{const a=rand(3,9)*100,b=rand(1,(a/100)-1)*100;return vTask(`${pickGirl()}s Wasserflasche enthält ${a} ml. Sie trinkt ${b} ml. Wie viel ist noch in der Flasche?`,'',a-b,'ml')},
()=>{const a=rand(3,8),b=rand(1,a-1);return vTask(`Eine Suppenschüssel enthält ${a} dl. ${pickName()} isst ${b} dl davon. Wie viel Suppe ist noch in der Schüssel?`,'',a-b,'dl')},
()=>{const a=rand(2,8),b=rand(1,a-1);return vTask(`Eine Giesskanne hat ${a} l Wasser. ${pickName()} giesst ${b} l auf die Pflanzen. Wie viel Wasser ist noch in der Kanne?`,'',a-b,'l')},
()=>{const a=rand(20,90),b=rand(5,a-5);return vTask(`Eine Cola-Flasche enthält ${a} cl. ${pickName()} trinkt ${b} cl. Wie viel ist noch in der Flasche?`,'',a-b,'cl')},
()=>{const a=rand(4,9)*100,b=rand(1,(a/100)-1)*100;return vTask(`Ein Saftbecher hat ${a} ml. Yuna trinkt ${b} ml. Wie viel Saft ist noch im Becher?`,'',a-b,'ml')},
()=>{const a=rand(3,9),b=rand(1,a-1);return vTask(`In einer Tasse sind ${a} dl Tee. ${pickName()} trinkt ${b} dl. Wie viel Tee ist noch in der Tasse?`,'',a-b,'dl')},
()=>{const a=rand(2,7),b=rand(1,a-1);return vTask(`Eine Sirup-Flasche enthält ${a} l. ${pickName()} verbraucht ${b} l für Limonade. Wie viel Sirup ist noch in der Flasche?`,'',a-b,'l')},
()=>{const a=rand(40,90),b=rand(10,a-10);return vTask(`Ein Joghurt-Becher hat ${a} cl. ${pickName()} isst ${b} cl. Wie viel Joghurt ist noch im Becher?`,'',a-b,'cl')},
()=>{const a=rand(3,9),b=rand(1,a-1);return vTask(`Ein Wasserkanister hat ${a} l. Beim Camping wurden ${b} l verbraucht. Wie viel Wasser ist noch im Kanister?`,'',a-b,'l')},
()=>{const a=rand(4,9),b=rand(1,a-1);return vTask(`In einer Karaffe sind ${a} dl Apfelsaft. ${pickName()} schenkt ${b} dl ein. Wie viel ist noch in der Karaffe?`,'',a-b,'dl')},
()=>vTask('Wie viele ml sind 1 Liter?','',1000,'ml'),
()=>vTask('Wie viele cl sind 1 Liter?','',100,'cl'),
()=>vTask('Wie viele dl sind 1 Liter?','',10,'dl'),
()=>vTask('Wie viele ml sind 1 dl?','',100,'ml'),
()=>vTask('Wie viele ml sind 1 cl?','',10,'ml'),
()=>vTask('Wie viele cl sind 1 dl?','',10,'cl'),
()=>vTask('Wie viele Liter sind 1 hl?','',100,'l'),
()=>{const a=rand(2,9);return vTask(`Wie viele ml sind ${a} dl?`,'',a*100,'ml')},
()=>{const a=rand(2,9);return vTask(`Wie viele dl sind ${a} l?`,'',a*10,'dl')},
()=>{const a=rand(2,9);return vTask(`Wie viele cl sind ${a} dl?`,'',a*10,'cl')},
()=>{const a=rand(1,3);return vTask(`Eine Wasserflasche fasst ${a} l. Wie viele ml sind das?`,'',a*1000,'ml')},
()=>{const a=rand(1,5);return vTask(`Ein Becher Yoghurt hat ${a} dl. Wie viele ml sind das?`,'',a*100,'ml')},
()=>{const a=rand(2,5);return vTask(`Eine Karaffe fasst ${a} l. Wie viele dl sind das?`,'',a*10,'dl')},
()=>{const a=rand(1,4),b=rand(1,5);return vTask(`${pickGirl()} füllt ${a} l Wasser in die Vogeltränke und später noch ${b} l. Wie viel Wasser hat sie eingefüllt?`,'',a+b,'l')},
()=>{const a=rand(2,6),b=rand(1,3);return vTask(`In der Regentonne sind ${a} hl Wasser. Es regnet ${b} hl dazu. Wie viel Wasser ist in der Tonne?`,'',a+b,'hl')},
()=>{const a=rand(20,60),b=rand(5,15);return vTask(`In der Thermosflasche sind ${a} cl Tee. ${pickName()} trinkt ${b} cl. Wie viel Tee bleibt?`,'',a-b,'cl')},
()=>{const a=rand(3,7)*100,b=rand(1,2)*100;return vTask(`Ein Duschgel enthält ${a} ml. Die Familie verbraucht ${b} ml. Wie viel ist noch in der Flasche?`,'',a-b,'ml')},
()=>{const a=rand(2,9);return vTask(`Wie viele Liter sind ${a} hl?`,'',a*100,'l')},
()=>{const a=rand(2,9);return vTask(`Wie viele ml sind ${a} cl?`,'',a*10,'ml')},
()=>{const a=rand(2,5),b=rand(1,4);return vTask(`In der Bäckerei giesst der Bäcker ${a} dl Milch und ${b} dl Rahm in den Teig. Wie viel Flüssigkeit kommt in den Teig?`,'',a+b,'dl')},
()=>{const a=rand(1,5),b=rand(1,4);return vTask(`Im Zoo trinken die Elefanten am Morgen ${a} hl Wasser und am Abend ${b} hl. Wie viel Wasser trinken die Elefanten an diesem Tag?`,'',a+b,'hl')},
()=>{const a=rand(4,9),b=rand(1,a-1);return vTask(`Am Sporttag füllt ${pickName()} die Trinkflasche mit ${a} dl Sirup. In der Pause sind ${b} dl getrunken. Wie viel Sirup ist noch in der Flasche?`,'',a-b,'dl')},
()=>{const a=rand(2,5),b=rand(1,4);return vTask(`Am Geburtstagsfest mischt die Mutter ${a} l Orangensaft mit ${b} l Mineralwasser. Wie viel Fruchtpunsch gibt das?`,'',a+b,'l')},
()=>{const a=rand(2,5),b=rand(2,4);return vTask(`Auf dem Bauernhof gibt die Ziege Bella am Morgen ${a} l Milch und am Abend ${b} l. Wie viel Milch gibt Bella an diesem Tag?`,'',a+b,'l')},
()=>{const a=rand(30,90),b=rand(10,20);return vTask(`Auf der Schulreise hat ${pickName()} ${a} cl Eistee dabei. Beim Znüni sind ${b} cl getrunken. Wie viel Eistee ist noch da?`,'',a-b,'cl')},
()=>{const a=rand(3,9),b=rand(1,a-1);return vTask(`Im Garten ist das Planschbecken mit ${a} hl Wasser gefüllt. Zum Putzen werden ${b} hl abgelassen. Wie viel Wasser bleibt im Becken?`,'',a-b,'hl')},
()=>{const a=rand(5,9),b=rand(1,a-1);return vTask(`Im Mostfass am Marktstand sind am Morgen ${a} l Most. Am Abend sind noch ${b} l übrig. Wie viel Most wurde verkauft?`,'',a-b,'l')},
()=>{const a=rand(4,9)*100,b=rand(1,a/100-1)*100;return vTask(`Im Raumschiff hat die Astronautin einen Trinkbeutel mit ${a} ml Wasser. Beim Frühstück sind ${b} ml getrunken. Wie viel Wasser ist noch im Beutel?`,'',a-b,'ml')},
()=>{const a=rand(5,9),b=rand(1,4);return vTask(`Die Piraten haben ein Fass mit ${a} l Trinkwasser an Bord. Im Sturm gehen ${b} l verloren. Wie viel Trinkwasser bleibt im Fass?`,'',a-b,'l')},
()=>{const a=rand(2,5),b=rand(1,4);return vTask(`Beim Fest auf der Ritterburg giesst der Koch ${a} dl Apfelmost und ${b} dl Traubensaft in einen Krug. Wie viel Festtrank ist im Krug?`,'',a+b,'dl')},
()=>{const a=rand(2,5),b=rand(2,4);return vTask(`Im Zirkus braucht die Nebelmaschine am Nachmittag ${a} l Wasser und am Abend ${b} l. Wie viel Wasser braucht die Maschine insgesamt?`,'',a+b,'l')},
()=>{const a=rand(2,9);return vTask(`Der Tank des Feuerwehrautos fasst ${a} hl Wasser. Wie viele Liter sind das?`,'',a*100,'l')},
()=>{const a=rand(10,50),b=rand(10,40);return vTask(`In der Malstunde mischt ${pickName()} ${a} cl Wasser mit ${b} cl blauer Farbe. Wie viel Farbwasser gibt das?`,'',a+b,'cl')},
()=>{const a=rand(1,5)*100,b=rand(1,9-a/100)*100;return vTask(`Am Glace-Stand mixt die Verkäuferin einen Frappé aus ${a} ml Milch und ${b} ml Erdbeer-Glace. Wie viel Frappé gibt das?`,'',a+b,'ml')},
()=>{const a=rand(2,9);return vTask(`Beim Coiffeur enthält eine kleine Shampooflasche ${a} cl. Wie viele ml sind das?`,'',a*10,'ml')},
];
const V_TEMPLATES_MEDIUM=[
()=>{const a=rand(1,3),b=rand(1,9)*100;return vTask(`${pickGirl()}s Wasserflasche enthält ${a} l. Sie giesst noch ${b} ml dazu. Wie viel Wasser ist nun in der Flasche?`,'',a*1000+b,'ml')},
()=>{const a=rand(1,4),b=rand(1,9);return vTask(`Im Topf sind ${a} l Brühe. ${pickName()} fügt ${b} dl Wasser dazu. Wie viel Flüssigkeit ist im Topf?`,'',a*10+b,'dl')},
()=>{const a=rand(1,3),b=rand(10,80);return vTask(`${pickName()} hat ${a} l Saft und ${b} cl Wasser. Wie viel Flüssigkeit ist es zusammen?`,'',a*100+b,'cl')},
()=>{const a=rand(2,8),b=rand(50,300);return vTask(`Ein Aquarium hat ${a} dl Wasser. Beim Befüllen kommen ${b} ml dazu. Wie viel Wasser ist drin?`,'',a*100+b,'ml')},
()=>{const a=rand(10,70),b=rand(50,200);return vTask(`Im Becher sind ${a} cl Limonade. ${pickName()} giesst ${b} ml dazu. Wie viel Limonade ist im Becher?`,'',a*10+b,'ml')},
()=>{const a=rand(1,4),b=rand(1,9);return vTask(`Ein Eimer enthält ${a} l Wasser. ${pickName()} schüttet ${b} dl dazu. Wie viel Wasser ist im Eimer?`,'',a*10+b,'dl')},
()=>{const a=rand(1,3),b=rand(1,9);return vTask(`Im Krug sind ${a} l Tee. ${pickName()} giesst ${b} dl Saft rein. Wie viel Flüssigkeit ist im Krug?`,'',a*10+b,'dl')},
()=>{const a=rand(1,2),b=rand(20,80);return vTask(`Eine Saftschorle braucht ${a} l Saft und ${b} cl Wasser. Wie viel Flüssigkeit ist das?`,'',a*100+b,'cl')},
()=>{const a=rand(2,5),b=rand(100,400);return vTask(`In einer Pfanne sind ${a} dl Milch. ${pickName()} fügt ${b} ml Wasser dazu. Wie viel Flüssigkeit ist in der Pfanne?`,'',a*100+b,'ml')},
()=>{const a=rand(1,3),b=rand(2,8);return vTask(`${pickName()} mischt ${a} l Saft mit ${b} dl Wasser. Wie viel Limonade ist es?`,'',a*10+b,'dl')},
()=>{const a=rand(1,2),b=rand(200,800);return vTask(`Eine Vase enthält ${a} l Wasser. ${pickName()} giesst ${b} ml dazu. Wie viel ist nun in der Vase?`,'',a*1000+b,'ml')},
()=>{const a=rand(2,4),b=rand(1,9)*100;return vTask(`${pickGirl()}s Flasche enthält ${a} l Wasser. Sie trinkt ${b} ml. Wie viel ist noch in der Flasche?`,'',a*1000-b,'ml')},
()=>{const a=rand(2,5),b=rand(1,9);return vTask(`In einem Topf sind ${a} l Suppe. Es werden ${b} dl rausgenommen. Wie viel Suppe ist noch im Topf?`,'',a*10-b,'dl')},
()=>{const a=rand(2,3),b=rand(10,80);return vTask(`Eine Flasche fasst ${a} l. Es sind nur noch ${b} cl drin. Wie viel fehlt zum Vollmachen?`,'',a*100-b,'cl')},
()=>{const a=rand(5,9),b=rand(50,300);if(a*100<=b)return null;return vTask(`Im Glas sind ${a} dl Saft. ${pickName()} trinkt ${b} ml davon. Wie viel ist noch im Glas?`,'',a*100-b,'ml')},
()=>{const a=rand(2,4),b=rand(2,9);return vTask(`Ein Eimer hat ${a} l Wasser. ${pickName()} schüttet ${b} dl weg. Wie viel ist noch im Eimer?`,'',a*10-b,'dl')},
()=>{const a=rand(2,3),b=rand(1,9)*50;return vTask(`Im Wasserkocher sind ${a} l Wasser. Es kochen ${b} ml ab. Wie viel Wasser bleibt?`,'',a*1000-b,'ml')},
()=>{const a=rand(3,5),b=rand(1,9);return vTask(`${pickGirl()} hat eine Karaffe mit ${a} l Wasser. Sie giesst ${b} dl in Gläser. Wie viel ist noch in der Karaffe?`,'',a*10-b,'dl')},
()=>{const a=rand(50,90),b=rand(50,200);if(a*10<=b)return null;return vTask(`Eine Joghurtflasche hat ${a} cl. ${pickName()} isst ${b} ml. Wie viel ist noch in der Flasche?`,'',a*10-b,'ml')},
()=>{const a=rand(3,5),b=rand(50,200);return vTask(`Ein Krug hat ${a} dl Limonade. ${pickName()} trinkt ${b} ml. Wie viel Limonade ist noch im Krug?`,'',a*100-b,'ml')},
()=>{const a=rand(2,4),b=rand(20,80);return vTask(`Eine Wasserflasche hat ${a} l. Yuna trinkt ${b} cl. Wie viel ist noch in der Flasche?`,'',a*100-b,'cl')},
()=>{const a=rand(2,5),b=rand(1,5)*100;return vTask(`${pickGirl()} füllt ${a} Flaschen mit je ${b} ml Wasser. Wie viel Wasser braucht sie?`,'',a*b,'ml')},
()=>{const a=rand(2,5),b=rand(1,4);return vTask(`Ein Cocktail braucht ${b} dl Saft. Für ${a} Cocktails: wie viel Saft?`,'',a*b,'dl')},
()=>{const a=rand(2,4),b=rand(1,4);return vTask(`Eine Suppe braucht ${b} l Wasser. Für ${a} Töpfe: wie viel Wasser?`,'',a*b,'l')},
()=>{const a=rand(2,4),b=rand(20,40);return vTask(`Eine Dose hat ${b} cl Cola. Wie viel Cola sind in ${a} Dosen?`,'',a*b,'cl')},
()=>{const a=rand(3,5),b=rand(2,4);return vTask(`${pickGirl()} giesst ${b} dl Wasser pro Pflanze. Sie hat ${a} Pflanzen. Wie viel Wasser braucht sie?`,'',a*b,'dl')},
()=>{const a=rand(2,4),b=rand(1,3);return vTask(`Ein Eimer fasst ${b} l. Wie viel fassen ${a} Eimer?`,'',a*b,'l')},
()=>{const a=rand(2,4),b=rand(50,200);return vTask(`Ein Becher fasst ${b} ml. Wie viel fassen ${a} Becher?`,'',a*b,'ml')},
()=>{const d=[2,4,5][rand(0,2)],a=rand(1,5)*100;return vTask(`${pickName()} teilt ${a*d} ml Saft gleichmässig auf ${d} Gläser auf. Wie viel ist in jedem Glas?`,'',a,'ml')},
()=>{const d=[2,3,4][rand(0,2)],a=rand(1,4);return vTask(`Eine Flasche mit ${a*d} l wird auf ${d} Becher verteilt. Wie viel ist in jedem Becher?`,'',a,'l')},
()=>{const d=[2,4,5][rand(0,2)],a=rand(1,4);return vTask(`Aus ${a*d} dl Sirup macht ${pickName()} ${d} Portionen. Wie viel Sirup ist in einer Portion?`,'',a,'dl')},
()=>{const d=[2,4,5][rand(0,2)],a=rand(1,9);return vTask(`${a*d} dl Tee werden auf ${d} Tassen verteilt. Wie viel Tee ist in einer Tasse?`,'',a,'dl')},
()=>{const d=[2,3,4][rand(0,2)],a=rand(1,3);return vTask(`Eine Suppenpfanne hat ${a*d} l und wird auf ${d} Schüsseln verteilt. Wie viel Suppe in einer Schüssel?`,'',a,'l')},
()=>{const d=[2,4,5][rand(0,2)],a=rand(50,200);return vTask(`Eine Cola-Flasche hat ${a*d} ml. Sie wird auf ${d} Personen verteilt. Wie viel bekommt jede?`,'',a,'ml')},
()=>{const a=rand(1,3),b=rand(1,9);return vTask(`Mit dem Gartenschlauch füllt ${pickName()} zuerst ${a} l und dann noch ${b} dl in die Giesskanne. Wie viel Wasser ist in der Kanne?`,'',a*10+b,'dl')},
()=>{const a=rand(1,2),b=rand(10,90);return vTask(`${pickName()} kauft ${a} l Milch und ${b} cl Rahm. Wie viel ist das zusammen?`,'',a*100+b,'cl')},
()=>{const a=rand(2,5),b=rand(2,8);return vTask(`Ein Kübel enthält ${a} l Wasser. ${pickName()} giesst ${b} dl davon in die Blumentöpfe. Wie viel bleibt im Kübel?`,'',a*10-b,'dl')},
()=>{const a=rand(2,4),b=rand(10,40);return vTask(`Für ${a} Gläser Sirup braucht es je ${b} cl. Wie viel Sirup wird gebraucht?`,'',a*b,'cl')},
()=>{const d=[2,3,4][rand(0,2)],a=rand(1,3)*100;return vTask(`${a*d} ml Suppe werden gleichmässig in ${d} Tassen gefüllt. Wie viel Suppe ist in jeder Tasse?`,'',a,'ml')},
()=>{const a=rand(1,4),b=rand(1,9);return vTask(`In der Bäckerei giesst ${pickName()} ${a} l Milch und ${b} dl Wasser in den Teig. Wie viel Flüssigkeit kommt in den Teig?`,'',a*10+b,'dl')},
()=>{const a=rand(2,5),b=rand(1,9);return vTask(`Im Zoo füllt der Tierpfleger ${a} l Wasser in den Trog. Die Ziege trinkt ${b} dl. Wie viel Wasser ist noch im Trog?`,'',a*10-b,'dl')},
()=>{const a=rand(2,4),b=rand(10,90);return vTask(`Am Sporttag steht ein Kübel mit ${a} l Sirup bereit. Die Kinder trinken ${b} cl. Wie viel Sirup bleibt im Kübel?`,'',a*100-b,'cl')},
()=>{const a=rand(1,3),b=rand(1,9)*100;return vTask(`Im Zeltlager kocht ${pickName()} ${a} l Tee und giesst ${b} ml kaltes Wasser dazu. Wie viel Flüssigkeit ist es jetzt?`,'',a*1000+b,'ml')},
()=>{const a=rand(2,4),b=rand(1,8);return vTask(`Auf dem Bauernhof füllt ${pickName()} am Morgen ${a} l Milch in die Kanne und am Abend noch ${b} dl dazu. Wie viel Milch ist in der Kanne?`,'',a*10+b,'dl')},
()=>{const a=rand(3,6),b=rand(20,30);return vTask(`Auf der Schulreise trinken ${a} Kinder je ${b} cl Apfelsaft. Wie viel Apfelsaft trinken sie zusammen?`,'',a*b,'cl')},
()=>{const d=[2,3,4][rand(0,2)],a=rand(1,3)*100;return vTask(`Im Hallenbad kauft ${pickName()} eine Flasche mit ${a*d} ml Eistee für ${d} Kinder. Alle bekommen gleich viel. Wie viel bekommt jedes Kind?`,'',a,'ml')},
()=>{const a=rand(1,2),b=rand(10,90);return vTask(`Am Markt verkauft ein Stand frischen Most. In der Kanne sind ${a} l. Ein Kunde kauft ${b} cl. Wie viel Most ist noch in der Kanne?`,'',a*100-b,'cl')},
()=>{const a=rand(3,5),b=rand(1,5)*100;return vTask(`Eine Astronautin hat ${a} Trinkbeutel mit je ${b} ml Wasser dabei. Wie viel Wasser ist das insgesamt?`,'',a*b,'ml')},
()=>{const d=[2,4,5][rand(0,2)],a=rand(2,9);return vTask(`${d} Piraten teilen einen Krug mit ${a*d} dl Apfelsaft gerecht untereinander auf. Wie viel bekommt jeder Pirat?`,'',a,'dl')},
()=>{const a=rand(2,5),b=rand(2,9);return vTask(`Auf der Ritterburg hängt ein Kessel mit ${a} l Suppe über dem Feuer. Der Koch schöpft ${b} dl heraus. Wie viel Suppe ist noch im Kessel?`,'',a*10-b,'dl')},
()=>{const a=rand(1,3),b=rand(1,9);return vTask(`Im Zirkus füllt der Clown ${a} l Wasser in den Spritzeimer und giesst noch ${b} dl dazu. Wie viel Wasser ist im Spritzeimer?`,'',a*10+b,'dl')},
()=>{const a=rand(2,5),b=rand(2,4);return vTask(`Bei der Feuerwehrübung füllen die Kinder ${a} Eimer mit je ${b} l Wasser. Wie viel Wasser ist das insgesamt?`,'',a*b,'l')},
()=>{const a=rand(2,6),b=rand(1,4)*100;return vTask(`Im Malatelier stellt ${pickName()} einen Krug mit ${a} dl Wasser für die Pinsel bereit und giesst ${b} ml frisches Wasser dazu. Wie viel Wasser ist im Krug?`,'',a*100+b,'ml')},
()=>{const d=[2,3,4][rand(0,2)],a=rand(10,25);return vTask(`Am Geburtstagsfest verteilt ${pickName()} ${a*d} cl Punsch gleichmässig auf ${d} Becher. Wie viel Punsch ist in jedem Becher?`,'',a,'cl')},
()=>{const a=rand(1,3),b=rand(1,9);return vTask(`Im Skilager nimmt ${pickName()} eine Thermosflasche mit ${a} l heisser Schoggi auf die Piste mit. Unterwegs werden ${b} dl getrunken. Wie viel Schoggi ist noch in der Flasche?`,'',a*10-b,'dl')},
];
const V_TEMPLATES_HARD=[
()=>{const a=rand(1,2),b=rand(1,9),c=rand(50,200);return vTask(`Beim Backen braucht ${pickName()} ${a} l Milch, ${b} dl Rahm und ${c} ml Wasser. Wie viel Flüssigkeit ist das insgesamt?`,'',a*1000+b*100+c,'ml')},
()=>{const a=rand(1,3),b=rand(1,9),c=rand(10,80);return vTask(`Eine Limonade braucht ${a} l Wasser, ${b} dl Saft und ${c} cl Sirup. Wie viel Limonade ist es insgesamt?`,'',a*100+b*10+c,'cl')},
()=>{const a=rand(1,2),b=rand(20,80),c=rand(50,200);return vTask(`In einer Suppe sind ${a} l Brühe, ${b} cl Wasser und ${c} ml Tomatensaft. Wie viel Suppe ist es?`,'',a*1000+b*10+c,'ml')},
()=>{const a=rand(1,2),b=rand(2,5),c=rand(30,80);return vTask(`${pickName()} mischt ${a} l Saft, ${b} dl Wasser und ${c} cl Zitronensaft. Wie viel Limonade ist es?`,'',a*100+b*10+c,'cl')},
()=>{const a=rand(1,2),b=rand(1,5),c=rand(100,400);return vTask(`In einem Topf sind ${a} l Brühe, ${b} dl Milch und ${c} ml Rahm. Wie viel Flüssigkeit ist im Topf?`,'',a*1000+b*100+c,'ml')},
()=>{const a=rand(1,3),b=rand(1,8),c=rand(50,300);return vTask(`Ein Saft-Mix besteht aus ${a} l Apfelsaft, ${b} dl Orangensaft und ${c} ml Zitronensaft. Wie viel Saft ist es total?`,'',a*1000+b*100+c,'ml')},
()=>{const a=rand(1,2),b=rand(20,60),c=rand(100,300);return vTask(`In einer Bowle sind ${a} l Saft, ${b} cl Sirup und ${c} ml Sodawasser. Wie viel Bowle ist es total?`,'',a*1000+b*10+c,'ml')},
()=>{const a=rand(2,4),b=rand(1,9)*100,c=rand(1,9)*50;if(a*1000<=b+c)return null;return vTask(`${pickGirl()}s Wasserflasche hat ${a} l. Am Morgen trinkt sie ${b} ml, am Mittag ${c} ml. Wie viel ist noch drin?`,'',a*1000-b-c,'ml')},
()=>{const a=rand(3,5),b=rand(1,4),c=rand(1,a*10-b-1);return vTask(`Im Krug sind ${a} l Saft. ${pickName()} giesst ${b} dl in Gläser. Yuna giesst ${c} dl in andere Gläser. Wie viel ist noch im Krug?`,'',a*10-b-c,'dl')},
()=>{const a=rand(2,3);return vTask(`Ein Eimer fasst ${a*10} l. Er ist halbvoll. Wie viel Wasser ist drin?`,'',a*5,'l')},
()=>{const a=rand(2,4);return vTask(`Eine Badewanne fasst ${a*30} l. Sie ist halbvoll. Wie viel Wasser ist drin?`,'',a*15,'l')},
()=>{const a=rand(3,5),b=rand(20,40);return vTask(`${pickName()} füllt ${a} Tassen mit je ${b} cl Tee. Wie viele ml Tee sind das insgesamt?`,'',a*b*10,'ml')},
()=>{const a=rand(3,5),b=rand(2,4);return vTask(`Für ${a} Pflanzen braucht ${pickGirl()} je ${b} dl Wasser. Wie viele ml Wasser braucht sie insgesamt?`,'',a*b*100,'ml')},
()=>{const a=rand(2,4),b=rand(2,5);return vTask(`Eine Suppenportion braucht ${b} dl Brühe. Für ${a} Portionen wieviele cl Brühe?`,'',a*b*10,'cl')},
()=>{const a=rand(3,6);return vTask(`${pickGirl()} trinkt pro Tag 2 dl Milch. Wie viele ml Milch trinkt sie in ${a} Tagen?`,'',a*200,'ml')},
()=>{const a=rand(2,4);return vTask(`Eine Familie trinkt pro Tag ${a} l Wasser. Wie viele dl sind das in einer Woche?`,'',a*7*10,'dl')},
()=>{const d=[2,4,5][rand(0,2)],a=rand(1,5);return vTask(`Aus einer Flasche mit ${a*d} dl macht ${pickName()} ${d} gleich grosse Becher. Wie viele ml sind in einem Becher?`,'',a*100,'ml')},
()=>{const d=[2,4,5][rand(0,2)],a=rand(1,3);return vTask(`${a*d} l Saft werden auf ${d} Personen verteilt. Wie viele dl bekommt jede?`,'',a*10,'dl')},
()=>{const d=[2,4][rand(0,1)],a=rand(1,4);return vTask(`Eine Limonade mit ${a*d} dl wird auf ${d} Gläser verteilt. Wie viele cl sind in einem Glas?`,'',a*10,'cl')},
()=>{const a=rand(150,300);return vTask(`Pro Tag trinkt ${pickName()} ${a*4} ml Wasser in 4 gleich grossen Schlucken. Wie viel ist ein Schluck?`,'',a,'ml')},
()=>{const cap=rand(1,2),da=rand(2,4),db=rand(2,4);if(da+db>cap*10)return null;return vTask(`${pickGirl()}s Trinkflasche fasst ${cap} l. Sie hat schon ${da} dl getrunken und ${db} dl ausgeschüttet. Wie viel ist noch drin?`,'',cap*10-da-db,'dl')},
()=>{const a=rand(1,3);return vTask(`Eine Familie trinkt pro Tag ${a} l Wasser. Wie viele Liter sind das in einer Woche?`,'',a*7,'l')},
()=>{const a=rand(2,4);return vTask(`In ${pickGirl()}s Aquarium sind ${a*5} l Wasser. Beim Reinigen schüttet sie ${a} l raus und füllt ${a} l frisches dazu. Wie viel ist nun drin?`,'',a*5,'l')},
()=>{const a=rand(50,100);return vTask(`Ein Saft-Pack enthält 6 Becher mit je ${a} ml. Wie viel Saft ist im Pack insgesamt?`,'',a*6,'ml')},
()=>{const a=rand(1,3);return vTask(`Ein Eimer hat 5 l Wasser. ${pickName()} füllt ${a} dl pro Becher. Wie viel ist nach 5 Bechern noch im Eimer?`,'',50-a*5,'dl')},
()=>{const a=rand(2,4);return vTask(`Eine Saftflasche hat ${a*10} dl. ${pickName()}, Yuna und Lijin trinken je ${a} dl. Wie viel ist noch in der Flasche?`,'',a*10-a*3,'dl')},
()=>{const a=rand(1,2);return vTask(`${pickGirl()} hat ${a} l Saft und gibt 250 ml an Yuna ab. Wie viel Saft hat sie noch?`,'',a*1000-250,'ml')},
()=>{const a=rand(2,4);return vTask(`Eine Suppenpfanne enthält ${a} l Suppe. Es werden 8 Schüsseln mit je 2 dl gefüllt. Wie viel Suppe bleibt in der Pfanne?`,'',a*10-8*2,'dl')},
()=>{const a=rand(1,3);return vTask(`Eine Familie nimmt auf eine Wanderung 2 Wasserflaschen à 1 l 5 dl mit. Sie trinken ${a*5} dl. Wie viel Wasser ist noch übrig?`,'',2*15-a*5,'dl')},
()=>{const a=rand(2,5);return vTask(`Eine Wasserflasche fasst 1 l 5 dl. ${pickName()} hat schon ${a} dl getrunken. Wie viel ist noch drin?`,'',15-a,'dl')},
()=>{const a=rand(1,2),b=rand(1,9),c=rand(1,9);return vTask(`Ein Kanister enthält ${a} l ${b} dl Wasser. ${pickName()} braucht ${c} dl zum Kochen. Wie viel Wasser bleibt (in dl)?`,'',a*10+b-c,'dl')},
()=>{const a=rand(2,4),b=rand(2,5);return vTask(`${a} Freunde trinken je ${b} dl Most. Wie viele cl Most trinken sie zusammen?`,'',a*b*10,'cl')},
()=>{const a=rand(1,3);return vTask(`Ein Brunnen spuckt pro Minute ${a} l Wasser. Wie viele dl sind das in 5 Minuten?`,'',a*5*10,'dl')},
()=>{const a=rand(2,5);return vTask(`Eine Regentonne fasst ${a} hl. Wie viele Liter sind das?`,'',a*100,'l')},
()=>{const a=rand(1,2),b=rand(1,9),c=rand(50,300);return vTask(`Eine Hexe braut einen Zaubertrank aus ${a} l Quellwasser, ${b} dl Beerensaft und ${c} ml Morgentau. Wie viele ml Zaubertrank sind das insgesamt?`,'',a*1000+b*100+c,'ml')},
()=>{const a=rand(2,4),b=rand(3,8),c=rand(3,8);return vTask(`Der Tierpfleger im Zoo füllt einen Kessel mit ${a} l Wasser. Das Zebra trinkt ${b} dl, der Esel trinkt ${c} dl. Wie viele dl Wasser bleiben im Kessel?`,'',a*10-b-c,'dl')},
()=>{const a=rand(3,5),b=rand(5,12),c=rand(5,12);return vTask(`Am Sporttag mischt ${pickName()} ${a} l Sirup. Am Morgen trinken die Kinder ${b} dl, am Nachmittag ${c} dl. Wie viele dl bleiben übrig?`,'',a*10-b-c,'dl')},
()=>{const a=rand(4,6),b=rand(3,5),c=rand(2,4);return vTask(`In der Bibliothek steht ein Wasserspender mit ${a} l Wasser. ${b} Kinder zapfen je ${c} dl. Wie viele dl Wasser bleiben im Spender?`,'',a*10-b*c,'dl')},
()=>{const a=rand(2,4),b=rand(1,9),c=rand(100,400);return vTask(`Im Zeltlager kocht ${pickName()} für die Gruppe Punsch aus ${a} l Tee, ${b} dl Apfelsaft und ${c} ml Zitronensaft. Wie viele ml Punsch sind das insgesamt?`,'',a*1000+b*100+c,'ml')},
()=>{const a=rand(5,9);return vTask(`Auf dem Bauernhof gibt eine Ziege pro Tag ${a} dl Milch. Wie viele dl Milch gibt die Ziege in einer Woche?`,'',a*7,'dl')},
()=>{const d=[2,4,5][rand(0,2)],a=rand(1,3);return vTask(`Auf der Schulreise werden ${a} l Eistee gerecht auf ${d} Kinder verteilt. Wie viele cl Eistee bekommt jedes Kind?`,'',a*100/d,'cl')},
()=>{const a=2*rand(1,4);return vTask(`Das Planschbecken im Hallenbad fasst ${a} hl. Es ist erst zur Hälfte gefüllt. Wie viele hl Wasser fehlen noch, bis es voll ist?`,'',a/2,'hl')},
()=>{const a=rand(20,30),b=rand(5,9),c=rand(5,9);return vTask(`Ein Stand auf dem Markt hat ein Fass mit ${a} l Most. Am Morgen werden ${b} l verkauft, am Nachmittag ${c} l. Wie viele l Most bleiben im Fass?`,'',a-b-c,'l')},
()=>{const a=rand(50,90);return vTask(`Auf der Raumstation trinkt ein Astronaut pro Tag ${a} cl Wasser aus einem Trinkbeutel. Wie viele cl sind das in einer Woche?`,'',a*7,'cl')},
()=>{const k=rand(1,2),a=4*k;return vTask(`Ein Piratenfass fasst ${a} l. Es ist nur zu einem Viertel mit Trinkwasser gefüllt. Wie viele dl Trinkwasser sind im Fass?`,'',k*10,'dl')},
()=>{const a=rand(1,3),b=rand(1,9),c=rand(10,80);return vTask(`Für das Fest auf der Ritterburg mischt der Koch ${a} l Traubensaft, ${b} dl Wasser und ${c} cl Honigsirup. Wie viele cl Festtrank gibt das insgesamt?`,'',a*100+b*10+c,'cl')},
()=>{const a=rand(2,4),b=rand(2,4);return vTask(`Der Clown im Zirkus verspritzt in jeder Vorstellung ${a} dl Wasser aus seiner Spritzblume. Wie viele ml Wasser sind das bei ${b} Vorstellungen?`,'',a*100*b,'ml')},
()=>{const a=rand(8,12),b=rand(2,4),c=rand(2,3);return vTask(`Der Tank des Feuerwehrautos enthält ${a} hl Wasser. Bei der Übung verspritzt die Feuerwehr zuerst ${b} hl und dann ${c} hl. Wie viele hl bleiben im Tank?`,'',a-b-c,'hl')},
()=>{const a=rand(2,5),b=rand(10,40);return vTask(`Im Malatelier mischt die Klasse Fingerfarbe aus ${a} dl Wasser und ${b} cl flüssiger Farbe. Wie viele ml Fingerfarbe gibt das?`,'',a*100+b*10,'ml')},
()=>{const a=rand(50,150);return vTask(`Ein Welpe bekommt morgens und abends je ${a} ml Milch aus dem Schoppen. Wie viele ml Milch trinkt der Welpe in einer Woche?`,'',a*14,'ml')},
];

// ============ DREISATZ: Helfer ============
const dTask=(t,v,u,h)=>({text:t,equation:'',answerType:'num',correctValue:v,correctUnit:u||'',hint:h||'HD',kind:h==='HI'?'umgekehrt':h==='HZD'?'zusammengesetzt':'direkt'});
const dFrc=(t,n,d,h)=>({text:t,equation:'',answerType:'fraction',correctNum:n,correctDen:d,hint:h||'HD',kind:'dreisatzBruch'});
function chf(x){return(Math.round(x*100)/100).toFixed(2)}
function dnum(x){return Number.isInteger(x)?String(x):String(Math.round(x*1000)/1000)}
function rand2(lo,hi){const a=rand(lo,hi);let b=rand(lo,hi),g=0;while(b===a&&g++<60)b=rand(lo,hi);return[a,b]}
const DCOMP=[12,16,18,20,24,30,36,40,48,60,72,80,90,96,120,144,180,240,360];
const DSMALL=[12,16,18,20,24,30,36,40,48,60];
function divIn(n,lo,hi){const r=[];for(let i=lo;i<=hi;i++)if(n%i===0)r.push(i);return r}
function invPair(lo,hi,pool){pool=pool||DCOMP;for(let k=0;k<80;k++){const n=pool[rand(0,pool.length-1)];const ds=divIn(n,lo,hi).filter(x=>n/x>=2);if(ds.length>=2){const i=rand(0,ds.length-1);let j=rand(0,ds.length-1);while(j===i)j=rand(0,ds.length-1);return[n,ds[i],ds[j]]}}return[24,4,6]}
const HD='HD';
const HI='HI';

// ============ DREISATZ: Textaufgaben EINFACH ============
const D_TEMPLATES_EASY=[
// --- direkt: Preise ---
()=>{const p=rand(2,9),[a,b]=rand2(2,9);return dTask(`${a} Hefte kosten ${a*p} CHF. Wie viel kosten ${b} Hefte?`,b*p,'CHF',HD)},
()=>{const p=rand(2,8),[a,b]=rand2(2,9);return dTask(`${a} gleiche Bleistifte kosten zusammen ${a*p} CHF. Was kosten ${b} solche Bleistifte?`,b*p,'CHF',HD)},
()=>{const p=rand(3,9),[a,b]=rand2(2,8);return dTask(`${a} kg Äpfel kosten ${a*p} CHF. Wie viel kosten ${b} kg Äpfel?`,b*p,'CHF',HD)},
()=>{const p=rand(2,6),[a,b]=rand2(3,12);return dTask(`${a} Brötchen kosten ${a*p} CHF. Wie viel kosten ${b} Brötchen?`,b*p,'CHF',HD)},
()=>{const p=rand(8,15),[a,b]=rand2(2,8);return dTask(`${a} Kinokarten kosten zusammen ${a*p} CHF. Was bezahlt man für ${b} Karten?`,b*p,'CHF',HD)},
()=>{const p=rand(2,7),[a,b]=rand2(3,10);return dTask(`${a} Postkarten kosten ${a*p} CHF. Wie viel kosten ${b} Postkarten?`,b*p,'CHF',HD)},
()=>{const p=rand(3,8),[a,b]=rand2(2,9);return dTask(`${pickName()} kauft ${a} Blumen für ${a*p} CHF. Wie viel würden ${b} Blumen kosten?`,b*p,'CHF',HD)},
()=>{const p=rand(2,5),[a,b]=rand2(4,12);return dTask(`${a} Sticker kosten ${a*p} CHF. Was kosten ${b} Sticker?`,b*p,'CHF',HD)},
()=>{const p=rand(4,9),[a,b]=rand2(2,8);return dTask(`Ein Seil wird nach Länge verkauft: ${a} m kosten ${a*p} CHF. Wie viel kosten ${b} m?`,b*p,'CHF',HD)},
()=>{const p=rand(6,12),[a,b]=rand2(2,7),n=pickName();return dTask(`${n} verdient beim Rasenmähen für ${a} Stunden ${a*p} CHF. Wie viel verdient ${n} für ${b} Stunden?`,b*p,'CHF',HD)},
// --- direkt: rückwärts (wie viele?) ---
()=>{const p=rand(2,9),[a,b]=rand2(2,9);return dTask(`${a} Stück Seife kosten ${a*p} CHF. Wie viele Stück Seife bekommt man für ${b*p} CHF?`,b,'Stück',HD)},
()=>{const p=rand(3,8),[a,b]=rand2(2,9);return dTask(`${a} Eintrittskarten kosten ${a*p} CHF. Für wie viele Karten reichen ${b*p} CHF?`,b,'Karten',HD)},
()=>{const p=rand(2,6),[a,b]=rand2(3,10);return dTask(`${a} Luftballons kosten ${a*p} CHF. Wie viele Luftballons gibt es für ${b*p} CHF?`,b,'Ballons',HD)},
// --- direkt: Geschwindigkeit & Strecke ---
()=>{const s=rand(15,30)*10,[a,b]=rand2(2,9);return dTask(`Ein Velo fährt in ${a} Minuten ${a*s} m weit. Wie weit kommt es bei gleichem Tempo in ${b} Minuten?`,b*s,'m',HD)},
()=>{const s=rand(4,9),[a,b]=rand2(2,8);return dTask(`Ein Zug fährt in ${a} Minuten ${a*s} km. Wie weit fährt er in ${b} Minuten?`,b*s,'km',HD)},
()=>{const s=rand(50,90),[a,b]=rand2(2,9),n=pickName();return dTask(`${n} geht in ${a} Minuten ${a*s} m. Wie weit kommt ${n} in ${b} Minuten?`,b*s,'m',HD)},
()=>{const s=rand(2,6),[a,b]=rand2(2,9);return dTask(`Eine Schnecke kriecht in ${a} Minuten ${a*s} cm weit. Wie weit kriecht sie in ${b} Minuten?`,b*s,'cm',HD)},
// --- direkt: Arbeit & Menge pro Zeit ---
()=>{const s=rand(15,40),[a,b]=rand2(2,8),n=pickName();return dTask(`${n} liest in ${a} Stunden ${a*s} Seiten. Wie viele Seiten sind es in ${b} Stunden?`,b*s,'Seiten',HD)},
()=>{const s=rand(8,20),[a,b]=rand2(2,9);return dTask(`Ein Drucker druckt in ${a} Minuten ${a*s} Seiten. Wie viele Seiten schafft er in ${b} Minuten?`,b*s,'Seiten',HD)},
()=>{const s=rand(3,9),[a,b]=rand2(2,8);return dTask(`Eine Maschine füllt in ${a} Minuten ${a*s} Schachteln. Wie viele Schachteln füllt sie in ${b} Minuten?`,b*s,'Schachteln',HD)},
()=>{const s=rand(4,12),[a,b]=rand2(2,7),n=pickName();return dTask(`${n} steckt in ${a} Minuten ${a*s} Perlen auf eine Schnur. Wie viele Perlen sind es in ${b} Minuten?`,b*s,'Perlen',HD)},
// --- direkt: Hohlmasse ---
()=>{const s=rand(2,5),[a,b]=rand2(2,9);return dTask(`${a} gleiche Flaschen enthalten zusammen ${a*s} l Sirup. Wie viel Sirup ist in ${b} solchen Flaschen?`,b*s,'l',HD)},
()=>{const s=rand(2,5),[a,b]=rand2(2,9);return dTask(`Für ${a} Kinder braucht man ${a*s} dl Punsch. Wie viel Punsch braucht man für ${b} Kinder?`,b*s,'dl',HD)},
()=>{const s=rand(1,5)*50,[a,b]=rand2(2,8);return dTask(`${a} Gläser fassen zusammen ${a*s} ml Wasser. Wie viel fassen ${b} gleiche Gläser?`,b*s,'ml',HD)},
()=>{const s=rand(4,9),[a,b]=rand2(2,9);return dTask(`Aus dem Wasserhahn fliessen in ${a} Minuten ${a*s} l Wasser. Wie viel fliesst in ${b} Minuten?`,b*s,'l',HD)},
()=>{const s=rand(10,40),[a,b]=rand2(2,8);return dTask(`${a} Becher enthalten zusammen ${a*s} cl Milch. Wie viel Milch ist in ${b} Bechern?`,b*s,'cl',HD)},
()=>{const s=rand(1,4)*100,[a,b]=rand2(2,8),n=pickName();return dTask(`${n} giesst ${a} Pflanzen mit ${a*s} ml Wasser. Wie viel Wasser braucht ${n} für ${b} Pflanzen?`,b*s,'ml',HD)},
// --- direkt: Rezepte & Gewicht ---
()=>{const s=rand(4,12)*25,[a,b]=rand2(2,8);return dTask(`Für ${a} Personen braucht ein Rezept ${a*s} g Mehl. Wie viel Mehl braucht man für ${b} Personen?`,b*s,'g',HD)},
()=>{const s=rand(2,4),[a,b]=rand2(2,6);return dTask(`Für ${a} Kuchen braucht man ${a*s} Eier. Wie viele Eier braucht man für ${b} Kuchen?`,b*s,'Eier',HD)},
()=>{const s=rand(20,60),[a,b]=rand2(3,10);return dTask(`${a} gleiche Schrauben wiegen ${a*s} g. Wie viel wiegen ${b} solche Schrauben?`,b*s,'g',HD)},
()=>{const s=rand(2,6),[a,b]=rand2(3,12);return dTask(`${a} Backsteine wiegen ${a*s} kg. Wie viel wiegen ${b} Backsteine?`,b*s,'kg',HD)},
()=>{const s=rand(8,25),[a,b]=rand2(2,9);return dTask(`Ein Hamster frisst in ${a} Tagen ${a*s} g Futter. Wie viel frisst er in ${b} Tagen?`,b*s,'g',HD)},
()=>{const s=rand(3,9),[a,b]=rand2(2,8);return dTask(`${a} Hühner legen an einem Tag zusammen ${a*s} Eier. Wie viele Eier legen ${b} Hühner an einem Tag?`,b*s,'Eier',HD)},
()=>{const s=rand(2,8),[a,b]=rand2(2,9);return dTask(`Ein Bus hat ${a} Reihen mit zusammen ${a*s} Sitzplätzen. Wie viele Sitzplätze haben ${b} Reihen?`,b*s,'Sitzplätze',HD)},
()=>{const s=rand(6,15),[a,b]=rand2(2,8);return dTask(`In ${a} gleichen Packungen sind ${a*s} Gummibärli. Wie viele Gummibärli sind in ${b} Packungen?`,b*s,'Gummibärli',HD)},
// --- indirekt (umgekehrt) ---
()=>{const[n,a,b]=invPair(2,9,DSMALL);return dTask(`${a} Kinder teilen ${n} Bonbons gerecht auf. Jedes bekommt ${n/a} Bonbons. Wie viele bekommt jedes Kind, wenn ${b} Kinder teilen?`,n/b,'Bonbons',HI)},
()=>{const[n,a,b]=invPair(2,9,DSMALL);return dTask(`${a} Freunde teilen sich ${n} Kuchenstücke gerecht. Wie viele Stücke bekommt jeder, wenn es ${b} Freunde sind?`,n/b,'Stücke',HI)},
()=>{const[n,a,b]=invPair(2,8,DSMALL);return dTask(`${a} Arbeiter brauchen für einen Zaun ${n/a} Tage. Wie lange brauchen ${b} Arbeiter (alle arbeiten gleich schnell)?`,n/b,'Tage',HI)},
()=>{const[n,a,b]=invPair(2,9,DSMALL);return dTask(`Das Futter reicht für ${a} Pferde ${n/a} Tage. Für wie viele Tage reicht es bei ${b} Pferden?`,n/b,'Tage',HI)},
()=>{const[n,a,b]=invPair(2,9,DSMALL);return dTask(`${n} Bücher werden gleichmässig auf ${a} Regale verteilt – das gibt ${n/a} Bücher pro Regal. Wie viele Bücher stehen pro Regal, wenn man ${b} Regale nimmt?`,n/b,'Bücher',HI)},
];

// ============ DREISATZ: Textaufgaben MITTEL ============
const D_TEMPLATES_MEDIUM=[
// --- direkt: Preise mit Rappen ---
()=>{const r=rand(6,50)*5,[a,b]=rand2(3,12);return dTask(`${a} Gipfeli kosten ${chf(a*r/100)} CHF. Wie viel kosten ${b} Gipfeli?`,b*r/100,'CHF',HD)},
()=>{const r=rand(20,90)*5,[a,b]=rand2(2,9);return dTask(`${a} kg Kartoffeln kosten ${chf(a*r/100)} CHF. Was kosten ${b} kg?`,b*r/100,'CHF',HD)},
()=>{const r=rand(30,90)*5,[a,b]=rand2(3,12);return dTask(`${a} l Benzin kosten ${chf(a*r/100)} CHF. Wie viel kosten ${b} l?`,b*r/100,'CHF',HD)},
()=>{const r=rand(10,60)*5,[a,b]=rand2(2,10);return dTask(`${a} m Schnur kosten ${chf(a*r/100)} CHF. Wie viel kosten ${b} m Schnur?`,b*r/100,'CHF',HD)},
()=>{const r=rand(8,40)*5,[a,b]=rand2(4,15);return dTask(`${a} Farbkopien kosten ${chf(a*r/100)} CHF. Was kosten ${b} Kopien?`,b*r/100,'CHF',HD)},
()=>{const r=rand(30,120)*5,[a,b]=rand2(2,8);return dTask(`${a} Portionen Glace kosten ${chf(a*r/100)} CHF. Wie viel kosten ${b} Portionen?`,b*r/100,'CHF',HD)},
()=>{const r=rand(12,60)*5,[a,b]=rand2(2,9);return dTask(`${a*100} g Trockenfrüchte kosten ${chf(a*r/100)} CHF. Wie viel kosten ${b*100} g?`,b*r/100,'CHF',HD)},
()=>{const r=rand(20,60)*5,[a,b]=rand2(2,9),n=pickName();return dTask(`${n} bekommt für ${a} Stunden Ferienjob ${chf(a*r*10/100)} CHF. Wie viel verdient ${n} in ${b} Stunden?`,b*r*10/100,'CHF',HD)},
()=>{const r=rand(4,20)*5,[a,b]=rand2(3,12);return dTask(`${a} Bleistifte kosten ${chf(a*r/100)} CHF. Wie viele Bleistifte bekommt man für ${chf(b*r/100)} CHF?`,b,'Stück',HD)},
// --- direkt: Hohlmasse mit Umrechnung ---
()=>{const s=rand(2,9),[a,b]=rand2(2,9);return dTask(`${a} Flaschen enthalten zusammen ${a*s} dl Sirup. Wie viele Milliliter enthalten ${b} Flaschen?`,b*s*100,'ml',HD)},
()=>{const s=rand(2,5)*100,[a,b]=rand2(2,9);return dTask(`${a} gleiche Becher fassen zusammen ${a*s} ml. Wie viele Deziliter fassen ${b} Becher?`,b*s/100,'dl',HD)},
()=>{const s=rand(2,6),[a,b]=rand2(2,9);return dTask(`Für ${a} Gäste braucht man ${a*s} dl Suppe. Wie viele Liter Suppe braucht man für ${b} Gäste?`,b*s/10,'l',HD)},
()=>{const s=rand(1,5)*5,[a,b]=rand2(2,8);return dTask(`${a} Gläser fassen zusammen ${a*s} cl Saft. Wie viele Milliliter fassen ${b} Gläser?`,b*s*10,'ml',HD)},
()=>{const s=rand(2,9),[a,b]=rand2(2,9);return dTask(`Ein Wasserhahn füllt in ${a} Minuten ${a*s} l. Wie viele Deziliter fliessen in ${b} Minuten?`,b*s*10,'dl',HD)},
()=>{const s=rand(2,5),[a,b]=rand2(2,6);return dTask(`${a} Giesskannen fassen zusammen ${a*s} l. Wie viele Zentiliter fassen ${b} Giesskannen?`,b*s*100,'cl',HD)},
()=>{const s=rand(2,8),[a,b]=rand2(2,9);return dTask(`In ${a} Fässern sind zusammen ${a*s} hl Most. Wie viele Liter Most sind in ${b} Fässern?`,b*s*100,'l',HD)},
()=>{const s=rand(1,4)*250,[a,b]=rand2(2,8),n=pickName();return dTask(`${n} füllt ${a} Trinkflaschen mit total ${a*s} ml Tee. Wie viele Deziliter Tee braucht ${n} für ${b} Flaschen?`,b*s/100,'dl',HD)},
()=>{const s=rand(2,6)*5,[a,b]=rand2(2,9);return dTask(`${a} Ampullen enthalten zusammen ${a*s} ml Medizin. Wie viele Zentiliter sind in ${b} Ampullen?`,b*s/10,'cl',HD)},
// --- direkt: Strecke, Zeit, Verbrauch ---
()=>{const s=rand(6,14),[a,b]=rand2(2,9);return dTask(`Ein Auto braucht für ${a*100} km ${a*s} l Benzin. Wie viel Benzin braucht es für ${b*100} km?`,b*s,'l',HD)},
()=>{const s=rand(4,9),[a,b]=rand2(2,9);return dTask(`Ein Zug fährt gleichmässig und legt in ${a} Minuten ${a*s} km zurück. Wie viele Minuten braucht er für ${b*s} km?`,b,'Minuten',HD)},
()=>{const s=rand(20,60),[a,b]=rand2(2,9);return dTask(`Ein Mähroboter mäht in ${a} Stunden ${a*s} m² Rasen. Wie viele Stunden braucht er für ${b*s} m²?`,b,'Stunden',HD)},
()=>{const s=rand(3,8),[a,b]=rand2(2,9);return dTask(`Mit ${a} l Farbe streicht man ${a*s} m² Wand. Wie viele Quadratmeter streicht man mit ${b} l?`,b*s,'m²',HD)},
()=>{const s=rand(15,45),[a,b]=rand2(2,8);return dTask(`Eine Familie verbraucht in ${a} Tagen ${a*s} dl Milch. Wie viele Deziliter verbraucht sie in ${b} Tagen?`,b*s,'dl',HD)},
()=>{const s=rand(2,7),[a,b]=rand2(2,9);return dTask(`Eine Kerze brennt in ${a} Stunden ${a*s} cm ab. Wie viele Zentimeter brennt sie in ${b} Stunden ab?`,b*s,'cm',HD)},
()=>{const s=rand(3,9),[a,b]=rand2(2,8);return dTask(`Ein Regenmesser sammelt in ${a} Stunden ${a*s} mm Regen. Wie viel sammelt er bei gleichem Regen in ${b} Stunden?`,b*s,'mm',HD)},
()=>{const s=rand(4,12),[a,b]=rand2(2,9);return dTask(`Eine Solaranlage liefert in ${a} Stunden ${a*s} kWh Strom. Wie viel liefert sie in ${b} Stunden?`,b*s,'kWh',HD)},
// --- direkt: Massstab ---
()=>{const s=rand(2,9),[a,b]=rand2(2,9);return dTask(`Auf einer Karte entsprechen ${a} cm genau ${a*s} km in Wirklichkeit. Wie vielen Kilometern entsprechen ${b} cm?`,b*s,'km',HD)},
()=>{const s=rand(2,8),[a,b]=rand2(2,9);return dTask(`Auf einem Plan sind ${a} cm gleich ${a*s} m. Wie viele Zentimeter braucht man auf dem Plan für ${b*s} m?`,b,'cm',HD)},
// --- indirekt (umgekehrt proportional) ---
()=>{const[n,a,b]=invPair(2,12,DSMALL);return dTask(`${a} Arbeiter brauchen für eine Mauer ${n/a} Tage. Wie lange brauchen ${b} Arbeiter, wenn alle gleich schnell arbeiten?`,n/b,'Tage',HI)},
()=>{const[n,a,b]=invPair(2,12,DSMALL);return dTask(`${a} Maschinen erledigen eine Bestellung in ${n/a} Stunden. Wie lange brauchen ${b} gleiche Maschinen?`,n/b,'Stunden',HI)},
()=>{const[n,a,b]=invPair(2,10,DSMALL);return dTask(`Ein Vorrat reicht für ${a} Personen genau ${n/a} Tage. Für wie viele Tage reicht derselbe Vorrat bei ${b} Personen?`,n/b,'Tage',HI)},
()=>{const[n,a,b]=invPair(2,10,DSMALL);return dTask(`${n} l Most werden in Fässer zu je ${n/a} l abgefüllt – das gibt ${a} Fässer. Wie viele Fässer gibt es, wenn jedes ${n/b} l fasst?`,b,'Fässer',HI)},
()=>{const[n,a,b]=invPair(2,12,DSMALL);return dTask(`Ein voller Krug füllt genau ${a} Gläser zu je ${n/a} dl. Wie viele Deziliter fasst ein Glas, wenn man denselben Krug auf ${b} Gläser verteilt?`,n/b,'dl',HI)},
()=>{const[n,a,b]=invPair(2,12,DSMALL);return dTask(`Ein Sack Futter reicht ${a} Hasen ${n/a} Tage. Wie viele Tage reicht der Sack für ${b} Hasen?`,n/b,'Tage',HI)},
()=>{const[n,a,b]=invPair(2,9,DSMALL);return dTask(`Beim Umzug trägt jedes der ${a} Kinder ${n/a} Kisten. Wie viele Kisten trägt jedes Kind, wenn ${b} Kinder gleich viele tragen?`,n/b,'Kisten',HI)},
()=>{const[n,a,b]=invPair(2,12,DSMALL);return dTask(`Auf ${a} Tische verteilt stehen je ${n/a} Stühle. Wie viele Stühle kommen an einen Tisch, wenn man ${b} Tische aufstellt?`,n/b,'Stühle',HI)},
()=>{const[n,a,b]=invPair(2,12,DSMALL);return dTask(`Ein Schwimmbad wird von ${a} gleichen Pumpen in ${n/a} Stunden gefüllt. Wie lange dauert es mit ${b} solchen Pumpen?`,n/b,'Stunden',HI)},
()=>{const[n,a,b]=invPair(2,10,DSMALL);return dTask(`${a} Bagger heben eine Grube in ${n/a} Stunden aus. Wie viele Stunden brauchen ${b} Bagger?`,n/b,'Stunden',HI)},
()=>{const h=rand(2,6),v=[20,30,40,60,80,90,120][rand(0,6)],n=v*h;const ds=divIn(n,20,120).filter(x=>x!==v);const w=ds.length?ds[rand(0,ds.length-1)]:v;return dTask(`Bei ${v} km/h braucht ein Auto für eine Strecke ${dnum(n/v)} Stunden. Wie lange braucht es bei ${w} km/h?`,n/w,'Stunden',HI)},
()=>{const[n,a,b]=invPair(2,12,DSMALL);return dTask(`${n} Bonbons werden gerecht verteilt: Bei ${a} Kindern bekommt jedes ${n/a} Stück. Wie viele bekommt jedes bei ${b} Kindern?`,n/b,'Stück',HI)},
()=>{const[n,a,b]=invPair(2,12,DSMALL);return dTask(`Eine Jugendherberge hat ${n} Betten. In Zimmern zu ${n/a} Betten gibt das ${a} Zimmer. Wie viele Betten hat ein Zimmer, wenn es ${b} Zimmer sein sollen?`,n/b,'Betten',HI)},
()=>{const[n,a,b]=invPair(2,12,DSMALL);return dTask(`${a} Gärtner schneiden eine Hecke in ${n/a} Stunden. Wie lange brauchen ${b} Gärtner dafür?`,n/b,'Stunden',HI)},
];

// ============ DREISATZ: Textaufgaben SCHWER ============
const DFRACS=[[1,2],[1,3],[2,3],[1,4],[3,4],[1,5],[2,5],[3,5],[4,5],[1,6],[5,6],[3,8],[5,8],[7,10],[3,10]];
const DFRACS_S=[[1,2],[1,3],[2,3],[1,4],[3,4],[1,6],[5,6],[2,5],[3,5]];
const pickFrac=()=>DFRACS[rand(0,DFRACS.length-1)];
const pickFracS=()=>DFRACS_S[rand(0,DFRACS_S.length-1)];
const HDF='HDF';
const HZD='HZD';
const D_TEMPLATES_HARD=[
// --- direkt: Bruchmengen ---
()=>{const[n,d]=pickFrac(),P=d*rand(1,5),b=rand(2,7);return dTask(`${fracHTML(n,d)} kg Kirschen kosten ${dnum(P*n/d)} CHF. Wie viel kosten ${b} kg Kirschen?`,b*P,'CHF',HDF)},
()=>{const[n,d]=pickFrac(),P=d*rand(1,4),b=rand(2,6);return dTask(`Für ${fracHTML(n,d)} m Stoff bezahlt man ${dnum(P*n/d)} CHF. Wie viel kosten ${b} m Stoff?`,b*P,'CHF',HDF)},
()=>{const[n,d]=pickFrac(),P=d*rand(2,6),b=rand(2,6);return dTask(`${fracHTML(n,d)} l Olivenöl kosten ${dnum(P*n/d)} CHF. Wie viel kosten ${b} l?`,b*P,'CHF',HDF)},
()=>{const[n,d]=pickFrac(),G=d*rand(20,60),b=rand(2,8);return dTask(`Für ${fracHTML(n,d)} kg Nüsse braucht man ${dnum(G*n/d)} g Verpackungsmaterial. Wie viel Verpackung braucht man für ${b} kg?`,b*G,'g',HDF)},
()=>{const[n,d]=pickFracS(),V=d*rand(1,3),b=rand(2,6);return dTask(`In ${fracHTML(n,d)} Stunde legt ein Läufer ${dnum(V*n/d)} km zurück. Wie weit kommt er in ${b} Stunden?`,b*V,'km',HDF)},
()=>{const[n,d]=pickFrac(),V=d*rand(2,8),b=rand(2,7);return dTask(`Ein Wasserhahn füllt in ${fracHTML(n,d)} Minute ${dnum(V*n/d)} dl. Wie viele Deziliter fliessen in ${b} Minuten?`,b*V,'dl',HDF)},
()=>{const[n,d]=pickFrac(),M=d*rand(10,40),b=rand(2,6);return dTask(`Für ${fracHTML(n,d)} eines Kuchens braucht man ${dnum(M*n/d)} g Zucker. Wie viel Zucker braucht man für ${b} ganze Kuchen?`,b*M,'g',HDF)},
()=>{const[n,d]=pickFrac(),L=d*rand(2,6),b=rand(2,5);return dTask(`${fracHTML(n,d)} eines Fasses sind ${dnum(L*n/d)} l. Wie viele Liter fassen ${b} volle Fässer?`,b*L,'l',HDF)},
()=>{const[n,d]=pickFrac(),P=d*rand(1,4),a=rand(2,6);return dTask(`${a} kg Beeren kosten ${a*P} CHF. Wie viel kosten ${fracHTML(n,d)} kg?`,P*n/d,'CHF',HD)},
()=>{const[n,d]=pickFracS(),V=d*rand(2,6);return dTask(`Ein Velo fährt in einer Stunde ${V} km. Wie weit kommt es in ${fracHTML(n,d)} Stunde?`,V*n/d,'km',HD)},
()=>{const[n,d]=pickFrac(),M=d*rand(5,20),a=rand(2,5);return dTask(`${a} Portionen Müesli brauchen ${a*M} g Haferflocken. Wie viele Gramm braucht man für ${fracHTML(n,d)} Portion?`,M*n/d,'g',HD)},
// --- direkt: Antwort als Bruch ---
()=>{const a=rand(2,7),b=rand(a+1,a+7);return dFrc(`${a} Pizzen werden gerecht unter ${b} Kindern aufgeteilt. Welchen Bruch einer Pizza bekommt jedes Kind? (gekürzt angeben)`,a,b,'anteil_pizzen')},
()=>{const a=rand(2,8),b=rand(a+1,a+8);return dFrc(`${a} l Saft werden gleichmässig auf ${b} Krüge verteilt. Welcher Bruch eines Liters kommt in jeden Krug? (gekürzt)`,a,b,'menge_gefaesse')},
()=>{const a=rand(2,6),b=rand(a+1,a+6);return dFrc(`${a} Tafeln Schoggi werden gerecht an ${b} Personen verteilt. Welchen Bruch einer Tafel bekommt jede Person? (gekürzt)`,a,b,'zusammen_teilen')},
()=>{const a=rand(3,9),b=rand(a+1,a+10);return dFrc(`${a} m Schnur werden in ${b} gleich lange Stücke geschnitten. Welcher Bruch eines Meters ist ein Stück? (gekürzt)`,a,b,'laenge_stuecke')},
()=>{const a=rand(2,7),b=rand(a+2,a+9);return dFrc(`${b} gleiche Becher fassen zusammen ${a} l. Welchen Bruch eines Liters fasst ein Becher? (gekürzt)`,a,b,'menge_becher')},
()=>{const a=rand(2,6),b=rand(a+1,a+7);return dFrc(`${a} kg Futter reichen für genau ${b} Tage. Welcher Bruch eines Kilogramms wird pro Tag gefressen? (gekürzt)`,a,b,'menge_tage')},
()=>{const a=rand(2,8),b=rand(a+1,a+8);return dFrc(`${a} hl Most werden auf ${b} gleiche Fässer verteilt. Welcher Bruch eines Hektoliters ist in einem Fass? (gekürzt)`,a,b,'menge_faesser')},
// --- direkt: Dezimalzahlen und Hohlmasse ---
()=>{const h=rand(15,90)*5,[a,b]=rand2(3,15);return dTask(`${dnum(a/2)} m Stoff kosten ${chf(a*h/100)} CHF. Wie viel kosten ${dnum(b/2)} m?`,b*h/100,'CHF',HD)},
()=>{const s=rand(3,15),[a,b]=rand2(2,9);return dTask(`${a} Flaschen enthalten zusammen ${dnum(a*s/2)} dl Sirup. Wie viele Liter Sirup sind in ${b} Flaschen?`,b*s/20,'l',HD)},
()=>{const s=rand(3,15),[a,b]=rand2(2,8);return dTask(`Für ${a} Personen braucht ein Rezept ${dnum(a*s/2)} dl Rahm. Wie viele Milliliter Rahm braucht man für ${b} Personen?`,b*s*50,'ml',HD)},
()=>{const s=rand(5,25)*5,[a,b]=rand2(2,9);return dTask(`${a} Gläser fassen zusammen ${a*s} ml. Wie viele Zentiliter fassen ${b} Gläser?`,b*s/10,'cl',HD)},
()=>{const s=rand(3,9),[a,b]=rand2(2,8);return dTask(`${a} Kannen enthalten zusammen ${a*s} dl Tee. Wie viele Zentiliter Tee sind in ${b} Kannen?`,b*s*10,'cl',HD)},
()=>{const s=rand(2,8),[a,b]=rand2(2,6);return dTask(`In ${a} Tanks sind zusammen ${a*s} hl Wasser. Wie viele Liter Wasser sind in ${b} Tanks?`,b*s*100,'l',HD)},
()=>{const s=rand(4,20)*25,[a,b]=rand2(2,9);return dTask(`${a} Portionen Suppe brauchen ${a*s} ml Bouillon. Wie viele Deziliter braucht man für ${b} Portionen?`,b*s/100,'dl',HD)},
()=>{const s=rand(1,9)*250,[a,b]=rand2(2,8);return dTask(`Ein Abfüllautomat füllt in ${a} Minuten ${a*s} ml ab. Wie viele Liter füllt er in ${b} Minuten?`,b*s/1000,'l',HD)},
()=>{const g=rand(2,9)*50,[a,b]=rand2(2,9);return dTask(`${a} Tafeln Schoggi wiegen zusammen ${a*g} g. Wie viele Kilogramm wiegen ${b} Tafeln?`,b*g/1000,'kg',HD)},
()=>{const s=rand(2,9)*2,[a,b]=rand2(2,9);return dTask(`${a} Tanks enthalten zusammen ${a*s} l. Wie viele Hektoliter enthalten ${b} Tanks?`,b*s/100,'hl','hl100')},
()=>{const s=rand(2,9),a=rand(2,9);return dTask(`${a} Tanks fassen zusammen ${a*s} hl. Wie viele Deziliter fasst ein einziger Tank?`,s*1000,'dl','hl1000dl')},
()=>{const s=rand(2,9),[a,b]=rand2(2,9);return dTask(`Auf einer Karte im Massstab 1:${s*10000} entsprechen ${a} cm genau ${dnum(a*s/10)} km. Wie vielen Kilometern entsprechen ${b} cm?`,b*s/10,'km',HD)},
()=>{const q=rand(2,9),p=rand(3,9),a=rand(2,6),b=rand(2,9);return dTask(`${a} Packungen à ${p} Stück kosten zusammen ${a*p*q} CHF. Wie viel kosten ${b} einzelne Stück?`,b*q,'CHF',HD)},
// --- indirekt mit Brüchen ---
()=>{const[n,d]=pickFrac(),T=n*rand(2,9);return dTask(`Ein Wasserhahn füllt ein Becken in ${T} Minuten. Wie lange dauert es, wenn er nur noch ${fracHTML(n,d)} so stark fliesst?`,T*d/n,'Minuten',HI)},
()=>{const[n,d]=pickFrac(),T=n*rand(2,8);return dTask(`Eine Maschine braucht für einen Auftrag ${T} Stunden. Wie lange braucht eine Maschine, die nur ${fracHTML(n,d)} so schnell arbeitet?`,T*d/n,'Stunden',HI)},
()=>{const[n,d]=pickFracS(),T=n*rand(3,9);return dTask(`Bei vollem Tempo braucht ein Zug ${T} Minuten für eine Strecke. Wie lange braucht er mit ${fracHTML(n,d)} des Tempos?`,T*d/n,'Minuten',HI)},
()=>{const T=rand(2,12),f=[2,3,4,5][rand(0,3)];return dTask(`${f} gleiche Pumpen füllen ein Becken zusammen in ${T} Stunden. Wie lange braucht eine einzige Pumpe?`,T*f,'Stunden',HI)},
()=>{const[n,a,b]=invPair(3,12,DSMALL);return dTask(`${a} Arbeiter brauchen für eine Halle ${n/a} Tage. Wie viele Tage brauchen ${b} Arbeiter?`,n/b,'Tage',HI)},
()=>{const[n,a,b]=invPair(3,12,DSMALL);return dTask(`Der Proviant reicht ${a} Wanderern genau ${n/a} Tage. Wie lange reicht er für ${b} Wanderer?`,n/b,'Tage',HI)},
()=>{const L=[6,8,10,12,15,18,20,24,30][rand(0,8)];const ds=divIn(L*10,5,60);const w=ds[rand(0,ds.length-1)];return dTask(`Ein Fass mit ${L} l wird in Flaschen zu je ${dnum(w/10)} l abgefüllt. Wie viele Flaschen gibt das?`,L*10/w,'Flaschen',HI)},
()=>{const[n,a,b]=invPair(2,12,DSMALL);return dTask(`${n} dl Sirup werden in Gläser zu je ${n/a} dl gefüllt – das gibt ${a} Gläser. Wie viele Gläser gibt es bei ${n/b} dl pro Glas?`,b,'Gläser',HI)},
// --- zusammengesetzter Dreisatz ---
()=>{const p=rand(2,6),[a,b]=rand2(2,5),[t,u]=rand2(2,6);return dTask(`${a} Arbeiter schaffen in ${t} Tagen ${a*t*p} m Mauer. Wie viele Meter schaffen ${b} Arbeiter in ${u} Tagen?`,b*u*p,'m',HZD)},
()=>{const p=rand(3,9),[a,b]=rand2(2,6),[t,u]=rand2(2,6);return dTask(`${a} Maschinen füllen in ${t} Stunden ${a*t*p} Kisten. Wie viele Kisten füllen ${b} Maschinen in ${u} Stunden?`,b*u*p,'Kisten',HZD)},
()=>{const p=rand(2,5),[a,b]=rand2(2,6),[t,u]=rand2(2,6);return dTask(`${a} Kühe fressen in ${t} Tagen ${a*t*p} kg Heu. Wie viel Heu fressen ${b} Kühe in ${u} Tagen?`,b*u*p,'kg',HZD)},
()=>{const p=rand(2,6)*100,[a,b]=rand2(2,5),[t,u]=rand2(2,6);return dTask(`${a} Wasserhähne füllen in ${t} Minuten zusammen ${a*t*p} ml. Wie viele Milliliter füllen ${b} Hähne in ${u} Minuten?`,b*u*p,'ml',HZD)},
()=>{const p=rand(2,5),[a,b]=rand2(2,5),[t,u]=rand2(2,6);return dTask(`${a} Pumpen fördern in ${t} Stunden ${a*t*p} hl Wasser. Wie viele Hektoliter fördern ${b} Pumpen in ${u} Stunden?`,b*u*p,'hl',HZD)},
()=>{const w=rand(2,6),a=rand(2,6),t=rand(2,6);const total=a*t;const ds=divIn(total*w,2,12).filter(x=>x!==a);const bb=ds.length?ds[rand(0,ds.length-1)]:a;return dTask(`${a} Arbeiter bauen eine Mauer in ${t} Tagen. Wie lange brauchen ${bb} Arbeiter für ${w} solche Mauern?`,total*w/bb,'Tage',HZD)},
()=>{const a=rand(2,6),t=rand(2,8),k=rand(2,4);const total=a*t*k;const ds=divIn(total,2,12).filter(x=>x!==a);const b=ds.length?ds[rand(0,ds.length-1)]:a;return dTask(`${a} Gärtner brauchen ${t} Stunden für einen Park. Wie lange brauchen ${b} Gärtner für ${k} gleich grosse Parks?`,total/b,'Stunden',HZD)},
];
// (13 Tipps auf Schlüssel umgestellt)

// ============ AUSWAHL ============
// Keine Vorlage zweimal kurz hintereinander, keine gleiche Aufgabe unter den letzten 30
const recentTplIdx={},recentSigs=[];
function pickFrom(pool,key){const rec=recentTplIdx[key]||(recentTplIdx[key]=[]);const win=Math.min(pool.length-1,Math.floor(pool.length*0.6));let i=rand(0,pool.length-1),tries=0;while(rec.includes(i)&&tries<30){i=rand(0,pool.length-1);tries++}rec.push(i);while(rec.length>win)rec.shift();return pool[i]}
function taskSig(t){return(t.text||'')+'|'+(t.equation||'')+'|'+(t.correctNum!==undefined?t.correctNum+'/'+t.correctDen:t.correctValue+''+(t.correctUnit||''))}
const OPS={
  brueche:{easy:[addSame,addSame,subSame,subSame,addDiff,simplifyFrac,fracOfNumber],
    medium:[addDiff,addDiff,subDiff,subDiff,mulFrac,divFrac,addSame,subSame,simplifyFrac,mulFracWhole,fracOfNumber],
    hard:[addDiff,subDiff,mulFrac,divFrac,mixedAdd,mixedSub,mulFracWhole,fracOfNumber]},
  volumen:{easy:[vAddSameOp,vAddSameOp,vSubSameOp,vSubSameOp,vConvertOp,vConvertOp],
    medium:[vAddDiffOp,vAddDiffOp,vSubDiffOp,vSubDiffOp,vMulOp,vDivOp,vConvertOp,vConvertOp],
    hard:[vAddDiffOp,vSubDiffOp,vMulOp,vDivOp,vConvertOp,vConvertOp]},
};
const TEXTE_POOL={
  brueche:{easy:TEMPLATES_EASY,medium:TEMPLATES_MEDIUM,hard:TEMPLATES_HARD},
  volumen:{easy:V_TEMPLATES_EASY,medium:V_TEMPLATES_MEDIUM,hard:V_TEMPLATES_HARD},
  dreisatz:{easy:D_TEMPLATES_EASY,medium:D_TEMPLATES_MEDIUM,hard:D_TEMPLATES_HARD},
};
function einmal(topic,lv){
  // Brüche und Volumen: halb Textaufgaben, halb Rechnungen. Dreisätze: nur Textaufgaben.
  if(topic==='dreisatz'||Math.random()<0.5){
    let t,i=0;do{t=pickFrom(TEXTE_POOL[topic][lv],'t-'+topic+'-'+lv)();i++}while(!t&&i<10);
    if(t)return t;
  }
  return pickFrom(OPS[topic][lv],'o-'+topic+'-'+lv)(lv);
}
// topic: 'brueche' | 'volumen' | 'dreisatz' | 'mix'
function neue(topic,lv){
  for(let i=0;i<20;i++){
    const th=topic==='mix'?pick(['brueche','volumen','dreisatz']):topic;
    const t=einmal(th,lv);
    if(!t)continue;
    const sig=taskSig(t);
    if(recentSigs.includes(sig))continue;
    recentSigs.push(sig);while(recentSigs.length>30)recentSigs.shift();
    return Object.assign(t,{topic:th,level:lv});
  }
  const th=topic==='mix'?'brueche':topic;
  return Object.assign(th==='volumen'?vAddSameOp():th==='dreisatz'?pickFrom(D_TEMPLATES_EASY,'t-fallback')():addSame(lv),{topic:th,level:lv});
}

return{neue,simplify,gcd,isSimplified,fracHTML,
  // nur für Tests: alle Vorlagen und Rechnungen
  _alle:{TEXTE_POOL,OPS}};
})();

if(typeof module!=='undefined')module.exports={Aufgaben};
