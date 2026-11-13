// Metodyka 1150 (zalewy i jeziora przymorskie – laguny) jako dane. Źródło: Zalewska-Gałosz J. 2010, „Zalewy i jeziora
// przymorskie (laguny)” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ,
// s. 36–45 (tab. 1 i 2), z modyfikacją GIOŚ z 17.07.2015 (azot ogólny zamiast nieorganicznego, nowe progi pH,
// ramienice jako wskaźnik pomocniczy) i praktyką oceny ze sprawozdania z monitoringu 2013–2014.
// Siedlisko wodne: zamiast transektu leśnego jest transekt nurkowy 50×30 m (3 strefy głębokości po 10 poletek 0,1 m²),
// próbka wody i jedno zdjęcie 5×5 m na każdy jednorodny płat szuwaru. Z modułu leśnego brane są tylko klocki generyczne
// (choiceIndicator, selecty z oceną) – nic leśnego.
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { num } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { choiceIndicator, labelOf, pickField, plNum, type GradedOption } from '../../forest'
import { GROUP_LABELS_1150, SPECIES_1150, defaultLayer1150, findSpecies1150, isHydrophyteGroup } from './species'

// ---------- progi liczbowe (tab. 2 + modyfikacja 2015) ----------

/** Liczba zbiorowisk: ≥4 FV, 2–3 U1, <2 U2. */
export const gradeCommunities1150 = (n: number): Grade => (n >= 4 ? 'FV' : n >= 2 ? 'U1' : 'U2')
/** Przezroczystość (krążek Secchiego): ≥0,5 m FV, 0,2–0,5 U1, <0,2 U2. Luka 0,4–0,5 z tab. 2 → U1. */
export const gradeSecchi1150 = (m: number): Grade => (m >= 0.5 ? 'FV' : m >= 0.2 ? 'U1' : 'U2')
/** Azot ogólny: 0,3–6,5 mg/dm³ FV, 6,5–15 U1 („inne kombinacje”), <0,3 albo >15 U2. */
export const gradeNitrogen1150 = (n: number): Grade => (n < 0.3 || n > 15 ? 'U2' : n <= 6.5 ? 'FV' : 'U1')
/** Fosfor ogólny: ≤0,5 mg/dm³ FV, 0,5–1,0 U1, >1,0 U2. */
export const gradePhosphorus1150 = (p: number): Grade => (p <= 0.5 ? 'FV' : p <= 1 ? 'U1' : 'U2')
/** Chlorki: >500 mg/dm³ FV, 200–500 U1, <200 U2. */
export const gradeChlorides1150 = (c: number): Grade => (c > 500 ? 'FV' : c >= 200 ? 'U1' : 'U2')
/** Odczyn (modyfikacja 2015): 6,5–8,0 FV; 6,0–6,49 albo 8,01–9,5 U1; <6,0 albo >9,5 U2. */
export const gradePH1150 = (ph: number): Grade => (ph >= 6.5 && ph <= 8 ? 'FV' : ph >= 6 && ph <= 9.5 ? 'U1' : 'U2')

// ---------- powierzchnia: dwa trendy -> ocena ----------

const REED_TREND: SelectOption[] = [
  { value: 'decrease', label: 'Zmniejsza się' },
  { value: 'stable', label: 'Nie podlega zmianom' },
  { value: 'increase', label: 'Zwiększa się' },
  { value: 'unknown', label: 'Brak danych do porównania' },
]
const LITTORAL_TREND: SelectOption[] = [
  { value: 'increase', label: 'Zwiększa się' },
  { value: 'stable', label: 'Nie podlega zmianom' },
  { value: 'decrease', label: 'Zmniejsza się' },
  { value: 'unknown', label: 'Brak danych do porównania' },
]

/**
 * Tab. 2: FV – szuwar trzcinowy maleje albo bez zmian I fitolitoral inny niż bagienny rośnie albo bez zmian;
 * U2 – wzrost powierzchni szuwaru trzcinowego; U1 – inne kombinacje. Brak danych o którymś trendzie -> XX
 * (sprawozdanie 2013: przy pierwszym badaniu XX), chyba że trzcina rośnie – to U2 niezależnie od reszty.
 */
export function gradeArea1150(reed: unknown, littoral: unknown): Grade | null {
  if (!reed || !littoral) return null
  if (reed === 'increase') return 'U2'
  if (reed === 'unknown' || littoral === 'unknown') return 'XX'
  if ((reed === 'decrease' || reed === 'stable') && (littoral === 'increase' || littoral === 'stable')) return 'FV'
  return 'U1'
}

// ---------- liczba zbiorowisk ----------

/** „Lemnetum minoris, Phragmitetum australis; …” -> liczba nazw (przecinek, średnik albo nowa linia). */
export const countCommunities = (text: unknown): number =>
  String(text ?? '')
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean).length

function communitiesValue(i: InputValues, ctx?: IndicatorContext): { n?: number; from?: 'list' | 'site' } {
  const typed = num(i.count)
  if (typed !== undefined) return { n: typed }
  const fromList = countCommunities(i.list)
  if (fromList) return { n: fromList, from: 'list' }
  const fromSite = countCommunities(ctx?.site?.communities)
  return fromSite ? { n: fromSite, from: 'site' } : {}
}

// ---------- transekt nurkowy ----------

