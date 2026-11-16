import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { borNaCzerwonem as bor, examples7150 } from './examples'
import {
  gradeAliens7150,
  gradeBarePeat7150,
  gradeCharacteristic7150,
  gradeExpansive7150,
  gradeMosses7150,
  gradeShare7150,
  gradeWater7150,
  gradeWoody7150,
  indicator7150 as ind,
  methodology7150 as m,
} from './methodology'
import { SPECIES_7150, defaultLayer7150, findSpecies7150, isCharacteristic7150, speciesKey7150 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues, c = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const warn = (id: string, inputs: InputValues, c = ctx()) => ind(id).warn?.(inputs, c) ?? null
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => (cover === undefined ? { name } : { name, cover }))

describe('metodyka 7150 – struktura', () => {
  it('kod 7150 (nie priorytetowe), 3 zdjęcia po 25 m², podtyp opcjonalny, transekt 200x10 m', () => {
    expect(habitatCode(m)).toBe('7150')
    expect(m.priority).toBeFalsy()
    expect(m.name).toBe('Obniżenia na podłożu torfowym z roślinnością ze związku Rhynchosporion')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(m.siteFields.find((f) => f.name === 'subtype')?.required).toBeFalsy()
    expect(m.siteFields.find((f) => f.name === 'transect')?.defaultValue).toBe('200x10 m')
    expect(m.siteFields.filter((f) => f.group === 'Współrzędne geograficzne').map((f) => f.name)).toEqual(['coordStart', 'coordMiddle', 'coordEnd'])
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności karty przykładowej: powierzchnia + 13 struktury', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Procent powierzchni zajęty przez siedlisko na transekcie',
      'Struktura przestrzenna płatów siedliska',
      'Gatunki charakterystyczne',
      'Gatunki dominujące',
      'Odsłonięty torf',
      'Pokrycie i struktura gatunkowa mszaków',
      'Obce gatunki inwazyjne',
      'Gatunki ekspansywne roślin zielnych',
      'Obecność krzewów i podrostu drzew',
      'Stopień uwodnienia',
      'Pozyskanie torfu',
      'Melioracje odwadniające',
      'Geneza siedliska',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('kardynalne (lista pod tab. 2): struktura płatów, charakterystyczne, odsłonięty torf, obce, ekspansywne, krzewy', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['patches', 'characteristic', 'barePeat', 'aliens', 'expansive', 'woody'])
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
    expect(m.prospects.help?.length ?? 0).toBeGreaterThan(200)
  })

  it('termin: lipiec–sierpień bez ostrzeżenia; czerwiec, wrzesień, październik – miękkie; reszta – poza sezonem', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    for (const ok of ['2016-07-01', '2010-08-31']) expect(date.warn!(ok), ok).toBeNull()
    for (const soft of ['2010-06-28', '2016-09-15', '2016-10-10']) expect(date.warn!(soft), soft).toMatch(/poza optymalnym/)
    for (const bad of ['2016-05-20', '2016-11-02']) expect(date.warn!(bad), bad).toMatch(/poza sezonem/)
  })

  it('kody oddziaływań bez duplikatów: torf, melioracje, sukcesja, wydeptywanie, zatopienie, wyschnięcie', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    expect(codes).toEqual(expect.arrayContaining(['C01.03', 'C01.03.01', 'C01.03.02', 'J02.01.02', 'J02.05', 'K02', 'K02.01', 'G05.01', 'K01.03', 'K01.04', 'I01', 'I02', 'M01.02']))
  })

  it('inne informacje: sąsiednie zbiorowiska, propozycje, plany, monitoring wymagany z uzasadnieniem, inne monitoringi, udział FV/U1/U2 przed uwagami', () => {
    const names = allOtherFields(m).map((f) => f.name)
    expect(names).toEqual(expect.arrayContaining(['adjacentCommunities', 'proposals', 'plans', 'monitoringRequired', 'justification', 'otherMonitoring']))
    expect(names.slice(names.indexOf('shareFV'), names.indexOf('notes') + 1)).toEqual(['shareFV', 'shareU1', 'shareU2', 'notes'])
  })

  it('zdjęcia mają uwagi i warstwy B, C, D w jednej grupie', () => {
    expect(m.releves.fields.map((f) => f.name)).toContain('remarks')
    expect(m.releves.fields.filter((f) => f.group === 'Zwarcie i wysokość warstw B, C, D').map((f) => f.name)).toEqual(['coverB', 'coverC', 'coverD', 'heightB', 'heightC', 'heightD'])
  })
})

