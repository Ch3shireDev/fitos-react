// Metodyka 3160 (naturalne, dystroficzne zbiorniki wodne) jako dane. Źródło: Wilk-Woźniak E., Gąbka M. i in. 2012,
// „3160 Naturalne, dystroficzne zbiorniki wodne” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik
// metodyczny, cz. II, GIOŚ, s. 150–169 (tab. 1 i 2), z praktyką oceny ze sprawozdań z monitoringu 2009–2011 i 2016–2018.
// Siedlisko wodne: transekt prostopadły do brzegu (albo cały mały zbiornik), pomiary wody w najgłębszym punkcie
// (barwa, pH, przewodnictwo, Secchi, TDS, próbka na DOC/DIC) i próba planktonu. Zdjęć fitosocjologicznych metodyka
// nie wymaga. Z modułu leśnego brane są tylko klocki generyczne (choiceIndicator, measureIndicator, pickField).
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { num } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { choiceIndicator, gradeMap, labelOf, measureIndicator, pickField, plNum, type GradedOption } from '../../forest'
import { GROUP_LABELS_3160, SPECIES_3160, defaultLayer3160, findSpecies3160, isCharacteristicGroup } from './species'

// ---------- typ jeziora (z zakładki Stanowisko) ----------

export const LAKE_TYPES: SelectOption[] = [
  { value: 'macrophyte', label: 'Makrofitowe – z dobrze rozwiniętą roślinnością wodną' },
  { value: 'open', label: 'Bez roślinności podwodnej albo ze szczątkową' },
]
/** Jezioro makrofitowe – inne progi zmian pH, przewodnictwa i TDS. */
export const isMacrophyteLake = (ctx?: IndicatorContext) => ctx?.site?.lakeType === 'macrophyte'

const ORDER: Grade[] = ['FV', 'U1', 'U2']
/** Gorsza z ocen (null = brak danych, pomijany). */
export const worse = (...gs: (Grade | null | undefined)[]): Grade | null =>
  gs.reduce<Grade | null>((acc, g) => (!g ? acc : !acc ? g : ORDER.indexOf(g) > ORDER.indexOf(acc) ? g : acc), null)

// ---------- progi wartości bezwzględnych (tab. 2) ----------

/** Odczyn: pH 3–7 FV; 7–8 albo 2–3 U1; >8 albo <2 U2. Granice 3 i 7 → FV. */
export const gradePH3160 = (ph: number): Grade => (ph >= 3 && ph <= 7 ? 'FV' : ph >= 2 && ph <= 8 ? 'U1' : 'U2')
/** Przewodnictwo: <100 µS/cm FV, 100–500 U1, >500 U2. */
export const gradeConductivity3160 = (ec: number): Grade => (ec < 100 ? 'FV' : ec <= 500 ? 'U1' : 'U2')
/** Barwa: <50 mg Pt/dm³ FV, 51–100 U1, >101 U2. Luki 50–51 i 100–101 → odpowiednio FV i U1 (interpretacja). */
export const gradeColour3160 = (pt: number): Grade => (pt <= 50 ? 'FV' : pt <= 100 ? 'U1' : 'U2')
/** HDI: >50 FV, 40–50 U1, <40 U2 (50 i 40 → U1). */
export const gradeHDI3160 = (hdi: number): Grade => (hdi > 50 ? 'FV' : hdi >= 40 ? 'U1' : 'U2')
/** TDS przy pierwszym badaniu: <60 mg/dm³ FV, 60–100 U1, >100 U2. */
export const gradeTDS3160 = (tds: number): Grade => (tds < 60 ? 'FV' : tds <= 100 ? 'U1' : 'U2')
/** Przezroczystość: do dna albo >1,5 m FV; 0,5–1,5 m U1; <0,5 m U2. */
export const gradeSecchi3160 = (m: number, toBottom: boolean): Grade => (toBottom || m > 1.5 ? 'FV' : m >= 0.5 ? 'U1' : 'U2')
/** Rodzime ekspansywne: brak FV, do 5% U1, >5% U2. */
export const gradeExpansive3160 = (pct: number): Grade => (pct <= 0 ? 'FV' : pct <= 5 ? 'U1' : 'U2')
/** Zmiana powierzchni (%): spadek ≤10% albo wzrost FV, spadek 10–30% U1, ≥30% U2. */
export const gradeAreaChange3160 = (pct: number): Grade => (pct >= -10 ? 'FV' : pct > -30 ? 'U1' : 'U2')

// ---------- HDI (Górniak 2005, 2006) ----------

export interface HdiParts {
  d1: number
  d2: number
  d3: number
  hdi: number
}

/**
 * HDI = ∛(D1 · D2 · D3); D1 = 100 / log EC, D2 = 10 · DOC/DIC, D3 = (9,5 − pH) · 20.
 * null, gdy brak danych albo wzór nie ma sensu (EC ≤ 1 µS/cm, DIC ≤ 0, pH ≥ 9,5).
 */
export function computeHDI(ph: number | undefined, ec: number | undefined, doc: number | undefined, dic: number | undefined): HdiParts | null {
  if (ph === undefined || ec === undefined || doc === undefined || dic === undefined) return null
  if (ec <= 1 || dic <= 0 || doc < 0 || ph >= 9.5) return null
  const d1 = 100 / Math.log10(ec)
  const d2 = 10 * (doc / dic)
  const d3 = (9.5 - ph) * 20
  return { d1, d2, d3, hdi: Math.cbrt(d1 * d2 * d3) }
}

const r1 = (n: number) => Math.round(n * 10) / 10
const phOf = (ctx?: IndicatorContext) => num(ctx?.indicators?.ph?.inputs?.value)
const ecOf = (ctx?: IndicatorContext) => num(ctx?.indicators?.conductivity?.inputs?.value)

function hdiOf(i: InputValues, ctx?: IndicatorContext): { hdi?: number; parts?: HdiParts; typed?: boolean } {
  const typed = num(i.hdi)
  if (typed !== undefined) return { hdi: typed, typed: true }
  const parts = computeHDI(phOf(ctx), ecOf(ctx), num(i.doc), num(i.dic))
  return parts ? { hdi: parts.hdi, parts } : {}
}

export const hdiExcluded = (ctx: IndicatorContext) => ctx.site?.hdiMeasured === 'no'

// ---------- zmiana względem poprzedniego badania ----------

const CHANGE_FIELD = 'change'
const PREV_FIELD = 'previous'

interface ChangeRule {
  /** Niekorzystny kierunek zmiany. */
  bad: (ctx?: IndicatorContext) => 'up' | 'down'
  /** Zmiana (w jednostkach albo %) od której jest U2. */
  limit: (ctx?: IndicatorContext) => number
  /** Zmiana liczona w % wartości poprzedniej. */
  relative?: boolean
  unit: string
  options: GradedOption[]
}

export interface ChangeResult {
  /** Zmiana ze znakiem (jednostki albo %). */
  delta: number
  /** Zmiana w niekorzystnym kierunku (dodatnia = gorzej). */
  unfavourable: number
  grade: Grade
}

/**
 * Zmiana policzona z poprzedniej wartości, dosłownie wg tab. 2: niekorzystna zmiana ≥ progu → U2, każda mniejsza
 * niekorzystna zmiana → U1, brak niekorzystnej zmiany → FV. Gdy różnica mieści się w błędzie pomiaru, obserwator
 * wybiera „bez istotnych zmian” w polu „Zmiana” – wybór ma pierwszeństwo.
 */
export function computeChange(cur: number | undefined, prev: number | undefined, rule: ChangeRule, ctx?: IndicatorContext): ChangeResult | null {
  if (cur === undefined || prev === undefined) return null
  if (rule.relative && prev <= 0) return null
  const delta = rule.relative ? ((cur - prev) / prev) * 100 : cur - prev
  const unfavourable = rule.bad(ctx) === 'up' ? delta : -delta
  const eps = 1e-9
  const grade: Grade = unfavourable >= rule.limit(ctx) - eps ? 'U2' : unfavourable > eps ? 'U1' : 'FV'
  return { delta, unfavourable, grade }
}

/** Ocena zmiany: wybór obserwatora > wyliczenie z poprzedniej wartości > brak (null). */
function changeGrade(i: InputValues, cur: number | undefined, rule: ChangeRule, ctx?: IndicatorContext): Grade | null {
  const chosen = gradeMap(rule.options)[String(i[CHANGE_FIELD] ?? '')]
  if (chosen) return chosen
  return computeChange(cur, num(i[PREV_FIELD]), rule, ctx)?.grade ?? null
}

const fmtDelta = (r: ChangeResult, rule: ChangeRule) => {
  const sign = r.delta > 0 ? '+' : r.delta < 0 ? '−' : '±'
  const abs = rule.relative ? r1(Math.abs(r.delta)) : Math.round(Math.abs(r.delta) * 100) / 100
  return `${sign}${plNum(abs)}${rule.relative ? '%' : ` ${rule.unit}`}`
}

function changeExplain(i: InputValues, cur: number | undefined, rule: ChangeRule, ctx?: IndicatorContext): string | null {
  const r = computeChange(cur, num(i[PREV_FIELD]), rule, ctx)
  if (!r) return null
  const dir = rule.bad(ctx) === 'up' ? 'wzrost' : 'spadek'
  const chosen = i[CHANGE_FIELD] ? ` Wybrano: „${labelOf(rule.options, i[CHANGE_FIELD])}”.` : ''
  return `Zmiana względem poprzedniego badania: ${fmtDelta(r, rule)} (niekorzystny jest ${dir}, U2 od ${plNum(rule.limit(ctx))}${rule.relative ? '%' : ` ${rule.unit}`}) → ${r.grade}.${chosen}`
}

