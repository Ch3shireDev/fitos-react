// Metodyka 65XX jako dane. Źródło: „Monitoring siedlisk przyrodniczych. Przewodnik metodyczny. Część czwarta”
// (GIOŚ, Biblioteka Monitoringu Środowiska), rozdz. Eutroficzne łąki wilgotne (zw. Calthion), tab. 1 i 2,
// oraz sprawozdania z monitoringu 65XX z lat 2013–2014, 2016–2018 i 2024–2025 (listy gatunków, kody oddziaływań).
// Wspólne typy, logika ocen i komponenty formularza leżą w src/7120 – tu są wyłącznie dane 65XX.
import { isIsoDate } from '../../7120/habitats/dates'
import type { FieldDef, Grade, IndicatorContext, InputValues, Methodology, SelectOption, SpeciesRow } from '../../7120/habitats/types'
import { describeSpecies, formatCover, num, speciesRows } from '../../7120/habitats/assessment'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import {
  GROUP_LABELS_65XX,
  SPECIES_65XX,
  characteristicOf,
  defaultLayer65XX,
  findSpecies65XX,
  isHeterophyllum,
} from './species'

const fmtNum = (n: number) => String(n).replace('.', ',')
const fmt = (n: number | undefined) => (n === undefined ? '—' : `${fmtNum(n)}%`)

const labelOf = (opts: SelectOption[], v: unknown) => opts.find((o) => o.value === v)?.label ?? ''

/** Ocena z selecta: mapa wartość -> ocena. */
const byOption = (map: Record<string, Grade>) => (i: InputValues) => map[String(i.choice)] ?? null

const named = (i: InputValues): SpeciesRow[] => speciesRows(i.species).filter((r) => r.name?.trim())

const SPECIES_LIST_HELP = `Szukaj gatunku po kilku literach nazwy naukowej albo polskiej (np. „cirs riv”, „knieć”) i wybierz z listy. Każdy wybrany gatunek dostaje wiersz, w którym wpisujesz pokrycie. Gatunku spoza katalogu nie szukaj na siłę: wybierz „Dodaj własny”. Nazwy z katalogu (także synonimy, np. Bistorta officinalis) są rozpoznawane przy liczeniu podpowiedzi oceny, własne nie.

Pokrycie podawaj w procentach powierzchni transektu (rzut pionowy), dla „<1%” wpisz 0,5.`

const COORD_HELP = (where: string) =>
  `Współrzędne geograficzne ${where} osi transektu, odczytane z odbiornika GPS (układ WGS84). Trzymaj jeden format w całej karcie, najlepiej stopnie-minuty-sekundy z oznaczeniem N/E.

Dlaczego: transekt ma zostać odnaleziony i powtórzony w tym samym miejscu za 4–5 lat. W tych samych trzech punktach (początek, środek, koniec) wykonuje się zdjęcia fitosocjologiczne 5×5 m.`

const pick7120 = (name: string): FieldDef => {
  const f = methodology7120.siteFields.find((x) => x.name === name)
  if (!f) throw new Error(`Brak pola ${name} w metodyce 7120`)
  return f
}

// ---------- opcje selektów ----------

const AREA_TREND: SelectOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się' },
  { value: 'slight', label: 'Niewielki spadek powierzchni siedliska' },
  { value: 'clear', label: 'Wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub literaturą' },
]

const FRAGMENTATION: SelectOption[] = [
  { value: 'none', label: 'Brak fragmentacji lub fragmentacja nieznaczna' },
  { value: 'medium', label: 'Średni stopień fragmentacji' },
  { value: 'large', label: 'Duży stopień fragmentacji (płaty po kilka arów)' },
]

const DRAINAGE: SelectOption[] = [
  { value: 'none', label: 'Brak rowów albo infrastruktura zneutralizowana (zasypane rowy, zastawki)' },
  { value: 'weak', label: 'Sieć rowów lub inna infrastruktura w niewielkim stopniu wpływa na warunki wodne' },
  { value: 'strong', label: 'Infrastruktura melioracyjna wyraźnie pogarsza warunki wodne siedliska' },
]

const GRADE_ORDER = ['FV', 'U1', 'U2', 'XX']

/** Select oceny opisowej. Opcje idą w kolejności FV, U1, U2 – pomoc mówi to wprost. */
const selectInput = (label: string, options: SelectOption[], help?: string): FieldDef => ({
  kind: 'select',
  name: 'choice',
  label,
  options,
  required: true,
  help: [
    help,
    `Wybierz opis najbliższy temu, co widać na stanowisku:\n${options.map((o, i) => `• ${o.label} – ${GRADE_ORDER[i]}`).join(',\n')}.`,
    'Pełne wyjaśnienie wskaźnika jest pod „?” przy jego nazwie.',
  ]
    .filter(Boolean)
    .join('\n\n'),
})

const speciesInput = (label: string, help: string, required = false): FieldDef => ({
  kind: 'species',
  name: 'species',
  label,
  required,
  help: `${help}\n\n${SPECIES_LIST_HELP}`,
})

/** Suma pokrycia wszystkich gatunków z listy (każdy wiersz się liczy, niezależnie od katalogu). */
function listCover(i: InputValues): { count: number; total?: number } {
  const rows = named(i)
  const covers = rows.map((r) => num(r.cover)).filter((v): v is number => v !== undefined)
  return {
    count: rows.length,
    total: covers.length ? Math.round(covers.reduce((a, b) => a + b, 0) * 10) / 10 : rows.length ? undefined : 0,
  }
}

const groupOf = (name: string) => findSpecies65XX(name)?.group

/** Gatunki, których dominacja daje U2: ekspansywne, obce, krzewy. */
const BAD_DOMINANT = new Set(['expansive-strong', 'expansive', 'invasive-high', 'invasive-low', 'woody'])

// ---------- gatunki charakterystyczne ----------

function characteristic(i: InputValues, ctx?: IndicatorContext) {
  return characteristicOf(named(i), isHeterophyllum(ctx?.site))
}

