import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { examples6210, radomice } from './examples'
import {
  gradeAliens6210,
  gradeCharacteristic2010_6210,
  gradeCharacteristic6210,
  gradeExpansive6210,
  gradeOrchids6210,
  gradeShrubs6210,
  indicator6210 as ind,
  methodology6210 as m,
} from './methodology'
import { SPECIES_6210, defaultLayer6210, findSpecies6210, isCharacteristic6210, speciesKey6210 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues, c = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const warn = (id: string, inputs: InputValues, c = ctx()) => ind(id).warn!(inputs, c)
const explain = (id: string, inputs: InputValues, c = ctx()) => ind(id).explain!(inputs, c)
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => (cover === undefined ? { name } : { name, cover }))
const siteWarn = (name: string, v: unknown) => m.siteFields.find((f) => f.name === name)!.warn!(v)

describe('metodyka 6210 – struktura', () => {
  it('kod 6210 (bez gwiazdki), transekt 200 m, 3 zdjęcia po 25 m², wymagany podtyp', () => {
    expect(habitatCode(m)).toBe('6210')
    expect(m.priority).toBeFalsy()
    expect(m.name).toBe('Murawy kserotermiczne (Festuco-Brometea)')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('200 m')
    const sub = m.siteFields.find((f) => f.name === 'subtype')!
    expect(sub.required).toBe(true)
    expect(sub.kind === 'select' && sub.options.map((o) => o.value)).toEqual(['', '6210-1', '6210-2', '6210-3'])
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki jak w tab. 2: powierzchnia + 6 struktury, nic wyłączonego', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Gatunki charakterystyczne',
      'Obce gatunki inwazyjne',
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Ekspansja krzewów i podrostu drzew',
      'Liczba gatunków storczykowatych',
      'Zachowanie strefy ekotonowej',
    ])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('kardynalne (lista pod tab. 2): gatunki charakterystyczne, ekspansywne, krzewy', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['species', 'expansive', 'shrubs'])
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...allOtherFields(m), ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: maj – 15 sierpnia', () => {
    for (const d of ['2021-05-01', '2021-07-26', '2021-08-15']) expect(siteWarn('date', d), d).toBeNull()
    for (const d of ['2021-04-30', '2021-08-16', '2021-09-10']) expect(siteWarn('date', d), d).toMatch(/poza oknem/)
  })

  it('transekt: 200 m bez ostrzeżenia, 20×100 m z ostrzeżeniem', () => {
    for (const t of ['200 m', '10x200 m', '200×20 m']) expect(siteWarn('transect', t), t).toBeNull()
    expect(siteWarn('transect', '20x100 m')).toMatch(/200 m/)
  })

  it('kody oddziaływań bez duplikatów, z wypasem, koszeniem, sukcesją i obcymi', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['A03.03', 'A04.03', 'K02', 'B02.03', 'I01', 'I02', 'J01.01', 'X']) expect(codes, c).toContain(c)
  })

  it('inne informacje: propozycje po działaniach, udział FV/U1/U2 przed uwagami', () => {
    const names = allOtherFields(m).map((f) => f.name)
    expect(names.indexOf('proposals')).toBe(names.indexOf('conservation') + 1)
    expect(names.slice(names.indexOf('shareFV'), names.indexOf('notes') + 1)).toEqual(['shareFV', 'shareU1', 'shareU2', 'notes'])
  })
})

