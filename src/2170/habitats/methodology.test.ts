import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import type { Grade, IndicatorContext, InputValues } from '../../7120/habitats/types'
import { examples2170, helskieWydmy1 } from './examples'
import { gradeArea2170, gradeClump2170, gradeDamage2170, gradeHeight2170, indicator2170 as ind, methodology2170 as m } from './methodology'
import { defaultLayer2170, findSpecies2170, isCharacteristic2170, isExpansive2170, isWillow2170 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, ctx())
const sp = (...names: string[]) => names.map((name) => ({ name }))

describe('metodyka 2170 – struktura', () => {
  it('kod 2170 (nie priorytetowe), stanowisko punktowe, 1 zdjęcie 25 m²', () => {
    expect(habitatCode(m)).toBe('2170')
    expect(m.name).toBe('Nadmorskie wydmy z zaroślami wierzby piaskowej')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toMatch(/stanowisko punktowe/)
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(emptyCardValues(m).releves).toHaveLength(1)
  })

  it('wskaźniki w kolejności tab. 2 (z powierzchnią siedliska na początku)', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Charakterystyczna kombinacja gatunków',
      'Gatunki ekspansywne drzew i krzewów',
      'Wysokość krzewów (średnia)',
      'Odnowienie naturalne wierzby piaskowej',
      'Powierzchnia kępy',
      'Stan zdrowotny krzewów wierzby piaskowej',
    ])
  })

  it('kardynalne: gatunki ekspansywne, powierzchnia kępy, stan zdrowotny; nic pominiętego', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['expansive', 'clump', 'health'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('nazwy z SI MGSP podane w opisach', () => {
    expect(ind('species').description).toMatch(/Charakterystyczna kombinacja florystyczna/)
    expect(ind('expansive').description).toMatch(/Gatunki ekspansywne roślin drzewiastych/)
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...m.otherFields, ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: ostrzeżenie poza czerwcem–sierpniem', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2021-06-01')).toBeNull()
    expect(date.warn!('2021-08-31')).toBeNull()
    expect(date.warn!('2010-09-15')).toMatch(/poza optymalnym/)
    expect(date.warn!('2021-05-30')).toMatch(/poza optymalnym/)
  })

  it('zwarcie C przyjmuje „<5” (pole tekstowe), reszta warstw liczbowa', () => {
    const f = (n: string) => m.releves.fields.find((x) => x.name === n)!
    expect(f('coverC').kind).toBe('text')
    expect(f('coverB').kind).toBe('number')
  })

  it('kody oddziaływań bez duplikatów, z sukcesją, konkurencją, turystyką, erozją i sztormem', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['D01.01', 'G01.02', 'G05.01', 'K01.01', 'K02.01', 'K04.01', 'L07', 'X']) expect(codes).toContain(c)
  })
})

