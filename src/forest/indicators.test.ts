import { describe, expect, it } from 'vitest'
import type { InputValues } from '../7120/habitats/types'
import {
  alienTrees,
  choiceIndicator,
  deadWoodCount,
  deadWoodShare,
  deadWoodVolume,
  dominantSpecies,
  ecoAlienTrees,
  expansiveNatives,
  forestArea,
  forestReleveFields,
  forestSiteFields,
  geoAlienTrees,
  invasiveAliens,
  keySpecies,
  listCover,
  loggingDamage,
  measureIndicator,
  plantings,
  selectInput,
  speciesRegeneration,
  standAge,
  standDamage,
  thresholdsFromOptions,
  verticalStructure,
} from './index'

const sp = (...rows: [string, number?][]) => ({ species: rows.map(([name, cover]) => ({ name, cover })) })
const s = (ind: { suggest?: (i: InputValues) => unknown }, i: InputValues) => ind.suggest!(i)

describe('helpery', () => {
  it('listCover: pusta lista = 0, wiersze bez pokrycia = undefined', () => {
    expect(listCover({ species: [] })).toEqual({ count: 0, total: 0 })
    expect(listCover(sp(['A']))).toEqual({ count: 1, total: undefined })
    expect(listCover(sp(['A', 0.5], ['B', 2]))).toEqual({ count: 2, total: 2.5 })
  })

  it('selectInput z ocenami w opcjach podaje je w pomocy, a opcje do formularza są bez ocen', () => {
    const f = selectInput('X', [
      { value: 'a', label: 'Dobrze', grade: 'FV' },
      { value: 'b', label: 'Nie wiem', grade: 'XX' },
    ])
    expect(f.kind === 'select' && f.options).toEqual([
      { value: 'a', label: 'Dobrze' },
      { value: 'b', label: 'Nie wiem' },
    ])
    expect(f.help).toMatch(/Dobrze – FV,\n• Nie wiem – XX/)
  })

  it('progi z opcji łączą opcje o tej samej ocenie', () => {
    expect(
      thresholdsFromOptions([
        { value: 'a', label: 'A', grade: 'FV' },
        { value: 'b', label: 'B', grade: 'U1' },
        { value: 'c', label: 'C', grade: 'U1' },
        { value: 'd', label: 'D', grade: 'U2' },
      ]),
    ).toEqual({ FV: 'A', U1: 'B albo C', U2: 'D' })
  })
})

describe('klocki generyczne', () => {
  it('choiceIndicator: ocena i opis z wybranej opcji', () => {
    const ind = choiceIndicator({
      id: 'x',
      label: 'X',
      description: '',
      inputLabel: 'X?',
      options: [
        { value: 'good', label: 'Dobrze', grade: 'FV' },
        { value: 'bad', label: 'Źle', grade: 'U2' },
      ],
    })
    expect(ind.parameter).toBe('structure')
    expect(ind.suggest!({ choice: 'bad' })).toBe('U2')
    expect(ind.suggest!({})).toBeNull()
    expect(ind.describe!({ choice: 'good' })).toBe('Dobrze')
    expect(ind.thresholds).toEqual({ FV: 'Dobrze', U1: '', U2: 'Źle' })
  })

  it('measureIndicator bez opcji: liczba wymagana', () => {
    const ind = measureIndicator({
      id: 'm',
      label: 'M',
      description: '',
      thresholds: { FV: '', U1: '', U2: '' },
      field: { label: 'Wiek', unit: 'lat', help: '' },
      grade: (v) => (v > 50 ? 'FV' : v >= 40 ? 'U1' : 'U2'),
    })
    expect(ind.inputs).toHaveLength(1)
    expect(ind.inputs[0].required).toBe(true)
    expect(ind.suggest!({ value: 140 })).toBe('FV')
    expect(ind.suggest!({ value: 45 })).toBe('U1')
    expect(ind.describe!({ value: 140 })).toBe('140 lat')
  })
})

