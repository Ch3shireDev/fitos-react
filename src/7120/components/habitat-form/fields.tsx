import { useState, type CSSProperties, type ReactNode } from 'react'
import {
  get,
  useController,
  useFieldArray,
  useFormContext,
  useFormState,
  useWatch,
  type Control,
  type Path,
} from 'react-hook-form'
import { coverToInput, parseCover, parseNumberInput } from '../../habitats/assessment'
import {
  BB_LABELS,
  BRAUN_BLANQUET,
  GRADES,
  GRADE_LABELS,
  LAYERS,
  LAYER_LABELS,
  type CardValues,
  type CatalogOption,
  type FieldDef,
  type Grade,
  type GradeOrEmpty,
  type ReleveSpeciesRow,
  type SpeciesRow,
} from '../../habitats/types'
import { useMethodology } from './context'
import { GENERIC_HELP, LabelWithHelp, useHelpToggle } from './help'
import { AutoTextarea, DateInput } from './inputs'
import { PhotosField } from './photos'
import { SpeciesCombobox } from './SpeciesCombobox'

/** Ścieżki budujemy dynamicznie z metodyki, więc TS musi nam uwierzyć na słowo. */
export const p = (path: string) => path as Path<CardValues>
export const IMPACT_CODES_ID = 'hf-impact-codes'
export const toId = (path: string) => `hf-${path.replace(/\./g, '-')}`
const cls = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(' ')

export function useFieldError(path: string): string | undefined {
  const { control } = useFormContext<CardValues>()
  const { errors } = useFormState({ control, name: p(path) })
  const err = get(errors, path) as { message?: string; root?: { message?: string } } | undefined
  return err?.message ?? err?.root?.message
}

/**
 * Błąd pola w wierszu listy – pokazywany dopiero po dotknięciu pola albo próbie zapisu,
 * żeby świeżo dodany wiersz nie świecił na czerwono.
 */
export function useRowError(path: string): string | undefined {
  const { control, getFieldState } = useFormContext<CardValues>()
  const formState = useFormState({ control, name: p(path) })
  const { error, isTouched } = getFieldState(p(path), formState)
  return isTouched || formState.isSubmitted ? (error?.message as string | undefined) : undefined
}

export function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="hf-error" role="alert">
      {message}
    </p>
  )
}

export function GradeBadge({ grade }: { grade: GradeOrEmpty }) {
  if (!grade) return <span className="hf-grade hf-grade-none">—</span>
  return (
    <span className={`hf-grade hf-grade-${grade}`} title={GRADE_LABELS[grade]}>
      {grade}
    </span>
  )
}

/** Ramka pola: wygląda jak input, w środku kontrolka i jednostka. */
export function InputBox({
  unit,
  invalid,
  onFocusChange,
  children,
}: {
  unit?: string
  invalid?: boolean
  /** Fokus na kontrolce w środku (nie na przycisku „?”) – do pokazywania placeholdera dopiero po podniesieniu etykiety. */
  onFocusChange?: (focused: boolean) => void
  children: ReactNode
}) {
  return (
    <div
      className="hf-box"
      data-invalid={invalid ? 'true' : undefined}
      onFocus={onFocusChange && (() => onFocusChange(true))}
      onBlur={onFocusChange && (() => onFocusChange(false))}
    >
      {children}
      {unit && (
        <span className="hf-box-unit" aria-hidden="true">
          {unit}
        </span>
      )}
    </div>
  )
}

/**
 * Układ pola:
 * - `row` – jak w karcie: etykieta w lewej, szarej kolumnie, pole w prawej (na wąskim ekranie zamienia się w floating label),
 * - `float` – floating label w środku pola (do grup pól i paneli pomiarów).
 */
export type FieldLayout = 'row' | 'float'

