import { describe, expect, it } from 'vitest'
import {
  aggregateOverall,
  aggregateStructure,
  assessCard,
  emptyCardValues,
  isExcluded,
  describeSpecies,
  gradeByLowerBounds,
  gradeByUpperBounds,
  mean,
  num,
  parseNumberInput,
} from './assessment'
import type { GradeOrEmpty, Methodology } from './types'

describe('liczby z formularza', () => {
  it('num łyka polski przecinek i odrzuca śmieci', () => {
    expect(num('0,5')).toBe(0.5)
    expect(num(12)).toBe(12)
    expect(num('')).toBeUndefined()
    expect(num('dużo')).toBeUndefined()
    expect(num(Number.NaN)).toBeUndefined()
  })

  it('parseNumberInput: pusty string to undefined, nie zero', () => {
    expect(parseNumberInput('')).toBeUndefined()
    expect(parseNumberInput('2,5')).toBe(2.5)
    expect(parseNumberInput('abc')).toBeNaN()
  })

  it('mean pomija puste pomiary', () => {
    expect(mean([10, undefined, '30'])).toBe(20)
    expect(mean([undefined, ''])).toBeUndefined()
  })
})

describe('progi', () => {
  it('gradeByUpperBounds – granice włącznie', () => {
    expect(gradeByUpperBounds(25, 25, 75)).toBe('FV')
    expect(gradeByUpperBounds(26, 25, 75)).toBe('U1')
    expect(gradeByUpperBounds(75, 25, 75)).toBe('U1')
    expect(gradeByUpperBounds(76, 25, 75)).toBe('U2')
    expect(gradeByUpperBounds(undefined, 25, 75)).toBeNull()
  })

  it('gradeByLowerBounds – granice włącznie', () => {
    expect(gradeByLowerBounds(45, 45, 20)).toBe('FV')
    expect(gradeByLowerBounds(20, 45, 20)).toBe('U1')
    expect(gradeByLowerBounds(19, 45, 20)).toBe('U2')
  })
})

describe('agregacja ocen', () => {
  const ind = (grade: '' | 'FV' | 'U1' | 'U2' | 'XX', cardinal = false) => ({ grade, cardinal })

  it('U2 we wskaźniku kardynalnym = U2 dla struktury', () => {
    expect(aggregateStructure([ind('FV', true), ind('U2', true), ind('FV')])).toBe('U2')
  })

  it('U2 w niekardynalnym nie zabija parametru, ale blokuje FV', () => {
    expect(aggregateStructure([ind('FV', true), ind('U2')])).toBe('U1')
  })

  it('wszystkie kardynalne FV, reszta co najmniej U1 = FV', () => {
    expect(aggregateStructure([ind('FV', true), ind('FV', true), ind('U1')])).toBe('FV')
  })

  it('XX w kardynalnym bez U2 = XX', () => {
    expect(aggregateStructure([ind('XX', true), ind('FV', true)])).toBe('XX')
  })

  it('brak oceny = nie liczymy', () => {
    expect(aggregateStructure([ind('FV', true), ind('')])).toBe('')
    expect(aggregateOverall(['FV', ''])).toBe('')
  })

  it('ocena ogólna to najgorsza z ocen', () => {
    expect(aggregateOverall(['FV', 'FV', 'FV'])).toBe('FV')
    expect(aggregateOverall(['FV', 'U1', 'FV'])).toBe('U1')
    expect(aggregateOverall(['U1', 'U2', 'FV'])).toBe('U2')
    expect(aggregateOverall(['FV', 'XX'])).toBe('XX')
    expect(aggregateOverall(['U1', 'XX'])).toBe('U1')
  })
})

it('describeSpecies składa opis jak w karcie', () => {
  expect(
    describeSpecies([
      { name: 'Eriophorum vaginatum', cover: 40 },
      { name: 'Sphagnum fallax', cover: 0.5 },
      { name: '  ' },
    ]),
  ).toBe('Eriophorum vaginatum 40%, Sphagnum fallax <1%')
})

describe('wskaźniki pominięte w ocenie struktury (excluded)', () => {
  const m = {
    code: 'TEST',
    name: 'test',
    source: '',
    siteFields: [],
    releves: { defaultCount: 0, intro: '', fields: [] },
    prospects: { description: '', thresholds: { FV: '', U1: '', U2: '' } },
    impactCodes: [],
    otherFields: [],
    indicators: [
      { id: 'a', label: 'A', parameter: 'area', description: '', thresholds: { FV: '', U1: '', U2: '' }, inputs: [] },
      { id: 'k', label: 'K', parameter: 'structure', cardinal: true, description: '', thresholds: { FV: '', U1: '', U2: '' }, inputs: [] },
      {
        id: 'x',
        label: 'X',
        parameter: 'structure',
        cardinal: true,
        excluded: (ctx: { site: Record<string, unknown> }) => ctx.site.sub === 'mountain',
        description: '',
        thresholds: { FV: '', U1: '', U2: '' },
        inputs: [],
      },
    ],
  } satisfies Methodology
  const card = (sub: string, x: GradeOrEmpty) => ({
    ...emptyCardValues(m),
    site: { sub },
    indicators: { a: { inputs: {}, value: '', grade: 'FV' as const }, k: { inputs: {}, value: '', grade: 'FV' as const }, x: { inputs: {}, value: '', grade: x } },
    prospects: { value: '', grade: 'FV' as const },
  })

  it('isExcluded czyta funkcję kontekstu albo boolean', () => {
    expect(isExcluded(m.indicators[2], { sub: 'mountain' })).toBe(true)
    expect(isExcluded(m.indicators[2], { sub: 'lowland' })).toBe(false)
    expect(isExcluded(m.indicators[1], undefined)).toBe(false)
  })

  it('pominięty kardynalny U2 nie psuje struktury, a brak jego oceny nie blokuje wyniku', () => {
    expect(assessCard(m, card('lowland', 'U2')).structure).toBe('U2')
    expect(assessCard(m, card('mountain', 'U2')).structure).toBe('FV')
    const empty = assessCard(m, card('mountain', ''))
    expect(empty.structure).toBe('FV')
    expect(empty.missing).toEqual([])
    expect(assessCard(m, card('lowland', '')).missing).toEqual(['X'])
  })
})
