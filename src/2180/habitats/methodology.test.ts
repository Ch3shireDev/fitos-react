import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { Grade, InputValues } from '../../7120/habitats/types'
import { bialogora, examples2180 } from './examples'
import { EMPETRUM_MIN_COVER, gradeDeadWood, gradeGeoAlien, gradeOldTrees, indicator2180 as ind, methodology2180 as m } from './methodology'
import { characteristicOf, characteristicSummary, findSpecies2180, variantOf } from './species'

const EMPETRO = { site: { variant: 'empetro' } }
const BETULO = { site: { variant: 'betulo' } }
const suggest = (id: string, inputs: InputValues, ctx = EMPETRO): Grade | null => ind(id).suggest!(inputs, ctx)
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => ({ name, cover }))

describe('metodyka 2180 – struktura', () => {
  it('kod bez gwiazdki, transekt 200×10 m, zdjęcia 3 × 100 m², wybór zbiorowiska w stanowisku', () => {
    expect(habitatCode(m)).toBe('2180')
    expect(m.name).toBe('Lasy mieszane i bory na wydmach nadmorskich')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('200x10 m')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(100)
    expect(emptyCardValues(m).releves).toHaveLength(3)
    const variant = m.siteFields.find((f) => f.name === 'variant')!
    expect(variant.kind === 'select' && variant.options.map((o) => o.value)).toEqual(['empetro', 'betulo'])
  })

  it('9 wskaźników struktury w kolejności tab. 2 + powierzchnia', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Gatunki charakterystyczne',
      'Gatunki dominujące w poszczególnych warstwach fitocenozy',
      'Obce gatunki inwazyjne w podszycie i runie',
      'Struktura wiekowa',
      'Gatunki obce ekologicznie w drzewostanie',
      'Gatunki obce geograficznie w drzewostanie i podroście',
      'Martwe drewno (łączne zasoby)',
      'Naturalne odnowienie drzewostanu',
      'Inne zniekształcenia, w tym zniszczenia runa i gleby związane z pozyskaniem drewna',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
    expect(new Set(m.indicators.map((i) => i.id)).size).toBe(m.indicators.length)
  })

  it('2 wskaźniki kardynalne (tab. 2), obce ekologicznie poza oceną struktury (praktyka od 2018 r.)', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['characteristic', 'geoAlien'])
    expect(m.indicators.filter((i) => isExcluded(i, {})).map((i) => i.id)).toEqual(['ecoAlien'])
  })

  it('każde pole i wskaźnik ma wyjaśnienie dłuższe niż 60 znaków, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...m.otherFields, ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(60)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(60)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: ostrzeżenie poza czerwcem–wrześniem', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2024-06-20')).toBeNull()
    expect(date.warn!('2024-09-30')).toBeNull()
    expect(date.warn!('2013-10-19')).toMatch(/poza optymalnym/)
  })

  it('kody oddziaływań bez duplikatów, z morzem, turystyką i usuwaniem martwego drewna', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    expect(codes).toEqual(expect.arrayContaining(['B02.04', 'B02.05', 'G01.02', 'H05.01', 'I01', 'K01.01', 'L07', 'M01.07', 'U', 'X']))
  })
})