function FieldShell({
  layout,
  id,
  label,
  unit,
  required,
  help,
  filled,
  isStatic,
  wide,
  children,
}: {
  layout: FieldLayout
  id: string
  label: string
  unit?: string
  required?: boolean
  help?: string
  filled?: boolean
  /** Etykieta nie pływa (listy, grupy pól). */
  isStatic?: boolean
  wide?: boolean
  children: ReactNode
}) {
  const { button, panel, inline } = useHelpToggle(help, label)
  const text = (
    <>
      {label}
      {unit && <span className="hf-sr-only"> ({unit})</span>}
      {required && (
        <span className="hf-req" aria-hidden="true">
          {' '}
          *
        </span>
      )}
    </>
  )
  return (
    <div
      className={cls(
        'hf-f',
        `hf-f-${layout}`,
        filled && 'hf-filled',
        isStatic && 'hf-f-static',
        help && 'hf-has-help',
        wide && 'hf-f-wide',
        inline && 'hf-help-open',
      )}
    >
      <div className="hf-f-head">
        {isStatic ? (
          <span id={`${id}-label`} className="hf-f-label">
            {text}
          </span>
        ) : (
          <label htmlFor={id} className="hf-f-label" title={label}>
            {text}
          </label>
        )}
        {button}
      </div>
      <div className="hf-f-body">
        {children}
        {panel}
      </div>
    </div>
  )
}

const isFilled = (field: FieldDef, value: unknown) =>
  field.kind === 'select' || (value !== undefined && value !== null && value !== '')

export function FieldInput({ field, path, layout = 'row' }: { field: FieldDef; path: string; layout?: FieldLayout }) {
  const { register, control } = useFormContext<CardValues>()
  const value = useWatch({ control, name: p(path) })
  const error = useFieldError(path)
  const [focused, setFocused] = useState(false)
  const id = toId(path)

  if (field.kind === 'species' || field.kind === 'releve-species' || field.kind === 'photos') {
    return (
      <FieldShell layout={layout} id={id} label={field.label} required={field.required} help={field.help} isStatic wide>
        {field.kind === 'species' ? (
          <SpeciesList path={path} labelId={`${id}-label`} />
        ) : field.kind === 'photos' ? (
          <PhotosField path={path} labelId={`${id}-label`} />
        ) : (
          <ReleveSpeciesList path={path} labelId={`${id}-label`} />
        )}
      </FieldShell>
    )
  }

  const hintId = `${id}-hint`
  const errId = `${id}-error`
  const warning = field.warn?.(value) ?? null
  const describedBy = [field.hint && hintId, error && errId].filter(Boolean).join(' ') || undefined
  const common = {
    id,
    className: 'hf-control',
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    // W floating label placeholder pojawia się dopiero, gdy etykieta już siedzi na górze –
    // inaczej oba teksty lądują w tym samym miejscu. Nie polegamy tu wyłącznie na CSS.
    placeholder: layout === 'row' || focused ? field.placeholder : undefined,
  }
  const unit = field.kind === 'number' || field.kind === 'text' ? field.unit : undefined

  let input: ReactNode
  switch (field.kind) {
    case 'textarea':
      input = <AutoTextarea name={path} rows={field.rows ?? 6} {...common} />
      break
    case 'number':
      input = <input type="text" inputMode="decimal" {...common} {...register(p(path), { setValueAs: parseNumberInput })} />
      break
    case 'select':
      input = (
        <select {...common} {...register(p(path))}>
          {!field.options.some((o) => o.value === '') && <option value="">— wybierz —</option>}
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )
      break
    case 'date':
      input = (
        <DateInput
          name={path}
          id={id}
          className="hf-control"
          invalid={Boolean(error)}
          describedBy={describedBy}
          placeholder={layout === 'row' || focused ? (field.placeholder ?? 'DD.MM.RRRR') : undefined}
        />
      )
      break
    default:
      input = <input type="text" {...common} {...register(p(path))} />
  }

  return (
    <FieldShell
      layout={layout}
      id={id}
      label={field.label}
      unit={unit}
      required={field.required}
      help={field.help}
      filled={isFilled(field, value)}
      wide={field.kind === 'textarea' || field.wide}
    >
      <InputBox unit={unit} invalid={Boolean(error)} onFocusChange={setFocused}>
        {input}
      </InputBox>
      {field.hint && (
        <p id={hintId} className="hf-hint">
          {field.hint}
        </p>
      )}
      {warning && (
        <p className="hf-warn" role="status">
          {warning}
        </p>
      )}
      <ErrorText id={errId} message={error} />
    </FieldShell>
  )
}

