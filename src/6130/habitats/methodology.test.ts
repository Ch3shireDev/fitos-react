import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { examples6130, miedzianka } from './examples'
import {
  gradeAliens6130,
  gradeAreaLoss6130,
  gradeCharacteristic6130,
  gradeExpansive6130,
  gradeNitrophilous6130,
  gradeShrubs6130,
  indicator6130 as ind,
  methodology6130 as m,
} from './methodology'
import { SPECIES_6130, defaultLayer6130, findSpecies6130, isCharacteristic6130, speciesKey6130 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const at = (region: string) => ctx({ site: { region } })
const suggest = (id: string, inputs: InputValues, c = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const warn = (id: string, inputs: InputValues, c = ctx()) => ind(id).warn!(inputs, c)
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => (cover === undefined ? { name } : { name, cover }))

describe('metodyka 6130 – struktura', () => {
  it('kod 6130 (nie priorytetowe), 3 zdjęcia po 25 m², warstwy A–D, region wymagany', () => {
    expect(habitatCode(m)).toBe('6130')
    expect(m.name).toBe('Murawy galmanowe (Violetalia calaminariae)')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(m.releves.fields.map((f) => f.name)).toEqual(expect.arrayContaining(['coverA', 'coverB', 'coverC', 'coverD', 'heightC', 'heightD']))
    expect(m.siteFields.find((f) => f.name === 'region')?.required).toBe(true)
    expect(m.siteFields.find((f) => f.name === 'transect')?.required).toBeFalsy()
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności karty przykładowej: powierzchnia + 8 struktury', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Charakterystyczna kombinacja florystyczna',
      'Fizjonomia zbiorowiska roślinnego',
      'Obce gatunki inwazyjne',
      'Gatunki synantropijne i nitrofilne',
      'Gatunki ekspansywne roślin zielnych',
      'Występowanie krzewów i podrostu drzew',
      'Ślady wypasu',
      'Niszczenie i zaśmiecanie hałd',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('kardynalne (lista pod tab. 2): kombinacja, niszczenie, obce, nitrofilne, krzewy', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id).sort()).toEqual(
      ['aliens', 'characteristic', 'destruction', 'nitrophilous', 'shrubs'].sort(),
    )
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

  it('termin: ostrzeżenie poza majem–wrześniem', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2013-07-07')).toBeNull()
    expect(date.warn!('2024-05-18')).toBeNull()
    expect(date.warn!('2024-09-30')).toBeNull()
    expect(date.warn!('2024-10-02')).toMatch(/maj–wrzesień/)
    expect(date.warn!('2024-04-20')).toMatch(/maj–wrzesień/)
  })

  it('zdjęcie mniejsze niż 10 m² – ostrzeżenie', () => {
    const area = m.releves.fields.find((f) => f.name === 'area')!
    expect(area.warn!(10)).toBeNull()
    expect(area.warn!(25)).toBeNull()
    expect(area.warn!(4)).toMatch(/10 m²/)
  })

  it('kody oddziaływań bez duplikatów, z sukcesją, brakiem wypasu, górnictwem, zalesianiem, obcymi i zapadliskami', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    expect(codes).toEqual(expect.arrayContaining(['A04.03', 'B01', 'C01.07', 'E03', 'G01.03', 'I01', 'K02', 'L05']))
  })

  it('inne informacje: propozycje po działaniach, udział FV/U1/U2 przed uwagami', () => {
    const names = allOtherFields(m).map((f) => f.name)
    expect(names.indexOf('proposals')).toBe(names.indexOf('conservation') + 1)
    expect(names.slice(names.indexOf('shareFV'), names.indexOf('notes') + 1)).toEqual(['shareFV', 'shareU1', 'shareU2', 'notes'])
  })
})

