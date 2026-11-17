// Metodyka 7140 (torfowiska przejściowe i trzęsawiska, przeważnie z roślinnością z Scheuchzerio-Caricetea nigrae) jako dane.
// Źródło: Koczur A. 2012, „7140 Torfowiska przejściowe i trzęsawiska (przeważnie z roślinnością z Scheuchzerio-Caricetea
// nigrae)” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. III, GIOŚ, s. 109–122
// (tab. 1 i 2, lista wskaźników kardynalnych, karta „Chyżne Borcok”), z praktyką oceny ze sprawozdań z monitoringu
// 2009–2011 (badania 2010–2011), 2015–2018 (badania 2016–2017) i 2023–2025 (badania 2024). Przy rozjazdach pierwszeństwo
// ma tab. 2, a praktyka trafia do pomocy i ostrzeżeń.
// Siedlisko niepriorytetowe, region kontynentalny (7140-1) i alpejski (7140-2). Transekt 10×200 m (albo krótszy, szerszy,
// mniejszy, trzy płaty), trzy zdjęcia 5×5 m, pomiar wody w pięciu punktach co 50 m. Wspólne z 7120: pola stanowiska
// i zdjęć, pięć pomiarów głębokości wody, sposób pozyskania torfu, „Inne informacje”.
// Ocena struktury ma własną regułę z tab. 2 (`structureRule7140`: „z pozostałych maksymalnie dwa na U2”), ocena ogólna –
// „najgorszy decyduje” jak w silniku (tak jak w kartach 3140, 4060, 6130 – reguła „dwa FV i jeden U1” sprzed erraty).
import type { FieldDef, Grade, GradeOrEmpty, IndicatorDef, InputValues, Methodology, SelectOption, StructureItem } from '../../7120/habitats/types'
import { describeSpecies, mean, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_7140,
  SPECIES_7140,
  defaultLayer7140,
  findSpecies7140,
  isAlien7140,
  isBog7140,
  isCharacteristic7140,
  isExpansive7140,
  isWoody7140,
  speciesKey7140,
} from './species'

// ---------- progi liczbowe (tab. 2) ----------

/** Procent powierzchni transektu zajęty przez siedlisko: 80–100% FV; 50–80% U1; poniżej 50% U2 (80 → FV, 50 → U1). */
export const gradeShare7140 = (share: number): Grade => (share >= 80 ? 'FV' : share >= 50 ? 'U1' : 'U2')

/**
 * Gatunki charakterystyczne (tab. 2): powyżej 6 gatunków albo mniej, lecz pokrycie powyżej 50% – FV; 0–3 gatunki i pokrycie
 * poniżej 20% – U2; reszta (4–6 gatunków albo mniej, lecz pokrycie 20–50%) – U1. Pokrycie undefined – rozstrzyga tylko liczba
 * powyżej 6; inaczej null.
 */
export function gradeCharacteristic7140(count: number, cover?: number): Grade | null {
  if (count > 6) return 'FV'
  if (cover === undefined) return null
  if (cover > 50) return 'FV'
  if (count <= 3 && cover < 20) return 'U2'
  return 'U1'
}

/**
 * Gatunki dominujące: udział gatunków charakterystycznych w łącznym pokryciu dominantów. Tab. 2 nie podaje liczb –
 * „dominują charakterystyczne” = co najmniej 60%, „udział mniej więcej równy” = 40–60%, „dominują niecharakterystyczne”
 * = poniżej 40%. To interpretacja, nie norma.
 */
export const gradeDominant7140 = (share: number): Grade => (share >= 60 ? 'FV' : share >= 40 ? 'U1' : 'U2')

/**
 * Pokrycie i struktura gatunkowa mchów (tab. 2, waloryzacja z 2012 r.): mchy ponad 50% i torfowce ponad 50% powierzchni
 * mchów – FV; mchy 20–50% albo mchy ponad 50%, ale torfowce 50% i mniej – U1; mchy poniżej 20% – U2.
 */
export function gradeMosses7140(mossCover: number, sphagnumShare?: number): Grade | null {
  if (mossCover < 20) return 'U2'
  if (mossCover <= 50) return 'U1'
  if (sphagnumShare === undefined) return null
  return sphagnumShare > 50 ? 'FV' : 'U1'
}

/** Obce gatunki inwazyjne: brak – FV; do 5% – U1 (obecne bez pokrycia też); powyżej 5% – U2. */
export function gradeAliens7140(cover: number, present = cover > 0): Grade {
  if (!present && cover <= 0) return 'FV'
  return cover <= 5 ? 'U1' : 'U2'
}

/** Rodzime gatunki ekspansywne: brak lub pojedyncze (poniżej 1%) – FV; do 5% – U1; powyżej 5% – U2. */
export const gradeExpansive7140 = (cover: number): Grade => (cover < 1 ? 'FV' : cover <= 5 ? 'U1' : 'U2')

/** Krzewy i podrost drzew: brak lub pojedyncze (poniżej 1%) – FV; mniej niż 15% – U1 (dokładnie 15% też, luka w tab. 2); więcej – U2. */
export const gradeWoody7140 = (cover: number): Grade => (cover < 1 ? 'FV' : cover <= 15 ? 'U1' : 'U2')

/** Stopień uwodnienia (średnia głębokość lustra wody pod powierzchnią, cm; nad powierzchnią – ujemna): do 10 FV; 10–20 U1; ponad 20 U2. */
export const gradeHydration7140 = (depth: number): Grade => (depth <= 10 ? 'FV' : depth <= 20 ? 'U1' : 'U2')

/**
 * Specyficzna struktura i funkcje wg tab. 2 7140:
 * - U2, gdy choć jeden kardynalny ma U2,
 * - FV, gdy wszystkie kardynalne FV, a pozostałe co najmniej U1,
 * - U1, gdy wszystkie kardynalne co najmniej U1, a z pozostałych maksymalnie dwa na U2,
 * - trzy i więcej niekardynalnych U2 – tab. 2 tego nie opisuje (luka); formularz daje U2, bo kolumna U1 wprost to wyklucza.
 * XX w kardynalnym (bez U2) daje XX, brak oceny – '' (jak w silniku).
 */
export function structureRule7140(items: StructureItem[]): GradeOrEmpty {
  if (items.length === 0 || items.some((i) => i.grade === '')) return ''
  const cardinal = items.filter((i) => i.cardinal).map((i) => i.grade)
  const othersU2 = items.filter((i) => !i.cardinal && i.grade === 'U2').length
  if (cardinal.includes('U2')) return 'U2'
  if (cardinal.includes('XX')) return 'XX'
  if (othersU2 === 0 && cardinal.every((g) => g === 'FV')) return 'FV'
  return othersU2 <= 2 ? 'U1' : 'U2'
}

