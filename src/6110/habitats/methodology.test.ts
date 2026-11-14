import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { examples6110, wapniarka } from './examples'
import {
  gradeAliens6110,
  gradeCharacteristic6110,
  gradeDamage6110,
  gradeDominants6110,
  gradeExpansive6110,
  gradeShade6110,
  gradeShare6110,
  gradeShrubs6110,
  indicator6110 as ind,
  methodology6110 as m,
  parseRange6110,
} from './methodology'
import { SPECIES_6110, defaultLayer6110, findSpecies6110, speciesKey6110 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, ctx())
const warn = (id: string, inputs: InputValues) => ind(id).warn!(inputs, ctx())
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => (cover === undefined ? { name } : { name, cover }))

describe('metodyka 6110 – struktura', () => {
  it('kod 6110 (nie priorytetowe), bez domyślnego transektu, 3 zdjęcia bez narzuconej powierzchni, zestaw z modyfikacji 2015', () => {
    expect(habitatCode(m)).toBe('6110')
    expect(m.name).toBe('Skały wapienne i neutrofilne z roślinnością pionierską (Alysso-Sedion)')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBeUndefined()
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBeUndefined()
    expect(m.releves.fields.map((f) => f.name)).toEqual(expect.arrayContaining(['coverC', 'coverD', 'heightC', 'heightD', 'remarks']))
    const empty = emptyCardValues(m)
    expect(empty.releves).toHaveLength(3)
    expect(empty.site.indicatorSet).toBe('mod2015')
  })

  it('wskaźniki w kolejności karty przykładowej: powierzchnia + 9 struktury', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Udział procentowy siedliska na transekcie',
      'Gatunki charakterystyczne',
      'Gatunki dominujące',
      'Obce gatunki inwazyjne',
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Struktura przestrzenna płatów siedliska',
      'Ekspansja krzewów i podrostu drzew',
      'Ocienienie muraw',
      'Zniszczenia mechaniczne',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
  })

  it('kardynalne (lista pod tab. 2): ocienienie, ekspansja drzew i krzewów, ekspansywne, dominujące, charakterystyczne', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id).sort()).toEqual(['characteristic', 'dominant', 'expansive', 'shade', 'shrubs'])
  })

  it('zestaw z modyfikacji 2015: ocienienie w karcie, ale nie liczy się (8 wskaźników); zestaw przewodnika 2010 – 9', () => {
    expect(m.indicators.filter((i) => isExcluded(i, { indicatorSet: 'mod2015' })).map((i) => i.id)).toEqual(['shade'])
    expect(m.indicators.filter((i) => isExcluded(i, {})).map((i) => i.id)).toEqual(['shade'])
    expect(m.indicators.filter((i) => isExcluded(i, { indicatorSet: 'guide2010' }))).toEqual([])
    expect(m.indicators.filter((i) => i.parameter === 'structure' && !isExcluded(i, { indicatorSet: 'mod2015' }))).toHaveLength(8)
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...allOtherFields(m), ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: ostrzeżenie poza majem–lipcem (też dla drugiej kontroli)', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    const date2 = m.siteFields.find((f) => f.name === 'date2')!
    expect(date.warn!('2024-05-28')).toBeNull()
    expect(date.warn!('2024-07-30')).toBeNull()
    expect(date.warn!('2008-08-28')).toMatch(/maj–lipiec/)
    expect(date.warn!('2024-04-20')).toMatch(/poza optymalnym/)
    expect(date2.warn!('2024-07-15')).toBeNull()
    expect(date2.warn!('2018-08-09')).toMatch(/maj–lipiec/)
  })

  it('kody oddziaływań bez duplikatów, z kamieniołomami, sukcesją, wydeptywaniem, muflonami i obcymi', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['C01', 'K02', 'K02.01', 'G05.01', 'G01.02', 'G01.04', 'K04.05', 'I01', 'M01.02', 'X']) expect(codes).toContain(c)
  })

  it('inne informacje: propozycje po zabiegach, uwagi, zdjęcia', () => {
    expect(m.otherFields.map((f) => f.name)).toEqual(['otherValues', 'conservation', 'proposals', 'notes', 'photos'])
  })
})

