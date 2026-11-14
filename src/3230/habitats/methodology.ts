// Metodyka 3230 (zarośla wrześni na kamieńcach i żwirowiskach górskich potoków, Salici-Myricarietum część – z przewagą
// wrześni) jako dane. Źródło: Perzanowska J. 2012, „3230 Zarośla wrześni na kamieńcach i żwirowiskach górskich potoków”
// [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 180–192 (tab. 1 i 2),
// z praktyką oceny ze sprawozdań z monitoringu 2009–2011, 2015–2018 i 2020–2021.
// Siedlisko nieleśne, niepriorytetowe, wyłącznie region alpejski (Karpaty). Stanowisko to odcinek koryta (ok. 0,5–1 km)
// z kamieńcami; w nim jeden transekt 200×10 m przez najważniejsze skupienia zarośli wrześni i 3 zdjęcia fitosocjologiczne
// (początek, środek, koniec transektu). Z modułu leśnego brane są tylko klocki generyczne.
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_3230,
  MYRICARIA,
  SALIX_ELEAGNOS,
  SPECIES_3230,
  defaultLayer3230,
  findSpecies3230,
  isAlien3230,
  isExpansive3230,
  isOtherShrub3230,
  isTree3230,
  isTypicalShrub3230,
  speciesKey3230,
} from './species'

// ---------- progi liczbowe (tab. 2) ----------

/**
 * Powierzchnia zajęta przez siedlisko na transekcie (% transektu 200×10 m = 20 arów): „ok. >2 a (>10% pow. transektu)” FV,
 * „1–2 a (5–10%)” U1, „ok. <1 a (<5%)” U2. Obie granice przedziału U1 należą do U1 (10% → U1, 5% → U1).
 */
export const gradeShare3230 = (p: number): Grade => (p > 10 ? 'FV' : p >= 5 ? 'U1' : 'U2')

/** Wysokość krzewów wrześni (średnia, m): 0,7–2 (2,5) FV, 0,2–0,7 U1, <0,20 U2. 0,7 → FV, 0,2 → U1; powyżej 2,5 m też FV. */
export const gradeHeight3230 = (h: number): Grade => (h >= 0.7 ? 'FV' : h >= 0.2 ? 'U1' : 'U2')

/** Zwarcie krzewów w płacie (%): 30–80 FV; 10–30 lub 80–95 U1; <10 lub >95 U2. Granice 30 i 80 → FV, 10 i 95 → U1. */
export const gradeCover3230 = (p: number): Grade => (p < 10 ? 'U2' : p < 30 ? 'U1' : p <= 80 ? 'FV' : p <= 95 ? 'U1' : 'U2')

/** Udział gatunków drzewiastych powyżej 1,5 m (zwarcie, %): brak FV, „zwarcie <30%” U1, „>30%” U2 (30% → U1). */
export const gradeTrees3230 = (p: number): Grade => (p <= 0 ? 'FV' : p <= 30 ? 'U1' : 'U2')

/** Szerokość kamieńców (m, oba brzegi razem): >30 FV, 10–30 U1 (obie granice), <10 U2. */
export const gradeWidth3230 = (w: number): Grade => (w > 30 ? 'FV' : w >= 10 ? 'U1' : 'U2')

/**
 * Obce gatunki inwazyjne: brak FV; pojedynczo lub w niewielkich kępach U1; masowo lub w dużych płatach U2.
 * Tab. 2 pisze w U1 „jeden gatunek”, a w U2 „więcej niż jeden gatunek, masowo lub duże płaty”. Sprawozdanie 2021
 * daje U1 za „przynajmniej jeden gatunek inwazyjny w pojedynczych lub niewielkich kępach” (11 z 16 stanowisk, przy
 * kilku gatunkach na wielu z nich) – o U2 decyduje masowość, nie sama liczba gatunków. Formularz idzie za praktyką.
 */
export function gradeAliens3230(count: number, mass: boolean): Grade {
  if (count <= 0) return 'FV'
  return mass ? 'U2' : 'U1'
}

/**
 * Kompleks siedlisk nadrzecznych 3220, 3230, 3240, 91E0: „minimum trzy typy siedlisk; dobrze wykształcone” FV,
 * „przynajmniej dwa typy, przynajmniej jedno dobrze wykształcone” U1, „brak lub jedno z siedlisk” U2.
 * Dwa typy bez żadnego dobrze wykształconego – U2 (nie spełnia warunku U1).
 */
export function gradeComplex3230(present: number, good: number): Grade {
  if (good >= 3) return 'FV'
  if (present >= 2 && good >= 1) return 'U1'
  return 'U2'
}

const pct = (v: number) => `${plNum(v)}%`
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey3230(n), n])).values()]
const round1 = (n: number) => Math.round(n * 10) / 10
const sumCover = (v: unknown, pred: (name: string) => boolean = () => true): number | undefined => {
  const covers = speciesRows(v)
    .filter((r) => r.name?.trim() && pred(r.name.trim()))
    .map((r) => num(r.cover))
    .filter((c): c is number => c !== undefined)
  return covers.length ? round1(covers.reduce((a, b) => a + b, 0)) : undefined
}
const has = (v: unknown, latin: string) => rowNames(v).some((n) => speciesKey3230(n) === speciesKey3230(latin))

// ---------- opcje selektów (tab. 2) ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'other', label: 'Inne kombinacje (np. niewielki spadek powierzchni)', grade: 'U1' },
  { value: 'clearDecrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi z literatury', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const SHRUBS: GradedOption[] = [
  { value: 'full', label: 'Pełny zestaw gatunków typowych: września pobrzeżna, wierzby (siwa, krucha, purpurowa), olsza szara', grade: 'FV' },
  { value: 'poor', label: 'Brak wierzby siwej, niskie pokrycie przez wrześnię', grade: 'U1' },
  { value: 'foreign', label: 'Obecne inne krzewy (np. bez czarny, trzmielina); sporadyczny udział gatunków typowych', grade: 'U2' },
]
const SPATIAL: GradedOption[] = [
  { value: 'patches', label: 'Zwarty płat lub kilka płatów', grade: 'FV' },
  { value: 'scattered', label: 'Kępy niewielkie lub rozproszone osobniki na całym transekcie', grade: 'U1' },
  { value: 'single', label: 'Brak lub pojedyncze osobniki', grade: 'U2' },
]
const TREES: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'single', label: 'Pojedyncze osobniki', grade: 'FV' },
  { value: 'present', label: 'Wyraźny udział – zwarcie poniżej 30%', grade: 'U1' },
  { value: 'mass', label: 'Masowe występowanie – zwarcie powyżej 30%', grade: 'U2' },
]
const EXPANSIVE: GradedOption[] = [
  { value: 'none', label: 'Brak lub pojedyncze osobniki', grade: 'FV' },
  { value: 'clumps', label: 'Wyraźne kępy lub rozproszone pojedyncze osobniki na całej przestrzeni', grade: 'U1' },
  { value: 'mass', label: 'Masowe występowanie, zwłaszcza wysokich bylin', grade: 'U2' },
]
const REGENERATION: GradedOption[] = [
  { value: 'common', label: 'Obecne, powszechne; różne stadia rozwojowe', grade: 'FV' },
  { value: 'rare', label: 'Obecne, ale rzadkie', grade: 'U1' },
  { value: 'none', label: 'Brak, nie ma także odkrytych miejsc z wilgotnym żwirkiem', grade: 'U2' },
]
const ABUNDANCE: SelectOption[] = [
  { value: '', label: '—' },
  { value: 'small', label: 'Pojedynczo lub w niewielkich kępach' },
  { value: 'mass', label: 'Masowo lub w dużych płatach' },
]
const HABITAT_STATE: SelectOption[] = [
  { value: '', label: '—' },
  { value: 'good', label: 'Obecne, dobrze wykształcone (typowo)' },
  { value: 'poor', label: 'Obecne, słabo wykształcone' },
  { value: 'absent', label: 'Brak' },
]
const COMPLEX_HABITATS = [
  { name: 'h3220', code: '3220', label: '3220 – pionierska roślinność na kamieńcach górskich potoków' },
  { name: 'h3230', code: '3230', label: '3230 – zarośla wrześni (samo siedlisko)' },
  { name: 'h3240', code: '3240', label: '3240 – zarośla wierzbowo-wrześniowe (wierzba siwa)' },
  { name: 'h91E0', code: '91E0', label: '91E0 – łęgi (olszynka karpacka, łęgi wierzbowe)' },
] as const