// ---------- gatunki inwazyjne ----------

/** Pojedyncze osobniki = pokrycie „<1%” (0,5) lub mniej. */
const SINGLE = 0.5

function invasiveSplit(i: InputValues) {
  const rows = named(i)
  const high = rows.filter((r) => groupOf(r.name) === 'invasive-high')
  const low = rows.filter((r) => groupOf(r.name) !== 'invasive-high')
  const sum = (rs: SpeciesRow[]) => {
    const c = rs.map((r) => num(r.cover))
    return c.some((v) => v === undefined) ? undefined : Math.round(c.reduce<number>((a, b) => a + (b ?? 0), 0) * 10) / 10
  }
  return { rows, high, low, highTotal: sum(high), lowTotal: sum(low) }
}

// ---------- gatunki ekspansywne ----------

function expansiveSplit(i: InputValues) {
  const rows = named(i)
  const strong = rows.filter((r) => groupOf(r.name) === 'expansive-strong')
  const maxStrong = strong.length ? Math.max(...strong.map((r) => num(r.cover) ?? Number.NaN)) : 0
  return { rows, strong, maxStrong, total: listCover(i).total }
}

// ---------- krzewy ----------

const shrubTotal = (i: InputValues) => num(i.total) ?? listCover(i).total

// ---------- wojłok ----------

const cm = (n: number | undefined) => (n === undefined ? '' : fmtNum(n))