export const ZONES: SelectOption[] = [
  { value: 'A', label: 'A: 0–0,25 m' },
  { value: 'B', label: 'B: 0,25–0,5 m' },
  { value: 'C', label: 'C: 0,5–1,0 m' },
]
/** Poletek w strefie (10 powtórzeń po 0,1 m²). */
export const PLOTS_PER_ZONE = 10

export interface TransectHit {
  zone: string
  name: string
  /** Liczba poletek z gatunkiem (0–10). */
  plots: number
  /** Frekwencja = poletka / 10 × 100%. */
  freq: number
}

/** Kompletne wiersze transektu (strefa, gatunek, liczba poletek 0–10). */
export function transectHits(value: unknown): TransectHit[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((r: Record<string, unknown>) => {
    const zone = String(r?.zone ?? '')
    const name = String(r?.species ?? '').trim()
    const plots = num(r?.plots)
    if (!ZONES.some((z) => z.value === zone) || !name || plots === undefined || plots < 0 || plots > PLOTS_PER_ZONE) return []
    return [{ zone, name, plots, freq: Math.round((plots / PLOTS_PER_ZONE) * 100) }]
  })
}

/** „Strefa A (0–0,25 m): Lemna trisulca 20%; strefa B …; strefa C (0,5–1,0 m): brak roślinności podwodnej”. */
export function describeTransect(value: unknown): string {
  const hits = transectHits(value)
  if (!hits.length) return ''
  return ZONES.map((z, idx) => {
    const inZone = hits.filter((h) => h.zone === z.value && h.plots > 0)
    const head = `${idx === 0 ? 'Strefa' : 'strefa'} ${z.value} (${z.label.slice(3)})`
    return `${head}: ${inZone.length ? inZone.map((h) => `${h.name} ${h.freq}%`).join(', ') : 'brak roślinności podwodnej'}`
  }).join('; ')
}

/** 1 gatunek, 2–4 gatunki, 5+ gatunków (ale 12–14 gatunków). */
export const speciesWord = (n: number) =>
  n === 1 ? 'gatunek' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'gatunki' : 'gatunków'

const transectOf = (ctx?: IndicatorContext) => transectHits(ctx?.indicators?.hydrophytes?.inputs?.transect).filter((h) => h.plots > 0)
const isCharophyte = (name: string) => findSpecies1150(name)?.group === 'charophyte' || /^(chara|nitella|nitellopsis|tolypella)\b/i.test(name)
const isHydrophyte = (name: string) => {
  const e = findSpecies1150(name)
  return e ? isHydrophyteGroup(e.group) : false
}

// ---------- opcje selektów ----------

const HYDROPHYTES: GradedOption[] = [
  { value: 'communities', label: 'Obecne, tworzą zbiorowiska', grade: 'FV' },
  { value: 'single', label: 'Obecne, występują pojedynczo', grade: 'U1' },
  { value: 'absent', label: 'Brak', grade: 'U2' },
]
const CHAROPHYTES: GradedOption[] = [
  { value: 'communities', label: 'Liczne, tworzą zbiorowiska', grade: 'FV' },
  { value: 'sporadic', label: 'Sporadyczne, zbiorowiska wykształcone fragmentarycznie (kadłubowe)', grade: 'U1' },
  { value: 'absent', label: 'Brak', grade: 'U2' },
]
const SALT_WATER: GradedOption[] = [
  { value: 'continuous', label: 'Obecne, ciągłe', grade: 'FV' },
  { value: 'occasional', label: 'Obecne, okazjonalne', grade: 'FV' },
  { value: 'sporadic', label: 'Sporadyczne', grade: 'U1' },
  { value: 'none', label: 'Brak (brak połączenia z morzem)', grade: 'U2' },
]
const N_FORM: SelectOption[] = [
  { value: 'total', label: 'Azot ogólny (od 2015)' },
  { value: 'inorganic', label: 'Azot nieorganiczny (karty sprzed 2015)' },
]

const WATER_SAMPLE = `Próbka: na każdym transekcie pobierz do butelki 1,5 l wodę powierzchniową (i osad do woreczka strunowego) i oddaj do laboratorium. Wynik wpisz, gdy przyjdzie – formularz zapisuje kopię roboczą.`

// ---------- wskaźnik liczbowy (próbka wody, Secchi) ----------

function measure(s: {
  id: string
  label: string
  description: string
  help: string
  thresholds: IndicatorDef['thresholds']
  unit: string
  inputLabel: string
  inputHelp: string
  grade: (v: number) => Grade
  extra?: FieldDef[]
  warn?: (v: number | undefined, i: InputValues) => string | null
  describe?: (v: number, i: InputValues) => string
}): IndicatorDef {
  return {
    id: s.id,
    label: s.label,
    parameter: 'structure',
    cardinal: true,
    description: s.description,
    help: s.help,
    thresholds: s.thresholds,
    inputs: [{ kind: 'number', name: 'value', label: s.inputLabel, unit: s.unit, min: 0, required: true, help: s.inputHelp }, ...(s.extra ?? [])],
    suggest: (i) => {
      const v = num(i.value)
      return v === undefined ? null : s.grade(v)
    },
    warn: s.warn ? (i) => s.warn!(num(i.value), i) : undefined,
    describe: (i) => {
      const v = num(i.value)
      if (v === undefined) return ''
      return s.describe ? s.describe(v, i) : `${plNum(v)} ${s.unit}`
    },
  }
}

// ---------- wskaźniki ----------

