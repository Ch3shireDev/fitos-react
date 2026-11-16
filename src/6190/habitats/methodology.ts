// Metodyka 6190 (murawy pannońskie Stipo-Festucetalia pallentis) jako dane. Przewodnika metodycznego dla 6190 nie
// opublikowano (Świerkosz K. 2021, maszynopis). Źródła:
//  • sprawozdanie z monitoringu 2023–2025 (badania 2024) – zestaw 7 wskaźników struktury, 5 kardynalnych (tab. 2),
//    praktyka oceny na 10 stanowiskach; ma pierwszeństwo;
//  • sprawozdanie 2015–2018 (badania 2016, pierwsze) – ten sam zestaw: „wstępna metodyka, przyjęta dla podobnego typu
//    siedliska – 6110”, więc progi wskaźników są progami tab. 2 przewodnika 6110 (Świerkosz, Szczęśniak, Reczyńska 2010),
//    poprawione tam, gdzie praktyka 2016/2024 jest jednoznaczna (pojedyncze okazy drzew i krzewów = FV);
//  • propozycja docelowej metodyki z 2018 r. (kombinacja florystyczna, mszaki, wydeptywanie, zgryzanie) – nie weszła,
//    w 2024 r. oceniano po staremu; służy tylko jako podpowiedź w opisach.
// Siedlisko niepriorytetowe, tylko region kontynentalny (Sudety, Przedgórze i Pogórze Zachodniosudeckie; ok. 2 ha w kraju).
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_6190,
  KEY_DOMINANT_6190,
  SPECIES_6190,
  defaultLayer6190,
  findSpecies6190,
  isAlien6190,
  isCharacteristic6190,
  isExpansive6190,
  isKeyDominant6190,
  isTypicalDominant6190,
  isWoody6190,
  speciesKey6190,
} from './species'

// ---------- liczby i zakresy ----------

