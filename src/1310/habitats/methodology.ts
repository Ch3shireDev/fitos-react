// Metodyka 1310 (śródlądowe błotniste solniska z solirodkiem, Salicornion ramosissimae) jako dane.
// Źródło: Bosiacka B. 2012, „1310 Śródlądowe błotniste solniska z solirodkiem” [w:] Mróz W. (red.), Monitoring siedlisk
// przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 59–71 (tab. 1 i 2), z praktyką ocen ze sprawozdań z monitoringu
// 2016 i 2021: 7 wskaźników struktury, z czego 4 kardynalne; „Ekspansja krzewów i podrostu drzew” (nie ma zastosowania),
// „Zachowanie strefy ekotonowej” i „Procent powierzchni zajęty przez siedlisko na transekcie” wypadły od 2016 r.
// Siedlisko to kilka rozproszonych płatów przy wysiękach solanki – transekt bywa niestandardowy albo go nie ma,
// a zdjęcia robi się w każdym płacie. Z modułu leśnego brane są tylko klocki generyczne (choiceIndicator, speciesCoverIndicator).
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology, SelectOption, SpeciesRow } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { choiceIndicator, fmt, labelOf, pickField, plNum, speciesCoverIndicator, speciesInput, type GradedOption } from '../../forest'
import { GROUP_LABELS_1310, SALICORNIA, SPECIES_1310, defaultLayer1310, findSpecies1310, isHalophyteGroup, isSalicornia } from './species'

// ---------- progi liczbowe (tab. 2) ----------

/** Stosunek powierzchni płatów do potencjalnej: 75–100% FV, 50–75% U1, <50% U2 (granice 75 i 50 – do lepszej klasy). */
export const gradeRatio1310 = (pct: number): Grade => (pct >= 75 ? 'FV' : pct >= 50 ? 'U1' : 'U2')
/** Soliród zielny w % łącznej powierzchni płatów: 50–100% FV, 25–50% U1, <25% U2. */
export const gradeSalicornia1310 = (pct: number): Grade => (pct >= 50 ? 'FV' : pct >= 25 ? 'U1' : 'U2')
/** Obce inwazyjne i rodzime ekspansywne – udział: <10% FV, 10–25% U1, >25% U2. */
export const gradeShare1310 = (pct: number): Grade => (pct < 10 ? 'FV' : pct <= 25 ? 'U1' : 'U2')
/** Promień rozproszenia płatów wokół wypływów (interpretacja „kilkuset / kilkudziesięciu / kilku metrów”): ≥100 m FV, 10–99 m U1, <10 m U2. */
export const gradeRadius1310 = (m: number): Grade => (m >= 100 ? 'FV' : m >= 10 ? 'U1' : 'U2')
/** ECe poniżej tego progu (dS/m) to gleba za słaba dla solirodu – ostrzeżenie przy „FV” (interpretacja, por. sprawozdanie 2021). */
export const ECE_LOW = 16

// ---------- powierzchnia ----------

