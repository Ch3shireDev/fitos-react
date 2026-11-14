import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { examples3240, snietnica } from './examples'
import {
  gradeAliens3240,
  gradeComplex3240,
  gradeCover3240,
  gradeHeight3240,
  gradeShare3240,
  gradeShrubSpecies3240,
  indicator3240 as ind,
  methodology3240 as m,
  parseRange3240,
} from './methodology'
import { SPECIES_3240, defaultLayer3240, findSpecies3240, speciesKey3240 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, ctx())
const warn = (id: string, inputs: InputValues) => ind(id).warn!(inputs, ctx())
const sp = (...names: string[]) => names.map((name) => ({ name }))

describe('metodyka 3240 – struktura', () => {
  it('kod 3240 (nie priorytetowe), transekt 200×10 m, 3 zdjęcia po 25 m², zestaw wskaźników z przewodnika', () => {
    expect(habitatCode(m)).toBe('3240')
    expect(m.name).toBe('Zarośla wierzby siwej na kamieńcach i żwirowiskach górskich potoków')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('200x10 m')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    const empty = emptyCardValues(m)
    expect(empty.releves).toHaveLength(3)
    expect(empty.site.indicatorSet).toBe('guide')
    expect(empty.site.communities).toBe('Salici eleagni-Myricarietum')
  })

  it('wskaźniki w kolejności tab. 1/karty: powierzchnia + 11 struktury', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Powierzchnia zajęta przez siedlisko na transekcie',
      'Gatunki krzewów',
      'Wysokość krzewów (średnia)',
      'Zwarcie krzewów na transekcie',
      'Struktura przestrzenna płatów zarośli',
      'Udział gatunków drzewiastych (powyżej 3 m wys.)',
      'Stan zdrowotny krzewów wierzbowych',
      'Odnowienie wierzby (obecność nalotu)',
      'Gatunki ekspansywnych roślin zielnych',
      'Obce gatunki inwazyjne',
      'Obecność kompleksu siedlisk nadrzecznych: 3220, 3230, 3240, 91E0',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
  })

  it('kardynalne (lista pod tab. 2): gatunki krzewów, drzewiaste, obce, kompleks siedlisk', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['shrubs', 'trees', 'aliens', 'complex'])
  })

  it('zestaw „po harmonizacji 2016”: udział na transekcie zostaje w karcie, ale nie liczy się (10 wskaźników)', () => {
    expect(m.indicators.filter((i) => isExcluded(i, { indicatorSet: 'guide' }))).toEqual([])
    expect(m.indicators.filter((i) => isExcluded(i, { indicatorSet: 'harmonized' })).map((i) => i.id)).toEqual(['share'])
    expect(m.indicators.filter((i) => i.parameter === 'structure' && !isExcluded(i, { indicatorSet: 'harmonized' }))).toHaveLength(10)
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
    expect(date.warn!('2010-07-21')).toBeNull()
    expect(date.warn!('2021-06-20')).toBeNull()
    expect(date.warn!('2021-08-31')).toBeNull()
    expect(date.warn!('2016-09-10')).toMatch(/poza optymalnym/)
    expect(date.warn!('2021-05-30')).toMatch(/poza optymalnym/)
  })

  it('transekt: 200×10 m (też zapisany 10x200), inaczej ostrzeżenie', () => {
    const t = m.siteFields.find((f) => f.name === 'transect')!
    expect(t.warn!('200x10 m')).toBeNull()
    expect(t.warn!('10x200 m')).toBeNull()
    expect(t.warn!('100x10 m')).toMatch(/1000 m²/)
  })

  it('kody oddziaływań bez duplikatów, z regulacją koryt, powodzią, żwirem, obcymi i sukcesją', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['C01.01', 'J02.03.02', 'J02.12.02', 'L08', 'I01', 'K02', 'B02.02', 'E03', 'X']) expect(codes).toContain(c)
  })

  it('inne informacje: propozycje po działaniach, udział FV/U1/U2 przed uwagami', () => {
    expect(m.otherFields.map((f) => f.name)).toEqual(['otherValues', 'conservation', 'proposals', 'shareFV', 'shareU1', 'shareU2', 'notes', 'photos'])
  })
})

