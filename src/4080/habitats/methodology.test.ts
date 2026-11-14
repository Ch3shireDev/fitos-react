import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { examples4080, kociolWielkiegoStawu as kws } from './examples'
import {
  gradeCombination4080,
  gradeDominant4080,
  gradeMugo4080,
  gradeRegeneration4080,
  gradeWillows4080,
  indicator4080 as ind,
  methodology4080 as m,
  parseRange4080,
} from './methodology'
import { SPECIES_4080, defaultLayer4080, findSpecies4080, speciesKey4080 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues, c = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const warn = (id: string, inputs: InputValues) => ind(id).warn!(inputs, ctx())
const describeOf = (id: string, inputs: InputValues) => ind(id).describe!(inputs, ctx())
const explain = (id: string, inputs: InputValues, c = ctx()) => ind(id).explain!(inputs, c)

describe('metodyka 4080 – struktura', () => {
  it('kod 4080 (nie priorytetowe), 3 zdjęcia po 25 m², bez standardowego transektu, zestaw z przewodnika domyślnie', () => {
    expect(habitatCode(m)).toBe('4080')
    expect(m.name).toBe('Subalpejskie zarośla wierzby lapońskiej lub wierzby śląskiej')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBeUndefined()
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    const empty = emptyCardValues(m)
    expect(empty.releves).toHaveLength(3)
    expect(empty.site.indicatorSet).toBe('guide')
    expect(m.releves.fields.map((f) => f.name)).toEqual(['coords', 'altitude', 'area', 'slope', 'exposure', 'coverB', 'coverC', 'coverD', 'heightB', 'heightC', 'unit', 'species', 'remarks'])
  })

  it('wskaźniki w kolejności tab. 2: powierzchnia + 6 struktury', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Występowanie w warstwie krzewów wierzby lapońskiej lub wierzby śląskiej',
      'Naturalne odnowienie wierzby lapońskiej lub śląskiej',
      'Charakterystyczna kombinacja gatunków',
      'Gatunki dominujące, w tym ekspansja borówki czarnej i śmiałka pogiętego',
      'Ekspansja kosodrzewiny',
      'Zniszczenia mechaniczne',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
  })

  it('kardynalne (lista pod tab. 2): wierzby, odnowienie, kombinacja, zniszczenia', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['willows', 'regeneration', 'combination', 'damage'])
  })

  it('zestaw „karta przykładowa i monitoring 2016–2021”: kombinacja zostaje w karcie, ale się nie liczy (5 wskaźników, 3 kardynalne)', () => {
    expect(m.indicators.filter((i) => isExcluded(i, { indicatorSet: 'guide' }))).toEqual([])
    expect(m.indicators.filter((i) => isExcluded(i, { indicatorSet: 'monitoring' })).map((i) => i.id)).toEqual(['combination'])
    const counted = m.indicators.filter((i) => i.parameter === 'structure' && !isExcluded(i, { indicatorSet: 'monitoring' }))
    expect(counted).toHaveLength(5)
    expect(counted.filter((i) => isCardinal(i, {}))).toHaveLength(3)
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...allOtherFields(m), ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
    for (const g of ['FV', 'U1', 'U2'] as const) expect(m.prospects.thresholds[g]).toBeTruthy()
  })

  it('termin: bez ostrzeżenia od 20 czerwca do końca lipca; sierpień–wrzesień łagodniej; reszta ostrzega', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2010-07-08')).toBeNull()
    expect(date.warn!('2021-06-25')).toBeNull()
    expect(date.warn!('2021-07-31')).toBeNull()
    expect(date.warn!('2016-08-15')).toMatch(/2016/)
    expect(date.warn!('2016-09-10')).toMatch(/2016/)
    expect(date.warn!('2021-06-10')).toMatch(/poza sezonem/)
    expect(date.warn!('2021-10-01')).toMatch(/poza sezonem/)
  })

  it('wysokość n.p.m.: zakres przyjęty, poza 1000–2000 m ostrzeżenie', () => {
    const alt = m.siteFields.find((f) => f.name === 'altitude')!
    expect(alt.warn!('1320–1480')).toBeNull()
    expect(alt.warn!('1500 m')).toBeNull()
    expect(alt.warn!('650')).toMatch(/1180–1650/)
    expect(alt.warn!('')).toBeNull()
  })

  it('kody oddziaływań bez duplikatów, z turystyką, narciarstwem, zgryzaniem, lawiną, sukcesją i klimatem', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['G01.02', 'G01.06', 'G05.01', 'K04.05', 'L04', 'K02.01', 'M01.02', 'H04.02', 'X']) expect(codes, c).toContain(c)
  })

  it('inne informacje: propozycje, monitoring wymagany i uzasadnienie po działaniach; udział FV/U1/U2 przed uwagami', () => {
    const names = allOtherFields(m).map((f) => f.name)
    expect(names).toEqual(['otherValues', 'conservation', 'proposals', 'monitoringRequired', 'justification', 'shareFV', 'shareU1', 'shareU2', 'notes', 'photos'])
  })
})