describe('metodyka 2180 – progi tab. 2', () => {
  it('powierzchnia: z wyboru opisu', () => {
    expect(suggest('area', { choice: 'stable' })).toBe('FV')
    expect(suggest('area', { choice: 'slight' })).toBe('U1')
    expect(suggest('area', { choice: 'decline' })).toBe('U2')
  })

  it('gatunki charakterystyczne: z wyboru opisu; w borze bażynowym FV tylko z bażyną ≥ st. 2 B-B (≥5%)', () => {
    const withEmpetrum = (cover?: number) => ({ species: sp(['Empetrum nigrum', cover], ['Carex arenaria', 2]), choice: 'full' })
    expect(suggest('characteristic', withEmpetrum(15))).toBe('FV')
    expect(suggest('characteristic', withEmpetrum(EMPETRUM_MIN_COVER))).toBe('FV')
    expect(suggest('characteristic', withEmpetrum(2.5))).toBe('U1')
    expect(suggest('characteristic', { species: sp(['Carex arenaria', 2]), choice: 'full' })).toBe('U1')
    // bez pokrycia bażyny – nie obniżamy, tylko prosimy o pokrycie
    expect(suggest('characteristic', withEmpetrum())).toBe('FV')
    expect(ind('characteristic').explain!(withEmpetrum(), EMPETRO)).toMatch(/bez pokrycia/)
    // las brzozowo-dębowy – bażyna nie jest warunkiem
    expect(suggest('characteristic', { species: sp(['Quercus robur', 40]), choice: 'full' }, BETULO)).toBe('FV')
    expect(suggest('characteristic', { species: [], choice: 'most' })).toBe('U1')
    expect(suggest('characteristic', { species: [], choice: 'poor' })).toBe('U2')
    expect(suggest('characteristic', { species: sp(['Empetrum nigrum', 15]) })).toBeNull()
  })

  it('gatunki dominujące: z wyboru opisu, ostrzeżenie przy obcym dominancie', () => {
    expect(suggest('dominant', { choice: 'natural' })).toBe('FV')
    expect(suggest('dominant', { choice: 'partly' })).toBe('U1')
    expect(suggest('dominant', { choice: 'foreign' })).toBe('U2')
    expect(ind('dominant').warn!({ species: sp(['Pinus nigra', 40]), choice: 'natural' }, EMPETRO)).toMatch(/Pinus nigra/)
    expect(ind('dominant').warn!({ species: sp(['Fagus sylvatica', 30]), choice: 'natural' }, EMPETRO)).toMatch(/Fagus/)
    expect(ind('dominant').warn!({ species: sp(['Pinus sylvestris', 60]), choice: 'natural' }, EMPETRO)).toBeNull()
  })

  it('obce inwazyjne: brak FV, pojedyncze egzemplarze 1 gatunku U1, >1 gatunek albo ekspansja U2', () => {
    expect(suggest('invasive', { species: [] })).toBe('FV')
    expect(suggest('invasive', { species: sp(['Padus serotina', 0.5]) })).toBe('U1')
    expect(suggest('invasive', { species: sp(['Padus serotina', 0.5]), expansion: 'yes' })).toBe('U2')
    expect(suggest('invasive', { species: sp(['Padus serotina', 5]), expansion: 'no' })).toBe('U1')
    expect(suggest('invasive', { species: sp(['Padus serotina', 5]) })).toBe('U2')
    expect(suggest('invasive', { species: sp(['Padus serotina', 0.5], ['Rosa rugosa', 0.5]), expansion: 'no' })).toBe('U2')
    expect(suggest('invasive', { species: sp(['Padus serotina']) })).toBeNull()
  })

  it('struktura wiekowa: drzewa stare ≥10% FV, obecne U1, brak U2', () => {
    expect(gradeOldTrees(100)).toBe('FV')
    expect(gradeOldTrees(10)).toBe('FV')
    expect(gradeOldTrees(5)).toBe('U1')
    expect(gradeOldTrees(0)).toBe('U2')
    expect(suggest('age', { oldShare: 30 })).toBe('FV')
  })

  it('obce ekologicznie: <10 FV, 10–50 U1, >50 U2', () => {
    expect(suggest('ecoAlien', { species: [] })).toBe('FV')
    expect(suggest('ecoAlien', { species: sp(['Fagus sylvatica', 5]) })).toBe('FV')
    expect(suggest('ecoAlien', { species: sp(['Fagus sylvatica', 50]) })).toBe('U1')
    expect(suggest('ecoAlien', { species: sp(['Fagus sylvatica', 60]) })).toBe('U2')
  })

  it('obce geograficznie: <1% FV, 1–10% U1, >10% albo silne odnawianie U2', () => {
    expect(gradeGeoAlien(0.5)).toBe('FV')
    expect(gradeGeoAlien(1)).toBe('U1')
    expect(gradeGeoAlien(10)).toBe('U1')
    expect(gradeGeoAlien(11)).toBe('U2')
    expect(suggest('geoAlien', { species: [] })).toBe('FV')
    expect(suggest('geoAlien', { species: sp(['Pinus nigra', 0.5]), regenerating: 'strong' })).toBe('U2')
    expect(suggest('geoAlien', { species: sp(['Pinus mugo', 5]) })).toBe('U1')
    expect(ind('geoAlien').warn!({ species: sp(['Pinus sylvestris', 5]) }, EMPETRO)).toMatch(/rodzime/)
  })

  it('martwe drewno: >5 m³/ha FV, mniej U1, brak U2; liczba ma pierwszeństwo', () => {
    expect(gradeDeadWood(6)).toBe('FV')
    expect(gradeDeadWood(5)).toBe('U1')
    expect(gradeDeadWood(0)).toBe('U2')
    expect(suggest('deadWood', { choice: 'below' })).toBe('U1')
    expect(suggest('deadWood', { choice: 'none', volume: 8 })).toBe('FV')
    expect(ind('deadWood').warn!({ choice: 'none', volume: 8 }, EMPETRO)).toMatch(/Ponad 5/)
  })

  it('odnowienie i zniekształcenia: z wyboru opisu', () => {
    expect(suggest('regeneration', { choice: 'abundant' })).toBe('FV')
    expect(suggest('regeneration', { choice: 'single' })).toBe('U1')
    expect(suggest('regeneration', { choice: 'none' })).toBe('U2')
    expect(suggest('distortions', { choice: 'none' })).toBe('FV')
    expect(suggest('distortions', { choice: 'minor' })).toBe('U1')
    expect(suggest('distortions', { choice: 'strong' })).toBe('U2')
  })
})

