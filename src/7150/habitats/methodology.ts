// Metodyka 7150 (obniżenia na podłożu torfowym z roślinnością ze związku Rhynchosporion, „przygiełkowiska”) jako dane.
// Źródło: Koczur A. 2012, „7150 Obniżenia na podłożu torfowym z roślinnością ze związku Rhynchosporion” [w:] Mróz W. (red.),
// Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. III, GIOŚ, s. 123–136 (tab. 1 i 2, lista wskaźników
// kardynalnych, karta „Bór na Czerwonem”), z praktyką oceny ze sprawozdań z monitoringu 2009–2011 (badania 2010–2011)
// i 2015–2018 (badania 2016). Siedlisko niepriorytetowe, region kontynentalny i alpejski (Kotlina Orawsko-Nowotarska).
// Transekt 10×200 m (albo zmodyfikowany, albo trzy powierzchnie przy izolowanych płatach), trzy zdjęcia fitosocjologiczne
// 5×5 m, pomiar wody w pięciu punktach co 50 m.
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, mean, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, thresholdsFromOptions, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_7150,
  SPECIES_7150,
  defaultLayer7150,
  findSpecies7150,
  isAlien7150,
  isCharacteristic7150,
  isExpansive7150,
  isWoody7150,
  speciesKey7150,
} from './species'

// ---------- progi liczbowe (tab. 2) ----------

/** Procent powierzchni zajęty przez siedlisko na transekcie: 40–100% FV; 10–40% U1; poniżej 10% U2. Dokładnie 40% – FV. */
export const gradeShare7150 = (p: number): Grade => (p >= 40 ? 'FV' : p >= 10 ? 'U1' : 'U2')

/**
 * Gatunki charakterystyczne: powyżej trzech gatunków LUB pokrycie powyżej 50% – FV; dwa, trzy gatunki LUB pokrycie
 * 20–50% – U1; jeden gatunek i pokrycie poniżej 20% – U2. Bez pokrycia liczy się sama liczba gatunków.
 */
export function gradeCharacteristic7150(count: number, cover?: number): Grade {
  if (count > 3 || (cover !== undefined && cover > 50)) return 'FV'
  if (count >= 2 || (cover !== undefined && cover >= 20)) return 'U1'
  return 'U2'
}

/** Odsłonięty torf: powyżej 50% FV; 10–50% U1 (obie granice); poniżej 10% U2. */
export const gradeBarePeat7150 = (p: number): Grade => (p > 50 ? 'FV' : p >= 10 ? 'U1' : 'U2')

/** Pokrycie mszaków (odwrotnie niż na torfowiskach wysokich): poniżej 20% FV; 20–50% U1 (obie granice); ponad 50% U2. */
export const gradeMosses7150 = (p: number): Grade => (p < 20 ? 'FV' : p <= 50 ? 'U1' : 'U2')

/** Obce gatunki inwazyjne: brak – FV; do 5% – U1 (także pojedyncze osobniki bez pokrycia); powyżej 5% – U2. */
export function gradeAliens7150(cover: number, present = cover > 0): Grade {
  if (!present && cover <= 0) return 'FV'
  return cover <= 5 ? 'U1' : 'U2'
}

/** Gatunki ekspansywne roślin zielnych: brak lub pojedyncze (<1%, wpisane jako 0,5) – FV; do 5% – U1; powyżej 5% – U2. */
export const gradeExpansive7150 = (cover: number): Grade => (cover < 1 ? 'FV' : cover <= 5 ? 'U1' : 'U2')

/** Krzewy i podrost drzew: brak lub pojedyncze (<1%) – FV; do 10% – U1 (10% też, jak w 2016 r.); powyżej 10% – U2. */
export const gradeWoody7150 = (cover: number): Grade => (cover < 1 ? 'FV' : cover <= 10 ? 'U1' : 'U2')

/**
 * Stopień uwodnienia – poziom wody w cm poniżej powierzchni torfowiska (woda nad powierzchnią: liczba ujemna).
 * FV: do 2 cm powyżej, równo lub do 10 cm poniżej; U1: 2–10 cm powyżej lub 10–20 cm poniżej; U2: ponad 10 cm powyżej
 * lub więcej niż 20 cm poniżej.
 */
export function gradeWater7150(depth: number): Grade {
  if (depth >= -2 && depth <= 10) return 'FV'
  if (depth >= -10 && depth <= 20) return 'U1'
  return 'U2'
}

const pct = (v: number) => `${plNum(v)}%`
const round1 = (n: number) => Math.round(n * 10) / 10
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey7150(n), n])).values()]

/** Suma pokrycia wierszy listy spełniających warunek; 'present' – są wiersze, ale bez pokrycia; undefined – brak wierszy. */
function sumCover(list: unknown, pred: (name: string) => boolean = () => true): number | 'present' | undefined {
  const rows = speciesRows(list).filter((r) => r.name?.trim() && pred(r.name.trim()))
  if (!rows.length) return undefined
  const covers = rows.map((r) => num(r.cover)).filter((c): c is number => c !== undefined)
  return covers.length ? round1(covers.reduce((a, b) => a + b, 0)) : 'present'
}

// ---------- klocki pól ----------

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

const GRADE_CHOICE = (help: string): FieldDef => ({
  kind: 'select',
  name: 'choice',
  label: 'Ocena (opcjonalnie)',
  options: [{ value: '', label: '—' }, ...(['FV', 'U1', 'U2'] as const).map((g) => ({ value: g, label: g }))],
  help,
})
const chosenGrade = (i: InputValues): Grade | null => {
  const g = String(i.choice ?? '')
  return g === 'FV' || g === 'U1' || g === 'U2' ? g : null
}

const totalInput = (label: string, help: string): FieldDef => ({ kind: 'number', name: 'total', label, unit: '%', min: 0, max: 100, help })
const pctInput = (name: string, label: string, help: string, required = true): FieldDef => ({ kind: 'number', name, label, unit: '%', min: 0, max: 100, required, help })

const describeList = (i: InputValues) => {
  if (note(i)) return note(i)
  const list = describeSpecies(speciesRows(i.species))
  const t = num(i.total)
  if (list) return t !== undefined ? `${list} – łącznie ${pct(t)}` : list
  if (t !== undefined) return `Łącznie ${pct(t)}`
  return i.none === 'yes' ? 'Brak' : ''
}

const noneConflict = (i: InputValues) =>
  i.none === 'yes' && (rowNames(i.species).length > 0 || (num(i.total) ?? 0) > 0) ? 'Zaznaczono „Nie stwierdzono”, a lista albo pokrycie nie są puste.' : null

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Powierzchnia nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'other', label: 'Inne kombinacje (np. powolne zmniejszanie się przez zarastanie i sukcesję do mszaru)', grade: 'U1' },
  { value: 'decline', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub literaturą', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const PATCHES: GradedOption[] = [
  { value: 'large', label: 'Siedlisko zajmuje duże powierzchnie, tworząc rozległe płaty (powyżej 50 m²)', grade: 'FV' },
  { value: 'medium', label: 'Kilka dużych (10–50 m²) lub liczne małe (1–10 m²) płaty', grade: 'U1' },
  { value: 'small', label: 'Pojedyncze małe płaty (1–2 m²)', grade: 'U2' },
]
const DOMINANTS: GradedOption[] = [
  { value: 'characteristic', label: 'Dominują gatunki charakterystyczne dla siedliska lub brak dominanta, lecz przeważają gatunki charakterystyczne', grade: 'FV' },
  { value: 'mixed', label: 'Brak wyraźnych dominantów, udział gatunków charakterystycznych dla 7150 i innych mniej więcej równy', grade: 'U1' },
  { value: 'other', label: 'Dominują gatunki, które nie są zaliczane do charakterystycznych dla siedliska', grade: 'U2' },
]
const PEAT: GradedOption[] = [
  { value: 'none', label: 'Brak pozyskania torfu, a jeżeli w przeszłości (ponad 30 lat temu), to na niewielką skalę (do 5% torfowiska), ślady słabo zauważalne', grade: 'FV' },
  { value: 'past', label: 'Torf pozyskiwany w przeszłości na znacznie większą skalę (ponad 5% torfowiska), wyraźne ślady; obecnie brak pozyskania lub sporadyczne, na bardzo małą skalę', grade: 'U1' },
  { value: 'active', label: 'Pozyskiwanie torfu na dużą skalę przez miejscową ludność lub eksploatacja przemysłowa', grade: 'U2' },
]
const DRAINAGE: GradedOption[] = [
  { value: 'none', label: 'Brak sieci rowów i innej infrastruktury melioracyjnej albo infrastruktura „zneutralizowana” (zasypane rowy, zastawki)', grade: 'FV' },
  { value: 'weak', label: 'Sieć rowów oddziałuje w niewielkim stopniu (brak konserwacji, częściowe uszkodzenie, naturalne zarastanie, zastawki)', grade: 'U1' },
  { value: 'strong', label: 'Istniejąca infrastruktura melioracyjna wyraźnie pogarsza warunki wodne torfowiska', grade: 'U2' },
]
const GENESIS: GradedOption[] = [
  { value: 'natural', label: 'Siedlisko powstało i utrzymuje się dzięki działającym ciągle czynnikom naturalnym (procesy erozyjne, mrozowe, wahania wody)', grade: 'FV' },
  { value: 'irregular', label: 'Czynniki prowadzące do powstania siedliska ustały lub działają nieregularnie (np. miejsca odsłaniane przez zwierzęta)', grade: 'U1' },
  { value: 'anthropogenic', label: 'Siedlisko powstało w wyniku działalności człowieka (potorfia, miejsca sztucznie pozbawione roślinności, wydeptywanie)', grade: 'U2' },
]

// ---------- podtypy (propozycja ze sprawozdania 2009–2011) ----------

export const SUBTYPES_7150 = ['7150-1', '7150-2', '7150-3'] as const
export const SUBTYPE_LABELS_7150: Record<(typeof SUBTYPES_7150)[number], string> = {
  '7150-1': '7150-1 – Obniżenia na głębokich torfach Polski niżowej',
  '7150-2': '7150-2 – Obniżenia na podłożu mineralno-torfowym Polski Zachodniej',
  '7150-3': '7150-3 – Obniżenia na głębokich torfach torfowisk górskich',
}
const SUBTYPE_OPTIONS: SelectOption[] = [{ value: '', label: '—' }, ...SUBTYPES_7150.map((s) => ({ value: s, label: SUBTYPE_LABELS_7150[s] }))]

