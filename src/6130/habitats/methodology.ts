// Metodyka 6130 (murawy galmanowe Violetalia calaminariae) jako dane. Źródło:
// Świerkosz K., Reczyńska K. 2015, „6130 Murawy galmanowe (Violetalia calaminariae)” [w:] Mróz W. (red.),
// Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. IV, GIOŚ, s. 167–181 (tab. 1 i 2, karta Miedzianka),
// z praktyką oceny ze sprawozdań z monitoringu 2013–2014, 2015–2018 (badania 2018) i 2023–2025 (badania 2024).
// Siedlisko niepriorytetowe, tylko region kontynentalny. Stanowisko to grupa płatów muraw na hałdach (dawne górnictwo
// rud metali i arsenu) odległych od siebie najwyżej o ok. 50 m; transekt o stałej długości zwykle nie jest możliwy.
// Wskaźniki ocenia się na 3 powierzchniach w promieniu ok. 50 m albo na transekcie; 3 zdjęcia po 25 m² (min. 10 m²).
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_6130,
  REGION_LABELS_6130,
  REGIONS_6130,
  SPECIES_6130,
  defaultLayer6130,
  findSpecies6130,
  isAlien6130,
  isCharacteristic6130,
  isWoody6130,
  speciesKey6130,
} from './species'

// ---------- progi liczbowe (tab. 2) ----------

/** Charakterystyczna kombinacja: od tylu gatunków typowych formularz podpowiada FV. Próg formularza – tab. 2 jest opisowa. */
export const TYPICAL_FV_COUNT = 6
/** „Kadłubowa (tylko pojedyncze gatunki typowe z pokryciem do 2%)” – łączne pokrycie gatunków typowych do tego progu to U2. */
export const RUMP_COVER = 2

/**
 * Charakterystyczna kombinacja florystyczna (tab. 2 opisowa; liczby – próg formularza z praktyki 2013–2024):
 * brak gatunków typowych albo łącznie ≤2% pokrycia – U2 („kadłubowa”); co najmniej 6 gatunków – FV („typowa”);
 * pozostałe – U1 („zubożona”).
 */
export function gradeCharacteristic6130(count: number, total?: number): Grade {
  if (count <= 0) return 'U2'
  if (total !== undefined && total <= RUMP_COVER) return 'U2'
  return count >= TYPICAL_FV_COUNT ? 'FV' : 'U1'
}

/** Obce gatunki inwazyjne: brak – FV; sporadycznie, nie więcej niż 2% pokrycia – U1; ponad 2% – U2. */
export const gradeAliens6130 = (total: number): Grade => (total <= 0 ? 'FV' : total <= 2 ? 'U1' : 'U2')

/** Synantropijne i nitrofilne: brak lub pojedyncze (do 1%) – FV; powyżej 1%, nie więcej niż 5% – U1; ponad 5% – U2. */
export const gradeNitrophilous6130 = (total: number): Grade => (total <= 1 ? 'FV' : total <= 5 ? 'U1' : 'U2')

/** Ekspansywne spoza typowej kombinacji: <10% – FV; 10–30% – U1 (obie granice); >30% – U2. */
export const gradeExpansive6130 = (total: number): Grade => (total < 10 ? 'FV' : total <= 30 ? 'U1' : 'U2')

/** Krzewy i podrost drzew: nie przekracza 10% – FV; 10–30% – U1 (do 30 włącznie); wyższy niż 30% – U2. */
export const gradeShrubs6130 = (total: number): Grade => (total <= 10 ? 'FV' : total <= 30 ? 'U1' : 'U2')

/** Spadek powierzchni (% względem wcześniejszych badań/literatury): 0 – FV; do 10% – U1; więcej – U2 (próg z „zmniejszona o 10%”). */
export const gradeAreaLoss6130 = (loss: number): Grade => (loss <= 0 ? 'FV' : loss <= 10 ? 'U1' : 'U2')

const pct = (v: number) => `${plNum(v)}%`
const round1 = (n: number) => Math.round(n * 10) / 10
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey6130(n), n])).values()]
const regionOf = (ctx?: { site?: InputValues }) => String(ctx?.site?.region ?? '')

/** Suma pokrycia wierszy listy spełniających warunek; 'present' – są wiersze, ale bez pokrycia; undefined – brak wierszy. */
function sumCover(list: unknown, pred: (name: string) => boolean = () => true): number | 'present' | undefined {
  const rows = speciesRows(list).filter((r) => r.name?.trim() && pred(r.name.trim()))
  if (!rows.length) return undefined
  const covers = rows.map((r) => num(r.cover)).filter((c): c is number => c !== undefined)
  return covers.length ? round1(covers.reduce((a, b) => a + b, 0)) : 'present'
}

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'minor', label: 'Zmniejszona o 10% w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze', grade: 'U1' },
  { value: 'decrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const CHARACTERISTIC: GradedOption[] = [
  { value: 'fv', label: 'Typowa, właściwa dla siedliska 6130', grade: 'FV' },
  { value: 'u1', label: 'Zubożona w stosunku do typowej (w tym wkraczanie gatunków nitrofilnych lub obcych geograficznie)', grade: 'U1' },
  { value: 'u2', label: 'Kadłubowa (tylko pojedyncze gatunki typowe z pokryciem do 2%)', grade: 'U2' },
]
const PHYSIOGNOMY: GradedOption[] = [
  {
    value: 'fv',
    label: 'Niskie murawy do 30 cm wysokości (wyjątkowo do 50), pomiędzy roślinami widoczne podłoże hałdy; płaty zauważalne z daleka, wyraźnie odróżniają się od otaczającej je roślinności',
    grade: 'FV',
  },
  {
    value: 'u1',
    label: 'Murawy z wyższymi niż 30–50 cm gatunkami traw lub bylin; podłoże hałdy słabo widoczne; płaty widoczne z odległości dzięki dominacji gatunków typowych, lecz słabo odróżniające się od otaczających je zbiorowisk łąkowych',
    grade: 'U1',
  },
  {
    value: 'u2',
    label: 'Murawy z licznym udziałem wysokich traw, bylin i krzewów; podłoże hałdy niewidoczne; płaty rozpoznawalne z bliska dzięki charakterystycznej kombinacji gatunków, lecz fizjonomicznie słabo odróżnialne (także postaci kadłubowe, np. na osypujących się stokach hałd naruszonych poborem kruszywa)',
    grade: 'U2',
  },
]
const GRAZING: GradedOption[] = [
  { value: 'grazed', label: 'Murawa wypasana regularnie', grade: 'FV' },
  { value: 'stable', label: 'Murawa utrzymuje się bez wypasu', grade: 'FV' },
  { value: 'irregular', label: 'Wypas nieregularny (pojedyncze krzewy i młode drzewa) lub koszenie', grade: 'U1' },
  { value: 'none', label: 'Brak wypasu (krzewy i młode drzewa powyżej 0,5 m); pojawiają się procesy sukcesji w kierunku zbiorowisk leśno-zaroślowych', grade: 'U2' },
]
const DESTRUCTION: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'minor', label: 'Sporadyczne zaśmiecanie, wydeptywanie, pojedyncze ślady ognisk w pobliżu stanowisk siedliska', grade: 'U1' },
  { value: 'physical', label: 'Fizyczne niszczenie stanowisk wskutek działalności człowieka (pobór kruszywa z hałd, pożary wskutek palenia ognisk, nielegalne wysypiska śmieci)', grade: 'U2' },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

