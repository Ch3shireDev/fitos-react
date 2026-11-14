import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { examples6150, kopaKondracka } from './examples'
import {
  gradeAliens6150,
  gradeBilberry6150,
  gradeCharacteristic6150,
  gradeDeschampsia6150,
  gradeExpansive6150,
  gradeHabitatShare6150,
  gradeMechanical6150,
  gradeShrubs6150,
  indicator6150 as ind,
  methodology6150 as m,
} from './methodology'
import { SPECIES_6150, defaultLayer6150, findSpecies6150, isCharacteristic6150, speciesKey6150 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues, c = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const warn = (id: string, inputs: InputValues, c = ctx()) => ind(id).warn!(inputs, c)
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => (cover === undefined ? { name } : { name, cover }))

describe('metodyka 6150 – struktura', () => {
  it('kod 6150 (nie priorytetowe), 3 zdjęcia po 25 m², podtyp i obszar wymagane, transekt 120×10 domyślnie', () => {
    expect(habitatCode(m)).toBe('6150')
    expect(m.name).toBe('Wysokogórskie murawy acidofilne (Juncion trifidi) i bezwapienne wyleżyska śnieżne (Salicion herbaceae)')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(m.siteFields.find((f) => f.name === 'subtype')?.required).toBe(true)
    expect(m.siteFields.find((f) => f.name === 'massif')?.required).toBe(true)
    expect(m.siteFields.find((f) => f.name === 'transect')?.defaultValue).toBe('120x10 m')
    expect(m.siteFields.filter((f) => f.group === 'Współrzędne geograficzne').map((f) => f.name)).toEqual(['coordStart', 'coordMiddle', 'coordEnd'])
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności karty przykładowej: powierzchnia + 8 struktury', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Ekspansja borówki czarnej Vaccinium myrtillus',
      'Ekspansja krzewów i podrostu drzew',
      'Gatunki charakterystyczne',
      'Gatunki ekspansywne',
      'Obce gatunki inwazyjne',
      'Procent powierzchni zajęty przez siedlisko na transekcie',
      'Występowanie śmiałka pogiętego Deschampsia flexuosa',
      'Zniszczenia mechaniczne',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('kardynalne (lista pod tab. 2): gatunki charakterystyczne, ekspansywne, krzewy, zniszczenia', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id).sort()).toEqual(['characteristic', 'expansive', 'mechanical', 'shrubs'])
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

  it('termin: ostrzeżenie poza oknem koniec czerwca – koniec sierpnia (z zapasem do 10 września)', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    for (const ok of ['2011-08-05', '2021-07-30', '2016-06-25', '2021-09-10']) expect(date.warn!(ok), ok).toBeNull()
    for (const bad of ['2021-06-10', '2021-09-20', '2021-10-01']) expect(date.warn!(bad), bad).toMatch(/koniec czerwca/)
  })

  it('transekt: 100–200 × 10–15 m bez ostrzeżenia, inaczej ostrzega', () => {
    const t = m.siteFields.find((f) => f.name === 'transect')!
    expect(t.warn!('120x10 m')).toBeNull()
    expect(t.warn!('10 × 200 m')).toBeNull()
    expect(t.warn!('punktowe')).toBeNull()
    expect(t.warn!('50x5 m')).toMatch(/100–200/)
  })

  it('zdjęcie mniejsze niż 25 m² – ostrzeżenie', () => {
    const area = m.releves.fields.find((f) => f.name === 'area')!
    expect(area.warn!(25)).toBeNull()
    expect(area.warn!(4)).toMatch(/5 × 5 m/)
  })

  it('kody oddziaływań bez duplikatów, z turystyką, narciarstwem, wydeptywaniem, erozją, lawinami, sukcesją i klimatem', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    expect(codes).toEqual(expect.arrayContaining(['G01.02', 'G01.06', 'G05.01', 'D01.01', 'K01.01', 'L04', 'K02', 'M01', 'B01.02']))
  })

  it('inne informacje: udział FV/U1/U2 przed uwagami', () => {
    const names = allOtherFields(m).map((f) => f.name)
    expect(names.slice(names.indexOf('shareFV'), names.indexOf('notes') + 1)).toEqual(['shareFV', 'shareU1', 'shareU2', 'notes'])
  })
})

