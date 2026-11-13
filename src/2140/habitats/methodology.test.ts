import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { CardValues, Grade, IndicatorContext, InputValues } from '../../7120/habitats/types'
import { czolpino, examples2140 } from './examples'
import {
  gradeCombination2140,
  gradeCoverBB2140,
  gradeNitrophilous2140,
  gradeTrees2140,
  indicator2140 as ind,
  methodology2140 as m,
} from './methodology'
import { defaultLayer2140, findSpecies2140, isExpansive2140, isShrub2140 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues, c = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const sp = (...names: string[]) => names.map((name) => ({ name }))
const spc = (...rows: [string, number][]) => rows.map(([name, cover]) => ({ name, cover }))

describe('metodyka 2140 – struktura', () => {
  it('kod *2140 (priorytetowe), 3 zdjęcia po 9 m², powierzchnia w m²', () => {
    expect(habitatCode(m)).toBe('*2140')
    expect(m.name).toBe('Nadmorskie wrzosowiska bażynowe')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(9)
    expect(m.siteFields.find((f) => f.name === 'areaM2')).toMatchObject({ unit: 'm²', required: true })
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności tab. 1', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Charakterystyczna kombinacja florystyczna',
      'Obce gatunki inwazyjne',
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Gatunki nitrofilne',
      'Stan populacji gatunków wskaźnikowych: bażyny czarnej Empetrum nigrum i wrzosu zwyczajnego Calluna vulgaris',
      'Występowanie abrazji',
      'Obecność nalotu drzew',
      'Zniszczenia mechaniczne',
    ])
  })

  it('kardynalne: 7 z 8 wskaźników struktury (wszystkie poza obcymi inwazyjnymi); nic pominiętego', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual([
      'combination',
      'expansive',
      'nitrophilous',
      'vitality',
      'abrasion',
      'trees',
      'damage',
    ])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...m.otherFields, ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: lipiec – połowa sierpnia, poza tym ostrzeżenie', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2008-08-07')).toBeNull()
    expect(date.warn!('2024-07-01')).toBeNull()
    expect(date.warn!('2024-08-15')).toBeNull()
    expect(date.warn!('2024-08-16')).toMatch(/poza optymalnym/)
    expect(date.warn!('2018-06-06')).toMatch(/poza optymalnym/)
    expect(date.warn!('2014-10-01')).toMatch(/poza optymalnym/)
  })

  it('kody oddziaływań bez duplikatów, z sukcesją, abrazją, sztormem, zalesianiem i wydeptywaniem', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['B01', 'G05.01', 'K01.01', 'K02.01', 'L07', 'I01', 'X']) expect(codes).toContain(c)
  })
})