/** Select niewymagany – gdy lista wystarcza, nie trzeba go wybierać. */
const optionalSelect = (label: string, options: GradedOption[], help?: string, name = 'choice'): FieldDef => ({ ...selectInput(label, options, help, name), required: false })

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

const totalInput = (label: string, help: string): FieldDef => ({ kind: 'number', name: 'total', label, unit: '%', min: 0, max: 100, help })

/** Łączne pokrycie: wpisane wprost > suma z listy > 0 przy „nie stwierdzono”. 'present' – lista bez pokrycia. */
function coverOf(i: InputValues, pred?: (name: string) => boolean): number | 'present' | undefined {
  const t = num(i.total)
  if (t !== undefined) return t
  const s = sumCover(i.species, pred)
  if (s !== undefined) return s
  return i.none === 'yes' ? 0 : undefined
}

// ---------- region (zespół stanowisk z tab. 1) ----------

export const REGION_OPTIONS: SelectOption[] = [
  ...REGIONS_6130.map((r) => ({ value: r, label: REGION_LABELS_6130[r] })),
  { value: 'other', label: 'Inne stanowisko (np. Sudety poza Rudawami) – liczą się gatunki ze wszystkich list' },
]

// ---------- charakterystyczna kombinacja ----------

const characteristicNames = (i: InputValues, region: string) => distinct(rowNames(i.species).filter((n) => isCharacteristic6130(n, region)))
function characteristicFacts(i: InputValues, region: string): { count: number; total?: number } | undefined {
  const c = num(i.count)
  const cov = sumCover(i.species, (n) => isCharacteristic6130(n, region))
  const total = typeof cov === 'number' ? cov : undefined
  if (c !== undefined) return { count: c, total }
  return rowNames(i.species).length ? { count: characteristicNames(i, region).length, total } : undefined
}

// ---------- wskaźniki ----------

