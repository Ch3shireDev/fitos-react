import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { CardValues, Grade, IndicatorContext, InputValues } from '../../7120/habitats/types'
import { examples2110, swinoujscie } from './examples'
import { gradeAliens2110, gradeGrasses2110, indicator2110 as ind, methodology2110 as m } from './methodology'
import { defaultLayer2110, findSpecies2110, isCharacteristic2110, isDuneGrass2110 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, ctx())
const sp = (...names: string[]) => names.map((name) => ({ name }))

describe('metodyka 2110 – struktura', () => {
  it('kod 2110 (nie priorytetowe), transekt 200×10 m, 3 zdjęcia po 25 m²', () => {
    expect(habitatCode(m)).toBe('2110')
    expect(m.name).toBe('Inicjalne stadia nadmorskich wydm białych')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('200x10 m')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności tab. 1', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Gatunki charakterystyczne',
      'Kondycja i forma wzrostu wydmotwórczych gatunków traw',
      'Występowanie sedymentacji/abrazji',
      'Występowanie gatunków obcych ekologicznie lub geograficznie',
      'Zniszczenia mechaniczne',
    ])
  })

  it('kardynalne: kondycja traw, sedymentacja/abrazja; nic pominiętego', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['grasses', 'abrasion'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('nazwy z SI MGSP podane w opisach', () => {
    expect(ind('abrasion').description).toMatch(/Występowanie abrazji/)
    expect(ind('aliens').description).toMatch(/Gatunki obce geograficznie/)
    expect(ind('damage').description).toMatch(/Mechaniczne zniszczenie/)
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...m.otherFields, ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: ostrzeżenie poza czerwcem–październikiem', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2013-10-12')).toBeNull()
    expect(date.warn!('2024-06-01')).toBeNull()
    expect(date.warn!('2024-05-20')).toMatch(/poza optymalnym/)
    expect(date.warn!('2024-11-02')).toMatch(/poza optymalnym/)
  })

  it('kody oddziaływań bez duplikatów, z turystyką, sztormem, umocnieniami i gatunkami obcymi', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['G01.02', 'G05.01', 'G05.05', 'J02.12.01', 'K01.05', 'I01', 'L07', 'X']) expect(codes).toContain(c)
  })
})

