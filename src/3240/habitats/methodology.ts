// Metodyka 3240 (zarośla wierzby siwej na kamieńcach i żwirowiskach górskich potoków) jako dane. Źródło: Perzanowska J.
// 2012, „3240 Zarośla wierzby siwej na kamieńcach i żwirowiskach górskich potoków (Salici-Myricarietum część – z przewagą
// wierzby)” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 193–203
// (tab. 1 i 2), z praktyką oceny ze sprawozdań z monitoringu 2009–2011, 2016–2018 i 2021.
// Siedlisko nieleśne (zaroślowe), niepriorytetowe, głównie region alpejski (Karpaty). Stanowisko to odcinek koryta
// 0,5–1 km, na nim transekt 200×10 m i 3 zdjęcia fitosocjologiczne (początek, środek, koniec transektu).
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_3240,
  SPECIES_3240,
  defaultLayer3240,
  findSpecies3240,
  isAlien3240,
  isMyricaria,
  isSalixEleagnos,
  isWillow,
  speciesKey3240,
} from './species'

// ---------- liczby i zakresy ----------

/**
 * Liczba albo zakres wpisany jak w karcie papierowej: „1,8”, „1,5–2”, „40-90”, „śr. 40–90%”.
 * Zakres daje środek przedziału (do podpowiedzi oceny). Bzdura -> undefined.
 */
export function parseRange3240(value: unknown): { lo: number; hi: number; mid: number } | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? { lo: value, hi: value, mid: value } : undefined
  const t = String(value ?? '')
    .toLowerCase()
    .replace(/śr\.?|ok\.?|około|%|m\b/g, '')
    .replace(/,/g, '.')
    .replace(/\s+/g, '')
  const m = /^(\d+(?:\.\d+)?)(?:[-–—](\d+(?:\.\d+)?))?$/.exec(t)
  if (!m) return undefined
  const lo = Number(m[1])
  const hi = m[2] !== undefined ? Number(m[2]) : lo
  return { lo: Math.min(lo, hi), hi: Math.max(lo, hi), mid: Math.round(((lo + hi) / 2) * 100) / 100 }
}

// ---------- progi liczbowe (tab. 2) ----------

/**
 * Powierzchnia zajęta przez siedlisko na transekcie (tab. 2, wiersz „powierzchnia kamieńców na transekcie”):
 * „>25% pow. transektu” FV, „10–25%” U1, „<10%” U2. Obie granice przedziału U1 należą do U1.
 */
export const gradeShare3240 = (p: number): Grade => (p > 25 ? 'FV' : p >= 10 ? 'U1' : 'U2')

/** Wysokość krzewów (średnia, m): 1,5–3 FV, 0,5–1,5 U1 (1,5 już FV), poniżej 0,5 albo powyżej 3 U2. */
export const gradeHeight3240 = (h: number): Grade => (h >= 1.5 && h <= 3 ? 'FV' : h >= 0.5 && h < 1.5 ? 'U1' : 'U2')

/** Zwarcie krzewów na transekcie: „>30%” FV, „10–30%” U1 (30% → U1, jak w sprawozdaniu 2021), „<10%” U2. */
export const gradeCover3240 = (p: number): Grade => (p > 30 ? 'FV' : p >= 10 ? 'U1' : 'U2')

/** Wierzba siwa poniżej tego pokrycia transektu to „niski udział” (U1). Próg formularza – metodyka liczby nie podaje. */
export const LOW_ELEAGNOS = 10
/** Września poniżej 1% pokrycia (zapis „<1%”, „+”) to „występowanie sporadyczne” (U1). */
export const SPORADIC_MYRICARIA = 1
/** Pokrycie gatunku obcego od tego progu to „masowe (łanowe) występowanie” (U2). Próg formularza. */
export const MASSIVE_ALIEN = 25

/**
 * Gatunki krzewów z listy (pokrycie transektu):
 * - brak wierzby siwej → U2 (tab. 2: brak wierzby siwej tam, gdzie wcześniej rosła);
 * - wierzba siwa z pokryciem < 10% albo września nieobecna/sporadyczna (< 1%, także w sąsiedztwie) → U1;
 * - inaczej FV.
 * Września w sąsiedztwie transektu („liczna”) wystarcza do FV, „sporadyczna” – nie.
 */
export function gradeShrubSpecies3240(o: { eleagnos?: number | 'present'; myricaria?: number | 'present'; myricariaNearby?: 'abundant' | 'sporadic' | 'absent' | '' }): Grade {
  if (o.eleagnos === undefined) return 'U2'
  const lowEleagnos = typeof o.eleagnos === 'number' && o.eleagnos < LOW_ELEAGNOS
  const myrOnTransect = o.myricaria !== undefined && (o.myricaria === 'present' || o.myricaria >= SPORADIC_MYRICARIA)
  const myricariaOk = myrOnTransect || o.myricariaNearby === 'abundant'
  return !lowEleagnos && myricariaOk ? 'FV' : 'U1'
}

/**
 * Obce gatunki inwazyjne: brak albo pojedyncze osobniki jednego gatunku FV; kępy rozproszone albo więcej niż jeden
 * gatunek U1; masowe (łanowe) występowanie albo więcej niż dwa gatunki U2.
 */
export function gradeAliens3240(count: number, abundance: 'single' | 'clumps' | 'massive' | ''): Grade {
  if (count <= 0) return 'FV'
  if (count > 2 || abundance === 'massive') return 'U2'
  if (count === 2) return 'U1'
  return abundance === 'clumps' ? 'U1' : 'FV'
}

/**
 * Kompleks siedlisk nadrzecznych 3220, 3230, 3240, 91E0 (licząc samo 3240):
 * min. trzy typy dobrze wykształcone FV; przynajmniej dwa typy U1 (tab. 2: „przynajmniej jeden dobrze wykształcony”;
 * sprawozdanie 2021: 2–3 typy o niskiej reprezentatywności też U1); brak lub jedno z siedlisk U2.
 */
export function gradeComplex3240(present: number, good: number): Grade {
  if (good >= 3) return 'FV'
  return present >= 2 ? 'U1' : 'U2'
}

