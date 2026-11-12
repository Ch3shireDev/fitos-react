import { describe, expect, it } from 'vitest'
import { assessCard, habitatCode, isCardinal } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { Grade, InputValues } from '../../7120/habitats/types'
import { examples6510, plh020050_6510_02, plh020050_6510_06 } from './examples'
import { methodology6510 as m } from './methodology'
import { characteristic6510, findSpecies6510 } from './species'

const ind = (id: string) => {
  const i = m.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id}`)
  return i
}
const site = { community: 'Arrhenatheretum elatioris', localVariant: '' }
const suggest = (id: string, inputs: InputValues, s: InputValues = site): Grade | null => ind(id).suggest!(inputs, { site: s })
const sp = (...rows: [string, number?][]) => ({ species: rows.map(([name, cover]) => ({ name, cover: cover ?? 1 })) })

describe('metodyka 6510 – struktura danych', () => {
  it('kod bez gwiazdki, nazwa z przewodnika', () => {
    expect(habitatCode(m)).toBe('6510')
    expect(m.name).toBe('Ekstensywnie użytkowane niżowe łąki świeże (Arrhenatherion)')
  })

  it('wskaźniki w kolejności arkusza „ocena” RDOŚ', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Procent powierzchni zajęty przez siedlisko na transekcie',
      'Gatunki charakterystyczne',
      'Gatunki dominujące',
      'Obce gatunki inwazyjne',
      'Gatunki ekspansywne roślin zielnych',
      'Ekspansja krzewów i podrostu drzew',
      'Udział dobrze zachowanych płatów siedliska',
      'Wojłok (martwa materia organiczna)',
      'Struktura przestrzenna płatów siedliska',
    ])
  })

  it('kardynalne: gatunki charakterystyczne, ekspansywne i ekspansja krzewów', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['characteristic', 'expansive', 'shrubs'])
  })

  it('dodatkowe zakładki RDOŚ: ocena referencyjna dla każdego wskaźnika i perspektyw oraz działania', () => {
    const [reference, actions] = m.extraSteps!
    expect(reference.after).toBe('status')
    expect(reference.fields.filter((f) => f.label === 'Ocena referencyjna').map((f) => f.group)).toEqual([
      ...m.indicators.map((i) => i.label),
      'Perspektywy zachowania',
    ])
    expect(actions.fields[0].kind).toBe('table')
  })

  it('kody oddziaływań ze słownika arkusza RDOŚ', () => {
    expect(m.impactCodes.length).toBe(413)
    expect(m.impactCodes.find((c) => c.code === 'A03')?.name).toBe('Koszenie / ścinanie trawy')
  })

  it('przykłady przechodzą walidację i dają oceny z arkuszy', () => {
    const schema = buildCardSchema(m)
    for (const e of examples6510) expect(schema.safeParse(e.values).success, e.id).toBe(true)
    expect(assessCard(m, plh020050_6510_02)).toMatchObject({ area: 'U2', structure: 'FV', prospects: 'FV', overall: 'U2' })
    expect(assessCard(m, plh020050_6510_06)).toMatchObject({ area: 'XX', structure: 'U2', prospects: 'FV', overall: 'U2' })
  })

  it('przykłady są zanonimizowane', () => {
    const text = JSON.stringify(examples6510)
    expect(text).not.toMatch(/Jaszczuk|Gornia/)
    expect(plh020050_6510_02.site.observer).toBe('Jan Kowalski')
  })
})

describe('metodyka 6510 – podpowiedzi ocen', () => {
  it('gatunki charakterystyczne: Arrhenatheretum >4 FV, 3–4 U1, ≤2 U2', () => {
    const five = sp(['Arrhenatherum elatius'], ['Geranium pratense'], ['Crepis biennis'], ['Knautia arvensis'], ['Galium mollugo'])
    expect(suggest('characteristic', five)).toBe('FV')
    expect(suggest('characteristic', sp(['Arrhenatherum elatius'], ['Geranium pratense'], ['Crepis biennis']))).toBe('U1')
    expect(suggest('characteristic', sp(['Arrhenatherum elatius'], ['Poa pratensis'], ['Festuca rubra']))).toBe('U2')
  })

  it('zb. Poa pratensis-Festuca rubra: wiechlina i kostrzewa się liczą, 3+ FV, 2 U1', () => {
    const poa = { community: 'Poa pratensis-Festuca rubra' }
    expect(suggest('characteristic', sp(['Poa pratensis'], ['Festuca rubra'], ['Campanula patula']), poa)).toBe('FV')
    expect(suggest('characteristic', sp(['Poa pratensis'], ['Festuca rubra']), poa)).toBe('U1')
    expect(suggest('characteristic', plh020050_6510_06.indicators.characteristic.inputs, plh020050_6510_06.site)).toBe('FV')
  })

  it('wariant regionalny: kostrzewa czerwona w Sudetach, przytulia biała na Ziemi Lubuskiej', () => {
    const rows = sp(['Festuca rubra'], ['Galium album']).species
    expect(characteristic6510(rows, { poaFestuca: false, variant: '' }).counted).toEqual([])
    expect(characteristic6510(rows, { poaFestuca: false, variant: 'sudety' }).counted).toEqual(['Festuca rubra'])
    expect(characteristic6510(rows, { poaFestuca: false, variant: 'lubuska' }).counted).toEqual(['Galium album'])
  })

  it('gatunki dominujące: ekspansywny wśród dominantów U2, silna dominacja gatunku łąkowego U1', () => {
    expect(suggest('dominant', plh020050_6510_06.indicators.dominant.inputs, plh020050_6510_06.site)).toBe('U2')
    expect(suggest('dominant', plh020050_6510_02.indicators.dominant.inputs)).toBe('FV')
    expect(suggest('dominant', sp(['Dactylis glomerata', 60], ['Poa pratensis', 10]))).toBe('U1')
  })

  it('obce inwazyjne: pojedynczy osobnik nawłoci U1 (jak w karcie 02), więcej U2', () => {
    expect(suggest('invasive', plh020050_6510_02.indicators.invasive.inputs)).toBe('U1')
    expect(suggest('invasive', sp(['Solidago gigantea', 3]))).toBe('U2')
    expect(suggest('invasive', sp())).toBe('FV')
    expect(findSpecies6510('Padus serotina')?.group).toBe('invasive-high')
  })

  it('ekspansywne: trzcinnik 20% i wrotycz 15% to U2 (karta 06), brak FV', () => {
    expect(suggest('expansive', plh020050_6510_06.indicators.expansive.inputs)).toBe('U2')
    expect(suggest('expansive', sp(['Tanacetum vulgare', 5], ['Holcus mollis', 10]))).toBe('U1')
    expect(suggest('expansive', sp(['Holcus mollis', 10]))).toBe('FV')
    expect(suggest('expansive', sp())).toBe('FV')
  })

  it('krzewy <1 FV, 1–5 U1, >5 U2; procent powierzchni ≥80 FV; udział płatów 40% U2; wojłok', () => {
    expect(suggest('shrubs', { species: [], total: 0.5 })).toBe('FV')
    expect(suggest('shrubs', { species: [], total: 3 })).toBe('U1')
    expect(suggest('shrubs', { species: [], total: 6 })).toBe('U2')
    expect(suggest('percent', { share: 100 })).toBe('FV')
    expect(suggest('percent', { share: 60 })).toBe('U1')
    expect(suggest('percent', { share: 50 })).toBe('U2')
    expect(suggest('wellPreserved', { share: 40 })).toBe('U2')
    expect(suggest('litter', { mean: 3 })).toBe('U1')
  })

  it('powierzchnia: brak danych porównawczych to XX', () => {
    expect(suggest('area', { choice: 'unknown' })).toBe('XX')
    expect(suggest('area', { choice: 'clear' })).toBe('U2')
  })
})
