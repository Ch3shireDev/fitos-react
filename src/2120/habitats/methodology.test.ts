import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { CardValues, Grade, IndicatorContext, InputValues } from '../../7120/habitats/types'
import { examples2120, jezioroWicko } from './examples'
import { gradeGrasses2120, gradeNitrophilous2120, indicator2120 as ind, methodology2120 as m } from './methodology'
import { defaultLayer2120, findSpecies2120, isCharacteristic2120, isDuneGrass2120, isNitrophilous2120 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, ctx())
const sp = (...names: string[]) => names.map((name) => ({ name }))

describe('metodyka 2120 – struktura', () => {
  it('kod 2120 (nie priorytetowe), transekt 200×10 m, 3 zdjęcia po 25 m²', () => {
    expect(habitatCode(m)).toBe('2120')
    expect(m.name).toBe('Nadmorskie wydmy białe')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('200x10 m')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(emptyCardValues(m).releves).toHaveLength(3)
    expect(emptyCardValues(m).site.grassesRole).toBe('')
  })

  it('wskaźniki w kolejności tab. 1', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Gatunki charakterystyczne',
      'Gatunki nitrofilne',
      'Kondycja i kwitnięcie/owocowanie gatunków traw',
      'Występowanie gatunków obcych ekologicznie lub geograficznie',
      'Występowanie sedymentacji/abrazji',
      'Zniszczenia mechaniczne',
    ])
  })

  it('kardynalne (lista pod tab. 2): nitrofilne, kondycja traw, sedymentacja/abrazja, zniszczenia; obce pomocnicze', () => {
    const site = { grassesRole: '' }
    expect(m.indicators.filter((i) => isCardinal(i, site)).map((i) => i.id)).toEqual(['nitrophilous', 'grasses', 'abrasion', 'damage'])
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toContain('grasses')
    expect(m.indicators.filter((i) => isExcluded(i, site)).map((i) => i.id)).toEqual(['aliens'])
  })

  it('późny termin: kondycja traw niekardynalna tylko na żądanie', () => {
    expect(isCardinal(ind('grasses'), { grassesRole: 'late' })).toBe(false)
    const role = m.siteFields.find((f) => f.name === 'grassesRole')!
    expect(role.warn!('late')).toMatch(/uwagach metodycznych/)
    expect(role.warn!('')).toBeNull()
    expect(ind('grasses').explain!({}, ctx({ site: { grassesRole: 'late' } }))).toMatch(/niekardynalny/)
    expect(ind('grasses').explain!({}, ctx())).toBeNull()
  })

  it('nazwy z SI MGSP podane w opisach', () => {
    expect(ind('abrasion').description).toMatch(/Występowanie abrazji/)
    expect(ind('damage').description).toMatch(/Mechaniczne zniszczenie/)
    expect(ind('nitrophilous').description).toMatch(/Ellenberga „N” wynosi od 7 do 9/)
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
    expect(date.warn!('2013-09-28')).toBeNull()
    expect(date.warn!('2024-06-01')).toBeNull()
    expect(date.warn!('2024-05-20')).toMatch(/poza optymalnym/)
    expect(date.warn!('2024-11-02')).toMatch(/poza optymalnym/)
  })

  it('kody oddziaływań bez duplikatów, z turystyką, sztormem, umocnieniami, sukcesją i gatunkami obcymi', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['G01.02', 'G05.01', 'J02.12.01', 'K02.01', 'I01', 'L07', 'X']) expect(codes).toContain(c)
  })
})

