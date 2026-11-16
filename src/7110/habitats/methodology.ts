// Metodyka 7110 (torfowiska wysokie z roślinnością torfotwórczą – żywe; siedlisko priorytetowe) jako dane.
// Źródło: Stańko R. 2010, „7110 Torfowiska wysokie z roślinnością torfotwórczą (żywe)” [w:] Mróz W. (red.), Monitoring
// siedlisk przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ, s. 145–160 (tab. 1 i 2, lista wskaźników kardynalnych,
// karta „Supraśl” 2008), z praktyką oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014 i 2020–2021.
// Transekt 10×200 m (albo o tej samej powierzchni, np. 100×20, 50×40; przy płacie <20 arów – centralna część 10×10 m),
// trzy zdjęcia fitosocjologiczne po 25 m² co 100 m: na początku, w środku i na końcu transektu.
// Silnik, typy i część pól stanowiska / zdjęć – wspólne z 7120 (torfowiska wysokie zdegradowane).
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology } from '../../7120/habitats/types'
import { describeSpecies, mean, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, listCover, normalizeName, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_7110,
  SPECIES_7110,
  SUBTYPES_7110,
  SUBTYPE_LABELS_7110,
  defaultLayer7110,
  findSpecies7110,
  isAlien7110,
  isCharSphagnum7110,
  isCharVascular7110,
  isExpansive7110,
  isHollowSphagnum7110,
  isHummockSphagnum7110,
  isShrub7110,
  isSphagnum7110,
  isTree7110,
} from './species'

// ---------- progi liczbowe (tab. 2) ----------

/**
 * Gatunki charakterystyczne: FV – co najmniej 3 torfowce i 2 rośliny naczyniowe; U1 – co najmniej 2 i 2;
 * U2 – „1 torfowiec i 1 roślina naczyniowa”. Każda kombinacja poniżej U1 (np. 3 torfowce i 1 naczyniowa) – U2.
 */
export function gradeCharacteristic7110(sphagna: number, vascular: number): Grade {
  if (sphagna >= 3 && vascular >= 2) return 'FV'
  if (sphagna >= 2 && vascular >= 2) return 'U1'
  return 'U2'
}

/**
 * Pokrycie i struktura gatunkowa torfowców: FV – torfowce >50% transektu i kępkowe (magellański, brodawkowaty,
 * brunatny, czerwonawy, ostrolistny) >40% powierzchni torfowców; U2 – torfowce <20% albo kępkowe <5%; reszta U1.
 * Tab. 2 daje kępkowym „5–40%” w U1 i „co najwyżej 5%” w U2 – równe 5% liczone do U1.
 */
export function gradeSphagnum7110(cover: number, hummockShare: number): Grade {
  if (cover < 20 || hummockShare < 5) return 'U2'
  if (cover > 50 && hummockShare > 40) return 'FV'
  return 'U1'
}

/** Obce inwazyjne i rodzime ekspansywne: brak FV, do 5% U1, powyżej 5% U2. */
export const gradeUpTo5 = (cover: number): Grade => (cover === 0 ? 'FV' : cover <= 5 ? 'U1' : 'U2')

/** Uwodnienie (piezometr, średnia z pomiarów): do 10 cm FV, 10–30 cm U1, >30 cm U2. Woda nad powierzchnią – ujemne. */
export const gradeWater7110 = (depth: number): Grade => (depth <= 10 ? 'FV' : depth <= 30 ? 'U1' : 'U2')

/** Drzewa: <10% FV, 10–30% U1, >30% U2 (ponad 50% to już bór bagienny). */
export const gradeTrees7110 = (p: number): Grade => (p < 10 ? 'FV' : p <= 30 ? 'U1' : 'U2')

/** Krzewy (borówka bagienna, bagno zwyczajne itp.): <30% FV, 30–50% U1, >50% U2. */
export const gradeShrubs7110 = (p: number): Grade => (p < 30 ? 'FV' : p <= 50 ? 'U1' : 'U2')

const ORDER: Grade[] = ['FV', 'U1', 'U2']
const worse = (a: Grade | null, b: Grade | null): Grade | null => {
  if (!a) return b
  if (!b) return a
  return ORDER.indexOf(a) >= ORDER.indexOf(b) ? a : b
}

// ---------- drobne pomocniki ----------

const pct = (v: number) => `${plNum(v)}%`
const round1 = (n: number) => Math.round(n * 10) / 10
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const uniq = (names: string[]) => [...new Map(names.map((n) => [normalizeName(n), n])).values()]
const latinOf = (n: string) => findSpecies7110(n)?.latin ?? n
/** Gatunki po nazwie z katalogu – synonimy i zapis polski liczone raz. */
const distinct = (names: string[]) => [...new Map(names.map((n) => [latinOf(n), latinOf(n)])).values()]

/** Suma pokrycia wierszy spełniających warunek; undefined, gdy żaden nie ma pokrycia. */
function sumWhere(value: unknown, pred: (name: string) => boolean): number | undefined {
  const covers = speciesRows(value)
    .filter((r) => r.name?.trim() && pred(r.name.trim()))
    .map((r) => num(r.cover))
    .filter((v): v is number => v !== undefined)
  return covers.length ? round1(covers.reduce((a, b) => a + b, 0)) : undefined
}

const noteOf = (i: InputValues) => String(i.note ?? '').trim()
const noteInput = (placeholder: string): FieldDef => ({
  kind: 'textarea',
  name: 'note',
  label: 'Opis (opcjonalnie)',
  rows: 2,
  placeholder,
  help: 'Krótki opis, który trafi do „wartości” w karcie zamiast tekstu zbudowanego z pomiarów – np. wartość i opis wskaźnika jak w karcie papierowej.',
})

const pctInput = (name: string, label: string, help: string): FieldDef => ({ kind: 'number', name, label, unit: '%', min: 0, max: 100, help })

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'other', label: 'Inne kombinacje (np. niewielki ubytek na rzecz boru bagiennego)', grade: 'U1' },
  { value: 'decline', label: 'Wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub danymi z literatury', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]

const ALIEN_AMOUNT: GradedOption[] = [
  { value: 'none', label: 'Brak gatunków inwazyjnych', grade: 'FV' },
  { value: 'seedlings', label: 'Tylko pojedyncze siewki, które nie przeżywają (np. dąb czerwony)', grade: 'FV' },
  { value: 'present', label: 'Gatunki inwazyjne obecne (podaj pokrycie)', grade: 'U1' },
]

const WATER: GradedOption[] = [
  { value: 'high', label: 'Przy chodzeniu po torfowisku woda zawsze widoczna co najmniej do wysokości podeszwy (do 10 cm)', grade: 'FV' },
  { value: 'mid', label: 'Ślady przesuszenia, woda ujawnia się tylko w obniżeniach (ok. 10–30 cm)', grade: 'U1' },
  { value: 'low', label: 'Torfowisko wyraźnie przesuszone (woda głębiej niż 30 cm)', grade: 'U2' },
]

const SURFACE: GradedOption[] = [
  {
    value: 'hummockHollow',
    label: 'Dobrze wykształcony mszar kępkowo-dolinkowy: kępy (zwykle >10 cm ponad dolinkami) z torfowcami brunatnymi i czerwonymi, dolinki dobrze uwodnione',
    grade: 'FV',
  },
  {
    value: 'continental',
    label: 'Naturalny mszar dywanowy torfowiska kontynentalnego z dominacją torfowców brunatnych i czerwonych (struktura kępkowo-dolinkowa tu nie występuje)',
    grade: 'FV',
  },
  {
    value: 'carpet',
    label: 'Mszar dywanowy z nieznacznie wyniesionymi (kilka cm) płatami torfowców kępkowych i niżej położonymi płatami z torfowcem kończystym, turzycą bagienną, przygiełką',
    grade: 'U1',
  },
  { value: 'partial', label: 'Struktura kępkowo-dolinkowa tylko na części transektu albo erozja kęp', grade: 'U1' },
  {
    value: 'none',
    label: 'Brak struktury kępkowo-dolinkowej, mszar zdominowany przez jeden gatunek torfowca, albo kępy budowane wyłącznie przez wełniankę pochwowatą',
    grade: 'U2',
  },
]

