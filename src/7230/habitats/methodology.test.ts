import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type GradeOrEmpty, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { examples7230, zaStronia } from './examples'
import {
  SUBTYPES_7230,
  gradeAliens7230,
  gradeCharacteristic7230,
  gradeDominant7230,
  gradeExpansive7230,
  gradeHydration7230,
  gradeMosses7230,
  gradePh7230,
  gradeShare7230,
  gradeWoody7230,
  indicator7230 as ind,
  methodology7230 as m,
} from './methodology'
import { SPECIES_7230, defaultLayer7230, findSpecies7230, isCharacteristic7230, speciesKey7230 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues, c = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const warn = (id: string, inputs: InputValues, c = ctx()) => ind(id).warn!(inputs, c)
const explain = (id: string, inputs: InputValues, c = ctx()) => ind(id).explain!(inputs, c)
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => (cover === undefined ? { name } : { name, cover }))

describe('metodyka 7230 – struktura', () => {
  it('kod 7230 (nie priorytetowe), 3 zdjęcia po 25 m², transekt 10x200 m, trzy podtypy', () => {
    expect(habitatCode(m)).toBe('7230')
    expect(m.priority).toBeFalsy()
    expect(m.name).toBe('Górskie i nizinne torfowiska zasadowe o charakterze młak, turzycowisk i mechowisk')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(m.siteFields.find((f) => f.name === 'transect')?.defaultValue).toBe('10x200 m')
    expect(SUBTYPES_7230).toEqual(['7230-1', '7230-2', '7230-3'])
    expect(m.siteFields.filter((f) => f.group === 'Współrzędne geograficzne').map((f) => f.name)).toEqual(['coordStart', 'coordMiddle', 'coordEnd'])
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności tab. 2: powierzchnia + 11 struktury', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Procent powierzchni zajęty przez siedlisko na transekcie',
      'Gatunki charakterystyczne',
      'Gatunki dominujące',
      'Pokrycie i struktura gatunkowa mchów',
      'Obce gatunki inwazyjne',
      'Gatunki ekspansywne roślin zielnych',
      'Zakres pH',
      'Ekspansja krzewów i podrostu drzew',
      'Stopień uwodnienia',
      'Pozyskanie torfu',
      'Melioracje odwadniające',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('kardynalne (lista pod tab. 2, 2012): charakterystyczne, mchy, ekspansywne, pH, krzewy, uwodnienie – dominujące i melioracje już nie', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['characteristic', 'mosses', 'expansive', 'ph', 'woody', 'hydration'])
    expect(m.structureRule).toBeUndefined()
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...allOtherFields(m), ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: 15.06–15.08 bez ostrzeżenia; czerwiec i wrzesień – miękkie; poza czerwiec–wrzesień – twarde', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    for (const ok of ['2009-07-15', '2024-06-15', '2024-08-15']) expect(date.warn!(ok), ok).toBeNull()
    for (const soft of ['2017-06-03', '2024-08-31', '2017-09-09']) expect(date.warn!(soft), soft).toMatch(/poza optymalnym/)
    for (const bad of ['2024-05-20', '2024-10-02']) expect(date.warn!(bad), bad).toMatch(/poza sezonem/)
  })

  it('kody oddziaływań bez duplikatów, z wypasem, koszeniem, melioracjami, torfem, sukcesją i zakwaszeniem', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['A03.03', 'A04', 'C01.03', 'J02.01.02', 'K02.01', 'K02.04', 'I01', 'X']) expect(codes, c).toContain(c)
  })

  it('inne informacje: propozycje, monitoring wymagany z uzasadnieniem, udział FV/U1/U2 przed uwagami', () => {
    const names = allOtherFields(m).map((f) => f.name)
    expect(names.indexOf('proposals')).toBeGreaterThan(names.indexOf('conservation'))
    expect(names.slice(names.indexOf('monitoringRequired'), names.indexOf('monitoringRequired') + 2)).toEqual(['monitoringRequired', 'justification'])
    expect(names.slice(names.indexOf('shareFV'), names.indexOf('shareFV') + 4)).toEqual(['shareFV', 'shareU1', 'shareU2', 'notes'])
  })
})

