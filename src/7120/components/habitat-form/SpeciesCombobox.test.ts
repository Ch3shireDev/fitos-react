import { describe, expect, it } from 'vitest'
import { filterCatalog, normalizeText } from './SpeciesCombobox'

const catalog = [
  { value: 'Sphagnum fallax', label: 'torfowiec kończysty' },
  { value: 'Sphagnum fuscum', label: 'torfowiec brunatny' },
  { value: 'Oxycoccus palustris', label: 'żurawina błotna' },
  { value: 'Ledum palustre', label: 'bagno zwyczajne' },
]

describe('wyszukiwanie gatunków', () => {
  it('normalizuje polskie znaki', () => {
    expect(normalizeText('Żurawina Błotna')).toBe('zurawina blotna')
  })

  it('dopasowuje początki słów w nazwie naukowej i polskiej', () => {
    expect(filterCatalog(catalog, 'sph fal').map((o) => o.value)).toEqual(['Sphagnum fallax'])
    expect(filterCatalog(catalog, 'S. fallax').map((o) => o.value)).toEqual(['Sphagnum fallax'])
    expect(filterCatalog(catalog, 'torfowiec konczysty').map((o) => o.value)).toEqual(['Sphagnum fallax'])
    expect(filterCatalog(catalog, 'palustr').map((o) => o.value)).toEqual(['Oxycoccus palustris', 'Ledum palustre'])
  })

  it('nie dopasowuje środka słowa', () => {
    expect(filterCatalog(catalog, 'allax')).toEqual([])
  })

  it('puste zapytanie zwraca katalog', () => {
    expect(filterCatalog(catalog, '  ')).toHaveLength(4)
  })
})
