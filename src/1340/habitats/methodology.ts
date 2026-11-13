// Metodyka 1340 (śródlądowe słone łąki, pastwiska i szuwary, Glauco-Puccinellietalia część – zbiorowiska śródlądowe) jako dane.
// Źródło: Piernik A. 2010, „1340 Śródlądowe słone łąki, pastwiska i szuwary” [w:] Mróz W. (red.), Monitoring siedlisk
// przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ (tab. 1 i 2, przykładowa karta Owczary 2008), z praktyką ocen ze sprawozdań
// z monitoringu 2014, 2016–2018 i 2024: 8 wskaźników z tab. 2 (5 kardynalnych) plus „Uwilgotnienie” – spoza przewodnika,
// oceniane w 2014 i 2024 r., u nas niekardynalne. „Zachowanie strefy ekotonowej” i „Charakterystyczna kombinacja florystyczna”
// (tylko 2007–2008) wypadły.
// Siedlisko priorytetowe – w karcie *1340. Z modułu leśnego brane są tylko klocki generyczne (choiceIndicator, speciesInput, pickField).
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology, SelectOption, SpeciesRow } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { choiceIndicator, fmt, labelOf, listCover, pickField, plNum, speciesInput, type GradedOption } from '../../forest'
import { GROUP_LABELS_1340, SPECIES_1340, defaultLayer1340, findSpecies1340, groupOf1340, isAnyHalophyte, isHalophyteGroup, isPhragmites } from './species'

// ---------- progi liczbowe (tab. 2) ----------

/** Procent powierzchni transektu zajęty przez siedlisko: >75% FV, 50–75% U1, <50% U2 (75 i 50 to jeszcze U1). */
export const gradeTransect1340 = (pct: number): Grade => (pct > 75 ? 'FV' : pct >= 50 ? 'U1' : 'U2')
/** Obce inwazyjne i rodzime ekspansywne – pokrycie: <25% FV, 25–50% U1, >50% U2. */
export const gradeShare1340 = (pct: number): Grade => (pct < 25 ? 'FV' : pct <= 50 ? 'U1' : 'U2')
/** ECe poniżej tego progu (dS/m) to w tab. 2 „zanik oznak zasolenia” – U2. */
export const ECE_MIN = 4
/** Gatunki charakterystyczne: więcej niż 9 halofitów (≥10) to warunek FV, mniej niż 7 (≤6) – U2. */
export const HALO_FV_MIN = 10
export const HALO_U2_MAX = 6
/** Pokrycie choć jednego halofitu obligatoryjnego, powyżej którego spełniony jest drugi warunek FV. */
export const OBLIGATE_COVER = 25

// ---------- powierzchnia ----------

