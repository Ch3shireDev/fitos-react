// Fabryki wskaźników stanu siedlisk leśnych (GIOŚ, tab. 1 i 2 przewodników).
// Każda fabryka zwraca gotowy IndicatorDef z rozsądnymi, ogólnoleśnymi tekstami. Różnice między siedliskami
// (progi, etykiety opcji, kardynalność, teksty pomocy) podaje się w argumencie – wszystko, co jest polem IndicatorDef,
// nadpisuje wynik 1:1 (także pola dodane do silnika później, np. `excluded`).
//
// Progi liczbowe przekazuje się jako funkcję `grade: (v) => Grade`, więc kierunek (więcej = lepiej / gorzej)
// i ostre/nieostre granice ustawia metodyka, nie fabryka.
import type { FieldDef, Grade, IndicatorDef, InputValues } from '../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../7120/habitats/assessment'
import {
  byOption,
  fmt,
  gradeMap,
  labelOf,
  listCover,
  plNum,
  selectInput,
  speciesInput,
  thresholdsFromOptions,
  type GradedOption,
} from './helpers'

export type Thresholds = IndicatorDef['thresholds']
/** Dowolne pola IndicatorDef nadpisujące wynik fabryki. */
export type Overrides = Partial<IndicatorDef>
export type GradeFn = (v: number) => Grade

/** Rozdziela opcje specyficzne dla fabryki od nadpisań IndicatorDef. */
function finish(built: IndicatorDef, overrides: Overrides): IndicatorDef {
  return { ...built, ...overrides }
}

// ======================================================================
// Klocki generyczne
// ======================================================================

interface CommonSpec {
  id: string
  label: string
  parameter?: IndicatorDef['parameter']
  cardinal?: IndicatorDef['cardinal']
  description: string
  help?: string
  thresholds?: Thresholds
}

/** Wskaźnik oceniany wyborem opisu z listy (opcje niosą ocenę). */
export function choiceIndicator(
  s: CommonSpec & {
    options: GradedOption[]
    inputLabel: string
    inputHelp?: string
    /** Dodatkowe pola (np. lista gatunków przed selectem albo opcjonalna liczba po nim). */
    before?: FieldDef[]
    after?: FieldDef[]
  },
): IndicatorDef {
  return {
    id: s.id,
    label: s.label,
    parameter: s.parameter ?? 'structure',
    cardinal: s.cardinal,
    description: s.description,
    help: s.help,
    thresholds: s.thresholds ?? thresholdsFromOptions(s.options),
    inputs: [...(s.before ?? []), selectInput(s.inputLabel, s.options, s.inputHelp), ...(s.after ?? [])],
    suggest: byOption(gradeMap(s.options)),
    describe: (i) => {
      const list = s.before?.some((f) => f.kind === 'species') ? describeSpecies(speciesRows(i.species)) : ''
      return list || labelOf(s.options, i.choice)
    },
  }
}

/** Lista gatunków z pokryciem; ocena z liczby gatunków i łącznego pokrycia. */
export function speciesCoverIndicator(
  s: CommonSpec & {
    thresholds: Thresholds
    inputLabel: string
    inputHelp: string
    required?: boolean
    /** count – liczba wpisanych gatunków, total – suma pokrycia (undefined, gdy żaden wiersz nie ma pokrycia). */
    grade: (c: { count: number; total?: number }, inputs: InputValues) => Grade | null
    /** Dopisek do wyjaśnienia (np. „Próg przyjęto jako … – to interpretacja.”). */
    note?: string
    emptyText?: string
    after?: FieldDef[]
  },
): IndicatorDef {
  return {
    id: s.id,
    label: s.label,
    parameter: s.parameter ?? 'structure',
    cardinal: s.cardinal,
    description: s.description,
    help: s.help,
    thresholds: s.thresholds,
    inputs: [speciesInput(s.inputLabel, s.inputHelp, s.required), ...(s.after ?? [])],
    suggest: (i) => s.grade(listCover(i), i),
    explain: (i) => {
      const { count, total } = listCover(i)
      if (count === 0) return null
      return [`Gatunków: ${count}, łączne pokrycie ${fmt(total)}.`, s.note].filter(Boolean).join(' ')
    },
    describe: (i) => describeSpecies(speciesRows(i.species)) || (s.emptyText ?? 'Brak'),
  }
}

/**
 * Wskaźnik mierzony liczbą (np. szt./ha, % zasobności, lata).
 * Z `options` – select klasy jest wymagany, a liczba opcjonalna i ma pierwszeństwo (ostrzeżenie przy niezgodności).
 * Bez `options` – liczba jest wymagana.
 */
