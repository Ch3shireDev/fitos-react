// Metodyka 6170 (nawapienne murawy wysokogórskie Seslerion tatrae i wyleżyska śnieżne Arabidion coeruleae) jako dane.
// Źródło: Kozak M., Kozłowska K. 2012, „6170 Nawapienne murawy wysokogórskie (Seslerion tatrae) i wyleżyska śnieżne
// (Arabidion coeruleae)” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ,
// s. 299–320 (tab. 1 i 2, karta Upłaziańska Kopa 2), z praktyką oceny ze sprawozdań z monitoringu 2009–2011, 2015–2018
// (badania 2016) i 2020–2021 (badania 2021). Siedlisko niepriorytetowe, tylko region alpejski: Tatry, Pieniny (z Małymi
// Pieninami) i Babia Góra. Transekt ok. 100–200 × 10–15 m, 3 zdjęcia 5 × 5 m (początek, środek, koniec); na murawach
// naskalnych, mylonitach i wyleżyskach – stanowiska punktowe. Część progów tab. 2 zależy od pasma (Pieniny, Babia Góra)
// i od tego, czy to murawa naskalna – wybiera się to w „Stanowisku” (podtyp i typ płatów).
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_6170,
  RANGE_LABELS_6170,
  SPECIES_6170,
  defaultLayer6170,
  findSpecies6170,
  isAcidophilous6170,
  isCalcicole6170,
  isDwarfShrub6170,
  isMugo6170,
  isWoody6170,
  speciesKey6170,
  type Range6170,
} from './species'

// ---------- podtypy, pasma, murawy naskalne ----------

export const SUBTYPES_6170: (SelectOption & { range: Range6170 })[] = [
  { value: '6170-1', label: '6170-1 – Tatrzańskie murawy wysokogórskie', range: 'tatry' },
  { value: '6170-2', label: '6170-2 – Zbiorowiska wyleżyskowe na ustalonych piargach', range: 'tatry' },
  { value: '6170-3', label: '6170-3 – Pienińskie górskie murawy naskalne', range: 'pieniny' },
  { value: '6170-4', label: '6170-4 – Babiogórskie murawy wapniolubne', range: 'babia' },
]

/** Pasmo z podtypu; bez podtypu – Tatry (progi podstawowe tab. 2). */
export const rangeOf6170 = (site?: InputValues): Range6170 => SUBTYPES_6170.find((s) => s.value === site?.subtype)?.range ?? 'tatry'
const rangeOf = (ctx?: IndicatorContext) => rangeOf6170(ctx?.site)
const hasSubtype = (ctx?: IndicatorContext) => SUBTYPES_6170.some((s) => s.value === ctx?.site?.subtype)

/** Murawa naskalna (osobne progi „Średniego pokrycia roślin zielnych”): wybór w „Stanowisku”, a bez niego – podtyp 6170-3. */
export const isRockFace6170 = (site?: InputValues): boolean =>
  site?.rockFace === 'yes' ? true : site?.rockFace === 'no' ? false : site?.subtype === '6170-3'

// ---------- progi liczbowe (tab. 2) ----------

/** Bogactwo gatunkowe (liczba gatunków na 25 m²): >30 – FV; 20–30 – U1; <20 – U2. */
export const gradeRichness6170 = (n: number): Grade => (n > 30 ? 'FV' : n >= 20 ? 'U1' : 'U2')

/** Słowny opis bogactwa wg tab. 2 (FV: „>30 (duże) lub >35 (wyjątkowo duże)”; tab. 1 podaje inne granice klas). */
export const richnessClass6170 = (n: number): string => (n > 35 ? 'Wyjątkowo duże' : n > 30 ? 'Duże' : n >= 20 ? 'Średnie' : 'Małe')

/** Cenne składniki flory: Tatry >20 FV, 10–20 U1, <10 U2; Pieniny i Babia Góra >15 FV, 5–15 U1, <5 U2. */
export function gradeValuable6170(n: number, range: Range6170): Grade {
  const [fv, u1] = range === 'tatry' ? [20, 10] : [15, 5]
  return n > fv ? 'FV' : n >= u1 ? 'U1' : 'U2'
}

/** Gatunki nawapienne: >20 FV, 10–20 U1, <10 U2; Babia Góra >10 FV, 5–10 U1, <5 U2. */
export function gradeCalcicole6170(n: number, range: Range6170): Grade {
  const [fv, u1] = range === 'babia' ? [10, 5] : [20, 10]
  return n > fv ? 'FV' : n >= u1 ? 'U1' : 'U2'
}

/** Gatunki typowe dla podłoża bezwapiennego: <5 FV, 5–10 U1, >10 U2; Babia Góra <10 FV, 10–20 U1, >20 U2. */
export function gradeAcidophilous6170(n: number, range: Range6170): Grade {
  const [fv, u1] = range === 'babia' ? [10, 20] : [5, 10]
  return n < fv ? 'FV' : n <= u1 ? 'U1' : 'U2'
}

/** Stan populacji gatunków bezwapiennych (pokrycie transektu): <10% FV, 10–20% U1, >20% U2; Babia Góra 20 / 20–40 / >40. */
export function gradeAcidCover6170(c: number, range: Range6170): Grade {
  const [fv, u1] = range === 'babia' ? [20, 40] : [10, 20]
  return c < fv ? 'FV' : c <= u1 ? 'U1' : 'U2'
}

/** Pokrycie drzew i krzewów (waloryzacja od 2012): <10% (sama kosodrzewina <20%) FV, do 50% U1, >50% U2. */
export const gradeShrubs6170 = (c: number, onlyMugo = false): Grade => (c < (onlyMugo ? 20 : 10) ? 'FV' : c <= 50 ? 'U1' : 'U2')

/** Procent powierzchni zajęty przez siedlisko na transekcie: >75 FV, 50–75 U1, <50 U2. */
export const gradeHabitatShare6170 = (p: number): Grade => (p > 75 ? 'FV' : p >= 50 ? 'U1' : 'U2')

/** Średnie pokrycie roślin zielnych: >75 FV, 50–75 U1, <50 U2; murawy naskalne >25 FV, 10–25 U1, <10 U2. */
export function gradeHerbCover6170(p: number, rockFace: boolean): Grade {
  const [fv, u1] = rockFace ? [25, 10] : [75, 50]
  return p > fv ? 'FV' : p >= u1 ? 'U1' : 'U2'
}

/** Erozja – odsetek transektu z erozją nasiloną: 0 FV, do 25% U1 („niewielka część, <25%”), ponad 25% U2. */
export const gradeErosionShare6170 = (p: number): Grade => (p <= 0 ? 'FV' : p <= 25 ? 'U1' : 'U2')

/**
 * Gatunki ekspansywne (tab. 2): zielne – brak FV, pojedyncze do 10% U1, liczniejsze >10% U2; krzewy – do 10%
 * (sama kosodrzewina do 20%) FV, 10–50% U1, >50% U2. Ocena = gorsza z dwóch części. herb 'present' – zielne bez pokrycia.
 */
export function gradeExpansive6170(herb: number | 'present' | undefined, woody: number | undefined, onlyMugo = false): Grade {
  const order: Grade[] = ['FV', 'U1', 'U2']
  const h: Grade = herb === undefined || herb === 0 ? 'FV' : herb === 'present' || herb <= 10 ? 'U1' : 'U2'
  const w: Grade = woody === undefined || woody <= (onlyMugo ? 20 : 10) ? 'FV' : woody <= 50 ? 'U1' : 'U2'
  return order[Math.max(order.indexOf(h), order.indexOf(w))]
}

/**
 * Gatunki synantropijne (tab. 2): zupełny brak – FV; pojedyncze osobniki tylko 1 gatunku lub nasadzenia drzew na <20%
 * transektu – U1; kilka gatunków, 1 gatunek o pokryciu >10% lub nasadzenia na >20% – U2.
 */
export function gradeSynanthropic6170(count: number, maxCover: number | undefined, planted: number | undefined): Grade {
  if (count >= 2 || (count === 1 && (maxCover ?? 0) > 10) || (planted ?? 0) > 20) return 'U2'
  if (count === 1 || (planted ?? 0) > 0) return 'U1'
  return 'FV'
}

const pct = (v: number) => `${plNum(v)}%`
const round1 = (n: number) => Math.round(n * 10) / 10
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey6170(n), n])).values()]

/** Suma pokrycia wierszy listy spełniających warunek; 'present' – są wiersze, ale bez pokrycia; undefined – brak wierszy. */
function sumCover(list: unknown, pred: (name: string) => boolean = () => true): number | 'present' | undefined {
  const rows = speciesRows(list).filter((r) => r.name?.trim() && pred(r.name.trim()))
  if (!rows.length) return undefined
  const covers = rows.map((r) => num(r.cover)).filter((c): c is number => c !== undefined)
  return covers.length ? round1(covers.reduce((a, b) => a + b, 0)) : 'present'
}