describe('metodyka 6130 – progi tab. 2', () => {
  it('kombinacja: 0 gatunków albo ≤2% pokrycia U2; ≥6 FV; reszta U1', () => {
    expect(gradeCharacteristic6130(0)).toBe('U2')
    expect(gradeCharacteristic6130(4, 2)).toBe('U2')
    expect(gradeCharacteristic6130(8, 1.5)).toBe('U2')
    expect(gradeCharacteristic6130(5, 20)).toBe('U1')
    expect(gradeCharacteristic6130(2)).toBe('U1')
    expect(gradeCharacteristic6130(6, 30)).toBe('FV')
    expect(gradeCharacteristic6130(10)).toBe('FV')
  })

  it('obce: 0 FV, do 2% U1 (2 też), >2% U2', () => {
    expect([0, 0.5, 2, 2.1, 5].map(gradeAliens6130)).toEqual(['FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('nitrofilne: do 1% FV, >1–5% U1 (5 też), >5% U2', () => {
    expect([0, 1, 1.5, 5, 5.5].map(gradeNitrophilous6130)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('ekspansywne: <10 FV, 10–30 U1 (obie granice), >30 U2', () => {
    expect([0, 9.9, 10, 30, 30.5].map(gradeExpansive6130)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('krzewy i podrost: do 10 FV (10 też), do 30 U1, >30 U2', () => {
    expect([0, 10, 10.5, 30, 31].map(gradeShrubs6130)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('spadek powierzchni: 0 FV, do 10% U1, więcej U2', () => {
    expect([0, 5, 10, 15].map(gradeAreaLoss6130)).toEqual(['FV', 'U1', 'U1', 'U2'])
  })
})

describe('metodyka 6130 – podpowiedzi z pól', () => {
  it('powierzchnia: wybór > spadek liczbą; XX przy braku danych', () => {
    expect(suggest('area', { choice: 'stable' })).toBe('FV')
    expect(suggest('area', { choice: 'unknown' })).toBe('XX')
    expect(suggest('area', { choice: '', loss: 8 })).toBe('U1')
    expect(suggest('area', { choice: 'stable', loss: 30 })).toBe('FV')
    expect(suggest('area', { choice: '' })).toBeNull()
  })

  it('kombinacja zależy od regionu: Rudawy liczą mietlicę i goździk kropkowany, Olkusz nie', () => {
    const list = sp(['Agrostis capillaris', 15], ['Dianthus deltoides', 2], ['Festuca ovina', 25], ['Silene vulgaris', 7], ['Thymus pulegioides', 5], ['Pimpinella saxifraga', 0.5])
    expect(suggest('characteristic', { species: list }, at('rudawy'))).toBe('FV')
    expect(suggest('characteristic', { species: list }, at('olkusz'))).toBe('U1')
    expect(warn('characteristic', { species: list }, at('olkusz'))).toMatch(/Nie liczą się jako typowe w tym regionie: Agrostis capillaris, Dianthus deltoides/)
    // bez regionu – liczą się wszystkie listy, ale formularz prosi o wybór
    expect(suggest('characteristic', { species: list })).toBe('FV')
    expect(warn('characteristic', { species: list })).toMatch(/Wybierz Region/)
  })

  it('kombinacja: wybór eksperta > liczba wprost > lista; kadłubowa z pokrycia; synonimy raz', () => {
    expect(suggest('characteristic', { choice: 'u1', count: 12 })).toBe('U1')
    expect(suggest('characteristic', { count: 7 })).toBe('FV')
    expect(suggest('characteristic', { species: sp(['Silene vulgaris', 0.5], ['Festuca ovina', 0.5], ['Thymus pulegioides', 0.5], ['Galium album', 0.5]) }, at('zlotyStok'))).toBe('U2')
    expect(suggest('characteristic', { species: sp(['Agrostis capillaris', 10], ['Agrostis vulgaris', 5]) }, at('rudawy'))).toBe('U1')
    expect(ind('characteristic').explain!({ species: sp(['Agrostis capillaris', 10], ['Agrostis vulgaris', 5]) }, at('rudawy'))).toMatch(/Gatunki typowe z katalogu: 1 .*łączne pokrycie 15%/)
    expect(warn('characteristic', { choice: 'fv', species: sp(['Festuca ovina', 1]) }, at('rudawy'))).toMatch(/Wybrano FV, a z listy wychodzi U2/)
  })

  it('obce: łączne pokrycie > suma z listy; bez pokrycia = sporadycznie (U1); „nie stwierdzono” = FV', () => {
    expect(suggest('aliens', { species: sp(['Reynoutria japonica'], ['Reynoutria sachalinensis']), total: 5 })).toBe('U2')
    expect(suggest('aliens', { species: sp(['Solidago canadensis', 1], ['Padus serotina', 0.5]) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Solidago canadensis', 3]) })).toBe('U2')
    expect(suggest('aliens', { species: sp(['Robinia pseudacacia']) })).toBe('U1')
    expect(suggest('aliens', { none: 'yes', species: [] })).toBe('FV')
    expect(suggest('aliens', { species: [] })).toBeNull()
    expect(warn('aliens', { species: sp(['Betula pendula', 1]) })).toMatch(/gatunki rodzime: Betula pendula/)
    expect(warn('aliens', { none: 'yes', species: sp(['Quercus rubra', 1]) })).toMatch(/Nie stwierdzono/)
  })

  it('nitrofilne: suma z listy; bez pokrycia = pojedyncze okazy (FV)', () => {
    expect(suggest('nitrophilous', { species: sp(['Rubus idaeus', 2], ['Aegopodium podagraria', 0.5]) })).toBe('U1')
    expect(suggest('nitrophilous', { species: sp(['Urtica dioica', 1]) })).toBe('FV')
    expect(suggest('nitrophilous', { species: sp(['Urtica dioica', 4], ['Rubus idaeus', 2]) })).toBe('U2')
    expect(suggest('nitrophilous', { species: sp(['Chelidonium majus']) })).toBe('FV')
    expect(suggest('nitrophilous', { total: 6 })).toBe('U2')
    expect(warn('nitrophilous', { species: sp(['Solidago gigantea', 1]) })).toMatch(/Obce gatunki inwazyjne/)
  })

  it('ekspansywne: gatunki typowej kombinacji pomijane (wg regionu), suma reszty; wrzos typowy tylko na hałdach arsenowych', () => {
    const typical = sp(['Agrostis capillaris', 15], ['Festuca ovina', 25])
    expect(suggest('expansive', { species: typical }, at('rudawy'))).toBe('FV')
    expect(suggest('expansive', { species: typical }, at('olkusz'))).toBe('U1') // mietlica 15% spoza listy olkuskiej
    expect(suggest('expansive', { species: sp(['Calluna vulgaris', 40]) }, at('zlotyStok'))).toBe('FV')
    expect(suggest('expansive', { species: sp(['Calluna vulgaris', 40]) }, at('olkusz'))).toBe('U2')
    expect(suggest('expansive', { species: sp(['Calamagrostis epigejos', 10], ['Molinia caerulea', 5]) }, at('olkusz'))).toBe('U1')
    expect(suggest('expansive', { species: sp(['Calamagrostis epigejos']) }, at('olkusz'))).toBeNull()
    expect(suggest('expansive', { species: sp(['Calamagrostis epigejos']), choice: 'U1' }, at('olkusz'))).toBe('U1')
    expect(suggest('expansive', { none: 'yes', species: [] })).toBe('FV')
    expect(ind('expansive').explain!({ species: typical }, at('rudawy'))).toMatch(/Pominięte gatunki typowej kombinacji: Agrostis capillaris, Festuca ovina; spoza listy: brak/)
    expect(warn('expansive', { species: sp(['Betula pendula', 30]) })).toMatch(/Występowanie krzewów/)
  })

  it('krzewy i podrost: łączne pokrycie > suma; „nie stwierdzono” = FV; ostrzeżenie przy roślinach zielnych', () => {
    expect(suggest('shrubs', { species: sp(['Acer pseudoplatanus', 5], ['Betula pendula', 20], ['Quercus petraea', 0.5], ['Populus tremula', 0.5], ['Sorbus aucuparia', 0.5]) })).toBe('U1')
    expect(suggest('shrubs', { species: sp(['Pinus sylvestris', 5]) })).toBe('FV')
    expect(suggest('shrubs', { total: 85 })).toBe('U2')
    expect(suggest('shrubs', { none: 'yes', species: [] })).toBe('FV')
    expect(suggest('shrubs', { species: sp(['Betula pendula']) })).toBeNull()
    expect(warn('shrubs', { species: sp(['Festuca ovina', 5]) })).toMatch(/To nie drzewa ani krzewy: Festuca ovina/)
  })

  it('fizjonomia, wypas, niszczenie: z wyboru; fizjonomia ostrzega przy wysokiej murawie', () => {
    expect(suggest('physiognomy', { choice: 'u1' })).toBe('U1')
    expect(warn('physiognomy', { choice: 'fv', height: 60 })).toMatch(/60 cm/)
    expect(warn('physiognomy', { choice: 'fv', height: 25 })).toBeNull()
    expect(suggest('grazing', { choice: 'stable' })).toBe('FV')
    expect(suggest('grazing', { choice: 'none' })).toBe('U2')
    expect(suggest('destruction', { choice: 'minor' })).toBe('U1')
    expect(suggest('destruction', { choice: 'physical' })).toBe('U2')
  })

  it('katalog: drzewa i krzewy w B, porosty i mchy w D, runo w C, bez duplikatów, synonimy jednym kluczem', () => {
    const names = SPECIES_6130.map((s) => s.latin.toLowerCase())
    expect(new Set(names).size).toBe(names.length)
    expect(defaultLayer6130(findSpecies6130('Betula pendula')!)).toBe('B')
    expect(defaultLayer6130(findSpecies6130('Cladonia glauca')!)).toBe('D')
    expect(defaultLayer6130(findSpecies6130('Festuca ovina')!)).toBe('C')
    expect(speciesKey6130('Padus serotina')).toBe(speciesKey6130('Prunus serotina'))
    expect(speciesKey6130('Agrostis vulgaris')).toBe(speciesKey6130('Agrostis capillaris'))
    expect(speciesKey6130('Armeria maritima subsp. halleri')).toBe(speciesKey6130('Armeria maritima'))
    expect(isCharacteristic6130('Biscutella laevigata', 'olkusz')).toBe(true)
    expect(isCharacteristic6130('Biscutella laevigata', 'rudawy')).toBe(false)
    expect(isCharacteristic6130('Biscutella laevigata', 'other')).toBe(true)
    expect(isCharacteristic6130('Silene vulgaris', 'zlotyStok')).toBe(true)
  })
})

describe('ocena struktury (reguła ogólna silnika)', () => {
  const all = (g: Grade): CardValues => ({
    ...miedzianka,
    indicators: Object.fromEntries(Object.entries(miedzianka.indicators).map(([k, v]) => [k, { ...v, grade: g }])),
    prospects: { value: '', grade: 'FV' },
  })
  const withGrade = (base: CardValues, id: string, g: Grade): CardValues => ({ ...base, indicators: { ...base.indicators, [id]: { ...base.indicators[id], grade: g } } })

  it('wszystko FV → FV; niekardynalny U2 (wypas) → struktura U1', () => {
    expect(assessCard(m, all('FV'))).toMatchObject({ structure: 'FV', overall: 'FV' })
    expect(assessCard(m, withGrade(all('FV'), 'grazing', 'U2'))).toMatchObject({ structure: 'U1', overall: 'U1' })
  })

  it('kardynalny U1 (nitrofilne) → U1; kardynalny U2 (obce) → U2', () => {
    expect(assessCard(m, withGrade(all('FV'), 'nitrophilous', 'U1')).structure).toBe('U1')
    expect(assessCard(m, withGrade(all('FV'), 'aliens', 'U2')).structure).toBe('U2')
  })

  it('ocena ogólna wg reguły ogólnej (jak w sprawozdaniach), nie wg wiersza tab. 2 „dwa FV i jeden U1 → FV”', () => {
    const v = withGrade(all('FV'), 'nitrophilous', 'U1')
    expect(assessCard(m, v)).toMatchObject({ area: 'FV', structure: 'U1', prospects: 'FV', overall: 'U1' })
  })
})

describe('przykład Miedzianka (karta z przewodnika, 2012–2013)', () => {
  const c = ctx({ site: miedzianka.site, indicators: miedzianka.indicators })

  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(miedzianka)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w karcie', () => {
    const grades = Object.fromEntries(Object.entries(miedzianka.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({
      area: 'U2',
      characteristic: 'FV',
      physiognomy: 'U2',
      aliens: 'U2',
      nitrophilous: 'U1',
      expansive: 'FV',
      shrubs: 'U1',
      grazing: 'U2',
      destruction: 'U1',
    })
  })

  it('parametry i ocena ogólna jak w karcie: powierzchnia U2, struktura U2, perspektywy U2, ogólna U2', () => {
    expect(assessCard(m, miedzianka)).toMatchObject({ area: 'U2', structure: 'U2', prospects: 'U2', overall: 'U2', missing: [] })
  })

  it('podpowiedzi zgodne z ekspertem – poza niszczeniem („pobór kruszywa”: karta U1, tab. 2 U2)', () => {
    for (const i of m.indicators) {
      const s = i.suggest!(miedzianka.indicators[i.id].inputs, c)
      if (i.id === 'destruction') expect(s).toBe('U2')
      else expect(s, i.id).toBe(miedzianka.indicators[i.id].grade)
    }
    // z oceną U2 wg tab. 2 struktura i ogólna i tak U2
    const strict = { ...miedzianka, indicators: { ...miedzianka.indicators, destruction: { ...miedzianka.indicators.destruction, grade: 'U2' as const } } }
    expect(assessCard(m, strict)).toMatchObject({ structure: 'U2', overall: 'U2' })
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    for (const i of m.indicators) expect(i.describe!(miedzianka.indicators[i.id].inputs, c), i.id).toBe(miedzianka.indicators[i.id].value)
  })

  it('bez ostrzeżeń przy wskaźnikach, stanowisku i zdjęciach (lipiec, zdjęcia 10 i 25 m²)', () => {
    for (const i of m.indicators) expect(i.warn?.(miedzianka.indicators[i.id].inputs, c) ?? null, i.id).toBeNull()
    for (const f of m.siteFields) expect(f.warn?.(miedzianka.site[f.name]) ?? null, f.name).toBeNull()
    for (const r of miedzianka.releves) for (const f of m.releves.fields) expect(f.warn?.(r[f.name]) ?? null, f.name).toBeNull()
  })

  it('zdjęcia jak w karcie, udział FV/U1/U2 = 100%, eksperci zanonimizowani, intensywność przemapowana', () => {
    expect(examples6130).toHaveLength(1)
    expect(miedzianka.releves.map((r) => (r.species as unknown[]).length)).toEqual([15, 23, 18])
    expect(miedzianka.releves.map((r) => [r.area, r.slope, r.exposure, r.coverC, r.coverD, r.heightC, r.heightD])).toEqual([
      [10, 0, 'płasko', 90, undefined, 20, undefined],
      [25, 20, 'SW', 80, 10, 30, 1],
      [25, 25, 'W', 60, 5, 30, 1],
    ])
    const names = miedzianka.releves.flatMap((r) => (r.species as { name: string }[]).map((s) => s.name))
    for (const n of names) expect(findSpecies6130(n), n).toBeTruthy()
    const o = miedzianka.other
    expect(Number(o.shareFV) + Number(o.shareU1) + Number(o.shareU2)).toBe(100)
    expect(miedzianka.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(miedzianka)).not.toMatch(/Reczyńsk|Świerkosz/)
    expect(miedzianka.impacts.map((i) => `${i.code}${i.influence}${i.intensity}`)).toEqual(['A04.03-H', 'C01.07-M', 'I01-M', 'K02-H'])
    expect(miedzianka.threats.map((t) => t.code)).toEqual(['C01.07', 'K02'])
    for (const t of [...miedzianka.impacts, ...miedzianka.threats]) expect(m.impactCodes.find((x) => x.code === t.code)?.name, t.code).toBe(t.name)
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, udział FV/U1/U2 i dane stanowiska', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, miedzianka))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['6130 Murawy galmanowe (Violetalia calaminariae)', 'Niszczenie i zaśmiecanie hałd', 'Udział powierzchni siedliska w stanie FV', 'Miedzianka', 'PLH020011 Rudawy Janowickie'])
      expect(text, t).toContain(t)
  })
})
