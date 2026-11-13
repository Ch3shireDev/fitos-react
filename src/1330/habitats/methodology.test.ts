import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { CardValues, Grade, IndicatorContext, InputValues } from '../../7120/habitats/types'
import { examples1330, jarzebowo } from './examples'
import {
  characteristic1330,
  dominance1330,
  gradeCharacteristic1330,
  gradeShare1330,
  gradeShrubs1330,
  gradeTransect1330,
  indicator1330 as ind,
  methodology1330 as m,
} from './methodology'
import { defaultLayer1330, findSpecies1330, isCharacteristic1330 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, ctx())
const sp = (name: string, cover?: number) => ({ name, cover })

describe('metodyka 1330 – struktura', () => {
  it('kod 1330 bez gwiazdki, transekt 200×10 m, trzy zdjęcia 5×5 m, podtypy 1330-1 i 1330-2', () => {
    expect(habitatCode(m)).toBe('1330')
    expect(m.name).toBe('Solniska nadmorskie (Glauco-Puccinellietalia część – zbiorowiska nadmorskie)')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('200x10 m')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(emptyCardValues(m).releves).toHaveLength(3)
    const sub = m.siteFields.find((f) => f.name === 'subtype')!
    expect(sub.kind === 'select' && sub.options.map((o) => o.value)).toEqual(['1330-1', '1330-2', 'both'])
  })

  it('wskaźniki w kolejności tab. 2 – wszystkie osiem struktury (nic nie wypadło, jak w sprawozdaniu 2021)', () => {
    expect(m.indicators.map((i) => i.id)).toEqual(['area', 'transect', 'characteristic', 'dominant', 'invasive', 'expansive', 'shrubs', 'spatial', 'saltWater'])
    expect(m.indicators.filter((i) => i.parameter === 'structure')).toHaveLength(8)
  })

  it('kardynalne wg przewodnika: charakterystyczne, dominujące, ekspansywne, zasilanie; nic nie jest pominięte', () => {
    const structure = m.indicators.filter((i) => i.parameter === 'structure')
    expect(structure.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['characteristic', 'dominant', 'expansive', 'saltWater'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...m.otherFields, ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: czerwiec–wrzesień, poza nim ostrzeżenie', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    for (const d of ['2009-06-10', '2009-07-19', '2017-08-20', '2021-09-26']) expect(date.warn!(d), d).toBeNull()
    for (const d of ['2021-05-20', '2021-10-05']) expect(date.warn!(d), d).toMatch(/poza sezonem/)
  })

  it('kody oddziaływań bez duplikatów, z wypasem, koszeniem, osuszaniem, wałami, sukcesją', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['A03', 'A04', 'A04.03', 'J02.01.02', 'J02.12', 'K02.01', 'D01.02', 'X']) expect(codes).toContain(c)
  })

  it('katalog: halofity, „bazowe” indyferentne, trzcina ekspansywna, olsza w warstwie B', () => {
    expect(m.speciesInfo!('Juncus gerardi')).toBe('halofit obligatoryjny')
    expect(m.speciesInfo!('Trifolium fragiferum')).toBe('halofit fakultatywny')
    expect(m.speciesInfo!('Agrostis stolonifera')).toBe('gatunek indyferentny „bazowy”')
    expect(m.speciesInfo!('Inula britannica')).toBe('gatunek indyferentny')
    expect(findSpecies1330('Phragmites australis')).toMatchObject({ group: 'glycophyte', expansive: true })
    expect(defaultLayer1330(findSpecies1330('Alnus glutinosa')!)).toBe('B')
    expect(defaultLayer1330(findSpecies1330('Plantago maritima')!)).toBe('C')
    expect(['Juncus gerardi', 'Puccinellia distans', 'Festuca rubra', '  potentilla  anserina'].every(isCharacteristic1330)).toBe(true)
    expect(['Inula britannica', 'Phragmites australis', 'Carex disticha', 'Nieznany gatunek'].some(isCharacteristic1330)).toBe(false)
  })
})

