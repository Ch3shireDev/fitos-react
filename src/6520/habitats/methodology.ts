// Metodyka 6520 (górskie łąki konietlicowe i mietlicowe użytkowane ekstensywnie, Polygono-Trisetion i Arrhenatherion)
// jako dane. Źródło: Korzeniak J. 2012, „6520 Górskie łąki konietlicowe i mietlicowe użytkowane ekstensywnie
// (Polygono-Trisetion i Arrhenatherion)” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny,
// cz. III, GIOŚ, s. 95–108 (tab. 1 i 2, lista wskaźników kardynalnych, karta „Lasówka”), z praktyką oceny ze sprawozdań
// z monitoringu 2009–2011 (badania 2009–2010), 2015–2018 (badania 2017–2018) i 2023–2025 (badania 2024–2025).
// Siedlisko niepriorytetowe, region alpejski (Karpaty) i kontynentalny (Sudety). Transekt 10 × 200 m (albo prostokąt
// o innych wymiarach, równy 20 arom), trzy zdjęcia fitosocjologiczne po 25 m²: na obu końcach i w środku transektu.
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_6520,
  REGION_LABELS_6520,
  SPECIES_6520,
  defaultLayer6520,
  findSpecies6520,
  isAlien6520,
  isCharacteristic6520,
  isExpansive6520,
  isHighAlien6520,
  isStrongExpansive6520,
  isWoody6520,
  speciesKey6520,
  type Region6520,
} from './species'

// ---------- progi liczbowe (tab. 2) ----------

/**
 * Procent powierzchni zajęty przez siedlisko na transekcie: 80–100% FV; 60–70% U1; 50% i mniej U2. Luki tab. 2
 * (powyżej 50 do 60% i powyżej 70 do 80%) formularz liczy do U1 – tak oceniano w 2024 r. („50–80% powierzchni
 * transektu – ocena U1”, region alpejski).
 */
export const gradePercent6520 = (p: number): Grade => (p >= 80 ? 'FV' : p > 50 ? 'U1' : 'U2')

/** Gatunki charakterystyczne: liczne (>5) FV; średnioliczne (3–5) U1; nieliczne (dwa i mniej) U2. */
export const gradeCharacteristic6520 = (n: number): Grade => (n > 5 ? 'FV' : n >= 3 ? 'U1' : 'U2')

/**
 * Rodzime gatunki ekspansywne roślin zielnych. Tab. 2 podaje liczbowo tylko próg 10% dla pojedynczego gatunku silnie
 * ekspansywnego; resztę („niewielkie pokrycie”, „średnioliczne”, „liczne i o znacznym pokryciu”) formularz czyta tak:
 * U2 – któryś gatunek silnie ekspansywny (z tab. 1) pokrywa ponad 10% albo łączne pokrycie ekspansywnych przekracza 50%
 * (2016–2018: „udział gatunków ekspansywnych był znaczny, zwykle ok. 50% – U2”); U1 – gatunek silnie ekspansywny
 * powyżej 1% (do 10%) albo łącznie ponad 30%; FV – pozostałe (silnie ekspansywne tylko znikomo, ≤1%). Próg 30%
 * to interpretacja – karta przykładowa (dziurawiec czteroboczny 30%, reszta znikomo) dała FV.
 */
export function gradeExpansive6520(maxStrong: number, total: number): Grade {
  if (maxStrong > 10 || total > 50) return 'U2'
  if (maxStrong > 1 || total > 30) return 'U1'
  return 'FV'
}

/**
 * Obce gatunki inwazyjne (pokrycie transektu, %): brak lub pojedyncze osobniki (do 0,5% na gatunek) gatunków o niskim
 * stopniu inwazyjności – FV; o niskim stopniu poniżej 5% albo pojedyncze osobniki gatunków wysoce inwazyjnych – U1;
 * wysoce inwazyjne w większym pokryciu albo niskiego stopnia na ponad 5% transektu – U2. Dokładnie 5% → U1.
 */
export function gradeAliens6520(high: { count: number; total: number }, low: { count: number; total: number }): Grade {
  if (high.total > SINGLE * high.count || low.total > 5) return 'U2'
  if (high.count > 0 || low.total > SINGLE * low.count) return 'U1'
  return 'FV'
}

/** Ekspansja krzewów i podrostu drzew – łączne pokrycie: <1% FV; 1–5% U1 (obie granice); >5% U2. */
export const gradeShrubs6520 = (cover: number): Grade => (cover < 1 ? 'FV' : cover <= 5 ? 'U1' : 'U2')

/** Wojłok – średnia grubość: <2 cm FV; 2–5 cm U1 (obie granice); >5 cm U2. */
export const gradeLitter6520 = (cm: number): Grade => (cm < 2 ? 'FV' : cm <= 5 ? 'U1' : 'U2')

/** Pojedyncze osobniki = pokrycie do 0,5% (wpisz 0,5). */
const SINGLE = 0.5
/** Gatunek ekspansywny o pokryciu do 1% (znikomym, „+”) nie zmienia oceny. */
const TRACE = 1

const pct = (v: number) => `${plNum(v)}%`
const round1 = (n: number) => Math.round(n * 10) / 10
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey6520(n), n])).values()]
const regionOf = (ctx?: IndicatorContext) => String(ctx?.site?.region ?? '') as Region6520 | ''