const AREA_TREND: GradedOption[] = [
  { value: 'increase', label: 'Zwiększa się', grade: 'FV' },
  { value: 'stable', label: 'Nie podlega zmianom w porównaniu z wcześniejszymi badaniami lub danymi z literatury', grade: 'FV' },
  { value: 'decrease', label: 'Zmniejsza się nieznacznie (inne kombinacje)', grade: 'U1' },
  { value: 'strongDecrease', label: 'Wyraźny spadek powierzchni siedliska na stanowisku', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]

// ---------- gatunki ----------

const named = (value: unknown): SpeciesRow[] => speciesRows(value).filter((r) => r.name?.trim())
const coverOf = (r: SpeciesRow) => num(r.cover)
const sum = (rows: SpeciesRow[]) => Math.round(rows.reduce((a, r) => a + (coverOf(r) ?? 0), 0) * 10) / 10

/** Gatunki charakterystyczne: liczba halofitów z list przewodnika i najwyższe pokrycie halofitu obligatoryjnego. */
export function characteristic1340(i: InputValues): { grade: Grade | null; reason: string } {
  const rows = named(i.species)
  if (!rows.length) return { grade: null, reason: '' }
  const halo = rows.filter((r) => isHalophyteGroup(groupOf1340(r.name)))
  const others = rows.filter((r) => !isHalophyteGroup(groupOf1340(r.name)))
  const n = halo.length
  const tail = others.length ? ` Poza listą halofitów przewodnika (nie liczą się): ${others.map((r) => r.name.trim()).join(', ')}.` : ''
  if (n <= HALO_U2_MAX) return { grade: 'U2', reason: `Halofitów z list przewodnika: ${n} (mniej niż 7).${tail}` }
  if (n < HALO_FV_MIN) return { grade: 'U1', reason: `Halofitów z list przewodnika: ${n} (7–9) – sytuacja pośrednia.${tail}` }
  const obligate = halo.filter((r) => groupOf1340(r.name) === 'obligate')
  const top = obligate.filter((r) => (coverOf(r) ?? 0) > OBLIGATE_COVER)
  if (top.length)
    return { grade: 'FV', reason: `Halofitów z list przewodnika: ${n}; halofity obligatoryjne >25%: ${describeSpecies(top)}.${tail}` }
  if (obligate.some((r) => coverOf(r) === undefined))
    return { grade: null, reason: `Halofitów: ${n}. Wpisz pokrycie halofitów obligatoryjnych – od niego zależy FV.${tail}` }
  return {
    grade: 'U1',
    reason: `Halofitów z list przewodnika: ${n}, ale żaden halofit obligatoryjny nie przekracza 25% pokrycia – sytuacja pośrednia.${tail}`,
  }
}

/** Gatunki dominujące (≥10%): halofity kontra glikofity. */
export function dominance1340(i: InputValues): { grade: Grade | null; reason: string } {
  const rows = named(i.species)
  if (!rows.length) return { grade: null, reason: '' }
  if (rows.some((r) => coverOf(r) === undefined)) return { grade: null, reason: 'Wpisz pokrycie każdego dominanta.' }
  const halo = rows.filter((r) => isAnyHalophyte(groupOf1340(r.name)))
  const glyco = rows.filter((r) => !isAnyHalophyte(groupOf1340(r.name)))
  const h = sum(halo)
  const g = sum(glyco)
  if (!halo.some((r) => (coverOf(r) ?? 0) > 10))
    return {
      grade: 'U2',
      reason: halo.length
        ? `Żaden halofit nie przekracza 10% pokrycia (${describeSpecies(halo)}); dominują glikofity (${describeSpecies(glyco)}).`
        : `Wśród dominantów nie ma halofitów; dominują glikofity (${describeSpecies(glyco)}).`,
    }
  if (h >= g)
    return {
      grade: 'FV',
      reason: glyco.length
        ? `Halofity łącznie ${fmt(h)}, glikofity ${fmt(g)} – halofity dominują lub współdominują.`
        : `Dominują wyłącznie halofity (${fmt(h)}).`,
    }
  return { grade: 'U1', reason: `Halofity łącznie ${fmt(h)}, glikofity ${fmt(g)} – glikofity przeważają, ale halofity przekraczają 10% (sytuacja pośrednia).` }
}

/** Rodzime ekspansywne: suma pokrycia (bez trzciny, gdy płaty to podtyp 1340-3) i największy udział w pojedynczym płacie. */
export function expansive1340(i: InputValues): { grade: Grade | null; total?: number; counted: SpeciesRow[] } {
  const rows = named(i.species)
  const counted = i.reedNatural === 'yes' ? rows.filter((r) => !isPhragmites(r.name)) : rows
  const maxPatch = num(i.maxPatch)
  const { total } = listCover({ species: counted })
  if (maxPatch !== undefined && maxPatch > 50) return { grade: 'U2', total, counted }
  if (!counted.length) return { grade: 'FV', total: 0, counted }
  if (total === undefined) return { grade: null, counted }
  return { grade: gradeShare1340(total), total, counted }
}

// ---------- krzewy i drzewa ----------

const SHRUBS: GradedOption[] = [
  { value: 'none', label: 'Brak lub pojedyncze okazy krzewów i drzew', grade: 'FV' },
  { value: 'young', label: 'Obecność młodnika (podrost drzew, zarośla)', grade: 'U1' },
  { value: 'planted', label: 'Nasadzenia drzew (np. olszy czarnej) bądź drzewostan', grade: 'U2' },
]

// ---------- struktura przestrzenna ----------

const SPATIAL: GradedOption[] = [
  {
    value: 'mosaic',
    label: 'Mozaikowy lub pasowy układ roślinności, łagodne przejścia między płatami w gradiencie zasolenia, wilgotności czy wydeptywania',
    grade: 'FV',
  },
  { value: 'partial', label: 'Nie w pełni realizowany mozaikowy lub pasowy układ roślinności', grade: 'U1' },
  { value: 'isolated', label: 'Płaty roślinności halofilnej izolowane od siebie na stanowisku', grade: 'U2' },
  { value: 'none', label: 'Siedliska nie stwierdzono', grade: 'U2' },
  { value: 'unclear', label: 'Nie da się ocenić (np. teren świeżo skoszony)', grade: 'XX' },
]

// ---------- zasilanie wodami słonymi ----------

const SALT_WATER: GradedOption[] = [
  {
    value: 'free',
    label: 'Brak oznak spadku zasolenia, swobodny dopływ i podsiąkanie słonych wód, ECe >4 dS/m',
    grade: 'FV',
  },
  {
    value: 'limited',
    label: 'Wyraźne oznaki spadku zasolenia (niższe niż wcześniej), zasilanie ograniczone przez osuszanie, rowy, wały itp.',
    grade: 'U1',
  },
  {
    value: 'lost',
    label: 'Zupełny lub prawie zupełny zanik oznak zasolenia, ECe <4 dS/m, czynniki osłabiające zasilanie jak w U1, ale silniejsze',
    grade: 'U2',
  },
]

const SALT_SOURCE: SelectOption[] = [
  { value: 'spring', label: 'Słone źródła (wypływ na powierzchnię)' },
  { value: 'groundwater', label: 'Słone wody gruntowe (podsiąkanie)' },
  { value: 'borehole', label: 'Odwiert, tężnia, przemysł solny lub sodowy (stanowisko antropogeniczne)' },
  { value: 'mixed', label: 'Kilka źródeł naraz' },
]

/** ECe z pól min/max: najwyższy pomiar decyduje o „zaniku oznak zasolenia”. */
export function eceRange(i: InputValues): { min?: number; max?: number } {
  const a = num(i.eceMin)
  const b = num(i.eceMax)
  if (a === undefined && b === undefined) return {}
  return { min: a ?? b, max: b ?? a }
}

const eceText = (i: InputValues) => {
  const { min, max } = eceRange(i)
  if (min === undefined || max === undefined) return ''
  return min === max ? `ECe gleby ${plNum(min)} dS/m` : `ECe gleby ${plNum(min)}–${plNum(max)} dS/m`
}

// ---------- uwilgotnienie ----------

const MOISTURE: GradedOption[] = [
  { value: 'wet', label: 'Brak oznak przesuszenia, podłoże wilgotne, okresowe zalewy i stagnowanie wody', grade: 'FV' },
  { value: 'drying', label: 'Oznaki przesuszenia powierzchniowych poziomów gleby', grade: 'U1' },
  { value: 'dry', label: 'Siedlisko wyraźnie przesuszone, wody gruntowe trwale obniżone', grade: 'U2' },
  { value: 'unknown', label: 'Nie da się ocenić (np. brak porównania, nietypowo sucha pora)', grade: 'XX' },
]

// ---------- wskaźniki ----------

const shrubsBase = choiceIndicator({
  id: 'shrubs',
  label: 'Ekspansja krzewów i podrostu drzew',
  description:
    'Zwykle nie obserwuje się zarastania słonych łąk przez krzewy i drzewa, ale przy mniejszym zasoleniu utrzymują się nasadzenia olszy czarnej Alnus glutinosa, niekorzystne dla stanu siedliska.',
  help: `Co wybrać: czy na transekcie rosną krzewy i drzewa. Brak albo pojedyncze okazy – FV, młodnik (podrost, zarośla) – U1, nasadzenia drzew albo drzewostan – U2. Gatunki z pokryciem możesz wpisać poniżej – trafią do karty.

Praktyka: we wszystkich cyklach (2014, 2018, 2024) FV na wszystkich stanowiskach; w 2024 r. pojedyncze bzy czarne i derenie w Gadawie nie obniżyły oceny. Wyjątek z przeszłości – nasadzenia olszy w Słonawach k. Szubina (2014: XX).

Dlaczego: słone łąki to siedlisko otwarte, a drzewa ocieniają światłolubne halofity i przesuszają podłoże.`,
  options: SHRUBS,
  inputLabel: 'Krzewy i drzewa na transekcie',
  after: [speciesInput('Gatunki krzewów i drzew (opcjonalnie)', 'Krzewy i drzewa z pokryciem w % powierzchni transektu. Brak – zostaw pustą listę.')],
  thresholds: { FV: 'Brak lub pojedyncze okazy', U1: 'Obecność młodnika', U2: 'Nasadzenia drzew bądź drzewostanu' },
})

const spatialBase = choiceIndicator({
  id: 'spatial',
  label: 'Struktura przestrzenna płatów siedliska',
  description:
    'Dla solnisk typowy jest mozaikowy układ roślinności albo pasowy w gradiencie zasolenia, bądź też łagodne przejścia między poszczególnymi płatami w gradiencie zasolenia i wilgotności.',
  help: `Co wybrać: jak płaty roślinności halofilnej układają się na stanowisku. Mozaika albo pasy w gradiencie zasolenia, wilgotności lub wydeptywania, z łagodnymi przejściami – FV. Układ tylko częściowy – U1. Płaty halofilne odizolowane od siebie (np. roślinnością glikofilną albo szuwarem trzcinowym) – U2.

Opcje spoza tabeli przewodnika, z praktyki ocen: „Siedliska nie stwierdzono” – U2 (2024: Baranów, Gadawa, Pełczyska 3), „Nie da się ocenić” – XX (przykładowa karta z Owczar 2008: teren świeżo skoszony).

Dlaczego: mozaika płatów różnych podtypów to znak, że zasolenie i użytkowanie działają na całym stanowisku. Izolowane płaty to resztki siedliska wypieranego przez glikofity.`,
  options: SPATIAL,
  inputLabel: 'Układ płatów',
  thresholds: {
    FV: 'Mozaikowy lub pasowy układ roślinności – łagodne przejścia między płatami w gradiencie zasolenia, wilgotności czy wydeptywania',
    U1: 'Nie w pełni realizowany mozaikowy lub pasowy układ roślinności',
    U2: 'Płaty roślinności halofilnej izolowane są od siebie na stanowisku',
  },
})

const saltBase = choiceIndicator({
  id: 'saltWater',
  label: 'Zasilanie wodami słonymi',
  cardinal: true,
  description:
    'Ocenie podlega nie tyle rodzaj źródła zasolenia, co jego aktualna aktywność, wyrażona m.in. występowaniem słonorośli i zajmowaną przez nie powierzchnią. Przy odwiertach – także stan zabezpieczenia i aktywność źródła.',
  help: `Co wybrać: czy solanka nadal swobodnie dociera do gleby. Brak oznak spadku zasolenia, swobodny dopływ i podsiąkanie, ECe >4 dS/m – FV. Wyraźny spadek zasolenia, zasilanie ograniczone przez osuszanie, rowy, wały – U1. Zanik oznak zasolenia, ECe <4 dS/m – U2.

Pomiary (przewodnik każe je zrobić – to najbardziej czasochłonny, ale najważniejszy wskaźnik):
• głębokość wód gruntowych w otworze ze świdra glebowego, do 1 m, w cm (głębiej – „>100”);
• zasolenie wody gruntowej, źródła albo rowu – konduktometr polowy, dS/m;
• zasolenie gleby w strefie korzeni (0–25 cm) jako ECe – przewodność nasyconego ekstraktu glebowego (można go zrobić w terenie), dS/m, odnoszona do skali Jacksona (1958). W płatach siedliska notowano 2 do ponad 20 dS/m.
Sprzęt: świder glebowy, szpadel, konduktometr, plastikowe pudełka na ekstrakt, woda destylowana.

Formularz: gdy najwyższy zmierzony ECe jest poniżej 4 dS/m, podpowiada U2 niezależnie od wyboru (próg z tab. 2). Gdy wybierasz FV, a część punktów ma ECe poniżej 4 dS/m – ostrzega.

Przykład (Owczary 2008): źródło 12,2 dS/m, rów 14,8 dS/m, gleba 7,62–18,8 dS/m, woda gruntowa na 20–50 cm, tylko jedno z trzech źródeł stałe, melioracje i zaczopowane źródła w przeszłości – U1.

Dlaczego: bez stałego dopływu słonej wody halofity ustępują glikofitom i trzcinie. Wskaźnik kardynalny.`,
  options: SALT_WATER,
  inputLabel: 'Zasilanie słoną wodą',
  after: [
    { kind: 'select', name: 'source', label: 'Źródło zasolenia', options: SALT_SOURCE, help: 'Skąd przychodzi słona woda: naturalne słone źródła (Owczary, Łęczyca), podsiąkanie słonych wód gruntowych (Łąki Pyzdrskie, Zgłowiączka) albo źródło antropogeniczne – odwiert, tężnia, przemysł sodowy (Ciechocinek, Inowrocław-Mątwy, Janikowo).' },
    { kind: 'number', name: 'eceMin', group: 'Zasolenie gleby ECe (0–25 cm)', label: 'Najniższe', unit: 'dS/m', min: 0, help: 'Najniższe ECe spośród monitorowanych punktów, w dS/m (= mS/cm). Przy jednym pomiarze wpisz go tu i obok tak samo albo zostaw drugie pole puste.' },
    { kind: 'number', name: 'eceMax', group: 'Zasolenie gleby ECe (0–25 cm)', label: 'Najwyższe', unit: 'dS/m', min: 0, help: 'Najwyższe ECe spośród monitorowanych punktów, w dS/m. Gdy nawet ono jest poniżej 4 dS/m, formularz podpowiada U2.' },
    { kind: 'number', name: 'waterEc', label: 'Zasolenie wody (źródło / gruntowa / rów)', unit: 'dS/m', min: 0, help: 'Przewodność wody zasilającej siedlisko z konduktometru polowego, w dS/m. Kilka pomiarów (źródło, rów) – wpisz główny, resztę w opisie.' },
    { kind: 'text', name: 'groundwater', label: 'Głębokość wód gruntowych', unit: 'cm', help: 'Głębokość lustra wody w otworze ze świdra glebowego, w cm, odczyt do 1 m. Może być zakres, np. „20–50”; głębiej niż 1 m – „>100”.' },
    { kind: 'textarea', name: 'note', label: 'Opis zasilania', rows: 3, help: 'Źródła (stałe czy okresowe), wypływy, rowy, wały, zastawki, stan odwiertu, zalewy i stagnowanie solanki. Trafia do pola „wartość” karty.' },
  ],
})

const moistureBase = choiceIndicator({
  id: 'moisture',
  label: 'Uwilgotnienie',
  description:
    'Wskaźnik spoza przewodnika metodycznego (Piernik 2010), oceniany w monitoringu 2014 i 2024: czy podłoże słonych łąk nie przesycha. Niekardynalny.',
  help: `Co wybrać: stan uwilgotnienia podłoża na transekcie. Brak oznak przesuszenia – FV, przesuszenie powierzchniowych poziomów gleby – U1, siedlisko wyraźnie przesuszone przy trwale obniżonych wodach gruntowych – U2. Nie da się ocenić (np. pierwsza obserwacja w nietypowo suchym okresie) – XX.

Skąd: przewodnik z 2010 r. tego wskaźnika nie ma, ale sprawozdania z 2014 i 2024 r. go oceniają (2024: 23 × FV, 1 × U1 przy przesuszeniu powierzchniowych poziomów gleby w Wilczkowicach/Leszczach, 1 × XX). Progi to interpretacja opisów ze sprawozdań. Wskaźnik niekardynalny – U2 tutaj nie przesądza o ocenie struktury.

Dlaczego: przesuszenie podłoża osłabia podsiąkanie solanki i otwiera drogę perzowi i innym glikofitom.`,
  options: MOISTURE,
  inputLabel: 'Uwilgotnienie podłoża',
  thresholds: {
    FV: 'Brak oznak przesuszenia',
    U1: 'Oznaki przesuszenia powierzchniowych poziomów gleby',
    U2: 'Siedlisko wyraźnie przesuszone, wody gruntowe trwale obniżone (interpretacja)',
  },
})

const REED_NATURAL: SelectOption[] = [
  { value: 'no', label: 'Nie – liczę trzcinę jak każdy gatunek ekspansywny' },
  { value: 'yes', label: 'Tak – płaty to podtyp 1340-3 (szuwar z sitowcem), trzciny nie liczę' },
]

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description: 'Zmiana powierzchni płatów siedliska na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury.',
    help: `Co wybrać: jak zmieniła się powierzchnia słonych łąk na stanowisku od poprzedniego badania albo względem danych z literatury. Nie zmienia się albo rośnie – FV, wyraźny spadek – U2, inne sytuacje – U1. Pierwsze badanie bez danych do porównania – XX.

Powierzchnię płatów (ha) wpisz poniżej. Drobne płaty rozrzucone w jednej kwaterze łąki to jedno stanowisko – trzeba wtedy koniecznie określić powierzchnię stanowiska i oszacować powierzchnię zajmowaną przez płaty siedliska. Płaty całkowicie zdominowane przez trzcinę są trudne do rozpoznania i zwykle się ich nie wlicza.

Praktyka 2024: areał od 1 ara do 11,45 ha, najczęściej 10–78 arów; obniżenie oceny tam, gdzie słone łąki się kurczą (zarastanie trzciną, wysładzanie).`,
    thresholds: {
      FV: 'Nie podlega zmianom w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze lub zwiększa się',
      U1: 'Inne kombinacje',
      U2: 'Wyraźny spadek powierzchni siedliska na stanowisku',
    },
    inputs: [
      {
        kind: 'select',
        name: 'trend',
        label: 'Zmiana powierzchni',
        options: AREA_TREND.map(({ value, label }) => ({ value, label })),
        help: 'Kierunek zmiany powierzchni płatów od poprzedniego badania. Zostaw puste, gdy ocenę wystawiasz sam (np. przepisując starą kartę).',
      },
      { kind: 'number', name: 'areaHa', label: 'Powierzchnia płatów siedliska', unit: 'ha', min: 0, help: 'Łączna powierzchnia płatów siedliska na stanowisku w hektarach (1 ar = 0,01 ha). Opcjonalne – trafi do pola „wartość”.' },
    ],
    suggest: (i) => AREA_TREND.find((o) => o.value === i.trend)?.grade ?? null,
    describe: (i) => {
      const a = num(i.areaHa)
      return [a !== undefined ? `${plNum(a)} ha` : '', i.trend ? labelOf(AREA_TREND, i.trend).toLowerCase() : ''].filter(Boolean).join(', ')
    },
  },
  {
    id: 'transect',
    label: 'Procent powierzchni zajęty przez siedlisko na transekcie',
    parameter: 'structure',
    cardinal: true,
    description:
      'Płaty mogą stanowić zwarty kompleks albo porozrzucane drobne fragmenty, np. w mikroobniżeniach wśród innych łąk. Preferowany jest duży stopień zwarcia płatów i duże pokrycie; silna fragmentacja znacząco obniża szanse utrzymania słonych muraw.',
    help: `Co wpisać: jaki procent powierzchni transektu zajmuje siedlisko 1340 (z dokładnością do 10%). Możesz też wpisać długość odcinków transektu z siedliskiem i długość całego transektu – formularz policzy udział (wpisany procent ma pierwszeństwo).

Progi: powyżej 75% – FV, 50–75% – U1, poniżej 50% – U2 (75% i 50% to jeszcze U1).

W przewodniku ten wskaźnik nazywa się „Udział procentowy siedliska na transekcie”, a progi w tab. 2 odnoszą się do powierzchni stanowiska – sprawozdania 2014–2024 liczą go na transekcie i tak robi formularz.

Praktyka 2024: 14 × FV, 5 × U1 (udział 50–75%: Błonie 1, Łąki Pyzdrskie 2, Pełczyska 2, Słonawy, Zgłowiączka 2), 6 × U2 (m.in. Solnia – spadek ze 100% do 30%, Zgłowiączka 1 – 10% przy niewykaszanej trzcinie). Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Powyżej 75% powierzchni transektu zajmuje siedlisko 1340',
      U1: 'Siedlisko zajmuje 50–75% powierzchni transektu',
      U2: 'Siedlisko zajmuje mniej niż 50% powierzchni transektu',
    },
    inputs: [
      { kind: 'number', name: 'share', label: 'Udział siedliska na transekcie', unit: '%', min: 0, max: 100, help: 'Procent powierzchni transektu zajęty przez płaty siedliska 1340, z dokładnością do 10%.' },
      { kind: 'number', name: 'habitatLength', group: 'Albo z długości odcinków', label: 'Odcinki z siedliskiem', unit: 'm', min: 0, help: 'Łączna długość odcinków transektu, na których jest siedlisko 1340, w metrach. Opcjonalne – zamiast udziału wprost.' },
      { kind: 'number', name: 'transectLength', group: 'Albo z długości odcinków', label: 'Długość transektu', unit: 'm', min: 0, help: 'Całkowita długość transektu w metrach.' },
    ],
    suggest: (i) => {
      const p = transectShare(i).pct
      return p === undefined ? null : gradeTransect1340(p)
    },
    explain: (i) => {
      const { pct, from } = transectShare(i)
      return pct !== undefined && from === 'lengths' ? `Siedlisko na ${fmt(pct)} długości transektu.` : null
    },
    warn: (i) => {
      const a = num(i.habitatLength)
      const b = num(i.transectLength)
      return a !== undefined && b !== undefined && a > b ? 'Odcinki z siedliskiem dłuższe niż transekt? Sprawdź wpis.' : null
    },
    describe: (i) => {
      const { pct, from } = transectShare(i)
      if (pct === undefined) return ''
      return from === 'lengths' ? `${fmt(pct)} (${plNum(num(i.habitatLength)!)} z ${plNum(num(i.transectLength)!)} m)` : fmt(pct)
    },
  },
  {
    id: 'characteristic',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Za gatunki charakterystyczne uważa się halofity: obligatoryjne (występujące tylko na siedliskach słonych) i fakultatywne (najlepiej rozwijające się na glebach słonych, ale spotykane też poza nimi).',
    help: `Co wpisać: wszystkie halofity na transekcie z pokryciem w %, najpierw obligatoryjne, potem fakultatywne (tak każe przewodnik).
• Halofity obligatoryjne: soliród zielny Salicornia europaea, muchotrzew solniskowy Spergularia salina, aster solny Aster tripolium, sit Gerarda Juncus gerardi, mlecznik nadmorski Glaux maritima, świbka morska Triglochin maritimum, łoboda oszczepowata odm. solniskowa Atriplex prostrata subsp. prostrata var. salina.
• Halofity fakultatywne: mannica odstająca Puccinellia distans, komonica wąskolistna Lotus tenuis, nostrzyk ząbkowany Melilotus dentatus, komonica skrzydlatostrąkowa Tetragonolobus maritimus, prawoślaz lekarski Althaea officinalis, koniczyna rozdęta Trifolium fragiferum, oczeret Tabernemontana Schoenoplectus tabernaemontani, sitowiec nadmorski Bolboschoenus maritimus, turzyca odległokłosa Carex distans, centuria nadobna Centaurium pulchellum, kostrzewa trzcinowata Festuca arundinacea, sit żabi Juncus ranarius, brodawnik różnoowockowy Leontodon taraxacoides.

Jak liczy formularz (interpretacja tab. 2): liczba halofitów z obu list ≥10 („>9”) i choć jeden halofit obligatoryjny pokrywa >25% – FV; halofitów 6 lub mniej („<7”) – U2; wszystko pomiędzy (7–9 gatunków albo ≥10 bez obligatoryjnego >25%) – U1. Gatunki spoza obu list (np. ostrzew rudy, babka nadmorska) trafią do karty, ale się nie liczą.

Przykład (Owczary 2008): 9 halofitów, najwyższy obligatoryjny – łoboda <10% – U1.

Dlaczego: obecność halofitów odróżnia siedlisko od zwykłych łąk. Ich ubywanie to pierwszy sygnał wysładzania albo zarastania. Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Udział halofitów >9 gatunków, pokrywanie poszczególnych gatunków halofitów obligatoryjnych >25% (1–2 gatunki)',
      U1: 'Sytuacje pośrednie',
      U2: 'Udział halofitów <7 gatunków, niektóre gatunki występują sporadycznie',
    },
    inputs: [speciesInput('Halofity na transekcie', 'Halofity obligatoryjne i fakultatywne z pokryciem w % powierzchni transektu (z dokładnością do 10%, „<10%” wpisz jako 5).', true)],
    suggest: (i) => characteristic1340(i).grade,
    explain: (i) => characteristic1340(i).reason || null,
    describe: (i) => describeSpecies(named(i.species)),
  },
  {
    id: 'dominant',
    label: 'Gatunki dominujące',
    parameter: 'structure',
    cardinal: true,
    description:
      'Ze względu na udział dwóch grup gatunków na solniskach – halofitów i gatunków towarzyszących (glikofitów) – wymienia się gatunki o pokryciu ≥10% w obu grupach.',
    help: `Co wpisać: wszystkie gatunki o pokryciu co najmniej 10% na transekcie – i halofity, i glikofity – z pokryciem w %. Formularz rozpoznaje grupy z katalogu; gatunek spoza katalogu liczy się jako glikofit.

Jak liczy formularz (interpretacja tab. 2):
• żaden halofit nie przekracza 10% – U2 (dominują glikofity, np. trzcina pospolita Phragmites australis albo perz właściwy Elymus repens);
• halofity łącznie pokrywają co najmniej tyle, co glikofity – FV (halofity dominują lub współdominują);
• glikofity przeważają, ale któryś halofit przekracza 10% – U1 (sytuacja pośrednia).

Udział glikofitów odnoś do składu typowego dla zespołów poszczególnych podtypów – w szuwarze z sitowcem (1340-3) trzcina bywa naturalnym składnikiem, w łąkach z kostrzewą trzcinową (1340-4) glikofitów jest więcej niż w murawach z mannicą (1340-1). Gdy to przesądza o ocenie, popraw podpowiedź i napisz dlaczego.

Przykład (Owczary 2008): halofity 10–20% (sitowiec, kostrzewa trzcinowata, turzyca odległokłosa, nostrzyk), trzcina 70%, wiechlina łąkowa 30% – U1. Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Halofity dominują lub współdominują z gatunkami towarzyszącymi, glikofity o udziale typowym dla halofilnych zespołów roślinnych',
      U1: 'Sytuacje pośrednie',
      U2: 'Dominują glikofity, żaden z halofitów nie osiąga pokrywania ponad 10%, glikofity o udziale wyższym niż w typowych zespołach halofilnych (np. dominacja Phragmites australis bądź Elymus repens)',
    },
    inputs: [speciesInput('Gatunki dominujące (≥10%)', 'Gatunki o pokryciu co najmniej 10% na transekcie – halofity i glikofity – z pokryciem w %.', true)],
    suggest: (i) => dominance1340(i).grade,
    explain: (i) => dominance1340(i).reason || null,
    describe: (i) => {
      const rows = named(i.species)
      const halo = rows.filter((r) => isAnyHalophyte(groupOf1340(r.name)))
      const glyco = rows.filter((r) => !isAnyHalophyte(groupOf1340(r.name)))
      return [halo.length ? `Halofity: ${describeSpecies(halo)}` : '', glyco.length ? `Glikofity: ${describeSpecies(glyco)}` : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'invasive',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    description:
      'Na solniskach rzadko obserwuje się obce gatunki inwazyjne, ale z antropogenicznych siedlisk słonych mogą wkraczać gatunki obce, np. jęczmień grzywiasty Hordeum jubatum. Wskaźnik dotyczy gatunków obcych geograficznie.',
    help: `Co wpisać: każdy gatunek obcy geograficznie na transekcie, z pokryciem w %. Brak – zostaw listę pustą.

Progi: łączne pokrycie poniżej 25% – FV, 25–50% – U1, powyżej 50% – U2 (25% i 50% to U1).

Praktyka: w 2016–2018 i 2024 r. sporadycznie nawłoć późna Solidago gigantea i przymiotno kanadyjskie Conyza canadensis. W 2024 r. Gadawa z dużym udziałem nawłoci dostała U2, mimo że w skali transektu było ok. 10% – ekspert może ocenić surowiej niż tabela, gdy siedlisko i tak zanikło. Przymiotno w pojedynczych osobnikach nie obniża oceny.

Dlaczego: zasolenie odsiewa większość obcych gatunków, więc nawłoć na słonej łące to znak, że siedlisko wysładza się albo przesycha.`,
    thresholds: {
      FV: 'Brak obcych gatunków inwazyjnych lub mniej niż 25% badanego płatu jest pokryte przez obce gatunki inwazyjne',
      U1: '25–50% pokrycia',
      U2: '>50% pokrycia',
    },
    inputs: [speciesInput('Obce gatunki inwazyjne', 'Gatunki obce geograficznie z pokryciem w % powierzchni transektu. Brak – zostaw pustą listę.')],
    suggest: (i) => {
      const { count, total } = listCover(i)
      return count === 0 ? 'FV' : total === undefined ? null : gradeShare1340(total)
    },
    explain: (i) => {
      const { count, total } = listCover(i)
      return count ? `Gatunków: ${count}, łączne pokrycie ${fmt(total)}.` : null
    },
    describe: (i) => describeSpecies(named(i.species)) || 'Brak',
  },
  {
    id: 'expansive',
    label: 'Rodzime gatunki ekspansywne roślin zielnych',
    parameter: 'structure',
    cardinal: true,
    description:
      'Głównym gatunkiem ekspansywnie wkraczającym na słone łąki, szczególnie po zaprzestaniu użytkowania, jest trzcina pospolita Phragmites australis, która stopniowo eliminuje światłolubne halofity. Na siedliskach suchszych ekspansywny może być perz właściwy Elymus repens.',
    help: `Co wpisać: rodzime gatunki ekspansywne na transekcie, z pokryciem w %: trzcina pospolita, perz właściwy, a według sprawozdania 2024 także życica trwała Lolium perenne i trzcinnik piaskowy Calamagrostis epigejos. Brak – zostaw listę pustą. Osobno możesz wpisać największy udział ekspansywnych w pojedynczym płacie.

Progi: łączne pokrycie poniżej 25% – FV, 25–50% – U1, powyżej 50% albo obecność płatów z udziałem ekspansywnych >50% – U2.

Wyjątek z przewodnika: udział trzciny ponad 25% nie jest niewłaściwy w podtypie 1340-3 (halofilny szuwar z sitowcem nadmorskim). Gdy transekt obejmuje tylko ten podtyp, zaznacz to – trzcina nie będzie liczona. Przy mozaice podtypów (jak w Owczarach) trzcinę się liczy.

Przykład (Owczary 2008): trzcina 70% – U2. Praktyka 2024: 7 × U2 (trzcina, perz, życica), poprawa wszędzie tam, gdzie wrócono do koszenia. Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Udział trzciny pospolitej Phragmites australis, ewentualnie innych gatunków ekspansywnych <25% pokrycia',
      U1: 'Udział na stanowisku trzciny pospolitej Phragmites australis, ewentualnie innych gatunków 25–50% pokrycia',
      U2: 'Udział na stanowisku trzciny pospolitej Phragmites australis, ewentualnie innych gatunków >50% pokrycia lub obecność płatów o udziale >50%',
    },
    inputs: [
      speciesInput('Gatunki ekspansywne', 'Rodzime gatunki ekspansywne z pokryciem w % powierzchni transektu. Brak – zostaw pustą listę.'),
      { kind: 'number', name: 'maxPatch', label: 'Największy udział w pojedynczym płacie (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Gdy na transekcie są płaty, w których gatunki ekspansywne pokrywają więcej niż połowę powierzchni, wpisz ich największy udział – powyżej 50% to U2 niezależnie od średniej.' },
      { kind: 'select', name: 'reedNatural', label: 'Transekt tylko w podtypie 1340-3?', options: REED_NATURAL, help: 'W halofilnym szuwarze z sitowcem nadmorskim (1340-3) trzcina jest naturalnym składnikiem i jej udział >25% nie jest niewłaściwy. Zaznacz „Tak” tylko, gdy cały transekt leży w tym podtypie.' },
    ],
    suggest: (i) => expansive1340(i).grade,
    explain: (i) => {
      const rows = named(i.species)
      if (!rows.length && num(i.maxPatch) === undefined) return null
      const { total, counted } = expansive1340(i)
      const parts = [`Liczone gatunki: ${counted.length}, łączne pokrycie ${fmt(total)}.`]
      if (i.reedNatural === 'yes' && counted.length < rows.length) parts.push('Trzcina pominięta (podtyp 1340-3).')
      const mp = num(i.maxPatch)
      if (mp !== undefined && mp > 50) parts.push(`Płat z udziałem ${fmt(mp)} – U2.`)
      return parts.join(' ')
    },
    describe: (i) => {
      const list = describeSpecies(named(i.species)) || 'Brak'
      const mp = num(i.maxPatch)
      return [list, mp !== undefined ? `maks. w płacie ${fmt(mp)}` : '', i.reedNatural === 'yes' ? 'podtyp 1340-3 – trzciny nie liczono' : '']
        .filter(Boolean)
        .join('; ')
    },
  },
  {
    ...shrubsBase,
    describe: (i) => {
      const list = describeSpecies(named(i.species))
      return list || labelOf(SHRUBS, i.choice)
    },
  },
  {
    ...spatialBase,
  },
  {
    ...saltBase,
    suggest: (i) => {
      const { max } = eceRange(i)
      if (max !== undefined && max < ECE_MIN) return 'U2'
      return saltBase.suggest!(i)
    },
    explain: (i) => {
      const { max } = eceRange(i)
      return max !== undefined && max < ECE_MIN ? `Najwyższe ECe ${plNum(max)} dS/m – poniżej 4 dS/m, czyli U2 (tab. 2).` : null
    },
    warn: (i) => {
      const { min, max } = eceRange(i)
      if (min !== undefined && max !== undefined && min > max) return 'Najniższe ECe większe niż najwyższe? Sprawdź wpis.'
      if (i.choice === 'free' && min !== undefined && min < ECE_MIN)
        return `Część punktów ma ECe ${plNum(min)} dS/m – poniżej 4 dS/m. FV wymaga ECe >4 dS/m; sprawdź wybór.`
      return null
    },
    describe: (i) => {
      const parts = [
        String(i.note ?? '').trim() || labelOf(SALT_WATER, i.choice),
        i.source ? `źródło: ${labelOf(SALT_SOURCE, i.source).split(' (')[0].toLowerCase()}` : '',
        num(i.waterEc) !== undefined ? `zasolenie wody ${plNum(num(i.waterEc)!)} dS/m` : '',
        eceText(i),
        String(i.groundwater ?? '').trim() ? `wody gruntowe na głębokości ${String(i.groundwater).trim()} cm` : '',
      ].filter(Boolean)
      return parts.join('; ')
    },
  },
  moistureBase,
]

