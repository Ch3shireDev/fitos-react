import { describe, expect, it } from 'vitest'
import { assessCard, emptyCardValues } from '../assessment'
import { buildCardSchema } from '../schema'
import type { Grade, InputValues } from '../types'
import { examples7120, reptowo2, reptowoIV } from './examples'
import { methodology7120 as m } from './methodology'
import { classify, findSpecies } from './species'

const suggest = (id: string, inputs: InputValues): Grade | null => {
  const ind = m.indicators.find((i) => i.id === id)
  if (!ind?.suggest) throw new Error(`Brak wskaźnika ${id}`)
  return ind.suggest(inputs)
}

describe('metodyka 7120 – struktura danych', () => {
  it('ma 11 wskaźników, w tym 3 kardynalne z przewodnika', () => {
    expect(m.indicators).toHaveLength(11)
    expect(m.indicators.filter((i) => i.cardinal).map((i) => i.id)).toEqual([
      'characteristic',
      'mosses',
      'expansive',
    ])
  })

  it('wskaźniki idą w kolejności z karty obserwacji', () => {
    expect(m.indicators.map((i) => i.label)).toEqual([
      'Powierzchnia siedliska na stanowisku',
      'Gatunki charakterystyczne torfowisk wysokich',
      'Gatunki dominujące',
      'Pokrycie i struktura gatunkowa mchów',
      'Obce gatunki inwazyjne',
      'Gatunki ekspansywne roślin zielnych',
      'Obecność krzewów i podrostu drzew',
      'Udział dobrze wykształconych płatów siedliska',
      'Stopień uwodnienia',
      'Pozyskanie torfu',
      'Melioracje odwadniające',
    ])
  })
})

describe('słownik gatunków', () => {
  it('rozpoznaje skróty i polskie nazwy', () => {
    expect(findSpecies('S. fallax')?.latin).toBe('Sphagnum fallax')
    expect(findSpecies('wełnianka pochwowata')?.latin).toBe('Eriophorum vaginatum')
    expect(findSpecies('Cladonia spp.')?.latin).toBe('Cladonia spp.')
    expect(findSpecies('Cladonia')?.latin).toBe('Cladonia spp.')
  })

  it('S. fimbriatum to torfowiec, ale nie charakterystyczny', () => {
    const c = classify([{ name: 'Sphagnum fimbriatum', cover: 1 }])
    expect(c.charSphagnum).toEqual([])
  })
})

describe('podpowiedzi ocen wg tab. 2', () => {
  it('gatunki charakterystyczne', () => {
    const sp = (...names: string[]) => ({ species: names.map((name) => ({ name, cover: 1 })) })
    expect(suggest('characteristic', sp('S. magellanicum', 'S. fallax', 'Andromeda polifolia', 'Drosera rotundifolia'))).toBe('FV')
    expect(suggest('characteristic', sp('S. fallax', 'Eriophorum vaginatum'))).toBe('U1')
    expect(suggest('characteristic', sp('Eriophorum vaginatum', 'Oxycoccus palustris'))).toBe('U2')
    expect(suggest('characteristic', { species: [] })).toBeNull()
  })

  it('gatunki dominujące – udział wysokotorfowiskowych', () => {
    const dom = (peat: number, other: number) => ({
      species: [
        { name: 'Eriophorum vaginatum', cover: peat },
        { name: 'Molinia caerulea', cover: other },
      ],
    })
    expect(suggest('dominant', dom(50, 50))).toBe('FV')
    expect(suggest('dominant', dom(20, 80))).toBe('U1')
    expect(suggest('dominant', dom(10, 90))).toBe('U2')
  })

  it('mchy', () => {
    expect(suggest('mosses', { mossCover: 60, hummockShare: 30 })).toBe('FV')
    expect(suggest('mosses', { mossCover: 20, hummockShare: 90 })).toBe('U1') // przykład z przewodnika
    expect(suggest('mosses', { mossCover: 60, hummockShare: 10 })).toBe('U1')
    expect(suggest('mosses', { mossCover: 19, hummockShare: 90 })).toBe('U2')
    expect(suggest('mosses', { mossCover: 80, hummockShare: 0 })).toBe('U2')
    expect(suggest('mosses', { mossCover: 80 })).toBeNull()
  })

  it('inwazyjne, ekspansywne, krzewy, płaty', () => {
    expect(suggest('invasive', { cover: 0.5 })).toBe('FV')
    expect(suggest('invasive', { cover: 20 })).toBe('U1')
    expect(suggest('invasive', { cover: 21 })).toBe('U2')
    expect(suggest('expansive', { cover: 55 })).toBe('U1')
    expect(suggest('woody', { cover: 10 })).toBe('FV')
    expect(suggest('woody', { cover: 30 })).toBe('U1')
    expect(suggest('woody', { cover: 31 })).toBe('U2')
    expect(suggest('wellDeveloped', { share: 25 })).toBe('FV')
    expect(suggest('wellDeveloped', { share: 10 })).toBe('U1')
    expect(suggest('wellDeveloped', { share: 0 })).toBe('U2')
  })

  it('uwodnienie liczy średnią z pomiarów', () => {
    expect(suggest('hydration', { depth1: 0, depth2: 10, depth3: 20 })).toBe('FV')
    expect(suggest('hydration', { depth1: 30, depth2: 40 })).toBe('U1')
    expect(suggest('hydration', { depth1: 10, depth2: 90 })).toBe('U2')
    expect(suggest('hydration', {})).toBeNull()
  })

  it('selekty: powierzchnia, torf, melioracje', () => {
    expect(suggest('area', { trend: 'toward7110' })).toBe('FV')
    expect(suggest('area', { trend: 'stable' })).toBe('U1')
    expect(suggest('peat', { timing: 'recent' })).toBe('U2')
    expect(suggest('drainage', { state: 'weak' })).toBe('U1')
  })

  it('ostrzega, że >50% drzew to już bór bagienny', () => {
    const woody = m.indicators.find((i) => i.id === 'woody')!
    expect(woody.warn?.({ cover: 55 })).toMatch(/91D0/)
    expect(woody.warn?.({ cover: 20 })).toBeNull()
  })
})

