import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { examples6520, lasowka } from './examples'
import {
  gradeAliens6520,
  gradeCharacteristic6520,
  gradeExpansive6520,
  gradeLitter6520,
  gradePercent6520,
  gradeShrubs6520,
  indicator6520 as ind,
  methodology6520 as m,
} from './methodology'
import { SPECIES_6520, defaultLayer6520, findSpecies6520, isCharacteristic6520, speciesKey6520 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const sudety = ctx({ site: { region: 'sudety' } })
const suggest = (id: string, inputs: InputValues, c = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const warn = (id: string, inputs: InputValues, c = ctx()) => ind(id).warn!(inputs, c)
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => (cover === undefined ? { name } : { name, cover }))

describe('metodyka 6520 – struktura', () => {
  it('kod 6520 (nie priorytetowe), 3 zdjęcia po 25 m², podtyp i region opcjonalne', () => {
    expect(habitatCode(m)).toBe('6520')
    expect(m.priority).toBeFalsy()
    expect(m.name).toBe('Górskie łąki konietlicowe i mietlicowe użytkowane ekstensywnie (Polygono-Trisetion i Arrhenatherion)')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(m.siteFields.find((f) => f.name === 'subtype')?.required).toBeFalsy()
    expect(m.siteFields.find((f) => f.name === 'region')?.required).toBeFalsy()
    expect(m.siteFields.filter((f) => f.group === 'Współrzędne geograficzne').map((f) => f.name)).toEqual(['coordStart', 'coordMiddle', 'coordEnd'])
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności karty przykładowej: powierzchnia + 9 struktury', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Procent powierzchni zajęty przez siedlisko na transekcie',
      'Struktura przestrzenna płatów siedliska',
      'Gatunki charakterystyczne',
      'Gatunki dominujące',
      'Obce gatunki inwazyjne',
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Ekspansja krzewów i podrostu drzew',
      'Zachowanie strefy ekotonowej',
      'Wojłok (martwa materia organiczna)',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('kardynalne (lista pod tab. 2): charakterystyczne, ekspansywne, krzewy, struktura przestrzenna', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id).sort()).toEqual(['characteristic', 'expansive', 'shrubs', 'spatial'])
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

  it('termin: 15.06–31.07 bez ostrzeżenia; 1–14.06 i 1–15.08 – miękkie; poza 1.06–15.08 – twarde', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    for (const ok of ['2024-06-15', '2009-07-25', '2024-07-31']) expect(date.warn!(ok), ok).toBeNull()
    for (const soft of ['2024-06-01', '2017-08-08', '2024-08-15']) expect(date.warn!(soft), soft).toMatch(/poza optymalnym/)
    for (const bad of ['2024-05-25', '2010-09-20']) expect(date.warn!(bad), bad).toMatch(/poza dopuszczalnym/)
  })

  it('kody oddziaływań bez duplikatów, z koszeniem, wypasem, zabudową, sukcesją i gatunkami obcymi', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    expect(codes).toEqual(expect.arrayContaining(['A03', 'A03.03', 'A04.01', 'A04.03', 'A08', 'B01', 'E01.03', 'D01.02', 'D02.01', 'I01', 'I02', 'K02', 'G02.02', 'M01.02']))
  })

  it('inne informacje: propozycje, monitoring wymagany z uzasadnieniem, udział FV/U1/U2 przed uwagami', () => {
    const names = allOtherFields(m).map((f) => f.name)
    expect(names).toEqual(expect.arrayContaining(['proposals', 'monitoringRequired', 'justification']))
    expect(names.slice(names.indexOf('shareFV'), names.indexOf('notes') + 1)).toEqual(['shareFV', 'shareU1', 'shareU2', 'notes'])
  })

  it('zdjęcia mają uwagi i warstwy B, C, D w jednej grupie', () => {
    expect(m.releves.fields.map((f) => f.name)).toContain('remarks')
    expect(m.releves.fields.filter((f) => f.group === 'Zwarcie i wysokość warstw B, C, D').map((f) => f.name)).toEqual(['coverB', 'coverC', 'coverD', 'heightB', 'heightC', 'heightD'])
  })
})