type RowItem = FieldDef | { group: string; fields: FieldDef[] }

/** Wiersze karty. Kolejne pola z tą samą `group` lądują w jednym wierszu (np. trzy współrzędne). */
export function FieldRows({ fields, prefix }: { fields: FieldDef[]; prefix: string }) {
  const rows: RowItem[] = []
  for (const f of fields) {
    const last = rows[rows.length - 1]
    if (f.group && last && 'fields' in last && last.group === f.group) last.fields.push(f)
    else if (f.group) rows.push({ group: f.group, fields: [f] })
    else rows.push(f)
  }
  return (
    <div className="hf-rows">
      {rows.map((r) =>
        'fields' in r ? (
          <GroupRow
            key={r.group}
            label={r.group}
            cols={r.fields[0].groupCols}
            id={toId(`${prefix}.${r.group.replace(/\W+/g, '_')}`)}
          >
            {r.fields.map((f) => (
              <FieldInput key={f.name} field={f} path={`${prefix}.${f.name}`} layout="float" />
            ))}
          </GroupRow>
        ) : (
          <FieldInput key={r.name} field={r} path={`${prefix}.${r.name}`} />
        ),
      )}
    </div>
  )
}

function GroupRow({ label, id, cols, children }: { label: string; id: string; cols?: number; children: ReactNode }) {
  return (
    <FieldShell layout="row" id={id} label={label} isStatic>
      <div
        className={cols ? 'hf-subfields hf-subfields-cols' : 'hf-subfields'}
        style={cols ? ({ '--hf-cols': cols } as CSSProperties) : undefined}
        role="group"
        aria-labelledby={`${id}-label`}
      >
        {children}
      </div>
    </FieldShell>
  )
}

// ---------- gatunki ----------

/** „wełnianka pochwowata · charakterystyczna roślina naczyniowa” albo „spoza katalogu”. */
function useSpeciesTag(name: string | undefined): string {
  const m = useMethodology()
  const n = name?.trim()
  if (!n) return ''
  const option = m.speciesCatalog?.find((o) => o.value.toLowerCase() === n.toLowerCase())
  const info = m.speciesInfo?.(n)
  const parts = [option?.label, info].filter(Boolean)
  return parts.length ? parts.join(' · ') : 'spoza katalogu (nie liczony w ocenach)'
}

/** Wyszukiwarka „dodaj gatunek” – po wyborze dopisuje wiersz i czyści się. */
function SpeciesAdder({
  id,
  catalog,
  onAdd,
}: {
  id: string
  catalog: CatalogOption[]
  onAdd: (name: string, option?: CatalogOption) => void
}) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const { button, panel } = useHelpToggle(GENERIC_HELP.speciesName, 'Dodaj gatunek')
  return (
    <div className={cls('hf-f', 'hf-f-float', 'hf-has-help', query !== '' && 'hf-filled', 'hf-adder')}>
      <div className="hf-f-head">
        <label htmlFor={id} className="hf-f-label">
          Dodaj gatunek
        </label>
        {button}
      </div>
      <div className="hf-f-body">
        <InputBox onFocusChange={setFocused}>
          <SpeciesCombobox
            id={id}
            value={query}
            onChange={setQuery}
            onSelect={(name, option) => {
              onAdd(name, option)
              setQuery('')
            }}
            catalog={catalog}
            placeholder={focused ? 'nazwa naukowa lub polska…' : undefined}
          />
        </InputBox>
        {panel}
      </div>
    </div>
  )
}

/**
 * Wiersz dodawania: wybierałka gatunku + pokrycie + „Dodaj gatunek”.
 * Wybór z listy przenosi kursor do pokrycia, Enter w pokryciu dodaje wiersz i wraca do wybierałki.
 */
