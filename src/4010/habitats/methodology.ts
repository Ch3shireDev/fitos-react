// Metodyka 4010 (wilgotne wrzosowiska z wrzoścem bagiennym) jako dane. Źródło: Pawlaczyk P. 2012, „4010 Wilgotne
// wrzosowiska z wrzoścem bagiennym Erica tetralix” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik
// metodyczny, cz. II, GIOŚ, s. 218–229 (tab. 1 i 2), z praktyką oceny ze sprawozdań z monitoringu 2009–2011,
// 2015–2018 i 2020–2021. Siedlisko nieleśne, bardzo rzadkie (kilkanaście stanowisk w Polsce): transekt 2000 m²
// (optymalnie 200×10 m), 3 zdjęcia fitosocjologiczne po 100 m². 7 wskaźników struktury, 4 kardynalne.
// Reguła oceny struktury i oceny ogólnej – ogólna z silnika (tab. 2 mówi dokładnie to samo).
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, listCover, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import { GROUP_LABELS_4010, SPECIES_4010, defaultLayer4010, findSpecies4010, isAlien4010, isExpansive4010, isTree4010 } from './species'

// ---------- progi liczbowe (tab. 2) ----------

/** Metodyka: pokrycie wrzośca „wyrażone w procentach (zaokrąglone do pełnych dziesiątek)”. */
export const roundToTens = (v: number) => Math.round(v / 10) * 10

/** Pokrycie wrzośca bagiennego (po zaokrągleniu do dziesiątek): >50% FV, 30–50% U1, <30% U2. */
export const gradeErica4010 = (cover: number): Grade => {
  const r = roundToTens(cover)
  return r > 50 ? 'FV' : r >= 30 ? 'U1' : 'U2'
}

/** Zarośnięcie przez drzewa (% transektu): <10% FV, 10–30% U1, >30% U2. */
export const gradeTrees4010 = (cover: number): Grade => (cover < 10 ? 'FV' : cover <= 30 ? 'U1' : 'U2')

/** Gatunki obce geograficznie: brak FV; pojedyncze, do 10% łącznie U1; ponad 10% U2. */
export const gradeAliens4010 = (count: number, total: number): Grade => (count <= 0 ? 'FV' : total <= 10 ? 'U1' : 'U2')

/** Pokrycie „śladowe” apofitów, które nie obniża oceny (praktyka 2011: „co najwyżej jeżyny <1%” → FV). */
export const EXPANSIVE_TRACE = 1

/** Ekspansywne gatunki rodzime: brak albo ślad (<1%) FV; pojedyncze, do 10% łącznie U1; ponad 10% U2. */
export const gradeExpansive4010 = (count: number, total: number): Grade =>
  count <= 0 || total < EXPANSIVE_TRACE ? 'FV' : total <= 10 ? 'U1' : 'U2'

const pct = (v: number) => `${plNum(v)}%`
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const uniq = <T,>(xs: T[]) => [...new Set(xs)]

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie zmniejsza się, nie jest antropogenicznie pofragmentowana', grade: 'FV' },
  { value: 'slow', label: 'Wykazuje powolny trend spadkowy lub jest antropogenicznie pofragmentowana', grade: 'U1' },
  { value: 'fast', label: 'Wykazuje szybki trend spadkowy lub jest silnie antropogenicznie pofragmentowana', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const MOISTURE: GradedOption[] = [
  { value: 'natural', label: 'Naturalne', grade: 'FV' },
  { value: 'weather', label: 'Ślady przesuszenia bez przyczyn antropogenicznych (np. susza w danym roku)', grade: 'FV' },
  { value: 'weak', label: 'Słabe antropogeniczne przesuszenie', grade: 'U1' },
  { value: 'strong', label: 'Silne antropogeniczne przesuszenie, odwodnienie rowami', grade: 'U2' },
]
const ALIENS: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'few', label: 'Pojedyncze, <10%', grade: 'U1' },
  { value: 'many', label: '>10%', grade: 'U2' },
]
const EXPANSIVE: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'few', label: 'Pojedyncze, <10%', grade: 'U1' },
  { value: 'many', label: '>10%', grade: 'U2' },
]
const KEY_SPECIES: GradedOption[] = [
  { value: 'allFv', label: 'Stan wszystkich typowych dla siedliska gatunków właściwy (FV)', grade: 'FV' },
  { value: 'someU1', label: 'Stan niektórych gatunków niezadowalający (U1)', grade: 'U1' },
  { value: 'someU2', label: 'Stan niektórych gatunków zły (U2)', grade: 'U2' },
  { value: 'noData', label: 'Brak danych – wskaźnik fakultatywny, nie stosuje się', grade: 'XX' },
]
const DAMAGE: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'minor', label: 'Występują, lecz mało znaczące', grade: 'U1' },
  { value: 'strong', label: 'Silne', grade: 'U2' },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

/** Select niewymagany – gdy są pomiary, wystarczą pomiary. */
const optionalSelect = (label: string, options: GradedOption[], help?: string): FieldDef => ({ ...selectInput(label, options, help), required: false })

const noteInput = (label: string, placeholder: string, help: string): FieldDef => ({ kind: 'textarea', name: 'note', label, rows: 2, placeholder, help })

const note = (i: InputValues) => String(i.note ?? '').trim()
/** „Wartość” w karcie: notatka obserwatora, a bez niej etykieta wybranej klasy. */
const noteOr = (i: InputValues, options: GradedOption[]) => note(i) || labelOf(options, i.choice)

