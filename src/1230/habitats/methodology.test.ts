import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { CardValues, Grade, IndicatorContext, InputValues } from '../../7120/habitats/types'
import { allOtherFields } from '../../7120/habitats/types'
import { examples1230, rozewie1 } from './examples'
import {
  gradeBeachHeight1230,
  gradeBeachWidth1230,
  gradeGeodynamics1230,
  gradeRetreat1230,
  gradeShrubs1230,
  gradeSlope1230,
  gradeSpeciesCount1230,
  gradeStability1230,
  gradeTrees1230,
  gradeUndercut1230,
  gradeVegCover1230,
  indicator1230 as ind,
  methodology1230 as m,
} from './methodology'
import { defaultLayer1230, findSpecies1230 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues, c: IndicatorContext = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const grades = (f: (v: number) => Grade, vs: number[]) => vs.map(f)

describe('metodyka 1230 – struktura', () => {
  it('kod 1230 (niepriorytetowe), bez zdjęć fitosocjologicznych, zakładka profilu klifu', () => {
    expect(habitatCode(m)).toBe('1230')
    expect(m.name).toBe('Klify na wybrzeżu Bałtyku')
    expect(emptyCardValues(m).releves).toHaveLength(0)
    expect(m.extraSteps?.map((s) => s.id)).toEqual(['profile'])
    expect(allOtherFields(m).map((f) => f.name)).toContain('profileRanges')
  })

  it('14 wskaźników struktury w kolejności tab. 2 (plus szerokość plaży z tab. 1)', () => {
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
    expect(m.indicators.filter((i) => i.parameter === 'structure').map((i) => i.label)).toEqual([
      'Stabilność ściany klifu',
      'Nachylenie stoku/ściany klifu',
      'Tempo cofania klifu',
      'Zjawiska geodynamiczne na stoku',
      'Stan zachowania dolnej części klifu',
      'Obecność charakterystycznych roślin zielnych',
      'Obecność charakterystycznych krzewów',
      'Obecność drzew',
      'Odnowienia, osobniki juwenilne wśród krzewów i drzew',
      'Liczba gatunków roślin zielnych na stoku',
      'Procent pokrycia stoku roślinnością w stosunku do odkrytych powierzchni',
      'Szerokość plaży',
      'Wysokość plaży (górnej) u podnóża klifu',
      'Zasięg napływu morza na plażę',
    ])
  })

  it('wszystkie wskaźniki struktury równorzędne (kardynalne) – przewodnik nie wyróżnia żadnych', () => {
    for (const i of m.indicators.filter((x) => x.parameter === 'structure')) expect(isCardinal(i, {}), i.id).toBe(true)
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...allOtherFields(m), ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: lipiec–październik bez ostrzeżenia', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2011-10-16')).toBeNull()
    expect(date.warn!('2023-07-01')).toBeNull()
    expect(date.warn!('2010-05-25')).toMatch(/poza optymalnym/)
  })

  it('kody oddziaływań bez duplikatów, z ochroną brzegu, gatunkami obcymi i wydeptywaniem', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['J02.12.01', 'I01', 'G05.01', 'X']) expect(codes).toContain(c)
  })

  it('katalog: grupy i warstwy domyślne', () => {
    expect(findSpecies1230('Tussilago farfara')?.group).toBe('clay')
    expect(findSpecies1230('hippophae rhamnoides')?.group).toBe('shrub')
    expect(findSpecies1230('Robinia pseudoacacia')?.group).toBe('alien')
    expect(defaultLayer1230(findSpecies1230('Fagus sylvatica')!)).toBe('A')
    expect(defaultLayer1230(findSpecies1230('Rosa canina')!)).toBe('B')
    expect(defaultLayer1230(findSpecies1230('Festuca rubra')!)).toBe('C')
  })
})

