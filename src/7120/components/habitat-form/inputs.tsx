// Kontrolki wspólne: pole tekstowe, które rośnie z treścią, i data wpisywana po polsku (DD.MM.RRRR).
import { useCallback, useLayoutEffect, useRef, type TextareaHTMLAttributes } from 'react'
import { useController, useFormContext, useWatch } from 'react-hook-form'
import { autoDots, isIsoDate, isoToPl, plToIso } from '../../habitats/dates'
import type { CardValues } from '../../habitats/types'
import { p } from './fields'

function fit(el: HTMLTextAreaElement | null) {
  if (!el) return
  el.style.height = 'auto'
  // +2 px na ramkę – inaczej pojawia się pasek przewijania o jeden piksel
  el.style.height = `${el.scrollHeight + 2}px`
}

/**
 * Textarea podpięta pod formularz: zaczyna od `rows` linii i rośnie razem z tekstem, także po wczytaniu przykładu.
 * Użytkownik może ją dodatkowo rozciągnąć ręcznie.
 */
export function AutoTextarea({
  name,
  rows = 5,
  ...rest
}: { name: string; rows?: number } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name' | 'rows'>) {
  const { register, control } = useFormContext<CardValues>()
  const value = useWatch({ control, name: p(name) })
  const el = useRef<HTMLTextAreaElement | null>(null)
  const reg = register(p(name))
  const { ref: regRef } = reg
  const setRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      el.current = node
      regRef(node)
    },
    [regRef],
  )
  useLayoutEffect(() => fit(el.current), [value])
  return (
    <textarea
      rows={rows}
      {...rest}
      {...reg}
      ref={setRef}
      onInput={(e) => fit(e.currentTarget)}
    />
  )
}

/**
 * Data: tekst „DD.MM.RRRR” z automatycznymi kropkami + przycisk kalendarza (natywny wybierak).
 * W danych zostaje ISO; dopóki tekst nie jest pełną datą, w danych siedzi surowy tekst i walidacja zgłasza błąd.
 */
export function DateInput({
  name,
  id,
  className,
  describedBy,
  invalid,
  placeholder,
}: {
  name: string
  id: string
  className?: string
  describedBy?: string
  invalid?: boolean
  placeholder?: string
}) {
  const { control } = useFormContext<CardValues>()
  const { field } = useController({ control, name: p(name) })
  const picker = useRef<HTMLInputElement>(null)
  const shown = isoToPl(field.value)

  return (
    <>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        maxLength={10}
        className={className}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        name={field.name}
        ref={field.ref}
        value={shown}
        onBlur={field.onBlur}
        onChange={(e) => {
          const text = autoDots(e.target.value, shown)
          field.onChange(plToIso(text) ?? text)
        }}
      />
      <button
        type="button"
        className="hf-date-btn"
        aria-label="Wybierz datę z kalendarza"
        title="Kalendarz"
        onClick={() => {
          const el = picker.current
          if (!el) return
          try {
            el.showPicker()
          } catch {
            el.focus()
            el.click()
          }
        }}
      >
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
          <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" fill="none" stroke="currentColor" />
          <path d="M1.5 6h13M5 1v3M11 1v3" stroke="currentColor" fill="none" />
        </svg>
      </button>
      <input
        ref={picker}
        type="date"
        className="hf-date-native"
        tabIndex={-1}
        aria-hidden="true"
        value={isIsoDate(field.value) ? field.value : ''}
        onChange={(e) => field.onChange(e.target.value)}
      />
    </>
  )
}
