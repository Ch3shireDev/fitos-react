import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { CardValues, Grade, IndicatorContext, InputValues } from '../../7120/habitats/types'
import { examples4010, gniewoszyce } from './examples'
import {
  gradeAliens4010,
  gradeErica4010,
  gradeExpansive4010,
  gradeTrees4010,
  indicator4010 as ind,
  methodology4010 as m,
  roundToTens,
} from './methodology'
import { SPECIES_4010, defaultLayer4010, findSpecies4010, isExpansive4010, isKey4010, isTree4010 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues, c = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const sp = (...names: string[]) => names.map((name) => ({ name }))
const spc = (...rows: [string, number][]) => rows.map(([name, cover]) => ({ name, cover }))

describe('metodyka 4010 – struktura', () => {
  it('kod 4010 (nie priorytetowe), 3 zdjęcia po 100 m², powierzchnia w ha, transekt 200×10 m', () => {
    expect(habitatCode(m)).toBe('4010')
    expect(m.name).toBe('Wilgotne wrzosowiska z wrzoścem bagiennym Erica tetralix')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(100)
    expect(m.siteFields.find((f) => f.name === 'areaHa')).toMatchObject({ unit: 'ha', required: true })
    expect(m.siteFields.find((f) => f.name === 'transect')?.defaultValue).toBe('200x10 m')
    expect(m.siteFields.find((f) => f.name === 'communities')?.defaultValue).toBe('Ericetum tetralicis')
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności tab. 1', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Pokrycie wrzośca bagiennego Erica tetralix',
      'Zarośnięcie przez drzewa',
      'Uwilgotnienie',
      'Gatunki obce geograficznie',
      'Ekspansywne gatunki rodzime (apofity)',
      'Stan kluczowych dla różnorodności biologicznej gatunków lokalnie typowych dla siedliska',
      'Inne zniekształcenia (rozjeżdżenie, wydeptanie, zaśmiecenie)',
    ])
  })

  it('kardynalne: wrzosiec, drzewa, uwilgotnienie, gatunki obce (lista pod tab. 2); nic pominiętego', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['erica', 'trees', 'moisture', 'aliens'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
    expect(m.structureRule).toBeUndefined()
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...m.otherFields, ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: lipiec – wrzesień, poza tym ostrzeżenie', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    for (const d of ['2011-09-14', '2021-07-01', '2021-09-30']) expect(date.warn!(d), d).toBeNull()
    for (const d of ['2021-06-30', '2021-10-01', '2016-05-12']) expect(date.warn!(d), d).toMatch(/poza optymalnym/)
  })

  it('kody oddziaływań bez duplikatów, z zalesianiem, osuszaniem, sukcesją i suszą', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['B01', 'B02', 'C01.03', 'J02.01', 'K02', 'K02.01', 'M01.02', 'I01', 'I02', 'X']) expect(codes).toContain(c)
  })

  it('udział FV/U1/U2 dla całego stanowiska w „Innych informacjach”, przed uwagami', () => {
    expect(m.otherFields.map((f) => f.name)).toEqual(['otherValues', 'conservation', 'shareFV', 'shareU1', 'shareU2', 'notes', 'photos'])
  })
})