function SpeciesCoverAdder({
  id,
  catalog,
  onAdd,
}: {
  id: string
  catalog: CatalogOption[]
  onAdd: (name: string, cover: number | undefined) => void
}) {
  const [name, setName] = useState('')
  const [cover, setCover] = useState('')
  const [problem, setProblem] = useState<string | null>(null)
  const coverId = `${id}-cover`
  const nameEl = () => document.getElementById(id) as HTMLInputElement | null

  const add = () => {
    const n = name.trim()
    const c = parseCover(cover)
    if (!n) return setProblem('Najpierw wybierz albo wpisz gatunek.')
    if (c !== undefined && (Number.isNaN(c) || c < 0 || c > 100))
      return setProblem('Pokrycie w %: liczba od 0 do 100 (np. 40 albo 0,5) albo <1.')
    onAdd(n, c)
    setName('')
    setCover('')
    setProblem(null)
    nameEl()?.focus()
  }

  return (
    <div className="hf-adder-row" role="group" aria-label="Dodaj gatunek">
      <span className="hf-species-cell hf-c-name">
        <label htmlFor={id} className="hf-adder-label">
          Gatunek
        </label>
        <InputBox>
          <SpeciesCombobox
            id={id}
            value={name}
            onChange={(v) => {
              setName(v)
              setProblem(null)
            }}
            onSelect={(v) => {
              setName(v)
              setProblem(null)
              document.getElementById(coverId)?.focus()
            }}
            catalog={catalog}
            placeholder="nazwa naukowa lub polska…"
            describedBy={problem ? `${id}-problem` : undefined}
          />
        </InputBox>
      </span>
      <span className="hf-species-cell hf-c-cover">
        <label htmlFor={coverId} className="hf-adder-label">
          Pokrycie
        </label>
        <InputBox unit="%">
          <input
            id={coverId}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            className="hf-control"
            placeholder="np. 40, <1"
            value={cover}
            onChange={(e) => setCover(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                add()
              }
            }}
          />
        </InputBox>
      </span>
      <button type="button" className="hf-adder-btn" onClick={add}>
        + Dodaj gatunek
      </button>
      {problem && (
        <p id={`${id}-problem`} className="hf-error hf-adder-problem" role="alert">
          {problem}
        </p>
      )}
    </div>
  )
}

/** Pole nazwy gatunku w wierszu – ten sam combobox, podpięty pod react-hook-form. */
function SpeciesNameInput({ path, label }: { path: string; label: string }) {
  const m = useMethodology()
  const { control } = useFormContext<CardValues>()
  const { field } = useController({ control, name: p(path) })
  const error = useRowError(path)
  const id = toId(path)
  return (
    <span className="hf-species-cell hf-c-name">
      <label htmlFor={id} className="hf-sr-only">
        {label}
      </label>
      <InputBox invalid={Boolean(error)}>
        <SpeciesCombobox
          id={id}
          value={(field.value as string) ?? ''}
          onChange={field.onChange}
          onSelect={(v) => field.onChange(v)}
          onBlur={field.onBlur}
          catalog={m.speciesCatalog ?? []}
          invalid={Boolean(error)}
        />
      </InputBox>
      {error && <span className="hf-error">{error}</span>}
    </span>
  )
}

function SpeciesList({ path, labelId }: { path: string; labelId: string }) {
  const m = useMethodology()
  const { control } = useFormContext<CardValues>()
  // useFieldArray nie lubi ścieżek ze słownika, więc mały trik z typem.
  const { fields, append, remove } = useFieldArray({
    control: control as unknown as Control<{ list: SpeciesRow[] }>,
    name: path as 'list',
  })
  const error = useFieldError(path)
  const id = toId(path)

  return (
    <div className="hf-list" role="group" aria-labelledby={labelId}>
      {fields.length > 0 && (
        <div className="hf-species-row hf-species-head">
          <LabelWithHelp label="Gatunek" help={GENERIC_HELP.speciesName} />
          <LabelWithHelp label="Pokrycie" help={GENERIC_HELP.speciesCover} />
        </div>
      )}
      <ul className="hf-species">
        {fields.map((row, idx) => (
          <SpeciesRowEditor key={row.id} path={`${path}.${idx}`} index={idx} onRemove={() => remove(idx)} />
        ))}
      </ul>
      <SpeciesCoverAdder id={`${id}-add`} catalog={m.speciesCatalog ?? []} onAdd={(name, cover) => append({ name, cover }, { shouldFocus: false })} />
      <ErrorText id={`${id}-error`} message={error} />
    </div>
  )
}

