// Metodyka 1210 (kidzina na brzegu morskim) jako dane. Źródło: Ogrodniczuk N., Mróz W. 2015, „Kidzina na brzegu
// morskim (1210)” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. IV, GIOŚ,
// s. 46–55 (tab. 1 i 2), z praktyką oceny ze sprawozdań z monitoringu 2013–2014, 2016–2018 i 2023–2025.
// Siedlisko nadmorskie, nieleśne i efemeryczne: transekt wzdłuż brzegu 400×20 m (dopuszczalnie 100–400 m), spisy roślin
// w miejscach największego nagromadzenia kidziny. Z modułu leśnego brane są tylko klocki generyczne (choiceIndicator,
// measureIndicator, pickField) – nic leśnego.
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, normalizeName, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import { GROUP_LABELS_1210, SPECIES_1210, defaultLayer1210, findSpecies1210, isCharacteristic1210 } from './species'

// ---------- progi liczbowe (tab. 2) ----------

/** Procent transektu zajęty przez kidzinę: >30 FV, 10–30 U1, <10 U2. */
export const gradeCoverage1210 = (p: number): Grade => (p > 30 ? 'FV' : p >= 10 ? 'U1' : 'U2')
/** Część transektu z ograniczoną działalnością fal: do 30% FV, powyżej 30% U1, cały transekt U2. */
export const gradeWaves1210 = (p: number): Grade => (p <= 30 ? 'FV' : p < 100 ? 'U1' : 'U2')
/** Zniszczone płaty kidziny: <10% FV, 10–50% U1, >50% U2. */
export const gradeDamage1210 = (p: number): Grade => (p < 10 ? 'FV' : p <= 50 ? 'U1' : 'U2')
/** Płaty, na których śmiecie są istotną częścią osadów: <10% FV, 10–50% U1, >50% U2. */
export const gradeLitter1210 = (p: number): Grade => (p < 10 ? 'FV' : p <= 50 ? 'U1' : 'U2')

/**
 * Gatunki obce z listy -> ocena wg tab. 2: jeden gatunek nieekspansywny U1; więcej niż jeden albo jeden ekspansywny U2.
 * Pusta lista -> null (nie wiadomo, czy nie ma, czy nie wpisano).
 */
export function gradeAliens1210(names: string[]): Grade | null {
  const uniq = [...new Set(names.map(normalizeName).filter(Boolean))]
  if (uniq.length === 0) return null
  if (uniq.length > 1) return 'U2'
  return findSpecies1210(uniq[0])?.expansive ? 'U2' : 'U1'
}

