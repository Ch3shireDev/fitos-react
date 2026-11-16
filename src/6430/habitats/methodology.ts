// Metodyka 6430 (ziołorośla górskie Adenostylion alliariae i ziołorośla nadrzeczne Convolvuletalia sepium) jako dane.
// Źródło: Mróz W., Świerkosz K., Kozak M. 2012, „6430 Ziołorośla górskie (Adenostylion alliariae) i ziołorośla nadrzeczne
// (Convolvuletalia sepium)” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. III, GIOŚ,
// s. 53–63 (tab. 1 i 2, lista wskaźników kardynalnych, karta „Między Kościółkami a przełęczą Brona”), z praktyką oceny
// ze sprawozdań z monitoringu 2009–2011 (badania 2011), 2015–2018 (badania 2016–2017) i 2023–2025 (badania 2024–2025).
// Siedlisko niepriorytetowe, region alpejski (Karpaty) i kontynentalny (Sudety, niż). Transekt 200 m (albo trzy punkty
// w odległości <150 m), trzy zdjęcia fitosocjologiczne: na początku, w środku i na końcu transektu.
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, mean, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_6430,
  SPECIES_6430,
  defaultLayer6430,
  findSpecies6430,
  isAlien6430,
  isCharacteristic6430,
  isExpansive6430,
  isWeakAlien6430,
  speciesKey6430,
} from './species'

// ---------- progi liczbowe (tab. 2) ----------

/** Gatunki charakterystyczne: 4 i więcej FV; 2 lub 3 U1; brak lub jeden U2. */
export const gradeCharacteristic6430 = (count: number): Grade => (count >= 4 ? 'FV' : count >= 2 ? 'U1' : 'U2')

/** Rodzime gatunki ekspansywne roślin zielnych – łączne pokrycie: <10% FV; 10–25% U1 (obie granice); >25% U2. */
export const gradeExpansive6430 = (cover: number): Grade => (cover < 10 ? 'FV' : cover <= 25 ? 'U1' : 'U2')

/** Bogactwo gatunkowe (średnia liczba gatunków w zdjęciu): >20 FV; 10–20 U1 (obie granice); <10 U2. */
export const gradeRichness6430 = (n: number): Grade => (n > 20 ? 'FV' : n >= 10 ? 'U1' : 'U2')

/**
 * Obce gatunki inwazyjne (łączne pokrycie transektu, %): brak – FV; poniżej 1% – U1; ponad 1% – U2.
 * Dokładnie 1% (luka w tab. 2) formularz liczy do U1. Obecne bez pokrycia (pojedyncze osobniki) – co najmniej U1.
 */
export function gradeAliens6430(cover: number, present = cover > 0): Grade {
  if (!present && cover <= 0) return 'FV'
  return cover <= 1 ? 'U1' : 'U2'
}

const pct = (v: number) => `${plNum(v)}%`
const round1 = (n: number) => Math.round(n * 10) / 10
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey6430(n), n])).values()]

