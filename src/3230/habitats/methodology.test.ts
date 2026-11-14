import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { bialka03, examples3230 } from './examples'
import {
  gradeAliens3230,
  gradeComplex3230,
  gradeCover3230,
  gradeHeight3230,
  gradeShare3230,
  gradeTrees3230,
  gradeWidth3230,
  indicator3230 as ind,
  methodology3230 as m,
} from './methodology'
import { SPECIES_3230, defaultLayer3230, findSpecies3230, speciesKey3230 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, ctx())
const warn = (id: string, inputs: InputValues) => ind(id).warn!(inputs, ctx())
const describeOf = (id: string, inputs: InputValues) => ind(id).describe!(inputs, ctx())
const sp = (...names: string[]) => names.map((name) => ({ name }))

describe('metodyka 3230 – struktura', () => {
  it('kod 3230 (nie priorytetowe), transekt 200×10 m, 3 zdjęcia po 25 m²', () => {
    expect(habitatCode(m)).toBe('3230')
    expect(m.name).toBe('Zarośla wrześni na kamieńcach i żwirowiskach górskich potoków')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('200x10 m')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('jedenaście wskaźników struktury w kolejności tab. 1 (jak w sprawozdaniu 2021) + powierzchnia', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Powierzchnia zajęta przez siedlisko na transekcie',
      'Gatunki krzewów',
      'Wysokość krzewów wrześni (średnia)',
      'Zwarcie krzewów wrześni w płacie',
      'Struktura przestrzenna płatów zarośli wrześni',
      'Udział gatunków drzewiastych (powyżej 1,5 m wys.)',
      'Gatunki ekspansywnych roślin zielnych',
      'Odnowienie krzewów wrześni',
      'Szerokość kamieńców',
      'Obce gatunki inwazyjne',
      'Obecność kompleksu siedlisk nadrzecznych: 3220, 3230, 3240, 91E0',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
  })

  it('kardynalne (lista pod tab. 2): gatunki krzewów, drzewa, ekspansywne, odnowienie', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['shrubSpecies', 'trees', 'expansive', 'regeneration'])
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

  it('termin: ostrzeżenie poza czerwcem–sierpniem', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2021-06-01')).toBeNull()
    expect(date.warn!('2021-08-31')).toBeNull()
    expect(date.warn!('2009-09-27')).toMatch(/poza optymalnym/)
    expect(date.warn!('2021-05-20')).toMatch(/poza optymalnym/)
  })

  it('transekt: 20 arów, inaczej ostrzeżenie; wysokość: ostrzeżenie poza 350–1050 m', () => {
    const t = m.siteFields.find((f) => f.name === 'transect')!
    expect(t.warn!('200x10 m')).toBeNull()
    expect(t.warn!('20×100 m')).toBeNull()
    expect(t.warn!('100x10 m')).toMatch(/1000 m²/)
    const alt = m.siteFields.find((f) => f.name === 'altitude')!
    expect(alt.warn!('540')).toBeNull()
    expect(alt.warn!('540–545')).toBeNull()
    expect(alt.warn!('210')).toMatch(/poza znanym zakresem/)
  })

  it('stanowisko: rzeka/odcinek i wezbrania od poprzedniego badania', () => {
    const names = m.siteFields.map((f) => f.name)
    expect(names).toContain('river')
    expect(names.indexOf('floods')).toBe(names.indexOf('date') + 1)
  })

  it('kody oddziaływań (słownik 2011) bez duplikatów, z regulacją, żwirem, odpadami, kempingami, powodzią i sukcesją', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['C01.01', 'E01.03', 'E03.01', 'G02.08', 'I01', 'J02.03', 'K02', 'L08', 'X']) expect(codes).toContain(c)
  })

  it('inne informacje: udział powierzchni FV/U1/U2 przed uwagami', () => {
    expect(m.otherFields.map((f) => f.name)).toEqual(['otherValues', 'conservation', 'shareFV', 'shareU1', 'shareU2', 'notes', 'photos'])
  })
})

