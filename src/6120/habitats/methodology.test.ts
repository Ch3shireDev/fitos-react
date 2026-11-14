import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { examples6120, kalinik } from './examples'
import {
  gradeAliens6120,
  gradeCharacteristic6120,
  gradeCharacteristicProposal6120,
  gradeExpansive6120,
  gradeShrubs6120,
  indicator6120 as ind,
  methodology6120 as m,
} from './methodology'
import { SPECIES_6120, defaultLayer6120, findSpecies6120, isCharacteristic6120, speciesKey6120 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, ctx())
const warn = (id: string, inputs: InputValues) => ind(id).warn!(inputs, ctx())
const explain = (id: string, inputs: InputValues) => ind(id).explain!(inputs, ctx())
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => (cover === undefined ? { name } : { name, cover }))
const siteWarn = (name: string, v: unknown) => m.siteFields.find((f) => f.name === name)!.warn!(v)

describe('metodyka 6120 – struktura', () => {
  it('kod *6120 (priorytetowe), transekt 10×200 m, 3 zdjęcia po 25 m²', () => {
    expect(habitatCode(m)).toBe('*6120')
    expect(m.priority).toBe(true)
    expect(m.name).toBe('Ciepłolubne, śródlądowe murawy napiaskowe (Koelerion glaucae)')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('10x200 m')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(m.releves.fields.map((f) => f.name)).toEqual(expect.arrayContaining(['coverB', 'coverC', 'coverD', 'heightB', 'heightC', 'heightD']))
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki jak w tab. 2: powierzchnia + 6 struktury, nic wyłączonego', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Gatunki charakterystyczne',
      'Obce gatunki inwazyjne',
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Ekspansja krzewów i podrostu drzew',
      'Struktura przestrzenna płatów muraw',
      'Zachowanie strefy ekotonowej',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('kardynalne (lista pod tab. 2): pięć – wszystkie poza strefą ekotonową', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['species', 'aliens', 'expansive', 'shrubs', 'structure'])
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...allOtherFields(m), ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: ostrzeżenie poza połową maja – końcem czerwca', () => {
    for (const d of ['2024-05-15', '2024-06-01', '2024-06-30']) expect(siteWarn('date', d), d).toBeNull()
    for (const d of ['2024-05-14', '2024-07-01', '2008-08-06']) expect(siteWarn('date', d), d).toMatch(/poza optymalnym oknem/)
  })

  it('transekt: 200 m długości (10×200, 200×10, 20×100) bez ostrzeżenia, inaczej ostrzeżenie', () => {
    for (const t of ['10x200 m', '200×10 m', '20x100 m', '5x200 m']) expect(siteWarn('transect', t), t).toBeNull()
    expect(siteWarn('transect', '10x100 m')).toMatch(/1000 m²/)
  })

  it('kody oddziaływań bez duplikatów, z sukcesją, wypasem, zalesianiem, usuwaniem podszytu i obcymi', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['K02', 'A04.03', 'B01', 'B02.03', 'C01.01', 'I01', 'I02', 'X']) expect(codes, c).toContain(c)
  })

  it('inne informacje: propozycje po działaniach, udział FV/U1/U2 przed uwagami', () => {
    const names = allOtherFields(m).map((f) => f.name)
    expect(names.indexOf('proposals')).toBe(names.indexOf('conservation') + 1)
    expect(names.slice(names.indexOf('shareFV'), names.indexOf('notes') + 1)).toEqual(['shareFV', 'shareU1', 'shareU2', 'notes'])
  })
})