describe('schemat', () => {
  const schema = buildCardSchema(m)

  it.each(examples7120)('przykład $label przechodzi walidację', ({ values }) => {
    const r = schema.safeParse(values)
    expect(r.success, JSON.stringify(r.error?.issues, null, 2)).toBe(true)
  })

  it('pusta karta nie przechodzi i mówi po polsku, czego brakuje', () => {
    const r = schema.safeParse(emptyCardValues(m))
    expect(r.success).toBe(false)
    const messages = r.error!.issues.map((i) => i.message)
    expect(messages).toContain('To pole jest wymagane')
    expect(messages).toContain('Wybierz ocenę (FV, U1, U2 albo XX)')
  })
})

describe('przykłady z karty docx', () => {
  it.each([
    ['Reptowo 2', reptowo2],
    ['Reptowo IV', reptowoIV],
  ])('%s: wyliczona ocena zgadza się z kartą (struktura U2, ogólna U2)', (_, values) => {
    const a = assessCard(m, values)
    expect(a.missing).toEqual([])
    expect(a.area).toBe('FV')
    expect(a.structure).toBe('U2')
    expect(a.overall).toBe('U2')
  })

  it('ekspert odbiega od progów dokładnie tam, gdzie się spodziewamy', () => {
    const overrides = (values: typeof reptowo2) =>
      m.indicators
        .filter((i) => {
          const s = i.suggest?.(values.indicators[i.id].inputs)
          return s && s !== values.indicators[i.id].grade
        })
        .map((i) => i.id)
    // Powierzchnia „nie ulega zmianom” to wg przewodnika U1, autorka karty dała FV.
    expect(overrides(reptowo2)).toEqual(['area'])
    // Reptowo IV: dodatkowo torf wydobywany przed wojną oceniony na FV (progi mówią U1).
    expect(overrides(reptowoIV)).toEqual(['area', 'peat'])
  })
})

describe('pomoc i katalog', () => {
  it('każde pole stanowiska, zdjęcia i pozostałych informacji ma szerokie wyjaśnienie', () => {
    const fields = [...m.siteFields, ...m.releves.fields, ...m.otherFields, ...m.indicators.flatMap((i) => i.inputs)]
    const missing = fields.filter((f) => !f.help || f.help.length < 60).map((f) => f.name)
    expect(missing).toEqual([])
    expect(m.indicators.filter((i) => !i.help).map((i) => i.id)).toEqual([])
  })

  it('przykłady są zanonimizowane', () => {
    for (const { values } of examples7120) {
      expect(values.site.observer).toBe('Jan Kowalski')
      expect((values.other.photos as { caption: string }[])[0].caption).toMatch(/\(fot\. J\. Kowalski\)$/)
    }
  })

  it('katalog ma nazwy polskie i domyślne warstwy', () => {
    const cat = m.speciesCatalog!
    expect(cat.find((o) => o.value === 'Sphagnum fallax')).toMatchObject({ label: 'torfowiec kończysty', layer: 'D' })
    expect(cat.find((o) => o.value === 'Betula pubescens')?.layer).toBe('B')
    expect(cat.find((o) => o.value === 'Calluna vulgaris')?.layer).toBe('C')
    expect(cat.find((o) => o.value === 'Pleurozium schreberi')?.layer).toBe('D')
  })
})
