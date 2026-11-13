import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { CardValues, Grade, IndicatorContext, InputValues } from '../../7120/habitats/types'
import { bukowo2, examples1150 } from './examples'
import {
  countCommunities,
  describeTransect,
  gradeArea1150,
  gradeChlorides1150,
  gradeCommunities1150,
  gradeNitrogen1150,
  gradePH1150,
  gradePhosphorus1150,
  gradeSecchi1150,
  indicator1150 as ind,
  methodology1150 as m,
  speciesWord,
  transectHits,
} from './methodology'
import { defaultLayer1150, findSpecies1150 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues, c: IndicatorContext = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const row = (zone: string, species: string, plots: number) => ({ zone, species, plots })

describe('metodyka 1150 – struktura', () => {
  it('kod *1150 (priorytetowe), transekt nurkowy 50×30 m, jedno zdjęcie 5×5 m', () => {
    expect(habitatCode(m)).toBe('*1150')
    expect(m.name).toBe('Zalewy i jeziora przymorskie (laguny)')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('50x30 m, podwodny')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(emptyCardValues(m).releves).toHaveLength(1)
  })

  it('wskaźniki w kolejności tab. 2, azot ogólny zamiast nieorganicznego (2015)', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Liczba zbiorowisk',
      'Obecność hydrofitów',
      'Obecność ramienic',
      'Zasilanie wodami słonymi',
      'Przezroczystość wody',
      'Azot ogólny',
      'Fosfor ogólny',
      'Zawartość chlorków',
      'Odczyn wody',
    ])
  })

  it('kardynalne: wszystkie wskaźniki struktury poza ramienicami; ramienice pominięte w ocenie (pomocnicze od 2015)', () => {
    const structure = m.indicators.filter((i) => i.parameter === 'structure')
    expect(structure.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual([
      'communities',
      'hydrophytes',
      'saltWater',
      'secchi',
      'nitrogen',
      'phosphorus',
      'chlorides',
      'ph',
    ])
    expect(m.indicators.filter((i) => isExcluded(i, {})).map((i) => i.id)).toEqual(['charophytes'])
    expect(ind('charophytes').excludedNote).toMatch(/pomocniczy/)
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...m.otherFields, ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: ostrzeżenie poza lipcem–wrześniem', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2008-09-20')).toBeNull()
    expect(date.warn!('2013-07-01')).toBeNull()
    expect(date.warn!('2013-10-02')).toMatch(/poza optymalnym/)
  })

  it('kody oddziaływań bez duplikatów, z eutrofizacją, rybołówstwem i zanieczyszczeniem wód', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['K02.03', 'F02', 'H01', 'X']) expect(codes).toContain(c)
  })
})

