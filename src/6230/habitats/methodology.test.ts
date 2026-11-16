import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { examples6230, piorunowiec } from './examples'
import {
  gradeAliens6230,
  gradeCharacteristic6230,
  gradeDominant6230,
  gradeEutrophication6230,
  gradeExpansive6230,
  gradeNardus6230,
  gradeRichness6230,
  gradeShrubs6230,
  indicator6230 as ind,
  methodology6230 as m,
} from './methodology'
import { SPECIES_6230, defaultLayer6230, findSpecies6230, isCharacteristic6230, speciesKey6230 } from './species'

const ctx = (site: InputValues = {}): IndicatorContext => ({ site })
const suggest = (id: string, inputs: InputValues, site: InputValues = {}): Grade | null => ind(id).suggest!(inputs, ctx(site))
const warn = (id: string, inputs: InputValues, site: InputValues = {}) => ind(id).warn?.(inputs, ctx(site)) ?? null
const explain = (id: string, inputs: InputValues, site: InputValues = {}) => ind(id).explain!(inputs, ctx(site))
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => (cover === undefined ? { name } : { name, cover }))
const siteWarn = (name: string, v: unknown) => m.siteFields.find((f) => f.name === name)!.warn!(v)

describe('metodyka 6230 – struktura', () => {
  it('kod *6230 (priorytetowe), podtyp i piętro wymagane, transekt 10×200 m, 3 zdjęcia po 25 m²', () => {
    expect(habitatCode(m)).toBe('*6230')
    expect(m.priority).toBe(true)
    expect(m.name).toBe('Bogate florystycznie górskie i niżowe murawy bliźniczkowe (Nardetalia – płaty bogate florystycznie)')
    const site = (n: string) => m.siteFields.find((f) => f.name === n)!
    expect(site('subtype').required).toBe(true)
    expect(site('belt').required).toBe(true)
    expect(site('transect').defaultValue).toBe('10x200 m')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki jak w tab. 2: powierzchnia + 8 struktury, nic wyłączonego', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Gatunki charakterystyczne',
      'Gatunki dominujące',
      'Bogactwo gatunkowe',
      'Obce gatunki inwazyjne',
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Ekspansja krzewów i podrostu drzew',
      'Eutrofizacja',
      'Struktura przestrzenna płatów siedliska',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('kardynalne (lista pod tab. 2): gatunki charakterystyczne, ekspansywne, krzewy, struktura przestrzenna', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['characteristic', 'expansive', 'shrubs', 'spatial'])
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...allOtherFields(m), ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: bez ostrzeżenia od połowy lipca do końca sierpnia', () => {
    for (const d of ['2024-07-15', '2007-08-17', '2024-08-31']) expect(siteWarn('date', d), d).toBeNull()
    for (const d of ['2024-07-14', '2024-09-01', '2024-06-16']) expect(siteWarn('date', d), d).toMatch(/poza optymalnym oknem/)
  })

  it('transekt: 20 arów bez ostrzeżenia (10×200, 200×10, 20×100), inaczej ostrzeżenie', () => {
    for (const t of ['10x200 m', '200×10 m', '20x100 m']) expect(siteWarn('transect', t), t).toBeNull()
    expect(siteWarn('transect', '10x100 m')).toMatch(/1000 m²/)
  })

  it('kody oddziaływań bez duplikatów, z wypasem, koszeniem, zalesianiem, nawożeniem, sukcesją i obcymi', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['A03', 'A04.03', 'A08', 'B01', 'F04', 'D01.01', 'I01', 'I02', 'K02', 'K02.03', 'X']) expect(codes, c).toContain(c)
  })

  it('inne informacje: propozycje po zabiegach, udział FV/U1/U2 przed uwagami', () => {
    const names = allOtherFields(m).map((f) => f.name)
    expect(names.indexOf('proposals')).toBe(names.indexOf('conservation') + 1)
    expect(names.slice(names.indexOf('shareFV'), names.indexOf('notes') + 1)).toEqual(['shareFV', 'shareU1', 'shareU2', 'notes'])
  })
})

