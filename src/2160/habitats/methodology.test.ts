import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { CardValues, Grade, IndicatorContext, InputValues } from '../../7120/habitats/types'
import { examples2160, mewiaLacha1 } from './examples'
import { gradeHealth2160, gradeHeight2160, gradePatch2160, indicator2160 as ind, methodology2160 as m } from './methodology'
import { defaultLayer2160, findSpecies2160, isCombination2160, isExpansive2160, isHippophae2160, isInvasive2160 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, ctx())
const sp = (...names: string[]) => names.map((name) => ({ name }))

describe('metodyka 2160 – struktura', () => {
  it('kod 2160 (nie priorytetowe), stanowisko punktowe, 1 zdjęcie 25 m²', () => {
    expect(habitatCode(m)).toBe('2160')
    expect(m.name).toBe('Nadmorskie wydmy z zaroślami rokitnika')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toMatch(/punktowe/)
    expect(m.siteFields.find((f) => f.name === 'communities')!.defaultValue).toBe('Hippophaëtum rhamnoidis')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(emptyCardValues(m).releves).toHaveLength(1)
  })

  it('wskaźniki w kolejności tab. 1/2', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Charakterystyczna kombinacja gatunków',
      'Gatunki ekspansywne drzew i krzewów',
      'Wysokość krzewów (średnia)',
      'Odnowienie naturalne rokitnika',
      'Powierzchnia kępy',
      'Stan zdrowotny krzewów rokitnika',
      'Ekspansywne gatunki obce w podszyciu i runie',
    ])
  })

  it('kardynalne: gatunki ekspansywne, powierzchnia kępy, stan zdrowotny; nic pominiętego', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['expansive', 'patch', 'health'])
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

  it('termin: ostrzeżenie poza czerwcem–sierpniem', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2021-08-20')).toBeNull()
    expect(date.warn!('2016-06-01')).toBeNull()
    expect(date.warn!('2010-09-16')).toMatch(/poza optymalnym/)
    expect(date.warn!('2016-05-31')).toMatch(/poza optymalnym/)
  })

  it('kody oddziaływań bez duplikatów, z sukcesją, gatunkami obcymi, zalewaniem i umacnianiem brzegu', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['K02.01', 'I01', 'J02.04', 'K04.01', 'J02.12.01', 'X']) expect(codes).toContain(c)
  })
})

