import { describe, expect, it } from 'vitest'
import { aggregateStructure, assessCard, emptyCardValues, habitatCode, isCardinal } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { CardValues, Grade, GradeOrEmpty, IndicatorContext, InputValues, StructureItem } from '../../7120/habitats/types'
import { examples3260, slawno } from './examples'
import {
  gradeAliens3260,
  gradeArea3260,
  gradeBatrachium3260,
  gradeCharacteristic3260,
  gradeEcoClass3260,
  gradeElodea3260,
  gradeFlow3260,
  gradeHMS3260,
  gradeHQA3260,
  gradeMorph3260,
  gradeShade3260,
  gradeSubstrate3260,
  indicator3260 as ind,
  methodology3260 as m,
  rowsOf,
  shadePercent3260,
  structureRule3260,
} from './methodology'
import { findSpecies3260, isBatrachium3260, isCircinatum3260, speciesKey3260 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues, c: IndicatorContext = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const describeOf = (id: string, inputs: InputValues, c: IndicatorContext = ctx()) => ind(id).describe!(inputs, c)
const bat = (species: string, mmor: string) => ({ species, name: '', mmor })
const other = (name: string, mmor = '') => ({ species: 'other', name, mmor })

/** Wskaźniki struktury z ocenami: najpierw 9 kardynalnych, potem 4 pomocnicze (kolejność jak w metodyce). */
const items = (cardinal: GradeOrEmpty[], aux: GradeOrEmpty[] = ['FV', 'FV', 'FV', 'FV']): StructureItem[] => [
  ...cardinal.map((grade, idx) => ({ id: `c${idx}`, grade, cardinal: true })),
  ...aux.map((grade, idx) => ({ id: `a${idx}`, grade, cardinal: false })),
]
const FV9: GradeOrEmpty[] = Array(9).fill('FV')
const withGrades = (cardinal: Record<number, GradeOrEmpty>) => FV9.map((g, idx) => cardinal[idx] ?? g)

describe('metodyka 3260 – budowa', () => {
  it('kod 3260 (niepriorytetowe), nazwa z przewodnika, jedno zdjęcie fitosocjologiczne', () => {
    expect(habitatCode(m)).toBe('3260')
    expect(m.name).toBe('Nizinne i podgórskie rzeki ze zbiorowiskami włosieniczników (Ranunculion fluitantis)')
    expect(emptyCardValues(m).releves).toHaveLength(1)
  })

  it('wskaźniki w kolejności karty z przewodnika', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Gatunki charakterystyczne – włosieniczniki',
      'Gatunki charakterystyczne – inne',
      'Materiał dna koryta',
      'Ocena stanu ekologicznego',
      'Pokrycie transektu przez moczarkę kanadyjską Elodea canadensis',
      'Przepływy',
      'Spiętrzenie wód rzeki',
      'Wskaźnik naturalności siedliska (HQA)',
      'Wskaźnik przekształcenia siedliska (HMS)',
      'Naturalne elementy morfologiczne',
      'Zacienienie rzeki',
      'Gatunki inwazyjne',
      'Ścieki',
    ])
  })

  it('9 kardynalnych i 4 pomocnicze – jak lista pod tab. 3', () => {
    const s = m.indicators.filter((i) => i.parameter === 'structure')
    expect(s.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual([
      'batrachium',
      'characteristic',
      'substrate',
      'ecoStatus',
      'elodea',
      'flow',
      'impoundment',
      'hqa',
      'hms',
    ])
    expect(s.filter((i) => !isCardinal(i, {})).map((i) => i.id)).toEqual(['morphology', 'shade', 'aliens', 'sewage'])
  })

  it('kody oddziaływań ze słownika 2011, bez duplikatów', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    expect(m.impactCodes.find((c) => c.code === 'J02.03')?.name).toMatch(/Regulowanie/)
    expect(m.impactCodes.find((c) => c.code === 'E01')?.name).toBe('Tereny zurbanizowane, tereny zamieszkane')
  })

  it('termin: ostrzeżenie poza lipcem–sierpniem', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2011-07-16')).toBeNull()
    expect(date.warn!('2024-08-29')).toBeNull()
    expect(date.warn!('2024-09-05')).toMatch(/lipiec–sierpień/)
    expect(date.warn!('2024-06-20')).toMatch(/lipiec–sierpień/)
  })
})

