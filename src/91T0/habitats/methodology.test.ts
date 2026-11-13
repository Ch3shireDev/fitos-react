import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { Grade, InputValues } from '../../7120/habitats/types'
import { borChrobotkowy, examples91T0 } from './examples'
import { gradeRatio, groundRatio, indicator91T0 as ind, methodology91T0 as m } from './methodology'
import { CHARACTERISTIC_91T0, characteristicSummary, findSpecies91T0 } from './species'

const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, { site: {} })
const sp = (...rows: [string, number?][]) => ({ species: rows.map(([name, cover]) => ({ name, cover })) })

describe('metodyka 91T0 – struktura', () => {
  it('kod bez gwiazdki, transekt 200×10 m, zdjęcia 3 × 100 m²', () => {
    expect(habitatCode(m)).toBe('91T0')
    expect(m.name).toMatch(/^Śródlądowy bór chrobotkowy/)
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('200x10 m')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(100)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('13 wskaźników struktury w kolejności tab. 2 + powierzchnia', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Charakterystyczna kombinacja florystyczna',
      'Udział procentowy siedliska na transekcie',
      'Obce gatunki inwazyjne',
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Występowanie i stan populacji chrobotków',
      'Stosunek pokrycia chrobotków do mchów i roślin naczyniowych',
      'Wiek drzewostanu',
      'Obecność drewna martwego w dnie lasu',
      'Gatunki obce w drzewostanie',
      'Naturalne odnowienie drzewostanu',
      'Obecność nasadzeń drzew',
      'Pozyskanie drewna i inne przekształcenia związane z użytkowaniem',
      'Zniszczenia drzewostanów – wiatrołomy, gradacje owadów',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
    expect(new Set(m.indicators.map((i) => i.id)).size).toBe(m.indicators.length)
  })

  it('4 wskaźniki kardynalne (wiek drzewostanu bez statusu kardynalnego – jak w monitoringu 2021)', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['characteristic', 'cladonia', 'ratio', 'deadWood'])
  })

  it('każde pole i wskaźnik ma wyjaśnienie dłuższe niż 60 znaków, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...m.otherFields, ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(60)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(60)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: ostrzeżenie poza kwietniem–październikiem', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2021-05-07')).toBeNull()
    expect(date.warn!('2014-10-31')).toBeNull()
    expect(date.warn!('2021-12-10')).toMatch(/poza optymalnym/)
  })

  it('kody oddziaływań bez duplikatów, z eutrofizacją i zanieczyszczeniem powietrza', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    expect(codes).toEqual(expect.arrayContaining(['B02.06', 'F04.02', 'H04', 'K02.01', 'K02.03', 'X']))
  })
})

