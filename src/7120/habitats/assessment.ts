// Logika ocen. Czyste funkcje, zero Reacta, da się testować bez renderowania czegokolwiek.
import type {
  CardValues,
  FieldDef,
  Grade,
  GradeOrEmpty,
  IndicatorDef,
  InputValues,
  Methodology,
  SpeciesRow,
} from './types'
import { allOtherFields, isListField } from './types'

/** Bezpiecznie wyciąga liczbę z wartości formularza. */
export function num(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value.replace(',', '.').trim())
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

/** Parser dla inputów liczbowych: przyjmuje polski przecinek, pusty string -> undefined. */
export function parseNumberInput(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined
  if (typeof value === 'number') return value
  return Number(String(value).replace(',', '.').trim())
}

/** Pokrycie „<1%” zapisujemy jako 0,5 – tak liczy przewodnik. */
export const BELOW_ONE = 0.5

/**
 * Pokrycie gatunku wpisane przez człowieka: „40”, „0,5”, „5%”, „<1”, „< 1 %”. Pusty -> undefined, bzdura -> NaN (walidacja to złapie).
 */
export function parseCover(value: unknown): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined
  if (typeof value === 'number') return value
  const t = String(value).replace(/\s+/g, '').replace(/%$/, '').replace(',', '.')
  if (t === '') return undefined
  if (/^<1(\.0*)?$/.test(t)) return BELOW_ONE
  return /^\d+(\.\d+)?$/.test(t) ? Number(t) : Number.NaN
}

/** Liczba -> tekst do pola pokrycia: 0,5 -> „<1”, 2.5 -> „2,5”. */
export function coverToInput(value: unknown): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return value === undefined || value === null ? '' : String(value)
  if (value > 0 && value < 1) return '<1'
  return String(value).replace('.', ',')
}

export function speciesRows(value: unknown): SpeciesRow[] {
  return Array.isArray(value) ? (value as SpeciesRow[]) : []
}

/** Im mniej, tym lepiej: wartość <= fvMax -> FV, <= u1Max -> U1, reszta U2. */
export function gradeByUpperBounds(value: number | undefined, fvMax: number, u1Max: number): Grade | null {
  if (value === undefined) return null
  if (value <= fvMax) return 'FV'
  if (value <= u1Max) return 'U1'
  return 'U2'
}

/** Im więcej, tym lepiej: wartość >= fvMin -> FV, >= u1Min -> U1, reszta U2. */
export function gradeByLowerBounds(value: number | undefined, fvMin: number, u1Min: number): Grade | null {
  if (value === undefined) return null
  if (value >= fvMin) return 'FV'
  if (value >= u1Min) return 'U1'
  return 'U2'
}

