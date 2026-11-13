import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { Grade, IndicatorContext, InputValues } from '../../7120/habitats/types'
import { examples91XX, koziRynek } from './examples'
import {
  deadWoodFromPieces,
  deadWoodPieces,
  indicator91XX as ind,
  largePieces,
  methodology91XX as m,
  microFromTrees,
  parseMicroCodes,
  transectHa,
} from './methodology'
import { TYPICAL_91XX, findSpecies91XX, typicalMatch } from './species'

const ctx = (o: Partial<IndicatorContext> = {}): IndicatorContext => ({ site: {}, ...o })
const suggest = (id: string, inputs: InputValues, c: IndicatorContext = ctx()): Grade | null => ind(id).suggest!(inputs, c)
const sp = (...rows: [string, number?][]) => ({ species: rows.map(([name, cover]) => ({ name, cover })) })
const lying = (diameter: number, length: number) => ({ kind: 'lying', diameter, length })
const standing = (diameter: number, length: number) => ({ kind: 'standing', diameter, length })
const KOZI_PIECES = koziRynek.indicators.deadWood.inputs.pieces

describe('metodyka 91XX – struktura', () => {
  it('kod 91XX bez gwiazdki, transekt 100×40 m, zdjęcia 3 × 200 m²', () => {
    expect(habitatCode(m)).toBe('91XX')
    expect(m.name).toBe('Olsy (Carici elongatae-Alnetum)')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('100x40 m')
    expect(m.releves.fields.find((f) => f.name === 'area')?.defaultValue).toBe(200)
    expect(emptyCardValues(m).releves).toHaveLength(3)
  })

  it('12 wskaźników struktury z monitoringu 2024 w kolejności tab. 2 + powierzchnia', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Charakterystyczna kombinacja florystyczna',
      'Gatunki obce geograficznie w drzewostanie',
      'Inwazyjne gatunki obce w podszycie i runie',
      'Funkcja ekohydrologiczna w krajobrazie',
      'Warunki wodne',
      'Obecność rowów odwadniających',
      'Objawy zanieczyszczenia lub nadmiernej eutrofizacji wód',
      'Martwe drewno (łączne zasoby)',
      'Martwe drewno wielkowymiarowe',
      'Mikrosiedliska drzewne (drzewa biocenotyczne)',
      'Inne zniekształcenia, w tym zniszczenia runa i gleby związane z pozyskaniem drewna',
      'Stan kluczowych dla różnorodności biologicznej gatunków lokalnie typowych dla siedliska (wskaźnik fakultatywny)',
    ])
    expect(m.indicators.filter((i) => i.parameter === 'area').map((i) => i.id)).toEqual(['area'])
    expect(new Set(m.indicators.map((i) => i.id)).size).toBe(m.indicators.length)
  })

  it('2 wskaźniki kardynalne: kombinacja florystyczna (errata 2015) i warunki wodne', () => {
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual(['characteristic', 'water'])
  })

  it('każde pole i wskaźnik ma wyjaśnienie dłuższe niż 60 znaków, każdy wskaźnik komplet progów', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...m.otherFields, ...m.indicators.flatMap((i) => i.inputs)]
    for (const f of fields) expect(f.help?.length ?? 0, f.name).toBeGreaterThan(60)
    for (const i of m.indicators) {
      expect(i.help?.length ?? 0, i.id).toBeGreaterThan(60)
      for (const g of ['FV', 'U1', 'U2'] as const) expect(i.thresholds[g], `${i.id} ${g}`).toBeTruthy()
    }
  })

  it('termin: ostrzeżenie poza lipcem–sierpniem', () => {
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(date.warn!('2013-08-07')).toBeNull()
    expect(date.warn!('2024-07-01')).toBeNull()
    expect(date.warn!('2024-06-15')).toMatch(/poza optymalnym/)
  })

  it('kody oddziaływań bez duplikatów, z osuszaniem i wyschnięciem', () => {
    const codes = m.impactCodes.map((c) => c.code)
    expect(new Set(codes).size).toBe(codes.length)
    expect(codes).toEqual(expect.arrayContaining(['B02.04', 'I01', 'J02.01.02', 'J02.05', 'K01.03', 'M01.02']))
  })
})

