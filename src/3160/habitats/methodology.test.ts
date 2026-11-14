import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { CardValues, Grade, IndicatorContext, InputValues } from '../../7120/habitats/types'
import { examples3160, kuzniczek } from './examples'
import {
  EC_CHANGE,
  PH_CHANGE,
  SECCHI_CHANGE,
  computeChange,
  computeHDI,
  gradeAreaChange3160,
  gradeColour3160,
  gradeConductivity3160,
  gradeExpansive3160,
  gradeHDI3160,
  gradePH3160,
  gradeSecchi3160,
  gradeTDS3160,
  indicator3160 as ind,
  methodology3160 as m,
  speciesShares,
  worse,
} from './methodology'
import { defaultLayer3160, findSpecies3160 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const macro = ctx({ site: { lakeType: 'macrophyte' } })
const open = ctx({ site: { lakeType: 'open' } })
const suggest = (id: string, inputs: InputValues, c: IndicatorContext = ctx()): Grade | null => ind(id).suggest!(inputs, c)

describe('metodyka 3160 – struktura', () => {
  it('kod 3160 (niepriorytetowe), bez obowiązkowych zdjęć fitosocjologicznych', () => {
    expect(habitatCode(m)).toBe('3160')
    expect(m.name).toBe('Naturalne, dystroficzne zbiorniki wodne')
    expect(m.releves.defaultCount).toBe(0)
    expect(emptyCardValues(m).releves).toHaveLength(0)
    expect(emptyCardValues(m).site.hdiMeasured).toBe('yes')
  })

  it('wskaźniki w kolejności tab. 2 (z HDI za melioracjami, pomocnicze na końcu)', () => {
    expect(m.indicators.map((i) => i.id)).toEqual([
      'area',
      'characteristic',
      'expansive',
      'invasive',
      'colour',
      'ph',
      'conductivity',
      'drainage',
      'hdi',
      'secchi',
      'plankton',
      'tds',
    ])
  })

  it('kardynalne = lista z przewodnika (8); przezroczystość niekardynalna; plankton i TDS poza oceną', () => {
    const structure = m.indicators.filter((i) => i.parameter === 'structure')
    expect(structure.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual([
      'characteristic',
      'expansive',
      'invasive',
      'colour',
      'ph',
      'conductivity',
      'drainage',
      'hdi',
    ])
    expect(m.indicators.filter((i) => isExcluded(i, { hdiMeasured: 'yes' })).map((i) => i.id)).toEqual(['plankton', 'tds'])
    expect(m.indicators.filter((i) => isExcluded(i, { hdiMeasured: 'no' })).map((i) => i.id)).toEqual(['hdi', 'plankton', 'tds'])
    expect(ind('plankton').excludedNote).toMatch(/pomocniczy/)
    expect(ind('hdi').excludedNote).toMatch(/DOC\/DIC/)
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...m.otherFields, ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: od początku lipca do połowy września', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    for (const d of ['2011-07-01', '2011-08-12', '2016-09-15']) expect(date.warn!(d), d).toBeNull()
    for (const d of ['2011-06-30', '2016-09-16', '2016-10-01']) expect(date.warn!(d), d).toMatch(/poza zalecanym/)
  })

  it('kody oddziaływań bez duplikatów, z melioracjami, torfem, wędkarstwem i X', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['J02.01.02', 'C01.03.02', 'F02.03', 'B02.02', 'X']) expect(codes).toContain(c)
  })
})