function changeWarn(i: InputValues, cur: number | undefined, rule: ChangeRule, ctx?: IndicatorContext): string | null {
  const r = computeChange(cur, num(i[PREV_FIELD]), rule, ctx)
  const chosen = gradeMap(rule.options)[String(i[CHANGE_FIELD] ?? '')]
  if (!r || !chosen || chosen === r.grade) return null
  if (r.grade === 'U2') return `Zmiana ${fmtDelta(r, rule)} przekracza próg U2, a w polu „Zmiana” wybrano ocenę ${chosen}.`
  if (r.grade === 'FV' && chosen !== 'FV') return `Z poprzedniej wartości nie wynika niekorzystna zmiana (${fmtDelta(r, rule)}), a w polu „Zmiana” wybrano ocenę ${chosen}.`
  return null
}

const changeFields = (rule: ChangeRule, prevLabel: string): FieldDef[] => [
  {
    kind: 'number',
    name: PREV_FIELD,
    label: prevLabel,
    unit: rule.unit,
    min: 0,
    help: 'Wartość z poprzedniego badania tego stanowiska (karta sprzed 3–6 lat). Puste przy pierwszym badaniu. Gdy ją wpiszesz, formularz policzy zmianę i podpowie jej ocenę.',
  },
  {
    kind: 'select',
    name: CHANGE_FIELD,
    label: 'Zmiana względem poprzedniego badania (opcjonalnie)',
    options: rule.options.map(({ value, label }) => ({ value, label })),
    help: `Twoja ocena zmiany. Ma pierwszeństwo przed wyliczeniem z poprzedniej wartości – wybierz „bez istotnych zmian”, gdy różnica mieści się w błędzie pomiaru albo w naturalnych wahaniach sezonowych. Puste i bez poprzedniej wartości – liczy się tylko wartość bezwzględna.
${rule.options.map((o) => `• ${o.label} – ${o.grade}`).join('\n')}`,
  },
]

const changeOptions = (small: string, large: string): GradedOption[] => [
  { value: 'none', label: 'Bez istotnych zmian (albo pierwsze badanie)', grade: 'FV' },
  { value: 'small', label: small, grade: 'U1' },
  { value: 'large', label: large, grade: 'U2' },
]

export const PH_CHANGE: ChangeRule = {
  bad: (ctx) => (isMacrophyteLake(ctx) ? 'down' : 'up'),
  limit: () => 0.5,
  unit: 'pH',
  options: changeOptions(
    'Wzrost o mniej niż 0,5 pH (w jeziorze makrofitowym: spadek o mniej niż 0,5)',
    'Wzrost o 0,5 pH lub więcej (w jeziorze makrofitowym: spadek o 0,5 lub więcej)',
  ),
}
export const EC_CHANGE: ChangeRule = {
  bad: () => 'up',
  limit: (ctx) => (isMacrophyteLake(ctx) ? 50 : 20),
  unit: 'µS/cm',
  options: changeOptions(
    'Wzrost o mniej niż 20 µS/cm (w jeziorze makrofitowym: o mniej niż 50)',
    'Wzrost o 20 µS/cm lub więcej (w jeziorze makrofitowym: o 50 lub więcej)',
  ),
}
export const SECCHI_CHANGE: ChangeRule = {
  bad: () => 'down',
  limit: () => 20,
  relative: true,
  unit: 'm',
  options: changeOptions('Spadek o mniej niż 20%', 'Spadek o 20% lub więcej'),
}
export const TDS_CHANGE: ChangeRule = {
  bad: () => 'up',
  limit: (ctx) => (isMacrophyteLake(ctx) ? 50 : 20),
  relative: true,
  unit: 'mg/dm³',
  options: changeOptions(
    'Wzrost o mniej niż 20% (w jeziorze makrofitowym: o mniej niż 50%)',
    'Wzrost o 20% lub więcej (w jeziorze makrofitowym: o 50% lub więcej)',
  ),
}

const MEASURE_POINT = `Gdzie: w najgłębszym (zwykle centralnym) miejscu zbiornika, w strefie otwartej toni, z warstwy powierzchniowej ok. 0,5–1 m – nie z litoralu. Termin: lipiec – połowa września, bo latem woda jest w stanie „najmniejszej dystrofii” (Górniak 2005, 2006).`

const lakeTypeNote = (what: string) =>
  `Próg zmiany zależy od typu jeziora z zakładki Stanowisko (${what}). Bez poprzedniego wyniku liczy się tylko wartość bezwzględna; z poprzednim – gorsza z dwóch ocen (interpretacja: tab. 2 łączy oba warunki).`

// ---------- gatunki charakterystyczne: spis transektu ----------

export interface SpeciesShare {
  name: string
  share: string
}

/** Kompletne wiersze spisu (gatunek + udział jako tekst, np. „<60%”). */
export function speciesShares(value: unknown): SpeciesShare[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((r: Record<string, unknown>) => {
    const name = String(r?.species ?? '').trim()
    if (!name) return []
    return [{ name, share: String(r?.share ?? '').trim() }]
  })
}

/** „Potamogeton natans <60%, Sphagnum cuspidatum <5%”. */
export const describeShares = (rows: SpeciesShare[]) => rows.map((r) => (r.share ? `${r.name} ${r.share}` : r.name)).join(', ')

const isCharacteristic = (name: string) => {
  const e = findSpecies3160(name)
  return e ? isCharacteristicGroup(e.group) : false
}

// ---------- opcje selektów ----------

export const AREA_OPTIONS: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom większym niż 10% lub zwiększa się', grade: 'FV' },
  { value: 'decline', label: 'Spadek powierzchni większy niż 10%, a mniejszy niż 30%', grade: 'U1' },
  { value: 'loss', label: 'Wyraźny spadek powierzchni (30% lub więcej)', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do oceny', grade: 'XX' },
]

export const CHARACTERISTIC_OPTIONS: GradedOption[] = [
  { value: 'stable', label: 'Liczba gatunków i zajęta przez nie powierzchnia bez zmian lub większa (albo pierwsze badanie)', grade: 'FV' },
  { value: 'noneNatural', label: 'Brak roślin – stan naturalny, specyfika zbiornika (albo wcześniej też nie notowano roślin)', grade: 'FV' },
  { value: 'noneDoubt', label: 'Brak roślin – nie wiadomo, czy to degeneracja, czy specyfika zbiornika', grade: 'FV' },
  { value: 'decline', label: 'Spadek liczby gatunków i zajętej przez nie powierzchni mniejszy niż 20%', grade: 'U1' },
  { value: 'loss', label: 'Znaczący zanik gatunków lub spadek zajętej powierzchni powyżej 20%', grade: 'U2' },
]

export const INVASIVE_OPTIONS: GradedOption[] = [
  { value: 'none', label: 'Brak (dopuszcza się moczarkę kanadyjską Elodea canadensis)', grade: 'FV' },
  { value: 'single', label: 'Obecne jako pojedyncze osobniki (bez moczarki kanadyjskiej)', grade: 'U1' },
  { value: 'numerous', label: 'Występują licznie (bez moczarki kanadyjskiej)', grade: 'U2' },
]

export const COLOUR_OPTIONS: GradedOption[] = [
  { value: 'brown', label: 'Brązowa, klarowna lub o niewielkiej mętności', grade: 'FV' },
  { value: 'darkBrown', label: 'Ciemnobrunatna', grade: 'U1' },
  { value: 'greenTurbid', label: 'Zielona albo ciemnobrunatna z dużą ilością zawiesiny', grade: 'U2' },
]

export const DRAINAGE_OPTIONS: GradedOption[] = [
  {
    value: 'none',
    label: 'Brak rowów i infrastruktury melioracyjnej albo „zneutralizowana” działaniami ochronnymi, brak realnych zagrożeń',
    grade: 'FV',
  },
  { value: 'minor', label: 'Rowy i inna infrastruktura w niewielkim stopniu oddziałują na warunki wodne zbiornika', grade: 'U1' },
  { value: 'strong', label: 'Istniejąca infrastruktura melioracyjna wyraźnie pogarsza warunki wodne', grade: 'U2' },
]
const DRAINAGE_SHORT: Record<string, string> = {
  none: 'Brak',
  minor: 'Infrastruktura melioracyjna w niewielkim stopniu oddziałuje na warunki wodne',
  strong: 'Infrastruktura melioracyjna wyraźnie pogarsza warunki wodne',
}
const YES_NO: SelectOption[] = [
  { value: 'yes', label: 'Tak' },
  { value: 'no', label: 'Nie' },
]

export const PLANKTON_OPTIONS: GradedOption[] = [
  {
    value: 'dystrophic',
    label: 'Dominacja gatunków miksotroficznych, możliwa dominacja sprzężnic, ubóstwo gatunkowe okrzemek, gatunki acydofilne',
    grade: 'FV',
  },
  { value: 'diverse', label: 'Duże zróżnicowanie gatunkowe fitoplanktonu, masowa obecność Gonyostomum semen', grade: 'U1' },
  { value: 'eutrophic', label: 'Gatunki preferujące wody eutroficzne, widoczne zakwity sinicowe', grade: 'U2' },
]

// ---------- wskaźniki ----------

