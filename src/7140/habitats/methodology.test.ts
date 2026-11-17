import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type GradeOrEmpty, type IndicatorContext, type InputValues, type StructureItem } from '../../7120/habitats/types'
import { chyzne, examples7140 } from './examples'
import {
  gradeAliens7140,
  gradeCharacteristic7140,
  gradeDominant7140,
  gradeExpansive7140,
  gradeHydration7140,
  gradeMosses7140,
  gradeShare7140,
  gradeWoody7140,
  indicator7140 as ind,
  methodology7140 as m,
  structureRule7140,
} from './methodology'
import { SPECIES_7140, defaultLayer7140, findSpecies7140, isCharacteristic7140, speciesKey7140 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues, c = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const warn = (id: string, inputs: InputValues, c = ctx()) => ind(id).warn!(inputs, c)
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => (cover === undefined ? { name } : { name, cover }))

describe('metodyka 7140 – struktura', () => {
  it('kod 7140 (nie priorytetowe), 3 zdjęcia po 25 m², transekt 10x200 m, podtyp opcjonalny', () => {
    expect(habitatCode(m)).toBe('7140')
    expect(m.priority).toBeFalsy()
    expect(m.name).toBe('Torfowiska przejściowe i trzęsawiska (przeważnie z roślinnością z Scheuchzerio-Caricetea nigrae)')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(m.siteFields.find((f) => f.name === 'transect')?.defaultValue).toBe('10x200 m')
    expect(m.siteFields.find((f) => f.name === 'subtype')?.required).toBeFalsy()
    expect(m.siteFields.filter((f) => f.group === 'Współrzędne geograficzne').map((f) => f.name)).toEqual(['coordStart', 'coordMiddle', 'coordEnd'])
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności tab. 2: powierzchnia + 10 struktury', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Procent powierzchni zajęty przez siedlisko na transekcie',
      'Gatunki charakterystyczne',
      'Gatunki dominujące',
      'Pokrycie i struktura gatunkowa mchów',
      'Obce gatunki inwazyjne',
      'Gatunki ekspansywne roślin zielnych',
      'Obecność krzewów i podrostu drzew',
      'Stopień uwodnienia',
      'Pozyskanie torfu',
      'Melioracje odwadniające',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('kardynalne (lista pod tab. 2): charakterystyczne, mchy, obce, ekspansywne, uwodnienie – krzewy nie', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['characteristic', 'mosses', 'aliens', 'expansive', 'hydration'])
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...allOtherFields(m), ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: lipiec – 15 sierpnia bez ostrzeżenia; czerwiec, II połowa sierpnia i wrzesień – miękkie; poza czerwiec–wrzesień – twarde', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    for (const ok of ['2011-07-31', '2024-07-01', '2024-08-15']) expect(date.warn!(ok), ok).toBeNull()
    for (const soft of ['2024-06-30', '2024-08-27', '2016-09-27']) expect(date.warn!(soft), soft).toMatch(/poza optymalnym/)
    for (const bad of ['2024-05-20', '2024-10-02']) expect(date.warn!(bad), bad).toMatch(/poza sezonem/)
  })

  it('kody oddziaływań bez duplikatów, z melioracjami, torfem, sukcesją, obcymi, zalesianiem i suszą', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    expect(codes).toEqual(expect.arrayContaining(['J02.01.02', 'C01.03.01', 'C01.03.02', 'K02.01', 'I01', 'I02', 'B01', 'M01.02', 'A03.03', 'G05.01', 'X']))
  })

  it('inne informacje: propozycje, monitoring wymagany z uzasadnieniem, udział FV/U1/U2 przed uwagami', () => {
    const names = allOtherFields(m).map((f) => f.name)
    expect(names).toEqual(expect.arrayContaining(['proposals', 'monitoringRequired', 'justification']))
    expect(names.slice(names.indexOf('shareFV'), names.indexOf('notes') + 1)).toEqual(['shareFV', 'shareU1', 'shareU2', 'notes'])
  })

  it('zdjęcia mają uwagi i warstwy A–D w jednej grupie; uwodnienie – pięć punktów w jednej grupie (pola z 7120)', () => {
    expect(m.releves.fields.map((f) => f.name)).toContain('remarks')
    expect(m.releves.fields.filter((f) => f.group === 'Zwarcie i wysokość warstw A, B, C, D').map((f) => f.name)).toEqual([
      'coverA', 'coverB', 'coverC', 'coverD', 'heightA', 'heightB', 'heightC', 'heightD',
    ])
    expect(ind('hydration').inputs.filter((f) => f.group).map((f) => f.name)).toEqual(['depth1', 'depth2', 'depth3', 'depth4', 'depth5'])
  })
})

