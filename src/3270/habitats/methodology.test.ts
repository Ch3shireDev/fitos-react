import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { examples3270, sandomierz } from './examples'
import {
  characteristicCount3270,
  dominance3270,
  gradeCharacteristic3270,
  gradeDistance3270,
  gradeExpansive3270,
  gradeInvasive3270,
  gradeWellPreserved3270,
  indicator3270 as ind,
  methodology3270 as m,
} from './methodology'
import { defaultLayer3270, findSpecies3270, isCharacteristic3270, isTypical3270, speciesKey3270, SPECIES_3270 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const high = ctx({ site: { waterLevel: 'high' } })
const suggest = (id: string, inputs: InputValues, c = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const warn = (id: string, inputs: InputValues) => ind(id).warn!(inputs, ctx())
const sp = (...names: string[]) => names.map((name) => ({ name }))
const spc = (...rows: [string, number | undefined][]) => rows.map(([name, cover]) => ({ name, cover }))

describe('metodyka 3270 – struktura', () => {
  it('kod 3270 bez gwiazdki, bez transektu, 3 zdjęcia po 2 m², warstwa C', () => {
    expect(habitatCode(m)).toBe('3270')
    expect(m.priority).toBeFalsy()
    expect(m.name).toMatch(/^Zalewane muliste brzegi rzek/)
    expect(String(m.siteFields.find((f) => f.name === 'transect')!.defaultValue)).toMatch(/nie jest prowadzony metodą transektu/)
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(2)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności tab. 2', () => {
    expect(m.indicators.map((i) => i.id)).toEqual(['area', 'spatial', 'characteristic', 'dominant', 'invasive', 'expansive', 'wellPreserved'])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
  })

  it('kardynalne (lista pod tab. 2): charakterystyczne, dominujące, udział dobrze zachowanych płatów; nic pominięte', () => {
    const structure = m.indicators.filter((i) => i.parameter === 'structure')
    expect(structure).toHaveLength(6)
    expect(structure.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['characteristic', 'dominant', 'wellPreserved'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...allOtherFields(m), ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('pola wskaźników nie są wymagane – przy wysokiej wodzie karta z samymi XX przechodzi walidację', () => {
    for (const f of m.indicators.flatMap((i) => i.inputs)) expect(f.required, f.name).toBeFalsy()
    const v = emptyCardValues(m)
    v.site = { ...sandomierz.site, waterLevel: 'high', areaHa: undefined }
    for (const id of Object.keys(v.indicators)) v.indicators[id] = { inputs: v.indicators[id].inputs, value: 'Nie oceniano – wysoki stan wody', grade: 'XX' }
    v.prospects = { value: 'Stanowisko w obszarze Natura 2000.', grade: 'FV' }
    const r = buildCardSchema(m).safeParse(v)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
    expect(assessCard(m, v)).toMatchObject({ area: 'XX', structure: 'XX', prospects: 'FV', overall: 'XX' })
  })

  it('termin: wrzesień–październik, poza oknem ostrzeżenie', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2013-09-20')).toBeNull()
    expect(date.warn!('2023-10-29')).toBeNull()
    expect(date.warn!('2024-08-25')).toMatch(/poza optymalnym/)
    expect(date.warn!('2024-11-05')).toMatch(/poza optymalnym/)
  })

  it('kody oddziaływań bez duplikatów: wędkarstwo, regulacja koryt, piasek, mosty, promy', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['F02.03', 'J02.03', 'J02.03.02', 'C01.01', 'D01.05', 'D03.02.02', 'X']) expect(codes).toContain(c)
  })

  it('inne informacje: udział powierzchni FV/U1/U2 przed uwagami', () => {
    expect(m.otherFields.map((f) => f.name)).toEqual(['otherValues', 'conservation', 'shareFV', 'shareU1', 'shareU2', 'notes', 'photos'])
  })

  it('stanowisko: typ, Natura 2000 osobno, zarządca, uregulowanie koryta, stan wody', () => {
    const names = m.siteFields.map((f) => f.name)
    for (const n of ['siteType', 'natura2000', 'manager', 'riverRegulation', 'waterLevel', 'protectedAreas']) expect(names).toContain(n)
    expect(m.siteFields.find((f) => f.name === 'protectedAreas')!.label).toMatch(/z pominięciem obszaru Natura 2000/)
  })
})

describe('metodyka 3270 – progi tab. 2', () => {
  it('gatunki charakterystyczne: >4 FV, 3–4 U1, <3 U2', () => {
    expect([16, 5, 4, 3, 2, 0].map(gradeCharacteristic3270)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('obce inwazyjne: ≤25 FV, 25–50 U1 (50 też), >50 U2', () => {
    expect([0, 25, 25.5, 50, 50.5, 100].map(gradeInvasive3270)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('ekspansywne: ≤10 FV, 10–25 U1 (25 też), >25 U2', () => {
    expect([0, 10, 10.5, 25, 25.5].map(gradeExpansive3270)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('dobrze zachowane płaty: ≥80 FV, 50–79 U1, <50 U2', () => {
    expect([100, 80, 79.9, 50, 49.9].map(gradeWellPreserved3270)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('odległość między płatami: ≤5 m FV, 5–10 m U1, ≥10 m U2', () => {
    expect([0, 5, 5.5, 9.9, 10, 30].map(gradeDistance3270)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })
})

describe('metodyka 3270 – podpowiedzi z pól', () => {
  it('powierzchnia: z wyboru; spadek naturalny to FV; brak danych XX', () => {
    expect(suggest('area', { trend: 'stable' })).toBe('FV')
    expect(suggest('area', { trend: 'natural' })).toBe('FV')
    expect(suggest('area', { trend: 'decrease' })).toBe('U1')
    expect(suggest('area', { trend: 'strongDecrease' })).toBe('U2')
    expect(suggest('area', { trend: 'unknown' })).toBe('XX')
    expect(suggest('area', { areaHa: 0.02 })).toBeNull()
    expect(ind('area').describe!({ areaHa: 0.02, trend: 'decrease' }, ctx())).toBe('0,02 ha, nieznaczne zmniejszenie wynikające z działania czynników antropogenicznych')
  })

  it('wysoki stan wody: XX dla powierzchni i wszystkich wskaźników, z wyjaśnieniem', () => {
    for (const i of m.indicators) {
      expect(suggest(i.id, sandomierz.indicators[i.id].inputs, high), i.id).toBe('XX')
      expect(i.explain!(sandomierz.indicators[i.id].inputs, high), i.id).toMatch(/Wysoki stan wody/)
    }
  })

  it('struktura przestrzenna: z wyboru, z odległości, gdy nic nie wybrano; ostrzeżenia', () => {
    expect(suggest('spatial', { choice: 'continuous' })).toBe('FV')
    expect(suggest('spatial', { choice: 'partial' })).toBe('U1')
    expect(suggest('spatial', { choice: 'strong' })).toBe('U2')
    expect(suggest('spatial', { distance: 7 })).toBe('U1')
    expect(suggest('spatial', {})).toBeNull()
    expect(warn('spatial', { choice: 'natural', distance: 12 })).toMatch(/12 m to w tab. 2 klasa U2/)
    expect(warn('spatial', { choice: 'partial', cause: 'natural' })).toMatch(/wyłącznie naturalna/)
    expect(warn('spatial', { choice: 'strong', distance: 15, cause: 'anthropogenic' })).toBeNull()
  })

  it('gatunki charakterystyczne: liczy tab. 1 i lokalne, synonimy raz; chwastnica i uczep amerykański się nie liczą', () => {
    expect(suggest('characteristic', { species: sp('Bidens tripartita', 'Rorippa palustris') })).toBe('U2')
    expect(suggest('characteristic', { species: sp('Bidens tripartita', 'Rorippa palustris', 'Chenopodium rubrum', 'Oxybasis rubra') })).toBe('U1')
    expect(suggest('characteristic', { species: sp('Bidens tripartita', 'Rorippa palustris', 'Bidens radiata', 'Persicaria hydropiper') })).toBe('U1')
    expect(suggest('characteristic', { species: sp('Bidens tripartita', 'Rorippa palustris', 'Bidens radiata', 'Persicaria hydropiper', 'Limosella aquatica') })).toBe('FV')
    expect(suggest('characteristic', { species: sp('Bidens tripartita', 'Rorippa palustris', 'Echinochloa crus-galli', 'Bidens frondosa') })).toBe('U2')
    expect(suggest('characteristic', {})).toBeNull()
    expect(characteristicCount3270({ species: sp('Polygonum lapathifolium', 'Persicaria lapathifolia', 'Polygonum lapathifolium s.l.') }).fromList).toHaveLength(1)
  })

  it('gatunki charakterystyczne: liczba wprost ma pierwszeństwo, ostrzeżenie o rozjeździe i gatunkach spoza listy', () => {
    expect(suggest('characteristic', { species: sp('Bidens tripartita'), count: 5 })).toBe('FV')
    expect(suggest('characteristic', { count: 4 })).toBe('U1')
    const w = warn('characteristic', { species: sp('Bidens tripartita', 'Echinochloa crus-galli'), count: 5 })
    expect(w).toMatch(/Spoza listy tab. 1 \(nie liczą się\): Echinochloa crus-galli/)
    expect(w).toMatch(/byłoby 1 \(U2\), a wpisano 5 \(FV\)/)
    expect(warn('characteristic', { species: sp('Bidens tripartita') })).toBeNull()
  })

  it('gatunki dominujące: typowe FV, mieszane U1, tylko ekspansywne/obce U2; spoza katalogu = obcy', () => {
    expect(dominance3270({ species: spc(['Chenopodium rubrum', 40], ['Echinochloa crus-galli', 20]) }).grade).toBe('FV')
    expect(dominance3270({ species: spc(['Chenopodium rubrum', 40], ['Phalaris arundinacea', 30]) }).grade).toBe('U1')
    expect(dominance3270({ species: spc(['Phalaris arundinacea', 60], ['Bidens frondosa', 20]) }).grade).toBe('U2')
    const r = dominance3270({ species: spc(['Bidens tripartita', 30], ['Coś nieznanego', 10]) })
    expect(r.grade).toBe('U1')
    expect(r.reason).toMatch(/Spoza katalogu .*Coś nieznanego/)
    expect(dominance3270({}).grade).toBeNull()
  })

  it('obce i ekspansywne: suma pokrycia, pusta lista FV, bez pokrycia brak podpowiedzi', () => {
    expect(suggest('invasive', { species: [] })).toBe('FV')
    expect(suggest('invasive', { species: spc(['Bidens frondosa', 20], ['Xanthium albinum', 10]) })).toBe('U1')
    expect(suggest('invasive', { species: spc(['Bidens frondosa', 60]) })).toBe('U2')
    expect(suggest('invasive', { species: sp('Bidens frondosa') })).toBeNull()
    expect(warn('invasive', { species: sp('Bidens tripartita', 'Bidens frondosa') })).toMatch(/nie są obcymi inwazyjnymi: Bidens tripartita/)
    expect(suggest('expansive', { species: [] })).toBe('FV')
    expect(suggest('expansive', { species: spc(['Phalaris arundinacea', 15], ['Phragmites australis', 5]) })).toBe('U1')
    expect(suggest('expansive', { species: spc(['Phalaris arundinacea', 26]) })).toBe('U2')
  })

  it('dobrze zachowane płaty: z procentu', () => {
    expect(suggest('wellPreserved', { share: 95 })).toBe('FV')
    expect(suggest('wellPreserved', { share: 50 })).toBe('U1')
    expect(suggest('wellPreserved', { share: 20 })).toBe('U2')
    expect(suggest('wellPreserved', {})).toBeNull()
  })

  it('katalog: grupy, synonimy, warstwa C, opisy w wyszukiwarce', () => {
    expect(SPECIES_3270.filter((s) => s.group === 'characteristic')).toHaveLength(21)
    expect(m.speciesInfo!('Chenopodium rubrum')).toBe('gatunek charakterystyczny (tab. 1)')
    expect(m.speciesInfo!('Bidens radiata')).toBe('gatunek lokalnie charakterystyczny')
    expect(m.speciesInfo!('Bidens frondosa')).toBe('obcy gatunek inwazyjny')
    expect(m.speciesInfo!('Phalaris arundinacea')).toBe('rodzimy gatunek ekspansywny')
    expect(isCharacteristic3270('Persicaria lapathifolia')).toBe(true)
    expect(isCharacteristic3270('Echinochloa crus-galli')).toBe(false)
    expect(isTypical3270('Echinochloa crus-galli')).toBe(true)
    expect(speciesKey3270('Oxybasis glauca')).toBe('Chenopodium glaucum')
    expect(findSpecies3270('matricaria maritima ssp. inodora')?.group).toBe('other')
    expect(defaultLayer3270(findSpecies3270('Salix alba')!)).toBe('C')
    const latins = SPECIES_3270.map((s) => s.latin)
    expect(new Set(latins).size).toBe(latins.length)
  })
})

describe('ocena struktury', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(sandomierz)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    return v
  }

  it('niekardynalny U2 (obce) → struktura U1; kardynalny U1 (dominujące) → U1; kardynalny U2 (płaty) → U2', () => {
    const v = allFv()
    expect(assessCard(m, v).structure).toBe('FV')
    v.indicators.invasive.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.invasive.grade = 'FV'
    v.indicators.dominant.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.wellPreserved.grade = 'U2'
    expect(assessCard(m, v)).toMatchObject({ structure: 'U2', overall: 'U2' })
  })
})

describe('przykład Sandomierz (karta z przewodnika, 2013)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(sandomierz)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny jak w karcie: wszystkie wskaźniki FV, powierzchnia, struktura, perspektywy i ocena ogólna FV', () => {
    expect(assessCard(m, sandomierz)).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV', missing: [] })
    for (const [id, v] of Object.entries(sandomierz.indicators)) expect(v.grade, id).toBe('FV')
  })

  it('podpowiedzi zgodne z ekspertem (powierzchnia bez trendu w karcie – brak podpowiedzi)', () => {
    const c = ctx({ site: sandomierz.site, indicators: sandomierz.indicators })
    for (const i of m.indicators) {
      const s = i.suggest!(sandomierz.indicators[i.id].inputs, c)
      if (i.id === 'area') expect(s).toBeNull()
      else expect(s, i.id).toBe(sandomierz.indicators[i.id].grade)
    }
  })

  it('16 gatunków charakterystycznych, bez ostrzeżeń', () => {
    expect(characteristicCount3270(sandomierz.indicators.characteristic.inputs)).toMatchObject({ count: 16, outside: [] })
    expect(ind('characteristic').warn!(sandomierz.indicators.characteristic.inputs, ctx())).toBeNull()
    expect(ind('invasive').warn!(sandomierz.indicators.invasive.inputs, ctx())).toBeNull()
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    const c = ctx({ site: sandomierz.site, indicators: sandomierz.indicators })
    for (const i of m.indicators) expect(i.describe!(sandomierz.indicators[i.id].inputs, c), i.id).toBe(sandomierz.indicators[i.id].value)
  })

  it('zdjęcia jak w karcie, udział FV 100%, wykonawca zanonimizowany, kody', () => {
    expect(examples3270).toHaveLength(1)
    expect(sandomierz.releves.map((r) => (r.species as unknown[]).length)).toEqual([13, 13, 13])
    expect(sandomierz.releves.map((r) => [r.area, r.coverC, r.heightC])).toEqual([[2, 50, 20], [2, 50, 20], [2, 60, 20]])
    const o = sandomierz.other
    expect(Number(o.shareFV) + Number(o.shareU1) + Number(o.shareU2)).toBe(100)
    expect(sandomierz.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(sandomierz)).not.toMatch(/Nobis/)
    expect(sandomierz.impacts.map((i) => `${i.code}${i.influence}${i.intensity}`)).toEqual(['F02.03-L'])
    expect(sandomierz.threats.map((t) => t.code)).toEqual(['J02.03', 'F02.03'])
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, stanowisko i oddziaływania', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, sandomierz))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['3270 Zalewane muliste brzegi rzek', 'Udział dobrze zachowanych płatów siedliska', 'Sandomierz', 'F02.03', 'PLH180049 Tarnobrzeska Dolina Wisły'])
      expect(text, t).toContain(t)
  })
})
