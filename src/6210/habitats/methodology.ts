// Metodyka 6210 (murawy kserotermiczne Festuco-Brometea) jako dane. Źródło: Mróz W., Bąba W. 2010, „6210 Murawy
// kserotermiczne (Festuco-Brometea)” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny,
// cz. I, GIOŚ, s. 119–129 (tab. 1 i 2, karta Radomice 2008) z MODYFIKACJĄ GIOŚ z 27.05.2022 (nowe progi „Gatunków
// charakterystycznych”: ≥6 FV, 2–5 U1, ≤1 U2) i praktyką oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014
// i 2020–2021. Modyfikacja 2022 ma pierwszeństwo – to ona liczy podpowiedź; progi z 2010 r. tylko w wyjaśnieniu.
// Siedlisko nieleśne, półnaturalne (wypas, koszenie): jeden transekt 200 m, 3 zdjęcia fitosocjologiczne co 100 m.
// Kardynalne (lista pod tab. 2): gatunki charakterystyczne, rodzime ekspansywne, ekspansja krzewów. Obce i storczykowate
// – niekardynalne. Struktura i ocena ogólna regułą ogólną silnika (tab. 2 mówi dokładnie to samo).
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_6210,
  SPECIES_6210,
  SUBTYPE_LABELS_6210,
  defaultLayer6210,
  findSpecies6210,
  isAlien6210,
  isCharacteristic6210,
  isExpansive6210,
  isOrchid6210,
  isTypical6210,
  isWeakAlien6210,
  isWoody6210,
  isWoodyAlien6210,
  speciesKey6210,
  type Subtype6210,
} from './species'

// ---------- progi liczbowe (tab. 2 + modyfikacja 2022) ----------

/** Gatunki charakterystyczne wg modyfikacji GIOŚ z 27.05.2022: co najmniej 6 FV, 2–5 U1, maksymalnie 1 U2. */
export const gradeCharacteristic6210 = (n: number): Grade => (n >= 6 ? 'FV' : n >= 2 ? 'U1' : 'U2')

/**
 * Gatunki charakterystyczne wg pierwotnej tab. 2 (2010): „co najmniej pięć” FV, „co najmniej 2 do 5” U1, jeden lub brak U2.
 * 5 należy do FV. Już nieobowiązujące – tylko do porównania (karta Radomice 2008: 5 gatunków, FV).
 */
export const gradeCharacteristic2010_6210 = (n: number): Grade => (n >= 5 ? 'FV' : n >= 2 ? 'U1' : 'U2')

/** Ekspansja krzewów i podrostu drzew: poniżej 10% FV, 10–25% U1 (obie granice), powyżej 25% U2. */
export const gradeShrubs6210 = (p: number): Grade => (p < 10 ? 'FV' : p <= 25 ? 'U1' : 'U2')

/**
 * Obce gatunki inwazyjne: brak FV; pojedynczo, do 5% powierzchni (do 2 gatunków) U1; licznie, powyżej 5% (więcej niż
 * 2 gatunki) U2. U2 = ponad 5% ALBO ponad 2 gatunki (sprawozdanie 2021: „występowały więcej niż 2 gatunki”, „areał do
 * kilkunastu procent”). Równo 5% to U1.
 */
export function gradeAliens6210(count: number, cover?: number): Grade {
  if (count <= 0) return 'FV'
  if (count > 2) return 'U2'
  return cover !== undefined && cover > 5 ? 'U2' : 'U1'
}

export type Occurrence = 'single' | 'scattered' | 'patches'

/**
 * Rodzime gatunki ekspansywne (tab. 2): brak, ewentualnie 1 gatunek pojedynczo FV; 1–2 gatunki w rozproszeniu U1;
 * powyżej 2 gatunków w zwartych płatach U2. Do tego tab. 1: ilościowość w zdjęciu „powyżej 4” (czyli 5) = U2.
 */
export function gradeExpansive6210(count: number, occurrence?: Occurrence | '', maxAbundance?: string): Grade {
  const byCount: Grade = count <= 0 ? 'FV' : count > 2 ? 'U2' : count === 1 && occurrence === 'single' ? 'FV' : 'U1'
  return maxAbundance === '5' ? 'U2' : byCount
}

/** Storczykowate: „powyżej 3” FV (praktyka 2013–2021: 3 gatunki to już FV), 1–2 U1, brak U2. */
export const gradeOrchids6210 = (n: number): Grade => (n >= 3 ? 'FV' : n >= 1 ? 'U1' : 'U2')

