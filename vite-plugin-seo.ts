// SEO dla FITOS przy budowaniu (vite build). Nic tu nie dopisujesz ręcznie przy nowej karcie:
// plugin czyta src/<KOD>/meta.ts (title, blurb) tak samo jak rejestr cards.ts i generuje:
//   karty/<KOD>/index.html – statyczna, indeksowalna strona każdej karty (link do #/<KOD> w aplikacji),
//   sitemap.xml            – strona główna + wszystkie karty,
//   robots.txt             – wskazanie sitemapy (patrz JAK-WGRAC.md, dlaczego to nie wystarczy na github.io),
// oraz wstawia listę kart do <noscript> w index.html (w miejsce <!--seo:karty-->).
//
// Po co: aplikacja używa HashRouter, a Google ignoruje wszystko po „#”. Bez tego plugina
// dla Google istnieje dokładnie jedna strona: pusty <div id="root">.
import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

/** Pełny adres aplikacji, z ukośnikiem na końcu. Zmień, jeśli kiedyś będzie własna domena. */
export const SITE_URL = 'https://ch3shiredev.github.io/fitos-react/'

interface CardInfo {
  code: string
  title: string
  blurb: string
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function readString(src: string, key: string): string | undefined {
  const m = new RegExp(`${key}:\\s*(['"\`])((?:\\\\.|(?!\\1).)*)\\1`, 's').exec(src)
  return m?.[2].replace(/\\(['"`\\])/g, '$1')
}

/** Karty = foldery src/<KOD>/ z Card<KOD>.tsx i meta.ts (ta sama zasada co cards.ts). */
export function readCards(srcDir: string): CardInfo[] {
  const cards: CardInfo[] = []
  for (const code of fs.readdirSync(srcDir)) {
    const metaPath = path.join(srcDir, code, 'meta.ts')
    if (!fs.existsSync(metaPath) || !fs.existsSync(path.join(srcDir, code, `Card${code}.tsx`))) continue
    const src = fs.readFileSync(metaPath, 'utf8')
    const title = readString(src, 'title')
    const blurb = readString(src, 'blurb')
    if (!title || !blurb) throw new Error(`seo: ${metaPath} – nie umiem odczytać title/blurb`)
    cards.push({ code, title, blurb })
  }
  return cards.sort((a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : 0))
}

const cardUrl = (code: string) => `${SITE_URL}karty/${code}/`
const appCardUrl = (code: string) => `${SITE_URL}#/${code}`

export function cardPage(card: CardInfo, all: CardInfo[]): string {
  const title = `Karta ${card.code} – ${card.title} | FITOS`
  const desc = `Formularz karty obserwacji siedliska ${card.code} (${card.title}) do monitoringu Natura 2000 wg metodyki GIOŚ. ${card.blurb}`
  const description = desc.length > 300 ? desc.slice(0, 297).replace(/\s+\S*$/, '') + '…' : desc
  const others = all
    .filter((c) => c.code !== card.code)
    .map((c) => `<li><a href="${cardUrl(c.code)}">${c.code} – ${esc(c.title)}</a></li>`)
    .join('\n          ')
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': cardUrl(card.code),
        url: cardUrl(card.code),
        name: title,
        description,
        inLanguage: 'pl-PL',
        isPartOf: { '@id': `${SITE_URL}#website` },
        about: { '@type': 'Thing', name: `${card.code} ${card.title}` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'FITOS', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: `Karta ${card.code}`, item: cardUrl(card.code) },
        ],
      },
    ],
  }
  return `<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${cardUrl(card.code)}" />
    <meta name="theme-color" content="#2e6b3f" />
    <meta name="color-scheme" content="light dark" />
    <link rel="icon" type="image/png" sizes="192x192" href="${SITE_URL}pwa-192.png" />
    <link rel="apple-touch-icon" href="${SITE_URL}apple-touch-icon.png" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="pl_PL" />
    <meta property="og:site_name" content="FITOS" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:url" content="${cardUrl(card.code)}" />
    <meta property="og:image" content="${SITE_URL}og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
    <style>
      :root { --bg: #f6f8f5; --fg: #1d2a20; --muted: #556158; --accent: #2e6b3f; --on-accent: #fff; --line: #d6ded6; }
      @media (prefers-color-scheme: dark) {
        :root { --bg: #131a15; --fg: #e3ebe4; --muted: #a3b2a6; --accent: #6fbf86; --on-accent: #0d1a10; --line: #2c3a2f; }
      }
      * { box-sizing: border-box; }
      body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
      main { max-width: 46rem; margin: 0 auto; padding: 2rem 1rem 3rem; }
      .crumb { font-size: .9rem; color: var(--muted); }
      .crumb a, a { color: var(--accent); }
      h1 { font-size: 1.7rem; line-height: 1.25; margin: .4rem 0 1rem; }
      .code { display: inline-block; font-weight: 700; color: var(--on-accent); background: var(--accent); border-radius: .4rem; padding: 0 .5rem; margin-right: .3rem; }
      .cta { display: inline-block; margin: 1rem 0 1.5rem; padding: .75rem 1.2rem; border-radius: .6rem; background: var(--accent); color: var(--on-accent); font-weight: 600; text-decoration: none; }
      h2 { font-size: 1.15rem; margin-top: 2rem; border-top: 1px solid var(--line); padding-top: 1.2rem; }
      ul { padding-left: 1.2rem; }
      li { margin: .2rem 0; }
      .muted { color: var(--muted); font-size: .95rem; }
    </style>
  </head>
  <body>
    <main>
      <nav class="crumb"><a href="${SITE_URL}">FITOS</a> › Karta ${card.code}</nav>
      <h1><span class="code">${card.code}</span> ${esc(card.title)}</h1>
      <p>${esc(card.blurb)}</p>
      <p>
        FITOS to darmowa aplikacja z formularzem karty obserwacji siedliska ${card.code} do monitoringu
        siedlisk przyrodniczych Natura 2000, zgodnym z metodyką monitoringu GIOŚ. Kartę wypełnisz w terenie
        na telefonie lub komputerze, także bez zasięgu, i zapiszesz w pliku.
      </p>
      <a class="cta" href="${appCardUrl(card.code)}">Otwórz kartę ${card.code} w FITOS</a>
      <p class="muted">Dane zostają w Twojej przeglądarce. Aplikację można zainstalować na telefonie (PWA).</p>
      <h2>Pozostałe karty siedlisk w FITOS</h2>
      <ul>
          ${others}
      </ul>
    </main>
  </body>
</html>
`
}

export function sitemap(cards: CardInfo[]): string {
  const urls = [SITE_URL, ...cards.map((c) => cardUrl(c.code))]
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`
}

export const robots = () => `User-agent: *
Allow: /

Sitemap: ${SITE_URL}sitemap.xml
`

export function noscriptList(cards: CardInfo[]): string {
  return cards
    .map((c) => `<li><a href="${cardUrl(c.code)}">${c.code} – ${esc(c.title)}</a></li>`)
    .join('\n          ')
}

export default function seoPages(): Plugin {
  let srcDir = ''
  let cards: CardInfo[] = []
  return {
    name: 'fitos-seo',
    configResolved(config) {
      srcDir = path.resolve(config.root, 'src')
    },
    buildStart() {
      cards = readCards(srcDir)
    },
    transformIndexHtml(html) {
      if (!cards.length) cards = readCards(srcDir)
      return html.replace('<!--seo:karty-->', noscriptList(cards))
    },
    generateBundle() {
      for (const card of cards) {
        this.emitFile({ type: 'asset', fileName: `karty/${card.code}/index.html`, source: cardPage(card, cards) })
      }
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap(cards) })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots() })
    },
  }
}