/**
 * Pole pokrycia: przyjmuje „40”, „0,5”, „<1”. W danych liczba (<1 -> 0,5), na ekranie to, co wpisano,
 * a po wczytaniu karty 0,5 pokazuje się z powrotem jako „<1”.
 */
function CoverInput({ path, id, invalid }: { path: string; id: string; invalid?: boolean }) {
  const { control } = useFormContext<CardValues>()
  const { field } = useController({ control, name: p(path) })
  const [text, setText] = useState(() => coverToInput(field.value))
  // wartość zmieniona z zewnątrz (wczytanie przykładu, reset) – odśwież tekst
  const parsed = parseCover(text)
  const external = field.value as number | undefined
  if (!(parsed === external || (Number.isNaN(parsed) && Number.isNaN(external)))) {
    const next = coverToInput(external)
    if (next !== text) setText(next)
  }
  return (
    <input
      id={id}
      name={field.name}
      ref={field.ref}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      className="hf-control"
      aria-invalid={invalid || undefined}
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        field.onChange(parseCover(e.target.value))
      }}
      onBlur={field.onBlur}
    />
  )
}

function SpeciesRowEditor({ path, index, onRemove }: { path: string; index: number; onRemove: () => void }) {
  const { control } = useFormContext<CardValues>()
  const name = useWatch({ control, name: p(`${path}.name`) }) as string | undefined
  const tag = useSpeciesTag(name)
  const coverError = useRowError(`${path}.cover`)
  const coverId = toId(`${path}.cover`)
  return (
    <li className="hf-species-row">
      <SpeciesNameInput path={`${path}.name`} label={`Gatunek ${index + 1}`} />
      <span className="hf-species-cell hf-c-cover">
        <label htmlFor={coverId} className="hf-sr-only">{`Pokrycie ${index + 1} (%)`}</label>
        <InputBox unit="%" invalid={Boolean(coverError)}>
          <CoverInput path={`${path}.cover`} id={coverId} invalid={Boolean(coverError)} />
        </InputBox>
        {coverError && <span className="hf-error">{coverError}</span>}
      </span>
      <span className={`hf-tag${tag.startsWith('spoza') ? ' hf-tag-unknown' : ''}`}>{tag}</span>
      <button type="button" className="hf-icon" onClick={onRemove} aria-label={`Usuń gatunek ${index + 1}`}>
        ✕
      </button>
    </li>
  )
}

// ---------- skład gatunkowy zdjęcia fitosocjologicznego ----------

function ReleveSpeciesList({ path, labelId }: { path: string; labelId: string }) {
  const m = useMethodology()
  const { control } = useFormContext<CardValues>()
  const { fields, append, remove } = useFieldArray({
    control: control as unknown as Control<{ list: ReleveSpeciesRow[] }>,
    name: path as 'list',
  })
  const id = toId(path)

  return (
    <div className="hf-list" role="group" aria-labelledby={labelId}>
      {fields.length > 0 && (
        <div className="hf-releve-row hf-species-head">
          <LabelWithHelp label="Warstwa" help={GENERIC_HELP.releveLayer} />
          <LabelWithHelp label="Gatunek" help={GENERIC_HELP.speciesName} />
          <LabelWithHelp label="Ilościowość (B-B)" help={GENERIC_HELP.releveAbundance} />
        </div>
      )}
      <ul className="hf-species">
        {fields.map((row, idx) => (
          <ReleveRowEditor key={row.id} path={`${path}.${idx}`} index={idx} onRemove={() => remove(idx)} />
        ))}
      </ul>
      <SpeciesAdder
        id={`${id}-add`}
        catalog={m.speciesCatalog ?? []}
        onAdd={(name, option) => append({ layer: option?.layer ?? 'C', name, abundance: '' })}
      />
    </div>
  )
}

