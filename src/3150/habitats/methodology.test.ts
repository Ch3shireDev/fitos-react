import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { CardValues, Grade, IndicatorContext, InputValues } from '../../7120/habitats/types'
import { brzeg1, examples3150 } from './examples'
import {
  combinationFacts,
  dateWarning3150,
  degenerationNames,
  gradeCombination3150,
  gradeConductivity3150,
  gradePH3150,
  gradeSecchi3150,
  gradeZooplankton3150,
  indicator3150 as ind,
  methodology3150 as m,
  pleustoLimit3150,
  worseGrade,
} from './methodology'
import { defaultLayer3150, findSpecies3150, isRareName } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues, c: IndicatorContext = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const sp = (name: string, cover?: number) => ({ name, cover })

describe('metodyka 3150 – struktura', () => {
  it('kod 3150 bez gwiazdki, transekt 10×100 m, jedno zdjęcie domyślnie', () => {
    expect(habitatCode(m)).toBe('3150')
    expect(m.name).toBe('Starorzecza i naturalne eutroficzne zbiorniki wodne ze zbiorowiskami z Nympheion, Potamion')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('10x100 m')
    expect(emptyCardValues(m).releves).toHaveLength(1)
  })

  it('wskaźniki w kolejności tab. 2 (plankton jako jeden wskaźnik)', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Charakterystyczna kombinacja zbiorowisk w obrębie transektu',
      'Gatunki wskazujące na degenerację siedliska',
      'Konduktywność (przewodnictwo elektrolityczne)',
      'Przezroczystość wody',
      'Barwa wody',
      'Odczyn wody',
      'Fito- i zooplankton',
    ])
  })

  it('kardynalne wg cyklu 2023–2025: kombinacja, degeneracja, konduktywność, przezroczystość; nic nie jest pominięte', () => {
    const structure = m.indicators.filter((i) => i.parameter === 'structure')
    expect(structure.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['combination', 'degeneration', 'conductivity', 'secchi'])
    expect(structure.filter((i) => !isCardinal(i, {})).map((i) => i.id)).toEqual(['colour', 'ph', 'plankton'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
    expect(ind('area').parameter).toBe('area')
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...m.otherFields, ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
    for (const g of ['FV', 'U1', 'U2'] as const) expect(m.prospects.thresholds[g]).toBeTruthy()
  })

  it('termin: lipiec–15 września bez ostrzeżenia; druga połowa czerwca – łagodne; reszta – poza oknem', () => {
    expect(dateWarning3150('2024-07-01')).toBeNull()
    expect(dateWarning3150('2024-09-15')).toBeNull()
    expect(dateWarning3150('2024-06-20')).toMatch(/połowy czerwca/)
    expect(dateWarning3150('2011-06-13')).toMatch(/poza oknem/)
    expect(dateWarning3150('2024-09-16')).toMatch(/poza oknem/)
    expect(dateWarning3150('')).toBeNull()
  })

  it('kody oddziaływań bez duplikatów, z eutrofizacją, odpadami, drogami i wydobyciem żwiru', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['K02.03', 'E03.04', 'D01.02', 'C01.01', 'J02.03', 'I01', 'X']) expect(codes).toContain(c)
  })
})

