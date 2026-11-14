// Metodyka 3260 (nizinne i podgórskie rzeki ze zbiorowiskami włosieniczników Ranunculion fluitantis) jako dane.
// Źródło: Szoszkiewicz K., Gebler D. 2012, „3260 Nizinne i podgórskie rzeki ze zbiorowiskami włosieniczników
// (Ranunculion fluitantis)” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II,
// GIOŚ, s. 204–217 (tab. 1–3, przykładowa karta Kanał Miejski – Sławno), z praktyką oceny ze sprawozdań z monitoringu
// 2009–2011, 2016–2018 i 2024. Siedlisko wodne: odcinek makrofitowy MMOR 100 m (pokrycie w 9-stopniowej skali)
// w obrębie 500-metrowego odcinka hydromorfologicznego RHS (10 profili kontrolnych co 50 m) – z RHS biorą się
// substrat, przepływy, spiętrzenie, HQA, HMS, formy morfologiczne, gatunki inwazyjne i zacienienie.
// Ocena struktury ma własną regułę z tab. 3 (`structureRule3260`), ocena ogólna – „najgorszy decyduje” jak w silniku.
import type { FieldDef, Grade, GradeOrEmpty, IndicatorContext, IndicatorDef, InputValues, Methodology, SelectOption, StructureItem } from '../../7120/habitats/types'
import { num } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { IMPACT_DICT } from '../../rdos/dictionaries'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, thresholdsFromOptions, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_3260,
  SPECIES_3260,
  defaultLayer3260,
  findSpecies3260,
  isBatrachium3260,
  isCharacteristic3260,
  isCircinatum3260,
  isElodea3260,
  optionsOf,
  speciesKey3260,
} from './species'

// ---------- skala MMOR (tab. 1) ----------

export const MMOR: SelectOption[] = [
  { value: '1', label: '1 – <0,1%' },
  { value: '2', label: '2 – 0,1–1,0%' },
  { value: '3', label: '3 – 1,0–2,5%' },
  { value: '4', label: '4 – 2,5–5,0%' },
  { value: '5', label: '5 – 5,0–10%' },
  { value: '6', label: '6 – 10–25%' },
  { value: '7', label: '7 – 25–50%' },
  { value: '8', label: '8 – 50–75%' },
  { value: '9', label: '9 – >75%' },
]
const MMOR_WITH_ZERO: SelectOption[] = [{ value: '0', label: '0 – brak' }, ...MMOR]

/** Współczynnik MMOR z pola: 0–9 albo undefined. */
export const mmorOf = (v: unknown): number | undefined => {
  const n = num(v)
  return n !== undefined && Number.isInteger(n) && n >= 0 && n <= 9 ? n : undefined
}

// ---------- progi (tab. 3) ----------

/** Gatunki charakterystyczne – włosieniczniki: pokrycie (bez krążkolistnego) co najmniej 2 FV, 1 U1, brak U2. */
export const gradeBatrachium3260 = (cls: number): Grade => (cls >= 2 ? 'FV' : cls >= 1 ? 'U1' : 'U2')
/** Powierzchnia siedliska: pokrycie chronionymi włosienicznikami co najmniej 3 FV, 1–2 U1, brak U2. */
export const gradeArea3260 = (cls: number): Grade => (cls >= 3 ? 'FV' : cls >= 1 ? 'U1' : 'U2')
/** Gatunki charakterystyczne – inne: co najmniej 2 FV, 1 U1, brak U2. */
export const gradeCharacteristic3260 = (n: number): Grade => (n >= 2 ? 'FV' : n === 1 ? 'U1' : 'U2')
/**
 * Materiał dna koryta: FV – co najmniej 20% gruboziarnistego (kamienie, kamyki/żwir, narzut) i maks. 20% mułu;
 * U1 – mułu maks. 20% (ale gruboziarnistego mniej niż 20%); U2 – mułu powyżej 20%.
 */
export const gradeSubstrate3260 = (coarse: number, mud: number): Grade => (mud > 20 ? 'U2' : coarse >= 20 ? 'FV' : 'U1')
/** Stan ekologiczny (klasa MIR): I–II FV, III U1, IV–V U2. */
export const gradeEcoClass3260 = (cls: number): Grade => (cls <= 2 ? 'FV' : cls === 3 ? 'U1' : 'U2')
/** Moczarka kanadyjska (MMOR): 0–2 FV, 3–5 U1, powyżej 5 U2. */
export const gradeElodea3260 = (cls: number): Grade => (cls <= 2 ? 'FV' : cls <= 5 ? 'U1' : 'U2')
/** Przepływy szybkie (kipiel + rwący + wartki): powyżej 40% FV, 10–40% U1, poniżej 10% U2. */
export const gradeFlow3260 = (fast: number): Grade => (fast > 40 ? 'FV' : fast >= 10 ? 'U1' : 'U2')
/** HQA: ≥50 FV, między 30 a 50 U1, ≤30 U2. */
export const gradeHQA3260 = (v: number): Grade => (v >= 50 ? 'FV' : v > 30 ? 'U1' : 'U2')
/** HMS: ≤20 FV, między 20 a 40 U1, ≥40 U2. */
export const gradeHMS3260 = (v: number): Grade => (v <= 20 ? 'FV' : v < 40 ? 'U1' : 'U2')
/** Naturalne elementy morfologiczne: co najmniej 3 FV, 1–2 U1, brak U2. */
export const gradeMorph3260 = (n: number): Grade => (n >= 3 ? 'FV' : n >= 1 ? 'U1' : 'U2')
/** Zacienienie koryta: maks. 50% FV, 50–80% U1, ponad 80% U2. */
export const gradeShade3260 = (p: number): Grade => (p <= 50 ? 'FV' : p <= 80 ? 'U1' : 'U2')
/**
 * Obce gatunki inwazyjne: 1–2 (i brak) FV, 3–4 U1, 5 i więcej albo choć jeden liczny (>33% odcinka) U2.
 * Tab. 3 ma „pow. 5” dla U2 i „3–4” dla U1 – pięć gatunków liczymy do U2 (inaczej nie miałyby oceny).
 */
export const gradeAliens3260 = (n: number, anyAbundant: boolean): Grade => (anyAbundant || n >= 5 ? 'U2' : n >= 3 ? 'U1' : 'FV')

/** % zacienienia z RHS: (zadrzewienie lewego + prawego brzegu, 0–10) × zacienienie koryta (0, 1 albo 3) / 30. */
export const shadePercent3260 = (left: number, right: number, shading: number): number => Math.round((((left + right) * shading) / 30) * 100)

/**
 * Ocena „specyficznej struktury i funkcji” wg tab. 3:
 * - U2 – więcej niż 2 wskaźniki kardynalne na U2;
 * - FV – maksymalnie 2 wskaźniki na U2 (reszta FV) albo maksymalnie 3 na U1 (reszta FV), liczone ze WSZYSTKICH
 *   wskaźników (kolumna FV nie mówi „kardynalne”, w przeciwieństwie do U1 i U2); U1 i U2 naraz – już nie FV;
 * - U1 – pozostałe (maks. 2 kardynalne U2, U1 bez ograniczeń).
 * XX we wskaźniku kardynalnym (bez rozstrzygającego U2) daje XX, XX w pomocniczym nie liczy się. Brak oceny -> ''.
 * Karta Sławno: kardynalne 1×U2 (HMS) i 2×U1, pomocnicze 1×U2 i 1×U1 → U1, jak w przewodniku.
 */