describe('metodyka 6210 – progi', () => {
  it('gatunki charakterystyczne wg modyfikacji 2022: ≥6 FV, 2–5 U1, ≤1 U2; wersja 2010 (≥5 FV) tylko do porównania', () => {
    expect([0, 1, 2, 5, 6, 20].map(gradeCharacteristic6210)).toEqual(['U2', 'U2', 'U1', 'U1', 'FV', 'FV'])
    expect([1, 2, 4, 5].map(gradeCharacteristic2010_6210)).toEqual(['U2', 'U1', 'U1', 'FV'])
  })

  it('krzewy: <10 FV, 10–25 U1, >25 U2', () => {
    expect([0, 9.9, 10, 25, 25.1, 80].map(gradeShrubs6210)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('obce: 0 FV; 1–2 do 5% U1; >5% albo >2 gatunki U2', () => {
    expect(gradeAliens6210(0)).toBe('FV')
    expect(gradeAliens6210(2, 5)).toBe('U1')
    expect(gradeAliens6210(1, 5.1)).toBe('U2')
    expect(gradeAliens6210(3, 0.5)).toBe('U2')
  })

  it('ekspansywne: liczba + forma, ilościowość 5 w zdjęciu = U2', () => {
    expect(gradeExpansive6210(0)).toBe('FV')
    expect(gradeExpansive6210(1, 'single')).toBe('FV')
    expect(gradeExpansive6210(1, 'scattered')).toBe('U1')
    expect(gradeExpansive6210(2, 'patches')).toBe('U1')
    expect(gradeExpansive6210(3, 'patches')).toBe('U2')
    expect(gradeExpansive6210(1, 'single', '5')).toBe('U2')
    expect(gradeExpansive6210(1, 'scattered', '4')).toBe('U1')
  })

  it('storczykowate: ≥3 FV (praktyka 2021), 1–2 U1, 0 U2', () => {
    expect([0, 1, 2, 3, 7].map(gradeOrchids6210)).toEqual(['U2', 'U1', 'U1', 'FV', 'FV'])
  })
})

describe('metodyka 6210 – podpowiedzi z pól', () => {
  it('powierzchnia: z wyboru, XX przy braku danych', () => {
    expect(suggest('area', { choice: 'stable' })).toBe('FV')
    expect(suggest('area', { choice: 'other' })).toBe('U1')
    expect(suggest('area', { choice: 'clearDecrease' })).toBe('U2')
    expect(suggest('area', { choice: 'unknown' })).toBe('XX')
    expect(ind('area').describe!({ choice: 'stable', areaHa: 0.5 }, ctx())).toBe('0,5 ha')
  })

  it('gatunki charakterystyczne: z katalogu (synonimy raz), wyróżniające nie liczą się, liczba wprost ma pierwszeństwo', () => {
    const six = sp(['Festuca rupicola'], ['Festuca sulcata'], ['Carex humilis'], ['Stipa capillata'], ['Salvia pratensis'], ['Centaurea scabiosa'], ['Inula ensifolia'])
    expect(suggest('species', { species: six })).toBe('FV')
    expect(suggest('species', { species: sp(['Centaurea scabiosa'], ['Origanum vulgare'], ['Clinopodium vulgare']) })).toBe('U2')
    expect(suggest('species', { species: sp(['Centaurea scabiosa']), count: 8 })).toBe('FV')
    expect(suggest('species', { species: [], none: 'yes' })).toBe('U2')
    expect(suggest('species', {})).toBeNull()
    expect(warn('species', { species: sp(['Origanum vulgare'], ['Centaurea scabiosa']) })).toMatch(/wyróżniające.*Origanum/)
    expect(explain('species', { species: sp(['Stipa capillata'], ['Festuca valesiaca'], ['Salvia pratensis']) }, ctx({ site: { subtype: '6210-2' } }))).toMatch(
      /na liście: 3\. W tym z listy podtypu 6210-2 \(tab\. 1\): 2\./,
    )
    expect(explain('species', { species: sp(['Centaurea scabiosa'], ['Carex flacca'], ['Carlina acaulis'], ['Gentiana cruciata'], ['Brachypodium pinnatum']) })).toMatch(
      /modyfikacji 2022 \(≥5 FV\) byłoby FV/,
    )
  })

  it('obce: liczba i pokrycie; ostrzeżenia przy archeofitach i gatunkach rodzimych', () => {
    expect(suggest('aliens', { species: [], none: 'yes' })).toBe('FV')
    expect(suggest('aliens', { species: sp(['Solidago canadensis', 3]) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Conyza canadensis', 1], ['Erigeron canadensis', 1]) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Solidago gigantea'], ['Erigeron annuus'], ['Robinia pseudacacia']) })).toBe('U2')
    expect(warn('aliens', { species: sp(['Viola arvensis']) })).toMatch(/Archeofity.*Viola arvensis/)
    expect(warn('aliens', { species: sp(['Prunus spinosa']) })).toMatch(/rodzime: Prunus spinosa/)
  })

  it('ekspansywne: tab. 2 + ilościowość 5; ostrzeżenia (kłosownica typowa, praktyka 2021, obce)', () => {
    expect(suggest('expansive', { species: [], none: 'yes' })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Arrhenatherum elatius', 3]), occurrence: 'scattered' })).toBe('U1')
    expect(suggest('expansive', { species: sp(['Calamagrostis epigejos'], ['Rubus caesius'], ['Urtica dioica']), occurrence: 'patches' })).toBe('U2')
    expect(suggest('expansive', { species: sp(['Brachypodium pinnatum', 80]), occurrence: 'patches', maxAbundance: '5' })).toBe('U2')
    expect(suggest('expansive', { maxAbundance: '5' })).toBe('U2')
    expect(warn('expansive', { species: sp(['Brachypodium pinnatum', 40]), occurrence: 'patches' })).toMatch(/typowy muraw/)
    expect(warn('expansive', { species: sp(['Arrhenatherum elatius', 3]), occurrence: 'scattered' })).toMatch(/W 2021 r\./)
    expect(warn('expansive', { species: sp(['Solidago gigantea']) })).toMatch(/Obce gatunki inwazyjne.*Solidago/)
  })

  it('krzewy: z liczby; ostrzeżenia przy sumie i gatunkach zielnych, obce drzewa bez ostrzeżenia', () => {
    expect(suggest('shrubs', { value: 5 })).toBe('FV')
    expect(suggest('shrubs', { value: 10 })).toBe('U1')
    expect(suggest('shrubs', { value: 30 })).toBe('U2')
    expect(warn('shrubs', { value: 5, species: sp(['Prunus spinosa', 10]) })).toMatch(/większa niż pokrycie łączne/)
    expect(warn('shrubs', { value: 5, species: sp(['Brachypodium pinnatum', 1]) })).toMatch(/zielne: Brachypodium/)
    expect(warn('shrubs', { value: 5, species: sp(['Robinia pseudacacia', 2]) })).toBeNull()
  })

  it('storczykowate: z listy (synonimy raz), XX gdy termin nie pozwalał, ostrzeżenie dla muraw naskalnych', () => {
    expect(suggest('orchids', { species: sp(['Listera ovata'], ['Neottia ovata'], ['Epipactis helleborine']) })).toBe('U1')
    expect(suggest('orchids', { species: sp(['Orchis pallens'], ['Orchis mascula'], ['Listera ovata']) })).toBe('FV')
    expect(suggest('orchids', { species: [], none: 'yes' })).toBe('U2')
    expect(suggest('orchids', { species: [], none: 'yes', status: 'lateTerm' })).toBe('XX')
    expect(suggest('orchids', { status: 'lateTerm' })).toBe('XX')
    expect(warn('orchids', { species: [], none: 'yes' }, ctx({ site: { subtype: '6210-1' } }))).toMatch(/naskalne/)
    expect(warn('orchids', { species: sp(['Centaurea scabiosa']) })).toMatch(/spoza storczykowatych/)
    expect(ind('orchids').describe!({ species: sp(['Listera ovata'], ['Epipactis helleborine']) }, ctx())).toBe('2 gat.: Listera ovata, Epipactis helleborine')
  })

  it('ekoton: z wyboru, XX dla półek skalnych', () => {
    expect(suggest('ecotone', { choice: 'gradual' })).toBe('FV')
    expect(suggest('ecotone', { choice: 'partialAnthropogenic' })).toBe('U1')
    expect(suggest('ecotone', { choice: 'noGradual' })).toBe('U1')
    expect(suggest('ecotone', { choice: 'sharpAnthropogenic' })).toBe('U2')
    expect(suggest('ecotone', { choice: 'unknown' })).toBe('XX')
  })

  it('katalog: bez duplikatów, warstwy, synonimy, grupy', () => {
    const latin = SPECIES_6210.map((s) => s.latin)
    expect(new Set(latin).size).toBe(latin.length)
    expect(speciesKey6210('Festuca rupicola')).toBe(speciesKey6210('Festuca sulcata'))
    expect(speciesKey6210('Conyza canadensis')).toBe(speciesKey6210('Erigeron canadensis'))
    expect(isCharacteristic6210('Origanum vulgare')).toBe(false)
    expect(isCharacteristic6210('Brachypodium pinnatum')).toBe(true)
    expect(defaultLayer6210(findSpecies6210('Prunus spinosa')!)).toBe('B')
    expect(defaultLayer6210(findSpecies6210('Robinia pseudacacia')!)).toBe('B')
    expect(defaultLayer6210(findSpecies6210('Abietinella abietina')!)).toBe('D')
    expect(defaultLayer6210(findSpecies6210('Stipa capillata')!)).toBe('C')
    expect(m.speciesInfo!('Brachypodium pinnatum')).toMatch(/ekspansywny/)
    expect(m.speciesInfo!('Stipa capillata')).toMatch(/6210-2/)
    expect(m.speciesInfo!('Listera ovata')).toBe('storczykowaty')
  })
})

describe('ocena struktury (reguła ogólna silnika, bez structureRule)', () => {
  const all = (g: Grade): CardValues => ({
    ...radomice,
    indicators: Object.fromEntries(Object.entries(radomice.indicators).map(([k, v]) => [k, { ...v, grade: g }])),
  })
  const withGrade = (id: string, g: Grade): CardValues => ({ ...all('FV'), indicators: { ...all('FV').indicators, [id]: { ...radomice.indicators[id], grade: g } } })

  it('silnik bez zmian', () => {
    expect(m.structureRule).toBeUndefined()
  })

  it('niekardynalne: obce i storczyki U2 → struktura U1, nie U2; storczyki XX → FV', () => {
    expect(assessCard(m, all('FV')).structure).toBe('FV')
    expect(assessCard(m, withGrade('aliens', 'U2')).structure).toBe('U1')
    expect(assessCard(m, withGrade('orchids', 'U2')).structure).toBe('U1')
    expect(assessCard(m, withGrade('orchids', 'XX')).structure).toBe('FV')
  })

  it('kardynalny U2 → U2', () => {
    expect(assessCard(m, withGrade('shrubs', 'U2')).structure).toBe('U2')
    expect(assessCard(m, withGrade('expansive', 'U2')).overall).toBe('U2')
  })
})

describe('przykład Radomice (karta z przewodnika, 2008)', () => {
  const c = ctx({ site: radomice.site, indicators: radomice.indicators })

  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(radomice)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników, parametrów i ocena ogólna jak w karcie', () => {
    const grades = Object.fromEntries(Object.entries(radomice.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({ area: 'U1', species: 'FV', aliens: 'U1', expansive: 'U1', shrubs: 'U1', orchids: 'U1', ecotone: 'U1' })
    expect(assessCard(m, radomice)).toMatchObject({ area: 'U1', structure: 'U1', prospects: 'FV', overall: 'U1', missing: [] })
  })

  it('podpowiedzi zgodne z ekspertem – poza gatunkami charakterystycznymi (5 gatunków: po 2022 U1, karta FV)', () => {
    for (const i of m.indicators) {
      const s = i.suggest!(radomice.indicators[i.id].inputs, c)
      if (i.id === 'species') expect(s).toBe('U1')
      else expect(s, i.id).toBe(radomice.indicators[i.id].grade)
    }
    const strict = { ...radomice, indicators: { ...radomice.indicators, species: { ...radomice.indicators.species, grade: 'U1' as Grade } } }
    expect(assessCard(m, strict)).toMatchObject({ structure: 'U1', overall: 'U1' })
  })

  it('ze zdjęć wychodzi 6 gatunków charakterystycznych (z biedrzeńcem) – czyli FV i po 2022', () => {
    const fromReleves = new Set(radomice.releves.flatMap((r) => (r.species as { name: string }[]).map((s) => s.name)).filter(isCharacteristic6210).map(speciesKey6210))
    expect([...fromReleves].sort()).toEqual(['biedrzeniec mniejszy', 'chaber driakiewnik', 'dziewięćsił bezłodygowy', 'goryczka krzyżowa', 'kłosownica pierzasta', 'turzyca sina'])
    expect(gradeCharacteristic6210(fromReleves.size)).toBe('FV')
  })

  it('pole „wartość” = opis wygenerowany z pól', () => {
    for (const i of m.indicators) expect(i.describe!(radomice.indicators[i.id].inputs, c), i.id).toBe(radomice.indicators[i.id].value)
  })

  it('ostrzeżenia: tylko transekt 20×100 m i praktyka 2021 przy ekspansywnych', () => {
    for (const i of m.indicators) if (i.id !== 'expansive') expect(i.warn?.(radomice.indicators[i.id].inputs, c) ?? null, i.id).toBeNull()
    expect(warn('expansive', radomice.indicators.expansive.inputs, c)).toMatch(/W 2021 r\./)
    for (const f of m.siteFields) if (f.name !== 'transect') expect(f.warn?.(radomice.site[f.name]) ?? null, f.name).toBeNull()
    expect(siteWarn('transect', radomice.site.transect)).toMatch(/20×100/)
  })

  it('zdjęcia jak w karcie, udział FV/U1/U2 = 100%, ekspert zanonimizowany, stare kody przemapowane', () => {
    expect(examples6210).toHaveLength(1)
    expect(radomice.releves.map((r) => (r.species as unknown[]).length)).toEqual([20, 27, 20])
    expect(radomice.releves.map((r) => [r.coverC, r.heightC, r.altitude])).toEqual([
      [100, 60, 417],
      [95, 60, 417],
      [100, 60, 415],
    ])
    const names = radomice.releves.flatMap((r) => (r.species as { name: string }[]).map((s) => s.name))
    for (const n of names) expect(findSpecies6210(n), n).toBeTruthy()
    const o = radomice.other
    expect(Number(o.shareFV) + Number(o.shareU1) + Number(o.shareU2)).toBe(100)
    expect(radomice.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(radomice)).not.toMatch(/Reczyńska|Mróz|Bąba/)
    expect(radomice.impacts.map((i) => `${i.code}${i.influence}${i.intensity}`)).toEqual(['A04.03-H'])
    for (const t of [...radomice.impacts, ...radomice.threats]) expect(m.impactCodes.find((x) => x.code === t.code)?.name, t.code).toBe(t.name)
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny i stary kod w opisie', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, radomice))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['6210 Murawy kserotermiczne (Festuco-Brometea)', 'Liczba gatunków storczykowatych', 'Radomice', 'Scabioso ochroleucae-Brachypodietum pinnati']) expect(text, t).toContain(t)
    expect(text).toMatch(/Kod w karcie z 2008 r.: 141/)
  })
})