const PEAT: GradedOption[] = [
  { value: 'never', label: 'Brak śladów pozyskania torfu', grade: 'FV' },
  { value: 'oldSmall', label: 'Obecnie brak; w przeszłości (ponad 30 lat temu) na niewielką skalę (do 5% torfowiska), ślady słabo zauważalne', grade: 'FV' },
  { value: 'recentSmall', label: 'Obecnie brak; na niewielką skalę (do 5%), ale w ciągu ostatnich 30 lat', grade: 'U1' },
  { value: 'pastLarge', label: 'W przeszłości na znacznie większą skalę (powyżej 5% torfowiska), wyraźne ślady; obecnie brak', grade: 'U1' },
  { value: 'sporadic', label: 'Obecnie pozyskiwanie sporadyczne i na bardzo małą skalę', grade: 'U1' },
  { value: 'large', label: 'Pozyskiwanie na dużą skalę przez miejscową ludność albo pozyskanie przemysłowe', grade: 'U2' },
]

const DRAINAGE: GradedOption[] = [
  {
    value: 'none',
    label: 'Brak rowów i kanałów odwadniających torfowisko albo infrastruktura w wystarczającym stopniu zneutralizowana działaniami ochronnymi (zasypanie rowów, zastawki)',
    grade: 'FV',
  },
  {
    value: 'weak',
    label: 'Sieć rowów oddziałuje w niewielkim stopniu (brak konserwacji, częściowe uszkodzenie, naturalne zarastanie rowów, zastawki)',
    grade: 'U1',
  },
  { value: 'strong', label: 'Istniejąca infrastruktura melioracyjna wyraźnie pogarsza warunki wodne torfowiska', grade: 'U2' },
]