export function structureRule3260(items: StructureItem[]): GradeOrEmpty {
  if (items.length === 0 || items.some((i) => i.grade === '')) return ''
  const cardinal = items.filter((i) => i.cardinal).map((i) => i.grade)
  if (cardinal.filter((g) => g === 'U2').length > 2) return 'U2'
  if (cardinal.includes('XX')) return 'XX'
  const known = items.map((i) => i.grade).filter((g) => g !== 'XX')
  const u1 = known.filter((g) => g === 'U1').length
  const u2 = known.filter((g) => g === 'U2').length
  if ((u2 <= 2 && u1 === 0) || (u2 === 0 && u1 <= 3)) return 'FV'
  return 'U1'
}

// ---------- tabele gatunków ----------

const OTHER = 'other'

interface Row {
  name: string
  mmor?: number
  abundant?: boolean
}

/** Wiersze tabeli gatunków: select gatunku (albo „inny” + nazwa), współczynnik MMOR, liczność. */
export function rowsOf(value: unknown): Row[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((r: Record<string, unknown>) => {
    const pick = String(r?.species ?? '').trim()
    const name = (pick === OTHER || pick === '' ? String(r?.name ?? '') : pick).trim()
    if (!name) return []
    return [{ name, mmor: mmorOf(r?.mmor), abundant: r?.abundance === 'abundant' }]
  })
}

const distinctBy = (rows: Row[]) => [...new Map(rows.map((r) => [speciesKey3260(r.name), r])).values()]
const maxClass = (rows: Row[]) => rows.reduce((m, r) => Math.max(m, r.mmor ?? 0), 0)
const listText = (rows: Row[]) => rows.map((r) => (r.mmor !== undefined ? `${r.name} – ${r.mmor}` : r.name)).join(', ')

const speciesColumn = (options: SelectOption[], label: string, help: string): FieldDef => ({
  kind: 'select',
  name: 'species',
  label,
  options: [{ value: '', label: '—' }, ...options, { value: OTHER, label: 'Inny gatunek – wpisz nazwę obok' }],
  required: true,
  help,
})
const nameColumn: FieldDef = {
  kind: 'text',
  name: 'name',
  label: 'Nazwa (gdy „inny gatunek”)',
  placeholder: 'np. Berula erecta',
  help: 'Nazwa naukowa – tylko gdy w poprzedniej kolumnie wybrano „Inny gatunek”.',
}
const mmorColumn = (required = true): FieldDef => ({
  kind: 'select',
  name: 'mmor',
  label: 'Pokrycie (skala MMOR)',
  options: [{ value: '', label: '—' }, ...MMOR],
  required,
  help: 'Pokrycie gatunku na 100-metrowym odcinku makrofitowym w 9-stopniowej skali MMOR (tab. 1): 1 <0,1%, 2 0,1–1%, 3 1–2,5%, 4 2,5–5%, 5 5–10%, 6 10–25%, 7 25–50%, 8 50–75%, 9 >75%.',
})

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

const noteInput = (label: string, placeholder: string, help: string): FieldDef => ({ kind: 'textarea', name: 'note', label, rows: 2, placeholder, help })
const note = (i: InputValues) => String(i.note ?? '').trim()

// ---------- włosieniczniki (wspólne dla dwóch wskaźników) ----------

/** Włosieniczniki liczone we wskaźniku (bez krążkolistnego) i ich najwyższy współczynnik MMOR; null = nic nie wpisano. */
export function batrachiumOf(i: InputValues | undefined): { rows: Row[]; cls: number; circinatum: boolean } | null {
  const all = rowsOf(i?.rows)
  if (!all.length && i?.none !== 'yes') return null
  const rows = distinctBy(all.filter((r) => isBatrachium3260(r.name)))
  return { rows, cls: maxClass(rows), circinatum: all.some((r) => isCircinatum3260(r.name)) }
}

const batrachiumFromCtx = (ctx?: IndicatorContext) => batrachiumOf(ctx?.indicators?.batrachium?.inputs)

function areaClass(i: InputValues, ctx?: IndicatorContext): { cls: number; from: 'direct' | 'list' } | null {
  const direct = mmorOf(i.cover)
  if (direct !== undefined) return { cls: direct, from: 'direct' }
  const b = batrachiumFromCtx(ctx)
  return b ? { cls: b.cls, from: 'list' } : null
}

// ---------- opcje selektów ----------

const ECO_CLASS: GradedOption[] = [
  { value: '1', label: 'I klasa – stan bardzo dobry', grade: 'FV' },
  { value: '2', label: 'II klasa – stan dobry', grade: 'FV' },
  { value: '3', label: 'III klasa – stan umiarkowany', grade: 'U1' },
  { value: '4', label: 'IV klasa – stan słaby', grade: 'U2' },
  { value: '5', label: 'V klasa – stan zły', grade: 'U2' },
]
const ECO_WORD: Record<string, string> = { '1': 'bardzo dobry', '2': 'dobry', '3': 'umiarkowany', '4': 'słaby', '5': 'zły' }

const IMPOUND: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'short', label: 'Tak – poniżej 33% długości odcinka rzeki', grade: 'U1' },
  { value: 'long', label: 'Tak – powyżej 33% długości odcinka rzeki', grade: 'U2' },
]
const SEWAGE: GradedOption[] = [
  { value: 'no', label: 'Nie', grade: 'FV' },
  { value: 'yes', label: 'Tak', grade: 'U1' },
  { value: 'severe', label: 'Tak + występują zastoiska ścieków w rzece lub grunt przy rzece nasiąknięty ściekami', grade: 'U2' },
]
const SHADING: SelectOption[] = [
  { value: '0', label: '0 – brak zacienienia koryta' },
  { value: '1', label: '1 – zacienienie na mniej niż 33% długości odcinka' },
  { value: '3', label: '3 – zacienienie na ponad 33% długości odcinka' },
]
const TREES: SelectOption[] = ['0', '1', '2', '3', '4', '5'].map((v) => ({ value: v, label: v }))

export const MORPH_ELEMENTS: SelectOption[] = [
  { value: 'sideBar', label: 'Odsyp boczny (brzegowy)' },
  { value: 'pointBar', label: 'Odsyp meandrowy (punktowy)' },
  { value: 'midBar', label: 'Odsyp śródkorytowy' },
  { value: 'erodingCliff', label: 'Podcięcie brzegu erodujące' },
  { value: 'stableCliff', label: 'Podcięcie brzegu stabilne' },
  { value: 'island', label: 'Wyspa' },
  { value: 'boulders', label: 'Odsłonięte duże głazy w korycie' },
]

/** Udziały substratu dna (RHS): pola % z grupą „gruboziarnisty” (kamienie, kamyki/żwir, narzut kamienny). */
export const SUBSTRATE: { name: string; label: string; coarse?: boolean; mud?: boolean }[] = [
  { name: 'stones', label: 'kamienie', coarse: true },
  { name: 'gravel', label: 'kamyki/żwir', coarse: true },
  { name: 'riprap', label: 'narzut kamienny', coarse: true },
  { name: 'sand', label: 'piasek' },
  { name: 'mud', label: 'muł', mud: true },
  { name: 'otherBed', label: 'inne (skała, ił, torf, sztuczne)' },
]

/** Typy przepływu RHS: szybkie (kipiel, rwący, wartki) premiowane. */
export const FLOWS: { name: string; label: string; fast?: boolean }[] = [
  { name: 'broken', label: 'kipiel', fast: true },
  { name: 'unbroken', label: 'rwący', fast: true },
  { name: 'rippled', label: 'wartki', fast: true },
  { name: 'smooth', label: 'gładki' },
  { name: 'none', label: 'niewyczuwalny' },
  { name: 'otherFlow', label: 'inne (spadek swobodny, kaskadowy, wznoszący, suche koryto)' },
]

const sumOf = (i: InputValues, names: string[]): number | undefined => {
  const vals = names.map((n) => num(i[n])).filter((v): v is number => v !== undefined)
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) * 10) / 10 : undefined
}
const filled = (i: InputValues, names: string[]) => names.some((n) => num(i[n]) !== undefined)