const AUX_NOTE = 'wskaźnik pomocniczy – nie liczy się do oceny struktury'

const areaBase = measureIndicator({
  id: 'area',
  label: 'Powierzchnia siedliska na stanowisku',
  parameter: 'area',
  description:
    'Zmiana powierzchni siedliska (lustra wody jeziora lub zbiornika dystroficznego) w porównaniu z wcześniejszymi badaniami albo danymi z literatury.',
  help: `Co wybrać: jak zmieniła się powierzchnia zbiornika (lustra wody) od poprzedniego badania – z pomiaru GPS, ortofotomapy, map archiwalnych albo literatury. Możesz też wpisać zmianę w procentach – wtedy ona decyduje o podpowiedzi.

Progi (tab. 2): nie zmienia się o więcej niż 10% albo rośnie – FV; spadek o więcej niż 10%, ale mniej niż 30% – U1; spadek o 30% lub więcej – U2. „Brak danych” daje XX.

Dlaczego: jeziora dystroficzne to zwykle bardzo małe zbiorniki (często poniżej 5 ha, czasem kilkaset m²) wśród torfowisk. Zarastanie pła i wypłycanie, często przyspieszone przez odwodnienie torfowiska, potrafi w kilka lat zmniejszyć lustro wody – a jezioro „w stanie całkowitego zarośnięcia” przestaje być siedliskiem 3160.`,
  thresholds: {
    FV: 'Nie podlega zmianom większym niż 10% lub zwiększa się',
    U1: 'Spadek powierzchni siedliska większy niż 10%, a mniejszy niż 30%',
    U2: 'Wyraźny spadek powierzchni siedliska (30% lub więcej) w porównaniu z wcześniejszymi badaniami lub danymi z literatury',
  },
  field: {
    name: 'changePct',
    label: 'Zmiana powierzchni (opcjonalnie)',
    unit: '%',
    min: -100,
    help: 'Zmiana powierzchni względem poprzedniego badania w procentach: spadek ze znakiem minus (np. −15), wzrost bez znaku. Opcjonalne – ma pierwszeństwo przed wyborem z listy.',
  },
  grade: gradeAreaChange3160,
  options: AREA_OPTIONS,
  inputLabel: 'Powierzchnia siedliska',
})

const characteristicBase = choiceIndicator({
  id: 'characteristic',
  label: 'Gatunki charakterystyczne',
  cardinal: true,
  description:
    'Występowanie gatunków charakterystycznych w obrębie wybranego (reprezentatywnego) transektu: torfowce wodne, pływacze, jeżogłówka najmniejsza, grzybienie, grążele, rdestnica pływająca i inne. Możliwy jest całkowity brak roślin przy stanie właściwym.',
  help: `Co wpisać: w spisie poniżej gatunki charakterystyczne stwierdzone w transekcie (w obrębie lustra wody, nie na ple torfowiskowym) z udziałem powierzchni, np. „<60%” (z dokładnością do 10%). Mszaków nie trzeba oznaczać do gatunku – wystarczy „Sphagnum sp.”. Potem wybierz ocenę z listy.

Typowe: torfowce w formie wodnej (Sphagnum denticulatum, S. cuspidatum, S. inundatum, S. fallax), pływacze (Utricularia minor, U. intermedia, U. australis, U. ochroleuca), jeżogłówka najmniejsza Sparganium minimum, grzybienie białe i północne (Nymphaea alba, N. candida, N. ×borealis), grążel drobny i żółty, rdestnica pływająca i trawiasta, Warnstorfia fluitans i W. exannulata, Scorpidium scorpioides.

Brak roślin: w wielu jeziorach dystroficznych roślinności podwodnej nie ma wcale – i to może być stan właściwy (FV). Wskaźnik obniża się tylko wtedy, gdy brak roślin wynika z degeneracji: bardzo silne zabarwienie wody, zakwity fitoplanktonu, wapnowanie, silne zakwaszenie. Jeśli wcześniej nie notowano roślin, ich brak nie zmienia oceny. Gdy nie wiadomo, czy brak to degeneracja, czy specyfika zbiornika, a nie ma wcześniejszych badań – ocena nie powinna obniżać oceny ogólnej, jeśli pozostałe wskaźniki (z pomocniczymi) wskazują FV.

Porównanie z poprzednim badaniem: spadek liczby gatunków i zajętej powierzchni mniejszy niż 20% – U1, znaczący zanik albo spadek powyżej 20% – U2. Przy pierwszym badaniu opisz występowanie gatunków dokładnie – to punkt odniesienia na następne lata.

Wskaźnik kardynalny.`,
  options: CHARACTERISTIC_OPTIONS,
  inputLabel: 'Gatunki charakterystyczne – ocena',
  thresholds: {
    FV: 'Liczba gatunków i zajęta przez nie powierzchnia bez zmian lub większa w porównaniu do badań wcześniejszych; możliwy całkowity brak roślin, jeśli to stan naturalny',
    U1: 'Spadek liczby gatunków i zajętej przez nie powierzchni mniejszy niż 20% (jeśli wcześniej nie notowano roślin, brak gatunków nie zmienia oceny – FV)',
    U2: 'Znaczący zanik gatunków lub spadek zajętej powierzchni powyżej 20% (jeśli wcześniej nie notowano roślin, brak gatunków nie zmienia oceny – FV)',
  },
})

