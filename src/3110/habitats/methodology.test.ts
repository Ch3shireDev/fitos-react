import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { CardValues, Grade, IndicatorContext, InputValues } from '../../7120/habitats/types'
import { chlewo, examples3110 } from './examples'
import {
  describeHits,
  gradeArea3110,
  gradeConductivity3110,
  gradePH3110,
  gradePlankton3110,
  gradeSecchi3110,
  indicator3110 as ind,
  methodology3110 as m,
  speciesHits,
  splitCommunities,
} from './methodology'
import { CHARACTERISTIC_3110, DEGENERATION_3110, defaultLayer3110, findSpecies3110 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues, c: IndicatorContext = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const sp = (species: string, abundance: string) => ({ species, abundance })

describe('metodyka 3110 – struktura', () => {
  it('kod 3110 (niepriorytetowe), transekt 30×30 m, zdjęcia fitosocjologiczne nieobowiązkowe', () => {
    expect(habitatCode(m)).toBe('3110')
    expect(m.name).toBe('Jeziora lobeliowe')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('30x30 m')
    expect(emptyCardValues(m).releves).toHaveLength(0)
  })

  it('wskaźniki w kolejności tab. 2', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Charakterystyczna kombinacja zbiorowisk w obrębie transektu',
      'Gatunki wskazujące na degenerację siedliska',
      'Barwa wody',
      'Odczyn wody',
      'Konduktywność (przewodnictwo elektrolityczne)',
      'Przezroczystość wody',
      'Plankton (fito- i zooplankton)',
    ])
  })

  it('kardynalne: sześć wskaźników struktury z przewodnika; plankton pomocniczy – pominięty w ocenie', () => {
    const structure = m.indicators.filter((i) => i.parameter === 'structure')
    expect(structure.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['combination', 'degeneration', 'colour', 'ph', 'conductivity', 'secchi'])
    expect(m.indicators.filter((i) => isExcluded(i, {})).map((i) => i.id)).toEqual(['plankton'])
    expect(ind('plankton').excludedNote).toMatch(/pomocniczy/)
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...m.otherFields, ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: od początku lipca do połowy września', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    for (const d of ['2009-07-01', '2009-08-31', '2009-09-01', '2009-09-15']) expect(date.warn!(d), d).toBeNull()
    for (const d of ['2009-06-30', '2009-09-16', '2009-10-02']) expect(date.warn!(d), d).toMatch(/poza optymalnym/)
  })

  it('kody oddziaływań bez duplikatów, z wędkarstwem, rekreacją, eutrofizacją i zakwaszeniem', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['F02.03', 'F04.01', 'G02', 'K02.03', 'K02.04', 'I01', 'X']) expect(codes).toContain(c)
  })
})

