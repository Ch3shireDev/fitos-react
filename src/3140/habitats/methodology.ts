// Metodyka 3140 (twardowodne oligo- i mezotroficzne zbiorniki z podwodnymi łąkami ramienic Charetea) jako dane.
// Źródło: przewodnik metodyczny GIOŚ, Monitoring siedlisk przyrodniczych, cz. IV, rozdz. 3140, s. 120–139 (tab. 1 i 2,
// przykładowa karta Jezioro Budzisławskie 2013), z erratą „najgorszy decyduje” (sprawozdanie 2016–2018, pkt 9) i praktyką
// oceny ze sprawozdań z monitoringu 2013–2014, 2016–2018 i 2023–2025.
// Siedlisko wodne: transekt prostopadły do brzegu (do ok. 300 m, tyle, ile sięga roślinność), pomiary w najgłębszym
// miejscu jeziora (PAR, pH, przewodność, plankton). Progi dwóch wskaźników głębokościowych i struktury zależą od tego,
// czy jezioro jest głębokie (>5 m), czy płytkie – stąd „Typ jeziora” i „Głębokość maksymalna” w zakładce Stanowisko.
// Z modułu leśnego brane są tylko klocki generyczne (choiceIndicator, selectInput, speciesInput, pickField) – nic leśnego.
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { choiceIndicator, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import { GROUP_LABELS_3140, SPECIES_3140, acceptedName3140, defaultLayer3140, findSpecies3140, isCharophyte3140 } from './species'

// ---------- typ jeziora ----------

export type LakeType = 'deep' | 'shallowLarge' | 'shallow'

export const LAKE_TYPES: SelectOption[] = [
  { value: 'deep', label: 'Głębokie (głębokość maksymalna >5 m)' },
  { value: 'shallowLarge', label: 'Płytkie (≤5 m) o dużej powierzchni (ok. 100 ha i więcej)' },
  { value: 'shallow', label: 'Płytkie (≤5 m)' },
]

/** Typ jeziora z zakładki Stanowisko; bez wyboru – z głębokości maksymalnej (>5 m = głębokie). */
export function lakeTypeOf(site: InputValues | undefined): LakeType | undefined {
  const t = site?.lakeType
  if (t === 'deep' || t === 'shallowLarge' || t === 'shallow') return t
  const d = num(site?.lakeMaxDepth)
  if (d === undefined) return undefined
  return d > 5 ? 'deep' : 'shallow'
}

/** Struktura roślinności: płytkie jeziora o dużej powierzchni oceniane jak głębokie (tab. 2). */
const structureAsDeep = (t: LakeType | undefined) => t === 'deep' || t === 'shallowLarge'

// ---------- progi liczbowe (tab. 2) ----------

/** Jeziora płytkie – pokrycie dna przez łąki ramienicowe: >50% FV, 10–50% U1, <10% U2. */
export const gradeCoverShallow3140 = (pct: number): Grade => (pct > 50 ? 'FV' : pct >= 10 ? 'U1' : 'U2')
/** Liczba gatunków ramienic: ≥4 FV, 2–3 U1, 1 (i 0) U2. */
export const gradeCharophyteCount3140 = (n: number): Grade => (n >= 4 ? 'FV' : n >= 2 ? 'U1' : 'U2')

/**
 * Maksymalna głębokość występowania łąk ramienicowych.
 * Głębokie: >5 m FV, 5–2,5 m U1, <2,5 m U2. Płytkie: jezioro przerośnięte ramienicami (do dna) FV,
 * <2,5 do 1 m U1, 0,5–1 m U2 (jeśli to nie głębokość maks. jeziora). Luki tab. 2: płytkie 2,5 m – dno → U1, <0,5 m → U2.
 */
export function gradeMaxDepth3140(depth: number, type: LakeType, lakeMax?: number): Grade | null {
  if (type === 'deep') return depth > 5 ? 'FV' : depth >= 2.5 ? 'U1' : 'U2'
  if (depth < 1) return 'U2'
  if (lakeMax === undefined) return null
  return depth >= lakeMax ? 'FV' : 'U1'
}

/**
 * Zasięg strefy świetlnej (1% PAR). Głębokie: >15 m FV, 15–10 m U1, <10 m U2. Płytkie: do dna FV,
 * <5–2,5 m albo poniżej głębokości maks. U1, <2,5 m (jeśli to nie głębokość maks.) U2.
 */
export function gradeLightZone3140(depth: number, type: LakeType, lakeMax?: number): Grade | null {
  if (type === 'deep') return depth > 15 ? 'FV' : depth >= 10 ? 'U1' : 'U2'
  if (depth < 2.5) return 'U2'
  if (lakeMax === undefined) return null
  return depth >= lakeMax ? 'FV' : 'U1'
}

/**
 * Odczyn względem poprzedniego badania: wzrost do 0,3 pH – „bez istotnych zmian” (FV), do 1,0 – U1, ponad 1,0 – U2.
 * Spadek pH nie obniża oceny (tab. 2 mówi tylko o wzroście). Bez poprzedniego wyniku: pH 7,0–8,5 FV (zakres z tab. 1),
 * poza nim brak podpowiedzi – ocenia ekspert (2024: XX przy braku danych porównawczych).
 */
export const PH_STABLE = 0.3
export function gradePH3140(ph: number, previous?: number): Grade | null {
  if (previous !== undefined) {
    const rise = Math.round((ph - previous) * 100) / 100
    return rise <= PH_STABLE ? 'FV' : rise <= 1 ? 'U1' : 'U2'
  }
  return ph >= 7 && ph <= 8.5 ? 'FV' : null
}

/**
 * Przewodność względem poprzedniego badania: wzrost do 5% – „bez istotnych zmian” (FV), do 20% – U1, ponad 20% – U2.
 * Bez poprzedniego wyniku brak podpowiedzi (tab. 2 ocenia tylko zmianę; 2013–2014: XX przy braku porównania).
 */
export const EC_STABLE = 5
export function gradeConductivity3140(ec: number, previous?: number): Grade | null {
  if (previous === undefined || previous <= 0) return null
  const rise = Math.round(((ec - previous) / previous) * 1000) / 10
  return rise <= EC_STABLE ? 'FV' : rise <= 20 ? 'U1' : 'U2'
}

const worse = (a: Grade | null, b: Grade | null): Grade | null => {
  if (a === null || b === null) return a ?? b
  const order: Grade[] = ['FV', 'U1', 'U2', 'XX']
  return order[Math.max(order.indexOf(a), order.indexOf(b))]
}

// ---------- gatunki ----------

/** Unikalne ramienice z listy (synonimy liczone raz) i nazwy spoza ramienic. */
export function charophytesOf(value: unknown): { taxa: string[]; others: string[] } {
  const names = speciesRows(value)
    .map((r) => r.name?.trim())
    .filter((n): n is string => Boolean(n))
  const taxa = [...new Set(names.filter(isCharophyte3140).map(acceptedName3140))]
  const others = names.filter((n) => !isCharophyte3140(n))
  return { taxa, others }
}

/** 1 gatunek, 2–4 gatunki, 5+ gatunków (ale 12–14 gatunków). */
export const speciesWord = (n: number) =>
  n === 1 ? 'gatunek' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'gatunki' : 'gatunków'

function charophyteCount(i: InputValues): { n?: number; from?: 'typed' | 'list' } {
  const typed = num(i.count)
  if (typed !== undefined) return { n: typed, from: 'typed' }
  const { taxa } = charophytesOf(i.species)
  return speciesRows(i.species).some((r) => r.name?.trim()) ? { n: taxa.length, from: 'list' } : {}
}

// ---------- opcje selektów ----------

const AREA_TREND: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'decreaseSmall', label: 'Spadek powierzchni siedliska nie większy niż 20%', grade: 'U1' },
  { value: 'decreaseLarge', label: 'Wyraźny spadek powierzchni (ponad 20%) w porównaniu z wcześniejszymi badaniami lub literaturą', grade: 'U2' },
]
const AREA_UNKNOWN: SelectOption = { value: 'unknown', label: 'Nie da się określić tendencji (pierwsze badanie, wahania poziomu wody)' }