const pct = (v: number) => `${plNum(v)}%`
const rangeText = (s: string) => s.trim().replace(/\s*[-–—]\s*/, '–')
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey3240(n), n])).values()]

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'other', label: 'Inne kombinacje (np. niewielki spadek, powierzchnia na granicy)', grade: 'U1' },
  { value: 'decrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi z literatury', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const SHRUBS: GradedOption[] = [
  { value: 'fv', label: 'Wierzby siwa, purpurowa, krucha, trójpręcikowa i września pobrzeżna', grade: 'FV' },
  { value: 'u1', label: 'Niski udział wierzby siwej; brak wrześni lub tylko sporadyczna (także w sąsiedztwie); pojedyncze gatunki innych wierzb', grade: 'U1' },
  { value: 'u2', label: 'Brak wierzby siwej tam, gdzie wcześniej występowała, przy wyraźnej dominacji jednego z pozostałych gatunków wierzb', grade: 'U2' },
]
const MYRICARIA_NEARBY: SelectOption[] = [
  { value: '', label: '—' },
  { value: 'abundant', label: 'Liczna (nie sporadyczna)' },
  { value: 'sporadic', label: 'Sporadyczna' },
  { value: 'absent', label: 'Brak' },
]
const STRUCTURE: GradedOption[] = [
  { value: 'compact', label: 'Masowe występowanie – zwarty płat lub rozległe płaty zarośli', grade: 'FV' },
  { value: 'patches', label: 'Kilka płatów lub niewielkie kępy', grade: 'U1' },
  { value: 'scattered', label: 'Pojedyncze kępy lub rozproszone osobniki na całym transekcie', grade: 'U1' },
  { value: 'none', label: 'Brak lub pojedyncze osobniki', grade: 'U2' },
]
const TREES: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'single', label: 'Pojedyncze osobniki', grade: 'FV' },
  { value: 'some', label: 'Pojedyncze rozrośnięte drzewa lub drzewa w niewielkich kępach', grade: 'U1' },
  { value: 'many', label: 'Liczne drzewa o znacznej wysokości (>5 m)', grade: 'U2' },
]
const HEALTH: GradedOption[] = [
  { value: 'good', label: 'Brak oznak pogorszenia zdrowia krzewów lub tylko pojedyncze uszkodzone krzewy', grade: 'FV' },
  { value: 'some', label: 'Pojedyncze oznaki niewłaściwego stanu zdrowia lub uszkodzenia z przyczyn naturalnych', grade: 'U1' },
  { value: 'bad', label: 'Częste oznaki złego stanu zdrowia, znaczna część uszkodzonych lub zaatakowanych krzewów', grade: 'U2' },
]
const REGEN: GradedOption[] = [
  { value: 'common', label: 'Obecne, występujące powszechnie', grade: 'FV' },
  { value: 'few', label: 'Obecne, ale nieliczne', grade: 'U1' },
  { value: 'none', label: 'Brak', grade: 'U2' },
]
const EXPANSIVE: GradedOption[] = [
  { value: 'fv', label: 'Brak lub pojedyncze osobniki jednego gatunku', grade: 'FV' },
  { value: 'u1', label: 'Kępy rozproszone, pojedyncze osobniki na całej przestrzeni', grade: 'U1' },
  { value: 'u2', label: 'Masowe występowanie lub kilka gatunków o takich cechach', grade: 'U2' },
]
const ALIEN_ABUNDANCE: SelectOption[] = [
  { value: '', label: '—' },
  { value: 'single', label: 'Pojedyncze osobniki' },
  { value: 'clumps', label: 'Kępy rozproszone' },
  { value: 'massive', label: 'Masowe (łanowe) występowanie' },
]
const COMPLEX_STATE: SelectOption[] = [
  { value: '', label: '—' },
  { value: 'good', label: 'Obecne, dobrze wykształcone' },
  { value: 'poor', label: 'Obecne, słabo wykształcone' },
  { value: 'absent', label: 'Brak' },
]
const COMPLEX_HABITATS = [
  { name: 'h3220', code: '3220', label: '3220 Pionierska roślinność na kamieńcach górskich potoków' },
  { name: 'h3230', code: '3230', label: '3230 Zarośla wrześni na kamieńcach i żwirowiskach górskich potoków' },
  { name: 'h3240', code: '3240', label: '3240 Zarośla wierzby siwej (samo badane siedlisko)' },
  { name: 'h91E0', code: '91E0', label: '91E0 Łęgi wierzbowe, topolowe, olszowe i jesionowe' },
] as const

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

/** Przewodnik 2012 (11 wskaźników) albo zestaw po harmonizacji 2016 (10 – bez udziału powierzchni na transekcie). */
export const INDICATOR_SETS: SelectOption[] = [
  { value: 'guide', label: 'Przewodnik 2012 – 11 wskaźników (z powierzchnią zajętą na transekcie)' },
  { value: 'harmonized', label: 'Po harmonizacji 2016 – 10 wskaźników (jak w monitoringu 2021)' },
]
const harmonized = (ctx: IndicatorContext) => ctx.site?.indicatorSet === 'harmonized'

// ---------- gatunki krzewów: liczenie z listy ----------

/** Pokrycie z listy: liczba, „present” (wpisany bez pokrycia) albo undefined (brak na liście). */
function coverOn(list: unknown, pred: (name: string) => boolean): number | 'present' | undefined {
  const rows = speciesRows(list).filter((r) => r.name?.trim() && pred(r.name))
  if (!rows.length) return undefined
  const covers = rows.map((r) => num(r.cover)).filter((c): c is number => c !== undefined)
  return covers.length ? covers.reduce((a, b) => a + b, 0) : 'present'
}

function shrubsFromList(i: InputValues): Grade | null {
  if (!rowNames(i.species).length) return null
  return gradeShrubSpecies3240({
    eleagnos: coverOn(i.species, isSalixEleagnos),
    myricaria: coverOn(i.species, isMyricaria),
    myricariaNearby: (String(i.myricariaNearby ?? '') as 'abundant' | 'sporadic' | 'absent' | ''),
  })
}

// ---------- obce: liczenie ----------

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

// ---------- kompleks siedlisk ----------