/** Ostrzeżenie, gdy wybrana klasa nie zgadza się z policzoną. */
const mismatch = (options: GradedOption[], i: InputValues, computed: Grade | null, what: string) => {
  if (!computed || !i.choice) return null
  const chosen = gradeMap(options)[String(i.choice)]
  return chosen && chosen !== computed ? `Wg ${what} to ${computed}, a wybrano ${chosen}.` : null
}

// ---------- obliczenia wskaźników ----------

function aliensGrade(i: InputValues): Grade | null {
  const { count, total } = listCover(i)
  if (count === 0 || total === undefined) return null
  return gradeAliens4010(count, total)
}

function expansiveGrade(i: InputValues): Grade | null {
  const { count, total } = listCover(i)
  if (count === 0 || total === undefined) return null
  return gradeExpansive4010(count, total)
}

function treesGrade(i: InputValues): Grade | null {
  const c = num(i.cover)
  return c !== undefined ? gradeTrees4010(c) : null
}

/** Lista gatunków obcych/ekspansywnych: notatka, lista z pokryciem, a bez niej „Brak” lub etykieta klasy. */
const describeList = (i: InputValues, options: GradedOption[]) => {
  if (note(i)) return note(i)
  const list = describeSpecies(speciesRows(i.species))
  if (list) return list
  return i.choice === 'none' ? 'Brak' : labelOf(options, i.choice)
}

