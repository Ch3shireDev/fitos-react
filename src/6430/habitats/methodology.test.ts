import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { brona, examples6430 } from './examples'
import {
  gradeAliens6430,
  gradeCharacteristic6430,
  gradeExpansive6430,
  gradeRichness6430,
  indicator6430 as ind,
  methodology6430 as m,
} from './methodology'
import { SPECIES_6430, defaultLayer6430, findSpecies6430, isCharacteristic6430, speciesKey6430 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues, c = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const warn = (id: string, inputs: InputValues, c = ctx()) => ind(id).warn!(inputs, c)
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => (cover === undefined ? { name } : { name, cover }))

describe('metodyka 6430 – struktura', () => {
  it('kod 6430 (nie priorytetowe), 3 zdjęcia po 25 m², podtyp opcjonalny', () => {
    expect(habitatCode(m)).toBe('6430')
    expect(m.priority).toBeFalsy()
    expect(m.name).toBe('Ziołorośla górskie (Adenostylion alliariae) i ziołorośla nadrzeczne (Convolvuletalia sepium)')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(m.siteFields.find((f) => f.name === 'subtype')?.required).toBeFalsy()
    expect(m.siteFields.filter((f) => f.group === 'Współrzędne geograficzne').map((f) => f.name)).toEqual(['coordStart', 'coordMiddle', 'coordEnd'])
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności karty przykładowej: powierzchnia + 6 struktury', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Gatunki charakterystyczne',
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Bogactwo gatunkowe',
      'Obce gatunki inwazyjne',
      'Naturalność koryta rzecznego (brak regulacji)',
      'Naturalny kompleks siedlisk',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('kardynalny (lista pod tab. 2): tylko gatunki charakterystyczne', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['characteristic'])
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

  it('termin: optymalnie 15.06–31.08 bez ostrzeżenia; czerwiec i wrzesień – miękkie; poza czerwiec–10.10 – twarde', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    for (const ok of ['2024-06-15', '2016-08-16', '2024-08-31']) expect(date.warn!(ok), ok).toBeNull()
    for (const soft of ['2024-06-03', '2011-09-15', '2024-10-05']) expect(date.warn!(soft), soft).toMatch(/poza optymalnym/)
    for (const bad of ['2024-05-20', '2024-10-20']) expect(date.warn!(bad), bad).toMatch(/poza dopuszczalnym/)
  })

  it('kody oddziaływań bez duplikatów, z regulacją koryt, zrywką, gatunkami obcymi, odpadami, erozją i lawinami', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    expect(codes).toEqual(expect.arrayContaining(['J02.03', 'B02.02', 'I01', 'I02', 'E03.04', 'H05.01', 'K01.01', 'L04', 'G01.02', 'A03', 'M01.02']))
  })

  it('inne informacje: propozycje, monitoring wymagany z uzasadnieniem, udział FV/U1/U2 przed uwagami', () => {
    const names = allOtherFields(m).map((f) => f.name)
    expect(names).toEqual(expect.arrayContaining(['proposals', 'monitoringRequired', 'justification']))
    expect(names.slice(names.indexOf('shareFV'), names.indexOf('notes') + 1)).toEqual(['shareFV', 'shareU1', 'shareU2', 'notes'])
  })

  it('zdjęcia mają uwagi i warstwy B, C, D w jednej grupie', () => {
    const names = m.releves.fields.map((f) => f.name)
    expect(names).toContain('remarks')
    expect(m.releves.fields.filter((f) => f.group === 'Zwarcie i wysokość warstw B, C, D').map((f) => f.name)).toEqual(['coverB', 'coverC', 'coverD', 'heightB', 'heightC', 'heightD'])
  })
})

