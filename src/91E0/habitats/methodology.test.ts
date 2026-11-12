import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import type { Grade, InputValues } from '../../7120/habitats/types'
import { parseReleve, tomasowkaGorna } from './examples'
import { dateWarning91E0, methodology91E0 as m } from './methodology'
import { findSpecies91E0, isMountainAlder, SUBTYPES_91E0, typicalMatch } from './species'

const ind = (id: string) => {
  const i = m.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id}`)
  return i
}
const ctx = (subtype = '91E0-3') => ({ site: { subtype } })
const suggest = (id: string, inputs: InputValues, subtype?: string): Grade | null => ind(id).suggest!(inputs, ctx(subtype))
const sp = (...rows: [string, number?][]) => ({ species: rows.map(([name, cover]) => ({ name, cover })) })

describe('metodyka 91E0 – struktura', () => {
  it('siedlisko priorytetowe: *91E0', () => {
    expect(habitatCode(m)).toBe('*91E0')
  })

  it('wskaźniki w kolejności z karty obserwacji', () => {
    expect(m.indicators.map((i) => i.id)).toEqual([
      'area',
      'characteristic',
      'dominant',
      'geoAlien',
      'invasive',
      'expansive',
      'deadWood',
      'largeDeadWood',
      'river',
      'water',
      'age',
      'vertical',
      'regeneration',
      'logging',
      'otherDistortions',
      'keySpecies',
    ])
  })

  it('kardynalne wg przewodnika i modyfikacji 2012: grube martwe drewno zamiast łącznych zasobów', () => {
    const cardinal = m.indicators.filter((i) => isCardinal(i, { subtype: '91E0-3' })).map((i) => i.id)
    expect(cardinal).toEqual(['characteristic', 'dominant', 'invasive', 'largeDeadWood', 'water'])
  })

  it('modyfikacja 2015: w 91E0-6 i 91E0-7 martwe drewno i wiek nie liczą się do oceny', () => {
    const excluded = (s: string) => m.indicators.filter((i) => isExcluded(i, { subtype: s })).map((i) => i.id)
    expect(excluded('91E0-6')).toEqual(['deadWood', 'largeDeadWood', 'age'])
    expect(excluded('91E0-7')).toEqual(['deadWood', 'largeDeadWood', 'age'])
    for (const s of ['91E0-1', '91E0-3', '91E0-5', '91E0-8', '']) expect(excluded(s)).toEqual([])
    expect(isMountainAlder({ subtype: '91E0-6' })).toBe(true)
  })

  it('podtyp jest wymaganym selectem z 8 podtypami; transekt 200x10 m, zdjęcia 3 × 100 m²', () => {
    const f = m.siteFields.find((x) => x.name === 'subtype')
    expect(f).toMatchObject({ kind: 'select', required: true })
    expect(f && 'options' in f ? f.options.map((o) => o.value) : []).toEqual(Object.keys(SUBTYPES_91E0))
    expect(m.siteFields.find((x) => x.name === 'transect')?.defaultValue).toBe('200x10 m')
    expect(m.releves.fields.find((x) => x.name === 'area')?.defaultValue).toBe(100)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('termin: połowa maja – wrzesień, październik tylko dla górskich olszynek', () => {
    expect(dateWarning91E0('2008-07-22')).toBeNull()
    expect(dateWarning91E0('2008-05-15')).toBeNull()
    expect(dateWarning91E0('2008-05-10')).toMatch(/poza optymalnym/)
    expect(dateWarning91E0('2008-10-10')).toMatch(/górskich olszynek/)
    expect(dateWarning91E0('2008-11-02')).toMatch(/poza optymalnym/)
  })
})

describe('gatunki', () => {
  it('synonimy z kart są rozpoznawane', () => {
    expect(findSpecies91E0('Lamiastrum galeobdolon')?.latin).toBe('Galeobdolon luteum')
    expect(findSpecies91E0('jesion wyniosły')?.latin).toBe('Fraxinus excelsior')
    expect(findSpecies91E0('Impatiens parviflora')?.group).toBe('invasive')
    expect(findSpecies91E0('Fraxinus pennsylvanica')?.group).toBe('tree-geo-alien')
  })

  it('gatunki typowe liczone dla podtypu', () => {
    const r = typicalMatch(sp(['Fraxinus excelsior'], ['Urtica dioica'], ['Picea abies']).species, '91E0-5')
    expect(r.present).toEqual(['Fraxinus excelsior', 'Urtica dioica'])
    expect(r.total).toBe(19)
  })

  it('parseReleve rozbija zapis z karty na warstwy i skalę B-B', () => {
    expect(parseReleve('a: Acer pseudoplatanus 2, Fraxinus excelsior 3; c: Picea abies r, Urtica dioica +')).toEqual([
      { layer: 'A', name: 'Acer pseudoplatanus', abundance: '2' },
      { layer: 'A', name: 'Fraxinus excelsior', abundance: '3' },
      { layer: 'C', name: 'Picea abies', abundance: 'r' },
      { layer: 'C', name: 'Urtica dioica', abundance: '+' },
    ])
  })
})

describe('podpowiedzi ocen wg tab. 2', () => {
  it('martwe drewno łączne: >20 FV, 10–20 U1, <10 U2; dawna metoda 3/10% gdy brak klasy', () => {
    expect(suggest('deadWood', { m3PerHa: 21 })).toBe('FV')
    expect(suggest('deadWood', { m3PerHa: 20 })).toBe('U1')
    expect(suggest('deadWood', { m3PerHa: 10 })).toBe('U1')
    expect(suggest('deadWood', { m3PerHa: 9.9 })).toBe('U2')
    expect(suggest('deadWood', { choice: 'high' })).toBe('FV')
    expect(suggest('deadWood', { share: 11 })).toBe('FV')
    expect(suggest('deadWood', { share: 5 })).toBe('U1')
    expect(suggest('deadWood', { share: 2 })).toBe('U2')
    expect(suggest('deadWood', {})).toBeNull()
    expect(ind('deadWood').warn!({ choice: 'high', m3PerHa: 12 }, ctx())).toMatch(/10–20 m³\/ha/)
  })

  it('grube martwe drewno: >5 FV, 3–5 U1, <3 U2; próg 30 cm w opisie', () => {
    expect(suggest('largeDeadWood', { perHa: 6 })).toBe('FV')
    expect(suggest('largeDeadWood', { perHa: 5 })).toBe('U1')
    expect(suggest('largeDeadWood', { perHa: 3 })).toBe('U1')
    expect(suggest('largeDeadWood', { perHa: 2 })).toBe('U2')
    expect(suggest('largeDeadWood', { choice: 'few' })).toBe('U2')
    expect(ind('largeDeadWood').describe!({ perHa: 4, diameter: '30' }, ctx())).toBe('Ok. 4 szt./ha (próg grubości 30 cm)')
  })

  it('inwazyjne: brak lub 1 gatunek ≤1% FV, więcej albo liczny U1, facjalna dominacja (≥25%) U2', () => {
    expect(suggest('invasive', sp())).toBe('FV')
    expect(suggest('invasive', sp(['Impatiens parviflora', 0.5]))).toBe('FV')
    expect(suggest('invasive', sp(['Impatiens parviflora', 5]))).toBe('U1')
    expect(suggest('invasive', sp(['Impatiens parviflora', 0.5], ['Bidens frondosa', 0.5]))).toBe('U1')
    expect(suggest('invasive', sp(['Impatiens glandulifera', 30]))).toBe('U2')
    expect(suggest('invasive', sp(['Impatiens parviflora']))).toBeNull()
  })

  it('obce geograficznie: <1% FV, <10% U1, ≥10% albo odnawianie U2; wskaźnik pomocniczy', () => {
    expect(suggest('geoAlien', sp())).toBe('FV')
    expect(suggest('geoAlien', sp(['Fraxinus pennsylvanica', 5]))).toBe('U1')
    expect(suggest('geoAlien', { ...sp(['Fraxinus pennsylvanica', 0.5]), regenerating: 'yes' })).toBe('U2')
    expect(isCardinal(ind('geoAlien'), {})).toBe(false)
  })

  it('ekspansywne i koryto mają opcję XX', () => {
    expect(suggest('expansive', { choice: 'unknown' })).toBe('XX')
    expect(suggest('river', { choice: 'na' })).toBe('XX')
    expect(suggest('water', { choice: 'none' })).toBe('U2')
  })

  it('gatunki charakterystyczne: podpowiedź z selecta, wyjaśnienie liczy gatunki typowe podtypu', () => {
    expect(suggest('characteristic', { choice: 'impoverished' })).toBe('U1')
    expect(ind('characteristic').explain!(sp(['Alnus glutinosa'], ['Cardamine amara']), ctx('91E0-8'))).toMatch(/2 z 4/)
    expect(ind('characteristic').explain!(sp(['Alnus glutinosa']), { site: {} })).toMatch(/Wybierz podtyp/)
  })
})

describe('przykład Tomasówka Górna (przewodnik, 22.07.2008)', () => {
  it('podpowiedzi zgadzają się z ocenami z karty (poza „Inne zniekształcenia”: w karcie „Brak” z oceną U1)', () => {
    for (const i of m.indicators) {
      const v = tomasowkaGorna.indicators[i.id]
      expect(v, i.id).toBeDefined()
      if (i.id === 'otherDistortions') continue
      expect(i.suggest!(v.inputs, { site: tomasowkaGorna.site }), i.id).toBe(v.grade)
    }
  })

  it('wynik: powierzchnia U1, struktura U1, perspektywy FV, ogólna U1', () => {
    const a = assessCard(m, tomasowkaGorna)
    expect(a).toMatchObject({ area: 'U1', structure: 'U1', prospects: 'FV', overall: 'U1', missing: [] })
  })

  it('jako górska olszyna (91E0-6) grube martwe drewno U2 przestaje psuć strukturę', () => {
    const bad = {
      ...tomasowkaGorna,
      indicators: { ...tomasowkaGorna.indicators, largeDeadWood: { inputs: {}, value: '', grade: 'U2' as const } },
    }
    expect(assessCard(m, bad).structure).toBe('U2')
    expect(assessCard(m, { ...bad, site: { ...bad.site, subtype: '91E0-6' } }).structure).toBe('U1')
  })

  it('3 zdjęcia fitosocjologiczne z karty, koordynator z przewodnika', () => {
    expect(tomasowkaGorna.releves).toHaveLength(3)
    expect((tomasowkaGorna.releves[0].species as unknown[]).length).toBeGreaterThan(30)
    expect(tomasowkaGorna.site.observer).toBe('Jan Kowalski')
  })
})
