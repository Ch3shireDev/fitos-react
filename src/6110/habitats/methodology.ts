// Metodyka 6110 (skały wapienne i neutrofilne z roślinnością pionierską Alysso-Sedion) jako dane. Źródło:
// Świerkosz K., Szczęśniak E., Reczyńska K. 2010, „6110 Skały wapienne i neutrofilne z roślinnością pionierską
// (Alysso-Sedion)” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ, s. 95–105
// (tab. 1 i 2, karta Wapniarka), z modyfikacją metodyki z 17.07.2015 (usunięty wskaźnik „Ocienienie muraw”) i praktyką
// oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014, 2015–2018 i 2024.
// Siedlisko niepriorytetowe, tylko region kontynentalny (Sudety i Przedgórze, Opolszczyzna, Jura). Stanowisko to grupa
// płatów na półkach skalnych odległych od siebie najwyżej o 50 m; transektu zwykle nie da się wyznaczyć – powierzchnia
// siedliska to suma płatów (standardowo 3) ze zdjęciami fitosocjologicznymi i płatów widzianych z daleka.
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_6110,
  SPECIES_6110,
  defaultLayer6110,
  findSpecies6110,
  isAlien6110,
  isCharacteristic6110,
  isExpansive6110,
  isTypicalDominant6110,
  isWoody6110,
  speciesKey6110,
} from './species'

// ---------- liczby i zakresy ----------

/** Liczba albo zakres jak w karcie papierowej: „80”, „70–80”, „ok. 10%”. Zakres daje środek. Bzdura -> undefined. */
export function parseRange6110(value: unknown): { lo: number; hi: number; mid: number } | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? { lo: value, hi: value, mid: value } : undefined
  const t = String(value ?? '')
    .toLowerCase()
    .replace(/ok\.?|około|%/g, '')
    .replace(/,/g, '.')
    .replace(/\s+/g, '')
  const m = /^(\d+(?:\.\d+)?)(?:[-–—](\d+(?:\.\d+)?))?$/.exec(t)
  if (!m) return undefined
  const lo = Number(m[1])
  const hi = m[2] !== undefined ? Number(m[2]) : lo
  return { lo: Math.min(lo, hi), hi: Math.max(lo, hi), mid: Math.round(((lo + hi) / 2) * 1000) / 1000 }
}

// ---------- progi liczbowe (tab. 2) ----------

/** Udział procentowy siedliska na transekcie: 100–70% FV (70 też), 70–40% U1 (40 też), poniżej 40% U2. */
export const gradeShare6110 = (p: number): Grade => (p >= 70 ? 'FV' : p >= 40 ? 'U1' : 'U2')

/** Gatunki charakterystyczne: co najmniej 4 FV, 2–3 U1, jeden albo brak U2. */
export const gradeCharacteristic6110 = (count: number): Grade => (count >= 4 ? 'FV' : count >= 2 ? 'U1' : 'U2')

/** Obce gatunki inwazyjne (łączne pokrycie): brak FV, obecne do 2% U1 („poniżej 2%”; 2 też), powyżej 2% U2. */
export const gradeAliens6110 = (count: number, total: number | undefined): Grade | null => {
  if (count <= 0) return 'FV'
  if (total === undefined) return null
  return total > 2 ? 'U2' : 'U1'
}

/** Rodzime gatunki ekspansywne roślin zielnych: brak FV, obecne do 5% U1 („nie więcej niż 5%”), powyżej 5% U2. */
export const gradeExpansive6110 = (count: number, total: number | undefined): Grade | null => {
  if (count <= 0) return 'FV'
  if (total === undefined) return null
  return total > 5 ? 'U2' : 'U1'
}

/** Ekspansja krzewów i podrostu drzew (zwarcie warstw B i A): brak FV, do 30% U1 (30 też), powyżej 30% U2. */
export const gradeShrubs6110 = (cover: number): Grade => (cover <= 0 ? 'FV' : cover <= 30 ? 'U1' : 'U2')

/** Do tego progu ocienienie to „słabe” (FV) – próg formularza ze sprawozdania 2015–2018 („0 do ok. 10%” na FV). */
export const WEAK_SHADE = 10

/** Ocienienie muraw: brak lub słabe (do 10%) FV, do 20% U1 (20 też), powyżej 20% U2. */
export const gradeShade6110 = (p: number): Grade => (p <= WEAK_SHADE ? 'FV' : p <= 20 ? 'U1' : 'U2')

/**
 * Zniszczenia mechaniczne (antropogeniczne – wydeptywanie, zgryzanie i wydeptywanie przez muflony): brak FV,
 * śladowe do 10% U1, powyżej 20% U2. Luka 10–20% w tab. 2 – formularz liczy ją do U1.
 */
export const gradeDamage6110 = (p: number): Grade => (p <= 0 ? 'FV' : p <= 20 ? 'U1' : 'U2')

/** Karta każe wpisywać jako dominanty tylko gatunki o pokryciu co najmniej 10%. */
export const DOMINANT_MIN = 10

const pct = (v: number) => `${plNum(v)}%`
const rangeText = (s: string) => s.trim().replace(/\s*[-–—]\s*/, '–')
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey6110(n), n])).values()]
const round1 = (n: number) => Math.round(n * 10) / 10

