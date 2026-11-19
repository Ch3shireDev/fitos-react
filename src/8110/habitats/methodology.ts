// Metodyka 8110 (piargi i gołoborza krzemianowe) jako dane. Źródło: Stawowczyk K., Kozłowska-Kozak K., Kozak M. 2015,
// „8110 Piargi i gołoborza krzemianowe” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny,
// cz. IV, GIOŚ, s. 196–210 (tab. 1 i 2, lista wskaźników kardynalnych, karta Dolina Pańszczyca 4), z praktyką oceny ze
// sprawozdań z monitoringu 2013–2014, 2015–2018 (badania 2018) i 2023–2025 (badania 2024).
// Siedlisko niepriorytetowe, regiony alpejski (Tatry, Babia Góra) i kontynentalny (Karkonosze, Śnieżnik Kłodzki).
// Transekt 10 m szerokości, nie krótszy niż 100 m, 3 zdjęcia po 25 m² (początek, środek, koniec).
// Struktura i ocena ogólna – reguły silnika (tab. 2 8110 mówi dokładnie to samo), bez structureRule.
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import { SPECIES_8110, alpineStatus8110, defaultLayer8110, findSpecies8110, isTypical8110, isWoody8110, speciesKey8110 } from './species'

// ---------- pasmo górskie i podtyp ----------

export const MASSIFS_8110 = ['Tatry', 'Babia Góra', 'Bieszczady', 'Karkonosze', 'Śnieżnik Kłodzki'] as const
export type Massif8110 = (typeof MASSIFS_8110)[number]
const MASSIF_OPTIONS: SelectOption[] = [
  { value: '', label: '—' },
  { value: 'Tatry', label: 'Tatry (region alpejski)' },
  { value: 'Babia Góra', label: 'Babia Góra (region alpejski)' },
  { value: 'Bieszczady', label: 'Bieszczady (region alpejski)' },
  { value: 'Karkonosze', label: 'Karkonosze (region kontynentalny)' },
  { value: 'Śnieżnik Kłodzki', label: 'Śnieżnik Kłodzki (region kontynentalny)' },
]

export const SUBTYPES_8110 = ['8110-1', '8110-2', '8110-3', '8110-4'] as const
export const SUBTYPE_LABELS_8110: Record<(typeof SUBTYPES_8110)[number], string> = {
  '8110-1': '8110-1 – Piargi krzemianowe z roślinnością pionierską w Tatrach',
  '8110-2': '8110-2 – Utrwalone piargi krzemianowe w Tatrach',
  '8110-3': '8110-3 – Rumowiska skalne ze zmienką górską i porostami w Sudetach',
  '8110-4': '8110-4 – Rumowiska skalne na Babiej Górze',
}
const SUBTYPE_OPTIONS: SelectOption[] = [{ value: '', label: '—' }, ...SUBTYPES_8110.map((s) => ({ value: s, label: SUBTYPE_LABELS_8110[s] }))]
/** Pasma, w których występuje dany podtyp (przewodnik, pkt 2). */
const SUBTYPE_MASSIFS: Record<(typeof SUBTYPES_8110)[number], Massif8110[]> = {
  '8110-1': ['Tatry'],
  '8110-2': ['Tatry'],
  '8110-3': ['Karkonosze', 'Śnieżnik Kłodzki'],
  '8110-4': ['Babia Góra'],
}

/** Pasma, w których występuje podtyp – do ostrzeżenia o niezgodności podtypu i pasma. */
export const massifsOfSubtype8110 = (subtype: string): Massif8110[] => SUBTYPE_MASSIFS[subtype as (typeof SUBTYPES_8110)[number]] ?? []

const massifOf = (ctx?: IndicatorContext): Massif8110 | undefined => {
  const m = String(ctx?.site?.massif ?? '')
  return (MASSIFS_8110 as readonly string[]).includes(m) ? (m as Massif8110) : undefined
}
const subtypeOf = (ctx?: IndicatorContext) => String(ctx?.site?.subtype ?? '')

/**
 * Zestaw progów tab. 2 dla stanowiska: Tatry, Karkonosze albo Śnieżnik Kłodzki. Babia Góra i Bieszczady (region
 * alpejski) – tab. 2 ich nie wymienia, formularz stosuje progi tatrzańskie. Bez pasma – z podtypu (8110-1, -2, -4 →
 * Tatry; 8110-3 → Sudety bez rozróżnienia Karkonoszy i Śnieżnika).
 */
export type Range8110 = 'tatry' | 'karkonosze' | 'snieznik'
function rangeOf(ctx?: IndicatorContext): Range8110 | 'sudety' | undefined {
  const m = massifOf(ctx)
  if (m === 'Karkonosze') return 'karkonosze'
  if (m === 'Śnieżnik Kłodzki') return 'snieznik'
  if (m) return 'tatry'
  const s = subtypeOf(ctx)
  if (s === '8110-3') return 'sudety'
  return s ? 'tatry' : undefined
}
const outsideTab2 = (ctx?: IndicatorContext) => {
  const m = massifOf(ctx)
  return m === 'Babia Góra' || m === 'Bieszczady' ? m : undefined
}

// ---------- progi liczbowe (tab. 2) ----------

/** Gatunki typowe: Tatry >7 FV, 4–7 U1, <4 U2; Karkonosze i Śnieżnik >2 FV, 1–2 U1, brak U2. */
export function gradeTypical8110(count: number, range: Range8110 | 'sudety'): Grade {
  if (range === 'tatry') return count > 7 ? 'FV' : count >= 4 ? 'U1' : 'U2'
  return count > 2 ? 'FV' : count >= 1 ? 'U1' : 'U2'
}

/** Gatunki wysokogórskie: Tatry >7 / 4–7 / <4; Karkonosze >2 / 1–2 / brak; Śnieżnik Kłodzki >1 / 1 / brak. */
export function gradeAlpine8110(count: number, range: Range8110): Grade {
  if (range === 'tatry') return count > 7 ? 'FV' : count >= 4 ? 'U1' : 'U2'
  if (range === 'karkonosze') return count > 2 ? 'FV' : count >= 1 ? 'U1' : 'U2'
  return count > 1 ? 'FV' : count === 1 ? 'U1' : 'U2'
}

/**
 * Obce gatunki inwazyjne: brak FV; 1 gatunek o pokryciu <1% U1 (dokładnie 1% – luka w tab. 2 – formularz liczy do U1,
 * gatunek bez pokrycia też U1); 2 i więcej gatunków albo 1 o pokryciu >1% U2.
 */
export function gradeAliens8110(count: number, cover?: number): Grade {
  if (count <= 0) return 'FV'
  if (count >= 2) return 'U2'
  return cover !== undefined && cover > 1 ? 'U2' : 'U1'
}

/** Pokrycie przez drzewa i krzewy: <5% FV; 5–25% U1 (obie granice); >25% U2. */
export const gradeShrubs8110 = (cover: number): Grade => (cover < 5 ? 'FV' : cover <= 25 ? 'U1' : 'U2')

/** Pokrycie roślin zielnych: <50% FV; 50–90% U1 (obie granice); >90% U2. */
export const gradeHerbs8110 = (cover: number): Grade => (cover < 50 ? 'FV' : cover <= 90 ? 'U1' : 'U2')

/** Procent powierzchni siedliska na transekcie: >50% FV; 25–50% U1 (obie granice); <25% U2. */
export const gradeHabitatShare8110 = (share: number): Grade => (share > 50 ? 'FV' : share >= 25 ? 'U1' : 'U2')

const pct = (v: number) => `${plNum(v)}%`
const round1 = (n: number) => Math.round(n * 10) / 10
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey8110(n), n])).values()]

/** Suma pokrycia wierszy listy; 'present' – są wiersze, ale bez pokrycia; undefined – brak wierszy. */
function sumCover(list: unknown): number | 'present' | undefined {
  const rows = speciesRows(list).filter((r) => r.name?.trim())
  if (!rows.length) return undefined
  const covers = rows.map((r) => num(r.cover)).filter((c): c is number => c !== undefined)
  return covers.length ? round1(covers.reduce((a, b) => a + b, 0)) : 'present'
}

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'minor', label: 'Nieznaczny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi z literatury', grade: 'U1' },
  { value: 'decrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi z literatury', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]

const FRACTION: GradedOption[] = [
  { value: 'any', label: 'Dowolna frakcja rumoszu – od żwirku po bloki skalne (wskaźnik opisowy)', grade: 'FV' },
  { value: 'blocks', label: 'Na transekcie prawie wyłącznie frakcja bardzo dużych bloków (>1 m), utrudniająca rozwój roślinności typowo piargowej', grade: 'U1' },
  { value: 'residual', label: 'Poza tab. 2: rumosz tylko szczątkowo, siedlisko zniszczone (praktyka 2018)', grade: 'U2' },
]

const COMMUNITIES: GradedOption[] = [
  { value: 'any', label: 'Zbiorowiska piargowe, murawowe, traworoślowe, ziołoroślowe albo pośrednie (wskaźnik informacyjny)', grade: 'FV' },
  { value: 'pinus', label: 'Skrajnie wysokie pokrycie powierzchni stanowiska przez zarośla kosodrzewiny (>50%)', grade: 'U1' },
  { value: 'none', label: 'Poza tab. 2: brak zbiorowisk charakterystycznych dla siedliska, tylko szczątki (praktyka 2018)', grade: 'U2' },
]