/** Udział siedliska na transekcie: wpisany wprost ma pierwszeństwo, inaczej liczony z długości odcinków. */
export function transectShare(i: InputValues): { pct?: number; from?: 'typed' | 'lengths' } {
  const typed = num(i.share)
  if (typed !== undefined) return { pct: typed, from: 'typed' }
  const a = num(i.habitatLength)
  const b = num(i.transectLength)
  if (a === undefined || b === undefined || b <= 0) return {}
  return { pct: Math.round((a / b) * 1000) / 10, from: 'lengths' }
}

// ---------- pola stanowiska ----------

const SUBTYPES_HELP = `Podtypy (Nienartowicz, Piernik 2004):
• 1340-1 murawy z mannicą odstającą i muchotrzewem solniskowym Puccinellio-Spergularietum salinae;
• 1340-2 śródlądowe słone łąki ze świbką morską i mlecznikiem nadmorskim Triglochino-Glaucetum maritimae;
• 1340-3 halofilny szuwar z sitowcem nadmorskim Scirpetum maritimi (puccinellietosum);
• 1340-4 śródlądowe (subhalofilne) słone łąki z kostrzewą trzcinową i pięciornikiem gęsim Potentillo-Festucetum arundinaceae;
• 1340-5 halofilne murawy z ostrzewem rudym – zbiorowisko z Blysmus rufus.
Lokalnie także murawy z turzycą odległokłosą Carex distans i kostrzewą czerwoną (solanki łęczyckie), Blysmo-Juncetum compressi z udziałem słonorośli, halofilny podzespół łąki owsicowej z komonicą wąskolistną i płaty łobody oszczepowatej odm. solniskowej.

Jedno stanowisko zwykle obejmuje kilka podtypów (siedlisko ma charakter mozaikowy) – wpisz wszystkie.`

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu, z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Owczary k. Buska-Zdroju',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Owczary k. Buska-Zdroju”, „Łąki Pyzdrskie 2”, „Ciechocinek 1”.

