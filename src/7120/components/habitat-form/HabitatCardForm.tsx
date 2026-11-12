// Generyczny formularz karty obserwacji. Wszystko, co specyficzne dla siedliska, przychodzi z `methodology`.
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { FormProvider, useForm, type FieldErrors, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { emptyCardValues } from '../../habitats/assessment'
import { buildCardSchema } from '../../habitats/schema'
import type { CardValues, Methodology } from '../../habitats/types'
import { CardFileError, cardFileName, cardFromFile, cardToZip } from './cardArchive'
import { MethodologyContext } from './context'
import { deleteDraft, draftKey, loadDraft, saveDraft as storeDraft } from './draftStore'
import { IMPACT_CODES_ID } from './fields'
import { HelpContext } from './help'
import { ExtraSection, ImpactsSection, OtherSection, RelevesSection, SavedResult, SiteSection, ThreatsSection } from './steps'
import { StatusTable } from './StatusTable'
import './habitat-form.css'

export interface CardExample {
  id: string
  label: string
  values: CardValues
}

/** Dodatkowy eksport karty (np. arkusz .xlsx w układzie jednego RDOŚ). Ładowany leniwie po kliknięciu. */
export interface CardExport {
  id: string
  /** Napis na przycisku, np. „Pobierz kartę (.xlsx)”. */
  label: string
  title?: string
  build: (m: Methodology, values: CardValues) => Promise<{ blob: Blob; fileName: string }>
}

interface Props {
  methodology: Methodology
  examples?: CardExample[]
  exports?: CardExport[]
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
  const steps = baseSteps(m)
  // dodatkowe zakładki metodyki (np. ocena referencyjna PZO) – domyślnie przed „Innymi informacjami”
  for (const x of m.extraSteps ?? []) {
    const step: FormStep = {
      id: x.id,
      tab: x.tab,
      title: x.title,
      fields: x.fields.map((f) => `other.${f.name}`),
      render: () => <ExtraSection step={x} />,
    }
    const at = x.after ? steps.findIndex((s) => s.id === x.after) + 1 : steps.findIndex((s) => s.id === 'other')
    steps.splice(at > 0 ? at : steps.length, 0, step)
  }
  return steps
}

function baseSteps(m: Methodology): FormStep[] {
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
      fields: m.extraSteps?.length ? m.otherFields.map((f) => `other.${f.name}`) : ['other'],
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

export function HabitatCardForm({ methodology: m, examples = [], exports = [], onSubmit }: Props) {
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
  /** Zmienia się przy każdym reset() – przemontowuje pola z lokalnym stanem tekstu (np. pokrycie). */
  const [resetKey, setResetKey] = useState(0)
  const [docxState, setDocxState] = useState<'idle' | 'busy' | 'error'>('idle')
  const [exportState, setExportState] = useState<{ id: string; state: 'busy' | 'error' } | null>(null)

  const [fileMsg, setFileMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const [draftAt, setDraftAt] = useState<string | null>(null)

  // ---------- kopia robocza w pamięci urządzenia ----------
  const storageKey = draftKey(m.code)
  const hasData = useCallback(() => JSON.stringify(form.getValues()) !== JSON.stringify(defaults), [form, defaults])
  /** Pytanie przed każdą operacją, która nadpisuje albo kasuje wpisane dane. Pusta karta – bez pytania. */
  const confirmLoss = useCallback((question: string) => !hasData() || typeof window.confirm !== 'function' || window.confirm(question), [hasData])
  const draftReady = useRef(false)

  // przy starcie: przywróć to, co zostało w pamięci (np. po zamknięciu przeglądarki albo braku zasięgu)
  useEffect(() => {
    let cancelled = false
    // prośba, by przeglądarka nie czyściła pamięci strony przy braku miejsca (zwłaszcza w zainstalowanej PWA)
    void navigator.storage?.persist?.().catch(() => undefined)
    void loadDraft(storageKey).then((draft) => {
      if (cancelled) return
      if (draft && JSON.stringify(draft.values) !== JSON.stringify(defaults)) {
        form.reset(draft.values)
        setResetKey((k) => k + 1)
        setDraftAt(draft.savedAt)
        setFileMsg({ kind: 'ok', text: `Przywrócono kartę z pamięci urządzenia (ostatnia zmiana: ${formatTime(draft.savedAt)}).` })
      }
      draftReady.current = true
    })
    return () => {
      cancelled = true
    }
  }, [storageKey, defaults, form])

  // każda zmiana ląduje w pamięci po chwili bezczynności
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const sub = form.watch(() => {
      if (!draftReady.current) return
      clearTimeout(timer)
      timer = setTimeout(() => {
        const values = form.getValues()
        const empty = JSON.stringify(values) === JSON.stringify(defaults)
        void (empty ? deleteDraft(storageKey) : storeDraft(storageKey, values))
          .then(() => setDraftAt(empty ? null : new Date().toISOString()))
          .catch((e) => console.error('Nie udało się zapisać kopii roboczej', e))
      }, 400)
    })
    return () => {
      clearTimeout(timer)
      sub.unsubscribe()
    }
  }, [form, defaults, storageKey])

  // zamknięcie/odświeżenie strony z wpisanymi danymi – pytanie przeglądarki
  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (!hasData()) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [hasData])

  // przycisk/gest „wstecz” – pytanie, zanim formularz zniknie
  useEffect(() => {
    if (typeof history === 'undefined') return
    history.pushState({ hfGuard: true }, '')
    const onPop = () => {
      if (confirmLoss(LEAVE_QUESTION)) {
        window.removeEventListener('popstate', onPop)
        history.back()
      } else {
        history.pushState({ hfGuard: true }, '')
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [confirmLoss])

  /** Zapis karty: .zip z karta.json i zdjęciami w zdjecia/. */
  const downloadZip = (values: CardValues) => {
    const bytes = cardToZip(m, values)
    downloadBlob(new Blob([bytes as BlobPart], { type: 'application/zip' }), cardFileName(m, values))
  }

  const loadFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const loaded = cardFromFile(m, new Uint8Array(await file.arrayBuffer()), file.name)
      form.reset(loaded.values)
      setResetKey((k) => k + 1)
      setSaved(null)
      setSubmitFailed(false)
      setTab(0)
      const photos = loaded.photos ? `, zdjęć: ${loaded.photos}` : ''
      const missing = loaded.missingPhotos.length ? ` Brakuje w archiwum ${loaded.missingPhotos.length} zdjęć: ${loaded.missingPhotos.join(', ')}.` : ''
      setFileMsg({ kind: missing ? 'error' : 'ok', text: `Wczytano kartę z pliku ${file.name}${photos}.${missing}` })
    } catch (e) {
      if (!(e instanceof CardFileError)) console.error(e)
      setFileMsg({ kind: 'error', text: e instanceof CardFileError ? e.message : `Nie udało się wczytać pliku ${file.name}.` })
    } finally {
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  /** Word w układzie karty GIOŚ. Biblioteka docx jest ciężka, więc ładuje się dopiero po kliknięciu. */
  const downloadDocx = async () => {
    setDocxState('busy')
    try {
      const { cardToDocxBlob, docxFileName } = await import('./exportDocx')
      const values = form.getValues()
      const blob = await cardToDocxBlob(m, values)
      downloadBlob(blob, docxFileName(m, values))
      setDocxState('idle')
    } catch (e) {
      console.error(e)
      setDocxState('error')
    }
  }
  const runExport = async (x: CardExport) => {
    setExportState({ id: x.id, state: 'busy' })
    try {
      const { blob, fileName } = await x.build(m, form.getValues())
      downloadBlob(blob, fileName)
      setExportState(null)
    } catch (e) {
      console.error(e)
      setExportState({ id: x.id, state: 'error' })
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
    if (!confirmLoss('Wczytanie przykładu zastąpi dane wpisane w formularzu. Kontynuować?')) return
    form.reset(structuredClone(values))
    setResetKey((k) => k + 1)
    setFileMsg(null)
    setSaved(null)
    setSubmitFailed(false)
    setTab(0)
  }

  const clear = () => {
    if (
      !confirmLoss(
        'Na pewno wyczyścić kartę? Wszystkie wpisane dane i zdjęcia zostaną usunięte z tego urządzenia.\n\nJeśli chcesz je zachować, anuluj i najpierw użyj „Zapisz kartę (.zip)”.',
      )
    )
      return
    form.reset(defaults)
    setResetKey((k) => k + 1)
    void deleteDraft(storageKey).then(() => setDraftAt(null))
    setFileMsg(null)
    setSaved(null)
    setSubmitFailed(false)
    setTab(0)
  }

  const submit = form.handleSubmit(
    (values) => {
      setSubmitFailed(false)
      setSaved(values)
      downloadZip(values)
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

  /** Wersja robocza: zapis bez walidacji, żeby nie stracić niedokończonej karty. */
  const saveDraft = () => {
    const values = form.getValues()
    downloadZip(values)
    setSaved(values)
  }

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
              <input
                ref={fileInput}
                id="hf-load-file"
                type="file"
                accept=".zip,.json,application/zip,application/json"
                className="hf-visually-hidden"
                onChange={(e) => void loadFile(e.target.files?.[0])}
              />
              <button
                type="button"
                className="hf-primary hf-load-btn"
                onClick={() => {
                  if (confirmLoss('Wczytanie karty z pliku zastąpi dane wpisane w formularzu. Kontynuować?')) fileInput.current?.click()
                }}
                title="Plik .zip zapisany przyciskiem „Zapisz kartę” (dane + zdjęcia) albo starszy .json"
              >
                Wczytaj z pliku
              </button>
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
            {fileMsg && (
              <p className={fileMsg.kind === 'ok' ? 'hf-file-msg' : 'hf-file-msg hf-file-msg-error'} role={fileMsg.kind === 'ok' ? 'status' : 'alert'}>
                {fileMsg.text}
              </p>
            )}
            <p className="hf-hint hf-draft-status" aria-live="polite">
              {draftAt
                ? `Wpisane dane są zapisywane na bieżąco w pamięci tego urządzenia (ostatnio: ${formatTime(draftAt)}). Usuwa je dopiero „Wyczyść”.`
                : 'Wpisane dane będą zapisywane na bieżąco w pamięci tego urządzenia – nic nie zginie po zamknięciu strony.'}
            </p>
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
                  Karta nie zapisana. Błędy w: {stepsWithErrors.join(', ')}. Pola zaznaczone na czerwono.{' '}
                  <button type="button" className="hf-secondary hf-draft-btn" onClick={saveDraft}>
                    Zapisz mimo braków (wersja robocza)
                  </button>
                </p>
              )}
              <div className="hf-card" key={resetKey}>
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
              {exports.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  className="hf-secondary hf-export-btn"
                  onClick={() => void runExport(x)}
                  disabled={exportState?.id === x.id && exportState.state === 'busy'}
                  title={x.title}
                >
                  {exportState?.id === x.id && exportState.state === 'busy' ? 'Przygotowuję plik…' : x.label}
                </button>
              ))}
              <button type="submit" className="hf-primary" title="Pobiera plik .zip: dane karty (karta.json) i zdjęcia (folder zdjecia/). Można go potem wczytać przyciskiem „Wczytaj z pliku”.">
                Zapisz kartę (.zip)
              </button>
            </footer>
            {docxState === 'error' && (
              <p className="hf-error" role="alert">
                Nie udało się przygotować pliku .docx. Spróbuj ponownie; jeśli to nie pomoże, usuń zdjęcia w nietypowym formacie.
              </p>
            )}
            {exportState?.state === 'error' && (
              <p className="hf-error" role="alert">
                Nie udało się przygotować pliku ({exports.find((x) => x.id === exportState.id)?.label}). Spróbuj ponownie.
              </p>
            )}
          </form>

          {saved && <SavedResult values={saved} fileName={cardFileName(m, saved)} onDownload={() => downloadZip(saved)} />}
        </div>
      </FormProvider>
      </HelpContext.Provider>
    </MethodologyContext.Provider>
  )
}

function downloadBlob(blob: Blob, name: string) {
  if (typeof URL.createObjectURL !== 'function') return
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const LEAVE_QUESTION =
  'Na pewno chcesz się wycofać z formularza? Wpisane dane zostają w pamięci tego urządzenia i wrócą przy następnym otwarciu karty.'

function formatTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