describe('metodyka 6520 – progi tab. 2', () => {
  it('procent powierzchni: ≥80 FV; luki 51–59 i 71–79 → U1 (praktyka 2024); ≤50 U2', () => {
    expect([100, 80, 79, 70, 60, 55, 50.5, 50, 30].map(gradePercent6520)).toEqual(['FV', 'FV', 'U1', 'U1', 'U1', 'U1', 'U1', 'U2', 'U2'])
  })
  it('gatunki charakterystyczne: >5 FV, 3–5 U1, ≤2 U2', () => {
    expect([0, 2, 3, 5, 6, 12].map(gradeCharacteristic6520)).toEqual(['U2', 'U2', 'U1', 'U1', 'FV', 'FV'])
  })
  it('ekspansywne: silnie ekspansywny >10% lub łącznie >50% U2; >1% lub łącznie >30% U1; inaczej FV', () => {
    expect(gradeExpansive6520(0, 30)).toBe('FV') // karta Lasówka: dziurawiec 30%
    expect(gradeExpansive6520(1, 10)).toBe('FV')
    expect(gradeExpansive6520(2, 2)).toBe('U1')
    expect(gradeExpansive6520(10, 10)).toBe('U1')
    expect(gradeExpansive6520(0, 31)).toBe('U1')
    expect(gradeExpansive6520(11, 11)).toBe('U2')
    expect(gradeExpansive6520(0, 50)).toBe('U1')
    expect(gradeExpansive6520(0, 51)).toBe('U2')
  })
  it('obce: pojedyncze słabo inwazyjne FV; słabo <5% albo pojedyncze silnie inwazyjne U1; więcej U2', () => {
    const none = { count: 0, total: 0 }
    expect(gradeAliens6520(none, none)).toBe('FV')
    expect(gradeAliens6520(none, { count: 1, total: 0.5 })).toBe('FV')
    expect(gradeAliens6520(none, { count: 1, total: 3 })).toBe('U1')
    expect(gradeAliens6520(none, { count: 2, total: 5 })).toBe('U1')
    expect(gradeAliens6520(none, { count: 1, total: 15 })).toBe('U2') // Płazówka – przetacznik nitkowaty
    expect(gradeAliens6520({ count: 1, total: 0.5 }, none)).toBe('U1') // Gierczyn – pojedyncza nawłoć
    expect(gradeAliens6520({ count: 1, total: 7 }, none)).toBe('U2') // łubin ≥7%
  })
  it('krzewy: <1 FV, 1–5 U1 (obie granice), >5 U2; wojłok: <2 FV, 2–5 U1, >5 U2', () => {
    expect([0, 0.5, 1, 5, 7].map(gradeShrubs6520)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
    expect([0, 1.9, 2, 4, 5, 6].map(gradeLitter6520)).toEqual(['FV', 'FV', 'U1', 'U1', 'U1', 'U2'])
  })
})

describe('metodyka 6520 – podpowiedzi wskaźników', () => {
  it('gatunki charakterystyczne: z listy (synonimy raz), liczba wprost, ocena ekspercka', () => {
    expect(suggest('characteristic', { species: sp(['Trisetum flavescens'], ['Melandrium rubrum'], ['Silene dioica']) })).toBe('U2')
    expect(suggest('characteristic', { species: sp(['Trisetum flavescens'], ['Galium mollugo'], ['Knautia arvensis'], ['Campanula patula']) })).toBe('U1')
    expect(
      suggest('characteristic', { species: sp(['Trisetum flavescens'], ['Alchemilla monticola'], ['Crepis mollis'], ['Astrantia major'], ['Pimpinella major'], ['Tragopogon orientalis']) }),
    ).toBe('FV')
    expect(suggest('characteristic', { count: 4 })).toBe('U1')
    expect(suggest('characteristic', { count: 4, choice: 'FV' })).toBe('FV')
    expect(warn('characteristic', { count: 4, choice: 'FV' })).toMatch(/uzasadnij/)
    expect(suggest('characteristic', {})).toBeNull()
  })

  it('gatunki charakterystyczne: niżowe taksony Arrhenatheretum nie liczą się; lokalne tylko w swoim regionie', () => {
    expect(isCharacteristic6520('Arrhenatherum elatius')).toBe(false)
    expect(warn('characteristic', { species: sp(['Arrhenatherum elatius'], ['Geranium pratense']) })).toMatch(/niżowego Arrhenatheretum/)
    // kostrzewa czerwona – tylko w Sudetach
    const fest = { species: sp(['Festuca rubra'], ['Trisetum flavescens'], ['Meum athamanticum']) }
    expect(suggest('characteristic', fest)).toBe('U2')
    expect(suggest('characteristic', fest, sudety)).toBe('U1')
    expect(warn('characteristic', fest)).toMatch(/ustaw „Region”/)
    expect(warn('characteristic', fest, sudety)).toBeNull()
    // łąka tatrzańska
    const tatry = { species: sp(['Trifolium pratense'], ['Plantago media'], ['Polygala brachyptera']) }
    expect(suggest('characteristic', tatry)).toBe('U2')
    expect(suggest('characteristic', tatry, ctx({ site: { region: 'tatry' } }))).toBe('U1')
    expect(warn('characteristic', tatry, ctx({ site: { region: 'pieniny' } }))).toMatch(/inny region/)
  })

  it('dominujące: silnie ekspansywny, obcy albo krzew >10% → U2; gatunek spoza charakterystycznych >50% → U1', () => {
    expect(suggest('dominant', { species: sp(['Agrostis capillaris', 30], ['Hypericum maculatum', 30], ['Festuca rubra', 10]) })).toBe('FV')
    expect(suggest('dominant', { species: sp(['Agrostis capillaris', 60], ['Festuca rubra', 10]) })).toBe('U1') // silna dominacja mietlicy (2024)
    expect(suggest('dominant', { species: sp(['Trisetum flavescens', 60]) })).toBe('FV')
    expect(suggest('dominant', { species: sp(['Pteridium aquilinum', 30], ['Agrostis capillaris', 30]) })).toBe('U2') // Krempna
    expect(suggest('dominant', { species: sp(['Veronica filiformis', 15]) })).toBe('U2') // Płazówka
    expect(suggest('dominant', { species: sp(['Acer pseudoplatanus', 20], ['Rubus idaeus', 20]) })).toBe('U2') // Zimne Wody
    expect(suggest('dominant', { species: sp(['Deschampsia caespitosa', 5], ['Agrostis capillaris', 40]) })).toBe('FV')
    expect(suggest('dominant', { species: sp(['Agrostis capillaris']) })).toBeNull()
    expect(warn('dominant', { species: sp(['Hypericum maculatum', 30]) })).toMatch(/status sporny/)
  })

  it('obce: brak FV; pojedyncza nawłoć U1; łubin 7% U2; słabo inwazyjne do 0,5% FV; bez pokrycia – brak podpowiedzi', () => {
    expect(suggest('aliens', { none: 'yes' })).toBe('FV')
    expect(suggest('aliens', { species: sp(['Solidago canadensis', 0.5]) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Lupinus polyphyllus', 7]) })).toBe('U2')
    expect(suggest('aliens', { species: sp(['Juncus tenuis', 0.5]) })).toBe('FV')
    expect(suggest('aliens', { species: sp(['Juncus tenuis', 2], ['Epilobium ciliatum', 1]) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Veronica filiformis', 15]) })).toBe('U2')
    expect(suggest('aliens', { species: sp(['Lupinus polyphyllus']) })).toBeNull()
    expect(suggest('aliens', { total: 3 })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Lupinus polyphyllus']), total: 0.5 })).toBe('U1')
    expect(suggest('aliens', {})).toBeNull()
    expect(warn('aliens', { species: sp(['Deschampsia caespitosa', 5]) })).toMatch(/To nie gatunki obce.*rodzime ekspansywne/)
    expect(warn('aliens', { species: sp(['Lupinus polyphyllus', 1]), none: 'yes' })).toMatch(/Nie stwierdzono/)
  })

  it('ekspansywne: znikome nie liczą się; silnie ekspansywny >10% U2; ocena ekspercka i łączne pokrycie mają pierwszeństwo', () => {
    expect(suggest('expansive', { none: 'yes' })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Hypericum maculatum', 30], ['Aegopodium podagraria'], ['Rumex crispus']) })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Hypericum maculatum', 40]) })).toBe('U1')
    expect(suggest('expansive', { species: sp(['Hypericum maculatum', 55]) })).toBe('U2') // Sudety 2016–2018: ok. 50%
    expect(suggest('expansive', { species: sp(['Deschampsia caespitosa', 5]) })).toBe('U1')
    expect(suggest('expansive', { species: sp(['Pteridium aquilinum', 15]) })).toBe('U2')
    expect(suggest('expansive', { species: sp(['Vaccinium myrtillus', 1], ['Urtica dioica', 0.5]) })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Trisetum flavescens', 40], ['Lupinus polyphyllus', 20]) })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Holcus mollis', 5]), total: 35 })).toBe('U1')
    expect(suggest('expansive', { species: sp(['Pteridium aquilinum', 15]), choice: 'U1' })).toBe('U1')
    expect(warn('expansive', { species: sp(['Pteridium aquilinum', 15]), choice: 'U1' })).toMatch(/uzasadnij/)
    expect(warn('expansive', { species: sp(['Lupinus polyphyllus', 5]) })).toMatch(/Obce gatunki inwazyjne/)
    expect(warn('expansive', { species: sp(['Trisetum flavescens', 5]) })).toMatch(/charakterystyczne/)
    expect(suggest('expansive', {})).toBeNull()
  })

  it('krzewy: suma listy albo łączne pokrycie; bez pokrycia – brak podpowiedzi', () => {
    expect(suggest('shrubs', { none: 'yes' })).toBe('FV')
    expect(suggest('shrubs', { species: sp(['Crataegus monogyna']), total: 0.5 })).toBe('FV')
    expect(suggest('shrubs', { species: sp(['Betula pendula', 2], ['Salix caprea', 1]) })).toBe('U1')
    expect(suggest('shrubs', { species: sp(['Acer pseudoplatanus', 20], ['Betula pendula', 20]) })).toBe('U2')
    expect(suggest('shrubs', { species: sp(['Picea abies']) })).toBeNull()
    expect(warn('shrubs', { species: sp(['Trisetum flavescens', 1]) })).toMatch(/To nie drzewa/)
    expect(warn('shrubs', { species: sp(['Rubus idaeus', 2]) })).toBeNull()
  })

  it('procent, wojłok: liczba albo ocena ekspercka (z ostrzeżeniem); select: struktura, ekoton, powierzchnia', () => {
    expect(suggest('percent', { percent: 90 })).toBe('FV')
    expect(suggest('percent', { percent: 65 })).toBe('U1')
    expect(suggest('percent', { percent: 80, choice: 'U1' })).toBe('U1')
    expect(warn('percent', { percent: 80, choice: 'U1' })).toMatch(/zaniżoną/)
    expect(suggest('litter', { min: 0.5, max: 3, mean: 1 })).toBe('FV')
    expect(suggest('litter', { mean: 4 })).toBe('U1')
    expect(ind('litter').describe!({ min: 0.5, max: 3, mean: 1 })).toBe('0,5–3 cm, średnio 1 cm')
    expect(warn('litter', { min: 3, max: 1, mean: 2 })).toMatch(/Minimum/)
    expect(suggest('spatial', { choice: 'medium' })).toBe('U1')
    expect(suggest('spatial', { choice: 'strong' })).toBe('U2')
    expect(suggest('ecotone', { choice: 'strong' })).toBe('U2')
    expect(suggest('area', { choice: 'lost' })).toBe('U2')
    expect(suggest('area', { choice: 'unknown' })).toBe('XX')
  })

  it('katalog: krzewy w B, mchy w D, runo w C, bez duplikatów, synonimy jednym kluczem', () => {
    const latin = SPECIES_6520.map((s) => s.latin.toLowerCase())
    expect(new Set(latin).size).toBe(latin.length)
    expect(defaultLayer6520(findSpecies6520('Crataegus monogyna')!)).toBe('B')
    expect(defaultLayer6520(findSpecies6520('Rhytidiadelphus squarrosus')!)).toBe('D')
    expect(defaultLayer6520(findSpecies6520('Trisetum flavescens')!)).toBe('C')
    expect(speciesKey6520('Senecio fuchsii')).toBe(speciesKey6520('Senecio ovatus'))
    expect(speciesKey6520('Silene dioica')).toBe(speciesKey6520('Melandrium rubrum'))
    expect(speciesKey6520('Arabidopsis halleri')).toBe(speciesKey6520('Cardaminopsis halleri'))
    // tab. 1: ekspansywne wymienione w przewodniku (bez synonimów): 13 gatunków
    expect(new Set(SPECIES_6520.filter((s) => s.strong).map((s) => speciesKey6520(s.latin))).size).toBe(13)
    expect(m.speciesInfo!('Festuca rubra')).toMatch(/tylko w regionie: Sudety/)
    expect(m.speciesInfo!('Hypericum maculatum')).toMatch(/sporny/)
    expect(m.speciesInfo!('Arrhenatherum elatius')).toMatch(/nie liczy się/)
    expect(m.speciesInfo!('Lupinus polyphyllus')).toMatch(/wysokim stopniu/)
  })
})