/** Suma pokrycia wierszy listy spełniających warunek; 'present' – są wiersze, ale bez pokrycia; undefined – brak wierszy. */
function sumCover(list: unknown, pred: (name: string) => boolean = () => true): number | 'present' | undefined {
  const rows = speciesRows(list).filter((r) => r.name?.trim() && pred(r.name.trim()))
  if (!rows.length) return undefined
  const covers = rows.map((r) => num(r.cover)).filter((c): c is number => c !== undefined)
  return covers.length ? round1(covers.reduce((a, b) => a + b, 0)) : 'present'
}

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Powierzchnia stabilna – zbiorowisko zajmuje wszystkie odpowiednie miejsca w obrębie stanowiska', grade: 'FV' },
  { value: 'minor', label: 'Nieznaczne zmniejszenie powierzchni siedliska', grade: 'U1' },
  { value: 'decrease', label: 'Wyraźna utrata powierzchni (zarastanie przez las i zarośla, zasypanie, rozjeżdżenie, zerwanie przez wezbranie)', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const RIVER: GradedOption[] = [
  { value: 'natural', label: 'Brak – koryto cieku (stosunki wodne) bez śladów ingerencji człowieka', grade: 'FV' },
  { value: 'traces', label: 'Ślady dawnej regulacji albo niewielka ingerencja (odcinkowe umocnienia, przejazd lub szlak przez koryto, rozjeżdżenie)', grade: 'U1' },
  { value: 'regulated', label: 'Ciek uregulowany (wyprostowany, umocniony, z zaporami przeciwrumowiskowymi lub murem oporowym)', grade: 'U2' },
  { value: 'na', label: 'Nie dotyczy – stanowisko niezwiązane z ciekiem (źródlisko, wysięk, żleb bez koryta)', grade: 'XX' },
]
const COMPLEX: GradedOption[] = [
  { value: 'natural', label: 'W otoczeniu badanego stanowiska znajdują się zbiorowiska naturalne', grade: 'FV' },
  { value: 'seminatural', label: 'W otoczeniu zbiorowiska półnaturalne (łąki, drzewostany gospodarcze, nasadzenia, zadrzewienia)', grade: 'U1' },
  { value: 'synanthropic', label: 'W otoczeniu zbiorowiska synantropijne (ruderalne, układy antropogeniczne, zabudowa, drogi)', grade: 'U2' },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

const noteInput = (label: string, placeholder: string, help: string): FieldDef => ({ kind: 'textarea', name: 'note', label, rows: 2, placeholder, help })
const note = (i: InputValues) => String(i.note ?? '').trim()

const NONE_FIELD = (label: string, help: string): FieldDef => ({
  kind: 'select',
  name: 'none',
  label,
  options: [
    { value: '', label: '—' },
    { value: 'yes', label: 'Nie stwierdzono' },
  ],
  help,
})

const GRADE_CHOICE = (help: string): FieldDef => ({
  kind: 'select',
  name: 'choice',
  label: 'Ocena (opcjonalnie)',
  options: [{ value: '', label: '—' }, ...(['FV', 'U1', 'U2'] as const).map((g) => ({ value: g, label: g }))],
  help,
})
const chosenGrade = (i: InputValues): Grade | null => {
  const g = String(i.choice ?? '')
  return g === 'FV' || g === 'U1' || g === 'U2' ? g : null
}

const totalInput = (label: string, help: string): FieldDef => ({ kind: 'number', name: 'total', label, unit: '%', min: 0, max: 100, help })

const describeList = (i: InputValues) => {
  if (note(i)) return note(i)
  const list = describeSpecies(speciesRows(i.species))
  const t = num(i.total)
  if (list) return t !== undefined ? `${list} – łącznie ${pct(t)}` : list
  if (t !== undefined) return `Łącznie ${pct(t)}`
  return i.none === 'yes' ? 'Brak' : ''
}

// ---------- podtypy (sprawozdanie 2009–2011, Poradnik ochrony siedlisk) ----------

export const SUBTYPES_6430 = ['6430-1', '6430-2', '6430-3'] as const
export const SUBTYPE_LABELS_6430: Record<(typeof SUBTYPES_6430)[number], string> = {
  '6430-1': '6430-1 – Ziołorośla subalpejskie i reglowe',
  '6430-2': '6430-2 – Górskie, nadpotokowe ziołorośla lepiężnikowe',
  '6430-3': '6430-3 – Niżowe, nadrzeczne zbiorowiska okrajkowe',
}
export const SUBTYPE_OPTIONS: SelectOption[] = [{ value: '', label: '—' }, ...SUBTYPES_6430.map((s) => ({ value: s, label: SUBTYPE_LABELS_6430[s] }))]

// ---------- gatunki charakterystyczne ----------

const countsAsCharacteristic = (n: string) => isCharacteristic6430(n)
const characteristicNames = (i: InputValues) => distinct(rowNames(i.species).filter(countsAsCharacteristic))
function characteristicCount(i: InputValues): number | undefined {
  const c = num(i.count)
  if (c !== undefined) return c
  return rowNames(i.species).length ? characteristicNames(i).length : undefined
}

// ---------- bogactwo gatunkowe ----------

const RELEVE_COUNTS = ['n1', 'n2', 'n3'] as const
const releveCounts = (i: InputValues) => RELEVE_COUNTS.map((k) => num(i[k])).filter((v): v is number => v !== undefined)
/** Średnia liczba gatunków: wpisana wprost > średnia z liczb w zdjęciach. */
function richnessOf(i: InputValues): number | undefined {
  const c = num(i.count)
  if (c !== undefined) return c
  return mean(releveCounts(i))
}

const ordinals = (n: number) => (n === 1 ? '1' : n === 2 ? '1 i 2' : '1, 2 i 3')

// ---------- wskaźniki ----------

const SURFACE = 'w % powierzchni transektu (przybliżony procent – przewodnik: „w dziesiątkach procentów”; dla „<1%” wpisz 0,5)'

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description:
      'Powierzchnia płatów ziołorośli na stanowisku i jej zmiany od poprzedniego badania. Tab. 2 przewodnika nie podaje progów dla tego parametru – ocena wg zasad ogólnych i praktyki sprawozdań.',
    help: `Co wybrać: czy ziołorośla zajmują wszystkie odpowiednie dla nich miejsca na stanowisku i czy ich powierzchnia jest stabilna, czy maleje. Samą powierzchnię wpisz obok – trafi do „wartości”, gdy nie ma opisu.

Progi: tab. 2 ich nie podaje. Formularz stosuje praktykę sprawozdań 2016–2025: powierzchnia stabilna – FV; nieznaczne zmniejszenie – U1; wyraźna utrata – U2. Przy pierwszym badaniu bez danych do porównania – „Brak danych” (XX) albo ocena ekspercka.

Praktyka 2024–2025: FV na ponad 80% stanowisk (zwykle płaty <1 ha, rzadko 1–5 ha); U1 przy niewielkim ubytku (Kalnica, Zawoja-Polica); U2 przy dużym ubytku na rzecz lasu i zarośli (Bystra 1 i 2), po zerwaniu płatów przez wezbranie (Dolina Kamienicy koło Barcinka) i tam, gdzie siedlisko zasypano gruzem, rozjeżdżono albo zanikło. Karta z przewodnika: „Zbiorowisko zajmuje wszystkie odpowiednie miejsca w obrębie stanowiska” → FV.`,
    thresholds: thresholdsOf(AREA.filter((o) => o.grade !== 'XX')),
    inputs: [
      selectInput('Zmiana powierzchni', AREA, 'Jak zmieniła się powierzchnia ziołorośli od poprzedniego badania.'),
      { kind: 'text', name: 'areaText', label: 'Powierzchnia (opcjonalnie)', placeholder: 'np. 0,08 ha', help: 'Powierzchnia płatów ziołorośli na stanowisku, np. „0,08 ha” – trafi do pola „wartość”, gdy nie ma opisu.' },
      noteInput('Opis (opcjonalnie)', 'np. Zbiorowisko zajmuje wszystkie odpowiednie miejsca w obrębie stanowiska.', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => note(i) || String(i.areaText ?? '').trim() || labelOf(AREA, i.choice),
  },
  {
    id: 'characteristic',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków charakterystycznych (nazwa polska i łacińska) z przybliżonym procentem pokrycia transektu dla każdego gatunku. Ziołorośla górskie: miłosna górska, modrzyk górski, omieg górski, tojad mocny, wietlica alpejska, lepiężnik wyłysiały i lepiężnik biały. Ziołorośla niżowe: kielisznik zaroślowy, kanianka pospolita, oset kędzierzawy, kanianka wielka, dzięgiel litwor nadbrzeżny, starzec nadrzeczny, przytulia lepczyca, wierzbownica kosmata.',
    help: `Co wpisać: gatunki charakterystyczne stwierdzone na transekcie, z pokryciem ${SURFACE} (pokrycie nie wpływa na ocenę). Liczbę gatunków możesz też wpisać wprost.

Progi (tab. 2): 4 gatunki i więcej – FV; 2 lub 3 – U1; brak lub jeden – U2.

Jak liczy formularz: ocena wybrana w polu ma pierwszeństwo; bez niej liczba wpisana wprost; bez niej gatunki z listy, które katalog zna jako charakterystyczne (synonimy raz). Katalog zawiera listę z tab. 1 (7 górskich, 8 niżowych), „typowe gatunki” z pkt 4 przewodnika (dzięgiel litwor, starzec Fuchsa, szczaw górski, jaskier platanolistny, zerwa kłosowa, starzec górski, ciemiężyca zielona, świerząbek orzęsiony, oset łopianowaty, gwiazdnica gajowa, rzeżucha gorzka…), gatunki związku Adenostylion policzone w karcie przykładowej (wierzbownica alpejska, kozłek bzowy) i gatunki dopisywane w sprawozdaniu 2024–2025 (tojad dzióbaty i sudecki, lepiężnik różowy, starzec gajowy, rdestówka zaroślowa, merzyk kropkowany).

Rozjazdy w praktyce: w 2011 r. liczono bardzo szeroko – w 2016–2017 przy definicji z 2012 r. oceny spadły (na niżu na 44 z 49 stanowisk), „nie z pogorszenia stanu, tylko z węższej listy”. W 2024 r. znów szersza lista i FV wzrosło na niżu z 22% do 53% – sprawozdanie samo przyznaje, że to może być efekt listy. Sadziec konopiasty jest w tab. 1 wśród ekspansywnych, a sprawozdanie 2025 postuluje go jako diagnostyczny – formularz go nie liczy i ostrzega. Na niżu często jest tylko kielisznik zaroślowy (U2). Karta z przewodnika: 7 gatunków z pokryciem 1–25% → FV.

Wskaźnik kardynalny – jedyny dla 6430.`,
    thresholds: { FV: '4 gatunki charakterystyczne i więcej', U1: '2 lub 3 gatunki charakterystyczne', U2: 'Brak lub jeden gatunek charakterystyczny' },
    inputs: [
      speciesInput('Gatunki charakterystyczne', `Gatunki charakterystyczne stwierdzone na transekcie z pokryciem ${SURFACE}, np. Petasites kablikianus 25, Doronicum austriacum 10.`),
      { kind: 'number', name: 'count', label: 'Liczba gatunków charakterystycznych (opcjonalnie)', min: 0, help: 'Łączna liczba gatunków charakterystycznych na transekcie, wpisana wprost – ma pierwszeństwo przed liczeniem z listy.' },
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed liczbą gatunków (np. gdy gatunki charakterystyczne występują tylko pojedynczo albo liczysz wg innej listy). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Aconitum firmum – 1%, Adenostyles alliariae – 2%, …', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const c = characteristicCount(i)
      return c === undefined ? null : gradeCharacteristic6430(c)
    },
    explain: (i) => {
      if (chosenGrade(i)) return null
      const c = characteristicCount(i)
      if (c === undefined) return null
      if (num(i.count) !== undefined) return `Gatunków charakterystycznych: ${plNum(c)}.`
      const names = characteristicNames(i)
      return `Gatunki charakterystyczne z katalogu: ${names.length}${names.length ? ` (${names.join(', ')})` : ''}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      const eupatorium = names.filter((n) => findSpecies6430(n)?.postulated)
      if (eupatorium.length) parts.push(`${eupatorium.join(', ')} – w tab. 1 to gatunek ekspansywny; sprawozdanie 2025 postuluje go jako diagnostyczny, ale formularz go nie liczy.`)
      const other = names.filter((n) => findSpecies6430(n) && !isCharacteristic6430(n) && !findSpecies6430(n)?.postulated)
      if (other.length) parts.push(`Nie liczą się jako charakterystyczne: ${other.join(', ')}.`)
      const g = chosenGrade(i)
      const c = characteristicCount(i)
      if (g && c !== undefined && g !== gradeCharacteristic6430(c)) parts.push(`Wybrano ${g}, a z liczby gatunków wychodzi ${gradeCharacteristic6430(c)} – uzasadnij w opisie.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      const c = num(i.count)
      return list || (c !== undefined ? `${plNum(c)} gat.` : '')
    },
  },
  {
    id: 'expansive',
    label: 'Rodzime gatunki ekspansywne roślin zielnych',
    parameter: 'structure',
    description:
      'Lista gatunków ekspansywnych roślin zielnych w siedlisku z przybliżonym procentem pokrycia transektu dla każdego gatunku. Nie należy tu wykazywać obcych gatunków inwazyjnych. Do ekspansywnych można zaliczyć m.in. sadźca konopiastego, mozgę trzcinowatą, miętę długolistną, kłosownicę leśną, wiązówkę błotną, malinę i podagrycznik.',
    help: `Co wpisać: rodzime gatunki ekspansywne z pokryciem ${SURFACE}. Tab. 1: sadziec konopiasty, mozga trzcinowata, mięta długolistna, kłosownica leśna, wiązówka błotna, malina, podagrycznik. Sprawozdania 2011–2025 dopisują m.in. trzcinę, wierzbówkę kiprzycę, trzcinnik piaskowy, jeżyny, ostrożeń polny, turzycę zaostrzoną, pokrzywę, poziewniki, borówkę czernicę. Gatunki obce wpisz w „Obcych gatunkach inwazyjnych”, gatunki charakterystyczne formularz pomija.

Progi (tab. 2): nie występują lub pokrywają mniej niż 10% – FV; 10–25% badanej powierzchni – U1; ponad 25% – U2. Granice 10% i 25% formularz liczy do U1.

Praktyka: wskaźnik wprowadzony w 2012 r. (w 2011 r. oceniano zamiast niego „gatunki dominujące” i „gatunki synantropijne”). 2024–2025: U2 przy wierzbówce kiprzycy (Kondratowa), trzcinniku piaskowym i jeżynie (Przegibek), mozdze i trzcinie na niżu. Sprawozdanie 2016–2018 postuluje, by lista ekspansywnych nie zawierała gatunków charakterystycznych zespołów 6430 (np. Urtico-Calystegietum z pokrzywą, Calystegio-Eupatorietum z sadźcem) – zdecyduj i opisz. Karta z przewodnika: „Brak ekspansywnych gatunków roślin zielnych” → FV (malina w zdjęciach w warstwie B ze znikomym pokryciem).

Ocena wybrana w polu ma pierwszeństwo przed sumą. Wskaźnik niekardynalny (jego U2 obniża strukturę do U1).`,
    thresholds: { FV: 'Gatunki ekspansywne nie występują lub występują na powierzchni mniejszej niż 10%', U1: 'Gatunki ekspansywne pokrywają 10–25% badanej powierzchni', U2: 'Gatunki ekspansywne pokrywają ponad 25% badanej powierzchni' },
    inputs: [
      speciesInput('Gatunki ekspansywne', `Rodzime gatunki ekspansywne z pokryciem ${SURFACE}, np. Phalaris arundinacea 20, Rubus idaeus 5.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków ekspansywnych w % transektu – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak gatunków ekspansywnych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma rodzimych gatunków ekspansywnych – wtedy wskaźnik to FV.'),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed sumą pokrycia (np. gdy gatunek „ekspansywny” jest naturalnym składnikiem zespołu). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak ekspansywnych gatunków roślin zielnych.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const t = num(i.total)
      if (t !== undefined) return gradeExpansive6430(t)
      if (!rowNames(i.species).length) return i.none === 'yes' ? 'FV' : null
      const c = sumCover(i.species, (n) => !isCharacteristic6430(n) && !isAlien6430(n))
      if (c === undefined) return 'FV' // same gatunki charakterystyczne albo obce
      return c === 'present' ? null : gradeExpansive6430(c)
    },
    explain: (i) => {
      if (chosenGrade(i)) return null
      const t = num(i.total)
      if (t !== undefined) return `Łączne pokrycie gatunków ekspansywnych: ${pct(t)}.`
      const names = distinct(rowNames(i.species))
      if (!names.length) return null
      const skipped = names.filter((n) => isCharacteristic6430(n) || isAlien6430(n))
      const c = sumCover(i.species, (n) => !isCharacteristic6430(n) && !isAlien6430(n))
      return [
        skipped.length ? `Pominięte (charakterystyczne albo obce): ${skipped.join(', ')}` : '',
        typeof c === 'number' ? `łączne pokrycie gatunków ekspansywnych: ${pct(c)}` : c === 'present' ? 'gatunki bez pokrycia – wpisz pokrycie albo wybierz ocenę' : 'gatunków ekspansywnych: brak',
      ]
        .filter(Boolean)
        .join('; ')
        .concat('.')
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo pokrycie nie są puste.')
      const aliens = names.filter(isAlien6430)
      if (aliens.length) parts.push(`Gatunki obce wpisz we wskaźniku „Obce gatunki inwazyjne”: ${aliens.join(', ')}.`)
      const typical = names.filter(isCharacteristic6430)
      if (typical.length) parts.push(`Gatunki charakterystyczne nie są ekspansywnymi: ${typical.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'richness',
    label: 'Bogactwo gatunkowe',
    parameter: 'structure',
    description: 'Określane jako średnia liczba gatunków roślin naczyniowych w zdjęciu fitosocjologicznym.',
    help: `Co wpisać: liczbę gatunków w każdym z trzech zdjęć fitosocjologicznych – formularz policzy średnią. Średnią możesz też wpisać wprost.

Progi (tab. 2): powyżej 20 gatunków w zdjęciu – FV; 10 do 20 – U1; poniżej 10 – U2. Granice 10 i 20 formularz liczy do U1.

Co liczyć: tab. 1 mówi o roślinach naczyniowych. W praktyce bywało różnie: karta przykładowa wlicza „taksony nieoznaczone do gatunku”, których nie ma w zdjęciach w bazie (stąd 25, 24, 22 przy 22, 22 i 20 gatunkach wpisanych w zdjęcia), a sprawozdanie 2024–2025 wlicza drzewa, krzewy i mszaki („poprzednio ich nie brano pod uwagę” – Dolina Strążyska, Kalnica). Licz tak samo jak w poprzednim badaniu tego stanowiska i zapisz to w opisie.

Praktyka: w górach zwykle FV (Giewont 35–47 gat., Nad Łomniczką ok. 40), na niżu najczęściej U1 (48% stanowisk w 2024 r.). Sprawozdanie 2016–2018 kwestionuje sens wskaźnika – dużo gatunków to często apofity i gatunki obce. Karta z przewodnika: 25, 24 i 22 gatunki, średnio 23,7 → FV.`,
    thresholds: { FV: 'Powyżej 20 gatunków w zdjęciu', U1: '10 do 20 gatunków', U2: 'Poniżej 10 gatunków w zdjęciu' },
    inputs: [
      ...RELEVE_COUNTS.map(
        (k, idx): FieldDef => ({
          kind: 'number',
          name: k,
          group: 'Liczba gatunków w zdjęciach',
          groupCols: 3,
          label: `Zdjęcie ${idx + 1}`,
          min: 0,
          help: `Liczba gatunków w zdjęciu fitosocjologicznym nr ${idx + 1} (na początku, w środku albo na końcu transektu). Formularz liczy z tych liczb średnią.`,
        }),
      ),
      { kind: 'number', name: 'count', label: 'Średnia liczba gatunków w zdjęciu (opcjonalnie)', min: 0, help: 'Średnia wpisana wprost – ma pierwszeństwo przed średnią z liczb w zdjęciach (np. gdy zdjęć było więcej niż trzy).' },
      noteInput('Opis (opcjonalnie)', 'np. W zdjęciach 1, 2 i 3 odnotowano kolejno 25, 24 i 22 gatunki; średnio 23,7 gatunku/zdjęcie.', 'Krótki opis, który trafi do „wartości” w karcie zamiast opisu generowanego z liczb (np. co wliczono).'),
    ],
    suggest: (i) => {
      const n = richnessOf(i)
      return n === undefined ? null : gradeRichness6430(n)
    },
    explain: (i) => {
      const n = richnessOf(i)
      return n === undefined ? null : `Średnio ${plNum(round1(n))} gat. w zdjęciu.`
    },
    warn: (i) => {
      const c = num(i.count)
      const m = mean(releveCounts(i))
      if (c === undefined || m === undefined || Math.abs(c - m) <= 0.5) return null
      return `Wpisana średnia (${plNum(c)}) nie zgadza się ze średnią z zdjęć (${plNum(round1(m))}) – sprawdź.`
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const ns = releveCounts(i)
      const n = richnessOf(i)
      if (n === undefined) return ''
      const avg = `średnio ${plNum(round1(n))} gat./zdjęcie`
      return ns.length ? `W zdjęciach ${ordinals(ns.length)}: ${ns.map(plNum).join(', ')} gat.; ${avg}` : avg.charAt(0).toUpperCase() + avg.slice(1)
    },
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    description: 'Lista obcych gatunków inwazyjnych (polska i łacińska nazwa) z przybliżonym procentem pokrycia transektu dla każdego gatunku. W ziołoroślach notowano m.in. niecierpka gruczołowatego, rudbekię nagą, astra nowobelgijskiego, nawłocie, rdestowce, naparstnicę purpurową i kroplika żółtego.',
    help: `Co wpisać: gatunki obce z pokryciem ${SURFACE}. Łączne pokrycie możesz wpisać wprost. Najczęstsze w 2024–2025: kolczurka klapowana, niecierpek drobnokwiatowy i gruczołowaty, nawłoć późna i kanadyjska, klon jesionolistny, barszcz Sosnowskiego, rdestowce, wierzbownica gruczołowata, rudbekia naga.

Progi (tab. 2): brak – FV; poniżej 1% pokrycia – U1; obce gatunki inwazyjne pokrywają ponad 1% badanej powierzchni – U2. Dokładnie 1% (luka w tab. 2) formularz liczy do U1.

Jak liczy formularz: łączne pokrycie wpisane wprost, a bez niego suma z listy; „nie stwierdzono” → FV. Gatunek na liście bez pokrycia – formularz nie zgaduje (pojedyncze osobniki wpisz jako 0,5). Praktyka 2024–2025: pojedyncze osobniki – U1, 2–3% pokrycia – U2, jak w tab. 2. Sprawozdanie 2016–2018 uważa progi za zbyt ostre (jeden osobnik daje U1, na niżu FV prawie nieosiągalne) – formularz i tak idzie za tab. 2. Archeofity i efemerofity (tasznik, tobołki, mlecze, miotła zbożowa…) wymienia tab. 4 sprawozdania 2025 jako gatunki obce, ale nie są inwazyjne – formularz je liczy, jeśli je wpiszesz, i ostrzega. Karta z przewodnika: brak → FV.`,
    thresholds: {
      FV: 'Brak',
      U1: 'Poniżej 1% pokrycia',
      U2: 'Obce gatunki inwazyjne pokrywają ponad 1% badanej powierzchni',
    },
    inputs: [
      speciesInput('Obce gatunki inwazyjne', `Gatunki obce z pokryciem ${SURFACE}, np. Impatiens parviflora 0,5, Solidago gigantea 3.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków obcych w % transektu – ma pierwszeństwo przed sumą z listy. Dla pojedynczych osobników wpisz 0,5.'),
      NONE_FIELD('Brak gatunków obcych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków obcych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const present = rowNames(i.species).length > 0
      const t = num(i.total)
      if (t !== undefined) return gradeAliens6430(t, present || t > 0)
      if (!present) return i.none === 'yes' ? 'FV' : null
      const c = sumCover(i.species)
      return typeof c === 'number' ? gradeAliens6430(c, true) : null
    },
    explain: (i) => {
      const t = num(i.total)
      const names = distinct(rowNames(i.species))
      if (t !== undefined) return `Łączne pokrycie gatunków obcych: ${pct(t)}.`
      if (!names.length) return null
      const c = sumCover(i.species)
      return c === 'present' ? 'Gatunki obce bez pokrycia – wpisz pokrycie (pojedyncze osobniki: 0,5) albo łączne pokrycie.' : `Gatunków obcych: ${names.length}; łączne pokrycie ${pct(c as number)}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo pokrycie nie są puste.')
      const native = names.filter((n) => findSpecies6430(n) && !isAlien6430(n))
      if (native.length) parts.push(`To nie gatunki obce: ${native.join(', ')}${native.some(isExpansive6430) ? ' (rodzime ekspansywne wpisz w swoim wskaźniku)' : ''}.`)
      const weak = names.filter(isWeakAlien6430)
      if (weak.length) parts.push(`${weak.join(', ')} – gatunki obce bez tendencji do inwazji (archeofity, efemerofity, uciekinierzy z upraw). Tab. 2 dotyczy gatunków inwazyjnych – usuń je, jeśli nie chcesz ich liczyć.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'river',
    label: 'Naturalność koryta rzecznego (brak regulacji)',
    parameter: 'structure',
    description:
      'Opis charakteru koryta rzecznego. Wskaźnik stosuje się również w przypadku górskich ziołorośli przy ciekach wodnych – wówczas należy opisać charakter cieku.',
    help: `Co wybrać: czy koryto rzeki albo potoku, przy którym rosną ziołorośla, nosi ślady regulacji. Opisz charakter koryta (meandry, kamieńce, podcięcia; umocnienia, progi, mury).

Progi (tab. 2): brak (regulacji) – FV; ślady dawnej regulacji – U1; ciek uregulowany – U2.

Praktyka: 2024–2025 U1 dawano też przy rozjeżdżonym korycie albo szlaku przez koryto, U2 – Bystra 2 (zapory przeciwrumowiskowe, mur oporowy przy transekcie), na niżu ziołorośla nad całkowicie uregulowanymi ciekami. W 2011 r. wskaźnika nie oceniano przy źródliskach, w 2016–2017 dawano tam XX – w formularzu to opcja „Nie dotyczy” (XX, nie psuje oceny struktury, bo wskaźnik jest niekardynalny). Karta z przewodnika (stanowisko na stoku Babiej Góry, bez koryta) oceniła „stosunki wodne bez śladów ludzkiej ingerencji” na FV – możesz tak zrobić przy żlebach i wysiękach zamiast „Nie dotyczy”.`,
    thresholds: { FV: 'Brak', U1: 'Ślady dawnej regulacji', U2: 'Ciek uregulowany' },
    inputs: [
      selectInput('Stan koryta', RIVER, 'Stan koryta cieku (albo stosunków wodnych) na stanowisku.'),
      noteInput('Opis (opcjonalnie)', 'np. Stosunki wodne bez śladów ludzkiej ingerencji.', 'Charakter koryta albo cieku – trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(RIVER)),
    describe: (i) => note(i) || labelOf(RIVER, i.choice),
  },
  {
    id: 'complex',
    label: 'Naturalny kompleks siedlisk',
    parameter: 'structure',
    description: 'Opis charakteru roślinności w otoczeniu ziołorośli na stanowisku – lista zbiorowisk naturalnych, półnaturalnych lub synantropijnych w otoczeniu monitorowanego siedliska.',
    help: `Co wybrać: jakie zbiorowiska otaczają płaty ziołorośli. Wymień je w opisie (np. „zarośla kosodrzewiny, jarzębiny i wierzby śląskiej, maliniska, borówczyska, murawy naskalne”; „łęg olszowy, szuwar mozgowy, łąka kośna”).

Progi (tab. 2): w otoczeniu badanego stanowiska znajdują się zbiorowiska naturalne – FV; w otoczeniu zbiorowiska półnaturalne – U1; w otoczeniu zbiorowiska synantropijne – U2.

Praktyka: jeden z gorzej ocenianych wskaźników. 2024–2025: U1 przy drzewostanach gospodarczych (zwłaszcza młodnikach świerkowych), łąkach, nasadzeniach i zadrzewieniach (64% stanowisk na niżu); U2 przy zbiorowiskach ruderalnych, drogach i zabudowie (Zawoja, Myślinów). Ocena jest subiektywna – sprawozdanie 2016–2018 przypisuje część zmian różnej interpretacji ekspertów. Przy mozaice naturalnych i półnaturalnych zbiorowisk wybierz U1. Karta z przewodnika: naturalne zbiorowiska piętra subalpejskiego → FV.`,
    thresholds: thresholdsOf(COMPLEX),
    inputs: [
      selectInput('Otoczenie ziołorośli', COMPLEX, 'Charakter roślinności w otoczeniu płatów ziołorośli.'),
      noteInput('Opis (opcjonalnie)', 'np. W otoczeniu płatów inne naturalne zbiorowiska piętra subalpejskiego: zarośla kosodrzewiny Pinetum mugo, …', 'Lista zbiorowisk w otoczeniu – trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(COMPLEX)),
    describe: (i) => note(i) || labelOf(COMPLEX, i.choice),
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu (zdjęcia fitosocjologicznego nr ${where === 'początku' ? 1 : where === 'środka' ? 2 : 3}), z odbiornika GPS (WGS84). Gdy zamiast transektu są trzy płaty – współrzędne każdego z nich.

Dlaczego: w 2024 r. trzeba było poprawić geometrię dwóch stanowisk błędnie zlokalizowanych w 2016 r. (Biała Wisełka) – przez to nie dało się porównać ocen między cyklami.`

const siteFields: FieldDef[] = [
  {
    kind: 'select',
    name: 'subtype',
    label: 'Podtyp siedliska',
    options: SUBTYPE_OPTIONS,
    hint: 'Ziołorośla górskie (6430-1, 6430-2) albo niżowe nadrzeczne (6430-3).',
    help: `Podtyp dominujący na stanowisku (sprawozdanie 2009–2011, Poradnik ochrony siedlisk):
• 6430-1 – ziołorośla subalpejskie i reglowe (Adenostyletum alliariae, Athyrietum distentifolii, Aconitetum firmi, Arunco-Doronicetum austriaci) – żleby, kotły, wysięki, piętro subalpejskie i regle;
• 6430-2 – górskie, nadpotokowe ziołorośla lepiężnikowe (Petasitetum albi, Petasitetum kablikiani) – kamieńce wzdłuż potoków;
• 6430-3 – niżowe, nadrzeczne zbiorowiska okrajkowe (Senecion fluviatilis, Convolvulion sepium: Cuscuto-Calystegietum, Urtico-Calystegietum, Calystegio-Eupatorietum, Calystegio-Epilobietum hirsuti…).

Dlaczego: od podtypu zależy, której listy gatunków charakterystycznych się spodziewać (tab. 1 ma osobne listy dla ziołorośli górskich i niżowych) i czy wskaźnik „Naturalność koryta” w ogóle dotyczy stanowiska. Karta z przewodnika nie podaje podtypu – zespół Adenostyletum alliariae to 6430-1.`,
  },
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Między Kościółkami a przełęczą Brona',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Między Kościółkami a przełęczą Brona”, „Dolina Kościeliska”, „Bystra 2”, „Dolina Pilicy koło Rączek”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego stanowiska – w 2024 r. dwa stanowiska zmieniły nazwy razem z poprawioną lokalizacją.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. referencyjne',
    help: `Typ stanowiska w sieci monitoringu, np. „referencyjne” – dobrze wykształcone siedlisko, punkt odniesienia dla innych. Jeśli nie wiesz, zostaw puste.

Dlaczego: przy ocenie regionu stanowiska referencyjne pokazują, jak wygląda 6430 w dobrym stanie.`,
  },
  {
    kind: 'text',
    name: 'areaName',
    label: 'Nazwa obszaru',
    placeholder: 'np. Babia Góra',
    help: 'Obszar (pasmo, dolina rzeki, obszar Natura 2000), w którym leży stanowisko, np. „Babia Góra”, „Tatry”, „Dolina Górnej Pilicy”. W karcie z przewodnika to pole jest puste – możesz je pominąć.',
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Adenostyletum alliariae',
    help: 'Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Ziołorośla górskie – klasa Betulo-Adenostyletea, związek Adenostylion alliariae: Adenostyletum alliariae, Athyrietum distentifolii, Aconitetum firmi, Petasitetum albi, Petasitetum kablikiani, Arunco-Doronicetum austriaci. Ziołorośla niżowe – rząd Convolvuletalia sepium: Calystegio-Angelicetum archangelicae litoralis, Cuscuto-Calystegietum sepium, Senecionetum fluviatilis, Asperulo-Calystegietum sepium, Urtico-Calystegietum sepium, Calystegio-Eupatorietum, Calystegio-Epilobietum hirsuti. Sprawozdanie 2016–2018: zbiorowiska bezrangowe (np. Rumicetum alpini, Pado-Sorbetum) to nie 6430.',
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Położenie (żleb, kocioł, potok, brzeg rzeki), wielkość i liczba płatów, sąsiednie zbiorowiska, ingerencja człowieka.',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• położenie: żleb, kocioł, wysięk, stromy stok; kamieńce wzdłuż potoku; brzeg rzeki, starorzecza, zalewu;
• płaty: ile, jak duże (karta przykładowa: zwykle kilkadziesiąt m², największy ok. 400 m²), czym poprzedzielane;
• sąsiednie zbiorowiska (kosodrzewina, zarośla jarzębiny i wierzby śląskiej, łęgi, szuwary, łąki);
• ingerencja człowieka: szlaki, drogi i mosty, zrywka drewna, regulacja i umocnienia koryta, wykaszanie, śmieci.

Stanowiskiem może być zarówno 200-metrowy płat wzdłuż cieku, jak i – częściej – grupa niewielkich płatów w wilgotniejszych miejscach.`,
  },
  {
    kind: 'text',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    required: true,
    placeholder: 'np. 0,08',
    help: 'Łączna powierzchnia płatów ziołorośli na stanowisku, w hektarach albo opisem (karta z przewodnika: 0,08 ha). Sprawozdanie 2024–2025: na większości stanowisk poniżej 1 ha, rzadko 1–5 ha. Sprawozdanie 2016–2018 uznało stanowiska o powierzchni rzędu 0,5 ara za wyznaczone niewłaściwie.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „Babiogórski Park Narodowy; PLH120001 Babia Góra; PLB120011 Babia Góra”.',
    help: `Parki narodowe, rezerwaty, obszary Natura 2000 i inne formy ochrony obejmujące stanowisko. W 2024–2025 r. 82% stanowisk leżało w obszarach Natura 2000, jedna trzecia w parkach narodowych.

Dlaczego: sprawozdanie 2025 zauważa, że położenie w obszarze chronionym nie miało większego znaczenia dla stanu ziołorośli – ale ma dla perspektyw (ochrona ścisła, zwalczanie gatunków inwazyjnych przez zarządcę).`,
  }),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. Babiogórski Park Narodowy',
    help: `Kto zarządza terenem: park narodowy, nadleśnictwo, RDOŚ (rezerwat), Wody Polskie (koryta i międzywala), gmina, właściciele prywatni.

Dlaczego: od zarządcy zależy zrywka drewna wzdłuż potoków, prace w korytach, wykaszanie brzegów i zwalczanie gatunków inwazyjnych – główne czynniki dla 6430.`,
  },
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu (zdjęcie nr 1)', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu (zdjęcie nr 2)', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu (zdjęcie nr 3)', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    required: true,
    placeholder: 'np. 150x10 m',
    hint: 'Transekt długości 200 m albo trzy punkty (płaty) oddalone od siebie o mniej niż 150 m.',
    help: `Przewodnik: na stanowisku wyznacza się transekt długości 200 m, a jeśli to niemożliwe – trzy punkty położone w odległości mniejszej niż 150 m od siebie. Zdjęcia fitosocjologiczne: na początku, w środku i na końcu transektu (albo w każdym z trzech płatów). Wartości wskaźników określa się na podstawie przejścia wzdłuż transektu. W karcie z przewodnika: 150x10 m.

Dlaczego: wszystkie pokrycia odnoszą się do transektu – następny obserwator musi wyznaczyć ten sam. Gdy zamiast transektu są trzy płaty, wpisz to tutaj.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 1490–1560',
    help: 'Wysokość nad poziomem morza – liczba albo zakres od minimalnej do maksymalnej (karta z przewodnika: 1490–1560). Przy dużych różnicach wysokości odczyt z GPS bywa niedokładny – przewodnik poleca altimetr barometryczny. Siedlisko występuje od niżu po piętro subalpejskie.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 15.09.2011',
    required: true,
    hint: 'Optymalnie II połowa czerwca – koniec sierpnia (w górach koniec lipca – początek sierpnia); dopuszczalnie czerwiec – początek października.',
    help: `Dzień badań terenowych. Przewodnik: dopuszczalny termin jest długi – od czerwca do nawet początku października; optymalny od drugiej połowy czerwca do końca sierpnia, gdy runo jest najlepiej rozwinięte. Karta przykładowa (15.09.2011) zastrzega, że przy późnym terminie ilościowość gatunków o dużych, szybko obumierających liściach (miłosna, modrzyk, omieg) może być zaniżona – w górach zaleca koniec lipca i początek sierpnia.

Praktyka: 2011 – wrzesień; 2016–2017 – sierpień; 2024–2025 – od 3 czerwca do 31 sierpnia (Barania Góra 8 września ze względu na ochronę głuszca).`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const [, mm, dd] = v.split('-').map(Number)
      const md = mm * 100 + dd
      if (md < 601 || md > 1010) return 'Termin poza dopuszczalnym okresem (czerwiec – początek października). Opisz powód w uwagach.'
      if (md < 615 || md > 831)
        return 'Termin dopuszczalny, ale poza optymalnym (II połowa czerwca – koniec sierpnia). Ilościowość dużych bylin może być zaniżona – zapisz to w uwagach.'
      return null
    },
  },
  pickField(methodology7120.siteFields, 'observer', {
    help: `Imię i nazwisko eksperta, który wykonał obserwację i odpowiada za dane (w karcie z przewodnika: „Koordynator” w raporcie rocznym).

Dlaczego: ocena zawiera elementy oceny eksperckiej – trzeba wiedzieć, kogo zapytać o uzasadnienie.`,
  }),
  {
    kind: 'text',
    name: 'additionalExperts',
    label: 'Dodatkowi eksperci',
    placeholder: 'np. —',
    help: 'Osoby, które brały udział w badaniu poza wykonawcą (w karcie z przewodnika: „Dodatkowi koordynatorzy”). Brak – zostaw puste albo wpisz „—”.',
  },
]

// ---------- zdjęcia fitosocjologiczne ----------

const r7120 = methodology7120.releves.fields
const LAYERS = 'Zwarcie i wysokość warstw B, C, D'
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, group: LAYERS, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia (WGS84). Trzy zdjęcia: na początku, w środku i na końcu transektu albo w każdym z trzech płatów.' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach (karta z przewodnika: 1560, 1550, 1490 m).' }),
  pickField(r7120, 'area', {
    defaultValue: 25,
    help: 'Powierzchnia zdjęcia w m² – w karcie z przewodnika 25 m². Przy wąskich płatach wzdłuż cieku wpisz faktyczną powierzchnię.',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach (karta z przewodnika: 40–45° na stromych zboczach Babiej Góry; nad potokami i rzekami często 0–5°).' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, NW). Dla powierzchni płaskiej wpisz „brak”.' }),
  layerField('coverB', 'Warstwa B – krzewy: procent powierzchni zdjęcia pod krzewami (malina, jarząb, wierzby, kosodrzewina). Karta z przewodnika: 1–3%.', { groupCols: 3 }),
  layerField('coverC', 'Warstwa C – zielna: procent powierzchni zdjęcia pokryty przez byliny ziołorośli (karta z przewodnika: 80–90%).'),
  layerField('coverD', 'Warstwa D – mszysta: procent powierzchni zdjęcia pokryty przez mszaki (karta z przewodnika: 30–60%).'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów, w metrach (karta z przewodnika: 0,6 m).'),
  layerField('heightC', 'Warstwa C – typowa wysokość ziołorośli, w centymetrach (karta z przewodnika: 60 cm; w pełni rozwoju często ponad 1 m).'),
  layerField('heightD', 'Warstwa D – wysokość mszaków, w centymetrach (karta z przewodnika: 2 cm).'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Adenostylion alliariae',
    help: 'Jednostka fitosocjologiczna zdjęcia – zespół albo związek, np. Adenostylion alliariae (karta z przewodnika), Adenostyletum alliariae, Petasitetum kablikiani, Urtico-Calystegietum sepium.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w poletku z ilościowością w skali Braun-Blanqueta (r, +, 1–5): warstwa B – krzewy, C – byliny i trawy, D – mszaki. Przewodnik (uwaga w karcie): w 2011 r. mszaków nie zbierano, ale po konsultacjach uznano to za niezbędne – wpisz wszystkie mszaki naziemne z ilościowością. Warstwa podpowiada się sama po wyborze gatunku.',
  }),
  {
    kind: 'textarea',
    name: 'remarks',
    label: 'Uwagi do zdjęcia',
    rows: 2,
    placeholder: 'np. Mszaków nie oznaczano',
    help: 'Odstępstwa i problemy: brak danych o mszakach, mniejsza powierzchnia, taksony nieoznaczone do gatunku (karta przykładowa wlicza je do bogactwa gatunkowego), późny termin.',
  },
]

export const methodology6430: Methodology = {
  code: '6430',
  name: 'Ziołorośla górskie (Adenostylion alliariae) i ziołorośla nadrzeczne (Convolvuletalia sepium)',
  source:
    'Mróz W., Świerkosz K., Kozak M. 2012, 6430 Ziołorośla górskie (Adenostylion alliariae) i ziołorośla nadrzeczne (Convolvuletalia sepium), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. III, GIOŚ, s. 53–63 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2009–2011, 2015–2018 i 2023–2025.',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj 3 zdjęcia fitosocjologiczne – na początku, w środku i na końcu transektu (albo w każdym z trzech płatów), najlepiej w pełni rozwoju ziołorośli. Ilościowość w skali Braun-Blanqueta; warstwy B (krzewy), C (zielna) i D (mszaki – wpisz je, choć w 2011 r. ich nie zbierano). Liczbę gatunków w zdjęciach przenieś do wskaźnika „Bogactwo gatunkowe”.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Ocena realnych możliwości utrzymania siedliska we właściwej kondycji, uwzględniająca jego obecny stan zachowania oraz czynniki mogące na nie oddziaływać w najbliższej przyszłości.',
    help: `Weź pod uwagę: gatunki inwazyjne w płatach i w sąsiedztwie (barszcz Sosnowskiego, rdestowce, niecierpek gruczołowaty, rudbekia, nawłocie, kolczurka – zwłaszcza nad rzekami), ekspansję rodzimych gatunków (trzcinnik piaskowy, wierzbówka kiprzyca, mozga, trzcina), sukcesję w kierunku zarośli i lasu, zrywkę i wycinkę drzew wzdłuż potoków, prace w korytach (regulacja, pobór żwiru, czyszczenie przepustów, remonty mostów), wykaszanie brzegów, zaburzenia reżimu wodnego (niskie stany wód, susze), szlaki turystyczne i śmieci. Po stronie plusów: park narodowy, ochrona ścisła, naturalne koryto.

Przewodnik (pkt 4): naturalne ziołorośla nie wymagają ochrony czynnej; trzeba zwalczać najbardziej inwazyjne gatunki obce, chronić roślinność nadpotokową przy inwestycjach i egzekwować zakaz poboru żwiru.

Praktyka 2024–2025: najgorzej oceniony parametr w regionie alpejskim (37% U1), najczęściej z powodu gatunków inwazyjnych; na niżu FV 42%, U1 47%, U2 11%. Karta z przewodnika: „Stanowisko znajduje się w obszarze ochrony ścisłej Babiogórskiego Parku Narodowego” → FV.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A02', name: 'Zmiana sposobu uprawy' },
    { code: 'A03', name: 'Koszenie / ścinanie trawy' },
    { code: 'A03.03', name: 'Zaniechanie / brak koszenia' },
    { code: 'A04', name: 'Wypas' },
    { code: 'A04.03', name: 'Zarzucenie pasterstwa, brak wypasu' },
    { code: 'B01', name: 'Zalesianie terenów otwartych' },
    { code: 'B02.01', name: 'Odnawianie lasu po wycince (nasadzenia)' },
    { code: 'B02.02', name: 'Wycinka lasu' },
    { code: 'B02.03', name: 'Usuwanie podszytu' },
    { code: 'B02.06', name: 'Przerzedzenie warstwy drzew' },
    { code: 'B07', name: 'Inne rodzaje praktyk leśnych, nie wymienione powyżej' },
    { code: 'C01.01', name: 'Wydobywanie piasku i żwiru' },
    { code: 'D01', name: 'Drogi, ścieżki i drogi kolejowe' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D01.02', name: 'Drogi, autostrady' },
    { code: 'D01.05', name: 'Mosty, wiadukty' },
    { code: 'D02.01', name: 'Linie elektryczne i telefoniczne' },
    { code: 'E01.03', name: 'Zabudowa rozproszona' },
    { code: 'E01.04', name: 'Inne typy zabudowy' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'E03.04', name: 'Inne odpady' },
    { code: 'F02', name: 'Rybołówstwo i zbieranie organizmów wodnych' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
    { code: 'G01.04.01', name: 'Turystyka górska i wspinaczka' },
    { code: 'G02', name: 'Infrastruktura sportowa i rekreacyjna' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J01.01', name: 'Wypalanie' },
    { code: 'J02.03', name: 'Regulowanie (prostowanie) koryt rzecznych i zmiana przebiegu koryt rzecznych' },
    { code: 'J02.04', name: 'Zalewanie – modyfikacje' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód, ogólnie' },
    { code: 'J02.12', name: 'Tamy, wały, sztuczne plaże – ogólnie' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'K04.01', name: 'Konkurencja' },
    { code: 'L04', name: 'Lawina' },
    { code: 'L05', name: 'Zapadnięcie się terenu, osuwisko' },
    { code: 'L08', name: 'Powódź (procesy naturalne)' },
    { code: 'M01.02', name: 'Susze i zmniejszenie opadów' },
    { code: 'U', name: 'Nieznane zagrożenie lub nacisk' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: [
    ...methodology7120.otherFields.flatMap((f): FieldDef[] => {
      if (f.name === 'otherValues')
        return [
          {
            ...f,
            hint: 'Np. inne zbiorowiska piętra subalpejskiego (Pinetum mugo, Salicetum silesiacae), gatunki chronione.',
            help: 'Wartości przyrodnicze stanowiska poza samymi ziołoroślami: sąsiednie siedliska (4070 kosodrzewina, 4080 zarośla wierzby śląskiej, 91E0 łęgi, 3260 rzeki z włosienicznikami, 3270 zalewane brzegi), rzadkie i chronione gatunki (tojady, modrzyk górski, dzięgiel litwor). Karta z przewodnika: „Obecność innych zbiorowisk właściwych piętru subalpejskiemu, rzadkich w skali kraju”. Brak informacji – „Nie stwierdzono”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            label: 'Wykonywane działania ochronne',
            help: 'Jakie działania ochronne wykonano i z jakim skutkiem: ochrona ścisła w parku narodowym, zwalczanie gatunków inwazyjnych, renaturyzacja koryta. Na 86% stanowisk w 2024–2025 nie prowadzono żadnych działań. Brak – „Brak”.',
          },
          {
            kind: 'textarea',
            name: 'proposals',
            label: 'Propozycje wprowadzenia działań ochronnych',
            rows: 3,
            hint: 'Np. zwalczanie rdestowców i barszczu; zachować dotychczasowy status ochronny.',
            help: 'Jakie działania proponujesz, konkretnie: zwalczanie gatunków inwazyjnych (rdestowce, nawłoć późna, barszcz Sosnowskiego, kolczurka, klon jesionolistny – część z nich trzeba zwalczać z mocy ustawy o gatunkach obcych), zmiana przebiegu szlaków zrywkowych i miejsc składowania drewna, ostrożne prace przy drogach i mostach, zakaz poboru żwiru, usunięcie śmieci, zaniechanie wykaszania brzegów. Brak – „Brak”.',
          },
          {
            kind: 'select',
            name: 'monitoringRequired',
            label: 'Monitoring jest wymagany',
            options: [
              { value: '', label: '—' },
              { value: 'tak', label: 'Tak' },
              { value: 'nie', label: 'Nie' },
            ],
            help: 'Czy stanowisko powinno zostać w sieci monitoringu (pole „Raportu rocznego” w karcie z przewodnika). Uzasadnienie wpisz niżej.',
          },
          {
            kind: 'textarea',
            name: 'justification',
            label: 'Uzasadnienie',
            rows: 3,
            help: 'Dlaczego monitoring jest (albo nie jest) potrzebny: typowo wykształcone płaty, gatunki rzadkie, zagrożenia; albo wniosek o usunięcie stanowiska (w 2025 r. – zniszczone siedlisko albo brak siedliska na stanowisku).',
          },
        ]
      if (f.name === 'notes')
        return [
          {
            kind: 'number',
            name: 'shareFV',
            group: 'Powierzchnia siedliska o różnym stanie zachowania na stanowisku',
            label: 'Udział powierzchni siedliska w stanie FV',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Karta z przewodnika podaje przy ocenie ogólnej udział procentowy powierzchni siedliska o różnym stanie zachowania na całym stanowisku (Między Kościółkami a przełęczą Brona: FV 100%, U1 –, U2 –). Trzy liczby powinny dać razem 100%.',
          },
          {
            kind: 'number',
            name: 'shareU1',
            group: 'Powierzchnia siedliska o różnym stanie zachowania na stanowisku',
            label: 'Udział powierzchni siedliska w stanie U1',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Procent powierzchni siedliska na stanowisku w stanie niezadowalającym (U1).',
          },
          {
            kind: 'number',
            name: 'shareU2',
            group: 'Powierzchnia siedliska o różnym stanie zachowania na stanowisku',
            label: 'Udział powierzchni siedliska w stanie U2',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Procent powierzchni siedliska na stanowisku w stanie złym (U2).',
          },
          {
            ...f,
            help: `${f.help ?? ''}\n\nDla 6430 zapisz tu także rok i typ monitoringu, termin (przy późnym terminie – że ilościowość dużych bylin może być zaniżona), co wliczono do bogactwa gatunkowego i odstępstwa od transektu (trzy płaty zamiast transektu).`.trim(),
          },
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_6430.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer6430(s) })),
  speciesInfo: (name) => {
    const s = findSpecies6430(name)
    if (!s) return undefined
    if (s.group === 'characteristic') {
      const where = s.lowland ? 'ziołorośla niżowe' : 'ziołorośla górskie'
      const src = s.source === 'tab1' ? 'tab. 1' : s.source === 'typical' ? 'typowe gatunki, pkt 4 przewodnika' : s.source === 'card' ? 'karta przykładowa' : 'sprawozdanie 2025'
      return `${GROUP_LABELS_6430.characteristic} (${where}; ${src})`
    }
    if (s.group === 'expansive') return s.postulated ? `${GROUP_LABELS_6430.expansive} (tab. 1; sprawozdanie 2025 postuluje jako diagnostyczny)` : GROUP_LABELS_6430.expansive
    if (s.group === 'alien') return s.weak ? 'gatunek obcy bez tendencji do inwazji' : GROUP_LABELS_6430.alien
    return GROUP_LABELS_6430.companion
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator6430 = (id: string): IndicatorDef => {
  const i = methodology6430.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 6430`)
  return i
}
