import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { examples6170, uplazianskaKopa2 as kopa } from './examples'
import {
  gradeAcidCover6170,
  gradeAcidophilous6170,
  gradeCalcicole6170,
  gradeErosionShare6170,
  gradeExpansive6170,
  gradeHabitatShare6170,
  gradeHerbCover6170,
  gradeRichness6170,
  gradeShrubs6170,
  gradeSynanthropic6170,
  gradeValuable6170,
  indicator6170 as ind,
  isRockFace6170,
  methodology6170 as m,
  rangeOf6170,
  richnessClass6170,
} from './methodology'
import { SPECIES_6170, defaultLayer6170, findSpecies6170, speciesKey6170 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const at = (subtype: string, extra: InputValues = {}) => ctx({ site: { subtype, ...extra } })
const suggest = (id: string, inputs: InputValues, c = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const warn = (id: string, inputs: InputValues, c = ctx()) => ind(id).warn!(inputs, c)
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => (cover === undefined ? { name } : { name, cover }))

describe('metodyka 6170 – struktura', () => {
  it('kod 6170 (nie priorytetowe), 3 zdjęcia 5 × 5 m, warstwy A–D, podtyp wymagany', () => {
    expect(habitatCode(m)).toBe('6170')
    expect(m.name).toBe('Nawapienne murawy wysokogórskie (Seslerion tatrae) i wyleżyska śnieżne (Arabidion coeruleae)')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(m.releves.fields.map((f) => f.name)).toEqual(expect.arrayContaining(['coverA', 'coverB', 'coverC', 'coverD', 'heightB', 'heightC']))
    expect(m.siteFields.find((f) => f.name === 'subtype')?.required).toBe(true)
    expect(m.siteFields.find((f) => f.name === 'transect')?.required).toBeFalsy()
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności karty przykładowej: powierzchnia + 14 struktury', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Bogactwo gatunkowe',
      'Cenne składniki flory',
      'Erozja',
      'Gatunki ekspansywne',
      'Gatunki nawapienne',
      'Gatunki synantropijne',
      'Gatunki typowe dla podłoża bezwapiennego',
      'Pokrycie drzew i krzewów (w tym kosodrzewiny) w transekcie',
      'Procent powierzchni zajęty przez siedlisko na transekcie',
      'Stan populacji gatunków nawapiennych',
      'Stan populacji gatunków typowych dla podłoża bezwapiennego',
      'Struktura przestrzenna płatów siedliska',
      'Ślady wspinaczki lub wydeptywania',
      'Średnie pokrycie roślin zielnych w transekcie',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('kardynalne (lista pod tab. 2): bogactwo, cenne składniki, gatunki nawapienne', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id).sort()).toEqual(['calcicole', 'richness', 'valuable'])
  })

  it('silnik bez zmian: brak własnej reguły struktury', () => {
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

  it('termin: czerwiec – ok. połowy sierpnia', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2010-08-03')).toBeNull()
    expect(date.warn!('2021-06-17')).toBeNull()
    expect(date.warn!('2021-08-13')).toBeNull()
    expect(date.warn!('2016-08-31')).toMatch(/połowie sierpnia/)
    expect(date.warn!('2021-05-20')).toMatch(/poza sezonem/)
    expect(date.warn!('2021-09-05')).toMatch(/poza sezonem/)
  })

  it('zdjęcie inne niż 25 m² – ostrzeżenie', () => {
    const area = m.releves.fields.find((f) => f.name === 'area')!
    expect(area.warn!(25)).toBeNull()
    expect(area.warn!(10)).toMatch(/5 × 5 m/)
  })

  it('podtyp → pasmo; murawa naskalna z wyboru albo z podtypu 6170-3', () => {
    expect(rangeOf6170({ subtype: '6170-1' })).toBe('tatry')
    expect(rangeOf6170({ subtype: '6170-2' })).toBe('tatry')
    expect(rangeOf6170({ subtype: '6170-3' })).toBe('pieniny')
    expect(rangeOf6170({ subtype: '6170-4' })).toBe('babia')
    expect(rangeOf6170({})).toBe('tatry')
    expect(isRockFace6170({ subtype: '6170-3' })).toBe(true)
    expect(isRockFace6170({ subtype: '6170-3', rockFace: 'no' })).toBe(false)
    expect(isRockFace6170({ subtype: '6170-1' })).toBe(false)
    expect(isRockFace6170({ subtype: '6170-1', rockFace: 'yes' })).toBe(true)
  })
})

describe('progi tab. 2', () => {
  it('bogactwo gatunkowe: >30 FV, 20–30 U1, <20 U2; opis słowny wg tab. 2', () => {
    expect([54, 31, 30, 20, 19].map(gradeRichness6170)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
    expect([40, 36, 35, 31, 25, 10].map(richnessClass6170)).toEqual(['Wyjątkowo duże', 'Wyjątkowo duże', 'Duże', 'Duże', 'Średnie', 'Małe'])
  })

  it('cenne składniki: Tatry >20 / 10–20 / <10; Pieniny i Babia Góra >15 / 5–15 / <5', () => {
    expect([21, 20, 10, 9].map((n) => gradeValuable6170(n, 'tatry'))).toEqual(['FV', 'U1', 'U1', 'U2'])
    expect([16, 15, 14, 5, 4].map((n) => gradeValuable6170(n, 'pieniny'))).toEqual(['FV', 'U1', 'U1', 'U1', 'U2'])
    expect([16, 15, 4].map((n) => gradeValuable6170(n, 'babia'))).toEqual(['FV', 'U1', 'U2'])
  })

  it('gatunki nawapienne: >20 / 10–20 / <10; Babia Góra >10 / 5–10 / <5', () => {
    expect([35, 21, 20, 10, 9].map((n) => gradeCalcicole6170(n, 'tatry'))).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
    expect([18, 9].map((n) => gradeCalcicole6170(n, 'pieniny'))).toEqual(['U1', 'U2'])
    expect([11, 10, 6, 5, 4].map((n) => gradeCalcicole6170(n, 'babia'))).toEqual(['FV', 'U1', 'U1', 'U1', 'U2'])
  })

  it('gatunki bezwapienne: <5 / 5–10 / >10; Babia Góra <10 / 10–20 / >20', () => {
    expect([0, 4, 5, 6, 10, 11].map((n) => gradeAcidophilous6170(n, 'tatry'))).toEqual(['FV', 'FV', 'U1', 'U1', 'U1', 'U2'])
    expect([9, 10, 15, 20, 21].map((n) => gradeAcidophilous6170(n, 'babia'))).toEqual(['FV', 'U1', 'U1', 'U1', 'U2'])
  })

  it('stan populacji bezwapiennych (pokrycie): <10 / 10–20 / >20; Babia Góra <20 / 20–40 / >40', () => {
    expect([5, 10, 20, 21].map((c) => gradeAcidCover6170(c, 'tatry'))).toEqual(['FV', 'U1', 'U1', 'U2'])
    expect([15, 20, 40, 41].map((c) => gradeAcidCover6170(c, 'babia'))).toEqual(['FV', 'U1', 'U1', 'U2'])
  })

  it('pokrycie drzew i krzewów (od 2012): <10 FV, sama kosodrzewina <20 FV, do 50 U1, >50 U2', () => {
    expect([0, 9, 10, 45, 50, 51].map((c) => gradeShrubs6170(c))).toEqual(['FV', 'FV', 'U1', 'U1', 'U1', 'U2'])
    expect([15, 19, 20].map((c) => gradeShrubs6170(c, true))).toEqual(['FV', 'FV', 'U1'])
  })

  it('procent powierzchni siedliska: >75 / 50–75 / <50', () => {
    expect([100, 76, 75, 60, 50, 20].map(gradeHabitatShare6170)).toEqual(['FV', 'FV', 'U1', 'U1', 'U1', 'U2'])
  })

  it('średnie pokrycie roślin zielnych: >75 / 50–75 / <50; murawy naskalne >25 / 10–25 / <10', () => {
    expect([80, 75, 60, 50, 49].map((p) => gradeHerbCover6170(p, false))).toEqual(['FV', 'U1', 'U1', 'U1', 'U2'])
    expect([40, 25, 10, 5].map((p) => gradeHerbCover6170(p, true))).toEqual(['FV', 'U1', 'U1', 'U2'])
  })

  it('erozja (odsetek transektu): 0 FV, do 25 U1, >25 U2', () => {
    expect([0, 10, 25, 26].map(gradeErosionShare6170)).toEqual(['FV', 'U1', 'U1', 'U2'])
  })

  it('gatunki ekspansywne: gorsza z części zielnej i krzewiastej, kosodrzewina do 20% FV', () => {
    expect(gradeExpansive6170(undefined, undefined)).toBe('FV')
    expect(gradeExpansive6170(0, 10)).toBe('FV')
    expect(gradeExpansive6170(0, 15)).toBe('U1')
    expect(gradeExpansive6170(0, 15, true)).toBe('FV')
    expect(gradeExpansive6170(0, 25, true)).toBe('U1')
    expect(gradeExpansive6170('present', 0)).toBe('U1')
    expect(gradeExpansive6170(10, 0)).toBe('U1')
    expect(gradeExpansive6170(11, 0)).toBe('U2')
    expect(gradeExpansive6170(5, 51)).toBe('U2')
  })

  it('gatunki synantropijne: brak FV; 1 gatunek albo nasadzenia ≤20% U1; kilka, 1 >10% albo nasadzenia >20% U2', () => {
    expect(gradeSynanthropic6170(0, undefined, undefined)).toBe('FV')
    expect(gradeSynanthropic6170(1, 0.5, undefined)).toBe('U1')
    expect(gradeSynanthropic6170(0, undefined, 15)).toBe('U1')
    expect(gradeSynanthropic6170(0, undefined, 20)).toBe('U1')
    expect(gradeSynanthropic6170(0, undefined, 21)).toBe('U2')
    expect(gradeSynanthropic6170(1, 11, undefined)).toBe('U2')
    expect(gradeSynanthropic6170(2, 0.5, undefined)).toBe('U2')
  })
})

describe('podpowiedzi wskaźników', () => {
  it('cenne składniki: próg zależy od podtypu; ocena ekspercka ma pierwszeństwo, rozjazd ostrzega', () => {
    const fourteen = { species: sp(...Array.from({ length: 14 }, (_, k) => [`Species ${k}`] as [string])) }
    expect(suggest('valuable', fourteen, at('6170-1'))).toBe('U1')
    expect(suggest('valuable', { count: 14 }, at('6170-3'))).toBe('U1') // Zawiesy, Biała Woda 2021
    expect(suggest('valuable', { count: 16 }, at('6170-4'))).toBe('FV')
    expect(suggest('valuable', { count: 16 }, at('6170-1'))).toBe('U1')
    expect(suggest('valuable', { count: 12, choice: 'FV' }, at('6170-1'))).toBe('FV')
    expect(warn('valuable', { count: 12, choice: 'FV' }, at('6170-1'))).toMatch(/szczególnie cenne/)
    expect(ind('valuable').explain!({ count: 16 }, ctx())).toMatch(/Wybierz podtyp/)
  })

  it('gatunki nawapienne: liczone z listy (synonimy raz), bez gatunków bezwapiennych i drzew; Babia Góra 5–6 → U1', () => {
    const list = { species: sp(['Galium anisophyllum'], ['Galium anisophyllon'], ['Dryas octopetala'], ['Juncus trifidus'], ['Picea abies'], ['Gatunek spoza katalogu']) }
    expect(ind('calcicole').explain!(list, at('6170-1'))).toMatch(/Gatunków nawapiennych: 3/)
    expect(warn('calcicole', list, at('6170-1'))).toMatch(/Juncus trifidus, Picea abies/)
    expect(suggest('calcicole', { count: 6 }, at('6170-4'))).toBe('U1') // Diablak, Akademicka Perć 2021
    expect(suggest('calcicole', { count: 18 }, at('6170-3'))).toBe('U1') // Zawiesy, Przełom Dunajca 2021
    expect(suggest('calcicole', { count: 8, choice: 'FV' }, at('6170-1'))).toBe('FV')
  })

  it('gatunki bezwapienne: 6 → U1 (Upłaziańska Kopa 1 w 2021, karta przykładowa); Babia Góra 13 → U1', () => {
    expect(suggest('acidophilous', { count: 6 }, at('6170-1'))).toBe('U1')
    expect(suggest('acidophilous', { count: 4 }, at('6170-1'))).toBe('FV')
    expect(suggest('acidophilous', { count: 13 }, at('6170-4'))).toBe('U1')
    expect(suggest('acidophilous', { none: 'yes' }, at('6170-3'))).toBe('FV')
    expect(warn('acidophilous', { species: sp(['Dryas octopetala']) })).toMatch(/nawapienne/)
  })

  it('gatunki ekspansywne: borówka czarna 50% liczona z krzewami → U1 (Akademicka Perć 2021); trzcinnik pstry pominięty w Pieninach', () => {
    expect(suggest('expansive', { species: sp(['Vaccinium myrtillus', 50]) }, at('6170-4'))).toBe('U1')
    expect(suggest('expansive', { species: sp(['Pinus mugo', 15]) }, at('6170-1'))).toBe('FV')
    expect(suggest('expansive', { species: sp(['Pinus mugo', 15], ['Picea abies', 5]) }, at('6170-1'))).toBe('U1')
    expect(suggest('expansive', { species: sp(['Calamagrostis varia', 20]) }, at('6170-3'))).toBe('FV')
    expect(suggest('expansive', { species: sp(['Calamagrostis varia', 20]) }, at('6170-1'))).toBe('U2')
    expect(suggest('expansive', { species: sp(['Deschampsia cespitosa']) }, at('6170-1'))).toBe('U1')
    expect(suggest('expansive', { none: 'yes' })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Picea abies']) })).toBeNull()
    expect(warn('expansive', { species: sp(['Dryas octopetala', 30]) })).toMatch(/nawapienne/)
  })

  it('gatunki synantropijne: modrzew z nasadzeń 15% → U1 (Kopieniec 2021); kosodrzewina pomijana z ostrzeżeniem', () => {
    expect(suggest('synanthropic', { planted: 15 })).toBe('U1')
    expect(suggest('synanthropic', { species: sp(['Urtica dioica', 1]) })).toBe('U1')
    expect(suggest('synanthropic', { species: sp(['Urtica dioica', 1], ['Poa annua', 0.5]) })).toBe('U2')
    expect(suggest('synanthropic', { species: sp(['Pinus mugo', 5]) })).toBe('FV')
    expect(warn('synanthropic', { species: sp(['Pinus mugo', 5]) })).toMatch(/kosodrzewina/)
    expect(suggest('synanthropic', { none: 'yes' })).toBe('FV')
    expect(suggest('synanthropic', {})).toBeNull()
  })

  it('pokrycie drzew i krzewów: „znikome” → FV; kosodrzewina z listy → próg 20; Kopieniec 45% → U1', () => {
    expect(suggest('shrubs', { level: 'negligible' })).toBe('FV')
    expect(suggest('shrubs', { total: 45 })).toBe('U1')
    expect(suggest('shrubs', { species: sp(['Pinus mugo', 15]) })).toBe('FV')
    expect(suggest('shrubs', { total: 15, mugoOnly: 'yes' })).toBe('FV')
    expect(suggest('shrubs', { species: sp(['Pinus mugo', 15], ['Picea abies', 5]) })).toBe('U1')
    expect(warn('shrubs', { species: sp(['Vaccinium myrtillus', 20]) })).toMatch(/krzewinki/)
  })

  it('struktura przestrzenna ostrzega, gdy kłóci się z pokryciem krzewów', () => {
    const c = ctx({ indicators: { shrubs: { inputs: { total: 35 }, value: '', grade: 'U1' } } })
    expect(warn('spatialStructure', { choice: 'fv' }, c)).toMatch(/35%/)
    expect(warn('spatialStructure', { choice: 'u1' }, c)).toBeNull()
  })

  it('średnie pokrycie roślin zielnych: Pieniny (naskalne) 30% → FV, Tatry 30% → U2', () => {
    expect(suggest('herbCover', { value: 30 }, at('6170-3'))).toBe('FV')
    expect(suggest('herbCover', { value: 30 }, at('6170-1'))).toBe('U2')
    expect(suggest('herbCover', { value: 30 }, at('6170-1', { rockFace: 'yes' }))).toBe('FV')
  })

  it('erozja: wybór ma pierwszeństwo, rozjazd z odsetkiem ostrzega', () => {
    expect(suggest('erosion', { share: 30 })).toBe('U2')
    expect(suggest('erosion', { choice: 'local', share: 30 })).toBe('U1')
    expect(warn('erosion', { choice: 'local', share: 30 })).toMatch(/U2/)
  })

  it('stan populacji bezwapiennych: wybór albo pokrycie; „nieco więcej, lecz obniżona żywotność” bez ostrzeżenia', () => {
    expect(suggest('acidophilousPopulation', { cover: 15 }, at('6170-1'))).toBe('U1')
    expect(suggest('acidophilousPopulation', { cover: 15 }, at('6170-4'))).toBe('FV')
    expect(warn('acidophilousPopulation', { choice: 'fv', cover: 12 }, at('6170-1'))).toBeNull()
    expect(warn('acidophilousPopulation', { choice: 'fv', cover: 30 }, at('6170-1'))).toMatch(/U2/)
  })
})

describe('katalog gatunków', () => {
  it('bez duplikatów, warstwy domyślne, synonimy dają jeden klucz', () => {
    const names = SPECIES_6170.map((s) => s.latin.toLowerCase())
    expect(new Set(names).size).toBe(names.length)
    expect(defaultLayer6170(findSpecies6170('Pinus mugo')!)).toBe('B')
    expect(defaultLayer6170(findSpecies6170('Cetraria islandica')!)).toBe('D')
    expect(defaultLayer6170(findSpecies6170('Salix reticulata')!)).toBe('C')
    expect(speciesKey6170('Galium anisophyllon')).toBe(speciesKey6170('Galium anisophyllum'))
    expect(m.speciesInfo!('Sesleria tatrae')).toBe('gatunek nawapienny* – Tatry')
    expect(m.speciesInfo!('Parthenocissus inserta')).toMatch(/obcy/)
  })
})

describe('ocena struktury (reguła ogólna silnika = tab. 2)', () => {
  const all = (g: Grade): CardValues => ({
    ...kopa,
    indicators: Object.fromEntries(Object.entries(kopa.indicators).map(([k, v]) => [k, { ...v, grade: g }])),
    prospects: { value: '', grade: 'FV' },
  })
  const withGrade = (base: CardValues, id: string, g: Grade): CardValues => ({ ...base, indicators: { ...base.indicators, [id]: { ...base.indicators[id], grade: g } } })

  it('niekardynalne U1 → struktura FV; niekardynalny U2 (erozja) → U1 (Kopieniec 2021)', () => {
    expect(assessCard(m, all('FV'))).toMatchObject({ structure: 'FV', overall: 'FV' })
    expect(assessCard(m, withGrade(withGrade(all('FV'), 'erosion', 'U1'), 'acidophilous', 'U1')).structure).toBe('FV')
    expect(assessCard(m, withGrade(all('FV'), 'erosion', 'U2'))).toMatchObject({ structure: 'U1', overall: 'U1' })
  })

  it('kardynalny U1 (nawapienne) → U1; kardynalny U2 (bogactwo) → U2', () => {
    expect(assessCard(m, withGrade(all('FV'), 'calcicole', 'U1')).structure).toBe('U1')
    expect(assessCard(m, withGrade(all('FV'), 'richness', 'U2')).structure).toBe('U2')
  })

  it('struktura U1 przy FV pozostałych → ogólna U1 (Żleb pod Czerwienicą 2011 dostał FV – niezgodnie z regułą, poprawione w 2016)', () => {
    expect(assessCard(m, withGrade(all('FV'), 'valuable', 'U1'))).toMatchObject({ area: 'FV', structure: 'U1', prospects: 'FV', overall: 'U1' })
  })
})

describe('przykład Upłaziańska Kopa 2 (karta z przewodnika, 2010)', () => {
  const c = ctx({ site: kopa.site, indicators: kopa.indicators })

  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(kopa)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie', () => {
    const grades = Object.fromEntries(Object.entries(kopa.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({
      area: 'FV',
      richness: 'FV',
      valuable: 'FV',
      erosion: 'U1',
      expansive: 'FV',
      calcicole: 'FV',
      synanthropic: 'FV',
      acidophilous: 'U1',
      shrubs: 'FV',
      habitatShare: 'FV',
      calcicolePopulation: 'FV',
      acidophilousPopulation: 'FV',
      spatialStructure: 'FV',
      trampling: 'FV',
      herbCover: 'FV',
    })
  })

  it('parametry i ocena ogólna jak w karcie: wszystko FV mimo dwóch niekardynalnych U1', () => {
    expect(assessCard(m, kopa)).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV', missing: [] })
  })

  it('podpowiedzi zgodne z ekspertem przy każdym wskaźniku (liczby z list: 51 cennych, 35 nawapiennych, 6 bezwapiennych)', () => {
    for (const i of m.indicators) expect(i.suggest!(kopa.indicators[i.id].inputs, c), i.id).toBe(kopa.indicators[i.id].grade)
    expect(ind('valuable').explain!(kopa.indicators.valuable.inputs, c)).toMatch(/Cennych gatunków: 51/)
    expect(ind('calcicole').explain!(kopa.indicators.calcicole.inputs, c)).toMatch(/Gatunków nawapiennych: 35/)
    expect(ind('acidophilous').explain!(kopa.indicators.acidophilous.inputs, c)).toMatch(/bezwapiennych: 6/)
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    for (const i of m.indicators) expect(i.describe!(kopa.indicators[i.id].inputs, c), i.id).toBe(kopa.indicators[i.id].value)
  })

  it('bez ostrzeżeń przy wskaźnikach, stanowisku i zdjęciach (3 sierpnia, zdjęcia 25 m²)', () => {
    for (const i of m.indicators) expect(i.warn?.(kopa.indicators[i.id].inputs, c) ?? null, i.id).toBeNull()
    for (const f of m.siteFields) expect(f.warn?.(kopa.site[f.name]) ?? null, f.name).toBeNull()
    for (const r of kopa.releves) for (const f of m.releves.fields) expect(f.warn?.(r[f.name]) ?? null, f.name).toBeNull()
  })

  it('zdjęcia jak w karcie, udział FV/U1/U2 = 100%, obserwatorzy zanonimizowani, oddziaływanie przemapowane', () => {
    expect(examples6170).toHaveLength(1)
    expect(kopa.releves.map((r) => (r.species as unknown[]).length)).toEqual([42, 44, 43])
    expect(kopa.releves.map((r) => [r.area, r.slope, r.exposure, r.coverB, r.coverC, r.coverD, r.heightB, r.heightC])).toEqual([
      [25, 20, 'W', undefined, 80, 40, undefined, 10],
      [25, 35, 'W', 2, 75, 30, 0.5, 10],
      [25, 40, 'W', undefined, 90, 30, undefined, 10],
    ])
    const rows = kopa.releves.flatMap((r) => r.species as { name: string; layer: string }[])
    for (const r of rows) expect(findSpecies6170(r.name), r.name).toBeTruthy()
    expect(rows.filter((r) => r.layer === 'D').map((r) => r.name)).toEqual([
      'Cetraria islandica',
      'Cetraria sp.',
      'Thamnolia vermicularis',
      'Cetraria islandica',
      'Cetraria sp.',
      'Cetraria islandica',
    ])
    expect(rows.filter((r) => r.layer === 'B').map((r) => r.name)).toEqual(['Pinus mugo'])
    const o = kopa.other
    expect(Number(o.shareFV) + Number(o.shareU1) + Number(o.shareU2)).toBe(100)
    expect(kopa.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(kopa)).not.toMatch(/Kozak|Stawowczyk/)
    expect(kopa.impacts.map((i) => `${i.code}${i.influence}${i.intensity}`)).toEqual(['K01.01-M'])
    for (const t of kopa.impacts) expect(m.impactCodes.find((x) => x.code === t.code)?.name, t.code).toBe(t.name)
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, udział FV/U1/U2 i dane stanowiska', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, kopa))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['6170 Nawapienne murawy wysokogórskie', 'Gatunki typowe dla podłoża bezwapiennego', 'Udział powierzchni siedliska w stanie FV', 'Upłaziańska Kopa 2', 'PLC120001 Tatry'])
      expect(text, t).toContain(t)
  })
})
