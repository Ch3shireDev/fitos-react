import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { Grade, IndicatorContext, InputValues } from '../../7120/habitats/types'
import { examples7110, suprasl } from './examples'
import {
  characteristic7110,
  gradeCharacteristic7110,
  gradeShrubs7110,
  gradeSphagnum7110,
  gradeTrees7110,
  gradeUpTo5,
  gradeWater7110,
  indicator7110 as ind,
  methodology7110 as m,
  sphagnum7110,
} from './methodology'
import { findSpecies7110, isCharSphagnum7110, isCharVascular7110, isHummockSphagnum7110, isShrub7110, isSphagnum7110 } from './species'

const ctx = (site: InputValues = {}): IndicatorContext => ({ site })
const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, ctx())
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => ({ name, cover }))

describe('metodyka 7110 – struktura', () => {
  it('kod *7110 (priorytetowe), transekt 10×200 m, 3 zdjęcia po 25 m², sierpień', () => {
    expect(habitatCode(m)).toBe('*7110')
    expect(m.name).toBe('Torfowiska wysokie z roślinnością torfotwórczą (żywe)')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('10x200 m')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności tab. 1 (plus gatunki dominujące z przykładowej karty)', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Gatunki charakterystyczne',
      'Gatunki dominujące',
      'Pokrycie i struktura gatunkowa torfowców',
      'Obce gatunki inwazyjne',
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Odpowiednie uwodnienie',
      'Struktura powierzchni torfowiska (obecność dolinek i kęp)',
      'Pozyskanie torfu',
      'Melioracje odwadniające',
      'Obecność krzewów i drzew',
    ])
  })

  it('kardynalne wg listy pod tab. 2; gatunki dominujące pominięte w ocenie', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual([
      'characteristic',
      'sphagnum',
      'hydration',
      'peat',
      'drainage',
      'woody',
    ])
    expect(m.indicators.filter((i) => isExcluded(i, {})).map((i) => i.id)).toEqual(['dominant'])
  })

  it('podtyp opcjonalny: niżowe / górskie', () => {
    const f = m.siteFields.find((x) => x.name === 'subtype')!
    expect(f.kind === 'select' && f.options.map((o) => o.value)).toEqual(['', '7110-1', '7110-2'])
    expect(f.required).toBeFalsy()
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
    expect(date.warn!('2021-08-12')).toBeNull()
    expect(date.warn!('2021-07-01')).toBeNull()
    expect(date.warn!('2008-06-30')).toMatch(/poza optymalnym/)
    expect(date.warn!('2021-09-01')).toMatch(/poza optymalnym/)
  })

  it('kody oddziaływań bez duplikatów, z pozyskaniem torfu, osuszaniem, sukcesją i suszą', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['C01.03.01', 'C01.03.02', 'J02.01.02', 'K02.01', 'M01.02', 'F04.02', 'G05.07']) expect(codes).toContain(c)
  })
})

describe('metodyka 7110 – słownik gatunków', () => {
  it('torfowce: kępkowe z tab. 2, dolinkowe, Russowa; synonimy i skróty', () => {
    for (const n of ['Sphagnum magellanicum', 'S. papillosum', 'Sphagnum fuscum', 'Sphagnum rubellum', 'Sphagnum capilifolium'])
      expect(isHummockSphagnum7110(n), n).toBe(true)
    expect(isHummockSphagnum7110('Sphagnum russowii')).toBe(false)
    expect(isCharSphagnum7110('Sphagnum russowii')).toBe(true)
    expect(isCharSphagnum7110('S. fallax')).toBe(true)
    expect(isCharSphagnum7110('Sphagnum squarrosum')).toBe(false)
    expect(isSphagnum7110('Sphagnum squarrosum')).toBe(true)
    expect(isSphagnum7110('Sphagnum sp.')).toBe(true)
  })

  it('naczyniowe charakterystyczne z tab. 1, bagno i borówka bagienna liczone też do krzewów', () => {
    for (const n of ['Andromeda polifolia', 'Vaccinium oxycoccus', 'Trichophorum cespitosum', 'Carex limosa', 'Rhynchospora alba', 'Ledum palustre'])
      expect(isCharVascular7110(n), n).toBe(true)
    expect(isCharVascular7110('Eriophorum angustifolium')).toBe(false)
    expect(isShrub7110('Ledum palustre')).toBe(true)
    expect(isShrub7110('Vaccinium uliginosum')).toBe(true)
    expect(isShrub7110('Andromeda polifolia')).toBe(false)
    expect(findSpecies7110('Entodon schreberi')?.latin).toBe('Pleurozium schreberi')
    expect(findSpecies7110('żurawina błotna')?.latin).toBe('Oxycoccus palustris')
  })

  it('katalog bez duplikatów, z polskimi nazwami i warstwami', () => {
    const names = m.speciesCatalog!.map((s) => s.value)
    expect(new Set(names).size).toBe(names.length)
    expect(m.speciesCatalog!.find((s) => s.value === 'Sphagnum fuscum')?.layer).toBe('D')
    expect(m.speciesCatalog!.find((s) => s.value === 'Pinus sylvestris')?.layer).toBe('B')
    expect(m.speciesInfo!('Ledum palustre')).toMatch(/charakterystyczna.*krzew/)
  })
})

