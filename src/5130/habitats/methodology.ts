// Metodyka 5130 (zarośla jałowca pospolitego w murawach nawapiennych lub na wrzosowiskach) jako dane. Źródło:
// Perzanowska J. 2012, „5130 Zarośla jałowca pospolitego w murawach nawapiennych lub na wrzosowiskach” [w:] Mróz W. (red.),
// Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 268–281 (tab. 1 i 2, karta Poradów),
// z praktyką oceny ze sprawozdań z monitoringu 2009–2011, 2016–2018 i 2021.
// Siedlisko zaroślowe, niepriorytetowe, regiony alpejski i kontynentalny. Stanowisko to fragment płatu murawy (zwykle
// stok pagórka lub zbocze doliny) z zaroślami jałowca; na nim transekt 200×10 m i 3 zdjęcia fitosocjologiczne
// (początek, środek, koniec transektu).
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_5130,
  SPECIES_5130,
  TYPICAL_GENERA,
  defaultLayer5130,
  findSpecies5130,
  isAlien5130,
  isCharacteristic5130,
  isJuniper,
  isMesicShrub,
  isPsammo,
  isTarnina,
  speciesKey5130,
  typicalGenus,
  type TypicalGenus,
} from './species'

// ---------- liczby i zakresy ----------

/**
 * Liczba albo zakres wpisany jak w karcie papierowej: „0,9”, „0,8–1”, „15-20”, „śr. 0,8–1 m”, „30–40%”.
 * Zakres daje środek przedziału (do podpowiedzi oceny). Bzdura -> undefined.
 */
export function parseRange5130(value: unknown): { lo: number; hi: number; mid: number } | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? { lo: value, hi: value, mid: value } : undefined
  const t = String(value ?? '')
    .toLowerCase()
    .replace(/śr\.?|ok\.?|około|max\.?|%|m\b/g, '')
    .replace(/,/g, '.')
    .replace(/\s+/g, '')
  const m = /^(\d+(?:\.\d+)?)(?:[-–—](\d+(?:\.\d+)?))?$/.exec(t)
  if (!m) return undefined
  const lo = Number(m[1])
  const hi = m[2] !== undefined ? Number(m[2]) : lo
  return { lo: Math.min(lo, hi), hi: Math.max(lo, hi), mid: Math.round(((lo + hi) / 2) * 1000) / 1000 }
}

// ---------- progi liczbowe (tab. 2) ----------

/**
 * Powierzchnia zajęta przez siedlisko na transekcie (tab. 2, wiersz „powierzchnia zajęta przez siedlisko na stanowisku”):
 * „>15% pow. transektu” (ok. >3 a) FV, „5–15%” (1–3 a) U1, „<5%” (<1 a) U2. Obie granice przedziału U1 należą do U1.
 */
export const gradeShare5130 = (p: number): Grade => (p > 15 ? 'FV' : p >= 5 ? 'U1' : 'U2')

/** Wysokość krzewów (średnia, m): „>0,8 m” FV, „0,2–0,8 m” U1 (obie granice), „<0,2 m” U2. */
export const gradeHeight5130 = (h: number): Grade => (h > 0.8 ? 'FV' : h >= 0.2 ? 'U1' : 'U2')

/**
 * Zwarcie krzewów w płacie: „20–80%” FV (obie granice), „10–20% lub 80–90%” U1 (10 i 90 też), „<10% lub 90–100%” U2.
 */
export const gradeCover5130 = (p: number): Grade => (p >= 20 && p <= 80 ? 'FV' : p >= 10 && p <= 90 ? 'U1' : 'U2')

/** Udział gatunków drzewiastych (zwarcie drzew >1,5 m, %): 0 FV, do 20% U1 („zwarcie <20%”; 20 też), powyżej 20% U2. */
export const gradeTrees5130 = (p: number): Grade => (p <= 0 ? 'FV' : p <= 20 ? 'U1' : 'U2')

/** Jałowiec z pokryciem transektu poniżej tego progu to „sporadycznie jałowce” (U1). Próg formularza – metodyka liczby nie podaje. */
export const SPORADIC_JUNIPER = 5
/** Tarnina od tego pokrycia to „wysokie pokrycie przez tarninę” (U1). Próg formularza. */
export const HIGH_BLACKTHORN = 25
/** Tarnina od tego pokrycia to „masowe występowanie tarniny” (U2). Próg formularza. */
export const MASSIVE_BLACKTHORN = 50
/** Łączne pokrycie krzewów typowych poniżej tego progu to „sporadyczny udział gatunków typowych” (U2 przy krzewach mezofilnych). */
export const SPORADIC_TYPICAL = 10
/** Pokrycie gatunku obcego od tego progu to „duże płaty / masowe występowanie” (U2). Próg formularza. */
export const MASSIVE_ALIEN = 10

export interface ShrubFacts {
  /** Pokrycie jałowca: liczba, 'present' (na liście bez pokrycia) albo undefined (brak). */
  juniper?: number | 'present'
  /** Pokrycie tarniny (undefined = brak albo bez pokrycia). */
  blackthorn?: number
  /** Rodzaje z pełnego zestawu obecne na liście. */
  genera: Set<TypicalGenus>
  /** Czy są krzewy mezofilne, nietypowe (bez czarny, trzmielina, ligustr…). */
  mesic: boolean
  /** Łączne pokrycie krzewów typowych (undefined, gdy żaden nie ma pokrycia). */
  typicalTotal?: number
}

/**
 * Gatunki krzewów (tab. 2), z listy:
 * - U2: brak jałowca; masowa tarnina (≥50%); krzewy mezofilne przy sporadycznym udziale typowych (łącznie <10%);
 * - U1: jałowiec sporadycznie (<5%); wysokie pokrycie tarniny (≥25%); niepełny zestaw jałowiec, dereń, róża, głóg, tarnina, szakłak;
 * - FV: pełny zestaw sześciu rodzajów, jałowiec nie sporadycznie, tarnina nie dominuje.
 */
export function gradeShrubSpecies5130(f: ShrubFacts): Grade {
  if (f.juniper === undefined) return 'U2'
  if (f.blackthorn !== undefined && f.blackthorn >= MASSIVE_BLACKTHORN) return 'U2'
  if (f.mesic && f.typicalTotal !== undefined && f.typicalTotal < SPORADIC_TYPICAL) return 'U2'
  if (typeof f.juniper === 'number' && f.juniper < SPORADIC_JUNIPER) return 'U1'
  if (f.blackthorn !== undefined && f.blackthorn >= HIGH_BLACKTHORN) return 'U1'
  return TYPICAL_GENERA.every((g) => f.genera.has(g)) ? 'FV' : 'U1'
}

/** Gatunki charakterystyczne murawy/wrzosowiska z liczby: ≥3 FV, 1–2 U1, 0 U2 (próg formularza – tab. 2 jest opisowa). */
export const gradeCharacteristic5130 = (count: number): Grade => (count >= 3 ? 'FV' : count >= 1 ? 'U1' : 'U2')

/**
 * Obce gatunki inwazyjne: brak FV; pojedyncze lub w niewielkich kępach, jeden gatunek U1;
 * więcej niż jeden gatunek albo masowo / w dużych płatach U2.
 */
export function gradeAliens5130(count: number, abundance: 'single' | 'clumps' | 'massive' | ''): Grade {
  if (count <= 0) return 'FV'
  if (count > 1 || abundance === 'massive') return 'U2'
  return 'U1'
}