describe('metodyka 91T0 – progi tab. 2', () => {
  it('kombinacja florystyczna: % z 10 gatunków – ≥80 FV, 50–79 U1, <50 U2', () => {
    const eight = sp(...CHARACTERISTIC_91T0.slice(0, 8).map((n): [string] => [n]))
    expect(suggest('characteristic', eight)).toBe('FV')
    expect(suggest('characteristic', sp(...CHARACTERISTIC_91T0.slice(0, 6).map((n): [string] => [n])))).toBe('U1')
    // luka 50–59% → U1 (interpretacja)
    expect(suggest('characteristic', sp(...CHARACTERISTIC_91T0.slice(0, 5).map((n): [string] => [n])))).toBe('U1')
    expect(suggest('characteristic', sp(['Pinus sylvestris'], ['Cladonia gracilis']))).toBe('U2')
    expect(suggest('characteristic', sp())).toBeNull()
  })

  it('kombinacja florystyczna: podgatunki chrobotka leśnego liczą się raz, gatunki spoza listy nie', () => {
    const s = characteristicSummary(
      sp(['Cladonia arbuscula subsp. squarrosa'], ['Cladonia arbuscula subsp. mitis'], ['Cladonia stellaris'], ['Pinus sylvestris']).species,
    )
    expect(s.present).toEqual(['Pinus sylvestris', 'Cladonia arbuscula'])
    expect(s.percent).toBe(20)
    expect(s.extra).toEqual(['Cladonia stellaris'])
  })

  it('kombinacja florystyczna: ostrzeżenie o gatunkach obcych na liście', () => {
    expect(ind('characteristic').warn!(sp(['Pinus sylvestris'], ['Padus serotina']))).toMatch(/Padus serotina/)
  })

  it('udział na transekcie: ≥70 FV, 30–69 U1, <30 U2', () => {
    expect(suggest('share', { value: 70 })).toBe('FV')
    expect(suggest('share', { value: 50 })).toBe('U1')
    expect(suggest('share', { value: 40 })).toBe('U1')
    expect(suggest('share', { value: 29 })).toBe('U2')
  })

  it('obce inwazyjne i obce w drzewostanie: brak FV, nieliczne U1, liczne U2 (bez liczebności próg 5%)', () => {
    for (const id of ['invasive', 'alienTrees']) {
      expect(suggest(id, sp())).toBe('FV')
      expect(suggest(id, { ...sp(['Quercus rubra', 20]), abundance: 'few' })).toBe('U1')
      expect(suggest(id, { ...sp(['Quercus rubra', 1]), abundance: 'many' })).toBe('U2')
      expect(suggest(id, sp(['Padus serotina', 2]))).toBe('U1')
      expect(suggest(id, sp(['Padus serotina', 6]))).toBe('U2')
      expect(suggest(id, sp(['Padus serotina']))).toBeNull()
    }
  })

  it('rodzime ekspansywne: łączne pokrycie ≤10 FV, ≤20 U1, >20 U2', () => {
    expect(suggest('expansive', sp())).toBe('FV')
    expect(suggest('expansive', sp(['Deschampsia flexuosa', 10]))).toBe('FV')
    expect(suggest('expansive', sp(['Deschampsia flexuosa', 30]))).toBe('U2')
    expect(suggest('expansive', sp(['Deschampsia flexuosa', 10], ['Calamagrostis epigejos', 5]))).toBe('U1')
    expect(ind('expansive').warn!(sp(['Calluna vulgaris', 3]))).toMatch(/charakterystyczne, nie ekspansywne/)
    expect(ind('expansive').warn!(sp(['Campylopus introflexus', 3]))).toMatch(/obce geograficznie/)
  })

  it('chrobotki: gorsza z ocen kondycji plech i zwartości runa, ostrzeżenie przy płucnicy kolczastej', () => {
    expect(suggest('cladonia', { thallus: 'good', carpet: 'dense' })).toBe('FV')
    expect(suggest('cladonia', { thallus: 'good', carpet: 'patchy' })).toBe('U1')
    expect(suggest('cladonia', { thallus: 'poor', carpet: 'patchy' })).toBe('U2')
    expect(suggest('cladonia', { thallus: 'good' })).toBeNull()
    expect(ind('cladonia').warn!({ thallus: 'good', carpet: 'dense', ...sp(['Cladonia gracilis', 30], ['Cetraria aculeata', 1]) })).toMatch(/płucnica kolczasta/)
    expect(ind('cladonia').warn!({ thallus: 'good', carpet: 'dense', ...sp(['Cladonia arbuscula', 90], ['Cladonia gracilis', 5]) })).toMatch(/Jeden gatunek/)
  })

  it('stosunek pokrycia: udziały w runie, gorsza z ocen (porosty+mchy) i (same porosty)', () => {
    expect(groundRatio({ lichens: 60, mosses: 30, vascular: 10 })).toEqual({ cryptogams: 90, lichens: 60 })
    expect(groundRatio({ lichens: 0, mosses: 0, vascular: 0 })).toBeUndefined()
    expect(suggest('ratio', { lichens: 60, mosses: 30, vascular: 10 })).toBe('FV')
    expect(suggest('ratio', { lichens: 95, mosses: 0, vascular: 5 })).toBe('FV') // porosty >90% – interpretacja
    expect(suggest('ratio', { lichens: 30, mosses: 60, vascular: 10 })).toBe('U2') // mszaki zamiast porostów
    expect(suggest('ratio', { lichens: 50, mosses: 25, vascular: 25 })).toBe('U1')
    expect(suggest('ratio', { lichens: 50, mosses: 5, vascular: 45 })).toBe('U2')
    expect(gradeRatio({ cryptogams: 85, lichens: 70 })).toBe('U1') // luka 80–89% – interpretacja
    expect(ind('ratio').describe!({ lichens: 75, mosses: 5, vascular: 20 })).toMatch(/^80\/20, w tym porosty 75%/)
  })

  it('wiek drzewostanu: >90 FV, 50–90 U1, <50 U2', () => {
    expect(suggest('age', { value: 121 })).toBe('FV')
    expect(suggest('age', { value: 90 })).toBe('U1')
    expect(suggest('age', { value: 50 })).toBe('U1')
    expect(suggest('age', { value: 49 })).toBe('U2')
    expect(ind('age').describe!({ value: 121, oldShare: 80 })).toBe('121 lat, udział starodrzewu 80%')
  })

  it('martwe drewno: brak FV, naturalny opad U1, stosy gałęzi U2', () => {
    expect(suggest('deadWood', { choice: 'none' })).toBe('FV')
    expect(suggest('deadWood', { choice: 'little' })).toBe('U1')
    expect(suggest('deadWood', { choice: 'much' })).toBe('U2')
  })

  it('odnowienie: małe ilości FV, brak lub liczne U1, bardzo liczne U2; ostrzeżenia', () => {
    expect(suggest('regeneration', { choice: 'few' })).toBe('FV')
    expect(suggest('regeneration', { choice: 'none' })).toBe('U1')
    expect(suggest('regeneration', { choice: 'many' })).toBe('U1')
    expect(suggest('regeneration', { choice: 'veryMany' })).toBe('U2')
    expect(ind('regeneration').warn!({ choice: 'none', ...sp(['Pinus sylvestris', 2]) })).toMatch(/całkowity brak/)
    expect(ind('regeneration').warn!({ choice: 'few', ...sp(['Pinus sylvestris', 20]) })).toMatch(/do ok. 10%/)
  })

  it('nasadzenia, użytkowanie, zniszczenia drzewostanu: z wyboru opisu', () => {
    expect(suggest('plantings', { choice: 'none' })).toBe('FV')
    expect(suggest('plantings', { choice: 'few' })).toBe('U1')
    expect(suggest('plantings', { choice: 'many' })).toBe('U2')
    expect(suggest('logging', { choice: 'weak' })).toBe('FV')
    expect(suggest('logging', { choice: 'strong' })).toBe('U2')
    expect(suggest('standDamage', { choice: 'medium' })).toBe('U1')
    expect(suggest('standDamage', { choice: 'intense' })).toBe('U2')
  })
})

