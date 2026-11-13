import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { CardValues, Grade, IndicatorContext, InputValues } from '../../7120/habitats/types'
import { examples1340, owczary } from './examples'
import {
  characteristic1340,
  dominance1340,
  eceRange,
  gradeShare1340,
  gradeTransect1340,
  indicator1340 as ind,
  methodology1340 as m,
  transectShare,
} from './methodology'
import { defaultLayer1340, findSpecies1340, isPhragmites } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, ctx())
const sp = (name: string, cover?: number) => ({ name, cover })

const OBLIGATE = ['Spergularia salina', 'Aster tripolium', 'Juncus gerardi', 'Glaux maritima', 'Triglochin maritimum']
const FACULTATIVE = ['Puccinellia distans', 'Lotus tenuis', 'Trifolium fragiferum', 'Carex distans', 'Festuca arundinacea']

describe('metodyka 1340 – struktura', () => {
  it('kod *1340 (priorytetowe), trzy zdjęcia 5×5 m, transekt bez narzuconego wymiaru', () => {
    expect(habitatCode(m)).toBe('*1340')
    expect(m.name).toMatch(/^Śródlądowe słone łąki, pastwiska i szuwary \(Glauco-Puccinellietalia/)
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBeUndefined()
    expect(m.siteFields.find((f) => f.name === 'subtypes')!.help).toMatch(/1340-5/)
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności tab. 2 plus uwilgotnienie na końcu; bez strefy ekotonowej i kombinacji florystycznej', () => {
    expect(m.indicators.map((i) => i.id)).toEqual([
      'area',
      'transect',
      'characteristic',
      'dominant',
      'invasive',
      'expansive',
      'shrubs',
      'spatial',
      'saltWater',
      'moisture',
    ])
    expect(m.indicators.map((i) => i.label).join()).not.toMatch(/ekoton|kombinacja/i)
  })

  it('kardynalne (5, jak w tab. 2): transekt, charakterystyczne, dominujące, ekspansywne, zasilanie; nic nie jest pominięte', () => {
    const structure = m.indicators.filter((i) => i.parameter === 'structure')
    expect(structure).toHaveLength(9)
    expect(structure.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['transect', 'characteristic', 'dominant', 'expansive', 'saltWater'])
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

  it('termin: od końca maja do końca września', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    for (const d of ['2008-05-31', '2024-05-20', '2024-06-25', '2024-08-06', '2024-09-30']) expect(date.warn!(d), d).toBeNull()
    for (const d of ['2024-05-10', '2024-10-02', '2024-04-30']) expect(date.warn!(d), d).toMatch(/poza oknem/)
  })

  it('kody oddziaływań bez duplikatów, z koszeniem, wypasem, osuszaniem, konkurencją i brakiem zalewania', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['A03', 'A03.03', 'A04.03', 'J02.01', 'J02.04.02', 'J02.15', 'K04.01', 'K01.04', 'X']) expect(codes).toContain(c)
  })

  it('katalog: grupy halofitów, trzcina i perz ekspansywne, olsza w warstwie B', () => {
    expect(m.speciesInfo!('Salicornia europaea')).toBe('halofit obligatoryjny')
    expect(m.speciesInfo!('Atriplex prostrata subsp. prostrata var. salina')).toBe('halofit obligatoryjny')
    expect(m.speciesInfo!('Festuca arundinacea')).toBe('halofit fakultatywny')
    expect(m.speciesInfo!('Scirpus maritimus')).toBe('halofit fakultatywny')
    expect(m.speciesInfo!('Blysmus rufus')).toBe('halofit spoza listy przewodnika')
    expect(m.speciesInfo!('Phragmites australis')).toBe('gatunek towarzyszący (glikofit), ekspansywny')
    expect(findSpecies1340('Elymus repens')).toMatchObject({ expansive: true })
    expect(m.speciesInfo!('Solidago gigantea')).toBe('gatunek obcy')
    expect(defaultLayer1340(findSpecies1340('Alnus glutinosa')!)).toBe('B')
    expect(defaultLayer1340(findSpecies1340('Juncus gerardi')!)).toBe('C')
    expect(isPhragmites('  phragmites  australis ')).toBe(true)
  })
})

