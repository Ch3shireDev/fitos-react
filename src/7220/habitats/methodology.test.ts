import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type GradeOrEmpty, type IndicatorContext, type InputValues, type StructureItem } from '../../7120/habitats/types'
import { examples7220, lasGrabicz } from './examples'
import {
  gradeAliens7220,
  gradeCharacteristic7220,
  gradeDominant7220,
  gradeErosion7220,
  gradeEutrophic7220,
  gradeExpansive7220,
  gradeLiverworts7220,
  gradeTufa7220,
  indicator7220 as ind,
  methodology7220 as m,
  structureRule7220,
  worse7220,
} from './methodology'
import { SPECIES_7220, defaultLayer7220, findSpecies7220, isCharacteristic7220, speciesKey7220 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const EXT = ctx({ site: { speciesList: 'extended' } })
const suggest = (id: string, inputs: InputValues, c = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const warn = (id: string, inputs: InputValues, c = ctx()) => ind(id).warn!(inputs, c)
const explain = (id: string, inputs: InputValues, c = ctx()) => ind(id).explain!(inputs, c)
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => (cover === undefined ? { name } : { name, cover }))

const EROSIONS = ['erosionBack', 'erosionSlope', 'erosionBed', 'erosionChemical']

describe('metodyka 7220 – struktura', () => {
  it('kod *7220 (priorytetowe), 3 zdjęcia bez stałej powierzchni, minitransekt bez domyślnych wymiarów, podtyp i wariant opcjonalne', () => {
    expect(habitatCode(m)).toBe('*7220')
    expect(m.priority).toBe(true)
    expect(m.name).toBe('Źródliska wapienne ze zbiorowiskami Cratoneurion commutati')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBeUndefined()
    const transect = m.siteFields.find((f) => f.name === 'transect')!
    expect([transect.defaultValue, transect.required]).toEqual(['', false])
    for (const n of ['subtype', 'variant', 'speciesList', 'method']) expect(m.siteFields.find((f) => f.name === n)?.required, n).toBeFalsy()
    expect(m.siteFields.filter((f) => f.group === 'Współrzędne geograficzne').map((f) => f.name)).toEqual(['coordStart', 'coordEnd'])
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności tab. 2: powierzchnia + 13 struktury', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Gatunki charakterystyczne',
      'Gatunki dominujące',
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Obce gatunki inwazyjne',
      'Gatunki wskazujące na eutrofizację siedliska',
      'Obecność i pokrycie wątrobowców',
      'Proces wytrącania się martwicy wapiennej',
      'Występowanie martwicy wapiennej',
      'Stan uwodnienia',
      'Erozja wsteczna',
      'Erozja zboczowa',
      'Erozja denna koryta cieków',
      'Erozja chemiczna',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('kardynalne (lista pod tab. 2): 8 – uwodnienie, 4 erozje, proces i występowanie martwicy, gatunki charakterystyczne', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['characteristic', 'process', 'tufa', 'hydration', ...EROSIONS])
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...allOtherFields(m), ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: maj – sierpień bez ostrzeżenia; kwiecień i wrzesień – miękkie; poza kwietniem – wrześniem – twarde', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    for (const ok of ['2024-05-02', '2024-08-24', '2025-06-09']) expect(date.warn!(ok), ok).toBeNull()
    for (const soft of ['2007-09-15', '2024-04-20', '2018-09-09']) expect(date.warn!(soft), soft).toMatch(/poza optymalnym/)
    for (const bad of ['2024-03-30', '2024-10-02']) expect(date.warn!(bad), bad).toMatch(/poza sezonem/)
  })

  it('kody oddziaływań bez duplikatów, z poborem wody, wycinką, wydeptywaniem, erozją, osuwiskami i wyschnięciem', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    expect(codes).toEqual(expect.arrayContaining(['J02.07', 'J02.06', 'B02.02', 'B02.04', 'G05.01', 'K04.05', 'K01.01', 'L05', 'K01.03', 'H01', 'I01', 'G01.03', 'X']))
  })

  it('inne informacje: propozycje, monitoring wymagany z uzasadnieniem, udział FV/U1/U2 przed uwagami', () => {
    const names = allOtherFields(m).map((f) => f.name)
    expect(names).toEqual(expect.arrayContaining(['proposals', 'monitoringRequired', 'justification']))
    expect(names.slice(names.indexOf('shareFV'), names.indexOf('notes') + 1)).toEqual(['shareFV', 'shareU1', 'shareU2', 'notes'])
  })

  it('zdjęcia mają uwagi i warstwy A–D w jednej grupie; uwodnienie – pięć punktów w jednej grupie', () => {
    expect(m.releves.fields.map((f) => f.name)).toContain('remarks')
    expect(m.releves.fields.filter((f) => f.group === 'Zwarcie i wysokość warstw A, B, C, D').map((f) => f.name)).toEqual([
      'coverA', 'coverB', 'coverC', 'coverD', 'heightA', 'heightB', 'heightC', 'heightD',
    ])
    expect(ind('hydration').inputs.filter((f) => f.group).map((f) => f.name)).toEqual(['depth1', 'depth2', 'depth3', 'depth4', 'depth5'])
  })
})

