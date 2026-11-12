import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues, habitatCode, isCardinal } from '../../7120/habitats/assessment'
import { buildCardSchema } from '../../7120/habitats/schema'
import type { InputValues } from '../../7120/habitats/types'
import { examples91I0, zimnaWoda1 } from './examples'
import { gradeCharacteristic, gradeCrownClosure, methodology91I0 as m, thermoSummary } from './methodology'
import { findSpecies91I0 } from './species'

const ind = (id: string) => {
  const i = m.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id}`)
  return i
}
const sp = (...rows: [string, number?][]) => ({ species: rows.map(([name, cover]) => ({ name, cover })) })
const ctx = (char: InputValues = { species: [] }, thermo: InputValues = { species: [] }, subtype = '91I0-1') => ({
  site: { subtype },
  indicators: {
    characteristic: { inputs: char, value: '', grade: '' as const },
    thermophilous: { inputs: thermo, value: '', grade: '' as const },
  },
})

describe('metodyka 91I0 – struktura danych', () => {
  it('siedlisko priorytetowe, transekt 200×20 m, zdjęcia 400 m²', () => {
    expect(habitatCode(m)).toBe('*91I0')
    expect(m.siteFields.find((f) => f.name === 'transect')!.defaultValue).toBe('200x20 m')
    expect(m.releves.fields.find((f) => f.name === 'area')!.defaultValue).toBe(400)
    expect(m.siteFields.find((f) => f.name === 'subtype')!.required).toBe(true)
  })

  it('16 wskaźników w kolejności z karty, 5 kardynalnych wg tab. 2', () => {
    expect(m.indicators.map((i) => i.id)).toEqual([
      'area',
      'habitatShare',
      'characteristic',
      'dominant',
      'invasive',
      'expansive',
      'thermophilous',
      'deadWood',
      'age',
      'shrubClosure',
      'crownClosure',
      'alienTrees',
      'regeneration',
      'plantings',
      'logging',
      'standDamage',
    ])
    expect(m.indicators.filter((i) => isCardinal(i, {})).map((i) => i.id)).toEqual([
      'characteristic',
      'invasive',
      'thermophilous',
      'shrubClosure',
      'crownClosure',
    ])
  })

  it('każdy wskaźnik ma pomoc i komplet progów', () => {
    for (const i of m.indicators) {
      expect(i.help, i.id).toBeTruthy()
      expect(i.thresholds.FV && i.thresholds.U1 && i.thresholds.U2, i.id).toBeTruthy()
    }
  })
})

describe('progi', () => {
  it('udział siedliska na transekcie: 80–100 / 50–80 / <50', () => {
    const s = (v: number) => ind('habitatShare').suggest!({ share: v })
    expect([s(100), s(80), s(79), s(50), s(49)]).toEqual(['FV', 'FV', 'U1', 'U1', 'U2'])
  })

  it('gatunki charakterystyczne: Quercetalia ≥5% albo ciepłolubne >10%, w 91I0-1 wymagany Molinion', () => {
    const base = { quercetaliaCount: 1, molinion: [] as string[] }
    expect(gradeCharacteristic({ ...base, quercetalia: 5, molinion: ['Betonica officinalis'] }, '91I0-1')).toBe('FV')
    expect(gradeCharacteristic({ ...base, quercetalia: 5 }, '91I0-1')).toBe('U1')
    expect(gradeCharacteristic({ ...base, quercetalia: 5 }, '91I0-2')).toBe('FV')
    expect(gradeCharacteristic({ ...base, quercetalia: 2, thermoTotal: 12 }, '91I0-2')).toBe('FV')
    expect(gradeCharacteristic({ ...base, quercetalia: 2, thermoTotal: 8 }, '91I0-2')).toBe('U1')
    expect(gradeCharacteristic({ quercetaliaCount: 0, molinion: [], thermoTotal: 0.5 }, '91I0-2')).toBe('U2')
    expect(gradeCharacteristic({ quercetaliaCount: 0, molinion: [], thermoTotal: 0.5 }, '91I0-1')).toBe('U2')
  })

  it('ciepłolubne charakterystyczne doliczają się do wskaźnika „Gatunki ciepłolubne”', () => {
    const char = sp(['Quercus petraea', 50], ['Melittis melissophyllum', 5], ['Brachypodium pinnatum', 10])
    const s = thermoSummary(char, sp(['Convallaria majalis', 8]))
    expect(s).toMatchObject({ quercetalia: 5, thermoChar: 15, thermoTotal: 23 })
    const t = ind('thermophilous')
    expect(t.suggest!(sp(['Convallaria majalis', 8]), ctx(char))).toBe('FV')
    expect(t.suggest!({ species: [] }, ctx(sp(['Melittis melissophyllum', 5])))).toBe('U1')
    expect(t.suggest!({ species: [] }, ctx(sp(['Quercus petraea', 50])))).toBe('U2')
    // gatunki ciepłolubne z drugiego wskaźnika podnoszą też ocenę charakterystycznych
    expect(ind('characteristic').suggest!(sp(['Melittis melissophyllum', 2], ['Betonica officinalis', 1]), ctx(undefined, sp(['Convallaria majalis', 20])))).toBe('FV')
  })

  it('zwarcie podszytu i koron', () => {
    const shrub = (v: number) => ind('shrubClosure').suggest!({ closure: v, species: [] })
    expect([shrub(20), shrub(21), shrub(50), shrub(51)]).toEqual(['FV', 'U1', 'U1', 'U2'])
    expect(gradeCrownClosure(60, undefined)).toBe('FV')
    expect(gradeCrownClosure(40, 'one')).toBe('U2')
    expect(gradeCrownClosure(80, 'one')).toBe('U1')
    expect(gradeCrownClosure(80, 'two')).toBe('U2')
    expect(gradeCrownClosure(80, undefined)).toBeNull()
  })

  it('leżanina: im więcej, tym gorzej; wiek: >50 / 40–50 / <40', () => {
    const dw = (v: number) => ind('deadWood').suggest!({ share: v })
    expect([dw(5), dw(10), dw(25)]).toEqual(['FV', 'U1', 'U2'])
    const age = (v: number) => ind('age').suggest!({ years: v })
    expect([age(60), age(45), age(30)]).toEqual(['FV', 'U1', 'U2'])
  })

  it('obce inwazyjne <5% U1, ekspansywne <20% U1', () => {
    expect(ind('invasive').suggest!(sp(['Padus serotina', 4]))).toBe('U1')
    expect(ind('invasive').suggest!(sp(['Padus serotina', 6]))).toBe('U2')
    expect(ind('expansive').suggest!(sp(['Calamagrostis epigejos', 15]))).toBe('U1')
    expect(ind('expansive').suggest!(sp(['Calamagrostis epigejos', 25]))).toBe('U2')
  })

  it('odnowienie: ostrzega, gdy „dębowe”, a dębu brak', () => {
    expect(ind('regeneration').warn!({ choice: 'oak', ...sp(['Carpinus betulus', 5]) })).toMatch(/nie ma dębu/)
    expect(ind('regeneration').warn!({ choice: 'oak', ...sp(['Quercus robur', 5]) })).toBeNull()
  })

  it('zniszczenia drzewostanu: procent tylko opisuje, ocena z klasy', () => {
    const d = ind('standDamage')
    expect(d.suggest!({ choice: 'noticeable', share: 80 })).toBe('U1')
    expect(d.describe!({ choice: 'noticeable', share: 30 })).toBe('Zauważalne, 30%')
  })
})

describe('przykład Zimna Woda 1 (przewodnik GIOŚ)', () => {
  const schema = buildCardSchema(m)

  it('przechodzi walidację, a pusta karta nie (brak podtypu jest zgłaszany)', () => {
    const r = schema.safeParse(zimnaWoda1)
    expect(r.success, JSON.stringify(r.error?.issues, null, 2)).toBe(true)
    const e = schema.safeParse(emptyCardValues(m))
    expect(e.error!.issues.some((i) => i.path.join('.') === 'site.subtype')).toBe(true)
  })

  it('podpowiedzi formularza zgadzają się z ocenami eksperta we wszystkich wskaźnikach', () => {
    const v = zimnaWoda1
    const diff = m.indicators
      .filter((i) => i.suggest?.(v.indicators[i.id].inputs, { site: v.site, indicators: v.indicators }) !== v.indicators[i.id].grade)
      .map((i) => i.id)
    expect(diff).toEqual([])
  })

  // Karta w przewodniku podaje strukturę FV, choć kardynalny wskaźnik „obce gatunki inwazyjne” ma U1.
  // Reguła z tab. 2 (wszystkie kardynalne FV) daje U1 – formularz trzyma się reguły.
  it('struktura U1 wg reguły z tab. 2 (inwazyjne – kardynalny – na U1), mimo FV w karcie przewodnika', () => {
    expect(assessCard(m, zimnaWoda1)).toMatchObject({ area: 'FV', structure: 'U1', prospects: 'FV', overall: 'U1', missing: [] })
  })

  it('zanonimizowany: wykonawca i autor zdjęć to Jan Kowalski, bez nazwisk autorów przewodnika', () => {
    for (const { values } of examples91I0) {
      expect(values.site.observer).toBe('Jan Kowalski')
      const text = JSON.stringify(values)
      expect(text).not.toMatch(/Kurowski|Kiedrzy|Jakubowska/)
      expect([...text.matchAll(/fot\. ([A-ZĄĆĘŁŃÓŚŹŻ]\. \S+?)\)/g)].map((x) => x[1])).toEqual(['J. Kowalski'])
    }
  })

  it('gatunki z przykładu są w katalogu', () => {
    const names = Object.values(zimnaWoda1.indicators).flatMap((x) => (x.inputs.species as { name: string }[] | undefined) ?? [])
    expect(names.filter((n) => !findSpecies91I0(n.name)).map((n) => n.name)).toEqual([])
  })
})