Słone łąki leżą zwykle w kompleksie z innymi łąkami na niewielkim obszarze, więc stanowiska w jednym obszarze numeruje się (Janikowo1, Janikowo2…). Stanowisko to odizolowana powierzchnia (rozdzielona rowami melioracyjnymi albo innymi zbiorowiskami), zwykle ok. 0,2 ha lub więcej. Sposób i intensywność użytkowania nie są kryterium wyznaczania stanowiska – zależą od właściciela łąki.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'subtypes',
    label: 'Podtypy siedliska na stanowisku',
    required: true,
    placeholder: 'np. 1340-3, 1340-4',
    help: SUBTYPES_HELP,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Scirpetum maritimi puccinellietosum, Potentillo-Festucetum arundinaceae',
    help: `Zespoły i zbiorowiska na stanowisku, łacińskimi nazwami, np. Puccinellio-Spergularietum salinae, Triglochino-Glaucetum maritimae, Scirpetum maritimi, Potentillo-Festucetum arundinaceae, zbiorowisko z Blysmus rufus.

Identyfikatory fitosocjologiczne: klasa Asteretea tripolium (rząd Glauco-Puccinellietalia, związki Puccinellion maritimae i Armerion maritimae), a także zbiorowiska z udziałem słonorośli w klasach Phragmitetea, Molinio-Arrhenatheretea i Cakiletea maritimae.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Położenie, źródło zasolenia, układ podtypów, użytkowanie (koszenie, wypas), rowy, zarastanie trzciną.',
    help: `Syntetyczny opis stanowiska:
