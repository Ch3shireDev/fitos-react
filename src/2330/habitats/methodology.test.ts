import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { chechlo2, examples2330 } from './examples'
import {
  gradeAliens2330,
  gradeBareSand2330,
  gradeCharacteristic2330,
  gradeExpansive2330,
  gradeLater2330,
  gradeShare2330,
  gradeShrubs2330,
  indicator2330 as ind,
  methodology2330 as m,
} from './methodology'
import { defaultLayer2330, findSpecies2330, isCharacteristic2330, speciesKey2330 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, ctx())
const warn = (id: string, inputs: InputValues) => ind(id).warn!(inputs, ctx())
const sp = (...names: string[]) => names.map((name) => ({ name }))

describe('metodyka 2330 – struktura', () => {
  it('kod 2330 (nie priorytetowe), transekt 200×10 m, 3 zdjęcia po 25 m²', () => {
    expect(habitatCode(m)).toBe('2330')
    expect(m.name).toBe('Wydmy śródlądowe z murawami napiaskowymi')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('200x10 m')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności tab. 2', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Gatunki charakterystyczne',
      'Ekspansja krzewów i podrostu drzew',
      'Gatunki ekspansywne',
      'Obce gatunki inwazyjne',
      'Występowanie procesów eolicznych',
      'Procent powierzchni zajęty przez siedlisko na transekcie',
      'Gatunki charakterystyczne murawy kserotermicznej/wrzosowiska',
      'Inne zniekształcenia (rozjeżdżenie, wydeptanie, zaśmiecenie)',
    ])
  })

  it('kardynalne (lista pod tab. 2): gatunki charakterystyczne, ekspansja krzewów, procesy eoliczne', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['species', 'shrubs', 'eolian'])
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

  it('termin: ostrzeżenie poza majem–czerwcem', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2017-05-25')).toBeNull()
    expect(date.warn!('2024-06-27')).toBeNull()
    expect(date.warn!('2011-09-17')).toMatch(/poza optymalnym/)
    expect(date.warn!('2024-04-20')).toMatch(/poza optymalnym/)
  })

  it('transekt: 20 arów w dowolnym kształcie, inaczej ostrzeżenie', () => {
    const t = m.siteFields.find((f) => f.name === 'transect')!
    expect(t.warn!('200x10 m')).toBeNull()
    expect(t.warn!('20×100 m')).toBeNull()
    expect(t.warn!('100x10 m')).toMatch(/1000 m²/)
  })

  it('kody oddziaływań bez duplikatów, z zalesianiem, piaskiem, pojazdami, poligonami i sukcesją', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['B01', 'C01.01', 'E03.04', 'G01.02', 'G01.03', 'G04.01', 'I01', 'K02', 'K02.01', 'X']) expect(codes).toContain(c)
  })

  it('inne informacje: udział powierzchni FV/U1/U2 przed uwagami', () => {
    const names = m.otherFields.map((f) => f.name)
    expect(names).toEqual(['otherValues', 'conservation', 'shareFV', 'shareU1', 'shareU2', 'notes', 'photos'])
  })
})

