import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { examples7210, serebryskie } from './examples'
import {
  associationOf,
  gradeCharacteristic7210,
  gradeDamage7210,
  gradeDensity7210,
  gradeDominant7210,
  gradeHydration7210,
  gradeMolinia7210,
  gradePresence7210,
  gradeReed7210,
  gradeShare7210,
  gradeWoody7210,
  indicator7210 as ind,
  methodology7210 as m,
} from './methodology'
import { SPECIES_7210, defaultLayer7210, findSpecies7210, isCharacteristic7210, speciesKey7210 } from './species'

const ctx = (association = ''): IndicatorContext => ({ site: { association } })
const suggest = (id: string, inputs: InputValues, c = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const warn = (id: string, inputs: InputValues, c = ctx()) => ind(id).warn!(inputs, c)
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => (cover === undefined ? { name } : { name, cover }))

describe('metodyka 7210 – struktura', () => {
  it('kod 7210 (nie priorytetowe), 3 zdjęcia po 100 m², transekt 10x200 m, wybór zespołu', () => {
    expect(habitatCode(m)).toBe('7210')
    expect(m.priority).toBeFalsy()
    expect(m.name).toBe('Torfowiska nakredowe (Cladietum marisci, Caricetum buxbaumii, Schoenetum nigricantis)')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(100)
    expect(m.siteFields.find((f) => f.name === 'transect')?.defaultValue).toBe('10x200 m')
    expect(m.siteFields.find((f) => f.name === 'association')?.required).toBeFalsy()
    expect(m.siteFields.filter((f) => f.group === 'Współrzędne geograficzne').map((f) => f.name)).toEqual(['coordStart', 'coordMiddle', 'coordEnd'])
    expect(emptyCardValues(m).releves).toHaveLength(3)
    expect(m.structureRule).toBeUndefined()
  })

  it('wskaźniki jak w karcie z przewodnika: powierzchnia + 11 struktury (z zanieczyszczeniem spoza tab. 2)', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Udział procentowy siedliska na transekcie',
      'Gatunki charakterystyczne',
      'Gatunki dominujące',
      'Obce gatunki inwazyjne',
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Gatunki synantropijne',
      'Zwarcie szuwarów',
      'Ekspansja krzewów i podrostu drzew',
      'Stopień uwodnienia',
      'Zanieczyszczenie pestycydami lub przenawożenie',
      'Mechaniczne zniszczenie',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('kardynalne (lista pod tab. 2): charakterystyczne, ekspansywne, zwarcie, krzewy, uwodnienie – obce nie', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['characteristic', 'expansive', 'density', 'woody', 'hydration'])
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...allOtherFields(m), ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: połowa lipca – koniec sierpnia bez ostrzeżenia; lipiec i wrzesień – miękkie; poza lipcem–wrześniem – twarde', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    for (const ok of ['2007-08-02', '2024-07-15', '2024-08-31']) expect(date.warn!(ok), ok).toBeNull()
    for (const soft of ['2024-07-01', '2018-09-09', '2024-09-15']) expect(date.warn!(soft), soft).toMatch(/poza optymalnym/)
    for (const bad of ['2024-06-20', '2024-10-02']) expect(date.warn!(bad), bad).toMatch(/poza sezonem/)
  })

  it('kody oddziaływań bez duplikatów; są wszystkie z przykładu', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    expect(codes).toEqual(expect.arrayContaining([...serebryskie.impacts.map((i) => i.code), ...serebryskie.threats.map((t) => t.code), 'J02.01.02', 'K02.01', 'A03.03', 'A08', 'X']))
  })

  it('inne informacje: propozycje, monitoring wymagany z uzasadnieniem, udział FV/U1/U2 przed uwagami', () => {
    const names = allOtherFields(m).map((f) => f.name)
    expect(names).toEqual(expect.arrayContaining(['proposals', 'monitoringRequired', 'justification']))
    expect(names.slice(names.indexOf('shareFV'), names.indexOf('notes') + 1)).toEqual(['shareFV', 'shareU1', 'shareU2', 'notes'])
  })

  it('zdjęcia mają poziom wody i uwagi, warstwy A–D w jednej grupie; uwodnienie – pięć punktów w jednej grupie', () => {
    expect(m.releves.fields.map((f) => f.name)).toEqual(expect.arrayContaining(['waterLevel', 'remarks']))
    expect(m.releves.fields.filter((f) => f.group === 'Zwarcie i wysokość warstw A, B, C, D').map((f) => f.name)).toEqual([
      'coverA', 'coverB', 'coverC', 'coverD', 'heightA', 'heightB', 'heightC', 'heightD',
    ])
    expect(ind('hydration').inputs.filter((f) => f.group).map((f) => f.name)).toEqual(['level1', 'level2', 'level3', 'level4', 'level5'])
  })

  it('zespół: z wyboru w „Stanowisku”, bez wyboru – Cladietum marisci', () => {
    expect(associationOf(ctx('buxbaumii'))).toBe('buxbaumii')
    expect(associationOf(ctx(''))).toBe('cladietum')
    expect(associationOf(undefined)).toBe('cladietum')
  })
})