describe('metodyka 1340 – progi', () => {
  it('procent na transekcie: >75 FV, 50–75 U1, <50 U2', () => {
    expect([100, 75.1, 75, 50, 49.9, 0].map(gradeTransect1340)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('procent na transekcie: liczony z długości odcinków, wpisany wprost ma pierwszeństwo', () => {
    expect(transectShare({ habitatLength: 116, transectLength: 145 })).toEqual({ pct: 80, from: 'lengths' })
    expect(transectShare({ share: 40, habitatLength: 116, transectLength: 145 })).toEqual({ pct: 40, from: 'typed' })
    expect(suggest('transect', { habitatLength: 60, transectLength: 145 })).toBe('U2')
    expect(suggest('transect', {})).toBeNull()
    expect(ind('transect').warn!({ habitatLength: 200, transectLength: 145 })).toMatch(/dłuższe/)
  })

  it('obce i ekspansywne: <25 FV, 25–50 U1, >50 U2', () => {
    expect([0, 24.9, 25, 50, 50.1].map(gradeShare1340)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
    expect(suggest('invasive', { species: [] })).toBe('FV')
    expect(suggest('invasive', { species: [sp('Solidago gigantea', 30)] })).toBe('U1')
    expect(suggest('invasive', { species: [sp('Solidago gigantea')] })).toBeNull()
  })

  it('gatunki charakterystyczne: ≥10 halofitów i obligatoryjny >25% – FV; ≤6 – U2; reszta U1', () => {
    const ten = [...OBLIGATE.map((n) => sp(n, 5)), ...FACULTATIVE.map((n) => sp(n, 5))]
    expect(characteristic1340({ species: ten }).grade).toBe('U1')
    expect(characteristic1340({ species: [sp('Juncus gerardi', 30), ...ten.slice(1)] }).grade).toBe('FV')
    expect(characteristic1340({ species: ten.slice(0, 9) }).grade).toBe('U1')
    expect(characteristic1340({ species: ten.slice(0, 7) }).grade).toBe('U1')
    expect(characteristic1340({ species: ten.slice(0, 6) }).grade).toBe('U2')
    // gatunki spoza list przewodnika się nie liczą
    const withOthers = [...ten.slice(0, 6), sp('Blysmus rufus', 40), sp('Phragmites australis', 50)]
    expect(characteristic1340({ species: withOthers })).toMatchObject({ grade: 'U2' })
    expect(characteristic1340({ species: withOthers }).reason).toMatch(/nie liczą się\): Blysmus rufus, Phragmites australis/)
    // brak pokrycia obligatoryjnych przy ≥10 gatunkach – za mało danych
    expect(characteristic1340({ species: [sp('Juncus gerardi'), ...ten.slice(1)] }).grade).toBeNull()
    expect(characteristic1340({ species: [] }).grade).toBeNull()
  })

  it('gatunki dominujące: halofity ≥ glikofity FV, żaden halofit >10% U2, reszta U1', () => {
    expect(dominance1340({ species: [sp('Juncus gerardi', 40), sp('Phragmites australis', 30)] }).grade).toBe('FV')
    expect(dominance1340({ species: [sp('Festuca arundinacea', 50)] }).grade).toBe('FV')
    expect(dominance1340({ species: [sp('Festuca arundinacea', 20), sp('Phragmites australis', 70)] }).grade).toBe('U1')
    expect(dominance1340({ species: [sp('Carex distans', 10), sp('Phragmites australis', 70)] }).grade).toBe('U2')
    expect(dominance1340({ species: [sp('Elymus repens', 60), sp('Poa pratensis', 20)] }).reason).toMatch(/nie ma halofitów/)
    expect(dominance1340({ species: [sp('Blysmus rufus', 40), sp('Agrostis stolonifera', 20)] }).grade).toBe('FV')
    expect(dominance1340({ species: [sp('Unknownia dubia', 40), sp('Juncus gerardi', 20)] }).grade).toBe('U1')
    expect(dominance1340({ species: [sp('Juncus gerardi')] }).grade).toBeNull()
  })

  it('ekspansywne: suma pokrycia, płat >50% daje U2, trzcina pomijana tylko w czystym 1340-3', () => {
    expect(suggest('expansive', { species: [] })).toBe('FV')
    expect(suggest('expansive', { species: [sp('Phragmites australis', 20)] })).toBe('FV')
    expect(suggest('expansive', { species: [sp('Phragmites australis', 20), sp('Elymus repens', 10)] })).toBe('U1')
    expect(suggest('expansive', { species: [sp('Phragmites australis', 70)] })).toBe('U2')
    expect(suggest('expansive', { species: [sp('Phragmites australis', 20)], maxPatch: 60 })).toBe('U2')
    expect(suggest('expansive', { species: [], maxPatch: 60 })).toBe('U2')
    expect(suggest('expansive', { species: [sp('Phragmites australis', 70)], reedNatural: 'yes' })).toBe('FV')
    expect(suggest('expansive', { species: [sp('Phragmites australis', 70), sp('Elymus repens', 30)], reedNatural: 'yes' })).toBe('U1')
    expect(ind('expansive').explain!({ species: [sp('Phragmites australis', 70)], reedNatural: 'yes' })).toMatch(/Trzcina pominięta/)
  })

  it('zasilanie: z wyboru; najwyższe ECe <4 dS/m → U2; FV przy części punktów <4 – ostrzeżenie', () => {
    expect(suggest('saltWater', { choice: 'free' })).toBe('FV')
    expect(suggest('saltWater', { choice: 'limited' })).toBe('U1')
    expect(suggest('saltWater', { choice: 'lost' })).toBe('U2')
    expect(suggest('saltWater', { choice: 'free', eceMin: 1.2, eceMax: 3.5 })).toBe('U2')
    expect(suggest('saltWater', { eceMax: 2 })).toBe('U2')
    expect(suggest('saltWater', { eceMax: 8 })).toBeNull()
    expect(eceRange({ eceMin: 5 })).toEqual({ min: 5, max: 5 })
    expect(ind('saltWater').warn!({ choice: 'free', eceMin: 2, eceMax: 12 })).toMatch(/poniżej 4/)
    expect(ind('saltWater').warn!({ choice: 'limited', eceMin: 2, eceMax: 12 })).toBeNull()
    expect(ind('saltWater').warn!({ eceMin: 12, eceMax: 2 })).toMatch(/Sprawdź/)
  })

  it('powierzchnia, krzewy, struktura przestrzenna, uwilgotnienie – z wyboru', () => {
    expect(['increase', 'stable', 'decrease', 'strongDecrease', 'unknown'].map((trend) => suggest('area', { trend }))).toEqual(['FV', 'FV', 'U1', 'U2', 'XX'])
    expect(['none', 'young', 'planted'].map((choice) => suggest('shrubs', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(['mosaic', 'partial', 'isolated', 'none', 'unclear'].map((choice) => suggest('spatial', { choice }))).toEqual(['FV', 'U1', 'U2', 'U2', 'XX'])
    expect(['wet', 'drying', 'dry', 'unknown'].map((choice) => suggest('moisture', { choice }))).toEqual(['FV', 'U1', 'U2', 'XX'])
  })
})

describe('ocena struktury', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(owczary)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    v.prospects.grade = 'FV'
    return v
  }

  it('wszystko FV → FV; niekardynalny U2 (uwilgotnienie, struktura przestrzenna) → U1; kardynalny U2 → U2', () => {
    const v = allFv()
    expect(assessCard(m, v)).toMatchObject({ structure: 'FV', overall: 'FV' })
    v.indicators.moisture.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.moisture.grade = 'FV'
    v.indicators.spatial.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.dominant.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U2')
  })

  it('XX w niekardynalnym nie psuje oceny, XX w kardynalnym daje XX', () => {
    const v = allFv()
    v.indicators.moisture.grade = 'XX'
    v.indicators.spatial.grade = 'XX'
    expect(assessCard(m, v).structure).toBe('FV')
    v.indicators.saltWater.grade = 'XX'
    expect(assessCard(m, v).structure).toBe('XX')
  })
})

describe('przykład Owczary k. Buska-Zdroju (karta z przewodnika, 2008)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(owczary)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny jak w karcie: powierzchnia U1, struktura U2, perspektywy U1, ogólna U2', () => {
    expect(assessCard(m, owczary)).toMatchObject({ area: 'U1', structure: 'U2', prospects: 'U1', overall: 'U2', missing: [] })
  })

  it('podpowiedzi zgodne z kartą (uwilgotnienia w karcie nie było – „nie da się ocenić”, XX)', () => {
    const c = ctx({ site: owczary.site, indicators: owczary.indicators })
    for (const i of m.indicators) expect(i.suggest!(owczary.indicators[i.id].inputs, c), i.id).toBe(owczary.indicators[i.id].grade)
  })

  it('pole „wartość” wygenerowane z pomiarów tam, gdzie karta podaje liczby', () => {
    const c = ctx({ site: owczary.site, indicators: owczary.indicators })
    for (const id of ['transect', 'invasive', 'expansive', 'saltWater']) expect(ind(id).describe!(owczary.indicators[id].inputs, c), id).toBe(owczary.indicators[id].value)
  })

  it('zanonimizowany wykonawca, trzy zdjęcia (25, 24, 25 m²)', () => {
    expect(examples1340).toHaveLength(1)
    expect(owczary.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(owczary)).not.toMatch(/Piernik|Agnieszka/)
    expect(owczary.releves.map((r) => r.area)).toEqual([25, 24, 25])
  })
})