describe('metodyka 6520 – ocena struktury i ogólna (reguła ogólna silnika)', () => {
  const all = (g: Grade): CardValues => {
    const v = emptyCardValues(m)
    for (const i of m.indicators) v.indicators[i.id] = { inputs: {}, value: 'x', grade: g }
    v.prospects = { value: 'x', grade: g }
    return v
  }
  const withGrade = (base: CardValues, id: string, g: Grade): CardValues => ({ ...base, indicators: { ...base.indicators, [id]: { ...base.indicators[id], grade: g } } })

  it('wszystko FV → FV; niekardynalne U1 → FV; niekardynalny U2 → U1', () => {
    expect(assessCard(m, all('FV'))).toMatchObject({ structure: 'FV', overall: 'FV' })
    expect(assessCard(m, withGrade(withGrade(all('FV'), 'percent', 'U1'), 'litter', 'U1')).structure).toBe('FV')
    expect(assessCard(m, withGrade(all('FV'), 'dominant', 'U2'))).toMatchObject({ structure: 'U1', overall: 'U1' })
  })

  it('kardynalny U1 → U1; kardynalny U2 (ekspansywne, krzewy) → U2', () => {
    expect(assessCard(m, withGrade(all('FV'), 'spatial', 'U1'))).toMatchObject({ structure: 'U1', overall: 'U1' })
    expect(assessCard(m, withGrade(all('FV'), 'expansive', 'U2'))).toMatchObject({ structure: 'U2', overall: 'U2' })
    expect(assessCard(m, withGrade(all('FV'), 'shrubs', 'U2')).structure).toBe('U2')
  })
})