function substrateOf(i: InputValues): { coarse: number; mud: number; total: number } | null {
  const names = SUBSTRATE.map((s) => s.name)
  if (!filled(i, names)) return null
  return {
    coarse: sumOf(i, SUBSTRATE.filter((s) => s.coarse).map((s) => s.name)) ?? 0,
    mud: num(i.mud) ?? 0,
    total: sumOf(i, names) ?? 0,
  }
}

function flowOf(i: InputValues): { fast: number; total: number } | null {
  const names = FLOWS.map((f) => f.name)
  if (!filled(i, names)) return null
  return { fast: sumOf(i, FLOWS.filter((f) => f.fast).map((f) => f.name)) ?? 0, total: sumOf(i, names) ?? 0 }
}

const percentFields = (defs: { name: string; label: string }[], group: string, help: (label: string) => string): FieldDef[] =>
  defs.map((d) => ({ kind: 'number', name: d.name, label: d.label[0].toUpperCase() + d.label.slice(1), unit: '%', min: 0, max: 100, group, groupCols: 3, help: help(d.label) }) as FieldDef)

const sharesText = (i: InputValues, defs: { name: string; label: string }[]) =>
  defs
    .map((d) => ({ label: d.label, v: num(i[d.name]) }))
    .filter((x): x is { label: string; v: number } => x.v !== undefined && x.v > 0)
    .map((x, idx) => `${idx === 0 ? x.label[0].toUpperCase() + x.label.slice(1) : x.label} – ${plNum(x.v)}%`)
    .join(', ')

const sumWarn = (total: number | undefined, what: string) =>
  total !== undefined && Math.abs(total - 100) > 1 ? `Udziały ${what} sumują się do ${plNum(total)}%, a powinny do 100%.` : null

function shadeOf(i: InputValues): { p: number; from: 'direct' | 'rhs' } | null {
  const direct = num(i.percent)
  if (direct !== undefined) return { p: direct, from: 'direct' }
  const l = num(i.treesLeft)
  const r = num(i.treesRight)
  const s = num(i.shading)
  if (l === undefined || r === undefined || s === undefined) return null
  return { p: shadePercent3260(l, r, s), from: 'rhs' }
}

function aliensOf(i: InputValues): { rows: Row[]; abundant: Row[] } | null {
  const all = rowsOf(i.rows)
  if (!all.length && i.none !== 'yes') return null
  const rows = distinctBy(all.filter((r) => !isElodea3260(r.name)))
  return { rows, abundant: rows.filter((r) => r.abundant) }
}

