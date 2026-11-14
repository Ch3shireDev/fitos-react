import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { duchnyMlode1, examples4030 } from './examples'
import { gradeCalluna4030, gradeGrasses4030, gradePresence4030, gradeTrees4030, indicator4030 as ind, methodology4030 as m } from './methodology'
import { defaultLayer4030, findSpecies4030, isGrass4030, isTree4030, speciesKey4030 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const MACZ = ctx({ site: { heathType: 'arctostaphylos' } })
const suggest = (id: string, inputs: InputValues, c = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const warn = (id: string, inputs: InputValues, c = ctx()) => ind(id).warn!(inputs, c)
const sp = (...names: string[]) => names.map((name) => ({ name }))

describe('metodyka 4030 – struktura', () => {
  it('kod 4030 (nie priorytetowe), transekt 200×10 m, 3 zdjęcia po 100 m²', () => {
    expect(habitatCode(m)).toBe('4030')
    expect(m.name).toBe('Suche wrzosowiska (Calluno-Genistion, Pohlio-Callunion, Calluno-Arctostaphylion)')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('200x10 m')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(100)
    expect(emptyCardValues(m).releves).toHaveLength(3)
    expect(m.structureRule).toBeUndefined()
  })

  it('wskaźniki w kolejności tab. 2', () => {
    expect(m.indicators.map((i) => i.id)).toEqual(['area', 'calluna', 'grasses', 'trees', 'aliens', 'expansive', 'population', 'keySpecies', 'distortions'])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
  })

  it('kardynalne (lista pod tab. 2): pokrycie wrzosu, zarośnięcie przez drzewa, gatunki obce', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['calluna', 'trees', 'aliens'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...allOtherFields(m), ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: ostrzeżenie poza lipcem–wrześniem', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2011-08-26')).toBeNull()
    expect(date.warn!('2021-07-01')).toBeNull()
    expect(date.warn!('2021-09-30')).toBeNull()
    expect(date.warn!('2021-06-15')).toMatch(/poza optymalnym/)
    expect(date.warn!('2021-10-02')).toMatch(/poza optymalnym/)
  })

  it('transekt: 2000 m² w dowolnym kształcie, inaczej ostrzeżenie', () => {
    const t = m.siteFields.find((f) => f.name === 'transect')!
    expect(t.warn!('200x10 m')).toBeNull()
    expect(t.warn!('10x200 m')).toBeNull()
    expect(t.warn!('100×20 m')).toBeNull()
    expect(t.warn!('100x10 m')).toMatch(/1000 m²/)
  })

  it('kody oddziaływań bez duplikatów, z zalesianiem, poligonami, sukcesją, wypalaniem', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['A01', 'B01', 'C01.01', 'G01.03', 'G04.01', 'G04.02', 'I01', 'J01.01', 'K02', 'X']) expect(codes).toContain(c)
  })

  it('inne informacje: udział powierzchni FV/U1/U2 przed uwagami', () => {
    expect(m.otherFields.map((f) => f.name)).toEqual(['otherValues', 'conservation', 'shareFV', 'shareU1', 'shareU2', 'notes', 'photos'])
  })
})

