// Metodyka 40A0 jako dane. Źródło: „Monitoring siedlisk przyrodniczych. Przewodnik metodyczny”, tom IV
// (GIOŚ, Biblioteka Monitoringu Środowiska), rozdział 40A0 Subkontynentalne zarośla okołopannońskie, tab. 1 i 2,
// oraz sprawozdania z monitoringu 40A0 z lat 2013–2014, 2016–2018 i 2024 (lista 11 wskaźników struktury).
// Wspólne typy, logika ocen i komponenty formularza leżą w src/7120 – tu są wyłącznie dane 40A0.
// Pola `help` to rozszerzone wyjaśnienia „co wpisać i dlaczego”.
import { isIsoDate } from '../../7120/habitats/dates'
import type { FieldDef, Grade, IndicatorContext, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import {
  GROUP_LABELS_40A0,
  SPECIES_40A0,
  VARIANTS_40A0,
  characteristicByClass,
  defaultLayer40A0,
  findSpecies40A0,
  rowsOfGroups,
  variantOf,
  type Variant40A0,
} from './species'

const fmt = (n: number | undefined, unit = '%') => (n === undefined ? '—' : `${String(n).replace('.', ',')}${unit === '%' ? '%' : ` ${unit}`}`)

const labelOf = (opts: SelectOption[], v: unknown) => opts.find((o) => o.value === v)?.label ?? ''

/** Ocena z selecta: mapa wartość -> ocena. */
const byOption = (map: Record<string, Grade>) => (i: InputValues) => map[String(i.choice)] ?? null

const SPECIES_LIST_HELP = `Szukaj gatunku po kilku literach nazwy naukowej albo polskiej (np. „cer fru”, „wisienka”, „tarnina”) i wybierz z listy. Każdy wybrany gatunek dostaje wiersz, w którym wpisujesz pokrycie. Gatunku spoza katalogu nie szukaj na siłę: wybierz „Dodaj własny”. Nazwy z katalogu są rozpoznawane przy liczeniu podpowiedzi oceny, własne nie.

Pokrycie podawaj w procentach powierzchni płatu albo transektu (rzut pionowy), dla „<1%” wpisz 0,5.`

const COORD_HELP = (where: string) =>
  `Współrzędne geograficzne ${where}, odczytane z odbiornika GPS (układ WGS84). Trzymaj jeden format w całej karcie, najlepiej stopnie-minuty-sekundy z oznaczeniem N/E, np. 50° 32' 10,5" N 20° 30' 41,2" E.

Zarośla 40A0 są zwykle małe (od kilkudziesięciu m² do kilkunastu arów), więc transektu 200×10 m najczęściej nie da się wytyczyć. Wtedy obserwacje prowadzi się w kilku odseparowanych płatach o powierzchni co najmniej 1 ara: w „Początku” wpisz środek pierwszego płatu, w „Środku” i „Końcu” – kolejnych płatów (z dopiskiem, np. „płat 2: …”).

Dlaczego: stanowisko trzeba odnaleźć za 5–6 lat i zbadać te same płaty. Bez współrzędnych nie da się odróżnić zmiany siedliska od zbadania innego miejsca.`

const pick7120 = (name: string): FieldDef => {
  const f = methodology7120.siteFields.find((x) => x.name === name)
  if (!f) throw new Error(`Brak pola ${name} w metodyce 7120`)
  return f
}

// ---------- wariant siedliska ----------

export const VARIANT_OPTIONS: SelectOption[] = (Object.keys(VARIANTS_40A0) as Variant40A0[]).map((v) => ({
  value: v,
  label: VARIANTS_40A0[v].label,
}))

const isCotoneaster = (ctx?: IndicatorContext) => variantOf(ctx?.site) === 'cotoneaster'
/** „wisienka stepowa”, „irga zwyczajna” albo oba, gdy wariantu jeszcze nie wybrano. */
const keyName = (ctx?: IndicatorContext) => {
  const v = variantOf(ctx?.site)
  return v ? VARIANTS_40A0[v].keyName : 'wisienka stepowa lub irga zwyczajna'
}

// ---------- opcje selektów ----------

const AREA_TREND: SelectOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się' },
  { value: 'slight', label: 'Niewielki spadek powierzchni siedliska' },
  { value: 'decline', label: 'Wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub literaturą' },
]

const FRAGMENTATION: SelectOption[] = [
  { value: 'none', label: 'Brak fragmentacji lub fragmentacja nieznaczna' },
  { value: 'medium', label: 'Średni stopień fragmentacji' },
  { value: 'high', label: 'Duży stopień fragmentacji (wszystkie płaty najwyżej po kilkanaście metrów)' },
]

const SHRUB_STRUCTURE: SelectOption[] = [
  { value: 'compact', label: 'Zwarte płaty lub duże skupienia, krzewy w rozproszeniu tylko na obrzeżach' },
  { value: 'loose', label: 'Zarośla pofragmentowane, przedzielone murawą lub innymi krzewami' },
  { value: 'remnant', label: 'Postać kadłubowa: niewielkie kępy albo pojedyncze krzewy w rozproszeniu' },
  { value: 'noData', label: 'Nie oceniano (brak danych)' },
]

