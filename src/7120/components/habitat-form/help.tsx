// Wyjaśnienia pól („?”): dymek nad formularzem, a w trybie „rozwiń wszystkie” – panele w treści.
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'

export const HelpContext = createContext<{ showAll: boolean }>({ showAll: false })

export function HelpText({ id, text }: { id?: string; text: string }) {
  return (
    <div id={id} className="hf-help" role="note">
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  )
}

const GAP = 6
const MARGIN = 8

/**
 * Dymek z wyjaśnieniem, zakotwiczony nad przyciskiem „?” (albo pod nim, gdy nad nim brak miejsca).
 * Renderowany poza tabelą/kolumną (portal do korzenia formularza, `position: fixed`), więc szerokość kolumny go nie ściska.
 * Zamyka się Escape'em, kliknięciem obok albo przyciskiem ✕.
 */
function HelpPopover({
  id,
  text,
  label,
  anchor,
  onClose,
}: {
  id: string
  text: string
  label: string
  anchor: RefObject<HTMLButtonElement | null>
  onClose: (returnFocus: boolean) => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number; maxHeight: number } | null>(null)

  useLayoutEffect(() => {
    const place = () => {
      const a = anchor.current?.getBoundingClientRect()
      const el = box.current
      if (!a || !el) return
      const vw = document.documentElement.clientWidth || window.innerWidth
      const vh = window.innerHeight
      const w = el.offsetWidth
      const h = el.scrollHeight
      const below = vh - a.bottom - GAP - MARGIN
      const above = a.top - GAP - MARGIN
      // domyślnie NAD przyciskiem – żeby nie zasłaniać pola, którego dotyczy; pod spodem tylko gdy nad nim brak miejsca
      const putAbove = h <= above || above >= below
      const maxHeight = Math.max(120, putAbove ? above : below)
      const top = putAbove ? Math.max(MARGIN, a.top - GAP - Math.min(h, maxHeight)) : a.bottom + GAP
      // prawa krawędź dymka przy prawej krawędzi przycisku, ale zawsze w oknie
      const left = Math.min(Math.max(MARGIN, a.right - w), vw - w - MARGIN)
      setPos({ top, left: Math.max(MARGIN, left), maxHeight })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [anchor])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose(true)
      }
    }
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (box.current?.contains(t) || anchor.current?.contains(t)) return
      onClose(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [anchor, onClose])

  const root = anchor.current?.closest('.hf') ?? document.body
  return createPortal(
    <div
      ref={box}
      id={id}
      className="hf-popover"
      role="dialog"
      aria-label={`Wyjaśnienie: ${label}`}
      style={pos ? { top: pos.top, left: pos.left, maxHeight: pos.maxHeight } : { visibility: 'hidden', top: 0, left: 0 }}
    >
      <div className="hf-popover-head">
        <span className="hf-popover-title">{label}</span>
        <button type="button" className="hf-popover-close" aria-label="Zamknij wyjaśnienie" onClick={() => onClose(true)}>
          ✕
        </button>
      </div>
      <HelpText text={text} />
    </div>,
    root,
  )
}

/**
 * Przycisk „?” i jego wyjaśnienie jako osobne kawałki – do rozmieszczenia w dowolnym układzie.
 * Zwykle wyjaśnienie to dymek (`panel` renderuje portal). W trybie „rozwiń wszystkie” – panel w treści (`inline: true`).
 */
export function useHelpToggle(
  help: string | undefined,
  labelText: string,
): { button: ReactNode; panel: ReactNode; inline: boolean } {
  const panelId = useId()
  const { showAll } = useContext(HelpContext)
  const [open, setOpen] = useState<boolean | null>(null)
  const btn = useRef<HTMLButtonElement>(null)
  // przełączenie trybu kasuje ręczne otwarcia/zamknięcia
  useEffect(() => setOpen(null), [showAll])
  if (!help) return { button: null, panel: null, inline: false }
  const expanded = open ?? showAll
  const inline = showAll && expanded
  const close = (returnFocus: boolean) => {
    setOpen(false)
    if (returnFocus) btn.current?.focus()
  }
  return {
    button: (
      <button
        ref={btn}
        type="button"
        className="hf-help-btn"
        aria-expanded={expanded}
        aria-controls={panelId}
        aria-label={`Wyjaśnienie: ${labelText}`}
        title="Co tu wpisać i dlaczego"
        onClick={() => setOpen(!expanded)}
      >
        ?
      </button>
    ),
    panel: !expanded ? null : inline ? (
      <HelpText id={panelId} text={help} />
    ) : (
      <HelpPopover id={panelId} text={help} label={labelText} anchor={btn} onClose={close} />
    ),
    inline,
  }
}