function complexCounts(i: InputValues): { present: number; good: number; codes: string[] } | null {
  const states = COMPLEX_HABITATS.map((h) => String(i[h.name] ?? ''))
  if (states.some((s) => s === '')) return null
  const codes = COMPLEX_HABITATS.filter((h) => i[h.name] === 'good' || i[h.name] === 'poor').map((h) => h.code)
  return { present: codes.length, good: states.filter((s) => s === 'good').length, codes }
}

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description:
      'Zmiana powierzchni kamieńców z zaroślami wierzbowymi na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury (tab. 2: „powierzchnia kamieńców na transekcie”).',
    help: `Co wybrać: jak zmieniła się powierzchnia zarośli wierzbowych na kamieńcach (na transekcie i na całym odcinku rzeki) od poprzedniego badania albo względem danych z literatury i ortofotomap. Powierzchnię płatów wpisz obok – trafi do „wartości” (w karcie z przewodnika: „<0,5 ha”).

Progi (tab. 2): nie podlega zmianom lub zwiększa się, na ogół ok. >5 arów (>25% transektu) – FV; inne kombinacje, zwykle 3–5 arów (10–25% transektu) – U1; wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub literaturą, ok. <3 arów (<10%) – U2. Przy pierwszym badaniu (nie ma z czym porównać) wybierz „Brak danych do porównania” (XX) albo oceń ekspercko.

Uwaga: powierzchnia 3240 naturalnie „pływa” – powódź potrafi zniszczyć zarośla, a na nowych łachach kiełkują młode wierzby. Sprawozdanie 2016–2018 zwraca uwagę, że definicja parametru jest nieostra; w 2021 r. powierzchnie wahały się od 0 do 2,5 ha, najczęściej <0,5 ha. Spadek po powodzi to nie to samo co spadek po regulacji koryta – opisz przyczynę.`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się, na ogół ok. >5 a (>25% pow. transektu)',
      U1: 'Inne kombinacje, powierzchnia zwykle w zakresie 3–5 a (10–25% pow. transektu)',
      U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze, ok. <3 a (<10%)',
    },
    inputs: [
      optionalSelect('Zmiana powierzchni', AREA, 'Puste, gdy oceniasz ekspercko (np. pierwsze badanie).'),
      {
        kind: 'text',
        name: 'areaText',
        label: 'Powierzchnia (opcjonalnie)',
        placeholder: 'np. <0,5 ha',
        help: 'Powierzchnia płatów siedliska na stanowisku, tak jak w karcie („<0,5 ha”, „1,7 ha”) – trafi do pola „wartość”. Sprawozdanie 2021: od 0 (brak siedliska) do 2,5 ha.',
      },
      noteInput('Opis (opcjonalnie)', 'np. po powodzi 2020 część zarośli wyrwana, na łachach nalot wierzb', 'Krótki opis zmian, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    explain: (_i, ctx) => {
      const s = num(ctx?.indicators?.share?.inputs?.value)
      return s !== undefined ? `Siedlisko zajmuje ${pct(s)} transektu – wg orientacyjnych progów tab. 2 to ${gradeShare3240(s)}.` : null
    },
    describe: (i) => {
      const a = String(i.areaText ?? '').trim()
      return [a, note(i) || (i.choice ? labelOf(AREA, i.choice).toLowerCase() : '')].filter(Boolean).join('; ')
    },
  },
  {
    id: 'share',
    label: 'Powierzchnia zajęta przez siedlisko na transekcie',
    parameter: 'structure',
    excluded: harmonized,
    excludedNote: 'po harmonizacji 2016 nie liczy się do oceny struktury',
    description:
      'Szacunkowa powierzchnia, którą zajmują zarośla wierzbowe na transekcie: długość transektu razy średnia szerokość pasa zarośli albo suma powierzchni płatów w pasie zarośli, jako procent transektu.',
    help: `Co wpisać: jaka część transektu (200×10 m = 20 arów) jest zajęta przez zarośla wierzbowe 3240. Policz długość pasa zarośli razy jego średnią szerokość albo zsumuj płaty. W procentach (1 ar = 5%).

Progi (tab. 2, wiersz „powierzchnia kamieńców na transekcie”): >25% (ok. >5 arów) – FV; 10–25% (3–5 arów) – U1; <10% (<3 ary) – U2. Obie granice 10% i 25% formularz liczy do U1.

Zestaw wskaźników: przewodnik i monitoring 2010 i 2016 liczyły ten wskaźnik do struktury („Procent powierzchni zajęty przez siedlisko na transekcie”). Harmonizacja nazw w sprawozdaniu 2016–2018 go pominęła i w 2021 r. strukturę oceniano 10 wskaźnikami. Przy zestawie „po harmonizacji” (Stanowisko) wskaźnik zostaje w karcie, ale nie liczy się do oceny.

Dlaczego: zarośla rozrastają się kosztem odkrytych kamieńców, a powódź je zabiera – udział na transekcie pokazuje, gdzie w tym cyklu jest stanowisko.`,
    thresholds: { FV: '>25% pow. transektu (ok. >5 a)', U1: '10–25% pow. transektu (3–5 a)', U2: '<10% pow. transektu (<3 a)' },
    inputs: [
      { kind: 'number', name: 'value', label: 'Udział zarośli na transekcie', unit: '%', min: 0, max: 100, help: 'Procent powierzchni transektu zajęty przez zarośla 3240. Brak siedliska = 0. W karcie z przewodnika: 50%.' },
      noteInput('Opis (opcjonalnie)', 'np. pas zarośli szer. ok. 5 m wzdłuż lewego brzegu', 'Krótki opis, który trafi do „wartości” w karcie zamiast samego procentu.'),
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v !== undefined ? gradeShare3240(v) : null
    },
    describe: (i) => {
      const v = num(i.value)
      return note(i) || (v !== undefined ? pct(v) : '')
    },
  },
  {
    id: 'shrubs',
    label: 'Gatunki krzewów',
    parameter: 'structure',
    cardinal: true,
    description:
      'Krzewy występujące w granicach transektu z nazwą gatunkową i pokryciem transektu (w zaokrągleniu do 5–10%, gatunki pojedyncze – jako sporadyczne). Wskaźnik ocenia prawidłowość składu gatunkowego zarośli.',
    help: `Co wpisać: wszystkie krzewy na transekcie z pokryciem w procentach transektu (dla „<1%” wpisz 0,5). Formularz patrzy na wierzbę siwą Salix eleagnos i wrześnię pobrzeżną Myricaria germanica. Jeśli września rośnie tylko obok transektu, zaznacz to w polu „Września w sąsiedztwie”.

Progi (tab. 2): wierzby siwa, purpurowa, krucha, trójpręcikowa i września pobrzeżna – FV; niski udział wierzby siwej, brak wrześni lub tylko sporadyczna (także w sąsiedztwie), pojedyncze gatunki innych wierzb – U1; brak wierzby siwej tam, gdzie wcześniej występowała, przy wyraźnej dominacji jednego z pozostałych gatunków wierzb – U2.

Jak liczy formularz (metodyka nie podaje liczb): brak wierzby siwej → U2; wierzba siwa poniżej ${LOW_ELEAGNOS}% transektu albo września nieobecna lub sporadyczna (poniżej ${SPORADIC_MYRICARIA}%, bez licznej wrześni w sąsiedztwie) → U1; inaczej FV. Jeśli wierzby siwej nie było tu wcześniej, U2 jest za surowe – wybierz ocenę ekspercko w polu „Ocena składu” (ma pierwszeństwo przed listą).

Wskaźnik kardynalny. Sprawozdanie 2021: na stanowiskach U1 i U2 brakowało wrześni oraz wierzby siwej lub miała mały udział – to dwa najczulsze elementy składu, pierwsze znikają po regulacji koryta.`,
    thresholds: thresholdsOf(SHRUBS),
    inputs: [
      speciesInput('Krzewy na transekcie', 'Krzewy w granicach transektu z pokryciem w % transektu, np. Salix eleagnos 65, Myricaria germanica 3.'),
      {
        kind: 'select',
        name: 'myricariaNearby',
        label: 'Września w sąsiedztwie transektu (opcjonalnie)',
        options: MYRICARIA_NEARBY,
        help: 'Czy września pobrzeżna rośnie w sąsiedztwie transektu (na tym samym odcinku rzeki). Liczna w sąsiedztwie wystarcza do FV, nawet gdy na samym transekcie jej nie ma; sporadyczna – nie (tab. 2: „brak wrześni lub tylko sporadyczne występowanie, także w sąsiedztwie” to U1).',
      },
      optionalSelect('Ocena składu (opcjonalnie)', SHRUBS, 'Ocena ekspercka – ma pierwszeństwo przed liczeniem z listy. Użyj, gdy lista nie oddaje sytuacji (np. wierzby siwej nie było tu nigdy).'),
      noteInput('Opis (opcjonalnie)', 'np. Wierzba krucha Salix fragilis 15%, wierzba siwa S. eleagnos 65%…', 'Krótki opis składu, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => gradeMap(SHRUBS)[String(i.choice)] ?? shrubsFromList(i),
    explain: (i) => {
      if (!rowNames(i.species).length) return null
      const el = coverOn(i.species, isSalixEleagnos)
      const my = coverOn(i.species, isMyricaria)
      const f = (c: number | 'present' | undefined) => (c === undefined ? 'brak' : c === 'present' ? 'jest (bez pokrycia)' : pct(c))
      return `Wierzba siwa: ${f(el)}; września: ${f(my)} – z listy ${shrubsFromList(i)}.`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      const notShrubs = distinct(names.filter((n) => findSpecies3240(n) && !findSpecies3240(n)!.woody))
      const parts: string[] = []
      if (notShrubs.length) parts.push(`To nie krzewy: ${notShrubs.join(', ')}.`)
      const chosen = gradeMap(SHRUBS)[String(i.choice)]
      const fromList = shrubsFromList(i)
      if (chosen && fromList && chosen !== fromList) parts.push(`Wybrano ${chosen}, a z listy wychodzi ${fromList} – sprawdź.`)
      if (names.length && !names.some(isWillow)) parts.push('Na liście nie ma żadnej wierzby.')
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => note(i) || describeSpecies(speciesRows(i.species)) || (i.choice ? labelOf(SHRUBS, i.choice) : ''),
  },
  {
    id: 'height',
    label: 'Wysokość krzewów (średnia)',
    parameter: 'structure',
    description:
      'Średnia wysokość dla całych kęp krzewów wierzbowych, w metrach. Pośrednio wskazuje wiek krzewów i strukturę zbiorowiska oraz perspektywy co do tempa jego przekształcenia w zbiorowisko leśne.',
    help: `Co wpisać: przeciętną wysokość kęp krzewów wierzbowych na transekcie, w metrach – jedną liczbę („1,8”) albo zakres jak w karcie („1,5–2”); z zakresu liczony jest środek. Wysokość najwyższych krzewów wpisz osobno – nie wpływa na ocenę.

Progi (tab. 2): 1,5–3 m – FV; 0,5–1,5 m – U1; <0,5 m lub >3 m – U2. Granica 1,5 m należy do FV.

Dlaczego: niskie krzewy to młode zarośla (świeży kamieniec po powodzi), wysokie – stare, przechodzące w łęg (91E0). W 2021 r. stanowiska z U1/U2 wskazano do usunięcia z sieci, bo zarośla przekształciły się w łęg albo zbiorowiska pionierskie.`,
    thresholds: { FV: '1,5–3 m', U1: '0,5–1,5 m', U2: '<0,5 m lub >3 m' },
    inputs: [
      { kind: 'text', name: 'height', label: 'Średnia wysokość krzewów', unit: 'm', placeholder: 'np. 1,5–2', required: true, help: 'Przeciętna wysokość kęp wierzb w metrach: liczba (1,8) albo zakres (1,5–2). Przecinek albo kropka.' },
      { kind: 'text', name: 'max', label: 'Najwyższe krzewy (opcjonalnie)', unit: 'm', placeholder: 'np. 3–5', help: 'Wysokość najwyższych krzewów, w metrach – trafia do „wartości” („max. 3–5 m”), na ocenę nie wpływa.' },
      noteInput('Opis (opcjonalnie)', 'np. wyższe krzewy przy brzegu, niskie odrosty na łasze', 'Krótki opis, który trafi do „wartości” w karcie zamiast wysokości.'),
    ],
    suggest: (i) => {
      const r = parseRange3240(i.height)
      return r ? gradeHeight3240(r.mid) : null
    },
    explain: (i) => {
      const r = parseRange3240(i.height)
      return r && r.lo !== r.hi ? `Środek zakresu: ${plNum(r.mid)} m.` : null
    },
    warn: (i) => {
      const h = String(i.height ?? '').trim()
      if (h && !parseRange3240(h)) return 'Nie rozumiem wysokości – wpisz liczbę albo zakres, np. 1,5–2.'
      const r = parseRange3240(h)
      return r && r.hi > 15 ? 'Ponad 15 m? To wysokość w centymetrach – wpisz w metrach.' : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const h = String(i.height ?? '').trim()
      const max = String(i.max ?? '').trim()
      return [h ? `${rangeText(h)} m` : '', max ? `max. ${rangeText(max)} m` : ''].filter(Boolean).join(', ')
    },
  },
  {
    id: 'cover',
    label: 'Zwarcie krzewów na transekcie',
    parameter: 'structure',
    description: 'Zwarcie krzewów w płatach zarośli, w procentach (z dokładnością do 5%). Wskazuje etap rozwoju i strukturę zbiorowiska.',
    help: `Co wpisać: zwarcie koron krzewów w płatach zarośli na transekcie, w procentach – liczba („60”) albo zakres jak w karcie („40–90”); z zakresu liczony jest środek.

Progi (tab. 2): >30% – FV; 10–30% – U1; <10% – U2. Granice 10% i 30% należą do U1 (sprawozdanie 2021: zwarcie 25–30% „zgodnie z metodyką wymagało oceny U1”).

Nazwa: przewodnik ma „zwarcie krzewów na transekcie” (tab. 1–2) i „zwarcie krzewów w płacie” (karta), harmonizacja 2016 – „zwarcie krzewów w płatach na transekcie”. To ten sam wskaźnik.`,
    thresholds: { FV: '>30%', U1: '10–30%', U2: '<10%' },
    inputs: [
      { kind: 'text', name: 'value', label: 'Zwarcie krzewów', unit: '%', placeholder: 'np. 40–90', required: true, help: 'Zwarcie krzewów w płatach, w procentach: liczba (60) albo zakres (40–90).' },
      noteInput('Opis (opcjonalnie)', 'np. zwarte płaty przy brzegu, luźne na łasze', 'Krótki opis, który trafi do „wartości” w karcie zamiast samego zwarcia.'),
    ],
    suggest: (i) => {
      const r = parseRange3240(i.value)
      return r ? gradeCover3240(r.mid) : null
    },
    explain: (i) => {
      const r = parseRange3240(i.value)
      return r && r.lo !== r.hi ? `Środek zakresu: ${pct(r.mid)}.` : null
    },
    warn: (i) => {
      const v = String(i.value ?? '').trim()
      if (v && !parseRange3240(v)) return 'Nie rozumiem zwarcia – wpisz liczbę albo zakres, np. 40–90.'
      const r = parseRange3240(v)
      return r && r.hi > 100 ? 'Zwarcie powyżej 100%? Ambitnie.' : null
    },
    describe: (i) => {
      const v = String(i.value ?? '').trim()
      return note(i) || (v ? `śr. ${rangeText(v)}%` : '')
    },
  },
  {
    id: 'structure',
    label: 'Struktura przestrzenna płatów zarośli',
    parameter: 'structure',
    description:
      'Dominujący sposób rozmieszczenia krzewów wierzbowych na transekcie: zwarty płat, kilka płatów, pojedyncze kępy, rozproszone pojedyncze krzewy. Mówi o etapie rozwoju zarośli; analizować łącznie z odnowieniem i wysokością krzewów oraz ich zwarciem.',
    help: `Co wybrać: jak rozmieszczone są krzewy wierzb na transekcie.

Progi (tab. 2): masowe występowanie (zwarty płat, rozległe płaty) – FV; kępy niewielkie lub rozproszone osobniki na całym transekcie – U1; brak lub pojedyncze osobniki – U2. Karta z przewodnika: „kilka płatów lub niewielkie kępy” → U1.

Dlaczego: po powodzi zarośla rozpadają się na kępy, potem znów zwierają. Pojedyncze krzewy (U2) w 2021 r. oznaczały stanowiska, na których siedliska praktycznie już nie było.`,
    thresholds: thresholdsOf(STRUCTURE),
    inputs: [
      selectInput('Struktura płatów', STRUCTURE),
      noteInput('Opis (opcjonalnie)', 'np. Kilka płatów lub niewielkie kępy', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(STRUCTURE)),
    describe: (i) => note(i) || labelOf(STRUCTURE, i.choice),
  },
  {
    id: 'trees',
    label: 'Udział gatunków drzewiastych (powyżej 3 m wys.)',
    parameter: 'structure',
    cardinal: true,
    description:
      'Gatunki drzew w granicach transektu z pokryciem albo klasą (pojedyncze, rzadkie, częste). Odnosi się do okazów wyższych od krzewów wierzbowych – w krótkim czasie mogą ocienić zarośla i wyeliminować gatunki światłolubne. Pośrednio wskaźnik warunków świetlnych.',
    help: `Co wpisać: drzewa (olsza szara i czarna, jesion, jawor, świerk, topole, także wyrośnięte wierzby kruche i białe) wyższe niż ok. 3 m, z pokryciem transektu, i wybierz klasę.

Progi (tab. 2): brak lub pojedyncze osobniki – FV; pojedyncze rozrośnięte drzewa lub drzewa w niewielkich kępach – U1; liczne drzewa o znacznej wysokości (>5 m) – U2.

Próg wysokości: tab. 1 ma „powyżej 2,5–3 m”, karta z przewodnika i monitoring 2010 i 2016 – „powyżej 1,5 m”, tab. 2, lista kardynalnych i harmonizacja 2016 – „powyżej 3 m” (tak w 2021 r.). Formularz używa 3 m. Jeśli liczysz od innej wysokości, napisz to w opisie.

Wskaźnik kardynalny. Dlaczego: drzewa nad wierzbami to sukcesja w stronę łęgu – w 2016 r. pogorszenie oceny wynikało właśnie z rozrastania się drzew kosztem zarośli.`,
    thresholds: thresholdsOf(TREES),
    inputs: [
      selectInput('Drzewa powyżej 3 m', TREES),
      speciesInput('Gatunki drzew (opcjonalnie)', 'Drzewa wyższe niż ok. 3 m z pokryciem w % transektu, np. Alnus incana 5.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak', 'Krótki opis, który trafi do „wartości” w karcie zamiast klasy i listy.'),
    ],
    suggest: byOption(gradeMap(TREES)),
    warn: (i) => {
      const names = rowNames(i.species)
      if ((i.choice === 'none') && names.length) return 'Wybrano „Brak”, a lista drzew nie jest pusta.'
      const herbs = distinct(names.filter((n) => findSpecies3240(n) && !findSpecies3240(n)!.woody))
      return herbs.length ? `To nie drzewa: ${herbs.join(', ')}.` : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      return [labelOf(TREES, i.choice), list].filter(Boolean).join(': ')
    },
  },
  {
    id: 'health',
    label: 'Stan zdrowotny krzewów wierzbowych',
    parameter: 'structure',
    description:
      'Stan zdrowotny krzewów: zniszczenia mechaniczne (wyrywanie, wycinanie, łamanie pędów), obecność patogenów, ślady zasychania pędów, chlorozy i nekrozy na liściach.',
    help: `Co wybrać: oceń stopień uszkodzeń krzewów wierzb na transekcie – połamane, wywrócone, wyrwane, wycięte, zasychające wierzchołki, choroby liści. Opisz, co widać, i skąd to (powódź, wycinanie, bobry).

Progi (tab. 2): brak oznak pogorszenia zdrowia lub tylko pojedyncze uszkodzone krzewy – FV; pojedyncze oznaki niewłaściwego stanu zdrowia lub uszkodzenia z przyczyn naturalnych – U1; częste oznaki złego stanu zdrowia, znaczna część krzewów uszkodzona lub zaatakowana – U2. Karta z przewodnika: „pojedyncze krzewy połamane, wywrócone – efekt powodzi” → FV.

Sprawozdanie 2021: U1 za obsychanie wierzchołków i wypadanie pojedynczych osobników po wezbraniu, U2 – znaczne uszkodzenia mechaniczne i zasychanie.`,
    thresholds: thresholdsOf(HEALTH),
    inputs: [
      selectInput('Stan zdrowotny', HEALTH),
      noteInput('Opis (opcjonalnie)', 'np. Pojedyncze krzewy połamane, wywrócone – efekt powodzi', 'Krótki opis uszkodzeń, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(HEALTH)),
    describe: (i) => note(i) || labelOf(HEALTH, i.choice),
  },
  {
    id: 'regeneration',
    label: 'Odnowienie wierzby (obecność nalotu)',
    parameter: 'structure',
    description: 'Obecność siewek i młodocianych osobników wierzb: obecne – powszechne, obecne – słabe lub brak. Wyraża możliwości rozwojowe siedliska i zdolność do odnowienia.',
    help: `Co wybrać: czy na transekcie (zwłaszcza na odkrytych kamieńcach i łachach) są siewki i młode wierzby – z nasion albo z odrostów.

Progi (tab. 2): obecne, występujące powszechnie – FV; obecne, ale nieliczne – U1; brak – U2. Karta z przewodnika: „młode osobniki dość często, z odrostów i liczne siewki” → FV.

Dlaczego: zarośla wierzbowe stale się odnawiają na nowych kamieńcach po wezbraniach. Brak nalotu oznacza, że rzeka nie tworzy już nowych łach (regulacja, pobór żwiru) albo zarośla starzeją się w stronę łęgu.`,
    thresholds: thresholdsOf(REGEN),
    inputs: [
      selectInput('Odnowienie wierzby', REGEN),
      noteInput('Opis (opcjonalnie)', 'np. Młode osobniki dość często, z odrostów i liczne siewki', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(REGEN)),
    describe: (i) => note(i) || labelOf(REGEN, i.choice),
  },
  {
    id: 'expansive',
    label: 'Gatunki ekspansywnych roślin zielnych',
    parameter: 'structure',
    description:
      'Gatunki roślin zielnych o skłonnościach do łanowego występowania, obecne w granicach transektu, z nazwą i pokryciem transektu (w zaokrągleniu do 10%, pojedyncze osobniki – jako sporadyczne). Wskaźnik zagrożenia konkurencją o miejsce ze strony innych gatunków.',
    help: `Co wpisać: rodzime gatunki zielne, które tworzą na transekcie łany albo duże kępy, z pokryciem. Najczęściej (sprawozdania 2016–2021): trzcinnik piaskowy Calamagrostis epigejos, mozga trzcinowata Phalaris arundinacea, kostrzewa leśna Festuca altissima, jeżyna popielica Rubus caesius, pokrzywa Urtica dioica. Gatunków obcych tu nie wpisuj – mają osobny wskaźnik.

Progi (tab. 2): brak lub pojedyncze osobniki jednego gatunku – FV; kępy rozproszone, pojedyncze osobniki na całej przestrzeni – U1; masowe występowanie lub kilka gatunków o takich cechach – U2. Metodyka nie podaje progów pokrycia, więc ocenę wybierasz (formularz podpowiada FV tylko przy „nie stwierdzono”).

Uwaga: lepiężniki (Petasites kablikianus, P. albus) i podbiał to gatunki typowe runa 3240 – karta z przewodnika wpisała lepiężnik Kablika 5% i jeżynę popielicę 5%, a oceniła FV. Ekspert decyduje, czy dany łan to ekspansja.`,
    thresholds: thresholdsOf(EXPANSIVE),
    inputs: [
      speciesInput('Gatunki ekspansywne na transekcie', 'Rodzime gatunki zielne o skłonnościach do łanowego występowania, z pokryciem w % transektu.'),
      NONE_FIELD('Brak gatunków ekspansywnych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków ekspansywnych – wtedy wskaźnik to FV.'),
      optionalSelect('Ocena', EXPANSIVE, 'Ocena wg tab. 2. Metodyka nie podaje progów pokrycia, więc przy wpisanych gatunkach wybierz ją ekspercko.'),
      noteInput('Opis (opcjonalnie)', 'np. Lepiężnik różowy Petasites kablikianus 5%, jeżyna popielica Rubus caesius 5%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => gradeMap(EXPANSIVE)[String(i.choice)] ?? (i.none === 'yes' && !rowNames(i.species).length ? 'FV' : null),
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && names.length) parts.push('Zaznaczono „Nie stwierdzono”, a lista nie jest pusta.')
      const aliens = names.filter(isAlien3240)
      if (aliens.length) parts.push(`Gatunki obce wpisz we wskaźniku „Obce gatunki inwazyjne”: ${aliens.join(', ')}.`)
      if (i.choice === 'fv' && names.length > 1) parts.push(`Wybrano FV przy ${names.length} gatunkach – tab. 2 daje FV dla „brak lub pojedyncze osobniki jednego gatunku”.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      if (!list && i.none === 'yes') return 'nie stwierdzono'
      return list || (i.choice ? labelOf(EXPANSIVE, i.choice) : '')
    },
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Gatunki roślin obcych, inwazyjnych, o skłonnościach do łanowego występowania, w granicach transektu, z nazwą i pokryciem (w zaokrągleniu do 10%, pojedyncze osobniki – jako sporadyczne). Wskaźnik zagrożenia konkurencją ze strony obcych gatunków.',
    help: `Co wpisać: gatunki obce na transekcie z pokryciem i wybierz liczebność (albo zostaw – formularz oceni ją z pokrycia). Najczęstsze w 3240: rdestowiec japoński Reynoutria japonica, barszcz Sosnowskiego Heracleum sosnowskyi, niecierpek gruczołowaty Impatiens glandulifera i drobnokwiatowy I. parviflora, nawłoć późna Solidago gigantea, przymiotno kanadyjskie Conyza canadensis, robinia.

Progi (tab. 2): brak lub pojedyncze osobniki jednego gatunku – FV; kępy rozproszone, pojedyncze osobniki lub więcej niż jeden gatunek – U1; masowe (łanowe) występowanie lub więcej niż dwa gatunki – U2.

Jak liczy formularz: 0 gatunków → FV; 1 gatunek pojedynczo (pokrycie <1%) → FV, w kępach (≥1%) → U1; 2 gatunki → U1; 3 i więcej albo masowo (gatunek z pokryciem ≥${MASSIVE_ALIEN}%, „łanowo”) → U2. Liczebność wybrana w polu ma pierwszeństwo przed pokryciem. Synonimy (Conyza/Erigeron canadensis) liczone raz. Karta z przewodnika doliczyła barszcz rosnący tuż obok transektu – jeśli tak robisz, wpisz go bez pokrycia i opisz w notatce.

Wskaźnik kardynalny. Sprawozdanie 2021: obce gatunki – obok składu krzewów – najczęściej decydowały o złej ocenie struktury (połowa stanowisk U2). Barszcz i rdestowiec należy usuwać (przewodnik, pkt 5).`,
    thresholds: thresholdsOf([
      { value: 'fv', label: 'Brak lub pojedyncze osobniki jednego gatunku', grade: 'FV' },
      { value: 'u1', label: 'Kępy rozproszone, pojedyncze osobniki lub więcej niż jeden gatunek', grade: 'U1' },
      { value: 'u2', label: 'Masowe (łanowe) występowanie lub więcej niż dwa gatunki', grade: 'U2' },
    ]),
    inputs: [
      speciesInput('Gatunki obce na transekcie', 'Gatunki obce inwazyjne z pokryciem w % transektu (dla „<1%” wpisz 0,5).'),
      { kind: 'select', name: 'abundance', label: 'Liczebność (opcjonalnie)', options: ALIEN_ABUNDANCE, help: 'Jak występują gatunki obce: pojedyncze osobniki, kępy rozproszone czy łanowo. Puste – formularz oceni z pokrycia (<1% pojedynczo, od 1% kępy, od 25% łanowo).' },
      { kind: 'number', name: 'count', label: 'Liczba gatunków (opcjonalnie)', min: 0, help: 'Liczba gatunków obcych wpisana wprost – ma pierwszeństwo przed liczeniem z listy.' },
      NONE_FIELD('Brak gatunków obcych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków obcych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Rdestowiec japoński Reynoutria japonica <1%. Obok: poj. barszcz Sosnowskiego', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = aliensCount(i)
      return c === undefined ? null : gradeAliens3240(c, aliensAbundance(i))
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
      const native = names.filter((n) => findSpecies3240(n) && !isAlien3240(n))
      if (native.length) parts.push(`Na liście są gatunki rodzime: ${native.join(', ')}.`)
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
    id: 'complex',
    label: 'Obecność kompleksu siedlisk nadrzecznych: 3220, 3230, 3240, 91E0',
    parameter: 'structure',
    cardinal: true,
    description:
      'Obecność na odcinku rzeki kompleksu siedlisk świadczy o zachowanym ciągu sukcesyjnym i możliwości odnawiania się siedliska po ewentualnym wezbraniu. Podaje się, jakie siedliska są obecne i w jakim stopniu są zbliżone do wzorca (reprezentatywność).',
    help: `Co wybrać: dla każdego z czterech siedlisk ciągu nadrzecznego – czy jest na badanym odcinku rzeki i czy jest dobrze wykształcone (reprezentatywne). Samo 3240 też się liczy.
• 3220 – pionierska roślinność na odkrytych kamieńcach,
• 3230 – zarośla wrześni (Myricarietum),
• 3240 – zarośla wierzby siwej (badane siedlisko),
• 91E0 – łęgi (olszyny karpackie, nadrzeczne łęgi wierzbowe).

Progi (tab. 2): minimum trzy typy siedlisk, dobrze wykształcone – FV; przynajmniej dwa typy, przynajmniej jeden dobrze wykształcony – U1; brak lub jedno z siedlisk – U2.

Jak liczy formularz: FV przy co najmniej trzech typach dobrze wykształconych; U1 przy dwóch i więcej obecnych (także słabo wykształconych – sprawozdanie 2021: „2–3 typy o niskiej reprezentatywności” → U1); U2 przy jednym albo żadnym.

Wskaźnik kardynalny. Dlaczego: 3240 to jedno ogniwo ciągu kamieniec → zarośla → łęg. Bez kamieńców (3220) nie ma gdzie się odnawiać, a bez łęgu nie ma dokąd iść.`,
    thresholds: {
      FV: 'Minimum trzy typy siedlisk; dobrze wykształcone',
      U1: 'Przynajmniej dwa typy siedlisk, przynajmniej jeden z nich dobrze wykształcony',
      U2: 'Brak lub jedno z siedlisk',
    },
    inputs: [
      ...COMPLEX_HABITATS.map(
        (h): FieldDef => ({
          kind: 'select',
          name: h.name,
          label: h.label,
          group: 'Siedliska na odcinku rzeki',
          options: COMPLEX_STATE,
          help: `Czy siedlisko ${h.code} występuje na badanym odcinku rzeki i czy jest dobrze wykształcone (zbliżone do wzorca, reprezentatywne).`,
        }),
      ),
      noteInput('Opis (opcjonalnie)', 'np. 3220, 3230, 3240, 91E0 – wszystkie tworzą reprezentatywne płaty', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy siedlisk.'),
    ],
    suggest: (i) => {
      const c = complexCounts(i)
      return c ? gradeComplex3240(c.present, c.good) : null
    },
    explain: (i) => {
      const c = complexCounts(i)
      return c ? `Obecne: ${c.present} (dobrze wykształcone: ${c.good}).` : null
    },
    warn: (i) => (i.h3240 === 'absent' ? 'Zaznaczono brak 3240 – jeśli siedliska nie ma, opisz to i rozważ wniosek o usunięcie stanowiska.' : null),
    describe: (i) => {
      if (note(i)) return note(i)
      const c = complexCounts(i)
      if (!c) return ''
      if (!c.present) return 'brak'
      return COMPLEX_HABITATS.filter((h) => i[h.name] === 'good' || i[h.name] === 'poor')
        .map((h) => `${h.code}${i[h.name] === 'poor' ? ' (słabo wykształcone)' : ''}`)
        .join(', ')
    },
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu, z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie.

Dlaczego: kamieńce zmieniają się z każdą powodzią – bez współrzędnych za 6 lat nikt nie trafi w ten sam transekt.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Śnietnica',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – zwykle miejscowość nad rzeką, np. „Śnietnica”, „Nieznajowa”, „Wróblówka”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego odcinka rzeki.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. referencyjne',
    help: `Typ stanowiska w sieci monitoringu, np. „referencyjne” – dobrze wykształcone siedlisko, punkt odniesienia dla innych. Jeśli nie wiesz, zostaw puste.

Dlaczego: przy ocenie na poziomie regionu stanowiska referencyjne pokazują, jak wygląda 3240 w dobrym stanie.`,
  },
  {
    kind: 'select',
    name: 'indicatorSet',
    label: 'Zestaw wskaźników struktury',
    options: INDICATOR_SETS,
    defaultValue: 'guide',
    required: true,
    hint: 'Przewodnik liczy też powierzchnię zajętą na transekcie; po harmonizacji 2016 – nie.',
    help: `Przewodnik (tab. 1, karta przykładowa) i monitoring 2010 i 2016 oceniały strukturę 11 wskaźnikami, w tym „powierzchnią zajętą przez siedlisko na transekcie”. Harmonizacja nazw w sprawozdaniu 2016–2018 ten wskaźnik pominęła i w 2021 r. strukturę oceniano 10 wskaźnikami.

Przy zestawie „po harmonizacji” wskaźnik zostaje w karcie (wpisujesz go), ale nie liczy się do oceny struktury. Kardynalne są w obu zestawach te same.`,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    defaultValue: 'Salici eleagni-Myricarietum',
    placeholder: 'np. Salici eleagni-Myricarietum',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Dla 3240: klasa Salicetea purpureae, rząd Salicetalia purpureae, związek Salicion elaeagni, zespół Salici-Myricarietum – zarośla wierzbowe z wrześnią pobrzeżną (część z przewagą wierzby).

Uwaga: zarośla z przewagą wrześni to 3230, a zarośla w wąskich, stromych dolinach zwykle zastępuje olsza szara (91E0).`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Odcinek rzeki, układ koryta i kamieńców, płaty zarośli, skład, ślady powodzi, regulacja, gatunki obce.',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• odcinek rzeki: nazwa, układ koryta (ramiona, wyspy), szerokość kamieńców, wielkość otoczaków, nanosy piasku i żwiru;
• płaty zarośli: gdzie leżą względem transektu, skład (wierzba siwa, purpurowa, krucha, września), wiek i zwarcie;
• skutki ostatnich wezbrań: podmyte brzegi, wyrwane kępy, świeże łachy z siewkami wierzb;
• antropopresja: regulacja i prostowanie koryta, wały, pobór żwiru, wycinanie zarośli, śmieci;
• gatunki obce (rdestowiec, barszcz, niecierpek).
Za stanowisko uznaje się odcinek koryta rzeki ok. 0,5–1 km z kamieńcami i zaroślami wierzbowymi.`,
  },
  {
    kind: 'text',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    required: true,
    placeholder: 'np. <0,5',
    help: 'Łączna powierzchnia płatów 3240 na stanowisku, w hektarach – liczba albo przedział jak w karcie („<0,5”). Sprawozdanie 2021: od 0 do 2,5 ha, najczęściej poniżej 0,5 ha. Oszacuj w terenie albo z ortofotomapy.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „PLH120024 Biała Tarnowska”. Brak – „brak”.',
  }),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. własność prywatna wzdłuż rzeki, koryto – RZGW',
    help: `Kto zarządza terenem: koryto rzeki zwykle RZGW (Wody Polskie), brzegi – właściciele prywatni, gmina, Lasy Państwowe, park narodowy.

Dlaczego: od zarządcy koryta zależą regulacje, pobór żwiru i wycinanie zarośli – to główne zagrożenia antropogeniczne 3240.`,
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
    hint: 'Jeden transekt 200×10 m w płatach zarośli.',
    help: `Na każdym stanowisku wyznacza się jeden transekt o długości 200 m i szerokości 10 m (20 arów), w płatach zarośli wierzbowych. Pomiary wskaźników i zdjęcia fitosocjologiczne – na początku, w środku i na końcu transektu.

Dlaczego: stała powierzchnia pozwala porównywać procent zarośli, zwarcie i udział drzew między cyklami.`,
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
    help: 'Wysokość nad poziomem morza transektu, z GPS albo mapy. Zarośla wierzbowo-wrześniowe rosną od ok. 350 do 700 m n.p.m., zarośla wierzb na łachach w wyżej położonych dolinach – nawet powyżej 900 m.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 21.07.2010',
    required: true,
    hint: 'Optymalnie czerwiec–sierpień.',
    help: `Dzień badań terenowych. Optymalny termin: czerwiec–sierpień, gdy roślinność jest rozwinięta i możliwa do identyfikacji. Później też można, ale części gatunków nie rozpoznasz. Uważaj na wezbrania przełomu czerwca i lipca – przy wysokiej wodzie siedlisko jest zalane i badań nie da się zrobić.

Badania powtarza się raz na sześć lat; warto notować terminy znaczących powodzi między obserwacjami (pole „Uwagi”). W 2016 r. większość stanowisk badano we wrześniu – sprawozdanie uznało wyniki za reprezentatywne.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 6 && m <= 8 ? null : 'Termin poza optymalnym oknem (czerwiec–sierpień). Część gatunków runa może być nierozpoznawalna – opisz to w uwagach.'
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

// ---------- zdjęcia fitosocjologiczne: 3 × 5×5 m ----------

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
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Na kamieńcu zwykle <1°.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, SW) – na kamieńcu zwykle zgodny z biegiem rzeki. Dla powierzchni płaskiej zostaw puste albo wpisz „brak”.' }),
  layerField('coverB', 'Warstwa B – krzewy: procent powierzchni zdjęcia pod koronami wierzb, wrześni i olszy (rzut pionowy). W zaroślach 3240 zwykle 40–90%.\n\nDlaczego: zwarcie B to stan samych zarośli – pełne zwarcie to dojrzały płat, niskie – młody albo zniszczony przez powódź.', { groupCols: 2 }),
  layerField('coverC', 'Warstwa C – zielna: procent powierzchni zdjęcia pokryty przez runo (podbiał, lepiężniki, podagrycznik, trawy) i siewki wierzb. Przewodnik: przy dużym ocienieniu średnio do 30%.\n\nDlaczego: runo jest przypadkowe i zmienne, ale łany jeżyny, pokrzywy czy rdestowca widać właśnie tu.'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów, w metrach (w karcie z przewodnika 1–3 m; najwyższe do 4–5 m – dopisz w notatce).'),
  layerField('heightC', 'Warstwa C – typowa wysokość runa, w centymetrach (zwykle 30–40 cm).'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Salici eleagni-Myricarietum',
    help: 'Jednostka fitosocjologiczna zdjęcia, zwykle zespół Salici eleagni-Myricarietum.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w poletku z ilościowością w skali Braun-Blanqueta (r, +, 1–5): warstwa B – krzewy (wierzby, września, olsza), C – runo i siewki drzew i krzewów. Warstwa podpowiada się sama po wyborze gatunku.',
  }),
]

export const methodology3240: Methodology = {
  code: '3240',
  name: 'Zarośla wierzby siwej na kamieńcach i żwirowiskach górskich potoków',
  source:
    'Perzanowska J. 2012, 3240 Zarośla wierzby siwej na kamieńcach i żwirowiskach górskich potoków (Salici-Myricarietum część – z przewagą wierzby), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 193–203 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2009–2011, 2016–2018 i 2021.',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj 3 zdjęcia fitosocjologiczne po 25 m²: na początku, w środku i na końcu transektu. Ilościowość w skali Braun-Blanqueta; warstwy B (krzewy) i C (runo).',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Możliwości ochrony siedliska i utrzymania go w stanie niepogorszonym, przy analizie możliwych do wyobrażenia czynników realnie oddziałujących na siedlisko w najbliższej przyszłości. Pod uwagę brany jest aktualny stan zachowania, obecność ochrony i reżim ochronny, podejmowane działania ochrony przeciwpowodziowej lub inny sposób użytkowania gospodarczego.',
    help: `Weź pod uwagę: regulację i prostowanie koryta, zabudowę poprzeczną, pobór żwiru, wycinanie zarośli przybrzeżnych, zabudowę terasy zalewowej, gatunki obce (rdestowiec, barszcz, niecierpek gruczołowaty) i sukcesję w stronę łęgu. Wezbrania niszczą płaty, ale w dłuższej perspektywie odnawiają siedlisko – to czynnik pozytywny.

Przewodnik (pkt 5): ochrona polega na pozostawieniu naturalnie ukształtowanych koryt (poza miejscowościami), utrzymaniu wysokich przepływów, rezygnacji z poprzecznej zabudowy hydrotechnicznej, zwężania koryt i zabudowy terasy zalewowej. Ochrona czynna: usuwanie rdestowca, barszczu i niecierpka.

Praktyka 2021: niewłaściwe perspektywy dawały brak ochrony, gatunki inwazyjne, zaawansowana sukcesja w stronę łęgu, brak możliwości odtworzenia siedliska i antropopresja (wycinanie zarośli, zabudowa, pozyskiwanie żwiru, regulacja).`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A03', name: 'Koszenie / ścinanie trawy' },
    { code: 'A04', name: 'Wypas' },
    { code: 'B02.01', name: 'Odnawianie lasu po wycince' },
    { code: 'B02.02', name: 'Wycinka lasu' },
    { code: 'B02.04', name: 'Usuwanie martwych i umierających drzew' },
    { code: 'C01.01', name: 'Wydobywanie piasku i żwiru' },
    { code: 'C01.01.02', name: 'Usuwanie materiału z plaż' },
    { code: 'D01', name: 'Drogi, ścieżki i drogi kolejowe' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D01.02', name: 'Drogi, autostrady' },
    { code: 'E01', name: 'Tereny zurbanizowane, tereny zamieszkane' },
    { code: 'E01.03', name: 'Zabudowa rozproszona' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'E03.01', name: 'Pozbywanie się odpadów z gospodarstw domowych / obiektów rekreacyjnych' },
    { code: 'F02.03', name: 'Wędkarstwo' },
    { code: 'F04', name: 'Pozyskiwanie / usuwanie roślin lądowych, ogólnie' },
    { code: 'G01.08', name: 'Inne rodzaje sportu i aktywnego wypoczynku' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02.02', name: 'Usuwanie osadów (mułu…)' },
    { code: 'J02.03', name: 'Kanalizowanie i przekierowanie wód' },
    { code: 'J02.03.02', name: 'Kanalizowanie (prostowanie koryt rzecznych)' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód – ogólnie' },
    { code: 'J02.11.01', name: 'Zrzut, odkładanie wybagrowanych materiałów' },
    { code: 'J02.12.02', name: 'Wały przeciwpowodziowe i zabezpieczenia przed zalaniem w śródlądowych systemach wodnych' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'L08', name: 'Powódź (procesy naturalne)' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: [
    ...methodology7120.otherFields.flatMap((f): FieldDef[] => {
      if (f.name === 'otherValues')
        return [
          {
            ...f,
            hint: 'Np. kompleks siedlisk nadrzecznych 3220, 3230, 91E0; rzadkie gatunki.',
            help: 'Wartości przyrodnicze stanowiska poza samymi zaroślami: sąsiednie siedliska ciągu nadrzecznego (3220, 3230, 91E0), rzadkie i chronione gatunki roślin i zwierząt (np. ptaki kamieńców). Brak informacji – „Nie stwierdzono” albo „Nie pozyskano danych”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            label: 'Wykonywane działania ochronne',
            help: 'Jakie działania ochronne wykonano i z jakim skutkiem. W płatach 3240 do 2012 r. nie prowadzono działań ochronnych; jedyne zalecane czynne działanie to usuwanie gatunków obcych. Brak działań – „Brak działań”.',
          },
          {
            kind: 'textarea',
            name: 'proposals',
            label: 'Propozycje wprowadzenia działań ochronnych',
            rows: 4,
            hint: 'Np. usuwanie rdestowca i barszczu; rezygnacja z prostowania koryta.',
            help: `Jakie działania proponujesz, konkretnie: pozostawienie naturalnego koryta, rezygnacja z prostowania i zabudowy poprzecznej, zakaz poboru żwiru, usuwanie rdestowca japońskiego, barszczu Sosnowskiego i niecierpka gruczołowatego. Koryta są pod zarządem RZGW (Wody Polskie) – tam trafiają propozycje. Brak – „Brak”.`,
          },
        ]
      if (f.name === 'notes')
        return [
          {
            kind: 'number',
            name: 'shareFV',
            group: 'Powierzchnia siedliska o różnym stanie zachowania (transekt)',
            label: 'Udział powierzchni siedliska w stanie FV',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Karta z przewodnika podaje przy ocenie ogólnej powierzchnię siedliska o różnym stanie zachowania na stanowisku (Śnietnica: FV 70%, U1 30%, U2 0%). Trzy liczby powinny dać razem 100%.',
          },
          {
            kind: 'number',
            name: 'shareU1',
            group: 'Powierzchnia siedliska o różnym stanie zachowania (transekt)',
            label: 'Udział powierzchni siedliska w stanie U1',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Procent powierzchni siedliska na stanowisku w stanie niezadowalającym (U1).',
          },
          {
            kind: 'number',
            name: 'shareU2',
            group: 'Powierzchnia siedliska o różnym stanie zachowania (transekt)',
            label: 'Udział powierzchni siedliska w stanie U2',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Procent powierzchni siedliska na stanowisku w stanie złym (U2).',
          },
          {
            ...f,
            help: `${f.help ?? ''}\n\nDla 3240 zapisz tu także: czy monitoring jest wymagany i dlaczego, terminy znaczących powodzi od poprzedniej obserwacji oraz odstępstwa od metodyki (termin, wymiary transektu).`.trim(),
          },
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_3240.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer3240(s) })),
  speciesInfo: (name) => {
    const e = findSpecies3240(name)
    return e ? GROUP_LABELS_3240[e.group] : undefined
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator3240 = (id: string): IndicatorDef => {
  const i = methodology3240.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 3240`)
  return i
}
