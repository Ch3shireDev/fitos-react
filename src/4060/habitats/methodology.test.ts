import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { examples4060, kopa } from './examples'
import { gradeCharacteristic4060, gradeDominants4060, gradeMugo4060, indicator4060 as ind, methodology4060 as m } from './methodology'
import { defaultLayer4060, findSpecies4060, isDiagnostic4060, speciesKey4060 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, ctx())
const warn = (id: string, inputs: InputValues) => ind(id).warn!(inputs, ctx())
const cov = (...rows: [string, number?][]) => rows.map(([name, cover]) => ({ name, cover }))

describe('metodyka 4060 – struktura', () => {
  it('kod 4060 (nie priorytetowe), transekt niestandardowy, 3 zdjęcia po 10 m²', () => {
    expect(habitatCode(m)).toBe('4060')
    expect(m.name).toBe('Wysokogórskie borówczyska bażynowe (Empetro-Vaccinietum)')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('Niestandardowy na skutek rozproszenia płatów siedliska')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(10)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności tab. 2', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Gatunki charakterystyczne',
      'Gatunki dominujące, w tym ekspansja borówki czarnej Vaccinium myrtillus',
      'Ekspansja kosodrzewiny Pinus mugo',
      'Zniszczenia mechaniczne',
    ])
  })

  it('kardynalne (lista pod tab. 2): gatunki charakterystyczne, dominujące, zniszczenia mechaniczne', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['species', 'dominants', 'mechanical'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
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

  it('termin: ostrzeżenie poza końcem czerwca – połową sierpnia', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    for (const ok of ['2021-06-23', '2021-07-14', '2021-08-15']) expect(date.warn!(ok), ok).toBeNull()
    for (const bad of ['2011-08-24', '2021-06-10', '2021-09-02']) expect(date.warn!(bad), bad).toMatch(/poza optymalnym/)
  })

  it('kody oddziaływań bez duplikatów, z turystyką, wydeptywaniem, sukcesją i klimatem', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['D01.01', 'G01.02', 'G01.04', 'G05.01', 'H04', 'K02.01', 'K04.05', 'M01', 'X']) expect(codes).toContain(c)
  })

  it('inne informacje: udział powierzchni FV/U1/U2 przed uwagami', () => {
    expect(m.otherFields.map((f) => f.name)).toEqual(['otherValues', 'conservation', 'shareFV', 'shareU1', 'shareU2', 'notes', 'photos'])
  })
})

