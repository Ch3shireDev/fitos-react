// Metodyka 7230 (górskie i nizinne torfowiska zasadowe o charakterze młak, turzycowisk i mechowisk) jako dane.
// Źródło: Koczur A. 2012, „7230 Górskie i nizinne torfowiska zasadowe o charakterze młak, turzycowisk i mechowisk”
// [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. III, GIOŚ, s. 137–151
// (tab. 1 i 2, lista wskaźników kardynalnych, karta „Za Stronią”), z praktyką oceny ze sprawozdań z monitoringu
// 2009–2011 (badania 2009), 2015–2018 (badania 2017) i 2023–2025 (badania 2024–2025). Przy rozjazdach pierwszeństwo
// ma tab. 2, a praktyka trafia do pomocy i ostrzeżeń.
// Siedlisko niepriorytetowe, region kontynentalny (7230-2, 7230-3) i alpejski (7230-1). Transekt 10×200 m (albo krótszy,
// szerszy, mniejszy, trzy płaty), trzy zdjęcia 5×5 m, pomiar wody i pH w pięciu punktach co 50 m. Wspólne z 7120: pola
// stanowiska i zdjęć, pięć pomiarów głębokości wody, sposób pozyskania torfu, „Inne informacje”.
// Tab. 2 nie podaje reguły dla „specyficznej struktury i funkcji” – formularz bierze regułę ogólną silnika (kardynalne:
// gatunki charakterystyczne, mchy, pH, ekspansywne, krzewy, uwodnienie). Ocena ogólna – „najgorszy decyduje” jak w silniku
// (wiersz tab. 2 „wszystkie FV lub dwa FV i jeden U1 → FV” to reguła sprzed erraty – jak w kartach 3140, 4060, 6130, 7140).
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, mean, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_7230,
  SPECIES_7230,
  defaultLayer7230,
  findSpecies7230,
  isAcidic7230,
  isAlien7230,
  isCharacteristic7230,
  isExpansive7230,
  isMagno7230,
  isWoody7230,
  speciesKey7230,
} from './species'

// ---------- progi liczbowe (tab. 2) ----------

/** Procent powierzchni transektu zajęty przez siedlisko: 80–100% FV; 50–80% U1; poniżej 50% U2 (80 → FV, 50 → U1). */
export const gradeShare7230 = (share: number): Grade => (share >= 80 ? 'FV' : share >= 50 ? 'U1' : 'U2')

/**
 * Gatunki charakterystyczne (tab. 2): powyżej ośmiu gatunków albo pokrycie powyżej 50% – FV; 1–3 gatunki i pokrycie
 * poniżej 20% – U2 (brak gatunków też); reszta (4–8 gatunków albo pokrycie 20–50%) – U1. Pokrycie undefined – rozstrzyga
 * tylko liczba powyżej 8; inaczej null.
 */
export function gradeCharacteristic7230(count: number, cover?: number): Grade | null {
  if (count > 8) return 'FV'
  if (cover === undefined) return null
  if (cover > 50) return 'FV'
  if (count <= 3 && cover < 20) return 'U2'
  return 'U1'
}

/**
 * Gatunki dominujące. Tab. 2 nie podaje liczb, więc (interpretacja):
 * - FV – gatunki charakterystyczne dają co najmniej 60% pokrycia wpisanych dominantów („dominują charakterystyczne”),
 * - U2 – gatunki charakterystyczne (z dominantów albo ze wskaźnika „Gatunki charakterystyczne”) dają mniej niż 40% łącznego
 *   pokrycia charakterystycznych i niecharakterystycznych dominantów („dominują gatunki nie zaliczane do charakterystycznych”),
 * - U1 – pomiędzy („brak wyraźnych dominantów, udział mniej więcej równy”).
 * `listShare` – udział charakterystycznych w pokryciu dominantów, `overallShare` – udział z uwzględnieniem pokrycia
 * gatunków charakterystycznych z ich własnego wskaźnika (undefined – nie wpisano).
 */
export function gradeDominant7230(listShare: number, overallShare = listShare): Grade {
  if (listShare >= 60) return 'FV'
  return Math.max(listShare, overallShare) >= 40 ? 'U1' : 'U2'
}

/** Całkowite pokrycie mchów: ponad 50% FV; 20–50% U1; poniżej 20% U2. */
const gradeMossCover = (c: number): Grade => (c > 50 ? 'FV' : c >= 20 ? 'U1' : 'U2')
/** Udział mchów brunatnych w powierzchni mchów: ponad 70% FV; 20–70% U1; brak albo co najwyżej 20% U2. */
const gradeBrown = (b: number): Grade => (b > 70 ? 'FV' : b > 20 ? 'U1' : 'U2')
const worse = (a: Grade, b: Grade): Grade => (a === 'U2' || b === 'U2' ? 'U2' : a === 'U1' || b === 'U1' ? 'U1' : 'FV')

/**
 * Pokrycie i struktura gatunkowa mchów (tab. 2, waloryzacja z 2012 r.): mchy ponad 50% i mchy brunatne ponad 70% powierzchni
 * mchów – FV; mchy 20–50%, mchy brunatne 20–70% – U1; mchy poniżej 20%, mchy brunatne nie występują lub zajmują co najwyżej
 * 20% (dominują torfowce) – U2. Kolumny tab. 2 łączą dwa warunki – formularz bierze gorszą z dwóch ocen (interpretacja).
 * Pokrycie mchów poniżej 20% daje U2 bez udziału brunatnych; inaczej bez udziału – null.
 */
export function gradeMosses7230(mossCover: number, brownShare?: number): Grade | null {
  const c = gradeMossCover(mossCover)
  if (c === 'U2') return 'U2'
  if (brownShare === undefined) return null
  return worse(c, gradeBrown(brownShare))
}

/** Obce gatunki inwazyjne: brak – FV; do 5% – U1 (obecne bez pokrycia też); powyżej 5% – U2. */
export function gradeAliens7230(cover: number, present = cover > 0): Grade {
  if (!present && cover <= 0) return 'FV'
  return cover <= 5 ? 'U1' : 'U2'
}

/** Rodzime gatunki ekspansywne: brak lub pojedyncze (poniżej 1%) – FV; do 5% – U1; powyżej 5% – U2. */
export const gradeExpansive7230 = (cover: number): Grade => (cover < 1 ? 'FV' : cover <= 5 ? 'U1' : 'U2')

/** Zakres pH (tab. 2): powyżej 7 – FV; 6–7 – U1 (granice 6 i 7 też); poniżej 6 – U2. */
export const gradePh7230 = (ph: number): Grade => (ph > 7 ? 'FV' : ph >= 6 ? 'U1' : 'U2')

/** Krzewy i podrost drzew: brak lub pojedyncze (poniżej 1%) – FV; mniej niż 15% – U1 (dokładnie 15% też, luka w tab. 2); więcej – U2. */
export const gradeWoody7230 = (cover: number): Grade => (cover < 1 ? 'FV' : cover <= 15 ? 'U1' : 'U2')

/**
 * Stopień uwodnienia (tab. 2) – głębokość lustra wody pod powierzchnią w cm, woda nad powierzchnią – liczba ujemna:
 * do 2 cm nad powierzchnią, równo albo do 10 cm poniżej – FV; 2–10 cm nad albo 10–20 cm poniżej – U1; ponad 10 cm nad
 * albo ponad 20 cm poniżej – U2. Granice (−2, 10, −10, 20) – do lepszej klasy.
 */
export const gradeHydration7230 = (depth: number): Grade => (depth >= -2 && depth <= 10 ? 'FV' : depth >= -10 && depth <= 20 ? 'U1' : 'U2')

const pct = (v: number) => `${plNum(v)}%`
const round1 = (n: number) => Math.round(n * 10) / 10
const round2 = (n: number) => Math.round(n * 100) / 100
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey7230(n), n])).values()]