const PEAT_METHOD = [
  { value: '', label: '— nie dotyczy / nie wiadomo —' },
  { value: 'manual', label: 'ręczny (chałupniczy)' },
  { value: 'industrial', label: 'mechaniczny / przemysłowy' },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

// ---------- gatunki charakterystyczne ----------

export function characteristic7110(i: InputValues) {
  const names = uniq(rowNames(i.species))
  const sphagna = distinct(names.filter(isCharSphagnum7110))
  const vascular = distinct(names.filter(isCharVascular7110))
  const other = names.filter((n) => !isCharSphagnum7110(n) && !isCharVascular7110(n))
  return { sphagna, vascular, other, empty: names.length === 0 }
}

// ---------- torfowce ----------

/** Pokrycie torfowców i udział kępkowych: pola wpisane ręcznie mają pierwszeństwo przed listą. */
export function sphagnum7110(i: InputValues) {
  const listTotal = sumWhere(i.species, isSphagnum7110)
  const listHummock = sumWhere(i.species, isHummockSphagnum7110) ?? (listTotal !== undefined ? 0 : undefined)
  const listHollow = sumWhere(i.species, isHollowSphagnum7110) ?? 0
  const manualCover = num(i.cover)
  const manualShare = num(i.hummockShare)
  const cover = manualCover ?? listTotal
  const share =
    manualShare ?? (listTotal && listHummock !== undefined ? Math.round((listHummock / listTotal) * 100) : undefined)
  const hollowDominates = listTotal !== undefined && listHollow > (listHummock ?? 0)
  return { cover, share, coverFrom: manualCover !== undefined ? 'field' : 'list', shareFrom: manualShare !== undefined ? 'field' : 'list', hollowDominates }
}

// ---------- krzewy i drzewa ----------

export function woody7110(i: InputValues) {
  const trees = num(i.treeCover) ?? sumWhere(i.species, isTree7110)
  const shrubs = num(i.shrubCover) ?? sumWhere(i.species, isShrub7110)
  const names = uniq(rowNames(i.species))
  const listed = names.length > 0
  return {
    trees: trees ?? (listed && !names.some(isTree7110) ? 0 : undefined),
    shrubs: shrubs ?? (listed && !names.some(isShrub7110) ? 0 : undefined),
    unknown: names.filter((n) => !isTree7110(n) && !isShrub7110(n)),
  }
}

// ---------- uwodnienie ----------

const depths = (i: InputValues) => [1, 2, 3, 4, 5].map((n) => num(i[`depth${n}`])).filter((v): v is number => v !== undefined)

// ---------- ekspansywne / obce ----------

/** Łączne pokrycie: wpisane ręcznie albo suma z listy (każdy wiersz listy się liczy – to lista gatunków tego wskaźnika). */
function coverOf(i: InputValues): { total?: number; count: number; from: 'field' | 'list' | null } {
  const manual = num(i.cover)
  const { count, total } = listCover(i)
  if (manual !== undefined) return { total: manual, count, from: 'field' }
  if (!count) return { count, from: null }
  return { total, count, from: 'list' }
}

function describeList(i: InputValues, empty = 'Nie stwierdzono'): string {
  const note = noteOf(i)
  if (note) return note
  const list = describeSpecies(speciesRows(i.species))
  const manual = num(i.cover)
  if (list) return manual === undefined ? list : `${list}; łącznie ${pct(manual)}`
  if (manual === 0) return empty
  return manual === undefined ? '' : `Łącznie ${pct(manual)}`
}

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description: 'Zmiana powierzchni siedliska na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury.',
    help: `Co wybrać: jak zmieniła się powierzchnia otwartego mszaru 7110 na stanowisku od poprzedniej obserwacji (albo względem literatury, planów ochrony, ortofotomap). Powierzchnię w hektarach możesz wpisać obok – trafi do pola „wartość”.

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; inne kombinacje – U1; wyraźny spadek – U2.

Praktyka 2021: U1 zwykle przy stopniowym ubytku na korzyść boru bagiennego (91D0) albo krzewinek, U2 przy znaczącym ubytku lub zaniku. XX, gdy nie ma danych porównawczych, mszar fluktuuje albo granica 7110/91D0 jest nieostra. Przy zwarciu drzew powyżej 50% płat to już bór bagienny, nie 7110.`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się',
      U1: 'Inne kombinacje',
      U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze',
    },
    inputs: [
      { ...selectInput('Zmiana powierzchni', AREA, 'Puste, gdy oceniasz ekspercko.'), required: false },
      { kind: 'number', name: 'areaHa', label: 'Powierzchnia (opcjonalnie)', unit: 'ha', min: 0, help: 'Powierzchnia siedliska 7110 na stanowisku, jeśli ją znasz – trafi do pola „wartość”. Stanowiska PMŚ mają od kilku arów do kilkuset hektarów.' },
      noteInput('np. 3 ha, bez zmian'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => {
      const note = noteOf(i)
      if (note) return note
      const ha = num(i.areaHa)
      return [ha !== undefined ? `${plNum(ha)} ha` : '', i.choice ? labelOf(AREA, i.choice).toLowerCase() : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'characteristic',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków charakterystycznych (torfowce i rośliny naczyniowe klasy Oxycocco-Sphagnetea oraz gatunki dolinek) z procentem pokrycia transektu przez każdy gatunek.',
    help: `Co wpisać: gatunki charakterystyczne stwierdzone na transekcie, każdy z pokryciem całego transektu w % (z dokładnością do 10%). Formularz osobno liczy torfowce i rośliny naczyniowe z listy przewodnika.

Liczą się:
• torfowce: magellański Sphagnum magellanicum, brodawkowaty S. papillosum, brunatny S. fuscum, czerwonawy S. rubellum, ostrolistny S. capillifolium, Russowa S. russowii oraz dolinkowe – kończysty S. fallax, szpiczastolistny S. cuspidatum, wąskolistny S. angustifolium, bałtycki S. balticum, delikatny S. tenellum;
• rośliny naczyniowe: modrzewnica Andromeda polifolia, rosiczka okrągłolistna Drosera rotundifolia, żurawiny Oxycoccus palustris i O. microcarpus, wełnianka pochwowata Eriophorum vaginatum, wełnianeczka darniowa Baeothryon cespitosum, turzyca skąpokwiatowa Carex pauciflora, wrzosiec Erica tetralix, malina moroszka, bażyna, a także „silnie związane z torfowiskami wysokimi” bagno zwyczajne Ledum palustre i borówka bagienna Vaccinium uliginosum oraz gatunki dolinek: turzyca bagienna Carex limosa, przygiełka biała Rhynchospora alba, bagnica torfowa Scheuchzeria palustris.

Progi (tab. 2): co najmniej 3 torfowce i 2 naczyniowe – FV; co najmniej 2 i 2 – U1; 1 torfowiec i 1 naczyniowa – U2. Kombinacje poniżej U1 (np. 3 torfowce i 1 naczyniowa) formularz liczy do U2.

Wskaźnik kardynalny. Praktyka 2021: obniżano ocenę za małe pokrycie gatunków charakterystycznych i nieliczne torfowce.`,
    thresholds: {
      FV: 'Występują co najmniej 3 gatunki torfowców i 2 gatunki roślin naczyniowych spośród wymienionych gatunków charakterystycznych',
      U1: 'Występują co najmniej 2 gatunki torfowców i 2 gatunki roślin naczyniowych spośród wymienionych gatunków charakterystycznych',
      U2: 'Występuje 1 gatunek torfowca i 1 gatunek rośliny naczyniowej spośród wymienionych gatunków charakterystycznych',
    },
    inputs: [
      speciesInput(
        'Gatunki charakterystyczne na transekcie',
        'Torfowce i rośliny naczyniowe charakterystyczne z pokryciem transektu w %, np. Sphagnum magellanicum 60, Eriophorum vaginatum 50, Oxycoccus palustris 15.',
        true,
      ),
      noteInput('np. Warstwa c: bagno zwyczajne 30%…'),
    ],
    suggest: (i) => {
      const c = characteristic7110(i)
      return c.empty ? null : gradeCharacteristic7110(c.sphagna.length, c.vascular.length)
    },
    explain: (i) => {
      const c = characteristic7110(i)
      if (c.empty) return null
      return [
        `Torfowce charakterystyczne: ${c.sphagna.length}${c.sphagna.length ? ` (${c.sphagna.join(', ')})` : ''}.`,
        `Naczyniowe charakterystyczne: ${c.vascular.length}${c.vascular.length ? ` (${c.vascular.join(', ')})` : ''}.`,
        'FV od 3 + 2, U1 od 2 + 2.',
      ].join(' ')
    },
    warn: (i) => {
      const { other } = characteristic7110(i)
      return other.length ? `Nie liczą się jako charakterystyczne: ${other.join(', ')}.` : null
    },
    describe: (i) => noteOf(i) || describeSpecies(speciesRows(i.species)),
  },
  {
    id: 'dominant',
    label: 'Gatunki dominujące',
    parameter: 'structure',
    excluded: true,
    excludedNote: 'tylko opis – tab. 2 nie podaje progów, nie liczy się do oceny struktury',
    description:
      'Lista gatunków dominujących na transekcie (o pokryciu co najmniej 10%) z procentem pokrycia transektu przez każdy gatunek. Pozycja z przykładowej karty przewodnika – w tab. 1 i 2 jej nie ma.',
    help: `Co wpisać: gatunki o pokryciu transektu co najmniej 10%, z pokryciem w % (z dokładnością do 10%), we wszystkich warstwach – jak w przykładowej karcie przewodnika (Supraśl 2008: sosna 40%, bagno 30%, wełnianka 30%, torfowce).

To pozycja dokumentacyjna: przewodnik umieszcza ją w karcie, ale tab. 2 nie podaje dla niej progów, a sprawozdania 2013–2021 oceniają 9 innych wskaźników. Dlatego formularz nie podpowiada oceny i nie liczy jej do „specyficznej struktury i funkcji”. Karta wymaga wartości i oceny – wpisz ocenę ekspercką (w karcie Supraśl: FV) albo XX.

Dlaczego warto: zmiana dominantów (sosna, bagno, borówki, wrzos zamiast torfowców i wełnianki) to najprostszy zapis kierunku sukcesji między kolejnymi cyklami.`,
    thresholds: {
      FV: 'Brak progów w tab. 2 – ocena ekspercka (dominują gatunki torfowiskowe)',
      U1: 'Brak progów w tab. 2 – ocena ekspercka',
      U2: 'Brak progów w tab. 2 – ocena ekspercka (dominują drzewa, krzewinki lub gatunki ekspansywne)',
    },
    inputs: [
      speciesInput('Gatunki dominujące', 'Gatunki o pokryciu transektu co najmniej 10%, z pokryciem w %, np. Pinus sylvestris 40, Ledum palustre 30, Sphagnum magellanicum 20.'),
      noteInput('np. Warstwa a: sosna zwyczajna 40%…'),
    ],
    describe: (i) => noteOf(i) || describeSpecies(speciesRows(i.species)),
  },
  {
    id: 'sphagnum',
    label: 'Pokrycie i struktura gatunkowa torfowców',
    parameter: 'structure',
    cardinal: true,
    description:
      'Procent powierzchni transektu zajętej przez wszystkie torfowce oraz udział torfowców kępkowych (magellański, brodawkowaty, brunatny, czerwonawy, ostrolistny) w stosunku do gatunków z grupy torfowca kończystego.',
    help: `Co wpisać: torfowce na transekcie z pokryciem transektu w % – formularz policzy łączne pokrycie torfowców i udział kępkowych. Jeśli szacujesz inaczej, wpisz obie liczby ręcznie (mają pierwszeństwo przed listą).

Kępkowe (tab. 2, „z reguły gatunki o barwie czerwonej i brunatnej”): magellański Sphagnum magellanicum, brodawkowaty S. papillosum, brunatny S. fuscum, czerwonawy S. rubellum, ostrolistny S. capillifolium. Grupa torfowca kończystego (sekcja Cuspidata, „gatunki o barwie zielonej, ewentualnie żółtawej”): kończysty S. fallax, szpiczastolistny S. cuspidatum, wąskolistny, bałtycki, delikatny.

Progi (tab. 2):
• FV – torfowce ponad 50% transektu, kępkowe łącznie ponad 40% powierzchni torfowców;
• U1 – torfowce 20–50%, kępkowe 5–40% powierzchni torfowców, dominują kończysty, szpiczastolistny i inne z sekcji Cuspidata;
• U2 – torfowce poniżej 20% albo kępkowe nie występują lub zajmują najwyżej 5%, zdecydowanie dominuje grupa torfowca kończystego.
Kępkowe równo 5% – formularz liczy do U1.

Wskaźnik kardynalny. Dlaczego: torfowce budują torfowisko; przewaga kępkowych o barwie brunatnej i czerwonej odróżnia 7110 od torfowisk przejściowych 7140. Praktyka 2021: ocenę obniżano głównie za zaburzone proporcje kępkowych i dolinkowych; U2 przy dominacji S. fallax z S. squarrosum oznaczało, że płat to raczej 7140.`,
    thresholds: {
      FV: 'Całkowite pokrycie torfowców ponad 50%, torfowce magellański, brodawkowaty, brunatny, czerwonawy i ostrolistny zajmują łącznie ponad 40% powierzchni zajmowanej przez wszystkie torfowce',
      U1: 'Całkowite pokrycie torfowców 20–50%, torfowce kępkowe zajmują od 5 do 40% powierzchni torfowców, dominują torfowce kończysty, szpiczastolistny lub inne z sekcji Cuspidata',
      U2: 'Całkowite pokrycie torfowców poniżej 20%, torfowce kępkowe nie występują lub zajmują łącznie do 5% powierzchni torfowców, zdecydowanie dominuje grupa torfowca kończystego',
    },
    inputs: [
      speciesInput('Torfowce na transekcie', 'Każdy torfowiec z pokryciem transektu w %, np. Sphagnum magellanicum 60, S. rubellum 2, S. fallax 30.'),
      pctInput('cover', 'Całkowite pokrycie torfowców (gdy liczysz sam)', 'Procent powierzchni transektu zajęty przez wszystkie torfowce. Puste – liczy się suma z listy.'),
      pctInput(
        'hummockShare',
        'Udział torfowców kępkowych w powierzchni torfowców (gdy liczysz sam)',
        'Ile procent powierzchni zajętej przez torfowce zajmują kępkowe (magellański, brodawkowaty, brunatny, czerwonawy, ostrolistny). Uwaga: procent powierzchni torfowców, nie transektu. Puste – liczy się z listy.',
      ),
      noteInput('np. 40% zajęte przez torfowce, w tym…'),
    ],
    suggest: (i) => {
      const s = sphagnum7110(i)
      return s.cover === undefined || s.share === undefined ? null : gradeSphagnum7110(s.cover, s.share)
    },
    explain: (i) => {
      const s = sphagnum7110(i)
      if (s.cover === undefined && s.share === undefined) return null
      const parts = [
        s.cover !== undefined ? `Torfowce: ${pct(s.cover)} transektu${s.coverFrom === 'list' ? ' (suma z listy)' : ''}.` : 'Brak pokrycia torfowców.',
        s.share !== undefined ? `Kępkowe: ${pct(s.share)} powierzchni torfowców${s.shareFrom === 'list' ? ' (z listy)' : ''}.` : '',
        s.hollowDominates ? 'Na liście przeważa grupa torfowca kończystego (sekcja Cuspidata).' : '',
      ]
      return parts.filter(Boolean).join(' ')
    },
    warn: (i) => {
      const s = sphagnum7110(i)
      return s.cover !== undefined && s.cover > 100 ? 'Pokrycie torfowców powyżej 100% transektu – sprawdź pokrycia na liście.' : null
    },
    describe: (i) => {
      const note = noteOf(i)
      if (note) return note
      const s = sphagnum7110(i)
      const list = describeSpecies(speciesRows(i.species))
      const head = [s.cover !== undefined ? `Torfowce ${pct(s.cover)} transektu` : '', s.share !== undefined ? `kępkowe ${pct(s.share)} powierzchni torfowców` : '']
        .filter(Boolean)
        .join(', ')
      return [head, list].filter(Boolean).join(': ')
    },
  },
  {
    id: 'invasive',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    description: 'Lista gatunków obcych geograficznie z procentem pokrycia transektu przez każdy gatunek.',
    help: `Co wpisać: gatunki obce geograficznie na transekcie z pokryciem w %. Brak – wybierz „Brak gatunków inwazyjnych”.

Progi (tab. 2): brak – FV; do 5% powierzchni – U1; powyżej 5% – U2.

Praktyka: na torfowiskach wysokich obce pojawiają się rzadko. 2013–2014: nawłoć późna Solidago gigantea (Gnieździska 2), erechtites jastrzębcowaty Erechtites hieraciifolia (Ruda). 2021: erechtites w znikomym pokryciu – U1; pojedyncze siewki dębu czerwonego Quercus rubra, które nie przeżywają do kolejnych stadiów, oceny nie obniżały (opcja „tylko siewki” – FV); przymiotno kanadyjskie Conyza canadensis.`,
    thresholds: { FV: 'Brak gatunków inwazyjnych', U1: 'Gatunki inwazyjne zajmują do 5% powierzchni', U2: 'Gatunki inwazyjne zajmują powyżej 5% powierzchni' },
    inputs: [
      { ...selectInput('Czy są gatunki obce?', ALIEN_AMOUNT), name: 'amount', required: false },
      speciesInput('Gatunki obce na transekcie', 'Gatunki obce geograficznie z pokryciem transektu w %, np. Erechtites hieraciifolia 0,5.'),
      pctInput('cover', 'Łączne pokrycie gatunków obcych', 'Suma pokrycia gatunków obcych w % transektu; pojedyncze osobniki – 0,5. Puste – liczy się suma z listy.'),
      noteInput('np. Nie stwierdzono'),
    ],
    suggest: (i) => {
      if (i.amount === 'none' || i.amount === 'seedlings') return 'FV'
      const { total, count, from } = coverOf(i)
      if (from === null && i.amount !== 'present') return null
      if (total === undefined) return 'U1' // obecne, pokrycie nieznane
      if (i.amount === 'present' || count) return total > 5 ? 'U2' : 'U1'
      return gradeUpTo5(total)
    },
    explain: (i) => {
      const { total } = coverOf(i)
      return total === undefined ? null : `Łączne pokrycie gatunków obcych: ${pct(total)} (do 5% U1, powyżej U2).`
    },
    warn: (i) => {
      const unknown = uniq(rowNames(i.species)).filter((n) => !isAlien7110(n))
      return unknown.length ? `Spoza listy gatunków obcych 7110: ${unknown.join(', ')} – sprawdź, czy to na pewno gatunek obcy geograficznie.` : null
    },
    describe: (i) => {
      if (i.amount === 'none' && !noteOf(i) && !rowNames(i.species).length) return 'Nie stwierdzono'
      const d = describeList(i)
      return i.amount === 'seedlings' && !noteOf(i) ? [d, 'pojedyncze siewki, nie przeżywają'].filter(Boolean).join('; ') : d
    },
  },
  {
    id: 'expansive',
    label: 'Rodzime gatunki ekspansywne roślin zielnych',
    parameter: 'structure',
    description:
      'Lista rodzimych gatunków ekspansywnych z procentem pokrycia transektu. Świadczą o przesuszeniu (trzęślica – silne, wrzos – niewielkie zaburzenie stosunków wodnych) i eutrofizacji (trzcina).',
    help: `Co wpisać: rodzime gatunki ekspansywne na transekcie, każdy z pokryciem w %. Brak – wpisz 0 w łącznym pokryciu albo opis „Nie stwierdzono”.

Ekspansywne na torfowiskach wysokich (tab. 1, sprawozdanie 2021): wrzos zwyczajny Calluna vulgaris (niewielkie zaburzenie stosunków wodnych), trzęślica modra Molinia caerulea (silne przesuszenie), trzcina pospolita Phragmites australis (wzrost trofii), rzadziej sit rozpierzchły Juncus effusus, trzcinnik lancetowaty Calamagrostis canescens.

Progi (tab. 2): brak gatunków ekspansywnych – FV; do 5% powierzchni – U1; powyżej 5% – U2.

Uwaga z praktyki: w 2021 r. część ocen „pogorszyła się” tylko przez ścisłe stosowanie progów do wrzosu, którego udział się nie zmienił; na Przymiarkach wrzos „nie zagrażał trwałości siedliska” i ekspert dał FV. Jeśli odstępujesz od progów, uzasadnij w opisie.`,
    thresholds: { FV: 'Brak gatunków ekspansywnych', U1: 'Gatunki ekspansywne zajmują do 5% powierzchni', U2: 'Gatunki ekspansywne zajmują powyżej 5% powierzchni' },
    inputs: [
      speciesInput('Gatunki ekspansywne na transekcie', 'Rodzime gatunki ekspansywne z pokryciem transektu w %, np. Calluna vulgaris 15, Molinia caerulea 3.'),
      pctInput('cover', 'Łączne pokrycie gatunków ekspansywnych', 'Suma pokrycia gatunków ekspansywnych w % transektu. Brak – 0. Puste – liczy się suma z listy.'),
      noteInput('np. Nie stwierdzono'),
    ],
    suggest: (i) => {
      const { total, count } = coverOf(i)
      if (total === undefined) return count ? 'U1' : null
      return gradeUpTo5(total)
    },
    explain: (i) => {
      const { total, from } = coverOf(i)
      if (total === undefined) return null
      return `Łączne pokrycie gatunków ekspansywnych${from === 'list' ? ' z listy' : ''}: ${pct(total)} (brak FV, do 5% U1, powyżej U2).`
    },
    warn: (i) => {
      const unknown = uniq(rowNames(i.species)).filter((n) => !isExpansive7110(n))
      return unknown.length ? `Spoza listy ekspansywnych 7110: ${unknown.join(', ')} – liczę je do sumy, sprawdź, czy słusznie.` : null
    },
    describe: (i) => describeList(i),
  },
  {
    id: 'hydration',
    label: 'Odpowiednie uwodnienie',
    parameter: 'structure',
    cardinal: true,
    description:
      'Głębokość zalegania wody gruntowej (na torfowisku – w obrębie dolinek) względem powierzchni torfowiska, w 5 punktach co 50 m wzdłuż transektu; optymalnie odczyt z piezometru.',
    help: `Co wpisać: głębokość lustra wody poniżej powierzchni torfowiska (warstwy torfowców), w cm, w 5 punktach co 50 m wzdłuż transektu (3 w miejscach zdjęć fitosocjologicznych, 2 pomiędzy nimi). Woda nad powierzchnią – liczba ujemna. Bez sprzętu: dołek łopatką, odczekaj aż woda się ustabilizuje, zmierz taśmą. Jeśli są piezometry albo rejestratory (np. MiniDiver) – użyj odczytu.

Gdy nie mierzysz, wybierz opis z obserwacji – „przy chodzeniu woda widoczna co najmniej do podeszwy” to w praktyce FV. Pomiary mają pierwszeństwo przed opisem.

Progi (tab. 2, piezometr): równo lub do 10 cm poniżej powierzchni – FV; 10–30 cm – U1; ponad 30 cm – U2. Formularz liczy średnią z pomiarów.

Wskaźnik kardynalny. Optymalny termin pomiaru – sierpień. Praktyka 2021: U1 przy śladach przesuszenia wyższych partii, gdy obniżenia są uwodnione właściwie; U2 przy wyraźnym przesuszeniu (torfowiska bieszczadzkie). Susza obniżała oceny na 1/3 stanowisk niżowych.`,
    thresholds: {
      FV: 'Poziom wody (piezometr) równo lub do 10 cm poniżej powierzchni torfowiska – warstwy torfowców (w praktyce przy chodzeniu woda zawsze widoczna co najmniej do wysokości podeszwy)',
      U1: 'Poziom wody 10–30 cm poniżej powierzchni torfowiska',
      U2: 'Poziom wody więcej niż 30 cm poniżej powierzchni torfowiska',
    },
    inputs: [
      ...[1, 2, 3, 4, 5].map(
        (n): FieldDef => ({
          kind: 'number',
          name: `depth${n}`,
          label: `Pomiar ${n}`,
          unit: 'cm',
          min: -100,
          max: 300,
          help:
            n % 2 === 1
              ? `Pomiar w miejscu zdjęcia fitosocjologicznego (${n === 1 ? 'początek' : n === 3 ? 'środek' : 'koniec'} transektu). Głębokość wody pod powierzchnią w cm; woda nad powierzchnią – liczba ujemna.`
              : 'Pomiar pomiędzy zdjęciami fitosocjologicznymi. Głębokość wody pod powierzchnią w cm; woda nad powierzchnią – liczba ujemna.',
        }),
      ),
      { ...selectInput('Uwodnienie z obserwacji (gdy nie mierzysz)', WATER), required: false },
      noteInput('np. Torfowisko lekko przesuszone, woda na poziomie 10 cm'),
    ],
    suggest: (i) => {
      const m = mean(depths(i))
      return m !== undefined ? gradeWater7110(m) : byOption(gradeMap(WATER))(i)
    },
    explain: (i) => {
      const m = mean(depths(i))
      return m === undefined ? null : `Średnia z ${depths(i).length} pomiarów: ${plNum(round1(m))} cm poniżej powierzchni (FV do 10, U1 do 30 cm).`
    },
    describe: (i) => {
      const note = noteOf(i)
      if (note) return note
      const d = depths(i)
      if (d.length) return `Poziom wody: ${d.map(plNum).join(', ')} cm poniżej powierzchni torfowiska`
      return labelOf(WATER, i.choice)
    },
  },
  {
    id: 'surface',
    label: 'Struktura powierzchni torfowiska (obecność dolinek i kęp)',
    parameter: 'structure',
    description:
      'Rodzaj mszaru (dywanowy / kępkowo-dolinkowy), obecność dolinek i kęp i gatunki, które budują poszczególne elementy torfowiska.',
    help: `Co wybrać i opisać: 1) rodzaj mszaru – dywanowy czy kępkowo-dolinkowy; 2) czy są dolinki i kępy; 3) jakie gatunki je budują (torfowce czy rośliny zielne, np. wełnianka pochwowata).

Progi (tab. 2):
• FV – dobrze wykształcony mszar kępkowo-dolinkowy: kępy (zwykle >10 cm ponad dolinkami) z licznymi torfowcami brunatnymi i czerwonawymi (brunatny, czerwonawy, ostrolistny, Russowa), płonnikami, krzewinkami; dolinki dobrze uwodnione;
• U1 – mszar dywanowy z nieznacznie wyniesionymi (kilka cm) płatami torfowców kępkowych i niżej położonymi płatami z grupą torfowca kończystego, często z turzycą bagienną, przygiełką, turzycą dzióbkowatą, wełnianką wąskolistną;
• U2 – brak struktury kępkowo-dolinkowej, mszar zdominowany przez jeden gatunek torfowca; albo kępy budowane wyłącznie przez wełniankę pochwowatą (zbiorowisko Eriophorum vaginatum-Sphagnum fallax).

Torfowiska kontynentalne (płn.-wsch. Polska) mają naturalnie budowę mszarów dywanowych bez kęp i dolinek – przewodnik każe ograniczyć ten wskaźnik do zasięgu torfowisk kępkowo-dolinkowych. Dla nich jest opcja „naturalny mszar dywanowy torfowiska kontynentalnego” (FV) – tak oceniono Sicienko w 2021 („mszary dywanowe to typowa forma torfowisk wysokich w tej części kraju”). Wskaźnik niekardynalny.`,
    thresholds: thresholdsOf(SURFACE),
    inputs: [selectInput('Struktura powierzchni', SURFACE), noteInput('np. Zgodna z wzorcem: kępy z S. magellanicum, dolinki z Carex limosa')],
    suggest: byOption(gradeMap(SURFACE)),
    describe: (i) => noteOf(i) || labelOf(SURFACE, i.choice),
  },
  {
    id: 'peat',
    label: 'Pozyskanie torfu',
    parameter: 'structure',
    cardinal: true,
    description: 'Sposób pozyskiwania torfu (przemysłowy / ręczny), skala (szacunek rocznego wydobycia w m³, procent zniszczonego torfowiska) i przedział czasowy wydobycia.',
    help: `Co wybrać i opisać: czy i jak pozyskiwano torf na stanowisku – sposób (ręczny czy przemysłowy), skala (procent zniszczonej powierzchni, szacunek rocznego wydobycia w m³), przedział czasowy.

Progi (tab. 2):
• FV – brak pozyskania obecnie; jeżeli w przeszłości (ponad 30 lat temu), to na niewielką skalę (do 5% torfowiska), słabo zauważalne ślady;
• U1 – torf pozyskiwany w przeszłości na znacznie większą skalę (powyżej 5%), wyraźne ślady; obecnie brak albo sporadycznie i na bardzo małą skalę;
• U2 – pozyskiwanie na dużą skalę przez miejscową ludność lub pozyskanie przemysłowe.
Luka w tabeli: niewielka skala, ale w ciągu ostatnich 30 lat – formularz liczy do U1.

Uwaga (tab. 1): dawne, płytkie potorfia zwykle zarosły mszarami i w wielu kompleksach są jedynym miejscem występowania fitocenoz wysokotorfowiskowych – oceniaj skalę, czas od zakończenia eksploatacji i stopień regeneracji. Wskaźnik kardynalny. Eksploatacja za granicą stanowiska, która je odwadnia (np. czynna kopalnia obok, jak Torfowisko Karaska 2021) – opisz i wpisz też w „Oddziaływaniach”.`,
    thresholds: {
      FV: 'Brak pozyskania torfu obecnie; jeżeli w przeszłości (powyżej 30 lat), to na niewielką skalę (do 5% torfowiska), słabo zauważalne w terenie ślady pozyskiwania',
      U1: 'Torf pozyskiwany w przeszłości na znacznie większą skalę (powyżej 5% powierzchni torfowiska), wyraźnie widoczne ślady pozyskiwania, obecnie brak pozyskiwania lub pozyskiwanie sporadyczne i na bardzo małą skalę',
      U2: 'Pozyskiwanie torfu na dużą skalę przez miejscową ludność lub pozyskanie przemysłowe',
    },
    inputs: [
      selectInput('Pozyskanie torfu', PEAT),
      { kind: 'select', name: 'method', label: 'Sposób pozyskania', options: PEAT_METHOD, help: 'Ręczny: płytkie, nieregularne potorfia (zwykle do kilku arów). Przemysłowy: duże, regularne pola, maszyny. Nie dotyczy albo nie da się ustalić – zostaw „nie dotyczy / nie wiadomo”.' },
      noteInput('np. Nie ma śladów pozyskania'),
    ],
    suggest: byOption(gradeMap(PEAT)),
    describe: (i) => noteOf(i) || [labelOf(PEAT, i.choice), i.method ? `sposób: ${labelOf(PEAT_METHOD, i.method)}` : ''].filter(Boolean).join('; '),
  },
  {
    id: 'drainage',
    label: 'Melioracje odwadniające',
    parameter: 'structure',
    cardinal: true,
    description:
      'Istniejąca infrastruktura melioracyjna i jej wpływ na warunki wodne torfowiska: rowy, ich głębokość, poziom wody w rowach, czy woda w rowach odpływa czy stagnuje.',
    help: `Co wybrać i opisać: czy na stanowisku i w jego otoczeniu (zlewni) są rowy, kanały i inne urządzenia odwadniające. W opisie podaj głębokość rowów i poziom wody w nich, czy woda odpływa czy stagnuje, stan (konserwowane, zarastające, zamulone) i zastawki.

Progi (tab. 2): brak rowów albo infrastruktura zneutralizowana działaniami ochronnymi (zasypanie, zastawki) – FV; sieć rowów oddziałuje w niewielkim stopniu (brak konserwacji, częściowe uszkodzenie, naturalne zarastanie, zastawki) – U1; infrastruktura wyraźnie pogarsza warunki wodne – U2. Inaczej niż w 7120: samo naturalne zarastanie rowów to tu U1, nie FV.

Wskaźnik kardynalny – „ingerencja w warunki hydrologiczne to jeden z najważniejszych wskaźników stanu stanowiska”. Praktyka 2021: U1 także, gdy infrastruktura melioracyjna jest w sąsiedztwie badanego płatu (Bieszczady, Orawa). Oceniasz wpływ na warunki wodne, nie samą obecność rowów.`,
    thresholds: {
      FV: 'Brak sieci rowów i kanałów melioracyjnych oraz innych elementów infrastruktury melioracyjnej odwadniających torfowisko bądź infrastruktura w wystarczającym stopniu zneutralizowana na skutek podjętych działań ochronnych (zasypywanie rowów, budowa zastawek itp.)',
      U1: 'Sieć rowów melioracyjnych oraz innych elementów infrastruktury w niewielkim stopniu oddziałuje na warunki wodne torfowiska z uwagi na brak konserwacji, częściowe uszkodzenie oraz naturalne zarastanie rowów bądź też podejmowane działania ochronne, np. budowę zastawek',
      U2: 'Istniejąca infrastruktura melioracyjna wyraźnie pogarsza warunki wodne torfowiska',
    },
    inputs: [selectInput('Stan melioracji', DRAINAGE), noteInput('np. Siedlisko w głębokiej niecce wytopiskowej, obszar trudny do odwodnienia rowami')],
    suggest: byOption(gradeMap(DRAINAGE)),
    describe: (i) => noteOf(i) || labelOf(DRAINAGE, i.choice),
  },
  {
    id: 'woody',
    label: 'Obecność krzewów i drzew',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków drzew i krzewów z procentem pokrycia transektu przez każdy gatunek oraz sumaryczne pokrycie osobno dla drzew i dla krzewów. Pozwala określić tempo i kierunek zmian.',
    help: `Co wpisać: drzewa i krzewy (z podrostem) na transekcie z pokryciem w %. Formularz sumuje osobno drzewa i krzewy; korony się nakładają, więc możesz wpisać pokrycie łączne ręcznie (ma pierwszeństwo).

Krzewy w rozumieniu tab. 2 to m.in. borówka bagienna Vaccinium uliginosum i bagno zwyczajne Ledum palustre („itp.” – także borówki czarna i brusznica, kruszyna, wierzby). Bagno i borówka bagienna liczą się tu do krzewów, choć w „Gatunkach charakterystycznych” są gatunkami charakterystycznymi.

Progi (tab. 2) – ocena to gorsza z dwóch:
• drzewa: poniżej 10% FV, 10–30% U1, 30–50% U2 (powyżej 50% płat należy traktować jako bór bagienny 91D0);
• krzewy: poniżej 30% FV, 30–50% U1, powyżej 50% U2.

Wskaźnik kardynalny. Praktyka 2021: najczęściej sosna, brzozy omszona i brodawkowata, świerk, olsza, wierzby; w Sudetach kosodrzewina. Bieszczady – krzewinki (bagno, borówki) 80–95% → U2. Kilkanaście stanowisk wyłączono, bo przeszły w bór bagienny.`,
    thresholds: {
      FV: 'Pokrycie drzew poniżej 10%, krzewów (borówka bagienna, bagno zwyczajne itp.) poniżej 30%',
      U1: 'Pokrycie drzew 10–30%, krzewów 30–50%',
      U2: 'Pokrycie drzew 30–50% (powyżej 50% należy traktować jako bór bagienny), krzewów powyżej 50%',
    },
    inputs: [
      speciesInput('Drzewa i krzewy na transekcie', 'Każde drzewo i krzew (z podrostem) z pokryciem transektu w %, np. Pinus sylvestris 40, Ledum palustre 30, Vaccinium uliginosum 15.'),
      pctInput('treeCover', 'Łączne pokrycie drzew (gdy liczysz sam)', 'Pokrycie wszystkich drzew razem (z podrostem), w rzucie pionowym, w % transektu. Puste – suma drzew z listy.'),
      pctInput('shrubCover', 'Łączne pokrycie krzewów (gdy liczysz sam)', 'Pokrycie krzewów i krzewinek (borówka bagienna, bagno, borówki, kruszyna, wierzby) w % transektu. Puste – suma krzewów z listy.'),
      noteInput('np. Sosna zwyczajna Pinus sylvestris 40%'),
    ],
    suggest: (i) => {
      const w = woody7110(i)
      return worse(w.trees === undefined ? null : gradeTrees7110(w.trees), w.shrubs === undefined ? null : gradeShrubs7110(w.shrubs))
    },
    explain: (i) => {
      const w = woody7110(i)
      if (w.trees === undefined && w.shrubs === undefined) return null
      return [
        w.trees !== undefined ? `Drzewa: ${pct(w.trees)} (${gradeTrees7110(w.trees)}).` : '',
        w.shrubs !== undefined ? `Krzewy: ${pct(w.shrubs)} (${gradeShrubs7110(w.shrubs)}).` : '',
        w.unknown.length ? `Nie rozpoznano jako drzewo ani krzew: ${w.unknown.join(', ')}.` : '',
      ]
        .filter(Boolean)
        .join(' ')
    },
    warn: (i) => {
      const t = woody7110(i).trees
      return t !== undefined && t > 50 ? 'Pokrycie drzew powyżej 50% – płat należy traktować jako bór bagienny (91D0), nie 7110. Sprawdź wyznaczenie stanowiska.' : null
    },
    describe: (i) => {
      const note = noteOf(i)
      if (note) return note
      const w = woody7110(i)
      const list = describeSpecies(speciesRows(i.species))
      const sums = [w.trees !== undefined ? `drzewa ${pct(w.trees)}` : '', w.shrubs !== undefined ? `krzewy ${pct(w.shrubs)}` : ''].filter(Boolean).join(', ')
      return [list, sums ? `łącznie: ${sums}` : ''].filter(Boolean).join('; ')
    },
  },
]

// ---------- pola stanowiska ----------

const s7120 = methodology7120.siteFields
const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu (albo środka powierzchni 10×10 m na małym torfowisku), z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie.

Dlaczego: transekt ma zostać odnaleziony i powtórzony w tym samym miejscu. Sprawozdanie 2021: bez współrzędnych zdjęć z 2013 r. nie dało się rozstrzygnąć, czy zbadano ten sam płat.`

const siteFields: FieldDef[] = [
  pickField(s7120, 'siteName', {
    placeholder: 'np. Puścizna Wielka',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Supraśl”, „Puścizna Wielka”, „Gnieździska 2”. Jeśli stanowisko jest już w bazie GIOŚ, przepisz nazwę co do znaku.

Dlaczego: stanowisko to jednostka, na której obserwacje powtarza się co 2–3 lata (przewodnik) – w praktyce co 7–8 lat. Stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty.`,
  }),
  pickField(s7120, 'guid'),
  {
    kind: 'select',
    name: 'subtype',
    label: 'Podtyp siedliska',
    options: [{ value: '', label: '— nie podano —' }, ...SUBTYPES_7110.map((s) => ({ value: s, label: SUBTYPE_LABELS_7110[s] }))],
    hint: 'Nie zmienia progów – tylko opis.',
    help: `Podtyp wg poradnika ochrony siedlisk: 7110-1 niżowe torfowiska wysokie (Pomorze, Mazury, Suwalszczyzna, Polesie…) albo 7110-2 górskie torfowiska wysokie (Sudety, Karpaty – Karkonosze, Góry Izerskie, Kotlina Orawsko-Nowotarska, Bieszczady). Przykładowa karta przewodnika: „7110-1 Niżowe torfowiska wysokie”.

Progi oceny są wspólne dla obu podtypów, więc pole jest opcjonalne.`,
  },
  pickField(s7120, 'communities', {
    hint: 'Np. Ledo-Sphagnetum magellanici, Sphagnetum magellanici, Caricetum limosae (dolinki).',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Dla 7110 (klasa Oxycocco-Sphagnetea): Erico-Sphagnetum magellanici, Scirpo austriaci-Sphagnetum papillosi, zbiorowisko Sphagnum papillosum, Sphagnetum magellanici, Eriophoro vaginati-Sphagnetum recurvi, Eriophoro-Trichophoretum caespitosi, Ledo-Sphagnetum magellanici, Sphagneto-Trichophoretum alpini, zespoły z bażyną (Empetro-Trichophoretum austriaci, Sphagno robusti-Empetretum, Chamaemoro-Empetretum, Empetro-Sphagnetum fusci). W dolinkach – zbiorowiska Scheuchzerio-Caricetea nigrae (Caricetum limosae, Rhynchosporetum albae, Eriophoro angustifolii-Sphagnetum recurvi, zbiorowisko Scheuchzeria palustris).

Dlaczego: płaty dolinek z roślinnością przejściowotorfowiskową nie powinny przekraczać 50% powierzchni zdjęcia – inaczej sprawdź, czy to nie torfowisko przejściowe 7140.`,
  }),
  pickField(s7120, 'description', {
    hint: 'Położenie (niecka, kopuła, obrzeże jeziora), uwodnienie, struktura mszaru, zarastanie, rowy, potorfia.',
    help: `Syntetyczny opis stanowiska w kilku zdaniach:
• położenie i kształt torfowiska (kopuła, niecka wytopiskowa, obrzeże jeziora dystroficznego, stok górski), sąsiedztwo (bory bagienne, łąki, pola);
• stan obecny: uwodnienie, struktura kępkowo-dolinkowa albo mszar dywanowy, zarastanie drzewami i krzewinkami;
• rowy, potorfia, ślady wydeptywania, zbiór żurawiny;
• gdzie leży transekt (nadleśnictwo, oddział).

Dlaczego: 7110 to otwarte mszary zasilane wyłącznie wodą opadową, z pokryciem drzew poniżej 50%. Opis uzasadnia, że płat jest żywym torfowiskiem wysokim, a nie borem bagiennym 91D0, torfowiskiem zdegradowanym 7120 czy przejściowym 7140 – w 2021 r. kilkadziesiąt stanowisk z tych powodów wyłączono z sieci.`,
  }),
  pickField(s7120, 'areaHa', {
    label: 'Powierzchnia płatów siedliska',
    help: `Powierzchnia siedliska 7110 na stanowisku, w hektarach (przecinek dozwolony) – nie transektu (0,2 ha). Najlepiej z GIS na ortofotomapie; położenie transektu i płatów zaznacz na mapie 1:5000.

Liczba stanowisk na torfowisku zależy od jego wielkości: do 1 ha – 1 stanowisko, 1–3 ha – 2, powyżej 3 ha – 3.`,
  }),
  pickField(s7120, 'protectedAreas', { hint: 'Z kodem obszaru Natura 2000, np. „PLH200006 Ostoja Knyszyńska, Park Krajobrazowy Puszczy Knyszyńskiej”.' }),
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu', required: true, placeholder: 'N 53°11′; E 23°20′', help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', required: true, help: coordHelp('końca') },
  pickField(s7120, 'transect', {
    defaultValue: '10x200 m',
    hint: 'Standard 10×200 m; ta sama powierzchnia przy innym kształcie; płat <20 arów – 10×10 m.',
    help: `Faktyczne wymiary transektu. Standard: pas 10×200 m, zwykle linia prosta, w razie potrzeby dopasowana do topografii. Gdy dobrze zachowany płat jest za mały na 200 m (duże kompleksy często zarosły borem bagiennym), zachowaj powierzchnię i zmień kształt, np. 100×20 m albo 50×40 m. Gdy torfowisko wysokie zajmuje mniej niż 20 arów – bez transektu, stanowiskiem jest jego centralna część 10×10 m.

Dlaczego: pokrycia w karcie (%) liczy się względem powierzchni transektu – bez jego wymiarów wyniki z różnych lat są nieporównywalne.`,
  }),
  pickField(s7120, 'altitude', {
    placeholder: 'np. 145–147',
    help: 'Wysokość nad poziomem morza w metrach, z GPS albo mapy; przy różnicy wysokości – zakres (np. 145–147 m). Torfowiska wysokie występują od strefy nadbałtyckiej po wysokie partie gór.',
  }),
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 12.08.2021',
    required: true,
    hint: 'Optymalnie sierpień (w praktyce lipiec–sierpień).',
    help: `Dzień badań terenowych. Optymalny termin wg przewodnika – sierpień (wtedy też najlepiej ocenić uwodnienie). W 2021 r. badania prowadzono od 1 lipca do 31 sierpnia, 65% w sierpniu; w rezerwacie Torfowiska Doliny Izery – 1 września, z uwagi na ostoję cietrzewia (zakaz wstępu do 31 sierpnia). Przewodnik zaleca badania co najmniej raz na 3 lata, optymalnie co 2 lata.

Uwaga: przykładowa karta z przewodnika jest z 30 czerwca – to ostrzeżenie, nie błąd.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m === 7 || m === 8 ? null : 'Termin poza optymalnym oknem (sierpień, w praktyce lipiec–sierpień).'
    },
  },
  pickField(s7120, 'observer'),
]