const SURFACE = 'w % pokrycia hałdy lub transektu (w dziesiątkach procent; dla „<1%” albo „<0,5%” wpisz 0,5)'

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description: 'Powierzchnia siedliska na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury (tab. 2: „Powierzchnia siedliska na stanowisku”).',
    help: `Co wybrać: jak zmieniła się powierzchnia płatów 6130 na stanowisku od poprzedniego badania albo względem literatury (dawne hałdy, ślady górnictwa). Samą powierzchnię wpisz obok – trafi do „wartości”.

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; zmniejszona o 10% w porównaniu z wcześniejszymi badaniami lub literaturą – U1; wyraźny spadek – U2. Spadek w procentach możesz wpisać liczbą: 0 → FV, do 10% → U1, więcej → U2 (granicę „o 10%” formularz liczy do U1). Przy pierwszym badaniu wybierz „Brak danych do porównania” (XX) albo oceń ekspercko.

Uwaga: płaty siedliska są zwykle bardzo małe (1–10 arów, w karcie z przewodnika 0,002 ha), a spadek bierze się z sukcesji, zalesiania i rozbierania hałd na kruszywo. Karta z przewodnika (Miedzianka): „zmniejsza się znacząco w stosunku do potencjalnego zasięgu” → U2. W 2013–2014 r. sześć stanowisk dostało U1/U2 za spadek względem literatury albo rozmieszczenia śladów dawnego górnictwa.`,
    thresholds: thresholdsOf(AREA.filter((o) => o.grade !== 'XX')),
    inputs: [
      optionalSelect('Zmiana powierzchni', AREA, 'Puste, gdy wpisujesz spadek liczbą albo oceniasz ekspercko. Wybór ma pierwszeństwo przed liczbą.'),
      { kind: 'number', name: 'loss', label: 'Spadek powierzchni (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'O ile procent zmniejszyła się powierzchnia siedliska od poprzedniego badania (0 – bez zmian albo wzrost). Do 10% – U1, więcej – U2.' },
      { kind: 'text', name: 'areaText', label: 'Powierzchnia (opcjonalnie)', placeholder: 'np. 0,002 ha', help: 'Powierzchnia płatów siedliska na stanowisku, tak jak w karcie („0,002 ha”) – trafi do pola „wartość”. Sprawozdanie 2024: od 0,001 ha (Skalisko) do 4,5 ha (Armeria).' },
      noteInput('Opis (opcjonalnie)', 'np. Zmniejsza się znacząco w stosunku do potencjalnego zasięgu.', 'Krótki opis zmian, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: (i) => {
      const chosen = gradeMap(AREA)[String(i.choice)]
      if (chosen) return chosen
      const l = num(i.loss)
      return l === undefined ? null : gradeAreaLoss6130(l)
    },
    explain: (i) => {
      const l = num(i.loss)
      return !i.choice && l !== undefined ? `Spadek powierzchni: ${pct(l)}.` : null
    },
    describe: (i) => note(i) || String(i.areaText ?? '').trim() || (i.choice ? labelOf(AREA, i.choice) : num(i.loss) !== undefined ? `Spadek o ${pct(num(i.loss)!)}` : ''),
  },
  {
    id: 'characteristic',
    label: 'Charakterystyczna kombinacja florystyczna',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków charakterystycznych i dominujących w poszczególnych warstwach (c, d), tworzących typową dla stanowiska kombinację florystyczną siedliska; dla każdego gatunku przybliżony odsetek pokrycia hałdy. Waloryzacja z uwzględnieniem specyfiki regionalnej.',
    help: `Co wpisać: gatunki typowe na badanych powierzchniach albo na transekcie, z pokryciem ${SURFACE}. Katalog zna listy z tab. 1: w całym zasięgu w Polsce (zawciąg pospolity Armeria maritima ssp. halleri, lepnica rozdęta, kostrzewa owcza, driakiew żółtawa, przelot, biedrzeniec mniejszy, przytulia biała, macierzanka zwyczajna, chrobotki Cladonia foliacea, C. pyxidata, C. glauca, szczaw zwyczajny, dziewięćsił pospolity i inne z pkt 4) oraz regionalne: Rudawy Janowickie (mietlica pospolita, goździk kropkowany, skrzyp polny, rozchodnik wielki, szczaw cienkolistny), Wyżyna Olkuska (pleszczotka górska, goździk kartuzek, łyszczec baldachogronowy, pięciornik piaskowy), Złoty Stok (chaber driakiewnik, centuria, goryczuszka Wettsteina, wrzos). Który zestaw regionalny się liczy – wybierasz w „Stanowisku” (Region). Liczbę gatunków typowych możesz wpisać wprost.

Progi (tab. 2): typowa, właściwa dla siedliska 6130 – FV; zubożona w stosunku do typowej (w tym wkraczanie gatunków nitrofilnych lub obcych geograficznie) – U1; kadłubowa (tylko pojedyncze gatunki typowe z pokryciem do 2%) – U2.

Jak liczy formularz (tab. 2 nie podaje liczby gatunków): ocena wybrana w polu ma pierwszeństwo; bez niej – brak gatunków typowych albo ich łączne pokrycie do ${RUMP_COVER}% → U2; co najmniej ${TYPICAL_FV_COUNT} gatunków → FV; pozostałe → U1. Próg ${TYPICAL_FV_COUNT} wzięty z praktyki: w 2024 r. FV miały stanowiska z ok. 10 gatunkami, U1 – z 5 (Ciechanowice), U2 – Złoty Stok z 4 gatunkami występującymi pojedynczo. Karta z przewodnika (Miedzianka): 7 gatunków, łącznie ok. 56% → FV. Przewodnik zastrzega, że prawidłowo wykształcone płaty na podłożach ubogich w węglan wapnia mogą być bardzo ubogie w gatunki – wtedy oceń ekspercko.

Wskaźnik kardynalny.`,
    thresholds: thresholdsOf(CHARACTERISTIC),
    inputs: [
      speciesInput('Gatunki typowe', `Gatunki charakterystycznej kombinacji z pokryciem ${SURFACE}, np. Festuca ovina 25, Agrostis capillaris 15, Silene vulgaris 7.`),
      { kind: 'number', name: 'count', label: 'Liczba gatunków typowych (opcjonalnie)', min: 0, help: 'Łączna liczba gatunków typowych na stanowisku, wpisana wprost – ma pierwszeństwo przed liczeniem z listy.' },
      optionalSelect('Ocena (opcjonalnie)', CHARACTERISTIC, 'Ocena ekspercka wg tab. 2 – ma pierwszeństwo przed liczbą gatunków. Wybierz ją zwłaszcza przy płatach naturalnie ubogich w gatunki albo przy zubożeniu przez wkraczanie gatunków nitrofilnych i obcych.'),
      noteInput('Opis (opcjonalnie)', 'np. mietlica pospolita Agrostis capillaris 15%; lepnica rozdęta Silene vulgaris 7%…', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i, ctx) => {
      const chosen = gradeMap(CHARACTERISTIC)[String(i.choice)]
      if (chosen) return chosen
      const f = characteristicFacts(i, regionOf(ctx))
      return f ? gradeCharacteristic6130(f.count, f.total) : null
    },
    explain: (i, ctx) => {
      if (i.choice) return null
      const region = regionOf(ctx)
      const f = characteristicFacts(i, region)
      if (!f) return null
      const names = characteristicNames(i, region)
      const head = num(i.count) !== undefined ? `Gatunków typowych: ${plNum(f.count)}` : `Gatunki typowe z katalogu: ${names.length}${names.length ? ` (${names.join(', ')})` : ''}`
      return `${head}${f.total !== undefined ? `; łączne pokrycie ${pct(f.total)}` : ''}.`
    },
    warn: (i, ctx) => {
      const region = regionOf(ctx)
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      const other = names.filter((n) => findSpecies6130(n) && !isCharacteristic6130(n, region))
      if (other.length) parts.push(`Nie liczą się jako typowe${REGIONS_6130.includes(region as never) ? ' w tym regionie' : ''}: ${other.join(', ')}.`)
      const chosen = gradeMap(CHARACTERISTIC)[String(i.choice)]
      const f = characteristicFacts(i, region)
      if (chosen && f) {
        const calc = gradeCharacteristic6130(f.count, f.total)
        if (chosen !== calc) parts.push(`Wybrano ${chosen}, a z listy wychodzi ${calc} – sprawdź i uzasadnij.`)
      }
      if (!region && names.length) parts.push('Wybierz Region w „Stanowisku” – od niego zależy lista gatunków typowych.')
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      const c = num(i.count)
      return list || (c !== undefined ? `${plNum(c)} gat.` : i.choice ? labelOf(CHARACTERISTIC, i.choice) : '')
    },
  },
  {
    id: 'physiognomy',
    label: 'Fizjonomia zbiorowiska roślinnego',
    parameter: 'structure',
    description:
      'Opis fizjonomii zbiorowiska – dominujące grupy roślinności, udział krzewów itp. Niskie murawy do 30 cm (wyjątkowo do 50 cm), pomiędzy roślinami widoczne podłoże hałdy; płaty zauważalne z daleka dzięki dominacji gatunków typowych.',
    help: `Co wybrać: jak murawa wygląda z daleka i z bliska – wysokość runi, widoczność podłoża hałdy, czym płaty odróżniają się od otoczenia. Wysokość murawy możesz wpisać w centymetrach (na ocenę nie wpływa, formularz ostrzeże przy rozjeździe z wyborem).

Progi (tab. 2): niskie murawy do 30 cm (wyjątkowo 50), widoczne podłoże, płaty wyraźnie odróżniają się od otoczenia – FV; murawy z gatunkami wyższymi niż 30–50 cm, podłoże słabo widoczne, płaty słabo odróżniają się od zbiorowisk łąkowych – U1; liczny udział wysokich traw, bylin i krzewów, podłoże niewidoczne, płaty rozpoznawalne tylko z bliska (także postaci kadłubowe na osypujących się stokach hałd po poborze kruszywa) – U2.

Typowe dominanty (tab. 1): Rudawy Janowickie – mietlica pospolita, kostrzewa owcza i masowo lepnica rozdęta; okolice Olkusza – kostrzewa owcza i zawciąg; Złoty Stok – lepnica, driakiew żółtawa, chaber driakiewnik i wrzos (część płatów przypomina wrzosowisko). Sprawozdanie 2024: FV – murawy 15 do 30–40 cm, luźne; U1 – wyższe, kępiaste albo zbyt bujne, łąkowe. Karta z przewodnika (Miedzianka) → U2.`,
    thresholds: thresholdsOf(PHYSIOGNOMY),
    inputs: [
      selectInput('Fizjonomia', PHYSIOGNOMY),
      { kind: 'number', name: 'height', label: 'Wysokość murawy (opcjonalnie)', unit: 'cm', min: 0, help: 'Przeciętna wysokość runi w centymetrach (bez pojedynczych kwiatostanów). Na ocenę nie wpływa – formularz ostrzega, gdy nie pasuje do wybranej klasy.' },
      noteInput('Opis (opcjonalnie)', 'np. Murawy z licznym udziałem wysokich traw, bylin i krzewów…', 'Krótki opis fizjonomii, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(PHYSIOGNOMY)),
    warn: (i) => {
      const h = num(i.height)
      if (h === undefined) return null
      if (i.choice === 'fv' && h > 50) return `Murawa ${plNum(h)} cm a wybrano FV (do 30 cm, wyjątkowo 50) – sprawdź.`
      if (h > 300) return 'Ponad 3 m? Wysokość wpisuje się w centymetrach.'
      return null
    },
    describe: (i) => note(i) || labelOf(PHYSIOGNOMY, i.choice),
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków obcych geograficznie dla siedliska (nazwa polska i łacińska) z przybliżonym procentem pokrycia hałdy lub transektu. W dobrze wykształconych murawach gatunki obce roślin zielnych lub drzew nie powinny występować.',
    help: `Co wpisać: gatunki obce na badanych powierzchniach albo na transekcie, z pokryciem ${SURFACE}. Gdy karta podaje tylko pokrycie łączne („łącznie 5% hałdy”), wpisz je w polu „Łączne pokrycie”. Najczęściej notowane (tab. 1, sprawozdania): czeremcha amerykańska, nawłoć późna i kanadyjska, dąb czerwony, rdestowce ostrokończysty i sachaliński, robinia akacjowa, niecierpek gruczołowaty, daglezja, karagana, dereń biały, tawuła nibywierzbolistna, aster nowoangielski.

Progi (tab. 2): brak – FV; sporadycznie (nie więcej niż 2% pokrycia hałdy lub transektu) – U1; pojedynczo lub licznie (ponad 2% pokrycia) – U2.

Jak liczy formularz: łączne pokrycie wpisane wprost, a bez niego suma z listy: 0 → FV, do 2% (włącznie) → U1, powyżej → U2. Gatunki wpisane bez pokrycia formularz traktuje jak „sporadycznie” (U1) – tak oceniano w 2024 r. pojedyncze osobniki. Słowo „pojedynczo” w kolumnie U2 tab. 2 kłóci się z U1 – formularz idzie za liczbą 2%. Karta z przewodnika (Miedzianka): rdestowce łącznie 5% → U2.

Wskaźnik kardynalny – w 2024 r. sam decydował o U2 struktury na Armerii.`,
    thresholds: { FV: 'Brak', U1: 'Sporadycznie (nie więcej niż 2% pokrycia hałdy lub transektu)', U2: 'Pojedynczo lub licznie (ponad 2% pokrycia hałdy lub transektu)' },
    inputs: [
      speciesInput('Gatunki obce', `Gatunki obce inwazyjne z pokryciem ${SURFACE}.`),
      totalInput('Łączne pokrycie gatunków obcych (opcjonalnie)', 'Łączne pokrycie wszystkich gatunków obcych w % hałdy lub transektu – ma pierwszeństwo przed sumą z listy (np. „rdestowce łącznie 5%”).'),
      NONE_FIELD('Brak gatunków obcych', 'Zaznacz „Nie stwierdzono”, gdy na stanowisku nie ma gatunków obcych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. rdestowiec sachaliński Reynoutria sachalinensis; rdestowiec ostrokończysty Reynoutria japonica – łącznie 5% hałdy', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = coverOf(i)
      if (c === undefined) return null
      return c === 'present' ? 'U1' : gradeAliens6130(c)
    },
    explain: (i) => {
      const c = coverOf(i)
      if (c === undefined || c === 0) return null
      const n = distinct(rowNames(i.species)).length
      return c === 'present' ? `Gatunki bez pokrycia (${n}) – przyjęto „sporadycznie”.` : `Pokrycie gatunków obcych: ${pct(c)}${n ? ` (${n} gat.)` : ''}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo pokrycie nie są puste.')
      const native = names.filter((n) => findSpecies6130(n) && !isAlien6130(n))
      if (native.length) parts.push(`Na liście są gatunki rodzime: ${native.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      const t = num(i.total)
      if (list) return t !== undefined ? `${list} – łącznie ${pct(t)}` : list
      if (t !== undefined) return `Łącznie ${pct(t)}`
      return i.none === 'yes' ? 'Brak' : ''
    },
  },
  {
    id: 'nitrophilous',
    label: 'Gatunki synantropijne i nitrofilne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków synantropijnych i nitrofilnych zajmujących >0,5% powierzchni, z przybliżonym procentem pokrycia hałdy. Liczba gatunków i łączny procent pokrywanej przez nie powierzchni może świadczyć o postępującej eutrofizacji stanowiska.',
    help: `Co wpisać: gatunki synantropijne i nitrofilne z pokryciem ${SURFACE}. Przewodnik: przede wszystkim malina właściwa i pokrzywa zwyczajna, rzadziej świerząbek korzenny, bodziszek drobny, szczaw kędzierzawy, trybula leśna i podagrycznik; sprawozdania dokładają sadziec konopiasty, barszcz zwyczajny i glistnik.

Progi (tab. 2): brak lub pojedyncze okazy – FV; pojedynczo (powyżej 1%, lecz nie więcej niż 5% pokrycia hałdy lub transektu) – U1; licznie (ponad 5%) – U2.

Jak liczy formularz: łączne pokrycie wpisane wprost, a bez niego suma z listy: do 1% (włącznie) → FV, do 5% → U1, powyżej → U2. Gatunki bez pokrycia – „pojedyncze okazy” (FV). Karta z przewodnika (Miedzianka): malina 2% + podagrycznik <0,5% → U1. Jeżyny (Rubus spp.) w 2018 r. liczono tu, a w 2024 r. jako ekspansywne – katalog trzyma je przy ekspansywnych; wpisz tam, gdzie je oceniasz, i opisz.

Wskaźnik kardynalny. Do 2015 r. nazywał się „Gatunki nitrofilne” (progi te same).`,
    thresholds: { FV: 'Brak lub pojedyncze okazy', U1: 'Pojedynczo (powyżej 1%, lecz nie więcej niż 5% pokrycia hałdy lub transektu)', U2: 'Licznie (ponad 5% pokrycia hałdy lub transektu)' },
    inputs: [
      speciesInput('Gatunki synantropijne i nitrofilne', `Gatunki z pokryciem ${SURFACE}, np. Rubus idaeus 2, Aegopodium podagraria 0,5.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków synantropijnych i nitrofilnych w % – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak gatunków nitrofilnych', 'Zaznacz „Nie stwierdzono”, gdy na stanowisku nie ma gatunków synantropijnych i nitrofilnych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. malina właściwa Rubus idaeus 2%; podagrycznik pospolity Aegopodium podagraria <0,5%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = coverOf(i)
      if (c === undefined) return null
      return c === 'present' ? 'FV' : gradeNitrophilous6130(c)
    },
    explain: (i) => {
      const c = coverOf(i)
      if (c === undefined || c === 0) return null
      return c === 'present' ? 'Gatunki bez pokrycia – przyjęto „pojedyncze okazy”.' : `Pokrycie gatunków synantropijnych i nitrofilnych: ${pct(c)}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo pokrycie nie są puste.')
      const aliens = names.filter(isAlien6130)
      if (aliens.length) parts.push(`Gatunki obce wpisz we wskaźniku „Obce gatunki inwazyjne”: ${aliens.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      const t = num(i.total)
      if (list) return t !== undefined ? `${list} – łącznie ${pct(t)}` : list
      if (t !== undefined) return `Łącznie ${pct(t)}`
      return i.none === 'yes' ? 'Brak' : ''
    },
  },
  {
    id: 'expansive',
    label: 'Gatunki ekspansywne roślin zielnych',
    parameter: 'structure',
    description:
      'Lista gatunków ekspansywnych zajmujących >0,5% powierzchni, z przybliżonym procentem pokrycia hałdy. W dobrze wykształconych murawach galmanowych dominować powinny gatunki wchodzące w skład charakterystycznej kombinacji gatunkowej.',
    help: `Co wpisać: gatunki zielne o dużym pokryciu, z pokryciem ${SURFACE}. Do oceny liczą się tylko gatunki spoza typowej kombinacji florystycznej (dla regionu wybranego w „Stanowisku”) – dominujące gatunki typowe możesz wpisać jak w karcie, formularz je pominie. Sprawozdania: trzcinnik piaskowy, trzęślica modra, kostrzewa czerwona, rajgras wyniosły, gorysz pagórkowy, stokłosy, jeżyny.

Progi (tab. 2): brak lub występują spoza listy gatunków typowej kombinacji z pokryciem <10% – FV; spoza listy z pokryciem 10–30% – U1; spoza listy z pokryciem >30% – U2.

Jak liczy formularz: suma pokrycia gatunków spoza typowej kombinacji: poniżej 10% → FV, 10–30% (obie granice) → U1, powyżej 30% → U2; „nie stwierdzono” → FV. Wrzos na hałdach arsenowych (Złoty Stok) to gatunek typowy – w 2024 r. jego 25% w Skalisku nie obniżyło oceny; w 2018 r. ekspansję wrzosu w Górach Złotych oceniono jako XX. Karta z przewodnika (Miedzianka): mietlica 15% i kostrzewa owcza 25% – gatunki typowej kombinacji → FV. Progi zmieniono w 2015 r. (wcześniej 25–50% i >50%).

Ocena wybrana w polu ma pierwszeństwo przed sumą.`,
    thresholds: {
      FV: 'Brak lub występują spoza listy gatunków składających się na typową kombinację florystyczną – z pokryciem <10%',
      U1: 'Spoza listy gatunków składających się na typową kombinację florystyczną – występujące z pokryciem 10–30%',
      U2: 'Spoza listy gatunków składających się na typową kombinację florystyczną – występujące z pokryciem >30%',
    },
    inputs: [
      speciesInput('Gatunki ekspansywne', `Gatunki zielne o dużym pokryciu, z pokryciem ${SURFACE}, np. Calamagrostis epigejos 15.`),
      NONE_FIELD('Brak gatunków ekspansywnych', 'Zaznacz „Nie stwierdzono”, gdy na stanowisku nie ma gatunków ekspansywnych – wtedy wskaźnik to FV.'),
      {
        kind: 'select',
        name: 'choice',
        label: 'Ocena (opcjonalnie)',
        options: [{ value: '', label: '—' }, ...(['FV', 'U1', 'U2'] as const).map((g) => ({ value: g, label: g }))],
        help: 'Ocena ekspercka – ma pierwszeństwo przed sumą pokrycia (np. gdy wrzos albo mietlica dominują, a nie wiadomo, czy to degeneracja).',
      },
      noteInput('Opis (opcjonalnie)', 'np. Gatunki wchodzące w skład typowej kombinacji gatunkowej: mietlica pospolita 15%, kostrzewa owcza 25%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i, ctx) => {
      const g = String(i.choice ?? '')
      if (g === 'FV' || g === 'U1' || g === 'U2') return g
      const region = regionOf(ctx)
      const names = rowNames(i.species)
      if (!names.length) return i.none === 'yes' ? 'FV' : null
      const c = sumCover(i.species, (n) => !isCharacteristic6130(n, region))
      if (c === undefined) return 'FV' // same gatunki typowe
      return c === 'present' ? null : gradeExpansive6130(c)
    },
    explain: (i, ctx) => {
      if (i.choice) return null
      const region = regionOf(ctx)
      const names = distinct(rowNames(i.species))
      if (!names.length) return null
      const typical = names.filter((n) => isCharacteristic6130(n, region))
      const c = sumCover(i.species, (n) => !isCharacteristic6130(n, region))
      return [
        typical.length ? `Pominięte gatunki typowej kombinacji: ${typical.join(', ')}` : '',
        typeof c === 'number' ? `pokrycie gatunków spoza listy: ${pct(c)}` : c === 'present' ? 'gatunki spoza listy bez pokrycia – wpisz pokrycie albo wybierz ocenę' : 'spoza listy: brak',
      ]
        .filter(Boolean)
        .join('; ')
        .concat('.')
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && names.length) parts.push('Zaznaczono „Nie stwierdzono”, a lista nie jest pusta.')
      const aliens = names.filter(isAlien6130)
      if (aliens.length) parts.push(`Gatunki obce wpisz we wskaźniku „Obce gatunki inwazyjne”: ${aliens.join(', ')}.`)
      const woody = names.filter((n) => isWoody6130(n) && !isAlien6130(n))
      if (woody.length) parts.push(`Drzewa i krzewy wpisz we wskaźniku „Występowanie krzewów i podrostu drzew”: ${woody.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      return list || (i.none === 'yes' ? 'Brak' : '')
    },
  },
  {
    id: 'shrubs',
    label: 'Występowanie krzewów i podrostu drzew',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków drzew i krzewów zajmujących >0,5% powierzchni, z przybliżonym procentem pokrycia hałdy. Występowanie krzewów i siewek drzew na hałdzie określa się w procentach pokrycia z podaniem głównych gatunków dominujących.',
    help: `Co wpisać: drzewa i krzewy w płatach muraw (siewki, podrost, krzewy), z pokryciem ${SURFACE}. Łączne pokrycie wpisz wprost albo zostaw – formularz zsumuje listę. Najczęściej (tab. 1, sprawozdania): głóg jednoszyjkowy, róże, jesion, jarząb pospolity, brzoza brodawkowata, topola osika, sosna zwyczajna, klon jawor, wierzba iwa, kruszyna. Obce drzewa (czeremcha amerykańska, robinia, dąb czerwony, daglezja) wpisz też we wskaźniku „Obce gatunki inwazyjne”.

Progi (tab. 2): udział krzewów i podrostu drzew nie przekracza 10% – FV; osiąga 10–30% – U1; wyższy niż 30% – U2. Granicę 10% formularz liczy do FV („nie przekracza”), 30% – do U1.

Karta z przewodnika (Miedzianka): jawor 5%, brzoza 20%, dąb bezszypułkowy, osika i jarząb po <0,5% → ok. 26,5% → U1. Sprawozdanie 2024: najgorzej oceniany obok obcych – U2 przy pokryciu od ponad 30% do ponad 85%; po usunięciu drzew (Armeria, Hałda Popłuczanka) ocena wraca. Nazwa w sprawozdaniach: „Ekspansja krzewów i podrostu drzew”.

Wskaźnik kardynalny.`,
    thresholds: { FV: 'Udział krzewów i podrostu drzew nie przekracza 10%', U1: 'Udział krzewów i podrostu drzew osiąga 10–30%', U2: 'Udział krzewów i podrostu drzew wyższy niż 30%' },
    inputs: [
      speciesInput('Drzewa i krzewy', `Drzewa i krzewy z pokryciem ${SURFACE}, np. Betula pendula 20, Acer pseudoplatanus 5.`),
      totalInput('Łączne pokrycie drzew i krzewów (opcjonalnie)', 'Łączny udział krzewów i podrostu drzew w % – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak drzew i krzewów', 'Zaznacz „Nie stwierdzono”, gdy w płatach nie ma drzew ani krzewów – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. klon jawor Acer pseudoplatanus 5%; brzoza brodawkowata Betula pendula 20%…', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = coverOf(i)
      return typeof c === 'number' ? gradeShrubs6130(c) : null
    },
    explain: (i) => {
      const c = coverOf(i)
      if (c === 'present') return 'Drzewa i krzewy bez pokrycia – wpisz pokrycie gatunków albo łączne.'
      return typeof c === 'number' && c > 0 ? `Udział krzewów i podrostu drzew: ${pct(c)}.` : null
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo pokrycie nie są puste.')
      const herbs = names.filter((n) => findSpecies6130(n) && !isWoody6130(n))
      if (herbs.length) parts.push(`To nie drzewa ani krzewy: ${herbs.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      const t = num(i.total)
      if (list) return t !== undefined ? `${list} – łącznie ${pct(t)}` : list
      if (t !== undefined) return `Łącznie ${pct(t)}`
      return i.none === 'yes' ? 'Brak' : ''
    },
  },
  {
    id: 'grazing',
    label: 'Ślady wypasu',
    parameter: 'structure',
    description:
      'Obecność, intensywność lub brak wypasu – opisowo. W sezonie wegetacyjnym na wypasanych powierzchniach łatwy do zaobserwowania dzięki śladom bytności krów, owiec lub kóz (ślady, odchody) lub zgryzionym kępom traw i bylin.',
    help: `Co wybrać: czy murawa jest wypasana, a jeśli nie – czy utrzymuje się sama, czy zarasta.

Progi (tab. 2): murawa wypasana regularnie lub utrzymuje się bez wypasu – FV; wypas nieregularny (pojedyncze krzewy i młode drzewa) lub koszenie – U1; brak wypasu (krzewy i młode drzewa powyżej 0,5 m), pojawiają się procesy sukcesji w kierunku zbiorowisk leśno-zaroślowych – U2.

Praktyka: na większości hałd wypasu nie ma i nie będzie (metale ciężkie, strome i osypujące się stoki), a murawy utrzymuje toksyczność i płytka gleba. W 2024 r. „brak wypasu, ale murawy utrzymują się samoczynnie” → FV, „brak wypasu, lecz murawy podlegają sukcesji” → U2. Sprawozdania 2013–2014 i 2015–2018 proponowały rezygnację z tego wskaźnika – nie weszło, w 2024 r. nadal oceniany. Karta z przewodnika (Miedzianka): „brak wypasu” → U2.`,
    thresholds: thresholdsOf(GRAZING),
    inputs: [
      selectInput('Wypas', GRAZING),
      noteInput('Opis (opcjonalnie)', 'np. Brak wypasu', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(GRAZING)),
    describe: (i) => note(i) || labelOf(GRAZING, i.choice),
  },
  {
    id: 'destruction',
    label: 'Niszczenie i zaśmiecanie hałd',
    parameter: 'structure',
    cardinal: true,
    description:
      'Opisowo – stopień zniszczenia i jego przyczyna. Murawy galmanowe zajmują powierzchnie traktowane jako nieużytki: wybieranie hałd na kruszywo budowlane i podsypkowe, nielegalne wysypiska śmieci, wydeptywanie i palenie ognisk.',
    help: `Co wybrać: najpoważniejszy rodzaj zniszczeń na stanowisku. Skalę (np. „pobór kruszywa na ok. 10% hałdy”) opisz w polu opisu.

Progi (tab. 2): brak – FV; sporadyczne zaśmiecanie, wydeptywanie, pojedyncze ślady ognisk w pobliżu stanowisk – U1; fizyczne niszczenie stanowisk wskutek działalności człowieka (pobór kruszywa z hałd, pożary wskutek palenia ognisk, nielegalne wysypiska śmieci) – U2.

Rozjazd metodyki z praktyką: wg tab. 2 każdy pobór kruszywa to U2, a w karcie z przewodnika (Miedzianka) „eksploatacja kruszywa na ok. 10% hałdy” ekspert ocenił na U1; w 2024 r. „ślady pozyskiwania kruszywa” (Ciechanowice) i trasy crossowe – też U1, U2 dopiero przy zniszczeniu części stanowiska (Złoty Stok – poszerzenie parkingu). Formularz podpowiada wg tab. 2; jeśli oceniasz łagodniej, zostaw swoją ocenę i uzasadnij skalę w opisie – karta pokaże rozjazd z progiem.

Wskaźnik kardynalny od publikacji metodyki w 2015 r. (sprawozdanie 2015–2018 proponowało zdjęcie go z kardynalnych – nie weszło). Nazwa w sprawozdaniach: „Zniszczenia mechaniczne”.`,
    thresholds: thresholdsOf(DESTRUCTION),
    inputs: [
      selectInput('Niszczenie i zaśmiecanie', DESTRUCTION),
      noteInput('Opis (opcjonalnie)', 'np. Eksploatacja kruszywa na około 10% hałdy', 'Stopień zniszczenia i przyczyna – trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(DESTRUCTION)),
    describe: (i) => note(i) || labelOf(DESTRUCTION, i.choice),
  },
]

// ---------- pola stanowiska ----------

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Miedzianka',
    help: `Nazwa stanowiska – zwykle od najbliższej miejscowości albo nazwy hałdy (Miedzianka, Storczykowa Hałda, Hałda Popłuczanka). Przy kilku stanowiskach w jednym miejscu dopisz numer („Storczykowa Hałda 2”).

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tej samej hałdy.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. badawcze',
    help: `Typ stanowiska w sieci monitoringu: badawcze albo referencyjne (tak jak w karcie z przewodnika: „Badawcze”).

Dlaczego: siedlisko jest tak rzadkie, że monitoringiem obejmuje się wszystkie znane stanowiska, także niewielkie i zdegradowane.`,
  },
  {
    kind: 'select',
    name: 'region',
    label: 'Region (zespół stanowisk)',
    options: [{ value: '', label: '—' }, ...REGION_OPTIONS],
    required: true,
    hint: 'Od regionu zależy lista gatunków typowych (tab. 1, pkt b–d).',
    help: `W Polsce znane są trzy zespoły stanowisk muraw galmanowych, a każdy ma własne gatunki charakterystycznej kombinacji florystycznej (tab. 1): Rudawy Janowickie (hałdy polimetaliczne: mietlica pospolita, goździk kropkowany, skrzyp polny, rozchodnik wielki, szczaw cienkolistny), Wyżyna Olkuska z Garbem Tarnogórskim (hałdy cynkowo-ołowiowe: pleszczotka górska, goździk kartuzek, łyszczec baldachogronowy, pięciornik piaskowy) i hałdy arsenowe koło Złotego Stoku (chaber driakiewnik, centuria, goryczuszka Wettsteina, wrzos). Gatunki z pkt a liczą się wszędzie.

Dlaczego: wrzos na hałdzie arsenowej to gatunek typowy, a na hałdzie olkuskiej – zwykły gatunek ekspansywny. Od wyboru zależą podpowiedzi „Charakterystycznej kombinacji florystycznej” i „Gatunków ekspansywnych”. Przy innym stanowisku (np. nowe w Sudetach) wybierz „Inne” – liczą się gatunki ze wszystkich list.`,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. zbiorowisko Silene vulgaris-Agrostis capillaris',
    help: `Zbiorowiska roślinne na stanowisku: Armerietum halleri (Wyżyna Olkuska) albo zbiorowiska o niejasnej pozycji syntaksonomicznej z rzędu Violetalia calaminariae, np. zbiorowisko Silene vulgaris-Agrostis capillaris (Rudawy Janowickie).

Uwaga: hałdy współczesne (intensywne górnictwo miedzi) i murawy na starych, rozmytych hałdach z niską zawartością metali, z wypasem i nawożeniem, nawiązujące do pastwisk, nie są siedliskiem 6130.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Hałdy, płaty muraw, dominanty, sukcesja, zniszczenia, użytkowanie, sąsiedztwo.',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• hałdy: pochodzenie (rudy cynku i ołowiu, polimetaliczne, arsenowe), wiek, stan (rozbierane, zalesione, rozmyte);
• płaty muraw: liczba, rozmieszczenie, dominanty, zróżnicowanie (np. gatunki łąkowe na żyźniejszym podłożu);
• sukcesja: drzewa i krzewy, nagromadzenie materii organicznej;
• zniszczenia i użytkowanie: pobór kruszywa, śmieci, ogniska, wypas;
• sąsiedztwo: łąki 6510, lasy, zabudowa.
Za stanowisko uznaje się grupę wyodrębnionych płatów muraw galmanowych leżących w odległościach nieprzekraczających 50 m, niezależnie od ich rozmieszczenia. W opisie notuje się nawet niewielkie płaty (powyżej 25 m²).`,
  },
  {
    kind: 'text',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    required: true,
    placeholder: 'np. 0,002',
    help: 'Łączna powierzchnia płatów siedliska na stanowisku, w hektarach. Zwykle bardzo mała: 1–10 arów (0,01–0,1 ha); w karcie z przewodnika 0,002 ha, w 2024 r. od 0,001 ha (Skalisko) do 4,5 ha (Armeria).',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    label: 'Obszary chronione (z pominięciem obszaru Natura 2000), na których znajduje się stanowisko',
    hint: 'Np. „Użytek ekologiczny Storczykowa Hałda”, „Rudawski Park Krajobrazowy”. Brak – „Nie chronione”.',
    help: `Formy ochrony przyrody obejmujące stanowisko poza obszarem Natura 2000 (ten wpisz w osobnym polu): użytki ekologiczne (Storczykowa Hałda, Pleszczotka, Hałda Popłuczanka), parki krajobrazowe (Rudawski, Śnieżnicki), rezerwaty. Brak – „Nie chronione”.

Dlaczego: większość hałd to nieużytki na gruntach prywatnych – forma ochrony decyduje, czy da się je zabezpieczyć przed rozbieraniem i zalesieniem.`,
  }),
  {
    kind: 'text',
    name: 'natura2000',
    label: 'Nazwa obszaru Natura 2000',
    placeholder: 'np. PLH020011 Rudawy Janowickie',
    help: 'Kod i nazwa obszaru Natura 2000, w którym leży stanowisko (np. PLH020011 Rudawy Janowickie, PLH120091 Armeria, PLH240003 Podziemia Tarnogórsko-Bytomskie). Poza siecią – „brak”.',
  },
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. własność prywatna',
    help: `Kto zarządza terenem: właściciele prywatni, gmina, Lasy Państwowe, spółki górnicze.

Dlaczego: hałdy na gruntach prywatnych bywają rozbierane albo ogradzane – ochrona czynna wymaga porozumienia z właścicielem.`,
  },
  {
    kind: 'text',
    name: 'coords',
    label: 'Współrzędne geograficzne',
    wide: true,
    required: true,
    placeholder: 'np. N 50°52′ – 50°52′; E 15°56′ – 15°56′',
    help: `Współrzędne geograficzne (GPS, WGS84) stanowiska – środka albo zakres obejmujący badane płaty (jak w karcie z przewodnika: „N 50°52′…–50°52′…, E 15°56′…–15°56′…”). Przy transekcie – początek i koniec.

Dlaczego: płaty są małe i rozproszone, a hałdy znikają – bez współrzędnych za kilka lat nikt nie trafi w te same płaty.`,
  },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    placeholder: 'np. 450 m długości albo 3 powierzchnie w promieniu 50 m',
    hint: 'Transekt o stałej długości zwykle niemożliwy – 3 powierzchnie w promieniu ok. 50 m.',
    help: `Wskaźniki ocenia się dla trzech powierzchni w obrębie zespołu hałd (w promieniu ok. 50 m) albo na transekcie poprowadzonym tak, by badane powierzchnie leżały ok. 50 m od siebie. Wpisz, co zrobiono: długość transektu („450 m długości”, jak w karcie z przewodnika) albo „3 powierzchnie w promieniu 50 m”.

Dlaczego: rozmieszczenie płatów jest przypadkowe (zależy od hałd), więc przewodnik nie narzuca wymiarów – ważne, by następny obserwator zrobił to samo.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    help: 'Wysokość nad poziomem morza stanowiska (albo zakres), z GPS albo mapy. Wyżyna Olkuska ok. 300–400 m n.p.m., Rudawy Janowickie i Złoty Stok ok. 400–600 m (karta z przewodnika: 480–520 m).',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 07.07.2013',
    required: true,
    hint: 'Optimum fenologiczne – na południu Polski zwykle czerwiec (maj–wrzesień).',
    help: `Dzień badań terenowych. Przewodnik: fenologiczne optimum fitocenoz murawowych, w południowej Polsce zwykle czerwiec; sprawozdanie 2024 podaje okres maj–wrzesień (badania 18.05–28.08). Na podłożach zasobnych w węglan wapnia badanie powtarza się dwa–trzy razy w roku na oznakowanych powierzchniach: początek maja (terofity, wcześnie kwitnące storczykowate), koniec czerwca (optimum) i przełom sierpnia i września (goryczki, późne storczykowate) – zdjęcie wynikowe łączy wszystkie aspekty, a pozostałe daty wpisz w uwagach.

Stanowiska kontroluje się co 3 lata (duża dynamika siedliska i wrażliwość na zmiany antropogeniczne).`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 5 && m <= 9 ? null : 'Termin poza sezonem wegetacyjnym (maj–wrzesień). Gatunków nie da się rzetelnie ocenić – opisz to w uwagach.'
    },
  },
  pickField(methodology7120.siteFields, 'observer', {
    help: `Imię i nazwisko eksperta lokalnego, który wykonał obserwację i odpowiada za dane.

Dlaczego: ocena stanu ochrony zawiera elementy oceny eksperckiej – trzeba wiedzieć, kogo zapytać o uzasadnienie.`,
  }),
  {
    kind: 'text',
    name: 'additionalExperts',
    label: 'Dodatkowi eksperci',
    placeholder: 'np. —',
    help: 'Osoby, które brały udział w badaniu poza ekspertem lokalnym (np. lichenolog oznaczający chrobotki). Brak – zostaw puste albo wpisz „—”.',
  },
]

// ---------- zdjęcia fitosocjologiczne: 3 × 25 m² ----------

const r7120 = methodology7120.releves.fields
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia. Trzy zdjęcia na trzech badanych powierzchniach (w promieniu ok. 50 m albo na transekcie).' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach.' }),
  pickField(r7120, 'area', {
    defaultValue: 25,
    help: 'Powierzchnia zdjęcia w m² – optymalnie 25 m². Gdy płat jest mniejszy albo siedlisko ograniczone sukcesją, można zmniejszyć, ale nie poniżej 10 m² (Chytrý i Otýpková 2003). W karcie z przewodnika: 10 i 2 × 25 m².',
    warn: (v) => {
      const a = num(v)
      return a !== undefined && a < 10 ? 'Poniżej 10 m² – przewodnik nie dopuszcza mniejszych zdjęć. Opisz powód w uwagach.' : null
    },
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach – stoki hałd bywają strome (karta z przewodnika: 20–25°). Płasko – 0.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, SW). Dla powierzchni płaskiej wpisz „płasko” albo „brak”.' }),
  layerField('coverA', 'Warstwa A – drzewa: procent powierzchni zdjęcia pod koronami drzew. W murawie zwykle brak.\n\nDlaczego: drzewa to zaawansowana sukcesja – główne zagrożenie 6130.'),
  layerField('coverB', 'Warstwa B – krzewy i podrost drzew: procent powierzchni zdjęcia. W dobrze zachowanej murawie brak albo pojedyncze.\n\nDlaczego: podrost brzozy, osiki i sosny to pierwszy etap zarastania hałdy.'),
  layerField('coverC', 'Warstwa C – zielna: procent powierzchni zdjęcia pokryty przez murawę (w karcie z przewodnika 60–90%).\n\nDlaczego: między roślinami powinno być widać podłoże hałdy – zbyt zwarta ruń to sygnał eutrofizacji.'),
  layerField('coverD', 'Warstwa D – mchy i porosty: procent powierzchni zdjęcia (w karcie z przewodnika 5–10%). Chrobotki (Cladonia) należą do gatunków typowych 6130.\n\nDlaczego: porosty i mszaki to ważna część flory muraw galmanowych – w zdjęciu uwzględnia się je obowiązkowo.'),
  layerField('heightA', 'Warstwa A – typowa wysokość drzew, w metrach.'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów i podrostu, w metrach.'),
  layerField('heightC', 'Warstwa C – typowa wysokość runi, w centymetrach (murawy do 30 cm, wyjątkowo 50; w karcie z przewodnika 20–30 cm).'),
  layerField('heightD', 'Warstwa D – wysokość mchów i porostów, w centymetrach (zwykle ok. 1 cm).'),
  pickField(r7120, 'unit', {
    placeholder: 'np. zbiorowisko Silene vulgaris-Agrostis capillaris',
    help: 'Jednostka fitosocjologiczna zdjęcia, np. Armerietum halleri albo zbiorowisko Silene vulgaris-Agrostis capillaris (rząd Violetalia calaminariae).',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w poletku z ilościowością w skali Braun-Blanqueta (r, +, 1–5), łącznie z mszakami i – jeśli to możliwe – porostami (warstwa D). Nomenklatura: rośliny naczyniowe wg Mirka i in. (2002), mszaki wg Ochyry i in. (2003), porosty wg Fałtynowicza (2003). Warstwa podpowiada się sama po wyborze gatunku.',
  }),
]

export const methodology6130: Methodology = {
  code: '6130',
  name: 'Murawy galmanowe (Violetalia calaminariae)',
  source:
    'Świerkosz K., Reczyńska K. 2015, 6130 Murawy galmanowe (Violetalia calaminariae), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. IV, GIOŚ, s. 167–181 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2013–2014, 2015–2018 i 2023–2025.',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj 3 zdjęcia fitosocjologiczne po 25 m² (gdy płat jest mniejszy – nie mniej niż 10 m²) na trzech badanych powierzchniach. Ilościowość w skali Braun-Blanqueta; uwzględnij mszaki i porosty (warstwa D).',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Realne możliwości zachowania właściwego stanu siedliska oraz poprawy stanu niewłaściwego, w obliczu istniejących i potencjalnych zagrożeń, a także innych informacji, np. własnych wcześniejszych danych i prowadzonych działań ochronnych. W opisie – potencjalne zabiegi ochronne.',
    help: `Weź pod uwagę: sukcesję (brzoza, osika, sosna, jawor), zalesianie hałd w ramach rekultywacji, rozbieranie hałd na kruszywo, zapadliska pogórnicze, gatunki obce w sąsiedztwie (rdestowce, nawłocie, czeremcha amerykańska), wysypiska, ogniska i motocykle crossowe, a po stronie plusów – formę ochrony (użytek ekologiczny) i ochronę czynną (wycinka drzew, usuwanie materii organicznej, gatunków obcych, ekstensywny wypas, koszenie).

Przewodnik (pkt 5): siedlisko bezwzględnie wymaga ochrony czynnej; zalesione hałdy można odlesić i usunąć pasami nagromadzoną materię organiczną. Sprawozdanie 2024: wycinka drzew i gatunków obcych (Armeria, Hałda Popłuczanka) dała wymierną poprawę; na gruntach prywatnych bez porozumienia z właścicielem perspektywy bywają nieznane (XX).`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Perspektywy ochrony siedliska nie zadowalające – obserwowane płaty wymagają pilnego podjęcia zabiegów ochrony czynnej',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A03', name: 'Koszenie / ścinanie trawy' },
    { code: 'A03.03', name: 'Zaniechanie / brak koszenia' },
    { code: 'A04', name: 'Wypas' },
    { code: 'A04.02', name: 'Wypas nieintensywny' },
    { code: 'A04.03', name: 'Zarzucenie pasterstwa, brak wypasu' },
    { code: 'A08', name: 'Nawożenie' },
    { code: 'B01', name: 'Zalesianie terenów otwartych' },
    { code: 'B01.02', name: 'Sztuczne nasadzenia na terenach otwartych (drzewa nierodzime)' },
    { code: 'C01', name: 'Kopalnie, kamieniołomy, wydobywanie' },
    { code: 'C01.07', name: 'Inna działalność górnicza lub wydobywcza' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D01.03', name: 'Parkingi samochodowe i miejsca parkingowe' },
    { code: 'E01.03', name: 'Zabudowa rozproszona' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'E03.01', name: 'Pozbywanie się odpadów z gospodarstw domowych / obiektów rekreacyjnych' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
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
    { code: 'L05', name: 'Zapadnięcie się terenu, osuwisko' },
    { code: 'U', name: 'Nieznane zagrożenie lub nacisk' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: [
    ...methodology7120.otherFields.flatMap((f): FieldDef[] => {
      if (f.name === 'otherValues')
        return [
          {
            ...f,
            hint: 'Np. w sąsiedztwie siedlisko 6510; rzadkie metalofity.',
            help: 'Wartości przyrodnicze stanowiska poza samą murawą: sąsiednie siedliska (6510 łąki świeże, 6230 murawy bliźniczkowe, 6120 murawy napiaskowe), rzadkie i chronione gatunki (pleszczotka górska, storczykowate, goryczuszki), zabytki dawnego górnictwa. Brak informacji – „Nie stwierdzono”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            label: 'Wykonywane działania ochronne',
            help: 'Jakie działania ochronne wykonano i z jakim skutkiem: wycinka drzew i krzewów, usuwanie gatunków obcych, usuwanie materii organicznej, koszenie, wypas, ogrodzenie. Brak działań – „Nie są prowadzone”.',
          },
          {
            kind: 'textarea',
            name: 'proposals',
            label: 'Propozycje wprowadzenia działań ochronnych',
            rows: 4,
            hint: 'Np. wznowienie wypasu, odlesienie hałd, usunięcie materii organicznej i gatunków obcych.',
            help: 'Jakie działania proponujesz, konkretnie: objęcie hałd ochroną (użytek ekologiczny, stanowisko dokumentacyjne), wycinka drzew i krzewów, usunięcie pasami nagromadzonej materii organicznej, usuwanie gatunków obcych (rdestowce, nawłocie, czeremcha amerykańska), okazjonalny ekstensywny wypas albo koszenie z usuwaniem biomasy, zakaz poboru kruszywa. Brak – „Brak”.',
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
            help: 'Karta z przewodnika podaje przy ocenie ogólnej powierzchnię siedliska o różnym stanie zachowania na stanowisku (Miedzianka: FV 10%, U1 30%, U2 60%). Trzy liczby powinny dać razem 100%.',
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
            help: `${f.help ?? ''}\n\nDla 6130 zapisz tu także: rok, czy monitoring jest wymagany i dlaczego, inne obserwacje, uwagi metodyczne, daty wcześniejszych wizyt (aspekty wiosenny i późnoletni) oraz wątpliwości co do zaliczenia płatu do 6130 (hałdy współczesne, murawy pastwiskowe na rozmytych hałdach).`.trim(),
          },
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_6130.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer6130(s) })),
  speciesInfo: (name) => {
    const e = findSpecies6130(name)
    if (!e) return undefined
    if (e.group === 'characteristic' && e.regions !== 'all' && e.regions)
      return `${GROUP_LABELS_6130.characteristic} – ${e.regions.map((r) => REGION_LABELS_6130[r].split(' (')[0]).join(', ')}`
    return GROUP_LABELS_6130[e.group]
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator6130 = (id: string): IndicatorDef => {
  const i = methodology6130.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 6130`)
  return i
}