export function mean(values: unknown[]): number | undefined {
  const nums = values.map(num).filter((v): v is number => v !== undefined)
  if (nums.length === 0) return undefined
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export function formatCover(cover: number | undefined): string {
  if (cover === undefined) return ''
  if (cover > 0 && cover < 1) return '<1%'
  return `${String(cover).replace('.', ',')}%`
}

/** „Eriophorum vaginatum 40%, Sphagnum fallax 1%” */
export function describeSpecies(rows: SpeciesRow[]): string {
  return rows
    .filter((r) => r.name?.trim())
    .map((r) => [r.name.trim(), formatCover(num(r.cover))].filter(Boolean).join(' '))
    .join(', ')
}

/**
 * Ocena parametru „specyficzna struktura i funkcje” (tab. 2):
 * - U2, gdy choć jeden wskaźnik kardynalny ma U2,
 * - FV, gdy wszystkie kardynalne FV, a pozostałe co najmniej U1,
 * - U1 w pozostałych przypadkach.
 * XX we wskaźniku kardynalnym (bez U2) daje XX. Brak oceny -> '' (nie da się policzyć).
 */
export function aggregateStructure(items: { grade: GradeOrEmpty; cardinal: boolean }[]): GradeOrEmpty {
  if (items.length === 0 || items.some((i) => i.grade === '')) return ''
  const cardinal = items.filter((i) => i.cardinal).map((i) => i.grade)
  const others = items.filter((i) => !i.cardinal).map((i) => i.grade)
  if (cardinal.includes('U2')) return 'U2'
  if (cardinal.includes('XX')) return 'XX'
  if (cardinal.every((g) => g === 'FV') && !others.includes('U2')) return 'FV'
  return 'U1'
}

/**
 * Ocena ogólna: wszystkie FV -> FV, jakiekolwiek U2 -> U2, jakiekolwiek U1 -> U1,
 * a XX bez U1/U2 -> XX.
 */
export function aggregateOverall(grades: GradeOrEmpty[]): GradeOrEmpty {
  if (grades.length === 0 || grades.includes('')) return ''
  if (grades.includes('U2')) return 'U2'
  if (grades.includes('U1')) return 'U1'
  if (grades.includes('XX')) return 'XX'
  return 'FV'
}

export interface Assessment {
  area: GradeOrEmpty
  structure: GradeOrEmpty
  prospects: GradeOrEmpty
  overall: GradeOrEmpty
  /** Etykiety wskaźników/parametrów bez oceny. */
  missing: string[]
}

/** Czy wskaźnik jest kardynalny przy danym stanowisku (w 91D0 zależy od wariantu siedliska). */
export function isCardinal(ind: IndicatorDef, site: InputValues | undefined): boolean {
  return typeof ind.cardinal === 'function' ? ind.cardinal({ site: site ?? {} }) : Boolean(ind.cardinal)
}

/** Czy wskaźnik jest pominięty w ocenie struktury przy danym stanowisku (w 91E0 zależy od podtypu). */
export function isExcluded(ind: IndicatorDef, site: InputValues | undefined): boolean {
  return typeof ind.excluded === 'function' ? ind.excluded({ site: site ?? {} }) : Boolean(ind.excluded)
}

/** Kod siedliska tak, jak w karcie: priorytetowe z gwiazdką. */
export const habitatCode = (m: Methodology) => `${m.priority ? '*' : ''}${m.code}`

export function assessCard(m: Methodology, values: CardValues): Assessment {
  const gradeOf = (id: string): GradeOrEmpty => values.indicators?.[id]?.grade ?? ''
  const areaIndicators = m.indicators.filter((i) => i.parameter === 'area')
  const structureIndicators = m.indicators.filter((i) => i.parameter === 'structure' && !isExcluded(i, values.site))

  const area = aggregateOverall(areaIndicators.map((i) => gradeOf(i.id)))
  const structure = aggregateStructure(
    structureIndicators.map((i) => ({ grade: gradeOf(i.id), cardinal: isCardinal(i, values.site) })),
  )
  const prospects = values.prospects?.grade ?? ''
  const overall = aggregateOverall([area, structure, prospects])

  const missing = m.indicators
    .filter((i) => gradeOf(i.id) === '' && !isExcluded(i, values.site))
    .map((i) => i.label)
  if (prospects === '') missing.push('Perspektywy ochrony')

  return { area, structure, prospects, overall, missing }
}

/** Puste wartości startowe wygenerowane z metodyki. */
/** Pusty wiersz zdjęcia fitosocjologicznego (do „Dodaj zdjęcie”). */
export function emptyReleve(m: Methodology): InputValues {
  return Object.fromEntries(
    m.releves.fields.map((f) => [
      f.name,
      isListField(f) ? [] : (f.defaultValue ?? (f.kind === 'number' ? undefined : '')),
    ]),
  )
}

export function emptyCardValues(m: Methodology): CardValues {
  const emptyFields = (fields: FieldDef[]): InputValues =>
    Object.fromEntries(
      fields.map((f) => [
        f.name,
        isListField(f) ? [] : (f.defaultValue ?? (f.kind === 'number' ? undefined : '')),
      ]),
    )
  return {
    site: emptyFields(m.siteFields),
    releves: Array.from({ length: m.releves.defaultCount }, () => emptyFields(m.releves.fields)),
    indicators: Object.fromEntries(
      m.indicators.map((i) => [i.id, { inputs: emptyFields(i.inputs), value: '', grade: '' }]),
    ),
    prospects: { value: '', grade: '' },
    impacts: [],
    threats: [],
    other: emptyFields(allOtherFields(m)),
    overallComment: '',
  }
}