describe('metodyka 4030 – progi tab. 2', () => {
  it('pokrycie wrzosu: >50 FV, 30–50 U1 (obie granice), <30 U2', () => {
    expect([100, 50.5, 50, 30, 29.9, 0].map(gradeCalluna4030)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('trawy i drzewa: <10 FV, 10–30 U1 (obie granice), >30 U2', () => {
    for (const g of [gradeGrasses4030, gradeTrees4030]) expect([0, 9.9, 10, 30, 30.5].map(g)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('obce i apofity: brak FV; pojedyncze ≤10% U1; >10% U2', () => {
    expect(gradePresence4030(0)).toBe('FV')
    expect(gradePresence4030(0, 0)).toBe('FV')
    expect(gradePresence4030(1)).toBe('U1')
    expect(gradePresence4030(3, 10)).toBe('U1')
    expect(gradePresence4030(1, 10.5)).toBe('U2')
    expect(gradePresence4030(0, 20)).toBe('U2')
  })
})

describe('metodyka 4030 – podpowiedzi z pól', () => {
  it('wrzos: sam wrzos, a na mącznicowym wrzos + mącznica', () => {
    expect(suggest('calluna', { calluna: 45, arcto: 10 })).toBe('U1')
    expect(suggest('calluna', { calluna: 45, arcto: 10 }, MACZ)).toBe('FV')
    expect(suggest('calluna', { calluna: 25 }, MACZ)).toBe('U2')
    expect(suggest('calluna', {})).toBeNull()
    expect(ind('calluna').explain!({ calluna: 45, arcto: 10 }, MACZ)).toBe('Wrzosowisko mącznicowe: wrzos 45% + mącznica 10% = 55%.')
    expect(ind('calluna').explain!({ calluna: 45, arcto: 10 }, ctx())).toMatch(/Liczy się sam wrzos/)
    expect(warn('calluna', { calluna: 40 }, MACZ)).toMatch(/nie podano pokrycia mącznicy/)
    expect(warn('calluna', { calluna: 90, arcto: 20 })).toMatch(/więcej niż 100%/)
    expect(ind('calluna').describe!({ calluna: 60, arcto: 5 }, ctx())).toBe('wrzos 60%; mącznica 5%')
  })

  it('trawy: suma z listy, łącznie wprost, ostrzeżenie o nie-trawach', () => {
    expect(suggest('grasses', { species: [{ name: 'Festuca ovina', cover: 5 }, { name: 'Agrostis capillaris', cover: 0.5 }, { name: 'Calamagrostis epigejos', cover: 2.5 }] })).toBe('FV')
    expect(suggest('grasses', { species: [{ name: 'Festuca ovina', cover: 25 }, { name: 'Nardus stricta', cover: 15 }] })).toBe('U2')
    expect(suggest('grasses', { species: [{ name: 'Festuca ovina', cover: 25 }], total: 10 })).toBe('U1')
    expect(suggest('grasses', { species: sp('Festuca ovina') })).toBeNull()
    expect(warn('grasses', { species: sp('Festuca ovina', 'Calluna vulgaris') })).toMatch(/nie są trawami: Calluna vulgaris/)
    expect(ind('grasses').explain!({ species: [{ name: 'Molinia caerulea', cover: 3 }, { name: 'Molinia coerulea', cover: 2 }] }, ctx())).toBe('Gatunków traw: 1, łączne pokrycie 5%.')
  })

  it('drzewa: suma z listy, łącznie wprost, krzewy nie są drzewami', () => {
    expect(suggest('trees', { species: [{ name: 'Pinus sylvestris', cover: 3 }, { name: 'Betula pendula', cover: 2 }] })).toBe('FV')
    expect(suggest('trees', { species: [{ name: 'Pinus sylvestris', cover: 20 }, { name: 'Padus serotina', cover: 15 }] })).toBe('U2')
    expect(suggest('trees', { total: 0 })).toBe('FV')
    expect(suggest('trees', {})).toBeNull()
    expect(warn('trees', { species: sp('Juniperus communis', 'Pinus sylvestris') })).toMatch(/nie są drzewami: Juniperus communis/)
    expect(warn('trees', { species: sp('Quercus rubra') })).toBeNull()
    expect(ind('trees').describe!({ total: 12, species: [{ name: 'Pinus sylvestris', cover: 12 }] }, ctx())).toBe('pokrycie 12%; Pinus sylvestris 12%')
  })

  it('gatunki obce: lista, łącznie wprost, „nie stwierdzono”, synonimy raz', () => {
    expect(suggest('aliens', { none: 'yes' })).toBe('FV')
    expect(suggest('aliens', { species: sp('Conyza canadensis') })).toBe('U1')
    expect(suggest('aliens', { species: [{ name: 'Padus serotina', cover: 20 }] })).toBe('U2')
    expect(suggest('aliens', { species: [{ name: 'Padus serotina', cover: 8 }, { name: 'Prunus serotina', cover: 2 }] })).toBe('U1')
    expect(suggest('aliens', { total: 12 })).toBe('U2')
    expect(suggest('aliens', {})).toBeNull()
    expect(ind('aliens').explain!({ species: sp('Padus serotina', 'Prunus serotina') }, ctx())).toMatch(/Gatunków obcych: 1, łączne pokrycie —/)
    expect(warn('aliens', { species: sp('Padus serotina'), none: 'yes' })).toMatch(/„Nie stwierdzono”/)
    expect(warn('aliens', { species: sp('Pinus sylvestris') })).toMatch(/rodzime: Pinus sylvestris/)
    expect(ind('aliens').describe!({ species: [], none: 'yes' }, ctx())).toBe('nie stwierdzono')
  })

  it('apofity: jak obce; jeżyny „Rubus sp.” rozpoznane', () => {
    expect(suggest('expansive', { species: [{ name: 'Calamagrostis epigejos', cover: 5 }] })).toBe('U1')
    expect(suggest('expansive', { species: [{ name: 'Calamagrostis epigejos', cover: 15 }, { name: 'Rubus sp.', cover: 5 }] })).toBe('U2')
    expect(suggest('expansive', { none: 'yes' })).toBe('FV')
    expect(warn('expansive', { species: sp('Rubus fruticosus agg.') })).toBeNull()
    expect(warn('expansive', { species: sp('Festuca ovina') })).toMatch(/spoza grupy ekspansywnych: Festuca ovina/)
  })

  it('select-y: populacja, gatunki kluczowe (XX), zniekształcenia, powierzchnia', () => {
    expect(['all', 'fewJuvenile', 'senile'].map((choice) => suggest('population', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(['all', 'someU1', 'someU2', 'noData'].map((choice) => suggest('keySpecies', { choice }))).toEqual(['FV', 'U1', 'U2', 'XX'])
    expect(['none', 'minor', 'strong'].map((choice) => suggest('distortions', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(suggest('distortions', { choice: '' })).toBeNull()
    expect(['stable', 'slow', 'fast', 'unknown'].map((choice) => suggest('area', { choice }))).toEqual(['FV', 'U1', 'U2', 'XX'])
    expect(ind('area').describe!({ choice: 'stable', areaHa: 0.8 }, ctx())).toBe('0,8 ha; nie zmniejsza się, nie jest antropogenicznie pofragmentowana')
  })

  it('katalog: synonimy, trawy, drzewa (także obce), warstwy', () => {
    expect(speciesKey4030('Arctostaphyllos uva-ursi')).toBe(speciesKey4030('Arctostaphylos uva-ursi'))
    expect(speciesKey4030('Sarothamnus scoparius')).toBe(speciesKey4030('Cytisus scoparius'))
    for (const n of ['Festuca ovina', 'Calamagrostis epigejos', 'Molinia caerulea', 'Setaria viridis']) expect(isGrass4030(n), n).toBe(true)
    for (const n of ['Calluna vulgaris', 'Carex arenaria']) expect(isGrass4030(n), n).toBe(false)
    for (const n of ['Pinus sylvestris', 'Padus serotina', 'Quercus rubra']) expect(isTree4030(n), n).toBe(true)
    for (const n of ['Juniperus communis', 'Sarothamnus scoparius']) expect(isTree4030(n), n).toBe(false)
    expect(defaultLayer4030(findSpecies4030('Pleurozium schreberi')!)).toBe('D')
    expect(defaultLayer4030(findSpecies4030('Pinus sylvestris')!)).toBe('B')
    expect(defaultLayer4030(findSpecies4030('Calluna vulgaris')!)).toBe('C')
    expect(findSpecies4030('Cladonia sp.')?.polish).toBe('chrobotki')
    expect(m.speciesInfo!('Calamagrostis epigejos')).toBe('ekspansywny gatunek rodzimy (apofit); trawa')
    expect(m.speciesInfo!('Festuca ovina')).toBe('trawa')
    expect(m.speciesInfo!('Calluna vulgaris')).toBe('gatunek kluczowy wrzosowiska')
  })
})

describe('ocena struktury (reguła ogólna, tab. 2)', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(duchnyMlode1)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    v.prospects.grade = 'FV'
    return v
  }

  it('wszystko FV → FV; pomocniczy U2 (trawy) → struktura U1; fakultatywny XX nic nie zmienia', () => {
    const v = allFv()
    expect(assessCard(m, v)).toMatchObject({ structure: 'FV', overall: 'FV' })
    v.indicators.keySpecies.grade = 'XX'
    expect(assessCard(m, v).structure).toBe('FV')
    v.indicators.grasses.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
  })

  it('kardynalny U1 (obce) → U1; kardynalny U2 (drzewa) → U2', () => {
    const v = allFv()
    v.indicators.aliens.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.trees.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U2')
  })
})

describe('przykład Duchny Młode I (karta z przewodnika, 2011)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(duchnyMlode1)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny jak w karcie: powierzchnia U1, struktura FV, perspektywy U1, ogólna U1', () => {
    expect(assessCard(m, duchnyMlode1)).toMatchObject({ area: 'U1', structure: 'FV', prospects: 'U1', overall: 'U1', missing: [] })
    const grades = Object.fromEntries(Object.entries(duchnyMlode1.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({ area: 'U1', calluna: 'FV', grasses: 'FV', trees: 'FV', aliens: 'FV', expansive: 'FV', population: 'FV', keySpecies: 'XX', distortions: 'XX' })
  })

  it('podpowiedzi zgodne z ekspertem (poza „Innymi zniekształceniami”, których karta nie ocenia)', () => {
    const c = ctx({ site: duchnyMlode1.site, indicators: duchnyMlode1.indicators })
    for (const i of m.indicators.filter((x) => x.id !== 'distortions')) expect(i.suggest!(duchnyMlode1.indicators[i.id].inputs, c), i.id).toBe(duchnyMlode1.indicators[i.id].grade)
    expect(ind('distortions').suggest!(duchnyMlode1.indicators.distortions.inputs, c)).toBeNull()
  })

  it('mącznica nie jest doliczana (wrzosowisko janowcowe); trawy razem 8%, drzewa 5%', () => {
    const c = ctx({ site: duchnyMlode1.site })
    expect(ind('calluna').explain!(duchnyMlode1.indicators.calluna.inputs, c)).toMatch(/Liczy się sam wrzos \(75%\)/)
    expect(ind('grasses').explain!(duchnyMlode1.indicators.grasses.inputs, c)).toBe('Gatunków traw: 3, łączne pokrycie 8%.')
    expect(ind('trees').explain!(duchnyMlode1.indicators.trees.inputs, c)).toBe('Gatunków drzew: 2, łączne pokrycie 5%.')
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    const c = ctx({ site: duchnyMlode1.site, indicators: duchnyMlode1.indicators })
    for (const i of m.indicators) expect(i.describe!(duchnyMlode1.indicators[i.id].inputs, c), i.id).toBe(duchnyMlode1.indicators[i.id].value)
  })

  it('zdjęcia jak w karcie, udział FV/U1/U2 = 100%, koordynator zanonimizowany', () => {
    expect(examples4030).toHaveLength(1)
    expect(duchnyMlode1.releves.map((r) => (r.species as unknown[]).length)).toEqual([14, 10, 15])
    expect(duchnyMlode1.releves.map((r) => [r.coverB, r.coverC, r.coverD])).toEqual([[undefined, 75, 5], [1, 85, 5], [undefined, 80, 5]])
    const o = duchnyMlode1.other
    expect(Number(o.shareFV) + Number(o.shareU1) + Number(o.shareU2)).toBe(100)
    expect(duchnyMlode1.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(duchnyMlode1)).not.toMatch(/Biereźnoj|Bierenoj|Biereżnoj|Pawlaczyk/)
    expect(duchnyMlode1.impacts.map((i) => `${i.code}${i.influence}${i.intensity}`)).toEqual(['A01-M', 'B01-M', 'K02-H'])
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, udział FV/U1/U2 i stare kody w opisach', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, duchnyMlode1))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['4030 Suche wrzosowiska', 'Zarośnięcie przez drzewa', 'Udział powierzchni siedliska w stanie U1', 'Duchny Młode I', 'K02'])
      expect(text, t).toContain(t)
    expect(text).toMatch(/Kod w karcie z 2011 r.: 161 Zalesianie/)
  })
})
