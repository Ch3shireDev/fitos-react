import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { CardValues, Grade, IndicatorContext, InputValues } from '../../7120/habitats/types'
import { examples1210, orzechowo } from './examples'
import {
  gradeAliens1210,
  gradeCoverage1210,
  gradeDamage1210,
  gradeLitter1210,
  gradeWaves1210,
  indicator1210 as ind,
  methodology1210 as m,
} from './methodology'
import { defaultLayer1210, findSpecies1210, isCharacteristic1210 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, ctx())
const sp = (...names: string[]) => names.map((name) => ({ name }))

describe('metodyka 1210 – struktura', () => {
  it('kod 1210 (nie priorytetowe), transekt 400×20 m, 3 spisy po 2 m²', () => {
    expect(habitatCode(m)).toBe('1210')
    expect(m.name).toBe('Kidzina na brzegu morskim')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('400x20 m')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(2)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności tab. 2', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Gatunki charakterystyczne',
      'Procent powierzchni zajęty przez siedlisko na transekcie',
      'Naturalna działalność fal i sztormów',
      'Występowanie gatunków obcych ekologicznie lub geograficznie',
      'Zniszczenia mechaniczne',
      'Zaśmiecenie',
    ])
  })

  it('kardynalne: gatunki charakterystyczne, zniszczenia mechaniczne, zaśmiecenie; nic pominiętego', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['species', 'damage', 'litter'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('nazwy z SI MGSP podane w opisach (inaczej niż w przewodniku)', () => {
    expect(ind('coverage').description).toMatch(/Pokrycie transektu przez kidzinę/)
    expect(ind('aliens').description).toMatch(/Gatunki obce geograficznie/)
    expect(ind('litter').description).toMatch(/Inne zniekształcenia/)
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
    expect(date.warn!('2013-09-18')).toBeNull()
    expect(date.warn!('2024-06-01')).toBeNull()
    expect(date.warn!('2024-10-31')).toBeNull()
    expect(date.warn!('2024-05-20')).toMatch(/poza optymalnym/)
    expect(date.warn!('2024-11-02')).toMatch(/poza optymalnym/)
  })

  it('kody oddziaływań bez duplikatów, z oczyszczaniem plaż, umocnieniami brzegu i sztormem', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['G05.05', 'J02.12.01', 'J02.05.06', 'H03.03', 'L07', 'X']) expect(codes).toContain(c)
  })
})

