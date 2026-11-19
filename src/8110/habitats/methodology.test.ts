import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { dolinaPanszczyca4, examples8110 } from './examples'
import {
  gradeAliens8110,
  gradeAlpine8110,
  gradeHabitatShare8110,
  gradeHerbs8110,
  gradeShrubs8110,
  gradeTypical8110,
  indicator8110 as ind,
  methodology8110 as m,
} from './methodology'
import { SPECIES_8110, alpineStatus8110, defaultLayer8110, findSpecies8110, isTypical8110, speciesKey8110 } from './species'

const site = (o: InputValues = {}): IndicatorContext => ({ site: o })
const TATRY = site({ massif: 'Tatry', subtype: '8110-1' })
const KARKONOSZE = site({ massif: 'Karkonosze', subtype: '8110-3' })
const SNIEZNIK = site({ massif: 'Śnieżnik Kłodzki', subtype: '8110-3' })
const BABIA = site({ massif: 'Babia Góra', subtype: '8110-4' })
const suggest = (id: string, inputs: InputValues, c = TATRY): Grade | null => ind(id).suggest!(inputs, c)
const warn = (id: string, inputs: InputValues, c = TATRY) => ind(id).warn!(inputs, c)
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => (cover === undefined ? { name } : { name, cover }))

describe('metodyka 8110 – struktura', () => {
  it('kod 8110 (nie priorytetowe), 3 zdjęcia po 25 m², podtyp i pasmo wymagane, transekt 100×10 domyślnie', () => {
    expect(habitatCode(m)).toBe('8110')
    expect(m.name).toBe('Piargi i gołoborza krzemianowe')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(25)
    expect(m.siteFields.find((f) => f.name === 'subtype')?.required).toBe(true)
    expect(m.siteFields.find((f) => f.name === 'massif')?.required).toBe(true)
    expect(m.siteFields.find((f) => f.name === 'transect')?.defaultValue).toBe('100x10 m')
    expect(m.siteFields.filter((f) => f.group === 'Współrzędne geograficzne').map((f) => f.name)).toEqual(['coordStart', 'coordMiddle', 'coordEnd'])
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki w kolejności tab. 1 i karty przykładowej: powierzchnia + 9 struktury', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Dominująca frakcja rumoszu',
      'Dominujące rodzaje zbiorowisk',
      'Gatunki typowe',
      'Gatunki wysokogórskie',
      'Obce gatunki inwazyjne',
      'Pokrycie przez drzewa i krzewy',
      'Pokrycie roślin zielnych',
      'Procent powierzchni siedliska na transekcie',
      'Ślady antropopresji',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('kardynalne (lista pod tab. 2): gatunki typowe, wysokogórskie, obce inwazyjne', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id).sort()).toEqual(['aliens', 'alpine', 'typical'])
  })

  it('silnik bez zmian: brak własnej reguły struktury (tab. 2 = reguła ogólna)', () => {
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

  it('termin: lipiec – sierpień bez ostrzeżenia, czerwiec i wrzesień miękko, poza – mocniej', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    for (const ok of ['2013-08-15', '2024-07-20', '2018-08-31']) expect(date.warn!(ok), ok).toBeNull()
    for (const soft of ['2018-09-08', '2024-06-25']) expect(date.warn!(soft), soft).toMatch(/poza optymalnym/)
    for (const hard of ['2024-05-30', '2024-10-02']) expect(date.warn!(hard), hard).toMatch(/poza sezonem/)
  })

  it('transekt: szerokość 10 m, długość od 100 m; inaczej ostrzega', () => {
    const t = m.siteFields.find((f) => f.name === 'transect')!
    for (const ok of ['140x10 m', '100 × 10 m', '10x250']) expect(t.warn!(ok), ok).toBeNull()
    for (const bad of ['80x10 m', '140x15 m']) expect(t.warn!(bad), bad).toMatch(/nie mniejsza niż 100 m/)
    expect(t.warn!('kilka płatów')).toBeNull()
  })

  it('zdjęcie: 25 m² bez ostrzeżenia, inna powierzchnia ostrzega', () => {
    const a = m.releves.fields.find((f) => f.name === 'area')!
    expect(a.warn!(25)).toBeNull()
    expect(a.warn!(16)).toMatch(/25 m²/)
  })
})

