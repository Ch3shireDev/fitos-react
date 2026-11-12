import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { Grade, InputValues } from '../../7120/habitats/types'
import { bukowyLasGorki2, examples91F0 } from './examples'
import { methodology91F0 as m } from './methodology'
import { elmOakAshSpecies, findSpecies91F0 } from './species'

const ind = (id: string) => {
  const i = m.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id}`)
  return i
}
const suggest = (id: string, inputs: InputValues, form = 'valley'): Grade | null => ind(id).suggest!(inputs, { site: { form } })
const sp = (...rows: [string, number?][]) => ({ species: rows.map(([name, cover]) => ({ name, cover: cover ?? 1 })) })

describe('metodyka 91F0 – struktura danych', () => {
  it('siedlisko priorytetowe: kod z gwiazdką', () => {
    expect(habitatCode(m)).toBe('*91F0')
  })

  it('wskaźniki idą w kolejności z tab. 2 przewodnika', () => {
    expect(m.indicators.map((i) => i.id)).toEqual([
      'area',
      'floristic',
      'dominant',
      'elmOakAsh',
      'shrubs',
      'ecoAlien',
      'geoAlien',
      'deadWood',
      'largeDeadWood',
      'age',
      'regeneration',
      'vertical',
      'gradification',
      'invasive',
      'apophytes',
      'hydrology',
      'logging',
      'otherDistortions',
      'keySpecies',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'structure')).toHaveLength(18)
  })

  it('5 wskaźników kardynalnych; stosunki wodne tylko dla typowych postaci', () => {
    const cardinal = (form: string) => m.indicators.filter((i) => isCardinal(i, { form })).map((i) => i.id)
    for (const f of ['valley', 'offValley', ''])
      expect(cardinal(f)).toEqual(['floristic', 'dominant', 'geoAlien', 'largeDeadWood', 'hydrology'])
    expect(cardinal('atypical')).toEqual(['floristic', 'dominant', 'geoAlien', 'largeDeadWood'])
  })

  it('postać łęgu jest wymaganym polem stanowiska, zdjęcia mają 100 m²', () => {
    expect(m.siteFields.find((x) => x.name === 'form')).toMatchObject({ kind: 'select', required: true })
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(100)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('termin: maj–sierpień bez ostrzeżeń, wrzesień z uwagą, zima poza sezonem', () => {
    const warn = m.siteFields.find((f) => f.name === 'date')!.warn!
    expect(warn('2025-06-20')).toBeNull()
    expect(warn('2025-09-10')).toMatch(/geofity/)
    expect(warn('2025-12-01')).toMatch(/poza sezonem/)
  })
})

describe('gatunki', () => {
  it('rozpoznaje grupy z przewodnika', () => {
    expect(findSpecies91F0('Ulmus laevis')?.group).toBe('tree-core')
    expect(findSpecies91F0('wiąz polny')?.group).toBe('tree-core')
    expect(findSpecies91F0('Carpinus betulus')?.group).toBe('tree-grad')
    expect(findSpecies91F0('Acer negundo')?.group).toBe('tree-geo-alien')
    expect(findSpecies91F0('Populus x canadensis')?.group).toBe('tree-geo-alien')
    expect(findSpecies91F0('Impatiens parviflora')?.group).toBe('invasive')
    expect(findSpecies91F0('Impatiens noli-tangere')?.group).toBe('char')
    expect(findSpecies91F0('Rubus caesius')?.group).toBe('char')
    expect(findSpecies91F0('Rubus sp.')?.group).toBe('expansive')
    expect(findSpecies91F0('Galanthus nivalis')?.group).toBe('key')
  })

  it('wiązy, dąb, jesion liczone bez powtórzeń; „Ulmus sp.” to jeden wiąz', () => {
    expect(elmOakAshSpecies(sp(['Quercus robur'], ['Fraxinus excelsior'], ['Quercus robur'], ['Acer campestre']).species)).toEqual([
      'Quercus robur',
      'Fraxinus excelsior',
    ])
    expect(elmOakAshSpecies(sp(['Quercus robur'], ['Ulmus sp.']).species)).toHaveLength(2)
    expect(elmOakAshSpecies(sp(['Ulmus laevis'], ['Ulmus sp.']).species)).toEqual(['Ulmus laevis'])
  })
})

describe('podpowiedzi ocen wg tab. 2', () => {
  it('liczba gatunków wiązy, dąb, jesion: 3+ FV, 2 U1, 1 U2', () => {
    expect(suggest('elmOakAsh', sp(['Quercus robur'], ['Fraxinus excelsior'], ['Ulmus minor']))).toBe('FV')
    expect(suggest('elmOakAsh', sp(['Quercus robur'], ['Fraxinus excelsior'], ['Carpinus betulus']))).toBe('U1')
    expect(suggest('elmOakAsh', sp(['Quercus robur']))).toBe('U2')
    expect(suggest('elmOakAsh', { species: [] })).toBeNull()
  })

  it('różnorodność krzewów: 4+ FV, 2–3 U1, 0–1 U2', () => {
    expect(suggest('shrubs', sp(['Cornus sanguinea'], ['Euonymus europaeus'], ['Sambucus nigra'], ['Prunus padus']))).toBe('FV')
    expect(suggest('shrubs', sp(['Cornus sanguinea'], ['Euonymus europaeus']))).toBe('U1')
    expect(suggest('shrubs', sp(['Corylus avellana']))).toBe('U2')
    expect(suggest('shrubs', { species: [] })).toBe('U2')
  })

  it('obce ekologicznie <10 / 10–50 / >50%, obce geograficznie z odnawianiem', () => {
    expect(suggest('ecoAlien', { species: [] })).toBe('FV')
    expect(suggest('ecoAlien', sp(['Pinus sylvestris', 5]))).toBe('FV')
    expect(suggest('ecoAlien', sp(['Pinus sylvestris', 30]))).toBe('U1')
    expect(suggest('ecoAlien', sp(['Pinus sylvestris', 40], ['Picea abies', 20]))).toBe('U2')
    expect(suggest('geoAlien', { species: [] })).toBe('FV')
    expect(suggest('geoAlien', sp(['Populus ×canadensis', 0.5]))).toBe('FV')
    expect(suggest('geoAlien', sp(['Acer negundo', 5]))).toBe('U1')
    expect(suggest('geoAlien', { ...sp(['Acer negundo', 0.5]), regenerating: 'yes' })).toBe('U2')
    expect(suggest('geoAlien', sp(['Quercus rubra', 15]))).toBe('U2')
  })

  it('martwe drewno: m³/ha ma pierwszeństwo przed starym % miąższości', () => {
    expect(suggest('deadWood', { volume: 25 })).toBe('FV')
    expect(suggest('deadWood', { volume: 15 })).toBe('U1')
    expect(suggest('deadWood', { volume: 5, share: 20 })).toBe('U2')
    expect(suggest('deadWood', { share: 12 })).toBe('FV')
    expect(suggest('deadWood', { share: 5 })).toBe('U1')
    expect(suggest('deadWood', {})).toBeNull()
    expect(suggest('largeDeadWood', { perHa: 10 })).toBe('FV')
    expect(suggest('largeDeadWood', { perHa: 5 })).toBe('U1')
    expect(suggest('largeDeadWood', { perHa: 2 })).toBe('U2')
    expect(ind('largeDeadWood').describe!({ perHa: 10, minDiameter: '30' })).toBe('10 szt./ha (grubość >30 cm)')
  })

  it('inwazyjne w podszycie i runie (interpretacja progów opisowych)', () => {
    expect(suggest('invasive', { species: [] })).toBe('FV')
    expect(suggest('invasive', sp(['Impatiens parviflora', 0.5]))).toBe('FV')
    expect(suggest('invasive', sp(['Impatiens parviflora', 5]))).toBe('U1')
    expect(suggest('invasive', sp(['Impatiens parviflora', 0.5], ['Acer negundo', 0.5]))).toBe('U1')
    expect(suggest('invasive', sp(['Impatiens parviflora', 40]))).toBe('U2')
  })

  it('selekty', () => {
    expect(suggest('area', { choice: 'slow' })).toBe('U1')
    expect(suggest('floristic', { choice: 'fragmentary' })).toBe('U2')
    expect(suggest('hydrology', { choice: 'altered' })).toBe('U1')
    expect(suggest('gradification', { choice: 'advanced' })).toBe('U2')
    expect(suggest('vertical', { choice: 'diverse' })).toBe('FV')
    expect(suggest('age', { choice: 'mid' })).toBe('U1')
    expect(suggest('keySpecies', { choice: 'noData' })).toBe('XX')
  })

  it('ostrzeżenia przy sprzecznych danych', () => {
    expect(ind('dominant').warn!({ choice: 'natural', ...sp(['Pinus sylvestris', 50]) })).toMatch(/Pinus sylvestris/)
    expect(ind('dominant').warn!({ choice: 'natural', ...sp(['Carpinus betulus', 30]) })).toMatch(/Carpinus/)
    expect(ind('dominant').warn!({ choice: 'natural', ...sp(['Quercus robur', 60], ['Ficaria verna', 50]) })).toBeNull()
    expect(ind('age').warn!({ choice: 'young', share100: 15 })).toMatch(/Ponad 10%/)
    expect(ind('regeneration').warn!({ choice: 'abundant', ...sp(['Fraxinus excelsior']) })).toMatch(/więcej niż 2/)
    expect(ind('apophytes').warn!({ choice: 'single', ...sp(['Calamagrostis epigejos', 30]) })).toMatch(/30%/)
  })

  it('runo: podpowiedź z selecta, a lista pokazuje gatunki typowe i grądowe', () => {
    const inputs = { choice: 'typical', ...sp(['Ficaria verna', 30], ['Galium odoratum', 10], ['Gagea lutea', 5]) }
    expect(suggest('floristic', inputs)).toBe('FV')
    expect(ind('floristic').explain!(inputs, { site: {} })).toMatch(/typowe dla runa łęgu: 2.*grądowe: 1, łącznie 10%/)
  })
})

describe('schemat', () => {
  const schema = buildCardSchema(m)

  it.each(examples91F0)('przykład $label przechodzi walidację', ({ values }) => {
    const r = schema.safeParse(values)
    expect(r.success, JSON.stringify(r.error?.issues, null, 2)).toBe(true)
  })

  it('pusta karta nie przechodzi, brak postaci łęgu też jest zgłaszany', () => {
    const r = schema.safeParse(emptyCardValues(m))
    expect(r.success).toBe(false)
    expect(r.error!.issues.some((i) => i.path.join('.') === 'site.form')).toBe(true)
  })
})

describe('przykład z przewodnika (Bukowy Las Górki 2, 2009)', () => {
  it('oceny parametrów zgadzają się z kartą', () => {
    const a = assessCard(m, bukowyLasGorki2)
    expect(a.missing).toEqual([])
    expect(a).toMatchObject({ area: 'U1', structure: 'U2', prospects: 'U2', overall: 'U2' })
  })

  it('podpowiedzi zgadzają się z ocenami eksperta poza jednym znanym wyjątkiem', () => {
    const diff = m.indicators
      .filter((i) => {
        const v = bukowyLasGorki2.indicators[i.id]
        const s = i.suggest?.(v.inputs, { site: bukowyLasGorki2.site })
        return s && s !== v.grade
      })
      .map((i) => i.id)
    // Karta w przewodniku daje FV przy dwóch gatunkach (dąb, jesion), a tab. 2 przewiduje za to U1.
    expect(diff).toEqual(['elmOakAsh'])
    expect(suggest('elmOakAsh', bukowyLasGorki2.indicators.elmOakAsh.inputs)).toBe('U1')
  })

  it('zanonimizowany wykonawca, trzy zdjęcia fitosocjologiczne po 100 m²', () => {
    expect(bukowyLasGorki2.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(bukowyLasGorki2)).not.toMatch(/Pawlaczyk/)
    expect(bukowyLasGorki2.releves).toHaveLength(3)
    expect(bukowyLasGorki2.releves.every((r) => r.area === 100)).toBe(true)
  })
})

describe('pomoc i katalog', () => {
  it('każde pole i wskaźnik ma szerokie wyjaśnienie', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...m.otherFields, ...m.indicators.flatMap((i) => i.inputs)]
    expect(fields.filter((f) => !f.help || f.help.length < 60).map((f) => f.name)).toEqual([])
    expect(m.indicators.filter((i) => !i.help).map((i) => i.id)).toEqual([])
  })

  it('katalog ma nazwy polskie i domyślne warstwy', () => {
    const cat = m.speciesCatalog!
    expect(cat.find((o) => o.value === 'Ficaria verna')).toMatchObject({ label: 'ziarnopłon wiosenny', layer: 'C' })
    expect(cat.find((o) => o.value === 'Quercus robur')?.layer).toBe('A')
    expect(cat.find((o) => o.value === 'Cornus sanguinea')?.layer).toBe('B')
    expect(cat.find((o) => o.value === 'Atrichum undulatum')?.layer).toBe('D')
    expect(m.speciesInfo!('Carpinus betulus')).toMatch(/grądowienie/)
  })
})