• gdzie leży, w jakiej formie terenu (niecka, dolina, sąsiedztwo zakładów sodowych);
• skąd zasolenie: słone źródła (ile, stałe czy okresowe), podsiąkanie słonych wód gruntowych, odwierty, tężnie;
• rozmieszczenie podtypów – np. szuwar z sitowcem w obniżeniach i miejscach podtopionych, łąki z kostrzewą trzcinową w miejscach suchszych;
• użytkowanie: koszenie (kiedy, jaka część stanowiska), wypas, porzucenie;
• rowy melioracyjne, zastawki, zarastanie trzciną, nasadzenia olszy.

Dlaczego: stanowisk jest niewiele i każde ma inne uwarunkowania – opis to podstawa porównań między cyklami.`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Powierzchnia płatów siedliska na stanowisku w hektarach (np. 0,61 ha w Owczarach). Gdy płaty są drobne i rozproszone w kwaterze łąki – określ powierzchnię stanowiska i oszacuj powierzchnię zajętą przez płaty (wtedy obie w opisie).',
  },
  pickField(methodology7120.siteFields, 'protectedAreas'),
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    required: true,
    placeholder: 'np. 15x145 m (0,22 ha)',
    hint: 'Przewodnik nie narzuca wymiarów – transekt przez płaty siedliska, np. 15×145 m w Owczarach.',
    help: `Przewodnik dla 1340 nie podaje standardowego wymiaru transektu. Poprowadź go tak, żeby przechodził przez płaty siedliska i obejmował różne podtypy, i wpisz faktyczne wymiary z powierzchnią, np. „15x145 m (0,22 ha)” jak w przykładowej karcie z Owczar.