const pct = (v: number) => `${plNum(v)}%`
const round1 = (n: number) => Math.round(n * 10) / 10
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey7140(n), n])).values()]

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
  { value: 'minor', label: 'Powolne, niewielkie zmniejszanie się powierzchni (np. zarastanie brzegów płatu przez drzewa, krzewy albo gatunki łąkowe)', grade: 'U1' },
  { value: 'decrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi z literatury', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania (pierwsze badanie)', grade: 'XX' },
]
const HYDRATION: GradedOption[] = [
  { value: 'wet', label: 'Woda przy chodzeniu po torfowisku zawsze widoczna, co najmniej do wysokości podeszwy', grade: 'FV' },
  { value: 'surfaceDry', label: 'Oznaki przesuszenia powierzchniowej warstwy torfowiska', grade: 'U1' },
  { value: 'dry', label: 'Torfowisko wyraźnie przesuszone', grade: 'U2' },
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
  { value: 'outside', label: 'Rowy tylko w otoczeniu, bez wpływu na uwodnienie torfowiska', grade: 'FV' },
  { value: 'neutralized', label: 'Infrastruktura „zneutralizowana” działaniami ochronnymi (zasypane rowy, zastawki)', grade: 'FV' },
  { value: 'weak', label: 'Sieć rowów oddziałuje na warunki wodne w niewielkim stopniu (brak konserwacji, częściowe uszkodzenie, zarastanie rowów, częściowe działania ochronne)', grade: 'U1' },
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

export const SUBTYPES_7140 = ['7140-1', '7140-2'] as const
export const SUBTYPE_LABELS_7140: Record<(typeof SUBTYPES_7140)[number], string> = {
  '7140-1': '7140-1 – Torfowiska przejściowe i trzęsawiska na niżu',
  '7140-2': '7140-2 – Górskie torfowiska przejściowe i trzęsawiska',
}
export const SUBTYPE_OPTIONS: SelectOption[] = [{ value: '', label: '—' }, ...SUBTYPES_7140.map((s) => ({ value: s, label: SUBTYPE_LABELS_7140[s] }))]

// ---------- gatunki charakterystyczne ----------

const characteristicNames = (i: InputValues) => distinct(rowNames(i.species).filter(isCharacteristic7140))
function characteristicCount(i: InputValues): number | undefined {
  const c = num(i.count)
  if (c !== undefined) return c
  return rowNames(i.species).length ? characteristicNames(i).length : undefined
}
function characteristicCover(i: InputValues): number | undefined {
  const t = num(i.total)
  if (t !== undefined) return t
  const c = sumCover(i.species, isCharacteristic7140)
  return typeof c === 'number' ? c : undefined
}

// ---------- gatunki dominujące ----------

/** Udział (%) gatunków charakterystycznych w łącznym pokryciu dominantów; undefined, gdy brak pokryć. */
function dominantShare(i: InputValues): number | undefined {
  const all = sumCover(i.species)
  if (typeof all !== 'number' || all <= 0) return undefined
  const ch = sumCover(i.species, isCharacteristic7140)
  return Math.round(((typeof ch === 'number' ? ch : 0) / all) * 100)
}

// ---------- stopień uwodnienia ----------

const DEPTHS = [1, 2, 3, 4, 5] as const
const depths = (i: InputValues) => DEPTHS.map((n) => num(i[`depth${n}`])).filter((v): v is number => v !== undefined)
const meanDepth = (i: InputValues) => mean(depths(i))
const hydrationOf = (i: InputValues): number | undefined => num(i.piezometer) ?? meanDepth(i)

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
    description: 'Powierzchnia siedliska na stanowisku i jej zmiany w porównaniu z wcześniejszymi badaniami albo danymi z literatury.',
    help: `Co wybrać: czy powierzchnia torfowiska przejściowego na stanowisku jest stabilna, rośnie, czy maleje. Samą powierzchnię wpisz obok – trafi do „wartości”, gdy nie ma opisu.

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; inne kombinacje – U1; wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub danymi z literatury – U2. Przy pierwszym badaniu bez danych do porównania – XX (tak oceniano nowe stanowiska w 2024 r.).

Praktyka 2024: w Karpatach płaty od 5 arów do 3 ha, na niżu zwykle ponad 1 ha. U1 przy powolnym kurczeniu się płatu przez zarastanie drzewami, krzewami albo gatunkami łąkowymi (Litmirz, Wołosate Leńkowska); U2 przy zaniku siedliska (Kalnica, Źródliska Jasiołki, Bosse, Lasówka), dużym ubytku na rzecz boru bagiennego (Chyżne Nowa Droga) albo zniszczeniu części torfowiska drogą leśną (Niżne Bory). Karta z przewodnika: „Powierzchnia siedliska duża, stabilna” → FV.`,
    thresholds: { FV: 'Nie podlega zmianom lub zwiększa się', U1: 'Inne kombinacje', U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze' },
    inputs: [
      selectInput('Zmiana powierzchni', AREA, 'Jak zmieniła się powierzchnia siedliska od poprzedniego badania.'),
      { kind: 'text', name: 'areaText', label: 'Powierzchnia (opcjonalnie)', placeholder: 'np. 0,5 ha', help: 'Powierzchnia płatów siedliska na stanowisku, np. „0,5 ha” – trafi do pola „wartość”, gdy nie ma opisu.' },
      noteInput('Opis (opcjonalnie)', 'np. Powierzchnia siedliska duża, stabilna.', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => note(i) || String(i.areaText ?? '').trim() || labelOf(AREA, i.choice),
  },
  {
    id: 'share',
    label: 'Procent powierzchni zajęty przez siedlisko na transekcie',
    parameter: 'structure',
    description: 'Procent powierzchni transektu zajęty przez siedlisko 7140. Wskaźnik pośrednio określa strukturę przestrzenną i stopień fragmentacji siedliska na stanowisku.',
    help: `Co wpisać: jaką część powierzchni transektu zajmują płaty torfowiska przejściowego (reszta to np. bór bagienny, zarośla, łąka, torfowisko wysokie, jeziorko).

Progi (tab. 2): 80–100% – FV; 50–80% – U1; poniżej 50% – U2. Granicę 80% formularz liczy do FV, 50% – do U1.

Praktyka: sprawozdanie 2016–2018 zwraca uwagę, że torfowiska przejściowe często tworzą naturalne kompleksy z jeziorami dystroficznymi, torfowiskami wysokimi i zbiorowiskami z Rhynchosporion – niski udział nie musi wtedy oznaczać degradacji, opisz to. W 2024 r. w Karpatach wskaźnik pogorszył się aż na 10 z 22 stanowisk (zarastanie, zanik). Karta z przewodnika tego wskaźnika nie ma – w przykładzie jest XX.`,
    thresholds: { FV: '80–100%', U1: '50–80%', U2: 'Poniżej 50%' },
    inputs: [
      { kind: 'number', name: 'share', label: 'Udział siedliska na transekcie', unit: '%', min: 0, max: 100, help: 'Procent powierzchni transektu zajęty przez siedlisko 7140. Najprościej: przejdź transekt i oszacuj, jaką część jego długości (przy pasie 10 m szerokości – powierzchni) zajmują płaty torfowiska przejściowego.' },
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed udziałem (np. naturalny kompleks z jeziorkiem dystroficznym albo torfowiskiem wysokim). „XX – nie oceniono”, gdy wskaźnika nie badano. Uzasadnij w opisie.', true),
      noteInput('Opis (opcjonalnie)', 'np. Siedlisko zajmuje ok. 90% transektu, reszta – bór bagienny.', 'Krótki opis, który trafi do „wartości” w karcie zamiast liczby.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const s = num(i.share)
      return s === undefined ? null : gradeShare7140(s)
    },
    explain: (i) => {
      if (chosenGrade(i)) return null
      const s = num(i.share)
      return s === undefined ? null : `Siedlisko zajmuje ${pct(s)} transektu.`
    },
    warn: (i) => {
      const g = chosenGrade(i)
      const s = num(i.share)
      if (!g || g === 'XX' || s === undefined || g === gradeShare7140(s)) return null
      return `Wybrano ${g}, a z udziału wychodzi ${gradeShare7140(s)} – uzasadnij w opisie.`
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const s = num(i.share)
      return s === undefined ? '' : pct(s)
    },
  },
  {
    id: 'characteristic',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków charakterystycznych dla danego zbiorowiska i wyższych jednostek: Scheuchzerietalia palustris, Caricetalia nigrae i Scheuchzerio-Caricetea nigrae (m.in. siedmiopalecznik błotny, wełnianka wąskolistna, słomiaczek złotawy) oraz ich udział procentowy na transekcie. Opisuje stan zachowania i typowość zbiorowisk.',
    help: `Co wpisać: gatunki charakterystyczne stwierdzone na transekcie, każdy z pokryciem ${SURFACE}. Liczbę gatunków i łączne pokrycie możesz też wpisać wprost.

Progi (tab. 2): powyżej 6 gatunków albo mniej, lecz pokrycie gatunków charakterystycznych na transekcie powyżej 50% – FV; 4–6 gatunków albo mniej, lecz pokrycie 20–50% – U1; 0–3 gatunki i pokrycie poniżej 20% – U2. Pokrycie to suma pokryć gatunków (warstwa mchów i zielna się nakładają, więc może przekroczyć 100%).

Jak liczy formularz: ocena wybrana w polu ma pierwszeństwo; bez niej liczba wpisana wprost albo gatunki z listy, które katalog zna jako charakterystyczne (synonimy raz), i pokrycie wpisane wprost albo suma pokryć tych gatunków. Katalog: lista z pkt 4 przewodnika (rząd Scheuchzerietalia palustris, związki Rhynchosporion albae i Caricion lasiocarpae, rząd Caricetalia nigrae, klasa i gatunki zespołów – razem z wełnianką pochwowatą, żurawiną, torfowcem kończystym i wąskolistnym) oraz kilka gatunków klasy Scheuchzerio-Caricetea wg Matuszkiewicza 2001 (bobrek trójlistkowy, bagniak błotny, gnidosz błotny, wierzbownica błotna), bo przewodnik wymienia gatunki klasy „m.in.”.

Praktyka: sprawozdanie 2009–2011 – na wielu stanowiskach tylko 2–3 gatunki, ale jeden zajmuje ponad 50% torfowiska, więc „na plan pierwszy wysuwa się procent pokrycia”. 2024: FV na 89% stanowisk na niżu i 77% w Karpatach; U2 tam, gdzie siedlisko zanika (Kalnica, Głuszec – ok. 16% pokrycia) albo spadł udział torfowca kończystego (Niżne Bory). Wełnianka pochwowata i żurawina to też gatunki torfowisk wysokich – przewodnik zastrzega, że nie powinny decydować o klasyfikacji płatu. Karta z przewodnika: wełnianka wąskolistna 40%, turzyca pospolita 5%, sit cienki 1%, torfowiec kończysty 90%, płonnik pospolity 10% → FV (płonnik nie jest gatunkiem charakterystycznym – formularz go nie liczy, ocena i tak FV z pokrycia).

Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Powyżej 6 gatunków charakterystycznych lub mniej, lecz pokrycie gatunków charakterystycznych na transekcie powyżej 50%',
      U1: '4–6 gatunków charakterystycznych lub mniej, lecz pokrycie na transekcie 20–50%',
      U2: '0–3 gatunki charakterystyczne i pokrycie na transekcie poniżej 20%',
    },
    inputs: [
      speciesInput('Gatunki charakterystyczne', `Gatunki charakterystyczne stwierdzone na transekcie z pokryciem ${SURFACE}, np. Eriophorum angustifolium 40, Sphagnum fallax 90.`),
      { kind: 'number', name: 'count', label: 'Liczba gatunków charakterystycznych (opcjonalnie)', min: 0, help: 'Łączna liczba gatunków charakterystycznych na transekcie, wpisana wprost – ma pierwszeństwo przed liczeniem z listy.' },
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków charakterystycznych w % transektu – ma pierwszeństwo przed sumą z listy (np. gdy mierzysz pokrycie płatów, a nie gatunków).'),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed liczbą gatunków i pokryciem (np. gdy masowa wełnianka pochwowata albo żurawina zawyżają pokrycie). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Gatunki charakterystyczne występujące masowo: …', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const c = characteristicCount(i)
      return c === undefined ? null : gradeCharacteristic7140(c, characteristicCover(i))
    },
    explain: (i) => {
      if (chosenGrade(i)) return null
      const c = characteristicCount(i)
      if (c === undefined) return null
      const cover = characteristicCover(i)
      const names = characteristicNames(i)
      const head = num(i.count) !== undefined ? `Gatunków charakterystycznych: ${plNum(c)}` : `Gatunki charakterystyczne z katalogu: ${names.length}${names.length ? ` (${names.join(', ')})` : ''}`
      if (cover !== undefined) return `${head}; łączne pokrycie ${pct(cover)}.`
      return c > 6 ? `${head}.` : `${head}. Przy 6 gatunkach i mniej o ocenie decyduje pokrycie – wpisz je przy gatunkach albo łącznie.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      const other = names.filter((n) => !isCharacteristic7140(n))
      if (other.length) parts.push(`Nie liczą się jako charakterystyczne: ${other.join(', ')}.`)
      const cover = characteristicCover(i)
      const bog = sumCover(i.species, isBog7140)
      if (typeof bog === 'number' && cover !== undefined && cover > 0 && bog * 2 > cover)
        parts.push('Ponad połowę pokrycia dają gatunki torfowisk wysokich (wełnianka pochwowata, żurawina) – przewodnik zastrzega, że nie powinny decydować o ocenie; rozważ ocenę ekspercką.')
      const g = chosenGrade(i)
      const c = characteristicCount(i)
      const calc = c === undefined ? null : gradeCharacteristic7140(c, cover)
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
      'Lista gatunków dominujących na transekcie (w płatach siedliska) oraz ich udział procentowy – gatunki o największej ilościowości w danej warstwie. Odpowiada na pytanie, czy na stanowisku dominują gatunki charakterystyczne dla siedliska.',
    help: `Co wpisać: dominanty – gatunki o największym pokryciu w swojej warstwie (zwykle po jednym–dwa w warstwie zielnej i mszystej, czasem drzewo lub krzew), każdy z pokryciem ${SURFACE}. Przy braku dominanta albo bardzo małym pokryciu ogólnym wpisz gatunki najliczniejsze.

Progi (tab. 2): dominują gatunki charakterystyczne dla siedliska lub brak dominanta, lecz przeważają gatunki charakterystyczne – FV; brak wyraźnych dominantów, udział gatunków charakterystycznych i innych mniej więcej równy – U1; dominują gatunki niezaliczane do charakterystycznych – U2.

Jak liczy formularz: udział gatunków charakterystycznych w łącznym pokryciu dominantów. Tab. 2 nie podaje liczb, więc przyjęto: co najmniej 60% – FV, 40–60% („mniej więcej równy”) – U1, poniżej 40% – U2. To interpretacja, nie norma; ocena wybrana w polu ma pierwszeństwo.

Praktyka: obniżone oceny przy dominacji trzciny, trzęślicy, sosny, brzóz, wierzb (niż), trzcinnika owłosionego i gatunków łąkowych (Karpaty), tawuły kutnerowatej (Osowiec Eksperymentalny). Wełnianka pochwowata: sprawozdania 2011 i 2017 – „niektórzy eksperci zaniżali ocenę ze względu na jej duży udział, inni traktowali ją jako gatunek charakterystyczny; oba podejścia są prawidłowe” – formularz liczy ją jako charakterystyczną (pkt 4) i ostrzega, gdy dominuje. Karta z przewodnika: wełnianka wąskolistna 40%, torfowiec kończysty 90% → FV.`,
    thresholds: {
      FV: 'Dominują gatunki charakterystyczne dla siedliska lub brak dominanta, lecz przeważają gatunki charakterystyczne',
      U1: 'Brak wyraźnych dominantów, udział gatunków charakterystycznych dla siedliska 7140 i innych mniej więcej równy',
      U2: 'Dominują gatunki niezaliczane do charakterystycznych dla siedliska',
    },
    inputs: [
      speciesInput('Gatunki dominujące', `Dominanty z pokryciem ${SURFACE}, np. Eriophorum angustifolium 40, Sphagnum fallax 90.`),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed udziałem liczonym z listy (np. dominacja wełnianki pochwowatej). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. … Dominują gatunki charakterystyczne.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const s = dominantShare(i)
      return s === undefined ? null : gradeDominant7140(s)
    },
    explain: (i) => {
      if (chosenGrade(i)) return null
      const s = dominantShare(i)
      if (s === undefined) return rowNames(i.species).length ? 'Wpisz pokrycie dominantów – bez niego nie da się policzyć udziału.' : null
      const other = distinct(rowNames(i.species)).filter((n) => !isCharacteristic7140(n))
      return `Gatunki charakterystyczne dają ${s}% łącznego pokrycia dominantów.${other.length ? ` Niecharakterystyczne: ${other.join(', ')}.` : ''} Progi 60% i 40% to interpretacja („mniej więcej równy”).`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      const bog = names.filter(isBog7140)
      const all = sumCover(i.species)
      const bogCover = sumCover(i.species, isBog7140)
      if (bog.length && typeof all === 'number' && typeof bogCover === 'number' && bogCover * 2 >= all)
        parts.push(`${bog.join(', ')} – gatunki torfowisk wysokich; przy ich dominacji eksperci oceniali różnie (sprawozdania 2011 i 2017) – rozważ ocenę ekspercką.`)
      const g = chosenGrade(i)
      const s = dominantShare(i)
      if (g && s !== undefined && g !== gradeDominant7140(s)) parts.push(`Wybrano ${g}, a z udziału gatunków charakterystycznych (${s}%) wychodzi ${gradeDominant7140(s)} – uzasadnij w opisie.`)
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
      'Procent powierzchni transektu zajęty przez wszystkie mchy oraz procentowy udział mchów brunatnych i torfowców. Charakteryzuje kondycję siedliska i kierunek zachodzących procesów (przesuszenie, żyzność, typ zasilania).',
    help: `Co wpisać:
1. Jaki procent transektu (płatów siedliska) pokrywają łącznie wszystkie mchy.
2. Jaką część tej powierzchni mchów zajmują torfowce (Sphagnum) – i, dla opisu, mchy brunatne (Straminergon, Calliergon, Warnstorfia, Scorpidium, Hamatocaulis i in.).

Przykład: mchy pokrywają 60% transektu, z czego torfowce zajmują trzy czwarte – wpisujesz 60 i 75.

Progi (tab. 2, waloryzacja z 2012 r.): całkowite pokrycie mchów ponad 50% i torfowce ponad 50% powierzchni porośniętej przez mchy – FV; pokrycie mchów 20–50% albo ponad 50%, ale torfowce poniżej 50% powierzchni mchów – U1; pokrycie mchów poniżej 20% – U2. Granice 20% i 50% formularz liczy do U1. Do 2011 r. próg torfowców dla FV wynosił 70%, a U2 obejmowało też dominację mchów brunatnych – zmieniono przy publikacji metodyki (sprawozdanie 2016–2018, pkt 9).

Praktyka 2024: U1 tam, gdzie proporcje mchów brunatnych i torfowców były wyrównane; U2 przy zaniku torfowców (Kalnica, Źródliska Jasiołki, Bagno Staw, Bosse, Lasówka) i szczątkowej albo brakującej warstwie mszystej (Głuszec, Proszów). Tab. 2 przy braku torfowców i pokryciu mchów ponad 20% daje U1 – formularz idzie za tab. 2 i ostrzega. Karta z przewodnika: mszaki 100%, mchy brunatne 10%, torfowce 90% → FV.

Wskaźnik kardynalny – mchy pierwsze reagują na wahania i obniżenie lustra wody.`,
    thresholds: {
      FV: 'Całkowite pokrycie mchów ponad 50% i mchy torfowce zajmują łącznie ponad 50% całkowitej powierzchni porośniętej przez wszystkie gatunki mchów',
      U1: 'Całkowite pokrycie mchów w przedziale 20–50% lub całkowite pokrycie mchów ponad 50%, ale mchy torfowce zajmują poniżej 50% całkowitej powierzchni porośniętej przez wszystkie gatunki mchów',
      U2: 'Całkowite pokrycie mchów – poniżej 20%',
    },
    inputs: [
      { kind: 'number', name: 'mossCover', label: 'Całkowite pokrycie mchów na transekcie', unit: '%', min: 0, max: 100, required: true, help: 'Suma pokrycia wszystkich mszaków (torfowce, mchy brunatne, płonniki i inne) w % powierzchni transektu (płatów siedliska). Porostów nie wliczaj.' },
      { kind: 'number', name: 'sphagnumShare', label: 'Udział torfowców w powierzchni mchów', unit: '%', min: 0, max: 100, hint: 'Procent powierzchni porośniętej przez mchy, nie całego transektu. Brak torfowców = 0.', help: 'Jaką część powierzchni zajętej przez mchy zajmują torfowce. Jeśli mchy pokrywają 40% transektu, a torfowce 30% transektu, wpisz 75 (30 z 40).' },
      { kind: 'number', name: 'brownShare', label: 'Udział mchów brunatnych w powierzchni mchów (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Jaką część powierzchni mchów zajmują mchy brunatne (Straminergon stramineum, Calliergon, Warnstorfia, Scorpidium, Hamatocaulis, Cinclidium…). Nie wpływa na ocenę – trafia do opisu. W karcie z przewodnika: 10% (choć wymieniony mech to płonnik pospolity).' },
      noteInput('Opis (opcjonalnie)', 'np. Pokrycie mszaków 100%, mchy brunatne – 10%, torfowce – 90%. Struktura prawidłowa.', 'Krótki opis, który trafi do „wartości” w karcie zamiast opisu wygenerowanego z liczb.'),
    ],
    suggest: (i) => {
      const m = num(i.mossCover)
      return m === undefined ? null : gradeMosses7140(m, num(i.sphagnumShare))
    },
    explain: (i) => {
      const m = num(i.mossCover)
      if (m === undefined) return null
      const s = num(i.sphagnumShare)
      if (m > 50 && s === undefined) return `Mchy ${pct(m)} – wpisz udział torfowców, od niego zależy FV albo U1.`
      return `Mchy ${pct(m)} transektu${s !== undefined ? `, torfowce ${pct(s)} powierzchni mchów` : ''}.`
    },
    warn: (i) => {
      const m = num(i.mossCover)
      const s = num(i.sphagnumShare)
      const b = num(i.brownShare)
      const parts: string[] = []
      if (s !== undefined && b !== undefined && s + b > 100) parts.push('Torfowce i mchy brunatne razem dają ponad 100% powierzchni mchów – sprawdź.')
      if (m !== undefined && m >= 20 && s === 0) parts.push('Brak torfowców: tab. 2 daje U1 (decyduje pokrycie mchów), ale w 2024 r. przy zaniku torfowców oceniano U2 – rozważ ocenę ekspercką.')
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const m = num(i.mossCover)
      if (m === undefined) return ''
      const s = num(i.sphagnumShare)
      const b = num(i.brownShare)
      return [`Pokrycie mszaków ${pct(m)}`, b !== undefined ? `mchy brunatne – ${pct(b)}` : '', s !== undefined ? `torfowce – ${pct(s)}` : ''].filter(Boolean).join(', ')
    },
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    cardinal: true,
    description: 'Lista gatunków inwazyjnych (obcych geograficznie) na transekcie oraz ich procentowy udział. Opisuje stopień przekształcenia siedliska.',
    help: `Co wpisać: gatunki obce z pokryciem ${SURFACE}. Łączne pokrycie możesz wpisać wprost. Na torfowiskach przejściowych notowano m.in. tawułę kutnerowatą, olszę pomarszczoną, czeremchę amerykańską, dąb czerwony, aronię czarną, śliwę wiśniową, erechtitesa jastrzębcowatego, uczep amerykański, nawłoć późną, łubin trwały, wierzbownicę gruczołowatą, mech krzywoszczeć przywłokę, a w 2024 r. po raz pierwszy w Polsce – kapturnicę purpurową (Korzeń).

Progi (tab. 2): brak – FV; zajmują do 5% powierzchni – U1; zajmują powyżej 5% powierzchni – U2. 5% formularz liczy do U1, gatunek bez pokrycia (pojedyncze osobniki) – też U1.

Praktyka: 2011 – krzywoszczeć rosnący w borach otaczających torfowisko, a nie w siedlisku, dawał FV („w otoczeniu”) – licz tylko gatunki w płatach siedliska, resztę opisz w oddziaływaniach. 2024: pokrycie poniżej 1% – U1 (12 stanowisk), U2 przy ekspansji tawuły kutnerowatej (Osowiec Eksperymentalny, wcześniej 10–15%) i przy uczepie amerykańskim z nawłocią późną (Kiełpień). Karta z przewodnika: brak → FV.

Wskaźnik kardynalny.`,
    thresholds: { FV: 'Brak', U1: 'Zajmują do 5% powierzchni', U2: 'Zajmują powyżej 5% powierzchni' },
    inputs: [
      speciesInput('Obce gatunki inwazyjne', `Gatunki obce z pokryciem ${SURFACE}, np. Spiraea tomentosa 3, Erechtites hieraciifolia 0,5.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków obcych w % transektu – ma pierwszeństwo przed sumą z listy. Dla pojedynczych osobników wpisz 0,5.'),
      NONE_FIELD('Brak gatunków obcych', 'Zaznacz „Nie stwierdzono”, gdy w płatach siedliska nie ma gatunków obcych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const present = rowNames(i.species).length > 0
      const t = num(i.total)
      if (t !== undefined) return gradeAliens7140(t, present || t > 0)
      if (!present) return i.none === 'yes' ? 'FV' : null
      const c = sumCover(i.species)
      return gradeAliens7140(typeof c === 'number' ? c : 0, true)
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
      const native = names.filter((n) => findSpecies7140(n) && !isAlien7140(n))
      if (native.length) parts.push(`To nie gatunki obce: ${native.join(', ')} – rodzime ekspansywne, drzewa i krzewy mają własne wskaźniki.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'expansive',
    label: 'Gatunki ekspansywne roślin zielnych',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków ekspansywnych na transekcie (w płatach siedliska) oraz ich procentowy udział. Najczęściej spotykane i najbardziej zagrażające torfowiskom to trzęślica modra Molinia caerulea i trzcina pospolita Phragmites australis. Opisuje kierunek i etap sukcesji.',
    help: `Co wpisać: rodzime gatunki ekspansywne z pokryciem ${SURFACE}. Tab. 1: trzęślica modra i trzcina pospolita; sprawozdania 2011–2024 dopisują trzcinnik lancetowaty, trzcinnik owłosiony, sity rozpierzchły i skupiony, śmiałek darniowy, kłosówkę miękką, turzycę darniową, borówkę czarną, a niektórzy eksperci – wełniankę pochwowatą. Gatunki obce wpisz w „Obcych gatunkach inwazyjnych”, drzewa i krzewy – w „Obecności krzewów i podrostu drzew”.

Progi (tab. 2): brak lub pojedyncze – FV; zajmują do 5% powierzchni – U1; zajmują powyżej 5% powierzchni – U2. „Pojedyncze” to pokrycie poniżej 1% (wpisz 0,5), 5% formularz liczy do U1.

Praktyka: po publikacji metodyki w 2012 r. sprawozdanie 2016–2018 trzymało się zasady „tylko brak pozwala na FV, ponad 5% – U2”, stąd wiele pozornych pogorszeń względem 2011 r. Postulat z 2018 r. (FV do 5%, U1 5–15%, U2 ponad 15%) nie wszedł – w 2024 r. oceniano wg tab. 2. To najgorzej oceniany wskaźnik kardynalny (U2 na 35% stanowisk na niżu i 41% w Karpatach). Wełnianka pochwowata: w pkt 4 wśród gatunków charakterystycznych zespołów, ale gdy ją tu wpiszesz – formularz ją liczy. Inne gatunki charakterystyczne pomija. Karta z przewodnika: brak → FV.

Wskaźnik kardynalny.`,
    thresholds: { FV: 'Brak lub pojedyncze', U1: 'Zajmują do 5% powierzchni', U2: 'Zajmują powyżej 5% powierzchni' },
    inputs: [
      speciesInput('Gatunki ekspansywne', `Rodzime gatunki ekspansywne z pokryciem ${SURFACE}, np. Molinia caerulea 10, Phragmites australis 3.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków ekspansywnych w % transektu – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak gatunków ekspansywnych', 'Zaznacz „Nie stwierdzono”, gdy w płatach siedliska nie ma rodzimych gatunków ekspansywnych – wtedy wskaźnik to FV.'),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed sumą pokrycia (np. gdy trzcina jest naturalnym składnikiem trzęsawiska przy jeziorze). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const t = num(i.total)
      if (t !== undefined) return gradeExpansive7140(t)
      if (!rowNames(i.species).length) return i.none === 'yes' ? 'FV' : null
      const c = sumCover(i.species, (n) => isExpansive7140(n) || !findSpecies7140(n))
      if (c === undefined) return 'FV' // same gatunki charakterystyczne, obce albo drzewa
      return c === 'present' ? null : gradeExpansive7140(c)
    },
    explain: (i) => {
      if (chosenGrade(i)) return null
      const t = num(i.total)
      if (t !== undefined) return `Łączne pokrycie gatunków ekspansywnych: ${pct(t)}.`
      const names = distinct(rowNames(i.species))
      if (!names.length) return null
      const skipped = names.filter((n) => findSpecies7140(n) && !isExpansive7140(n))
      const c = sumCover(i.species, (n) => isExpansive7140(n) || !findSpecies7140(n))
      return [
        skipped.length ? `Pominięte (charakterystyczne, obce, drzewa i krzewy): ${skipped.join(', ')}` : '',
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
      const aliens = names.filter(isAlien7140)
      if (aliens.length) parts.push(`Gatunki obce wpisz we wskaźniku „Obce gatunki inwazyjne”: ${aliens.join(', ')}.`)
      const woody = names.filter(isWoody7140)
      if (woody.length) parts.push(`Drzewa i krzewy wpisz we wskaźniku „Obecność krzewów i podrostu drzew”: ${woody.join(', ')}.`)
      const typical = names.filter((n) => isCharacteristic7140(n) && !isExpansive7140(n))
      if (typical.length) parts.push(`Gatunki charakterystyczne nie są ekspansywnymi: ${typical.join(', ')}.`)
      const vag = names.filter((n) => findSpecies7140(n)?.alsoExpansive)
      if (vag.length) parts.push(`${vag.join(', ')} – liczę jako ekspansywną, choć pkt 4 przewodnika wymienia ją wśród gatunków zespołów 7140; opisz, dlaczego.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'woody',
    label: 'Obecność krzewów i podrostu drzew',
    parameter: 'structure',
    description:
      'Lista gatunków drzew i krzewów (włącznie z osobnikami juwenilnymi) na transekcie (w płatach siedliska), przybliżony procent pokrycia każdego gatunku i sumaryczne pokrycie. Charakteryzuje zagrożenie zarośnięciem przez formacje krzewiaste i leśne.',
    help: `Co wpisać: drzewa i krzewy z pokryciem ${SURFACE} – sosna, brzoza omszona i brodawkowata, świerk, kruszyna, olsza czarna, osika, wierzby. Łączne pokrycie wpisz osobno, bo korony się nakładają; bez niego formularz liczy sumę z listy. Obce drzewa i krzewy (tawuła kutnerowata, olsza pomarszczona, czeremcha amerykańska) wpisz w „Obcych gatunkach inwazyjnych”.

Progi (tab. 2): brak lub pojedyncze – FV; udział mniejszy niż 15% – U1; udział większy niż 15% – U2. „Pojedyncze” to pokrycie poniżej 1% (wpisz 0,5); dokładnie 15% (luka w tab. 2) formularz liczy do U1.

Praktyka: najgorzej oceniany wskaźnik (2024: U2 na 44% stanowisk na niżu i połowie w Karpatach). Przewodnik: wyłączony z kardynalnych, bo na niektórych torfowiskach stały udział sosny o minimalnych przyrostach może być naturalny – opisz kondycję drzew, przyrosty i nalot. Sprawozdanie 2016–2018 postulowało uczynić go kardynalnym z łagodniejszymi progami (FV do 5%, U1 5–20%, U2 ponad 20%) – nie weszło. Odkrzewianie szybko poprawia ocenę (Bór na Czerwonem: sosna z 15% do <1%, U2 → FV). Karta z przewodnika: „Brak. Pojedyncze drzewa wchodzą jedynie w części najpłytszej (sosna, świerk)” → FV.`,
    thresholds: { FV: 'Brak lub pojedyncze', U1: 'Udział mniejszy niż 15%', U2: 'Udział większy niż 15%' },
    inputs: [
      speciesInput('Drzewa i krzewy', `Rodzime drzewa i krzewy (z podrostem i siewkami) z pokryciem ${SURFACE}, np. Pinus sylvestris 5, Betula pubescens 2.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Pokrycie wszystkich drzew i krzewów razem w rzucie pionowym, w % transektu – korony nakładające się liczy się raz. Ma pierwszeństwo przed sumą z listy. Pojedyncze drzewa – 0,5.'),
      NONE_FIELD('Brak drzew i krzewów', 'Zaznacz „Nie stwierdzono”, gdy w płatach siedliska nie ma drzew ani krzewów – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak. Pojedyncze drzewa wchodzą jedynie w części najpłytszej …', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const t = num(i.total)
      if (t !== undefined) return gradeWoody7140(t)
      if (!rowNames(i.species).length) return i.none === 'yes' ? 'FV' : null
      const c = sumCover(i.species, (n) => !isAlien7140(n))
      if (c === undefined) return 'FV'
      return c === 'present' ? null : gradeWoody7140(c)
    },
    explain: (i) => {
      const t = num(i.total)
      if (t !== undefined) return `Łączne pokrycie drzew i krzewów: ${pct(t)}.`
      const c = sumCover(i.species, (n) => !isAlien7140(n))
      if (c === undefined) return null
      return c === 'present'
        ? 'Gatunki bez pokrycia – wpisz pokrycie albo łączne pokrycie (pojedyncze drzewa: 0,5).'
        : `Łączne pokrycie z sumy gatunków: ${pct(c)} (korony się nakładają – jeśli realnie jest mniej, wpisz łączne pokrycie).`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo pokrycie nie są puste.')
      const aliens = names.filter(isAlien7140)
      if (aliens.length) parts.push(`Gatunki obce wpisz we wskaźniku „Obce gatunki inwazyjne”: ${aliens.join(', ')}.`)
      const t = num(i.total) ?? sumCover(i.species, (n) => !isAlien7140(n))
      if (typeof t === 'number' && t > 50) parts.push('Drzewa i krzewy ponad 50% – sprawdź, czy płat to jeszcze 7140, a nie bór bagienny (91D0) albo zarośla.')
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
      'Głębokość zalegania wody gruntowej, ewentualnie powierzchniowej, w okresie letnim – bez specjalistycznego sprzętu albo z piezometru – w pięciu punktach co 50 m wzdłuż transektu (trzy w miejscach zdjęć fitosocjologicznych, dwa pomiędzy).',
    help: `Co wpisać: głębokość lustra wody poniżej powierzchni torfowiska, w cm, w 5 punktach co 50 m wzdłuż transektu (3 w miejscach zdjęć fitosocjologicznych, 2 pomiędzy nimi). Woda nad powierzchnią – liczba ujemna. Gdy na stanowisku jest piezometr, wpisz jego odczyt – ma pierwszeństwo przed średnią z pomiarów. Bez pomiarów wybierz opis z obserwacji.

Jak mierzyć: zwykle wystarczy stanąć – na dobrze uwodnionym torfowisku przejściowym woda wychodzi spod stopy. Inaczej wykop łopatką dołek, odczekaj, aż woda się ustabilizuje, i zmierz taśmą.

Progi (tab. 2): poziom wody powyżej, równo lub do 10 cm poniżej powierzchni torfowiska (w praktyce, w trakcie chodzenia po torfowisku, woda zawsze widoczna przynajmniej do wysokości podeszwy) – FV; 10–20 cm poniżej – U1; więcej niż 20 cm poniżej – U2. Formularz liczy średnią z pomiarów; granice 10 i 20 cm – do lepszej klasy.

Praktyka: 2011 – lipcowe ulewy okresowo podniosły wodę, ocena „między FV a U1”. 2024: U1 przy oznakach przesuszenia powierzchniowej warstwy torfu, U2 przy wyraźnym przesuszeniu (20% stanowisk na niżu, Bieszczady). Karta z przewodnika: „Poziom wód gruntowych powyżej powierzchni gruntu (miejscami do 20 cm) lub równy z nią” → FV.

Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Poziom wody mierzony w piezometrze – powyżej, równo lub do 10 cm poniżej powierzchni torfowiska (w praktyce, w trakcie chodzenia po torfowisku, woda zawsze widoczna przynajmniej do wysokości podeszwy)',
      U1: 'Poziom wody mierzony w piezometrze – 10–20 cm poniżej powierzchni torfowiska',
      U2: 'Poziom wody mierzony w piezometrze – więcej niż 20 cm poniżej powierzchni torfowiska',
    },
    inputs: [
      ...DEPTHS.map((n) =>
        pickField(h7120, `depth${n}`, {
          required: false,
          group: 'Głębokość lustra wody (cm poniżej powierzchni)',
          groupCols: 5,
          label: `Punkt ${n}`,
          help:
            n % 2 === 1
              ? `Pomiar w miejscu zdjęcia fitosocjologicznego (${n === 1 ? 'początek' : n === 3 ? 'środek' : 'koniec'} transektu). Głębokość wody pod powierzchnią w cm; woda nad powierzchnią – liczba ujemna.`
              : 'Pomiar pomiędzy zdjęciami fitosocjologicznymi (co 50 m). Głębokość wody pod powierzchnią w cm; woda nad powierzchnią – liczba ujemna.',
        }),
      ),
      { kind: 'number', name: 'piezometer', label: 'Odczyt z piezometru (opcjonalnie)', unit: 'cm', min: -100, max: 300, help: 'Głębokość lustra wody w piezometrze, w cm poniżej powierzchni torfowiska (nad powierzchnią – liczba ujemna). Ma pierwszeństwo przed średnią z pomiarów – tab. 2 podaje progi właśnie dla piezometru.' },
      { ...selectInput('Obserwacja w terenie (bez pomiarów)', HYDRATION, 'Gdy nie mierzysz głębokości wody – wybierz opis z obserwacji. Pomiary (i piezometr) mają pierwszeństwo.', 'observed'), required: false },
      noteInput('Opis (opcjonalnie)', 'np. Poziom wód gruntowych powyżej powierzchni gruntu (miejscami do 20 cm) lub równy z nią.', 'Krótki opis, który trafi do „wartości” w karcie zamiast opisu wygenerowanego z pomiarów.'),
    ],
    suggest: (i) => {
      const d = hydrationOf(i)
      if (d !== undefined) return gradeHydration7140(d)
      return byOption(gradeMap(HYDRATION), 'observed')(i)
    },
    explain: (i) => {
      if (num(i.piezometer) !== undefined) return `Odczyt z piezometru: ${plNum(num(i.piezometer)!)} cm poniżej powierzchni.`
      const m = meanDepth(i)
      return m === undefined ? null : `Średnia z ${depths(i).length} pomiarów: ${plNum(round1(m))} cm poniżej powierzchni.`
    },
    warn: (i) => {
      const d = hydrationOf(i)
      const o = byOption(gradeMap(HYDRATION), 'observed')(i)
      if (d === undefined || !o || o === gradeHydration7140(d)) return null
      return `Obserwacja (${o}) nie zgadza się z pomiarami (${gradeHydration7140(d)}) – formularz bierze pomiary.`
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const p = num(i.piezometer)
      if (p !== undefined) return `Poziom wody w piezometrze: ${plNum(p)} cm poniżej powierzchni torfowiska`
      const vals = depths(i)
      if (vals.length) return `Poziom wody: ${vals.map(plNum).join(', ')} cm poniżej powierzchni torfowiska`
      return labelOf(HYDRATION, i.observed)
    },
  },
  {
    id: 'peat',
    label: 'Pozyskanie torfu',
    parameter: 'structure',
    description:
      'Rozmiary zniszczeń spowodowanych eksploatacją oraz ewentualny stopień regeneracji siedliska: sposób wydobycia (ręczne, mechaniczne, przemysłowe), roczne wydobycie w m³, procent zniszczonej powierzchni torfowiska i przedział czasowy wydobycia.',
    help: `Co wybrać i opisać: czy i kiedy pozyskiwano torf na stanowisku, w jakiej skali i jakim sposobem. Ślady to doły potorfowe, schodkowe ściany torfu, prostokątne pola, kopce. W opisie podaj szacunkowe roczne wydobycie (m³), procent zniszczonej powierzchni i przedział czasowy.

Progi (tab. 2): brak pozyskania torfu, a jeżeli był pozyskiwany w przeszłości (powyżej 30 lat), to na niewielką skalę (do 5% torfowiska), słabo zauważalne ślady – FV; torf pozyskiwany w przeszłości na znacznie większą skalę (powyżej 5% torfowiska), wyraźnie widoczne ślady eksploatacji, obecnie brak pozyskiwania lub sporadyczne i na bardzo małą skalę – U1; pozyskiwanie na dużą skalę przez miejscową ludność lub eksploatacja przemysłowa – U2. Pozyskanie zakończone w ostatnich 30 latach, nawet małe – formularz daje U1 (FV przewiduje tylko dawne).

Praktyka: 2011 i 2017 – FV także tam, gdzie eksploatacja skończyła się bardzo dawno, a ślady się zatarły; U1 na regenerujących potorfiach (Mały Czarnówek – U1 po analizie materiałów historycznych). 2024: U1 na 12% stanowisk na niżu, U2 nigdzie. Karta z przewodnika: „Brak” → FV.`,
    thresholds: thresholdsOf(PEAT),
    inputs: [
      selectInput('Pozyskanie torfu', PEAT, 'Kiedy i w jakiej skali pozyskiwano torf na stanowisku.'),
      pickField(peat7120, 'method', { required: false, help: 'Ręczny: płytkie, nieregularne doły, zwykle mała skala. Mechaniczny/przemysłowy: duże, regularne pola, maszyny. Nie dotyczy albo nie da się ustalić – zostaw „nie dotyczy / nie wiadomo”.' }),
      { kind: 'number', name: 'damaged', label: 'Zniszczona powierzchnia torfowiska (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Szacunkowy procent powierzchni torfowiska zniszczonej przez eksploatację. Próg 5% rozdziela w tab. 2 dawne pozyskanie „na niewielką skalę” (FV) od „na znacznie większą skalę” (U1).' },
      noteInput('Opis (opcjonalnie)', 'np. Brak.', 'Krótki opis (sposób, skala, roczne wydobycie, przedział czasowy), który trafi do „wartości” w karcie zamiast etykiety klasy.'),
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
      'Rozmiary zniszczeń spowodowanych odwodnieniem i ewentualny stopień regeneracji: obecność infrastruktury melioracyjnej, jej stan (konserwacja rowów) i wpływ na warunki wodne torfowiska – głębokość rowów, poziom wody, czy woda odpływa, czy stagnuje.',
    help: `Co wybrać i opisać: czy na stanowisku i w jego otoczeniu są rowy i kanały melioracyjne, czy działają i jak wpływają na uwodnienie. W opisie podaj głębokość rowów, poziom wody w nich, czy woda odpływa (rów czynny), czy stagnuje, oraz zastawki i zasypania.

Progi (tab. 2): brak sieci rowów i kanałów melioracyjnych oraz innych elementów infrastruktury melioracyjnej odwadniających torfowisko bądź infrastruktura w wystarczającym stopniu „zneutralizowana” działaniami ochronnymi (zasypywanie rowów, budowa zastawek) – FV; sieć rowów w niewielkim stopniu oddziałuje na warunki wodne z uwagi na brak konserwacji, częściowe uszkodzenie, naturalne zarastanie rowów bądź podejmowane działania ochronne – U1; istniejąca infrastruktura wyraźnie pogarsza warunki wodne torfowiska – U2.

Praktyka: liczy się wpływ na warunki wodne, nie sama obecność rowów. Karta z przewodnika: „Rowy odwadniające w bezpośrednim otoczeniu (okoliczne nasadzenia sosnowe) nie wpływają na uwodnienie torfowiska” → FV (opcja „Rowy tylko w otoczeniu”). 2024: U1 przy starych, mało drożnych rowach w sąsiedztwie (30% stanowisk na niżu), U2 przy czynnych, pogłębionych rowach (Niżne Bory, Lasówka – rowy pogłębione do 1,5 m w 2014–2015, Karpiska, Łazy, Żurawie Bagno). Udrożnienie zarośniętego rowu zmieniło ocenę z FV na U1 (Żurawie Bagno I, 2017). Wpływ rowu trudny do ustalenia w jednej wizycie – XX bywa uczciwszy niż FV (Ławszowa, 2017).`,
    thresholds: thresholdsOf(DRAINAGE),
    inputs: [
      selectInput('Stan melioracji', DRAINAGE, 'Oceniasz wpływ infrastruktury na warunki wodne torfowiska, nie samą obecność rowów.'),
      noteInput('Opis (opcjonalnie)', 'np. Rowy odwadniające w bezpośrednim otoczeniu nie wpływają na uwodnienie torfowiska.', 'Krótki opis (rowy, głębokość, poziom wody, odpływ albo stagnacja, zastawki), który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(DRAINAGE)),
    describe: (i) => note(i) || labelOf(DRAINAGE, i.choice),
  },
]

// ---------- pola stanowiska ----------

const s7120 = methodology7120.siteFields
const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu (zdjęcia fitosocjologicznego nr ${where === 'początku' ? 1 : where === 'środka' ? 2 : 3}), z odbiornika GPS (WGS84). Gdy zamiast transektu są trzy izolowane płaty – współrzędne każdego z nich.

Dlaczego: obserwacje powtarza się co 3–6 lat w tym samym miejscu – tam też mierzy się poziom wody.`

const siteFields: FieldDef[] = [
  {
    kind: 'select',
    name: 'subtype',
    label: 'Podtyp siedliska',
    options: SUBTYPE_OPTIONS,
    hint: 'Niż (7140-1) albo góry (7140-2).',
    help: `Podtyp wg sprawozdania z monitoringu 2009–2011:
• 7140-1 – torfowiska przejściowe i trzęsawiska na niżu (region kontynentalny; także Sudety i wyżyny);
• 7140-2 – górskie torfowiska przejściowe i trzęsawiska (region alpejski: Kotlina Orawsko-Nowotarska, Tatry, Bieszczady, pojedyncze obiekty w innych częściach Karpat).

Formularz nie zmienia od podtypu progów – tab. 2 jest wspólna. Karta z przewodnika podtypu nie podaje – Chyżne Borcok (Kotlina Orawsko-Nowotarska) to 7140-2.`,
  },
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Chyżne Borcok',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Chyżne Borcok”, „Bór na Czerwonem”, „Żurawie Bagno I”. Zwykle stanowiskiem jest całe torfowisko albo wyraźnie wyodrębniona jego część; w kompleksach torfowisk – jednorodny fragment; przy rozproszonych płatach – wszystkie płaty na jednym terenie.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego stanowiska.`,
  },
  pickField(s7120, 'guid'),
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. referencyjne',
    help: `Typ stanowiska w sieci monitoringu, np. „referencyjne” – dobrze zachowane siedlisko, punkt odniesienia dla innych (tak w karcie z przewodnika). Jeśli nie wiesz, zostaw puste.

Dlaczego: przy ocenie regionu stanowiska referencyjne pokazują, jak wygląda 7140 w dobrym stanie.`,
  },
  {
    kind: 'text',
    name: 'areaName',
    label: 'Nazwa obszaru',
    placeholder: 'np. Torfowiska Orawsko-Nowotarskie',
    help: 'Obszar (Natura 2000, kraina, kompleks torfowisk), w którym leży stanowisko, np. „Torfowiska Orawsko-Nowotarskie” (karta z przewodnika), „Uroczyska Puszczy Drawskiej”, „Bieszczady”.',
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Caricetum nigrae, zb. Eriophorum angustifolium-Sphagnum fallax',
    help: 'Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Klasa Scheuchzerio-Caricetea nigrae: Rhynchosporion albae (Caricetum limosae, Rhynchosporetum albae), Caricion lasiocarpae (Caricetum lasiocarpae, Caricetum diandrae, Caricetum chordorrhizae, Caricetum heleonastes), Caricion nigrae (Carici-Agrostietum caninae, Caricetum nigrae). Przewodnik każe uwzględnić też m.in. Eriophoro angustifolii-Sphagnetum recurvi, Sphagno-Caricetum rostratae, Junco filiformis-Sphagnetum recurvi, Calamagrostietum neglectae, Carici echinatae-Sphagnetum, zbiorowiska z Calla palustris i z Comarum palustre oraz zb. Eriophorum vaginatum-Sphagnum fallax (Oxycocco-Sphagnetea).',
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Typ torfowiska (pło, okrajek, zabagnienie, potorfie, młaka), położenie transektu, sąsiednie siedliska, uwodnienie, zarastanie.',
    help: `Krótka charakterystyka stanowiska:
• typ: pło na lądowiejącym jeziorze dystroficznym, pływająca wyspa, bezodpływowe zagłębienie, podtopiony okrajek albo wierzchowina torfowiska wysokiego, kwaśna młaka górska, wtórne siedlisko na uwodnionym potorfiu;
• gdzie leży transekt i dlaczego tam (np. lepiej zachowany brzeg);
• sąsiednie siedliska: bór bagienny 91D0, torfowisko wysokie 7110/7120, obniżenia 7150, torfowisko alkaliczne 7230, łąki Molinion i Calthion, szuwary;
• historia: odwodnienie, zalesienie obrzeży, eksploatacja torfu, działania ochronne.

Dlaczego: torfowiska przejściowe bywają trudne do odgraniczenia od łąk, 7230, 7110 i 7150 – opis uzasadnia, że płat to 7140.`,
  },
  {
    kind: 'text',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    required: true,
    placeholder: 'np. 0,5',
    help: 'Łączna powierzchnia płatów siedliska 7140 na stanowisku, w hektarach (karta z przewodnika: 0,5 ha). Sprawozdanie 2024: w Karpatach od 5 arów do 3 ha, zwykle poniżej hektara; na niżu zwykle ponad hektar, na 15 stanowiskach 10 ha i więcej.',
  },
  pickField(s7120, 'protectedAreas', {
    hint: 'Np. „Obszar Natura 2000 Torfowiska Orawsko-Nowotarskie PLH120016”.',
    help: `Parki narodowe, rezerwaty, obszary Natura 2000, użytki ekologiczne obejmujące stanowisko. W 2024 r. 128 ze 148 stanowisk leżało w siedliskowych obszarach Natura 2000, 27 w parkach narodowych lub ich otulinach, 37 w rezerwatach.

Dlaczego: ochrona czynna (odkrzewianie, zastawki) w praktyce prowadzona jest głównie w parkach i rezerwatach – to wpływa na perspektywy.`,
  }),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. Wspólnota wsi Chyżne',
    help: `Kto zarządza terenem: park narodowy, nadleśnictwo, RDOŚ (rezerwat), wspólnota, gmina, właściciele prywatni (karta z przewodnika: „Wspólnota wsi Chyżne”).

Dlaczego: od zarządcy zależą zastawki na rowach, odkrzewianie i konserwacja melioracji – główne czynniki dla 7140.`,
  },
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu (zdjęcie nr 1)', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu (zdjęcie nr 2)', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu (zdjęcie nr 3)', required: true, help: coordHelp('końca') },
  pickField(s7120, 'transect', {
    defaultValue: '10x200 m',
    hint: 'Standard 10×200 m; dozwolone: oś nie prosta, krótszy i szerszy, mniejszy, trzy izolowane płaty.',
    help: `Przewodnik: na każdym stanowisku jeden transekt 10×200 m, tam gdzie to możliwe. Modyfikacje: zmiana kształtu (dłuższa oś nie jest linią prostą albo transekt jest krótszy i szerszy), zmniejszenie powierzchni do powierzchni siedliska, wybranie punktowo trzech powierzchni przy izolowanych płatach. W karcie z przewodnika: 10x103 m.

Dlaczego: wszystkie pokrycia odnoszą się do transektu – następny obserwator musi wyznaczyć ten sam.`,
  }),
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 683 albo 683–685',
    help: 'Wysokość nad poziomem morza – liczba albo zakres od minimalnej do maksymalnej (karta z przewodnika: 683 m). Siedlisko występuje od niżu po piętro subalpejskie (Tatry, Karkonosze).',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 31.07.2011',
    required: true,
    hint: 'Optymalnie lipiec i pierwsza połowa sierpnia (sprawozdanie 2024: lipiec – sierpień).',
    help: `Dzień badań terenowych. Przewodnik: roślinność torfowisk rozwija się późno; mchy można badać przez cały sezon, ale turzyce ograniczają termin – optymalnie lipiec i pierwsza połowa sierpnia. Obserwacje powtarza się co 3 lub 6 lat.

Praktyka: 2016 – 18.08–27.09; 2017 – 11.06–3.09; 2024 – 30.06–27.08 („od początku lipca do końca sierpnia”; jednodniowe odstępstwo na poligonie bez wpływu na wynik). Formularz ostrzega miękko poza 1.07–15.08 i mocniej poza czerwcem – wrześniem.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const [, mm, dd] = v.split('-').map(Number)
      const md = mm * 100 + dd
      if (md < 601 || md > 930) return 'Termin poza sezonem badań (czerwiec – wrzesień). Turzyce mogą być nie do oznaczenia – opisz powód w uwagach.'
      if (md < 701 || md > 815) return 'Termin poza optymalnym (lipiec – połowa sierpnia). Dopuszczalny, ale zapisz to w uwagach.'
      return null
    },
  },
  pickField(s7120, 'observer', {
    help: `Imię i nazwisko eksperta, który wykonał obserwację i odpowiada za dane (w karcie z przewodnika: „Koordynator” w raporcie rocznym).

Dlaczego: ocena zawiera elementy oceny eksperckiej – trzeba wiedzieć, kogo zapytać o uzasadnienie.`,
  }),
  {
    kind: 'text',
    name: 'additionalExperts',
    label: 'Dodatkowi eksperci',
    placeholder: 'np. —',
    help: 'Osoby, które brały udział w badaniu poza wykonawcą (w karcie z przewodnika: „Dodatkowi koordynatorzy”). Brak – zostaw puste albo wpisz „—”.',
  },
]

// ---------- zdjęcia fitosocjologiczne ----------

const r7120 = methodology7120.releves.fields
const LAYERS = 'Zwarcie i wysokość warstw A, B, C, D'
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, group: LAYERS, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia 5×5 m (WGS84). Trzy zdjęcia: na początku, w środku i na końcu transektu – w tych miejscach mierzy się też poziom wody. Na powierzchniach nietypowych zdjęcia można rozmieścić inaczej.' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach (karta z przewodnika: 683, 685, 684 m).' }),
  pickField(r7120, 'area', { defaultValue: 25, help: 'Powierzchnia zdjęcia w m² – przewodnik: 5×5 m = 25 m². Przy bardzo małych płatach wpisz faktyczną.' }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Torfowiska przejściowe leżą zwykle płasko (0°), młaki górskie i torfowiska źródliskowe – do ok. 30°.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, NW). Dla powierzchni płaskiej wpisz „brak” (w karcie z przewodnika: „0”).' }),
  layerField('coverA', 'Warstwa A – drzewa: procent powierzchni zdjęcia pod koronami drzew. Na torfowisku przejściowym zwykle 0 – wyraźna warstwa drzew to sygnał zarastania albo przejścia w bór bagienny (91D0).', { groupCols: 4 }),
  layerField('coverB', 'Warstwa B – krzewy i podrost: procent powierzchni zdjęcia pod krzewami i młodymi drzewami (sosna, brzoza, kruszyna, wierzby).'),
  layerField('coverC', 'Warstwa C – zielna i krzewinki: turzyce, wełnianki, siedmiopalecznik, bobrek, żurawina (karta z przewodnika: 35–40%).'),
  layerField('coverD', 'Warstwa D – mszysta: torfowce i mchy brunatne. Na dobrze zachowanym torfowisku przejściowym zwykle zwarty, płaski mszar (karta z przewodnika: 100%).'),
  layerField('heightA', 'Warstwa A – typowa wysokość drzew, w metrach. Brak – 0 albo puste.'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów i podrostu, w metrach.'),
  layerField('heightC', 'Warstwa C – typowa wysokość warstwy zielnej, w centymetrach (karta z przewodnika: 30–40 cm).'),
  layerField('heightD', 'Warstwa D – wysokość warstwy mszystej, w centymetrach (karta z przewodnika: 15 cm).'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Caricetum nigrae',
    help: 'Jednostka fitosocjologiczna zdjęcia – zespół albo zbiorowisko, np. Caricetum nigrae, zb. Eriophorum angustifolium-Sphagnum fallax (karta z przewodnika), Caricetum lasiocarpae, Sphagno-Caricetum rostratae.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w poletku 5×5 m z ilościowością w skali Braun-Blanqueta (r, +, 1–5): A – drzewa, B – krzewy i podrost, C – rośliny zielne i krzewinki, D – mszaki (torfowce i mchy brunatne oznacz do gatunku – od nich zależy wskaźnik mchów). Warstwa podpowiada się sama po wyborze gatunku.',
  }),
  {
    kind: 'textarea',
    name: 'remarks',
    label: 'Uwagi do zdjęcia',
    rows: 2,
    placeholder: 'np. Nachylenia i ekspozycji nie podano',
    help: 'Odstępstwa i problemy: inne rozmieszczenie zdjęć, mniejsza powierzchnia, mszaki nieoznaczone do gatunku, puste pola w karcie.',
  },
]

export const methodology7140: Methodology = {
  code: '7140',
  name: 'Torfowiska przejściowe i trzęsawiska (przeważnie z roślinnością z Scheuchzerio-Caricetea nigrae)',
  source:
    'Koczur A. 2012, 7140 Torfowiska przejściowe i trzęsawiska (przeważnie z roślinnością z Scheuchzerio-Caricetea nigrae), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. III, GIOŚ, s. 109–122 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2009–2011, 2015–2018 i 2023–2025.',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj 3 zdjęcia fitosocjologiczne 5×5 m – na początku, w środku i na końcu transektu (na powierzchniach nietypowych można je rozmieścić inaczej, a gdy siedlisko zanika – zmniejszyć ich liczbę). Ilościowość w skali Braun-Blanqueta, warstwy A–D. W tych samych miejscach zmierz poziom wody (wskaźnik „Stopień uwodnienia”).',
    fields: releveFields,
  },

  indicators,

  structureRule: structureRule7140,

  prospects: {
    description:
      'Realne możliwości zachowania właściwego stanu siedliska oraz poprawy stanu niewłaściwego: wykonywane i potencjalne zabiegi ochronne, aktualny stan ochrony (obszar chroniony, plany i operaty), oddziaływania czynników biotycznych i antropogenicznych oraz stan zachowania. Wysoka ocena struktury i funkcji powinna rzutować na wyższą ocenę perspektyw.',
    help: `Weź pod uwagę: uwodnienie i jego trend (melioracje, susze, zmiana klimatu), sukcesję drzew i krzewów, ekspansję trzęślicy, trzciny, trzcinnika i gatunków łąkowych, gatunki obce (tawuła kutnerowata), działalność bobrów (podtapia – zwykle korzystnie, ale skutki trudne do przewidzenia; Proszów 2024 – XX), mechaniczne uszkodzenia (sprzęt do koszenia, składowanie drewna, wydeptywanie). Po stronie plusów: park narodowy, rezerwat, ochrona czynna – zastawki, zasypywanie rowów, odkrzewianie, koszenie trzciny; dobre warunki hydrologiczne.

Przewodnik (pkt 5): działania powinny zmierzać przede wszystkim do podniesienia poziomu wód (zastawki, zasypywanie rowów), a także sukcesywnego wycinania krzewów i podrostu i koszenia (głównie trzciny); ochrona bierna tylko na w pełni naturalnych, dobrze funkcjonujących torfowiskach.

Praktyka 2024: niż – FV 46%, U1 37%, U2 16%; Karpaty – FV 41%, U1 36%, U2 23% (przesuszenie, brak kontynuacji odkrzewiania). Karta z przewodnika: „Bardzo dobre, o ile nie nastąpi zmiana sposobu użytkowania” → FV.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A03', name: 'Koszenie / ścinanie trawy' },
    { code: 'A03.03', name: 'Zaniechanie / brak koszenia' },
    { code: 'A04', name: 'Wypas' },
    { code: 'A04.03', name: 'Zarzucenie pasterstwa, brak wypasu' },
    { code: 'B01', name: 'Zalesianie terenów otwartych' },
    { code: 'B02.02', name: 'Wycinka lasu' },
    { code: 'C01.03', name: 'Wydobywanie torfu' },
    { code: 'C01.03.01', name: 'Ręczne pozyskanie torfu' },
    { code: 'C01.03.02', name: 'Mechaniczne pozyskanie torfu' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D01.02', name: 'Drogi, autostrady' },
    { code: 'E01.03', name: 'Zabudowa rozproszona' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J01.01', name: 'Wypalanie' },
    { code: 'J02.01.02', name: 'Osuszanie terenów morskich, ujściowych, bagiennych' },
    { code: 'J02.04', name: 'Zalewanie - modyfikacje' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód – ogólnie' },
    { code: 'J02.07', name: 'Pobór wód gruntowych' },
    { code: 'K01.03', name: 'Wyschnięcie' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.02', name: 'Nagromadzenie materii organicznej' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
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
            hint: 'Np. kompleks z borem bagiennym 91D0, gatunki chronione (rosiczki, wełnianka delikatna, storczyki).',
            help: 'Wartości przyrodnicze stanowiska poza samym siedliskiem: sąsiednie siedliska (91D0, 7110, 7120, 7150, 7230, 3160), rzadkie i chronione gatunki roślin, mszaków i zwierząt. Karta z przewodnika: „Siedlisko występuje w kompleksie z borem bagiennym 91D0, obecne rzadkie i chronione gatunki roślin (kukułka plamista, wełnianka delikatna)”. Brak – „Nie stwierdzono”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            label: 'Wykonywane działania ochronne',
            help: 'Jakie działania ochronne wykonano i z jakim skutkiem: zastawki i zasypywanie rowów, odkrzewianie i usuwanie nalotu, koszenie trzciny i trzęślicy, usuwanie gatunków obcych, kładki, ogrodzenie (Lipowska – ograniczenie wydeptywania). W 2024 r. ślady zabiegów na 40 ze 148 stanowisk, część sprzed lat – do ponowienia. Brak – „Brak”.',
          },
          {
            kind: 'textarea',
            name: 'proposals',
            label: 'Propozycje wprowadzenia działań ochronnych',
            rows: 3,
            hint: 'Np. zastawki na rowach, odkrzewianie, koszenie trzciny; albo „Ochrona ścisła”.',
            help: 'Jakie działania proponujesz, konkretnie: zahamowanie odpływu (zastawki, zasypanie rowów), stopniowe odkrzaczanie, kilkukrotne w roku wykaszanie trzciny i trzęślicy, usuwanie gatunków obcych (tawuła kutnerowata, olsza pomarszczona), w skrajnych przypadkach zdjęcie murszu z darnią trzęślicy i reintrodukcja mchów; na naturalnych torfowiskach – ochrona bierna (karta z przewodnika: „Ochrona ścisła”).',
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
            help: 'Dlaczego monitoring jest (albo nie jest) potrzebny – karta z przewodnika: „Wskazane jest śledzenie ewentualnych zmian”. W 2024 r. zaproponowano wyłączenie 7 stanowisk: zanik siedliska (Kalnica, Źródliska Jasiołki, Jezioro Karaś E, Lasówka, Bosse), niereprezentatywność (Głuszec), część okrajka torfowiska wysokiego (Litmirz).',
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
                  ? 'Karta z przewodnika podaje przy ocenie ogólnej udział procentowy powierzchni siedliska o różnym stanie zachowania na stanowisku (Chyżne Borcok: FV 100%, U1 –, U2 –). Trzy liczby powinny dać razem 100%.'
                  : `Procent powierzchni siedliska na stanowisku w stanie ${g === 'U1' ? 'niezadowalającym (U1)' : 'złym (U2)'}.`,
            }),
          ),
          {
            ...f,
            help: `${f.help ?? ''}\n\nDla 7140 zapisz tu także rok i typ monitoringu, termin (poza lipcem – połową sierpnia), pogodę przed pomiarem wody (ulewy, susza) i odstępstwa od transektu (krótszy, szerszy, trzy płaty).`.trim(),
          },
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_7140.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer7140(s) })),
  speciesInfo: (name) => {
    const s = findSpecies7140(name)
    if (!s) return undefined
    if (s.group === 'characteristic') {
      if (s.source === 'class') return `${GROUP_LABELS_7140.characteristic} (klasa Scheuchzerio-Caricetea wg Matuszkiewicza 2001 – uzupełnienie listy z przewodnika)`
      if (s.alsoExpansive) return `${GROUP_LABELS_7140.characteristic} (pkt 4 przewodnika; gatunek torfowisk wysokich, w sprawozdaniach bywa ekspansywny)`
      if (s.bog) return `${GROUP_LABELS_7140.characteristic} (pkt 4 przewodnika; gatunek torfowisk wysokich)`
      return `${GROUP_LABELS_7140.characteristic} (pkt 4 przewodnika)`
    }
    return GROUP_LABELS_7140[s.group]
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator7140 = (id: string): IndicatorDef => {
  const i = methodology7140.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 7140`)
  return i
}