const hydrophytesBase = choiceIndicator({
  id: 'hydrophytes',
  label: 'Obecność hydrofitów',
  cardinal: true,
  description: 'Występują / nie występują, tworzą zbiorowiska, występują pojedynczo. Ocena z transektu nurkowego 50×30 m.',
  help: `Co wybrać: czy w transekcie rosną hydrofity (rośliny wodne zanurzone i o liściach pływających: rdestnice, wywłóczniki, rogatek, jezierza, rzęsy, grzybienie) i czy tworzą zbiorowiska, czy rosną pojedynczo.

Transekt (opcjonalny spis poniżej): linia prostopadła do brzegu, 50×30 m, nurkowo. Trzy strefy głębokości – A: 0–0,25 m, B: 0,25–0,5 m, C: 0,5–1,0 m. W każdej strefie 10 losowych poletek po 0,1 m² (ramka), razem 30. Nurek notuje obecność gatunku na poletku; frekwencja = liczba poletek z gatunkiem / 10. Spis trafia do karty jako „Strefa A: Lemna trisulca 20%…”, a ramienice z niego podpowiadają też wskaźnik „Obecność ramienic”.

Słaba widzialność wyklucza ocenę z powierzchni (makrofitoindykację), dlatego metoda nurkowa. Termin: lipiec–wrzesień.

Wskaźnik kardynalny, łatwy w ocenie i dobrze odzwierciedla stan siedliska (sprawozdanie 2013–2014).`,
  options: HYDROPHYTES,
  inputLabel: 'Hydrofity w transekcie',
})

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description:
      'Zmiana powierzchni fitolitoralu: czy szuwar trzcinowy się rozrasta, a fitolitoral inny niż bagienny (roślinność wodna) maleje. Przyjmuje się, że powierzchnia siedliska = powierzchnia fitolitoralu.',
    help: `Co wybrać: dwa trendy od poprzedniej obserwacji (albo względem map, ortofotomap, danych archiwalnych):
• szuwar trzcinowy (Phragmitetum) – rozrastanie się trzciny to główny objaw zarastania i wypłycania jeziora;
• fitolitoral inny niż bagienny – pas roślinności wodnej (hydrofity zanurzone i pływające), który powinien się utrzymać albo rosnąć.

Formularz łączy oba wybory wg tab. 2: trzcina maleje albo bez zmian I roślinność wodna rośnie albo bez zmian – FV; trzcina rośnie – U2; inne kombinacje – U1. Gdy którykolwiek trend jest nieznany (pierwsze badanie), podpowiedź to XX.

Praktyka 2013–2014: na stanowisku nie da się zmierzyć całego fitolitoralu, więc przy dobrze rozwiniętych zbiorowiskach makrofitów zanurzonych powierzchnię oceniano na FV, przy słabo rozwiniętych na U1 (albo XX przy pierwszym badaniu), a przy całkowitym braku makrofitów zanurzonych na U2.

Dlaczego: w lagunach roślinność podwodna rozwija się słabo (mętna woda, falowanie), a szuwar wypiera ją z płycizn. To, kto wygrywa, mówi o kierunku zmian.`,
    thresholds: {
      FV: 'Szuwar trzcinowy zmniejsza się lub nie podlega zmianom; fitolitoral inny niż bagienny zwiększa się lub nie podlega zmianom',
      U1: 'Inne kombinacje',
      U2: 'Wzrost powierzchni zajętej przez szuwar trzcinowy',
    },
    inputs: [
      { kind: 'select', name: 'reed', label: 'Szuwar trzcinowy', options: REED_TREND, help: 'Jak zmienia się powierzchnia szuwaru trzcinowego na stanowisku od poprzedniej obserwacji. Puste, gdy nie ma z czym porównać – wtedy ocenę wybierasz sam.' },
      { kind: 'select', name: 'littoral', label: 'Fitolitoral inny niż bagienny', options: LITTORAL_TREND, help: 'Jak zmienia się pas roślinności wodnej (hydrofity zanurzone i pływające) od poprzedniej obserwacji.' },
      { kind: 'number', name: 'areaHa', label: 'Powierzchnia (opcjonalnie)', unit: 'ha', min: 0, help: 'Powierzchnia siedliska na stanowisku, jeśli ją znasz – trafi do pola „wartość”. Opcjonalne.' },
    ],
    suggest: (i) => gradeArea1150(i.reed, i.littoral),
    warn: (i, ctx) => {
      const g = gradeArea1150(i.reed, i.littoral)
      return ctx?.indicators?.hydrophytes?.inputs?.choice === 'absent' && g !== 'U2'
        ? 'Na stanowisku brak hydrofitów – w monitoringu 2013–2014 powierzchnię przy całkowitym braku makrofitów zanurzonych oceniano na U2.'
        : null
    },
    describe: (i) => {
      const ha = num(i.areaHa)
      const trends = [
        i.reed ? `szuwar trzcinowy: ${labelOf(REED_TREND, i.reed).toLowerCase()}` : '',
        i.littoral ? `fitolitoral inny niż bagienny: ${labelOf(LITTORAL_TREND, i.littoral).toLowerCase()}` : '',
      ].filter(Boolean)
      return [ha !== undefined ? `${plNum(ha)} ha` : '', trends.join(', ')].filter(Boolean).join('; ')
    },
  },
  {
    id: 'communities',
    label: 'Liczba zbiorowisk',
    parameter: 'structure',
    cardinal: true,
    description: 'Liczba zbiorowisk roślinnych odnotowanych w obrębie transektu. Większa liczba zbiorowisk wskazuje na lepszy stan zachowania siedliska.',
    help: `Co wpisać: liczbę zbiorowisk roślinnych (zespołów, zbiorowisk) stwierdzonych w obrębie transektu – wodnych i szuwarowych. Możesz wpisać samą liczbę, wymienić zbiorowiska w polu niżej (formularz je policzy), albo nic: wtedy liczone są nazwy z pola „Zbiorowiska roślinne” w zakładce Stanowisko.

Szczególnie istotne są zbiorowiska makrofitów zanurzonych (Potametum pectinati, P. perfoliati, Myriophylletum spicati, Najadetum marinae…), bo świadczą o dobrym stanie ekologicznym wód.

Wskaźnik kardynalny. Sprawozdanie 2013–2014 zauważa, że jest dyskusyjny (jeziora o słodkiej, czystej wodzie mają więcej zbiorowisk niż te o właściwym zasoleniu) – ale obowiązuje.`,
    thresholds: { FV: '≥4', U1: '2–3', U2: '<2' },
    inputs: [
      { kind: 'number', name: 'count', label: 'Liczba zbiorowisk', min: 0, unit: 'szt.', help: 'Liczba zbiorowisk w transekcie. Gdy ją wpiszesz, ma pierwszeństwo przed liczeniem z listy. Opcjonalne.' },
      {
        kind: 'textarea',
        name: 'list',
        label: 'Zbiorowiska w transekcie (opcjonalnie)',
        rows: 2,
        placeholder: 'np. Potametum pectinati, Phragmitetum australis',
        help: 'Nazwy zbiorowisk oddzielone przecinkiem, średnikiem albo nową linią. Formularz policzy pozycje. Pusta lista – liczone są nazwy z pola „Zbiorowiska roślinne” w zakładce Stanowisko.',
      },
    ],
    suggest: (i, ctx) => {
      const { n } = communitiesValue(i, ctx)
      return n === undefined ? null : gradeCommunities1150(n)
    },
    explain: (i, ctx) => {
      const { n, from } = communitiesValue(i, ctx)
      if (n === undefined || !from) return null
      return from === 'site' ? `Policzono ${n} nazw z pola „Zbiorowiska roślinne” (zakładka Stanowisko).` : `Policzono ${n} nazw z listy.`
    },
    describe: (i, ctx) => {
      const { n } = communitiesValue(i, ctx)
      return n === undefined ? '' : String(n)
    },
  },
  {
    ...hydrophytesBase,
    inputs: [
      {
        kind: 'table',
        name: 'transect',
        label: 'Transekt podwodny – frekwencja gatunków',
        addLabel: 'Dodaj gatunek w strefie',
        rowLabel: 'Wiersz',
        help: 'Jeden wiersz = jeden gatunek w jednej strefie głębokości. Liczba poletek: na ilu z 10 poletek 0,1 m² w tej strefie stwierdzono gatunek (frekwencja = poletka × 10%). Gatunek w dwóch strefach – dwa wiersze. Spis jest opcjonalny, ale bez niego karta nie ma frekwencji.',
        columns: [
          { kind: 'select', name: 'zone', label: 'Strefa głębokości', options: ZONES, required: true, help: 'A: 0–0,25 m, B: 0,25–0,5 m, C: 0,5–1,0 m.' },
          { kind: 'text', name: 'species', label: 'Gatunek', placeholder: 'np. Potamogeton pectinatus', required: true, help: 'Nazwa naukowa gatunku (hydrofit albo ramienica).' },
          { kind: 'number', name: 'plots', label: 'Poletka z gatunkiem (na 10)', min: 0, max: PLOTS_PER_ZONE, required: true, help: 'Na ilu z 10 poletek w strefie stwierdzono gatunek: 0–10. Frekwencja = poletka × 10%.' },
        ],
      },
      ...hydrophytesBase.inputs,
    ],
    explain: (i) => {
      const hits = transectHits(i.transect).filter((h) => h.plots > 0)
      if (!hits.length) return null
      const zones = new Set(hits.map((h) => h.zone))
      const n = new Set(hits.map((h) => h.name)).size
      return `Transekt: ${n} ${speciesWord(n)} w ${zones.size} z 3 stref.`
    },
    warn: (i) => {
      const hydro = transectHits(i.transect).filter((h) => h.plots > 0 && isHydrophyte(h.name))
      return i.choice === 'absent' && hydro.length ? `W transekcie są hydrofity (${[...new Set(hydro.map((h) => h.name))].join(', ')}), a wybrano „Brak”.` : null
    },
    describe: (i) => [labelOf(HYDROPHYTES, i.choice), describeTransect(i.transect)].filter(Boolean).join('. '),
  },
  {
    ...choiceIndicator({
      id: 'charophytes',
      label: 'Obecność ramienic',
      description: 'Występują / nie występują, tworzą zbiorowiska, występują pojedynczo. Od 2015 r. wskaźnik pomocniczy – nie wpływa na ocenę struktury, nawet przy U2.',
      help: `Co wybrać: czy w transekcie rosną ramienice (Chara tomentosa, C. aspera, C. contraria, C. vulgaris, Nitellopsis obtusa) i w jakiej postaci: liczne zbiorowiska, sporadyczne i kadłubowe, albo brak.

Wskaźnik pomocniczy (modyfikacja metodyki GIOŚ z 17.07.2015). Już tab. 2 przewodnika mówi, że „obecność ramienic nie wpływa na ocenę, nawet w przypadku oceny U2”. Formularz go wypełnia i eksportuje, ale pomija w ocenie specyficznej struktury i funkcji.

Dlaczego pomocniczy: większość ramienic nie znosi wysokich stężeń fosforanów, a wody jezior przymorskich są naturalnie eutroficzne i ubogie w wapń. Brak ramienic to stan dla laguny typowy, nie objaw degradacji (sprawozdanie 2013–2014: brak na 92% stanowisk).`,
      options: CHAROPHYTES,
      inputLabel: 'Ramienice w transekcie',
    }),
    excluded: true,
    excludedNote: 'wskaźnik pomocniczy – nie liczy się do oceny struktury',
    explain: (_i, ctx) => {
      const chara = transectOf(ctx).filter((h) => isCharophyte(h.name))
      return chara.length ? `W transekcie: ${chara.map((h) => `${h.name} (strefa ${h.zone}, ${h.freq}%)`).join(', ')}.` : null
    },
    warn: (i, ctx) => {
      const chara = transectOf(ctx).filter((h) => isCharophyte(h.name))
      return i.choice === 'absent' && chara.length ? 'W spisie transektu (Obecność hydrofitów) są ramienice, a wybrano „Brak”.' : null
    },
  },
  choiceIndicator({
    id: 'saltWater',
    label: 'Zasilanie wodami słonymi',
    cardinal: true,
    description: 'Dopływ wód morskich: obecny ciągły, okazjonalny, sporadyczny albo brak połączenia z morzem.',
    help: `Co wybrać: jak często do zbiornika wlewa się woda z Bałtyku – przez kanał, ujście, przekop albo przy sztormach. Ciągłe albo okazjonalne zasilanie – FV, sporadyczne – U1, brak połączenia z morzem – U2.

Wskaźnik kardynalny i – razem z chlorkami – najczęściej zaniżający ocenę (2013–2014: jeziora Dołgie Wielkie i Dołgie Małe są dobrze zachowane, ale słodkie, więc U2). Laguna z odciętym morzem przestaje być laguną.

Dlaczego: woda morska hamuje rozwój fitoplanktonu i zakwity, a zasolenie odróżnia 1150 od zwykłych jezior eutroficznych (3150). Odnowienie połączeń z morzem to jedno z głównych działań ochronnych.`,
    options: SALT_WATER,
    inputLabel: 'Zasilanie wodami słonymi',
    thresholds: { FV: 'Obecne, ciągłe lub okazjonalne', U1: 'Sporadyczne', U2: 'Brak' },
  }),
  measure({
    id: 'secchi',
    label: 'Przezroczystość wody',
    description: 'Widzialność krążka Secchiego w metrach. Większa przezroczystość wskazuje na lepszy stan; dla jezior przybrzeżnych zwykle 0,4–1 m.',
    help: `Co wpisać: głębokość, na której krążek Secchiego przestaje być widoczny, w metrach (z łodzi albo pomostu, po stronie zacienionej).

Uwaga: w płytkich lagunach woda łatwo się mąci – przy wietrznej pogodzie i dużym falowaniu wynik jest zaniżony (sprawozdanie 2013–2014). Mierz w spokojny dzień, a warunki zapisz w uwagach.

Progi: ≥0,5 m FV, 0,2–0,5 m U1, <0,2 m U2. Tab. 2 podaje U1 jako „0,2–0,4” – wartości między 0,4 a 0,5 m formularz traktuje jako U1 (interpretacja).

Dlaczego: niska widzialność to zwykle zakwit glonów, czyli eutrofizacja. Mętna woda ogranicza światło dla roślin zanurzonych. Wskaźnik kardynalny.`,
    thresholds: { FV: '≥0,5 m', U1: '0,2–0,4 m', U2: '<0,2 m' },
    unit: 'm',
    inputLabel: 'Widzialność krążka Secchiego',
    inputHelp: 'W metrach, np. 0,5. Krążek Secchiego, pomiar w spokojny dzień.',
    grade: gradeSecchi1150,
  }),
  measure({
    id: 'nitrogen',
    label: 'Azot ogólny',
    description: 'Wody zbiorników przybrzeżnych powinny być eutroficzne: azot ogólny 0,3–6,5 mg/dm³. Odchylenia w obie strony to stan niewłaściwy.',
    help: `Co wpisać: stężenie azotu ogólnego w próbce wody powierzchniowej z transektu, w mg N/dm³ (wynik laboratorium).

Od modyfikacji metodyki z 17.07.2015 oceniany jest azot ogólny zamiast nieorganicznego, z tymi samymi progami: 0,3–6,5 FV; powyżej 6,5 do 15 U1 („inne kombinacje”); poniżej 0,3 albo powyżej 15 U2. Przy przepisywaniu starszej karty możesz zaznaczyć, że to azot nieorganiczny.

Dlaczego: niska zawartość azotu nieorganicznego nie znaczy, że zbiornik jest czysty – azot może być związany w biomasie glonów. Stąd zmiana na azot ogólny. Wskaźnik kardynalny.

${WATER_SAMPLE}`,
    thresholds: { FV: '0,3–6,5 mg/dm³', U1: 'Inne kombinacje (6,5–15 mg/dm³)', U2: '<0,3 lub >15 mg/dm³' },
    unit: 'mg/dm³',
    inputLabel: 'Stężenie azotu',
    inputHelp: 'Stężenie w mg N/dm³, wynik z laboratorium.',
    grade: gradeNitrogen1150,
    extra: [{ kind: 'select', name: 'form', label: 'Forma azotu', options: N_FORM, defaultValue: 'total', help: 'Od 2015 r. azot ogólny. Azot nieorganiczny – tylko przy przepisywaniu starszych kart.' }],
    describe: (v, i) => `${plNum(v)} mg N/dm³${i.form === 'inorganic' ? ' (azot nieorganiczny)' : ''}`,
  }),
  measure({
    id: 'phosphorus',
    label: 'Fosfor ogólny',
    description: 'Wody zbiorników przybrzeżnych powinny być eutroficzne: fosfor ogólny 0,1–0,5 mg/dm³. Wyższe wartości świadczą o zanieczyszczeniu.',
    help: `Co wpisać: stężenie fosforu ogólnego w próbce wody powierzchniowej z transektu, w mg P/dm³ (wynik laboratorium).

Progi: ≤0,5 FV, 0,5–1,0 U1, >1,0 U2. Tab. 1 mówi o zakresie 0,1–0,5, ale tab. 2 i monitoring 2013–2014 (FV: <0,5) nie dają wartościom poniżej 0,1 gorszej oceny – formularz też nie, tylko ostrzega (interpretacja).

Dlaczego: podwyższony fosfor to zanieczyszczenie – ścieki, spływ z pól, dokarmianie ryb – i paliwo eutrofizacji. Wskaźnik kardynalny.

${WATER_SAMPLE}`,
    thresholds: { FV: '≤0,5 mg/dm³', U1: '0,5–1,0 mg/dm³', U2: '>1,0 mg/dm³' },
    unit: 'mg/dm³',
    inputLabel: 'Stężenie fosforu ogólnego',
    inputHelp: 'Stężenie w mg P/dm³, wynik z laboratorium.',
    grade: gradePhosphorus1150,
    warn: (v) => (v !== undefined && v < 0.1 ? 'Poniżej 0,1 mg/dm³ – tab. 1 mówi o zakresie 0,1–0,5, ale tab. 2 nie daje za to gorszej oceny. Sprawdź wynik i jednostkę (mg/dm³, nie µg/dm³).' : null),
    describe: (v) => `${plNum(v)} mg P/dm³`,
  }),
  measure({
    id: 'chlorides',
    label: 'Zawartość chlorków',
    description: 'Wody zbiorników przybrzeżnych powinny być słonawe: chlorki powyżej 500 mg/dm³. Wartość niższa to stan nieprawidłowy.',
    help: `Co wpisać: zawartość chlorków w próbce wody powierzchniowej z transektu, w mg Cl/dm³ (wynik laboratorium).

Progi: >500 FV, 200–500 U1, <200 U2.

Uwaga: chlorki wahają się z poziomem wód (niżówki, wezbrania), a w dużych zbiornikach jest gradient północ–południe – przy kanale do morza więcej, przy ujściach rzek mniej. To naturalne, ale zapisz położenie stanowiska względem kanału i ujść w opisie.

Dlaczego: zasolenie określa specyfikę laguny. Wskaźnik kardynalny – i najczęściej zaniżający ocenę (2013–2014: U2 na 38% stanowisk).

${WATER_SAMPLE}`,
    thresholds: { FV: '>500 mg/dm³', U1: '200–500 mg/dm³', U2: '<200 mg/dm³' },
    unit: 'mg/dm³',
    inputLabel: 'Zawartość chlorków',
    inputHelp: 'Zawartość w mg Cl/dm³, wynik z laboratorium.',
    grade: gradeChlorides1150,
    describe: (v) => `${plNum(v)} mg Cl/dm³`,
  }),
  measure({
    id: 'ph',
    label: 'Odczyn wody',
    description: 'pH wody (pH-metr w terenie). Właściwy zakres 6,5–8,0 (modyfikacja 2015).',
    help: `Co wpisać: pH wody powierzchniowej zmierzone pH-metrem na transekcie. Przewodność elektryczna (konduktometr) to dana uzupełniająca – nie wpływa na ocenę, ale warto ją zapisać.

Progi wg modyfikacji metodyki z 17.07.2015: FV 6,5–8,0; U1 6,0–6,49 albo 8,01–9,5; U2 <6,0 albo >9,5. (Przewodnik z 2010 r. miał FV 6,5–7,5 – nieaktualne.)

Uwaga: pH waha się nawet w ciągu doby (fotosynteza glonów podnosi je w dzień). Jeden pomiar to migawka – przy wyniku na granicy zapisz godzinę w uwagach.

Dlaczego: wysokie pH w eutroficznym zbiorniku to zwykle intensywna fotosynteza fitoplanktonu, niskie – dopływ zakwaszonych wód (np. z torfowisk). Wskaźnik kardynalny.`,
    thresholds: { FV: 'pH 6,5–8,0', U1: 'pH 6,0–6,49 lub 8,01–9,5', U2: 'pH <6,0 lub >9,5' },
    unit: 'pH',
    inputLabel: 'Odczyn wody',
    inputHelp: 'pH wody powierzchniowej z pH-metru, np. 7,4.',
    grade: gradePH1150,
    extra: [{ kind: 'number', name: 'conductivity', label: 'Przewodność elektryczna (opcjonalnie)', unit: 'µS/cm', min: 0, help: 'Dana uzupełniająca z konduktometru. Nie wpływa na ocenę.' }],
    warn: (v) => (v !== undefined && v > 14 ? 'pH powyżej 14? Sprawdź wpis.' : null),
    describe: (v, i) => {
      const c = num(i.conductivity)
      return `pH ${plNum(v)}${c !== undefined ? `, przewodność ${plNum(c)} µS/cm` : ''}`
    },
  }),
]