const CHARA_TREND: (GradedOption | SelectOption)[] = [
  { value: 'stable', label: 'Powierzchnia łąk bez zmian lub większa niż w poprzednim badaniu', grade: 'FV' },
  { value: 'decreaseSmall', label: 'Spadek powierzchni łąk ramienicowych nie większy niż 20%', grade: 'U1' },
  { value: 'decreaseLarge', label: 'Znaczący spadek powierzchni łąk ramienicowych (ponad 20%)', grade: 'U2' },
  { value: 'first', label: 'Pierwsze badanie – ocena ekspercka (skład syntaksonomiczny i układ stref)' },
]
const CHARA_TREND_GRADE: Record<string, Grade> = { stable: 'FV', decreaseSmall: 'U1', decreaseLarge: 'U2' }

const EXPANSIVE: GradedOption[] = [
  { value: 'absent', label: 'Brak gatunków ekspansywnych (albo pojedyncze, bez wpływu na łąki ramienicowe)', grade: 'FV' },
  { value: 'upTo10', label: 'Gatunki ekspansywne zajmują do 10% powierzchni', grade: 'U1' },
  { value: 'over10', label: 'Gatunki ekspansywne zajmują powyżej 10% powierzchni', grade: 'U2' },
]
const ALIENS: GradedOption[] = [
  { value: 'absent', label: 'Brak gatunków obcych', grade: 'FV' },
  { value: 'single', label: 'Gatunek lub gatunki obce jako pojedyncze osobniki', grade: 'U1' },
  { value: 'numerous', label: 'Gatunek lub gatunki obce występują licznie', grade: 'U2' },
]
const PHYTO: GradedOption[] = [
  { value: 'greens', label: 'Dominacja zielenic lub innych grup z wyjątkiem sinic', grade: 'FV' },
  { value: 'codominance', label: 'Współdominacja sinic i zielenic', grade: 'U1' },
  { value: 'cyano', label: 'Dominacja lub zakwity sinic (np. Microcystis, Woronichinia, Anabaena, Aphanizomenon)', grade: 'U2' },
]
const ZOO: GradedOption[] = [
  { value: 'diverse', label: 'Duże zróżnicowanie taksonomiczne, przewaga dużych form filtratorów (wioślarek)', grade: 'FV' },
  { value: 'small', label: 'Drobne wioślarki i wrotki, gatunki eutroficzne 5–50% zespołu', grade: 'U1' },
  { value: 'rotifers', label: 'Dominacja wrotków (Keratella cochlearis f. tecta, Trichocerca), gatunki eutroficzne >50%', grade: 'U2' },
]
const NOT_EXAMINED: SelectOption = { value: 'notExamined', label: 'Nie badano (brak próby)' }

/**
 * Select z opcjami z oceną i bez niej (opcja bez oceny = brak podpowiedzi, ocenę wybiera ekspert).
 * selectInput z modułu leśnego dopisałby opcji bez oceny „XX”, a tu XX nie jest automatyczne.
 */
function mixedSelect(name: string, label: string, options: (GradedOption | SelectOption)[], help: string): FieldDef {
  return {
    kind: 'select',
    name,
    label,
    options: options.map(({ value, label: l }) => ({ value, label: l })),
    required: true,
    help: [
      help,
      `Wybierz opis najbliższy temu, co widać:\n${options.map((o) => `• ${o.label} – ${'grade' in o ? o.grade : 'bez podpowiedzi, ocenę wybierasz sam'}`).join(',\n')}.`,
      'Pełne wyjaśnienie wskaźnika jest pod „?” przy jego nazwie.',
    ].join('\n\n'),
  }
}

const MEASURE_SPOT = `Gdzie: w najgłębszym, zwykle centralnym miejscu jeziora (albo najgłębszej części wydzielonego obszaru), najlepiej poza strefą łąk ramienicowych, w warstwie powierzchniowej 0,5–1 m.`

// ---------- wskaźniki ----------

const lakeHint = (ctx?: IndicatorContext) => {
  const t = lakeTypeOf(ctx?.site)
  return t ? labelOf(LAKE_TYPES, t).toLowerCase() : undefined
}

const NO_LAKE_TYPE = 'Wybierz „Typ jeziora” albo wpisz „Głębokość maksymalną jeziora” w zakładce Stanowisko – progi zależą od tego, czy jezioro jest głębokie.'

