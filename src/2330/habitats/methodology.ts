// Metodyka 2330 (wydmy śródlądowe z murawami napiaskowymi) jako dane. Źródło: Kulpiński K., Tyc A. 2012, „2330 Wydmy
// śródlądowe z murawami napiaskowymi” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny,
// cz. II, GIOŚ, s. 102–113 (tab. 1 i 2), z praktyką oceny ze sprawozdań z monitoringu 2009–2011, 2016–2018 i 2023–2025.
// Siedlisko nieleśne, inicjalne, utrzymywane przez wiatr i zaburzenia: transekt 200×10 m (20 arów), 3 zdjęcia
// fitosocjologiczne 5×5 m (na obu końcach i w środku transektu). Z modułu leśnego brane są tylko klocki generyczne.
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_2330,
  SPECIES_2330,
  defaultLayer2330,
  findSpecies2330,
  isAlien2330,
  isCharacteristic2330,
  isExpansive2330,
  isLater2330,
  isStable6120,
  speciesKey2330,
} from './species'

// ---------- progi liczbowe (tab. 2) ----------

/** Gatunki charakterystyczne (liczba z tab. 1): 4 i więcej FV, 2–3 U1, 1 lub brak U2. */
export const gradeCharacteristic2330 = (n: number): Grade => (n >= 4 ? 'FV' : n >= 2 ? 'U1' : 'U2')

/**
 * Ekspansja krzewów i podrostu drzew (pokrycie na transekcie): „do 40%” FV, „40–60%” U1, „powyżej 60%” U2.
 * Granica 40% należy do U1 – tak oceniono ją w karcie z przewodnika (Chechło 2: 40% → U1); 60% też U1.
 */
export const gradeShrubs2330 = (p: number): Grade => (p < 40 ? 'FV' : p <= 60 ? 'U1' : 'U2')

/**
 * Gatunki ekspansywne (łączne pokrycie): „do 1%” FV, „1–10%” U1, „powyżej 10%” U2.
 * 1% to jeszcze FV (karta Chechło 2: trzcinnik „pokrycie do 1%” → FV), 10% – U1.
 */
export const gradeExpansive2330 = (p: number): Grade => (p <= 1 ? 'FV' : p <= 10 ? 'U1' : 'U2')

/**
 * Obce gatunki inwazyjne: brak FV; jeden gatunek z pokryciem do 5% transektu U1;
 * pokrycie powyżej 5% albo więcej niż jeden gatunek (niezależnie od pokrycia) U2.
 */
export function gradeAliens2330(count: number, cover?: number): Grade {
  if (count <= 0) return 'FV'
  if (count > 1) return 'U2'
  return cover !== undefined && cover > 5 ? 'U2' : 'U1'
}

/**
 * Procent powierzchni transektu zajęty przez siedlisko: „powyżej 30%” FV, „10–30%” U1, „do 10%” U2.
 * 10% liczone do U2 (tab. 2 „do 10%”; sprawozdanie 2024: U2 „nie przekraczało 10%”), 30% do U1.
 */
export const gradeShare2330 = (p: number): Grade => (p > 30 ? 'FV' : p > 10 ? 'U1' : 'U2')

/** Gatunki muraw kserotermicznych/wrzosowisk: 1 lub brak FV, 2 lub 3 U1, powyżej 3 U2. */
export const gradeLater2330 = (n: number): Grade => (n <= 1 ? 'FV' : n <= 3 ? 'U1' : 'U2')

/**
 * Propozycja ze sprawozdania 2016–2018 (NIE przyjęta w metodyce ani w 2024): udział odsłoniętego luźnego piasku
 * na powierzchni siedliska >60% FV, 10–60% U1, <10% U2. Formularz pokazuje ją tylko jako wskazówkę.
 */
export const gradeBareSand2330 = (p: number): Grade => (p > 60 ? 'FV' : p >= 10 ? 'U1' : 'U2')