const indicators: IndicatorDef[] = [
  {
    ...areaBase,
    describe: (i) => {
      const v = num(i.changePct)
      if (v === undefined) return labelOf(AREA_OPTIONS, i.choice)
      return v === 0 ? 'Bez zmian (0%)' : `${v > 0 ? 'Wzrost' : 'Spadek'} o ${plNum(Math.abs(v))}%`
    },
  },
  {
    ...characteristicBase,
    inputs: [
      {
        kind: 'table',
        name: 'species',
        label: 'Gatunki charakterystyczne w transekcie',
        addLabel: 'Dodaj gatunek',
        rowLabel: 'Gatunek',
        help: 'Jeden wiersz = jeden gatunek z udziałem powierzchni transektu, jak w karcie papierowej („<60%”, „<5%”). Spis jest opcjonalny – przy braku roślin zostaw pusty i wybierz odpowiednią ocenę.',
        columns: [
          { kind: 'text', name: 'species', label: 'Gatunek', placeholder: 'np. Potamogeton natans', required: true, help: 'Nazwa naukowa (można dopisać polską w nawiasie). Mszaki – wystarczy rodzaj, np. Sphagnum sp.' },
          { kind: 'text', name: 'share', label: 'Udział powierzchni', placeholder: 'np. <60%', help: 'Procent powierzchni transektu zajęty przez gatunek, z dokładnością do 10%, np. „<5%”, „30%”.' },
        ],
      },
      ...characteristicBase.inputs,
    ],
    explain: (i) => {
      const rows = speciesShares(i.species)
      if (!rows.length) return null
      const known = rows.filter((r) => isCharacteristic(r.name)).length
      return `W spisie: ${rows.length} (z katalogu gatunków charakterystycznych: ${known}).`
    },
    warn: (i, ctx) => {
      const rows = speciesShares(i.species)
      if ((i.choice === 'noneNatural' || i.choice === 'noneDoubt') && rows.length)
        return `W spisie są gatunki (${rows.map((r) => r.name).join(', ')}), a wybrano „Brak roślin”.`
      if (i.choice === 'noneDoubt') {
        const worseOnes = Object.entries(ctx?.indicators ?? {})
          .filter(([id, v]) => id !== 'characteristic' && id !== 'area' && v.grade && v.grade !== 'FV' && v.grade !== 'XX')
          .map(([id]) => id)
        if (worseOnes.length)
          return 'Wątpliwość „degeneracja czy specyfika” rozstrzyga się na FV tylko wtedy, gdy pozostałe wskaźniki wskazują stan właściwy – a tu nie wszystkie są FV. Rozważ obniżenie oceny.'
      }
      return null
    },
    describe: (i) => describeShares(speciesShares(i.species)) || labelOf(CHARACTERISTIC_OPTIONS, i.choice),
  },
  {
    ...measureIndicator({
      id: 'expansive',
      label: 'Rodzime gatunki ekspansywne',
      cardinal: true,
      description:
        'Stopień zajęcia powierzchni siedliska (transektu albo całego zbiornika) przez rodzime gatunki ekspansywne: rogatek sztywny, w strefie brzegowej trzcina, w jeziorach zaburzonych hydrologicznie podwodna forma Warnstorfia exannulata.',
      help: `Co wpisać: łączny procent powierzchni transektu (albo całego zbiornika – w tym samym zakresie co poprzednio) zajęty przez rodzime gatunki ekspansywne, i ich nazwy. Brak – wpisz 0.

Za ekspansywne w jeziorach dystroficznych uznaje się rogatek sztywny Ceratophyllum demersum i – w niektórych przypadkach, w strefie brzegowej – trzcinę pospolitą Phragmites australis. Wkraczanie gatunków ekspansywnych to najczęściej objaw eutrofizacji. W jeziorach z zaburzeniami hydrologicznymi (spada pH, rośnie zabarwienie) ekspanduje podwodna forma warnstorfii bezpierścieniowej Warnstorfia exannulata, a inne rośliny wodne zanikają.

Progi: brak – FV, do 5% powierzchni – U1, powyżej 5% – U2. Wskaźnik kardynalny.`,
      thresholds: { FV: 'Brak gatunków ekspansywnych', U1: 'Gatunki ekspansywne zajmują do 5% powierzchni', U2: 'Gatunki ekspansywne zajmują powyżej 5% powierzchni' },
      field: { label: 'Pokrycie gatunków ekspansywnych', unit: '%', max: 100, help: 'Łączny procent powierzchni transektu (zbiornika) zajęty przez gatunki ekspansywne. Brak – 0.' },
      grade: gradeExpansive3160,
    }),
    inputs: [
      { kind: 'number', name: 'value', label: 'Pokrycie gatunków ekspansywnych', unit: '%', min: 0, max: 100, required: true, help: 'Łączny procent powierzchni transektu (zbiornika) zajęty przez gatunki ekspansywne. Brak – 0.' },
      {
        kind: 'text',
        name: 'species',
        label: 'Gatunki ekspansywne (opcjonalnie)',
        placeholder: 'np. Ceratophyllum demersum 3%',
        help: 'Lista gatunków z udziałem, np. „Ceratophyllum demersum 3%, Phragmites australis 2%”. Trafia do opisu wskaźnika.',
      },
    ],
    explain: (i) => {
      const names = String(i.species ?? '').trim()
      return names && num(i.value) === 0 ? 'Wpisano gatunki ekspansywne, ale pokrycie 0% – sprawdź.' : null
    },
    describe: (i) => {
      const v = num(i.value)
      const names = String(i.species ?? '').trim()
      if (v === undefined) return names
      if (v === 0) return names ? `Brak (${names})` : 'Brak'
      return names ? `${names}; łącznie ${plNum(v)}%` : `${plNum(v)}%`
    },
  },
  {
    ...choiceIndicator({
      id: 'invasive',
      label: 'Obce gatunki inwazyjne',
      cardinal: true,
      description:
        'Występowanie gatunków obcych geograficznie. Dotychczas notowano sporadycznie moczarkę kanadyjską (Elodea canadensis) – jej obecność się odnotowuje, ale nie obniża oceny.',
      help: `Co wybrać: czy w transekcie (albo w całym zbiorniku – w tym samym zakresie co poprzednio) rosną obce gatunki inwazyjne i jak licznie. Nazwy wpisz w polu niżej.

Moczarka kanadyjska Elodea canadensis: ze względu na długą już obecność w Polsce jej stwierdzenie nie obniża oceny – ale trzeba ją odnotować. W monitoringu 2016 moczarka obniżyła jednak „specyficzną strukturę” na jednym obszarze (Uroczyska Puszczy Drawskiej), gdy była liczna – oceniający może ją wziąć pod uwagę w opisie i uzasadnieniu. W 2016 r. notowano też inwazyjny mech krzywoszczeć przywłokę Campylopus introflexus (Diabelski Staw, w sąsiednich kulturach sosnowych).

Progi: brak (poza moczarką) – FV, pojedyncze osobniki – U1, liczne – U2. Wskaźnik kardynalny.`,
      options: INVASIVE_OPTIONS,
      inputLabel: 'Obce gatunki inwazyjne',
      after: [
        {
          kind: 'text',
          name: 'species',
          label: 'Stwierdzone gatunki (opcjonalnie)',
          placeholder: 'np. Elodea canadensis – pojedynczo',
          help: 'Nazwy obcych gatunków i ich liczebność, także moczarki kanadyjskiej (która oceny nie obniża). Trafia do opisu wskaźnika.',
        },
      ],
    }),
    warn: (i) => {
      const text = String(i.species ?? '')
      const other = SPECIES_3160.filter((s) => s.group === 'invasive' && s.latin !== 'Elodea canadensis').find((s) =>
        text.toLowerCase().includes(s.latin.toLowerCase()),
      )
      return i.choice === 'none' && other ? `Wpisano ${other.latin} (obcy gatunek inwazyjny inny niż moczarka kanadyjska), a wybrano „Brak”.` : null
    },
    describe: (i) => {
      const text = String(i.species ?? '').trim()
      const head = i.choice === 'none' ? 'Brak' : labelOf(INVASIVE_OPTIONS, i.choice)
      return [head, text].filter(Boolean).join('; ')
    },
  },
  {
    id: 'colour',
    label: 'Barwa wody',
    parameter: 'structure',
    cardinal: true,
    description:
      'Optyczny kolor wody w najgłębszym punkcie zbiornika. W wodach dystroficznych barwa od lekko żółtawej do brązowej jest naturalna (związki humusowe); zielona albo z dużą ilością zawiesiny – nie.',
    help: `Co wpisać: barwę w mg Pt/dm³ (skala platynowo-kobaltowa, kolorymetr albo laboratorium) – albo, gdy jej nie mierzysz, wybierz opis z listy. Liczba ma pierwszeństwo.

Progi (tab. 2): <50 mg Pt/dm³ (albo brązowa, klarowna lub o niewielkiej mętności) – FV; 51–100 mg Pt/dm³ (albo ciemnobrunatna) – U1; >101 mg Pt/dm³ (albo zielona, albo ciemnobrunatna z dużą ilością zawiesiny) – U2. Luki w tabeli: 50–51 formularz liczy jako FV, 100–101 jako U1 (interpretacja).

Uwaga: w 2011 r. Jezioro Konopniak dostało za barwę U2, ale ekspert i koordynator zostawili FV dla struktury, bo pozostałe wskaźniki były właściwe – barwa bywa naturalnie wysoka. Przy takiej rozbieżności uzasadnij ocenę w opisie.

Dlaczego: zabarwienie zależy od związków humusowych z torfowiska. Bardzo silne, brunatne zabarwienie to często skutek dopływu wód z przesuszonych lub zmeliorowanych torfowisk – i ogranicza światło dla roślin. Zielona barwa to fitoplankton, czyli eutrofizacja. Wskaźnik kardynalny.

${MEASURE_POINT}`,
    thresholds: {
      FV: '<50 mg Pt/dm³ (lub barwa wody brązowa, klarowna lub o niewielkiej mętności)',
      U1: '51–100 mg Pt/dm³ (lub ciemnobrunatna)',
      U2: '>101 mg Pt/dm³ (lub zabarwienie zielone, lub ciemnobrunatne z dużą ilością zawiesiny)',
    },
    inputs: [
      { kind: 'number', name: 'value', label: 'Barwa wody', unit: 'mg Pt/dm³', min: 0, help: 'Barwa w mg Pt/dm³. Opcjonalne, gdy wybierasz opis z listy niżej – liczba ma pierwszeństwo.' },
      {
        kind: 'select',
        name: 'visual',
        label: 'Barwa – ocena wizualna (gdy brak pomiaru)',
        options: COLOUR_OPTIONS.map(({ value, label }) => ({ value, label })),
        help: `Opis barwy, gdy nie masz pomiaru w mg Pt/dm³:\n${COLOUR_OPTIONS.map((o) => `• ${o.label} – ${o.grade}`).join('\n')}`,
      },
    ],
    suggest: (i) => {
      const v = num(i.value)
      if (v !== undefined) return gradeColour3160(v)
      return gradeMap(COLOUR_OPTIONS)[String(i.visual ?? '')] ?? null
    },
    warn: (i) => {
      const v = num(i.value)
      const vis = gradeMap(COLOUR_OPTIONS)[String(i.visual ?? '')]
      if (v === undefined || !vis) return null
      return vis !== gradeColour3160(v) ? `Pomiar ${plNum(v)} mg Pt/dm³ to ${gradeColour3160(v)}, a opis wizualny – ${vis}. Podpowiedź idzie z pomiaru.` : null
    },
    describe: (i) => {
      const v = num(i.value)
      return v !== undefined ? `${plNum(v)} mg Pt/dm³` : labelOf(COLOUR_OPTIONS, i.visual)
    },
  },
  {
    id: 'ph',
    label: 'Odczyn wody',
    parameter: 'structure',
    cardinal: true,
    description:
      'pH wody w strefie otwartej toni (pH-metr). Właściwy zakres pH 3–7, bez istotnych zmian w porównaniu z wcześniejszymi wynikami. Zbyt duża wartość (>7) świadczy o silnych negatywnych procesach.',
    help: `Co wpisać: pH zmierzone sondą w najgłębszym punkcie zbiornika. Jeśli masz wynik z poprzedniego badania – wpisz go, formularz policzy zmianę.

Progi (tab. 2): pH 3–7 i bez istotnych zmian – FV; pH 7–8 albo 2–3, albo niekorzystna zmiana o mniej niż 0,5 – U1; pH >8 albo <2, albo niekorzystna zmiana o 0,5 lub więcej – U2.
Niekorzystny kierunek: w jeziorach bez roślinności podwodnej – wzrost pH; w jeziorach makrofitowych – spadek (dopuszczalny nieznaczny wzrost).
${lakeTypeNote('jezioro makrofitowe: niekorzystny spadek pH')}

pH wchodzi też do wzoru HDI (D3 = (9,5 − pH) · 20).

Dlaczego: woda jezior dystroficznych jest kwaśna (zwykle pH 3,0–6,5, do 7,0) przez kwasy humusowe. Wzrost pH to np. wapnowanie albo dopływ wód mineralnych; w jeziorach makrofitowych spadek pH wraz z ciemnieniem wody to objaw zaburzeń hydrologicznych (humizacji). Wskaźnik kardynalny.

${MEASURE_POINT}`,
    thresholds: {
      FV: 'Bez istotnych zmian w porównaniu z wcześniejszymi wynikami (w jeziorach makrofitowych dopuszczalny nieznaczny wzrost); pH 3–7',
      U1: 'Wzrost mniej niż o 0,5 jednostki pH (w jeziorach makrofitowych spadek mniej niż o 0,5); pH 7–8 lub 2–3',
      U2: 'Wzrost więcej niż o 0,5 jednostki pH (w jeziorach makrofitowych spadek więcej niż o 0,5); pH >8 lub <2',
    },
    inputs: [
      { kind: 'number', name: 'value', label: 'Odczyn wody', unit: 'pH', min: 0, max: 14, required: true, help: 'pH wody z warstwy 0,5–1 m w najgłębszym punkcie, np. 4,9.' },
      ...changeFields(PH_CHANGE, 'pH w poprzednim badaniu (opcjonalnie)'),
    ],
    suggest: (i, ctx) => {
      const v = num(i.value)
      return v === undefined ? null : worse(gradePH3160(v), changeGrade(i, v, PH_CHANGE, ctx))
    },
    explain: (i, ctx) => changeExplain(i, num(i.value), PH_CHANGE, ctx),
    warn: (i, ctx) => changeWarn(i, num(i.value), PH_CHANGE, ctx),
    describe: (i) => {
      const v = num(i.value)
      return v === undefined ? '' : `pH ${plNum(v)}`
    },
  },
  {
    id: 'conductivity',
    label: 'Konduktywność (przewodnictwo elektrolityczne)',
    parameter: 'structure',
    cardinal: true,
    description:
      'Przewodnictwo elektrolityczne wody (konduktometr) – miara zawartości jonów. Wody dystroficzne mają niskie przewodnictwo, ogólnie poniżej 100 µS/cm; wzrost świadczy o dopływie zanieczyszczeń.',
    help: `Co wpisać: przewodnictwo w µS/cm, z warstwy 0,5–1 m w najgłębszym punkcie zbiornika. Wynik z poprzedniego badania – opcjonalnie, do policzenia zmiany.

Progi (tab. 2): ogólna wartość <100 µS/cm i bez istotnych zmian – FV; 100–500 µS/cm albo wzrost o mniej niż 20 µS/cm (w jeziorach makrofitowych o mniej niż 50) – U1; >500 µS/cm albo wzrost o 20 µS/cm lub więcej (w makrofitowych o 50 lub więcej) – U2. W jeziorach makrofitowych „lekki wzrost” mieści się jeszcze w FV – to rozstrzygasz w polu „Zmiana”.
${lakeTypeNote('jezioro makrofitowe: próg wzrostu 50 zamiast 20 µS/cm')}

Przewodnictwo wchodzi też do wzoru HDI (D1 = 100 / log EC).

Dlaczego: na przewodnictwo wpływają gazy z powietrza (CO₂, NH₃) i zanieczyszczenia antropogeniczne – ścieki, spływy z pól z nawozami. Wskaźnik kardynalny.

${MEASURE_POINT}`,
    thresholds: {
      FV: 'Bez istotnych zmian (w jeziorach makrofitowych bez zmian lub lekki wzrost); ogólna wartość poniżej 100 µS/cm',
      U1: 'Wzrost wartości mniejszy niż o 20 µS/cm (w jeziorach makrofitowych mniejszy niż o 50 µS/cm); ogólna wartość 100–500 µS/cm',
      U2: 'Wzrost wartości większy niż 20 µS/cm (w jeziorach makrofitowych więcej niż o 50 µS/cm); ogólna wartość powyżej 500 µS/cm',
    },
    inputs: [
      { kind: 'number', name: 'value', label: 'Przewodnictwo elektrolityczne', unit: 'µS/cm', min: 0, required: true, help: 'Przewodnictwo w µS/cm z konduktometru, np. 19.' },
      ...changeFields(EC_CHANGE, 'Przewodnictwo w poprzednim badaniu (opcjonalnie)'),
    ],
    suggest: (i, ctx) => {
      const v = num(i.value)
      return v === undefined ? null : worse(gradeConductivity3160(v), changeGrade(i, v, EC_CHANGE, ctx))
    },
    explain: (i, ctx) => changeExplain(i, num(i.value), EC_CHANGE, ctx),
    warn: (i, ctx) => {
      const v = num(i.value)
      if (v !== undefined && v > 2000) return 'Ponad 2000 µS/cm w jeziorze dystroficznym? Sprawdź jednostkę (µS/cm, nie mS/m).'
      return changeWarn(i, v, EC_CHANGE, ctx)
    },
    describe: (i) => {
      const v = num(i.value)
      return v === undefined ? '' : `${plNum(v)} µS/cm`
    },
  },
  {
    ...choiceIndicator({
      id: 'drainage',
      label: 'Melioracje',
      cardinal: true,
      description:
        'Ingerencja w warunki hydrologiczne: rowy odwadniające i inna infrastruktura melioracyjna dochodząca do zbiornika i na otaczającym torfowisku. Jeden z ważniejszych wskaźników stanu siedliska.',
      help: `Co wybrać: obejdź zbiornik i otaczające torfowisko. Policz rowy melioracyjne dochodzące do jeziora, oceń ilość niesionej wody, głębokość, wizualny stopień jej zabarwienia i czy są połączone hydrologicznie ze zbiornikiem. Rozpatrz cały system melioracyjny torfowiska i bezpośredniego otoczenia oraz jego bieżący wpływ.

Progi (tab. 2): brak rowów i infrastruktury melioracyjnej, albo infrastruktura w wystarczającym stopniu „zneutralizowana” działaniami ochronnymi (zasypane rowy, zastawki), brak realnych zagrożeń – FV; sieć rowów w niewielkim stopniu oddziałuje na warunki wodne – U1; istniejąca infrastruktura wyraźnie pogarsza warunki wodne – U2.

Dlaczego: rowy odwadniają torfowisko i obniżają lustro wody, a wody z meliorowanych torfowisk nadmiernie zabarwiają i zakwaszają jezioro – to prosta droga do degradacji 3160. Wskaźnik kardynalny.`,
      options: DRAINAGE_OPTIONS,
      inputLabel: 'Melioracje',
      thresholds: {
        FV: 'Brak sieci rowów i kanałów melioracyjnych oraz innych elementów infrastruktury melioracyjnej bądź infrastruktura w wystarczającym stopniu „zneutralizowana” działaniami ochronnymi; brak realnych zagrożeń teraz i w przyszłości',
        U1: 'Sieć rowów melioracyjnych oraz innych elementów infrastruktury w niewielkim stopniu oddziałuje na warunki wodne zbiorników',
        U2: 'Istniejąca infrastruktura melioracyjna wyraźnie pogarsza warunki wodne',
      },
      after: [
        { kind: 'number', name: 'ditches', label: 'Liczba rowów dochodzących do zbiornika (opcjonalnie)', unit: 'szt.', min: 0, help: 'Ile rowów odwadniających jest w bezpośrednim sąsiedztwie zbiornika. Brak – 0.' },
        { kind: 'select', name: 'connected', label: 'Rowy połączone hydrologicznie ze zbiornikiem? (opcjonalnie)', options: YES_NO, help: 'Czy któryś z rowów odprowadza wodę ze zbiornika albo do niego.' },
      ],
    }),
    warn: (i) => {
      const n = num(i.ditches)
      return i.choice === 'none' && n !== undefined && n > 0 && i.connected === 'yes'
        ? `Wpisano ${n} rowów połączonych ze zbiornikiem, a wybrano „Brak”. FV jest możliwe tylko, gdy rowy są zneutralizowane (zasypane, z zastawkami) – opisz to.`
        : null
    },
    describe: (i) => {
      const head = DRAINAGE_SHORT[String(i.choice ?? '')] ?? ''
      const n = num(i.ditches)
      const extra = [
        n !== undefined && n > 0 ? `rowów: ${n}` : '',
        n !== undefined && n > 0 && i.connected ? (i.connected === 'yes' ? 'połączone ze zbiornikiem' : 'niepołączone ze zbiornikiem') : '',
      ].filter(Boolean)
      return [head, extra.join(', ')].filter(Boolean).join('; ')
    },
  },
  {
    id: 'hdi',
    label: 'Wskaźnik hydrochemiczny HDI',
    parameter: 'structure',
    cardinal: true,
    excluded: hdiExcluded,
    excludedNote: 'nie oznaczono DOC/DIC – nie liczy się do oceny struktury',
    description:
      'Hydrochemical Dystrophy Index (Górniak 2005, 2006) – stan zaawansowania dystrofizacji, liczony z pH, przewodnictwa i stosunku DOC/DIC. Podstawa zaklasyfikowania zbiornika jako dystroficznego: HDI powyżej 50.',
    help: `Co wpisać: rozpuszczony węgiel organiczny (DOC, RWO) i nieorganiczny (DIC, RWN) w mg C/dm³ z próbki wody – wynik laboratorium. pH i przewodnictwo formularz bierze z wskaźników „Odczyn wody” i „Konduktywność”. Jeśli laboratorium podało gotowy HDI, wpisz go w ostatnim polu – ma pierwszeństwo.

Wzór: HDI = ∛(D1 · D2 · D3) (średnia geometryczna), gdzie D1 = 100 / log EC, D2 = 10 · DOC/DIC, D3 = (9,5 − pH) · 20.

Progi (tab. 2): HDI >50 – FV; 40–50 – U1; <40 – U2 (wyraźny brak procesu dystrofizacji). Granicę 50 przyjmuje się umownie między jeziorem dystroficznym a innymi jeziorami humusowymi (np. alloiotroficznymi, humotroficznymi).

Gdy DOC/DIC nie oznaczono: ustaw w zakładce Stanowisko „Oznaczenie DOC/DIC” na „Nie” – wskaźnik zostaje w karcie (ocena XX, opis „Nie oznaczono”), ale nie liczy się do oceny struktury. Tak było w monitoringu 2011 (HDI nieoceniany) i w części stanowisk w 2016 (21% bez HDI).

Próbka: z warstwy 0,5–1 m w najgłębszym punkcie, do zakręcanego pojemnika ok. 200 cm³, do późniejszej analizy węgla.`,
    thresholds: { FV: '>50', U1: '40–50', U2: '<40 (wyraźny brak procesu dystrofizacji)' },
    inputs: [
      { kind: 'number', name: 'doc', label: 'DOC – rozpuszczony węgiel organiczny', unit: 'mg C/dm³', min: 0, help: 'Rozpuszczony węgiel organiczny (RWO) – wynik laboratorium w mg C/dm³.' },
      { kind: 'number', name: 'dic', label: 'DIC – rozpuszczony węgiel nieorganiczny', unit: 'mg C/dm³', min: 0, help: 'Wynik laboratorium w mg C/dm³. Musi być większy od zera.' },
      { kind: 'number', name: 'hdi', label: 'HDI z laboratorium (opcjonalnie)', min: 0, help: 'Gotowa wartość HDI, jeśli laboratorium ją policzyło. Ma pierwszeństwo przed wyliczeniem z DOC/DIC.' },
    ],
    suggest: (i, ctx) => {
      const { hdi } = hdiOf(i, ctx)
      return hdi === undefined ? null : gradeHDI3160(hdi)
    },
    explain: (i, ctx) => {
      const { parts, typed, hdi } = hdiOf(i, ctx)
      if (typed && hdi !== undefined) return `HDI wpisany z laboratorium: ${plNum(r1(hdi))}.`
      if (parts)
        return `D1 = 100/log ${plNum(ecOf(ctx)!)} = ${plNum(r1(parts.d1))}; D2 = 10·${plNum(num(i.doc)!)}/${plNum(num(i.dic)!)} = ${plNum(r1(parts.d2))}; D3 = (9,5 − ${plNum(phOf(ctx)!)})·20 = ${plNum(r1(parts.d3))} → HDI = ${plNum(r1(parts.hdi))}.`
      if (num(i.doc) !== undefined && num(i.dic) !== undefined) {
        if (phOf(ctx) === undefined || ecOf(ctx) === undefined) return 'Do wyliczenia HDI brakuje pH albo przewodnictwa – uzupełnij wskaźniki „Odczyn wody” i „Konduktywność”.'
        return 'Wzoru nie da się policzyć: potrzeba przewodnictwa > 1 µS/cm, DIC > 0 i pH < 9,5.'
      }
      return null
    },
    warn: (i, ctx) => {
      const { hdi } = hdiOf(i, ctx)
      if (hdiExcluded({ site: ctx?.site ?? {} }) && hdi !== undefined) return 'Wpisano dane do HDI, a w zakładce Stanowisko „Oznaczenie DOC/DIC” jest „Nie” – wskaźnik nie liczy się do oceny.'
      return hdi !== undefined && hdi <= 50 ? 'HDI ≤ 50 – zbiornik może nie być dystroficzny (granica umowna 50). Sprawdź, czy stanowisko na pewno należy do 3160.' : null
    },
    describe: (i, ctx) => {
      const { hdi, parts } = hdiOf(i, ctx)
      if (hdi === undefined) return hdiExcluded({ site: ctx?.site ?? {} }) ? 'Nie oznaczono (brak DOC/DIC)' : ''
      return parts ? `HDI ${plNum(r1(hdi))} (DOC ${plNum(num(i.doc)!)}, DIC ${plNum(num(i.dic)!)} mg C/dm³)` : `HDI ${plNum(r1(hdi))}`
    },
  },
  {
    id: 'secchi',
    label: 'Przezroczystość wody',
    parameter: 'structure',
    description:
      'Widzialność krążka Secchiego w najgłębszym, centralnym punkcie zbiornika. Mała przezroczystość szkodzi roślinom podwodnym i bywa efektem rozwoju fitoplanktonu albo zawiesiny. Wskaźnik pomocniczy.',
    help: `Co wpisać: głębokość, na której biały krążek Secchiego (20–30 cm) przestaje być widoczny, w metrach. Jeśli krążek widać na dnie – zaznacz „do dna” (albo wpisz głębokość maksymalną w zakładce Stanowisko, formularz porówna sam).

Progi (tab. 2): bez istotnych zmian, >1,5 m w zbiornikach głębokich albo przezroczystość do dna w płytkich – FV; spadek o mniej niż 20% albo 0,5–1,5 m w zbiornikach głębokich – U1; spadek o 20% lub więcej albo wartość niższa od 0,5 m – U2. Przy przezroczystości do dna zmiana się nie liczy – widzialność ogranicza wtedy dno, nie woda (interpretacja).
${lakeTypeNote('dotyczy wszystkich typów jezior jednakowo')}

Wskaźnik pomocniczy (dodatkowy): nie jest kardynalny, więc U1 nie obniża struktury; U2 nie pozwala na FV (zasada silnika dla wskaźników niekardynalnych). W monitoringu 2016 oceniany obok wskaźników kardynalnych.`,
    thresholds: {
      FV: 'Bez istotnych zmian w porównaniu z wcześniejszymi wynikami lub wartość większa niż 1,5 m w zbiornikach głębokich, lub przezroczystość do dna w zbiornikach płytkich',
      U1: 'Spadek wartości poniżej 20% w porównaniu z wcześniejszymi wynikami lub 0,5–1,5 m w zbiornikach głębokich',
      U2: 'Spadek wartości więcej niż 20% w porównaniu z wcześniejszymi wynikami lub wartość niższa od 0,5 m',
    },
    inputs: [
      { kind: 'number', name: 'value', label: 'Widzialność krążka Secchiego', unit: 'm', min: 0, required: true, help: 'Głębokość zniknięcia krążka w metrach, np. 2,1.' },
      { kind: 'select', name: 'toBottom', label: 'Widoczny do dna?', options: YES_NO, help: 'Tak – krążek widać na dnie (zbiornik płytki). Puste – formularz porówna widzialność z głębokością maksymalną ze Stanowiska.' },
      ...changeFields(SECCHI_CHANGE, 'Widzialność w poprzednim badaniu (opcjonalnie)'),
    ],
    suggest: (i, ctx) => {
      const v = num(i.value)
      if (v === undefined) return null
      const bottom = toBottom(i, ctx)
      return bottom ? 'FV' : worse(gradeSecchi3160(v, false), changeGrade(i, v, SECCHI_CHANGE, ctx))
    },
    explain: (i, ctx) => {
      const v = num(i.value)
      const depth = num(ctx?.site?.maxDepth)
      if (v !== undefined && i.toBottom !== 'yes' && i.toBottom !== 'no' && depth !== undefined && v >= depth)
        return `Widzialność ${plNum(v)} m ≥ głębokość maksymalna ${plNum(depth)} m – przezroczystość do dna.`
      return toBottom(i, ctx) ? null : changeExplain(i, v, SECCHI_CHANGE, ctx)
    },
    warn: (i, ctx) => {
      const v = num(i.value)
      const depth = num(ctx?.site?.maxDepth)
      if (v !== undefined && depth !== undefined && v > depth + 0.05) return `Widzialność ${plNum(v)} m większa niż głębokość maksymalna ${plNum(depth)} m – sprawdź.`
      return toBottom(i, ctx) ? null : changeWarn(i, v, SECCHI_CHANGE, ctx)
    },
    describe: (i, ctx) => {
      const v = num(i.value)
      return v === undefined ? '' : `${plNum(v)} m${toBottom(i, ctx) ? ' (do dna)' : ''}`
    },
  },
  {
    ...choiceIndicator({
      id: 'plankton',
      label: 'Plankton',
      description:
        'Skład planktonu (grupy i udział procentowy) w próbie z centralnej części zbiornika – element szybko reagujący na zmiany troficzne. Szczególnie przydatny w jeziorach bez roślin wyższych. Wskaźnik pomocniczy.',
      help: `Co wybrać: obraz fitoplanktonu w próbie z siatki planktonowej (oczka ≤20 µm), z warstwy 0,5–1 m w centralnej części zbiornika, utrwalonej płynem Lugola (po 3–5 dniach formaldehydem). Analiza w co najmniej 20 polach widzenia mikroskopu; wystarczą grupy i ich udział, bez oznaczania do gatunku. Bez siatki – metoda sedymentacji (Starmach 1989). Gatunki dominujące wpisz w polu niżej.

Progi (tab. 2): dominacja miksotrofów, możliwa dominacja sprzężnic, ubóstwo okrzemek, gatunki acydofilne – FV; duże zróżnicowanie fitoplanktonu, masowa obecność Gonyostomum semen – U1; gatunki wód eutroficznych, widoczne zakwity sinicowe – U2. Zakwit sinic, dominacja sinic albo liczne okrzemki to wyraźne pogorszenie warunków.

Uwaga: w przykładowej karcie z przewodnika (Jezioro Kuźniczek, 2011) Gonyostomum semen jest pierwszym z dominantów, a wskaźnik ma FV – „masowa obecność” to więcej niż dominacja w próbie. Oceniaj całość obrazu.

Wskaźnik pomocniczy: wypełnia się go i eksportuje, ale nie liczy do oceny struktury – w monitoringu 2016 „jako pomocniczy nie podlegał ocenie”, a sprawozdanie 2011 postulowało, by nie obniżał oceny jezior podlaskich z naturalnie bogatym planktonem.`,
      options: PLANKTON_OPTIONS,
      inputLabel: 'Plankton',
      after: [
        {
          kind: 'textarea',
          name: 'dominants',
          label: 'Gatunki dominujące (opcjonalnie)',
          rows: 2,
          placeholder: 'np. Gonyostomum semen, Peridinium inconspicuum, Dinobryon sociale',
          help: 'Nazwy łacińskie gatunków (albo grup) dominujących w próbie, ewentualnie z udziałem procentowym. Trafia do opisu wskaźnika.',
        },
      ],
    }),
    excluded: true,
    excludedNote: AUX_NOTE,
    describe: (i) => {
      const d = String(i.dominants ?? '').trim()
      return d ? `Gatunki dominujące: ${d}` : labelOf(PLANKTON_OPTIONS, i.choice)
    },
  },
  {
    id: 'tds',
    label: 'TDS (całkowita zawartość substancji rozpuszczonych)',
    parameter: 'structure',
    excluded: true,
    excludedNote: AUX_NOTE,
    description:
      'Total dissolved solids – całość substancji rozpuszczonych w wodzie (sonda). Wysoki poziom może oznaczać zanieczyszczenia. Wskaźnik pomocniczy.',
    help: `Co wpisać: TDS w mg/dm³ z sondy, z warstwy 0,5–1 m w najgłębszym punkcie. Wynik z poprzedniego badania – opcjonalnie.

Progi (tab. 2): przy pierwszym badaniu – <60 mg/dm³ FV, 60–100 U1, >100 U2. Przy kolejnym – liczy się zmiana: bez istotnych zmian albo spadek – FV; wzrost o mniej niż 20% (w jeziorach makrofitowych o mniej niż 50%) – U1; wzrost o 20% lub więcej (w makrofitowych o 50% lub więcej) – U2. Tu, inaczej niż przy pH, tab. 2 wprost mówi, że wartość bezwzględna obowiązuje tylko przy pierwszym badaniu.

Wskaźnik pomocniczy: nie liczy się do oceny struktury (monitoring 2016: „jako pomocniczy nie podlegał ocenie”). Sprawozdanie 2016–2018 proponuje go usunąć z metodyki – dubluje informację z barwy i przezroczystości.

${MEASURE_POINT}`,
    thresholds: {
      FV: 'Bez istotnych zmian lub spadek wartości (w jeziorach makrofitowych bez zmian lub lekki wzrost); przy pierwszym badaniu poniżej 60 mg/dm³',
      U1: 'Wzrost wartości mniej niż 20% (w jeziorach makrofitowych mniej niż 50%); przy pierwszym badaniu 60–100 mg/dm³',
      U2: 'Wzrost wartości powyżej 20% (w jeziorach makrofitowych >50%); przy pierwszym badaniu >100 mg/dm³',
    },
    inputs: [
      { kind: 'number', name: 'value', label: 'TDS', unit: 'mg/dm³', min: 0, required: true, help: 'Całkowita zawartość substancji rozpuszczonych w mg/dm³, np. 19,6.' },
      ...changeFields(TDS_CHANGE, 'TDS w poprzednim badaniu (opcjonalnie)'),
    ],
    suggest: (i, ctx) => {
      const v = num(i.value)
      if (v === undefined) return null
      return changeGrade(i, v, TDS_CHANGE, ctx) ?? gradeTDS3160(v)
    },
    explain: (i, ctx) => changeExplain(i, num(i.value), TDS_CHANGE, ctx),
    warn: (i, ctx) => changeWarn(i, num(i.value), TDS_CHANGE, ctx),
    describe: (i) => {
      const v = num(i.value)
      return v === undefined ? '' : `${plNum(v)} mg/dm³`
    },
  },
]

