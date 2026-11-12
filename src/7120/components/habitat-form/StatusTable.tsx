// „Stan ochrony siedliska przyrodniczego na stanowisku” – tabela 1:1 z kartą obserwacji:
// Wiersz-nagłówek „Parametr: …”, pod nim: Wskaźnik | Wartość lub opis | Ocena (wskaźnika i parametru obok siebie).
import { useState, type ReactNode } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { assessCard, isCardinal, isExcluded } from '../../habitats/assessment'
import type { CardValues, IndicatorDef, InputValues } from '../../habitats/types'
import { useMethodology } from './context'
import { ErrorText, FieldInput, GradeBadge, GradeSelect, p, toId, useFieldError } from './fields'
import { GENERIC_HELP, useHelpToggle } from './help'
import { AutoTextarea } from './inputs'

const shorten = (s: string, max = 60) => (s.length > max ? `${s.slice(0, max)}…` : s)

export function Thresholds({ thresholds }: { thresholds: Record<'FV' | 'U1' | 'U2', string> }) {
  return (
    <dl className="hf-thresholds">
      {(['FV', 'U1', 'U2'] as const).map((g) => (
        <div key={g} className="hf-threshold">
          <dt>
            <GradeBadge grade={g} />
          </dt>
          <dd>{thresholds[g]}</dd>
        </div>
      ))}
    </dl>
  )
}

function TextCell({ path, label, rows = 5 }: { path: string; label: string; rows?: number }) {
  const error = useFieldError(path)
  const id = toId(path)
  return (
    <>
      <label htmlFor={id} className="hf-sr-only">
        {label}
      </label>
      <div className="hf-box" data-invalid={error ? 'true' : undefined}>
        <AutoTextarea
          name={path}
          id={id}
          rows={rows}
          className="hf-control"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      <ErrorText id={`${id}-error`} message={error} />
    </>
  )
}

function HeadWithHelp({
  label,
  help,
  className,
}: {
  label: string
  help?: string
  className?: string
}) {
  const { button, panel } = useHelpToggle(help, label)
  return (
    <th scope="col" className={className}>
      <span className="hf-label-row">
        {label}
        {button}
      </span>
      {panel}
    </th>
  )
}