describe('metodyka 2170 – progi', () => {
  it('wysokość: >1 m FV, 0,2–1 m U1, <0,2 m U2', () => {
    expect([2, 1.01, 1, 0.5, 0.2, 0.19, 0].map(gradeHeight2170)).toEqual(['FV', 'FV', 'U1', 'U1', 'U1', 'U2', 'U2'])
  })

  it('wysokość: średnia ma pierwszeństwo, bez niej środek rozpiętości, potem klasa', () => {
    expect(suggest('height', { mean: 0.8, min: 1, max: 1.5 })).toBe('U1')
    expect(suggest('height', { min: 1, max: 1.5 })).toBe('FV')
    expect(suggest('height', { min: 0.5, max: 1.5 })).toBe('U1')
    expect(suggest('height', { choice: 'low' })).toBe('U2')
    expect(suggest('height', {})).toBeNull()
    expect(ind('height').describe!({ min: 1, max: 1.5 }, ctx())).toBe('1–1,5 m')
    expect(ind('height').describe!({ mean: 1.2, min: 0.5, max: 1.5 }, ctx())).toBe('średnio 1,2 m, rozpiętość 0,5–1,5 m')
    expect(ind('height').warn!({ min: 2, max: 1 }, ctx())).toMatch(/„od” jest większa/)
    expect(ind('height').warn!({ mean: 0.5, choice: 'high' }, ctx())).toMatch(/nie pasuje/)
  })

  it('powierzchnia kępy: >100 FV, 50–100 U1, <50 U2', () => {
    expect([200, 100.5, 100, 50, 49, 3].map(gradeClump2170)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
    expect(suggest('clump', { value: 20, choice: 'large' })).toBe('U2')
    expect(suggest('clump', { choice: 'medium' })).toBe('U1')
    expect(ind('clump').warn!({ value: 20, choice: 'large' }, ctx())).toMatch(/20 m² nie pasuje/)
    expect(ind('clump').describe!({ value: 20 }, ctx())).toBe('20 m²')
  })

  it('stan zdrowotny: do 10% FV, do 50% U1, powyżej 50% U2', () => {
    expect([0, 10, 10.5, 50, 51, 100].map(gradeDamage2170)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
    expect(suggest('health', { value: 30 })).toBe('U1')
    expect(suggest('health', { choice: 'bad' })).toBe('U2')
    expect(ind('health').describe!({ value: 30 }, ctx())).toBe('uszkodzone pędy terminalne: 30%')
  })

  it('powierzchnia siedliska: gorsza z wielkości płatu i trendu, „brak danych” nie obniża', () => {
    expect(gradeArea2170({ areaM2: 150, choice: 'stable' })).toBe('FV')
    expect(gradeArea2170({ areaM2: 50, choice: 'stable' })).toBe('U1')
    expect(gradeArea2170({ areaM2: 150, choice: 'smallDecrease' })).toBe('U1')
    expect(gradeArea2170({ areaM2: 20 })).toBe('U2')
    expect(gradeArea2170({ areaM2: 0 })).toBe('U2')
    expect(gradeArea2170({ areaM2: 150, choice: 'unknown' })).toBe('FV')
    expect(gradeArea2170({ choice: 'unknown' })).toBe('XX')
    expect(gradeArea2170({})).toBeNull()
    expect(ind('area').explain!({ areaM2: 50, choice: 'stable' }, ctx())).toMatch(/50 m² → U1, trend → FV/)
  })

  it('selekty opisowe: kombinacja gatunków, ekspansywne, odnowienie', () => {
    expect(suggest('species', { choice: 'impoverished' })).toBe('U1')
    expect(suggest('expansive', { choice: 'single' })).toBe('U1')
    expect(suggest('expansive', { choice: 'clumps' })).toBe('U2')
    expect(suggest('regeneration', { choice: 'many' })).toBe('FV')
    expect(suggest('regeneration', { choice: 'none' })).toBe('U2')
  })

  it('kombinacja gatunków: liczy gatunki typowe, ostrzega bez wierzby i przy ekspansywnych', () => {
    expect(ind('species').explain!({ species: sp('Salix arenaria', 'Salix repens subsp. arenaria', 'Ammophila arenaria') }, ctx())).toBe(
      'Gatunków typowych z tab. 1 na liście: 2 z 8.',
    )
    expect(ind('species').warn!({ species: sp('Ammophila arenaria') }, ctx())).toMatch(/nie ma wierzby piaskowej/)
    expect(ind('species').warn!({ species: sp('Salix arenaria', 'Rosa rugosa') }, ctx())).toMatch(/gatunki ekspansywne: Rosa rugosa/)
    expect(ind('species').warn!({ species: sp('Salix arenaria', 'Carex arenaria'), choice: 'most' }, ctx())).toBeNull()
  })

  it('ekspansywne: ostrzega przy gatunku spoza listy i przy „Brak” bez wyjaśnienia', () => {
    expect(ind('expansive').warn!({ species: sp('Carex arenaria') }, ctx())).toMatch(/spoza listy/)
    expect(ind('expansive').warn!({ species: sp('Pinus sylvestris'), choice: 'none' }, ctx())).toMatch(/dopisz w opisie/)
    expect(ind('expansive').warn!({ species: sp('Pinus sylvestris'), choice: 'none', note: 'stare sosny' }, ctx())).toBeNull()
    expect(ind('expansive').explain!({ species: sp('Rosa rugosa') }, ctx())).toMatch(/Róża pomarszczona/)
  })
})

describe('gatunki 2170', () => {
  it('synonimy wierzby piaskowej i literówka „Salix acutiformis”', () => {
    expect(isWillow2170('Salix repens subsp. arenaria')).toBe(true)
    expect(isWillow2170('salix  arenaria')).toBe(true)
    expect(findSpecies2170('Salix acutiformis')?.latin).toBe('Salix acutifolia')
    expect(isExpansive2170('Salix acutiformis')).toBe(true)
    expect(isCharacteristic2170('Lathyrus japonicus subsp. maritimus')).toBe(true)
    expect(isCharacteristic2170('Leymus arenarius')).toBe(false)
  })

  it('pięć gatunków ekspansywnych z tab. 1, krzewy w warstwie B', () => {
    for (const n of ['Rosa rugosa', 'Pinus sylvestris', 'Salix daphnoides', 'Salix acutifolia', 'Populus tremula']) expect(isExpansive2170(n), n).toBe(true)
    expect(defaultLayer2170(findSpecies2170('Salix arenaria')!)).toBe('B')
    expect(defaultLayer2170(findSpecies2170('Carex arenaria')!)).toBe('C')
  })
})

describe('przykład z przewodnika: Helskie Wydmy 1, 15.09.2010', () => {
  const v = helskieWydmy1
  const grades = Object.fromEntries(Object.entries(v.indicators).map(([k, x]) => [k, x.grade]))

  it('oceny wskaźników jak w karcie', () => {
    expect(grades).toEqual({ area: 'U1', species: 'FV', expansive: 'FV', height: 'FV', regeneration: 'U2', clump: 'U1', health: 'FV' })
    expect(v.prospects.grade).toBe('U1')
  })

  it('podpowiedzi formularza zgadzają się z ocenami z karty', () => {
    for (const i of m.indicators) expect(i.suggest!(v.indicators[i.id].inputs, ctx({ site: v.site })), i.id).toBe(v.indicators[i.id].grade)
  })

  it('wartości jak w karcie', () => {
    for (const i of m.indicators) expect(i.describe!(v.indicators[i.id].inputs, ctx()), i.id).toBe(v.indicators[i.id].value)
  })

  it('powierzchnia U1, perspektywy U1, ocena ogólna U1 – jak w karcie; struktura wg reguły kardynalnych U1', () => {
    const a = assessCard(m, v)
    expect(a.area).toBe('U1')
    expect(a.prospects).toBe('U1')
    expect(a.overall).toBe('U1')
    // Karta z przewodnika ma FV, choć kardynalna „Powierzchnia kępy” = U1 – sprzeczne z regułą tab. 2 (patrz specyfikacja).
    expect(a.structure).toBe('U1')
    expect(a.missing).toEqual([])
  })

  it('wykonawca zanonimizowany, jeden przykład', () => {
    expect(v.site.observer).toBe('Jan Kowalski')
    expect(examples2170.map((e) => e.label)).toEqual(['Helskie Wydmy 1'])
  })
})