describe('metodyka 2120 – progi', () => {
  it('kondycja traw: ≥10% FV, >0 i <10% U1, 0 U2', () => {
    expect([100, 10, 9.9, 0.5, 0].map(gradeGrasses2120)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('kondycja traw: procent ma pierwszeństwo, ostrzeżenie przy niezgodności, opis', () => {
    expect(suggest('grasses', { value: 5, choice: 'abundant' })).toBe('U1')
    expect(suggest('grasses', { choice: 'none' })).toBe('U2')
    expect(suggest('grasses', {})).toBeNull()
    expect(ind('grasses').warn!({ value: 5, choice: 'abundant' }, ctx())).toMatch(/nie pasuje/)
    expect(ind('grasses').warn!({ value: 15, choice: 'abundant' }, ctx())).toBeNull()
    expect(ind('grasses').describe!({ value: 15, choice: 'abundant', note: 'kępy żywotne' }, ctx())).toBe('kępy żywotne; kwitnięcie/owocowanie na 15% transektu')
  })

  it('gatunki nitrofilne: 0 FV; 1 gatunek r/+ U1; 1 gatunek ≥1 albo >1 gatunek U2', () => {
    expect(gradeNitrophilous2120(0)).toBe('FV')
    expect(gradeNitrophilous2120(1, 'low')).toBe('U1')
    expect(gradeNitrophilous2120(1, 'high')).toBe('U2')
    expect(gradeNitrophilous2120(1)).toBeNull()
    expect(gradeNitrophilous2120(2, 'low')).toBe('U2')
  })

  it('gatunki nitrofilne: lista > wybór; synonimy/duplikaty liczone raz; ostrzeżenia', () => {
    expect(suggest('nitrophilous', { species: sp('Cirsium vulgare'), abundance: 'low', choice: 'more' })).toBe('U1')
    expect(suggest('nitrophilous', { species: sp('Cirsium vulgare', 'cirsium  vulgare'), abundance: 'low' })).toBe('U1')
    expect(suggest('nitrophilous', { species: sp('Cirsium vulgare', 'Urtica dioica') })).toBe('U2')
    expect(suggest('nitrophilous', { species: sp('Sisymbrium officinale') })).toBeNull()
    expect(suggest('nitrophilous', { species: sp('Sisymbrium officinale'), choice: 'one' })).toBe('U1')
    expect(suggest('nitrophilous', { choice: 'none' })).toBe('FV')
    expect(suggest('nitrophilous', {})).toBeNull()
    const w = (i: InputValues) => ind('nitrophilous').warn!(i, ctx())
    expect(w({ species: sp('Urtica dioica'), choice: 'none' })).toMatch(/„Brak”/)
    expect(w({ species: sp('Ammophila arenaria') })).toMatch(/oznaczone jako nitrofilne \(N 7–9\): Ammophila arenaria/)
    expect(w({ species: sp('Urtica dioica'), abundance: 'high', choice: 'one' })).toMatch(/to U2, a wybrano U1/)
    expect(w({ species: sp('Urtica dioica'), abundance: 'low', choice: 'one' })).toBeNull()
    expect(ind('nitrophilous').explain!({ species: sp('Urtica dioica') }, ctx())).toMatch(/wybierz jego ilościowość/)
    expect(ind('nitrophilous').explain!({ species: sp('Urtica dioica', 'Cirsium vulgare') }, ctx())).toMatch(/2 – więcej niż jeden/)
    expect(ind('nitrophilous').describe!({ species: [], choice: 'none' }, ctx())).toBe('brak')
    expect(ind('nitrophilous').describe!({ species: [{ name: 'Urtica dioica', cover: 2 }], abundance: 'high' }, ctx())).toBe('Urtica dioica 2%; ilościowość ≥1')
  })

  it('sedymentacja/abrazja i zniszczenia: z wyboru, notatka idzie do wartości', () => {
    expect(['accumulative', 'rare', 'abrasive'].map((choice) => suggest('abrasion', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(['none', 'few', 'clear'].map((choice) => suggest('damage', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(ind('damage').describe!({ choice: 'few' }, ctx())).toBe('Nieliczne ślady przejazdu pojazdów, ścieżki itp.')
    expect(ind('abrasion').describe!({ choice: 'rare', note: 'podcięta wydma na 20 m' }, ctx())).toBe('podcięta wydma na 20 m')
  })

  it('gatunki obce (pomocnicze): wybór > lista; ostrzeżenia, opis', () => {
    expect(suggest('aliens', { choice: 'none' })).toBe('FV')
    expect(suggest('aliens', { species: sp('Rosa rugosa', 'Salix acutifolia') })).toBe('U2')
    expect(suggest('aliens', { species: sp('Rosa rugosa') })).toBeNull()
    expect(suggest('aliens', { species: sp('Rosa rugosa'), choice: 'sporadic' })).toBe('U1')
    expect(ind('aliens').warn!({ species: sp('Rosa rugosa'), choice: 'none' }, ctx())).toMatch(/„Brak”/)
    expect(ind('aliens').warn!({ species: sp('Ammophila arenaria') }, ctx())).toMatch(/rodzime: Ammophila arenaria/)
    expect(ind('aliens').explain!({ species: sp('Pinus nigra', 'Rosa rugosa') }, ctx())).toBe('Nasadzenia do „stabilizacji” brzegu: Pinus nigra.')
    expect(ind('aliens').describe!({ species: [], choice: 'none' }, ctx())).toBe('nie stwierdzono')
  })

  it('gatunki charakterystyczne: ocena z wyboru, ostrzeżenia przy niezgodności z listą', () => {
    expect(['whole', 'single', 'none'].map((choice) => suggest('species', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(ind('species').warn!({ species: sp('Honckenya peploides'), choice: 'whole' }, ctx())).toMatch(/żadnego z 8 gatunków/)
    expect(ind('species').warn!({ species: sp('Ammophila arenaria'), choice: 'none' }, ctx())).toMatch(/„Brak”/)
    expect(ind('species').warn!({ species: sp('Ammophila arenaria', 'Honckenya peploides'), choice: 'single' }, ctx())).toMatch(/Honckenya peploides/)
    expect(ind('species').warn!({ species: sp('Ammophila arenaria'), choice: 'single' }, ctx())).toBeNull()
    // synonimy liczone jako jeden gatunek
    expect(ind('species').explain!({ species: sp('Leymus arenarius', 'Elymus arenarius', 'Linaria odora', 'Linaria loeselii', 'Festuca villosa') }, ctx())).toBe(
      'Gatunków charakterystycznych na liście: 3 z 8 (tab. 1).',
    )
  })

  it('powierzchnia: wybór z oceną, „brak danych” → XX, puste → ocena eksperta', () => {
    expect(['stable', 'smallDecrease', 'clearDecrease', 'unknown'].map((choice) => suggest('area', { choice }))).toEqual(['FV', 'U1', 'U2', 'XX'])
    expect(suggest('area', { areaHa: 1 })).toBeNull()
    expect(ind('area').describe!({ choice: 'smallDecrease', areaHa: 1.5 }, ctx())).toBe('1,5 ha; niewielki spadek powierzchni siedliska')
  })

  it('katalog: gatunki charakterystyczne z synonimami, nitrofilne, trawy wydmotwórcze, warstwy', () => {
    for (const n of ['Ammophila arenaria', 'Leymus arenarius', 'Elymus arenarius', 'Calammophila baltica', 'Festuca villosa', 'Lathyrus japonicus subsp. maritimus', 'Carex arenaria', 'Linaria odora', 'Eryngium maritimum'])
      expect(isCharacteristic2120(n), n).toBe(true)
    expect(isCharacteristic2120('Honckenya peploides')).toBe(false)
    for (const n of ['Cirsium vulgare', 'Sisymbrium officinale', 'Urtica dioica']) expect(isNitrophilous2120(n), n).toBe(true)
    expect(isDuneGrass2120('× Calammophila baltica')).toBe(true)
    expect(isDuneGrass2120('Eryngium maritimum')).toBe(false)
    expect(defaultLayer2120(findSpecies2120('Salix acutifolia')!)).toBe('B')
    expect(defaultLayer2120(findSpecies2120('Ammophila arenaria')!)).toBe('C')
    expect(m.speciesInfo!('Ammophila arenaria')).toBe('gatunek charakterystyczny 2120, trawa wydmotwórcza')
    expect(m.speciesInfo!('Pinus nigra')).toBe('gatunek obcy ekologicznie (nasadzenia)')
    // każdy gatunek z przykładowej karty jest w katalogu
    for (const r of jezioroWicko.releves) for (const s of r.species as { name: string }[]) expect(findSpecies2120(s.name), s.name).toBeDefined()
  })
})

describe('ocena struktury', () => {
  const allFv = (role = ''): CardValues => {
    const v = structuredClone(jezioroWicko)
    v.site.grassesRole = role
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    return v
  }

  it('wszystko FV → FV; jedyny niekardynalny (gatunki char.) U1 → FV, U2 → U1', () => {
    const v = allFv()
    expect(assessCard(m, v)).toMatchObject({ structure: 'FV', overall: 'FV' })
    v.indicators.species.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('FV')
    v.indicators.species.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
  })

  it('kardynalny U1 (nitrofilne, kondycja, zniszczenia) → U1; kardynalny U2 → U2', () => {
    for (const id of ['nitrophilous', 'grasses', 'abrasion', 'damage']) {
      const v = allFv()
      v.indicators[id].grade = 'U1'
      expect(assessCard(m, v).structure, id).toBe('U1')
      v.indicators[id].grade = 'U2'
      expect(assessCard(m, v).structure, id).toBe('U2')
    }
  })

  it('kondycja traw niekardynalna (późny termin): U1 → FV, U2 → U1', () => {
    const v = allFv('late')
    v.indicators.grasses.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('FV')
    v.indicators.grasses.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
  })

  it('gatunki obce nie zmieniają oceny struktury', () => {
    const v = allFv()
    v.indicators.aliens.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('FV')
  })
})

describe('przykład Jezioro Wicko (karta z przewodnika, 2013)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(jezioroWicko)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny jak w karcie: kondycja traw U1, reszta wskaźników FV → struktura FV, perspektywy FV, ogólna FV', () => {
    expect(assessCard(m, jezioroWicko)).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV', missing: [] })
    const grades = Object.fromEntries(Object.entries(jezioroWicko.indicators).map(([id, v]) => [id, v.grade]))
    expect(grades).toEqual({ area: 'FV', species: 'FV', nitrophilous: 'FV', grasses: 'U1', aliens: 'U2', abrasion: 'FV', damage: 'FV' })
  })

  it('bez ustawienia „późny termin” ta sama karta dałaby U1 – kondycja traw jest kardynalna', () => {
    const v = structuredClone(jezioroWicko)
    v.site.grassesRole = ''
    expect(assessCard(m, v)).toMatchObject({ structure: 'U1', overall: 'U1' })
  })

  it('podpowiedzi zgodne z ekspertem', () => {
    const c = ctx({ site: jezioroWicko.site, indicators: jezioroWicko.indicators })
    for (const i of m.indicators) expect(i.suggest!(jezioroWicko.indicators[i.id].inputs, c), i.id).toBe(jezioroWicko.indicators[i.id].grade)
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    const c = ctx({ site: jezioroWicko.site, indicators: jezioroWicko.indicators })
    for (const i of m.indicators) expect(i.describe!(jezioroWicko.indicators[i.id].inputs, c), i.id).toBe(jezioroWicko.indicators[i.id].value)
  })

  it('zanonimizowany wykonawca, 3 zdjęcia, krzewy w warstwie B', () => {
    expect(examples2120).toHaveLength(1)
    expect(jezioroWicko.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(jezioroWicko)).not.toMatch(/Lemke/)
    expect(jezioroWicko.releves).toHaveLength(3)
    expect(jezioroWicko.releves[2]).toMatchObject({ coverB: 40, coverC: 5, heightB: 2, heightC: 30 })
  })
})