describe('progi tab. 2', () => {
  it('gatunki typowe: Tatry >7 / 4–7 / <4; Sudety >2 / 1–2 / 0', () => {
    expect([8, 7, 4, 3, 0].map((n) => gradeTypical8110(n, 'tatry'))).toEqual(['FV', 'U1', 'U1', 'U2', 'U2'])
    for (const r of ['karkonosze', 'snieznik', 'sudety'] as const) expect([3, 2, 1, 0].map((n) => gradeTypical8110(n, r))).toEqual(['FV', 'U1', 'U1', 'U2'])
  })

  it('gatunki wysokogórskie: Tatry >7 / 4–7 / <4; Karkonosze >2 / 1–2 / 0; Śnieżnik >1 / 1 / 0', () => {
    expect([8, 7, 4, 3].map((n) => gradeAlpine8110(n, 'tatry'))).toEqual(['FV', 'U1', 'U1', 'U2'])
    expect([3, 2, 1, 0].map((n) => gradeAlpine8110(n, 'karkonosze'))).toEqual(['FV', 'U1', 'U1', 'U2'])
    expect([2, 1, 0].map((n) => gradeAlpine8110(n, 'snieznik'))).toEqual(['FV', 'U1', 'U2'])
  })

  it('obce: brak FV; 1 gatunek <1% U1 (1% i bez pokrycia też U1); 2+ albo 1 >1% U2', () => {
    expect(gradeAliens8110(0)).toBe('FV')
    expect(gradeAliens8110(1, 0.5)).toBe('U1')
    expect(gradeAliens8110(1, 1)).toBe('U1')
    expect(gradeAliens8110(1)).toBe('U1')
    expect(gradeAliens8110(1, 1.5)).toBe('U2')
    expect(gradeAliens8110(2, 0.2)).toBe('U2')
  })

  it('krzewy <5 / 5–25 / >25; zielne <50 / 50–90 / >90; udział >50 / 25–50 / <25 – granice do U1', () => {
    expect([4.9, 5, 25, 26].map(gradeShrubs8110)).toEqual(['FV', 'U1', 'U1', 'U2'])
    expect([49, 50, 90, 91].map(gradeHerbs8110)).toEqual(['FV', 'U1', 'U1', 'U2'])
    expect([51, 50, 25, 24].map(gradeHabitatShare8110)).toEqual(['FV', 'U1', 'U1', 'U2'])
  })
})