describe('metodyka 6230 – progi tab. 2 i modyfikacji 2015', () => {
  it('gatunki charakterystyczne: >6 FV, 4–6 U1, <4 U2', () => {
    expect([0, 3, 4, 6, 7, 12].map(gradeCharacteristic6230)).toEqual(['U2', 'U2', 'U1', 'U1', 'FV', 'FV'])
  })

  it('gatunki dominujące: bliźniczka >50 FV, 30–50 U1, <30 U2; inne >25%: 1–2 U1, >2 U2; gorsza z dwóch', () => {
    expect([29.9, 30, 50, 50.1].map(gradeNardus6230)).toEqual(['U2', 'U1', 'U1', 'FV'])
    expect(gradeDominant6230(80, 0)).toBe('FV')
    expect(gradeDominant6230(80, 1)).toBe('U1')
    expect(gradeDominant6230(80, 3)).toBe('U2')
    expect(gradeDominant6230(20, 0)).toBe('U2')
    expect(gradeDominant6230(20, 0, true)).toBe('FV')
    expect(gradeDominant6230(40, 2)).toBe('U1')
  })

  it('bogactwo: >25 FV, 10–25 U1, <10 U2; w piętrze subalpejskim >13, 7–13, <7', () => {
    expect([9, 10, 25, 26].map((n) => gradeRichness6230(n))).toEqual(['U2', 'U1', 'U1', 'FV'])
    expect([6, 7, 13, 14].map((n) => gradeRichness6230(n, true))).toEqual(['U2', 'U1', 'U1', 'FV'])
  })

  it('obce: brak FV, do 10% U1 (10 też), >10% U2', () => {
    expect(gradeAliens6230(0)).toBe('FV')
    expect(gradeAliens6230(1)).toBe('U1')
    expect(gradeAliens6230(3, 1)).toBe('U1')
    expect(gradeAliens6230(1, 10)).toBe('U1')
    expect(gradeAliens6230(1, 10.5)).toBe('U2')
    expect(gradeAliens6230(0, 2)).toBe('U1')
  })

  it('ekspansywne: <20 FV, 20–30 U1 (obie granice), >30 U2', () => {
    expect([0, 19.9, 20, 30, 30.1, 40].map(gradeExpansive6230)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('krzewy: ostre 10/40, łagodne (jałowiec) 25/50', () => {
    expect([9.9, 10, 40, 40.1].map((c) => gradeShrubs6230(c))).toEqual(['FV', 'U1', 'U1', 'U2'])
    expect([24.9, 25, 50, 50.1].map((c) => gradeShrubs6230(c, true))).toEqual(['FV', 'U1', 'U1', 'U2'])
  })

  it('eutrofizacja z pokrycia gatunków nitrofilnych: 0 FV, <10 U1, ≥10 U2', () => {
    expect([0, 0.5, 9.9, 10, 30].map(gradeEutrophication6230)).toEqual(['FV', 'U1', 'U1', 'U2', 'U2'])
  })
})

describe('metodyka 6230 – podpowiedzi z pól', () => {
  it('powierzchnia: z wyboru, XX przy braku danych, U2 przy zaniku', () => {
    expect(suggest('area', { choice: 'stable' })).toBe('FV')
    expect(suggest('area', { choice: 'other' })).toBe('U1')
    expect(suggest('area', { choice: 'clearDecrease' })).toBe('U2')
    expect(suggest('area', { choice: 'lost' })).toBe('U2')
    expect(suggest('area', { choice: 'unknown' })).toBe('XX')
    expect(suggest('area', {})).toBeNull()
    expect(ind('area').describe!({ choice: 'stable', areaHa: 0.5 }, ctx())).toBe('0,5 ha')
  })

  it('gatunki charakterystyczne: z listy (synonimy raz), liczba wprost ma pierwszeństwo, dziurawiec tylko w Polygalo-Nardetum', () => {
    const seven = sp(['Nardus stricta', 60], ['Carex pilulifera'], ['Danthonia decumbens'], ['Sieglingia decumbens'], ['Potentilla erecta'], ['Luzula campestris'], ['Viola canina'], ['Polygala vulgaris'])
    expect(suggest('characteristic', { species: seven })).toBe('FV')
    expect(suggest('characteristic', { species: sp(['Nardus stricta'], ['Galium saxatile'], ['Agrostis capillaris']) })).toBe('U2')
    expect(suggest('characteristic', { species: sp(['Nardus stricta']), count: 5 })).toBe('U1')
    expect(suggest('characteristic', { species: [], none: 'yes' })).toBe('U2')
    expect(suggest('characteristic', {})).toBeNull()
    const six = sp(['Nardus stricta'], ['Carex pilulifera'], ['Danthonia decumbens'], ['Potentilla erecta'], ['Luzula campestris'], ['Viola canina'], ['Hypericum maculatum'])
    expect(suggest('characteristic', { species: six }, { communities: 'Hieracio vulgati-Nardetum' })).toBe('U1')
    expect(warn('characteristic', { species: six }, { communities: 'Hieracio vulgati-Nardetum' })).toMatch(/Polygalo-Nardetum/)
    expect(suggest('characteristic', { species: six }, { communities: 'Polygalo-Nardetum' })).toBe('FV')
    expect(warn('characteristic', { species: six }, { communities: 'Polygalo-Nardetum' })).toBeNull()
    expect(warn('characteristic', { species: sp(['Nardus stricta'], ['Vaccinium myrtillus']) })).toMatch(/Nie liczą się.*Vaccinium myrtillus/)
  })

  it('gatunki dominujące: gorsza z bliźniczki i innych dominantów >25%, współpanowanie gatunków charakterystycznych', () => {
    expect(suggest('dominant', { species: sp(['Nardus stricta', 60]) })).toBe('FV')
    expect(suggest('dominant', { species: sp(['Nardus stricta', 80], ['Vaccinium myrtillus', 30]) })).toBe('U1')
    expect(suggest('dominant', { species: sp(['Nardus stricta', 40], ['Agrostis capillaris', 30], ['Festuca rubra', 30], ['Vaccinium myrtillus', 30]) })).toBe('U2')
    expect(suggest('dominant', { species: sp(['Agrostis capillaris', 60]) })).toBe('U2')
    expect(suggest('dominant', { species: sp(['Nardus stricta', 25], ['Danthonia decumbens', 20], ['Potentilla erecta', 15]) })).toBe('FV')
    expect(explain('dominant', { species: sp(['Nardus stricta', 25], ['Danthonia decumbens', 20], ['Potentilla erecta', 15]) })).toMatch(/współpanują.*60%/)
    expect(suggest('dominant', { species: sp(['Calluna vulgaris', 10]), nardus: 35 })).toBe('U1')
    expect(suggest('dominant', { species: sp(['Calluna vulgaris', 40]), nardus: 35 })).toBe('FV')
    expect(suggest('dominant', {})).toBeNull()
    expect(warn('dominant', { species: sp(['Nardus stricta', 60], ['Festuca rubra', 5]) })).toMatch(/≥10%.*Festuca rubra/)
  })

  it('bogactwo: średnia z 3 zdjęć albo wprost; piętro subalpejskie zmienia progi', () => {
    expect(suggest('richness', { count1: 17, count2: 18, count3: 13 })).toBe('U1')
    expect(ind('richness').describe!({ count1: 17, count2: 18, count3: 13 }, ctx())).toBe('16 gat./25 m²')
    expect(suggest('richness', { value: 12 })).toBe('U1')
    expect(suggest('richness', { value: 12 }, { belt: 'subalpine' })).toBe('U1')
    expect(suggest('richness', { value: 14 }, { belt: 'subalpine' })).toBe('FV')
    expect(suggest('richness', { value: 30 })).toBe('FV')
    expect(suggest('richness', { value: 8 })).toBe('U2')
    expect(suggest('richness', {})).toBeNull()
    expect(explain('richness', { value: 14 }, {})).toMatch(/piętro nie wybrane/)
    expect(warn('richness', { value: 20, count1: 17, count2: 18, count3: 13 })).toMatch(/różni się/)
    expect(warn('richness', { count1: 17 })).toMatch(/3 zdjęć/)
  })

  it('obce: pokrycie decyduje; ostrzeżenia o archeofitach, gatunkach rodzimych, 3+ gatunkach i granicy 10%', () => {
    expect(suggest('aliens', { species: [], none: 'yes' })).toBe('FV')
    expect(suggest('aliens', { species: sp(['Padus serotina', 2]) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Padus serotina']) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Padus serotina', 8], ['Lupinus polyphyllus', 5]) })).toBe('U2')
    expect(suggest('aliens', { total: 12 })).toBe('U2')
    expect(suggest('aliens', {})).toBeNull()
    expect(warn('aliens', { species: sp(['Scleranthus annuus', 1]) })).toMatch(/nie uznaje ich za inwazyjne: Scleranthus/)
    expect(warn('aliens', { species: sp(['Betula pendula', 1]) })).toMatch(/rodzime: Betula pendula/)
    expect(warn('aliens', { species: sp(['Padus serotina', 1], ['Conyza canadensis', 1], ['Quercus rubra', 1]) })).toMatch(/Zielona/)
    expect(warn('aliens', { species: sp(['Padus serotina', 10]) })).toMatch(/Maśluchy/)
  })

  it('ekspansywne: suma bez gatunków charakterystycznych, drzew i obcych; ostrzeżenie przy wrzosie i przy pojedynczych ≤30%', () => {
    expect(suggest('expansive', { species: [], none: 'yes' })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Vaccinium myrtillus', 15]) })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Vaccinium myrtillus', 25]) })).toBe('U1')
    expect(suggest('expansive', { species: sp(['Vaccinium myrtillus', 30], ['Vaccinium vitis-idaea', 10]) })).toBe('U2')
    expect(suggest('expansive', { species: sp(['Calluna vulgaris', 50], ['Agrostis capillaris', 10]) })).toBe('FV')
    expect(warn('expansive', { species: sp(['Calluna vulgaris', 50]) })).toMatch(/Wrzos.*Włochów/)
    expect(suggest('expansive', { species: sp(['Hypericum maculatum', 25]) }, { communities: 'Polygalo-Nardetum' })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Hypericum maculatum', 25]) })).toBe('U1')
    expect(warn('expansive', { species: sp(['Vaccinium myrtillus', 30], ['Vaccinium vitis-idaea', 10]) })).toMatch(/Piorunowiec/)
    expect(warn('expansive', { species: sp(['Betula pendula', 5], ['Solidago gigantea', 5]) })).toMatch(/krzewów.*Betula pendula.*inwazyjne.*Solidago gigantea/)
    expect(suggest('expansive', { species: sp(['Vaccinium myrtillus']) })).toBeNull()
  })

  it('krzewy: łączne > suma; progi ostre albo łagodne (sam jałowiec); ostrzeżenie 25–40%', () => {
    expect(suggest('shrubs', { total: 5 })).toBe('FV')
    expect(suggest('shrubs', { species: sp(['Betula pendula', 15]) })).toBe('U1')
    expect(suggest('shrubs', { species: sp(['Juniperus communis', 15]) })).toBe('FV')
    expect(explain('shrubs', { species: sp(['Juniperus communis', 15]) })).toMatch(/łagodne.*wybrane z listy/)
    expect(suggest('shrubs', { species: sp(['Juniperus communis', 15], ['Betula pendula', 1]) })).toBe('U1')
    expect(suggest('shrubs', { total: 45, variant: 'slow' })).toBe('U1')
    expect(suggest('shrubs', { total: 45, variant: 'fast' })).toBe('U2')
    expect(suggest('shrubs', { species: [], none: 'yes' })).toBe('FV')
    expect(suggest('shrubs', {})).toBeNull()
    expect(warn('shrubs', { species: sp(['Pinus sylvestris', 30]) })).toMatch(/25–40%/)
    expect(warn('shrubs', { total: 5, species: sp(['Pinus sylvestris', 10]) })).toMatch(/większa niż pokrycie łączne/)
    expect(warn('shrubs', { species: sp(['Nardus stricta', 1]) })).toMatch(/nie drzewa ani krzewy: Nardus/)
  })

  it('eutrofizacja: wybór ma pierwszeństwo, inaczej pokrycie gatunków nitrofilnych', () => {
    expect(suggest('eutrophication', { choice: 'none' })).toBe('FV')
    expect(suggest('eutrophication', { choice: 'strong' })).toBe('U2')
    expect(suggest('eutrophication', { species: [], none: 'yes' })).toBe('FV')
    expect(suggest('eutrophication', { species: sp(['Urtica dioica', 2]) })).toBe('U1')
    expect(suggest('eutrophication', { species: sp(['Urtica dioica']) })).toBe('U1')
    expect(suggest('eutrophication', { species: sp(['Urtica dioica', 8], ['Elymus repens', 4]) })).toBe('U2')
    expect(suggest('eutrophication', {})).toBeNull()
    expect(warn('eutrophication', { choice: 'none', species: sp(['Urtica dioica', 2]) })).toMatch(/Wybrano FV.*U1/)
    expect(warn('eutrophication', { species: sp(['Rubus hirtus', 2]) })).toMatch(/Beskid Niski/)
  })

  it('struktura przestrzenna: z wyboru; ostrzeżenie przy FV i dużym rozproszeniu', () => {
    expect(suggest('spatial', { choice: 'compact' })).toBe('FV')
    expect(suggest('spatial', { choice: 'smallStable' })).toBe('FV')
    expect(suggest('spatial', { choice: 'intermediate' })).toBe('U1')
    expect(suggest('spatial', { choice: 'tiny' })).toBe('U2')
    expect(suggest('spatial', { choice: 'lost' })).toBe('U2')
    expect(warn('spatial', { choice: 'compact', fragmentation: '3' })).toMatch(/duży/)
    expect(ind('spatial').describe!({ choice: 'compact', closure: 95, fragmentation: '1' }, ctx())).toBe('Zwarcie muraw ok. 95%; stopień rozproszenia: 1 – mały (nieznaczny)')
  })

  it('katalog: bez duplikatów, synonimy jednym kluczem, warstwy B/C/D', () => {
    const latin = SPECIES_6230.map((s) => s.latin)
    expect(new Set(latin).size).toBe(latin.length)
    expect(speciesKey6230('Hypochaeris uniflora')).toBe(speciesKey6230('Hypochoeris uniflora'))
    expect(speciesKey6230('Carex rigida')).toBe(speciesKey6230('Carex bigelowii subsp. rigida'))
    expect(isCharacteristic6230('Nardus stricta')).toBe(true)
    expect(isCharacteristic6230('Hypericum maculatum')).toBe(false)
    expect(isCharacteristic6230('Hypericum maculatum', true)).toBe(true)
    expect(defaultLayer6230(findSpecies6230('Picea abies')!)).toBe('B')
    expect(defaultLayer6230(findSpecies6230('Padus serotina')!)).toBe('B')
    expect(defaultLayer6230(findSpecies6230('Pleurozium schreberi')!)).toBe('D')
    expect(defaultLayer6230(findSpecies6230('Nardus stricta')!)).toBe('C')
    expect(m.speciesInfo!('Hypericum maculatum')).toMatch(/Polygalo-Nardetum/)
    expect(m.speciesInfo!('Juniperus communis')).toMatch(/mniejsze zagrożenie/)
    expect(m.speciesInfo!('Galium saxatile')).toMatch(/wg sprawozdań/)
  })
})

