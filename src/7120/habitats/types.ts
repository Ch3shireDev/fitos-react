// Ogólne typy metodyki monitoringu siedlisk (GIOŚ / PMŚ).
// Zero Reacta. Jak tu zobaczysz JSX, to ktoś coś zepsuł.

export const GRADES = ['FV', 'U1', 'U2', 'XX'] as const
export type Grade = (typeof GRADES)[number]
/** Pusta ocena = jeszcze nie oceniono. */
export type GradeOrEmpty = Grade | ''

export const GRADE_LABELS: Record<Grade, string> = {
  FV: 'FV – właściwy',
  U1: 'U1 – niezadowalający',
  U2: 'U2 – zły',
  XX: 'XX – nieznany',
}

export interface SelectOption {
  value: string
  label: string
}

interface BaseField {
  /** Klucz w obiekcie wartości (np. `siteName`). */
  name: string
  label: string
  /** Krótka podpowiedź wyświetlana pod polem. */
  hint?: string
  /** Szerokie wyjaśnienie: co wpisać i dlaczego. Rozwijane przyciskiem „?”. */
  help?: string
  placeholder?: string
  required?: boolean
  /** Kolejne pola z tą samą grupą renderują się w jednym wierszu karty pod wspólną etykietą. */
  group?: string
  /** Liczba kolumn grupy – czytana z pierwszego pola grupy (np. 4 dla warstw A–D). */
  groupCols?: number
  /** W grupie zajmuje cały wiersz (np. długie współrzędne). */
  wide?: boolean
  /** Wartość startowa w pustej karcie. */
  defaultValue?: string | number
  /** Miękkie ostrzeżenie (nie blokuje zapisu), np. „termin poza optymalnym”. */
  warn?: (value: unknown) => string | null
}

export type FieldDef =
  | (BaseField & { kind: 'text'; unit?: string })
  | (BaseField & { kind: 'textarea'; /** Wysokość startowa w liniach (pole i tak rośnie z treścią). */ rows?: number })
  | (BaseField & { kind: 'date' })
  | (BaseField & { kind: 'number'; min?: number; max?: number; unit?: string })
  | (BaseField & { kind: 'select'; options: SelectOption[] })
  | (BaseField & { kind: 'species' })
  | (BaseField & { kind: 'releve-species' })
  | (BaseField & { kind: 'photos' })
  | (BaseField & {
      kind: 'table'
      /** Kolumny jednego wiersza (proste pola: tekst, opis, liczba, wybór). */
      columns: FieldDef[]
      /** Etykieta przycisku dodawania, np. „Dodaj działanie”. */
      addLabel?: string
      /** Nazwa pojedynczego wiersza w nagłówku, np. „Działanie” → „Działanie 1”. */
      rowLabel?: string
    })

/** Pola, których wartością jest lista wierszy (startują od []). */
export const isListField = (f: FieldDef) =>
  f.kind === 'species' || f.kind === 'releve-species' || f.kind === 'photos' || f.kind === 'table'

/** Wiersz pola „table” – klucze to nazwy kolumn. */
export type TableRowValues = Record<string, unknown>

/** Zdjęcie w dokumentacji fotograficznej. Plik trzymany jako data URL (po zmniejszeniu), więc trafia do zapisanego JSON-a. */
export interface PhotoRow {
  /** Nazwa oryginalnego pliku. */
  name?: string
  /** data:image/…;base64,… – pusty, gdy na razie jest tylko podpis. */
  dataUrl?: string
  caption: string
}

export interface SpeciesRow {
  name: string
  /** Pokrycie transektu w %. Dla „<1%” wpisuj 0,5. */
  cover?: number
}

export const LAYERS = ['A', 'B', 'C', 'D'] as const
export type Layer = (typeof LAYERS)[number]
export const LAYER_LABELS: Record<Layer, string> = {
  A: 'A – drzewa',
  B: 'B – krzewy i podrost',
  C: 'C – zielna i krzewinki',
  D: 'D – mszysta',
}

/** Skala Braun-Blanqueta (ilościowość). */
export const BRAUN_BLANQUET = ['r', '+', '1', '2', '3', '4', '5'] as const
export type BraunBlanquet = (typeof BRAUN_BLANQUET)[number]
export const BB_LABELS: Record<BraunBlanquet, string> = {
  r: 'r – pojedynczy osobnik',
  '+': '+ – nieliczne, pokrycie znikome',
  '1': '1 – liczne, pokrycie < 5%',
  '2': '2 – pokrycie 5–25%',
  '3': '3 – pokrycie 25–50%',
  '4': '4 – pokrycie 50–75%',
  '5': '5 – pokrycie 75–100%',
}

export interface ReleveSpeciesRow {
  layer: Layer | ''
  name: string
  abundance: BraunBlanquet | ''
}

/** Pozycja katalogu gatunków do wyszukiwarki. */
export interface CatalogOption {
  /** Nazwa naukowa – to trafia do danych. */
  value: string
  /** Nazwa zwyczajowa (polska). */
  label: string
  /** Domyślna warstwa przy dodawaniu do zdjęcia fitosocjologicznego. */
  layer?: Layer
}

export type InputValues = Record<string, unknown>

/**
 * Kontekst karty przekazywany do funkcji wskaźnika – np. wariant siedliska wybrany w „Stanowisku”
 * (w 91D0 od wariantu zależy lista gatunków charakterystycznych i to, czy torfowce są kardynalne).
 */
export interface IndicatorContext {
  site: InputValues
  /** Pomiary pozostałych wskaźników karty – gdy ocena jednego wskaźnika zależy od innego (91I0: gatunki charakterystyczne a ciepłolubne). */
  indicators?: Record<string, IndicatorValue>
}

