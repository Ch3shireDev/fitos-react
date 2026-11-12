import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { Grade, InputValues } from '../../7120/habitats/types'
import { examples91Q0, macelowaGora } from './examples'
import { methodology91Q0 as m, subtypeOf } from './methodology'
import { CHARACTERISTIC_91Q0, characteristicSummary, findSpecies91Q0 } from './species'

const ind = (id: string) => {
  const i = m.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id}`)
  return i
}
const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, { site: {} })
const sp = (...rows: [string, number?][]) => ({ species: rows.map(([name, cover]) => ({ name, cover })) })
const six = sp(['Pinus sylvestris', 30], ['Cornus sanguinea'], ['Juniperus communis'], ['Sorbus aria'], ['Calamagrostis varia', 40], ['Carex alba', 10])

describe('metodyka 91Q0 – struktura', () => {
  it('kod bez gwiazdki, podtyp Pieniny/Tatry wymagany, transekt 200×10 m', () => {
    expect(habitatCode(m)).toBe('91Q0')
    expect(m.name).toMatch(/^Górskie reliktowe laski sosnowe/)
    const subtype = m.siteFields.find((f) => f.name === 'subtype')!
    expect(subtype.required).toBe(true)
    expect(subtype.kind === 'select' && subtype.options.map((o) => o.value)).toEqual(['91Q0-1', '91Q0-2'])
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('200x10 m')
    expect(subtypeOf({ subtype: '91Q0-2' })).toBe('91Q0-2')
    expect(subtypeOf({ subtype: 'x' })).toBeUndefined()
  })

  it('wskaźniki w kolejności tab. 2 przewodnika', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Gatunki charakterystyczne',
      'Obce gatunki inwazyjne',
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Struktura drzewostanu',
      'Gatunki obce w drzewostanie',
      'Naturalne odnowienie drzewostanu',
      'Pozyskanie drewna i inne przekształcenia związane z użytkowaniem',
      'Gatunki ciepłolubne w runie',
      'Zniszczenia mechaniczne',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
  })

  it('4 wskaźniki kardynalne: charakterystyczne, ekspansywne, struktura, obce w drzewostanie', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['characteristic', 'expansive', 'structure', 'alienTrees'])
  })

  it('zdjęcia fitosocjologiczne 3 × 25 m²', () => {
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('każde pole i wskaźnik ma wyjaśnienie dłuższe niż 60 znaków, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...m.otherFields, ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(60)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(60)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: ostrzeżenie poza czerwcem i lipcem', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2021-06-22')).toBeNull()
    expect(date.warn!('2021-07-27')).toBeNull()
    expect(date.warn!('2014-09-24')).toMatch(/czerwcem/)
  })

  it('kody oddziaływań bez duplikatów, z sukcesją i osuwiskiem', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    expect(codes).toEqual(expect.arrayContaining(['K02.01', 'L05', 'G05.01', 'X']))
  })
})

describe('metodyka 91Q0 – progi tab. 2', () => {
  it('gatunki charakterystyczne: >5 i dominują FV, 1–5 U1, brak U2', () => {
    expect(suggest('characteristic', six)).toBe('FV')
    expect(suggest('characteristic', { ...six, dominant: 'yes' })).toBe('FV')
    expect(suggest('characteristic', { ...six, dominant: 'no' })).toBe('U1')
    expect(suggest('characteristic', sp(['Pinus sylvestris', 30], ['Calamagrostis varia', 40]))).toBe('U1')
    expect(suggest('characteristic', sp())).toBe('U2')
  })

  it('gatunki charakterystyczne: drzewa obce ekologicznie nie liczą się i dają ostrzeżenie', () => {
    const i = sp(['Pinus sylvestris', 30], ['Cornus sanguinea'], ['Juniperus communis'], ['Sorbus aria'], ['Calamagrostis varia', 40], ['Fagus sylvatica', 10])
    expect(suggest('characteristic', i)).toBe('U1')
    expect(ind('characteristic').warn!(i)).toMatch(/Fagus sylvatica/)
    expect(ind('characteristic').warn!(sp(['Calamagrostis varia', 40]))).toMatch(/sosny/)
    expect(ind('characteristic').explain!(six)).toMatch(/6 \(z listy przewodnika: 6\)/)
  })

  it('obce inwazyjne: brak FV, pojedyncze 1 gatunku U1, łanowo lub >1 gatunek U2', () => {
    expect(suggest('invasive', sp())).toBe('FV')
    expect(suggest('invasive', { ...sp(['Impatiens parviflora', 0.5]), pattern: 'single' })).toBe('U1')
    expect(suggest('invasive', sp(['Impatiens parviflora', 0.5]))).toBe('U1')
    expect(suggest('invasive', { ...sp(['Impatiens parviflora', 1]), pattern: 'patch' })).toBe('U2')
    expect(suggest('invasive', sp(['Impatiens parviflora', 0.5], ['Solidago gigantea', 0.5]))).toBe('U2')
    expect(suggest('invasive', sp(['Solidago gigantea', 10]))).toBe('U2')
    expect(suggest('invasive', sp(['Solidago gigantea']))).toBeNull()
  })

  it('rodzime ekspansywne: brak FV, pojedyncze 1–2 gatunki U1, łanowo lub >2 gatunki U2', () => {
    expect(suggest('expansive', sp())).toBe('FV')
    expect(suggest('expansive', { ...sp(['Rubus idaeus'], ['Urtica dioica']), pattern: 'single' })).toBe('U1')
    expect(suggest('expansive', sp(['Rubus idaeus', 1], ['Urtica dioica', 1], ['Calamagrostis epigejos', 1]))).toBe('U2')
    expect(suggest('expansive', { ...sp(['Calamagrostis epigejos', 2]), pattern: 'patch' })).toBe('U2')
  })

  it('struktura drzewostanu z wyboru opisu, liczby trafiają do opisu', () => {
    expect(suggest('structure', { choice: 'diverse' })).toBe('FV')
    expect(suggest('structure', { choice: 'evenAged' })).toBe('U1')
    expect(suggest('structure', { choice: 'uniform' })).toBe('U2')
    expect(ind('structure').describe!({ choice: 'diverse', height: 6.5, dbh: '20–30', crown: 70 })).toBe(
      'Drzewostan zróżnicowany pod względem wysokości i pierśnicy drzew, średnia wysokość 6,5 m, pierśnica 20–30 cm, zwarcie koron 70%',
    )
  })

  it('gatunki obce w drzewostanie: brak FV, 1 gatunek U1, nasadzenia lub kilka w licznych populacjach U2', () => {
    expect(suggest('alienTrees', sp())).toBe('FV')
    expect(suggest('alienTrees', sp(['Fagus sylvatica', 25]))).toBe('U1')
    expect(suggest('alienTrees', { ...sp(['Fagus sylvatica', 5], ['Picea abies', 2]), abundance: 'single' })).toBe('U1')
    expect(suggest('alienTrees', { ...sp(['Fagus sylvatica', 20], ['Abies alba', 10], ['Picea abies', 5]), abundance: 'many' })).toBe('U2')
    expect(suggest('alienTrees', sp(['Fagus sylvatica', 5], ['Picea abies', 2]))).toBeNull()
    expect(suggest('alienTrees', { ...sp(['Larix decidua', 3]), planted: 'yes' })).toBe('U2')
    expect(ind('alienTrees').warn!(sp(['Pinus sylvestris', 50]))).toMatch(/właściwe/)
  })

  it('naturalne odnowienie: gorsza z ocen sosny i świerka (buka, jodły)', () => {
    expect(suggest('regeneration', { pine: 'diverse', invaders: 'none' })).toBe('FV')
    expect(suggest('regeneration', { pine: 'sporadic', invaders: 'none' })).toBe('U1')
    expect(suggest('regeneration', { pine: 'diverse', invaders: 'single' })).toBe('U1')
    expect(suggest('regeneration', { pine: 'diverse', invaders: 'intensive' })).toBe('U2')
    expect(suggest('regeneration', { pine: 'none', invaders: 'none' })).toBe('U2')
    expect(suggest('regeneration', { pine: 'diverse' })).toBeNull()
    expect(ind('regeneration').warn!({ ...sp(['Fagus sylvatica', 3]), pine: 'diverse', invaders: 'none' })).toMatch(/Fagus/)
  })

  it('pozyskanie: brak FV, pojedyncze działania U1, gospodarka leśna U2', () => {
    expect(suggest('logging', { choice: 'none' })).toBe('FV')
    expect(suggest('logging', { choice: 'single' })).toBe('U1')
    expect(suggest('logging', { choice: 'managed' })).toBe('U2')
  })

  it('gatunki ciepłolubne: z wyboru zestawu, ostrzeżenie przy ≤3 gatunkach', () => {
    const t = ind('thermophilous')
    expect(suggest('thermophilous', { choice: 'full' })).toBe('FV')
    expect(suggest('thermophilous', { choice: 'present' })).toBe('U1')
    expect(suggest('thermophilous', { choice: 'poor' })).toBe('U2')
    expect(t.warn!({ choice: 'present', ...sp(['Origanum vulgare', 1], ['Teucrium montanum', 2]) })).toMatch(/więcej niż 3/)
    expect(t.warn!({ choice: 'poor', ...sp(['Origanum vulgare'], ['Teucrium montanum'], ['Carlina acaulis'], ['Coronilla varia']) })).toMatch(/U2/)
    expect(t.warn!({ choice: 'full', ...sp(['Origanum vulgare'], ['Teucrium montanum'], ['Carlina acaulis'], ['Coronilla varia']) })).toBeNull()
  })

  it('zniszczenia mechaniczne: naturalne nie obniżają oceny, antropogeniczne wg progu 30%', () => {
    const t = ind('mechanical')
    expect(suggest('mechanical', { choice: 'none' })).toBe('FV')
    expect(suggest('mechanical', { choice: 'natural' })).toBe('FV')
    expect(suggest('mechanical', { choice: 'humanSmall' })).toBe('U1')
    expect(suggest('mechanical', { choice: 'humanLarge' })).toBe('U2')
    expect(t.warn!({ choice: 'humanSmall', share: 40 })).toMatch(/U2/)
    expect(t.warn!({ choice: 'humanLarge', share: 10 })).toMatch(/U1/)
    expect(t.warn!({ choice: 'humanSmall', share: 10 })).toBeNull()
  })
})

describe('katalog gatunków 91Q0', () => {
  it('rozpoznaje literówki z przewodnika i dopisek „sp.”', () => {
    expect(findSpecies91Q0('Cornus sanquinea')?.latin).toBe('Cornus sanguinea')
    expect(findSpecies91Q0('Popiela saxifraga')?.latin).toBe('Pimpinella saxifraga')
    expect(findSpecies91Q0('Rosa sp.')?.characteristic).toBe(true)
    expect(findSpecies91Q0('Fagus sylvatica')?.group).toBe('eco-alien')
    expect(CHARACTERISTIC_91Q0).toContain('Calamagrostis varia')
  })

  it('własne (spoza katalogu) gatunki liczą się do charakterystycznych, obce ekologicznie nie', () => {
    const s = characteristicSummary(sp(['Pinus sylvestris'], ['Gatunek własny'], ['Picea abies']).species)
    expect(s.counted).toEqual(['Pinus sylvestris', 'Gatunek własny'])
    expect(s.fromCatalog).toEqual(['Pinus sylvestris'])
    expect(s.foreign).toEqual(['Picea abies'])
  })
})

describe('przykład Macelowa Góra (karta z przewodnika)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(macelowaGora)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny parametrów jak w karcie: wszystko FV', () => {
    const a = assessCard(m, macelowaGora)
    expect(a.area).toBe('FV')
    expect(a.structure).toBe('FV')
    expect(a.overall).toBe('FV')
  })

  it('podpowiedzi zgodne z kartą poza odnowieniem (świerk „miejscami dość licznie”)', () => {
    const differs = m.indicators
      .filter((i) => i.suggest!(macelowaGora.indicators[i.id].inputs, { site: macelowaGora.site }) !== macelowaGora.indicators[i.id].grade)
      .map((i) => i.id)
    expect(differs).toEqual(['regeneration'])
  })

  it('zanonimizowany wykonawca, podtyp Pieniny, trzy zdjęcia', () => {
    expect(examples91Q0).toHaveLength(1)
    expect(macelowaGora.site.observer).toBe('Jan Kowalski')
    expect(macelowaGora.site.subtype).toBe('91Q0-1')
    expect(macelowaGora.releves).toHaveLength(3)
  })
})