describe('metodyka 2160 – progi', () => {
  it('wysokość: >2 m FV, 1–2 m U1 (włącznie), <1 m U2', () => {
    expect([5, 2.1, 2, 1.5, 1, 0.9].map(gradeHeight2160)).toEqual(['FV', 'FV', 'U1', 'U1', 'U1', 'U2'])
  })

  it('powierzchnia kępy: >100 m² FV, 50–100 m² U1 (włącznie), <50 m² U2', () => {
    expect([150, 101, 100, 50, 49, 0].map(gradePatch2160)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('stan zdrowotny: ≤10% FV, ≤50% U1, >50% U2', () => {
    expect([0, 10, 11, 50, 51, 100].map(gradeHealth2160)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('liczba ma pierwszeństwo przed klasą; ostrzeżenie przy niezgodności', () => {
    expect(suggest('height', { value: 0.8, choice: 'tall' })).toBe('U2')
    expect(suggest('height', { choice: 'mid' })).toBe('U1')
    expect(suggest('height', {})).toBeNull()
    expect(suggest('patch', { value: 75 })).toBe('U1')
    expect(suggest('patch', { choice: 'small' })).toBe('U2')
    expect(suggest('health', { value: 60 })).toBe('U2')
    expect(suggest('health', { choice: 'good' })).toBe('FV')
    expect(ind('patch').warn!({ value: 30, choice: 'large' }, ctx())).toMatch(/30 m² nie pasuje/)
    expect(ind('height').warn!({ value: 3, choice: 'tall' }, ctx())).toBeNull()
    expect(ind('health').warn!({ value: 20, choice: 'good' }, ctx())).toMatch(/20% uszkodzonych pędów nie pasuje/)
  })

  it('opisy: notatka > liczba > etykieta klasy', () => {
    expect(ind('height').describe!({ value: 3.5 }, ctx())).toBe('3,5 m')
    expect(ind('height').describe!({ value: 3.5, note: '2–5 m' }, ctx())).toBe('2–5 m')
    expect(ind('patch').describe!({ choice: 'medium' }, ctx())).toBe('50–100 m²')
    expect(ind('health').describe!({ value: 5 }, ctx())).toBe('uszkodzone pędy wierzchołkowe: 5%')
  })

  it('selekty: kombinacja, ekspansywne, odnowienie, obce', () => {
    expect(['typical', 'altered', 'poor'].map((choice) => suggest('combination', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(['none', 'single', 'clumps'].map((choice) => suggest('expansive', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(['many', 'few', 'none'].map((choice) => suggest('regeneration', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(['none', 'single', 'many'].map((choice) => suggest('aliens', { choice }))).toEqual(['FV', 'U1', 'U2'])
  })

  it('powierzchnia siedliska: opcje z oceną, „bardzo mała” → U1, „brak danych” → XX, puste → ekspert', () => {
    expect(['stable', 'small', 'smallDecrease', 'clearDecrease', 'unknown'].map((choice) => suggest('area', { choice }))).toEqual([
      'FV',
      'U1',
      'U1',
      'U2',
      'XX',
    ])
    expect(suggest('area', { areaHa: 0.02 })).toBeNull()
    expect(ind('area').describe!({ areaHa: 0.02, choice: 'stable' }, ctx())).toBe('0,02 ha; powierzchnia nie zmienia się lub zwiększa się')
  })

  it('kombinacja: licznik rokitnika i gatunków z tab. 1, ostrzeżenia', () => {
    expect(ind('combination').explain!({ species: sp('Hippophae rhamnoides', 'Carex arenaria', 'Urtica dioica', 'Sedum acre') }, ctx())).toBe(
      'Rokitnik: jest. Gatunków kombinacji z tab. 1: 2 z 7.',
    )
    expect(ind('combination').warn!({ species: sp('Carex arenaria'), choice: 'typical' }, ctx())).toMatch(/nie ma rokitnika/)
    expect(ind('combination').warn!({ species: sp('Hippophaë rhamnoides', 'Carex arenaria'), choice: 'poor' }, ctx())).toMatch(/zubożenie/)
    expect(ind('combination').warn!({ species: sp('Hippophaë rhamnoides'), choice: 'typical' }, ctx())).toBeNull()
  })

  it('ekspansywne i obce: ostrzeżenia przy niezgodności z listą', () => {
    expect(ind('expansive').warn!({ species: sp('Betula pendula'), choice: 'none' }, ctx())).toMatch(/„Brak”/)
    expect(ind('expansive').warn!({ species: sp('Sedum acre'), choice: 'single' }, ctx())).toMatch(/Spoza listy.*Sedum acre/)
    expect(ind('expansive').describe!({ species: [], choice: 'none' }, ctx())).toBe('brak')
    expect(ind('aliens').warn!({ species: sp('Rosa rugosa'), choice: 'none' }, ctx())).toMatch(/„Brak”/)
    expect(ind('aliens').warn!({ species: sp('Betula pendula'), choice: 'single' }, ctx())).toMatch(/rodzime: Betula pendula/)
    expect(ind('aliens').describe!({ species: [{ name: 'Rosa rugosa', cover: 3 }], choice: 'single' }, ctx())).toBe('Rosa rugosa 3%')
  })

  it('katalog: rokitnik z „ë” i bez, kombinacja, ekspansywne, obce, warstwy', () => {
    expect(isHippophae2160('Hippophaë rhamnoides')).toBe(true)
    expect(isHippophae2160('Hippophae rhamnoides')).toBe(true)
    for (const n of ['Lathyrus japonicus', 'Carex arenaria', 'Jasione montana', 'Festuca rubra', 'Geranium robertianum', 'Urtica dioica', 'Phragmites australis'])
      expect(isCombination2160(n), n).toBe(true)
    for (const n of ['Pinus sylvestris', 'Salix daphnoides', 'Salix acutifolia', 'Populus tremula', 'Betula pendula', 'Rosa rugosa'])
      expect(isExpansive2160(n), n).toBe(true)
    for (const n of ['Rosa rugosa', 'Salix acutifolia', 'Impatiens parviflora', 'Solidago gigantea']) expect(isInvasive2160(n), n).toBe(true)
    expect(isInvasive2160('Betula pendula')).toBe(false)
    expect(defaultLayer2160(findSpecies2160('Hippophaë rhamnoides')!)).toBe('B')
    expect(defaultLayer2160(findSpecies2160('Betula pendula')!)).toBe('A')
    expect(defaultLayer2160(findSpecies2160('Carex arenaria')!)).toBe('C')
    expect(m.speciesInfo!('Rosa rugosa')).toBe('gatunek obcy geograficznie, ekspansywny, obcy w podszyciu/runie')
    expect(m.speciesInfo!('Hippophae rhamnoides')).toBe('gatunek charakterystyczny 2160')
  })
})

describe('ocena struktury', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(mewiaLacha1)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    return v
  }

  it('wszystko FV → FV; niekardynalny U2 (odnowienie) → struktura U1', () => {
    const v = allFv()
    v.prospects.grade = 'FV'
    expect(assessCard(m, v)).toMatchObject({ structure: 'FV', overall: 'FV' })
    v.indicators.regeneration.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
  })

  it('kardynalny U1 (gatunki ekspansywne) → U1; kardynalny U2 (powierzchnia kępy) → U2', () => {
    const v = allFv()
    v.indicators.expansive.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.patch.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U2')
  })
})

describe('przykład „Mewia Łacha” 1 (karta z przewodnika, 2010)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(mewiaLacha1)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie', () => {
    const g = Object.fromEntries(Object.entries(mewiaLacha1.indicators).map(([k, v]) => [k, v.grade]))
    expect(g).toEqual({ area: 'U1', combination: 'FV', expansive: 'U1', height: 'FV', regeneration: 'FV', patch: 'FV', health: 'FV', aliens: 'FV' })
  })

  it('parametry: powierzchnia U1, perspektywy U1, ogólna U1 jak w karcie; struktura U1 (w karcie FV – kardynalny U1)', () => {
    expect(assessCard(m, mewiaLacha1)).toMatchObject({ area: 'U1', structure: 'U1', prospects: 'U1', overall: 'U1', missing: [] })
  })

  it('podpowiedzi zgodne z ekspertem', () => {
    const c = ctx({ site: mewiaLacha1.site, indicators: mewiaLacha1.indicators })
    for (const i of m.indicators) expect(i.suggest!(mewiaLacha1.indicators[i.id].inputs, c), i.id).toBe(mewiaLacha1.indicators[i.id].grade)
  })

  it('pole „wartość” = opis wygenerowany z pomiarów, bez ostrzeżeń wskaźników', () => {
    const c = ctx({ site: mewiaLacha1.site, indicators: mewiaLacha1.indicators })
    for (const i of m.indicators) {
      expect(i.describe!(mewiaLacha1.indicators[i.id].inputs, c), i.id).toBe(mewiaLacha1.indicators[i.id].value)
      expect(i.warn?.(mewiaLacha1.indicators[i.id].inputs, c) ?? null, i.id).toBeNull()
    }
  })

  it('zdjęcie jak w karcie: 1 × 25 m², A 25% / B 70% / C 30%, 56 pozycji, rokitnik B 4', () => {
    expect(examples2160).toHaveLength(1)
    expect(mewiaLacha1.releves).toHaveLength(1)
    const r = mewiaLacha1.releves[0]
    expect(r).toMatchObject({ area: 25, coverA: 25, coverB: 70, coverC: 30, coverD: 0, heightA: 8, heightB: 4, heightC: 30 })
    const species = r.species as { layer: string; name: string; abundance: string }[]
    expect(species).toHaveLength(56)
    expect(species).toContainEqual({ layer: 'B', name: 'Hippophaë rhamnoides', abundance: '4' })
    expect(species).toContainEqual({ layer: 'A', name: 'Salix acutifolia', abundance: '2' })
    expect(species).toContainEqual({ layer: 'C', name: 'Vicia cracca', abundance: 'r' })
    // każdy gatunek ze zdjęcia jest w katalogu
    for (const s of species) expect(findSpecies2160(s.name), s.name).toBeDefined()
  })

  it('zanonimizowany wykonawca', () => {
    expect(mewiaLacha1.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(mewiaLacha1)).not.toMatch(/Braun|Lemke/)
  })
})
