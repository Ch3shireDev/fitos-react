import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { examples5130, poradow } from './examples'
import {
  gradeAliens5130,
  gradeCharacteristic5130,
  gradeCover5130,
  gradeHeight5130,
  gradeShare5130,
  gradeShrubSpecies5130,
  gradeTrees5130,
  indicator5130 as ind,
  methodology5130 as m,
  parseRange5130,
  shrubFacts,
} from './methodology'
import { SPECIES_5130, TYPICAL_GENERA, defaultLayer5130, findSpecies5130, speciesKey5130, typicalGenus } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, ctx())
const warn = (id: string, inputs: InputValues) => ind(id).warn!(inputs, ctx())
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => (cover === undefined ? { name } : { name, cover }))
const FULL = sp(['Juniperus communis', 60], ['Cornus sanguinea', 5], ['Rosa canina', 5], ['Crataegus monogyna', 5], ['Prunus spinosa', 5], ['Rhamnus cathartica', 1])

describe('metodyka 5130 – struktura', () => {
  it('kod 5130 (nie priorytetowe), transekt 200×10 m, 3 zdjęcia po 25 m², zestaw wskaźników z tab. 2', () => {
    expect(habitatCode(m)).toBe('5130')
    expect(m.name).toBe('Zarośla jałowca pospolitego w murawach nawapiennych lub na wrzosowiskach')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('200x10 m')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(m.releves.fields.map((f) => f.name)).toEqual(expect.arrayContaining(['coverA', 'coverB', 'coverC', 'heightA', 'heightB', 'heightC']))
    const empty = emptyCardValues(m)
    expect(empty.releves).toHaveLength(3)
    expect(empty.site.indicatorSet).toBe('tab2')
  })

  it('wskaźniki w kolejności karty przykładowej: powierzchnia + 11 struktury', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Powierzchnia zajęta przez siedlisko na transekcie',
      'Gatunki krzewów',
      'Wysokość krzewów (średnia)',
      'Zwarcie krzewów w płacie',
      'Struktura przestrzenna płatów zarośli',
      'Udział gatunków drzewiastych (powyżej 1,5 m wys.)',
      'Gatunki charakterystyczne murawy kserotermicznej/wrzosowiska',
      'Gatunki ekspansywnych roślin zielnych',
      'Stan zdrowotny jałowców',
      'Odnowienie jałowców (obecność nalotu – do ok. 30 cm wys.)',
      'Obce gatunki inwazyjne',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
  })

  it('kardynalne (lista pod tab. 2): gatunki krzewów, drzewiaste, gatunki charakterystyczne', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['shrubs', 'trees', 'characteristic'])
  })

  it('zestaw tab. 2: stan zdrowotny w karcie, ale nie liczy się (10 wskaźników); zestaw karty 2010 – 11', () => {
    expect(m.indicators.filter((i) => isExcluded(i, { indicatorSet: 'tab2' })).map((i) => i.id)).toEqual(['health'])
    expect(m.indicators.filter((i) => isExcluded(i, {})).map((i) => i.id)).toEqual(['health'])
    expect(m.indicators.filter((i) => isExcluded(i, { indicatorSet: 'card2010' }))).toEqual([])
    expect(m.indicators.filter((i) => i.parameter === 'structure' && !isExcluded(i, { indicatorSet: 'tab2' }))).toHaveLength(10)
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...allOtherFields(m), ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: ostrzeżenie poza czerwcem–lipcem', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2010-06-08')).toBeNull()
    expect(date.warn!('2021-07-31')).toBeNull()
    expect(date.warn!('2021-08-09')).toMatch(/czerwiec–lipiec/)
    expect(date.warn!('2021-05-20')).toMatch(/poza optymalnym/)
  })

  it('transekt: 200×10 m (też 20×100 jak w karcie), inaczej ostrzeżenie', () => {
    const t = m.siteFields.find((f) => f.name === 'transect')!
    expect(t.warn!('200x10 m')).toBeNull()
    expect(t.warn!('20x100 m')).toBeNull()
    expect(t.warn!('100x10 m')).toMatch(/1000 m²/)
  })

  it('kody oddziaływań bez duplikatów, z sukcesją, wypasem, koszeniem, zalesianiem i obcymi', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['K02', 'K02.01', 'A04.03', 'A03.03', 'B01', 'I01', 'G05.01', 'G01.03', 'X']) expect(codes).toContain(c)
  })

  it('inne informacje: propozycje po działaniach, udział FV/U1/U2 przed uwagami', () => {
    expect(m.otherFields.map((f) => f.name)).toEqual(['otherValues', 'conservation', 'proposals', 'shareFV', 'shareU1', 'shareU2', 'notes', 'photos'])
  })
})