const pct = (v: number) => `${plNum(v)}%`
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey6210(n), n])).values()]
const sumCover = (v: unknown): number | undefined => {
  const covers = speciesRows(v)
    .filter((r) => r.name?.trim())
    .map((r) => num(r.cover))
    .filter((c): c is number => c !== undefined)
  return covers.length ? Math.round(covers.reduce((a, b) => a + b, 0) * 10) / 10 : undefined
}
const subtypeOf = (ctx?: IndicatorContext): Subtype6210 | undefined => {
  const s = ctx?.site?.subtype
  return s === '6210-1' || s === '6210-2' || s === '6210-3' ? s : undefined
}

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'other', label: 'Inne kombinacje (np. powolny ubytek powierzchni przez zarastanie)', grade: 'U1' },
  { value: 'clearDecrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania (pierwsze badanie, brak wcześniejszej powierzchni)', grade: 'XX' },
]
const OCCURRENCE: { value: Occurrence | ''; label: string }[] = [
  { value: '', label: '—' },
  { value: 'single', label: 'Pojedynczo' },
  { value: 'scattered', label: 'W rozproszeniu' },
  { value: 'patches', label: 'Zwarte płaty' },
]
const ABUNDANCE = [
  { value: '', label: '—' },
  { value: 'r', label: 'r' },
  { value: '+', label: '+' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5 (pokrycie 75–100%)' },
]
const ORCHID_STATUS = [
  { value: '', label: '—' },
  { value: 'lateTerm', label: 'Termin nie pozwalał stwierdzić storczykowatych' },
]
const ECOTONE: GradedOption[] = [
  { value: 'gradual', label: 'Murawy przechodzą stopniowo w inne naturalne i półnaturalne zbiorowiska roślinne (zarośla, łąki, okrajki)', grade: 'FV' },
  { value: 'partialAnthropogenic', label: 'Murawa częściowo graniczy ze zbiorowiskami antropogenicznymi (pola, zabudowa, drogi)', grade: 'U1' },
  { value: 'noGradual', label: 'Brak stopniowego przejścia do innych zbiorowisk naturalnych i półnaturalnych (np. ostra granica z lasem, ekoton słabo rozwinięty)', grade: 'U1' },
  { value: 'sharpAnthropogenic', label: 'Ostra granica między murawami i zbiorowiskami antropogenicznymi (głównie pola orne), wyznaczona zasięgiem działalności człowieka (np. orki)', grade: 'U2' },
  { value: 'unknown', label: 'Nie da się ocenić (np. płaty na półkach skalnych w kamieniołomie)', grade: 'XX' },
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

/** Gatunki charakterystyczne z katalogu na liście (synonimy jako jeden gatunek). */
const characteristicOnList = (i: InputValues) => distinct(rowNames(i.species).filter(isCharacteristic6210))

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

/** Liczba storczykowatych: wpisana wprost > lista > „nie stwierdzono” (0). */
function orchidCount(i: InputValues): number | undefined {
  return countOf(i)
}

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description: 'Zmiana powierzchni płatów muraw na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury.',
    help: `Co wybrać: jak zmieniła się powierzchnia muraw kserotermicznych na stanowisku od poprzedniego badania (albo względem literatury, ortofotomap). Powierzchnię w hektarach możesz wpisać obok – trafi do pola „wartość”.

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; inne kombinacje – U1; wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub literaturą – U2. Przy pierwszym badaniu albo bez wcześniejszej powierzchni liczbowej wybierz „Brak danych do porównania” (XX) – tak oceniono 9 stanowisk w 2021 r. Karta z przewodnika (Radomice) daje U1: „tendencja do zmniejszania się wskutek zwiększającego się pokrycia drzew i krzewów, tempo zmian nie jest jednak zbyt duże”.

Dlaczego: murawy zjada sukcesja (tarnina, dereń, głóg, róża, sosna), zalesianie i zaoranie. Sprawozdanie 2021: powierzchnia od 0,001 ha do 14 ha, najczęściej 0,5–3 ha; pogorszenie na ok. 24% powtarzanych stanowisk (zarastanie), poprawa głównie po odkrzaczaniu (Głogi: z kilkunastu arów do 3,2 ha).`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się',
      U1: 'Inne kombinacje',
      U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze',
    },
    inputs: [
      optionalSelect('Zmiana powierzchni', AREA, 'Puste, gdy oceniasz ekspercko.'),
      { kind: 'number', name: 'areaHa', label: 'Powierzchnia (opcjonalnie)', unit: 'ha', min: 0, help: 'Powierzchnia płatów siedliska na stanowisku, jeśli ją znasz – trafi do pola „wartość”. Podaj ją liczbowo: bez niej następny wykonawca da XX („nie można było ocenić zachodzących zmian”, 2021).' },
      noteInput('Opis (opcjonalnie)', 'np. powierzchnia zmniejsza się wskutek zarastania tarniną', 'Krótki opis zmian, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
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
      'Liczba gatunków roślin naczyniowych charakterystycznych dla muraw kserotermicznych (gatunki strukturotwórcze, gatunki podtypu z tab. 1 i pozostałe gatunki charakterystyczne klasy Festuco-Brometea) stwierdzonych na transekcie, z udziałem procentowym każdego gatunku (z dokładnością do 10%).',
    help: `Co wpisać: gatunki charakterystyczne stwierdzone na transekcie, z pokryciem. Formularz sam policzy te, które w katalogu są oznaczone jako charakterystyczne dla Festuco-Brometea (synonimy jako jeden gatunek). Lista w 6210 jest otwarta („pozostałe gatunki charakterystyczne dla klasy”) – jeśli liczysz inaczej, wpisz liczbę wprost, ma pierwszeństwo.

Co się liczy (tab. 1): gatunki strukturotwórcze – kostrzewy (blada, bruzdkowana, walezyjska), ostnice, turzyce (niska, ptasie łapki, delikatna, Michela), strzęplice (nadobna, piramidalna); gatunki podtypu: 6210-1 naskalne (kostrzewa blada, rojownik, czosnek skalny, perłówki, macierzanka wczesna, ożanka pierzastosieczna, goździk kartuzek, czyściec prosty, chaber nadreński…), 6210-2 ostnicowe (ostnice, gęsiówka uszkowata, stulisz miotłowy, smagliczka, pięciornik piaskowy, łyszczec, ostrołódka, pajęcznica liliowata…), 6210-3 kwietne (aster gawędka, ostrożeń pannoński, oman wąskolistny, kosaciec bezlistny, lny, dziewięćsił popłocholistny, miłek, wężymord stepowy…); i pozostałe gatunki klasy (chaber driakiewnik, kłosownica pierzasta, turzyca sina, dziewięćsił bezłodygowy, goryczka krzyżowa, biedrzeniec mniejszy, wilczomlecz sosnka, babka średnia, szałwia łąkowa, wiązówka bulwkowa…).

Czego nie liczyć: gatunków okrajków i łąk z pkt 4 przewodnika (lebiodka, klinopodium, rzepik, oman szlachtawa, przytulia północna) – w 2021 r. nazwano je „gatunkami wyróżniającymi” i pominięto; formularz pokaże je w ostrzeżeniu.

Progi (modyfikacja GIOŚ z 27.05.2022, obowiązuje): co najmniej 6 – FV; 2–5 – U1; maksymalnie 1 – U2. Wcześniej (tab. 2 z 2010 r.): co najmniej 5 – FV. Wyjaśnienie pod polami pokazuje obie wersje.

Wskaźnik kardynalny. Sprawozdanie 2021: najlepiej oceniany wskaźnik (76% FV, na najlepszych murawach kilkanaście do ponad 20 gatunków); U2 dostawały głównie płaty, które nie były 6210, tylko murawami napiaskowymi (6120) albo pannońskimi (6190) z pojedynczymi gatunkami Festuco-Brometea – wtedy zastanów się, czy to właściwe siedlisko.`,
    thresholds: {
      FV: 'Co najmniej 6 gatunków charakterystycznych (modyfikacja 2022; wcześniej co najmniej 5)',
      U1: '2–5 gatunków charakterystycznych',
      U2: 'Maksymalnie 1 gatunek charakterystyczny',
    },
    inputs: [
      speciesInput('Gatunki charakterystyczne na transekcie', 'Gatunki charakterystyczne stwierdzone na transekcie, z pokryciem w % (z dokładnością do 10%; dla „<1%” wpisz 0,5). Liczą się gatunki Festuco-Brometea z katalogu – inne formularz pokaże w ostrzeżeniu.'),
      { kind: 'number', name: 'count', label: 'Liczba gatunków (opcjonalnie)', min: 0, help: 'Liczba gatunków charakterystycznych wpisana wprost. Ma pierwszeństwo przed liczeniem z listy – użyj, gdy liczysz inaczej niż formularz (np. z gatunkami spoza katalogu).' },
      NONE_FIELD('Brak gatunków charakterystycznych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma żadnego gatunku charakterystycznego – wtedy wskaźnik to U2 (i pytanie, czy to w ogóle 6210).'),
      noteInput('Opis (opcjonalnie)', 'np. chaber driakiewnik Centaurea scabiosa 25%, kłosownica…', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = characteristicCount(i)
      return c ? gradeCharacteristic6210(c.n) : null
    },
    explain: (i, ctx) => {
      const c = characteristicCount(i)
      if (!c) return null
      const onList = characteristicOnList(i)
      const sub = subtypeOf(ctx)
      const ofSubtype = sub ? onList.filter((n) => findSpecies6210(n)?.subtypes?.includes(sub)).length : undefined
      const head = c.from === 'count' ? `Liczba wpisana wprost: ${plNum(c.n)}. Z katalogu rozpoznano: ${onList.length}.` : `Gatunków charakterystycznych Festuco-Brometea na liście: ${onList.length}.`
      const subPart = sub && ofSubtype !== undefined ? ` W tym z listy podtypu ${sub} (tab. 1): ${ofSubtype}.` : ''
      const old = gradeCharacteristic2010_6210(c.n)
      const tail = old !== gradeCharacteristic6210(c.n) ? ` Wg progów sprzed modyfikacji 2022 (≥5 FV) byłoby ${old}.` : ''
      return head + subPart + tail
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (i.none === 'yes' && names.some(isCharacteristic6210)) return 'Zaznaczono „Nie stwierdzono”, a na liście są gatunki charakterystyczne.'
      const typical = distinct(names.filter(isTypical6210))
      const other = distinct(names.filter((n) => !isCharacteristic6210(n) && !isTypical6210(n)))
      const c = num(i.count)
      const onList = characteristicOnList(i).length
      const parts: string[] = []
      if (typical.length) parts.push(`Gatunki wyróżniające z okrajków i łąk (pkt 4): ${typical.join(', ')} – w 2021 r. ich nie liczono, formularz też nie.`)
      if (other.length) parts.push(`Spoza katalogu gatunków charakterystycznych: ${other.join(', ')} – formularz ich nie liczy; jeśli to gatunki Festuco-Brometea, wpisz liczbę wprost.`)
      if (c !== undefined && names.length && gradeCharacteristic6210(c) !== gradeCharacteristic6210(onList))
        parts.push(`Wg katalogu byłoby ${onList} (${gradeCharacteristic6210(onList)}), a wpisano ${plNum(c)} (${gradeCharacteristic6210(c)}).`)
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
    description:
      'Lista inwazyjnych gatunków obcych geograficznie stwierdzonych na transekcie, z udziałem procentowym powierzchni zajętej przez każdy gatunek (z dokładnością do 10%). Optymalnie – brak obcych gatunków inwazyjnych.',
    help: `Co wpisać: gatunki obce z pokryciem transektu w procentach. Liczba gatunków i pokrycie liczą się z listy; łączne pokrycie albo liczbę gatunków możesz wpisać wprost (mają pierwszeństwo). Brak – zaznacz „Nie stwierdzono”. Obce drzewa i krzewy (robinia, klon jesionolistny, czeremcha amerykańska, bez lilak, orzech włoski) wpisz tu i dolicz do pokrycia w „Ekspansji krzewów”.

Najczęstsze (sprawozdanie 2021, tab. 4): przymiotno białe Erigeron annuus i kanadyjskie Conyza canadensis (po ok. 30 stanowisk), nawłoć późna i kanadyjska (po ok. 20), robinia akacjowa, klon jesionolistny, bez lilak, czeremcha amerykańska, orzech włoski.

Progi (tab. 2): brak – FV; pojedynczo, nie więcej niż 5% powierzchni (do 2 gatunków) – U1; licznie, powyżej 5% powierzchni (więcej niż 2 gatunki) – U2. Formularz liczy U2, gdy pokrycie przekracza 5% albo gatunków jest więcej niż dwa. Równo 5% to jeszcze U1.

Wskaźnik NIEKARDYNALNY (lista pod tab. 2) – sam nie obniży struktury poniżej U1. Uwaga: w 2013–2014 pojedyncze obce do 1% pokrycia dawały FV; w 2021 r. oceniano ściśle (każdy obcy gatunek = co najmniej U1), a sprawozdanie zauważa, że pojedyncze osobniki powinny raczej obniżać perspektywy ochrony. Tab. 4 z 2021 r. zawiera też archeofity i chwasty pól (fiołek polny, ostróżeczka, tasznik, sałata kompasowa…) – „tylko część z nich ma charakter inwazyjnych”; formularz ostrzega przy takich.`,
    thresholds: {
      FV: 'Brak',
      U1: 'Gatunki inwazyjne występują pojedynczo i nie zajmują więcej niż 5% powierzchni (do 2 gatunków)',
      U2: 'Gatunki inwazyjne występują licznie, zajmując powyżej 5% powierzchni (więcej niż 2 gatunki)',
    },
    inputs: [
      speciesInput('Obce gatunki na transekcie', 'Gatunki obce z pokryciem transektu w %, np. Solidago canadensis 3. Brak – pusta lista i „Nie stwierdzono”.'),
      { kind: 'number', name: 'count', label: 'Liczba gatunków (opcjonalnie)', min: 0, help: 'Liczba gatunków obcych wpisana wprost. Ma pierwszeństwo przed liczeniem z listy.' },
      { kind: 'number', name: 'total', label: 'Łączne pokrycie (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Łączne pokrycie gatunków obcych wpisane wprost. Ma pierwszeństwo przed sumą z listy. Do 5% (przy 1–2 gatunkach) to U1, więcej – U2.' },
      NONE_FIELD('Brak gatunków obcych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków obcych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const n = countOf(i)
      return n === undefined ? null : gradeAliens6210(n, coverOf(i))
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
      const native = distinct(names.filter((n) => findSpecies6210(n) && !isAlien6210(n)))
      if (native.length) parts.push(`Na liście gatunków obcych są gatunki rodzime: ${native.join(', ')}.`)
      const weak = distinct(names.filter(isWeakAlien6210))
      if (weak.length) parts.push(`Archeofity, rośliny uprawne lub chwasty bez tendencji do inwazji: ${weak.join(', ')} – sprawozdanie 2021: „tylko część z nich ma charakter inwazyjnych”. Sprawdź, czy chcesz je liczyć.`)
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
      'Rodzime gatunki roślin zielnych, które w dużym zwarciu wypierają inne gatunki (szczególnie kłosownica pierzasta, trzcinnik piaskowy, perz, jeżyny), z udziałem procentowym każdego gatunku na transekcie. Optymalnie – brak.',
    help: `Co wpisać: rodzime gatunki ekspansywne stwierdzone na transekcie, z pokryciem, i wybierz, jak występują (pojedynczo, w rozproszeniu, zwarte płaty). Dopisz najwyższą ilościowość gatunku ekspansywnego w zdjęciach fitosocjologicznych. Brak – zaznacz „Nie stwierdzono”. Gatunków obcych (nawłocie) tu nie wpisuj.

Gatunki: tab. 1 – kłosownica pierzasta Brachypodium pinnatum („szczególnie”), trzcinnik piaskowy, perz Elymus spp., jeżyny Rubus. W 2013–2021 jako ekspansywne podawano też: rajgras wyniosły, stokłosę bezostną, pokrzywę, orlicę, trzęślicę modrą, bylicę pospolitą, podagrycznik, świerząbek korzenny, ostrożeń polny, trybulę leśną, ciemiężyk. Kłosownica, perz siny i pajęcznica gałęzista to zarazem gatunki typowe muraw (sprawozdanie 2021) – licz je tu dopiero przy nadmiernym pokryciu.

Progi (tab. 2): brak, ewentualnie 1 gatunek występujący pojedynczo – FV; obecne 1–2 gatunki w rozproszeniu – U1; powyżej 2 gatunków tworzących zwarte płaty – U2. Do tego tab. 1: obecność w zdjęciach „ze stopniem ilościowości powyżej 4” traktowana jest jako stan zły – ilościowość 5 w którymkolwiek zdjęciu daje U2. Tab. 2 nie przewiduje 1–2 gatunków w zwartych płatach – formularz daje U1 z ostrzeżeniem (Mały Grojec 2013: kłosownica do 50% pokrycia – U2).

Wskaźnik kardynalny. Sprawozdanie 2021 (region kontynentalny: 32% FV, 40% U1, 28% U2): FV dawano też przy „najwyżej 1–2 gatunkach o niewielkim pokryciu – do 5%” – to łagodniej niż tab. 2; formularz liczy wg tab. 2 i o tym przypomina.`,
    thresholds: {
      FV: 'Brak, ewentualnie 1 gatunek występujący pojedynczo',
      U1: 'Obecne 1–2 gatunki, występujące w rozproszeniu',
      U2: 'Powyżej 2 gatunków, tworzących zwarte płaty; ilościowość w zdjęciu powyżej 4 (tab. 1)',
    },
    inputs: [
      speciesInput('Gatunki ekspansywne na transekcie', 'Rodzime gatunki ekspansywne z pokryciem transektu w %, np. Brachypodium pinnatum 30, Calamagrostis epigejos 5.'),
      { kind: 'number', name: 'count', label: 'Liczba gatunków (opcjonalnie)', min: 0, help: 'Liczba gatunków ekspansywnych wpisana wprost. Ma pierwszeństwo przed liczeniem z listy.' },
      { kind: 'select', name: 'occurrence', label: 'Jak występują', options: OCCURRENCE, help: 'Forma występowania gatunków ekspansywnych: pojedynczo (pojedyncze osobniki), w rozproszeniu (rozproszone kępy) albo zwarte płaty. Przy jednym gatunku „pojedynczo” daje FV.' },
      { kind: 'select', name: 'maxAbundance', label: 'Najwyższa ilościowość w zdjęciach', options: ABUNDANCE, help: 'Najwyższy stopień ilościowości (Braun-Blanquet) gatunku ekspansywnego w którymkolwiek z 3 zdjęć fitosocjologicznych. Tab. 1: „powyżej 4” (czyli 5, pokrycie ponad 75%) = stan zły U2.' },
      NONE_FIELD('Brak gatunków ekspansywnych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków ekspansywnych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. rajgras wyniosły Arrhenatherum elatius 3%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const n = countOf(i)
      if (n === undefined) return i.maxAbundance === '5' ? 'U2' : null
      return gradeExpansive6210(n, i.occurrence as Occurrence | '', String(i.maxAbundance ?? ''))
    },
    explain: (i) => {
      const n = countOf(i)
      const parts: string[] = []
      if (n) {
        const t = coverOf(i)
        parts.push(`Gatunków ekspansywnych: ${n}${t !== undefined ? `, łączne pokrycie ${pct(t)}` : ''}.`)
        if (n === 1 && !i.occurrence) parts.push('Jeden gatunek – FV tylko, gdy występuje pojedynczo (wybierz „Jak występują”).')
      }
      if (i.maxAbundance === '5') parts.push('Ilościowość 5 w zdjęciu – tab. 1: stan zły (U2).')
      return parts.length ? parts.join(' ') : null
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (i.none === 'yes' && names.length) return 'Zaznaczono „Nie stwierdzono”, a lista nie jest pusta.'
      const parts: string[] = []
      const n = countOf(i) ?? 0
      if (n > 0 && n <= 2 && i.occurrence === 'patches' && i.maxAbundance !== '5')
        parts.push('Tab. 2 nie przewiduje 1–2 gatunków w zwartych płatach (formularz: U1). Zwarta kłosownica na pół transektu bywała oceniana na U2 – oceń ekspercko.')
      if (n > 2 && i.occurrence && i.occurrence !== 'patches') parts.push('Ponad dwa gatunki, ale nie w zwartych płatach – tab. 2 wiąże U2 ze zwartymi płatami; oceń ekspercko.')
      const t = coverOf(i)
      if (n > 0 && n <= 2 && t !== undefined && t <= 5 && i.occurrence !== 'single')
        parts.push('W 2021 r. 1–2 gatunki o pokryciu do 5% oceniano też na FV – formularz liczy wg tab. 2 (U1).')
      const typical = distinct(names.filter((x) => isCharacteristic6210(x) && isExpansive6210(x)))
      if (typical.length) parts.push(`${typical.join(', ')} – gatunek typowy muraw (sprawozdanie 2021); licz go tu tylko przy nadmiernym pokryciu.`)
      const aliens = distinct(names.filter(isAlien6210))
      if (aliens.length) parts.push(`Gatunki obce wpisz we wskaźniku „Obce gatunki inwazyjne”: ${aliens.join(', ')}.`)
      const odd = distinct(names.filter((x) => findSpecies6210(x) && !isExpansive6210(x) && !isAlien6210(x)))
      if (odd.length) parts.push(`Na liście są gatunki spoza grupy ekspansywnych: ${odd.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      if (!list && i.none === 'yes') return 'nie stwierdzono'
      const occ = OCCURRENCE.find((o) => o.value === i.occurrence && o.value)?.label.toLowerCase()
      return [list, occ ?? '', i.maxAbundance ? `ilościowość w zdjęciach do ${i.maxAbundance}` : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'shrubs',
    label: 'Ekspansja krzewów i podrostu drzew',
    parameter: 'structure',
    cardinal: true,
    description:
      'Sumaryczne pokrycie wszystkich ekspansywnych gatunków krzewów i drzew na transekcie (z dokładnością do 10%), z listą gatunków. Obecność krzewów i odrośli drzew to najlepszy wskaźnik zaawansowania sukcesji wtórnej.',
    help: `Co wpisać: łączne pokrycie krzewów i podrostu drzew na transekcie w procentach (rzut koron), a obok listę gatunków z pokryciem. Obce drzewa i krzewy (robinia, klon jesionolistny, czeremcha amerykańska, grusza) wlicz do pokrycia i dodatkowo wpisz w „Obcych gatunkach inwazyjnych”.

Gatunki (sprawozdania 2013–2021): dereń świdwa, róża dzika, śliwa tarnina, głogi, sosna, jałowiec, kruszyna, szakłak, berberys, irga, kalina; z drzew klony, dęby, topole, brzoza.

Progi (tab. 2): brak lub niewielkie pokrycie poniżej 10%, występujące sporadycznie – FV; od 10 do 25%, krzewy nie tworzą zwartych zarośli, w rozproszeniu – U1; powyżej 25%, zwarte zarośla w skupieniach – U2. Obie granice (10 i 25%) formularz liczy do U1 (karta Radomice: zwarcie krzewów 10% – U1).

Wskaźnik kardynalny. Dlaczego: bez wypasu i koszenia kwietne murawy w 25–30 lat przechodzą w ubogie zarośla. 2021: pokrycie od pojedynczych osobników do 80%, często nierównomierne (zwarte płaty zarośli i pojedyncze krzewy na reszcie transektu). Krzewy wyłącznie w otoczeniu murawy nie obniżają oceny (2013–2014).`,
    thresholds: {
      FV: 'Brak lub niewielkie pokrycie drzew i krzewów poniżej 10% powierzchni, występujących sporadycznie',
      U1: 'Pokrycie drzew i krzewów od 10 do 25% powierzchni (krzewy nie tworzą zwartych zarośli), występujących w rozproszeniu',
      U2: 'Pokrycie drzew i krzewów powyżej 25% powierzchni (tworzą zwarte zarośla), występujących w skupieniach',
    },
    inputs: [
      { kind: 'number', name: 'value', label: 'Pokrycie krzewów i podrostu drzew', unit: '%', min: 0, max: 100, required: true, help: 'Sumaryczne pokrycie krzewów i podrostu drzew na transekcie (w obrębie murawy), w procentach. Brak = 0.' },
      speciesInput('Gatunki krzewów i drzew (opcjonalnie)', 'Gatunki tworzące zakrzewienie i podrost na transekcie, np. Prunus spinosa 2, Rosa canina 5, Crataegus monogyna 2. Pokrycie poszczególnych gatunków opcjonalne.'),
      noteInput('Opis (opcjonalnie)', 'np. zwarcie warstwy krzewów 10%, głównie tarnina', 'Krótki opis, który trafi do „wartości” w karcie zamiast procentu i listy.'),
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v !== undefined ? gradeShrubs6210(v) : null
    },
    warn: (i) => {
      const v = num(i.value)
      const sum = sumCover(i.species)
      const parts: string[] = []
      if (v !== undefined && sum !== undefined && sum > v + 0.05) parts.push(`Suma pokryć gatunków (${pct(sum)}) jest większa niż pokrycie łączne (${pct(v)}) – korony mogą się nakładać, ale sprawdź.`)
      const herbs = distinct(rowNames(i.species).filter((n) => findSpecies6210(n) && !isWoody6210(n) && !isWoodyAlien6210(n)))
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
    id: 'orchids',
    label: 'Liczba gatunków storczykowatych',
    parameter: 'structure',
    description:
      'Liczba i lista gatunków storczykowatych na stanowisku. Istotne stanowiska storczyków to warunek uznania muraw za priorytetowe (*6210) wg dyrektywy siedliskowej; w Polsce storczykowate występują w murawach rzadko (głównie na południowym wschodzie).',
    help: `Co wpisać: gatunki storczykowatych stwierdzone na stanowisku (pokrycie niepotrzebne). Brak – zaznacz „Nie stwierdzono”. Jeśli termin badania nie pozwalał ich zobaczyć (przekwitły, nie wypuściły pędów), wybierz to w polu „Uwagi do oceny” – przy braku stwierdzeń formularz da XX, tak jak w 2021 r. na 29 stanowiskach.

Gatunki notowane w monitoringu: storczyk blady, męski, kukawka, purpurowy, drobnokwiatowy; dwulistnik muszy; obuwik; podkolan biały i zielonawy; listera jajowata; kruszczyki; buławniki; gółka długoostrogowa. Kalina Lisiniec – rekord, 7–9 gatunków.

Progi (tab. 2): powyżej 3 gatunków – FV; 1–2 gatunki – U1; brak – U2. Tab. 2 nie mówi, co z dokładnie 3 – w 2021 r. 3 gatunki (Góra Matyska 3 i 4) dawały FV („od 3 do 7” na stanowiskach FV), więc formularz liczy 3 do FV.

Wskaźnik niekardynalny, ale U2 odbiera strukturze ocenę FV (reguła: „pozostałe przynajmniej U1”). Sprawozdanie 2021 uważa, że wskaźnik powinien służyć tylko ustaleniu priorytetowości, bo murawy naskalne i murawy na północnym wschodzie z natury nie mają storczyków (75% ocen obniżonych) – propozycji nie wprowadzono, formularz liczy wg tab. 2 i ostrzega przy podtypie 6210-1.`,
    thresholds: { FV: 'Występuje powyżej 3 gatunków (praktyka: 3 i więcej)', U1: '1–2 gatunki', U2: 'Brak' },
    inputs: [
      speciesInput('Gatunki storczykowatych', 'Gatunki storczykowatych stwierdzone na stanowisku, np. Listera ovata, Epipactis helleborine. Pokrycie niepotrzebne.'),
      { kind: 'number', name: 'count', label: 'Liczba gatunków (opcjonalnie)', min: 0, help: 'Liczba gatunków storczykowatych wpisana wprost. Ma pierwszeństwo przed liczeniem z listy.' },
      NONE_FIELD('Brak storczykowatych', 'Zaznacz „Nie stwierdzono”, gdy na stanowisku nie ma storczykowatych – wtedy wskaźnik to U2 (albo XX, gdy termin nie pozwalał ich stwierdzić).'),
      { kind: 'select', name: 'status', label: 'Uwagi do oceny', options: ORCHID_STATUS, help: 'Wybierz, gdy termin badania nie pozwalał stwierdzić storczykowatych (np. badanie w sierpniu, rok bez pędów nadziemnych). Przy braku stwierdzeń daje XX zamiast U2.' },
      noteInput('Opis (opcjonalnie)', 'np. 2 gatunki: Listera ovata, Epipactis helleborine', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const n = orchidCount(i)
      if (n === undefined) return i.status === 'lateTerm' ? 'XX' : null
      return n === 0 && i.status === 'lateTerm' ? 'XX' : gradeOrchids6210(n)
    },
    explain: (i) => {
      const n = orchidCount(i)
      if (n === undefined) return null
      if (n === 0 && i.status === 'lateTerm') return 'Brak stwierdzeń, ale termin nie pozwalał ich stwierdzić – XX (praktyka 2021).'
      return n === 3 ? 'Gatunków storczykowatych: 3 – tab. 2 mówi „powyżej 3”, praktyka 2021 liczy 3 do FV.' : `Gatunków storczykowatych: ${n}.`
    },
    warn: (i, ctx) => {
      const names = rowNames(i.species)
      if (i.none === 'yes' && names.length) return 'Zaznaczono „Nie stwierdzono”, a lista nie jest pusta.'
      const parts: string[] = []
      const odd = distinct(names.filter((n) => findSpecies6210(n) && !isOrchid6210(n)))
      if (odd.length) parts.push(`Na liście są gatunki spoza storczykowatych: ${odd.join(', ')}.`)
      if (orchidCount(i) === 0 && i.status !== 'lateTerm' && subtypeOf(ctx) === '6210-1')
        parts.push('Murawy naskalne z natury rzadko mają storczyki – sprawozdanie 2021: ich brak nie powinien obniżać oceny struktury. Formularz liczy wg tab. 2 (U2); oceń ekspercko.')
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const names = distinct(rowNames(i.species))
      if (!names.length && i.none === 'yes') return i.status === 'lateTerm' ? 'nie stwierdzono (termin nie pozwalał)' : 'nie stwierdzono'
      const c = num(i.count)
      if (names.length) return `${c ?? names.length} gat.: ${names.join(', ')}`
      return c !== undefined ? `${plNum(c)} gat.` : ''
    },
  },
  {
    id: 'ecotone',
    label: 'Zachowanie strefy ekotonowej',
    parameter: 'structure',
    description:
      'Charakter przejścia muraw w otaczające zbiorowiska. Optymalnie – stopniowe przechodzenie muraw w inne naturalne i półnaturalne zbiorowiska roślinne (karta z przewodnika).',
    help: `Co wybrać: jak murawa przechodzi w otoczenie. Opisz w notatce, co widać – trafi do karty.

Progi (tab. 2): murawy przechodzą stopniowo w inne naturalne i półnaturalne zbiorowiska roślinne – FV; murawa częściowo graniczy ze zbiorowiskami antropogenicznymi lub brak stopniowego przejścia do innych zbiorowisk naturalnych i półnaturalnych – U1; ostra granica między murawami i zbiorowiskami antropogenicznymi (głównie pola orne), wyznaczona zasięgiem działalności człowieka (np. orki) – U2.

Uwaga: opis w tab. 1 („brak strefy ekotonowej z lasem, tylko mozaika z innymi płatami muraw lub łąk”) przeczy tab. 2 – to pozostałość z metodyki 6120; obowiązuje tab. 2. W 2021 r. FV dostawały murawy graniczące z pasem zarośli, ścianą lasu albo przechodzące w łąki; „niektórzy eksperci obniżają ocenę także w przypadku ostrej granicy murawy z lasem”, a przy zarośniętym transekcie (murawy w małych płatach między krzewami) dawano U2. XX – półki skalne w kamieniołomach.

Wskaźnik niekardynalny. Sprawozdanie 2021: oceniany niejednoznacznie, „w istocie nie ma wpływu na stan ochrony muraw”, a ok. 10% zmian ocen to zmiany pozorne (inne podejście ekspertów).`,
    thresholds: thresholdsOf(ECOTONE),
    inputs: [
      selectInput('Strefa ekotonowa', ECOTONE),
      noteInput('Opis (opcjonalnie)', 'np. strefa ekotonowa słabo rozwinięta, utworzona głównie z tarniny', 'Krótki opis ekotonu. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(ECOTONE)),
    describe: (i) => note(i) || labelOf(ECOTONE, i.choice),
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu, z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie. Gdy transektu nie da się wyznaczyć (3 płaty blisko położonych muraw), wpisz współrzędne kolejnych płatów.

Dlaczego: w 2021 r. na stanowisku Kamienny Grzbiet nie znaleziono murawy we wskazanych współrzędnych („możliwy błąd techniczny”) – i stanowisko wypadło z oceny.`

const siteFields: FieldDef[] = [
  {
    kind: 'select',
    name: 'subtype',
    label: 'Podtyp siedliska',
    options: [{ value: '', label: '—' }, ...(Object.entries(SUBTYPE_LABELS_6210) as [Subtype6210, string][]).map(([value, label]) => ({ value, label }))],
    required: true,
    hint: 'Od podtypu zależy lista gatunków podtypu z tab. 1 (pokazywana przy gatunkach charakterystycznych).',
    help: `Trzy podtypy 6210 (tab. 1 przewodnika):
• 6210-1 Murawy naskalne – Seslerio-Festucion duriusculae (Festucetum pallentis, Teucrio-Melicetum ciliatae, zbiorowisko kostrzewy bladej): półki i ściany skalne, ostańce Jury, Pieniny; w większości naturalne;
• 6210-2 Murawy ostnicowe – Festuco-Stipion (Sisymbrio-Stipetum capillatae, Potentillo-Stipetum, Koelerio-Festucetum rupicolae): strome zbocza dolin Wisły, Odry, Niecka Nidziańska;
• 6210-3 Kwietne murawy kserotermiczne – Cirsio-Brachypodion pinnati (Inuletum ensifoliae, Thalictro-Salvietum, Adonido-Brachypodietum, Seslerio-Scorzoneretum, Origano-Brachypodietum) i Mesobromion (Gentiano-Koelerietum, Onobrychido-Brometum): półnaturalne, zależne od wypasu i koszenia.

Dlaczego: tab. 1 podaje dla każdego podtypu inną listę gatunków, a murawy naskalne z natury nie mają storczyków ani wielu kwietnych gatunków – formularz o tym przypomina.`,
  },
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Radomice',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – zwykle miejscowość albo wzgórze, czasem z numerem, np. „Radomice”, „Góra Matyska 4”, „Skarpy Ślesińskie III”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego transektu.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. badawcze',
    help: `Typ stanowiska w sieci monitoringu, np. „referencyjne” (dobrze wykształcona murawa, punkt odniesienia) albo „badawcze”. Jeśli nie wiesz, zostaw puste.

Dlaczego: przy ocenie na poziomie regionu stanowiska referencyjne pokazują, jak wygląda 6210 w dobrym stanie.`,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Cirsio-Brachypodion pinnati, Scabioso ochroleucae-Brachypodietum pinnati',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Klasa Festuco-Brometea, rząd Festucetalia valesiacae; związki: Seslerio-Festucion duriusculae (6210-1), Festuco-Stipion (6210-2), Cirsio-Brachypodion pinnati i Mesobromion (6210-3).

Uwaga: w 2021 r. 16 stanowisk wskazano do usunięcia, bo roślinność była inna – murawy napiaskowe Koelerion glaucae (6120, Puszcza Kampinoska), murawy pannońskie Stipo-Festucetalia pallentis (6190, Ślęża, Góry Bardzkie) albo łąka z elementami ciepłolubnymi (Ostoja Popradzka). Jeśli to nie Festuco-Brometea, użyj karty właściwego siedliska.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Położenie (stok, wąwóz, skały, kamieniołom), ekspozycja, użytkowanie (wypas, koszenie), zarastanie, sąsiednie siedliska.',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• położenie: stok pagórka, zbocze doliny rzecznej, wąwóz lessowy, ostaniec, półki skalne, nasyp, kamieniołom; ekspozycja (zwykle S, SE, SW);
• podłoże: rędzina, less, czarnoziem, wapień, gips;
• użytkowanie: wypas (czym, jak intensywnie), koszenie, wypalanie, porzucenie;
• zarastanie: tarnina, dereń, głóg, róża, sosna; kłosownica, trzcinnik;
• kompleks z innymi siedliskami (6510, 40A0, 6110, 91I0, 6120, 6190);
• antropopresja: pola orne, zabudowa, wydeptywanie, quady, śmieci, zalesienia.`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Łączna powierzchnia płatów siedliska na stanowisku, w hektarach (karta z przewodnika: 2 ha). Stanowisko to zwykle wzgórze lub skarpa o powierzchni ok. 1 ha. Sprawozdanie 2021: od 0,001 do 14 ha, najczęściej 0,5–3 ha.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „Park Krajobrazowy Doliny Bobru; Natura 2000 Ostoja nad Bobrem”. Brak – „brak”.',
  }),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. Zespół Parków Krajobrazowych, Nadleśnictwo, właściciele prywatni',
    help: `Kto zarządza terenem: park narodowy lub krajobrazowy, RDOŚ (rezerwat), Lasy Państwowe, gmina, rolnicy indywidualni.

Dlaczego: od właściciela zależy wypas, koszenie, odkrzaczanie albo zalesienie – najsilniejsze czynniki dla 6210. W 2021 r. najlepiej wypadły Pieniny (park narodowy, ochrona czynna), najgorzej prywatne, nieużytkowane płaty w Beskidzie Żywieckim.`,
  },
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    defaultValue: '200 m',
    required: true,
    hint: 'Jeden transekt długości 200 m; można go dostosować do terenu.',
    help: `Na każdym stanowisku wyznacza się jeden transekt długości 200 m – zwykle linia prosta, ale można go dopasować do topografii. Co 100 m wyznacza się miejsca zdjęć fitosocjologicznych: początek, środek i koniec (łącznie 3). Wartość wskaźników określa się na podstawie przejścia przez transekt.

Gdy transektu nie da się wyznaczyć, bierze się 3 płaty blisko położonych muraw – opisz to w uwagach. Karta z przewodnika (Radomice) ma „powierzchnię prostokątną 20×100 m” – formularz ostrzeże przy innej długości niż 200 m.`,
    warn: (v) => {
      const m = String(v ?? '').replace(',', '.').match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/)
      if (!m) return null
      const long = Math.max(Number(m[1]), Number(m[2]))
      return long === 200 ? null : `Transekt ${plNum(Number(m[1]))}×${plNum(Number(m[2]))} m – metodyka: transekt długości 200 m. Opisz odstępstwo w uwagach.`
    },
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    help: 'Wysokość nad poziomem morza transektu (albo zakres od początku do końca), z GPS albo mapy. Siedlisko występuje od dolin Odry i Wisły po Pieniny i Beskid Żywiecki (region alpejski).',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 26.07.2008',
    required: true,
    hint: 'Od maja do połowy sierpnia.',
    help: `Dzień badań terenowych. Termin (przewodnik): od maja do połowy sierpnia, kiedy znaczna część gatunków jest w optimum kwitnienia. Później też można, ale trzeba liczyć się z błędną oceną pokrycia i niemożnością oznaczenia niektórych gatunków – zwłaszcza storczykowatych (w 2021 r. 29 stanowisk z XX przy storczykach). W 2021 r.: 18.05–15.08.

Badanie powtarza się co 5–6 lat.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const [, mm, dd] = v.split('-').map(Number)
      const inWindow = (mm >= 5 && mm <= 7) || (mm === 8 && dd <= 15)
      return inWindow ? null : 'Termin poza oknem metodyki (maj – połowa sierpnia). Pokrycie gatunków może być błędne, a część gatunków (storczykowate) nie do stwierdzenia – opisz to w uwagach.'
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
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach (murawy: od 0° do 45°; w karcie z przewodnika 5°).' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, SW). Murawy kserotermiczne najczęściej na stokach S, SE i SW. Dla powierzchni płaskiej zostaw puste albo wpisz „brak”.' }),
  layerField('coverB', 'Warstwa B – krzewy i podrost: procent powierzchni zdjęcia pod krzewami i podrostem drzew (tarnina, dereń, głóg, róża). Brak = 0.\n\nDlaczego: warstwa B to sukcesja – główne zagrożenie muraw po zaprzestaniu wypasu i koszenia.', { groupCols: 3 }),
  layerField('coverC', 'Warstwa C – zielna: procent powierzchni zdjęcia pokryty przez rośliny naczyniowe. W karcie z przewodnika 95–100%; w murawach naskalnych znacznie mniej.'),
  layerField('coverD', 'Warstwa D – mszysta: mchy i porosty naziemne. Brak = 0.'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów i podrostu, w metrach. Brak warstwy = 0.'),
  layerField('heightC', 'Warstwa C – typowa wysokość roślin zielnych, w centymetrach (w karcie z przewodnika 0,6 m = 60 cm).'),
  layerField('heightD', 'Warstwa D – typowa wysokość warstwy mszystej, w centymetrach.'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Scabioso ochroleucae-Brachypodietum pinnati',
    help: 'Jednostka fitosocjologiczna zdjęcia – zespół z Festuco-Brometea, np. Inuletum ensifoliae, Adonido-Brachypodietum pinnati, Festucetum pallentis, Sisymbrio-Stipetum capillatae.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w poletku z ilościowością w skali Braun-Blanqueta (r, +, 1–5): warstwa B – krzewy i podrost, C – zielna, D – mszaki i porosty. Warstwa podpowiada się sama po wyborze gatunku. Ilościowość 5 gatunku ekspansywnego (kłosownica, trzcinnik) to wg tab. 1 stan zły – przepisz ją do wskaźnika.',
  }),
]

export const methodology6210: Methodology = {
  code: '6210',
  name: 'Murawy kserotermiczne (Festuco-Brometea)',
  source:
    'Mróz W., Bąba W. 2010, 6210 Murawy kserotermiczne (Festuco-Brometea), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ, s. 119–129 (tab. 1 i 2), z modyfikacją metodyki GIOŚ z 27.05.2022 (gatunki charakterystyczne); praktyka oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014 i 2020–2021',

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
    help: `Weź pod uwagę: sukcesję wtórną (krzewy, podrost drzew), zarzucenie wypasu i koszenia, ekspansję kłosownicy, trzcinnika i gatunków obcych (nawłocie, robinia), zalesianie, zaoranie, wydeptywanie, quady, eksploatację kamieniołomów, wypalanie.

Ochrona czynna (przewodnik, pkt 5; sprawozdanie 2021): ekstensywny wypas (owce, kozy), koszenie co najmniej co 2 lata późnym latem, odkrzaczanie powtarzane co kilka lat, karczowanie. Bez użytkowania kwietne murawy w 25–30 lat przechodzą w ubogie zarośla.

Praktyka 2021: FV dostawały stanowiska w dobrym stanie, z ochroną czynną i bez istotnych zagrożeń (np. Pieniny); U2 – wyraźne pogorszenie lub utrata powierzchni bez działań hamujących. Region kontynentalny: FV 32%, U1 38%, U2 30%. Sprawozdanie proponuje, by pojedyncze gatunki obce obniżały raczej perspektywy niż strukturę.`,
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
    { code: 'A04.01', name: 'Wypas intensywny' },
    { code: 'A04.02', name: 'Wypas nieintensywny' },
    { code: 'A04.03', name: 'Zarzucenie pasterstwa, brak wypasu' },
    { code: 'A07', name: 'Stosowanie biocydów, hormonów i chemikaliów' },
    { code: 'A08', name: 'Nawożenie' },
    { code: 'B01', name: 'Zalesianie terenów otwartych' },
    { code: 'B01.02', name: 'Sztuczne nasadzenia na terenach otwartych (drzewa nierodzime)' },
    { code: 'B02.03', name: 'Usuwanie podszytu' },
    { code: 'C01', name: 'Wydobywanie surowców (kamieniołomy, piaskownie)' },
    { code: 'D01', name: 'Drogi, ścieżki i drogi kolejowe' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D01.02', name: 'Drogi, autostrady' },
    { code: 'E01', name: 'Tereny zurbanizowane, tereny zamieszkane' },
    { code: 'E01.03', name: 'Zabudowa rozproszona' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'F04.01', name: 'Plądrowanie stanowisk roślin' },
    { code: 'G01', name: 'Sporty i różne formy czynnego wypoczynku, uprawiane w plenerze' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
    { code: 'G01.04', name: 'Wspinaczka górska, skałkowa, speleologia' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'G05.07', name: 'Niewłaściwie realizowane działania ochronne lub ich brak' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J01.01', name: 'Wypalanie' },
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
            hint: 'Np. gatunki chronione i zagrożone, storczyki, sąsiedztwo 6510, 40A0, 91I0.',
            help: 'Wartości przyrodnicze stanowiska poza samą murawą: gatunki chronione i z czerwonej listy (np. goryczka krzyżowa, dziewięćsił bezłodygowy, storczyki, miłek wiosenny, ostnice), sąsiednie siedliska (6510 łąki świeże, 40A0 zarośla kserotermiczne, 6110 murawy naskalne, 91I0 ciepłolubne dąbrowy), bogata fauna bezkręgowców. Brak informacji – „Nie stwierdzono” albo „Nie pozyskano danych”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            label: 'Wykonywane działania ochronne',
            help: 'Jakie działania ochronne wykonano i z jakim skutkiem: odkrzaczanie, wycinka i karczowanie, koszenie, wypas (owce, kozy, bydło), wygrabianie wojłoku, grodzenie, zamykanie ścieżek. Ślady nielegalnego wypalania też odnotuj. Brak działań – „Brak”.',
          },
          {
            kind: 'textarea',
            name: 'proposals',
            label: 'Propozycje wprowadzenia działań ochronnych',
            rows: 4,
            hint: 'Np. ekstensywny wypas, usunięcie nalotu krzewów (zwłaszcza tarniny).',
            help: 'Jakie działania proponujesz, konkretnie: ekstensywny wypas (owce, kozy), koszenie co najmniej co 2 lata późnym latem z usunięciem biomasy, odkrzaczanie powtarzane w miarę odrastania, usuwanie nawłoci i robinii, ograniczenie ruchu (szlabany, zamknięcie ścieżek). Brak – „Brak”.',
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
            help: 'Karta z przewodnika podaje przy ocenie ogólnej udział procentowy powierzchni siedliska o różnym stanie zachowania na całym stanowisku (Radomice: FV 85%, U1 15%, U2 –). Trzy liczby powinny dać razem 100%.',
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

  speciesCatalog: SPECIES_6210.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer6210(s) })),
  speciesInfo: (name) => {
    const e = findSpecies6210(name)
    if (!e) return undefined
    if (e.group === 'characteristic' && e.expansiveToo) return `${GROUP_LABELS_6210.characteristic} (przy nadmiernym pokryciu – ekspansywny)`
    if (e.group === 'characteristic' && e.subtypes?.length) return `${GROUP_LABELS_6210.characteristic} (tab. 1: ${e.subtypes.join(', ')})`
    if (e.group === 'expansive' && !e.tab1) return `${GROUP_LABELS_6210.expansive} (sprawozdania 2013–2021)`
    if (e.group === 'alien' && e.weak) return `${GROUP_LABELS_6210.alien} (archeofit, uprawny lub chwast, bez tendencji do inwazji)`
    return GROUP_LABELS_6210[e.group]
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator6210 = (id: string): IndicatorDef => {
  const i = methodology6210.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 6210`)
  return i
}