describe('progi', () => {
  it('liczby i zakresy jak w karcie papierowej', () => {
    expect(parseRange4080('30')).toEqual({ lo: 30, hi: 30, mid: 30 })
    expect(parseRange4080('0,5')).toEqual({ lo: 0.5, hi: 0.5, mid: 0.5 })
    expect(parseRange4080('20–50%')).toEqual({ lo: 20, hi: 50, mid: 35 })
    expect(parseRange4080('ok. 10 - 20')).toEqual({ lo: 10, hi: 20, mid: 15 })
    expect(parseRange4080('<1')).toEqual({ lo: 0.5, hi: 0.5, mid: 0.5 })
    expect(parseRange4080(12)).toEqual({ lo: 12, hi: 12, mid: 12 })
    expect(parseRange4080('dużo')).toBeUndefined()
    expect(parseRange4080('')).toBeUndefined()
  })

  it('wierzby: ≥30 FV (30 – jak tab. 1 i karta), 10–<30 U1, <10 U2', () => {
    expect([45, 30, 29.9, 10, 9.9, 0].map(gradeWillows4080)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('odnowienie: ≥0,5 FV (0,5 – jak karta), >0 U1 (sporadycznie), 0 U2', () => {
    expect([5, 0.5, 0.4, 0.1, 0].map(gradeRegeneration4080)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('kombinacja: ≥50 FV, 10–<50 U1, <10 U2', () => {
    expect([80, 50, 49, 10, 9].map(gradeCombination4080)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('dominant: <50 FV, 50–70 U1 (obie granice), >70 U2', () => {
    expect([35, 49.9, 50, 70, 70.1, 90].map(gradeDominant4080)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('kosodrzewina: ≤30 FV, 30–50 U1 (50 też), >50 U2', () => {
    expect([0, 30, 30.1, 35, 50, 51].map(gradeMugo4080)).toEqual(['FV', 'FV', 'U1', 'U1', 'U1', 'U2'])
  })
})

describe('podpowiedzi wskaźników', () => {
  it('powierzchnia: z wyboru (brak danych → XX), bez wyboru nic', () => {
    expect(suggest('area', { choice: 'stable' })).toBe('FV')
    expect(suggest('area', { choice: 'small' })).toBe('U1')
    expect(suggest('area', { choice: 'large' })).toBe('U2')
    expect(suggest('area', { choice: 'unknown' })).toBe('XX')
    expect(suggest('area', { choice: '' })).toBeNull()
    expect(describeOf('area', { choice: 'stable', areaText: 'ok. 2 ha', note: '' })).toBe('ok. 2 ha; nie podlega zmianom lub zwiększa się')
  })

  it('wierzby: suma lapońskiej, śląskiej i szwajcarskiej; olsza i kosodrzewina się nie liczą; wybór eksperta ma pierwszeństwo', () => {
    expect(suggest('willows', { species: [{ name: 'Salix lapponum', cover: 30 }] })).toBe('FV')
    expect(suggest('willows', { species: [{ name: 'Salix silesiaca', cover: 15 }, { name: 'Salix lapponum', cover: 15 }] })).toBe('FV')
    expect(suggest('willows', { species: [{ name: 'Salix silesiaca', cover: 20 }, { name: 'Alnus viridis', cover: 50 }] })).toBe('U1')
    expect(suggest('willows', { species: [{ name: 'Pinus mugo', cover: 60 }, { name: 'Salix helvetica', cover: 5 }] })).toBe('U2')
    expect(suggest('willows', { species: [{ name: 'Sorbus aucuparia', cover: 10 }] })).toBe('U2')
    expect(suggest('willows', { species: [{ name: 'Salix lapponum' }] })).toBeNull()
    expect(suggest('willows', { species: [] })).toBeNull()
    expect(suggest('willows', { species: [{ name: 'Salix lapponum', cover: 5 }], choice: 'fv' })).toBe('FV')
    expect(explain('willows', { species: [{ name: 'Salix lapponum', cover: 20 }, { name: 'Salix silesiaca', cover: 15 }] })).toBe('Wierzby typowe razem: 35% – FV.')
  })

  it('wierzby: ostrzeżenia – zioła na liście krzewów, inne wierzby, sprzeczny wybór, <10% (przypis tab. 2)', () => {
    expect(warn('willows', { species: [{ name: 'Salix lapponum', cover: 40 }] })).toBeNull()
    expect(warn('willows', { species: [{ name: 'Salix lapponum', cover: 40 }, { name: 'Molinia caerulea', cover: 30 }] })).toMatch(/To nie krzewy: Molinia caerulea/)
    expect(warn('willows', { species: [{ name: 'Salix lapponum', cover: 40 }, { name: 'Salix caprea', cover: 5 }] })).toMatch(/Salix caprea/)
    expect(warn('willows', { species: [{ name: 'Salix lapponum', cover: 40 }], choice: 'u1' })).toMatch(/Wybrano U1, a z listy wychodzi FV/)
    expect(warn('willows', { species: [{ name: 'Salix silesiaca', cover: 5 }] })).toMatch(/6430, 4060 albo 4070/)
  })

  it('odnowienie: z procentu albo z wyboru; zakres – środek; bzdura ostrzega', () => {
    expect(suggest('regeneration', { cover: '0,5' })).toBe('FV')
    expect(suggest('regeneration', { cover: '<1' })).toBe('FV')
    expect(suggest('regeneration', { cover: '0,2' })).toBe('U1')
    expect(suggest('regeneration', { cover: '0' })).toBe('U2')
    expect(suggest('regeneration', { cover: '', choice: 'u1' })).toBe('U1')
    expect(suggest('regeneration', { cover: '2', choice: 'u2' })).toBe('U2')
    expect(suggest('regeneration', { cover: '' })).toBeNull()
    expect(warn('regeneration', { cover: 'sporo' })).toMatch(/Nie rozumiem/)
    expect(warn('regeneration', { cover: '50' })).toMatch(/30%/)
    expect(describeOf('regeneration', { cover: '1 - 2', note: '' })).toBe('1–2% udziału w runie')
  })

  it('kombinacja: z procentu albo z wyboru', () => {
    expect(suggest('combination', { share: '60' })).toBe('FV')
    expect(suggest('combination', { share: '30' })).toBe('U1')
    expect(suggest('combination', { share: '5' })).toBe('U2')
    expect(suggest('combination', { share: '5', choice: 'fv' })).toBe('FV')
    expect(suggest('combination', { share: '' })).toBeNull()
  })

  it('dominanty: środek zakresu, wyjaśnienie gdy zakres przechodzi przez próg, brak nazwy gatunku ostrzega', () => {
    expect(suggest('dominants', { species: 'Molinia caerulea', cover: '20–50' })).toBe('FV')
    expect(suggest('dominants', { species: 'Vaccinium myrtillus', cover: '60' })).toBe('U1')
    expect(suggest('dominants', { species: 'Vaccinium myrtillus', cover: '80' })).toBe('U2')
    expect(suggest('dominants', { species: 'Calamagrostis villosa', cover: '80', choice: 'fv' })).toBe('FV')
    expect(explain('dominants', { cover: '20–50' })).toMatch(/Środek zakresu: 35% – FV\. Zakres obejmuje FV i U1/)
    expect(explain('dominants', { cover: '10–20' })).toBe('Środek zakresu: 15% – FV.')
    expect(warn('dominants', { species: '', cover: '40' })).toMatch(/który gatunek/)
    expect(describeOf('dominants', { species: 'Vaccinium myrtillus', cover: '40', note: '' })).toBe('Vaccinium myrtillus 40%')
  })

  it('kosodrzewina: z procentu; podpowiedź z listy krzewów, gdy pole puste', () => {
    expect(suggest('mugo', { cover: '0' })).toBe('FV')
    expect(suggest('mugo', { cover: '35' })).toBe('U1')
    expect(suggest('mugo', { cover: '60' })).toBe('U2')
    expect(suggest('mugo', { cover: '' })).toBeNull()
    const c = ctx({ indicators: { willows: { inputs: { species: [{ name: 'Pinus mugo', cover: 35 }] }, value: '', grade: '' } } })
    expect(explain('mugo', { cover: '' }, c)).toBe('Na liście krzewów kosodrzewina ma 35% – U1.')
    expect(describeOf('mugo', { cover: '0', note: '' })).toBe('Brak kosodrzewiny w płatach')
    expect(describeOf('mugo', { cover: '10-35', note: '' })).toBe('10–35% udziału w płacie')
  })

  it('zniszczenia: z wyboru', () => {
    expect(suggest('damage', { choice: 'none' })).toBe('FV')
    expect(suggest('damage', { choice: 'some' })).toBe('U1')
    expect(suggest('damage', { choice: 'heavy' })).toBe('U2')
  })

  it('katalog: wierzby, olsza, kosodrzewina w B, mchy w D, reszta w C; gatunki z przykładu znane; synonimy razem', () => {
    const latins = SPECIES_4080.map((s) => s.latin)
    expect(new Set(latins).size).toBe(latins.length)
    expect(defaultLayer4080(findSpecies4080('Salix lapponum')!)).toBe('B')
    expect(defaultLayer4080(findSpecies4080('Pinus mugo')!)).toBe('B')
    expect(defaultLayer4080(findSpecies4080('Sphagnum compactum')!)).toBe('D')
    expect(defaultLayer4080(findSpecies4080('Aconitum firmum')!)).toBe('C')
    expect(speciesKey4080('Deschampsia caespitosa')).toBe(speciesKey4080('Deschampsia cespitosa'))
    expect(speciesKey4080('Alnus alnobetula')).toBe(speciesKey4080('Alnus viridis'))
    expect(m.speciesInfo!('Salix silesiaca')).toBe('wierzba typowa dla 4080')
    expect(m.speciesInfo!('Nieznany gatunek')).toBeUndefined()
  })
})

describe('ocena struktury i ogólna', () => {
  const all = (grade: Grade, set = 'guide'): CardValues => {
    const v = emptyCardValues(m)
    v.site.indicatorSet = set
    for (const i of m.indicators) v.indicators[i.id] = { inputs: {}, value: 'x', grade }
    v.prospects = { value: 'x', grade }
    return v
  }

  it('wszystko FV → FV; niekardynalny U2 (kosodrzewina) → struktura U1', () => {
    expect(assessCard(m, all('FV'))).toMatchObject({ structure: 'FV', overall: 'FV', missing: [] })
    const v = all('FV')
    v.indicators.mugo.grade = 'U2'
    expect(assessCard(m, v)).toMatchObject({ structure: 'U1', overall: 'U1' })
  })

  it('kardynalny U1 (odnowienie, jak Tarnica 2021) → U1; kardynalny U2 (zniszczenia) → U2', () => {
    const v = all('FV')
    v.indicators.regeneration.grade = 'U1'
    expect(assessCard(m, v)).toMatchObject({ structure: 'U1', overall: 'U1' })
    v.indicators.damage.grade = 'U2'
    expect(assessCard(m, v)).toMatchObject({ structure: 'U2', overall: 'U2' })
  })

  it('kombinacja: w zestawie z przewodnika kardynalna (U2 → U2), w zestawie 2016–2021 pomijana', () => {
    const v = all('FV')
    v.indicators.combination.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U2')
    v.site.indicatorSet = 'monitoring'
    expect(assessCard(m, v).structure).toBe('FV')
    v.indicators.combination.grade = ''
    expect(assessCard(m, v).missing).toEqual([])
  })
})

describe('przykład Kocioł Wielkiego Stawu (karta z przewodnika, 2010)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(kws)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie (kombinacji karta nie ma – XX, nie liczy się)', () => {
    const grades = Object.fromEntries(Object.entries(kws.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({ area: 'FV', willows: 'FV', regeneration: 'FV', combination: 'XX', dominants: 'FV', mugo: 'FV', damage: 'FV' })
    expect(kws.site.indicatorSet).toBe('monitoring')
  })

  it('oceny parametrów i ogólna jak w karcie: wszystko FV', () => {
    expect(assessCard(m, kws)).toEqual({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV', missing: [] })
  })

  it('w zestawie z przewodnika brak kombinacji (XX, kardynalna) dałby strukturę XX – stąd zestaw karty przykładowej', () => {
    const v = structuredClone(kws)
    v.site.indicatorSet = 'guide'
    expect(assessCard(m, v)).toMatchObject({ structure: 'XX', overall: 'XX' })
  })

  it('podpowiedzi zgodne z ekspertem (bez nieocenianej kombinacji)', () => {
    const c = ctx({ site: kws.site, indicators: kws.indicators })
    for (const i of m.indicators.filter((x) => x.id !== 'combination')) expect(i.suggest!(kws.indicators[i.id].inputs, c), i.id).toBe(kws.indicators[i.id].grade)
  })

  it('pole „wartość” = opis z pomiarów', () => {
    const c = ctx({ site: kws.site, indicators: kws.indicators })
    for (const i of m.indicators.filter((x) => x.id !== 'combination')) expect(i.describe!(kws.indicators[i.id].inputs, c), i.id).toBe(kws.indicators[i.id].value)
  })

  it('zdjęcia jak w karcie (III niewykonane), udział FV 100%, koordynatorzy zanonimizowani', () => {
    expect(examples4080).toHaveLength(1)
    expect(kws.releves.map((r) => (r.species as unknown[]).length)).toEqual([17, 20, 0])
    expect(kws.releves.map((r) => [r.altitude, r.slope, r.exposure, r.coverB, r.coverC, r.coverD])).toEqual([
      [1320, 45, 'NE', 30, 90, 5],
      [1340, 40, 'E', 30, 90, 5],
      [undefined, undefined, '', undefined, undefined, undefined],
    ])
    expect(kws.releves[2].remarks).toMatch(/Nie wykonano/)
    const names = kws.releves.flatMap((r) => (r.species as { name: string }[]).map((s) => s.name))
    for (const n of names) expect(findSpecies4080(n), n).toBeTruthy()
    const o = kws.other
    expect(Number(o.shareFV) + Number(o.shareU1) + Number(o.shareU2)).toBe(100)
    expect(o.shareFV).toBe(100)
    expect(kws.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(kws)).not.toMatch(/Świerkosz|Reczyńska/)
    expect(kws.impacts).toEqual([])
    expect(kws.threats).toEqual([])
  })
})

describe('eksport .docx przykładu', () => {
  it('ma nazwę siedliska, wskaźniki, oceny i udział FV', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, kws))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['4080 Subalpejskie zarośla wierzby lapońskiej lub wierzby śląskiej', 'Ekspansja kosodrzewiny', 'Udział powierzchni siedliska w stanie FV', 'Kocioł Wielkiego Stawu', '30% pokrycia', 'Brak gatunków']) 
      expect(text, t).toContain(t)
  })
})