const STRUCTURE_RULE_NOTE =
  'Wskaźnik kardynalny. Struktura i funkcje (tab. 3): U2 dopiero, gdy więcej niż dwa wskaźniki kardynalne mają U2; FV – najwyżej 2 wskaźniki na U2 albo najwyżej 3 na U1, reszta FV; pozostałe – U1.'

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description:
      'Pokrycie odcinka makrofitowego przez chronione gatunki włosieniczników (wszystkie rodzime poza włosienicznikiem krążkolistnym Batrachium circinatum), w skali MMOR.',
    help: `Co wpisać: nic, jeśli wypełniłeś wskaźnik „Gatunki charakterystyczne – włosieniczniki” – formularz weźmie stamtąd najwyższe pokrycie włosienicznika (bez krążkolistnego). Pokrycie łączne wszystkich włosieniczników możesz wpisać wprost – ma pierwszeństwo przed listą. W opisie – jak w karcie z przewodnika – krótko, jak wygląda zbiorowisko (np. „Dobrze wykształcone zbiorowisko włosienicznika rzecznego”).

Progi (tab. 3): pokrycie chronionymi włosienicznikami co najmniej 3 w skali MMOR – FV; 1 lub 2 – U1; brak włosieniczników albo tylko krążkolistny – U2.

Dlaczego: siedlisko 3260 w ujęciu przewodnika wymaga włosieniczników – bez nich odcinek rzeki nie jest tym siedliskiem. Sprawozdanie 2024: powierzchnia to parametr w najgorszym stanie (30% stanowisk U2), bo włosieniczniki wycofują się z rzek.`,
    thresholds: {
      FV: 'Pokrycie chronionymi gatunkami włosieniczników co najmniej na 3 w skali MMOR',
      U1: 'Pokrycie chronionymi gatunkami włosieniczników na 1 lub 2 w skali MMOR',
      U2: 'Brak chronionych gatunków włosieniczników lub tylko włosienicznik krążkolistny R. circinatum',
    },
    inputs: [
      {
        kind: 'select',
        name: 'cover',
        label: 'Pokrycie włosienicznikami wprost (MMOR, opcjonalnie)',
        options: [{ value: '', label: '— weź z listy włosieniczników' }, ...MMOR_WITH_ZERO],
        help: 'Łączne pokrycie odcinka przez włosieniczniki (bez krążkolistnego) w skali MMOR. Puste = formularz bierze najwyższy współczynnik z listy we wskaźniku „Gatunki charakterystyczne – włosieniczniki”.',
      },
      noteInput('Opis (opcjonalnie)', 'np. dobrze wykształcone zbiorowisko włosienicznika rzecznego', 'Krótki opis płatów – trafi do „wartości” zamiast samej liczby.'),
    ],
    suggest: (i, ctx) => {
      const a = areaClass(i, ctx)
      return a ? gradeArea3260(a.cls) : null
    },
    explain: (i, ctx) => {
      const a = areaClass(i, ctx)
      if (!a) return null
      if (a.from === 'direct') return `Pokrycie wpisane wprost: ${a.cls} (MMOR).`
      return a.cls ? `Najwyższe pokrycie włosienicznika z listy: ${a.cls} (MMOR).` : 'Na liście włosieniczników nie ma gatunku liczonego w ocenie (krążkolistny się nie liczy).'
    },
    describe: (i, ctx) => {
      const a = areaClass(i, ctx)
      return note(i) || (a ? (a.cls ? `Pokrycie włosienicznikami – ${a.cls} (MMOR)` : 'Brak chronionych gatunków włosieniczników') : '')
    },
  },
  {
    id: 'batrachium',
    label: 'Gatunki charakterystyczne – włosieniczniki',
    parameter: 'structure',
    cardinal: true,
    description:
      'Pokrycie odcinka makrofitowego przez włosieniczniki: wodny B. aquatile, Baudota B. baudotii, rzeczny B. fluitans, tarczowaty B. peltatum, pędzelkowaty B. penicillatum, skąpopręcikowy B. trichophyllum – bez krążkolistnego B. circinatum. Skala MMOR.',
    help: `Co wpisać: każdy włosienicznik stwierdzony na 100-metrowym odcinku makrofitowym z pokryciem w 9-stopniowej skali MMOR. Włosienicznik krążkolistny Batrachium circinatum też możesz wpisać – formularz go pokaże, ale nie policzy. Brak włosieniczników – „Nie stwierdzono”.

Progi (tab. 3): pokrycie transektu włosienicznikami (bez krążkolistnego) co najmniej 2 – FV; 1 – U1; brak gatunków albo tylko krążkolistny – U2. Liczy się najwyższy współczynnik spośród gatunków.

${STRUCTURE_RULE_NOTE}

Dlaczego: włosieniczniki to wyróżnik siedliska. Sprawozdanie 2024: wskaźnik z największą degradacją – stanowisk bez włosieniczników przybyło od 2011 r. dziesięciokrotnie (z 3 do 30%), zwłaszcza na Śląsku i w Dolinie Odry.`,
    thresholds: {
      FV: 'Pokrycie transektu włosienicznikami (z wyjątkiem krążkolistnego) co najmniej na 2',
      U1: 'Pokrycie transektu włosienicznikami (z wyjątkiem krążkolistnego) na 1',
      U2: 'Brak gatunków lub tylko włosienicznik krążkolistny',
    },
    inputs: [
      {
        kind: 'table',
        name: 'rows',
        label: 'Włosieniczniki na odcinku makrofitowym',
        addLabel: 'Dodaj włosienicznik',
        rowLabel: 'Gatunek',
        help: 'Jeden wiersz = jeden gatunek z pokryciem w skali MMOR. Krążkolistny jest na liście, ale się nie liczy.',
        columns: [
          speciesColumn([...optionsOf('batrachium'), ...optionsOf('circinatum')], 'Gatunek', 'Włosienicznik stwierdzony na odcinku. Nazwy jak w przewodniku (Batrachium); Ranunculus fluitans itp. to te same gatunki.'),
          nameColumn,
          mmorColumn(),
        ],
      },
      NONE_FIELD('Brak włosieniczników', 'Zaznacz, gdy na odcinku nie ma żadnego włosienicznika – wtedy U2.'),
    ],
    suggest: (i) => {
      const b = batrachiumOf(i)
      return b ? gradeBatrachium3260(b.cls) : null
    },
    explain: (i) => {
      const b = batrachiumOf(i)
      if (!b) return null
      if (!b.rows.length) return b.circinatum ? 'Tylko włosienicznik krążkolistny – nie liczy się.' : 'Brak włosieniczników.'
      return `Najwyższe pokrycie: ${b.cls} (MMOR), ${b.rows.length} gat. liczonych.`
    },
    warn: (i) => {
      const all = rowsOf(i.rows)
      const odd = all.filter((r) => !isBatrachium3260(r.name) && !isCircinatum3260(r.name)).map((r) => r.name)
      if (i.none === 'yes' && all.length) return 'Zaznaczono „Nie stwierdzono”, a na liście są gatunki.'
      return odd.length ? `Spoza listy włosieniczników (nie liczą się): ${odd.join(', ')}.` : null
    },
    describe: (i) => {
      const all = rowsOf(i.rows)
      return all.length ? listText(all) : i.none === 'yes' ? 'Brak' : ''
    },
  },
  {
    id: 'characteristic',
    label: 'Gatunki charakterystyczne – inne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Gatunki charakterystyczne Ranunculion fluitantis inne niż włosieniczniki: rzęśl hakowata Callitriche hamulata, rzęśl długoszyjkowa C. cophocarpa, rdestniczka gęsta Groenlandia densa, rdestnica nawodna Potamogeton nodosus, zdrojek pospolity Fontinalis antipyretica, wątrobowiec Scapania undulata.',
    help: `Co wpisać: gatunki charakterystyczne z pokryciem w skali MMOR. Włosieniczników tu nie wpisuj (nie dubluj poprzedniego wskaźnika). Inne makrofity – jak w karcie z przewodnika (potocznik, przetacznik) – możesz dopisać jako „Inny gatunek”: trafią do opisu, ale nie liczą się.

Progi (tab. 3): co najmniej 2 gatunki charakterystyczne – FV; 1 gatunek – U1; brak – U2.

${STRUCTURE_RULE_NOTE}

Uwaga: rzęśle są trudne w oznaczaniu (C. hamulata bywa w całym kraju mylona), a rdestniczka gęsta i Scapania razem z włosienicznikami są w Polsce wątpliwe – przewodnik prosi o ostrożność. Sprawozdanie 2024 opisuje FV jako „co najmniej jeden gatunek” – to rozjazd z tab. 3, formularz trzyma się tab. 3.`,
    thresholds: {
      FV: 'Obecność co najmniej 2 gatunków charakterystycznych',
      U1: 'Obecność 1 gatunku charakterystycznego',
      U2: 'Brak gatunków charakterystycznych',
    },
    inputs: [
      {
        kind: 'table',
        name: 'rows',
        label: 'Gatunki charakterystyczne (i inne makrofity do opisu)',
        addLabel: 'Dodaj gatunek',
        rowLabel: 'Gatunek',
        help: 'Jeden wiersz = jeden gatunek z pokryciem MMOR. Liczą się tylko gatunki z listy; „Inny gatunek” idzie do opisu.',
        columns: [speciesColumn(optionsOf('characteristic'), 'Gatunek', 'Gatunek charakterystyczny z tab. 2 albo „Inny gatunek”.'), nameColumn, mmorColumn(false)],
      },
      NONE_FIELD('Brak gatunków charakterystycznych', 'Zaznacz, gdy nie stwierdzono żadnego – wtedy U2.'),
    ],
    suggest: (i) => {
      const rows = rowsOf(i.rows)
      if (!rows.length && i.none !== 'yes') return null
      return gradeCharacteristic3260(distinctBy(rows.filter((r) => isCharacteristic3260(r.name))).length)
    },
    explain: (i) => {
      const rows = rowsOf(i.rows)
      if (!rows.length) return null
      const ch = distinctBy(rows.filter((r) => isCharacteristic3260(r.name)))
      const rest = rows.filter((r) => !isCharacteristic3260(r.name))
      return `Gatunki charakterystyczne: ${ch.length}${ch.length ? ` (${ch.map((r) => r.name).join(', ')})` : ''}.${rest.length ? ` Nie liczą się: ${rest.map((r) => r.name).join(', ')}.` : ''}`
    },
    warn: (i) => {
      const rows = rowsOf(i.rows)
      const bat = rows.filter((r) => isBatrachium3260(r.name) || isCircinatum3260(r.name)).map((r) => r.name)
      if (bat.length) return `Włosieniczniki (${bat.join(', ')}) wpisuj w poprzednim wskaźniku – tu się nie liczą.`
      return i.none === 'yes' && rows.some((r) => isCharacteristic3260(r.name)) ? 'Zaznaczono „Nie stwierdzono”, a na liście są gatunki charakterystyczne.' : null
    },
    describe: (i) => {
      const rows = rowsOf(i.rows)
      return rows.length ? listText(rows) : i.none === 'yes' ? 'Brak' : ''
    },
  },
  {
    id: 'substrate',
    label: 'Materiał dna koryta',
    parameter: 'structure',
    cardinal: true,
    description:
      'Udział materiału dennego o różnej frakcji (RHS, 10 profili kontrolnych i część syntetyczna 500-metrowego odcinka): gruboziarnisty (kamienie, kamyki/żwir, narzut kamienny, >2 mm), piasek (0,06–2 mm), muł (<0,06 mm, z materią organiczną).',
    help: `Co wpisać: procentowy udział frakcji dna na odcinku RHS (500 m). Gruboziarnisty = kamienie + kamyki/żwir + narzut kamienny – formularz sam sumuje. Reszta (piasek, ił, torf, skała) jest neutralna.

Progi (tab. 3): co najmniej 20% gruboziarnistego i maks. 20% mułu – FV; mułu maks. 20% (ale gruboziarnistego mniej) – U1; mułu powyżej 20% – U2.

${STRUCTURE_RULE_NOTE}

Dlaczego: włosieniczniki potrzebują grubego dna do zakorzenienia (kamienie i żwir powyżej 2 cm stymulują rozwój), a namuł je wypiera. W rzekach piaszczystych włosieniczniki potrafią rosnąć na narzucie kamiennym i resztkach budowli – dlatego narzut liczy się do frakcji gruboziarnistej.`,
    thresholds: {
      FV: 'Co najmniej 20% gruboziarnistego materiału dna (kamienie, kamyki/żwir, narzut kamienny) oraz maks. 20% mułu',
      U1: 'Maksymalnie 20% mulistego materiału dna',
      U2: 'Powyżej 20% mulistego materiału dna',
    },
    inputs: percentFields(SUBSTRATE, 'Udział frakcji dna (RHS)', (l) => `Udział frakcji „${l}” na odcinku RHS, w %.`),
    suggest: (i) => {
      const s = substrateOf(i)
      return s ? gradeSubstrate3260(s.coarse, s.mud) : null
    },
    explain: (i) => {
      const s = substrateOf(i)
      return s ? `Gruboziarnisty ${plNum(s.coarse)}%, muł ${plNum(s.mud)}%.` : null
    },
    warn: (i) => sumWarn(substrateOf(i)?.total, 'frakcji dna'),
    describe: (i) => sharesText(i, SUBSTRATE),
  },
  {
    id: 'ecoStatus',
    label: 'Ocena stanu ekologicznego',
    parameter: 'structure',
    cardinal: true,
    description:
      'Stan ekologiczny wg Makrofitowego Indeksu Rzecznego (MIR) w pięciostopniowej skali – wskaźnik eutrofizacji wód (biogeny). Od 2016 r. ocena stanu ekologicznego JCWP z PMŚ.',
    help: `Co wpisać: klasę stanu ekologicznego z MIR (I–V) i, jeśli znasz, wartość MIR. MIR liczy się z badania MMOR na tym samym odcinku albo bierze z oceny jednolitej części wód (JCWP) w Państwowym Monitoringu Środowiska. Granice klas MIR zależą od typu abiotycznego rzeki, dlatego formularz nie zgaduje klasy z samej wartości.

Progi (tab. 3): co najmniej dobry stan (I lub II klasa) – FV; umiarkowany (III klasa) – U1; słaby lub zły (IV lub V klasa) – U2.

${STRUCTURE_RULE_NOTE}

Dlaczego: wysokie stężenia biogenów prowadzą do zaniku zbiorowisk włosienicznikowych. Sprawozdanie 2024: MIR na stanowiskach 32,7–60,0 (klasy I–III), wyraźny wzrost udziału III klasy od 2011 r.`,
    thresholds: thresholdsFromOptions(ECO_CLASS),
    inputs: [
      selectInput('Klasa stanu ekologicznego (MIR)', ECO_CLASS, 'Klasa z MIR dla tego odcinka albo z oceny JCWP.', 'ecoClass'),
      { kind: 'number', name: 'mir', label: 'Wartość MIR (opcjonalnie)', min: 0, max: 100, help: 'Makrofitowy Indeks Rzeczny – trafi do opisu. Sama wartość nie wystarczy do oceny, bo granice klas zależą od typu rzeki.' },
    ],
    suggest: byOption(gradeMap(ECO_CLASS), 'ecoClass'),
    describe: (i) => {
      const mir = num(i.mir)
      const word = ECO_WORD[String(i.ecoClass)]
      return [mir !== undefined ? `Wartość wskaźnika MIR = ${plNum(mir)}` : '', word ? `stan ekologiczny ${word}` : ''].filter(Boolean).join(' – ')
    },
  },
  {
    id: 'elodea',
    label: 'Pokrycie transektu przez moczarkę kanadyjską Elodea canadensis',
    parameter: 'structure',
    cardinal: true,
    description: 'Pokrycie odcinka makrofitowego przez moczarkę kanadyjską w skali MMOR. Bujny rozrost moczarki może wyprzeć włosieniczniki.',
    help: `Co wybrać: pokrycie moczarki kanadyjskiej Elodea canadensis na 100-metrowym odcinku makrofitowym w skali MMOR. Brak moczarki – 0.

Progi (tab. 3): 0–2 – FV; 3–5 – U1; powyżej 5 – U2.

${STRUCTURE_RULE_NOTE}

Dlaczego: liczne historyczne stanowiska włosieniczników zastąpiła moczarka. Sprawozdanie 2024: moczarka na 35 stanowiskach, przy pokryciu 1–2 wskaźnik zostaje FV. Moczarka delikatna E. nuttallii szybko się rozprzestrzenia, ale tab. 3 jej nie ocenia – wpisz ją w gatunkach inwazyjnych albo w uwagach.`,
    thresholds: { FV: 'Pokrycie równe 0–2 (skala MMOR)', U1: 'Pokrycie równe 3–5 (skala MMOR)', U2: 'Pokrycie większe od 5 (skala MMOR)' },
    inputs: [{ kind: 'select', name: 'mmor', label: 'Pokrycie moczarki (MMOR)', options: [{ value: '', label: '—' }, ...MMOR_WITH_ZERO], required: true, help: 'Współczynnik MMOR moczarki kanadyjskiej na odcinku; 0 = nie stwierdzono.' }],
    suggest: (i) => {
      const c = mmorOf(i.mmor)
      return c === undefined ? null : gradeElodea3260(c)
    },
    describe: (i) => {
      const c = mmorOf(i.mmor)
      return c === undefined ? '' : c === 0 ? 'Brak' : String(c)
    },
  },
  {
    id: 'flow',
    label: 'Przepływy',
    parameter: 'structure',
    cardinal: true,
    description:
      'Udział typów przepływu (RHS) na 500-metrowym odcinku – z 10 profili kontrolnych i części syntetycznej. Premiowane są szybkie: kipiel, rwący, wartki.',
    help: `Co wpisać: udział typów przepływu na odcinku RHS w %. Formularz sumuje szybkie (kipiel, rwący, wartki).

Progi (tab. 3): powyżej 40% szybkich typów przepływu – FV; 10–40% – U1; poniżej 10% – U2.

${STRUCTURE_RULE_NOTE}

Dlaczego: włosieniczniki potrzebują wyraźnego nurtu – kipieli albo pofalowanej powierzchni. Sprawozdanie 2024: tylko połowa stanowisk z przepływem korzystnym, spowolnienie wiąże się z regulacją i niskimi stanami wód. Spadek swobodny i przepływ kaskadowy tab. 3 nie wymienia – formularz ich nie dolicza do szybkich (wpisz w „inne”).`,
    thresholds: {
      FV: 'Powyżej 40% szybkich typów przepływu (kipiel, rwący, wartki)',
      U1: '40–10% szybkich typów przepływu (kipiel, rwący, wartki)',
      U2: 'Poniżej 10% szybkich typów przepływu (kipiel, rwący, wartki)',
    },
    inputs: percentFields(FLOWS, 'Udział typów przepływu (RHS)', (l) => `Udział przepływu „${l}” na odcinku RHS, w %.`),
    suggest: (i) => {
      const f = flowOf(i)
      return f ? gradeFlow3260(f.fast) : null
    },
    explain: (i) => {
      const f = flowOf(i)
      return f ? `Szybkie typy przepływu: ${plNum(f.fast)}%.` : null
    },
    warn: (i) => sumWarn(flowOf(i)?.total, 'typów przepływu'),
    describe: (i) => sharesText(i, FLOWS),
  },
  {
    id: 'impoundment',
    label: 'Spiętrzenie wód rzeki',
    parameter: 'structure',
    cardinal: true,
    description: 'Wpływ spiętrzenia wód na odcinek (RHS, skala trzystopniowa): brak; obecne na mniej niż 33% długości; na ponad 33% długości odcinka.',
    help: `Co wybrać: czy i na jakiej długości 500-metrowego odcinka woda jest sztucznie spiętrzona (jaz, zastawka, młyn, stawy powyżej).

${STRUCTURE_RULE_NOTE}

Dlaczego: spiętrzenie zmienia przepływ i sprzyja zamulaniu koryta, a w dłuższym czasie – sukcesji zbiorowisk. Sprawozdanie 2024: problem marginalny (94% stanowisk bez wpływu piętrzenia).`,
    thresholds: { FV: 'Nie', U1: 'Tak – poniżej 33% długości odcinka rzeki', U2: 'Tak – powyżej 33% długości odcinka rzeki' },
    inputs: [selectInput('Spiętrzenie', IMPOUND)],
    suggest: byOption(gradeMap(IMPOUND)),
    describe: (i) => labelOf(IMPOUND, i.choice),
  },
  {
    id: 'hqa',
    label: 'Wskaźnik naturalności siedliska (HQA)',
    parameter: 'structure',
    cardinal: true,
    description: 'Habitat Quality Assessment z RHS – naturalna różnorodność form hydromorfologicznych.',
    help: `Co wpisać: wartość HQA obliczoną z karty RHS (program RHS albo arkusz HIR).

Progi (tab. 3): HQA ≥50 – FV; między 30 a 50 – U1; ≤30 – U2.

${STRUCTURE_RULE_NOTE}

Sprawozdanie 2024: FV tylko na 39% stanowisk – oceny bardzo stabilne między cyklami.`,
    thresholds: { FV: 'Wartość wskaźnika HQA większa lub równa 50', U1: 'Wartość wskaźnika HQA między 30 a 50', U2: 'Wartość wskaźnika HQA mniejsza lub równa 30' },
    inputs: [{ kind: 'number', name: 'value', label: 'HQA', min: 0, required: true, help: 'Wartość indeksu HQA z RHS.' }],
    suggest: (i) => {
      const v = num(i.value)
      return v === undefined ? null : gradeHQA3260(v)
    },
    describe: (i) => {
      const v = num(i.value)
      return v === undefined ? '' : `Wartość wskaźnika HQA = ${plNum(v)}`
    },
  },
  {
    id: 'hms',
    label: 'Wskaźnik przekształcenia siedliska (HMS)',
    parameter: 'structure',
    cardinal: true,
    description: 'Habitat Modification Score z RHS – ilość elementów antropogenicznych modyfikujących koryto i bieg rzeki.',
    help: `Co wpisać: wartość HMS obliczoną z karty RHS.

Progi (tab. 3): HMS ≤20 – FV; między 20 a 40 – U1; ≥40 – U2. Granice są łagodne, bo włosieniczniki dość dobrze znoszą przekształcenia rzek.

${STRUCTURE_RULE_NOTE}`,
    thresholds: { FV: 'Wartość wskaźnika HMS mniejsza lub równa 20', U1: 'Wartość wskaźnika HMS między 20 a 40', U2: 'Wartość wskaźnika HMS większa lub równa 40' },
    inputs: [{ kind: 'number', name: 'value', label: 'HMS', min: 0, required: true, help: 'Wartość indeksu HMS z RHS.' }],
    suggest: (i) => {
      const v = num(i.value)
      return v === undefined ? null : gradeHMS3260(v)
    },
    describe: (i) => {
      const v = num(i.value)
      return v === undefined ? '' : `Wartość wskaźnika HMS = ${plNum(v)}`
    },
  },
  {
    id: 'morphology',
    label: 'Naturalne elementy morfologiczne',
    parameter: 'structure',
    description:
      'Formy typowe dla naturalnych odcinków rzek (RHS): odsypy boczne, meandrowe i śródkorytowe, erodujące i stabilne podcięcia brzegów, wyspy, odsłonięte duże głazy w korycie. Wskaźnik pomocniczy.',
    help: `Co wpisać: każdy rodzaj formy stwierdzony na odcinku RHS – jeden wiersz na rodzaj (liczy się różnorodność, nie liczba sztuk). Brak – „Nie stwierdzono”.

Progi (tab. 3): co najmniej 3 elementy – FV; 1–2 – U1; brak – U2.

Wskaźnik pomocniczy: liczy się do oceny struktury tylko przy regule „najwyżej 2 U2 albo 3 U1” (patrz wskaźniki kardynalne).`,
    thresholds: { FV: 'Obecność co najmniej 3 naturalnych elementów morfologicznych', U1: 'Obecność 1–2 naturalnych elementów morfologicznych', U2: 'Brak naturalnych elementów morfologicznych' },
    inputs: [
      {
        kind: 'table',
        name: 'rows',
        label: 'Formy morfologiczne na odcinku',
        addLabel: 'Dodaj formę',
        rowLabel: 'Forma',
        help: 'Jeden wiersz = jeden rodzaj formy (powtórzenia liczone raz).',
        columns: [{ kind: 'select', name: 'element', label: 'Forma', options: [{ value: '', label: '—' }, ...MORPH_ELEMENTS], required: true, help: 'Rodzaj naturalnej formy morfologicznej wg RHS.' }],
      },
      NONE_FIELD('Brak naturalnych elementów', 'Zaznacz, gdy na odcinku nie ma żadnej naturalnej formy – wtedy U2.'),
    ],
    suggest: (i) => {
      const n = morphOf(i)
      return n === null ? null : gradeMorph3260(n.length)
    },
    warn: (i) => (i.none === 'yes' && morphOf(i)?.length ? 'Zaznaczono „Nie stwierdzono”, a na liście są formy.' : null),
    describe: (i) => {
      const n = morphOf(i)
      return n === null ? '' : n.length ? n.map((v, idx) => (idx ? labelOf(MORPH_ELEMENTS, v).toLowerCase() : labelOf(MORPH_ELEMENTS, v))).join(', ') : 'Brak'
    },
  },
  {
    id: 'shade',
    label: 'Zacienienie rzeki',
    parameter: 'structure',
    description:
      'Stopień przesłonięcia koryta przez drzewa i krzewy: (zadrzewienie obu brzegów 0–10) × (zacienienie koryta 0, 1 albo 3) / 30 × 100%. Wskaźnik pomocniczy.',
    help: `Co wpisać: z karty RHS – stopień zadrzewienia lewego i prawego brzegu (0–5) i zacienienie koryta (0 brak, 1 na mniej niż 33% odcinka, 3 na ponad 33%). Formularz policzy procent: suma zadrzewienia × zacienienie / 30 (30 to maksimum). Procent możesz też wpisać wprost – ma pierwszeństwo.

Progi (tab. 3): maks. 50% – FV; 50–80% – U1; ponad 80% – U2.

Dlaczego: zbyt duże zacienienie ogranicza rozwój roślin, w tym włosieniczników. Sprawozdanie 2024: na 13% stanowisk zacienienie przekraczało 80%.`,
    thresholds: { FV: 'Maksymalnie 50% stopień zacienienia koryta rzecznego', U1: '50–80% stopień zacienienia koryta rzecznego', U2: 'Ponad 80% zacienienie koryta rzecznego' },
    inputs: [
      { kind: 'select', name: 'treesLeft', label: 'Zadrzewienie lewego brzegu (0–5)', options: [{ value: '', label: '—' }, ...TREES], group: 'Z karty RHS', groupCols: 3, help: 'Stopień zadrzewienia lewego brzegu wg RHS, 0–5.' },
      { kind: 'select', name: 'treesRight', label: 'Zadrzewienie prawego brzegu (0–5)', options: [{ value: '', label: '—' }, ...TREES], group: 'Z karty RHS', help: 'Stopień zadrzewienia prawego brzegu wg RHS, 0–5.' },
      { kind: 'select', name: 'shading', label: 'Zacienienie koryta', options: [{ value: '', label: '—' }, ...SHADING], group: 'Z karty RHS', help: 'Zacienienie koryta wg RHS: 0, 1 albo 3.' },
      { kind: 'number', name: 'percent', label: 'Zacienienie wprost (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Gotowy procent zacienienia – ma pierwszeństwo przed wyliczeniem z RHS.' },
    ],
    suggest: (i) => {
      const s = shadeOf(i)
      return s ? gradeShade3260(s.p) : null
    },
    explain: (i) => {
      const s = shadeOf(i)
      if (!s) return null
      return s.from === 'direct' ? `Zacienienie wpisane wprost: ${plNum(s.p)}%.` : `(${num(i.treesLeft)} + ${num(i.treesRight)}) × ${num(i.shading)} / 30 = ${plNum(s.p)}%.`
    },
    describe: (i) => {
      const s = shadeOf(i)
      return s ? `${plNum(s.p)}%` : ''
    },
  },
  {
    id: 'aliens',
    label: 'Gatunki inwazyjne',
    parameter: 'structure',
    description:
      'Obce gatunki inwazyjne na brzegu i w pasie 50 m od brzegu (RHS), bez moczarki kanadyjskiej (osobny wskaźnik). Nasilenie: stwierdzone albo liczne – na ponad 33% długości odcinka. Wskaźnik pomocniczy.',
    help: `Co wpisać: każdy obcy gatunek inwazyjny na brzegach i w pasie 50 m – z informacją, czy jest liczny (ponad 33% długości odcinka). Moczarki kanadyjskiej tu nie wpisuj. Brak – „Nie stwierdzono”.

Progi (tab. 3): 1–2 gatunki, żaden liczny – FV; 3–4, żaden liczny – U1; 5 i więcej albo choć jeden liczny – U2. Brak gatunków – FV.

Najczęstsze (sprawozdanie 2024): niecierpek drobnokwiatowy i gruczołowaty, rdestowce (japoński, sachaliński, pośredni), nawłocie, uczep amerykański, kolczurka klapowana, klon jesionolistny, czeremcha amerykańska.`,
    thresholds: {
      FV: 'Obecność 1–2 obcych gatunków inwazyjnych (z których żaden nie jest liczny <33%)',
      U1: 'Obecność 3–4 obcych gatunków inwazyjnych (z których żaden nie jest liczny <33%)',
      U2: 'Obecność pow. 5 obcych gatunków inwazyjnych lub co najmniej jeden, który jest liczny (>33%)',
    },
    inputs: [
      {
        kind: 'table',
        name: 'rows',
        label: 'Obce gatunki inwazyjne',
        addLabel: 'Dodaj gatunek',
        rowLabel: 'Gatunek',
        help: 'Jeden wiersz = jeden gatunek z nasileniem.',
        columns: [
          speciesColumn(optionsOf('alien'), 'Gatunek', 'Obcy gatunek inwazyjny albo „Inny gatunek”.'),
          nameColumn,
          {
            kind: 'select',
            name: 'abundance',
            label: 'Nasilenie',
            options: [
              { value: '', label: '—' },
              { value: 'present', label: 'Stwierdzony (mało liczny)' },
              { value: 'abundant', label: 'Liczny – ponad 33% długości odcinka' },
            ],
            help: 'Skala RHS: stwierdzony albo liczny na ponad 33% długości odcinka.',
          },
        ],
      },
      NONE_FIELD('Brak gatunków inwazyjnych', 'Zaznacz, gdy nie stwierdzono żadnego – wtedy FV.'),
    ],
    suggest: (i) => {
      const a = aliensOf(i)
      return a ? gradeAliens3260(a.rows.length, a.abundant.length > 0) : null
    },
    explain: (i) => {
      const a = aliensOf(i)
      return a && a.rows.length ? `${a.rows.length} gat. obcych${a.abundant.length ? `, liczne: ${a.abundant.map((r) => r.name).join(', ')}` : ', żaden liczny'}.` : null
    },
    warn: (i) => {
      const all = rowsOf(i.rows)
      if (all.some((r) => isElodea3260(r.name))) return 'Moczarka kanadyjska ma osobny wskaźnik – tu się nie liczy.'
      return i.none === 'yes' && all.length ? 'Zaznaczono „Nie stwierdzono”, a na liście są gatunki.' : null
    },
    describe: (i) => {
      const a = aliensOf(i)
      if (!a) return ''
      if (!a.rows.length) return 'Brak'
      const few = a.rows.filter((r) => !r.abundant).map((r) => r.name)
      return [few.length ? `${few.join(', ')} – mało liczne` : '', a.abundant.length ? `${a.abundant.map((r) => r.name).join(', ')} – liczne (>33% odcinka)` : '']
        .filter(Boolean)
        .join('; ')
    },
  },
  {
    id: 'sewage',
    label: 'Ścieki',
    parameter: 'structure',
    description:
      'Dopływ ścieków komunalnych lub przemysłowych do rzeki na odcinku, także pryzmy obornika i składowiska odpadów w bezpośrednim sąsiedztwie. Wskaźnik pomocniczy.',
    help: `Co wybrać: czy na odcinku są wyloty ścieków albo ścieki w wodzie; czy są zastoiska ścieków w rzece albo grunt przy rzece nasiąknięty ściekami.

Dlaczego: włosieniczniki znoszą umiarkowaną eutrofię, ale bezpośredni dopływ ścieków im szkodzi. Sprawozdanie 2024: ścieki na 7 z 88 stanowisk (U1).`,
    thresholds: thresholdsFromOptions(SEWAGE),
    inputs: [selectInput('Ścieki', SEWAGE)],
    suggest: byOption(gradeMap(SEWAGE)),
    describe: (i) => labelOf(SEWAGE, i.choice),
  },
]

