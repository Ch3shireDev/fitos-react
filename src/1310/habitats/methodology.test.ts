import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { CardValues, Grade, IndicatorContext, InputValues } from '../../7120/habitats/types'
import { examples1310, kolobrzeg } from './examples'
import {
  dominance1310,
  gradeRadius1310,
  gradeRatio1310,
  gradeSalicornia1310,
  gradeShare1310,
  indicator1310 as ind,
  methodology1310 as m,
  ratioOf,
} from './methodology'
import { defaultLayer1310, findSpecies1310, isSalicornia } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, ctx())
const sp = (name: string, cover?: number) => ({ name, cover })

describe('metodyka 1310 – struktura', () => {
  it('kod 1310 bez gwiazdki, transekt 200×10 m, trzy zdjęcia 5×5 m, zespół z solirodem domyślnie', () => {
    expect(habitatCode(m)).toBe('1310')
    expect(m.name).toBe('Śródlądowe błotniste solniska z solirodkiem (Salicornion ramosissimae)')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('200x10 m')
    expect(m.siteFields.find((f) => f.name === 'communities')!.defaultValue).toBe('Puccinellio distantis-Salicornietum brachystachyae')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności tab. 2, bez krzewów i strefy ekotonowej (wypadły w 2016)', () => {
    expect(m.indicators.map((i) => i.id)).toEqual(['area', 'ratio', 'characteristic', 'dominant', 'invasive', 'expansive', 'spatial', 'saltWater'])
    expect(m.indicators.map((i) => i.label).join()).not.toMatch(/krzew|ekoton|na transekcie/i)
  })

  it('kardynalne: struktura przestrzenna, charakterystyczne, ekspansywne, zasilanie; nic nie jest pominięte', () => {
    const structure = m.indicators.filter((i) => i.parameter === 'structure')
    expect(structure).toHaveLength(7)
    expect(structure.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['characteristic', 'expansive', 'spatial', 'saltWater'])
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

  it('termin: lipiec–wrzesień, październik z ostrzeżeniem (2016: zaschnięty soliród)', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2009-07-03')).toBeNull()
    expect(date.warn!('2021-08-30')).toBeNull()
    expect(date.warn!('2016-10-05')).toMatch(/poza optymalnym/)
  })

  it('kody oddziaływań bez duplikatów, z osuszaniem, sukcesją, warzelniami i drogami', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['J02.01.02', 'K02.01', 'C01.05', 'D01.02', 'X']) expect(codes).toContain(c)
  })

  it('katalog: grupy halofitów, trzcina ekspansywna, wszystko w warstwie C', () => {
    expect(m.speciesInfo!('Salicornia europaea')).toBe('pionierski halofit obligatoryjny')
    expect(m.speciesInfo!('Juncus gerardi')).toBe('halofit obligatoryjny')
    expect(m.speciesInfo!('Puccinellia distans')).toBe('halofit fakultatywny')
    expect(findSpecies1310('Phragmites australis')).toMatchObject({ group: 'indifferent', expansive: true })
    expect(defaultLayer1310(findSpecies1310('Aster tripolium')!)).toBe('C')
    expect(isSalicornia('  salicornia  europaea ')).toBe(true)
  })
})