const plankton = (s: { id: string; label: string; options: GradedOption[]; description: string; help: string; listLabel: string; listHelp: string }): IndicatorDef => {
  const base = choiceIndicator({ id: s.id, label: s.label, description: s.description, help: s.help, options: s.options, inputLabel: s.label })
  const all = [...s.options, NOT_EXAMINED]
  return {
    ...base,
    inputs: [
      selectInput(s.label, [...s.options, { ...NOT_EXAMINED, grade: 'XX' }]),
      { kind: 'textarea', name: 'taxa', label: s.listLabel, rows: 4, help: s.listHelp },
    ],
    suggest: (i) => (i.choice === NOT_EXAMINED.value ? 'XX' : (s.options.find((o) => o.value === i.choice)?.grade ?? null)),
    describe: (i) => String(i.taxa ?? '').trim() || labelOf(all, i.choice),
  }
}

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description: 'Zmiana powierzchni siedliska (jeziora z łąkami ramienicowymi albo jego wydzielonej części) w porównaniu z wcześniejszymi badaniami lub danymi z literatury.',
    help: `Co wybrać: czy powierzchnia siedliska się zmienia – porównaj z poprzednią kartą, ortofotomapą, danymi archiwalnymi albo literaturą. Bez zmian lub wzrost – FV, spadek do 20% – U1, wyraźny spadek ponad 20% – U2.

Gdy tendencji nie da się określić (pierwsze badanie, silne wahania poziomu wody), wybierz „Nie da się określić” – formularz nie podpowie oceny i wybierasz ją sam. Tak jest w przykładowej karcie (Jezioro Budzisławskie): „Powierzchnia ulega bardzo zmianom. Brak możliwości określenia tendencji zmian poziomów wody” – ekspert dał U1.

Uwaga ze sprawozdania 2016–2018: powierzchnia jeziora to nie powierzchnia siedliska. Pogarszanie się jakości wody nie zmienia wielkości jeziora, ale zmniejsza obszar, na którym ramienice mogą rosnąć – dobrą miarą kurczenia się siedliska jest spadek maksymalnej głębokości łąk ramienicowych. Weź to pod uwagę, zanim dasz FV „bo jezioro jest takie samo”.`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się',
      U1: 'Spadek powierzchni siedliska nie większy niż 20%',
      U2: 'Wyraźny spadek powierzchni siedliska (ponad 20%) w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze',
    },
    inputs: [
      mixedSelect('trend', 'Zmiana powierzchni siedliska', [...AREA_TREND, AREA_UNKNOWN], 'Porównanie z poprzednim badaniem albo literaturą.'),
      { kind: 'number', name: 'areaHa', label: 'Powierzchnia (opcjonalnie)', unit: 'ha', min: 0, help: 'Powierzchnia siedliska na stanowisku, jeśli ją znasz – trafi do pola „wartość”. Opcjonalne.' },
      { kind: 'textarea', name: 'note', label: 'Opis (opcjonalnie)', rows: 2, help: 'Krótki opis zmian, np. „Powierzchnia ulega bardzo zmianom. Brak możliwości określenia tendencji zmian poziomów wody.” Gdy wpiszesz opis, to on trafia do pola „wartość”.' },
    ],
    suggest: (i) => AREA_TREND.find((o) => o.value === i.trend)?.grade ?? null,
    describe: (i) => {
      const note = String(i.note ?? '').trim()
      if (note) return note
      const ha = num(i.areaHa)
      return [ha !== undefined ? `${plNum(ha)} ha` : '', labelOf([...AREA_TREND, AREA_UNKNOWN], i.trend)].filter(Boolean).join('; ')
    },
  },
  {
    id: 'charaStructure',
    label: 'Struktura roślinności ramienicowej',
    parameter: 'structure',
    cardinal: true,
    description:
      'Stopień pokrycia dna przez łąki ramienicowe (analiza w transekcie): występowanie zbiorowisk z klasy Charetea fragilis, ich stan, różnorodność i układ stref w litoralu.',
    help: `Co wpisać zależy od typu jeziora (zakładka Stanowisko):

• Jeziora głębokie (>5 m) oraz płytkie o dużej powierzchni (ok. 100 ha): porównaj powierzchnię zajętą przez łąki ramienicowe z poprzednim badaniem. Bez zmian lub większa – FV, spadek do 20% – U1, spadek ponad 20% – U2. Przy pierwszym badaniu określ precyzyjnie skład syntaksonomiczny łąk i zasięg strefy litoralu – ocenę dajesz sam (2013–2014: pełna sekwencja zbiorowisk od płycizn po głęboki fitolitoral = FV; jedno zbiorowisko, niepełny układ = U1/U2).
• Jeziora płytkie (≤5 m): wpisz procent dna pokryty przez łąki ramienicowe. >50% – FV, 10–50% – U1, <10% – U2.

W opisie (pole „wartość”) zapisz układ stref i zbiorowiska, np. „Jezioro o typowym pasowym układzie zbiorowisk ramienic, z bardzo głębokim zasięgiem litoralu 15,5 m”. Przesunięty transekt – nowe współrzędne w zakładce Stanowisko.

Wskaźnik kardynalny. Najsilniej reaguje na eutrofizację: w 2024 r. właściwy tylko na 48% stanowisk (2013–2014: 60%).`,
    thresholds: {
      FV: 'Jeziora głębokie: powierzchnia łąk bez zmian lub większa (pierwsze badanie: skład syntaksonomiczny i zasięg litoralu); płytkie: pokrycie dna >50%',
      U1: 'Jeziora głębokie: spadek powierzchni łąk nie większy niż 20%; płytkie: pokrycie dna 10–50%',
      U2: 'Jeziora głębokie: znaczący spadek powierzchni łąk (ponad 20%); płytkie: pokrycie dna <10%',
    },
    inputs: [
      { ...mixedSelect('trend', 'Zmiana powierzchni łąk (jeziora głębokie i duże płytkie)', CHARA_TREND, 'Dla jezior głębokich i dużych płytkich. W jeziorach płytkich zostaw puste i wpisz pokrycie dna.'), required: false },
      { kind: 'number', name: 'cover', label: 'Pokrycie dna przez łąki ramienicowe', unit: '%', min: 0, max: 100, help: 'Procent dna (w transekcie albo całym płytkim jeziorze) pokryty przez łąki ramienicowe. Wymagany w jeziorach płytkich; w głębokich – opcjonalny, trafia do opisu.' },
      { kind: 'textarea', name: 'note', label: 'Opis struktury (opcjonalnie)', rows: 3, help: 'Układ stref i zbiorowisk w litoralu, zasięg, uwagi. Gdy wpiszesz opis, to on trafia do pola „wartość”.' },
    ],
    suggest: (i, ctx) => {
      const t = lakeTypeOf(ctx?.site)
      if (!t) return null
      if (structureAsDeep(t)) return CHARA_TREND_GRADE[String(i.trend)] ?? null
      const c = num(i.cover)
      return c === undefined ? null : gradeCoverShallow3140(c)
    },
    explain: (i, ctx) => {
      const t = lakeTypeOf(ctx?.site)
      if (!t) return NO_LAKE_TYPE
      if (structureAsDeep(t)) return i.trend === 'first' ? `Jezioro ${lakeHint(ctx)}: pierwsze badanie – ocenę wybierasz sam.` : `Jezioro ${lakeHint(ctx)}: ocena z porównania powierzchni łąk.`
      return `Jezioro ${lakeHint(ctx)}: ocena z pokrycia dna (>50% FV, 10–50% U1, <10% U2).`
    },
    describe: (i) => {
      const note = String(i.note ?? '').trim()
      if (note) return note
      const c = num(i.cover)
      return [c !== undefined ? `Pokrycie dna przez łąki ramienicowe ${plNum(c)}%` : '', i.trend && i.trend !== 'first' ? labelOf(CHARA_TREND, i.trend) : '']
        .filter(Boolean)
        .join('; ')
    },
  },
  {
    id: 'charophytes',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description: 'Liczba gatunków ramienic w jeziorze. Obecność jednego lub kilku gatunków (2–3), szczególnie w jeziorach głębokich, może świadczyć o niekorzystnych zmianach warunków świetlnych i troficznych.',
    help: `Co wpisać: wszystkie gatunki ramienic stwierdzone w transekcie (i w jeziorze). Formularz liczy ramienice z listy – synonimy (Chara fragilis = C. globularis, C. delicatula = C. virgata, Stuckenia = Potamogeton pectinatus) raz. Rośliny naczyniowe na tej liście się nie liczą; wpisz je w „Gatunkach wskazujących na degenerację” albo w opisie stanowiska. Możesz też wpisać liczbę wprost – ma pierwszeństwo przed listą.

Progi: ≥4 gatunki – FV, 2–3 – U1, 1 gatunek – U2 (brak ramienic też U2).

Praktyka monitoringu: ocenę obniżano także przy drastycznym spadku liczby gatunków względem poprzednich badań (np. 1 z 4–5 dawniej stwierdzonych → U2) – to ocena ekspercka, formularz liczy tylko bieżącą listę. Ramienice trudno oznaczyć w terenie: pobierz próbkę do woreczka strunowego, przewieź w lodówce i oznacz w laboratorium.

Wskaźnik kardynalny. Średnio 5 gatunków na jezioro (2013–2014), rekord 12 (Niedzięgiel).`,
    thresholds: { FV: '≥4 gatunki ramienic', U1: '2–3 gatunki', U2: '1 gatunek' },
    inputs: [
      speciesInput('Gatunki ramienic', 'Wszystkie ramienice stwierdzone w transekcie i jeziorze. Pokrycie opcjonalne.', true),
      { kind: 'number', name: 'count', label: 'Liczba gatunków (opcjonalnie)', unit: 'gat.', min: 0, help: 'Liczba gatunków ramienic wpisana wprost – ma pierwszeństwo przed liczeniem z listy. Zostaw puste, żeby formularz policzył listę.' },
    ],
    suggest: (i) => {
      const { n } = charophyteCount(i)
      return n === undefined ? null : gradeCharophyteCount3140(n)
    },
    explain: (i) => {
      const { n, from } = charophyteCount(i)
      if (n === undefined) return null
      return from === 'typed' ? `Liczba wpisana wprost: ${n}.` : `Ramienic na liście: ${n} ${speciesWord(n)}.`
    },
    warn: (i) => {
      const { others, taxa } = charophytesOf(i.species)
      const typed = num(i.count)
      if (others.length) return `Na liście są gatunki spoza ramienic (${others.join(', ')}) – nie liczą się do wskaźnika.`
      if (typed !== undefined && taxa.length && typed !== taxa.length) return `Wpisano ${typed}, a na liście jest ${taxa.length} ${speciesWord(taxa.length)} ramienic.`
      return null
    },
    describe: (i) => {
      const { n } = charophyteCount(i)
      const names = speciesRows(i.species)
        .map((r) => r.name?.trim())
        .filter(Boolean)
      if (n === undefined) return ''
      return `Łącznie stwierdzono ${n} ${speciesWord(n)} ramienic.${names.length ? ` Lista gatunków: ${names.join(', ')}` : ''}`
    },
  },
  {
    id: 'degeneration',
    label: 'Gatunki wskazujące na degenerację siedliska, w tym obce gatunki inwazyjne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Występowanie ekspansywnych gatunków rodzimych i/lub gatunków obcych geograficznie oraz stopień zajęcia powierzchni siedliska przez gatunki ekspansywne, w odniesieniu do wcześniej określonego transektu lub całej powierzchni zbiornika.',
    help: `Co wpisać: gatunki ekspansywne (rogatek sztywny Ceratophyllum demersum, rdestnica grzebieniasta Potamogeton pectinatus, wywłócznik kłosowy Myriophyllum spicatum, glony nitkowate) i obce (moczarka kanadyjska Elodea canadensis, moczarka delikatna E. nuttallii) z pokryciem, a potem dwa wybory:
• gatunki ekspansywne: brak – FV, do 10% powierzchni – U1, ponad 10% – U2;
• gatunki obce: brak – FV, pojedyncze osobniki – U1, liczne – U2.
Podpowiedź to gorszy z dwóch wyborów.

Interpretacja (przykładowa karta): pojedyncze osobniki gatunku ekspansywnego bez wpływu na łąki ramienicowe ekspert ocenił na FV („Potamogeton pectinatus, bez wpływu na stan łąk ramienicowych”) – stąd opcja „albo pojedyncze, bez wpływu”. Gdy gatunek ma już znaczny udział w litoralu, wybierz „do 10%”.

Wkraczanie gatunków ekspansywnych to najczęściej objaw eutrofizacji. Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Brak gatunków ekspansywnych i obcych',
      U1: 'Gatunki ekspansywne zajmują do 10% powierzchni; gatunek lub gatunki obce inwazyjne obecne jako pojedyncze osobniki',
      U2: 'Gatunki ekspansywne zajmują powyżej 10% powierzchni; gatunek lub gatunki obce inwazyjne występują licznie',
    },
    inputs: [
      speciesInput('Gatunki ekspansywne i obce', 'Gatunki wskazujące na degenerację z pokryciem (% powierzchni transektu albo siedliska). Pusta lista – nie stwierdzono.'),
      selectInput('Gatunki ekspansywne', EXPANSIVE, undefined, 'expansive'),
      selectInput('Gatunki obce inwazyjne', ALIENS, undefined, 'aliens'),
      { kind: 'textarea', name: 'note', label: 'Opis (opcjonalnie)', rows: 2, help: 'Dopisek do listy gatunków w polu „wartość”, np. „bez wpływu na stan łąk ramienicowych”.' },
    ],
    suggest: (i) => {
      const a = EXPANSIVE.find((o) => o.value === i.expansive)?.grade ?? null
      const b = ALIENS.find((o) => o.value === i.aliens)?.grade ?? null
      return a && b ? worse(a, b) : null
    },
    warn: (i) => {
      const rows = speciesRows(i.species).filter((r) => r.name?.trim())
      const aliens = rows.filter((r) => findSpecies3140(r.name)?.group === 'alien').map((r) => r.name.trim())
      if (aliens.length && i.aliens === 'absent') return `Na liście są gatunki obce (${aliens.join(', ')}), a wybrano „Brak gatunków obcych”.`
      const expansiveCover = rows
        .filter((r) => findSpecies3140(r.name)?.group === 'expansive')
        .map((r) => num(r.cover))
        .filter((v): v is number => v !== undefined)
        .reduce((a, b) => a + b, 0)
      if (expansiveCover > 10 && i.expansive !== 'over10') return `Gatunki ekspansywne z listy zajmują łącznie ${plNum(Math.round(expansiveCover * 10) / 10)}% – to próg U2 (>10%).`
      return null
    },
    describe: (i) => {
      const names = speciesRows(i.species)
        .map((r) => r.name?.trim())
        .filter(Boolean)
      const note = String(i.note ?? '').trim()
      if (!names.length) return note || 'Nie stwierdzono'
      return [names.join(', '), note].filter(Boolean).join(', ')
    },
  },
  {
    id: 'maxDepth',
    label: 'Maksymalna głębokość występowania łąk ramienicowych',
    parameter: 'structure',
    cardinal: true,
    description: 'Maksymalna kolonizacja dna przez ramienice (graniczna wartość głębokości występowania ramienic). Zmiany zasięgu są ważnym objawem zmian warunków świetlnych i troficznych w jeziorach.',
    help: `Co wpisać: największą głębokość (m), na której rosną łąki ramienicowe – wyskalowaną linką z kotwiczką, sondą albo nurkowo (zalecane, gdy łąki schodzą poniżej 8–10 m).

Progi zależą od typu jeziora (zakładka Stanowisko):
• głębokie (>5 m): >5 m – FV, 5–2,5 m – U1, <2,5 m – U2;
• płytkie (≤5 m): jezioro przerośnięte ramienicami (łąki do dna) – FV, od <2,5 do 1 m – U1, 0,5–1 m – U2 (jeśli to nie jest głębokość maksymalna jeziora).

Interpretacje luk w tab. 2 dla płytkich: łąki od 2,5 m do dna (ale nie do dna) – U1; poniżej 0,5 m – U2. Bez „Głębokości maksymalnej jeziora” formularz nie rozpozna, że łąki sięgają dna. Płytkie jezioro o dużej powierzchni ocenia się tu progami dla płytkich (tab. 2 tylko w strukturze roślinności łączy je z głębokimi).

Brak ramienic na stanowisku – wpisz 0 (U2). Wskaźnik kardynalny, silnie skorelowany z zasięgiem strefy świetlnej.`,
    thresholds: {
      FV: 'Jeziora głębokie: >5 m; płytkie: jezioro przerośnięte ramienicami',
      U1: 'Jeziora głębokie: 5–2,5 m; płytkie: <2,5 do 1 m',
      U2: 'Jeziora głębokie: <2,5 m; płytkie: 0,5–1 m (jeśli nie jest to głębokość maks. jeziora)',
    },
    inputs: [{ kind: 'number', name: 'value', label: 'Maksymalna głębokość łąk ramienicowych', unit: 'm', min: 0, required: true, help: 'W metrach, np. 15,4. Brak ramienic – 0.' }],
    suggest: (i, ctx) => {
      const v = num(i.value)
      const t = lakeTypeOf(ctx?.site)
      if (v === undefined || !t) return null
      return gradeMaxDepth3140(v, t, num(ctx?.site?.lakeMaxDepth))
    },
    explain: (i, ctx) => (num(i.value) !== undefined && !lakeTypeOf(ctx?.site) ? NO_LAKE_TYPE : null),
    warn: (i, ctx) => {
      const v = num(i.value)
      const max = num(ctx?.site?.lakeMaxDepth)
      return v !== undefined && max !== undefined && v > max ? `Łąki głębiej (${plNum(v)} m) niż głębokość maksymalna jeziora (${plNum(max)} m)? Sprawdź wpis.` : null
    },
    describe: (i) => {
      const v = num(i.value)
      return v === undefined ? '' : `${plNum(v)} m`
    },
  },
  {
    id: 'lightZone',
    label: 'Zasięg strefy świetlnej w jeziorze',
    parameter: 'structure',
    cardinal: true,
    description: 'Rzeczywisty zasięg strefy świetlnej w jeziorze (<1% względnego PAR) na podstawie pomiarów miernikiem kwantowym z czujnikiem sferycznym, w słupie wody co 0,1 lub 0,5 m.',
    help: `Co wpisać: głębokość (m), na której światło fotosyntetycznie czynne (PAR) spada poniżej 1% wartości przy powierzchni. Miernik kwantowy z czujnikiem sferycznym, pomiar w słupie wody co 0,1–0,5 m, w optimum słonecznym. ${MEASURE_SPOT}

Progi zależą od typu jeziora (zakładka Stanowisko):
• głębokie (>5 m): >15 m – FV, 15–10 m – U1, <10 m – U2;
• płytkie (≤5 m): strefa świetlna do dna – FV, <5–2,5 m albo powyżej dna – U1, <2,5 m (jeśli nie jest to głębokość maks. jeziora) – U2.

Widzialność krążka Secchiego (pole opcjonalne) nie wpływa na ocenę. Sprawozdanie 2016–2018 proponowało zastąpić nią PAR (progi z rozporządzenia klasyfikacyjnego wód), ale metodyka tego nie przyjęła – zapisz ją jako daną uzupełniającą.

Jedyny abiotyczny wskaźnik kardynalny: określa obszar litoralu dostępny dla roślin.`,
    thresholds: {
      FV: 'Jeziora głębokie: >15 m; płytkie: do dna zbiornika',
      U1: 'Jeziora głębokie: 15–10 m; płytkie: <5–2,5 m lub poniżej głębokości maks. jeziora',
      U2: 'Jeziora głębokie: <10 m; płytkie: <2,5 m (jeśli nie jest to głębokość maks. jeziora)',
    },
    inputs: [
      { kind: 'number', name: 'value', label: 'Zasięg strefy świetlnej (1% PAR)', unit: 'm', min: 0, required: true, help: 'Głębokość 1% względnego PAR w metrach, np. 20,3. Strefa do dna – wpisz głębokość maksymalną jeziora.' },
      { kind: 'number', name: 'secchi', label: 'Widzialność krążka Secchiego (opcjonalnie)', unit: 'm', min: 0, help: 'Dana uzupełniająca, nie wpływa na ocenę.' },
    ],
    suggest: (i, ctx) => {
      const v = num(i.value)
      const t = lakeTypeOf(ctx?.site)
      if (v === undefined || !t) return null
      return gradeLightZone3140(v, t, num(ctx?.site?.lakeMaxDepth))
    },
    explain: (i, ctx) => (num(i.value) !== undefined && !lakeTypeOf(ctx?.site) ? NO_LAKE_TYPE : null),
    describe: (i) => {
      const v = num(i.value)
      const s = num(i.secchi)
      if (v === undefined) return ''
      return `${plNum(v)} m${s !== undefined ? ` (widzialność krążka Secchiego ${plNum(s)} m)` : ''}`
    },
  },
  {
    id: 'ph',
    label: 'Odczyn wody',
    parameter: 'structure',
    description: 'Kwasowość lub zasadowość wody. Zbyt duża wartość pH (>8,5) lub niska (<7,0) mogą świadczyć o zachodzących procesach degradacji. Wskaźnik pomocniczy.',
    help: `Co wpisać: pH wody powierzchniowej (0,5–1 m) z pehametru. ${MEASURE_SPOT} Jeśli znasz wynik z poprzedniego badania, wpisz go – tab. 2 ocenia zmianę.

Progi (tab. 2): bez istotnych zmian względem wcześniejszych wyników – FV (w jeziorach makrofitowych dopuszczalny nieznaczny wzrost); wzrost mniej niż o 1,0 pH – U1; wzrost o więcej niż 1,0 pH – U2.

Interpretacje: „bez istotnych zmian” = wzrost najwyżej o ${plNum(PH_STABLE)} pH (dobowe wahania i dokładność pomiaru); wzrost dokładnie o 1,0 – U1. Bez poprzedniego wyniku podpowiedź idzie z zakresu z tab. 1: pH 7,0–8,5 – FV, poza nim brak podpowiedzi (2024: przy braku danych porównawczych XX; sprawozdanie notuje U1 przy pH 8,3–9,3).

Wskaźnik pomocniczy: U2 nie obniża struktury do U2, najwyżej do U1.`,
    thresholds: {
      FV: 'Bez istotnych zmian w porównaniu z wcześniejszymi wynikami (w jeziorach makrofitowych dopuszczalny nieznaczny wzrost)',
      U1: 'Wzrost mniej niż o 1,0 jednostkę pH',
      U2: 'Wzrost o więcej niż 1,0 jednostkę pH',
    },
    inputs: [
      { kind: 'number', name: 'value', label: 'Odczyn wody', unit: 'pH', min: 0, max: 14, required: true, help: 'pH wody powierzchniowej, np. 8,45.' },
      { kind: 'number', name: 'previous', label: 'pH w poprzednim badaniu (opcjonalnie)', unit: 'pH', min: 0, max: 14, help: 'Wynik z poprzedniej karty albo literatury. Bez niego podpowiedź idzie z zakresu 7,0–8,5.' },
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v === undefined ? null : gradePH3140(v, num(i.previous))
    },
    explain: (i) => {
      const v = num(i.value)
      const p = num(i.previous)
      if (v === undefined) return null
      if (p !== undefined) {
        const d = Math.round((v - p) * 100) / 100
        return `Zmiana względem poprzedniego badania: ${d > 0 ? '+' : ''}${plNum(d)} pH.`
      }
      return v >= 7 && v <= 8.5 ? 'Bez poprzedniego wyniku – pH w zakresie 7,0–8,5 z tab. 1.' : 'Bez poprzedniego wyniku i poza zakresem 7,0–8,5 – ocenę wybierasz sam (XX, gdy nie da się ocenić).'
    },
    describe: (i) => {
      const v = num(i.value)
      const p = num(i.previous)
      if (v === undefined) return ''
      return `pH ${plNum(v)}${p !== undefined ? ` (poprzednio ${plNum(p)})` : ''}`
    },
  },
  {
    id: 'conductivity',
    label: 'Konduktywność – przewodnictwo elektrolityczne',
    parameter: 'structure',
    description: 'Wartość przewodnictwa elektrolitycznego odzwierciedla ilość jonów i jest miarą zdolności wody do przewodzenia prądu. Rośnie m.in. z zanieczyszczeniami (ścieki, spływy z pól nawożonych). Wskaźnik pomocniczy.',
    help: `Co wpisać: przewodność elektrolityczną właściwą (µS/cm) z konduktometru, w warstwie powierzchniowej. ${MEASURE_SPOT} Jeśli znasz wynik z poprzedniego badania, wpisz go – tab. 2 ocenia zmianę.

Progi (tab. 2): bez istotnych zmian – FV, wzrost poniżej 20% – U1, wzrost ponad 20% – U2.

Interpretacje: „bez istotnych zmian” = wzrost najwyżej o ${EC_STABLE}%; wzrost dokładnie o 20% – U1. Bez poprzedniego wyniku tab. 2 nie daje progu – formularz nie podpowiada, ocenę wybierasz sam (2013–2014: XX przy braku możliwości porównania; ekspert z danymi literaturowymi może dać FV, jak w przykładowej karcie).

W jeziorach ramienicowych zwykle 84–815 µS/cm (2013–2014, średnio 325). Wskaźnik pomocniczy.`,
    thresholds: {
      FV: 'Bez istotnych zmian w porównaniu z wcześniejszymi wynikami',
      U1: 'Wzrost wartości poniżej 20% w porównaniu z wcześniejszymi wynikami',
      U2: 'Wzrost wartości więcej niż 20% w porównaniu z wcześniejszymi wynikami',
    },
    inputs: [
      { kind: 'number', name: 'value', label: 'Przewodność elektrolityczna', unit: 'µS/cm', min: 0, required: true, help: 'Przewodność właściwa w µS/cm, np. 535.' },
      { kind: 'number', name: 'previous', label: 'Przewodność w poprzednim badaniu (opcjonalnie)', unit: 'µS/cm', min: 0, help: 'Wynik z poprzedniej karty albo literatury. Bez niego formularz nie podpowiada oceny.' },
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v === undefined ? null : gradeConductivity3140(v, num(i.previous))
    },
    explain: (i) => {
      const v = num(i.value)
      const p = num(i.previous)
      if (v === undefined) return null
      if (p === undefined || p <= 0) return 'Bez poprzedniego wyniku tab. 2 nie daje progu – ocenę wybierasz sam.'
      const d = Math.round(((v - p) / p) * 1000) / 10
      return `Zmiana względem poprzedniego badania: ${d > 0 ? '+' : ''}${plNum(d)}%.`
    },
    warn: (i) => {
      const v = num(i.value)
      return v !== undefined && v > 0 && v < 20 ? 'Poniżej 20 µS/cm – to raczej mS/m albo mS/cm. Sprawdź jednostkę.' : null
    },
    describe: (i) => {
      const v = num(i.value)
      const p = num(i.previous)
      if (v === undefined) return ''
      return `${plNum(v)} µS/cm${p !== undefined ? ` (poprzednio ${plNum(p)} µS/cm)` : ''}`
    },
  },
  plankton({
    id: 'phytoplankton',
    label: 'Plankton: fitoplankton',
    options: PHYTO,
    description: 'Skład fitoplanktonu i udział poszczególnych grup. Zakwit sinicowy, silna dominacja sinic albo liczna obecność okrzemek świadczą o pogarszaniu się warunków siedliska. Wskaźnik pomocniczy.',
    help: `Co wybrać: która grupa dominuje w fitoplanktonie. Dominacja zielenic albo innych grup poza sinicami – FV, współdominacja sinic i zielenic – U1, dominacja albo zakwit sinic – U2. Nie trzeba oznaczać do gatunku – wystarczą grupy i ich udział procentowy.

Próba: z centralnej, najgłębszej części zbiornika (wolne lustro wody), warstwa 0,5–1 m, siatka planktonowa o oczkach 10–25 µm, zagęszczona próba utrwalona kilkoma kroplami płynu Lugola (do koloru herbacianego). Analiza w co najmniej 20 polach widzenia mikroskopu. Bez siatki – metoda sedymentacji z ok. 100 ml wody.

Nie badano – wybierz „Nie badano” (XX). W 2024 r. plankton badano obowiązkowo na wszystkich stanowiskach. Wskaźnik pomocniczy; sprawozdania łączą go z zooplanktonem w jeden wskaźnik „Fito- i zooplankton”.`,
    listLabel: 'Skład fitoplanktonu (opcjonalnie)',
    listHelp: 'Grupy i taksony z udziałem, np. „złotowiciowce: Dinobryon divergens…; zielenice: …; sinice: …”. Gdy wpiszesz skład, to on trafia do pola „wartość”.',
  }),
  plankton({
    id: 'zooplankton',
    label: 'Plankton: zooplankton',
    options: ZOO,
    description: 'Zróżnicowanie taksonomiczne zooplanktonu i udział gatunków eutroficznych. Przewaga dużych wioślarek filtrujących to dobry stan, dominacja wrotków – eutrofizacja. Wskaźnik pomocniczy.',
    help: `Co wybrać: strukturę zespołu zooplanktonu z tej samej próby co fitoplankton. Duże zróżnicowanie taksonomiczne i przewaga dużych filtratorów (wioślarek) – FV; drobne wioślarki i wrotki, gatunki eutroficzne 5–50% zespołu – U1; dominacja wrotków (zwłaszcza Keratella cochlearis f. tecta, duże zagęszczenia Trichocerca), małe zróżnicowanie, gatunki eutroficzne >50% – U2.

Nie badano – wybierz „Nie badano” (XX). Wskaźnik pomocniczy.

Uwaga: przykładowa karta (Budzisławskie) przy „wyraźnej dominacji wrotków nad skorupiakami” dała FV, bo K. cochlearis f. tecta to ok. 10% populacji, w niewysokich liczebnościach – liczy się udział gatunków eutroficznych, nie sama przewaga wrotków.`,
    listLabel: 'Skład zooplanktonu (opcjonalnie)',
    listHelp: 'Opis zespołu, np. „Wyraźna dominacja wrotków nad skorupiakami…”. Gdy go wpiszesz, to on trafia do pola „wartość”.',
  }),
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu (linia prosta prostopadła do brzegu), z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie.

Dlaczego: przy kolejnym badaniu trzeba odnaleźć ten sam transekt. Gdy transekt przesunięto, wpisz nowe współrzędne i zaznacz to w uwagach.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Jezioro Budzisławskie (Anastazewo) stanowisko 1',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – zwykle jezioro, miejscowość i numer.

Dlaczego: stanowiskiem jest całe jezioro (zwykle poniżej 50 ha) albo wyraźnie wydzielona jego część. W jeziorach rozległych (nawet ponad 1000 ha) wyznacza się kilka stanowisk, np. w odrębnych zatokach – stabilna nazwa pozwala zestawić kolejne karty.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'waterBody',
    label: 'Jezioro',
    required: true,
    placeholder: 'np. Jezioro Budzisławskie',
    help: 'Jezioro (zbiornik), w którym leży stanowisko. W monitoringu 3140 stanowiskiem jest całe jezioro albo jego wydzielona część.',
  },
  {
    kind: 'select',
    name: 'lakeType',
    label: 'Typ jeziora',
    options: LAKE_TYPES,
    required: true,
    help: `Od typu zależą progi trzech wskaźników (tab. 2):
• głębokie – głębokość maksymalna powyżej 5 m;
• płytkie o dużej powierzchni (np. 100 ha) – w „Strukturze roślinności ramienicowej” oceniane jak głębokie (porównanie powierzchni łąk), w głębokości łąk i strefie świetlnej jak płytkie;
• płytkie – do 5 m: struktura z pokrycia dna, łąki i strefa świetlna odnoszone do dna.

Bez wyboru formularz bierze typ z głębokości maksymalnej (>5 m = głębokie).`,
  },
  {
    kind: 'number',
    name: 'lakeMaxDepth',
    label: 'Głębokość maksymalna jeziora',
    unit: 'm',
    min: 0,
    required: true,
    help: 'Głębokość maksymalna jeziora (albo wydzielonej części) w metrach – z batymetrii, literatury albo echosondy. W jeziorach płytkich służy do rozpoznania, czy łąki ramienicowe i strefa świetlna sięgają dna.',
    warn: (v) => {
      const d = num(v)
      return d !== undefined && d > 120 ? 'Ponad 120 m? Najgłębsze jezioro w Polsce (Hańcza) ma ok. 109 m – sprawdź wpis.' : null
    },
  },
  {
    kind: 'textarea',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    rows: 4,
    placeholder: 'np. Nitelletum flexilis, Charetum tomentosae, Nitellopsidetum obtusae, Potametum pectinati',
    help: `Zbiorowiska roślinne stwierdzone na stanowisku nazwami fitosocjologicznymi: najpierw z klasy Charetea fragilis (łąki ramienicowe, np. Nitelletum flexilis, Nitelletum opacae, Nitellopsidetum obtusae, Charetum tomentosae, Charetum contrariae, Charetum filiformis, Charetum rudis, Charetum asperae, Charetum delicatulae), potem inne (np. Potametum pectinati, Najadetum marinae, Myriophylletum spicati). Zbiorowisk szuwarowych i turzycowych nie trzeba wyznaczać.

Dlaczego: pełna sekwencja zbiorowisk od płycizn (Charetum asperae, C. filiformis), przez średnie głębokości (C. tomentosae, C. rudis), po głęboki fitolitoral (Nitellopsidetum obtusae, Nitelletum opacae) to obraz dobrze zachowanego jeziora.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Typ i głębokość jeziora, kształt misy, linia brzegowa, szuwary, zasilanie, powierzchnia lustra wody, zlewnia bezpośrednia, zabudowa i rekreacja.',
    help: `Syntetyczny opis stanowiska:
• typ jeziora (rynnowe, wytopiskowe…), głębokość maksymalna, kształt misy, wyspy i podwodne garby;
• linia brzegowa i strefa szuwarów, nachylenie stoków;
• zasilanie (dopływy, źródła) i odpływ, powierzchnia lustra wody;
• zlewnia bezpośrednia: pola, lasy, zabudowa stała i rekreacyjna, kąpieliska, pomosty.

Dlaczego: stan jeziora ramienicowego zależy od tego, co dzieje się w zlewni – opis pozwala następnemu obserwatorowi zrozumieć zmiany.`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Powierzchnia siedliska (łąk ramienicowych, fitolitoralu z ramienicami) na stanowisku, w hektarach – z GIS, danych archiwalnych albo oszacowania. To nie musi być powierzchnia całego lustra wody.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Z kodem obszaru Natura 2000, np. „Pojezierze Gnieźnieńskie PLH300026”.',
  }),
  { kind: 'text', name: 'manager', label: 'Zarządzający terenem', help: 'Właściciel jeziora i użytkownik rybacki, np. „Skarb Państwa, użytkownik rybacki: prywatny dzierżawca”. Od nich zależą działania ochronne (gospodarka rybacka, biomanipulacja).' },
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    required: true,
    placeholder: 'np. powierzchnia prostokątna 135 × 16 m',
    hint: 'Linia prosta prostopadła do brzegu, do ok. 300 m – tyle, ile sięga roślinność wodna. Małe jezioro – cały zbiornik.',
    help: `Faktyczne wymiary transektu. Transekt to linia prosta prostopadła do brzegu, a jego długość ogranicza zasięg roślinności wodnej (np. 300 m albo krócej). Przy pierwszym badaniu wyznacz reprezentatywny transekt; w niewielkim zbiorniku transektem może być cała jego powierzchnia.

Dlaczego: pokrycie dna i powierzchnię łąk ramienicowych porównuje się w kolejnych latach w tym samym transekcie.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 99',
    help: 'Wysokość lustra wody nad poziomem morza w metrach, z mapy topograficznej albo GPS.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 24.07.2013',
    required: true,
    hint: 'Optymalnie od końca czerwca do końca sierpnia; w praktyce monitoringu lipiec–wrzesień.',
    help: `Dzień badań terenowych. Przewodnik: miesiące letnie, od końca czerwca do końca sierpnia; w niektórych jeziorach (płytkich i głębokich) kontrola ramienic także na początku czerwca albo jesienią – w optimum rozwoju gatunków jednorocznych. Monitoring 2013–2014 prowadzono w lipcu–październiku, 2017 – od drugiej połowy czerwca do połowy września, 2024 – od 8 lipca do 24 września, wszystko uznane za zgodne z metodyką. Badania powtarza się co 3 lata.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const [, m, d] = v.split('-').map(Number)
      const ok = (m === 6 && d >= 15) || (m >= 7 && m <= 9)
      return ok ? null : 'Termin poza sezonem (połowa czerwca – wrzesień). Łąki ramienicowe mogą być nierozwinięte – zapisz to w uwagach.'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcie fitosocjologiczne (opcjonalne) ----------