describe('metodyka 1230 – progi (tab. 2)', () => {
  it('stabilność: <25 U2, 25–50 FV, >50–75 U1, >75 U2', () => {
    expect(grades(gradeStability1230, [0, 24, 25, 50, 51, 75, 76, 100])).toEqual(['U2', 'U2', 'FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })
  it('nachylenie: do 40° FV, 40–50° U1, >50° U2', () => {
    expect(grades(gradeSlope1230, [28, 40, 45, 50, 51, 80])).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })
  it('cofanie: do 0,5 FV, do 1,5 U1, więcej U2', () => {
    expect(grades(gradeRetreat1230, [0, 0.5, 1, 1.5, 2])).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('zjawiska geodynamiczne: 0–1 FV, 2 U1, >2 U2; przeliczenie na 100 m', () => {
    expect(grades(gradeGeodynamics1230, [0, 1, 1.5, 2, 3])).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
    expect(suggest('geodynamics', { landslides: 2, seeps: 1, lengthM: 300 })).toBe('FV')
    expect(suggest('geodynamics', { landslides: 4, seeps: 3, lengthM: 300 })).toBe('U2')
    expect(suggest('geodynamics', { landslides: 2, lengthM: 100 })).toBe('U1')
    expect(suggest('geodynamics', {})).toBeNull()
    expect(ind('geodynamics').explain!({ landslides: 3, seeps: 0, lengthM: 300 })).toMatch(/^1 zjawiska na 100 m/)
  })
  it('podcięcia: do 0,5 FV, do 1,5 U1, więcej U2; ostrzeżenie przy „Brak” i wysokości > 0', () => {
    expect(grades(gradeUndercut1230, [0, 0.5, 1, 1.5, 6])).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
    expect(ind('lowerPart').warn!({ kind: 'none', height: 1 })).toMatch(/Brak podcięć/)
    expect(ind('lowerPart').describe!({ kind: 'none', height: 0 })).toBe('Brak podcięć abrazyjnych')
  })
  it('krzewy >15 FV, 5–15 U1, ≤5 U2; drzewa >10 FV, 1–10 U1, ≤1 U2; liczba ma pierwszeństwo przed wyborem', () => {
    expect(grades(gradeShrubs1230, [16, 15, 6, 5, 0])).toEqual(['FV', 'U1', 'U1', 'U2', 'U2'])
    expect(grades(gradeTrees1230, [11, 10, 2, 1, 0])).toEqual(['FV', 'U1', 'U1', 'U2', 'U2'])
    expect(suggest('shrubs', { choice: 'all' })).toBe('FV')
    expect(suggest('shrubs', { choice: 'all', cover: 3 })).toBe('U2')
    expect(ind('shrubs').warn!({ choice: 'all', cover: 3 }, ctx())).toMatch(/Minimum/)
  })
  it('liczba gatunków: ≥15 FV, 5–14 U1, <5 U2; pusto – liczy listę z roślin zielnych', () => {
    expect(grades(gradeSpeciesCount1230, [15, 14, 5, 4])).toEqual(['FV', 'U1', 'U1', 'U2'])
    const herbs = { inputs: { choice: 'some', species: [{ name: 'Tussilago farfara' }, { name: 'Equisetum arvense' }, { name: 'Dactylis glomerata' }, { name: 'Festuca rubra' }, { name: 'Poa compressa' }] }, value: '', grade: '' as const }
    const c = ctx({ indicators: { herbs } })
    expect(suggest('speciesCount', {}, c)).toBe('U1')
    expect(ind('speciesCount').explain!({}, c)).toMatch(/Policzono 5 gatunków/)
    expect(ind('speciesCount').warn!({ count: 3 }, c)).toMatch(/ma 5 gatunków/)
    expect(ind('herbs').explain!(herbs.inputs)).toMatch(/5 gatunków, w tym 5 charakterystycznych/)
  })
  it('pokrycie stoku: 30–70 FV; 10–30 i 70–90 U1; <10 i >90 U2', () => {
    expect(grades(gradeVegCover1230, [5, 10, 29, 30, 70, 80, 90, 95])).toEqual(['U2', 'U1', 'U1', 'FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('plaża: wysokość ≥2 FV, 1–2 U1, <1 U2; szerokość ≥25 FV, 10–25 U1, <10 U2 (interpretacja)', () => {
    expect(grades(gradeBeachHeight1230, [2.8, 2, 1.5, 1, 0.5])).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
    expect(grades(gradeBeachWidth1230, [30, 25, 12, 10, 8.75, 0])).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })
  it('napływ morza i odnowienia z selectów', () => {
    expect(suggest('surge', { choice: 'none' })).toBe('FV')
    expect(suggest('surge', { choice: 'foot' })).toBe('U2')
    expect(suggest('regeneration', { choice: 'single' })).toBe('U1')
  })
})

describe('metodyka 1230 – agregacja', () => {
  const allFV = (): CardValues => {
    const v = structuredClone(rozewie1)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    return v
  }
  it('same FV → struktura FV', () => {
    expect(assessCard(m, allFV()).structure).toBe('FV')
  })
  it('jedno U1 → U1, jedno U2 → U2', () => {
    const v = allFV()
    v.indicators.slope.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.surge.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U2')
  })
})

describe('przykład Rozewie 1 (karta z przewodnika, 2011)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(rozewie1)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie; podpowiedzi zgodne', () => {
    const c = ctx({ site: rozewie1.site, indicators: rozewie1.indicators })
    for (const i of m.indicators) expect(i.suggest!(rozewie1.indicators[i.id].inputs, c), i.id).toBe(rozewie1.indicators[i.id].grade)
  })

  it('struktura wg reguły ogólnej U2 (w przewodniku FV – ocena eksperta), powierzchnia i perspektywy FV', () => {
    expect(assessCard(m, rozewie1)).toMatchObject({ area: 'FV', structure: 'U2', prospects: 'FV', overall: 'U2', missing: [] })
  })

  it('zanonimizowany obserwator', () => {
    expect(examples1230).toHaveLength(1)
    expect(rozewie1.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(rozewie1)).not.toMatch(/Łabuz|Osóch|Skrzypiński/)
  })
})