export const methodology65XX: Methodology = {
  code: '65XX',
  name: 'Eutroficzne łąki wilgotne ze związku Calthion',
  source:
    'GIOŚ, Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. IV, rozdz. Eutroficzne łąki wilgotne (zw. Calthion), tab. 1 i 2; sprawozdania z monitoringu 65XX 2013–2014, 2016–2018 i 2024–2025',

  siteFields: [
    {
      kind: 'text',
      name: 'siteName',
      label: 'Nazwa stanowiska',
      required: true,
      placeholder: 'np. Wołosate',
      help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Wołosate”. Jeśli stanowisko już istnieje w bazie GIOŚ, przepisz nazwę co do znaku.

Dlaczego: stanowiska kontroluje się co 4–5 lat. Stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty i zobaczyć trend.`,
    },
    pick7120('guid'),
    {
      kind: 'text',
      name: 'communities',
      label: 'Zbiorowiska roślinne',
      required: true,
      hint: 'Np. Cirsietum rivularis, Angelico-Cirsietum oleracei.',
      help: `Zbiorowiska roślinne faktycznie występujące na transekcie, nazwami fitosocjologicznymi. Dla 65XX to zespoły związku Calthion:
• Angelico-Cirsietum oleracei (= Cirsio-Polygonetum bistortae) – łąka rdestowo-ostrożeniowa, głównie niż;
• Cirsietum rivularis – łąka z ostrożeniem łąkowym, Karpaty, Sudety, północny wschód;
• Polygono bistortae-Trollietum europaei – łąka pełnikowa, bardzo rzadka;
• Polygono bistortae-Cirsietum heterophylli – górska łąka z ostrożeniem różnolistnym (Sudety);
• zbiorowisko z ostrożeniem siwym Cirsium canum.
Fitocenozy przejściowe opisz wprost („zbiorowisko pośrednie między Cirsietum rivularis a łąką mietlicową”).

Uwaga: gdy wpiszesz tu Polygono bistortae-Cirsietum heterophylli (wystarczy „heterophylli”), formularz zaliczy do gatunków charakterystycznych także dziurawca czterobocznego, jaskra różnolistnego i mietlicę pospolitą – przewodnik podaje je jako diagnostyczne tylko dla tego zespołu.

Dlaczego: zespół wyznacza punkt odniesienia dla oceny – jakich gatunków się spodziewać i co jest dominantem.`,
    },
    {
      kind: 'textarea',
      name: 'description',
      label: 'Opis siedliska na stanowisku',
      rows: 6,
      required: true,
      hint: 'Położenie, fizjonomia płatu, sąsiedztwo, sposób i regularność koszenia.',
      help: `Syntetyczny opis stanowiska w kilku zdaniach:
• gdzie leży płat (dolina cieku, zbocze, wysięk wód) i z czym sąsiaduje (łąki świeże, młaki, ziołorośla, zarośla);
• fizjonomia: bujna, wielowarstwowa ruń z ostrożeniami czy już monotonne ziołorośla z wiązówką;
• użytkowanie: czy łąka jest koszona, ile razy w roku, czy nawożona, czy wypasana;
• melioracje i stosunki wodne.

Dlaczego: kondycja łąk wilgotnych zależy przede wszystkim od reżimu wodnego i ekstensywnego koszenia. Opis pozwala kolejnemu obserwatorowi zrozumieć przyczyny zmian.`,
    },
    {
      kind: 'number',
      name: 'areaHa',
      label: 'Powierzchnia płatów siedliska',
      unit: 'ha',
      min: 0,
      required: true,
      help: `Łączna powierzchnia płatów siedliska 65XX na stanowisku, w hektarach. Płaty bywają od kilku arów do kilku hektarów. Najlepiej z GIS (ortofotomapa) albo pomiaru GPS granic płatu.

Dlaczego: zmiana powierzchni między obserwacjami to podstawa parametru „Powierzchnia siedliska”.`,
    },
    pick7120('protectedAreas'),
    {
      kind: 'text',
      name: 'coordStart',
      group: 'Współrzędne geograficzne',
      wide: true,
      label: 'Początek transektu',
      required: true,
      placeholder: '49° 03\' 12,5" N 22° 41\' 30,1" E',
      help: COORD_HELP('początku'),
    },
    { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', required: true, help: COORD_HELP('środka') },
    { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', required: true, help: COORD_HELP('końca') },
    {
      kind: 'text',
      name: 'transect',
      label: 'Wymiary transektu',
      defaultValue: '200x10 m',
      required: true,
      hint: 'Standard to 200×10 m.',
      help: `Faktyczne wymiary transektu. Standard to pas 200×10 m. Gdy płat jest za mały albo ma nieregularny kształt, zastępuje się go 20-arową powierzchnią o innych wymiarach (np. 11×180 m, transekt nieprostoliniowy) – wpisz faktyczne wymiary i dołącz schemat w opisie albo w dokumentacji fotograficznej.

Dlaczego: wszystkie pokrycia (%) liczy się względem powierzchni transektu. Bez znanych wymiarów wyniki z różnych lat są nieporównywalne.`,
    },
    {
      kind: 'text',
      name: 'altitude',
      label: 'Wysokość n.p.m.',
      unit: 'm n.p.m.',
      placeholder: 'np. 770–787',
      required: true,
      help: `Wysokość nad poziomem morza w metrach, z GPS albo mapy. Przy różnicy wysokości na transekcie podaj zakres (np. „770–787”).

Dlaczego: kontekst geograficzny – niżowe Angelico-Cirsietum oleracei i górskie Cirsietum rivularis czy Polygono-Cirsietum heterophylli mają inny skład gatunkowy.`,
    },
    {
      kind: 'date',
      name: 'date',
      label: 'Data obserwacji',
      placeholder: 'DD.MM.RRRR, np. 04.07.2013',
      required: true,
      hint: 'Optymalnie od końca maja do sierpnia, przed pokosem.',
      help: `Dzień obserwacji w terenie. Termin dobiera się do optimum fenologicznego fitocenozy, zwykle od końca maja do sierpnia. Łąki koszone lepiej badać przed pokosem, ale nie za wcześnie, bo młode trawy i turzyce trudno oznaczyć.

Dlaczego: po pokosie nie da się ocenić składu ani pokrycia, a wczesną wiosną część gatunków jest jeszcze nierozpoznawalna. Stanowisko kontroluje się co 4–5 lat.`,
      warn: (v) => {
        if (!isIsoDate(v)) return null
        const [, mo, d] = v.split('-').map(Number)
        const ok = (mo === 5 && d >= 20) || (mo >= 6 && mo <= 8)
        return ok ? null : 'Termin poza optymalnym oknem (koniec maja–sierpień). Skład i pokrycie runi mogą być niepełne.'
      },
    },
    pick7120('observer'),
  ],

  releves: {
    defaultCount: 3,
    intro:
      'Metodyka przewiduje trzy zdjęcia fitosocjologiczne metodą Braun-Blanqueta, co 100 m wzdłuż transektu (na początku, w środku i na końcu), każde na poletku 5×5 m. Gdy transekt jest nietypowy, zdjęcia można rozmieścić inaczej, dlatego ich liczbę możesz zmieniać.',
    fields: methodology7120.releves.fields.map((f): FieldDef => {
      switch (f.name) {
        case 'coords':
          return { ...f, help: 'Współrzędne GPS środka poletka 5×5 m. Zdjęcia robi się na początku, w środku i na końcu transektu.\n\nDlaczego: zdjęcia powtarza się dokładnie w tych samych miejscach – to najdokładniejszy zapis zmian roślinności.' }
        case 'slope':
          return { ...f, help: 'Nachylenie poletka w stopniach. Łąki wilgotne leżą zwykle płasko w dnach dolin (0–2°), w górach także na łagodnych zboczach z wysiękami.\n\nDlaczego: na zboczach woda szybciej odpływa, a płat łatwiej przechodzi w łąkę świeżą.' }
        case 'exposure':
          return { ...f, help: 'Kierunek, w którym opada poletko (N, NE, E, SE, S, SW, W, NW). Dla powierzchni płaskiej wpisz „brak”.\n\nDlaczego: ekspozycja wpływa na nasłonecznienie i przesychanie.' }
        case 'coverA':
          return { ...f, help: 'Warstwa A – drzewa. Na łące zwykle 0%.\n\nDlaczego: drzewa na poletku to już zarastanie łąki, sygnał zaniechania koszenia.' }
        case 'coverB':
          return { ...f, help: 'Warstwa B – krzewy i podrost: wierzby, tarnina, kalina, olsze.\n\nDlaczego: krzewy wkraczają na nieużytkowaną łąkę. Zwarcie B powyżej kilku procent zapowiada przejście w zarośla.' }
        case 'coverC':
          return { ...f, help: 'Warstwa C – zielna. Na dobrze zachowanej łące wilgotnej zwykle 90–100%.\n\nDlaczego: bujna, wielowarstwowa ruń to cecha fizjonomii siedliska.' }
        case 'coverD':
          return { ...f, help: 'Warstwa D – mszysta. W Cirsietum rivularis i Angelico-Cirsietum oleracei zwykle dobrze rozwinięta, w Polygono-Cirsietum heterophylli słabo.\n\nDlaczego: rozwój mchów zależy od wilgotności i od tego, czy ruń nie jest zbyt zwarta.' }
        case 'heightA':
        case 'heightB':
        case 'heightC':
        case 'heightD':
          return { ...f, help: `${String(f.help).split('\n')[0]}\n\nDlaczego: wysokość warstw opisuje strukturę runi – wysoka, zbita ruń z ziołoroślami świadczy o braku koszenia.` }
        case 'unit':
          return { ...f, help: 'Zespół albo zbiorowisko, do którego należy zdjęcie, np. „Cirsietum rivularis nawiązujące do Valeriano-Caricetum flavae”.\n\nDlaczego: łączy zdjęcie z opisem zbiorowisk stanowiska i pozwala śledzić, czy płat przechodzi w inne zbiorowisko (ziołorośla, szuwar, łąkę świeżą).' }
        case 'species':
          return { ...f, help: String(f.help).replace(' (mchy do D, drzewa do B)', ' (mchy do D, krzewy do B, reszta do C)').replace('np. sosna w B i jej siewki w C', 'np. wierzba w B i jej siewki w C') }
        default:
          return f
      }
    }),
  },

  indicators: [
    {
      id: 'area',
      label: 'Powierzchnia siedliska',
      parameter: 'area',
      description: 'Zmiana powierzchni płatów siedliska na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury.',
      help: `Co wybrać: jak zmienia się powierzchnia płatów 65XX na stanowisku. Najczęstsze przyczyny spadku to zarastanie krzewami i ziołoroślami po zaniechaniu koszenia, zabagnienie (szuwary, turzycowiska), osuszenie i przejście w łąkę świeżą, zaoranie, zabudowa, stawy.

W polu wartości wpisz powierzchnię płatów w ha (np. „0,2 ha”), a przy spadku – o ile i dlaczego.

Przy pierwszej obserwacji, bez danych do porównania, wybierz „nie podlega zmianom” albo oceń XX i opisz to w polu wartości.`,
      thresholds: {
        FV: 'Nie podlega zmianom lub zwiększa się',
        U1: 'Niewielki spadek powierzchni siedliska',
        U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi w literaturze',
      },
      inputs: [selectInput('Jak zmienia się powierzchnia?', AREA_TREND)],
      suggest: byOption({ stable: 'FV', slight: 'U1', clear: 'U2' }),
      describe: (i) => labelOf(AREA_TREND, i.choice),
    },
    {
      id: 'spatial',
      label: 'Struktura przestrzenna płatów siedliska',
      parameter: 'structure',
      description: 'Stopień fragmentacji siedliska w skali porządkowej: duży, średni, mały stopień fragmentacji lub jej brak.',
      help: `Co wybrać: jak bardzo siedlisko jest pocięte na osobne płaty na stanowisku.

Pułapka: jeśli fragmentacja ma charakter naturalny i nie zagraża siedlisku (np. łąka występuje w mozaice z młaką eutroficzną 7230 albo łąką świeżą, zależnie od zasilania w wodę), a nie jest objawem degeneracji (osuszenie, zabagnienie po działalności bobrów, zakrzewienie po zaniechaniu koszenia), zaznacz to w opisie wskaźnika.

Dlaczego: małe, izolowane płaty (po kilka arów) szybciej zarastają i tracą gatunki.`,
      thresholds: {
        FV: 'Brak fragmentacji lub fragmentacja nieznaczna',
        U1: 'Średni stopień fragmentacji',
        U2: 'Duży stopień fragmentacji (płaty po kilka arów)',
      },
      inputs: [selectInput('Stopień fragmentacji', FRAGMENTATION)],
      suggest: byOption({ none: 'FV', medium: 'U1', large: 'U2' }),
      describe: (i) => labelOf(FRAGMENTATION, i.choice),
    },
    {
      id: 'characteristic',
      label: 'Gatunki charakterystyczne',
      parameter: 'structure',
      cardinal: true,
      description:
        'Lista gatunków charakterystycznych dla fitosocjologicznych identyfikatorów siedliska oraz dla zw. Calthion, z przybliżonym procentem pokrycia transektu.',
      help: `Co wpisać: gatunki charakterystyczne stwierdzone na transekcie, z pokryciem w %. Formularz liczy gatunki z listy przewodnika:
• zw. Calthion i zespoły siedliska: ostrożeń łąkowy Cirsium rivulare, ostrożeń warzywny C. oleraceum, ostrożeń siwy C. canum, rdest wężownik Polygonum bistorta, pępawa błotna Crepis paludosa, pełnik europejski Trollius europaeus, stokłosa groniasta Bromus racemosus, knieć błotna Caltha palustris, komonica błotna Lotus uliginosus, groszek błotny Lathyrus palustris, niezapominajka błotna Myosotis palustris, koniczyna białoróżowa Trifolium hybridum, kuklik zwisły Geum rivale, sity: ostrokwiatowy Juncus acutiflorus, skupiony J. conglomeratus, rozpierzchły J. effusus, tępokwiatowy J. subnodulosus;
• górska łąka z ostrożeniem różnolistnym (Polygono-Cirsietum heterophylli): ostrożeń różnolistny Cirsium heterophyllum, pępawa miękka Crepis mollis, przytulia błotna Galium uliginosum, a tylko w tym zespole także dziurawiec czteroboczny Hypericum maculatum, jaskier różnolistny Ranunculus auricomus i mietlica pospolita Agrostis capillaris.

Progi: co najmniej 5 gatunków – FV, 3–4 – U1, mniej niż 3 – U2. Na dobrze zachowanych stanowiskach notuje się zwykle 6–9 gatunków.

Dlaczego: gatunki charakterystyczne mówią, czy struktura gatunkowa fitocenozy jest typowa dla siedliska. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'Co najmniej 5 gatunków charakterystycznych dla siedliska',
        U1: '3–4 gatunki charakterystyczne dla siedliska',
        U2: 'Mniej niż 3 gatunki charakterystyczne dla siedliska',
      },
      inputs: [speciesInput('Gatunki charakterystyczne na transekcie', 'Gatunki z listy (jest pod „?” przy nazwie wskaźnika), z pokryciem w % transektu.', true)],
      suggest: (i, ctx) => {
        if (!named(i).length) return null
        const n = characteristic(i, ctx).counted.length
        return n >= 5 ? 'FV' : n >= 3 ? 'U1' : 'U2'
      },
      explain: (i, ctx) => {
        if (!named(i).length) return null
        const { counted, skipped } = characteristic(i, ctx)
        const extra = skipped.length
          ? ` Nie liczę: ${skipped.join(', ')} – to gatunki charakterystyczne tylko dla Polygono-Cirsietum heterophylli (wpisz ten zespół w „Zbiorowiskach roślinnych”, jeśli to on).`
          : ''
        return `Gatunków charakterystycznych: ${counted.length} (${counted.join(', ') || '—'}).${extra}`
      },
      describe: (i) => describeSpecies(named(i)),
    },
    {
      id: 'dominant',
      label: 'Gatunki dominujące',
      parameter: 'structure',
      description:
        'Lista gatunków dominujących na transekcie z procentowym udziałem każdego z nich. Istotny jest charakter dominantów i stopień ich dominacji.',
      help: `Co wpisać: gatunki dominujące na transekcie z pokryciem w %.

Jak liczy formularz:
• żaden gatunek nie pokrywa ponad 50% transektu – FV (współpanują gatunki łąkowe, w tym typowe dla siedliska);
• jest gatunek o pokryciu ponad 50%, ale to gatunek łąkowy (Molinio-Arrhenatheretea, np. ostrożeń łąkowy) albo typowy dla młak eutroficznych (turzyce: prosowata, żółta, pospolita) – U1;
• ponad 50% pokrywa gatunek ekspansywny (wiązówka, mięta długolistna, śmiałek) albo obcy ekologicznie (krzewy, gatunki inwazyjne) – U2.

Formularz ostrzega, gdy przy ocenie FV wśród dominantów jest gatunek ekspansywny z pokryciem co najmniej 20% – sprawozdania z monitoringu obniżały wtedy ocenę (np. ostrożeń łąkowy 25% i mięta długolistna 30%).

Dlaczego: dominanty pokazują, czy łąka jest koszona i dobrze uwodniona, czy przechodzi w ziołorośla albo szuwar.`,
      thresholds: {
        FV: 'Brak gatunków o pokryciu >50%, współpanują gatunki łąkowe charakterystyczne dla klasy Molinio-Arrhenatheretea, w tym typowe dla siedliska',
        U1: 'Obecne gatunki o pokryciu >50%, dominują gatunki łąkowe z klasy Molinio-Arrhenatheretea lub typowe dla młak eutroficznych z klasy Scheuchzerio-Caricetea fuscae',
        U2: 'Wśród dominantów (pokrycie powyżej 50%) obecne gatunki ekspansywne lub ekologicznie obce dla siedliska',
      },
      inputs: [speciesInput('Gatunki dominujące', 'Dominanty z pokryciem w % transektu.', true)],
      suggest: (i) => {
        const rows = named(i)
        if (!rows.length) return null
        const over = rows.filter((r) => (num(r.cover) ?? 0) > 50)
        if (!over.length) return 'FV'
        return over.some((r) => BAD_DOMINANT.has(groupOf(r.name) ?? '')) ? 'U2' : 'U1'
      },
      explain: (i) => {
        const rows = named(i)
        if (!rows.length) return null
        const over = rows.filter((r) => (num(r.cover) ?? 0) > 50)
        if (!over.length) return 'Żaden gatunek nie pokrywa ponad 50% transektu.'
        return `Ponad 50% pokrywa: ${over.map((r) => `${r.name} (${GROUP_LABELS_65XX[groupOf(r.name) ?? 'other']})`).join(', ')}.`
      },
      warn: (i) => {
        if (named(i).some((r) => (num(r.cover) ?? 0) > 50)) return null
        const bad = named(i).filter((r) => (num(r.cover) ?? 0) >= 20 && BAD_DOMINANT.has(groupOf(r.name) ?? ''))
        return bad.length
          ? `Wśród dominantów są gatunki ekspansywne lub obce: ${bad.map((r) => `${r.name} ${formatCover(num(r.cover))}`).join(', ')}. Rozważ obniżenie oceny.`
          : null
      },
      describe: (i) => describeSpecies(named(i)),
    },
    {
      id: 'invasive',
      label: 'Obce gatunki inwazyjne',
      parameter: 'structure',
      description:
        'Lista gatunków obcych geograficznie i ekologicznie z szacunkowym procentem pokrycia transektu. Uwzględnij stopień inwazyjności gatunku.',
      help: `Co wpisać: każdy gatunek obcy na transekcie, z pokryciem. Brak – zostaw listę pustą.

Formularz rozróżnia stopień inwazyjności (z katalogu):
• wysoce inwazyjne: nawłocie późna i kanadyjska, barszcze Sosnowskiego i kaukaski, niecierpek gruczołowaty, rdestowce, łubin trwały, kolczurka, rudbekia naga, uczep amerykański, przymiotno białe, klon jesionolistny, czeremcha amerykańska;
• o niskim stopniu inwazyjności: wierzbownica gruczołowata, niecierpek drobnokwiatowy, przymiotno kanadyjskie, winobluszcz zaroślowy, tawuła nibywierzbolistna. Gatunek spoza katalogu liczy się jako słabo inwazyjny – przy innej ocenie popraw podpowiedź.

Jak liczy: brak albo pojedyncze osobniki (pokrycie „<1%”) gatunków słabo inwazyjnych – FV; słabo inwazyjne poniżej 5% albo pojedyncze osobniki gatunku wysoce inwazyjnego – U1; wysoce inwazyjne z większym pokryciem albo słabo inwazyjne na ponad 5% transektu – U2. „Pojedyncze osobniki” to interpretacja: pokrycie do 0,5%.

Dlaczego: w przypadku roślin, których ekspansję w Polsce uznano za zagrażającą różnorodności biologicznej, na obniżenie oceny wpływa już sama obecność gatunku.`,
      thresholds: {
        FV: 'Brak lub pojedyncze osobniki gatunków o niskim stopniu inwazyjności, tj. nie zagrażające różnorodności biologicznej',
        U1: 'Gatunki o niskim stopniu inwazyjności w pokryciu <5% transektu lub pojedyncze osobniki gatunków wysoce inwazyjnych',
        U2: 'Obecne gatunki silnie inwazyjne lub >5% transektu zajęte przez gatunki o niskim stopniu inwazyjności',
      },
      inputs: [speciesInput('Obce gatunki inwazyjne', 'Gatunki obce z pokryciem w % transektu. Brak – zostaw pustą listę.')],
      suggest: (i) => {
        const s = invasiveSplit(i)
        if (!s.rows.length) return 'FV'
        if (s.highTotal === undefined || s.lowTotal === undefined) return null
        if (s.highTotal > SINGLE || s.lowTotal > 5) return 'U2'
        if (s.high.length || s.lowTotal > SINGLE) return 'U1'
        return 'FV'
      },
      explain: (i) => {
        const s = invasiveSplit(i)
        if (!s.rows.length) return null
        const part = (label: string, rs: SpeciesRow[], t?: number) => (rs.length ? `${label}: ${rs.map((r) => r.name).join(', ')} (razem ${fmt(t)})` : '')
        return [part('Wysoce inwazyjne', s.high, s.highTotal), part('Słabo inwazyjne lub spoza katalogu', s.low, s.lowTotal)]
          .filter(Boolean)
          .join('. ')
          .concat('. Pojedyncze osobniki = pokrycie do 0,5% – to interpretacja.')
      },
      describe: (i) => describeSpecies(named(i)) || 'Brak',
    },
    {
      id: 'expansive',
      label: 'Gatunki ekspansywne roślin zielnych',
      parameter: 'structure',
      cardinal: true,
      description:
        'Gatunki roślin zielnych rozprzestrzeniające się w siedlisku i mogące stanowić dla niego zagrożenie, z szacunkowym procentem pokrycia transektu.',
      help: `Co wpisać: rodzime gatunki zielne, które rozprzestrzeniają się na łące, z pokryciem. Brak – zostaw listę pustą. Gatunków obcych tu nie wpisuj – mają swój wskaźnik.

Gatunki silnie ekspansywne (wymienione w przewodniku): wiązówka błotna Filipendula ulmaria, tojeść pospolita Lysimachia vulgaris, mięta długolistna Mentha longifolia, świerząbki Chaerophyllum spp., kozłek lekarski Valeriana officinalis, śmiałek darniowy Deschampsia caespitosa, trzcinniki Calamagrostis spp., mozga trzcinowata Phalaris arundinacea, trzcina Phragmites australis, turzyca drżączkowata Carex brizoides, pokrzywa zwyczajna Urtica dioica. Inne ekspansywne (ze sprawozdań): kłosówka miękka, krwawnica, podagrycznik, trybula leśna, turzyce wielkie.

Jak liczy formularz:
• brak gatunków silnie ekspansywnych i łączne pokrycie ekspansywnych poniżej 20% – FV;
• żaden gatunek silnie ekspansywny nie przekracza 10% albo łączne pokrycie 20–50% – U1;
• łączne pokrycie ponad 50% – U2; również gatunek silnie ekspansywny powyżej 10%, bo nie spełnia warunków U1 (to interpretacja tabeli).

Dlaczego: wskaźnik pokazuje kierunek i etap sukcesji na łące niekoszonej. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'Brak gatunków silnie ekspansywnych i łączne pokrycie gatunków ekspansywnych <20%',
        U1: 'Pokrycie żadnego z gatunków silnie ekspansywnych nie przekracza 10% lub łączne pokrycie gatunków ekspansywnych 21–50%',
        U2: 'Łączne pokrycie gatunków ekspansywnych >50%',
      },
      inputs: [speciesInput('Gatunki ekspansywne', 'Rodzime gatunki ekspansywne z pokryciem w % transektu. Brak – zostaw pustą listę.')],
      suggest: (i) => {
        const s = expansiveSplit(i)
        if (!s.rows.length) return 'FV'
        if (s.total === undefined || Number.isNaN(s.maxStrong)) return null
        if (s.total > 50) return 'U2'
        if (!s.strong.length && s.total < 20) return 'FV'
        return s.maxStrong <= 10 ? 'U1' : 'U2'
      },
      explain: (i) => {
        const s = expansiveSplit(i)
        if (!s.rows.length) return null
        const strong = s.strong.length ? `silnie ekspansywne: ${describeSpecies(s.strong)}` : 'brak gatunków silnie ekspansywnych'
        return `Łączne pokrycie gatunków ekspansywnych ${fmt(s.total)}; ${strong}.`
      },
      describe: (i) => describeSpecies(named(i)) || 'Brak',
    },
    {
      id: 'shrubs',
      label: 'Ekspansja krzewów i podrostu drzew',
      parameter: 'structure',
      cardinal: true,
      description: 'Sumaryczne pokrycie krzewów i drzew na transekcie oraz lista gatunków i procent ich pokrycia.',
      help: `Co wpisać: krzewy i drzewa (także podrost) na transekcie z pokryciem w % – najczęściej wierzby (szara, uszata, iwa, pięciopręcikowa), tarnina, kalina, olsza szara i czarna, róża, jeżyny. Gdy znasz łączne pokrycie (z rzutu koron, nie sumy gatunków, bo korony się nakładają), wpisz je w polu poniżej – ma pierwszeństwo przed sumą listy.

Progi: poniżej 1% – FV, 1–5% – U1, ponad 5% – U2. Pojedynczy krzew („<1%”, czyli 0,5) jeszcze mieści się w FV.

Dlaczego: obecność młodych krzewów i drzew na łące to oznaka długotrwałego braku koszenia. Wskaźnik kardynalny.`,
      thresholds: { FV: 'Łączne pokrycie na transekcie <1%', U1: 'Łączne pokrycie na transekcie 1–5%', U2: 'Łączne pokrycie na transekcie >5%' },
      inputs: [
        speciesInput('Krzewy i podrost drzew', 'Gatunki krzewów i drzew z pokryciem w % transektu. Brak – zostaw pustą listę.'),
        {
          kind: 'number',
          name: 'total',
          label: 'Łączne pokrycie krzewów i drzew (jeśli szacowane)',
          unit: '%',
          min: 0,
          max: 100,
          help: 'Sumaryczne pokrycie krzewów i podrostu drzew w % transektu, w rzucie pionowym. Opcjonalne – bez niego formularz bierze sumę pokryć z listy.',
        },
      ],
      suggest: (i) => {
        const t = shrubTotal(i)
        if (t === undefined) return null
        return t < 1 ? 'FV' : t <= 5 ? 'U1' : 'U2'
      },
      explain: (i) => {
        if (!named(i).length && num(i.total) === undefined) return null
        return num(i.total) !== undefined ? `Łączne pokrycie (wpisane): ${fmt(num(i.total))}.` : `Suma pokryć z listy: ${fmt(listCover(i).total)}.`
      },
      describe: (i) => {
        const list = describeSpecies(named(i))
        const t = num(i.total)
        if (!list) return t ? `Łącznie ${fmt(t)}` : 'Brak'
        return t !== undefined ? `${list}; łącznie ${fmt(t)}` : list
      },
    },
    {
      id: 'wellPreserved',
      label: 'Udział dobrze zachowanych płatów siedliska',
      parameter: 'structure',
      description:
        'Szacowany w skali transektu procentowy udział dobrze wykształconych płatów w stosunku do przejściowych, nietypowych, zdegenerowanych, z gatunkami ekspansywnymi.',
      help: `Co wpisać: jaki procent powierzchni transektu zajmują płaty typowo wykształcone – bujne, wielowarstwowe, bogate gatunkowo, z udziałem gatunków charakterystycznych dla zespołu i związku. Reszta to płaty przejściowe (do łąki świeżej, młaki, ziołorośli), nietypowe albo zdegenerowane (z ekspansją wiązówki, sitowia leśnego, krzewów).

Progi: co najmniej 80% – FV, 50–79% – U1, poniżej 50% – U2. Ocenę U2 daje też sytuacja, gdy płaty na transekcie są generalnie źle zachowane i ubogie w gatunki – wtedy popraw podpowiedź.

Dlaczego: wskaźnik mówi, jaka część siedliska ma właściwą strukturę gatunkową. W ostatnim cyklu monitoringu był najczęściej oceniany najgorzej.`,
      thresholds: {
        FV: 'Płaty dobrze zachowane stanowią nie mniej niż 80% powierzchni transektu',
        U1: 'Płaty dobrze zachowane stanowią 50–79% powierzchni transektu lub generalnie płaty na transekcie mało typowe, średnio bogate w gatunki',
        U2: 'Płaty dobrze zachowane stanowią mniej niż 50% powierzchni transektu lub generalnie płaty na transekcie źle zachowane, ubogie w gatunki',
      },
      inputs: [
        {
          kind: 'number',
          name: 'share',
          label: 'Udział dobrze zachowanych płatów',
          unit: '%',
          min: 0,
          max: 100,
          required: true,
          help: 'Procent powierzchni transektu zajęty przez typowo wykształcone płaty siedliska, szacowany w dziesiątkach procent (np. 80, 85).',
        },
      ],
      suggest: (i) => {
        const v = num(i.share)
        if (v === undefined) return null
        return v >= 80 ? 'FV' : v >= 50 ? 'U1' : 'U2'
      },
      describe: (i) => (num(i.share) === undefined ? '' : `${fmt(num(i.share))} powierzchni transektu`),
    },
    {
      id: 'litter',
      label: 'Wojłok (martwa materia organiczna)',
      parameter: 'structure',
      description:
        'Grubość warstwy nierozłożonej materii organicznej ponad poziomem próchnicznym, w cm: wartość minimalna, maksymalna i średnia z 20 pomiarów w płacie siedliska.',
      help: `Jak mierzyć: w 20 miejscach w płacie natnij darń nożem i zmierz linijką grubość warstwy nierozłożonej materii organicznej odkładającej się ponad poziomem próchnicznym. Wpisz minimum, maksimum i średnią.

Pułapka: nie myl wojłoku z zalegającym, niezebranym sianem po ostatnim pokosie.

Progi (średnia): poniżej 2 cm – FV, 2–5 cm – U1, ponad 5 cm – U2.

Dlaczego: gruby wojłok odkłada się, gdy łąka nie jest koszona. Utrudnia kiełkowanie i sprzyja wkraczaniu gatunków nitrofilnych.`,
      thresholds: { FV: '<2 cm', U1: '2–5 cm', U2: '>5 cm' },
      inputs: [
        { kind: 'number', name: 'min', label: 'Minimum', unit: 'cm', min: 0, group: 'Grubość wojłoku z 20 pomiarów', groupCols: 3, help: 'Najmniejsza z 20 zmierzonych grubości, w cm.' },
        { kind: 'number', name: 'max', label: 'Maksimum', unit: 'cm', min: 0, group: 'Grubość wojłoku z 20 pomiarów', help: 'Największa z 20 zmierzonych grubości, w cm.' },
        { kind: 'number', name: 'mean', label: 'Średnia', unit: 'cm', min: 0, required: true, group: 'Grubość wojłoku z 20 pomiarów', help: 'Średnia z 20 pomiarów, w cm. Od niej zależy podpowiedź oceny.' },
      ],
      suggest: (i) => {
        const v = num(i.mean)
        if (v === undefined) return null
        return v < 2 ? 'FV' : v <= 5 ? 'U1' : 'U2'
      },
      warn: (i) => {
        const [a, b, c] = [num(i.min), num(i.max), num(i.mean)]
        if (c === undefined) return null
        if ((a !== undefined && c < a) || (b !== undefined && c > b)) return 'Średnia leży poza zakresem minimum–maksimum.'
        return null
      },
      describe: (i) => {
        const [a, b, c] = [num(i.min), num(i.max), num(i.mean)]
        const range = a !== undefined && b !== undefined ? `${cm(a)}–${cm(b)} cm` : ''
        const avg = c === undefined ? '' : `średnio ${cm(c)} cm`
        return [range, avg].filter(Boolean).join('; ')
      },
    },
    {
      id: 'drainage',
      label: 'Melioracje odwadniające',
      parameter: 'structure',
      description:
        'Obecność infrastruktury melioracyjnej (kanały, rowy, dreny) i efektywność jej działania na stanowisku i w bliskim sąsiedztwie.',
      help: `Co wybrać: czy na stanowisku i w bliskim sąsiedztwie są rowy, kanały, dreny, jak są głębokie, jaki jest w nich poziom wody i czy woda z nich odpływa, czy stagnuje. W opisie podaj konkrety, np. „pozostałości drenów z lat 80., brak czynnych rowów, siedlisko dobrze uwodnione”.

Dlaczego: łąki wilgotne istnieją dzięki wysokiemu poziomowi wód gruntowych. Czynne melioracje przesuszają je i zamieniają w łąki świeże. Wskaźnik określa stopień narażenia siedliska na odwodnienie.`,
      thresholds: {
        FV: 'Brak kanałów i rowów odwadniających, bądź infrastruktura melioracyjna w wystarczającym stopniu zneutralizowana na skutek podjętych działań ochronnych (zasypywanie rowów, budowa zastawek itp.)',
        U1: 'Sieć rowów melioracyjnych oraz innych elementów infrastruktury w niewielkim stopniu oddziałuje na warunki wodne siedliska',
        U2: 'Infrastruktura melioracyjna wyraźnie pogarsza warunki wodne siedliska',
      },
      inputs: [selectInput('Wpływ melioracji', DRAINAGE)],
      suggest: byOption({ none: 'FV', weak: 'U1', strong: 'U2' }),
      describe: (i) => labelOf(DRAINAGE, i.choice),
    },
  ],

  prospects: {
    description:
      'Realne możliwości utrzymania siedliska we właściwej kondycji lub poprawy stanu niewłaściwego: stan obecny, czynniki zagrażające w najbliższej przyszłości, reżim wodny, formy i intensywność użytkowania, zabiegi ochronne.',
    help: `Co wpisać: ekspercką ocenę, czy łąka utrzyma się w obecnym stanie albo poprawi. Zwróć uwagę na:
• użytkowanie: czy łąka jest koszona (najlepiej 1–2 razy w roku, ekstensywnie), czy zaniechano koszenia, czy jest intensyfikacja (częste koszenie, nawożenie mineralne, podsiewanie), wypas;
• reżim wodny: przesuszanie przez melioracje albo zbyt silne uwodnienie (zabagnienie, bobry);
• zabiegi ochrony czynnej – realizowane i planowane – i ich skuteczność.

Dlaczego: perspektywy to osobny parametr oceny ogólnej. Łąka w dobrym stanie, ale bez gwarancji dalszego koszenia, w ciągu kilku lat zarośnie wiązówką i krzewami.`,
    thresholds: {
      FV: 'Perspektywy ochrony siedliska dobre, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Perspektywy ochrony siedliska niepewne, możliwy nieznaczny wpływ czynników zagrażających',
      U2: 'Perspektywy ochrony siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A03', name: 'Koszenie / ścinanie trawy' },
    { code: 'A03.01', name: 'Intensywne koszenie lub intensyfikacja' },
    { code: 'A03.02', name: 'Nieintensywne koszenie' },
    { code: 'A03.03', name: 'Zaniechanie / brak koszenia' },
    { code: 'A04', name: 'Wypas' },
    { code: 'A08', name: 'Nawożenie / nawozy sztuczne' },
    { code: 'B01', name: 'Zalesianie terenów otwartych' },
    { code: 'B07', name: 'Inne rodzaje praktyk leśnych, nie wymienione powyżej' },
    { code: 'E01', name: 'Tereny zurbanizowane, tereny zamieszkane' },
    { code: 'E01.03', name: 'Zabudowa rozproszona' },
    { code: 'E01.04', name: 'Inne typy zabudowy' },
    { code: 'E03.04', name: 'Inne odpady' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02', name: 'Spowodowane przez człowieka zmiany stosunków wodnych' },
    { code: 'J02.01', name: 'Zasypywanie terenu, melioracje i osuszanie – ogólnie' },
    { code: 'J02.05.04', name: 'Zbiorniki wodne' },
    { code: 'K01.03', name: 'Wyschnięcie' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.02', name: 'Nagromadzenie materii organicznej' },
    { code: 'K04.05', name: 'Szkody wyrządzane przez roślinożerców (w tym przez zwierzynę łowną)' },
    { code: 'M01.02', name: 'Susze i zmniejszenie opadów' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. storczyki, bogactwo gatunkowe, sąsiedztwo 7230, 6510, 6520.',
        help: `Wartości przyrodnicze stanowiska poza samym siedliskiem 65XX: rzadkie i chronione gatunki (storczyki: kukułka szerokolistna, kruszczyk błotny, gółka długoostrogowa), bogactwo gatunkowe (np. „52–55 gatunków na 25 m²”), sąsiedztwo innych siedlisk (młaki eutroficzne 7230, łąki świeże 6510 i 6520, łąki trzęślicowe 6410, ziołorośla 6430). Brak – „Nie stwierdzono”.

Dlaczego: łąki wilgotne zwykle tworzą mozaikę z innymi siedliskami łąkowymi i młakami. Planując ochronę (np. termin koszenia), trzeba wiedzieć, co jeszcze się na niej odbije.`,
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: `Jakie zabiegi ochronne wykonano (kiedy, kto, w jakiej skali): koszenie z usuwaniem biomasy, odkrzaczanie, blokowanie rowów, usuwanie gatunków inwazyjnych, programy rolnośrodowiskowe. Do tego ocena skuteczności poparta obserwacjami. Brak działań – „Brak”.

Dlaczego: monitoring ma odpowiedzieć, czy ochrona działa. Bez tej informacji nie da się odróżnić naturalnych zmian od efektów zabiegów.`,
      }
    return f
  }),

  speciesCatalog: SPECIES_65XX.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer65XX(s) })),
  speciesInfo: (name) => {
    const e = findSpecies65XX(name)
    return e ? GROUP_LABELS_65XX[e.group] : undefined
  },
}