/** Suma pokrycia wierszy listy spełniających warunek; 'present' – są wiersze, ale bez pokrycia; undefined – brak wierszy. */
function sumCover(list: unknown, pred: (name: string) => boolean = () => true): number | 'present' | undefined {
  const rows = speciesRows(list).filter((r) => r.name?.trim() && pred(r.name.trim()))
  if (!rows.length) return undefined
  const covers = rows.map((r) => num(r.cover)).filter((c): c is number => c !== undefined)
  return covers.length ? round1(covers.reduce((a, b) => a + b, 0)) : 'present'
}

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'other', label: 'Inne kombinacje (np. niewielki ubytek areału w wyniku zarastania albo zabudowy)', grade: 'U1' },
  { value: 'decrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi w literaturze', grade: 'U2' },
  { value: 'lost', label: 'Siedlisko zanikło na stanowisku (np. łąka kośna przekształciła się w pastwisko – praktyka 2024)', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const SPATIAL: GradedOption[] = [
  { value: 'none', label: 'Brak fragmentacji lub fragmentacja nieznaczna', grade: 'FV' },
  { value: 'medium', label: 'Średni stopień fragmentacji (płaty po kilkanaście arów)', grade: 'U1' },
  { value: 'strong', label: 'Duży stopień fragmentacji (płaty po kilka arów)', grade: 'U2' },
]
const ECOTONE: GradedOption[] = [
  { value: 'none', label: 'Brak ekotonu lub brak w ekotonie gatunków ekspansywnych', grade: 'FV' },
  { value: 'moderate', label: 'Umiarkowany stopień rozprzestrzeniania się gatunków mogących stanowić zagrożenie dla łąk', grade: 'U1' },
  { value: 'strong', label: 'W ekotonie zaznacza się ekspansja gatunków stanowiących potencjalne zagrożenie dla łąk', grade: 'U2' },
]
export const REGION_OPTIONS: SelectOption[] = [
  { value: '', label: '—' },
  ...(Object.keys(REGION_LABELS_6520) as Region6520[]).map((r) => ({ value: r, label: REGION_LABELS_6520[r] })),
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
/** Ostrzeżenie, gdy ocena ekspercka różni się od wyliczonej. */
const choiceWarn = (i: InputValues, calc: Grade | null, what: string): string | null => {
  const g = chosenGrade(i)
  return g && calc && g !== calc ? `Wybrano ${g}, a z ${what} wychodzi ${calc} – uzasadnij w opisie.` : null
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

const SURFACE = 'w % powierzchni transektu (przybliżony procent; gatunki ze znikomym pokryciem „+” – zostaw puste albo wpisz 0,5)'

// ---------- gatunki charakterystyczne ----------

const characteristicNames = (i: InputValues, ctx?: IndicatorContext) => distinct(rowNames(i.species).filter((n) => isCharacteristic6520(n, regionOf(ctx))))
function characteristicCount(i: InputValues, ctx?: IndicatorContext): number | undefined {
  const c = num(i.count)
  if (c !== undefined) return c
  return rowNames(i.species).length ? characteristicNames(i, ctx).length : undefined
}
const characteristicCalc = (i: InputValues, ctx?: IndicatorContext): Grade | null => {
  const c = characteristicCount(i, ctx)
  return c === undefined ? null : gradeCharacteristic6520(c)
}

// ---------- gatunki ekspansywne ----------

interface ExpansiveCalc {
  maxStrong: number
  /** Łączne pokrycie gatunków ekspansywnych o pokryciu powyżej 1% (znikome „+” się nie liczą). */
  total: number
  strong: string[]
  trace: string[]
}
/** Lista bez gatunków charakterystycznych i obcych; wiersz bez pokrycia = znikome „+”. */
function expansiveCalc(i: InputValues, ctx?: IndicatorContext): ExpansiveCalc | null {
  const rows = speciesRows(i.species).filter((r) => r.name?.trim() && !isCharacteristic6520(r.name.trim(), regionOf(ctx)) && !isAlien6520(r.name.trim()))
  if (!rows.length) return null
  let maxStrong = 0
  let total = 0
  const strong: string[] = []
  const trace: string[] = []
  for (const r of rows) {
    const name = r.name.trim()
    const c = num(r.cover) ?? 0
    if (c <= TRACE) trace.push(name)
    else total += c
    if (isStrongExpansive6520(name)) {
      strong.push(name)
      maxStrong = Math.max(maxStrong, c)
    }
  }
  return { maxStrong, total: round1(total), strong: distinct(strong), trace: distinct(trace) }
}
function expansiveSuggest(i: InputValues, ctx?: IndicatorContext): Grade | null {
  const t = num(i.total)
  const e = expansiveCalc(i, ctx)
  if (t !== undefined) return gradeExpansive6520(e?.maxStrong ?? 0, t)
  if (e) return gradeExpansive6520(e.maxStrong, e.total)
  if (rowNames(i.species).length) return 'FV' // same gatunki charakterystyczne albo obce
  return i.none === 'yes' ? 'FV' : null
}

// ---------- obce gatunki inwazyjne ----------

function aliensSplit(i: InputValues) {
  const rows = speciesRows(i.species).filter((r) => r.name?.trim())
  const high = rows.filter((r) => isHighAlien6520(r.name.trim()))
  const low = rows.filter((r) => !isHighAlien6520(r.name.trim()))
  const missing = rows.some((r) => num(r.cover) === undefined)
  const sum = (rs: typeof rows) => round1(rs.reduce((a, r) => a + (num(r.cover) ?? 0), 0))
  return { rows, high, low, missing, highTotal: sum(high), lowTotal: sum(low) }
}

// ---------- krzewy, wojłok ----------

function shrubsCover(i: InputValues): number | 'present' | undefined {
  const t = num(i.total)
  if (t !== undefined) return t
  const s = sumCover(i.species)
  if (s !== undefined) return s
  return i.none === 'yes' ? 0 : undefined
}
const litterMean = (i: InputValues) => num(i.mean)
const litterCalc = (i: InputValues): Grade | null => {
  const m = litterMean(i)
  return m === undefined ? null : gradeLitter6520(m)
}
const percentCalc = (i: InputValues): Grade | null => {
  const p = num(i.percent)
  return p === undefined ? null : gradePercent6520(p)
}

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description: 'Powierzchnia płatów łąk górskich na stanowisku i jej zmiany w porównaniu z wcześniejszymi badaniami albo danymi w literaturze.',
    help: `Co wybrać: czy areał łąki na stanowisku jest stabilny, czy maleje. Samą powierzchnię (np. „1,5 ha (±0,1 ha)”) wpisz obok – trafi do „wartości”, gdy nie ma opisu.

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; inne kombinacje – U1; wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi w literaturze – U2. Przy pierwszym badaniu bez danych do porównania – „Brak danych” (XX) albo ocena ekspercka.

Praktyka 2024–2025: FV na ok. 77–79% stanowisk; U1 przy niewielkim ubytku przez zarośla (Łodyna, Trzciana) albo zabudowę (Strzebowiska) i tam, gdzie zniszczona łąka nie ma szans na pełną regenerację (Spalona Góra); U2 przy wyraźnym spadku – brak użytkowania, zamiana na grunty orne, trawniki, ogrody, zabudowa rekreacyjna (Ostre Hala Jaworzyna, Ściszków Groń, Kozia Hala, Zimne Wody). Na Płazówce łąka kośna przekształciła się w pastwisko – siedlisko zanikło (U2). W skali obszaru średnia ze stanowisk zawyża ocenę, bo do monitoringu wybiera się płaty koszone (sprawozdanie 2009–2011). Karta z przewodnika: 1,5 ha (±0,1 ha), „areał stabilny” → FV.`,
    thresholds: thresholdsOf(AREA.filter((o) => o.grade !== 'XX' && o.value !== 'lost')),
    inputs: [
      selectInput('Zmiana powierzchni', AREA, 'Jak zmieniła się powierzchnia łąki od poprzedniego badania albo wobec danych z literatury.'),
      { kind: 'text', name: 'areaText', label: 'Powierzchnia (opcjonalnie)', placeholder: 'np. 1,5 ha (±0,1 ha)', help: 'Powierzchnia płatów łąki na stanowisku, np. „1,5 ha (±0,1 ha)” – trafi do pola „wartość”, gdy nie ma opisu.' },
      noteInput('Opis (opcjonalnie)', 'np. Areał stabilny, 1,5 ha (±0,1 ha).', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => note(i) || String(i.areaText ?? '').trim() || labelOf(AREA, i.choice),
  },
  {
    id: 'percent',
    label: 'Procent powierzchni zajęty przez siedlisko na transekcie',
    parameter: 'structure',
    description: 'Procentowy udział siedliska na transekcie szacowany w dziesiątkach procentów w trakcie oceny eksperckiej. Wskaźnik pozwala na określenie stosunków powierzchniowych siedliska dokładniej niż dla stanowiska.',
    help: `Co wpisać: jaki procent powierzchni transektu zajmuje łąka górska (6520), w dziesiątkach procent – np. 100, 80, 60. Resztę zajmują np. borówczyska, płaty wilgotnej łąki, psiary, zarośla.

Progi (tab. 2): 80–100% – FV; 60–70% – U1; 50% i mniej – U2. Luki tabeli (51–59% i 71–79%) formularz liczy do U1 – tak robiło sprawozdanie 2024 („50–80% powierzchni transektu – U1”).

Praktyka: 2024 – U2 na Jaworzynie Kamienicka, Las, Ogorzali, Smolnik (połowa transektu), Kozia Hala, Wójtówka, Zimne Wody; spadek zwykle na rzecz zarośli, borówczysk, wilgotnych psiar albo zabudowy. Karta z przewodnika (Lasówka, 2009): „80% i powoli zmniejsza się na skutek procesu ubożenia łąki” → U1, ale sprawozdanie 2016–2018 przyznaje, że ta ocena była zaniżona i niezgodna z opublikowaną później waloryzacją (80% to FV). Jeśli oceniasz inaczej niż z progów (np. bierzesz pod uwagę trend), wybierz ocenę i uzasadnij w opisie.`,
    thresholds: { FV: '80–100%', U1: '60–70%', U2: '50% i mniej' },
    inputs: [
      { kind: 'number', name: 'percent', label: 'Udział siedliska na transekcie', unit: '%', min: 0, max: 100, help: 'Procent powierzchni transektu zajęty przez siedlisko 6520, w dziesiątkach procent (np. 100, 80, 60).' },
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed progiem (np. gdy udział maleje). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. 80% i powoli zmniejsza się na skutek procesu ubożenia łąki.', 'Krótki opis, który trafi do „wartości” w karcie zamiast samej liczby.'),
    ],
    suggest: (i) => chosenGrade(i) ?? percentCalc(i),
    explain: (i) => {
      if (chosenGrade(i)) return null
      const p = num(i.percent)
      return p === undefined ? null : `Siedlisko zajmuje ${pct(p)} transektu.`
    },
    warn: (i) => {
      const w = choiceWarn(i, percentCalc(i), 'udziału siedliska')
      return w && num(i.percent) === 80 && chosenGrade(i) === 'U1'
        ? `${w} (Karta Lasówka dała U1 przy 80%; sprawozdanie 2016–2018 uznało tę ocenę za zaniżoną.)`
        : w
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const p = num(i.percent)
      return p === undefined ? '' : pct(p)
    },
  },
  {
    id: 'spatial',
    label: 'Struktura przestrzenna płatów siedliska',
    parameter: 'structure',
    cardinal: true,
    description:
      'Określenie stopnia fragmentacji siedliska w skali porządkowej (duży, średni, mały stopień fragmentacji) oraz podanie wielkości powierzchni poszczególnych płatów łąk. Wskaźnik informuje o „łatkowatości” (patchiness) siedliska, które z reguły występuje w postaci płatów średniodużych i dużych (> kilkunastu arów).',
    help: `Co wybrać: jak bardzo łąka na stanowisku jest pocięta na osobne płaty. W opisie podaj wielkość płatów i czym są rozdzielone.

Progi (tab. 2): brak fragmentacji lub fragmentacja nieznaczna – FV; średni stopień fragmentacji (płaty po kilkanaście arów) – U1; duży stopień fragmentacji (płaty po kilka arów) – U2.

Praktyka: fragmentacja wynikająca z rzeźby terenu (skarpy, drogi polne) nie obniża oceny (2024: 75% stanowisk FV); średnia fragmentacja zwykle wiąże się z brakiem koszenia – łąka w mozaice z zadrzewieniami, zaroślami, ziołoroślami (U1); U2 – Płazówka, Czarny Dunajec naprzeciw cmentarza, Ogorzali, Wołosate-Przełęcz Beskid, Zimne Wody. Zadrzewienia i murawy bliźniczkowe w naturalnej mozaice z łąką to nie objaw zarastania (2016–2018: Niedamirów, Przełęcz Kowarska, Srebrne Łąki). Fragmentację oceniaj dla stanowiska, nie dla całej polany (2016–2018: Polana Pańszczykowska Wyżna). Karta z przewodnika: „Brak fragmentacji, zwarty płat” → FV.

Wskaźnik kardynalny.`,
    thresholds: thresholdsOf(SPATIAL),
    inputs: [
      selectInput('Stopień fragmentacji', SPATIAL),
      { kind: 'text', name: 'patchSize', label: 'Wielkość płatów (opcjonalnie)', placeholder: 'np. jeden zwarty płat ok. 1,5 ha', help: 'Wielkość poszczególnych płatów łąki, np. „jeden zwarty płat ok. 1,5 ha”, „płaty po kilkanaście arów”. Płaty po kilka arów to próg U2.' },
      noteInput('Opis (opcjonalnie)', 'np. Brak fragmentacji, zwarty płat.', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(SPATIAL)),
    describe: (i) => {
      if (note(i)) return note(i)
      const size = String(i.patchSize ?? '').trim()
      const label = labelOf(SPATIAL, i.choice)
      return [label, size ? `wielkość płatów: ${size}` : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'characteristic',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków charakterystycznych dla związku Arrhenatherion (z wyłączeniem taksonów charakterystycznych dla niżowego Arrhenatheretum elatioris) i Polygono-Trisetion, wraz z przybliżonym procentem pokrycia transektu przez dany gatunek. Bierze się pod uwagę także gatunki charakterystyczne i wyróżniające rzędu Arrhenatheretalia, klasy Molinio-Arrhenatheretea oraz gatunki z Interpretation Manual (konietlica łąkowa, barszcz zwyczajny, jarzmianka większa, kminek, pępawa miękka, rdest wężownik, lepnica rozdęta, dzwonek skupiony, szałwia łąkowa, tomka wonna, bniec czerwony, bodziszek żałobny i leśny, pełnik europejski, biedrzeniec wielki, lilia bulwkowata, fiołek trwały, zerwa kulista, pierwiosnek wyniosły, świerząbek orzęsiony, przywrotniki).',
    help: `Co wpisać: gatunki charakterystyczne stwierdzone na transekcie, z pokryciem ${SURFACE}. Liczbę gatunków możesz też wpisać wprost.

Progi (tab. 2): gatunki charakterystyczne dla zw. Polygono-Trisetion i Arrhenatherion liczne (>5) i w znacznym pokryciu, liczne gatunki typowe dla łąk górskich – FV; średnioliczne (3–5) i obecne inne gatunki typowe dla łąk górskich – U1; nieliczne (dwa i mniej), nieliczne gatunki łąkowe – U2.

Jak liczy formularz: ocena wybrana w polu ma pierwszeństwo; bez niej liczba wpisana wprost; bez niej gatunki z listy, które katalog zna jako charakterystyczne (synonimy raz). Katalog: tab. 1, gatunki Arrhenatherion bez niżowych (rajgras wyniosły, bodziszek łąkowy, pasternak i szczaw rozpierzchły się nie liczą), „typowe gatunki” z pkt 4 przewodnika dla Sudetów (wszewłoga, pępawa czarcikęsolistna, zerwa kłosowa, rzeżusznik Hallera, pięciornik złoty, wiechlina Chaixa) i Karpat (przywrotniki: połyskujący, pasterski, płytkoklapowy, Walasa; chaber ostrołuskowy, szafran spiski, dzwonek piłkowany, mieczyk dachówkowaty) oraz ostrożeń dwubarwny i chaber perukowy ze sprawozdań. Tylko w swoim regionie (pole „Region” w danych stanowiska) liczą się: kostrzewa czerwona – Sudety; gatunki łąki pienińskiej Anthyllidi-Trifolietum (przelot, koniczyna pagórkowa, lucerna sierpowata, krzyżownica czubata, szałwia okręgowa, macierzanka zwyczajna, jaskier wielokwiatowy) – Pieniny; gatunki tatrzańskiego Phyteumo-Trifolietum (koniczyna łąkowa, babka średnia, krzyżownica górska, jaskier skalny, macierzanka nadobna, gnidosz okółkowy, starzec górski, przywrotnik prawie nagi) – Tatry.

Uwaga: tab. 2 mówi też o pokryciu („w znacznym pokryciu”) – sama liczba to podpowiedź. Karta z przewodnika (Lasówka): pięć gatunków (przywrotniki 10%, reszta ok. 1%) → ekspert dał FV, z liczby wychodzi U1 – formularz to pokaże. Praktyka 2024: FV na 73–79% stanowisk, U1 przy 3–5 gatunkach, U2 przy płatach nietypowych dla łąk kośnych (Pardałówka, Płazówka). W 2016–2018 część obniżeń ocen była pozorna – wcześniej (2009–2010) oceniano ekspercko, przed publikacją waloryzacji.

Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Gatunki charakterystyczne dla zw. Polygono-Trisetion i Arrhenatherion liczne (>5) i w znacznym pokryciu, liczne gatunki typowe dla łąk górskich',
      U1: 'Gatunki charakterystyczne dla zw. Polygono-Trisetion i Arrhenatherion średnioliczne (3–5) i obecne inne gatunki typowe dla łąk górskich',
      U2: 'Gatunki charakterystyczne dla zw. Polygono-Trisetion i Arrhenatherion nieliczne (dwa i mniej), nieliczne gatunki łąkowe',
    },
    inputs: [
      speciesInput('Gatunki charakterystyczne', `Gatunki charakterystyczne stwierdzone na transekcie z pokryciem ${SURFACE}, np. Alchemilla spp. 10, Trisetum flavescens 1.`),
      { kind: 'number', name: 'count', label: 'Liczba gatunków charakterystycznych (opcjonalnie)', min: 0, help: 'Łączna liczba gatunków charakterystycznych na transekcie, wpisana wprost – ma pierwszeństwo przed liczeniem z listy.' },
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed liczbą gatunków (tab. 2 uwzględnia też pokrycie i gatunki typowe dla łąk górskich). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Warstwa c: przywrotniki Alchemilla spp. 10%, pozostałe 1% lub <1%: …', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i, ctx) => chosenGrade(i) ?? characteristicCalc(i, ctx),
    explain: (i, ctx) => {
      if (chosenGrade(i)) return null
      const c = characteristicCount(i, ctx)
      if (c === undefined) return null
      if (num(i.count) !== undefined) return `Gatunków charakterystycznych: ${plNum(c)}.`
      const names = characteristicNames(i, ctx)
      return `Gatunki charakterystyczne z katalogu: ${names.length}${names.length ? ` (${names.join(', ')})` : ''}.`
    },
    warn: (i, ctx) => {
      const region = regionOf(ctx)
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      const lowland = names.filter((n) => findSpecies6520(n)?.lowland)
      if (lowland.length) parts.push(`${lowland.join(', ')} – takson niżowego Arrhenatheretum elatioris, przewodnik wyłącza go z gatunków charakterystycznych 6520.`)
      const otherRegion = names.filter((n) => {
        const s = findSpecies6520(n)
        return s?.group === 'characteristic' && s.region && s.region !== region
      })
      if (otherRegion.length)
        parts.push(
          `Nie liczę: ${otherRegion.map((n) => `${n} (tylko ${REGION_LABELS_6520[findSpecies6520(n)!.region!].split(' (')[0]})`).join(', ')} – ${region ? 'inny region w danych stanowiska' : 'ustaw „Region” w danych stanowiska'}.`,
        )
      const other = names.filter((n) => findSpecies6520(n) && findSpecies6520(n)!.group !== 'characteristic' && !findSpecies6520(n)!.lowland)
      if (other.length) parts.push(`Nie liczą się jako charakterystyczne: ${other.join(', ')}.`)
      const w = choiceWarn(i, characteristicCalc(i, ctx), 'liczby gatunków')
      if (w) parts.push(w)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      const c = num(i.count)
      return list || (c !== undefined ? `${plNum(c)} gat.` : '')
    },
  },
  {
    id: 'dominant',
    label: 'Gatunki dominujące',
    parameter: 'structure',
    description:
      'Lista kilku gatunków, które osiągają największe pokrycie na transekcie, wraz z przybliżonym procentem pokrycia transektu przez dany gatunek. Ocena wskaźnika jest złożona, zależna od charakteru dominantów (powinny to być typowe dla siedliska gatunki łąk świeżych, głównie trawy) oraz stopnia ich dominacji, ponieważ wysoki współczynnik dominacji wiąże się z reguły z niską różnorodnością gatunkową, a przedmiotem ochrony są łąki bogate florystycznie.',
    help: `Co wpisać: kilka gatunków o największym pokryciu na transekcie (w karcie przykładowej: 10–30%), z pokryciem ${SURFACE}. Mszaki też (karta: fałdownik nastroszony, warstwa d – 20%).

Progi (tab. 2): współpanują gatunki typowo łąkowe i płaty siedliska bogate gatunkowo – FV; stan pośredni – U1; wśród dominantów obecne gatunki ekspansywne lub ekologicznie obce dla siedliska i siedlisko skrajnie ubogie w gatunki – U2.

Jak liczy formularz (interpretacja): wśród dominantów (pokrycie ponad 10%) gatunek silnie ekspansywny z tab. 1 (śmiałek darniowy, perz, orlica, jeżyny, borówka czarna, podagrycznik…), obcy albo drzewo/krzew – U2; któryś gatunek spoza charakterystycznych pokrywa ponad 50% (silna dominacja jednego gatunku, np. mietlicy) – U1; w pozostałych przypadkach – FV. Ocena wybrana w polu ma pierwszeństwo.

Praktyka: najgorzej oceniony wskaźnik w regionie alpejskim w 2024 r. – U1 przy silnej dominacji mietlicy pospolitej, rzadziej śmiałka darniowego, kostrzewy czerwonej, borówki czarnej; w Sudetach U1 przy kostrzewie czerwonej, mietlicy, śmiałkach, kłosówce miękkiej, dziurawcu; U2 przy orlicy (Krempna – Łąka Kołomyja), jeżynie fałdowanej (Hala Ostre Jaworzyna I), perzu (Jaśliska), podagryczniku (Pardałówka), przetaczniku nitkowatym (Płazówka), śmiałku darniowym (Łąka pod Czarną Górą), jaworze i malinie (Zimne Wody). Karta z przewodnika: mietlica 30%, dziurawiec czteroboczny 30%, kostrzewa czerwona 10%, fałdownik 20% → FV.`,
    thresholds: {
      FV: 'Współpanują gatunki typowo łąkowe i płaty siedliska bogate gatunkowo',
      U1: 'Stan pośredni',
      U2: 'Wśród dominantów obecne gatunki ekspansywne lub ekologicznie obce dla siedliska i siedlisko skrajnie ubogie w gatunki',
    },
    inputs: [
      speciesInput('Gatunki dominujące', `Gatunki o największym pokryciu z pokryciem ${SURFACE}, np. Agrostis capillaris 30, Hypericum maculatum 30.`),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed wyliczeniem (np. gdy siedlisko jest ubogie w gatunki mimo typowych dominantów). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Warstwa c: mietlica pospolita Agrostis capillaris 30%, …', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i, ctx) => {
      const g = chosenGrade(i)
      if (g) return g
      const rows = speciesRows(i.species).filter((r) => r.name?.trim())
      if (!rows.length) return null
      const covered = rows.filter((r) => num(r.cover) !== undefined)
      if (!covered.length) return null
      const bad = covered.filter((r) => (num(r.cover) ?? 0) > 10 && (isStrongExpansive6520(r.name.trim()) || isAlien6520(r.name.trim()) || isWoody6520(r.name.trim())))
      if (bad.length) return 'U2'
      return covered.some((r) => (num(r.cover) ?? 0) > 50 && !isCharacteristic6520(r.name.trim(), regionOf(ctx))) ? 'U1' : 'FV'
    },
    explain: (i, ctx) => {
      if (chosenGrade(i)) return null
      const rows = speciesRows(i.species).filter((r) => r.name?.trim())
      if (!rows.length) return null
      const bad = rows.filter((r) => (num(r.cover) ?? 0) > 10 && (isStrongExpansive6520(r.name.trim()) || isAlien6520(r.name.trim()) || isWoody6520(r.name.trim())))
      if (bad.length) return `Wśród dominantów gatunki ekspansywne lub obce: ${describeSpecies(bad)}.`
      const over = rows.filter((r) => (num(r.cover) ?? 0) > 50 && !isCharacteristic6520(r.name.trim(), regionOf(ctx)))
      return over.length ? `Silna dominacja (ponad 50%): ${describeSpecies(over)}.` : 'Żaden gatunek ekspansywny ani obcy nie dominuje, żaden nie pokrywa ponad 50% transektu.'
    },
    warn: (i) => {
      const rows = speciesRows(i.species).filter((r) => r.name?.trim())
      const parts: string[] = []
      const hyp = rows.filter((r) => findSpecies6520(r.name.trim())?.disputed && (num(r.cover) ?? 0) > 10)
      if (hyp.length) parts.push('Dziurawiec czteroboczny – status sporny (sprawozdania: ekspansywny; botanicy czescy: diagnostyczny Polygono-Trisetion). Formularz nie obniża za niego oceny dominantów – oceń ekspercko.')
      if (rows.length && rows.every((r) => num(r.cover) === undefined)) parts.push('Gatunki bez pokrycia – wpisz pokrycie albo wybierz ocenę.')
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => note(i) || describeSpecies(speciesRows(i.species)),
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    description:
      'Lista gatunków obcych geograficznie i ekologicznie dla siedliska wraz z szacunkowym procentem pokrycia transektu przez gatunek. W ocenie bierze się pod uwagę zarówno biologiczne predyspozycje gatunku do szybkiego rozprzestrzeniania się, jak i obfitość jego występowania. W przypadku roślin o najwyższym stopniu inwazyjności, jak np. rdestowiec ostrokończysty, na obniżenie oceny wpływa już sama obecność gatunku.',
    help: `Co wpisać: gatunki obce z pokryciem ${SURFACE}; pojedyncze osobniki wpisz jako 0,5. Łączne pokrycie możesz wpisać wprost. Brak – „Nie stwierdzono”.

Progi (tab. 2): brak lub pojedyncze osobniki gatunków o niskim stopniu inwazyjności – FV; gatunki o niskim stopniu inwazyjności w pokryciu <5% transektu lub pojedyncze osobniki gatunków o większym stopniu inwazyjności – U1; obecne gatunki silnie inwazyjne lub >5% transektu zajęte przez gatunki o niskim stopniu inwazyjności – U2.

Jak liczy formularz: wysoce inwazyjne (katalog: rdestowce, niecierpek gruczołowaty, nawłocie kanadyjska i późna, barszcze Sosnowskiego i Mantegazziego, łubin trwały, rudbekia naga, rukiewnik wschodni, przymiotno białe, dąb czerwony, czeremcha amerykańska, klon jesionolistny) – pojedyncze osobniki (do 0,5% na gatunek) U1, więcej U2; pozostałe obce (sit chudy, wierzbownica gruczołowata, przetacznik nitkowaty, szczawik żółty, marchewnik, rozchodnik kaukaski…) – do 0,5% na gatunek FV, do 5% łącznie U1, ponad 5% U2. Gatunek spoza katalogu liczy się jako słabo inwazyjny. Gatunek bez pokrycia – brak podpowiedzi.

Praktyka 2024–2025: najczęściej łubin trwały (15 stanowisk; w Sudetach U1, przy pokryciu ≥7% – U2: Baraniec, Kozia Hala, Sienna, Wapienniki; w 2016–2018 ok. 5% → U2); pojedynczy osobnik nawłoci kanadyjskiej – U1 (Gierczyn); przetacznik nitkowaty 15% – U2 (Płazówka, 2017); rukiewnik wschodni – U2 (Czarny Dunajec północ). Karta z przewodnika: brak → FV.`,
    thresholds: {
      FV: 'Brak lub pojedyncze osobniki gatunków o niskim stopniu inwazyjności',
      U1: 'Gatunki o niskim stopniu inwazyjności w pokryciu <5% transektu lub pojedyncze osobniki gatunków o większym stopniu inwazyjności',
      U2: 'Obecne gatunki silnie inwazyjne lub >5% transektu zajęte przez gatunki o niskim stopniu inwazyjności',
    },
    inputs: [
      speciesInput('Obce gatunki inwazyjne', `Gatunki obce z pokryciem ${SURFACE}, np. Lupinus polyphyllus 2, Juncus tenuis 0,5.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków obcych w % transektu – ma pierwszeństwo przed sumą z listy (formularz traktuje je wtedy jak gatunki słabo inwazyjne, chyba że na liście jest gatunek wysoce inwazyjny).'),
      NONE_FIELD('Brak gatunków obcych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków obcych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const s = aliensSplit(i)
      const t = num(i.total)
      if (t !== undefined) {
        if (s.high.length) return t > SINGLE * s.high.length ? 'U2' : 'U1'
        return gradeAliens6520({ count: 0, total: 0 }, { count: Math.max(1, s.low.length), total: t })
      }
      if (!s.rows.length) return i.none === 'yes' ? 'FV' : null
      if (s.missing) return null
      return gradeAliens6520({ count: s.high.length, total: s.highTotal }, { count: s.low.length, total: s.lowTotal })
    },
    explain: (i) => {
      const s = aliensSplit(i)
      const t = num(i.total)
      if (t !== undefined) return `Łączne pokrycie gatunków obcych: ${pct(t)}.`
      if (!s.rows.length) return null
      if (s.missing) return 'Gatunki obce bez pokrycia – wpisz pokrycie (pojedyncze osobniki: 0,5) albo łączne pokrycie.'
      const part = (label: string, rs: typeof s.rows, total: number) => (rs.length ? `${label}: ${rs.map((r) => r.name.trim()).join(', ')} (razem ${pct(total)})` : '')
      return [part('Wysoce inwazyjne', s.high, s.highTotal), part('Słabo inwazyjne lub spoza katalogu', s.low, s.lowTotal)].filter(Boolean).join('. ').concat('.')
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo pokrycie nie są puste.')
      const native = names.filter((n) => findSpecies6520(n) && !isAlien6520(n))
      if (native.length) parts.push(`To nie gatunki obce: ${native.join(', ')}${native.some(isExpansive6520) ? ' (rodzime ekspansywne wpisz w swoim wskaźniku)' : ''}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'expansive',
    label: 'Rodzime gatunki ekspansywne roślin zielnych',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków roślin zielnych rozprzestrzeniających się w siedlisku i mogących stanowić dla niego zagrożenie wraz z szacunkowym procentem pokrycia transektu przez dany gatunek. Szczególną uwagę zwracano na ekspansywne trawy (śmiałek darniowy, perz właściwy), gatunki ziołoroślowe (świerząbek korzenny, starzec jajowaty, podagrycznik) i inne, świadczące o braku użytkowania kośnego (jeżyny, wierzbówka kiprzyca, orlica, borówka czarna), jak również gatunki nitrofilne (pokrzywa, ostrożeń polny). Ocena jest wypadkową ekspansywności gatunku/gatunków oraz jego/ich pokrycia.',
    help: `Co wpisać: rodzime gatunki ekspansywne z pokryciem ${SURFACE}. Gatunki obce wpisz w „Obcych gatunkach inwazyjnych”, gatunki charakterystyczne formularz pomija.

Progi (tab. 2): brak lub gatunki w niewielkim pokryciu – FV; gatunki ekspansywne średnioliczne i/lub pokrycie poszczególnych gatunków silnie ekspansywnych <10% – U1; gatunki ekspansywne liczne i o znacznym pokryciu i/lub obecne gatunki o dużej ekspansywności osiągające >10% pokrycia – U2.

Jak liczy formularz (liczbowo tab. 2 podaje tylko próg 10%; reszta to interpretacja): silnie ekspansywne to gatunki z tab. 1 (śmiałek darniowy, perz, świerząbek korzenny, starzec jajowaty, podagrycznik, jeżyny i malina, wierzbówka kiprzyca, orlica, borówka czarna, pokrzywa, ostrożeń polny). Któryś z nich ponad 10% albo łącznie ponad 50% – U2 (2016–2018: „zwykle ok. 50% – U2”); któryś z nich ponad 1% (do 10%) albo łącznie ponad 30% – U1; inaczej FV. Gatunki ze znikomym pokryciem (do 1%, „+”, bez pokrycia) nie zmieniają oceny. Łączne pokrycie wpisane wprost ma pierwszeństwo przed sumą, ocena wybrana w polu – przed wszystkim.

Dziurawiec czteroboczny: w sprawozdaniach najczęstszy gatunek ekspansywny (zwłaszcza w Sudetach), ale botanicy czescy uznają go za diagnostyczny dla Polygono-Trisetion, a sprawozdanie 2009–2011 pisze, że trudno jednoznacznie stwierdzić, czy szkodzi siedlisku. Formularz liczy go jak zwykły gatunek ekspansywny (próg 30% łącznie) – karta z przewodnika przy 30% dziurawca dała FV. Koniczyna biała jako „ekspansywna” w 2017 r. (Polana Pańszczykowska Wyżna) dała pozorne pogorszenie – zdecyduj i opisz.

Praktyka 2024: najgorzej oceniony wskaźnik kardynalny – U2 przy borówce czarnej (Jaworzyna Kamienicka), orlicy (Krempna, Las), śmiałku darniowym (Wołosate-Przełęcz Beskid, Polana Wzorowa, Krościenko), ostrożeniu polnym, jeżynie fałdowanej; w Sudetach przy dziurawcu, starcu jajowatym i Fuchsa, borówce, podagryczniku, pokrzywie. Karta z przewodnika: dziurawiec 30%, podagrycznik, szczaw kędzierzawy, poziewnik – znikomo → FV.

Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Brak lub gatunki w niewielkim pokryciu',
      U1: 'Gatunki ekspansywne średnioliczne i/lub pokrycie poszczególnych gatunków silnie ekspansywnych <10%',
      U2: 'Gatunki ekspansywne liczne i o znacznym pokryciu i/lub obecne gatunki o dużej ekspansywności osiągające >10% pokrycia',
    },
    inputs: [
      speciesInput('Gatunki ekspansywne', `Rodzime gatunki ekspansywne z pokryciem ${SURFACE}, np. Hypericum maculatum 30, Aegopodium podagraria (znikomo – bez pokrycia).`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków ekspansywnych w % transektu – ma pierwszeństwo przed sumą z listy (próg 10% dla pojedynczego gatunku silnie ekspansywnego dalej liczy się z listy).'),
      NONE_FIELD('Brak gatunków ekspansywnych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma rodzimych gatunków ekspansywnych – wtedy wskaźnik to FV.'),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed wyliczeniem (np. gdy gatunki są „średnioliczne”, ale w małym pokryciu). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Dziurawiec czteroboczny Hypericum maculatum 30%. Pozostałe ze znikomym pokryciem, m.in. …', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i, ctx) => chosenGrade(i) ?? expansiveSuggest(i, ctx),
    explain: (i, ctx) => {
      if (chosenGrade(i)) return null
      const t = num(i.total)
      const e = expansiveCalc(i, ctx)
      if (!e && t === undefined) return null
      const parts: string[] = []
      parts.push(t !== undefined ? `łączne pokrycie (wpisane): ${pct(t)}` : `łączne pokrycie gatunków ekspansywnych (bez znikomych): ${pct(e!.total)}`)
      if (e?.strong.length) parts.push(`silnie ekspansywne (tab. 1): ${e.strong.join(', ')}, maks. ${pct(e.maxStrong)}`)
      else parts.push('brak gatunków silnie ekspansywnych z tab. 1')
      if (e?.trace.length) parts.push(`znikome (do 1%): ${e.trace.join(', ')}`)
      const s = parts.join('; ')
      return `${s.charAt(0).toUpperCase()}${s.slice(1)}.`
    },
    warn: (i, ctx) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo pokrycie nie są puste.')
      const aliens = names.filter(isAlien6520)
      if (aliens.length) parts.push(`Gatunki obce wpisz we wskaźniku „Obce gatunki inwazyjne”: ${aliens.join(', ')}.`)
      const typical = names.filter((n) => isCharacteristic6520(n, regionOf(ctx)))
      if (typical.length) parts.push(`Gatunki charakterystyczne nie są ekspansywnymi: ${typical.join(', ')}.`)
      const w = choiceWarn(i, expansiveSuggest(i, ctx), 'pokrycia gatunków ekspansywnych')
      if (w) parts.push(w)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'shrubs',
    label: 'Ekspansja krzewów i podrostu drzew',
    parameter: 'structure',
    cardinal: true,
    description:
      'Wskaźnik opisywany przez sumaryczne pokrycie krzewów i podrostu drzew na transekcie. Dla uszczegółowienia podawana jest także lista gatunków drzew i krzewów zaobserwowanych na transekcie oraz procent ich pokrycia. To dość czuły wskaźnik informujący o prawidłowości użytkowania siedliska. Obecność młodych krzewów i podrostu drzew na łące jest oznaką braku koszenia.',
    help: `Co wpisać: drzewa i krzewy (także siewki i osobniki juwenilne) na transekcie z pokryciem ${SURFACE}. Gdy znasz łączne pokrycie, wpisz je wprost – ma pierwszeństwo przed sumą listy.

Progi (tab. 2): łączne pokrycie na transekcie <1% – FV; 1–5% – U1; >5% – U2. Granice 1% i 5% formularz liczy do U1.

Praktyka: najczęściej (2024) tarnina, głogi, jałowiec, jarzębina, róże, malina i jeżyny, osika, brzoza, świerk, wierzby, jawor; zwykle wiele gatunków bez wyraźnego dominanta. 2024: do 5% – U1, 7–35% – U2 (Ogorzali, Rachowiec, Krościenko, Podgórze, Świeradów Zdrój, Wójtówka, Zimne Wody). W 2016–2018 na Zimnych Wodach zarośla jawora, brzozy, wierzby i olszy zajmowały ok. 40% transektu. Karta z przewodnika: „Pokrycie łączne <1% – tylko pojedyncze i rozproszone osobniki juwenilne głogu jednoszyjkowego” → FV.

Wskaźnik kardynalny.`,
    thresholds: { FV: 'Łączne pokrycie na transekcie <1%', U1: 'Łączne pokrycie na transekcie 1–5%', U2: 'Łączne pokrycie na transekcie >5%' },
    inputs: [
      speciesInput('Drzewa i krzewy', `Drzewa i krzewy (także podrost) z pokryciem ${SURFACE}, np. Crataegus monogyna 0,5, Betula pendula 2.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Sumaryczne pokrycie krzewów i podrostu drzew w % transektu – ma pierwszeństwo przed sumą z listy. „<1%” wpisz jako 0,5.'),
      NONE_FIELD('Brak drzew i krzewów', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma krzewów ani podrostu drzew – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Pokrycie łączne <1% – tylko pojedyncze i rozproszone osobniki juwenilne głogu jednoszyjkowego Crataegus monogyna.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = shrubsCover(i)
      return typeof c === 'number' ? gradeShrubs6520(c) : null
    },
    explain: (i) => {
      const c = shrubsCover(i)
      if (c === 'present') return 'Drzewa i krzewy bez pokrycia – wpisz pokrycie gatunków albo łączne pokrycie (pojedyncze osobniki: 0,5).'
      return typeof c === 'number' ? `Łączne pokrycie krzewów i podrostu drzew: ${pct(c)}.` : null
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo pokrycie nie są puste.')
      const herbs = names.filter((n) => findSpecies6520(n) && !isWoody6520(n))
      if (herbs.length) parts.push(`To nie drzewa ani krzewy: ${herbs.join(', ')}.`)
      const t = num(i.total)
      const s = sumCover(i.species)
      if (t !== undefined && typeof s === 'number' && s > t) parts.push(`Suma pokrycia gatunków (${pct(s)}) jest większa niż pokrycie łączne (${pct(t)}).`)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'ecotone',
    label: 'Zachowanie strefy ekotonowej',
    parameter: 'structure',
    description:
      'Ocena wymaga dodatkowej analizy roślinności terenu położonego poza transektem badawczym – w strefie ekotonowej badanej łąki. Ocenia się średnią szerokość strefy przejściowej między łąką a sąsiadującym z nią lasem (w metrach) oraz % pokrycia warstwy krzewiastej (ewentualnie drzew i krzewów) wraz z określeniem gatunków dominujących w runie i wyższych warstwach. W ocenie zwraca się uwagę na ewentualne rozprzestrzenianie się gatunków obecnych w ekotonie i jednocześnie stanowiących potencjalne zagrożenie dla fitocenoz łąkowych.',
    help: `Co wybrać i wpisać: czy na skraju łąki (poza transektem) jest strefa przejściowa do lasu lub zarośli i czy wkraczają z niej na łąkę gatunki ekspansywne. W opisie podaj średnią szerokość ekotonu (m), pokrycie warstwy krzewów i gatunki dominujące.

Progi (tab. 2): brak ekotonu lub brak w ekotonie gatunków ekspansywnych – FV; umiarkowany stopień rozprzestrzeniania się gatunków mogących stanowić zagrożenie dla łąk – U1; w ekotonie zaznacza się ekspansja gatunków stanowiących potencjalne zagrożenie dla łąk – U2.

Praktyka: zwykle dobrze oceniany (2024: FV na 62–71% stanowisk); U2 przy borówce czarnej, malinie, starcu jajowatym, jeżynach, leszczynie, brzozie, osice w ekotonie (Las, Magurka Wilkowicka, Ogorzali, Kozia Hala, Orłowiec, Wójtówka, Zimne Wody); poprawa najczęściej dzięki koszeniu. W Ostoi Magurskiej tarninę w ekotonie skutecznie eliminuje koszenie. Sprawozdanie 2016–2018 proponuje rezygnację ze wskaźnika (trudny do kalibracji, nakłada się na ekspansywne, krzewy i obce), ale w 2024–2025 dalej go oceniano. Karta z przewodnika: „Brak ekotonu” → FV.`,
    thresholds: thresholdsOf(ECOTONE),
    inputs: [
      selectInput('Strefa ekotonowa', ECOTONE),
      { kind: 'number', name: 'width', label: 'Średnia szerokość ekotonu (opcjonalnie)', unit: 'm', min: 0, help: 'Średnia szerokość strefy przejściowej między łąką a lasem lub zaroślami, w metrach. Brak ekotonu – zostaw puste.' },
      noteInput('Opis (opcjonalnie)', 'np. Brak ekotonu.', 'Szerokość, pokrycie krzewów i gatunki dominujące w ekotonie – trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(ECOTONE)),
    describe: (i) => {
      if (note(i)) return note(i)
      const w = num(i.width)
      const label = labelOf(ECOTONE, i.choice)
      return [label, w !== undefined ? `średnia szerokość ${plNum(w)} m` : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'litter',
    label: 'Wojłok (martwa materia organiczna)',
    parameter: 'structure',
    description:
      'Pomiar grubości warstwy nierozłożonej materii organicznej odkładającej się ponad poziomem próchnicznym wykonywany po nacięciu darni nożem, za pomocą linijki lub metra stolarskiego (w centymetrach). Wartość wskaźnika to średnia z dwudziestu pomiarów wykonanych w płacie siedliska oraz minimum i maksimum. Wskaźnik informuje o tym, czy łąka jest regularnie koszona.',
    help: `Jak mierzyć: w 20 miejscach w płacie natnij darń scyzorykiem i zmierz linijką grubość nierozłożonej materii organicznej ponad poziomem próchnicznym. Wpisz minimum, maksimum i średnią (cm).

Progi (tab. 2): <2 cm – FV; 2–5 cm – U1; >5 cm – U2. Formularz liczy ze średniej; granice 2 i 5 cm – U1.

Uwaga z przewodnika: uwzględnij lokalne warunki klimatyczne – np. dla płatów z Hali Izerskiej, gdzie przymrozki utrzymują się praktycznie przez cały rok, spowalniając rozkład materii organicznej, stosowano łagodniejsze kryteria (bez liczb – wybierz ocenę i uzasadnij).

Praktyka: na koszonych łąkach wojłoku brak (2024: FV na 53–75% stanowisk); 2009–2010 w Górach Złotych i Paśmie Krowiarki średnio ok. 4 cm – U1; U2 – Leszczowate, Podgórze, Przełęcz Kowarska, Zachełmie, Zimne Wody. Karta z przewodnika: „0,5–3 cm, średnio 1 cm, w płatach ziołoroślowych grubsza niż w traworoślach” → ekspert dał U1, ze średniej wychodzi FV – formularz to pokaże.`,
    thresholds: { FV: '<2 cm', U1: '2–5 cm', U2: '>5 cm' },
    inputs: [
      { kind: 'number', name: 'min', group: 'Grubość wojłoku (20 pomiarów)', groupCols: 3, label: 'Minimum', unit: 'cm', min: 0, help: 'Najmniejsza z 20 zmierzonych grubości warstwy wojłoku, w cm.' },
      { kind: 'number', name: 'max', group: 'Grubość wojłoku (20 pomiarów)', label: 'Maksimum', unit: 'cm', min: 0, help: 'Największa z 20 zmierzonych grubości warstwy wojłoku, w cm.' },
      { kind: 'number', name: 'mean', group: 'Grubość wojłoku (20 pomiarów)', label: 'Średnia', unit: 'cm', min: 0, help: 'Średnia z 20 pomiarów grubości wojłoku, w cm – od niej zależy podpowiedź oceny.' },
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed średnią (np. łagodniejsze kryteria w zimnym klimacie Hali Izerskiej albo grubszy wojłok w części płatów). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. 0,5–3 cm, średnio 1 cm, w płatach ziołoroślowych grubsza niż w traworoślach.', 'Krótki opis, który trafi do „wartości” w karcie zamiast opisu wygenerowanego z pomiarów.'),
    ],
    suggest: (i) => chosenGrade(i) ?? litterCalc(i),
    explain: (i) => {
      if (chosenGrade(i)) return null
      const m = litterMean(i)
      return m === undefined ? null : `Średnia grubość wojłoku: ${plNum(m)} cm.`
    },
    warn: (i) => {
      const parts: string[] = []
      const [mn, mx, m] = [num(i.min), num(i.max), litterMean(i)]
      if (mn !== undefined && mx !== undefined && mn > mx) parts.push('Minimum jest większe niż maksimum – sprawdź.')
      if (m !== undefined && ((mn !== undefined && m < mn) || (mx !== undefined && m > mx))) parts.push('Średnia leży poza zakresem minimum–maksimum – sprawdź.')
      const w = choiceWarn(i, litterCalc(i), 'średniej grubości')
      if (w) parts.push(w)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const [mn, mx, m] = [num(i.min), num(i.max), litterMean(i)]
      const range = mn !== undefined && mx !== undefined ? `${plNum(mn)}–${plNum(mx)} cm` : ''
      const avg = m !== undefined ? `średnio ${plNum(m)} cm` : ''
      return [range, avg].filter(Boolean).join(', ')
    },
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu (zdjęcie fitosocjologiczne nr ${where === 'początku' ? 1 : where === 'środka' ? 2 : 3}), z odbiornika GPS (WGS84).

Dlaczego: kolejny obserwator musi wyznaczyć ten sam transekt. W 2017 r. część pozornych zmian ocen wynikała z innego wyznaczenia stanowiska (fragmentację na Polanie Pańszczykowskiej Wyżnej oceniono wcześniej dla całej polany).`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'subtype',
    label: 'Podtyp siedliska (opcjonalnie)',
    placeholder: 'np. 6520-1 Sudecka łąka konietlicowa',
    help: 'Podtyp siedliska, jeśli go podajesz – w karcie z przewodnika: „6520-1 Sudecka łąka konietlicowa”. Przewodnik nie wymienia podtypów w tabelach, sprawozdanie 2025 mówi tylko, że wszystkie podtypy syntaksonomiczne są reprezentowane w parkach narodowych. Pole tekstowe – wpisz tak, jak w poprzedniej karcie stanowiska.',
  },
  {
    kind: 'select',
    name: 'region',
    label: 'Region (lista gatunków charakterystycznych)',
    options: REGION_OPTIONS,
    hint: 'Od regionu zależy, które gatunki „lokalnie reprezentatywne” liczą się jako charakterystyczne.',
    help: `Gdzie leży stanowisko – przewodnik (pkt 4) podaje osobne listy gatunków diagnostycznych:
• Sudety – łąki górskie Polygono-Trisetion i Arrhenatherion (Meo-Festucetum, zbiorowisko Agrostis capillaris-Festuca rubra); kostrzewa czerwona liczy się jako diagnostyczna tylko tutaj;
• Karpaty – Gladiolo-Agrostietum, Campanulo serratae-Agrostietum i inne bogate florystycznie łąki mietlicowe;
• Pieniny i Pieniński Pas Skałkowy – sucha łąka pienińska Anthyllidi-Trifolietum montani (przelot, koniczyna pagórkowa, lucerna sierpowata, krzyżownica czubata, szałwia okręgowa, macierzanka zwyczajna, jaskier wielokwiatowy);
• Tatry i Podtatrze – Phyteumo-Trifolietum pratensis (koniczyna łąkowa, babka średnia, krzyżownica górska, jaskier skalny, macierzanka nadobna, gnidosz okółkowy; sprawozdanie 2009–2011 dodaje starzec górski i przywrotnik prawie nagi).

Wybór zmienia tylko podpowiedź oceny „Gatunków charakterystycznych”. Puste – gatunki lokalne się nie liczą (formularz ostrzeże).`,
  },
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Lasówka',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Lasówka”, „Polana Chochołowska”, „Wołosate-Przełęcz Beskid”, „Hala Izerska”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego stanowiska – 6520 monitorowano w 2009–2010, 2017–2018 i 2024–2025 na ok. 120 stanowiskach.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'areaName',
    label: 'Nazwa obszaru',
    placeholder: 'np. Dzika Orlica',
    help: 'Obszar Natura 2000 albo pasmo górskie, w którym leży stanowisko, np. „Dzika Orlica”, „Ostoja Gorczańska”, „Tatry”, „Karkonosze”. Kilka stanowisk leży poza siecią Natura 2000 (np. Pogórze Gubałowskie) – wpisz wtedy pasmo.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „Sieć Natura 2000: SOO PLH020061 Dzika Orlica; Obszar Krajobrazu Chronionego Góry Bystrzyckie i Orlickie”.',
    help: `Obszary Natura 2000, parki narodowe i krajobrazowe, rezerwaty, obszary chronionego krajobrazu obejmujące stanowisko. W 2024–2025 r. 109 ze 120 stanowisk leżało w obszarach Natura 2000, 43 – w parkach narodowych lub ich otulinach.

Dlaczego: w parkach narodowych łąki są częściej właściwie użytkowane (70% stanowisk wobec 56% w kraju) – to argument w perspektywach ochrony.`,
  }),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem / użytkownik',
    placeholder: 'np. właściciele prywatni',
    help: `Kto zarządza łąką albo ją użytkuje: park narodowy, nadleśnictwo, gmina, właściciele prywatni, dzierżawcy.

Dlaczego: większość łąk górskich to grunty prywatne (w 2016–2018 tylko 34 ze 118 stanowisk na gruntach Skarbu Państwa) – od właściciela zależy koszenie, a w 2024 r. zakaz wstępu na prywatny teren uniemożliwił badania na dwóch stanowiskach (ocena XX).`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 6,
    required: true,
    hint: 'Położenie (zbocze, dolina, polana), ekspozycja i nachylenie, gleba, sposób użytkowania (koszenie, wypas, nawożenie), sąsiedztwo.',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• położenie: zbocze doliny, polana reglowa, grzbiet; wysokość, ekspozycja i nachylenie;
• gleba (np. gliniasta, kwaśna; brunatna na fliszu; płytka rędzina w Tatrach i Pieninach);
• użytkowanie: koszenie (ile razy, czy siano zbierane), wypas (owce, bydło, konie), nawożenie, zarzucenie;
• sąsiedztwo: las, zarośla, zabudowa, drogi.

Karta z przewodnika: „Lasówka, zbocze doliny Dzikiej Orlicy w północnej części wsi. Blisko szosy. Większość to łąki górskie użytkowane kośnie. Zbocze o ekspozycji SW i niewielkim nachyleniu przeciętnie dziesięć stopni. Gleba gliniasta, kwaśna.”`,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. zbiorowisko ze związku Polygono-Trisetion',
    help: 'Zespoły i zbiorowiska reprezentujące siedlisko na stanowisku. Arrhenatherion: Gladiolo-Agrostietum capillaris (reglowa łąka mieczykowo-mietlicowa), Campanulo serratae-Agrostietum capillaris (bieszczadzka łąka mietlicowa), Anthyllidi-Trifolietum montani (sucha łąka pienińska), zbiorowiska Campanula patula-Trisetum flavescens i Festuca rubra-Holcus lanatus. Polygono-Trisetion: Meo-Festucetum rubrae (= Geranio sylvatici-Trisetetum flavescentis), Alchemillo-Festucetum rubrae (łąka przywrotnikowa), Phyteumo (orbicularis)-Trifolietum pratensis. Nie zalicza się łąk zasiewanych (kupkówka, tymotka, życica trwała) ani przemiennych użytków zielonych.',
  },
  {
    kind: 'text',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    required: true,
    placeholder: 'np. 1,5 (±0,1)',
    help: 'Łączna powierzchnia płatów łąki na stanowisku, w hektarach (karta z przewodnika: „1,5 ha (±0,1 ha). Areał stabilny.”). 2024–2025: w Karpatach zwykle 1–7 ha (do 10–20 ha), w Sudetach albo kilka hektarów, albo 0,2–0,6 ha.',
  },
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu (zdjęcie nr 1)', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu (zdjęcie nr 2)', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu (zdjęcie nr 3)', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 705–720',
    help: 'Wysokość nad poziomem morza – liczba albo zakres (karta z przewodnika: 705–720 m). Siedlisko występuje od wyższych partii pogórza (powyżej 550–600 m) po regiel górny (w Tatrach do ok. 1350 m n.p.m.).',
  },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    required: true,
    placeholder: 'np. 10x200 m',
    hint: 'Pasowy transekt 10 × 200 m albo prostokąt o innych wymiarach, równy 20 arom.',
    help: `Przewodnik: obserwacje prowadzi się na pasowym transekcie szerokości 10 m i długości 200 m lub na prostokątnej powierzchni o innych wymiarach równej 20 arom. Zdjęcia fitosocjologiczne: na przeciwległych końcach transektu i w jego środku. Karta z przewodnika: „20x100 m trawersem zbocza”.

Dlaczego: wszystkie pokrycia (gatunki, krzewy, procent siedliska) odnoszą się do transektu – następny obserwator musi wyznaczyć ten sam.`,
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 25.07.2009',
    required: true,
    hint: 'Po wykłoszeniu traw, przed pierwszym pokosem: optymalnie czerwiec – lipiec; w praktyce 1.06–15.08.',
    help: `Dzień badań terenowych. Przewodnik: optymalny termin zależy od regionu i wysokości i przypada od czerwca do lipca – dane zbiera się po wykłoszeniu traw i przed pierwszym pokosem. W Sudetach i niższych położeniach Karpat najlepszy jest przełom czerwca i lipca, w wyższych partiach regla dolnego w Bieszczadach Wysokich, w Tatrach i na Torfowiskach Gór Izerskich – pierwsza połowa lipca. Ocena składu gatunkowego, zwłaszcza pokrycia, silnie zależy od fenologii.

Praktyka: 2024–2025 – od 1 czerwca do 15 sierpnia („zgodnie z metodyką”); 2017–2018 – często początek sierpnia; 2009–2010 zdarzały się terminy wrześniowe (Karpacz Górny 20.09.2010). Formularz: 15.06–31.07 bez uwag; 1–14.06 i 1–15.08 – dopuszczalnie; poza 1.06–15.08 – ostrzeżenie.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const [, mm, dd] = v.split('-').map(Number)
      const md = mm * 100 + dd
      if (md < 601 || md > 815) return 'Termin poza dopuszczalnym okresem (1 czerwca – 15 sierpnia). Po pokosie skład i pokrycie gatunków są niepełne – opisz powód w uwagach.'
      if (md < 615 || md > 731) return 'Termin dopuszczalny, ale poza optymalnym (czerwiec – lipiec, po wykłoszeniu traw). Sprawdź, czy łąka nie była już koszona – zapisz to w uwagach.'
      return null
    },
  },
  pickField(methodology7120.siteFields, 'observer', {
    help: `Imię i nazwisko eksperta, który wykonał obserwację i odpowiada za dane (w karcie z przewodnika: „Obserwator”).

Dlaczego: ocena zawiera elementy oceny eksperckiej – w 2016–2018 część zmian ocen była pozorna, bo w 2009–2010 oceniano ekspercko, przed opublikowaniem waloryzacji.`,
  }),
  {
    kind: 'text',
    name: 'additionalExperts',
    label: 'Dodatkowi eksperci',
    placeholder: 'np. —',
    help: 'Osoby, które brały udział w badaniu poza obserwatorem. Brak – zostaw puste albo wpisz „—”.',
  },
]

// ---------- zdjęcia fitosocjologiczne ----------

const r7120 = methodology7120.releves.fields
const LAYERS = 'Zwarcie i wysokość warstw B, C, D'
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, group: LAYERS, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia (WGS84). Trzy zdjęcia: na przeciwległych końcach transektu i w jego środku.' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach (karta z przewodnika: 710 m).' }),
  pickField(r7120, 'area', { defaultValue: 25, help: 'Powierzchnia zdjęcia w m² – przewodnik: 25 m² (5 × 5 m).' }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach (karta z przewodnika: 10°).' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, NW). Dla powierzchni płaskiej wpisz „brak”. Karta z przewodnika: SW.' }),
  layerField('coverB', 'Warstwa B – krzewy i podrost drzew: procent powierzchni zdjęcia. Na koszonej łące zwykle brak (zostaw puste).', { groupCols: 3 }),
  layerField('coverC', 'Warstwa C – zielna: procent powierzchni zdjęcia pokryty przez trawy i zioła (karta z przewodnika: 100%).'),
  layerField('coverD', 'Warstwa D – mszysta: procent powierzchni zdjęcia pokryty przez mszaki (karta z przewodnika: 20–30%, głównie fałdownik nastroszony).'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów i podrostu, w metrach. Brak warstwy – zostaw puste.'),
  layerField('heightC', 'Warstwa C – typowa wysokość runi, w centymetrach (karta z przewodnika: 0,5–0,6 m, czyli 50–60 cm).'),
  layerField('heightD', 'Warstwa D – wysokość mszaków, w centymetrach. Karta z przewodnika jej nie podaje.'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Polygono-Trisetion',
    help: 'Jednostka fitosocjologiczna zdjęcia – zespół, związek albo zbiorowisko, np. „zbiorowisko ze związku Polygono-Trisetion”, „zbiorowisko z mietlicą pospolitą Agrostis capillaris z rzędu Arrhenatheretalia” (karta z przewodnika), Gladiolo-Agrostietum capillaris, Meo-Festucetum rubrae.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w poletku z ilościowością w skali Braun-Blanqueta (r, +, 1–5): warstwa B – krzewy i podrost, C – trawy i zioła (także siewki drzew – w uwagach dopisz „juv.”), D – mszaki. Warstwa podpowiada się sama po wyborze gatunku.',
  }),
  {
    kind: 'textarea',
    name: 'remarks',
    label: 'Uwagi do zdjęcia',
    rows: 2,
    placeholder: 'np. Crataegus monogyna – osobnik juwenilny',
    help: 'Odstępstwa i problemy: osobniki juwenilne drzew w runi, gatunki oznaczone tylko do rodzaju (Alchemilla, Brachythecium), mniejsza powierzchnia, zdjęcie po pokosie.',
  },
]

export const methodology6520: Methodology = {
  code: '6520',
  name: 'Górskie łąki konietlicowe i mietlicowe użytkowane ekstensywnie (Polygono-Trisetion i Arrhenatherion)',
  source:
    'Korzeniak J. 2012, 6520 Górskie łąki konietlicowe i mietlicowe użytkowane ekstensywnie (Polygono-Trisetion i Arrhenatherion), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. III, GIOŚ, s. 95–108 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2009–2011, 2015–2018 i 2023–2025.',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj 3 zdjęcia fitosocjologiczne po 25 m² (5 × 5 m) – na przeciwległych końcach transektu i w jego środku, po wykłoszeniu traw, a przed pierwszym pokosem. Ilościowość w skali Braun-Blanqueta; warstwy C (trawy i zioła) i D (mszaki), krzewy – B.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Ocena realnych możliwości utrzymania siedliska we właściwej kondycji, uwzględniająca jego obecny stan zachowania oraz czynniki, mogące na nie oddziaływać w najbliższej przyszłości. Istotne jest zwłaszcza określenie możliwości ekstensywnego użytkowania kośnego lub kośno-pasterskiego.',
    help: `Weź pod uwagę przede wszystkim użytkowanie: łąka górska istnieje dzięki tradycyjnej gospodarce kośno-pasterskiej – koszeniu raz-dwa razy w roku ze zbiorem siana, umiarkowanemu nawożeniu organicznemu i nieintensywnemu wypasowi (owce, bydło, konie) późnym latem i jesienią. Zagrożenia: zarzucenie koszenia i wtórna sukcesja (najpoważniejsze), intensyfikacja (wielokrotne koszenie, podsiewanie mieszankami traw, nawożenie, intensywny wypas owiec – Tatry, Podhale), zalesianie (Małe Pieniny, Beskid Żywiecki, Góry Izerskie), zabudowa letniskowa i rekreacyjna, infrastruktura narciarska, gatunki inwazyjne (łubin trwały w Sudetach), susza (Góry Stołowe). Po stronie plusów: koszenie w ramach programów rolnośrodowiskowych, park narodowy z ochroną czynną (Pieniński PN – późne koszenie z pasami ekologicznymi).

Praktyka 2024–2025: FV na ok. 49–51% stanowisk; U1 przy niedawnym zarzuceniu koszenia, presji turystycznej, niewłaściwym użytkowaniu; U2 przy długotrwałym braku użytkowania (Zimne Wody, Kozia Hala, Wójtówka) i postępującej zabudowie (Antoniów, Lasówka). Karta z przewodnika (Lasówka, 2009): „Teren prawdopodobnie planowanej budowy domu jednorodzinnego, inwestycja zniszczy siedlisko na tym stanowisku” → U1 (w 2024 r. – już U2).`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A02', name: 'Zmiana sposobu uprawy' },
    { code: 'A02.01', name: 'Intensyfikacja rolnictwa' },
    { code: 'A03', name: 'Koszenie / ścinanie trawy' },
    { code: 'A03.01', name: 'Intensywne koszenie lub intensyfikacja' },
    { code: 'A03.02', name: 'Nieintensywne koszenie' },
    { code: 'A03.03', name: 'Zaniechanie / brak koszenia' },
    { code: 'A04', name: 'Wypas' },
    { code: 'A04.01', name: 'Wypas intensywny' },
    { code: 'A04.02', name: 'Wypas nieintensywny' },
    { code: 'A04.02.01', name: 'Nieintensywny wypas bydła' },
    { code: 'A04.02.02', name: 'Nieintensywny wypas owiec' },
    { code: 'A04.03', name: 'Zarzucenie pasterstwa, brak wypasu' },
    { code: 'A08', name: 'Nawożenie' },
    { code: 'B01', name: 'Zalesianie terenów otwartych' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D01.02', name: 'Drogi, autostrady' },
    { code: 'D02.01', name: 'Linie elektryczne i telefoniczne' },
    { code: 'E01', name: 'Tereny zurbanizowane, tereny zamieszkane' },
    { code: 'E01.03', name: 'Zabudowa rozproszona' },
    { code: 'F04', name: 'Pozyskiwanie / usuwanie roślin lądowych, ogólnie' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
    { code: 'G01.06', name: 'Narciarstwo, w tym poza trasami' },
    { code: 'G02.02', name: 'Kompleksy narciarskie' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J01.01', name: 'Wypalanie' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.02', name: 'Nagromadzenie materii organicznej' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'K04.01', name: 'Konkurencja' },
    { code: 'K04.05', name: 'Szkody wyrządzane przez roślinożerców (w tym zwierzynę łowną)' },
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
            hint: 'Np. gatunki chronione: mieczyk dachówkowaty, dzwonek piłkowany, storczyki.',
            help: 'Wartości przyrodnicze stanowiska poza samą łąką: rzadkie i chronione gatunki (sprawozdanie 2025: dzwonek piłkowany, lilia bulwkowata, mieczyk dachówkowaty, szafran spiski, zimowit jesienny, pełnik europejski, chaber perukowy, wszewłoga górska, arnika górska, tojady, storczyki – storczyk męski, ozorka zielona, storczyca kulista, gółka długoostrogowa, podkolan biały, listera jajowata, kukułki), sąsiednie siedliska (6230 psiary, 6510, 6430). Brak informacji – „Nie stwierdzono”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            label: 'Wykonywane działania ochronne',
            help: 'Jakie działania ochronne wykonano i z jakim skutkiem: koszenie czynnej ochrony (park narodowy, program rolnośrodowiskowy), usuwanie nalotu drzew i krzewów, wypas, zwalczanie łubinu. 2016–2018: koszenie naprzemienne zamiast pasowego w Magurskim PN poprawiło stan łąk. Brak – „Brak”.',
          },
          {
            kind: 'textarea',
            name: 'proposals',
            label: 'Propozycje wprowadzenia działań ochronnych',
            rows: 3,
            hint: 'Np. koszenie raz w roku po połowie lipca ze zbiorem siana; usunięcie podrostu.',
            help: 'Jakie działania proponujesz, konkretnie: koszenie (termin, częstotliwość, zbiór biomasy, pasy nieskoszone), wypas o niewielkiej intensywności albo koszenie naprzemiennie z wypasem, usunięcie nalotu drzew i krzewów, zwalczanie łubinu trwałego i innych gatunków inwazyjnych, rezygnacja z nawożenia mineralnego i podsiewu. Brak – „Brak”.',
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
            help: 'Czy stanowisko powinno zostać w sieci monitoringu. Uzasadnienie wpisz niżej (np. w 2025 r. wnioskowano o wyłączenie stanowisk z zakazem wstępu i Płazówki, gdzie łąka przekształciła się w pastwisko).',
          },
          {
            kind: 'textarea',
            name: 'justification',
            label: 'Uzasadnienie',
            rows: 3,
            help: 'Dlaczego monitoring jest (albo nie jest) potrzebny: typowo wykształcone płaty, gatunki rzadkie, zagrożenia; albo wniosek o usunięcie stanowiska (zanik siedliska, brak dostępu, nagromadzenie stanowisk w sąsiedztwie).',
          },
        ]
      if (f.name === 'notes')
        return [
          {
            kind: 'number',
            name: 'shareFV',
            group: 'Powierzchnia siedliska o różnym stanie zachowania na stanowisku',
            label: 'Udział powierzchni siedliska w stanie FV',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Karta z przewodnika podaje przy ocenie ogólnej udział procentowy powierzchni siedliska o różnym stanie zachowania na stanowisku (Lasówka: FV 40%, U1 60%, U2 0%). Trzy liczby powinny dać razem 100%.',
          },
          {
            kind: 'number',
            name: 'shareU1',
            group: 'Powierzchnia siedliska o różnym stanie zachowania na stanowisku',
            label: 'Udział powierzchni siedliska w stanie U1',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Procent powierzchni siedliska na stanowisku w stanie niezadowalającym (U1).',
          },
          {
            kind: 'number',
            name: 'shareU2',
            group: 'Powierzchnia siedliska o różnym stanie zachowania na stanowisku',
            label: 'Udział powierzchni siedliska w stanie U2',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Procent powierzchni siedliska na stanowisku w stanie złym (U2).',
          },
          {
            ...f,
            help: `${f.help ?? ''}\n\nDla 6520 zapisz tu także sposób użytkowania (koszenie – kiedy i ile razy, zbiór siana, wypas), datę wypełnienia karty, odstępstwa od transektu 10 × 200 m i gdy termin wypadł po pokosie.`.trim(),
          },
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_6520.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer6520(s) })),
  speciesInfo: (name) => {
    const s = findSpecies6520(name)
    if (!s) return undefined
    if (s.group === 'characteristic') {
      const src =
        s.source === 'tab1'
          ? 'tab. 1'
          : s.source === 'arrh'
            ? 'zw. Arrhenatherion'
            : s.source === 'report'
              ? 'sprawozdania'
              : `pkt 4 przewodnika – ${REGION_LABELS_6520[s.source as Region6520].split(' (')[0]}`
      return `${GROUP_LABELS_6520.characteristic} (${src}${s.region ? `; liczy się tylko w regionie: ${REGION_LABELS_6520[s.region].split(' (')[0]}` : ''})`
    }
    if (s.group === 'expansive') {
      if (s.disputed) return `${GROUP_LABELS_6520.expansive} (status sporny – u botaników czeskich diagnostyczny dla Polygono-Trisetion)`
      return s.strong ? `${GROUP_LABELS_6520.expansive} – silnie ekspansywny (tab. 1)` : GROUP_LABELS_6520.expansive
    }
    if (s.group === 'alien') return s.high ? 'gatunek obcy o wysokim stopniu inwazyjności' : 'gatunek obcy o niskim stopniu inwazyjności'
    if (s.lowland) return 'gatunek niżowego Arrhenatheretum elatioris – nie liczy się jako charakterystyczny 6520'
    return GROUP_LABELS_6520.companion
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator6520 = (id: string): IndicatorDef => {
  const i = methodology6520.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 6520`)
  return i
}