const AREA_TREND: GradedOption[] = [
  { value: 'increase', label: 'Zwiększa się', grade: 'FV' },
  { value: 'stable', label: 'Nie podlega zmianom', grade: 'FV' },
  { value: 'decrease', label: 'Zmniejsza się nieznacznie', grade: 'U1' },
  { value: 'strongDecrease', label: 'Znaczny spadek w porównaniu z wcześniejszymi badaniami lub danymi historycznymi', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]

// ---------- stosunek do powierzchni potencjalnej ----------

/** Udział płatów w powierzchni potencjalnej: wpisany wprost ma pierwszeństwo, inaczej liczony z m². */
export function ratioOf(i: InputValues): { pct?: number; from?: 'typed' | 'areas' } {
  const typed = num(i.share)
  if (typed !== undefined) return { pct: typed, from: 'typed' }
  const patches = num(i.patches)
  const potential = num(i.potential)
  if (patches === undefined || potential === undefined || potential <= 0) return {}
  return { pct: Math.round((patches / potential) * 1000) / 10, from: 'areas' }
}

// ---------- gatunki ----------

const named = (value: unknown): SpeciesRow[] => speciesRows(value).filter((r) => r.name?.trim())
const groupOf = (name: string) => findSpecies1310(name)?.group
const salicorniaRow = (rows: SpeciesRow[]) => rows.find((r) => isSalicornia(r.name))

/** Gatunki dominujące: kto dominuje i przy jakim pokryciu warstwy C. */
export function dominance1310(i: InputValues): {
  grade: Grade | null
  reason: string
} {
  const rows = named(i.species)
  if (!rows.length) return { grade: null, reason: '' }
  const cover = (r?: SpeciesRow) => (r ? num(r.cover) : undefined)
  const sal = salicorniaRow(rows)
  const s = cover(sal)
  if (rows.some((r) => num(r.cover) === undefined)) return { grade: null, reason: 'Wpisz pokrycie każdego dominanta.' }
  const halo = rows.filter((r) => !isSalicornia(r.name) && isHalophyteGroup(groupOf(r.name)))
  const nonHalo = rows.filter((r) => !isSalicornia(r.name) && !isHalophyteGroup(groupOf(r.name)))
  const nonHaloTotal = nonHalo.reduce((a, r) => a + (num(r.cover) ?? 0), 0)
  const maxNonHalo = Math.max(0, ...nonHalo.map((r) => num(r.cover) ?? 0))
  const maxHalo = Math.max(0, ...halo.map((r) => num(r.cover) ?? 0))
  if (s === undefined) return { grade: 'U2', reason: 'Soliród zielny nie jest wśród dominantów.' }
  if (maxNonHalo >= s)
    return { grade: 'U2', reason: `Gatunki indyferentne / glikofity (${describeSpecies(nonHalo)}) pokrywają tyle co soliród albo więcej.` }
  if (nonHaloTotal > 25)
    return { grade: 'U2', reason: `Gatunki indyferentne / glikofity łącznie ${fmt(nonHaloTotal)} – wyraźna ekspansja (próg >25% to interpretacja).` }
  const c = num(i.coverC)
  if (c === undefined) return { grade: null, reason: 'Wpisz pokrycie warstwy C.' }
  const codominant = maxHalo >= s
  if (codominant)
    return c < 25
      ? { grade: 'U2', reason: `Soliród współdominuje z innymi halofitami przy pokryciu warstwy C ${fmt(c)} (<25%).` }
      : { grade: 'U1', reason: `Soliród współdominuje z innymi halofitami (${describeSpecies(halo.filter((r) => (num(r.cover) ?? 0) >= s))}).` }
  const g = c >= 50 ? 'FV' : c >= 25 ? 'U1' : 'U2'
  return { grade: g, reason: `Dominuje soliród zielny (${fmt(s)}), pokrycie warstwy C ${fmt(c)}.` }
}

// ---------- zasilanie wodami słonymi ----------

const SALT_WATER: GradedOption[] = [
  {
    value: 'free',
    label: 'Swobodny wypływ / dopływ / podsiąkanie solanki, rozlewanie się i stagnowanie słonej wody, wysokie zasolenie',
    grade: 'FV',
  },
  {
    value: 'limited',
    label: 'Zasilanie ograniczone (osuszenie, ograniczony dopływ, rozcieńczanie solanki wylewami rzeki lub słabiej zasolonymi wodami morskimi)',
    grade: 'U1',
  },
  { value: 'degraded', label: 'Czynniki osłabiające zasilanie jak wyżej, ale o większym natężeniu – prowadzą do degradacji siedliska', grade: 'U2' },
]

const SALT_SOURCE: SelectOption[] = [
  { value: 'natural', label: 'Naturalne (ascenzja solanek, wysięki)' },
  { value: 'anthropogenic', label: 'Antropogeniczne (tężnie, warzelnie, przemysł sodowy, zrzut solanki)' },
]

// ---------- struktura przestrzenna ----------

const SPATIAL: GradedOption[] = [
  { value: 'hundreds', label: 'Płaty rozproszone, wykształcone w promieniu kilkuset metrów wokół wypływów solanki', grade: 'FV' },
  { value: 'tens', label: 'Płaty rozproszone, wykształcone w promieniu kilkudziesięciu metrów wokół wypływów solanki', grade: 'U1' },
  { value: 'few', label: 'Płaty rozproszone, wykształcone w promieniu kilku metrów wokół wypływów solanki', grade: 'U2' },
  { value: 'none', label: 'Siedliska nie stwierdzono', grade: 'U2' },
]

// ---------- wskaźniki ----------

const spatialBase = choiceIndicator({
  id: 'spatial',
  label: 'Struktura przestrzenna płatów siedliska',
  cardinal: true,
  description: 'Na stanowiskach naturalnych typowe jest rozproszenie niewielkich płatów siedliska, rozwijających się w najbliższym sąsiedztwie wypływów solanki.',
  help: `Co wybrać: w jakim promieniu wokół wypływów (wysięków) solanki rozwijają się płaty z solirodem. Im szerzej słona woda rozlewa się i stagnuje, tym szerzej sięgają płaty – kilkaset metrów to FV, kilkadziesiąt U1, kilka metrów U2. Gdy płatów w ogóle nie ma (sprawozdanie 2021: Leszcze) – „Siedliska nie stwierdzono”, U2.

Możesz wpisać promień w metrach – formularz podpowie klasę (≥100 m FV, 10–99 m U1, <10 m U2; „kilkanaście metrów” przewodnik pomija, liczone jako U1 – interpretacja) i ostrzeże, gdy nie zgadza się z wyborem.

Praktyka 2021: FV dostał typowy mozaikowy układ płatów z solirodem i miejsc nagich (skrajne zasolenie), U1 płaty przeplatane fragmentami solnisk nadmorskich i szuwarem trzcinowym, U2 duże rozproszenie wśród szuwarów i łąk.

Dlaczego: zasięg płatów pokazuje, jak daleko sięga wpływ solanki. Kurczenie się do kilku metrów wokół wysięku to zapowiedź zaniku. Wskaźnik kardynalny.`,
  options: SPATIAL,
  inputLabel: 'Rozmieszczenie płatów',
  after: [
    {
      kind: 'number',
      name: 'radius',
      label: 'Promień płatów wokół wypływów (opcjonalnie)',
      unit: 'm',
      min: 0,
      help: 'Na jaką odległość od wypływów solanki sięgają płaty z solirodem, w metrach. Opcjonalne – tylko sprawdza wybór powyżej.',
    },
  ],
  thresholds: {
    FV: 'Płaty siedliska rozproszone, wykształcone w promieniu kilkuset metrów wokół wypływów solanki',
    U1: 'Płaty siedliska rozproszone, wykształcone w promieniu kilkudziesięciu metrów wokół wypływów solanki',
    U2: 'Płaty siedliska rozproszone, wykształcone w promieniu kilku metrów wokół wypływów solanki',
  },
})

const saltBase = choiceIndicator({
  id: 'saltWater',
  label: 'Zasilanie wodami słonymi',
  cardinal: true,
  description:
    'Intensywność zasilania siedliska w słoną wodę, trwałość i regularność zasilania, poziom zasolenia wody, stopień zmeliorowania siedliska i terenów przyległych oraz źródło zasolenia (naturalne, antropogeniczne).',
  help: `Co wybrać: jak solanka dociera do płatów. Swobodny wypływ albo podsiąkanie, słona woda rozlewa się i stagnuje, zasolenie wysokie – FV. Zasilanie ograniczone przez osuszenie (rowy), mniejszy dopływ albo rozcieńczanie solanki wylewami rzeki – U1. To samo, ale tak silne, że siedlisko się degeneruje – U2.

Pomiary (opcjonalne, ale przewodnik ich wymaga): głębokość lustra wody gruntowej i jej zasolenie, zasolenie wody stagnującej i w rowach, zasolenie gleby w strefie korzeni (0–25 cm) jako przewodność nasyconego ekstraktu glebowego ECe. Wpisz je – trafią do karty. Sprzęt: świder glebowy, szpadel, konduktometr polowy, pudełka na ekstrakt, woda destylowana.

Skala ECe: optimum solirodu na solniskach zasilanych solanką to ok. 39 dS/m (sprawozdanie 2021: Kołobrzeg 30–43 dS/m – FV, Ciechocinek 59–80, Mątwy 49–63; Leszcze 6,6–13,7 dS/m – za mało, U2). Formularz ostrzega, gdy wybierzesz FV przy ECe poniżej ${ECE_LOW} dS/m (interpretacja).

Dlaczego: to najważniejszy wskaźnik siedlisk zasolonych. Bez stałego dopływu solanki soliród ustępuje słonym łąkom, a te trzcinie. Wskaźnik kardynalny.`,
  options: SALT_WATER,
  inputLabel: 'Zasilanie solanką',
  after: [
    { kind: 'select', name: 'source', label: 'Źródło zasolenia', options: SALT_SOURCE, help: 'Naturalne – ascenzja reliktowych solanek mezozoicznych (Kołobrzeg, Wyspa Chrząszczewska). Antropogeniczne – tężnie, warzelnie, przemysł sodowy (Ciechocinek, Inowrocław-Mątwy, Janikowo).' },
    { kind: 'number', name: 'ece', label: 'Zasolenie gleby ECe (0–25 cm)', unit: 'dS/m', min: 0, help: 'Przewodność elektryczna nasyconego ekstraktu glebowego z warstwy 0–25 cm, w dS/m (= mS/cm). Kilka prób – wpisz średnią albo typową, zakres w opisie.' },
    { kind: 'number', name: 'groundwater', label: 'Głębokość lustra wody gruntowej', unit: 'cm', help: 'Od powierzchni gruntu, w cm. Woda na powierzchni (stagnuje) – wpisz 0.' },
    { kind: 'number', name: 'waterEc', label: 'Przewodność wody (gruntowej / stagnującej)', unit: 'mS/cm', min: 0, help: 'Zasolenie wody gruntowej albo stagnującej w płatach i rowach, z konduktometru, w mS/cm. Dla porównania: Bałtyk przy brzegu ok. 10–12 mS/cm.' },
    { kind: 'textarea', name: 'note', label: 'Opis zasilania', rows: 2, help: 'Skąd solanka, gdzie wysięki, czy woda stagnuje, rowy melioracyjne, odległość od rzeki. Trafia do pola „wartość” karty.' },
  ],
})

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description: 'Zmiana sumarycznej powierzchni płatów siedliska na stanowisku w porównaniu z wcześniejszymi badaniami albo danymi historycznymi.',
    help: `Co wybrać: jak zmieniła się łączna powierzchnia płatów z solirodem od poprzedniej obserwacji (albo względem danych historycznych). Nie zmienia się albo rośnie – FV, znaczny spadek – U2, inne sytuacje – U1. Pierwsze badanie bez danych do porównania – XX.

Powierzchnię płatów (m²) wpisz poniżej – przy kilku rozproszonych płatach zsumuj je. Oszacowanie opiera się na danych historycznych i bieżącej ocenie potencjalnej wielkości siedliska: zasoleniu i wilgotności gleby, dopływie słonej wody, rozmieszczeniu solirodu zielnego.

Praktyka 2021: przy bardzo małym udziale w powierzchni potencjalnej (Ciechocinek, ok. 1%) parametr oceniano na U2, przy pofragmentowaniu przez trzcinę na U1 – popraw podpowiedź, jeśli trzeba.`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się',
      U1: 'Inne kombinacje',
      U2: 'Znaczny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi historycznymi',
    },
    inputs: [
      {
        kind: 'select',
        name: 'trend',
        label: 'Zmiana powierzchni',
        options: AREA_TREND.map(({ value, label }) => ({ value, label })),
        help: 'Kierunek zmiany łącznej powierzchni płatów od poprzedniego badania. Zostaw puste, gdy ocenę wystawiasz sam (np. przepisując starą kartę).',
      },
      { kind: 'number', name: 'areaM2', label: 'Powierzchnia płatów', unit: 'm²', min: 0, help: 'Łączna powierzchnia płatów siedliska na stanowisku w m² (1 ar = 100 m², 0,15 ha = 1500 m²). Opcjonalne – trafi do pola „wartość”.' },
    ],
    suggest: (i) => AREA_TREND.find((o) => o.value === i.trend)?.grade ?? null,
    describe: (i) => {
      const a = num(i.areaM2)
      return [a !== undefined ? `${plNum(a)} m²` : '', i.trend ? labelOf(AREA_TREND, i.trend).toLowerCase() : ''].filter(Boolean).join(', ')
    },
  },
  {
    id: 'ratio',
    label: 'Stosunek powierzchni płatów siedliska do potencjalnej powierzchni siedliska na stanowisku',
    parameter: 'structure',
    description:
      'Procentowa ocena sumarycznej powierzchni płatów siedliska w stosunku do potencjalnej powierzchni siedliska na stanowisku. Zastępuje „procent powierzchni na transekcie”, który przy rozproszonych płatach mija się z celem.',
    help: `Co wpisać: łączną powierzchnię płatów z solirodem i potencjalną powierzchnię siedliska na stanowisku (tam, gdzie zasolenie i wilgotność gleby pozwalają na rozwój solirodu – zwykle obszar zasilany solanką, np. dawny areał halofitów w rezerwacie). Formularz policzy udział. Możesz też wpisać udział wprost – ma pierwszeństwo.

Progi: 75–100% FV, 50–75% U1, <50% U2 (wartości 75% i 50% liczone do lepszej klasy – interpretacja).

Praktyka 2021: Mątwy – siedlisko na całej potencjalnej powierzchni, FV; Kołobrzeg i Wyspa Chrząszczewska – areał uszczuplony o 50% i 30% przez szuwar trzcinowy, U1; Ciechocinek – ok. 240 m² na rezerwat, ok. 1%, U2.

Dlaczego: obecność innych siedlisk między płatami 1310 nie musi być zniekształceniem, ale zarastanie potencjalnego areału przez trzcinę już tak.`,
    thresholds: {
      FV: 'Płaty siedliska zajmują łącznie 75–100% potencjalnej powierzchni siedliska',
      U1: 'Płaty siedliska zajmują łącznie 50–75% potencjalnej powierzchni siedliska',
      U2: 'Płaty siedliska zajmują łącznie <50% potencjalnej powierzchni siedliska',
    },
    inputs: [
      { kind: 'number', name: 'patches', label: 'Powierzchnia płatów', unit: 'm²', min: 0, help: 'Suma powierzchni wszystkich płatów z solirodem na stanowisku, w m².' },
      { kind: 'number', name: 'potential', label: 'Potencjalna powierzchnia siedliska', unit: 'm²', min: 0, help: 'Powierzchnia, na której siedlisko mogłoby się rozwijać (zasięg wpływu solanki), w m².' },
      { kind: 'number', name: 'share', label: 'Udział wprost (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Gdy nie masz powierzchni w m², wpisz szacowany udział płatów w powierzchni potencjalnej. Ma pierwszeństwo przed wyliczeniem.' },
    ],
    suggest: (i) => {
      const { pct } = ratioOf(i)
      return pct === undefined ? null : gradeRatio1310(pct)
    },
    explain: (i) => {
      const { pct, from } = ratioOf(i)
      return pct !== undefined && from === 'areas' ? `Płaty zajmują ${fmt(pct)} powierzchni potencjalnej.` : null
    },
    warn: (i) => {
      const p = num(i.patches)
      const q = num(i.potential)
      return p !== undefined && q !== undefined && p > q ? 'Płaty większe niż powierzchnia potencjalna? Sprawdź wpis.' : null
    },
    describe: (i) => {
      const { pct } = ratioOf(i)
      if (pct === undefined) return ''
      const p = num(i.patches)
      const q = num(i.potential)
      return p !== undefined && q !== undefined && num(i.share) === undefined ? `${fmt(pct)} (${plNum(p)} z ${plNum(q)} m²)` : fmt(pct)
    },
  },
  {
    id: 'characteristic',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Za gatunek charakterystyczny uznaje się tylko soliród zielny Salicornia europaea; ewentualnie dodatkowo inne pionierskie halofity obligatoryjne i halofity najbardziej podmokłych miejsc.',
    help: `Co wpisać: soliród zielny Salicornia europaea z pokryciem w % łącznej powierzchni płatów siedliska. Inne pionierskie halofity (muchotrzew solniskowy Spergularia salina, mannica nadmorska Puccinellia maritima, łoboda oszczepowata odm. solniskowa Atriplex prostrata var. salina) oraz aster solny Aster tripolium i mannica odstająca Puccinellia distans możesz dopisać – trafią do karty, ale ocena idzie wyłącznie z solirodu.

Progi: soliród pokrywa 50–100% łącznej powierzchni płatów – FV, 25–50% – U1, <25% – U2. Brak solirodu na liście – U2.

Uwaga terminowa: w suche lata (2016) pędy solirodu w październiku były w większości zaschnięte i trudne do rozpoznania – badaj w lipcu–wrześniu.

Dlaczego: płaty z solirodem mają charakter agregacyjny, a soliród jest dominantem i jedynym gatunkiem charakterystycznym zespołu. Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Soliród zielny Salicornia europaea pokrywa 50–100% łącznej powierzchni płatów siedliska',
      U1: 'Soliród zielny Salicornia europaea pokrywa 25–50% łącznej powierzchni płatów siedliska',
      U2: 'Soliród zielny Salicornia europaea pokrywa <25% łącznej powierzchni płatów siedliska',
    },
    inputs: [speciesInput('Gatunki charakterystyczne', `Soliród zielny (${SALICORNIA}) z pokryciem w % łącznej powierzchni płatów; opcjonalnie inne pionierskie halofity.`, true)],
    suggest: (i) => {
      const rows = named(i.species)
      if (!rows.length) return null
      const sal = salicorniaRow(rows)
      if (!sal) return 'U2'
      const c = num(sal.cover)
      return c === undefined ? null : gradeSalicornia1310(c)
    },
    explain: (i) => {
      const rows = named(i.species)
      if (!rows.length) return null
      const sal = salicorniaRow(rows)
      const others = rows.filter((r) => !isSalicornia(r.name))
      const head = sal ? `Soliród zielny: ${fmt(num(sal.cover))}.` : 'Na liście nie ma solirodu zielnego – U2.'
      return others.length ? `${head} Pozostałe (nie liczą się do oceny): ${others.map((r) => r.name.trim()).join(', ')}.` : head
    },
    warn: (i) => {
      const sal = salicorniaRow(named(i.species))
      return sal && num(sal.cover) === undefined ? 'Wpisz pokrycie solirodu – od niego zależy ocena.' : null
    },
    describe: (i) => describeSpecies(named(i.species)),
  },
  {
    id: 'dominant',
    label: 'Gatunki dominujące',
    parameter: 'structure',
    description:
      'Pokrywanie roślinności i relacje ilościowe grup gatunków: pionierskich halofitów obligatoryjnych, innych halofitów obligatoryjnych, halofitów fakultatywnych, gatunków indyferentnych i glikofitów – z największą wagą dla solirodu.',
    help: `Co wpisać: kilka gatunków o największym pokryciu w płatach, z pokryciem w %, i pokrycie całej warstwy zielnej (C). Formularz rozpoznaje grupy z katalogu (halofity vs gatunki indyferentne i glikofity); gatunek spoza katalogu liczy się jako niehalofit.

Jak liczy formularz (interpretacja tab. 2):
• soliród nie jest dominantem albo gatunek indyferentny / glikofit pokrywa tyle co soliród lub więcej – U2;
• gatunki indyferentne i glikofity łącznie >25% („wyraźna ekspansja trzciny”, próg jak przy ekspansywnych) – U2;
• inny halofit pokrywa tyle co soliród lub więcej (współdominacja) – U1, a przy warstwie C <25% – U2;
• dominuje soliród: warstwa C 50–100% – FV, 25–50% – U1, <25% – U2.

Przewodnik: niską ocenę dostają też płaty skrajnie zasolone lub długo podtapiane – soliród dominuje, ale pokrywa bardzo mało – oraz płaty przeschnięte lub wysłodzone – duże pokrycie roślinności, mało solirodu.

Przykład z karty 2009: soliród 60%, mannica odstająca i muchotrzew po 10%, aster 5%, trzcina 15%, warstwa C 80–95% – FV.`,
    thresholds: {
      FV: 'Dominuje soliród zielny Salicornia europaea przy pokrywaniu warstwy c 50–100%, mogą towarzyszyć inne halofity',
      U1: 'Dominuje soliród zielny przy pokrywaniu warstwy c 25–50%, towarzyszą inne halofity lub współdominuje soliród i inne halofity przy wyższym pokrywaniu roślinności',
      U2: 'Dominuje soliród zielny przy pokrywaniu warstwy c <25% lub współdominuje z innymi halofitami; towarzyszą gatunki indyferentne i glikofity, m.in. wyraźna ekspansja trzciny',
    },
    inputs: [
      speciesInput('Gatunki dominujące', 'Kilka gatunków o największym pokryciu w płatach, z pokryciem w %.', true),
      { kind: 'number', name: 'coverC', label: 'Pokrycie warstwy C', unit: '%', min: 0, max: 100, help: 'Łączne pokrycie roślinności zielnej w płatach (rzut pionowy), w %. Przy kilku zdjęciach – średnia ze zdjęć.' },
    ],
    suggest: (i) => dominance1310(i).grade,
    explain: (i) => dominance1310(i).reason || null,
    describe: (i) => {
      const list = describeSpecies(named(i.species))
      const c = num(i.coverC)
      return [list, c !== undefined ? `pokrycie warstwy C ${fmt(c)}` : ''].filter(Boolean).join('; ')
    },
  },
  speciesCoverIndicator({
    id: 'invasive',
    label: 'Obce gatunki inwazyjne',
    description: 'Ze względu na ekstremalne warunki nie stwierdzono w płatach siedliska żadnych obcych gatunków inwazyjnych; szansa ich sporadycznego wystąpienia jest bardzo mała.',
    help: `Co wpisać: każdy gatunek obcy w płatach siedliska, z pokryciem w %. Brak – zostaw listę pustą (tak było na wszystkich stanowiskach w 2009, 2016 i 2021 r.).

Progi: łączny udział <10% – FV, 10–25% – U1, >25% – U2.

Dlaczego: skrajne zasolenie odsiewa prawie wszystko, więc obcy gatunek na słonym błocie to sygnał, że siedlisko wysładza się albo przesycha.`,
    thresholds: { FV: 'Brak lub udział gatunków obcych <10%', U1: 'Udział gatunków obcych 10–25%', U2: 'Udział gatunków obcych >25%' },
    inputLabel: 'Obce gatunki inwazyjne',
    inputHelp: 'Gatunki obce z pokryciem w % powierzchni płatów. Brak – zostaw pustą listę.',
    grade: ({ count, total }) => (count === 0 ? 'FV' : total === undefined ? null : gradeShare1310(total)),
  }),
  speciesCoverIndicator({
    id: 'expansive',
    label: 'Rodzime gatunki ekspansywne roślin zielnych',
    cardinal: true,
    description:
      'Ze względu na ekstremalne warunki tylko nieliczne gatunki ekspansywne wkraczają na siedlisko, zwykle ze znacznie osłabioną żywotnością – głównie trzcina pospolita i mietlica rozłogowa.',
    help: `Co wpisać: rodzime gatunki ekspansywne w płatach siedliska, z pokryciem w %: trzcina pospolita Phragmites australis, mietlica rozłogowa Agrostis stolonifera, a na przesychających stanowiskach także mozga trzcinowata, trzcinnik piaskowy, kostrzewa trzcinowata. Brak – zostaw listę pustą.

Progi: łączny udział <10% – FV, 10–25% – U1, >25% – U2 (granice 10% i 25% – do U1, interpretacja).

Praktyka: Kołobrzeg-Budzistowo – trzcina 15% w 2009 r. (U1), 20% w 2016 r. (U1), 60% w 2021 r. (U2). Ekspansja trzciny to dziś główna przyczyna złego stanu siedliska.

Dlaczego: trzcina wkracza, gdy solanka słabnie albo teren przesycha, i zabiera solirodowi światło i miejsce. Wskaźnik kardynalny.`,
    thresholds: { FV: 'Brak lub udział gatunków ekspansywnych <10%', U1: 'Udział gatunków ekspansywnych 10–25%', U2: 'Udział gatunków ekspansywnych >25%' },
    inputLabel: 'Gatunki ekspansywne',
    inputHelp: 'Rodzime gatunki ekspansywne z pokryciem w % powierzchni płatów. Brak – zostaw pustą listę.',
    grade: ({ count, total }) => (count === 0 ? 'FV' : total === undefined ? null : gradeShare1310(total)),
  }),
  {
    ...spatialBase,
    suggest: (i) => {
      const r = num(i.radius)
      if (i.choice === 'none') return 'U2'
      if (!i.choice && r !== undefined) return gradeRadius1310(r)
      return spatialBase.suggest!(i)
    },
    warn: (i) => {
      const r = num(i.radius)
      if (r === undefined || !i.choice || i.choice === 'none') return null
      const chosen = SPATIAL.find((o) => o.value === i.choice)?.grade
      const g = gradeRadius1310(r)
      return chosen && chosen !== g ? `${plNum(r)} m to klasa „${SPATIAL.find((o) => o.grade === g)!.label}”.` : null
    },
    describe: (i) => {
      const r = num(i.radius)
      return [labelOf(SPATIAL, i.choice), r !== undefined ? `promień ok. ${plNum(r)} m` : ''].filter(Boolean).join(', ')
    },
  },
  {
    ...saltBase,
    warn: (i) => {
      const ece = num(i.ece)
      return i.choice === 'free' && ece !== undefined && ece < ECE_LOW
        ? `ECe ${plNum(ece)} dS/m to za mało dla solirodu (optimum ok. 39 dS/m; w 2021 r. 6,6–13,7 dS/m oceniono na U2). Sprawdź wybór.`
        : null
    },
    describe: (i) => {
      const parts = [
        String(i.note ?? '').trim() || labelOf(SALT_WATER, i.choice),
        i.source ? `źródło: ${labelOf(SALT_SOURCE, i.source).split(' (')[0].toLowerCase()}` : '',
        num(i.ece) !== undefined ? `ECe gleby ${plNum(num(i.ece)!)} dS/m` : '',
        num(i.groundwater) !== undefined ? `lustro wody gruntowej ${plNum(num(i.groundwater)!)} cm` : '',
        num(i.waterEc) !== undefined ? `przewodność wody ${plNum(num(i.waterEc)!)} mS/cm` : '',
      ].filter(Boolean)
      return parts.join('; ')
    },
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu, z odbiornika GPS (WGS84). Przy kilku rozproszonych płatach bez transektu – współrzędne płatów (np. pierwszy, środkowy, ostatni), resztę dopisz w opisie. Trzymaj jeden format w całej karcie.

Dlaczego: przewodnik każe ustalić współrzędne każdego płatu, a płaty bywają efemeryczne (Ciechocinek, tężnia III: w 2016 r. pod starymi współrzędnymi płatu już nie było).`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Kołobrzeg-Budzistowo',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Kołobrzeg-Budzistowo”, „Ciechocinek 1 (rezerwat)”, „Inowrocław-Mątwy”.

Stanowiskiem jest każdy osobny płat albo skupienie płatów związanych z tym samym źródłem zasilania wodami zasolonymi, bez względu na wielkość. Monitoruje się wszystkie stanowiska naturalne i najbliższe naturalnym – co roku.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    defaultValue: 'Puccinellio distantis-Salicornietum brachystachyae',
    help: `Zbiorowisko z solirodem w Polsce to zespół mannicy odstającej i solirodu zielnego Puccinellio distantis-Salicornietum brachystachyae (związek Salicornion ramosissimae, klasa Thero-Salicornietea). Na obu naturalnych stanowiskach pomorskich przewodnik przyjmuje ten sam zespół co w głębi lądu, choć to dyskusyjne.

Sąsiednie zbiorowiska (słone łąki, szuwary) opisz w opisie stanowiska.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Położenie, geneza solanki, wysięki, zonacja roślinności wokół nich, rowy, otoczenie (trzcina, słone łąki).',
    help: `Syntetyczny opis stanowiska:
• gdzie leżą płaty, ile ich jest i jak są rozproszone;
• skąd solanka: ascenzja reliktowych wód mezozoiku (Kołobrzeg, Wyspa Chrząszczewska), tężnie i rowy z solanką (Ciechocinek), przemysł (Mątwy); gdzie wysięki;
• zonacja wokół wysięków: soliród (i aster) na najbardziej zasolonym, grząskim podłożu, dalej murawy z muchotrzewem i mannicą, słona łąka z sitem Gerarda, szuwar trzcinowy;
• rowy melioracyjne, stagnowanie wody, wylewy rzeki;
• zaburzenia: ślady zwierząt (buchtowanie dzików), wydeptywanie, sukcesja trzciny, waty glonowe (makroskopowo, bez oznaczania).

Dlaczego: stanowisk jest kilka i każde ma własne uwarunkowania – opis to podstawa porównań co roku.`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Łączna powierzchnia płatów z solirodem na stanowisku, w hektarach (np. 0,15 ha = 1500 m²). Na stanowiskach siedlisko zajmuje od kilku do kilkunastu arów (2021: 2,5–15 arów).',
  },
  pickField(methodology7120.siteFields, 'protectedAreas'),
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    defaultValue: '200x10 m',
    required: true,
    hint: 'Standard 200×10 m; przy rozproszonych płatach – niestandardowy albo brak (zdjęcia w każdym płacie).',
    help: `Standardowy transekt to 200×10 m. Na obecnych stanowiskach płaty są małe i rozproszone wokół punktowych wysięków solanki, więc transekt po linii prostej zwykle się nie da – przewodnik dopuszcza transekt niestandardowy albo rezygnację z niego i zdjęcia w każdym płacie. Wpisz faktyczny przebieg, np. „10×300 m, nie po linii prostej, w rozproszonych płatach”.

Gdy powierzchnia siedliska kiedyś wzrośnie, wraca się do standardowego 200×10 m.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. poniżej 10',
    help: 'Wysokość terenu w metrach n.p.m. Stanowiska nadmorskie leżą kilka metrów n.p.m. (np. „poniżej 10”), kujawskie ok. 50–90 m.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 03.07.2009',
    required: true,
    hint: 'Środek lub koniec sezonu: lipiec–wrzesień. Co roku.',
    help: 'Dzień badań terenowych. Siedlisko monitoruje się corocznie (inicjalne fitocenozy, duża dynamika, krytyczne zagrożenie), w środku lub pod koniec sezonu wegetacyjnego, lipiec–wrzesień. Przy długim stagnowaniu wody wegetacja rusza bardzo późno (nawet w lipcu) albo jest przerywana. W październiku 2016 r. soliród był już zaschnięty i trudny do rozpoznania.',
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 7 && m <= 9 ? null : 'Termin poza optymalnym oknem (lipiec–wrzesień). Soliród może być jeszcze nierozwinięty albo już zaschnięty.'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcie fitosocjologiczne płatu ----------

const releveFields: FieldDef[] = [
  { kind: 'text', name: 'coords', label: 'Współrzędne środka zdjęcia', help: 'Współrzędne GPS środka powierzchni zdjęcia (WGS84).' },
  {
    kind: 'number',
    name: 'area',
    group: 'Powierzchnia i pokrycie',
    label: 'Powierzchnia zdjęcia',
    unit: 'm²',
    min: 0,
    defaultValue: 25,
    help: 'Zalecane 5×5 m = 25 m², ale przy małym albo niejednorodnym płacie powierzchnia może być mniejsza (w karcie z 2009 r. 3×3 m = 9 m²). Unikaj fragmentów wypiętrzonych (kępy) – słabiej zasolone i silniej przemywane deszczem.',
  },
  {
    kind: 'number',
    name: 'cover',
    group: 'Powierzchnia i pokrycie',
    label: 'Pokrycie warstwy C',
    unit: '%',
    min: 0,
    max: 100,
    help: 'Procent powierzchni zdjęcia pokryty przez roślinność zielną (rzut pionowy). Przyda się do wskaźnika „Gatunki dominujące”.',
  },
  {
    kind: 'text',
    name: 'unit',
    label: 'Jednostka fitosocjologiczna',
    defaultValue: 'Puccinellio distantis-Salicornietum brachystachyae',
    help: 'Zespół, do którego należy zdjęcie – zwykle Puccinellio distantis-Salicornietum brachystachyae.',
  },
  {
    kind: 'releve-species',
    name: 'species',
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki na powierzchni zdjęcia z ilościowością w siedmiostopniowej skali Braun-Blanqueta (r, +, 1–5). Wszystko w warstwie C – na słonym błocie nie ma drzew, krzewów ani mchów. Zwróć uwagę na kępową strukturę runa.',
  },
]

export const methodology1310: Methodology = {
  code: '1310',
  name: 'Śródlądowe błotniste solniska z solirodkiem (Salicornion ramosissimae)',
  source:
    'Bosiacka B. 2012, 1310 Śródlądowe błotniste solniska z solirodkiem (Salicornion ramosissimae), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 59–71 (tab. 1 i 2), z praktyką ocen z monitoringu 2016 i 2021',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Zdjęcia fitosocjologiczne w płatach z solirodem – przy rozproszonych płatach po jednym w każdym płacie. Zalecane 5×5 m, przy małych płatach mniej (w karcie z 2009 r. 3×3 m). Skala Braun-Blanqueta, wszystko w warstwie C.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Stan zachowania siedliska oraz prawdopodobieństwo jego utrzymania, pogorszenia lub poprawy; trwałość dopływu słonej wody; prowadzenie zabiegów ochronnych; status ochronny stanowiska i plany zagospodarowania przestrzennego.',
    help: `Oceniając perspektywy, weź pod uwagę przede wszystkim trwałość dopływu solanki (rowy, przepompownie, zastawki, działanie tężni), tempo zarastania trzciną, prowadzenie zabiegów (koszenie, wypas, zastawki, zatrzymywanie odpływu), własność terenu i plany inwestycyjne (np. obwodnica Kołobrzegu przechodząca ok. 100 m od płatów).

Praktyka: Ciechocinek 1 (rezerwat) – po budowie zastawki na rowie z solanką i przy koszeniu perspektywy FV; Kołobrzeg i Wyspa Chrząszczewska 2 – zarastanie trzciną, U1; stanowiska, na których siedlisko zanikło (Leszcze, Wyspa Chrząszczewska) – U2.`,
    thresholds: {
      FV: 'Perspektywy ochrony siedliska dobre lub doskonałe; nie stwierdzono i nie przewiduje się znaczącego oddziaływania czynników zagrażających; prawdopodobne przetrwanie w dłuższej perspektywie czasowej',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy ochrony siedliska są złe, stwierdzony lub przewidywany wpływ czynników zagrażających; mało prawdopodobne przetrwanie w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A03', name: 'Koszenie / ścinanie trawy' },
    { code: 'A03.02', name: 'Nieintensywne koszenie' },
    { code: 'A03.03', name: 'Zaniechanie / brak koszenia' },
    { code: 'A04', name: 'Wypas' },
    { code: 'A04.03', name: 'Zarzucenie pasterstwa, brak wypasu' },
    { code: 'C01.05', name: 'Warzelnie soli' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D01.02', name: 'Drogi, autostrady' },
    { code: 'E01', name: 'Tereny zurbanizowane, tereny zamieszkane' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02.01.02', name: 'Osuszanie terenów morskich, ujściowych, bagiennych' },
    { code: 'J02.04', name: 'Zalewanie - modyfikacje' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód - ogólnie' },
    { code: 'J02.06', name: 'Pobór wód z wód powierzchniowych' },
    { code: 'J02.07', name: 'Pobór wód podziemnych' },
    { code: 'J02.12', name: 'Tamy, wały, sztuczne plaże - ogólnie' },
    { code: 'K01.03', name: 'Wyschnięcie' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K04.01', name: 'Konkurencja' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. jedno z dwóch naturalnych stanowisk solirodu w kraju, sąsiedztwo 1330 i 1340.',
        help: 'Wartości przyrodnicze stanowiska poza samym siedliskiem: rzadkie halofity (mannica nadmorska, babka nadmorska, świbka morska), sąsiedztwo słonych łąk (1330, 1340), unikatowość stanowiska. Brak informacji – „Nie pozyskano danych”.',
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: `Jakie działania ochronne wykonano i jaka jest ich skuteczność, oraz co proponujesz. Typowe dla 1310: zastawki i progi na rowach (utrzymanie solanki w wodach gruntowych i przydennych, odpływ przelewowy wód słodkich), letnie i zimowe wykaszanie trzciny, wypas kwaterowy, mechaniczne naruszanie darni słonych łąk zarastających płat, kontrolowane rozlewanie solanki. Podstawą jest swobodny dopływ słonej wody – przy nim inne zabiegi nie są konieczne. Brak działań – „Brak”.`,
      }
    return f
  }),

  speciesCatalog: SPECIES_1310.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer1310(s) })),
  speciesInfo: (name) => {
    const e = findSpecies1310(name)
    return e ? GROUP_LABELS_1310[e.group] : undefined
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator1310 = (id: string): IndicatorDef => {
  const i = methodology1310.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 1310`)
  return i
}
