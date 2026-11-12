import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { Grade, InputValues } from '../../7120/habitats/types'
import { examples40A0, garbPinczowski } from './examples'
import { methodology40A0 as m } from './methodology'
import { characteristicByClass, findSpecies40A0 } from './species'

const ind = (id: string) => {
  const i = m.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id}`)
  return i
}
const site = (variant: string) => ({ site: { variant } })
const suggest = (id: string, inputs: InputValues, variant = 'cerasus'): Grade | null =>
  ind(id).suggest!(inputs, site(variant))
const sp = (...rows: [string, number?][]) => ({ species: rows.map(([name, cover]) => ({ name, cover: cover ?? 1 })) })

describe('metodyka 40A0 – struktura danych', () => {
  it('kod bez gwiazdki (siedlisko niepriorytetowe)', () => {
    expect(habitatCode(m)).toBe('40A0')
    expect(m.name).toBe('Subkontynentalne zarośla okołopannońskie')
  })

  it('wskaźniki idą w kolejności z karty w przewodniku, plus „struktura zarośli” ze sprawozdań', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Powierzchnia zajęta przez siedlisko na transekcie',
      'Struktura przestrzenna płatów siedliska',
      'Struktura przestrzenna zarośli',
      'Gatunki charakterystyczne',
      'Stan populacji gatunków charakterystycznych',
      'Udział wisienki stepowej lub irgi zwyczajnej w warstwie krzewów',
      'Zwarcie drzew i krzewów innych niż wisienka stepowa lub irga zwyczajna',
      'Wysokość krzewów wisienki (tylko dla zarośli wisienki stepowej)',
      'Obce gatunki inwazyjne',
      'Gatunki ekspansywne roślin zielnych',
      'Wojłok (martwa materia organiczna)',
    ])
    // jak w sprawozdaniach: 11 wskaźników struktury + powierzchnia
    expect(m.indicators.filter((i) => i.parameter === 'structure')).toHaveLength(11)
  })

  it('kardynalne wg przewodnika; wysokość wisienki nie jest kardynalna w zaroślach irgi', () => {
    const cardinal = (variant: string) => m.indicators.filter((i) => isCardinal(i, { variant })).map((i) => i.id)
    expect(cardinal('cerasus')).toEqual(['charState', 'keyShare', 'height'])
    expect(cardinal('')).toEqual(['charState', 'keyShare', 'height'])
    expect(cardinal('cotoneaster')).toEqual(['charState', 'keyShare'])
  })

  it('wariant siedliska jest wymagany, zdjęcia fitosocjologiczne mają 25 m²', () => {
    expect(m.siteFields.find((x) => x.name === 'variant')).toMatchObject({ kind: 'select', required: true })
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('pola z karty w przewodniku: typ stanowiska, zarządzający, dodatkowi eksperci, propozycje działań', () => {
    const names = [...m.siteFields, ...m.otherFields].map((f) => f.name)
    expect(names).toEqual(expect.arrayContaining(['siteType', 'manager', 'additionalExperts', 'proposals']))
  })
})

describe('gatunki', () => {
  it('rozpoznaje pisownię z kart terenowych i dzieli na klasy', () => {
    expect(findSpecies40A0('Cornus sanquinea')?.latin).toBe('Cornus sanguinea')
    expect(findSpecies40A0('wisienka stepowa (wiśnia karłowata)')?.group).toBe('key')
    expect(findSpecies40A0('Rosa ×dumetorum')?.group).toBe('shrub')
    const { shrubs, grassland } = characteristicByClass(sp(['Cerasus fruticosa'], ['Prunus spinosa'], ['Inula ensifolia'], ['Taraxacum officinale']).species)
    expect(shrubs).toEqual(['Cerasus fruticosa', 'Prunus spinosa'])
    expect(grassland).toEqual(['Inula ensifolia'])
  })
})

describe('podpowiedzi ocen wg tab. 2', () => {
  it('gatunki charakterystyczne: decyduje słabsza klasa (>4 FV, 3–4 U1, ≤2 U2)', () => {
    const shrubs5 = [['Cerasus fruticosa'], ['Prunus spinosa'], ['Cornus sanguinea'], ['Rosa canina'], ['Crataegus monogyna']] as [string][]
    const grass5 = [['Inula ensifolia'], ['Carex humilis'], ['Festuca rupicola'], ['Adonis vernalis'], ['Salvia pratensis']] as [string][]
    expect(suggest('characteristic', sp(...shrubs5, ...grass5))).toBe('FV')
    expect(suggest('characteristic', sp(...shrubs5, ...grass5.slice(0, 3)))).toBe('U1')
    expect(suggest('characteristic', sp(...shrubs5, ...grass5.slice(0, 2)))).toBe('U2')
    expect(suggest('characteristic', { species: [] })).toBeNull()
  })

  it('udział wisienki: >75 FV, 50–75 U1, <50 U2', () => {
    expect(suggest('keyShare', { cover: 80 })).toBe('FV')
    expect(suggest('keyShare', { cover: 75 })).toBe('U1')
    expect(suggest('keyShare', { cover: 50 })).toBe('U1')
    expect(suggest('keyShare', { cover: 49 })).toBe('U2')
    expect(ind('keyShare').describe!({ cover: 60 }, site('cotoneaster'))).toBe('irga zwyczajna 60%')
  })

  it('zwarcie innych krzewów: <25 FV, 25–50 U1, >50 U2; wpisana suma ma pierwszeństwo, wisienka się nie liczy', () => {
    expect(suggest('otherShrubs', sp(['Prunus spinosa', 10], ['Cornus sanguinea', 5]))).toBe('FV')
    expect(suggest('otherShrubs', sp(['Prunus spinosa', 30]))).toBe('U1')
    expect(suggest('otherShrubs', sp(['Prunus spinosa', 60]))).toBe('U2')
    expect(suggest('otherShrubs', { ...sp(['Prunus spinosa', 30], ['Cornus sanguinea', 30]), cover: 40 })).toBe('U1')
    expect(suggest('otherShrubs', sp(['Prunus spinosa', 10], ['Cerasus fruticosa', 90]))).toBe('FV')
    expect(ind('otherShrubs').warn!(sp(['Cerasus fruticosa', 90]))).toMatch(/siedliskotwórczy/)
    expect(suggest('otherShrubs', { species: [] })).toBeNull()
  })

  it('wysokość wisienki ze średniej (<1,2 m FV, 1,2–1,5 U1, >1,5 U2); w zaroślach irgi XX', () => {
    expect(suggest('height', { mean: 50, max: 140 })).toBe('FV')
    expect(suggest('height', { mean: 130 })).toBe('U1')
    expect(suggest('height', { mean: 160 })).toBe('U2')
    expect(suggest('height', { mean: 160 }, 'cotoneaster')).toBe('XX')
    expect(ind('height').explain!({ mean: 80, max: 170 }, site('cerasus'))).toMatch(/mieszańce/)
  })

  it('obce inwazyjne: pojedyncze nisko inwazyjne FV, silnie inwazyjne co najmniej U1', () => {
    expect(suggest('invasive', { species: [] })).toBe('FV')
    expect(suggest('invasive', sp(['Juglans regia', 0.5]))).toBe('FV')
    expect(suggest('invasive', sp(['Syringa vulgaris', 3]))).toBe('U1')
    expect(suggest('invasive', sp(['Syringa vulgaris', 6]))).toBe('U2')
    expect(suggest('invasive', sp(['Solidago gigantea', 0.5]))).toBe('U1')
    expect(suggest('invasive', sp(['Solidago gigantea', 2]))).toBe('U2')
    expect(suggest('invasive', { species: [{ name: 'Solidago gigantea' }] })).toBeNull()
  })

  it('ekspansywne: <20 FV, 20–50 U1, >50 U2; w zaroślach irgi ostrzeżenie o degeneracji', () => {
    expect(suggest('expansive', { species: [] })).toBe('FV')
    expect(suggest('expansive', sp(['Calamagrostis epigejos', 10]))).toBe('FV')
    expect(suggest('expansive', sp(['Calamagrostis epigejos', 10], ['Elymus hispidus', 15]))).toBe('U1')
    expect(suggest('expansive', sp(['Calamagrostis epigejos', 60]))).toBe('U2')
    expect(ind('expansive').warn!(sp(['Calamagrostis epigejos', 2]), site('cotoneaster'))).toMatch(/degeneracji/)
    expect(ind('expansive').warn!(sp(['Calamagrostis epigejos', 2]), site('cerasus'))).toBeNull()
  })

  it('wojłok: średnia, a bez niej środek zakresu', () => {
    expect(suggest('litter', { mean: 8 })).toBe('FV')
    expect(suggest('litter', { mean: 12 })).toBe('U1')
    expect(suggest('litter', { mean: 16 })).toBe('U2')
    expect(suggest('litter', { min: 5, max: 10 })).toBe('FV')
    expect(suggest('litter', { min: 10, max: 20 })).toBe('U1')
  })

  it('fragmentacja: w zaroślach irgi naturalna, więc FV', () => {
    expect(suggest('patchStructure', { choice: 'medium' })).toBe('U1')
    expect(suggest('patchStructure', { choice: 'high' })).toBe('U2')
    expect(suggest('patchStructure', { choice: 'high' }, 'cotoneaster')).toBe('FV')
  })

  it('udział siedliska na transekcie (interpretacja sprawozdań) i selekty', () => {
    expect(suggest('transectShare', { share: 70 })).toBe('FV')
    expect(suggest('transectShare', { share: 50 })).toBe('U1')
    expect(suggest('transectShare', { share: 30 })).toBe('U2')
    expect(suggest('area', { choice: 'slight' })).toBe('U1')
    expect(suggest('charState', { choice: 'many' })).toBe('U2')
    expect(suggest('shrubStructure', { choice: 'noData' })).toBe('XX')
  })
})

describe('przykład z przewodnika: Garb Pińczowski, 16.05.2013', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(garbPinczowski)
    expect(r.success, JSON.stringify(r.error?.issues, null, 2)).toBe(true)
  })

  it('pusta karta nie przechodzi, brak wariantu jest zgłaszany', () => {
    const r = buildCardSchema(m).safeParse(emptyCardValues(m))
    expect(r.success).toBe(false)
    expect(r.error!.issues.some((i) => i.path.join('.') === 'site.variant')).toBe(true)
  })

  it('oceny parametrów jak w karcie: wszystko FV', () => {
    const a = assessCard(m, garbPinczowski)
    expect(a.missing).toEqual([])
    expect(a).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV' })
  })

  it('podpowiedzi odbiegają od ocen eksperta tylko przy gatunkach ekspansywnych (10% + 15% = 25%, karta: FV)', () => {
    const v = garbPinczowski
    const diff = m.indicators
      .filter((i) => {
        const s = i.suggest?.(v.indicators[i.id].inputs, { site: v.site })
        return s && s !== v.indicators[i.id].grade
      })
      .map((i) => i.id)
    expect(diff).toEqual(['expansive'])
  })

  it('trzy zdjęcia fitosocjologiczne przepisane z karty', () => {
    expect(garbPinczowski.releves.map((r) => r.unit)).toEqual(['Inuletum ensifoliae', 'Prunion fruticosae', 'Inuletum ensifoliae'])
    expect(garbPinczowski.releves.map((r) => (r.species as unknown[]).length)).toEqual([28, 24, 26])
  })

  it('wszystkie gatunki z przykładu są w katalogu', () => {
    const names = [
      ...garbPinczowski.releves.flatMap((r) => (r.species as { name: string }[]).map((s) => s.name)),
      ...Object.values(garbPinczowski.indicators).flatMap((x) => ((x.inputs.species as { name: string }[]) ?? []).map((s) => s.name)),
    ]
    expect(names.filter((n) => !findSpecies40A0(n))).toEqual([])
  })
})

describe('pomoc, katalog, anonimizacja', () => {
  it('każde pole i wskaźnik ma szerokie wyjaśnienie', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...m.otherFields, ...m.indicators.flatMap((i) => i.inputs)]
    expect(fields.filter((f) => !f.help || f.help.length < 60).map((f) => f.name)).toEqual([])
    expect(m.indicators.filter((i) => !i.help).map((i) => i.id)).toEqual([])
  })

  it('przykład jest zanonimizowany – wykonawcą jest Jan Kowalski, bez dodatkowych ekspertów', () => {
    for (const { values } of examples40A0) {
      expect(values.site.observer).toBe('Jan Kowalski')
      expect(values.site.additionalExperts).toBe('')
    }
  })

  it('katalog ma nazwy polskie i domyślne warstwy', () => {
    const cat = m.speciesCatalog!
    expect(cat.find((o) => o.value === 'Cerasus fruticosa')).toMatchObject({ label: 'wisienka stepowa (wiśnia karłowata)', layer: 'B' })
    expect(cat.find((o) => o.value === 'Pyrus communis')?.layer).toBe('A')
    expect(cat.find((o) => o.value === 'Inula ensifolia')?.layer).toBe('C')
    expect(m.speciesInfo!('Solidago gigantea')).toMatch(/silnie inwazyjny/)
    expect(new Set(cat.map((o) => o.value)).size).toBe(cat.length)
  })
})