describe('metodyka 3160 – progi bezwzględne', () => {
  it('pH: 3–7 FV, 7–8 i 2–3 U1, >8 i <2 U2', () => {
    expect([3, 4.9, 7, 7.01, 8, 8.01, 2.99, 2, 1.99].map(gradePH3160)).toEqual(['FV', 'FV', 'FV', 'U1', 'U1', 'U2', 'U1', 'U1', 'U2'])
  })
  it('przewodnictwo: <100 FV, 100–500 U1, >500 U2', () => {
    expect([19, 99.9, 100, 500, 501].map(gradeConductivity3160)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('barwa: ≤50 FV, 51–100 U1, >100 U2 (luki domknięte)', () => {
    expect([26, 50, 50.5, 51, 100, 100.5, 101].map(gradeColour3160)).toEqual(['FV', 'FV', 'U1', 'U1', 'U1', 'U2', 'U2'])
  })
  it('HDI: >50 FV, 40–50 U1, <40 U2', () => {
    expect([89, 50.1, 50, 40, 39.9].map(gradeHDI3160)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('TDS przy pierwszym badaniu: <60 FV, 60–100 U1, >100 U2', () => {
    expect([19.6, 59.9, 60, 100, 101].map(gradeTDS3160)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('przezroczystość: do dna albo >1,5 FV, 0,5–1,5 U1, <0,5 U2', () => {
    expect([2, 1.5, 0.5, 0.49].map((v) => gradeSecchi3160(v, false))).toEqual(['FV', 'U1', 'U1', 'U2'])
    expect(gradeSecchi3160(0.3, true)).toBe('FV')
  })
  it('ekspansywne: 0 FV, do 5% U1, >5% U2; powierzchnia: ≥−10% FV, do −30% U1, ≤−30% U2', () => {
    expect([0, 0.5, 5, 5.1].map(gradeExpansive3160)).toEqual(['FV', 'U1', 'U1', 'U2'])
    expect([20, 0, -10, -10.1, -29.9, -30].map(gradeAreaChange3160)).toEqual(['FV', 'FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('worse: gorsza z ocen, null pomijany', () => {
    expect(worse('FV', 'U1')).toBe('U1')
    expect(worse('U2', null, 'U1')).toBe('U2')
    expect(worse(null, undefined)).toBeNull()
  })
})

describe('metodyka 3160 – HDI', () => {
  it('wzór Górniaka: ∛(100/log EC · 10·DOC/DIC · (9,5−pH)·20)', () => {
    const r = computeHDI(4.9, 19, 20, 2)!
    expect(r.d1).toBeCloseTo(100 / Math.log10(19), 6)
    expect(r.d2).toBe(100)
    expect(r.d3).toBeCloseTo(92, 6)
    expect(r.hdi).toBeCloseTo(Math.cbrt(r.d1 * 100 * 92), 6)
    expect(r.hdi).toBeCloseTo(89.6, 1)
  })

  it('brak sensu wzoru → null (EC ≤ 1, DIC 0, pH ≥ 9,5, brak danych)', () => {
    expect(computeHDI(4.9, 1, 20, 2)).toBeNull()
    expect(computeHDI(4.9, 19, 20, 0)).toBeNull()
    expect(computeHDI(9.5, 19, 20, 2)).toBeNull()
    expect(computeHDI(undefined, 19, 20, 2)).toBeNull()
  })

  it('pH i przewodnictwo bierze z innych wskaźników; HDI z laboratorium ma pierwszeństwo', () => {
    const c = ctx({
      indicators: {
        ph: { inputs: { value: 4.9 }, value: '', grade: '' },
        conductivity: { inputs: { value: 19 }, value: '', grade: '' },
      },
    })
    expect(suggest('hdi', { doc: 20, dic: 2 }, c)).toBe('FV')
    expect(ind('hdi').explain!({ doc: 20, dic: 2 }, c)).toMatch(/HDI = 89,6/)
    expect(ind('hdi').describe!({ doc: 20, dic: 2 }, c)).toBe('HDI 89,6 (DOC 20, DIC 2 mg C/dm³)')
    expect(suggest('hdi', { doc: 20, dic: 2, hdi: 45 }, c)).toBe('U1')
    expect(suggest('hdi', { doc: 20, dic: 2 })).toBeNull()
    expect(ind('hdi').explain!({ doc: 20, dic: 2 }, ctx())).toMatch(/brakuje pH albo przewodnictwa/)
    expect(ind('hdi').warn!({ hdi: 45 }, ctx())).toMatch(/może nie być dystroficzny/)
  })

  it('nieoznaczony: opis „Nie oznaczono”, ostrzeżenie przy wpisanych danych', () => {
    const no = ctx({ site: { hdiMeasured: 'no' } })
    expect(ind('hdi').describe!({}, no)).toBe('Nie oznaczono (brak DOC/DIC)')
    expect(ind('hdi').describe!({}, ctx())).toBe('')
    expect(ind('hdi').warn!({ hdi: 70 }, no)).toMatch(/„Nie”/)
  })
})

describe('metodyka 3160 – zmiana względem poprzedniego badania', () => {
  it('pH: niekorzystny wzrost (bez roślin) albo spadek (makrofitowe); ≥0,5 U2, mniej U1', () => {
    expect(computeChange(5.0, 4.9, PH_CHANGE, open)!.grade).toBe('U1')
    expect(computeChange(5.4, 4.9, PH_CHANGE, open)!.grade).toBe('U2')
    expect(computeChange(4.8, 4.9, PH_CHANGE, open)!.grade).toBe('FV')
    expect(computeChange(5.4, 4.9, PH_CHANGE, macro)!.grade).toBe('FV')
    expect(computeChange(4.6, 4.9, PH_CHANGE, macro)!.grade).toBe('U1')
    expect(computeChange(4.3, 4.9, PH_CHANGE, macro)!.grade).toBe('U2')
  })

  it('przewodnictwo: próg 20 µS/cm, w makrofitowych 50', () => {
    expect(computeChange(40, 19, EC_CHANGE, open)!.grade).toBe('U2')
    expect(computeChange(40, 19, EC_CHANGE, macro)!.grade).toBe('U1')
    expect(computeChange(70, 19, EC_CHANGE, macro)!.grade).toBe('U2')
  })

  it('przezroczystość: spadek w %, ≥20% U2', () => {
    expect(computeChange(1.9, 2, SECCHI_CHANGE)!.grade).toBe('U1')
    expect(computeChange(1.6, 2, SECCHI_CHANGE)!.grade).toBe('U2')
    expect(computeChange(2.2, 2, SECCHI_CHANGE)!.grade).toBe('FV')
    expect(computeChange(1, 0, SECCHI_CHANGE)).toBeNull()
  })

  it('ocena wskaźnika = gorsza z wartości bezwzględnej i zmiany; wybór „Zmiana” ma pierwszeństwo', () => {
    expect(suggest('ph', { value: 4.9 }, open)).toBe('FV')
    expect(suggest('ph', { value: 5.5, previous: 4.9 }, open)).toBe('U2')
    expect(suggest('ph', { value: 5.0, previous: 4.9, change: 'none' }, open)).toBe('FV')
    expect(suggest('ph', { value: 7.5, change: 'none' }, open)).toBe('U1')
    expect(suggest('conductivity', { value: 150, previous: 140 }, macro)).toBe('U1')
    expect(ind('ph').explain!({ value: 5.5, previous: 4.9 }, open)).toMatch(/\+0,6 pH.*U2/)
    expect(ind('ph').warn!({ value: 5.5, previous: 4.9, change: 'none' }, open)).toMatch(/przekracza próg U2/)
    expect(ind('ph').warn!({ value: 5.0, previous: 4.9, change: 'none' }, open)).toBeNull()
  })

  it('TDS: przy kolejnym badaniu liczy się tylko zmiana, przy pierwszym wartość', () => {
    expect(suggest('tds', { value: 80 }, open)).toBe('U1')
    expect(suggest('tds', { value: 80, previous: 78 }, macro)).toBe('U1')
    expect(suggest('tds', { value: 80, previous: 85 }, open)).toBe('FV')
    expect(suggest('tds', { value: 80, change: 'none' }, open)).toBe('FV')
  })

  it('przezroczystość do dna (z pola albo z głębokości maks.) → FV, zmiana pomijana', () => {
    const site = ctx({ site: { maxDepth: 2.1 } })
    expect(suggest('secchi', { value: 2.1 }, site)).toBe('FV')
    expect(ind('secchi').explain!({ value: 2.1 }, site)).toMatch(/do dna/)
    expect(suggest('secchi', { value: 1.0, previous: 2 }, site)).toBe('U2')
    expect(suggest('secchi', { value: 0.4, toBottom: 'yes', previous: 2 }, site)).toBe('FV')
    expect(suggest('secchi', { value: 2.1, toBottom: 'no' }, site)).toBe('FV')
    expect(suggest('secchi', { value: 1.2 }, ctx())).toBe('U1')
    expect(ind('secchi').warn!({ value: 3 }, site)).toMatch(/większa niż głębokość/)
  })
})

describe('metodyka 3160 – wskaźniki opisowe', () => {
  it('gatunki charakterystyczne: spis „gatunek udział”, ostrzeżenie przy „Brak roślin” ze spisem', () => {
    const species = [
      { species: 'Potamogeton natans', share: '<60%' },
      { species: '', share: '5%' },
      { species: 'Sphagnum sp.', share: '' },
    ]
    expect(speciesShares(species)).toHaveLength(2)
    expect(ind('characteristic').describe!({ species, choice: 'stable' }, ctx())).toBe('Potamogeton natans <60%, Sphagnum sp.')
    expect(ind('characteristic').explain!({ species }, ctx())).toBe('W spisie: 2 (z katalogu gatunków charakterystycznych: 1).')
    expect(ind('characteristic').warn!({ species, choice: 'noneNatural' }, ctx())).toMatch(/Brak roślin/)
    expect(suggest('characteristic', { choice: 'noneNatural' })).toBe('FV')
    expect(suggest('characteristic', { choice: 'decline' })).toBe('U1')
    expect(suggest('characteristic', { choice: 'loss' })).toBe('U2')
  })

  it('wątpliwy brak roślin → FV tylko przy pozostałych FV (ostrzeżenie)', () => {
    const c = ctx({ indicators: { colour: { inputs: {}, value: '', grade: 'U1' } } })
    expect(suggest('characteristic', { choice: 'noneDoubt' })).toBe('FV')
    expect(ind('characteristic').warn!({ choice: 'noneDoubt' }, c)).toMatch(/Rozważ obniżenie/)
    expect(ind('characteristic').warn!({ choice: 'noneDoubt' }, ctx())).toBeNull()
  })

  it('inwazyjne: moczarka nie obniża, inny gatunek przy „Brak” ostrzega', () => {
    expect(suggest('invasive', { choice: 'none' })).toBe('FV')
    expect(ind('invasive').describe!({ choice: 'none', species: 'Elodea canadensis – pojedynczo' }, ctx())).toBe('Brak; Elodea canadensis – pojedynczo')
    expect(ind('invasive').warn!({ choice: 'none', species: 'Elodea canadensis' }, ctx())).toBeNull()
    expect(ind('invasive').warn!({ choice: 'none', species: 'Elodea nuttallii' }, ctx())).toMatch(/Elodea nuttallii/)
  })

  it('barwa: pomiar ma pierwszeństwo przed opisem, rozbieżność ostrzega', () => {
    expect(suggest('colour', { visual: 'darkBrown' })).toBe('U1')
    expect(suggest('colour', { value: 26, visual: 'darkBrown' })).toBe('FV')
    expect(ind('colour').warn!({ value: 26, visual: 'darkBrown' }, ctx())).toMatch(/26 mg Pt/)
    expect(ind('colour').describe!({ visual: 'brown' }, ctx())).toBe('Brązowa, klarowna lub o niewielkiej mętności')
  })

  it('melioracje: opis z liczbą rowów, ostrzeżenie przy „Brak” z połączonymi rowami', () => {
    expect(ind('drainage').describe!({ choice: 'minor', ditches: 2, connected: 'yes' }, ctx())).toBe(
      'Infrastruktura melioracyjna w niewielkim stopniu oddziałuje na warunki wodne; rowów: 2, połączone ze zbiornikiem',
    )
    expect(ind('drainage').warn!({ choice: 'none', ditches: 2, connected: 'yes' }, ctx())).toMatch(/zneutralizowane/)
  })

  it('ekspansywne i powierzchnia: opisy', () => {
    expect(ind('expansive').describe!({ value: 3, species: 'Ceratophyllum demersum 3%' }, ctx())).toBe('Ceratophyllum demersum 3%; łącznie 3%')
    expect(ind('area').describe!({ choice: 'decline', changePct: -15 }, ctx())).toBe('Spadek o 15%')
    expect(suggest('area', { choice: 'stable', changePct: -15 })).toBe('U1')
    expect(suggest('area', { choice: 'unknown' })).toBe('XX')
  })

  it('katalog: grupy i warstwy domyślne', () => {
    expect(findSpecies3160('utricularia  MINOR')?.group).toBe('utricularia')
    expect(findSpecies3160('Nymphaea x borealis')?.group).toBe('nymphaeid')
    expect(defaultLayer3160(findSpecies3160('Sphagnum cuspidatum')!)).toBe('D')
    expect(defaultLayer3160(findSpecies3160('Nuphar pumila')!)).toBe('C')
    expect(m.speciesInfo!('Ceratophyllum demersum')).toBe('rodzimy gatunek ekspansywny')
  })
})

describe('ocena struktury (reguła silnika)', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(kuzniczek)
    v.site.hdiMeasured = 'yes'
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    v.prospects.grade = 'FV'
    return v
  }

  it('plankton i TDS U2 przy pozostałych FV → struktura FV', () => {
    const v = allFv()
    v.indicators.plankton.grade = 'U2'
    v.indicators.tds.grade = 'U2'
    expect(assessCard(m, v)).toMatchObject({ structure: 'FV', overall: 'FV' })
  })

  it('przezroczystość: U1 nie psuje FV, U2 daje U1', () => {
    const v = allFv()
    v.indicators.secchi.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('FV')
    v.indicators.secchi.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
  })

  it('jeden kardynalny U1 → U1 (silnik; tab. 2 dopuszcza jeden U1 przy FV – opisane w specyfikacji)', () => {
    const v = allFv()
    v.indicators.colour.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('U1')
  })

  it('HDI XX liczy się tylko, gdy DOC/DIC oznaczono', () => {
    const v = allFv()
    v.indicators.hdi.grade = 'XX'
    expect(assessCard(m, v).structure).toBe('XX')
    v.site.hdiMeasured = 'no'
    expect(assessCard(m, v).structure).toBe('FV')
    v.indicators.hdi.grade = ''
    expect(assessCard(m, v).missing).toEqual([])
  })
})

describe('przykład Jezioro Kuźniczek (karta z przewodnika, 2011)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(kuzniczek)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny jak w karcie: wszystko FV, ocena ogólna FV', () => {
    expect(assessCard(m, kuzniczek)).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV', missing: [] })
  })

  it('podpowiedzi zgodne z kartą (HDI bez danych – bez podpowiedzi)', () => {
    const c = ctx({ site: kuzniczek.site, indicators: kuzniczek.indicators })
    for (const i of m.indicators) {
      const s = i.suggest!(kuzniczek.indicators[i.id].inputs, c)
      if (i.id === 'hdi') expect(s).toBeNull()
      else expect(s, i.id).toBe(kuzniczek.indicators[i.id].grade)
    }
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    const c = ctx({ site: kuzniczek.site, indicators: kuzniczek.indicators })
    for (const i of m.indicators) expect(i.describe!(kuzniczek.indicators[i.id].inputs, c), i.id).toBe(kuzniczek.indicators[i.id].value)
  })

  it('bez ostrzeżeń; zanonimizowany wykonawca; bez zdjęć fitosocjologicznych', () => {
    const c = ctx({ site: kuzniczek.site, indicators: kuzniczek.indicators })
    for (const i of m.indicators) expect(i.warn?.(kuzniczek.indicators[i.id].inputs, c) ?? null, i.id).toBeNull()
    expect(examples3160).toHaveLength(1)
    expect(kuzniczek.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(kuzniczek)).not.toMatch(/Owsianny|Gąbka|Joniak|Wilk-Woźniak/)
    expect(kuzniczek.releves).toHaveLength(0)
  })
})