/** Suma pokrycia wierszy listy; pusta lista -> 0; wiersze bez żadnego pokrycia -> undefined. */
function listTotal(list: unknown): number | undefined {
  const rows = speciesRows(list).filter((r) => r.name?.trim())
  if (!rows.length) return 0
  const covers = rows.map((r) => num(r.cover)).filter((c): c is number => c !== undefined)
  return covers.length ? round1(covers.reduce((a, b) => a + b, 0)) : undefined
}

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'other', label: 'Inne kombinacje (np. niewielki spadek, siedlisko w formach inicjalnych)', grade: 'U1' },
  { value: 'decrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const DOMINANT: GradedOption[] = [
  { value: 'fv', label: 'Gatunki dominujące są jednocześnie charakterystycznymi', grade: 'FV' },
  { value: 'u1', label: 'Gatunki charakterystyczne współdominują w siedlisku', grade: 'U1' },
  { value: 'u2', label: 'Gatunki dominujące nie są charakterystyczne dla siedliska', grade: 'U2' },
]
const MOSAIC: GradedOption[] = [
  { value: 'kept', label: 'Zachowana mozaika siedliskowa i strukturalna', grade: 'FV' },
  { value: 'disturbed', label: 'Zaburzona mozaika siedliskowa i strukturalna', grade: 'U1' },
  { value: 'none', label: 'Niewidoczna mozaika siedliskowa i strukturalna, homogenizacja płatów', grade: 'U2' },
]
const DAMAGE_KIND: SelectOption[] = [
  { value: '', label: '—' },
  { value: 'none', label: 'Brak zniszczeń' },
  { value: 'natural', label: 'Tylko naturalne (odrywanie się głazów od ścian skalnych)' },
  { value: 'human', label: 'Antropogeniczne lub od zwierząt (wydeptywanie, zgryzanie, muflony)' },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

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

const coverField = (label: string, help: string): FieldDef => ({ kind: 'number', name: 'cover', label, unit: '%', min: 0, max: 100, help })

// ---------- zestaw wskaźników ----------

/**
 * Modyfikacja metodyki z 17.07.2015 usunęła „Ocienienie muraw” (8 wskaźników struktury). Przewodnik 2010, karta
 * przykładowa i – mimo modyfikacji – monitoring 2018 i 2024 oceniały 9 wskaźników, z ocienieniem jako kardynalnym.
 */
export const INDICATOR_SETS: SelectOption[] = [
  { value: 'mod2015', label: 'Modyfikacja metodyki z 17.07.2015 – 8 wskaźników (bez ocienienia muraw)' },
  { value: 'guide2010', label: 'Przewodnik 2010 i karta przykładowa – 9 wskaźników (z ocienieniem muraw, jak w monitoringu 2018 i 2024)' },
]
const withShade = (ctx: IndicatorContext) => ctx.site?.indicatorSet === 'guide2010'

// ---------- liczenie z list ----------

const characteristicNames = (i: InputValues) => distinct(rowNames(i.species).filter(isCharacteristic6110))
function characteristicCount(i: InputValues): number | undefined {
  const c = num(i.count)
  if (c !== undefined) return c
  return rowNames(i.species).length ? characteristicNames(i).length : i.none === 'yes' ? 0 : undefined
}

/** Gatunki dominujące z listy: wszystkie zgodne z tab. 1 FV; część U1; żaden U2. */
export function gradeDominants6110(names: string[]): Grade | null {
  const d = distinct(names)
  if (!d.length) return null
  const ok = d.filter(isTypicalDominant6110).length
  return ok === d.length ? 'FV' : ok > 0 ? 'U1' : 'U2'
}

function listCount(i: InputValues): number | undefined {
  const names = distinct(rowNames(i.species))
  return names.length || i.none === 'yes' ? names.length : undefined
}
const totalOf = (i: InputValues) => num(i.cover) ?? listTotal(i.species)

function shrubsCover(i: InputValues): number | undefined {
  const c = num(i.cover)
  if (c !== undefined) return c
  if (!rowNames(i.species).length) return i.none === 'yes' ? 0 : undefined
  return listTotal(i.species)
}

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description:
      'Zmiana powierzchni płatów 6110 na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury. Powierzchnia to suma płatów ze zdjęciami fitosocjologicznymi (standardowo 3) i płatów niedostępnych, rozpoznanych wzrokowo.',
    help: `Co wybrać: jak zmieniła się powierzchnia płatów 6110 na stanowisku od poprzedniego badania albo względem literatury. Samą powierzchnię wpisz obok – trafi do „wartości” (w karcie z przewodnika: „znane z 6 m², potencjalnie w niedostępnej części ściany dalsze 40 m²”).

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; inne kombinacje – U1; wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze – U2. Przy pierwszym badaniu wybierz „Brak danych do porównania” (XX) albo oceń ekspercko – karta Wapniarka (pierwsze badanie, 2008) dała U1 za formy inicjalne i minimalną powierzchnię.

Jak liczyć powierzchnię (przewodnik): sumuj płaty pokryte roślinnością, z pominięciem połaci nagiej skały między nimi. Części ściany niedostępne bez sprzętu wspinaczkowego oceń z daleka (lornetka). Sprawozdanie 2024: od 0,01 ha (Rochowice 2) do 0,8 ha (Mysłów), zwykle 0,02–0,2 ha.`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się',
      U1: 'Inne kombinacje',
      U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze',
    },
    inputs: [
      optionalSelect('Zmiana powierzchni', AREA, 'Puste, gdy oceniasz ekspercko.'),
      {
        kind: 'text',
        name: 'areaText',
        label: 'Powierzchnia (opcjonalnie)',
        placeholder: 'np. 6 m² + ok. 40 m² niedostępne',
        help: 'Powierzchnia płatów 6110 na stanowisku, tak jak w karcie („6 m²”, „0,02 ha”) – trafi do pola „wartość”. Zwykle od kilku do kilkunastu arów.',
      },
      noteInput('Opis (opcjonalnie)', 'np. siedlisko w formach inicjalnych, znane z 6 m²…', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => {
      const a = String(i.areaText ?? '').trim()
      return note(i) || a || (i.choice ? labelOf(AREA, i.choice).toLowerCase() : '')
    },
  },
  {
    id: 'share',
    label: 'Udział procentowy siedliska na transekcie',
    parameter: 'structure',
    description:
      'Procent powierzchni zajętej przez siedlisko na transekcie (z dokładnością do 10%). Do 20% innych zbiorowisk na stanowisku jest dopuszczalne; rozdzielenie płatów muraw naskalnych przez inne zbiorowiska nie obniża wartości wskaźnika.',
    help: `Co wpisać: jaką część transektu (albo – gdy transektu nie wykonano – powierzchni monitoringowej) zajmują płaty muraw naskalnych 6110. Liczba („80”) albo zakres („70–80”); z zakresu liczony jest środek. Gdy nie da się wyznaczyć ani transektu, ani powierzchni (jak w karcie Wapniarka), wybierz „Nie wykonano transektu” – ocena XX.

Progi (tab. 2): 100–70% – FV; 70–40% – U1; poniżej 40% – U2; jeżeli transekt nie był wykonany, pod uwagę bierze się powierzchnię monitoringową. Granicę 70% formularz liczy do FV, 40% – do U1.

Uwaga (przewodnik): siedlisko zajmuje izolowane półki skalne, więc nie wyznacza się ciągłego transektu, lecz kilka samodzielnych płatów. Sprawozdanie 2015–2018 proponowało usunięcie wskaźnika (rozmieszczenie skałek wyklucza transekt) – nie weszło, w 2024 r. wciąż oceniany (najczęściej ok. 80%).`,
    thresholds: { FV: '100–70% (bez transektu – powierzchnia monitoringowa)', U1: '70–40%', U2: 'Poniżej 40%' },
    inputs: [
      { kind: 'text', name: 'value', label: 'Udział siedliska', unit: '%', placeholder: 'np. 80', help: 'Procent transektu albo powierzchni monitoringowej zajęty przez murawy naskalne: liczba (80) albo zakres (70–80). Puste, gdy transektu nie wykonano.' },
      {
        kind: 'select',
        name: 'notDone',
        label: 'Transekt',
        options: [
          { value: '', label: '—' },
          { value: 'yes', label: 'Nie wykonano transektu (XX)' },
        ],
        help: 'Zaznacz, gdy nie dało się wyznaczyć transektu ani powierzchni monitoringowej – wskaźnik dostaje XX (karta Wapniarka: „Nie wykonano transektu” – XX).',
      },
      noteInput('Opis (opcjonalnie)', 'np. 3 płaty na półkach skalnych, między nimi naga skała', 'Krótki opis, który trafi do „wartości” w karcie zamiast samego procentu.'),
    ],
    suggest: (i) => {
      const r = parseRange6110(i.value)
      if (r) return gradeShare6110(r.mid)
      return i.notDone === 'yes' ? 'XX' : null
    },
    explain: (i) => {
      const r = parseRange6110(i.value)
      return r && r.lo !== r.hi ? `Środek zakresu: ${pct(r.mid)}.` : null
    },
    warn: (i) => {
      const v = String(i.value ?? '').trim()
      if (v && !parseRange6110(v)) return 'Nie rozumiem udziału – wpisz liczbę albo zakres, np. 70–80.'
      const r = parseRange6110(v)
      if (r && r.hi > 100) return 'Udział powyżej 100%? Skała się nie rozciąga.'
      return r && i.notDone === 'yes' ? 'Wpisano udział, a zaznaczono „Nie wykonano transektu” – liczy się udział.' : null
    },
    describe: (i) => {
      const v = String(i.value ?? '').trim()
      return note(i) || (v ? `${rangeText(v)}%` : i.notDone === 'yes' ? 'Nie wykonano transektu' : '')
    },
  },
  {
    id: 'characteristic',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków charakterystycznych (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy gatunek na transekcie (z dokładnością do 10%).',
    help: `Co wpisać: gatunki charakterystyczne zespołów i związku Alysso-Sedion stwierdzone na stanowisku, z pokryciem. Katalog liczy gatunki z tab. 1 przewodnika: rojownik pospolity Jovibarba sobolifera, wiechlina spłaszczona Poa compressa, rogownica drobna Cerastium pumilum, smagliczka kielichowata Alyssum alyssoides, czyścica drobnokwiatowa Acinos arvensis, ożanka pierzastosieczna Teucrium botrys, rozchodniki: ostry Sedum acre, ościsty S. reflexum, sześciorzędowy S. sexangulare, wielki S. maximum, biały S. album, skalnica trójpalczasta Saxifraga tridactylites, czosnek skalny Allium montanum. Synonimy (Jovibarba/Sempervivum, Acinos/Clinopodium) liczone raz. Liczbę możesz też wpisać wprost (w 2018 r. do 16 gatunków).

Progi (tab. 2): obecność przynajmniej 4 gatunków charakterystycznych – FV; 2–3 gatunki – U1; jeden gatunek lub brak – U2. (Do 2008 r. progi były łagodniejsze: ≥3 FV, 1–2 U1, 0 U2.)

Uwaga (sprawozdanie 2024): gatunki typowe muraw – driakiew żółtawa, macierzanka zwyczajna, krwiściąg mniejszy, kostrzewa owcza, mchy – nie są charakterystyczne; ich liczenie dawało w 2013–2018 zawyżone oceny (Wapniarka: „zmiana pozorna” z FV na U1). Formularz ich nie liczy i ostrzega. Rozchodnik biały ma w Polsce niejasny status (antropofit), ale jest liczony.

Wskaźnik kardynalny.`,
    thresholds: { FV: 'Obecność przynajmniej 4 gatunków charakterystycznych', U1: 'Obecność 2–3 gatunków charakterystycznych', U2: 'Jeden gatunek charakterystyczny lub brak gatunków charakterystycznych' },
    inputs: [
      speciesInput('Gatunki charakterystyczne', 'Gatunki charakterystyczne z pokryciem w % transektu, np. Poa compressa 2, Jovibarba sobolifera 10.'),
      { kind: 'number', name: 'count', label: 'Liczba gatunków charakterystycznych (opcjonalnie)', min: 0, help: 'Łączna liczba gatunków charakterystycznych wpisana wprost – ma pierwszeństwo przed liczeniem z listy.' },
      NONE_FIELD('Brak gatunków charakterystycznych', 'Zaznacz „Nie stwierdzono”, gdy na stanowisku nie ma żadnego gatunku charakterystycznego – wtedy wskaźnik to U2.'),
      noteInput('Opis (opcjonalnie)', 'np. wiechlina spłaszczona Poa compressa 2%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = characteristicCount(i)
      return c === undefined ? null : gradeCharacteristic6110(c)
    },
    explain: (i) => {
      if (num(i.count) !== undefined || !rowNames(i.species).length) return null
      const names = characteristicNames(i)
      return `Gatunki charakterystyczne z katalogu: ${names.length}${names.length ? ` (${names.join(', ')})` : ''}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && names.length) parts.push('Zaznaczono „Nie stwierdzono”, a lista nie jest pusta.')
      const other = names.filter((n) => findSpecies6110(n) && !isCharacteristic6110(n))
      if (other.length) parts.push(`Nie liczą się jako charakterystyczne: ${other.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      const c = num(i.count)
      return list || (c !== undefined ? `${plNum(c)} gat.` : i.none === 'yes' ? 'Brak' : '')
    },
  },
  {
    id: 'dominant',
    label: 'Gatunki dominujące',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków dominujących na transekcie (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy gatunek (z dokładnością do 10%); należy wymienić tylko gatunki o pokryciu ≥10%.',
    help: `Co wpisać: gatunki o pokryciu co najmniej ${DOMINANT_MIN}% (we wszystkich warstwach), z pokryciem.

Progi (tab. 2): gatunki dominujące są jednocześnie charakterystycznymi – FV; gatunki charakterystyczne współdominują w siedlisku – U1; gatunki dominujące nie są charakterystyczne dla siedliska – U2.

Jak liczy formularz: wszystkie dominanty zgodne z tab. 1 → FV; tylko część → U1; żaden → U2. Za zgodne z tab. 1 uznaje gatunki charakterystyczne oraz dwa typowe dominanty wymienione w tab. 1 przewodnika: kostrzewę owczą Festuca ovina (współdominant na głębszym podłożu) i zęboróg purpurowy Ceratodon purpureus (dominant warstwy mszystej). Ocena wybrana w polu ma pierwszeństwo.

Sygnały zaburzeń (tab. 1): podrost drzew i krzewów, a przy ocienieniu rokietnik cyprysowaty Hypnum cupressiforme albo wiechlina gajowa Poa nemoralis – karta Wapniarka: wiechlina gajowa 10% → U2. Sprawozdanie 2024: U2 także przy dominacji krzewów albo braku dominantów z pokryciem powyżej 25%. Sprawozdanie 2015–2018 proponowało, by wskaźnik przestał być kardynalny – nie weszło.

Wskaźnik kardynalny.`,
    thresholds: thresholdsOf(DOMINANT),
    inputs: [
      speciesInput('Gatunki dominujące (pokrycie ≥10%)', `Gatunki o pokryciu co najmniej ${DOMINANT_MIN}%, np. Poa compressa 30, Jovibarba sobolifera 20.`),
      optionalSelect('Ocena (opcjonalnie)', DOMINANT, 'Ocena ekspercka – ma pierwszeństwo przed liczeniem z listy.'),
      noteInput('Opis (opcjonalnie)', 'np. wiechlina gajowa Poa nemoralis 10%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => gradeMap(DOMINANT)[String(i.choice)] ?? gradeDominants6110(rowNames(i.species)),
    explain: (i) => {
      const names = distinct(rowNames(i.species))
      if (!names.length) return null
      const ok = names.filter(isTypicalDominant6110)
      return `Dominanty zgodne z tab. 1: ${ok.length} z ${names.length}${ok.length ? ` (${ok.join(', ')})` : ''} – z listy ${gradeDominants6110(names)}.`
    },
    warn: (i) => {
      const parts: string[] = []
      const low = speciesRows(i.species).filter((r) => r.name?.trim() && num(r.cover) !== undefined && num(r.cover)! < DOMINANT_MIN)
      if (low.length) parts.push(`Pokrycie poniżej ${DOMINANT_MIN}%: ${low.map((r) => r.name.trim()).join(', ')} – karta każe wpisywać tylko gatunki o pokryciu ≥${DOMINANT_MIN}%.`)
      const chosen = gradeMap(DOMINANT)[String(i.choice)]
      const fromList = gradeDominants6110(rowNames(i.species))
      if (chosen && fromList && chosen !== fromList) parts.push(`Wybrano ${chosen}, a z listy wychodzi ${fromList} – sprawdź i uzasadnij.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => note(i) || describeSpecies(speciesRows(i.species)) || (i.choice ? labelOf(DOMINANT, i.choice) : ''),
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    description:
      'Lista inwazyjnych gatunków obcych geograficznie (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy gatunek na transekcie (z dokładnością do 10%).',
    help: `Co wpisać: gatunki obce na stanowisku z pokryciem (dla „<1%” wpisz 0,5). Łączne pokrycie możesz wpisać wprost. W murawach naskalnych obce praktycznie nie występują (trudne warunki), ale możliwe jest wkraczanie przymiotna kanadyjskiego Conyza canadensis i gatunków ciepłolubnych zbiorowisk synantropijnych. W monitoringu 2013–2024: nawłoć późna i kanadyjska, przymiotno białe, robinia akacjowa, czeremcha amerykańska, łubin trwały, niecierpek drobnokwiatowy, rozchodnik kaukaski Sedum spurium.

Progi (tab. 2): brak – FV; obecne, ale poniżej 2% – U1; powyżej 2% powierzchni – U2. Granicę 2% formularz liczy do U1. (Do 2008 r. U1 – sama obecność gatunku obcego.)

Wskaźnik niekardynalny, ale U2 obniża strukturę z FV do U1. Gatunki obce w sąsiedztwie (np. robinia przy płatach) opisz w notatce albo w perspektywach.`,
    thresholds: { FV: 'Brak', U1: 'Obecne, ale poniżej 2%', U2: 'Powyżej 2% powierzchni' },
    inputs: [
      speciesInput('Gatunki obce', 'Gatunki obce inwazyjne z pokryciem w % (dla „<1%” wpisz 0,5).'),
      coverField('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków obcych w % – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak gatunków obcych', 'Zaznacz „Nie stwierdzono”, gdy na stanowisku nie ma gatunków obcych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = listCount(i)
      return c === undefined ? null : gradeAliens6110(c, totalOf(i))
    },
    explain: (i) => {
      const c = listCount(i)
      if (!c) return null
      const t = totalOf(i)
      return t === undefined ? 'Podaj pokrycie gatunków obcych – bez niego nie da się odróżnić U1 od U2.' : `Gatunków: ${c}, łączne pokrycie ${pct(t)}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && names.length) parts.push('Zaznaczono „Nie stwierdzono”, a lista nie jest pusta.')
      const native = names.filter((n) => findSpecies6110(n) && !isAlien6110(n))
      if (native.length) parts.push(`Na liście są gatunki rodzime: ${native.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      return list || (i.none === 'yes' ? 'Brak' : '')
    },
  },
  {
    id: 'expansive',
    label: 'Rodzime gatunki ekspansywne roślin zielnych',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista rodzimych gatunków ekspansywnych roślin zielnych (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy gatunek na transekcie (z dokładnością do 10%).',
    help: `Co wpisać: rodzime rośliny zielne, które zarastają murawy, z pokryciem. Na siedliskach niezaburzonych nie powinny występować; na antropogenicznych najczęściej trzcinnik piaskowy Calamagrostis epigejos (tab. 1), w monitoringu 2018–2024 także kłosownica pierzasta Brachypodium pinnatum, jeżyny, wierzbówka nadrzeczna; w karcie Wapniarka – bylica pospolita Artemisia vulgaris 2%. Drzew i krzewów tu nie wpisuj (osobny wskaźnik), gatunków obcych też nie.

Progi (tab. 2): brak – FV; obecność gatunku, o którym wiadomo, że jest potencjalnie ekspansywny (nie więcej niż 5% powierzchni) – U1; powyżej 5% powierzchni – U2. Granicę 5% formularz liczy do U1. (Do 2008 r.: U1 do ok. 10%, U2 powyżej 30%.)

Uwaga (sprawozdania 2018 i 2024): gatunki muraw (krwiściąg mniejszy, komonica, brodawnik) to nie ekspansywne – ich wpisanie dawało zaniżone oceny („zmiany pozorne”). Wskaźnik kardynalny.`,
    thresholds: { FV: 'Brak', U1: 'Obecność gatunku, o którym wiadomo, że jest potencjalnie ekspansywny (nie więcej niż 5% powierzchni)', U2: 'Powyżej 5% powierzchni' },
    inputs: [
      speciesInput('Gatunki ekspansywne', 'Rodzime gatunki ekspansywne roślin zielnych z pokryciem w %, np. Calamagrostis epigejos 5.'),
      coverField('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków ekspansywnych w % – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak gatunków ekspansywnych', 'Zaznacz „Nie stwierdzono”, gdy na stanowisku nie ma gatunków ekspansywnych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. bylica pospolita Artemisia vulgaris 2%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = listCount(i)
      return c === undefined ? null : gradeExpansive6110(c, totalOf(i))
    },
    explain: (i) => {
      const c = listCount(i)
      if (!c) return null
      const t = totalOf(i)
      return t === undefined ? 'Podaj pokrycie – bez niego nie da się odróżnić U1 od U2.' : `Łączne pokrycie gatunków ekspansywnych: ${pct(t)}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && names.length) parts.push('Zaznaczono „Nie stwierdzono”, a lista nie jest pusta.')
      const woody = names.filter(isWoody6110)
      if (woody.length) parts.push(`Drzewa i krzewy wpisz we wskaźniku „Ekspansja krzewów i podrostu drzew”: ${woody.join(', ')}.`)
      const aliens = names.filter(isAlien6110)
      if (aliens.length) parts.push(`Gatunki obce wpisz we wskaźniku „Obce gatunki inwazyjne”: ${aliens.join(', ')}.`)
      const grass = names.filter((n) => findSpecies6110(n) && !isExpansive6110(n) && !isWoody6110(n) && !isAlien6110(n))
      if (grass.length) parts.push(`To nie są gatunki ekspansywne: ${grass.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      return list || (i.none === 'yes' ? 'Brak' : '')
    },
  },
  {
    id: 'structure',
    label: 'Struktura przestrzenna płatów siedliska',
    parameter: 'structure',
    description:
      'Mozaika siedliskowa zachowana / zaburzona / niewidoczna (homogenizacja płatów). Pionierskie murawy tworzą zwarte płaty sukulentów albo luźne murawy z wiechliną spłaszczoną i terofitami, z małym udziałem warstwy mszystej.',
    help: `Co wybrać: czy na stanowisku widać mozaikę płatów muraw, sukulentów, terofitów i nagiej skały.

Progi (tab. 2): zachowana mozaika siedliskowa i strukturalna – FV; zaburzona mozaika – U1; niewidoczna mozaika, homogenizacja płatów – U2. Karta Wapniarka: „Mozaika siedliskowa zachowana; 2 płaty, zwarcie 10–30%” → FV.

Na co patrzeć (tab. 1): przy wzrastającym ocienieniu rośnie pokrycie warstwy mszystej, która uniemożliwia kiełkowanie roślin naczyniowych – zmienia się proporcja warstw mszystej i zielnej, płaty się fragmentują, wycofują się gatunki ciepłolubne i światłożądne, aż do zaniku murawy. Wskaźnik oceniany ekspercko (sprawozdanie 2018); propozycja zastąpienia go „Pokryciem przez mszaki” (FV do 20%, U1 20–60%, U2 >60%) nie weszła do metodyki.`,
    thresholds: thresholdsOf(MOSAIC),
    inputs: [
      selectInput('Mozaika siedliskowa', MOSAIC),
      noteInput('Opis (opcjonalnie)', 'np. Mozaika siedliskowa zachowana; 2 płaty, zwarcie 10–30%', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(MOSAIC)),
    describe: (i) => note(i) || labelOf(MOSAIC, i.choice),
  },
  {
    id: 'shrubs',
    label: 'Ekspansja krzewów i podrostu drzew',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez wszystkie ekspansywne gatunki krzewów i drzew na transekcie (z dokładnością do 10%).',
    help: `Co wpisać: drzewa i krzewy (także siewki i podrost) na płatach muraw, z pokryciem; łączne zwarcie warstw B i A możesz wpisać wprost. Najczęściej (tab. 1, sprawozdania 2018 i 2024): głóg, róże, tarnina, berberys, jesion, jarząb, malina, brzoza, wierzba iwa, sosna, świerk, jawor, leszczyna, dereń świdwa, modrzew, wiąz górski, kruszyna.

Progi (tab. 2): brak – FV; do 30% zwarcie warstw B i A – U1; powyżej 30% – U2. Granicę 30% formularz liczy do U1.

Uwaga – rozjazd karty z tab. 2: w karcie Wapniarka brzoza 1% i wierzba iwa 1% (razem 2%) dostały FV, choć wg litery tab. 2 FV to „brak”. Formularz trzyma się tab. 2 (każde pokrycie >0 → U1) i pokaże „odbiega od progów”, gdy ocenisz pojedyncze siewki na FV – uzasadnij to w opisie. Wnikanie drzew z otaczających lasów jest naturalne (tab. 1); w 2018 r. FV dostały stanowiska bez drzew i krzewów albo z pokryciem do ok. 5%.

Wskaźnik kardynalny – najgorzej oceniany w całym monitoringu (2024: 11 z 12 stanowisk U1 lub U2).`,
    thresholds: { FV: 'Brak', U1: 'Do 30% zwarcie warstw B i A', U2: 'Powyżej 30% zwarcie warstw B i A' },
    inputs: [
      speciesInput('Drzewa i krzewy', 'Drzewa i krzewy z pokryciem w %, np. Betula pendula 1, Salix caprea 1.'),
      coverField('Zwarcie warstw B i A (opcjonalnie)', 'Łączne zwarcie krzewów i drzew w % – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak drzew i krzewów', 'Zaznacz „Nie stwierdzono”, gdy na płatach nie ma drzew ani krzewów – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. brzoza brodawkowata Betula pendula 1%, wierzba iwa Salix caprea 1%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy.'),
    ],
    suggest: (i) => {
      const c = shrubsCover(i)
      return c === undefined ? null : gradeShrubs6110(c)
    },
    explain: (i) => {
      const c = shrubsCover(i)
      if (c === undefined) return rowNames(i.species).length ? 'Podaj pokrycie drzew i krzewów.' : null
      return c > 0 ? `Zwarcie drzew i krzewów: ${pct(c)}.` : null
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && names.length) parts.push('Zaznaczono „Nie stwierdzono”, a lista nie jest pusta.')
      const herbs = names.filter((n) => findSpecies6110(n) && !isWoody6110(n) && !isAlien6110(n))
      if (herbs.length) parts.push(`To nie drzewa ani krzewy: ${herbs.join(', ')}.`)
      const aliens = names.filter(isAlien6110)
      if (aliens.length) parts.push(`Obce drzewa wpisz też we wskaźniku „Obce gatunki inwazyjne”: ${aliens.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      if (list) return list
      const c = num(i.cover)
      return c !== undefined ? pct(c) : i.none === 'yes' ? 'Brak' : ''
    },
  },
  {
    id: 'shade',
    label: 'Ocienienie muraw',
    parameter: 'structure',
    cardinal: true,
    excluded: (ctx) => !withShade(ctx),
    excludedNote: 'usunięty modyfikacją metodyki z 17.07.2015 – nie liczy się do oceny struktury',
    description: 'Udział procentowy powierzchni ocienionej. Jedno z największych zagrożeń: siewki drzew i krzewów, rozrastanie się koron drzew nad skałkami w lukach drzewostanu.',
    help: `Co wpisać: jaka część powierzchni płatów jest ocieniona przez drzewa i krzewy (także korony drzew rosnących obok skałek), w procentach.

Skąd ten wskaźnik: jest w tab. 1 i 2 przewodnika (kardynalny) i w karcie Wapniarka (2% → FV), ale modyfikacja metodyki z 17.07.2015 go usunęła. Mimo to w monitoringu 2018 i 2024 był oceniany (2024: na 2 stanowiskach XX, na pozostałych ekspercko). Dlatego domyślnie (zestaw „Modyfikacja 2015” w Stanowisku) zostaje w karcie, ale nie liczy się do oceny struktury – wpisz wtedy np. „nie oceniano” i XX albo wartość informacyjnie. Liczy się (jako kardynalny) przy zestawie „Przewodnik 2010”.

Progi (tab. 2): brak lub słabe – FV; 20% powierzchni ocienionej – U1; powyżej 20% – U2. Metodyka nie mówi, ile to „słabe” – formularz przyjmuje do ${WEAK_SHADE}% (sprawozdanie 2015–2018: na najlepiej ocenionych stanowiskach ocienienie 0 – ok. 10%), U1 powyżej ${WEAK_SHADE}% do 20% (20 też), U2 powyżej 20%. (Do 2008 r.: U1 do 30%, U2 powyżej 30%.)`,
    thresholds: { FV: `Brak lub słabe (formularz: do ${WEAK_SHADE}%)`, U1: '20% powierzchni ocienionej', U2: 'Powyżej 20% powierzchni ocienionej' },
    inputs: [
      { kind: 'text', name: 'value', label: 'Powierzchnia ocieniona', unit: '%', placeholder: 'np. 2', help: 'Procent powierzchni płatów w cieniu drzew i krzewów: liczba (2) albo zakres (20–30). Przy zestawie „Modyfikacja 2015” możesz zostawić puste.' },
      noteInput('Opis (opcjonalnie)', 'np. nie oceniano (wskaźnik usunięty w 2015 r.)', 'Krótki opis, który trafi do „wartości” w karcie zamiast samego procentu.'),
    ],
    suggest: (i) => {
      const r = parseRange6110(i.value)
      return r ? gradeShade6110(r.mid) : null
    },
    explain: (i) => {
      const r = parseRange6110(i.value)
      return r && r.lo !== r.hi ? `Środek zakresu: ${pct(r.mid)}.` : null
    },
    warn: (i) => {
      const v = String(i.value ?? '').trim()
      if (v && !parseRange6110(v)) return 'Nie rozumiem ocienienia – wpisz liczbę albo zakres, np. 20–30.'
      const r = parseRange6110(v)
      return r && r.hi > 100 ? 'Ocienienie powyżej 100%? Nawet w jaskini nie.' : null
    },
    describe: (i) => {
      const v = String(i.value ?? '').trim()
      return note(i) || (v ? `${rangeText(v)}%` : '')
    },
  },
  {
    id: 'damage',
    label: 'Zniszczenia mechaniczne',
    parameter: 'structure',
    description:
      'Opis obserwowanych zniszczeń: wydeptywanie przez ludzi i zwierzęta (w tym muflony – zgryzanie i wydeptywanie darni) oraz naturalne odrywanie się głazów od ścian skalnych.',
    help: `Co wpisać: rodzaj zniszczeń i jaką część powierzchni siedliska obejmują. Odrywanie się pojedynczych głazów to naturalny składnik dynamiki siedliska – samo w sobie nie obniża oceny (karta Wapniarka: „niewielkie pojedyncze głazy odrywające się od ścian skalnych – zjawisko naturalne” → FV). Wydeptywanie przez turystów (punkty widokowe, ogniska) i muflony szybko zubaża murawy, np. przez niszczenie kęp rojownika.

Progi (tab. 2): brak – FV; śladowe, ale obecne (do 10%) – U1; powyżej 20% powierzchni siedliska (siedlisko czułe na niszczenie mechaniczne) – U2. Tab. 2 nie mówi, co z 10–20% – formularz liczy to do U1 (U2 dopiero powyżej 20%).

Jak liczy formularz: „brak” albo „tylko naturalne” → FV; antropogeniczne – z wpisanego procentu (do 20% → U1, powyżej → U2); bez procentu – ocena wybierana ręcznie. W 2024 r. U1 tylko na Miłku (słabo dostrzegalne ślady wydeptywania).`,
    thresholds: { FV: 'Brak', U1: 'Śladowe, ale obecne (do 10%)', U2: 'Powyżej 20% powierzchni siedliska (siedlisko czułe na niszczenie mechaniczne)' },
    inputs: [
      { kind: 'select', name: 'kind', label: 'Rodzaj zniszczeń', options: DAMAGE_KIND, required: true, help: 'Brak zniszczeń, tylko naturalne (odrywanie głazów – FV) albo antropogeniczne / od zwierząt (wydeptywanie, zgryzanie, muflony – ocena z procentu).' },
      coverField('Powierzchnia zniszczona (opcjonalnie)', 'Procent powierzchni siedliska ze zniszczeniami antropogenicznymi: do 20% → U1, powyżej → U2.'),
      noteInput('Opis', 'np. niewielkie pojedyncze głazy odrywające się od ścian skalnych – zjawisko naturalne', 'Opis obserwowanych zniszczeń – trafi do „wartości” w karcie.'),
    ],
    suggest: (i) => {
      if (i.kind === 'none' || i.kind === 'natural') return 'FV'
      if (i.kind !== 'human') return null
      const c = num(i.cover)
      return c === undefined ? null : gradeDamage6110(Math.max(c, 0.1))
    },
    explain: (i) => {
      if (i.kind === 'natural') return 'Zjawisko naturalne (odrywanie głazów) – nie obniża oceny.'
      if (i.kind === 'human' && num(i.cover) === undefined) return 'Podaj procent zniszczonej powierzchni albo wybierz ocenę.'
      const c = num(i.cover)
      return i.kind === 'human' && c !== undefined && c > 10 && c <= 20 ? 'Luka 10–20% w tab. 2 – formularz liczy do U1.' : null
    },
    describe: (i) => note(i) || (i.kind ? labelOf(DAMAGE_KIND, i.kind) : ''),
  },
]

// ---------- pola stanowiska ----------

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Wapniarka',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – zwykle góra, skałka albo kamieniołom, np. „Wapniarka”, „Miłek (szczyt)”, „Rochowice 2 (South)”, „Cieszów Dolny – transekt”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tych samych płatów.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. badawcze',
    help: `Typ stanowiska w sieci monitoringu, np. „badawcze” albo „referencyjne”. Jeśli nie wiesz, zostaw puste.

Dlaczego: przy ocenie na poziomie regionu stanowiska referencyjne pokazują, jak wygląda 6110 w dobrym stanie.`,
  },
  {
    kind: 'select',
    name: 'indicatorSet',
    label: 'Zestaw wskaźników struktury',
    options: INDICATOR_SETS,
    defaultValue: 'mod2015',
    required: true,
    hint: 'Od 17.07.2015 bez „Ocienienia muraw”; przewodnik 2010 i karta przykładowa – z ocienieniem.',
    help: `Modyfikacja metodyki z 17.07.2015 usunęła wskaźnik „Ocienienie muraw” – zostaje 8 wskaźników struktury, kardynalne: ekspansja krzewów i podrostu drzew, rodzime gatunki ekspansywne, gatunki dominujące, gatunki charakterystyczne.

Przewodnik 2010 i karta Wapniarka mają 9 wskaźników z ocienieniem jako piątym kardynalnym. Sprawozdania 2018 i 2024 – mimo modyfikacji – nadal liczyły 9 wskaźników i 5 kardynalnych. Chcesz porównać kartę z tymi sprawozdaniami – wybierz „Przewodnik 2010”.

Przy zestawie „Modyfikacja 2015” ocienienie zostaje w karcie (wpisujesz je albo dajesz XX), ale nie liczy się do oceny struktury.`,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Saxifrago-Poetum compressae',
    help: `Zbiorowisko nazwą fitosocjologiczną. Związek Alysso alyssoidis-Sedion albi (rząd Sedo-Scleranthetalia, klasa Koelerio glaucae-Corynephoretea): Saxifrago-Poetum compressae (skalnica trójpalczasta i wiechlina spłaszczona), Sempervivetum soboliferi (rojownik pospolity), Cerastietum pumili (rogownica drobna), Allio montani-Sedetum (czosnek skalny i rozchodnik biały).

Uwaga: murawy z rojnikiem na podłożu krzemianowym (Rudawy Janowickie, Chojnik) to siedlisko 8230, a murawy z kostrzewą bladą Festuca pallens na Jurze – 6210. W 2024 r. z monitoringu wypadło 11 stanowisk, które po weryfikacji okazały się innymi siedliskami (głównie 8230).`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 6,
    required: true,
    hint: 'Skała (wapień, dolomit, marmur, bazalt, zieleniec), naturalna wychodnia czy kamieniołom, półki, ekspozycja, otoczenie.',
    help: `Krótka charakterystyka stanowiska:
• podłoże: wapień, dolomit, marmur albo skały zasadowe wylewne (bazalt, zieleniec); gleba inicjalna (litosol) do 10 cm albo szczeliny skalne;
• typ wychodni: naturalna czy antropogeniczna (kamieniołom, hałda) – siedliska na naturalnych wychodniach są trwalsze (sprawozdanie 2006–2008);
• płaty: liczba, położenie (półki, ściany), ekspozycja (optimum S, SW, W), dostępność bez sprzętu wspinaczkowego;
• otoczenie: las, zarośla, zbiornik wodny, szlak, punkt widokowy.
Za stanowisko uznaje się grupę wyraźnie wyodrębnionych płatów siedliska (półki skalne albo ich zespół) odległych od siebie nie więcej niż 50 m.`,
  },
  {
    kind: 'text',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    required: true,
    placeholder: 'np. 6 m², potencjalnie dalsze 40 m²',
    help: 'Suma powierzchni płatów 6110 na stanowisku (z pominięciem nagiej skały między nimi), w m², arach albo ha – jak w karcie. Zwykle kilka do kilkunastu arów; sprawozdanie 2024: od 0,01 ha do 0,8 ha. Płaty niedostępne, widziane z daleka, opisz osobno („potencjalnie w niedostępnej części ściany dalsze 40 m²”).',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „PLH020019 Pasmo Krowiarki”. Brak – „brak”.',
  }),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. zakład górniczy',
    help: `Kto zarządza terenem: właściciel kamieniołomu, Lasy Państwowe, gmina, właściciele prywatni, RDOŚ (rezerwat). W 2018 r. 12 stanowisk na gruntach Skarbu Państwa, 10 – innej własności.

Dlaczego: od właściciela zależy wznowienie wydobycia, wycinka drzew ocieniających skałki i ruch turystyczny.`,
  },
  {
    kind: 'text',
    name: 'coords',
    label: 'Współrzędne geograficzne',
    required: true,
    help: `Współrzędne środka stanowiska (albo płatów) z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie.

Dlaczego: płaty na półkach skalnych są małe i rozproszone – bez współrzędnych za kilka lat nikt nie trafi na te same półki.`,
  },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    placeholder: 'np. 3 płaty na półkach skalnych, transekt niemożliwy',
    help: `Ze względu na rozmieszczenie siedliska transekt z reguły nie jest możliwy – siedlisko zajmuje izolowane półki skalne rozmieszczone losowo. Wpisz wymiary transektu, jeśli udało się go wyznaczyć, albo opisz, co zbadano zamiast niego (np. „Tylko 2 płaty, wykonanie transektu niemożliwe”).

Dlaczego: od tego zależy, czy wskaźnik „Udział procentowy siedliska na transekcie” liczy się z transektu, z powierzchni monitoringowej, czy dostaje XX.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    help: 'Wysokość nad poziomem morza stanowiska (albo zakres), z GPS albo mapy. Optimum siedliska w Polsce: 200–400 m n.p.m. (Pogórze i Przedgórze Sudeckie, Opolszczyzna).',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 28.05.2024',
    required: true,
    hint: 'Optymalnie maj–lipiec: przełom maja i czerwca (terofity) i lipiec (byliny).',
    help: `Dzień badań terenowych. Przewodnik zaleca dwie kontrole w roku na tych samych powierzchniach: przełom maja i czerwca, kiedy występuje część terofitów (skalnica trójpalczasta, rogownica drobna, smagliczka), i lipiec – pełnia rozwoju bylin. Sprawozdanie 2024: optymalny okres od maja do końca lipca; 2006–2008: później część jednorocznych trudno odnotować.

Drugą kontrolę wpisz w polu obok. Badania powtarza się w cyklu 2–3-letnim (istotne zagrożenia).`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 5 && m <= 7 ? null : 'Termin poza optymalnym oknem (maj–lipiec). Terofity mogły już zniknąć – opisz to w uwagach.'
    },
  },
  {
    kind: 'date',
    name: 'date2',
    label: 'Druga kontrola (opcjonalnie)',
    placeholder: 'DD.MM.RRRR, np. 15.07.2024',
    help: 'Data drugiej kontroli w tym samym roku (przewodnik: pierwsza na przełomie maja i czerwca, druga w lipcu). Jedna kontrola – zostaw puste.',
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 5 && m <= 7 ? null : 'Druga kontrola poza oknem maj–lipiec.'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
  {
    kind: 'text',
    name: 'additionalExperts',
    label: 'Dodatkowi eksperci',
    placeholder: 'np. —',
    help: 'Osoby, które brały udział w badaniu poza wykonawcą (w karcie z przewodnika: „Dodatkowi koordynatorzy”). Brak – zostaw puste albo wpisz „—”.',
  },
]

// ---------- zdjęcia fitosocjologiczne: standardowo 3 płaty ----------

const r7120 = methodology7120.releves.fields
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia (płatu). Standardowo 3 zdjęcia – po jednym w każdym z badanych płatów.' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach.' }),
  pickField(r7120, 'area', {
    defaultValue: undefined,
    help: 'Powierzchnia zdjęcia w m² – na półkach skalnych zwykle cały płat, często tylko kilka m² (w karcie z przewodnika: 1×2 m i 2×2 m). Metodyka nie podaje standardowej wielkości – wpisz faktyczną.',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach – od płaskich półek do pionowych ścian (w karcie z przewodnika 40° i 90°).' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, SW). Optimum 6110: S, SW, W.' }),
  layerField('coverA', 'Warstwa A – drzewa: procent powierzchni zdjęcia pod koronami drzew. Na półkach skalnych zwykle 0 – korony drzew rosnących obok opisz przy ocienieniu.'),
  layerField('coverB', 'Warstwa B – krzewy i podrost: procent powierzchni zdjęcia. Każdy krzew na półce skalnej to zapowiedź ocienienia.'),
  layerField('coverC', 'Warstwa C – zielna: procent powierzchni zdjęcia pokryty przez rośliny naczyniowe (sukulenty, terofity, trawy).'),
  layerField('coverD', 'Warstwa D – mszysta: mchy i porosty naskalne, w %. Wzrost pokrycia mchów przy ocienieniu wypiera rośliny naczyniowe (tab. 1).'),
  layerField('heightA', 'Warstwa A – typowa wysokość drzew, w metrach.'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów i podrostu, w metrach.'),
  layerField('heightC', 'Warstwa C – typowa wysokość runa, w centymetrach (murawy naskalne zwykle kilka–kilkanaście cm).'),
  layerField('heightD', 'Warstwa D – typowa wysokość warstwy mszystej, w centymetrach.'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Saxifrago-Poetum compressae',
    help: 'Jednostka fitosocjologiczna zdjęcia, np. Saxifrago-Poetum compressae, Sempervivetum soboliferi, Cerastietum pumili, Allio montani-Sedetum.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki na płacie z ilościowością w skali Braun-Blanqueta (r, +, 1–5): warstwa B – krzewy i podrost, C – rośliny zielne (także siewki drzew), D – mchy i porosty. Warstwa podpowiada się sama po wyborze gatunku.',
  }),
  {
    kind: 'textarea',
    name: 'remarks',
    label: 'Uwagi do zdjęcia',
    rows: 2,
    placeholder: 'np. Brak możliwości wykonania zdjęcia fitosocjologicznego',
    help: 'Uwagi do zdjęcia, np. „Brak możliwości wykonania zdjęcia fitosocjologicznego” (płat niedostępny bez sprzętu wspinaczkowego), część płatu oceniona przez lornetkę.',
  },
]

export const methodology6110: Methodology = {
  code: '6110',
  name: 'Skały wapienne i neutrofilne z roślinnością pionierską (Alysso-Sedion)',
  source:
    'Świerkosz K., Szczęśniak E., Reczyńska K. 2010, 6110 Skały wapienne i neutrofilne z roślinnością pionierską (Alysso-Sedion), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ, s. 95–105 (tab. 1 i 2); modyfikacja metodyki z 17.07.2015 (usunięty wskaźnik „Ocienienie muraw”); praktyka oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014, 2015–2018 i 2024.',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Standardowo 3 zdjęcia fitosocjologiczne – po jednym w każdym z badanych płatów (powierzchnia zdjęcia to zwykle cały płat na półce skalnej). Ilościowość w skali Braun-Blanqueta; warstwy B (krzewy), C (zielna) i D (mchy i porosty). Płat niedostępny – opisz w uwagach do zdjęcia.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'W ocenie perspektyw ochrony należy brać pod uwagę dłuższą perspektywę czasową oraz szereg różnych czynników, których negatywne oddziaływanie na siedlisko może się kumulować, prowadząc do jego stopniowego zaniku.',
    help: `Weź pod uwagę: sukcesję drzew i krzewów oraz rosnące ocienienie (główne zagrożenie w 2018 i 2024), eutrofizację podłoża i zmiany mikroklimatu (np. zbiornik wodny obok – Dobromierz), wznowienie wydobycia w kamieniołomie (Mielnik, Waliszów – siedliska zniszczone), muflony (dolina Czyżynki), wydeptywanie w punktach widokowych, ogniska, gatunki obce, susze. Ochrona bierna wystarcza tylko na wychodniach niezaburzonych; w Sudetach prawie wszędzie trzeba usuwać drzewa i krzewy, i to okresowo.

Sprawozdanie 2024: FV tylko tam, gdzie ruch turystyczny jest umiarkowany, a położenie w rezerwacie chroni przed innymi zagrożeniami (Miłek szczyt). Karta Wapniarka: planowane otwarcie kamieniołomu, ocena środowiskowa bez gwarancji przestrzegania zaleceń → U2.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających (np. sukcesja wtórna), nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A04.03', name: 'Zarzucenie pasterstwa, brak wypasu' },
    { code: 'B01', name: 'Zalesianie terenów otwartych' },
    { code: 'C01', name: 'Kopalnie, kamieniołomy, wydobywanie' },
    { code: 'C01.07', name: 'Działalność górnicza i wydobywcza nie wymieniona powyżej' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'F03.01', name: 'Polowanie' },
    { code: 'F04', name: 'Pozyskiwanie / usuwanie roślin lądowych, ogólnie' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.04', name: 'Wspinaczka górska, skałkowa i speleologia' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'G05.07', name: 'Niewłaściwie realizowane działania ochronne lub ich brak' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód, ogólnie' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.02', name: 'Nagromadzenie materii organicznej' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'K04.05', name: 'Szkody wyrządzane przez roślinożerców (w tym zwierzynę łowną)' },
    { code: 'L05', name: 'Zawalenie się terenu, osuwisko' },
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
            hint: 'Np. mięczaki, murawy kserotermiczne, buczyny storczykowe, gatunki chronione.',
            help: 'Wartości przyrodnicze stanowiska poza samymi murawami naskalnymi: sąsiednie siedliska (6210 murawy kserotermiczne, 8210 wapienne ściany skalne, 9150 buczyny storczykowe), rzadkie i chronione gatunki roślin i zwierząt (np. mięczaki skalne). Brak informacji – „Nie stwierdzono” albo „Nie pozyskano danych”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          { ...f, help: 'Jakie zabiegi ochronne wykonano i z jakim skutkiem: wycinka drzew i krzewów ocieniających skałki, usuwanie gatunków obcych, przesunięcie szlaku, ograniczenie wstępu. Sprawozdanie 2024: na żadnym stanowisku nie prowadzono działań ochronnych. Brak – „Nie”.' },
          {
            kind: 'textarea',
            name: 'proposals',
            label: 'Propozycje wprowadzenia działań ochronnych',
            rows: 4,
            hint: 'Np. usuwanie drzew i krzewów, przesunięcie szlaku, ochrona przed muflonami.',
            help: `Jakie działania proponujesz (przewodnik, pkt 5): ochrona ścisła dobrze wykształconych płatów; ochrona czynna na siedliskach zagrożonych zacienieniem – okresowe usuwanie drzew i krzewów; inwentaryzacja przed planowanym wydobyciem kopalin; odsunięcie szlaków od najcenniejszych płatów (punkty widokowe, ogniska, eutrofizacja); ochrona przed presją muflona; usuwanie gatunków obcych (np. robinii). Brak – „Nie”.`,
          },
        ]
      if (f.name === 'notes')
        return [
          {
            ...f,
            help: `${f.help ?? ''}\n\nDla 6110 zapisz tu także: rok i typ monitoringu, koordynatora, czy monitoring jest wymagany i dlaczego, odstępstwa od metodyki (termin, brak transektu, płaty niedostępne) oraz wątpliwości co do zaklasyfikowania płatów (8230 na krzemianach, 6210 z kostrzewą bladą).`.trim(),
          },
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_6110.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer6110(s) })),
  speciesInfo: (name) => {
    const e = findSpecies6110(name)
    return e ? GROUP_LABELS_6110[e.group] : undefined
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator6110 = (id: string): IndicatorDef => {
  const i = methodology6110.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 6110`)
  return i
}
