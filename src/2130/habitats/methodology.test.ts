import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { Grade, IndicatorContext, InputValues } from '../../7120/habitats/types'
import { examples2130, przebrno } from './examples'
import {
  characteristicCount2130,
  describeList2130,
  gradeCoverBB2130,
  gradeFlora2130,
  gradeNitrophilous2130,
  gradeTrees2130,
  indicator2130 as ind,
  methodology2130 as m,
} from './methodology'
import { defaultLayer2130, findSpecies2130, hasRole2130 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, ctx())
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => ({ name, cover }))

describe('metodyka 2130 – struktura', () => {
  it('kod *2130 (priorytetowe), transekt 10×200 m, 3 zdjęcia po 25 m²', () => {
    expect(habitatCode(m)).toBe('*2130')
    expect(m.name).toBe('Nadmorskie wydmy szare')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('10x200 m')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(m.releves.fields.map((f) => f.name)).toEqual(expect.arrayContaining(['coverC', 'coverD', 'heightC', 'heightD']))
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności karty z przewodnika', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Charakterystyczna kombinacja florystyczna',
      'Gatunki dominujące',
      'Obce gatunki inwazyjne',
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Gatunki nitrofilne',
      'Obecność nalotu drzew',
      'Obecność krzewów i krzewinek',
      'Występowanie procesów eolicznych',
      'Występowanie abrazji',
      'Zniszczenia mechaniczne',
    ])
  })

  it('6 kardynalnych z listy pod tab. 2; dominujące i procesy eoliczne poza oceną; 8 ocenianych jak w sprawozdaniach', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['flora', 'expansive', 'nitrophilous', 'trees', 'abrasion', 'damage'])
    expect(m.indicators.filter((i) => isExcluded(i, {})).map((i) => i.id)).toEqual(['dominant', 'eolian'])
    expect(m.indicators.filter((i) => i.parameter === 'structure' && !isExcluded(i, {}))).toHaveLength(8)
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...m.otherFields, ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: ostrzeżenie poza czerwcem–sierpniem', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2008-07-02')).toBeNull()
    expect(date.warn!('2024-06-19')).toBeNull()
    expect(date.warn!('2024-08-25')).toBeNull()
    expect(date.warn!('2024-05-20')).toMatch(/poza optymalnym/)
    expect(date.warn!('2024-09-10')).toMatch(/poza optymalnym/)
  })

  it('kody oddziaływań bez duplikatów, z zalesianiem, wydeptywaniem, sukcesją, erozją i sztormem', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['B01', 'G05.01', 'G05.07', 'I01', 'I02', 'K01.01', 'K02.01', 'L07', 'X']) expect(codes).toContain(c)
  })
})