export function measureIndicator(
  s: CommonSpec & {
    thresholds: Thresholds
    field: { name?: string; label: string; unit: string; min?: number; max?: number; help: string }
    /** Ocena z liczby. Bez niej (tylko z `options`) liczba jedynie opisuje, a ocena idzie z selecta. */
    grade?: GradeFn
    options?: GradedOption[]
    inputLabel?: string
    inputHelp?: string
  },
): IndicatorDef {
  const name = s.field.name ?? 'value'
  const unit = s.field.unit
  const numberField: FieldDef = {
    kind: 'number',
    name,
    label: s.field.label,
    unit,
    min: s.field.min ?? 0,
    max: s.field.max,
    required: !s.options,
    help: s.field.help,
  }
  const show = (v: number) => (unit === '%' ? `${plNum(v)}%` : `${plNum(v)} ${unit}`)
  const opts = s.options
  return {
    id: s.id,
    label: s.label,
    parameter: s.parameter ?? 'structure',
    cardinal: s.cardinal,
    description: s.description,
    help: s.help,
    thresholds: s.thresholds,
    inputs: opts ? [selectInput(s.inputLabel ?? s.label, opts, s.inputHelp), numberField] : [numberField],
    suggest: (i) => {
      const v = num(i[name])
      if (v !== undefined && s.grade) return s.grade(v)
      return opts ? byOption(gradeMap(opts))(i) : null
    },
    warn: (i) => {
      const v = num(i[name])
      if (!opts || !s.grade || v === undefined || !i.choice) return null
      const g = s.grade(v)
      const chosen = gradeMap(opts)[String(i.choice)]
      if (chosen === g) return null
      const match = opts.find((o) => o.grade === g)
      return match ? `${show(v)} to klasa „${match.label}”.` : null
    },
    describe: (i) => {
      const v = num(i[name])
      const cls = opts ? labelOf(opts, i.choice) : ''
      if (v === undefined) return cls
      // liczba tylko opisuje -> „klasa, liczba”
      return !s.grade && cls ? `${cls}, ${show(v)}` : show(v)
    },
  }
}

// ======================================================================
// Opcje standardowe
// ======================================================================

export const LOGGING_OPTIONS: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'few', label: 'Nieliczne ślady, naruszone poniżej 1% powierzchni, liczby drzew itp.', grade: 'U1' },
  { value: 'significant', label: 'Znaczące, obejmujące ponad 1% powierzchni, liczby drzew itp.', grade: 'U2' },
]

export const VERTICAL_OPTIONS: GradedOption[] = [
  { value: 'natural', label: 'Naturalna, zróżnicowana', grade: 'FV' },
  { value: 'changed', label: 'Antropogenicznie zmieniona, lecz zróżnicowana', grade: 'U1' },
  { value: 'uniform', label: 'Antropogenicznie ujednolicona', grade: 'U2' },
]

export const DISTORTION_OPTIONS: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'minor', label: 'Występują, lecz mało znaczące', grade: 'U1' },
  { value: 'strong', label: 'Silne', grade: 'U2' },
]

export const KEY_SPECIES_OPTIONS: GradedOption[] = [
  { value: 'all', label: 'Stan wszystkich takich gatunków właściwy (FV)', grade: 'FV' },
  { value: 'someU1', label: 'Stan niektórych niezadowalający (U1)', grade: 'U1' },
  { value: 'someU2', label: 'Stan niektórych zły (U2)', grade: 'U2' },
  { value: 'noData', label: 'Brak danych', grade: 'XX' },
]

export const AREA_TREND_OPTIONS: GradedOption[] = [
  { value: 'stable', label: 'Nie zmniejsza się, nie jest antropogenicznie pofragmentowana', grade: 'FV' },
  { value: 'slow', label: 'Powolny trend spadkowy lub antropogeniczna fragmentacja', grade: 'U1' },
  { value: 'fast', label: 'Szybki trend spadkowy lub silna antropogeniczna fragmentacja', grade: 'U2' },
]

export const DOMINANCE_OPTIONS: GradedOption[] = [
  { value: 'natural', label: 'We wszystkich warstwach dominują gatunki naturalne, proporcje naturalne', grade: 'FV' },
  { value: 'disturbed', label: 'Dominują gatunki naturalne, ale proporcje zachwiane', grade: 'U1' },
  { value: 'foreign', label: 'W co najmniej jednej warstwie dominuje gatunek nietypowy', grade: 'U2' },
]

export const REGENERATION_OPTIONS: GradedOption[] = [
  { value: 'abundant', label: 'Tak, obfite', grade: 'FV' },
  { value: 'single', label: 'Tak, lecz pojedyncze', grade: 'U1' },
  { value: 'none', label: 'Brak', grade: 'U2' },
]

export const PLANTING_OPTIONS: GradedOption[] = [
  { value: 'none', label: 'Brak lub nieliczne, zgodne z siedliskiem', grade: 'FV' },
  { value: 'few', label: 'Nieliczne, niezgodne z siedliskiem', grade: 'U1' },
  { value: 'many', label: 'Liczne, niezgodne z siedliskiem', grade: 'U2' },
]