describe('metodyka 4060 – progi tab. 2', () => {
  it('gatunki charakterystyczne: >5 FV, 2–5 U1 (obie granice), <2 U2', () => {
    expect([60, 5.5, 5, 2, 1.9, 0].map(gradeCharacteristic4060)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('gatunki dominujące: <50 FV, 50–70 U1 (obie granice), >70 U2', () => {
    expect([0, 49.9, 50, 70, 70.1, 90].map(gradeDominants4060)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('ekspansja kosodrzewiny: ≤30 FV, 30–50 U1, >50 U2', () => {
    expect([0, 30, 30.5, 45, 50, 50.5].map(gradeMugo4060)).toEqual(['FV', 'FV', 'U1', 'U1', 'U1', 'U2'])
  })
})

describe('metodyka 4060 – podpowiedzi z pól', () => {
  it('gatunki charakterystyczne: suma wyznaczników z listy, łączne wprost ma pierwszeństwo', () => {
    expect(suggest('species', { species: cov(['Empetrum hermaphroditum', 5], ['Vaccinium gaultherioides', 0.5]) })).toBe('FV')
    expect(suggest('species', { species: cov(['Empetrum hermaphroditum', 3], ['Vaccinium myrtillus', 60]) })).toBe('U1')
    expect(suggest('species', { species: cov(['Empetrum nigrum', 25], ['Vaccinium uliginosum', 2]) })).toBe('FV')
    expect(suggest('species', { species: cov(['Empetrum hermaphroditum', 0.5]) })).toBe('U2')
    expect(suggest('species', { species: cov(['Empetrum hermaphroditum', 1]), total: 8 })).toBe('FV')
    expect(suggest('species', { species: cov(['Empetrum hermaphroditum']) })).toBeNull()
    expect(suggest('species', {})).toBeNull()
    expect(ind('species').explain!({ species: cov(['Empetrum hermaphroditum', 5], ['Vaccinium gaultherioides', 0.5]) }, ctx())).toBe('Pokrycie wyznaczników zespołu: 5,5%.')
  })

  it('gatunki charakterystyczne: ostrzega o gatunkach spoza wyznaczników i o braku bażyny/borówki halnej', () => {
    expect(warn('species', { species: cov(['Empetrum hermaphroditum', 5], ['Vaccinium myrtillus', 30]) })).toMatch(/Nie liczą się .*Vaccinium myrtillus.*Brak borówki halnej/)
    expect(warn('species', { species: cov(['Vaccinium gaultherioides', 5]) })).toMatch(/Brak bażyny/)
    expect(warn('species', { species: cov(['Empetrum nigrum', 25], ['Vaccinium uliginosum', 2]) })).toBeNull()
  })

  it('gatunki dominujące: największy dominant spoza wyznaczników, wprost, „brak dominanta”', () => {
    expect(suggest('dominants', { species: cov(['Calluna vulgaris', 30], ['Vaccinium myrtillus', 30]) })).toBe('FV')
    expect(suggest('dominants', { species: cov(['Vaccinium myrtillus', 60], ['Vaccinium vitis-idaea', 20]) })).toBe('U1')
    expect(suggest('dominants', { species: cov(['Empetrum hermaphroditum', 60], ['Vaccinium myrtillus', 20]) })).toBe('FV')
    expect(suggest('dominants', { species: cov(['Empetrum hermaphroditum', 80]) })).toBe('FV')
    expect(suggest('dominants', { species: cov(['Vaccinium myrtillus', 60]), value: 90 })).toBe('U2')
    expect(suggest('dominants', { none: 'yes' })).toBe('FV')
    expect(suggest('dominants', { species: cov(['Vaccinium myrtillus']) })).toBeNull()
    expect(ind('dominants').explain!({ species: cov(['Molinia caerulea', 55], ['Calluna vulgaris', 20]) }, ctx())).toBe('Największy dominant spoza wyznaczników: Molinia caerulea 55%.')
    expect(ind('dominants').describe!({ species: [], none: 'yes' }, ctx())).toBe('brak wyraźnego dominanta')
  })

  it('gatunki dominujące: ostrzeżenie, gdy obie borówki łącznie dają inną ocenę (Gówniak 01)', () => {
    expect(warn('dominants', { species: cov(['Vaccinium myrtillus', 60], ['Vaccinium vitis-idaea', 30]) })).toMatch(/łącznie 90% \(U2\)/)
    expect(warn('dominants', { species: cov(['Vaccinium myrtillus', 60], ['Vaccinium vitis-idaea', 30]), value: 90 })).toBeNull()
    expect(warn('dominants', { species: cov(['Calluna vulgaris', 30]), none: 'yes' })).toMatch(/„Brak wyraźnego dominanta”/)
  })

  it('kosodrzewina: z procentu, ostrzeżenie o niekrzewach, opis', () => {
    expect(suggest('mugo', { value: 45 })).toBe('U1')
    expect(suggest('mugo', { value: 5, species: cov(['Sorbus aucuparia var. glabrata', 5]) })).toBe('FV')
    expect(suggest('mugo', {})).toBeNull()
    expect(warn('mugo', { value: 5, species: cov(['Vaccinium myrtillus']) })).toMatch(/inne niż krzewy/)
    expect(ind('mugo').describe!({ value: 0.5, species: cov(['Pinus mugo']) }, ctx())).toBe('pokrycie <1%; Pinus mugo')
  })

  it('zniszczenia mechaniczne i powierzchnia: z wyboru', () => {
    expect(['none', 'traces', 'intense'].map((choice) => suggest('mechanical', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(['stable', 'smallDecrease', 'clearDecrease', 'unknown'].map((choice) => suggest('area', { choice }))).toEqual(['FV', 'U1', 'U2', 'XX'])
    expect(ind('area').describe!({ choice: 'stable', areaHa: 0.006 }, ctx())).toBe('0,006 ha; nie podlega zmianom lub zwiększa się')
  })

  it('katalog: wyznaczniki z synonimami, warstwy, grupy', () => {
    for (const n of ['Empetrum hermaphroditum', 'Empetrum nigrum subsp. hermaphroditum', 'Vaccinium gaultherioides', 'Vaccinium uliginosum subsp. microphyllum', 'Empetrum nigrum', 'Vaccinium uliginosum'])
      expect(isDiagnostic4060(n), n).toBe(true)
    for (const n of ['Vaccinium myrtillus', 'Calluna vulgaris', 'Homogyne alpina', 'Pinus mugo']) expect(isDiagnostic4060(n), n).toBe(false)
    expect(speciesKey4060('Empetrum nigrum subsp. hermaphroditum')).toBe(speciesKey4060('Empetrum hermaphroditum'))
    expect(defaultLayer4060(findSpecies4060('Cetraria islandica')!)).toBe('D')
    expect(defaultLayer4060(findSpecies4060('Pinus mugo')!)).toBe('B')
    expect(defaultLayer4060(findSpecies4060('Empetrum hermaphroditum')!)).toBe('C')
    expect(m.speciesInfo!('Vaccinium myrtillus')).toMatch(/dominacja obniża/)
    expect(m.speciesCatalog!.length).toBeGreaterThan(50)
  })
})

describe('ocena struktury (reguła ogólna silnika)', () => {
  const allFv = (): CardValues => structuredClone(kopa)

  it('niekardynalna kosodrzewina U2 → struktura U1; kardynalny U2 (dominujące) → U2', () => {
    const v = allFv()
    v.indicators.mugo.grade = 'U2'
    expect(assessCard(m, v)).toMatchObject({ structure: 'U1', overall: 'U1' })
    v.indicators.mugo.grade = 'FV'
    v.indicators.dominants.grade = 'U2'
    expect(assessCard(m, v)).toMatchObject({ structure: 'U2', overall: 'U2' })
  })

  it('kardynalny U1 (zniszczenia) → struktura U1', () => {
    const v = allFv()
    v.indicators.mechanical.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('U1')
  })
})

describe('przykład Kopa (karta z przewodnika, 2011)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(kopa)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny jak w karcie: wszystkie wskaźniki i parametry FV', () => {
    expect(assessCard(m, kopa)).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV', missing: [] })
    const grades = Object.fromEntries(Object.entries(kopa.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({ area: 'FV', species: 'FV', dominants: 'FV', mugo: 'FV', mechanical: 'FV' })
  })

  it('podpowiedzi zgodne z ekspertem i bez ostrzeżeń', () => {
    const c = ctx({ site: kopa.site, indicators: kopa.indicators })
    for (const i of m.indicators) {
      expect(i.suggest!(kopa.indicators[i.id].inputs, c), i.id).toBe(kopa.indicators[i.id].grade)
      expect(i.warn?.(kopa.indicators[i.id].inputs, c) ?? null, i.id).toBeNull()
    }
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    const c = ctx({ site: kopa.site, indicators: kopa.indicators })
    for (const i of m.indicators) expect(i.describe!(kopa.indicators[i.id].inputs, c), i.id).toBe(kopa.indicators[i.id].value)
  })

  it('zdjęcia jak w karcie, udział FV/U1/U2 = 100%, wykonawca zanonimizowany', () => {
    expect(examples4060).toHaveLength(1)
    expect(kopa.releves.map((r) => (r.species as unknown[]).length)).toEqual([11, 15, 8])
    expect(kopa.releves.map((r) => [r.area, r.slope, r.exposure, r.coverC, r.coverD])).toEqual([
      [20, 45, 'NE', 60, 2],
      [12, 40, 'E', 70, 5],
      [20, 45, 'E', 100, undefined],
    ])
    const o = kopa.other
    expect(Number(o.shareFV) + Number(o.shareU1) + Number(o.shareU2)).toBe(100)
    expect(kopa.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(kopa)).not.toMatch(/Świerkosz|Reczyńska/)
    expect(kopa.impacts).toEqual([])
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny i udział FV/U1/U2', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, kopa))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['4060 Wysokogórskie borówczyska bażynowe', 'Ekspansja kosodrzewiny Pinus mugo', 'Udział powierzchni siedliska w stanie FV', 'Kopa', 'Karkonoski Park Narodowy'])
      expect(text, t).toContain(t)
  })
})