describe('presety', () => {
  it('nadpisania IndicatorDef przechodzą 1:1 (także pola spoza typu bazowego)', () => {
    const excluded = () => true
    const ind = loggingDamage({ id: 'log2', cardinal: true, help: 'H', ...({ excluded } as object) })
    expect(ind.id).toBe('log2')
    expect(ind.cardinal).toBe(true)
    expect(ind.help).toBe('H')
    expect((ind as unknown as { excluded: unknown }).excluded).toBe(excluded)
    expect(ind.suggest!({ choice: 'few' })).toBe('U1')
  })

  it('własne opcje presetu zmieniają ocenę i progi', () => {
    const ind = forestArea({
      options: [
        { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
        { value: 'other', label: 'Inne kombinacje', grade: 'U1' },
        { value: 'decline', label: 'Wyraźny spadek', grade: 'U2' },
      ],
    })
    expect(ind.parameter).toBe('area')
    expect(ind.suggest!({ choice: 'other' })).toBe('U1')
    expect(ind.thresholds.FV).toBe('Nie podlega zmianom lub zwiększa się')
  })

  it('invasiveAliens: domyślne progi 91D0 i własna funkcja', () => {
    const d = invasiveAliens()
    expect(d.cardinal).toBe(true)
    expect(s(d, sp())).toBe('FV')
    expect(s(d, sp(['Impatiens parviflora', 0.5]))).toBe('U1')
    expect(s(d, sp(['Impatiens parviflora', 0.5], ['Padus serotina', 0.5]))).toBe('U2')
    const p = invasiveAliens({ grade: ({ count, total }) => (count === 0 ? 'FV' : total === undefined ? null : total <= 5 ? 'U1' : 'U2') })
    expect(s(p, sp(['Impatiens parviflora', 1], ['Padus serotina', 0.5]))).toBe('U1')
    expect(s(p, sp(['Impatiens parviflora', 6]))).toBe('U2')
  })

  it('expansiveNatives / ecoAlienTrees / alienTrees: progi domyślne', () => {
    expect(s(expansiveNatives(), sp(['Rubus sp.', 20]))).toBe('U1')
    expect(s(expansiveNatives(), sp(['Rubus sp.', 30]))).toBe('U2')
    expect(s(ecoAlienTrees(), sp(['Fagus sylvatica', 15]))).toBe('U1')
    expect(s(alienTrees(), sp())).toBe('FV')
    expect(s(alienTrees(), sp(['Robinia pseudoacacia', 5]))).toBe('U1')
    expect(s(alienTrees(), sp(['Robinia pseudoacacia', 15]))).toBe('U2')
  })

  it('geoAlienTrees: odnawianie zawsze U2, progi konfigurowalne', () => {
    expect(s(geoAlienTrees(), { ...sp(['Picea abies', 0.5]), regenerating: 'no' })).toBe('FV')
    expect(s(geoAlienTrees(), { ...sp(['Picea abies', 0.5]), regenerating: 'yes' })).toBe('U2')
    const g = geoAlienTrees({ grade: (t) => (t < 5 ? 'FV' : 'U2') })
    expect(s(g, { ...sp(['Picea abies', 3]), regenerating: 'no' })).toBe('FV')
  })

  it('standAge: progi konfigurowalne i ostrzeżenie, gdy liczby mówią co innego', () => {
    const a = standAge({ old100: 10 })
    expect(a.thresholds.FV).toMatch(/Ponad 10%/)
    expect(s(a, { choice: 'old' })).toBe('FV')
    expect(a.warn!({ choice: 'young', share100: 15 })).toMatch(/Ponad 10%/)
  })

  it('martwe drewno: trzy warianty z różnymi id, liczba ma pierwszeństwo przed klasą', () => {
    const count = deadWoodCount({ grade: (v) => (v > 5 ? 'FV' : v >= 3 ? 'U1' : 'U2'), cardinal: true })
    const volume = deadWoodVolume()
    const share = deadWoodShare({
      grade: (v) => (v <= 5 ? 'FV' : v <= 20 ? 'U1' : 'U2'),
      thresholds: { FV: 'Do 5%', U1: '5–20%', U2: 'Powyżej 20%' },
    })
    expect(new Set([count.id, volume.id, share.id]).size).toBe(3)
    expect(s(count, { choice: 'many', perHa: 4 })).toBe('U1')
    expect(count.warn!({ choice: 'many', perHa: 4 })).toMatch(/4 szt\.\/ha/)
    expect(s(volume, { volume: 25 })).toBe('FV')
    expect(s(volume, { volume: 9 })).toBe('U2')
    expect(s(share, { share: 10 })).toBe('U1')
    expect(share.describe!({ share: 10 })).toBe('10%')
  })

  it('standDamage, plantings, keySpecies, vertical – selecty', () => {
    expect(s(standDamage(), { choice: 'radical' })).toBe('U2')
    expect(s(plantings(), { choice: 'few' })).toBe('U1')
    expect(plantings().describe!({ ...sp(['Fagus sylvatica', 5]), choice: 'few' })).toBe('Fagus sylvatica 5%')
    expect(s(keySpecies(), { choice: 'noData' })).toBe('XX')
    expect(verticalStructure().describe!({ choice: 'natural' })).toBe('Naturalna, zróżnicowana struktura')
  })

  it('speciesRegeneration: kierunek progu ustawia metodyka (buk – im więcej, tym gorzej)', () => {
    const beech = speciesRegeneration({
      id: 'beechRegen',
      label: 'Odnowienie buka',
      thresholds: { FV: '<25%', U1: '25–50%', U2: '>50%' },
      grade: ({ total }) => (total === undefined ? null : total < 25 ? 'FV' : total <= 50 ? 'U1' : 'U2'),
    })
    expect(s(beech, sp(['Fagus sylvatica', 60]))).toBe('U2')
  })

  it('dominantSpecies: ostrzega o nietypowych dominantach powyżej progu', () => {
    const d = dominantSpecies({ flag: (n) => n === 'Carpinus betulus', flagMinCover: 25 })
    expect(d.warn!({ ...sp(['Carpinus betulus', 30]), choice: 'natural' })).toMatch(/Carpinus betulus/)
    expect(d.warn!({ ...sp(['Carpinus betulus', 20]), choice: 'natural' })).toBeNull()
  })
})

describe('pola stanowiska i zdjęć', () => {
  it('forestSiteFields: transekt, okno terminu, pola dodatkowe i nadpisania', () => {
    const f = forestSiteFields({
      code: '91I0',
      transect: '200x20 m',
      releveArea: 400,
      dateWindow: [6, 8],
      extra: [{ kind: 'select', name: 'subtype', label: 'Podtyp', options: [], required: true }],
      overrides: { siteName: { placeholder: 'np. Zimna Woda 1' } },
    })
    const by = (n: string) => f.find((x) => x.name === n)!
    expect(f.map((x) => x.name).slice(0, 3)).toEqual(['siteName', 'guid', 'subtype'])
    expect(by('transect').defaultValue).toBe('200x20 m')
    expect(by('siteName').placeholder).toBe('np. Zimna Woda 1')
    expect(by('date').warn!('2025-07-14')).toBeNull()
    expect(by('date').warn!('2025-10-01')).toMatch(/czerwca–sierpnia/)
    expect(by('observer')).toBeDefined()
  })

  it('forestReleveFields: domyślna powierzchnia i podmiana pomocy', () => {
    const f = forestReleveFields({ area: 400, helps: { coverA: 'Drzewostan' } })
    expect(f.find((x) => x.name === 'area')!.defaultValue).toBe(400)
    expect(f.find((x) => x.name === 'coverA')!.help).toBe('Drzewostan')
  })
})