describe('ocena struktury (reguła ogólna silnika, bez structureRule)', () => {
  const all = (g: Grade): CardValues => ({
    ...piorunowiec,
    indicators: Object.fromEntries(Object.entries(piorunowiec.indicators).map(([k, v]) => [k, { ...v, grade: g }])),
  })
  const withGrade = (id: string, g: Grade): CardValues => ({ ...all('FV'), indicators: { ...all('FV').indicators, [id]: { ...piorunowiec.indicators[id], grade: g } } })

  it('silnik bez zmian: 6230 nie ma własnej reguły struktury', () => {
    expect(m.structureRule).toBeUndefined()
  })

  it('wszystko FV → FV; niekardynalny U1 → FV, niekardynalny U2 → U1', () => {
    expect(assessCard(m, all('FV')).structure).toBe('FV')
    expect(assessCard(m, withGrade('dominant', 'U1')).structure).toBe('FV')
    expect(assessCard(m, withGrade('richness', 'U2')).structure).toBe('U1')
  })

  it('kardynalny U1 → U1; kardynalny U2 → U2 i ocena ogólna U2', () => {
    expect(assessCard(m, withGrade('characteristic', 'U1')).structure).toBe('U1')
    expect(assessCard(m, withGrade('spatial', 'U2')).structure).toBe('U2')
    expect(assessCard(m, withGrade('expansive', 'U2')).overall).toBe('U2')
  })
})