describe('metodyka 5130 – progi tab. 2', () => {
  it('liczby i zakresy jak w karcie papierowej', () => {
    expect(parseRange5130('0,8–1')).toEqual({ lo: 0.8, hi: 1, mid: 0.9 })
    expect(parseRange5130('śr. 0,8–1 m')).toEqual({ lo: 0.8, hi: 1, mid: 0.9 })
    expect(parseRange5130('15-20%')).toEqual({ lo: 15, hi: 20, mid: 17.5 })
    expect(parseRange5130('max. 2,5')).toEqual({ lo: 2.5, hi: 2.5, mid: 2.5 })
    expect(parseRange5130(35)).toEqual({ lo: 35, hi: 35, mid: 35 })
    expect(parseRange5130('dużo')).toBeUndefined()
  })

  it('udział na transekcie: >15 FV, 5–15 U1 (obie granice), <5 U2', () => {
    expect([16, 15, 5, 4.9].map(gradeShare5130)).toEqual(['FV', 'U1', 'U1', 'U2'])
  })

  it('wysokość: >0,8 FV, 0,2–0,8 U1 (obie granice), <0,2 U2', () => {
    expect([0.9, 0.8, 0.2, 0.19].map(gradeHeight5130)).toEqual(['FV', 'U1', 'U1', 'U2'])
  })

  it('zwarcie: 20–80 FV (obie granice), 10–20 i 80–90 U1, <10 i >90 U2', () => {
    expect([20, 50, 80, 19, 10, 81, 90, 9, 91, 100].map(gradeCover5130)).toEqual(['FV', 'FV', 'FV', 'U1', 'U1', 'U1', 'U1', 'U2', 'U2', 'U2'])
  })

  it('drzewa: 0 FV, do 20% U1 (20 też), >20 U2', () => {
    expect([0, 0.5, 20, 21].map(gradeTrees5130)).toEqual(['FV', 'U1', 'U1', 'U2'])
  })

  it('gatunki krzewów: pełny zestaw FV; braki, sporadyczny jałowiec, dużo tarniny U1; brak jałowca, masowa tarnina, mezofilne U2', () => {
    const g = (rows: ReturnType<typeof sp>) => gradeShrubSpecies5130(shrubFacts(rows))
    expect(g(FULL)).toBe('FV')
    expect(g(FULL.filter((r) => r.name !== 'Rhamnus cathartica'))).toBe('U1')
    expect(g([...FULL.slice(1), { name: 'Juniperus communis', cover: 2 }])).toBe('U1')
    expect(g([...FULL.filter((r) => r.name !== 'Prunus spinosa'), { name: 'Prunus spinosa', cover: 30 }])).toBe('U1')
    expect(g([...FULL.filter((r) => r.name !== 'Prunus spinosa'), { name: 'Prunus spinosa', cover: 50 }])).toBe('U2')
    expect(g(FULL.slice(1))).toBe('U2')
    expect(g(sp(['Juniperus communis', 3], ['Rosa canina', 1], ['Sambucus nigra', 30]))).toBe('U2')
    // mezofilne przy obfitych typowych – nie U2
    expect(g([...FULL, { name: 'Euonymus europaeus', cover: 5 }])).toBe('FV')
  })

  it('pełny zestaw liczony po rodzaju: dowolna róża i głóg, też spoza katalogu', () => {
    expect(typicalGenus('Rosa ×dumalis')).toBe('róża')
    expect(typicalGenus('Crataegus sp.')).toBe('głóg')
    expect(typicalGenus('Juniperus communis')).toBe('jałowiec')
    expect(typicalGenus('Berberis vulgaris')).toBeUndefined()
    const f = shrubFacts(sp(['Juniperus communis', 60], ['Cornus sanguinea', 5], ['Rosa rubiginosa', 5], ['Crataegus sp.', 5], ['Prunus spinosa', 5], ['Rhamnus cathartica', 1]))
    expect([...f.genera].sort()).toEqual([...TYPICAL_GENERA].sort())
  })

  it('gatunki charakterystyczne: ≥3 FV, 1–2 U1, 0 U2', () => {
    expect([5, 3, 2, 1, 0].map(gradeCharacteristic5130)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('obce: 0 FV; 1 gatunek pojedynczo lub w kępach U1; >1 gatunek albo masowo U2', () => {
    expect(gradeAliens5130(0, '')).toBe('FV')
    expect(gradeAliens5130(1, 'single')).toBe('U1')
    expect(gradeAliens5130(1, 'clumps')).toBe('U1')
    expect(gradeAliens5130(1, 'massive')).toBe('U2')
    expect(gradeAliens5130(2, 'single')).toBe('U2')
  })
})

describe('metodyka 5130 – podpowiedzi z pól', () => {
  it('powierzchnia: z wyboru; udział na transekcie jako wskazówka w wyjaśnieniu', () => {
    expect(suggest('area', { choice: 'stable' })).toBe('FV')
    expect(suggest('area', { choice: 'unknown' })).toBe('XX')
    expect(suggest('area', {})).toBeNull()
    expect(ind('area').explain!({}, ctx({ indicators: { share: { inputs: { value: '30–40' }, value: '', grade: '' } } }))).toMatch(/35% transektu.*FV/)
  })

  it('gatunki krzewów: wybór eksperta ma pierwszeństwo, wyjaśnienie wymienia brakujące rodzaje, ostrzeżenia', () => {
    expect(suggest('shrubs', { species: FULL })).toBe('FV')
    expect(suggest('shrubs', { species: FULL, choice: 'u1' })).toBe('U1')
    expect(ind('shrubs').explain!({ species: poradow.indicators.shrubs.inputs.species }, ctx())).toMatch(/brakuje: głóg, szakłak.*U1/)
    expect(warn('shrubs', { species: FULL, choice: 'u2' })).toMatch(/Wybrano U2, a z listy wychodzi FV/)
    expect(warn('shrubs', { species: sp(['Prunus spinosa', 50], ['Inula ensifolia', 5]) })).toMatch(/To nie krzewy: Inula ensifolia.*nie ma jałowca/)
    expect(warn('shrubs', { species: FULL })).toBeNull()
  })

  it('wysokość i zwarcie: z liczby albo środka zakresu, ostrzeżenie przy bzdurze i centymetrach', () => {
    expect(suggest('height', { height: '0,8–1' })).toBe('FV')
    expect(suggest('height', { height: '0,8' })).toBe('U1')
    expect(warn('height', { height: '80' })).toMatch(/centymetrach/)
    expect(warn('height', { height: 'wysokie' })).toMatch(/Nie rozumiem/)
    expect(suggest('cover', { value: '15–20' })).toBe('U1')
    expect(suggest('cover', { value: '90–100' })).toBe('U2')
    expect(ind('cover').describe!({ value: '15-20' }, ctx())).toBe('15–20%')
  })

  it('struktura, odnowienie, zdrowie: z wyboru', () => {
    expect(suggest('structure', { choice: 'compact' })).toBe('FV')
    expect(suggest('structure', { choice: 'patches' })).toBe('FV')
    expect(suggest('structure', { choice: 'clumps' })).toBe('U1')
    expect(suggest('structure', { choice: 'none' })).toBe('U2')
    expect(suggest('regeneration', { choice: 'rare' })).toBe('U1')
    expect(suggest('health', { choice: 'bad' })).toBe('U2')
    expect(suggest('health', {})).toBeNull()
  })

  it('drzewiaste: klasa > zwarcie wprost > suma z listy; „nie stwierdzono” = FV; ostrzeżenia', () => {
    expect(suggest('trees', { choice: 'none', species: sp(['Pinus sylvestris', 30]) })).toBe('FV')
    expect(suggest('trees', { cover: 25, species: sp(['Pinus sylvestris', 5]) })).toBe('U2')
    expect(suggest('trees', { species: sp(['Pinus sylvestris', 15], ['Picea abies', 10]) })).toBe('U2')
    expect(suggest('trees', { species: sp(['Pinus sylvestris', 0.5]) })).toBe('U1')
    expect(suggest('trees', { none: 'yes', species: [] })).toBe('FV')
    expect(suggest('trees', {})).toBeNull()
    expect(warn('trees', { none: 'yes', species: sp(['Pinus sylvestris', 10]) })).toMatch(/brak\/pojedyncze/)
    expect(warn('trees', { species: sp(['Pinus nigra', 5]) })).toMatch(/Obce drzewa.*Pinus nigra/)
  })

  it('gatunki charakterystyczne: liczba wprost > lista (synonimy raz), wybór eksperta, ostrzeżenie o murawie napiaskowej', () => {
    expect(suggest('characteristic', { species: sp(['Inula ensifolia'], ['Carex humilis'], ['Aster amellus']) })).toBe('FV')
    expect(suggest('characteristic', { species: sp(['Inula ensifolia'], ['Inula ensifolia'], ['Plantago lanceolata']) })).toBe('U1')
    expect(suggest('characteristic', { species: sp(['Plantago lanceolata']) })).toBe('U2')
    expect(suggest('characteristic', { species: sp(['Inula ensifolia']), count: 25 })).toBe('FV')
    expect(suggest('characteristic', { species: sp(['Brachypodium pinnatum', 70], ['Inula ensifolia', 1], ['Carex humilis', 1]), choice: 'u1' })).toBe('U1')
    // wrzosowiska też się liczą
    expect(suggest('characteristic', { species: sp(['Calluna vulgaris', 30], ['Vaccinium myrtillus', 10], ['Nardus stricta', 10]) })).toBe('FV')
    expect(warn('characteristic', { species: sp(['Koeleria glauca'], ['Corynephorus canescens']) })).toMatch(/napiaskowych \(6120\).*nie 5130/)
    expect(warn('characteristic', { species: sp(['Plantago lanceolata'], ['Inula ensifolia']) })).toMatch(/Nie liczą się.*Plantago lanceolata/)
    // dominacja 1–2 gatunków przy liczbie ≥3 to świadomy wybór U1 – bez ostrzeżenia
    expect(warn('characteristic', { species: sp(['Inula ensifolia'], ['Carex humilis'], ['Aster amellus']), choice: 'u1' })).toBeNull()
    expect(warn('characteristic', { species: sp(['Inula ensifolia']), choice: 'fv' })).toMatch(/Wybrano FV/)
  })

  it('ekspansywne: ocena z wyboru, „nie stwierdzono” = FV, ostrzeżenia', () => {
    expect(suggest('expansive', { none: 'yes', species: [] })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Calamagrostis epigejos', 30]) })).toBeNull()
    expect(suggest('expansive', { species: sp(['Calamagrostis epigejos', 30]), choice: 'u2' })).toBe('U2')
    expect(warn('expansive', { none: 'yes', species: sp(['Rubus caesius']) })).toMatch(/Nie stwierdzono/)
    expect(warn('expansive', { species: sp(['Solidago gigantea']) })).toMatch(/Obce gatunki inwazyjne/)
    expect(ind('expansive').describe!({ none: 'yes', species: [] }, ctx())).toBe('Brak')
  })

  it('obce: liczba gatunków (synonimy raz), liczebność z pola albo z pokrycia', () => {
    expect(suggest('aliens', { none: 'yes', species: [] })).toBe('FV')
    expect(suggest('aliens', { species: sp(['Robinia pseudoacacia', 0.5]) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Robinia pseudoacacia', 10]) })).toBe('U2')
    expect(suggest('aliens', { species: sp(['Robinia pseudoacacia', 15]), abundance: 'clumps' })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Conyza canadensis', 0.5], ['Erigeron canadensis', 0.5]) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Prunus serotina', 0.5], ['Quercus rubra', 0.5]) })).toBe('U2')
    expect(suggest('aliens', { count: 0 })).toBe('FV')
    expect(warn('aliens', { species: sp(['Juniperus communis']) })).toMatch(/rodzime/)
  })

  it('katalog: krzewy i drzewa w B, runo w C, mchy w D, synonimy, bez duplikatów', () => {
    const latin = SPECIES_5130.map((s) => s.latin)
    expect(new Set(latin).size).toBe(latin.length)
    expect(speciesKey5130('Cerasus avium')).toBe(speciesKey5130('Prunus avium'))
    expect(speciesKey5130('Padus serotina')).toBe(speciesKey5130('Prunus serotina'))
    expect(defaultLayer5130(findSpecies5130('Juniperus communis')!)).toBe('B')
    expect(defaultLayer5130(findSpecies5130('Pinus sylvestris')!)).toBe('B')
    expect(defaultLayer5130(findSpecies5130('Inula ensifolia')!)).toBe('C')
    expect(defaultLayer5130(findSpecies5130('Pohlia nutans')!)).toBe('D')
    expect(m.speciesInfo!('Robinia pseudoacacia')).toBe('gatunek obcy inwazyjny')
    expect(m.speciesInfo!('Juniperus communis')).toBe('jałowiec – gatunek budujący siedlisko 5130')
    expect(m.speciesInfo!('Koeleria glauca')).toBe('gatunek muraw napiaskowych (6120) – nie 5130')
  })
})

describe('ocena struktury (reguła ogólna, bez structureRule)', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(poradow)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    v.prospects.grade = 'FV'
    return v
  }

  it('silnik bez zmian: 5130 nie ma własnej reguły struktury', () => {
    expect(m.structureRule).toBeUndefined()
  })

  it('wszystko FV → FV; niekardynalny U2 (obce) → struktura U1', () => {
    const v = allFv()
    expect(assessCard(m, v)).toMatchObject({ structure: 'FV', overall: 'FV' })
    v.indicators.aliens.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
  })

  it('kardynalny U1 (krzewy) → U1; kardynalny U2 (drzewa) → U2', () => {
    const v = allFv()
    v.indicators.shrubs.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.trees.grade = 'U2'
    expect(assessCard(m, v)).toMatchObject({ structure: 'U2', overall: 'U2' })
  })

  it('stan zdrowotny liczy się tylko w zestawie karty 2010', () => {
    const v = allFv()
    v.indicators.health.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
    v.site.indicatorSet = 'tab2'
    expect(assessCard(m, v).structure).toBe('FV')
    v.indicators.health.grade = ''
    expect(assessCard(m, v).missing).toEqual([])
  })
})

describe('przykład Poradów (karta z przewodnika, 2010)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(poradow)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie', () => {
    const grades = Object.fromEntries(Object.entries(poradow.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({
      area: 'FV',
      share: 'FV',
      shrubs: 'U1',
      height: 'FV',
      cover: 'U1',
      structure: 'U1',
      trees: 'U1',
      characteristic: 'FV',
      expansive: 'FV',
      health: 'U1',
      regeneration: 'FV',
      aliens: 'FV',
    })
  })

  it('parametry i ocena ogólna jak w karcie: powierzchnia FV, struktura U1, perspektywy U1, ogólna U1', () => {
    expect(assessCard(m, poradow)).toMatchObject({ area: 'FV', structure: 'U1', prospects: 'U1', overall: 'U1', missing: [] })
    // w zestawie tab. 2 (bez stanu zdrowotnego) wynik ten sam
    expect(assessCard(m, { ...poradow, site: { ...poradow.site, indicatorSet: 'tab2' } })).toMatchObject({ structure: 'U1', overall: 'U1' })
  })

  it('podpowiedzi zgodne z ekspertem – poza odnowieniem („słabe, ale obecne”: karta FV, tab. 2 U1)', () => {
    const c = ctx({ site: poradow.site, indicators: poradow.indicators })
    for (const i of m.indicators) {
      const s = i.suggest!(poradow.indicators[i.id].inputs, c)
      if (i.id === 'regeneration') expect(s).toBe('U1')
      else expect(s, i.id).toBe(poradow.indicators[i.id].grade)
    }
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    const c = ctx({ site: poradow.site, indicators: poradow.indicators })
    for (const i of m.indicators) expect(i.describe!(poradow.indicators[i.id].inputs, c), i.id).toBe(poradow.indicators[i.id].value)
  })

  it('bez ostrzeżeń przy wskaźnikach i stanowisku (transekt 20×100 = 2000 m², czerwiec)', () => {
    const c = ctx({ site: poradow.site, indicators: poradow.indicators })
    for (const i of m.indicators) expect(i.warn?.(poradow.indicators[i.id].inputs, c) ?? null, i.id).toBeNull()
    for (const f of m.siteFields) expect(f.warn?.(poradow.site[f.name]) ?? null, f.name).toBeNull()
  })

  it('zdjęcia jak w karcie, udział FV/U1/U2 = 100%, ekspert zanonimizowany, stary kod przemapowany', () => {
    expect(examples5130).toHaveLength(1)
    expect(poradow.releves.map((r) => (r.species as unknown[]).length)).toEqual([42, 37, 48])
    expect(poradow.releves.map((r) => [r.coverA, r.coverB, r.coverC, r.heightA, r.heightB, r.heightC])).toEqual([
      [undefined, 20, 80, undefined, 0.7, 30],
      [1, 25, 90, 3, 0.7, 35],
      [undefined, 30, 85, undefined, 0.8, 20],
    ])
    expect(poradow.releves.map((r) => [r.slope, r.exposure, r.altitude])).toEqual([[40, 'SW', 299], [50, 'W', 301], [45, 'W', 305]])
    const names = poradow.releves.flatMap((r) => (r.species as { name: string }[]).map((s) => s.name))
    for (const n of names) expect(findSpecies5130(n), n).toBeTruthy()
    const o = poradow.other
    expect(Number(o.shareFV) + Number(o.shareU1) + Number(o.shareU2)).toBe(100)
    expect(poradow.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(poradow)).not.toMatch(/Perzanowska/)
    expect(poradow.impacts.map((i) => `${i.code}${i.influence}${i.intensity}`)).toEqual(['K02-M'])
    expect(poradow.threats.map((t) => t.code)).toEqual(['K02'])
    for (const t of [...poradow.impacts, ...poradow.threats]) expect(m.impactCodes.find((c) => c.code === t.code)?.name, t.code).toBe(t.name)
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, udział FV/U1/U2 i stary kod w opisie', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, poradow))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['5130 Zarośla jałowca pospolitego w murawach nawapiennych lub na wrzosowiskach', 'Udział gatunków drzewiastych', 'Udział powierzchni siedliska w stanie FV', 'Poradów', 'Inuletum ensifoliae'])
      expect(text, t).toContain(t)
    expect(text).toMatch(/Kod w karcie z 2010 r.: 950/)
  })
})