describe('metodyka 91XX – progi tab. 2', () => {
  it('opisowe wskaźniki: ocena z wybranego opisu', () => {
    expect(suggest('area', { choice: 'stable' })).toBe('FV')
    expect(suggest('characteristic', { choice: 'typical' })).toBe('FV')
    expect(suggest('characteristic', { choice: 'altered' })).toBe('U1')
    expect(suggest('characteristic', { choice: 'dominated' })).toBe('U2')
    expect(suggest('ecohydro', { choice: 'partial' })).toBe('U1')
    expect(suggest('water', { choice: 'natural' })).toBe('FV')
    expect(suggest('water', { choice: 'slight' })).toBe('U1')
    expect(suggest('water', { choice: 'drained' })).toBe('U2')
    expect(suggest('water', { choice: 'flooded' })).toBe('U2')
    expect(suggest('ditches', { choice: 'draining' })).toBe('U1')
    expect(suggest('eutrophication', { choice: 'strong' })).toBe('U2')
    expect(suggest('otherDistortions', { choice: 'minor' })).toBe('U1')
    expect(suggest('keySpecies', { choice: 'noData' })).toBe('XX')
  })

  it('kombinacja florystyczna: licznik gatunków typowych i ostrzeżenie o dominacji łąkowych / pleustofitów', () => {
    const rows = sp(['Alnus glutinosa'], ['Carex elongata'], ['Iris pseudoacorus'], ['Urtica dioica']).species
    expect(typicalMatch(rows).present).toEqual(['Alnus glutinosa', 'Carex elongata', 'Iris pseudacorus'])
    expect(ind('characteristic').explain!(sp(['Alnus glutinosa']))).toMatch(new RegExp(`1 z ${TYPICAL_91XX.length}`))
    expect(ind('characteristic').warn!({ choice: 'typical', ...sp(['Deschampsia cespitosa', 40]) })).toMatch(/Deschampsia cespitosa/)
    expect(ind('characteristic').warn!({ choice: 'typical', ...sp(['Lemna minor', 30]) })).toMatch(/pleustofit/)
    expect(ind('characteristic').warn!({ choice: 'dominated', ...sp(['Lemna minor', 30]) })).toBeNull()
    expect(ind('characteristic').warn!({ choice: 'typical', ...sp(['Deschampsia cespitosa', 5]) })).toBeNull()
  })

  it('obce w drzewostanie: <5 FV, 5–15 U1, >15 U2, odnawianie się zawsze U2', () => {
    expect(suggest('geoAlien', sp())).toBe('FV')
    expect(suggest('geoAlien', sp(['Fraxinus pennsylvanica', 4]))).toBe('FV')
    expect(suggest('geoAlien', sp(['Fraxinus pennsylvanica', 5]))).toBe('U1')
    expect(suggest('geoAlien', sp(['Fraxinus pennsylvanica', 15]))).toBe('U1')
    expect(suggest('geoAlien', sp(['Fraxinus pennsylvanica', 16]))).toBe('U2')
    expect(suggest('geoAlien', { ...sp(['Fraxinus pennsylvanica', 1]), regenerating: 'yes' })).toBe('U2')
  })

  it('inwazyjne w runie: brak FV, 1 gatunek ≤25% U1, więcej albo >25% U2 (interpretacja)', () => {
    expect(suggest('invasive', sp())).toBe('FV')
    expect(suggest('invasive', sp(['Bidens frondosa', 5]))).toBe('U1')
    expect(suggest('invasive', sp(['Bidens frondosa', 25]))).toBe('U1')
    expect(suggest('invasive', sp(['Bidens frondosa', 30]))).toBe('U2')
    expect(suggest('invasive', sp(['Bidens frondosa', 1], ['Impatiens parviflora', 1]))).toBe('U2')
    expect(suggest('invasive', sp(['Bidens frondosa']))).toBeNull()
  })

  it('warunki wodne: ostrzeżenie przy murszu i ocenie lepszej niż U2; rowy niespójne z warunkami wodnymi', () => {
    expect(ind('water').warn!({ choice: 'slight', mursh: 'yes' })).toMatch(/murszu/)
    expect(ind('water').warn!({ choice: 'drained', mursh: 'yes' })).toBeNull()
    expect(ind('water').describe!({ choice: 'natural', level: -10 })).toMatch(/10 cm nad powierzchnią/)
    const water = { water: { inputs: { choice: 'natural' }, value: '', grade: 'FV' as const } }
    expect(ind('ditches').warn!({ choice: 'drying' }, ctx({ indicators: water }))).toMatch(/niespójna/)
    expect(ind('ditches').warn!({ choice: 'draining' }, ctx({ indicators: water }))).toBeNull()
  })

  it('powierzchnia transektu z pola „Wymiary transektu”', () => {
    expect(transectHa({ transect: '100x40 m' })).toBe(0.4)
    expect(transectHa({ transect: '40 × 100 m' })).toBe(0.4)
    expect(transectHa({ transect: '50x80' })).toBe(0.4)
    expect(transectHa({ transect: '100x20 m' })).toBe(0.2)
    expect(transectHa({ transect: '' })).toBe(0.4)
  })

  it('martwe drewno: objętość walców ze spisu, przeliczona na ha; >20 FV, 10–20 U1, <10 U2', () => {
    const pieces = deadWoodPieces(KOZI_PIECES)
    expect(pieces).toHaveLength(12)
    expect(deadWoodFromPieces(pieces, 0.4)).toEqual({ count: 12, volume: 9.78, perHa: 24.5 })
    expect(deadWoodPieces([lying(20, 10), { kind: 'lying', diameter: '' }, { diameter: 20, length: 5 }])).toHaveLength(1)
    expect(suggest('deadWood', { pieces: KOZI_PIECES }, ctx({ site: { transect: '40x100 m' } }))).toBe('FV')
    // ten sam spis na transekcie dwa razy większym: 12,2 m³/ha
    expect(suggest('deadWood', { pieces: KOZI_PIECES }, ctx({ site: { transect: '100x80 m' } }))).toBe('U1')
    expect(suggest('deadWood', { volume: 20 })).toBe('U1')
    expect(suggest('deadWood', { volume: 20.1 })).toBe('FV')
    expect(suggest('deadWood', { volume: 9.9 })).toBe('U2')
    expect(suggest('deadWood', { volume: 5, pieces: KOZI_PIECES })).toBe('U2') // wpisany wynik ma pierwszeństwo
    expect(suggest('deadWood', {})).toBeNull()
    expect(ind('deadWood').explain!({ pieces: KOZI_PIECES }, ctx({ site: { transect: '100x40 m' } }))).toBe('Ze spisu: 12 fragm., 9,78 m³ na 0,4 ha = 24,5 m³/ha.')
    expect(ind('deadWood').describe!({ pieces: KOZI_PIECES }, ctx())).toBe('24,5 m³/ha (spis 12 fragmentów z 0,4 ha)')
  })

  it('drewno wielkowymiarowe: ze spisu „Martwego drewna” (≥30 cm, ≥3 m), >5 FV, 3–5 U1, <3 U2', () => {
    const pieces = deadWoodPieces(KOZI_PIECES)
    expect(largePieces(pieces)).toHaveLength(7)
    expect(largePieces(pieces, 35)).toHaveLength(4)
    expect(largePieces(deadWoodPieces([standing(40, 2.9)]))).toHaveLength(0)
    const withList = ctx({ indicators: { deadWood: { inputs: { pieces: KOZI_PIECES }, value: '', grade: '' } } })
    expect(suggest('largeDeadWood', { minDiameter: 30 }, withList)).toBe('FV')
    expect(ind('largeDeadWood').describe!({ minDiameter: 30 }, withList)).toBe('17,5 szt./ha (7 szt. na 0,4 ha)')
    expect(suggest('largeDeadWood', { minDiameter: 38 }, withList)).toBe('U2') // 1 szt. → 2,5/ha
    expect(suggest('largeDeadWood', { perHa: 5 })).toBe('U1')
    expect(suggest('largeDeadWood', { perHa: 3 })).toBe('U1')
    expect(suggest('largeDeadWood', { perHa: 2.5 })).toBe('U2')
    expect(suggest('largeDeadWood', { perHa: 5.5 })).toBe('FV')
    expect(suggest('largeDeadWood', {})).toBeNull()
  })

  it('mikrosiedliska: kody na drzewie liczą się osobno, ten sam raz; >20 FV, 10–20 U1, <10 U2', () => {
    expect(parseMicroCodes('Os, Dz')).toEqual({ codes: ['Os', 'Dz'], unknown: [] })
    expect(parseMicroCodes('dzp; h + Dz Dz xx')).toEqual({ codes: ['DzP', 'H', 'Dz'], unknown: ['xx'] })
    const trees = koziRynek.indicators.microhabitats.inputs.trees
    expect(microFromTrees(trees, 0.4)).toEqual({ trees: 5, count: 7, perHa: 17.5, unknown: [] })
    expect(suggest('microhabitats', { trees })).toBe('U1')
    expect(suggest('microhabitats', { perHa: 20.5 })).toBe('FV')
    expect(suggest('microhabitats', { perHa: 9 })).toBe('U2')
    expect(suggest('microhabitats', { trees: [] })).toBeNull()
    expect(ind('microhabitats').warn!({ trees: [{ codes: 'Dz, Kk' }] }, ctx())).toMatch(/Nierozpoznane kody: Kk/)
  })

  it('reguła tab. 2: ostrzeżenie, gdy żaden z trzech wskaźników drewna nie ma FV', () => {
    const g = (a: Grade, b: Grade, c: Grade) =>
      ctx({
        indicators: {
          deadWood: { inputs: {}, value: '', grade: a },
          largeDeadWood: { inputs: {}, value: '', grade: b },
          microhabitats: { inputs: {}, value: '', grade: c },
        },
      })
    expect(ind('microhabitats').warn!({}, g('U1', 'U2', 'U1'))).toMatch(/Żaden z trzech/)
    expect(ind('microhabitats').warn!({}, g('U1', 'FV', 'U2'))).toBeNull()
  })
})

