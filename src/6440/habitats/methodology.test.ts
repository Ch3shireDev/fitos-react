import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { branszczyk, examples6440 } from './examples'
import {
  gradeAliens6440,
  gradeCharacteristic6440,
  gradeExpansive6440,
  gradeLitter6440,
  gradeShare6440,
  gradeShrubs6440,
  gradeTypical6440,
  gradeValuable6440,
  indicator6440 as ind,
  methodology6440 as m,
} from './methodology'
import { SPECIES_6440, defaultLayer6440, findSpecies6440, isCharacteristic6440, isDistinguishing6440, speciesKey6440 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues, c = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const warn = (id: string, inputs: InputValues, c = ctx()) => ind(id).warn!(inputs, c)
const explain = (id: string, inputs: InputValues, c = ctx()) => ind(id).explain!(inputs, c)
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => (cover === undefined ? { name } : { name, cover }))

describe('metodyka 6440 – struktura', () => {
  it('kod 6440 (nie priorytetowe), 3 zdjęcia po 25 m², transekt 200x10 m domyślnie', () => {
    expect(habitatCode(m)).toBe('6440')
    expect(m.priority).toBeFalsy()
    expect(m.name).toBe('Łąki selernicowe (Cnidion dubii)')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(m.siteFields.find((f) => f.name === 'transect')?.defaultValue).toBe('200x10 m')
    expect(m.siteFields.filter((f) => f.group === 'Współrzędne geograficzne').map((f) => f.name)).toEqual(['coordStart', 'coordMiddle', 'coordEnd'])
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności karty przykładowej: powierzchnia + 10 struktury', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Procent powierzchni zajęty przez siedlisko na transekcie',
      'Struktura przestrzenna płatów siedliska',
      'Gatunki charakterystyczne',
      'Gatunki dominujące',
      'Cenne składniki flory',
      'Obce gatunki inwazyjne',
      'Gatunki ekspansywne roślin zielnych',
      'Ekspansja krzewów i podrostu drzew',
      'Zachowanie płatów lokalnie typowych',
      'Wojłok (martwa materia organiczna)',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('kardynalne (lista pod tab. 2): charakterystyczne, obce, ekspansywne, krzewy', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['characteristic', 'aliens', 'expansive', 'shrubs'])
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

  it('termin: koniec czerwca – sierpień bez ostrzeżenia; wrzesień i początek października – miękkie; poza – twarde', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    for (const ok of ['2010-06-25', '2010-08-14', '2016-08-31']) expect(date.warn!(ok), ok).toBeNull()
    for (const soft of ['2016-09-20', '2016-10-05', '2016-06-16']) expect(date.warn!(soft), soft).toMatch(/poza optymalnym/)
    for (const bad of ['2016-05-20', '2016-10-20']) expect(date.warn!(bad), bad).toMatch(/poza okresem/)
  })

  it('kody oddziaływań bez duplikatów, z koszeniem, wypasem, zatopieniem, sukcesją, osuszaniem i gatunkami obcymi', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    expect(codes).toEqual(expect.arrayContaining(['A03', 'A03.03', 'A04', 'A04.01', 'A02.03', 'A08', 'J02.01', 'K01.03', 'K01.04', 'K02', 'K02.01', 'K02.02', 'I01', 'M01.02']))
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

describe('metodyka 6440 – progi tab. 2', () => {
  it('procent powierzchni na transekcie: >40 FV, 20–40 U1 (obie granice), <20 U2', () => {
    expect([100, 40.5, 40, 30, 20, 19.9, 5].map(gradeShare6440)).toEqual(['FV', 'FV', 'U1', 'U1', 'U1', 'U2', 'U2'])
  })
  it('gatunki charakterystyczne: 2+ FV; jeden licznie (≥25%) U1; jeden nielicznie albo brak U2; jeden bez pokrycia – brak', () => {
    expect(gradeCharacteristic6440(4, 5)).toBe('FV')
    expect(gradeCharacteristic6440(2)).toBe('FV')
    expect(gradeCharacteristic6440(1, 40)).toBe('U1')
    expect(gradeCharacteristic6440(1, 25)).toBe('U1')
    expect(gradeCharacteristic6440(1, 10)).toBe('U2')
    expect(gradeCharacteristic6440(0)).toBe('U2')
    expect(gradeCharacteristic6440(1)).toBeNull()
  })
  it('cenne składniki flory: 3+ FV; 1–2 łącznie >25% FV, mniej U1; brak U2', () => {
    expect(gradeValuable6440(9, 13)).toBe('FV')
    expect(gradeValuable6440(2, 30)).toBe('FV')
    expect(gradeValuable6440(2, 25)).toBe('U1')
    expect(gradeValuable6440(1, 1)).toBe('U1')
    expect(gradeValuable6440(0)).toBe('U2')
    expect(gradeValuable6440(1)).toBeNull()
  })
  it('obce: brak FV; do 5% U1; >5% U2; obecne bez pokrycia U1', () => {
    expect(gradeAliens6440(0)).toBe('FV')
    expect(gradeAliens6440(0.5)).toBe('U1')
    expect(gradeAliens6440(5)).toBe('U1')
    expect(gradeAliens6440(5.5)).toBe('U2')
    expect(gradeAliens6440(0, true)).toBe('U1')
  })
  it('ekspansywne: <10 FV, 10–30 U1 (obie granice), >30 U2', () => {
    expect([0, 9.9, 10, 18, 30, 30.5].map(gradeExpansive6440)).toEqual(['FV', 'FV', 'U1', 'U1', 'U1', 'U2'])
  })
  it('krzewy: do 0,5% w runi FV; do 1% albo warstwa b U1; >1% U2', () => {
    expect(gradeShrubs6440(0)).toBe('FV')
    expect(gradeShrubs6440(0.5)).toBe('FV')
    expect(gradeShrubs6440(0.5, true)).toBe('U1')
    expect(gradeShrubs6440(1)).toBe('U1')
    expect(gradeShrubs6440(1.5)).toBe('U2')
    expect(gradeShrubs6440(0, true)).toBe('FV')
  })
  it('płaty lokalnie typowe: >40 FV, 10–40 U1 (obie granice), <10 U2', () => {
    expect([50, 40, 10, 9].map(gradeTypical6440)).toEqual(['FV', 'U1', 'U1', 'U2'])
  })
  it('wojłok: <0,5 FV, 0,5–2 U1 (obie granice), >2 U2', () => {
    expect([0.2, 0.5, 2, 2.1].map(gradeLitter6440)).toEqual(['FV', 'U1', 'U1', 'U2'])
  })
})

describe('metodyka 6440 – podpowiedzi wskaźników', () => {
  it('gatunki charakterystyczne: liczy tylko charakterystyczne (synonimy raz), wyróżniające pokazuje; liczba wprost i ocena ekspercka', () => {
    expect(suggest('characteristic', { species: sp(['Cnidium dubium', 5], ['Cnidium venosum', 5]) })).toBe('U2') // synonimy – jeden gatunek nieliczny
    expect(suggest('characteristic', { species: sp(['Allium angulosum', 40], ['Carex praecox', 5], ['Viola stagnina', 1]) })).toBe('U1') // jeden licznie + wyróżniające
    expect(suggest('characteristic', { species: sp(['Cnidium dubium', 1], ['Juncus atratus', 1]) })).toBe('FV')
    expect(suggest('characteristic', { species: sp(['Cnidium dubium']) })).toBeNull()
    expect(suggest('characteristic', { species: sp(['Carex praecox', 5]) })).toBe('U2')
    expect(suggest('characteristic', { count: 3 })).toBe('FV')
    expect(suggest('characteristic', { count: 3, choice: 'U1' })).toBe('U1')
    expect(warn('characteristic', { count: 3, choice: 'U1' })).toMatch(/uzasadnij/)
    expect(warn('characteristic', { species: sp(['Alopecurus pratensis', 15]) })).toMatch(/Nie są gatunkami charakterystycznymi/)
    expect(explain('characteristic', { species: sp(['Cnidium dubium', 5], ['Gratiola officinalis', 1], ['Carex praecox', 1]) })).toMatch(/wyróżniające.*Carex praecox.*żaden nie rośnie licznie/)
    expect(suggest('characteristic', {})).toBeNull()
  })

  it('gatunki dominujące: charakterystyczny lub wyróżniający FV; bez nich gatunki innych siedlisk U2, same łąkowe U1', () => {
    expect(suggest('dominant', { species: sp(['Alopecurus pratensis', 30], ['Carex praecox', 10]) })).toBe('FV')
    expect(suggest('dominant', { species: sp(['Alopecurus pratensis', 30], ['Galium boreale', 20], ['Deschampsia caespitosa', 10]) })).toBe('U1')
    expect(suggest('dominant', { species: sp(['Alopecurus pratensis', 30], ['Phalaris arundinacea', 30]) })).toBe('U2')
    expect(suggest('dominant', { species: sp(['Galium boreale', 20], ['Solidago gigantea', 20]) })).toBe('U2')
    expect(suggest('dominant', { species: sp(['Galium boreale', 20]), choice: 'U2' })).toBe('U2')
    expect(warn('dominant', { species: sp(['Galium boreale', 20]), choice: 'U2' })).toMatch(/wychodzi U1/)
    expect(suggest('dominant', {})).toBeNull()
  })

  it('cenne składniki flory: liczba gatunków i łączne pokrycie; „nie stwierdzono” U2', () => {
    expect(suggest('valuable', { none: 'yes' })).toBe('U2')
    expect(suggest('valuable', { species: sp(['Cnidium dubium', 5], ['Gratiola officinalis', 1], ['Lotus tenuis', 1]) })).toBe('FV')
    expect(suggest('valuable', { species: sp(['Allium angulosum', 30]) })).toBe('FV')
    expect(suggest('valuable', { species: sp(['Allium angulosum', 10], ['Cnidium venosum', 2], ['Cnidium dubium', 2]) })).toBe('U1') // synonimy raz
    expect(suggest('valuable', { species: sp(['Allium angulosum']) })).toBeNull()
    expect(warn('valuable', { species: sp(['Solidago gigantea', 5]) })).toMatch(/nie cenne/)
    expect(warn('valuable', { species: sp(['Cnidium dubium', 5]), none: 'yes' })).toMatch(/Nie stwierdzono/)
  })

  it('obce: brak FV, do 5% U1, >5% U2; łączne pokrycie ma pierwszeństwo; bez pokrycia – brak; archeofity ostrzegają', () => {
    expect(suggest('aliens', { none: 'yes' })).toBe('FV')
    expect(suggest('aliens', { species: sp(['Rumex confertus', 0.5]) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Solidago gigantea', 4], ['Bidens frondosa', 2]) })).toBe('U2')
    expect(suggest('aliens', { total: 6 })).toBe('U2')
    expect(suggest('aliens', { species: sp(['Rumex confertus']) })).toBeNull()
    expect(suggest('aliens', { species: sp(['Rumex confertus']), total: 1 })).toBe('U1')
    expect(suggest('aliens', {})).toBeNull()
    expect(warn('aliens', { species: sp(['Setaria pumila', 0.5]) })).toMatch(/archeofity/)
    expect(warn('aliens', { species: sp(['Phalaris arundinacea', 5]) })).toMatch(/To nie gatunki obce.*rodzime ekspansywne/)
  })

  it('ekspansywne: suma bez obcych, charakterystycznych i krzewów; >30% z przewagą traw łąkowych → U1', () => {
    expect(suggest('expansive', { none: 'yes' })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Alopecurus pratensis', 15], ['Rumex confertus', 20], ['Achillea salicifolia', 1]) })).toBe('U1')
    expect(suggest('expansive', { species: sp(['Phalaris arundinacea', 25], ['Calamagrostis epigejos', 10]) })).toBe('U2')
    expect(suggest('expansive', { species: sp(['Alopecurus pratensis', 30], ['Phalaris arundinacea', 10]) })).toBe('U1')
    expect(explain('expansive', { species: sp(['Alopecurus pratensis', 30], ['Phalaris arundinacea', 10]) })).toMatch(/trawy łąkowe/)
    expect(suggest('expansive', { species: sp(['Rumex confertus', 40]) })).toBe('FV')
    expect(suggest('expansive', { species: sp(['Phalaris arundinacea']) })).toBeNull()
    expect(suggest('expansive', { species: sp(['Phalaris arundinacea', 5]), total: 35 })).toBe('U2')
    expect(suggest('expansive', { species: sp(['Phalaris arundinacea', 40]), choice: 'U1' })).toBe('U1')
    expect(warn('expansive', { species: sp(['Cnidium dubium', 5]) })).toMatch(/charakterystyczne/)
  })

  it('krzewy: suma albo łączne pokrycie; warstwa b podnosi do U1; ostrzega przy roślinach zielnych', () => {
    expect(suggest('shrubs', { none: 'yes' })).toBe('FV')
    expect(suggest('shrubs', { species: sp(['Salix cinerea', 0.5]) })).toBe('FV')
    expect(suggest('shrubs', { species: sp(['Salix cinerea', 0.5]), layer: 'b' })).toBe('U1')
    expect(suggest('shrubs', { species: sp(['Salix cinerea', 1], ['Prunus spinosa', 1]) })).toBe('U2')
    expect(suggest('shrubs', { species: sp(['Salix cinerea'], ['Prunus spinosa']), total: 1 })).toBe('U1')
    expect(suggest('shrubs', { species: sp(['Salix cinerea']) })).toBeNull()
    expect(warn('shrubs', { species: sp(['Filipendula ulmaria', 5]) })).toMatch(/To nie drzewa/)
  })

  it('procent powierzchni, płaty typowe, wojłok, fragmentacja i powierzchnia', () => {
    expect(suggest('share', { share: 30 })).toBe('U1')
    expect(warn('share', { share: 130 })).toMatch(/100%/)
    expect(suggest('typical', { share: 50 })).toBe('FV')
    expect(suggest('litter', { min: 0, max: 2, mean: 0.2 })).toBe('FV')
    expect(warn('litter', { min: 1, max: 2, mean: 0.2 })).toMatch(/poza zakresem/)
    expect(ind('litter').describe!({ min: 0, max: 2, mean: 0.2 }, ctx())).toBe('0–2 cm; średnio 0,2 cm')
    expect(suggest('spatial', { choice: 'medium' })).toBe('U1')
    expect(suggest('spatial', { choice: 'strong' })).toBe('U2')
    expect(suggest('area', { choice: 'decrease' })).toBe('U2')
    expect(suggest('area', { choice: 'unknown' })).toBe('XX')
  })

  it('katalog: krzewy w B, reszta w C, bez duplikatów, synonimy jednym kluczem, tab. 1 kompletna', () => {
    const latin = SPECIES_6440.map((s) => s.latin.toLowerCase())
    expect(new Set(latin).size).toBe(latin.length)
    expect(defaultLayer6440(findSpecies6440('Salix cinerea')!)).toBe('B')
    expect(defaultLayer6440(findSpecies6440('Cnidium dubium')!)).toBe('C')
    expect(speciesKey6440('Cnidium venosum')).toBe(speciesKey6440('Cnidium dubium'))
    expect(speciesKey6440('Viola persicifolia')).toBe(speciesKey6440('Viola stagnina'))
    // tab. 1: 9 gatunków charakterystycznych i 5 wyróżniających (bez synonimów)
    expect(new Set(SPECIES_6440.filter((s) => isCharacteristic6440(s.latin)).map((s) => speciesKey6440(s.latin))).size).toBe(9)
    expect(new Set(SPECIES_6440.filter((s) => isDistinguishing6440(s.latin)).map((s) => speciesKey6440(s.latin))).size).toBe(5)
    expect(m.speciesInfo!('Succisella inflexa')).toMatch(/Brzega i Wojterskiej/)
    expect(m.speciesInfo!('Phalaris arundinacea')).toMatch(/szuwarowy/)
    expect(m.speciesInfo!('Setaria viridis')).toMatch(/archeofit/)
  })
})

describe('metodyka 6440 – ocena struktury i ogólna (reguła ogólna silnika)', () => {
  const all = (g: Grade): CardValues => {
    const v = emptyCardValues(m)
    for (const i of m.indicators) v.indicators[i.id] = { inputs: {}, value: 'x', grade: g }
    v.prospects = { value: 'x', grade: g }
    return v
  }
  const withGrade = (base: CardValues, id: string, g: Grade): CardValues => ({ ...base, indicators: { ...base.indicators, [id]: { ...base.indicators[id], grade: g } } })

  it('wszystko FV → FV; niekardynalny U1 → FV; niekardynalny U2 → U1', () => {
    expect(assessCard(m, all('FV'))).toMatchObject({ structure: 'FV', overall: 'FV' })
    expect(assessCard(m, withGrade(all('FV'), 'share', 'U1')).structure).toBe('FV')
    expect(assessCard(m, withGrade(all('FV'), 'litter', 'U2'))).toMatchObject({ structure: 'U1', overall: 'U1' })
  })

  it('kardynalny U1 → U1; kardynalny U2 → U2', () => {
    for (const id of ['characteristic', 'aliens', 'expansive', 'shrubs']) {
      expect(assessCard(m, withGrade(all('FV'), id, 'U1')).structure, id).toBe('U1')
      expect(assessCard(m, withGrade(all('FV'), id, 'U2')).structure, id).toBe('U2')
    }
  })
})

describe('przykład Brańszczyk 2 (karta z przewodnika, 2010)', () => {
  const c = ctx({ site: branszczyk.site, indicators: branszczyk.indicators })

  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(branszczyk)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie', () => {
    const grades = Object.fromEntries(Object.entries(branszczyk.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({
      area: 'FV',
      share: 'U1',
      spatial: 'FV',
      characteristic: 'FV',
      dominant: 'FV',
      valuable: 'FV',
      aliens: 'U1',
      expansive: 'U1',
      shrubs: 'U1',
      typical: 'FV',
      litter: 'FV',
    })
  })

  it('parametry: powierzchnia i perspektywy FV jak w karcie; struktura i ocena ogólna U1 (karta: FV – rozjazd z regułą ogólną)', () => {
    expect(assessCard(m, branszczyk)).toMatchObject({ area: 'FV', structure: 'U1', prospects: 'FV', overall: 'U1', missing: [] })
  })

  it('podpowiedzi formularza zgodne z ekspertem przy każdym wskaźniku', () => {
    for (const i of m.indicators) expect(i.suggest!(branszczyk.indicators[i.id].inputs, c), i.id).toBe(branszczyk.indicators[i.id].grade)
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    for (const i of m.indicators) expect(i.describe!(branszczyk.indicators[i.id].inputs, c), i.id).toBe(branszczyk.indicators[i.id].value)
  })

  it('bez ostrzeżeń przy wskaźnikach, stanowisku i zdjęciach', () => {
    for (const i of m.indicators) expect(i.warn?.(branszczyk.indicators[i.id].inputs, c) ?? null, i.id).toBeNull()
    expect(m.siteFields.filter((f) => f.warn?.(branszczyk.site[f.name])).map((f) => f.name)).toEqual([])
    for (const r of branszczyk.releves) for (const f of m.releves.fields) expect(f.warn?.(r[f.name]) ?? null, f.name).toBeNull()
  })

  it('zdjęcia jak w karcie (36, 26 i 25 gatunków), wszystko w C, udział FV 100%, eksperci zanonimizowani', () => {
    expect(examples6440).toHaveLength(1)
    expect(branszczyk.releves.map((r) => (r.species as unknown[]).length)).toEqual([36, 26, 25])
    expect(branszczyk.releves.map((r) => [r.altitude, r.area, r.slope, r.exposure, r.coverB, r.coverC, r.coverD, r.heightC, r.heightD])).toEqual([
      [89, 25, 0, '-', 0, 100, 2, 40, 5],
      [89, 25, 5, 'N', 0, 100, 2, 60, 5],
      [89, 25, 5, 'S', 0, 100, 0, 30, undefined],
    ])
    const rows = branszczyk.releves.flatMap((r) => r.species as { name: string; layer: string }[])
    for (const r of rows) expect(findSpecies6440(r.name), r.name).toBeTruthy()
    expect(rows.every((r) => r.layer === 'C')).toBe(true)
    // karta: 4 gatunki charakterystyczne i 3 wyróżniające
    const names = (branszczyk.indicators.characteristic.inputs.species as { name: string }[]).map((s) => s.name)
    expect(names.filter(isCharacteristic6440)).toHaveLength(4)
    expect(names.filter(isDistinguishing6440)).toHaveLength(3)
    const o = branszczyk.other
    expect(Number(o.shareFV) + Number(o.shareU1) + Number(o.shareU2)).toBe(100)
    expect(branszczyk.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(branszczyk)).not.toMatch(/Załuski|Jankowski|Ejankowski/)
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, udział FV/U1/U2 i dane stanowiska', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, branszczyk))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['6440 Łąki selernicowe', 'Zachowanie płatów lokalnie typowych', 'Udział powierzchni siedliska w stanie FV', 'Brańszczyk 2', 'Violo-Cnidietum dubii'])
      expect(text, t).toContain(t)
  })
})
