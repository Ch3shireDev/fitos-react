import { describe, expect, it } from 'vitest'
import type { ComponentType } from 'react'
import { collectCards, type CardMeta } from './cards'
import type { Methodology } from './7120/habitats/types'

const C: ComponentType = () => null
const meta = (code: string): CardMeta => ({ methodology: { code } as Methodology, title: `t${code}`, blurb: 'b' })

describe('collectCards', () => {
  it('zbiera karty z folderów, sortuje po kodzie i pomija pliki, które nie są kartą', () => {
    const cards = collectCards(
      { './91D0/Card91D0.tsx': { Card91D0: C }, './40A0/Card40A0.tsx': { Card40A0: C }, './7120/CardHelper.tsx': { CardHelper: C } },
      { './91D0/meta.ts': meta('91D0'), './40A0/meta.ts': meta('40A0') },
    )
    expect(cards.map((c) => [c.code, c.title])).toEqual([['40A0', 't40A0'], ['91D0', 't91D0']])
  })

  it('głośno protestuje, gdy folder karty jest niekompletny', () => {
    expect(() => collectCards({ './9999/Card9999.tsx': { Card9999: C } }, {})).toThrow(/brak src\/9999\/meta.ts/)
    expect(() => collectCards({ './9999/Card9999.tsx': { Inne: C } }, { './9999/meta.ts': meta('9999') })).toThrow(/brak eksportu Card9999/)
    expect(() => collectCards({ './9999/Card9999.tsx': { Card9999: C } }, { './9999/meta.ts': meta('7120') })).toThrow(/metodykę 7120/)
  })
})