describe('metodyka 6120 – progi tab. 2', () => {
  it('gatunki charakterystyczne: ≥5 FV (5 też), 2–4 U1, 0–1 U2; propozycja 2015–2018 tylko jako funkcja', () => {
    expect([0, 1, 2, 4, 5, 12].map(gradeCharacteristic6120)).toEqual(['U2', 'U2', 'U1', 'U1', 'FV', 'FV'])
    expect([1, 2, 3, 4, 5].map(gradeCharacteristicProposal6120)).toEqual(['U2', 'U2', 'U1', 'U1', 'FV'])
  })

  it('krzewy i podrost: <10 FV, 10–25 U1 (obie granice), >25 U2', () => {
    expect([0, 9.9, 10, 25, 25.1, 60].map(gradeShrubs6120)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('obce: 0 FV; 1–2 gatunki do 5% U1; >5% albo >2 gatunki U2', () => {
    expect(gradeAliens6120(0)).toBe('FV')
    expect(gradeAliens6120(1)).toBe('U1')
    expect(gradeAliens6120(2, 5)).toBe('U1')
    expect(gradeAliens6120(1, 5.1)).toBe('U2')
    expect(gradeAliens6120(3, 0.5)).toBe('U2')
  })

  it('ekspansywne: 0 FV, 1 pojedynczo FV, 1 inaczej lub bez formy U1, 2 U1, >2 U2', () => {
    expect(gradeExpansive6120(0)).toBe('FV')
    expect(gradeExpansive6120(1, 'single')).toBe('FV')
    expect(gradeExpansive6120(1, '')).toBe('U1')
    expect(gradeExpansive6120(1, 'scattered')).toBe('U1')
    expect(gradeExpansive6120(2, 'single')).toBe('U1')
    expect(gradeExpansive6120(2, 'patches')).toBe('U1')
    expect(gradeExpansive6120(3, 'patches')).toBe('U2')
  })
})

describe('metodyka 6120 – podpowiedzi z pól', () => {
  it('powierzchnia: z wyboru, XX przy braku danych', () => {
    expect(suggest('area', { choice: 'stable' })).toBe('FV')
    expect(suggest('area', { choice: 'other' })).toBe('U1')
    expect(suggest('area', { choice: 'clearDecrease' })).toBe('U2')
    expect(suggest('area', { choice: 'unknown' })).toBe('XX')
    expect(suggest('area', {})).toBeNull()
    expect(ind('area').describe!({ choice: 'stable', areaHa: 0.5 }, ctx())).toBe('0,5 ha')
    expect(ind('area').describe!({ choice: 'stable' }, ctx())).toBe('nie podlega zmianom lub zwiększa się')
  })

  it('gatunki charakterystyczne: lista tab. 1 (synonimy raz), liczba wprost ma pierwszeństwo, typowe z pkt 4 nie liczą się', () => {
    const five = sp(['Koeleria glauca', 10], ['Festuca psammophila'], ['Dianthus carthusianorum'], ['Silene otites'], ['Corynephorus canescens'])
    expect(suggest('species', { species: five })).toBe('FV')
    expect(suggest('species', { species: sp(['Koeleria macrantha'], ['Koeleria cristata'], ['Sedum acre'], ['Thymus serpyllum']) })).toBe('U2')
    expect(suggest('species', { species: sp(['Koeleria glauca']), count: 6 })).toBe('FV')
    expect(suggest('species', { species: [], none: 'yes' })).toBe('U2')
    expect(suggest('species', {})).toBeNull()
    expect(warn('species', { species: sp(['Armeria maritima subsp. elongata'], ['Koeleria glauca']) })).toMatch(/pkt 4.*Armeria/)
    expect(warn('species', { species: sp(['Koeleria glauca']), count: 6 })).toMatch(/byłoby 1 \(U2\)/)
    expect(explain('species', { species: sp(['Koeleria glauca'], ['Sedum sexangulare']) })).toMatch(/2 z 22\..*propozycji 2015–2018 byłoby U2/)
  })

  it('obce: liczba gatunków (synonimy raz) i pokrycie; „nie stwierdzono” = FV; ostrzeżenia', () => {
    expect(suggest('aliens', { species: [], none: 'yes' })).toBe('FV')
    expect(suggest('aliens', { species: sp(['Conyza canadensis', 1], ['Erigeron canadensis', 1]) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Conyza canadensis', 3], ['Padus serotina', 3]) })).toBe('U2')
    expect(suggest('aliens', { species: sp(['Conyza canadensis'], ['Padus serotina'], ['Acer negundo']) })).toBe('U2')
    expect(suggest('aliens', { species: sp(['Padus serotina', 2]), total: 8 })).toBe('U2')
    expect(suggest('aliens', {})).toBeNull()
    expect(warn('aliens', { species: sp(['Bromus tectorum']) })).toMatch(/Archeofity.*Bromus tectorum/)
    expect(warn('aliens', { species: sp(['Pinus sylvestris']) })).toMatch(/rodzime: Pinus sylvestris/)
    expect(warn('aliens', { species: sp(['Padus serotina']), none: 'yes' })).toMatch(/Nie stwierdzono/)
  })

  it('ekspansywne: liczba + forma; ostrzeżenia przy zwartym trzcinniku i gatunkach obcych', () => {
    expect(suggest('expansive', { species: [], none: 'yes' })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Calamagrostis epigejos', 1]), occurrence: 'single' })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Calamagrostis epigejos', 1]) })).toBe('U1')
    expect(explain('expansive', { species: sp(['Calamagrostis epigejos', 1]) })).toMatch(/wybierz „Jak występują”/)
    expect(suggest('expansive', { species: sp(['Calamagrostis epigejos'], ['Elymus repens'], ['Carex hirta']), occurrence: 'patches' })).toBe('U2')
    expect(warn('expansive', { species: sp(['Calamagrostis epigejos', 40]), occurrence: 'patches' })).toMatch(/nie przewiduje 1–2 gatunków w zwartych płatach/)
    expect(warn('expansive', { species: sp(['Solidago gigantea']) })).toMatch(/Obce gatunki inwazyjne.*Solidago/)
  })

  it('krzewy: z liczby; ostrzeżenie, gdy suma gatunków > łączne, i przy gatunkach zielnych', () => {
    expect(suggest('shrubs', { value: 5 })).toBe('FV')
    expect(suggest('shrubs', { value: 10 })).toBe('U1')
    expect(suggest('shrubs', { value: 30 })).toBe('U2')
    expect(suggest('shrubs', {})).toBeNull()
    expect(warn('shrubs', { value: 5, species: sp(['Pinus sylvestris', 10]) })).toMatch(/większa niż pokrycie łączne/)
    expect(warn('shrubs', { value: 5, species: sp(['Calamagrostis epigejos', 1]) })).toMatch(/zielne: Calamagrostis/)
  })

  it('struktura przestrzenna i ekoton: z wyboru (z opcją „małe i izolowane” z 2024)', () => {
    expect(suggest('structure', { choice: 'mosaicGrass' })).toBe('FV')
    expect(suggest('structure', { choice: 'majorityMeadow' })).toBe('U1')
    expect(suggest('structure', { choice: 'minorityMeadow' })).toBe('U2')
    expect(suggest('structure', { choice: 'isolated' })).toBe('U2')
    expect(suggest('ecotone', { choice: 'none' })).toBe('FV')
    expect(suggest('ecotone', { choice: 'sharp' })).toBe('U1')
    expect(suggest('ecotone', { choice: 'gradual' })).toBe('U2')
  })

  it('katalog: 22 gatunki tab. 1 (synonimy raz), drzewa w B, mchy w D, reszta w C, bez duplikatów', () => {
    const latin = SPECIES_6120.map((s) => s.latin)
    expect(new Set(latin).size).toBe(latin.length)
    const tab1 = new Set(SPECIES_6120.filter((s) => s.group === 'characteristic').map((s) => speciesKey6120(s.latin)))
    expect(tab1.size).toBe(22)
    expect(isCharacteristic6120('Armeria maritima subsp. elongata')).toBe(false)
    expect(speciesKey6120('Conyza canadensis')).toBe(speciesKey6120('Erigeron canadensis'))
    expect(defaultLayer6120(findSpecies6120('Pinus sylvestris')!)).toBe('B')
    expect(defaultLayer6120(findSpecies6120('Padus serotina')!)).toBe('B')
    expect(defaultLayer6120(findSpecies6120('Brachythecium albicans')!)).toBe('D')
    expect(defaultLayer6120(findSpecies6120('Koeleria glauca')!)).toBe('C')
    expect(m.speciesInfo!('Calamagrostis epigejos')).toBe('rodzimy gatunek ekspansywny')
    expect(m.speciesInfo!('Elymus repens')).toMatch(/sprawozdania 2018–2024/)
  })
})

describe('ocena struktury (reguła ogólna silnika, bez structureRule)', () => {
  const all = (g: Grade): CardValues => ({
    ...kalinik,
    indicators: Object.fromEntries(Object.entries(kalinik.indicators).map(([k, v]) => [k, { ...v, grade: g }])),
  })
  const withGrade = (id: string, g: Grade): CardValues => ({ ...all('FV'), indicators: { ...all('FV').indicators, [id]: { ...kalinik.indicators[id], grade: g } } })

  it('silnik bez zmian: 6120 nie ma własnej reguły struktury', () => {
    expect(m.structureRule).toBeUndefined()
  })

  it('wszystko FV → FV; niekardynalny ekoton U2 → struktura U1', () => {
    expect(assessCard(m, all('FV')).structure).toBe('FV')
    expect(assessCard(m, withGrade('ecotone', 'U2')).structure).toBe('U1')
  })

  it('kardynalny U1 → U1; kardynalny U2 (struktura przestrzenna, obce) → U2', () => {
    expect(assessCard(m, withGrade('species', 'U1')).structure).toBe('U1')
    expect(assessCard(m, withGrade('structure', 'U2')).structure).toBe('U2')
    expect(assessCard(m, withGrade('aliens', 'U2')).overall).toBe('U2')
  })
})

describe('przykład Kalinik (karta z przewodnika, 2008)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(kalinik)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie (struktura przestrzenna – ze sprawozdania 2006–2008)', () => {
    const grades = Object.fromEntries(Object.entries(kalinik.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({ area: 'FV', species: 'FV', aliens: 'FV', expansive: 'FV', shrubs: 'FV', structure: 'FV', ecotone: 'FV' })
  })

  it('parametry i ocena ogólna jak w karcie: wszystko FV', () => {
    expect(assessCard(m, kalinik)).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV', missing: [] })
  })

  it('podpowiedzi zgodne z ekspertem – poza gatunkami charakterystycznymi (3 z tab. 1: tab. 2 daje U1, karta FV)', () => {
    const c = ctx({ site: kalinik.site, indicators: kalinik.indicators })
    for (const i of m.indicators) {
      const s = i.suggest!(kalinik.indicators[i.id].inputs, c)
      if (i.id === 'species') expect(s).toBe('U1')
      else expect(s, i.id).toBe(kalinik.indicators[i.id].grade)
    }
    // gdyby ekspert przyjął podpowiedź: struktura U1 → ogólna U1
    const strict = { ...kalinik, indicators: { ...kalinik.indicators, species: { ...kalinik.indicators.species, grade: 'U1' as Grade } } }
    expect(assessCard(m, strict)).toMatchObject({ structure: 'U1', overall: 'U1' })
  })

  it('gatunki charakterystyczne: ostrzeżenie o zawciągu spoza tab. 1; ze zdjęć (+ goździk kartuzek) też tylko 4', () => {
    expect(warn('species', kalinik.indicators.species.inputs)).toMatch(/pkt 4.*Armeria maritima subsp\. elongata/)
    const fromReleves = new Set(kalinik.releves.flatMap((r) => (r.species as { name: string }[]).map((s) => s.name)).filter(isCharacteristic6120).map(speciesKey6120))
    expect([...fromReleves].sort()).toEqual(['goździk kartuzek', 'kostrzewa piaskowa', 'rozchodnik sześciorzędowy', 'strzęplica sina'])
    expect(gradeCharacteristic6120(fromReleves.size)).toBe('U1')
  })

  it('pole „wartość” = opis wygenerowany z pól', () => {
    const c = ctx({ site: kalinik.site, indicators: kalinik.indicators })
    for (const i of m.indicators) expect(i.describe!(kalinik.indicators[i.id].inputs, c), i.id).toBe(kalinik.indicators[i.id].value)
  })

  it('ostrzeżenia: tylko termin (6.08 poza oknem) i zawciąg przy gatunkach charakterystycznych', () => {
    const c = ctx({ site: kalinik.site, indicators: kalinik.indicators })
    for (const i of m.indicators) if (i.id !== 'species') expect(i.warn?.(kalinik.indicators[i.id].inputs, c) ?? null, i.id).toBeNull()
    for (const f of m.siteFields) if (f.name !== 'date') expect(f.warn?.(kalinik.site[f.name]) ?? null, f.name).toBeNull()
    expect(siteWarn('date', kalinik.site.date)).toMatch(/poza optymalnym oknem/)
  })

  it('zdjęcia jak w karcie, udział FV/U1/U2 = 100%, ekspert zanonimizowany, stare kody przemapowane', () => {
    expect(examples6120).toHaveLength(1)
    expect(kalinik.releves.map((r) => (r.species as unknown[]).length)).toEqual([26, 25, 23])
    expect(kalinik.releves.map((r) => [r.coverB, r.coverC, r.coverD, r.heightC, r.altitude])).toEqual([
      [0, 70, 0, 40, 109],
      [0, 80, 0, 30, 121],
      [0, 90, 0, 20, 122],
    ])
    expect(kalinik.releves.map((r) => r.unit)).toEqual(['Corynephoro-Silenetum tataricae', 'Sileno otitis-Festucetum', 'Sileno otitis-Festucetum'])
    const names = kalinik.releves.flatMap((r) => (r.species as { name: string }[]).map((s) => s.name))
    for (const n of names) expect(findSpecies6120(n), n).toBeTruthy()
    const o = kalinik.other
    expect(Number(o.shareFV) + Number(o.shareU1) + Number(o.shareU2)).toBe(100)
    expect(kalinik.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(kalinik)).not.toMatch(/Suder|Kujawa/)
    expect(kalinik.impacts.map((i) => `${i.code}${i.influence}${i.intensity}`)).toEqual(['B02.03+H', 'K02-H'])
    expect(kalinik.threats.map((t) => t.code)).toEqual(['K02'])
    for (const t of [...kalinik.impacts, ...kalinik.threats]) expect(m.impactCodes.find((c) => c.code === t.code)?.name, t.code).toBe(t.name)
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, udział FV/U1/U2 i stare kody w opisie', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, kalinik))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['*6120 Ciepłolubne, śródlądowe murawy napiaskowe (Koelerion glaucae)', 'Struktura przestrzenna płatów muraw', 'Udział powierzchni siedliska w stanie FV', 'Kalinik', 'Sileno otitis-Festucetum'])
      expect(text, t).toContain(t)
    expect(text).toMatch(/Kod w karcie z 2008 r.: 165/)
  })
})
