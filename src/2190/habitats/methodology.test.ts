import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { Grade, IndicatorContext, InputValues } from '../../7120/habitats/types'
import { examples2190, madwiny1 } from './examples'
import {
  SPECIES_FV_MIN_2190,
  gradeCharacteristic2190,
  gradeExpansive2190,
  gradePatches2190,
  gradeShrubs2190,
  gradeTrees2190,
  indicator2190 as ind,
  methodology2190 as m,
  subtypeOf2190,
} from './methodology'
import { findSpecies2190, isCharacteristic2190, isExpansive2190, isStronglyExpansive2190 } from './species'

const ctx = (site: InputValues = {}): IndicatorContext => ({ site })
const suggest = (id: string, inputs: InputValues, site: InputValues = { subtype: '1' }): Grade | null => ind(id).suggest!(inputs, ctx(site))
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => ({ name, cover }))

describe('metodyka 2190 – struktura', () => {
  it('kod 2190 (nie priorytetowe), transekt 200 m, 3 zdjęcia po 100 m²', () => {
    expect(habitatCode(m)).toBe('2190')
    expect(m.name).toBe('Wilgotne zagłębienia międzywydmowe')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('10x200 m')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(100)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności tab. 1', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Gatunki charakterystyczne i wyróżniające',
      'Gatunki dominujące',
      'Obce gatunki inwazyjne',
      'Gatunki ekspansywne',
      'Obecność nalotu i podrostu drzew',
      'Obecność krzewów i krzewinek',
      'Udział dobrze zachowanych płatów siedliska',
      'Pionowa struktura roślinności',
      'Występowanie procesów eolicznych',
    ])
  })

  it('kardynalne: gatunki charakterystyczne, krzewy i krzewinki, dobrze zachowane płaty; nic pominiętego', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['species', 'shrubs', 'patches'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('podtyp 1–7 w stanowisku, wymagany', () => {
    const f = m.siteFields.find((x) => x.name === 'subtype')!
    expect(f.kind === 'select' && f.options.map((o) => o.value)).toEqual(['1', '2', '3', '4', '5', '6', '7'])
    expect(f.required).toBe(true)
    expect(subtypeOf2190({ subtype: '6' })).toBe('6')
    expect(subtypeOf2190({ subtype: '8' })).toBeUndefined()
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...m.otherFields, ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: lipiec–sierpień, poza nim ostrzeżenie', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2024-07-18')).toBeNull()
    expect(date.warn!('2024-08-23')).toBeNull()
    expect(date.warn!('2013-09-03')).toMatch(/poza optymalnym/)
    expect(date.warn!('2018-06-30')).toMatch(/poza optymalnym/)
  })

  it('kody oddziaływań bez duplikatów, z sukcesją, osuszaniem, zalesianiem i turystyką', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['K02', 'K01', 'K02.01', 'J02', 'J02.01.02', 'B01', 'G01.02', 'I01', 'I02', 'X']) expect(codes).toContain(c)
  })
})

describe('metodyka 2190 – słownik gatunków', () => {
  it('gatunki charakterystyczne przypisane do podtypów z tab. 1, z synonimami', () => {
    expect(isCharacteristic2190('Juncus articulatus', '1')).toBe(true)
    expect(isCharacteristic2190('Juncus articulatus ssp. litoralis', '1')).toBe(true)
    expect(isCharacteristic2190('Areneria serpyllifolia', '1')).toBe(true)
    expect(isCharacteristic2190('Erica tetralix', '1')).toBe(false)
    expect(isCharacteristic2190('Erica tetralix')).toBe(true)
    expect(isCharacteristic2190('Oxycoccus palustris', '2')).toBe(true)
    expect(isCharacteristic2190('Carex canescens', '3')).toBe(true)
    expect(isCharacteristic2190('Drosera x obovata', '2')).toBe(true)
    expect(isCharacteristic2190('Eriophorum angustifolium', '6')).toBe(true)
    expect(isCharacteristic2190('Molinia caerulea', '6')).toBe(true)
    expect(findSpecies2190('Polytrichum commune var. perigoniale')?.moss).toBe(true)
  })

  it('trzęślica silnie ekspansywna wszędzie poza podtypem 6; trzcina zawsze', () => {
    expect(isStronglyExpansive2190('Molinia caerulea', '2')).toBe(true)
    expect(isStronglyExpansive2190('Molinia caerulea', '6')).toBe(false)
    expect(isStronglyExpansive2190('Phragmites australis', '6')).toBe(true)
    expect(isStronglyExpansive2190('Salix caprea', '1')).toBe(false)
    expect(isExpansive2190('Salix caprea', '1')).toBe(true)
    expect(isExpansive2190('Calamagrostis canescens', '5')).toBe(false)
  })
})

