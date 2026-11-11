import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { assessCard, emptyReleve } from '../../habitats/assessment'
import type { CardValues } from '../../habitats/types'
import { useMethodology } from './context'
import { ErrorText, FieldRows, GradeBadge, IMPACT_CODES_ID, InputBox, p, toId, useFieldError } from './fields'
import { GENERIC_HELP, useHelpToggle } from './help'
import { AutoTextarea } from './inputs'

export function toRoman(n: number): string {
  const map: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let out = ''
  for (const [v, s] of map) while (n >= v) ((out += s), (n -= v))
  return out
}

export function SiteSection() {
  const m = useMethodology()
  return (
    <div className="hf-rows">
      <div className="hf-f hf-f-row hf-f-static hf-filled">
        <div className="hf-f-head">
          <span className="hf-f-label">Kod i nazwa siedliska przyrodniczego</span>
        </div>
        <div className="hf-f-body hf-fixed">
          <strong>{m.code}</strong> {m.name}
        </div>
      </div>
      <FieldRows fields={m.siteFields} prefix="site" />
    </div>
  )
}

export function OtherSection() {
  const m = useMethodology()
  return <FieldRows fields={m.otherFields} prefix="other" />
}

export function RelevesSection() {
  const m = useMethodology()
  const { control } = useFormContext<CardValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'releves' })
  const recommended = m.releves.defaultCount

  return (
    <>
      <p className="hf-intro">{m.releves.intro}</p>
      {fields.length < recommended && (
        <p className="hf-warn" role="status">
          {fields.length === 0 ? 'Brak zdjęć fitosocjologicznych.' : `Zdjęć: ${fields.length}.`} Metodyka przewiduje{' '}
          {recommended} (początek, środek i koniec transektu).
        </p>
      )}
      {fields.map((row, i) => (
        <fieldset key={row.id} className="hf-card-block">
          <legend className="hf-bar hf-bar-sub">
            Zdjęcie fitosocjologiczne {toRoman(i + 1)}
            <button type="button" className="hf-bar-action" onClick={() => remove(i)}>
              Usuń zdjęcie {toRoman(i + 1)}
            </button>
          </legend>
          <FieldRows fields={m.releves.fields} prefix={`releves.${i}`} />
        </fieldset>
      ))}
      <button type="button" className="hf-secondary hf-add" onClick={() => append(emptyReleve(m))}>
        + Dodaj zdjęcie fitosocjologiczne
      </button>
    </>
  )
}

// ---------- tabele oddziaływań i zagrożeń ----------

function HeadCell({ label, help }: { label: string; help?: string }) {
  const { button, panel } = useHelpToggle(help, label)
  return (
    <th scope="col">
      <span className="hf-label-row">
        {label}
        {button}
      </span>
      {panel}
    </th>
  )
}

function CellInput({
  path,
  label,
  multiline,
  list,
  onBlur,
}: {
  path: string
  label: string
  multiline?: boolean
  list?: string
  onBlur?: () => void
}) {
  const { register } = useFormContext<CardValues>()
  const error = useFieldError(path)
  const id = toId(path)
  const reg = register(p(path), onBlur ? { onBlur } : undefined)
  return (
    <>
      <label htmlFor={id} className="hf-sr-only">
        {label}
      </label>
      <InputBox invalid={Boolean(error)}>
        {multiline ? (
          <AutoTextarea name={path} id={id} rows={5} className="hf-control" aria-invalid={error ? true : undefined} />
        ) : (
          <input id={id} type="text" list={list} className="hf-control" aria-invalid={error ? true : undefined} {...reg} />
        )}
      </InputBox>
      <ErrorText id={`${id}-error`} message={error} />
    </>
  )
}