const HEALTH: SelectOption[] = [
  { value: 'good', label: 'Brak oznak zmian chorobowych i uszkodzeń (lub tylko pojedyncze, znikome)' },
  { value: 'some', label: 'Nieliczne zmiany chorobowe lub zaatakowane osobniki' },
  { value: 'many', label: 'Częste zmiany chorobowe lub zaatakowane osobniki' },
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

/** Łączne pokrycie: wpisane ręcznie, a jak nie ma – suma z listy (bez gatunków siedliskotwórczych). */
function totalOtherCover(i: InputValues): number | undefined {
  const manual = num(i.cover)
  if (manual !== undefined) return manual
  const rows = speciesRows(i.species).filter((r) => r.name?.trim())
  if (rows.length === 0) return undefined
  return rowsOfGroups(rows, ['shrub', 'tree', 'other', 'invasive-high', 'invasive-low', 'expansive'], { unknownAs: 'other' }).total
}

function expansiveTotal(i: InputValues): number | undefined {
  const manual = num(i.cover)
  if (manual !== undefined) return manual
  const rows = speciesRows(i.species).filter((r) => r.name?.trim())
  if (rows.length === 0) return 0
  return rowsOfGroups(rows, ['expansive'], { unknownAs: 'expansive' }).total
}

/** Wojłok: średnia z pomiarów, a gdy jej brak – środek podanego zakresu. */
function litterValue(i: InputValues): number | undefined {
  const avg = num(i.mean)
  if (avg !== undefined) return avg
  const lo = num(i.min)
  const hi = num(i.max)
  if (lo !== undefined && hi !== undefined) return (lo + hi) / 2
  return undefined
}

const cm = (n: number | undefined) => (n === undefined ? '' : `${String(n).replace('.', ',')} cm`)

export const methodology40A0: Methodology = {
  code: '40A0',
  name: 'Subkontynentalne zarośla okołopannońskie',
  source:
    'GIOŚ, Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, tom IV, rozdz. 40A0 Subkontynentalne zarośla okołopannońskie (tab. 1 i 2); sprawozdania z monitoringu 40A0 z lat 2013–2014, 2016–2018 i 2024',

  siteFields: [
    {
      kind: 'text',
      name: 'siteName',
      label: 'Nazwa stanowiska',
      required: true,
      placeholder: 'np. Garb Pińczowski',
      help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Garb Pińczowski”, „Kruczy Kamień 1”. Jeśli stanowisko już istnieje w bazie GIOŚ, przepisz nazwę co do znaku.

Dlaczego: 40A0 bada się co 5–6 lat na tych samych kilkunastu stanowiskach w Polsce. Stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty i zobaczyć trend.`,
    },
    pick7120('guid'),
    {
      kind: 'select',
      name: 'variant',
      label: 'Wariant siedliska',
      options: VARIANT_OPTIONS,
      required: true,
      hint: 'Od wariantu zależy gatunek siedliskotwórczy, ocena fragmentacji i to, czy ocenia się wysokość krzewów.',
      help: `W Polsce siedlisko 40A0 reprezentują dwa zbiorowiska:
• zarośla wisienki stepowej (Prunetum fruticosae) – Lubelszczyzna, Niecka Nidziańska, Ojców, Wyżyna Miechowska; niskie zarośla wisienki Cerasus fruticosa w mozaice z murawami kserotermicznymi;
• naskalne zarośla irgi zwyczajnej (Junipero communis-Cotoneasteretum integerrimi) – Sudety (przełom Nysy Kłodzkiej, Ostrzyca Proboszczowicka, Kruczy Kamień); niskie, czasem płożące krzewy irgi Cotoneaster integerrimus na skałach.

Dlaczego: przewodnik ocenia oba zbiorowiska tymi samymi wskaźnikami, ale gatunkiem siedliskotwórczym jest raz wisienka, raz irga. W zaroślach irgi fragmentacja jest naturalna (krzewy trzymają się skał), a wskaźnika „wysokość krzewów wisienki” się nie stosuje (sprawozdania dają tam XX).`,
    },
    {
      kind: 'text',
      name: 'siteType',
      label: 'Typ stanowiska',
      placeholder: 'np. referencyjne',
      hint: 'Jak w bazie monitoringu, np. „referencyjne”.',
      help: `Typ stanowiska w sieci monitoringu, np. „referencyjne” – stanowisko o dobrze wykształconym siedlisku, które służy za punkt odniesienia dla innych. Jeśli nie wiesz, zostaw puste.

Dlaczego: przy ocenie na poziomie kraju stanowiska referencyjne pokazują, jak wygląda siedlisko w dobrym stanie.`,
    },
    {
      kind: 'text',
      name: 'communities',
      label: 'Zbiorowiska roślinne',
      required: true,
      hint: 'Np. Prunetum fruticosae, Inuletum ensifoliae, Thalictro-Salvietum.',
      help: `Wszystkie zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi, zaczynając od zarośli 40A0: Prunetum fruticosae (zarośla wisienki) albo Junipero communis-Cotoneasteretum integerrimi (zarośla irgi). Dopisz murawy, z którymi zarośla tworzą mozaikę (np. Inuletum ensifoliae, Thalictro-Salvietum pratensis – siedlisko 6210, murawy naskalne – 6110, 8220) i zarośla z klasy Rhamno-Prunetea.

Dlaczego: 40A0 zawsze występuje w mozaice z murawami. Spis zbiorowisk pokazuje, w co zarośla przechodzą i z czym konkurują.`,
    },
    {
      kind: 'textarea',
      name: 'description',
      label: 'Opis siedliska na stanowisku',
      rows: 10,
      required: true,
      hint: 'Położenie płatów, ich wielkość i zwarcie, towarzyszące krzewy, murawy, ślady użytkowania.',
      help: `Syntetyczny opis stanowiska w kilku zdaniach:
• gdzie leżą płaty zarośli (stok, ekspozycja, podnóże, skały), ile ich jest i jak duże;
• zwarcie i wysokość zarośli, udział wisienki (irgi) i innych krzewów (tarnina, dereń, głogi, róże);
• murawy wokół: klasa Festuco-Brometea, gatunki ekspansywne (trzcinnik, perz);
• historia i użytkowanie: dawne odłogi, wypas, koszenie, zalesienia, wypalanie.

Dlaczego: zarośla wisienki są delikatne i łatwo je zagłuszają silniejsze krzewy. Opis pozwala kolejnemu obserwatorowi zrozumieć, czy płaty się rozrastają, czy zarastają tarniną i drzewami.`,
    },
    {
      kind: 'number',
      name: 'areaHa',
      label: 'Powierzchnia płatów siedliska',
      unit: 'ha',
      min: 0,
      required: true,
      help: `Łączna powierzchnia wszystkich płatów 40A0 na stanowisku, w hektarach (np. 0,12 ha = 12 arów). Najlepiej z GPS (obejście płatów) albo z ortofotomapy. Typowo od kilku do kilkunastu arów, w zaroślach naskalnych jeszcze mniej.

Dlaczego: zmiana powierzchni płatów między obserwacjami to podstawa parametru „Powierzchnia siedliska”.`,
    },
    pick7120('protectedAreas'),
    {
      kind: 'text',
      name: 'manager',
      label: 'Zarządzający terenem',
      placeholder: 'np. własność prywatna',
      help: `Kto zarządza terenem albo do kogo należy: własność prywatna, gmina, Lasy Państwowe (nadleśnictwo), park narodowy, RDOŚ. Przy kilku właścicielach wymień ich.

Dlaczego: od własności zależy, czy i jak da się prowadzić ochronę czynną (np. wycinanie tarniny). Na gruntach prywatnych bez ochrony prawnej perspektywy są zwykle gorsze.`,
    },
    {
      kind: 'text',
      name: 'coordStart',
      group: 'Współrzędne geograficzne',
      wide: true,
      label: 'Początek transektu (lub płat 1)',
      required: true,
      placeholder: '50° 32\' 10,5" N 20° 30\' 41,2" E',
      help: COORD_HELP('początku osi transektu albo środka pierwszego badanego płatu'),
    },
    { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu (lub płat 2)', help: COORD_HELP('środka osi transektu albo drugiego płatu') },
    { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu (lub płat 3)', help: COORD_HELP('końca osi transektu albo trzeciego płatu') },
    {
      kind: 'text',
      name: 'transect',
      label: 'Wymiary transektu',
      defaultValue: '200x10 m',
      required: true,
      hint: 'Gdy transektu nie da się wytyczyć, opisz badane płaty, np. „3 płaty: 2 a, 1,5 a, 1 a”.',
      help: `Faktyczne wymiary transektu albo opis badanych powierzchni. Przewodnik zakłada, że w 40A0 transektu zwykle nie da się wytyczyć, bo zarośla są za małe. Wtedy bada się kilka odseparowanych płatów o powierzchni co najmniej 1 ara (z GPS), a najlepiej cały płat, jeśli ma mniej niż 20 arów. Gdy któryś płat pozwala na transekt, wytycza się go jak w innych siedliskach (ok. 200×10 m) z trzema zdjęciami fitosocjologicznymi.

Dlaczego: wszystkie pokrycia (%) liczy się względem badanej powierzchni. Bez jej opisu wyniki z różnych lat są nieporównywalne.`,
    },
    {
      kind: 'text',
      name: 'altitude',
      label: 'Wysokość n.p.m.',
      unit: 'm n.p.m.',
      placeholder: 'np. 270–290',
      required: true,
      help: `Wysokość nad poziomem morza w metrach, z GPS albo mapy. Na stokach podaj zakres (np. „270–290”).

Dlaczego: zarośla wisienki rosną na wyżynach (ok. 200–400 m), zarośla irgi – na skałach Sudetów. Wysokość pomaga kolejnemu obserwatorowi trafić w ten sam fragment stoku.`,
    },
    {
      kind: 'date',
      name: 'date',
      label: 'Data obserwacji',
      placeholder: 'DD.MM.RRRR, np. 16.05.2013',
      required: true,
      hint: 'Optymalnie maj–czerwiec (wisienka najlepiej widoczna w kwitnieniu: koniec kwietnia, początek maja).',
      help: `Dzień obserwacji w terenie. Optymalny termin to fenologiczne optimum muraw, czyli maj–czerwiec: można wtedy zrobić pełne zdjęcie fitosocjologiczne i ocenić wszystkie wskaźniki. Wisienka stepowa najlepiej odcina się od murawy w czasie kwitnienia (koniec kwietnia – początek maja); dobrze widać ją też w czasie owocowania (lipiec), a po błyszczących liściach – przez cały sezon. Irgę rozpoznaje się w całym sezonie wegetacyjnym.

Dlaczego: poza optimum część gatunków muraw jest nie do oznaczenia, więc lista gatunków charakterystycznych wyjdzie zaniżona. Stanowiska kontroluje się nie rzadziej niż co 5–6 lat.`,
      warn: (v) => {
        if (!isIsoDate(v)) return null
        const [, m, d] = v.split('-').map(Number)
        const ok = (m === 4 && d >= 20) || m === 5 || m === 6 || m === 7
        return ok ? null : 'Termin poza optymalnym oknem (maj–czerwiec, ewentualnie koniec kwietnia lub lipiec). Spis gatunków muraw może być niepełny.'
      },
    },
    {
      ...pick7120('observer'),
      label: 'Wykonawca (ekspert lokalny)',
    },
    {
      kind: 'text',
      name: 'additionalExperts',
      label: 'Dodatkowi eksperci',
      help: 'Imiona i nazwiska osób, które uczestniczyły w obserwacji albo konsultowały oznaczenia (np. specjalista od róż, głogów albo mieszańców wiśni). Brak – zostaw puste.',
    },
  ],

  releves: {
    defaultCount: 3,
    intro:
      'W płatach siedliska wykonuje się 1–3 zdjęcia fitosocjologiczne klasyczną metodą Braun-Blanqueta, każde 5×5 m (25 m²), z położeniem z GPS. Jeśli któryś płat pozwala wytyczyć transekt (ok. 200×10 m), robi się 3 zdjęcia: na początku, w środku i na końcu transektu. Liczbę zdjęć możesz zmieniać – przy małych płatach 1–2 zdjęcia to normalna sytuacja.',
    fields: methodology7120.releves.fields.map((f): FieldDef => {
      switch (f.name) {
        case 'coords':
          return {
            ...f,
            help: 'Współrzędne GPS środka powierzchni zdjęcia (5×5 m), w tym samym formacie co współrzędne stanowiska.\n\nDlaczego: zdjęcia powtarza się dokładnie w tych samych miejscach – to najdokładniejszy zapis zmian w składzie zarośli i murawy.',
          }
        case 'area':
          return {
            ...f,
            help: 'Powierzchnia zdjęcia w m². Standard dla 40A0 to 5×5 m = 25 m². Zmieniaj tylko wtedy, gdy płat jest mniejszy, i wpisz faktyczną wartość.\n\nDlaczego: liczba gatunków rośnie z powierzchnią – zdjęcia o różnej wielkości nie są porównywalne.',
          }
        case 'slope':
          return {
            ...f,
            help: 'Nachylenie powierzchni w stopniach (klinometr). Zarośla wisienki rosną zwykle na stokach, często 5–30°, zarośla irgi – na skałach, nawet bardziej stromych.\n\nDlaczego: stromy, nasłoneczniony stok to warunek istnienia kserotermicznych zarośli. Na łagodnych podnóżach szybciej wkraczają tarnina i drzewa.',
          }
        case 'exposure':
          return {
            ...f,
            placeholder: 'np. S, SW',
            help: 'Kierunek, w którym opada powierzchnia (N, NE, E, SE, S, SW, W, NW), określony kompasem. Dla 40A0 najczęściej S albo SW.\n\nDlaczego: wisienka i gatunki muraw kserotermicznych potrzebują najcieplejszych, południowych stoków (liczba termiczna T = 5).',
          }
        case 'coverA':
          return { ...f, help: 'Warstwa A – drzewa (zwykle powyżej ok. 4 m): procent powierzchni zdjęcia pod koronami drzew. W dobrze zachowanych zaroślach brak albo pojedyncze.\n\nDlaczego: wisienka jest światłożądna (L = 4) i nie znosi ocienienia. Rosnące zwarcie drzew (sosna, brzoza, grusza) zapowiada jej zanik.' }
        case 'coverB':
          return { ...f, help: 'Warstwa B – krzewy: procent powierzchni zdjęcia pod krzewami, łącznie z wisienką (irgą) i innymi krzewami (tarnina, dereń, głogi, róże).\n\nDlaczego: zarośla 40A0 tworzą płaty o zwarciu 70–100%. Zwarcie warstwy B mówi, czy zdjęcie leży w zwartym płacie, czy w murawie z pojedynczymi krzewami.' }
        case 'coverC':
          return { ...f, help: 'Warstwa C – zielna: procent powierzchni zdjęcia pokryty przez rośliny zielne, w tym gatunki muraw kserotermicznych i niska wisienka, jeśli nie przekracza wysokości runi.\n\nDlaczego: pod zwartymi krzewami ruń murawy powoli ustępuje. Spadek zwarcia warstwy C przy rosnącym B to normalny przebieg sukcesji.' }
        case 'coverD':
          return { ...f, help: 'Warstwa D – mszysta: mchy i porosty naziemne. W zaroślach 40A0 zwykle niewielka albo brak; w zaroślach irgi na skałach może być większa.\n\nDlaczego: pełny zapis struktury zdjęcia. Brak warstwy – wpisz 0.' }
        case 'heightA':
        case 'heightB':
        case 'heightC':
        case 'heightD':
          return {
            ...f,
            help: `${String(f.help).split('\n')[0]}\n\nDlaczego: wysokość warstwy B to w praktyce wysokość zarośli. Wisienka osiąga 20–120 cm; wyższe krzewy w warstwie B to zwykle tarnina, dereń albo mieszańce z wiśnią hodowlaną.`,
          }
        case 'unit':
          return {
            ...f,
            help: 'Zespół, związek albo zbiorowisko, do którego należy zdjęcie, np. „Prunetum fruticosae”, „Prunion fruticosae”, „Inuletum ensifoliae” (gdy zdjęcie wypadło w murawie).\n\nDlaczego: łączy zdjęcie z opisem zbiorowisk stanowiska i pozwala śledzić, czy zarośla przechodzą w murawę albo w zarośla tarniny.',
          }
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
      description: 'Zmiana powierzchni płatów siedliska w porównaniu z wcześniejszymi badaniami albo danymi z literatury.',
      help: `Co wybrać: jak zmieniła się łączna powierzchnia płatów 40A0 od poprzedniej obserwacji (albo względem danych archiwalnych, literatury, ortofotomap). W opisie podaj powierzchnię, np. „0,12 ha”.

Pułapki:
• rozrost zarośli na dawne odłogi to wzrost powierzchni (FV), nawet jeśli w innym miejscu płaty się wycofały – liczy się bilans;
• płaty zarośnięte tarniną albo derenie z pojedynczymi krzewami wisienki to już nie 40A0 – nie wliczaj ich.

Przy pierwszej obserwacji, bez danych do porównania, wybierz „nie podlega zmianom” albo oceń XX i opisz to w polu wartości.`,
      thresholds: {
        FV: 'Nie podlega zmianom lub zwiększa się',
        U1: 'Niewielki spadek powierzchni siedliska',
        U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi w literaturze',
      },
      inputs: [selectInput('Jak zmienia się powierzchnia?', AREA_TREND, 'Wybierz kierunek zmiany łącznej powierzchni płatów.')],
      suggest: byOption({ stable: 'FV', slight: 'U1', decline: 'U2' }),
      describe: (i) => labelOf(AREA_TREND, i.choice),
    },
    {
      id: 'transectShare',
      label: 'Powierzchnia zajęta przez siedlisko na transekcie',
      parameter: 'structure',
      description:
        'Procent badanej powierzchni (transektu albo płatów) zajęty przez zarośla 40A0. Wskaźnik z karty obserwacji i sprawozdań; przewodnik nie podaje dla niego progów.',
      help: `Co wpisać: jaki procent transektu (albo badanej powierzchni) zajmują zarośla wisienki stepowej lub irgi – reszta to murawa, inne krzewy, drzewa, pola.

Przewodnik nie podaje progów w tab. 2, a sprawozdania z monitoringu oceniały: zarośla zajmujące znaczącą część transektu – FV, 40–60% – U1, niewielka część albo skrajnie mały areał – U2. Formularz przyjmuje: ponad 60% – FV, 40–60% – U1, poniżej 40% – U2. To interpretacja, nie norma – przy innej ocenie popraw podpowiedź i uzasadnij w opisie.

Gdy płaty są tak małe (pojedyncze krzewy), że ocena byłaby niewiarygodna, wybierz XX – tak robiono w sprawozdaniu 2016–2018.

Dlaczego: pokazuje, czy na stanowisku dominują zarośla, czy tylko ich resztki wśród murawy i innych krzewów.`,
      thresholds: {
        FV: 'Zarośla zajmują znaczną część transektu (formularz: ponad 60%)',
        U1: 'Zarośla zajmują 40–60% transektu',
        U2: 'Zarośla zajmują niewielką część transektu (poniżej 40%) albo skrajnie mały areał',
      },
      inputs: [
        {
          kind: 'number',
          name: 'share',
          label: 'Udział zarośli 40A0 na transekcie',
          unit: '%',
          min: 0,
          max: 100,
          help: 'Procent powierzchni transektu (albo badanych płatów) zajęty przez zarośla wisienki lub irgi, oszacowany w terenie albo z ortofotomapy.',
        },
      ],
      suggest: (i) => {
        const v = num(i.share)
        return v === undefined ? null : v > 60 ? 'FV' : v >= 40 ? 'U1' : 'U2'
      },
      explain: (i) => {
        const v = num(i.share)
        return v === undefined ? null : `Udział ${fmt(v)}. Progi 60% i 40% to interpretacja sprawozdań – przewodnik ich nie podaje.`
      },
      describe: (i) => (num(i.share) === undefined ? '' : fmt(num(i.share))),
    },
    {
      id: 'patchStructure',
      label: 'Struktura przestrzenna płatów siedliska',
      parameter: 'structure',
      description:
        'Stopień fragmentacji siedliska w trójstopniowej skali. W zaroślach naskalnych z irgą fragmentacja jest naturalna.',
      help: `Co wybrać: stopień fragmentacji siedliska na stanowisku – czy zarośla tworzą jeden lub kilka dużych, zwartych płatów (brak fragmentacji), kilka mniejszych przedzielonych murawą (średni), czy wyłącznie drobne płaty po kilkanaście metrów (duży).

Jeśli fragmentacja wynika z czynników naturalnych (stabilny, mozaikowy układ uwarunkowany podłożem, rzeźbą, ekspozycją), a nie z degeneracji (zakrzewienia tarniną, przeoranie murawy), zaznacz to w opisie wskaźnika.

W zaroślach naskalnych z irgą fragmentacja ma charakter naturalny, bo krzewy trzymają się skał – przewodnik dopuszcza tam wysoką fragmentację. Przy wariancie „irga” formularz podpowiada więc FV niezależnie od stopnia fragmentacji.

Dlaczego: drobne, izolowane płaty wisienki łatwo zagłuszają silniejsze krzewy i trudniej im się odnowić.`,
      thresholds: {
        FV: 'Brak fragmentacji lub fragmentacja nieznaczna',
        U1: 'Średni stopień fragmentacji',
        U2: 'Duży stopień fragmentacji (wszystkie płaty najwyżej po kilkanaście metrów). W zaroślach naskalnych z irgą dopuszcza się wysoką fragmentację',
      },
      inputs: [selectInput('Stopień fragmentacji', FRAGMENTATION)],
      suggest: (i, ctx) => {
        if (isCotoneaster(ctx) && i.choice) return 'FV'
        return byOption({ none: 'FV', medium: 'U1', high: 'U2' })(i)
      },
      explain: (i, ctx) =>
        isCotoneaster(ctx) && i.choice && i.choice !== 'none'
          ? 'Zarośla naskalne z irgą – fragmentacja jest naturalna, przewodnik jej nie obniża.'
          : null,
      describe: (i) => labelOf(FRAGMENTATION, i.choice),
    },
    {
      id: 'shrubStructure',
      label: 'Struktura przestrzenna zarośli',
      parameter: 'structure',
      description:
        'Czy zarośla tworzą zwarte płaty, czy rozpadają się na kępy i pojedyncze krzewy. Wskaźnik ze sprawozdań z monitoringu 2013–2024; w przewodniku brak progów.',
      help: `Co wybrać: jak zbudowane są same zarośla – jeden zwarty płat lub duże skupienia z mniejszymi kępami na obrzeżach (FV), zarośla pofragmentowane, przedzielone murawą albo innymi krzewami (U1), czy postać kadłubowa: niewielkie kępy, pojedyncze krzewy w rozproszeniu, wąski pas na skraju pola (U2).

Ten wskaźnik jest w zestawie 11 wskaźników, którymi oceniano 40A0 w latach 2013–2024, ale nie ma go w tab. 2 przewodnika. Sprawozdanie z 2024 r. zauważa, że praktycznie dubluje „Strukturę przestrzenną płatów siedliska” – różni się tym, że patrzy na budowę zarośli, a nie na rozmieszczenie płatów na stanowisku. Progi w formularzu to opisy ze sprawozdań.

Dlaczego: rozpad zwartych zarośli na kępy to zwykle pierwszy etap wypierania wisienki przez tarninę, dereń i drzewa.`,
      thresholds: {
        FV: 'Zwarte płaty lub duże skupienia, fragmentacja nieznaczna',
        U1: 'Zarośla pofragmentowane, przedzielone płatami muraw lub innych krzewów',
        U2: 'Postać kadłubowa: niewielkie kępy lub pojedyncze krzewy w rozproszeniu',
      },
      inputs: [selectInput('Budowa zarośli', SHRUB_STRUCTURE)],
      suggest: byOption({ compact: 'FV', loose: 'U1', remnant: 'U2', noData: 'XX' }),
      describe: (i) => labelOf(SHRUB_STRUCTURE, i.choice),
    },
    {
      id: 'characteristic',
      label: 'Gatunki charakterystyczne',
      parameter: 'structure',
      description:
        'Liczba gatunków charakterystycznych w każdej z dwóch klas: zarośli ciepłolubnych (Rhamno-Prunetea) i muraw kserotermicznych lub naskalnych (Festuco-Brometea).',
      help: `Co wpisać: gatunki charakterystyczne stwierdzone na stanowisku, z pokryciem. Do karty przewodnik każe wypisać do 5 gatunków o największym pokryciu, ale formularz liczy gatunki w dwóch klasach, więc wpisz wszystkie, które widzisz:
• krzewy zarośli ciepłolubnych (Rhamno-Prunetea, rząd Prunetalia spinosae): wisienka stepowa, irga zwyczajna, tawuła średnia, róże, klon polny, powojnik pnący, dereń świdwa, głogi, trzmieliny, tarnina, szakłak, wiąz polny var. suberosa;
• murawy kserotermiczne (Festuco-Brometea) i naskalne (Alysso-Sedion, Alysso-Festucion pallentis): np. oman wąskolistny, turzyca niska, kostrzewa bruzdkowana, miłek wiosenny, zawilec wielkokwiatowy, gorysz siny, ciemiężyk, a w zaroślach irgi kostrzewa blada, rozchodnik biały, rojownik.

Progi: więcej niż 4 gatunki w każdej z klas – FV, 3–4 – U1, 2 lub mniej – U2. Decyduje słabsza klasa. Gatunki spoza katalogu nie są liczone – sprawdź podpowiedź, gdy dodasz własne.

Uwaga: tarnina i dereń są tu „charakterystyczne”, ale ich ekspansja obniża inne wskaźniki (zwarcie krzewów innych niż wisienka).

Dlaczego: skład florystyczny, a zwłaszcza udział gatunków charakterystycznych, świadczy o typowości wykształcenia siedliska – zarośla wisienki to nie sam krzew, tylko mozaika z murawą.`,
      thresholds: {
        FV: 'Więcej niż 4 gatunki charakterystyczne dla każdej z klas',
        U1: '3–4 gatunki charakterystyczne dla każdej z klas',
        U2: '2 lub mniej gatunków charakterystycznych dla każdej z klas',
      },
      inputs: [
        speciesInput(
          'Gatunki charakterystyczne na stanowisku',
          'Krzewy zarośli ciepłolubnych i gatunki muraw kserotermicznych (lub naskalnych), z pokryciem w %. Pełne listy są pod „?” przy nazwie wskaźnika.',
          true,
        ),
      ],
      suggest: (i) => {
        const rows = speciesRows(i.species)
        if (!rows.some((r) => r.name?.trim())) return null
        const { shrubs, grassland } = characteristicByClass(rows)
        const weaker = Math.min(shrubs.length, grassland.length)
        return weaker > 4 ? 'FV' : weaker >= 3 ? 'U1' : 'U2'
      },
      explain: (i) => {
        const rows = speciesRows(i.species)
        if (!rows.some((r) => r.name?.trim())) return null
        const { shrubs, grassland } = characteristicByClass(rows)
        return `Krzewy (Rhamno-Prunetea): ${shrubs.length}; murawy (Festuco-Brometea): ${grassland.length}. Decyduje słabsza klasa.`
      },
      describe: (i) => describeSpecies(speciesRows(i.species)),
    },
    {
      id: 'charState',
      label: 'Stan populacji gatunków charakterystycznych',
      parameter: 'structure',
      cardinal: true,
      description:
        'Stan zdrowotny wisienki stepowej lub irgi zwyczajnej: pasożyty (zgryzione liście, larwy), chlorozy, nekrozy.',
      help: `Co wybrać: stan zdrowotny krzewów siedliskotwórczych – wisienki stepowej albo irgi zwyczajnej. Szukaj:
• zgryzionych liści, larw, galasów, oprzędów (pasożyty, żerowanie owadów);
• chloroz (żółknięcia), nekroz, zasychania pędów;
• poskręcanych liści, braku kwitnienia i owocowania przez kolejne lata;
• krzewów ściętych albo uschniętych.

Sprawozdania oceniały: brak oznak – FV; ślady zgryzania, poskręcane liście, brak kwitnienia na części krzewów – U1; liczne uszkodzenia, ścięte i uschnięte okazy, brak owocowania od lat – U2.

Dlaczego: wisienka jest delikatna i słaba konkurencyjnie – osłabiona populacja szybciej ustępuje tarninie i murawie. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'Brak oznak zmian chorobowych i uszkodzeń (lub tylko pojedyncze, znikome)',
        U1: 'Nieliczne zmiany chorobowe lub zaatakowane osobniki',
        U2: 'Częste zmiany chorobowe lub zaatakowane osobniki',
      },
      inputs: [selectInput('Stan zdrowotny krzewów', HEALTH)],
      suggest: byOption({ good: 'FV', some: 'U1', many: 'U2' }),
      describe: (i) => labelOf(HEALTH, i.choice),
    },
    {
      id: 'keyShare',
      label: 'Udział wisienki stepowej lub irgi zwyczajnej w warstwie krzewów',
      parameter: 'structure',
      cardinal: true,
      description: 'Łączne pokrycie wisienki stepowej lub irgi zwyczajnej w płacie albo na transekcie. Gatunki te powinny dominować w zaroślach.',
      help: `Co wpisać: łączne pokrycie wisienki stepowej (w wariancie z irgą – irgi zwyczajnej) w płacie albo na transekcie, w procentach. Gdy płaty się różnią, podaj wartość dla całej badanej powierzchni, a zakres opisz (np. „od 100% w dużych skupieniach po 60% w zarastających płatach”).

Progi: powyżej 75% – FV, 50–75% – U1, poniżej 50% – U2.

Dlaczego: wisienka i irga powinny dominować w zaroślach. Jeśli występują tylko w domieszce, towarzysząc tarninie, dereniowi i innym ekspansywnym krzewom, prawdopodobnie wkrótce zostaną zagłuszone i wyparte. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'Łączne pokrycie w płacie lub na transekcie >75%',
        U1: 'Łączne pokrycie w płacie lub na transekcie 50–75%',
        U2: 'Łączne pokrycie w płacie lub na transekcie <50%',
      },
      inputs: [
        {
          kind: 'number',
          name: 'cover',
          label: 'Pokrycie wisienki (irgi) w warstwie krzewów',
          unit: '%',
          min: 0,
          max: 100,
          required: true,
          help: 'Łączne pokrycie gatunku siedliskotwórczego (wisienka stepowa albo irga zwyczajna) w płacie lub na transekcie, w %. Przy różnych płatach – wartość dla całej badanej powierzchni.',
        },
      ],
      suggest: (i) => {
        const v = num(i.cover)
        if (v === undefined) return null
        return v > 75 ? 'FV' : v >= 50 ? 'U1' : 'U2'
      },
      explain: (i, ctx) => {
        const v = num(i.cover)
        return v === undefined ? null : `Pokrycie: ${keyName(ctx)} ${fmt(v)}.`
      },
      describe: (i, ctx) => {
        const v = num(i.cover)
        return v === undefined ? '' : `${keyName(ctx)} ${fmt(v)}`
      },
    },
    {
      id: 'otherShrubs',
      label: 'Zwarcie drzew i krzewów innych niż wisienka stepowa lub irga zwyczajna',
      parameter: 'structure',
      description:
        'Sumaryczne pokrycie krzewów i drzew innych niż wisienka lub irga, z listą gatunków. Szczególnie ważne są gatunki pionierskie i dające odrosty korzeniowe.',
      help: `Co wpisać: wszystkie krzewy i drzewa inne niż wisienka stepowa i irga zwyczajna, z pokryciem w %: tarnina, dereń świdwa, głogi, róże, trzmieliny, a z drzew sosna, brzoza, grusza, jesion. Łączne pokrycie wpisz, jeśli je szacowałeś – pokrycia gatunków nakładają się na siebie, więc suma z listy bywa za duża. Puste pole = suma z listy (bez wisienki i irgi).

Szczególną uwagę zwróć na gatunki pionierskie i dające odrosty korzeniowe (tarnina, dereń, głogi, róże). Obecność młodych drzew w zaroślach jest oznaką zaawansowanego stadium sukcesji – opisz ją.

Progi: poniżej 25% – FV, 25–50% – U1, powyżej 50% – U2.

Dlaczego: tarnina i dereń szybko rosną i tworzą gęste odrośla korzeniowe. Gdy zdominują płat, słabsza i niższa wisienka zaczyna się wycofywać.`,
      thresholds: {
        FV: 'Łączne pokrycie w płacie lub na transekcie <25%',
        U1: 'Łączne pokrycie w płacie lub na transekcie 25–50%',
        U2: 'Łączne pokrycie w płacie lub na transekcie >50%',
      },
      inputs: [
        speciesInput('Drzewa i krzewy inne niż wisienka i irga', 'Gatunki drzew i krzewów z pokryciem w %. Wisienki ani irgi tu nie wpisuj.'),
        {
          kind: 'number',
          name: 'cover',
          label: 'Łączne pokrycie (jeśli szacowane)',
          unit: '%',
          min: 0,
          max: 100,
          help: 'Łączne zwarcie drzew i krzewów innych niż wisienka i irga, w % płatu albo transektu. Puste = suma pokryć z listy powyżej.',
        },
      ],
      suggest: (i) => {
        const t = totalOtherCover(i)
        if (t === undefined) return null
        return t < 25 ? 'FV' : t <= 50 ? 'U1' : 'U2'
      },
      explain: (i) => {
        const t = totalOtherCover(i)
        if (t === undefined) return null
        return `${num(i.cover) !== undefined ? 'Łączne pokrycie (wpisane)' : 'Suma pokryć z listy'}: ${fmt(t)}.`
      },
      warn: (i) => {
        const key = speciesRows(i.species).filter((r) => findSpecies40A0(r.name ?? '')?.group === 'key')
        return key.length
          ? `Na liście jest ${key.map((r) => r.name).join(', ')} – gatunek siedliskotwórczy nie liczy się do tego wskaźnika (pominięto go w sumie).`
          : null
      },
      describe: (i) => {
        const t = totalOtherCover(i)
        const list = describeSpecies(speciesRows(i.species).filter((r) => findSpecies40A0(r.name ?? '')?.group !== 'key'))
        if (t === undefined) return list
        return list ? `Łącznie ${fmt(t)} – ${list}` : `Łącznie ${fmt(t)}`
      },
    },
    {
      id: 'height',
      label: 'Wysokość krzewów wisienki (tylko dla zarośli wisienki stepowej)',
      parameter: 'structure',
      cardinal: (ctx) => !isCotoneaster(ctx),
      description:
        'Zakres wysokości krzewów wisienki w cm i średnia dla płatu. Wysokie krzewy to zwykle mieszańce z wiśnią hodowlaną.',
      help: `Co wpisać: zakres wysokości krzewów wisienki (najniższe i najwyższe, w cm) i średnią dla płatu – mierz taśmą kilkanaście typowych krzewów.

Progi odnoszą się do typowej (średniej) wysokości płatu: poniżej 1,2 m – FV, 1,2–1,5 m – U1, powyżej 1,5 m – U2. Pojedyncze wyższe krzewy nie przesądzają oceny (sprawozdanie 2024 dało FV płatom z krzewami do 80 cm i pojedynczymi 1,2–1,5 m), ale opisz je.

Wskaźnik dotyczy tylko zarośli wisienki stepowej. W zaroślach irgi nie ma zastosowania: przy wariancie „irga” formularz podpowiada XX, a wskaźnik przestaje być kardynalny (inaczej XX zablokowałoby ocenę struktury).

Dlaczego: wisienka stepowa to krzew niski (wg Szafera 0,5–1,5 m). Niska wysokość zarośli pośrednio świadczy o „czystości genetycznej” wisienki, a nadmierna jest pierwszym sygnałem mieszania się materiału genetycznego z wiśnią domową. Zbiorowiska mieszańców z przewagą wiśni domowej nie powinny podlegać ochronie jako 40A0. Wskaźnik kardynalny.`,
      thresholds: { FV: '<1,2 m', U1: '1,2–1,5 m', U2: '>1,5 m' },
      inputs: [
        { kind: 'number', name: 'min', group: 'Wysokość krzewów', label: 'Najniższe', unit: 'cm', min: 0, help: 'Wysokość najniższych typowych krzewów wisienki w płacie, w cm (pomiń siewki i świeże odrosty). Razem z maksimum tworzy zakres wpisywany do karty.' },
        { kind: 'number', name: 'max', group: 'Wysokość krzewów', label: 'Najwyższe', unit: 'cm', min: 0, help: 'Wysokość najwyższych krzewów wisienki w płacie, w cm. Pojedyncze krzewy powyżej 150 cm opisz – mogą to być mieszańce z wiśnią hodowlaną.' },
        {
          kind: 'number',
          name: 'mean',
          group: 'Wysokość krzewów',
          label: 'Średnia dla płatu',
          unit: 'cm',
          min: 0,
          help: 'Średnia (typowa) wysokość krzewów wisienki w płacie, w cm. Od niej liczy się podpowiedź oceny. Pole opcjonalne przy wariancie z irgą.',
        },
      ],
      suggest: (i, ctx) => {
        if (isCotoneaster(ctx)) return 'XX'
        const v = num(i.mean)
        return v === undefined ? null : v < 120 ? 'FV' : v <= 150 ? 'U1' : 'U2'
      },
      explain: (i, ctx) => {
        if (isCotoneaster(ctx)) return 'Zarośla irgi – wskaźnik nie ma zastosowania (XX), nie jest liczony jako kardynalny.'
        const v = num(i.mean)
        const max = num(i.max)
        if (v === undefined) return null
        const tall = max !== undefined && max > 150 ? ` Najwyższe krzewy ${cm(max)} – sprawdź, czy to nie mieszańce z wiśnią hodowlaną.` : ''
        return `Średnia wysokość ${cm(v)}.${tall}`
      },
      describe: (i, ctx) => {
        if (isCotoneaster(ctx)) return 'Nie dotyczy (zarośla irgi zwyczajnej)'
        const lo = num(i.min)
        const hi = num(i.max)
        const avg = num(i.mean)
        const range = lo !== undefined && hi !== undefined ? `od ${lo} do ${hi} cm` : hi !== undefined ? `do ${hi} cm` : ''
        return [range, avg === undefined ? '' : `śr. ok. ${cm(avg)}`].filter(Boolean).join('; ')
      },
    },
    {
      id: 'invasive',
      label: 'Obce gatunki inwazyjne',
      parameter: 'structure',
      description:
        'Lista gatunków obcych geograficznie i ekologicznie z szacunkowym procentem pokrycia. Liczy się obecność, inwazyjność gatunku i obfitość.',
      help: `Co wpisać: każdy gatunek obcy geograficznie i ekologicznie dla siedliska, z pokryciem w % (dla pojedynczych osobników wpisz „<1”). Brak – zostaw listę pustą.

Katalog dzieli gatunki obce na:
• silnie inwazyjne: nawłoć późna i kanadyjska, robinia akacjowa, bożodrzew, czeremcha amerykańska, klon jesionolistny, rdestowiec, przymiotno białe;
• o niskim stopniu inwazyjności: orzech włoski, lilak pospolity, kolcowój, sumak octowiec, mahonia.
Gatunek spoza katalogu formularz traktuje jak nisko inwazyjny – popraw ocenę, jeśli wiesz, że jest inaczej.

Formularz liczy wg tab. 2: brak albo pojedyncze osobniki gatunków nisko inwazyjnych (pokrycie <1%) – FV; gatunki nisko inwazyjne o pokryciu poniżej 5% albo pojedyncze osobniki silnie inwazyjnych – U1; silnie inwazyjne w większej ilości albo ponad 5% gatunków nisko inwazyjnych – U2.

Dlaczego: gatunki obce zmieniają skład i strukturę zarośli. Silnie inwazyjne (np. nawłoć, robinia) potrafią w kilka lat zdominować płat.`,
      thresholds: {
        FV: 'Brak lub pojedyncze osobniki gatunków o niskim stopniu inwazyjności, tj. nie zagrażające różnorodności biologicznej',
        U1: 'Gatunki o niskim stopniu inwazyjności w pokryciu <5% transektu lub pojedyncze osobniki gatunków wysoce inwazyjnych',
        U2: 'Obecne gatunki silnie inwazyjne lub >5% transektu zajęte przez gatunki o niskim stopniu inwazyjności',
      },
      inputs: [speciesInput('Obce gatunki inwazyjne', 'Gatunki obce z pokryciem w %. Brak – zostaw pustą listę.')],
      suggest: (i) => {
        const rows = speciesRows(i.species).filter((r) => r.name?.trim())
        if (rows.length === 0) return 'FV'
        if (rows.some((r) => num(r.cover) === undefined)) return null
        const isHigh = (r: { name: string }) => findSpecies40A0(r.name)?.group === 'invasive-high'
        const sum = (rs: typeof rows) => rs.reduce((a, r) => a + (num(r.cover) ?? 0), 0)
        const high = rows.filter(isHigh)
        const low = rows.filter((r) => !isHigh(r))
        // „pojedyncze osobniki” = pokrycie poniżej 1%
        if (high.length) return sum(high) < 1 ? 'U1' : 'U2'
        if (low.every((r) => (num(r.cover) ?? 0) < 1)) return 'FV'
        return sum(low) < 5 ? 'U1' : 'U2'
      },
      explain: (i) => {
        const rows = speciesRows(i.species).filter((r) => r.name?.trim())
        if (rows.length === 0) return null
        const high = rowsOfGroups(rows, ['invasive-high'])
        const lowNames = rows.filter((r) => !high.names.includes(r.name.trim())).map((r) => r.name.trim())
        return [
          high.names.length ? `Silnie inwazyjne: ${high.names.join(', ')} (${fmt(high.total)}).` : '',
          lowNames.length ? `Nisko inwazyjne lub spoza katalogu: ${lowNames.join(', ')}.` : '',
          '„Pojedyncze osobniki” = pokrycie poniżej 1%.',
        ]
          .filter(Boolean)
          .join(' ')
      },
      describe: (i) => describeSpecies(speciesRows(i.species)) || 'Brak',
    },
    {
      id: 'expansive',
      label: 'Gatunki ekspansywne roślin zielnych',
      parameter: 'structure',
      description:
        'Rośliny zielne rozprzestrzeniające się w siedlisku, z szacunkowym pokryciem: ekspansywne trawy (trzcinnik piaskowy, perze), ruderalne (bylica), jeżyny, orlica.',
      help: `Co wpisać: rodzime rośliny zielne, które rozprzestrzeniają się w zaroślach i mogą im zagrozić, z pokryciem w %: trzcinnik piaskowy Calamagrostis epigejos, perz właściwy Elymus repens, perz siny Elymus hispidus, bylica pospolita Artemisia vulgaris, jeżyny Rubus spp., orlica Pteridium aquilinum. Gatunków obcych tu nie wpisuj – mają swój wskaźnik. Brak – zostaw listę pustą.

Łączne pokrycie wpisz, jeśli je szacowałeś; puste pole = suma z listy.

Progi: łączne pokrycie poniżej 20% – FV, 20–50% – U1, powyżej 50% – U2.

Uwaga: w zaroślach irgi zwyczajnej obecność tych gatunków świadczy o daleko posuniętej degeneracji płatów – opisz to, nawet jeśli pokrycie jest niskie.

Dlaczego: ekspansywne trawy i ruderalne byliny wyróżniają się dużą siłą konkurencji. Zagłuszają gatunki muraw i siewki wisienki, a nagromadzony wojłok utrudnia jej odnawianie.`,
      thresholds: {
        FV: 'Łączne pokrycie gatunków ekspansywnych <20%',
        U1: 'Łączne pokrycie gatunków ekspansywnych 20–50%',
        U2: 'Łączne pokrycie gatunków ekspansywnych >50%',
      },
      inputs: [
        speciesInput('Gatunki ekspansywne na stanowisku', 'Rodzime gatunki ekspansywne z pokryciem w %. Brak – zostaw pustą listę.'),
        {
          kind: 'number',
          name: 'cover',
          label: 'Łączne pokrycie gatunków ekspansywnych (jeśli szacowane)',
          unit: '%',
          min: 0,
          max: 100,
          help: 'Łączne pokrycie wszystkich gatunków ekspansywnych w %. Puste = suma pokryć z listy powyżej.',
        },
      ],
      suggest: (i) => {
        const t = expansiveTotal(i)
        return t === undefined ? null : t < 20 ? 'FV' : t <= 50 ? 'U1' : 'U2'
      },
      explain: (i) => {
        const t = expansiveTotal(i)
        if (!t) return null
        return `${num(i.cover) !== undefined ? 'Łączne pokrycie (wpisane)' : 'Suma pokryć z listy'}: ${fmt(t)}.`
      },
      warn: (i, ctx) => {
        const n = speciesRows(i.species).filter((r) => r.name?.trim()).length
        return isCotoneaster(ctx) && n > 0
          ? 'Gatunki ekspansywne w zaroślach irgi świadczą o daleko posuniętej degeneracji płatów – opisz to w wartości wskaźnika.'
          : null
      },
      describe: (i) => describeSpecies(speciesRows(i.species)) || 'Brak',
    },
    {
      id: 'litter',
      label: 'Wojłok (martwa materia organiczna)',
      parameter: 'structure',
      description:
        'Grubość warstwy nierozłożonej materii organicznej nad poziomem próchnicznym: średnia z 20 pomiarów w płacie, z maksimum i minimum.',
      help: `Co wpisać: grubość wojłoku – warstwy nierozłożonych szczątków roślin (zeszłoroczne trawy, liście) odkładającej się ponad poziomem próchnicznym gleby. Mierz taśmą mierniczą w 20 punktach w płacie siedliska. Wpisz najmniejszą i największą wartość oraz średnią. Zaznacz w opisie, czy wojłok rozkłada się równomiernie, czy w płatach.

Gdy nie liczyłeś średniej, formularz bierze środek zakresu (np. 5–10 cm → 7,5 cm).

Progi: poniżej 10 cm – FV, 10–15 cm – U1, powyżej 15 cm – U2.

Dlaczego: wisienka i gatunki muraw potrzebują gleb umiarkowanie ubogich (liczba trofizmu Tr = 3). Grubszy wojłok to wzrost trofii z rozkładu martwej materii, ocienienie siewek i wypieranie gatunków murawowych. Gromadzi się w nieużytkowanych, zwartych zaroślach.`,
      thresholds: { FV: '<10 cm', U1: '10–15 cm', U2: '>15 cm' },
      inputs: [
        { kind: 'number', name: 'min', group: 'Grubość wojłoku', label: 'Minimum', unit: 'cm', min: 0, help: 'Najmniejsza z 20 zmierzonych grubości wojłoku, w cm (miejsca bez wojłoku = 0). Razem z maksimum pokazuje, czy wojłok leży równomiernie.' },
        { kind: 'number', name: 'max', group: 'Grubość wojłoku', label: 'Maksimum', unit: 'cm', min: 0, help: 'Największa z 20 zmierzonych grubości wojłoku, w cm. Duża różnica między minimum a maksimum oznacza wojłok gromadzący się płatami.' },
        { kind: 'number', name: 'mean', group: 'Grubość wojłoku', label: 'Średnia z 20 pomiarów', unit: 'cm', min: 0, help: 'Średnia grubość wojłoku z 20 pomiarów w płacie, w cm. Od niej liczy się podpowiedź oceny.' },
      ],
      suggest: (i) => {
        const v = litterValue(i)
        return v === undefined ? null : v < 10 ? 'FV' : v <= 15 ? 'U1' : 'U2'
      },
      explain: (i) => {
        const v = litterValue(i)
        if (v === undefined) return null
        return num(i.mean) !== undefined ? `Średnia ${cm(v)}.` : `Brak średniej – przyjęto środek zakresu: ${cm(v)}.`
      },
      describe: (i) => {
        const lo = num(i.min)
        const hi = num(i.max)
        const avg = num(i.mean)
        const range = lo !== undefined && hi !== undefined ? `${String(lo).replace('.', ',')}–${String(hi).replace('.', ',')} cm` : ''
        return [range, avg === undefined ? '' : `średnio ${cm(avg)}`].filter(Boolean).join(', ')
      },
    },
  ],

  prospects: {
    description:
      'Realne możliwości utrzymania siedliska we właściwej kondycji: własność gruntów, reżim ochronny, gospodarka, działania ochronne, tendencje rozwojowe, wrażliwość na ekstremalne zjawiska klimatyczne.',
    help: `Co wpisać: ekspercką ocenę, czy zarośla utrzymają się we właściwej kondycji w najbliższej przyszłości, uwzględniającą obecny stan i czynniki, które mogą na niego wpłynąć:
• rodzaj własności gruntów (prywatna, państwowa) i reżim ochronny (rezerwat, użytek ekologiczny, brak ochrony);
• sposób gospodarowania: zarzucenie wypasu i koszenia, zalesianie odłogów, uprawy u podnóża;
• wykonywane działania ochronne (wycinanie tarniny i derenia, usuwanie drzew);
• tendencje: czy zarośla się rozrastają, czy zarastają innymi krzewami i drzewami;
• wrażliwość na susze i nawalne opady.

Ochrona bierna (ścisła) jest dla wisienki niewłaściwa – sukcesja w krótkim czasie zabiera jej warunki siedliskowe. Wypalanie też jej szkodzi.

Dlaczego: perspektywy to osobny parametr oceny ogólnej. Płat w dobrym stanie, ale bez ochrony i z postępującą sukcesją tarniny, może za 5 lat już nie istnieć.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Perspektywy zachowania siedliska niepewne, obserwuje się oddziaływanie czynników, które mogą pogorszyć jego stan ochrony',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A02', name: 'Zmiana sposobu uprawy' },
    { code: 'A03.03', name: 'Zaniechanie/brak koszenia' },
    { code: 'A04.02', name: 'Wypas nieintensywny' },
    { code: 'A04.03', name: 'Zarzucenie pasterstwa, brak wypasu' },
    { code: 'A07', name: 'Stosowanie biocydów, hormonów i chemikaliów' },
    { code: 'A08', name: 'Nawożenie' },
    { code: 'B01.01', name: 'Zalesianie terenów otwartych (drzewa rodzime)' },
    { code: 'B02.06', name: 'Przerzedzanie warstwy drzew' },
    { code: 'C01.01', name: 'Wydobywanie piasku i żwiru' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D01.02', name: 'Drogi, autostrady' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na rowerze' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J01.01', name: 'Wypalanie' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.02', name: 'Nagromadzenie materii organicznej' },
    { code: 'K04.01', name: 'Konkurencja' },
    { code: 'K05.02', name: 'Zmniejszenie płodności / depresja genetyczna u roślin' },
    { code: 'M01.02', name: 'Susze i zmniejszenie opadów' },
  ],

  otherFields: [
    ...methodology7120.otherFields.flatMap((f): FieldDef[] => {
      if (f.name === 'otherValues')
        return [
          {
            ...f,
            hint: 'Np. rzadkie i chronione gatunki, sąsiedztwo muraw 6210, 6110, 8220.',
            help: `Wartości przyrodnicze stanowiska poza samymi zaroślami: rzadkie i chronione gatunki (np. storczyk drobnokwiatowy, miłek wiosenny, sasanka łąkowa, zawilec wielkokwiatowy, len włochaty), sąsiedztwo innych siedlisk (murawy kserotermiczne 6210, murawy naskalne 6110, skały 8220, ciepłolubne dąbrowy 91I0). Brak – „Nie stwierdzono”.

Dlaczego: zarośla 40A0 zawsze tworzą mozaikę z murawami. Planując ochronę (np. wycinanie krzewów), trzeba wiedzieć, co jeszcze się na niej odbije.`,
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            label: 'Wykonywane działania ochronne i ocena ich skuteczności',
            help: `Jakie działania ochronne wykonano (kiedy, kto, w jakiej skali): wycinanie lub karczowanie tarniny i derenia, przerzedzanie warstwy krzewów, usuwanie nalotu drzew i nasadzeń (np. jesionu), wypas, koszenie muraw. Do tego ocena skuteczności poparta obserwacjami. Brak działań – „Brak”.

Dlaczego: monitoring ma odpowiedzieć, czy ochrona działa. Bez tej informacji nie da się odróżnić naturalnych zmian od efektów zabiegów.`,
          },
          {
            kind: 'textarea',
            name: 'proposals',
            label: 'Propozycje wprowadzenia działań ochronnych',
            rows: 6,
            hint: 'Np. utrzymywanie zwarcia krzewów innych niż wisienka na poziomie do 30%.',
            help: `Jakie działania ochronne proponujesz dla stanowiska, konkretnie i z uzasadnieniem. Przewodnik wskazuje dla wisienki ochronę czynną:
• nieznaczne ocienienie – usuwanie drzew i nasadzeń, które zacieniają płaty;
• hamowanie konkurencji tarniny i innych krzewów – karczowanie albo regularne przerzedzanie warstwy krzewów;
• nie wypalać muraw z zaroślami.
Dla zarośli naskalnych z irgą – ochrona bierna, co najwyżej usuwanie pojedynczych drzew zacieniających skały (świerk, brzoza), a przy gatunkach lasów naskalnych (lipa, klon, dąb) tylko po osobnej analizie eksperckiej.

Dlaczego: z karty powstaje plan ochrony. Propozycja eksperta, który widział płat, jest najcenniejszą częścią tego planu.`,
          },
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_40A0.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer40A0(s) })),
  speciesInfo: (name) => {
    const e = findSpecies40A0(name)
    return e ? GROUP_LABELS_40A0[e.group] : undefined
  },
}