describe('metodyka 7220 – progi tab. 2 (gorsza z oceny za liczbę gatunków i za pokrycie)', () => {
  it('gorsza z dwóch ocen', () => {
    expect(worse7220('FV', 'U1')).toBe('U1')
    expect(worse7220('U2', 'U1')).toBe('U2')
    expect(worse7220('FV', 'FV')).toBe('FV')
  })
  it('gatunki charakterystyczne: ≥3 i ≥25% FV; 1–2 albo <25% U1; brak U2', () => {
    expect(gradeCharacteristic7220(3, 25)).toBe('FV')
    expect(gradeCharacteristic7220(8, 95)).toBe('FV')
    expect(gradeCharacteristic7220(6, 12)).toBe('U1') // Jamne 1, 2024
    expect(gradeCharacteristic7220(1, 75)).toBe('U1') // Mszana Dolna 2024 – ekspert FV
    expect(gradeCharacteristic7220(2, 24.9)).toBe('U1')
    expect(gradeCharacteristic7220(0)).toBe('U2')
    expect(gradeCharacteristic7220(2)).toBe('U1')
    expect(gradeCharacteristic7220(4)).toBeNull()
  })
  it('dominujące (spoza listy): ≤1 i <25% FV; 2–3 i 25–50% U1; >3 i >50% U2', () => {
    expect(gradeDominant7220(0, 0)).toBe('FV')
    expect(gradeDominant7220(1, 24)).toBe('FV')
    expect(gradeDominant7220(1, 25)).toBe('U1')
    expect(gradeDominant7220(2, 10)).toBe('U1')
    expect(gradeDominant7220(3, 50)).toBe('U1')
    expect(gradeDominant7220(1, 80)).toBe('U2') // Podhale 1, 2024 – ekspert U1
    expect(gradeDominant7220(4, 20)).toBe('U2')
    expect(gradeDominant7220(2)).toBeNull()
    expect(gradeDominant7220(5)).toBe('U2')
  })
  it('ekspansywne: ≤1 i <10% FV; 2–3 i 10–50% U1; >3 i >50% U2', () => {
    expect(gradeExpansive7220(1, 9)).toBe('FV')
    expect(gradeExpansive7220(1, 15)).toBe('U1') // sit siny 15%, Jamne 1
    expect(gradeExpansive7220(2, 50)).toBe('U1') // Dolina Kościeliska
    expect(gradeExpansive7220(2, 20)).toBe('U1') // karta z przewodnika – ekspert FV
    expect(gradeExpansive7220(1, 80)).toBe('U2') // Podhale 1
    expect(gradeExpansive7220(8, 65)).toBe('U2') // Wzgórza Sokólskie
  })
  it('obce: brak FV; 1 i <5% U1; ≥2 albo ≥5% U2', () => {
    expect(gradeAliens7220(0)).toBe('FV')
    expect(gradeAliens7220(1, 0.5)).toBe('U1')
    expect(gradeAliens7220(1, 4.9)).toBe('U1')
    expect(gradeAliens7220(1, 5)).toBe('U2')
    expect(gradeAliens7220(1, 20)).toBe('U2') // Dolinka odpływowa 2014
    expect(gradeAliens7220(2, 1)).toBe('U2')
  })
  it('eutrofizacja: brak FV; 1 i ≤10% U1; ≥2 albo >10% U2', () => {
    expect(gradeEutrophic7220(0)).toBe('FV')
    expect(gradeEutrophic7220(1, 10)).toBe('U1')
    expect(gradeEutrophic7220(1, 11)).toBe('U2')
    expect(gradeEutrophic7220(2, 1)).toBe('U2') // 2014: podagrycznik i pokrzywa „zazwyczaj poniżej 5%” → U2
  })
  it('wątrobowce: ≥1 i >10% FV; ≤10% U1; brak U2', () => {
    expect(gradeLiverworts7220(3, 10.5)).toBe('FV')
    expect(gradeLiverworts7220(1, 10)).toBe('U1')
    expect(gradeLiverworts7220(0)).toBe('U2')
    expect(gradeLiverworts7220(2)).toBeNull()
  })
  it('martwica: >5% FV; ≤5% U1; brak U2; erozja: ≤5 FV, ≤20 U1, >20 U2', () => {
    expect([gradeTufa7220(30), gradeTufa7220(5.1), gradeTufa7220(5), gradeTufa7220(1), gradeTufa7220(0)]).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
    expect([gradeErosion7220(0), gradeErosion7220(5), gradeErosion7220(10), gradeErosion7220(20), gradeErosion7220(21)]).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
})

describe('metodyka 7220 – podpowiedzi wskaźników', () => {
  it('gatunki charakterystyczne: katalog (tab. 1 + Montio-Cardaminetea), synonimy raz, „+” jako 0,5; liczba i pokrycie wprost; brak → U2', () => {
    const s = sp(['Palustriella commutata', 40], ['Cratoneuron commutatum', 10], ['Cardamine amara', 5], ['Chrysosplenium alternifolium', 5], ['Pellia endiviifolia'])
    expect(suggest('characteristic', { species: s })).toBe('FV')
    expect(explain('characteristic', { species: s })).toMatch(/z katalogu: 4 .*łączne pokrycie 60,5%.*0,5%/)
    expect(suggest('characteristic', { species: sp(['Palustriella commutata', 30]) })).toBe('U1')
    expect(suggest('characteristic', { species: sp(['Cardamine amara', 5], ['Pellia endiviifolia', 5], ['Cratoneuron filicinum', 5]) })).toBe('U1')
    expect(suggest('characteristic', { count: 4, total: 30 })).toBe('FV')
    expect(suggest('characteristic', { none: 'yes' })).toBe('U2')
    expect(suggest('characteristic', { species: sp(['Veronica montana', 50]) })).toBe('U2')
    expect(suggest('characteristic', { species: s, choice: 'U1' })).toBe('U1')
    expect(warn('characteristic', { species: s, choice: 'U1' })).toMatch(/Wybrano U1, a z liczby gatunków i pokrycia wychodzi FV/)
  })

  it('gatunki charakterystyczne: lista rozszerzona (2018/2024) liczy krótkosza, stożkę, merzyka, świerząbka – wg przewodnika ostrzega', () => {
    const s = sp(['Palustriella commutata', 30], ['Brachythecium rivulare', 10], ['Rhizomnium punctatum', 5], ['Chaerophyllum hirsutum', 5])
    expect(suggest('characteristic', { species: s })).toBe('U1')
    expect(warn('characteristic', { species: s })).toMatch(/Brachythecium rivulare, Rhizomnium punctatum, Chaerophyllum hirsutum – z propozycji rozszerzenia listy/)
    expect(suggest('characteristic', { species: s }, EXT)).toBe('FV')
    expect(warn('characteristic', { species: s }, EXT)).toBeNull()
    expect(warn('characteristic', { species: sp(['Palustriella commutata', 75]) })).toMatch(/2024 r\. przy samym źródliskowcu/)
  })

  it('dominujące: liczy dominanty spoza listy; same charakterystyczne → FV; lista rozszerzona zmienia wynik', () => {
    expect(suggest('dominant', { species: sp(['Palustriella commutata', 80], ['Cardamine amara', 20]) })).toBe('FV')
    expect(explain('dominant', { species: sp(['Palustriella commutata', 80]) })).toMatch(/przypis/)
    expect(suggest('dominant', { none: 'yes' })).toBe('FV')
    const s = sp(['Chaerophyllum hirsutum', 20], ['Brachythecium rivulare', 10], ['Cirsium oleraceum', 10])
    expect(suggest('dominant', { species: s })).toBe('U1')
    expect(suggest('dominant', { species: s }, EXT)).toBe('FV')
    expect(suggest('dominant', { species: sp(['Urtica dioica', 30], ['Glyceria fluitans', 30], ['Circaea lutetiana', 10], ['Alliaria petiolata', 10]) })).toBe('U2')
    expect(warn('dominant', { species: sp(['Petasites hybridus', 80]) })).toMatch(/lepiężnik różowy 80% oceniono U1/)
  })

  it('ekspansywne: bez charakterystycznych (także z listy rozszerzonej) i obcych; ostrzega o obcych i gatunkach typowych', () => {
    expect(suggest('expansive', { species: sp(['Juncus inflexus', 15]) })).toBe('U1')
    expect(suggest('expansive', { species: sp(['Equisetum telmateia']) })).toBe('FV') // pojedyncze osobniki – Jamne 2
    expect(suggest('expansive', { species: sp(['Chaerophyllum hirsutum', 40], ['Impatiens parviflora', 20]) })).toBe('FV')
    expect(warn('expansive', { species: sp(['Chaerophyllum hirsutum', 40], ['Impatiens parviflora', 20]) })).toMatch(/Impatiens parviflora.*Chaerophyllum hirsutum/)
    expect(suggest('expansive', { none: 'yes' })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Petasites hybridus', 10]), total: 80 })).toBe('U2')
    expect(warn('expansive', { species: sp(['Carex remota', 5]) })).toMatch(/nie wymieniane jako ekspansywne/)
  })

  it('obce: brak FV; pojedyncze osobniki U1; 2 gatunki U2; rodzime ostrzegają', () => {
    expect(suggest('aliens', { none: 'yes' })).toBe('FV')
    expect(suggest('aliens', { species: sp(['Heracleum sosnowskyi']) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Impatiens parviflora', 20]) })).toBe('U2')
    expect(suggest('aliens', { species: sp(['Impatiens parviflora', 1], ['Solidago canadensis', 1]) })).toBe('U2')
    expect(warn('aliens', { species: sp(['Urtica dioica', 5]) })).toMatch(/To nie gatunki obce: Urtica dioica/)
    expect(warn('aliens', { none: 'yes', species: sp(['Impatiens parviflora']) })).toMatch(/Nie stwierdzono/)
  })

  it('eutrofizacja: 1 gatunek ≤10% U1, 2 gatunki U2 (bez pokrycia też); charakterystyczne pominięte', () => {
    expect(suggest('eutrophic', { species: sp(['Urtica dioica']) })).toBe('U1')
    expect(suggest('eutrophic', { species: sp(['Urtica dioica', 1], ['Aegopodium podagraria', 1]) })).toBe('U2')
    expect(suggest('eutrophic', { species: sp(['Calliergonella cuspidata', 25]) })).toBe('U2')
    expect(suggest('eutrophic', { species: sp(['Cardamine amara', 20]) })).toBe('FV')
    expect(warn('eutrophic', { species: sp(['Cardamine amara', 20]) })).toMatch(/Nie liczą się/)
    expect(suggest('eutrophic', { none: 'yes' })).toBe('FV')
  })

  it('wątrobowce: >10% FV (Karwickie Źródliska), ≤10% U1, brak U2; nie-wątrobowce ostrzegają', () => {
    expect(suggest('liverworts', { species: sp(['Pellia endiviifolia', 10], ['Plagiochila porelloides', 0.5], ['Trichocolea tomentella', 1]) })).toBe('FV')
    expect(suggest('liverworts', { species: sp(['Conocephalum salebrosum', 2]) })).toBe('U1')
    expect(suggest('liverworts', { none: 'yes' })).toBe('U2')
    expect(suggest('liverworts', { total: 0 })).toBe('U2')
    expect(warn('liverworts', { species: sp(['Palustriella commutata', 20]) })).toMatch(/To nie wątrobowce/)
  })

  it('proces wytrącania: z wyboru, z XX; podtyp 7220-3 przy czynnym wytrącaniu ostrzega', () => {
    expect(['intense', 'trace', 'none', 'unknown'].map((choice) => suggest('process', { choice }))).toEqual(['FV', 'U1', 'U2', 'XX'])
    expect(warn('process', { choice: 'intense' }, ctx({ site: { subtype: '7220-3' } }))).toMatch(/kopalną martwicą/)
    expect(warn('process', { choice: 'none' }, ctx({ site: { subtype: '7220-1' } }))).toMatch(/zakłada czynne wytrącanie/)
    expect(warn('process', { choice: 'intense' }, ctx({ site: { subtype: '7220-1' } }))).toBeNull()
    expect(ind('process').describe!({ choice: 'trace', substrate: 'organic', conductivity: 450, note: '' })).toBe(
      'Martwica wapienna wytrąca się śladowo, podłoże organiczne (mszaki, liście, gałęzie, martwe części roślin), przewodność 450 µS/cm',
    )
  })

  it('występowanie martwicy: pokrycie ma pierwszeństwo przed „liczne/nieliczne/brak”; rozjazd ostrzega; XX z wyboru', () => {
    expect(suggest('tufa', { cover: 3 })).toBe('U1')
    expect(suggest('tufa', { abundance: 'many' })).toBe('FV')
    expect(suggest('tufa', { cover: 2, abundance: 'many' })).toBe('U1')
    expect(warn('tufa', { cover: 2, abundance: 'many' })).toMatch(/formularz bierze pokrycie/)
    expect(suggest('tufa', { cover: 0 })).toBe('U2')
    expect(suggest('tufa', { choice: 'XX' })).toBe('XX')
    expect(ind('tufa').describe!({ cover: 90, tufaType: 'martwica mszysta, progi', fossil: 'tak' })).toBe('Martwica pokrywa ok. 90% stanowiska; martwica mszysta, progi; obecna martwica kopalna')
  })

  it('uwodnienie: z wyboru; pomiary w opisie; „właściwy” przy wodzie płytszej niż 0,5 cm ostrzega', () => {
    expect(['proper', 'weak', 'improper'].map((choice) => suggest('hydration', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(explain('hydration', { depth1: 10, depth2: 15, depth3: 7 })).toBe('Pomiary: 10, 15, 7 cm (średnio 10,7 cm).')
    expect(warn('hydration', { choice: 'proper', depth1: 0.2, depth2: 0 })).toMatch(/0,5 cm/)
    expect(warn('hydration', { choice: 'proper', depth1: 0.2, depth2: 1 })).toBeNull()
    expect(ind('hydration').describe!({ choice: 'weak', depth1: 1 })).toBe('Słaby; głębokość wody: 1 cm')
  })

  it('erozje: udział, „nie stwierdzono”, ocena z XX; rozjazd ostrzega', () => {
    for (const id of EROSIONS) {
      expect(suggest(id, { share: 10 }), id).toBe('U1')
      expect(suggest(id, { none: 'yes' }), id).toBe('FV')
      expect(suggest(id, { choice: 'XX' }), id).toBe('XX')
      expect(warn(id, { choice: 'FV', share: 30 }), id).toMatch(/wychodzi U2/)
    }
    expect(ind('erosionBed').describe!({ share: 20 })).toBe('Ok. 20% powierzchni siedliska')
  })

  it('katalog: mszaki w D, runo w C, bez duplikatów, synonimy jednym kluczem, lista rozszerzona osobno', () => {
    const latin = SPECIES_7220.map((s) => s.latin)
    expect(new Set(latin).size).toBe(latin.length)
    expect(defaultLayer7220(findSpecies7220('Palustriella commutata')!)).toBe('D')
    expect(defaultLayer7220(findSpecies7220('Cardamine amara')!)).toBe('C')
    expect(defaultLayer7220(findSpecies7220('Sambucus nigra')!)).toBe('B')
    expect(speciesKey7220('Cratoneuron commutatum')).toBe(speciesKey7220('Palustriella commutata'))
    expect(speciesKey7220('Pellia endiviaefolia')).toBe(speciesKey7220('Pellia endiviifolia'))
    expect(isCharacteristic7220('Chrysosplenium alternifolium')).toBe(true)
    expect(isCharacteristic7220('Brachythecium rivulare')).toBe(false)
    expect(isCharacteristic7220('Brachythecium rivulare', true)).toBe(true)
    expect(m.speciesInfo!('Brachythecium rivulare')).toMatch(/propozycja rozszerzenia/)
    expect(m.speciesInfo!('Conocephalum conicum')).toMatch(/wątrobowiec/)
  })
})

describe('metodyka 7220 – ocena struktury i ogólna', () => {
  const items = (cardinal: GradeOrEmpty[], others: GradeOrEmpty[]): StructureItem[] => [
    ...cardinal.map((grade, n) => ({ id: `c${n}`, grade, cardinal: true })),
    ...others.map((grade, n) => ({ id: `o${n}`, grade, cardinal: false })),
  ]
  it('reguła struktury: jak silnik; XX w erozji chemicznej pomijane, w innym kardynalnym – XX', () => {
    expect(structureRule7220(items(['FV', 'FV'], ['FV', 'U1']))).toBe('FV')
    expect(structureRule7220(items(['FV', 'U1'], ['FV']))).toBe('U1')
    expect(structureRule7220(items(['FV', 'FV'], ['U2', 'U2', 'U2']))).toBe('U1')
    expect(structureRule7220(items(['U2', 'FV'], ['FV']))).toBe('U2')
    expect(structureRule7220(items(['XX', 'FV'], ['FV']))).toBe('XX')
    expect(structureRule7220([...items(['FV'], ['FV']), { id: 'erosionChemical', grade: 'XX', cardinal: true }])).toBe('FV')
    expect(structureRule7220([...items(['FV'], ['FV']), { id: 'erosionChemical', grade: 'U2', cardinal: true }])).toBe('U2')
    expect(structureRule7220(items(['FV', ''], ['FV']))).toBe('')
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

  it('karta: wątrobowce U2 → struktura U1; erozja wsteczna U2 → U2; erozja chemiczna XX → FV; ocena ogólna – najgorszy decyduje', () => {
    expect(assessCard(m, all('FV'))).toMatchObject({ structure: 'FV', overall: 'FV' })
    expect(assessCard(m, withGrades(all('FV'), { liverworts: 'U2', eutrophic: 'U2' }))).toMatchObject({ structure: 'U1', overall: 'U1' })
    expect(assessCard(m, withGrades(all('FV'), { erosionBack: 'U2' }))).toMatchObject({ structure: 'U2', overall: 'U2' })
    expect(assessCard(m, withGrades(all('FV'), { erosionChemical: 'XX' }))).toMatchObject({ structure: 'FV', overall: 'FV' })
    expect(assessCard(m, withGrades(all('FV'), { tufa: 'XX' })).structure).toBe('XX')
    expect(assessCard(m, withGrades(all('FV'), { area: 'U1' })).overall).toBe('U1')
  })
})

describe('przykład Las Grabicz 1 (karta z przewodnika, 2007)', () => {
  const c = ctx({ site: lasGrabicz.site, indicators: lasGrabicz.indicators })
  const v = lasGrabicz.indicators

  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(lasGrabicz)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie: charakterystyczne U1, powierzchnia XX, reszta FV; perspektywy XX', () => {
    const grades = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x.grade]))
    expect(grades).toEqual(Object.fromEntries(m.indicators.map((i) => [i.id, i.id === 'area' ? 'XX' : i.id === 'characteristic' ? 'U1' : 'FV'])))
    expect(lasGrabicz.prospects.grade).toBe('XX')
  })

  it('parametry liczone wg tab. 2: struktura U1 (kardynalne gatunki charakterystyczne U1), ocena ogólna U1 – karta wpisuje FV/FV', () => {
    expect(assessCard(m, lasGrabicz)).toMatchObject({ area: 'XX', structure: 'U1', prospects: 'XX', overall: 'U1', missing: [] })
  })

  it('podpowiedzi zgodne z ekspertem poza trzema wskaźnikami, gdzie karta odbiega od tab. 2', () => {
    const differs = m.indicators.filter((i) => i.suggest!(v[i.id].inputs, c) !== v[i.id].grade).map((i) => [i.id, i.suggest!(v[i.id].inputs, c)])
    expect(differs).toEqual([
      ['dominant', 'U2'],
      ['expansive', 'U1'],
      ['eutrophic', 'U2'],
    ])
    // z listą rozszerzoną dominanty to U1 (ostrożeń i sadziec, 20%)
    expect(suggest('dominant', v.dominant.inputs, EXT)).toBe('U1')
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    for (const i of m.indicators) expect(i.describe!(v[i.id].inputs, c), i.id).toBe(v[i.id].value)
  })

  it('ostrzeżenia: przetacznik górski poza listą, dominanty z listy rozszerzonej; termin 15.09 – poza optymalnym', () => {
    const warned = m.indicators.filter((i) => i.warn?.(v[i.id].inputs, c)).map((i) => i.id)
    expect(warned).toEqual(['characteristic', 'dominant'])
    expect(warn('characteristic', v.characteristic.inputs, c)).toBe('Nie liczą się jako charakterystyczne: Veronica montana.')
    expect(warn('dominant', v.dominant.inputs, c)).toMatch(/^Chaerophyllum hirsutum, Brachythecium rivulare, Conocephalum conicum – typowe dla źródlisk/)
    expect(m.siteFields.filter((f) => f.warn?.(lasGrabicz.site[f.name])).map((f) => f.name)).toEqual(['date'])
    for (const r of lasGrabicz.releves) for (const f of m.releves.fields) expect(f.warn?.(r[f.name]) ?? null, f.name).toBeNull()
  })

  it('zdjęcia jak w karcie (29, 16 i 21 gatunków), mszaki w D, udział FV 90% + U1 10%, koordynator zanonimizowany', () => {
    expect(examples7220).toHaveLength(1)
    expect(lasGrabicz.releves.map((r) => (r.species as unknown[]).length)).toEqual([29, 16, 21])
    expect(lasGrabicz.releves.map((r) => [r.area, r.slope, r.coverC, r.coverD, r.heightC])).toEqual([
      [30, 1, 70, 10, 50],
      [25, 1, 100, 60, 180],
      [30, 3, 70, 15, 30],
    ])
    const rows = lasGrabicz.releves.flatMap((r) => r.species as { name: string; layer: string }[])
    for (const r of rows) {
      expect(findSpecies7220(r.name), r.name).toBeTruthy()
      expect(r.layer, r.name).toBe(defaultLayer7220(findSpecies7220(r.name)!))
    }
    const o = lasGrabicz.other
    expect(Number(o.shareFV) + Number(o.shareU1) + Number(o.shareU2)).toBe(100)
    expect(lasGrabicz.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(lasGrabicz)).not.toMatch(/Parusel/)
  })
})

describe('eksport .docx przykładu', () => {
  it('ma kod z gwiazdką, wskaźniki, oceny, udział FV/U1/U2 i dane stanowiska', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, lasGrabicz))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['*7220 Źródliska wapienne', 'Proces wytrącania się martwicy wapiennej', 'Erozja chemiczna', 'Udział powierzchni siedliska w stanie FV', 'Las Grabicz 1', 'Cratoneurion commutati'])
      expect(text, t).toContain(t)
  })
})
