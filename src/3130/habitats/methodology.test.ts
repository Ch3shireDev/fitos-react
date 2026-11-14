import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { examples3130, przeborek } from './examples'
import {
  gradeAliens3130,
  gradeCharacteristic3130,
  gradeDominants3130,
  gradeExpansive3130,
  gradeFragmentation3130,
  gradeWellPreserved3130,
  indicator3130 as ind,
  methodology3130 as m,
} from './methodology'
import { defaultLayer3130, findSpecies3130, isCharacteristic3130, speciesKey3130 } from './species'

const ctx = (site: InputValues = {}): IndicatorContext => ({ site })
const suggest = (id: string, inputs: InputValues, site: InputValues = {}): Grade | null => ind(id).suggest!(inputs, ctx(site))
const warn = (id: string, inputs: InputValues, site: InputValues = {}) => ind(id).warn!(inputs, ctx(site))
const sp = (...names: string[]) => names.map((name) => ({ name }))

describe('metodyka 3130 – struktura', () => {
  it('kod 3130 (nie priorytetowe), 3 zdjęcia po 1 m², transekt bez wartości domyślnej', () => {
    expect(habitatCode(m)).toBe('3130')
    expect(m.name).toBe('Brzegi lub osuszane dna zbiorników wodnych ze zbiorowiskami z Littorelletea, Isoëto-Nanojuncetea')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(1)
    expect(emptyCardValues(m).releves).toHaveLength(3)
    expect(m.siteFields.map((f) => f.name)).toEqual([
      'siteName', 'guid', 'subtype', 'communityClass', 'siteType', 'communities', 'description', 'areaHa', 'protectedAreas', 'natura2000',
      'manager', 'coordStart', 'coordMiddle', 'coordEnd', 'transect', 'altitude', 'date', 'observer', 'additionalExperts',
    ])
  })

  it('wskaźniki w kolejności karty z przewodnika', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Powierzchnia zajęta przez siedlisko na transekcie',
      'Struktura przestrzenna płatów siedliska',
      'Gatunki charakterystyczne',
      'Gatunki dominujące',
      'Gatunki ekspansywne roślin zielnych',
      'Obce gatunki inwazyjne',
      'Udział dobrze zachowanych płatów siedliska',
    ])
  })

  it('kardynalne (lista pod tab. 2): charakterystyczne, dominujące, udział dobrze zachowanych; powierzchnia na transekcie poza oceną', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['species', 'dominants', 'wellPreserved'])
    expect(m.indicators.filter((i) => isExcluded(i, {})).map((i) => i.id)).toEqual(['transectShare'])
    expect(ind('transectShare').suggest).toBeUndefined()
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...allOtherFields(m), ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: ostrzeżenie poza 1 czerwca – 31 października', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    for (const d of ['2024-06-01', '2024-07-01', '2013-10-21', '2024-10-31']) expect(date.warn!(d), d).toBeNull()
    for (const d of ['2024-05-20', '2013-11-05']) expect(date.warn!(d), d).toMatch(/poza dopuszczalnym/)
  })

  it('transekt: 50–150 m, inaczej ostrzeżenie; opis płatów bez długości – bez ostrzeżenia', () => {
    const t = m.siteFields.find((f) => f.name === 'transect')!
    expect(t.warn!('150 m; w kształcie litery L')).toBeNull()
    expect(t.warn!('50 m')).toBeNull()
    expect(t.warn!('200 m')).toMatch(/50–150 m/)
    expect(t.warn!('3 płaty po 2 m²')).toBeNull()
  })

  it('kody oddziaływań bez duplikatów, z akwakulturą, hydrologią i sukcesją', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['F01', 'F02.03', 'G01', 'G05.01', 'J02.04.02', 'J02.05.04', 'J02.13', 'K02.01', 'M01.03', 'X']) expect(codes).toContain(c)
  })

  it('inne informacje: propozycje po działaniach, udział FV/U1/U2 przed uwagami', () => {
    expect(m.otherFields.map((f) => f.name)).toEqual(['otherValues', 'conservation', 'proposals', 'shareFV', 'shareU1', 'shareU2', 'notes', 'photos'])
  })
})

