// Metodyka 6120* (ciepłolubne śródlądowe murawy napiaskowe Koelerion glaucae) jako dane. Źródło: Kujawa-Pawlaczyk J.
// 2010, „6120 Ciepłolubne śródlądowe murawy napiaskowe” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych.
// Przewodnik metodyczny, cz. I, GIOŚ, s. 106–118 (tab. 1 i 2, karta Kalinik 2008), z praktyką oceny ze sprawozdań
// z monitoringu 2006–2008, 2013–2014, 2015–2018 i 2023–2025. Siedlisko priorytetowe, nieleśne, półnaturalne (wypas):
// jeden transekt 200 m (karta: 10×200 m), 3 zdjęcia fitosocjologiczne co 100 m (początek, środek, koniec).
// Z modułu leśnego brane są tylko klocki generyczne.
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_6120,
  SPECIES_6120,
  defaultLayer6120,
  findSpecies6120,
  isAlien6120,
  isCharacteristic6120,
  isExpansive6120,
  isTypical6120,
  isWeakAlien6120,
  isWoody6120,
  speciesKey6120,
} from './species'

// ---------- progi liczbowe (tab. 2) ----------

/**
 * Gatunki charakterystyczne (lista tab. 1): „co najmniej 5” FV, „co najmniej 2 do 5” U1, „jeden lub brak” U2.
 * 5 należy do FV (przedziały w tab. 2 zachodzą na siebie – „co najmniej 5” jest wprost).
 */
export const gradeCharacteristic6120 = (n: number): Grade => (n >= 5 ? 'FV' : n >= 2 ? 'U1' : 'U2')

/** Propozycja ze sprawozdania 2015–2018 (NIE przyjęta – 2024 liczono po staremu): ≥5 FV, 3–4 U1, 1–2 U2. */
export const gradeCharacteristicProposal6120 = (n: number): Grade => (n >= 5 ? 'FV' : n >= 3 ? 'U1' : 'U2')

/**
 * Ekspansja krzewów i podrostu drzew (pokrycie): „poniżej 10%” FV, „od 10 do 25%” U1, „powyżej 25%” U2.
 * Obie granice (10 i 25%) należą do U1.
 */
export const gradeShrubs6120 = (p: number): Grade => (p < 10 ? 'FV' : p <= 25 ? 'U1' : 'U2')

/**
 * Obce gatunki inwazyjne: brak FV; „pojedynczo, nie więcej niż 5% powierzchni (do 2 gatunków)” U1;
 * „licznie, powyżej 5% powierzchni (więcej niż dwa gatunki)” U2. Formularz czyta U2 jako „ponad 5% ALBO ponad
 * 2 gatunki” (sprawozdanie 2024: U1 = „1–2 gatunki i pokrycie nie przekraczało 5%”). 5% to jeszcze U1.
 */
export function gradeAliens6120(count: number, cover?: number): Grade {
  if (count <= 0) return 'FV'
  if (count > 2) return 'U2'
  return cover !== undefined && cover > 5 ? 'U2' : 'U1'
}

export type Occurrence = 'single' | 'scattered' | 'patches'

/**
 * Rodzime gatunki ekspansywne roślin zielnych: „brak, ewentualnie jeden gatunek pojedynczo” FV; „jeden lub dwa
 * gatunki w rozproszeniu” U1; „powyżej dwóch gatunków, tworzących zwarte płaty” U2. Liczba gatunków decyduje,
 * forma występowania rozstrzyga tylko przy jednym gatunku (pojedynczo → FV). Jeden gatunek bez formy → U1.
 */
export function gradeExpansive6120(count: number, occurrence?: Occurrence | ''): Grade {
  if (count <= 0) return 'FV'
  if (count > 2) return 'U2'
  return count === 1 && occurrence === 'single' ? 'FV' : 'U1'
}