describe('metodyka 7140 – progi tab. 2', () => {
  it('procent powierzchni siedliska: 80–100 FV, 50–80 U1, <50 U2', () => {
    expect([100, 80, 79.9, 50, 49].map(gradeShare7140)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('gatunki charakterystyczne: >6 albo pokrycie >50% FV; 0–3 i <20% U2; reszta U1', () => {
    expect(gradeCharacteristic7140(7)).toBe('FV')
    expect(gradeCharacteristic7140(3, 51)).toBe('FV') // „lub mniej, lecz pokrycie powyżej 50%” – 2009–2011: 2–3 gatunki, jeden masowo
    expect(gradeCharacteristic7140(5, 30)).toBe('U1')
    expect(gradeCharacteristic7140(5, 10)).toBe('U1') // 4–6 gatunków
    expect(gradeCharacteristic7140(2, 20)).toBe('U1') // mniej, lecz 20–50%
    expect(gradeCharacteristic7140(2, 50)).toBe('U1')
    expect(gradeCharacteristic7140(3, 19)).toBe('U2')
    expect(gradeCharacteristic7140(0, 0)).toBe('U2')
    expect(gradeCharacteristic7140(5)).toBeNull() // bez pokrycia nie da się rozstrzygnąć
  })
  it('dominujące (interpretacja): ≥60% FV, 40–60% U1, <40% U2', () => {
    expect([100, 60, 59, 40, 39].map(gradeDominant7140)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('mchy (waloryzacja 2012): >50 i torfowce >50 FV; 20–50 albo torfowce ≤50 U1; <20 U2', () => {
    expect(gradeMosses7140(100, 90)).toBe('FV')
    expect(gradeMosses7140(60, 50)).toBe('U1')
    expect(gradeMosses7140(60, 0)).toBe('U1')
    expect(gradeMosses7140(50, 100)).toBe('U1')
    expect(gradeMosses7140(20)).toBe('U1')
    expect(gradeMosses7140(19.9, 100)).toBe('U2')
    expect(gradeMosses7140(80)).toBeNull()
  })
  it('obce: brak FV; do 5% (i bez pokrycia) U1; >5% U2', () => {
    expect(gradeAliens7140(0)).toBe('FV')
    expect(gradeAliens7140(0.5)).toBe('U1')
    expect(gradeAliens7140(5)).toBe('U1')
    expect(gradeAliens7140(5.5)).toBe('U2')
    expect(gradeAliens7140(0, true)).toBe('U1')
  })
  it('ekspansywne: brak lub pojedyncze (<1%) FV; do 5% U1; >5% U2', () => {
    expect([0, 0.5, 1, 5, 6].map(gradeExpansive7140)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('krzewy: brak lub pojedyncze (<1%) FV; <15% (i 15%) U1; >15% U2', () => {
    expect([0, 0.5, 1, 15, 15.5].map(gradeWoody7140)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('uwodnienie: nad powierzchnią albo do 10 cm FV; 10–20 U1; >20 U2', () => {
    expect([-20, 0, 10, 15, 20, 21].map(gradeHydration7140)).toEqual(['FV', 'FV', 'FV', 'U1', 'U1', 'U2'])
  })
})

describe('metodyka 7140 – podpowiedzi wskaźników', () => {
  it('procent powierzchni: z liczby albo z wyboru (z XX); rozjazd ostrzega', () => {
    expect(suggest('share', { share: 90 })).toBe('FV')
    expect(suggest('share', { share: 60 })).toBe('U1')
    expect(suggest('share', { choice: 'XX' })).toBe('XX')
    expect(suggest('share', { share: 40, choice: 'U1' })).toBe('U1')
    expect(warn('share', { share: 40, choice: 'U1' })).toMatch(/uzasadnij/)
    expect(suggest('share', {})).toBeNull()
  })

  it('gatunki charakterystyczne: liczba z katalogu (synonimy raz) i suma pokrycia; liczba i pokrycie wprost; ocena ekspercka', () => {
    expect(suggest('characteristic', { species: sp(['Sphagnum fallax', 70], ['Carex rostrata', 5]) })).toBe('FV') // mało gatunków, pokrycie >50%
    expect(suggest('characteristic', { species: sp(['Sphagnum fallax', 10], ['Sphagnum recurvum', 10], ['Carex nigra', 5]) })).toBe('U1') // 2 gatunki, 25%
    expect(suggest('characteristic', { species: sp(['Carex nigra', 5], ['Comarum palustre', 5], ['Potentilla palustris', 2]) })).toBe('U2') // 2 gatunki, 12%
    expect(suggest('characteristic', { species: sp(['Carex nigra', 2], ['Carex echinata', 2], ['Viola palustris', 2], ['Agrostis canina', 2]) })).toBe('U1') // 4 gatunki
    expect(
      suggest('characteristic', {
        species: sp(['Carex nigra'], ['Carex echinata'], ['Viola palustris'], ['Agrostis canina'], ['Eriophorum angustifolium'], ['Menyanthes trifoliata'], ['Carex rostrata']),
      }),
    ).toBe('FV') // 7 gatunków – pokrycie bez znaczenia
    expect(suggest('characteristic', { species: sp(['Carex nigra'], ['Carex rostrata']) })).toBeNull()
    expect(suggest('characteristic', { count: 3, total: 16 })).toBe('U2') // Głuszec 2024
    expect(suggest('characteristic', { count: 3, total: 60, choice: 'U1' })).toBe('U1')
    expect(warn('characteristic', { count: 3, total: 60, choice: 'U1' })).toMatch(/uzasadnij/)
    expect(suggest('characteristic', {})).toBeNull()
  })

  it('gatunki charakterystyczne: niecharakterystyczne nie liczą się, dominacja gatunków torfowisk wysokich ostrzega', () => {
    expect(warn('characteristic', { species: sp(['Sphagnum fallax', 60], ['Polytrichum commune', 10]) })).toMatch(/Nie liczą się.*Polytrichum commune/)
    expect(warn('characteristic', { species: sp(['Eriophorum vaginatum', 50], ['Oxycoccus palustris', 10], ['Carex nigra', 5]) })).toMatch(/torfowisk wysokich/)
    expect(warn('characteristic', { species: sp(['Sphagnum fallax', 60], ['Eriophorum vaginatum', 10]) })).toBeNull()
  })

  it('dominujące: udział gatunków charakterystycznych w pokryciu dominantów; ocena ekspercka; wełnianka pochwowata ostrzega', () => {
    expect(suggest('dominant', { species: sp(['Eriophorum angustifolium', 40], ['Sphagnum fallax', 90]) })).toBe('FV')
    expect(suggest('dominant', { species: sp(['Molinia caerulea', 50], ['Sphagnum fallax', 50]) })).toBe('U1')
    expect(suggest('dominant', { species: sp(['Phragmites australis', 70], ['Pinus sylvestris', 20], ['Sphagnum fallax', 10]) })).toBe('U2')
    expect(suggest('dominant', { species: sp(['Molinia caerulea']) })).toBeNull()
    expect(suggest('dominant', { species: sp(['Molinia caerulea', 70], ['Carex nigra', 10]), choice: 'U1' })).toBe('U1')
    expect(warn('dominant', { species: sp(['Eriophorum vaginatum', 60], ['Sphagnum fallax', 40]) })).toMatch(/torfowisk wysokich/)
    expect(warn('dominant', { species: sp(['Molinia caerulea', 70], ['Carex nigra', 10]), choice: 'U1' })).toMatch(/uzasadnij/)
  })

  it('mchy: z pokrycia i udziału torfowców; brak torfowców ostrzega (praktyka 2024 – U2)', () => {
    expect(suggest('mosses', { mossCover: 100, sphagnumShare: 90 })).toBe('FV')
    expect(suggest('mosses', { mossCover: 80, sphagnumShare: 50 })).toBe('U1') // proporcje wyrównane
    expect(suggest('mosses', { mossCover: 15, sphagnumShare: 0 })).toBe('U2')
    expect(suggest('mosses', { mossCover: 80 })).toBeNull()
    expect(warn('mosses', { mossCover: 60, sphagnumShare: 0 })).toMatch(/Brak torfowców/)
    expect(warn('mosses', { mossCover: 60, sphagnumShare: 70, brownShare: 40 })).toMatch(/ponad 100%/)
    expect(ind('mosses').describe!({ mossCover: 100, sphagnumShare: 90, brownShare: 10 })).toBe('Pokrycie mszaków 100%, mchy brunatne – 10%, torfowce – 90%')
  })

  it('obce: brak FV; pojedyncze i bez pokrycia U1; >5% U2 (Osowiec Eksperymentalny); rodzime ostrzegają', () => {
    expect(suggest('aliens', { none: 'yes' })).toBe('FV')
    expect(suggest('aliens', { species: sp(['Campylopus introflexus', 0.5]) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Erechtites hieraciifolia']) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Spiraea tomentosa', 15]) })).toBe('U2')
    expect(suggest('aliens', { total: 5 })).toBe('U1')
    expect(suggest('aliens', {})).toBeNull()
    expect(warn('aliens', { species: sp(['Molinia caerulea', 5]) })).toMatch(/To nie gatunki obce/)
    expect(warn('aliens', { species: sp(['Bidens frondosa', 1]), none: 'yes' })).toMatch(/Nie stwierdzono/)
  })

  it('ekspansywne: suma bez charakterystycznych, obcych i drzew; wełnianka pochwowata liczona z ostrzeżeniem', () => {
    expect(suggest('expansive', { none: 'yes' })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Molinia caerulea', 0.5]) })).toBe('FV') // pojedyncze
    expect(suggest('expansive', { species: sp(['Molinia caerulea', 3], ['Phragmites australis', 2]) })).toBe('U1')
    expect(suggest('expansive', { species: sp(['Molinia caerulea', 10]) })).toBe('U2') // Szerokie Bagno 2017
    expect(suggest('expansive', { species: sp(['Molinia caerulea', 2], ['Carex nigra', 40], ['Pinus sylvestris', 20]) })).toBe('U1')
    expect(suggest('expansive', { species: sp(['Eriophorum vaginatum', 30]) })).toBe('U2')
    expect(warn('expansive', { species: sp(['Eriophorum vaginatum', 30]) })).toMatch(/pkt 4/)
    expect(warn('expansive', { species: sp(['Spiraea tomentosa', 5]) })).toMatch(/Obce gatunki inwazyjne/)
    expect(warn('expansive', { species: sp(['Pinus sylvestris', 5]) })).toMatch(/Obecność krzewów/)
    expect(suggest('expansive', { species: sp(['Molinia caerulea']) })).toBeNull()
    expect(suggest('expansive', { species: sp(['Molinia caerulea', 30]), choice: 'U1' })).toBe('U1')
  })

  it('krzewy: łączne pokrycie ma pierwszeństwo przed sumą; obce pominięte; >50% ostrzega', () => {
    expect(suggest('woody', { species: sp(['Pinus sylvestris'], ['Picea abies']), total: 0.5 })).toBe('FV')
    expect(suggest('woody', { species: sp(['Pinus sylvestris', 10], ['Betula pubescens', 5]) })).toBe('U1')
    expect(suggest('woody', { species: sp(['Pinus sylvestris', 15], ['Betula pubescens', 5]) })).toBe('U2')
    expect(suggest('woody', { species: sp(['Pinus sylvestris', 15], ['Spiraea tomentosa', 10]) })).toBe('U1')
    expect(suggest('woody', { species: sp(['Pinus sylvestris']) })).toBeNull()
    expect(suggest('woody', { none: 'yes' })).toBe('FV')
    expect(warn('woody', { total: 60 })).toMatch(/91D0/)
    expect(warn('woody', { species: sp(['Spiraea tomentosa', 10]) })).toMatch(/Obce gatunki inwazyjne/)
  })

  it('uwodnienie: piezometr > średnia z pomiarów > obserwacja; rozjazd obserwacji ostrzega', () => {
    expect(suggest('hydration', { depth1: -5, depth2: 0, depth3: 5, depth4: 10, depth5: 5 })).toBe('FV')
    expect(suggest('hydration', { depth1: 10, depth2: 15, depth3: 20 })).toBe('U1')
    expect(suggest('hydration', { depth1: 25, depth2: 30 })).toBe('U2')
    expect(suggest('hydration', { depth1: 25, piezometer: 5 })).toBe('FV')
    expect(suggest('hydration', { observed: 'surfaceDry' })).toBe('U1')
    expect(suggest('hydration', { observed: 'dry' })).toBe('U2')
    expect(suggest('hydration', {})).toBeNull()
    expect(warn('hydration', { depth1: 30, observed: 'wet' })).toMatch(/nie zgadza/)
    expect(ind('hydration').describe!({ depth1: -2, depth2: 0, depth3: 5.5 })).toBe('Poziom wody: -2, 0, 5,5 cm poniżej powierzchni torfowiska')
  })

  it('pozyskanie torfu: z wyboru; dawne na małą skalę FV, ostatnie 30 lat U1; zniszczona powierzchnia >5% ostrzega', () => {
    expect(suggest('peat', { choice: 'none' })).toBe('FV')
    expect(suggest('peat', { choice: 'oldSmall' })).toBe('FV')
    expect(suggest('peat', { choice: 'recentSmall' })).toBe('U1')
    expect(suggest('peat', { choice: 'pastLarge' })).toBe('U1')
    expect(suggest('peat', { choice: 'sporadic' })).toBe('U1')
    expect(suggest('peat', { choice: 'large' })).toBe('U2')
    expect(warn('peat', { choice: 'oldSmall', damaged: 10 })).toMatch(/5%/)
    expect(ind('peat').describe!({ choice: 'pastLarge', method: 'manual', damaged: 20 })).toMatch(/sposób: ręczny.*zniszczone 20% torfowiska/)
  })

  it('melioracje: rowy tylko w otoczeniu i infrastruktura zneutralizowana – FV; słaby wpływ U1; wyraźny U2', () => {
    expect(suggest('drainage', { choice: 'none' })).toBe('FV')
    expect(suggest('drainage', { choice: 'outside' })).toBe('FV')
    expect(suggest('drainage', { choice: 'neutralized' })).toBe('FV')
    expect(suggest('drainage', { choice: 'weak' })).toBe('U1')
    expect(suggest('drainage', { choice: 'strong' })).toBe('U2')
    expect(suggest('area', { choice: 'minor' })).toBe('U1')
    expect(suggest('area', { choice: 'unknown' })).toBe('XX')
  })

  it('katalog: drzewa w B, mchy w D, runo w C, bez duplikatów, synonimy jednym kluczem', () => {
    const latin = SPECIES_7140.map((s) => s.latin.toLowerCase())
    expect(new Set(latin).size).toBe(latin.length)
    expect(defaultLayer7140(findSpecies7140('Pinus sylvestris')!)).toBe('B')
    expect(defaultLayer7140(findSpecies7140('Spiraea tomentosa')!)).toBe('B')
    expect(defaultLayer7140(findSpecies7140('Sphagnum fallax')!)).toBe('D')
    expect(defaultLayer7140(findSpecies7140('Carex lasiocarpa')!)).toBe('C')
    expect(speciesKey7140('Potentilla palustris')).toBe(speciesKey7140('Comarum palustre'))
    expect(speciesKey7140('Vaccinium oxycoccos')).toBe(speciesKey7140('Oxycoccus palustris'))
    // pkt 4 przewodnika: 6 gatunków rzędu Scheuchzerietalia, 3 Rhynchosporion, 9 Caricion lasiocarpae, 9 Caricion nigrae,
    // 2 klasy, 9 zespołów = 38 (bez synonimów)
    const guide = SPECIES_7140.filter((s) => s.group === 'characteristic' && s.source === 'guide')
    expect(new Set(guide.map((s) => speciesKey7140(s.latin))).size).toBe(38)
    expect(m.speciesInfo!('Carex lasiocarpa')).toMatch(/pkt 4/)
    expect(m.speciesInfo!('Menyanthes trifoliata')).toMatch(/Matuszkiewicza/)
    expect(m.speciesInfo!('Eriophorum vaginatum')).toMatch(/ekspansywny/)
    expect(m.speciesInfo!('Molinia caerulea')).toBe('rodzimy gatunek ekspansywny')
    expect(isCharacteristic7140('Polytrichum commune')).toBe(false)
  })
})

describe('metodyka 7140 – ocena struktury (reguła tab. 2) i ogólna (silnik)', () => {
  const items = (cardinal: GradeOrEmpty[], others: GradeOrEmpty[]): StructureItem[] => [
    ...cardinal.map((grade, n) => ({ id: `c${n}`, grade, cardinal: true })),
    ...others.map((grade, n) => ({ id: `o${n}`, grade, cardinal: false })),
  ]
  it('reguła struktury: FV, U1 przy maks. dwóch niekardynalnych U2, U2 przy kardynalnym U2 albo ≥3 niekardynalnych U2', () => {
    expect(structureRule7140(items(['FV', 'FV'], ['FV', 'U1']))).toBe('FV')
    expect(structureRule7140(items(['FV', 'U1'], ['FV']))).toBe('U1')
    expect(structureRule7140(items(['FV', 'FV'], ['U2', 'U2', 'FV']))).toBe('U1')
    expect(structureRule7140(items(['U1', 'FV'], ['U2', 'U2', 'U2']))).toBe('U2')
    expect(structureRule7140(items(['U2', 'FV'], ['FV']))).toBe('U2')
    expect(structureRule7140(items(['XX', 'FV'], ['FV']))).toBe('XX')
    expect(structureRule7140(items(['FV', 'FV'], ['XX']))).toBe('FV')
    expect(structureRule7140(items(['FV', ''], ['FV']))).toBe('')
  })

  const all = (g: Grade): CardValues => {
    const v = emptyCardValues(m)
    for (const i of m.indicators) v.indicators[i.id] = { inputs: {}, value: 'x', grade: g }
    v.prospects = { value: 'x', grade: g }
    return v
  }
  const withGrades = (base: CardValues, grades: Record<string, Grade>): CardValues => ({
    ...base,
    indicators: { ...base.indicators, ...Object.fromEntries(Object.entries(grades).map(([id, g]) => [id, { ...base.indicators[id], grade: g }])) },
  })

  it('karta: krzewy U2 → struktura U1; krzewy, dominujące i procent powierzchni U2 → U2; ekspansywne U2 → U2', () => {
    expect(assessCard(m, all('FV'))).toMatchObject({ structure: 'FV', overall: 'FV' })
    expect(assessCard(m, withGrades(all('FV'), { woody: 'U2' }))).toMatchObject({ structure: 'U1', overall: 'U1' })
    expect(assessCard(m, withGrades(all('FV'), { woody: 'U2', dominant: 'U2' })).structure).toBe('U1')
    expect(assessCard(m, withGrades(all('FV'), { woody: 'U2', dominant: 'U2', share: 'U2' }))).toMatchObject({ structure: 'U2', overall: 'U2' })
    expect(assessCard(m, withGrades(all('FV'), { expansive: 'U2' })).structure).toBe('U2')
  })

  it('ocena ogólna wg silnika („najgorszy decyduje”), nie wg wiersza tab. 2 „dwa FV i jeden U1 → FV”', () => {
    expect(assessCard(m, withGrades(all('FV'), { area: 'U1' })).overall).toBe('U1')
  })
})

describe('przykład Chyżne Borcok (karta z przewodnika, 2011)', () => {
  const c = ctx({ site: chyzne.site, indicators: chyzne.indicators })

  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(chyzne)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie – wszystkie FV, procent powierzchni (brak w karcie) XX', () => {
    const grades = Object.fromEntries(Object.entries(chyzne.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual(Object.fromEntries(m.indicators.map((i) => [i.id, i.id === 'share' ? 'XX' : 'FV'])))
  })

  it('parametry i ocena ogólna jak w karcie: wszystko FV', () => {
    expect(assessCard(m, chyzne)).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV', missing: [] })
  })

  it('podpowiedzi formularza zgodne z ekspertem przy każdym wskaźniku', () => {
    for (const i of m.indicators) expect(i.suggest!(chyzne.indicators[i.id].inputs, c), i.id).toBe(chyzne.indicators[i.id].grade)
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    for (const i of m.indicators) expect(i.describe!(chyzne.indicators[i.id].inputs, c), i.id).toBe(chyzne.indicators[i.id].value)
  })

  it('jedyne ostrzeżenie – płonnik pospolity wśród gatunków charakterystycznych; termin i zdjęcia bez ostrzeżeń', () => {
    const warned = m.indicators.filter((i) => i.warn?.(chyzne.indicators[i.id].inputs, c)).map((i) => i.id)
    expect(warned).toEqual(['characteristic'])
    expect(warn('characteristic', chyzne.indicators.characteristic.inputs)).toBe('Nie liczą się jako charakterystyczne: Polytrichum commune.')
    expect(m.siteFields.filter((f) => f.warn?.(chyzne.site[f.name])).map((f) => f.name)).toEqual([])
    for (const r of chyzne.releves) for (const f of m.releves.fields) expect(f.warn?.(r[f.name]) ?? null, f.name).toBeNull()
  })

  it('zdjęcia jak w karcie (10, 8 i 6 gatunków), mchy w D, udział FV 100%, koordynator zanonimizowany', () => {
    expect(examples7140).toHaveLength(1)
    expect(chyzne.releves.map((r) => (r.species as unknown[]).length)).toEqual([10, 8, 6])
    expect(chyzne.releves.map((r) => [r.altitude, r.area, r.slope, r.coverC, r.coverD, r.heightC, r.heightD])).toEqual([
      [683, 25, 0, 35, 100, 30, 15],
      [685, 25, 0, 40, 100, 30, 15],
      [684, 25, undefined, 40, 100, 40, 15],
    ])
    const rows = chyzne.releves.flatMap((r) => r.species as { name: string; layer: string }[])
    for (const r of rows) {
      expect(findSpecies7140(r.name), r.name).toBeTruthy()
      expect(r.layer, r.name).toBe(defaultLayer7140(findSpecies7140(r.name)!))
    }
    const o = chyzne.other
    expect(Number(o.shareFV) + Number(o.shareU1) + Number(o.shareU2)).toBe(100)
    expect(chyzne.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(chyzne)).not.toMatch(/Koczur/)
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, udział FV/U1/U2 i dane stanowiska', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, chyzne))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['7140 Torfowiska przejściowe i trzęsawiska', 'Stopień uwodnienia', 'Udział powierzchni siedliska w stanie FV', 'Chyżne Borcok', 'Caricetum nigrae'])
      expect(text, t).toContain(t)
  })
})
