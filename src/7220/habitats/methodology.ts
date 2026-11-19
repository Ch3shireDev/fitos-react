// Metodyka *7220 (źródliska wapienne ze zbiorowiskami Cratoneurion commutati) jako dane.
// Źródło: Parusel J. B. 2010, „7220 Źródliska wapienne ze zbiorowiskami Cratoneurion commutati” [w:] Mróz W. (red.),
// Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ, s. 174–188 (tab. 1 i 2, lista wskaźników
// kardynalnych, karta „Las Grabicz 1”), z praktyką oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014, 2016–2018
// i 2024–2025. Przy rozjazdach pierwszeństwo ma tab. 2, a praktyka trafia do pomocy i ostrzeżeń.
// Siedlisko priorytetowe (*7220), region kontynentalny i alpejski. Podtypy 7220-1 (typowy), 7220-2 (ubogi z zachodzącą
// depozycją węglanu wapnia), 7220-3 (ubogi z kopalną martwicą) i warianty /g, /w, /n. Monitoring metodą punktową
// (płat do 5 m), minitransektu (pas 2 m wzdłuż osi cieku) albo kartowania; zdjęcia od kilkuset cm² (mszaki) do 25 m².
// Wspólne z 7120: GUID, obszary chronione, wymiary transektu, wykonawca, pola zdjęć (warstwy A–D), „Inne informacje”.
// Tab. 2 podaje progi dwiema liczbami (liczba gatunków i pokrycie) – formularz bierze gorszą z dwóch ocen. Struktura –
// reguła silnika z jednym wyjątkiem (`structureRule7220`: XX w erozji chemicznej nie blokuje oceny – tak w sprawozdaniach,
// gdzie erozja chemiczna to XX na 75–95% stanowisk). Ocena ogólna – „najgorszy decyduje” jak w tab. 2 i silniku.
import type { FieldDef, Grade, GradeOrEmpty, IndicatorContext, IndicatorDef, InputValues, Methodology, SelectOption, StructureItem } from '../../7120/habitats/types'
import { aggregateStructure, describeSpecies, mean, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_7220,
  SPECIES_7220,
  defaultLayer7220,
  findSpecies7220,
  isAlien7220,
  isCharacteristic7220,
  isEutrophic7220,
  isExpansive7220,
  isLiverwort7220,
  isProposed7220,
  speciesKey7220,
} from './species'

// ---------- progi liczbowe (tab. 2) ----------

const RANK: Record<Grade, number> = { FV: 0, U1: 1, U2: 2, XX: 3 }
/** Gorsza z dwóch ocen (tab. 2 podaje dla jednej klasy jednocześnie liczbę gatunków i pokrycie). */
export const worse7220 = (a: Grade, b: Grade): Grade => (RANK[a] >= RANK[b] ? a : b)

/**
 * Gatunki charakterystyczne: liczba ≥3 i pokrycie ≥25% – FV; 1–2 albo pokrycie <25% – U1; brak – U2.
 * Pokrycie undefined: przy 1–2 gatunkach i tak U1, przy ≥3 – null (decyduje pokrycie).
 */
export function gradeCharacteristic7220(count: number, cover?: number): Grade | null {
  if (count <= 0) return 'U2'
  const byCount: Grade = count >= 3 ? 'FV' : 'U1'
  if (cover === undefined) return byCount === 'U1' ? 'U1' : null
  return worse7220(byCount, cover >= 25 ? 'FV' : 'U1')
}

/** Ocena z liczby gatunków: brak lub 1 – FV; 2–3 – U1; więcej niż 3 – U2 (dominujące i ekspansywne). */
const byCount013 = (count: number): Grade => (count <= 1 ? 'FV' : count <= 3 ? 'U1' : 'U2')

/**
 * Gatunki dominujące (niecharakterystyczne): brak lub 1 i pokrycie <25% – FV; 2–3 i 25–50% – U1; >3 i >50% – U2.
 * Gdy dominują gatunki charakterystyczne – FV (przypis do tab. 2): liczba 0, pokrycie 0.
 */
export function gradeDominant7220(count: number, cover?: number): Grade | null {
  const c = byCount013(count)
  if (cover === undefined) return c === 'U2' ? 'U2' : null
  return worse7220(c, cover < 25 ? 'FV' : cover <= 50 ? 'U1' : 'U2')
}

/** Rodzime gatunki ekspansywne: brak lub 1 i pokrycie <10% – FV; 2–3 i 10–50% – U1; >3 i >50% – U2. */
export function gradeExpansive7220(count: number, cover?: number): Grade | null {
  const c = byCount013(count)
  if (cover === undefined) return c === 'U2' ? 'U2' : null
  return worse7220(c, cover < 10 ? 'FV' : cover <= 50 ? 'U1' : 'U2')
}

/** Obce gatunki inwazyjne: brak – FV; 1 gatunek i pokrycie <5% – U1; ≥2 gatunki albo pokrycie ≥5% – U2. */
export function gradeAliens7220(count: number, cover = 0): Grade {
  if (count <= 0 && cover <= 0) return 'FV'
  return worse7220(count >= 2 ? 'U2' : 'U1', cover >= 5 ? 'U2' : 'U1')
}

/** Gatunki wskazujące na eutrofizację: brak – FV; 1 gatunek i pokrycie ≤10% – U1; ≥2 gatunki albo pokrycie >10% – U2. */
export function gradeEutrophic7220(count: number, cover = 0): Grade {
  if (count <= 0 && cover <= 0) return 'FV'
  return worse7220(count >= 2 ? 'U2' : 'U1', cover > 10 ? 'U2' : 'U1')
}

/** Wątrobowce: ≥1 gatunek i pokrycie >10% – FV; ≥1 i pokrycie ≤10% – U1; brak – U2. */
export function gradeLiverworts7220(count: number, cover?: number): Grade | null {
  if (count <= 0) return 'U2'
  if (cover === undefined) return null
  return cover > 10 ? 'FV' : 'U1'
}

/** Występowanie martwicy wapiennej: trawertyny >5% powierzchni stanowiska – FV; ≤5% – U1; brak – U2. */
export const gradeTufa7220 = (cover: number): Grade => (cover > 5 ? 'FV' : cover > 0 ? 'U1' : 'U2')

/** Erozja (wsteczna, zboczowa, denna, chemiczna): do 5% powierzchni siedliska – FV; do 20% – U1; ponad 20% – U2. */
export const gradeErosion7220 = (share: number): Grade => (share <= 5 ? 'FV' : share <= 20 ? 'U1' : 'U2')

/**
 * Specyficzna struktura i funkcje (tab. 2, jak silnik): kardynalny U2 → U2; wszystkie kardynalne FV i pozostałe ≥U1 → FV;
 * reszta U1. Wyjątek: XX w erozji chemicznej jest pomijany – w sprawozdaniach to XX na większości stanowisk („metodyka nie
 * precyzuje sposobu określenia”), a struktura była mimo to oceniana. XX w innym kardynalnym – XX jak w silniku.
 */
export function structureRule7220(items: StructureItem[]): GradeOrEmpty {
  return aggregateStructure(items.filter((i) => !(i.id === 'erosionChemical' && i.grade === 'XX')))
}

const pct = (v: number) => `${plNum(v)}%`
const round1 = (n: number) => Math.round(n * 10) / 10
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey7220(n), n])).values()]

/** Pokrycie wiersza bez liczby – „pojedyncze”, jak „+” w karcie: 0,5%. */
const SINGLE = 0.5

/** Gatunki z listy spełniające warunek: nazwy (synonimy raz), suma pokrycia (wiersz bez pokrycia = 0,5) i czy któryś nie miał pokrycia. */
function tally(list: unknown, pred: (name: string) => boolean = () => true): { names: string[]; cover: number; missing: boolean } {
  const rows = speciesRows(list).filter((r) => r.name?.trim() && pred(r.name.trim()))
  const covers = rows.map((r) => num(r.cover))
  return {
    names: distinct(rows.map((r) => r.name.trim())),
    cover: round1(covers.reduce<number>((a, c) => a + (c ?? SINGLE), 0)),
    missing: covers.some((c) => c === undefined),
  }
}