// ---------- opcje selektów (tab. 2) ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'other', label: 'Inne kombinacje', grade: 'U1' },
  { value: 'decrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi w literaturze', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const EROSION: GradedOption[] = [
  { value: 'none', label: 'Brak lub słabo widoczna', grade: 'FV' },
  { value: 'local', label: 'Nasilona, lecz tylko na niewielkiej części (<25%) transektu', grade: 'U1' },
  { value: 'wide', label: 'Nasilona na ponad 25% transektu', grade: 'U2' },
]
const CALCICOLE_POP: GradedOption[] = [
  {
    value: 'fv',
    label: 'Gatunki zdecydowanie dominujące, masowo kwitnące (Babia Góra – gatunki występują dość licznie i są współdominujące)',
    grade: 'FV',
  },
  {
    value: 'u1',
    label: 'Gatunki występują dość licznie i obficie kwitną, lecz nie są dominujące (Babia Góra – występują nielicznie, lecz nie wykazują obniżonej żywotności)',
    grade: 'U1',
  },
  {
    value: 'u2',
    label: 'Gatunki występują nielicznie lub wykazują obniżoną żywotność (Babia Góra – występują sporadycznie lub wykazują obniżoną żywotność)',
    grade: 'U2',
  },
]
const ACID_POP: GradedOption[] = [
  {
    value: 'fv',
    label: 'Pokrywają poniżej 10% (Babia Góra – 20%) transektu lub nieco więcej, lecz wykazują obniżoną żywotność',
    grade: 'FV',
  },
  { value: 'u1', label: 'Pokrywają 10–20% (Babia Góra – 20–40%) powierzchni', grade: 'U1' },
  { value: 'u2', label: 'Pokrywają ponad 20% (Babia Góra – 40%) powierzchni, obficie kwitną i owocują', grade: 'U2' },
]
const SPATIAL: GradedOption[] = [
  { value: 'fv', label: 'Zdecydowanie dominują płaty typowego siedliska, zwarcie krzewów nie większe niż 20%', grade: 'FV' },
  {
    value: 'u1',
    label: 'Obecne płaty innych typów zbiorowisk lub płaty przejściowe, przy czym płaty typowe dominują, zwarcie krzewów nie większe niż 50%',
    grade: 'U1',
  },
  {
    value: 'u2',
    label: 'Dominują płaty przejściowe do innych zbiorowisk, często obecne fitocenozy innych typów zbiorowisk lub struktura zaburzona silnym rozrastaniem się drzew lub krzewów o pokryciu >50%',
    grade: 'U2',
  },
]
const TRAMPLING: GradedOption[] = [
  { value: 'fv', label: 'Brak lub nieznaczne w postaci 1 lub 2 mało uczęszczanych ścieżek', grade: 'FV' },
  {
    value: 'u1',
    label: 'Widoczne w postaci 1 lub 2 średnio- lub kilku mało uczęszczanych ścieżek, brak lub niewielkie ślady wydeptywania poza ścieżkami',
    grade: 'U1',
  },
  {
    value: 'u2',
    label: 'Widoczne w postaci kilku średnio lub często uczęszczanych lub licznych mało uczęszczanych ścieżek, lub widoczne wyraźne ślady wydeptywania na znacznej powierzchni poza ścieżkami',
    grade: 'U2',
  },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

/** Select niewymagany – gdy liczba wystarcza, nie trzeba go wybierać. */
const optionalSelect = (label: string, options: GradedOption[], help?: string, name = 'choice'): FieldDef => ({ ...selectInput(label, options, help, name), required: false })

const gradeChoice = (name = 'choice'): FieldDef => ({
  kind: 'select',
  name,
  label: 'Ocena (opcjonalnie)',
  options: [{ value: '', label: '—' }, ...(['FV', 'U1', 'U2'] as const).map((g) => ({ value: g, label: g }))],
  help: 'Ocena ekspercka wg tab. 2 – ma pierwszeństwo przed liczeniem z listy (np. gdy gatunków jest mniej, ale zdecydowanie dominują na transekcie). Karta pokaże, jeśli wybór odbiega od progów.',
})
const expertGrade = (i: InputValues): Grade | null => {
  const g = String(i.choice ?? '')
  return g === 'FV' || g === 'U1' || g === 'U2' ? g : null
}

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

const countInput = (label: string, help: string): FieldDef => ({ kind: 'number', name: 'count', label, min: 0, help })

const SURFACE = 'w % powierzchni transektu (dla „<1%” albo „znikome” wpisz 0,5)'

/** Liczba gatunków: wpisana wprost > policzona z listy > 0 przy „nie stwierdzono”. */
function countOf(i: InputValues, pred: (name: string) => boolean = () => true): number | undefined {
  const c = num(i.count)
  if (c !== undefined) return c
  const names = distinct(rowNames(i.species).filter(pred))
  if (rowNames(i.species).length) return names.length
  return i.none === 'yes' ? 0 : undefined
}

const listOrCount = (i: InputValues, unit = 'gat.') => {
  if (note(i)) return note(i)
  const list = describeSpecies(speciesRows(i.species))
  const c = num(i.count)
  if (list) return c !== undefined ? `${plNum(c)} ${unit}: ${list}` : list
  if (c !== undefined) return `${plNum(c)} ${unit}`
  return i.none === 'yes' ? 'Brak' : ''
}

const RANGE_NOTE = (ctx?: IndicatorContext) => (hasSubtype(ctx) ? '' : ' Wybierz podtyp w „Stanowisku” – do tego czasu formularz liczy progi dla Tatr.')

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description: 'Powierzchnia siedliska na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi w literaturze (tab. 2: „Powierzchnia siedliska na stanowisku”).',
    help: `Co wybrać: jak zmieniła się powierzchnia płatów 6170 na stanowisku od poprzedniego badania albo względem literatury. Samą powierzchnię (np. „0,18 ha (100% transektu)”) wpisz obok – trafi do „wartości”.

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; inne kombinacje – U1; wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub danymi w literaturze – U2. Przy pierwszym badaniu bez danych wybierz „Brak danych do porównania” (XX) albo oceń ekspercko.

Praktyka: w 2021 r. FV na 18 z 20 stanowisk; U1 na Kopieńcu i Zawiesach – duży udział drzew i „potencjalne zmniejszanie się powierzchni”. Mozaika z piargami (8120), murawami naskalnymi (8210) i kosodrzewiną jest naturalna i sama nie obniża oceny. Karta z przewodnika (Upłaziańska Kopa 2): „Areał stabilny” → FV.`,
    thresholds: thresholdsOf(AREA.filter((o) => o.grade !== 'XX')),
    inputs: [
      selectInput('Zmiana powierzchni', AREA),
      { kind: 'text', name: 'areaText', label: 'Powierzchnia (opcjonalnie)', placeholder: 'np. 0,18 ha (100% transektu)', help: 'Powierzchnia płatów siedliska na stanowisku – trafi do pola „wartość”. Sprawozdanie 2021: od 0,013 do 2 ha na stanowisko.' },
      noteInput('Opis (opcjonalnie)', 'np. Areał stabilny.', 'Krótki opis zmian, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => note(i) || String(i.areaText ?? '').trim() || labelOf(AREA, i.choice),
  },
  {
    id: 'richness',
    label: 'Bogactwo gatunkowe',
    parameter: 'structure',
    cardinal: true,
    description:
      'Liczba gatunków roślin naczyniowych stwierdzonych na powierzchni 25 m², obliczona na podstawie trzech zdjęć fitosocjologicznych sporządzonych w transekcie, z krótkim opisem słownym (>40 – wyjątkowo duże, 30–40 – duże, 20–30 – średnie, <20 – małe).',
    help: `Co wpisać: średnią (albo typową) liczbę gatunków roślin naczyniowych na 25 m² z trzech zdjęć fitosocjologicznych – bez mszaków i porostów. Opis słowny („Wyjątkowo duże, ok. 40 gat. roślin naczyniowych/25 m²”) formularz zrobi sam.

Progi (tab. 2): >30 (duże) lub >35 (wyjątkowo duże) – FV; 20–30 (średnie) – U1; <20 (małe) – U2. Granice 20 i 30 formularz liczy do U1.

Rozjazd w samym przewodniku: tab. 1 nazywa „wyjątkowo dużym” bogactwo >40, „dużym” 30–40, a tab. 2 – >35 i >30. Na ocenę to nie wpływa (FV od 31 gat.), formularz opisuje słownie wg tab. 2, tak jak karta przykładowa („Wyjątkowo duże, ok. 40”).

Praktyka 2021: od 20 do 54 gat./25 m²; Tatry do ponad 50, Okrąglica i Wąwóz Sobczański 46–47, Babia Góra 25–30, najniżej położone stanowiska pienińskie 20–30 (U1).

Wskaźnik kardynalny – jeden z trzech najważniejszych dla wartości przyrodniczej fitocenoz.`,
    thresholds: { FV: '>30 (duże) lub >35 (wyjątkowo duże)', U1: '20–30 (średnie)', U2: '<20 (małe)' },
    inputs: [
      { kind: 'number', name: 'count', label: 'Liczba gatunków na 25 m²', min: 0, required: true, help: 'Liczba gatunków roślin naczyniowych na 25 m² – średnia z trzech zdjęć fitosocjologicznych (5 × 5 m). Bez mszaków i porostów.' },
      noteInput('Opis (opcjonalnie)', 'np. Wyjątkowo duże, ok. 40 gat. roślin naczyniowych/25 m²', 'Krótki opis słowny, który trafi do „wartości” w karcie zamiast opisu generowanego z liczby.'),
    ],
    suggest: (i) => {
      const n = num(i.count)
      return n === undefined ? null : gradeRichness6170(n)
    },
    explain: (i) => {
      const n = num(i.count)
      return n === undefined ? null : `${richnessClass6170(n)} bogactwo: ${plNum(n)} gat./25 m².`
    },
    warn: (i) => {
      const n = num(i.count)
      return n !== undefined && n > 80 ? 'Ponad 80 gatunków na 25 m²? Przewodnik: w skrajnych przypadkach do 60 – sprawdź.' : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const n = num(i.count)
      return n === undefined ? '' : `${richnessClass6170(n)}, ok. ${plNum(n)} gat. roślin naczyniowych/25 m²`
    },
  },
  {
    id: 'valuable',
    label: 'Cenne składniki flory',
    parameter: 'structure',
    cardinal: true,
    description:
      'Obecność w całym transekcie (nie tylko w zdjęciach fitosocjologicznych!) gatunków o szczególnych walorach przyrodniczych: prawnie chronionych, z czerwonej listy, z Polskiej Czerwonej Księgi Roślin i Czerwonej Księgi Karpat Polskich, wysokogórskich i endemicznych.',
    help: `Co wpisać: wszystkie cenne gatunki stwierdzone na całym transekcie (w tym storczykowate) – pokrycie niepotrzebne. Formularz liczy każdy wpisany gatunek raz (synonimy raz); liczbę możesz też wpisać wprost. Status (CHR – chroniony, CL – czerwona lista, PCzKR, CzKKP, * – wysokogórski) dopisz w opisie, jak w karcie.

Progi (tab. 2): >20 gatunków (Pieniny i Babia Góra >15) lub mniej, lecz szczególnie cenne (np. z czerwonych ksiąg) – FV; 10–20 (Pieniny i Babia Góra 5–15) – U1; <10 (Pieniny i Babia Góra <5) – U2. Pasmo bierze się z podtypu w „Stanowisku”. „Mniej, lecz szczególnie cenne” – wybierz ocenę ekspercką.

Praktyka 2021: Tatry zwykle 40–50, maks. 64 (Upłaziańska Kopa, Kominiarski Wierch); Pieniny 20–30; Babia Góra 16–20+; Zawiesy i Biała Woda po 14 → U1. Karta z przewodnika: 51 gat. → FV.

Sprawozdanie 2015–2018 proponowało rezygnację z tego wskaźnika (pokrywa się z „Gatunkami nawapiennymi”) – nie weszło, w 2021 r. nadal oceniany jako kardynalny.`,
    thresholds: {
      FV: '>20 gatunków (dla Pienin i Babiej Góry >15) lub mniej, lecz szczególnie cenne (np. zamieszczone w czerwonych księgach)',
      U1: '10–20 gatunków (dla Pienin i Babiej Góry 5–15)',
      U2: '<10 gatunków (dla Pienin i Babiej Góry <5)',
    },
    inputs: [
      speciesInput('Cenne gatunki', 'Wszystkie cenne gatunki z transektu, bez pokrycia, np. Chamorchis alpina, Erigeron hungaricus, Leontopodium alpinum.'),
      countInput('Liczba cennych gatunków (opcjonalnie)', 'Łączna liczba cennych gatunków na transekcie, wpisana wprost – ma pierwszeństwo przed liczeniem z listy.'),
      gradeChoice(),
      noteInput('Opis (opcjonalnie)', 'np. storczykowate: potrostek alpejski Chamorchis alpina* (PCzKR, CzKKP, CL, CHR)…', 'Wykaz gatunków ze statusem (jak w karcie), który trafi do „wartości” zamiast listy.'),
    ],
    suggest: (i, ctx) => {
      const g = expertGrade(i)
      if (g) return g
      const n = countOf(i)
      return n === undefined ? null : gradeValuable6170(n, rangeOf(ctx))
    },
    explain: (i, ctx) => {
      if (expertGrade(i)) return null
      const n = countOf(i)
      return n === undefined ? null : `Cennych gatunków: ${plNum(n)} (progi: ${RANGE_LABELS_6170[rangeOf(ctx)]}).${RANGE_NOTE(ctx)}`
    },
    warn: (i, ctx) => {
      const g = expertGrade(i)
      const n = countOf(i)
      if (g && n !== undefined) {
        const calc = gradeValuable6170(n, rangeOf(ctx))
        if (g !== calc) return `Wybrano ${g}, a z liczby gatunków wychodzi ${calc} – uzasadnij w opisie (np. gatunki szczególnie cenne).`
      }
      return null
    },
    describe: (i) => listOrCount(i),
  },
  {
    id: 'erosion',
    label: 'Erozja',
    parameter: 'structure',
    description:
      'Efekty erozji, tj. ślady po spływie wód opadowych lub skutki ruchów masowych w postaci osuwisk ziemi i piarżysk, na transekcie i w jego bezpośrednim sąsiedztwie. Erozja wierzchniej warstwy skały, gdy zwietrzelina zostaje in situ i szybko zarasta, to „słabo widoczna”.',
    help: `Co wybrać: jak nasilona jest erozja (spływ wód, osuwiska gleby, osuwające się piarżyska, erozja „turystyczna” przy ścieżkach) na transekcie i tuż obok. Odsetek transektu z erozją nasiloną możesz wpisać liczbą.

Progi (tab. 2): brak lub słabo widoczna – FV; nasilona, lecz tylko na niewielkiej części (<25%) transektu – U1; nasilona na ponad 25% transektu – U2. Liczba: 0 → FV, do 25% → U1 (granicę formularz liczy do U1), powyżej → U2. Wybór ma pierwszeństwo przed liczbą.

Praktyka: erozja w wysokich górach jest zjawiskiem naturalnym. W 2021 r. 12 × FV, 7 × U1 (np. Giewont 1 i 2, Stoły – do 10–15%; Przełom Dunajca – obrywy skalne), 1 × U2 (Kopieniec – wydeptywanie i osuwiska). Karta z przewodnika: „Nasilona tylko w niektórych miejscach, widoczne ślady erozji wodnej oraz grawitacyjnych ruchów masowych” → U1.`,
    thresholds: thresholdsOf(EROSION),
    inputs: [
      optionalSelect('Stopień nasilenia zjawiska', EROSION, 'Puste, gdy wpisujesz odsetek liczbą. Wybór ma pierwszeństwo przed liczbą.'),
      { kind: 'number', name: 'share', label: 'Erozja nasilona na (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Jaka część transektu (w %) ma erozję nasiloną: 0 – brak lub słabo widoczna (FV), do 25% – U1, więcej – U2.' },
      noteInput('Opis (opcjonalnie)', 'np. Nasilona tylko w niektórych miejscach, widoczne ślady erozji wodnej oraz grawitacyjnych ruchów masowych.', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: (i) => {
      const chosen = gradeMap(EROSION)[String(i.choice)]
      if (chosen) return chosen
      const s = num(i.share)
      return s === undefined ? null : gradeErosionShare6170(s)
    },
    explain: (i) => {
      const s = num(i.share)
      return !i.choice && s !== undefined ? `Erozja nasilona na ${pct(s)} transektu.` : null
    },
    warn: (i) => {
      const s = num(i.share)
      const chosen = gradeMap(EROSION)[String(i.choice)]
      if (chosen && s !== undefined && chosen !== gradeErosionShare6170(s)) return `Wybrano ${chosen}, a odsetek ${pct(s)} daje ${gradeErosionShare6170(s)} – sprawdź.`
      return null
    },
    describe: (i) => note(i) || (i.choice ? labelOf(EROSION, i.choice) : num(i.share) !== undefined ? `Nasilona na ${pct(num(i.share)!)} transektu` : ''),
  },
  {
    id: 'expansive',
    label: 'Gatunki ekspansywne',
    parameter: 'structure',
    description:
      'Lista gatunków roślin (zielnych oraz drzewiastych) o skłonnościach do występowania w zwartych skupieniach, które stanowią obecnie lub potencjalnie mogą w najbliższym czasie być zagrożeniem dla struktury i różnorodności florystycznej płatów. Tylko gatunki towarzyszące, nie charakterystyczne ani wyróżniające dla muraw. W niższych położeniach – wszystkie młode drzewa i krzewy; wyżej praktycznie tylko kosodrzewina („potencjalnie ekspansywna” przy zwarciu ok. 20%).',
    help: `Co wpisać: gatunki ekspansywne z pokryciem ${SURFACE} – rośliny zielne (np. śmiałek darniowy, trzcinnik leśny) i krzewy (kosodrzewina, świerk, jałowiec, wierzba śląska, jarząb). Sumy formularz liczy osobno dla zielnych i dla krzewów; obie możesz też wpisać wprost.

Progi (tab. 2): brak roślin zielnych, krzewy o pokryciu do 10% lub obecna jedynie kosodrzewina o pokryciu do 20% – FV; pojedyncze rośliny zielne o pokryciu do 10% lub obecne krzewy o pokryciu 10–50% – U1; liczniejsze rośliny zielne o pokryciu >10% lub obecne krzewy o pokryciu >50% – U2. Ocena to gorsza z dwóch części (zielne, krzewy).

Jak liczy formularz: krzewinki (borówka czarna i brusznica, bażyna) liczą się z krzewami – w 2021 r. borówka czarna na ok. 50% Akademickiej Perci dostała U1, czyli próg krzewów, nie roślin zielnych (te dałyby U2). Trzcinnik pstry w Pieninach to stały składnik muraw (sprawozdanie 2021) – przy podtypie 6170-3 formularz go pomija. Zielne bez pokrycia – „pojedyncze” (U1). Karta z przewodnika: „Brak” → FV.

Ocena wybrana w polu ma pierwszeństwo.`,
    thresholds: {
      FV: 'Brak roślin zielnych, krzewy o pokryciu do 10% lub obecna jedynie kosodrzewina o pokryciu do 20%',
      U1: 'Pojedyncze rośliny zielne o pokryciu do 10% lub obecne krzewy o pokryciu 10–50%',
      U2: 'Liczniejsze rośliny zielne o pokryciu >10% lub obecne krzewy o pokryciu >50%',
    },
    inputs: [
      speciesInput('Gatunki ekspansywne', `Gatunki z pokryciem ${SURFACE}, np. Pinus mugo 15, Vaccinium myrtillus 50, Deschampsia cespitosa 5.`),
      { kind: 'number', name: 'herbTotal', label: 'Pokrycie roślin zielnych (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Łączne pokrycie ekspansywnych roślin zielnych w % transektu – ma pierwszeństwo przed sumą z listy.' },
      { kind: 'number', name: 'woodyTotal', label: 'Pokrycie krzewów (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Łączne pokrycie ekspansywnych krzewów, drzew i krzewinek w % transektu – ma pierwszeństwo przed sumą z listy. Gdy to sama kosodrzewina, wpisz ją na liście – wtedy działa próg 20%.' },
      NONE_FIELD('Brak gatunków ekspansywnych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków ekspansywnych – wtedy wskaźnik to FV.'),
      gradeChoice(),
      noteInput('Opis (opcjonalnie)', 'np. Brak', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i, ctx) => {
      const g = expertGrade(i)
      if (g) return g
      const f = expansiveFacts(i, ctx)
      if (!f) return null
      if (f.woody === 'present') return null
      return gradeExpansive6170(f.herb, f.woody, f.onlyMugo)
    },
    explain: (i, ctx) => {
      if (expertGrade(i)) return null
      const f = expansiveFacts(i, ctx)
      if (!f || (f.herb === undefined && f.woody === undefined)) return null
      const parts = [
        f.herb === undefined ? 'zielne: brak' : f.herb === 'present' ? 'zielne bez pokrycia – „pojedyncze”' : `zielne ${pct(f.herb)}`,
        f.woody === undefined ? 'krzewy: brak' : f.woody === 'present' ? 'krzewy bez pokrycia – wpisz pokrycie' : `krzewy ${pct(f.woody)}${f.onlyMugo ? ' (sama kosodrzewina – próg 20%)' : ''}`,
      ]
      if (f.skipped.length) parts.push(`pominięte: ${f.skipped.join(', ')}`)
      return `${parts.join('; ')}.`
    },
    warn: (i, ctx) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.herbTotal) ?? 0) > 0 || (num(i.woodyTotal) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo pokrycie nie są puste.')
      const calc = names.filter((n) => isCalcicole6170(n))
      if (calc.length) parts.push(`Gatunki nawapienne (typowe dla murawy) nie są ekspansywne: ${calc.join(', ')}.`)
      const g = expertGrade(i)
      const f = expansiveFacts(i, ctx)
      if (g && f && f.woody !== 'present') {
        const c = gradeExpansive6170(f.herb, f.woody, f.onlyMugo)
        if (c !== g) parts.push(`Wybrano ${g}, a z pokrycia wychodzi ${c} – uzasadnij w opisie.`)
      }
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      return list || (i.none === 'yes' ? 'Brak' : '')
    },
  },
  {
    id: 'calcicole',
    label: 'Gatunki nawapienne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków wyraźnie preferujących podłoże bogate w węglan wapnia – występujących wyłącznie lub częściej na glebach o wysokim odczynie (pH>6). Gwiazdką zaznacza się gatunki charakterystyczne dla klasy Seslerietea variae.',
    help: `Co wpisać: wszystkie gatunki nawapienne stwierdzone na transekcie, bez pokrycia. Katalog zna listy z przewodnika dla Tatr, Babiej Góry i Pienin (pkt 4) – gatunek z dowolnej listy liczy się w każdym paśmie. Gatunki spoza katalogu też się liczą; nie liczą się te, które katalog zna jako bezwapienne, synantropijne albo drzewa. Liczbę możesz wpisać wprost.

Progi (tab. 2): >20 gatunków (Babia Góra >10) lub mniej, lecz dominujące na transekcie – FV; 10–20 (Babia Góra 5–10) – U1; <10 (Babia Góra <5) – U2. „Mniej, lecz dominujące” – wybierz ocenę ekspercką.

Praktyka 2021: Tatry i Pieniny od ponad 20 (Jamborowa Czuba) do 51 (Wąwóz Kraków); Babia Góra 5–6 → U1 (próg babiogórski); Zawiesy i Przełom Dunajca poniżej 20 → U1. Wahania o 2–3 gatunki to zwykle kwestia wykrywalności, nie zmiana. Karta z przewodnika: 35 gat. → FV.

Wskaźnik kardynalny – w 2016 r. najsilniej ze wszystkich wpływał na ocenę struktury.`,
    thresholds: {
      FV: '>20 (dla Babiej Góry >10) gatunków lub mniej, lecz dominujące na transekcie',
      U1: '10–20 gatunków (dla Babiej Góry 5–10)',
      U2: '<10 gatunków (dla Babiej Góry <5)',
    },
    inputs: [
      speciesInput('Gatunki nawapienne', 'Gatunki nawapienne z całego transektu, bez pokrycia, np. Dryas octopetala, Sesleria tatrae, Saxifraga paniculata.'),
      countInput('Liczba gatunków nawapiennych (opcjonalnie)', 'Łączna liczba gatunków nawapiennych na transekcie, wpisana wprost – ma pierwszeństwo przed liczeniem z listy.'),
      gradeChoice(),
      noteInput('Opis (opcjonalnie)', 'np. przywrotnik siwy Alchemilla flabellata*, naradka włosista Androsace chamaejasme*…', 'Wykaz gatunków (z gwiazdkami), który trafi do „wartości” zamiast listy.'),
    ],
    suggest: (i, ctx) => {
      const g = expertGrade(i)
      if (g) return g
      const n = countOf(i, countsAsCalcicole)
      return n === undefined ? null : gradeCalcicole6170(n, rangeOf(ctx))
    },
    explain: (i, ctx) => {
      if (expertGrade(i)) return null
      const n = countOf(i, countsAsCalcicole)
      if (n === undefined) return null
      const star = distinct(rowNames(i.species).filter((x) => findSpecies6170(x)?.star)).length
      return `Gatunków nawapiennych: ${plNum(n)}${num(i.count) === undefined && star ? `, w tym ${star} z gwiazdką (Seslerietea variae)` : ''} (progi: ${RANGE_LABELS_6170[rangeOf(ctx)]}).${RANGE_NOTE(ctx)}`
    },
    warn: (i, ctx) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      const other = names.filter((n) => !countsAsCalcicole(n))
      if (other.length) parts.push(`Nie liczą się jako nawapienne: ${other.join(', ')}.`)
      const g = expertGrade(i)
      const n = countOf(i, countsAsCalcicole)
      if (g && n !== undefined) {
        const calc = gradeCalcicole6170(n, rangeOf(ctx))
        if (g !== calc) parts.push(`Wybrano ${g}, a z liczby gatunków wychodzi ${calc} – uzasadnij w opisie (np. gatunki dominują na transekcie).`)
      }
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => listOrCount(i),
  },
  {
    id: 'synanthropic',
    label: 'Gatunki synantropijne',
    parameter: 'structure',
    description:
      'Lista roślin zawleczonych przez człowieka, charakterystycznych dla zbiorowisk synantropijnych – w płatach muraw nie powinny występować. Także nasadzone drzewa i krzewy (z adnotacją), z wyjątkiem reintrodukowanej kosodrzewiny.',
    help: `Co wpisać: gatunki synantropijne (wiechlina roczna, pokrzywa, babka zwyczajna, zawleczone drzewa owocowe) z pokryciem ${SURFACE}; gatunki obce (winobluszcz zaroślowy, niecierpek drobnokwiatowy) też tutaj – karta 6170 nie ma osobnego wskaźnika obcych. Nasadzenia drzew (np. modrzew na Kopieńcu) wpisz jako pokrycie w osobnym polu.

Progi (tab. 2): zupełny brak – FV; pojedyncze osobniki tylko 1 gatunku o znikomym pokryciu lub obecne nasadzenia drzew na <20% transektu – U1; kilka gatunków lub tylko jeden gatunek, jeśli jego pokrycie w transekcie wynosi >10%, lub obecne nasadzenia drzew na >20% transektu – U2.

Jak liczy formularz: 2 i więcej gatunków → U2; 1 gatunek – U1, a przy pokryciu >10% – U2; nasadzenia do 20% (włącznie) → U1, powyżej → U2. Kosodrzewina (reintrodukowana) się nie liczy. Praktyka 2021: modrzew z nasadzeń (15%) na Kopieńcu → U1; pokrzywę u podnóża skał (nie wchodzi na skały) w Pieninach pominięto → FV. Karta z przewodnika: „Brak” → FV.`,
    thresholds: {
      FV: 'Zupełny brak',
      U1: 'Pojedyncze osobniki tylko 1 gatunku o znikomym pokryciu lub obecne nasadzenia drzew na <20% transektu',
      U2: 'Kilka gatunków lub tylko jeden gatunek, jeśli jego pokrycie w transekcie wynosi >10%, lub obecne nasadzenia drzew na >20% transektu',
    },
    inputs: [
      speciesInput('Gatunki synantropijne', `Gatunki synantropijne i zawleczone z pokryciem ${SURFACE}, np. Poa annua 0,5, Urtica dioica 1.`),
      { kind: 'number', name: 'planted', label: 'Nasadzenia drzew (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Jaką część transektu (w %) zajmują nasadzone drzewa i krzewy (np. modrzew, olsza), bez reintrodukowanej kosodrzewiny. Do 20% – U1, więcej – U2.' },
      NONE_FIELD('Brak gatunków synantropijnych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków synantropijnych ani nasadzeń – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const f = synanthropicFacts(i)
      return f ? gradeSynanthropic6170(f.count, f.maxCover, f.planted) : null
    },
    explain: (i) => {
      const f = synanthropicFacts(i)
      if (!f || (f.count === 0 && !f.planted)) return null
      return [
        f.count ? `Gatunków synantropijnych: ${f.count}${f.maxCover !== undefined ? ` (największe pokrycie ${pct(f.maxCover)})` : ''}` : '',
        f.planted ? `nasadzenia drzew na ${pct(f.planted)} transektu` : '',
      ]
        .filter(Boolean)
        .join('; ')
        .concat('.')
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.planted) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo nasadzenia nie są puste.')
      if (names.some(isMugo6170)) parts.push('Reintrodukowana kosodrzewina nie jest gatunkiem synantropijnym – formularz jej nie liczy.')
      const typical = names.filter((n) => isCalcicole6170(n) || isAcidophilous6170(n))
      if (typical.length) parts.push(`To gatunki rodzime muraw, nie synantropijne: ${typical.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      const p = num(i.planted)
      const planted = p ? `nasadzenia drzew na ${pct(p)} transektu` : ''
      if (list || planted) return [list, planted].filter(Boolean).join('; ')
      return i.none === 'yes' ? 'Brak' : ''
    },
  },
  {
    id: 'acidophilous',
    label: 'Gatunki typowe dla podłoża bezwapiennego',
    parameter: 'structure',
    description: 'Lista gatunków wyraźnie preferujących podłoże pozbawione węglanu wapnia – występujących wyłącznie lub wyraźnie częściej na glebach o odczynie kwaśnym (pH<5).',
    help: `Co wpisać: gatunki „kwasolubne” stwierdzone na transekcie, bez pokrycia. Najczęstsze (sprawozdania 2011 i 2021): mietlica skalna, sit skucina, podbiałek alpejski, kosmatki (gajowa, brunatna, olbrzymia), pięciornik złoty, kuklik górski, śmiałek pogięty, trzcinnik owłosiony, kostrzewa niska, jastrzębiec alpejski, borówka czarna i brusznica, bażyna, widłak wroniec, sasanka alpejska. Liczbę możesz wpisać wprost.

Progi (tab. 2): <5 (Babia Góra <10) – FV; 5–10 (Babia Góra 10–20) – U1; >10 (Babia Góra >20) – U2.

Praktyka: w Pieninach gatunków takich brak; w Tatrach rzadko (wychodnie skał krystalicznych, wypłaszczenia z kwaśną butwiną – Kominiarski Wierch 2); na Babiej Górze średnio 10–15 na transekcie. W 2021 r. na Upłaziańskiej Kopie 1 szósty gatunek (podbiałek) obniżył ocenę z FV na U1. Karta z przewodnika (Upłaziańska Kopa 2): 6 gat. → U1.`,
    thresholds: { FV: '<5 (dla Babiej Góry <10)', U1: '5–10 (dla Babiej Góry 10–20)', U2: '>10 (dla Babiej Góry >20)' },
    inputs: [
      speciesInput('Gatunki bezwapienne', 'Gatunki typowe dla podłoża bezwapiennego z transektu, np. Agrostis rupestris, Juncus trifidus, Homogyne alpina.'),
      countInput('Liczba gatunków (opcjonalnie)', 'Łączna liczba gatunków bezwapiennych na transekcie, wpisana wprost – ma pierwszeństwo przed liczeniem z listy.'),
      NONE_FIELD('Brak gatunków bezwapiennych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków typowych dla podłoża bezwapiennego – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. mietlica skalna Agrostis rupestris, podbiałek alpejski Homogyne alpina…', 'Wykaz gatunków, który trafi do „wartości” zamiast listy.'),
    ],
    suggest: (i, ctx) => {
      const n = countOf(i, (x) => !isCalcicole6170(x))
      return n === undefined ? null : gradeAcidophilous6170(n, rangeOf(ctx))
    },
    explain: (i, ctx) => {
      const n = countOf(i, (x) => !isCalcicole6170(x))
      return n === undefined ? null : `Gatunków bezwapiennych: ${plNum(n)} (progi: ${RANGE_LABELS_6170[rangeOf(ctx)]}).${RANGE_NOTE(ctx)}`
    },
    warn: (i) => {
      const calc = distinct(rowNames(i.species)).filter(isCalcicole6170)
      return calc.length ? `To gatunki nawapienne – nie liczą się tutaj: ${calc.join(', ')}.` : null
    },
    describe: (i) => listOrCount(i),
  },
  {
    id: 'shrubs',
    label: 'Pokrycie drzew i krzewów (w tym kosodrzewiny) w transekcie',
    parameter: 'structure',
    description:
      'Oszacowane (podobnie jak przy zdjęciu fitosocjologicznym) pokrycie drzew i krzewów w transekcie, w procentach (z dokładnością do ok. 5%). Zwarcie 0–5% to „znikome”. Za krzewy uznaje się rośliny zdrewniałe o wysokości powyżej 50 cm; wyjątek – zwarte osobniki kosodrzewiny, które rozrastają się wszerz.',
    help: `Co wpisać: łączne pokrycie drzew i krzewów na transekcie albo listę gatunków z pokryciem ${SURFACE}. Przy pokryciu do 5% możesz wybrać „Znikome”. Krzewinki (borówki, bażyna) i karłowe wierzby się tu nie liczą.

Progi (waloryzacja doprecyzowana w 2012 r., tab. 2): <10%, a jeśli obecna tylko kosodrzewina – <20% – FV; 10–50% – U1; >50% – U2. Granice 10 (20) i 50 formularz liczy do U1. Do 2011 r. FV było „<20” bez wyjątku dla kosodrzewiny. Sama kosodrzewina – formularz rozpoznaje z listy albo z pola „Tylko kosodrzewina”.

Praktyka: Tatry i Babia Góra zwykle od kilku do kilkunastu procent; U1 w 2021 r. – Biała Woda, Zawiesy (ok. 35%), Upłaziańska Kopa 3 (przyrost kosodrzewiny) i Kopieniec (ok. 45%; w 2016 r. dostał za to U2 – niezgodnie z tab. 2, w 2021 poprawione). Wskaźnik analizuje się razem ze „Strukturą przestrzenną płatów siedliska”. Karta z przewodnika: „Znikome” → FV.

Sprawozdanie 2015–2018 proponowało uznać go za kardynalny – nie weszło (2021: 3 kardynalne).`,
    thresholds: { FV: '<10%, jeśli obecna tylko kosodrzewina to <20%', U1: '10–50%', U2: '>50%' },
    inputs: [
      speciesInput('Drzewa i krzewy', `Drzewa i krzewy z pokryciem ${SURFACE}, np. Pinus mugo 15, Picea abies 5.`),
      { kind: 'number', name: 'total', label: 'Łączne pokrycie drzew i krzewów (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Łączne pokrycie drzew i krzewów w % transektu – ma pierwszeństwo przed sumą z listy.' },
      {
        kind: 'select',
        name: 'level',
        label: 'Stopień pokrycia (opcjonalnie)',
        options: [
          { value: '', label: '—' },
          { value: 'none', label: 'Brak' },
          { value: 'negligible', label: 'Znikome (0–5%)' },
        ],
        help: 'Gdy drzew i krzewów nie ma albo pokrywają 0–5% transektu („znikome”) – wtedy wskaźnik to FV bez wpisywania liczby. Liczba albo lista mają pierwszeństwo.',
      },
      {
        kind: 'select',
        name: 'mugoOnly',
        label: 'Tylko kosodrzewina (opcjonalnie)',
        options: [
          { value: '', label: '— (z listy)' },
          { value: 'yes', label: 'Tak – obecna tylko kosodrzewina' },
          { value: 'no', label: 'Nie – także inne drzewa i krzewy' },
        ],
        help: 'Czy jedynym krzewem na transekcie jest kosodrzewina (wtedy FV aż do 20%). Puste – formularz ustala to z listy.',
      },
      noteInput('Opis (opcjonalnie)', 'np. Znikome', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const f = shrubFacts(i)
      if (f.cover === undefined) return f.level ? 'FV' : null
      return f.cover === 'present' ? null : gradeShrubs6170(f.cover, f.onlyMugo)
    },
    explain: (i) => {
      const f = shrubFacts(i)
      if (f.cover === 'present') return 'Drzewa i krzewy bez pokrycia – wpisz pokrycie gatunków albo łączne, albo wybierz „Znikome”.'
      if (f.cover === undefined) return null
      return `Pokrycie drzew i krzewów: ${pct(f.cover)}${f.onlyMugo ? ' (tylko kosodrzewina – próg FV 20%)' : ''}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      const herbs = names.filter((n) => findSpecies6170(n) && !isWoody6170(n))
      if (herbs.length) parts.push(`To nie drzewa ani krzewy (krzewinki i karłowe wierzby się nie liczą): ${herbs.join(', ')}.`)
      const f = shrubFacts(i)
      if (f.level === 'negligible' && typeof f.cover === 'number' && f.cover > 5) parts.push(`Wybrano „Znikome”, a pokrycie to ${pct(f.cover)}.`)
      if (i.mugoOnly === 'yes' && names.some((n) => isWoody6170(n) && !isMugo6170(n))) parts.push('Zaznaczono „tylko kosodrzewina”, a na liście są inne drzewa lub krzewy.')
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      const t = num(i.total)
      if (list) return t !== undefined ? `${list} – łącznie ${pct(t)}` : list
      if (t !== undefined) return pct(t)
      return i.level === 'negligible' ? 'Znikome' : i.level === 'none' ? 'Brak' : ''
    },
  },
  {
    id: 'habitatShare',
    label: 'Procent powierzchni zajęty przez siedlisko na transekcie',
    parameter: 'structure',
    description:
      'Szacunkowa ocena powierzchni (w %), którą zajmują typowe płaty siedliska na transekcie, także płaty nawiązujące do innych typów zbiorowisk. Pojedyncze lub w niewielkich grupach osobniki kosodrzewiny (do 25 m²) to część siedliska. Miejsca zupełnie nieodpowiednie dla fitocenoz 6170 (np. lasy otaczające wychodnie) pomija się – podaje się, jaki procent potencjalnego siedliska zajmują murawy.',
    help: `Co wpisać: jaki procent potencjalnego siedliska na transekcie zajmują murawy 6170 (z płatami przejściowymi). Większe, zwarte płaty kosodrzewiny i płaty innych zbiorowisk (piargi, murawy naskalne, ziołorośla) to „nie-siedlisko”; miejsc całkowicie nieodpowiednich (las wokół wychodni) nie wliczaj do mianownika. W uwagach napisz, czy na transekcie są płaty pośrednie i jak częste.

Progi (tab. 2): >75% potencjalnego siedliska – FV; 50–75% – U1; <50% – U2. Granice 75 i 50 formularz liczy do U1.

Praktyka 2021: Tatry i Pieniny zwykle 80–100%; Kopieniec i Biała Woda ok. 55–60% (U1); Babia Góra – Akademicka Perć 60% (U1), Diablak ok. 20% (U2) przez mozaikę z murawami bezwapiennymi, borówczyskami i wyleżyskami. Karta z przewodnika: 100 → FV.`,
    thresholds: { FV: '>75 potencjalnego siedliska', U1: '50–75 potencjalnego siedliska', U2: '<50 potencjalnego siedliska' },
    inputs: [
      { kind: 'number', name: 'value', label: 'Siedlisko na transekcie', unit: '%', min: 0, max: 100, required: true, help: 'Procent potencjalnego siedliska na transekcie zajęty przez murawy 6170 (z płatami przejściowymi).' },
      noteInput('Opis (opcjonalnie)', 'np. 100', 'Krótki opis, który trafi do „wartości” w karcie zamiast samej liczby.'),
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v === undefined ? null : gradeHabitatShare6170(v)
    },
    describe: (i) => note(i) || (num(i.value) !== undefined ? plNum(num(i.value)!) : ''),
  },
  {
    id: 'calcicolePopulation',
    label: 'Stan populacji gatunków nawapiennych',
    parameter: 'structure',
    description:
      'Ogólne określenie liczebności i stanu populacji grupy gatunków nawapiennych – czy dominują na stanowisku, czy obficie kwitną i owocują, czy wykazują obniżoną żywotność (dominują osobniki płonne, nietypowo rozwinięte, masowo zaatakowane przez pasożyty).',
    help: `Co wybrać: jak wyglądają gatunki nawapienne jako grupa – dominacja w runi, kwitnienie i owocowanie, żywotność.

Progi (tab. 2): gatunki zdecydowanie dominujące, masowo kwitną (Babia Góra – występują dość licznie i są współdominujące) – FV; występują dość licznie i obficie kwitną, lecz nie są dominujące (Babia Góra – nielicznie, lecz bez obniżonej żywotności) – U1; występują nielicznie lub wykazują obniżoną żywotność (Babia Góra – sporadycznie lub z obniżoną żywotnością) – U2. Na Babiej Górze stosuj opis w nawiasie.

Praktyka: w Tatrach i Pieninach zawsze zdecydowanie dominowały (FV); w 2021 r. jedyne U1 – Diablak (mało gatunków, ale nieobniżona żywotność). Przewodnik: wskaźnik niemal zawsze skorelowany z „Gatunkami nawapiennymi” – w przyszłości można je połączyć (nie połączono). Karta z przewodnika: „Gatunki liczne o nieobniżonej żywotności, zdecydowanie dominujące w transekcie” → FV.`,
    thresholds: thresholdsOf(CALCICOLE_POP),
    inputs: [
      selectInput('Stan populacji', CALCICOLE_POP),
      noteInput('Opis (opcjonalnie)', 'np. Gatunki liczne o nieobniżonej żywotności, zdecydowanie dominujące w transekcie.', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(CALCICOLE_POP)),
    describe: (i) => note(i) || labelOf(CALCICOLE_POP, i.choice),
  },
  {
    id: 'acidophilousPopulation',
    label: 'Stan populacji gatunków typowych dla podłoża bezwapiennego',
    parameter: 'structure',
    description: 'Ogólne określenie liczebności i pokrycia na transekcie gatunków „kwasolubnych”.',
    help: `Co wpisać: łączne pokrycie gatunków bezwapiennych na transekcie (w %) albo wybór klasy – np. gdy rosną pojedynczo i nie da się podać liczby.

Progi (tab. 2): pokrywają poniżej 10% (Babia Góra 20%) transektu lub nieco więcej, lecz wykazują obniżoną żywotność – FV; pokrywają 10–20% (Babia Góra 20–40%) powierzchni – U1; pokrywają ponad 20% (Babia Góra 40%), obficie kwitną i owocują – U2. Granice 10–20 (20–40) formularz liczy do U1. Wybór ma pierwszeństwo przed liczbą – „nieco więcej, lecz obniżona żywotność” oceń wyborem.

Praktyka: w Tatrach i Pieninach pokrycie zwykle znikome (kilka procent); U1 w 2021 r. – Diablak, Akademicka Perć, Kominiarski Wierch 2. Karta z przewodnika: „Gatunki nieliczne, rosną w postaci pojedynczych, często płonych, osobników” → FV.`,
    thresholds: thresholdsOf(ACID_POP),
    inputs: [
      optionalSelect('Stan populacji', ACID_POP, 'Puste, gdy wpisujesz pokrycie liczbą. Wybór ma pierwszeństwo przed liczbą.'),
      { kind: 'number', name: 'cover', label: 'Pokrycie gatunków bezwapiennych (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Łączne pokrycie gatunków typowych dla podłoża bezwapiennego w % transektu.' },
      noteInput('Opis (opcjonalnie)', 'np. Gatunki nieliczne, rosną w postaci pojedynczych, często płonych, osobników.', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: (i, ctx) => {
      const chosen = gradeMap(ACID_POP)[String(i.choice)]
      if (chosen) return chosen
      const c = num(i.cover)
      return c === undefined ? null : gradeAcidCover6170(c, rangeOf(ctx))
    },
    explain: (i, ctx) => {
      const c = num(i.cover)
      return !i.choice && c !== undefined ? `Pokrycie gatunków bezwapiennych: ${pct(c)} (progi: ${RANGE_LABELS_6170[rangeOf(ctx)]}).${RANGE_NOTE(ctx)}` : null
    },
    warn: (i, ctx) => {
      const c = num(i.cover)
      const chosen = gradeMap(ACID_POP)[String(i.choice)]
      if (chosen && c !== undefined && chosen !== gradeAcidCover6170(c, rangeOf(ctx)) && !(chosen === 'FV' && gradeAcidCover6170(c, rangeOf(ctx)) === 'U1'))
        return `Wybrano ${chosen}, a pokrycie ${pct(c)} daje ${gradeAcidCover6170(c, rangeOf(ctx))} – sprawdź.`
      return null
    },
    describe: (i) => note(i) || (i.choice ? labelOf(ACID_POP, i.choice) : num(i.cover) !== undefined ? `Pokrycie ${pct(num(i.cover)!)}` : ''),
  },
  {
    id: 'spatialStructure',
    label: 'Struktura przestrzenna płatów siedliska',
    parameter: 'structure',
    description:
      'Określenie dominującego sposobu rozmieszczenia i struktury płatów zbiorowisk na transekcie i w jego bezpośrednim sąsiedztwie: wielkopowierzchniowe płaty muraw czy mozaika typowych muraw, płatów pośrednich i fitocenoz innych typów. Strukturę zaburzają drzewa i krzewy przy pokryciu >20%.',
    help: `Co wybrać: jak rozmieszczone są płaty murawy na transekcie i wokół niego – zwarte, wielkopowierzchniowe płaty, mozaika z płatami przejściowymi i innymi zbiorowiskami (piargi, murawy naskalne, ziołorośla, kosodrzewina), czy struktura rozbita przez drzewa i krzewy. Pojedyncze krzewy są integralną częścią murawy; zaburzają ją dopiero przy pokryciu >20%.

Progi (tab. 2): zdecydowanie dominują płaty typowego siedliska, zwarcie krzewów nie większe niż 20% – FV; obecne płaty innych typów zbiorowisk lub płaty przejściowe, przy czym płaty typowe dominują, zwarcie krzewów nie większe niż 50% – U1; dominują płaty przejściowe, często obecne fitocenozy innych typów lub struktura zaburzona silnym rozrastaniem się drzew lub krzewów o pokryciu >50% – U2.

Analizuj razem z „Pokryciem drzew i krzewów” – formularz ostrzeże, gdy wybór kłóci się z wpisanym tam pokryciem. Praktyka 2021: U1 na 8 stanowiskach (Babia Góra, Pieniny, Kominiarski Wierch 2, Giewont 2, Kopieniec); na Babiej Górze mozaika jest „typowa dla tego obszaru”, a mimo to dostaje U1. Karta z przewodnika: „Murawy zwarte i stosunkowo jednolite, o bardzo dużej powierzchni, zaburzone tylko w nielicznych miejscach w wyniku nasilonej erozji” → FV.`,
    thresholds: thresholdsOf(SPATIAL),
    inputs: [
      selectInput('Stopień fragmentacji płatów typowego siedliska', SPATIAL),
      noteInput('Opis (opcjonalnie)', 'np. Murawy zwarte i stosunkowo jednolite, o bardzo dużej powierzchni…', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(SPATIAL)),
    warn: (i, ctx) => {
      const shrubs = ctx?.indicators?.shrubs?.inputs
      if (!shrubs) return null
      const f = shrubFacts(shrubs)
      if (typeof f.cover !== 'number') return null
      if (i.choice === 'fv' && f.cover > 20) return `Wybrano FV (zwarcie krzewów ≤20%), a w „Pokryciu drzew i krzewów” jest ${pct(f.cover)} – sprawdź.`
      if (i.choice === 'u1' && f.cover > 50) return `Wybrano U1 (zwarcie krzewów ≤50%), a w „Pokryciu drzew i krzewów” jest ${pct(f.cover)} – sprawdź.`
      return null
    },
    describe: (i) => note(i) || labelOf(SPATIAL, i.choice),
  },
  {
    id: 'trampling',
    label: 'Ślady wspinaczki lub wydeptywania',
    parameter: 'structure',
    description:
      'Widoczne ślady działalności człowieka, najczęściej w postaci ścieżek, szlaków wspinaczkowych lub innych miejsc intensywnie wydeptywanych (lokalne grzbiety i szczyty przy szlakach). Liczy się liczba ścieżek przecinających transekt w poprzek, a ścieżki wzdłuż transektu – proporcjonalnie do długości. Natężenie ruchu ocenia się z szerokości ścieżek i zwarcia roślinności.',
    help: `Co wybrać: ile ścieżek przecina transekt, jak często są uczęszczane (szerokość, zwarcie roślinności na ścieżce) i czy wydeptywanie wychodzi poza ścieżki. Nie dotyczy muraw na stromych ścianach (np. Pieniny) – tam mogą być widoczne ślady wspinaczki skalnej.

Progi (tab. 2): brak lub nieznaczne w postaci 1 lub 2 mało uczęszczanych ścieżek – FV; widoczne w postaci 1 lub 2 średnio- lub kilku mało uczęszczanych ścieżek, brak lub niewielkie ślady wydeptywania poza ścieżkami – U1; widoczne w postaci kilku średnio lub często uczęszczanych lub licznych mało uczęszczanych ścieżek, lub wyraźne ślady wydeptywania na znacznej powierzchni poza ścieżkami – U2.

Praktyka 2021: U1 – Akademicka Perć (klamry), U2 – Kopieniec (ślady dawnego szlaku); Wąwóz Sobczański podniesiony do FV, bo ruch idzie dnem wąwozu, nie po skałach z murawą. Wskaźnik wpływa na erozję („erozja turystyczna”). Karta z przewodnika: „Brak” → FV.`,
    thresholds: thresholdsOf(TRAMPLING),
    inputs: [
      selectInput('Stopień natężenia zjawiska', TRAMPLING),
      noteInput('Opis (opcjonalnie)', 'np. Brak', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(TRAMPLING)),
    describe: (i) => note(i) || labelOf(TRAMPLING, i.choice),
  },
  {
    id: 'herbCover',
    label: 'Średnie pokrycie roślin zielnych w transekcie',
    parameter: 'structure',
    description:
      'Uśrednione (oszacowane jak przy zdjęciu fitosocjologicznym) pokrycie roślin zielnych na całym transekcie, z dokładnością do ok. 5–10%. Wprost określa zwarcie muraw, a przez to strukturę zbiorowiska. Murawy naskalne (np. w Pieninach) mają z natury znacznie mniejsze zwarcie – mają osobne progi.',
    help: `Co wpisać: średnie pokrycie roślin zielnych na transekcie w %. Typowe płaty są zwarte; płaty nawiązujące do piargów i muraw naskalnych mają mniejsze pokrycie, a mniejsze zwarcie to też sygnał silnego wydeptywania i erozji.

Progi (tab. 2): >75 (murawy naskalne >25) – FV; 50–75 (naskalne 10–25) – U1; <50 (naskalne <10) – U2. Granice formularz liczy do U1. Czy to murawa naskalna – decyduje pole „Typ płatów” w „Stanowisku” (bez wyboru: naskalna przy podtypie 6170-3).

Rozjazd z praktyką: w 2021 r. w Pieninach pokrycie „od kilku procent do około 40%” uznano za właściwe (FV) – tab. 2 dałaby przy kilku procentach U2. Jeśli oceniasz tak samo, zostaw swoją ocenę i uzasadnij – karta pokaże rozjazd z progiem. Tatry i Babia Góra zwykle 75–90%; Kopieniec ok. 60% → U1. Karta z przewodnika: „Ok. 80%” → FV.`,
    thresholds: { FV: '>75 (dla muraw naskalnych >25)', U1: '50–75 (dla muraw naskalnych 10–25)', U2: '<50 (dla muraw naskalnych <10)' },
    inputs: [
      { kind: 'number', name: 'value', label: 'Średnie pokrycie roślin zielnych', unit: '%', min: 0, max: 100, required: true, help: 'Średnie pokrycie roślin zielnych na transekcie w %, z dokładnością do ok. 5–10%.' },
      noteInput('Opis (opcjonalnie)', 'np. Ok. 80%', 'Krótki opis, który trafi do „wartości” w karcie zamiast samej liczby.'),
    ],
    suggest: (i, ctx) => {
      const v = num(i.value)
      return v === undefined ? null : gradeHerbCover6170(v, isRockFace6170(ctx?.site))
    },
    explain: (i, ctx) => {
      const v = num(i.value)
      return v === undefined ? null : `Pokrycie ${pct(v)} – progi dla ${isRockFace6170(ctx?.site) ? 'muraw naskalnych (>25 FV, 10–25 U1)' : 'muraw (>75 FV, 50–75 U1)'}.`
    },
    describe: (i) => note(i) || (num(i.value) !== undefined ? `Ok. ${pct(num(i.value)!)}` : ''),
  },
]

// ---------- fakty pomocnicze (liczone z list) ----------

/** Liczy się jako nawapienny: każdy gatunek spoza katalogu i każdy nawapienny z katalogu; nie – gatunki z innych grup katalogu. */
const countsAsCalcicole = (name: string) => {
  const s = findSpecies6170(name)
  return !s || s.group === 'calcicole'
}

function expansiveFacts(i: InputValues, ctx?: IndicatorContext) {
  const pieniny = rangeOf(ctx) === 'pieniny' && hasSubtype(ctx)
  const names = rowNames(i.species)
  const skipped = distinct(names.filter((n) => isCalcicole6170(n) || (pieniny && speciesKey6170(n) === speciesKey6170('Calamagrostis varia'))))
  const skip = (n: string) => skipped.some((s) => speciesKey6170(s) === speciesKey6170(n))
  const isShrub = (n: string) => isWoody6170(n) || isDwarfShrub6170(n)
  const herbT = num(i.herbTotal)
  const woodyT = num(i.woodyTotal)
  const herb = herbT ?? sumCover(i.species, (n) => !isShrub(n) && !skip(n))
  const woody = woodyT ?? sumCover(i.species, (n) => isShrub(n) && !skip(n))
  const shrubNames = names.filter((n) => isShrub(n) && !skip(n))
  const onlyMugo = shrubNames.length > 0 && shrubNames.every(isMugo6170)
  if (herb === undefined && woody === undefined && !names.length) return i.none === 'yes' ? { herb: undefined, woody: undefined, onlyMugo, skipped } : null
  return { herb, woody, onlyMugo, skipped }
}

function synanthropicFacts(i: InputValues) {
  const rows = speciesRows(i.species).filter((r) => r.name?.trim() && !isMugo6170(r.name.trim()))
  const planted = num(i.planted)
  if (!rows.length && planted === undefined) return i.none === 'yes' || rowNames(i.species).length ? { count: 0, maxCover: undefined, planted: undefined } : null
  const covers = rows.map((r) => num(r.cover)).filter((c): c is number => c !== undefined)
  const count = distinct(rows.map((r) => r.name.trim())).length
  return { count, maxCover: covers.length ? Math.max(...covers) : undefined, planted }
}

function shrubFacts(i: InputValues): { cover: number | 'present' | undefined; onlyMugo: boolean; level: string } {
  const names = rowNames(i.species)
  const woodyNames = names.filter((n) => !findSpecies6170(n) || isWoody6170(n))
  const onlyMugo = i.mugoOnly === 'yes' ? true : i.mugoOnly === 'no' ? false : woodyNames.length > 0 && woodyNames.every(isMugo6170)
  const t = num(i.total)
  const level = String(i.level ?? '')
  const cover = t ?? sumCover(i.species, (n) => !findSpecies6170(n) || isWoody6170(n))
  return { cover, onlyMugo, level }
}

// ---------- pola stanowiska ----------

const siteFields: FieldDef[] = [
  {
    kind: 'select',
    name: 'subtype',
    label: 'Podtyp siedliska',
    options: [{ value: '', label: '—' }, ...SUBTYPES_6170.map(({ value, label }) => ({ value, label }))],
    required: true,
    hint: 'Od podtypu (pasma) zależą progi „Cennych składników flory”, „Gatunków nawapiennych” i gatunków bezwapiennych.',
    help: `Cztery podtypy 6170 (Perzanowska, Mróz 2004):
• 6170-1 Tatrzańskie murawy wysokogórskie – zbiorowiska ze związku Seslerion tatrae (Festuco versicoloris-Seslerietum tatrae, Caricetum firmae, Carici sempervirentis-Festucetum tatrae, Festuco versicoloris-Agrostietum alpinae na mylonitach);
• 6170-2 Zbiorowiska wyleżyskowe na ustalonych piargach – Arabidion coeruleae, znane tylko z Tatr Zachodnich (kotły polodowcowe pod ścianami wapiennymi);
• 6170-3 Pienińskie górskie murawy naskalne – Dendranthemo-Seslerietum variae (Pieniny Właściwe i Małe Pieniny);
• 6170-4 Babiogórskie murawy wapniolubne – Saxifrago-Festucetum versicoloris na piaskowcach z węglanem wapnia.

Dlaczego: tab. 2 ma osobne progi dla Pienin i Babiej Góry (ubóższe pasma) – bez podtypu formularz liczy progi tatrzańskie. Uwaga: wyleżyska w dnach wklęsłych form terenu w Czerwonych Wierchach to często Salicetum herbaceae – siedlisko 6150, nie 6170.`,
  },
  {
    kind: 'select',
    name: 'rockFace',
    label: 'Typ płatów',
    options: [
      { value: '', label: '— (wg podtypu)' },
      { value: 'no', label: 'Murawa (płaty na stokach i grzbietach)' },
      { value: 'yes', label: 'Murawa naskalna (strome ściany, lita skała)' },
    ],
    hint: 'Murawy naskalne mają osobne progi „Średniego pokrycia roślin zielnych”.',
    help: `Czy badane płaty to murawy naskalne – na stromych, litych ścianach wapiennych, często bez pokrywy glebowej (głównie Pieniny, ale też wychodnie w reglach Tatr). Bez wyboru formularz przyjmuje murawę naskalną przy podtypie 6170-3, a zwykłą murawę przy pozostałych.

Dlaczego: tab. 2 daje murawom naskalnym inne progi pokrycia roślin zielnych (>25% FV zamiast >75%) – zwarcie roślinności jest tam z natury niskie i nie świadczy o złym stanie.`,
  },
  {
    kind: 'text',
    name: 'areaName',
    label: 'Nazwa obszaru',
    required: true,
    placeholder: 'np. Tatry',
    help: 'Nazwa obszaru (pasma), w którym leży stanowisko, jak w karcie: Tatry, Pieniny, Małe Pieniny, Babia Góra. Kod i nazwę obszaru Natura 2000 wpisz w osobnym polu.',
  },
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Upłaziańska Kopa 2',
    help: `Nazwa stanowiska w sieci monitoringu – zwykle od szczytu, żlebu albo skały (Upłaziańska Kopa 2, Żleb pod Czerwienicą, Okrąglica, Akademicka Perć). Przy kilku stanowiskach w jednym miejscu dopisz numer.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego stanowiska – w 6170 od 2010 r. bada się wciąż te same 20.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  pickField(methodology7120.siteFields, 'protectedAreas', {
    label: 'Obszary chronione (z pominięciem obszaru Natura 2000), na których znajduje się stanowisko',
    hint: 'Np. „Tatrzański Park Narodowy”, „Rezerwat Biała Woda”.',
    help: `Formy ochrony przyrody obejmujące stanowisko poza obszarem Natura 2000 (ten wpisz w osobnym polu): Tatrzański, Pieniński i Babiogórski Park Narodowy, rezerwat Biała Woda. Wszystkie stanowiska monitoringowe 6170 leżą na obszarach chronionych.

Dlaczego: poruszanie się poza szlakami i zbiór okazów wymaga zezwolenia zarządcy (park narodowy); forma ochrony decyduje też, czy możliwa jest ochrona czynna.`,
  }),
  {
    kind: 'text',
    name: 'natura2000',
    label: 'Nazwa obszaru Natura 2000',
    placeholder: 'np. PLC120001 Tatry',
    help: 'Kod i nazwa obszaru Natura 2000: PLC120001 Tatry, PLC120002 Pieniny, PLH120001 Ostoja Babiogórska, PLH120025 Małe Pieniny.',
  },
  {
    kind: 'text',
    name: 'coords',
    label: 'Współrzędne geograficzne',
    wide: true,
    required: true,
    placeholder: 'np. początek (zdj. 1): N 49°14′, E 19°53′; środek (zdj. 2): …; koniec (zdj. 3): …',
    help: `Współrzędne geograficzne (GPS, WGS84) początku, środka i końca transektu – w tych punktach wykonuje się trzy zdjęcia fitosocjologiczne (jak w karcie z przewodnika: „Początek (zdj. nr 1), Środek (zdj. nr 2), Koniec (zdj. nr 3)”). Przy stanowisku punktowym – środek stanowiska.

Dlaczego: przewodnik każe za każdym razem podawać dokładne współrzędne punktów zdjęć – bez nich nie da się powtórzyć zdjęć w tym samym miejscu.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 1760–1785',
    help: 'Wysokość nad poziomem morza transektu (zakres), z GPS albo mapy. Tatry – zwykle powyżej górnej granicy lasu (karta z przewodnika: 1760–1785 m); Pieniny od ok. 450 m (Zawiesy, Przełom Dunajca) do ok. 980 m (Okrąglica); Babia Góra – kopuła szczytowa.',
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 6,
    required: true,
    hint: 'Charakter płatów, powierzchnia, zbiorowiska sąsiednie, płaty przejściowe, zagrożenia.',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• charakter płatów: wielkopowierzchniowe murawy na stokach i grzbietach czy płaty na półkach i ścianach skalnych; zwarcie, bogactwo;
• płaty przejściowe i mozaika: piargi (8120), murawy naskalne (8210), murawy bezwapienne (6150), kosodrzewina (4070), ziołorośla;
• sukcesja, wydeptywanie, erozja.
Przy stanowisku punktowym (murawy na mylonitach, wyleżyska na piargach, płaty na wychodniach w lesie) opisz dokładnie stanowisko, potencjalną i faktyczną powierzchnię siedliska oraz otaczające zbiorowiska.`,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Zbiorowiska ze związku Seslerion tatrae',
    help: 'Zbiorowiska roślinne na stanowisku: zespoły ze związku Seslerion tatrae (Festuco versicoloris-Seslerietum tatrae, Caricetum firmae, Carici sempervirentis-Festucetum tatrae, Dendranthemo-Seslerietum variae, Saxifrago-Festucetum versicoloris) albo Arabidion coeruleae (Saxifragetum wahlenbergii, Salicetum retuso-reticulatae). Gdy zespołu nie da się ustalić – „zbiorowiska ze związku Seslerion tatrae”, jak w karcie z przewodnika.',
  },
  {
    kind: 'text',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    required: true,
    placeholder: 'np. 0,18 ha (100% transektu)',
    help: 'Powierzchnia płatów siedliska na stanowisku (w hektarach), najlepiej z odniesieniem do transektu i z informacją o płatach poza nim – jak w karcie z przewodnika: „0,18 ha (100% transektu). Poza transektem siedlisko zajmuje w tym rejonie przynajmniej kilkadziesiąt hektarów”.',
  },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    placeholder: 'np. 120 × 15 m',
    hint: 'Zwykle ok. 100–200 × 10–15 m; przy stanowisku punktowym – „stanowisko punktowe”.',
    help: `Wymiary transektu – zawsze trzeba je podać (dotychczas zwykle 1500–2000 m²). Transekt wyznacza się tak, by ujął maksymalne zróżnicowanie typów fitocenoz 6170 w danym miejscu, najczęściej prostopadle do poziomic. Przy małopowierzchniowych płatach (murawy na mylonitach, wyleżyska na piargach, płaty na wychodniach w lesie regli) zakłada się stanowisko punktowe – wpisz „stanowisko punktowe” i opisz je w „Opisie siedliska”.

Dlaczego: wszystkie dane liczbowe i florystyczne odnoszą się tylko do transektu (poza „Erozją” i „Strukturą przestrzenną”, gdzie liczy się też otoczenie).`,
  },
  pickField(methodology7120.siteFields, 'observer', {
    help: `Imię i nazwisko eksperta, który wykonał obserwację i odpowiada za dane. Przewodnik: monitoring powinny prowadzić osoby rozpoznające w terenie większość gatunków; w wysokich górach nie chodzi się w pojedynkę.

Dlaczego: ocena stanu ochrony zawiera elementy oceny eksperckiej – trzeba wiedzieć, kogo zapytać o uzasadnienie.`,
  }),
  {
    kind: 'text',
    name: 'additionalExperts',
    label: 'Dodatkowi obserwatorzy',
    placeholder: 'np. —',
    help: 'Pozostałe osoby z zespołu terenowego (karta z przewodnika podaje dwóch obserwatorów). Brak – zostaw puste albo wpisz „—”.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 03.08.2010',
    required: true,
    hint: 'Pieniny: czerwiec–lipiec; Tatry i Babia Góra: koniec czerwca – połowa sierpnia (optimum połowa lipca).',
    help: `Dzień badań terenowych. Termin jest krótki: w Pieninach od początku czerwca do końca lipca; w Tatrach i na Babiej Górze od końca czerwca (poniżej 1400 m n.p.m.) do około połowy sierpnia, z optimum zwykle w połowie lipca. W 2021 r. badania 17.06–13.08 (najpierw niższe położenia), w 2016 r. – 9–31.08.

Monitoring co 3–6 lat; dla stanowisk powyżej górnej granicy lasu bez presji człowieka dopuszcza się wydłużenie do ok. 7 lat.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const [, m, d] = v.split('-').map(Number)
      if (m < 6 || m > 8) return 'Termin poza sezonem badań (czerwiec – połowa sierpnia, w Pieninach do końca lipca). Opisz to w uwagach.'
      if (m === 8 && d > 20) return 'Po połowie sierpnia – przewodnik kończy okno badań około połowy sierpnia (w Pieninach z końcem lipca). Opisz to w uwagach.'
      return null
    },
  },
]

// ---------- zdjęcia fitosocjologiczne: 3 × 25 m² ----------

const r7120 = methodology7120.releves.fields
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia. Zdjęcia: na początku, w środku i na końcu transektu (jak współrzędne transektu).' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach.' }),
  pickField(r7120, 'area', {
    defaultValue: 25,
    help: 'Powierzchnia zdjęcia w m² – przewodnik: 5 × 5 m (25 m²). Na tej powierzchni liczy się „Bogactwo gatunkowe”.',
    warn: (v) => {
      const a = num(v)
      return a !== undefined && a !== 25 ? 'Przewodnik każe robić zdjęcia 5 × 5 m (25 m²) – inaczej bogactwo gatunkowe nie jest porównywalne. Opisz powód w uwagach.' : null
    },
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach (karta z przewodnika: 20–40°). Płasko – 0.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, SW).' }),
  layerField('coverA', 'Warstwa A – drzewa: procent powierzchni zdjęcia. W murawach wysokogórskich zwykle brak.'),
  layerField('coverB', 'Warstwa B – krzewy (kosodrzewina, jałowiec, wierzba śląska, podrost świerka): procent powierzchni zdjęcia (karta z przewodnika: 2%).\n\nDlaczego: zarastanie kosodrzewiną i drzewami to główne zagrożenie muraw w piętrze subalpejskim i reglach.'),
  layerField('coverC', 'Warstwa C – zielna (z krzewinkami i karłowymi wierzbami): procent powierzchni zdjęcia (karta z przewodnika: 75–90%).'),
  layerField('coverD', 'Warstwa D – mchy i porosty: procent powierzchni zdjęcia (karta z przewodnika: 30–40%, głównie płucnica islandzka).'),
  layerField('heightA', 'Warstwa A – typowa wysokość drzew, w metrach.'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów, w metrach (karta z przewodnika: 0,5 m).'),
  layerField('heightC', 'Warstwa C – typowa wysokość runi, w centymetrach (karta z przewodnika: 10 cm).'),
  layerField('heightD', 'Warstwa D – wysokość mchów i porostów, w centymetrach.'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Zbiorowisko ze związku Seslerion tatrae',
    help: 'Jednostka fitosocjologiczna zdjęcia, np. Festuco versicoloris-Seslerietum tatrae albo „Zbiorowisko ze związku Seslerion tatrae” (jak w karcie z przewodnika).',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Kompletna lista florystyczna zdjęcia z ilościowością w skali Braun-Blanqueta (r, +, 1–5), z porostami i mchami (warstwa D). To najważniejsza część monitoringu 6170 – na zdjęciach opiera się bogactwo gatunkowe, cenne gatunki i gatunki nawapienne. Warstwa podpowiada się sama po wyborze gatunku; siewki drzew w runi przestaw na C (jak w karcie: Picea abies (C)).',
  }),
]

export const methodology6170: Methodology = {
  code: '6170',
  name: 'Nawapienne murawy wysokogórskie (Seslerion tatrae) i wyleżyska śnieżne (Arabidion coeruleae)',
  source:
    'Kozak M., Kozłowska K. 2012, 6170 Nawapienne murawy wysokogórskie (Seslerion tatrae) i wyleżyska śnieżne (Arabidion coeruleae), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 299–320 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2009–2011, 2015–2018 i 2020–2021.',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj 3 zdjęcia fitosocjologiczne 5 × 5 m – na początku, w środku i na końcu transektu – w optimum fenologicznym, z kompletną listą florystyczną (z mchami i porostami). Ilościowość w skali Braun-Blanqueta. To z nich liczy się bogactwo gatunkowe.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Ocena realnych możliwości utrzymania siedliska we właściwej kondycji, uwzględniająca jego obecny stan zachowania oraz czynniki mogące na nie oddziaływać w najbliższej przyszłości. Dla płatów powyżej górnej granicy lasu i na niedostępnych półkach skalnych najlepszą formą ochrony jest ochrona bierna.',
    help: `Weź pod uwagę: sukcesję kosodrzewiny (Tatry, piętro subalpejskie – dawne hale) i drzew w niższych położeniach (świerk, jałowiec, klon, leszczyna – Pieniny), ruch turystyczny i wspinaczkowy (wydeptywanie, erozja turystyczna), lawiny i obrywy, a po stronie plusów – położenie w parku narodowym, w strefie ochrony ścisłej, z dala od szlaków, i ochronę czynną tam, gdzie jest potrzebna (odkrzaczanie i koszenie w PPN: Okrąglica, Wąwóz Sobczański, Zawiesy).

Praktyka 2021: FV na 18 z 20 stanowisk; U1 – Kopieniec (sukcesja, schodzenie ze szlaku) i Akademicka Perć (szlak przez środek płatu, sukcesja kosodrzewiny i wierzby śląskiej). Karta z przewodnika: „Właściwe ze względu na położenie z dala od szlaków, na terenie Tatrzańskiego Parku Narodowego” → FV.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A03', name: 'Koszenie / ścinanie trawy' },
    { code: 'A04', name: 'Wypas' },
    { code: 'A04.03', name: 'Zarzucenie pasterstwa, brak wypasu' },
    { code: 'B01', name: 'Zalesianie terenów otwartych' },
    { code: 'B01.02', name: 'Sztuczne nasadzenia na terenach otwartych (drzewa nierodzime)' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'F04', name: 'Pozyskiwanie / usuwanie roślin lądowych, ogólnie' },
    { code: 'G01.04', name: 'Wspinaczka górska, skałkowa i speleologia' },
    { code: 'G01.04.01', name: 'Wspinaczka górska i skałkowa' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'G05.07', name: 'Niewłaściwie realizowane działania ochronne lub ich brak' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód – ogólnie' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K04.01', name: 'Konkurencja' },
    { code: 'L04', name: 'Lawiny' },
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
            hint: 'Np. sąsiedztwo 8120, 8210, 4070, 6150; gatunki chronione i endemiczne.',
            help: 'Wartości przyrodnicze stanowiska poza samą murawą: sąsiednie siedliska (8120 piargi wapienne, 8210 naskalne zbiorowiska wapienne, 4070 kosodrzewina, 6150 murawy bezwapienne), gatunki chronione, endemiczne i z czerwonych ksiąg (szarotka, potrostek, chryzantema Zawadzkiego), zwierzęta (niepylak apollo w Pieninach). Brak informacji – „Nie stwierdzono”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            label: 'Wykonywane działania ochronne',
            help: 'Jakie działania ochronne wykonano i z jakim skutkiem: usuwanie drzew i krzewów, koszenie u podnóża skał (Pieniny), kierowanie ruchu turystycznego. Większość stanowisk leży w strefie ochrony ścisłej – wtedy „Ochrona bierna”.',
          },
          {
            kind: 'textarea',
            name: 'proposals',
            label: 'Propozycje wprowadzenia działań ochronnych',
            rows: 3,
            hint: 'Np. odkrzaczanie, koszenie, ekstensywny wypas – tylko dla płatów półnaturalnych.',
            help: 'Jakie działania proponujesz. Przewodnik: dla płatów naturalnych najwłaściwsza jest ochrona bierna; ochrona czynna (sporadyczne koszenie, okresowe usuwanie krzewów, ekstensywny wypas – ostrożnie na stromych stokach) tylko dla najcenniejszych płatów półnaturalnych zagrożonych ocienieniem. Brak – „Brak”.',
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
            help: 'Karta z przewodnika podaje przy ocenie ogólnej powierzchnię siedliska o różnym stanie zachowania na stanowisku (Upłaziańska Kopa 2: FV 95%, U1 5%, U2 0%). Trzy liczby powinny dać razem 100%.',
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
            help: `${f.help ?? ''}\n\nDla 6170 zapisz tu także: datę wypełnienia karty, płaty przejściowe na transekcie (do jakich zbiorowisk nawiązują i jak często), wątpliwości co do zaliczenia płatów do 6170 (piargi 8120, murawy naskalne 8210-1, kserotermiczne 6210 w Pieninach, wyleżyska 6150) oraz zezwolenia na poruszanie się poza szlakami i zbiór okazów.`.trim(),
          },
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_6170.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer6170(s) })),
  speciesInfo: (name) => {
    const e = findSpecies6170(name)
    if (!e) return undefined
    if (e.group === 'calcicole')
      return `${GROUP_LABELS_6170.calcicole}${e.star ? '*' : ''} – ${(e.ranges ?? []).map((r) => RANGE_LABELS_6170[r]).join(', ')}`
    if (e.group === 'synanthropic' && e.alien) return `${GROUP_LABELS_6170.synanthropic} (obcy)`
    if (e.mugo) return 'kosodrzewina (osobne progi)'
    if (e.dwarfShrub) return `${GROUP_LABELS_6170[e.group]} (krzewinka)`
    return GROUP_LABELS_6170[e.group]
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator6170 = (id: string): IndicatorDef => {
  const i = methodology6170.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 6170`)
  return i
}