function toBottom(i: InputValues, ctx?: IndicatorContext): boolean {
  if (i.toBottom === 'yes') return true
  if (i.toBottom === 'no') return false
  const v = num(i.value)
  const depth = num(ctx?.site?.maxDepth)
  return v !== undefined && depth !== undefined && v >= depth
}

// ---------- pola stanowiska ----------

const HDI_MEASURED: SelectOption[] = [
  { value: 'yes', label: 'Tak – HDI liczy się do oceny struktury' },
  { value: 'no', label: 'Nie – HDI pominięty w ocenie (jak w monitoringu 2011)' },
]

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie. Gdy za transekt uznano cały mały zbiornik, wpisz punkty na jego osi.

Dlaczego: przy kolejnym badaniu trzeba znaleźć miejsce, w którym poprzednio wytyczono transekt.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Jezioro Kuźniczek',
    help: `Nazwa jeziora albo zbiornika, pod którą funkcjonuje w Państwowym Monitoringu Środowiska, np. „Jezioro Kuźniczek”, „Suchar Wielki”, „Głodne Jeziorko II”. Gdy w jednym jeziorze jest kilka stanowisk – dopisz numer.

Dlaczego: stanowiskiem jest zwykle cały zbiornik. Stabilna nazwa pozwala zestawić kolejne karty.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. badawcze',
    help: 'Typ stanowiska w sieci monitoringu, np. „badawcze” albo „referencyjne”. Jeśli nie wiesz, zostaw puste.',
  },
  {
    kind: 'select',
    name: 'lakeType',
    label: 'Typ jeziora',
    options: LAKE_TYPES,
    required: true,
    help: `Makrofitowe – płytkie, z dobrze rozwiniętą strefą roślin wodnych (torfowce, pływacze, grzybienie, rdestnica pływająca); bez roślinności – zwykle głębsze, z brunatną wodą, roślin podwodnych brak albo szczątkowe.