/** Liczba albo zakres jak w karcie papierowej: „10”, „5–10”, „ok. 10%”. Zakres daje środek. Bzdura -> undefined. */
export function parseRange6190(value: unknown): { lo: number; hi: number; mid: number } | undefined {
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

// ---------- progi liczbowe (wstępna metodyka = tab. 2 dla 6110, z praktyką 2016 i 2024) ----------

/** Gatunki charakterystyczne: co najmniej 4 FV, 2–3 U1, jeden albo brak U2. */
export const gradeCharacteristic6190 = (count: number): Grade => (count >= 4 ? 'FV' : count >= 2 ? 'U1' : 'U2')

/** Obce gatunki inwazyjne (łączne pokrycie): brak FV, obecne do 2% U1 (2 też), powyżej 2% U2. */
export const gradeAliens6190 = (count: number, total: number | undefined): Grade | null => {
  if (count <= 0) return 'FV'
  if (total === undefined) return null
  return total > 2 ? 'U2' : 'U1'
}

/** Rodzime gatunki ekspansywne roślin zielnych: brak FV, obecne do 5% U1, powyżej 5% U2. */
export const gradeExpansive6190 = (count: number, total: number | undefined): Grade | null => {
  if (count <= 0) return 'FV'
  if (total === undefined) return null
  return total > 5 ? 'U2' : 'U1'
}

/**
 * Do tego progu drzewa i krzewy to „pojedyncze okazy” (FV). Tab. 2 dla 6110 daje FV tylko przy „brak”, ale w 6190
 * w 2016 i 2024 r. pojedyncze róże, jabłonie, jarzęby, osiki i cisy („razem mniej niż 1% powierzchni transektu”)
 * zawsze dostawały FV, a propozycja metodyki z 2018 r. wprost: „obecność pojedynczych okazów nie wpływa na pogorszenie”.
 */
export const SINGLE_WOODY = 1

/** Ekspansja krzewów i podrostu drzew (zwarcie B+A): brak lub pojedyncze okazy (do 1%) FV, do 30% U1, powyżej 30% U2. */
export const gradeShrubs6190 = (cover: number): Grade => (cover <= SINGLE_WOODY ? 'FV' : cover <= 30 ? 'U1' : 'U2')

/** Do tego progu ocienienie to „słabe” (FV) – sprawozdania 2016 („nie przekracza 10%”) i 2024 („5–10%”). */
export const WEAK_SHADE = 10

/** Ocienienie muraw: brak lub słabe (do 10%) FV, do 20% U1 (20 też), powyżej 20% U2. */
export const gradeShade6190 = (p: number): Grade => (p <= WEAK_SHADE ? 'FV' : p <= 20 ? 'U1' : 'U2')

/** Zniszczenia mechaniczne (wydeptywanie, rozjeżdżanie, muflony): brak FV, do 20% U1 (luka 10–20% też), powyżej 20% U2. */
export const gradeDamage6190 = (p: number): Grade => (p <= 0 ? 'FV' : p <= 20 ? 'U1' : 'U2')

/** Karta każe wpisywać jako dominanty tylko gatunki o pokryciu co najmniej 10%. */
export const DOMINANT_MIN = 10

const pct = (v: number) => `${plNum(v)}%`
const rangeText = (s: string) => s.trim().replace(/\s*[-–—]\s*/, '–')
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey6190(n), n])).values()]
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
  { value: 'other', label: 'Inne kombinacje (np. część dostępnych skał zajęta przez mszaki lub roślinność nitrofilną)', grade: 'U1' },
  { value: 'decrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const DOMINANT: GradedOption[] = [
  { value: 'fv', label: 'Gatunki dominujące są jednocześnie charakterystycznymi (dominuje kostrzewa blada)', grade: 'FV' },
  { value: 'u1', label: 'Gatunki charakterystyczne współdominują w siedlisku', grade: 'U1' },
  { value: 'u2', label: 'Gatunki dominujące nie są charakterystyczne dla siedliska', grade: 'U2' },
]
const DAMAGE_KIND: SelectOption[] = [
  { value: '', label: '—' },
  { value: 'none', label: 'Brak zniszczeń' },
  { value: 'natural', label: 'Tylko naturalne (obrywy, spływy wód, wezbrania)' },
  { value: 'human', label: 'Antropogeniczne lub od zwierząt (wydeptywanie, rozjeżdżanie, muflony)' },
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

// ---------- liczenie z list ----------

const characteristicNames = (i: InputValues) => distinct(rowNames(i.species).filter(isCharacteristic6190))
function characteristicCount(i: InputValues): number | undefined {
  const c = num(i.count)
  if (c !== undefined) return c
  return rowNames(i.species).length ? characteristicNames(i).length : i.none === 'yes' ? 0 : undefined
}

/**
 * Gatunki dominujące z listy: wszystkie typowe dla siedliska i wśród nich kostrzewa blada – FV; część typowych albo same
 * typowe bez kostrzewy bladej (kostrzewa owcza, mszaki – „zanik roślinności zielnej”, sprawozdanie 2024) – U1; żaden – U2.
 */
export function gradeDominants6190(names: string[]): Grade | null {
  const d = distinct(names)
  if (!d.length) return null
  const ok = d.filter(isTypicalDominant6190).length
  if (ok === 0) return 'U2'
  return ok === d.length && d.some(isKeyDominant6190) ? 'FV' : 'U1'
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
      'Zmiana powierzchni płatów 6190 na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury. Liczy się powierzchnia skał i półek skalnych faktycznie zajęta przez murawy z kostrzewą bladą.',
    help: `Co wybrać: jak zmieniła się powierzchnia płatów 6190 na stanowisku od poprzedniego badania albo względem literatury. Samą powierzchnię wpisz obok – trafi do „wartości”.

Progi: nie podlega zmianom lub zwiększa się – FV; inne kombinacje – U1; wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze – U2. Przy pierwszym badaniu wybierz „Brak danych do porównania” (XX) albo oceń ekspercko.

Praktyka (sprawozdania 2016 i 2024): FV, gdy cała dostępna powierzchnia skał jest zajęta przez murawy z kostrzewą bladą; U1, gdy część skał porasta sama synuzja mszaków i porostów albo ok. 20% potencjalnego siedliska zajmuje roślinność nitrofilna; U2, gdy ok. 40% transektu zajęły zbiorowiska synantropijne po wydeptywaniu i rozjeżdżaniu (Radunia – szczyt, 2016). Płaty bez żadnych gatunków typowych nie wliczają się do powierzchni. W 2024 r. stanowiska miały od 0,001 ha do 0,08 ha, zwykle 0,02–0,03 ha.`,
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
        placeholder: 'np. 0,03 ha',
        help: 'Powierzchnia płatów 6190 na stanowisku, tak jak w karcie („0,03 ha”, „250 m²”) – trafi do pola „wartość”. W 2024 r. od 0,001 ha do 0,08 ha.',
      },
      noteInput('Opis (opcjonalnie)', 'np. powierzchnia stabilna, cała dostępna skała zajęta przez murawę…', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => {
      const a = String(i.areaText ?? '').trim()
      return note(i) || a || (i.choice ? labelOf(AREA, i.choice).toLowerCase() : '')
    },
  },
  {
    id: 'characteristic',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków charakterystycznych (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy gatunek na transekcie (z dokładnością do 10%).',
    help: `Co wpisać: gatunki diagnostyczne muraw z kostrzewą bladą stwierdzone na stanowisku, z pokryciem. Katalog liczy gatunki wymieniane w sprawozdaniach 2016 i 2024: kostrzewa blada Festuca pallens, zanokcica północna Asplenium septentrionale, zanokcica skalna A. trichomanes, paprotka zwyczajna Polypodium vulgare, rozchodnik wielki Sedum maximum, pięciornik srebrny Potentilla argentea, czyścica drobnokwiatowa Acinos arvensis, ciemiężyk białokwiatowy Vincetoxicum hirundinaria, czosnek skalny Allium montanum, przetacznik kłosowy Veronica spicata, tymotka Boehmera Phleum phleoides, goździk kartuzek Dianthus carthusianorum, rojownik pospolity Jovibarba sobolifera i rozchodniki (ościsty, ostry). Synonimy liczone raz. Liczbę możesz też wpisać wprost.

Progi (wstępna metodyka z 6110, stosowana w 2016 i 2024): obecność przynajmniej 4 gatunków charakterystycznych – FV; 2–3 gatunki – U1; jeden gatunek lub brak – U2.

Uwaga: kostrzewa owcza i mszaki (płonnik włosisty, zęboróg purpurowy) są typowe dla siedliska, ale nie są tu liczone. Ekspert patrzy też na pokrycie: w 2024 r. Wąwóz Czyżynki – południe z 3 gatunkami „z niskimi stopniami pokrycia” i dominacją mszaków dostał U2 (wg samej liczby wyszłoby U1) – formularz pokaże wtedy „odbiega od progów”, uzasadnij w opisie.

Wskaźnik kardynalny.`,
    thresholds: { FV: 'Obecność przynajmniej 4 gatunków charakterystycznych', U1: 'Obecność 2–3 gatunków charakterystycznych', U2: 'Jeden gatunek charakterystyczny lub brak gatunków charakterystycznych' },
    inputs: [
      speciesInput('Gatunki charakterystyczne', 'Gatunki charakterystyczne z pokryciem w % transektu, np. Festuca pallens 20, Asplenium septentrionale 1.'),
      { kind: 'number', name: 'count', label: 'Liczba gatunków charakterystycznych (opcjonalnie)', min: 0, help: 'Łączna liczba gatunków charakterystycznych wpisana wprost – ma pierwszeństwo przed liczeniem z listy.' },
      NONE_FIELD('Brak gatunków charakterystycznych', 'Zaznacz „Nie stwierdzono”, gdy na stanowisku nie ma żadnego gatunku charakterystycznego – wtedy wskaźnik to U2.'),
      noteInput('Opis (opcjonalnie)', 'np. kostrzewa blada Festuca pallens 20%, zanokcica północna…', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = characteristicCount(i)
      return c === undefined ? null : gradeCharacteristic6190(c)
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
      const other = names.filter((n) => findSpecies6190(n) && !isCharacteristic6190(n))
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
    help: `Co wpisać: gatunki o pokryciu co najmniej ${DOMINANT_MIN}% (we wszystkich warstwach, także mszaki), z pokryciem.

Progi: gatunki dominujące są jednocześnie charakterystycznymi – FV; gatunki charakterystyczne współdominują w siedlisku – U1; gatunki dominujące nie są charakterystyczne dla siedliska – U2.

Jak liczy formularz (praktyka 2016 i 2024): FV, gdy wszystkie dominanty są typowe dla siedliska, a wśród nich jest kostrzewa blada Festuca pallens (na stanowiskach FV „z udziałem zwykle ok. 20%”); U1, gdy obok typowych współdominuje gatunek obcy siedlisku (Radunia – szczyt: tasznik pospolity) albo dominują same gatunki typowe bez kostrzewy bladej – kostrzewa owcza Festuca ovina, płonnik włosisty Polytrichum piliferum, zęboróg purpurowy Ceratodon purpureus („ich dominacja wskazuje na zanik roślinności zielnej w płatach i ich homogenizację”, Wąwóz Czyżynki – południe); U2, gdy żaden dominant nie jest typowy. Ocena wybrana w polu ma pierwszeństwo.

Wskaźnik kardynalny.`,
    thresholds: thresholdsOf(DOMINANT),
    inputs: [
      speciesInput('Gatunki dominujące (pokrycie ≥10%)', `Gatunki o pokryciu co najmniej ${DOMINANT_MIN}%, np. Festuca pallens 20.`),
      optionalSelect('Ocena (opcjonalnie)', DOMINANT, 'Ocena ekspercka – ma pierwszeństwo przed liczeniem z listy.'),
      noteInput('Opis (opcjonalnie)', 'np. kostrzewa blada Festuca pallens 20%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => gradeMap(DOMINANT)[String(i.choice)] ?? gradeDominants6190(rowNames(i.species)),
    explain: (i) => {
      const names = distinct(rowNames(i.species))
      if (!names.length) return null
      const ok = names.filter(isTypicalDominant6190)
      const key = names.some(isKeyDominant6190) ? '' : `; brak ${KEY_DOMINANT_6190} wśród dominantów`
      return `Dominanty typowe dla siedliska: ${ok.length} z ${names.length}${ok.length ? ` (${ok.join(', ')})` : ''}${key} – z listy ${gradeDominants6190(names)}.`
    },
    warn: (i) => {
      const parts: string[] = []
      const low = speciesRows(i.species).filter((r) => r.name?.trim() && num(r.cover) !== undefined && num(r.cover)! < DOMINANT_MIN)
      if (low.length) parts.push(`Pokrycie poniżej ${DOMINANT_MIN}%: ${low.map((r) => r.name.trim()).join(', ')} – karta każe wpisywać tylko gatunki o pokryciu ≥${DOMINANT_MIN}%.`)
      const chosen = gradeMap(DOMINANT)[String(i.choice)]
      const fromList = gradeDominants6190(rowNames(i.species))
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
    help: `Co wpisać: gatunki obce na stanowisku z pokryciem (dla „<1%” wpisz 0,5). Łączne pokrycie możesz wpisać wprost. W murawach pannońskich obce praktycznie nie występują: w 2016 r. tylko rumianek bezpromieniowy Chamomilla suaveolens (Radunia – szczyt, poza transektem, na wydeptanych dawnych murawach), w 2024 r. – żadnego inwazyjnego.

Progi (wstępna metodyka z 6110): brak – FV; obecne, ale poniżej 2% – U1; powyżej 2% powierzchni – U2. Granicę 2% formularz liczy do U1.

Tasznik pospolity Capsella bursa-pastoris (archeofit) sprawozdanie 2024 wymienia w tab. 3 obok obcych, ale ocenia go we wskaźniku gatunków ekspansywnych (obce: 10 × FV mimo tasznika na 2 stanowiskach) – formularz robi tak samo. Wskaźnik niekardynalny, ale U2 obniża strukturę z FV do U1.`,
    thresholds: { FV: 'Brak', U1: 'Obecne, ale poniżej 2%', U2: 'Powyżej 2% powierzchni' },
    inputs: [
      speciesInput('Gatunki obce', 'Gatunki obce inwazyjne z pokryciem w % (dla „<1%” wpisz 0,5).'),
      coverField('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków obcych w % – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak gatunków obcych', 'Zaznacz „Nie stwierdzono”, gdy na stanowisku nie ma gatunków obcych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = listCount(i)
      return c === undefined ? null : gradeAliens6190(c, totalOf(i))
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
      const native = names.filter((n) => findSpecies6190(n) && !isAlien6190(n))
      if (native.length) parts.push(`Na liście są gatunki rodzime lub dawno zadomowione: ${native.join(', ')}.`)
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
      'Lista rodzimych gatunków ekspansywnych roślin zielnych (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy gatunek na transekcie (z dokładnością do 10%). W dobrze wykształconych murawach naskalnych nie powinny występować.',
    help: `Co wpisać: rośliny zielne, które wkraczają w murawy, z pokryciem. W 6190 to głównie gatunki synantropijne, sygnał wydeptywania i eutrofizacji (sprawozdania 2016 i 2024): rdest ptasi Polygonum aviculare, wiechlina roczna Poa annua, mniszek lekarski Taraxacum officinale, komosa prążkowana Chenopodium strictum i biała Ch. album, rdestówka zaroślowa Fallopia dumetorum, tasznik pospolity Capsella bursa-pastoris, życica trwała Lolium perenne. Drzew i krzewów tu nie wpisuj (osobny wskaźnik), gatunków obcych też nie.

Progi (wstępna metodyka z 6110): brak – FV; obecność gatunku potencjalnie ekspansywnego (nie więcej niż 5% powierzchni) – U1; powyżej 5% powierzchni – U2. Granicę 5% formularz liczy do U1.

Praktyka: pojedyncze gatunki z pokryciem ok. 1% (życica trwała w Wąwozie Pełcznicy, rdest ptasi, wiechlina roczna i mniszek na Ostrzycy – stok zachodni) – U1 (2024); „inwazja gatunków synantropijnych, głównie rdestu ptasiego” na wydeptanym szczycie Raduni – U2 (2016). Wyjątek z 2016 r.: jeden okaz rdestu ptasiego na transekcie (Ostrzyca – szczyt) „nie jest podstawą do obniżenia oceny” – formularz trzyma się progów (U1) i pokaże „odbiega od progów”, gdy dasz FV.

Wskaźnik kardynalny.`,
    thresholds: { FV: 'Brak', U1: 'Obecność gatunku, o którym wiadomo, że jest potencjalnie ekspansywny (nie więcej niż 5% powierzchni)', U2: 'Powyżej 5% powierzchni' },
    inputs: [
      speciesInput('Gatunki ekspansywne', 'Gatunki ekspansywne roślin zielnych z pokryciem w %, np. Polygonum aviculare 0,5, Lolium perenne 1.'),
      coverField('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków ekspansywnych w % – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak gatunków ekspansywnych', 'Zaznacz „Nie stwierdzono”, gdy na stanowisku nie ma gatunków ekspansywnych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. pojedynczo rdest ptasi Polygonum aviculare', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = listCount(i)
      return c === undefined ? null : gradeExpansive6190(c, totalOf(i))
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
      const woody = names.filter(isWoody6190)
      if (woody.length) parts.push(`Drzewa i krzewy wpisz we wskaźniku „Ekspansja krzewów i podrostu drzew”: ${woody.join(', ')}.`)
      const aliens = names.filter(isAlien6190)
      if (aliens.length) parts.push(`Gatunki obce wpisz we wskaźniku „Obce gatunki inwazyjne”: ${aliens.join(', ')}.`)
      const grass = names.filter((n) => findSpecies6190(n) && !isExpansive6190(n) && !isWoody6190(n) && !isAlien6190(n))
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
    id: 'shrubs',
    label: 'Ekspansja krzewów i podrostu drzew',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez wszystkie ekspansywne gatunki krzewów i drzew na transekcie (z dokładnością do 10%).',
    help: `Co wpisać: drzewa i krzewy (także siewki i podrost) na płatach muraw, z pokryciem; łączne zwarcie warstw B i A możesz wpisać wprost. W 2016 i 2024 r.: róża dzika, jabłoń, jarząb pospolity, osika, brzoza brodawkowata, cis pospolity; w otoczeniu dąb bezszypułkowy, sosna, lipa drobnolistna. Irga zwyczajna Cotoneaster integerrimus to naturalny składnik płatów – przy usuwaniu krzewów ją się zostawia.

Progi: brak lub pojedyncze okazy (formularz: łącznie do ${SINGLE_WOODY}%) – FV; do 30% zwarcie warstw B i A – U1; powyżej 30% – U2. Granicę 30% formularz liczy do U1.

Skąd „pojedyncze okazy”: wstępna metodyka z 6110 daje FV tylko przy „brak”, ale w 6190 w 2016 i 2024 r. wszystkie stanowiska z pojedynczymi okazami („razem mniej niż 1% powierzchni transektu”, młode osobniki zamierają w czasie suszy) dostały FV, a propozycja metodyki z 2018 r. mówi wprost, że pojedyncze krzewy nie pogarszają struktury (proponowane progi: ≤10% FV, 10–25% U1, >25% U2 – nie weszły). Wyżej niż ${SINGLE_WOODY}% formularz liczy wg 6110.

Wskaźnik kardynalny.`,
    thresholds: { FV: `Brak lub pojedyncze okazy (formularz: do ${SINGLE_WOODY}%)`, U1: 'Do 30% zwarcie warstw B i A', U2: 'Powyżej 30% zwarcie warstw B i A' },
    inputs: [
      speciesInput('Drzewa i krzewy', 'Drzewa i krzewy z pokryciem w %, np. Rosa canina 0,5, Sorbus aucuparia 0,5.'),
      coverField('Zwarcie warstw B i A (opcjonalnie)', 'Łączne zwarcie krzewów i drzew w % – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak drzew i krzewów', 'Zaznacz „Nie stwierdzono”, gdy na płatach nie ma drzew ani krzewów – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. pojedyncze okazy róży dzikiej i jarzębu, poniżej 1%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy.'),
    ],
    suggest: (i) => {
      const c = shrubsCover(i)
      return c === undefined ? null : gradeShrubs6190(c)
    },
    explain: (i) => {
      const c = shrubsCover(i)
      if (c === undefined) return rowNames(i.species).length ? 'Podaj pokrycie drzew i krzewów.' : null
      if (c <= 0) return null
      return c <= SINGLE_WOODY ? `Zwarcie drzew i krzewów: ${pct(c)} – pojedyncze okazy (FV wg praktyki 2016 i 2024).` : `Zwarcie drzew i krzewów: ${pct(c)}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && names.length) parts.push('Zaznaczono „Nie stwierdzono”, a lista nie jest pusta.')
      const herbs = names.filter((n) => findSpecies6190(n) && !isWoody6190(n) && !isAlien6190(n))
      if (herbs.length) parts.push(`To nie drzewa ani krzewy: ${herbs.join(', ')}.`)
      const aliens = names.filter(isAlien6190)
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
    description:
      'Udział procentowy powierzchni ocienionej przez drzewa i krzewy rosnące w płatach albo w ich sąsiedztwie. Siedlisko 6190 tworzy mozaiki z 40A0 (zarośla kserotermiczne) i 91I0 (dąbrowy ciepłolubne) – kluczowe jest ustalenie granicy płatów.',
    help: `Co wpisać: jaka część powierzchni płatów jest ocieniona przez drzewa i krzewy (także boczne ocienienie przez dęby i sosny rosnące obok skał), w procentach.

Progi (wstępna metodyka z 6110): brak lub słabe – FV; 20% powierzchni ocienionej – U1; powyżej 20% – U2. Metodyka nie mówi, ile to „słabe” – formularz przyjmuje do ${WEAK_SHADE}% (2016: wszystkie stanowiska FV, „ocienienie nie przekracza 10% powierzchni”; 2024: „nie przekracza 5–10%”), U1 powyżej ${WEAK_SHADE}% do 20% (20 też), U2 powyżej 20%.

W 6110 ten wskaźnik usunięto w 2015 r., ale w 6190 jest w zestawie 2016 i 2024 jako kardynalny. Nadmierny rozwój mchów (zwłaszcza rokietnika cyprysowatego Hypnum cupressiforme) to oznaka postępującego zacienienia (propozycja metodyki 2018).

Wskaźnik kardynalny.`,
    thresholds: { FV: `Brak lub słabe (formularz: do ${WEAK_SHADE}%)`, U1: '20% powierzchni ocienionej', U2: 'Powyżej 20% powierzchni ocienionej' },
    inputs: [
      { kind: 'text', name: 'value', label: 'Powierzchnia ocieniona', unit: '%', placeholder: 'np. 5–10', help: 'Procent powierzchni płatów w cieniu drzew i krzewów: liczba (5) albo zakres (5–10); z zakresu liczony jest środek. Brak ocienienia – 0.' },
      noteInput('Opis (opcjonalnie)', 'np. brak ocienienia, skały odsłonięte', 'Krótki opis, który trafi do „wartości” w karcie zamiast samego procentu.'),
    ],
    suggest: (i) => {
      const r = parseRange6190(i.value)
      return r ? gradeShade6190(r.mid) : null
    },
    explain: (i) => {
      const r = parseRange6190(i.value)
      return r && r.lo !== r.hi ? `Środek zakresu: ${pct(r.mid)}.` : null
    },
    warn: (i) => {
      const v = String(i.value ?? '').trim()
      if (v && !parseRange6190(v)) return 'Nie rozumiem ocienienia – wpisz liczbę albo zakres, np. 5–10.'
      const r = parseRange6190(v)
      return r && r.hi > 100 ? 'Ocienienie powyżej 100%? Na skale, w pełnym słońcu?' : null
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
      'Opis obserwowanych zniszczeń: wydeptywanie i rozjeżdżanie (turyści, rowery górskie, punkty widokowe, ogniska), zgryzanie i wydeptywanie przez muflony, procesy naturalne (spływy wód, wezbrania).',
    help: `Co wpisać: rodzaj zniszczeń i jaką część powierzchni siedliska obejmują. Wydeptywanie zostawia wyraźne ślady: niski wzrost, połamane rośliny, zgniecione kępy kostrzewy bladej. Lita skała (Wąwóz Czyżynki) jest na nie odporna.

Progi (wstępna metodyka z 6110): brak – FV; śladowe, ale obecne (do 10%) – U1; powyżej 20% powierzchni siedliska (siedlisko czułe na niszczenie mechaniczne) – U2. Luka 10–20% liczona do U1.

Jak liczy formularz: „brak” albo „tylko naturalne” → FV; antropogeniczne i od zwierząt – z wpisanego procentu (do 20% → U1, powyżej → U2); bez procentu – ocena wybierana ręcznie. Praktyka: 2024 – ślady wydeptywania na 4 stanowiskach (Ostrzyca – stok zachodni i wschodni, Radunia – szczyt, Wąwóz Pełcznicy – żółty szlak) → U1; 2016 – płaty „silnie wydeptywane i rozjeżdżone” na szczycie Raduni → U2.

Propozycja metodyki z 2018 r. rozbija wskaźnik na „Wydeptywanie muraw” (brak / ≤1 ścieżka na płat / liczne krzyżujące się ścieżki) i „Ślady zgryzania” (brak / <5% / >5% pokrycia roślin zielnych) – nie weszła; opisz to w notatce.`,
    thresholds: { FV: 'Brak', U1: 'Śladowe, ale obecne (do 10%)', U2: 'Powyżej 20% powierzchni siedliska (siedlisko czułe na niszczenie mechaniczne)' },
    inputs: [
      { kind: 'select', name: 'kind', label: 'Rodzaj zniszczeń', options: DAMAGE_KIND, required: true, help: 'Brak zniszczeń, tylko naturalne (FV) albo antropogeniczne / od zwierząt (wydeptywanie, rozjeżdżanie, muflony – ocena z procentu).' },
      coverField('Powierzchnia zniszczona (opcjonalnie)', 'Procent powierzchni siedliska z wydeptywaniem, rozjeżdżaniem albo zgryzaniem: do 20% → U1, powyżej → U2.'),
      noteInput('Opis', 'np. ślady wydeptywania przy punkcie widokowym, zgniecione kępy kostrzewy bladej', 'Opis obserwowanych zniszczeń – trafi do „wartości” w karcie.'),
    ],
    suggest: (i) => {
      if (i.kind === 'none' || i.kind === 'natural') return 'FV'
      if (i.kind !== 'human') return null
      const c = num(i.cover)
      return c === undefined ? null : gradeDamage6190(Math.max(c, 0.1))
    },
    explain: (i) => {
      if (i.kind === 'natural') return 'Procesy naturalne – nie obniżają oceny.'
      if (i.kind === 'human' && num(i.cover) === undefined) return 'Podaj procent zniszczonej powierzchni albo wybierz ocenę.'
      const c = num(i.cover)
      return i.kind === 'human' && c !== undefined && c > 10 && c <= 20 ? 'Luka 10–20% w progach – formularz liczy do U1.' : null
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
    placeholder: 'np. Ostrzyca stok zachodni',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Ostrzyca stok zachodni”, „Radunia – szczyt”, „Wąwóz Czyżynki – południe”, „Wąwóz Pełcznicy – punkt widokowy”, „Przełom Nysy koło Podtynia”, „Kalwaria koło Barda”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tych samych płatów.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. badawcze',
    help: `Typ stanowiska w sieci monitoringu, np. „badawcze” albo „referencyjne”. Jeśli nie wiesz, zostaw puste.

Dlaczego: przy ocenie na poziomie regionu stanowiska referencyjne pokazują, jak wygląda 6190 w dobrym stanie.`,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Asplenio septentrionalis-Festucion pallentis',
    help: `Zbiorowisko nazwą fitosocjologiczną. W Polsce 6190 to murawy naskalne z kostrzewą bladą Festuca pallens na podłożach bezwapiennych – związek Asplenio septentrionalis-Festucion pallentis (rząd Stipo-Festucetalia pallentis). Fitosocjologicznie pośrednie między murawami kserotermicznymi Festuco-Brometea a naskalnymi postaciami Koelerio-Corynephoretea.

Uwaga: murawy z kostrzewą bladą na wapieniach Jury to 6210; pionierskie murawy z rozchodnikami i rojownikiem na skałach wapiennych i zasadowych to 6110, na krzemianach – 8230.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 6,
    required: true,
    hint: 'Skała (bazalt, serpentynit, trachit, szarogłaz, zlepieniec), ekspozycja, nachylenie, otoczenie, szlaki.',
    help: `Krótka charakterystyka stanowiska:
• podłoże: skały bezwapienne – bazalty, serpentynity, trachity, szarogłazy, zlepieńce (jeden skrajnie ubogi płat znany z gnejsów);
• położenie: strome zbocza i skały, najczęściej ekspozycja południowa, miejsca silnie nasłonecznione;
• płaty: liczba, powierzchnia, udział nagiej skały i synuzji mszaków i porostów;
• otoczenie: zarośla kserotermiczne (40A0), dąbrowy ciepłolubne (91I0), szlaki, punkty widokowe, ogrodzenia przed muflonami.`,
  },
  {
    kind: 'text',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    required: true,
    placeholder: 'np. 0,03 ha',
    help: 'Suma powierzchni płatów 6190 na stanowisku, w m², arach albo ha – jak w karcie. W 2024 r. od 0,001 ha (Przełom Nysy koło Podtynia) do 0,08 ha (Radunia – stok południowo-zachodni), zwykle 0,02–0,03 ha; w całym kraju ok. 2 ha.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „PLH020042 Ostrzyca Proboszczowicka; rezerwat Ostrzyca Proboszczowicka”.',
  }),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. Nadleśnictwo Jawor',
    help: `Kto zarządza terenem: nadleśnictwo, RDOŚ (rezerwat), park krajobrazowy, gmina. W 2016 r. wszystkie 10 stanowisk leżało na gruntach Skarbu Państwa.

Dlaczego: od zarządcy zależą grodzenia przed muflonami, kanalizacja ruchu turystycznego i wycinka drzew ocieniających skały.`,
  },
  {
    kind: 'text',
    name: 'coords',
    label: 'Współrzędne geograficzne',
    required: true,
    help: `Współrzędne środka stanowiska (albo płatów) z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie.

Dlaczego: płaty są małe (często kilkadziesiąt–kilkaset m²) – bez współrzędnych za kilka lat nikt nie trafi na te same skały.`,
  },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    placeholder: 'np. transekt wzdłuż grzbietu skalnego',
    help: `Wpisz wymiary transektu albo opisz, co zbadano zamiast niego (płaty na skałach, część niedostępna oceniona z daleka). Metodyka nie narzuca wymiarów; wskaźniki (pokrycie gatunków, zniszczenia) podaje się w procentach powierzchni transektu albo płatów.

Dlaczego: następny wykonawca musi zbadać tę samą powierzchnię, żeby porównać oceny.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    help: 'Wysokość nad poziomem morza stanowiska (albo zakres), z GPS albo mapy. Stanowiska 6190 leżą na Pogórzu i Przedgórzu Sudeckim oraz w Sudetach – od kilkuset metrów (przełomy rzek) po szczyty wzgórz bazaltowych.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 20.06.2024',
    required: true,
    hint: 'Optymalnie maj – koniec lipca; gatunki diagnostyczne widoczne do końca września.',
    help: `Dzień badań terenowych. Sprawozdanie 2024: optymalny okres od maja do końca lipca, choć większość gatunków diagnostycznych widać przez cały sezon, do końca września (2016 r. – badania we wrześniu, 2024 r. – 12.06–26.07).

Badania powtarza się co 3–6 lat (stanowiska w dobrym stanie – kontrola okresowa).`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      if (m >= 5 && m <= 7) return null
      if (m >= 8 && m <= 9) return 'Termin po optymalnym oknie (maj–lipiec). Gatunki diagnostyczne są jeszcze widoczne, ale opisz to w uwagach.'
      return 'Termin poza sezonem wegetacyjnym (maj–wrzesień) – część gatunków może być nierozpoznawalna.'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
  {
    kind: 'text',
    name: 'additionalExperts',
    label: 'Dodatkowi eksperci',
    placeholder: 'np. —',
    help: 'Osoby, które brały udział w badaniu poza wykonawcą (współpracownicy, koordynator). Brak – zostaw puste albo wpisz „—”.',
  },
]

// ---------- zdjęcia fitosocjologiczne ----------

const r7120 = methodology7120.releves.fields
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia (płatu). Standardowo 3 zdjęcia w typowo wykształconych płatach.' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach.' }),
  pickField(r7120, 'area', {
    defaultValue: undefined,
    help: 'Powierzchnia zdjęcia w m² – na skałach zwykle cały płat albo jego część, często tylko kilka–kilkanaście m². Metodyka nie podaje standardowej wielkości – wpisz faktyczną.',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach – płaty 6190 zajmują strome zbocza i skały.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, SW). Optimum 6190: S i zbliżone, miejsca silnie nasłonecznione.' }),
  layerField('coverA', 'Warstwa A – drzewa: procent powierzchni zdjęcia pod koronami drzew. Na skałach zwykle 0 – korony drzew rosnących obok opisz przy ocienieniu.'),
  layerField('coverB', 'Warstwa B – krzewy i podrost: procent powierzchni zdjęcia. Pojedyncze róże, jarzęby, jabłonie – zwykle poniżej 1%.'),
  layerField('coverC', 'Warstwa C – zielna: procent powierzchni zdjęcia pokryty przez rośliny naczyniowe (kostrzewa blada zwykle ok. 20%).'),
  layerField('coverD', 'Warstwa D – mszysta: mchy i porosty, w %. Dominacja mszaków (płonnik włosisty, zęboróg) oznacza zanik roślinności zielnej; rokietnik cyprysowaty – zacienienie.'),
  layerField('heightA', 'Warstwa A – typowa wysokość drzew, w metrach.'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów i podrostu, w metrach.'),
  layerField('heightC', 'Warstwa C – typowa wysokość runa, w centymetrach (kępy kostrzewy bladej zwykle kilkanaście–kilkadziesiąt cm).'),
  layerField('heightD', 'Warstwa D – typowa wysokość warstwy mszystej, w centymetrach.'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Asplenio septentrionalis-Festucion pallentis',
    help: 'Jednostka fitosocjologiczna zdjęcia – w Polsce związek Asplenio septentrionalis-Festucion pallentis (Stipo-Festucetalia pallentis), murawy z kostrzewą bladą.',
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
    placeholder: 'np. płat na pionowej ścianie, część oceniona z dołu',
    help: 'Uwagi do zdjęcia, np. płat niedostępny bez sprzętu wspinaczkowego, część płatu oceniona przez lornetkę, płat za ogrodzeniem przed muflonami.',
  },
]

export const methodology6190: Methodology = {
  code: '6190',
  name: 'Murawy pannońskie (Stipo-Festucetalia pallentis)',
  source:
    'Sprawozdanie z monitoringu siedliska 6190 Murawy panońskie w roku 2024 (cykl 2023–2025, GIOŚ) – zestaw 7 wskaźników, 5 kardynalnych, praktyka oceny; Perzanowska J., Świerkosz K., Reczyńska K. 2018, Sprawozdanie z monitoringu siedliska 6190 (badania 2016, GIOŚ) – wstępna metodyka przyjęta z 6110 (progi: Świerkosz K., Szczęśniak E., Reczyńska K. 2010, 6110, [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ, tab. 2) i propozycja docelowej metodyki. Przewodnik dla 6190 (Świerkosz 2021) – maszynopis, niepublikowany.',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Standardowo 3 zdjęcia fitosocjologiczne w typowo wykształconych płatach muraw z kostrzewą bladą (powierzchnia zdjęcia to zwykle płat albo jego część na skale). Ilościowość w skali Braun-Blanqueta; warstwy B (krzewy), C (zielna) i D (mchy i porosty). Płat niedostępny – opisz w uwagach do zdjęcia.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Ocenie podlegają realne możliwości zachowania właściwego stanu siedliska oraz poprawy stanu niewłaściwego. W opisie należy umieścić informację na temat potencjalnych zabiegów ochronnych dla zachowania bądź poprawy stanu siedliska.',
    help: `Weź pod uwagę: presję turystyczną (wydeptywanie przy szlakach i punktach widokowych, dzikie szlaki rowerowe, ogniska), zgryzanie przez muflony (Pogórze Wałbrzyskie), wnoszenie azotu, sukcesję i ocienianie przez drzewa z sąsiedztwa, susze i ocieplenie klimatu. Murawy pannońskie są dość stabilne i odporne na sukcesję, więc o perspektywach decyduje głównie człowiek.

Praktyka 2024: FV tam, gdzie ruch turystyczny jest umiarkowany i skanalizowany, a położenie w rezerwacie chroni przed innymi zagrożeniami (grodzenia, zapory na Raduni); U1 przy braku działań ochronnych i presji turystycznej. 2016: U2 na szczycie Raduni – brak działań mimo planów ochrony, postępująca dewastacja.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.04', name: 'Wspinaczka górska, skałkowa i speleologia' },
    { code: 'G02.10', name: 'Inne kompleksy sportowe i rekreacyjne' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'G05.07', name: 'Niewłaściwie realizowane działania ochronne lub ich brak' },
    { code: 'H04.02', name: 'Wnoszenie azotu' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K04.05', name: 'Szkody wyrządzane przez roślinożerców (w tym zwierzynę łowną)' },
    { code: 'L08', name: 'Powódź (procesy naturalne)' },
    { code: 'M01.01', name: 'Zmiana temperatury (np. wzrost temperatury i temperatur skrajnych)' },
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
            hint: 'Np. sąsiednie siedliska 40A0, 91I0, 8220, gatunki chronione.',
            help: 'Wartości przyrodnicze stanowiska poza samymi murawami: sąsiednie siedliska (40A0 zarośla kserotermiczne, 91I0 dąbrowy ciepłolubne, 8220 ściany skalne), rzadkie i chronione gatunki roślin i zwierząt. Brak informacji – „Nie stwierdzono” albo „Nie pozyskano danych”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          { ...f, help: 'Jakie zabiegi ochronne wykonano i z jakim skutkiem: grodzenia przed muflonami (Wąwóz Czyżynki, od 2011 r.), kanalizacja ruchu turystycznego i zapory (Radunia), zakazy wstępu w rezerwatach, wycinka drzew ocieniających. Brak – „Nie”.' },
          {
            kind: 'textarea',
            name: 'proposals',
            label: 'Propozycje wprowadzenia działań ochronnych',
            rows: 4,
            hint: 'Np. grodzenie skał, barierki przy punkcie widokowym, tablice, wycinka drzew ocieniających.',
            help: `Jakie działania proponujesz (sprawozdania 2016 i 2024): ogrodzenie skał z siedliskiem i barierki przy punktach widokowych, tablice informacyjne o zakazie wstępu, kosze na śmieci, grodzenie przed muflonami i redukcja ich populacji, wycinka części drzew ocieniających skały (z pozostawieniem irgi zwyczajnej!), egzekwowanie zakazu palenia ognisk, okresowy wypas. Stanowiska w dobrym stanie – ochrona bierna z kontrolą co 3–6 lat. Brak – „Nie”.`,
          },
        ]
      if (f.name === 'notes')
        return [
          {
            ...f,
            help: `${f.help ?? ''}\n\nDla 6190 zapisz tu także: rok i typ monitoringu, odstępstwa od metodyki (termin, płaty niedostępne, transekt), obserwacje do propozycji metodyki z 2018 r. (pokrycie mszaków, liczba ścieżek, ślady zgryzania) oraz wątpliwości co do granicy z 40A0, 91I0 i 6110.`.trim(),
          },
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_6190.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer6190(s) })),
  speciesInfo: (name) => {
    const e = findSpecies6190(name)
    return e ? GROUP_LABELS_6190[e.group] : undefined
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator6190 = (id: string): IndicatorDef => {
  const i = methodology6190.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 6190`)
  return i
}