describe('metodyka 1210 – progi', () => {
  it('procent transektu: >30 FV, 10–30 U1 (granice do U1), <10 U2', () => {
    expect([100, 30.1, 30, 10, 9.9, 0].map(gradeCoverage1210)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('procent transektu: wpisany % > długości odcinków > klasa', () => {
    expect(suggest('coverage', { segments: 60, length: 400 })).toBe('U1')
    expect(ind('coverage').explain!({ segments: 60, length: 400 }, ctx())).toBe('60 m z 400 m transektu = 15%.')
    expect(ind('coverage').describe!({ segments: 60, length: 400 }, ctx())).toBe('15% transektu')
    expect(suggest('coverage', { segments: 60, length: 400, value: 50 })).toBe('FV')
    expect(suggest('coverage', { choice: 'below10' })).toBe('U2')
    expect(suggest('coverage', { length: 400 })).toBeNull()
    expect(ind('coverage').warn!({ value: 50, choice: 'below10' }, ctx())).toMatch(/nie pasuje/)
    expect(ind('coverage').warn!({ segments: 500, length: 400 }, ctx())).toMatch(/100%/)
  })

  it('fale: do 30% FV, powyżej U1, cały transekt U2; brak ograniczeń FV', () => {
    expect([0, 30, 31, 99, 100].map(gradeWaves1210)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
    expect(['none', 'minor', 'part', 'whole'].map((choice) => suggest('waves', { choice }))).toEqual(['FV', 'FV', 'U1', 'U2'])
    expect(suggest('waves', { choice: 'none', value: 40 })).toBe('U1')
    expect(ind('waves').warn!({ choice: 'none', value: 40 }, ctx())).toMatch(/nie pasuje/)
  })

  it('zniszczenia i zaśmiecenie: <10 FV, 10–50 U1, >50 U2', () => {
    for (const g of [gradeDamage1210, gradeLitter1210]) expect([0, 9.9, 10, 50, 50.1].map(g)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
    expect(suggest('damage', { choice: 'most' })).toBe('U2')
    expect(suggest('litter', { choice: 'below10', value: 30 })).toBe('U1')
    expect(ind('litter').warn!({ choice: 'below10', value: 30 }, ctx())).toMatch(/30% to klasa „Śmiecie stanowią istotną część osadów na licznych/)
    expect(ind('damage').describe!({ choice: 'part', value: 20 }, ctx())).toBe('Część płatów kidziny zniszczona (od 10 do 50%); 20% płatów')
    expect(ind('damage').describe!({ choice: 'below10', note: 'brak' }, ctx())).toBe('brak')
  })

  it('gatunki obce z listy: 1 nieekspansywny U1, 1 ekspansywny U2, 2+ U2, pusta lista – brak podpowiedzi', () => {
    expect(gradeAliens1210([])).toBeNull()
    expect(gradeAliens1210(['Xanthium albinum'])).toBe('U1')
    expect(gradeAliens1210(['Rosa rugosa'])).toBe('U2')
    expect(gradeAliens1210(['Xanthium albinum', 'Bidens frondosa'])).toBe('U2')
    expect(gradeAliens1210(['Xanthium albinum', 'xanthium  ALBINUM'])).toBe('U1')
  })

  it('gatunki obce: ostrzeżenia przy niezgodności wyboru z listą', () => {
    const w = (species: { name: string }[], choice: string) => ind('aliens').warn!({ species, choice }, ctx())
    expect(w(sp('Xanthium albinum'), 'none')).toMatch(/„Brak”/)
    expect(w(sp('Rosa rugosa'), 'single')).toMatch(/U2/)
    expect(w(sp('Rosa rugosa'), 'expansive')).toBeNull()
    expect(w(sp('Xanthium albinum'), 'single')).toBeNull()
    expect(w([], 'none')).toBeNull()
    expect(ind('aliens').explain!({ species: sp('Rosa rugosa', 'Xanthium albinum') }, ctx())).toBe('Gatunków obcych na liście: 2, ekspansywne: Rosa rugosa.')
    expect(ind('aliens').describe!({ species: [], choice: 'none' }, ctx())).toBe('nie stwierdzono')
  })

  it('gatunki charakterystyczne: ocena z wyboru, ostrzeżenia przy liście bez gatunków z tab. 1', () => {
    expect(['over50', 'below50', 'sporadic'].map((choice) => suggest('species', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(ind('species').warn!({ species: sp('Polygonum aviculare'), choice: 'over50' }, ctx())).toMatch(/żadnego z 6 gatunków/)
    expect(ind('species').warn!({ species: sp('Cakile maritima', 'Tussilago farfara'), choice: 'below50' }, ctx())).toMatch(/Tussilago farfara/)
    expect(ind('species').warn!({ species: sp('Cakile maritima'), choice: 'below50' }, ctx())).toBeNull()
    expect(ind('species').explain!({ species: sp('Cakile maritima', 'Salsola kali', 'Tussilago farfara') }, ctx())).toBe(
      'Gatunków charakterystycznych na liście: 2 z 3.',
    )
  })

  it('powierzchnia: wybór z oceną, „brak danych” → XX, puste → ocena eksperta', () => {
    expect(['stable', 'smallDecrease', 'clearDecrease', 'unknown'].map((choice) => suggest('area', { choice }))).toEqual(['FV', 'U1', 'U2', 'XX'])
    expect(suggest('area', { areaHa: 0.01 })).toBeNull()
    expect(ind('area').describe!({ choice: 'smallDecrease', areaHa: 0.02 }, ctx())).toBe('0,02 ha; niewielki spadek powierzchni siedliska')
  })

  it('katalog: 6 gatunków charakterystycznych (z synonimami), warstwy, etykiety', () => {
    for (const n of ['Atriplex calotheca', 'Atriplex littoralis', 'Atriplex prostrata', 'Cakile maritima', 'Matricaria maritima', 'Salsola kali'])
      expect(isCharacteristic1210(n), n).toBe(true)
    expect(isCharacteristic1210('Tripleurospermum maritimum')).toBe(true)
    expect(isCharacteristic1210('Tussilago farfara')).toBe(false)
    expect(defaultLayer1210(findSpecies1210('Rosa rugosa')!)).toBe('B')
    expect(defaultLayer1210(findSpecies1210('Cakile maritima')!)).toBe('C')
    expect(m.speciesInfo!('Reynoutria japonica')).toBe('gatunek obcy geograficznie, ekspansywny')
    expect(m.speciesInfo!('Hippophaë rhamnoides')).toBe('gatunek obcy ekologicznie (nasadzenia)')
  })
})

describe('ocena struktury', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(orzechowo)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    v.prospects.grade = 'FV'
    return v
  }

  it('wszystko FV → FV; niekardynalny U2 (procent transektu) → struktura U1', () => {
    const v = allFv()
    expect(assessCard(m, v)).toMatchObject({ structure: 'FV', overall: 'FV' })
    v.indicators.coverage.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
  })

  it('kardynalny U2 (zaśmiecenie) → struktura U2', () => {
    const v = allFv()
    v.indicators.litter.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U2')
  })
})

describe('przykład Orzechowo (karta z przewodnika, 2013)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(orzechowo)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny jak w karcie: powierzchnia U2, struktura U1, perspektywy XX, ogólna U2', () => {
    expect(assessCard(m, orzechowo)).toMatchObject({ area: 'U2', structure: 'U1', prospects: 'XX', overall: 'U2', missing: [] })
  })

  it('podpowiedzi zgodne z ekspertem; powierzchnia bez trendu – bez podpowiedzi', () => {
    const c = ctx({ site: orzechowo.site, indicators: orzechowo.indicators })
    for (const i of m.indicators) {
      const s = i.suggest!(orzechowo.indicators[i.id].inputs, c)
      if (i.id === 'area') expect(s).toBeNull()
      else expect(s, i.id).toBe(orzechowo.indicators[i.id].grade)
    }
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    const c = ctx({ site: orzechowo.site, indicators: orzechowo.indicators })
    for (const i of m.indicators) expect(i.describe!(orzechowo.indicators[i.id].inputs, c), i.id).toBe(orzechowo.indicators[i.id].value)
  })

  it('zanonimizowany wykonawca, bez dodatkowego eksperta, 3 spisy', () => {
    expect(examples1210).toHaveLength(1)
    expect(orzechowo.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(orzechowo)).not.toMatch(/Stańko|Horabik|Ogrodniczuk|Mróz/)
    expect(orzechowo.releves).toHaveLength(3)
  })
})