describe('metodyka 1310 – progi', () => {
  it('stosunek do powierzchni potencjalnej: 75–100 FV, 50–75 U1, <50 U2', () => {
    expect([100, 75, 74.9, 50, 49.9, 1].map(gradeRatio1310)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('stosunek: liczony z m², udział wpisany wprost ma pierwszeństwo', () => {
    expect(ratioOf({ patches: 240, potential: 24000 })).toEqual({ pct: 1, from: 'areas' })
    expect(suggest('ratio', { patches: 400, potential: 400 })).toBe('FV')
    expect(suggest('ratio', { patches: 500, potential: 1000, share: 80 })).toBe('FV')
    expect(suggest('ratio', { patches: 500 })).toBeNull()
    expect(ind('ratio').describe!({ patches: 600, potential: 1000 })).toBe('60% (600 z 1000 m²)')
    expect(ind('ratio').warn!({ patches: 2000, potential: 1000 })).toMatch(/Sprawdź/)
  })

  it('gatunki charakterystyczne: liczy się tylko soliród – 50–100 FV, 25–50 U1, <25 U2, brak solirodu U2', () => {
    expect([100, 65, 50, 49, 25, 24, 0].map(gradeSalicornia1310)).toEqual(['FV', 'FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
    expect(suggest('characteristic', { species: [sp('Salicornia europaea', 30), sp('Spergularia salina', 40)] })).toBe('U1')
    expect(suggest('characteristic', { species: [sp('Spergularia salina', 60)] })).toBe('U2')
    expect(suggest('characteristic', { species: [sp('Salicornia europaea')] })).toBeNull()
    expect(suggest('characteristic', { species: [] })).toBeNull()
    expect(ind('characteristic').explain!({ species: [sp('Salicornia europaea', 30), sp('Spergularia salina', 5)] })).toMatch(/nie liczą się do oceny\): Spergularia salina/)
  })

  it('gatunki dominujące: soliród dominuje – ocena z pokrycia warstwy C', () => {
    const dom = (coverC: number) => dominance1310({ species: [sp('Salicornia europaea', 40), sp('Puccinellia distans', 10)], coverC }).grade
    expect([95, 50, 49, 25, 24].map(dom)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('gatunki dominujące: współdominacja halofitów U1 (U2 przy C<25), trzcina i brak solirodu U2', () => {
    expect(dominance1310({ species: [sp('Salicornia europaea', 30), sp('Aster tripolium', 30)], coverC: 80 }).grade).toBe('U1')
    expect(dominance1310({ species: [sp('Salicornia europaea', 10), sp('Aster tripolium', 10)], coverC: 20 }).grade).toBe('U2')
    expect(dominance1310({ species: [sp('Salicornia europaea', 30), sp('Phragmites australis', 60)], coverC: 90 }).grade).toBe('U2')
    expect(dominance1310({ species: [sp('Salicornia europaea', 50), sp('Phragmites australis', 20), sp('Agrostis stolonifera', 10)], coverC: 90 })).toMatchObject({
      grade: 'U2',
      reason: expect.stringMatching(/wyraźna ekspansja/),
    })
    expect(dominance1310({ species: [sp('Festuca arundinacea', 70)], coverC: 90 }).grade).toBe('U2')
    expect(dominance1310({ species: [sp('Salicornia europaea', 60)] }).grade).toBeNull()
    expect(dominance1310({ species: [sp('Salicornia europaea')], coverC: 60 }).grade).toBeNull()
  })

  it('obce i ekspansywne: <10 FV, 10–25 U1, >25 U2; pusta lista FV', () => {
    expect([0, 9.9, 10, 25, 25.1, 60].map(gradeShare1310)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
    expect(suggest('expansive', { species: [] })).toBe('FV')
    expect(suggest('expansive', { species: [sp('Phragmites australis', 15)] })).toBe('U1')
    expect(suggest('expansive', { species: [sp('Phragmites australis', 50), sp('Phalaris arundinacea', 10)] })).toBe('U2')
    expect(suggest('invasive', { species: [] })).toBe('FV')
    expect(suggest('invasive', { species: [sp('Solidago canadensis')] })).toBeNull()
  })

  it('struktura przestrzenna: z wyboru, promień tylko podpowiada i ostrzega; brak siedliska U2', () => {
    expect([300, 100, 99, 10, 9].map(gradeRadius1310)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
    expect(['hundreds', 'tens', 'few', 'none'].map((choice) => suggest('spatial', { choice }))).toEqual(['FV', 'U1', 'U2', 'U2'])
    expect(suggest('spatial', { radius: 40 })).toBe('U1')
    expect(ind('spatial').warn!({ choice: 'hundreds', radius: 5 })).toMatch(/kilku metrów/)
    expect(ind('spatial').warn!({ choice: 'tens', radius: 50 })).toBeNull()
  })

  it('zasilanie: swobodny FV, ograniczony U1, degradacja U2; ostrzeżenie przy niskim ECe', () => {
    expect(['free', 'limited', 'degraded'].map((choice) => suggest('saltWater', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(ind('saltWater').warn!({ choice: 'free', ece: 10 })).toMatch(/za mało/)
    expect(ind('saltWater').warn!({ choice: 'free', ece: 39 })).toBeNull()
    expect(ind('saltWater').describe!({ choice: 'limited', source: 'anthropogenic', ece: 58.9, groundwater: 0 })).toBe(
      'Zasilanie ograniczone (osuszenie, ograniczony dopływ, rozcieńczanie solanki wylewami rzeki lub słabiej zasolonymi wodami morskimi); źródło: antropogeniczne; ECe gleby 58,9 dS/m; lustro wody gruntowej 0 cm',
    )
  })

  it('powierzchnia: rośnie lub bez zmian FV, nieznaczny spadek U1, znaczny U2, brak danych XX', () => {
    expect(['increase', 'stable', 'decrease', 'strongDecrease', 'unknown', ''].map((trend) => suggest('area', { trend }))).toEqual(['FV', 'FV', 'U1', 'U2', 'XX', null])
    expect(ind('area').describe!({ trend: 'stable', areaM2: 400 })).toBe('400 m², nie podlega zmianom')
  })
})

describe('ocena struktury', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(kolobrzeg)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    v.prospects.grade = 'FV'
    return v
  }

  it('wszystko FV → FV; niekardynalny U2 → U1; kardynalny U2 → U2', () => {
    const v = allFv()
    expect(assessCard(m, v)).toMatchObject({ structure: 'FV', overall: 'FV' })
    v.indicators.dominant.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.saltWater.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U2')
  })

  it('XX w niekardynalnym stosunku powierzchni nie psuje oceny', () => {
    const v = allFv()
    v.indicators.ratio.grade = 'XX'
    expect(assessCard(m, v).structure).toBe('FV')
    v.indicators.ratio.grade = 'FV'
    v.indicators.spatial.grade = 'XX'
    expect(assessCard(m, v).structure).toBe('XX')
  })
})

describe('przykład Kołobrzeg-Budzistowo (karta z przewodnika, 2009)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(kolobrzeg)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny jak w karcie: powierzchnia U1, struktura U1, perspektywy U1, ogólna U1', () => {
    expect(assessCard(m, kolobrzeg)).toMatchObject({ area: 'U1', structure: 'U1', prospects: 'U1', overall: 'U1', missing: [] })
  })

  it('podpowiedzi zgodne z kartą; powierzchnia i stosunek (brak danych w karcie) bez podpowiedzi', () => {
    const c = ctx({ site: kolobrzeg.site, indicators: kolobrzeg.indicators })
    for (const i of m.indicators) {
      const s = i.suggest!(kolobrzeg.indicators[i.id].inputs, c)
      if (i.id === 'area' || i.id === 'ratio') expect(s, i.id).toBeNull()
      else expect(s, i.id).toBe(kolobrzeg.indicators[i.id].grade)
    }
  })

  it('pole „wartość” = opis wygenerowany z pomiarów (poza stosunkiem, przepisanym z karty)', () => {
    const c = ctx({ site: kolobrzeg.site, indicators: kolobrzeg.indicators })
    for (const i of m.indicators.filter((x) => x.id !== 'ratio')) expect(i.describe!(kolobrzeg.indicators[i.id].inputs, c), i.id).toBe(kolobrzeg.indicators[i.id].value)
  })

  it('zanonimizowany wykonawca, trzy zdjęcia 3×3 m', () => {
    expect(examples1310).toHaveLength(1)
    expect(kolobrzeg.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(kolobrzeg)).not.toMatch(/Bosiacka|stadnin/)
    expect(kolobrzeg.releves.map((r) => r.area)).toEqual([9, 9, 9])
  })
})