describe('metodyka 1330 – progi', () => {
  it('transekt: 75–100 FV, 50–75 U1, <50 U2', () => {
    expect([100, 75, 74.9, 50, 49.9, 0].map(gradeTransect1330)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
    expect(suggest('transect', { share: 65 })).toBe('U1')
    expect(suggest('transect', {})).toBeNull()
  })

  it('gatunki charakterystyczne: halofity + bazowe indyferentne 40–100 FV, 20–40 U1, <20 U2', () => {
    expect([100, 40, 39.9, 20, 19.9, 0].map(gradeCharacteristic1330)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
    expect(suggest('characteristic', { species: [sp('Juncus gerardi', 15), sp('Agrostis stolonifera', 10), sp('Phragmites australis', 60)] })).toBe('U1')
    expect(suggest('characteristic', { species: [sp('Phragmites australis', 90)] })).toBe('U2')
    expect(suggest('characteristic', { species: [sp('Juncus gerardi')] })).toBeNull()
    expect(suggest('characteristic', { species: [] })).toBeNull()
    expect(characteristic1330({ species: [sp('Juncus gerardi', 70), sp('Agrostis stolonifera', 60)] }).pct).toBe(100)
    expect(ind('characteristic').explain!({ species: [sp('Juncus gerardi', 30), sp('Phragmites australis', 5)] }, ctx())).toMatch(
      /łącznie: 30%\. Nie liczą się do oceny: Phragmites australis/,
    )
  })

  it('gatunki dominujące: halofity dominują FV, współdominacja z bazowymi FV, indyferentne U1, glikofity U2', () => {
    expect(dominance1330({ species: [sp('Juncus gerardi', 50), sp('Agrostis stolonifera', 30)] }).grade).toBe('FV')
    expect(dominance1330({ species: [sp('Agrostis stolonifera', 40), sp('Juncus gerardi', 20)] })).toMatchObject({ grade: 'FV', reason: expect.stringMatching(/współdominują/) })
    expect(dominance1330({ species: [sp('Agrostis stolonifera', 60), sp('Juncus gerardi', 10)] }).grade).toBe('U1')
    expect(dominance1330({ species: [sp('Inula britannica', 40), sp('Juncus gerardi', 30)] }).grade).toBe('U1')
    expect(dominance1330({ species: [sp('Phragmites australis', 70), sp('Juncus gerardi', 20)] })).toMatchObject({ grade: 'U2', reason: expect.stringMatching(/glikofity/) })
    expect(dominance1330({ species: [sp('Carex disticha', 50), sp('Agrostis stolonifera', 20)] }).grade).toBe('U2')
    expect(dominance1330({ species: [sp('Juncus gerardi')] }).grade).toBeNull()
    expect(dominance1330({ species: [] }).grade).toBeNull()
  })

  it('obce i ekspansywne: <10 FV, 10–25 U1, >25 U2; pusta lista FV', () => {
    expect([0, 9.9, 10, 25, 25.1, 95].map(gradeShare1330)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
    expect(suggest('expansive', { species: [] })).toBe('FV')
    expect(suggest('expansive', { species: [sp('Phragmites australis', 15), sp('Elymus repens', 5)] })).toBe('U1')
    expect(suggest('expansive', { species: [sp('Phragmites australis', 40)] })).toBe('U2')
    expect(suggest('invasive', { species: [sp('Rosa rugosa', 5)] })).toBe('FV')
    expect(suggest('invasive', { species: [sp('Rosa rugosa')] })).toBeNull()
  })

  it('krzewy i podrost drzew: <5 FV, 5–15 U1, >15 U2', () => {
    expect([0, 4.9, 5, 15, 15.1].map(gradeShrubs1330)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
    expect(suggest('shrubs', { species: [] })).toBe('FV')
    expect(suggest('shrubs', { species: [sp('Alnus glutinosa', 10)] })).toBe('U1')
    expect(suggest('shrubs', { species: [sp('Alnus glutinosa')] })).toBeNull()
  })

  it('struktura przestrzenna i zasilanie: z wyboru; brak siedliska U2', () => {
    expect(['gradient', 'partial', 'isolated', 'none'].map((choice) => suggest('spatial', { choice }))).toEqual(['FV', 'U1', 'U2', 'U2'])
    expect(['free', 'limited', 'degraded'].map((choice) => suggest('saltWater', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(ind('saltWater').describe!({ choice: 'limited', source: 'ground', ditches: 'open', groundwater: 20, ece: 12.5 }, ctx())).toBe(
      'Zasilanie ograniczone przez melioracje siedliska, wały przeciwpowodziowe itp., prowadzące do degeneracji siedliska; źródło: słone wody podziemne; rowy drożne, bez zastawek; lustro wody gruntowej 20 cm; ECe gleby 12,5 dS/m',
    )
  })

  it('powierzchnia: rośnie lub bez zmian FV, nieznaczny spadek U1, znaczny U2, brak danych XX', () => {
    expect(['increase', 'stable', 'decrease', 'strongDecrease', 'unknown', ''].map((trend) => suggest('area', { trend }))).toEqual(['FV', 'FV', 'U1', 'U2', 'XX', null])
  })
})

describe('ocena struktury', () => {
  const allFv = (): CardValues => structuredClone(jarzebowo)

  it('wszystko FV → FV; niekardynalny U2 → U1; kardynalny U2 (dominujące) → U2', () => {
    const v = allFv()
    expect(assessCard(m, v)).toMatchObject({ structure: 'FV', overall: 'FV' })
    v.indicators.shrubs.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.dominant.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U2')
  })

  it('XX w niekardynalnej strukturze przestrzennej nie psuje oceny, w kardynalnym zasilaniu – tak', () => {
    const v = allFv()
    v.indicators.spatial.grade = 'XX'
    expect(assessCard(m, v).structure).toBe('FV')
    v.indicators.saltWater.grade = 'XX'
    expect(assessCard(m, v).structure).toBe('XX')
  })
})

describe('przykład Jarzębowo (karta z przewodnika, 2009)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(jarzebowo)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny jak w karcie: wszystko FV', () => {
    expect(assessCard(m, jarzebowo)).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV', missing: [] })
  })

  it('podpowiedzi zgodne z kartą; powierzchnia (bez trendu) i krzewy (bez pokrycia) bez podpowiedzi', () => {
    const c = ctx({ site: jarzebowo.site, indicators: jarzebowo.indicators })
    for (const i of m.indicators) {
      const s = i.suggest!(jarzebowo.indicators[i.id].inputs, c)
      if (i.id === 'area' || i.id === 'shrubs') expect(s, i.id).toBeNull()
      else expect(s, i.id).toBe(jarzebowo.indicators[i.id].grade)
    }
  })

  it('pole „wartość” = opis wygenerowany z danych (poza krzewami, przepisanymi z karty)', () => {
    const c = ctx({ site: jarzebowo.site, indicators: jarzebowo.indicators })
    for (const i of m.indicators.filter((x) => x.id !== 'shrubs')) expect(i.describe!(jarzebowo.indicators[i.id].inputs, c), i.id).toBe(jarzebowo.indicators[i.id].value)
  })

  it('zanonimizowani wykonawcy, trzy zdjęcia 5×5 m', () => {
    expect(examples1330).toHaveLength(1)
    expect(jarzebowo.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(jarzebowo)).not.toMatch(/Bosiacka|Grzejszczak/)
    expect(jarzebowo.releves.map((r) => r.area)).toEqual([25, 25, 25])
  })
})