const releveFields: FieldDef[] = [
  { kind: 'text', name: 'coords', label: 'Współrzędne środka zdjęcia', help: 'Współrzędne GPS środka powierzchni zdjęcia (z łodzi).' },
  { kind: 'number', name: 'depth', group: 'Powierzchnia, pokrycie i głębokość', label: 'Głębokość', unit: 'm', min: 0, help: 'Głębokość wody w miejscu zdjęcia – zbiorowiska ramienic układają się strefami głębokości.' },
  { kind: 'number', name: 'area', group: 'Powierzchnia, pokrycie i głębokość', label: 'Powierzchnia zdjęcia', unit: 'm²', min: 0, defaultValue: 4, help: 'Powierzchnia płatu, z którego notujesz gatunki, np. 2×2 m. Pod wodą – oszacowanie.' },
  { kind: 'number', name: 'cover', group: 'Powierzchnia, pokrycie i głębokość', label: 'Ogólne pokrycie', unit: '%', min: 0, max: 100, help: 'Procent dna pokryty przez roślinność w obrębie zdjęcia.' },
  { kind: 'text', name: 'unit', label: 'Jednostka fitosocjologiczna', placeholder: 'np. Charetum tomentosae', help: 'Zespół ramienicowy (albo inny wodny), do którego należy płat.' },
  {
    kind: 'releve-species',
    name: 'species',
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Gatunki w płacie z ilościowością w skali Braun-Blanqueta (r, +, 1–5). Ramienice i rośliny wodne wpisuj w warstwie C.',
  },
]