describe('metodyka 2110 – progi', () => {
  it('kondycja traw: ≥10% FV, >0 i <10% U1, 0 U2', () => {
    expect([100, 10, 9.9, 0.5, 0].map(gradeGrasses2110)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('kondycja traw: procent ma pierwszeństwo, ostrzeżenie przy niezgodności, opis', () => {
    expect(suggest('grasses', { value: 5, choice: 'abundant' })).toBe('U1')
    expect(suggest('grasses', { choice: 'none' })).toBe('U2')
    expect(suggest('grasses', {})).toBeNull()
    expect(ind('grasses').warn!({ value: 5, choice: 'abundant' }, ctx())).toMatch(/nie pasuje/)
    expect(ind('grasses').warn!({ value: 15, choice: 'abundant' }, ctx())).toBeNull()
    expect(ind('grasses').describe!({ value: 15, choice: 'abundant', note: 'kępy żywotne' }, ctx())).toBe('kępy żywotne; kwitnienie/owocowanie na 15% transektu')
  })

  it('sedymentacja/abrazja i zniszczenia: z wyboru, notatka idzie do wartości', () => {
    expect(['accumulative', 'rare', 'abrasive'].map((choice) => suggest('abrasion', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(['none', 'few', 'clear'].map((choice) => suggest('damage', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(ind('damage').describe!({ choice: 'few' }, ctx())).toBe('Nieliczne ślady przejazdu pojazdów, ścieżki itp.')
    expect(ind('abrasion').describe!({ choice: 'rare', note: 'podcięta wydma na 20 m' }, ctx())).toBe('podcięta wydma na 20 m')
  })

  it('gatunki obce: 0 FV, 1 egz. lub kępa <1 m² U1 (1 m² też U1), >1 m² albo >1 egz. U2', () => {
    expect(gradeAliens2110(0)).toBe('FV')
    expect(gradeAliens2110(1)).toBe('U1')
    expect(gradeAliens2110(1, 0.5)).toBe('U1')
    expect(gradeAliens2110(1, 1)).toBe('U1')
    expect(gradeAliens2110(1, 1.5)).toBe('U2')
    expect(gradeAliens2110(2)).toBe('U2')
  })

  it('gatunki obce: liczba > lista > wybór; ostrzeżenia', () => {
    expect(suggest('aliens', { count: 1, areaM2: 0.3, choice: 'many' })).toBe('U1')
    expect(suggest('aliens', { species: sp('Rosa rugosa', 'Salix acutifolia') })).toBe('U2')
    expect(suggest('aliens', { species: sp('Rosa rugosa'), choice: 'sporadic' })).toBe('U1')
    expect(suggest('aliens', { species: sp('Rosa rugosa'), areaM2: 3 })).toBe('U2')
    expect(suggest('aliens', { choice: 'none' })).toBe('FV')
    expect(suggest('aliens', {})).toBeNull()
    const w = (i: InputValues) => ind('aliens').warn!(i, ctx())
    expect(w({ species: sp('Rosa rugosa'), choice: 'none' })).toMatch(/„Brak”/)
    expect(w({ species: sp('Rosa rugosa'), count: 0 })).toMatch(/0 egzemplarzy/)
    expect(w({ species: sp('Ammophila arenaria') })).toMatch(/rodzime: Ammophila arenaria/)
    expect(w({ count: 3, choice: 'sporadic' })).toMatch(/to U2/)
    expect(w({ count: 1, choice: 'sporadic' })).toBeNull()
    expect(ind('aliens').explain!({ species: sp('Rosa rugosa', 'Xanthium albinum') }, ctx())).toMatch(/2 – to więcej niż 1 egzemplarz/)
    expect(ind('aliens').describe!({ species: [], choice: 'none' }, ctx())).toBe('nie stwierdzono')
    expect(ind('aliens').describe!({ species: [{ name: 'Salix acutifolia', cover: 5 }], count: 4 }, ctx())).toBe('Salix acutifolia 5%; 4 egz.')
  })

  it('gatunki charakterystyczne: ocena z wyboru, ostrzeżenia przy niezgodności z listą', () => {
    expect(['whole', 'single', 'none'].map((choice) => suggest('species', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(ind('species').warn!({ species: sp('Festuca villosa'), choice: 'whole' }, ctx())).toMatch(/żadnego z 5 gatunków/)
    expect(ind('species').warn!({ species: sp('Cakile maritima'), choice: 'none' }, ctx())).toMatch(/„Brak”/)
    expect(ind('species').warn!({ species: sp('Cakile maritima', 'Festuca villosa'), choice: 'single' }, ctx())).toMatch(/Festuca villosa/)
    expect(ind('species').warn!({ species: sp('Cakile maritima'), choice: 'single' }, ctx())).toBeNull()
    // synonimy liczone jako jeden gatunek
    expect(ind('species').explain!({ species: sp('Leymus arenarius', 'Elymus arenarius', 'Honckenya peploides') }, ctx())).toBe(
      'Gatunków charakterystycznych na liście: 2 z 5 (tab. 1).',
    )
  })

  it('powierzchnia: wybór z oceną, „brak danych” → XX, puste → ocena eksperta', () => {
    expect(['stable', 'smallDecrease', 'clearDecrease', 'unknown'].map((choice) => suggest('area', { choice }))).toEqual(['FV', 'U1', 'U2', 'XX'])
    expect(suggest('area', { areaHa: 0.2 })).toBeNull()
    expect(ind('area').describe!({ choice: 'smallDecrease', areaHa: 0.2 }, ctx())).toBe('0,2 ha; niewielki spadek powierzchni siedliska')
  })

  it('katalog: 5 gatunków charakterystycznych z synonimami, trawy wydmotwórcze, warstwy', () => {
    for (const n of ['Honckenya peploides', 'Cakile maritima', 'Ammophila arenaria', 'Leymus arenarius', 'Agropyron junceum', 'Elymus farctus', 'Elymus arenarius'])
      expect(isCharacteristic2110(n), n).toBe(true)
    expect(isCharacteristic2110('Festuca villosa')).toBe(false)
    expect(isDuneGrass2110('Calammophila baltica')).toBe(true)
    expect(isDuneGrass2110('× Calammophila baltica')).toBe(true)
    expect(isDuneGrass2110('Honckenya peploides')).toBe(false)
    expect(defaultLayer2110(findSpecies2110('Rosa rugosa')!)).toBe('B')
    expect(defaultLayer2110(findSpecies2110('Ammophila arenaria')!)).toBe('C')
    expect(m.speciesInfo!('Ammophila arenaria')).toBe('gatunek charakterystyczny 2110, trawa wydmotwórcza')
    expect(m.speciesInfo!('Hippophaë rhamnoides')).toBe('gatunek obcy ekologicznie (nasadzenia)')
  })
})

describe('ocena struktury', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(swinoujscie)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    return v
  }

  it('wszystko FV → FV; niekardynalny U2 (zniszczenia) → struktura U1', () => {
    const v = allFv()
    expect(assessCard(m, v)).toMatchObject({ structure: 'FV', overall: 'FV' })
    v.indicators.damage.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
  })

  it('kardynalny U1 (kondycja traw) → U1; kardynalny U2 (abrazja) → U2', () => {
    const v = allFv()
    v.indicators.grasses.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.abrasion.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U2')
  })
})

describe('przykład Świnoujście (karta z przewodnika, 2013)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(swinoujscie)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny jak w karcie: wszystko FV, mimo zniszczeń U1', () => {
    expect(assessCard(m, swinoujscie)).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV', missing: [] })
    expect(swinoujscie.indicators.damage.grade).toBe('U1')
  })

  it('podpowiedzi zgodne z ekspertem', () => {
    const c = ctx({ site: swinoujscie.site, indicators: swinoujscie.indicators })
    for (const i of m.indicators) expect(i.suggest!(swinoujscie.indicators[i.id].inputs, c), i.id).toBe(swinoujscie.indicators[i.id].grade)
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    const c = ctx({ site: swinoujscie.site, indicators: swinoujscie.indicators })
    for (const i of m.indicators) expect(i.describe!(swinoujscie.indicators[i.id].inputs, c), i.id).toBe(swinoujscie.indicators[i.id].value)
  })

  it('zanonimizowany wykonawca, 3 zdjęcia', () => {
    expect(examples2110).toHaveLength(1)
    expect(swinoujscie.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(swinoujscie)).not.toMatch(/Lemke/)
    expect(swinoujscie.releves).toHaveLength(3)
  })
})