const pct = (v: number) => `${plNum(v)}%`
const rangeText = (s: string) => s.trim().replace(/\s*[-–—]\s*/, '–')
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey5130(n), n])).values()]
const round1 = (n: number) => Math.round(n * 10) / 10

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'other', label: 'Inne kombinacje (np. niewielki spadek, powierzchnia na granicy)', grade: 'U1' },
  { value: 'decrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi z literatury', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const SHRUBS: GradedOption[] = [
  { value: 'fv', label: 'Pełny zestaw gatunków typowych: jałowiec pospolity, dereń świdwa, róża, głóg, tarnina, szakłak', grade: 'FV' },
  { value: 'u1', label: 'Sporadycznie jałowce, wysokie pokrycie przez tarninę', grade: 'U1' },
  { value: 'u2', label: 'Obecne inne krzewy, bardziej mezofilne, np. bez czarny, trzmielina; sporadyczny udział gatunków typowych, masowe występowanie tarniny', grade: 'U2' },
]
const STRUCTURE: GradedOption[] = [
  { value: 'compact', label: 'Zwarty płat', grade: 'FV' },
  { value: 'patches', label: 'Kilka płatów', grade: 'FV' },
  { value: 'clumps', label: 'Kępy niewielkie lub rozproszone osobniki na całym transekcie', grade: 'U1' },
  { value: 'none', label: 'Brak kęp lub tylko pojedyncze osobniki', grade: 'U2' },
]
const TREES: GradedOption[] = [
  { value: 'none', label: 'Brak lub pojedyncze osobniki', grade: 'FV' },
  { value: 'some', label: 'Zwarcie <20%', grade: 'U1' },
  { value: 'many', label: 'Masowe występowanie – zwarcie >20%', grade: 'U2' },
]
const CHARACTERISTIC: GradedOption[] = [
  { value: 'fv', label: 'Liczne gatunki typowe (z kl. Festuco-Brometea), występujące obficie', grade: 'FV' },
  { value: 'u1', label: 'Bezwzględna dominacja 1–2 gatunków typowych, pozostałych brak lub występujące nielicznie', grade: 'U1' },
  { value: 'u2', label: 'Brak większości gatunków lub występujące sporadycznie, żaden nie należy do dominantów', grade: 'U2' },
]
const EXPANSIVE: GradedOption[] = [
  { value: 'fv', label: 'Brak lub pojedyncze osobniki', grade: 'FV' },
  { value: 'u1', label: 'Wyraźne kępy lub rozproszone pojedyncze osobniki na całej przestrzeni', grade: 'U1' },
  { value: 'u2', label: 'Masowe występowanie, zwłaszcza dużych bylin', grade: 'U2' },
]
const HEALTH: GradedOption[] = [
  { value: 'good', label: 'Brak widocznych oznak chorób, pasożytów i grzybów, najwyżej pojedyncze uschnięte krzewy', grade: 'FV' },
  { value: 'some', label: 'Zasychanie części krzewów (zrzucanie igieł), niewielki procent krzewów uschniętych', grade: 'U1' },
  { value: 'bad', label: 'Zasychanie lub zamieranie znacznej części krzewów', grade: 'U2' },
]
const REGEN: GradedOption[] = [
  { value: 'common', label: 'Obecne, powszechne', grade: 'FV' },
  { value: 'rare', label: 'Obecne, ale rzadkie', grade: 'U1' },
  { value: 'none', label: 'Brak lub sporadyczne', grade: 'U2' },
]
const ALIEN_ABUNDANCE: SelectOption[] = [
  { value: '', label: '—' },
  { value: 'single', label: 'Pojedyncze osobniki' },
  { value: 'clumps', label: 'Niewielkie kępy' },
  { value: 'massive', label: 'Masowo lub w dużych płatach' },
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

// ---------- zestaw wskaźników ----------

/**
 * Tab. 1 i 2 przewodnika (10 wskaźników, tak oceniano w 2016 i 2021) albo zestaw karty przykładowej i monitoringu
 * 2009–2010 (11 – ze stanem zdrowotnym jałowców).
 */
export const INDICATOR_SETS: SelectOption[] = [
  { value: 'tab2', label: 'Tab. 2 przewodnika – 10 wskaźników (jak w monitoringu 2016 i 2021)' },
  { value: 'card2010', label: 'Karta przykładowa i monitoring 2009–2010 – 11 wskaźników (ze stanem zdrowotnym jałowców)' },
]
const withHealth = (ctx: IndicatorContext) => ctx.site?.indicatorSet === 'card2010'

// ---------- gatunki krzewów: liczenie z listy ----------

/** Pokrycie z listy: suma liczb, 'present' (wpisany bez pokrycia) albo undefined (brak na liście). */
function coverOn(list: unknown, pred: (name: string) => boolean): number | 'present' | undefined {
  const rows = speciesRows(list).filter((r) => r.name?.trim() && pred(r.name))
  if (!rows.length) return undefined
  const covers = rows.map((r) => num(r.cover)).filter((c): c is number => c !== undefined)
  return covers.length ? round1(covers.reduce((a, b) => a + b, 0)) : 'present'
}

export function shrubFacts(list: unknown): ShrubFacts {
  const names = rowNames(list)
  const bt = coverOn(list, isTarnina)
  const typical = coverOn(list, (n) => typicalGenus(n) !== undefined)
  return {
    juniper: coverOn(list, isJuniper),
    blackthorn: typeof bt === 'number' ? bt : undefined,
    genera: new Set(names.map(typicalGenus).filter((g): g is TypicalGenus => g !== undefined)),
    mesic: names.some(isMesicShrub),
    typicalTotal: typeof typical === 'number' ? typical : undefined,
  }
}

function shrubsFromList(i: InputValues): Grade | null {
  if (!rowNames(i.species).length) return null
  return gradeShrubSpecies5130(shrubFacts(i.species))
}

// ---------- drzewa ----------

function treesCover(i: InputValues): number | undefined {
  const c = num(i.cover)
  if (c !== undefined) return c
  const rows = speciesRows(i.species).filter((r) => r.name?.trim())
  if (!rows.length) return i.none === 'yes' ? 0 : undefined
  const covers = rows.map((r) => num(r.cover)).filter((v): v is number => v !== undefined)
  return covers.length ? round1(covers.reduce((a, b) => a + b, 0)) : undefined
}

// ---------- gatunki charakterystyczne ----------

const characteristicNames = (i: InputValues) => distinct(rowNames(i.species).filter(isCharacteristic5130))
function characteristicCount(i: InputValues): number | undefined {
  const c = num(i.count)
  if (c !== undefined) return c
  return rowNames(i.species).length ? characteristicNames(i).length : undefined
}

// ---------- obce ----------

function aliensCount(i: InputValues): number | undefined {
  const names = distinct(rowNames(i.species))
  return num(i.count) ?? (names.length || i.none === 'yes' ? names.length : undefined)
}

function aliensAbundance(i: InputValues): 'single' | 'clumps' | 'massive' | '' {
  const a = String(i.abundance ?? '')
  if (a === 'single' || a === 'clumps' || a === 'massive') return a
  const covers = speciesRows(i.species)
    .map((r) => num(r.cover))
    .filter((c): c is number => c !== undefined)
  if (!covers.length) return ''
  const max = Math.max(...covers)
  return max >= MASSIVE_ALIEN ? 'massive' : max >= 1 ? 'clumps' : 'single'
}

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description:
      'Zmiana powierzchni zarośli jałowca na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury (tab. 2: „powierzchnia zajęta przez siedlisko na stanowisku”).',
    help: `Co wybrać: jak zmieniła się powierzchnia płatów 5130 na stanowisku od poprzedniego badania albo względem literatury i ortofotomap. Samą powierzchnię wpisz obok – trafi do „wartości” (w karcie z przewodnika: „0,1 ha”).

Progi (tab. 2): nie podlega zmianom lub zwiększa się, na ogół ok. >3 arów (>15% transektu) – FV; inne kombinacje, zwykle 1–3 ary (5–15% transektu) – U1; wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub literaturą, ok. <1 ara (<5% transektu) – U2. Przy pierwszym badaniu wybierz „Brak danych do porównania” (XX) albo oceń ekspercko.

Uwaga: siedlisko to stadium sukcesyjne – powierzchnia spada przez zarastanie drzewami i tarniną, a rośnie po odkrzaczaniu. Sprawozdanie 2021: od 0,02 ha do 37 ha, najczęściej kilka hektarów; zmiana bywa skutkiem innego podejścia eksperta, a nie zmiany w terenie (Kopieniec: 0,5 ha w 2009, 2 ha w 2016) – opisz to. Gdy siedliska już nie ma (zarosło albo to murawa napiaskowa 6120), powierzchnia = 0 i U2.`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się, na ogół ok. >3 a (>15% pow. transektu)',
      U1: 'Inne kombinacje, powierzchnia zwykle w zakresie 1–3 a (5–15% pow. transektu)',
      U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze, ok. <1 a (<5% pow. transektu)',
    },
    inputs: [
      optionalSelect('Zmiana powierzchni', AREA, 'Puste, gdy oceniasz ekspercko (np. pierwsze badanie).'),
      {
        kind: 'text',
        name: 'areaText',
        label: 'Powierzchnia (opcjonalnie)',
        placeholder: 'np. 0,1 ha',
        help: 'Powierzchnia płatów siedliska na stanowisku, tak jak w karcie („0,1 ha”, „kilka ha”) – trafi do pola „wartość”. Sprawozdanie 2021: od 0,02 do 37 ha.',
      },
      noteInput('Opis (opcjonalnie)', 'np. po odkrzaczaniu 2019 płat powiększył się o ok. 0,2 ha', 'Krótki opis zmian, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    explain: (_i, ctx) => {
      const s = parseRange5130(ctx?.indicators?.share?.inputs?.value)
      return s ? `Siedlisko zajmuje ${pct(s.mid)} transektu – wg orientacyjnych progów tab. 2 to ${gradeShare5130(s.mid)}.` : null
    },
    describe: (i) => {
      const a = String(i.areaText ?? '').trim()
      return note(i) || a || (i.choice ? labelOf(AREA, i.choice).toLowerCase() : '')
    },
  },
  {
    id: 'share',
    label: 'Powierzchnia zajęta przez siedlisko na transekcie',
    parameter: 'structure',
    description:
      'Szacunkowa powierzchnia zajęta przez zwarte zarośla jałowca, tj. kępy o powierzchni przynajmniej ok. 2×2 m i wysokości krzewów powyżej 0,5 m – powierzchnia wieloboku obejmującego zaobserwowane kępy, jako procent transektu.',
    help: `Co wpisać: jaka część transektu (200×10 m = 20 arów) jest zajęta przez zarośla jałowca 5130. Liczą się kępy co najmniej ok. 2×2 m z krzewami wyższymi niż 0,5 m – obrysuj je wielobokiem i podaj procent transektu (1 ar = 5%). Liczba („35”) albo zakres jak w karcie („30–40”); z zakresu liczony jest środek.

Progi (tab. 2, wiersz „powierzchnia zajęta przez siedlisko na stanowisku”): >15% (ok. >3 arów) – FV; 5–15% (1–3 ary) – U1; <5% (<1 ar) – U2. Obie granice 5% i 15% formularz liczy do U1.

Sprawozdanie 2016–2018 zwraca uwagę, że o diagnozie decyduje też murawa między kępami – opisz, czy transekt przecina inne zbiorowiska (las, zarośla tarniny, pole). W 2021 r. wartości od kilku do 100%, najczęściej 40–80%; U2 tam, gdzie siedlisko błędnie zidentyfikowano.`,
    thresholds: { FV: '>15% pow. transektu (ok. >3 a)', U1: '5–15% pow. transektu (1–3 a)', U2: '<5% pow. transektu (<1 a)' },
    inputs: [
      { kind: 'text', name: 'value', label: 'Udział zarośli na transekcie', unit: '%', placeholder: 'np. 30–40', required: true, help: 'Procent powierzchni transektu zajęty przez zarośla jałowca: liczba (35) albo zakres (30–40). Brak siedliska = 0. W karcie z przewodnika: 30–40%.' },
      noteInput('Opis (opcjonalnie)', 'np. kępy jałowca w górnej części transektu, dół zarasta tarnina', 'Krótki opis, który trafi do „wartości” w karcie zamiast samego procentu.'),
    ],
    suggest: (i) => {
      const r = parseRange5130(i.value)
      return r ? gradeShare5130(r.mid) : null
    },
    explain: (i) => {
      const r = parseRange5130(i.value)
      return r && r.lo !== r.hi ? `Środek zakresu: ${pct(r.mid)}.` : null
    },
    warn: (i) => {
      const v = String(i.value ?? '').trim()
      if (v && !parseRange5130(v)) return 'Nie rozumiem udziału – wpisz liczbę albo zakres, np. 30–40.'
      const r = parseRange5130(v)
      return r && r.hi > 100 ? 'Udział powyżej 100%? Transekt nie jest z gumy.' : null
    },
    describe: (i) => {
      const v = String(i.value ?? '').trim()
      return note(i) || (v ? `${rangeText(v)}%` : '')
    },
  },
  {
    id: 'shrubs',
    label: 'Gatunki krzewów',
    parameter: 'structure',
    cardinal: true,
    description:
      'Krzewy występujące w granicach transektu z nazwą gatunkową i pokryciem transektu (w zaokrągleniu do 10%, gatunki pojedyncze – jako sporadyczne). Wskaźnik ocenia prawidłowość składu gatunkowego zbiorowiska roślinnego.',
    help: `Co wpisać: wszystkie krzewy na transekcie z pokryciem w procentach transektu (dla „<1%” wpisz 0,5). Formularz patrzy na jałowiec, tarninę, pełny zestaw gatunków typowych i krzewy mezofilne.

Progi (tab. 2): pełny zestaw gatunków typowych: jałowiec pospolity, dereń świdwa, róża, głóg, tarnina, szakłak – FV; sporadycznie jałowce, wysokie pokrycie przez tarninę – U1; obecne inne krzewy, bardziej mezofilne, np. bez czarny, trzmielina; sporadyczny udział gatunków typowych, masowe występowanie tarniny – U2.

Jak liczy formularz (metodyka nie podaje liczb):
• U2 – brak jałowca; tarnina od ${MASSIVE_BLACKTHORN}% transektu; krzewy mezofilne (bez czarny, trzmielina, ligustr, kalina koralowa, kruszyna, leszczyna, ałycza) przy krzewach typowych łącznie poniżej ${SPORADIC_TYPICAL}%;
• U1 – jałowiec poniżej ${SPORADIC_JUNIPER}%; tarnina od ${HIGH_BLACKTHORN}%; brak któregoś z sześciu rodzajów pełnego zestawu (róże i głogi liczone po rodzaju);
• FV – pełny zestaw sześciu rodzajów, bez sporadycznego jałowca i dominacji tarniny.
Karta z przewodnika (Poradów): jałowiec 80%, róża 10%, dereń 5%, tarnina <1% – bez głogu i szakłaka → U1. W praktyce (sprawozdania 2016–2021) FV dawano też przy niepełnym zestawie, np. w Tatrach, gdzie poza jałowcem rośnie tylko róża – wtedy wybierz ocenę w polu „Ocena składu” (ma pierwszeństwo przed listą) i uzasadnij. Propozycja ze sprawozdania 2016–2018 („co najmniej 3 gatunki typowe” = FV) nie weszła do metodyki.

Wskaźnik kardynalny.`,
    thresholds: thresholdsOf(SHRUBS),
    inputs: [
      speciesInput('Krzewy na transekcie', 'Krzewy w granicach transektu z pokryciem w % transektu, np. Juniperus communis 80, Rosa canina 10, Cornus sanguinea 5.'),
      optionalSelect('Ocena składu (opcjonalnie)', SHRUBS, 'Ocena ekspercka – ma pierwszeństwo przed liczeniem z listy. Użyj, gdy lista nie oddaje sytuacji (np. górskie zarośla z samym jałowcem i różą).'),
      noteInput('Opis (opcjonalnie)', 'np. jałowiec Juniperus communis 80%, róża Rosa canina 10%…', 'Krótki opis składu, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => gradeMap(SHRUBS)[String(i.choice)] ?? shrubsFromList(i),
    explain: (i) => {
      if (!rowNames(i.species).length) return null
      const f = shrubFacts(i.species)
      const jun = f.juniper === undefined ? 'brak' : f.juniper === 'present' ? 'jest (bez pokrycia)' : pct(f.juniper)
      const missing = TYPICAL_GENERA.filter((g) => !f.genera.has(g))
      return [
        `Jałowiec: ${jun}`,
        `tarnina: ${f.blackthorn === undefined ? 'brak/bez pokrycia' : pct(f.blackthorn)}`,
        missing.length ? `z pełnego zestawu brakuje: ${missing.join(', ')}` : 'pełny zestaw gatunków typowych',
        f.mesic ? 'są krzewy mezofilne' : '',
      ]
        .filter(Boolean)
        .join('; ')
        .concat(` – z listy ${shrubsFromList(i)}.`)
    },
    warn: (i) => {
      const names = rowNames(i.species)
      const parts: string[] = []
      const herbs = distinct(names.filter((n) => findSpecies5130(n) && !findSpecies5130(n)!.woody))
      if (herbs.length) parts.push(`To nie krzewy: ${herbs.join(', ')}.`)
      const chosen = gradeMap(SHRUBS)[String(i.choice)]
      const fromList = shrubsFromList(i)
      if (chosen && fromList && chosen !== fromList) parts.push(`Wybrano ${chosen}, a z listy wychodzi ${fromList} – sprawdź i uzasadnij.`)
      if (names.length && !names.some(isJuniper)) parts.push('Na liście nie ma jałowca – czy to na pewno 5130?')
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => note(i) || describeSpecies(speciesRows(i.species)) || (i.choice ? labelOf(SHRUBS, i.choice) : ''),
  },
  {
    id: 'height',
    label: 'Wysokość krzewów (średnia)',
    parameter: 'structure',
    description: 'Średnia wysokość dla całych kęp krzewów jałowców, w metrach. Wskaźnik pośrednio wskazuje wiek krzewów i strukturę zbiorowiska.',
    help: `Co wpisać: przeciętną wysokość kęp jałowca na transekcie, w metrach – jedną liczbę („0,9”) albo zakres jak w karcie („0,8–1”); z zakresu liczony jest środek. Wysokość najwyższych krzewów wpisz osobno – nie wpływa na ocenę.

Progi (tab. 2): >0,8 m – FV; 0,2–0,8 m – U1; <0,2 m – U2. Granica 0,8 m należy do U1 (FV to „powyżej 0,8 m”).

Uwaga z przewodnika: wysokość, zwarcie i struktura przestrzenna łączą się ze sobą – niskie, rozproszone osobniki to stadium inicjalne. Sprawozdanie 2021: najczęściej 1,5–2,5 m; U1 (ok. 0,6 m) po wykarczowaniu wyższych krzewów.`,
    thresholds: { FV: '>0,8 m', U1: '0,2–0,8 m', U2: '<0,2 m' },
    inputs: [
      { kind: 'text', name: 'height', label: 'Średnia wysokość krzewów', unit: 'm', placeholder: 'np. 0,8–1', required: true, help: 'Przeciętna wysokość kęp jałowca w metrach: liczba (0,9) albo zakres (0,8–1). Przecinek albo kropka.' },
      { kind: 'text', name: 'max', label: 'Najwyższe krzewy (opcjonalnie)', unit: 'm', placeholder: 'np. 2,5', help: 'Wysokość najwyższych krzewów, w metrach – trafia do „wartości” („max. 2,5 m”), na ocenę nie wpływa.' },
      noteInput('Opis (opcjonalnie)', 'np. stare jałowce do 3 m, przy obrzeżach młode do 0,5 m', 'Krótki opis, który trafi do „wartości” w karcie zamiast wysokości.'),
    ],
    suggest: (i) => {
      const r = parseRange5130(i.height)
      return r ? gradeHeight5130(r.mid) : null
    },
    explain: (i) => {
      const r = parseRange5130(i.height)
      return r && r.lo !== r.hi ? `Środek zakresu: ${plNum(r.mid)} m.` : null
    },
    warn: (i) => {
      const h = String(i.height ?? '').trim()
      if (h && !parseRange5130(h)) return 'Nie rozumiem wysokości – wpisz liczbę albo zakres, np. 0,8–1.'
      const r = parseRange5130(h)
      return r && r.hi > 15 ? 'Ponad 15 m? To wysokość w centymetrach – wpisz w metrach.' : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const h = String(i.height ?? '').trim()
      const max = String(i.max ?? '').trim()
      return [max ? `Max. ${rangeText(max)} m` : '', h ? `śr. ${rangeText(h)} m` : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'cover',
    label: 'Zwarcie krzewów w płacie',
    parameter: 'structure',
    description: 'Zwarcie krzewów w płacie, w procentach (z dokładnością do 5%). Wskaźnik wskazuje na etap rozwoju i strukturę zbiorowiska.',
    help: `Co wpisać: zwarcie koron krzewów w płatach zarośli, w procentach – liczba („40”) albo zakres jak w karcie („15–20”); z zakresu liczony jest środek.

Progi (tab. 2): 20–80% – FV; 10–20% lub 80–90% – U1; <10% lub 90–100% – U2. Granice 20% i 80% formularz liczy do FV, 10% i 90% – do U1.

Dlaczego oba końce są złe (przewodnik): zbyt małe zwarcie to stadium inicjalne, w przerwach wchodzą tarnina i drzewa; zwarcie bliskie 100% ocienia jałowce, krzewy obsychają, nie ma gdzie się odnawiać, a z runa wycofują się gatunki murawowe. Sprawozdanie 2021: Szewców Gronik 90–100% → U2. Propozycja z 2016–2018 (FV 10–60%) nie weszła do metodyki.`,
    thresholds: { FV: '20–80%', U1: '10–20% lub 80–90%', U2: '<10% lub 90–100%' },
    inputs: [
      { kind: 'text', name: 'value', label: 'Zwarcie krzewów', unit: '%', placeholder: 'np. 15–20', required: true, help: 'Zwarcie krzewów w płatach, w procentach: liczba (40) albo zakres (15–20).' },
      noteInput('Opis (opcjonalnie)', 'np. zwarte kępy w górnej części, luźne w dolnej', 'Krótki opis, który trafi do „wartości” w karcie zamiast samego zwarcia.'),
    ],
    suggest: (i) => {
      const r = parseRange5130(i.value)
      return r ? gradeCover5130(r.mid) : null
    },
    explain: (i) => {
      const r = parseRange5130(i.value)
      return r && r.lo !== r.hi ? `Środek zakresu: ${pct(r.mid)}.` : null
    },
    warn: (i) => {
      const v = String(i.value ?? '').trim()
      if (v && !parseRange5130(v)) return 'Nie rozumiem zwarcia – wpisz liczbę albo zakres, np. 15–20.'
      const r = parseRange5130(v)
      return r && r.hi > 100 ? 'Zwarcie powyżej 100%? Ambitnie.' : null
    },
    describe: (i) => {
      const v = String(i.value ?? '').trim()
      return note(i) || (v ? `${rangeText(v)}%` : '')
    },
  },
  {
    id: 'structure',
    label: 'Struktura przestrzenna płatów zarośli',
    parameter: 'structure',
    description:
      'Dominujący sposób rozmieszczenia krzewów jałowców na transekcie: zwarty płat, kilka płatów, pojedyncze kępy, rozproszone pojedyncze krzewy. Mówi o etapie rozwoju zarośli; analizować łącznie z odnowieniem i wysokością krzewów jałowców oraz zwarciem krzewów.',
    help: `Co wybrać: jak rozmieszczone są jałowce na transekcie.

Progi (tab. 2): zwarty płat lub kilka płatów – FV; kępy niewielkie lub rozproszone osobniki na całym transekcie – U1; brak kęp lub tylko pojedyncze osobniki – U2. Karta z przewodnika: „kilka płatów lub niewielkie kępy, lub też pojedyncze jałowce w rozproszeniu na murawie” → U1.

Uwaga: „zwarty płat” z tab. 2 to płat jałowca w murawie. Jeden wielki płat zwartych zarośli tarniny i derenia z jałowcem w środku to już nie 5130 – w 2021 r. taki przypadek (Szewców Gronik) oceniono na U2. Sprawozdanie 2016–2018 proponowało usunięcie wskaźnika (dubluje zwarcie) – nie weszło.`,
    thresholds: { FV: 'Zwarty płat lub kilka płatów', U1: 'Kępy niewielkie lub rozproszone osobniki na całym transekcie', U2: 'Brak kęp lub tylko pojedyncze osobniki' },
    inputs: [
      selectInput('Struktura płatów', STRUCTURE),
      noteInput('Opis (opcjonalnie)', 'np. Kilka płatów lub niewielkie kępy, lub też pojedyncze jałowce w rozproszeniu na murawie', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(STRUCTURE)),
    describe: (i) => note(i) || labelOf(STRUCTURE, i.choice),
  },
  {
    id: 'trees',
    label: 'Udział gatunków drzewiastych (powyżej 1,5 m wys.)',
    parameter: 'structure',
    cardinal: true,
    description:
      'Gatunki drzew w granicach transektu z pokryciem transektu (w zaokrągleniu do 10%, pojedyncze osobniki – jako sporadyczne). Dotyczy roślin wyższych od krzewów jałowca, zwykle od ok. 1,5–2 m: w najbliższym czasie mogą ocienić zarośla i pogorszyć warunki świetlne.',
    help: `Co wpisać: drzewa wyższe niż ok. 1,5 m (sosna, świerk, modrzew, brzoza, jesion, klony, osika, dęby, czereśnia, jabłoń, grusza) z pokryciem transektu. Łączne zwarcie wpisz wprost albo zostaw – formularz zsumuje pokrycie z listy (dla „<1%” wpisz 0,5). Gdy drzew nie ma albo to tylko pojedyncze osobniki, wybierz klasę „Brak lub pojedyncze osobniki”.

Progi (tab. 2): brak lub pojedyncze osobniki – FV; zwarcie <20% – U1; masowe występowanie – zwarcie >20% – U2. Granica 20% formularz liczy do U1 (sprawozdanie 2021: 15–20% „na granicy przedziału” → U1; 25–35% → U2).

Jak liczy formularz: klasa wybrana w polu ma pierwszeństwo; potem łączne zwarcie wpisane wprost, potem suma z listy. Zwarcie 0 → FV, do 20% → U1, powyżej → U2. Karta z przewodnika: czereśnia <1% + sosna <1% → U1 (ekspert nie uznał ich za „pojedyncze”).

Wskaźnik kardynalny. Sprawozdania 2009–2021: najgorzej oceniany wskaźnik – sukcesja lasu (często po dawnych nasadzeniach sosny) to główne zagrożenie 5130. Obce drzewa (sosna czarna, robinia, dąb czerwony, czeremcha amerykańska) wpisz we wskaźniku „Obce gatunki inwazyjne”.`,
    thresholds: thresholdsOf(TREES),
    inputs: [
      optionalSelect('Klasa udziału drzew (opcjonalnie)', TREES, 'Ocena ekspercka – ma pierwszeństwo przed zwarciem i listą.'),
      { kind: 'number', name: 'cover', label: 'Zwarcie drzew powyżej 1,5 m (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Łączne zwarcie (pokrycie) drzew wyższych niż ok. 1,5 m, w % transektu – ma pierwszeństwo przed sumą z listy.' },
      speciesInput('Gatunki drzew (opcjonalnie)', 'Drzewa wyższe niż ok. 1,5 m z pokryciem w % transektu, np. Pinus sylvestris 5.'),
      NONE_FIELD('Brak drzew', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma drzew wyższych niż 1,5 m – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. wiśnia ptasia Cerasus avium <1%; sosna zwyczajna Pinus sylvestris <1%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy.'),
    ],
    suggest: (i) => {
      const chosen = gradeMap(TREES)[String(i.choice)]
      if (chosen) return chosen
      const c = treesCover(i)
      return c === undefined ? null : gradeTrees5130(c)
    },
    explain: (i) => {
      if (i.choice) return null
      const c = treesCover(i)
      return c !== undefined && c > 0 ? `Zwarcie drzew: ${pct(c)}.` : null
    },
    warn: (i) => {
      const names = rowNames(i.species)
      const parts: string[] = []
      if ((i.choice === 'none' || i.none === 'yes') && treesCover(i)! > 1) parts.push('Zaznaczono brak/pojedyncze drzewa, a zwarcie z listy przekracza 1%.')
      const aliens = distinct(names.filter(isAlien5130))
      if (aliens.length) parts.push(`Obce drzewa wpisz też we wskaźniku „Obce gatunki inwazyjne”: ${aliens.join(', ')}.`)
      const herbs = distinct(names.filter((n) => findSpecies5130(n) && !findSpecies5130(n)!.woody))
      if (herbs.length) parts.push(`To nie drzewa: ${herbs.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      if (list) return list
      const c = num(i.cover)
      if (c !== undefined) return pct(c)
      return i.none === 'yes' ? 'Brak' : labelOf(TREES, i.choice)
    },
  },
  {
    id: 'characteristic',
    label: 'Gatunki charakterystyczne murawy kserotermicznej/wrzosowiska',
    parameter: 'structure',
    cardinal: true,
    description:
      'Gatunki roślin charakterystycznych w granicach transektu z nazwą i pokryciem transektu – dla ok. pięciu o największym pokryciu (w zaokrągleniu do 5%). Wskaźnik wskazuje na rodzaj murawy i poprawność zaklasyfikowania zarośli (eliminacja zarośli z muraw napiaskowych lub pastwisk świeżych).',
    help: `Co wpisać: ok. pięć gatunków charakterystycznych murawy (albo wrzosowiska) o największym pokryciu na transekcie, z pokryciem. Katalog zna gatunki z przewodnika: murawy kserotermiczne (kl. Festuco-Brometea, np. oman wąskolistny, turzyca niska, aster gawędka, kłosownica pierzasta), murawy wysokogórskie (Elyno-Seslerietea, np. sesleria tatrzańska, kostrzewa tatrzańska) i wrzosowiska (Nardo-Callunetea, np. wrzos, bliźniczka psia trawka, borówki). Łączną liczbę gatunków charakterystycznych na transekcie możesz wpisać wprost (w 2021 r. nawet 25–30).

Progi (tab. 2): liczne gatunki typowe (z kl. Festuco-Brometea), występujące obficie – FV; bezwzględna dominacja 1–2 gatunków typowych, pozostałych brak lub występujące nielicznie – U1; brak większości gatunków lub występujące sporadycznie, żaden nie należy do dominantów – U2.

Jak liczy formularz: ocena wybrana w polu ma pierwszeństwo (dominację 1–2 gatunków oceń sam); bez niej – liczba gatunków charakterystycznych (wpisana wprost albo policzona z listy): co najmniej 3 → FV, 1–2 → U1, 0 → U2. Karta z przewodnika: 5 gatunków → FV.

Uwaga (sprawozdanie 2021): zarośla jałowca na murawach napiaskowych (6120: strzęplica sina, szczotlicha, kostrzewa piaskowa, kocanki) to NIE 5130 – takie stanowiska wskazano do usunięcia (U2). Formularz ostrzega, gdy wpiszesz gatunki 6120. Na wrzosowiskach licz gatunki Nardo-Callunetea (tab. 2 zapomina o nich, sprawozdanie 2016–2018 to wytyka).

Wskaźnik kardynalny.`,
    thresholds: thresholdsOf(CHARACTERISTIC),
    inputs: [
      speciesInput('Gatunki charakterystyczne (ok. 5 o największym pokryciu)', 'Gatunki charakterystyczne murawy/wrzosowiska z pokryciem w % transektu, np. Inula ensifolia 40, Carex humilis 10.'),
      { kind: 'number', name: 'count', label: 'Liczba gatunków charakterystycznych (opcjonalnie)', min: 0, help: 'Łączna liczba gatunków charakterystycznych na transekcie, wpisana wprost – ma pierwszeństwo przed liczeniem z listy (lista ma zwykle tylko ok. pięć gatunków).' },
      optionalSelect('Ocena (opcjonalnie)', CHARACTERISTIC, 'Ocena ekspercka wg tab. 2 – ma pierwszeństwo przed liczbą gatunków. Wybierz ją zwłaszcza przy bezwzględnej dominacji 1–2 gatunków (np. kłosownicy pierzastej).'),
      noteInput('Opis (opcjonalnie)', 'np. oman wąskolistny Inula ensifolia, turzyca niska Carex humilis…', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const chosen = gradeMap(CHARACTERISTIC)[String(i.choice)]
      if (chosen) return chosen
      const c = characteristicCount(i)
      return c === undefined ? null : gradeCharacteristic5130(c)
    },
    explain: (i) => {
      if (num(i.count) !== undefined || !rowNames(i.species).length) return null
      const names = characteristicNames(i)
      return `Gatunki charakterystyczne z katalogu: ${names.length}${names.length ? ` (${names.join(', ')})` : ''}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      const psammo = names.filter(isPsammo)
      if (psammo.length) parts.push(`Gatunki muraw napiaskowych (6120): ${psammo.join(', ')} – zarośla jałowca na murawie napiaskowej to nie 5130.`)
      const other = names.filter((n) => findSpecies5130(n) && !isCharacteristic5130(n) && !isPsammo(n))
      if (other.length) parts.push(`Nie liczą się jako charakterystyczne: ${other.join(', ')}.`)
      const chosen = gradeMap(CHARACTERISTIC)[String(i.choice)]
      const c = characteristicCount(i)
      if (chosen && c !== undefined && chosen !== gradeCharacteristic5130(c) && !(chosen === 'U1' && c >= 3))
        parts.push(`Wybrano ${chosen}, a z liczby gatunków wychodzi ${gradeCharacteristic5130(c)} – sprawdź.`)
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
    id: 'expansive',
    label: 'Gatunki ekspansywnych roślin zielnych',
    parameter: 'structure',
    description:
      'Gatunki roślin zielnych o skłonnościach do łanowego występowania, w granicach transektu, z nazwą i pokryciem transektu (w zaokrągleniu do 10%, pojedyncze osobniki – jako sporadyczne). Wskaźnik zagrożenia konkurencją o miejsce ze strony innych gatunków i stopnia przekształcenia murawy kserotermicznej.',
    help: `Co wpisać: rodzime gatunki zielne, które na transekcie tworzą łany albo duże kępy, z pokryciem. Najczęściej (sprawozdania 2009–2021): trzcinnik piaskowy Calamagrostis epigejos, orlica Pteridium aquilinum, jeżyna popielica Rubus caesius, w Pieninach trzcinnik pstry Calamagrostis varia, a na murawach zaniedbanych kostrzewa czerwona Festuca rubra tworząca wojłok. Gatunków obcych tu nie wpisuj – mają osobny wskaźnik.

Progi (tab. 2): brak lub pojedyncze osobniki – FV; wyraźne kępy lub rozproszone pojedyncze osobniki na całej przestrzeni – U1; masowe występowanie, zwłaszcza dużych bylin – U2. Metodyka nie podaje progów pokrycia, więc przy wpisanych gatunkach ocenę wybierasz (formularz podpowiada FV przy „nie stwierdzono”).`,
    thresholds: thresholdsOf(EXPANSIVE),
    inputs: [
      speciesInput('Gatunki ekspansywne na transekcie', 'Rodzime gatunki zielne o skłonnościach do łanowego występowania, z pokryciem w % transektu.'),
      NONE_FIELD('Brak gatunków ekspansywnych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków ekspansywnych – wtedy wskaźnik to FV.'),
      optionalSelect('Ocena', EXPANSIVE, 'Ocena wg tab. 2. Metodyka nie podaje progów pokrycia, więc przy wpisanych gatunkach wybierz ją ekspercko.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => gradeMap(EXPANSIVE)[String(i.choice)] ?? (i.none === 'yes' && !rowNames(i.species).length ? 'FV' : null),
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && names.length) parts.push('Zaznaczono „Nie stwierdzono”, a lista nie jest pusta.')
      const aliens = names.filter(isAlien5130)
      if (aliens.length) parts.push(`Gatunki obce wpisz we wskaźniku „Obce gatunki inwazyjne”: ${aliens.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      if (!list && i.none === 'yes') return 'Brak'
      return list || (i.choice ? labelOf(EXPANSIVE, i.choice) : '')
    },
  },
  {
    id: 'health',
    label: 'Stan zdrowotny jałowców',
    parameter: 'structure',
    excluded: (ctx) => !withHealth(ctx),
    excludedNote: 'nie ma go w tab. 2 ani w monitoringu od 2016 r. – nie liczy się do oceny struktury',
    description:
      'Stopień uszkodzeń krzewów jałowca: częstość obsychania krzewów, zrzucania igieł, obecność chorób, pasożytów i grzybów, krzewy wycięte. Wskaźnik z karty przykładowej i monitoringu 2009–2010.',
    help: `Co wybrać: oceń stopień uszkodzeń jałowców – zasychanie i zrzucanie igieł (zwykle od ocienienia lub zbyt dużego zwarcia), przemrożenia, choroby, ślady wycinania.

Skąd ten wskaźnik: jest w karcie przykładowej z przewodnika („Mały procent krzewów uschniętych” → U1) i w monitoringu 2009–2010, ale nie ma go w tab. 1 i 2 przewodnika, a od 2016 r. nie jest oceniany (sprawozdanie 2016–2018, pkt 9). Dlatego domyślnie (zestaw „Tab. 2” w Stanowisku) zostaje w karcie, ale nie liczy się do oceny struktury – wpisz wtedy np. „nie oceniano” i XX albo ocenę informacyjnie. Liczy się przy zestawie „Karta przykładowa i monitoring 2009–2010”.

Progi (formularz, z opisu w sprawozdaniu 2009–2011 – metodyka ich nie podaje): brak oznak chorób, pasożytów i grzybów, najwyżej pojedyncze uschnięte krzewy – FV; zasychanie części krzewów, niewielki procent uschniętych – U1; zasychanie lub zamieranie znacznej części krzewów – U2.`,
    thresholds: thresholdsOf(HEALTH),
    inputs: [
      optionalSelect('Stan zdrowotny', HEALTH, 'Przy zestawie „Tab. 2” możesz zostawić puste.'),
      noteInput('Opis (opcjonalnie)', 'np. Mały procent krzewów uschniętych', 'Krótki opis uszkodzeń, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(HEALTH)),
    describe: (i) => note(i) || labelOf(HEALTH, i.choice),
  },
  {
    id: 'regeneration',
    label: 'Odnowienie jałowców (obecność nalotu – do ok. 30 cm wys.)',
    parameter: 'structure',
    description:
      'Obecność młodocianych osobników jałowca: obecne – powszechne, obecne – słabe lub brak. Wskaźnik wyraża możliwości rozwojowe siedliska, świadczy o perspektywach jego odnowienia. Nie poszukuje się siewek – w zwartej murawie trudno je znaleźć.',
    help: `Co wybrać: czy na transekcie są młode jałowce (nalot do ok. 30 cm wysokości; sprawozdanie 2009–2011 liczyło osobniki wyższe niż 10 cm). Siewek nie szukaj – ocena byłaby obarczona dużym błędem.

Progi (tab. 2): obecne, powszechne – FV; obecne, ale rzadkie – U1; brak lub sporadyczne – U2.

Uwaga: karta z przewodnika ma „Słabe, ale obecne” z oceną FV – wg tab. 2 „obecne, ale rzadkie” to U1. Jeśli oceniasz inaczej niż próg, formularz pokaże rozjazd – uzasadnij go w opisie. Sprawozdanie 2021: słabe odnowienie wynika zwykle z ocienienia (młode jałowce tylko na obrzeżach kęp) albo z koszenia murawy między jałowcami. Sprawozdanie 2016–2018 zaproponowało nazwę „Odnowienie krzewów jałowca” – chodzi o jałowiec, nie o inne krzewy.`,
    thresholds: thresholdsOf(REGEN),
    inputs: [
      selectInput('Odnowienie jałowca', REGEN),
      noteInput('Opis (opcjonalnie)', 'np. Słabe, ale obecne', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(REGEN)),
    describe: (i) => note(i) || labelOf(REGEN, i.choice),
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    description:
      'Gatunki roślin obcych, inwazyjnych w granicach transektu z nazwą i pokryciem (w zaokrągleniu do 5%, pojedyncze osobniki – jako sporadyczne). Wskaźnik zagrożenia gatunków typowych muraw konkurencją ze strony tych gatunków. Zamieszcza się też informację o takich gatunkach w sąsiedztwie stanowiska.',
    help: `Co wpisać: gatunki obce na transekcie z pokryciem i wybierz liczebność (albo zostaw – formularz oceni ją z pokrycia). W 5130 (sprawozdanie 2021, tab. 4): czeremcha amerykańska Prunus serotina, robinia akacjowa Robinia pseudoacacia, dąb czerwony Quercus rubra, sosna czarna Pinus nigra, topola balsamiczna, orzech włoski, przymiotno kanadyjskie Conyza canadensis i białe Erigeron annuus, nawłoć późna Solidago gigantea. Gatunki obce w sąsiedztwie (np. „w sąsiedztwie rozrasta się robinia”) opisz w notatce albo w perspektywach.

Progi (tab. 2): brak – FV; pojedyncze lub w niewielkich kępach, jeden gatunek – U1; więcej niż jeden gatunek, występujący masowo lub w dużych płatach – U2.

Jak liczy formularz: 0 gatunków → FV; 1 gatunek pojedynczo lub w kępach → U1; więcej niż jeden gatunek albo masowo (gatunek z pokryciem od ${MASSIVE_ALIEN}%) → U2. Liczebność wybrana w polu ma pierwszeństwo przed pokryciem. Synonimy (Conyza/Erigeron canadensis, Padus/Prunus serotina) liczone raz. Propozycja ze sprawozdania 2016–2018 (U1 do 2% pokrycia, U2 powyżej) nie weszła do metodyki.

Wskaźnik niekardynalny (lista pod tab. 2), ale U2 obniża strukturę z FV do U1.`,
    thresholds: { FV: 'Brak', U1: 'Pojedyncze lub w niewielkich kępach, jeden gatunek', U2: 'Więcej niż jeden gatunek, występujący masowo lub w dużych płatach' },
    inputs: [
      speciesInput('Gatunki obce na transekcie', 'Gatunki obce inwazyjne z pokryciem w % transektu (dla „<1%” wpisz 0,5).'),
      { kind: 'select', name: 'abundance', label: 'Liczebność (opcjonalnie)', options: ALIEN_ABUNDANCE, help: `Jak występują gatunki obce: pojedyncze osobniki, niewielkie kępy czy masowo / w dużych płatach. Puste – formularz oceni z pokrycia (<1% pojedynczo, od 1% kępy, od ${MASSIVE_ALIEN}% masowo).` },
      { kind: 'number', name: 'count', label: 'Liczba gatunków (opcjonalnie)', min: 0, help: 'Liczba gatunków obcych wpisana wprost – ma pierwszeństwo przed liczeniem z listy.' },
      NONE_FIELD('Brak gatunków obcych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków obcych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = aliensCount(i)
      return c === undefined ? null : gradeAliens5130(c, aliensAbundance(i))
    },
    explain: (i) => {
      const c = aliensCount(i)
      if (c === undefined || c === 0) return null
      const a = aliensAbundance(i)
      return `Gatunków: ${c}${a ? `; liczebność: ${labelOf(ALIEN_ABUNDANCE, a).toLowerCase()}` : ''}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && names.length) parts.push('Zaznaczono „Nie stwierdzono”, a lista nie jest pusta.')
      const native = names.filter((n) => findSpecies5130(n) && !isAlien5130(n))
      if (native.length) parts.push(`Na liście są gatunki rodzime: ${native.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      if (!list && i.none === 'yes') return 'Brak'
      const c = num(i.count)
      return list || (c !== undefined ? `${plNum(c)} gat.` : '')
    },
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu, z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie.

Dlaczego: płaty jałowca zmieniają się z każdym odkrzaczaniem i zarastaniem – bez współrzędnych za 6 lat nikt nie trafi w ten sam transekt.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Poradów',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – zwykle miejscowość albo wzgórze, np. „Poradów”, „Wały”, „Smolegowa Skała”, „Kopieniec”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego płatu.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. badawcze',
    help: `Typ stanowiska w sieci monitoringu, np. „badawcze” albo „referencyjne” (dobrze wykształcone siedlisko, punkt odniesienia dla innych). Jeśli nie wiesz, zostaw puste.

Dlaczego: przy ocenie na poziomie regionu stanowiska referencyjne pokazują, jak wygląda 5130 w dobrym stanie.`,
  },
  {
    kind: 'select',
    name: 'indicatorSet',
    label: 'Zestaw wskaźników struktury',
    options: INDICATOR_SETS,
    defaultValue: 'tab2',
    required: true,
    hint: 'Tab. 2 (od 2016 r.) – 10 wskaźników; karta przykładowa i 2009–2010 – także stan zdrowotny jałowców.',
    help: `Tab. 1 i 2 przewodnika oraz monitoring 2016 i 2021 oceniały strukturę 10 wskaźnikami. Karta przykładowa (Poradów) i monitoring 2009–2010 miały jedenasty: „Stan zdrowotny jałowców” (od 2016 r. nie oceniany – sprawozdanie 2016–2018, pkt 9).

Przy zestawie „Tab. 2” stan zdrowotny zostaje w karcie (wpisujesz go albo dajesz XX), ale nie liczy się do oceny struktury. Kardynalne są w obu zestawach te same.`,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Inuletum ensifoliae',
    help: `Zbiorowisko, w którym rosną zarośla jałowca, nazwą fitosocjologiczną. Murawy kserotermiczne (kl. Festuco-Brometea): Inuletum ensifoliae, Thalictro-Salvietum pratensis, Adonido-Brachypodietum pinnati, Origano-Brachypodietum, Gentiano-Koelerietum pyramidatae, Onobrychido-Brometum erecti; murawy wysokogórskie (kl. Elyno-Seslerietea): Carici sempervirentis-Festucetum tatrae, Festuco versicoloris-Seslerietum tatrae, Caricetum firmae, Festuco versicoloris-Agrostietum alpinae, Dendranthemo-Seslerietum variae; potencjalnie wrzosowiska (kl. Nardo-Callunetea): Calluno-Genistetum, Pohlio-Callunetum, Arctostaphylo-Callunetum.

Uwaga: zarośla jałowca na murawach napiaskowych (Koelerion glaucae, Spergulo-Corynephoretum – siedlisko 6120) nie są zaliczane do 5130 (Interpretation Manual).`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Położenie (stok, wzgórze), murawa, kępy jałowca, inne krzewy i drzewa, użytkowanie, sąsiedztwo.',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• położenie: stok pagórka, zbocze doliny, ekspozycja, nachylenie, wysokość zbocza;
• murawa: zbiorowisko, gatunki dominujące, zwarcie runi, wojłok;
• zarośla: rozmieszczenie kęp jałowca, inne krzewy (tarnina, dereń, róże), zarastanie drzewami;
• użytkowanie: wypas, koszenie, odkrzaczanie, brak użytkowania;
• sąsiedztwo: pola, zabudowa, las, drogi.
Za stanowisko uznaje się fragment płatu murawy pokrytej przez zarośla jałowca, oddzielony od innych roślinnością o odmiennym charakterze (las, pola, pastwiska) albo odległością co najmniej 500 m w obrębie dużego płatu murawy. Przy jałowcach w rozproszeniu za 5130 uznaje się murawę, na której krzewy osiągają co najmniej ok. 20% zwarcia.`,
  },
  {
    kind: 'text',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    required: true,
    placeholder: 'np. 0,5',
    help: 'Łączna powierzchnia płatów 5130 na stanowisku, w hektarach – liczba albo przedział jak w karcie. Sprawozdanie 2021: od 0,02 ha (Haćki) do 37 ha (Czartoria), najczęściej kilka hektarów. Oszacuj w terenie albo z ortofotomapy.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „Poradów PLH120072”. Brak – „brak”.',
  }),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. własność prywatna',
    help: `Kto zarządza terenem: właściciele prywatni, gmina, Lasy Państwowe, park narodowy, RDOŚ (rezerwat).

Dlaczego: od właściciela zależy wypas, odkrzaczanie albo podorywanie muraw – najsilniejsze czynniki dla 5130.`,
  },
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    defaultValue: '200x10 m',
    required: true,
    hint: 'Jeden transekt 200×10 m przez najważniejsze skupienia zarośli jałowca.',
    help: `Na każdym stanowisku wyznacza się jeden transekt o długości 200 m i szerokości 10 m (20 arów), tak by obejmował najważniejsze skupienia zarośli jałowca. Na nim mierzy się wskaźniki i wykonuje 3 zdjęcia fitosocjologiczne – na początku, w środku i na końcu transektu.

Dlaczego: stała powierzchnia pozwala porównywać udział zarośli, zwarcie i udział drzew między cyklami. Karta z przewodnika ma „powierzchnię prostokątną 20×100 m” – to te same 2000 m².`,
    warn: (v) => {
      const m = String(v ?? '').replace(',', '.').match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/)
      if (!m) return null
      const a = Number(m[1]) * Number(m[2])
      return Math.abs(a - 2000) < 1 ? null : `${plNum(a)} m² – metodyka wymaga transektu 200×10 m (2000 m²). Opisz odstępstwo w uwagach.`
    },
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    help: 'Wysokość nad poziomem morza transektu (albo zakres od początku do końca), z GPS albo mapy. Na niżu i wyżynach zwykle 150–500 m n.p.m., w Pieninach 500–900 m, w Tatrach (Kopieniec) ponad 1300 m.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 08.06.2010',
    required: true,
    hint: 'Optymalnie czerwiec–lipiec.',
    help: `Dzień badań terenowych. Najlepiej czerwiec–lipiec: roślinność zielna łatwo identyfikowalna, znaczna część gatunków w optimum kwitnienia. Później też można, ale trzeba liczyć się z błędną oceną pokrycia gatunków wcześnie kwitnących i brakiem możliwości oznaczenia niektórych z nich.

Badania powtarza się raz na sześć lat (tempo wzrostu jałowca). W 2021 r. prace trwały od 4.06 do 9.08 – na stanowisku powyżej 1000 m n.p.m. początek sierpnia nie zaszkodził.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 6 && m <= 7 ? null : 'Termin poza optymalnym oknem (czerwiec–lipiec). Gatunki wcześnie kwitnące mogą być niedoszacowane – opisz to w uwagach.'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
  {
    kind: 'text',
    name: 'additionalExperts',
    label: 'Dodatkowi eksperci',
    placeholder: 'np. —',
    help: 'Osoby, które brały udział w badaniu poza wykonawcą (ekspertem lokalnym). Brak – zostaw puste albo wpisz „—”.',
  },
]

// ---------- zdjęcia fitosocjologiczne: 3 × 25 m² ----------

const r7120 = methodology7120.releves.fields
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', {
    help: 'Współrzędne GPS środka zdjęcia. Zdjęcia robi się na początku, w środku i na końcu transektu.',
  }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach.' }),
  pickField(r7120, 'area', {
    defaultValue: 25,
    help: 'Powierzchnia zdjęcia w m². W karcie z przewodnika: 25 m².',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Na zboczach z 5130 zwykle 10–20°, w karcie z przewodnika 40–50°.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, SW). Zarośla jałowca najczęściej na stokach S, SE i SW.' }),
  layerField('coverA', 'Warstwa A – drzewa: procent powierzchni zdjęcia pod koronami drzew. W 5130 zwykle brak albo kilka procent (karta z przewodnika: 1% w zdjęciu II).\n\nDlaczego: drzewa nad jałowcami to sukcesja w stronę lasu – główne zagrożenie siedliska.', { groupCols: 3 }),
  layerField('coverB', 'Warstwa B – krzewy: procent powierzchni zdjęcia pod koronami jałowców i innych krzewów. W karcie z przewodnika 20–30%.\n\nDlaczego: zwarcie B to stan samych zarośli – za niskie to stadium inicjalne, za wysokie ocienia murawę.'),
  layerField('coverC', 'Warstwa C – zielna: procent powierzchni zdjęcia pokryty przez murawę (w karcie z przewodnika 80–90%).\n\nDlaczego: murawa między jałowcami decyduje o diagnozie siedliska – bez niej to zwykłe zarośla.'),
  layerField('heightA', 'Warstwa A – typowa wysokość drzew, w metrach.', { groupCols: 3 }),
  layerField('heightB', 'Warstwa B – typowa (średnia) wysokość krzewów, w metrach (w karcie z przewodnika śr. 0,7–0,8 m; najwyższe do 2,5 m – dopisz w notatce).'),
  layerField('heightC', 'Warstwa C – typowa wysokość runa, w centymetrach (zwykle 20–35 cm).'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Inuletum ensifoliae',
    help: 'Jednostka fitosocjologiczna zdjęcia – zespół murawy, w której rosną jałowce, np. Inuletum ensifoliae, Origano-Brachypodietum, Carici sempervirentis-Festucetum tatrae.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w poletku z ilościowością w skali Braun-Blanqueta (r, +, 1–5): warstwa A – drzewa, B – jałowiec i inne krzewy, C – murawa i siewki drzew i krzewów, D – mchy. Warstwa podpowiada się sama po wyborze gatunku.',
  }),
]

export const methodology5130: Methodology = {
  code: '5130',
  name: 'Zarośla jałowca pospolitego w murawach nawapiennych lub na wrzosowiskach',
  source:
    'Perzanowska J. 2012, 5130 Zarośla jałowca pospolitego w murawach nawapiennych lub na wrzosowiskach, [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 268–281 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2009–2011, 2016–2018 i 2021.',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj 3 zdjęcia fitosocjologiczne po 25 m²: na początku, w środku i na końcu transektu. Ilościowość w skali Braun-Blanqueta; warstwy A (drzewa), B (krzewy) i C (murawa).',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Możliwości ochrony siedliska i utrzymania go w stanie niepogorszonym, przy analizie możliwych do wyobrażenia czynników realnie oddziałujących na siedlisko w najbliższej przyszłości. Pod uwagę brany jest aktualny stan ochrony (obecność na obszarze chronionym i reżim ochronny), podejmowane zabiegi ochrony czynnej lub użytkowanie gospodarcze.',
    help: `Weź pod uwagę: sukcesję (tarnina, dereń, drzewa – zwłaszcza sosna), brak lub zarzucenie wypasu, koszenie murawy między jałowcami (utrudnia odnowienie), odkrzaczanie i wycinkę drzew (pozytywne, jeśli oszczędzają jałowce), podorywanie, zalesianie, zabudowę, ruch turystyczny i pojazdy, gatunki obce w sąsiedztwie (robinia, czeremcha amerykańska).

Przewodnik (pkt 5): ochrona ścisła nie jest właściwa – zarośla to krótkotrwałe stadium sukcesyjne, które utrzymuje tylko użytkowanie, najlepiej wypas. Sprawozdanie 2021: prowadzone działania ochronne (odkrzaczanie z karczowaniem, kwaterowy wypas owiec i kóz) zdecydowanie poprawiają stan; pogorszenie perspektyw dawały zabudowa, antropopresja i zaawansowana sukcesja bez ochrony czynnej.`,
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
    { code: 'B01.02', name: 'Sztuczne nasadzenia na terenach otwartych (drzewa nierodzime)' },
    { code: 'C01', name: 'Kopalnie, kamieniołomy, wydobywanie' },
    { code: 'D01', name: 'Drogi, ścieżki i drogi kolejowe' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D01.02', name: 'Drogi, autostrady' },
    { code: 'E01', name: 'Tereny zurbanizowane, tereny zamieszkane' },
    { code: 'E01.03', name: 'Zabudowa rozproszona' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'F04', name: 'Pozyskiwanie / usuwanie roślin lądowych, ogólnie' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
    { code: 'G01.04.01', name: 'Turystyka górska i wspinaczka' },
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
            hint: 'Np. siedlisko 6210; rzadkie gatunki muraw.',
            help: 'Wartości przyrodnicze stanowiska poza samymi zaroślami: sąsiednie siedliska (6210 murawy kserotermiczne, 6170 murawy wysokogórskie, 4030 wrzosowiska), rzadkie i chronione gatunki (np. obuwik, przytulia krakowska, gatunki z Polskiej Czerwonej Księgi). Brak informacji – „Nie stwierdzono” albo „Nie pozyskano danych”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            label: 'Wykonywane działania ochronne',
            help: 'Jakie działania ochronne wykonano i z jakim skutkiem: odkrzaczanie (usuwanie tarniny, derenia), wycinka drzew (sosna), karczowanie, wypas owiec i kóz, koszenie. Uwaga: koszenie murawy między jałowcami utrudnia ich odnowienie. Brak działań – „Brak”.',
          },
          {
            kind: 'textarea',
            name: 'proposals',
            label: 'Propozycje wprowadzenia działań ochronnych',
            rows: 4,
            hint: 'Np. wypas lub wykaszanie muraw, eliminacja tarniny i drzew.',
            help: `Jakie działania proponujesz, konkretnie: odkrzaczanie (tarnina, dereń) z oszczędzeniem jałowców, wycinka drzew ocieniających zarośla (najlepiej z karczowaniem), kwaterowy wypas owiec lub kóz, usuwanie gatunków obcych (sosna czarna, robinia, czeremcha amerykańska), sprzątanie odpadów, zakaz wjazdu pojazdów. Brak – „Brak”.`,
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
            help: 'Karta z przewodnika podaje przy ocenie ogólnej powierzchnię siedliska o różnym stanie zachowania na stanowisku (Poradów: FV 30%, U1 65%, U2 5%). Trzy liczby powinny dać razem 100%.',
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
            help: `${f.help ?? ''}\n\nDla 5130 zapisz tu także: rok i typ monitoringu, czy monitoring jest wymagany i dlaczego, odstępstwa od metodyki (termin, wymiary transektu) oraz wątpliwości co do zaklasyfikowania płatu (murawa napiaskowa 6120, zarośla tarniny bez jałowca).`.trim(),
          },
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_5130.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer5130(s) })),
  speciesInfo: (name) => {
    const e = findSpecies5130(name)
    return e ? GROUP_LABELS_5130[e.group] : undefined
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator5130 = (id: string): IndicatorDef => {
  const i = methodology5130.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 5130`)
  return i
}