describe('wskaźniki – podpowiedzi i ostrzeżenia', () => {
  it('gatunki typowe liczone z katalogu, synonimy raz, rodzaj spp. łapie gatunki rodzaju', () => {
    const list = sp(['Cardaminopsis neglecta'], ['Arabidopsis neglecta'], ['Racomitrium sudeticum'], ['Racomitrium lanuginosum'], ['Juncus trifidus'])
    expect(ind('typical').explain!({ species: list }, KARKONOSZE)).toMatch(/z katalogu: 3/)
    expect(suggest('typical', { species: list }, KARKONOSZE)).toBe('FV')
    expect(suggest('typical', { species: list }, TATRY)).toBe('U2')
    expect(warn('typical', { species: list }, KARKONOSZE)).toMatch(/Nie liczą się jako typowe: Juncus trifidus/)
  })

  it('progi zależą od pasma; bez pasma – z podtypu; bez obu – brak podpowiedzi', () => {
    const five = { count: 5 }
    expect(suggest('typical', five, TATRY)).toBe('U1')
    expect(suggest('typical', five, KARKONOSZE)).toBe('FV')
    expect(suggest('typical', five, site({ subtype: '8110-3' }))).toBe('FV')
    expect(suggest('typical', five, site({ subtype: '8110-2' }))).toBe('U1')
    expect(suggest('typical', five, site())).toBeNull()
    expect(ind('typical').explain!(five, site())).toMatch(/wybierz pasmo/)
  })

  it('Babia Góra: progi tatrzańskie z ostrzeżeniem poniżej FV (2024: 7 gatunków → FV)', () => {
    expect(suggest('typical', { count: 7 }, BABIA)).toBe('U1')
    expect(warn('typical', { count: 7 }, BABIA)).toMatch(/Babia Góra: tab. 2 nie podaje progów/)
    expect(warn('typical', { count: 9 }, BABIA)).toBeNull()
    expect(suggest('typical', { count: 7, choice: 'FV' }, BABIA)).toBe('FV')
    expect(warn('typical', { count: 7, choice: 'FV' }, BABIA)).toMatch(/uzasadnij/)
  })

  it('niezgodność podtypu i pasma ostrzega', () => {
    expect(warn('typical', { count: 9 }, site({ subtype: '8110-3', massif: 'Tatry' }))).toMatch(/Podtyp 8110-3 występuje w: Karkonosze, Śnieżnik Kłodzki/)
  })

  it('wysokogórskie: katalog + spoza katalogu, pomija gatunki niewysokogórskie z ostrzeżeniem', () => {
    const list = sp(['Oreochloa disticha'], ['Primula minima'], ['Deschampsia flexuosa'], ['Homogyne alpina'], ['Gentiana frigida'])
    expect(alpineStatus8110('Gentiana frigida')).toBe('unknown')
    expect(ind('alpine').explain!({ species: list }, KARKONOSZE)).toMatch(/wysokogórskie: 3, w tym spoza katalogu: Gentiana frigida/)
    expect(suggest('alpine', { species: list }, KARKONOSZE)).toBe('FV')
    expect(suggest('alpine', { species: list }, TATRY)).toBe('U2')
    expect(warn('alpine', { species: list }, KARKONOSZE)).toMatch(/pominięte: Deschampsia flexuosa, Homogyne alpina/)
  })

  it('wysokogórskie: Śnieżnik i Karkonosze różnią się przy 2 gatunkach; samo 8110-3 bez pasma – podpowiedź tylko gdy progi zgodne', () => {
    expect(suggest('alpine', { count: 2 }, SNIEZNIK)).toBe('FV')
    expect(suggest('alpine', { count: 2 }, KARKONOSZE)).toBe('U1')
    expect(suggest('alpine', { count: 2 }, site({ subtype: '8110-3' }))).toBeNull()
    expect(suggest('alpine', { count: 5 }, site({ subtype: '8110-3' }))).toBe('FV')
    expect(suggest('alpine', { none: 'yes' }, SNIEZNIK)).toBe('U2')
  })

  it('obce: nie stwierdzono → FV, gatunek bez pokrycia → U1, gatunek rodzimy ostrzega', () => {
    expect(suggest('aliens', { none: 'yes' })).toBe('FV')
    expect(suggest('aliens', { species: sp(['Impatiens parviflora']) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Impatiens parviflora', 2]) })).toBe('U2')
    expect(warn('aliens', { species: sp(['Pinus mugo', 1]) })).toMatch(/rodzime/)
  })

  it('krzewy: suma listy, łączne ma pierwszeństwo, dokładnie 5% ostrzega (praktyka FV)', () => {
    expect(suggest('shrubs', { species: sp(['Pinus mugo', 2], ['Salix silesiaca', 1]) })).toBe('FV')
    expect(suggest('shrubs', { species: sp(['Pinus mugo', 2]), total: 10 })).toBe('U1')
    expect(suggest('shrubs', { none: 'yes' })).toBe('FV')
    expect(suggest('shrubs', { total: 5 })).toBe('U1')
    expect(warn('shrubs', { total: 5 })).toMatch(/Dokładnie 5%/)
    expect(warn('shrubs', { species: sp(['Oxyria digyna', 1]) })).toMatch(/To nie drzewa ani krzewy: Oxyria digyna/)
  })

  it('frakcja rumoszu i zbiorowiska: sam opis → FV; wyjątki U1; U2 tylko z wyboru, z ostrzeżeniem', () => {
    expect(suggest('fraction', { size: 'bloki 50–100 cm' })).toBe('FV')
    expect(suggest('fraction', { size: 'bloki 1–2 m', choice: 'blocks' })).toBe('U1')
    expect(suggest('fraction', {})).toBeNull()
    expect(warn('fraction', { choice: 'residual' })).toMatch(/Tab. 2 nie przewiduje/)
    expect(suggest('communities', { types: 'Luzuletum alpino-pilosae 60%' })).toBe('FV')
    expect(suggest('communities', { pinus: 60 })).toBe('U1')
    expect(suggest('communities', { pinus: 50 })).toBe('FV')
    expect(warn('communities', { pinus: 60, choice: 'any' })).toMatch(/wychodzi U1/)
    expect(warn('communities', { choice: 'none' })).toMatch(/Tab. 2 nie przewiduje/)
  })

  it('zielne: 8110-1 przy ≥50% ostrzega o podtypie', () => {
    expect(suggest('herbs', { value: 75 })).toBe('U1')
    expect(warn('herbs', { value: 75 })).toMatch(/8110-1/)
    expect(warn('herbs', { value: 75 }, site({ subtype: '8110-2' }))).toBeNull()
  })

  it('struktura: kardynalne FV i niekardynalne U1 → FV; niekardynalny U2 → U1; kardynalny U2 → U2', () => {
    const base = JSON.parse(JSON.stringify(dolinaPanszczyca4)) as CardValues
    base.indicators.herbs = { inputs: { value: 75 }, value: '75%', grade: 'U1' }
    expect(assessCard(m, base).structure).toBe('FV')
    base.indicators.habitatShare = { inputs: { value: 10 }, value: '10%', grade: 'U2' }
    expect(assessCard(m, base).structure).toBe('U1')
    base.indicators.aliens = { inputs: { count: 2 }, value: '', grade: 'U2' }
    expect(assessCard(m, base)).toMatchObject({ structure: 'U2', overall: 'U2' })
  })
})

describe('katalog gatunków', () => {
  it('bez duplikatów, warstwy domyślne: krzewy B, mchy i porosty D', () => {
    const names = SPECIES_8110.map((s) => s.latin.toLowerCase())
    expect(new Set(names).size).toBe(names.length)
    expect(defaultLayer8110(findSpecies8110('Pinus mugo')!)).toBe('B')
    expect(defaultLayer8110(findSpecies8110('Andreaea rupestris')!)).toBe('D')
    expect(defaultLayer8110(findSpecies8110('Oxyria digyna')!)).toBe('C')
  })

  it('synonimy dają jeden klucz', () => {
    expect(speciesKey8110('Festuca supina')).toBe(speciesKey8110('Festuca airoides'))
    expect(speciesKey8110('Saxifraga carpathica')).toBe(speciesKey8110('Saxifraga carpatica'))
    expect(speciesKey8110('Racomitrium sudeticum')).not.toBe(speciesKey8110('Racomitrium lanuginosum'))
  })

  it('karta przykładowa: 19 typowych i 43 wysokogórskie – wszystkie rozpoznane', () => {
    const t = dolinaPanszczyca4.indicators.typical.inputs.species as { name: string }[]
    const a = dolinaPanszczyca4.indicators.alpine.inputs.species as { name: string }[]
    expect(t).toHaveLength(19)
    expect(a).toHaveLength(43)
    for (const { name } of t) expect(isTypical8110(name), name).toBe(true)
    for (const { name } of a) expect(alpineStatus8110(name), name).toBe('yes')
  })

  it('speciesInfo opisuje gatunek typowy, wysokogórski i krzew', () => {
    expect(m.speciesInfo!('Oxyria digyna')).toBe('gatunek typowy 8110 (8110-1); wysokogórski')
    expect(m.speciesInfo!('Deschampsia flexuosa')).toMatch(/^gatunek typowy 8110/)
    expect(m.speciesInfo!('Campanula alpina')).toBe('wysokogórski')
    expect(m.speciesInfo!('Pinus mugo')).toBe('drzewo albo krzew')
    expect(m.speciesInfo!('Nieznany gatunek')).toBeUndefined()
  })
})

describe('przykład Dolina Pańszczyca 4 (Tatry), 15.08.2013', () => {
  const c = site(dolinaPanszczyca4.site)

  it('oceny wskaźników jak w karcie – wszystkie FV', () => {
    const grades = Object.fromEntries(Object.entries(dolinaPanszczyca4.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual(Object.fromEntries(m.indicators.map((i) => [i.id, 'FV'])))
  })

  it('parametry i ocena ogólna jak w karcie: wszystko FV', () => {
    expect(assessCard(m, dolinaPanszczyca4)).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV', missing: [] })
  })

  it('podpowiedzi formularza zgodne z ekspertem przy każdym wskaźniku', () => {
    for (const i of m.indicators) expect(i.suggest!(dolinaPanszczyca4.indicators[i.id].inputs, c), i.id).toBe(dolinaPanszczyca4.indicators[i.id].grade)
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    for (const i of m.indicators) expect(i.describe!(dolinaPanszczyca4.indicators[i.id].inputs, c), i.id).toBe(dolinaPanszczyca4.indicators[i.id].value)
  })

  it('bez ostrzeżeń przy wskaźnikach, stanowisku i zdjęciach', () => {
    for (const i of m.indicators) expect(i.warn?.(dolinaPanszczyca4.indicators[i.id].inputs, c) ?? null, i.id).toBeNull()
    for (const f of m.siteFields) expect(f.warn?.(dolinaPanszczyca4.site[f.name]) ?? null, f.name).toBeNull()
    for (const r of dolinaPanszczyca4.releves) for (const f of m.releves.fields) expect(f.warn?.(r[f.name]) ?? null, f.name).toBeNull()
  })

  it('zdjęcia jak w karcie, gatunki rozpoznane, udział FV 100%, eksperci zanonimizowani', () => {
    expect(examples8110).toHaveLength(1)
    expect(dolinaPanszczyca4.releves.map((r) => (r.species as unknown[]).length)).toEqual([18, 32, 40])
    expect(dolinaPanszczyca4.releves.map((r) => [r.altitude, r.area, r.slope, r.exposure, r.coverC, r.coverD, r.heightC, r.heightD])).toEqual([
      [1880, 25, 45, 'N', 5, 1, 15, 5],
      [1840, 25, 35, 'NE', 10, 1, 10, 5],
      [1815, 25, 5, 'E', 20, 10, 10, 5],
    ])
    const rows = dolinaPanszczyca4.releves.flatMap((r) => r.species as { name: string; layer: string }[])
    for (const r of rows) expect(findSpecies8110(r.name), r.name).toBeTruthy()
    expect(rows.filter((r) => r.layer === 'D').map((r) => r.name)).toEqual(['musci indet.', 'musci indet.', 'Cladonia sp.'])
    const o = dolinaPanszczyca4.other
    expect(Number(o.shareFV) + Number(o.shareU1) + Number(o.shareU2)).toBe(100)
    expect(dolinaPanszczyca4.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(dolinaPanszczyca4)).not.toMatch(/Stawowczyk|Kozak|Kozłowska/)
  })

  it('przechodzi walidację schematu karty', () => {
    expect(buildCardSchema(m).safeParse(dolinaPanszczyca4).success).toBe(true)
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, udział FV/U1/U2 i dane stanowiska', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, dolinaPanszczyca4))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['8110 Piargi i gołoborza krzemianowe', 'Gatunki wysokogórskie', 'Udział powierzchni siedliska w stanie FV', 'Dolina Pańszczyca 4', '8110-1'])
      expect(text, t).toContain(t)
  })
})