describe('metodyka 7110 – progi', () => {
  it('gatunki charakterystyczne: FV 3+2, U1 2+2, reszta U2', () => {
    expect(gradeCharacteristic7110(3, 2)).toBe('FV')
    expect(gradeCharacteristic7110(2, 5)).toBe('U1')
    expect(gradeCharacteristic7110(3, 1)).toBe('U2')
    expect(gradeCharacteristic7110(1, 1)).toBe('U2')
  })

  it('gatunki charakterystyczne liczone z listy; synonimy raz, obce nie liczą się', () => {
    const i = { species: sp(['Sphagnum magellanicum', 60], ['S. rubellum', 2], ['Sphagnum fallax', 30], ['Eriophorum vaginatum', 50], ['Vaccinium oxycoccus', 5], ['Oxycoccus palustris', 10], ['Pinus sylvestris', 5]) }
    const c = characteristic7110(i)
    expect(c.sphagna).toHaveLength(3)
    expect(c.vascular).toEqual(['Eriophorum vaginatum', 'Oxycoccus palustris'])
    expect(suggest('characteristic', i)).toBe('FV')
    expect(ind('characteristic').warn!(i, ctx())).toMatch(/Pinus sylvestris/)
    expect(suggest('characteristic', { species: [] })).toBeNull()
  })

  it('torfowce: FV >50% i kępkowe >40%; U2 <20% albo kępkowe <5%; 5% to U1', () => {
    expect(gradeSphagnum7110(60, 45)).toBe('FV')
    expect(gradeSphagnum7110(50, 80)).toBe('U1')
    expect(gradeSphagnum7110(80, 40)).toBe('U1')
    expect(gradeSphagnum7110(80, 5)).toBe('U1')
    expect(gradeSphagnum7110(80, 4)).toBe('U2')
    expect(gradeSphagnum7110(19, 90)).toBe('U2')
  })

  it('torfowce z listy: suma i udział kępkowych; liczby ręczne mają pierwszeństwo', () => {
    const list = { species: sp(['Sphagnum magellanicum', 20], ['Sphagnum fallax', 40]) }
    expect(sphagnum7110(list)).toMatchObject({ cover: 60, share: 33, hollowDominates: true })
    expect(suggest('sphagnum', list)).toBe('U1')
    expect(suggest('sphagnum', { ...list, cover: 70, hummockShare: 50 })).toBe('FV')
    expect(suggest('sphagnum', { species: sp(['Sphagnum fallax', 30]) })).toBe('U2')
    expect(suggest('sphagnum', { species: [] })).toBeNull()
  })

  it('obce: brak/siewki FV, do 5% U1, >5% U2', () => {
    expect(gradeUpTo5(0)).toBe('FV')
    expect(gradeUpTo5(5)).toBe('U1')
    expect(gradeUpTo5(5.5)).toBe('U2')
    expect(suggest('invasive', { amount: 'none' })).toBe('FV')
    expect(suggest('invasive', { amount: 'seedlings', species: sp(['Quercus rubra', 0.5]) })).toBe('FV')
    expect(suggest('invasive', { species: sp(['Erechtites hieraciifolia', 0.5]) })).toBe('U1')
    expect(suggest('invasive', { species: sp(['Solidago gigantea']) })).toBe('U1')
    expect(suggest('invasive', { amount: 'present', cover: 8 })).toBe('U2')
    expect(suggest('invasive', {})).toBeNull()
  })

  it('ekspansywne: brak FV, do 5% U1, >5% U2; suma z listy', () => {
    expect(suggest('expansive', { cover: 0 })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Molinia caerulea', 3]) })).toBe('U1')
    expect(suggest('expansive', { species: sp(['Calluna vulgaris', 15], ['Molinia caerulea', 3]) })).toBe('U2')
    expect(suggest('expansive', { species: sp(['Calluna vulgaris']) })).toBe('U1')
    expect(suggest('expansive', {})).toBeNull()
  })

  it('uwodnienie: średnia z pomiarów (≤10 FV, ≤30 U1), bez pomiarów – opis z obserwacji', () => {
    expect(gradeWater7110(-5)).toBe('FV')
    expect(gradeWater7110(10)).toBe('FV')
    expect(gradeWater7110(30)).toBe('U1')
    expect(gradeWater7110(31)).toBe('U2')
    expect(suggest('hydration', { depth1: 5, depth2: 15, depth3: 25 })).toBe('U1')
    expect(suggest('hydration', { choice: 'high' })).toBe('FV')
    expect(suggest('hydration', { choice: 'high', depth1: 40 })).toBe('U2')
    expect(ind('hydration').describe!({ depth1: 5, depth2: 7.5 }, ctx())).toBe('Poziom wody: 5, 7,5 cm poniżej powierzchni torfowiska')
  })

  it('struktura powierzchni: mszar dywanowy kontynentalny FV, dywanowy z płatami U1, brak struktury U2', () => {
    expect(suggest('surface', { choice: 'hummockHollow' })).toBe('FV')
    expect(suggest('surface', { choice: 'continental' })).toBe('FV')
    expect(suggest('surface', { choice: 'carpet' })).toBe('U1')
    expect(suggest('surface', { choice: 'none' })).toBe('U2')
  })

  it('pozyskanie torfu i melioracje z selecta', () => {
    expect(suggest('peat', { choice: 'oldSmall' })).toBe('FV')
    expect(suggest('peat', { choice: 'recentSmall' })).toBe('U1')
    expect(suggest('peat', { choice: 'large' })).toBe('U2')
    expect(suggest('drainage', { choice: 'none' })).toBe('FV')
    expect(suggest('drainage', { choice: 'weak' })).toBe('U1')
    expect(suggest('drainage', { choice: 'strong' })).toBe('U2')
  })

  it('krzewy i drzewa: gorsza z dwóch ocen; >50% drzew – ostrzeżenie o borze bagiennym', () => {
    expect(gradeTrees7110(9)).toBe('FV')
    expect(gradeTrees7110(10)).toBe('U1')
    expect(gradeTrees7110(31)).toBe('U2')
    expect(gradeShrubs7110(29)).toBe('FV')
    expect(gradeShrubs7110(50)).toBe('U1')
    expect(gradeShrubs7110(51)).toBe('U2')
    expect(suggest('woody', { species: sp(['Pinus sylvestris', 5], ['Ledum palustre', 25], ['Vaccinium uliginosum', 10]) })).toBe('U1')
    expect(suggest('woody', { species: sp(['Pinus sylvestris', 5]), shrubCover: 90 })).toBe('U2')
    expect(suggest('woody', { species: sp(['Pinus sylvestris', 5]) })).toBe('FV')
    expect(ind('woody').warn!({ treeCover: 60 }, ctx())).toMatch(/bór bagienny/)
    expect(suggest('woody', {})).toBeNull()
  })

  it('ocena struktury: U2 w kardynalnym → U2; U2 w niekardynalnym → U1; gatunki dominujące się nie liczą', () => {
    const v = structuredClone(suprasl)
    v.indicators.woody.grade = 'FV'
    expect(assessCard(m, v).structure).toBe('FV')
    v.indicators.dominant.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('FV')
    v.indicators.expansive.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.hydration.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U2')
  })
})

describe('przykład Supraśl (przewodnik, 2008)', () => {
  it('przechodzi walidację karty', () => {
    const r = buildCardSchema(m).safeParse(suprasl)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie; krzewy i drzewa U2 (kardynalny) → struktura i ocena ogólna U2, choć karta podaje FV', () => {
    const grades = Object.fromEntries(Object.entries(suprasl.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({
      area: 'FV',
      characteristic: 'FV',
      dominant: 'FV',
      sphagnum: 'FV',
      invasive: 'FV',
      expansive: 'FV',
      hydration: 'FV',
      surface: 'FV',
      peat: 'FV',
      drainage: 'FV',
      woody: 'U2',
    })
    expect(assessCard(m, suprasl)).toMatchObject({ area: 'FV', structure: 'U2', prospects: 'FV', overall: 'U2', missing: [] })
  })

  it('podpowiedzi zgodne z oceną eksperta przy każdym wskaźniku z progami', () => {
    const c: IndicatorContext = { site: suprasl.site, indicators: suprasl.indicators }
    for (const i of m.indicators) {
      if (!i.suggest) continue
      expect(i.suggest(suprasl.indicators[i.id].inputs, c), i.id).toBe(suprasl.indicators[i.id].grade)
    }
  })

  it('opisy = wartości z karty', () => {
    const c: IndicatorContext = { site: suprasl.site, indicators: suprasl.indicators }
    for (const i of m.indicators) expect(i.describe!(suprasl.indicators[i.id].inputs, c), i.id).toBe(suprasl.indicators[i.id].value)
  })

  it('koordynator zanonimizowany, 3 zdjęcia (100, 100, 10 m²), podtyp niżowy, termin z ostrzeżeniem', () => {
    expect(examples7110).toHaveLength(1)
    expect(suprasl.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(suprasl)).not.toMatch(/Wołkowycki|Stańko/)
    expect(suprasl.site.subtype).toBe('7110-1')
    expect(suprasl.releves.map((r) => r.area)).toEqual([100, 100, 10])
    expect(m.siteFields.find((f) => f.name === 'date')!.warn!(suprasl.site.date)).toMatch(/poza optymalnym/)
  })
})