describe('metodyka 3230 – progi tab. 2', () => {
  it('powierzchnia na transekcie: >10% FV, 5–10% U1 (obie granice), <5% U2', () => {
    expect([100, 10.5, 10, 5, 4.9, 0].map(gradeShare3230)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('wysokość: 0,7–2,5 FV (0,7 też), 0,2–0,7 U1 (0,2 też), <0,2 U2', () => {
    expect([3, 2.5, 2, 0.7, 0.69, 0.2, 0.19, 0].map(gradeHeight3230)).toEqual(['FV', 'FV', 'FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('zwarcie: 30–80 FV, 10–30 i 80–95 U1, <10 i >95 U2', () => {
    expect([5, 10, 29, 30, 80, 81, 95, 96].map(gradeCover3230)).toEqual(['U2', 'U1', 'U1', 'FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('drzewa (zwarcie): 0 FV, do 30 U1 (30 też), >30 U2', () => {
    expect([0, 5, 30, 31].map(gradeTrees3230)).toEqual(['FV', 'U1', 'U1', 'U2'])
  })

  it('szerokość kamieńców: >30 FV, 10–30 U1 (obie granice), <10 U2', () => {
    expect([60, 30.5, 30, 10, 9.5].map(gradeWidth3230)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('obce: brak FV, pojedynczo/kępy U1 (także kilka gatunków), masowo U2', () => {
    expect(gradeAliens3230(0, false)).toBe('FV')
    expect(gradeAliens3230(1, false)).toBe('U1')
    expect(gradeAliens3230(3, false)).toBe('U1')
    expect(gradeAliens3230(1, true)).toBe('U2')
    expect(gradeAliens3230(2, true)).toBe('U2')
  })

  it('kompleks siedlisk: ≥3 dobrze FV; ≥2 obecne, ≥1 dobrze U1; reszta U2', () => {
    expect(gradeComplex3230(4, 4)).toBe('FV')
    expect(gradeComplex3230(3, 3)).toBe('FV')
    expect(gradeComplex3230(4, 2)).toBe('U1')
    expect(gradeComplex3230(2, 1)).toBe('U1')
    expect(gradeComplex3230(2, 0)).toBe('U2')
    expect(gradeComplex3230(1, 1)).toBe('U2')
    expect(gradeComplex3230(0, 0)).toBe('U2')
  })
})

describe('metodyka 3230 – podpowiedzi z pól', () => {
  it('powierzchnia siedliska i na transekcie', () => {
    expect(['stable', 'other', 'clearDecrease', 'unknown'].map((choice) => suggest('area', { choice }))).toEqual(['FV', 'U1', 'U2', 'XX'])
    expect(describeOf('area', { choice: 'stable', areaHa: 0.5 })).toBe('0,5 ha; nie podlega zmianom lub zwiększa się')
    expect(suggest('share', { value: 8 })).toBe('U1')
    expect(ind('share').explain!({ value: 10 }, ctx())).toBe('10% transektu to ok. 2 a.')
  })

  it('gatunki krzewów: z wyboru; ostrzega o braku wierzby siwej/wrześni i o przewadze innych krzewów', () => {
    expect(['full', 'poor', 'foreign'].map((choice) => suggest('shrubSpecies', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(warn('shrubSpecies', { choice: 'full', species: [{ name: 'Salix eleagnos', cover: 40 }] })).toMatch(/nie ma wrześni/)
    expect(warn('shrubSpecies', { choice: 'full', species: sp('Myricaria germanica', 'Salix purpurea') })).toMatch(/nie ma wierzby siwej/)
    expect(warn('shrubSpecies', { choice: 'full', species: sp('Myricaria germanica', 'Salix elaeagnos') })).toBeNull()
    expect(warn('shrubSpecies', { choice: 'poor', species: [{ name: 'Myricaria germanica', cover: 2 }, { name: 'Sambucus nigra', cover: 10 }] })).toMatch(/przeważają nad typowymi/)
    expect(ind('shrubSpecies').explain!({ species: [{ name: 'Myricaria germanica', cover: 10 }, { name: 'Salix eleagnos', cover: 30 }, { name: 'Euonymus europaeus' }] }, ctx())).toBe(
      'Gatunki typowe na liście: 2, inne krzewy: 1. Września: 10%.',
    )
  })

  it('wysokość i zwarcie: z liczby; ostrzeżenie powyżej 2,5 m', () => {
    expect(suggest('height', { value: 0.5 })).toBe('U1')
    expect(warn('height', { value: 3 })).toMatch(/powyżej górnej granicy/)
    expect(warn('height', { value: 2.5 })).toBeNull()
    expect(suggest('cover', { value: 90 })).toBe('U1')
    expect(describeOf('cover', { value: 40 })).toBe('40%')
  })

  it('struktura przestrzenna i odnowienie: z wyboru', () => {
    expect(['patches', 'scattered', 'single'].map((choice) => suggest('spatial', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(['common', 'rare', 'none'].map((choice) => suggest('regeneration', { choice }))).toEqual(['FV', 'U1', 'U2'])
  })

  it('drzewa: wybór ma pierwszeństwo, bez wyboru z procentu; ostrzeżenie przy rozjeździe', () => {
    expect(['none', 'single', 'present', 'mass'].map((choice) => suggest('trees', { choice }))).toEqual(['FV', 'FV', 'U1', 'U2'])
    expect(suggest('trees', { value: 40 })).toBe('U2')
    expect(suggest('trees', { value: 0 })).toBe('FV')
    expect(suggest('trees', {})).toBeNull()
    expect(warn('trees', { choice: 'none', value: 10 })).toMatch(/sprawdź/)
    expect(warn('trees', { choice: 'mass', value: 50 })).toBeNull()
    expect(describeOf('trees', { choice: 'present', value: 10, species: [{ name: 'Alnus incana', cover: 10 }] })).toBe('Wyraźny udział – zwarcie poniżej 30%; zwarcie 10%; Alnus incana 10%')
  })

  it('gatunki ekspansywne: z wyboru; ostrzega o obcych i o pokryciu przy „brak”', () => {
    expect(['none', 'clumps', 'mass'].map((choice) => suggest('expansive', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(warn('expansive', { choice: 'none', species: [{ name: 'Petasites hybridus', cover: 20 }] })).toMatch(/łączne pokrycie to 20%/)
    expect(warn('expansive', { choice: 'clumps', species: sp('Impatiens glandulifera') })).toMatch(/Obce gatunki inwazyjne/)
    expect(warn('expansive', { choice: 'clumps', species: sp('Calamagrostis epigejos', 'Calamagrostis epigeios') })).toBeNull()
    expect(describeOf('expansive', { choice: 'none', species: [] })).toBe('nie stwierdzono')
  })

  it('szerokość kamieńców: a+b, łączna wprost ma pierwszeństwo', () => {
    expect(suggest('width', { left: 20, right: 15 })).toBe('FV')
    expect(suggest('width', { left: 20, right: 10 })).toBe('U1')
    expect(suggest('width', { left: 8 })).toBe('U2')
    expect(suggest('width', { left: 20, right: 15, value: 12 })).toBe('U1')
    expect(suggest('width', { note: '5–30 m' })).toBeNull()
    expect(describeOf('width', { left: 20, right: 15 })).toBe('20+15 m')
    expect(ind('width').explain!({ left: 20, right: 15 }, ctx())).toBe('Razem 20 + 15 = 35 m.')
  })

  it('obce gatunki: liczba z listy (synonimy raz), masowość decyduje o U2', () => {
    expect(suggest('aliens', { species: [{ name: 'Impatiens glandulifera', cover: 5 }] })).toBe('U1')
    expect(suggest('aliens', { species: sp('Impatiens glandulifera', 'Erigeron annuus', 'Conyza canadensis') })).toBe('U1')
    expect(suggest('aliens', { species: sp('Heracleum sosnowskyi'), abundance: 'mass' })).toBe('U2')
    expect(suggest('aliens', { none: 'yes' })).toBe('FV')
    expect(suggest('aliens', {})).toBeNull()
    expect(ind('aliens').explain!({ species: sp('Conyza canadensis', 'Erigeron canadensis') }, ctx())).toMatch(/^Gatunków obcych: 1,/)
    expect(ind('aliens').explain!({ species: sp('Impatiens glandulifera', 'Erigeron annuus') }, ctx())).toMatch(/praktyka 2021/)
    expect(warn('aliens', { species: [{ name: 'Reynoutria japonica', cover: 30 }] })).toMatch(/masowo/)
    expect(warn('aliens', { species: sp('Salix eleagnos') })).toMatch(/rodzime: Salix eleagnos/)
    expect(warn('aliens', { species: sp('Impatiens glandulifera'), none: 'yes' })).toMatch(/„Nie stwierdzono”/)
    expect(describeOf('aliens', { species: [{ name: 'Impatiens glandulifera', cover: 5 }], abundance: 'small' })).toBe(
      'Impatiens glandulifera 5%; pojedynczo lub w niewielkich kępach',
    )
  })

  it('kompleks siedlisk: podpowiedź dopiero po wyborze wszystkich czterech', () => {
    const all = { h3220: 'good', h3230: 'good', h3240: 'poor', h91E0: 'good' }
    expect(suggest('complex', all)).toBe('FV')
    expect(suggest('complex', { ...all, h3220: 'absent', h91E0: 'poor' })).toBe('U1')
    expect(suggest('complex', { h3220: 'absent', h3230: 'poor', h3240: 'poor', h91E0: 'absent' })).toBe('U2')
    expect(suggest('complex', { h3230: 'good' })).toBeNull()
    expect(ind('complex').explain!({ h3230: 'good' }, ctx())).toMatch(/Wybrano 1 z 4/)
    expect(describeOf('complex', { ...all, h91E0: 'absent' })).toBe('3220, 3230 – dobrze wykształcone; 3240 – słabo wykształcone; brak: 91E0')
  })

  it('katalog: bez duplikatów, warstwy, grupy, synonimy jednym kluczem', () => {
    const latins = SPECIES_3230.map((s) => s.latin)
    expect(new Set(latins).size).toBe(latins.length)
    expect(speciesKey3230('Salix elaeagnos')).toBe(speciesKey3230('Salix eleagnos'))
    expect(speciesKey3230('Calamagrostis epigeios')).toBe(speciesKey3230('Calamagrostis epigejos'))
    expect(defaultLayer3230(findSpecies3230('Myricaria germanica')!)).toBe('B')
    expect(defaultLayer3230(findSpecies3230('Alnus glutinosa')!)).toBe('B')
    expect(defaultLayer3230(findSpecies3230('Tussilago farfara')!)).toBe('C')
    expect(m.speciesInfo!('Myricaria germanica')).toBe('krzew typowy dla 3230')
    expect(m.speciesInfo!('Impatiens glandulifera')).toBe('gatunek obcy inwazyjny')
    expect(m.speciesInfo!('Abies alba')).toBeUndefined()
  })
})

describe('ocena struktury', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(bialka03)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    v.prospects.grade = 'FV'
    return v
  }

  it('wszystko FV → FV; niekardynalny U2 (szerokość) → struktura U1', () => {
    const v = allFv()
    expect(assessCard(m, v)).toMatchObject({ structure: 'FV', overall: 'FV' })
    v.indicators.width.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
  })

  it('kardynalny U1 (odnowienie) → U1; kardynalny U2 (drzewa) → U2', () => {
    const v = allFv()
    v.indicators.regeneration.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.trees.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U2')
  })
})

describe('przykład Białka 03 (karta z przewodnika, 2009)', () => {
  const c = ctx({ site: bialka03.site, indicators: bialka03.indicators })

  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(bialka03)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie', () => {
    const grades = Object.fromEntries(Object.entries(bialka03.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({
      area: 'FV',
      share: 'FV',
      shrubSpecies: 'FV',
      height: 'FV',
      cover: 'FV',
      spatial: 'FV',
      trees: 'U1',
      expansive: 'U1',
      regeneration: 'FV',
      width: 'FV',
      aliens: 'U1',
      complex: 'FV',
    })
  })

  it('rozbieżność z kartą: struktura i ocena ogólna U1 (w karcie FV) – dwa kardynalne U1', () => {
    expect(assessCard(m, bialka03)).toMatchObject({ area: 'FV', structure: 'U1', prospects: 'FV', overall: 'U1', missing: [] })
    expect(bialka03.overallComment).toMatch(/W karcie z przewodnika: specyficzna struktura i funkcje FV, ocena ogólna FV/)
  })

  it('podpowiedzi zgodne z ekspertem poza dwoma opisanymi wskaźnikami', () => {
    const diff = m.indicators
      .map((i) => [i.id, i.suggest!(bialka03.indicators[i.id].inputs, c), bialka03.indicators[i.id].grade] as const)
      .filter(([, s, g]) => s !== g)
    // drzewa: „Brak” → tab. 2 daje FV, karta U1; szerokość „5–30 m” – bez liczb nie ma podpowiedzi, karta FV
    expect(diff).toEqual([
      ['trees', 'FV', 'U1'],
      ['width', null, 'FV'],
    ])
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    for (const i of m.indicators) expect(i.describe!(bialka03.indicators[i.id].inputs, c), i.id).toBe(bialka03.indicators[i.id].value)
  })

  it('zdjęcia jak w karcie, udział FV/U1/U2 = 100%, wykonawca zanonimizowany, stare kody przepisane', () => {
    expect(examples3230).toHaveLength(1)
    expect(bialka03.releves.map((r) => (r.species as unknown[]).length)).toEqual([15, 16, 19])
    expect(bialka03.releves.map((r) => [r.area, r.coverB, r.coverC, r.heightB, r.heightC])).toEqual([
      [25, 25, 60, 2, 200],
      [25, 10, 80, 2, 200],
      [100, 50, 70, 2.5, 200],
    ])
    const o = bialka03.other
    expect(Number(o.shareFV) + Number(o.shareU1) + Number(o.shareU2)).toBe(100)
    expect(bialka03.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(bialka03)).not.toMatch(/Węgrzyn|Perzanowska/)
    expect(bialka03.impacts.map((i) => `${i.code}${i.influence}${i.intensity}`)).toEqual(['E03.01-H', 'J02.03-L', 'G02.08-M', 'L08' + '0L'])
    expect(bialka03.threats.map((t) => t.code)).toEqual(['J02.03', 'G02.08', 'E03.01'])
    const codes = m.impactCodes.map((x) => x.code)
    for (const i of [...bialka03.impacts, ...bialka03.threats]) expect(codes, i.code).toContain(i.code)
  })

  it('ostrzeżenia przykładu: termin i transekt w porządku co do powierzchni, data poza oknem', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    const transect = m.siteFields.find((f) => f.name === 'transect')!
    expect(date.warn!(bialka03.site.date)).toMatch(/poza optymalnym/)
    expect(transect.warn!(bialka03.site.transect)).toBeNull()
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, udział FV/U1/U2 i stare kody w opisach', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, bialka03))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['3230 Zarośla wrześni na kamieńcach i żwirowiskach górskich potoków', 'Odnowienie krzewów wrześni', 'Udział powierzchni siedliska w stanie FV', 'Białka 03', 'J02.03'])
      expect(text, t).toContain(t)
    expect(text).toMatch(/Kod w karcie z 2009 r.: 830/)
  })
})