describe('metodyka 1150 – progi', () => {
  it('liczba zbiorowisk: ≥4 FV, 2–3 U1, <2 U2', () => {
    expect([5, 4, 3, 2, 1, 0].map(gradeCommunities1150)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('liczba zbiorowisk: wpisana liczba > lista > pole „Zbiorowiska roślinne” stanowiska', () => {
    const site = { communities: 'Lemnetum minoris, Phragmitetum australis; Potametum pectinati\nNajadetum marinae' }
    expect(countCommunities(site.communities)).toBe(4)
    expect(suggest('communities', {}, ctx({ site }))).toBe('FV')
    expect(ind('communities').explain!({}, ctx({ site }))).toMatch(/4 nazw z pola „Zbiorowiska roślinne”/)
    expect(suggest('communities', { list: 'A, B' }, ctx({ site }))).toBe('U1')
    expect(suggest('communities', { count: 1, list: 'A, B' }, ctx({ site }))).toBe('U2')
    expect(suggest('communities', {})).toBeNull()
  })

  it('przezroczystość: ≥0,5 FV, 0,2–0,5 U1 (luka 0,4–0,5 → U1), <0,2 U2', () => {
    expect([1, 0.5, 0.45, 0.4, 0.2, 0.19].map(gradeSecchi1150)).toEqual(['FV', 'FV', 'U1', 'U1', 'U1', 'U2'])
  })

  it('azot ogólny: 0,3–6,5 FV, do 15 U1, <0,3 albo >15 U2', () => {
    expect([0.3, 0.56, 6.5, 6.6, 15, 15.1, 0.29].map(gradeNitrogen1150)).toEqual(['FV', 'FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('fosfor: ≤0,5 FV, 0,5–1 U1, >1 U2; poniżej 0,1 ostrzeżenie bez gorszej oceny', () => {
    expect([0.05, 0.5, 0.51, 0.781, 1, 1.2].map(gradePhosphorus1150)).toEqual(['FV', 'FV', 'U1', 'U1', 'U1', 'U2'])
    expect(ind('phosphorus').warn!({ value: 0.05 }, ctx())).toMatch(/0,1/)
    expect(ind('phosphorus').warn!({ value: 0.3 }, ctx())).toBeNull()
  })

  it('chlorki: >500 FV, 200–500 U1, <200 U2', () => {
    expect([831.3, 500.1, 500, 200, 199].map(gradeChlorides1150)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('pH wg modyfikacji 2015: 6,5–8,0 FV; 6,0–6,49 i 8,01–9,5 U1; poza tym U2', () => {
    expect([6.5, 7.5, 8, 8.01, 9.5, 9.51, 6.49, 6, 5.99].map(gradePH1150)).toEqual(['FV', 'FV', 'FV', 'U1', 'U1', 'U2', 'U1', 'U1', 'U2'])
    expect(ind('ph').describe!({ value: 7.4, conductivity: 1250 }, ctx())).toBe('pH 7,4, przewodność 1250 µS/cm')
  })

  it('zasilanie wodami słonymi: ciągłe i okazjonalne FV, sporadyczne U1, brak U2', () => {
    expect(['continuous', 'occasional', 'sporadic', 'none'].map((choice) => suggest('saltWater', { choice }))).toEqual(['FV', 'FV', 'U1', 'U2'])
  })

  it('powierzchnia: trzcina rośnie → U2; trzcina ≤ i fitolitoral ≥ → FV; inne → U1; brak danych → XX', () => {
    expect(gradeArea1150('stable', 'stable')).toBe('FV')
    expect(gradeArea1150('decrease', 'increase')).toBe('FV')
    expect(gradeArea1150('stable', 'decrease')).toBe('U1')
    expect(gradeArea1150('increase', 'increase')).toBe('U2')
    expect(gradeArea1150('increase', 'unknown')).toBe('U2')
    expect(gradeArea1150('unknown', 'stable')).toBe('XX')
    expect(gradeArea1150('', 'stable')).toBeNull()
    const noHydro = ctx({ indicators: { hydrophytes: { inputs: { choice: 'absent' }, value: '', grade: 'U2' } } })
    expect(ind('area').warn!({ reed: 'stable', littoral: 'stable' }, noHydro)).toMatch(/brak hydrofitów/)
    expect(ind('area').warn!({ reed: 'increase', littoral: 'stable' }, noHydro)).toBeNull()
  })
})

describe('metodyka 1150 – transekt nurkowy', () => {
  const transect = [row('A', 'Lemna trisulca', 2), row('B', 'Potamogeton pectinatus', 3), row('B', 'Chara aspera', 1), row('C', 'zła', 11), row('', 'bez strefy', 1)]

  it('frekwencja = poletka/10; odrzuca niekompletne wiersze i poletka poza 0–10', () => {
    expect(transectHits(transect).map((h) => `${h.zone} ${h.name} ${h.freq}`)).toEqual(['A Lemna trisulca 20', 'B Potamogeton pectinatus 30', 'B Chara aspera 10'])
  })

  it('opis strefami, pusta strefa = brak roślinności podwodnej', () => {
    expect(describeTransect(transect)).toBe(
      'Strefa A (0–0,25 m): Lemna trisulca 20%; strefa B (0,25–0,5 m): Potamogeton pectinatus 30%, Chara aspera 10%; strefa C (0,5–1,0 m): brak roślinności podwodnej',
    )
    expect(describeTransect([])).toBe('')
  })

  it('podsumowanie transektu z polską odmianą', () => {
    expect(ind('hydrophytes').explain!({ transect }, ctx())).toBe('Transekt: 3 gatunki w 2 z 3 stref.')
    expect([1, 2, 5, 12, 22].map(speciesWord)).toEqual(['gatunek', 'gatunki', 'gatunków', 'gatunków', 'gatunki'])
  })

  it('hydrofity: ostrzeżenie, gdy w transekcie są, a wybrano „Brak”', () => {
    expect(ind('hydrophytes').warn!({ transect, choice: 'absent' }, ctx())).toMatch(/Lemna trisulca, Potamogeton pectinatus/)
    expect(ind('hydrophytes').warn!({ transect, choice: 'communities' }, ctx())).toBeNull()
  })

  it('ramienice: transekt z hydrofitów podpowiada i ostrzega', () => {
    const c = ctx({ indicators: { hydrophytes: { inputs: { transect }, value: '', grade: '' } } })
    expect(ind('charophytes').explain!({}, c)).toBe('W transekcie: Chara aspera (strefa B, 10%).')
    expect(ind('charophytes').warn!({ choice: 'absent' }, c)).toMatch(/ramienice/)
    expect(ind('charophytes').warn!({ choice: 'sporadic' }, c)).toBeNull()
  })

  it('katalog: grupy i warstwy domyślne', () => {
    expect(findSpecies1150('potamogeton  PECTINATUS')?.group).toBe('submerged')
    expect(findSpecies1150('Chara tomentosa')?.group).toBe('charophyte')
    expect(defaultLayer1150(findSpecies1150('Phragmites australis')!)).toBe('C')
    expect(defaultLayer1150(findSpecies1150('Fontinalis antipyretica')!)).toBe('D')
    expect(m.speciesInfo!('Najas marina')).toBe('hydrofit zanurzony')
  })
})

describe('ocena struktury: ramienice nie psują FV', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(bukowo2)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    v.prospects.grade = 'FV'
    return v
  }

  it('ramienice U2 przy pozostałych FV → struktura FV', () => {
    const v = allFv()
    v.indicators.charophytes.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('FV')
    expect(assessCard(m, v).overall).toBe('FV')
  })

  it('jeden kardynalny U2 → struktura U2', () => {
    const v = allFv()
    v.indicators.chlorides.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U2')
  })

  it('brak oceny ramienic nie blokuje oceny', () => {
    const v = allFv()
    v.indicators.charophytes.grade = ''
    expect(assessCard(m, v).missing).toEqual([])
    expect(assessCard(m, v).structure).toBe('FV')
  })
})

describe('przykład Bukowo 2 (karta z przewodnika, 2008)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(bukowo2)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny jak w karcie: powierzchnia U1, struktura U1, perspektywy U1, ogólna U1', () => {
    const a = assessCard(m, bukowo2)
    expect(a).toMatchObject({ area: 'U1', structure: 'U1', prospects: 'U1', overall: 'U1', missing: [] })
  })

  it('podpowiedzi zgodne z ekspertem; powierzchnia bez trendów – bez podpowiedzi', () => {
    const c = ctx({ site: bukowo2.site, indicators: bukowo2.indicators })
    for (const i of m.indicators) {
      const s = i.suggest!(bukowo2.indicators[i.id].inputs, c)
      if (i.id === 'area') expect(s).toBeNull()
      else expect(s, i.id).toBe(bukowo2.indicators[i.id].grade)
    }
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    const c = ctx({ site: bukowo2.site, indicators: bukowo2.indicators })
    for (const i of m.indicators) expect(i.describe!(bukowo2.indicators[i.id].inputs, c), i.id).toBe(bukowo2.indicators[i.id].value)
  })

  it('zanonimizowany wykonawca, jedno zdjęcie szuwaru', () => {
    expect(examples1150).toHaveLength(1)
    expect(bukowo2.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(bukowo2)).not.toMatch(/Zalewska|Chmara|Gałosz/)
    expect(bukowo2.releves).toHaveLength(1)
  })
})