const AREA_PCT_HELP = 'Pokrycie podawaj w procentach powierzchni transektu (rzut pionowy). Dla „<1%” wpisz 0,5.'

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description: 'Zmiana powierzchni płatów wilgotnego wrzosowiska na stanowisku i ich antropogeniczna fragmentacja (drogi, rowy, zalesienia).',
    help: `Co wybrać: jak zmienia się powierzchnia płatów wrzosowiska z wrzoścem na stanowisku w porównaniu z poprzednią obserwacją (albo z ortofotomapą, literaturą) i czy płaty są pocięte przez człowieka. Powierzchnię w ha możesz wpisać obok – trafi do pola „wartość”.

Progi (tab. 2): nie zmniejsza się, nie jest antropogenicznie pofragmentowana – FV; powolny trend spadkowy lub antropogeniczna fragmentacja – U1; szybki trend spadkowy lub silna antropogeniczna fragmentacja – U2.

Tab. 1: jeżeli zarastanie drzewami jakichś fragmentów wrzosowiska jest tak silne, że grozi zanikiem siedliska, powinno rzutować także na ocenę powierzchni. Tak oceniono Gniewoszyce (karta z przewodnika, 2011: „Siedlisko w zaniku” – U2). Praktyka 2021: stanowiska od 0,12 ha do ok. 2 ha; stanowisko, na którym siedliska już nie odnaleziono (Wrzosowisko Sowno), dostało U2. Przy pierwszym badaniu wybierz „Brak danych do porównania” albo oceń ekspercko.`,
    thresholds: {
      FV: 'Nie zmniejsza się, nie jest antropogenicznie pofragmentowana',
      U1: 'Wykazuje powolny trend spadkowy lub jest antropogenicznie pofragmentowana',
      U2: 'Wykazuje szybki trend spadkowy lub jest silnie antropogenicznie pofragmentowana',
    },
    inputs: [
      optionalSelect('Zmiana powierzchni', AREA, 'Puste, gdy oceniasz ekspercko.'),
      { kind: 'number', name: 'areaHa', label: 'Powierzchnia (opcjonalnie)', unit: 'ha', min: 0, help: 'Powierzchnia płatów wrzosowiska na stanowisku w ha, jeśli ją znasz – trafi do pola „wartość”. W sprawozdaniu 2021 od 0,12 ha do ok. 2 ha.' },
      noteInput('Opis (opcjonalnie)', 'np. Siedlisko w zaniku.', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy, np. „Siedlisko w zaniku” albo „powierzchnia bez zmian, płat przecięty rowem”.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => {
      const ha = num(i.areaHa)
      const text = note(i) || (i.choice ? labelOf(AREA, i.choice) : '')
      return [ha !== undefined ? `${plNum(ha)} ha` : '', text].filter(Boolean).join('; ')
    },
  },
  {
    id: 'erica',
    label: 'Pokrycie wrzośca bagiennego Erica tetralix',
    parameter: 'structure',
    cardinal: true,
    description:
      'Wskaźnik decydujący o strukturze siedliska i jego kwalifikacji jako wilgotne wrzosowisko. Miarą jest wyrażone w procentach (zaokrąglone do pełnych dziesiątek) pokrycie powierzchni przez gatunek, rozumiane tak jak w fitosocjologii.',
    help: `Co wpisać: jaki procent powierzchni transektu pokrywa wrzosiec bagienny Erica tetralix (rzut pionowy, tak jak w zdjęciu fitosocjologicznym). Metodyka każe zaokrąglać do pełnych dziesiątek – formularz robi to sam przed oceną, a w karcie zostaje to, co wpiszesz (np. „Ok. 8–10%” w opisie).

Progi (tab. 2): powyżej 50% – FV; 30–50% – U1; poniżej 30% – U2.

Jak liczy formularz: najpierw zaokrągla do dziesiątek (25% → 30%, 54% → 50%), dopiero potem porównuje z progami. Czyli FV zaczyna się od 55% wpisanych, U1 od 25%.

Wskaźnik kardynalny. Praktyka 2021: żadne stanowisko nie dostało FV, zwykle 10–20% (U2); najwięcej w Stawiskach – ok. 30%, U1; w Gniewoszycach poniżej 5% (U2, a w 2011 r. 8–10%). Wrzosiec rośnie też na torfowiskach (7110, 7120, 7140) – sama jego obecność nie przesądza, że to siedlisko 4010.`,
    thresholds: { FV: '>50%', U1: '30–50%', U2: '<30%' },
    inputs: [
      { kind: 'number', name: 'cover', label: 'Pokrycie wrzośca na transekcie', unit: '%', min: 0, max: 100, required: true, help: `Pokrycie transektu przez wrzosiec bagienny Erica tetralix, w %. Zaokrąglenie do pełnych dziesiątek formularz zrobi sam. ${AREA_PCT_HELP}` },
      noteInput('Opis (opcjonalnie)', 'np. Ok. 8–10% pokrycia na transekcie.', 'Krótki opis, który trafi do „wartości” w karcie zamiast samej liczby, np. zakres „8–10%” albo uwaga o żywotności wrzośca.'),
    ],
    suggest: (i) => {
      const c = num(i.cover)
      return c !== undefined ? gradeErica4010(c) : null
    },
    explain: (i) => {
      const c = num(i.cover)
      if (c === undefined) return null
      const r = roundToTens(c)
      return r === c ? `Pokrycie wrzośca ${pct(c)} transektu.` : `Pokrycie wrzośca ${pct(c)}, po zaokrągleniu do dziesiątek ${pct(r)}.`
    },
    describe: (i) => {
      const c = num(i.cover)
      return note(i) || (c !== undefined ? `${pct(c)} pokrycia na transekcie` : '')
    },
  },
  {
    id: 'trees',
    label: 'Zarośnięcie przez drzewa',
    parameter: 'structure',
    cardinal: true,
    description:
      'Wskaźnik pokazujący główne zagrożenie i czynnik degradacyjny wilgotnych wrzosowisk, jakim jest zarastanie przez roślinność drzewiastą. Miarą jest pokrycie powierzchni drzewami, wyrażone w procentach. Wlicza się tu zarówno spontaniczne naloty, jak i drzewa nasadzone w wyniku zalesień.',
    help: `Co wpisać: jaki procent transektu zarasta roślinność drzewiasta – nalot, podrost i drzewa, spontaniczne i posadzone (zalesienia). Lista gatunków jest opcjonalna, ocena idzie z łącznego pokrycia.

Progi (tab. 2): poniżej 10% – FV; 10–30% – U1; powyżej 30% – U2.

Tab. 1: jeżeli zarastanie jakichś fragmentów jest tak silne, że grozi zanikiem siedliska, obniż też „Powierzchnię” i „Perspektywy ochrony”.

Wskaźnik kardynalny i najgorzej oceniany: w 2021 r. U2 na 7 z 10 stanowisk, pokrycie drzew 15–80%, najczęściej 30–50%. W Gniewoszycach i Tuplicach z ok. 60% do 70–80% (2011: ok. 40%). Typowe gatunki: sosna zwyczajna, brzoza brodawkowata, świerk, wierzba uszata, kruszyna. Krzewy (kruszyna, wierzby) licz razem z drzewami – metodyka mówi o „roślinności drzewiastej”.`,
    thresholds: { FV: '<10%', U1: '10–30%', U2: '>30%' },
    inputs: [
      { kind: 'number', name: 'cover', label: 'Pokrycie drzew na transekcie', unit: '%', min: 0, max: 100, required: true, help: `Łączne pokrycie transektu przez drzewa i krzewy (nalot, podrost, nasadzenia), w %. Poniżej 10% – FV, 10–30% – U1, więcej – U2. ${AREA_PCT_HELP}` },
      speciesInput('Gatunki drzew i krzewów (opcjonalnie)', 'Gatunki zarastające transekt z pokryciem w %, np. Pinus sylvestris 25, Betula pendula 15. Do oceny liczy się łączne pokrycie wpisane wyżej.'),
      noteInput('Opis (opcjonalnie)', 'np. Ok. 40%', 'Krótki opis, który trafi do „wartości” w karcie zamiast samej liczby.'),
    ],
    suggest: treesGrade,
    explain: (i) => {
      const c = num(i.cover)
      const { total } = listCover(i)
      if (c === undefined) return null
      const list = total !== undefined && total > 0 ? `; suma z listy gatunków ${pct(total)}` : ''
      return `Zarośnięcie przez drzewa: ${pct(c)} transektu${list}.`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      const other = names.filter((n) => findSpecies4010(n) && !isTree4010(n) && !isAlien4010(n))
      if (other.length) return `Na liście drzew są gatunki niedrzewiaste: ${other.join(', ')}.`
      const c = num(i.cover)
      const { total } = listCover(i)
      if (c !== undefined && total !== undefined && total > c + 0.05 && total <= 100)
        return `Suma pokrycia z listy (${pct(total)}) jest większa niż łączne pokrycie (${pct(c)}) – sprawdź (korony mogą na siebie zachodzić).`
      return null
    },
    describe: (i) => {
      const c = num(i.cover)
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      return [c !== undefined ? pct(c) : '', list].filter(Boolean).join('; ')
    },
  },
  {
    id: 'moisture',
    label: 'Uwilgotnienie',
    parameter: 'structure',
    cardinal: true,
    description:
      'Dla siedliska charakterystyczne są siedliska wilgotne i mokre, dlatego właściwe uwilgotnienie jest ważnym wskaźnikiem właściwego stanu. Właściwe uwilgotnienie to takie, przy którym warstwa mszysta jest przez większość czasu przesycona wodą (co najwyżej za wyjątkiem bardzo suchych okresów roku).',
    help: `Co ocenić: czy warstwa mszysta (torfowce, mchy) jest przesycona wodą, czy są objawy przesuszenia (wybielone, zaschnięte torfowce, mursz, pękająca powierzchnia) i co jest ich przyczyną (rowy, redliny po zalesieniu, dawne torfianki, transpiracja nalotu drzew). Opis w notatce trafi do karty.

Progi (tab. 2): naturalne – FV; słabe antropogeniczne przesuszenie – U1; silne antropogeniczne przesuszenie, odwodnienie rowami – U2.
Tab. 1 opisuje to samo skutkami: właściwe – mchy przez większość czasu przesycone wodą; niezadowalające – wyraźne objawy przesuszenia, ale przynajmniej okresowo woda wysyca warstwę mchów; złe – suchy grunt, na którym wrzosiec i gatunki wilgociolubne są tylko reliktem dawniejszych warunków.

Opcja „ślady przesuszenia bez przyczyn antropogenicznych” to praktyka 2021 (Torfowisko Pobłockie, Mierzeja Sarbska: FV mimo śladów przesuszenia, bo przyczyną była pogoda). Przesuszenie wywołane nalotem drzew posadzonych albo wyrosłych na dawnych zalesieniach liczy się jako antropogeniczne – tak oceniono Gniewoszyce (2011 i 2021: U2).

Wskaźnik kardynalny. Zapisz pogodę z poprzednich tygodni w uwagach – w 2016 r. wysokie oceny zbiegły się z rekordowo suchymi latami wcześniej.`,
    thresholds: thresholdsOf(MOISTURE),
    inputs: [
      selectInput('Uwilgotnienie', MOISTURE),
      {
        kind: 'select',
        name: 'ditches',
        label: 'Czynne rowy odwadniające lub redliny',
        options: [
          { value: 'no', label: 'Nie' },
          { value: 'blocked', label: 'Tak, ale zablokowane (zastawki, zasypane)' },
          { value: 'yes', label: 'Tak – czynne, odprowadzają wodę' },
        ],
        help: 'Czy na stanowisku albo tuż obok są rowy melioracyjne lub głębokie redliny po zalesieniu, które odprowadzają wodę. Przewodnik: niezablokowane rowy to istotne zagrożenie. Formularz ostrzega, gdy przy czynnych rowach wybrano FV.',
      },
      noteInput('Opis (opcjonalnie)', 'np. Silnie przesuszone. Największym zagrożeniem jest nalot drzew, który pochłania znaczne ilości wody.', 'Krótki opis warunków wodnych i przyczyn przesuszenia. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(MOISTURE)),
    warn: (i) => {
      const g = gradeMap(MOISTURE)[String(i.choice)]
      if (g === 'FV' && i.ditches === 'yes') return 'Wybrano FV, a na stanowisku są czynne rowy odwadniające – tab. 2: odwodnienie rowami to U2.'
      return null
    },
    describe: (i) => noteOr(i, MOISTURE),
  },
  {
    id: 'aliens',
    label: 'Gatunki obce geograficznie',
    parameter: 'structure',
    cardinal: true,
    description:
      'Wskaźnik negatywny wyrażający ewentualną obecność inwazyjnych gatunków obcych (neofitów). W ramach oceny wskaźnika należy podać wszystkie takie gatunki (wszystkie gatunki obce geograficznie, lokalnie zachowujące się inwazyjnie) i ich pokrycia na transekcie.',
    help: `Co wpisać: gatunki obce stwierdzone na transekcie z pokryciem w % (z dokładnością do 10%; mniej niż 1% – wpisz 0,5). Pusta lista i „Brak” – FV. Formularz sumuje pokrycie z listy; bez pokrycia wybierz klasę.

Progi (tab. 2): brak – FV; pojedyncze, poniżej 10% – U1; powyżej 10% – U2. Równo 10% formularz liczy jako U1 (U2 dopiero „powyżej 10%”).

Wskaźnik kardynalny. Praktyka: do 2016 r. nie stwierdzono gatunków obcych na żadnym stanowisku. W 2021 r. krzywoszczeć przywłoka Campylopus introflexus (Tuplice) i nawłoć kanadyjska Solidago canadensis (Brzeźnik), oba do 1% – U1. Krzywoszczeć to mech: wpisz go tutaj, nie do warstwy mszystej jako zwykły gatunek towarzyszący.`,
    thresholds: thresholdsOf(ALIENS),
    inputs: [
      speciesInput('Gatunki obce na transekcie', 'Gatunki obce geograficznie z przybliżonym pokryciem transektu w %. Brak – zostaw pustą listę i wybierz „Brak”.'),
      optionalSelect('Klasa (gdy bez pokrycia)', ALIENS, 'Wybierz, gdy nie szacujesz pokrycia albo nie ma gatunków obcych („Brak”).'),
      noteInput('Opis (opcjonalnie)', 'np. Brak', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => aliensGrade(i) ?? byOption(gradeMap(ALIENS))(i),
    explain: (i) => {
      const { count, total } = listCover(i)
      return count && total !== undefined ? `Łączne pokrycie gatunków obcych: ${pct(total)} (${count} ${count === 1 ? 'gatunek' : 'gatunki'}).` : null
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (i.choice === 'none' && names.length) return 'Wybrano „Brak”, a lista gatunków obcych nie jest pusta.'
      const native = names.filter((n) => findSpecies4010(n) && !isAlien4010(n))
      if (native.length) return `Na liście gatunków obcych są gatunki rodzime: ${native.join(', ')}.`
      return mismatch(ALIENS, i, aliensGrade(i), 'pokrycia z listy')
    },
    describe: (i) => describeList(i, ALIENS),
  },
  {
    id: 'expansive',
    label: 'Ekspansywne gatunki rodzime (apofity)',
    parameter: 'structure',
    description:
      'Najczęściej: jeżyny Rubus spp. Wskaźnik negatywny wyrażający ewentualną apofityzację. W ramach oceny wskaźnika należy podać wszystkie takie gatunki i ich pokrycia na transekcie.',
    help: `Co wpisać: rodzime gatunki ekspansywne na transekcie z pokryciem w %. Pusta lista i „Brak” – FV. Formularz sumuje pokrycie z listy; bez pokrycia wybierz klasę.

Progi (tab. 2): brak – FV; pojedyncze, poniżej 10% – U1; powyżej 10% – U2.

Jak liczy formularz: łączne pokrycie poniżej 1% (ślad, np. pojedyncze jeżyny) – FV. Tak oceniono wszystkie stanowiska w 2011 r. („co najwyżej jeżyny <1%” → FV), w tym Gniewoszyce w karcie z przewodnika. Od 1% do 10% – U1, powyżej 10% – U2.

Wskaźnik pomocniczy. Uwaga na trzęślicę modrą Molinia caerulea: sprawozdanie 2021 liczy ją jako gatunek ekspansywny (pokrycie 10–80%, w Gniewoszycach i Tuplicach 55–60% – U2) i przyznaje, że wcześniej „omyłkowo nie została potraktowana jako ekspansywna”. W karcie Gniewoszyce 2011 trzęślica ma w zdjęciach 2–3 w skali Br.-Bl., a wskaźnik FV – według dzisiejszej praktyki byłoby U2. Inne apofity z 2021 r.: trzcina pospolita, tojeść zwyczajna.`,
    thresholds: thresholdsOf(EXPANSIVE),
    inputs: [
      speciesInput('Gatunki ekspansywne na transekcie', 'Rodzime gatunki ekspansywne z przybliżonym pokryciem transektu w %, np. Molinia caerulea 30, Rubus sp. 0,5. Brak – zostaw pustą listę i wybierz „Brak”.'),
      optionalSelect('Klasa (gdy bez pokrycia)', EXPANSIVE, 'Wybierz, gdy nie szacujesz pokrycia albo nie ma gatunków ekspansywnych („Brak”).'),
      noteInput('Opis (opcjonalnie)', 'np. Jeżyna Rubus sp. <1%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków (np. z polskimi nazwami, jak w karcie z przewodnika).'),
    ],
    suggest: (i) => expansiveGrade(i) ?? byOption(gradeMap(EXPANSIVE))(i),
    explain: (i) => {
      const { count, total } = listCover(i)
      if (!count || total === undefined) return null
      return `Łączne pokrycie gatunków ekspansywnych: ${pct(total)}${total < EXPANSIVE_TRACE ? ' – ślad (poniżej 1%), nie obniża oceny' : ''}.`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (i.choice === 'none' && names.length) return 'Wybrano „Brak”, a lista gatunków ekspansywnych nie jest pusta.'
      const typical = uniq(names.filter((n) => findSpecies4010(n) && !isExpansive4010(n)))
      if (typical.length) return `Spoza katalogu gatunków ekspansywnych: ${typical.join(', ')} – sprawdź, czy to naprawdę ekspansja.`
      return mismatch(EXPANSIVE, i, expansiveGrade(i), 'pokrycia z listy')
    },
    describe: (i) => describeList(i, EXPANSIVE),
  },
  {
    id: 'keySpecies',
    label: 'Stan kluczowych dla różnorodności biologicznej gatunków lokalnie typowych dla siedliska',
    parameter: 'structure',
    description:
      'Wskaźnik fakultatywny umożliwiający wyrażenie dodatkowego aspektu stanu ochrony siedliska – jego zdolności do utrzymywania gatunków lokalnie typowych dla siedliska, a ważnych dla różnorodności biologicznej (chronionych, zagrożonych, rzadkich). Stosować tylko, gdy są odpowiednie dane.',
    help: `Co wpisać: gatunki lokalnie typowe, ważne dla różnorodności (chronione, zagrożone, rzadkie), i ocenę ich stanu. Wybór gatunków zależy od lokalnej specyfiki – np. subatlantyckie torfowce (Sphagnum molle, S. compactum, S. papillosum, S. tenellum), rosiczka okrągłolistna i pośrednia, przygiełka brunatna, malina moroszka, wełnianeczka darniowa. Bez danych z poprzednich lat wybierz „Brak danych” – XX.

Progi (tab. 2): stan wszystkich typowych gatunków właściwy – FV; stan niektórych niezadowalający – U1; stan niektórych zły – U2.

Wskaźnik pomocniczy i fakultatywny: XX nie psuje oceny struktury (liczą się tylko kardynalne i U2 pomocniczych). Praktyka: w 2011 i 2016 r. wszędzie XX. W 2021 r. eksperci z własnymi danymi oceniali go na kilku stanowiskach: FV za obecność rzadkich gatunków (Stawiska, Mieroszyno, Białogóra); obniżenie za zanik torfowców S. compactum i S. denticulatum (Gniewoszyce) i brak rosiczki pośredniej, turzycy bagiennej i modrzewnicy (Brzeźnik).`,
    thresholds: thresholdsOf(KEY_SPECIES),
    inputs: [
      selectInput('Stan gatunków', KEY_SPECIES),
      speciesInput('Gatunki kluczowe (opcjonalnie)', 'Gatunki lokalnie typowe, ważne dla różnorodności, z pokryciem (jeśli je znasz). Stan każdego opisz w notatce.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak danych', 'Lista gatunków (polska i łacińska nazwa) z określeniem ich stanu. Trafia do „wartości” w karcie.'),
    ],
    suggest: byOption(gradeMap(KEY_SPECIES)),
    describe: (i) => {
      if (note(i)) return note(i)
      if (i.choice === 'noData') return 'Brak danych'
      return describeSpecies(speciesRows(i.species)) || labelOf(KEY_SPECIES, i.choice)
    },
  },
  {
    id: 'otherDamage',
    label: 'Inne zniekształcenia (rozjeżdżenie, wydeptanie, zaśmiecenie)',
    parameter: 'structure',
    description:
      'Np. zaśmiecenie, przeoranie itp. Wskaźnik umożliwiający uwzględnienie niespecyficznych, ale występujących niekiedy zniekształceń. Ocenę należy obniżać do U1 lub U2 (odpowiednio do skali, rozległości i natężenia), jeżeli zniekształcenia występowały.',
    help: `Co ocenić: jaki rodzaj zniekształceń ma miejsce i z jaką intensywnością (brak, mało, silnie): rozjeżdżenie, wydeptanie, zaśmiecenie, przeoranie, głębokie redliny po dawnych próbach zalesienia. Opis w notatce trafi do karty.

Progi (tab. 2): brak – FV; występują, lecz mało znaczące – U1; silne – U2.

Wskaźnik pomocniczy. Praktyka 2021: na większości stanowisk brak (FV); redliny po zalesieniach (Tuplice, Nacław, Białogóra) obniżały ocenę – w Tuplicach do U2, a sprawozdanie dodaje, że już w 2011 r. powinno być U2. Redliny działają też drenująco – uwzględnij je przy uwilgotnieniu.`,
    thresholds: thresholdsOf(DAMAGE),
    inputs: [
      selectInput('Zniekształcenia', DAMAGE),
      noteInput('Opis (opcjonalnie)', 'np. Brak', 'Rodzaj zniekształceń i stopień intensywności. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(DAMAGE)),
    describe: (i) => noteOr(i, DAMAGE),
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu, z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie.

Dlaczego: płaty wilgotnych wrzosowisk są małe i często tkwią w lesie albo na skraju torfowiska – bez dokładnych współrzędnych następny obserwator nie trafi w ten sam transekt (metodyka: lokalizacja GPS obowiązkowa, naniesiona na mapę 1:10 000).`

const site7120 = methodology7120.siteFields

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Gniewoszyce',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Gniewoszyce”, „Tuplice”, „Torfowisko Pobłockie”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego płatu – w 2021 r. powtórnie badano tylko 2 z 10 stanowisk.`,
  },
  pickField(site7120, 'guid'),
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    defaultValue: 'Ericetum tetralicis',
    placeholder: 'np. Ericetum tetralicis',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Dla 4010: klasa Oxycocco-Sphagnetea, rząd Sphagno-Ericetalia, związek Ericion tetralicis – zespół Ericetum tetralicis (mszarnik wrzoścowy). Dopisz sąsiadujące, np. traworośla trzęślicowe, bór bagienny.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 6,
    required: true,
    hint: 'Gdzie leży płat, na jakim podłożu, co dominuje, czy zarasta, sąsiedztwo.',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• położenie: zagłębienie międzywydmowe, obrzeże torfowiska wysokiego, wyrobisko potorfowe, murszejący torf, dawna powierzchnia leśna;
• podłoże: piasek z warstwą materii organicznej, torf, mursz; czy stale wilgotne;
• co dominuje: wrzos czy wrzosiec, trzęślica, torfowce (np. płaskie poduszki S. compactum);
• zarastanie: sosna, brzoza, kruszyna – spontaniczne czy z zalesień;
• rowy, redliny, ślady eksploatacji torfu.`,
  },
  pickField(site7120, 'areaHa', {
    label: 'Powierzchnia płatów siedliska',
    help: 'Łączna powierzchnia płatów wilgotnego wrzosowiska na stanowisku, w ha (przecinek dozwolony). W karcie z przewodnika 0,6 ha, w sprawozdaniu 2021 od 0,12 ha do ok. 2 ha. To nie jest powierzchnia transektu (2000 m² = 0,2 ha).',
  }),
  pickField(site7120, 'protectedAreas', {
    hint: 'Np. „Park Krajobrazowy Łuk Mużakowa”; „PLH220018 Mierzeja Sarbska”. Brak – „brak”.',
  }),
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    defaultValue: '200x10 m',
    required: true,
    hint: 'Standard: 2000 m², optymalnie 200×10 m.',
    help: `Faktyczne wymiary transektu. Metodyka: transekt o powierzchni 2000 m², optymalnie 200 m × 10 m. Zwykle nie mieści się w płacie – wtedy zmień wymiary, zachowując powierzchnię (np. 100×20 m), a jeśli płat jest mniejszy, wpisz rzeczywiste wymiary (w karcie z przewodnika 120×10 m).

Przy małopowierzchniowych, rozproszonych wrzosowiskach metodyka każe zamiast transektu zrobić mapę płatów w krajobrazie i opisać wybrane płaty pojedynczym zdjęciem fitosocjologicznym – wtedy opisz to tutaj.`,
  },
  pickField(site7120, 'altitude', { placeholder: 'np. 188–191', help: 'Wysokość nad poziomem morza w metrach, z GPS albo mapy. Przy różnicy wysokości na transekcie podaj zakres (w karcie z przewodnika 188–191 m).' }),
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 14.09.2011',
    required: true,
    hint: 'Optymalnie od lipca do września.',
    help: `Dzień badań terenowych. Optymalny termin: od lipca do września, wystarczy jedna obserwacja w roku. W innych porach roku ocena stanu ochrony jest możliwa, ale w zdjęciach fitosocjologicznych trzeba się liczyć z błędnym pokryciem niektórych gatunków i z tym, że części nie da się oznaczyć.

Badania powtarza się co najmniej raz na 5–6 lat, optymalnie co 3 lata.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 7 && m <= 9 ? null : 'Termin poza optymalnym oknem (lipiec – wrzesień). Pokrycia w zdjęciach mogą wyjść inaczej.'
    },
  },
  pickField(site7120, 'observer'),
]

// ---------- zdjęcia fitosocjologiczne: 3 × 100 m² ----------

const r7120 = methodology7120.releves.fields
const LAYERS_GROUP = 'Zwarcie i wysokość warstw'

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia. Trzy zdjęcia rozmieść w obrębie transektu (np. na początku, w środku i na końcu).' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach.' }),
  pickField(r7120, 'area', {
    defaultValue: 100,
    help: 'Powierzchnia zdjęcia w m². Metodyka: trzy zdjęcia po 100 m² w obrębie transektu (w karcie z przewodnika – po 25 m²). Wpisz faktyczną wartość.',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Wilgotne wrzosowiska są zwykle płaskie – najczęściej 0–5°.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…). Dla powierzchni płaskiej wpisz „brak”.' }),
  pickField(r7120, 'coverB', { group: LAYERS_GROUP, groupCols: 3, help: 'Warstwa B – nalot, podrost drzew i krzewy (sosna, brzoza, kruszyna, wierzby), w % powierzchni zdjęcia. Brak = 0. To ona pokazuje zarastanie wrzosowiska.' }),
  pickField(r7120, 'coverC', { group: LAYERS_GROUP, help: 'Warstwa C – krzewinki (wrzosiec, wrzos) i zielne (trzęślica, wełnianeczka, sit sztywny), w % powierzchni zdjęcia. Metodyka: zwykle 60–90%.' }),
  pickField(r7120, 'coverD', { group: LAYERS_GROUP, help: 'Warstwa D – torfowce, inne mchy, wątrobowce i porosty naziemne, w % powierzchni zdjęcia. Pokrycie „<5%” wpisz jako 4 albo zostaw puste i dopisz w uwagach.' }),
  pickField(r7120, 'heightB', { group: LAYERS_GROUP, help: 'Typowa wysokość nalotu i krzewów w metrach. Brak = 0.' }),
  pickField(r7120, 'heightC', { group: LAYERS_GROUP, help: 'Typowa wysokość warstwy krzewinkowo-zielnej w centymetrach (zwykle 20–50 cm).' }),
  pickField(r7120, 'heightD', { group: LAYERS_GROUP, help: 'Typowa wysokość warstwy mszystej w centymetrach.' }),
  pickField(r7120, 'unit', { placeholder: 'np. Ericetum tetralicis', help: 'Jednostka fitosocjologiczna zdjęcia, zwykle Ericetum tetralicis.' }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w zdjęciu z ilościowością w skali Braun-Blanqueta (r, +, 1–5): drzewa i krzewy w B, krzewinki i zielne w C, mchy, wątrobowce i porosty w D.',
  }),
]

export const methodology4010: Methodology = {
  code: '4010',
  name: 'Wilgotne wrzosowiska z wrzoścem bagiennym Erica tetralix',
  source:
    'Pawlaczyk P. 2012, 4010 Wilgotne wrzosowiska z wrzoścem bagiennym Erica tetralix, [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 218–229 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2009–2011, 2015–2018 i 2020–2021',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'W obrębie transektu wykonaj trzy zdjęcia fitosocjologiczne metodą Braun-Blanqueta, po 100 m². Przy małych, rozproszonych płatach wystarczy jedno zdjęcie na płat. Drzewa i krzewy w warstwie B, krzewinki i zielne w C, mchy i porosty w D.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Oceniając perspektywy ochrony siedliska w przyszłości, należy zwrócić uwagę na: warunki wodne; prowadzenie koniecznych zabiegów ochrony czynnej; ewentualne procesy sukcesji, zarastanie drzewami; strukturę populacji wrzosu i obecność procesów „odnawiania się” wrzosu; inne przewidywane formy presji.',
    help: `Weź pod uwagę: czy rowy odwadniające są zablokowane, czy nalot drzew jest usuwany (i odrośla z szyi korzeniowej brzozy też), formę ochrony (rezerwat, użytek ekologiczny, park krajobrazowy, Natura 2000), status gruntu (powierzchnia leśna w Lasach Państwowych grozi kolejnymi próbami zalesienia), ekspansję trzęślicy, susze.

Tab. 1: jeżeli zarastanie drzewami grozi zanikiem siedliska, obniż też perspektywy.

Praktyka 2021: FV tylko w Stawiskach; U2 na połowie stanowisk – bez ochrony czynnej (usuwanie drzew, blokowanie rowów) w perspektywie 10 lat stan siedliska mocno się pogorszy lub siedlisko zaniknie.`,
    thresholds: {
      FV: 'Brak zagrożeń i negatywnych trendów. Zachowanie siedliska w stanie niepogorszonym w perspektywie 10–20 lat jest niemal pewne',
      U1: 'Zachowanie siedliska w stanie niepogorszonym w perspektywie 10–20 lat nie jest pewne, ale jest prawdopodobne, o ile uda się zapobiec istniejącym zagrożeniom',
      U2: 'Zachowanie siedliska w stanie niepogorszonym w perspektywie 10–20 lat będzie bardzo trudne: zaawansowane procesy recesji, silne negatywne trendy lub znaczne zagrożenia',
    },
  },

  impactCodes: [
    { code: 'B01', name: 'Zalesianie terenów otwartych' },
    { code: 'B01.01', name: 'Zalesianie terenów otwartych (drzewa rodzime)' },
    { code: 'B02', name: 'Gospodarka leśna – ogólnie' },
    { code: 'B02.01.01', name: 'Odnawianie lasu po wycince (drzewa rodzime)' },
    { code: 'B02.03', name: 'Usuwanie podszytu' },
    { code: 'B07', name: 'Inne rodzaje praktyk leśnych, nie wymienione powyżej' },
    { code: 'C01.03', name: 'Wydobywanie torfu' },
    { code: 'D01', name: 'Drogi, ścieżki i drogi kolejowe' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'E03', name: 'Pozbywanie się odpadów' },
    { code: 'E06', name: 'Inne rodzaje aktywności człowieka' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02.01', name: 'Zasypywanie terenu, melioracje i osuszanie – ogólnie' },
    { code: 'J02.01.02', name: 'Osuszanie terenów morskich, ujściowych, bagiennych' },
    { code: 'J02.06', name: 'Pobór wód z wód powierzchniowych' },
    { code: 'J02.07', name: 'Pobór wód z wód podziemnych' },
    { code: 'K01.03', name: 'Wyschnięcie' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'M01.02', name: 'Susze i zmniejszenie opadów' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: methodology7120.otherFields.flatMap((f): FieldDef[] => {
    if (f.name === 'otherValues')
      return [
        {
          ...f,
          hint: 'Np. sąsiedztwo 7110, 7120, 91D0, 2190; rosiczki, torfowce subatlantyckie.',
          help: 'Wartości przyrodnicze stanowiska poza samym wrzosowiskiem: sąsiednie siedliska (torfowiska wysokie 7110, 7120, bory bagienne 91D0, wilgotne zagłębienia międzywydmowe 2190), gatunki atlantyckie i chronione (rosiczki, przygiełki, malina moroszka, torfowce subatlantyckie). Brak informacji – „Nie stwierdzono”.',
        },
      ]
    if (f.name === 'conservation')
      return [
        {
          ...f,
          help: 'Jakie działania ochronne wykonano i z jakim skutkiem, oraz co proponujesz. Typowe dla 4010: zablokowanie rowów odwadniających, regularne usuwanie drzew i odrośli (u brzozy odrośla z szyi korzeniowej – trzeba powtarzać, próbuje się też obrączkowania), wyłączenie z zalesień. Na zdegradowanych torfowiskach wysokich ważniejsza może być renaturyzacja torfowiska. Brak działań – „Brak”.',
        },
      ]
    if (f.name === 'notes')
      return [
        {
          kind: 'number',
          name: 'shareFV',
          group: 'Udział powierzchni siedliska w stanie FV / U1 / U2 (całe stanowisko)',
          label: 'Udział powierzchni siedliska w stanie FV',
          unit: '%',
          min: 0,
          max: 100,
          help: 'Metodyka: podaj udział procentowy powierzchni siedliska o różnym stanie zachowania na całym stanowisku (w stosunku do całkowitej powierzchni siedliska). W karcie z przewodnika: FV –, U1 –, U2 100%. Trzy liczby powinny dać razem 100%.',
        },
        {
          kind: 'number',
          name: 'shareU1',
          group: 'Udział powierzchni siedliska w stanie FV / U1 / U2 (całe stanowisko)',
          label: 'Udział powierzchni siedliska w stanie U1',
          unit: '%',
          min: 0,
          max: 100,
          help: 'Procent powierzchni siedliska na stanowisku w stanie niezadowalającym (U1).',
        },
        {
          kind: 'number',
          name: 'shareU2',
          group: 'Udział powierzchni siedliska w stanie FV / U1 / U2 (całe stanowisko)',
          label: 'Udział powierzchni siedliska w stanie U2',
          unit: '%',
          min: 0,
          max: 100,
          help: 'Procent powierzchni siedliska na stanowisku w stanie złym (U2).',
        },
        f,
      ]
    return [f]
  }),

  speciesCatalog: SPECIES_4010.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer4010(s) })),
  speciesInfo: (name) => {
    const e = findSpecies4010(name)
    if (!e) return undefined
    const tags = [
      GROUP_LABELS_4010[e.group],
      e.atlantic ? 'gatunek atlantycki' : '',
      e.expansive ? 'ekspansywny (apofit)' : '',
      e.key ? 'kluczowy, lokalnie typowy' : '',
    ].filter(Boolean)
    return tags.join(', ')
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator4010 = (id: string): IndicatorDef => {
  const i = methodology4010.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 4010`)
  return i
}
