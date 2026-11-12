// Strona główna: czym jest FITOS, lista kart siedlisk i instalacja na ekranie głównym.
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { habitatCode } from '../7120/habitats/assessment'
import type { Methodology } from '../7120/habitats/types'
import { methodology7120 } from '../7120/habitats/7120/methodology'
import { methodology91D0 } from '../91D0/habitats/methodology'
import { methodology40A0 } from '../40A0/habitats/methodology'
import { methodology6410 } from '../6410/habitats/methodology'
import { methodology6510 } from '../6510/habitats/methodology'
import { methodology65XX } from '../65XX/habitats/methodology'
import { methodology91E0 } from '../91E0/habitats/methodology'
import { methodology91F0 } from '../91F0/habitats/methodology'
import { methodology91I0 } from '../91I0/habitats/methodology'
import { methodology91P0 } from '../91P0/habitats/methodology'
import { draftKey, loadDraft } from '../7120/components/habitat-form/draftStore'
import { detectPlatform, useInstallPrompt, type Platform } from './installPrompt'
import './home.css'

interface HabitatEntry {
  m: Methodology
  title: string
  blurb: string
}

const HABITATS: HabitatEntry[] = [
  {
    m: methodology40A0,
    title: 'Subkontynentalne zarośla okołopannońskie',
    blurb: 'Niskie zarośla wisienki stepowej w murawach kserotermicznych i naskalne zarośla irgi zwyczajnej w Sudetach.',
  },
  {
    m: methodology6410,
    title: 'Zmiennowilgotne łąki trzęślicowe',
    blurb: 'Późno koszone łąki z trzęślicą, kosaćcem syberyjskim i olszewnikiem (zw. Molinion). Karta w układzie RDOŚ, z eksportem do Excela.',
  },
  {
    m: methodology6510,
    title: 'Ekstensywnie użytkowane niżowe łąki świeże',
    blurb: 'Kośne łąki rajgrasowe i wiechlinowo-kostrzewowe (zw. Arrhenatherion). Karta w układzie RDOŚ, z eksportem do Excela.',
  },
  {
    m: methodology65XX,
    title: 'Eutroficzne łąki wilgotne',
    blurb: 'Bujne, koszone łąki z ostrożeniami, kniecią i pępawą błotną (zw. Calthion) w dolinach i na wysiękach.',
  },
  {
    m: methodology7120,
    title: 'Torfowiska wysokie zdegradowane',
    blurb: 'Torfowiska przekształcone przez odwodnienie i eksploatację, wciąż zdolne do regeneracji.',
  },
  {
    m: methodology91D0,
    title: 'Bory i lasy bagienne',
    blurb: 'Sosnowe bory bagienne, brzeziny, świerczyny i borealne lasy sosnowo-brzozowe na torfie.',
  },
  {
    m: methodology91E0,
    title: 'Łęgi wierzbowe, topolowe, olszowe i jesionowe',
    blurb: 'Lasy nadrzeczne i źródliskowe: łęgi wierzbowe, topolowe, jesionowo-olszowe i górskie olszynki.',
  },
  {
    m: methodology91F0,
    title: 'Łęgowe lasy dębowo-wiązowo-jesionowe',
    blurb: 'Łęgi wiązowo-jesionowe w dolinach rzek i wilgotnych zagłębieniach, zagrożone przesuszeniem i grądowieniem.',
  },
  {
    m: methodology91I0,
    title: 'Ciepłolubne dąbrowy',
    blurb: 'Świetliste dąbrowy o luźnym drzewostanie i bogatym, ciepłolubnym runie, zagrożone grądowieniem.',
  },
  {
    m: methodology91P0,
    title: 'Jodłowy bór świętokrzyski',
    blurb: 'Wyżynne bory z dominacją jodły w Górach Świętokrzyskich, na Roztoczu i w Kotlinie Sandomierskiej.',
  },
]

const FEATURES = [
  'układ i pola jak w oficjalnej karcie obserwacji GIOŚ',
  'podpowiedzi ocen FV / U1 / U2 z progów przewodnika metodycznego',
  'zapis do .zip (z fotografiami) i eksport karty do Worda; łąki 6410 i 6510 także do Excela w układzie RDOŚ',
  'działa offline, dane zostają tylko na tym urządzeniu',
]

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

function useDrafts() {
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  useEffect(() => {
    let alive = true
    Promise.all(HABITATS.map(async ({ m }) => [m.code, (await loadDraft(draftKey(m.code)))?.savedAt] as const)).then(
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
            <h1>FITOS</h1>
            <p className="home-lead">
              Karty obserwacji siedlisk przyrodniczych do Państwowego Monitoringu Środowiska, wypełniane w terenie – na
              telefonie, tablecie albo komputerze.
            </p>
          </div>
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
            {HABITATS.map(({ m, title, blurb }) => (
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
        </footer>
      </main>
    </div>
  )
}