describe('metodyka 2330 – progi tab. 2', () => {
  it('gatunki charakterystyczne: ≥4 FV, 2–3 U1, 0–1 U2', () => {
    expect([12, 4, 3, 2, 1, 0].map(gradeCharacteristic2330)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('ekspansja krzewów: <40 FV, 40–60 U1 (obie granice), >60 U2', () => {
    expect([0, 39.9, 40, 60, 60.1, 100].map(gradeShrubs2330)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('gatunki ekspansywne: ≤1 FV, ≤10 U1, >10 U2', () => {
    expect([0, 0.5, 1, 1.5, 10, 10.5].map(gradeExpansive2330)).toEqual(['FV', 'FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('obce: brak FV; 1 gatunek ≤5% U1; >5% albo >1 gatunek U2', () => {
    expect(gradeAliens2330(0)).toBe('FV')
    expect(gradeAliens2330(1)).toBe('U1')
    expect(gradeAliens2330(1, 5)).toBe('U1')
    expect(gradeAliens2330(1, 5.5)).toBe('U2')
    expect(gradeAliens2330(2, 0.5)).toBe('U2')
  })

  it('udział siedliska na transekcie: >30 FV, 10–30 U1 (30 też), ≤10 U2', () => {
    expect([100, 30.5, 30, 10.5, 10, 0].map(gradeShare2330)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('gatunki murawy/wrzosowiska: 0–1 FV, 2–3 U1, >3 U2', () => {
    expect([0, 1, 2, 3, 4].map(gradeLater2330)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('odsłonięty piasek (propozycja 2018, tylko wskazówka): >60 FV, 10–60 U1, <10 U2', () => {
    expect([61, 60, 10, 9].map(gradeBareSand2330)).toEqual(['FV', 'U1', 'U1', 'U2'])
  })
})

describe('metodyka 2330 – podpowiedzi z pól', () => {
  it('gatunki charakterystyczne: liczy z listy tab. 1 (synonimy raz), liczba wprost ma pierwszeństwo', () => {
    expect(suggest('species', { species: sp('Corynephorus canescens', 'Spergula morisonii', 'Spergula vernalis', 'Jasione montana') })).toBe('U1')
    expect(suggest('species', { species: sp('Corynephorus canescens', 'Spergula morisonii', 'Jasione montana', 'Cladonia mitis') })).toBe('FV')
    expect(suggest('species', { species: sp('Rumex acetosella', 'Scleranthus perennis') })).toBe('U2')
    expect(suggest('species', { species: sp('Rumex acetosella'), count: 4 })).toBe('FV')
    expect(suggest('species', {})).toBeNull()
    expect(ind('species').explain!({ species: sp('Cladonia floërkeana', 'Cladonia floerkeana', 'Teesdalea nudicaulis') }, ctx())).toBe('Gatunków charakterystycznych z tab. 1 na liście: 2 z 12.')
  })

  it('gatunki charakterystyczne: ostrzega o gatunkach spoza tab. 1 i o rozjeździe z liczbą wpisaną', () => {
    const w = warn('species', { species: sp('Corynephorus canescens', 'Rumex acetosella', 'Polytrichum piliferum', 'Cetraria aculeata', 'Cladonia sp.'), count: 5 })
    expect(w).toMatch(/Spoza listy tab. 1: Rumex acetosella, Cladonia sp./)
    expect(w).toMatch(/byłoby 3 \(U1\), a wpisano 5 \(FV\)/)
    expect(warn('species', { species: sp('Corynephorus canescens') })).toBeNull()
  })

  it('ekspansja krzewów: z procentu, ostrzeżenie, opis', () => {
    expect(suggest('shrubs', { value: 40 })).toBe('U1')
    expect(suggest('shrubs', {})).toBeNull()
    expect(warn('shrubs', { value: 10, species: [{ name: 'Pinus sylvestris', cover: 15 }] })).toMatch(/większa niż pokrycie łączne/)
    expect(ind('shrubs').describe!({ value: 15, species: [{ name: 'Pinus sylvestris', cover: 15 }] }, ctx())).toBe('pokrycie 15%; Pinus sylvestris 15%')
  })

  it('gatunki ekspansywne: suma z listy, łączne wprost, „nie stwierdzono”', () => {
    expect(suggest('expansive', { species: [{ name: 'Calamagrostis epigejos', cover: 0.5 }, { name: 'Pteridium aquilinum', cover: 0.5 }] })).toBe('FV')
    expect(suggest('expansive', { species: [{ name: 'Calamagrostis epigejos', cover: 5 }, { name: 'Elymus repens', cover: 6 }] })).toBe('U2')
    expect(suggest('expansive', { species: [{ name: 'Calamagrostis epigejos', cover: 20 }], total: 8 })).toBe('U1')
    expect(suggest('expansive', { species: sp('Calamagrostis epigejos') })).toBeNull()
    expect(suggest('expansive', { none: 'yes' })).toBe('FV')
    expect(ind('expansive').describe!({ species: [], none: 'yes' }, ctx())).toBe('nie stwierdzono')
    expect(warn('expansive', { species: sp('Corynephorus canescens') })).toMatch(/spoza grupy ekspansywnych/)
    expect(m.speciesInfo!('Calamagrostis epigejos')).toBe('gatunek ekspansywny')
    expect(m.speciesInfo!('Molinia caerulea')).toBe('gatunek ekspansywny (sprawozdanie 2024)')
  })

  it('obce gatunki: liczba i pokrycie z listy albo wprost', () => {
    expect(suggest('aliens', { species: [{ name: 'Salix acutifolia', cover: 3 }] })).toBe('U1')
    expect(suggest('aliens', { species: sp('Salix acutifolia') })).toBe('U1')
    expect(suggest('aliens', { species: [{ name: 'Campylopus introflexus', cover: 40 }] })).toBe('U2')
    expect(suggest('aliens', { species: sp('Padus serotina', 'Conyza canadensis') })).toBe('U2')
    expect(suggest('aliens', { species: sp('Padus serotina', 'Prunus serotina') })).toBe('U1')
    expect(suggest('aliens', { species: sp('Conyza canadensis', 'Erigeron canadensis') })).toBe('U1')
    expect(suggest('aliens', { count: 1, total: 6 })).toBe('U2')
    expect(suggest('aliens', { none: 'yes' })).toBe('FV')
    expect(suggest('aliens', {})).toBeNull()
    expect(warn('aliens', { species: sp('Salix acutifolia'), none: 'yes' })).toMatch(/„Nie stwierdzono”/)
    expect(warn('aliens', { species: sp('Pinus sylvestris') })).toMatch(/rodzime: Pinus sylvestris/)
    expect(ind('aliens').describe!({ species: [], none: 'yes' }, ctx())).toBe('nie stwierdzono')
  })

  it('procesy eoliczne: z wyboru; odsłonięty piasek tylko jako wskazówka', () => {
    expect(['active', 'traces', 'fixed'].map((choice) => suggest('eolian', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(suggest('eolian', { choice: 'traces', bareSand: 90 })).toBe('U1')
    expect(ind('eolian').explain!({ bareSand: 90 }, ctx())).toMatch(/byłoby FV \(tylko wskazówka\)/)
    expect(warn('eolian', { choice: 'active', bareSand: 5 })).toMatch(/sugeruje U2/)
    expect(warn('eolian', { choice: 'traces', bareSand: 30 })).toBeNull()
    expect(ind('eolian').describe!({ choice: 'fixed', bareSand: 2 }, ctx())).toBe('Tylko dobrze utrwalone, np. duże wydmy, zarośnięte w większości lasem; odsłonięty piasek 2%')
  })

  it('udział siedliska: z procentu', () => {
    expect(suggest('share', { value: 10 })).toBe('U2')
    expect(suggest('share', { value: 15 })).toBe('U1')
    expect(ind('share').describe!({ value: 85 }, ctx())).toBe('85%')
  })

  it('murawy/wrzosowiska: liczy bez gatunków 2330 i 6120, liczba wprost ma pierwszeństwo', () => {
    expect(suggest('later', { species: sp('Hieracium pilosella', 'Koeleria glauca', 'Corynephorus canescens') })).toBe('FV')
    expect(suggest('later', { species: sp('Hieracium pilosella', 'Calluna vulgaris', 'Thymus serpyllum') })).toBe('U1')
    expect(suggest('later', { species: sp('Hieracium pilosella', 'Pilosella officinarum', 'Calluna vulgaris', 'Sedum acre', 'Festuca ovina') })).toBe('U2')
    expect(suggest('later', { none: 'yes' })).toBe('FV')
    expect(suggest('later', { count: 2 })).toBe('U1')
    expect(suggest('later', {})).toBeNull()
    expect(warn('later', { species: sp('Koeleria glauca', 'Hieracium pilosella') })).toMatch(/Nie liczą się .*Koeleria glauca/)
  })

  it('zniekształcenia i powierzchnia: z wyboru', () => {
    expect(['small', 'medium', 'severe'].map((choice) => suggest('distortions', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(['stable', 'smallDecrease', 'clearDecrease', 'unknown'].map((choice) => suggest('area', { choice }))).toEqual(['FV', 'U1', 'U2', 'XX'])
    expect(ind('area').describe!({ choice: 'stable', areaHa: 160 }, ctx())).toBe('160 ha; nie podlega zmianom lub zwiększa się')
  })

  it('katalog: 12 gatunków tab. 1 z synonimami, warstwy, grupy', () => {
    const tab1 = new Set(
      ['Corynephorus canescens', 'Spergula morisonii', 'Teesdalia nudicaulis', 'Veronica dillenii', 'Agrostis vinealis', 'Cetraria aculeata', 'Cladonia floerkeana', 'Cladonia arbuscula subsp. mitis', 'Stereocaulon condensatum', 'Jasione montana', 'Scleranthus perennis', 'Polytrichum piliferum'].map(speciesKey2330),
    )
    expect(tab1.size).toBe(12)
    for (const n of ['Spergula vernalis', 'Teesdalea nudicaulis', 'Cladonia mitis', 'Cladonia floërkeana']) expect(isCharacteristic2330(n), n).toBe(true)
    for (const n of ['Rumex acetosella', 'Cladonia sp.', 'Koeleria glauca', 'Veronica verna']) expect(isCharacteristic2330(n), n).toBe(false)
    expect(defaultLayer2330(findSpecies2330('Polytrichum piliferum')!)).toBe('D')
    expect(defaultLayer2330(findSpecies2330('Pinus sylvestris')!)).toBe('B')
    expect(defaultLayer2330(findSpecies2330('Salix acutifolia')!)).toBe('B')
    expect(defaultLayer2330(findSpecies2330('Corynephorus canescens')!)).toBe('C')
    expect(m.speciesInfo!('Koeleria glauca')).toMatch(/nie liczy się/)
  })
})

describe('ocena struktury', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(chechlo2)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    v.prospects.grade = 'FV'
    return v
  }

  it('wszystko FV → FV; niekardynalny U2 (obce) → struktura U1', () => {
    const v = allFv()
    expect(assessCard(m, v)).toMatchObject({ structure: 'FV', overall: 'FV' })
    v.indicators.aliens.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
  })

  it('kardynalny U1 (krzewy) → U1; kardynalny U2 (procesy eoliczne) → U2', () => {
    const v = allFv()
    v.indicators.shrubs.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.eolian.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U2')
  })
})

describe('przykład Chechło 2 (karta z przewodnika, 2011)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(chechlo2)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny jak w karcie: powierzchnia FV, struktura U1, perspektywy U1, ogólna U1', () => {
    expect(assessCard(m, chechlo2)).toMatchObject({ area: 'FV', structure: 'U1', prospects: 'U1', overall: 'U1', missing: [] })
    const grades = Object.fromEntries(Object.entries(chechlo2.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({ area: 'FV', species: 'FV', shrubs: 'U1', expansive: 'FV', aliens: 'U1', eolian: 'FV', share: 'FV', later: 'FV', distortions: 'U1' })
  })

  it('podpowiedzi zgodne z ekspertem', () => {
    const c = ctx({ site: chechlo2.site, indicators: chechlo2.indicators })
    for (const i of m.indicators) expect(i.suggest!(chechlo2.indicators[i.id].inputs, c), i.id).toBe(chechlo2.indicators[i.id].grade)
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    const c = ctx({ site: chechlo2.site, indicators: chechlo2.indicators })
    for (const i of m.indicators) expect(i.describe!(chechlo2.indicators[i.id].inputs, c), i.id).toBe(chechlo2.indicators[i.id].value)
  })

  it('zdjęcia jak w karcie, udział FV/U1/U2 = 100%, wykonawca zanonimizowany', () => {
    expect(examples2330).toHaveLength(1)
    expect(chechlo2.releves.map((r) => (r.species as unknown[]).length)).toEqual([2, 7, 13])
    expect(chechlo2.releves.map((r) => [r.coverB, r.coverC, r.coverD])).toEqual([[undefined, 25, 0], [5, 15, 5], [10, 65, 30]])
    const o = chechlo2.other
    expect(Number(o.shareFV) + Number(o.shareU1) + Number(o.shareU2)).toBe(100)
    expect(chechlo2.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(chechlo2)).not.toMatch(/Kulpiński|Tyc/)
    expect(chechlo2.impacts.map((i) => `${i.code}${i.influence}${i.intensity}`)).toEqual(['E03.04-L', 'G01.020M', 'G01.03-H', 'G04.01+M', 'K02-L'])
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, udział FV/U1/U2 i stare kody w opisach', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, chechlo2))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['2330 Wydmy śródlądowe z murawami napiaskowymi', 'Występowanie procesów eolicznych', 'Udział powierzchni siedliska w stanie FV', 'Chechło 2', 'G04.01'])
      expect(text, t).toContain(t)
    expect(text).toMatch(/Kod w karcie z 2011 r.: 730/)
  })
})
