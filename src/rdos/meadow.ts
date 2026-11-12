// Klocki wskaźników wspólne dla łąk 6510 i 6410: wybory opisowe, listy gatunków, powierzchnia, fragmentacja,
// procent powierzchni transektu, wojłok. Progi, które się różnią, przychodzą w parametrach.
import { describeSpecies, num, speciesRows } from '../7120/habitats/assessment'
import type { FieldDef, Grade, IndicatorDef, InputValues, SelectOption, SpeciesRow } from '../7120/habitats/types'

export const fmtNum = (n: number) => String(n).replace('.', ',')
export const fmtPct = (n: number | undefined) => (n === undefined ? '—' : `${fmtNum(n)}%`)
const cm = (n: number | undefined) => (n === undefined ? '' : fmtNum(n))

export const labelOf = (opts: SelectOption[], v: unknown) => opts.find((o) => o.value === v)?.label ?? ''
export const byOption = (map: Record<string, Grade>) => (i: InputValues) => map[String(i.choice)] ?? null
export const named = (i: InputValues): SpeciesRow[] => speciesRows(i.species).filter((r) => r.name?.trim())

export const SPECIES_LIST_HELP = `Szukaj gatunku po kilku literach nazwy naukowej albo polskiej (np. „arrh ela”, „rajgras”) i wybierz z listy. Każdy wybrany gatunek dostaje wiersz, w którym wpisujesz pokrycie. Gatunku spoza katalogu nie szukaj na siłę: wybierz „Dodaj własny”. Nazwy z katalogu są rozpoznawane przy liczeniu podpowiedzi oceny, własne nie.

Pokrycie podawaj w procentach powierzchni transektu (rzut pionowy), dla „<1%” wpisz 0,5.`

const GRADE_ORDER = ['FV', 'U1', 'U2', 'XX']

/** Select oceny opisowej. Opcje idą w kolejności FV, U1, U2. */
export const selectInput = (label: string, options: SelectOption[], help?: string): FieldDef => ({
  kind: 'select',
  name: 'choice',
  label,
  options,
  required: true,
  help: [
    help,
    `Wybierz opis najbliższy temu, co widać na stanowisku:\n${options.map((o, i) => `• ${o.label} – ${GRADE_ORDER[i]}`).join(',\n')}.`,
    'Pełne wyjaśnienie wskaźnika jest pod „?” przy jego nazwie.',
  ]
    .filter(Boolean)
    .join('\n\n'),
})

export const speciesInput = (label: string, help: string, required = false): FieldDef => ({
  kind: 'species',
  name: 'species',
  label,
  required,
  help: `${help}\n\n${SPECIES_LIST_HELP}`,
})

/** Suma pokrycia wszystkich gatunków z listy; undefined, gdy któregoś pokrycia brak. */
export function listCover(i: InputValues): { count: number; total?: number; max?: number } {
  const rows = named(i)
  const covers = rows.map((r) => num(r.cover))
  if (!rows.length) return { count: 0, total: 0, max: 0 }
  if (covers.some((c) => c === undefined)) return { count: rows.length }
  const c = covers as number[]
  return { count: rows.length, total: Math.round(c.reduce((a, b) => a + b, 0) * 10) / 10, max: Math.max(...c) }
}

// ---------- powierzchnia ----------

const AREA_TREND: SelectOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się' },
  { value: 'slight', label: 'Niewielki spadek powierzchni siedliska' },
  { value: 'clear', label: 'Wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub literaturą' },
  { value: 'unknown', label: 'Brak danych porównawczych' },
]

export function areaIndicator(code: string): IndicatorDef {
  return {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description: 'Zmiana powierzchni płatów siedliska na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury.',
    help: `Co wybrać: jak zmienia się powierzchnia płatów ${code} na stanowisku. Najczęstsze przyczyny spadku to zaniechanie koszenia (zarastanie ziołoroślami i krzewami), zaoranie, przekształcenie w intensywne użytki zielone, zabudowa.

W polu wartości wpisz powierzchnię płatów i – zgodnie ze wzorem RDOŚ – czy uległa zmniejszeniu, np. „0,66 ha; powierzchnia zmniejszyła się z ok. 1,35 ha w wyniku zaniechania użytkowania na części płatu”. Gdy nie ma danych do porównania, napisz „Brak danych porównawczych” i rozważ ocenę XX.`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się',
      U1: 'Niewielki spadek powierzchni siedliska',
      U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi w literaturze',
    },
    inputs: [selectInput('Jak zmienia się powierzchnia?', AREA_TREND)],
    suggest: byOption({ stable: 'FV', slight: 'U1', clear: 'U2', unknown: 'XX' }),
    describe: (i) => labelOf(AREA_TREND, i.choice),
  }
}

// ---------- procent powierzchni transektu ----------

export function percentIndicator(o: { help: string }): IndicatorDef {
  return {
    id: 'percent',
    label: 'Procent powierzchni zajęty przez siedlisko na transekcie',
    parameter: 'structure',
    description: 'Procent powierzchni transektu zajętej przez siedlisko, szacowany z dokładnością do 10%.',
    help: o.help,
    thresholds: { FV: '80% i więcej', U1: '50–80%', U2: 'Do 50% włącznie' },
    inputs: [
      {
        kind: 'number',
        name: 'share',
        label: 'Udział siedliska na transekcie',
        unit: '%',
        min: 0,
        max: 100,
        required: true,
        help: 'Procent powierzchni transektu zajęty przez siedlisko, w dziesiątkach procent (np. 90, 100).',
      },
    ],
    suggest: (i) => {
      const v = num(i.share)
      if (v === undefined) return null
      return v >= 80 ? 'FV' : v > 50 ? 'U1' : 'U2'
    },
    describe: (i) => (num(i.share) === undefined ? '' : fmtPct(num(i.share))),
  }
}