// ---------- gatunki charakterystyczne ----------

const characteristicNames = (i: InputValues) => distinct(rowNames(i.species).filter(isCharacteristic7150))
function characteristicCount(i: InputValues): number | undefined {
  const c = num(i.count)
  if (c !== undefined) return c
  return rowNames(i.species).length ? characteristicNames(i).length : undefined
}
function characteristicCover(i: InputValues): number | undefined {
  const t = num(i.total)
  if (t !== undefined) return t
  const c = sumCover(i.species, isCharacteristic7150)
  return typeof c === 'number' ? c : undefined
}

// ---------- stopień uwodnienia ----------

const DEPTHS = [1, 2, 3, 4, 5] as const
const depths = (i: InputValues) => DEPTHS.map((n) => num(i[`depth${n}`])).filter((v): v is number => v !== undefined)
const waterLevel = (d: number) => (d < 0 ? `${plNum(-d)} cm powyżej` : d === 0 ? 'równo z powierzchnią' : `${plNum(d)} cm poniżej`)

// ---------- wskaźniki ----------

const SURFACE = 'w % powierzchni transektu (płatów siedliska); dla pojedynczych osobników albo „<1%” wpisz 0,5'

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description:
      'Ocenie podlega nie tyle wielkość powierzchni zajmowanej przez siedlisko 7150, co jej rozmiary w stosunku do siedliska potencjalnego (czy zajmuje cały obszar o sprzyjających warunkach) i jej dynamika – czy powierzchnia jest stabilna, zwiększa się czy zmniejsza, np. w wyniku rozwoju mszaru, inwazji gatunku lub zarastania przez krzewy.',
    help: `Co wybrać: jak zmieniła się powierzchnia przygiełkowisk na stanowisku od poprzedniego badania (albo względem literatury). Samą powierzchnię wpisz obok – trafi do „wartości”, gdy nie ma opisu.

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; inne kombinacje – U1; wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub literaturą – U2.

Praktyka: drobnopowierzchniowość jest cechą naturalną płatów na żywych torfowiskach (sprawozdanie 2016–2018) – nawet bardzo małe płaty nie muszą dostawać złej oceny, jeśli zajmują całą dostępną dla nich powierzchnię (sprawozdanie 2009–2011). W 2016 r. w Kotlinie Orawsko-Nowotarskiej płaty powoli kurczące się przez zarastanie kruszyną i sukcesję do mszaru – U1, płaty małe i w zaniku (Młaka Brzeże, Łysa Puścizna) – U2. Karta z przewodnika: „Powierzchnia nieznacznie zmniejsza się w wyniku rozwoju okolicznych mszarów” → U1. Przy pierwszym badaniu bez danych do porównania – „Brak danych” (XX) albo ocena ekspercka.`,
    thresholds: thresholdsFromOptions(AREA),
    inputs: [
      selectInput('Zmiana powierzchni', AREA, 'Jak zmieniła się powierzchnia siedliska od poprzedniego badania.'),
      { kind: 'text', name: 'areaText', label: 'Powierzchnia (opcjonalnie)', placeholder: 'np. 0,03 ha', help: 'Powierzchnia płatów siedliska na stanowisku, np. „0,03 ha” albo „ok. 200 m²” – trafi do pola „wartość”, gdy nie ma opisu.' },
      noteInput('Opis (opcjonalnie)', 'np. Powierzchnia nieznacznie zmniejsza się w wyniku rozwoju okolicznych mszarów.', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => note(i) || String(i.areaText ?? '').trim() || labelOf(AREA, i.choice),
  },
  {
    id: 'share',
    label: 'Procent powierzchni zajęty przez siedlisko na transekcie',
    parameter: 'structure',
    description:
      'Procent powierzchni transektu zajęty przez siedlisko 7150. W sposób pośredni określa strukturę przestrzenną i stopień fragmentacji siedliska na stanowisku. Ponieważ wskaźnik ten występuje standardowo w monitoringu siedlisk, utrzymano go również w tym przypadku.',
    help: `Co wpisać: jaki procent transektu (10×200 m albo jego zmodyfikowanej postaci) zajmują płaty przygiełkowiska – roślinność z przygiełkami, rosiczkami, widłaczkiem na odsłoniętym, wilgotnym torfie lub podłożu mineralno-torfowym.

Progi (tab. 2): 40–100% – FV; 10–40% – U1; poniżej 10% – U2. Granicę 40% formularz liczy do FV, 10% – do U1.

Praktyka: wyniki są niejednorodne, bo część ekspertów dopasowywała transekt do płatu (wtedy 100%), a część badała rozproszone płaty w klasycznym transekcie 10×200 m – stąd dodatkowy wskaźnik „Struktura przestrzenna płatów” (sprawozdanie 2009–2011). W 2016 r. w regionie kontynentalnym prawie tyle samo FV (22) co U2 (23). Zapisz w opisie, jak wyznaczono transekt, żeby następny obserwator liczył tak samo. Karta z przewodnika: 20% → U1.`,
    thresholds: { FV: '40–100%', U1: '10–40%', U2: 'Poniżej 10%' },
    inputs: [
      pctInput('share', 'Udział siedliska na transekcie', 'Procent powierzchni transektu zajęty przez płaty siedliska 7150 (przygiełkowiska).'),
      noteInput('Opis (opcjonalnie)', 'np. Transekt dopasowany do granic płatu.', 'Krótki opis (np. jak wyznaczono transekt) – trafi do „wartości” w karcie zamiast samej liczby.'),
    ],
    suggest: (i) => {
      const v = num(i.share)
      return v === undefined ? null : gradeShare7150(v)
    },
    describe: (i) => note(i) || (num(i.share) === undefined ? '' : pct(num(i.share)!)),
  },
  {
    id: 'patches',
    label: 'Struktura przestrzenna płatów siedliska',
    parameter: 'structure',
    cardinal: true,
    description:
      'Uzupełnienie poprzedniego wskaźnika: stopień fragmentacji siedliska na stanowisku (duży, średni, mały) oraz wielkość powierzchni poszczególnych płatów. Wskaźnik ten, dokładniej niż poprzedni, określa stopień fragmentacji i obszar zajmowany przez siedlisko.',
    help: `Co wybrać: jak duże są płaty przygiełkowiska i ile ich jest. W opisie podaj typową i największą powierzchnię płatów oraz odległości między nimi (karta przykładowa: „pojedyncze płaty o powierzchni 3–50 m², oddalone od siebie o kilka do kilkudziesięciu metrów”).

Progi (tab. 2): siedlisko zajmuje duże powierzchnie, tworząc rozległe płaty (powyżej 50 m²) – FV; kilka dużych (10–50 m²) lub liczne małe (1–10 m²) płaty – U1; pojedyncze małe płaty (1–2 m²) – U2.

Praktyka 2016: większość przygiełkowisk drobnopowierzchniowa – w regionie kontynentalnym 23 stanowiska U2, 18 U1, 15 FV; w Kotlinie Orawsko-Nowotarskiej płaty zwykle ok. 10 m², nigdzie powyżej 25 m² (U1, przy silniejszej fragmentacji U2). Pogorszenie ocen często wynikało z sukcesji do torfowiska przejściowego (7140). Sprawozdanie 2016–2018 postuluje, by wskaźnik oceniał raczej roślinność towarzyszącą: domieszka Oxycocco-Sphagnetea świadczy o negatywnym trendzie, a mozaika z roślinnością ziemnowodną Isoëto-Littorelletea (Hydrocotylo-Baldellion) – o optymalnym rozwoju; zapisz to w opisie. Karta z przewodnika: „Duży stopień fragmentacji siedliska” (płaty 3–50 m²) → U1.

Wskaźnik kardynalny.`,
    thresholds: thresholdsFromOptions(PATCHES),
    inputs: [
      selectInput('Wielkość i liczba płatów', PATCHES, 'Wielkość płatów siedliska i stopień ich fragmentacji na stanowisku.'),
      noteInput('Opis (opcjonalnie)', 'np. Duży stopień fragmentacji siedliska na stanowisku. Pojedyncze płaty o powierzchni 3–50 m², oddalone od siebie o kilka do kilkudziesięciu metrów.', 'Wielkość płatów, ich liczba i odległości, roślinność między płatami – trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(PATCHES)),
    describe: (i) => note(i) || labelOf(PATCHES, i.choice),
  },
  {
    id: 'characteristic',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków charakterystycznych dla siedliska: przede wszystkim gatunki reprezentatywne (przygiełka biała Rhynchospora alba, przygiełka brunatna R. fusca, widłaczek torfowy Lycopodiella inundata, rosiczka okrągłolistna Drosera rotundifolia, rosiczka pośrednia D. intermedia) lub inne lokalnie charakterystyczne (wełnianeczka darniowa Baeothryon caespitosum, wełnianka wąskolistna Eriophorum angustifolium, turzyca dzióbkowata Carex rostrata, torfowiec cieniutki Sphagnum tenellum, t. ząbkowany S. denticulatum) oraz ich udział procentowy na transekcie (w płatach siedliska).',
    help: `Co wpisać: gatunki charakterystyczne stwierdzone na transekcie, każdy z pokryciem ${SURFACE}. Liczbę gatunków i ich łączne pokrycie możesz też wpisać wprost.

Progi (tab. 2): powyżej trzech gatunków charakterystycznych LUB pokrycie gatunków charakterystycznych na transekcie (w płatach) powyżej 50% – FV; dwa, trzy gatunki LUB pokrycie 20–50% – U1; jeden gatunek, pokrycie poniżej 20% – U2.

Jak liczy formularz: ocena wybrana w polu ma pierwszeństwo; bez niej liczba gatunków (wpisana albo policzona z listy – synonimy raz) i łączne pokrycie (wpisane albo zsumowane z listy). Wystarczy jeden z warunków („lub”). Gdy gatunki nie mają pokrycia, liczy się tylko liczba. Katalog zna: 5 gatunków reprezentatywnych i 5 lokalnie charakterystycznych z tab. 1 oraz sit drobny Juncus bulbosus i wąkrotę zwyczajną Hydrocotyle vulgaris – stałą domieszkę na podłożu mineralno-torfowym (pkt 4 przewodnika).

Uwaga: przewodnik (pkt 4) każe uznawać wełnianeczkę, wełniankę wąskolistną i turzycę dzióbkowatą za lokalnie charakterystyczne zwłaszcza w górach, gdzie przygiełek brak (Sudety). W karcie przykładowej ekspert policzył tylko przygiełkę i rosiczkę, choć w zdjęciach była też wełnianka wąskolistna i torfowiec cieniutki – w 2016 r. na tym samym stanowisku liczono już wełniankę wąskolistną. Wpisz to, co liczysz, i trzymaj się tego w kolejnych latach. Sprawozdanie 2016–2018 ostrzega, że przygiełka biała i rosiczka okrągłolistna mają niską wierność siedlisku – ich obecność nie przesądza, że to 7150, a nie mszar 7110/7140.

Praktyka 2016: na połowie stanowisk kontynentalnych 4 i więcej gatunki o łącznym pokryciu ponad 50% (FV, zwłaszcza płaty z przygiełką brunatną), w Kotlinie Orawsko-Nowotarskiej 3 gatunki (przygiełka biała, rosiczka okrągłolistna, wełnianka wąskolistna) z obfitą przygiełką – FV. Karta z przewodnika: 2 gatunki, przygiełka biała 50% i rosiczka 15% („liczba gatunków bardzo mała, lecz występują bardzo licznie”) → FV.

Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Powyżej trzech gatunków charakterystycznych lub pokrycie gatunków charakterystycznych na transekcie (w płatach) powyżej 50%',
      U1: 'Dwa, trzy gatunki charakterystyczne lub pokrycie na transekcie 20–50%',
      U2: 'Jeden gatunek charakterystyczny, pokrycie na transekcie poniżej 20%',
    },
    inputs: [
      speciesInput('Gatunki charakterystyczne', `Gatunki charakterystyczne stwierdzone na transekcie z pokryciem ${SURFACE}, np. Rhynchospora alba 50, Drosera rotundifolia 15.`),
      { kind: 'number', name: 'count', label: 'Liczba gatunków charakterystycznych (opcjonalnie)', min: 0, help: 'Łączna liczba gatunków charakterystycznych na transekcie, wpisana wprost – ma pierwszeństwo przed liczeniem z listy.' },
      totalInput('Łączne pokrycie gatunków charakterystycznych (opcjonalnie)', 'Łączne pokrycie gatunków charakterystycznych w % transektu (płatów siedliska) – ma pierwszeństwo przed sumą z listy.'),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed liczbą gatunków i pokryciem (np. gdy liczysz wg innej listy albo gatunki lokalnie charakterystyczne). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Liczba gatunków charakterystycznych bardzo mała, lecz występują bardzo licznie.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const c = characteristicCount(i)
      const cover = characteristicCover(i)
      if (c === undefined && cover === undefined) return null
      return gradeCharacteristic7150(c ?? 0, cover)
    },
    explain: (i) => {
      if (chosenGrade(i)) return null
      const c = characteristicCount(i)
      const cover = characteristicCover(i)
      if (c === undefined && cover === undefined) return null
      const names = characteristicNames(i)
      const count = num(i.count) !== undefined ? `Gatunków charakterystycznych: ${plNum(c!)}` : `Gatunki charakterystyczne z katalogu: ${names.length}${names.length ? ` (${names.join(', ')})` : ''}`
      return `${count}; łączne pokrycie: ${cover === undefined ? 'nie podano – liczy się tylko liczba gatunków' : pct(cover)}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      const other = names.filter((n) => !isCharacteristic7150(n))
      const known = other.filter((n) => findSpecies7150(n))
      if (known.length) parts.push(`Nie liczą się jako charakterystyczne: ${known.join(', ')}.`)
      const g = chosenGrade(i)
      const c = characteristicCount(i)
      if (g && c !== undefined) {
        const auto = gradeCharacteristic7150(c, characteristicCover(i))
        if (auto !== g) parts.push(`Wybrano ${g}, a z liczby gatunków i pokrycia wychodzi ${auto} – uzasadnij w opisie.`)
      }
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      const c = num(i.count)
      return list || (c !== undefined ? `${plNum(c)} gat.` : '')
    },
  },
  {
    id: 'dominant',
    label: 'Gatunki dominujące',
    parameter: 'structure',
    description:
      'Lista gatunków dominujących na transekcie (w płatach siedliska) oraz ich udział procentowy. Wskaźnik opisuje strukturę zbiorowisk roślinnych na badanym stanowisku oraz ich stan zachowania (ewentualnie stopień ich zniekształcenia). Odpowiada na pytanie, czy na stanowisku dominują gatunki charakterystyczne dla siedliska.',
    help: `Co wybrać i wpisać: które gatunki dominują w płatach siedliska. Dominanty wpisz na listę z pokryciem ${SURFACE} – to dokumentacja; ocena wynika z wyboru.

Progi (tab. 2): dominują gatunki charakterystyczne dla siedliska lub brak dominanta, lecz przeważają gatunki charakterystyczne – FV; brak wyraźnych dominantów, udział gatunków charakterystycznych dla 7150 i innych mniej więcej równy – U1; dominują gatunki niezaliczane do charakterystycznych – U2.

Praktyka: o gorszej ocenie decydował udział trzęślicy modrej, drzew (sosna, brzoza), zwarte płaty mchów albo gatunki torfowisk przejściowych (7140) i wysokich (2010–2011, 2016). Łysa Puścizna 2016: wśród dominantów „obce siedliskowo” wrzos i wełnianka pochwowata → U2; w Kotlinie Orawsko-Nowotarskiej dominuje przygiełka biała → FV. Karta z przewodnika: przygiełka biała 50%, rosiczka okrągłolistna 15% („dominują gatunki charakterystyczne”) → FV.`,
    thresholds: thresholdsFromOptions(DOMINANTS),
    inputs: [
      selectInput('Kto dominuje', DOMINANTS, 'Czy w płatach siedliska dominują gatunki charakterystyczne dla 7150.'),
      speciesInput('Gatunki dominujące (opcjonalnie)', `Gatunki dominujące z pokryciem ${SURFACE}, np. Rhynchospora alba 50, Drosera rotundifolia 15.`),
      noteInput('Opis (opcjonalnie)', 'np. Dominują gatunki charakterystyczne.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: byOption(gradeMap(DOMINANTS)),
    warn: (i) => {
      const rows = speciesRows(i.species).filter((r) => r.name?.trim() && num(r.cover) !== undefined)
      if (!rows.length || i.choice !== 'characteristic') return null
      const top = rows.reduce((a, b) => (num(b.cover)! > num(a.cover)! ? b : a))
      return isCharacteristic7150(top.name.trim()) ? null : `Wybrano „dominują gatunki charakterystyczne”, a największe pokrycie ma ${top.name.trim()} (nie jest charakterystyczny) – sprawdź.`
    },
    describe: (i) => note(i) || describeSpecies(speciesRows(i.species)) || labelOf(DOMINANTS, i.choice),
  },
  {
    id: 'barePeat',
    label: 'Odsłonięty torf',
    parameter: 'structure',
    cardinal: true,
    description:
      'Procent nieporośniętej powierzchni w obrębie transektu (płatów reprezentujących siedlisko na transekcie). Wskaźnik charakteryzuje stopień otwarcia siedliska, jego inicjalny charakter (stadium zarastania) i pośrednio intensywność czynników erozyjnych.',
    help: `Co wpisać: jaki procent płatów siedliska zajmuje nagi, nieporośnięty torf (albo inne odsłonięte podłoże: piasek, muł, gytia, humotorf). Jeśli w płatach jest różnie, podaj wartość średnią, a zakres w opisie (karta przykładowa: 40%, „10–60% w obrębie płatów”).

Progi (tab. 2): powyżej 50% – FV; 10–50% – U1; poniżej 10% – U2. Granice 10% i 50% formularz liczy do U1.

Dlaczego: przygiełkowisko to stadium pionierskie. Gdy czynniki odsłaniające torf (erozja, wahania wody, wydeptywanie przez zwierzęta) słabną, płat zarasta mszarem i przechodzi w torfowisko przejściowe (7140). Mało nagiego torfu = siedlisko w zaniku.

Praktyka: 2010–2011 odsłonięcie od 0 do ponad 80%, FV tylko na 14 stanowiskach; 2016 Kotlina Orawsko-Nowotarska – kilka procent (U2), ponad 10% (U1). Sprawozdanie 2016–2018: przygiełkowiska rzadko rosną na samym torfie – w zachodniej Polsce na płytkich utworach mułowych, mułowo-torfowych, humotorfowych, mineralno-organicznych; licz każde odsłonięte podłoże i zapisz jakie. Karta z przewodnika: 40% → U1.

Wskaźnik kardynalny.`,
    thresholds: { FV: 'Powyżej 50%', U1: '10–50%', U2: 'Poniżej 10%' },
    inputs: [
      pctInput('cover', 'Odsłonięty torf (podłoże)', 'Procent nieporośniętej powierzchni torfu albo innego podłoża w płatach siedliska na transekcie.'),
      noteInput('Opis (opcjonalnie)', 'np. 10–60% w obrębie płatów reprezentujących siedlisko na transekcie.', 'Zakres w płatach, rodzaj podłoża (torf, piasek, muł) – trafi do „wartości” w karcie zamiast samej liczby.'),
    ],
    suggest: (i) => {
      const v = num(i.cover)
      return v === undefined ? null : gradeBarePeat7150(v)
    },
    describe: (i) => {
      const v = num(i.cover)
      const n = note(i)
      if (v === undefined) return n
      return n ? `${pct(v)} (${n})` : pct(v)
    },
  },
  {
    id: 'mosses',
    label: 'Pokrycie i struktura gatunkowa mszaków',
    parameter: 'structure',
    description:
      'Procent powierzchni transektu (płatów siedliska) zajęty przez wszystkie gatunki mszaków oraz procentowy udział pokrycia przez wątrobowce, torfowce i mchy brunatne. Charakteryzuje kondycję siedliska i procesy w nim zachodzące: utrzymywanie siedliska przez erozję, zaawansowanie sukcesji do torfowisk przejściowych i wysokich, a także żyzność i typ zasilania torfowiska w wodę.',
    help: `Co wpisać:
1. Całkowite pokrycie mszaków (torfowce, mchy brunatne, inne mchy, wątrobowce) w % powierzchni płatów siedliska na transekcie.
2. Jak dzieli się warstwa mszaków: ile procent jej powierzchni to torfowce, ile mchy brunatne, ile wątrobowce (razem ok. 100%). Karta przykładowa: torfowce 90%, wątrobowce 10%, mchy brunatne 0%.

Progi (tab. 2): całkowite pokrycie mszaków poniżej 20% – FV; 20–50% – U1; ponad 50% – U2. Granice 20% i 50% formularz liczy do U1. Uwaga – logika odwrotna niż na torfowiskach wysokich (7110, 7120): tutaj dużo mchów to zły znak, bo zwarty mszar zarasta odsłonięty torf.

Praktyka: struktura warstwy była zwykle dobra – dominowały torfowce z domieszką wątrobowców, mchy właściwe sporadycznie (2010–2011). 2016: na 4 z 5 stanowisk w Kotlinie Orawsko-Nowotarskiej mszaki powyżej 60% z dominacją torfowców → U2; Puścizna Rękowiańska do 5% → FV. Sprawozdanie 2016–2018: przy stałym podtopieniu rozrastają się torfowce torfotwórcze (S. fallax, S. cuspidatum, S. papillosum, S. magellanicum), a wycofują ziemnowodne (S. denticulatum, S. inundatum) – opisz skład warstwy. Karta z przewodnika: mszaki 35% → U1.`,
    thresholds: { FV: 'Całkowite pokrycie mszaków poniżej 20%', U1: 'Całkowite pokrycie mszaków 20–50%', U2: 'Całkowite pokrycie mszaków ponad 50%' },
    inputs: [
      pctInput('cover', 'Całkowite pokrycie mszaków', 'Suma pokrycia wszystkich mszaków (torfowce, mchy brunatne, inne mchy, wątrobowce) w % powierzchni płatów siedliska na transekcie.'),
      { ...pctInput('sphagnum', 'Torfowce', 'Udział torfowców w powierzchni warstwy mszaków, w %. To procent powierzchni mszaków, nie transektu.', false), group: 'Struktura warstwy mszaków (% powierzchni mszaków)', groupCols: 3 },
      { ...pctInput('brown', 'Mchy brunatne', 'Udział mchów brunatnych (np. Drepanocladus, Scorpidium, Calliergon) w powierzchni warstwy mszaków, w %.', false), group: 'Struktura warstwy mszaków (% powierzchni mszaków)' },
      { ...pctInput('liverworts', 'Wątrobowce', 'Udział wątrobowców (np. Gymnocolea inflata, Cladopodiella fluitans, Fossombronia) w powierzchni warstwy mszaków, w %.', false), group: 'Struktura warstwy mszaków (% powierzchni mszaków)' },
      noteInput('Opis (opcjonalnie)', 'np. Torfowce z przewagą Sphagnum tenellum; wątrobowce na nagim torfie.', 'Dominujące gatunki mszaków, zmiany względem poprzedniego badania – dopisane do „wartości” w karcie.'),
    ],
    suggest: (i) => {
      const v = num(i.cover)
      return v === undefined ? null : gradeMosses7150(v)
    },
    warn: (i) => {
      const parts = (['sphagnum', 'brown', 'liverworts'] as const).map((k) => num(i[k])).filter((v): v is number => v !== undefined)
      if (parts.length < 2) return null
      const s = parts.reduce((a, b) => a + b, 0)
      return Math.abs(s - 100) > 10 ? `Udziały torfowców, mchów brunatnych i wątrobowców dają razem ${plNum(round1(s))}% powierzchni mszaków, a powinny ok. 100% – sprawdź.` : null
    },
    describe: (i) => {
      const v = num(i.cover)
      const parts = [
        ['Mchy brunatne', num(i.brown)],
        ['Torfowce', num(i.sphagnum)],
        ['Wątrobowce', num(i.liverworts)],
      ]
        .filter(([, x]) => x !== undefined)
        .map(([l, x]) => `${l} – ${pct(x as number)}`)
      const base = v === undefined ? '' : `Mszaki – ${pct(v)}`
      return [base, parts.join(', '), note(i)].filter(Boolean).join('; ')
    },
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków inwazyjnych (obcych geograficznie i ekologicznie) na transekcie (w płatach siedliska) oraz ich udział procentowy. Wskaźnik opisuje stopień przekształcenia siedliska.',
    help: `Co wpisać: gatunki obce z pokryciem ${SURFACE}. Łączne pokrycie możesz wpisać wprost. W przygiełkowiskach notowano tylko tawułę kutnerowatą Spiraea tomentosa (na niektóre stanowiska prawdopodobnie wprowadzoną sztucznie) i mech krzywoszczeć przywłokę Campylopus introflexus – w zachodniej Polsce, zawsze w miejscach zaburzonych (wały, groble, brzegi rowów).

Progi (tab. 2): brak – FV; zajmują do 5% powierzchni – U1; zajmują powyżej 5% powierzchni – U2.

Jak liczy formularz: łączne pokrycie wpisane wprost, a bez niego suma z listy; „nie stwierdzono” → FV. Gatunek obcy na liście bez pokrycia – U1 (tak oceniano pojedyncze osobniki: 2010–2011 sześć stanowisk, 2016 pięć – Parowa I i II, Widłaczek, Staw Kwisa, Bagna przy Rabym Kamieniu III). Rodzime gatunki ekspansywne wpisz w swoim wskaźniku. Karta z przewodnika: brak → FV.

Wskaźnik kardynalny.`,
    thresholds: { FV: 'Brak', U1: 'Zajmują do 5% powierzchni', U2: 'Zajmują powyżej 5% powierzchni' },
    inputs: [
      speciesInput('Obce gatunki inwazyjne', `Gatunki obce z pokryciem ${SURFACE}, np. Spiraea tomentosa 0,5.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków obcych w % transektu – ma pierwszeństwo przed sumą z listy. Dla pojedynczych osobników wpisz 0,5.'),
      NONE_FIELD('Brak gatunków obcych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków obcych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const present = rowNames(i.species).length > 0
      const t = num(i.total)
      if (t !== undefined) return gradeAliens7150(t, present || t > 0)
      if (!present) return i.none === 'yes' ? 'FV' : null
      const c = sumCover(i.species)
      return gradeAliens7150(typeof c === 'number' ? c : 0, true)
    },
    explain: (i) => {
      const t = num(i.total)
      if (t !== undefined) return `Łączne pokrycie gatunków obcych: ${pct(t)}.`
      const names = distinct(rowNames(i.species))
      if (!names.length) return null
      const c = sumCover(i.species)
      return c === 'present' ? `Gatunków obcych: ${names.length}, bez pokrycia – liczę jak pojedyncze osobniki (U1).` : `Gatunków obcych: ${names.length}; łączne pokrycie ${pct(c as number)}.`
    },
    warn: (i) => {
      const parts: string[] = []
      const conflict = noneConflict(i)
      if (conflict) parts.push(conflict)
      const native = distinct(rowNames(i.species)).filter((n) => findSpecies7150(n) && !isAlien7150(n))
      if (native.length) parts.push(`To nie gatunki obce: ${native.join(', ')}${native.some(isExpansive7150) ? ' (rodzime ekspansywne wpisz w swoim wskaźniku)' : ''}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'expansive',
    label: 'Gatunki ekspansywne roślin zielnych',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków ekspansywnych na transekcie (w płatach siedliska) oraz ich udział procentowy. Wskaźnik opisuje kierunek i etap sukcesji na siedliskach zaburzonych, a w przypadku niewielkich zniekształceń sygnalizuje ewentualne zagrożenie.',
    help: `Co wpisać: rodzime gatunki zielne, które rozprzestrzeniają się kosztem przygiełkowiska, z pokryciem ${SURFACE}. Najczęściej trzęślica modra Molinia caerulea, na pojedynczych stanowiskach trzcina pospolita Phragmites australis (2010–2011, 2016), w Kotlinie Orawsko-Nowotarskiej wrzos zwyczajny. Gatunki obce wpisz w „Obcych gatunkach inwazyjnych”, gatunki charakterystyczne formularz pomija.

Progi (tab. 2): brak lub pojedyncze – FV; zajmują do 5% powierzchni – U1; zajmują powyżej 5% powierzchni – U2. Pojedyncze osobniki wpisz jako 0,5 (to jeszcze FV); 1–5% – U1.

Dlaczego: trzęślica to główny sygnał przesuszenia – przetrwanie i rozrost starych kęp oraz obfite rozsiewanie świadczy o zbyt krótkim lub płytkim zatapianiu obniżenia (sprawozdanie 2016–2018). W zachodniej Polsce w miejscu wielu dawnych stanowisk Rhynchosporetum fuscae są dziś wielkopowierzchniowe agregacje trzęślicy. Praktyka 2016: na 31 z 56 stanowisk kontynentalnych zagrożenie (20 × U2, 11 × U1). Karta z przewodnika: brak → FV.

Ocena wybrana w polu ma pierwszeństwo przed sumą. Wskaźnik kardynalny.`,
    thresholds: { FV: 'Brak lub pojedyncze', U1: 'Zajmują do 5% powierzchni', U2: 'Zajmują powyżej 5% powierzchni' },
    inputs: [
      speciesInput('Gatunki ekspansywne', `Rodzime gatunki ekspansywne z pokryciem ${SURFACE}, np. Molinia caerulea 10.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków ekspansywnych w % transektu – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak gatunków ekspansywnych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma rodzimych gatunków ekspansywnych – wtedy wskaźnik to FV.'),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed sumą pokrycia (np. gdy trzęślica ustępuje po zatopieniu). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const t = num(i.total)
      if (t !== undefined) return gradeExpansive7150(t)
      if (!rowNames(i.species).length) return i.none === 'yes' ? 'FV' : null
      const c = sumCover(i.species, (n) => !isCharacteristic7150(n) && !isAlien7150(n))
      if (c === undefined) return 'FV' // same gatunki charakterystyczne albo obce
      return c === 'present' ? null : gradeExpansive7150(c)
    },
    explain: (i) => {
      if (chosenGrade(i)) return null
      const t = num(i.total)
      if (t !== undefined) return `Łączne pokrycie gatunków ekspansywnych: ${pct(t)}.`
      const names = distinct(rowNames(i.species))
      if (!names.length) return null
      const skipped = names.filter((n) => isCharacteristic7150(n) || isAlien7150(n))
      const c = sumCover(i.species, (n) => !isCharacteristic7150(n) && !isAlien7150(n))
      return [
        skipped.length ? `Pominięte (charakterystyczne albo obce): ${skipped.join(', ')}` : '',
        typeof c === 'number' ? `łączne pokrycie gatunków ekspansywnych: ${pct(c)}` : c === 'present' ? 'gatunki bez pokrycia – wpisz pokrycie (pojedyncze osobniki: 0,5) albo wybierz ocenę' : 'gatunków ekspansywnych: brak',
      ]
        .filter(Boolean)
        .join('; ')
        .concat('.')
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      const conflict = noneConflict(i)
      if (conflict) parts.push(conflict)
      const aliens = names.filter(isAlien7150)
      if (aliens.length) parts.push(`Gatunki obce wpisz we wskaźniku „Obce gatunki inwazyjne”: ${aliens.join(', ')}.`)
      const typical = names.filter(isCharacteristic7150)
      if (typical.length) parts.push(`Gatunki charakterystyczne nie są ekspansywnymi: ${typical.join(', ')}.`)
      const woody = names.filter(isWoody7150)
      if (woody.length) parts.push(`Drzewa i krzewy wpisz we wskaźniku „Obecność krzewów i podrostu drzew”: ${woody.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'woody',
    label: 'Obecność krzewów i podrostu drzew',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków drzew i krzewów występujących na transekcie (w płatach siedliska) oraz przybliżony procent pokrycia dla każdego gatunku, a także sumaryczne pokrycie wszystkich drzew i krzewów. Wskaźnik charakteryzuje zagrożenie zarośnięciem torfowiska przez formacje krzewiaste i zbiorowiska leśne.',
    help: `Co wpisać: każdy gatunek drzewa i krzewu (z podrostem i siewkami) z pokryciem ${SURFACE}: sosna zwyczajna, sosna drzewokosa, brzozy omszona i brodawkowata, kruszyna, wierzby. Łączne pokrycie możesz wpisać wprost – korony się nakładają, więc nie musi być sumą.

Progi (tab. 2): brak lub pojedyncze – FV; udział mniejszy niż 10% – U1; udział większy niż 10% – U2. Pojedyncze osobniki wpisz jako 0,5 (FV). Dokładnie 10% (luka w tab. 2) formularz liczy do U1 – tak oceniono kruszynę 10% na Puściźnie Rękowiańskiej w 2016 r.

Dlaczego: pojawianie się drzew i krzewów wiąże się zwykle z przesuszeniem siedliska. Duża zmienność ocen między latami to z jednej strony efekt usuwania nalotów w ramach ochrony czynnej, z drugiej – skrajnych wahań poziomu wody (sprawozdanie 2016–2018). Praktyka 2016: sosna 5% (Łysa Puścizna) – U1. Karta z przewodnika: sosna zwyczajna 0,5% („udział drzew i krzewów znikomy”) → FV.

Wskaźnik kardynalny.`,
    thresholds: { FV: 'Brak lub pojedyncze', U1: 'Udział mniejszy niż 10%', U2: 'Udział większy niż 10%' },
    inputs: [
      speciesInput('Drzewa i krzewy', `Gatunki drzew i krzewów z pokryciem ${SURFACE}, np. Pinus sylvestris 0,5, Frangula alnus 2.`),
      totalInput('Łączne pokrycie drzew i krzewów (opcjonalnie)', 'Pokrycie wszystkich drzew i krzewów razem (rzut pionowy, korony nakładające się liczone raz) w % transektu – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak drzew i krzewów', 'Zaznacz „Nie stwierdzono”, gdy w płatach siedliska nie ma drzew ani krzewów – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Sosna zwyczajna Pinus sylvestris – 0,5%.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const t = num(i.total)
      if (t !== undefined) return gradeWoody7150(t)
      if (!rowNames(i.species).length) return i.none === 'yes' ? 'FV' : null
      const c = sumCover(i.species)
      return typeof c === 'number' ? gradeWoody7150(c) : null
    },
    explain: (i) => {
      const t = num(i.total)
      if (t !== undefined) return `Łączne pokrycie drzew i krzewów: ${pct(t)}.`
      const c = sumCover(i.species)
      if (c === undefined) return null
      return c === 'present' ? 'Gatunki bez pokrycia – wpisz pokrycie (pojedyncze osobniki: 0,5) albo łączne pokrycie.' : `Łączne pokrycie z sumy gatunków: ${pct(c)}.`
    },
    warn: (i) => {
      const parts: string[] = []
      const conflict = noneConflict(i)
      if (conflict) parts.push(conflict)
      const herbs = distinct(rowNames(i.species)).filter((n) => findSpecies7150(n) && !isWoody7150(n))
      if (herbs.length) parts.push(`To nie drzewa ani krzewy: ${herbs.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'water',
    label: 'Stopień uwodnienia',
    parameter: 'structure',
    description:
      'Głębokość zalegania wody gruntowej, ewentualnie powierzchniowej, w okresie letnim (bez użycia sprzętu specjalistycznego) lub – jeśli istnieje taka możliwość – na podstawie odczytu z piezometru. Pomiar w pięciu punktach co 50 m wzdłuż transektu (trzy w miejscach zdjęć fitosocjologicznych, dwa pomiędzy nimi). Ma to na celu sprawdzenie, na jakiej głębokości znajduje się lustro wody w stosunku do powierzchni torfowiska.',
    help: `Co wpisać: poziom wody w cm względem powierzchni torfowiska w pięciu punktach transektu. Woda poniżej powierzchni – liczba dodatnia (np. 5), nad powierzchnią – ujemna (np. −2 to 2 cm powyżej). Formularz liczy średnią.

Progi (tab. 2): poziom wody do 2 cm powyżej, równo lub do 10 cm poniżej powierzchni (w praktyce: w trakcie chodzenia woda zawsze widoczna przynajmniej do wysokości podeszwy) – FV; 2–10 cm powyżej lub 10–20 cm poniżej – U1; ponad 10 cm powyżej lub więcej niż 20 cm poniżej – U2. Uwaga: za mokro też jest źle – stałe, głębokie zatopienie (np. po spiętrzeniu wody) prowadzi do szuwarów i roślinności wodnej.

Bez pomiaru: jeśli woda przy chodzeniu jest wszędzie widoczna przynajmniej do podeszwy, wybierz ocenę FV ręcznie i napisz to w opisie.

Praktyka: lata 2010 i 2011 były wyjątkowo mokre – część ocen zawyżona (sprawozdanie 2009–2011). W 2016 r. obserwowano i przesuszenie (Nowogrodzkie Przygiełkowisko I, Widłaczek), i zatopienie (Leśniczówki, Staw Kwisa). Sprawozdanie 2016–2018: przygiełkowiska to okresowe mokradła – okresowe przesuszenie jest warunkiem kiełkowania przygiełki brunatnej; jednorazowy pomiar warto uzupełnić o wskaźniki pośrednie (podłoże, mszaki, gatunki mezofilne) w opisie. Karta z przewodnika: „2 cm powyżej do 1 cm poniżej” → FV.`,
    thresholds: {
      FV: 'Poziom wody mierzony w piezometrze do 2 cm powyżej, równo lub do 10 cm poniżej powierzchni torfowiska (w trakcie chodzenia po torfowisku woda zawsze widoczna przynajmniej do wysokości podeszwy)',
      U1: 'Poziom wody 2–10 cm powyżej lub 10–20 cm poniżej powierzchni torfowiska',
      U2: 'Poziom wody ponad 10 cm powyżej lub więcej niż 20 cm poniżej powierzchni torfowiska',
    },
    inputs: [
      ...DEPTHS.map(
        (n): FieldDef => ({
          kind: 'number',
          name: `depth${n}`,
          group: 'Poziom wody w punktach transektu (cm poniżej powierzchni; nad powierzchnią – liczba ujemna)',
          groupCols: 5,
          label: `Punkt ${n}`,
          unit: 'cm',
          min: -100,
          max: 200,
          help:
            n % 2 === 1
              ? `Pomiar w miejscu zdjęcia fitosocjologicznego (${n === 1 ? 'początek' : n === 3 ? 'środek' : 'koniec'} transektu). Poziom wody w cm poniżej powierzchni; nad powierzchnią – liczba ujemna.`
              : 'Pomiar pomiędzy zdjęciami fitosocjologicznymi (co 50 m). Poziom wody w cm poniżej powierzchni; nad powierzchnią – liczba ujemna.',
        }),
      ),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed średnią z pomiarów (np. bez pomiaru: woda przy chodzeniu wszędzie widoczna do podeszwy → FV). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. 2 cm powyżej do 1 cm poniżej; poziom wód gruntowych równy z poziomem gruntu.', 'Zakres poziomu wody, piezometr czy dołek, warunki pogodowe – trafi do „wartości” w karcie zamiast opisu z pomiarów.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const m = mean(depths(i))
      return m === undefined ? null : gradeWater7150(m)
    },
    explain: (i) => {
      if (chosenGrade(i)) return null
      const m = mean(depths(i))
      return m === undefined ? null : `Średni poziom wody: ${waterLevel(round1(m))} powierzchni.`
    },
    warn: (i) => {
      const ds = depths(i)
      const m = mean(ds)
      if (m === undefined || chosenGrade(i)) return null
      const bad = ds.filter((d) => gradeWater7150(d) === 'U2')
      return bad.length && gradeWater7150(m) !== 'U2'
        ? `Średnia mieści się w progach, ale ${bad.length === 1 ? 'jeden pomiar wskazuje' : `${bad.length} pomiary wskazują`} U2 (${bad.map((d) => waterLevel(d)).join(', ')}) – przesuszenie albo zatopienie części płatów; oceń i opisz.`
        : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const ds = depths(i)
      if (!ds.length) return ''
      const lo = Math.min(...ds)
      const hi = Math.max(...ds)
      return lo === hi ? `Poziom wody ${waterLevel(lo)} powierzchni` : `Poziom wody od ${waterLevel(lo)} do ${waterLevel(hi)} powierzchni`
    },
  },
  {
    id: 'peat',
    label: 'Pozyskanie torfu',
    parameter: 'structure',
    description:
      'Rozmiary zniszczeń spowodowanych eksploatacją oraz ewentualny stopień regeneracji siedliska: sposób wydobycia (ręczne, mechaniczne czy na skalę przemysłową), roczne wydobycie w m³, procent powierzchni zniszczonego torfowiska oraz przedział czasowy, w którym wydobywano torf. Wskaźnik określa stopień dewastacji siedliska spowodowanej eksploatacją torfu.',
    help: `Co wybrać i opisać: czy i kiedy wydobywano torf na stanowisku, jak (ręcznie – płytkie, nieregularne doły; mechanicznie/przemysłowo – regularne pola, frezowanie), na jaką skalę (procent torfowiska, m³ rocznie) i jak dawno.

Progi (tab. 2): brak pozyskania torfu, a jeżeli w przeszłości (powyżej 30 lat), to na niewielką skalę (do 5% torfowiska), słabo zauważalne w terenie ślady eksploatacji – FV; torf pozyskiwany w przeszłości na znacznie większą skalę (powyżej 5% torfowiska), wyraźnie widoczne ślady eksploatacji, obecnie brak pozyskania lub sporadyczne i na bardzo małą skalę – U1; pozyskiwanie torfu na dużą skalę przez miejscową ludność lub eksploatacja przemysłowa – U2.

Rozjazd: sprawozdanie 2016–2018 uznaje wskaźnik za sprzeczny z charakterem siedliska – pozyskanie torfu z reguły sprzyja przygiełkowiskom (potrzebują zaburzenia), a ocena wg tab. 2 bywa szkodliwa przy planowaniu ochrony czynnej. Formularz i tak podpowiada wg tab. 2; opisz kontekst. Praktyka 2016: w Kotlinie Orawsko-Nowotarskiej wszystkie stanowiska na dawnych potorfiach – U1, Bór na Czerwonem (wydobycie do ok. 1925 r.) – FV; w regionie kontynentalnym 53 × FV (ślady zatarte), 3 × U1 (dość intensywne pozyskanie w przeszłości). Karta z przewodnika: „Obecnie brak; wydobycie do ok. 1925 roku” → FV.`,
    thresholds: thresholdsFromOptions(PEAT),
    inputs: [
      selectInput('Pozyskanie torfu', PEAT, 'Skala i czas pozyskania torfu na stanowisku.'),
      noteInput('Opis (opcjonalnie)', 'np. Obecnie brak. Wydobycie prowadzone było do około 1925 roku.', 'Sposób, skala i okres wydobycia – trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(PEAT)),
    describe: (i) => note(i) || labelOf(PEAT, i.choice),
  },
  {
    id: 'drainage',
    label: 'Melioracje odwadniające',
    parameter: 'structure',
    description:
      'Rozmiary zniszczeń spowodowanych odwodnieniami oraz ewentualny stopień regeneracji siedliska: obecność infrastruktury melioracyjnej, jej stan (konserwacja rowów) oraz wpływ na warunki wodne torfowiska – występowanie rowów, ich głębokość, poziom wody w rowach i to, czy woda w nich odpływa, czy stagnuje.',
    help: `Co wybrać i opisać: czy na stanowisku i w jego otoczeniu są rowy i inne urządzenia odwadniające, jaka jest ich głębokość i poziom wody, czy woda odpływa, czy stagnuje, czy rowy są konserwowane, zarastają, czy mają zastawki lub są zasypane.

Progi (tab. 2): brak sieci rowów i kanałów melioracyjnych oraz innych elementów infrastruktury odwadniającej albo infrastruktura melioracyjna w wystarczającym stopniu „zneutralizowana” w skutek działań ochronnych (zasypywanie rowów, budowa zastawek itp.) – FV; sieć rowów oraz innych elementów infrastruktury w niewielkim stopniu oddziałuje na warunki wodne torfowiska z uwagi na brak konserwacji, częściowe uszkodzenie oraz naturalne zarastanie rowów bądź podejmowane działania ochronne (zastawki, zasypywanie rowów) – U1; istniejąca infrastruktura melioracyjna wyraźnie pogarsza warunki wodne torfowiska – U2.

Praktyka 2016: w regionie kontynentalnym 32 × FV, 14 × U1, 9 × U2 (Margólka, Wielkie Bagno, Bagna przy Rabym Kamieniu, Przygiełkowe Moczary I, Leśniczówki); w Kotlinie Orawsko-Nowotarskiej czynny rów – U2 (Baligówka), zaniedbana infrastruktura – U1. Karta z przewodnika: rowy z XIX w., ślady zatarte, czynne rowy nie oddziałują na stanowisko → FV.`,
    thresholds: thresholdsFromOptions(DRAINAGE),
    inputs: [
      selectInput('Stan melioracji', DRAINAGE, 'Wpływ infrastruktury melioracyjnej na warunki wodne stanowiska – oceniasz wpływ, nie samą obecność rowów.'),
      noteInput('Opis (opcjonalnie)', 'np. Wykonywane prawdopodobnie w XIX w., obecnie ślady zatarte. Czynne rowy melioracyjne nie oddziałują na stanowisko.', 'Rowy, ich głębokość, poziom wody, zastawki – trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(DRAINAGE)),
    describe: (i) => note(i) || labelOf(DRAINAGE, i.choice),
  },
  {
    id: 'genesis',
    label: 'Geneza siedliska',
    parameter: 'structure',
    description:
      'Jakie czynniki doprowadziły do wykształcenia się siedliska i wpływają na jego utrzymywanie się, a także czy są one trwałe. Pozwala przewidzieć trwałość siedliska.',
    help: `Co wybrać i opisać: co odsłania torf i utrzymuje płaty: naturalna erozja (rynny erozyjne na krawędzi kopuły, spływy powierzchniowe, procesy mrozowe w górach, wahania wody na brzegach dystroficznych zbiorników), zwierzęta (wydeptywanie, buchtowanie), czy człowiek (potorfia, sztuczne odsłonięcia, wydeptywanie ścieżek).

Progi (tab. 2): siedlisko powstało i utrzymuje się dzięki działającym ciągle czynnikom naturalnym (procesom erozyjnym itp.) – FV; czynniki prowadzące do powstania siedliska ustały lub działają nieregularnie (miejsca odsłaniane przez zwierzęta) – U1; siedlisko powstało w wyniku działalności człowieka (na potorfiach lub innych miejscach sztucznie pozbawionych roślinności) – U2.

Rozjazdy w praktyce: w 2010–2011 część ekspertów zaliczała starsze potorfia do U1, a część do U2. W 2016 r. w Kotlinie Orawsko-Nowotarskiej potorfia i miejsca wydeptywane przez ludzi – U2, odsłaniane przez zwierzęta – U1, rynny erozyjne na kopule – FV. Sprawozdanie 2016–2018 postuluje zmianę wskaźnika: zespoły przygiełkowisk są kombinacjami naturalnymi, choć mogą rosnąć na siedliskach antropogenicznych (baseny poeksploatacyjne, nieudane zalesienia, opuszczone stawy) – formularz zostaje przy tab. 2. Karta z przewodnika: „Dominują czynniki naturalne (rynny erozyjne)” → FV.`,
    thresholds: thresholdsFromOptions(GENESIS),
    inputs: [
      selectInput('Geneza siedliska', GENESIS, 'Co doprowadziło do powstania płatów i co je utrzymuje.'),
      noteInput('Opis (opcjonalnie)', 'np. Dominują czynniki naturalne (rynny erozyjne).', 'Czynniki powstania i utrzymania płatów – trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(GENESIS)),
    describe: (i) => note(i) || labelOf(GENESIS, i.choice),
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu (miejsce zdjęcia fitosocjologicznego nr ${where === 'początku' ? 1 : where === 'środka' ? 2 : 3}), z odbiornika GPS (WGS84). Przy rozproszonych płatach – współrzędne płatów, w których wykonano zdjęcia.

Dlaczego: przygiełkowiska to płaty po kilka–kilkadziesiąt m² – bez dokładnych współrzędnych następny obserwator ich nie znajdzie, a porównanie ocen między cyklami straci sens.`

const siteFields: FieldDef[] = [
  {
    kind: 'select',
    name: 'subtype',
    label: 'Podtyp siedliska',
    options: SUBTYPE_OPTIONS,
    hint: 'Opcjonalnie – podział zaproponowany w sprawozdaniu 2009–2011, przewodnik go nie ma.',
    help: `Sprawozdanie z monitoringu 2009–2011 proponuje podział 7150 na trzy podtypy:
• 7150-1 – obniżenia na głębokich torfach Polski niżowej (kompleksy torfowisk wysokich i przejściowych; wyróżniające: przygiełka biała, rosiczka okrągłolistna, torfowiec cieniutki);
• 7150-2 – obniżenia na podłożu mineralno-torfowym Polski Zachodniej (płytkie torfowiska na piaskach, obniżenia wśród wydm; wyróżniające: przygiełka brunatna, rosiczka pośrednia, torfowiec ząbkowany, sit drobny, wąkrota);
• 7150-3 – obniżenia na głębokich torfach torfowisk górskich (Karkonosze, Kotlina Orawsko-Nowotarska; znaczny udział torfowca cieniutkiego).

Przewodnik (2012) podtypów nie wprowadza – karta przykładowa go nie podaje. Pole nie wpływa na ocenę.`,
  },
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Bór na Czerwonem',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Bór na Czerwonem”, „Przygiełkowe Moczary I”, „Torfowisko pod Zieleńcem”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego stanowiska. Sprawozdanie 2016–2018 proponuje wyłączenie 32 stanowisk (błędnie zaklasyfikowanych, częściej do 7140, 7110 albo 7120) i włączenie blisko 30 nowych – sprawdź, czy stanowisko nadal jest w sieci 7150.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. badawcze',
    help: 'Typ stanowiska w sieci monitoringu, np. „badawcze” (karta z przewodnika) albo „referencyjne”. Jeśli nie wiesz, zostaw puste.',
  },
  {
    kind: 'text',
    name: 'areaName',
    label: 'Nazwa obszaru',
    placeholder: 'np. Torfowiska Orawsko-Nowotarskie',
    help: 'Obszar (obszar Natura 2000, kompleks torfowisk, region), w którym leży stanowisko, np. „Torfowiska Orawsko-Nowotarskie”, „Uroczyska Borów Dolnośląskich”, „Przygiełkowiska koło Gozdnicy”.',
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Rhynchosporetum albae',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Przewodnik (wg Matuszkiewicza 2001): klasa Scheuchzerio-Caricetea nigrae, rząd Scheuchzerietalia palustris, związek Rhynchosporion albae, zespół Rhynchosporetum albae.

Sprawozdanie 2016–2018 zawęża 7150 do: Rhynchosporetum fuscae, Sphagno tenelli-Rhynchosporetum albae sphagnetosum auriculati (z postaciami ze Sphagnum inundatum, Lycopodiella inundata, Rhynchospora fusca), niektórych postaci Sphagno tenelli-Rhynchosporetum albae typicum i Sphagno denticulati-Eriophoretum angustifolii. Caricetum limosae, Sphagno recurvi-Eriophoretum angustifolii i inne podzespoły Sphagno tenelli-Rhynchosporetum (sphagnetosum fallacis, maji, lindbergii) to raczej dolinki 7110 albo torfowiska przejściowe 7140.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Gdzie leżą płaty (rynny erozyjne, potorfia, brzegi zbiorników, obniżenia wśród wydm), jak duże, na jakim podłożu, co je odsłania.',
    help: `Krótka charakterystyka stanowiska:
• położenie płatów: rynny erozyjne i peryferyjne części kopuły, skarpy i baseny potorfowe, obrzeża pła nasuwającego się na jezioro dystroficzne, płytkie obniżenia na piaskach wśród wydm, ścieżki i miejsca wydeptywane;
• podłoże: głęboki kwaśny torf (pH zwykle 4–5), podłoże mineralno-torfowe, humotorf, muł, piasek;
• wielkość i liczba płatów, czym są otoczone;
• co odsłania torf i jak zmienia się poziom wody;
• ślady eksploatacji torfu, rowy, działania ochronne.

Dlaczego: 7150 jest słabo rozpoznane i często mylone z torfowiskiem przejściowym 7140 (te same gatunki, słabsza erozja, rozwinięty mszar) i zdegradowanym torfowiskiem wysokim 7120 – opis uzasadnia, że to przygiełkowisko.`,
  },
  {
    kind: 'text',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    required: true,
    placeholder: 'np. 0,03',
    help: 'Łączna powierzchnia płatów siedliska 7150 na stanowisku, w hektarach albo opisem z wielkością pojedynczych płatów (karta z przewodnika: „0,03 ha (powierzchnia pojedynczych płatów: 3–50 m²)”). Sprawozdanie 2009–2011: od 0,0001 do kilku ha.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „Rezerwat przyrody Bór na Czerwonem; PLH120016 Torfowiska Orawsko-Nowotarskie”.',
    help: 'Rezerwaty, parki, obszary Natura 2000 (z kodem), użytki ekologiczne i inne formy ochrony obejmujące stanowisko. Każdą formę w osobnej linii albo po średniku. Brak – „brak”.',
  }),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. Nadleśnictwo Nowy Targ',
    help: `Kto zarządza terenem: nadleśnictwo, park, RDOŚ (rezerwat), gmina, właściciele prywatni.

Dlaczego: przygiełkowiska zwykle wymagają ochrony czynnej (usuwanie nalotu, zastawki, „odmładzanie” – zdzieranie murszu). Sprawozdanie 2016–2018: na gruntach prywatnych o takie działania dużo trudniej, co wprost obniżało perspektywy ochrony (4 z 5 stanowisk w Kotlinie Orawsko-Nowotarskiej).`,
  },
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu (zdjęcie nr 1)', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu (zdjęcie nr 2)', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu (zdjęcie nr 3)', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    required: true,
    defaultValue: '200x10 m',
    hint: 'Standard 10×200 m; przy płatach rozproszonych – modyfikacja albo trzy punktowe powierzchnie.',
    help: `Przewodnik: tam, gdzie to możliwe, jeden transekt 10×200 m. Ze względu na rozmiary i kształt płatów dopuszczalne modyfikacje: oś nie musi być linią prostą, transekt może być krótszy i szerszy albo mniejszy (dopasowany do płatu), a przy izolowanych płatach – trzy punktowo wybrane powierzchnie. Stanowisko może tworzyć jeden płat albo zespół rozproszonych płatów na określonym terenie, stanowiący całość. Karta z przewodnika: „Pojedyncze płaty o powierzchni 20–50 m², oddalone od siebie o kilkadziesiąt metrów”.

Dlaczego: wszystkie procenty w karcie odnoszą się do transektu – wpisz faktyczny kształt, żeby następny obserwator wyznaczył ten sam.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 613–614',
    help: 'Wysokość nad poziomem morza – liczba albo zakres (karta z przewodnika: 613–614 m). Siedlisko występuje od niżu po torfowiska górskie (Karkonosze, Góry Orlickie, Kotlina Orawsko-Nowotarska).',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 28.07.2016',
    required: true,
    hint: 'Optymalnie lipiec i sierpień – przygiełki kwitną (i dają się rozpoznać) od lipca.',
    help: `Dzień badań terenowych. Przewodnik: roślinność torfowisk rozwija się stosunkowo późno; przygiełki zaczynają kwitnąć, a tym samym stają się łatwo rozpoznawalne w terenie, dopiero w lipcu, i są dobrze zauważalne do późnej jesieni. Optymalnym terminem jest lipiec i sierpień. Obserwacje powtarza się co cztery lata (w praktyce cykle 2010–2011 i 2016).

Formularz: lipiec–sierpień bez ostrzeżeń; czerwiec, wrzesień i październik – ostrzeżenie miękkie (karta z przewodnika jest z 28 czerwca); poza czerwcem–październikiem – poza sezonem.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const [, mm] = v.split('-').map(Number)
      if (mm < 6 || mm > 10) return 'Termin poza sezonem (czerwiec – październik). Przygiełki będą nie do rozpoznania – opisz powód w uwagach.'
      if (mm < 7 || mm > 8) return 'Termin poza optymalnym (lipiec – sierpień). Przygiełki kwitną od lipca – w czerwcu łatwo je przeoczyć; zapisz to w uwagach.'
      return null
    },
  },
  pickField(methodology7120.siteFields, 'observer', {
    help: `Imię i nazwisko eksperta, który wykonał obserwację i odpowiada za dane (w karcie z przewodnika: „Ekspert” w raporcie rocznym).

Dlaczego: ocena zawiera elementy oceny eksperckiej – trzeba wiedzieć, kogo zapytać o uzasadnienie.`,
  }),
  {
    kind: 'text',
    name: 'additionalExperts',
    label: 'Dodatkowi eksperci',
    placeholder: 'np. —',
    help: 'Osoby, które brały udział w badaniu poza wykonawcą. Brak – zostaw puste albo wpisz „—”.',
  },
]

// ---------- zdjęcia fitosocjologiczne ----------

const r7120 = methodology7120.releves.fields
const LAYERS = 'Zwarcie i wysokość warstw B, C, D'
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, group: LAYERS, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia (WGS84). Trzy zdjęcia: na początku, w środku i na końcu transektu; na powierzchniach nietypowych rozmieszczone inaczej (w płatach siedliska).' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach (karta z przewodnika: 613, 613 i 614 m).' }),
  pickField(r7120, 'area', {
    defaultValue: 25,
    help: 'Powierzchnia zdjęcia w m² – standard 5×5 m = 25 m². Gdy płat jest mniejszy, wpisz faktyczną powierzchnię (karta z przewodnika: zdjęcie I – 5×4 m = 20 m²).',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Przygiełkowiska zajmują zwykle miejsca płaskie i połogie stoki (od 0 do ok. 30°); karta z przewodnika: 4–15° na krawędzi kopuły.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, NW). Siedlisko nie ma preferencji co do wystawy. Dla powierzchni płaskiej wpisz „brak”.' }),
  layerField('coverB', 'Warstwa B – krzewy i podrost drzew: procent powierzchni zdjęcia (sosna, brzoza, kruszyna). Karta z przewodnika: 0,5–2%.', { groupCols: 3 }),
  layerField('coverC', 'Warstwa C – zielna: procent powierzchni zdjęcia pokryty przez przygiełki, rosiczki, krzewinki i turzyce (karta z przewodnika: 40–85%).'),
  layerField('coverD', 'Warstwa D – mszysta: procent powierzchni zdjęcia pokryty przez torfowce, inne mchy i wątrobowce (karta z przewodnika: 15–60%).'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów i podrostu, w metrach (karta z przewodnika: 0,4–1 m).'),
  layerField('heightC', 'Warstwa C – typowa wysokość warstwy zielnej, w centymetrach. Karta z przewodnika podaje dwie wysokości („20/10 cm” – krzewinki/przygiełki) – wpisz wyższą, obie w uwagach do zdjęcia.'),
  layerField('heightD', 'Warstwa D – wysokość mszaków, w centymetrach (karta z przewodnika jej nie podaje – można pominąć).'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Rhynchosporetum albae',
    help: 'Jednostka fitosocjologiczna zdjęcia – zespół albo związek, np. Rhynchosporetum albae (karta z przewodnika), Rhynchosporetum fuscae, Sphagno tenelli-Rhynchosporetum albae.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w zdjęciu z ilościowością w skali Braun-Blanqueta (r, +, 1–5): warstwa B – krzewy i podrost, C – rośliny zielne i krzewinki (siewki drzew też), D – mszaki (torfowce, wątrobowce). Ten sam gatunek może wystąpić w dwóch warstwach (karta przykładowa: sosna w B i w C). Warstwa podpowiada się sama po wyborze gatunku.',
  }),
  {
    kind: 'textarea',
    name: 'remarks',
    label: 'Uwagi do zdjęcia',
    rows: 2,
    placeholder: 'np. Wysokość warstwy C: 20/10 cm',
    help: 'Odstępstwa i szczegóły, które nie mieszczą się w polach: mniejsza powierzchnia, zakres nachylenia, dwie wysokości warstwy zielnej, odsłonięty torf w zdjęciu, poziom wody w punkcie.',
  },
]

export const methodology7150: Methodology = {
  code: '7150',
  name: 'Obniżenia na podłożu torfowym z roślinnością ze związku Rhynchosporion',
  source:
    'Koczur A. 2012, 7150 Obniżenia na podłożu torfowym z roślinnością ze związku Rhynchosporion, [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. III, GIOŚ, s. 123–136 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2009–2011 i 2015–2018.',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj 3 zdjęcia fitosocjologiczne 5×5 m – na początku, w środku i na końcu transektu (na powierzchniach nietypowych rozmieszczone inaczej, a gdy siedlisko jest w zaniku – może ich być mniej). Ilościowość w skali Braun-Blanqueta; warstwy B (krzewy i podrost), C (zielna) i D (mszaki). W tych samych miejscach zmierz poziom wody (wskaźnik „Stopień uwodnienia”).',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Ocena realnych możliwości zachowania właściwego stanu siedliska oraz poprawy stanu niewłaściwego. Uwzględnia informację o wykonywanych i potencjalnych zabiegach ochronnych, możliwość utrzymania siedliska w stanie niepogorszonym w najbliższej przyszłości, aktualny stan ochrony (obszar chroniony, zapisy w planach i operatach), oddziaływania czynników biotycznych i antropogenicznych oraz stan zachowania siedliska. Wysoka ocena parametru „specyficzna struktura i funkcje” powinna rzutować na wyższą ocenę perspektyw.',
    help: `Weź pod uwagę: sukcesję w kierunku torfowiska przejściowego (7140), mszaru wysokotorfowiskowego i boru bagiennego, ekspansję trzęślicy i trzciny, zarastanie drzewami i krzewami, czynne rowy melioracyjne, przesuszenie i zatopienie (np. po budowie zastawek, małej retencji), wydeptywanie (umiarkowane sprzyja przygiełkowiskom, nadmierne je niszczy), eutrofizację. Po stronie plusów: ochrona czynna (wycinanie nalotu, zastawki, „odmładzanie” przez zdzieranie murszu i darni trzęślicy), rezerwat, grunty Skarbu Państwa.

Przewodnik (pkt 5): stan 7150 w Polsce jest zdecydowanie zły; tylko nieliczne, najlepiej zachowane i w pełni naturalne stanowiska przetrwają bez ochrony czynnej. Ochrona bierna jest wskazana tam, gdzie siedlisko powstało spontanicznie na dobrze funkcjonujących, naturalnych torfowiskach (Karkonosze, Góry Orlickie – sprawozdanie 2016–2018).

Praktyka 2016: w Kotlinie Orawsko-Nowotarskiej Bór na Czerwonem (grunty państwowe, ochrona czynna) – FV, pozostałe stanowiska (grunty prywatne, czynne rowy, mała i rozdrobniona powierzchnia) – U2. Karta z przewodnika: „Dobre. Siedlisko w miarę stabilne, chronione w granicach rezerwatu przyrody. Działania ochrony czynnej sprzyjają przetrwaniu siedliska” → FV.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A03', name: 'Koszenie / ścinanie trawy' },
    { code: 'B02.02', name: 'Wycinka lasu' },
    { code: 'C01.03', name: 'Wydobywanie torfu' },
    { code: 'C01.03.01', name: 'Ręczne pozyskanie torfu' },
    { code: 'C01.03.02', name: 'Mechaniczne pozyskanie torfu' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'F03.01', name: 'Polowanie' },
    { code: 'F04', name: 'Pozyskiwanie / usuwanie roślin lądowych, ogólnie' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
    { code: 'G04.01', name: 'Poligony' },
    { code: 'G05', name: 'Inna ingerencja i zakłócenia powodowane przez działalność człowieka' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'G05.07', name: 'Niewłaściwie realizowane działania ochronne lub ich brak' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J01.01', name: 'Wypalanie' },
    { code: 'J02', name: 'Spowodowane przez człowieka zmiany stosunków wodnych' },
    { code: 'J02.01', name: 'Zasypywanie terenu, melioracje i osuszanie – ogólnie' },
    { code: 'J02.01.02', name: 'Osuszanie terenów morskich, ujściowych, bagiennych' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód – ogólnie' },
    { code: 'J02.05.03', name: 'Modyfikowanie akwenów wód stojących' },
    { code: 'J02.06', name: 'Pobór wód z wód powierzchniowych' },
    { code: 'J02.13', name: 'Zaniechanie gospodarki wodnej' },
    { code: 'J03.01', name: 'Zmniejszenie lub utrata określonych cech siedliska' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K01.03', name: 'Wyschnięcie' },
    { code: 'K01.04', name: 'Zatopienie' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.02', name: 'Nagromadzenie materii organicznej' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'K04.01', name: 'Konkurencja' },
    { code: 'K04.05', name: 'Szkody wyrządzane przez roślinożerców (w tym przez zwierzynę łowną)' },
    { code: 'M01', name: 'Zmiany warunków abiotycznych' },
    { code: 'M01.02', name: 'Susze i zmniejszenie opadów' },
    { code: 'M02.01', name: 'Przesunięcie i zmiana siedlisk' },
    { code: 'U', name: 'Nieznane zagrożenie lub nacisk' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: [
    ...methodology7120.otherFields.flatMap((f): FieldDef[] => {
      if (f.name === 'otherValues')
        return [
          {
            ...f,
            hint: 'Np. kompleks z mszarami 7110, torfowiskami przejściowymi 7140 i borem bagiennym 91D0; widłaczek torfowy, przygiełka brunatna.',
            help: 'Wartości przyrodnicze stanowiska poza samym przygiełkowiskiem: sąsiednie siedliska (7110, 7120, 7140, 91D0, 3160 jeziora dystroficzne, 3110/3130 jeziora lobeliowe i brzegi z Littorelletea), rzadkie i chronione gatunki (przygiełka brunatna, widłaczek torfowy, rosiczka pośrednia, wątrobowce). Karta z przewodnika: „Siedlisko występuje w kompleksie z mszarami wysokotorfowiskowymi 7110, torfowiskami przejściowymi 7140 i borem bagiennym 91D0”. Brak – „Nie stwierdzono”.',
          },
          {
            kind: 'textarea',
            name: 'adjacentCommunities',
            label: 'Zbiorowiska roślinne sąsiadujące z siedliskiem 7150',
            rows: 2,
            placeholder: 'np. Vaccinio uliginosi-Pinetum, Sphagnetum magellanici',
            help: 'Zbiorowiska otaczające płaty przygiełkowiska (karta z przewodnika: „Vaccinio uliginosi-Pinetum, Pino rhaeticae-Sphagnetum, Sphagnetum magellanici, zbiorowisko Eriophorum vaginatum-Sphagnum fallax”). Sprawozdanie 2016–2018: sąsiedztwo i domieszka Oxycocco-Sphagnetea świadczą o negatywnym trendzie, mozaika z roślinnością ziemnowodną Isoëto-Littorelletea – o optymalnym rozwoju.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            label: 'Wykonywane działania ochronne',
            help: 'Jakie działania ochronne wykonano i z jakim skutkiem: zastawki i zasypywanie rowów, wycinanie nalotu drzew i krzewów (brzoza, sosna), koszenie trzciny, „odmładzanie siedliska” (usuwanie murszu z darnią trzęślicy, sztuczne odsłanianie torfu). Sprawozdanie 2016–2018: aktywne działania tylko na ok. połowie stanowisk wymagających ochrony czynnej; zastawki i usuwanie nalotu skuteczne, zdzieranie murszu – skuteczne, ale drogie i rzadko stosowane. Brak – „Brak”.',
          },
          {
            kind: 'textarea',
            name: 'proposals',
            label: 'Propozycje wprowadzenia działań ochronnych',
            rows: 3,
            hint: 'Np. kolejne zastawki, wał ziemny, usuwanie nalotu sosny.',
            help: 'Jakie działania proponujesz, konkretnie: podniesienie poziomu wody (zastawki, zasypanie rowów – stopniowo, bez trwałego zatopienia), usuwanie nalotu drzew i krzewów (powtarzane), odsłanianie torfu w płatach trzęślicy, ograniczenie wydeptywania (kładki, zmiana przebiegu ścieżek). Karta z przewodnika: „Montowanie kolejnych zastawek i budowa wału ziemnego w północnej części torfowiska”. Brak – „Brak”.',
          },
          {
            kind: 'textarea',
            name: 'plans',
            label: 'Istniejące plany i programy ochrony / zarządzania / zagospodarowania',
            rows: 2,
            placeholder: 'np. Plan ochrony rezerwatu przyrody',
            help: 'Dokumenty, w których są zapisy dotyczące stanowiska: plan ochrony rezerwatu lub parku, plan zadań ochronnych obszaru Natura 2000, plan urządzenia lasu, programy renaturyzacji torfowisk. Brak – „Brak”.',
          },
          {
            kind: 'select',
            name: 'monitoringRequired',
            label: 'Monitoring jest wymagany',
            options: [
              { value: '', label: '—' },
              { value: 'tak', label: 'Tak' },
              { value: 'nie', label: 'Nie' },
            ],
            help: 'Czy stanowisko powinno zostać w sieci monitoringu 7150 (pole „Raportu rocznego” w karcie z przewodnika). Sprawozdanie 2016–2018 proponuje wyłączyć stanowiska, które są w istocie 7140, 7110 albo 7120. Uzasadnienie wpisz niżej.',
          },
          {
            kind: 'textarea',
            name: 'justification',
            label: 'Uzasadnienie',
            rows: 3,
            help: 'Dlaczego monitoring jest (albo nie jest) potrzebny: zagrożenia, działania ochronne do oceny, rzadkie gatunki; albo wniosek o wyłączenie (błędna klasyfikacja, zniszczenie siedliska). Karta z przewodnika: „Konieczne jest monitorowanie wpływu zwiększonego wydeptywania przez turystów w wyniku łatwiejszego dostępu do siedliska (budowy pomostu przez okrajek)”.',
          },
          {
            kind: 'textarea',
            name: 'otherMonitoring',
            label: 'Inne monitoringi',
            rows: 2,
            placeholder: 'np. Badania poziomu wód gruntowych (sieć piezometrów)',
            help: 'Inne badania i monitoringi prowadzone na stanowisku: piezometry, monitoring hydrologiczny, badania naukowe, monitoring gatunków (np. widłaczka torfowego). Brak – „Brak”.',
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
            help: 'Karta z przewodnika podaje przy ocenie ogólnej udział procentowy powierzchni siedliska o różnym stanie zachowania na stanowisku (Bór na Czerwonem: FV 30%, U1 60%, U2 10%). Trzy liczby powinny dać razem 100%.',
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
            help: `${f.help ?? ''}\n\nDla 7150 zapisz tu także rok i typ monitoringu, nietypowe warunki wodne w roku badań (np. „rok wyjątkowo mokry” – lata 2010 i 2011 były, co zawyżało oceny uwodnienia), termin (czerwiec – przygiełki jeszcze nie kwitną), odstępstwa od transektu i wątpliwości co do identyfikacji siedliska (7140, 7110, 7120).`.trim(),
          },
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_7150.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer7150(s) })),
  speciesInfo: (name) => {
    const s = findSpecies7150(name)
    if (!s) return undefined
    if (s.group === 'characteristic') {
      const src = s.source === 'representative' ? 'gatunek reprezentatywny, tab. 1' : s.source === 'local' ? 'lokalnie charakterystyczny, tab. 1' : 'stała domieszka na podłożu mineralno-torfowym, pkt 4 przewodnika'
      return `${GROUP_LABELS_7150.characteristic} (${src})`
    }
    return s.note ? `${GROUP_LABELS_7150[s.group]} (${s.note})` : GROUP_LABELS_7150[s.group]
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator7150 = (id: string): IndicatorDef => {
  const i = methodology7150.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 7150`)
  return i
}