describe('metodyka 3110 – progi', () => {
  it('pH: 5,5–7,5 FV; 4,5–5,5 i 7,5–8,5 U1; poza tym U2 (granice 5,5 i 7,5 → FV, 4,5 i 8,5 → U1)', () => {
    expect([5.5, 6.35, 7.5, 7.51, 8.5, 8.51, 5.49, 4.5, 4.49].map(gradePH3110)).toEqual(['FV', 'FV', 'FV', 'U1', 'U1', 'U2', 'U1', 'U1', 'U2'])
    expect(ind('ph').describe!({ value: 6.35 }, ctx())).toBe('pH 6,35')
  })

  it('pH: ostrzeżenie przy podtypie dystroficznym i pH < 5,5', () => {
    expect(ind('ph').warn!({ value: 4.8 }, ctx({ site: { subtype: 'dys-oligo' } }))).toMatch(/dystroficzne/)
    expect(ind('ph').warn!({ value: 4.8 }, ctx({ site: { subtype: 'balanced' } }))).toBeNull()
    expect(ind('ph').warn!({ value: 6 }, ctx({ site: { subtype: 'dys-poli' } }))).toBeNull()
  })

  it('konduktywność: <100 FV, 100–250 U1, >250 U2', () => {
    expect([60, 99.9, 100, 250, 250.1].map(gradeConductivity3110)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
    expect(ind('conductivity').warn!({ value: 0.06 }, ctx())).toMatch(/mS\/cm/)
    expect(ind('conductivity').describe!({ value: 60 }, ctx())).toBe('60 µS/cm')
  })

  it('przezroczystość: >3,5 FV, 1,5–3,5 U1, <1,5 U2; „do dna” tylko ostrzega', () => {
    expect([5.1, 3.51, 3.5, 1.5, 1.49].map(gradeSecchi3110)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
    expect(suggest('secchi', { value: 2.5, toBottom: 'yes' })).toBe('U1')
    expect(ind('secchi').warn!({ value: 2.5, toBottom: 'yes' }, ctx())).toMatch(/do dna/)
    expect(ind('secchi').warn!({ value: 5, toBottom: 'yes' }, ctx())).toBeNull()
    expect(ind('secchi').describe!({ value: 2.5, toBottom: 'yes' }, ctx())).toBe('2,5 m (do dna)')
  })

  it('barwa: z wyboru; opis własny i mg Pt/dm³ do karty; brunatna w polihumusowym – ostrzeżenie', () => {
    expect(['blue', 'greenish', 'brown'].map((choice) => suggest('colour', { choice }))).toEqual(['FV', 'U1', 'U2'])
    expect(ind('colour').describe!({ choice: 'greenish' }, ctx())).toBe('Niebieska z odcieniem zielonym lub żółtozielonym')
    expect(ind('colour').describe!({ choice: 'blue', note: 'Woda czysta', pt: 12.5 }, ctx())).toBe('Woda czysta. Barwa 12,5 mg Pt/dm³')
    expect(ind('colour').warn!({ choice: 'brown' }, ctx({ site: { subtype: 'dys-poli' } }))).toMatch(/polihumusowe/)
    expect(ind('colour').warn!({ choice: 'brown' }, ctx({ site: { subtype: 'eutrophied' } }))).toBeNull()
  })

  it('powierzchnia: bez zmian / wzrost FV; ubytek <5 FV, 5–25 U1, >25 U2; brak danych XX', () => {
    expect(gradeArea3110('stable', undefined)).toBe('FV')
    expect(gradeArea3110('increase', undefined)).toBe('FV')
    expect([4.9, 5, 25, 25.1].map((p) => gradeArea3110('decrease', p))).toEqual(['FV', 'U1', 'U1', 'U2'])
    expect(gradeArea3110('decrease', undefined)).toBeNull()
    expect(gradeArea3110('unknown', undefined)).toBe('XX')
    expect(gradeArea3110('', undefined)).toBeNull()
    expect(ind('area').explain!({ change: 'decrease' }, ctx())).toMatch(/ubytek/)
    expect(ind('area').describe!({ change: 'decrease', lossPct: 12 }, ctx())).toBe('Powierzchnia zmniejszyła się o 12%')
  })

  it('gatunki wskazujące na degenerację: z wyboru, spis w opisie, ostrzeżenia', () => {
    expect(['absent', 'single', 'increasing'].map((choice) => suggest('degeneration', { choice }))).toEqual(['FV', 'U1', 'U2'])
    const species = [sp('Nuphar lutea', 'sporadic'), sp('Potamogeton natans', 'numerous')]
    expect(ind('degeneration').describe!({ choice: 'single', species }, ctx())).toBe('Występują pojedynczo: Nuphar lutea (sporadyczne), Potamogeton natans (liczne)')
    expect(ind('degeneration').warn!({ choice: 'absent', species }, ctx())).toMatch(/wybrano „Brak”/)
    expect(ind('degeneration').warn!({ choice: 'single', species: [sp('Elodea canadensis', 'veryFew')] }, ctx())).toMatch(/I01/)
    expect(ind('degeneration').explain!({ species }, ctx())).toMatch(/Spoza listy.*Potamogeton natans/)
  })

  it('kombinacja zbiorowisk: syntaksony z listy albo ze stanowiska, spis gatunków, głębokość, ostrzeżenia', () => {
    expect(['typical', 'poor', 'absent'].map((choice) => suggest('combination', { choice }))).toEqual(['FV', 'U1', 'U2'])
    const site = { communities: 'Isoeto-Lobelietum; Myriophylletum alterniflori' }
    expect(ind('combination').describe!({ choice: 'typical' }, ctx({ site }))).toBe('Isoeto-Lobelietum, Myriophylletum alterniflori')
    expect(ind('combination').explain!({}, ctx({ site }))).toMatch(/„Zbiorowiska roślinne” \(2\)/)
    const species = [sp('Lobelia dortmanna', 'numerous'), sp('Isoetes lacustris', 'mass')]
    expect(ind('combination').describe!({ list: 'Lobelietum dortmannae', species, maxDepth: 4.5 }, ctx())).toBe(
      'Lobelietum dortmannae; gatunki charakterystyczne: Lobelia dortmanna (liczne), Isoetes lacustris (masowe); roślinność do głębokości 4,5 m',
    )
    expect(ind('combination').explain!({ species }, ctx())).toMatch(/2 z 6/)
    expect(ind('combination').warn!({ choice: 'absent', species }, ctx())).toMatch(/stan zły/)
    expect(ind('combination').warn!({ choice: 'typical', species: [sp('Lobelia dortmanna', 'sporadic')] }, ctx())).toMatch(/stan właściwy/)
    expect(ind('combination').warn!({ choice: 'typical', species }, ctx())).toBeNull()
    expect(ind('combination').describe!({ choice: 'poor' }, ctx())).toMatch(/^Roślinność Isoeto-Lobelietum nieliczna/)
  })

  it('plankton: niższa z ocen fito- i zooplanktonu, „nie badano” pomijane', () => {
    expect(gradePlankton3110('mixotrophic', 'small')).toBe('U1')
    expect(gradePlankton3110('bloom', 'filtrators')).toBe('U2')
    expect(gradePlankton3110('mixotrophic', 'filtrators')).toBe('FV')
    expect(gradePlankton3110('notStudied', 'small')).toBe('U1')
    expect(gradePlankton3110('notStudied', 'notStudied')).toBe('XX')
    expect(gradePlankton3110('', 'small')).toBeNull()
    expect(ind('plankton').describe!({ phyto: 'notStudied', zoo: 'notStudied' }, ctx())).toBe('Nie badano')
    expect(ind('plankton').describe!({ phyto: 'codominance', zoo: 'notStudied' }, ctx())).toBe('Fitoplankton (U1): Współdominacja sinic i zielenic Zooplankton: nie badano')
    expect(ind('plankton').warn!({ phyto: 'bloom' }, ctx())).toMatch(/Zakwit sinicowy/)
  })

  it('spisy: odrzucają wiersze bez gatunku lub liczebności; listy syntaksonów dzielone przecinkiem, średnikiem, linią', () => {
    expect(speciesHits([sp('Lobelia dortmanna', 'mass'), sp('', 'mass'), sp('X', ''), sp('Y', 'dużo')])).toEqual([{ name: 'Lobelia dortmanna', abundance: 'mass' }])
    expect(describeHits([{ name: 'A', abundance: 'veryFew' }])).toBe('A (bardzo nieliczne)')
    expect(splitCommunities('A; B,\nC ;; ')).toEqual(['A', 'B', 'C'])
  })

  it('katalog: 6 gatunków charakterystycznych, 5 wskazujących na degenerację; Isoetes z diaerezą i bez', () => {
    expect(CHARACTERISTIC_3110.map((s) => s.latin)).toEqual([
      'Lobelia dortmanna',
      'Isoëtes lacustris',
      'Isoëtes echinospora',
      'Littorella uniflora',
      'Myriophyllum alterniflorum',
      'Luronium natans',
    ])
    expect(DEGENERATION_3110).toHaveLength(5)
    expect(findSpecies3110('isoetes  LACUSTRIS')?.group).toBe('characteristic')
    expect(defaultLayer3110(findSpecies3110('Drepanocladus tenuinervis')!)).toBe('D')
    expect(m.speciesInfo!('Nuphar lutea')).toBe('gatunek wskazujący na degenerację siedliska')
  })
})

describe('ocena 3110: kardynalne i pomocniczy plankton', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(chlewo)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    v.prospects.grade = 'FV'
    return v
  }

  it('plankton U2 przy pozostałych FV → struktura i ocena ogólna FV', () => {
    const v = allFv()
    v.indicators.plankton.grade = 'U2'
    expect(assessCard(m, v)).toMatchObject({ structure: 'FV', overall: 'FV' })
  })

  it('jeden kardynalny U1 → struktura U1 (praktyka 2015–2021, nie „jeden U1” z tab. 2)', () => {
    const v = allFv()
    v.indicators.colour.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('U1')
  })

  it('jeden kardynalny U2 → struktura U2, ocena ogólna U2', () => {
    const v = allFv()
    v.indicators.secchi.grade = 'U2'
    expect(assessCard(m, v)).toMatchObject({ structure: 'U2', overall: 'U2' })
  })

  it('ocena ogólna wg modyfikacji 2015: jeden parametr U1 → U1 (nie „dwa FV i jeden U1 → FV”)', () => {
    const v = allFv()
    v.prospects.grade = 'U1'
    expect(assessCard(m, v).overall).toBe('U1')
  })

  it('brak oceny planktonu nie blokuje oceny', () => {
    const v = allFv()
    v.indicators.plankton.grade = ''
    expect(assessCard(m, v).missing).toEqual([])
    expect(assessCard(m, v).structure).toBe('FV')
  })
})