describe('metodyka 6110 – progi tab. 2', () => {
  it('liczby i zakresy jak w karcie papierowej', () => {
    expect(parseRange6110('80')).toEqual({ lo: 80, hi: 80, mid: 80 })
    expect(parseRange6110('70–80')).toEqual({ lo: 70, hi: 80, mid: 75 })
    expect(parseRange6110('ok. 10%')).toMatchObject({ mid: 10 })
    expect(parseRange6110('2,5')).toMatchObject({ mid: 2.5 })
    expect(parseRange6110('dużo')).toBeUndefined()
  })

  it('udział na transekcie: 100–70 FV (70 też), 70–40 U1 (40 też), <40 U2', () => {
    expect([100, 70, 69, 40, 39, 0].map(gradeShare6110)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('gatunki charakterystyczne: ≥4 FV, 2–3 U1, 0–1 U2', () => {
    expect([16, 4, 3, 2, 1, 0].map(gradeCharacteristic6110)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('obce: brak FV, do 2% U1 (2 też), >2% U2; bez pokrycia – brak podpowiedzi', () => {
    expect(gradeAliens6110(0, 0)).toBe('FV')
    expect(gradeAliens6110(1, 0.5)).toBe('U1')
    expect(gradeAliens6110(1, 2)).toBe('U1')
    expect(gradeAliens6110(2, 2.5)).toBe('U2')
    expect(gradeAliens6110(1, undefined)).toBeNull()
  })

  it('ekspansywne: brak FV, do 5% U1 (5 też), >5% U2', () => {
    expect(gradeExpansive6110(0, 0)).toBe('FV')
    expect(gradeExpansive6110(1, 2)).toBe('U1')
    expect(gradeExpansive6110(2, 5)).toBe('U1')
    expect(gradeExpansive6110(1, 20)).toBe('U2')
  })

  it('ekspansja krzewów: 0 FV, do 30% U1 (30 też), >30% U2', () => {
    expect([0, 0.5, 2, 30, 31, 90].map(gradeShrubs6110)).toEqual(['FV', 'U1', 'U1', 'U1', 'U2', 'U2'])
  })

  it('ocienienie: do 10% FV (słabe), do 20% U1 (20 też), >20% U2', () => {
    expect([0, 2, 10, 11, 20, 21, 80].map(gradeShade6110)).toEqual(['FV', 'FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('zniszczenia antropogeniczne: do 20% U1 (luka 10–20 też), >20% U2', () => {
    expect([0, 5, 10, 15, 20, 21].map(gradeDamage6110)).toEqual(['FV', 'U1', 'U1', 'U1', 'U1', 'U2'])
  })

  it('dominujące: wszystkie zgodne z tab. 1 FV, część U1, żaden U2', () => {
    expect(gradeDominants6110(['Jovibarba sobolifera', 'Poa compressa'])).toBe('FV')
    expect(gradeDominants6110(['Poa compressa', 'Festuca ovina', 'Ceratodon purpureus'])).toBe('FV')
    expect(gradeDominants6110(['Poa compressa', 'Fragaria vesca'])).toBe('U1')
    expect(gradeDominants6110(['Poa nemoralis'])).toBe('U2')
    expect(gradeDominants6110(['Sanguisorba minor', 'Thymus pulegioides'])).toBe('U2')
    expect(gradeDominants6110([])).toBeNull()
  })
})

describe('metodyka 6110 – podpowiedzi z pól', () => {
  it('udział: z liczby albo środka zakresu; „nie wykonano transektu” = XX; ostrzeżenia', () => {
    expect(suggest('share', { value: '70–80' })).toBe('FV')
    expect(suggest('share', { value: '', notDone: 'yes' })).toBe('XX')
    expect(suggest('share', { value: '50', notDone: 'yes' })).toBe('U1')
    expect(suggest('share', { value: '' })).toBeNull()
    expect(warn('share', { value: 'sporo' })).toMatch(/Nie rozumiem/)
    expect(warn('share', { value: '120' })).toMatch(/100%/)
    expect(ind('share').describe!({ value: '', notDone: 'yes' }, ctx())).toBe('Nie wykonano transektu')
  })

  it('gatunki charakterystyczne: liczba wprost > lista (synonimy raz, typowe nie liczą się), „nie stwierdzono” = U2', () => {
    expect(suggest('characteristic', { count: 5, species: sp(['Poa compressa']) })).toBe('FV')
    expect(suggest('characteristic', { species: sp(['Jovibarba sobolifera'], ['Sempervivum soboliferum'], ['Poa compressa'], ['Sedum acre']) })).toBe('U1')
    expect(suggest('characteristic', { species: sp(['Poa compressa'], ['Sedum acre'], ['Sedum sexangulare'], ['Alyssum alyssoides']) })).toBe('FV')
    expect(suggest('characteristic', { species: sp(['Poa compressa'], ['Sanguisorba minor'], ['Thymus pulegioides'], ['Scabiosa ochroleuca']) })).toBe('U2')
    expect(suggest('characteristic', { none: 'yes', species: [] })).toBe('U2')
    expect(suggest('characteristic', { species: [] })).toBeNull()
    expect(warn('characteristic', { species: sp(['Poa compressa'], ['Festuca ovina'], ['Ceratodon purpureus']) })).toMatch(/Nie liczą się jako charakterystyczne: Festuca ovina, Ceratodon purpureus/)
  })

  it('dominujące: wybór eksperta ma pierwszeństwo; ostrzeżenie przy pokryciu <10% i rozjeździe', () => {
    expect(suggest('dominant', { species: sp(['Poa nemoralis', 30]), choice: 'u1' })).toBe('U1')
    expect(suggest('dominant', { species: sp(['Poa compressa', 30]), choice: '' })).toBe('FV')
    expect(warn('dominant', { species: sp(['Poa compressa', 5]) })).toMatch(/poniżej 10%/)
    expect(warn('dominant', { species: sp(['Poa nemoralis', 20]), choice: 'fv' })).toMatch(/Wybrano FV, a z listy wychodzi U2/)
    expect(ind('dominant').explain!({ species: sp(['Poa compressa', 20], ['Poa nemoralis', 20]) }, ctx())).toMatch(/1 z 2/)
  })

  it('obce i ekspansywne: suma z listy albo łączne pokrycie wprost; „nie stwierdzono” = FV; ostrzeżenia', () => {
    expect(suggest('aliens', { none: 'yes', species: [] })).toBe('FV')
    expect(suggest('aliens', { species: sp(['Erigeron annuus', 0.5]) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Solidago gigantea', 5]) })).toBe('U2')
    expect(suggest('aliens', { species: sp(['Solidago gigantea']), cover: 1 })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Solidago gigantea']) })).toBeNull()
    expect(warn('aliens', { species: sp(['Poa compressa', 1]) })).toMatch(/rodzime/)
    expect(suggest('expansive', { species: sp(['Artemisia vulgaris', 2]) })).toBe('U1')
    expect(suggest('expansive', { species: sp(['Brachypodium pinnatum', 20], ['Calamagrostis epigejos', 5]) })).toBe('U2')
    expect(suggest('expansive', { none: 'yes', species: [] })).toBe('FV')
    expect(warn('expansive', { species: sp(['Betula pendula', 1], ['Sanguisorba minor', 5]) })).toMatch(/Ekspansja krzewów.*Betula pendula.*nie są gatunki ekspansywne: Sanguisorba minor/)
    expect(ind('aliens').describe!({ none: 'yes', species: [] }, ctx())).toBe('Brak')
  })

  it('ekspansja krzewów: zwarcie wprost > suma z listy; „nie stwierdzono” = FV; pojedyncze siewki to wg tab. 2 U1', () => {
    expect(suggest('shrubs', { none: 'yes', species: [] })).toBe('FV')
    expect(suggest('shrubs', { species: sp(['Betula pendula', 1], ['Salix caprea', 1]) })).toBe('U1')
    expect(suggest('shrubs', { species: sp(['Betula pendula', 1]), cover: 40 })).toBe('U2')
    expect(suggest('shrubs', { species: sp(['Betula pendula']) })).toBeNull()
    expect(warn('shrubs', { species: sp(['Poa compressa', 1]) })).toMatch(/To nie drzewa/)
  })

  it('ocienienie: z liczby albo środka zakresu, ostrzeżenie przy bzdurze', () => {
    expect(suggest('shade', { value: '2' })).toBe('FV')
    expect(suggest('shade', { value: '20–30' })).toBe('U2')
    expect(warn('shade', { value: 'cień' })).toMatch(/Nie rozumiem/)
  })

  it('zniszczenia: brak i naturalne = FV, antropogeniczne z procentu, bez procentu – brak podpowiedzi', () => {
    expect(suggest('damage', { kind: 'none' })).toBe('FV')
    expect(suggest('damage', { kind: 'natural' })).toBe('FV')
    expect(suggest('damage', { kind: 'human', cover: 5 })).toBe('U1')
    expect(suggest('damage', { kind: 'human', cover: 15 })).toBe('U1')
    expect(suggest('damage', { kind: 'human', cover: 25 })).toBe('U2')
    expect(suggest('damage', { kind: 'human' })).toBeNull()
    expect(ind('damage').explain!({ kind: 'human', cover: 15 }, ctx())).toMatch(/Luka 10–20%/)
  })

  it('katalog: drzewa i krzewy w B, mchy w D, reszta w C; synonimy; bez duplikatów', () => {
    const names = SPECIES_6110.map((s) => s.latin.toLowerCase())
    expect(new Set(names).size).toBe(names.length)
    expect(defaultLayer6110(findSpecies6110('Betula pendula')!)).toBe('B')
    expect(defaultLayer6110(findSpecies6110('Ceratodon purpureus')!)).toBe('D')
    expect(defaultLayer6110(findSpecies6110('Poa compressa')!)).toBe('C')
    expect(speciesKey6110('Jovibarba sobolifera')).toBe(speciesKey6110('Sempervivum soboliferum'))
    expect(speciesKey6110('Acinos arvensis')).toBe(speciesKey6110('Clinopodium acinos'))
    expect(m.speciesInfo!('Poa compressa')).toMatch(/charakterystyczny/)
  })
})

describe('ocena struktury (reguła ogólna, bez structureRule)', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(wapniarka)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    v.prospects.grade = 'FV'
    return v
  }

  it('silnik bez zmian: 6110 nie ma własnej reguły struktury', () => {
    expect(m.structureRule).toBeUndefined()
  })

  it('wszystko FV → FV; niekardynalny U2 (obce) → struktura U1; XX w udziale (niekardynalny) nie obniża', () => {
    const v = allFv()
    expect(assessCard(m, v)).toMatchObject({ structure: 'FV', overall: 'FV' })
    v.indicators.aliens.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
    const w = allFv()
    w.indicators.share.grade = 'XX'
    expect(assessCard(m, w).structure).toBe('FV')
  })

  it('kardynalny U1 (ekspansywne) → U1; kardynalny U2 (dominujące) → U2', () => {
    const v = allFv()
    v.indicators.expansive.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.dominant.grade = 'U2'
    expect(assessCard(m, v)).toMatchObject({ structure: 'U2', overall: 'U2' })
  })

  it('ocienienie liczy się tylko w zestawie przewodnika 2010', () => {
    const v = allFv()
    v.indicators.shade.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U2')
    v.site.indicatorSet = 'mod2015'
    expect(assessCard(m, v).structure).toBe('FV')
    v.indicators.shade.grade = ''
    expect(assessCard(m, v).missing).toEqual([])
  })
})

describe('przykład Wapniarka (karta z przewodnika, 2008)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(wapniarka)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie', () => {
    const grades = Object.fromEntries(Object.entries(wapniarka.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({
      area: 'U1',
      share: 'XX',
      characteristic: 'U2',
      dominant: 'U2',
      aliens: 'FV',
      expansive: 'U1',
      structure: 'FV',
      shrubs: 'FV',
      shade: 'FV',
      damage: 'FV',
    })
  })

  it('parametry i ocena ogólna jak w karcie: powierzchnia U1, struktura U2, perspektywy U2, ogólna U2', () => {
    expect(assessCard(m, wapniarka)).toMatchObject({ area: 'U1', structure: 'U2', prospects: 'U2', overall: 'U2', missing: [] })
    // w zestawie z modyfikacji 2015 (bez ocienienia) wynik ten sam
    expect(assessCard(m, { ...wapniarka, site: { ...wapniarka.site, indicatorSet: 'mod2015' } })).toMatchObject({ structure: 'U2', overall: 'U2' })
  })

  it('podpowiedzi zgodne z ekspertem – poza ekspansją krzewów (brzoza + iwa 2%: karta FV, tab. 2 U1)', () => {
    const c = ctx({ site: wapniarka.site, indicators: wapniarka.indicators })
    for (const i of m.indicators) {
      const s = i.suggest!(wapniarka.indicators[i.id].inputs, c)
      if (i.id === 'shrubs') expect(s).toBe('U1')
      else expect(s, i.id).toBe(wapniarka.indicators[i.id].grade)
    }
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    const c = ctx({ site: wapniarka.site, indicators: wapniarka.indicators })
    for (const i of m.indicators) expect(i.describe!(wapniarka.indicators[i.id].inputs, c), i.id).toBe(wapniarka.indicators[i.id].value)
  })

  it('bez ostrzeżeń przy wskaźnikach; przy stanowisku tylko termin (28 sierpnia – poza majem–lipcem)', () => {
    const c = ctx({ site: wapniarka.site, indicators: wapniarka.indicators })
    for (const i of m.indicators) expect(i.warn?.(wapniarka.indicators[i.id].inputs, c) ?? null, i.id).toBeNull()
    const warned = m.siteFields.filter((f) => f.warn?.(wapniarka.site[f.name])).map((f) => f.name)
    expect(warned).toEqual(['date'])
  })

  it('zdjęcia jak w karcie, ekspert zanonimizowany, stary kod przemapowany', () => {
    expect(examples6110).toHaveLength(1)
    expect(wapniarka.releves.map((r) => (r.species as unknown[]).length)).toEqual([4, 7, 0])
    expect(wapniarka.releves.map((r) => [r.area, r.slope, r.exposure])).toEqual([[2, 90, 'E'], [4, 40, 'S'], [undefined, undefined, '']])
    expect(wapniarka.releves[2].remarks).toMatch(/Brak możliwości/)
    const names = wapniarka.releves.flatMap((r) => (r.species as { name: string }[]).map((s) => s.name))
    for (const n of names) expect(findSpecies6110(n), n).toBeTruthy()
    expect(wapniarka.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(wapniarka)).not.toMatch(/Świerkosz|Reczyńska|Szczęśniak/)
    expect(wapniarka.impacts.map((i) => `${i.code}${i.influence}${i.intensity}`)).toEqual(['C01+H'])
    expect(wapniarka.threats.map((t) => t.code)).toEqual(['C01'])
    for (const t of [...wapniarka.impacts, ...wapniarka.threats]) expect(m.impactCodes.find((c) => c.code === t.code)?.name, t.code).toBe(t.name)
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, uwagi do zdjęcia i stary kod w opisie', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, wapniarka))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['6110 Skały wapienne i neutrofilne z roślinnością pionierską (Alysso-Sedion)', 'Ekspansja krzewów i podrostu drzew', 'Wapniarka', 'Saxifrago-Poetum compressae', 'Nie wykonano transektu'])
      expect(text, t).toContain(t)
    expect(text).toMatch(/Kod w karcie z 2008 r.: 301/)
  })
})
