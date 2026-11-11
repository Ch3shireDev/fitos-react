// Generyczny formularz karty obserwacji. Wszystko, co specyficzne dla siedliska, przychodzi z `methodology`.
import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { FormProvider, useForm, type FieldErrors, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { emptyCardValues } from '../../habitats/assessment'
import { buildCardSchema } from '../../habitats/schema'
import type { CardValues, Methodology } from '../../habitats/types'
import { MethodologyContext } from './context'
import { IMPACT_CODES_ID } from './fields'
import { HelpContext } from './help'
import { ImpactsSection, OtherSection, RelevesSection, SavedResult, SiteSection, ThreatsSection } from './steps'
import { StatusTable } from './StatusTable'
import './habitat-form.css'

export interface CardExample {
  id: string
  label: string
  values: CardValues
}

interface Props {
  methodology: Methodology
  examples?: CardExample[]
  onSubmit?: (values: CardValues) => void
}

interface FormStep {
  id: string
  /** Krótka nazwa na zakładce. */
  tab: string
  /** Nagłówek sekcji – dokładnie jak w karcie. */
  title: string
  /** Ścieżki pól należących do kroku (do oznaczania zakładek z błędami). */
  fields: string[]
  render: () => ReactNode
}

// Sekcje 1:1 z kartą obserwacji (kolejność i nazwy jak w karcie GIOŚ). Zdjęcia fitosocjologiczne
// są w przewodniku, ale nie w karcie docx – dlatego na końcu.
function buildSteps(m: Methodology): FormStep[] {
  return [
    {
      id: 'site',
      tab: 'Stanowisko',
      title: 'Stanowisko – informacje podstawowe',
      fields: ['site'],
      render: () => <SiteSection />,
    },
    {
      id: 'status',
      tab: 'Stan ochrony',
      title: 'Stan ochrony siedliska przyrodniczego na stanowisku',
      fields: [...m.indicators.map((i) => `indicators.${i.id}`), 'prospects', 'overallComment'],
      render: () => <StatusTable />,
    },
    {
      id: 'impacts',
      tab: 'Oddziaływania',
      title: 'Oddziaływania',
      fields: ['impacts'],
      render: () => <ImpactsSection />,
    },
    {
      id: 'threats',
      tab: 'Zagrożenia',
      title: 'Zagrożenia (przyszłe, przewidywane oddziaływania)',
      fields: ['threats'],
      render: () => <ThreatsSection />,
    },
    {
      id: 'other',
      tab: 'Inne informacje',
      title: 'Inne informacje',
      fields: ['other'],
      render: () => <OtherSection />,
    },
    {
      id: 'releves',
      tab: 'Zdjęcia fitosocjologiczne',
      title: 'Zdjęcia fitosocjologiczne',
      fields: ['releves'],
      render: () => <RelevesSection />,
    },
  ]
}

/** Czy w danym kroku siedzi jakikolwiek błąd walidacji. */
function stepHasError(errors: FieldErrors<CardValues>, step: FormStep): boolean {
  return step.fields.some((path) => {
    const [root, key] = path.split('.')
    const branch = (errors as Record<string, unknown>)[root]
    return key ? Boolean((branch as Record<string, unknown> | undefined)?.[key]) : Boolean(branch)
  })
}

const ALL = 'all' as const
type TabId = number | typeof ALL

export function HabitatCardForm({ methodology: m, examples = [], onSubmit }: Props) {
  const schema = useMemo(() => buildCardSchema(m), [m])
  const defaults = useMemo(() => emptyCardValues(m), [m])
  const steps = useMemo(() => buildSteps(m), [m])

  const form = useForm<CardValues>({
    // Schemat jest budowany dynamicznie, więc typy wyjścia zod nie znają CardValues.
    resolver: zodResolver(schema) as unknown as Resolver<CardValues>,
    defaultValues: defaults,
    mode: 'onTouched',
  })
  const { errors } = form.formState

  const [tab, setTab] = useState<TabId>(0)
  const [submitFailed, setSubmitFailed] = useState(false)
  const [saved, setSaved] = useState<CardValues | null>(null)
  const [showAllHelp, setShowAllHelp] = useState(false)
  const [docxState, setDocxState] = useState<'idle' | 'busy' | 'error'>('idle')

  /** Word w układzie karty GIOŚ. Biblioteka docx jest ciężka, więc ładuje się dopiero po kliknięciu. */
  const downloadDocx = async () => {
    setDocxState('busy')
    try {
      const { cardToDocxBlob, docxFileName } = await import('./exportDocx')
      const values = form.getValues()
      const blob = await cardToDocxBlob(m, values)
      if (typeof URL.createObjectURL === 'function') {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = docxFileName(m, values)
        document.body.appendChild(link)
        link.click()
        link.remove()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
      setDocxState('idle')
    } catch (e) {
      console.error(e)
      setDocxState('error')
    }
  }
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Zakładki: kroki + „Całość” na końcu.
  const tabs: { id: TabId; title: string; hasError: boolean }[] = [
    ...steps.map((s, i) => ({ id: i as TabId, title: s.tab, hasError: stepHasError(errors, s) })),
    { id: ALL, title: 'Całość', hasError: false },
  ]
  const tabIndex = tabs.findIndex((t) => t.id === tab)
  const tabDomId = (id: TabId) => `hf-tab-${id}`

  const select = (id: TabId, focus = false) => {
    setTab(id)
    if (focus) tabRefs.current[tabs.findIndex((t) => t.id === id)]?.focus()
  }

  /** Strzałki, Home, End – standardowa klawiatura dla tablisty. */
  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = tabs.length - 1
    const target =
      e.key === 'ArrowRight' ? (tabIndex + 1) % tabs.length
      : e.key === 'ArrowLeft' ? (tabIndex - 1 + tabs.length) % tabs.length
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null
    if (target === null) return
    e.preventDefault()
    select(tabs[target].id, true)
  }

  const loadExample = (values: CardValues) => {
    form.reset(structuredClone(values))
    setSaved(null)
    setSubmitFailed(false)
    setTab(0)
  }

  const clear = () => {
    form.reset(defaults)
    setSaved(null)
    setSubmitFailed(false)
    setTab(0)
  }

  const submit = form.handleSubmit(
    (values) => {
      setSubmitFailed(false)
      setSaved(values)
      onSubmit?.(values)
    },
    (errs) => {
      setSubmitFailed(true)
      setSaved(null)
      // W widoku „Całość” zostajemy, w zakładkach skaczemy do pierwszej z błędem.
      if (tab !== ALL) {
        const first = steps.findIndex((s) => stepHasError(errs, s))
        if (first !== -1) setTab(first)
      }
    },
  )

  const stepsWithErrors = tabs.filter((t) => t.hasError).map((t) => t.title)
  const renderStep = (s: FormStep) => (
    <section key={s.id} className="hf-section" aria-labelledby={`hf-step-title-${s.id}`}>
      <h2 id={`hf-step-title-${s.id}`} className="hf-bar">
        {s.title}
      </h2>
      {s.render()}
    </section>
  )

  return (
    <MethodologyContext.Provider value={m}>
      <HelpContext.Provider value={{ showAll: showAllHelp }}>
      <FormProvider {...form}>
        <div className="hf">
          <header className="hf-header">
            <h1>Karta {m.code}</h1>
            <p className="hf-subtitle">{m.name}</p>
            <div className="hf-toolbar">
              {examples.map((e) => (
                <button key={e.id} type="button" className="hf-secondary" onClick={() => loadExample(e.values)}>
                  Wczytaj przykład: {e.label}
                </button>
              ))}
              <button type="button" className="hf-secondary" onClick={clear}>
                Wyczyść
              </button>
              <label className="hf-help-switch">
                <input type="checkbox" checked={showAllHelp} onChange={(e) => setShowAllHelp(e.target.checked)} />
                Rozwiń wszystkie wyjaśnienia (tryb dla początkujących)
              </label>
            </div>
            <p className="hf-hint">
              Przy każdym polu jest przycisk „?”, który pokazuje, co wpisać i dlaczego.
            </p>
          </header>

          {/* Jedna kopia podpowiedzi kodów – w widoku „Całość” inaczej dublowałyby się id. */}
          <datalist id={IMPACT_CODES_ID}>
            {m.impactCodes.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </datalist>

          <div role="tablist" aria-label="Części karty" className="hf-tabs">
            {tabs.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                id={tabDomId(t.id)}
                type="button"
                role="tab"
                aria-selected={t.id === tab}
                aria-controls="hf-panel"
                tabIndex={t.id === tab ? 0 : -1}
                className={`hf-tab${t.id === ALL ? ' hf-tab-all' : ''}${t.hasError ? ' hf-tab-error' : ''}`}
                onClick={() => select(t.id)}
                onKeyDown={onTabKeyDown}
              >
                {t.title}
                {t.hasError && (
                  <span className="hf-tab-badge" aria-label="zawiera błędy" title="Zawiera błędy">
                    !
                  </span>
                )}
              </button>
            ))}
          </div>

          <form onSubmit={submit} noValidate>
            <div id="hf-panel" role="tabpanel" aria-labelledby={tabDomId(tab)} className="hf-panel">
              {submitFailed && stepsWithErrors.length > 0 && (
                <p className="hf-alert" role="alert">
                  Karta nie zapisana. Błędy w: {stepsWithErrors.join(', ')}. Pola zaznaczone na czerwono.
                </p>
              )}
              <div className="hf-card">
                <p className="hf-bar hf-bar-title">Karta obserwacji siedliska przyrodniczego na stanowisku</p>
                {tab === ALL ? steps.map(renderStep) : renderStep(steps[tab])}
              </div>
            </div>

            <footer className="hf-nav">
              {tab !== ALL && tab > 0 && (
                <button type="button" className="hf-secondary" onClick={() => setTab(tab - 1)}>
                  ← {steps[tab - 1].tab}
                </button>
              )}
              {tab !== ALL && tab < steps.length - 1 && (
                <button type="button" className="hf-secondary" onClick={() => setTab(tab + 1)}>
                  {steps[tab + 1].tab} →
                </button>
              )}
              <button
                type="button"
                className="hf-secondary hf-docx-btn"
                onClick={() => void downloadDocx()}
                disabled={docxState === 'busy'}
                title="Karta w układzie formularza GIOŚ, do wydruku albo dalszej edycji w Wordzie. Pobiera to, co jest wpisane – także kartę niedokończoną."
              >
                {docxState === 'busy' ? 'Przygotowuję .docx…' : 'Pobierz kartę (.docx)'}
              </button>
              <button type="submit" className="hf-primary">
                Zapisz kartę
              </button>
            </footer>
            {docxState === 'error' && (
              <p className="hf-error" role="alert">
                Nie udało się przygotować pliku .docx. Spróbuj ponownie; jeśli to nie pomoże, usuń zdjęcia w nietypowym formacie.
              </p>
            )}
          </form>

          {saved && <SavedResult values={saved} />}
        </div>
      </FormProvider>
      </HelpContext.Provider>
    </MethodologyContext.Provider>
  )
}
