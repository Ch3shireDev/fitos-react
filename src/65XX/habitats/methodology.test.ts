import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { Grade, InputValues } from '../../7120/habitats/types'
import { examples65XX, wolosate } from './examples'
import { methodology65XX as m } from './methodology'
import { characteristicOf, findSpecies65XX } from './species'

const ind = (id: string) => {
  const i = m.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id}`)
  return i
}
const suggest = (id: string, inputs: InputValues, communities = 'Cirsietum rivularis'): Grade | null =>
  ind(id).suggest!(inputs, { site: { communities } })
const sp = (...rows: [string, number?][]) => ({ species: rows.map(([name, cover]) => ({ name, cover: cover ?? 1 })) })

describe('metodyka 65XX – struktura danych', () => {
  it('kod bez gwiazdki (siedlisko spoza zał. I, nie priorytetowe)', () => {
    expect(habitatCode(m)).toBe('65XX')
    expect(m.name).toMatch(/^Eutroficzne łąki wilgotne/)
  })

  it('wskaźniki w kolejności z karty obserwacji (tab. 2 przewodnika)', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Struktura przestrzenna płatów siedliska',
      'Gatunki charakterystyczne',
      'Gatunki dominujące',
      'Obce gatunki inwazyjne',
      'Gatunki ekspansywne roślin zielnych',
      'Ekspansja krzewów i podrostu drzew',
      'Udział dobrze zachowanych płatów siedliska',
      'Wojłok (martwa materia organiczna)',
      'Melioracje odwadniające',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
  })

  it('kardynalne: gatunki charakterystyczne, ekspansywne i ekspansja krzewów', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['characteristic', 'expansive', 'shrubs'])
  })

  it('zdjęcia fitosocjologiczne: trzy po 25 m² (5×5 m)', () => {
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('termin poza końcem maja–sierpniem daje ostrzeżenie', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2025-07-04')).toBeNull()
    expect(date.warn!('2025-05-25')).toBeNull()
    expect(date.warn!('2025-05-10')).toMatch(/poza optymalnym/)
    expect(date.warn!('2025-09-15')).toMatch(/poza optymalnym/)
  })
})

describe('metodyka 65XX – słownik gatunków', () => {
  it('synonimy prowadzą do tego samego gatunku', () => {
    expect(findSpecies65XX('Bistorta officinalis')?.latin).toBe('Polygonum bistorta')
    expect(findSpecies65XX('Lotus pedunculatus')?.latin).toBe('Lotus uliginosus')
    expect(findSpecies65XX('knieć błotna')?.latin).toBe('Caltha palustris')
  })

  it('gatunki tylko z łąki z ostrożeniem różnolistnym liczą się wyłącznie w tym zespole', () => {
    const rows = sp(['Caltha palustris'], ['Agrostis capillaris'], ['Bistorta officinalis'], ['Polygonum bistorta']).species
    expect(characteristicOf(rows, false)).toEqual({ counted: ['Caltha palustris', 'Bistorta officinalis'], skipped: ['Agrostis capillaris'] })
    expect(characteristicOf(rows, true).counted).toHaveLength(3)
  })
})

describe('metodyka 65XX – progi (tab. 2)', () => {
  it('gatunki charakterystyczne: ≥5 FV, 3–4 U1, <3 U2', () => {
    const five = sp(['Cirsium rivulare', 30], ['Caltha palustris'], ['Geum rivale'], ['Crepis paludosa'], ['Juncus effusus'])
    expect(suggest('characteristic', five)).toBe('FV')
    expect(suggest('characteristic', { species: five.species.slice(0, 4) })).toBe('U1')
    expect(suggest('characteristic', { species: five.species.slice(0, 3) })).toBe('U1')
    expect(suggest('characteristic', { species: five.species.slice(0, 2) })).toBe('U2')
    expect(suggest('characteristic', { species: [] })).toBeNull()
  })

  it('gatunki charakterystyczne: mietlica pospolita podnosi ocenę tylko w Polygono-Cirsietum heterophylli', () => {
    const four = sp(['Cirsium heterophyllum'], ['Polygonum bistorta'], ['Crepis mollis'], ['Agrostis capillaris'])
    expect(suggest('characteristic', four)).toBe('U1')
    expect(suggest('characteristic', four, 'Polygono bistortae-Cirsietum heterophylli')).toBe('U1')
    const five = { species: [...four.species, { name: 'Hypericum maculatum', cover: 1 }] }
    expect(suggest('characteristic', five)).toBe('U1')
    expect(suggest('characteristic', five, 'Polygono bistortae-Cirsietum heterophylli')).toBe('FV')
  })

  it('gatunki dominujące: bez gatunku >50% FV; łąkowy >50% U1; ekspansywny lub obcy >50% U2', () => {
    expect(suggest('dominant', sp(['Cirsium rivulare', 30], ['Trifolium pratense', 20]))).toBe('FV')
    expect(suggest('dominant', sp(['Cirsium rivulare', 60]))).toBe('U1')
    expect(suggest('dominant', sp(['Carex panicea', 55]))).toBe('U1')
    expect(suggest('dominant', sp(['Filipendula ulmaria', 60]))).toBe('U2')
    expect(suggest('dominant', sp(['Solidago gigantea', 70]))).toBe('U2')
    expect(suggest('dominant', sp(['Prunus spinosa', 55]))).toBe('U2')
    expect(suggest('dominant', { species: [] })).toBeNull()
  })

  it('gatunki dominujące: ostrzeżenie, gdy wśród dominantów jest dużo gatunku ekspansywnego', () => {
    expect(ind('dominant').warn!(sp(['Cirsium rivulare', 25], ['Mentha longifolia', 30]))).toMatch(/Mentha longifolia/)
    expect(ind('dominant').warn!(sp(['Cirsium rivulare', 30]))).toBeNull()
  })

  it('obce inwazyjne: brak/pojedyncze słabo inwazyjne FV, słabo inwazyjne <5% lub pojedyncze silnie inwazyjne U1, reszta U2', () => {
    expect(suggest('invasive', { species: [] })).toBe('FV')
    expect(suggest('invasive', sp(['Epilobium ciliatum', 0.5]))).toBe('FV')
    expect(suggest('invasive', sp(['Epilobium ciliatum', 3]))).toBe('U1')
    expect(suggest('invasive', sp(['Solidago gigantea', 0.5]))).toBe('U1')
    expect(suggest('invasive', sp(['Solidago gigantea', 2]))).toBe('U2')
    expect(suggest('invasive', sp(['Epilobium ciliatum', 4], ['Impatiens parviflora', 2]))).toBe('U2')
  })

  it('gatunki ekspansywne: silnie ekspansywne i suma decydują', () => {
    expect(suggest('expansive', { species: [] })).toBe('FV')
    expect(suggest('expansive', sp(['Holcus mollis', 15]))).toBe('FV')
    expect(suggest('expansive', sp(['Filipendula ulmaria', 5]))).toBe('U1')
    expect(suggest('expansive', sp(['Holcus mollis', 25]))).toBe('U1')
    expect(suggest('expansive', sp(['Filipendula ulmaria', 10], ['Mentha longifolia', 10], ['Holcus mollis', 25]))).toBe('U1')
    expect(suggest('expansive', sp(['Filipendula ulmaria', 15]))).toBe('U2')
    expect(suggest('expansive', sp(['Holcus mollis', 30], ['Lythrum salicaria', 25]))).toBe('U2')
  })

  it('ekspansja krzewów: <1% FV, 1–5% U1, >5% U2; łączne pokrycie ma pierwszeństwo przed sumą listy', () => {
    expect(suggest('shrubs', { species: [] })).toBe('FV')
    expect(suggest('shrubs', sp(['Salix cinerea', 0.5]))).toBe('FV')
    expect(suggest('shrubs', sp(['Salix cinerea', 1]))).toBe('U1')
    expect(suggest('shrubs', sp(['Salix cinerea', 3], ['Prunus spinosa', 2]))).toBe('U1')
    expect(suggest('shrubs', sp(['Salix cinerea', 6]))).toBe('U2')
    expect(suggest('shrubs', { ...sp(['Salix cinerea', 2]), total: 8 })).toBe('U2')
  })

  it('udział dobrze zachowanych płatów: ≥80% FV, 50–79% U1, <50% U2', () => {
    expect(suggest('wellPreserved', { share: 85 })).toBe('FV')
    expect(suggest('wellPreserved', { share: 80 })).toBe('FV')
    expect(suggest('wellPreserved', { share: 79 })).toBe('U1')
    expect(suggest('wellPreserved', { share: 50 })).toBe('U1')
    expect(suggest('wellPreserved', { share: 49 })).toBe('U2')
    expect(suggest('wellPreserved', {})).toBeNull()
  })

  it('wojłok: średnia <2 cm FV, 2–5 cm U1, >5 cm U2', () => {
    expect(suggest('litter', { mean: 0.5 })).toBe('FV')
    expect(suggest('litter', { mean: 2 })).toBe('U1')
    expect(suggest('litter', { mean: 5 })).toBe('U1')
    expect(suggest('litter', { mean: 5.5 })).toBe('U2')
    expect(suggest('litter', {})).toBeNull()
    expect(ind('litter').describe!({ min: 0, max: 3, mean: 0.5 })).toBe('0–3 cm; średnio 0,5 cm')
  })

  it('struktura przestrzenna, powierzchnia i melioracje z wyboru opisu', () => {
    expect(suggest('spatial', { choice: 'none' })).toBe('FV')
    expect(suggest('spatial', { choice: 'medium' })).toBe('U1')
    expect(suggest('spatial', { choice: 'large' })).toBe('U2')
    expect(suggest('area', { choice: 'stable' })).toBe('FV')
    expect(suggest('area', { choice: 'slight' })).toBe('U1')
    expect(suggest('area', { choice: 'clear' })).toBe('U2')
    expect(suggest('drainage', { choice: 'none' })).toBe('FV')
    expect(suggest('drainage', { choice: 'weak' })).toBe('U1')
    expect(suggest('drainage', { choice: 'strong' })).toBe('U2')
  })
})

describe('przykład Wołosate (karta z przewodnika)', () => {
  it('jest na liście przykładów, wykonawca zanonimizowany', () => {
    expect(examples65XX.map((e) => e.label)).toEqual(['Wołosate'])
    expect(wolosate.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(wolosate)).not.toMatch(/Korzeniak/)
  })

  it('przechodzi walidację schematu', () => {
    const r = buildCardSchema(m).safeParse(wolosate)
    expect(r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)).toEqual([])
  })

  it('podpowiedzi formularza zgadzają się z ocenami z karty', () => {
    for (const i of m.indicators) {
      const v = wolosate.indicators[i.id]
      expect([i.id, i.suggest?.(v.inputs, { site: wolosate.site }) ?? v.grade]).toEqual([i.id, v.grade])
    }
  })

  it('ocena ogólna FV, jak w karcie; trzy zdjęcia fitosocjologiczne', () => {
    expect(assessCard(m, wolosate)).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV', missing: [] })
    expect(wolosate.releves).toHaveLength(3)
    // karta: „bardzo bogate florystycznie (52–55 gatunków/25 m²)”
    expect(wolosate.releves.map((r) => (r.species as unknown[]).length)).toEqual([55, 52, 52])
  })
})