/** Suma pokrycia wierszy listy spełniających warunek; 'present' – są wiersze, ale bez pokrycia; undefined – brak wierszy. */
function sumCover(list: unknown, pred: (name: string) => boolean = () => true): number | 'present' | undefined {
  const rows = speciesRows(list).filter((r) => r.name?.trim() && pred(r.name.trim()))
  if (!rows.length) return undefined
  const covers = rows.map((r) => num(r.cover)).filter((c): c is number => c !== undefined)
  return covers.length ? round1(covers.reduce((a, b) => a + b, 0)) : 'present'
}

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Powierzchnia nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'minor', label: 'Powolne, niewielkie zmniejszanie się powierzchni (np. zarastanie brzegów młaki przez krzewy, trzcinę albo ziołorośla) albo powierzchnia stabilna, lecz mała w stosunku do potencjalnej', grade: 'U1' },
  { value: 'decrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi z literatury', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania (pierwsze badanie)', grade: 'XX' },
]
const HYDRATION: GradedOption[] = [
  { value: 'wet', label: 'Woda podczas chodzenia wypływa na powierzchnię (co najmniej do wysokości podeszwy), bez zalewania', grade: 'FV' },
  { value: 'shallowFlood', label: 'Płytko zalane – 2–10 cm wody nad powierzchnią', grade: 'U1' },
  { value: 'surfaceDry', label: 'Oznaki przesuszenia powierzchniowej warstwy torfu', grade: 'U1' },
  { value: 'deepFlood', label: 'Zalane – ponad 10 cm wody nad powierzchnią (np. przez bobry)', grade: 'U2' },
  { value: 'dry', label: 'Młaka wyraźnie przesuszona', grade: 'U2' },
]
const PEAT: GradedOption[] = [
  { value: 'none', label: 'Brak pozyskania torfu', grade: 'FV' },
  { value: 'oldSmall', label: 'Pozyskanie dawne (ponad 30 lat temu), na niewielką skalę (do 5% torfowiska), ślady słabo zauważalne', grade: 'FV' },
  { value: 'recentSmall', label: 'Pozyskanie zakończone w ostatnich 30 latach, na niewielką skalę', grade: 'U1' },
  { value: 'pastLarge', label: 'Pozyskanie w przeszłości na znacznie większą skalę (ponad 5% torfowiska), wyraźne ślady eksploatacji; obecnie brak', grade: 'U1' },
  { value: 'sporadic', label: 'Obecnie pozyskanie sporadyczne, na bardzo małą skalę', grade: 'U1' },
  { value: 'large', label: 'Pozyskiwanie torfu na dużą skalę przez miejscową ludność lub eksploatacja przemysłowa', grade: 'U2' },
]
const DRAINAGE: GradedOption[] = [
  { value: 'none', label: 'Brak sieci rowów i kanałów melioracyjnych oraz innych elementów infrastruktury odwadniających torfowisko', grade: 'FV' },
  { value: 'neutralized', label: 'Infrastruktura w wystarczającym stopniu „zneutralizowana” działaniami ochronnymi (zasypane rowy, zastawki)', grade: 'FV' },
  { value: 'oldInactive', label: 'Tylko ślady starych, wypłyconych rowów, bez odpływu wody', grade: 'FV' },
  { value: 'weak', label: 'Rowy (albo koleiny, drogi, szlaki zrywkowe pełniące ich rolę) oddziałują na warunki wodne w niewielkim stopniu (brak konserwacji, częściowe uszkodzenie, zarastanie, częściowe działania ochronne)', grade: 'U1' },
  { value: 'strong', label: 'Istniejąca infrastruktura melioracyjna wyraźnie pogarsza warunki wodne torfowiska', grade: 'U2' },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

const noteInput = (label: string, placeholder: string, help: string): FieldDef => ({ kind: 'textarea', name: 'note', label, rows: 2, placeholder, help })
const note = (i: InputValues) => String(i.note ?? '').trim()

const NONE_FIELD = (label: string, help: string): FieldDef => ({
  kind: 'select',
  name: 'none',
  label,
  options: [
    { value: '', label: '—' },
    { value: 'yes', label: 'Nie stwierdzono' },
  ],
  help,
})

const GRADE_CHOICE = (help: string, withXX = false): FieldDef => ({
  kind: 'select',
  name: 'choice',
  label: 'Ocena (opcjonalnie)',
  options: [{ value: '', label: '—' }, ...(['FV', 'U1', 'U2'] as const).map((g) => ({ value: g, label: g })), ...(withXX ? [{ value: 'XX', label: 'XX – nie oceniono' }] : [])],
  help,
})
const chosenGrade = (i: InputValues): Grade | null => {
  const g = String(i.choice ?? '')
  return g === 'FV' || g === 'U1' || g === 'U2' || g === 'XX' ? g : null
}

const totalInput = (label: string, help: string): FieldDef => ({ kind: 'number', name: 'total', label, unit: '%', min: 0, max: 100, help })

const describeList = (i: InputValues) => {
  if (note(i)) return note(i)
  const list = describeSpecies(speciesRows(i.species))
  const t = num(i.total)
  if (list) return t !== undefined ? `${list} – łącznie ${pct(t)}` : list
  if (t !== undefined) return `Łącznie ${pct(t)}`
  return i.none === 'yes' ? 'Brak' : ''
}

// ---------- podtypy (sprawozdanie 2009–2011) ----------

export const SUBTYPES_7230 = ['7230-1', '7230-2', '7230-3'] as const
export const SUBTYPE_LABELS_7230: Record<(typeof SUBTYPES_7230)[number], string> = {
  '7230-1': '7230-1 – Młaki górskie',
  '7230-2': '7230-2 – Torfowiska zasadowe Polski południowej (z wyłączeniem gór) i środkowej',
  '7230-3': '7230-3 – Torfowiska źródliskowe i przepływowe Polski północnej',
}
export const SUBTYPE_OPTIONS: SelectOption[] = [{ value: '', label: '—' }, ...SUBTYPES_7230.map((s) => ({ value: s, label: SUBTYPE_LABELS_7230[s] }))]

// ---------- gatunki charakterystyczne ----------

const characteristicNames = (i: InputValues) => distinct(rowNames(i.species).filter(isCharacteristic7230))
function characteristicCount(i: InputValues): number | undefined {
  const c = num(i.count)
  if (c !== undefined) return c
  return rowNames(i.species).length ? characteristicNames(i).length : undefined
}
function characteristicCover(i: InputValues | undefined): number | undefined {
  if (!i) return undefined
  const t = num(i.total)
  if (t !== undefined) return t
  const c = sumCover(i.species, isCharacteristic7230)
  return typeof c === 'number' ? c : undefined
}

// ---------- gatunki dominujące ----------

const characteristicOf = (ctx?: IndicatorContext) => ctx?.indicators?.characteristic?.inputs

interface DominantShares {
  /** Udział (%) charakterystycznych w pokryciu dominantów. */
  list: number
  /** Udział (%) po dołożeniu pokrycia gatunków charakterystycznych ze wskaźnika „Gatunki charakterystyczne”; undefined – nie wpisano. */
  overall?: number
  /** Pokrycie dominantów niecharakterystycznych. */
  other: number
  /** Pokrycie gatunków charakterystycznych ze wskaźnika „Gatunki charakterystyczne”. */
  characteristic?: number
}

function dominantShares(i: InputValues, ctx?: IndicatorContext): DominantShares | undefined {
  const all = sumCover(i.species)
  if (typeof all !== 'number' || all <= 0) return undefined
  const chRaw = sumCover(i.species, isCharacteristic7230)
  const ch = typeof chRaw === 'number' ? chRaw : 0
  const other = round1(all - ch)
  const list = Math.round((ch / all) * 100)
  const c = characteristicCover(characteristicOf(ctx))
  if (c === undefined) return { list, other }
  const charTotal = Math.max(c, ch)
  const overall = charTotal + other > 0 ? Math.round((charTotal / (charTotal + other)) * 100) : list
  return { list, overall, other, characteristic: c }
}

// ---------- mchy ----------

const mossesOf = (i: InputValues) => ({ m: num(i.mossCover), b: num(i.brownShare), s: num(i.sphagnumShare) })

// ---------- zakres pH ----------

const POINTS = [1, 2, 3, 4, 5] as const
const phs = (i: InputValues) => POINTS.map((n) => num(i[`ph${n}`])).filter((v): v is number => v !== undefined)
/** pH do oceny: średnia z pomiarów, a bez nich środek zakresu min–max. */
function phOf(i: InputValues): number | undefined {
  const m = mean(phs(i))
  if (m !== undefined) return round2(m)
  const lo = num(i.phMin)
  const hi = num(i.phMax)
  if (lo !== undefined && hi !== undefined) return round2((lo + hi) / 2)
  return lo ?? hi
}
function phRange(i: InputValues): [number, number] | undefined {
  const vals = phs(i)
  if (vals.length) return [Math.min(...vals), Math.max(...vals)]
  const lo = num(i.phMin)
  const hi = num(i.phMax)
  if (lo === undefined && hi === undefined) return undefined
  return [lo ?? hi!, hi ?? lo!]
}

// ---------- stopień uwodnienia ----------

const depths = (i: InputValues) => POINTS.map((n) => num(i[`depth${n}`])).filter((v): v is number => v !== undefined)
const meanDepth = (i: InputValues) => mean(depths(i))
const hydrationOf = (i: InputValues): number | undefined => num(i.piezometer) ?? meanDepth(i)
const depthText = (d: number) => (d < 0 ? `${plNum(-d)} cm nad powierzchnią` : `${plNum(d)} cm poniżej powierzchni`)

// ---------- wskaźniki ----------

const SURFACE = 'w % powierzchni transektu (w płatach siedliska; dla „<1%” albo pojedynczych osobników wpisz 0,5)'
const h7120 = methodology7120.indicators.find((x) => x.id === 'hydration')!.inputs
const peat7120 = methodology7120.indicators.find((x) => x.id === 'peat')!.inputs
const methodField = pickField(peat7120, 'method')
const PEAT_METHOD: SelectOption[] = methodField.kind === 'select' ? methodField.options : []

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description:
      'Wielkość powierzchni zajmowanej przez siedlisko 7230, ale przede wszystkim jej rozmiary w stosunku do siedliska potencjalnego (czy zajmuje cały obszar, na którym występują sprzyjające mu warunki) i jej dynamika – czy jest stabilna, zwiększa się, czy zmniejsza, np. w wyniku zarastania przez krzewy.',
    help: `Co wybrać: czy powierzchnia młaki (torfowiska alkalicznego) na stanowisku jest stabilna, rośnie, czy maleje, i czy zajmuje cały obszar o sprzyjających warunkach. Samą powierzchnię wpisz obok – trafi do „wartości”, gdy nie ma opisu.

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; inne kombinacje – U1; wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub danymi z literatury – U2. Przy pierwszym badaniu bez danych do porównania – XX albo ocena ekspercka.

Praktyka: przewodnik i sprawozdanie 2009 – bardzo małe obiekty (od 0,01 ha) nie muszą być oceniane negatywnie, jeśli ich powierzchnia odpowiada potencjalnej; liczy się dynamika. 2017: U1 przy zmniejszaniu się powierzchni w wyniku zarastania drzewami, krzewami lub trzciną „albo gdy siedlisko zajmuje małą powierzchnię, nawet stabilną”; U2 po zalaniu części transektu przez bobry (Puścizna Rękowiańska N) i przy spadku do ok. 15 arów (Wołosate). 2024: U2 na 44% stanowisk w górach i 36% na niżu – siedlisko zanika na rzecz łąk, ziołorośli i zarośli, zwykle wraz z przesuszeniem; 16 stanowisk na niżu bez siedliska. Karta z przewodnika: „Jednorodna, zwarta powierzchnia siedliska zapewnia ciągłość istnienia młaki eutroficznej” → FV.`,
    thresholds: { FV: 'Nie podlega zmianom lub zwiększa się', U1: 'Inne kombinacje', U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze' },
    inputs: [
      selectInput('Zmiana powierzchni', AREA, 'Jak zmieniła się powierzchnia siedliska od poprzedniego badania i czy zajmuje cały obszar o sprzyjających warunkach.'),
      { kind: 'text', name: 'areaText', label: 'Powierzchnia (opcjonalnie)', placeholder: 'np. 1,44 ha', help: 'Powierzchnia płatów siedliska na stanowisku, np. „1,44 ha” – trafi do pola „wartość”, gdy nie ma opisu.' },
      noteInput('Opis (opcjonalnie)', 'np. Jednorodna, zwarta powierzchnia siedliska zapewnia ciągłość istnienia młaki.', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => note(i) || String(i.areaText ?? '').trim() || labelOf(AREA, i.choice),
  },
  {
    id: 'share',
    label: 'Procent powierzchni zajęty przez siedlisko na transekcie',
    parameter: 'structure',
    description: 'Procent powierzchni transektu zajęty przez siedlisko 7230. Wskaźnik w sposób pośredni określa strukturę przestrzenną i stopień fragmentacji siedliska na stanowisku.',
    help: `Co wpisać: jaką część powierzchni transektu zajmują płaty młaki (reszta to np. wilgotna łąka, ziołorośla, szuwar, zarośla wierzbowe, zalew bobrowy).

Progi (tab. 2): 80–100% – FV; 50–80% – U1; poniżej 50% – U2. Granicę 80% formularz liczy do FV, 50% – do U1.

Praktyka: w górach transekt dopasowuje się do wielkości młaki, więc siedlisko powinno zajmować ok. 100% – odchylenia to miejsca z obniżonym poziomem wody (na nieużytkowanych młakach zarośla wierzbowe, na koszonych mokre łąki). Sprawozdanie 2016–2018 postuluje, by w regionie alpejskim (i na niżu przy podobnym układzie) badać trzy, nawet izolowane młaki i dawać wtedy XX – otoczenie innymi siedliskami nie obniża ich wartości (tak oceniono Raszów, gdzie transektu nie wyznaczono). 2024: U2 na 53% stanowisk w górach i 32% na niżu (często 0% albo 10–40%). Karta z przewodnika: 100% → FV.`,
    thresholds: { FV: '80–100%', U1: '50–80%', U2: 'Poniżej 50%' },
    inputs: [
      { kind: 'number', name: 'share', label: 'Udział siedliska na transekcie', unit: '%', min: 0, max: 100, help: 'Procent powierzchni transektu zajęty przez siedlisko 7230. Najprościej: przejdź transekt i oszacuj, jaką część jego długości (przy pasie 10 m szerokości – powierzchni) zajmują płaty młaki.' },
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed udziałem (np. trzy izolowane młaki zamiast transektu – XX wg postulatu z 2018 r.). „XX – nie oceniono”, gdy wskaźnika nie badano. Uzasadnij w opisie.', true),
      noteInput('Opis (opcjonalnie)', 'np. Transekt wyznaczony w największym kompleksie młak, tak by nie obejmował innych zbiorowisk.', 'Krótki opis, który trafi do „wartości” w karcie zamiast liczby.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const s = num(i.share)
      return s === undefined ? null : gradeShare7230(s)
    },
    explain: (i) => {
      if (chosenGrade(i)) return null
      const s = num(i.share)
      return s === undefined ? null : `Siedlisko zajmuje ${pct(s)} transektu.`
    },
    warn: (i) => {
      const g = chosenGrade(i)
      const s = num(i.share)
      if (!g || g === 'XX' || s === undefined || g === gradeShare7230(s)) return null
      return `Wybrano ${g}, a z udziału wychodzi ${gradeShare7230(s)} – uzasadnij w opisie.`
    },
    describe: (i) => {
      const s = num(i.share)
      const v = s === undefined ? '' : pct(s)
      return note(i) ? (v ? `${v}. ${note(i)}` : note(i)) : v
    },
  },
  {
    id: 'characteristic',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków charakterystycznych dla danego zbiorowiska roślinnego i wyższych jednostek syntaksonomicznych: Caricetalia davallianae i Scheuchzerio-Caricetea (gatunki typowe dla siedlisk alkalicznych) oraz ich udział procentowy na transekcie. Opisuje stan zachowania i specyficzne bogactwo gatunkowe zbiorowisk roślinnych na stanowisku.',
    help: `Co wpisać: gatunki charakterystyczne stwierdzone na transekcie – rośliny naczyniowe i mchy – każdy z pokryciem ${SURFACE}. Liczbę gatunków i łączne pokrycie możesz też wpisać wprost.

Progi (tab. 2): powyżej ośmiu gatunków charakterystycznych lub pokrycie gatunków charakterystycznych na transekcie powyżej 50% – FV; 4–8 gatunków lub pokrycie 20–50% – U1; 1–3 gatunki i pokrycie poniżej 20% – U2 (brak gatunków też U2). Pokrycie to suma pokryć gatunków (warstwa mchów i zielna się nakładają, więc może przekroczyć 100%).

Jak liczy formularz: ocena wybrana w polu ma pierwszeństwo; bez niej liczba wpisana wprost albo gatunki z listy, które katalog zna jako charakterystyczne (synonimy raz), i pokrycie wpisane wprost albo suma pokryć tych gatunków. Katalog: lista z pkt 4 przewodnika (rząd Caricetalia davallianae i związek Caricion davallianae, gatunki klasy Scheuchzerio-Caricetea zasiedlające głównie siedliska alkaliczne, gatunki poszczególnych zespołów – także torfowiec obły i torfowiec Warnstorfa) oraz gatunki klasy Scheuchzerio-Caricetea, które eksperci liczyli w 2024 r. (turzyca obła, nitkowata, strunowa, bagienna, dzióbkowata, bobrek, rosiczka długolistna, pływacz drobny, drabinowiec mroczny, mokradłosz olbrzymi, bagiennik żmijowaty, limprichtia długokończysta).

Praktyka: 2009 i 2017 – na wielu młakach górskich tylko 2–3 gatunki, ale przynajmniej jeden rośnie masowo (kozłek całolistny, na niżu marzyca ruda – co najmniej 30% powierzchni) – stąd próg pokrycia. 2017: wiele zmian FV → U1 to „zmiany pozorne” po przyjęciu progów z 2012 r.; na niżu częściej liczono mchy. Bobrek: w 2017 r. w Wetlinie przestano go liczyć (optimum na kwaśniejszych torfowiskach przejściowych), w 2024 r. liczono. 2024: FV na 69% stanowisk w górach i 63% na niżu, najwięcej gatunków – 27 (Bory Wylewisko) i 28–30 (Bagno Stawek, Luboń). Karta z przewodnika: kozłek całolistny 5%, kruszczyk błotny 2%, ponikło skąpokwiatowe 1%, turzyca Davalla 10%, prosowata 10%, żółta 1%, wełnianka szerokolistna 2%, błyszcze włoskowate 1%, limprichtia pośrednia 5%, złocieniec gwiazdkowaty 5% → FV (10 gatunków).

Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Powyżej ośmiu gatunków charakterystycznych lub pokrycie gatunków charakterystycznych na transekcie powyżej 50%',
      U1: '4–8 gatunków charakterystycznych lub pokrycie na transekcie 20–50%',
      U2: '1–3 gatunki charakterystyczne, pokrycie na transekcie poniżej 20%',
    },
    inputs: [
      speciesInput('Gatunki charakterystyczne', `Gatunki charakterystyczne stwierdzone na transekcie z pokryciem ${SURFACE}, np. Valeriana simplicifolia 5, Carex davalliana 10, Campylium stellatum 5.`),
      { kind: 'number', name: 'count', label: 'Liczba gatunków charakterystycznych (opcjonalnie)', min: 0, help: 'Łączna liczba gatunków charakterystycznych na transekcie, wpisana wprost – ma pierwszeństwo przed liczeniem z listy.' },
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków charakterystycznych w % transektu – ma pierwszeństwo przed sumą z listy (np. gdy mierzysz pokrycie płatów, a nie gatunków).'),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed liczbą gatunków i pokryciem (np. gdy listę zawyżają gatunki młak kwaśnych). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Warstwa C: kozłek całolistny Valeriana simplicifolia – 5%, …', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const c = characteristicCount(i)
      return c === undefined ? null : gradeCharacteristic7230(c, characteristicCover(i))
    },
    explain: (i) => {
      if (chosenGrade(i)) return null
      const c = characteristicCount(i)
      if (c === undefined) return null
      const cover = characteristicCover(i)
      const names = characteristicNames(i)
      const head = num(i.count) !== undefined ? `Gatunków charakterystycznych: ${plNum(c)}` : `Gatunki charakterystyczne z katalogu: ${names.length}${names.length ? ` (${names.join(', ')})` : ''}`
      if (cover !== undefined) return `${head}; łączne pokrycie ${pct(cover)}.`
      return c > 8 ? `${head}.` : `${head}. Przy 8 gatunkach i mniej o ocenie decyduje też pokrycie – wpisz je przy gatunkach albo łącznie.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      const other = names.filter((n) => !isCharacteristic7230(n))
      if (other.length) parts.push(`Nie liczą się jako charakterystyczne: ${other.join(', ')}.`)
      const acidic = names.filter((n) => isCharacteristic7230(n) && isAcidic7230(n))
      const cover = characteristicCover(i)
      const acidicCover = sumCover(i.species, (n) => isCharacteristic7230(n) && isAcidic7230(n))
      if (acidic.length && typeof acidicCover === 'number' && cover !== undefined && cover > 0 && acidicCover * 2 > cover)
        parts.push(`${acidic.join(', ')} – gatunek kwaśniejszych torfowisk przejściowych daje ponad połowę pokrycia; w 2017 r. przy jego dominacji nie liczono go jako diagnostycznego (Wetlina) – rozważ ocenę ekspercką.`)
      const g = chosenGrade(i)
      const c = characteristicCount(i)
      const calc = c === undefined ? null : gradeCharacteristic7230(c, cover)
      if (g && calc && g !== calc) parts.push(`Wybrano ${g}, a z liczby gatunków i pokrycia wychodzi ${calc} – uzasadnij w opisie.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      const c = num(i.count)
      const t = num(i.total)
      const tail = t !== undefined ? ` – łącznie ${pct(t)}` : ''
      return list ? `${list}${tail}` : c !== undefined ? `${plNum(c)} gat.${tail}` : t !== undefined ? `Łącznie ${pct(t)}` : ''
    },
  },
  {
    id: 'dominant',
    label: 'Gatunki dominujące',
    parameter: 'structure',
    description:
      'Lista gatunków dominujących na transekcie oraz ich udział procentowy. Opisuje strukturę zbiorowisk roślinnych na stanowisku oraz ich stan zachowania (ewentualnie stopień ich zniekształcenia). Odpowiada na pytanie, czy na stanowisku dominują gatunki charakterystyczne dla siedliska.',
    help: `Co wpisać: dominanty – gatunki o największym pokryciu w swojej warstwie (zwykle jeden–dwa w warstwie zielnej i w mszystej), każdy z pokryciem ${SURFACE}. Gdy dominuje gatunek niecharakterystyczny (np. skrzyp błotny), wpisz też dominujące gatunki charakterystyczne, jeśli są.

Progi (tab. 2): dominują gatunki charakterystyczne dla siedliska lub brak dominanta, lecz przeważają gatunki charakterystyczne – FV; brak wyraźnych dominantów, udział gatunków charakterystycznych dla siedliska 7230 i innych mniej więcej równy – U1; dominują gatunki nie zaliczane do charakterystycznych – U2.

Jak liczy formularz (tab. 2 nie podaje liczb – to interpretacja): gatunki charakterystyczne dają co najmniej 60% pokrycia wpisanych dominantów – FV. Inaczej porównuje pokrycie dominantów niecharakterystycznych z pokryciem gatunków charakterystycznych (z listy dominantów albo – większe – ze wskaźnika „Gatunki charakterystyczne”): charakterystyczne co najmniej 40% sumy – U1 („mniej więcej równy”), mniej – U2. Ocena wybrana w polu ma pierwszeństwo.

Praktyka: 2009 – w młakach o zaburzonej strukturze najczęściej dominował skrzyp błotny (20–50% transektu), a także turzyca pospolita, bobrek, tojeść pospolita, sitowie leśne, dziurawiec czteroboczny; w warstwie mchów drabik drzewkowaty i mokradłoszka zaostrzona. 2017: U1 przy współdominacji skrzypu błotnego i gatunków młak kwaśnych albo łąk, U2 przy dominacji turzycy pospolitej i tomki wonnej (Litawcowa) albo bobrka (Wołosate); na niżu U2 przy trzcinie i trzęślicy (Kamień – trzęślica z 20 do 70%). 2024: U2 na połowie stanowisk – trawy łąkowe, turzyca prosowata (sic – to gatunek charakterystyczny), ziołorośla, nalot olszy i sosny, zachylnik błotny. Karta z przewodnika: „Skrzyp błotny Equisetum palustre – 25%” → U1 (gatunki charakterystyczne razem ok. 42%).`,
    thresholds: {
      FV: 'Dominują gatunki charakterystyczne dla siedliska lub brak dominanta, lecz przeważają gatunki charakterystyczne',
      U1: 'Brak wyraźnych dominantów, udział gatunków charakterystycznych dla siedliska 7230 i innych mniej więcej równy',
      U2: 'Dominują gatunki nie zaliczane do charakterystycznych dla siedliska',
    },
    inputs: [
      speciesInput('Gatunki dominujące', `Dominanty z pokryciem ${SURFACE}, np. Equisetum palustre 25, Carex davalliana 10.`),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed udziałem liczonym z listy (np. dominacja bobrka albo turzycy prosowatej). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Skrzyp błotny Equisetum palustre – 25%.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i, ctx) => {
      const g = chosenGrade(i)
      if (g) return g
      const s = dominantShares(i, ctx)
      return s === undefined ? null : gradeDominant7230(s.list, s.overall)
    },
    explain: (i, ctx) => {
      if (chosenGrade(i)) return null
      const s = dominantShares(i, ctx)
      if (s === undefined) return rowNames(i.species).length ? 'Wpisz pokrycie dominantów – bez niego nie da się policzyć udziału.' : null
      const other = distinct(rowNames(i.species)).filter((n) => !isCharacteristic7230(n))
      const head = `Gatunki charakterystyczne dają ${s.list}% pokrycia dominantów.${other.length ? ` Niecharakterystyczne: ${other.join(', ')} (${pct(s.other)}).` : ''}`
      const tail =
        s.list < 60 && s.characteristic !== undefined
          ? ` Z pokryciem gatunków charakterystycznych ze wskaźnika (${pct(s.characteristic)}) – ${s.overall}% sumy.`
          : s.list < 60
            ? ' Wpisz gatunki charakterystyczne z pokryciem we wskaźniku „Gatunki charakterystyczne” – formularz porówna je z dominantami.'
            : ''
      return `${head}${tail} Progi 60% i 40% to interpretacja („mniej więcej równy”).`
    },
    warn: (i, ctx) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      const acidic = names.filter(isAcidic7230)
      if (acidic.length) parts.push(`${acidic.join(', ')} – gatunki młak kwaśnych; ich dominacja to sygnał zakwaszenia (Wetlina, Wołosate, Litawcowa 2017) – opisz.`)
      const magno = names.filter(isMagno7230)
      if (magno.length) parts.push(`${magno.join(', ')} – duże turzyce (Magnocaricion): w 2024 r. wśród ekspansywnych, w 2017 r. turzyca sztywna wśród dominantów charakterystycznych – rozważ ocenę ekspercką.`)
      const g = chosenGrade(i)
      const s = dominantShares(i, ctx)
      if (g && s !== undefined) {
        const calc = gradeDominant7230(s.list, s.overall)
        if (g !== calc) parts.push(`Wybrano ${g}, a z udziału gatunków charakterystycznych wychodzi ${calc} – uzasadnij w opisie.`)
      }
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => note(i) || describeSpecies(speciesRows(i.species)),
  },
  {
    id: 'mosses',
    label: 'Pokrycie i struktura gatunkowa mchów',
    parameter: 'structure',
    cardinal: true,
    description:
      'Procent powierzchni transektu zajętej przez wszystkie gatunki mchów oraz procentowy udział pokrycia przez mchy brunatne w stosunku do ilościowości torfowców. Charakteryzuje kondycję siedliska i pośrednio kierunek zachodzących procesów (ewentualną acydyfikację siedliska): mchy pierwsze reagują na obniżenie wód gruntowych, a torfowce wkraczają, gdy warstwa mchów traci kontakt z żyznymi wodami gruntowymi.',
    help: `Co wpisać:
1. Jaki procent transektu (płatów siedliska) pokrywają łącznie wszystkie mchy.
2. Jaką część tej powierzchni mchów zajmują mchy brunatne (złocieniec gwiazdkowaty, limprichtie, skorpionowiec, błyszcze, sierpowce, haczykowiec, warnstorfie, mokradłosze) – i, dla opisu, torfowce.

Przykład: mchy pokrywają 70% transektu i są to wyłącznie mchy brunatne – wpisujesz 70 i 100.

Progi (tab. 2, waloryzacja z 2012 r.): całkowite pokrycie mchów ponad 50%, mchy brunatne zajmują łącznie ponad 70% powierzchni mchów – FV; pokrycie mchów 20–50%, mchy brunatne 20–70% powierzchni mchów – U1; pokrycie mchów poniżej 20%, mchy brunatne nie występują lub zajmują co najwyżej 20% powierzchni mchów, zdecydowanie dominują torfowce – U2. Kolumny tab. 2 łączą dwa warunki bez „i/lub” – formularz bierze gorszą z dwóch ocen (np. mchy 80%, brunatne 50% → U1; mchy 30%, brunatne 10% → U2). Granice: 50% pokrycia i 70% brunatnych – U1, 20% pokrycia – U1, 20% brunatnych – U2. Do 2011 r. górna granica U1 dla mchów brunatnych wynosiła 65% (sprawozdanie 2016–2018, pkt 9).

Praktyka: w górach zwykle brak torfowców, a mchy brunatne pokrywają ponad 50% – FV; U1 przy pokryciu mchów brunatnych 30–50%, U2 przy mchach poniżej 10% (Litawcowa). Jamne 2017: na transekcie mozaika młak i łąk, w których mchów z założenia nie ma – licz w płatach siedliska. 2024: najlepiej ocenione stanowiska mają bogatą warstwę mszystą, także z torfowcami tolerującymi warunki alkaliczne (torfowiec Warnstorfa, obły) – formularz idzie za tab. 2 i ostrzega, gdy torfowce przeważają. Karta z przewodnika: „70%, wyłącznie mchy brunatne” → FV.

Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Całkowite pokrycie mchów ponad 50%, mchy brunatne zajmują łącznie ponad 70% całkowitej powierzchni zajmowanej przez wszystkie gatunki mchów',
      U1: 'Całkowite pokrycie mchów w przedziale 20–50%, mchy brunatne zajmują powierzchnię od 20 do 70% całkowitej powierzchni zajmowanej przez wszystkie gatunki mchów',
      U2: 'Całkowite pokrycie mchów poniżej 20%, mchy brunatne nie występują lub zajmują co najwyżej łączną powierzchnię do 20% całkowitej powierzchni wszystkich gatunków mchów, zdecydowanie dominują torfowce',
    },
    inputs: [
      { kind: 'number', name: 'mossCover', label: 'Całkowite pokrycie mchów na transekcie', unit: '%', min: 0, max: 100, required: true, help: 'Suma pokrycia wszystkich mszaków (mchy brunatne, torfowce i inne) w % powierzchni transektu (płatów siedliska). Porostów i ramienic nie wliczaj.' },
      { kind: 'number', name: 'brownShare', label: 'Udział mchów brunatnych w powierzchni mchów', unit: '%', min: 0, max: 100, hint: 'Procent powierzchni porośniętej przez mchy, nie całego transektu. Same mchy brunatne = 100.', help: 'Jaką część powierzchni zajętej przez mchy zajmują mchy brunatne (Campylium, Limprichtia, Scorpidium, Tomentypnum, Drepanocladus, Hamatocaulis, Warnstorfia, Calliergon…). Jeśli mchy pokrywają 40% transektu, a mchy brunatne 30% transektu, wpisz 75 (30 z 40).' },
      { kind: 'number', name: 'sphagnumShare', label: 'Udział torfowców w powierzchni mchów (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Jaką część powierzchni mchów zajmują torfowce (Sphagnum). Nie wpływa wprost na ocenę – trafia do opisu i ostrzega, gdy torfowce przeważają (zakwaszanie). W karcie z przewodnika: 0.' },
      noteInput('Opis (opcjonalnie)', 'np. 70% wyłącznie mchy brunatne.', 'Krótki opis, który trafi do „wartości” w karcie zamiast opisu wygenerowanego z liczb.'),
    ],
    suggest: (i) => {
      const { m, b } = mossesOf(i)
      return m === undefined ? null : gradeMosses7230(m, b)
    },
    explain: (i) => {
      const { m, b } = mossesOf(i)
      if (m === undefined) return null
      if (m >= 20 && b === undefined) return `Mchy ${pct(m)} – wpisz udział mchów brunatnych, od niego też zależy ocena.`
      return `Mchy ${pct(m)} transektu (${gradeMossCover(m)})${b !== undefined ? `, mchy brunatne ${pct(b)} powierzchni mchów (${gradeBrown(b)})` : ''}. Liczy się gorsza z dwóch ocen.`
    },
    warn: (i) => {
      const { m, b, s } = mossesOf(i)
      const parts: string[] = []
      if (s !== undefined && b !== undefined && s + b > 100) parts.push('Mchy brunatne i torfowce razem dają ponad 100% powierzchni mchów – sprawdź.')
      if (s !== undefined && s > 50) parts.push('Torfowce przeważają – sygnał zakwaszania; jeśli to torfowce alkalifilne (torfowiec Warnstorfa, obły), w 2024 r. oceniano je jako składnik dobrze zachowanej warstwy mszystej – rozważ ocenę ekspercką i opisz.')
      if (m !== undefined && m > 0 && m < 20 && b !== undefined && b > 70) parts.push('Niskie pokrycie mchów przy samych mchach brunatnych – sprawdź, czy liczysz tylko płaty siedliska (Jamne 2017: mozaika z łąkami).')
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const { m, b, s } = mossesOf(i)
      if (m === undefined) return ''
      return [`Pokrycie mszaków ${pct(m)}`, b !== undefined ? `mchy brunatne – ${pct(b)}` : '', s !== undefined ? `torfowce – ${pct(s)}` : ''].filter(Boolean).join(', ')
    },
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    description: 'Lista gatunków inwazyjnych (obcych geograficznie i ekologicznie) na transekcie oraz ich udział procentowy. Opisuje stopień przekształcenia siedliska.',
    help: `Co wpisać: gatunki obce z pokryciem ${SURFACE}. Łączne pokrycie możesz wpisać wprost. Na młakach i torfowiskach alkalicznych notowano: czeremchę amerykańską, dąb czerwony, kroplika żółtego, nawłoć kanadyjską i późną, niecierpka drobnokwiatowego, przymiotno białe i kanadyjskie, winobluszcz zaroślowy, sit chudy, uczep amerykański, wykę pstrą.

Progi (tab. 2): brak – FV; zajmują do 5% powierzchni – U1; zajmują powyżej 5% powierzchni – U2. 5% formularz liczy do U1, gatunek bez pokrycia (pojedyncze osobniki) – też U1.

Praktyka: siedlisko trudno zasiedlić – w górach obcych prawie nie ma. Trzcina pospolita nie jest gatunkiem obcym (Bory Wylewisko: U1 w 2009 → FV w 2017), podobnie rodzime gatunki łąkowe i ruderalne „obce ekologicznie” (Okonek 2017) – wpisz je w ekspansywnych. Gatunki tylko poza transektem, na obrzeżach siedliska, nie liczą się. U1: niecierpek drobnokwiatowy ok. 5% (Wetlina 2024), czeremcha i dąb czerwony (Torfy Orońskie); U2: kroplik żółty ok. 10% przy rowach (Bukowina 1), nawłocie (Łosiniany 2024). Karta z przewodnika: „Na stanowisku nie stwierdzono obcych gatunków” → FV.`,
    thresholds: { FV: 'Brak', U1: 'Zajmują do 5% powierzchni', U2: 'Zajmują powyżej 5% powierzchni' },
    inputs: [
      speciesInput('Obce gatunki inwazyjne', `Gatunki obce z pokryciem ${SURFACE}, np. Impatiens parviflora 5, Padus serotina 0,5.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków obcych w % transektu – ma pierwszeństwo przed sumą z listy. Dla pojedynczych osobników wpisz 0,5.'),
      NONE_FIELD('Brak gatunków obcych', 'Zaznacz „Nie stwierdzono”, gdy w płatach siedliska nie ma gatunków obcych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Na stanowisku nie stwierdzono obcych gatunków.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const present = rowNames(i.species).length > 0
      const t = num(i.total)
      if (t !== undefined) return gradeAliens7230(t, present || t > 0)
      if (!present) return i.none === 'yes' ? 'FV' : null
      const c = sumCover(i.species)
      return gradeAliens7230(typeof c === 'number' ? c : 0, true)
    },
    explain: (i) => {
      const t = num(i.total)
      if (t !== undefined) return `Łączne pokrycie gatunków obcych: ${pct(t)}.`
      const names = distinct(rowNames(i.species))
      if (!names.length) return null
      const c = sumCover(i.species)
      return c === 'present' ? `Gatunków obcych: ${names.length}, bez pokrycia – liczę jak pojedyncze osobniki (U1).` : `Gatunków obcych: ${names.length}; łączne pokrycie ${pct(c as number)}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo pokrycie nie są puste.')
      const native = names.filter((n) => findSpecies7230(n) && !isAlien7230(n))
      if (native.length) parts.push(`To nie gatunki obce: ${native.join(', ')} – rodzime ekspansywne, drzewa i krzewy mają własne wskaźniki (trzcina nie jest obca – Bory Wylewisko 2017).`)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'expansive',
    label: 'Gatunki ekspansywne roślin zielnych',
    parameter: 'structure',
    cardinal: true,
    description: 'Lista gatunków ekspansywnych na transekcie oraz ich udział procentowy. Opisuje kierunek i etap sukcesji na siedliskach zaburzonych, a w przypadku niewielkich zniekształceń sygnalizuje ewentualne zagrożenie.',
    help: `Co wpisać: rodzime gatunki ekspansywne z pokryciem ${SURFACE}. W sprawozdaniach: trzcina pospolita, trzęślica modra, sadziec konopiasty, tojeść pospolita, sitowie leśne, mięta długolistna, wiązówka błotna, ostrożeń polny, dziurawiec czteroboczny, mozga trzcinowata, olszewnik kminkolistny, śmiałek darniowy, kłosówka wełnista, pokrzywa, zachylnik błotny i duże turzyce z Magnocaricion (sztywna, prosowa, błotna). Gatunki obce wpisz w „Obcych gatunkach inwazyjnych”, drzewa i krzewy – w „Ekspansji krzewów i podrostu drzew”.

Progi (tab. 2): brak lub pojedyncze – FV; zajmują do 5% powierzchni – U1; zajmują powyżej 5% powierzchni – U2. „Pojedyncze” to pokrycie poniżej 1% (wpisz 0,5), 5% formularz liczy do U1.

Praktyka: po publikacji metodyki w 2012 r. oceny się zaostrzyły – w 2017 r. na niżu U2 z 25 do 45 stanowisk, „poprzednio eksperckie oceny były bardziej łagodne”; Złatna Huta U1 → U2 przy niezmienionym stanie. Sprawozdanie 2016–2018 postulowało progi FV do 5%, U1 5–15%, U2 ponad 15% – nie weszły. 2024: U2 na 63% stanowisk w górach i 80% na niżu (zwykle 15–40%), choć trzcina 15% w Ilance 2 dostała U1. Turzyca sztywna: w 2024 r. wśród ekspansywnych (znikome pokrycie → FV), w 2017 r. wśród charakterystycznych dominantów. Karta z przewodnika: „Sadziec konopiasty Eupatorium cannabinum – 5%” → U1.

Wskaźnik kardynalny.`,
    thresholds: { FV: 'Brak lub pojedyncze', U1: 'Zajmują do 5% powierzchni', U2: 'Zajmują powyżej 5% powierzchni' },
    inputs: [
      speciesInput('Gatunki ekspansywne', `Rodzime gatunki ekspansywne z pokryciem ${SURFACE}, np. Eupatorium cannabinum 5, Phragmites australis 3.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków ekspansywnych w % transektu – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak gatunków ekspansywnych', 'Zaznacz „Nie stwierdzono”, gdy w płatach siedliska nie ma rodzimych gatunków ekspansywnych – wtedy wskaźnik to FV.'),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed sumą pokrycia. Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Sadziec konopiasty Eupatorium cannabinum – 5%.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const t = num(i.total)
      if (t !== undefined) return gradeExpansive7230(t)
      if (!rowNames(i.species).length) return i.none === 'yes' ? 'FV' : null
      const c = sumCover(i.species, (n) => isExpansive7230(n) || !findSpecies7230(n))
      if (c === undefined) return 'FV' // same gatunki charakterystyczne, obce albo drzewa
      return c === 'present' ? null : gradeExpansive7230(c)
    },
    explain: (i) => {
      if (chosenGrade(i)) return null
      const t = num(i.total)
      if (t !== undefined) return `Łączne pokrycie gatunków ekspansywnych: ${pct(t)}.`
      const names = distinct(rowNames(i.species))
      if (!names.length) return null
      const skipped = names.filter((n) => findSpecies7230(n) && !isExpansive7230(n))
      const c = sumCover(i.species, (n) => isExpansive7230(n) || !findSpecies7230(n))
      return [
        skipped.length ? `Pominięte (charakterystyczne, towarzyszące, obce, drzewa i krzewy): ${skipped.join(', ')}` : '',
        typeof c === 'number' ? `łączne pokrycie gatunków ekspansywnych: ${pct(c)}` : c === 'present' ? 'gatunki bez pokrycia – wpisz pokrycie albo wybierz ocenę' : 'gatunków ekspansywnych: brak',
      ]
        .filter(Boolean)
        .join('; ')
        .concat('.')
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo pokrycie nie są puste.')
      const aliens = names.filter(isAlien7230)
      if (aliens.length) parts.push(`Gatunki obce wpisz we wskaźniku „Obce gatunki inwazyjne”: ${aliens.join(', ')}.`)
      const woody = names.filter(isWoody7230)
      if (woody.length) parts.push(`Drzewa i krzewy wpisz we wskaźniku „Ekspansja krzewów i podrostu drzew”: ${woody.join(', ')}.`)
      const typical = names.filter(isCharacteristic7230)
      if (typical.length) parts.push(`Gatunki charakterystyczne nie są ekspansywnymi: ${typical.join(', ')}.`)
      const companions = names.filter((n) => findSpecies7230(n)?.group === 'companion')
      if (companions.length) parts.push(`Nie liczę (gatunki towarzyszące, nie ekspansywne wg sprawozdań): ${companions.join(', ')} – jeśli się rozrastają, wybierz ocenę ekspercką.`)
      const magno = names.filter(isMagno7230)
      if (magno.length) parts.push(`${magno.join(', ')} – duże turzyce liczę jako ekspansywne (2024); w 2017 r. turzycę sztywną liczono wśród dominantów charakterystycznych.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'ph',
    label: 'Zakres pH',
    parameter: 'structure',
    cardinal: true,
    description:
      'Pomiar pH powierzchniowej warstwy torfu pH-metrem polowym lub metodą Heliga, w pięciu punktach co 50 m wzdłuż transektu (trzy w miejscach zdjęć fitosocjologicznych, jeśli to możliwe również dwa pomiędzy). Charakteryzuje obecny stan siedliska i etap sukcesji, a także stopień acydyfikacji wynikającej z przyczyn naturalnych lub antropogenicznych (obniżenie poziomu wód gruntowych).',
    help: `Co wpisać: pH powierzchniowej warstwy torfu (albo wody w dołku) w punktach pomiarowych – tych samych co pomiar wody. Gdy zapisujesz tylko zakres, wpisz minimum i maksimum.

Progi (tab. 2): powyżej 7 – FV; 6–7 – U1; poniżej 6 – U2. Formularz liczy średnią z pomiarów (bez nich – środek zakresu); pH 7,0 i 6,0 – U1.

Praktyka: pH zależy od podłoża i zasilania – najwyższe w Pieninach (do 7,9), najniższe w Beskidzie Żywieckim; na jednej młace rozrzut ponad 1 jednostki. Sprawozdanie 2016–2018 postuluje rezygnację ze wskaźnika: kardynalny, a pomiar jednorazowy jest niemiarodajny (po deszczu mierzysz deszczówkę, w suszy nie ma czego mierzyć); Hala Cebulowa – pH 5,0–6,0 (śr. 5,5) dało U2 całego stanowiska, choć reszta była FV. Eksperci odstępowali od progów: Kobyla Biel (mechowisko ze skorpionowcem, pH 6,4) – FV, Gieret (6,8, typowe dla północno-wschodniej Polski) – FV, Dłużek – bez zmiany oceny przy zawyżonym odczycie z buchtowiska. Gdy pomiar niemożliwy (przesuszenie, zalanie, stagnująca woda po ulewie) – XX (2017: 29 stanowisk, 2024: 20). Karta z przewodnika: „pH 7,2–7,6” → FV.

Wskaźnik kardynalny.`,
    thresholds: { FV: 'Powyżej 7', U1: '6–7', U2: 'Poniżej 6' },
    inputs: [
      ...POINTS.map(
        (n): FieldDef => ({
          kind: 'number',
          name: `ph${n}`,
          group: 'pH powierzchniowej warstwy torfu',
          groupCols: 5,
          label: `Punkt ${n}`,
          min: 0,
          max: 14,
          help:
            n % 2 === 1
              ? `pH w miejscu zdjęcia fitosocjologicznego (${n === 1 ? 'początek' : n === 3 ? 'środek' : 'koniec'} transektu), pH-metrem polowym albo metodą Heliga.`
              : 'pH pomiędzy zdjęciami fitosocjologicznymi (co 50 m), jeśli to możliwe.',
        }),
      ),
      { kind: 'number', name: 'phMin', label: 'pH minimalne (opcjonalnie)', min: 0, max: 14, help: 'Najniższa wartość pH, gdy zapisujesz tylko zakres (np. 7,2 z „pH 7,2–7,6”). Pomiary w punktach mają pierwszeństwo.' },
      { kind: 'number', name: 'phMax', label: 'pH maksymalne (opcjonalnie)', min: 0, max: 14, help: 'Najwyższa wartość pH, gdy zapisujesz tylko zakres (np. 7,6 z „pH 7,2–7,6”). Bez pomiarów formularz ocenia środek zakresu.' },
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed pomiarem (np. mechowisko oligo-mezotroficzne z dominacją mchów brunatnych przy pH 6,4 – Kobyla Biel 2017). „XX – nie oceniono”, gdy pomiar był niemożliwy albo niemiarodajny (przesuszenie, zalanie, ulewa). Uzasadnij w opisie.', true),
      noteInput('Opis (opcjonalnie)', 'np. pH 7,2–7,6', 'Krótki opis, który trafi do „wartości” w karcie zamiast zakresu z pomiarów.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const p = phOf(i)
      return p === undefined ? null : gradePh7230(p)
    },
    explain: (i) => {
      if (chosenGrade(i)) return null
      const p = phOf(i)
      if (p === undefined) return null
      const n = phs(i).length
      return n ? `Średnie pH z ${n} pomiarów: ${plNum(p)}.` : `Środek zakresu pH: ${plNum(p)}.`
    },
    warn: (i) => {
      const parts: string[] = []
      const r = phRange(i)
      if (r && gradePh7230(r[0]) !== gradePh7230(r[1])) parts.push(`Zakres pH ${plNum(r[0])}–${plNum(r[1])} obejmuje różne klasy – formularz bierze średnią; opisz rozrzut (sprawozdanie 2016–2018: pomiar jednorazowy bywa niemiarodajny).`)
      const lo = num(i.phMin)
      const hi = num(i.phMax)
      if (lo !== undefined && hi !== undefined && lo > hi) parts.push('pH minimalne większe niż maksymalne – sprawdź.')
      const g = chosenGrade(i)
      const p = phOf(i)
      if (g && g !== 'XX' && p !== undefined && g !== gradePh7230(p)) parts.push(`Wybrano ${g}, a z pomiaru wychodzi ${gradePh7230(p)} – uzasadnij w opisie.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const r = phRange(i)
      if (!r) return chosenGrade(i) === 'XX' ? 'Nie zmierzono' : ''
      return r[0] === r[1] ? `pH ${plNum(r[0])}` : `pH ${plNum(r[0])}–${plNum(r[1])}`
    },
  },
  {
    id: 'woody',
    label: 'Ekspansja krzewów i podrostu drzew',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków drzew i krzewów występujących na transekcie, przybliżony procent pokrycia transektu dla każdego gatunku i sumaryczne pokrycie wszystkich drzew i krzewów. Charakteryzuje zagrożenie zarośnięciem torfowiska przez formacje krzewiaste i zbiorowiska leśne.',
    help: `Co wpisać: drzewa i krzewy z pokryciem ${SURFACE} – w górach świerk, jawor, olsze, leszczyna, wierzby (śląska, uszata, szara), kalina, jesion; na niżu sosna, brzozy, olsza czarna, wierzby (szara, uszata, rokita), kruszyna. Łączne pokrycie wpisz osobno, bo korony się nakładają; bez niego formularz liczy sumę z listy. Obce drzewa (czeremcha amerykańska, dąb czerwony) wpisz w „Obcych gatunkach inwazyjnych”.

Progi (tab. 2): brak lub pojedyncze – FV; udział mniejszy niż 15% – U1; udział większy niż 15% – U2. „Pojedyncze” to pokrycie poniżej 1% (wpisz 0,5); dokładnie 15% (luka w tab. 2) formularz liczy do U1.

Praktyka: zarastanie to główny problem młak, na których zaniechano koszenia. 2017 w górach: 1–2 do ok. 15% (najczęściej ok. 10%) – U1, od kilkunastu do 40% – U2; Złatna Huta – drzewa z nasadzeń na polanie, a płat młaki nimi niezdominowany → U1. Na niżu U2 zwykle przy 20–70%; odkrzaczanie podnosiło ocenę U1 → FV (11 stanowisk). Sprawozdanie 2016–2018 postulowało progi FV do 5%, U1 5–20%, U2 ponad 20% – nie weszły. 2024: U2 na 28% stanowisk w górach i 46% na niżu. Karta z przewodnika: kalina koralowa 1%, świerk 1% → FV (ekspert uznał 2% za „pojedyncze”; formularz z tab. 2 daje U1 – w przykładzie ocena ekspercka).

Wskaźnik kardynalny.`,
    thresholds: { FV: 'Brak lub pojedyncze', U1: 'Udział mniejszy niż 15%', U2: 'Udział większy niż 15%' },
    inputs: [
      speciesInput('Drzewa i krzewy', `Rodzime drzewa i krzewy (z podrostem i siewkami) z pokryciem ${SURFACE}, np. Viburnum opulus 1, Picea abies 1.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Pokrycie wszystkich drzew i krzewów razem w rzucie pionowym, w % transektu – korony nakładające się liczy się raz. Ma pierwszeństwo przed sumą z listy. Pojedyncze drzewa – 0,5.'),
      NONE_FIELD('Brak drzew i krzewów', 'Zaznacz „Nie stwierdzono”, gdy w płatach siedliska nie ma drzew ani krzewów – wtedy wskaźnik to FV.'),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed pokryciem (np. kilka pojedynczych krzewów po ok. 1% albo drzewa z nasadzeń poza płatem młaki – Złatna Huta 2017). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Kalina koralowa Viburnum opulus – 1%, świerk pospolity Picea abies – 1%.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const t = num(i.total)
      if (t !== undefined) return gradeWoody7230(t)
      if (!rowNames(i.species).length) return i.none === 'yes' ? 'FV' : null
      const c = sumCover(i.species, (n) => !isAlien7230(n))
      if (c === undefined) return 'FV'
      return c === 'present' ? null : gradeWoody7230(c)
    },
    explain: (i) => {
      if (chosenGrade(i)) return null
      const t = num(i.total)
      if (t !== undefined) return `Łączne pokrycie drzew i krzewów: ${pct(t)}.`
      const c = sumCover(i.species, (n) => !isAlien7230(n))
      if (c === undefined) return null
      return c === 'present'
        ? 'Gatunki bez pokrycia – wpisz pokrycie albo łączne pokrycie (pojedyncze drzewa: 0,5).'
        : `Łączne pokrycie z sumy gatunków: ${pct(c)} (korony się nakładają – jeśli realnie jest mniej, wpisz łączne pokrycie).`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo pokrycie nie są puste.')
      const aliens = names.filter(isAlien7230)
      if (aliens.length) parts.push(`Gatunki obce wpisz we wskaźniku „Obce gatunki inwazyjne”: ${aliens.join(', ')}.`)
      const t = num(i.total) ?? sumCover(i.species, (n) => !isAlien7230(n))
      const g = chosenGrade(i)
      if (g && typeof t === 'number' && g !== gradeWoody7230(t)) parts.push(`Wybrano ${g}, a z pokrycia (${pct(t)}) wychodzi ${gradeWoody7230(t)} – uzasadnij w opisie.`)
      if (typeof t === 'number' && t > 50) parts.push('Drzewa i krzewy ponad 50% – sprawdź, czy płat to jeszcze 7230, a nie zarośla wierzbowe albo ols.')
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'hydration',
    label: 'Stopień uwodnienia',
    parameter: 'structure',
    cardinal: true,
    description:
      'Głębokość zalegania wody gruntowej, ewentualnie powierzchniowej, w okresie letnim – bez specjalistycznego sprzętu albo z piezometru – w pięciu punktach co 50 m wzdłuż transektu (trzy w miejscach zdjęć fitosocjologicznych, dwa pomiędzy). Ustala, na jakiej głębokości znajduje się lustro wody w stosunku do powierzchni torfowiska.',
    help: `Co wpisać: głębokość lustra wody poniżej powierzchni młaki, w cm, w 5 punktach co 50 m wzdłuż transektu (3 w miejscach zdjęć fitosocjologicznych, 2 pomiędzy nimi). Woda nad powierzchnią – liczba ujemna (np. −5 = 5 cm wody nad gruntem). Gdy na stanowisku jest piezometr, wpisz jego odczyt – ma pierwszeństwo przed średnią z pomiarów. Bez pomiarów wybierz opis z obserwacji.

Jak mierzyć: na dobrze uwodnionej młace woda wypływa spod stopy. Inaczej wykop łopatką dołek, odczekaj, aż woda się ustabilizuje, i zmierz taśmą.

Progi (tab. 2): poziom wody do 2 cm powyżej, równo albo do 10 cm poniżej powierzchni torfowiska (w praktyce woda zawsze widoczna podczas chodzenia, przynajmniej do wysokości podeszwy) – FV; 2–10 cm powyżej albo 10–20 cm poniżej – U1; ponad 10 cm powyżej albo więcej niż 20 cm poniżej – U2. Inaczej niż w torfowiskach przejściowych – zalanie też obniża ocenę. Formularz liczy średnią z pomiarów; granice (2 i 10 cm nad, 10 i 20 cm pod) – do lepszej klasy.

Praktyka: 2017 – zalanie przez bobry do kilkudziesięciu cm (Puścizna Rękowiańska N) i „przyjęcie najniższej wartości na transekcie jako podstawy oceny” (Huściawa) dały U1; stagnująca woda po ulewach na lekko przesuszonym torfie – U2 (Bagno Bubnów, Storczykowe Mechowisko). Zespół marzycy rudej dobrze znosi duże wahania wody. 2024: FV przy wodzie równo z powierzchnią albo do 5–10 cm niżej, U1 przy 10–20 cm, U2 przy ponad 30, a nawet 50 cm. Karta z przewodnika: „W miejscach wykonania zdjęć woda wypływa na powierzchnię gleby podczas chodzenia, ale stanowisko nie nosi śladów zalewania” → FV.

Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Poziom wody mierzony w piezometrze – do 2 cm powyżej, równo lub do 10 cm poniżej powierzchni torfowiska (w praktyce, w trakcie chodzenia po torfowisku woda zawsze widoczna, przynajmniej do wysokości podeszwy)',
      U1: 'Poziom wody mierzony w piezometrze – 2–10 cm powyżej lub 10–20 cm poniżej powierzchni torfowiska',
      U2: 'Poziom wody mierzony w piezometrze – ponad 10 cm powyżej lub więcej niż 20 cm poniżej powierzchni torfowiska',
    },
    inputs: [
      ...POINTS.map((n) =>
        pickField(h7120, `depth${n}`, {
          required: false,
          group: 'Głębokość lustra wody (cm poniżej powierzchni)',
          groupCols: 5,
          label: `Punkt ${n}`,
          min: -100,
          help:
            n % 2 === 1
              ? `Pomiar w miejscu zdjęcia fitosocjologicznego (${n === 1 ? 'początek' : n === 3 ? 'środek' : 'koniec'} transektu). Głębokość wody pod powierzchnią w cm; woda nad powierzchnią – liczba ujemna.`
              : 'Pomiar pomiędzy zdjęciami fitosocjologicznymi (co 50 m). Głębokość wody pod powierzchnią w cm; woda nad powierzchnią – liczba ujemna.',
        }),
      ),
      { kind: 'number', name: 'piezometer', label: 'Odczyt z piezometru (opcjonalnie)', unit: 'cm', min: -100, max: 300, help: 'Głębokość lustra wody w piezometrze, w cm poniżej powierzchni torfowiska (nad powierzchnią – liczba ujemna). Ma pierwszeństwo przed średnią z pomiarów – tab. 2 podaje progi właśnie dla piezometru.' },
      { ...selectInput('Obserwacja w terenie (bez pomiarów)', HYDRATION, 'Gdy nie mierzysz głębokości wody – wybierz opis z obserwacji. Pomiary (i piezometr) mają pierwszeństwo.', 'observed'), required: false },
      noteInput('Opis (opcjonalnie)', 'np. W miejscach wykonania zdjęć woda wypływa na powierzchnię gleby podczas chodzenia, ale stanowisko nie nosi śladów zalewania.', 'Krótki opis, który trafi do „wartości” w karcie zamiast opisu wygenerowanego z pomiarów.'),
    ],
    suggest: (i) => {
      const d = hydrationOf(i)
      if (d !== undefined) return gradeHydration7230(d)
      return byOption(gradeMap(HYDRATION), 'observed')(i)
    },
    explain: (i) => {
      const p = num(i.piezometer)
      if (p !== undefined) return `Odczyt z piezometru: ${depthText(p)}.`
      const m = meanDepth(i)
      return m === undefined ? null : `Średnia z ${depths(i).length} pomiarów: ${depthText(round1(m))}.`
    },
    warn: (i) => {
      const parts: string[] = []
      const d = hydrationOf(i)
      const o = byOption(gradeMap(HYDRATION), 'observed')(i)
      if (d !== undefined && o && o !== gradeHydration7230(d)) parts.push(`Obserwacja (${o}) nie zgadza się z pomiarami (${gradeHydration7230(d)}) – formularz bierze pomiary.`)
      const vals = depths(i)
      if (num(i.piezometer) === undefined && vals.length > 1 && d !== undefined) {
        const worst = vals.map(gradeHydration7230).reduce(worse)
        if (worst !== gradeHydration7230(d))
          parts.push(`Pojedyncze punkty dają ${worst}, średnia ${gradeHydration7230(d)} – opisz zróżnicowanie (część transektu zalana, część przesuszona); w 2017 r. bywało, że oceniano wg najgorszego punktu (Huściawa).`)
      }
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const p = num(i.piezometer)
      if (p !== undefined) return `Poziom wody w piezometrze: ${depthText(p)} torfowiska`
      const vals = depths(i)
      if (vals.length) return `Poziom wody: ${vals.map(plNum).join(', ')} cm poniżej powierzchni torfowiska (ujemne – nad powierzchnią)`
      return labelOf(HYDRATION, i.observed)
    },
  },
  {
    id: 'peat',
    label: 'Pozyskanie torfu',
    parameter: 'structure',
    description:
      'Rozmiary zniszczeń spowodowanych eksploatacją oraz ewentualny stopień regeneracji siedliska: sposób wydobycia (ręczne, mechaniczne czy na skalę przemysłową), roczne wydobycie w m³, procent powierzchni zniszczonego torfowiska oraz przedział czasowy, w którym wydobywano torf. Określa stopień dewastacji siedliska spowodowanej eksploatacją torfu.',
    help: `Co wybrać i opisać: czy i kiedy pozyskiwano torf na stanowisku, w jakiej skali i jakim sposobem. Ślady to doły potorfowe, schodkowe ściany torfu, prostokątne pola. W opisie podaj szacunkowe roczne wydobycie (m³), procent zniszczonej powierzchni i przedział czasowy.

Progi (tab. 2): brak pozyskania torfu, a jeżeli był pozyskiwany w przeszłości (powyżej 30 lat), to na niewielką skalę (do 5% torfowiska), słabo zauważalne ślady – FV; torf pozyskiwany w przeszłości na znacznie większą skalę (powyżej 5% torfowiska), wyraźnie widoczne ślady eksploatacji, obecnie brak pozyskiwania lub sporadyczne i na bardzo małą skalę – U1; pozyskiwanie na dużą skalę przez miejscową ludność lub eksploatacja przemysłowa – U2. Pozyskanie zakończone w ostatnich 30 latach, nawet małe – formularz daje U1 (FV przewiduje tylko dawne).

Praktyka: z typowych młak karpackich torfu nigdy nie pozyskiwano; w 2009 r. U2 tylko w Kotlinie Orawsko-Nowotarskiej (Bory Wylewisko, Puścizna Rękowiańska S), w 2017 r. tam FV – to były efekty wydobycia sprzed wielu lat („zmiana pozorna”). 2024: U1 tylko w Śniatyczach (nieużytkowane albo okazjonalnie użytkowane kopalnie torfu w sąsiedztwie). Karta z przewodnika: „Na stanowisku brak śladów pozyskiwania torfu” → FV.`,
    thresholds: thresholdsOf(PEAT),
    inputs: [
      selectInput('Pozyskanie torfu', PEAT, 'Kiedy i w jakiej skali pozyskiwano torf na stanowisku.'),
      pickField(peat7120, 'method', { required: false, help: 'Ręczny: płytkie, nieregularne doły, zwykle mała skala. Mechaniczny/przemysłowy: duże, regularne pola, maszyny. Nie dotyczy albo nie da się ustalić – zostaw „nie dotyczy / nie wiadomo”.' }),
      { kind: 'number', name: 'damaged', label: 'Zniszczona powierzchnia torfowiska (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Szacunkowy procent powierzchni torfowiska zniszczonej przez eksploatację. Próg 5% rozdziela w tab. 2 dawne pozyskanie „na niewielką skalę” (FV) od „na znacznie większą skalę” (U1).' },
      noteInput('Opis (opcjonalnie)', 'np. Na stanowisku brak śladów pozyskiwania torfu.', 'Krótki opis (sposób, skala, roczne wydobycie, przedział czasowy), który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(PEAT)),
    warn: (i) => {
      const d = num(i.damaged)
      if (d === undefined) return null
      if (i.choice === 'oldSmall' && d > 5) return `Zniszczono ${pct(d)} torfowiska – to więcej niż 5% z tab. 2 („na niewielką skalę”); rozważ U1.`
      if (i.choice === 'none' && d > 0) return 'Wybrano „Brak pozyskania torfu”, a wpisano zniszczoną powierzchnię – sprawdź.'
      return null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const d = num(i.damaged)
      return [labelOf(PEAT, i.choice), i.method ? `sposób: ${labelOf(PEAT_METHOD, i.method)}` : '', d !== undefined ? `zniszczone ${pct(d)} torfowiska` : '']
        .filter(Boolean)
        .join(', ')
    },
  },
  {
    id: 'drainage',
    label: 'Melioracje odwadniające',
    parameter: 'structure',
    description:
      'Rozmiary zniszczeń spowodowanych odwodnieniami oraz ewentualny stopień regeneracji siedliska: obecność infrastruktury melioracyjnej, jej stan (konserwacja rowów) oraz jej wpływ na warunki wodne torfowiska (efektywność) – rowy, ich głębokość, poziom wody w rowach, czy woda odpływa, czy stagnuje. Określa stopień dewastacji siedliska spowodowanej odwodnieniem terenu.',
    help: `Co wybrać i opisać: czy na stanowisku i w jego otoczeniu są rowy i kanały melioracyjne, czy działają i jak wpływają na uwodnienie. W opisie podaj głębokość rowów, poziom wody w nich, czy woda odpływa, czy stagnuje, zastawki i zasypania.

Progi (tab. 2): brak sieci rowów i kanałów melioracyjnych oraz innych elementów infrastruktury melioracyjnej odwadniających torfowisko bądź infrastruktura w wystarczającym stopniu „zneutralizowana” działaniami ochronnymi (zasypywanie rowów, budowa zastawek) – FV; sieć rowów w niewielkim stopniu oddziałuje na warunki wodne z uwagi na brak konserwacji, częściowe uszkodzenie, naturalne zarastanie rowów bądź podejmowane działania ochronne (zastawki, zasypywanie) – U1; istniejąca infrastruktura wyraźnie pogarsza warunki wodne torfowiska – U2.

Praktyka: liczy się wpływ na warunki wodne. 2017 w górach – FV, gdy brak rowów albo są tylko ślady starych, wypłyconych rowów bez spływu wody (opcja „Tylko ślady starych rowów”); U1 przy starych rowach o ograniczonym wpływie. Na niżu niekonserwowane rowy z zastawkami – U1 (Bagno Ławki: U2 → U1), zarastające, ale wciąż działające – U1 (Prostynia). Rolę rowów pełnią też koleiny (quady, ciężki sprzęt), wyerodowane drogi i szlaki zrywkowe oraz studnie ujęć wody (2009, 2024). Wpływ rowu bywa trudny do ustalenia – XX (Raszów 2017). Karta z przewodnika: „Na stanowisku brak jakiejkolwiek infrastruktury melioracyjnej” → FV.`,
    thresholds: thresholdsOf(DRAINAGE),
    inputs: [
      selectInput('Stan melioracji', DRAINAGE, 'Oceniasz wpływ infrastruktury (także kolein i dróg pełniących rolę rowów) na warunki wodne młaki, nie samą obecność rowów.'),
      noteInput('Opis (opcjonalnie)', 'np. Na stanowisku brak jakiejkolwiek infrastruktury melioracyjnej.', 'Krótki opis (rowy, głębokość, poziom wody, odpływ albo stagnacja, zastawki), który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(DRAINAGE)),
    describe: (i) => note(i) || labelOf(DRAINAGE, i.choice),
  },
]

// ---------- pola stanowiska ----------

const s7120 = methodology7120.siteFields
const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu (zdjęcia fitosocjologicznego nr ${where === 'początku' ? 1 : where === 'środka' ? 2 : 3}), z odbiornika GPS (WGS84). Gdy zamiast transektu są trzy izolowane płaty (małe młaki na jednej polanie) – współrzędne każdego z nich.

Dlaczego: obserwacje powtarza się co cztery lata w tym samym miejscu – tam też mierzy się poziom wody i pH.`

const siteFields: FieldDef[] = [
  {
    kind: 'select',
    name: 'subtype',
    label: 'Podtyp siedliska',
    options: SUBTYPE_OPTIONS,
    hint: 'Góry (7230-1), południe i środek niżu (7230-2) albo północ (7230-3).',
    help: `Podtyp wg sprawozdania z monitoringu 2009–2011:
• 7230-1 – młaki górskie (region alpejski: Pieniny, Gorce, Beskidy, Bieszczady, Kotlina Orawsko-Nowotarska, Tatry);
• 7230-2 – torfowiska zasadowe Polski południowej (z wyłączeniem gór) i środkowej (Lubelszczyzna, Sudety, wyżyny, Mazowsze);
• 7230-3 – torfowiska źródliskowe i przepływowe Polski północnej (Pomorze, Mazury, Podlasie, dolina Biebrzy).

Formularz nie zmienia od podtypu progów – tab. 2 jest wspólna. Karta z przewodnika: „7230-1 Młaki górskie” (Za Stronią, Pieniny).`,
  },
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Za Stronią',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Za Stronią”, „Bagno Stawek 1”, „Rospuda”. Zwykle stanowiskiem jest całe torfowisko albo wyraźnie wyodrębniona jego część; w kompleksach – jednorodny fragment; przy rozproszonych płatach – wszystkie płaty na jednym terenie (np. małe młaki na jednej polanie reglowej).

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego stanowiska.`,
  },
  pickField(s7120, 'guid'),
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. badawcze',
    help: `Typ stanowiska w sieci monitoringu, np. „badawcze” (karta z przewodnika) albo „referencyjne” – dobrze zachowane siedlisko, punkt odniesienia dla innych. Jeśli nie wiesz, zostaw puste.`,
  },
  {
    kind: 'text',
    name: 'areaName',
    label: 'Nazwa obszaru',
    placeholder: 'np. Pieniny',
    help: 'Obszar (Natura 2000, pasmo, kompleks torfowisk), w którym leży stanowisko, np. „Pieniny” (karta z przewodnika), „Dolina Biebrzy”, „Sandr Brdy”, „Ostoja Popradzka”.',
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Valeriano-Caricetum flavae',
    help: 'Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Związek Caricion davallianae: Valeriano-Caricetum flavae (młaka kozłkowo-turzycowa, typowa w Karpatach), Caricetum davallianae, Orchido-Schoenetum nigricantis, zbiorowisko Schoenus ferrugineus (mechowisko złocieńcowe źródliskowe z marzycą rudą); na niżu także mechowiska z mchami brunatnymi i turzycowiska (np. z turzycą obłą, nitkowatą). Przewodnik: systematyka zbiorowisk torfowisk alkalicznych jest słabo poznana – jeśli nie podajesz syntaksonu, opisz skład gatunkowy.',
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Typ (młaka górska, torfowisko źródliskowe, przepływowe, mechowisko), położenie transektu, sąsiednie siedliska, uwodnienie, użytkowanie, zarastanie.',
    help: `Krótka charakterystyka stanowiska:
• typ: młaka górska na polanie reglowej, torfowisko źródliskowe na zboczu, przepływowe w dolinie rzecznej, mechowisko z mchami brunatnymi, turzycowisko; obecność trawertynów i kopułek;
• gdzie leży transekt i dlaczego tam;
• sąsiednie siedliska: łąki Calthion i Molinion, szuwary wielkoturzycowe, źródliska wapienne 7220, torfowiska przejściowe 7140, zarośla wierzbowe, olsy;
• użytkowanie: koszenie, wypas, zaniechanie; historia odwodnienia i eksploatacji torfu, działania ochronne.

Dlaczego: torfowiska alkaliczne tworzą kompleksy z wilgotnymi łąkami i szuwarami, a formy przejściowe z 7140 i 7220 bywają trudne do odgraniczenia – opis uzasadnia, że płat to 7230.`,
  },
  {
    kind: 'text',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    required: true,
    placeholder: 'np. 1,44',
    help: 'Łączna powierzchnia płatów siedliska 7230 na stanowisku, w hektarach (karta z przewodnika: 1,44 ha). Sprawozdanie 2024: w górach od 0,01 do 4,6 ha, zwykle 0,2–0,3 ha; na niżu od 0,004 do 2000 ha (Bagno Ławki), najczęściej poniżej 1 do kilku ha.',
  },
  pickField(s7120, 'protectedAreas', {
    hint: 'Np. „Pieniński Park Narodowy; Obszar Pieniny PLH120013”.',
    help: `Parki narodowe, rezerwaty, obszary Natura 2000, parki krajobrazowe, użytki ekologiczne obejmujące stanowisko. W 2024 r. 117 ze 124 stanowisk leżało w 47 obszarach Natura 2000, 19 w parkach narodowych, 20 w rezerwatach.

Dlaczego: ochrona czynna (koszenie, odkrzaczanie, zastawki) w praktyce prowadzona jest głównie przez parki, RDOŚ, nadleśnictwa i organizacje przyrodnicze – to wpływa na perspektywy.`,
  }),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. Osoby fizyczne – właściciele gruntów',
    help: `Kto zarządza terenem: park narodowy, nadleśnictwo, RDOŚ, gmina, właściciele prywatni (karta z przewodnika: „Osoby fizyczne – właściciele gruntów”). W 2017 r. 50 stanowisk leżało na gruntach prywatnych.

Dlaczego: od zarządcy zależy koszenie, odkrzaczanie i zastawki na rowach – Stare Biele 2017: brak zgody zarządcy uniemożliwił działania ochronne.`,
  },
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu (zdjęcie nr 1)', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu (zdjęcie nr 2)', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu (zdjęcie nr 3)', required: true, help: coordHelp('końca') },
  pickField(s7120, 'transect', {
    defaultValue: '10x200 m',
    hint: 'Standard 10×200 m; dozwolone: oś nie prosta, krótszy i szerszy, mniejszy, trzy izolowane płaty.',
    help: `Przewodnik: na każdym stanowisku jeden transekt 10×200 m, tam gdzie to możliwe. Modyfikacje: zmiana kształtu (dłuższa oś nie jest linią prostą albo transekt jest krótszy i szerszy), zmniejszenie powierzchni do powierzchni siedliska, wybranie punktowo trzech powierzchni przy izolowanych płatach. W karcie z przewodnika: „0,2 ha”. Sprawozdanie 2016–2018: siedlisko z zasady małopowierzchniowe nie powinno być badane transektem – w górach trzy młaki.

Dlaczego: wszystkie pokrycia odnoszą się do transektu – następny obserwator musi wyznaczyć ten sam.`,
  }),
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 640–670',
    help: 'Wysokość nad poziomem morza – liczba albo zakres od minimalnej do maksymalnej (karta z przewodnika: 640–670 m n.p.m.). Siedlisko występuje od niżu po regiel górny.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 15.07.2009',
    required: true,
    hint: 'Optymalnie od połowy czerwca do połowy sierpnia.',
    help: `Dzień badań terenowych. Przewodnik: najlepiej od połowy czerwca do połowy sierpnia, kiedy znaczna część gatunków jest w optimum kwitnienia; później też można, ale turzyce, trawy i storczyki bywają trudne do oznaczenia i oceny pokrycia. Obserwacje powtarza się co cztery lata.

Praktyka: 2017 – 3.06–9.09; 2024 – 20.06–31.08, 2025 – 18.06 („terminy i pogoda nie miały wpływu na wyniki”). Formularz ostrzega miękko poza 15.06–15.08 i mocniej poza czerwcem – wrześniem.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const [, mm, dd] = v.split('-').map(Number)
      const md = mm * 100 + dd
      if (md < 601 || md > 930) return 'Termin poza sezonem badań (czerwiec – wrzesień). Turzyce i storczyki mogą być nie do oznaczenia – opisz powód w uwagach.'
      if (md < 615 || md > 815) return 'Termin poza optymalnym (połowa czerwca – połowa sierpnia). Dopuszczalny, ale zapisz to w uwagach.'
      return null
    },
  },
  pickField(s7120, 'observer', {
    help: `Imię i nazwisko eksperta, który wykonał obserwację i odpowiada za dane (w karcie z przewodnika: „Ekspert” w raporcie rocznym).

Dlaczego: ocena zawiera elementy oceny eksperckiej – trzeba wiedzieć, kogo zapytać o uzasadnienie.`,
  }),
  {
    kind: 'text',
    name: 'additionalExperts',
    label: 'Dodatkowi eksperci',
    placeholder: 'np. —',
    help: 'Osoby, które brały udział w badaniu poza wykonawcą (w karcie z przewodnika: „Dodatkowi koordynatorzy” – „–”). Brak – zostaw puste albo wpisz „—”.',
  },
]

// ---------- zdjęcia fitosocjologiczne ----------

const r7120 = methodology7120.releves.fields
const LAYERS = 'Zwarcie i wysokość warstw A, B, C, D'
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, group: LAYERS, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia 5×5 m (WGS84). Trzy zdjęcia: na początku, w środku i na końcu transektu – w tych miejscach mierzy się też poziom wody i pH. Na powierzchniach nietypowych zdjęcia można rozmieścić inaczej.' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach (karta z przewodnika: 640, 660, 670 m).' }),
  pickField(r7120, 'area', { defaultValue: 25, help: 'Powierzchnia zdjęcia w m² – przewodnik: 5×5 m = 25 m². Przy bardzo małych młakach wpisz faktyczną.' }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Torfowiska alkaliczne zajmują zwykle miejsca płaskie i połogie stoki, ale nachylenie bywa od 0 do ok. 30° (karta z przewodnika: 2°, 5°, 1°).' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, NW). Torfowiska alkaliczne nie wykazują preferencji co do wystawy (karta z przewodnika: S, SE, SE). Dla powierzchni płaskiej wpisz „brak”.' }),
  layerField('coverA', 'Warstwa A – drzewa: procent powierzchni zdjęcia pod koronami drzew. Na młace zwykle 0 – wyraźna warstwa drzew to sygnał zarastania.', { groupCols: 4 }),
  layerField('coverB', 'Warstwa B – krzewy i podrost: procent powierzchni zdjęcia pod krzewami i młodymi drzewami (wierzby, olsze, świerk, kruszyna).'),
  layerField('coverC', 'Warstwa C – zielna: turzyce, wełnianki, kozłek, storczyki, skrzypy (karta z przewodnika: 98%, 100%, 90%).'),
  layerField('coverD', 'Warstwa D – mszysta: mchy brunatne, czasem torfowce. Na dobrze zachowanej młace zwykle dobrze rozwinięta (karta z przewodnika: 100%, 80%, 90%).'),
  layerField('heightA', 'Warstwa A – typowa wysokość drzew, w metrach. Brak – 0 albo puste.'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów i podrostu, w metrach.'),
  layerField('heightC', 'Warstwa C – typowa wysokość warstwy zielnej, w centymetrach (karta z przewodnika: 30, 40, 20 cm).'),
  layerField('heightD', 'Warstwa D – wysokość warstwy mszystej, w centymetrach (karta z przewodnika: 5 cm).'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Valeriano-Caricetum flavae',
    help: 'Jednostka fitosocjologiczna zdjęcia – zespół albo zbiorowisko, np. Valeriano-Caricetum flavae (karta z przewodnika), Caricetum davallianae, Orchido-Schoenetum nigricantis, zb. Schoenus ferrugineus.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w poletku 5×5 m z ilościowością w skali Braun-Blanqueta (r, +, 1–5): A – drzewa, B – krzewy i podrost, C – rośliny zielne (siewki drzew w runie – też C), D – mszaki (mchy brunatne oznacz do gatunku – od nich zależy wskaźnik mchów). Warstwa podpowiada się sama po wyborze gatunku.',
  }),
  {
    kind: 'textarea',
    name: 'remarks',
    label: 'Uwagi do zdjęcia',
    rows: 2,
    placeholder: 'np. Siewki świerka w warstwie C',
    help: 'Odstępstwa i problemy: inne rozmieszczenie zdjęć, mniejsza powierzchnia, mszaki nieoznaczone do gatunku, gatunki oznaczone tylko do rodzaju.',
  },
]

export const methodology7230: Methodology = {
  code: '7230',
  name: 'Górskie i nizinne torfowiska zasadowe o charakterze młak, turzycowisk i mechowisk',
  source:
    'Koczur A. 2012, 7230 Górskie i nizinne torfowiska zasadowe o charakterze młak, turzycowisk i mechowisk, [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. III, GIOŚ, s. 137–151 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2009–2011, 2015–2018 i 2023–2025.',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj 3 zdjęcia fitosocjologiczne 5×5 m – na początku, w środku i na końcu transektu (na powierzchniach nietypowych można je rozmieścić inaczej, a gdy siedlisko zanika – zmniejszyć ich liczbę). Ilościowość w skali Braun-Blanqueta, warstwy A–D. W tych samych miejscach zmierz poziom wody i pH („Stopień uwodnienia”, „Zakres pH”) i sprawdź, czy występują trawertyny.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Realne możliwości zachowania właściwego stanu siedliska oraz poprawy stanu niewłaściwego: wykonywane i potencjalne zabiegi ochronne (neutralizacja rowów, odkrzewianie, koszenie, w niektórych przypadkach kontrolowane wypalanie), aktualny stan ochrony (obszar chroniony, zapisy w planach i operatach), oddziaływania czynników biotycznych i antropogenicznych oraz stan zachowania. Wysoka ocena struktury i funkcji powinna rzutować na wyższą ocenę perspektyw.',
    help: `Weź pod uwagę: uwodnienie i jego trend (melioracje, pobór wody, susze), zaniechanie koszenia i wypasu (główny problem młak górskich i torfowisk niżowych), sukcesję drzew i krzewów (świerk, wierzby, olsze), ekspansję trzciny, trzęślicy, ziołorośli i turzyc wielkich, eutrofizację i zakwaszenie, bobry, koleiny po ciężkim sprzęcie i quadach, mechaniczne koszenie niszczące młakę (Hala Cebulowa, Hala Krawcula 2017; Słoszów 2024). Po stronie plusów: park narodowy, rezerwat, ochrona czynna – koszenie z wywozem biomasy, odkrzaczanie, zastawki i zasypywanie rowów, programy rolnośrodowiskowe i LIFE; stosunki własnościowe pozwalające na zabiegi.

Przewodnik (pkt 5): podstawowe działania to ekstensywne koszenie (z usuwaniem pokosu) i sukcesywne wycinanie krzewów i podrostu; na niżu kontrolowane wypalanie (nie w regionie alpejskim); na odwodnionych – zastawki i zasypywanie rowów; na skrajnie zdegradowanych – usuwanie murszu i reintrodukcja gatunków.

Praktyka 2024: góry – FV 9%, U1 47%, U2 44%; niż – FV 8%, U1 62%, U2 30%. Karta z przewodnika: park narodowy, ale grunty prywatne bez zabiegów; duży płat pozwala przetrwać mimo presji drzew → U1.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A02.01', name: 'Intensyfikacja rolnictwa' },
    { code: 'A03', name: 'Koszenie / ścinanie trawy' },
    { code: 'A03.03', name: 'Zaniechanie / brak koszenia' },
    { code: 'A04', name: 'Wypas' },
    { code: 'A04.03', name: 'Zarzucenie pasterstwa, brak wypasu' },
    { code: 'A08', name: 'Nawożenie' },
    { code: 'B01', name: 'Zalesianie terenów otwartych' },
    { code: 'B02.02', name: 'Wycinka lasu' },
    { code: 'C01.03', name: 'Wydobywanie torfu' },
    { code: 'C01.03.01', name: 'Ręczne pozyskanie torfu' },
    { code: 'C01.03.02', name: 'Mechaniczne pozyskanie torfu' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D01.02', name: 'Drogi, autostrady' },
    { code: 'E01.03', name: 'Zabudowa rozproszona' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
    { code: 'G02.02', name: 'Kompleksy narciarskie' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'G05.07', name: 'Brak lub niewłaściwie prowadzone działania ochronne' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J01.01', name: 'Wypalanie' },
    { code: 'J02.01.02', name: 'Osuszanie terenów morskich, ujściowych, bagiennych' },
    { code: 'J02.04', name: 'Zalewanie - modyfikacje' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód – ogólnie' },
    { code: 'J02.06', name: 'Pobór wód powierzchniowych' },
    { code: 'J02.07', name: 'Pobór wód gruntowych' },
    { code: 'K01.03', name: 'Wyschnięcie' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.02', name: 'Nagromadzenie materii organicznej' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'K02.04', name: 'Zakwaszenie (naturalne)' },
    { code: 'M01', name: 'Zmiany warunków abiotycznych' },
    { code: 'M01.02', name: 'Susze i zmniejszenie opadów' },
    { code: 'U', name: 'Nieznane zagrożenie lub nacisk' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: [
    ...methodology7120.otherFields.flatMap((f): FieldDef[] => {
      if (f.name === 'otherValues')
        return [
          {
            ...f,
            hint: 'Np. relikty glacjalne, storczyki, gatunki chronione; trawertyny.',
            help: 'Wartości przyrodnicze stanowiska poza samym siedliskiem: rzadkie i chronione gatunki roślin (storczyki, lipiennik Loesela, skalnica torfowiskowa, wyblin jednolistny), mchy reliktowe (błyszcze włoskowate, haczykowiec błyszczący), trawertyny i kopułki, sąsiednie siedliska (7220, 7140, łąki 6410). Karta z przewodnika: „W trzech miejscach relikt glacjalny mech błyszcze włoskowate Tomentypnum nitens; storczyk wyblin jednolistny Malaxis monophyllos”. Brak – „Nie stwierdzono”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            label: 'Wykonywane działania ochronne',
            help: 'Jakie działania ochronne wykonano i z jakim skutkiem: koszenie z wywozem biomasy (programy rolnośrodowiskowe, LIFE), usuwanie nalotu i odkrzaczanie, zastawki i zasypywanie rowów, wypas owiec (ogranicza wysokie byliny, ale użyźnia), kontrolowane wypalanie (tylko na niżu). W 2024 r. na blisko 39% stanowisk brak działań. Karta z przewodnika: „Aktualnie nie wykonuje się żadnych zabiegów z wyjątkiem incydentalnego, krótkiego wypasu podczas przepędu owiec”.',
          },
          {
            kind: 'textarea',
            name: 'proposals',
            label: 'Propozycje wprowadzenia działań ochronnych',
            rows: 3,
            hint: 'Np. koszenie, odkrzaczanie, zastawki; dopłaty dla właścicieli.',
            help: 'Jakie działania proponujesz, konkretnie: likwidacja rowów albo zastawki, usuwanie drzew i krzewów oraz odrośli, regularne koszenie na odpowiedniej wysokości (zwłaszcza płatów zarastanych wysokimi bylinami), ograniczenie rozjeżdżania, wyłączenie wydzielenia z produkcji leśnej; system motywacyjny (dopłaty) dla właścicieli prywatnych. Karta z przewodnika: „Uzasadnione byłoby wprowadzenie systemu motywacyjnego (dopłat) dla właścicieli polany”.',
          },
          {
            kind: 'select',
            name: 'monitoringRequired',
            label: 'Monitoring jest wymagany',
            options: [
              { value: '', label: '—' },
              { value: 'tak', label: 'Tak' },
              { value: 'nie', label: 'Nie' },
            ],
            help: 'Czy stanowisko powinno zostać w sieci monitoringu (pole „Raportu rocznego” w karcie z przewodnika). Uzasadnienie wpisz niżej.',
          },
          {
            kind: 'textarea',
            name: 'justification',
            label: 'Uzasadnienie',
            rows: 3,
            help: 'Dlaczego monitoring jest (albo nie jest) potrzebny. W 2024 r. zaproponowano wyłączenie 29 stanowisk – roślinność typowa zanikła wskutek przesuszenia i rozwoju ziołorośli, szuwarów, łąk i zarośli; w Roplichcie i Zaukierze – rezygnację z transektu na rzecz pojedynczych młak; Chłopiny 2 – dubel innego transektu. Karta z przewodnika: największy w Pieninach kompleks bogatych florystycznie młak, bez zabiegów, z naturalną sukcesją.',
          },
        ]
      if (f.name === 'notes')
        return [
          ...(['FV', 'U1', 'U2'] as const).map(
            (g): FieldDef => ({
              kind: 'number',
              name: `share${g}`,
              group: 'Powierzchnia siedliska o różnym stanie zachowania na stanowisku',
              label: `Udział powierzchni siedliska w stanie ${g}`,
              unit: '%',
              min: 0,
              max: 100,
              help:
                g === 'FV'
                  ? 'Karta z przewodnika podaje przy ocenie ogólnej udział procentowy powierzchni siedliska o różnym stanie zachowania na stanowisku (Za Stronią: FV 90%, U1 10%, U2 0%). Trzy liczby powinny dać razem 100%.'
                  : `Procent powierzchni siedliska na stanowisku w stanie ${g === 'U1' ? 'niezadowalającym (U1)' : 'złym (U2)'}.`,
            }),
          ),
          {
            ...f,
            help: `${f.help ?? ''}\n\nDla 7230 zapisz tu także rok i typ monitoringu, termin (poza połową czerwca – połową sierpnia), pogodę przed pomiarem wody i pH (ulewy, susza), obecność trawertynów i odstępstwa od transektu (krótszy, szerszy, trzy młaki).`.trim(),
          },
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_7230.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer7230(s) })),
  speciesInfo: (name) => {
    const s = findSpecies7230(name)
    if (!s) return undefined
    if (s.group === 'characteristic') {
      const extra = s.brown ? '; mech brunatny' : s.sphagnum ? '; torfowiec alkalifilny' : ''
      if (s.source === 'class') return `${GROUP_LABELS_7230.characteristic} (klasa Scheuchzerio-Caricetea – liczony przez ekspertów w 2024 r.${s.acidic ? '; optimum na kwaśniejszych torfowiskach przejściowych' : ''}${extra})`
      return `${GROUP_LABELS_7230.characteristic} (pkt 4 przewodnika${extra})`
    }
    if (s.group === 'expansive' && s.magno) return `${GROUP_LABELS_7230.expansive} (turzyca wielka, Magnocaricion)`
    if (s.brown) return `${GROUP_LABELS_7230[s.group]} (mech brunatny)`
    if (s.sphagnum) return `${GROUP_LABELS_7230[s.group]} (torfowiec)`
    if (s.acidic) return `${GROUP_LABELS_7230[s.group]} (młak kwaśnych)`
    return GROUP_LABELS_7230[s.group]
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator7230 = (id: string): IndicatorDef => {
  const i = methodology7230.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 7230`)
  return i
}
