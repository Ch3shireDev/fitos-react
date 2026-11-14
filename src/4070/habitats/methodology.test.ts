import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { examples4070, sokolica } from './examples'
import {
  gradeComplex4070,
  gradeDamage4070,
  gradeDominant4070,
  gradeLichens4070,
  gradeNeedles4070,
  gradeShare4070,
  gradeTypical4070,
  indicator4070 as ind,
  methodology4070 as m,
  parsePercent4070,
} from './methodology'
import { SPECIES_4070, defaultLayer4070, findSpecies4070, speciesKey4070 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues, c = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const warn = (id: string, inputs: InputValues) => ind(id).warn!(inputs, ctx())
const sp = (...names: string[]) => names.map((name) => ({ name }))
const cov = (...pairs: [string, number][]) => pairs.map(([name, cover]) => ({ name, cover }))

describe('metodyka 4070 – struktura', () => {
  it('kod 4070 (nie priorytetowe), transekt 200 m, 3 zdjęcia po 100 m² z warstwami A–D', () => {
    expect(habitatCode(m)).toBe('4070')
    expect(m.name).toBe('Zarośla kosodrzewiny')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('200x10 m')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(100)
    for (const n of ['coverA', 'coverB', 'coverC', 'coverD', 'heightA', 'heightD']) expect(m.releves.fields.some((f) => f.name === n), n).toBe(true)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności tab. 2: powierzchnia + 7 struktury', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Udział procentowy siedliska na transekcie',
      'Gatunki typowe',
      'Gatunki dominujące',
      'Naturalny kompleks siedlisk subalpejskich',
      'Zniszczenia mechaniczne',
      'Obumieranie igieł kosodrzewiny',
      'Bogactwo porostów epifitycznych',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
  })

  it('kardynalne (lista pod tab. 2): gatunki typowe, zniszczenia mechaniczne, porosty', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['typical', 'damage', 'lichens'])
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...allOtherFields(m), ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: ostrzeżenie poza lipcem–sierpniem (2021: badanie 1 września)', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2007-08-26')).toBeNull()
    expect(date.warn!('2021-07-29')).toBeNull()
    expect(date.warn!('2021-09-01')).toMatch(/poza optymalnym/)
    expect(date.warn!('2021-06-30')).toMatch(/poza optymalnym/)
  })

  it('transekt: 200 m (200x10 albo 10x200 jak w karcie), inaczej ostrzeżenie', () => {
    const t = m.siteFields.find((f) => f.name === 'transect')!
    expect(t.warn!('200x10 m')).toBeNull()
    expect(t.warn!('10x200 m')).toBeNull()
    expect(t.warn!('100x10 m')).toMatch(/200 m/)
  })

  it('kody oddziaływań bez duplikatów: szlaki, turystyka górska, narciarstwo, wydeptywanie, sukcesja', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['D01.01', 'G01.04.01', 'G01.06', 'G02.02', 'G05.01', 'H05.01', 'K02', 'X']) expect(codes).toContain(c)
  })

  it('inne informacje: propozycje po działaniach, udział FV/U1/U2 przed uwagami', () => {
    expect(m.otherFields.map((f) => f.name)).toEqual(['otherValues', 'conservation', 'proposals', 'shareFV', 'shareU1', 'shareU2', 'notes', 'photos'])
  })
})

