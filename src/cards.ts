// Rejestr kart siedlisk. Nic tu nie dopisujesz: karta to folder src/<KOD>/ z dwoma plikami
//   Card<KOD>.tsx – eksport `Card<KOD>` (komponent formularza),
//   meta.ts       – eksport `meta` (metodyka + tytuł i opis kafelka na stronie głównej).
// Vite zbiera je przy budowaniu (import.meta.glob), więc trasa i kafelek pojawiają się same.
import type { ComponentType } from 'react'
import type { Methodology } from './7120/habitats/types'

export interface CardMeta {
  methodology: Methodology
  /** Tytuł kafelka, np. „Torfowiska wysokie zdegradowane”. */
  title: string
  /** Jedno-dwa zdania pod tytułem. */
  blurb: string
}

export interface CardEntry extends CardMeta {
  code: string
  Component: ComponentType
}

// Testy (Card7120.test.tsx) też zaczynają się od „Card”, więc wycinamy je wzorcem i regexem niżej.
const components = import.meta.glob<Record<string, ComponentType | undefined>>(['./*/Card*.tsx', '!./*/*.test.tsx'], {
  eager: true,
})
const metas = import.meta.glob<CardMeta>('./*/meta.ts', { eager: true, import: 'meta' })

/** Pełna lista kart, posortowana po kodzie. Rzuca przy starcie, jeśli folder karty jest niekompletny. */
export function collectCards(
  componentModules: Record<string, Record<string, ComponentType | undefined>>,
  metaModules: Record<string, CardMeta>,
): CardEntry[] {
  const cards: CardEntry[] = []
  for (const [path, mod] of Object.entries(componentModules)) {
    const code = /^\.\/([^/]+)\/Card\1\.tsx$/.exec(path)?.[1]
    if (!code) continue // np. src/7120/CardHelper.tsx – nie jest kartą
    const Component = mod[`Card${code}`]
    if (!Component) throw new Error(`${path}: brak eksportu Card${code}`)
    const meta = metaModules[`./${code}/meta.ts`]
    if (!meta) throw new Error(`Karta ${code}: brak src/${code}/meta.ts z eksportem meta`)
    if (meta.methodology.code !== code) {
      throw new Error(`Karta ${code}: meta.ts wskazuje metodykę ${meta.methodology.code}`)
    }
    cards.push({ ...meta, code, Component })
  }
  return cards.sort((a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0))
}

export const CARDS: CardEntry[] = collectCards(components, metas)