describe('metodyka 7210 – progi tab. 2', () => {
  it('udział siedliska: ≥70 FV, 40–70 U1, <40 U2', () => {
    expect([100, 70, 69, 40, 39, 0].map(gradeShare7210)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })
  it('gatunki charakterystyczne (interpretacja): ≥40% kłoć / ≥30% pozostałe FV; ≥1% U1; <1% U2; sama marzyca w Schoenetum – U1', () => {
    expect([50, 40, 39, 1, 0.5, 0].map((c) => gradeCharacteristic7210(c))).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
    expect([30, 29].map((c) => gradeCharacteristic7210(c, 'buxbaumii'))).toEqual(['FV', 'U1'])
    expect(gradeCharacteristic7210(60, 'schoenetum', true)).toBe('U1')
    expect(gradeCharacteristic7210(60, 'schoenetum', false)).toBe('FV')
    expect(gradeCharacteristic7210(60, 'ferruginei', true)).toBe('FV')
  })
  it('dominujące (interpretacja): ≥60% FV, 40–60% U1, <40% U2', () => {
    expect([100, 60, 59, 40, 39].map(gradeDominant7210)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('obce i synantropijne: brak FV; do 5% (i bez pokrycia) U1; >5% U2', () => {
    expect(gradePresence7210(0)).toBe('FV')
    expect(gradePresence7210(0, true)).toBe('U1')
    expect([0.5, 5, 5.5].map((c) => gradePresence7210(c))).toEqual(['U1', 'U1', 'U2'])
  })
  it('ekspansywne: trzęślica ≤5 FV, ≤15 U1, >15 U2; trzcina i turzyce ≤20 FV, ≤30 U1, >30 U2', () => {
    expect([5, 5.5, 15, 16].map(gradeMolinia7210)).toEqual(['FV', 'U1', 'U1', 'U2'])
    expect([20, 21, 30, 31].map(gradeReed7210)).toEqual(['FV', 'U1', 'U1', 'U2'])
  })
  it('zwarcie: kłoć ≥40 FV, 20–40 U1; pozostałe ≥30 FV, 20–30 U1; <20 U2', () => {
    expect([50, 40, 39, 20, 19].map((d) => gradeDensity7210(d))).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
    expect([30, 29, 20, 19].map((d) => gradeDensity7210(d, 'schoenetum'))).toEqual(['FV', 'U1', 'U1', 'U2'])
  })
  it('krzewy: pojedyncze (<5%) FV; 5–10% U1; >10% U2', () => {
    expect([0.5, 4.9, 5, 10, 10.5].map(gradeWoody7210)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('uwodnienie (+ nad, − pod): kłoć 0–20 FV; pozostałe 0–10 FV; do −20 i do +30 U1; dalej U2', () => {
    expect([0, 20, 21, 30, 31, -1, -20, -21].map((l) => gradeHydration7210(l))).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U1', 'U1', 'U2'])
    expect([0, 10, 11, 30, 31, -10].map((l) => gradeHydration7210(l, 'buxbaumii'))).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U1'])
  })
  it('zniszczenia mechaniczne: do 5% FV, do 10% U1, >10% U2', () => {
    expect([0, 5, 6, 10, 11].map(gradeDamage7210)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
})

describe('metodyka 7210 – podpowiedzi wskaźników', () => {
  it('udział siedliska: z liczby albo z wyboru (np. U1 bez transektu 200×10 m); rozjazd ostrzega', () => {
    expect(suggest('share', { share: 55 })).toBe('U1')
    expect(suggest('share', { share: 90, choice: 'U1' })).toBe('U1')
    expect(warn('share', { share: 90, choice: 'U1' })).toMatch(/Wybrano U1, a z udziału wychodzi FV/)
    expect(suggest('share', {})).toBeNull()
  })

  it('gatunki charakterystyczne: suma pokrycia z katalogu, próg wg zespołu, „nie stwierdzono” – U2, ocena ekspercka', () => {
    expect(suggest('characteristic', { species: sp(['Cladium mariscus', 50]) })).toBe('FV')
    expect(suggest('characteristic', { species: sp(['Cladium mariscus', 35]) })).toBe('U1')
    expect(suggest('characteristic', { species: sp(['Carex buxbaumii', 35]) }, ctx('buxbaumii'))).toBe('FV')
    expect(suggest('characteristic', { species: sp(['Cladium mariscus', 0.5]) })).toBe('U2')
    expect(suggest('characteristic', { species: [], none: 'yes' })).toBe('U2')
    expect(suggest('characteristic', { species: sp(['Phragmites australis', 60]) })).toBe('U2')
    expect(suggest('characteristic', { species: sp(['Cladium mariscus']) })).toBeNull()
    expect(suggest('characteristic', { species: sp(['Cladium mariscus', 50]), choice: 'U1' })).toBe('U1')
    expect(suggest('characteristic', { total: 45 })).toBe('FV')
    expect(suggest('characteristic', {})).toBeNull()
  })

  it('gatunki charakterystyczne: Schoenetum – sama marzyca U1, z lipiennikiem FV; obce gatunki ostrzegają; synonimy raz', () => {
    expect(suggest('characteristic', { species: sp(['Schoenus nigricans', 50]) }, ctx('schoenetum'))).toBe('U1')
    expect(suggest('characteristic', { species: sp(['Schoenus nigricans', 50], ['Liparis loeselii', 0.5]) }, ctx('schoenetum'))).toBe('FV')
    expect(ind('characteristic').explain!({ species: sp(['Schoenus nigricans', 50]) }, ctx('schoenetum'))).toMatch(/sama marzyca/)
    expect(warn('characteristic', { species: sp(['Cladium mariscus', 50], ['Scorpidium scorpioides', 10]) })).toBe('Nie liczą się jako charakterystyczne: Scorpidium scorpioides.')
    expect(speciesKey7210('Anacamptis palustris')).toBe(speciesKey7210('Orchis palustris'))
    expect(ind('characteristic').explain!({ species: sp(['Cladium mariscus', 50]) }, ctx())).toMatch(/przyjęto Cladietum marisci/)
  })

  it('dominujące: udział siedliskotwórczych w pokryciu dominantów; poniżej 10% ostrzega', () => {
    expect(suggest('dominant', { species: sp(['Cladium mariscus', 50]) })).toBe('FV')
    expect(suggest('dominant', { species: sp(['Cladium mariscus', 50], ['Phragmites australis', 50]) })).toBe('U1')
    expect(suggest('dominant', { species: sp(['Cladium mariscus', 20], ['Molinia caerulea', 60]) })).toBe('U2')
    expect(warn('dominant', { species: sp(['Cladium mariscus', 50], ['Molinia caerulea', 5]) })).toMatch(/poniżej 10%.*Molinia caerulea/)
    expect(suggest('dominant', { species: sp(['Cladium mariscus']) })).toBeNull()
  })

  it('obce: brak FV; pojedyncze i bez pokrycia U1; >5% U2; rodzime ostrzegają', () => {
    expect(suggest('aliens', { species: [], none: 'yes' })).toBe('FV')
    expect(suggest('aliens', { species: sp(['Solidago gigantea']) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Spiraea tomentosa', 8]) })).toBe('U2')
    expect(suggest('aliens', { total: 3 })).toBe('U1')
    expect(warn('aliens', { species: sp(['Molinia caerulea', 3]) })).toMatch(/To nie gatunki obce: Molinia caerulea/)
    expect(warn('aliens', { species: sp(['Solidago gigantea', 1]), none: 'yes' })).toMatch(/Nie stwierdzono/)
  })

  it('ekspansywne: każdy gatunek z progiem osobno, decyduje najgorszy; gatunki bez progu nie zmieniają oceny', () => {
    expect(suggest('expansive', { species: sp(['Molinia caerulea', 5], ['Eupatorium cannabinum'], ['Filipendula ulmaria']) })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Molinia caerulea', 10], ['Phragmites australis', 15]) })).toBe('U1')
    expect(suggest('expansive', { species: sp(['Molinia caerulea', 3], ['Carex elata', 35]) })).toBe('U2')
    expect(suggest('expansive', { species: sp(['Carex lasiocarpa', 15], ['Carex elata', 15]) })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Thelypteris palustris', 60]) })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Phragmites australis']) })).toBeNull()
    expect(suggest('expansive', { species: [], none: 'yes' })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Molinia caerulea', 20]), choice: 'U1' })).toBe('U1')
    expect(ind('expansive').explain!({ species: sp(['Molinia caerulea', 10], ['Typha latifolia', 5]) }, ctx())).toMatch(/Molinia caerulea 10% → U1.*bez progów.*Typha latifolia/)
  })

  it('ekspansywne: trzcina 20–30% ostrzega (tab. 2 dla trzciny – U2 powyżej 20%); obce i charakterystyczne ostrzegają', () => {
    expect(suggest('expansive', { species: sp(['Phragmites australis', 25]) })).toBe('U1')
    expect(warn('expansive', { species: sp(['Phragmites australis', 25]) })).toMatch(/Trzcina 20–30%/)
    expect(warn('expansive', { species: sp(['Carex elata', 25]) })).toBeNull()
    expect(warn('expansive', { species: sp(['Cladium mariscus', 5], ['Solidago gigantea', 1]) })).toMatch(/Cladium mariscus, Solidago gigantea/)
  })

  it('synantropijne: brak FV; samo pojawienie się U1; >5% U2; obce ostrzegają', () => {
    expect(suggest('synanthropic', { species: [], none: 'yes' })).toBe('FV')
    expect(suggest('synanthropic', { species: sp(['Cirsium arvense']) })).toBe('U1')
    expect(suggest('synanthropic', { species: sp(['Tussilago farfara', 4], ['Cirsium arvense', 2]) })).toBe('U2')
    expect(warn('synanthropic', { species: sp(['Solidago gigantea', 1]) })).toMatch(/Obce gatunki inwazyjne/)
  })

  it('zwarcie: próg wg zespołu; ocena ekspercka (inicjalne stadium) z ostrzeżeniem', () => {
    expect(suggest('density', { density: 35 })).toBe('U1')
    expect(suggest('density', { density: 35 }, ctx('buxbaumii'))).toBe('FV')
    expect(suggest('density', { density: 10, choice: 'U1' })).toBe('U1')
    expect(warn('density', { density: 10, choice: 'U1' })).toMatch(/wychodzi U2/)
  })

  it('krzewy: łączne pokrycie ma pierwszeństwo; obce pominięte; 1–5% (luka) ostrzega', () => {
    expect(suggest('woody', { species: sp(['Frangula alnus', 0.5]) })).toBe('FV')
    expect(suggest('woody', { species: sp(['Salix cinerea', 5], ['Alnus glutinosa', 3]) })).toBe('U1')
    expect(suggest('woody', { species: sp(['Salix cinerea', 15]), total: 8 })).toBe('U1')
    expect(suggest('woody', { species: sp(['Salix cinerea', 20], ['Spiraea tomentosa', 30]) })).toBe('U2')
    expect(suggest('woody', { species: sp(['Prunus serotina', 30]) })).toBe('FV')
    expect(warn('woody', { species: sp(['Salix cinerea', 3]) })).toMatch(/więcej niż „pojedyncze”/)
    expect(warn('woody', { species: sp(['Prunus serotina', 1]) })).toMatch(/Obce gatunki inwazyjne/)
  })

  it('uwodnienie: średnia z pomiarów, próg wg zespołu; pojedynczy punkt U2 i mieszane znaki ostrzegają', () => {
    expect(suggest('hydration', { level1: 10, level2: 15 })).toBe('FV')
    expect(suggest('hydration', { level1: 10, level2: 15 }, ctx('schoenetum'))).toBe('U1')
    expect(suggest('hydration', { level1: -10 })).toBe('U1')
    expect(suggest('hydration', { level1: 40, level2: 35 })).toBe('U2')
    expect(suggest('hydration', { level1: 40, choice: 'FV' })).toBe('FV')
    expect(warn('hydration', { level1: 40, level2: 0, level3: 0 })).toMatch(/którymś punkcie/)
    expect(warn('hydration', { level1: 5, level2: -5 })).toMatch(/sprawdź znaki/)
    expect(ind('hydration').describe!({ level1: 7, level2: -10 }, ctx())).toBe('Poziom wody: +7, -10 cm względem powierzchni torfu')
  })

  it('zanieczyszczenie: brak FV, objawy i niewiadome XX (brak waloryzacji)', () => {
    expect(suggest('pollution', { choice: 'none' })).toBe('FV')
    expect(suggest('pollution', { choice: 'present' })).toBe('XX')
    expect(suggest('pollution', { choice: 'unknown' })).toBe('XX')
  })

  it('mechaniczne zniszczenie: z procentu (tab. 2); antropogeniczne do 5% ostrzega (tab. 1)', () => {
    expect(suggest('damage', { damaged: 5, origin: 'natural' })).toBe('FV')
    expect(suggest('damage', { damaged: 8, origin: 'human' })).toBe('U1')
    expect(suggest('damage', { origin: 'none' })).toBe('FV')
    expect(warn('damage', { damaged: 3, origin: 'human' })).toMatch(/tab. 1/)
    expect(warn('damage', { damaged: 3, origin: 'natural' })).toBeNull()
  })

  it('katalog: drzewa w B, mchy w D, runo w C, bez duplikatów, synonimy jednym kluczem', () => {
    const names = SPECIES_7210.map((s) => s.latin)
    expect(new Set(names).size).toBe(names.length)
    expect(defaultLayer7210(findSpecies7210('Alnus glutinosa')!)).toBe('B')
    expect(defaultLayer7210(findSpecies7210('Scorpidium scorpioides')!)).toBe('D')
    expect(defaultLayer7210(findSpecies7210('Cladium mariscus')!)).toBe('C')
    expect(SPECIES_7210.filter((s) => isCharacteristic7210(s.latin)).map((s) => speciesKey7210(s.latin))).toEqual([
      'kłoć wiechowata', 'turzyca Buxbauma', 'marzyca czarniawa', 'marzyca ruda', 'lipiennik Loesela', 'storczyk błotny', 'storczyk błotny',
    ])
    expect(m.speciesInfo!('Cladium mariscus')).toMatch(/siedliskotwórczy/)
    expect(m.speciesInfo!('Molinia caerulea')).toMatch(/z progiem/)
    expect(m.speciesInfo!('Filipendula ulmaria')).toMatch(/bez progu/)
  })
})

describe('metodyka 7210 – ocena struktury i ogólna (silnik = tab. 2)', () => {
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

  it('kardynalne FV, pozostałe co najmniej U1 → FV; niekardynalny U2 → U1; kardynalny U2 → U2', () => {
    expect(assessCard(m, all('FV'))).toMatchObject({ structure: 'FV', overall: 'FV' })
    expect(assessCard(m, withGrades(all('FV'), { aliens: 'U1', synanthropic: 'U1' })).structure).toBe('FV')
    expect(assessCard(m, withGrades(all('FV'), { aliens: 'U2', dominant: 'U2', share: 'U2' })).structure).toBe('U1')
    expect(assessCard(m, withGrades(all('FV'), { density: 'U2' }))).toMatchObject({ structure: 'U2', overall: 'U2' })
    expect(assessCard(m, withGrades(all('FV'), { hydration: 'U1' })).structure).toBe('U1')
    expect(assessCard(m, withGrades(all('FV'), { pollution: 'XX' })).structure).toBe('FV')
  })

  it('ocena ogólna: wszystkie FV → FV; U1 bez U2 → U1; U2 → U2 (tab. 2 = silnik)', () => {
    expect(assessCard(m, withGrades(all('FV'), { area: 'U1' })).overall).toBe('U1')
    expect(assessCard(m, { ...withGrades(all('FV'), {}), prospects: { value: 'x', grade: 'U2' } }).overall).toBe('U2')
  })
})

describe('przykład Rezerwat Bagno Serebryskie 2 (karta z przewodnika, 2007)', () => {
  const c: IndicatorContext = { site: serebryskie.site, indicators: serebryskie.indicators }

  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(serebryskie)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie: powierzchnia XX, uwodnienie U1, reszta FV', () => {
    const grades = Object.fromEntries(Object.entries(serebryskie.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual(Object.fromEntries(m.indicators.map((i) => [i.id, i.id === 'area' ? 'XX' : i.id === 'hydration' ? 'U1' : 'FV'])))
  })

  it('parametry i ocena ogólna jak w karcie: XX, U1, U1 → U1', () => {
    expect(assessCard(m, serebryskie)).toMatchObject({ area: 'XX', structure: 'U1', prospects: 'U1', overall: 'U1', missing: [] })
  })

  it('podpowiedzi formularza zgodne z ekspertem przy każdym wskaźniku', () => {
    for (const i of m.indicators) expect(i.suggest!(serebryskie.indicators[i.id].inputs, c), i.id).toBe(serebryskie.indicators[i.id].grade)
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    for (const i of m.indicators) expect(i.describe!(serebryskie.indicators[i.id].inputs, c), i.id).toBe(serebryskie.indicators[i.id].value)
  })

  it('bez ostrzeżeń przy wskaźnikach, terminie i zdjęciu', () => {
    expect(m.indicators.filter((i) => i.warn?.(serebryskie.indicators[i.id].inputs, c)).map((i) => i.id)).toEqual([])
    expect(m.siteFields.filter((f) => f.warn?.(serebryskie.site[f.name])).map((f) => f.name)).toEqual([])
    for (const r of serebryskie.releves) for (const f of m.releves.fields) expect(f.warn?.(r[f.name]) ?? null, f.name).toBeNull()
  })

  it('zdjęcie jak w karcie (16 gatunków w C, 5 mszaków w D), udział U1 100%, koordynator zanonimizowany', () => {
    expect(examples7210).toHaveLength(1)
    const [r] = serebryskie.releves
    const rows = r.species as { name: string; layer: string }[]
    expect(rows.filter((x) => x.layer === 'C')).toHaveLength(16)
    expect(rows.filter((x) => x.layer === 'D')).toHaveLength(5)
    expect([r.area, r.coverC, r.coverD]).toEqual([100, 50, 20])
    for (const x of rows.filter((x) => x.name !== 'Mentha sp.')) expect(findSpecies7210(x.name), x.name).toBeTruthy()
    expect(serebryskie.other.shareU1).toBe(100)
    expect(serebryskie.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(serebryskie)).not.toMatch(/Buczek/)
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, udział FV/U1/U2 i dane stanowiska', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, serebryskie))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['7210 Torfowiska nakredowe', 'Zwarcie szuwarów', 'Udział powierzchni siedliska w stanie U1', 'Rezerwat Bagno Serebryskie 2', 'Cladietum marisci'])
      expect(text, t).toContain(t)
  })
})