describe('metodyka 6150 – progi tab. 2', () => {
  it('borówka czarna: <10 FV, 10–50 U1 (obie granice), >50 U2', () => {
    expect([0, 9.9, 10, 50, 51].map(gradeBilberry6150)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('krzewy i podrost: <10 FV, 10–25 U1 (obie granice), >25 U2', () => {
    expect([0, 9, 10, 25, 26].map(gradeShrubs6150)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('gatunki charakterystyczne: >5 FV, 3–5 U1, <3 U2', () => {
    expect([0, 2, 3, 5, 6, 16].map(gradeCharacteristic6150)).toEqual(['U2', 'U2', 'U1', 'U1', 'FV', 'FV'])
  })
  it('ekspansywne: <10 FV, 10–50 U1 (obie granice), >50 U2', () => {
    expect([0, 9.9, 10, 50, 50.5].map(gradeExpansive6150)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('obce: brak FV; jeden gatunek do 10% U1; kilka gatunków albo jeden >10% U2', () => {
    expect(gradeAliens6150(0)).toBe('FV')
    expect(gradeAliens6150(1)).toBe('U1')
    expect(gradeAliens6150(1, 10)).toBe('U1')
    expect(gradeAliens6150(1, 12)).toBe('U2')
    expect(gradeAliens6150(2, 0.5)).toBe('U2')
    expect(gradeAliens6150(4, 1)).toBe('U2') // Śnieżnik 2021
  })
  it('procent powierzchni: >75 FV, 50–75 U1 (obie granice), <50 U2', () => {
    expect([100, 76, 75, 50, 49].map(gradeHabitatShare6150)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('śmiałek pogięty: <10 FV, 10–25 U1 (obie granice), >25 U2', () => {
    expect([2, 9, 10, 25, 30].map(gradeDeschampsia6150)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })
  it('zniszczenia mechaniczne liczbą: 0 FV, do 25% U1, >25% U2', () => {
    expect([0, 5, 25, 26].map(gradeMechanical6150)).toEqual(['FV', 'U1', 'U1', 'U2'])
  })
})

describe('metodyka 6150 – podpowiedzi z pól', () => {
  it('powierzchnia: z wyboru; XX przy braku danych', () => {
    expect(suggest('area', { choice: 'stable' })).toBe('FV')
    expect(suggest('area', { choice: 'minor' })).toBe('U1')
    expect(suggest('area', { choice: 'unknown' })).toBe('XX')
    expect(suggest('area', { choice: '' })).toBeNull()
  })

  it('borówka i śmiałek: liczba > „nie stwierdzono”; ostrzeżenie przy sprzeczności', () => {
    expect(suggest('bilberry', { cover: 35 })).toBe('U1')
    expect(suggest('bilberry', { cover: 60 })).toBe('U2') // Połonina Wetlińska 2021
    expect(suggest('bilberry', { none: 'yes' })).toBe('FV')
    expect(suggest('bilberry', {})).toBeNull()
    expect(suggest('deschampsia', { cover: 30 })).toBe('U2') // Diablak 2021
    expect(warn('deschampsia', { cover: 5, none: 'yes' })).toMatch(/Nie stwierdzono/)
  })

  it('krzewy: łączne zwarcie > suma; „nie stwierdzono” = FV; bez pokrycia brak podpowiedzi; zielne ostrzegają', () => {
    expect(suggest('shrubs', { species: sp(['Pinus mugo', 15], ['Picea abies', 5]) })).toBe('U1')
    expect(suggest('shrubs', { species: sp(['Pinus mugo', 15]), total: 2 })).toBe('FV')
    expect(suggest('shrubs', { none: 'yes' })).toBe('FV')
    expect(suggest('shrubs', { species: sp(['Pinus mugo']) })).toBeNull()
    expect(warn('shrubs', { species: sp(['Juncus trifidus', 2]) })).toMatch(/To nie drzewa/)
  })

  it('charakterystyczne: wybór > liczba wprost > lista; synonimy raz; niecharakterystyczne ostrzegają', () => {
    const six = sp(['Juncus trifidus'], ['Oreochloa disticha'], ['Festuca airoides'], ['Agrostis rupestris'], ['Hieracium alpinum'], ['Huperzia selago'])
    expect(suggest('characteristic', { species: six })).toBe('FV')
    expect(suggest('characteristic', { species: six.slice(0, 5) })).toBe('U1')
    expect(suggest('characteristic', { species: [six[0], { name: 'Festuca supina' }, { name: 'Festuca airoides' }] })).toBe('U2') // kostrzewa niska raz
    expect(suggest('characteristic', { species: six, count: 4 })).toBe('U1')
    expect(suggest('characteristic', { count: 1, choice: 'U1' })).toBe('U1')
    expect(warn('characteristic', { species: sp(['Juncus trifidus'], ['Vaccinium myrtillus']) })).toMatch(/Nie liczą się jako charakterystyczne: Vaccinium myrtillus/)
    expect(warn('characteristic', { count: 4, choice: 'FV' })).toMatch(/Wybrano FV/)
  })

  it('charakterystyczne: wyleżysko (6150-4) z 1 gatunkiem – podpowiedź ekspercka (Mały Śnieżny Kocioł)', () => {
    const c = ctx({ site: { subtype: '6150-4' } })
    expect(suggest('characteristic', { species: sp(['Polytrichastrum sexangulare', 70]) }, c)).toBe('U2')
    expect(warn('characteristic', { species: sp(['Polytrichastrum sexangulare', 70]) }, c)).toMatch(/Małym Śnieżnym Kotle/)
    expect(warn('characteristic', { species: sp(['Polytrichastrum sexangulare', 70]) }, ctx({ site: { subtype: '6150-1' } }))).toBeNull()
  })

  it('ekspansywne: charakterystyczne pomijane, suma reszty; ostrzeżenie o śmiałku i borówce czarnej', () => {
    expect(suggest('expansive', { species: sp(['Vaccinium vitis-idaea', 5]) })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Calamagrostis villosa', 30]) })).toBe('U1') // Połonina Wetlińska
    expect(suggest('expansive', { species: sp(['Deschampsia flexuosa', 30], ['Vaccinium myrtillus', 25]) })).toBe('U2')
    expect(suggest('expansive', { species: sp(['Juncus trifidus', 60]) })).toBe('FV')
    expect(suggest('expansive', { none: 'yes' })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Deschampsia flexuosa', 25]), choice: 'FV' })).toBe('FV')
    expect(warn('expansive', { species: sp(['Deschampsia flexuosa', 25]) })).toMatch(/osobne wskaźniki/)
    expect(warn('expansive', { species: sp(['Deschampsia flexuosa', 25]), choice: 'FV' })).toBeNull()
    expect(warn('expansive', { species: sp(['Pinus mugo', 5]) })).toMatch(/Ekspansja krzewów/)
  })

  it('obce: liczba gatunków i pokrycie; Śnieżnik 2021 – 4 gatunki ok. 1% → U2', () => {
    expect(suggest('aliens', { none: 'yes' })).toBe('FV')
    expect(suggest('aliens', { species: sp(['Poa annua', 0.5]) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Poa annua']) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Rumex alpinus', 15]) })).toBe('U2')
    expect(suggest('aliens', { species: sp(['Ranunculus acris'], ['Agrostis capillaris'], ['Cerastium holosteoides'], ['Ceratodon purpureus']), total: 1 })).toBe('U2')
    expect(suggest('aliens', { count: 1, total: 3 })).toBe('U1')
    expect(suggest('aliens', {})).toBeNull()
    expect(warn('aliens', { species: sp(['Juncus trifidus']) })).toMatch(/To nie gatunki synantropijne/)
  })

  it('procent powierzchni: z liczby (Połonina Wetlińska 50% → U1)', () => {
    expect(suggest('habitatShare', { value: 100 })).toBe('FV')
    expect(suggest('habitatShare', { value: 50 })).toBe('U1')
    expect(suggest('habitatShare', {})).toBeNull()
  })

  it('zniszczenia: wybór > liczba; rozjazd wyboru z liczbą ostrzega (Śnieżnik: 15% a U2)', () => {
    expect(suggest('mechanical', { choice: 'none' })).toBe('FV')
    expect(suggest('mechanical', { share: 15 })).toBe('U1') // Kasprowy Wierch 10–20%
    expect(suggest('mechanical', { share: 30 })).toBe('U2')
    expect(suggest('mechanical', { choice: 'major', share: 15 })).toBe('U2')
    expect(warn('mechanical', { choice: 'major', share: 15 })).toMatch(/otoczeniu transektu/)
    expect(warn('mechanical', { choice: 'minor', share: 15 })).toBeNull()
  })

  it('katalog: drzewa i krzewy w B, porosty i mchy w D, runo w C, bez duplikatów, synonimy jednym kluczem', () => {
    const latin = SPECIES_6150.map((s) => s.latin.toLowerCase())
    expect(new Set(latin).size).toBe(latin.length)
    expect(defaultLayer6150(findSpecies6150('Pinus mugo')!)).toBe('B')
    expect(defaultLayer6150(findSpecies6150('Cetraria islandica')!)).toBe('D')
    expect(defaultLayer6150(findSpecies6150('Juncus trifidus')!)).toBe('C')
    expect(speciesKey6150('Festuca supina')).toBe(speciesKey6150('Festuca airoides'))
    expect(speciesKey6150('Avenella flexuosa')).toBe(speciesKey6150('Deschampsia flexuosa'))
    // wykaz z przewodnika: 48 taksonów (bez synonimów), 16 z gwiazdką (wyleżyska)
    const guide = SPECIES_6150.filter((s) => s.source === 'guide')
    expect(new Set(guide.map((s) => speciesKey6150(s.latin))).size).toBe(48)
    expect(new Set(guide.filter((s) => s.snowbed).map((s) => speciesKey6150(s.latin))).size).toBe(16)
    expect(isCharacteristic6150('Sedum alpestre')).toBe(true)
    expect(m.speciesInfo!('Salix herbacea')).toMatch(/wyleżyska/)
    expect(m.speciesInfo!('Potentilla aurea')).toMatch(/wg sprawozdań/)
  })
})

describe('metodyka 6150 – ocena struktury i ogólna (reguła ogólna silnika = tab. 2)', () => {
  const all = (g: Grade): CardValues => {
    const v = emptyCardValues(m)
    for (const i of m.indicators) v.indicators[i.id] = { inputs: {}, value: 'x', grade: g }
    v.prospects = { value: 'x', grade: g }
    return v
  }
  const withGrade = (base: CardValues, id: string, g: Grade): CardValues => ({ ...base, indicators: { ...base.indicators, [id]: { ...base.indicators[id], grade: g } } })

  it('wszystko FV → FV; niekardynalny U1 → FV; niekardynalny U2 (śmiałek) → U1', () => {
    expect(assessCard(m, all('FV'))).toMatchObject({ structure: 'FV', overall: 'FV' })
    expect(assessCard(m, withGrade(all('FV'), 'bilberry', 'U1')).structure).toBe('FV')
    expect(assessCard(m, withGrade(all('FV'), 'deschampsia', 'U2'))).toMatchObject({ structure: 'U1', overall: 'U1' })
  })

  it('kardynalny U1 (zniszczenia) → U1 (Czerwony Grzbiet); kardynalny U2 → U2', () => {
    expect(assessCard(m, withGrade(all('FV'), 'mechanical', 'U1'))).toMatchObject({ structure: 'U1', overall: 'U1' })
    expect(assessCard(m, withGrade(all('FV'), 'expansive', 'U2')).structure).toBe('U2')
  })
})

describe('przykład Kopa Kondracka (karta z przewodnika, 2011)', () => {
  const c = ctx({ site: kopaKondracka.site, indicators: kopaKondracka.indicators })

  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(kopaKondracka)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie – wszystkie FV', () => {
    const grades = Object.fromEntries(Object.entries(kopaKondracka.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual(Object.fromEntries(m.indicators.map((i) => [i.id, 'FV'])))
  })

  it('parametry i ocena ogólna jak w karcie: wszystko FV', () => {
    expect(assessCard(m, kopaKondracka)).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV', missing: [] })
  })

  it('podpowiedzi formularza zgodne z ekspertem przy każdym wskaźniku', () => {
    for (const i of m.indicators) expect(i.suggest!(kopaKondracka.indicators[i.id].inputs, c), i.id).toBe(kopaKondracka.indicators[i.id].grade)
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    for (const i of m.indicators) expect(i.describe!(kopaKondracka.indicators[i.id].inputs, c), i.id).toBe(kopaKondracka.indicators[i.id].value)
  })

  it('bez ostrzeżeń przy wskaźnikach, stanowisku i zdjęciach (sierpień, zdjęcia 5 × 5 m, transekt 120 × 10 m)', () => {
    for (const i of m.indicators) expect(i.warn?.(kopaKondracka.indicators[i.id].inputs, c) ?? null, i.id).toBeNull()
    for (const f of m.siteFields) expect(f.warn?.(kopaKondracka.site[f.name]) ?? null, f.name).toBeNull()
    for (const r of kopaKondracka.releves) for (const f of m.releves.fields) expect(f.warn?.(r[f.name]) ?? null, f.name).toBeNull()
  })

  it('zdjęcia jak w karcie, udział FV 100%, obserwatorzy zanonimizowani', () => {
    expect(examples6150).toHaveLength(1)
    expect(kopaKondracka.releves.map((r) => (r.species as unknown[]).length)).toEqual([11, 9, 15])
    expect(kopaKondracka.releves.map((r) => [r.altitude, r.area, r.slope, r.exposure, r.coverC, r.coverD, r.heightC])).toEqual([
      [1785, 25, 40, 'NW', 90, 60, 20],
      [1800, 25, 40, 'W', 90, 5, 20],
      [1820, 25, 40, 'NW', 90, 10, 15],
    ])
    const rows = kopaKondracka.releves.flatMap((r) => r.species as { name: string; layer: string }[])
    for (const r of rows) expect(findSpecies6150(r.name), r.name).toBeTruthy()
    expect(rows.filter((r) => r.layer === 'D').map((r) => r.name)).toEqual([
      'Cetraria islandica',
      'Cladonia sp.',
      'Pleurozium schreberi',
      'Polytrichum sp.',
      'Cetraria islandica',
      'Cetraria islandica',
      'Cladonia sp.',
      'Sphagnum sp.',
    ])
    const o = kopaKondracka.other
    expect(Number(o.shareFV) + Number(o.shareU1) + Number(o.shareU2)).toBe(100)
    expect(kopaKondracka.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(kopaKondracka)).not.toMatch(/Kozak|Kozłowska|Kuciel|Stawowczyk/)
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, udział FV/U1/U2 i dane stanowiska', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, kopaKondracka))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['6150 Wysokogórskie murawy acidofilne', 'Zniszczenia mechaniczne', 'Udział powierzchni siedliska w stanie FV', 'Kopa Kondracka', '6150-1'])
      expect(text, t).toContain(t)
  })
})
