import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { buildCardDocument } from '../../7120/components/habitat-form/exportDocx'
import { assessCard, emptyCardValues, habitatCode, isCardinal, isExcluded } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import { allOtherFields, type CardValues, type Grade, type IndicatorContext, type InputValues } from '../../7120/habitats/types'
import { examples6190, ostrzycaZachod } from './examples'
import {
  gradeAliens6190,
  gradeCharacteristic6190,
  gradeDamage6190,
  gradeDominants6190,
  gradeExpansive6190,
  gradeShade6190,
  gradeShrubs6190,
  indicator6190 as ind,
  methodology6190 as m,
  parseRange6190,
} from './methodology'
import { SPECIES_6190, defaultLayer6190, findSpecies6190, speciesKey6190 } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues): Grade | null => ind(id).suggest!(inputs, ctx())
const warn = (id: string, inputs: InputValues) => ind(id).warn!(inputs, ctx())
const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => (cover === undefined ? { name } : { name, cover }))

describe('metodyka 6190 – struktura', () => {
  it('kod 6190 (nie priorytetowe), bez domyślnego transektu, 3 zdjęcia bez narzuconej powierzchni', () => {
    expect(habitatCode(m)).toBe('6190')
    expect(m.name).toBe('Murawy pannońskie (Stipo-Festucetalia pallentis)')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBeUndefined()
    expect(m.siteFields.find((f) => f.name === 'indicatorSet')).toBeUndefined()
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBeUndefined()
    expect(m.releves.fields.map((f) => f.name)).toEqual(expect.arrayContaining(['coverC', 'coverD', 'heightC', 'heightD', 'remarks']))
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('wskaźniki jak w monitoringu 2016 i 2024: powierzchnia + 7 struktury (bez udziału na transekcie i mozaiki z 6110)', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska',
      'Gatunki charakterystyczne',
      'Gatunki dominujące',
      'Obce gatunki inwazyjne',
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Ekspansja krzewów i podrostu drzew',
      'Ocienienie muraw',
      'Zniszczenia mechaniczne',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'structure')).toHaveLength(7)
    expect(m.indicators.filter((i) => isExcluded(i, {}))).toEqual([])
  })

  it('5 kardynalnych (podkreślone w tab. 2 sprawozdań 2016 i 2024): charakterystyczne, dominujące, ekspansywne, krzewy, ocienienie', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id).sort()).toEqual(['characteristic', 'dominant', 'expansive', 'shade', 'shrubs'])
  })

  it('każde pole i wskaźnik ma wyjaśnienie, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...allOtherFields(m), ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(30)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(200)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: maj–lipiec bez ostrzeżeń; sierpień–wrzesień łagodnie; poza sezonem ostro', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2024-06-12')).toBeNull()
    expect(date.warn!('2024-07-26')).toBeNull()
    expect(date.warn!('2016-09-15')).toMatch(/po optymalnym oknie/)
    expect(date.warn!('2024-04-20')).toMatch(/poza sezonem/)
    expect(date.warn!('2024-10-02')).toMatch(/poza sezonem/)
  })

  it('kody oddziaływań bez duplikatów, z turystyką, wydeptywaniem, azotem, muflonami, klimatem i powodzią', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    for (const c of ['D01.01', 'G01.02', 'G02.10', 'G05.01', 'H04.02', 'K02.01', 'K04.05', 'L08', 'M01.01', 'M01.02', 'X']) expect(codes).toContain(c)
  })

  it('inne informacje: propozycje po zabiegach, uwagi, zdjęcia', () => {
    expect(m.otherFields.map((f) => f.name)).toEqual(['otherValues', 'conservation', 'proposals', 'notes', 'photos'])
  })
})

