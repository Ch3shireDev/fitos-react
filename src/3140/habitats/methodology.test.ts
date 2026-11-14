import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { CardValues, Grade, IndicatorContext, InputValues } from '../../7120/habitats/types'
import { budzislawskie1, examples3140 } from './examples'
import {
  charophytesOf,
  gradeCharophyteCount3140,
  gradeConductivity3140,
  gradeCoverShallow3140,
  gradeLightZone3140,
  gradeMaxDepth3140,
  gradePH3140,
  indicator3140 as ind,
  lakeTypeOf,
  methodology3140 as m,
  speciesWord,
} from './methodology'
import { acceptedName3140, findSpecies3140, isCharophyte3140 } from './species'

const ctx = (site: InputValues = {}, o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site, ...o })
const suggest = (id: string, inputs: InputValues, c: IndicatorContext = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const DEEP = { lakeType: 'deep', lakeMaxDepth: 20 }
const SHALLOW = { lakeType: 'shallow', lakeMaxDepth: 4 }
const LARGE = { lakeType: 'shallowLarge', lakeMaxDepth: 3.5 }
const sp = (...names: string[]) => names.map((name) => ({ name }))

describe('metodyka 3140 – struktura', () => {
  it('kod 3140 (niepriorytetowe), bez obowiązkowych zdjęć fitosocjologicznych', () => {
    expect(habitatCode(m)).toBe('3140')
    expect(m.name).toMatch(/^Twardowodne oligo- i mezotroficzne zbiorniki z podwodnymi łąkami ramienic/)
    expect(emptyCardValues(m).releves).toHaveLength(0)
    expect(m.releves.fields.some((f) => f.kind === 'releve-species')).toBe(true)
  })

  it('wskaźniki w kolejności tab. 2 (plankton jako dwa wiersze jak w karcie)', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Struktura roślinności ramienicowej',
      'Gatunki charakterystyczne',
      'Gatunki wskazujące na degenerację siedliska, w tym obce gatunki inwazyjne',
      'Maksymalna głębokość występowania łąk ramienicowych',
      'Zasięg strefy świetlnej w jeziorze',
      'Odczyn wody',
      'Konduktywność – przewodnictwo elektrolityczne',
      'Plankton: fitoplankton',
      'Plankton: zooplankton',
    ])
  })

  it('kardynalne: pięć wskaźników z listy pod tab. 2; pomocnicze nie są wykluczone z oceny', () => {
    const structure = m.indicators.filter((i) => i.parameter === 'structure')
    expect(structure.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['charaStructure', 'charophytes', 'degeneration', 'maxDepth', 'lightZone'])
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

  it('termin: ostrzeżenie poza połową czerwca – wrześniem', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2013-07-24')).toBeNull()
    expect(date.warn!('2017-06-20')).toBeNull()
    expect(date.warn!('2024-09-24')).toBeNull()
    expect(date.warn!('2014-10-02')).toMatch(/poza sezonem/)
    expect(date.warn!('2017-06-01')).toMatch(/poza sezonem/)
  })

  it('typ jeziora: wybór z listy, a bez niego z głębokości (>5 m = głębokie)', () => {
    expect(lakeTypeOf({ lakeType: 'shallowLarge', lakeMaxDepth: 3 })).toBe('shallowLarge')
    expect(lakeTypeOf({ lakeMaxDepth: 5.1 })).toBe('deep')
    expect(lakeTypeOf({ lakeMaxDepth: '5' })).toBe('shallow')
    expect(lakeTypeOf({})).toBeUndefined()
  })
})