describe('katalog gatunków 2180', () => {
  it('rozpoznaje synonimy z przewodnika i grupy', () => {
    expect(findSpecies2180('Molinia coerulea')?.latin).toBe('Molinia caerulea')
    expect(findSpecies2180('Lathyrus montanus')?.latin).toBe('Lathyrus linifolius')
    expect(findSpecies2180('Picea excelsa')?.group).toBe('alien')
    expect(findSpecies2180('Prunus serotina')?.group).toBe('alien')
    expect(findSpecies2180('Reynoutria x bohemica')?.group).toBe('alien')
    expect(findSpecies2180('Empetrum nigrum')?.core).toBe(true)
    expect(findSpecies2180('Gatunek własny')).toBeUndefined()
  })

  it('osobne listy dla boru bażynowego i lasu brzozowo-dębowego', () => {
    expect(characteristicOf('empetro')).toEqual(
      expect.arrayContaining(['Empetrum nigrum', 'Carex arenaria', 'Goodyera repens', 'Moneses uniflora']),
    )
    expect(characteristicOf('betulo')).toEqual(expect.arrayContaining(['Quercus robur', 'Lonicera periclymenum', 'Luzula pilosa']))
    expect(characteristicOf('betulo')).not.toContain('Empetrum nigrum')
    const s = characteristicSummary(sp(['Empetrum nigrum', 10], ['Quercus robur', 5]), 'empetro')
    expect(s.present).toEqual(['Empetrum nigrum'])
    expect(variantOf({ variant: 'nope' })).toBeUndefined()
    expect(m.speciesInfo!('Empetrum nigrum')).toMatch(/Empetro nigri-Pinetum \(gatunek kluczowy\)/)
    expect(m.speciesCatalog!.find((c) => c.value === 'Hylocomium splendens')?.layer).toBe('D')
  })
})

describe('przykład Białogóra (karta z przewodnika)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(bialogora)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny parametrów jak w karcie: powierzchnia, struktura i perspektywy FV', () => {
    const a = assessCard(m, bialogora)
    expect(a.area).toBe('FV')
    expect(a.structure).toBe('FV')
    expect(a.prospects).toBe('FV')
    // karta z przewodnika ma ocenę ogólną U1 (20% FV / 80% U1 powierzchni) wbrew tab. 2 – formularz liczy FV
    expect(a.overall).toBe('FV')
    expect(bialogora.overallComment).toMatch(/FV 20%, U1 80%/)
    expect(a.missing).toEqual([])
  })

  it('podpowiedzi formularza zgadzają się z ocenami z karty we wszystkich ocenianych wskaźnikach', () => {
    const differs = m.indicators
      .filter((i) => !isExcluded(i, bialogora.site))
      .filter((i) => i.suggest!(bialogora.indicators[i.id].inputs, { site: bialogora.site }) !== bialogora.indicators[i.id].grade)
      .map((i) => i.id)
    expect(differs).toEqual([])
    expect(bialogora.indicators.deadWood.grade).toBe('U1')
    expect(bialogora.indicators.regeneration.grade).toBe('U1')
  })

  it('zanonimizowany wykonawca, trzy zdjęcia z bażyną w warstwie C', () => {
    expect(examples2180).toHaveLength(1)
    expect(bialogora.site.observer).toBe('Jan Kowalski')
    expect(bialogora.releves).toHaveLength(3)
    for (const r of bialogora.releves) {
      const c = (r.species as { layer: string; name: string }[]).filter((x) => x.layer === 'C').map((x) => x.name)
      expect(c).toContain('Empetrum nigrum')
    }
  })
})