describe('katalog gatunków 91XX', () => {
  it('rozpoznaje synonimy i literówki z przewodnika', () => {
    expect(findSpecies91XX('Iris pseudoacorus')?.latin).toBe('Iris pseudacorus')
    expect(findSpecies91XX('Prunus serotina')?.group).toBe('invasive')
    expect(findSpecies91XX('Populus x canadensis')?.group).toBe('invasive')
    expect(findSpecies91XX('Erechtites hieraciifolia')?.latin).toBe('Erechtites hieraciifolius')
    expect(findSpecies91XX('Carex elongata')?.typical).toBe(true)
    expect(findSpecies91XX('Gatunek własny')).toBeUndefined()
  })

  it('warstwy domyślne i etykiety grup', () => {
    const layerOf = (n: string) => m.speciesCatalog!.find((c) => c.value === n)?.layer
    expect(layerOf('Alnus glutinosa')).toBe('A')
    expect(layerOf('Ribes nigrum')).toBe('B')
    expect(layerOf('Calla palustris')).toBe('C')
    expect(layerOf('Sphagnum squarrosum')).toBe('D')
    expect(m.speciesInfo!('Lemna minor')).toMatch(/pleustofit/)
  })
})

describe('przykład Kozi Rynek (karta z przewodnika)', () => {
  it('przechodzi walidację', () => {
    const r = buildCardSchema(m).safeParse(koziRynek)
    expect(r.success, JSON.stringify(r.error?.issues.slice(0, 3))).toBe(true)
  })

  it('oceny parametrów jak w karcie: wszystko FV', () => {
    const a = assessCard(m, koziRynek)
    expect(a.area).toBe('FV')
    expect(a.structure).toBe('FV')
    expect(a.overall).toBe('FV')
  })

  it('podpowiedź różni się od eksperta tylko przy mikrosiedliskach (spis daje U1, karta XX)', () => {
    const c = ctx({ site: koziRynek.site, indicators: koziRynek.indicators })
    const differs = m.indicators.filter((i) => i.suggest!(koziRynek.indicators[i.id].inputs, c) !== koziRynek.indicators[i.id].grade).map((i) => i.id)
    expect(differs).toEqual(['microhabitats'])
  })

  it('zanonimizowany wykonawca, trzy zdjęcia z olszą w warstwie A', () => {
    expect(examples91XX).toHaveLength(1)
    expect(koziRynek.site.observer).toBe('Jan Kowalski')
    expect(JSON.stringify(koziRynek)).not.toMatch(/Biere/)
    expect(koziRynek.releves).toHaveLength(3)
    for (const r of koziRynek.releves) {
      const a = (r.species as { layer: string; name: string }[]).filter((x) => x.layer === 'A')
      expect(a.map((x) => x.name)).toContain('Alnus glutinosa')
    }
  })
})