describe('metodyka 2140 – progi', () => {
  it('obce i ekspansywne: brak FV, łącznie Br.-Bl. ≤1 (<5%) U1, >1 (≥5%) U2', () => {
    expect(gradeCoverBB2140(0, 0)).toBe('FV')
    expect(gradeCoverBB2140(1, 0.5)).toBe('U1')
    expect(gradeCoverBB2140(3, 4.9)).toBe('U1')
    expect(gradeCoverBB2140(1, 5)).toBe('U2')
    expect(gradeCoverBB2140(2, 10)).toBe('U2')
  })

  it('obce: lista z pokryciem > wybór; lista bez pokrycia → wybór; ostrzeżenia', () => {
    expect(suggest('aliens', { species: spc(['Rosa rugosa', 1], ['Pinus nigra', 2]), choice: 'high' })).toBe('U1')
    expect(suggest('aliens', { species: spc(['Pinus nigra', 10]) })).toBe('U2')
    expect(suggest('aliens', { species: sp('Rosa rugosa'), choice: 'low' })).toBe('U1')
    expect(suggest('aliens', { species: [], choice: 'none' })).toBe('FV')
    expect(suggest('aliens', {})).toBeNull()
    const w = (i: InputValues) => ind('aliens').warn!(i, ctx())
    expect(w({ species: sp('Rosa rugosa'), choice: 'none' })).toMatch(/„Brak”/)
    expect(w({ species: sp('Empetrum nigrum') })).toMatch(/rodzime: Empetrum nigrum/)
    expect(w({ species: spc(['Pinus nigra', 10]), choice: 'low' })).toMatch(/to U2, a wybrano U1/)
    expect(ind('aliens').explain!({ species: spc(['Pinus nigra', 10]) }, ctx())).toMatch(/10% \(Br\.-Bl\. powyżej 1\)/)
    expect(ind('aliens').describe!({ species: [], choice: 'none' }, ctx())).toBe('Brak')
    expect(ind('aliens').describe!({ species: spc(['Rosa rugosa', 1]) }, ctx())).toBe('Rosa rugosa 1%')
  })

  it('ekspansywne: piaskownica i trzcinnik w katalogu; gatunki wydmowe – ostrzeżenie', () => {
    expect(suggest('expansive', { species: spc(['Ammophila arenaria', 15]) })).toBe('U2')
    expect(suggest('expansive', { species: spc(['Ammophila arenaria', 2]) })).toBe('U1')
    expect(isExpansive2140('Calamagrostis epigejos')).toBe(true)
    expect(ind('expansive').warn!({ species: sp('Carex arenaria') }, ctx())).toMatch(/ekotonie/)
  })

  it('nitrofilne: 0 FV; 1–2 gatunki <5% U1; któryś ≥5% albo >2 gatunki U2; brak pokrycia = pojedyncze', () => {
    expect(gradeNitrophilous2140([])).toBe('FV')
    expect(gradeNitrophilous2140([1])).toBe('U1')
    expect(gradeNitrophilous2140([undefined, 2])).toBe('U1')
    expect(gradeNitrophilous2140([5])).toBe('U2')
    expect(gradeNitrophilous2140([1, 1, 1])).toBe('U2')
    expect(suggest('nitrophilous', { species: sp('Chamaenerion angustifolium') })).toBe('U1')
    expect(suggest('nitrophilous', { species: sp('Solidago virgaurea', 'Urtica urens', 'Urtica dioica') })).toBe('U2')
    expect(suggest('nitrophilous', { species: [], choice: 'none' })).toBe('FV')
    expect(ind('nitrophilous').warn!({ species: sp('Rumex acetosella') }, ctx())).toMatch(/Rumex acetosella/)
  })

  it('nalot drzew: <1% FV, 1–10% U1, >10% U2; pokrycie > wybór', () => {
    expect([0, 0.5, 1, 10, 10.5, 40].map(gradeTrees2140)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
    expect(suggest('trees', { cover: 20, choice: 'none' })).toBe('U2')
    expect(suggest('trees', { choice: 'sparse' })).toBe('U1')
    expect(ind('trees').warn!({ cover: 20, choice: 'none' }, ctx())).toMatch(/to U2, a wybrano FV/)
    expect(ind('trees').warn!({ species: sp('Calluna vulgaris') }, ctx())).toMatch(/niedrzewiaste: Calluna vulgaris/)
    expect(ind('trees').describe!({ species: spc(['Pinus sylvestris', 5]), cover: 5 }, ctx())).toBe('Pinus sylvestris 5%; nalot 5% płatu')
  })

  it('kombinacja florystyczna: ≥2 krzewinki z bażyną + mchy ≥50% + bez nalotu FV; reszta wg tab. 2', () => {
    const g = (shrubs: number, empetrum: boolean, mossCover: number, trees = false) => gradeCombination2140({ shrubs, empetrum, mossCover, trees })
    expect(g(2, true, 60)).toBe('FV')
    expect(g(2, true, 60, true)).toBe('U1')
    expect(g(2, false, 60)).toBe('U1')
    expect(g(1, true, 50)).toBe('U1')
    expect(g(2, true, 30)).toBe('U1')
    expect(g(1, true, 0)).toBe('U2')
    expect(g(0, false, 80)).toBe('U2')
  })

  it('kombinacja florystyczna: liczy z listy i mchów, nalot z drugiego wskaźnika odbiera FV', () => {
    const i = { species: sp('Empetrum nigrum', 'Calluna vulgaris', 'Pleurozium schreberi'), mossCover: 70 }
    expect(suggest('combination', i)).toBe('FV')
    const withTrees = ctx({ indicators: { trees: { inputs: { cover: 5 }, value: '', grade: 'U1' } } })
    expect(suggest('combination', i, withTrees)).toBe('U1')
    expect(ind('combination').explain!(i, withTrees)).toMatch(/Krzewinek na liście: 2 \(w tym bażyna\).*bez FV/)
    expect(suggest('combination', { species: sp('Carex arenaria', 'Ammophila arenaria') })).toBe('U2')
    expect(suggest('combination', { species: sp('Empetrum nigrum'), choice: 'reduced' })).toBe('U1')
    expect(suggest('combination', { choice: 'vanishing' })).toBe('U2')
    expect(ind('combination').warn!({ ...i, choice: 'vanishing' }, ctx())).toMatch(/to FV, a wybrano U2/)
  })

  it('stan populacji: >50% pędów bez liści U2, brak wrzosu i bażyny U2, poza tym z wyboru; opis jak w karcie', () => {
    expect(['good', 'ageing', 'poor'].map((choice) => suggest('vitality', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(suggest('vitality', { choice: 'good', leaflessPct: 60 })).toBe('U2')
    expect(suggest('vitality', { choice: 'ageing', leaflessPct: 50 })).toBe('U1')
    expect(suggest('vitality', { callunaCover: 0, empetrumCover: 0, choice: 'good' })).toBe('U2')
    expect(ind('vitality').warn!({ choice: 'good', leaflessPct: 10 }, ctx())).toMatch(/bez liści/)
    expect(ind('vitality').warn!({ choice: 'good', buried: 'yes' }, ctx())).toMatch(/zasypywane piaskiem/)
    expect(ind('vitality').describe!({ callunaCover: 2, empetrumCover: 4, choice: 'ageing' }, ctx())).toMatch(
      /^Powierzchnia pokrycia w transekcie: wrzos zwyczajny Calluna vulgaris 2%, bażyna czarna Empetrum nigrum 4%\. Starzenie się płatów/,
    )
  })

  it('abrazja, zniszczenia, powierzchnia: z wyboru; stanowisko w głębi lądu FV', () => {
    expect(['accumulative', 'inland', 'rare', 'cliff'].map((choice) => suggest('abrasion', { choice }))).toEqual(['FV', 'FV', 'U1', 'U2'])
    expect(['none', 'paths', 'aeolian'].map((choice) => suggest('damage', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(['stable', 'other', 'clearDecrease', 'unknown'].map((choice) => suggest('area', { choice }))).toEqual(['FV', 'U1', 'U2', 'XX'])
    expect(ind('area').describe!({ choice: 'clearDecrease', areaM2: 40 }, ctx())).toMatch(/^40 m²; wyraźny spadek/)
  })

  it('katalog: krzewinki, warstwy, etykiety', () => {
    for (const n of ['Empetrum nigrum', 'Calluna vulgaris', 'Vaccinium vitis-idaea']) expect(isShrub2140(n), n).toBe(true)
    expect(isShrub2140('Salix repens subsp. arenaria')).toBe(false)
    expect(defaultLayer2140(findSpecies2140('Dicranum scoparium')!)).toBe('D')
    expect(defaultLayer2140(findSpecies2140('Pinus sylvestris')!)).toBe('B')
    expect(defaultLayer2140(findSpecies2140('Empetrum nigrum')!)).toBe('C')
    expect(m.speciesInfo!('Empetrum nigrum')).toBe('krzewinka, kombinacja florystyczna 2140')
    expect(m.speciesInfo!('Ammophila arenaria')).toBe('roślina zielna, kombinacja florystyczna 2140, ekspansywny')
  })
})

describe('ocena struktury (7 kardynalnych z 8)', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(czolpino)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    return v
  }

  it('niekardynalny (obce) U2 → struktura U1', () => {
    const v = allFv()
    v.indicators.aliens.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
  })

  it('kardynalny U1 (nalot drzew) → U1; kardynalny U2 (zniszczenia) → U2 i ocena ogólna U2', () => {
    const v = allFv()
    v.indicators.trees.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.damage.grade = 'U2'
    expect(assessCard(m, v)).toMatchObject({ structure: 'U2', overall: 'U2' })
  })
})

describe('przykład Czołpino (karta z przewodnika, 2008)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(czolpino)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny jak w karcie: wszystko FV, ocena ogólna FV', () => {
    expect(assessCard(m, czolpino)).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV', missing: [] })
    for (const id of Object.keys(czolpino.indicators)) expect(czolpino.indicators[id].grade, id).toBe('FV')
  })

  it('podpowiedzi zgodne z ekspertem', () => {
    const c = ctx({ site: czolpino.site, indicators: czolpino.indicators })
    for (const i of m.indicators) expect(i.suggest!(czolpino.indicators[i.id].inputs, c), i.id).toBe(czolpino.indicators[i.id].grade)
  })

  it('pole „wartość” = opis wygenerowany z pomiarów (teksty z karty)', () => {
    const c = ctx({ site: czolpino.site, indicators: czolpino.indicators })
    for (const i of m.indicators) expect(i.describe!(czolpino.indicators[i.id].inputs, c), i.id).toBe(czolpino.indicators[i.id].value)
    expect(czolpino.indicators.vitality.value).toBe(
      'Powierzchnia pokrycia w transekcie: wrzos zwyczajny Calluna vulgaris 2%, bażyna czarna Empetrum nigrum 4%. Żywotność bardzo dobra i dobra, bujny wzrost, osobniki kwitnące i owocujące',
    )
  })

  it('zdjęcia jak w karcie: 9, 25 i 9 m², zwarcia C/D, gatunki', () => {
    expect(czolpino.releves.map((r) => [r.area, r.coverC, r.coverD])).toEqual([
      [9, 50, 40],
      [25, 20, 80],
      [9, 100, 40],
    ])
    expect(czolpino.releves.map((r) => (r.species as unknown[]).length)).toEqual([13, 9, 8])
  })

  it('zanonimizowany wykonawca, jeden przykład', () => {
    expect(examples2140).toHaveLength(1)
    expect(czolpino.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(czolpino)).not.toMatch(/Braun/)
  })
})