describe('przykład Piorunowiec (karta z przewodnika, 2007)', () => {
  const c = ctx(piorunowiec.site)

  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(piorunowiec)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie', () => {
    const grades = Object.fromEntries(Object.entries(piorunowiec.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({ area: 'FV', characteristic: 'FV', dominant: 'U1', richness: 'U1', aliens: 'FV', expansive: 'U1', shrubs: 'FV', eutrophication: 'FV', spatial: 'U1' })
  })

  it('parametry i ocena ogólna jak w karcie: FV, U1, U1 → U1', () => {
    expect(assessCard(m, piorunowiec)).toMatchObject({ area: 'FV', structure: 'U1', prospects: 'U1', overall: 'U1', missing: [] })
  })

  it('podpowiedzi zgodne z ekspertem – poza ekspansywnymi (40% łącznie: tab. 2 daje U2, karta U1)', () => {
    for (const i of m.indicators) {
      const s = i.suggest!(piorunowiec.indicators[i.id].inputs, c)
      if (i.id === 'expansive') expect(s).toBe('U2')
      else expect(s, i.id).toBe(piorunowiec.indicators[i.id].grade)
    }
    // gdyby ekspert przyjął podpowiedź: kardynalny U2 → struktura U2 → ogólna U2 (tak oceniano Piorunowiec w 2014 i 2018)
    const strict = { ...piorunowiec, indicators: { ...piorunowiec.indicators, expansive: { ...piorunowiec.indicators.expansive, grade: 'U2' as Grade } } }
    expect(assessCard(m, strict)).toMatchObject({ structure: 'U2', overall: 'U2' })
  })

  it('bogactwo: średnia 16 = gatunki naczyniowe ze zdjęć (17, 18, 13; bez mchów, świerk raz)', () => {
    const counts = piorunowiec.releves.map((r) => new Set((r.species as { name: string; layer: string }[]).filter((s) => s.layer !== 'D').map((s) => speciesKey6230(s.name))).size)
    expect(counts).toEqual([17, 18, 13])
    expect(piorunowiec.indicators.richness.inputs).toMatchObject({ count1: 17, count2: 18, count3: 13 })
  })

  it('pole „wartość” = opis wygenerowany z pól', () => {
    for (const i of m.indicators) expect(i.describe!(piorunowiec.indicators[i.id].inputs, c), i.id).toBe(piorunowiec.indicators[i.id].value)
  })

  it('ostrzeżenia: tylko przy ekspansywnych (rozjazd z kartą)', () => {
    for (const i of m.indicators) if (i.id !== 'expansive') expect(i.warn?.(piorunowiec.indicators[i.id].inputs, c) ?? null, i.id).toBeNull()
    expect(ind('expansive').warn!(piorunowiec.indicators.expansive.inputs, c)).toMatch(/Piorunowiec/)
    for (const f of m.siteFields) expect(f.warn?.(piorunowiec.site[f.name]) ?? null, f.name).toBeNull()
    for (const r of piorunowiec.releves) for (const f of m.releves.fields) expect(f.warn?.(r[f.name]) ?? null, f.name).toBeNull()
  })

  it('zdjęcia jak w karcie, udział FV/U1/U2 = 100%, koordynator zanonimizowany, stare kody przemapowane', () => {
    expect(examples6230).toHaveLength(1)
    expect(piorunowiec.releves.map((r) => (r.species as unknown[]).length)).toEqual([18, 20, 15])
    expect(piorunowiec.releves.map((r) => [r.coverB, r.coverC, r.coverD, r.heightB, r.heightC, r.slope])).toEqual([
      [2, 100, 2, 0.8, 15, 5],
      [5, 100, 5, 2, 15, 5],
      [2, 100, 30, 1, 20, 15],
    ])
    const names = piorunowiec.releves.flatMap((r) => (r.species as { name: string }[]).map((s) => s.name))
    for (const n of names) expect(findSpecies6230(n), n).toBeTruthy()
    const o = piorunowiec.other
    expect(Number(o.shareFV) + Number(o.shareU1) + Number(o.shareU2)).toBe(100)
    expect(piorunowiec.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(piorunowiec)).not.toMatch(/Kozak|Korzeniak/)
    expect(piorunowiec.impacts.map((i) => `${i.code}${i.influence}${i.intensity}`)).toEqual(['F040L', 'A03+L', 'D01.010L', 'B01-L'])
    expect(piorunowiec.threats.map((t) => t.code)).toEqual(['A04.03', 'K02'])
    for (const t of [...piorunowiec.impacts, ...piorunowiec.threats]) expect(m.impactCodes.find((x) => x.code === t.code)?.name, t.code).toBe(t.name)
  })
})

describe('eksport .docx przykładu', () => {
  it('ma kod z gwiazdką, wskaźniki, udział FV/U1/U2 i stare kody w opisie', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, piorunowiec))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['*6230 Bogate florystycznie górskie i niżowe murawy bliźniczkowe', 'Gatunki dominujące', 'Bogactwo gatunkowe', 'Udział powierzchni siedliska w stanie FV', 'Piorunowiec', 'Hieracio vulgati-Nardetum'])
      expect(text, t).toContain(t)
    expect(text).toMatch(/Kod w karcie z 2007 r.: 250/)
  })
})