describe('metodyka 2130 – progi', () => {
  it('pokrycie w skali Br.-Bl.: 0 FV, <5% (najwyżej 1) U1, ≥5% (powyżej 1) U2', () => {
    expect([0, 0.5, 4.9, 5, 30].map(gradeCoverBB2130)).toEqual(['FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('nalot drzew: pojedyncze siewki sosny FV, inne drzewa albo więcej – U1/U2', () => {
    expect(gradeTrees2130(0, false)).toBe('FV')
    expect(gradeTrees2130(0.5, true)).toBe('FV')
    expect(gradeTrees2130(0.5, false)).toBe('U1')
    expect(gradeTrees2130(4, true)).toBe('U1')
    expect(gradeTrees2130(5, true)).toBe('U2')
  })

  it('nitrofilne: 0 FV, 1–2 gatunki <5% U1, >2 gatunki albo któryś ≥5% U2', () => {
    expect(gradeNitrophilous2130(0)).toBe('FV')
    expect(gradeNitrophilous2130(2, 4)).toBe('U1')
    expect(gradeNitrophilous2130(1, 5)).toBe('U2')
    expect(gradeNitrophilous2130(3, 1)).toBe('U2')
    expect(gradeNitrophilous2130(3)).toBe('U2')
    expect(gradeNitrophilous2130(1)).toBeNull()
  })

  it('kombinacja florystyczna: ≥3 gat. + warstwa D >50% FV; ≥2 U1; <2 albo niszczona warstwa U2', () => {
    expect(gradeFlora2130(3, 75)).toBe('FV')
    expect(gradeFlora2130(3, 50)).toBe('U1')
    expect(gradeFlora2130(5, 20)).toBe('U1')
    expect(gradeFlora2130(2, 90)).toBe('U1')
    expect(gradeFlora2130(1, 90)).toBe('U2')
    expect(gradeFlora2130(4, 80, true)).toBe('U2')
    expect(gradeFlora2130(3)).toBeNull()
  })

  it('gatunki charakterystyczne: odmiany liczą się raz, porosty i gatunki spoza tab. 1 – wcale', () => {
    expect(characteristicCount2130(sp(['Jasione montana'], ['Jasione montana var. litoralis'], ['Helichrysum arenarium']))).toBe(2)
    expect(characteristicCount2130(sp(['Hieracium umbellatum var. dunense'], ['Cladonia furcata'], ['Festuca polesica']))).toBe(1)
    expect(suggest('flora', { species: sp(['Jasione montana'], ['Carex arenaria'], ['Corynephorus canescens']), cryptoCover: 60 })).toBe('FV')
    expect(suggest('flora', { species: sp(['Jasione montana'], ['Carex arenaria'], ['Corynephorus canescens']), cryptoCover: 60, choice: 'damaged' })).toBe('U2')
    expect(ind('flora').warn!({ species: sp(['Festuca polesica']) }, ctx())).toMatch(/Festuca polesica/)
    expect(ind('flora').explain!({ species: sp(['Jasione montana'], ['Carex arenaria'], ['Corynephorus canescens']) }, ctx())).toMatch(/Wpisz pokrycie/)
  })

  it('obce i ekspansywne: suma pokryć z listy ma pierwszeństwo przed klasą', () => {
    expect(suggest('aliens', { species: sp(['Rosa rugosa', 3], ['Salix acutifolia', 3]), choice: 'low' })).toBe('U2')
    expect(ind('aliens').warn!({ species: sp(['Rosa rugosa', 3], ['Salix acutifolia', 3]), choice: 'low' }, ctx())).toMatch(/U2/)
    expect(suggest('aliens', { species: sp(['Rosa rugosa']), choice: 'low' })).toBe('U1')
    expect(suggest('aliens', { species: [], choice: 'none' })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Ammophila arenaria', 2], ['Aira praecox', 1]) })).toBe('U1')
    expect(ind('expansive').warn!({ species: sp(['Rosa rugosa', 1]) }, ctx())).toMatch(/Spoza listy/)
  })

  it('krzewy: liczy się największe pokrycie jednego gatunku', () => {
    expect(suggest('shrubs', { species: sp(['Calluna vulgaris', 3], ['Empetrum nigrum', 4]) })).toBe('U1')
    expect(suggest('shrubs', { species: sp(['Salix daphnoides', 20]) })).toBe('U2')
  })

  it('wartość w karcie: polska + łacińska nazwa, porosty z „(d)”', () => {
    expect(describeList2130(sp(['Lathyrus japonicus subsp. maritimus', 40], ['Brachythecium albicans', 50]))).toBe(
      'Groszek nadmorski Lathyrus japonicus subsp. maritimus 40%, krótkosz bielejący Brachythecium albicans (d) 50%',
    )
    expect(ind('eolian').describe!({ choice: 'slight', percent: 100, note: 'Nieznaczne nawiewanie piasku' }, ctx())).toBe('Nieznaczne nawiewanie piasku (100%)')
    expect(ind('aliens').describe!({ species: [], choice: 'none' }, ctx())).toBe('Brak')
  })
})

describe('gatunki 2130', () => {
  it('role: piaskownica charakterystyczna i ekspansywna, przymiotno nitrofilne i obce', () => {
    expect(hasRole2130('Ammophila arenaria', 'characteristic')).toBe(true)
    expect(hasRole2130('Ammophila arenaria', 'expansive')).toBe(true)
    expect(hasRole2130('Conyza canadensis', 'nitrophilous')).toBe(true)
    expect(hasRole2130('Conyza canadensis', 'alien')).toBe(true)
    expect(findSpecies2130('Viola tricolor subsp. maritima')?.roles).toEqual(['characteristic'])
  })

  it('warstwy: porosty i mszaki D, drzewa i krzewy B, krzewinki i zielne C', () => {
    expect(defaultLayer2130(findSpecies2130('Cladonia furcata')!)).toBe('D')
    expect(defaultLayer2130(findSpecies2130('Pinus sylvestris')!)).toBe('B')
    expect(defaultLayer2130(findSpecies2130('Empetrum nigrum')!)).toBe('C')
    expect(defaultLayer2130(findSpecies2130('Jasione montana')!)).toBe('C')
  })

  it('katalog bez duplikatów nazw', () => {
    const names = m.speciesCatalog!.map((s) => s.value)
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('przykład z przewodnika – Przebrno/Siekierki 2008', () => {
  it('jest jedynym przykładem i przechodzi walidację', () => {
    expect(examples2130.map((e) => e.id)).toEqual(['przebrno'])
    expect(buildCardSchema(m).safeParse(przebrno).success).toBe(true)
  })

  it('wszystkie oceny FV jak w karcie: struktura FV, perspektywy FV, ogólna FV', () => {
    for (const [id, v] of Object.entries(przebrno.indicators)) expect(v.grade, id).toBe('FV')
    expect(assessCard(m, przebrno)).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV', missing: [] })
  })

  it('podpowiedzi wg tab. 2 zgodne z kartą poza nitrofilnymi i nalotem (karta łagodniejsza niż progi)', () => {
    const got = Object.fromEntries(m.indicators.map((i) => [i.id, i.suggest?.(przebrno.indicators[i.id].inputs, ctx({ site: przebrno.site })) ?? null]))
    expect(got).toEqual({
      area: 'FV',
      flora: 'FV',
      dominant: 'FV',
      aliens: 'FV',
      expansive: 'FV',
      nitrophilous: 'U2',
      trees: 'U2',
      shrubs: 'FV',
      eolian: 'FV',
      abrasion: 'FV',
      damage: 'FV',
    })
  })

  it('wartości z pomiarów odtwarzają tekst karty tam, gdzie karta nie ma „do 5%”', () => {
    for (const id of ['area', 'flora', 'dominant', 'aliens', 'expansive', 'shrubs', 'eolian', 'abrasion', 'damage']) {
      expect(ind(id).describe!(przebrno.indicators[id].inputs, ctx()), id).toBe(przebrno.indicators[id].value)
    }
  })

  it('zdjęcia: 3 × 25 m², zwarcie C/D jak w karcie, porosty w warstwie D', () => {
    expect(przebrno.releves.map((r) => [r.area, r.coverC, r.coverD])).toEqual([
      [25, 50, 75],
      [25, 50, 75],
      [25, 60, 80],
    ])
    const species = przebrno.releves.flatMap((r) => r.species as { layer: string; name: string }[])
    expect(species.filter((s) => s.layer === 'D').every((s) => hasRole2130(s.name, 'cryptogam'))).toBe(true)
    expect(przebrno.site.observer).toBe('Jan Kowalski')
  })
})