W kolejnych cyklach trzymaj ten sam przebieg – inaczej udział siedliska na transekcie nie będzie porównywalny.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 215',
    help: 'Wysokość terenu w metrach n.p.m. Kujawy i Wielkopolska to ok. 50–100 m, okolice Łęczycy ok. 100–120 m, Ponidzie ok. 200 m.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 31.05.2008',
    required: true,
    hint: 'Od końca maja do końca września. Raz na 3 lata.',
    help: 'Dzień badań terenowych. Słone łąki monitoruje się od końca maja do końca września, kiedy halofity osiągają optimum rozwoju i da się ocenić intensywność użytkowania (koszenie raz lub dwa razy w roku, wypas). Przewodnik: raz na 3 lata. Uwaga na koszenie – na świeżo skoszonej części stanowiska ocena gatunków i struktury bywa niemożliwa (sprawozdanie 2016–2018).',
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const [, m, d] = v.split('-').map(Number)
      const ok = (m === 5 && d >= 20) || (m >= 6 && m <= 9)
      return ok ? null : 'Termin poza oknem z przewodnika (koniec maja – koniec września). Halofity mogą być nierozwinięte albo już skoszone.'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcie fitosocjologiczne ----------

const releveFields: FieldDef[] = [
  { kind: 'text', name: 'coords', label: 'Współrzędne środka zdjęcia', help: 'Współrzędne GPS środka powierzchni zdjęcia (WGS84) i wysokość n.p.m.' },
  {
    kind: 'text',
    name: 'place',
    label: 'Położenie na transekcie',
    help: 'Gdzie leży zdjęcie, np. „zachodnia część transektu”, „środkowa część, ok. 66 m od źródła, fragment nieskoszony”. Pozwala trafić w to samo miejsce w następnym cyklu.',
  },
  {
    kind: 'number',
    name: 'area',
    group: 'Powierzchnia i pokrycie',
    label: 'Powierzchnia zdjęcia',
    unit: 'm²',
    min: 0,
    defaultValue: 25,
    help: 'Zwykle 5×5 m = 25 m²; przy wąskim płacie inny kształt, np. 3×8 m = 24 m² (przykładowa karta z Owczar).',
  },
  {
    kind: 'number',
    name: 'cover',
    group: 'Powierzchnia i pokrycie',
    label: 'Ogólne pokrycie',
    unit: '%',
    min: 0,
    max: 100,
    help: 'Procent powierzchni zdjęcia pokryty przez roślinność (rzut pionowy).',
  },
  {
    kind: 'text',
    name: 'unit',
    label: 'Jednostka fitosocjologiczna',
    help: 'Zespół lub zbiorowisko, do którego należy zdjęcie, np. Scirpetum maritimi puccinellietosum, Potentillo-Festucetum arundinaceae.',
  },
  {
    kind: 'releve-species',
    name: 'species',
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki na powierzchni zdjęcia z ilościowością w skali Braun-Blanqueta (r, +, 1–5). Roślinność zielna w warstwie C; krzewy i podrost (np. olsza) w B.',
  },
]

