import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { Grade, InputValues } from '../../7120/habitats/types'
import { examples91D0, reptowoVIII, reptowoX, reptowoXI } from './examples'
import { methodology91D0 as m } from './methodology'
import { characteristicMatch, findSpecies91D0 } from './species'

const ind = (id: string) => {
  const i = m.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id}`)
  return i
}
const site = (variant: string) => ({ site: { variant } })
const suggest = (id: string, inputs: InputValues, variant = 'pineBog'): Grade | null =>
  ind(id).suggest!(inputs, site(variant))
const sp = (...rows: [string, number?][]) => ({ species: rows.map(([name, cover]) => ({ name, cover: cover ?? 1 })) })

describe('metodyka 91D0 – struktura danych', () => {
  it('siedlisko priorytetowe: kod z gwiazdką', () => {
    expect(habitatCode(m)).toBe('*91D0')
  })

  it('wskaźniki idą w kolejności z karty obserwacji', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Gatunki charakterystyczne',
      'Gatunki dominujące',
      'Inwazyjne gatunki obce w runie',
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Uwodnienie',
      'Wiek drzewostanu',
      'Gatunki obce geograficznie w drzewostanie',
      'Gatunki obce ekologicznie w drzewostanie',
      'Martwe drewno leżące lub stojące > 3 m długości i 30 cm grubości',
      'Naturalne odnowienie drzewostanu',
      'Występowanie mchów torfowców',
      'Występowanie charakterystycznych krzewinek',
      'Pionowa struktura roślinności',
      'Zniszczenia runa i gleby związane z pozyskaniem drewna',
      'Inne zniekształcenia',
      'Stan kluczowych dla różnorodności biologicznej gatunków lokalnie typowych dla siedliska (wskaźnik fakultatywny)',
    ])
  })

  it('kardynalne wg przewodnika; torfowce tylko w borze bagiennym', () => {
    const cardinal = (variant: string) => m.indicators.filter((i) => isCardinal(i, { variant })).map((i) => i.id)
    expect(cardinal('pineBog')).toEqual(['characteristic', 'invasive', 'hydration', 'geoAlien', 'sphagnum'])
    for (const v of ['birchBog', 'spruceBog', 'pineBirchBoreal', ''])
      expect(cardinal(v)).toEqual(['characteristic', 'invasive', 'hydration', 'geoAlien'])
  })

  it('wariant siedliska jest wymaganym polem stanowiska', () => {
    const f = m.siteFields.find((x) => x.name === 'variant')
    expect(f).toMatchObject({ kind: 'select', required: true })
  })

  it('zdjęcia fitosocjologiczne mają 100 m²', () => {
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(100)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })
})

describe('gatunki i warianty', () => {
  it('dowolny torfowiec zalicza pozycję „Sphagnum spp.”', () => {
    expect(findSpecies91D0('S. fallax')?.group).toBe('sphagnum')
    expect(findSpecies91D0('Sphagnum teres')?.group).toBe('sphagnum')
    expect(characteristicMatch(sp(['Sphagnum fallax'], ['Sphagnum palustre']).species, 'pineBog').present).toEqual(['Sphagnum spp.'])
  })

  it('jeżyny są ekspansywne, moroszka kluczowa', () => {
    expect(findSpecies91D0('Rubus sp.')?.group).toBe('expansive')
    expect(findSpecies91D0('Rubus chamaemorus')?.group).toBe('key')
  })
})

describe('podpowiedzi ocen wg tab. 2', () => {
  it('gatunki charakterystyczne: >60% FV, 30–60% U1, <30% U2, zależnie od wariantu', () => {
    const four = sp(['Ledum palustre'], ['Vaccinium uliginosum'], ['Sphagnum fallax'], ['Oxycoccus palustris'])
    expect(suggest('characteristic', four)).toBe('FV') // 4/6 = 67%
    expect(suggest('characteristic', sp(['Ledum palustre'], ['Sphagnum fallax']))).toBe('U1') // 2/6 = 33%
    expect(suggest('characteristic', sp(['Sphagnum fallax']))).toBe('U2') // 1/6
    expect(suggest('characteristic', four, 'spruceBog')).toBe('U2') // tylko torfowce: 1/4 = 25%
    expect(suggest('characteristic', four, '')).toBeNull() // bez wariantu nie liczymy
    expect(ind('characteristic').explain!(four, site(''))).toMatch(/Wybierz wariant/)
  })

  it('inwazyjne i ekspansywne (interpretacja progów opisowych)', () => {
    expect(suggest('invasive', { species: [] })).toBe('FV')
    expect(suggest('invasive', sp(['Spiraea tomentosa', 0.5]))).toBe('U1')
    expect(suggest('invasive', sp(['Spiraea tomentosa', 5]))).toBe('U2')
    expect(suggest('invasive', sp(['Spiraea tomentosa', 0.5], ['Impatiens parviflora', 0.5]))).toBe('U2')
    expect(suggest('expansive', { species: [] })).toBe('FV')
    expect(suggest('expansive', sp(['Molinia caerulea', 20]))).toBe('U1')
    expect(suggest('expansive', sp(['Molinia caerulea', 40]))).toBe('U2')
    expect(suggest('expansive', sp(['Molinia caerulea', 5], ['Rubus sp.', 1]))).toBe('U2')
  })

  it('obce geograficznie: udział i odnawianie się', () => {
    expect(suggest('geoAlien', { species: [] })).toBe('FV')
    expect(suggest('geoAlien', sp(['Picea abies', 0.5]))).toBe('FV')
    expect(suggest('geoAlien', sp(['Picea abies', 5]))).toBe('U1')
    expect(suggest('geoAlien', { ...sp(['Picea abies', 0.5]), regenerating: 'yes' })).toBe('U2')
    expect(suggest('geoAlien', sp(['Larix decidua', 15]))).toBe('U2')
    expect(suggest('ecoAlien', sp(['Fagus sylvatica', 5]))).toBe('FV')
    expect(suggest('ecoAlien', sp(['Fagus sylvatica', 20]))).toBe('U1')
    expect(suggest('ecoAlien', sp(['Fagus sylvatica', 40]))).toBe('U2')
  })

  it('martwe drewno: liczba ma pierwszeństwo przed klasą', () => {
    expect(suggest('deadWood', { choice: 'many' })).toBe('FV')
    expect(suggest('deadWood', { perHa: 2 })).toBe('U1')
    expect(suggest('deadWood', { perHa: 0.5, choice: 'many' })).toBe('U2')
    expect(ind('deadWood').warn!({ perHa: 0.5, choice: 'many' })).toMatch(/<1 szt/)
  })

  it('krzewinki nie dotyczą świerczyn i lasów borealnych', () => {
    expect(suggest('dwarfShrubs', { choice: 'sparse' })).toBe('U1')
    expect(suggest('dwarfShrubs', { choice: 'none' }, 'spruceBog')).toBe('XX')
    expect(suggest('dwarfShrubs', { choice: 'none' }, 'pineBirchBoreal')).toBe('XX')
  })

  it('ostrzeżenia przy sprzecznych danych', () => {
    expect(ind('dominant').warn!({ choice: 'natural', ...sp(['Vaccinium myrtillus', 40]) })).toMatch(/Vaccinium myrtillus/)
    expect(ind('dominant').warn!({ choice: 'natural', ...sp(['Pinus sylvestris', 60]) })).toBeNull()
    expect(ind('sphagnum').warn!({ choice: 'dominant', ...sp(['Sphagnum fallax', 0.5]) })).toMatch(/dominacji/)
    expect(ind('hydration').warn!({ choice: 'proper', depth: 150 })).toMatch(/przesuszenie/)
  })

  it('selekty', () => {
    expect(suggest('area', { choice: 'slow' })).toBe('U1')
    expect(suggest('hydration', { choice: 'strong' })).toBe('U2')
    expect(suggest('age', { choice: 'mid' })).toBe('U1')
    expect(suggest('keySpecies', { choice: 'noData' })).toBe('XX')
  })
})

describe('schemat', () => {
  const schema = buildCardSchema(m)

  it.each(examples91D0)('przykład $label przechodzi walidację', ({ values }) => {
    const r = schema.safeParse(values)
    expect(r.success, JSON.stringify(r.error?.issues, null, 2)).toBe(true)
  })

  it('pusta karta nie przechodzi, brak wariantu też jest zgłaszany', () => {
    const r = schema.safeParse(emptyCardValues(m))
    expect(r.success).toBe(false)
    expect(r.error!.issues.some((i) => i.path.join('.') === 'site.variant')).toBe(true)
  })
})

describe('przykłady z karty docx (Reptowo, 14.07.2025)', () => {
  it.each([
    ['Reptowo XI', reptowoXI],
    ['Reptowo VIII', reptowoVIII],
    ['Reptowo X', reptowoX],
  ])('%s: oceny parametrów zgadzają się z kartą', (_, values) => {
    const a = assessCard(m, values)
    expect(a.missing).toEqual([])
    expect(a).toMatchObject({ area: 'FV', structure: 'U2', prospects: 'U1', overall: 'U2' })
  })

  it('podpowiedzi formularza zgadzają się z ocenami eksperta we wszystkich wskaźnikach', () => {
    for (const { values } of examples91D0) {
      const diff = m.indicators
        .filter((i) => {
          const s = i.suggest?.(values.indicators[i.id].inputs, { site: values.site })
          return s && s !== values.indicators[i.id].grade
        })
        .map((i) => i.id)
      expect(diff).toEqual([])
    }
  })
})

describe('pomoc, katalog, anonimizacja', () => {
  it('każde pole i wskaźnik ma szerokie wyjaśnienie', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...m.otherFields, ...m.indicators.flatMap((i) => i.inputs)]
    expect(fields.filter((f) => !f.help || f.help.length < 60).map((f) => f.name)).toEqual([])
    expect(m.indicators.filter((i) => !i.help).map((i) => i.id)).toEqual([])
  })

  it('przykłady są zanonimizowane – jedyny wykonawca i autor zdjęć to Jan Kowalski', () => {
    for (const { values } of examples91D0) {
      expect(values.site.observer).toBe('Jan Kowalski')
      const text = JSON.stringify(values)
      const authors = [...text.matchAll(/fot\. ([A-ZĄĆĘŁŃÓŚŹŻ]\. [A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)/g)].map((x) => x[1])
      expect(authors.length).toBeGreaterThan(0)
      expect(new Set(authors)).toEqual(new Set(['J. Kowalski']))
    }
  })

  it('katalog ma nazwy polskie i domyślne warstwy', () => {
    const cat = m.speciesCatalog!
    expect(cat.find((o) => o.value === 'Ledum palustre')).toMatchObject({ label: 'bagno zwyczajne', layer: 'C' })
    expect(cat.find((o) => o.value === 'Pinus sylvestris')?.layer).toBe('A')
    expect(cat.find((o) => o.value === 'Pleurozium schreberi')?.layer).toBe('D')
    expect(m.speciesInfo!('Pleurozium schreberi')).toMatch(/przesuszenie/)
  })
})