Od tego zależą progi zmian: w jeziorach makrofitowych niekorzystny jest spadek pH (nie wzrost), a dopuszczalny wzrost przewodnictwa i TDS jest większy (50 µS/cm i 50% zamiast 20).`,
  },
  {
    kind: 'number',
    name: 'maxDepth',
    label: 'Głębokość maksymalna',
    unit: 'm',
    min: 0,
    help: 'Głębokość maksymalna zbiornika w metrach (sonda albo linka z obciążeniem). Formularz porównuje z nią widzialność krążka Secchiego – „do dna”.',
  },
  {
    kind: 'select',
    name: 'hdiMeasured',
    label: 'Oznaczenie DOC/DIC (wskaźnik HDI)',
    options: HDI_MEASURED,
    defaultValue: 'yes',
    required: true,
    help: `Czy pobrano próbkę wody do oznaczenia rozpuszczonego węgla organicznego i nieorganicznego, z których liczy się HDI.

„Nie” – wskaźnik HDI zostaje w karcie z oceną XX, ale nie liczy się do oceny specyficznej struktury i funkcji (inaczej jedna brakująca analiza laboratoryjna dawałaby XX całej strukturze). Tak oceniano karty z 2011 r., w tym przykład z przewodnika.`,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Potametum natantis, Sphagnetum cuspidato-obesi',
    help: `Zbiorowiska roślinne w obrębie lustra wody (nie na ple), nazwami fitosocjologicznymi: zespoły ze związku Sphagno-Utricularion (Sparganietum minimi, Sphagnetum cuspidato-obesi, Sphagno-Utricularietum intermediae, Utricularietum ochroleucae, Utriculario-Scorpidietum, Warnstorfietum exannulatae), a w zbiornikach z dystrofizacją także z klas Potametea i Lemnetea minoris. Brak roślinności – wpisz „brak”.