const pct = (v: number) => `${plNum(v)}%`
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey6120(n), n])).values()]
const sumCover = (v: unknown): number | undefined => {
  const covers = speciesRows(v)
    .filter((r) => r.name?.trim())
    .map((r) => num(r.cover))
    .filter((c): c is number => c !== undefined)
  return covers.length ? Math.round(covers.reduce((a, b) => a + b, 0) * 10) / 10 : undefined
}

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'other', label: 'Inne kombinacje (np. niewielki ubytek powierzchni)', grade: 'U1' },
  { value: 'clearDecrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const OCCURRENCE: { value: Occurrence | ''; label: string }[] = [
  { value: '', label: '—' },
  { value: 'single', label: 'Pojedynczo' },
  { value: 'scattered', label: 'W rozproszeniu' },
  { value: 'patches', label: 'Zwarte płaty' },
]
const STRUCTURE: GradedOption[] = [
  { value: 'mosaicGrass', label: 'Płaty Koelerion glaucae tworzą mozaikę ze zbiorowiskami muraw szczotlichowych (Corynephorion canescentis) lub bliźniczkowych (Nardion)', grade: 'FV' },
  { value: 'majorityMeadow', label: 'Płaty Koelerion glaucae tworzą większościową mozaikę ze zbiorowiskami łąkowymi ze związku Arrhenatherion elatioris', grade: 'U1' },
  { value: 'minorityMeadow', label: 'Płaty Koelerion glaucae tworzą mniejszościową mozaikę ze zbiorowiskami łąkowymi (Arrhenatherion elatioris) lub inicjalnymi stadiami lasu', grade: 'U2' },
  { value: 'isolated', label: 'Płaty małe i izolowane, nie tworzą mozaiki (praktyka 2024)', grade: 'U2' },
]
const ECOTONE: GradedOption[] = [
  { value: 'none', label: 'Brak strefy ekotonowej z lasem, najczęściej mozaika z innymi płatami muraw lub łąk', grade: 'FV' },
  { value: 'sharp', label: 'Najczęściej ostra granica murawa–las, nie sąsiadująca z płatami zbiorowisk okrajkowych', grade: 'U1' },
  { value: 'gradual', label: 'Granica murawa–las lub murawa–łąka nie jest wyraźna: murawa płynnie przechodzi w las lub inny typ zbiorowiska nieleśnego (łąka, zbiorowiska okrajkowe itp.)', grade: 'U2' },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

/** Select niewymagany – gdy wpiszesz liczbę albo listę, wystarczy to. */
const optionalSelect = (label: string, options: GradedOption[], help?: string): FieldDef => ({ ...selectInput(label, options, help), required: false })

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

// ---------- liczenie z list ----------

/** Gatunki charakterystyczne z tab. 1 na liście (synonimy jako jeden gatunek). */
const characteristicOnList = (i: InputValues) => distinct(rowNames(i.species).filter(isCharacteristic6120))

/** Liczba gatunków charakterystycznych: wpisana wprost ma pierwszeństwo, inaczej liczona z listy. */
function characteristicCount(i: InputValues): { n: number; from: 'count' | 'list' } | null {
  const c = num(i.count)
  if (c !== undefined) return { n: c, from: 'count' }
  return rowNames(i.species).length || i.none === 'yes' ? { n: characteristicOnList(i).length, from: 'list' } : null
}

/** Pokrycie z pola „łącznie” albo suma z listy. */
const coverOf = (i: InputValues) => num(i.total) ?? sumCover(i.species)

/** Liczba gatunków: wpisana wprost > lista (synonimy raz) > „nie stwierdzono” (0). */
function countOf(i: InputValues): number | undefined {
  const names = distinct(rowNames(i.species))
  return num(i.count) ?? (names.length || i.none === 'yes' ? names.length : undefined)
}

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description: 'Zmiana powierzchni płatów siedliska na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury.',
    help: `Co wybrać: jak zmieniła się powierzchnia muraw napiaskowych na stanowisku od poprzedniego badania (albo względem danych z literatury, ortofotomap). Powierzchnię w hektarach możesz wpisać obok – trafi do pola „wartość”.

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; inne kombinacje – U1; wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub literaturą – U2. Przy pierwszym badaniu wybierz „Brak danych do porównania” (XX) albo oceń ekspercko – karta z przewodnika (Kalinik, pierwsze badanie) podaje „2 ha – FV”.

Dlaczego: murawy zjada sukcesja (sosna, jałowiec, brzoza), zalesianie, zabudowa i zaoranie. Sprawozdanie 2024: FV 33%, U1 34% (nieznaczny ubytek), U2 33% (znikoma lub wyraźnie zmniejszająca się powierzchnia); na ponad 2/3 stanowisk areał nie przekraczał 1 ha.`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się',
      U1: 'Inne kombinacje',
      U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze',
    },
    inputs: [
      optionalSelect('Zmiana powierzchni', AREA, 'Puste, gdy oceniasz ekspercko (np. pierwsze badanie).'),
      { kind: 'number', name: 'areaHa', label: 'Powierzchnia (opcjonalnie)', unit: 'ha', min: 0, help: 'Powierzchnia płatów siedliska na stanowisku, jeśli ją znasz – trafi do pola „wartość”. Karta z przewodnika: 2 ha.' },
      noteInput('Opis (opcjonalnie)', 'np. powierzchnia stabilna, zarastanie od strony starorzecza', 'Krótki opis zmian, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => {
      const ha = num(i.areaHa)
      return [ha !== undefined ? `${plNum(ha)} ha` : '', note(i) || (i.choice && ha === undefined ? labelOf(AREA, i.choice).toLowerCase() : '')].filter(Boolean).join('; ')
    },
  },
  {
    id: 'species',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Liczba gatunków charakterystycznych związku Koelerion glaucae stwierdzonych na transekcie (lista z tab. 1 przewodnika), z udziałem procentowym każdego gatunku (z dokładnością do 10%).',
    help: `Co wpisać: gatunki charakterystyczne stwierdzone na transekcie z pokryciem. Formularz sam policzy te z listy tab. 1 (synonimy jako jeden gatunek). Jeśli liczysz inaczej (np. z gatunkami typowymi z pkt 4), wpisz liczbę wprost – ma pierwszeństwo.

Lista tab. 1 (22 gatunki): lepnica tatarska, lepnica litewska, szczotlicha siwa, rozchodnik sześciorzędowy, goździk kartuzek, lepnica wąskopłatkowa, strzęplica nadobna, kostrzewa piaskowa, traganek piaskowy, piaskownica zwyczajna, kostrzewa pochwiasta, strzęplica sina, lepnica drobnokwiatowa, goździk piaskowy, kostrzewa poleska, mietelnik piaskowy, smagliczka drobna, smagliczka pagórkowata, naradka północna, pięciornik omszony, chondrilla sztywna, łyszczec baldachogronowy. Gatunki typowe z pkt 4 (zawciąg, pięciornik piaskowy, macierzanka piaskowa, rozchodnik ostry, kocanki…) do wskaźnika się nie liczą – formularz pokaże je w ostrzeżeniu.

Progi: co najmniej 5 – FV; 2–4 – U1; 1 lub brak – U2. Tab. 2 pisze „co najmniej 2 do 5” przy U1 – przedziały zachodzą; 5 formularz liczy do FV.

Wskaźnik kardynalny. Uwaga: sprawozdanie 2015–2018 proponowało ostrzejsze progi (≥5 FV, 3–4 U1, 1–2 U2), ale propozycji nie przyjęto – w 2024 r. oceniano według tab. 2 („2–4 gatunki – U1”). Formularz pokazuje propozycję tylko w wyjaśnieniu. Najczęstsze (2018): szczotlicha, kostrzewa piaskowa, strzęplica sina, goździk kartuzek, rozchodnik sześciorzędowy, lepnica wąskopłatkowa.`,
    thresholds: { FV: 'Co najmniej 5 gatunków z listy', U1: '2–4 gatunki z listy (tab. 2: „co najmniej 2 do 5”)', U2: 'Jeden gatunek z listy lub brak' },
    inputs: [
      speciesInput('Gatunki charakterystyczne na transekcie', 'Gatunki charakterystyczne stwierdzone na transekcie, z pokryciem w % (z dokładnością do 10%; dla „<1%” wpisz 0,5). Liczą się te z listy tab. 1 – inne zostaną pokazane w ostrzeżeniu.'),
      { kind: 'number', name: 'count', label: 'Liczba gatunków (opcjonalnie)', min: 0, help: 'Liczba gatunków charakterystycznych wpisana wprost. Ma pierwszeństwo przed liczeniem z listy – użyj, gdy liczysz inaczej niż formularz.' },
      NONE_FIELD('Brak gatunków charakterystycznych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma żadnego gatunku z listy tab. 1 – wtedy wskaźnik to U2.'),
      noteInput('Opis (opcjonalnie)', 'np. strzęplica sina Koeleria glauca 10%, kostrzewa piaskowa…', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = characteristicCount(i)
      return c ? gradeCharacteristic6120(c.n) : null
    },
    explain: (i) => {
      const c = characteristicCount(i)
      if (!c) return null
      const onList = characteristicOnList(i).length
      const proposal = gradeCharacteristicProposal6120(c.n)
      const tail = proposal !== gradeCharacteristic6120(c.n) ? ` Wg nieprzyjętej propozycji 2015–2018 byłoby ${proposal}.` : ''
      return (c.from === 'count' ? `Liczba wpisana wprost: ${plNum(c.n)}. Z listy tab. 1 rozpoznano: ${onList}.` : `Gatunków charakterystycznych z tab. 1 na liście: ${onList} z 22.`) + tail
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (i.none === 'yes' && names.some(isCharacteristic6120)) return 'Zaznaczono „Nie stwierdzono”, a na liście są gatunki z tab. 1.'
      const typical = distinct(names.filter(isTypical6120))
      const other = distinct(names.filter((n) => !isCharacteristic6120(n) && !isTypical6120(n)))
      const c = num(i.count)
      const onList = characteristicOnList(i).length
      const parts: string[] = []
      if (typical.length) parts.push(`Typowe dla siedliska (pkt 4), ale spoza listy tab. 1: ${typical.join(', ')} – formularz ich nie liczy.`)
      if (other.length) parts.push(`Spoza listy tab. 1: ${other.join(', ')} – formularz ich nie liczy.`)
      if (c !== undefined && names.length && gradeCharacteristic6120(c) !== gradeCharacteristic6120(onList))
        parts.push(`Wg listy tab. 1 byłoby ${onList} (${gradeCharacteristic6120(onList)}), a wpisano ${plNum(c)} (${gradeCharacteristic6120(c)}).`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      if (!list && i.none === 'yes') return 'nie stwierdzono'
      const c = num(i.count)
      return list || (c !== undefined ? `${plNum(c)} gat.` : '')
    },
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista inwazyjnych gatunków obcych geograficznie stwierdzonych na transekcie, z udziałem procentowym powierzchni zajętej przez każdy gatunek. Optymalnie – brak obcych gatunków inwazyjnych.',
    help: `Co wpisać: gatunki obce z pokryciem transektu w procentach. Liczba gatunków i pokrycie liczą się z listy; łączne pokrycie albo liczbę gatunków możesz wpisać wprost (mają pierwszeństwo). Brak – zaznacz „Nie stwierdzono”.

Najczęstsze (sprawozdanie 2024, tab. 3): przymiotno kanadyjskie Conyza canadensis (50 stanowisk), czeremcha amerykańska Padus serotina (32), klon jesionolistny, nawłoć późna i kanadyjska, przymiotno białe, robinia akacjowa, łubin trwały, wierzba ostrolistna, dąb czerwony, róża pomarszczona.

Progi (tab. 2): brak – FV; pojedynczo, nie więcej niż 5% powierzchni (do 2 gatunków) – U1; licznie, powyżej 5% powierzchni (więcej niż dwa gatunki) – U2. Formularz liczy U2, gdy pokrycie przekracza 5% albo gatunków jest więcej niż dwa (sprawozdanie 2024: U1 = „1–2 gatunki i pokrycie nie przekraczało 5%”). Równo 5% to jeszcze U1. Gatunki bez podanego pokrycia – liczy się tylko ich liczba.

Wskaźnik kardynalny (od 2010 r.). Uwaga na archeofity i chwasty polne (stokłosa dachowa, włośnice, starzec wiosenny, mak, tasznik…): sprawozdanie 2024 uznało, że „sporadyczny udział 3 jednorocznych gatunków bez tendencji do inwazji nie powinien obniżać oceny”. Formularz liczy każdy wpisany gatunek i ostrzega przy takich – jeśli nie są inwazyjne, nie wpisuj ich albo oceń ekspercko. Żarnowiec miotlasty bywa uznawany za obcy (2018) – w katalogu jest jako rodzimy krzew.`,
    thresholds: {
      FV: 'Brak',
      U1: 'Gatunki inwazyjne występują pojedynczo i nie zajmują więcej niż 5% powierzchni (do 2 gatunków)',
      U2: 'Gatunki inwazyjne występują licznie, zajmując powyżej 5% powierzchni (więcej niż dwa gatunki)',
    },
    inputs: [
      speciesInput('Obce gatunki na transekcie', 'Gatunki obce z pokryciem transektu w %, np. Conyza canadensis 1. Brak – pusta lista i „Nie stwierdzono”.'),
      { kind: 'number', name: 'count', label: 'Liczba gatunków (opcjonalnie)', min: 0, help: 'Liczba gatunków obcych wpisana wprost. Ma pierwszeństwo przed liczeniem z listy.' },
      { kind: 'number', name: 'total', label: 'Łączne pokrycie (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Łączne pokrycie gatunków obcych wpisane wprost. Ma pierwszeństwo przed sumą z listy. Do 5% (przy 1–2 gatunkach) to U1, więcej – U2.' },
      NONE_FIELD('Brak gatunków obcych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków obcych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const n = countOf(i)
      return n === undefined ? null : gradeAliens6120(n, coverOf(i))
    },
    explain: (i) => {
      const names = distinct(rowNames(i.species))
      if (!names.length) return null
      const t = coverOf(i)
      return `Gatunków obcych: ${num(i.count) ?? names.length}, łączne pokrycie ${t !== undefined ? pct(t) : '— (nie podano)'}.`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (i.none === 'yes' && names.length) return 'Zaznaczono „Nie stwierdzono”, a lista gatunków obcych nie jest pusta.'
      if (num(i.count) === 0 && names.length) return 'Wpisano 0 gatunków, a lista nie jest pusta.'
      const parts: string[] = []
      const native = distinct(names.filter((n) => findSpecies6120(n) && !isAlien6120(n)))
      if (native.length) parts.push(`Na liście gatunków obcych są gatunki rodzime: ${native.join(', ')}.`)
      const weak = distinct(names.filter(isWeakAlien6120))
      if (weak.length) parts.push(`Archeofity i chwasty bez tendencji do inwazji: ${weak.join(', ')} – sprawozdanie 2024: sporadyczny udział nie powinien obniżać oceny. Sprawdź, czy chcesz je liczyć.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      if (!list && (i.none === 'yes' || num(i.count) === 0)) return 'nie stwierdzono'
      const t = num(i.total)
      return [list, t !== undefined ? `łącznie ${pct(t)}` : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'expansive',
    label: 'Rodzime gatunki ekspansywne roślin zielnych',
    parameter: 'structure',
    cardinal: true,
    description:
      'Rodzime gatunki roślin zielnych, które często występują w dużym zwarciu, eliminując inne gatunki, z udziałem procentowym każdego gatunku na transekcie. Optymalnie – brak.',
    help: `Co wpisać: rodzime gatunki ekspansywne stwierdzone na transekcie, z pokryciem, i wybierz, jak występują (pojedynczo, w rozproszeniu, zwarte płaty). Brak – zaznacz „Nie stwierdzono”. Gatunków obcych tu nie wpisuj – mają osobny wskaźnik.

Gatunki: tab. 1 – trzcinnik piaskowy Calamagrostis epigejos (zdecydowanie najczęstszy). W sprawozdaniach 2018 i 2024 jako ekspansywne oceniano też: perz właściwy, rajgras wyniosły, mietlicę pospolitą, kłosówkę wełnistą, turzycę owłosioną, wrotycz, bylicę pospolitą, ostrożeń polny, jeżynę popielicę, skrzyp polny – są w katalogu.

Progi (tab. 2): brak, ewentualnie jeden gatunek występujący pojedynczo – FV; jeden lub dwa gatunki w rozproszeniu – U1; powyżej dwóch gatunków, tworzących zwarte płaty – U2. Formularz liczy po liczbie gatunków (0 – FV, 1–2 – U1, ponad 2 – U2); forma występowania rozstrzyga tylko przy jednym gatunku (pojedynczo – FV). Tab. 2 nie przewiduje przypadku 1–2 gatunków w zwartych płatach – formularz daje U1 z ostrzeżeniem (w 2024 r. zwarty trzcinnik bywał oceniany na U2 – oceń ekspercko).

Wskaźnik kardynalny. Dlaczego: trzcinnik i perz tworzą zwartą darń i wojłok, w których giną niskie gatunki muraw – sprawozdanie 2024: pogorszenie na 14 z 47 powtarzanych stanowisk, głównie przez trzcinnik.`,
    thresholds: {
      FV: 'Brak, ewentualnie jeden gatunek występujący pojedynczo',
      U1: 'Obecny jeden lub dwa gatunki, występujące w rozproszeniu',
      U2: 'Powyżej dwóch gatunków, tworzących zwarte płaty',
    },
    inputs: [
      speciesInput('Gatunki ekspansywne na transekcie', 'Rodzime gatunki ekspansywne z pokryciem transektu w %, np. Calamagrostis epigejos 5.'),
      { kind: 'number', name: 'count', label: 'Liczba gatunków (opcjonalnie)', min: 0, help: 'Liczba gatunków ekspansywnych wpisana wprost. Ma pierwszeństwo przed liczeniem z listy.' },
      { kind: 'select', name: 'occurrence', label: 'Jak występują', options: OCCURRENCE, help: 'Forma występowania gatunków ekspansywnych: pojedynczo (pojedyncze osobniki), w rozproszeniu (rozproszone kępy) albo zwarte płaty. Przy jednym gatunku „pojedynczo” daje FV.' },
      NONE_FIELD('Brak gatunków ekspansywnych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków ekspansywnych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const n = countOf(i)
      return n === undefined ? null : gradeExpansive6120(n, i.occurrence as Occurrence | '')
    },
    explain: (i) => {
      const n = countOf(i)
      if (!n) return null
      const t = coverOf(i)
      const head = `Gatunków ekspansywnych: ${n}${t !== undefined ? `, łączne pokrycie ${pct(t)}` : ''}.`
      return n === 1 && !i.occurrence ? `${head} Jeden gatunek – FV tylko, gdy występuje pojedynczo (wybierz „Jak występują”).` : head
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (i.none === 'yes' && names.length) return 'Zaznaczono „Nie stwierdzono”, a lista nie jest pusta.'
      const parts: string[] = []
      const n = countOf(i) ?? 0
      if (n > 0 && n <= 2 && i.occurrence === 'patches')
        parts.push('Tab. 2 nie przewiduje 1–2 gatunków w zwartych płatach (formularz: U1). W 2024 r. zwarte łany trzcinnika bywały oceniane na U2 – oceń ekspercko.')
      if (n > 2 && i.occurrence && i.occurrence !== 'patches') parts.push('Ponad dwa gatunki, ale nie w zwartych płatach – tab. 2 wiąże U2 ze zwartymi płatami; oceń ekspercko.')
      const aliens = distinct(names.filter(isAlien6120))
      if (aliens.length) parts.push(`Gatunki obce wpisz we wskaźniku „Obce gatunki inwazyjne”: ${aliens.join(', ')}.`)
      const odd = distinct(names.filter((n) => findSpecies6120(n) && !isExpansive6120(n) && !isAlien6120(n)))
      if (odd.length) parts.push(`Na liście są gatunki spoza grupy ekspansywnych: ${odd.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      if (!list && i.none === 'yes') return 'nie stwierdzono'
      const occ = OCCURRENCE.find((o) => o.value === i.occurrence && o.value)?.label.toLowerCase()
      return [list, occ ?? ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'shrubs',
    label: 'Ekspansja krzewów i podrostu drzew',
    parameter: 'structure',
    cardinal: true,
    description:
      'Sumaryczne pokrycie wszystkich ekspansywnych gatunków krzewów i drzew na transekcie (z dokładnością do 10%). Optymalnie – brak lub niewielkie pokrycie poniżej 10%, drzewa i krzewy sporadycznie.',
    help: `Co wpisać: łączne pokrycie krzewów i podrostu drzew na transekcie w procentach (rzut koron), a obok listę gatunków. Gatunki obce (czeremcha amerykańska, robinia, klon jesionolistny) wlicz tu do pokrycia i dodatkowo wpisz w „Obcych gatunkach inwazyjnych”.

Gatunki (tab. 1): sosna zwyczajna, brzoza brodawkowata, robinia akacjowa, śliwa tarnina, głogi; rzadziej berberys, szakłak, jałowiec, kruszyna. W 2024 r. najczęściej sosna, rzadziej wierzby, brzozy, głogi, jałowiec, żarnowiec, kruszyna, topole.

Progi (tab. 2): poniżej 10%, występujące sporadycznie i w znacznym rozproszeniu – FV; od 10 do 25%, krzewy nie tworzą zwartych zarośli, w rozproszeniu – U1; powyżej 25%, zwarte zarośla i skupienia – U2. Obie granice (10 i 25%) formularz liczy do U1.

Wskaźnik kardynalny. Dlaczego: po zaprzestaniu wypasu murawy zarastają sosną, brzozą, osiką i jałowcem, a potem przechodzą w bór – główne zagrożenie siedliska. Sprawozdanie 2018: fragment zadrzewienia wchodzący w transekt nie powinien obniżać oceny (Rygol: sosna 20% transektu, ok. 3% w obrębie murawy) – liczy się pokrycie w obrębie siedliska.`,
    thresholds: {
      FV: 'Brak lub niewielkie pokrycie drzew i krzewów poniżej 10% powierzchni, występujących sporadycznie i w znacznym rozproszeniu',
      U1: 'Pokrycie drzew i krzewów od 10 do 25% powierzchni (krzewy nie tworzą zwartych zarośli) i występują w rozproszeniu',
      U2: 'Pokrycie drzew i krzewów powyżej 25% powierzchni (tworzą zwarte zarośla) i występują w skupieniach',
    },
    inputs: [
      { kind: 'number', name: 'value', label: 'Pokrycie krzewów i podrostu drzew', unit: '%', min: 0, max: 100, required: true, help: 'Sumaryczne pokrycie krzewów i podrostu drzew na transekcie (w obrębie siedliska), w procentach. Brak = 0.' },
      speciesInput('Gatunki krzewów i drzew (opcjonalnie)', 'Gatunki tworzące zakrzewienie i podrost na transekcie, np. Pinus sylvestris, Betula pendula, Juniperus communis. Pokrycie poszczególnych gatunków opcjonalne.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak, usunięto podrost drzew', 'Krótki opis, który trafi do „wartości” w karcie zamiast procentu i listy.'),
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v !== undefined ? gradeShrubs6120(v) : null
    },
    warn: (i) => {
      const v = num(i.value)
      const sum = sumCover(i.species)
      const parts: string[] = []
      if (v !== undefined && sum !== undefined && sum > v + 0.05) parts.push(`Suma pokryć gatunków (${pct(sum)}) jest większa niż pokrycie łączne (${pct(v)}) – korony mogą się nakładać, ale sprawdź.`)
      const herbs = distinct(rowNames(i.species).filter((n) => findSpecies6120(n) && !isWoody6120(n) && !isAlien6120(n)))
      if (herbs.length) parts.push(`Na liście są gatunki zielne: ${herbs.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      const v = num(i.value)
      const list = describeSpecies(speciesRows(i.species))
      return note(i) || [v !== undefined ? `pokrycie ${pct(v)}` : '', list].filter(Boolean).join('; ')
    },
  },
  {
    id: 'structure',
    label: 'Struktura przestrzenna płatów muraw',
    parameter: 'structure',
    cardinal: true,
    description:
      'Układ płatów muraw Koelerion glaucae w mozaice z innymi zbiorowiskami. Optymalnie – płaty tworzące mozaikę ze zbiorowiskami muraw szczotlichowych Corynephorion canescentis lub bliźniczkowych Nardion oraz z łąkami świeżymi Arrhenatherion elatioris.',
    help: `Co wybrać: z czym sąsiadują i jaką część mozaiki stanowią płaty murawy napiaskowej na stanowisku. Opisz w notatce, co widać – trafi do karty.

Progi (tab. 2): mozaika z murawami szczotlichowymi (Corynephorion) lub bliźniczkowymi (Nardion) – FV; większościowa mozaika z łąkami Arrhenatherion elatioris (murawa przeważa) – U1; mniejszościowa mozaika z łąkami lub inicjalnymi stadiami lasu (murawa jest w mniejszości) – U2. Sprawozdanie 2024 dawało U2 także płatom „tak małym i izolowanym, że nie tworzyły mozaiki” – jest to osobna opcja.

Wskaźnik kardynalny. Sprawozdanie 2015–2018 proponowało odebrać mu status kardynalny („nie przekłada się bezpośrednio na stan ochrony”) i zauważyło dużą dowolność ocen – propozycji nie przyjęto, w 2024 r. był najgorzej ocenianym wskaźnikiem (46% U2). Karta przykładowa z przewodnika (Kalinik 2008) tego wiersza nie ma, choć sprawozdanie 2006–2008 podaje dla Kalinika FV.`,
    thresholds: thresholdsOf(STRUCTURE),
    inputs: [
      selectInput('Struktura przestrzenna', STRUCTURE),
      noteInput('Opis (opcjonalnie)', 'np. mozaika z murawami szczotlichowymi na wydmie', 'Krótki opis mozaiki. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(STRUCTURE)),
    describe: (i) => note(i) || labelOf(STRUCTURE, i.choice),
  },
  {
    id: 'ecotone',
    label: 'Zachowanie strefy ekotonowej',
    parameter: 'structure',
    description:
      'Charakter granicy murawy z lasem i innymi zbiorowiskami. Optymalnie – brak strefy ekotonowej z lasem, tylko mozaika z innymi płatami muraw lub łąk.',
    help: `Co wybrać: jak murawa graniczy z otoczeniem. Opisz w notatce – trafi do karty.

Progi (tab. 2): brak strefy ekotonowej z lasem, najczęściej mozaika z innymi płatami muraw lub łąk – FV; najczęściej ostra granica murawa–las, nie sąsiadująca z płatami zbiorowisk okrajkowych – U1; granica murawa–las lub murawa–łąka nie jest wyraźna, murawa płynnie przechodzi w las albo inne zbiorowisko nieleśne (łąka, okrajki) – U2.

Jedyny wskaźnik niekardynalny. Sprawozdania 2013–2014 i 2015–2018 proponowały z niego zrezygnować (niejednoznaczny, powiela inne wskaźniki), ale w 2024 r. nadal był oceniany. Różnice między cyklami często wynikają z innej interpretacji niż z realnej zmiany – opisz w notatce, co widzisz.`,
    thresholds: thresholdsOf(ECOTONE),
    inputs: [
      selectInput('Strefa ekotonowa', ECOTONE),
      noteInput('Opis (opcjonalnie)', 'np. powierzchnia otoczona zbiorowiskami murawowymi', 'Krótki opis granicy murawy. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(ECOTONE)),
    describe: (i) => note(i) || labelOf(ECOTONE, i.choice),
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu, z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie. Gdy transektu nie da się wyznaczyć (3 płaty blisko położonych muraw), wpisz współrzędne kolejnych płatów.

Dlaczego: przy badaniu powtarzanym co 3–5 lat ktoś musi wytyczyć ten sam transekt i porównać.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Kalinik',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – zwykle miejscowość, czasem z numerem, np. „Kalinik”, „Kózki I”, „Góry Sobieskiego 4”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego transektu.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. referencyjne',
    help: `Typ stanowiska w sieci monitoringu, np. „referencyjne” (dobrze wykształcona murawa, punkt odniesienia) albo „badawcze”. Jeśli nie wiesz, zostaw puste.

Dlaczego: przy ocenie na poziomie regionu stanowiska referencyjne pokazują, jak wygląda 6120 w dobrym stanie.`,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Sileno otitis-Festucetum – murawy z lepnicą wąskopłatkową',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Dla 6120: klasa Koelerio glaucae-Corynephoretea canescentis, rząd Corynephoretalia canescentis, związek Koelerion glaucae. Zespoły: Corynephoro-Silenetum tataricae, Sileno otitis-Festucetum, Festuco psammophilae-Koelerietum glaucae, Koelerio-Astragaletum arenarii, Festuco-Elymetum arenarii, Cerastio-Androsacetum septentrionalis, Kochietum arenariae, Diantho arenarii-Festucetum polesiacae, Thymo-Potentilletum puberulae (kamieńce karpackie).

Uwaga: murawy szczotlichowe (Corynephorion, Spergulo-Corynephoretum) bez gatunków Koelerion to nie 6120 – na wydmach to 2330. Sprawozdanie 2024: stanowiska Chechło i Klucze „nie różniły się od muraw szczotlichowych” i obniżono im oceny.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Położenie (dolina rzeki, wydma, nasyp), użytkowanie (wypas), zarastanie, mozaika z innymi zbiorowiskami.',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• położenie: dolina dużej rzeki (Bug, Wisła, Odra, Warta), zbocze, wydma śródlądowa, kemy, nasyp, wyrobisko, ugór;
• użytkowanie: wypas (czym, jak intensywnie), koszenie, porzucenie;
• zarastanie: nalot sosny, brzozy, osiki, jałowca; trzcinnik;
• mozaika z innymi zbiorowiskami (murawy szczotlichowe, 2330, 6210, 6510, 91I0);
• antropopresja: zabudowa, wydobycie piasku, zalesienia, śmieci.`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Łączna powierzchnia płatów siedliska na stanowisku, w hektarach (2 ha w karcie z przewodnika, Kalinik). Od niej zależy liczba stanowisk w obiekcie: do 1 ha – 1 stanowisko, 1–3 ha – 2, powyżej 3 ha – 3. Sprawozdanie 2024: na ponad 2/3 stanowisk do 1 ha.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „Natura 2000 PLH140011 Ostoja Nadbużańska; Park Krajobrazowy Podlaski Przełom Bugu”. Brak – „brak”.',
  }),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. Park Krajobrazowy Podlaski Przełom Bugu',
    help: `Kto zarządza terenem: park krajobrazowy lub narodowy, RDOŚ (rezerwat), Lasy Państwowe, gmina, rolnicy indywidualni.

Dlaczego: od właściciela zależy wypas, odkrzaczanie albo zalesienie – najsilniejsze czynniki dla 6120. W karcie z przewodnika części należące do parku i wypasane przez rolników były w dobrym stanie, a niewypasane grunty porolne zarastały.`,
  },
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    defaultValue: '10x200 m',
    required: true,
    hint: 'Jeden transekt 200 m (karta: 10×200 m); można go dostosować do terenu.',
    help: `Na każdym stanowisku wyznacza się jeden transekt długości 200 m – zwykle linia prosta, ale można go dopasować do topografii. Karta z przewodnika podaje wymiary 10×200 m (20 arów). Co 100 m wyznacza się miejsca zdjęć fitosocjologicznych: początek, środek i koniec (łącznie 3).

Gdy transektu nie da się wyznaczyć, bierze się 3 płaty blisko położonych muraw – opisz to w uwagach. Wartość wskaźników struktury i funkcji określa się na podstawie przejścia przez transekt.`,
    warn: (v) => {
      const m = String(v ?? '').replace(',', '.').match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/)
      if (!m) return null
      const a = Number(m[1]) * Number(m[2])
      const long = Math.max(Number(m[1]), Number(m[2]))
      return Math.abs(a - 2000) < 1 || long === 200 ? null : `${plNum(a)} m² – metodyka: transekt długości 200 m (karta: 10×200 m). Opisz odstępstwo w uwagach.`
    },
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    help: 'Wysokość nad poziomem morza transektu (albo zakres od początku do końca), z GPS albo mapy. Siedlisko występuje na niżu i wyżynach, na kamieńcach karpackich – w piętrze pogórza.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 06.08.2008',
    required: true,
    hint: 'Optymalnie od połowy maja do końca czerwca.',
    help: `Dzień badań terenowych. Optymalny termin: od połowy maja do końca czerwca, gdy znaczna część gatunków jest w optimum kwitnienia (terofity wiosenne: naradka, rogownice, wiosnówka). Później też można, ale trzeba liczyć się z błędną oceną pokrycia i brakiem możliwości oznaczenia niektórych gatunków. W praktyce: 2014 i 2018 – od maja do początku września, 2024 – od 1 maja do 15 lipca.

Siedlisko jest mało stabilne – badanie co najmniej raz na 5 lat, optymalnie co 3 lata. Karta z przewodnika (6.08.2008) jest poza optymalnym terminem.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const [, mm, dd] = v.split('-').map(Number)
      const inWindow = (mm === 5 && dd >= 15) || mm === 6
      return inWindow ? null : 'Termin poza optymalnym oknem (połowa maja – koniec czerwca). Pokrycie gatunków może być błędne, a część gatunków (terofity) nie do oznaczenia – opisz to w uwagach.'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
  {
    kind: 'text',
    name: 'additionalExperts',
    label: 'Dodatkowi koordynatorzy',
    placeholder: 'np. —',
    help: 'Osoby, które brały udział w badaniu poza wykonawcą (koordynatorem). Brak – zostaw puste albo wpisz „—”.',
  },
]

// ---------- zdjęcia fitosocjologiczne: 3 × 25 m² ----------

const r7120 = methodology7120.releves.fields
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', {
    help: 'Współrzędne GPS środka zdjęcia. Zdjęcia robi się co 100 m: na początku, w środku i na końcu transektu.',
  }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach.' }),
  pickField(r7120, 'area', {
    defaultValue: 25,
    help: 'Powierzchnia zdjęcia w m². W karcie z przewodnika: 25 m².',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. W karcie z przewodnika 15° (zdjęcie I); na tarasie rzecznym 0°.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, SW). Murawy napiaskowe najczęściej na zboczach S i E. Dla powierzchni płaskiej zostaw puste albo wpisz „brak”.' }),
  layerField('coverB', 'Warstwa B – krzewy i podrost: procent powierzchni zdjęcia pod krzewami i podrostem drzew (sosna, brzoza, jałowiec). Brak = 0.\n\nDlaczego: warstwa B to zarastanie – główny wróg murawy po zaprzestaniu wypasu.', { groupCols: 3 }),
  layerField('coverC', 'Warstwa C – zielna: procent powierzchni zdjęcia pokryty przez rośliny naczyniowe. W karcie z przewodnika 70–90%.\n\nDlaczego: murawy 6120 są zwarte w porównaniu z inicjalnymi murawami szczotlichowymi 2330.'),
  layerField('coverD', 'Warstwa D – mszysta: mchy (np. krótkosz białawy, płonnik) i porosty naziemne. Brak = 0.'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów i podrostu, w metrach. Brak warstwy = 0.'),
  layerField('heightC', 'Warstwa C – typowa wysokość roślin zielnych, w centymetrach (w karcie z przewodnika 20–40 cm).'),
  layerField('heightD', 'Warstwa D – typowa wysokość warstwy mszystej, w centymetrach.'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Sileno otitis-Festucetum',
    help: 'Jednostka fitosocjologiczna zdjęcia – zespół z Koelerion glaucae, np. Sileno otitis-Festucetum, Corynephoro-Silenetum tataricae, Festuco psammophilae-Koelerietum glaucae.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w poletku z ilościowością w skali Braun-Blanqueta (r, +, 1–5): warstwa B – krzewy i podrost, C – zielna, D – mszaki i porosty. Warstwa podpowiada się sama po wyborze gatunku.',
  }),
]

export const methodology6120: Methodology = {
  code: '6120',
  name: 'Ciepłolubne, śródlądowe murawy napiaskowe (Koelerion glaucae)',
  priority: true,
  source:
    'Kujawa-Pawlaczyk J. 2010, 6120 Ciepłolubne śródlądowe murawy napiaskowe, [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ, s. 106–118 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014, 2015–2018 i 2023–2025',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj 3 zdjęcia fitosocjologiczne po 25 m² co 100 m transektu: na początku, w środku i na końcu. Ilościowość w skali Braun-Blanqueta; warstwy B (krzewy i podrost), C (zielna), D (mszaki i porosty).',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Możliwości ochrony siedliska i utrzymania go w stanie niepogorszonym, przy analizie możliwych do wyobrażenia czynników realnie oddziałujących na siedlisko w najbliższej przyszłości. Pod uwagę brany jest aktualny stan ochrony (obecność na obszarze chronionym, reżim ochronny), czynniki biotyczne, abiotyczne i antropogeniczne, oddziaływanie gospodarcze i turystyka.',
    help: `Weź pod uwagę: sukcesję (nalot sosny, brzozy, osiki, jałowca), ekspansję trzcinnika i gatunków obcych (czeremcha, przymiotno, nawłoć), zarzucenie wypasu, zalesianie, zabudowę letniskową, wydobycie piasku i żwiru, inwestycje drogowe, zaoranie.

Ochrona czynna (przewodnik, pkt 5): usuwanie nalotu drzew i krzewów, karczowanie odsłaniające glebę, kontrolowany wypas lokalnymi rasami owiec, wykaszanie, kontrolowane wypalanie. Bierna ochrona wystarcza tylko w dolinach naturalnych rzek, gdzie rzeka podmywa zbocza i odnawia siedlisko.

Praktyka 2024: FV 19% (zwykle wypasane, rzadziej koszone), U1 44%, U2 37%; pogorszenie po zaniechaniu wypasu (Kózki I i II) i mechanicznym niszczeniu.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A01', name: 'Uprawa' },
    { code: 'A02.01', name: 'Intensyfikacja rolnictwa' },
    { code: 'A03', name: 'Koszenie / ścinanie trawy' },
    { code: 'A03.03', name: 'Zaniechanie / brak koszenia' },
    { code: 'A04', name: 'Wypas' },
    { code: 'A04.02', name: 'Wypas nieintensywny' },
    { code: 'A04.03', name: 'Zarzucenie pasterstwa, brak wypasu' },
    { code: 'B01', name: 'Zalesianie terenów otwartych' },
    { code: 'B01.01', name: 'Zalesianie terenów otwartych (drzewa rodzime)' },
    { code: 'B01.02', name: 'Sztuczne nasadzenia na terenach otwartych (drzewa nierodzime)' },
    { code: 'B02.02', name: 'Wycinka lasu' },
    { code: 'B02.03', name: 'Usuwanie podszytu' },
    { code: 'C01.01', name: 'Wydobywanie piasku i żwiru' },
    { code: 'D01', name: 'Drogi, ścieżki i drogi kolejowe' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D01.02', name: 'Drogi, autostrady' },
    { code: 'E01', name: 'Tereny zurbanizowane, tereny zamieszkane' },
    { code: 'E01.03', name: 'Zabudowa rozproszona' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'G01', name: 'Sporty i różne formy czynnego wypoczynku, uprawiane w plenerze' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
    { code: 'G04.01', name: 'Poligony' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'G05.07', name: 'Niewłaściwie realizowane działania ochronne lub ich brak' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J01.01', name: 'Wypalanie' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód, ogólnie' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.02', name: 'Nagromadzenie materii organicznej' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'U', name: 'Nieznane zagrożenie lub nacisk' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: [
    ...methodology7120.otherFields.flatMap((f): FieldDef[] => {
      if (f.name === 'otherValues')
        return [
          {
            ...f,
            hint: 'Np. starorzecza, łąki wilgotne, sąsiedztwo 2330, 6210, 91I0.',
            help: 'Wartości przyrodnicze stanowiska poza samą murawą: sąsiednie siedliska (2330 wydmy z murawami szczotlichowymi, 6210 murawy kserotermiczne, 6510 łąki świeże, 91I0 ciepłolubne dąbrowy, starorzecza), rzadkie i chronione gatunki roślin (np. goździk piaskowy, lepnica litewska, kostrzewa poleska), owady piaskolubne. Brak informacji – „Nie stwierdzono” albo „Nie pozyskano danych”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            label: 'Wykonywane działania ochronne',
            help: 'Jakie działania ochronne wykonano i z jakim skutkiem: odkrzaczanie, usuwanie nalotu sosny, karczowanie, wypas (owce, kozy, bydło, konie), koszenie, usuwanie gatunków obcych. Brak działań – „Brak”.',
          },
          {
            kind: 'textarea',
            name: 'proposals',
            label: 'Propozycje wprowadzenia działań ochronnych',
            rows: 4,
            hint: 'Np. przywrócenie wypasu, dalsze usuwanie nalotu drzew.',
            help: 'Jakie działania proponujesz, konkretnie: przywrócenie albo utrzymanie ekstensywnego wypasu (owce wrzosówki, kozy), usuwanie nalotu i okresowe odkrzaczanie, karczowanie z odsłonięciem gleby, koszenie z usunięciem biomasy, usuwanie czeremchy i robinii, zaprzestanie zalesiania. Brak – „Brak”.',
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
            help: 'Karta z przewodnika podaje przy ocenie ogólnej udział procentowy powierzchni siedliska o różnym stanie zachowania na całym stanowisku (Kalinik: FV 80%, U1 20%, U2 –). Trzy liczby powinny dać razem 100%.',
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
          f,
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_6120.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer6120(s) })),
  speciesInfo: (name) => {
    const e = findSpecies6120(name)
    if (!e) return undefined
    if (e.group === 'expansive' && !e.tab1) return `${GROUP_LABELS_6120.expansive} (sprawozdania 2018–2024)`
    if (e.group === 'alien' && e.weak) return `${GROUP_LABELS_6120.alien} (archeofit lub chwast, bez tendencji do inwazji)`
    return GROUP_LABELS_6120[e.group]
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator6120 = (id: string): IndicatorDef => {
  const i = methodology6120.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 6120`)
  return i
}