export interface IndicatorDef {
  id: string
  label: string
  parameter: 'area' | 'structure'
  /** Wskaźnik kardynalny – decyduje o ocenie „specyficznej struktury i funkcji”. Może zależeć od wariantu siedliska. */
  cardinal?: boolean | ((ctx: IndicatorContext) => boolean)
  /**
   * Wskaźnik badany i wpisywany do karty, ale pomijany w ocenie „specyficznej struktury i funkcji”
   * (np. w 91E0 martwe drewno i wiek drzewostanu w podtypach górskich 91E0-6 i 91E0-7). Może zależeć od stanowiska.
   */
  excluded?: boolean | ((ctx: IndicatorContext) => boolean)
  /** Dopisek przy wskaźniku pominiętym w ocenie; domyślnie „nie liczy się do oceny struktury przy tym podtypie”. */
  excludedNote?: string
  /** Co opisuje wskaźnik (z tab. 1 przewodnika). */
  description: string
  /** Szerokie wyjaśnienie: co dokładnie zmierzyć, jak i dlaczego to ważne. */
  help?: string
  /** Jak go zmierzyć w terenie. */
  howTo?: string
  /** Progi waloryzacji (tab. 2 przewodnika). */
  thresholds: Record<'FV' | 'U1' | 'U2', string>
  /** Pola pomiarowe, z których liczona jest podpowiedź oceny. */
  inputs: FieldDef[]
  /** Podpowiedź oceny wg progów; null = za mało danych. */
  suggest?: (inputs: InputValues, ctx?: IndicatorContext) => Grade | null
  /** Wyjaśnienie, skąd wzięła się podpowiedź (pokazywane pod polami). */
  explain?: (inputs: InputValues, ctx?: IndicatorContext) => string | null
  /** Miękkie ostrzeżenie dla całego wskaźnika. */
  warn?: (inputs: InputValues, ctx?: IndicatorContext) => string | null
  /** Generuje tekst „wartość lub opis” z pól pomiarowych. */
  describe?: (inputs: InputValues, ctx?: IndicatorContext) => string
}

export interface StepDef {
  id: string
  title: string
  /** Krótka instrukcja na górze kroku. */
  intro: string
}

export interface ImpactCode {
  code: string
  name: string
}

/**
 * Dodatkowa zakładka formularza z polami zapisywanymi w `values.other` (obok „Innych informacji”).
 * Np. ocena referencyjna i działania ochronne w standardzie PZO jednego z RDOŚ.
 */
export interface ExtraStep {
  id: string
  /** Krótka nazwa na zakładce. */
  tab: string
  /** Nagłówek sekcji. */
  title: string
  intro?: string
  /** Po którym kroku wstawić zakładkę: site, status, impacts, threats, other. Domyślnie przed „Innymi informacjami”. */
  after?: 'site' | 'status' | 'impacts' | 'threats' | 'other'
  fields: FieldDef[]
}

export interface Methodology {
  code: string
  name: string
  /** Siedlisko priorytetowe – w karcie kod z gwiazdką (*91D0). */
  priority?: boolean
  /** Skąd to wszystko wzięto. */
  source: string
  siteFields: FieldDef[]
  /** Zdjęcia fitosocjologiczne: domyślna (zalecana) liczba, można dodawać i usuwać. */
  releves: { defaultCount: number; intro: string; fields: FieldDef[] }
  indicators: IndicatorDef[]
  prospects: { description: string; help?: string; thresholds: Record<'FV' | 'U1' | 'U2', string> }
  impactCodes: ImpactCode[]
  otherFields: FieldDef[]
  /** Dodatkowe zakładki; ich pola lądują w `values.other`, razem z `otherFields`. */
  extraSteps?: ExtraStep[]
  /**
   * Własna reguła oceny „specyficznej struktury i funkcji”, gdy tab. przewodnika liczy inaczej niż reguła ogólna
   * (np. 3260: U2 dopiero przy więcej niż dwóch kardynalnych U2). Brak = `aggregateStructure` z assessment.ts.
   */
  structureRule?: (items: StructureItem[]) => GradeOrEmpty
  /** Katalog gatunków do wyszukiwarki (nazwa naukowa + polska). */
  speciesCatalog?: CatalogOption[]
  /** Krótka etykieta gatunku, np. „torfowiec kępkowy”; undefined = nieznany. */
  speciesInfo?: (name: string) => string | undefined
}

/** Wskaźnik w ocenie struktury: id, ocena i to, czy jest kardynalny przy tym stanowisku. */
export interface StructureItem {
  id: string
  grade: GradeOrEmpty
  cardinal: boolean
}

/** Wszystkie pola zapisywane w `values.other`: „Inne informacje” i dodatkowe zakładki. */
export const allOtherFields = (m: Methodology): FieldDef[] => [...m.otherFields, ...(m.extraSteps ?? []).flatMap((s) => s.fields)]

export interface IndicatorValue {
  inputs: InputValues
  /** „Wartość lub opis” – to, co ląduje w karcie. */
  value: string
  grade: GradeOrEmpty
}

export interface Impact {
  code: string
  name: string
  influence: '-' | '0' | '+' | ''
  intensity: 'H' | 'M' | 'L' | ''
  description: string
}

export interface Threat {
  code: string
  name: string
  description: string
}

export interface CardValues {
  site: InputValues
  releves: InputValues[]
  indicators: Record<string, IndicatorValue>
  prospects: { value: string; grade: GradeOrEmpty }
  impacts: Impact[]
  threats: Threat[]
  other: InputValues
  overallComment: string
}