const extended = (ctx?: IndicatorContext) => ctx?.site?.speciesList === 'extended'
const isChar = (ctx?: IndicatorContext) => (n: string) => isCharacteristic7220(n, extended(ctx))

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Powierzchnia nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'minor', label: 'Inne kombinacje – niewielkie zmniejszenie powierzchni (np. przesychanie górnej części źródliska, przesunięcie wypływu)', grade: 'U1' },
  { value: 'decrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi z literatury', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania (pierwsze badanie)', grade: 'XX' },
]
const PROCESS: GradedOption[] = [
  { value: 'intense', label: 'Martwica wapienna wytrąca się (intensywnie)', grade: 'FV' },
  { value: 'trace', label: 'Martwica wapienna wytrąca się śladowo', grade: 'U1' },
  { value: 'none', label: 'Martwica wapienna nie wytrąca się', grade: 'U2' },
  { value: 'unknown', label: 'Nie da się ustalić (np. martwica wytrąca się tylko w sąsiedztwie stanowiska)', grade: 'XX' },
]
const TUFA_ABUNDANCE: GradedOption[] = [
  { value: 'many', label: 'Liczne', grade: 'FV' },
  { value: 'few', label: 'Nieliczne', grade: 'U1' },
  { value: 'none', label: 'Brak', grade: 'U2' },
]
const HYDRATION: GradedOption[] = [
  { value: 'proper', label: 'Właściwy – stały i równomierny wypływ wód podziemnych, o minimalnej głębokości 0,5 cm', grade: 'FV' },
  { value: 'weak', label: 'Słaby – minimalny wypływ wód podziemnych na powierzchni gruntu, powodujący jego stałe lub okresowe zawilgocenie', grade: 'U1' },
  { value: 'improper', label: 'Niewłaściwy – stały brak wypływu lub nadmierny wypływ wód podziemnych', grade: 'U2' },
]
const SUBSTRATE: SelectOption[] = [
  { value: '', label: '—' },
  { value: 'inorganic', label: 'Podłoże nieorganiczne (kamienie, żwir, skała)' },
  { value: 'organic', label: 'Podłoże organiczne (mszaki, liście, gałęzie, martwe części roślin)' },
  { value: 'both', label: 'Oba rodzaje podłoża' },
]
const YES_NO: SelectOption[] = [
  { value: '', label: '—' },
  { value: 'tak', label: 'Tak' },
  { value: 'nie', label: 'Nie' },
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
const chosenGrade = (i: InputValues, field = 'choice'): Grade | null => {
  const g = String(i[field] ?? '')
  return g === 'FV' || g === 'U1' || g === 'U2' || g === 'XX' ? g : null
}

const totalInput = (label: string, help: string): FieldDef => ({ kind: 'number', name: 'total', label, unit: '%', min: 0, max: 100, help })
const NONE_CONFLICT = 'Zaznaczono „Nie stwierdzono”, a lista albo pokrycie nie są puste.'
const mismatch = (g: Grade | null, calc: Grade | null, what: string) => (g && g !== 'XX' && calc && g !== calc ? `Wybrano ${g}, a ${what} wychodzi ${calc} – uzasadnij w opisie.` : null)

const describeList = (i: InputValues) => {
  if (note(i)) return note(i)
  const list = describeSpecies(speciesRows(i.species))
  const t = num(i.total)
  if (list) return t !== undefined ? `${list} – łącznie ${pct(t)}` : list
  if (t !== undefined) return `Łącznie ${pct(t)}`
  return i.none === 'yes' ? 'Brak' : ''
}

// ---------- podtypy i warianty (przewodnik, pkt 2) ----------

export const SUBTYPES_7220 = ['7220-1', '7220-2', '7220-3'] as const
export const SUBTYPE_LABELS_7220: Record<(typeof SUBTYPES_7220)[number], string> = {
  '7220-1': '7220-1 – Podtyp typowy (czynne wytrącanie martwicy, trawertyny i gatunki wskaźnikowe)',
  '7220-2': '7220-2 – Podtyp ubogi z zachodzącym procesem depozycji węglanu wapnia',
  '7220-3': '7220-3 – Podtyp ubogi z kopalną martwicą wapienną',
}
const SUBTYPE_OPTIONS: SelectOption[] = [{ value: '', label: '—' }, ...SUBTYPES_7220.map((s) => ({ value: s, label: SUBTYPE_LABELS_7220[s] }))]
const VARIANT_OPTIONS: SelectOption[] = [
  { value: '', label: '—' },
  { value: 'g', label: '/g – wariant górski i podgórski' },
  { value: 'w', label: '/w – wariant wyżynny' },
  { value: 'n', label: '/n – wariant nizinny' },
]
const LIST_OPTIONS: SelectOption[] = [
  { value: '', label: 'Wg przewodnika (tab. 1 i klasa Montio-Cardaminetea)' },
  { value: 'extended', label: 'Rozszerzona – propozycja z 2018 r. (praktyka 2024: krótkosz, stożki, merzyk, świerząbek…)' },
]

// ---------- gatunki charakterystyczne ----------

function characteristicCount(i: InputValues, ctx?: IndicatorContext): number | undefined {
  const c = num(i.count)
  if (c !== undefined) return c
  if (!rowNames(i.species).length) return i.none === 'yes' ? 0 : undefined
  return tally(i.species, isChar(ctx)).names.length
}
function characteristicCover(i: InputValues, ctx?: IndicatorContext): number | undefined {
  const t = num(i.total)
  if (t !== undefined) return t
  const r = tally(i.species, isChar(ctx))
  return r.names.length ? r.cover : rowNames(i.species).length || i.none === 'yes' ? 0 : undefined
}

// ---------- gatunki dominujące ----------

/** Niecharakterystyczne dominanty: liczba i łączne pokrycie (przypis do tab. 2: dominujące charakterystyczne → FV). */
function dominantTally(i: InputValues, ctx?: IndicatorContext) {
  const ch = isChar(ctx)
  return tally(i.species, (n) => !ch(n))
}

// ---------- stan uwodnienia ----------

const DEPTHS = [1, 2, 3, 4, 5] as const
const depths = (i: InputValues) => DEPTHS.map((n) => num(i[`depth${n}`])).filter((v): v is number => v !== undefined)

// ---------- wskaźniki ----------

const SURFACE = 'w % powierzchni stanowiska (transektu albo płatu; dla „+”, „<1%” albo pojedynczych osobników wpisz 0,5)'
const SINGLE_NOTE = 'Gatunek bez pokrycia liczy się jak „+” (0,5%).'

const erosion = (o: { id: string; label: string; description: string; help: string; placeholder: string }): IndicatorDef => ({
  id: o.id,
  label: o.label,
  parameter: 'structure',
  cardinal: true,
  description: o.description,
  help: `${o.help}

Progi (tab. 2): erozja nie przekracza 5% powierzchni siedliska – FV; nie przekracza 20% – U1; przekracza 20% – U2. Granice 5% i 20% formularz liczy do lepszej klasy. „Nie stwierdzono” = FV.

Wskaźnik kardynalny (lista pod tab. 2: „Erozja – wsteczna, zboczowa, denna, chemiczna”). Sprawozdanie 2016–2018 postulowało jeden wskaźnik „Erozja” bez kardynalności i bez progów procentowych (FV – brak albo bez negatywnego wpływu, U1 – negatywny wpływ, U2 – zniszczenie siedliska) – nie weszło, w 2024 r. oceniano wg tab. 2.`,
  thresholds: { FV: 'Erozja nie przekracza 5% powierzchni siedliska', U1: 'Erozja nie przekracza 20% powierzchni siedliska', U2: 'Erozja przekracza 20% powierzchni siedliska' },
  inputs: [
    { kind: 'number', name: 'share', label: 'Udział zniszczonej powierzchni', unit: '%', min: 0, max: 100, help: 'Przybliżony procent powierzchni siedliska (transektu) zniszczonej przez ten rodzaj erozji, z dokładnością do 10% (przy małych wartościach – dokładniej, bo granica FV to 5%).' },
    NONE_FIELD('Brak erozji', 'Zaznacz „Nie stwierdzono”, gdy nie ma śladów tego rodzaju erozji – wtedy wskaźnik to FV (tak w karcie z przewodnika: „Brak”).'),
    GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed udziałem. „XX – nie oceniono”, gdy nie da się tego ocenić w terenie (najczęściej przy erozji chemicznej). Uzasadnij w opisie.', true),
    noteInput('Opis (opcjonalnie)', o.placeholder, 'Krótki opis (gdzie, na jakim odcinku, przypuszczalne przyczyny), który trafi do „wartości” w karcie zamiast liczby.'),
  ],
  suggest: (i) => {
    const g = chosenGrade(i)
    if (g) return g
    const s = num(i.share)
    if (s !== undefined) return gradeErosion7220(s)
    return i.none === 'yes' ? 'FV' : null
  },
  explain: (i) => {
    if (chosenGrade(i)) return null
    const s = num(i.share)
    return s === undefined ? null : `Erozja obejmuje ${pct(s)} powierzchni siedliska.`
  },
  warn: (i) => {
    const s = num(i.share)
    const parts: string[] = []
    if (i.none === 'yes' && s !== undefined && s > 0) parts.push('Zaznaczono „Nie stwierdzono”, a wpisano udział zniszczonej powierzchni.')
    const m = mismatch(chosenGrade(i), s === undefined ? null : gradeErosion7220(s), 'z udziału')
    if (m) parts.push(m)
    return parts.length ? parts.join(' ') : null
  },
  describe: (i) => {
    if (note(i)) return note(i)
    const s = num(i.share)
    if (s !== undefined) return s === 0 ? 'Brak' : `Ok. ${pct(s)} powierzchni siedliska`
    return i.none === 'yes' ? 'Brak' : ''
  },
})

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description: 'Powierzchnia siedliska na stanowisku (strefa źródliskowa – krenal z wypływem i odpływem – oraz odcinek cieku z wytrącaniem martwicy albo gatunkami wskaźnikowymi) i jej zmiany w porównaniu z wcześniejszymi badaniami albo danymi z literatury.',
    help: `Co wybrać: czy powierzchnia źródliska na stanowisku jest stabilna, rośnie, czy maleje. Samą powierzchnię (zwykle w m²) wpisz obok – trafi do „wartości”, gdy nie ma opisu.

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; inne kombinacje – U1; wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze – U2. Przy pierwszym badaniu – XX (tak w karcie z przewodnika: „100 m²” → XX).

Praktyka: źródliska to siedlisko drobnopowierzchniowe – od kilku do kilkuset m² (2024: od 0,0005 ha na Wzgórzach Sokólskich do 0,25 ha na Źródlisku zachodnim, w Karpatach łącznie 0,09 ha na 19 stanowiskach). U1 przy przesychaniu górnej części źródliska (Jamne 3); U2 przy zaniku siedliska (brak wytrącającej się martwicy – Jamne 1, Źródliska Jasiołki), dewastacji (Morzyk – prace przy linii energetycznej) albo silnej redukcji (Wzgórza Sokólskie). Powierzchnia rośnie np. po wykrocie, który tworzy nową powierzchnię przepływu wody (Dolina Kościeliska).`,
    thresholds: { FV: 'Nie podlega zmianom lub zwiększa się', U1: 'Inne kombinacje', U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze' },
    inputs: [
      selectInput('Zmiana powierzchni', AREA, 'Jak zmieniła się powierzchnia siedliska od poprzedniego badania.'),
      { kind: 'text', name: 'areaText', label: 'Powierzchnia (opcjonalnie)', placeholder: 'np. 100 m²', help: 'Powierzchnia płatów siedliska na stanowisku, np. „100 m²” – trafi do pola „wartość”, gdy nie ma opisu.' },
      noteInput('Opis (opcjonalnie)', 'np. Powierzchnia stabilna, ok. 100 m².', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => note(i) || String(i.areaText ?? '').trim() || labelOf(AREA, i.choice),
  },
  {
    id: 'characteristic',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków charakterystycznych (reprezentatywnych) – taksonów ze związku Cratoneurion commutati i klasy Montio-Cardaminetea – oraz ich udział procentowy na stanowisku. Opisuje typowość i stan zachowania zbiorowisk źródliskowych.',
    help: `Co wpisać: gatunki charakterystyczne stwierdzone na stanowisku, każdy z pokryciem ${SURFACE}. Liczbę gatunków i łączne pokrycie możesz też wpisać wprost.

Lista z tab. 1: Cratoneurion commutati – źródliskowiec zmienny Palustriella (Cratoneuron) commutata, żebrowiec paprociowaty Cratoneuron filicinum, bagniak wapienny Philonotis calcarea, gęsiówka stokrotkolistna Arabis soyeri subsp. subcoriacea, słonecznica wąskolistna Heliosperma quadridentatum, skalnica nakrapiana Saxifraga aizoides, niebielistka trwała Swertia perennis subsp. alpestris, warzucha polska Cochlearia polonica, porostniczka czterodzielna Preissia quadrata, pleszanka kędzierzawa Pellia endiviifolia; Montio-Cardaminetea – rzeżucha gorzka Cardamine amara, źródliskowiec tujowaty Cratoneuron decipiens, wierzbownica mokrzycowa Epilobium alsinifolium. Do tego beznerw tłusty Aneura pinguis (pkt 4) i inne gatunki klasy Montio-Cardaminetea, bo tab. 1 zalicza ją w całości (śledziennica skrętolistna i naprzeciwlistna, gwiazdnica bagienna, zdrojek, bagniak zdrojowy, rzeżucha Opiza).

Progi (tab. 2): liczba gatunków ≥3 i pokrycie ≥25% – FV; 1–2 gatunki, pokrycie <25% – U1; brak – U2. Formularz bierze gorszą z dwóch ocen: 3 gatunki z pokryciem 10% albo 1 gatunek z pokryciem 75% to U1. Pokrycie to suma pokryć gatunków (warstwy się nakładają). Gatunek bez pokrycia („+”) liczy się jako 0,5%.

Lista rozszerzona (pole „Lista gatunków charakterystycznych” w Stanowisku): sprawozdanie 2016–2018 zaproponowało dopisać prątnik nabrzmiały, krótkosz strumieniowy, stożkę ostrokrężną i matową, merzyki, świerząbek orzęsiony (oba regiony) oraz rzeżuchę Opiza, wierzbownicę drobnolistną i fiołek dwukwiatowy (Karpaty) – i zmniejszyć progi pokrycia (FV ≥1 gatunek i ≥5%). Lista weszła do praktyki (2024: krótkosz, merzyk, stożka, świerząbek, gałęziak przęślik liczone jako charakterystyczne), progi – nie wprost.

Praktyka: 2014 i 2018 – FV przy 3 i więcej gatunkach o łącznym pokryciu ponad 25%, U1 przy 1–2 gatunkach albo kilku gatunkach na małej powierzchni, U2 przy braku. 2024: U1 przy 3–6 gatunkach pokrywających 7–12% (Jamne 1, Podhale 1), ale FV przy 1 gatunku – źródliskowcu zmiennym – z pokryciem 30% i 75% (Dolina Sopotnika, Mszana Dolna; tab. 2 daje tu U1 – formularz ostrzega). Karta z przewodnika: przetacznik górski, śledziennica skrętolistna 5%, źródliskowiec zmienny „+” → U1 (przetacznik nie jest gatunkiem charakterystycznym – formularz go nie liczy).

Wskaźnik kardynalny.`,
    thresholds: { FV: 'Liczba gatunków ≥3, pokrycie ≥25%', U1: 'Liczba gatunków 1–2, pokrycie <25%', U2: 'Brak' },
    inputs: [
      speciesInput('Gatunki charakterystyczne', `Gatunki charakterystyczne stwierdzone na stanowisku z pokryciem ${SURFACE}, np. Palustriella commutata 40, Cardamine amara 5.`),
      { kind: 'number', name: 'count', label: 'Liczba gatunków charakterystycznych (opcjonalnie)', min: 0, help: 'Łączna liczba gatunków charakterystycznych na stanowisku, wpisana wprost – ma pierwszeństwo przed liczeniem z listy.' },
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków charakterystycznych w % stanowiska – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak gatunków charakterystycznych', 'Zaznacz „Nie stwierdzono”, gdy na stanowisku nie ma żadnego gatunku charakterystycznego – wtedy wskaźnik to U2.'),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed liczbą gatunków i pokryciem (np. reokren z wartkim nurtem, gdzie źródliskowiec rośnie tylko w kępach). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Warstwa d: Palustriella commutata – pokrycie znikome (+)', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i, ctx) => {
      const g = chosenGrade(i)
      if (g) return g
      const c = characteristicCount(i, ctx)
      return c === undefined ? null : gradeCharacteristic7220(c, characteristicCover(i, ctx))
    },
    explain: (i, ctx) => {
      if (chosenGrade(i)) return null
      const c = characteristicCount(i, ctx)
      if (c === undefined) return null
      const cover = characteristicCover(i, ctx)
      const r = tally(i.species, isChar(ctx))
      const head = num(i.count) !== undefined ? `Gatunków charakterystycznych: ${plNum(c)}` : `Gatunki charakterystyczne z katalogu: ${r.names.length}${r.names.length ? ` (${r.names.join(', ')})` : ''}`
      const list = extended(ctx) ? ' Lista rozszerzona (propozycja 2018).' : ''
      const single = num(i.total) === undefined && r.missing ? ` ${SINGLE_NOTE}` : ''
      if (cover !== undefined) return `${head}; łączne pokrycie ${pct(cover)}.${single}${list}`
      return `${head}. Przy 3 gatunkach i więcej o ocenie decyduje pokrycie – wpisz je przy gatunkach albo łącznie.${list}`
    },
    warn: (i, ctx) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.count) ?? 0) > 0 || (num(i.total) ?? 0) > 0)) parts.push(NONE_CONFLICT)
      const ch = isChar(ctx)
      const proposed = names.filter((n) => !ch(n) && isProposed7220(n))
      if (proposed.length)
        parts.push(`${proposed.join(', ')} – z propozycji rozszerzenia listy (2018), liczone w praktyce 2024; formularz liczy je dopiero przy liście rozszerzonej (pole w Stanowisku).`)
      const other = names.filter((n) => !ch(n) && !isProposed7220(n))
      if (other.length) parts.push(`Nie liczą się jako charakterystyczne: ${other.join(', ')}.`)
      const c = characteristicCount(i, ctx)
      const cover = characteristicCover(i, ctx)
      if (c !== undefined && c >= 1 && c <= 2 && cover !== undefined && cover >= 25)
        parts.push('1–2 gatunki z pokryciem ≥25%: tab. 2 daje U1, ale w 2024 r. przy samym źródliskowcu zmiennym z pokryciem 30–75% oceniano FV – rozważ ocenę ekspercką.')
      const m = mismatch(chosenGrade(i), c === undefined ? null : gradeCharacteristic7220(c, cover), 'z liczby gatunków i pokrycia')
      if (m) parts.push(m)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      const c = num(i.count)
      const t = num(i.total)
      const tail = t !== undefined ? ` – łącznie ${pct(t)}` : ''
      if (list) return `${list}${tail}`
      if (c !== undefined) return `${plNum(c)} gat.${tail}`
      if (t !== undefined) return `Łącznie ${pct(t)}`
      return i.none === 'yes' ? 'Brak' : ''
    },
  },
  {
    id: 'dominant',
    label: 'Gatunki dominujące',
    parameter: 'structure',
    description:
      'Gatunki dominujące ilościowo w poszczególnych warstwach roślinności i ich udział powierzchniowy (ze spisu florystycznego albo zdjęć fitosocjologicznych). Odpowiada na pytanie, czy w źródlisku panują gatunki charakterystyczne, czy obce siedlisku.',
    help: `Co wpisać: dominanty – gatunki o największym pokryciu w swojej warstwie (karta z przewodnika: „należy wymienić tylko gatunki o pokryciu ≥10%”), każdy z pokryciem ${SURFACE}.

Progi (tab. 2): liczba gatunków brak lub 1, pokrycie <25% – FV; 2–3 gatunki, pokrycie 25–50% – U1; ponad 3 gatunki, pokrycie >50% – U2. Przypis: jeśli gatunkami dominującymi są gatunki charakterystyczne, wskaźnik uzyskuje ocenę FV.

Jak liczy formularz: liczba i łączne pokrycie dominantów, które NIE są gatunkami charakterystycznymi (wg listy wybranej w Stanowisku) – tak czytały to sprawozdania („występuje tam powyżej 3 gatunków i nie są to gatunki charakterystyczne” – 2014). Gorsza z dwóch ocen: 1 gatunek z pokryciem 80% to U2 (2024: lepiężnik różowy 80% na Podhalu 1 oceniono U1 – formularz ostrzega). Granice 25% i 50% – do U1.

Praktyka: U2 przy dominacji pokrzywy, manny jadalnej, czartawy, gajowca, czosnaczka, skrzypu olbrzymiego, niecierpka pospolitego, mozgi, psianki (łącznie 65–100%). Dominacja gatunków typowych dla źródlisk z wartkim nurtem, choć spoza listy (dziobkowiec Platyhypnidium riparioides – Będkowska 2, 2018), bywała oceniana FV – wtedy ocena ekspercka. Karta z przewodnika: ostrożeń warzywny 10%, sadziec 10%, świerząbek orzęsiony 30%, krótkosz strumieniowy 15%, stożka ostrokrężna 10% → FV (wg tab. 2 to U2, z listą rozszerzoną – U1; ekspert ocenił FV).`,
    thresholds: {
      FV: 'Liczba gatunków: brak lub 1, pokrycie <25% (jeśli dominują gatunki charakterystyczne – FV)',
      U1: 'Liczba gatunków: 2–3, pokrycie 25–50%',
      U2: 'Liczba gatunków: >3, pokrycie >50%',
    },
    inputs: [
      speciesInput('Gatunki dominujące', `Dominanty (pokrycie ≥10%) z pokryciem ${SURFACE}, np. Chaerophyllum hirsutum 30, Cirsium oleraceum 10.`),
      NONE_FIELD('Brak dominantów spoza listy', 'Zaznacz „Nie stwierdzono”, gdy dominują wyłącznie gatunki charakterystyczne albo brak wyraźnych dominantów – wtedy wskaźnik to FV (przypis do tab. 2).'),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed liczbą i pokryciem (np. dominacja gatunków typowych dla źródlisk z wartkim nurtem). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Warstwa c: świerząbek orzęsiony Chaerophyllum hirsutum 30%…', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i, ctx) => {
      const g = chosenGrade(i)
      if (g) return g
      if (!rowNames(i.species).length) return i.none === 'yes' ? 'FV' : null
      const r = dominantTally(i, ctx)
      return gradeDominant7220(r.names.length, r.cover)
    },
    explain: (i, ctx) => {
      if (chosenGrade(i) || !rowNames(i.species).length) return null
      const r = dominantTally(i, ctx)
      if (!r.names.length) return 'Dominują gatunki charakterystyczne – FV (przypis do tab. 2).'
      return `Dominanty spoza gatunków charakterystycznych: ${r.names.length} (${r.names.join(', ')}); łączne pokrycie ${pct(r.cover)}.${r.missing ? ` ${SINGLE_NOTE}` : ''}`
    },
    warn: (i, ctx) => {
      const parts: string[] = []
      if (i.none === 'yes' && rowNames(i.species).some((n) => !isChar(ctx)(n))) parts.push('Zaznaczono „Nie stwierdzono”, a na liście są dominanty spoza gatunków charakterystycznych.')
      const r = dominantTally(i, ctx)
      const proposed = r.names.filter(isProposed7220)
      if (proposed.length) parts.push(`${proposed.join(', ')} – typowe dla źródlisk (propozycja listy z 2018); przy liście rozszerzonej liczą się jak charakterystyczne.`)
      if (r.names.length <= 1 && r.cover > 50)
        parts.push('Jeden dominant z pokryciem >50%: wg tab. 2 (gorsza z ocen) to U2; w 2024 r. lepiężnik różowy 80% oceniono U1 – rozważ ocenę ekspercką.')
      const m = mismatch(chosenGrade(i), rowNames(i.species).length ? gradeDominant7220(r.names.length, r.cover) : null, 'z liczby i pokrycia dominantów')
      if (m) parts.push(m)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => note(i) || describeSpecies(speciesRows(i.species)) || (i.none === 'yes' ? 'Dominują gatunki charakterystyczne' : ''),
  },
  {
    id: 'expansive',
    label: 'Rodzime gatunki ekspansywne roślin zielnych',
    parameter: 'structure',
    description:
      'Lista rodzimych gatunków ekspansywnych na stanowisku i ich udział. Heliofilne rośliny miejsc wilgotnych wypierają mszaki (nie samo zacienienie, lecz słabo rozkładające się części roślin), a nadmierne zacienienie hamuje wytrącanie wapnia. Odnotowuje się też ekspansywne rośliny drzewiaste (np. bez czarny).',
    help: `Co wpisać: rodzime gatunki ekspansywne z pokryciem ${SURFACE}. W źródliskach notowano m.in. ostrożeń warzywny, sadziec konopiasty, pokrzywę, skrzyp olbrzymi, przytulię czepną, mozgę trzcinowatą, niecierpek pospolity, lepiężnik różowy, psiankę słodkogórz, malinę, turzycę prosową i błotną, wiązówkę błotną, śmiałka darniowego, kostrzewę karpacką, sit siny, kozłka całolistnego, a z drzewiastych – bez czarny i porzeczkę. Gatunki obce wpisz w „Obcych gatunkach inwazyjnych”.

Progi (tab. 2): liczba gatunków brak lub 1, pokrycie <10% – FV; 2–3 gatunki, pokrycie 10–50% – U1; ponad 3 gatunki, pokrycie >50% – U2. Formularz bierze gorszą z dwóch ocen (1 gatunek z 15% to U1, 2 gatunki z 60% – U2); granice 10% i 50% – do U1. Gatunki charakterystyczne (także z listy rozszerzonej – świerząbek orzęsiony) i obce pomija; gatunki spoza katalogu liczy.

Praktyka: 2024 – U1 przy 1–3 gatunkach o łącznym pokryciu 10–25% (sit siny 15% w Jamnem, kostrzewa karpacka i śmiałek po 25% w Dolinie Kościeliskiej), U2 przy lepiężniku różowym 80% (Podhale 1) i ośmiu gatunkach na Wzgórzach Sokólskich. Pojedyncze osobniki skrzypu olbrzymiego – FV (Jamne 2). Lepiężnik biały i świerząbek orzęsiony uznano za typowe dla siedliska (Las Grabicz 2, 2018). Lista nakłada się z „Gatunkami wskazującymi na eutrofizację” – sprawozdanie 2016–2018 proponowało zrezygnować z tamtego wskaźnika. Karta z przewodnika: ostrożeń warzywny 10%, sadziec konopiasty 10% → FV (wg tab. 2: 2 gatunki, 20% – U1).`,
    thresholds: { FV: 'Liczba gatunków: brak lub 1, pokrycie <10%', U1: 'Liczba gatunków: 2–3, pokrycie 10–50%', U2: 'Liczba gatunków: >3, pokrycie >50%' },
    inputs: [
      speciesInput('Gatunki ekspansywne', `Rodzime gatunki ekspansywne z pokryciem ${SURFACE}, np. Cirsium oleraceum 10, Eupatorium cannabinum 10.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków ekspansywnych w % stanowiska – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak gatunków ekspansywnych', 'Zaznacz „Nie stwierdzono”, gdy w źródlisku nie ma rodzimych gatunków ekspansywnych – wtedy wskaźnik to FV.'),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed liczbą i pokryciem. Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Ostrożeń warzywny Cirsium oleraceum 10%…', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      if (!rowNames(i.species).length) {
        const t = num(i.total)
        if (t !== undefined) return t === 0 ? 'FV' : null
        return i.none === 'yes' ? 'FV' : null
      }
      const r = tally(i.species, countsAsExpansive)
      return gradeExpansive7220(r.names.length, num(i.total) ?? r.cover)
    },
    explain: (i) => {
      if (chosenGrade(i) || !rowNames(i.species).length) return null
      const r = tally(i.species, countsAsExpansive)
      const skipped = distinct(rowNames(i.species)).filter((n) => !countsAsExpansive(n))
      const t = num(i.total)
      return [
        skipped.length ? `Pominięte (charakterystyczne, obce): ${skipped.join(', ')}.` : '',
        r.names.length ? `Gatunki ekspansywne: ${r.names.length}; łączne pokrycie ${pct(t ?? r.cover)}.${t === undefined && r.missing ? ` ${SINGLE_NOTE}` : ''}` : 'Gatunków ekspansywnych: brak.',
      ]
        .filter(Boolean)
        .join(' ')
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0)) parts.push(NONE_CONFLICT)
      const aliens = names.filter(isAlien7220)
      if (aliens.length) parts.push(`Gatunki obce wpisz we wskaźniku „Obce gatunki inwazyjne”: ${aliens.join(', ')}.`)
      const typical = names.filter((n) => isCharacteristic7220(n, true))
      if (typical.length) parts.push(`Gatunki charakterystyczne (albo typowe dla źródlisk) nie są ekspansywnymi: ${typical.join(', ')}.`)
      const odd = names.filter((n) => findSpecies7220(n) && countsAsExpansive(n) && !isExpansive7220(n))
      if (odd.length) parts.push(`${odd.join(', ')} – w sprawozdaniach nie wymieniane jako ekspansywne; formularz je liczy, sprawdź.`)
      const r = tally(i.species, countsAsExpansive)
      const m = mismatch(chosenGrade(i), r.names.length ? gradeExpansive7220(r.names.length, num(i.total) ?? r.cover) : null, 'z liczby i pokrycia')
      if (m) parts.push(m)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    description: 'Obce gatunki inwazyjne na stanowisku i ich udział powierzchniowy (ze spisu florystycznego albo zdjęć fitosocjologicznych), np. niecierpek drobnokwiatowy Impatiens parviflora.',
    help: `Co wpisać: gatunki obce z pokryciem ${SURFACE}. W źródliskach wapiennych notowano dotąd pięć: niecierpek drobnokwiatowy (zdecydowanie najczęstszy – 11–18 stanowisk w każdym cyklu), barszcz Sosnowskiego (Rudawka Rymanowska, 2024), nawłoć kanadyjską (Skarpa Wiślicka 1, 2018), moczarkę kanadyjską i orzech włoski (2014).

Progi (tab. 2): brak – FV; 1 gatunek, pokrycie <5% – U1; ≥2 gatunki, pokrycie ≥5% – U2. Formularz bierze gorszą z dwóch ocen: 1 gatunek z 5% albo 2 gatunki z 1% to U2. Gatunek bez pokrycia liczy się jak pojedyncze osobniki (0,5%).

Praktyka: 2024 – U1 przy niecierpku drobnokwiatowym „znikomo, do 1%” i przy dwóch małych osobnikach barszczu Sosnowskiego na pionowej skarpie; U2 nigdzie. 2014 – Dolinka odpływowa, niecierpek 20% (U2). Karta z przewodnika: brak → FV.`,
    thresholds: { FV: 'Brak', U1: 'Liczba gatunków: 1, pokrycie <5%', U2: 'Liczba gatunków: ≥2, pokrycie ≥5%' },
    inputs: [
      speciesInput('Obce gatunki inwazyjne', `Gatunki obce z pokryciem ${SURFACE}, np. Impatiens parviflora 0,5.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków obcych w % stanowiska – ma pierwszeństwo przed sumą z listy. Dla pojedynczych osobników wpisz 0,5.'),
      NONE_FIELD('Brak gatunków obcych', 'Zaznacz „Nie stwierdzono”, gdy na stanowisku nie ma gatunków obcych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const r = tally(i.species)
      const t = num(i.total)
      if (!r.names.length) {
        if (t !== undefined) return t > 0 ? null : 'FV'
        return i.none === 'yes' ? 'FV' : null
      }
      return gradeAliens7220(r.names.length, t ?? r.cover)
    },
    explain: (i) => {
      const r = tally(i.species)
      if (!r.names.length) return null
      const t = num(i.total)
      return `Gatunków obcych: ${r.names.length}; łączne pokrycie ${pct(t ?? r.cover)}.${t === undefined && r.missing ? ` ${SINGLE_NOTE}` : ''}`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0)) parts.push(NONE_CONFLICT)
      if (!names.length && (num(i.total) ?? 0) > 0) parts.push('Wpisano pokrycie bez gatunków – dopisz, jakie to gatunki (od ich liczby zależy ocena).')
      const native = names.filter((n) => findSpecies7220(n) && !isAlien7220(n))
      if (native.length) parts.push(`To nie gatunki obce: ${native.join(', ')} – rodzime ekspansywne i nitrofilne mają własne wskaźniki.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'eutrophic',
    label: 'Gatunki wskazujące na eutrofizację siedliska',
    parameter: 'structure',
    description:
      'Gatunki świadczące o eutrofizacji – rośliny nitrofilne i ziołoroślowe – oraz ich udział powierzchniowy. Siedlisko jest z natury zasobne w składniki pokarmowe, zwłaszcza przy czynnym wytrącaniu się związków wapnia na podłożu skał wapiennych.',
    help: `Co wpisać: gatunki nitrofilne i ziołoroślowe z pokryciem ${SURFACE}. Najczęściej: pokrzywa zwyczajna, podagrycznik, przytulia czepna, ostrożeń warzywny, sadziec konopiasty, mozga trzcinowata, niecierpek pospolity, skrzyp olbrzymi, malina, czosnaczek, a w 2025 r. także turzyca błotna, mięta długolistna, komonica błotna, kłosówka wełnista i mokradłoszka zaostrzona (ta naturalnie rośnie w źródliskach, ale jej obfitość to wyraźny symptom eutrofizacji).

Progi (tab. 2): brak gatunków świadczących o eutrofizacji – FV; 1 gatunek, pokrycie ≤10% – U1; ≥2 gatunki, pokrycie >10% – U2. Formularz bierze gorszą z dwóch ocen: 2 gatunki z małym pokryciem to już U2 – tak oceniano w 2014 r. (podagrycznik i pokrzywa „zazwyczaj poniżej 5%” → U2) i w 2024 r. (2–3 gatunki → U2). Gatunki charakterystyczne i obce pomija.

Praktyka: 2018 – U2 przy 2–4 gatunkach nitrofilnych o pokryciu 20–70%. Sprawozdanie 2016–2018 proponowało zrezygnować ze wskaźnika (nakłada się z gatunkami ekspansywnymi) – nie weszło. Karta z przewodnika: sadziec konopiasty i ostrożeń warzywny „związane z prześwietleniem dna potoku w jednym miejscu” → FV (wg tab. 2 – U2; ocena ekspercka).`,
    thresholds: { FV: 'Brak gatunków świadczących o eutrofizacji siedliska', U1: 'Liczba gatunków: 1, pokrycie ≤10%', U2: 'Liczba gatunków: ≥2, pokrycie >10%' },
    inputs: [
      speciesInput('Gatunki wskazujące na eutrofizację', `Gatunki nitrofilne i ziołoroślowe z pokryciem ${SURFACE}, np. Urtica dioica 5, Aegopodium podagraria 0,5.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków wskazujących na eutrofizację w % stanowiska – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak gatunków wskazujących na eutrofizację', 'Zaznacz „Nie stwierdzono”, gdy na stanowisku nie ma gatunków nitrofilnych – wtedy wskaźnik to FV.'),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed liczbą i pokryciem (np. gatunki tylko w jednym prześwietlonym miejscu). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Eupatorium cannabinum, Cirsium oleraceum – obecność związana z prześwietleniem dna potoku…', 'Krótki opis (skala zjawiska i spowodowane zmiany), który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const r = tally(i.species, countsAsEutrophic)
      const t = num(i.total)
      if (!rowNames(i.species).length) {
        if (t !== undefined) return t > 0 ? null : 'FV'
        return i.none === 'yes' ? 'FV' : null
      }
      return gradeEutrophic7220(r.names.length, t ?? r.cover)
    },
    explain: (i) => {
      if (chosenGrade(i) || !rowNames(i.species).length) return null
      const r = tally(i.species, countsAsEutrophic)
      const t = num(i.total)
      return r.names.length
        ? `Gatunki wskazujące na eutrofizację: ${r.names.length} (${r.names.join(', ')}); łączne pokrycie ${pct(t ?? r.cover)}.${t === undefined && r.missing ? ` ${SINGLE_NOTE}` : ''}`
        : 'Same gatunki charakterystyczne albo obce – nie liczą się.'
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0)) parts.push(NONE_CONFLICT)
      const skipped = names.filter((n) => !countsAsEutrophic(n))
      if (skipped.length) parts.push(`Nie liczą się (charakterystyczne albo obce): ${skipped.join(', ')}.`)
      const odd = names.filter((n) => findSpecies7220(n) && countsAsEutrophic(n) && !isEutrophic7220(n))
      if (odd.length) parts.push(`${odd.join(', ')} – w sprawozdaniach nie wymieniane jako nitrofilne; formularz je liczy, sprawdź.`)
      const r = tally(i.species, countsAsEutrophic)
      const m = mismatch(chosenGrade(i), r.names.length ? gradeEutrophic7220(r.names.length, num(i.total) ?? r.cover) : null, 'z liczby i pokrycia')
      if (m) parts.push(m)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'liverworts',
    label: 'Obecność i pokrycie wątrobowców',
    parameter: 'structure',
    description: 'Gatunki wątrobowców – obok mchów ważnych składników roślinności źródlisk – i ich udział powierzchniowy (ze spisu florystycznego albo zdjęć fitosocjologicznych).',
    help: `Co wpisać: wątrobowce z pokryciem ${SURFACE}. Najczęściej: pleszanka kędzierzawa Pellia endiviifolia, stożka ostrokrężna Conocephalum conicum i matowa C. salebrosum, a także beznerw tłusty Aneura pinguis, porostniczka czterodzielna Preissia quadrata, skosatka Plagiochila porelloides, piórkowiec kutnerowaty Trichocolea tomentella, wargowiec blady Chiloscyphus pallescens, płozik dwuzębny Lophocolea bidentata, porostnica Marchantia polymorpha.

Progi (tab. 2): liczba gatunków ≥1, pokrycie >10% – FV; ≥1, pokrycie ≤10% – U1; brak – U2. 10% formularz liczy do U1.

Praktyka: najgorzej oceniany wskaźnik – w 2024 r. FV tylko na 1 z 47 stanowisk (Karwickie Źródliska, pleszanka ok. 10% + skosatka + piórkowiec, łącznie nieco ponad 10%); zwykle 1–2 gatunki z pokryciem <1–5% (U1) albo brak (U2). Sprawozdania 2018 i 2024: „udział wątrobowców nie jest wskaźnikiem dobrego stanu źródliska” – postulat usunięcia wskaźnika nie wszedł. Wskaźnik niekardynalny, więc U2 obniża strukturę najwyżej do U1. Karta z przewodnika: stożka ostrokrężna 20% → FV.`,
    thresholds: { FV: 'Liczba gatunków ≥1, pokrycie >10%', U1: 'Liczba gatunków ≥1, pokrycie ≤10%', U2: 'Brak' },
    inputs: [
      speciesInput('Wątrobowce', `Gatunki wątrobowców z pokryciem ${SURFACE}, np. Conocephalum conicum 20, Pellia endiviifolia 5.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie wątrobowców w % stanowiska – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak wątrobowców', 'Zaznacz „Nie stwierdzono”, gdy na stanowisku nie ma wątrobowców – wtedy wskaźnik to U2.'),
      noteInput('Opis (opcjonalnie)', 'np. Conocephalum conicum 20%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const r = tally(i.species)
      const t = num(i.total)
      if (!r.names.length) {
        if (t !== undefined) return t > 0 ? gradeLiverworts7220(1, t) : 'U2'
        return i.none === 'yes' ? 'U2' : null
      }
      return gradeLiverworts7220(r.names.length, t ?? r.cover)
    },
    explain: (i) => {
      const r = tally(i.species)
      if (!r.names.length) return null
      const t = num(i.total)
      return `Wątrobowców: ${r.names.length}; łączne pokrycie ${pct(t ?? r.cover)}.${t === undefined && r.missing ? ` ${SINGLE_NOTE}` : ''}`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0)) parts.push(NONE_CONFLICT)
      const notLw = names.filter((n) => findSpecies7220(n) && !isLiverwort7220(n))
      if (notLw.length) parts.push(`To nie wątrobowce: ${notLw.join(', ')} – sprawdź (mchy i rośliny naczyniowe się tu nie liczą, a formularz liczy każdy wiersz).`)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'process',
    label: 'Proces wytrącania się martwicy wapiennej',
    parameter: 'structure',
    cardinal: true,
    description:
      'Czynny proces wytrącania się martwicy wapiennej – najważniejszy element diagnostyczny siedliska, pozwalający zaliczyć źródło do źródeł petryfikujących – i jego natężenie: wytrąca się (intensywnie), wytrąca się śladowo, nie wytrąca się. W opisie można podać rodzaj podłoża (nieorganiczne, organiczne), na którym zachodzi wytrącanie.',
    help: `Co wybrać: czy w źródlisku wytrąca się teraz węglan wapnia i jak intensywnie. Ślady to inkrustacje mszaków (głównie źródliskowca), naskorupienia na kamieniach, liściach i gałęziach, polewy, onkoidy, narastające progi i „buły” martwicy mszystej. Wątpliwości rozstrzyga kwas solny (burzenie), mikroskop albo pomiar przewodności wody.

Progi (tab. 2): martwica wapienna wytrąca się (intensywnie) – FV; wytrąca się śladowo – U1; nie wytrąca się – U2.

Praktyka: 2018 – XX na 6 stanowiskach (Dolina Górnej Łeby, Kosobudki), gdzie martwica nie odkładała się w samym źródlisku, tylko w sąsiedztwie (opcja „Nie da się ustalić”). 2024: U1 przy śladowym wytrącaniu na kamieniach, korze, gałęziach i liściach (11 stanowisk na niżu); U2 tam, gdzie wytrącania nie było (Jamne 1, Źródliska Jasiołki, Berest – Feliszówka; przewodność 210–240 µS/cm, „zdecydowanie niższa od najniższej zanotowanej w siedlisku 7220”) – stanowiska zaproponowano wyłączyć z monitoringu. Wysoki stan wody i silny nurt obniżają ocenę (Będkowska 2: z FV na U1 – próg zalewany zamiast przesączania). Sprawozdanie 2016–2018 postulowało definicję, w której czynne wytrącanie jest warunkiem koniecznym siedliska. Karta z przewodnika: „Liczne” → FV.

Wskaźnik kardynalny.`,
    thresholds: thresholdsOf(PROCESS),
    inputs: [
      selectInput('Natężenie wytrącania', PROCESS, 'Czy i jak intensywnie wytrąca się teraz martwica wapienna.'),
      { kind: 'select', name: 'substrate', label: 'Podłoże wytrącania (opcjonalnie)', options: SUBSTRATE, help: 'Na czym odkłada się martwica: podłoże nieorganiczne (kamienie, żwir, skała) albo organiczne (mszaki, liście, gałęzie, martwe części roślin). Tab. 1: „w opisie można podać rodzaj podłoża”.' },
      { kind: 'number', name: 'conductivity', label: 'Przewodność wody (opcjonalnie)', unit: 'µS/cm', min: 0, help: 'Przewodność elektrolityczna wody wypływającej ze źródła, jeśli mierzysz konduktometrem. Nie wpływa na ocenę – trafia do opisu. W 2024 r. przewodność 210–240 µS/cm uznano za wykluczającą wytrącanie martwicy (Berest – Feliszówka).' },
      noteInput('Opis (opcjonalnie)', 'np. Martwica wytrąca się intensywnie na mszakach i kamieniach.', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(PROCESS)),
    warn: (i, ctx) => {
      const sub = String(ctx?.site?.subtype ?? '')
      if (sub === '7220-3' && (i.choice === 'intense' || i.choice === 'trace'))
        return 'Podtyp 7220-3 to źródła z kopalną martwicą, bez czynnego wytrącania – sprawdź podtyp (7220-1 albo 7220-2).'
      if ((sub === '7220-1' || sub === '7220-2') && i.choice === 'none') return `Podtyp ${sub} zakłada czynne wytrącanie martwicy – przy jego braku sprawdź podtyp (7220-3) albo czy to jeszcze siedlisko 7220.`
      return null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const c = num(i.conductivity)
      return [labelOf(PROCESS, i.choice), i.substrate ? labelOf(SUBSTRATE, i.substrate).toLowerCase() : '', c !== undefined ? `przewodność ${plNum(c)} µS/cm` : ''].filter(Boolean).join(', ')
    },
  },
  {
    id: 'tufa',
    label: 'Występowanie martwicy wapiennej',
    parameter: 'structure',
    cardinal: true,
    description:
      'Obecność różnego rodzaju martwic wapiennych – najważniejszy element odróżniający siedlisko od innych siedlisk w miejscach wypływu lub wysięku wód podziemnych: typ genetyczny i geomorfologiczny utworów oraz ich występowanie na powierzchni (liczne, nieliczne, brak). W uwagach – czy stwierdzono martwicę kopalną (fosylną lub subfosylną).',
    help: `Co wpisać: jaką część powierzchni stanowiska pokrywają trawertyny i inne martwice wapienne (w %), ich typ (martwica mszysta, naskorupienia, polewy, onkoidy, progi, tarasy, wodospady, zapory) i czy jest martwica kopalna. Bez pomiaru – wybierz ocenę z tab. 1: liczne, nieliczne, brak.

Progi (tab. 2): trawertyny pokrywają >5% powierzchni stanowiska – FV; ≤5% – U1; brak – U2. Formularz: udział wpisany liczbą ma pierwszeństwo przed oceną „liczne/nieliczne/brak” (liczne → FV, nieliczne → U1, brak → U2 – to odwzorowanie skali z tab. 1, nie norma).

Praktyka: na stanowiskach FV martwica pokrywa zwykle 30–100% (najczęściej 80–100%), martwica mszysta ma nawet 0,4–1 m miąższości, progi bywają kilkumetrowe (Tatry, Pieniny). U1 przy gródkach martwicy w podłożu pokrywających 1–3% (5 nowych stanowisk na niżu w 2024 r.) albo 3–4% (2018). XX (2018, Dolina Górnej Łeby), gdy martwica występowała tylko w sąsiedztwie stanowiska. Martwica wyłącznie kopalna, bez czynnego wytrącania, to zgodnie z definicją przewodnika najwyżej podtyp ubogi 7220-3 – sprawozdanie 2016–2018 kwestionuje zaliczanie takich źródeł do siedliska. Karta z przewodnika: „Liczne” → FV.

Wskaźnik kardynalny.`,
    thresholds: { FV: 'Trawertyny pokrywają >5% powierzchni stanowiska', U1: 'Trawertyny pokrywają ≤5% powierzchni stanowiska', U2: 'Brak' },
    inputs: [
      { kind: 'number', name: 'cover', label: 'Pokrycie martwicy wapiennej', unit: '%', min: 0, max: 100, help: 'Jaką część powierzchni stanowiska (transektu albo płatu) pokrywają trawertyny i inne martwice wapienne. Granica tab. 2: powyżej 5% – FV, do 5% – U1, 0 – U2.' },
      { ...selectInput('Występowanie (bez pomiaru)', TUFA_ABUNDANCE, 'Ocena z tab. 1, gdy nie szacujesz udziału w procentach. Udział wpisany liczbą ma pierwszeństwo.', 'abundance'), required: false },
      { kind: 'text', name: 'tufaType', label: 'Typ martwicy (opcjonalnie)', placeholder: 'np. martwica mszysta, naskorupienia, progi', help: 'Typ genetyczny i geomorfologiczny utworów: martwica mszysta (inkrustowane mszaki), naskorupienia na kamieniach i szczątkach roślin, polewy, onkoidy, progi, tarasy, wodospady, zapory. Trafia do opisu.' },
      { kind: 'select', name: 'fossil', label: 'Martwica kopalna (opcjonalnie)', options: YES_NO, help: 'Czy na stanowisku stwierdzono martwicę kopalną (fosylną albo subfosylną) – tab. 1 każe to odnotować w uwagach. Nie wpływa na ocenę.' },
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed pokryciem. „XX – nie oceniono”, gdy martwica występuje tylko w sąsiedztwie stanowiska (tak w 2018 r. w Dolinie Górnej Łeby). Uzasadnij w opisie.', true),
      noteInput('Opis (opcjonalnie)', 'np. Liczne', 'Krótki opis, który trafi do „wartości” w karcie zamiast opisu wygenerowanego z pól.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const c = num(i.cover)
      if (c !== undefined) return gradeTufa7220(c)
      return byOption(gradeMap(TUFA_ABUNDANCE), 'abundance')(i)
    },
    explain: (i) => {
      if (chosenGrade(i)) return null
      const c = num(i.cover)
      return c === undefined ? null : `Martwica wapienna pokrywa ${pct(c)} powierzchni stanowiska.`
    },
    warn: (i, ctx) => {
      const parts: string[] = []
      const c = num(i.cover)
      const a = byOption(gradeMap(TUFA_ABUNDANCE), 'abundance')(i)
      if (c !== undefined && a && a !== gradeTufa7220(c)) parts.push(`Ocena „${labelOf(TUFA_ABUNDANCE, i.abundance)}” nie zgadza się z pokryciem ${pct(c)} (${gradeTufa7220(c)}) – formularz bierze pokrycie.`)
      const m = mismatch(chosenGrade(i), c === undefined ? a : gradeTufa7220(c), 'z pokrycia')
      if (m) parts.push(m)
      if (String(ctx?.site?.subtype ?? '') === '7220-3' && i.fossil === 'nie') parts.push('Podtyp 7220-3 to źródła z kopalną martwicą – a wpisano, że jej nie stwierdzono; sprawdź podtyp.')
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const c = num(i.cover)
      const head = c !== undefined ? (c === 0 ? 'Brak' : `Martwica pokrywa ok. ${pct(c)} stanowiska`) : labelOf(TUFA_ABUNDANCE, i.abundance)
      const type = String(i.tufaType ?? '').trim()
      return [head, type, i.fossil === 'tak' ? 'obecna martwica kopalna' : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'hydration',
    label: 'Stan uwodnienia',
    parameter: 'structure',
    cardinal: true,
    description:
      'Właściwe warunki hydrologiczne są niezbędne do istnienia siedliska: wody podziemne powinny wypływać z niewielką, lecz stałą prędkością – do wytrącania wapnia wystarczy, że woda przesącza się przez pokrywę roślinną albo spiętrza w korycie na kilka centymetrów. Silny wypływ i wysoki poziom wody niszczą martwicę i hamują jej depozycję. Mierzy się głębokość wody i określa stan uwodnienia: właściwy, słaby, niewłaściwy.',
    help: `Co wybrać i zmierzyć: stan uwodnienia z tab. 2 oraz głębokość wody w pięciu punktach (karta z przewodnika: w miejscach trzech zdjęć i dwóch między nimi; „podłoże wilgotne” zapisz w opisie). Opisz też wydajność źródła i charakter przepływu – przesiąkanie, przekapywanie, wartki albo powolny przepływ, niewielkie misy z wodą.

Progi (tab. 2): właściwy (stały i równomierny wypływ wód podziemnych, o minimalnej głębokości 0,5 cm) – FV; słaby (minimalny wypływ wód podziemnych na powierzchni gruntu, powodujący jego stałe lub okresowe zawilgocenie) – U1; niewłaściwy (stały brak wypływu lub nadmierny wypływ wód podziemnych) – U2. Formularz bierze ocenę z wyboru; pomiary trafiają do opisu, a gdy wszystkie są płytsze niż 0,5 cm przy ocenie „właściwy” – ostrzega. Uwaga: zbyt silny wypływ to też U2.

Praktyka: 2014 i 2018 – U1 przy słabym wypływie albo częściowym przesuszeniu (stopień uwodnienia różny w różnych częściach stanowiska), U2 przy braku wypływu (Las Grabicz 3, Skarpa Wiślicka 7) i wyraźnym przesuszeniu (Baseny wywierzyskowe). 2024 – U1 tam, gdzie górna część źródliska przeschła po przesunięciu wypływu (Jamne 3, Wzgórza Sokólskie), U2 nigdzie. Sprawozdanie 2016–2018 przestrzega: helokreny o niewielkiej wydajności, gdzie woda przesącza się prawie niewidocznie, mogą być w dobrym stanie, a wydajność wielu źródeł się waha – „po roślinności widać, czy stan uwodnienia jest typowy”; opisz wydajność, by porównać lata. Karta z przewodnika: 10, 7 cm, „podłoże wilgotne”, 15, 15 cm → FV.

Wskaźnik kardynalny.`,
    thresholds: thresholdsOf(HYDRATION),
    inputs: [
      selectInput('Stan uwodnienia', HYDRATION, 'Jak wypływa woda na stanowisku w dniu obserwacji.'),
      ...DEPTHS.map(
        (n): FieldDef => ({
          kind: 'number',
          name: `depth${n}`,
          group: 'Głębokość wody (cm)',
          groupCols: 5,
          label: `Punkt ${n}`,
          unit: 'cm',
          min: 0,
          help:
            n % 2 === 1
              ? `Głębokość wody w cm w miejscu zdjęcia fitosocjologicznego (${n === 1 ? 'zdjęcie I' : n === 3 ? 'zdjęcie II' : 'zdjęcie III'}). Podłoże tylko wilgotne – zostaw puste i zapisz w opisie.`
              : `Głębokość wody w cm między zdjęciami ${n === 2 ? 'I i II' : 'II i III'}. Podłoże tylko wilgotne – zostaw puste i zapisz w opisie.`,
        }),
      ),
      noteInput('Opis (opcjonalnie)', 'np. Zdjęcie 1: 10 cm, zdjęcie 2: 7 cm, zdjęcie 3: podłoże wilgotne…', 'Krótki opis (wydajność źródła, charakter przepływu, pomiary), który trafi do „wartości” w karcie zamiast opisu wygenerowanego z pól.'),
    ],
    suggest: byOption(gradeMap(HYDRATION)),
    explain: (i) => {
      const d = depths(i)
      return d.length ? `Pomiary: ${d.map(plNum).join(', ')} cm (średnio ${plNum(round1(mean(d)!))} cm).` : null
    },
    warn: (i) => {
      const d = depths(i)
      if (i.choice === 'proper' && d.length && d.every((x) => x < 0.5)) return 'Wszystkie pomiary płytsze niż 0,5 cm – tab. 2 wymaga dla FV minimalnej głębokości 0,5 cm; sprawdź ocenę.'
      return null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const d = depths(i)
      const head = labelOf(HYDRATION, i.choice).split(' – ')[0]
      return [head, d.length ? `głębokość wody: ${d.map(plNum).join(', ')} cm` : ''].filter(Boolean).join('; ')
    },
  },
  erosion({
    id: 'erosionBack',
    label: 'Erozja wsteczna',
    description:
      'Przypadki erozji wstecznej, powodującej zanik aktywności źródeł (cofanie się wypływu), ich udział w powierzchni siedliska i ocena: erozji brak, erozja mała, erozja duża. W opisie – przypuszczalne przyczyny erozji.',
    help: `Co wpisać: jaką część powierzchni siedliska zniszczyła erozja wsteczna – wypływ „cofa się” w głąb stoku, nad nim powstaje nisza, źródlisko poniżej przesycha. Delikatne struktury martwicy są bardzo podatne na erozję wodną.

Praktyka: zwykle brak (2024: FV na wszystkich 47 stanowiskach; w Jamnem 1 wypływ wyraźnie się cofnął – spod korzeni świerka – ale na mniej niż 5% powierzchni). U1 na Źródlisku wschodnim i zachodnim (2014) i w Lesie Kamieniec 3 (ok. 20%, 2018). Karta z przewodnika: „Brak” → FV.`,
    placeholder: 'np. Brak',
  }),
  erosion({
    id: 'erosionSlope',
    label: 'Erozja zboczowa',
    description: 'Przypadki erozji zboczowej (osuwiska, podcięcia erozyjne stoków) niszczącej siedlisko, ich udział w powierzchni siedliska i ocena: erozji brak, erozja mała, erozja duża. W opisie – przypuszczalne przyczyny.',
    help: `Co wpisać: jaką część powierzchni siedliska zniszczyły osuwiska i podcięcia stoków (także przez potok płynący dnem doliny).

Praktyka: rzadka. 2024 – U1 tylko w Bieszczadach (Roztoki Dolne: dolną część stanowiska podcina potok, po osunięciu się mas ziemnych; ok. 10% powierzchni) – grozi obsunięciem nagromadzonej martwicy mszystej; Moczary i Karwickie Źródła – wymywanie luźnego materiału przy wartkim przepływie, poniżej 5% (FV). Karta z przewodnika: „Brak” → FV.`,
    placeholder: 'np. Brak',
  }),
  erosion({
    id: 'erosionBed',
    label: 'Erozja denna koryta cieków',
    description: 'Przypadki erozji dennej koryta cieków, przyczyniającej się do podcinania erozyjnego stoków i erozji wstecznej, ich udział w powierzchni siedliska i ocena: erozji brak, erozja mała, erozja duża. W opisie – przypuszczalne przyczyny.',
    help: `Co wpisać: jaką część powierzchni siedliska zajmuje koryto pogłębiające się przez erozję – woda wcina się w podłoże (np. gliniaste), niszcząc martwicę na dnie i brzegach.

Praktyka: 2014 – U2 na 6 stanowiskach (Las Grabicz 1, 2, 4, 5, Las Kamieniec 3, Skarpa Wiślicka 7; erozja niszczyła martwicę na ponad 20%, miejscami na 90% powierzchni). 2018 – XX na 11 stanowiskach. 2024 – U1 w Jamnem 1 (wąskie, głębokie koryto na ok. 7 m) i na Górze Bucze (ok. 20% stanowiska), a w Jamnem 2 rynna 20 m, która „nie pogłębia się w zauważalny sposób” i nie przekracza 5% – FV. Karta z przewodnika: „Brak” → FV.`,
    placeholder: 'np. Brak',
  }),
  erosion({
    id: 'erosionChemical',
    label: 'Erozja chemiczna',
    description:
      'Przypadki erozji chemicznej, zakłócającej wytrącanie się martwicy wapiennej i przyczyniającej się do eutrofizacji siedliska (np. pestycydy, zanieczyszczenia chemiczne), ich udział w powierzchni siedliska i ocena: erozji brak, erozja mała, erozja duża. W opisie – przypuszczalne przyczyny.',
    help: `Co wpisać: jaką część powierzchni siedliska dotyka erozja chemiczna – rozpuszczanie martwicy i zakłócenie jej wytrącania przez zanieczyszczenia wody (spływ z pól, pestycydy, herbicydy, ścieki, paliwa).

Praktyka: w terenie zwykle niemożliwa do stwierdzenia – „metodyka nie precyzuje sposobu określenia stopnia erozji”. XX na 77% stanowisk w 2018 r. i na 39 z 47 w 2024 r.; FV tylko tam, gdzie ekspert wykluczył oznaki erozji. Dlatego XX w tym wskaźniku formularz pomija przy ocenie struktury (inaczej niemal każde stanowisko miałoby strukturę XX) – w sprawozdaniach strukturę oceniano mimo XX. Karta z przewodnika: „Brak” → FV.`,
    placeholder: 'np. Nie da się ocenić w terenie – brak oznak zanieczyszczenia wody.',
  }),
]

/** Gatunek liczony jako ekspansywny: wszystko poza charakterystycznymi (także z listy rozszerzonej) i obcymi. */
function countsAsExpansive(name: string) {
  return !isCharacteristic7220(name, true) && !isAlien7220(name)
}
/** Gatunek liczony jako wskazujący na eutrofizację: wszystko poza charakterystycznymi (wg przewodnika) i obcymi. */
function countsAsEutrophic(name: string) {
  return !isCharacteristic7220(name) && !isAlien7220(name)
}

// ---------- pola stanowiska ----------

const s7120 = methodology7120.siteFields
const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} stanowiska (transektu – zdjęcie ${where === 'początku' ? 'I' : 'III'}), z odbiornika GPS (WGS84). Przy metodzie punktowej wystarczą współrzędne źródła w polu początku.

Dlaczego: obserwacje powtarza się co 1–6 lat w tym samym miejscu, a źródliska mają po kilka–kilkaset m².`

const METHOD_OPTIONS: SelectOption[] = [
  { value: '', label: '—' },
  { value: 'point', label: 'Punktowa – płat, którego najdłuższy bok ma mniej niż 5 m (całe stanowisko)' },
  { value: 'minitransect', label: 'Minitransekt – płat dłuższy niż 5 m; pas 2 m szerokości wzdłuż osi koryta' },
  { value: 'mapping', label: 'Kartowanie fitosocjologiczne' },
]

const siteFields: FieldDef[] = [
  {
    kind: 'select',
    name: 'subtype',
    label: 'Podtyp siedliska',
    options: SUBTYPE_OPTIONS,
    hint: 'Typowy (7220-1), ubogi z czynną depozycją (7220-2), ubogi z kopalną martwicą (7220-3).',
    help: `Podtyp wg przewodnika (pkt 2):
• 7220-1 – podtyp typowy: czynne wytrącanie martwicy, trawertyny (albo inne martwice) i wskaźnikowe gatunki roślin;
• 7220-2 – podtyp ubogi z zachodzącym procesem depozycji węglanu wapnia: czynne wytrącanie i martwica, bez gatunków wskaźnikowych;
• 7220-3 – podtyp ubogi z kopalną martwicą wapienną: trawertyny i gatunki wskaźnikowe, bez czynnego wytrącania.

Formularz nie zmienia od podtypu progów – tab. 2 jest wspólna; ostrzega tylko, gdy proces wytrącania nie pasuje do podtypu. Sprawozdanie 2016–2018 kwestionuje zaliczanie do siedliska źródeł bez czynnego wytrącania (definicja z Interpretation Manual: „active formation of travertine or tufa”). Karta z przewodnika: „7220-1 Petryfikujące źródła z utworami tufowymi (Cratoneurion)”.`,
  },
  {
    kind: 'select',
    name: 'variant',
    label: 'Wariant',
    options: VARIANT_OPTIONS,
    hint: 'Dopisek do kodu podtypu: /g, /w albo /n.',
    help: 'Wariant florystyczny wg przewodnika (pkt 2) – dopisywany do kodu podtypu: /g – górski i podgórski (Tatry, Pieniny, Gorce, Bieszczady, Beskidy, Pogórze Cieszyńskie), /w – wyżynny (Jura Krakowsko-Częstochowska, Ponidzie, Sudety), /n – nizinny (Pomorze, Suwalszczyzna, Wielkopolska). Np. 7220-1/g. Formularz nie zmienia od wariantu progów.',
  },
  {
    kind: 'select',
    name: 'speciesList',
    label: 'Lista gatunków charakterystycznych',
    options: LIST_OPTIONS,
    hint: 'Domyślnie wg przewodnika; rozszerzona – jak eksperci w 2024 r.',
    help: `Którą listę gatunków charakterystycznych liczy formularz we wskaźnikach „Gatunki charakterystyczne” i „Gatunki dominujące”:
• wg przewodnika (domyślnie) – tab. 1 (Cratoneurion commutati i wymienione gatunki Montio-Cardaminetea), pkt 4 (beznerw tłusty) i pozostałe gatunki klasy Montio-Cardaminetea (śledziennica skrętolistna i naprzeciwlistna, gwiazdnica bagienna, zdrojek, bagniak zdrojowy, rzeżucha Opiza);
• rozszerzona – dodatkowo propozycja ze sprawozdania 2016–2018: prątnik nabrzmiały, krótkosz strumieniowy, stożka ostrokrężna i matowa, merzyki (Rhizomnium punctatum, R. magnifolium), świerząbek orzęsiony, wierzbownica drobnolistna, fiołek dwukwiatowy, a za sprawozdaniem 2024 – gałęziak przęślik. Tak liczyli eksperci w 2024 r.

Wybór zapisz w uwagach – od niego zależy porównywalność z poprzednimi kartami.`,
  },
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Las Grabicz 1',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Las Grabicz 1”, „Jamne 2”, „Skarpa Wiślicka 6”, „Tatry – Dol. Kościeliska”. Stanowiskiem jest jedno źródlisko (krenal z odpływem i odcinkiem cieku z martwicą) albo zespół wypływów jednego źródliska.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego stanowiska. W 2024 r. połączono np. Skarpę Wiślicką 3 i 6 – „funkcjonalnie oba płaty należą do jednego źródliska zasilanego dwoma wypływami”.`,
  },
  pickField(s7120, 'guid'),
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. referencyjne',
    help: 'Typ stanowiska w sieci monitoringu, np. „referencyjne” – dobrze zachowane źródlisko, punkt odniesienia (tak w karcie z przewodnika), albo „uzupełniające” (w 2024 r. 22 z 47 stanowisk). Jeśli nie wiesz, zostaw puste.',
  },
  {
    kind: 'text',
    name: 'areaName',
    label: 'Nazwa obszaru',
    placeholder: 'np. Cieszyńskie Źródła Tufowe',
    help: 'Obszar (Natura 2000, kraina), w którym leży stanowisko, np. „Cieszyńskie Źródła Tufowe” (karta z przewodnika), „Tatry”, „Ostoja Gorczańska”, „Dolinki Jurajskie”, „Karwickie Źródliska”.',
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. zbiorowisko ze związku Cratoneurion commutati',
    help: 'Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Identyfikatory siedliska (przewodnik, pkt 1): Cratoneuretum falcati (= Arabido-Cratoneuretum falcati), Cratoneuro-Saxifragetum aizoidis (Tatry), Cratoneuro filicini-Lemnetum trisulcae, zbiorowisko Pellia endiviifolia, zbiorowisko Cratoneuron commutatum, zbiorowisko Preissia quadrata (Fontinaletea antipyreticae). Eksperci notowali też m.in. Cratoneuro filicinae-Cardaminetum, Pellieto-Conocephaletum i zbiorowiska kadłubowe. Obok – zbiorowiska sąsiednie (karta z przewodnika: zbiorowisko Chaerophyllum hirsutum ze związku Alno-Padion).',
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Typ źródła, położenie, długość odcinka z martwicą, nachylenie, wydajność źródła, otoczenie.',
    help: `Krótka charakterystyka stanowiska:
• typ źródła: warstwowe, szczelinowe, uskokowe, krasowe; wypływ skoncentrowany (reokren), wysięk i podmokłość (helokren), wywierzysko (limnokren);
• gdzie leży płat: dno doliny potoku, skarpa, zbocze, las albo teren otwarty; szerokość koryta, długość odcinka z martwicą, powierzchnia;
• nachylenie i ekspozycja, wydajność źródła („zadowalająca”), charakter przepływu;
• otoczenie: grąd, łęg, buczyna, świerczyna, łąka; ujęcia wody, drogi, szlaki.

Dlaczego: granice siedliska wyznacza strefa źródliskowa i odcinek cieku z wytrącaniem martwicy – opis uzasadnia, że płat to 7220, a nie np. źródlisko bez martwicy (Montio-Cardaminetea) czy torfowisko zasadowe 7230.`,
  },
  {
    kind: 'text',
    name: 'areaM2',
    label: 'Powierzchnia płatów siedliska',
    unit: 'm²',
    required: true,
    placeholder: 'np. 100',
    help: 'Łączna powierzchnia płatów siedliska na stanowisku, w m² (karta z przewodnika: 100 m² na odcinku ok. 100 m). Źródliska są drobnopowierzchniowe – od kilku do kilkuset m²; w 2024 r. od 5 m² (Wzgórza Sokólskie) do ok. 2500 m² (Źródlisko zachodnie).',
  },
  pickField(s7120, 'protectedAreas', {
    hint: 'Np. „Obszar Natura 2000 Cieszyńskie Źródła Tufowe PLH240001”.',
    help: `Parki narodowe, rezerwaty, obszary Natura 2000, użytki ekologiczne obejmujące stanowisko. W 2024 r. 32 z 47 stanowisk leżały w 17 obszarach Natura 2000 (m.in. Cieszyńskie Źródła Tufowe PLH240001, Tatry PLC120001, Ostoja Gorczańska PLH120018), 4 w parkach narodowych, 8 w rezerwatach.

Dlaczego: siedlisko jest priorytetowe; forma ochrony decyduje, czy da się zatrzymać np. rozbudowę ujęcia wody albo wycinkę wokół źródliska.`,
  }),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. Nadleśnictwo Ustroń',
    help: `Kto zarządza terenem: nadleśnictwo, park narodowy, RDOŚ (rezerwat), gmina, właściciele prywaci (karta z przewodnika: „Nadleśnictwo Ustroń”).

Dlaczego: od zarządcy zależą wycinka wokół źródliska, usuwanie martwych drzew, drogi zrywkowe i ujęcia wody – główne zagrożenia dla 7220.`,
  },
  {
    kind: 'select',
    name: 'method',
    label: 'Metoda badań',
    options: METHOD_OPTIONS,
    help: `Przewodnik: monitoring obejmuje cały obszar biodepozycji i występowania martwicy oraz roślinności wskaźnikowej, metodą:
• punktową – dla płatów, których najdłuższy bok ma mniej niż 5 m (bada się całe stanowisko);
• minitransektu – dla płatów dłuższych niż 5 m (część stanowiska: pas 2 m szerokości na całej długości stanowiska, osią jest środek koryta cieku; punkty badawcze rozmieszczone regularnie);
• kartowania fitosocjologicznego.

Dlaczego: od metody zależy, do jakiej powierzchni odnoszą się wszystkie pokrycia w karcie.`,
  },
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu (zdjęcie I)', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu (zdjęcie III)', help: coordHelp('końca') },
  pickField(s7120, 'transect', {
    defaultValue: '',
    required: false,
    placeholder: 'np. 2x100 m',
    hint: 'Minitransekt: pas 2 m wzdłuż osi koryta (np. 2×100 m). Metoda punktowa – zostaw puste.',
    help: `Wymiary minitransektu: szerokość 2 m, długość – cała długość stanowiska, kształt liniowy albo nieregularny, osią jest środek koryta cieku (karta z przewodnika: 2x100 m). Przy metodzie punktowej (płat poniżej 5 m) transektu nie ma – zostaw puste.

Dlaczego: pokrycia w karcie odnoszą się do transektu – następny obserwator musi wyznaczyć ten sam.`,
  }),
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 375 albo 375–380',
    help: 'Wysokość nad poziomem morza – liczba albo zakres (karta z przewodnika: 375 m). Siedlisko występuje od kilkunastu metrów (doliny Łupawy i Łeby) do 1210 m w Tatrach.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 15.09.2007',
    required: true,
    hint: 'Wiosna i pełnia sezonu: optymalnie maj – sierpień (2024: 2.05–24.08).',
    help: `Dzień badań terenowych. Przewodnik: zdjęcia fitosocjologiczne w danym roku wykonuje się wiosną i w pełni sezonu wegetacyjnego. Badania powtarza się co 6 lat (mała dynamika), co 3 lata (dynamiczne zmiany), co roku przy ochronie czynnej i dodatkowo przy długotrwałych ekstremach uwodnienia (niżówki, gwałtowne opady) i temperatury.

Praktyka: 2016–2018 – 3.06–9.09; 2024 – 2.05–24.08; 2025 – 9.06–28.06; karta z przewodnika – 15.09.2007. Formularz ostrzega miękko poza majem – sierpniem i mocniej poza kwietniem – wrześniem.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const [, mm, dd] = v.split('-').map(Number)
      const md = mm * 100 + dd
      if (md < 401 || md > 930) return 'Termin poza sezonem badań (kwiecień – wrzesień). Roślinność i przepływ mogą być nietypowe – opisz powód w uwagach.'
      if (md < 501 || md > 831) return 'Termin poza optymalnym (maj – sierpień). Dopuszczalny, ale zapisz to w uwagach.'
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
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia (WGS84). Karta z przewodnika: trzy zdjęcia wzdłuż minitransektu (I – początek, III – koniec). Przy metodzie punktowej – jedno zdjęcie w źródlisku.' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach (karta z przewodnika: 375 m).' }),
  pickField(r7120, 'area', {
    defaultValue: undefined,
    help: 'Powierzchnia zdjęcia w m². Przewodnik: zależy od roślinności – dla zbiorowisk mszaków niewielka (kilkaset cm², np. 0,05 m²), w płatach z roślinami naczyniowymi od 1 do 25 m² (karta z przewodnika: 30, 25 i 30 m²).',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Źródliska leżą często na stokach i skarpach (karta z przewodnika: 1–3°, teren 5–15°).' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, NW). Dla powierzchni płaskiej wpisz „brak” (karta z przewodnika: W).' }),
  layerField('coverA', 'Warstwa A – drzewa: procent powierzchni zdjęcia pod koronami drzew. Źródliska leśne są zacienione – nadmierne zacienienie obniża temperaturę wody i hamuje wytrącanie wapnia.', { groupCols: 4 }),
  layerField('coverB', 'Warstwa B – krzewy i podrost: procent powierzchni zdjęcia pod krzewami i młodymi drzewami (np. bez czarny, jesion, olsza).'),
  layerField('coverC', 'Warstwa C – zielna: rzeżucha gorzka, śledziennica, świerząbek, ostrożeń warzywny, sadziec (karta z przewodnika: 70–100%).'),
  layerField('coverD', 'Warstwa D – mszysta: źródliskowiec, żebrowiec, krótkosz, wątrobowce (karta z przewodnika: 10–60%). Inkrustowane mszaki to martwica mszysta – mszaki oznacz do gatunku.'),
  layerField('heightA', 'Warstwa A – typowa wysokość drzew, w metrach. Brak – puste.'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów i podrostu, w metrach.'),
  layerField('heightC', 'Warstwa C – typowa wysokość warstwy zielnej, w centymetrach (karta z przewodnika: 30–180 cm).'),
  layerField('heightD', 'Warstwa D – wysokość warstwy mszystej, w centymetrach.'),
  pickField(r7120, 'unit', {
    placeholder: 'np. zbiorowisko ze związku Cratoneurion commutati',
    help: 'Jednostka fitosocjologiczna zdjęcia, np. zbiorowisko ze związku Cratoneurion commutati (karta z przewodnika), Cratoneuretum falcati, Cratoneuro-Saxifragetum aizoidis, zbiorowisko Pellia endiviifolia; obok – zbiorowiska sąsiednie (zbiorowisko Chaerophyllum hirsutum ze związku Alno-Padion).',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w zdjęciu z ilościowością w skali Braun-Blanqueta (r, +, 1–5): A – drzewa, B – krzewy i podrost, C – rośliny zielne, D – mszaki (mchy i wątrobowce oznacz do gatunku – od nich zależą gatunki charakterystyczne i wątrobowce). Warstwa podpowiada się sama po wyborze gatunku.',
  }),
  {
    kind: 'textarea',
    name: 'remarks',
    label: 'Uwagi do zdjęcia',
    rows: 2,
    placeholder: 'np. Zdjęcie mszaków 20×20 cm na progu martwicy',
    help: 'Odstępstwa i problemy: inna powierzchnia (zdjęcie samych mszaków), rozmieszczenie zdjęć, mszaki nieoznaczone do gatunku, puste pola w karcie.',
  },
]

export const methodology7220: Methodology = {
  code: '7220',
  name: 'Źródliska wapienne ze zbiorowiskami Cratoneurion commutati',
  priority: true,
  source:
    'Parusel J. B. 2010, 7220 Źródliska wapienne ze zbiorowiskami Cratoneurion commutati, [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ, s. 174–188 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014, 2016–2018 i 2024–2025.',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj zdjęcia fitosocjologiczne wzdłuż minitransektu (karta z przewodnika: trzy – na początku, w środku i na końcu) albo jedno przy metodzie punktowej. Powierzchnia zależy od roślinności: kilkaset cm² dla zbiorowisk mszaków, 1–25 m² w płatach z roślinami naczyniowymi. Ilościowość w skali Braun-Blanqueta, warstwy A–D. Zdjęcia – wiosną i w pełni sezonu. Na martwicy poruszaj się bardzo ostrożnie (kładki, podesty).',
    fields: releveFields,
  },

  indicators,

  structureRule: structureRule7220,

  prospects: {
    description:
      'Ocena na podstawie analizy stanu zachowania siedliska i czynników oddziałujących obecnie i w przyszłości, aktualnego użytkowania siedliska, możliwości utrzymania go we właściwym stanie oraz istniejących i możliwych do wdrożenia programów czynnej ochrony.',
    help: `Weź pod uwagę: stabilność wypływu (pobór wody, obudowanie źródła, ujęcia i studnie, rowy odwadniające w szerokim otoczeniu – Karwickie Źródliska), wycinkę lasu i usuwanie martwych drzew w zlewni (zmiana stosunków świetlnych i wodnych, zamieranie świerczyn – Dolina Olczyska), wydeptywanie przez zwierzęta i ludzi (owce w Jamnem 1, szlaki, zejścia do źródła), motocross, przywalenie pniami, zanieczyszczenie wody, sukcesję ziołorośli, gatunki obce (barszcz Sosnowskiego w sąsiedztwie). Po stronie plusów: park narodowy, rezerwat, ogrodzenie (Las Witalusz 1), brak zagrożeń.

Przewodnik (pkt 5): właściwa jest ochrona czynna – ochrona zasobów wód podziemnych przed nadmiernym poborem i zanieczyszczeniem, ochrona zlewni bezpośredniej przed erozją, ochrona i wspomaganie wytrącania martwicy (dolina Płoni), ochrona martwicy przed erozją i zniszczeniem mechanicznym.

Praktyka 2024: region alpejski FV 68%, U1 11%, U2 5%, XX 16% (XX, gdy trudno ocenić tempo nowych procesów – Podhale 1 i 2, Dolina Olczyska); kontynentalny FV 54%, U1 29%, U2 4%, XX 14%. U2 – Jamne 1 (wodopój owiec, ponad połowa stanowiska rozdeptana) i Wzgórza Sokólskie („faza terminalna”). Karta z przewodnika: „Nieznane” → XX.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A04', name: 'Wypas' },
    { code: 'B02', name: 'Gospodarka leśna – ogólnie' },
    { code: 'B02.02', name: 'Wycinka lasu' },
    { code: 'B02.04', name: 'Usuwanie martwych i umierających drzew' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D01.02', name: 'Drogi, autostrady' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
    { code: 'G01.04', name: 'Wspinaczka górska, skałkowa i speleologia' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'H01', name: 'Zanieczyszczenie wód powierzchniowych (limnicznych, lądowych, morskich i słonawych)' },
    { code: 'H01.05', name: 'Rozproszone zanieczyszczenie wód powierzchniowych z powodu działalności związanej z rolnictwem i leśnictwem' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód – ogólnie' },
    { code: 'J02.06', name: 'Pobór wód z wód powierzchniowych' },
    { code: 'J02.07', name: 'Pobór wód gruntowych' },
    { code: 'J02.15', name: 'Inne spowodowane przez człowieka zmiany stosunków wodnych' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K01.03', name: 'Wyschnięcie' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'K04.05', name: 'Szkody wyrządzane przez roślinożerców (w tym przez zwierzynę łowną)' },
    { code: 'L05', name: 'Zapadnięcie się terenu, osuwisko' },
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
            hint: 'Np. gatunki chronione (pierwiosnek wyniosły), rzadkie (turzyca zwisła), sąsiednie siedliska.',
            help: 'Wartości przyrodnicze stanowiska poza samym siedliskiem: rzadkie i chronione gatunki roślin, mszaków i zwierząt (w 2024 r. na ponad połowie stanowisk – gatunki chronione), sąsiednie siedliska (łęgi 91E0, grądy, buczyny, torfowiska zasadowe 7230). Karta z przewodnika: „Primula elatior (chroniona), Carex pendula – rzadka w Karpatach”. Brak – „Nie stwierdzono”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            label: 'Wykonywane zabiegi ochronne i ocena ich skuteczności',
            help: 'Jakie działania ochronne wykonano i z jakim skutkiem: ogrodzenie źródliska przed zwierzętami (Las Witalusz 1 – część ogrodzenia zniszczona przez przewrócone drzewa), barierki, kładki, usuwanie roślinności heliofilnej, wspomaganie wytrącania martwicy (dolina Płoni). W 2024 r. prawie nigdzie nie stwierdzono działań ochronnych. Brak – „Zabiegów ochronnych brak” (jak w karcie z przewodnika).',
          },
          {
            kind: 'textarea',
            name: 'proposals',
            label: 'Propozycje wprowadzenia działań ochronnych',
            rows: 3,
            hint: 'Np. ograniczenie wycinki wokół źródliska, zabezpieczenie przed rozbudową ujęcia wody.',
            help: 'Jakie działania proponujesz, konkretnie: ograniczenie wycinki drzew w bezpośrednim sąsiedztwie, ograniczenie presji turystów, zaniechanie pędzenia zwierząt przez źródlisko, zabezpieczenie przed rozbudową ujęcia wody (albo jego likwidacja), zakaz nowych studni i rowów w szerokim otoczeniu, zasypanie rowów odwadniających, ochrona przed zniszczeniem mechanicznym. Karta z przewodnika: „Wprowadzenie ochrony czynnej: usuwanie roślinności heliofilnej, wzbogacenie koryta potoku w debra organiczne, zmniejszenie spływu powierzchniowego”.',
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
            help: 'Dlaczego monitoring jest (albo nie jest) potrzebny i jak często – karta z przewodnika: „Jako stanowisko referencyjne, co 5 lat”. W 2024 r. zaproponowano wyłączenie 3 stanowisk: brak siedliska (Źródliska Jasiołki, Berest – Feliszówka – brak martwicy, za niska przewodność wody) i połączenie dwóch płatów jednego źródliska (Skarpa Wiślicka 3 z 6).',
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
                  ? 'Karta z przewodnika podaje przy ocenie ogólnej udział procentowy powierzchni siedliska o różnym stanie zachowania na stanowisku (Las Grabicz 1: FV 90%, U1 10%, U2 –). Trzy liczby powinny dać razem 100%.'
                  : `Procent powierzchni siedliska na stanowisku w stanie ${g === 'U1' ? 'niezadowalającym (U1)' : 'złym (U2)'}.`,
            }),
          ),
          {
            ...f,
            help: `${f.help ?? ''}\n\nDla 7220 zapisz tu także rok i typ monitoringu, listę gatunków charakterystycznych (wg przewodnika albo rozszerzona), wydajność źródła i pogodę przed badaniem (niżówka, ulewy), martwicę kopalną oraz odstępstwa od metody (punktowa zamiast minitransektu, zdjęcia mszaków).`.trim(),
          },
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_7220.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer7220(s) })),
  speciesInfo: (name) => {
    const s = findSpecies7220(name)
    if (!s) return undefined
    const tags = [s.liverwort ? 'wątrobowiec' : '', s.expansive ? 'gatunek ekspansywny' : '', s.eutrophic ? 'wskazuje na eutrofizację' : ''].filter(Boolean)
    if (s.group === 'characteristic') {
      const src =
        s.source === 'guide'
          ? 'tab. 1 przewodnika'
          : s.source === 'class'
            ? 'klasa Montio-Cardaminetea – tab. 1 zalicza ją w całości'
            : 'propozycja rozszerzenia listy z 2018 r. – liczony przy liście rozszerzonej'
      return `${GROUP_LABELS_7220.characteristic} (${src})${tags.length ? `; ${tags.join(', ')}` : ''}`
    }
    if (s.group === 'alien') return GROUP_LABELS_7220.alien
    return tags.length ? tags.join(', ') : GROUP_LABELS_7220.other
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator7220 = (id: string): IndicatorDef => {
  const i = methodology7220.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 7220`)
  return i
}