describe('metodyka 2190 – progi', () => {
  it('gatunki charakterystyczne: próg FV wg podtypu, U1 od 3, U2 przy 2 lub mniej', () => {
    expect(SPECIES_FV_MIN_2190).toEqual({ '1': 5, '2': 5, '3': 5, '4': 5, '5': 5, '6': 4, '7': 4 })
    expect([6, 5, 4, 3, 2, 0].map((n) => gradeCharacteristic2190(n, '1'))).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
    expect([4, 3, 2].map((n) => gradeCharacteristic2190(n, '6'))).toEqual(['FV', 'U1', 'U2'])
    expect(gradeCharacteristic2190(4, '2')).toBe('U1')
  })

  it('gatunki charakterystyczne: liczy z listy dla podtypu, bez podtypu – brak podpowiedzi', () => {
    const species = sp(['Agrostis stolonifera', 15], ['Juncus articulatus', 40], ['Juncus balticus', 5], ['Juncus bulbosus'], ['Erica tetralix', 25])
    expect(suggest('species', { species })).toBe('U1')
    expect(suggest('species', { species: [...species, { name: 'Pohlia nutans' }] })).toBe('FV')
    expect(suggest('species', { species }, {})).toBeNull()
    expect(ind('species').explain!({ species }, ctx({})) ?? '').toMatch(/Wybierz podtyp/)
    expect(ind('species').warn!({ species }, ctx({ subtype: '1' }))).toMatch(/Erica tetralix/)
    // odmiana i forma typowa liczone raz
    expect(suggest('species', { species: sp(['Polytrichum commune'], ['Polytrichum commune var. perigoniale'], ['Juncus articulatus'], ['Juncus articulatus subsp. litoralis']) })).toBe('U2')
    // liczba wpisana ręcznie ma pierwszeństwo
    expect(suggest('species', { species, count: 6 })).toBe('FV')
    expect(suggest('species', { species: sp(['Myrica gale'], ['Molinia caerulea'], ['Carex nigra'], ['Sphagnum inundatum']) }, { subtype: '6' })).toBe('FV')
  })

  it('gatunki dominujące: ekspansywne/obce/drzewa U2, >50% w warstwach naczyniowych U1, mchy się nie liczą', () => {
    expect(suggest('dominants', { species: sp(['Juncus articulatus', 40], ['Erica tetralix', 25], ['Polytrichum commune var. perigoniale', 75]) })).toBe('FV')
    expect(suggest('dominants', { species: sp(['Juncus articulatus', 60]) })).toBe('U1')
    expect(suggest('dominants', { species: sp(['Juncus articulatus', 40], ['Molinia caerulea', 30]) })).toBe('U2')
    expect(suggest('dominants', { species: sp(['Myrica gale', 60], ['Molinia caerulea', 30]) }, { subtype: '6' })).toBe('U1')
    expect(suggest('dominants', { species: sp(['Pinus sylvestris', 60]) })).toBe('U2')
    expect(suggest('dominants', { species: sp(['Carex flava', 20]) })).toBe('U1')
    expect(suggest('dominants', { species: [] })).toBeNull()
  })

  it('obce: pojedyncze o niskiej inwazyjności FV, pokrycie ≤5% U1, >5% U2; silnie inwazyjne surowiej', () => {
    expect(suggest('aliens', { species: [], amount: 'none' })).toBe('FV')
    expect(suggest('aliens', { species: sp(['Juncus tenuis']), amount: 'single' })).toBe('FV')
    expect(suggest('aliens', { species: sp(['Juncus tenuis', 2]), amount: 'more' })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Juncus tenuis', 5]), amount: 'more' })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Juncus tenuis', 6]), amount: 'more' })).toBe('U2')
    expect(suggest('aliens', { species: sp(['Prunus serotina']), amount: 'single' })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Prunus serotina', 1]), amount: 'more' })).toBe('U2')
    expect(suggest('aliens', { species: [], value: 0 })).toBe('FV')
    expect(suggest('aliens', { species: [] })).toBeNull()
    expect(ind('aliens').warn!({ species: sp(['Erica tetralix']) }, ctx())).toMatch(/rodzime/)
  })

  it('ekspansywne: >50% U2, silnie ekspansywny U1, reszta <20% FV', () => {
    expect([gradeExpansive2190(60, 0), gradeExpansive2190(50, 1), gradeExpansive2190(19, 0), gradeExpansive2190(20, 0), gradeExpansive2190(undefined, 1), gradeExpansive2190(undefined, 0)]).toEqual([
      'U2',
      'U1',
      'FV',
      'U1',
      'U1',
      null,
    ])
    expect(suggest('expansive', { species: sp(['Salix caprea'], ['Calamagrostis canescens'], ['Phragmites australis']) })).toBe('U1')
    expect(suggest('expansive', { species: sp(['Salix caprea', 5], ['Calamagrostis canescens', 5]) })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Molinia caerulea', 60]) })).toBe('U2')
    expect(suggest('expansive', { species: sp(['Molinia caerulea', 15]) }, { subtype: '6' })).toBe('FV')
    expect(suggest('expansive', { species: [], value: 0 })).toBe('FV')
    expect(suggest('expansive', { species: [] })).toBeNull()
  })

  it('nalot drzew: <5% FV, 5–10% U1, >10% U2; liczba > lista > klasa', () => {
    expect([0, 4.9, 5, 10, 10.1].map(gradeTrees2190)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
    expect(suggest('trees', { species: sp(['Betula pubescens', 3], ['Pinus sylvestris', 4]) })).toBe('U1')
    expect(suggest('trees', { species: sp(['Betula pubescens', 3]), value: 20, choice: 'low' })).toBe('U2')
    expect(suggest('trees', { species: sp(['Betula pubescens']), choice: 'low' })).toBe('FV')
    expect(ind('trees').warn!({ value: 20, choice: 'low' }, ctx())).toMatch(/nie pasuje/)
  })

  it('krzewy i krzewinki: >10% FV, 5–10% U1, <5% U2; w podtypie 7 bez podpowiedzi', () => {
    expect([30, 10.1, 10, 5, 4.9].map(gradeShrubs2190)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
    expect(suggest('shrubs', { species: sp(['Erica tetralix', 25], ['Salix arenaria', 15], ['Empetrum nigrum']) })).toBe('FV')
    expect(suggest('shrubs', { value: 3 })).toBe('U2')
    expect(suggest('shrubs', { value: 30 }, { subtype: '7' })).toBeNull()
    expect(ind('shrubs').explain!({ value: 30 }, ctx({ subtype: '7' }))).toMatch(/Podtyp 7/)
  })

  it('dobrze zachowane płaty: ≥80% FV, 50–79% U1, <50% U2', () => {
    expect([100, 80, 79, 50, 49].map(gradePatches2190)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
    expect(suggest('patches', { value: 90, choice: 'poor' })).toBe('FV')
    expect(suggest('patches', { choice: 'mid' })).toBe('U1')
  })

  it('pionowa struktura i procesy eoliczne z selecta; opis z pokryć warstw', () => {
    expect(suggest('vertical', { choice: 'disturbed' })).toBe('U1')
    expect(ind('vertical').describe!({ choice: 'proper', coverC: 80, coverD: 75 }, ctx())).toBe('Pokrycie c – 80%, Pokrycie d – 75%')
    expect(suggest('eolian', { choice: 'none' })).toBe('FV')
    expect(suggest('eolian', { choice: 'intense' })).toBe('U2')
  })

  it('ocena struktury: U2 w kardynalnym → U2; U2 w niekardynalnym → U1', () => {
    const v = structuredClone(madwiny1)
    v.indicators.shrubs.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U2')
    const w = structuredClone(madwiny1)
    w.indicators.trees.grade = 'U2'
    expect(assessCard(m, w).structure).toBe('U1')
  })
})

describe('przykład Madwiny 1 (przewodnik, 2013)', () => {
  it('przechodzi walidację karty', () => {
    const r = buildCardSchema(m).safeParse(madwiny1)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny jak w karcie: ekspansywne U1, reszta FV → struktura FV, ogólna FV', () => {
    expect(assessCard(m, madwiny1)).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV', missing: [] })
    const grades = Object.fromEntries(Object.entries(madwiny1.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({
      area: 'FV',
      species: 'FV',
      dominants: 'FV',
      aliens: 'FV',
      expansive: 'U1',
      trees: 'FV',
      shrubs: 'FV',
      patches: 'FV',
      vertical: 'FV',
      eolian: 'FV',
    })
  })

  it('podpowiedzi zgodne z oceną eksperta poza procesami eolicznymi („nieznaczne” = niewielkie → U1, ekspert FV)', () => {
    const c: IndicatorContext = { site: madwiny1.site, indicators: madwiny1.indicators }
    for (const i of m.indicators) {
      const expected = i.id === 'eolian' ? 'U1' : madwiny1.indicators[i.id].grade
      expect(i.suggest!(madwiny1.indicators[i.id].inputs, c), i.id).toBe(expected)
    }
  })

  it('opisy z pomiarów = wartości w karcie', () => {
    const c: IndicatorContext = { site: madwiny1.site, indicators: madwiny1.indicators }
    for (const i of m.indicators) expect(i.describe!(madwiny1.indicators[i.id].inputs, c), i.id).toBe(madwiny1.indicators[i.id].value)
  })

  it('wykonawca zanonimizowany, 3 zdjęcia po 100 m², podtyp 1', () => {
    expect(examples2190).toHaveLength(1)
    expect(madwiny1.site.observer).toBe('Jan Kowalski')
    expect(madwiny1.site.subtype).toBe('1')
    expect(JSON.stringify(madwiny1)).not.toMatch(/Izydorek/)
    expect(madwiny1.releves).toHaveLength(3)
    expect(madwiny1.releves.map((r) => r.area)).toEqual([100, 100, 100])
    expect(madwiny1.releves.map((r) => r.coverD)).toEqual([80, 80, 70])
  })
})