Obecność Sphagno-Utricularion na lustrze wody wspomaga wyróżnienie siedliska.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Położenie, powierzchnia i głębokość, pło (szerokość), osady, roślinność, zlewnia, rowy.',
    help: `Syntetyczny opis stanowiska:
• położenie administracyjne (nadleśnictwo, oddział, rezerwat, gmina);
• powierzchnia i głębokość maksymalna, zarastanie i wypłycanie;
• pło torfowiskowe wokół: szerokość, typ (mszar, przygiełkowisko), stan uwodnienia;
• osady denne (gytie detrytusowe, galaretowate);
• roślinność wodna i dominanty;
• zlewnia bezpośrednia (lasy, pola), rowy, ślady pozyskiwania torfu.

Sprawdź, czy to na pewno naturalny zbiornik: torfianki i potorfia (regularny kształt, groble, torf na dnie centralnej części) do 3160 nie należą, nawet z dystroficzną wodą.`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Powierzchnia lustra wody zbiornika w hektarach – z GPS, ortofotomapy albo danych archiwalnych. Małe zbiorniki: 0,032 ha = 320 m².',
  },
  pickField(methodology7120.siteFields, 'protectedAreas'),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. Nadleśnictwo Zdrojowa Góra',
    help: 'Kto zarządza terenem: nadleśnictwo, park narodowy, RDOŚ, gmina, właściciel prywatny.',
  },
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    required: true,
    placeholder: 'np. 5x30 m albo cały zbiornik',
    hint: 'Linia prostopadła do brzegu, długość wg zasięgu roślinności (np. do 200 m). Mały zbiornik – cały.',
    help: `Jeden transekt na stanowisku: linia prosta prostopadła do brzegu, o długości ograniczonej zasięgiem roślinności wodnej (np. 200 m lub mniej). Jeśli zbiornik jest niewielki, za transekt można uznać całą jego powierzchnię – wpisz „cały zbiornik”.

Przy kolejnym badaniu znajdź poprzedni transekt po współrzędnych GPS.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 62',
    help: 'Wysokość lustra wody n.p.m. Jeziora dystroficzne są głównie na niżu, ale także w Sudetach, Gorcach i Tatrach.',
  },
  {
    kind: 'text',
    name: 'areaName',
    label: 'Nazwa obszaru',
    placeholder: 'np. PLH300045 Ostoja Pilska',
    help: 'Kod i nazwa obszaru Natura 2000, w którym leży stanowisko. Poza obszarem – „brak”.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 12.08.2011',
    required: true,
    hint: 'Lipiec–sierpień; nie wcześniej niż początek lipca i nie później niż połowa września.',
    help: 'Dzień badań terenowych (pomiary wody, próbki, transekt). Najlepiej lipiec albo sierpień – nie wcześniej niż początek lipca i nie później niż połowa września. Latem pH, przewodnictwo, DOC/DIC i TDS opisują warunki „najmniejszej dystrofii”. Monitoring co 3 lata (optymalnie co 2).',
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const [, m, d] = v.split('-').map(Number)
      return m === 7 || m === 8 || (m === 9 && d <= 15) ? null : 'Termin poza zalecanym oknem (od początku lipca do połowy września). Parametry wody nie będą porównywalne z innymi stanowiskami.'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcia fitosocjologiczne (opcjonalne) ----------

const releveFields: FieldDef[] = [
  { kind: 'text', name: 'coords', label: 'Współrzędne środka zdjęcia', help: 'Współrzędne GPS środka powierzchni zdjęcia.' },
  { kind: 'number', name: 'area', group: 'Powierzchnia i pokrycie', label: 'Powierzchnia zdjęcia', unit: 'm²', min: 0, defaultValue: 25, help: 'Powierzchnia zdjęcia w m² – w płacie roślinności wodnej zwykle kilka do 25 m².' },
  { kind: 'number', name: 'cover', group: 'Powierzchnia i pokrycie', label: 'Ogólne pokrycie', unit: '%', min: 0, max: 100, help: 'Procent powierzchni zdjęcia pokryty roślinnością (rzut pionowy).' },
  { kind: 'text', name: 'unit', label: 'Jednostka fitosocjologiczna', placeholder: 'np. Sphagnetum cuspidato-obesi', help: 'Zespół, do którego należy płat.' },
  {
    kind: 'releve-species',
    name: 'species',
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Gatunki z ilościowością w skali Braun-Blanqueta. Rośliny naczyniowe w warstwie C, torfowce i inne mchy w warstwie D.',
  },
]

export const methodology3160: Methodology = {
  code: '3160',
  name: 'Naturalne, dystroficzne zbiorniki wodne',
  source:
    'Wilk-Woźniak E., Gąbka M. i in. 2012, Naturalne, dystroficzne zbiorniki wodne, [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 150–169 (tab. 1 i 2)',

  siteFields,

  releves: {
    defaultCount: 0,
    intro:
      'Metodyka 3160 nie wymaga zdjęć fitosocjologicznych: roślinność opisuje spis gatunków charakterystycznych w transekcie (wskaźnik „Gatunki charakterystyczne”) i skład syntaksonomiczny w polu „Zbiorowiska roślinne”. Zdjęcie dodaj tylko, gdy chcesz udokumentować płat zbiorowiska ze Sphagno-Utricularion.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Stan zlewni bezpośredniej, a zwłaszcza torfowiska otaczającego jezioro: jeśli torfowisko funkcjonuje bez zaburzeń hydrologicznych i jest silnie uwodnione, właściwy stan zbiornika dystroficznego najpewniej się utrzyma.',
    help: `Oceniając perspektywy, weź pod uwagę stan torfowiska wokół zbiornika: poziom wody (pomocniczo – piezometry), ślady pozyskiwania torfu, właściwą roślinność torfowiskową, zarastanie krzewami i drzewami, prowadzone lub planowane inwestycje mogące odwodnić torfowisko, gospodarkę rybacką i rekreację.