describe('metodyka 3130 – progi tab. 2', () => {
  it('gatunki charakterystyczne, Isoëto-Nanojuncetea i mozaika: >3 FV, 2–3 U1, 0–1 U2', () => {
    expect([10, 4, 3, 2, 1, 0].map((n) => gradeCharacteristic3130(n, 'isoeto'))).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
    expect([4, 3, 1].map((n) => gradeCharacteristic3130(n, 'mixed'))).toEqual(['FV', 'U1', 'U2'])
    expect(gradeCharacteristic3130(3, '')).toBe('U1')
  })

  it('gatunki charakterystyczne, Littorelletea: ≥2 FV, 1 U1, U2 tylko przy braku', () => {
    expect([3, 2, 1, 0].map((n) => gradeCharacteristic3130(n, 'littorelletea'))).toEqual(['FV', 'FV', 'U1', 'U2'])
  })

  it('gatunki dominujące: same typowe FV, część albo brak dominantów U1, żadnego typowego U2', () => {
    expect(gradeDominants3130(3, 3)).toBe('FV')
    expect(gradeDominants3130(3, 1)).toBe('U1')
    expect(gradeDominants3130(0, 0)).toBe('U1')
    expect(gradeDominants3130(2, 0)).toBe('U2')
  })

  it('gatunki ekspansywne: ≤25 FV, ≤50 U1, >50 U2', () => {
    expect([0, 11, 25, 25.5, 50, 50.5].map(gradeExpansive3130)).toEqual(['FV', 'FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('obce: ≤25 FV, ≤50 U1, >50 U2; tawuła kutnerowata zawsze U2', () => {
    expect([0, 25, 26, 50, 51].map((c) => gradeAliens3130(c))).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
    expect(gradeAliens3130(0.5, true)).toBe('U2')
  })

  it('udział dobrze zachowanych płatów: >80 FV, 50–80 U1 (obie granice), <50 U2', () => {
    expect([95, 80.5, 80, 50, 49.5, 0].map(gradeWellPreserved3130)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('struktura przestrzenna: brak/mała naturalna FV, średnia U1, duża naturalna U1, duża antropogeniczna U2', () => {
    expect(gradeFragmentation3130('none', '')).toBe('FV')
    expect(gradeFragmentation3130('small', '')).toBe('FV')
    expect(gradeFragmentation3130('small', 'natural')).toBe('FV')
    expect(gradeFragmentation3130('small', 'anthropogenic')).toBe('U1')
    expect(gradeFragmentation3130('medium', 'natural')).toBe('U1')
    expect(gradeFragmentation3130('medium', 'anthropogenic')).toBe('U1')
    expect(gradeFragmentation3130('large', 'natural')).toBe('U1')
    expect(gradeFragmentation3130('large', 'anthropogenic')).toBe('U2')
    expect(gradeFragmentation3130('large', '')).toBeNull()
    expect(gradeFragmentation3130('', '')).toBeNull()
  })
})

describe('metodyka 3130 – podpowiedzi z pól', () => {
  it('gatunki charakterystyczne: rzęśle i włosieniczniki jako jeden gatunek, synonimy raz, klasa z Stanowiska', () => {
    const list = sp('Callitriche sp.', 'Callitriche palustris', 'Calitriche sp.', 'Batrachium juv.', 'Batrachium sp.', 'Peplis portula', 'Lythrum portula')
    expect(ind('species').explain!({ species: list }, ctx({ communityClass: 'isoeto' }))).toBe('Gatunków charakterystycznych z tab. 1 na liście: 3 (progi Isoëto-Nanojuncetea).')
    expect(suggest('species', { species: list }, { communityClass: 'isoeto' })).toBe('U1')
    expect(suggest('species', { species: sp('Eleocharis acicularis', 'Littorella uniflora') }, { communityClass: 'littorelletea' })).toBe('FV')
    expect(suggest('species', { species: sp('Eleocharis acicularis', 'Littorella uniflora') }, { communityClass: 'isoeto' })).toBe('U1')
    expect(suggest('species', { species: sp('Eleocharis acicularis') }, { communityClass: 'littorelletea' })).toBe('U1')
    expect(suggest('species', { species: sp('Agrostis stolonifera'), count: 4 })).toBe('FV')
    expect(suggest('species', {})).toBeNull()
    expect(ind('species').explain!({ species: sp('Limosella aquatica') }, ctx())).toMatch(/wybierz klasę zbiorowisk/)
  })

  it('gatunki charakterystyczne: mchy i wątrobowce z tab. 1 się liczą, ostrzeżenie o spoza listy i o rozjeździe', () => {
    expect(isCharacteristic3130('Riccia cavernosa')).toBe(true)
    expect(isCharacteristic3130('Botrydium granulatum')).toBe(true)
    const w = warn('species', { species: sp('Limosella aquatica', 'Alisma plantago-aquatica', 'Rorippa amphibia'), count: 4 }, { communityClass: 'isoeto' })
    expect(w).toMatch(/Spoza listy tab. 1: Alisma plantago-aquatica, Rorippa amphibia/)
    expect(w).toMatch(/byłoby 1 \(U2\), a wpisano 4 \(FV\)/)
    expect(warn('species', { species: sp('Limosella aquatica') })).toBeNull()
  })

  it('gatunki dominujące: charakterystyczne i formy lądowe gatunków wodnych są typowe', () => {
    expect(suggest('dominants', { species: sp('Eleocharis acicularis', 'Potamogeton gramineus') })).toBe('FV')
    expect(suggest('dominants', { species: sp('Eleocharis ovata', 'Bidens tripartita') })).toBe('U1')
    expect(suggest('dominants', { species: sp('Phragmites australis', 'Agrostis stolonifera') })).toBe('U2')
    expect(suggest('dominants', { none: 'yes' })).toBe('U1')
    expect(suggest('dominants', {})).toBeNull()
    expect(ind('dominants').explain!({ species: sp('Eleocharis ovata', 'Bidens tripartita') }, ctx())).toMatch(/typowych .*: 1\. Nietypowe: Bidens tripartita/)
    expect(warn('dominants', { species: sp('Nieznany gatunek') })).toMatch(/Spoza katalogu/)
    expect(warn('dominants', { species: sp('Eleocharis ovata'), none: 'yes' })).toMatch(/Brak gatunków dominujących/)
    expect(ind('dominants').describe!({ species: [], none: 'yes' }, ctx())).toBe('brak gatunków dominujących')
  })

  it('gatunki ekspansywne: suma z listy, łączne wprost, „nie stwierdzono”, nalot wierzb z rodzaju', () => {
    expect(suggest('expansive', { species: [{ name: 'Rorippa amphibia', cover: 5 }, { name: 'Salix cinerea', cover: 5 }] })).toBe('FV')
    expect(suggest('expansive', { species: [{ name: 'Phragmites australis', cover: 20 }, { name: 'Typha latifolia', cover: 10 }] })).toBe('U1')
    expect(suggest('expansive', { species: [{ name: 'Phragmites australis', cover: 60 }], total: 40 })).toBe('U1')
    expect(suggest('expansive', { species: [{ name: 'Glyceria maxima', cover: 55 }] })).toBe('U2')
    expect(suggest('expansive', { species: sp('Phragmites australis') })).toBeNull()
    expect(suggest('expansive', { none: 'yes' })).toBe('FV')
    expect(ind('expansive').describe!({ species: [], none: 'yes' }, ctx())).toBe('nie stwierdzono')
    expect(warn('expansive', { species: sp('Limosella aquatica') })).toMatch(/spoza grupy ekspansywnych/)
    expect(m.speciesInfo!('Rorippa amphibia')).toBe('gatunek ekspansywny')
    expect(m.speciesInfo!('Glyceria maxima')).toBe('gatunek ekspansywny (sprawozdania)')
  })

  it('obce: pokrycie z listy albo wprost, tawuła kutnerowata = U2', () => {
    expect(suggest('aliens', { species: [{ name: 'Bidens frondosa', cover: 10 }] })).toBe('FV')
    expect(suggest('aliens', { species: [{ name: 'Bidens frondosa', cover: 20 }, { name: 'Echinochloa crus-galli', cover: 10 }] })).toBe('U1')
    expect(suggest('aliens', { species: [{ name: 'Bidens frondosa', cover: 60 }] })).toBe('U2')
    expect(suggest('aliens', { species: [{ name: 'Spiraea tomentosa', cover: 0.5 }] })).toBe('U2')
    expect(suggest('aliens', { species: sp('Spiraea tomentosa') })).toBe('U2')
    expect(suggest('aliens', { species: sp('Bidens frondosa') })).toBeNull()
    expect(suggest('aliens', { total: 30 })).toBe('U1')
    expect(suggest('aliens', { none: 'yes' })).toBe('FV')
    expect(suggest('aliens', {})).toBeNull()
    expect(warn('aliens', { species: sp('Bidens tripartita') })).toMatch(/rodzime: Bidens tripartita/)
    expect(ind('aliens').explain!({ species: sp('Spiraea tomentosa') }, ctx())).toMatch(/sama obecność daje U2/)
  })

  it('struktura przestrzenna: ostrzeżenie przy dużej fragmentacji bez przyczyny, opis z wyboru', () => {
    expect(suggest('fragmentation', { degree: 'large', cause: 'anthropogenic' })).toBe('U2')
    expect(warn('fragmentation', { degree: 'large', cause: '' })).toMatch(/podaj przyczynę/)
    expect(warn('fragmentation', { degree: 'medium', cause: 'natural' })).toBeNull()
    expect(ind('fragmentation').describe!({ degree: 'medium', cause: 'natural' }, ctx())).toBe('Średni stopień fragmentacji, naturalna')
  })

  it('powierzchnia i udział dobrze zachowanych płatów', () => {
    expect(['stable', 'smallDecrease', 'clearDecrease', 'unknown'].map((choice) => suggest('area', { choice }))).toEqual(['FV', 'U1', 'U2', 'XX'])
    expect(ind('area').describe!({ choice: 'clearDecrease' }, ctx())).toMatch(/^wyraźny spadek/)
    expect(ind('area').describe!({ choice: 'stable', areaHa: 3.36 }, ctx())).toBe('3,36 ha')
    expect(suggest('wellPreserved', { value: 80 })).toBe('U1')
    expect(ind('wellPreserved').describe!({ value: 95 }, ctx())).toBe('95%')
  })

  it('katalog: rodzaje zbiorcze, synonimy, warstwy, grupy', () => {
    expect(speciesKey3130('Callitriche hamulata')).toBe(speciesKey3130('Callitriche sp.'))
    expect(speciesKey3130('Gnaphalium uliginosum')).toBe(speciesKey3130('Filaginella uliginosa'))
    expect(findSpecies3130('Isoetes lacustris')?.group).toBe('aquatic')
    expect(findSpecies3130('Salix cinerea')?.group).toBe('expansive')
    expect(isCharacteristic3130('Plantago major')).toBe(false)
    expect(isCharacteristic3130('Plantago major subsp. intermedia')).toBe(true)
    expect(defaultLayer3130(findSpecies3130('Riccia sorocarpa')!)).toBe('D')
    expect(defaultLayer3130(findSpecies3130('Salix sp.')!)).toBe('B')
    expect(defaultLayer3130(findSpecies3130('Limosella aquatica')!)).toBe('C')
    const latins = m.speciesCatalog!.map((s) => s.value)
    expect(new Set(latins).size).toBe(latins.length)
  })
})

describe('ocena struktury', () => {
  const allFv = (): CardValues => structuredClone(przeborek)

  it('niekardynalny U2 (obce) → struktura U1; pomocniczy U2 (powierzchnia na transekcie) nie zmienia oceny', () => {
    const v = allFv()
    v.indicators.transectShare.grade = 'U2'
    expect(assessCard(m, v)).toMatchObject({ structure: 'FV', overall: 'FV' })
    v.indicators.aliens.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
  })

  it('kardynalny U1 (dominujące) → U1; kardynalny U2 (udział płatów) → U2; siedlisko niewykształcone (XX) → XX', () => {
    const v = allFv()
    v.indicators.dominants.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.wellPreserved.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U2')
    const x = allFv()
    for (const id of ['fragmentation', 'species', 'dominants', 'expansive', 'aliens', 'wellPreserved']) x.indicators[id].grade = 'XX'
    expect(assessCard(m, x).structure).toBe('XX')
  })

  it('pomocniczy wskaźnik bez oceny nie blokuje oceny ogólnej', () => {
    const v = allFv()
    v.indicators.transectShare.grade = ''
    expect(assessCard(m, v)).toMatchObject({ overall: 'FV', missing: [] })
  })
})

describe('przykład Przeborek (karta z przewodnika, 2013)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(przeborek)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny jak w karcie: wszystkie wskaźniki FV, struktura FV, perspektywy FV, ogólna FV', () => {
    expect(assessCard(m, przeborek)).toMatchObject({ area: 'FV', structure: 'FV', prospects: 'FV', overall: 'FV', missing: [] })
    const grades = Object.fromEntries(Object.entries(przeborek.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({ area: 'FV', transectShare: 'FV', fragmentation: 'FV', species: 'FV', dominants: 'FV', expansive: 'FV', aliens: 'FV', wellPreserved: 'FV' })
  })

  it('podpowiedzi zgodne z ekspertem (bez rozbieżności)', () => {
    const c: IndicatorContext = { site: przeborek.site, indicators: przeborek.indicators }
    for (const i of m.indicators.filter((x) => x.suggest)) expect(i.suggest!(przeborek.indicators[i.id].inputs, c), i.id).toBe(przeborek.indicators[i.id].grade)
    expect(ind('species').explain!(przeborek.indicators.species.inputs, c)).toBe('Gatunków charakterystycznych z tab. 1 na liście: 9 (progi Isoëto-Nanojuncetea).')
    for (const i of m.indicators.filter((x) => x.warn)) expect(i.warn!(przeborek.indicators[i.id].inputs, c), i.id).toBeNull()
  })

  it('pole „wartość” = opis wygenerowany z pomiarów', () => {
    const c: IndicatorContext = { site: przeborek.site, indicators: przeborek.indicators }
    for (const i of m.indicators) expect(i.describe!(przeborek.indicators[i.id].inputs, c), i.id).toBe(przeborek.indicators[i.id].value)
  })

  it('zdjęcia jak w karcie, udział FV/U1/U2 = 100%, osoby zanonimizowane, bez ostrzeżeń w stanowisku', () => {
    expect(examples3130).toHaveLength(1)
    expect(przeborek.releves.map((r) => (r.species as unknown[]).length)).toEqual([8, 12, 11])
    expect(przeborek.releves.map((r) => r.coverC)).toEqual([90, 80, 60])
    const o = przeborek.other
    expect(Number(o.shareFV) + Number(o.shareU1) + Number(o.shareU2)).toBe(100)
    expect(przeborek.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(przeborek)).not.toMatch(/Zalewska|Gałosz|Król/)
    for (const f of m.siteFields.filter((x) => x.warn)) expect(f.warn!(przeborek.site[f.name]), f.name).toBeNull()
    expect(przeborek.impacts.map((i) => `${i.code}${i.influence}${i.intensity}`)).toEqual(['F01+H'])
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny, pomocniczy wskaźnik i oddziaływanie', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, przeborek))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['3130 Brzegi lub osuszane dna zbiorników wodnych', 'Udział dobrze zachowanych płatów siedliska', 'Przeborek', 'F01', 'Udział powierzchni siedliska w stanie FV'])
      expect(text, t).toContain(t)
    expect(text).toMatch(/Powierzchnia zajęta przez siedlisko na transekcie \(pomocniczy, nie liczy się do oceny\)/)
  })
})
