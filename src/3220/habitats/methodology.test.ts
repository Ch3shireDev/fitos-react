import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { examples3220, siwaWoda } from './examples'
import {
  gradeAreaShare3220,
  gradeComplex3220,
  gradeHerbCover3220,
  gradeHerbHeight3220,
  gradeWidth3220,
  indicator3220 as ind,
  methodology3220 as m,
  parseMeasurements,
} from './methodology'
import { SPECIES_3220, defaultLayer3220, findSpecies3220, isExpansive3220, isInvasive3220, speciesKey3220 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, ctx())
const warn = (id: string, inputs: InputValues) => ind(id).warn!(inputs, ctx())
const explain = (id: string, inputs: InputValues) => ind(id).explain!(inputs, ctx())
const describeOf = (id: string, inputs: InputValues) => ind(id).describe!(inputs, ctx())
const sp = (...names: string[]) => names.map((name) => ({ name }))

describe('metodyka 3220 – struktura', () => {
  it('kod 3220 (nie priorytetowe), transekt 200×10 m, 3 zdjęcia po 25 m²', () => {
    expect(habitatCode(m)).toBe('3220')
    expect(m.name).toBe('Pionierska roślinność na kamieńcach górskich potoków')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('200x10 m')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności tab. 2; powierzchnia kamieńców przy parametrze powierzchni, 9 wskaźników struktury (jak w 2016 i 2021)', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia kamieńców na transekcie',
      'Szerokość kamieńców',
      'Pokrycie kamieńców przez roślinność zielną',
      'Wysokość warstwy zielnej',
      'Gatunki ekspansywnych roślin zielnych',
      'Obce gatunki inwazyjne',
      'Gatunki krzewów',
      'Zwarcie krzewów na transekcie',
      'Udział gatunków drzewiastych (powyżej 1,5 m wys.)',
      'Obecność kompleksu siedlisk nadrzecznych: 3220, 3230, 3240, 91E0',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
    expect(m.indicators.filter((i) => i.parameter === 'structure')).toHaveLength(9)
  })

  it('kardynalne (lista pod tab. 2): zwarcie krzewów, ekspansywne, obce, kompleks siedlisk', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['expansive', 'aliens', 'shrubCover', 'complex'])
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
    expect(date.warn!('2010-07-10')).toBeNull()
    expect(date.warn!('2021-06-20')).toBeNull()
    expect(date.warn!('2021-08-31')).toBeNull()
    expect(date.warn!('2016-09-10')).toMatch(/poza optymalnym/)
    expect(date.warn!('2016-05-30')).toMatch(/poza optymalnym/)
  })

  it('transekt: 2000 m², inaczej ostrzeżenie', () => {
    const t = m.siteFields.find((f) => f.name === 'transect')!
    expect(t.warn!('200x10 m')).toBeNull()
    expect(t.warn!('10x200 m')).toBeNull()
    expect(t.warn!('100x10 m')).toMatch(/1000 m²/)
  })

  it('stanowisko: rzeka, zarządzający, odcinek łożyska i wezbrania', () => {
    const names = m.siteFields.map((f) => f.name)
    for (const n of ['river', 'manager', 'section', 'floods']) expect(names).toContain(n)
  })

  it('kody oddziaływań bez duplikatów, z regulacją, żwirem, obcymi, sukcesją i powodzią', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['C01.01', 'D01.05', 'E03.01', 'G01', 'I01', 'J02.03', 'J02.12', 'K02', 'L08', 'X']) expect(codes).toContain(c)
  })

  it('inne informacje: udział powierzchni FV/U1/U2 przed uwagami', () => {
    expect(m.otherFields.map((f) => f.name)).toEqual(['otherValues', 'conservation', 'shareFV', 'shareU1', 'shareU2', 'notes', 'photos'])
  })
})