export const methodology3140: Methodology = {
  code: '3140',
  name: 'Twardowodne oligo- i mezotroficzne zbiorniki z podwodnymi łąkami ramienic (Charetea)',
  source:
    'Przewodnik metodyczny GIOŚ, Monitoring siedlisk przyrodniczych, cz. IV, rozdz. 3140 Twardowodne oligo- i mezotroficzne zbiorniki z podwodnymi łąkami ramienic (Charetea), s. 120–139 (tab. 1 i 2), z erratą „najgorszy decyduje” (sprawozdanie z monitoringu 2016–2018)',

  siteFields,

  releves: {
    defaultCount: 0,
    intro:
      'Metodyka 3140 nie wymaga zdjęć fitosocjologicznych w skali Braun-Blanqueta – zbiorowiska z dominującymi ramienicami dokumentuje się spisem w „Zbiorowiskach roślinnych”, opisem struktury i zdjęciami fotograficznymi. Dodaj zdjęcie, gdy chcesz udokumentować płat zbiorowiska (np. przy pierwszym badaniu jeziora).',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Realne możliwości utrzymania albo przywrócenia właściwego stanu siedliska: zagospodarowanie i użytkowanie zlewni bezpośredniej (gospodarka wodno-ściekowa, źródła zanieczyszczeń, zabudowa stała i rekreacyjna), strefa buforowa (szuwary, zadrzewienia, pomosty, dojścia wędkarskie, plaże), gospodarka rybacka i wędkarska, wahania poziomu wody.',
    help: `Oceniając perspektywy, weź pod uwagę stan całej zlewni bezpośredniej jeziora i jej wpływ na eutrofizację (również potencjalną): regulację gospodarki wodno-ściekowej, źródła zanieczyszczeń, zabudowę stałą i rekreacyjną; stan strefy buforowej (fragmentacja szuwaru i zadrzewień, liczba pomostów, dojść wędkarskich, plaż i kąpielisk); użytkowanie rybackie i wędkarskie (skład ichtiofauny, obce gatunki ryb, zbyt silne populacje karpiowatych); wahania poziomu lustra wody i zaburzenia hydrologiczne (np. leje depresyjne kopalń odkrywkowych).

W opisie umieść informację o prowadzonych i planowanych zabiegach ochronnych: uporządkowanie gospodarki wodno-ściekowej, miejscowy plan zagospodarowania ze strefą buforową 100 m bez zabudowy, biomanipulacja rybacka, rekultywacja.`,
    thresholds: {
      FV: 'Dobre perspektywy utrzymania siedliska. Nie przewiduje się znaczącego oddziaływania czynników zagrażających typu: eutrofizacja, zmiana warunków świetlnych jezior, wahania poziomu lustra wody',
      U1: 'Istnieje możliwość polepszenia stanu siedliska, poprzez np. kontrolowanie gospodarki rybackiej, ograniczenie dopływu biogenów',
      U2: 'Brak realnych możliwości poprawy stanu siedliska, zagrożenie związane z istniejącymi i planowanymi inwestycjami oraz sposobem użytkowania zlewni. Prowadzona intensywna gospodarka rybacka, silne rekreacyjne użytkowanie zbiornika i jego otoczenia',
    },
  },

  impactCodes: [
    { code: 'A08', name: 'Nawożenie /nawozy sztuczne/' },
    { code: 'B02', name: 'Gospodarka leśna – ogólnie' },
    { code: 'B02.02', name: 'Wycinka lasu' },
    { code: 'C01.04', name: 'Kopalnie' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'E01', name: 'Tereny zurbanizowane, tereny zamieszkane' },
    { code: 'E01.03', name: 'Zabudowa rozproszona' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'F01', name: 'Akwakultura morska i słodkowodna' },
    { code: 'F02', name: 'Rybołówstwo i zbieranie zasobów wodnych' },
    { code: 'F02.03', name: 'Wędkarstwo' },
    { code: 'G01', name: 'Sporty i różne formy czynnego wypoczynku, uprawiane w plenerze' },
    { code: 'G01.01', name: 'Sporty wodne' },
    { code: 'G02.10', name: 'Inne kompleksy sportowe i rekreacyjne' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'H01', name: 'Zanieczyszczenia wód' },
    { code: 'H01.05', name: 'Rozproszone zanieczyszczenie wód powierzchniowych z powodu działalności związanej z rolnictwem i leśnictwem' },
    { code: 'H01.08', name: 'Rozproszone zanieczyszczenie wód powierzchniowych z powodu ścieków z gospodarstw domowych' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'J02.01', name: 'Odwadnianie' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód – ogólnie' },
    { code: 'J02.06', name: 'Pobór wód powierzchniowych' },
    { code: 'J02.07', name: 'Pobór wód podziemnych' },
    { code: 'K01.03', name: 'Wyschnięcie' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'M01', name: 'Zmiany warunków abiotycznych' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. rzadkie zbiorowiska ramienic, gatunki chronione (Chara filiformis, C. polyacantha, Nitella opaca), walory krajobrazowe.',
        help: 'Wartości przyrodnicze stanowiska poza samym siedliskiem: rzadkie i bardzo rzadkie w skali kraju zbiorowiska (Charetum rudis, Charetum filiformis, Nitelletum opacae, Najadetum marinae), gatunki chronione (ramienice, Utricularia australis), lychnotamnus brodaty, walory krajobrazowe. Brak informacji – „Nie pozyskano danych”.',
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: `Jakie działania ochronne wykonano i jaka jest ich skuteczność, oraz co proponujesz. Typowe dla 3140: uporządkowanie gospodarki wodno-ściekowej w zlewni i zaostrzenie warunków odprowadzania ścieków; miejscowy plan zagospodarowania z zakazem zabudowy w strefie buforowej 100 m od brzegu; ochrona przed gwałtownymi zmianami poziomu wody (rozpoznanie hydrologii, leje depresyjne, ujęcia wody); sielawowy typ gospodarki rybackiej, ograniczenie ryb karpiowatych, biomanipulacja; w najcenniejszych jeziorach – wyłączenie z użytkowania rybackiego, rezerwat. Brak działań – „Brak”.`,
      }
    return f
  }),

  speciesCatalog: SPECIES_3140.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer3140() })),
  speciesInfo: (name) => {
    const e = findSpecies3140(name)
    return e ? GROUP_LABELS_3140[e.group] : undefined
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator3140 = (id: string): IndicatorDef => {
  const i = methodology3140.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 3140`)
  return i
}