function CellSelect({ path, label, options }: { path: string; label: string; options: [string, string][] }) {
  const { register } = useFormContext<CardValues>()
  const error = useFieldError(path)
  const id = toId(path)
  return (
    <>
      <label htmlFor={id} className="hf-sr-only">
        {label}
      </label>
      <InputBox invalid={Boolean(error)}>
        <select id={id} className="hf-control" aria-invalid={error ? true : undefined} {...register(p(path))}>
          <option value="">—</option>
          {options.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </InputBox>
      <ErrorText id={`${id}-error`} message={error} />
    </>
  )
}

function useFillName() {
  const m = useMethodology()
  const { setValue, getValues } = useFormContext<CardValues>()
  /** Po wpisaniu znanego kodu uzupełnia nazwę, jeśli pusta. */
  return (prefix: string) => {
    const code = String(getValues(p(`${prefix}.code`)) ?? '').trim()
    const known = m.impactCodes.find((c) => c.code === code)
    if (known && !getValues(p(`${prefix}.name`))) setValue(p(`${prefix}.name`), known.name, { shouldValidate: true })
  }
}

export function ImpactsSection() {
  const { control } = useFormContext<CardValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'impacts' })
  const fillName = useFillName()

  return (
    <>
      <div className="hf-table-wrap">
        <table className="hf-grid-table hf-impacts">
          <thead>
            <tr>
              <HeadCell label="Kod" help={GENERIC_HELP.impactCode} />
              <HeadCell label="Nazwa" help={GENERIC_HELP.impactName} />
              <HeadCell label="Wpływ" help={GENERIC_HELP.influence} />
              <HeadCell label="Intensywność" help={GENERIC_HELP.intensity} />
              <HeadCell label="Opis" help={GENERIC_HELP.impactDescription} />
              <th scope="col">
                <span className="hf-sr-only">Akcje</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {fields.map((row, i) => {
              const prefix = `impacts.${i}`
              const n = i + 1
              return (
                <tr key={row.id}>
                  <td data-label="Kod" className="hf-c-code">
                    <CellInput path={`${prefix}.code`} label={`Kod oddziaływania ${n}`} list={IMPACT_CODES_ID} onBlur={() => fillName(prefix)} />
                  </td>
                  <td data-label="Nazwa">
                    <CellInput path={`${prefix}.name`} label={`Nazwa oddziaływania ${n}`} />
                  </td>
                  <td data-label="Wpływ" className="hf-c-narrow">
                    <CellSelect path={`${prefix}.influence`} label={`Wpływ oddziaływania ${n}`} options={[['-', '−'], ['0', '0'], ['+', '+']]} />
                  </td>
                  <td data-label="Intensywność" className="hf-c-narrow">
                    <CellSelect
                      path={`${prefix}.intensity`}
                      label={`Intensywność oddziaływania ${n}`}
                      options={[['H', 'H'], ['M', 'M'], ['L', 'L']]}
                    />
                  </td>
                  <td data-label="Opis" className="hf-c-desc">
                    <CellInput path={`${prefix}.description`} label={`Opis oddziaływania ${n}`} multiline />
                  </td>
                  <td className="hf-c-actions">
                    <button type="button" className="hf-icon" onClick={() => remove(i)} aria-label={`Usuń oddziaływanie ${n}`}>
                      ✕
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {fields.length === 0 && <p className="hf-hint">Brak oddziaływań. Na torfowisku zdegradowanym? Podejrzane.</p>}
      <button
        type="button"
        className="hf-secondary hf-add"
        onClick={() => append({ code: '', name: '', influence: '-', intensity: '', description: '' })}
      >
        + Dodaj oddziaływanie
      </button>
    </>
  )
}

export function ThreatsSection() {
  const { control } = useFormContext<CardValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'threats' })
  const fillName = useFillName()

  return (
    <>
      <div className="hf-table-wrap">
        <table className="hf-grid-table hf-threats">
          <thead>
            <tr>
              <HeadCell label="Kod" help={GENERIC_HELP.threatCode} />
              <HeadCell label="Nazwa" help={GENERIC_HELP.impactName} />
              <HeadCell label="Opis" help={GENERIC_HELP.threatDescription} />
              <th scope="col">
                <span className="hf-sr-only">Akcje</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {fields.map((row, i) => {
              const prefix = `threats.${i}`
              const n = i + 1
              return (
                <tr key={row.id}>
                  <td data-label="Kod" className="hf-c-code">
                    <CellInput path={`${prefix}.code`} label={`Kod zagrożenia ${n}`} list={IMPACT_CODES_ID} onBlur={() => fillName(prefix)} />
                  </td>
                  <td data-label="Nazwa">
                    <CellInput path={`${prefix}.name`} label={`Nazwa zagrożenia ${n}`} />
                  </td>
                  <td data-label="Opis" className="hf-c-desc">
                    <CellInput path={`${prefix}.description`} label={`Opis zagrożenia ${n}`} multiline />
                  </td>
                  <td className="hf-c-actions">
                    <button type="button" className="hf-icon" onClick={() => remove(i)} aria-label={`Usuń zagrożenie ${n}`}>
                      ✕
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <button type="button" className="hf-secondary hf-add" onClick={() => append({ code: '', name: '', description: '' })}>
        + Dodaj zagrożenie
      </button>
    </>
  )
}

export function SavedResult({ values, fileName, onDownload }: { values: CardValues; fileName: string; onDownload: () => void }) {
  const m = useMethodology()
  const a = assessCard(m, values)
  // Podgląd bez base64 zdjęć – inaczej to ściana znaków.
  const json = JSON.stringify(
    { habitat: m.code, ...values, assessment: a },
    (k, v) => (k === 'dataUrl' && typeof v === 'string' ? `[zdjęcie, ${Math.round((v.length * 3) / 4 / 1024)} kB]` : v),
    2,
  )
  return (
    <section className="hf-saved" role="status" aria-live="polite">
      <p>
        Karta zapisana do pliku <strong>{fileName}</strong>. Ocena ogólna: <GradeBadge grade={a.overall} />
      </p>
      <p className="hf-hint">W archiwum: karta.json (dane) i folder zdjecia/. Ten plik wczytasz z powrotem przyciskiem „Wczytaj z pliku”.</p>
      <button type="button" className="hf-secondary" onClick={onDownload}>
        Pobierz ponownie (.zip)
      </button>
      <details>
        <summary>Podgląd danych</summary>
        <pre>{json}</pre>
      </details>
    </section>
  )
}

/** Podgląd liczby oddziaływań w tytule zakładki itp. */
export function useCount(name: 'impacts' | 'threats' | 'releves'): number {
  const { control } = useFormContext<CardValues>()
  const v = useWatch({ control, name })
  return Array.isArray(v) ? v.length : 0
}