describe('metodyka 4070 – progi tab. 2', () => {
  it('procent jak w karcie papierowej', () => {
    expect(parsePercent4070('do 10')).toEqual({ lo: 10, hi: 10, mid: 10 })
    expect(parsePercent4070('ok. 5%')).toEqual({ lo: 5, hi: 5, mid: 5 })
    expect(parsePercent4070('10–30')).toEqual({ lo: 10, hi: 30, mid: 20 })
    expect(parsePercent4070('7,5')).toEqual({ lo: 7.5, hi: 7.5, mid: 7.5 })
    expect(parsePercent4070(12)).toEqual({ lo: 12, hi: 12, mid: 12 })
    expect(parsePercent4070('sporo')).toBeUndefined()
    expect(parsePercent4070('')).toBeUndefined()
  })

  it('udział na transekcie: >70 FV, 70–40 U1 (obie granice; 2021 Sokolica 40% → U1), <40 U2', () => {
    expect([100, 80, 70.5, 70, 40, 39, 0].map(gradeShare4070)).toEqual(['FV', 'FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('zniszczenia: ≤5 FV, ≤30 U1, >30 U2', () => {
    expect([0, 5, 5.5, 30, 31].map(gradeDamage4070)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('obumieranie igieł: ≤10 FV, ≤30 U1, >30 U2', () => {
    expect([0, 10, 11, 30, 31].map(gradeNeedles4070)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('gatunki typowe: kosodrzewina + ≥4 FV, + 2–3 U1, + 0–1 U2, bez kosodrzewiny U2', () => {
    expect([6, 4, 3, 2, 1, 0].map((n) => gradeTypical4070(true, n))).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
    expect(gradeTypical4070(false, 6)).toBe('U2')
  })

  it('gatunki dominujące: obie warstwy OK FV, jedna U1, żadna U2', () => {
    expect(gradeDominant4070(true, true)).toBe('FV')
    expect(gradeDominant4070(true, false)).toBe('U1')
    expect(gradeDominant4070(false, true)).toBe('U1')
    expect(gradeDominant4070(false, false)).toBe('U2')
  })

  it('kompleks: półnaturalne dominują U2, powypasowe U1, naturalne + kosodrzewina >50% FV, ≤50% U1, brak strefy XX', () => {
    expect(gradeComplex4070(80, 'natural')).toBe('FV')
    expect(gradeComplex4070(50, 'natural')).toBe('U1')
    expect(gradeComplex4070(30, 'natural')).toBe('U1')
    expect(gradeComplex4070(80, 'grazing')).toBe('U1')
    expect(gradeComplex4070(80, 'dominant')).toBe('U2')
    expect(gradeComplex4070(undefined, 'none')).toBe('XX')
    expect(gradeComplex4070(undefined, 'natural')).toBeNull()
    expect(gradeComplex4070(80, '')).toBeNull()
  })

  it('porosty: ≥4 FV, 2–3 U1, 0–1 U2', () => {
    expect([5, 4, 3, 2, 1, 0].map(gradeLichens4070)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })
})

describe('metodyka 4070 – podpowiedzi z pól', () => {
  it('powierzchnia: z wyboru, „brak danych” XX', () => {
    expect(['stable', 'other', 'decrease', 'unknown'].map((choice) => suggest('area', { choice }))).toEqual(['FV', 'U1', 'U2', 'XX'])
    expect(suggest('area', {})).toBeNull()
    expect(ind('area').describe!({ choice: 'decrease', areaText: '12 ha' }, ctx())).toMatch(/^12 ha; wyraźny spadek/)
  })

  it('gatunki typowe: kosodrzewina + inne z tab. 1, synonimy raz, spoza listy się nie liczą', () => {
    const base = cov(['Pinus mugo', 60], ['Vaccinium myrtillus', 40], ['Homogyne alpina', 10])
    expect(suggest('typical', { species: base })).toBe('U1')
    expect(suggest('typical', { species: [...base, ...sp('Deschampsia flexuosa', 'Avenella flexuosa')] })).toBe('U1')
    expect(suggest('typical', { species: [...base, ...sp('Deschampsia flexuosa', 'Ribes petraeum')] })).toBe('FV')
    expect(suggest('typical', { species: sp('Pinus mugo', 'Vaccinium myrtillus', 'Salix silesiaca') })).toBe('U2')
    expect(suggest('typical', { species: sp('Picea abies', 'Vaccinium myrtillus', 'Homogyne alpina', 'Deschampsia flexuosa', 'Ribes petraeum') })).toBe('U2')
    expect(suggest('typical', { species: sp('Sorbus aucuparia', 'Sorbus aucuparia subsp. glabrata', 'Pinus mugo', 'Vaccinium myrtillus') })).toBe('U1')
    expect(suggest('typical', { species: base, choice: 'u2' })).toBe('U2')
    expect(suggest('typical', {})).toBeNull()
    expect(ind('typical').explain!({ species: base }, ctx())).toBe('Kosodrzewina: jest; inne typowe (2): Vaccinium myrtillus, Homogyne alpina – z listy U1.')
    expect(warn('typical', { species: sp('Pinus mugo', 'Salix silesiaca', 'Rubus idaeus') })).toMatch(/Nie liczą się.*Salix silesiaca, Rubus idaeus.*zrębów i prześwietleń \(Rubus idaeus\)/)
    expect(warn('typical', { species: base, choice: 'fv' })).toMatch(/Wybrano FV, a z listy wychodzi U1/)
  })

  it('gatunki dominujące: największe pokrycie w B i C; sprawozdanie 2021 (Pilsko, Polica)', () => {
    expect(suggest('dominant', { speciesB: cov(['Pinus mugo', 60]), speciesC: cov(['Deschampsia flexuosa', 30], ['Vaccinium myrtillus', 20]) })).toBe('FV')
    expect(suggest('dominant', { speciesB: cov(['Juniperus communis subsp. alpina', 40], ['Pinus mugo', 15]), speciesC: cov(['Vaccinium myrtillus', 30]) })).toBe('U1')
    expect(suggest('dominant', { speciesB: cov(['Pinus mugo', 50]), speciesC: cov(['Calamagrostis villosa', 40]) })).toBe('U1')
    expect(suggest('dominant', { speciesB: cov(['Sorbus aucuparia', 15], ['Picea abies', 10]), speciesC: cov(['Nardus stricta', 40]) })).toBe('U2')
    expect(suggest('dominant', { speciesB: cov(['Pinus mugo', 40], ['Picea abies', 40]), speciesC: cov(['Vaccinium myrtillus', 30]) })).toBe('FV')
    expect(suggest('dominant', { speciesB: cov(['Pinus mugo', 40]), speciesC: cov(['Vaccinium myrtillus', 30]), choice: 'u1' })).toBe('U1')
    expect(suggest('dominant', { speciesB: sp('Pinus mugo'), speciesC: sp('Vaccinium myrtillus') })).toBeNull()
    expect(suggest('dominant', { speciesB: cov(['Pinus mugo', 40]) })).toBeNull()
    expect(warn('dominant', { speciesB: cov(['Pinus mugo', 40], ['Ribes petraeum', 5]), speciesC: cov(['Vaccinium myrtillus', 30]) })).toMatch(/poniżej 10%.*Ribes petraeum/)
    expect(ind('dominant').describe!({ speciesB: cov(['Pinus mugo', 40]), speciesC: cov(['Vaccinium myrtillus', 50]) }, ctx())).toBe('Warstwa B: Pinus mugo 40%, warstwa C: Vaccinium myrtillus 50%')
  })

  it('kompleks: udział kosodrzewiny z pola albo z udziału siedliska na transekcie', () => {
    const share = (v: number) => ctx({ indicators: { share: { inputs: { value: v }, value: '', grade: '' } } })
    expect(suggest('complex', { companions: 'natural' }, share(80))).toBe('FV')
    expect(suggest('complex', { companions: 'natural' }, share(40))).toBe('U1')
    expect(suggest('complex', { companions: 'natural', mugo: 60 }, share(40))).toBe('FV')
    expect(suggest('complex', { companions: 'natural' })).toBeNull()
    expect(suggest('complex', { companions: 'none' })).toBe('XX')
    expect(ind('complex').explain!({ companions: 'natural' }, share(80))).toMatch(/80%/)
    expect(ind('complex').describe!({ companions: 'grazing', mugo: 45 }, ctx())).toMatch(/^kosodrzewina 45%; poza naturalnymi/)
  })

  it('zniszczenia: z procentu; opis = procent + przyczyna', () => {
    expect(suggest('damage', { value: 5 })).toBe('FV')
    expect(suggest('damage', { value: 20 })).toBe('U1')
    expect(suggest('damage', { value: 40 })).toBe('U2')
    expect(suggest('damage', {})).toBeNull()
    expect(ind('damage').describe!({ value: 10, cause: 'narty' }, ctx())).toBe('10%, narty')
  })

  it('obumieranie igieł: procent ma pierwszeństwo przed klasą, klasa gdy brak procentu', () => {
    expect(suggest('needles', { value: 'do 10' })).toBe('FV')
    expect(suggest('needles', { value: '10–30' })).toBe('U1')
    expect(suggest('needles', { value: '50', choice: 'fv' })).toBe('U2')
    expect(['fv', 'u1', 'u2'].map((choice) => suggest('needles', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(suggest('needles', {})).toBeNull()
    expect(warn('needles', { value: '50', choice: 'fv' })).toMatch(/nie zgadza się/)
    expect(warn('needles', { value: 'dużo' })).toMatch(/Nie rozumiem/)
    expect(ind('needles').describe!({ value: '15' }, ctx())).toBe('15%')
  })

  it('porosty: pięć gatunków z tab. 2 (synonim Cetraria pinastri raz), inne się nie liczą', () => {
    expect(suggest('lichens', { species: sp('Hypogymnia physodes', 'Parmeliopsis ambigua', 'Pseudevernia furfuracea', 'Vulpicida pinastri') })).toBe('FV')
    expect(suggest('lichens', { species: sp('Hypogymnia physodes', 'Vulpicida pinastri', 'Cetraria pinastri', 'Usnea sp.') })).toBe('U1')
    expect(suggest('lichens', { species: sp('Hypogymnia physodes', 'Parmeliopsis sp.') })).toBe('U2')
    expect(suggest('lichens', { none: 'yes' })).toBe('U2')
    expect(suggest('lichens', { count: 4 })).toBe('FV')
    expect(suggest('lichens', {})).toBeNull()
    expect(warn('lichens', { species: cov(['Hypogymnia physodes', 2], ['Parmeliopsis ambigua', 3]) })).toMatch(/pokrycia >5%/)
    expect(warn('lichens', { species: cov(['Hypogymnia physodes', 10], ['Parmeliopsis ambigua', 10]) })).toBeNull()
    expect(warn('lichens', { species: sp('Pinus mugo'), none: 'yes' })).toMatch(/„Nie stwierdzono”.*To nie porosty: Pinus mugo/)
    expect(ind('lichens').explain!({ species: cov(['Hypogymnia physodes', 10], ['Parmeliopsis ambigua', 5]) }, ctx())).toBe('Porostów z tab. 2: 2 (z pokryciem >5%: 1).')
  })

  it('katalog: kosodrzewina w B, świerk w A, mchy w D, synonimy, bez duplikatów', () => {
    const latin = SPECIES_4070.map((s) => s.latin)
    expect(new Set(latin).size).toBe(latin.length)
    expect(speciesKey4070('Avenella flexuosa')).toBe(speciesKey4070('Deschampsia flexuosa'))
    expect(speciesKey4070('Sorbus aucuparia')).toBe(speciesKey4070('Sorbus aucuparia subsp. glabrata'))
    expect(defaultLayer4070(findSpecies4070('Pinus mugo')!)).toBe('B')
    expect(defaultLayer4070(findSpecies4070('Picea abies')!)).toBe('A')
    expect(defaultLayer4070(findSpecies4070('Polytrichum commune')!)).toBe('D')
    expect(defaultLayer4070(findSpecies4070('Vaccinium myrtillus')!)).toBe('C')
    expect(m.speciesInfo!('Hypogymnia physodes')).toBe('porost epifityczny ze wskaźnika „Bogactwo porostów”')
    expect(m.speciesInfo!('Homogyne alpina')).toBe('gatunek typowy 4070 (tab. 1)')
  })
})

describe('ocena struktury (reguła ogólna silnika, bez structureRule)', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(sokolica)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    return v
  }

  it('metodyka nie nadpisuje reguły silnika – tab. 2 4070 = reguła ogólna', () => {
    expect(m.structureRule).toBeUndefined()
  })

  it('wszystko FV → FV; niekardynalny U2 (udział na transekcie) → struktura U1', () => {
    const v = allFv()
    expect(assessCard(m, v)).toMatchObject({ structure: 'FV', overall: 'FV' })
    v.indicators.share.grade = 'U2'
    expect(assessCard(m, v)).toMatchObject({ structure: 'U1', overall: 'U1' })
  })

  it('kardynalny U1 (porosty) → U1; kardynalny U2 (zniszczenia) → U2', () => {
    const v = allFv()
    v.indicators.lichens.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.damage.grade = 'U2'
    expect(assessCard(m, v)).toMatchObject({ structure: 'U2', overall: 'U2' })
  })

  it('kompleks XX (brak strefy subalpejskiej, Polica 2) nie blokuje oceny struktury', () => {
    const v = allFv()
    v.indicators.complex.grade = 'XX'
    expect(assessCard(m, v).structure).toBe('FV')
  })
})

describe('przykład Sokolica (karta z przewodnika, 2007)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(sokolica)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie (wszystkie FV)', () => {
    const grades = Object.fromEntries(Object.entries(sokolica.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({ area: 'FV', share: 'FV', typical: 'FV', dominant: 'FV', complex: 'FV', damage: 'FV', needles: 'FV', lichens: 'FV' })
  })

  it('oceny parametrów i ogólna jak w karcie: FV, FV, FV → FV', () => {
    expect(assessCard(m, sokolica)).toEqual({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV', missing: [] })
  })

  it('podpowiedzi zgodne z ekspertem', () => {
    const c = ctx({ site: sokolica.site, indicators: sokolica.indicators })
    for (const i of m.indicators) expect(i.suggest!(sokolica.indicators[i.id].inputs, c), i.id).toBe(sokolica.indicators[i.id].grade)
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    const c = ctx({ site: sokolica.site, indicators: sokolica.indicators })
    for (const i of m.indicators) expect(i.describe!(sokolica.indicators[i.id].inputs, c), i.id).toBe(sokolica.indicators[i.id].value)
  })

  it('zdjęcia jak w karcie, udział FV/U1/U2 = 100%, ekspert zanonimizowany, stare kody przemapowane', () => {
    expect(examples4070).toHaveLength(1)
    expect(sokolica.releves.map((r) => (r.species as unknown[]).length)).toEqual([9, 11, 11])
    expect(sokolica.releves.map((r) => [r.coverA, r.coverB, r.coverC, r.coverD])).toEqual([[30, 80, 80, 0], [50, 80, 90, 0], [70, 40, 70, 5]])
    expect(sokolica.releves.map((r) => [r.heightA, r.heightB, r.heightC, r.heightD])).toEqual([[10, 2, 100, 5], [5, 2, 50, 5], [5, 1.5, 50, 3]])
    const names = sokolica.releves.flatMap((r) => (r.species as { name: string }[]).map((s) => s.name))
    for (const n of names) expect(findSpecies4070(n), n).toBeTruthy()
    const o = sokolica.other
    expect(Number(o.shareFV) + Number(o.shareU1) + Number(o.shareU2)).toBe(100)
    expect(sokolica.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(sokolica)).not.toMatch(/Węgrzyn/)
    expect(sokolica.impacts.map((i) => `${i.code}${i.influence}${i.intensity}`)).toEqual(['D01.01-M', 'G01.04.01-M'])
    expect(sokolica.threats.map((t) => t.code)).toEqual(['G05.01', 'D01.01', 'H05.01'])
    for (const t of [...sokolica.impacts, ...sokolica.threats]) expect(m.impactCodes.find((c) => c.code === t.code)?.name, t.code).toBe(t.name)
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, udział FV/U1/U2 i stare kody w opisach', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, sokolica))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['4070 Zarośla kosodrzewiny', 'Bogactwo porostów epifitycznych', 'Udział powierzchni siedliska w stanie FV', 'Sokolica', 'G01.04.01'])
      expect(text, t).toContain(t)
    expect(text).toMatch(/Kod w karcie z 2007 r.: 624/)
  })
})