function ReleveRowEditor({ path, index, onRemove }: { path: string; index: number; onRemove: () => void }) {
  const { register, control } = useFormContext<CardValues>()
  const name = useWatch({ control, name: p(`${path}.name`) }) as string | undefined
  const tag = useSpeciesTag(name)
  const layerError = useRowError(`${path}.layer`)
  const abundanceError = useRowError(`${path}.abundance`)
  const layerId = toId(`${path}.layer`)
  const abundanceId = toId(`${path}.abundance`)
  return (
    <li className="hf-releve-row">
      <span className="hf-species-cell hf-c-layer">
        <label htmlFor={layerId} className="hf-sr-only">{`Warstwa ${index + 1}`}</label>
        <InputBox invalid={Boolean(layerError)}>
          <select id={layerId} className="hf-control" aria-invalid={layerError ? true : undefined} {...register(p(`${path}.layer`))}>
            <option value="">—</option>
            {LAYERS.map((l) => (
              <option key={l} value={l} title={LAYER_LABELS[l]}>
                {l}
              </option>
            ))}
          </select>
        </InputBox>
        {layerError && <span className="hf-error">{layerError}</span>}
      </span>
      <SpeciesNameInput path={`${path}.name`} label={`Gatunek ${index + 1}`} />
      <span className="hf-species-cell hf-c-abund">
        <label htmlFor={abundanceId} className="hf-sr-only">{`Ilościowość ${index + 1}`}</label>
        <InputBox invalid={Boolean(abundanceError)}>
          <select
            id={abundanceId}
            className="hf-control"
            aria-invalid={abundanceError ? true : undefined}
            {...register(p(`${path}.abundance`))}
          >
            <option value="">—</option>
            {BRAUN_BLANQUET.map((b) => (
              <option key={b} value={b}>
                {BB_LABELS[b]}
              </option>
            ))}
          </select>
        </InputBox>
        {abundanceError && <span className="hf-error">{abundanceError}</span>}
      </span>
      <span className={`hf-tag${tag.startsWith('spoza') ? ' hf-tag-unknown' : ''}`}>{tag}</span>
      <button type="button" className="hf-icon" onClick={onRemove} aria-label={`Usuń gatunek ${index + 1}`}>
        ✕
      </button>
    </li>
  )
}

// ---------- ocena ----------

/** Kompaktowy wybór oceny do komórki tabeli: select + podpowiedź z progów. */
export function GradeSelect({ path, label, suggestion }: { path: string; label: string; suggestion?: Grade | null }) {
  const { register, control, setValue } = useFormContext<CardValues>()
  const grade = (useWatch({ control, name: p(path) }) ?? '') as GradeOrEmpty
  const error = useFieldError(path)
  const id = toId(path)
  const differs = Boolean(suggestion && grade && grade !== suggestion)

  return (
    <div className="hf-grade-select">
      <label htmlFor={id} className="hf-sr-only">
        {label}
      </label>
      <InputBox invalid={Boolean(error)}>
        <select
          id={id}
          className={`hf-control hf-grade-control hf-grade-${grade || 'none'}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...register(p(path))}
        >
          <option value="">—</option>
          {GRADES.map((g) => (
            <option key={g} value={g} title={GRADE_LABELS[g]}>
              {g}
            </option>
          ))}
        </select>
      </InputBox>
      {suggestion && grade !== suggestion && (
        <button
          type="button"
          className="hf-link hf-small"
          onClick={() => setValue(p(path), suggestion, { shouldValidate: true, shouldDirty: true })}
        >
          Przyjmij {suggestion}
        </button>
      )}
      {suggestion && grade === suggestion && <span className="hf-ok">✓ zgodnie z progami</span>}
      {differs && (
        <p className="hf-warn hf-small" role="status">
          Ocena {grade} odbiega od progów ({suggestion}) – uzasadnij w opisie.
        </p>
      )}
      <ErrorText id={`${id}-error`} message={error} />
    </div>
  )
}
