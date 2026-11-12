import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { Grade, InputValues } from '../../7120/habitats/types'
import { examples91P0, staryLipowiec } from './examples'
import { methodology91P0 as m } from './methodology'
import { TYPICAL_91P0, findSpecies91P0, typicalMatch } from './species'

const ind = (id: string) => {
  const i = m.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id}`)
  return i
}
const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, { site: {} })
const sp = (...rows: [string, number?][]) => ({ species: rows.map(([name, cover]) => ({ name, cover })) })

describe('metodyka 91P0 – struktura', () => {
  it('kod bez gwiazdki (siedlisko nie jest priorytetowe)', () => {
    expect(habitatCode(m)).toBe('91P0')
    expect(m.name).toMatch(/^Jodłowy bór świętokrzyski/)
  })

  it('wskaźniki w kolejności tab. 2 przewodnika', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Charakterystyczna kombinacja florystyczna',
      'Obce gatunki inwazyjne',
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Obecność martwego drewna',
      'Wiek drzewostanu',
      'Gatunki obce w drzewostanie',
      'Naturalne odnowienia jodły',
      'Naturalne odnowienia buka',
      'Obecność nasadzeń drzew',
      'Zniszczenia runa i gleby związane z pozyskaniem drewna',
      'Zniszczenia drzewostanów, np. na skutek wiatrołomów lub gradacji owadów',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
  })

  it('4 wskaźniki kardynalne: kombinacja, ekspansywne, martwe drewno, odnowienie jodły', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual([
      'typical',
      'expansive',
      'deadWood',
      'firRegeneration',
    ])
  })

  it('zdjęcia fitosocjologiczne 3 × 100 m²', () => {
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(100)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('każde pole i wskaźnik ma wyjaśnienie dłuższe niż 60 znaków', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...m.otherFields, ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(60)
    for (const i of m.indicators) expect(i.help?.length ?? 0, i.id).toBeGreaterThan(60)
  })

  it('termin: ostrzeżenie poza lipcem i sierpniem', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2021-07-15')).toBeNull()
    expect(date.warn!('2021-08-31')).toBeNull()
    expect(date.warn!('2021-10-02')).toMatch(/lipca i sierpnia/)
  })
})

describe('metodyka 91P0 – progi tab. 2', () => {
  it('obce gatunki inwazyjne: ≤1% FV, 1–5% U1, >5% U2', () => {
    expect(suggest('invasive', sp())).toBe('FV')
    expect(suggest('invasive', sp(['Impatiens parviflora', 1]))).toBe('FV')
    expect(suggest('invasive', sp(['Impatiens parviflora', 3], ['Padus serotina', 2]))).toBe('U1')
    expect(suggest('invasive', sp(['Padus serotina', 6]))).toBe('U2')
  })

  it('rodzime ekspansywne: <25% FV, 25–50% U1, >50% U2', () => {
    expect(suggest('expansive', sp())).toBe('FV')
    expect(suggest('expansive', sp(['Rubus hirtus', 20]))).toBe('FV')
    expect(suggest('expansive', sp(['Rubus hirtus', 20], ['Rubus idaeus', 10]))).toBe('U1')
    expect(suggest('expansive', sp(['Calamagrostis villosa', 60]))).toBe('U2')
  })

  it('martwe drewno w % zasobności: >10 FV, 3–10 U1, <3 U2; same gałęzie to U2', () => {
    expect(suggest('deadWood', { share: 12, wholeTrees: 'yes' })).toBe('FV')
    expect(suggest('deadWood', { share: 5, wholeTrees: 'yes' })).toBe('U1')
    expect(suggest('deadWood', { share: 2, wholeTrees: 'yes' })).toBe('U2')
    expect(suggest('deadWood', { share: 12, wholeTrees: 'no' })).toBe('U2')
    expect(suggest('deadWood', { choice: 'mid' })).toBe('U1')
  })

  it('wiek drzewostanu: ocena z klasy, liczby (>20% ponad 100 lat, >50% ponad 50 lat) sprawdzają zgodność', () => {
    expect(suggest('age', { choice: 'old' })).toBe('FV')
    expect(suggest('age', { choice: 'mid' })).toBe('U1')
    expect(suggest('age', { choice: 'young' })).toBe('U2')
    expect(ind('age').warn!({ choice: 'old', share100: 10, share50: 40 })).toMatch(/Poniżej 20%/)
    expect(ind('age').warn!({ choice: 'old', share100: 25 })).toBeNull()
  })

  it('gatunki obce w drzewostanie: brak FV, do 10% U1, >10% U2', () => {
    expect(suggest('alienTrees', sp())).toBe('FV')
    expect(suggest('alienTrees', sp(['Quercus rubra', 5]))).toBe('U1')
    expect(suggest('alienTrees', sp(['Quercus rubra', 8], ['Larix decidua', 5]))).toBe('U2')
  })

  it('odnowienie jodły: >5% FV, do 5% U1, brak U2', () => {
    expect(suggest('firRegeneration', sp(['Abies alba', 15]))).toBe('FV')
    expect(suggest('firRegeneration', sp(['Abies alba', 3]))).toBe('U1')
    expect(suggest('firRegeneration', sp())).toBe('U2')
  })

  it('odnowienie buka (zmiana z 2021): <25% i brak FV, 25–50% U1, >50% U2', () => {
    expect(suggest('beechRegeneration', sp())).toBe('FV')
    expect(suggest('beechRegeneration', sp(['Fagus sylvatica', 10]))).toBe('FV')
    expect(suggest('beechRegeneration', sp(['Fagus sylvatica', 30]))).toBe('U1')
    expect(suggest('beechRegeneration', sp(['Fagus sylvatica', 70]))).toBe('U2')
  })

  it('zniszczenia drzewostanu: <3% FV, 3–5% U1, >5% U2', () => {
    expect(suggest('standDamage', { share: 1 })).toBe('FV')
    expect(suggest('standDamage', { share: 4 })).toBe('U1')
    expect(suggest('standDamage', { share: 8 })).toBe('U2')
    expect(suggest('standDamage', { choice: 'none' })).toBe('FV')
  })

  it('pozyskanie i nasadzenia z wyboru opisu', () => {
    expect(suggest('logging', { choice: 'few' })).toBe('U1')
    expect(suggest('plantings', { choice: 'many' })).toBe('U2')
  })

  it('kombinacja florystyczna: ocena z wyboru, ostrzeżenie bez jodły i przy gatunkach grądowych', () => {
    const t = ind('typical')
    expect(suggest('typical', { choice: 'reduced' })).toBe('U1')
    expect(t.warn!({ choice: 'typical', ...sp(['Vaccinium myrtillus', 40]) })).toMatch(/jodł/)
    expect(t.warn!({ choice: 'typical', ...sp(['Abies alba', 60], ['Asarum europaeum', 5]) })).toMatch(/9170/)
    expect(t.explain!(sp(['Abies alba', 60], ['Oxalis acetosella', 10]))).toMatch(new RegExp(`2 z ${TYPICAL_91P0.length}`))
  })
})

describe('katalog gatunków 91P0', () => {
  it('rozpoznaje synonimy z karty i dopisek „sp.”', () => {
    expect(findSpecies91P0('Majanthemum bifolium')?.latin).toBe('Maianthemum bifolium')
    expect(findSpecies91P0('Solidago serotina')?.group).toBe('invasive')
    expect(findSpecies91P0('Rubus sp.')?.group).toBe('expansive')
    expect(typicalMatch(sp(['Abies alba', 1]).species).hasFir).toBe(true)
  })
})

describe('przykład Stary Lipowiec (karta z przewodnika)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(staryLipowiec)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny parametrów jak w karcie: powierzchnia FV, struktura U2, perspektywy XX, ogólna U2', () => {
    const a = assessCard(m, staryLipowiec)
    expect(a.area).toBe('FV')
    expect(a.structure).toBe('U2')
    expect(a.overall).toBe('U2')
  })

  it('podpowiedzi zgodne z kartą poza buk (zmiana z 2021) i inwazyjnymi (ocena eksperta)', () => {
    const differs = m.indicators
      .filter((i) => i.suggest!(staryLipowiec.indicators[i.id].inputs, { site: staryLipowiec.site }) !== staryLipowiec.indicators[i.id].grade)
      .map((i) => i.id)
    expect(differs).toEqual(['invasive', 'beechRegeneration'])
  })

  it('zanonimizowany wykonawca, trzy zdjęcia fitosocjologiczne', () => {
    expect(examples91P0).toHaveLength(1)
    expect(staryLipowiec.site.observer).toBe('Jan Kowalski')
    expect(staryLipowiec.releves).toHaveLength(3)
  })
})
