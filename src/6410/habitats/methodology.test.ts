import { describe, expect, it } from 'vitest'
import { assessCard, habitatCode, isCardinal } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { Grade, InputValues } from '../../7120/habitats/types'
import { examples6410, wedziszew6410 } from './examples'
import { methodology6410 as m } from './methodology'
import { typical6410 } from './species'

const ind = (id: string) => {
  const i = m.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id}`)
  return i
}
const suggest = (id: string, inputs: InputValues, site: InputValues = { community: 'Selino-Molinietum' }): Grade | null =>
  ind(id).suggest!(inputs, { site })
const sp = (...rows: [string, number?][]) => ({ species: rows.map(([name, cover]) => ({ name, cover: cover ?? 1 })) })

describe('metodyka 6410 – struktura danych', () => {
  it('kod i nazwa', () => {
    expect(habitatCode(m)).toBe('6410')
    expect(m.name).toBe('Zmiennowilgotne łąki trzęślicowe (Molinion)')
  })

  it('wskaźniki jak w 6510, ale bez udziału dobrze zachowanych płatów i z gatunkami typowymi', () => {
    expect(m.indicators.map((i) => i.id)).toEqual(['area', 'percent', 'typical', 'dominant', 'invasive', 'expansive', 'shrubs', 'litter', 'spatial'])
  })

  it('kardynalne wg przewodnika: gatunki typowe, dominujące i ekspansja krzewów', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['typical', 'dominant', 'shrubs'])
  })

  it('ma zakładki RDOŚ i słownik oddziaływań jak 6510', () => {
    expect(m.extraSteps?.map((s) => s.id)).toEqual(['reference', 'actions'])
    expect(m.impactCodes.length).toBe(413)
  })

  it('przykład Wędziszew: walidacja, oceny z karty, obserwator zanonimizowany', () => {
    expect(buildCardSchema(m).safeParse(wedziszew6410).success).toBe(true)
    expect(assessCard(m, wedziszew6410)).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV' })
    expect(JSON.stringify(examples6410)).not.toMatch(/Michalska|Kopeć|Hejduk/)
    expect(wedziszew6410.releves).toHaveLength(3)
  })
})

describe('metodyka 6410 – podpowiedzi ocen', () => {
  it('gatunki typowe: ≥5 charakterystycznych i ≥3 wyróżniające FV, ≥3 charakterystyczne U1, mniej U2', () => {
    const fv = sp(['Molinia caerulea'], ['Galium boreale'], ['Iris sibirica'], ['Selinum carvifolia'], ['Succisa pratensis'], ['Briza media'], ['Potentilla erecta'], ['Linum catharticum'])
    expect(suggest('typical', fv)).toBe('FV')
    expect(suggest('typical', wedziszew6410.indicators.typical.inputs)).toBe('U1')
    expect(suggest('typical', sp(['Molinia caerulea'], ['Briza media']))).toBe('U2')
  })

  it('sity liczą się jako wyróżniające tylko w Junco-Molinietum', () => {
    const rows = sp(['Juncus effusus'], ['Juncus conglomeratus']).species
    expect(typical6410(rows, false).dist).toEqual([])
    expect(typical6410(rows, true).dist).toEqual(['Juncus effusus', 'Juncus conglomeratus'])
  })

  it('dominujące: trzęślica >50% U1, śmiałek >50% U2, Wędziszew FV', () => {
    expect(suggest('dominant', sp(['Molinia caerulea', 70]))).toBe('U1')
    expect(suggest('dominant', sp(['Deschampsia caespitosa', 60]))).toBe('U2')
    expect(suggest('dominant', wedziszew6410.indicators.dominant.inputs)).toBe('FV')
  })

  it('inwazyjne: brak FV, do 5% U1, więcej U2', () => {
    expect(suggest('invasive', sp())).toBe('FV')
    expect(suggest('invasive', sp(['Solidago canadensis', 0.5]))).toBe('U1')
    expect(suggest('invasive', sp(['Solidago canadensis', 10]))).toBe('U2')
  })

  it('ekspansywne: Wędziszew (śmiałek 30%, tojeść 10%) U1, >30% U2, drobne FV', () => {
    expect(suggest('expansive', wedziszew6410.indicators.expansive.inputs)).toBe('U1')
    expect(suggest('expansive', sp(['Filipendula ulmaria', 40]))).toBe('U2')
    expect(suggest('expansive', sp(['Filipendula ulmaria', 3], ['Urtica dioica', 2]))).toBe('FV')
  })

  it('krzewy <5 FV, 5–20 U1, >20 U2; procent powierzchni 90 FV; wojłok 2,5 cm U1', () => {
    expect(suggest('shrubs', { species: [], total: 4 })).toBe('FV')
    expect(suggest('shrubs', { species: [], total: 20 })).toBe('U1')
    expect(suggest('shrubs', { species: [], total: 25 })).toBe('U2')
    expect(suggest('percent', wedziszew6410.indicators.percent.inputs)).toBe('FV')
    expect(suggest('litter', wedziszew6410.indicators.litter.inputs)).toBe('U1')
  })
})
