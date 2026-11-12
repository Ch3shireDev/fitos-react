// Wspólne klocki metodyk siedlisk (głównie leśnych): pola selectów z oceną, listy gatunków, sumy pokrycia.
// Zero Reacta. Wcześniej każda metodyka (91D0) miała własną kopię tych funkcji – teraz siedzą tutaj.
import type { FieldDef, Grade, InputValues, SelectOption } from '../7120/habitats/types'
import { num, speciesRows } from '../7120/habitats/assessment'

/** Pole procentowe 0–100. */
export const pct = (name: string, label: string, extra: Partial<FieldDef> = {}): FieldDef =>
  ({ kind: 'number', name, label, unit: '%', min: 0, max: 100, required: true, ...extra }) as FieldDef

/** 12.5 -> „12,5%”, undefined -> „—”. */
export const fmt = (n: number | undefined, unit = '%') =>
  n === undefined ? '—' : `${String(n).replace('.', ',')}${unit === '%' ? '%' : ` ${unit}`}`

/** Liczba po polsku, bez jednostki. */
export const plNum = (n: number) => String(n).replace('.', ',')

export const labelOf = (opts: SelectOption[], v: unknown) => opts.find((o) => o.value === v)?.label ?? ''

/** Ocena z selecta: mapa wartość -> ocena. */
export const byOption =
  (map: Record<string, Grade>, field = 'choice') =>
  (i: InputValues): Grade | null =>
    map[String(i[field])] ?? null

/** Opcja selecta z przypisaną oceną – z niej fabryki budują i podpowiedź, i progi. */
export interface GradedOption extends SelectOption {
  grade: Grade
}

export const gradeMap = (options: GradedOption[]): Record<string, Grade> =>
  Object.fromEntries(options.map((o) => [o.value, o.grade]))

/** Progi FV/U1/U2 zbudowane z etykiet opcji (gdy kilka opcji ma tę samą ocenę – łączone „ albo ”). */
export function thresholdsFromOptions(options: GradedOption[]): Record<'FV' | 'U1' | 'U2', string> {
  const of = (g: Grade) =>
    options
      .filter((o) => o.grade === g)
      .map((o) => o.label)
      .join(' albo ')
  return { FV: of('FV'), U1: of('U1'), U2: of('U2') }
}

export const SPECIES_LIST_HELP = `Szukaj gatunku po kilku literach nazwy naukowej albo polskiej (np. „que pet”, „dąb”) i wybierz z listy. Każdy wybrany gatunek dostaje wiersz, w którym wpisujesz pokrycie. Gatunku spoza katalogu nie szukaj na siłę: wybierz „Dodaj własny”. Nazwy z katalogu są rozpoznawane przy liczeniu podpowiedzi oceny, własne nie.

Pokrycie podawaj w procentach powierzchni transektu (rzut pionowy), dla „<1%” wpisz 0,5. Warstwę (A, B, C, D) możesz dopisać w opisie wskaźnika, tak jak w karcie papierowej („A: Quercus petraea 50%”).`

/**
 * Select oceny opisowej. Opcje z oceną (GradedOption) dostają ją w pomocy przy każdej pozycji,
 * zwykłe SelectOption – ocenę wg kolejności FV, U1, U2, XX.
 */
export function selectInput(label: string, options: (SelectOption | GradedOption)[], help?: string, name = 'choice'): FieldDef {
  const ORDER = ['FV', 'U1', 'U2', 'XX']
  return {
    kind: 'select',
    name,
    label,
    options: options.map(({ value, label: l }) => ({ value, label: l })),
    required: true,
    help: [
      help,
      `Wybierz opis najbliższy temu, co widać na transekcie:\n${options
        .map((o, i) => `• ${o.label} – ${'grade' in o ? o.grade : ORDER[i]}`)
        .join(',\n')}.`,
      'Pełne wyjaśnienie wskaźnika jest pod „?” przy jego nazwie.',
    ]
      .filter(Boolean)
      .join('\n\n'),
  }
}

export const speciesInput = (label: string, help: string, required = false, name = 'species'): FieldDef => ({
  kind: 'species',
  name,
  label,
  required,
  help: `${help}\n\n${SPECIES_LIST_HELP}`,
})

const round1 = (n: number) => Math.round(n * 10) / 10

/**
 * Liczba gatunków na liście i suma ich pokrycia (każdy wiersz się liczy, niezależnie od katalogu).
 * total: pusta lista -> 0; są wiersze, ale żaden nie ma pokrycia -> undefined.
 */
export function listCover(i: InputValues, field = 'species'): { count: number; total?: number } {
  const rows = speciesRows(i[field]).filter((r) => r.name?.trim())
  const covers = rows.map((r) => num(r.cover)).filter((v): v is number => v !== undefined)
  return {
    count: rows.length,
    total: covers.length ? round1(covers.reduce((a, b) => a + b, 0)) : rows.length ? undefined : 0,
  }
}

/** Wiersze listy spełniające warunek (np. grupa w katalogu) i suma ich pokrycia. */
export function coverWhere(value: unknown, pred: (name: string) => boolean): { names: string[]; total?: number } {
  const hits = speciesRows(value).filter((r) => r.name?.trim() && pred(r.name.trim()))
  const covers = hits.map((r) => num(r.cover)).filter((v): v is number => v !== undefined)
  return {
    names: hits.map((r) => r.name.trim()),
    total: covers.length ? round1(covers.reduce((a, b) => a + b, 0)) : undefined,
  }
}

/** Pole z listy pól (np. pola 7120 do ponownego użycia). Rzuca, gdy brak – literówka ma wybuchnąć w testach, nie w terenie. */
export function pickField(fields: FieldDef[], name: string, overrides: Partial<FieldDef> = {}): FieldDef {
  const f = fields.find((x) => x.name === name)
  if (!f) throw new Error(`Brak pola ${name}`)
  return { ...f, ...overrides } as FieldDef
}

/** Normalizacja nazw do wyszukiwania w katalogu: małe litery, bez „×”, „x” między członami i podwójnych spacji. */
export const normalizeName = (s: string) =>
  s
    .toLowerCase()
    .replace(/[×]/g, 'x')
    .replace(/\s+/g, ' ')
    .trim()