describe('metodyka 7150 – progi tab. 2', () => {
  it('procent powierzchni: 40–100 FV (40 też), 10–40 U1 (10 też), <10 U2', () => {
    expect([100, 40, 39.9, 10, 9.9, 0].map(gradeShare7150)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })
  it('gatunki charakterystyczne: >3 gat. LUB >50% FV; 2–3 gat. LUB 20–50% U1; 1 gat. i <20% U2', () => {
    expect(gradeCharacteristic7150(4)).toBe('FV')
    expect(gradeCharacteristic7150(2, 65)).toBe('FV') // Bór na Czerwonem
    expect(gradeCharacteristic7150(3, 50)).toBe('U1')
    expect(gradeCharacteristic7150(2)).toBe('U1')
    expect(gradeCharacteristic7150(1, 20)).toBe('U1')
    expect(gradeCharacteristic7150(1, 19)).toBe('U2')
    expect(gradeCharacteristic7150(0)).toBe('U2')
    expect(gradeCharacteristic7150(1, 60)).toBe('FV')
  })
  it('odsłonięty torf: >50 FV, 10–50 U1 (obie granice), <10 U2', () => {
    expect([80, 50.5, 50, 10, 9].map(gradeBarePeat7150)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('mszaki: <20 FV, 20–50 U1 (obie granice), >50 U2', () => {
    expect([5, 19.9, 20, 35, 50, 60].map(gradeMosses7150)).toEqual(['FV', 'FV', 'U1', 'U1', 'U1', 'U2'])
  })
  it('obce: brak FV; do 5% U1 (bez pokrycia też); >5% U2', () => {
    expect(gradeAliens7150(0)).toBe('FV')
    expect(gradeAliens7150(0.5)).toBe('U1')
    expect(gradeAliens7150(5)).toBe('U1')
    expect(gradeAliens7150(6)).toBe('U2')
    expect(gradeAliens7150(0, true)).toBe('U1')
  })
  it('ekspansywne: brak lub pojedyncze (0,5) FV; do 5% U1; >5% U2', () => {
    expect([0, 0.5, 1, 5, 5.5].map(gradeExpansive7150)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('krzewy: brak lub pojedyncze (0,5) FV; do 10% U1 (10 też, jak 2016); >10% U2', () => {
    expect([0, 0.5, 5, 10, 11].map(gradeWoody7150)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('uwodnienie: −2…10 cm FV; −10…−2 i 10…20 U1; ponad 10 powyżej i ponad 20 poniżej U2', () => {
    expect([-2, 0, 10, -2.5, -10, 10.5, 20, -11, 21].map(gradeWater7150)).toEqual(['FV', 'FV', 'FV', 'U1', 'U1', 'U1', 'U1', 'U2', 'U2'])
  })
})

describe('metodyka 7150 – podpowiedzi wskaźników', () => {
  it('gatunki charakterystyczne: z listy (synonimy raz), liczba i pokrycie wprost, ocena ekspercka', () => {
    expect(suggest('characteristic', { species: sp(['Rhynchospora alba', 10]) })).toBe('U2')
    expect(suggest('characteristic', { species: sp(['Rhynchospora alba', 30]) })).toBe('U1')
    expect(suggest('characteristic', { species: sp(['Rhynchospora alba', 50], ['Drosera rotundifolia', 15]) })).toBe('FV')
    expect(suggest('characteristic', { species: sp(['Baeothryon caespitosum'], ['Trichophorum cespitosum'], ['Sphagnum denticulatum'], ['Sphagnum auriculatum']) })).toBe('U1')
    expect(suggest('characteristic', { species: sp(['Rhynchospora fusca'], ['Drosera intermedia'], ['Lycopodiella inundata'], ['Juncus bulbosus']) })).toBe('FV')
    expect(suggest('characteristic', { species: sp(['Rhynchospora alba', 5], ['Andromeda polifolia', 60]) })).toBe('U2') // modrzewnica się nie liczy
    expect(suggest('characteristic', { count: 3 })).toBe('U1')
    expect(suggest('characteristic', { count: 1, total: 55 })).toBe('FV')
    expect(suggest('characteristic', { count: 5, choice: 'U1' })).toBe('U1')
    expect(warn('characteristic', { count: 5, choice: 'U1' })).toMatch(/uzasadnij/)
    expect(warn('characteristic', { species: sp(['Rhynchospora alba'], ['Molinia caerulea']) })).toMatch(/Nie liczą się/)
    expect(suggest('characteristic', {})).toBeNull()
  })

  it('procent powierzchni, odsłonięty torf, mszaki: z liczby', () => {
    expect(suggest('share', { share: 45 })).toBe('FV')
    expect(suggest('barePeat', { cover: 60 })).toBe('FV')
    expect(suggest('mosses', { cover: 65 })).toBe('U2') // Kotlina Orawsko-Nowotarska 2016
    expect(suggest('mosses', { cover: 5 })).toBe('FV') // Puścizna Rękowiańska 2016
    expect(suggest('share', {})).toBeNull()
  })

  it('mszaki: udziały torfowców, mchów brunatnych i wątrobowców powinny dać ok. 100%', () => {
    expect(warn('mosses', { cover: 35, sphagnum: 90, brown: 0, liverworts: 10 })).toBeNull()
    expect(warn('mosses', { cover: 35, sphagnum: 50, liverworts: 10 })).toMatch(/100%/)
  })

  it('obce: brak FV, pojedyncze osobniki bez pokrycia U1, >5% U2; rodzime ostrzegają', () => {
    expect(suggest('aliens', { none: 'yes' })).toBe('FV')
    expect(suggest('aliens', { species: sp(['Spiraea tomentosa']) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Campylopus introflexus', 8]) })).toBe('U2')
    expect(suggest('aliens', { total: 3 })).toBe('U1')
    expect(warn('aliens', { species: sp(['Molinia caerulea', 5]) })).toMatch(/rodzime ekspansywne/)
    expect(warn('aliens', { none: 'yes', species: sp(['Spiraea tomentosa']) })).toMatch(/Nie stwierdzono/)
  })

  it('ekspansywne: suma bez charakterystycznych i obcych; łączne pokrycie i ocena mają pierwszeństwo', () => {
    expect(suggest('expansive', { none: 'yes' })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Molinia caerulea', 0.5]) })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Molinia caerulea', 3], ['Phragmites australis', 2]) })).toBe('U1')
    expect(suggest('expansive', { species: sp(['Molinia caerulea', 30]) })).toBe('U2')
    expect(suggest('expansive', { species: sp(['Molinia caerulea', 1], ['Rhynchospora alba', 40]) })).toBe('U1')
    expect(suggest('expansive', { species: sp(['Molinia caerulea']) })).toBeNull()
    expect(suggest('expansive', { species: sp(['Molinia caerulea', 1]), total: 10 })).toBe('U2')
    expect(suggest('expansive', { species: sp(['Molinia caerulea', 30]), choice: 'U1' })).toBe('U1')
    expect(warn('expansive', { species: sp(['Spiraea tomentosa', 1]) })).toMatch(/Obce gatunki inwazyjne/)
    expect(warn('expansive', { species: sp(['Pinus sylvestris', 1]) })).toMatch(/krzewów/)
  })

  it('krzewy: sosna 0,5 FV (karta), sosna 5 U1 (Łysa Puścizna), kruszyna 10 U1 (Puścizna Rękowiańska), łączne ma pierwszeństwo', () => {
    expect(suggest('woody', { species: sp(['Pinus sylvestris', 0.5]) })).toBe('FV')
    expect(suggest('woody', { species: sp(['Pinus sylvestris', 5]) })).toBe('U1')
    expect(suggest('woody', { species: sp(['Frangula alnus', 10]) })).toBe('U1')
    expect(suggest('woody', { species: sp(['Betula pubescens', 8], ['Pinus sylvestris', 8]) })).toBe('U2')
    expect(suggest('woody', { species: sp(['Betula pubescens', 8], ['Pinus sylvestris', 8]), total: 9 })).toBe('U1')
    expect(suggest('woody', { none: 'yes' })).toBe('FV')
    expect(suggest('woody', { species: sp(['Pinus sylvestris']) })).toBeNull()
    expect(warn('woody', { species: sp(['Molinia caerulea', 5]) })).toMatch(/To nie drzewa/)
  })

  it('uwodnienie: średnia z pomiarów (minus = nad powierzchnią), ocena ekspercka, ostrzeżenie przy skrajnym punkcie', () => {
    expect(suggest('water', { depth1: -2, depth5: 1 })).toBe('FV')
    expect(suggest('water', { depth1: 12, depth2: 15, depth3: 18 })).toBe('U1')
    expect(suggest('water', { depth1: 25, depth2: 30 })).toBe('U2')
    expect(suggest('water', { depth1: -15 })).toBe('U2') // zatopienie
    expect(suggest('water', { choice: 'FV' })).toBe('FV')
    expect(suggest('water', {})).toBeNull()
    expect(warn('water', { depth1: 0, depth2: 0, depth3: 0, depth4: 0, depth5: 30 })).toMatch(/U2/)
    expect(ind('water').describe!({ depth1: -2, depth5: 1 })).toBe('Poziom wody od 2 cm powyżej do 1 cm poniżej powierzchni')
  })

  it('wskaźniki opisowe: z wyboru', () => {
    expect(suggest('area', { choice: 'unknown' })).toBe('XX')
    expect(suggest('patches', { choice: 'small' })).toBe('U2')
    expect(suggest('dominant', { choice: 'mixed' })).toBe('U1')
    expect(suggest('peat', { choice: 'past' })).toBe('U1')
    expect(suggest('drainage', { choice: 'strong' })).toBe('U2')
    expect(suggest('genesis', { choice: 'irregular' })).toBe('U1')
    expect(warn('dominant', { choice: 'characteristic', species: sp(['Molinia caerulea', 40], ['Rhynchospora alba', 10]) })).toMatch(/Molinia caerulea/)
  })

  it('katalog: drzewa w B, mszaki w D, runo w C, bez duplikatów, synonimy jednym kluczem', () => {
    const names = SPECIES_7150.map((s) => s.latin.toLowerCase())
    expect(new Set(names).size).toBe(names.length)
    expect(defaultLayer7150(findSpecies7150('Pinus sylvestris')!)).toBe('B')
    expect(defaultLayer7150(findSpecies7150('Sphagnum tenellum')!)).toBe('D')
    expect(defaultLayer7150(findSpecies7150('Rhynchospora alba')!)).toBe('C')
    expect(speciesKey7150('Trichophorum cespitosum')).toBe(speciesKey7150('Baeothryon caespitosum'))
    expect(speciesKey7150('Sphagnum auriculatum')).toBe(speciesKey7150('Sphagnum denticulatum'))
    expect(SPECIES_7150.filter((s) => s.source === 'representative').map((s) => s.latin)).toEqual([
      'Rhynchospora alba',
      'Rhynchospora fusca',
      'Lycopodiella inundata',
      'Drosera rotundifolia',
      'Drosera intermedia',
    ])
    expect(isCharacteristic7150('Eriophorum vaginatum')).toBe(false)
    expect(m.speciesInfo!('Rhynchospora fusca')).toMatch(/reprezentatywny/)
    expect(m.speciesInfo!('Carex rostrata')).toMatch(/lokalnie/)
    expect(m.speciesInfo!('Nieznany gatunek')).toBeUndefined()
  })
})

describe('metodyka 7150 – ocena struktury i ogólna (reguła ogólna silnika)', () => {
  const all = (g: Grade): CardValues => {
    const v = emptyCardValues(m)
    for (const i of m.indicators) v.indicators[i.id] = { inputs: {}, value: 'x', grade: g }
    v.prospects = { value: 'x', grade: g }
    return v
  }
  const withGrade = (base: CardValues, id: string, g: Grade): CardValues => ({ ...base, indicators: { ...base.indicators, [id]: { ...base.indicators[id], grade: g } } })

  it('wszystko FV → FV; niekardynalny U1 → FV; niekardynalny U2 (mszaki) → U1', () => {
    expect(assessCard(m, all('FV'))).toMatchObject({ structure: 'FV', overall: 'FV' })
    expect(assessCard(m, withGrade(all('FV'), 'peat', 'U1')).structure).toBe('FV')
    expect(assessCard(m, withGrade(all('FV'), 'mosses', 'U2'))).toMatchObject({ structure: 'U1', overall: 'U1' })
  })

  it('kardynalny U1 (odsłonięty torf) → U1; kardynalny U2 (struktura płatów, Młaka Brzeże 2016) → U2', () => {
    expect(assessCard(m, withGrade(all('FV'), 'barePeat', 'U1')).structure).toBe('U1')
    expect(assessCard(m, withGrade(all('FV'), 'patches', 'U2'))).toMatchObject({ structure: 'U2', overall: 'U2' })
  })
})

describe('przykład Bór na Czerwonem (karta z przewodnika, 2010)', () => {
  const c = ctx({ site: bor.site, indicators: bor.indicators })

  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(bor)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie', () => {
    const grades = Object.fromEntries(Object.entries(bor.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({
      area: 'U1',
      share: 'U1',
      patches: 'U1',
      characteristic: 'FV',
      dominant: 'FV',
      barePeat: 'U1',
      mosses: 'U1',
      aliens: 'FV',
      expansive: 'FV',
      woody: 'FV',
      water: 'FV',
      peat: 'FV',
      drainage: 'FV',
      genesis: 'FV',
    })
  })

  it('parametry i ocena ogólna jak w karcie: powierzchnia U1, struktura U1, perspektywy FV, ogólna U1', () => {
    expect(assessCard(m, bor)).toMatchObject({ area: 'U1', structure: 'U1', prospects: 'FV', overall: 'U1', missing: [] })
  })

  it('podpowiedzi formularza zgodne z ekspertem przy każdym wskaźniku', () => {
    for (const i of m.indicators) expect(i.suggest!(bor.indicators[i.id].inputs, c), i.id).toBe(bor.indicators[i.id].grade)
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    for (const i of m.indicators) expect(i.describe!(bor.indicators[i.id].inputs, c), i.id).toBe(bor.indicators[i.id].value)
  })

  it('bez ostrzeżeń przy wskaźnikach i zdjęciach; jedyne ostrzeżenie stanowiska – termin 28.06, przed lipcem', () => {
    for (const i of m.indicators) expect(i.warn?.(bor.indicators[i.id].inputs, c) ?? null, i.id).toBeNull()
    const siteWarnings = m.siteFields.filter((f) => f.warn?.(bor.site[f.name])).map((f) => f.name)
    expect(siteWarnings).toEqual(['date'])
    expect(String(bor.other.notes)).toMatch(/Termin 28\.06/)
    for (const r of bor.releves) for (const f of m.releves.fields) expect(f.warn?.(r[f.name]) ?? null, f.name).toBeNull()
  })

  it('zdjęcia jak w karcie, gatunki z katalogu, udział FV/U1/U2 30/60/10, ekspert zanonimizowany', () => {
    expect(examples7150).toHaveLength(1)
    expect(bor.releves.map((r) => (r.species as unknown[]).length)).toEqual([15, 16, 12])
    expect(bor.releves.map((r) => [r.altitude, r.area, r.slope, r.exposure, r.coverB, r.coverC, r.coverD, r.heightB, r.heightC])).toEqual([
      [613, 20, 4, 'NW', 2, 50, 60, 1, 20],
      [613, 25, 5, 'NW', 0.5, 85, 40, 0.5, 30],
      [614, 25, undefined, 'NNW', 0.5, 40, 15, 0.4, 10],
    ])
    const rows = bor.releves.flatMap((r) => r.species as { name: string; layer: string }[])
    for (const r of rows) expect(findSpecies7150(r.name), r.name).toBeTruthy()
    expect(rows.filter((r) => r.layer === 'D').every((r) => r.name.startsWith('Sphagnum'))).toBe(true)
    const o = bor.other
    expect([o.shareFV, o.shareU1, o.shareU2]).toEqual([30, 60, 10])
    expect(bor.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(bor)).not.toMatch(/Koczur/)
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, udział FV/U1/U2 i dane stanowiska', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, bor))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['7150 Obniżenia na podłożu torfowym', 'Odsłonięty torf', 'Udział powierzchni siedliska w stanie FV', 'Bór na Czerwonem', 'Rhynchosporetum albae'])
      expect(text, t).toContain(t)
  })
})