// ---------- pola stanowiska ----------

const SUBTYPES: SelectOption[] = [
  { value: '1150-1', label: '1150-1 Zalewy (Wiślany, Szczeciński)' },
  { value: '1150-2', label: '1150-2 Jeziora przybrzeżne' },
]

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu (linia prostopadła do brzegu), z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie.

Dlaczego: monitoruje się ciągle te same, raz wyznaczone stanowiska – transekt ma zostać powtórzony w tym samym miejscu za 3 lata.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Jezioro Bukowo, stanowisko 2',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – zwykle zbiornik i numer, np. „Bukowo 2”, „Zalew Wiślany – Przebrno”.

Dlaczego: w obrębie jeziora wyznacza się kilka stanowisk (zatoki, wypłycenia, okolice dopływów i odpływów, różne zagospodarowanie brzegu). Stabilna nazwa pozwala zestawić kolejne karty.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'select',
    name: 'subtype',
    label: 'Podtyp siedliska',
    options: SUBTYPES,
    required: true,
    help: `1150-1 – zalewy (Zalew Wiślany, Zalew Szczeciński); 1150-2 – jeziora przybrzeżne (Sarbsko, Łebsko, Dołgie Wielkie i Małe, Gardno, Wicko, Kopań, Bukowo, Jamno, Koprowo, Resko Przymorskie, Liwia Łuża).

Zatoka Pucka wewnętrzna to nie 1150, tylko duża płytka zatoka (1160).`,
  },
  {
    kind: 'text',
    name: 'waterBody',
    label: 'Nazwa obszaru (zbiornik)',
    required: true,
    placeholder: 'np. Jezioro Bukowo',
    help: 'Zbiornik, w którym leży stanowisko: jezioro albo zalew. W monitoringu 1150 „obszar” to badane jezioro.',
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Lemnetum trisulcae, Potametum pectinati, Phragmitetum australis',
    help: `Zbiorowiska roślinne stwierdzone na stanowisku, nazwami fitosocjologicznymi, oddzielone przecinkiem. Wodne (Potamion, Nymphaeion, Lemnion, Charion) i szuwarowe (Phragmition, Magnocaricion).

Formularz liczy te nazwy we wskaźniku „Liczba zbiorowisk”, jeśli nie wpiszesz tam niczego innego.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Położenie w zbiorniku, kanał do morza, ujścia, szerokość pasa szuwarów, dno litoralu, zagospodarowanie brzegu.',
    help: `Syntetyczny opis stanowiska:
• gdzie leży w zbiorniku (brzeg, zatoka, wypłycenie), odległość od kanału łączącego z morzem i od ujść rzek;
• szerokość pasa szuwarów i ich skład (trzcina, oczeret, pałki);
• dno litoralu (piaszczyste, muliste);
• roślinność wodna – co widać z łodzi i pod wodą;
• zagospodarowanie brzegu: pola, zabudowa, porty, pomosty, punktowe źródła zanieczyszczeń.

Dlaczego: stanowiska wyznacza się tam, gdzie zmienia się użytkowanie brzegu albo kształt misy. Opis pozwala zrozumieć, skąd różnice między stanowiskami tego samego jeziora.`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Powierzchnia siedliska (fitolitoralu) na stanowisku albo zbiornika, w hektarach – z GIS lub danych archiwalnych.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas'),
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    defaultValue: '50x30 m, podwodny',
    required: true,
    hint: 'Standard to 50×30 m, transekt nurkowy prostopadły do brzegu.',
    help: `Transekt pasowy prostopadły do linii brzegu, 50×30 m, badany nurkowo. Trzy strefy głębokości: A 0–0,25 m, B 0,25–0,5 m, C 0,5–1,0 m, w każdej 10 losowych poletek 0,1 m². Spis frekwencji wpisujesz we wskaźniku „Obecność hydrofitów”.

Gdy transekt trzeba było dopasować do terenu (pas szuwaru, głębokość), wpisz faktyczne wymiary.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    defaultValue: '0',
    required: true,
    help: 'Laguny leżą praktycznie na poziomie morza – zwykle 0 m.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 20.09.2008',
    required: true,
    hint: 'Optymalnie od lipca do końca września.',
    help: 'Dzień badań terenowych (nurkowanie, próbki wody). Badania powtarza się raz na 3 lata, optymalnie od początku lipca do końca września.',
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 7 && m <= 9 ? null : 'Termin poza optymalnym oknem (lipiec–wrzesień). Roślinność podwodna może być nierozwinięta.'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcie fitosocjologiczne szuwaru ----------

const releveFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'coords',
    label: 'Współrzędne środka zdjęcia',
    help: 'Współrzędne GPS środka powierzchni 5×5 m.',
  },
  {
    kind: 'number',
    name: 'area',
    group: 'Powierzchnia i pokrycie',
    label: 'Powierzchnia zdjęcia',
    unit: 'm²',
    min: 0,
    defaultValue: 25,
    help: 'Standard metodyki to 5×5 m = 25 m². Zmieniaj tylko, gdy płat jest mniejszy.',
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
    placeholder: 'np. Phragmitetum australis',
    help: 'Zespół szuwarowy (albo kilka, gdy płat jest mozaiką), do którego należy zdjęcie.',
  },
  {
    kind: 'releve-species',
    name: 'species',
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: `Wszystkie gatunki na powierzchni 5×5 m z ilościowością w siedmiostopniowej skali Braun-Blanqueta (r, +, 1–5). Rośliny szuwarowe i wodne (w tym rzęsy między trzciną) wpisuj w warstwie C – w szuwarze nie ma warstw A i B, a D tylko dla mchów wodnych.`,
  },
]