/** Etykieta (span/legend) z przyciskiem „?” i panelem pod spodem. */
export function LabelWithHelp({
  as = 'span',
  id,
  label,
  required,
  help,
}: {
  as?: 'span' | 'legend'
  id?: string
  label: string
  required?: boolean
  help?: string
}) {
  const { button, panel } = useHelpToggle(help, label)
  const content = (
    <>
      <span className="hf-label">
        {label}
        {required && (
          <span className="hf-req" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </span>
      {button}
    </>
  )
  return (
    <>
      {as === 'legend' ? (
        <legend id={id} className="hf-label-row">
          {content}
        </legend>
      ) : (
        <span id={id} className="hf-label-row">
          {content}
        </span>
      )}
      {panel}
    </>
  )
}

/** Wyjaśnienia dla pól wspólnych dla wszystkich siedlisk. */
export const GENERIC_HELP = {
  value: `Tekst, który trafia do karty w kolumnie „Wartość lub opis”: liczby, gatunki z pokryciem, krótka charakterystyka tego, co widać w terenie. Przycisk „Wstaw z pomiarów” zbuduje go z pól powyżej – potem możesz go dowolnie poprawić i uzupełnić.

Dlaczego: sama ocena (FV/U1/U2) to za mało. Przy kolejnym monitoringu trzeba widzieć, z jakich wartości wynikała – tylko wtedy da się wychwycić trend, nawet jeśli ocena się nie zmieniła (np. torfowce spadły z 15% do 1%, a ocena dalej jest U2).`,
  grade: `Ocena wskaźnika w skali stanu ochrony:
• FV – właściwy,
• U1 – niezadowalający,
• U2 – zły,
• XX – nieznany: nie dało się ocenić (brak dostępu, zalanie, brak danych).

Podpowiedź pod spodem jest liczona z progów przewodnika GIOŚ, ale ostateczna ocena jest ekspercka. Możesz od niej odejść, jeśli masz powód – wtedy uzasadnij to w polu opisu.

Dlaczego: oceny wskaźników składają się na ocenę parametrów, a parametry na ocenę ogólną stanowiska. Z ocen stanowisk powstaje ocena krajowa raportowana Komisji Europejskiej (art. 17 dyrektywy siedliskowej).`,
  speciesName: `Wpisz kilka liter nazwy naukowej albo polskiej (np. „sph fal”, „żurawina”) i wybierz z listy strzałkami i Enterem albo myszką. Gatunku spoza katalogu nie szukaj na siłę – wybierz „Dodaj własny”. Nazwy z katalogu są rozpoznawane przy liczeniu podpowiedzi ocen; własne nie są liczone.`,
  speciesCover: `Pokrycie w % całego transektu (rzut pionowy roślin na powierzchnię). Szacuj z dokładnością do dziesiątek procent, a dla małych wartości do pojedynczych procent. Dla „<1%” wpisz 0,5.`,
  releveLayer: `Warstwa, w której rośnie gatunek: A – drzewa, B – krzewy i podrost drzew, C – rośliny zielne i krzewinki (także siewki drzew), D – mszaki i porosty naziemne. Podpowiada się po wyborze gatunku, ale ten sam gatunek może być w kilku warstwach (sosna w B, jej siewki w C).`,
  releveAbundance: `Ilościowość w skali Braun-Blanqueta: r – pojedynczy osobnik; + – nieliczne, pokrycie znikome; 1 – liczne, ale pokrycie poniżej 5%; 2 – 5–25%; 3 – 25–50%; 4 – 50–75%; 5 – 75–100%. Pokrycie liczy się w obrębie zdjęcia (5×5 m), nie transektu.`,
  impactCode: `Kod oddziaływania z listy zagrożeń i oddziaływań stosowanej w monitoringu siedlisk (klasyfikacja Natura 2000), np. J02.01.02 – osuszanie terenów bagiennych. Lista podpowiada kody najczęstsze dla tego siedliska; znany kod sam uzupełni nazwę, gdy wyjdziesz z pola.

Dlaczego: kody pozwalają zsumować dane z setek stanowisk w raporcie krajowym – opis tekstowy tego nie umożliwia.`,
  impactName: 'Nazwa oddziaływania zgodna z listą kodów. Dla znanego kodu uzupełnia się sama.',
  influence: `Kierunek wpływu na siedlisko: „−” negatywny (pogarsza stan), „+” pozytywny (np. zastawki, odkrzaczanie), „0” neutralny. Działania ochronne też wpisuj – jako oddziaływania pozytywne.`,
  intensity: `Siła oddziaływania: H – silna (wyraźnie kształtuje stan siedliska), M – średnia, L – słaba. W starszych kartach używano skali A/B/C (A = silna, C = słaba).

Dlaczego: pozwala odróżnić główne przyczyny złego stanu od tła i ustalić, od czego zacząć ochronę.`,
  impactDescription: `Konkretnie: co, gdzie, w jakiej skali i jak wpływa na siedlisko. „Rowy” to za mało. „Czynny rów ok. 1 m głębokości wzdłuż wschodniej granicy, woda odpływa, lustro wody na transekcie ponad 40 cm pod powierzchnią” – to jest opis.`,
  threatCode: `Kod przewidywanego oddziaływania z tej samej listy co oddziaływania. Zagrożenia to oddziaływania spodziewane w przyszłości (najbliższe lata) – także te, które już działają i będą działać dalej.`,
  threatDescription: `Dlaczego spodziewasz się tego zagrożenia i jak może zmienić stan siedliska, np. „sieć rowów będzie dalej drenować torfowisko, jeśli nie powstaną zastawki”.`,
  prospectsValue: `Opis perspektyw: co pomaga, co szkodzi, co się stanie bez działań ochronnych i co trzeba zrobić, żeby było lepiej. Szczegóły pod „?” przy nagłówku „Perspektywy ochrony”.`,
  prospectsGrade: `FV – dobre perspektywy poprawy, aż do odtworzenia żywego torfowiska 7110; U1 – dobre perspektywy utrzymania stanu niepogorszonego; U2 – perspektywy złe, przetrwania siedliska nie da się zagwarantować; XX – nie da się ocenić.`,
  overallComment: `Krótkie uzasadnienie oceny ogólnej: który parametr lub wskaźnik ją przesądził i dlaczego. Ocenę ogólną formularz liczy sam (najgorsza z ocen parametrów), tutaj ją objaśniasz.

Dlaczego: przy złej ocenie najważniejsze jest wskazanie przyczyny – to od niej zależy, jakie działania ochronne zaproponować.`,
} as const