const pct = (v: number) => `${plNum(v)}%`
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey2330(n), n])).values()]
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
  { value: 'smallDecrease', label: 'Niewielki spadek powierzchni siedliska (maksymalnie o 10%)', grade: 'U1' },
  { value: 'clearDecrease', label: 'Spadek powierzchni siedliska o więcej niż 10% w porównaniu z wcześniejszymi badaniami lub danymi w literaturze', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const EOLIAN: GradedOption[] = [
  { value: 'active', label: 'Aktywne procesy eoliczne (piasek nawiany na kępy traw, pagórki fitogeniczne)', grade: 'FV' },
  { value: 'traces', label: 'Ślady dawnych procesów eolicznych (np. dawne pagórki fitogeniczne, mniejsze wydmy zarośnięte krzewami)', grade: 'U1' },
  { value: 'fixed', label: 'Tylko dobrze utrwalone, np. duże wydmy, zarośnięte w większości lasem', grade: 'U2' },
]
const DISTORTIONS: GradedOption[] = [
  { value: 'small', label: 'Niewielka liczba kolein i ścieżek, brak eksploatacji piasku, śladowe zaśmiecenie', grade: 'FV' },
  { value: 'medium', label: 'Nieliczne drogi lub duża ilość kolein i ścieżek; śladowa eksploatacja piasku; średnie zaśmiecenie', grade: 'U1' },
  {
    value: 'severe',
    label:
      'Większość niezakrzaczonej powierzchni transektu pozbawiona pokrywy roślinnej na skutek działań człowieka lub znaczna skala eksploatacji piasku; bardzo duże zaśmiecenie (w tym dzikie wysypiska śmieci)',
    grade: 'U2',
  },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

/** Select niewymagany – gdy wpiszesz liczbę, wystarczy liczba. */
const optionalSelect = (label: string, options: GradedOption[], help?: string): FieldDef => ({ ...selectInput(label, options, help), required: false })

const noteInput = (label: string, placeholder: string, help: string): FieldDef => ({ kind: 'textarea', name: 'note', label, rows: 2, placeholder, help })
const note = (i: InputValues) => String(i.note ?? '').trim()

// ---------- liczenie z list ----------

/** Gatunki charakterystyczne z tab. 1 na liście (synonimy jako jeden gatunek). */
const characteristicOnList = (i: InputValues) => distinct(rowNames(i.species).filter(isCharacteristic2330))

/** Liczba gatunków charakterystycznych: wpisana wprost ma pierwszeństwo, inaczej liczona z listy. */
function characteristicCount(i: InputValues): { n: number; from: 'count' | 'list' } | null {
  const c = num(i.count)
  if (c !== undefined) return { n: c, from: 'count' }
  return rowNames(i.species).length ? { n: characteristicOnList(i).length, from: 'list' } : null
}

/** Gatunki „murawy/wrzosowiska” na liście: wszystko poza gatunkami 2330 i muraw 6120 (tab. 1 je wyklucza). */
const laterOnList = (i: InputValues) => distinct(rowNames(i.species).filter((n) => !isStable6120(n) && !isCharacteristic2330(n)))

function laterCount(i: InputValues): { n: number; from: 'count' | 'list' } | null {
  const c = num(i.count)
  if (c !== undefined) return { n: c, from: 'count' }
  return rowNames(i.species).length || i.none === 'yes' ? { n: laterOnList(i).length, from: 'list' } : null
}

/** Pokrycie z pola „łącznie” albo suma z listy. */
const coverOf = (i: InputValues) => num(i.total) ?? sumCover(i.species)

function aliensFromInputs(i: InputValues): Grade | null {
  const names = distinct(rowNames(i.species))
  const count = num(i.count) ?? (names.length || i.none === 'yes' ? names.length : undefined)
  if (count === undefined) return null
  return gradeAliens2330(count, coverOf(i))
}

// ---------- wskaźniki ----------

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

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description: 'Zmiana powierzchni płatów siedliska na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury.',
    help: `Co wybrać: jak zmieniła się powierzchnia inicjalnych muraw napiaskowych na stanowisku od poprzedniego badania (albo względem danych z literatury, ortofotomap). Powierzchnię w hektarach możesz wpisać obok – trafi do pola „wartość”.

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; niewielki spadek, maksymalnie o 10% – U1; spadek o więcej niż 10% – U2. Przy pierwszym badaniu (nie ma z czym porównać) wybierz „Brak danych do porównania” (XX) albo oceń ekspercko.

Dlaczego: powierzchnię siedliska zjada przede wszystkim zarastanie (nasadzenia sosny, nalot brzozy) i rozjeżdżanie. Sprawozdanie 2024: spadek powierzchni głównie przez zarastanie i ustabilizowanie wydm; stanowiska bez procesów eolicznych wskazane do usunięcia dostawały U2.`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się',
      U1: 'Niewielki spadek powierzchni siedliska (maksymalnie o 10%)',
      U2: 'Spadek powierzchni siedliska o więcej niż 10% w porównaniu z wcześniejszymi badaniami lub danymi w literaturze',
    },
    inputs: [
      optionalSelect('Zmiana powierzchni', AREA, 'Puste, gdy oceniasz ekspercko (np. pierwsze badanie).'),
      { kind: 'number', name: 'areaHa', label: 'Powierzchnia (opcjonalnie)', unit: 'ha', min: 0, help: 'Powierzchnia płatów siedliska na stanowisku, jeśli ją znasz – trafi do pola „wartość”. W sprawozdaniu 2024 od 0,1 ha do 360 ha (Pustynia Błędowska), najczęściej 1–5 ha.' },
      noteInput('Opis (opcjonalnie)', 'np. powierzchnia stabilna, zarastanie od strony boru', 'Krótki opis zmian, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => {
      const ha = num(i.areaHa)
      return [ha !== undefined ? `${plNum(ha)} ha` : '', note(i) || (i.choice ? labelOf(AREA, i.choice).toLowerCase() : '')].filter(Boolean).join('; ')
    },
  },
  {
    id: 'species',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Liczba gatunków charakterystycznych dla siedliska stwierdzonych na transekcie (lista z tab. 1 przewodnika). Wskaźnik ocenia bogactwo gatunkowe, nie obfitość – pokrycie bardzo zależy od zwarcia darni, a udziału porostów na całym transekcie praktycznie nie da się oszacować.',
    help: `Co wpisać: gatunki charakterystyczne stwierdzone na transekcie. Formularz sam policzy te z listy tab. 1 (synonimy jako jeden gatunek). Jeśli liczysz inaczej niż formularz (np. tak jak w karcie z przewodnika), wpisz liczbę wprost – ma pierwszeństwo.

Lista tab. 1 (12 gatunków): szczotlicha siwa Corynephorus canescens, sporek wiosenny Spergula morisonii (= S. vernalis), chroszcz nagołodygowy Teesdalia nudicaulis, przetacznik Dillena Veronica dillenii, mietlica piaskowa Agrostis vinealis; porosty: płucnica kolczasta Cetraria aculeata, chrobotek Floerkego Cladonia floerkeana, chrobotek łagodny C. arbuscula subsp. mitis, chróścik karłowaty Stereocaulon condensatum; z rzędu Corynephoretalia: jasieniec piaskowy Jasione montana, czerwiec trwały Scleranthus perennis, płonnik włosisty Polytrichum piliferum.

Progi: 4 i więcej – FV; 2–3 – U1; 1 lub brak – U2.

Wskaźnik kardynalny. Termin ma znaczenie: terofity wiosenne (sporek, chroszcz, przetacznik Dillena) widać tylko w maju i na początku czerwca – później zasychają i gatunków wychodzi mniej. Sprawozdanie 2024: zwykle 4–10 gatunków na stanowiskach FV.`,
    thresholds: { FV: '4 i więcej', U1: '2–3', U2: '1 lub brak' },
    inputs: [
      speciesInput('Gatunki charakterystyczne na transekcie', 'Gatunki charakterystyczne stwierdzone na transekcie (pokrycie opcjonalne). Liczą się te z listy tab. 1 – inne zostaną pokazane w ostrzeżeniu.'),
      { kind: 'number', name: 'count', label: 'Liczba gatunków (opcjonalnie)', min: 0, help: 'Liczba gatunków charakterystycznych wpisana wprost. Ma pierwszeństwo przed liczeniem z listy – użyj, gdy liczysz inaczej niż formularz (np. „Cladonia sp.” jako chrobotki z listy).' },
      noteInput('Opis (opcjonalnie)', 'np. Pięć gatunków: szczotlicha siwa…', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = characteristicCount(i)
      return c ? gradeCharacteristic2330(c.n) : null
    },
    explain: (i) => {
      const c = characteristicCount(i)
      if (!c) return null
      const onList = characteristicOnList(i).length
      return c.from === 'count'
        ? `Liczba wpisana wprost: ${plNum(c.n)}. Z listy tab. 1 rozpoznano: ${onList}.`
        : `Gatunków charakterystycznych z tab. 1 na liście: ${onList} z 12.`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      const other = distinct(names.filter((n) => !isCharacteristic2330(n)))
      const c = num(i.count)
      const onList = characteristicOnList(i).length
      const parts: string[] = []
      if (other.length) parts.push(`Spoza listy tab. 1: ${other.join(', ')} – formularz ich nie liczy.`)
      if (c !== undefined && names.length && gradeCharacteristic2330(c) !== gradeCharacteristic2330(onList))
        parts.push(`Wg listy tab. 1 byłoby ${onList} (${gradeCharacteristic2330(onList)}), a wpisano ${plNum(c)} (${gradeCharacteristic2330(c)}).`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      const c = num(i.count)
      return note(i) || describeSpecies(speciesRows(i.species)) || (c !== undefined ? `${plNum(c)} gat.` : '')
    },
  },
  {
    id: 'shrubs',
    label: 'Ekspansja krzewów i podrostu drzew',
    parameter: 'structure',
    cardinal: true,
    description:
      'Sumaryczne pokrycie krzewów i podrostu drzew na transekcie. Zarastanie przez krzewy i drzewa to jedno z podstawowych zagrożeń siedliska – często skutek nasadzeń (przede wszystkim sosnowych) na wydmach.',
    help: `Co wpisać: łączne pokrycie krzewów i podrostu drzew na transekcie w procentach (rzut koron), a obok listę gatunków. Do warstwy krzewów i podrostu wlicz też gatunki obce (wierzba ostrolistna, czeremcha amerykańska, robinia) – one dodatkowo idą do „Obcych gatunków inwazyjnych”.

Progi: do 40% – FV; 40–60% – U1; powyżej 60% – U2. Równo 40% formularz liczy do U1 – tak oceniono to w karcie z przewodnika (Chechło 2: „40% pokrycia” → U1). 60% też U1.

Wskaźnik kardynalny. Dlaczego: drzewa i krzewy zatrzymują wiatr i zacieniają piasek – zanikają procesy eoliczne, podłoże się stabilizuje, a z nim znikają gatunki charakterystyczne (sprawozdanie 2011: kluczowy czynnik dla pozostałych wskaźników). Sprawozdanie 2024: zwykle kilka do 15% na FV, 50–60% na U1, 70–90% na U2.`,
    thresholds: { FV: 'Do 40%', U1: '40–60%', U2: 'Powyżej 60%' },
    inputs: [
      { kind: 'number', name: 'value', label: 'Pokrycie krzewów i podrostu drzew', unit: '%', min: 0, max: 100, required: true, help: 'Sumaryczne pokrycie krzewów i podrostu drzew na transekcie, w procentach. Brak = 0.' },
      speciesInput('Gatunki krzewów i drzew (opcjonalnie)', 'Gatunki tworzące zakrzewienie i podrost na transekcie, np. Pinus sylvestris, Betula pendula, Salix repens. Pokrycie poszczególnych gatunków opcjonalne.'),
      noteInput('Opis (opcjonalnie)', 'np. Stwierdzono 40% pokrycia dla krzewów i podrostu drzew.', 'Krótki opis, który trafi do „wartości” w karcie zamiast procentu i listy.'),
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v !== undefined ? gradeShrubs2330(v) : null
    },
    warn: (i) => {
      const v = num(i.value)
      const sum = sumCover(i.species)
      return v !== undefined && sum !== undefined && sum > v + 0.05 ? `Suma pokryć gatunków (${pct(sum)}) jest większa niż pokrycie łączne (${pct(v)}) – korony mogą się nakładać, ale sprawdź.` : null
    },
    describe: (i) => {
      const v = num(i.value)
      const list = describeSpecies(speciesRows(i.species))
      return note(i) || [v !== undefined ? `pokrycie ${pct(v)}` : '', list].filter(Boolean).join('; ')
    },
  },
  {
    id: 'expansive',
    label: 'Gatunki ekspansywne',
    parameter: 'structure',
    description:
      'Sumaryczne pokrycie gatunków ekspansywnych na transekcie. Ich rozrost może doprowadzić do trwałego zaniku siedliska. Tab. 1 zalicza tu trzcinnik piaskowy Calamagrostis epigejos i wydmuchrzycę piaskową Elymus arenarius (pochodzi z wydm nadmorskich, ale bywa sadzona).',
    help: `Co wpisać: gatunki ekspansywne z pokryciem transektu w procentach. Formularz sumuje pokrycia; łączne pokrycie wpisane wprost ma pierwszeństwo. Brak – zaznacz „Nie stwierdzono”.

Gatunki: tab. 1 – trzcinnik piaskowy, wydmuchrzyca piaskowa. W sprawozdaniu 2024 jako ekspansywne oceniano też: trzcinnik leśny, perz właściwy, orlica, jeżynę fałdowaną, trzęślicę modrą, turzycę wczesną i owłosioną – są w katalogu i też się sumują.

Progi: pokrycie do 1% – FV; 1–10% – U1; powyżej 10% – U2. Równo 1% to jeszcze FV (karta Chechło 2: trzcinnik „pokrycie do 1%” → FV), 10% to U1.

Dlaczego: trzcinnik i spółka tworzą zwartą darń, która zatrzymuje piasek i zagłusza szczotlichę – sukcesja pędzi w stronę zwartych muraw albo zarośli.`,
    thresholds: { FV: 'Pokrycie do 1%', U1: 'Pokrycie 1–10%', U2: 'Pokrycie powyżej 10%' },
    inputs: [
      speciesInput('Gatunki ekspansywne na transekcie', 'Gatunki ekspansywne z pokryciem transektu w %, np. Calamagrostis epigejos 1. Dla „<1%” wpisz 0,5.'),
      { kind: 'number', name: 'total', label: 'Łączne pokrycie (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Łączne pokrycie gatunków ekspansywnych wpisane wprost. Ma pierwszeństwo przed sumą z listy.' },
      NONE_FIELD('Brak gatunków ekspansywnych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków ekspansywnych – wtedy wskaźnik to FV, a do karty trafia „nie stwierdzono”.'),
      noteInput('Opis (opcjonalnie)', 'np. trzcinnik piaskowy – pokrycie do 1%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = coverOf(i)
      if (c !== undefined) return gradeExpansive2330(c)
      if (i.none === 'yes' && !rowNames(i.species).length) return 'FV'
      return null
    },
    explain: (i) => {
      const names = rowNames(i.species)
      if (!names.length) return null
      const t = coverOf(i)
      return `Gatunków: ${distinct(names).length}, łączne pokrycie ${t !== undefined ? pct(t) : '— (wpisz pokrycie)'}.`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (i.none === 'yes' && names.length) return 'Zaznaczono „Nie stwierdzono”, a lista nie jest pusta.'
      const odd = names.filter((n) => findSpecies2330(n) && !isExpansive2330(n))
      return odd.length ? `Na liście są gatunki spoza grupy ekspansywnych: ${odd.join(', ')}.` : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      if (!list && i.none === 'yes') return 'nie stwierdzono'
      const t = num(i.total)
      return [list, t !== undefined ? `łącznie ${pct(t)}` : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    description:
      'Liczba gatunków inwazyjnych stwierdzonych na transekcie i – ważniejsze – ich sumaryczne pokrycie, z uwzględnieniem tendencji do trwałego opanowywania obszaru. Wskaźnik obejmuje też gatunki obce sadzone do stabilizacji wolnych piasków, np. wierzbę ostrolistną Salix acutifolia.',
    help: `Co wpisać: gatunki obce z pokryciem transektu w procentach. Liczba gatunków i pokrycie liczą się z listy; łączne pokrycie albo liczbę gatunków możesz wpisać wprost (mają pierwszeństwo). Brak – zaznacz „Nie stwierdzono”.

Najczęstsze: czeremcha amerykańska Padus serotina, przymiotno (konyza) kanadyjskie Conyza canadensis, wierzba ostrolistna Salix acutifolia (Pustynia Błędowska – dawne nasadzenia), robinia akacjowa, dąb czerwony, bylica roczna, mech krzywoszczeć przywłoka Campylopus introflexus (sprawozdanie 2024: do 80–90% pokrycia).

Progi: brak – FV; jeden gatunek z pokryciem do 5% transektu – U1; pokrycie powyżej 5% albo więcej niż jeden gatunek (niezależnie od pokrycia) – U2. Jeden gatunek bez podanego pokrycia formularz liczy jako U1.

Dlaczego: luźna murawa na gołym piasku łatwo przyjmuje przybyszów. Sprawozdanie 2024: najgorzej oceniany wskaźnik (U2 na 44% stanowisk). Sprawozdanie 2024 notuje też pospolite antropofity (fiołek polny, tasznik) – wpisuj je, jeśli uważasz za istotne, bo każdy wpisany gatunek się liczy.`,
    thresholds: {
      FV: 'Brak',
      U1: 'Jeden gatunek, z pokryciem do 5% transektu',
      U2: 'Pokrycie powyżej 5% lub więcej niż jeden gatunek (niezależnie od pokrycia)',
    },
    inputs: [
      speciesInput('Obce gatunki na transekcie', 'Gatunki obce z pokryciem transektu w %, np. Salix acutifolia 3. Brak – pusta lista i „Nie stwierdzono”.'),
      { kind: 'number', name: 'count', label: 'Liczba gatunków (opcjonalnie)', min: 0, help: 'Liczba gatunków obcych wpisana wprost. Ma pierwszeństwo przed liczeniem z listy.' },
      { kind: 'number', name: 'total', label: 'Łączne pokrycie (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Łączne pokrycie gatunków obcych wpisane wprost. Ma pierwszeństwo przed sumą z listy. Ważne przy jednym gatunku: do 5% to U1, więcej – U2.' },
      NONE_FIELD('Brak gatunków obcych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków obcych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. wierzba ostrolistna – niewiele i zamierająca', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: aliensFromInputs,
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
      const native = names.filter((n) => findSpecies2330(n) && !isAlien2330(n))
      return native.length ? `Na liście gatunków obcych są gatunki rodzime: ${native.join(', ')}.` : null
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
    id: 'eolian',
    label: 'Występowanie procesów eolicznych',
    parameter: 'structure',
    cardinal: true,
    description:
      'Obecność i skala procesów związanych z działaniem wiatru – od drobnych zmarszczek (ripplemarków), przez pagórki fitogeniczne na kępach roślin i innych przeszkodach, po największe wydmy. Kryterium to przede wszystkim aktualność procesów eolicznych, od której zależą perspektywy utrzymania siedliska.',
    help: `Co wybrać: czy wiatr teraz przesypuje piasek (ripplemarki, piasek nawiany na kępy szczotlichy, świeże pagórki fitogeniczne, wywiewy), czy widać tylko ślady dawnych procesów (stare, zarośnięte pagórki, mniejsze wydmy w krzakach), czy jedynie utrwalone wydmy pod lasem. Opisz w notatce, co widać – trafi do karty.

Progi: aktywne procesy eoliczne – FV; ślady dawnych procesów – U1; tylko dobrze utrwalone formy, np. duże wydmy zarośnięte w większości lasem – U2.

Udział odsłoniętego piasku (opcjonalnie): sprawozdanie 2016–2018 zauważa, że aktywności wiatru zwykle nie da się stwierdzić w jeden dzień, i proponuje oceniać udział odsłoniętego, luźnego piasku (>60% FV, 10–60% U1, <10% U2). Propozycji nie przyjęto (2024 oceniano po staremu), więc formularz pokazuje ją tylko jako wskazówkę – ocena idzie z wyboru.

Wskaźnik kardynalny. Dlaczego: bez wiatru nie ma inicjalnej murawy – piasek się stabilizuje i sukcesja idzie w stronę 6120 albo boru. Sprawozdanie 2024: brak procesów eolicznych był główną przyczyną usuwania stanowisk z monitoringu.`,
    thresholds: thresholdsOf(EOLIAN),
    inputs: [
      selectInput('Procesy eoliczne', EOLIAN),
      { kind: 'number', name: 'bareSand', label: 'Odsłonięty luźny piasek (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Udział odsłoniętego, luźnego piasku na powierzchni siedliska na transekcie, w procentach. Tylko informacyjnie (propozycja ze sprawozdania 2016–2018) – do oceny się nie liczy.' },
      noteInput('Co widać (opcjonalnie)', 'np. piasek nawiewany na kępy szczotlichy, ripplemarki', 'Krótki opis form eolicznych. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(EOLIAN)),
    explain: (i) => {
      const s = num(i.bareSand)
      return s !== undefined ? `Odsłonięty piasek ${pct(s)} – wg propozycji ze sprawozdania 2016–2018 byłoby ${gradeBareSand2330(s)} (tylko wskazówka).` : null
    },
    warn: (i) => {
      const s = num(i.bareSand)
      if (s === undefined || !i.choice) return null
      const chosen = gradeMap(EOLIAN)[String(i.choice)]
      const hint = gradeBareSand2330(s)
      return chosen !== hint && (chosen === 'FV' || hint === 'FV') ? `Wybrano ${chosen}, a ${pct(s)} odsłoniętego piasku sugeruje ${hint} – sprawdź.` : null
    },
    describe: (i) => {
      const s = num(i.bareSand)
      return [note(i) || labelOf(EOLIAN, i.choice), s !== undefined ? `odsłonięty piasek ${pct(s)}` : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'share',
    label: 'Procent powierzchni zajęty przez siedlisko na transekcie',
    parameter: 'structure',
    description:
      'Szacowany procentowy udział siedliska na całym transekcie. Siedlisko przeważnie nie zajmuje całego transektu, ale poniżej pewnych wartości przyspieszają procesy sukcesyjne i siedlisko zanika.',
    help: `Co wpisać: jaka część transektu (200×10 m) jest zajęta przez inicjalną murawę napiaskową 2330 – reszta to zarośla, bór, zwarte murawy 6120, wrzosowisko, drogi bez roślinności. W procentach.

Progi: powyżej 30% – FV; 10–30% – U1; do 10% – U2. Równo 10% formularz liczy do U2 (tab. 2: „do 10%”; sprawozdanie 2024: U2, gdy pokrycie „nie przekraczało 10%”), 30% do U1.

Dlaczego: małe, rozproszone płaty zarastają szybciej niż duże otwarte połacie – wiatr nie ma się gdzie rozpędzić. Sprawozdanie 2024: na FV zwykle 80–100%, na U1 15–30%.`,
    thresholds: { FV: 'Powyżej 30%', U1: '10–30%', U2: 'Do 10%' },
    inputs: [
      { kind: 'number', name: 'value', label: 'Udział siedliska na transekcie', unit: '%', min: 0, max: 100, required: true, help: 'Procent powierzchni transektu zajęty przez siedlisko 2330. Brak siedliska = 0.' },
      noteInput('Opis (opcjonalnie)', 'np. Siedlisko zajmuje 60% transektu.', 'Krótki opis, który trafi do „wartości” w karcie zamiast samego procentu.'),
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v !== undefined ? gradeShare2330(v) : null
    },
    describe: (i) => {
      const v = num(i.value)
      return note(i) || (v !== undefined ? pct(v) : '')
    },
  },
  {
    id: 'later',
    label: 'Gatunki charakterystyczne murawy kserotermicznej/wrzosowiska',
    parameter: 'structure',
    description:
      'Liczba gatunków charakterystycznych dla późniejszych etapów sukcesji, następujących po inicjalnych murawach napiaskowych: muraw kserotermicznych, wrzosowisk, a także borów sosnowych i łąk. Nie uwzględnia częstych w siedlisku gatunków muraw 6120, np. strzęplicy sinej Koeleria glauca. Wzrost liczby takich gatunków świadczy o stabilizacji i zaniku charakteru inicjalnego.',
    help: `Co wpisać: gatunki późniejszych etapów sukcesji stwierdzone na transekcie. Formularz liczy wszystkie wpisane, poza gatunkami charakterystycznymi 2330 i gatunkami muraw 6120 (strzęplica sina, kostrzewa piaskowa, goździk piaskowy, łyszczec baldachogroniasty, kocanki) – tab. 1 je wyklucza. Liczba wpisana wprost ma pierwszeństwo. Brak – zaznacz „Nie stwierdzono”.

Najczęstsze (tab. 1 i sprawozdania): jastrzębiec kosmaczek Hieracium pilosella, śmiałek pogięty Deschampsia flexuosa, krwawnik pospolity Achillea millefolium, goździk kartuzek Dianthus carthusianorum, wrzos Calluna vulgaris, macierzanka piaskowa Thymus serpyllum, rozchodnik ostry Sedum acre, wilczomlecz sosnka, kostrzewa owcza, gorysz pagórkowy.

Progi: 1 lub brak – FV; 2 lub 3 – U1; powyżej 3 – U2. Sprawozdanie 2024 obniżało też do U1 przy jednym gatunku o dużym pokryciu (śmiałek 10%) – tego tab. 2 nie przewiduje; jeśli tak oceniasz, wybierz ocenę ręcznie i uzasadnij w opisie.

Dlaczego: to termometr sukcesji – im więcej gatunków wrzosowisk i muraw, tym bliżej końca siedliska.`,
    thresholds: { FV: '1 lub brak', U1: '2 lub 3', U2: 'Powyżej 3' },
    inputs: [
      speciesInput('Gatunki muraw kserotermicznych/wrzosowisk na transekcie', 'Gatunki późniejszych etapów sukcesji stwierdzone na transekcie (pokrycie opcjonalne), np. Hieracium pilosella.'),
      { kind: 'number', name: 'count', label: 'Liczba gatunków (opcjonalnie)', min: 0, help: 'Liczba gatunków wpisana wprost. Ma pierwszeństwo przed liczeniem z listy.' },
      NONE_FIELD('Brak takich gatunków', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków muraw kserotermicznych ani wrzosowisk – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Jeden gatunek – jastrzębiec kosmaczek', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = laterCount(i)
      return c ? gradeLater2330(c.n) : null
    },
    explain: (i) => {
      const c = laterCount(i)
      if (!c || !rowNames(i.species).length) return null
      return `Liczy się: ${laterOnList(i).length} gat.${c.from === 'count' ? ` (wpisano wprost ${plNum(c.n)})` : ''}.`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (i.none === 'yes' && names.length) return 'Zaznaczono „Nie stwierdzono”, a lista nie jest pusta.'
      const excluded = distinct(names.filter((n) => isStable6120(n) || isCharacteristic2330(n)))
      const unknown = distinct(names.filter((n) => findSpecies2330(n) && !isLater2330(n) && !isStable6120(n) && !isCharacteristic2330(n)))
      const parts: string[] = []
      if (excluded.length) parts.push(`Nie liczą się (gatunki 2330 i muraw 6120): ${excluded.join(', ')}.`)
      if (unknown.length) parts.push(`Liczone, choć w katalogu w innej grupie: ${unknown.join(', ')}.`)
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
    id: 'distortions',
    label: 'Inne zniekształcenia (rozjeżdżenie, wydeptanie, zaśmiecenie)',
    parameter: 'structure',
    description:
      'Bezpośredni i aktualny wpływ człowieka na siedlisko: zaśmiecenie, ale przede wszystkim wydobycie piasku, wydeptywanie i rozjeżdżanie. Ocenie podlega skala i intensywność tych oddziaływań.',
    help: `Co wybrać: skalę rozjeżdżenia (quady, motocykle crossowe, samochody terenowe), wydeptania, eksploatacji piasku i zaśmiecenia na transekcie. Opisz w notatce, co widać – trafi do karty.

Progi: niewielka liczba kolein i ścieżek, brak eksploatacji piasku, śladowe zaśmiecenie – FV; nieliczne drogi lub duża ilość kolein i ścieżek, śladowa eksploatacja piasku, średnie zaśmiecenie – U1; większość niezakrzaczonej powierzchni transektu bez roślinności przez działania człowieka albo znaczna eksploatacja piasku, bardzo duże zaśmiecenie (dzikie wysypiska) – U2.

Dlaczego to nie takie proste: umiarkowane wydeptywanie i rozjeżdżanie odsłania piasek i pomaga siedlisku (poligony to najlepiej zachowane stanowiska), ale silne – zwłaszcza po stałych trasach – niszczy pokrywę roślinną do zera. Intensywna eksploatacja piasku jest zdecydowanie negatywna i nieodwracalna.`,
    thresholds: thresholdsOf(DISTORTIONS),
    inputs: [
      selectInput('Zniekształcenia', DISTORTIONS),
      noteInput('Opis (opcjonalnie)', 'np. Rozjeżdżanie przez pojazdy crossowe. Niewielka ilość śmieci komunalnych.', 'Krótki opis, co i w jakiej skali zniekształca siedlisko. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(DISTORTIONS)),
    describe: (i) => note(i) || labelOf(DISTORTIONS, i.choice),
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu, z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie.

Dlaczego: przy badaniu powtarzanym co 2–3 lata ktoś musi wytyczyć ten sam transekt i porównać.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Chechło 2',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – zwykle miejscowość z numerem, np. „Chechło 2”, „Klucze 5”, „Poligon Toruń I”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego transektu.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    defaultValue: 'Spergulo vernalis-Corynephoretum',
    placeholder: 'np. Murawy szczotlichowe Spergulo vernalis-Corynephoretum',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Dla 2330: klasa Koelerio glaucae-Corynephoretea canescentis, rząd Corynephoretalia canescentis, związek Corynephorion canescentis, zespół Spergulo vernalis-Corynephoretum (napiaskowe murawy szczotlichowe).

Uwaga: do 2330 należą tylko płaty na piaskach wydmowych (eolicznych). Ta sama murawa na piaszczystym polu albo w wyrobisku po piasku to nie jest 2330. Zwarte murawy ze strzęplicą siną to już 6120.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Położenie na wydmie, procesy eoliczne, zakrzewienie, nasadzenia, rozjeżdżenie, mozaika z innymi zbiorowiskami.',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• położenie: wydma, pole deflacyjne, piaski otwarte; czy procesy eoliczne są aktywne;
• udział drzew i krzewów, nasadzenia sosny, wierzby (ostrolistnej, płożącej), nalot brzozy;
• mozaika z innymi zbiorowiskami (6120, wrzosowisko 4030, bór);
• antropopresja: drogi, koleiny, wydobycie piasku, śmieci, poligon.

Za stanowisko przyjmuje się płat (lub kompleks płatów) siedliska z transektem monitoringowym.`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Łączna powierzchnia płatów siedliska na stanowisku, w hektarach (160 ha w karcie z przewodnika, Pustynia Błędowska). Oszacuj w terenie albo z ortofotomapy.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „PLH120014 Pustynia Błędowska, Park Krajobrazowy Orlich Gniazd”. Brak – „brak”.',
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
    hint: 'Prostokąt 200×10 m; inny kształt dopuszczalny, byle 20 arów.',
    help: `Na stanowisku wyznacza się transekt w kształcie prostokąta 200×10 m. Gdy przeszkody terenowe albo nieliniowe ułożenie siedliska nie pozwalają, można przyjąć inne wymiary, zachowując powierzchnię 20 arów (np. 20×100 m w karcie z przewodnika). W skrajnych przypadkach powierzchnią monitoringową mogą być trzy płaty siedliska położone w odległości poniżej 150 m – opisz to w uwagach.`,
    warn: (v) => {
      const m = String(v ?? '').replace(',', '.').match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/)
      if (!m) return null
      const a = Number(m[1]) * Number(m[2])
      return Math.abs(a - 2000) < 1 ? null : `${plNum(a)} m² – metodyka wymaga 20 arów (2000 m²). Opisz odstępstwo w uwagach.`
    },
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    help: 'Wysokość nad poziomem morza transektu, z GPS albo mapy. Można wpisać zakres („320–322”). Siedlisko występuje na całym niżu i na wyżynach południowej Polski.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 25.05.2017',
    required: true,
    hint: 'Optymalnie maj, ewentualnie początek czerwca.',
    help: `Dzień badań terenowych. Optymalny termin: maj, ewentualnie początek czerwca – to jedyny moment, gdy widać terofity wiosenne (sporek, chroszcz, przetacznik Dillena), potrzebne do oceny gatunków charakterystycznych. W praktyce (2017–2018, 2024) badano od 1 maja do 30 czerwca. Ze względu na dynamikę siedliska badania powtarza się co 2–3 lata.

Karta z przewodnika (wrzesień 2011) jest poza terminem – terofitów wiosennych w niej nie ma.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 5 && m <= 6 ? null : 'Termin poza optymalnym oknem (maj–czerwiec). Terofity wiosenne mogą już nie być widoczne – gatunków charakterystycznych wyjdzie mniej.'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcia fitosocjologiczne: 3 × 5×5 m ----------

const r7120 = methodology7120.releves.fields
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', {
    help: 'Współrzędne GPS środka zdjęcia. Zdjęcia robi się na przeciwległych końcach transektu i w jego środku.',
  }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach.' }),
  pickField(r7120, 'area', {
    defaultValue: 25,
    help: 'Powierzchnia zdjęcia w m². Metodyka: 25 m² (5×5 m).',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Na polu deflacyjnym 0°, na stoku wydmy kilka–kilkanaście stopni.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, SW). Dla powierzchni płaskiej zostaw puste albo wpisz „brak”.' }),
  layerField('coverB', 'Warstwa B – krzewy i podrost: procent powierzchni zdjęcia pod krzewami i podrostem drzew (sosna, brzoza, wierzby). Brak = 0.\n\nDlaczego: warstwa B to zarastanie – pierwszy wróg inicjalnej murawy.', { groupCols: 3 }),
  layerField('coverC', 'Warstwa C – zielna: procent powierzchni zdjęcia pokryty przez rośliny naczyniowe (szczotlicha, terofity, trawy). W inicjalnej murawie zwykle 10–30%, reszta to goły piasek.\n\nDlaczego: niskie zwarcie C to znak, że murawa jest inicjalna; zwarta darń – że przechodzi w 6120.'),
  layerField('coverD', 'Warstwa D – mszysta: płonnik włosisty, chrobotki, płucnica i inne mszaki i porosty naziemne. Brak = 0.\n\nDlaczego: porosty i płonnik to stały element siedliska – przy bardziej kontynentalnym klimacie dominują nad roślinami naczyniowymi.'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów i podrostu, w metrach. Brak warstwy = 0.'),
  layerField('heightC', 'Warstwa C – typowa wysokość roślin zielnych, w centymetrach (kępy szczotlichy zwykle 15–30 cm).'),
  layerField('heightD', 'Warstwa D – typowa wysokość warstwy mszystej, w centymetrach (zwykle poniżej 1–2 cm).'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Spergulo vernalis-Corynephoretum',
    help: 'Jednostka fitosocjologiczna zdjęcia, zwykle zespół Spergulo vernalis-Corynephoretum.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w poletku z ilościowością w skali Braun-Blanqueta (r, +, 1–5): warstwa B – krzewy i podrost, C – zielna, D – mszaki i porosty. Warstwa podpowiada się sama po wyborze gatunku.',
  }),
]

export const methodology2330: Methodology = {
  code: '2330',
  name: 'Wydmy śródlądowe z murawami napiaskowymi',
  source:
    'Kulpiński K., Tyc A. 2012, 2330 Wydmy śródlądowe z murawami napiaskowymi, [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 102–113 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2009–2011, 2016–2018 i 2023–2025',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj 3 zdjęcia fitosocjologiczne po 25 m² (5×5 m): dwa na przeciwległych końcach transektu i jedno w środku. Ilościowość w skali Braun-Blanqueta; warstwy B (krzewy i podrost), C (zielna), D (mszaki i porosty).',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Możliwości ochrony siedliska i utrzymania go w stanie niepogorszonym, przy analizie czynników realnie oddziałujących na siedlisko w najbliższej przyszłości. Stan siedliska jest wypadkową procesów sukcesyjnych i niszczących roślinność – trzeba ocenić oba i to, czy możliwa jest dynamiczna równowaga między nimi.',
    help: `Weź pod uwagę oba kierunki zagrożeń: sukcesję (nasadzenia, nalot sosny i brzozy, ekspansja trzcinnika i gatunków obcych, zarastanie wrzosem) i niszczenie (intensywne rozjeżdżanie, wydobycie piasku, wysypiska). Siedlisko potrzebuje umiarkowanego zaburzenia – poligony i lekki ruch utrzymują je najlepiej.

Działania ochronne, o których warto wspomnieć: usuwanie nalotu drzew i krzewów, karczowanie odsłaniające piasek i uruchamiające procesy eoliczne, regulacja ruchu pojazdów (np. zmienne udostępnianie obszaru), kontrolowane wypalanie (gdy brak innych możliwości), ekstensywny wypas, usuwanie gatunków obcych (czeremcha, robinia), sprzątanie.

Praktyka 2024: najlepsze perspektywy miały duże, dobrze zachowane płaty z ochroną czynną; zła prognoza przy zwartej murawie, zarastaniu, nasadzeniach i pojawieniu się krzywoszczeci przywłoki.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Średnie perspektywy zachowania siedliska – znaczące oddziaływanie czynników zagrażających, prawdopodobne pogorszenie stanu lub zmniejszenie się powierzchni siedliska',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A04', name: 'Wypas' },
    { code: 'A04.02.01', name: 'Nieintensywny wypas bydła' },
    { code: 'A04.03', name: 'Zarzucenie pasterstwa, brak wypasu' },
    { code: 'A11', name: 'Inne rodzaje praktyk rolniczych, nie wymienione powyżej' },
    { code: 'B01', name: 'Zalesianie terenów otwartych' },
    { code: 'B01.01', name: 'Zalesianie terenów otwartych (drzewa rodzime)' },
    { code: 'B01.02', name: 'Sztuczne nasadzenia na terenach otwartych (drzewa nierodzime)' },
    { code: 'B02.02', name: 'Wycinka lasu' },
    { code: 'B02.03', name: 'Usuwanie podszytu' },
    { code: 'B07', name: 'Inne rodzaje praktyk leśnych, nie wymienione powyżej' },
    { code: 'C01.01', name: 'Wydobywanie piasku i żwiru' },
    { code: 'D01', name: 'Drogi, ścieżki i drogi kolejowe' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D01.02', name: 'Drogi, autostrady' },
    { code: 'D02.01.01', name: 'Napowietrzne linie elektryczne i telefoniczne' },
    { code: 'E01.03', name: 'Zabudowa rozproszona' },
    { code: 'E01.04', name: 'Inne typy zabudowy' },
    { code: 'E03.01', name: 'Pozbywanie się odpadów z gospodarstw domowych / obiektów rekreacyjnych' },
    { code: 'E03.04', name: 'Inne odpady' },
    { code: 'E04.02', name: 'Obiekty, budynki wojskowe stanowiące element krajobrazu' },
    { code: 'G01', name: 'Sporty i różne formy czynnego wypoczynku, uprawiane w plenerze' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
    { code: 'G04.01', name: 'Poligony' },
    { code: 'G04.02', name: 'Zaniechanie użytkowania dla celów wojskowych' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'G05.04', name: 'Wandalizm' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J01.01', name: 'Wypalanie' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.02', name: 'Nagromadzenie materii organicznej' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: [
    ...methodology7120.otherFields.flatMap((f): FieldDef[] => {
      if (f.name === 'otherValues')
        return [
          {
            ...f,
            hint: 'Np. sąsiedztwo 6120, 4030, 91T0; rzadkie porosty; ptaki terenów otwartych.',
            help: 'Wartości przyrodnicze stanowiska poza samą inicjalną murawą: sąsiednie siedliska (ciepłolubne murawy napiaskowe 6120, wrzosowiska 4030, śródlądowe bory chrobotkowe 91T0), rzadkie porosty, owady piaskolubne, ptaki terenów otwartych (lerka, kozodój). Brak informacji – „Nie stwierdzono” albo „Nie pozyskano danych”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            help: 'Jakie działania ochronne wykonano i z jakim skutkiem, oraz co proponujesz. Typowe dla 2330: usuwanie nalotu drzew i krzewów, karczowanie odsłaniające piasek, regulacja ruchu pojazdów (barierki, zmienne udostępnianie terenu), ekstensywny wypas, usuwanie gatunków obcych (czeremcha, robinia, wierzba ostrolistna), sprzątanie śmieci, zaprzestanie zalesiania i wydobycia piasku. Brak działań – „Nie prowadzono”.',
          },
        ]
      if (f.name === 'notes')
        return [
          {
            kind: 'number',
            name: 'shareFV',
            group: 'Udział powierzchni siedliska w stanie FV / U1 / U2 (transekt)',
            label: 'Udział powierzchni siedliska w stanie FV',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Metodyka: na transekcie szacuje się udział siedliska o różnych stanach zachowania (FV, U1, U2). W karcie z przewodnika: FV 70%, U1 10%, U2 20%. Trzy liczby powinny dać razem 100%.',
          },
          {
            kind: 'number',
            name: 'shareU1',
            group: 'Udział powierzchni siedliska w stanie FV / U1 / U2 (transekt)',
            label: 'Udział powierzchni siedliska w stanie U1',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Procent powierzchni siedliska na transekcie w stanie niezadowalającym (U1).',
          },
          {
            kind: 'number',
            name: 'shareU2',
            group: 'Udział powierzchni siedliska w stanie FV / U1 / U2 (transekt)',
            label: 'Udział powierzchni siedliska w stanie U2',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Procent powierzchni siedliska na transekcie w stanie złym (U2).',
          },
          f,
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_2330.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer2330(s) })),
  speciesInfo: (name) => {
    const e = findSpecies2330(name)
    if (!e) return undefined
    if (e.group === 'expansive' && !e.tab1) return `${GROUP_LABELS_2330.expansive} (sprawozdanie 2024)`
    return GROUP_LABELS_2330[e.group]
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator2330 = (id: string): IndicatorDef => {
  const i = methodology2330.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 2330`)
  return i
}