export const methodology1340: Methodology = {
  code: '1340',
  name: 'Śródlądowe słone łąki, pastwiska i szuwary (Glauco-Puccinellietalia część – zbiorowiska śródlądowe)',
  priority: true,
  source:
    'Piernik A. 2010, 1340 Śródlądowe słone łąki, pastwiska i szuwary (Glauco-Puccinellietalia część – zbiorowiska śródlądowe), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ (tab. 1 i 2), z praktyką ocen z monitoringu 2014, 2016–2018 i 2024',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Zdjęcia fitosocjologiczne na transekcie – po jednym w każdym podtypie albo na początku, w środku i na końcu transektu. Zwykle 5×5 m. Skala Braun-Blanqueta.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Realne możliwości zachowania właściwego stanu siedliska lub poprawy stanu niewłaściwego. Perspektywy słonych łąk zależą od zasilania słonymi wodami i od użytkowania łąkarsko-pasterskiego; za właściwe uznaje się perspektywy łąk użytkowanych, o dużym udziale halofitów, bez płatów zdominowanych przez trzcinę.',
    help: `Oceniając perspektywy, weź pod uwagę trwałość dopływu słonej wody (źródła, odwierty, rowy, zastawki), użytkowanie (koszenie z wywozem siana raz–dwa razy w roku, wypas do ok. 1 DJP/ha od lipca do końca października) i jego przyszłość (własność prywatna, dopłaty), tempo zarastania trzciną oraz plany zmian stosunków wodnych. W opisie umieść potencjalne zabiegi ochronne.

Praktyka 2024: poprawa wszędzie tam, gdzie łąki są koszone (Błonie, Łąki Pyzdrskie 5 i 6, Owczary); zagrożeniem jest zarzucenie koszenia i wypasu, konkurencja trzciny i osuszanie.`,
    thresholds: {
      FV: 'Perspektywy ochrony siedliska dobre lub doskonałe; nie przewiduje się znaczącego oddziaływania czynników zagrażających – zaprzestania użytkowania i zmiany stosunków wodnych; przetrwanie w dłuższej perspektywie czasowej bardzo prawdopodobne',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy ochrony siedliska są złe; obserwowany jest silny wpływ czynników zagrażających (odwadnianie terenu, zarzucenie użytkowania); nie można zagwarantować przetrwania w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A02', name: 'Zmiana sposobu uprawy' },
    { code: 'A03', name: 'Koszenie / ścinanie trawy' },
    { code: 'A03.01', name: 'Intensywne koszenie lub intensyfikacja' },
    { code: 'A03.02', name: 'Nieintensywne koszenie' },
    { code: 'A03.03', name: 'Zaniechanie / brak koszenia' },
    { code: 'A04', name: 'Wypas' },
    { code: 'A04.02.01', name: 'Nieintensywny wypas bydła' },
    { code: 'A04.03', name: 'Zarzucenie pasterstwa, brak wypasu' },
    { code: 'A08', name: 'Nawożenie / nawozy sztuczne' },
    { code: 'A11', name: 'Inne rodzaje praktyk rolniczych, nie wymienione powyżej' },
    { code: 'B01.01', name: 'Zalesianie terenów otwartych (drzewa rodzime)' },
    { code: 'C01.05', name: 'Warzelnie soli' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02.01', name: 'Zasypywanie terenu, melioracje i osuszanie – ogólnie' },
    { code: 'J02.01.02', name: 'Osuszanie terenów morskich, ujściowych, bagiennych' },
    { code: 'J02.04', name: 'Zalewanie - modyfikacje' },
    { code: 'J02.04.02', name: 'Brak zalewania' },
    { code: 'J02.06', name: 'Pobór wód z wód powierzchniowych' },
    { code: 'J02.07', name: 'Pobór wód z wód podziemnych' },
    { code: 'J02.09.01', name: 'Działanie słonej wody na wody podziemne' },
    { code: 'J02.15', name: 'Inne spowodowane przez człowieka zmiany stosunków wodnych' },
    { code: 'K01.03', name: 'Wyschnięcie' },
    { code: 'K01.04', name: 'Zatopienie' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K04', name: 'Międzygatunkowe interakcje wśród roślin' },
    { code: 'K04.01', name: 'Konkurencja' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. gniazdowanie ptaków (derkacz), sąsiedztwo muraw kserotermicznych, rzadkie halofity.',
        help: 'Wartości przyrodnicze stanowiska poza samym siedliskiem: miejsca gniazdowania ptaków (na Łąkach Pyzdrskich derkacz Crex crex, załącznik I Dyrektywy Ptasiej), rzadkie halofity (soliród zielny, aster solny – dziś głównie na stanowiskach antropogenicznych), sąsiedztwo innych siedlisk (np. muraw kserotermicznych w Owczarach). Brak informacji – „Nie pozyskano danych”.',
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: `Jakie działania ochronne wykonano i jaka jest ich skuteczność, oraz co proponujesz. Typowe dla 1340 (przewodnik, pkt 5): tradycyjne koszenie bez nawożenia, z wywozem siana, raz–dwa razy w roku (sianokosy ok. 1 lipca – z uwagi na gniazdujące ptaki), koszenie także płatów zarośniętych trzciną; umiarkowany wypas do 1 DJP/ha od lipca do końca października; rozpoznanie i zabezpieczenie dopływu słonej wody, odtwarzanie okresowych zalewów i stagnowania solanki (Błonie k. Łęczycy, Ciechocinek, Owczary). Brak działań – „Brak”.`,
      }
    return f
  }),

  speciesCatalog: SPECIES_1340.map((s) => ({ value: s.latin, label: s.polish, layer: defaultLayer1340(s) })),
  speciesInfo: (name) => {
    const e = findSpecies1340(name)
    if (!e) return undefined
    return e.expansive ? `${GROUP_LABELS_1340[e.group]}, ekspansywny` : GROUP_LABELS_1340[e.group]
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator1340 = (id: string): IndicatorDef => {
  const i = methodology1340.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 1340`)
  return i
}