/** Select niewymagany – gdy wpiszesz liczbę, wystarczy liczba. */
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

// ---------- liczenie z pól ----------

/** Szerokość kamieńców: wpisana wprost ma pierwszeństwo, inaczej suma obu brzegów (a+b). */
function widthOf(i: InputValues): number | undefined {
  const v = num(i.value)
  if (v !== undefined) return v
  const a = num(i.left)
  const b = num(i.right)
  return a === undefined && b === undefined ? undefined : (a ?? 0) + (b ?? 0)
}

function aliensCount(i: InputValues): number | undefined {
  const names = distinct(rowNames(i.species))
  return num(i.count) ?? (names.length || i.none === 'yes' ? names.length : undefined)
}

function complexCounts(i: InputValues): { present: number; good: number; filled: number } {
  const states = COMPLEX_HABITATS.map((h) => String(i[h.name] ?? ''))
  return {
    present: states.filter((s) => s === 'good' || s === 'poor').length,
    good: states.filter((s) => s === 'good').length,
    filled: states.filter(Boolean).length,
  }
}

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description:
      'Zmiana powierzchni płatów zarośli wrześni na stanowisku (odcinku koryta) w porównaniu z wcześniejszymi badaniami lub danymi z literatury. Powierzchnia siedliska jest bardzo zmienna – zależy od wystąpienia i siły wezbrań.',
    help: `Co wybrać: jak zmieniła się powierzchnia zarośli wrześni na stanowisku od poprzedniego badania (albo względem literatury, ortofotomapy). Powierzchnię w hektarach możesz wpisać obok – trafi do pola „wartość”.

Progi (tab. 2, wiersz „powierzchnia”): nie podlega zmianom lub zwiększa się, na ogół ok. >2 a (>10% transektu) – FV; inne kombinacje, zwykle 1–2 a (5–10%) – U1; wyraźny spadek w porównaniu z wcześniejszymi badaniami lub literaturą, ok. <1 a (<5%) – U2. Liczby z tego wiersza formularz stosuje we wskaźniku „Powierzchnia zajęta przez siedlisko na transekcie”, tutaj ocenia trend. Przy pierwszym badaniu wybierz „Brak danych do porównania” (XX) albo oceń ekspercko.

Uwaga na pułapkę: zarośla wrześni po wezbraniu potrafią zniknąć w jednym miejscu i pojawić się kilkaset metrów dalej. Stanowiskiem jest odcinek koryta, nie konkretny płat – porównuj powierzchnię na całym odcinku. Sprawozdanie 2016–2018 wprost przyznaje, że definicja tego parametru dla siedlisk kamieńcowych (3220, 3230, 3240) „wymaga uściślenia”. Sprawozdanie 2021: obniżenia wynikały z regulacji rzeki i z braku dużych wezbrań odnawiających kamieńce.`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się, na ogół ok. >2 a (>10% pow. transektu)',
      U1: 'Inne kombinacje, powierzchnia zwykle w zakresie 1–2 a (5–10% pow. transektu)',
      U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze, ok. <1 a (<5% pow. transektu)',
    },
    inputs: [
      optionalSelect('Zmiana powierzchni', AREA, 'Puste, gdy oceniasz ekspercko.'),
      { kind: 'number', name: 'areaHa', label: 'Powierzchnia (opcjonalnie)', unit: 'ha', min: 0, help: 'Powierzchnia płatów zarośli wrześni na stanowisku, jeśli ją znasz – trafi do pola „wartość”. W sprawozdaniu 2009: od kilkunastu metrów kwadratowych do kilkunastu arów na stanowisko; w karcie z przewodnika 0,5 ha.' },
      noteInput('Opis (opcjonalnie)', 'np. płaty przesunięte w dół rzeki po wezbraniu, powierzchnia podobna', 'Krótki opis zmian, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => {
      const ha = num(i.areaHa)
      return [ha !== undefined ? `${plNum(ha)} ha` : '', note(i) || (i.choice ? labelOf(AREA, i.choice).toLowerCase() : '')].filter(Boolean).join('; ')
    },
  },
  {
    id: 'share',
    label: 'Powierzchnia zajęta przez siedlisko na transekcie',
    parameter: 'structure',
    description:
      'Ocena szacunkowa powierzchni, którą zajmują zwarte zarośla wrześni, tj. kępy przynajmniej o powierzchni 1–1,5×1–1,5 m i wysokości krzewów powyżej 0,5 m – w procentach powierzchni transektu (200×10 m = 20 arów).',
    help: `Co wpisać: jaką część transektu zajmują zwarte zarośla wrześni – liczą się kępy co najmniej ok. 1–1,5 × 1–1,5 m z krzewami wyższymi niż 0,5 m. Pojedyncze krzewy i siewki opisz w „Odnowieniu” i „Strukturze przestrzennej”, tutaj się nie liczą.

Progi (tab. 2): powyżej 10% transektu (ok. >2 a) – FV; 5–10% (1–2 a) – U1; poniżej 5% (ok. <1 a) – U2. Granice: 10% i 5% to jeszcze U1.

Dlaczego: małe płaty łatwo zmiata jedno wezbranie, a na wolne miejsca wchodzą gatunki ekspansywne. Sprawozdanie 2009 oceniało źle stanowiska, na których siedlisko zajmowało „kilka–kilkanaście procent” transektu – surowiej niż tab. 2; formularz trzyma się liczb z tab. 2.`,
    thresholds: { FV: 'Powyżej 10% powierzchni transektu (ok. >2 a)', U1: '5–10% powierzchni transektu (1–2 a)', U2: 'Poniżej 5% powierzchni transektu (ok. <1 a)' },
    inputs: [
      { kind: 'number', name: 'value', label: 'Udział zarośli wrześni na transekcie', unit: '%', min: 0, max: 100, required: true, help: 'Procent powierzchni transektu (20 arów) zajęty przez zwarte zarośla wrześni. 1 ar = 5% transektu. Brak siedliska = 0.' },
      noteInput('Opis (opcjonalnie)', 'np. siedlisko ma charakter płatowaty na całym transekcie', 'Krótki opis, który trafi do „wartości” w karcie zamiast samego procentu.'),
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v !== undefined ? gradeShare3230(v) : null
    },
    explain: (i) => {
      const v = num(i.value)
      return v !== undefined ? `${pct(v)} transektu to ok. ${plNum(round1(v / 5))} a.` : null
    },
    describe: (i) => {
      const v = num(i.value)
      return note(i) || (v !== undefined ? pct(v) : '')
    },
  },
  {
    id: 'shrubSpecies',
    label: 'Gatunki krzewów',
    parameter: 'structure',
    cardinal: true,
    description:
      'Krzewy występujące w granicach transektu, z nazwą gatunkową i pokryciem w procentach (liczby całkowite), gatunki pojedyncze – jako sporadyczne. Wskaźnik ocenia prawidłowość składu gatunkowego zbiorowiska.',
    help: `Co wpisać: krzewy na transekcie z pokryciem w procentach, a obok wybierz opis z tab. 2. Ocena idzie z wyboru – lista służy do opisu i do ostrzeżeń.

Gatunki typowe (tab. 2 i rozdz. 4): września pobrzeżna Myricaria germanica, wierzba siwa Salix eleagnos, wierzba purpurowa S. purpurea, rzadziej wierzba krucha S. fragilis i trójpręcikowa S. triandra, olsza szara Alnus incana.

Progi (tab. 2): pełny zestaw gatunków typowych – FV; brak wierzby siwej, niskie pokrycie przez wrześnię – U1; obecne inne krzewy (np. bez czarny, trzmielina), sporadyczny udział gatunków typowych – U2.

Uwaga: tab. 2 pisze „wierzby: szara” i „brak wierzby szarej” – w rozdziale o gatunkach i w kartach chodzi o wierzbę siwą Salix eleagnos, więc formularz tak to czyta. „Pełny zestaw” nie znaczy wszystkich sześciu gatunków naraz: sprawozdanie 2009 pisze, że udział gatunków „silnie zależy od lokalnych warunków” (nad Czarnym Dunajcem dominuje wierzba purpurowa, nad Białką – siwa), a karta z przewodnika daje FV przy samej wierzbie siwej w warstwie krzewów.

Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Pełny zestaw gatunków typowych: września pobrzeżna, wierzby: szara, krucha, purpurowa, olsza szara',
      U1: 'Brak wierzby szarej, niskie pokrycie przez wrześnię',
      U2: 'Obecne inne krzewy, np. bez czarny, trzmielina; sporadyczny udział gatunków typowych',
    },
    inputs: [
      selectInput('Skład gatunkowy krzewów', SHRUBS),
      speciesInput('Gatunki krzewów na transekcie (opcjonalnie)', 'Krzewy z pokryciem transektu w %, np. Salix eleagnos 40, Myricaria germanica 10. Gatunki pojedyncze – pokrycie 0,5 albo puste.'),
      noteInput('Opis (opcjonalnie)', 'np. Wierzba siwa Salix eleagnos 40%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: byOption(gradeMap(SHRUBS)),
    explain: (i) => {
      const names = rowNames(i.species)
      if (!names.length) return null
      const typical = distinct(names.filter(isTypicalShrub3230))
      const other = distinct(names.filter(isOtherShrub3230))
      const myr = sumCover(i.species, (n) => speciesKey3230(n) === speciesKey3230(MYRICARIA))
      const myrText = !has(i.species, MYRICARIA) ? 'brak na liście' : myr !== undefined ? pct(myr) : 'bez pokrycia'
      return `Gatunki typowe na liście: ${typical.length}${other.length ? `, inne krzewy: ${other.length}` : ''}. Września: ${myrText}.`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (!names.length) return null
      const parts: string[] = []
      if (i.choice === 'full' && !has(i.species, SALIX_ELEAGNOS)) parts.push('Na liście nie ma wierzby siwej – tab. 2 wiąże jej brak z U1.')
      if (i.choice === 'full' && !has(i.species, MYRICARIA)) parts.push('Na liście nie ma wrześni pobrzeżnej – czy na pewno „pełny zestaw”?')
      const typ = sumCover(i.species, isTypicalShrub3230)
      const oth = sumCover(i.species, isOtherShrub3230)
      if (i.choice !== 'foreign' && oth !== undefined && (typ === undefined || oth > typ)) parts.push(`Inne krzewy (${pct(oth)}) przeważają nad typowymi – tab. 2 wskazuje U2.`)
      const notShrub = distinct(names.filter((n) => findSpecies3230(n) && !isTypicalShrub3230(n) && !isOtherShrub3230(n) && !isTree3230(n)))
      if (notShrub.length) parts.push(`Na liście są gatunki zielne: ${notShrub.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => note(i) || describeSpecies(speciesRows(i.species)) || labelOf(SHRUBS, i.choice),
  },
  {
    id: 'height',
    label: 'Wysokość krzewów wrześni (średnia)',
    parameter: 'structure',
    description: 'Średnia wysokość dla całych kęp krzewów wrześni, w metrach. Wskazuje pośrednio na wiek krzewów i strukturę zbiorowiska.',
    help: `Co wpisać: średnią wysokość kęp wrześni na transekcie, w metrach (np. 1,5).

Progi (tab. 2): 0,7–2 (2,5) m – FV; 0,2–0,7 m – U1; poniżej 0,20 m – U2. Granice: 0,7 m to FV, 0,2 m to U1. Krzewy wyższe niż 2,5 m formularz też liczy jako FV (to najstarsze okazy – września żyje ok. 10 lat), ale ostrzega.

Dlaczego: same siewki i niskie krzewy to stadium inicjalne albo skutek niedawnego zniszczenia przez wezbranie (sprawozdanie 2009: na Kamienicy Sądeckiej, Wisłoce, Białej Tarnowskiej krzewy dorastały dopiero do ok. 1 m). Sprawozdanie 2021: U2 na Wróblówce 01 przy średniej <0,2 m.`,
    thresholds: { FV: '0,7–2 (2,5) m', U1: '0,2–0,7 m', U2: '<0,20 m' },
    inputs: [
      { kind: 'number', name: 'value', label: 'Średnia wysokość krzewów wrześni', unit: 'm', min: 0, max: 10, required: true, help: 'Średnia wysokość całych kęp wrześni na transekcie, w metrach. Np. 2,0.' },
      noteInput('Opis (opcjonalnie)', 'np. krzewy 1,5–2,5 m, między nimi młode okazy do 20 cm', 'Krótki opis, który trafi do „wartości” w karcie zamiast samej liczby.'),
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v !== undefined ? gradeHeight3230(v) : null
    },
    warn: (i) => {
      const v = num(i.value)
      return v !== undefined && v > 2.5 ? `${plNum(v)} m – powyżej górnej granicy z tab. 2 (2,5 m). Sprawdź, czy to na pewno września, nie wierzba.` : null
    },
    describe: (i) => {
      const v = num(i.value)
      return note(i) || (v !== undefined ? `${plNum(v)} m` : '')
    },
  },
  {
    id: 'cover',
    label: 'Zwarcie krzewów wrześni w płacie',
    parameter: 'structure',
    description: 'Zwarcie krzewów wrześni w płatach, w procentach (z dokładnością do 5%). Wskazuje na etap rozwoju zarośli i strukturę zbiorowiska.',
    help: `Co wpisać: zwarcie (rzut koron) krzewów wrześni w płatach zarośli, w procentach, z dokładnością do 5%.

Progi (tab. 2): 30–80% – FV; 10–30% albo 80–95% – U1; poniżej 10% albo powyżej 95% – U2. Granice: 30% i 80% to FV, 10% i 95% to U1.

Dlaczego oba końce są złe: rozproszone pojedyncze osobniki to stadium inicjalne – wolne miejsca łatwo zajmują silniejsze konkurenty. Zwarcie bliskie 100% to z kolei ocienianie krzewów przez sąsiednie, obsychanie i brak miejsca dla światłolubnych siewek (sprawozdanie 2009: Kamienica Łącka, Czarny Dunajec).`,
    thresholds: { FV: '30–80%', U1: '10–30% lub 80–95%', U2: '<10% lub >95%' },
    inputs: [
      { kind: 'number', name: 'value', label: 'Zwarcie krzewów wrześni', unit: '%', min: 0, max: 100, required: true, help: 'Zwarcie krzewów wrześni w płatach, w procentach (co 5%).' },
      noteInput('Opis (opcjonalnie)', 'np. 40%', 'Krótki opis, który trafi do „wartości” w karcie zamiast samego procentu.'),
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v !== undefined ? gradeCover3230(v) : null
    },
    describe: (i) => {
      const v = num(i.value)
      return note(i) || (v !== undefined ? pct(v) : '')
    },
  },
  {
    id: 'spatial',
    label: 'Struktura przestrzenna płatów zarośli wrześni',
    parameter: 'structure',
    description:
      'Dominujący sposób rozmieszczenia krzewów wrześni na transekcie: zwarty płat, kilka płatów, pojedyncze kępy, rozproszone pojedyncze krzewy. Mówi o etapie rozwoju zarośli; analizować łącznie z odnowieniem, wysokością i zwarciem.',
    help: `Co wybrać: jak rozmieszczone są krzewy wrześni na transekcie. Opisz w notatce, co widać – trafi do karty.

Progi (tab. 2): zwarty płat lub kilka płatów – FV; kępy niewielkie lub rozproszone osobniki na całym transekcie – U1; brak lub pojedyncze osobniki – U2.

Uwaga z karty z przewodnika: płatowatość sama w sobie nie jest zła – to skutek niestabilnego podłoża i cyklicznych zalewów. Sprawozdanie 2021: wskaźnik najczęściej obniżany (10 z 16 stanowisk w U1–U2) przez rozproszone występowanie wrześni.`,
    thresholds: { FV: 'Zwarty płat lub kilka płatów', U1: 'Kępy niewielkie, lub rozproszone osobniki na całym transekcie', U2: 'Brak lub pojedyncze osobniki' },
    inputs: [
      selectInput('Rozmieszczenie krzewów wrześni', SPATIAL),
      noteInput('Opis (opcjonalnie)', 'np. większe płaty w miejscach nagromadzenia żwiru, młode siewki na świeżych kamieńcach', 'Krótki opis struktury, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(SPATIAL)),
    describe: (i) => note(i) || labelOf(SPATIAL, i.choice),
  },
  {
    id: 'trees',
    label: 'Udział gatunków drzewiastych (powyżej 1,5 m wys.)',
    parameter: 'structure',
    cardinal: true,
    description:
      'Gatunki drzew w granicach transektu z pokryciem w procentach (co 5%), pojedyncze – jako sporadyczne. Dotyczy okazów wyższych od ok. 1,5–2,5 m, a więc od warstwy krzewów wrześni: te drzewa wkrótce będą ocieniać wrześnię i ją eliminować. Wskaźnik określa warunki świetlne.',
    help: `Co wpisać: drzewa wyższe niż ok. 1,5 m na transekcie – wybierz opis, a obok możesz podać łączne zwarcie i listę gatunków (olsza szara i czarna, wierzba biała i krucha jako drzewa, jawor, sosna, brzoza, topole).

Progi (tab. 2): brak lub pojedyncze osobniki – FV; zwarcie poniżej 30% – U1; masowe występowanie, zwarcie powyżej 30% – U2. Bez wyboru formularz liczy z procentu: 0% – FV, do 30% – U1, powyżej 30% – U2 (pojedyncze drzewa wybierz z listy, bo procent tego nie odróżni).

Wskaźnik kardynalny. Dlaczego: drzewa na kamieńcu to znak, że od dawna nie było wezbrania, które odnowiłoby podłoże – i zapowiedź ocienienia światłolubnej wrześni. Sprawozdanie 2021: jeden z dwóch wskaźników kardynalnych najczęściej obniżających strukturę (44% stanowisk).`,
    thresholds: { FV: 'Brak lub pojedyncze osobniki', U1: 'Zwarcie <30%', U2: 'Masowe występowanie – zwarcie >30%' },
    inputs: [
      optionalSelect('Udział drzew', TREES, 'Puste, gdy wpisujesz zwarcie.'),
      { kind: 'number', name: 'value', label: 'Zwarcie drzew (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Łączne zwarcie drzew wyższych niż ok. 1,5 m na transekcie, w procentach (co 5%). Brak = 0.' },
      speciesInput('Gatunki drzew (opcjonalnie)', 'Drzewa wyższe niż ok. 1,5 m z pokryciem transektu w %, np. Alnus incana 5.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety i listy.'),
    ],
    suggest: (i) => {
      const g = gradeMap(TREES)[String(i.choice)]
      if (g) return g
      const v = num(i.value)
      return v !== undefined ? gradeTrees3230(v) : null
    },
    warn: (i) => {
      const v = num(i.value)
      if (!i.choice || v === undefined) return null
      if ((i.choice === 'none' && v > 0) || (i.choice === 'mass' && v <= 30) || (i.choice === 'present' && (v > 30 || v === 0)))
        return `Wybrano „${labelOf(TREES, i.choice)}”, a zwarcie to ${pct(v)} – sprawdź.`
      return null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const v = num(i.value)
      return [labelOf(TREES, i.choice), v !== undefined ? `zwarcie ${pct(v)}` : '', describeSpecies(speciesRows(i.species))].filter(Boolean).join('; ')
    },
  },
  {
    id: 'expansive',
    label: 'Gatunki ekspansywnych roślin zielnych',
    parameter: 'structure',
    cardinal: true,
    description:
      'Rodzime gatunki roślin zielnych o skłonnościach do łanowego występowania, obecne w granicach transektu, z pokryciem w procentach (co 5%), pojedyncze – jako sporadyczne. Wskaźnik wskazuje na zagrożenie ze strony gatunków konkurujących o miejsce.',
    help: `Co wpisać: wybierz opis z tab. 2, a obok listę gatunków ekspansywnych z pokryciem transektu. Brak – „Brak lub pojedyncze osobniki” i pusta lista.

Gatunki (sprawozdania): wysokie byliny – sadziec konopiasty, wrotycz, lepiężnik różowy; trawy – mozga trzcinowata, trzcinnik piaskowy; z łęgów – pokrzywa zwyczajna, przytulia czepna; z łąk – bylica pospolita. Gatunki obce (niecierpki, nawłocie, rdestowce) wpisuj w „Obcych gatunkach inwazyjnych”.

Progi (tab. 2): brak lub pojedyncze osobniki – FV; wyraźne kępy lub rozproszone pojedyncze osobniki na całej przestrzeni – U1; masowe występowanie, zwłaszcza wysokich bylin – U2. Tab. 2 nie podaje progów procentowych, więc ocena idzie z wyboru. Dla orientacji: karta z przewodnika – trzcinnik 15% → U1; sprawozdanie 2021 – lepiężnik różowy 20% → U2 (masowo).

Wskaźnik kardynalny. Dlaczego: dopóki wezbrania odnawiają kamieńce, ekspansywne byliny nie mają gdzie się rozrosnąć. Gdy kamieńce się utrwalają (brak wezbrań, nadsypane starsze łachy), zarastają łanami i wypierają wrześnię.`,
    thresholds: thresholdsOf(EXPANSIVE),
    inputs: [
      selectInput('Występowanie gatunków ekspansywnych', EXPANSIVE),
      speciesInput('Gatunki ekspansywne na transekcie (opcjonalnie)', 'Gatunki ekspansywne z pokryciem transektu w %, np. Calamagrostis epigejos 15. Pojedyncze – 0,5 albo puste.'),
      noteInput('Opis (opcjonalnie)', 'np. Trzcinnik piaskowy Calamagrostis epigejos 15%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: byOption(gradeMap(EXPANSIVE)),
    explain: (i) => {
      const names = rowNames(i.species)
      if (!names.length) return null
      const t = sumCover(i.species)
      return `Gatunków: ${distinct(names).length}, łączne pokrycie ${t !== undefined ? pct(t) : '— (nie podano)'}.`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      const parts: string[] = []
      const t = sumCover(i.species)
      if (i.choice === 'none' && t !== undefined && t >= 5) parts.push(`Wybrano „brak lub pojedyncze”, a łączne pokrycie to ${pct(t)} – sprawdź.`)
      const aliens = distinct(names.filter(isAlien3230))
      if (aliens.length) parts.push(`Gatunki obce (${aliens.join(', ')}) wpisz we wskaźniku „Obce gatunki inwazyjne”.`)
      const odd = distinct(names.filter((n) => findSpecies3230(n) && !isExpansive3230(n) && !isAlien3230(n)))
      if (odd.length) parts.push(`Na liście są gatunki spoza grupy ekspansywnych: ${odd.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      if (!list && i.choice === 'none') return 'nie stwierdzono'
      return list || labelOf(EXPANSIVE, i.choice)
    },
  },
  {
    id: 'regeneration',
    label: 'Odnowienie krzewów wrześni',
    parameter: 'structure',
    cardinal: true,
    description: 'Obecność siewek i młodocianych osobników wrześni: obecne – powszechne, obecne – słabe, brak. Świadczy o możliwościach rozwojowych siedliska i o jego perspektywach.',
    help: `Co wybrać: czy na transekcie (zwłaszcza na nagich, świeżo utworzonych kamieńcach z wilgotnym żwirkiem) rosną siewki i młode, kilkunastocentymetrowe wrześnie.

Progi (tab. 2): obecne, powszechne, różne stadia rozwojowe – FV; obecne, ale rzadkie – U1; brak, nie ma także odkrytych miejsc z wilgotnym żwirkiem – U2.

Wskaźnik kardynalny. Dlaczego: września żyje ok. 10 lat i odnawia się tylko na świeżych, odsłoniętych odsypach – bez wezbrań i bez odnowienia zarośla przechodzą w wierzbowe (3240) i znikają. Sprawozdanie 2021: odnowienie obniżone na połowie stanowisk – przez regulację, pobór żwiru i zacienienie.`,
    thresholds: thresholdsOf(REGENERATION),
    inputs: [
      selectInput('Odnowienie wrześni', REGENERATION),
      noteInput('Opis (opcjonalnie)', 'np. Wszędzie obserwowane siewki i formy młodociane', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(REGENERATION)),
    describe: (i) => note(i) || labelOf(REGENERATION, i.choice),
  },
  {
    id: 'width',
    label: 'Szerokość kamieńców',
    parameter: 'structure',
    description:
      'Szerokość kamieńców (koryta rzecznego wraz z kamieńcami) w metrach – średnia dla odcinka rzeki ze stanowiskiem wrześni. Wskazuje na potencjalne możliwości zasiedlania kamieńców przez siedlisko.',
    help: `Co wpisać: szerokość kamieńców na obu brzegach, w formacie z karty „a+b” (metry bieżące) – formularz je zsumuje. Możesz też wpisać łączną szerokość wprost (ma pierwszeństwo). Średnia dla odcinka koryta ze stanowiskiem.

Progi (tab. 2): powyżej 30 m – FV; 10–30 m – U1; poniżej 10 m – U2. Granice: 30 m i 10 m to U1.

Dlaczego: szeroki kamieniec to światło i miejsce do odnawiania; przy szerokości poniżej 10 m zarośli wrześni praktycznie nie ma, najwyżej pojedyncze krzewy (sprawozdanie 2009). Sprawozdanie 2021: 25% stanowisk w U2 – zwężanie koryt przez regulację i pobór żwiru.`,
    thresholds: { FV: '>30 m', U1: '10–30 m', U2: '<10 m' },
    inputs: [
      { kind: 'number', name: 'left', label: 'Kamieniec – brzeg a', unit: 'm', min: 0, help: 'Szerokość kamieńca na pierwszym brzegu (a w zapisie „a+b”), w metrach.' },
      { kind: 'number', name: 'right', label: 'Kamieniec – brzeg b', unit: 'm', min: 0, help: 'Szerokość kamieńca na drugim brzegu (b w zapisie „a+b”), w metrach. Brak kamieńca = 0.' },
      { kind: 'number', name: 'value', label: 'Łączna szerokość (opcjonalnie)', unit: 'm', min: 0, help: 'Łączna szerokość kamieńców wpisana wprost (np. z ortofotomapy). Ma pierwszeństwo przed sumą a+b.' },
      noteInput('Opis (opcjonalnie)', 'np. 5–30 m', 'Krótki opis, który trafi do „wartości” w karcie zamiast liczb, np. zakres szerokości wzdłuż odcinka.'),
    ],
    suggest: (i) => {
      const w = widthOf(i)
      return w !== undefined ? gradeWidth3230(w) : null
    },
    explain: (i) => {
      const a = num(i.left)
      const b = num(i.right)
      return num(i.value) === undefined && a !== undefined && b !== undefined ? `Razem ${plNum(a)} + ${plNum(b)} = ${plNum(a + b)} m.` : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const v = num(i.value)
      if (v !== undefined) return `${plNum(v)} m`
      const a = num(i.left)
      const b = num(i.right)
      if (a === undefined && b === undefined) return ''
      return `${plNum(a ?? 0)}+${plNum(b ?? 0)} m`
    },
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    description:
      'Gatunki obce, inwazyjne, o skłonnościach do łanowego występowania, obecne w granicach transektu, z nazwą i pokryciem w procentach (co 5%), pojedyncze – jako sporadyczne. Wskaźnik wskazuje na zagrożenie przez konkurencję o miejsce ze strony tych gatunków.',
    help: `Co wpisać: gatunki obce z pokryciem transektu, a obok – jak występują: pojedynczo / w niewielkich kępach albo masowo / w dużych płatach. Brak – zaznacz „Nie stwierdzono”.

Najczęstsze (sprawozdania 2016–2018 i 2021): niecierpek gruczołowaty i drobnokwiatowy, przymiotno białe i kanadyjskie, nawłoć kanadyjska i późna, barszcz Sosnowskiego, rdestowiec ostrokończysty (japoński), kolczurka klapowana, aster nowobelgijski, topola kanadyjska.

Progi (tab. 2): brak – FV; pojedyncze lub w niewielkich kępach, jeden gatunek – U1; więcej niż jeden gatunek, masowo lub duże płaty – U2.

Jak liczy formularz: o U2 decyduje masowość, nie sama liczba gatunków. Tak oceniano w sprawozdaniu 2021 („przynajmniej jeden gatunek inwazyjny w pojedynczych lub niewielkich kępach” – U1, na 11 z 16 stanowisk, mimo kilku gatunków na wielu z nich; U2 tylko przy masowym występowaniu, np. barszcz Sosnowskiego na Śnietnicy). Jeśli oceniasz literalnie (dwa gatunki = U2), wybierz ocenę ręcznie i uzasadnij w opisie. Bez wyboru sposobu występowania formularz przyjmuje „pojedynczo / w kępach”.

Dlaczego: rdestowiec i barszcz konkurują nie tylko z runem, ale i z krzewami wrześni. Sprawozdanie 2021: najczęstsza przyczyna obniżenia oceny ogólnej (gatunki obce na 13 z 16 stanowisk).`,
    thresholds: {
      FV: 'Brak',
      U1: 'Pojedyncze lub w niewielkich kępach, jeden gatunek',
      U2: 'Więcej niż jeden gatunek, masowo lub duże płaty',
    },
    inputs: [
      speciesInput('Obce gatunki na transekcie', 'Gatunki obce z pokryciem transektu w %, np. Impatiens glandulifera 5. Brak – pusta lista i „Nie stwierdzono”.'),
      { kind: 'select', name: 'abundance', label: 'Sposób występowania', options: ABUNDANCE, help: 'Jak występują gatunki obce na transekcie: pojedynczo lub w niewielkich kępach (U1), masowo lub w dużych płatach (U2). Bez wyboru formularz przyjmuje pojedyncze / kępy.' },
      { kind: 'number', name: 'count', label: 'Liczba gatunków (opcjonalnie)', min: 0, help: 'Liczba gatunków obcych wpisana wprost. Ma pierwszeństwo przed liczeniem z listy.' },
      NONE_FIELD('Brak gatunków obcych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków obcych – wtedy wskaźnik to FV, a do karty trafia „nie stwierdzono”.'),
      noteInput('Opis (opcjonalnie)', 'np. Niecierpek gruczołowaty Impatiens glandulifera 5%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const n = aliensCount(i)
      return n === undefined ? null : gradeAliens3230(n, i.abundance === 'mass')
    },
    explain: (i) => {
      const names = distinct(rowNames(i.species))
      if (!names.length) return null
      const t = sumCover(i.species)
      const n = num(i.count) ?? names.length
      const tail = n > 1 && i.abundance !== 'mass' ? ' Kilka gatunków, ale nie masowo – U1 (praktyka 2021; literalnie tab. 2 dałaby U2).' : ''
      return `Gatunków obcych: ${n}, łączne pokrycie ${t !== undefined ? pct(t) : '— (nie podano)'}.${tail}`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (i.none === 'yes' && names.length) return 'Zaznaczono „Nie stwierdzono”, a lista gatunków obcych nie jest pusta.'
      if (num(i.count) === 0 && names.length) return 'Wpisano 0 gatunków, a lista nie jest pusta.'
      const parts: string[] = []
      const t = sumCover(i.species)
      if (i.abundance !== 'mass' && t !== undefined && t > 10) parts.push(`Łączne pokrycie ${pct(t)} – czy to nie „masowo lub w dużych płatach”?`)
      const native = distinct(names.filter((n) => findSpecies3230(n) && !isAlien3230(n)))
      if (native.length) parts.push(`Na liście gatunków obcych są gatunki rodzime: ${native.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      if (!list && (i.none === 'yes' || num(i.count) === 0)) return 'nie stwierdzono'
      return [list, i.abundance ? labelOf(ABUNDANCE, i.abundance).toLowerCase() : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'complex',
    label: 'Obecność kompleksu siedlisk nadrzecznych: 3220, 3230, 3240, 91E0',
    parameter: 'structure',
    description:
      'Obecność na odcinku rzeki kompleksu siedlisk świadczy o zachowanym ciągu sukcesyjnym i gwarantuje możliwość odnawiania się siedliska po wezbraniu. Należy podać, jakie siedliska są obecne, i ocenić, w jakim stopniu są zbliżone do wzorca (reprezentatywność).',
    help: `Co wybrać: dla każdego z czterech siedlisk ciągu sukcesyjnego na odcinku rzeki – czy jest i jak jest wykształcone. 3230 to samo siedlisko (zwykle „dobrze wykształcone”, skoro jest stanowisko).

Ciąg sukcesyjny na kamieńcach: inicjalna roślinność zielna kamieńców (3220) → zarośla wrześni (3230) → zarośla wierzbowe z wierzbą siwą (3240) → łęgi: olszynka karpacka lub łęgi wierzbowe (91E0).

Progi (tab. 2): minimum trzy typy siedlisk, dobrze wykształcone – FV; przynajmniej dwa typy, przynajmniej jeden dobrze wykształcony – U1; brak albo jedno z siedlisk – U2. Formularz liczy: FV, gdy dobrze wykształcone są co najmniej trzy; U1, gdy obecne są co najmniej dwa, w tym przynajmniej jedno dobrze; w pozostałych przypadkach U2. Podpowiedź pojawia się, gdy wybierzesz stan wszystkich czterech.

Dlaczego: po wezbraniu siedlisko odbudowuje się z sąsiednich stadiów – bez kompletu kamieniec nie ma się z czego odnowić. Sprawozdanie 2021: ok. 80% stanowisk FV, obniżenia przez zanik 3230 albo brak łęgów.`,
    thresholds: {
      FV: 'Minimum trzy typy siedlisk; dobrze wykształcone',
      U1: 'Przynajmniej dwa typy siedlisk, przynajmniej jedno z nich dobrze wykształcone',
      U2: 'Brak lub jedno z siedlisk',
    },
    inputs: [
      ...COMPLEX_HABITATS.map(
        (h): FieldDef => ({
          kind: 'select',
          name: h.name,
          group: 'Siedliska na odcinku rzeki',
          label: h.label,
          options: HABITAT_STATE,
          help: `Czy na odcinku rzeki ze stanowiskiem jest siedlisko ${h.code} i jak jest wykształcone (reprezentatywność względem wzorca).`,
        }),
      ),
      noteInput('Opis (opcjonalnie)', 'np. 3220, 3230, 3240, 91E0 – wszystkie wykształcone typowo', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy siedlisk.'),
    ],
    suggest: (i) => {
      const c = complexCounts(i)
      return c.filled === COMPLEX_HABITATS.length ? gradeComplex3230(c.present, c.good) : null
    },
    explain: (i) => {
      const c = complexCounts(i)
      if (!c.filled) return null
      return c.filled < COMPLEX_HABITATS.length
        ? `Wybrano ${c.filled} z 4 – uzupełnij pozostałe, żeby dostać podpowiedź.`
        : `Obecne: ${c.present} z 4, w tym dobrze wykształcone: ${c.good}.`
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const by = (s: string) => COMPLEX_HABITATS.filter((h) => i[h.name] === s).map((h) => h.code)
      const good = by('good')
      const poor = by('poor')
      const absent = by('absent')
      return [good.length ? `${good.join(', ')} – dobrze wykształcone` : '', poor.length ? `${poor.join(', ')} – słabo wykształcone` : '', absent.length ? `brak: ${absent.join(', ')}` : '']
        .filter(Boolean)
        .join('; ')
    },
  },
]

function thresholdsOf(o: GradedOption[]) {
  return {
    FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
    U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
    U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
  }
}

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu, z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie.

Dlaczego: kamieńce zmieniają się po każdym wezbraniu, więc następny obserwator może nie poznać miejsca – współrzędne to jedyny stały punkt odniesienia.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Białka 03',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – zwykle rzeka albo miejscowość z numerem, np. „Białka 03”, „Wróblówka 02”, „Rozstajne-Ryjak”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego odcinka rzeki, nawet gdy płaty zarośli się przesunęły.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'river',
    label: 'Rzeka / potok i odcinek',
    placeholder: 'np. Białka, ok. 1 km w górę od mostu Nowa Biała – Trybsz, lewy brzeg',
    help: `Ciek i odcinek koryta, który jest stanowiskiem. Za stanowisko 3230 uznaje się odcinek koryta (proponowana długość ok. 0,5–1 km, zależnie od warunków lokalnych) wraz z kamieńcami, na którym stwierdzono zarośla wrześni. W jego granicach wybiera się płaty zarośli i lokalizuje transekt.

Dlaczego: po wezbraniach zarośla pojawiają się w innych miejscach tego samego odcinka – stanowisko to odcinek rzeki, nie konkretny płat.`,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    defaultValue: 'Salici-Myricarietum',
    placeholder: 'np. Salici-Myricarietum (Myricario-Salicetum)',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Dla 3230: klasa Salicetea purpureae, rząd Salicetalia purpureae, związek Salicion elaeagni, zespół Salici-Myricarietum (w karcie z przewodnika: Myricario-Salicetum) – zarośla wierzbowe z wrześnią pobrzeżną.

Uwaga: gdy w płacie wierzby osiągają większe zwarcie niż września i dodatkowo ją ocieniają, zbiorowisko to już zarośla wierzbowo-wrześniowe 3240. Pojedyncze krzewy wrześni bez zarośli (np. Pieniny, Bieszczady) to nie jest 3230.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Położenie na kamieńcach, struktura i wysokość zarośli, udział wierzb, odnowienie, ślady wezbrań, regulacja koryta, pobór żwiru.',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• położenie: rzeka, brzeg, kamieńce (odkryte, szerokie, podzielone ramionami rzeki), wyspy w nurcie;
• zarośla: płaty czy rozproszone krzewy, wysokość, wierzby (siwa, purpurowa), olsza szara, siewki wrześni;
• dynamika: ślady ostatnich wezbrań, nowe i zanikające kamieńce;
• antropopresja: regulacja i umocnienia brzegów, progi, pobór żwiru, śmieci, biwakowanie.

Za stanowisko przyjmuje się odcinek koryta z kamieńcami i płatami zarośli wrześni, w którym leży transekt.`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Łączna powierzchnia płatów zarośli wrześni na stanowisku (odcinku koryta), w hektarach – 0,5 ha w karcie z przewodnika. Oszacuj w terenie albo z ortofotomapy (optymalnie 1:2000).',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „PLH120024 Dolina Białki”. Brak – „brak”.',
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
    hint: 'Jeden transekt 200×10 m przez najważniejsze skupienia zarośli wrześni.',
    help: `Na każdym stanowisku wyznacza się jeden transekt o długości 200 m i szerokości 10 m, tak by obejmował najważniejsze skupienia zarośli wrześni. Karta z przewodnika ma prostokąt 20×100 m – ta sama powierzchnia (20 arów).

Sprawozdanie 2021 zwraca uwagę, że przy siedliskach zależnych od wezbrań utrzymanie stałego położenia i długości transektu bywa niemożliwe – opisz zmiany w uwagach.`,
    warn: (v) => {
      const m = String(v ?? '').replace(',', '.').match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/)
      if (!m) return null
      const a = Number(m[1]) * Number(m[2])
      return Math.abs(a - 2000) < 1 ? null : `${plNum(a)} m² – metodyka zakłada transekt 200×10 m (2000 m²). Opisz odstępstwo w uwagach.`
    },
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    help: 'Wysokość nad poziomem morza transektu, z GPS albo mapy. Można wpisać zakres („540–545”). Września pobrzeżna rośnie w Karpatach od ok. 380–400 m do ok. 1000 m n.p.m.',
    warn: (v) => {
      const n = num(String(v ?? '').split(/[–-]/)[0])
      return n !== undefined && (n < 350 || n > 1050) ? `${plNum(n)} m n.p.m. – poza znanym zakresem wrześni (ok. 380–1000 m). Sprawdź.` : null
    },
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 15.07.2021',
    required: true,
    hint: 'Najlepiej czerwiec–sierpień; nie tuż po wezbraniu.',
    help: `Dzień badań terenowych. Optymalnie czerwiec–sierpień: roślinność zielna jest rozwinięta i część gatunków kwitnie. Później część gatunków trudno oznaczyć. W Karpatach wezbrania przypadają zwykle na przełom czerwca i lipca – przy wysokiej wodzie badań nie da się zrobić, a tuż po wezbraniu zarówno runo, jak i krzewy mogą być zniszczone.

Badania powtarza się co 6 lat; między nimi trzeba odnotowywać terminy większych powodzi (pole niżej). Sprawozdanie 2021: prace czerwiec–sierpień; wcześniejsze terminy wrześniowe uznano za wiarygodne ze względu na nietypową pogodę.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 6 && m <= 8 ? null : 'Termin poza optymalnym oknem (czerwiec–sierpień). Część gatunków runa może być już nie do rozpoznania.'
    },
  },
  {
    kind: 'textarea',
    name: 'floods',
    label: 'Większe wezbrania od poprzedniego badania',
    rows: 2,
    placeholder: 'np. lipiec 2018 – duże wezbranie, przebudowa kamieńców; brak danych',
    help: `Terminy większych powodzi i wezbrań między kolejnymi obserwacjami (metodyka każe je odnotowywać). Źródło: obserwacje, mieszkańcy, dane IMGW, zarządca rzeki.

Dlaczego: zarośla wrześni to krótkotrwałe stadium sukcesji, odnawiające się przy kolejnych wezbraniach. Bez tej informacji nie da się odróżnić skutków powodzi (zniszczenie i odnowienie – naturalne) od skutków regulacji czy poboru żwiru.`,
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcia fitosocjologiczne: 3 (początek, środek, koniec transektu) ----------

const r7120 = methodology7120.releves.fields
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', {
    help: 'Współrzędne GPS środka zdjęcia. Zdjęcia robi się na początku, w środku i na końcu transektu.',
  }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach (GPS).' }),
  pickField(r7120, 'area', {
    defaultValue: 25,
    help: 'Powierzchnia zdjęcia w m². Metodyka nie podaje wielkości; w karcie z przewodnika 25 m² (5×5 m), a przy dużym płacie 100 m² (10×10 m).',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Kamieniec jest zwykle płaski – 0°.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, SW). Dla powierzchni płaskiej zostaw puste albo wpisz kierunek jak w karcie.' }),
  layerField('coverA', 'Warstwa A – drzewa: procent powierzchni zdjęcia pod koronami drzew. Na kamieńcu zwykle 0.\n\nDlaczego: drzewa nad zaroślami to ocienienie i koniec wrześni.', { groupCols: 4 }),
  layerField('coverB', 'Warstwa B – krzewy: procent powierzchni zdjęcia pod krzewami wrześni, wierzb i olszy szarej.\n\nDlaczego: to właśnie zarośla 3230 – ich zwarcie mówi o etapie rozwoju płatu.'),
  layerField('coverC', 'Warstwa C – zielna: procent powierzchni zdjęcia pokryty przez rośliny zielne. Zwarcie roślinności na kamieńcach zwykle 20–30%, czasem do 50–60%.\n\nDlaczego: gęste runo z gatunkami łąkowymi i ekspansywnymi to znak utrwalania się kamieńca.'),
  layerField('coverD', 'Warstwa D – mszysta. Na kamieńcach zwykle brak = 0.'),
  layerField('heightA', 'Warstwa A – typowa wysokość drzew, w metrach. Brak warstwy = puste.'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów, w metrach (września zwykle 1–1,5 m, maksymalnie 2–2,5 m).'),
  layerField('heightC', 'Warstwa C – typowa wysokość roślin zielnych, w centymetrach.'),
  layerField('heightD', 'Warstwa D – typowa wysokość warstwy mszystej, w centymetrach. Zwykle brak.'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Salici-Myricarietum',
    help: 'Jednostka fitosocjologiczna zdjęcia, zwykle zespół Salici-Myricarietum (Myricario-Salicetum).',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w poletku z ilościowością w skali Braun-Blanqueta (r, +, 1–5): warstwa B – krzewy (września, wierzby), C – zielna. Warstwa podpowiada się sama po wyborze gatunku.',
  }),
]

export const methodology3230: Methodology = {
  code: '3230',
  name: 'Zarośla wrześni na kamieńcach i żwirowiskach górskich potoków',
  source:
    'Perzanowska J. 2012, 3230 Zarośla wrześni na kamieńcach i żwirowiskach górskich potoków (Salici-Myricarietum część – z przewagą wrześni), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 180–192 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2009–2011, 2015–2018 i 2020–2021',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj 3 zdjęcia fitosocjologiczne: na początku, w środku i na końcu transektu (położenie i wysokość z GPS). Ilościowość w skali Braun-Blanqueta; warstwy B (krzewy: września, wierzby) i C (zielna).',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Możliwości ochrony siedliska i utrzymania go w stanie niepogorszonym, przy analizie czynników realnie oddziałujących na siedlisko w najbliższej przyszłości. Pod uwagę bierze się aktualny stan ochrony, obecność na obszarze chronionym i reżim ochrony, prace przeciwpowodziowe i inne użytkowanie gospodarcze.',
    help: `O perspektywach decyduje głównie naturalność koryta i swobodna praca rzeki – wezbrania niszczą zarośla, ale też tworzą nowe kamieńce, na których września się odnawia. Wpływ ludzi bezpośrednio na zarośla (śmieci, biwaki) ma mniejsze znaczenie, o ile nie narusza tych procesów.

Najważniejsze zagrożenia: regulacja i umacnianie koryt („lobby przeciwpowodziowe”), progi i zabudowa poprzeczna, pobór żwiru i kamienia, zabudowa terasy zalewowej, gatunki obce (rdestowiec, barszcz Sosnowskiego, niecierpek gruczołowaty), a przy braku wezbrań – sukcesja w stronę zarośli wierzbowych (3240) i łęgów.

Sprawozdanie 2021: pogorszenie perspektyw na wszystkich stanowiskach z regulacją rzeki; 63% stanowisk FV.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  // Słownik oddziaływań 2011 – kody notowane w sprawozdaniach 2016–2018 i 2021 dla 3230.
  impactCodes: [
    { code: 'A04', name: 'Wypas' },
    { code: 'A05.01', name: 'Hodowla zwierząt' },
    { code: 'C01.01', name: 'Wydobywanie piasku i żwiru' },
    { code: 'C01.01.02', name: 'Usuwanie materiału z plaż' },
    { code: 'D01', name: 'Drogi, ścieżki i drogi kolejowe' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'E01.03', name: 'Zabudowa rozproszona' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'E03.01', name: 'Pozbywanie się odpadów z gospodarstw domowych / obiektów rekreacyjnych' },
    { code: 'E03.02', name: 'Pozbywanie się odpadów przemysłowych' },
    { code: 'F02.03', name: 'Wędkarstwo' },
    { code: 'G01.08', name: 'Inne rodzaje sportu i aktywnego wypoczynku' },
    { code: 'G02.08', name: 'Kempingi i karawaningi' },
    { code: 'G02.09', name: 'Obserwowanie przyrody' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'I01', name: 'Nierodzime gatunki zaborcze' },
    { code: 'J02.03', name: 'Regulowanie (prostowanie) koryt rzecznych i zmiana ich przebiegu' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K01.02', name: 'Zamulenie' },
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
            hint: 'Np. kompleks siedlisk nadrzecznych 3220, 3240, 91E0; ptaki kamieńców.',
            help: 'Wartości przyrodnicze stanowiska poza samymi zaroślami wrześni: kompleks siedlisk nadrzecznych (3220, 3240, 91E0, 91F0), naturalnie meandrujące koryto, ptaki kamieńców (sieweczka rzeczna, brodziec piskliwy, pliszka górska), rzadkie gatunki roślin. Brak informacji – „Nie stwierdzono” albo „Nie pozyskano danych”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            help: 'Jakie działania ochronne wykonano i z jakim skutkiem, oraz co proponujesz. Typowe dla 3230: pozostawienie naturalnego koryta (ochrona bierna), rezygnacja z regulacji, zabudowy poprzecznej i zwężania koryt, kontrola nielegalnego poboru żwiru i kamienia, usuwanie gatunków obcych (rdestowiec, barszcz Sosnowskiego, niecierpek gruczołowaty), likwidacja dzikich wysypisk. Koryta są w zarządzie wód (dawniej RZGW Kraków i Gliwice). Brak działań – „Brak”.',
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
            help: 'Karta z przewodnika podaje przy ocenie ogólnej udział powierzchni siedliska o różnym stanie zachowania na stanowisku (w przykładzie FV 100%, U1 0%, U2 0%). Trzy liczby powinny dać razem 100%.',
          },
          {
            kind: 'number',
            name: 'shareU1',
            group: 'Udział powierzchni siedliska w stanie FV / U1 / U2 (transekt)',
            label: 'Udział powierzchni siedliska w stanie U1',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Procent powierzchni siedliska na stanowisku w stanie niezadowalającym (U1).',
          },
          {
            kind: 'number',
            name: 'shareU2',
            group: 'Udział powierzchni siedliska w stanie FV / U1 / U2 (transekt)',
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

  speciesCatalog: SPECIES_3230.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer3230(s) })),
  speciesInfo: (name) => {
    const e = findSpecies3230(name)
    return e ? GROUP_LABELS_3230[e.group] : undefined
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator3230 = (id: string) => {
  const i = methodology3230.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 3230`)
  return i
}