describe('progi liczbowe (tab. 2)', () => {
  it('pokrycie dna w jeziorach płytkich: >50 FV, 10–50 U1, <10 U2', () => {
    expect(gradeCoverShallow3140(51)).toBe('FV')
    expect(gradeCoverShallow3140(50)).toBe('U1')
    expect(gradeCoverShallow3140(10)).toBe('U1')
    expect(gradeCoverShallow3140(9.9)).toBe('U2')
  })

  it('liczba ramienic: ≥4 FV, 2–3 U1, 0–1 U2', () => {
    expect([5, 4, 3, 2, 1, 0].map(gradeCharophyteCount3140)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('głębokość łąk – głębokie: >5 FV, 5–2,5 U1, <2,5 U2', () => {
    expect(gradeMaxDepth3140(15.4, 'deep')).toBe('FV')
    expect(gradeMaxDepth3140(5, 'deep')).toBe('U1')
    expect(gradeMaxDepth3140(2.5, 'deep')).toBe('U1')
    expect(gradeMaxDepth3140(2.4, 'deep')).toBe('U2')
  })

  it('głębokość łąk – płytkie: do dna FV, ≥1 m U1, <1 m U2; bez głębokości jeziora nie da się rozpoznać FV', () => {
    expect(gradeMaxDepth3140(4, 'shallow', 4)).toBe('FV')
    expect(gradeMaxDepth3140(3.2, 'shallow', 4)).toBe('U1')
    expect(gradeMaxDepth3140(1, 'shallow', 4)).toBe('U1')
    expect(gradeMaxDepth3140(0.8, 'shallow', 4)).toBe('U2')
    expect(gradeMaxDepth3140(0.3, 'shallow', 4)).toBe('U2')
    expect(gradeMaxDepth3140(0.8, 'shallow', 0.8)).toBe('U2')
    expect(gradeMaxDepth3140(3, 'shallow')).toBeNull()
    expect(gradeMaxDepth3140(3, 'shallowLarge', 3)).toBe('FV')
  })

  it('strefa świetlna – głębokie: >15 FV, 15–10 U1, <10 U2; płytkie: do dna FV, ≥2,5 U1, <2,5 U2', () => {
    expect(gradeLightZone3140(20.3, 'deep')).toBe('FV')
    expect(gradeLightZone3140(15, 'deep')).toBe('U1')
    expect(gradeLightZone3140(10, 'deep')).toBe('U1')
    expect(gradeLightZone3140(9.9, 'deep')).toBe('U2')
    expect(gradeLightZone3140(4, 'shallow', 4)).toBe('FV')
    expect(gradeLightZone3140(3, 'shallow', 4)).toBe('U1')
    expect(gradeLightZone3140(2.4, 'shallow', 4)).toBe('U2')
    expect(gradeLightZone3140(3, 'shallow')).toBeNull()
  })

  it('pH: wzrost ≤0,3 FV, ≤1,0 U1, >1,0 U2; bez poprzedniego: 7,0–8,5 FV, poza zakresem brak podpowiedzi', () => {
    expect(gradePH3140(8.4, 8.1)).toBe('FV')
    expect(gradePH3140(7.5, 8.2)).toBe('FV')
    expect(gradePH3140(8.5, 8.1)).toBe('U1')
    expect(gradePH3140(9.1, 8.1)).toBe('U1')
    expect(gradePH3140(9.2, 8.1)).toBe('U2')
    expect(gradePH3140(8.45)).toBe('FV')
    expect(gradePH3140(7)).toBe('FV')
    expect(gradePH3140(8.6)).toBeNull()
    expect(gradePH3140(6.8)).toBeNull()
  })

  it('przewodność: wzrost ≤5% FV, ≤20% U1, >20% U2; bez poprzedniego brak podpowiedzi', () => {
    expect(gradeConductivity3140(300, 300)).toBe('FV')
    expect(gradeConductivity3140(315, 300)).toBe('FV')
    expect(gradeConductivity3140(316, 300)).toBe('U1')
    expect(gradeConductivity3140(360, 300)).toBe('U1')
    expect(gradeConductivity3140(361, 300)).toBe('U2')
    expect(gradeConductivity3140(250, 300)).toBe('FV')
    expect(gradeConductivity3140(535)).toBeNull()
  })
})

describe('wskaźniki – podpowiedzi', () => {
  it('struktura: głębokie i duże płytkie z porównania powierzchni, płytkie z pokrycia; pierwsze badanie bez podpowiedzi', () => {
    expect(suggest('charaStructure', { trend: 'stable' }, ctx(DEEP))).toBe('FV')
    expect(suggest('charaStructure', { trend: 'decreaseLarge', cover: 80 }, ctx(LARGE))).toBe('U2')
    expect(suggest('charaStructure', { trend: 'first' }, ctx(DEEP))).toBeNull()
    expect(suggest('charaStructure', { trend: 'stable', cover: 30 }, ctx(SHALLOW))).toBe('U1')
    expect(suggest('charaStructure', { cover: 60 }, ctx(SHALLOW))).toBe('FV')
    expect(suggest('charaStructure', { cover: 60 }, ctx())).toBeNull()
    expect(ind('charaStructure').explain!({}, ctx())).toMatch(/Typ jeziora/)
  })

  it('gatunki charakterystyczne: liczy ramienice z listy, synonimy raz, rośliny naczyniowe pomija', () => {
    expect(suggest('charophytes', { species: sp('Chara tomentosa', 'Chara delicatula', 'Chara virgata', 'Nitellopsis obtusa') })).toBe('U1')
    expect(charophytesOf(sp('Chara tomentosa', 'Chara delicatula', 'Chara virgata', 'Najas marina'))).toEqual({
      taxa: ['Chara tomentosa', 'Chara virgata'],
      others: ['Najas marina'],
    })
    expect(ind('charophytes').warn!({ species: sp('Najas marina') }, ctx())).toMatch(/spoza ramienic/)
    expect(suggest('charophytes', { species: sp('Chara sp.') })).toBe('U2')
    expect(suggest('charophytes', { species: sp('Chara aspera'), count: 5 })).toBe('FV')
    expect(ind('charophytes').warn!({ species: sp('Chara aspera'), count: 5 }, ctx())).toMatch(/Wpisano 5/)
    expect(suggest('charophytes', { species: [] })).toBeNull()
  })

  it('degeneracja: gorszy z dwóch wyborów; ostrzeżenia przy obcych i pokryciu ekspansywnych >10%', () => {
    expect(suggest('degeneration', { expansive: 'absent', aliens: 'absent' })).toBe('FV')
    expect(suggest('degeneration', { expansive: 'upTo10', aliens: 'absent' })).toBe('U1')
    expect(suggest('degeneration', { expansive: 'upTo10', aliens: 'numerous' })).toBe('U2')
    expect(suggest('degeneration', { expansive: 'absent' })).toBeNull()
    const w = ind('degeneration').warn!
    expect(w({ species: sp('Elodea canadensis'), expansive: 'absent', aliens: 'absent' }, ctx())).toMatch(/obce/)
    expect(
      w({ species: [{ name: 'Ceratophyllum demersum', cover: 8 }, { name: 'Myriophyllum spicatum', cover: 4 }], expansive: 'upTo10', aliens: 'absent' }, ctx()),
    ).toMatch(/12%/)
    expect(ind('degeneration').describe!({ species: [] }, ctx())).toBe('Nie stwierdzono')
  })

  it('głębokość łąk i strefa świetlna biorą typ i głębokość jeziora ze stanowiska', () => {
    expect(suggest('maxDepth', { value: 3 }, ctx(SHALLOW))).toBe('U1')
    expect(suggest('maxDepth', { value: 4 }, ctx(SHALLOW))).toBe('FV')
    expect(suggest('maxDepth', { value: 3 }, ctx(DEEP))).toBe('U1')
    expect(suggest('maxDepth', { value: 3.5 }, ctx(LARGE))).toBe('FV')
    expect(suggest('maxDepth', { value: 3 })).toBeNull()
    expect(ind('maxDepth').warn!({ value: 25 }, ctx(DEEP))).toMatch(/Sprawdź/)
    expect(suggest('lightZone', { value: 12 }, ctx(DEEP))).toBe('U1')
    expect(suggest('lightZone', { value: 4 }, ctx(SHALLOW))).toBe('FV')
    expect(ind('lightZone').describe!({ value: 12, secchi: 4.5 }, ctx())).toBe('12 m (widzialność krążka Secchiego 4,5 m)')
  })

  it('plankton: opcje z tab. 2, „nie badano” = XX; skład trafia do wartości', () => {
    expect(suggest('phytoplankton', { choice: 'codominance' })).toBe('U1')
    expect(suggest('phytoplankton', { choice: 'cyano' })).toBe('U2')
    expect(suggest('zooplankton', { choice: 'notExamined' })).toBe('XX')
    expect(ind('zooplankton').describe!({ choice: 'notExamined', taxa: '' }, ctx())).toBe('Nie badano (brak próby)')
  })

  it('powierzchnia: „nie da się określić” bez podpowiedzi', () => {
    expect(suggest('area', { trend: 'stable' })).toBe('FV')
    expect(suggest('area', { trend: 'decreaseSmall' })).toBe('U1')
    expect(suggest('area', { trend: 'unknown' })).toBeNull()
  })
})

describe('katalog gatunków', () => {
  it('ramienice z synonimami, gatunki ekspansywne i obce', () => {
    expect(acceptedName3140('Chara fragilis')).toBe('Chara globularis')
    expect(acceptedName3140('Stuckenia pectinata')).toBe('Potamogeton pectinatus')
    expect(isCharophyte3140('Nitella sp.')).toBe(true)
    expect(isCharophyte3140('Najas marina')).toBe(false)
    expect(findSpecies3140('Elodea nuttallii')?.group).toBe('alien')
    expect(m.speciesInfo!('Ceratophyllum demersum')).toMatch(/ekspansywny/)
    expect(m.speciesCatalog!.every((o) => o.layer === 'C')).toBe(true)
  })

  it('odmiana „gatunek”', () => {
    expect([1, 2, 5, 11, 12, 22].map(speciesWord)).toEqual(['gatunek', 'gatunki', 'gatunków', 'gatunków', 'gatunków', 'gatunki'])
  })
})

describe('ocena struktury: pomocnicze nie psują kardynalnych', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(budzislawskie1)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    v.prospects.grade = 'FV'
    return v
  }

  it('pomocniczy U2 przy kardynalnych FV → struktura U1', () => {
    const v = allFv()
    v.indicators.phytoplankton.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
  })

  it('plankton XX (nie badano) → struktura FV', () => {
    const v = allFv()
    v.indicators.zooplankton.grade = 'XX'
    v.indicators.phytoplankton.grade = 'XX'
    expect(assessCard(m, v).structure).toBe('FV')
  })

  it('kardynalny U2 → struktura U2; kardynalny U1 → U1', () => {
    const v = allFv()
    v.indicators.lightZone.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U2')
    v.indicators.lightZone.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('U1')
  })
})

describe('przykład Jezioro Budzisławskie 1 (karta z przewodnika, 2013)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(budzislawskie1)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny parametrów jak w karcie: powierzchnia U1, struktura FV, perspektywy FV; ogólna U1 (karta: FV – sprzed erraty)', () => {
    const a = assessCard(m, budzislawskie1)
    expect(a).toMatchObject({ area: 'U1', structure: 'FV', prospects: 'FV', overall: 'U1', missing: [] })
  })

  it('podpowiedzi zgodne z ekspertem; bez podpowiedzi: powierzchnia, struktura (pierwsze badanie), przewodność (brak porównania)', () => {
    const c = ctx(budzislawskie1.site, { indicators: budzislawskie1.indicators })
    for (const i of m.indicators) {
      const s = i.suggest!(budzislawskie1.indicators[i.id].inputs, c)
      if (['area', 'charaStructure', 'conductivity'].includes(i.id)) expect(s, i.id).toBeNull()
      else expect(s, i.id).toBe(budzislawskie1.indicators[i.id].grade)
    }
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    const c = ctx(budzislawskie1.site, { indicators: budzislawskie1.indicators })
    for (const i of m.indicators) expect(i.describe!(budzislawskie1.indicators[i.id].inputs, c), i.id).toBe(budzislawskie1.indicators[i.id].value)
  })

  it('11 gatunków ramienic, kody oddziaływań z karty w słowniku, wykonawcy zanonimizowani', () => {
    expect(charophytesOf(budzislawskie1.indicators.charophytes.inputs.species).taxa).toHaveLength(11)
    const codes = new Set(m.impactCodes.map((c) => c.code))
    for (const x of [...budzislawskie1.impacts, ...budzislawskie1.threats]) expect(codes.has(x.code), x.code).toBe(true)
    expect(budzislawskie1.impacts.map((x) => x.code)).toEqual(['B02', 'B02.02', 'C01.04', 'D01.01', 'E01', 'F02.03', 'H01', 'J02.01'])
    expect(examples3140).toHaveLength(1)
    expect(budzislawskie1.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(budzislawskie1)).not.toMatch(/Gąbka|Joniak|Messyasz/)
  })
})