describe('przykład Jezioro Chlewo (karta z przewodnika, 2009)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(chlewo)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny jak w karcie: powierzchnia FV, struktura FV, perspektywy FV, ogólna FV', () => {
    expect(assessCard(m, chlewo)).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV', missing: [] })
  })

  it('wskaźniki jak w karcie: kardynalne FV, plankton U1 (zooplankton U1 jest niższy od fitoplanktonu FV)', () => {
    const grades = Object.fromEntries(Object.entries(chlewo.indicators).map(([id, v]) => [id, v.grade]))
    expect(grades).toEqual({ area: 'FV', combination: 'FV', degeneration: 'FV', colour: 'FV', ph: 'FV', conductivity: 'FV', secchi: 'FV', plankton: 'U1' })
  })

  it('podpowiedzi zgodne z ekspertem', () => {
    const c = ctx({ site: chlewo.site, indicators: chlewo.indicators })
    for (const i of m.indicators) expect(i.suggest!(chlewo.indicators[i.id].inputs, c), i.id).toBe(chlewo.indicators[i.id].grade)
  })

  it('pole „wartość” = opis wygenerowany z pomiarów, bez ostrzeżeń', () => {
    const c = ctx({ site: chlewo.site, indicators: chlewo.indicators })
    for (const i of m.indicators) {
      expect(i.describe!(chlewo.indicators[i.id].inputs, c), i.id).toBe(chlewo.indicators[i.id].value)
      expect(i.warn?.(chlewo.indicators[i.id].inputs, c) ?? null, i.id).toBeNull()
    }
    for (const f of m.siteFields) expect(f.warn?.(chlewo.site[f.name]) ?? null, f.name).toBeNull()
  })

  it('wartości z karty: pH 6,35, 60 µS/cm, Secchi 5,1 m, 8 mg Pt/dm³, 900 m² płatów', () => {
    expect(chlewo.indicators.ph.value).toBe('pH 6,35')
    expect(chlewo.indicators.conductivity.value).toBe('60 µS/cm')
    expect(chlewo.indicators.secchi.value).toBe('5,1 m')
    expect(chlewo.indicators.colour.value).toMatch(/8 mg Pt\/dm³/)
    expect(chlewo.site.areaM2).toBe(900)
  })

  it('zanonimizowany wykonawca, bez zdjęć fitosocjologicznych', () => {
    expect(examples3110).toHaveLength(1)
    expect(chlewo.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(chlewo)).not.toMatch(/Klimaszyk|Kraska|Piotrowicz|Wilk-Woźniak/)
    expect(chlewo.releves).toHaveLength(0)
  })
})

describe('eksport .docx przykładu Chlewo', () => {
  it('karta ma wartości z przewodnika i plankton z dopiskiem', async () => {
    const { Packer } = await import('docx')
    const { strFromU8, unzipSync } = await import('fflate')
    const { buildCardDocument } = await import('../../7120/components/habitat-form/exportDocx')
    const buf = await Packer.toBuffer(await buildCardDocument(m, chlewo))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['3110 Jeziora lobeliowe', 'Jezioro Chlewo', 'pH 6,35', '60 µS/cm', '5,1 m', 'Plankton (fito- i zooplankton)', 'PLH320001 Bobolickie Jeziora Lobeliowe'])
      expect(text, t).toContain(t)
    expect(text).toMatch(/pomocniczy/)
  })
})