const ANTHROPO: GradedOption[] = [
  { value: 'none', label: 'Brak lub znikome (pojedyncze śmieci nie obniżają automatycznie oceny)', grade: 'FV' },
  { value: 'medium', label: 'O średnim nasileniu (np. śmieci w kilku miejscach, ścieżka, wydeptywanie części płatów)', grade: 'U1' },
  { value: 'strong', label: 'Wyraźne, oddziałujące negatywnie na strukturę i funkcje siedliska (np. płaty zadeptane)', grade: 'U2' },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

/** Select niewymagany – gdy wystarcza opis albo liczba, nie trzeba go wybierać. */
const optionalSelect = (label: string, options: GradedOption[], help?: string, name = 'choice'): FieldDef => ({ ...selectInput(label, options, help, name), required: false })

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

const GRADE_CHOICE = (help: string): FieldDef => ({
  kind: 'select',
  name: 'choice',
  label: 'Ocena (opcjonalnie)',
  options: [{ value: '', label: '—' }, ...(['FV', 'U1', 'U2'] as const).map((g) => ({ value: g, label: g }))],
  help,
})
const chosenGrade = (i: InputValues): Grade | null => {
  const g = String(i.choice ?? '')
  return g === 'FV' || g === 'U1' || g === 'U2' ? g : null
}

/** Łączne pokrycie: wpisane wprost > suma z listy > 0 przy „nie stwierdzono”. 'present' – lista bez pokrycia. */
function coverOf(i: InputValues): number | 'present' | undefined {
  const t = num(i.total)
  if (t !== undefined) return t
  const s = sumCover(i.species)
  if (s !== undefined) return s
  return i.none === 'yes' ? 0 : undefined
}

const describeList = (i: InputValues) => {
  if (note(i)) return note(i)
  const list = describeSpecies(speciesRows(i.species))
  const t = num(i.total)
  if (list) return t !== undefined ? `${list} – łącznie ${pct(t)}` : list
  if (t !== undefined) return pct(t)
  return i.none === 'yes' ? 'Brak' : ''
}

// ---------- gatunki typowe i wysokogórskie ----------

const typicalNames = (i: InputValues) => distinct(rowNames(i.species).filter(isTypical8110))
function typicalCount(i: InputValues): number | undefined {
  const c = num(i.count)
  if (c !== undefined) return c
  if (rowNames(i.species).length) return typicalNames(i).length
  return i.none === 'yes' ? 0 : undefined
}

/** Wysokogórskie: z katalogu oznaczone jako wysokogórskie + gatunki spoza katalogu (decyzja eksperta). */
const alpineNames = (i: InputValues) => distinct(rowNames(i.species).filter((n) => alpineStatus8110(n) !== 'no'))
function alpineCount(i: InputValues): number | undefined {
  const c = num(i.count)
  if (c !== undefined) return c
  if (rowNames(i.species).length) return alpineNames(i).length
  return i.none === 'yes' ? 0 : undefined
}

const RANGE_TEXT: Record<Range8110 | 'sudety', string> = {
  tatry: 'progi tatrzańskie',
  karkonosze: 'progi karkonoskie',
  snieznik: 'progi Śnieżnika Kłodzkiego',
  sudety: 'progi Karkonoszy i Śnieżnika',
}

const SURFACE = 'w % powierzchni transektu'

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description:
      'Powierzchnia płatów siedliska na stanowisku i jej zmiany w porównaniu z wcześniejszymi badaniami lub danymi z literatury (tab. 2 przewodnika).',
    help: `Co wybrać: czy powierzchnia piargu albo gołoborza zajętego przez siedlisko się zmieniła od poprzedniego badania (zarastanie przez murawy, ziołorośla i kosodrzewinę, zadeptanie). Samą powierzchnię wpisz obok – trafi do „wartości”.

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; nieznaczny spadek w porównaniu z wcześniejszymi badaniami lub danymi z literatury – U1; wyraźny spadek – U2. Przy pierwszym badaniu – „Brak danych do porównania” (XX) albo ocena ekspercka.

Praktyka: w Tatrach i na Babiej Górze zawsze FV (powierzchnia zależy od wielkości stożka piargowego, od kilkudziesięciu arów do kilkunastu hektarów; w 2024 r. różnice w liczbach z dokładniejszego oszacowania, nie zmian). W 2013 r. Kopa i Żleb Prosty w Karkonoszach dostały U1 za mały, izolowany płat – w 2018 r. Kopa wróciła na FV, bo powierzchnia się nie zmniejszała. Pod Śnieżnikiem 2018 – U2 (siedlisko zanikło przez wydeptanie). Karta z przewodnika (Dolina Pańszczyca 4): 0,4 ha → FV.`,
    thresholds: thresholdsOf(AREA.filter((o) => o.grade !== 'XX')),
    inputs: [
      selectInput('Zmiana powierzchni', AREA, 'Jak zmieniła się powierzchnia siedliska od poprzedniego badania albo w porównaniu z danymi z literatury.'),
      { kind: 'text', name: 'areaText', label: 'Powierzchnia (opcjonalnie)', placeholder: 'np. 0,4 ha', help: 'Powierzchnia płatów siedliska na stanowisku, np. „0,4 ha” – trafi do pola „wartość”, gdy nie ma opisu.' },
      noteInput('Opis (opcjonalnie)', 'np. Powierzchnia stabilna, zależna od wielkości stożka piargowego.', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy albo samej powierzchni.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => note(i) || String(i.areaText ?? '').trim() || labelOf(AREA, i.choice),
  },
  {
    id: 'fraction',
    label: 'Dominująca frakcja rumoszu',
    parameter: 'structure',
    description:
      'Określenie przeciętnych rozmiarów kamieni i bloków skalnych na transekcie. Gdy przeważająca frakcja jest mocno zróżnicowana – zakres. Wyraźną różnicę w pionowym rozmieszczeniu frakcji (drobniejsza u góry, większa niżej) odnotowuje się, podając średnicę najmniejszych i największych bloków z ich lokalizacją na piargu.',
    help: `Co wpisać: przeciętne rozmiary rumoszu, np. „żwirek 3–5 cm i kamienie o średnicy 15–20 cm”, „bloki 50–100 cm”. Wybór klasy jest opcjonalny – sam opis daje FV.

Progi (tab. 2): wskaźnik ma jedynie charakter opisowy i nie służy do oceny zachowania siedliska – każda wartość to FV. Wyjątek: na transekcie prawie wyłącznie frakcja bardzo dużych bloków (>1 m), utrudniająca rozwój roślinności typowo piargowej – U1.

Praktyka: 2013–2024 – FV na wszystkich stanowiskach poza jednym. Tatry: najczęściej kamienie 10–30 cm, czasem żwirek 2–5 cm, u podnóży bloki >50 cm; Babia Góra: bloki piaskowca 50–100 cm; Karkonosze i Śnieżnik: 20–120 cm. Wyjątek: Pod Śnieżnikiem 2018 – U2, bo rumosz został tylko miejscami, z masą drobnej frakcji po zadeptaniu – tab. 2 takiej oceny nie przewiduje, formularz daje ją tylko z wyraźnego wyboru i ostrzega. Sprawozdanie 2018 proponuje usunąć wskaźnik (informacje do opisu stanowiska) – propozycja nie weszła, w 2024 r. nadal oceniany (FV).

Wskaźnik niekardynalny – nawet U1 nie obniża oceny struktury.`,
    thresholds: {
      FV: 'Każda wartość – wskaźnik opisowy',
      U1: 'Na transekcie prawie wyłącznie frakcja bardzo dużych bloków (>1 m), utrudniająca rozwój roślinności typowo piargowej',
      U2: 'Tab. 2 nie przewiduje (praktyka 2018: U2 przy zniszczonym siedlisku)',
    },
    inputs: [
      { kind: 'text', name: 'size', label: 'Przeciętne rozmiary rumoszu', placeholder: 'np. żwirek 3–5 cm i kamienie 15–20 cm', help: 'Średnica przeważającej frakcji (zakres, gdy mocno zróżnicowana). Przy wyraźnym zróżnicowaniu pionowym – średnice najmniejszych i największych bloków z miejscem na piargu.' },
      optionalSelect('Klasa (opcjonalnie)', FRACTION, 'Puste – sam opis rozmiarów daje FV. Wybierz, gdy na transekcie są prawie wyłącznie bardzo duże bloki.'),
      noteInput('Opis (opcjonalnie)', 'np. Żwirek 3–5 cm i kamienie o średnicy 15–20 cm.', 'Krótki opis, który trafi do „wartości” w karcie zamiast samych rozmiarów.'),
    ],
    suggest: (i) => {
      const chosen = gradeMap(FRACTION)[String(i.choice)]
      if (chosen) return chosen
      return String(i.size ?? '').trim() || note(i) ? 'FV' : null
    },
    explain: (i) => (!i.choice && (String(i.size ?? '').trim() || note(i)) ? 'Wskaźnik opisowy – każda wartość to FV.' : null),
    warn: (i) =>
      i.choice === 'residual'
        ? 'Tab. 2 nie przewiduje oceny U2 dla tego wskaźnika (tylko FV albo U1) – dano ją raz, w 2018 r. przy zniszczonym stanowisku Pod Śnieżnikiem. Uzasadnij w opisie.'
        : null,
    describe: (i) => note(i) || String(i.size ?? '').trim() || (i.choice ? labelOf(FRACTION, i.choice) : ''),
  },
  {
    id: 'communities',
    label: 'Dominujące rodzaje zbiorowisk',
    parameter: 'structure',
    description:
      'Zwięzłe określenie charakteru roślinności porastającej piarg – typ zbiorowiska przeważającego na transekcie, w miarę możliwości z przynależnością fitosocjologiczną, albo tylko charakter: piargowy, murawowy, trawo- lub ziołoroślowy, pośredni. Z przybliżonym pokryciem (w %).',
    help: `Co wpisać: typy zbiorowisk na transekcie z przybliżonym udziałem, np. „Zbiorowiska piargowe związku Androsacion alpinae – 100%”, „mozaika Luzuletum alpino-pilosae (60%) i muraw Juncion trifidi (40%)”, „zbiorowiska porostów i mszaków (Umbilicarion cylindricae, Andreaeion petrophilae)”. Pokrycie zarośli kosodrzewiny wpisz osobno.

Progi (tab. 2): wskaźnik wyłącznie informacyjny, nie służy do oceny stanu – każdy stan to FV. Wyjątek: skrajnie wysokie pokrycie powierzchni stanowiska przez zarośla kosodrzewiny (>50%) – U1.

Jak liczy formularz: wybrana klasa ma pierwszeństwo; bez niej kosodrzewina >50% → U1, a każdy inny opis → FV.

Praktyka: 2013–2024 – FV na wszystkich stanowiskach poza jednym. W Tatrach często mozaika 2–3 rodzajów zbiorowisk (piargowe, traworoślowe, murawowe), na Babiej Górze zbiorowiska mszaków (Polygonato-Oligotrichetum) i porostów epilitycznych, w Sudetach Androsacion alpinae na 85–100% transektu. Pod Śnieżnikiem 2018 – U2 (głazy z porostami, brak zbiorowisk siedliska) – poza tab. 2, formularz daje to tylko z wyraźnego wyboru. Przez pomyłkę w 2013 r. na jednym stanowisku wypełniono wskaźnik „Gatunki dominujące”, którego metodyka nie ma.

Wskaźnik niekardynalny.`,
    thresholds: {
      FV: 'Każdy stan – wskaźnik informacyjny',
      U1: 'Skrajnie wysokie pokrycie powierzchni stanowiska przez zarośla kosodrzewiny (>50%)',
      U2: 'Tab. 2 nie przewiduje (praktyka 2018: U2 przy braku zbiorowisk siedliska)',
    },
    inputs: [
      { kind: 'textarea', name: 'types', label: 'Zbiorowiska i ich udział', rows: 2, placeholder: 'np. Zbiorowiska piargowe związku Androsacion alpinae – 100%', help: 'Typy zbiorowisk przeważających na transekcie z przybliżonym pokryciem w %, nazwami fitosocjologicznymi albo opisowo (piargowe, murawowe, traworoślowe, ziołoroślowe, pośrednie).' },
      { kind: 'number', name: 'pinus', label: 'Pokrycie zarośli kosodrzewiny (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Pokrycie powierzchni stanowiska przez zarośla kosodrzewiny w %. Powyżej 50% – U1 (jedyny wyjątek od FV w tab. 2).' },
      optionalSelect('Klasa (opcjonalnie)', COMMUNITIES, 'Puste – formularz liczy z pokrycia kosodrzewiny albo daje FV za sam opis.'),
      noteInput('Opis (opcjonalnie)', 'np. Zbiorowiska piargowe związku Androsacion alpinae – 100%.', 'Krótki opis, który trafi do „wartości” w karcie zamiast opisu zbiorowisk.'),
    ],
    suggest: (i) => {
      const chosen = gradeMap(COMMUNITIES)[String(i.choice)]
      if (chosen) return chosen
      const p = num(i.pinus)
      if (p !== undefined && p > 50) return 'U1'
      return p !== undefined || String(i.types ?? '').trim() || note(i) ? 'FV' : null
    },
    explain: (i) => {
      if (i.choice) return null
      const p = num(i.pinus)
      if (p !== undefined) return `Zarośla kosodrzewiny: ${pct(p)}${p > 50 ? ' – powyżej 50%' : ''}.`
      return String(i.types ?? '').trim() || note(i) ? 'Wskaźnik informacyjny – każdy stan to FV.' : null
    },
    warn: (i) => {
      const p = num(i.pinus)
      const chosen = gradeMap(COMMUNITIES)[String(i.choice)]
      if (i.choice === 'none') return 'Tab. 2 nie przewiduje oceny U2 dla tego wskaźnika – dano ją raz, w 2018 r. przy zniszczonym stanowisku Pod Śnieżnikiem. Uzasadnij w opisie.'
      if (chosen && p !== undefined && chosen !== (p > 50 ? 'U1' : 'FV')) return `Wybrano ${chosen}, a z pokrycia kosodrzewiny (${pct(p)}) wychodzi ${p > 50 ? 'U1' : 'FV'} – sprawdź albo uzasadnij.`
      return null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const t = String(i.types ?? '').trim()
      const p = num(i.pinus)
      return [t, p !== undefined ? `kosodrzewina ${pct(p)}` : ''].filter(Boolean).join('; ') || (i.choice ? labelOf(COMMUNITIES, i.choice) : '')
    },
  },
  {
    id: 'typical',
    label: 'Gatunki typowe',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista wszystkich gatunków typowych stwierdzonych w obrębie transektu, zarówno w zdjęciach fitosocjologicznych, jak i w płatach między zdjęciami. Gatunki typowe to gatunki charakterystyczne i wyróżniające rzędu Androsacetalia alpinae (Matuszkiewicz 2008) oraz gatunki uznane za reprezentatywne dla poszczególnych podtypów w Poradnikach ochrony siedlisk (Mróz & Perzanowska 2004).',
    help: `Co wpisać: gatunki typowe z całego transektu (nazwy polskie i łacińskie; pokrycie nie jest potrzebne). Katalog zna:
• 8110-1: rzeżusznik tatrzański, rogownica jednokwiatowa, kuklik rozesłany, złocieniec alpejski, szczawiór alpejski, wiechlina wiotka, jaskier lodnikowy, skalnica mchowata, karpacka, naprzeciwlistna i tatrzańska;
• 8110-2: mietlica skalna, śmiałek pogięty, omieg kozłowiec, kostrzewa barwna, podbiałek alpejski, wroniec widlasty, kosmatka brunatna, marchwica pospolita, wiechlina granitowa, jaskier halny, urdzik karpacki, wierzba wykrojona, przetacznik alpejski;
• 8110-3 (Sudety): zmienka górska, śmiałek pogięty, kostrzewa niska, wroniec widlasty, naleźlina skalna, skalniczki Racomitrium, porosty Lecanora, Rhizocarpon, Umbilicaria;
• 8110-4 (Babia Góra): jak wyżej oraz kosmatka brunatna, wiechlina wiotka, różeniec górski, kruszownica zwyczajna, wzorzec geograficzny;
• wg sprawozdań 2018 i 2024: gęsiówka alpejska, goryczka kropkowana, boimka dwurzędowa, gnidosze dwubarwny i okółkowy, rozchodnik alpejski, lepnica bezłodygowa, borówka halna.
Liczy się wspólna lista – karta przykładowa liczy razem gatunki 8110-1 i 8110-2. Liczbę gatunków możesz wpisać wprost.

Progi (tab. 2) zależą od pasma (wybierz je w „Stanowisku”):
• Tatry: >7 gatunków – FV; 4–7 – U1; <4 – U2;
• Karkonosze i Śnieżnik Kłodzki: >2 – FV; 1–2 – U1; brak – U2.
Babii Góry i Bieszczadów tab. 2 nie wymienia – formularz stosuje progi tatrzańskie (region alpejski) i ostrzega przy wyniku poniżej FV. Praktyka: Babia Góra 8–9 gatunków (FV, 2014), w 2024 r. Żleb Poszukiwaczy Skarbów z 7 gatunkami – FV (wg progów tatrzańskich byłoby U1).

Praktyka: Tatry 7–23 gatunki (średnio 13), Karkonosze 3–6, Śnieżnik 3–4 – wszędzie FV; Pod Śnieżnikiem 2018 – niemal całkowity brak (tylko szczątkowo Rhizocarpon geographicum) → U2. Sprawozdanie 2018 proponuje połączyć ten wskaźnik z gatunkami wysokogórskimi (to w przybliżeniu ten sam zestaw) – propozycja nie weszła. Karta z przewodnika (Dolina Pańszczyca 4): 19 gatunków → FV.

Ocena wybrana w polu ma pierwszeństwo. Wskaźnik kardynalny.`,
    thresholds: {
      FV: '>7 gatunków (Tatry); >2 gatunki (Karkonosze i Śnieżnik Kłodzki)',
      U1: '4–7 gatunków (Tatry); 1–2 gatunki (Karkonosze i Śnieżnik Kłodzki)',
      U2: '<4 gatunki (Tatry); brak (Karkonosze i Śnieżnik Kłodzki)',
    },
    inputs: [
      speciesInput('Gatunki typowe', 'Gatunki typowe stwierdzone na transekcie, np. Cardaminopsis neglecta, Oxyria digyna, Luzula alpino-pilosa, Cryptogramma crispa. Pokrycie nie jest wymagane.'),
      { kind: 'number', name: 'count', label: 'Liczba gatunków typowych (opcjonalnie)', min: 0, help: 'Łączna liczba gatunków typowych na transekcie, wpisana wprost – ma pierwszeństwo przed liczeniem z listy.' },
      NONE_FIELD('Brak gatunków typowych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma żadnego gatunku typowego – wtedy wskaźnik to U2.'),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed liczbą gatunków. Wybierz ją np. na Babiej Górze, gdzie tab. 2 nie podaje progów, albo gdy uboga flora wynika z warunków naturalnych.'),
      noteInput('Opis (opcjonalnie)', 'np. 19 gatunków: dla 8110-1 – rzeżusznik tatrzański Cardaminopsis neglecta, …', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i, ctx) => {
      const g = chosenGrade(i)
      if (g) return g
      const c = typicalCount(i)
      const r = rangeOf(ctx)
      return c === undefined || !r ? null : gradeTypical8110(c, r)
    },
    explain: (i, ctx) => {
      if (chosenGrade(i)) return null
      const c = typicalCount(i)
      if (c === undefined) return null
      const r = rangeOf(ctx)
      const how = r ? ` (${RANGE_TEXT[r]})` : ' – wybierz pasmo albo podtyp w „Stanowisku”, progi zależą od pasma'
      if (num(i.count) !== undefined || !rowNames(i.species).length) return `Gatunków typowych: ${plNum(c)}${how}.`
      const names = typicalNames(i)
      return `Gatunki typowe z katalogu: ${names.length}${how}.`
    },
    warn: (i, ctx) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.count) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo liczba nie są puste.')
      const other = names.filter((n) => findSpecies8110(n) && !isTypical8110(n))
      if (other.length) parts.push(`Nie liczą się jako typowe: ${other.join(', ')} (możesz je wpisać w gatunkach wysokogórskich).`)
      const unknown = names.filter((n) => !findSpecies8110(n))
      if (unknown.length && num(i.count) === undefined) parts.push(`Spoza katalogu – nie liczą się: ${unknown.join(', ')}. Jeśli to gatunki typowe, wpisz liczbę wprost.`)
      const g = chosenGrade(i)
      const c = typicalCount(i)
      const r = rangeOf(ctx)
      if (g && c !== undefined && r && g !== gradeTypical8110(c, r)) parts.push(`Wybrano ${g}, a z liczby gatunków wychodzi ${gradeTypical8110(c, r)} – uzasadnij w opisie.`)
      const m = massifOf(ctx)
      const allowed = massifsOfSubtype8110(subtypeOf(ctx))
      if (m && allowed.length && !allowed.includes(m)) parts.push(`Podtyp ${subtypeOf(ctx)} występuje w: ${allowed.join(', ')}, a wybrano pasmo ${m} – sprawdź podtyp albo pasmo w „Stanowisku”.`)
      const out = outsideTab2(ctx)
      if (!g && out && c !== undefined && gradeTypical8110(c, 'tatry') !== 'FV')
        parts.push(`${out}: tab. 2 nie podaje progów – formularz stosuje tatrzańskie. Flora jest tu uboższa niż w Tatrach; w 2024 r. stanowisko z 7 gatunkami na Babiej Górze oceniono na FV. Rozważ ocenę ekspercką.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      const c = num(i.count)
      return list || (c !== undefined ? `${plNum(c)} gat.` : i.none === 'yes' ? 'Brak' : '')
    },
  },
  {
    id: 'alpine',
    label: 'Gatunki wysokogórskie',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista wszystkich gatunków wysokogórskich na całej powierzchni transektu. Za gatunek wysokogórski uznaje się takson, którego centrum rozmieszczenia pionowego w Polsce znajduje się w piętrach subalpejskim, alpejskim i/lub turniowym (najczęściej gatunki charakterystyczne i wyróżniające rzędu Androsacetalia alpinae oraz klas Salicetea herbaceae, Juncetea trifidi i Seslerietea variae). Liczna obecność gatunków wysokogórskich odróżnia siedlisko od 8150.',
    help: `Co wpisać: wszystkie gatunki wysokogórskie z transektu. Przewodnik nie daje zamkniętej listy – ekspert sam ocenia pionowe rozmieszczenie gatunków w Polsce. Katalog zna 43 gatunki z karty przykładowej (m.in. mietlica skalna, tomka alpejska, dzwonki alpejski i wąskolistny, kukliki górski i rozesłany, sit skucina, kosmatki brunatna i kłosowa, boimka, pierwiosnek maleńki, wierzby zielna i wykrojona, skalnice, macierzanka halna) oraz gatunki liczone w Sudetach w 2024 r. (zmienka górska, wietlica alpejska, bażyna obupłciowa, naleźlina skalna, skalniczki, płonnik alpejski, kieria Blytta, kruszownica zwyczajna).

Jak liczy formularz: liczba wpisana wprost ma pierwszeństwo; bez niej – gatunki z listy znane katalogowi jako wysokogórskie plus gatunki spoza katalogu (ekspert wpisał je jako wysokogórskie). Gatunki, których karta przykładowa nie liczy jako wysokogórskich (śmiałek pogięty, wroniec widlasty, podbiałek alpejski, urdzik karpacki, borówka czarna, skalnica gronkowa, drzewa i krzewy) – pominięte z ostrzeżeniem. Podbiałek alpejski liczono w 2024 r. w Karkonoszach – jeśli go liczysz, wpisz liczbę wprost.

Progi (tab. 2) zależą od pasma:
• Tatry: >7 gatunków – FV; 4–7 – U1; <4 – U2;
• Karkonosze: >2 – FV; 1–2 – U1; brak – U2;
• Śnieżnik Kłodzki: >1 – FV; 1 – U1; brak – U2.
Babia Góra i Bieszczady – progi tatrzańskie z ostrzeżeniem (tab. 2 ich nie wymienia; Babia Góra 8–11 gatunków, FV).

Praktyka: Tatry 9–50 gatunków (średnio 26), Karkonosze 3–8, Śnieżnik 2 – FV; Pod Śnieżnikiem 2018 → U2. Sprawozdanie 2018 proponowało usunąć wskaźnik (dubluje gatunki typowe) i odebrać mu status kardynalnego – propozycja nie weszła, w 2024 r. nadal kardynalny. Karta z przewodnika: 43 gatunki → FV.

Ocena wybrana w polu ma pierwszeństwo. Wskaźnik kardynalny.`,
    thresholds: {
      FV: '>7 gatunków (Tatry); >2 gatunki (Karkonosze); >1 gatunek (Śnieżnik Kłodzki)',
      U1: '4–7 gatunków (Tatry); 1–2 gatunki (Karkonosze); 1 gatunek (Śnieżnik Kłodzki)',
      U2: '<4 gatunki (Tatry); brak (Karkonosze i Śnieżnik Kłodzki)',
    },
    inputs: [
      speciesInput('Gatunki wysokogórskie', 'Gatunki wysokogórskie stwierdzone na transekcie, np. Agrostis rupestris, Campanula alpina, Oreochloa disticha, Primula minima. Pokrycie nie jest wymagane.'),
      { kind: 'number', name: 'count', label: 'Liczba gatunków wysokogórskich (opcjonalnie)', min: 0, help: 'Łączna liczba gatunków wysokogórskich, wpisana wprost – ma pierwszeństwo przed liczeniem z listy.' },
      NONE_FIELD('Brak gatunków wysokogórskich', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma żadnego gatunku wysokogórskiego – wtedy wskaźnik to U2.'),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed liczbą gatunków (np. Babia Góra, gdzie tab. 2 nie podaje progów).'),
      noteInput('Opis (opcjonalnie)', 'np. 43 gatunki: mietlica skalna Agrostis rupestris, …', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i, ctx) => {
      const g = chosenGrade(i)
      if (g) return g
      const c = alpineCount(i)
      const r = rangeOf(ctx)
      if (c === undefined || !r) return null
      if (r === 'sudety') return gradeAlpine8110(c, 'karkonosze') === gradeAlpine8110(c, 'snieznik') ? gradeAlpine8110(c, 'karkonosze') : null
      return gradeAlpine8110(c, r)
    },
    explain: (i, ctx) => {
      if (chosenGrade(i)) return null
      const c = alpineCount(i)
      if (c === undefined) return null
      const r = rangeOf(ctx)
      const how = !r ? ' – wybierz pasmo w „Stanowisku”, progi zależą od pasma' : r === 'sudety' ? ' – wybierz pasmo (Karkonosze albo Śnieżnik Kłodzki), progi się różnią' : ` (${RANGE_TEXT[r]})`
      if (num(i.count) !== undefined || !rowNames(i.species).length) return `Gatunków wysokogórskich: ${plNum(c)}${how}.`
      const unknown = alpineNames(i).filter((n) => alpineStatus8110(n) === 'unknown')
      return `Gatunki wysokogórskie: ${c}${unknown.length ? `, w tym spoza katalogu: ${unknown.join(', ')}` : ''}${how}.`
    },
    warn: (i, ctx) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.count) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo liczba nie są puste.')
      const low = names.filter((n) => alpineStatus8110(n) === 'no')
      if (low.length && num(i.count) === undefined) parts.push(`Karta przykładowa nie liczy jako wysokogórskich – pominięte: ${low.join(', ')}. Jeśli je liczysz, wpisz liczbę wprost.`)
      const g = chosenGrade(i)
      const c = alpineCount(i)
      const r = rangeOf(ctx)
      if (g && c !== undefined && r && r !== 'sudety' && g !== gradeAlpine8110(c, r)) parts.push(`Wybrano ${g}, a z liczby gatunków wychodzi ${gradeAlpine8110(c, r)} – uzasadnij w opisie.`)
      const out = outsideTab2(ctx)
      if (!g && out && c !== undefined && gradeAlpine8110(c, 'tatry') !== 'FV')
        parts.push(`${out}: tab. 2 nie podaje progów – formularz stosuje tatrzańskie, a flora wysokogórska jest tu znacznie uboższa niż w Tatrach. Rozważ ocenę ekspercką.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      const c = num(i.count)
      return list || (c !== undefined ? `${plNum(c)} gat.` : i.none === 'yes' ? 'Brak' : '')
    },
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista wszystkich inwazyjnych gatunków obcych geograficznie dla siedliska, wraz z ich pokryciem na transekcie. Siedlisko jest mało podatne na wkraczanie gatunków obcych, ale intensywny ruch turystyczny w pobliżu niektórych stanowisk może w przyszłości sprzyjać ich zawlekaniu.',
    help: `Co wpisać: gatunki obce z pokryciem ${SURFACE} (dla „<1%” wpisz 0,5). Brak – „Nie stwierdzono”.

Progi (tab. 2): brak – FV; 1 gatunek o pokryciu <1% – U1; 2 lub więcej gatunków lub 1 gatunek o pokryciu >1% – U2. Dokładnie 1% (luka w tab. 2) i gatunek bez pokrycia formularz liczy do U1. Liczbę gatunków możesz wpisać wprost.

Praktyka: w żadnym cyklu (2013–2014, 2018, 2024) nie stwierdzono gatunków obcych na żadnym stanowisku – wszędzie FV; jeśli już, to pojedynczo przy ścieżkach i schroniskach. Sprawozdanie 2018 proponowało odebrać wskaźnikowi status kardynalnego (praktycznie nie notowane na tych wysokościach) – propozycja nie weszła. Karta z przewodnika (Dolina Pańszczyca 4): brak → FV.

Wskaźnik kardynalny.`,
    thresholds: { FV: 'Brak', U1: '1 gatunek o pokryciu <1%', U2: '2 lub więcej gatunków lub 1 gatunek o pokryciu >1%' },
    inputs: [
      speciesInput('Gatunki obce', `Obce gatunki inwazyjne z pokryciem ${SURFACE}, np. Impatiens parviflora 0,5.`),
      { kind: 'number', name: 'count', label: 'Liczba gatunków (opcjonalnie)', min: 0, help: 'Liczba gatunków obcych wpisana wprost – ma pierwszeństwo przed liczeniem z listy.' },
      { kind: 'number', name: 'total', label: 'Łączne pokrycie (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Łączne pokrycie gatunków obcych w % transektu – ma pierwszeństwo przed sumą z listy. Liczy się tylko przy jednym gatunku (próg 1%).' },
      NONE_FIELD('Brak gatunków obcych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków obcych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const n = num(i.count) ?? (rowNames(i.species).length ? distinct(rowNames(i.species)).length : i.none === 'yes' ? 0 : undefined)
      if (n === undefined) {
        const t = num(i.total)
        return t === undefined ? null : t > 0 ? (t > 1 ? 'U2' : 'U1') : 'FV'
      }
      const c = coverOf(i)
      return gradeAliens8110(n, typeof c === 'number' ? c : undefined)
    },
    explain: (i) => {
      const n = num(i.count) ?? distinct(rowNames(i.species)).length
      if (!n) return null
      const c = coverOf(i)
      return `Gatunków obcych: ${plNum(n)}${typeof c === 'number' ? `; łączne pokrycie ${pct(c)}` : ''}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0 || (num(i.count) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista, liczba albo pokrycie nie są puste.')
      const native = names.filter((n) => findSpecies8110(n) && !findSpecies8110(n)?.alien)
      if (native.length) parts.push(`To gatunki rodzime, nie obce: ${native.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'shrubs',
    label: 'Pokrycie przez drzewa i krzewy',
    parameter: 'structure',
    description:
      'Procentowe pokrycie drzew i krzewów na transekcie. Za krzewy uznaje się rośliny zdrewniałe o wysokości powyżej 50 cm. Podaje się gatunki tworzące tę warstwę i zwięźle opisuje ich rozmieszczenie (np. pojedyncze krzewy równomiernie na całej powierzchni, zwarte płaty w niższych partiach transektu).',
    help: `Co wpisać: drzewa i krzewy powyżej 50 cm (kosodrzewina, wierzba śląska, jarząb, świerk, limba, modrzew) z pokryciem ${SURFACE}. Łączne pokrycie wpisz wprost albo zostaw – formularz zsumuje listę. Brak – „Nie stwierdzono”. Rozmieszczenie opisz w polu opisu.

Progi (tab. 2): <5% – FV; 5–25% – U1; >25% – U2. Granice 5% i 25% formularz liczy do U1.

Rozjazd w praktyce: sprawozdania dawały FV przy pokryciu „1–5%”, „maksymalnie do 5%” (Kopa 2024) – tab. 2 daje przy dokładnie 5% już U1. Formularz idzie za tab. 2 i ostrzega. U1 dostawały stanowiska z ok. 10% (Szeroki Piarg pod Łopatą 3, Pod Diablakiem – kosodrzewina) i 20% (Żleb Prosty – Kocioł Małego Stawu, jarząb i wierzba śląska; silne zgryzanie przez zwierzęta korzystne). Zarastanie krzewami to zjawisko naturalne, wpisane w dynamikę siedliska – obniżona ocena nie jest przesłanką do działań. Sprawozdanie 2018 proponuje uczynić wskaźnik kardynalnym – propozycja nie weszła. Karta z przewodnika (Dolina Pańszczyca 4): 0% → FV.

Wskaźnik niekardynalny.`,
    thresholds: { FV: '<5%', U1: '5–25%', U2: '>25%' },
    inputs: [
      speciesInput('Drzewa i krzewy', `Drzewa i krzewy powyżej 50 cm z pokryciem ${SURFACE}, np. Pinus mugo 2, Salix silesiaca 1.`),
      { kind: 'number', name: 'total', label: 'Łączne pokrycie drzew i krzewów (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Łączne pokrycie drzew i krzewów w % powierzchni transektu – ma pierwszeństwo przed sumą z listy. Brak – wpisz 0.' },
      NONE_FIELD('Brak drzew i krzewów', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma drzew ani krzewów powyżej 50 cm – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Pojedyncze krzewy kosodrzewiny w dolnej części transektu (ok. 2%).', 'Gatunki i ich rozmieszczenie – trafi do „wartości” w karcie zamiast listy.'),
    ],
    suggest: (i) => {
      const c = coverOf(i)
      return typeof c === 'number' ? gradeShrubs8110(c) : null
    },
    explain: (i) => {
      const c = coverOf(i)
      if (c === 'present') return 'Drzewa i krzewy bez pokrycia – wpisz pokrycie gatunków albo łączne.'
      return typeof c === 'number' && c > 0 ? `Pokrycie drzew i krzewów: ${pct(c)}.` : null
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo pokrycie nie są puste.')
      const herbs = names.filter((n) => findSpecies8110(n) && !isWoody8110(n))
      if (herbs.length) parts.push(`To nie drzewa ani krzewy: ${herbs.join(', ')}.`)
      if (coverOf(i) === 5) parts.push('Dokładnie 5%: tab. 2 daje U1 (5–25%), a w sprawozdaniach „do 5%” oceniano na FV. Zdecyduj i uzasadnij.')
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'herbs',
    label: 'Pokrycie roślin zielnych',
    parameter: 'structure',
    description:
      'Oszacowanie powierzchni transektu porośniętej przez roślinność zielną (w %). Wartość w dużej mierze zależy od podtypu i zbiorowisk: piargi ruchome z roślinnością pionierską (8110-1) są zwykle nieznacznie pokryte, w podtypie 8110-2 zwarcie jest wielokrotnie wyższe, w skrajnych przypadkach niemal całkowite.',
    help: `Co wpisać: pokrycie roślin zielnych ${SURFACE} (bez mszaków i porostów, bez krzewów).

Progi (tab. 2): <50% – FV; 50–90% – U1; >90% – U2. Granice 50% i 90% formularz liczy do U1.

Przewodnik (przypis do tab. 2): wskaźnik o charakterze opisowym, nie służy do waloryzacji siedliska, ale w dłuższej perspektywie pozwala śledzić jego dynamikę (zmiany sukcesyjne, procesy denudacyjne). Mimo to tab. 2 podaje progi i sprawozdania je stosowały – formularz też. Wskaźnik niekardynalny, więc U1 nie obniża oceny struktury.

Praktyka: Tatry zwykle 5–40% (FV); 50–75% na stanowiskach z murawami, traworoślami Calamagrostion albo ziołoroślami Adenostyletum (Nad Czarnym Stawem Gąsienicowym 4, pod Rysami 4, Dolina Pięciu Stawów 2) → U1 – zjawisko naturalne, nie przeciwdziałać. Babia Góra 5–20%, Sudety 0–35% (FV). Sprawozdanie 2018 proponuje progi 50/75% (FV <50, U1 50–75, U2 >75) i status kardynalnego – nie weszło. Karta z przewodnika (Dolina Pańszczyca 4): 10% → FV.`,
    thresholds: { FV: '<50%', U1: '50–90%', U2: '>90%' },
    inputs: [
      { kind: 'number', name: 'value', label: 'Pokrycie roślin zielnych', unit: '%', min: 0, max: 100, required: true, help: 'Procent powierzchni transektu porośnięty roślinnością zielną (rzut pionowy, bez mszaków, porostów i krzewów).' },
      noteInput('Opis (opcjonalnie)', 'np. 10%, rozproszone kępy w dolnej części piargu.', 'Krótki opis, który trafi do „wartości” w karcie zamiast samej liczby.'),
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v === undefined ? null : gradeHerbs8110(v)
    },
    warn: (i, ctx) => {
      const v = num(i.value)
      return v !== undefined && v >= 50 && subtypeOf(ctx) === '8110-1'
        ? 'Podtyp 8110-1 (piargi ruchome) ma zwykle niewielkie pokrycie roślin zielnych – przy połowie transektu sprawdź podtyp (może 8110-2) albo opisz zarastanie.'
        : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const v = num(i.value)
      return v === undefined ? '' : pct(v)
    },
  },
  {
    id: 'habitatShare',
    label: 'Procent powierzchni siedliska na transekcie',
    parameter: 'structure',
    description:
      'Oszacowanie powierzchni transektu zajętej przez siedlisko (w %). Do siedliska wlicza się również fragmenty piargów o zerowym pokryciu roślinnością oraz płaty o charakterze pośrednim między zbiorowiskami piargowymi a murawami acydofilnymi (Juncion trifidi), ziołoroślami (Adenostylion alliariae) i traworoślami (Calamagrostion), a nawet zwarte murawy z udziałem wierzby wykrojonej (Salix retusa).',
    help: `Co wpisać: jaki procent transektu zajmuje siedlisko 8110 – z nagim rumoszem i płatami pośrednimi. Nie wlicza się płatów roślinności na tyle odmiennej, że nie należą do 8110 (np. typowe Adenostyletum alliariae, traworośla Calamagrostion, zwarte zarośla kosodrzewiny).

Progi (tab. 2): >50% – FV; 25–50% – U1; <25% – U2. Granice 25% i 50% formularz liczy do U1.

Praktyka: zwykle 80–100% (FV); Nad Czarnym Stawem Gąsienicowym 4 i pod Rysami 4 – 25–30% (resztę zajmują ziołorośla i traworośla) → U1, zjawisko naturalne; Pod Śnieżnikiem 2018 – do 10% (siedlisko zadeptane) → U2. Sprawozdanie 2018 zauważa, że wynik zależy od wyznaczenia transektu i granic płatu, i proponuje usunąć wskaźnik – nie weszło. Karta z przewodnika (Dolina Pańszczyca 4): 100% → FV.

Wskaźnik niekardynalny.`,
    thresholds: { FV: '>50%', U1: '25–50%', U2: '<25%' },
    inputs: [
      { kind: 'number', name: 'value', label: 'Udział siedliska na transekcie', unit: '%', min: 0, max: 100, required: true, help: 'Procent powierzchni transektu zajęty przez siedlisko, łącznie z nagim rumoszem i płatami o charakterze pośrednim.' },
      noteInput('Opis (opcjonalnie)', 'np. 100%; pozostała część transektu – ziołorośla Adenostyletum alliariae.', 'Krótki opis, który trafi do „wartości” w karcie zamiast samej liczby.'),
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v === undefined ? null : gradeHabitatShare8110(v)
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const v = num(i.value)
      return v === undefined ? '' : pct(v)
    },
  },
  {
    id: 'anthropo',
    label: 'Ślady antropopresji',
    parameter: 'structure',
    description:
      'Wszelkie ślady działalności człowieka w transekcie. Najczęstszym jej przejawem będą śmieci, rzadziej ścieżki lub wydeptane płaty roślinności. Obecność pojedynczych śmieci nie powinna automatycznie obniżać oceny wskaźnika.',
    help: `Co wybrać: rodzaj i nasilenie śladów działalności człowieka na transekcie (śmieci, elementy ekwipunku, ścieżki, wydeptywanie, narciarstwo poza trasami). Rodzaj opisz w polu opisu – karta przykładowa: „Rodzaj negatywnych oddziaływań i ich natężenie”.

Progi (tab. 2): brak lub znikome – FV; o średnim nasileniu – U1; wyraźne, oddziałujące negatywnie na strukturę i funkcje siedliska – U2. Pojedyncze śmieci nie powinny automatycznie obniżać oceny.

Rozjazd w praktyce: w Tatrach i na Babiej Górze pojedyncze śmieci, zgubiony kijek narciarski, wydeptywanie przy szlaku – FV (2013–2024). W Karkonoszach śmieci wywiane z grzbietu albo pozostawione przez turystów dawały U1 (2013, 2018, 2024), na Śnieżniku Kłodzkim U1 za blachy i wydeptywanie (2013), po uprzątnięciu i skanalizowaniu ruchu – FV (2024). Pod Śnieżnikiem 2018 – siedlisko zadeptane → U2. Wybierz klasę wg skali, a nie samej obecności śmieci, i opisz.

Wskaźnik niekardynalny.`,
    thresholds: thresholdsOf(ANTHROPO),
    inputs: [
      selectInput('Ślady antropopresji', ANTHROPO, 'Rodzaj i nasilenie śladów działalności człowieka na transekcie.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak.', 'Rodzaj negatywnych oddziaływań i ich natężenie – trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(ANTHROPO)),
    describe: (i) => note(i) || labelOf(ANTHROPO, i.choice),
  },
]

// ---------- pola stanowiska ----------

const s7120 = methodology7120.siteFields
const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu (zdjęcia fitosocjologicznego nr ${where === 'początku' ? 1 : where === 'środka' ? 2 : 3}), z odbiornika GPS (WGS84).

Dlaczego: przewodnik każe lokalizować każde zdjęcie GPS-em, z wysokością, nachyleniem i ekspozycją – bez tego za kilka lat nie da się odtworzyć transektu na stożku piargowym.`

const siteFields: FieldDef[] = [
  {
    kind: 'select',
    name: 'subtype',
    label: 'Podtyp siedliska',
    options: SUBTYPE_OPTIONS,
    required: true,
    hint: 'Tatry: 8110-1 (piargi ruchome) albo 8110-2 (utrwalone); Sudety: 8110-3; Babia Góra: 8110-4.',
    help: `Podtyp przeważający na transekcie (przewodnik, pkt 2):
• 8110-1 – piargi krzemianowe z roślinnością pionierską w Tatrach: ruchome piargi, niewielkie pokrycie roślinnością, głównie Oxyrio digynae-Saxifragetum carpaticae (podzespoły typicum i saxifragetosum wahlenbergii);
• 8110-2 – utrwalone piargi krzemianowe w Tatrach: zwarcie roślinności zwykle wyższe, miejscami ponad 80%; najczęściej Luzuletum alpino-pilosae, płaty nawiązujące do Juncion trifidi, Calamagrostion, Adenostylion;
• 8110-3 – rumowiska skalne ze zmienką górską i porostami w Sudetach (Karkonosze, Śnieżnik Kłodzki): granitowe gołoborza, znikome pokrycie roślin naczyniowych, Cryptogrammetum crispae, mchy i porosty;
• 8110-4 – rumowiska skalne na Babiej Górze: piaskowiec magurski, luźna pokrywa roślin naczyniowych, mchów i porostów (podtyp wyróżniony w 2014 r.).
Na stanowisku często jest mozaika 8110-1 i 8110-2 albo zbiorowiska pośrednie – wybierz przeważający.

Dlaczego: karta przykładowa podaje podtyp obok kodu („8110-1: Piargi krzemianowe z roślinnością pionierską w Tatrach”); podtyp podpowiada pasmo (od niego zależą progi gatunków typowych i wysokogórskich), gdy nie wybierzesz go wprost.`,
  },
  {
    kind: 'select',
    name: 'massif',
    label: 'Pasmo górskie',
    options: MASSIF_OPTIONS,
    required: true,
    hint: 'Od pasma zależą progi gatunków typowych i wysokogórskich (tab. 2).',
    help: `Pasmo, w którym leży stanowisko: Tatry, Babia Góra (region alpejski), Karkonosze, Śnieżnik Kłodzki (region kontynentalny). Bieszczady – sprawozdanie 2024 proponuje tam nowe stanowisko.

Dlaczego: tab. 2 podaje osobne progi liczby gatunków typowych i wysokogórskich dla Tatr, Karkonoszy i Śnieżnika Kłodzkiego. Babii Góry i Bieszczadów tab. 2 nie wymienia – formularz stosuje progi tatrzańskie i ostrzega, gdy wynik jest poniżej FV (flora uboższa niż w Tatrach). Oceny regionu liczy się osobno dla regionu alpejskiego i kontynentalnego.`,
  },
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Dolina Pańszczyca 4',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – dolina, kocioł albo piarg z numerem, np. „Dolina Pańszczyca 4”, „Wielki Piarg nad Morskim Okiem 1”, „Szeroki Żleb”, „Mały Śnieżny Kocioł – piarg”, „Śnieżnik Kłodzki”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego stanowiska.`,
  },
  pickField(s7120, 'guid'),
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. referencyjne',
    help: `Typ stanowiska w sieci monitoringu, np. „referencyjne” – typowo wykształcony płat w bardzo dobrym stanie (tak w karcie z przewodnika). Przewodnik zaleca, by przy dużych zasobach część stanowisk była referencyjna, a część w płatach nietypowych albo zagrożonych. Jeśli nie wiesz, zostaw puste.`,
  },
  {
    kind: 'text',
    name: 'areaName',
    label: 'Nazwa obszaru Natura 2000',
    placeholder: 'np. Tatry PLC120001',
    help: 'Obszar Natura 2000, w którym leży stanowisko: Tatry PLC120001, Babia Góra (Ostoja Babiogórska) PLH120001, Karkonosze PLH020006 / PLC020001, Góry Bialskie i Grupa Śnieżnika PLH020016 (karta z przewodnika: „Tatry PLC 120001”).',
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Oxyrio digynae-Saxifragetum carpaticae',
    help: 'Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi: Oxyrio digynae-Saxifragetum carpaticae (typicum, saxifragetosum wahlenbergii), Cryptogrammetum crispae (Androsacion alpinae), Luzuletum alpino-pilosae (Salicion herbaceae); płaty nawiązujące do Juncion trifidi, Calamagrostion, Adenostylion; zbiorowiska mszaków i porostów (Polygonato-Oligotrichetum, Umbilicarion cylindricae, Rhizocarpion alpicolae, Andreaeion petrophilae).',
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 6,
    required: true,
    hint: 'Położenie piargu, przebieg transektu, pokrycie roślinnością, frakcja rumoszu, sąsiedztwo, szlaki.',
    help: `Krótka charakterystyka stanowiska:
• gdzie leży piarg albo gołoborze (pod jaką ścianą, w jakim kotle) i jak poprowadzono transekt (w górę, na ukos, w poprzek stożka);
• stopień utrwalenia i pokrycie roślinnością, zbiorowiska, frakcja rumoszu;
• kosodrzewina i inne krzewy, płaty murawowe, ziołoroślowe, traworoślowe;
• erozja, lawiny, szlaki turystyczne, wydeptywanie, śmieci.
Karta z przewodnika: „Stanowisko usytuowane jest pod Wierchem pod Fajkami w Dolinie Pańszczyca. Transekt poprowadzono w pobliżu rynny erozyjnej…”.`,
  },
  {
    kind: 'text',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    required: true,
    placeholder: 'np. 0,4',
    help: 'Powierzchnia płatów siedliska na stanowisku, w hektarach (karta z przewodnika: 0,4 ha). Sprawozdanie 2024: od 0,04 ha (Kopa) i 0,08 ha (Żleb Poszukiwaczy Skarbów) do 40 ha (kompleks piargów w Dolinie Pańszczycy), zwykle poniżej 1–2,5 ha. Wartości odczytane z mapy są zaniżone (bez nachylenia).',
  },
  pickField(s7120, 'protectedAreas', {
    label: 'Obszary chronione (z pominięciem obszaru Natura 2000)',
    hint: 'Np. „Tatrzański Park Narodowy”.',
    help: `Inne formy ochrony obejmujące stanowisko: Tatrzański, Babiogórski, Karkonoski Park Narodowy (strefa ochrony ścisłej), rezerwat „Śnieżnik Kłodzki” w Śnieżnickim Parku Krajobrazowym. W 2024 r. 31 z 32 stanowisk leżało w parkach narodowych.

Dlaczego: ochrona bierna w strefie ścisłej to najlepsza forma ochrony piargów – wpływa na perspektywy.`,
  }),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. Tatrzański Park Narodowy',
    help: 'Kto zarządza terenem: park narodowy (TPN, BgPN, KPN) albo nadleśnictwo (Śnieżnik – Nadleśnictwo Międzylesie). Przewodnik: przed badaniami trzeba uzyskać zgodę parku na poruszanie się poza szlakami i na zbiór okazów taksonów krytycznych.',
  },
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu (zdjęcie nr 1)', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu (zdjęcie nr 2)', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu (zdjęcie nr 3)', required: true, help: coordHelp('końca') },
  pickField(s7120, 'transect', {
    defaultValue: '100x10 m',
    hint: 'Szerokość 10 m, długość dostosowana do stożka, nie mniej niż 100 m; na gołoborzach – kilka bliskich płatów.',
    help: `Przewodnik: na wybranym stożku piargowym wyznacza się transekt o szerokości 10 m i długości dostosowanej do wielkości stożka, nie krótszy niż 100 m – w górę, na ukos albo w poprzek stożka. Na gołoborzach dopuszczalne jest wyznaczenie jako powierzchni badawczej kilku izolowanych płatów położonych blisko siebie – opisz to w uwagach. W karcie z przewodnika: 140x10 m.

Dlaczego: wszystkie dane liczbowe i listy gatunków odnoszą się do transektu – następny obserwator musi wyznaczyć ten sam.`,
    warn: (v) => {
      const m = String(v ?? '').replace(/,/g, '.').match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/)
      if (!m) return null
      const [len, wid] = [Number(m[1]), Number(m[2])].sort((x, y) => y - x)
      return len >= 100 && wid === 10 ? null : 'Przewodnik: szerokość 10 m, długość nie mniejsza niż 100 m. Opisz odstępstwo w uwagach (np. kilka izolowanych płatów na gołoborzu).'
    },
  }),
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 1815–1880',
    help: 'Wysokość nad poziomem morza – liczba albo zakres od dolnego do górnego końca transektu (karta z przewodnika: 1815–1880 m). Siedlisko występuje w piętrach subalpejskim, alpejskim i subniwalnym; na Babiej Górze i Śnieżniku znacznie niżej niż w Tatrach.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 15.08.2013',
    required: true,
    hint: 'Optymalnie lipiec i sierpień; czerwiec i wrzesień – ryzyko przeoczenia gatunków.',
    help: `Dzień badań terenowych. Przewodnik: optymalny termin to lipiec i sierpień; w czerwcu i we wrześniu (krótki okres wegetacyjny) badania obarczone są ryzykiem niezidentyfikowania taksonów o krótkim cyklu życiowym. Monitoring powtarza się co 5 lat.

Praktyka: 2018 – 31.07–8.09; 2024 – 20.07–1.09 (terminy bez wpływu na wyniki). Formularz ostrzega miękko w czerwcu i we wrześniu, mocniej poza czerwcem – wrześniem.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const [, mm] = v.split('-').map(Number)
      if (mm < 6 || mm > 9) return 'Termin poza sezonem wegetacyjnym w górach (czerwiec – wrzesień). Wyniki mogą być niepełne – opisz powód w uwagach.'
      if (mm === 6 || mm === 9) return 'Termin poza optymalnym (lipiec – sierpień): ryzyko przeoczenia taksonów o krótkim cyklu życiowym. Dopuszczalny, ale zapisz to w uwagach.'
      return null
    },
  },
  pickField(s7120, 'observer', {
    label: 'Ekspert lokalny',
    help: `Imię i nazwisko eksperta lokalnego, który wykonał obserwację i odpowiada za dane (w karcie z przewodnika: „Ekspert lokalny”).

Dlaczego: ocena zawiera elementy oceny eksperckiej (np. które gatunki są wysokogórskie) – trzeba wiedzieć, kogo zapytać o uzasadnienie.`,
  }),
  {
    kind: 'text',
    name: 'additionalExperts',
    label: 'Dodatkowi eksperci',
    placeholder: 'np. —',
    help: 'Pozostali obserwatorzy. Przewodnik odradza prowadzenie monitoringu w pojedynkę (trudny, niebezpieczny teren, w Tatrach niedźwiedzie). Brak – zostaw puste albo wpisz „—”.',
  },
]

// ---------- zdjęcia fitosocjologiczne: 3 × 25 m² ----------

const r7120 = methodology7120.releves.fields
const LAYERS = 'Zwarcie i wysokość warstw A, B, C, D'
const layerField = (name: string, help: string) => pickField(r7120, name, { help, group: LAYERS })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia (WGS84). Trzy zdjęcia po 25 m² – na początku, w środku i na końcu transektu.' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach (karta z przewodnika: 1880, 1840, 1815 m).' }),
  pickField(r7120, 'area', {
    defaultValue: 25,
    help: 'Powierzchnia zdjęcia w m² – przewodnik: 25 m², metodą Braun-Blanqueta.',
    warn: (v) => {
      const a = num(v)
      return a !== undefined && a !== 25 ? 'Przewodnik zaleca zdjęcia o powierzchni 25 m². Opisz odstępstwo w uwagach.' : null
    },
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach (karta z przewodnika: 45°, 35°, 5°). Stożki piargowe bywają bardzo strome.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, NW) – przewodnik każe go zanotować (karta: N, NE, E). Dla powierzchni płaskiej wpisz „płasko”.' }),
  layerField('coverA', 'Warstwa A – drzewa: procent powierzchni zdjęcia. Na piargach zwykle brak – zostaw puste.'),
  layerField('coverB', 'Warstwa B – krzewy (kosodrzewina, wierzba śląska, jarząb): procent powierzchni zdjęcia. Zwykle brak albo pojedyncze krzewy w dolnej części piargu.'),
  layerField('coverC', 'Warstwa C – rośliny zielne i krzewinki: procent powierzchni zdjęcia (karta z przewodnika: 5–20%).'),
  layerField('coverD', 'Warstwa D – mchy, wątrobowce i porosty: procent powierzchni zdjęcia (karta z przewodnika: 1–10%). W Sudetach i na Babiej Górze często główny składnik.'),
  layerField('heightA', 'Warstwa A – typowa wysokość drzew, w metrach. Zwykle brak.'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów, w metrach.'),
  layerField('heightC', 'Warstwa C – typowa wysokość roślin zielnych, w centymetrach (karta z przewodnika: 10–15 cm).'),
  layerField('heightD', 'Warstwa D – wysokość mchów i porostów, w centymetrach (karta z przewodnika: 5 cm).'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Oxyrio digynae-Saxifragetum carpaticae',
    help: 'Jednostka fitosocjologiczna zdjęcia, np. Oxyrio digynae-Saxifragetum carpaticae, Luzuletum alpino-pilosae, Cryptogrammetum crispae.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w zdjęciu z ilościowością w skali Braun-Blanqueta (r, +, 1–5), z mchami i porostami (warstwa D). Taksony krytyczne (Hieracium, Festuca, Thymus, Agrostis, Taraxacum, Alchemilla, Poa) zbieraj do oznaczenia tylko za zgodą parku; gatunków chronionych nie zbieraj. Warstwa podpowiada się sama po wyborze gatunku.',
  }),
]

export const methodology8110: Methodology = {
  code: '8110',
  name: 'Piargi i gołoborza krzemianowe',
  source:
    'Stawowczyk K., Kozłowska-Kozak K., Kozak M. 2015, 8110 Piargi i gołoborza krzemianowe, [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. IV, GIOŚ, s. 196–210 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2013–2014, 2015–2018 i 2023–2025.',
  siteFields,
  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj 3 zdjęcia fitosocjologiczne po 25 m² metodą Braun-Blanqueta – na początku, w środku i na końcu transektu. Każde zlokalizuj GPS-em, z wysokością, nachyleniem i ekspozycją; z mchami i porostami w warstwie D.',
    fields: releveFields,
  },
  indicators,
  prospects: {
    description:
      'Ocena realnych możliwości utrzymania siedliska we właściwej kondycji, uwzględniająca jego obecny stan zachowania oraz czynniki mogące na nie oddziaływać w najbliższej przyszłości. W przypadku lokalizacji siedliska na obszarze chronionym należy to odnotować.',
    help: `Weź pod uwagę: położenie w strefie ochrony ścisłej parku narodowego (ochrona bierna – najlepsza forma ochrony piargów), odległość od szlaków turystycznych, wydeptywanie i śmieci, narciarstwo poza trasami, sukcesję (kosodrzewina, wierzba śląska, jarząb w niżej położonych płatach – w przyszłości przyspieszaną przez zmiany klimatu), a po stronie plusów – erozję i lawiny, które utrzymują piarg w stanie pionierskim.

Praktyka: Tatry, Babia Góra i Karkonosze – FV na wszystkich stanowiskach (2013–2024). Śnieżnik Kłodzki – U1 w 2013 i 2018 r. (wydeptywanie, zaśmiecanie, planowana wieża widokowa), FV w 2024 r. po uprzątnięciu i częściowym skanalizowaniu ruchu turystycznego; Pod Śnieżnikiem 2018 – U2 (siedlisko zanikło). Karta z przewodnika (Dolina Pańszczyca 4): obszar ochrony ścisłej TPN, z dala od szlaków → FV.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Perspektywy zachowania siedliska niezbyt dobre, obserwuje się oddziaływanie czynników, które mogą pogorszyć jego stan zachowania',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },
  impactCodes: [
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'E01.04', name: 'Inne typy zabudowy' },
    { code: 'G01.04.01', name: 'Turystyka górska i wspinaczka' },
    { code: 'G01.06', name: 'Narciarstwo, narciarstwo pozatrasowe' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'G05.04', name: 'Wandalizm' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'L04', name: 'Lawina' },
    { code: 'L05', name: 'Zapadnięcie się terenu, osuwisko' },
    { code: 'M01', name: 'Zmiany warunków abiotycznych' },
    { code: 'U', name: 'Nieznane zagrożenie lub nacisk' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],
  otherFields: [
    ...methodology7120.otherFields.flatMap((f): FieldDef[] => {
      if (f.name === 'otherValues')
        return [
          {
            ...f,
            hint: 'Np. gatunki wysokogórskie rzadkie w Polsce, rośliny chronione, endemity.',
            help: 'Wartości przyrodnicze stanowiska poza samym siedliskiem: gatunki wysokogórskie rzadkie w Polsce, gatunki chronione i zagrożone, endemity (np. skalnica tatrzańska), sąsiednie siedliska (6150 murawy acydofilne, 4070 kosodrzewina, 6430 ziołorośla, 8220 ściany skalne). Karta z przewodnika: „Na stanowisku występuje wiele gatunków wysokogórskich, rzadkich w Polsce. Niektóre z nich to rośliny objęte ochroną ścisłą.” Brak – „Nie stwierdzono”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            label: 'Wykonywane działania ochronne',
            help: 'Jakie działania ochronne wykonano: ochrona ścisła w parku narodowym (ochrona bierna), sprzątanie śmieci przy szlakach, ogrodzenia i kanalizacja ruchu turystycznego (Śnieżnik Kłodzki 2023). Karta z przewodnika: „Stanowisko znajduje się w obrębie obszaru ochrony ścisłej Tatrzańskiego Parku Narodowego, z dala od przebiegu szlaków turystycznych.” Brak – „Brak”.',
          },
          {
            kind: 'textarea',
            name: 'proposals',
            label: 'Propozycje wprowadzenia działań ochronnych',
            rows: 3,
            hint: 'Np. „Utrzymać dotychczasowy status ochronny”, barierki przy szlaku.',
            help: 'Jakie działania proponujesz. Najlepsza forma ochrony 8110 to ochrona bierna; ochrona czynna tylko przy presji turystów – barierki w miejscach, gdzie turyści zbaczają ze szlaku, grodzenie rumowisk (Śnieżnik). Zarastania przez krzewy i ziołorośla nie należy zwalczać – to naturalna dynamika. Karta z przewodnika: „Utrzymać dotychczasowy status ochronny.”',
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
            help: 'Dlaczego monitoring jest (albo nie jest) potrzebny. Karta z przewodnika: rzadkość siedliska, modelowe płaty piargu z licznymi gatunkami wysokogórskimi. W 2024 r. zrezygnowano z 8 stanowisk – Pod Śnieżnikiem (siedlisko zanikło, teren rozdeptany) i 7 tatrzańskich lub babiogórskich (poprawa reprezentatywności sieci).',
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
                  ? 'Karta z przewodnika podaje przy ocenie ogólnej udział powierzchni siedliska o różnym stanie zachowania na stanowisku (Dolina Pańszczyca 4: FV 100%, U1 –, U2 –). Trzy liczby powinny dać razem 100%.'
                  : `Procent powierzchni siedliska na stanowisku w stanie ${g === 'U1' ? 'niezadowalającym (U1)' : 'złym (U2)'}.`,
            }),
          ),
          {
            ...f,
            help: `${f.help ?? ''}\n\nDla 8110 zapisz tu także rok badań, uwagi metodyczne (termin, karta przykładowa: „Optymalny termin obserwacji – lipiec, sierpień”), odstępstwa od transektu (krótszy niż 100 m, kilka płatów na gołoborzu) i zbiór okazów taksonów krytycznych.`.trim(),
          },
        ]
      return [f]
    }),
  ],
  speciesCatalog: SPECIES_8110.map((s) => ({ value: s.latin, label: s.polish, layer: defaultLayer8110(s) })),
  speciesInfo: (name) => {
    const s = findSpecies8110(name)
    if (!s) return undefined
    if (s.woody) return 'drzewo albo krzew'
    if (s.alien) return 'gatunek obcy'
    const parts: string[] = []
    if (s.typical) parts.push(`gatunek typowy 8110${s.subtypes?.length ? ` (${s.subtypes.join(', ')})` : ''}${s.typical === 'report' ? ' – wg sprawozdań' : ''}`)
    if (s.alpine) parts.push(`wysokogórski${s.alpine === 'report' ? ' (wg sprawozdania 2024)' : ''}`)
    return parts.length ? parts.join('; ') : 'gatunek towarzyszący'
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator8110 = (id: string): IndicatorDef => {
  const i = methodology8110.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 8110`)
  return i
}