const pct = (v: number) => `${plNum(v)}%`
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'smallDecrease', label: 'Niewielki spadek powierzchni siedliska', grade: 'U1' },
  { value: 'clearDecrease', label: 'Wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub danymi w literaturze', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const SPECIES_SHARE: GradedOption[] = [
  { value: 'over50', label: 'Gatunki charakterystyczne występują na powyżej 50% płatów siedliska na transekcie', grade: 'FV' },
  { value: 'below50', label: 'Gatunki charakterystyczne występują na poniżej 50% płatów siedliska na transekcie', grade: 'U1' },
  { value: 'sporadic', label: 'Brak gatunków charakterystycznych lub tylko sporadycznie na pojedynczych płatach', grade: 'U2' },
]
const COVERAGE: GradedOption[] = [
  { value: 'over30', label: 'Płaty siedliska na >30% transektu', grade: 'FV' },
  { value: '10to30', label: 'Płaty siedliska na 10–30% transektu', grade: 'U1' },
  { value: 'below10', label: 'Płaty siedliska na <10% transektu', grade: 'U2' },
]
const WAVES: GradedOption[] = [
  { value: 'none', label: 'Brak ograniczeń naturalnej działalności fal i sztormów', grade: 'FV' },
  { value: 'minor', label: 'Ograniczona przez człowieka tylko na niewielkiej części transektu (do 30%)', grade: 'FV' },
  { value: 'part', label: 'Ograniczona przez człowieka na części transektu (powyżej 30%)', grade: 'U1' },
  { value: 'whole', label: 'Ograniczona przez człowieka na całym transekcie', grade: 'U2' },
]
const ALIENS: GradedOption[] = [
  { value: 'none', label: 'Brak gatunków obcych (ekspansywnych)', grade: 'FV' },
  { value: 'single', label: 'Co najwyżej pojedyncze egzemplarze jednego gatunku niewykazującego ekspansji', grade: 'U1' },
  { value: 'many', label: 'Więcej niż jeden gatunek obcy', grade: 'U2' },
  { value: 'expansive', label: 'Jeden gatunek wykazujący ekspansję', grade: 'U2' },
]
const DAMAGE: GradedOption[] = [
  { value: 'below10', label: 'Mniej niż 10% płatów kidziny zniszczona', grade: 'FV' },
  { value: 'part', label: 'Część płatów kidziny zniszczona (od 10 do 50%)', grade: 'U1' },
  { value: 'most', label: 'Wszystkie płaty kidziny zniszczone lub ich przeważająca większość (powyżej 50%)', grade: 'U2' },
]
const LITTER: GradedOption[] = [
  { value: 'below10', label: 'Brak śmieci lub śmiecie stanowią istotną część osadów na nielicznych płatach (poniżej 10%)', grade: 'FV' },
  { value: 'part', label: 'Śmiecie stanowią istotną część osadów na licznych badanych płatach (10–50%)', grade: 'U1' },
  { value: 'most', label: 'Śmiecie stanowią istotną część osadów na większości badanych płatów (powyżej 50%)', grade: 'U2' },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

/** Select niewymagany – gdy wpiszesz liczbę, wystarczy liczba. */
const optionalSelect = (label: string, options: GradedOption[], help?: string): FieldDef => ({ ...selectInput(label, options, help), required: false })

// ---------- wskaźnik „udział płatów” (select + opcjonalny % + opcjonalny opis) ----------

/**
 * Select z opisem klasy, opcjonalny procent (ma pierwszeństwo i ostrzega przy niezgodności) i opcjonalna notatka,
 * która trafia do „wartości” zamiast etykiety klasy – jak w karcie papierowej („brak”, „częściowo zaśmiecone…”).
 */
function shareIndicator(s: {
  id: string
  label: string
  cardinal?: boolean
  description: string
  help: string
  options: GradedOption[]
  grade: (v: number) => Grade
  selectLabel: string
  number: { label: string; help: string }
  note: { label: string; placeholder: string; help: string }
}): IndicatorDef {
  const map = gradeMap(s.options)
  return {
    id: s.id,
    label: s.label,
    parameter: 'structure',
    cardinal: s.cardinal,
    description: s.description,
    help: s.help,
    thresholds: thresholdsOf(s.options),
    inputs: [
      optionalSelect(s.selectLabel, s.options),
      { kind: 'number', name: 'value', label: s.number.label, unit: '%', min: 0, max: 100, help: s.number.help },
      { kind: 'textarea', name: 'note', label: s.note.label, rows: 2, placeholder: s.note.placeholder, help: s.note.help },
    ],
    suggest: (i) => {
      const v = num(i.value)
      if (v !== undefined) return s.grade(v)
      return byOption(map)(i)
    },
    warn: (i) => {
      const v = num(i.value)
      if (v === undefined || !i.choice) return null
      const g = s.grade(v)
      if (map[String(i.choice)] === g) return null
      const match = s.options.find((o) => o.grade === g)
      return match ? `${pct(v)} to klasa „${match.label}”.` : null
    },
    describe: (i) => {
      const v = num(i.value)
      const note = String(i.note ?? '').trim()
      const head = note || labelOf(s.options, i.choice)
      return [head, v !== undefined ? `${pct(v)} płatów` : ''].filter(Boolean).join('; ')
    },
  }
}

// ---------- procent transektu z kidziną ----------

function coverageValue(i: InputValues): { v?: number; from?: 'lengths' } {
  const typed = num(i.value)
  if (typed !== undefined) return { v: typed }
  const seg = num(i.segments)
  const len = num(i.length)
  if (seg === undefined || !len) return {}
  return { v: Math.round((seg / len) * 1000) / 10, from: 'lengths' }
}

// ---------- wskaźniki ----------

const SI_MGSP = (name: string) => `W SI MGSP i w sprawozdaniach z monitoringu wskaźnik nazywa się „${name}”.`

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description: 'Zmiana powierzchni płatów kidziny na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury.',
    help: `Co wybrać: jak zmieniła się powierzchnia płatów kidziny na stanowisku od poprzedniej obserwacji (albo względem danych z literatury, ortofotomap, warstw Urzędu Morskiego). Powierzchnię w hektarach możesz wpisać obok – trafi do pola „wartość”.

Uwaga na efemeryczność: kidzina tworzy się i znika z każdym sztormem, a plaże się sprząta. Jedna obserwacja to migawka. Do interpretacji potrzebna jest wiedza o lokalnej dynamice brzegu – Urząd Morski zwykle ją ma. Przy pierwszym badaniu (nie ma z czym porównać) wybierz „Brak danych do porównania” albo oceń ekspercko.

Praktyka: w karcie z przewodnika (Orzechowo 2013) punktowe płaty o łącznej powierzchni 0,01 ha dostały U2.`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się',
      U1: 'Niewielki spadek powierzchni siedliska',
      U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi w literaturze',
    },
    inputs: [
      optionalSelect('Zmiana powierzchni', AREA, 'Puste, gdy oceniasz ekspercko (np. pierwsze badanie, a płaty są szczątkowe).'),
      { kind: 'number', name: 'areaHa', label: 'Powierzchnia (opcjonalnie)', unit: 'ha', min: 0, help: 'Powierzchnia płatów kidziny na stanowisku, jeśli ją znasz – trafi do pola „wartość”. Zwykle setne części hektara.' },
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => {
      const ha = num(i.areaHa)
      return [ha !== undefined ? `${plNum(ha)} ha` : '', i.choice ? labelOf(AREA, i.choice).toLowerCase() : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'species',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków charakterystycznych z przybliżonym procentem pokrycia transektu przez dany gatunek. Ocena uwzględnia głównie liczbę gatunków diagnostycznych i to, na jakiej części płatów występują.',
    help: `Co wpisać: gatunki charakterystyczne stwierdzone na transekcie z przybliżonym pokryciem transektu (%), a potem wybrać, na jakiej części płatów kidziny rosną.

Gatunki charakterystyczne wg przewodnika (tab. 1): łoboda zdobna Atriplex calotheca, łoboda nadbrzeżna A. littoralis, łoboda oszczepowata A. prostrata subsp. prostrata, rukwiel nadmorska Cakile maritima subsp. maritima, maruna nadmorska Matricaria maritima, solanka kolczysta Salsola kali subsp. kali. Inne gatunki (rdest ptasi, podbiał) do oceny się nie liczą – wpisz je w zdjęciach.

Praktyka 2024: FV, gdy gatunki charakterystyczne pokrywały 60–75% transektu; U1, gdy były zwykle 1–2 gatunki o znacznie niższym pokryciu; U2, gdy brak albo pojedyncze okazy.

Wskaźnik kardynalny. Dlaczego: to jednoroczne halofilne nitrofity, które pojawiają się tylko na wale szczątków organicznych – bez nich nagromadzenie wodorostów jest tylko śmietnikiem na plaży.`,
    thresholds: thresholdsOf(SPECIES_SHARE),
    inputs: [
      speciesInput(
        'Gatunki charakterystyczne na transekcie',
        'Gatunki charakterystyczne z przybliżonym pokryciem transektu w %, np. Atriplex prostrata 20, Cakile maritima 15. Lista trafia do karty jako „wartość”.',
      ),
      selectInput('Na jakiej części płatów występują', SPECIES_SHARE),
    ],
    suggest: byOption(gradeMap(SPECIES_SHARE)),
    explain: (i) => {
      const names = rowNames(i.species)
      if (!names.length) return null
      const ch = names.filter(isCharacteristic1210)
      return `Gatunków charakterystycznych na liście: ${new Set(ch).size} z ${names.length}.`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (!names.length) return null
      const ch = names.filter(isCharacteristic1210)
      const other = names.filter((n) => !isCharacteristic1210(n))
      if (!ch.length && (i.choice === 'over50' || i.choice === 'below50'))
        return 'Na liście nie ma żadnego z 6 gatunków charakterystycznych z tab. 1 – sprawdź wybór (bez nich to U2).'
      return other.length ? `Spoza listy gatunków charakterystycznych: ${other.join(', ')} – nie liczą się do oceny (wpisz je w zdjęciach).` : null
    },
    describe: (i) => describeSpecies(speciesRows(i.species)) || labelOf(SPECIES_SHARE, i.choice),
  },
  {
    id: 'coverage',
    label: 'Procent powierzchni zajęty przez siedlisko na transekcie',
    parameter: 'structure',
    description: `Długość odcinków transektu, na których odnotowano kidzinę, jako procent całkowitej długości transektu. ${SI_MGSP('Pokrycie transektu przez kidzinę')}`,
    help: `Co wpisać: jaka część transektu ma kidzinę. Najprościej zmierzyć (GPS, krokami) długość odcinków z kidziną i wpisać ją obok długości transektu – formularz policzy procent. Możesz też wpisać sam procent albo tylko wybrać klasę.

Progi: >30% FV, 10–30% U1, <10% U2. Granice 10% i 30% formularz liczy do U1 (tab. 2: „na 10–30%”).

Dlaczego: kidzina jest efemeryczna – sztorm ją nanosi, plażowicze i sprzątanie usuwają. Udział na transekcie mówi, czy wybrzeże w ogóle daje jej szansę się utrzymać. Sprawozdania: najczęściej obniżany wskaźnik (2024: U2 na 68% stanowisk).`,
    thresholds: { FV: 'Płaty siedliska na >30% transektu', U1: 'Płaty siedliska na 10–30% transektu', U2: 'Płaty siedliska na <10% transektu' },
    inputs: [
      { kind: 'number', name: 'segments', label: 'Łączna długość odcinków z kidziną', unit: 'm', min: 0, help: 'Suma długości odcinków transektu, na których jest kidzina, w metrach. Razem z długością transektu daje procent.' },
      { kind: 'number', name: 'length', label: 'Długość transektu', unit: 'm', min: 0, defaultValue: 400, help: 'Długość transektu w metrach. Standard 400 m, dopuszczalnie 100–400 m – wpisz faktyczną.' },
      { kind: 'number', name: 'value', label: 'Procent transektu z kidziną', unit: '%', min: 0, max: 100, help: 'Gdy wpiszesz procent, ma pierwszeństwo przed liczeniem z długości.' },
      optionalSelect('Klasa (gdy bez pomiaru)', COVERAGE, 'Wybierz, gdy nie masz pomiaru długości ani procentu.'),
    ],
    suggest: (i) => {
      const { v } = coverageValue(i)
      return v !== undefined ? gradeCoverage1210(v) : byOption(gradeMap(COVERAGE))(i)
    },
    explain: (i) => {
      const { v, from } = coverageValue(i)
      return v !== undefined && from === 'lengths' ? `${plNum(num(i.segments)!)} m z ${plNum(num(i.length)!)} m transektu = ${pct(v)}.` : null
    },
    warn: (i) => {
      const { v } = coverageValue(i)
      if (v !== undefined && v > 100) return 'Ponad 100% transektu? Sprawdź długości.'
      if (v === undefined || !i.choice) return null
      return gradeMap(COVERAGE)[String(i.choice)] === gradeCoverage1210(v) ? null : `${pct(v)} nie pasuje do wybranej klasy.`
    },
    describe: (i) => {
      const { v } = coverageValue(i)
      if (v !== undefined) return `${pct(v)} transektu`
      return { over30: '>30% transektu', '10to30': '10–30% transektu', below10: '<10% transektu' }[String(i.choice)] ?? ''
    },
  },
  {
    id: 'waves',
    label: 'Naturalna działalność fal i sztormów',
    parameter: 'structure',
    description: 'Korzystne dla zachowania siedliska jest jego cykliczne odtwarzanie w wyniku akumulacyjnej działalności fal i sztormów.',
    help: `Co wybrać: czy i na jakiej części transektu człowiek ogranicza działanie morza – opaski brzegowe, ostrogi, gabiony, betonowe nabrzeża, refulacja (sztuczne zasilanie plaży piaskiem), nasadzenia stabilizujące, utwardzone ciągi spacerowe. Możesz wpisać procent transektu z ograniczeniem – ma pierwszeństwo.

Progi: ograniczenie tylko na niewielkiej części (do 30%) – FV, na części (powyżej 30%) – U1, na całym transekcie – U2.

Dlaczego: kidzina powstaje z tego, co wyrzuci morze. Fale i sztormy niszczą ją i odtwarzają – to jej normalny cykl. Brzeg umocniony przestaje dostawać materiał. Najlepiej oceniany wskaźnik (2024: FV na 88% stanowisk); U2 np. przy oczepie kamiennym albo plaży zasypanej refulatem.`,
    thresholds: {
      FV: 'Naturalna działalność fal i sztormów ograniczona w wyniku działalności człowieka tylko na niewielkiej części transektu (do 30%)',
      U1: 'Naturalna działalność fal i sztormów ograniczona w wyniku działalności człowieka na części transektu (powyżej 30%)',
      U2: 'Naturalna działalność fal i sztormów ograniczona w wyniku działalności człowieka na całym transekcie',
    },
    inputs: [
      selectInput('Ograniczenie działalności fal', WAVES),
      { kind: 'number', name: 'value', label: 'Część transektu z ograniczeniem (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Procent długości transektu, na którym umocnienia albo inne prace ograniczają działanie morza. Ma pierwszeństwo przed wyborem.' },
      { kind: 'textarea', name: 'note', label: 'Co ogranicza (opcjonalnie)', rows: 2, placeholder: 'np. opaska brzegowa na 150 m, ostrogi', help: 'Rodzaj i położenie umocnień, refulacji, nasadzeń. Trafia do „wartości” w karcie.' },
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v !== undefined ? gradeWaves1210(v) : byOption(gradeMap(WAVES))(i)
    },
    warn: (i) => {
      const v = num(i.value)
      if (v === undefined || !i.choice) return null
      return gradeMap(WAVES)[String(i.choice)] === gradeWaves1210(v) ? null : `${pct(v)} transektu nie pasuje do wybranej klasy.`
    },
    describe: (i) => {
      const v = num(i.value)
      const note = String(i.note ?? '').trim()
      const head = i.choice === 'none' ? 'brak ograniczeń naturalnej działalności fal i sztormów' : labelOf(WAVES, i.choice)
      return [note || head, v !== undefined ? `ograniczenie na ${pct(v)} transektu` : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'aliens',
    label: 'Występowanie gatunków obcych ekologicznie lub geograficznie',
    parameter: 'structure',
    description: `Lista gatunków obcych odnotowanych na transekcie. ${SI_MGSP('Gatunki obce geograficznie')}`,
    help: `Co wpisać: gatunki obce stwierdzone na transekcie (z pokryciem, jeśli się da) i wybrać opis.

Obce ekologicznie: krzewy wysadzane przez Urząd Morski w ramach „stabilizacji” brzegu – róża pomarszczona Rosa rugosa, wierzba ostrolistna Salix acutifolia, wierzba wawrzynkowa S. daphnoides, rokitnik Hippophaë rhamnoides. Notuj je też na wydmach poza transektem (w uwagach). Obce geograficznie (sprawozdanie 2024): rzepień brzegowy Xanthium albinum (najczęstszy), uczep amerykański, przymiotno kanadyjskie, chwastnica jednostronna, czeremcha amerykańska, rdestowiec ostrokończysty…

Progi: brak gatunków ekspansywnych – FV; co najwyżej pojedyncze egzemplarze jednego gatunku niewykazującego ekspansji – U1; więcej niż jeden gatunek albo jeden ekspansywny – U2. Formularz porównuje wybór z listą i ostrzega przy niezgodności (gatunki ekspansywne z katalogu są oznaczone).

Dlaczego: obce krzewy utrwalają plażę i wypierają nitrofity, a nasiona antropofitów przypływają razem z kidziną i śmieciami.`,
    thresholds: thresholdsOf(ALIENS),
    inputs: [
      speciesInput('Gatunki obce na transekcie', 'Gatunki obce (ekologicznie i geograficznie) z przybliżonym pokryciem transektu w %. Brak – zostaw pustą listę i wybierz „Brak gatunków obcych”.'),
      selectInput('Gatunki obce', ALIENS),
    ],
    suggest: byOption(gradeMap(ALIENS)),
    explain: (i) => {
      const names = [...new Set(rowNames(i.species))]
      if (!names.length) return null
      const exp = names.filter((n) => findSpecies1210(n)?.expansive)
      return `Gatunków obcych na liście: ${names.length}${exp.length ? `, ekspansywne: ${exp.join(', ')}` : ''}.`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      const fromList = gradeAliens1210(names)
      if (!fromList) return null
      if (i.choice === 'none') return 'Wybrano „Brak”, a lista gatunków obcych nie jest pusta.'
      const chosen = gradeMap(ALIENS)[String(i.choice)]
      return chosen && chosen !== fromList ? `Wg listy gatunków obcych to ${fromList} (tab. 2: więcej niż jeden gatunek albo jeden ekspansywny – U2).` : null
    },
    describe: (i) => describeSpecies(speciesRows(i.species)) || (i.choice === 'none' ? 'nie stwierdzono' : labelOf(ALIENS, i.choice)),
  },
  shareIndicator({
    id: 'damage',
    label: 'Zniszczenia mechaniczne',
    cardinal: true,
    description: 'Obserwowanie na transekcie i w zasięgu wzroku obecności zniekształcenia siedliska w postaci rozjeżdżania, wydeptania, usunięcia „śmieci”.',
    help: `Co ocenić: jaka część płatów kidziny jest zniszczona – rozjeżdżona (quady, sprzęt do sprzątania plaży, pojazdy wojskowe), wydeptana, zgrabiona i wywieziona razem ze śmieciami, zasypana refulatem. Patrz na transekcie i w zasięgu wzroku; miejsca zniszczeń zaznacz GPS-em.

Progi (udział płatów): <10% FV, 10–50% U1, >50% U2. Możesz wpisać procent – ma pierwszeństwo – i krótki opis, który trafi do karty („brak”, „ślady quadów na całej plaży”).

Wskaźnik kardynalny. Dlaczego: kidzinę najbardziej niszczy sprzątanie plaż (G05.05) – usuwa się ją razem ze śmieciami. Sprawozdanie 2024: U2 na 56% stanowisk (wydeptywanie, plażowanie, ciężki sprzęt). Termin badań przed szczytem sezonu daje zwykle lepsze oceny – zapisz to w uwagach.`,
    options: DAMAGE,
    grade: gradeDamage1210,
    selectLabel: 'Zniszczone płaty kidziny',
    number: { label: 'Udział zniszczonych płatów (opcjonalnie)', help: 'Procent płatów kidziny rozjeżdżonych, wydeptanych albo usuniętych. Ma pierwszeństwo przed wyborem klasy.' },
    note: { label: 'Opis zniszczeń (opcjonalnie)', placeholder: 'np. brak; ślady sprzętu do sprzątania plaży', help: 'Krótki opis, co zniszczyło kidzinę. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.' },
  }),
  shareIndicator({
    id: 'litter',
    label: 'Zaśmiecenie',
    cardinal: true,
    description: `Udział procentowy śmieci w osadzonym materiale. ${SI_MGSP('Inne zniekształcenia (rozjeżdżenie, wydeptanie, zaśmiecenie)')}`,
    help: `Co ocenić: na jakiej części płatów kidziny śmiecie (folie, plastik, styropian, sieci, odpady po plażowiczach) stanowią istotną część osadzonego materiału.

Progi (udział płatów): <10% FV, 10–50% U1, >50% U2. Możesz wpisać procent – ma pierwszeństwo – i opis, który trafi do karty.

Wskaźnik kardynalny. Dlaczego: śmiecie same nie zabijają nitrofitów, ale ściągają sprzątanie plaży, a ono wywozi kidzinę razem z nimi. W SI MGSP ten wskaźnik obejmuje szerzej „inne zniekształcenia” (rozjeżdżenie, wydeptanie, zaśmiecenie) – rozjeżdżanie i wydeptywanie oceniasz tu w „Zniszczeniach mechanicznych”, a w opisie możesz je wspomnieć.`,
    options: LITTER,
    grade: gradeLitter1210,
    selectLabel: 'Zaśmiecone płaty kidziny',
    number: { label: 'Udział zaśmieconych płatów (opcjonalnie)', help: 'Procent płatów, na których śmiecie są istotną częścią osadów. Ma pierwszeństwo przed wyborem klasy.' },
    note: { label: 'Opis zaśmiecenia (opcjonalnie)', placeholder: 'np. częściowo zaśmiecone (ok. 30%), folie i plastik', help: 'Krótki opis zaśmiecenia. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.' },
  }),
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu (linia przejścia obserwatora wzdłuż brzegu), z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie.

Dlaczego: kidzina co roku leży gdzie indziej, ale transekt ma być ten sam – za 3–6 lat ktoś musi przejść tę samą linię.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Orzechowo',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – zwykle miejscowość albo kilometr brzegu, np. „Orzechowo”, „Kd/49,5 km, Sobieszewo”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego odcinka brzegu.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    defaultValue: 'Atriplicetum littoralis',
    placeholder: 'np. Atriplicetum littoralis',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Dla 1210: klasa Cakiletea maritimae, rząd Atriplicetalia littoralis, związek Atriplicion littoralis, zespół Atriplicetum littoralis. Gdy płaty są kadłubowe, wystarczy rząd (jak w karcie z przewodnika: „Atriplicetalia littoralis”).`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Typ brzegu (abrazyjny/akumulacyjny, klif), szerokość plaży, z czego jest kidzina, ile płatów i jakiej wielkości.',
    help: `Syntetyczny opis stanowiska:
• typ brzegu: akumulacyjny czy abrazyjny, klif, wydmy, szerokość plaży i jej skład granulometryczny;
• gdzie leży kidzina: wał u podnóża wydmy lub klifu, wilgotne zagłębienia, pryzmy po sztormach;
• z czego jest zbudowana: wodorosty, trawy morskie, drewno, kora, muszle, kamienie, piasek;
• ile płatów, jakiej szerokości i długości, czy kidzina jest całoroczna;
• antropopresja: wejścia na plażę, sprzątanie, umocnienia brzegu.

Nie zaliczaj kidziny na podłożu antropogenicznym (opaski, gabiony, falochrony).`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Łączna powierzchnia płatów kidziny na stanowisku, w hektarach – zwykle setne części (3 płaty po 10 m² ≈ 0,003 ha). Oszacuj w terenie albo z ortofotomapy.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „OChK Pas pobrzeży na wschód od Ustki; PLH220100 Klify Poddębskie”.',
  }),
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    defaultValue: '400x20 m',
    required: true,
    hint: 'Standard 400×20 m wzdłuż brzegu; dopuszczalnie 100–400 m długości.',
    help: `Transekt to linia przejścia obserwatora wzdłuż brzegu, długości 400 m; obserwator notuje zjawiska do 10 m po każdej stronie (szerokość 20 m). Gdy się nie da, długość można skrócić do 100–400 m – wpisz faktyczną (w karcie z przewodnika: 175 m).

Linia ma przechodzić przez najbardziej prawdopodobne miejsce gromadzenia kidziny – odległość od brzegu zależy od typu wybrzeża. Dłuższy transekt niż w innych siedliskach, bo procesy tworzenia kidzin zachodzą w większej skali.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    defaultValue: '1',
    required: true,
    help: 'Plaża leży tuż nad poziomem morza – zwykle 0–2 m n.p.m.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 18.09.2013',
    required: true,
    hint: 'Optymalnie od czerwca do października.',
    help: `Dzień badań terenowych. Optymalny termin: czerwiec–październik. Monitoring co 3 lata razem z innymi siedliskami nadmorskimi, a jeśli się nie da – co 6 lat.

Uwaga: w środku sezonu wakacyjnego plaże są sprzątane i deptane, więc oceny zniszczeń i zaśmiecenia wychodzą gorzej niż przed sezonem (sprawozdania 2018 i 2024). Zapisz to w uwagach.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 6 && m <= 10 ? null : 'Termin poza optymalnym oknem (czerwiec–październik). Nitrofity mogą być nierozwinięte albo już zniszczone.'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- spisy roślin w miejscach największego nagromadzenia kidziny ----------

const r7120 = methodology7120.releves.fields

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', {
    help: 'Współrzędne GPS środka spisu. Spisy robi się tam, gdzie kidziny jest najwięcej – zaznacz je GPS-em, żeby następny obserwator wiedział, gdzie szukać.',
  }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka spisu, zwykle 0–2 m.' }),
  pickField(r7120, 'area', {
    defaultValue: 2,
    help: 'Powierzchnia spisu w m². Metodyka nie narzuca wielkości – płaty kidziny są małe; w karcie z przewodnika zdjęcia miały po 2 m². Wpisz faktyczną.',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Na plaży zwykle 0°.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…). Dla powierzchni płaskiej wpisz „brak”.' }),
  {
    kind: 'number',
    name: 'coverC',
    group: 'Warstwa C',
    label: 'Zwarcie C',
    unit: '%',
    min: 0,
    max: 100,
    help: 'Procent powierzchni spisu pokryty przez rośliny (warstwa C – zielna). Na kidzinie to zwykle 10–50%.',
  },
  {
    kind: 'number',
    name: 'heightC',
    group: 'Warstwa C',
    label: 'Wysokość C',
    unit: 'cm',
    min: 0,
    help: 'Typowa wysokość roślin w warstwie C, w centymetrach (łobody i rukwiel zwykle 20–50 cm).',
  },
  pickField(r7120, 'unit', {
    placeholder: 'np. Atriplicetalia littoralis',
    help: 'Jednostka fitosocjologiczna spisu: Atriplicetum littoralis, a przy płatach kadłubowych rząd Atriplicetalia littoralis.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: `Wszystkie gatunki naczyniowe porastające kidzinę na powierzchni spisu z ilościowością w skali Braun-Blanqueta (r, +, 1–5). Wszystko w warstwie C – drzew i krzewów na kidzinie nie ma (sadzone krzewy obce wpisz w B, jeśli wchodzą w spis).`,
  }),
]

export const methodology1210: Methodology = {
  code: '1210',
  name: 'Kidzina na brzegu morskim',
  source:
    'Ogrodniczuk N., Mróz W. 2015, Kidzina na brzegu morskim (1210), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. IV, GIOŚ, s. 46–55 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2013–2014, 2016–2018 i 2023–2025',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Na transekcie wykonaj spisy roślin naczyniowych porastających kidzinę w kilku miejscach, gdzie jej nagromadzenie jest szczególnie duże (w przykładzie z przewodnika: 3 spisy po 2 m²). Miejsca oznacz GPS-em, skala Braun-Blanqueta, wszystko w warstwie C.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Ocena realnych możliwości utrzymania siedliska we właściwej kondycji, uwzględniająca jego obecny stan zachowania oraz czynniki, mogące na nie oddziaływać w najbliższej przyszłości.',
    help: `Weź pod uwagę cały odcinek brzegu, nie tylko transekt: sprzątanie plaż (najczęstsze zagrożenie), presję turystyczną i wejścia na plażę, planowane umocnienia brzegu i refulację, ciągi spacerowe, ekspansję róży pomarszczonej i wierzby ostrolistnej, poszukiwanie bursztynu.

Działania ochronne, o których warto wspomnieć: brak ingerencji (nie sprzątać kidziny), tablice informacyjne, ogrodzenie pasa kidziny przed rozdeptywaniem, zakaz poszukiwania bursztynu w obrębie siedliska, sprzątanie samych śmieci ręcznie zamiast mechanicznego grabienia plaży.

W karcie z przewodnika (Orzechowo 2013) perspektywy oceniono na XX – przy siedlisku tak efemerycznym to dopuszczalne.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Perspektywy zachowania siedliska niepewne, możliwy nieznaczny wpływ czynników zagrażających',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, siedlisko w najbliższym czasie będzie zanikać',
    },
  },

  impactCodes: [
    { code: 'C01.01.02', name: 'Usuwanie materiału z plaż' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D03.01.02', name: 'Pirsy / przystanie turystyczne lub mola' },
    { code: 'D03.03', name: 'Konstrukcje morskie' },
    { code: 'D05', name: 'Usprawniony dostęp do obszaru' },
    { code: 'E01.02', name: 'Nieciągła miejska zabudowa' },
    { code: 'E03.01', name: 'Pozbywanie się odpadów z gospodarstw domowych / obiektów rekreacyjnych' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
    { code: 'G01.08', name: 'Inne rodzaje sportu i aktywnego wypoczynku' },
    { code: 'G04.01', name: 'Poligony' },
    { code: 'G05', name: 'Inna ingerencja i zakłócenia powodowane przez działalność człowieka' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'G05.05', name: 'Intensywne utrzymywanie parków publicznych / oczyszczanie plaż' },
    { code: 'H03.03', name: 'Makrozanieczyszczenie morza (np. torebki foliowe, styropian)' },
    { code: 'H07', name: 'Inne formy zanieczyszczenia' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'J02.05.01', name: 'Modyfikowanie przepływów wodnych (pływów i prądów morskich)' },
    { code: 'J02.05.06', name: 'Zmiany ekspozycji na fale' },
    { code: 'J02.12.01', name: 'Prace związane z obroną przed aktywnością morza i ochroną wybrzeży, groble' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'L07', name: 'Sztorm, cyklon' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. sąsiedztwo 2110, 2120, 2130, 1230; ptaki siewkowe.',
        help: 'Wartości przyrodnicze stanowiska poza samą kidziną: sąsiednie siedliska (inicjalne stadia wydm białych 2110, wydmy białe 2120, wydmy szare 2130, klify 1230), ptaki siewkowe gniazdujące na plaży, rzadkie gatunki roślin. Brak informacji – „Nie pozyskano danych”.',
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: `Jakie działania ochronne wykonano i jaka jest ich skuteczność, oraz co proponujesz. Typowe dla 1210: brak ingerencji w kidzinę (niesprzątanie jej z plaży), tablice informacyjne, ogrodzenie pasa kidziny, płotki wydmotwórcze, zakaz poszukiwania bursztynu, zamknięcie dojść do plaży w rezerwatach. Brak działań – „Brak”.`,
      }
    return f
  }),

  speciesCatalog: SPECIES_1210.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer1210(s) })),
  speciesInfo: (name) => {
    const e = findSpecies1210(name)
    if (!e) return undefined
    return e.expansive ? `${GROUP_LABELS_1210[e.group]}, ekspansywny` : GROUP_LABELS_1210[e.group]
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator1210 = (id: string): IndicatorDef => {
  const i = methodology1210.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 1210`)
  return i
}