function morphOf(i: InputValues): string[] | null {
  const vals = Array.isArray(i.rows) ? [...new Set((i.rows as Record<string, unknown>[]).map((r) => String(r?.element ?? '')).filter((v) => MORPH_ELEMENTS.some((o) => o.value === v)))] : []
  if (!vals.length && i.none !== 'yes') return null
  return vals
}

// ---------- stanowisko ----------

const coordHelp = (where: string) =>
  `Współrzędne GPS ${where} 500-metrowego odcinka RHS (odcinek makrofitowy MMOR leży między 6. a 8. profilem kontrolnym). Format jak w karcie, np. „N 54°21′12″ E 16°40′05″”.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'river',
    label: 'Nazwa rzeki',
    required: true,
    placeholder: 'np. Kanał Miejski',
    help: 'Rzeka (ciek), na której leży stanowisko.',
  },
  pickField(methodology7120.siteFields, 'siteName', { placeholder: 'np. Sławno', help: 'Nazwa stanowiska – zwykle miejscowość przy odcinku badawczym, np. „Sławno”. W sprawozdaniach: „Rzeka – miejscowość”.' }),
  pickField(methodology7120.siteFields, 'guid'),
  pickField(methodology7120.siteFields, 'protectedAreas'),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. RZGW w Gdańsku, Okręg PZW w Koszalinie',
    help: 'Zarządca wód (Wody Polskie – RZGW, zarząd zlewni) i użytkownik rybacki (okręg PZW), ewentualnie park, nadleśnictwo.',
  },
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    placeholder: 'np. 19–20',
    required: true,
    help: 'Wysokość odcinka nad poziomem morza – dla 500 m rzeki zwykle zakres (początek–koniec).',
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska przyrodniczego na stanowisku',
    rows: 4,
    required: true,
    hint: 'Głębokość, szerokość koryta, położenie odcinka makrofitowego, charakter dna i brzegów.',
    help: `Krótki opis odcinka: maksymalna głębokość, szerokość koryta, gdzie leży 100-metrowy odcinek makrofitowy (np. przy moście), charakter dna (kamieniste, piaszczyste, narzut), brzegi (zadrzewione, umocnione), zabudowa w sąsiedztwie.`,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. zbiorowisko ze związku Ranunculion fluitantis',
    help: 'Zbiorowiska: Ranunculetum fluitantis, Ranunculo-Callitrichetum hamulatae, Ranunculo-Sietum erecto-submersi albo „zbiorowisko ze związku Ranunculion fluitantis”.',
  },
  {
    kind: 'textarea',
    name: 'patches',
    label: 'Powierzchnia płatów siedliska',
    rows: 2,
    placeholder: 'np. włosieniczniki występują na 200 m odcinku rzeki umocnionym narzutem kamiennym',
    help: 'Na jakiej długości (albo powierzchni) odcinka rosną włosieniczniki. Ocenę parametru „Powierzchnia” daje pokrycie włosieniczników w skali MMOR – to pole jest opisowe.',
  },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    placeholder: 'np. 8x500 m',
    required: true,
    hint: 'Odcinek RHS 500 m (szerokość koryta × 500 m), w nim odcinek makrofitowy 100 m.',
    help: 'Odcinek hydromorfologiczny RHS ma 500 m i 10 profili kontrolnych co 50 m; odcinek makrofitowy MMOR – 100 m między 6. a 8. profilem. W karcie z przewodnika: „8x500 m” (szerokość koryta × długość).',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 16.07.2011',
    required: true,
    hint: 'Optymalnie lipiec–sierpień.',
    help: 'Dzień badań terenowych. Monitoring co 3–6 lat, optymalnie od lipca do sierpnia. Po intensywnych deszczach (wysoka, mętna woda) badanie lepiej przełożyć. Sprawozdanie 2024: badania 4 VII–29 VIII, jedno stanowisko 5 IX przy utrzymującej się ciepłej pogodzie.',
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 7 && m <= 8 ? null : 'Termin poza optymalnym oknem (lipiec–sierpień). Włosieniczniki mogą być słabo rozwinięte albo już zniszczone przez wezbrania.'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcie fitosocjologiczne ----------

const releveFields: FieldDef[] = [
  { kind: 'text', name: 'coords', group: 'Położenie zdjęcia', wide: true, label: 'Współrzędne środka zdjęcia', help: 'Współrzędne GPS środka zdjęcia – zwykle na odcinku makrofitowym.' },
  { kind: 'number', name: 'altitude', group: 'Położenie zdjęcia', label: 'Wysokość n.p.m.', unit: 'm n.p.m.', help: 'Wysokość środka zdjęcia nad poziomem morza.' },
  { kind: 'number', name: 'area', label: 'Powierzchnia zdjęcia', unit: 'm²', min: 0, help: 'Powierzchnia płatu roślinności wodnej objętego zdjęciem (w karcie z przewodnika 20 m²).' },
  { kind: 'text', name: 'unit', label: 'Jednostka fitosocjologiczna', placeholder: 'np. zbiorowisko ze związku Ranunculion fluitantis', help: 'Zespół albo „zbiorowisko ze związku Ranunculion fluitantis”.' },
  {
    kind: 'releve-species',
    name: 'species',
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w płacie z ilościowością w skali Braun-Blanqueta (r, +, 1–5). Rośliny wodne wpisuj w warstwie C, mszaki (zdrojek, Scapania) w D.',
  },
]

// ---------- oddziaływania (słownik 2011) ----------

const IMPACT_CODES_3260 = [
  'A01', 'A02.02', 'A03', 'A03.01', 'A03.02', 'A03.03', 'A04', 'A05.01', 'A08', 'A10.01',
  'B02.02', 'B02.03', 'C01.01',
  'D01', 'D01.01', 'D01.02', 'D01.03', 'D01.04', 'D01.05',
  'E01', 'E01.01', 'E01.02', 'E01.03', 'E01.04', 'E02', 'E02.01', 'E03', 'E03.01', 'E03.04',
  'F01', 'F02.03', 'F02.03.02', 'F04.01',
  'G01', 'G01.01', 'G01.03', 'G01.08', 'G05.07',
  'H01', 'H01.03', 'H01.05', 'H01.08', 'H05.01',
  'I01',
  'J02.02', 'J02.03', 'J02.03.02', 'J02.04.01', 'J02.05', 'J02.05.02', 'J02.06', 'J02.06.06', 'J02.08', 'J02.10', 'J02.12', 'J03.02',
  'K01.02', 'K02.03', 'K04', 'M01.05', 'X',
]

export const methodology3260: Methodology = {
  code: '3260',
  name: 'Nizinne i podgórskie rzeki ze zbiorowiskami włosieniczników (Ranunculion fluitantis)',
  source:
    'Szoszkiewicz K., Gebler D. 2012, 3260 Nizinne i podgórskie rzeki ze zbiorowiskami włosieniczników (Ranunculion fluitantis), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 204–217 (tab. 1–3)',

  siteFields,

  releves: {
    defaultCount: 1,
    intro:
      'Jedno zdjęcie fitosocjologiczne płatu roślinności wodnej na odcinku makrofitowym, w skali Braun-Blanqueta (jak w karcie z przewodnika). Pokrycie gatunków na całym 100-metrowym odcinku (MMOR) wpisujesz we wskaźnikach.',
    fields: releveFields,
  },

  indicators,
  structureRule: structureRule3260,

  prospects: {
    description: 'Ocena możliwości utrzymania siedliska we właściwej kondycji – obecny stan i czynniki, które mogą na nie oddziaływać. Istotne zwłaszcza, czy stanowisko leży na terenie objętym formą ochrony.',
    help: `Kluczowa jest forma ochrony obszaru i otoczenie rzeki: tereny wiejskie i lasy dają szansę na ochronę, silna urbanizacja i przemysł – nie. W opisie podaj, gdzie leży stanowisko (np. „w centrum miasta, poza obszarami chronionymi”) i główne zagrożenia: eutrofizacja, regulacja i bagrowanie koryta, wykaszanie roślinności wodnej, moczarka.