describe('metodyka 4010 – progi', () => {
  it('wrzosiec: zaokrąglenie do dziesiątek, potem >50% FV, 30–50% U1, <30% U2', () => {
    expect([0, 4, 5, 24, 25, 34, 50, 54, 55, 60, 100].map(roundToTens)).toEqual([0, 0, 10, 20, 30, 30, 50, 50, 60, 60, 100])
    expect([0, 10, 24, 25, 30, 50, 54, 55, 70].map(gradeErica4010)).toEqual(['U2', 'U2', 'U2', 'U1', 'U1', 'U1', 'U1', 'FV', 'FV'])
    expect(suggest('erica', { cover: 30 })).toBe('U1')
    expect(suggest('erica', {})).toBeNull()
    expect(ind('erica').explain!({ cover: 54 }, ctx())).toBe('Pokrycie wrzośca 54%, po zaokrągleniu do dziesiątek 50%.')
    expect(ind('erica').explain!({ cover: 30 }, ctx())).toBe('Pokrycie wrzośca 30% transektu.')
    expect(ind('erica').describe!({ cover: 20 }, ctx())).toBe('20% pokrycia na transekcie')
  })

  it('drzewa: <10% FV, 10–30% U1, >30% U2; lista tylko informacyjnie, z ostrzeżeniami', () => {
    expect([0, 9.9, 10, 30, 30.5, 80].map(gradeTrees4010)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
    expect(suggest('trees', { cover: 15, species: spc(['Pinus sylvestris', 60]) })).toBe('U1')
    expect(suggest('trees', { species: spc(['Pinus sylvestris', 60]) })).toBeNull()
    expect(ind('trees').warn!({ cover: 20, species: sp('Erica tetralix') }, ctx())).toMatch(/niedrzewiaste: Erica tetralix/)
    expect(ind('trees').warn!({ cover: 20, species: spc(['Pinus sylvestris', 30]) }, ctx())).toMatch(/większa niż łączne/)
    expect(ind('trees').warn!({ cover: 40, species: spc(['Pinus sylvestris', 30], ['Betula pendula', 10]) }, ctx())).toBeNull()
    expect(ind('trees').describe!({ cover: 40, species: spc(['Pinus sylvestris', 30]) }, ctx())).toBe('40%; Pinus sylvestris 30%')
    expect(ind('trees').explain!({ cover: 40, species: spc(['Pinus sylvestris', 30]) }, ctx())).toMatch(/40% transektu; suma z listy gatunków 30%/)
  })

  it('uwilgotnienie: z wyboru (susza bez przyczyn antropogenicznych FV); czynne rowy przy FV – ostrzeżenie', () => {
    expect(['natural', 'weather', 'weak', 'strong'].map((choice) => suggest('moisture', { choice }))).toEqual(['FV', 'FV', 'U1', 'U2'])
    expect(ind('moisture').warn!({ choice: 'natural', ditches: 'yes' }, ctx())).toMatch(/czynne rowy/)
    expect(ind('moisture').warn!({ choice: 'natural', ditches: 'blocked' }, ctx())).toBeNull()
    expect(ind('moisture').warn!({ choice: 'strong', ditches: 'yes' }, ctx())).toBeNull()
    expect(ind('moisture').describe!({ choice: 'weak' }, ctx())).toBe('Słabe antropogeniczne przesuszenie')
  })

  it('obce: brak FV; do 10% U1; >10% U2; lista > wybór; ostrzeżenia', () => {
    expect(gradeAliens4010(0, 0)).toBe('FV')
    expect(gradeAliens4010(1, 0.5)).toBe('U1')
    expect(gradeAliens4010(2, 10)).toBe('U1')
    expect(gradeAliens4010(1, 10.5)).toBe('U2')
    expect(suggest('aliens', { species: spc(['Campylopus introflexus', 1]), choice: 'many' })).toBe('U1')
    expect(suggest('aliens', { species: sp('Solidago canadensis'), choice: 'few' })).toBe('U1')
    expect(suggest('aliens', { species: [], choice: 'none' })).toBe('FV')
    expect(suggest('aliens', {})).toBeNull()
    const w = (i: InputValues) => ind('aliens').warn!(i, ctx())
    expect(w({ species: sp('Solidago canadensis'), choice: 'none' })).toMatch(/„Brak”/)
    expect(w({ species: sp('Molinia caerulea') })).toMatch(/rodzime: Molinia caerulea/)
    expect(w({ species: spc(['Solidago canadensis', 20]), choice: 'few' })).toMatch(/to U2, a wybrano U1/)
    expect(ind('aliens').describe!({ species: [], choice: 'none' }, ctx())).toBe('Brak')
    expect(ind('aliens').describe!({ species: spc(['Solidago canadensis', 1]) }, ctx())).toBe('Solidago canadensis 1%')
  })

  it('ekspansywne: ślad <1% FV (praktyka 2011), 1–10% U1, >10% U2; trzęślica w katalogu', () => {
    expect([0, 0.5, 0.9, 1, 10, 11, 60].map((t) => gradeExpansive4010(t === 0 ? 0 : 1, t))).toEqual(['FV', 'FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
    expect(suggest('expansive', { species: spc(['Rubus sp.', 0.5]) })).toBe('FV')
    expect(suggest('expansive', { species: spc(['Molinia caerulea', 55]) })).toBe('U2')
    expect(suggest('expansive', { species: spc(['Molinia caerulea', 5], ['Phragmites australis', 3]) })).toBe('U1')
    expect(suggest('expansive', { choice: 'few' })).toBe('U1')
    for (const n of ['Molinia caerulea', 'Phragmites australis', 'Lysimachia vulgaris', 'Rubus sp.']) expect(isExpansive4010(n), n).toBe(true)
    expect(ind('expansive').warn!({ species: sp('Calluna vulgaris') }, ctx())).toMatch(/Spoza katalogu.*Calluna vulgaris/)
    expect(ind('expansive').explain!({ species: spc(['Rubus sp.', 0.5]) }, ctx())).toMatch(/ślad/)
  })

  it('kluczowe gatunki: z wyboru, „Brak danych” = XX; inne zniekształcenia i powierzchnia z wyboru', () => {
    expect(['allFv', 'someU1', 'someU2', 'noData'].map((choice) => suggest('keySpecies', { choice }))).toEqual(['FV', 'U1', 'U2', 'XX'])
    expect(ind('keySpecies').describe!({ choice: 'noData' }, ctx())).toBe('Brak danych')
    expect(ind('keySpecies').describe!({ choice: 'allFv', species: sp('Drosera intermedia') }, ctx())).toBe('Drosera intermedia')
    expect(['none', 'minor', 'strong'].map((choice) => suggest('otherDamage', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(['stable', 'slow', 'fast', 'unknown'].map((choice) => suggest('area', { choice }))).toEqual(['FV', 'U1', 'U2', 'XX'])
    expect(ind('area').describe!({ choice: 'slow', areaHa: 0.6 }, ctx())).toMatch(/^0,6 ha; Wykazuje powolny/)
  })

  it('katalog: bez duplikatów, warstwy, etykiety', () => {
    const names = SPECIES_4010.map((s) => s.latin)
    expect(new Set(names).size).toBe(names.length)
    expect(defaultLayer4010(findSpecies4010('Sphagnum compactum')!)).toBe('D')
    expect(defaultLayer4010(findSpecies4010('Pinus sylvestris')!)).toBe('B')
    expect(defaultLayer4010(findSpecies4010('Erica tetralix')!)).toBe('C')
    expect(defaultLayer4010(findSpecies4010('Campylopus introflexus')!)).toBe('D')
    expect(isTree4010('Frangula alnus')).toBe(true)
    expect(isKey4010('Drosera intermedia')).toBe(true)
    expect(m.speciesInfo!('Erica tetralix')).toBe('krzewinka, gatunek atlantycki')
    expect(m.speciesInfo!('Molinia caerulea')).toBe('roślina zielna, ekspansywny (apofit)')
    expect(m.speciesInfo!('Sphagnum molle')).toBe('mszak, gatunek atlantycki, kluczowy, lokalnie typowy')
    // wszystkie gatunki z przykładu są w katalogu
    for (const r of gniewoszyce.releves) for (const s of r.species as { name: string }[]) expect(findSpecies4010(s.name), s.name).toBeTruthy()
  })
})

describe('ocena struktury (4 kardynalne z 7) – reguła ogólna tab. 2', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(gniewoszyce)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    v.prospects.grade = 'FV'
    return v
  }

  it('wszystko FV → FV; fakultatywny XX nie psuje oceny', () => {
    const v = allFv()
    expect(assessCard(m, v)).toMatchObject({ structure: 'FV', overall: 'FV' })
    v.indicators.keySpecies.grade = 'XX'
    expect(assessCard(m, v).structure).toBe('FV')
  })

  it('pomocniczy U1 (apofity) → FV; pomocniczy U2 → U1', () => {
    const v = allFv()
    v.indicators.expansive.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('FV')
    v.indicators.otherDamage.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
  })

  it('kardynalny U1 (uwilgotnienie) → U1; kardynalny U2 (obce) → U2 i ocena ogólna U2', () => {
    const v = allFv()
    v.indicators.moisture.grade = 'U1'
    expect(assessCard(m, v)).toMatchObject({ structure: 'U1', overall: 'U1' })
    v.indicators.aliens.grade = 'U2'
    expect(assessCard(m, v)).toMatchObject({ structure: 'U2', overall: 'U2' })
  })
})

describe('przykład Gniewoszyce (karta z przewodnika, 2011)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(gniewoszyce)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny jak w karcie: powierzchnia U2, struktura U2, perspektywy U2, ogólna U2', () => {
    expect(assessCard(m, gniewoszyce)).toMatchObject({ area: 'U2', structure: 'U2', prospects: 'U2', overall: 'U2', missing: [] })
    expect(Object.fromEntries(Object.entries(gniewoszyce.indicators).map(([id, v]) => [id, v.grade]))).toEqual({
      area: 'U2',
      erica: 'U2',
      trees: 'U2',
      moisture: 'U2',
      aliens: 'FV',
      expansive: 'FV',
      keySpecies: 'XX',
      otherDamage: 'FV',
    })
  })

  it('podpowiedzi zgodne z ekspertem', () => {
    const c = ctx({ site: gniewoszyce.site, indicators: gniewoszyce.indicators })
    for (const i of m.indicators) expect(i.suggest!(gniewoszyce.indicators[i.id].inputs, c), i.id).toBe(gniewoszyce.indicators[i.id].grade)
  })

  it('pole „wartość” = opis wygenerowany z pomiarów (teksty z karty)', () => {
    const c = ctx({ site: gniewoszyce.site, indicators: gniewoszyce.indicators })
    for (const i of m.indicators) expect(i.describe!(gniewoszyce.indicators[i.id].inputs, c), i.id).toBe(gniewoszyce.indicators[i.id].value)
  })

  it('zdjęcia jak w karcie: 3 × 25 m², zwarcia B/C, gatunki', () => {
    expect(gniewoszyce.releves.map((r) => [r.area, r.altitude, r.coverB, r.coverC, r.heightB])).toEqual([
      [25, 188, 10, 95, 2],
      [25, 198, 45, 90, 3],
      [25, 191, 25, 90, 3],
    ])
    expect(gniewoszyce.releves.map((r) => (r.species as unknown[]).length)).toEqual([14, 12, 16])
  })

  it('oddziaływania przepisane na listę 2011, zanonimizowany wykonawca, jeden przykład', () => {
    expect(gniewoszyce.impacts.map((x) => [x.code, x.intensity, x.influence])).toEqual([
      ['B02', 'H', '-'],
      ['K02', 'M', '-'],
    ])
    for (const x of gniewoszyce.impacts) expect(m.impactCodes.map((c) => c.code)).toContain(x.code)
    expect(examples4010).toHaveLength(1)
    expect(gniewoszyce.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(gniewoszyce)).not.toMatch(/Kiaszewicz/)
  })
})