// ---------- zdjęcia fitosocjologiczne: 3 × 25 m² co 100 m ----------

const r7120 = methodology7120.releves.fields
const LAYER_HELP = 'Zwarcie i wysokość warstw a (drzewa), b (krzewy i podrost), c (zielna i krzewinki), d (mszysta). Brak warstwy – zostaw puste albo 0.'

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia. Zdjęcia robi się co 100 m: na początku, w środku i na końcu transektu (bez transektu – w trzech blisko położonych płatach).' }),
  pickField(r7120, 'altitude'),
  pickField(r7120, 'area', {
    help: 'Powierzchnia zdjęcia w m². Standard przewodnika – 25 m² (5×5 m). W przykładowej karcie zdjęcia mają 100 i 10 m² – jeśli odstępujesz od standardu, wpisz faktyczną wartość.',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Torfowiska niżowe są zwykle płaskie (0°); w górach (przy wysokich opadach) mszary rozwijają się nawet na stromych stokach.' }),
  pickField(r7120, 'exposure'),
  ...['coverA', 'coverB', 'coverC', 'coverD', 'heightA', 'heightB', 'heightC', 'heightD'].map((n) => {
    const f = pickField(r7120, n)
    return { ...f, help: `${LAYER_HELP} ${f.help?.split('\n')[0] ?? ''}`.trim() } as FieldDef
  }),
  pickField(r7120, 'unit', {
    placeholder: 'np. Ledo-Sphagnetum magellanici typicum',
    help: 'Jednostka fitosocjologiczna zdjęcia, np. „Ledo-Sphagnetum magellanici typicum”, „Sphagnetum magellanici, Caricetum limosae (dolinki)”. Dolinki z roślinnością przejściowotorfowiskową nie powinny zajmować więcej niż 50% powierzchni zdjęcia.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w zdjęciu z ilościowością w skali Braun-Blanqueta (r, +, 1–5) i warstwą: drzewa – a, krzewy i podrost – b, zielne i krzewinki – c, mszaki i porosty – d. Ten sam gatunek w dwóch warstwach (np. sosna w a i jej siewki w c) dodaj dwa razy.',
  }),
]

export const methodology7110: Methodology = {
  code: '7110',
  name: 'Torfowiska wysokie z roślinnością torfotwórczą (żywe)',
  priority: true,
  source:
    'Stańko R. 2010, 7110 Torfowiska wysokie z roślinnością torfotwórczą (żywe), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ, s. 145–160 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014 i 2020–2021',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Na transekcie co 100 m wykonaj trzy zdjęcia fitosocjologiczne po 25 m² – na początku, w środku i na końcu. Gdy transektu nie da się wyznaczyć, zdjęcia robi się w trzech blisko położonych płatach siedliska.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Możliwości ochrony siedliska i utrzymania go w stanie niepogorszonym, przy analizie czynników realnie oddziałujących w najbliższej przyszłości: aktualny stan ochrony, czynniki naturalne i antropogeniczne, realne możliwości przeciwdziałania skutkom dawnej gospodarki.',
    help: `Weź pod uwagę: uwodnienie i jego stabilność (rowy w zlewni, susze), tempo sukcesji drzew i krzewinek (w kierunku boru bagiennego), wrzos i trzęślicę, wydeptywanie i zbiór żurawiny, eutrofizację od pól, oraz czy realne są działania ochronne: zastawki i zasypywanie rowów, usuwanie drzew i krzewów, pas buforowy od terenów rolniczych.

Progi (tab. 2): perspektywy dobre lub doskonałe, bez znacznego wpływu zagrożeń – FV; istnieją potencjalne możliwości poprawy (hamowanie odpływu wody, usuwanie drzew i krzewów) – U1; brak możliwości poprawy (np. obszar bezodpływowy i silnie przesuszony, torfowisko bez drzew, których usunięcie poprawiłoby warunki wodne) – U2.

Praktyka 2021: FV tylko przy prawidłowym, stabilnym uwodnieniu (i ochronie czynnej tam, gdzie postępuje sukcesja); U1 najczęściej przez przesuszenie i przemiany w bór bagienny; coraz częściej obniża ocenę zmiana klimatu (susza).`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Istnieją potencjalne możliwości poprawy stanu siedliska, np. poprzez hamowanie odpływu wody, usuwanie drzew i krzewów z powierzchni torfowiska itp.',
      U2: 'Brak możliwości poprawy stanu siedliska (np. obszar bezodpływowy i silnie przesuszony, torfowisko pozbawione drzew, których usunięcie poprawiłoby warunki wodne itp.)',
    },
  },

  impactCodes: [
    { code: 'A08', name: 'Nawożenie' },
    { code: 'B02', name: 'Gospodarka leśna – ogólnie' },
    { code: 'B02.03', name: 'Usuwanie podszytu' },
    { code: 'B02.04', name: 'Usuwanie martwych i umierających drzew' },
    { code: 'B02.06', name: 'Przerzedzanie drzewostanu' },
    { code: 'C01.03', name: 'Wydobywanie torfu' },
    { code: 'C01.03.01', name: 'Ręczne wycinanie torfu' },
    { code: 'C01.03.02', name: 'Mechaniczne pozyskanie torfu' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D01.02', name: 'Drogi, autostrady' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'E03.01', name: 'Pozbywanie się odpadów z gospodarstw domowych / obiektów rekreacyjnych' },
    { code: 'E03.04', name: 'Inne odpady' },
    { code: 'F04', name: 'Pozyskiwanie / usuwanie roślin lądowych, ogólnie' },
    { code: 'F04.02', name: 'Zbieractwo (grzyby, porosty, jagody)' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.04.01', name: 'Turystyka górska i wspinaczka' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'G05.07', name: 'Niewłaściwie realizowane działania ochronne lub ich brak' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02.01.02', name: 'Osuszanie terenów morskich, ujściowych, bagiennych' },
    { code: 'J02.01.03', name: 'Wypełnianie rowów, tam, stawów, sadzawek, bagien lub torfianek' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód – ogólnie' },
    { code: 'K01', name: 'Abiotyczne (powolne) procesy naturalne' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K01.03', name: 'Wyschnięcie' },
    { code: 'K01.04', name: 'Zatopienie' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'M01.02', name: 'Susze i zmniejszenie opadów' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. rosiczka okrągłolistna, bagno, bagnica torfowa; kompleks z 91D0, 7140, 3160; cietrzew.',
        help: 'Wartości przyrodnicze poza samym siedliskiem: rzadkie i chronione rośliny (rosiczki, bagnica torfowa, turzyca bagienna, malina moroszka, bażyna), zwierzęta (np. cietrzew w Górach Izerskich), inne rzadkie siedliska w kompleksie (bór bagienny 91D0, torfowiska przejściowe 7140, zagłębienia 7150, jeziora dystroficzne 3160, torfowiska zdegradowane 7120). Brak – „Nie stwierdzono”.',
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: 'Jakie działania ochronne wykonano (kiedy, kto, w jakiej skali) i z jakim skutkiem, oraz propozycje: zastawki i zasypywanie rowów (najlepiej w całej zlewni), usuwanie drzew i krzewów, pas buforowy od pól. Praktyka 2021: zastawki dawały efekt (Pobrzeże Koszalińskie, Mechacz Wielki, Bagno Kusowo), regularne usuwanie brzozy w Bieszczadach nie zatrzymało przesuszenia. Brak działań – „Brak”.',
      }
    return f
  }),

  speciesCatalog: SPECIES_7110.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer7110(s) })),
  speciesInfo: (name) => {
    const e = findSpecies7110(name)
    if (!e) return undefined
    return e.shrub ? `${GROUP_LABELS_7110[e.group]}, krzew (wskaźnik krzewów)` : GROUP_LABELS_7110[e.group]
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator7110 = (id: string): IndicatorDef => {
  const i = methodology7110.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 7110`)
  return i
}