export const STAND_DAMAGE_OPTIONS: GradedOption[] = [
  { value: 'none', label: 'Brak, pojedyncze', grade: 'FV' },
  { value: 'noticeable', label: 'Zauważalne', grade: 'U1' },
  { value: 'radical', label: 'Radykalne', grade: 'U2' },
]

export const STAND_AGE_OPTIONS: GradedOption[] = [
  { value: 'old', label: 'Ponad 20% miąższości to drzewa starsze niż 100 lat', grade: 'FV' },
  { value: 'mid', label: 'Poniżej 20% drzew >100 lat, ale ponad 50% drzew >50 lat', grade: 'U1' },
  { value: 'young', label: 'Poniżej 20% drzew >100 lat i poniżej 50% drzew >50 lat', grade: 'U2' },
]

export const DEAD_WOOD_COUNT_OPTIONS: GradedOption[] = [
  { value: 'many', label: '>3 szt./ha', grade: 'FV' },
  { value: 'some', label: '1–3 szt./ha', grade: 'U1' },
  { value: 'few', label: '<1 szt./ha', grade: 'U2' },
]

const REGENERATING_OPTIONS = [
  { value: 'no', label: 'Nie odnawiają się' },
  { value: 'yes', label: 'Odnawiają się (siewki, podrost)' },
]