describe('metodyka 3260 – progi (tab. 3)', () => {
  it('włosieniczniki: ≥2 FV, 1 U1, brak U2; powierzchnia: ≥3 FV, 1–2 U1, brak U2', () => {
    expect([0, 1, 2, 9].map(gradeBatrachium3260)).toEqual(['U2', 'U1', 'FV', 'FV'])
    expect([0, 1, 2, 3, 6].map(gradeArea3260)).toEqual(['U2', 'U1', 'U1', 'FV', 'FV'])
  })
  it('inne charakterystyczne: ≥2 FV, 1 U1, 0 U2', () => {
    expect([0, 1, 2, 5].map(gradeCharacteristic3260)).toEqual(['U2', 'U1', 'FV', 'FV'])
  })
  it('materiał dna: FV gdy ≥20% grubego i ≤20% mułu; muł >20% U2; mało grubego U1', () => {
    expect(gradeSubstrate3260(40, 0)).toBe('FV')
    expect(gradeSubstrate3260(20, 20)).toBe('FV')
    expect(gradeSubstrate3260(19, 5)).toBe('U1')
    expect(gradeSubstrate3260(60, 21)).toBe('U2')
  })
  it('stan ekologiczny: I–II FV, III U1, IV–V U2', () => {
    expect([1, 2, 3, 4, 5].map(gradeEcoClass3260)).toEqual(['FV', 'FV', 'U1', 'U2', 'U2'])
  })
  it('moczarka: 0–2 FV, 3–5 U1, >5 U2', () => {
    expect([0, 2, 3, 5, 6, 9].map(gradeElodea3260)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })
  it('przepływy szybkie: >40 FV, 10–40 U1, <10 U2', () => {
    expect([41, 40, 28, 10, 9.9].map(gradeFlow3260)).toEqual(['FV', 'U1', 'U1', 'U1', 'U2'])
  })
  it('HQA ≥50 FV, 30–50 U1, ≤30 U2; HMS ≤20 FV, 20–40 U1, ≥40 U2', () => {
    expect([50, 49, 35, 31, 30].map(gradeHQA3260)).toEqual(['FV', 'U1', 'U1', 'U1', 'U2'])
    expect([20, 21, 39, 40, 55].map(gradeHMS3260)).toEqual(['FV', 'U1', 'U1', 'U2', 'U2'])
  })
  it('formy morfologiczne: ≥3 FV, 1–2 U1, 0 U2; zacienienie ≤50 FV, ≤80 U1, >80 U2', () => {
    expect([0, 1, 2, 3].map(gradeMorph3260)).toEqual(['U2', 'U1', 'U1', 'FV'])
    expect([17, 50, 51, 80, 81].map(gradeShade3260)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('zacienienie z RHS: (lewy + prawy) × zacienienie / 30', () => {
    expect(shadePercent3260(5, 5, 3)).toBe(100)
    expect(shadePercent3260(2, 3, 1)).toBe(17)
    expect(shadePercent3260(4, 4, 0)).toBe(0)
  })
  it('obce: 0–2 FV, 3–4 U1, ≥5 albo liczny U2', () => {
    expect(gradeAliens3260(0, false)).toBe('FV')
    expect(gradeAliens3260(2, false)).toBe('FV')
    expect(gradeAliens3260(3, false)).toBe('U1')
    expect(gradeAliens3260(4, false)).toBe('U1')
    expect(gradeAliens3260(5, false)).toBe('U2')
    expect(gradeAliens3260(1, true)).toBe('U2')
  })
})

describe('metodyka 3260 – reguła struktury (tab. 3)', () => {
  it('U2 dopiero przy więcej niż 2 kardynalnych U2', () => {
    expect(structureRule3260(items(withGrades({ 0: 'U2', 1: 'U2' })))).not.toBe('U2')
    expect(structureRule3260(items(withGrades({ 0: 'U2', 1: 'U2', 2: 'U2' })))).toBe('U2')
  })
  it('FV: same FV; maks. 2 U2 (reszta FV) albo maks. 3 U1 (reszta FV) – licząc też pomocnicze', () => {
    expect(structureRule3260(items(FV9))).toBe('FV')
    expect(structureRule3260(items(withGrades({ 3: 'U2', 7: 'U2' })))).toBe('FV')
    expect(structureRule3260(items(withGrades({ 3: 'U1', 7: 'U1' }), ['U1', 'FV', 'FV', 'FV']))).toBe('FV')
    expect(structureRule3260(items(withGrades({ 3: 'U1', 7: 'U1' }), ['U1', 'U1', 'FV', 'FV']))).toBe('U1')
    expect(structureRule3260(items(withGrades({ 3: 'U2' }), ['U2', 'U2', 'FV', 'FV']))).toBe('U1')
  })
  it('U1 i U2 naraz – już nie FV', () => {
    expect(structureRule3260(items(withGrades({ 0: 'U2', 1: 'U1' })))).toBe('U1')
  })
  it('XX w kardynalnym → XX (chyba że i tak >2 U2); XX w pomocniczym się nie liczy; brak oceny → pusto', () => {
    expect(structureRule3260(items(withGrades({ 4: 'XX' })))).toBe('XX')
    expect(structureRule3260(items(withGrades({ 0: 'U2', 1: 'U2', 2: 'U2', 4: 'XX' })))).toBe('U2')
    expect(structureRule3260(items(FV9, ['XX', 'FV', 'FV', 'FV']))).toBe('FV')
    expect(structureRule3260(items(withGrades({ 4: '' })))).toBe('')
  })
  it('różni się od ogólnej reguły silnika (tam jedno kardynalne U2 = U2)', () => {
    const one = items(withGrades({ 8: 'U2' }))
    expect(aggregateStructure(one)).toBe('U2')
    expect(structureRule3260(one)).toBe('FV')
  })
})

describe('metodyka 3260 – pomiary → podpowiedź i opis', () => {
  it('włosieniczniki: krążkolistny się nie liczy, synonimy Ranunculus = Batrachium', () => {
    expect(isBatrachium3260('Ranunculus fluitans')).toBe(true)
    expect(isCircinatum3260('Batrachium circinatum')).toBe(true)
    expect(speciesKey3260('Ranunculus fluitans')).toBe(speciesKey3260('Batrachium fluitans'))
    expect(suggest('batrachium', { rows: [bat('Batrachium circinatum', '7')] })).toBe('U2')
    expect(suggest('batrachium', { rows: [bat('Batrachium circinatum', '7'), bat('Batrachium peltatum', '1')] })).toBe('U1')
    expect(suggest('batrachium', { rows: [bat('Batrachium fluitans', '6')] })).toBe('FV')
    expect(suggest('batrachium', { rows: [], none: 'yes' })).toBe('U2')
    expect(suggest('batrachium', { rows: [] })).toBeNull()
    expect(describeOf('batrachium', { rows: [bat('Batrachium fluitans', '6')] })).toBe('Batrachium fluitans – 6')
  })

  it('powierzchnia: z listy włosieniczników (najwyższy współczynnik) albo wprost', () => {
    const c = ctx({ indicators: { batrachium: { inputs: { rows: [bat('Batrachium fluitans', '2'), bat('Batrachium peltatum', '3')] }, value: '', grade: '' } } })
    expect(suggest('area', {}, c)).toBe('FV')
    expect(suggest('area', { cover: '2' }, c)).toBe('U1')
    expect(suggest('area', {}, ctx())).toBeNull()
    const onlyCirc = ctx({ indicators: { batrachium: { inputs: { rows: [bat('Batrachium circinatum', '8')] }, value: '', grade: '' } } })
    expect(suggest('area', {}, onlyCirc)).toBe('U2')
    expect(describeOf('area', {}, onlyCirc)).toBe('Brak chronionych gatunków włosieniczników')
  })

  it('inne charakterystyczne: liczą się tylko z tab. 2; „inny gatunek” idzie do opisu', () => {
    const rows = [
      { species: 'Callitriche cophocarpa', name: '', mmor: '3' },
      other('Berula erecta', '1'),
      other('Fontinalis antipyretica', '2'),
    ]
    expect(rowsOf(rows).map((r) => r.name)).toEqual(['Callitriche cophocarpa', 'Berula erecta', 'Fontinalis antipyretica'])
    expect(suggest('characteristic', { rows })).toBe('FV')
    expect(suggest('characteristic', { rows: rows.slice(0, 2) })).toBe('U1')
    expect(suggest('characteristic', { rows: [other('Berula erecta', '1')] })).toBe('U2')
    expect(describeOf('characteristic', { rows })).toBe('Callitriche cophocarpa – 3, Berula erecta – 1, Fontinalis antipyretica – 2')
    expect(ind('characteristic').warn!({ rows: [bat('Batrachium fluitans', '3')] }, ctx())).toMatch(/poprzednim wskaźniku/)
  })

  it('materiał dna: sumuje gruboziarnisty, ostrzega gdy suma ≠ 100%', () => {
    expect(suggest('substrate', { sand: 60, gravel: 30, riprap: 10 })).toBe('FV')
    expect(suggest('substrate', { sand: 85, gravel: 10, mud: 5 })).toBe('U1')
    expect(suggest('substrate', { sand: 50, mud: 30, stones: 20 })).toBe('U2')
    expect(suggest('substrate', {})).toBeNull()
    expect(ind('substrate').warn!({ sand: 50, gravel: 30 }, ctx())).toMatch(/80%/)
    expect(ind('substrate').warn!({ sand: 60, gravel: 30, riprap: 10 }, ctx())).toBeNull()
    expect(describeOf('substrate', { sand: 60, gravel: 30, riprap: 10 })).toBe('Kamyki/żwir – 30%, narzut kamienny – 10%, piasek – 60%')
  })

  it('przepływy: szybkie = kipiel + rwący + wartki', () => {
    expect(suggest('flow', { unbroken: 10, rippled: 18, smooth: 72 })).toBe('U1')
    expect(suggest('flow', { broken: 20, rippled: 30, smooth: 50 })).toBe('FV')
    expect(suggest('flow', { smooth: 95, rippled: 5 })).toBe('U2')
    expect(describeOf('flow', { unbroken: 10, rippled: 18, smooth: 72 })).toBe('Rwący – 10%, wartki – 18%, gładki – 72%')
  })

  it('stan ekologiczny z klasy, MIR tylko do opisu', () => {
    expect(suggest('ecoStatus', { ecoClass: '2', mir: 47.1 })).toBe('FV')
    expect(suggest('ecoStatus', { mir: 47.1 })).toBeNull()
    expect(describeOf('ecoStatus', { ecoClass: '2', mir: 47.1 })).toBe('Wartość wskaźnika MIR = 47,1 – stan ekologiczny dobry')
  })

  it('moczarka, HQA, HMS, spiętrzenie, ścieki', () => {
    expect(suggest('elodea', { mmor: '0' })).toBe('FV')
    expect(suggest('elodea', { mmor: '6' })).toBe('U2')
    expect(describeOf('elodea', { mmor: '0' })).toBe('Brak')
    expect(suggest('hqa', { value: 35 })).toBe('U1')
    expect(suggest('hms', { value: 55 })).toBe('U2')
    expect(suggest('impoundment', { choice: 'long' })).toBe('U2')
    expect(suggest('sewage', { choice: 'severe' })).toBe('U2')
  })

  it('formy morfologiczne: liczy rodzaje, nie sztuki', () => {
    const rows = [{ element: 'island' }, { element: 'island' }, { element: 'sideBar' }]
    expect(suggest('morphology', { rows })).toBe('U1')
    expect(suggest('morphology', { rows: [...rows, { element: 'boulders' }] })).toBe('FV')
    expect(suggest('morphology', { rows: [], none: 'yes' })).toBe('U2')
    expect(describeOf('morphology', { rows })).toBe('Wyspa, odsyp boczny (brzegowy)')
  })

  it('zacienienie: z RHS albo wprost', () => {
    expect(suggest('shade', { treesLeft: '5', treesRight: '5', shading: '3' })).toBe('U2')
    expect(suggest('shade', { treesLeft: '2', treesRight: '3', shading: '1' })).toBe('FV')
    expect(suggest('shade', { percent: 60 })).toBe('U1')
    expect(suggest('shade', { treesLeft: '2' })).toBeNull()
  })

  it('gatunki inwazyjne: moczarka kanadyjska pomijana, liczny → U2', () => {
    const r = (species: string, abundance = 'present') => ({ species, name: '', abundance })
    expect(suggest('aliens', { rows: [r('Echinocystis lobata'), r('Reynoutria japonica'), r('Impatiens parviflora')] })).toBe('U1')
    expect(suggest('aliens', { rows: [r('Elodea canadensis'), r('Impatiens parviflora')] })).toBe('FV')
    expect(suggest('aliens', { rows: [r('Impatiens glandulifera', 'abundant')] })).toBe('U2')
    expect(suggest('aliens', { rows: [], none: 'yes' })).toBe('FV')
    expect(describeOf('aliens', { rows: [r('Impatiens parviflora'), r('Reynoutria japonica', 'abundant')] })).toBe(
      'Impatiens parviflora – mało liczne; Reynoutria japonica – liczne (>33% odcinka)',
    )
  })

  it('katalog: polskie nazwy, grupy', () => {
    expect(findSpecies3260('Groenlandia densa')?.polish).toBe('rdestniczka gęsta')
    expect(m.speciesInfo!('Batrachium circinatum')).toMatch(/nie liczy się/)
    expect(m.speciesCatalog!.find((c) => c.value === 'Fontinalis antipyretica')?.layer).toBe('D')
  })
})

describe('przykład z przewodnika: Kanał Miejski – Sławno (16.07.2011)', () => {
  const ctxOf = (v: CardValues): IndicatorContext => ({ site: v.site, indicators: v.indicators })

  it('podpowiedzi z pomiarów = oceny wskaźników w karcie', () => {
    for (const i of m.indicators) {
      const iv = slawno.indicators[i.id]
      expect([i.id, i.suggest!(iv.inputs, ctxOf(slawno))]).toEqual([i.id, iv.grade])
    }
  })

  it('powierzchnia FV, struktura U1 (jak w karcie), perspektywy U2; ogólna U2 („najgorszy decyduje”, w karcie U1)', () => {
    const a = assessCard(m, slawno)
    expect(a).toMatchObject({ area: 'FV', structure: 'U1', prospects: 'U2', overall: 'U2', missing: [] })
  })

  it('wykonawca zanonimizowany, przykład przechodzi walidację', () => {
    expect(slawno.site.observer).toBe('Jan Kowalski')
    expect(examples3260.map((e) => e.label)).toEqual(['Kanał Miejski – Sławno'])
    const r = buildCardSchema(m).safeParse(slawno)
    expect(r.success ? [] : r.error.issues.map((x) => `${x.path.join('.')}: ${x.message}`)).toEqual([])
  })
})