Sprawozdanie 2024: perspektywy to jedyny parametr, który się poprawił – FV mają głównie stanowiska na obszarach chronionych.`,
    thresholds: {
      FV: 'Stanowisko znajduje się na obszarze chronionym',
      U1: 'Stanowisko poza obszarem chronionym, ale jest perspektywa takiej ochrony (np. tereny wiejskie, lasy)',
      U2: 'Stanowisko poza obszarem chronionym i brak perspektyw na taką ochronę (np. tereny silnie zurbanizowane lub industrialne)',
    },
  },

  impactCodes: IMPACT_CODES_3260.map((code) => {
    const e = IMPACT_DICT.find((d) => d.code === code)
    if (!e) throw new Error(`Brak kodu ${code} w słowniku oddziaływań`)
    return { code, name: e.name }
  }),

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. ryby łososiowate, minóg, skójka gruboskorupowa, wydra, zimorodek; sąsiedztwo łęgów 91E0.',
        help: 'Wartości przyrodnicze odcinka poza samym siedliskiem: ichtiofauna (pstrąg, lipień, głowacz, minogi), małże (skójka gruboskorupowa), ssaki (wydra, bóbr), ptaki (zimorodek, pluszcz), sąsiedztwo łęgów 91E0 i ziołorośli 6430. Brak informacji – „Nie pozyskano danych”.',
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: 'Wykonane działania ochronne i propozycje. Typowe dla 3260: wyłączenie odcinków z włosienicznikami z prac regulacyjnych, wykaszania i bagrowania; ochrona podczas budowy mostów; zakaz eksploatacji rumowiska; renaturyzacja; właściwa eksploatacja budowli hydrotechnicznych (regulacja przepływu); ograniczanie dopływu biogenów w całej zlewni. Brak działań – „Brak”.',
      }
    return f
  }),

  speciesCatalog: SPECIES_3260.map((s) => ({ value: s.latin, label: s.polish, layer: defaultLayer3260(s) })),
  speciesInfo: (name) => {
    const e = findSpecies3260(name)
    return e ? GROUP_LABELS_3260[e.group] : undefined
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator3260 = (id: string): IndicatorDef => {
  const i = methodology3260.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 3260`)
  return i
}