/** Kody oddziaływań typowe dla lasów – do rozszerzania o kody specyficzne dla siedliska. */
export const FOREST_IMPACT_CODES = [
  { code: 'B02', name: 'Gospodarka leśna – ogólnie' },
  { code: 'B02.01', name: 'Odnawianie lasu po wycince' },
  { code: 'B02.01.02', name: 'Odnawianie lasu po wycince (nasadzenia gatunków obcych)' },
  { code: 'B02.02', name: 'Wycinka lasu' },
  { code: 'B02.03', name: 'Usuwanie podszytu' },
  { code: 'B02.04', name: 'Usuwanie martwych i umierających drzew' },
  { code: 'B02.06', name: 'Przerzedzanie drzewostanu' },
  { code: 'B07', name: 'Inne rodzaje praktyk leśnych' },
  { code: 'D01.01', name: 'Ścieżki, szlaki piesze, rowerowe' },
  { code: 'D01.02', name: 'Drogi, autostrady' },
  { code: 'F04', name: 'Pozyskiwanie (grzybobranie, zbieranie roślin)' },
  { code: 'G01.02', name: 'Turystyka piesza, jazda konna i rowerowa' },
  { code: 'I01', name: 'Obce gatunki inwazyjne' },
  { code: 'I02', name: 'Problematyczne gatunki rodzime' },
  { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
  { code: 'K04.01', name: 'Konkurencja' },
  { code: 'L07', name: 'Burza, nawałnica' },
  { code: 'M01.02', name: 'Susze i zmniejszenie opadów' },
]

// ======================================================================
// Presety
// ======================================================================

type ChoicePreset = Overrides & { options?: GradedOption[]; inputLabel?: string; inputHelp?: string }

function choicePreset(
  defaults: Omit<Parameters<typeof choiceIndicator>[0], 'thresholds'> & { thresholds?: Thresholds },
  o: ChoicePreset,
): IndicatorDef {
  const { options, inputLabel, inputHelp, ...over } = o
  const built = choiceIndicator({
    ...defaults,
    options: options ?? defaults.options,
    inputLabel: inputLabel ?? defaults.inputLabel,
    inputHelp: inputHelp ?? defaults.inputHelp,
    // własne opcje -> progi z ich etykiet, chyba że podano progi wprost
    thresholds: options ? undefined : defaults.thresholds,
  })
  return finish(built, over)
}

/** Powierzchnia siedliska na stanowisku (parametr „area”). */
export const forestArea = (o: ChoicePreset = {}) =>
  choicePreset(
    {
      id: 'area',
      label: 'Powierzchnia siedliska na stanowisku',
      parameter: 'area',
      description: 'Trend zmian powierzchni płatu oraz jego antropogeniczna fragmentacja. Liczy się trend aktualny.',
      help: `Co wybrać: jak zmienia się powierzchnia płatu siedliska i czy jest on pocięty przez człowieka (zręby, drogi, linie przesyłowe).

Przy pierwszej obserwacji, bez danych do porównania, wybierz „nie zmniejsza się” albo oceń XX i opisz to w polu wartości.`,
      options: AREA_TREND_OPTIONS,
      inputLabel: 'Jak zmienia się powierzchnia?',
    },
    o,
  )

/** Gatunki dominujące: lista dominantów + ocena opisowa. `flag` zwraca true dla gatunków nietypowych (ostrzeżenie przy „naturalne”). */
export function dominantSpecies(
  o: ChoicePreset & { flag?: (name: string) => boolean; flagText?: string; naturalValue?: string; flagMinCover?: number } = {},
) {
  const { flag, flagText, naturalValue = 'natural', flagMinCover = 10, ...rest } = o
  const ind = choicePreset(
    {
      id: 'dominant',
      label: 'Gatunki dominujące',
      description: 'Czy w każdej warstwie dominują gatunki typowe dla siedliska.',
      help: 'Co wpisać: dominanty każdej warstwy z pokryciem (A – drzewostan, B – podszyt, C – runo, D – mchy) i ocenę, czy są to gatunki typowe dla naturalnego zbiorowiska.',
      options: DOMINANCE_OPTIONS,
      inputLabel: 'Czy dominanty są typowe?',
      before: [
        speciesInput(
          'Gatunki dominujące w warstwach',
          'Dominanty każdej warstwy z pokryciem w % transektu. Warstwę dopisz w opisie wskaźnika („A: Quercus petraea 50%; C: …”).',
        ),
      ],
    },
    rest,
  )
  if (!flag || rest.warn) return ind
  return {
    ...ind,
    warn: (i: InputValues) => {
      if (i.choice !== naturalValue) return null
      const bad = speciesRows(i.species).filter((r) => (num(r.cover) ?? 0) >= flagMinCover && r.name?.trim() && flag(r.name.trim()))
      return bad.length
        ? `Wybrano „naturalne”, a dominują też: ${bad.map((r) => r.name).join(', ')}${flagText ? ` – ${flagText}` : ''}.`
        : null
    },
  }
}

type SpeciesPreset = Overrides & {
  grade?: (c: { count: number; total?: number }, inputs: InputValues) => Grade | null
  inputLabel?: string
  inputHelp?: string
  note?: string
}

function speciesPreset(defaults: Parameters<typeof speciesCoverIndicator>[0], o: SpeciesPreset): IndicatorDef {
  const { grade, inputLabel, inputHelp, note, ...over } = o
  return finish(
    speciesCoverIndicator({
      ...defaults,
      grade: grade ?? defaults.grade,
      inputLabel: inputLabel ?? defaults.inputLabel,
      inputHelp: inputHelp ?? defaults.inputHelp,
      note: grade ? note : (note ?? defaults.note),
    }),
    over,
  )
}

/** Inwazyjne gatunki obce w runie (i podszycie). Domyślnie progi 91D0: brak FV, 1 gatunek ≤1% U1, reszta U2. */
export const invasiveAliens = (o: SpeciesPreset = {}) =>
  speciesPreset(
    {
      id: 'invasive',
      label: 'Inwazyjne gatunki obce w runie',
      cardinal: true,
      description: 'Gatunki obce geograficznie w runie i podszycie, np. niecierpek drobnokwiatowy, czeremcha amerykańska.',
      help: 'Co wpisać: każdy gatunek obcy geograficznie w runie (i podszycie), z pokryciem w % transektu. Brak – zostaw listę pustą.',
      thresholds: {
        FV: 'Brak',
        U1: 'Obecny najwyżej 1 gatunek, nieliczny, sporadyczny',
        U2: 'Więcej niż 1 gatunek lub nawet 1 gatunek liczny',
      },
      inputLabel: 'Inwazyjne gatunki obce',
      inputHelp: 'Gatunki obce geograficznie z pokryciem w % transektu. Brak – zostaw pustą listę.',
      grade: ({ count, total }) => {
        if (count === 0) return 'FV'
        if (count === 1 && total !== undefined && total <= 1) return 'U1'
        return total === undefined && count === 1 ? null : 'U2'
      },
      note: 'Próg „nieliczny” przyjęto jako pokrycie do 1% – to interpretacja.',
    },
    o,
  )

/** Rodzime gatunki ekspansywne. Domyślnie progi 91D0: brak FV, 1 gatunek ≤25% U1, reszta U2. */
export const expansiveNatives = (o: SpeciesPreset = {}) =>
  speciesPreset(
    {
      id: 'expansive',
      label: 'Rodzime gatunki ekspansywne roślin zielnych',
      description: 'Ekspansja rodzimych apofitów nietypowych dla dobrze zachowanych płatów (np. jeżyny, trzcinnik piaskowy).',
      help: 'Co wpisać: rodzime gatunki, które wyraźnie się rozprzestrzeniają, z pokryciem w % transektu. Neofitów tu nie wpisuj – mają swój wskaźnik.',
      thresholds: {
        FV: 'Brak',
        U1: 'Obecne, lecz najwyżej 1 gatunek, nie bardzo silnie ekspansywny',
        U2: 'Więcej niż 1 gatunek albo 1 gatunek bardzo silnie ekspansywny',
      },
      inputLabel: 'Gatunki ekspansywne',
      inputHelp: 'Rodzime gatunki ekspansywne z pokryciem w % transektu. Brak – zostaw pustą listę.',
      grade: ({ count, total }) => {
        if (count === 0) return 'FV'
        if (count > 1) return 'U2'
        return total === undefined ? null : total <= 25 ? 'U1' : 'U2'
      },
      note: 'Próg „bardzo silnie ekspansywny” przyjęto jako ponad 25% – to interpretacja.',
    },
    o,
  )

/** Gatunki obce ekologicznie w drzewostanie. Domyślnie <10 FV, <30 U1, reszta U2. */
export const ecoAlienTrees = (o: SpeciesPreset = {}) =>
  speciesPreset(
    {
      id: 'ecoAlien',
      label: 'Gatunki obce ekologicznie w drzewostanie',
      description: 'Rodzime drzewa nietypowe dla siedliska.',
      help: 'Co wpisać: rodzime gatunki drzew, które nie należą do tego siedliska, z udziałem w drzewostanie w %. Gatunków obcych geograficznie tu nie wpisuj.',
      thresholds: { FV: 'Poniżej 10%', U1: 'Poniżej 30%', U2: 'Ponad 30%' },
      inputLabel: 'Gatunki obce ekologicznie w drzewostanie',
      inputHelp: 'Gatunki drzew nietypowe dla siedliska, z udziałem w drzewostanie w %. Brak – zostaw pustą listę.',
      grade: ({ total }) => (total === undefined ? null : total < 10 ? 'FV' : total < 30 ? 'U1' : 'U2'),
    },
    o,
  )

/** Gatunki obce (geograficznie i/lub ekologicznie) w drzewostanie, ocena z łącznego udziału. Domyślnie: brak FV, ≤10% U1, >10% U2. */
export const alienTrees = (o: SpeciesPreset = {}) =>
  speciesPreset(
    {
      id: 'alienTrees',
      label: 'Gatunki obce geograficznie i ekologicznie w drzewostanie',
      description: 'Drzewa obce geograficznie (np. robinia, dąb czerwony) i nietypowe dla siedliska gatunki rodzime.',
      help: 'Co wpisać: gatunki drzew obce geograficznie i ekologicznie, z udziałem w drzewostanie w %. Brak – zostaw pustą listę.',
      thresholds: { FV: 'Brak', U1: 'Do 10%', U2: 'Ponad 10%' },
      inputLabel: 'Gatunki obce w drzewostanie',
      inputHelp: 'Gatunki drzew obce geograficznie i ekologicznie, z udziałem w drzewostanie w %. Brak – zostaw pustą listę.',
      grade: ({ count, total }) => (count === 0 ? 'FV' : total === undefined ? null : total <= 10 ? 'U1' : 'U2'),
    },
    o,
  )

/**
 * Gatunki obce geograficznie w drzewostanie + „czy się odnawiają”. Odnawianie zawsze daje U2.
 * Domyślnie (91D0): <1% FV, <10% U1, reszta U2.
 */
export function geoAlienTrees(o: Overrides & { grade?: GradeFn; inputHelp?: string } = {}): IndicatorDef {
  const { grade = (t: number) => (t < 1 ? 'FV' : t < 10 ? 'U1' : 'U2'), inputHelp, ...over } = o
  const built: IndicatorDef = {
    id: 'geoAlien',
    label: 'Gatunki obce geograficznie w drzewostanie',
    parameter: 'structure',
    cardinal: true,
    description: 'Drzewa poza naturalnym zasięgiem.',
    help: 'Co wpisać: każdy gatunek drzewa rosnący poza swoim naturalnym zasięgiem, z udziałem w drzewostanie w %, oraz czy się odnawia (siewki, podrost). Odnawianie się gatunku obcego zawsze daje U2.',
    thresholds: {
      FV: 'Poniżej 1% i nie odnawiające się',
      U1: 'Poniżej 10% i nie odnawiające się',
      U2: 'Ponad 10% lub odnawiające się',
    },
    inputs: [
      speciesInput(
        'Gatunki obce geograficznie w drzewostanie',
        inputHelp ?? 'Gatunki drzew poza naturalnym zasięgiem, z udziałem w drzewostanie w %. Brak – zostaw pustą listę.',
      ),
      {
        kind: 'select',
        name: 'regenerating',
        label: 'Czy się odnawiają?',
        options: REGENERATING_OPTIONS,
        help: 'Czy pod drzewostanem są siewki albo podrost gatunku obcego. Odnawianie się gatunku obcego zawsze daje U2, niezależnie od udziału – bo oznacza, że gatunek sam się rozprzestrzenia.',
      },
    ],
    suggest: (i) => {
      const { count, total } = listCover(i)
      if (count === 0) return 'FV'
      if (i.regenerating === 'yes') return 'U2'
      return total === undefined ? null : grade(total)
    },
    explain: (i) => {
      const { count, total } = listCover(i)
      if (count === 0) return null
      return `Łączny udział gatunków obcych geograficznie: ${fmt(total)}${i.regenerating === 'yes' ? ', odnawiają się' : ''}.`
    },
    describe: (i) => {
      const list = describeSpecies(speciesRows(i.species))
      if (!list) return 'Brak'
      return i.regenerating === 'yes' ? `${list} (odnawia się)` : list
    },
  }
  return finish(built, over)
}

/**
 * Wiek drzewostanu wg udziału drzew >100 i >50 lat (91D0, 91E0, 91P0).
 * Domyślnie FV >20% drzew >100 lat; U1 >50% drzew >50 lat. Progi zmieniasz przez `old100` i `mid50`.
 */
export function standAge(o: Overrides & { old100?: number; mid50?: number; options?: GradedOption[] } = {}): IndicatorDef {
  const { old100 = 20, mid50 = 50, options, ...over } = o
  const opts = options ?? [
    { value: 'old', label: `Ponad ${old100}% miąższości to drzewa starsze niż 100 lat`, grade: 'FV' as Grade },
    { value: 'mid', label: `Poniżej ${old100}% drzew >100 lat, ale ponad ${mid50}% drzew >50 lat`, grade: 'U1' as Grade },
    { value: 'young', label: `Poniżej ${old100}% drzew >100 lat i poniżej ${mid50}% drzew >50 lat`, grade: 'U2' as Grade },
  ]
  const built: IndicatorDef = {
    id: 'age',
    label: 'Wiek drzewostanu',
    parameter: 'structure',
    description: 'Dojrzałość fitocenozy mierzona udziałem (miąższością) drzew starszych niż 100 i 50 lat.',
    help: `Co wybrać: udział drzew starszych niż 100 lat i starszych niż 50 lat w drzewostanie (udział objętościowy, czyli miąższość). Dane zwykle są w operacie urządzeniowym albo Banku Danych o Lasach. Liczby możesz dopisać w polach poniżej; ocena wynika z wybranej klasy.`,
    thresholds: {
      FV: `Ponad ${old100}% udziału objętościowego drzew starszych niż 100 lat`,
      U1: `Poniżej ${old100}% udziału drzew starszych niż 100 lat, ale ponad ${mid50}% udziału drzew starszych niż 50 lat`,
      U2: `Poniżej ${old100}% udziału drzew starszych niż 100 lat i poniżej ${mid50}% udziału drzew starszych niż 50 lat`,
    },
    inputs: [
      selectInput('Klasa wieku drzewostanu', opts),
      { kind: 'number', name: 'share100', label: 'Udział drzew >100 lat', unit: '%', min: 0, max: 100, help: 'Udział objętościowy (miąższość) drzew starszych niż 100 lat, w %. Opcjonalne.' },
      { kind: 'number', name: 'share50', label: 'Udział drzew >50 lat', unit: '%', min: 0, max: 100, help: 'Udział objętościowy drzew starszych niż 50 lat (łącznie z tymi >100 lat), w %. Opcjonalne.' },
    ],
    suggest: byOption(gradeMap(opts)),
    warn: (i) => {
      const a = num(i.share100)
      const b = num(i.share50)
      if (a === undefined || !i.choice) return null
      const g: Grade | undefined = a > old100 ? 'FV' : b !== undefined ? (b > mid50 ? 'U1' : 'U2') : undefined
      const match = g && opts.find((x) => x.grade === g)
      return match && match.value !== i.choice ? `Liczby wskazują na klasę: „${match.label}”.` : null
    },
    describe: (i) => {
      const a = num(i.share100)
      const b = num(i.share50)
      const nums = [a === undefined ? '' : `>100 lat: ${fmt(a)}`, b === undefined ? '' : `>50 lat: ${fmt(b)}`].filter(Boolean).join(', ')
      return [labelOf(opts, i.choice), nums].filter(Boolean).join(' – ')
    },
  }
  return finish(built, over)
}

type MeasurePreset = Overrides & { grade?: GradeFn; options?: GradedOption[]; inputLabel?: string; inputHelp?: string; fieldHelp?: string; fieldLabel?: string }

function measurePreset(defaults: Parameters<typeof measureIndicator>[0], o: MeasurePreset): IndicatorDef {
  const { grade, options, inputLabel, inputHelp, fieldHelp, fieldLabel, ...over } = o
  return finish(
    measureIndicator({
      ...defaults,
      grade: grade ?? defaults.grade,
      options: options === undefined ? defaults.options : options,
      inputLabel: inputLabel ?? defaults.inputLabel,
      inputHelp: inputHelp ?? defaults.inputHelp,
      field: { ...defaults.field, help: fieldHelp ?? defaults.field.help, label: fieldLabel ?? defaults.field.label },
    }),
    over,
  )
}

/** Grube martwe drewno w szt./ha (select klasy + opcjonalna liczba). Domyślnie 91D0: >3 FV, 1–3 U1, <1 U2. */
export const deadWoodCount = (o: MeasurePreset = {}) =>
  measurePreset(
    {
      id: 'deadWood',
      label: 'Martwe drewno leżące lub stojące > 3 m długości i 30 cm grubości',
      description: 'Liczba sztuk grubego martwego drewna na hektar.',
      help: 'Co wpisać: liczbę kłód leżących i drzew martwych stojących (złomy, wywroty, susze) powyżej progu długości i grubości, przeliczoną na hektar. Na transekcie 0,2 ha policz sztuki i pomnóż przez 5.',
      thresholds: { FV: 'Ponad 3 szt./ha', U1: '1–3 szt./ha', U2: 'Poniżej 1 szt./ha' },
      options: DEAD_WOOD_COUNT_OPTIONS,
      inputLabel: 'Ile grubego martwego drewna?',
      inputHelp: 'Klasa liczby sztuk na hektar. Gdy liczyłeś, wpisz też liczbę poniżej – formularz sprawdzi zgodność.',
      field: {
        name: 'perHa',
        label: 'Liczba sztuk na hektar (jeśli liczona)',
        unit: 'szt./ha',
        help: 'Sztuki grubego martwego drewna na hektar. Z transektu 0,2 ha: liczba sztuk × 5. Opcjonalne.',
      },
      grade: (v) => (v > 3 ? 'FV' : v >= 1 ? 'U1' : 'U2'),
    },
    o,
  )

/** Łączne zasoby martwego drewna w m³/ha (liczba wymagana). Domyślnie 91E0/91F0: >20 FV, 10–20 U1, <10 U2. */
export const deadWoodVolume = (o: MeasurePreset = {}) =>
  measurePreset(
    {
      id: 'deadWoodVolume',
      label: 'Martwe drewno (łączne zasoby)',
      description: 'Łączna objętość martwego drewna leżącego i stojącego, w m³/ha.',
      help: 'Co wpisać: łączną objętość martwego drewna (leżące kłody, złomy, wywroty, susze) w m³ na hektar – z pomiaru na transekcie albo z operatu.',
      thresholds: { FV: 'Ponad 20 m³/ha', U1: '10–20 m³/ha', U2: 'Poniżej 10 m³/ha' },
      field: { name: 'volume', label: 'Zasoby martwego drewna', unit: 'm³/ha', help: 'Objętość martwego drewna w m³/ha.' },
      grade: (v) => (v > 20 ? 'FV' : v >= 10 ? 'U1' : 'U2'),
    },
    o,
  )

/** Martwe drewno jako % zasobności drzewostanu (liczba wymagana). `grade` obowiązkowy – kierunek zależy od siedliska. */
export const deadWoodShare = (o: MeasurePreset & { grade: GradeFn; thresholds: Thresholds }) =>
  measurePreset(
    {
      id: 'deadWoodShare',
      label: 'Martwe drewno',
      description: 'Udział martwego drewna w zasobności (miąższości) drzewostanu, w %.',
      help: 'Co wpisać: jaki procent zasobności drzewostanu stanowi martwe drewno – szacunkowo z transektu albo z operatu.',
      thresholds: o.thresholds,
      field: { name: 'share', label: 'Udział martwego drewna w zasobności', unit: '%', max: 100, help: 'Martwe drewno jako procent zasobności (miąższości) drzewostanu.' },
      grade: o.grade,
    },
    o,
  )

/** Zniszczenia drzewostanów (wiatrołomy, gradacje owadów). Domyślnie select (progi opisowe 91I0), liczba tylko opisuje; podaj `grade`, by liczyć z % drzewostanu. */
export const standDamage = (o: MeasurePreset = {}) =>
  measurePreset(
    {
      id: 'standDamage',
      label: 'Zniszczenia drzewostanów',
      description: 'Wiatrołomy, wiatrowały, gradacje owadów, choroby – rodzaj i procent zniszczonego drzewostanu.',
      help: 'Co wpisać: rodzaje zniszczeń drzewostanu (wiatrołomy, gradacje owadów, choroby, pożar) i szacunkowy procent zniszczonego drzewostanu.',
      thresholds: thresholdsFromOptions(STAND_DAMAGE_OPTIONS),
      options: STAND_DAMAGE_OPTIONS,
      inputLabel: 'Skala zniszczeń drzewostanu',
      field: { name: 'share', label: 'Zniszczony drzewostan (jeśli szacowany)', unit: '%', max: 100, help: 'Szacunkowy procent zniszczonego drzewostanu. Opcjonalne.' },
      // bez `grade` liczba tylko opisuje – ocena idzie z selecta (progi 91I0 są opisowe); 91P0 podaje własny grade
    },
    o,
  )

/** Naturalne odnowienie drzewostanu (select). */
export const naturalRegeneration = (o: ChoicePreset = {}) =>
  choicePreset(
    {
      id: 'regeneration',
      label: 'Naturalne odnowienie drzewostanu',
      description: 'Czy gatunki drzew typowe dla siedliska mają możliwość odnawiania się.',
      help: 'Co wybrać: czy w płacie są siewki i podrost gatunków drzew właściwych dla siedliska. W opisie wymień gatunek.',
      options: REGENERATION_OPTIONS,
      inputLabel: 'Odnowienie gatunków typowych',
    },
    o,
  )

/** Odnowienie konkretnego gatunku z % pokrycia transektu (np. jodła, buk). `grade` – ocena z łącznego pokrycia. */
export const speciesRegeneration = (o: SpeciesPreset & { id: string; label: string; thresholds: Thresholds; grade: (c: { count: number; total?: number }) => Grade | null }) =>
  speciesPreset(
    {
      id: o.id,
      label: o.label,
      description: 'Pokrycie transektu przez odnowienie (siewki, podrost) wskazanego gatunku.',
      thresholds: o.thresholds,
      inputLabel: 'Odnowienie (gatunek i pokrycie)',
      inputHelp: 'Gatunek odnowienia z pokryciem w % transektu.',
      grade: o.grade,
    },
    o,
  )

/** Obecność nasadzeń drzew niezgodnych z siedliskiem (select). */
export const plantings = (o: ChoicePreset = {}) =>
  choicePreset(
    {
      id: 'plantings',
      label: 'Obecność nasadzeń drzew',
      description: 'Zgodność ewentualnych nasadzeń z charakterem siedliska.',
      help: 'Co wpisać: gatunki sadzone na transekcie z przybliżonym pokryciem i ocenę, czy są zgodne z siedliskiem.',
      options: PLANTING_OPTIONS,
      inputLabel: 'Nasadzenia',
      before: [speciesInput('Gatunki sadzone', 'Gatunki, których nasadzenia stwierdzono na transekcie, z pokryciem w %. Brak – zostaw pustą listę.')],
    },
    o,
  )

/** Zniszczenia runa i gleby związane z pozyskaniem drewna. */
export const loggingDamage = (o: ChoicePreset = {}) =>
  choicePreset(
    {
      id: 'logging',
      label: 'Zniszczenia runa i gleby związane z pozyskaniem drewna',
      description: 'Ślady zrywki, uszkodzenia drzew, zaśmiecenie po pracach leśnych. Liczy się naruszenie runa i gleby, nie sam fakt pozyskania.',
      help: 'Co wybrać: jak bardzo prace leśne naruszyły runo, glebę, podszyt, podrost i zasoby martwego drewna. Same pniaki to jeszcze nie zniszczenie.',
      thresholds: {
        FV: 'Brak',
        U1: 'Nieliczne ślady, naruszone poniżej 1% powierzchni terenu, liczby drzew',
        U2: 'Znaczące, obejmujące ponad 1% powierzchni terenu, liczby drzew itp.',
      },
      options: LOGGING_OPTIONS,
      inputLabel: 'Zniszczenia po pozyskaniu drewna',
    },
    o,
  )

/** Pionowa struktura roślinności. */
export const verticalStructure = (o: ChoicePreset = {}) => {
  const ind = choicePreset(
    {
      id: 'vertical',
      label: 'Pionowa struktura roślinności',
      description: 'Zróżnicowanie struktury wiekowej i warstwowej drzewostanu.',
      help: 'Co wybrać: czy drzewostan jest wielogeneracyjny, czy wyrównany jak uprawa leśna.',
      options: VERTICAL_OPTIONS,
      inputLabel: 'Struktura pionowa',
    },
    o,
  )
  const opts = o.options ?? VERTICAL_OPTIONS
  return o.describe
    ? ind
    : {
        ...ind,
        describe: (i: InputValues) => {
          const l = labelOf(opts, i.choice)
          return l ? `${l} struktura` : ''
        },
      }
}

/** Inne zniekształcenia. */
export const otherDistortions = (o: ChoicePreset = {}) =>
  choicePreset(
    {
      id: 'otherDistortions',
      label: 'Inne zniekształcenia',
      description: 'Np. rozjeżdżanie, wydeptywanie, zaśmiecenie.',
      help: 'Co wybrać i opisać: inne przekształcenia płatu niezwiązane z pozyskaniem drewna.',
      thresholds: { FV: 'Brak', U1: 'Występują, lecz mało znaczące', U2: 'Silne' },
      options: DISTORTION_OPTIONS,
      inputLabel: 'Inne zniekształcenia',
    },
    o,
  )

/** Stan gatunków kluczowych (wskaźnik fakultatywny). */
export const keySpecies = (o: ChoicePreset = {}) =>
  choicePreset(
    {
      id: 'keySpecies',
      label: 'Stan kluczowych dla różnorodności biologicznej gatunków lokalnie typowych dla siedliska (wskaźnik fakultatywny)',
      description: 'Stosować tylko, gdy są dane.',
      help: 'Wskaźnik fakultatywny – gdy brak danych, wybierz „Brak danych” (XX).',
      thresholds: {
        FV: 'Stan wszystkich takich gatunków właściwy (FV)',
        U1: 'Stan niektórych takich gatunków niezadowalający (U1)',
        U2: 'Stan niektórych takich gatunków zły (U2)',
      },
      options: KEY_SPECIES_OPTIONS,
      inputLabel: 'Stan gatunków kluczowych',
    },
    o,
  )