// ---------- fragmentacja ----------

export function spatialIndicator(o: { fragmentation: SelectOption[]; thresholds: Record<'FV' | 'U1' | 'U2', string>; help: string }): IndicatorDef {
  return {
    id: 'spatial',
    label: 'Struktura przestrzenna płatów siedliska',
    parameter: 'structure',
    description: 'Stopień fragmentacji siedliska w skali porządkowej: duży, średni, mały stopień fragmentacji lub jej brak.',
    help: o.help,
    thresholds: o.thresholds,
    inputs: [selectInput('Stopień fragmentacji', o.fragmentation)],
    suggest: byOption({ none: 'FV', medium: 'U1', large: 'U2' }),
    describe: (i) => labelOf(o.fragmentation, i.choice),
  }
}

// ---------- wojłok ----------

export function litterIndicator(o: { help: string }): IndicatorDef {
  return {
    id: 'litter',
    label: 'Wojłok (martwa materia organiczna)',
    parameter: 'structure',
    description:
      'Grubość warstwy nierozłożonej materii organicznej ponad poziomem próchnicznym, w cm: średnia z 20 pomiarów oraz minimum i maksimum.',
    help: o.help,
    thresholds: { FV: 'Średnia <2 cm', U1: 'Średnia 2–5 cm', U2: 'Średnia >5 cm' },
    inputs: [
      { kind: 'number', name: 'min', label: 'Minimum', unit: 'cm', min: 0, group: 'Grubość wojłoku z 20 pomiarów', groupCols: 3, help: 'Najmniejsza z 20 zmierzonych grubości, w cm.' },
      { kind: 'number', name: 'max', label: 'Maksimum', unit: 'cm', min: 0, group: 'Grubość wojłoku z 20 pomiarów', help: 'Największa z 20 zmierzonych grubości, w cm.' },
      { kind: 'number', name: 'mean', label: 'Średnia', unit: 'cm', min: 0, group: 'Grubość wojłoku z 20 pomiarów', help: 'Średnia z 20 pomiarów, w cm. Od niej zależy podpowiedź oceny. Gdy szacujesz tylko przedział (np. „2–5 cm”), wpisz go wprost w polu wartości i wybierz ocenę.' },
    ],
    suggest: (i) => {
      const v = num(i.mean)
      if (v === undefined) return null
      return v < 2 ? 'FV' : v <= 5 ? 'U1' : 'U2'
    },
    warn: (i) => {
      const [a, b, c] = [num(i.min), num(i.max), num(i.mean)]
      if (c === undefined) return null
      if ((a !== undefined && c < a) || (b !== undefined && c > b)) return 'Średnia leży poza zakresem minimum–maksimum.'
      return null
    },
    describe: (i) => {
      const [a, b, c] = [num(i.min), num(i.max), num(i.mean)]
      const range = a !== undefined && b !== undefined ? `${cm(a)}–${cm(b)} cm` : ''
      const avg = c === undefined ? '' : `średnio ${cm(c)} cm`
      return [range, avg].filter(Boolean).join('; ')
    },
  }
}

// ---------- krzewy ----------

export function shrubsIndicator(o: { thresholds: Record<'FV' | 'U1' | 'U2', string>; help: string; grade: (total: number) => Grade }): IndicatorDef {
  const total = (i: InputValues) => num(i.total) ?? listCover(i).total
  return {
    id: 'shrubs',
    label: 'Ekspansja krzewów i podrostu drzew',
    parameter: 'structure',
    cardinal: true,
    description: 'Sumaryczne pokrycie krzewów i drzew na transekcie oraz lista gatunków i procent ich pokrycia.',
    help: o.help,
    thresholds: o.thresholds,
    inputs: [
      speciesInput('Krzewy i podrost drzew', 'Gatunki krzewów i drzew z pokryciem w % transektu. Brak – zostaw pustą listę.'),
      {
        kind: 'number',
        name: 'total',
        label: 'Łączne pokrycie krzewów i drzew (jeśli szacowane)',
        unit: '%',
        min: 0,
        max: 100,
        help: 'Sumaryczne pokrycie krzewów i podrostu drzew w % transektu, w rzucie pionowym. Opcjonalne – bez niego formularz bierze sumę pokryć z listy.',
      },
    ],
    suggest: (i) => {
      const t = total(i)
      return t === undefined ? null : o.grade(t)
    },
    explain: (i) => {
      if (!named(i).length && num(i.total) === undefined) return null
      return num(i.total) !== undefined ? `Łączne pokrycie (wpisane): ${fmtPct(num(i.total))}.` : `Suma pokryć z listy: ${fmtPct(listCover(i).total)}.`
    },
    describe: (i) => {
      const list = describeSpecies(named(i))
      const t = num(i.total)
      if (!list) return t ? `Łącznie ${fmtPct(t)}` : 'Brak'
      return t !== undefined ? `${list}; łącznie ${fmtPct(t)}` : list
    },
  }
}

export const FRAGMENTATION_BASIC: SelectOption[] = [
  { value: 'none', label: 'Brak fragmentacji lub fragmentacja nieznaczna' },
  { value: 'medium', label: 'Średni stopień fragmentacji' },
  { value: 'large', label: 'Duży stopień fragmentacji (płaty po kilka arów)' },
]

/** Ostrzeżenie o terminie obserwacji poza oknem [from, to] (miesiąc, dzień). */
export const dateWindowWarn =
  (from: [number, number], to: [number, number], text: string) =>
  (v: unknown): string | null => {
    if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null
    const [, mo, d] = v.split('-').map(Number)
    const x = mo * 100 + d
    return x >= from[0] * 100 + from[1] && x <= to[0] * 100 + to[1] ? null : text
  }