function IndicatorRow({
  indicator: ind,
  paramGrade,
  isFirst,
  span,
}: {
  indicator: IndicatorDef
  paramGrade: CardValues['prospects']['grade']
  isFirst: boolean
  span: number
}) {
  const { control, setValue } = useFormContext<CardValues>()
  const base = `indicators.${ind.id}`
  const inputs = (useWatch({ control, name: p(`${base}.inputs`) }) ?? {}) as InputValues
  // wariant siedliska (np. 91D0) może zmieniać progi i kardynalność
  const site = (useWatch({ control, name: 'site' }) ?? {}) as InputValues
  const indicators = (useWatch({ control, name: 'indicators' }) ?? {}) as CardValues['indicators']
  const ctx = { site, indicators }
  const excluded = isExcluded(ind, site)
  const cardinal = !excluded && isCardinal(ind, site)
  const value = (useWatch({ control, name: p(`${base}.value`) }) ?? '') as string
  const [open, setOpen] = useState(false)
  const { button: helpButton, panel: helpPanel } = useHelpToggle(ind.help, ind.label)

  const suggestion = ind.suggest?.(inputs, ctx) ?? null
  const explanation = ind.explain?.(inputs, ctx) ?? null
  const warning = ind.warn?.(inputs, ctx) ?? null
  const described = ind.describe?.(inputs, ctx) ?? ''
  const panelId = `${toId(base)}-measure`
  // listy gatunków są widoczne od razu w kolumnie wartości, reszta pomiarów – w panelu
  const speciesInputs = ind.inputs.filter((f) => f.kind === 'species')
  const otherInputs = ind.inputs.filter((f) => f.kind !== 'species')
  const fromMeasures = (
    <>
      {explanation && <p className="hf-explain">{explanation}</p>}
      {described && described !== value && (
        <button
          type="button"
          className="hf-link"
          onClick={() => setValue(p(`${base}.value`), described, { shouldValidate: true, shouldDirty: true })}
        >
          Wstaw z pomiarów: „{shorten(described)}”
        </button>
      )}
    </>
  )

  return (
    <tr className={cardinal ? 'hf-cardinal-row' : undefined}>
      <th scope="row" className="hf-ind" data-label="Wskaźnik">
        <span className="hf-label-row">
          <span className={cardinal ? 'hf-ind-name hf-ind-cardinal' : 'hf-ind-name'}>{ind.label}</span>
          {helpButton}
        </span>
        {cardinal && <span className="hf-sr-only"> (wskaźnik kardynalny)</span>}
        {excluded && <span className="hf-ind-excluded">nie liczy się do oceny struktury przy tym podtypie</span>}
        {helpPanel}
      </th>
      <td className="hf-val" data-label="Wartość lub opis">
        {speciesInputs.map((f) => (
          <FieldInput key={f.name} field={f} path={`${base}.inputs.${f.name}`} layout="float" />
        ))}
        {speciesInputs.length > 0 && fromMeasures}
        <TextCell path={`${base}.value`} label={`Wartość lub opis: ${ind.label}`} />
        <button
          type="button"
          className="hf-measure-toggle"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? '▾' : '▸'} {otherInputs.length ? 'Pomiary i progi' : 'Progi oceny'}
          {suggestion ? ` (wg progów: ${suggestion})` : ''}
          <span className="hf-sr-only"> – {ind.label}</span>
        </button>
        {open && (
          <div id={panelId} className="hf-measure">
            <Thresholds thresholds={ind.thresholds} />
            {otherInputs.length > 0 && (
              <div className="hf-measure-fields">
                {otherInputs.map((f) => (
                  <FieldInput key={f.name} field={f} path={`${base}.inputs.${f.name}`} layout="float" />
                ))}
              </div>
            )}
            {speciesInputs.length === 0 && fromMeasures}
          </div>
        )}
        {warning && (
          <p className="hf-warn" role="status">
            {warning}
          </p>
        )}
      </td>
      <td className="hf-grade-cell" data-label="Ocena">
        {/* Jedna kolumna: ocena wskaźnika i ocena parametru obok siebie – dwie wąskie kolumny były nieczytelne. */}
        <div className="hf-grades">
          <div className="hf-grades-ind">
            <span className="hf-grades-cap" aria-hidden="true">
              wskaźnika
            </span>
            <GradeSelect path={`${base}.grade`} label={`Ocena wskaźnika: ${ind.label}`} suggestion={suggestion} />
          </div>
          <div className="hf-grades-param" data-testid={isFirst ? `grade-param-${ind.parameter}` : undefined}>
            <span className="hf-grades-cap">parametru</span>
            <GradeBadge grade={paramGrade} />
            <span className="hf-grades-note">
              {span > 1 ? 'wynika z ocen wszystkich wskaźników parametru' : 'wynika z oceny wskaźnika'}
            </span>
          </div>
        </div>
      </td>
    </tr>
  )
}

/** Wiersz-nagłówek grupy („Parametr: …”) na całą szerokość tabeli – zamiast bocznej kolumny „Parametr”. */
function GroupHead({ title, grade, help, panel }: { title: string; grade?: CardValues['prospects']['grade']; help?: ReactNode; panel?: ReactNode }) {
  return (
    <tr className="hf-group-row">
      <th scope="rowgroup" colSpan={3} className="hf-group-head">
        <span className="hf-group-title">
          <span className="hf-label-row">
            {title}
            {help}
          </span>
          {grade !== undefined && (
            <span className="hf-group-grade">
              ocena parametru: <GradeBadge grade={grade} />
            </span>
          )}
        </span>
        {panel}
      </th>
    </tr>
  )
}