describe('metodyka 7230 – progi tab. 2', () => {
  it('procent powierzchni siedliska: 80–100 FV, 50–80 U1, <50 U2', () => {
    expect([100, 80, 79, 50, 49, 0].map(gradeShare7230)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('gatunki charakterystyczne: >8 albo pokrycie >50% FV; 1–3 i <20% U2; reszta U1', () => {
    expect(gradeCharacteristic7230(9)).toBe('FV')
    expect(gradeCharacteristic7230(8)).toBeNull()
    expect(gradeCharacteristic7230(2, 55)).toBe('FV')
    expect(gradeCharacteristic7230(8, 50)).toBe('U1')
    expect(gradeCharacteristic7230(4, 10)).toBe('U1')
    expect(gradeCharacteristic7230(3, 20)).toBe('U1')
    expect(gradeCharacteristic7230(3, 19)).toBe('U2')
    expect(gradeCharacteristic7230(0, 0)).toBe('U2')
  })

  it('dominujące (interpretacja): ≥60% FV, 40–60% U1, <40% U2; pokrycie charakterystycznych może podnieść do U1', () => {
    expect(gradeDominant7230(60)).toBe('FV')
    expect(gradeDominant7230(40)).toBe('U1')
    expect(gradeDominant7230(39)).toBe('U2')
    expect(gradeDominant7230(0, 63)).toBe('U1')
    expect(gradeDominant7230(0, 30)).toBe('U2')
  })

  it('mchy (waloryzacja 2012): gorsza z dwóch ocen – pokrycie >50 / brunatne >70 FV; 20–50 / 20–70 U1; <20 / ≤20 U2', () => {
    expect(gradeMosses7230(70, 100)).toBe('FV')
    expect(gradeMosses7230(50, 100)).toBe('U1')
    expect(gradeMosses7230(80, 70)).toBe('U1')
    expect(gradeMosses7230(80, 21)).toBe('U1')
    expect(gradeMosses7230(80, 20)).toBe('U2')
    expect(gradeMosses7230(19)).toBe('U2')
    expect(gradeMosses7230(20, 100)).toBe('U1')
    expect(gradeMosses7230(60)).toBeNull()
  })

  it('obce: brak FV; do 5% (i bez pokrycia) U1; >5% U2', () => {
    expect([gradeAliens7230(0), gradeAliens7230(0, true), gradeAliens7230(5), gradeAliens7230(5.5)]).toEqual(['FV', 'U1', 'U1', 'U2'])
  })

  it('ekspansywne: <1% FV; do 5% U1; >5% U2', () => {
    expect([0, 0.5, 1, 5, 6].map(gradeExpansive7230)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('pH: >7 FV; 6–7 U1; <6 U2', () => {
    expect([7.4, 7, 6, 5.9].map(gradePh7230)).toEqual(['FV', 'U1', 'U1', 'U2'])
  })

  it('krzewy: <1% FV; do 15% U1; >15% U2', () => {
    expect([0, 0.5, 2, 15, 16].map(gradeWoody7230)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('uwodnienie: −2…10 cm FV; −10…−2 i 10…20 U1; dalej U2', () => {
    expect([0, -2, 10, -3, -10, 15, 20, -11, 21].map(gradeHydration7230)).toEqual(['FV', 'FV', 'FV', 'U1', 'U1', 'U1', 'U1', 'U2', 'U2'])
  })
})

describe('metodyka 7230 – podpowiedzi wskaźników', () => {
  it('procent powierzchni: z liczby albo z wyboru (z XX); rozjazd ostrzega', () => {
    expect(suggest('share', { share: 60 })).toBe('U1')
    expect(suggest('share', { share: 60, choice: 'XX' })).toBe('XX')
    expect(warn('share', { share: 60, choice: 'FV' })).toMatch(/wychodzi U1/)
    expect(warn('share', { share: 60, choice: 'XX' })).toBeNull()
  })

  it('gatunki charakterystyczne: katalog (synonimy raz) i suma pokrycia; liczba wprost; niecharakterystyczne ostrzegają', () => {
    expect(suggest('characteristic', { species: sp(['Valeriana simplicifolia', 30], ['Carex davalliana', 5]) })).toBe('U1')
    expect(suggest('characteristic', { species: sp(['Carex davalliana', 5], ['Carex flava', 5]) })).toBe('U2')
    expect(suggest('characteristic', { species: sp(['Limprichtia cossonii', 5], ['Scorpidium cossonii', 5], ['Carex flava', 2], ['Carex nigra', 3]) })).toBe('U2')
    expect(suggest('characteristic', { count: 10 })).toBe('FV')
    expect(suggest('characteristic', { species: sp(['Carex flava', 60]) })).toBe('FV')
    expect(suggest('characteristic', { species: sp(['Carex flava', 1]), choice: 'U1' })).toBe('U1')
    expect(warn('characteristic', { species: sp(['Carex flava', 5], ['Carex nigra', 3]) })).toMatch(/Nie liczą się jako charakterystyczne: Carex nigra/)
    expect(warn('characteristic', { species: sp(['Menyanthes trifoliata', 30], ['Carex flava', 5]) })).toMatch(/Wetlina/)
  })

  it('dominujące: skrzyp błotny 25% vs charakterystyczne 42% → U1; bez pokrycia charakterystycznych U2; młaki kwaśne ostrzegają', () => {
    const dom = { species: sp(['Equisetum palustre', 25]) }
    expect(suggest('dominant', dom)).toBe('U2')
    expect(suggest('dominant', dom, ctx({ indicators: { characteristic: { inputs: { total: 42 }, value: '', grade: '' } } }))).toBe('U1')
    expect(suggest('dominant', { species: sp(['Carex davalliana', 30], ['Equisetum palustre', 10]) })).toBe('FV')
    expect(warn('dominant', { species: sp(['Carex nigra', 40]) })).toMatch(/młak kwaśnych/)
    expect(explain('dominant', dom)).toMatch(/0% pokrycia dominantów/)
  })

  it('mchy: z pokrycia i udziału brunatnych; przewaga torfowców ostrzega', () => {
    expect(suggest('mosses', { mossCover: 70, brownShare: 100 })).toBe('FV')
    expect(suggest('mosses', { mossCover: 70 })).toBeNull()
    expect(suggest('mosses', { mossCover: 10 })).toBe('U2')
    expect(warn('mosses', { mossCover: 70, brownShare: 30, sphagnumShare: 70 })).toMatch(/Torfowce przeważają/)
    expect(warn('mosses', { mossCover: 70, brownShare: 100, sphagnumShare: 0 })).toBeNull()
  })

  it('obce: brak FV; bez pokrycia U1; >5% U2; trzcina to nie gatunek obcy', () => {
    expect(suggest('aliens', { species: [], none: 'yes' })).toBe('FV')
    expect(suggest('aliens', { species: sp(['Impatiens parviflora']) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Mimulus guttatus', 10]) })).toBe('U2')
    expect(warn('aliens', { species: sp(['Phragmites australis', 3]) })).toMatch(/To nie gatunki obce: Phragmites australis/)
  })

  it('ekspansywne: suma bez charakterystycznych i drzew; towarzyszące pominięte z ostrzeżeniem', () => {
    expect(suggest('expansive', { species: sp(['Eupatorium cannabinum', 5]) })).toBe('U1')
    expect(suggest('expansive', { species: sp(['Molinia caerulea', 20], ['Carex flava', 30]) })).toBe('U2')
    expect(suggest('expansive', { species: sp(['Equisetum palustre', 25]) })).toBe('FV')
    expect(warn('expansive', { species: sp(['Equisetum palustre', 25]) })).toMatch(/gatunki towarzyszące/)
    expect(warn('expansive', { species: sp(['Picea abies', 2]) })).toMatch(/Ekspansja krzewów/)
  })

  it('pH: średnia z pomiarów > środek zakresu; ocena ekspercka (Kobyla Biel 6,4 → FV); XX', () => {
    expect(suggest('ph', { ph1: 7.1, ph2: 7.3 })).toBe('FV')
    expect(suggest('ph', { phMin: 7.2, phMax: 7.6 })).toBe('FV')
    expect(suggest('ph', { phMin: 5.8, phMax: 6.4 })).toBe('U1')
    expect(suggest('ph', { ph1: 6.4, choice: 'FV' })).toBe('FV')
    expect(suggest('ph', { choice: 'XX' })).toBe('XX')
    expect(suggest('ph', {})).toBeNull()
  })

  it('krzewy: suma z listy, łączne pokrycie wprost, ocena ekspercka z ostrzeżeniem', () => {
    expect(suggest('woody', { species: sp(['Viburnum opulus', 1], ['Picea abies', 1]) })).toBe('U1')
    expect(suggest('woody', { total: 20 })).toBe('U2')
    expect(suggest('woody', { species: [], none: 'yes' })).toBe('FV')
    expect(suggest('woody', { species: sp(['Viburnum opulus', 1], ['Picea abies', 1]), choice: 'FV' })).toBe('FV')
    expect(warn('woody', { species: sp(['Viburnum opulus', 1], ['Picea abies', 1]), choice: 'FV' })).toMatch(/U1/)
  })

  it('uwodnienie: piezometr > średnia z pomiarów > obserwacja', () => {
    expect(suggest('hydration', { piezometer: 15, depth1: 0 })).toBe('U1')
    expect(suggest('hydration', { depth1: 0, depth2: 4, depth3: 8 })).toBe('FV')
    expect(suggest('hydration', { observed: 'dry' })).toBe('U2')
    expect(suggest('hydration', { observed: 'wet' })).toBe('FV')
  })

  it('pozyskanie torfu i melioracje: z wyboru', () => {
    expect(['none', 'oldSmall', 'recentSmall', 'large'].map((choice) => suggest('peat', { choice }))).toEqual(['FV', 'FV', 'U1', 'U2'])
    expect(['none', 'neutralized', 'oldInactive', 'weak', 'strong'].map((choice) => suggest('drainage', { choice }))).toEqual(['FV', 'FV', 'FV', 'U1', 'U2'])
  })

  it('katalog: drzewa w B, mchy w D, runo w C, bez duplikatów, synonimy jednym kluczem', () => {
    const latins = SPECIES_7230.map((s) => s.latin)
    expect(new Set(latins).size).toBe(latins.length)
    expect(defaultLayer7230(findSpecies7230('Picea abies')!)).toBe('B')
    expect(defaultLayer7230(findSpecies7230('Campylium stellatum')!)).toBe('D')
    expect(defaultLayer7230(findSpecies7230('Carex davalliana')!)).toBe('C')
    expect(speciesKey7230('Limprichtia cossonii')).toBe(speciesKey7230('Scorpidium cossonii'))
    expect(isCharacteristic7230('Valeriana simplicifolia')).toBe(true)
    expect(isCharacteristic7230('Equisetum palustre')).toBe(false)
  })
})

describe('metodyka 7230 – ocena struktury i ogólna (silnik)', () => {
  const all = (g: GradeOrEmpty) => Object.fromEntries(m.indicators.map((i) => [i.id, g]))
  const withGrades = (grades: Record<string, GradeOrEmpty>, extra: Record<string, GradeOrEmpty> = {}): CardValues => {
    const v = emptyCardValues(m)
    for (const [k, g] of Object.entries({ ...grades, ...extra })) v.indicators[k] = { ...v.indicators[k], grade: g }
    v.prospects = { value: '', grade: 'FV' }
    return v
  }

  it('kardynalny U2 → struktura U2; niekardynalny U2 → U1; wszystko FV → FV', () => {
    expect(assessCard(m, withGrades(all('FV'))).structure).toBe('FV')
    expect(assessCard(m, withGrades(all('FV'), { ph: 'U2' })).structure).toBe('U2')
    expect(assessCard(m, withGrades(all('FV'), { drainage: 'U2' })).structure).toBe('U1')
    expect(assessCard(m, withGrades(all('FV'), { dominant: 'U2', aliens: 'U2' })).structure).toBe('U1')
  })

  it('ocena ogólna wg silnika („najgorszy decyduje”), nie wg wiersza tab. 2 „dwa FV i jeden U1 → FV”', () => {
    expect(assessCard(m, withGrades(all('FV'), { area: 'U1' })).overall).toBe('U1')
  })
})

describe('przykład Za Stronią (karta z przewodnika, 2009)', () => {
  const c = ctx({ site: zaStronia.site, indicators: zaStronia.indicators })

  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(zaStronia)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie: dominujące i ekspansywne U1, reszta FV', () => {
    const grades = Object.fromEntries(Object.entries(zaStronia.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual(Object.fromEntries(m.indicators.map((i) => [i.id, ['dominant', 'expansive'].includes(i.id) ? 'U1' : 'FV'])))
  })

  it('parametry i ocena ogólna jak w karcie: powierzchnia FV, struktura U1, perspektywy U1, ogólna U1', () => {
    expect(assessCard(m, zaStronia)).toMatchObject({ area: 'FV', structure: 'U1', prospects: 'U1', overall: 'U1', missing: [] })
  })

  it('podpowiedzi formularza zgodne z ekspertem przy każdym wskaźniku', () => {
    for (const i of m.indicators) expect(i.suggest!(zaStronia.indicators[i.id].inputs, c), i.id).toBe(zaStronia.indicators[i.id].grade)
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    for (const i of m.indicators) expect(i.describe!(zaStronia.indicators[i.id].inputs, c), i.id).toBe(zaStronia.indicators[i.id].value)
  })

  it('ostrzeżenia: tylko krzewy (ocena ekspercka FV przy 2%); termin i zdjęcia bez ostrzeżeń', () => {
    const warned = m.indicators.filter((i) => i.warn?.(zaStronia.indicators[i.id].inputs, c)).map((i) => i.id)
    expect(warned).toEqual(['woody'])
    expect(m.siteFields.filter((f) => f.warn?.(zaStronia.site[f.name])).map((f) => f.name)).toEqual([])
    for (const r of zaStronia.releves) for (const f of m.releves.fields) expect(f.warn?.(r[f.name]) ?? null, f.name).toBeNull()
  })

  it('zdjęcia jak w karcie (49, 39, 30 gatunków), siewki drzew w C, udział 90/10/0, ekspert zanonimizowany', () => {
    expect(examples7230).toHaveLength(1)
    expect(zaStronia.releves.map((r) => (r.species as unknown[]).length)).toEqual([49, 39, 30])
    expect(zaStronia.releves.map((r) => [r.altitude, r.area, r.slope, r.exposure, r.coverC, r.coverD, r.heightC, r.heightD])).toEqual([
      [640, 25, 2, 'S', 98, 100, 30, 5],
      [660, 25, 5, 'SE', 100, 80, 40, 5],
      [670, 25, 1, 'SE', 90, 90, 20, 5],
    ])
    const rows = zaStronia.releves.flatMap((r) => r.species as { name: string; layer: string }[])
    for (const r of rows) {
      const s = findSpecies7230(r.name)
      expect(s, r.name).toBeTruthy()
      expect(r.layer, r.name).toBe(s!.woody ? 'C' : defaultLayer7230(s!))
    }
    const o = zaStronia.other
    expect([o.shareFV, o.shareU1, o.shareU2]).toEqual([90, 10, 0])
    expect(zaStronia.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(zaStronia)).not.toMatch(/Vončina|Koczur/)
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, udział FV/U1/U2 i dane stanowiska', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, zaStronia))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['7230 Górskie i nizinne torfowiska zasadowe', 'Zakres pH', 'Udział powierzchni siedliska w stanie FV', 'Za Stronią', 'Valeriano-Caricetum flavae'])
      expect(text, t).toContain(t)
  })
})