describe('przykład Lasówka (karta z przewodnika, 2009)', () => {
  const c = ctx({ site: lasowka.site, indicators: lasowka.indicators })

  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(lasowka)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie: procent powierzchni i wojłok U1, reszta FV', () => {
    const grades = Object.fromEntries(Object.entries(lasowka.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({
      area: 'FV',
      percent: 'U1',
      spatial: 'FV',
      characteristic: 'FV',
      dominant: 'FV',
      aliens: 'FV',
      expansive: 'FV',
      shrubs: 'FV',
      ecotone: 'FV',
      litter: 'U1',
    })
  })

  it('parametry i ocena ogólna jak w karcie: powierzchnia FV, struktura FV, perspektywy U1, ogólna U1', () => {
    expect(assessCard(m, lasowka)).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'U1', overall: 'U1', missing: [] })
  })

  it('podpowiedzi formularza zgodne z kartą przy każdym wskaźniku', () => {
    for (const i of m.indicators) expect(i.suggest!(lasowka.indicators[i.id].inputs, c), i.id).toBe(lasowka.indicators[i.id].grade)
  })

  it('bez oceny eksperckiej progi tab. 2 dają: charakterystyczne U1 (5 gat.), procent FV (80%), wojłok FV (1 cm)', () => {
    const without = (id: string) => ({ ...lasowka.indicators[id].inputs, choice: '' })
    expect(suggest('characteristic', without('characteristic'), c)).toBe('U1')
    expect(suggest('percent', without('percent'), c)).toBe('FV')
    expect(suggest('litter', without('litter'), c)).toBe('FV')
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    for (const i of m.indicators) expect(i.describe!(lasowka.indicators[i.id].inputs, c), i.id).toBe(lasowka.indicators[i.id].value)
  })

  it('ostrzeżenia tylko tam, gdzie ekspert odszedł od progów, i przy spornym dziurawcu; termin bez uwag', () => {
    const warned = m.indicators.filter((i) => i.warn?.(lasowka.indicators[i.id].inputs, c)).map((i) => i.id)
    expect(warned).toEqual(['percent', 'characteristic', 'dominant', 'litter'])
    expect(m.siteFields.filter((f) => f.warn?.(lasowka.site[f.name])).map((f) => f.name)).toEqual([])
    for (const r of lasowka.releves) for (const f of m.releves.fields) expect(f.warn?.(r[f.name]) ?? null, f.name).toBeNull()
  })

  it('zdjęcia jak w karcie (49, 46, 48 gatunków), mszaki w D, udział FV/U1 40/60, obserwator zanonimizowany', () => {
    expect(examples6520).toHaveLength(1)
    expect(lasowka.releves.map((r) => (r.species as unknown[]).length)).toEqual([49, 46, 48])
    expect(lasowka.releves.map((r) => [r.altitude, r.area, r.slope, r.exposure, r.coverC, r.coverD, r.heightC])).toEqual([
      [710, 25, 10, 'SW', 100, 30, 50],
      [710, 25, 10, 'SW', 100, 20, 60],
      [710, 25, 10, 'SW', 100, 20, 60],
    ])
    const rows = lasowka.releves.flatMap((r) => r.species as { name: string; layer: string }[])
    for (const r of rows) expect(findSpecies6520(r.name), r.name).toBeTruthy()
    expect(new Set(rows.filter((r) => r.layer === 'D').map((r) => r.name))).toEqual(new Set(['Brachythecium sp.', 'Rhytidiadelphus squarrosus']))
    // karta liczy 5 gatunków charakterystycznych; wszystkie znane katalogowi
    const names = (lasowka.indicators.characteristic.inputs.species as { name: string }[]).map((s) => s.name)
    expect(names.filter((n) => isCharacteristic6520(n, 'sudety'))).toHaveLength(5)
    const o = lasowka.other
    expect([o.shareFV, o.shareU1, o.shareU2]).toEqual([40, 60, 0])
    expect(lasowka.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(lasowka)).not.toMatch(/Smoczyk/)
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, udział FV/U1/U2 i dane stanowiska', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, lasowka))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['6520 Górskie łąki konietlicowe', 'Zachowanie strefy ekotonowej', 'Udział powierzchni siedliska w stanie FV', 'Lasówka', 'Polygono-Trisetion'])
      expect(text, t).toContain(t)
  })
})