describe('metodyka 3150 – progi liczbowe', () => {
  it('konduktywność: ≤600 FV, 600–900 U1 (899,5 też), >900 U2', () => {
    expect([433, 600, 600.1, 899, 899.5, 900, 900.1].map(gradeConductivity3150)).toEqual(['FV', 'FV', 'U1', 'U1', 'U1', 'U1', 'U2'])
    expect(ind('conductivity').warn!({ value: 0.43 }, ctx())).toMatch(/mS\/cm/)
    expect(ind('conductivity').describe!({ value: 433 }, ctx())).toBe('433 µS/cm')
  })

  it('przezroczystość: do dna FV; >2,5 FV; 1,0–2,5 U1; <1 U2; zbiornik <1 m bez dna – U1', () => {
    expect(gradeSecchi3150(1, true)).toBe('FV')
    expect(gradeSecchi3150(undefined, true)).toBe('FV')
    expect(gradeSecchi3150(2.6, false)).toBe('FV')
    expect(gradeSecchi3150(2.5, false)).toBe('U1')
    expect(gradeSecchi3150(1, false)).toBe('U1')
    expect(gradeSecchi3150(0.9, false)).toBe('U2')
    expect(gradeSecchi3150(0.5, false, 0.8)).toBe('U1')
    expect(gradeSecchi3150(0.5, false, 1.5)).toBe('U2')
    expect(gradeSecchi3150(undefined, false)).toBeNull()
    expect(ind('secchi').explain!({ value: 0.5, toBottom: 'no', maxDepth: 0.8 }, ctx())).toMatch(/płytszy niż 1 m/)
    expect(ind('secchi').warn!({ value: 2, maxDepth: 1.5 }, ctx())).toMatch(/do dna/)
  })

  it('pH: 6,5–7,9 FV (7,95 też), 8,0–9,0 U1, >9 U2, <6,5 U1 z wyjaśnieniem', () => {
    expect([6.5, 7.7, 7.95, 8, 8.62, 9, 9.01, 6.4].map(gradePH3150)).toEqual(['FV', 'FV', 'FV', 'U1', 'U1', 'U1', 'U2', 'U1'])
    expect(ind('ph').explain!({ value: 6.2 }, ctx())).toMatch(/interpretacja/)
    expect(ind('ph').explain!({ value: 7.2 }, ctx())).toBeNull()
  })

  it('zooplankton: <5% FV, 5–50% U1, >50% U2', () => {
    expect([0, 4.9, 5, 50, 50.1].map(gradeZooplankton3150)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
})

describe('metodyka 3150 – kombinacja zbiorowisk', () => {
  const facts = (o: Partial<ReturnType<typeof combinationFacts>>) => ({ fragmentary: false, rare: [], derived: [], nymph: true, elod: true, ...o })

  it('progi tab. 2: obie grupy FV, brak jednej U1, brak obu U2, rogatek >25% U1, kadłubowe U2', () => {
    expect(gradeCombination3150(facts({}), '3150-1')).toBe('FV')
    expect(gradeCombination3150(facts({ nymph: false }), '3150-1')).toBe('U1')
    expect(gradeCombination3150(facts({ elod: false }), '3150-1')).toBe('U1')
    expect(gradeCombination3150(facts({ nymph: false, elod: false }), '3150-1')).toBe('U2')
    expect(gradeCombination3150(facts({ cerato: 25 }), '3150-1')).toBe('FV')
    expect(gradeCombination3150(facts({ cerato: 26 }), '3150-1')).toBe('U1')
    expect(gradeCombination3150(facts({ fragmentary: true }), '3150-1')).toBe('U2')
    expect(gradeCombination3150(facts({ nymph: undefined }), '3150-1')).toBeNull()
  })

  it('pleustofity: próg 25% w jeziorach (i bez podtypu), 50% w starorzeczach', () => {
    expect(pleustoLimit3150('3150-1')).toBe(25)
    expect(pleustoLimit3150('3150-2')).toBe(50)
    expect(pleustoLimit3150('')).toBe(25)
    expect(gradeCombination3150(facts({ pleusto: 40 }), '3150-2')).toBe('FV')
    expect(gradeCombination3150(facts({ pleusto: 40 }), '3150-1')).toBe('U1')
    expect(gradeCombination3150(facts({ pleusto: 51 }), '3150-2')).toBe('U1')
  })

  it('zbiorowisko z gatunkiem rzadkim (salwinia, kotewka, grzybieńczyk, pływacze) – FV mimo kadłubowego', () => {
    expect(gradeCombination3150(facts({ fragmentary: true, rare: ['Salvinia natans'] }), '3150-2')).toBe('FV')
    expect(gradeCombination3150(facts({ nymph: false, elod: false, rare: ['tak'] }), '3150-2')).toBe('FV')
    expect(['Salvinia natans', 'Trapa natans', 'Nymphoides peltata', 'Utricularia vulgaris', 'Utricularia intermedia'].every(isRareName)).toBe(true)
    expect(isRareName('Nuphar lutea')).toBe(false)
  })

  it('puste pola uzupełniane z listy gatunków: grupy, suma pleustofitów, udział rogatka, gatunki rzadkie', () => {
    const species = [sp('Nuphar lutea', 10), sp('Ceratophyllum demersum', 30), sp('Myriophyllum spicatum', 10), sp('Lemna minor', 20), sp('Spirodela polyrhiza', 15)]
    const f = combinationFacts({ species })
    expect(f).toMatchObject({ nymph: true, elod: true, pleusto: 35, cerato: 75, rare: [] })
    expect(suggest('combination', { species }, ctx({ site: { subtype: '3150-2' } }))).toBe('U1')
    expect(ind('combination').explain!({ species }, ctx({ site: { subtype: '3150-2' } }))).toMatch(/Z listy gatunków: nymfeidy, elodeidy, pokrycie pleustofitów, udział rogatka/)
    // wybór w polu ma pierwszeństwo przed listą
    expect(combinationFacts({ species, nymphaeids: 'no', ceratoShare: 10 })).toMatchObject({ nymph: false, cerato: 10 })
    expect(combinationFacts({ species: [sp('Salvinia natans', 5)] }).rare).toEqual(['Salvinia natans'])
    expect(combinationFacts({ species: [sp('Salvinia natans', 5)], rare: 'no' }).rare).toEqual([])
    expect(suggest('combination', {})).toBeNull()
  })

  it('opis do karty', () => {
    expect(ind('combination').describe!({ nymphaeids: 'yes', elodeids: 'no', pleustoCover: 60, fragmentary: 'yes' }, ctx())).toBe(
      'Obecne nymfeidy, brak elodeidów. Jedno zbiorowisko jednogatunkowe (kadłubowe), wykształcone fragmentarycznie. Pleustofity pokrywają ok. 60% powierzchni lustra wody',
    )
  })
})

describe('metodyka 3150 – degeneracja, barwa, plankton', () => {
  it('degeneracja: pusta lista FV; pojedyncze U1; liczne U2; moczarka kanadyjska pomijana', () => {
    expect(suggest('degeneration', { species: [] })).toBe('FV')
    expect(suggest('degeneration', { species: [sp('Elodea canadensis', 30)] })).toBe('FV')
    expect(ind('degeneration').explain!({ species: [sp('Elodea canadensis')] }, ctx())).toMatch(/Moczarka kanadyjska pominięta/)
    expect(suggest('degeneration', { species: [sp('Elodea nuttallii')], abundance: 'single' })).toBe('U1')
    expect(suggest('degeneration', { species: [sp('Azolla filiculoides')], abundance: 'many' })).toBe('U2')
    expect(suggest('degeneration', { species: [sp('Azolla filiculoides')] })).toBeNull()
    expect(degenerationNames([sp('Elodea canadensis'), sp('Elodea nuttallii')])).toEqual({ counted: ['Elodea nuttallii'], ignored: ['Elodea canadensis'] })
    expect(ind('degeneration').describe!({ species: [sp('Elodea nuttallii', 2)], abundance: 'single' }, ctx())).toBe('Elodea nuttallii 2% – pojedyncze osobniki')
  })

  it('degeneracja: ostrzega, gdy gatunek obcy jest w liście transektu, a nie tutaj', () => {
    const c = ctx({ indicators: { combination: { inputs: { species: [sp('Elodea nuttallii', 5), sp('Elodea canadensis', 5)] }, value: '', grade: '' } } })
    expect(ind('degeneration').warn!({ species: [] }, c)).toMatch(/Elodea nuttallii/)
    expect(ind('degeneration').warn!({ species: [sp('Elodea nuttallii')], abundance: 'single' }, c)).toBeNull()
  })

  it('barwa: trzy opisy z tab. 2; własny opis zastępuje etykietę', () => {
    expect(['fv', 'green', 'bluegreen'].map((choice) => suggest('colour', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(ind('colour').describe!({ choice: 'green', note: '' }, ctx())).toBe('Wyraźnie zielone zabarwienie')
    expect(ind('colour').describe!({ choice: 'fv', note: 'Woda słabo przezroczysta' }, ctx())).toBe('Woda słabo przezroczysta')
  })

  it('plankton: gorsza z dwóch ocen; jedna składowa – brak podpowiedzi', () => {
    expect(worseGrade('FV', 'U1')).toBe('U1')
    expect(worseGrade('U2', 'U1')).toBe('U2')
    expect(suggest('plankton', { phyto: 'green', zooEutrophic: 2 })).toBe('FV')
    expect(suggest('plankton', { phyto: 'other', zooEutrophic: 5 })).toBe('U1')
    expect(suggest('plankton', { phyto: 'cyano', zooEutrophic: 2 })).toBe('U2')
    expect(suggest('plankton', { phyto: 'codominance' })).toBeNull()
    expect(ind('plankton').explain!({ phyto: 'codominance' }, ctx())).toMatch(/tylko fitoplanktonu/)
    expect(ind('plankton').explain!({ phyto: 'other', zooEutrophic: 5 }, ctx())).toBe('Fitoplankton FV, zooplankton U1 – przyjęto gorszą.')
    expect(ind('plankton').describe!({ phyto: 'green', zooEutrophic: 60 }, ctx())).toBe('Fitoplankton: Dominacja zielenic; zooplankton: gatunki eutroficzne 60%')
    expect(ind('plankton').describe!({ phyto: 'green', zooEutrophic: 60, zooNote: 'Dominacja wrotków' }, ctx())).toBe(
      'Fitoplankton: Dominacja zielenic; zooplankton: Dominacja wrotków (gatunki eutroficzne 60%)',
    )
  })

  it('katalog: grupy, synonimy, warstwy', () => {
    expect(findSpecies3150('nuphar  LUTEA')?.group).toBe('nymphaeid')
    expect(findSpecies3150('Stuckenia pectinata')?.latin).toBe('Potamogeton pectinatus')
    expect(findSpecies3150('Persicaria amphibia')?.group).toBe('nymphaeid')
    expect(findSpecies3150('Potamogeton x nitens')?.latin).toBe('Potamogeton ×nitens')
    expect(findSpecies3150('Lemna gibba')?.group).toBe('pleustophyte')
    expect(defaultLayer3150(findSpecies3150('Fontinalis antipyretica')!)).toBe('D')
    expect(defaultLayer3150(findSpecies3150('Trapa natans')!)).toBe('C')
    expect(m.speciesInfo!('Elodea canadensis')).toBe('elodeid (roślina zanurzona), obcy, pomijany w ocenie')
    expect(m.speciesInfo!('Salvinia natans')).toBe('pleustofit (wolno pływający), rzadki/chroniony')
    const names = m.speciesCatalog!.map((c) => c.value)
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('ocena struktury 3150: kardynalne decydują, pomocnicze nie psują FV', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(brzeg1)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    return v
  }

  it('pomocnicze (barwa, pH, plankton) U1 przy kardynalnych FV → FV', () => {
    const v = allFv()
    for (const id of ['colour', 'ph', 'plankton']) v.indicators[id].grade = 'U1'
    expect(assessCard(m, v).structure).toBe('FV')
  })

  it('pomocniczy U2 (np. barwa – sinice) → U1, nie U2', () => {
    const v = allFv()
    v.indicators.colour.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
  })

  it('kardynalny U1 → U1, kardynalny U2 → U2', () => {
    const v = allFv()
    v.indicators.secchi.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.conductivity.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U2')
  })
})

describe('przykład Brzeg I (karta z przewodnika, 2011)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(brzeg1)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny jak w karcie: powierzchnia FV, struktura FV, perspektywy FV, ogólna FV', () => {
    expect(assessCard(m, brzeg1)).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV', missing: [] })
  })

  it('podpowiedzi zgodne z oceną ekspertów (plankton U1 przez zooplankton 5%)', () => {
    const c = ctx({ site: brzeg1.site, indicators: brzeg1.indicators })
    for (const i of m.indicators) expect(i.suggest!(brzeg1.indicators[i.id].inputs, c), i.id).toBe(brzeg1.indicators[i.id].grade)
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    const c = ctx({ site: brzeg1.site, indicators: brzeg1.indicators })
    for (const i of m.indicators) expect(i.describe!(brzeg1.indicators[i.id].inputs, c), i.id).toBe(brzeg1.indicators[i.id].value)
  })

  it('starorzecze (3150-2): 40% pleustofitów mieści się w progu 50%; w jeziorze byłoby U1', () => {
    expect(brzeg1.site.subtype).toBe('3150-2')
    expect(suggest('combination', brzeg1.indicators.combination.inputs, ctx({ site: { subtype: '3150-1' } }))).toBe('U1')
  })

  it('zanonimizowany wykonawca, bez koordynatorów; termin z ostrzeżeniem', () => {
    expect(examples3150).toHaveLength(1)
    expect(brzeg1.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(brzeg1)).not.toMatch(/Kuczyńska|Kippen|Nagengast|Wilk-Woźniak/)
    expect(m.siteFields.find((f) => f.name === 'date')!.warn!(brzeg1.site.date)).toMatch(/poza oknem/)
  })
})