export const methodology1150: Methodology = {
  code: '1150',
  name: 'Zalewy i jeziora przymorskie (laguny)',
  priority: true,
  source:
    'Zalewska-Gałosz J. 2010, Zalewy i jeziora przymorskie (laguny), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ, s. 36–45 (tab. 1 i 2), z modyfikacją metodyki z 17.07.2015',

  siteFields,

  releves: {
    defaultCount: 1,
    intro:
      'Na stanowiskach z roślinnością szuwarową wykonaj jedno zdjęcie fitosocjologiczne w każdym jednorodnym płacie szuwaru – tyle zdjęć, ile zbiorowisk szuwarowych. Powierzchnia 5×5 m, skala Braun-Blanqueta. Roślinność podwodną opisuje transekt nurkowy (wskaźnik „Obecność hydrofitów”).',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Realne możliwości zachowania właściwego stanu albo poprawy stanu niewłaściwego. Za właściwe uznaje się perspektywy zbiorników, w których występują makrofity, ramienice i można wyróżnić ich zbiorowiska.',
    help: `Oceniając perspektywy, weź pod uwagę stan całej zlewni bezpośredniej, a nie tylko stanowiska: dopływ zanieczyszczonych wód słodkich, zagospodarowanie brzegów, gospodarkę rybacką (dokarmianie ryb, zarybianie gatunkami roślinożernymi), stan połączenia z morzem, tempo zarastania trzciną.

W opisie umieść informację o potencjalnych zabiegach ochronnych: wykaszanie trzciny, odnowienie (poszerzenie) połączenia z morzem, uregulowanie gospodarki wodno-ściekowej, zakaz intensyfikacji gospodarki rybackiej.

Praktyka 2013–2014: FV dostały stanowiska bez znaczącego dopływu zanieczyszczonych wód słodkich i z niezagospodarowanymi brzegami (jeziora Dołgie w Słowińskim PN, część Bukowa).`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających (eutrofizacja, zarastanie trzciną), nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A08', name: 'Nawożenie /nawozy sztuczne/' },
    { code: 'D03.01', name: 'Obszary portowe' },
    { code: 'E01', name: 'Tereny zurbanizowane, tereny zamieszkane' },
    { code: 'F01', name: 'Akwakultura morska i słodkowodna' },
    { code: 'F02', name: 'Rybołówstwo i zbieranie zasobów wodnych' },
    { code: 'F02.01', name: 'Rybołówstwo bierne' },
    { code: 'F02.02', name: 'Rybołówstwo czynne' },
    { code: 'F02.03', name: 'Wędkarstwo' },
    { code: 'G01.01', name: 'Żeglarstwo' },
    { code: 'H01', name: 'Zanieczyszczenie wód powierzchniowych (limnicznych, lądowych, morskich i słonawych)' },
    { code: 'H01.03', name: 'Inne zanieczyszczenie wód powierzchniowych ze źródeł punktowych' },
    { code: 'H01.05', name: 'Rozproszone zanieczyszczenie wód powierzchniowych z powodu działalności związanej z rolnictwem i leśnictwem' },
    { code: 'H01.08', name: 'Rozproszone zanieczyszczenie wód powierzchniowych z powodu ścieków z gospodarstw domowych' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'J02.02.01', name: 'Bagrowanie / usuwanie osadów limnicznych' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód - ogólnie' },
    { code: 'J02.12', name: 'Tamy, wały, sztuczne plaże - ogólnie' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. ptaki wodno-błotne, ryby, sąsiedztwo innych siedlisk (1130, 1160, 3150).',
        help: 'Wartości przyrodnicze stanowiska poza samym siedliskiem: ptaki wodno-błotne, ichtiofauna, rzadkie gatunki roślin, sąsiedztwo innych siedlisk (ujścia rzek 1130, zatoki 1160, wydmy, łąki słonoroślowe). Brak informacji – „Nie pozyskano danych”.',
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: `Jakie działania ochronne wykonano i jaka jest ich skuteczność, oraz co proponujesz. Typowe dla 1150: wykaszanie rozrastającej się trzciny, odnowienie połączeń jezior z morzem, uregulowanie gospodarki wodno-ściekowej w zlewni, likwidacja źródeł zanieczyszczeń, zakaz wyrębu drzew w strefie przybrzeżnej, zakaz intensyfikacji gospodarki rybackiej (dokarmiania ryb, zarybiania roślinożercami). Brak działań – „Brak”.`,
      }
    return f
  }),

  speciesCatalog: SPECIES_1150.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer1150(s) })),
  speciesInfo: (name) => {
    const e = findSpecies1150(name)
    return e ? GROUP_LABELS_1150[e.group] : undefined
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator1150 = (id: string): IndicatorDef => {
  const i = methodology1150.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 1150`)
  return i
}
