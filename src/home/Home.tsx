// Strona główna: czym jest FITOS, lista kart siedlisk i instalacja na ekranie głównym.
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { habitatCode } from '../7120/habitats/assessment'
import { CARDS } from '../cards'
import { draftKey, loadDraft } from '../7120/components/habitat-form/draftStore'
import { detectPlatform, useInstallPrompt, type Platform } from './installPrompt'
import './home.css'


const FEATURES = [
  'układ i pola jak w oficjalnej karcie obserwacji GIOŚ',
  'podpowiedzi ocen FV / U1 / U2 z progów przewodnika metodycznego',
  'zapis do .zip (z fotografiami) i eksport karty do Worda; łąki 6410 i 6510 także do Excela w układzie RDOŚ',
  'działa offline, dane zostają tylko na tym urządzeniu',
]

/** Publiczny adres FITOS. Z zainstalowanej aplikacji czasem trzeba otworzyć zwykłą stronę (udostępnić link, pobrać plik w przeglądarce). */
export const WEB_URL = 'https://ch3shiredev.github.io/fitos-react/'

export const COFFEE_URL = 'https://www.buymeacoffee.com/LXmnx8A';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

function useDrafts() {
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  useEffect(() => {
    let alive = true
    Promise.all(CARDS.map(async ({ methodology: m }) => [m.code, (await loadDraft(draftKey(m.code)))?.savedAt] as const)).then(
      (rows) => {
        if (alive) setDrafts(Object.fromEntries(rows.filter((r): r is readonly [string, string] => Boolean(r[1]))))
      },
    )
    return () => {
      alive = false
    }
  }, [])
  return drafts
}

const INSTRUCTIONS: Record<Platform, string[]> = {
  ios: ['Otwórz tę stronę w Safari.', 'Stuknij „Udostępnij” (kwadrat ze strzałką).', 'Wybierz „Do ekranu początkowego”.'],
  'android-firefox': ['Stuknij menu ⋮ w Firefoksie.', 'Wybierz „Dodaj do ekranu głównego” (albo „Zainstaluj”).', 'Potwierdź „Dodaj”.'],
  android: ['Stuknij menu ⋮ przeglądarki.', 'Wybierz „Zainstaluj aplikację” albo „Dodaj do ekranu głównego”.', 'Potwierdź instalację.'],
  desktop: ['W Chrome lub Edge kliknij ikonę instalacji na końcu paska adresu.', 'Albo menu ⋮ → „Zapisz i udostępnij” → „Zainstaluj stronę jako aplikację”.'],
}

function InstallCard() {
  const { canPrompt, install, installed } = useInstallPrompt()
  const [platform] = useState(() => detectPlatform())
  const [msg, setMsg] = useState('')

  if (installed) {
    return (
      <section className="home-install home-install-done" aria-labelledby="home-install-title">
        <h2 id="home-install-title">✓ FITOS jest zainstalowany</h2>
        <p>Działa bez zasięgu. Nowa wersja pobiera się sama przy następnym uruchomieniu z internetem.</p>
        <a className="home-web-link" href={WEB_URL} target="_blank" rel="noopener noreferrer">
          Wersja web ↗
        </a>
        <span className="home-web-hint">kliknij, aby przejść na stronę web</span>
      </section>
    )
  }

  return (
    <section className="home-install" aria-labelledby="home-install-title">
      <h2 id="home-install-title">Dodaj FITOS do ekranu głównego</h2>
      <p>
        Po instalacji aplikacja otwiera się jak zwykła apka i działa w terenie bez zasięgu. Wystarczy raz otworzyć ją z
        internetem.
      </p>
      {canPrompt ? (
        <button
          type="button"
          className="home-install-btn"
          onClick={async () => {
            const r = await install()
            setMsg(r === 'accepted' ? 'Zainstalowano. Ikona FITOS jest na ekranie głównym.' : 'Instalację anulowano – przycisk zostaje, gdybyś zmienił zdanie.')
          }}
        >
          Zainstaluj aplikację
        </button>
      ) : (
        <ol className="home-steps">
          {INSTRUCTIONS[platform].map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      )}
      {msg && (
        <p className="home-install-msg" role="status">
          {msg}
        </p>
      )}
    </section>
  )
}

export function Home() {
  const drafts = useDrafts()
  const icon = `${import.meta.env.BASE_URL}pwa-192.png`

  return (
    <div className="home">
      <main className="home-inner">
        <header className="home-hero">
          <img className="home-logo" src={icon} alt="" width={88} height={88} />
          <div>
            <h1 style={{ fontSize: '4rem' }}>FITOS</h1>
          </div>
        </header>
        <header  >

            <p className="home-lead" >
              Elektroniczne karty obserwacji siedlisk przyrodniczych Natura 2000, zgodne z metodyką Państwowego&nbsp;Monitoringu&nbsp;Środowiska&nbsp;(GIOŚ). Do wypełniania w terenie na telefonie, tablecie lub komputerze, także bez dostępu do internetu.

Wszystkie dane są przechowywane wyłącznie na Twoim urządzeniu i nigdy nie są przesyłane na żaden serwer.
            </p>
        </header>

        <ul className="home-features">
          {FEATURES.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>

        <section aria-labelledby="home-cards-title">
          <h2 id="home-cards-title" className="home-section-title">
            Wybierz kartę siedliska
          </h2>
          <ul className="home-cards">
            {CARDS.map(({ methodology: m, title, blurb }) => (
              <li key={m.code}>
                <Link to={`/${m.code}`} className="home-card">
                  <span className="home-code" aria-hidden="true">
                    {habitatCode(m)}
                  </span>
                  <span className="home-card-body">
                    <span className="home-card-title">
                      <span className="home-sr-only">{m.code} – </span>
                      {title}
                    </span>
                    <span className="home-card-blurb">{blurb}</span>
                    <span className="home-card-meta">
                      {m.priority && <span className="home-tag">priorytetowe</span>}
                      <span>{m.indicators.length} wskaźników</span>
                      {drafts[m.code] && <span className="home-tag home-tag-draft">wersja robocza z {formatDate(drafts[m.code])}</span>}
                    </span>
                  </span>
                  <span className="home-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <InstallCard />

        <footer className="home-footer">
          Metodyka: GIOŚ, „Monitoring siedlisk przyrodniczych. Przewodnik metodyczny”. Formularz podpowiada oceny, ale
          ostateczną ocenę zawsze wybiera ekspert.
            <a href={COFFEE_URL} className="home-coffee" id="home-coffee" data-testid="home-coffee"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=LXmnx8A&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a> 
        </footer>
      </main>
    </div>
  )
}