describe('katalog gatunków 91T0', () => {
  it('rozpoznaje podgatunki, synonimy i literówki z przewodnika', () => {
    expect(findSpecies91T0('Cladonia arbuscula subsp. squarrosa')?.latin).toBe('Cladonia arbuscula')
    expect(findSpecies91T0('Cladonia furiata')?.latin).toBe('Cladonia furcata')
    expect(findSpecies91T0('Pinus silvestris')?.latin).toBe('Pinus sylvestris')
    expect(findSpecies91T0('Prunus serotina')?.group).toBe('invasive')
    expect(findSpecies91T0('Vaccnium myrtillus')?.characteristic).toBe(true)
    expect(findSpecies91T0('Gatunek własny')).toBeUndefined()
  })

  it('lista kombinacji charakterystycznej ma 10 gatunków, porosty i mszaki trafiają do warstwy D', () => {
    expect(CHARACTERISTIC_91T0).toHaveLength(10)
    const layerOf = (n: string) => m.speciesCatalog!.find((c) => c.value === n)?.layer
    expect(layerOf('Cladonia rangiferina')).toBe('D')
    expect(layerOf('Pleurozium schreberi')).toBe('D')
    expect(layerOf('Pinus sylvestris')).toBe('A')
    expect(m.speciesInfo!('Cladonia gracilis')).toBe('porost naziemny, z kombinacji charakterystycznej')
  })
})

describe('przykład Bór Chrobotkowy (karta z przewodnika)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(borChrobotkowy)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny parametrów jak w karcie: wszystko FV', () => {
    const a = assessCard(m, borChrobotkowy)
    expect(a.area).toBe('FV')
    expect(a.structure).toBe('FV')
    expect(a.overall).toBe('FV')
  })

  it('podpowiedzi różnią się od eksperta tylko w trzech miejscach opisanych w examples.ts', () => {
    const differs = m.indicators
      .filter((i) => i.suggest!(borChrobotkowy.indicators[i.id].inputs, { site: borChrobotkowy.site }) !== borChrobotkowy.indicators[i.id].grade)
      .map((i) => i.id)
    expect(differs).toEqual(['characteristic', 'ratio', 'regeneration'])
  })

  it('zanonimizowany wykonawca, trzy zdjęcia z chrobotkami w warstwie D', () => {
    expect(examples91T0).toHaveLength(1)
    expect(borChrobotkowy.site.observer).toBe('Jan Kowalski')
    expect(borChrobotkowy.releves).toHaveLength(3)
    const d = (borChrobotkowy.releves[0].species as { layer: string; name: string }[]).filter((r) => r.layer === 'D')
    expect(d.map((r) => r.name)).toContain('Cladonia gracilis')
  })
})