describe('metodyka 6430 – progi tab. 2', () => {
  it('gatunki charakterystyczne: ≥4 FV, 2–3 U1, 0–1 U2', () => {
    expect([0, 1, 2, 3, 4, 7].map(gradeCharacteristic6430)).toEqual(['U2', 'U2', 'U1', 'U1', 'FV', 'FV'])
  })
  it('ekspansywne: <10 FV, 10–25 U1 (obie granice), >25 U2', () => {
    expect([0, 9.9, 10, 25, 25.5].map(gradeExpansive6430)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('bogactwo: >20 FV, 10–20 U1 (obie granice), <10 U2', () => {
    expect([23.7, 20.1, 20, 10, 9.9].map(gradeRichness6430)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('obce: brak FV; <1% U1 (1% też – luka w tab. 2); >1% U2; obecne bez pokrycia U1', () => {
    expect(gradeAliens6430(0)).toBe('FV')
    expect(gradeAliens6430(0.5)).toBe('U1')
    expect(gradeAliens6430(1)).toBe('U1')
    expect(gradeAliens6430(2)).toBe('U2')
    expect(gradeAliens6430(0, true)).toBe('U1')
  })
})

describe('metodyka 6430 – podpowiedzi wskaźników', () => {
  it('gatunki charakterystyczne: z listy (synonimy raz), liczba wprost, ocena ekspercka', () => {
    expect(suggest('characteristic', { species: sp(['Calystegia sepium']) })).toBe('U2') // niż: sam kielisznik
    expect(suggest('characteristic', { species: sp(['Calystegia sepium'], ['Epilobium hirsutum'], ['Galium rivale']) })).toBe('U1')
    expect(suggest('characteristic', { species: sp(['Senecio fuchsii'], ['Senecio ovatus'], ['Petasites albus'], ['Stellaria nemorum']) })).toBe('U1')
    expect(suggest('characteristic', { species: sp(['Petasites albus'], ['Stellaria nemorum'], ['Chaerophyllum hirsutum'], ['Aconitum plicatum']) })).toBe('FV')
    expect(suggest('characteristic', { count: 3 })).toBe('U1')
    expect(suggest('characteristic', { count: 5, choice: 'U1' })).toBe('U1')
    expect(warn('characteristic', { count: 5, choice: 'U1' })).toMatch(/uzasadnij/)
    expect(suggest('characteristic', {})).toBeNull()
  })

  it('sadziec konopiasty: w tab. 1 ekspansywny – nie liczy się jako charakterystyczny i ostrzega', () => {
    expect(isCharacteristic6430('Eupatorium cannabinum')).toBe(false)
    expect(suggest('characteristic', { species: sp(['Calystegia sepium'], ['Eupatorium cannabinum']) })).toBe('U2')
    expect(warn('characteristic', { species: sp(['Eupatorium cannabinum']) })).toMatch(/postuluje/)
    expect(warn('characteristic', { species: sp(['Urtica dioica']) })).toMatch(/Nie liczą się/)
  })

  it('ekspansywne: suma bez charakterystycznych i obcych; łączne pokrycie i ocena mają pierwszeństwo', () => {
    expect(suggest('expansive', { none: 'yes' })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Phalaris arundinacea', 20], ['Rubus idaeus', 5]) })).toBe('U1')
    expect(suggest('expansive', { species: sp(['Chamaenerion angustifolium', 30]) })).toBe('U2') // Kondratowa
    expect(suggest('expansive', { species: sp(['Phalaris arundinacea', 5], ['Calystegia sepium', 40], ['Impatiens parviflora', 20]) })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Phalaris arundinacea']) })).toBeNull()
    expect(suggest('expansive', { species: sp(['Phalaris arundinacea', 5]), total: 30 })).toBe('U2')
    expect(suggest('expansive', { species: sp(['Phalaris arundinacea', 30]), choice: 'U1' })).toBe('U1')
    expect(warn('expansive', { species: sp(['Impatiens parviflora', 5]) })).toMatch(/Obce gatunki inwazyjne/)
    expect(warn('expansive', { species: sp(['Calystegia sepium', 5]) })).toMatch(/charakterystyczne/)
  })

  it('bogactwo: średnia z trzech zdjęć albo wpisana wprost; rozjazd ostrzega', () => {
    expect(suggest('richness', { n1: 25, n2: 24, n3: 22 })).toBe('FV')
    expect(ind('richness').describe!({ n1: 25, n2: 24, n3: 22 })).toBe('W zdjęciach 1, 2 i 3: 25, 24, 22 gat.; średnio 23,7 gat./zdjęcie')
    expect(suggest('richness', { n1: 18, n2: 22, n3: 20 })).toBe('U1')
    expect(suggest('richness', { count: 9 })).toBe('U2')
    expect(ind('richness').describe!({ count: 9 })).toBe('Średnio 9 gat./zdjęcie')
    expect(warn('richness', { n1: 25, n2: 24, n3: 22, count: 23.7 })).toBeNull()
    expect(warn('richness', { n1: 25, n2: 24, n3: 22, count: 18 })).toMatch(/nie zgadza/)
    expect(suggest('richness', {})).toBeNull()
  })

  it('obce: brak FV, pojedyncze osobniki U1, 2–3% U2 (praktyka 2024), bez pokrycia – brak podpowiedzi', () => {
    expect(suggest('aliens', { none: 'yes' })).toBe('FV')
    expect(suggest('aliens', { species: sp(['Impatiens parviflora', 0.5]) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Solidago gigantea', 2], ['Echinocystis lobata', 1]) })).toBe('U2')
    expect(suggest('aliens', { total: 2 })).toBe('U2')
    expect(suggest('aliens', { species: sp(['Impatiens parviflora']) })).toBeNull()
    expect(suggest('aliens', { species: sp(['Impatiens parviflora']), total: 0.5 })).toBe('U1')
    expect(suggest('aliens', {})).toBeNull()
    expect(warn('aliens', { species: sp(['Capsella bursa-pastoris', 0.5]) })).toMatch(/bez tendencji do inwazji/)
    expect(warn('aliens', { species: sp(['Phalaris arundinacea', 5]) })).toMatch(/To nie gatunki obce.*rodzime ekspansywne/)
    expect(warn('aliens', { species: sp(['Impatiens glandulifera', 1]), none: 'yes' })).toMatch(/Nie stwierdzono/)
  })

  it('koryto: „nie dotyczy” daje XX, które nie psuje oceny struktury (wskaźnik niekardynalny)', () => {
    expect(suggest('river', { choice: 'natural' })).toBe('FV')
    expect(suggest('river', { choice: 'traces' })).toBe('U1')
    expect(suggest('river', { choice: 'regulated' })).toBe('U2')
    expect(suggest('river', { choice: 'na' })).toBe('XX')
  })

  it('kompleks siedlisk i powierzchnia: z wyboru', () => {
    expect(suggest('complex', { choice: 'seminatural' })).toBe('U1')
    expect(suggest('complex', { choice: 'synanthropic' })).toBe('U2')
    expect(suggest('area', { choice: 'decrease' })).toBe('U2')
    expect(suggest('area', { choice: 'unknown' })).toBe('XX')
  })

  it('katalog: krzewy w B, mchy w D, runo w C, bez duplikatów, synonimy jednym kluczem', () => {
    const latin = SPECIES_6430.map((s) => s.latin.toLowerCase())
    expect(new Set(latin).size).toBe(latin.length)
    expect(defaultLayer6430(findSpecies6430('Rubus idaeus')!)).toBe('B')
    expect(defaultLayer6430(findSpecies6430('Rhizomnium punctatum')!)).toBe('D')
    expect(defaultLayer6430(findSpecies6430('Petasites kablikianus')!)).toBe('C')
    expect(speciesKey6430('Senecio ovatus')).toBe(speciesKey6430('Senecio fuchsii'))
    expect(speciesKey6430('Mulgedium alpinum')).toBe(speciesKey6430('Cicerbita alpina'))
    // tab. 1: 7 gatunków górskich i 8 niżowych (bez synonimów)
    const tab1 = SPECIES_6430.filter((s) => s.source === 'tab1' && s.group === 'characteristic')
    expect(new Set(tab1.filter((s) => !s.lowland).map((s) => speciesKey6430(s.latin))).size).toBe(7)
    expect(new Set(tab1.filter((s) => s.lowland).map((s) => speciesKey6430(s.latin))).size).toBe(8)
    // tab. 1: 7 gatunków ekspansywnych
    expect(new Set(SPECIES_6430.filter((s) => s.source === 'tab1' && s.group === 'expansive').map((s) => speciesKey6430(s.latin))).size).toBe(7)
    expect(m.speciesInfo!('Calystegia sepium')).toMatch(/niżowe; tab\. 1/)
    expect(m.speciesInfo!('Valeriana sambucifolia')).toMatch(/karta przykładowa/)
    expect(m.speciesInfo!('Eupatorium cannabinum')).toMatch(/postuluje/)
    expect(m.speciesInfo!('Thlaspi arvense')).toMatch(/bez tendencji/)
  })
})

describe('metodyka 6430 – ocena struktury i ogólna (reguła ogólna silnika)', () => {
  const all = (g: Grade): CardValues => {
    const v = emptyCardValues(m)
    for (const i of m.indicators) v.indicators[i.id] = { inputs: {}, value: 'x', grade: g }
    v.prospects = { value: 'x', grade: g }
    return v
  }
  const withGrade = (base: CardValues, id: string, g: Grade): CardValues => ({ ...base, indicators: { ...base.indicators, [id]: { ...base.indicators[id], grade: g } } })

  it('wszystko FV → FV; niekardynalny U1 → FV; niekardynalny U2 (obce) → U1; koryto XX → FV', () => {
    expect(assessCard(m, all('FV'))).toMatchObject({ structure: 'FV', overall: 'FV' })
    expect(assessCard(m, withGrade(all('FV'), 'complex', 'U1')).structure).toBe('FV')
    expect(assessCard(m, withGrade(all('FV'), 'aliens', 'U2'))).toMatchObject({ structure: 'U1', overall: 'U1' })
    expect(assessCard(m, withGrade(all('FV'), 'river', 'XX'))).toMatchObject({ structure: 'FV', overall: 'FV' })
  })

  it('gatunki charakterystyczne U1 → U1 (Hulskie, Kalnica 2024); U2 → U2', () => {
    expect(assessCard(m, withGrade(all('FV'), 'characteristic', 'U1'))).toMatchObject({ structure: 'U1', overall: 'U1' })
    expect(assessCard(m, withGrade(all('FV'), 'characteristic', 'U2')).structure).toBe('U2')
  })
})

describe('przykład Między Kościółkami a przełęczą Brona (karta z przewodnika, 2011)', () => {
  const c = ctx({ site: brona.site, indicators: brona.indicators })

  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(brona)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie – wszystkie FV', () => {
    const grades = Object.fromEntries(Object.entries(brona.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual(Object.fromEntries(m.indicators.map((i) => [i.id, 'FV'])))
  })

  it('parametry i ocena ogólna jak w karcie: wszystko FV', () => {
    expect(assessCard(m, brona)).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV', missing: [] })
  })

  it('podpowiedzi formularza zgodne z ekspertem przy każdym wskaźniku', () => {
    for (const i of m.indicators) expect(i.suggest!(brona.indicators[i.id].inputs, c), i.id).toBe(brona.indicators[i.id].grade)
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    for (const i of m.indicators) expect(i.describe!(brona.indicators[i.id].inputs, c), i.id).toBe(brona.indicators[i.id].value)
  })

  it('bez ostrzeżeń przy wskaźnikach i zdjęciach; jedyne ostrzeżenie stanowiska – późny termin (15.09), o którym pisze sama karta', () => {
    for (const i of m.indicators) expect(i.warn?.(brona.indicators[i.id].inputs, c) ?? null, i.id).toBeNull()
    const siteWarnings = m.siteFields.filter((f) => f.warn?.(brona.site[f.name])).map((f) => f.name)
    expect(siteWarnings).toEqual(['date'])
    expect(String(brona.other.notes)).toMatch(/późny termin/)
    for (const r of brona.releves) for (const f of m.releves.fields) expect(f.warn?.(r[f.name]) ?? null, f.name).toBeNull()
  })

  it('zdjęcia jak w karcie (22, 22 i 20 gatunków wpisanych), malina w B, udział FV 100%, koordynator zanonimizowany', () => {
    expect(examples6430).toHaveLength(1)
    expect(brona.releves.map((r) => (r.species as unknown[]).length)).toEqual([22, 22, 20])
    expect(brona.releves.map((r) => [r.altitude, r.area, r.slope, r.exposure, r.coverB, r.coverC, r.coverD, r.heightB, r.heightC, r.heightD])).toEqual([
      [1560, 25, 45, 'NE', 1, 80, 60, 0.6, 60, 2],
      [1550, 25, 40, 'NE', 3, 90, 60, 0.6, 60, 2],
      [1490, 25, 40, 'NE', 1, 90, 30, 0.6, 60, 2],
    ])
    const rows = brona.releves.flatMap((r) => r.species as { name: string; layer: string }[])
    for (const r of rows) expect(findSpecies6430(r.name), r.name).toBeTruthy()
    expect(rows.filter((r) => r.layer === 'B').map((r) => r.name)).toEqual(['Rubus idaeus', 'Rubus idaeus', 'Rubus idaeus'])
    // karta liczy 7 gatunków charakterystycznych, 5 z nich z tab. 1
    const names = (brona.indicators.characteristic.inputs.species as { name: string }[]).map((s) => s.name)
    expect(names.filter(isCharacteristic6430)).toHaveLength(7)
    expect(names.filter((n) => findSpecies6430(n)?.source === 'tab1')).toHaveLength(5)
    const o = brona.other
    expect(Number(o.shareFV) + Number(o.shareU1) + Number(o.shareU2)).toBe(100)
    expect(brona.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(brona)).not.toMatch(/Stawowczyk/)
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, udział FV/U1/U2 i dane stanowiska', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, brona))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['6430 Ziołorośla górskie', 'Naturalność koryta rzecznego', 'Udział powierzchni siedliska w stanie FV', 'Między Kościółkami a przełęczą Brona', 'Adenostyletum alliariae'])
      expect(text, t).toContain(t)
  })
})