describe('metodyka 3220 – progi tab. 2', () => {
  it('powierzchnia kamieńców: >25% FV, 10–25% U1 (obie granice), <10% U2', () => {
    expect([100, 25.5, 25, 10, 9.9, 0].map(gradeAreaShare3220)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })
  it('szerokość: ≥7 m FV (jak w karcie Siwa Woda), 2–7 U1, <2 U2', () => {
    expect([50, 7, 6.9, 2, 1.9, 0].map(gradeWidth3220)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })
  it('pokrycie roślinnością zielną: <30 FV, 30–60 U1 (obie granice), >60 U2', () => {
    expect([0, 29.9, 30, 60, 60.1, 100].map(gradeHerbCover3220)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })
  it('wysokość warstwy zielnej: <30 cm FV, 30–50 U1 (obie granice), >50 U2', () => {
    expect([5, 29.9, 30, 50, 50.1, 100].map(gradeHerbHeight3220)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })
  it('kompleks siedlisk: ≥3 dobrze wykształcone FV; ≥2 typy U1; 0–1 typ U2', () => {
    expect(gradeComplex3220(4, 4)).toBe('FV')
    expect(gradeComplex3220(3, 3)).toBe('FV')
    expect(gradeComplex3220(3, 2)).toBe('U1')
    expect(gradeComplex3220(2, 1)).toBe('U1')
    expect(gradeComplex3220(2, 0)).toBe('U1') // luka w tab. 2 – „inne kombinacje”
    expect(gradeComplex3220(1, 1)).toBe('U2')
    expect(gradeComplex3220(0, 0)).toBe('U2')
  })
})

describe('metodyka 3220 – podpowiedzi z pól', () => {
  it('powierzchnia: z procentu, ze zmiany, gorsza z dwóch; „brak danych” bez procentu → XX', () => {
    expect(suggest('area', { share: 50 })).toBe('FV')
    expect(suggest('area', { share: 20 })).toBe('U1')
    expect(suggest('area', { share: 50, choice: 'clearDecrease' })).toBe('U2')
    expect(suggest('area', { share: 5, choice: 'stable' })).toBe('U2')
    expect(suggest('area', { share: 40, choice: 'unknown' })).toBe('FV')
    expect(suggest('area', { choice: 'unknown' })).toBe('XX')
    expect(suggest('area', { choice: 'other' })).toBe('U1')
    expect(suggest('area', {})).toBeNull()
    expect(explain('area', { share: 25 })).toBe('25% transektu = 5 a → U1.')
    expect(describeOf('area', { share: 50, areaHa: 0.25, choice: 'stable' })).toBe('kamieńce 50% transektu; 0,25 ha; nie podlega zmianom lub zwiększa się')
  })

  it('szerokość: suma a+b, sam brzeg a, porównanie z łożyskiem', () => {
    expect(suggest('width', { widthA: 1.5, widthB: 5.5 })).toBe('FV')
    expect(suggest('width', { widthA: 3 })).toBe('U1')
    expect(suggest('width', { widthA: 0.5, widthB: 1 })).toBe('U2')
    expect(suggest('width', {})).toBeNull()
    expect(explain('width', { widthA: 1.5, widthB: 5.5, bedWidth: 20 })).toBe('Szerokość kamieńców: 1,5 + 5,5 = 7 m. Kamieńce to 35% szerokości łożyska.')
    expect(warn('width', { widthA: 10, widthB: 15, bedWidth: 20 })).toMatch(/szersze niż całe łożysko/)
    expect(describeOf('width', { widthA: 2, widthB: 6, bedWidth: 15 })).toBe('2 m + 6 m = 8 m; łożysko 15 m')
  })

  it('pokrycie roślinnością zielną: z procentu', () => {
    expect(suggest('herbCover', { value: 7.5 })).toBe('FV')
    expect(suggest('herbCover', { value: 100 })).toBe('U2')
    expect(describeOf('herbCover', { value: 15 })).toBe('15%')
  })

  it('wysokość: średnia z pomiarów, średnia wprost ma pierwszeństwo, ostrzeżenia', () => {
    expect(parseMeasurements('12 15; 8,5 20')).toEqual([12, 15, 8.5, 20])
    const twenty = Array.from({ length: 20 }, (_, k) => (k % 2 ? 40 : 30)).join(' ')
    expect(suggest('herbHeight', { measurements: twenty })).toBe('U1')
    expect(explain('herbHeight', { measurements: twenty })).toBe('Średnia z 20 pomiarów: 35 cm.')
    expect(warn('herbHeight', { measurements: twenty })).toBeNull()
    expect(suggest('herbHeight', { measurements: twenty, mean: 12.5 })).toBe('FV')
    expect(warn('herbHeight', { measurements: '10 20 30' })).toMatch(/Pomiarów: 3 – metodyka przewiduje 20/)
    expect(warn('herbHeight', { mean: 30, max: 20 })).toMatch(/Maksimum \(20 cm\) mniejsze niż średnia/)
    expect(suggest('herbHeight', {})).toBeNull()
    expect(describeOf('herbHeight', { mean: 12.5, max: 60 })).toBe('średnio 12,5 cm, max. 60 cm')
  })

  it('gatunki ekspansywne: z wyboru; ostrzeżenia o liście', () => {
    expect(['none', 'scattered', 'mass'].map((choice) => suggest('expansive', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(suggest('expansive', { species: sp('Phalaris arundinacea') })).toBeNull()
    expect(warn('expansive', { choice: 'scattered', species: sp('Phalaris arundinacea', 'Arabis alpina') })).toMatch(/Spoza grupy ekspansywnych w katalogu: Arabis alpina/)
    expect(warn('expansive', { choice: 'none', species: [{ name: 'Phalaris arundinacea', cover: 10 }] })).toMatch(/przekracza 5%/)
    expect(warn('expansive', { choice: 'scattered', species: sp('Calamagrostis pseudophragmites', 'Petasites kablikianus') })).toBeNull()
    expect(explain('expansive', { species: [{ name: 'Phalaris arundinacea', cover: 3 }, { name: 'Artemisia vulgaris', cover: 0.5 }] })).toBe('Łączne pokrycie z listy: 3,5%.')
    expect(describeOf('expansive', { choice: 'none', species: [] })).toBe('Brak lub pojedyncze osobniki')
  })

  it('obce: wybór ma pierwszeństwo, inaczej z listy (synonimy raz, nieinwazyjne się nie liczą)', () => {
    expect(['none', 'scattered', 'mass'].map((choice) => suggest('aliens', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(suggest('aliens', { species: sp('Impatiens glandulifera') })).toBe('U1')
    expect(suggest('aliens', { species: sp('Viola arvensis') })).toBe('FV')
    expect(suggest('aliens', { species: sp('Impatiens glandulifera'), choice: 'mass' })).toBe('U2')
    expect(suggest('aliens', {})).toBeNull()
    expect(explain('aliens', { species: sp('Fallopia japonica', 'Reynoutria japonica', 'Robinia pseudoacacia') })).toBe('Gatunków inwazyjnych na liście: 2.')
    expect(warn('aliens', { species: sp('Impatiens glandulifera', 'Erigeron annuus') })).toMatch(/2 gatunki inwazyjne/)
    expect(warn('aliens', { species: sp('Viola arvensis') })).toMatch(/Nie liczą się .*Viola arvensis/)
    expect(warn('aliens', { choice: 'none', species: sp('Impatiens parviflora') })).toMatch(/Wybrano „Brak”/)
  })

  it('gatunki krzewów: z listy (najgorszy gatunek), wybór ma pierwszeństwo z ostrzeżeniem, brak krzewów → FV', () => {
    expect(suggest('shrubSpecies', { species: sp('Salix eleagnos', 'Myricaria germanica', 'Alnus incana') })).toBe('FV')
    expect(suggest('shrubSpecies', { species: sp('Salix eleagnos', 'Salix purpurea') })).toBe('U1')
    expect(suggest('shrubSpecies', { species: sp('Salix eleagnos', 'Populus balsamifera') })).toBe('U2')
    expect(suggest('shrubSpecies', { species: sp('Salix purpurea'), choice: 'native' })).toBe('FV')
    expect(warn('shrubSpecies', { species: sp('Salix purpurea'), choice: 'native' })).toMatch(/Wybrano FV, a wg listy wychodzi U1 \(Salix purpurea\)/)
    expect(explain('shrubSpecies', { species: sp('Salix fragilis', 'Salix purpurea', 'Salix eleagnos') })).toBe('Wg listy: U1 (decyduje: Salix fragilis, Salix purpurea).')
    expect(suggest('shrubSpecies', { absent: 'yes' })).toBe('FV')
    expect(suggest('shrubSpecies', {})).toBeNull()
    expect(warn('shrubSpecies', { species: sp('Arabis alpina') })).toMatch(/Nierozpoznane jako drzewo\/krzew: Arabis alpina/)
    expect(describeOf('shrubSpecies', { absent: 'yes', species: [] })).toBe('nie stwierdzono')
  })

  it('zwarcie krzewów i drzewa >1,5 m: z wyboru; opis z procentem', () => {
    expect(['young', 'clumps', 'mass'].map((choice) => suggest('shrubCover', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(warn('shrubCover', { choice: 'young', value: 12 })).toMatch(/dokładnością do 5%/)
    expect(describeOf('shrubCover', { choice: 'clumps', value: 30 })).toBe('30%; Kępy lub rozproszone pojedyncze osobniki na całej przestrzeni')
    expect(['none', 'scattered', 'mass'].map((choice) => suggest('trees', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(describeOf('trees', { choice: 'none', species: [{ name: 'Picea abies', cover: 0.5 }], total: 0.5 })).toBe('Picea abies <1%; łącznie <1%')
    expect(warn('trees', { choice: 'none', species: sp('Tussilago farfara') })).toMatch(/To nie drzewa ani krzewy: Tussilago farfara/)
  })

  it('kompleks siedlisk: wszystkie cztery pola, inaczej brak podpowiedzi', () => {
    const all = (h3220: string, h3230: string, h3240: string, h91E0: string) => ({ h3220, h3230, h3240, h91E0 })
    expect(suggest('complex', all('good', 'good', 'good', 'remnant'))).toBe('FV')
    expect(suggest('complex', all('good', 'absent', 'good', 'remnant'))).toBe('U1')
    expect(suggest('complex', all('good', 'absent', 'absent', 'absent'))).toBe('U2')
    expect(suggest('complex', all('remnant', 'remnant', 'absent', 'absent'))).toBe('U1')
    expect(suggest('complex', { h3220: 'good', h3240: 'good' })).toBeNull()
    expect(explain('complex', all('good', 'absent', 'good', 'remnant'))).toBe('Obecne typy: 3, dobrze wykształcone: 2.')
    expect(describeOf('complex', all('good', 'absent', 'good', 'remnant'))).toBe('3220 – dobrze wykształcone; 3240 – dobrze wykształcone; 91E0 – szczątkowo')
  })

  it('katalog: gatunki typowe z przewodnika, synonimy, grupy, warstwy', () => {
    const latin = SPECIES_3220.map((s) => s.latin)
    expect(new Set(latin).size).toBe(latin.length)
    for (const n of ['Calamagrostis pseudophragmites', 'Chamaenerion palustre', 'Myricaria germanica', 'Salix eleagnos', 'Festuca rubra', 'Reseda lutea', 'Equisetum variegatum', 'Galeopsis angustifolia', 'Galeopsis ladanum', 'Leontodon hispidus', 'Linaria vulgaris', 'Chaenorhinum minus', 'Poa granitica', 'Rumex scutatus', 'Silene vulgaris', 'Tussilago farfara'])
      expect(findSpecies3220(n), n).toBeDefined()
    expect(speciesKey3220('Fallopia japonica')).toBe(speciesKey3220('Reynoutria japonica'))
    expect(speciesKey3220('Epilobium adenocaulon')).toBe(speciesKey3220('Epilobium ciliatum'))
    expect(isInvasive3220('Robinia pseudoacacia')).toBe(true)
    expect(isInvasive3220('Viola arvensis')).toBe(false)
    expect(isExpansive3220('Calamagrostis pseudophragmites')).toBe(true)
    for (const s of SPECIES_3220.filter((x) => x.same)) expect(findSpecies3220(s.same!), s.latin).toBeDefined()
    expect(defaultLayer3220(findSpecies3220('Salix eleagnos')!)).toBe('B')
    expect(defaultLayer3220(findSpecies3220('Tussilago farfara')!)).toBe('C')
    expect(m.speciesInfo!('Calamagrostis pseudophragmites')).toMatch(/masowym występowaniu – ekspansywny/)
    expect(m.speciesInfo!('Salix purpurea')).toMatch(/U1/)
  })
})

describe('ocena struktury (tab. 2)', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(siwaWoda)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    v.prospects.grade = 'FV'
    return v
  }
  it('wszystko FV → FV; niekardynalny U2 (szerokość) → struktura U1', () => {
    const v = allFv()
    expect(assessCard(m, v)).toMatchObject({ area: 'FV', structure: 'FV', overall: 'FV' })
    v.indicators.width.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
  })
  it('kardynalny U1 (kompleks) → U1; kardynalny U2 (obce) → U2', () => {
    const v = allFv()
    v.indicators.complex.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.aliens.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U2')
  })
})

describe('przykład Siwa Woda (karta z przewodnika, 2010)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(siwaWoda)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('wskaźniki jak w karcie: wszystkie FV poza kompleksem siedlisk (U1)', () => {
    const grades = Object.fromEntries(Object.entries(siwaWoda.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({
      area: 'FV',
      width: 'FV',
      herbCover: 'FV',
      herbHeight: 'FV',
      expansive: 'FV',
      aliens: 'FV',
      shrubSpecies: 'FV',
      shrubCover: 'FV',
      trees: 'FV',
      complex: 'U1',
    })
  })

  it('ROZBIEŻNOŚĆ z oryginałem: tab. 2 daje strukturę U1 i ocenę ogólną U1 (karta: FV i FV), bo kompleks to wskaźnik kardynalny', () => {
    expect(assessCard(m, siwaWoda)).toMatchObject({ area: 'FV', structure: 'U1', prospects: 'FV', overall: 'U1', missing: [] })
    expect(String(siwaWoda.other.notes)).toMatch(/ocenia specyficzną strukturę i funkcje oraz stan ogólny na FV/)
  })

  it('podpowiedzi zgodne z ekspertem', () => {
    const c = ctx({ site: siwaWoda.site, indicators: siwaWoda.indicators })
    for (const i of m.indicators) expect(i.suggest!(siwaWoda.indicators[i.id].inputs, c), i.id).toBe(siwaWoda.indicators[i.id].grade)
  })

  it('gatunki krzewów: ekspert FV jak w karcie, formularz ostrzega, że wg tab. 2 wierzba purpurowa to U1', () => {
    expect(warn('shrubSpecies', siwaWoda.indicators.shrubSpecies.inputs)).toMatch(/wg listy wychodzi U1 \(Salix purpurea\)/)
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    const c = ctx({ site: siwaWoda.site, indicators: siwaWoda.indicators })
    for (const i of m.indicators) expect(i.describe!(siwaWoda.indicators[i.id].inputs, c), i.id).toBe(siwaWoda.indicators[i.id].value)
  })

  it('zdjęcia jak w karcie, udział FV 100%, kody przepisane, ekspert zanonimizowany', () => {
    expect(examples3220).toHaveLength(1)
    expect(siwaWoda.releves.map((r) => (r.species as unknown[]).length)).toEqual([34, 34, 30])
    expect(siwaWoda.releves.map((r) => [r.altitude, r.slope, r.exposure, r.coverC])).toEqual([[882, 2, 'N', 5], [888, 0, 'NE', 5], [893, 0.1, 'N', 5]])
    const o = siwaWoda.other
    expect([o.shareFV, o.shareU1, o.shareU2]).toEqual([100, 0, 0])
    expect(siwaWoda.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(siwaWoda)).not.toMatch(/Perzanowska/)
    expect(siwaWoda.impacts.map((i) => `${i.code}${i.influence}${i.intensity}`)).toEqual(['G010M', 'L08+H'])
    // każdy gatunek ze zdjęć jest w katalogu (rozpoznawany przy liczeniu)
    for (const r of siwaWoda.releves) for (const s of r.species as { name: string }[]) expect(findSpecies3220(s.name), s.name).toBeDefined()
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, udział FV/U1/U2 i stare kody w opisach', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, siwaWoda))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['3220 Pionierska roślinność na kamieńcach górskich potoków', 'Obecność kompleksu siedlisk nadrzecznych', 'Udział powierzchni siedliska w stanie FV', 'Siwa Woda', 'L08'])
      expect(text, t).toContain(t)
    expect(text).toMatch(/Kod w karcie z 2010 r.: 941/)
  })
})