describe('metodyka 6190 – progi (wstępna metodyka z 6110 + praktyka 2016/2024)', () => {
  it('liczby i zakresy jak w karcie papierowej', () => {
    expect(parseRange6190('10')).toEqual({ lo: 10, hi: 10, mid: 10 })
    expect(parseRange6190('5–10')).toEqual({ lo: 5, hi: 10, mid: 7.5 })
    expect(parseRange6190('ok. 10%')).toMatchObject({ mid: 10 })
    expect(parseRange6190('0,5')).toMatchObject({ mid: 0.5 })
    expect(parseRange6190('trochę')).toBeUndefined()
  })

  it('gatunki charakterystyczne: ≥4 FV, 2–3 U1, 0–1 U2', () => {
    expect([12, 4, 3, 2, 1, 0].map(gradeCharacteristic6190)).toEqual(['FV', 'FV', 'U1', 'U1', 'U2', 'U2'])
  })

  it('obce: brak FV, do 2% U1 (2 też), >2% U2; bez pokrycia – brak podpowiedzi', () => {
    expect(gradeAliens6190(0, 0)).toBe('FV')
    expect(gradeAliens6190(1, 0.5)).toBe('U1')
    expect(gradeAliens6190(1, 2)).toBe('U1')
    expect(gradeAliens6190(2, 2.5)).toBe('U2')
    expect(gradeAliens6190(1, undefined)).toBeNull()
  })

  it('ekspansywne: brak FV, do 5% U1 (5 też), >5% U2', () => {
    expect(gradeExpansive6190(0, 0)).toBe('FV')
    expect(gradeExpansive6190(1, 1)).toBe('U1')
    expect(gradeExpansive6190(3, 5)).toBe('U1')
    expect(gradeExpansive6190(1, 20)).toBe('U2')
  })

  it('ekspansja krzewów: brak i pojedyncze okazy (do 1%) FV, do 30% U1, >30% U2', () => {
    expect([0, 0.5, 1, 1.5, 30, 31].map(gradeShrubs6190)).toEqual(['FV', 'FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('ocienienie: do 10% FV (słabe), do 20% U1 (20 też), >20% U2', () => {
    expect([0, 7.5, 10, 11, 20, 21].map(gradeShade6190)).toEqual(['FV', 'FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('zniszczenia antropogeniczne: do 20% U1 (luka 10–20 też), >20% U2', () => {
    expect([0, 5, 10, 15, 20, 21].map(gradeDamage6190)).toEqual(['FV', 'U1', 'U1', 'U1', 'U1', 'U2'])
  })

  it('dominujące: typowe z kostrzewą bladą FV; same typowe bez niej (owcza, mszaki) U1; domieszka obcych U1; żaden typowy U2', () => {
    expect(gradeDominants6190(['Festuca pallens'])).toBe('FV')
    expect(gradeDominants6190(['Festuca pallens', 'Polytrichum piliferum'])).toBe('FV')
    expect(gradeDominants6190(['Festuca ovina', 'Polytrichum piliferum', 'Ceratodon purpureus'])).toBe('U1')
    expect(gradeDominants6190(['Festuca pallens', 'Capsella bursa-pastoris'])).toBe('U1')
    expect(gradeDominants6190(['Polygonum aviculare', 'Hypnum cupressiforme'])).toBe('U2')
    expect(gradeDominants6190([])).toBeNull()
  })
})
describe('metodyka 6190 – podpowiedzi z pól', () => {
  it('gatunki charakterystyczne: liczba wprost > lista (synonimy raz, typowe nie liczą się), „nie stwierdzono” = U2', () => {
    expect(suggest('characteristic', { count: 5, species: sp(['Festuca pallens']) })).toBe('FV')
    // Wąwóz Czyżynki – północ 2024: tylko kostrzewa blada i zanokcica północna → U1
    expect(suggest('characteristic', { species: sp(['Festuca pallens'], ['Asplenium septentrionale']) })).toBe('U1')
    // Wąwóz Czyżynki – południe 2024: kostrzewa blada, owcza, ciemiężyk → wg liczby U1 (ekspert dał U2 za niskie pokrycie)
    expect(suggest('characteristic', { species: sp(['Festuca pallens', 2], ['Festuca ovina', 5], ['Vincetoxicum hirundinaria', 0.5]) })).toBe('U1')
    expect(suggest('characteristic', { species: sp(['Sedum maximum'], ['Hylotelephium maximum'], ['Acinos arvensis'], ['Clinopodium acinos']) })).toBe('U1')
    expect(suggest('characteristic', { species: sp(['Festuca pallens'], ['Asplenium septentrionale'], ['Sedum maximum'], ['Potentilla argentea']) })).toBe('FV')
    expect(suggest('characteristic', { none: 'yes', species: [] })).toBe('U2')
    expect(suggest('characteristic', { species: [] })).toBeNull()
    expect(warn('characteristic', { species: sp(['Festuca pallens'], ['Festuca ovina'], ['Polytrichum piliferum']) })).toMatch(/Nie liczą się jako charakterystyczne: Festuca ovina, Polytrichum piliferum/)
  })

  it('dominujące: wybór eksperta ma pierwszeństwo; ostrzeżenie przy pokryciu <10% i rozjeździe; wyjaśnienie braku kostrzewy bladej', () => {
    expect(suggest('dominant', { species: sp(['Festuca pallens', 20]), choice: 'u1' })).toBe('U1')
    expect(suggest('dominant', { species: sp(['Festuca pallens', 20]), choice: '' })).toBe('FV')
    expect(warn('dominant', { species: sp(['Festuca pallens', 5]) })).toMatch(/poniżej 10%/)
    expect(warn('dominant', { species: sp(['Festuca ovina', 20]), choice: 'fv' })).toMatch(/Wybrano FV, a z listy wychodzi U1/)
    expect(ind('dominant').explain!({ species: sp(['Festuca ovina', 20], ['Polytrichum piliferum', 30]) }, ctx())).toMatch(/2 z 2.*brak Festuca pallens.*U1/)
  })

  it('obce i ekspansywne: suma z listy albo łączne pokrycie wprost; „nie stwierdzono” = FV; tasznik to ekspansywny, nie obcy', () => {
    expect(suggest('aliens', { none: 'yes', species: [] })).toBe('FV')
    expect(suggest('aliens', { species: sp(['Chamomilla suaveolens', 0.5]) })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Robinia pseudoacacia', 5]) })).toBe('U2')
    expect(suggest('aliens', { species: sp(['Robinia pseudoacacia']), cover: 1 })).toBe('U1')
    expect(suggest('aliens', { species: sp(['Robinia pseudoacacia']) })).toBeNull()
    expect(warn('aliens', { species: sp(['Capsella bursa-pastoris', 1]) })).toMatch(/rodzime lub dawno zadomowione: Capsella/)
    expect(speciesKey6190('Matricaria discoidea')).toBe(speciesKey6190('Chamomilla suaveolens'))
    // Wąwóz Pełcznicy – żółty szlak 2024: życica trwała ok. 1% → U1
    expect(suggest('expansive', { species: sp(['Lolium perenne', 1]) })).toBe('U1')
    expect(suggest('expansive', { species: sp(['Polygonum aviculare', 20], ['Capsella bursa-pastoris', 5]) })).toBe('U2')
    expect(suggest('expansive', { none: 'yes', species: [] })).toBe('FV')
    expect(warn('expansive', { species: sp(['Rosa canina', 1], ['Festuca ovina', 5]) })).toMatch(/Ekspansja krzewów.*Rosa canina.*nie są gatunki ekspansywne: Festuca ovina/)
    expect(warn('expansive', { species: sp(['Chamomilla suaveolens', 1]) })).toMatch(/Obce gatunki inwazyjne/)
    expect(ind('aliens').describe!({ none: 'yes', species: [] }, ctx())).toBe('Brak')
  })

  it('ekspansja krzewów: zwarcie wprost > suma z listy; pojedyncze okazy (≤1%) FV jak w 2016 i 2024', () => {
    expect(suggest('shrubs', { none: 'yes', species: [] })).toBe('FV')
    // Wąwóz Pełcznicy 2024: brzoza, cis, róża „razem mniej niż 1%” → FV
    expect(suggest('shrubs', { species: sp(['Betula pendula', 0.3], ['Taxus baccata', 0.3], ['Rosa canina', 0.3]) })).toBe('FV')
    expect(ind('shrubs').explain!({ species: sp(['Rosa canina', 0.5]) }, ctx())).toMatch(/pojedyncze okazy/)
    expect(suggest('shrubs', { species: sp(['Populus tremula', 5]) })).toBe('U1')
    expect(suggest('shrubs', { species: sp(['Populus tremula', 1]), cover: 40 })).toBe('U2')
    expect(suggest('shrubs', { species: sp(['Rosa canina']) })).toBeNull()
    expect(warn('shrubs', { species: sp(['Festuca pallens', 1]) })).toMatch(/To nie drzewa/)
  })

  it('ocienienie: z liczby albo środka zakresu (2024: „5–10%” → FV), ostrzeżenie przy bzdurze', () => {
    expect(suggest('shade', { value: '5–10' })).toBe('FV')
    expect(suggest('shade', { value: '20–30' })).toBe('U2')
    expect(warn('shade', { value: 'cień' })).toMatch(/Nie rozumiem/)
    expect(warn('shade', { value: '150' })).toMatch(/100%/)
    expect(ind('shade').describe!({ value: '5 - 10' }, ctx())).toBe('5–10%')
  })

  it('zniszczenia: brak i naturalne = FV, antropogeniczne z procentu, bez procentu – brak podpowiedzi', () => {
    expect(suggest('damage', { kind: 'none' })).toBe('FV')
    expect(suggest('damage', { kind: 'natural' })).toBe('FV')
    expect(suggest('damage', { kind: 'human', cover: 5 })).toBe('U1')
    expect(suggest('damage', { kind: 'human', cover: 15 })).toBe('U1')
    expect(suggest('damage', { kind: 'human', cover: 40 })).toBe('U2')
    expect(suggest('damage', { kind: 'human' })).toBeNull()
    expect(ind('damage').explain!({ kind: 'human', cover: 15 }, ctx())).toMatch(/Luka 10–20%/)
  })

  it('katalog: drzewa i krzewy w B, mchy w D, reszta w C; synonimy; bez duplikatów', () => {
    const names = SPECIES_6190.map((s) => s.latin.toLowerCase())
    expect(new Set(names).size).toBe(names.length)
    expect(defaultLayer6190(findSpecies6190('Rosa canina')!)).toBe('B')
    expect(defaultLayer6190(findSpecies6190('Polytrichum piliferum')!)).toBe('D')
    expect(defaultLayer6190(findSpecies6190('Festuca pallens')!)).toBe('C')
    expect(speciesKey6190('Jovibarba sobolifera')).toBe(speciesKey6190('Sempervivum soboliferum'))
    expect(speciesKey6190('Allium montanum')).toBe(speciesKey6190('Allium senescens subsp. montanum'))
    expect(m.speciesInfo!('Festuca pallens')).toMatch(/charakterystyczny/)
    expect(m.speciesInfo!('Capsella bursa-pastoris')).toMatch(/ekspansywny/)
  })
})

describe('ocena struktury (reguła ogólna, bez structureRule)', () => {
  const allFv = (): CardValues => {
    const v = structuredClone(ostrzycaZachod)
    for (const id of Object.keys(v.indicators)) v.indicators[id].grade = 'FV'
    v.prospects.grade = 'FV'
    return v
  }

  it('silnik bez zmian: 6190 nie ma własnej reguły struktury', () => {
    expect(m.structureRule).toBeUndefined()
  })

  it('wszystko FV → FV; niekardynalne U1 (zniszczenia, obce) nie obniżają; niekardynalny U2 → U1', () => {
    const v = allFv()
    expect(assessCard(m, v)).toMatchObject({ structure: 'FV', overall: 'FV' })
    v.indicators.damage.grade = 'U1'
    v.indicators.aliens.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('FV')
    v.indicators.damage.grade = 'U2'
    expect(assessCard(m, v).structure).toBe('U1')
  })

  it('kardynalny U1 (ocienienie) → U1; kardynalny U2 (charakterystyczne) → U2', () => {
    const v = allFv()
    v.indicators.shade.grade = 'U1'
    expect(assessCard(m, v).structure).toBe('U1')
    v.indicators.characteristic.grade = 'U2'
    expect(assessCard(m, v)).toMatchObject({ structure: 'U2', overall: 'U2' })
  })
})

describe('przykład poglądowy Ostrzyca stok zachodni (wg sprawozdania 2024)', () => {
  const c = ctx({ site: ostrzycaZachod.site, indicators: ostrzycaZachod.indicators })

  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(ostrzycaZachod)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny wskaźników jak w sprawozdaniu 2024: ekspansywne i zniszczenia U1, reszta FV', () => {
    const grades = Object.fromEntries(Object.entries(ostrzycaZachod.indicators).map(([k, v]) => [k, v.grade]))
    expect(grades).toEqual({
      area: 'FV',
      characteristic: 'FV',
      dominant: 'FV',
      aliens: 'FV',
      expansive: 'U1',
      shrubs: 'FV',
      shade: 'FV',
      damage: 'U1',
    })
  })

  it('parametry i ocena ogólna: powierzchnia FV, struktura U1 (kardynalne ekspansywne), perspektywy U1, ogólna U1', () => {
    expect(assessCard(m, ostrzycaZachod)).toMatchObject({ area: 'FV', structure: 'U1', prospects: 'U1', overall: 'U1', missing: [] })
  })

  it('podpowiedzi zgodne z oceną – zniszczenia bez procentu dają brak podpowiedzi', () => {
    for (const i of m.indicators) {
      const s = i.suggest!(ostrzycaZachod.indicators[i.id].inputs, c)
      if (i.id === 'damage') expect(s).toBeNull()
      else expect(s, i.id).toBe(ostrzycaZachod.indicators[i.id].grade)
    }
  })

  it('pole „wartość” = opis wygenerowany z pomiarów; bez ostrzeżeń', () => {
    for (const i of m.indicators) {
      expect(i.describe!(ostrzycaZachod.indicators[i.id].inputs, c), i.id).toBe(ostrzycaZachod.indicators[i.id].value)
      expect(i.warn?.(ostrzycaZachod.indicators[i.id].inputs, c) ?? null, i.id).toBeNull()
    }
    expect(m.siteFields.filter((f) => f.warn?.(ostrzycaZachod.site[f.name])).map((f) => f.name)).toEqual([])
  })

  it('oznaczony jako poglądowy, wykonawca umowny, kody z listy, gatunki z katalogu', () => {
    expect(examples6190).toHaveLength(1)
    expect(examples6190[0].label).toMatch(/poglądowy/)
    expect(ostrzycaZachod.other.notes).toMatch(/PRZYKŁAD POGLĄDOWY/)
    expect(ostrzycaZachod.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(ostrzycaZachod)).not.toMatch(/Świerkosz|Reczyńska|Perzanowska/)
    for (const t of [...ostrzycaZachod.impacts, ...ostrzycaZachod.threats]) expect(m.impactCodes.find((x) => x.code === t.code)?.name, t.code).toBe(t.name)
    const names = Object.values(ostrzycaZachod.indicators).flatMap((v) => ((v.inputs.species as { name: string }[] | undefined) ?? []).map((s) => s.name))
    for (const n of names) expect(findSpecies6190(n), n).toBeTruthy()
  })
})

describe('eksport .docx przykładu', () => {
  it('ma wskaźniki, oceny i nazwę siedliska', async () => {
    const buf = await Packer.toBuffer(await buildCardDocument(m, ostrzycaZachod))
    const xml = strFromU8(unzipSync(new Uint8Array(buf))['word/document.xml'])
    const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
    for (const t of ['6190 Murawy pannońskie (Stipo-Festucetalia pallentis)', 'Ekspansja krzewów i podrostu drzew', 'Ostrzyca stok zachodni', 'Asplenio septentrionalis-Festucion pallentis', 'Ocienienie muraw'])
      expect(text, t).toContain(t)
  })
})