export function StatusTable() {
  const m = useMethodology()
  const { control } = useFormContext<CardValues>()
  const values = useWatch({ control }) as CardValues
  const a = assessCard(m, values)
  const area = m.indicators.filter((i) => i.parameter === 'area')
  const structure = m.indicators.filter((i) => i.parameter === 'structure')
  const { button: prospectsHelp, panel: prospectsPanel } = useHelpToggle(m.prospects.help, 'Perspektywy ochrony')
  const { button: overallHelp, panel: overallPanel } = useHelpToggle(GENERIC_HELP.overallComment, 'Ocena ogólna')
  const [showProspectThresholds, setShowProspectThresholds] = useState(false)

  return (
    <>
      <p className="hf-note">
        <strong>Pogrubioną czcionką</strong> zaznaczono wskaźniki kardynalne dla oceny parametru „Specyficzna struktura i funkcja”.
      </p>
      <div className="hf-table-wrap">
        <table className="hf-status">
          <colgroup>
            <col className="hf-col-ind" />
            <col />
            <col className="hf-col-grades" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Wskaźniki</th>
              <HeadWithHelp label="Wartość lub opis" help={GENERIC_HELP.value} />
              <HeadWithHelp label="Ocena wskaźnika i parametru" help={GENERIC_HELP.grade} />
            </tr>
          </thead>
          <tbody className="hf-tbody-param">
            <GroupHead title="Parametr: Powierzchnia" grade={a.area} />
            {area.map((i, idx) => (
              <IndicatorRow key={i.id} indicator={i} paramGrade={a.area} isFirst={idx === 0} span={area.length} />
            ))}
          </tbody>
          <tbody className="hf-tbody-param">
            <GroupHead title="Parametr: Specyficzna struktura i funkcja" grade={a.structure} />
            {structure.map((i, idx) => (
              <IndicatorRow
                key={i.id}
                indicator={i}
                paramGrade={a.structure}
                isFirst={idx === 0}
                span={structure.length}
              />
            ))}
          </tbody>
          <tbody className="hf-tbody-param">
            <GroupHead title="Parametr: Perspektywy ochrony" help={prospectsHelp} panel={prospectsPanel} />
            <tr>
              <td colSpan={2} className="hf-val" data-label="Opis">
                <TextCell path="prospects.value" label="Perspektywy ochrony – opis" />
                <button
                  type="button"
                  className="hf-measure-toggle"
                  aria-expanded={showProspectThresholds}
                  onClick={() => setShowProspectThresholds((o) => !o)}
                >
                  {showProspectThresholds ? '▾' : '▸'} Progi
                </button>
                {showProspectThresholds && (
                  <div className="hf-measure">
                    <Thresholds thresholds={m.prospects.thresholds} />
                  </div>
                )}
              </td>
              <td className="hf-grade-cell" data-label="Ocena">
                <GradeSelect path="prospects.grade" label="Ocena perspektyw ochrony" />
              </td>
            </tr>
          </tbody>
          <tbody className="hf-tbody-param">
            <GroupHead title="Ocena ogólna" help={overallHelp} panel={overallPanel} />
            <tr className="hf-overall-row">
              <td colSpan={2} className="hf-val" data-label="Uzasadnienie">
                <TextCell path="overallComment" label="Ocena ogólna – uzasadnienie" />
                <p className="hf-hint">Ocena liczy się sama: najgorsza z ocen parametrów (powierzchnia, struktura i funkcja, perspektywy).</p>
              </td>
              <td className="hf-grade-cell" data-label="Ocena ogólna" data-testid="grade-overall">
                <GradeBadge grade={a.overall} />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {a.missing.length > 0 && (
        <p className="hf-warn" role="status">
          Brakuje ocen: {a.missing.join(', ')}. Bez nich ocena ogólna się nie policzy.
        </p>
      )}
    </>
  )
}
