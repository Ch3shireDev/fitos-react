// Przeszukiwalny wybór gatunku: nazwa naukowa + polska, z możliwością dodania własnej pozycji.
// Wzorzec ARIA „combobox z listbox”, bez zewnętrznych bibliotek.
import { useMemo, useState, type KeyboardEvent } from 'react'
import type { CatalogOption } from '../../habitats/types'

const MAX_RESULTS = 40

/** Małe litery, bez polskich znaków i diakrytyków – „żurawina” znajdzie się po „zurawina”. */
export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

/**
 * Każde słowo zapytania musi być początkiem któregoś słowa w nazwie naukowej lub polskiej.
 * Dzięki temu „sph fal”, „s fallax” i „torfowiec konczysty” trafiają w Sphagnum fallax.
 */
export function filterCatalog(catalog: CatalogOption[], query: string): CatalogOption[] {
  const tokens = normalizeText(query).split(/[\s.]+/).filter(Boolean)
  if (tokens.length === 0) return catalog.slice(0, MAX_RESULTS)
  const scored = catalog
    .map((o) => {
      const words = normalizeText(`${o.value} ${o.label}`).split(/[\s.\-()]+/).filter(Boolean)
      const ok = tokens.every((t) => words.some((w) => w.startsWith(t)))
      if (!ok) return null
      // Trafienia od początku nazwy naukowej wyżej.
      const score = normalizeText(o.value).startsWith(tokens[0]) ? 0 : normalizeText(o.label).startsWith(tokens[0]) ? 1 : 2
      return { o, score }
    })
    .filter((x): x is { o: CatalogOption; score: number } => x !== null)
  return scored
    .sort((a, b) => a.score - b.score)
    .slice(0, MAX_RESULTS)
    .map((x) => x.o)
}

type Item = { kind: 'option'; option: CatalogOption } | { kind: 'custom'; value: string }

interface Props {
  id: string
  value: string
  /** Zmiana tekstu podczas pisania. */
  onChange: (value: string) => void
  /** Wybór pozycji z listy albo „Dodaj własny”. */
  onSelect: (value: string, option?: CatalogOption) => void
  onBlur?: () => void
  catalog: CatalogOption[]
  placeholder?: string
  invalid?: boolean
  describedBy?: string
}

export function SpeciesCombobox({ id, value, onChange, onSelect, onBlur, catalog, placeholder, invalid, describedBy }: Props) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const listId = `${id}-listbox`

  const items: Item[] = useMemo(() => {
    const matches = filterCatalog(catalog, value)
    const q = value.trim()
    const exact = catalog.some((o) => normalizeText(o.value) === normalizeText(q) || (o.label && normalizeText(o.label) === normalizeText(q)))
    return [
      ...matches.map((option): Item => ({ kind: 'option', option })),
      ...(q && !exact ? [{ kind: 'custom', value: q } as Item] : []),
    ]
  }, [catalog, value])

  const choose = (item: Item | undefined) => {
    if (!item) return
    if (item.kind === 'option') onSelect(item.option.value, item.option)
    else onSelect(item.value)
    setOpen(false)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!open) {
          setOpen(true)
          setActive(0)
        } else setActive((a) => Math.min(a + 1, items.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActive((a) => Math.max(a - 1, 0))
        break
      case 'Enter':
        // Enter w tym polu nigdy nie wysyła formularza.
        e.preventDefault()
        if (open) choose(items[active])
        else setOpen(true)
        break
      case 'Escape':
        if (open) {
          e.preventDefault()
          setOpen(false)
        }
        break
    }
  }

  const optionId = (i: number) => `${id}-opt-${i}`
  const showList = open && items.length > 0

  return (
    <div className="hf-combo">
      <input
        id={id}
        type="text"
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList ? optionId(active) : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setActive(0)
        }}
        onClick={() => setOpen(true)}
        onKeyDown={onKeyDown}
        onBlur={() => {
          setOpen(false)
          onBlur?.()
        }}
      />
      {showList && (
        <ul id={listId} role="listbox" className="hf-combo-list">
          {items.map((item, i) => (
            <li
              key={item.kind === 'option' ? item.option.value : `custom-${item.value}`}
              id={optionId(i)}
              role="option"
              aria-selected={i === active}
              className={`hf-combo-option${i === active ? ' hf-combo-active' : ''}${item.kind === 'custom' ? ' hf-combo-custom' : ''}`}
              // mousedown zamiast click, żeby blur inputa nie zamknął listy przed wyborem
              onMouseDown={(e) => {
                e.preventDefault()
                choose(item)
              }}
              onMouseEnter={() => setActive(i)}
            >
              {item.kind === 'option' ? (
                <>
                  <i>{item.option.value}</i>
                  {item.option.label && <span className="hf-combo-pl"> – {item.option.label}</span>}
                </>
              ) : (
                <>Dodaj własny: „{item.value}”</>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