describe('metodyka 3240 – progi tab. 2', () => {
  it('liczby i zakresy jak w karcie papierowej', () => {
    expect(parseRange3240('1,5–2')).toEqual({ lo: 1.5, hi: 2, mid: 1.75 })
    expect(parseRange3240('śr. 40–90%')).toEqual({ lo: 40, hi: 90, mid: 65 })
    expect(parseRange3240('40 - 90')).toEqual({ lo: 40, hi: 90, mid: 65 })
    expect(parseRange3240('1.8')).toEqual({ lo: 1.8, hi: 1.8, mid: 1.8 })
    expect(parseRange3240(2)).toEqual({ lo: 2, hi: 2, mid: 2 })
    expect(parseRange3240('dużo')).toBeUndefined()
    expect(parseRange3240('')).toBeUndefined()
  })

  it('udział na transekcie: >25 FV, 10–25 U1 (obie granice), <10 U2', () => {
    expect([100, 25.5, 25, 10, 9.9, 0].map(gradeShare3240)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('wysokość: 1,5–3 FV (obie granice), 0,5–1,5 U1, <0,5 i >3 U2', () => {
    expect([1.5, 3, 1.49, 0.5, 0.49, 3.1].map(gradeHeight3240)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('zwarcie: >30 FV, 10–30 U1 (30 też – sprawozdanie 2021), <10 U2', () => {
    expect([31, 30, 25, 10, 9].map(gradeCover3240)).toEqual(['FV', 'U1', 'U1', 'U1', 'U2'])
  })

  it('gatunki krzewów: brak wierzby siwej U2; niska wierzba siwa albo brak/sporadyczna września U1', () => {
    expect(gradeShrubSpecies3240({ eleagnos: 65, myricaria: 3 })).toBe('FV')
    expect(gradeShrubSpecies3240({ eleagnos: 'present', myricaria: 'present' })).toBe('FV')
    expect(gradeShrubSpecies3240({ eleagnos: 5, myricaria: 3 })).toBe('U1')
    expect(gradeShrubSpecies3240({ eleagnos: 40, myricaria: 0.5 })).toBe('U1')
    expect(gradeShrubSpecies3240({ eleagnos: 40 })).toBe('U1')
    expect(gradeShrubSpecies3240({ eleagnos: 40, myricariaNearby: 'abundant' })).toBe('FV')
    expect(gradeShrubSpecies3240({ eleagnos: 40, myricaria: 0.5, myricariaNearby: 'sporadic' })).toBe('U1')
    expect(gradeShrubSpecies3240({ myricaria: 10 })).toBe('U2')
  })

  it('obce: 0 FV; 1 gatunek pojedynczo FV, w kępach U1; 2 gatunki U1; 3+ albo łanowo U2', () => {
    expect(gradeAliens3240(0, '')).toBe('FV')
    expect(gradeAliens3240(1, 'single')).toBe('FV')
    expect(gradeAliens3240(1, '')).toBe('FV')
    expect(gradeAliens3240(1, 'clumps')).toBe('U1')
    expect(gradeAliens3240(2, 'single')).toBe('U1')
    expect(gradeAliens3240(3, 'single')).toBe('U2')
    expect(gradeAliens3240(1, 'massive')).toBe('U2')
  })

  it('kompleks siedlisk: ≥3 dobrze wykształcone FV, ≥2 obecne U1, ≤1 U2', () => {
    expect(gradeComplex3240(4, 4)).toBe('FV')
    expect(gradeComplex3240(3, 3)).toBe('FV')
    expect(gradeComplex3240(3, 2)).toBe('U1')
    expect(gradeComplex3240(2, 0)).toBe('U1')
    expect(gradeComplex3240(1, 1)).toBe('U2')
    expect(gradeComplex3240(0, 0)).toBe('U2')
  })
})

describe('metodyka 3240 – podpowiedzi z pól', () => {
  it('powierzchnia: z wyboru; udział na transekcie jako wskazówka w wyjaśnieniu', () => {
    expect(['stable', 'other', 'decrease', 'unknown'].map((choice) => suggest('area', { choice }))).toEqual(['FV', 'U1', 'U2', 'XX'])
    expect(suggest('area', {})).toBeNull()
    expect(ind('area').explain!({}, ctx({ indicators: { share: { inputs: { value: 20 }, value: '', grade: '' } } }))).toMatch(/20% transektu.*U1/)
    expect(ind('area').describe!({ choice: 'decrease', areaText: '0,2 ha' }, ctx())).toMatch(/^0,2 ha; wyraźny spadek/)
  })

  it('gatunki krzewów: z listy (synonimy wierzby siwej), wybór eksperta ma pierwszeństwo', () => {
    expect(suggest('shrubs', { species: [{ name: 'Salix elaeagnos', cover: 40 }, { name: 'Myricaria germanica', cover: 2 }] })).toBe('FV')
    expect(suggest('shrubs', { species: [{ name: 'Salix purpurea', cover: 60 }] })).toBe('U2')
    expect(suggest('shrubs', { species: [{ name: 'Salix purpurea', cover: 60 }], choice: 'u1' })).toBe('U1')
    expect(suggest('shrubs', { species: sp('Salix eleagnos'), myricariaNearby: 'abundant' })).toBe('FV')
    expect(suggest('shrubs', {})).toBeNull()
    expect(ind('shrubs').explain!({ species: [{ name: 'Salix eleagnos', cover: 5 }] }, ctx())).toBe('Wierzba siwa: 5%; września: brak – z listy U1.')
    expect(warn('shrubs', { species: sp('Tussilago farfara') })).toMatch(/To nie krzewy: Tussilago farfara.*żadnej wierzby/)
    expect(warn('shrubs', { species: [{ name: 'Salix eleagnos', cover: 5 }], choice: 'fv' })).toMatch(/Wybrano FV, a z listy wychodzi U1/)
  })

  it('wysokość i zwarcie: z liczby albo środka zakresu, ostrzeżenie przy bzdurze i centymetrach', () => {
    expect(suggest('height', { height: '0,4' })).toBe('U2')
    expect(suggest('height', { height: '1–2' })).toBe('FV')
    expect(suggest('height', { height: '0,5–1' })).toBe('U1')
    expect(suggest('height', {})).toBeNull()
    expect(warn('height', { height: '150' })).toMatch(/centymetrach/)
    expect(warn('height', { height: 'wysokie' })).toMatch(/Nie rozumiem/)
    expect(ind('height').describe!({ height: '2', max: '' }, ctx())).toBe('2 m')
    expect(suggest('cover', { value: '25-30' })).toBe('U1')
    expect(suggest('cover', { value: '5' })).toBe('U2')
    expect(ind('cover').describe!({ value: '60' }, ctx())).toBe('śr. 60%')
  })

  it('struktura, drzewiaste, zdrowie, odnowienie: z wyboru', () => {
    expect(['compact', 'patches', 'scattered', 'none'].map((choice) => suggest('structure', { choice }))).toEqual(['FV', 'U1', 'U1', 'U2'])
    expect(['none', 'single', 'some', 'many'].map((choice) => suggest('trees', { choice }))).toEqual(['FV', 'FV', 'U1', 'U2'])
    expect(['good', 'some', 'bad'].map((choice) => suggest('health', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(['common', 'few', 'none'].map((choice) => suggest('regeneration', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(warn('trees', { choice: 'none', species: sp('Alnus incana') })).toMatch(/„Brak”/)
    expect(ind('trees').describe!({ choice: 'some', species: [{ name: 'Alnus incana', cover: 10 }] }, ctx())).toBe('Pojedyncze rozrośnięte drzewa lub drzewa w niewielkich kępach: Alnus incana 10%')
  })

  it('gatunki ekspansywne: ocena z wyboru, „nie stwierdzono” = FV, ostrzeżenia', () => {
    expect(['fv', 'u1', 'u2'].map((choice) => suggest('expansive', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(suggest('expansive', { none: 'yes' })).toBe('FV')
    expect(suggest('expansive', { species: [{ name: 'Phalaris arundinacea', cover: 30 }] })).toBeNull()
    expect(warn('expansive', { species: sp('Impatiens glandulifera') })).toMatch(/Obce gatunki inwazyjne.*Impatiens glandulifera/)
    expect(warn('expansive', { species: sp('Rubus caesius', 'Urtica dioica'), choice: 'fv' })).toMatch(/FV przy 2 gatunkach/)
    expect(ind('expansive').describe!({ species: [], none: 'yes' }, ctx())).toBe('nie stwierdzono')
  })

  it('obce: liczba gatunków (synonimy raz), liczebność z pola albo z pokrycia', () => {
    expect(suggest('aliens', { none: 'yes' })).toBe('FV')
    expect(suggest('aliens', { species: [{ name: 'Reynoutria japonica', cover: 0.5 }] })).toBe('FV')
    expect(suggest('aliens', { species: [{ name: 'Reynoutria japonica', cover: 5 }] })).toBe('U1')
    expect(suggest('aliens', { species: [{ name: 'Reynoutria japonica', cover: 30 }] })).toBe('U2')
    expect(suggest('aliens', { species: sp('Reynoutria japonica'), abundance: 'clumps' })).toBe('U1')
    expect(suggest('aliens', { species: sp('Conyza canadensis', 'Erigeron canadensis') })).toBe('FV')
    expect(suggest('aliens', { species: sp('Impatiens glandulifera', 'Solidago gigantea', 'Heracleum sosnowskyi') })).toBe('U2')
    expect(suggest('aliens', { count: 2 })).toBe('U1')
    expect(suggest('aliens', {})).toBeNull()
    expect(warn('aliens', { species: sp('Urtica dioica') })).toMatch(/rodzime: Urtica dioica/)
    expect(warn('aliens', { species: sp('Reynoutria japonica'), none: 'yes' })).toMatch(/„Nie stwierdzono”/)
  })

  it('kompleks siedlisk: wszystkie cztery pola, inaczej brak podpowiedzi', () => {
    const all = (s: string) => ({ h3220: s, h3230: s, h3240: s, h91E0: s })
    expect(suggest('complex', all('good'))).toBe('FV')
    expect(suggest('complex', { ...all('poor'), h3240: 'good' })).toBe('U1')
    expect(suggest('complex', { ...all('absent'), h3240: 'good' })).toBe('U2')
    expect(suggest('complex', { h3220: 'good' })).toBeNull()
    expect(ind('complex').describe!({ ...all('absent'), h3240: 'good', h91E0: 'poor' }, ctx())).toBe('3240, 91E0 (słabo wykształcone)')
    expect(warn('complex', { h3240: 'absent' })).toMatch(/brak 3240/)
  })

  it('katalog: wierzby i września w B, runo w C, synonimy, bez duplikatów', () => {
    const latin = SPECIES_3240.map((s) => s.latin)
    expect(new Set(latin).size).toBe(latin.length)
    expect(speciesKey3240('Salix elaeagnos')).toBe(speciesKey3240('Salix eleagnos'))
    expect(defaultLayer3240(findSpecies3240('Myricaria germanica')!)).toBe('B')
    expect(defaultLayer3240(findSpecies3240('Alnus incana')!)).toBe('B')
    expect(defaultLayer3240(findSpecies3240('Tussilago farfara')!)).toBe('C')
    expect(m.speciesInfo!('Reynoutria japonica')).toBe('gatunek obcy inwazyjny')
    expect(m.speciesInfo!('Salix triandra')).toBe('gatunek budujący zarośla 3240')
  })
})

describe('ocena struktury', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(snietnica)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    v.prospects.grade = 'FV'
    return v
  }

  it('wszystko FV → FV; niekardynalny U2 (wysokość) → struktura U1', () => {
    const v = allFv()
    expect(assessCard(m, v)).toMatchObject({ structure: 'FV', overall: 'FV' })
    v.indicators.height.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
  })

  it('kardynalny U1 (obce) → U1; kardynalny U2 (kompleks) → U2', () => {
    const v = allFv()
    v.indicators.aliens.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.complex.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U2')
  })

  it('po harmonizacji udział na transekcie U2 nie obniża struktury', () => {
    const v = allFv()
    v.indicators.share.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
    v.site.indicatorSet = 'harmonized'
    expect(assessCard(m, v).structure).toBe('FV')
  })
})

describe('przykład Śnietnica (karta z przewodnika, 2010)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(snietnica)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie', () => {
    const grades = Object.fromEntries(Object.entries(snietnica.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({
      area: 'FV',
      share: 'FV',
      shrubs: 'FV',
      height: 'FV',
      cover: 'FV',
      structure: 'U1',
      trees: 'FV',
      health: 'FV',
      regeneration: 'FV',
      expansive: 'FV',
      aliens: 'U1',
      complex: 'FV',
    })
  })

  it('rozjazd z kartą: struktura U1 (karta: FV), bo kardynalny „obce” ma U1 – tab. 2; ogólna U1 (karta: FV)', () => {
    expect(assessCard(m, snietnica)).toMatchObject({ area: 'FV', structure: 'U1', prospects: 'FV', overall: 'U1', missing: [] })
    // bez kardynalnego U1 wyszłoby jak w karcie
    const v = structuredClone(snietnica)
    v.indicators.aliens.grade = 'FV'
    expect(assessCard(m, v)).toMatchObject({ structure: 'FV', overall: 'FV' })
  })

  it('podpowiedzi zgodne z ekspertem', () => {
    const c = ctx({ site: snietnica.site, indicators: snietnica.indicators })
    for (const i of m.indicators) expect(i.suggest!(snietnica.indicators[i.id].inputs, c), i.id).toBe(snietnica.indicators[i.id].grade)
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    const c = ctx({ site: snietnica.site, indicators: snietnica.indicators })
    for (const i of m.indicators) expect(i.describe!(snietnica.indicators[i.id].inputs, c), i.id).toBe(snietnica.indicators[i.id].value)
  })

  it('zdjęcia jak w karcie, udział FV/U1/U2 = 100%, ekspert zanonimizowany, stare kody przemapowane', () => {
    expect(examples3240).toHaveLength(1)
    expect(snietnica.releves.map((r) => (r.species as unknown[]).length)).toEqual([32, 28, 40])
    expect(snietnica.releves.map((r) => [r.coverB, r.coverC, r.heightB, r.heightC])).toEqual([[60, 60, 1.75, 30], [40, 50, 1, 30], [90, 50, 3, 40]])
    const names = snietnica.releves.flatMap((r) => (r.species as { name: string }[]).map((s) => s.name))
    for (const n of names) expect(findSpecies3240(n), n).toBeTruthy()
    const o = snietnica.other
    expect(Number(o.shareFV) + Number(o.shareU1) + Number(o.shareU2)).toBe(100)
    expect(snietnica.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(snietnica)).not.toMatch(/Perzanowska/)
    expect(snietnica.impacts.map((i) => `${i.code}${i.influence}${i.intensity}`)).toEqual(['J02.03.02-H', 'L08+H'])
    expect(snietnica.threats.map((t) => t.code)).toEqual(['L08', 'I01', 'J02.03.02', 'E03', 'K02'])
    for (const t of [...snietnica.impacts, ...snietnica.threats]) expect(m.impactCodes.find((c) => c.code === t.code)?.name, t.code).toBe(t.name)
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, udział FV/U1/U2 i stare kody w opisach', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, snietnica))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['3240 Zarośla wierzby siwej na kamieńcach i żwirowiskach górskich potoków', 'Obecność kompleksu siedlisk nadrzecznych', 'Udział powierzchni siedliska w stanie FV', 'Śnietnica', 'L08'])
      expect(text, t).toContain(t)
    expect(text).toMatch(/Kod w karcie z 2010 r.: 830/)
  })
})