Progi (tab. 2):
• FV – torfowisko bez zaburzeń hydrologicznych i o wysokim uwilgotnieniu, brak pozyskiwania torfu, właściwa roślinność torfowiskowa; piezometr: woda równo z powierzchnią albo do 10 cm poniżej; użytkowanie (rybackie, leśne, rekreacja) da się kontrolować albo prowadzone są działania ochronne (zastawki, zasypywanie rowów);
• U1 – brak konserwacji zastawek albo ich częściowe uszkodzenie, zarastanie rowów, nieodpowiednia gospodarka rybacka albo torfowisko z niewielkimi zaburzeniami hydrologicznymi, pozyskiwanie torfu na małą skalę; piezometr 10–30 cm poniżej powierzchni; jest możliwość poprawy (usuwanie drzew i krzewów, koszenie);
• U2 – infrastruktura melioracyjna wyraźnie pogarsza warunki wodne, brak realnych możliwości poprawy, planowana inwestycja w sąsiedztwie, intensywna gospodarka rybacka i rekreacja, torfowisko zmeliorowane z murszeniem, pozyskiwanie torfu na dużą skalę; piezometr ponad 30 cm poniżej powierzchni.

W 2016 r. „stan torfowiska otaczającego jezioro” nie był już osobnym wskaźnikiem – wchodzi tutaj.`,
    thresholds: {
      FV: 'Torfowisko bez zaburzeń hydrologicznych i o wysokim stanie uwilgotnienia, brak pozyskiwania torfu, właściwie zachowana roślinność torfowiskowa; poziom wody w piezometrze równy lub do 10 cm poniżej powierzchni torfowiska; możliwość kontrolowania użytkowania albo prowadzone działania ochronne',
      U1: 'Brak konserwacji zastawek lub ich częściowe uszkodzenie, zarastanie rowów, nieodpowiednia gospodarka rybacka lub torfowisko z niewielkimi zaburzeniami hydrologicznymi, pozyskiwanie torfu na małą skalę; poziom wody w piezometrze 10–30 cm poniżej powierzchni; istnieje możliwość poprawy stanu torfowiska',
      U2: 'Infrastruktura melioracyjna wyraźnie pogarsza warunki wodne jeziora i torfowiska, brak realnych możliwości poprawy; zagrożenie planowaną inwestycją; intensywna gospodarka rybacka i rekreacja; torfowisko zmeliorowane z murszeniem, pozyskiwanie torfu na dużą skalę; poziom wody w piezometrze ponad 30 cm poniżej powierzchni',
    },
  },

  impactCodes: [
    { code: 'A08', name: 'Nawożenie /nawozy sztuczne/' },
    { code: 'B02', name: 'Gospodarka leśna – ogólnie' },
    { code: 'B02.02', name: 'Wycinka lasu' },
    { code: 'C01.03.02', name: 'Mechaniczne pozyskanie torfu' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'E01', name: 'Tereny zurbanizowane, tereny zamieszkane' },
    { code: 'F01', name: 'Akwakultura morska i słodkowodna' },
    { code: 'F02.03', name: 'Wędkarstwo' },
    { code: 'G01', name: 'Sporty i różne formy czynnego wypoczynku, uprawiane w plenerze' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'H01', name: 'Zanieczyszczenie wód powierzchniowych (limnicznych, lądowych, morskich i słonawych)' },
    { code: 'H01.05', name: 'Rozproszone zanieczyszczenie wód powierzchniowych z powodu działalności związanej z rolnictwem i leśnictwem' },
    { code: 'H05.01', name: 'Odpadki i odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02.01.02', name: 'Osuszanie terenów morskich, ujściowych, bagiennych' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód - ogólnie' },
    { code: 'J02.07', name: 'Pobór wód gruntowych' },
    { code: 'K01.02', name: 'Zamulenie' },
    { code: 'K01.03', name: 'Wyschnięcie' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. rzadkie gatunki na lustrze wody i na ple, strzebla błotna, sąsiednie siedliska (7110, 7140).',
        help: 'Wartości przyrodnicze stanowiska poza samym siedliskiem: rzadkie i chronione gatunki lustra wody (Utricularia minor, Nuphar pumila, Aldrovanda vesiculosa) i pła torfowiskowego (Carex limosa, Scheuchzeria palustris, Drosera rotundifolia, Andromeda polifolia), rzadkie zbiorowiska pła, strzebla błotna (4009), sąsiadujące torfowiska 7110, 7140. Brak informacji – „Nie pozyskano danych”.',
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: 'Jakie działania ochronne wykonano i jaka jest ich skuteczność, oraz co proponujesz. Typowe dla 3160: zasypywanie rowów i budowa zastawek, utrzymanie wysokiego poziomu wód torfowiska, wyłączenie z użytkowania rybackiego i wędkarskiego (albo przebudowa rybostanu w stronę drapieżników, zakaz zarybiania karpiowatymi i zanęcania), zakaz wapnowania, zakaz zrębów zupełnych w zlewni bezpośredniej, ograniczenie wydeptywania pła, likwidacja dzikich pomostów, usuwanie śmieci. Brak działań – „Brak”.',
      }
    return f
  }),

  speciesCatalog: SPECIES_3160.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer3160(s) })),
  speciesInfo: (name) => {
    const e = findSpecies3160(name)
    return e ? GROUP_LABELS_3160[e.group] : undefined
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator3160 = (id: string): IndicatorDef => {
  const i = methodology3160.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 3160`)
  return i
}
