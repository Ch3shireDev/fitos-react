// Metodyka 3220 (pionierska roślinność na kamieńcach górskich potoków) jako dane. Źródło: Perzanowska J. 2012,
// „3220 Pionierska roślinność na kamieńcach górskich potoków” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych.
// Przewodnik metodyczny, cz. II, GIOŚ, s. 170–180 (tab. 1 i 2), z praktyką oceny ze sprawozdań z monitoringu
// 2009–2011, 2015–2018 i 2020–2021. Siedlisko nieleśne, efemeryczne, odnawiane przez wezbrania: na odcinku łożyska
// 0,5–1 km transekt 200×10 m i 3 zdjęcia fitosocjologiczne (początek, środek, koniec transektu).
// Z modułu leśnego brane są tylko klocki generyczne. Silnik (src/7120) – bez zmian.
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology } from '../../7120/habitats/types'
import { describeSpecies, mean, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_3220,
  SPECIES_3220,
  defaultLayer3220,
  findSpecies3220,
  groupOf3220,
  isExpansive3220,
  isInvasive3220,
  isWoody3220,
  speciesKey3220,
} from './species'

// ---------- progi liczbowe (tab. 2) ----------

/**
 * Powierzchnia kamieńców na transekcie (200×10 m = 20 arów): „ok. >5 a (>25%)” FV, „2–5 a (10–25%)” U1,
 * „ok. <2 a (mniej niż 10%)” U2. Granice 10% i 25% należą do U1 (tab. 2 ma je w przedziale U1).
 */
export const gradeAreaShare3220 = (p: number): Grade => (p > 25 ? 'FV' : p >= 10 ? 'U1' : 'U2')

/**
 * Szerokość kamieńców (suma na obu brzegach i wyspach, średnia dla odcinka): „>7–8 m” FV, „2–7 m” U1,
 * „brak lokalnie lub <2 m” U2. 7 m liczone do FV – tak wychodzi karta z przewodnika (Siwa Woda: 1–2 m + 5–6 m → FV).
 */
export const gradeWidth3220 = (m: number): Grade => (m >= 7 ? 'FV' : m >= 2 ? 'U1' : 'U2')

/** Pokrycie kamieńców przez roślinność zielną: „<30%” FV, „30–60%” U1 (obie granice), „>60%” U2. */
export const gradeHerbCover3220 = (p: number): Grade => (p < 30 ? 'FV' : p <= 60 ? 'U1' : 'U2')

/**
 * Wysokość warstwy zielnej (średnia z 20 pomiarów): „<25–30 cm” FV, „30–50 cm” U1, „>50 cm” U2.
 * Rozmyta granica 25–30 cm rozstrzygnięta na korzyść FV (do 30 cm wyłącznie); 30 i 50 cm to U1.
 */
export const gradeHerbHeight3220 = (cm: number): Grade => (cm < 30 ? 'FV' : cm <= 50 ? 'U1' : 'U2')

/**
 * Obecność kompleksu siedlisk nadrzecznych (3220, 3230, 3240, 91E0): „minimum trzy typy siedlisk; dobrze wykształcone”
 * FV, „przynajmniej dwa typy, przynajmniej jedno z nich dobrze wykształcone” U1, „brak lub jedno z siedlisk” U2.
 * Dwa lub więcej typów bez żadnego dobrze wykształconego tab. 2 pomija – formularz daje U1 („inne kombinacje”).
 */
export function gradeComplex3220(present: number, good: number): Grade {
  if (good >= 3) return 'FV'
  if (present <= 1) return 'U2'
  return 'U1'
}

const worst = (grades: Grade[]): Grade | null => {
  for (const g of ['U2', 'U1', 'FV', 'XX'] as const) if (grades.includes(g)) return g
  return null
}

const pct = (v: number) => `${plNum(v)}%`
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey3220(n), n])).values()]
const round1 = (n: number) => Math.round(n * 10) / 10

// ---------- opcje selektów ----------

const AREA_TREND: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'other', label: 'Inne kombinacje (np. niewielki spadek, przebudowa kamieńców po wezbraniu)', grade: 'U1' },
  { value: 'clearDecrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi w literaturze', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania (pierwsze badanie)', grade: 'XX' },
]
const EXPANSIVE: GradedOption[] = [
  { value: 'none', label: 'Brak lub pojedyncze osobniki', grade: 'FV' },
  { value: 'scattered', label: 'Kępy niewielkie lub rozproszone osobniki na całym transekcie', grade: 'U1' },
  { value: 'mass', label: 'Masowe występowanie', grade: 'U2' },
]
const ALIENS: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'scattered', label: 'Pojedyncze lub w niewielkich kępach, jeden gatunek', grade: 'U1' },
  { value: 'mass', label: 'Łanowe występowanie jednego gatunku lub kilku', grade: 'U2' },
]
const SHRUB_SPECIES: GradedOption[] = [
  { value: 'native', label: 'Gatunki wierzb rodzimych, charakterystycznych dla Salici-Myricarietum; olsza szara', grade: 'FV' },
  { value: 'other', label: 'Gatunki związane z Salici purpureae, łęgami, grądami i innymi siedliskami leśnymi', grade: 'U1' },
  { value: 'planted', label: 'Gatunki z nasadzeń i/lub obce', grade: 'U2' },
]
const SHRUB_COVER: GradedOption[] = [
  { value: 'young', label: 'Brak, tylko młode lub pojedyncze osobniki', grade: 'FV' },
  { value: 'clumps', label: 'Kępy lub rozproszone pojedyncze osobniki na całej przestrzeni', grade: 'U1' },
  { value: 'mass', label: 'Masowe występowanie, zwłaszcza w dużych kępach', grade: 'U2' },
]
const TREES: GradedOption[] = [
  { value: 'none', label: 'Brak lub pojedyncze osobniki', grade: 'FV' },
  { value: 'scattered', label: 'Pojedyncze kępy lub rozproszone pojedynczo osobniki na całej przestrzeni', grade: 'U1' },
  { value: 'mass', label: 'Masowe występowanie, zwłaszcza osobników rozrośniętych', grade: 'U2' },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

/** Select niewymagany – gdy wystarczy lista albo liczba. */
const optionalSelect = (label: string, options: GradedOption[], help?: string): FieldDef => ({ ...selectInput(label, options, help), required: false })

const noteInput = (placeholder: string, help: string): FieldDef => ({ kind: 'textarea', name: 'note', label: 'Opis (opcjonalnie)', rows: 2, placeholder, help })
const note = (i: InputValues) => String(i.note ?? '').trim()
const choiceLabel = (o: GradedOption[], v: unknown) => labelOf(o, v).toLowerCase()

// ---------- kompleks siedlisk nadrzecznych ----------

export const COMPLEX_HABITATS = [
  { name: 'h3220', code: '3220', label: '3220 Pionierska roślinność na kamieńcach' },
  { name: 'h3230', code: '3230', label: '3230 Zarośla wrześni na kamieńcach' },
  { name: 'h3240', code: '3240', label: '3240 Zarośla wierzby siwej na kamieńcach' },
  { name: 'h91E0', code: '91E0', label: '91E0 Łęgi (olszyny, łęgi wierzbowe)' },
] as const

const COMPLEX_STATE = [
  { value: '', label: '—' },
  { value: 'absent', label: 'brak' },
  { value: 'remnant', label: 'szczątkowo / słabo wykształcone' },
  { value: 'good', label: 'dobrze wykształcone' },
]

function complexCount(i: InputValues): { present: number; good: number; parts: string[] } | null {
  const states = COMPLEX_HABITATS.map((h) => String(i[h.name] ?? ''))
  if (states.some((s) => s === '')) return null
  const parts = COMPLEX_HABITATS.flatMap((h, k) =>
    states[k] === 'good' ? [`${h.code} – dobrze wykształcone`] : states[k] === 'remnant' ? [`${h.code} – szczątkowo`] : [],
  )
  return { present: states.filter((s) => s !== 'absent').length, good: states.filter((s) => s === 'good').length, parts }
}

// ---------- wysokość: pomiary ----------

/** „12 15 8; 20,5” → [12, 15, 8, 20.5]. */
export const parseMeasurements = (v: unknown): number[] =>
  String(v ?? '')
    .split(/[\s;]+|,(?=\s)|,$/)
    .map((t) => num(t.trim()))
    .filter((n): n is number => n !== undefined)

function heightOf(i: InputValues): { mean: number; from: 'mean' | 'list'; n: number } | null {
  const direct = num(i.mean)
  const list = parseMeasurements(i.measurements)
  if (direct !== undefined) return { mean: direct, from: 'mean', n: list.length }
  const m = mean(list)
  return m === undefined ? null : { mean: round1(m), from: 'list', n: list.length }
}

// ---------- gatunki krzewów: ocena z listy ----------

const SHRUB_GROUP_GRADE: Record<string, Grade> = { shrubNative: 'FV', shrubOther: 'U1', alienWoody: 'U2' }

function shrubsFromList(i: InputValues): { grade: Grade; worstNames: string[] } | null {
  const names = distinct(rowNames(i.species)).filter(isWoody3220)
  if (!names.length) return null
  const graded = names.map((n) => ({ n, g: SHRUB_GROUP_GRADE[groupOf3220(n)!] }))
  const g = worst(graded.map((x) => x.g))!
  return { grade: g, worstNames: graded.filter((x) => x.g === g).map((x) => x.n) }
}

// ---------- obce: z listy ----------

const invasiveOnList = (i: InputValues) => distinct(rowNames(i.species).filter(isInvasive3220))

const listTotal = (v: unknown): number | undefined => {
  const covers = speciesRows(v)
    .filter((r) => r.name?.trim())
    .map((r) => num(r.cover))
    .filter((c): c is number => c !== undefined)
  return covers.length ? round1(covers.reduce((a, b) => a + b, 0)) : undefined
}

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia kamieńców na transekcie',
    parameter: 'area',
    description:
      'Szacunkowa powierzchnia, którą zajmują kamieńce na transekcie – iloczyn średniej szerokości kamieńców i długości transektu – oraz jej zmiana w porównaniu z wcześniejszymi badaniami.',
    help: `Co wpisać: jaką część transektu (200×10 m = 20 arów) zajmują kamieńce z roślinnością pionierską – w procentach (5 arów = 25%, 2 ary = 10%). Reszta to zwykle nurt rzeki, zarośla wierzbowe, łęg. Jeśli to kolejne badanie, wybierz też, jak powierzchnia zmieniła się od poprzedniego. Powierzchnię siedliska na całym stanowisku (np. „0,25 ha na 500 m koryta”) możesz dopisać w hektarach.

Progi (tab. 2): nie podlega zmianom lub zwiększa się, na ogół ok. >5 a (>25% transektu) – FV; inne kombinacje, zwykle 2–5 a (10–25%) – U1; wyraźny spadek w porównaniu z wcześniejszymi badaniami lub literaturą, ok. <2 a (<10%) – U2. Gdy podasz i procent, i zmianę, formularz bierze gorszą z dwóch ocen. Pierwsze badanie: zostaw zmianę pustą albo wybierz „Brak danych” – ocena idzie wtedy z procentu.

Uwaga: powierzchnia kamieńców zależy przede wszystkim od powodzi – po dużym wezbraniu przybywa nagiego żwiru, w latach suchych kamieńce zarastają. Sprawozdanie 2015–2018 zaleca, żeby sama zmiana powierzchni nie przesądzała o ocenie ogólnej, i każe notować terminy większych powodzi (pole w „Stanowisku”). W karcie z 2010 r. ten wskaźnik stał w strukturze i funkcjach, od 2016 r. (i w tab. 2) – przy parametrze „Powierzchnia siedliska”.`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się, na ogół ok. >5 a (>25% powierzchni transektu)',
      U1: 'Inne kombinacje, powierzchnia zwykle w zakresie 2–5 a (10–25% powierzchni transektu)',
      U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi w literaturze, ok. <2 a (mniej niż 10% powierzchni transektu)',
    },
    inputs: [
      { kind: 'number', name: 'share', label: 'Kamieńce na transekcie', unit: '%', min: 0, max: 100, help: 'Procent powierzchni transektu (20 arów) zajęty przez kamieńce z roślinnością pionierską. 1 ar = 5%. W karcie z przewodnika: 50% (reszta to koryto rzeki i zarośla wierzbowe).' },
      optionalSelect('Zmiana powierzchni', AREA_TREND, 'Puste przy pierwszym badaniu – wtedy liczy się sam procent.'),
      { kind: 'number', name: 'areaHa', label: 'Powierzchnia siedliska na stanowisku (opcjonalnie)', unit: 'ha', min: 0, help: 'Łączna powierzchnia kamieńców na badanym odcinku łożyska (0,5–1 km), w hektarach. Sprawozdanie 2011: od 0,1–0,3 ha (Wisła, Brenna) do 7 ha (Białka – Frydman), najczęściej 1–2 ha.' },
      noteInput('np. 0,25 ha/500 m koryta rzeki; kamieńce 50% transektu', 'Krótki opis, który trafi do „wartości” w karcie zamiast liczb.'),
    ],
    suggest: (i) => {
      const s = num(i.share)
      const grades: Grade[] = []
      if (s !== undefined) grades.push(gradeAreaShare3220(s))
      const t = gradeMap(AREA_TREND)[String(i.choice)]
      if (t && t !== 'XX') grades.push(t)
      return worst(grades) ?? (t === 'XX' ? 'XX' : null)
    },
    explain: (i) => {
      const s = num(i.share)
      if (s === undefined) return null
      return `${pct(s)} transektu = ${plNum(round1((s / 100) * 20))} a → ${gradeAreaShare3220(s)}.`
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const s = num(i.share)
      const ha = num(i.areaHa)
      return [
        s !== undefined ? `kamieńce ${pct(s)} transektu` : '',
        ha !== undefined ? `${plNum(ha)} ha` : '',
        i.choice ? choiceLabel(AREA_TREND, i.choice) : '',
      ]
        .filter(Boolean)
        .join('; ')
    },
  },
  {
    id: 'width',
    label: 'Szerokość kamieńców',
    parameter: 'structure',
    description:
      'Szerokość kamieńców w metrach (średnia dla badanego odcinka rzeki) – wskazuje na potencjalne możliwości tworzenia się kamieńców i ich późniejszego zasiedlania przez roślinność. Podaje się też szerokość koryta rzecznego wraz z kamieńcami (łożyska).',
    help: `Co wpisać: przeciętną szerokość kamieńców na badanym odcinku, osobno dla jednego i drugiego brzegu (albo brzegu i wyspy) – w karcie zapisuje się to jako „a+b”. Formularz zsumuje. Dla zakresu („1–2 m”) wpisz środek (1,5). Szerokość całego łożyska (koryto z kamieńcami) – opcjonalnie, do porównania.

Progi (tab. 2): >7–8 m – FV; 2–7 m – U1; brak lokalnie lub <2 m – U2. Równo 7 m formularz liczy do FV – tak oceniono kartę z przewodnika (Siwa Woda: 1–2 m + 5–6 m, czyli ok. 7 m → FV).

Dlaczego: szerokość kamieńców mówi, ile miejsca ma siedlisko i czy rzeka może swobodnie przerzucać żwir. Sprawozdanie 2011: od ok. 2 m (na jednym brzegu nawet 0,5 m) do 50 m i więcej; najwęższe w górnych biegach (Siwa Woda, Ropa, Rycerka), najszersze nad Białką i Czarnym Dunajcem. W skrajnych przypadkach to tylko odsypy w zakolach – U2.`,
    thresholds: { FV: '>7–8 m', U1: '2–7 m', U2: 'Brak lokalnie lub <2 m' },
    inputs: [
      { kind: 'number', name: 'widthA', group: 'Szerokość kamieńców (a+b)', groupCols: 3, label: 'Brzeg / wyspa a', unit: 'm', min: 0, required: true, help: 'Przeciętna szerokość kamieńców przy pierwszym brzegu (albo na wyspie), w metrach. Brak kamieńców = 0.' },
      { kind: 'number', name: 'widthB', group: 'Szerokość kamieńców (a+b)', label: 'Brzeg / wyspa b', unit: 'm', min: 0, help: 'Przeciętna szerokość kamieńców przy drugim brzegu (albo na wyspie), w metrach. Puste, gdy kamieńce są tylko po jednej stronie.' },
      { kind: 'number', name: 'bedWidth', group: 'Szerokość kamieńców (a+b)', label: 'Łożysko (koryto z kamieńcami)', unit: 'm', min: 0, help: 'Szerokość koryta rzecznego wraz z kamieńcami, w metrach – tab. 1 każe zestawić ją z szerokością samych kamieńców, żeby lepiej ocenić wielkość potencjalnego siedliska. Nie wpływa na ocenę.' },
      noteInput('np. 1–2 m + 5–6 m', 'Krótki opis, który trafi do „wartości” w karcie zamiast sumy (np. zakresy jak w karcie papierowej).'),
    ],
    suggest: (i) => {
      const a = num(i.widthA)
      if (a === undefined) return null
      return gradeWidth3220(round1(a + (num(i.widthB) ?? 0)))
    },
    explain: (i) => {
      const a = num(i.widthA)
      if (a === undefined) return null
      const b = num(i.widthB)
      const sum = round1(a + (b ?? 0))
      const bed = num(i.bedWidth)
      return `Szerokość kamieńców: ${b !== undefined ? `${plNum(a)} + ${plNum(b)} = ` : ''}${plNum(sum)} m.${bed ? ` Kamieńce to ${Math.round((sum / bed) * 100)}% szerokości łożyska.` : ''}`
    },
    warn: (i) => {
      const a = num(i.widthA)
      const bed = num(i.bedWidth)
      if (a === undefined || bed === undefined) return null
      const sum = a + (num(i.widthB) ?? 0)
      return sum > bed ? `Kamieńce (${plNum(round1(sum))} m) szersze niż całe łożysko (${plNum(bed)} m) – sprawdź pomiar.` : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const a = num(i.widthA)
      if (a === undefined) return ''
      const b = num(i.widthB)
      const bed = num(i.bedWidth)
      return [b !== undefined ? `${plNum(a)} m + ${plNum(b)} m = ${plNum(round1(a + b))} m` : `${plNum(a)} m`, bed !== undefined ? `łożysko ${plNum(bed)} m` : '']
        .filter(Boolean)
        .join('; ')
    },
  },
  {
    id: 'herbCover',
    label: 'Pokrycie kamieńców przez roślinność zielną',
    parameter: 'structure',
    description: 'Stopień zarośnięcia kamieńców w procentach zajmowanej przez nie powierzchni; świadczy o stadium zaawansowania procesu utrwalania kamieńców.',
    help: `Co wpisać: jaki procent powierzchni kamieńców (nie całego transektu!) pokrywa roślinność zielna, w rzucie pionowym. Dla zakresu („5–10%”) wpisz środek (7,5) i zakres w opisie.

Progi (tab. 2): <30% – FV; 30–60% – U1; >60% – U2. Granice 30% i 60% należą do U1.

Dlaczego: kamieniec żyje, dopóki wezbrania co kilka lat zdzierają roślinność. Im bardziej zarośnięty, tym bliżej zarośli wierzbowych i łęgu. Uwaga na lata powodziowe: w 2010 r. wezbrania zmyły roślinność i na wielu stanowiskach było 5–10% – to stan właściwy, nie degradacja. Kamieniec zupełnie bez roślin niektórzy eksperci oceniali na U2 (sprawozdanie 2011) – tab. 2 tego nie przewiduje, opisz to wtedy w uwagach. Sprawozdanie 2021: na FV zwykle 10–20%, najgorzej Wróblówka – 100%.`,
    thresholds: { FV: '<30%', U1: '30–60%', U2: '>60%' },
    inputs: [
      { kind: 'number', name: 'value', label: 'Pokrycie kamieńców przez roślinność zielną', unit: '%', min: 0, max: 100, required: true, help: 'Procent powierzchni kamieńców pokryty roślinnością zielną. Dla zakresu wpisz środek.' },
      noteInput('np. 5–10%', 'Krótki opis, który trafi do „wartości” w karcie zamiast samej liczby (np. zakres).'),
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v !== undefined ? gradeHerbCover3220(v) : null
    },
    describe: (i) => {
      const v = num(i.value)
      return note(i) || (v !== undefined ? pct(v) : '')
    },
  },
  {
    id: 'herbHeight',
    label: 'Wysokość warstwy zielnej',
    parameter: 'structure',
    description:
      'Wysokość roślinności zielnej w centymetrach, jako średnia z dwudziestu pomiarów z uwzględnieniem wartości maksymalnej i minimalnej, oddająca średnią wysokość dla głównej masy roślinności na transekcie; pośrednio świadczy o stopniu zaawansowania sukcesji.',
    help: `Co wpisać: 20 pomiarów wysokości głównej masy roślinności zielnej wzdłuż transektu (w cm) – formularz policzy średnią. Albo od razu średnią (ma pierwszeństwo przed pomiarami). Maksimum – opcjonalnie, do opisu.

Progi (tab. 2): <25–30 cm – FV; 30–50 cm – U1; >50 cm – U2. Rozmytą granicę 25–30 cm formularz rozstrzyga na korzyść FV: poniżej 30 cm FV, 30 i 50 cm to U1.

Dlaczego: niska, luźna roślinność to stadium pionierskie; wysoka (mozga, lepiężniki, wierzbownice) – utrwalony kamieniec. Wysokość zależy od gatunków budujących płat i od kierunku sukcesji. Po powodzi (2010) notowano 5–10 cm, gdzie indziej 20–40 cm, a w Hańczowej i Świątkowej miejscami 1 m.`,
    thresholds: { FV: '<25–30 cm', U1: '30–50 cm', U2: '>50 cm' },
    inputs: [
      { kind: 'text', name: 'measurements', label: 'Pomiary (20 liczb, opcjonalnie)', unit: 'cm', placeholder: 'np. 12 15 8 20 …', help: 'Wysokości w centymetrach, oddzielone spacjami lub średnikami (przecinek dziesiętny działa: „12,5”). Metodyka: 20 pomiarów wzdłuż transektu, z uwzględnieniem wartości maksymalnej i minimalnej.' },
      { kind: 'number', name: 'mean', group: 'Wysokość', groupCols: 2, label: 'Średnia wysokość', unit: 'cm', min: 0, help: 'Średnia wysokość głównej masy roślinności zielnej. Wpisana wprost ma pierwszeństwo przed pomiarami. Dla zakresu („5–20 cm”) wpisz środek.' },
      { kind: 'number', name: 'max', group: 'Wysokość', label: 'Maksymalna wysokość (opcjonalnie)', unit: 'cm', min: 0, help: 'Najwyższe pędy na transekcie (np. „max. 60 cm” w karcie z przewodnika). Nie wpływa na ocenę – trafia do opisu.' },
      noteInput('np. 5–20 cm, max. 60 cm', 'Krótki opis, który trafi do „wartości” w karcie zamiast średniej.'),
    ],
    suggest: (i) => {
      const h = heightOf(i)
      return h ? gradeHerbHeight3220(h.mean) : null
    },
    explain: (i) => {
      const h = heightOf(i)
      if (!h) return null
      return h.from === 'list' ? `Średnia z ${h.n} pomiarów: ${plNum(h.mean)} cm.` : `Średnia wpisana wprost: ${plNum(h.mean)} cm.`
    },
    warn: (i) => {
      const n = parseMeasurements(i.measurements).length
      const parts: string[] = []
      if (n > 0 && n !== 20) parts.push(`Pomiarów: ${n} – metodyka przewiduje 20.`)
      const h = heightOf(i)
      const max = num(i.max)
      if (h && max !== undefined && max < h.mean) parts.push(`Maksimum (${plNum(max)} cm) mniejsze niż średnia (${plNum(h.mean)} cm).`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const h = heightOf(i)
      const max = num(i.max)
      return [h ? `średnio ${plNum(h.mean)} cm` : '', max !== undefined ? `max. ${plNum(max)} cm` : ''].filter(Boolean).join(', ')
    },
  },
  {
    id: 'expansive',
    label: 'Gatunki ekspansywnych roślin zielnych',
    parameter: 'structure',
    cardinal: true,
    description:
      'Obecność rodzimych gatunków roślin zielnych o skłonności do łanowego występowania w granicach transektu, z nazwą gatunkową i pokryciem (pojedyncze osobniki – jako sporadyczne). Wskazuje na zagrożenie dominacją gatunków konkurujących o przestrzeń.',
    help: `Co wybrać: formę występowania rodzimych gatunków ekspansywnych na transekcie. Gatunki z pokryciem (w %, pojedyncze osobniki jako 0,5) wpisz na listę – trafią do karty.

Progi (tab. 2): brak lub pojedyncze osobniki – FV; kępy niewielkie lub rozproszone osobniki na całym transekcie – U1; masowe występowanie – U2.

Najczęstsze (sprawozdania 2011 i 2021): mozga trzcinowata Phalaris arundinacea, lepiężnik różowy Petasites hybridus i wyłysiały P. kablikianus, bylica pospolita Artemisia vulgaris, wrotycz pospolity Tanacetum vulgare, trzcinnik piaskowy Calamagrostis epigejos i szuwarowy C. pseudophragmites, wierzbownica kosmata Epilobium hirsutum, rdest szczawiolistny Persicaria lapathifolia, żarnowiec (Beskidy Śląski i Żywiecki).

Uwaga: trzcinnik szuwarowy i lepiężnik wyłysiały to zarazem gatunki typowe kamieńców – liczą się jako ekspansywne dopiero, gdy tworzą łany. Mozga potrafi tworzyć jednogatunkowe płaty poniżej zapór (Solina).

Wskaźnik kardynalny.`,
    thresholds: thresholdsOf(EXPANSIVE),
    inputs: [
      selectInput('Występowanie gatunków ekspansywnych', EXPANSIVE),
      speciesInput('Gatunki ekspansywne na transekcie', 'Rodzime gatunki ekspansywne z pokryciem transektu w % (pojedyncze osobniki: 0,5).'),
      noteInput('np. Brak', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: byOption(gradeMap(EXPANSIVE)),
    explain: (i) => {
      const t = listTotal(i.species)
      return t !== undefined ? `Łączne pokrycie z listy: ${pct(t)}.` : null
    },
    warn: (i) => {
      const other = distinct(rowNames(i.species).filter((n) => !isExpansive3220(n)))
      const parts: string[] = []
      if (other.length) parts.push(`Spoza grupy ekspansywnych w katalogu: ${other.join(', ')}.`)
      if (i.choice === 'none' && rowNames(i.species).length && (listTotal(i.species) ?? 0) > 5)
        parts.push('Wybrano „brak lub pojedyncze”, a łączne pokrycie z listy przekracza 5% – sprawdź formę występowania.')
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => note(i) || describeSpecies(speciesRows(i.species)) || labelOf(EXPANSIVE, i.choice),
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Obecność obcych, inwazyjnych gatunków roślin o skłonności do łanowego występowania w granicach transektu, z nazwą i pokryciem (pojedyncze osobniki – jako sporadyczne). Wskazuje na zagrożenie konkurencją o przestrzeń ze strony tych gatunków.',
    help: `Co wybrać: formę występowania gatunków obcych inwazyjnych na transekcie. Gatunki z pokryciem wpisz na listę. Gdy formy nie wybierzesz, formularz liczy z listy: 0 gatunków inwazyjnych – FV, 1 i więcej – U1 (łanów z listy nie wyczyta – wtedy wybierz formę ręcznie).

Progi (tab. 2): brak – FV; pojedyncze lub w niewielkich kępach, jeden gatunek – U1; łanowe występowanie jednego gatunku lub kilku – U2. Kilka gatunków pojedynczo tab. 2 pomija; sprawozdanie 2021 ocenia po formie występowania („pojedyncze – U1, łanowe – U2”), więc i formularz daje U1 (z ostrzeżeniem).

Najczęstsze (tab. 4 sprawozdania 2021): niecierpek gruczołowaty Impatiens glandulifera i drobnokwiatowy I. parviflora, przymiotno białe Erigeron annuus i kanadyjskie Conyza canadensis, nawłoć późna Solidago gigantea, uczep amerykański Bidens frondosa, wierzbownica gruczołowata Epilobium ciliatum, rdestowce Reynoutria, rudbekia naga, barszcz Sosnowskiego, kolczurka klapowana. Archeofity polne (fiołek polny, miotła zbożowa, tasznik) też są w tab. 4, ale nie są inwazyjne – formularz ich nie liczy.

Dlaczego: to najczęstsza przyczyna obniżenia oceny 3220 – w 2021 r. ponad 60% stanowisk nie miało FV. Rdestowce i barszcz przy masowym występowaniu wypierają zarośla łęgowe i kamieńce.

Wskaźnik kardynalny.`,
    thresholds: thresholdsOf(ALIENS),
    inputs: [
      optionalSelect('Występowanie gatunków obcych', ALIENS, 'Puste – formularz policzy gatunki z listy.'),
      speciesInput('Obce gatunki inwazyjne na transekcie', 'Gatunki obce inwazyjne z pokryciem transektu w % albo klasą w opisie (pojedyncze, rzadkie, częste).'),
      noteInput('np. Brak', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const byChoice = gradeMap(ALIENS)[String(i.choice)]
      if (byChoice) return byChoice
      if (!rowNames(i.species).length) return null
      return invasiveOnList(i).length ? 'U1' : 'FV'
    },
    explain: (i) => {
      if (!rowNames(i.species).length) return null
      const n = invasiveOnList(i).length
      const t = listTotal(i.species)
      return `Gatunków inwazyjnych na liście: ${n}${t !== undefined ? `, łączne pokrycie ${pct(t)}` : ''}.`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      const parts: string[] = []
      const notCounted = distinct(names.filter((n) => !isInvasive3220(n)))
      if (notCounted.length) parts.push(`Nie liczą się (rodzime albo obce nieinwazyjne): ${notCounted.join(', ')}.`)
      const n = invasiveOnList(i).length
      const g = gradeMap(ALIENS)[String(i.choice)]
      if (n > 1 && (g === 'U1' || !g)) parts.push(`Na liście ${n} gatunki inwazyjne – tab. 2 przy U1 mówi o jednym gatunku. Jeśli któryś tworzy łany, wybierz U2.`)
      if (i.choice === 'none' && n) parts.push('Wybrano „Brak”, a na liście są gatunki inwazyjne.')
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => note(i) || describeSpecies(speciesRows(i.species)) || labelOf(ALIENS, i.choice),
  },
  {
    id: 'shrubSpecies',
    label: 'Gatunki krzewów',
    parameter: 'structure',
    description:
      'Obecność krzewów w granicach transektu, z nazwą gatunkową i pokryciem (pojedyncze osobniki – jako sporadyczne). Pozwala ocenić prawidłowość składu gatunkowego zbiorowiska.',
    help: `Co wpisać: krzewy (i podrost drzew) na transekcie z procentowym udziałem w warstwie krzewów. Formularz sam oceni skład: wierzba siwa, września, wierzba wawrzynkowa, olsza szara – FV; wierzba purpurowa, krucha, biała, trójpręcikowa i gatunki łęgów, grądów i lasów – U1; gatunki obce lub z nasadzeń (robinia, topole kanadyjska i balsamiczna) – U2. Liczy się najgorszy gatunek z listy. Ocenę możesz wybrać ręcznie – ma pierwszeństwo, a formularz pokaże rozjazd z listą.

Progi (tab. 2): gatunki wierzb rodzimych, charakterystycznych dla Salici-Myricarietum; olsza szara – FV; gatunki związane z Salici purpureae, łęgami, grądami i innymi siedliskami leśnymi – U1; gatunki z nasadzeń i/lub obce – U2. Brak krzewów (np. po wezbraniu) formularz traktuje jak FV – nic złego nie rośnie.

Uwaga na wierzbę purpurową: tab. 2 i sprawozdanie 2021 (S. purpurea, S. fragilis → U1) liczą ją do U1, ale karta z przewodnika (Siwa Woda: wierzba siwa, purpurowa i olsza szara po <1%) dała FV. Przy pojedynczych siewkach purpurowej między wierzbą siwą wybierz FV ręcznie i uzasadnij w opisie.`,
    thresholds: thresholdsOf(SHRUB_SPECIES),
    inputs: [
      optionalSelect('Skład gatunkowy krzewów', SHRUB_SPECIES, 'Puste – ocena z listy gatunków.'),
      speciesInput('Gatunki krzewów na transekcie', 'Krzewy i podrost drzew z procentowym udziałem w warstwie krzewów (pojedyncze osobniki: 0,5).'),
      {
        kind: 'select',
        name: 'absent',
        label: 'Brak krzewów',
        options: [
          { value: '', label: '—' },
          { value: 'yes', label: 'Nie stwierdzono krzewów' },
        ],
        help: 'Zaznacz, gdy na transekcie nie ma żadnych krzewów (np. świeżo po wezbraniu) – wskaźnik to wtedy FV.',
      },
      noteInput('np. Wierzba siwa Salix eleagnos <1%, olsza szara Alnus incana <1%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const byChoice = gradeMap(SHRUB_SPECIES)[String(i.choice)]
      if (byChoice) return byChoice
      const l = shrubsFromList(i)
      if (l) return l.grade
      return i.absent === 'yes' && !rowNames(i.species).length ? 'FV' : null
    },
    explain: (i) => {
      const l = shrubsFromList(i)
      return l ? `Wg listy: ${l.grade} (decyduje: ${l.worstNames.join(', ')}).` : null
    },
    warn: (i) => {
      const parts: string[] = []
      const l = shrubsFromList(i)
      const byChoice = gradeMap(SHRUB_SPECIES)[String(i.choice)]
      if (l && byChoice && l.grade !== byChoice) parts.push(`Wybrano ${byChoice}, a wg listy wychodzi ${l.grade} (${l.worstNames.join(', ')}).`)
      const unknown = distinct(rowNames(i.species).filter((n) => !isWoody3220(n)))
      if (unknown.length) parts.push(`Nierozpoznane jako drzewo/krzew: ${unknown.join(', ')} – nie liczą się.`)
      if (i.absent === 'yes' && rowNames(i.species).length) parts.push('Zaznaczono „Nie stwierdzono krzewów”, a lista nie jest pusta.')
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      return list || (i.absent === 'yes' ? 'nie stwierdzono' : labelOf(SHRUB_SPECIES, i.choice))
    },
  },
  {
    id: 'shrubCover',
    label: 'Zwarcie krzewów na transekcie',
    parameter: 'structure',
    cardinal: true,
    description: 'Oszacowanie zwarcia krzewów w płacie, wyrażone w procentach (z dokładnością do 5%); wskazuje na etap rozwoju i strukturę zbiorowiska.',
    help: `Co wybrać: jak rosną krzewy na transekcie. Zwarcie w procentach (co 5%) wpisz obok – trafi do karty.

Progi (tab. 2): brak, tylko młode lub pojedyncze osobniki – FV; kępy lub rozproszone pojedyncze osobniki na całej przestrzeni – U1; masowe występowanie, zwłaszcza w dużych kępach – U2. Tab. 2 nie podaje progów procentowych – ocena idzie z opisu.

Praktyka: sprawozdanie 2011 – zwykle 1–5%, ok. 10% (Frydman, Rozstajne), maks. 30% (Hańczowa); karta z przewodnika <15% → FV. Sprawozdanie 2021 – Wróblówka 95% → U2 (stanowisko do usunięcia z sieci).

Dlaczego: krzewy to znak, że kamieniec się utrwala i przechodzi w zarośla wierzbowe (3240) i łęg. Niskie zwarcie bywa skutkiem powodzi, która wyrwała krzewy – opisz to.

Wskaźnik kardynalny.`,
    thresholds: thresholdsOf(SHRUB_COVER),
    inputs: [
      selectInput('Zwarcie krzewów', SHRUB_COVER),
      { kind: 'number', name: 'value', label: 'Zwarcie krzewów (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Zwarcie krzewów na transekcie w procentach, z dokładnością do 5%. Nie wpływa na ocenę – trafia do „wartości”.' },
      noteInput('np. <15%', 'Krótki opis, który trafi do „wartości” w karcie.'),
    ],
    suggest: byOption(gradeMap(SHRUB_COVER)),
    warn: (i) => {
      const v = num(i.value)
      return v !== undefined && v % 5 !== 0 ? 'Metodyka: zwarcie z dokładnością do 5%.' : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const v = num(i.value)
      return [v !== undefined ? pct(v) : '', labelOf(SHRUB_COVER, i.choice)].filter(Boolean).join('; ')
    },
  },
  {
    id: 'trees',
    label: 'Udział gatunków drzewiastych (powyżej 1,5 m wys.)',
    parameter: 'structure',
    description:
      'Obecność drzew wyższych niż ok. 1,5–2 m (sięgających ponad warstwę krzewów) w granicach transektu, z nazwą gatunkową i pokryciem lub klasą (pojedyncze, rzadkie, częste). Osobniki te mogą ocienić kamieńce i eliminować gatunki światłolubne – wskaźnik określa warunki świetlne na transekcie.',
    help: `Co wybrać: jak występują drzewa wyższe niż ok. 1,5–2 m. Gatunki (z pokryciem lub klasą w opisie: pojedyncze, rzadkie, częste) wpisz na listę, łączny procent pokrycia transektu – obok.

Progi (tab. 2): brak lub pojedyncze osobniki – FV; pojedyncze kępy lub rozproszone pojedynczo osobniki na całej przestrzeni – U1; masowe występowanie, zwłaszcza osobników rozrośniętych – U2.

Najczęściej (sprawozdania): wierzba krucha, olsza szara, wierzba siwa i purpurowa, olsza czarna, świerk, czasem topola balsamiczna i robinia. Karta z przewodnika: świerk, olsza szara, wierzba siwa i purpurowa, łącznie <1% → FV.

Dlaczego: drzewa zacieniają kamieniec – gatunki pionierskie są światłolubne.`,
    thresholds: thresholdsOf(TREES),
    inputs: [
      selectInput('Występowanie drzew >1,5 m', TREES),
      speciesInput('Gatunki drzewiaste powyżej 1,5 m', 'Drzewa wyższe niż ok. 1,5–2 m z pokryciem transektu w % (pojedyncze osobniki: 0,5).'),
      { kind: 'number', name: 'total', label: 'Łączne pokrycie (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Łączny procent pokrycia transektu przez drzewa >1,5 m. Dla „<1%” wpisz 0,5. Nie wpływa na ocenę – trafia do opisu.' },
      noteInput('np. Świerk Picea abies, olsza szara Alnus incana. Łącznie <1%', 'Krótki opis, który trafi do „wartości” w karcie.'),
    ],
    suggest: byOption(gradeMap(TREES)),
    warn: (i) => {
      const unknown = distinct(rowNames(i.species).filter((n) => findSpecies3220(n) && !isWoody3220(n)))
      return unknown.length ? `To nie drzewa ani krzewy: ${unknown.join(', ')}.` : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const t = num(i.total)
      return [describeSpecies(speciesRows(i.species)), t !== undefined ? `łącznie ${t > 0 && t < 1 ? '<1%' : pct(t)}` : '', speciesRows(i.species).length ? '' : labelOf(TREES, i.choice)]
        .filter(Boolean)
        .join('; ')
    },
  },
  {
    id: 'complex',
    label: 'Obecność kompleksu siedlisk nadrzecznych: 3220, 3230, 3240, 91E0',
    parameter: 'structure',
    cardinal: true,
    description:
      'Obecność na odcinku rzeki kompleksu siedlisk świadczy o zachowanym ciągu sukcesyjnym i gwarantuje możliwość odnawiania się siedliska po wezbraniach. Podaje się, jakie siedliska są obecne i w jakim stopniu są zbliżone do wzorca (reprezentatywność).',
    help: `Co wybrać: dla każdego z czterech siedlisk na badanym odcinku rzeki – brak, szczątkowo (słabo wykształcone) albo dobrze wykształcone. 3220 to samo siedlisko – zwykle „dobrze wykształcone”.

Progi (tab. 2): minimum trzy typy siedlisk, dobrze wykształcone – FV; przynajmniej dwa typy, przynajmniej jedno dobrze wykształcone – U1; brak lub jedno z siedlisk – U2. Formularz: FV, gdy co najmniej 3 typy są dobrze wykształcone; U2, gdy obecny jest najwyżej 1 typ; pozostałe przypadki (także dwa typy bez dobrze wykształconego, których tab. 2 nie opisuje) – U1. Siedlisko szczątkowe liczy się jako obecne.

Przykład z przewodnika (Siwa Woda): 3220 i 3240 wykształcone wzorcowo, 91E0 szczątkowo → U1.

Uwaga: sprawozdanie 2011 oceniało niektóre górne odcinki (Siwa Woda, Waksmundzki Potok) na FV mimo niepełnego kompleksu, „gdyż warunki fizjograficzne nie pozwalają na ich wykształcenie”. Jeśli tak oceniasz, wybierz ocenę ręcznie i uzasadnij w opisie.

Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Minimum trzy typy siedlisk; dobrze wykształcone',
      U1: 'Przynajmniej dwa typy siedlisk, przynajmniej jedno z nich dobrze wykształcone',
      U2: 'Brak lub jedno z siedlisk',
    },
    inputs: [
      ...COMPLEX_HABITATS.map(
        (h, k): FieldDef => ({
          kind: 'select',
          name: h.name,
          label: h.label,
          group: 'Siedliska na odcinku rzeki',
          ...(k === 0 ? { groupCols: 2 } : {}),
          options: COMPLEX_STATE,
          required: true,
          help: `Czy na badanym odcinku rzeki jest siedlisko ${h.label} i jak bardzo przypomina wzorzec: brak, szczątkowo (fragmenty, słabo wykształcone) albo dobrze wykształcone.`,
        }),
      ),
      noteInput('np. 3220, 3240 – oba wykształcone wzorcowo; 91E0 – szczątkowo', 'Krótki opis, który trafi do „wartości” w karcie zamiast zestawienia.'),
    ],
    suggest: (i) => {
      const c = complexCount(i)
      return c ? gradeComplex3220(c.present, c.good) : null
    },
    explain: (i) => {
      const c = complexCount(i)
      return c ? `Obecne typy: ${c.present}, dobrze wykształcone: ${c.good}.` : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const c = complexCount(i)
      return c ? c.parts.join('; ') || 'brak siedlisk kompleksu' : ''
    },
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu, z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie.

Dlaczego: kamieńce przemieszczają się po każdym wezbraniu, więc stanowiska nie da się wytyczyć „co do metra” – ale za 6 lat ktoś musi trafić na ten sam odcinek rzeki i porównać.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Siwa Woda',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – zwykle rzeka albo miejscowość, np. „Siwa Woda”, „Białka – Frydman”, „Wróblówka”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego odcinka rzeki.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'river',
    label: 'Rzeka / potok',
    required: true,
    placeholder: 'np. Siwa Woda (dopływ Białki)',
    help: 'Nazwa cieku, nad którym leży stanowisko, najlepiej z rzeką, do której uchodzi. Siedlisko notowano m.in. nad Białką, Czarnym Dunajcem, Dunajcem, Sołą, Kamienicą Gorczańską, Ochotnicą, Rabą, Białą Tarnowską, Wisłoką, Ropą, Jasiołką, Osławą i Sanem.',
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. zbiorowisko Calamagrostis pseudophragmites-Festuca rubra',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Dla 3220: klasa Thlaspietea rotundifolii, rząd Epilobietalia fleischeri, związek Epilobion fleischeri; zbiorowisko trzcinnika szuwarowego i kostrzewy czerwonej Calamagrostis pseudophragmites-Festuca rubra oraz zbiorowisko wrześni pobrzeżnej Myricaria germanica. Jeśli nie da się rozpoznać (np. świeżo po wezbraniu), wpisz to – karta z przewodnika ma tu „?”.

Uwaga: do 3220 należą tylko nieuregulowane odcinki górskich potoków i rzek (głębokie doliny, duże spadki, wąskie koryta, duże wahania stanów wody). Zarośla wrześni to 3230, zarośla wierzby siwej – 3240.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Układ koryta i kamieńców, wyspy, wielkość kamieni, ostatnie wezbrania, zarośla wierzbowe, zabudowa hydrotechniczna.',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• koryto: odkryte, szerokie, podzielone na ramiona; wyspy, łachy, podmyte brzegi;
• kamieńce: wielkość kamieni, łachy piasku i żwiru, świeżo naniesione czy ustabilizowane;
• roślinność: zwarcie, zarośla wierzbowe (S. eleagnos, S. purpurea) i łęgi przy brzegach;
• wezbrania: kiedy ostatnio i co zmieniły;
• antropopresja: regulacja, zabudowa poprzeczna, narzut kamienny, pobór żwiru, śmieci.

Za stanowisko przyjmuje się odcinek łożyska (ok. 0,5–1 km) z szerokimi kamieńcami wzdłuż brzegów i wyspami w nurcie.`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Łączna powierzchnia kamieńców z roślinnością pionierską na badanym odcinku łożyska, w hektarach (0,25 ha na 500 m koryta w karcie z przewodnika). Oszacuj w terenie albo z ortofotomapy.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „PLH120024 Dolina Białki”. Poza obszarami – „brak” albo opis, np. „poniżej granic TPN”.',
  }),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. PGW Wody Polskie, RZGW w Krakowie',
    help: 'Kto zarządza korytem (zwykle Państwowe Gospodarstwo Wodne Wody Polskie, dawniej RZGW) lub terenem (park narodowy, nadleśnictwo). Ważne przy usuwaniu gatunków obcych i planach regulacji koryta.',
  },
  {
    kind: 'text',
    name: 'section',
    label: 'Badany odcinek łożyska',
    placeholder: 'np. 0,5 km powyżej mostu',
    help: 'Długość i położenie odcinka łożyska, który jest stanowiskiem – metodyka proponuje 0,5–1 km, w zależności od warunków lokalnych. Kamieńce wędrują po wezbraniach, więc opisz odcinek słowami (most, ujście, połączenie potoków), nie tylko współrzędnymi.',
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
    hint: 'Jeden transekt 200×10 m na kamieńcach w granicach odcinka.',
    help: 'Na każdym stanowisku wyznacza się jeden transekt o długości 200 m i szerokości 10 m (20 arów), na kamieńcach – brzegowych albo na wyspie. Transekt może się przesuwać razem z kamieńcami między kolejnymi badaniami; opisz to w uwagach.',
    warn: (v) => {
      const m = String(v ?? '').replace(',', '.').match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/)
      if (!m) return null
      const a = Number(m[1]) * Number(m[2])
      return Math.abs(a - 2000) < 1 ? null : `${plNum(a)} m² – metodyka przewiduje transekt 200×10 m (2000 m²). Opisz odstępstwo w uwagach.`
    },
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    help: 'Wysokość nad poziomem morza transektu, z GPS albo mapy. Można wpisać zakres („882–893”). Siedlisko występuje w Karpatach, na pogórzu i w górach.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 10.07.2010',
    required: true,
    hint: 'Optymalnie czerwiec–sierpień, nie tuż po wezbraniu.',
    help: `Dzień badań terenowych. Optymalny termin: czerwiec–sierpień, gdy roślinność jest rozwinięta, a część gatunków kwitnie. Później też się da, ale część gatunków będzie trudna do oznaczenia (2016: połowę stanowisk badano w pierwszej połowie września, bez szkody dla wyników).

Uwaga na powodzie – w Karpatach zwykle koniec czerwca lub pierwsza dekada lipca. W czasie wezbrania nie da się prowadzić obserwacji, a tuż po nim widać tylko stadium inicjalne. Badania powtarza się co 6 lat.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 6 && m <= 8 ? null : 'Termin poza optymalnym oknem (czerwiec–sierpień). Część gatunków może być nierozpoznawalna.'
    },
  },
  {
    kind: 'textarea',
    name: 'floods',
    label: 'Większe wezbrania od poprzedniego badania',
    rows: 2,
    placeholder: 'np. wezbranie w czerwcu 2010 – przebudowa kamieńców',
    help: 'Metodyka każe odnotowywać terminy większych powodzi między kolejnymi obserwacjami – od nich zależą powierzchnia kamieńców, pokrycie i wysokość roślinności oraz zwarcie krzewów. Wpisz miesiąc i rok oraz co zmieniły (nowe łachy, zniszczone zarośla). Nie wiadomo – „brak danych”.',
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcia fitosocjologiczne: 3 × 5×5 m ----------

const r7120 = methodology7120.releves.fields
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia. Zdjęcia robi się na początku, w środku i na końcu transektu.' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach.' }),
  pickField(r7120, 'area', { defaultValue: 25, help: 'Powierzchnia zdjęcia w m² – w karcie z przewodnika 25 m² (5×5 m).' }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Kamieńce są prawie płaskie: 0–2° (w karcie z przewodnika 0–2%).' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, SW) – zwykle zgodnie z biegiem rzeki. Dla powierzchni płaskiej zostaw puste albo wpisz „brak”.' }),
  layerField('coverB', 'Warstwa B – krzewy: procent powierzchni zdjęcia pod wierzbami, wrześnią, olszą szarą. Brak = 0.\n\nDlaczego: warstwa B to utrwalanie kamieńca – przejście w zarośla 3230/3240.', { groupCols: 3 }),
  layerField('coverC', 'Warstwa C – zielna: procent powierzchni zdjęcia pokryty roślinami zielnymi (z siewkami drzew i krzewów). Na kamieńcu zwykle 5–30%, reszta to żwir.\n\nDlaczego: niskie zwarcie C to stadium pionierskie; zwarta darń – utrwalony kamieniec.'),
  layerField('coverD', 'Warstwa D – mszysta: mchy na kamieniach i w zagłębieniach. Zwykle brak lub śladowo.'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów, w metrach. Brak warstwy = 0.'),
  layerField('heightC', 'Warstwa C – typowa wysokość roślin zielnych, w centymetrach (zwykle 5–30 cm). Dla zakresu wpisz środek; maksimum dopisz w uwagach.'),
  layerField('heightD', 'Warstwa D – typowa wysokość warstwy mszystej, w centymetrach.'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Calamagrostis pseudophragmites-Festuca rubra',
    help: 'Jednostka fitosocjologiczna zdjęcia, np. zbiorowisko Calamagrostis pseudophragmites-Festuca rubra, Epilobion fleischeri. Nie da się rozpoznać – zostaw puste.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w poletku z ilościowością w skali Braun-Blanqueta (r, +, 1–5): warstwa B – krzewy, C – zielna (także siewki i odrośla wierzb, olszy, świerka), D – mszaki. Warstwa podpowiada się sama po wyborze gatunku – siewki drzew przestaw na C.',
  }),
]

export const methodology3220: Methodology = {
  code: '3220',
  name: 'Pionierska roślinność na kamieńcach górskich potoków',
  source:
    'Perzanowska J. 2012, 3220 Pionierska roślinność na kamieńcach górskich potoków, [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 170–180 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2009–2011, 2015–2018 i 2020–2021',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj 3 zdjęcia fitosocjologiczne: na początku, w środku i na końcu transektu (w karcie z przewodnika po 25 m²), z położeniem i wysokością z GPS. Ilościowość w skali Braun-Blanqueta; warstwy B (krzewy), C (zielna z siewkami), D (mszaki).',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Możliwości ochrony siedliska i utrzymania go w stanie niepogorszonym, przy analizie czynników realnie oddziałujących na siedlisko w najbliższej przyszłości. Pod uwagę brany jest aktualny stan ochrony (obecność na obszarze chronionym i reżim ochronny), sposób ochrony przeciwpowodziowej lub użytkowania gospodarczego oraz istniejące plany regulacji rzek.',
    help: `Siedlisko jest z natury bardzo plastyczne i nie wymaga zabiegów – wystarczy naturalny rytm zalewów i zarzucenie planów regulacji koryta. Największe zagrożenia: regulacja i zabudowa poprzeczna (progi, zapory, zbiorniki), umacnianie brzegów narzutem, pobór żwiru i kamienia, gatunki obce (niecierpek gruczołowaty, rdestowce, nawłoć, barszcz), a w latach bez wezbrań – zarastanie.

Działania, o których warto wspomnieć: usuwanie gatunków obcych (niecierpek przed kwitnieniem, rdestowce z kłączami), powstrzymanie regulacji i poboru żwiru. Koryta są pod zarządem Wód Polskich – to im zgłasza się potrzebę usuwania obcych.

Praktyka: sprawozdanie 2015–2018 nie obniżało oceny ogólnej, gdy zły stan wynikał z braku silnych wezbrań (Świątkowa Mała, Panna) – opisz to w uzasadnieniu.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A03', name: 'Koszenie / ścinanie' },
    { code: 'A04', name: 'Wypas' },
    { code: 'A10', name: 'Restrukturyzacja gospodarstw rolnych' },
    { code: 'A11', name: 'Inne rodzaje praktyk rolniczych, nie wymienione powyżej' },
    { code: 'B02.04', name: 'Usuwanie martwych i umierających drzew' },
    { code: 'C01', name: 'Kopalnie, kamieniołomy, wydobywanie' },
    { code: 'C01.01', name: 'Wydobywanie piasku i żwiru' },
    { code: 'C01.01.01', name: 'Kopalnie piasku i żwiru' },
    { code: 'C01.01.02', name: 'Usuwanie materiału z plaży' },
    { code: 'D01', name: 'Drogi, ścieżki i drogi kolejowe' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D01.02', name: 'Drogi, autostrady' },
    { code: 'D01.05', name: 'Mosty, wiadukty' },
    { code: 'E01.03', name: 'Zabudowa rozproszona' },
    { code: 'E01.04', name: 'Inne typy zabudowy' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'E03.01', name: 'Pozbywanie się odpadów z gospodarstw domowych / obiektów rekreacyjnych' },
    { code: 'E03.04', name: 'Inne odpady' },
    { code: 'F02.03', name: 'Wędkarstwo' },
    { code: 'G01', name: 'Sporty i różne formy czynnego wypoczynku, uprawiane w plenerze' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
    { code: 'G01.08', name: 'Inne sporty i formy czynnego wypoczynku i rekreacji' },
    { code: 'G05', name: 'Inne ludzkie oddziaływania i zaburzenia' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'H01', name: 'Zanieczyszczenie wód powierzchniowych (słodkowodnych, morskich i słonawych)' },
    { code: 'H01.08', name: 'Rozproszone zanieczyszczenie wód powierzchniowych spowodowane przez ścieki z gospodarstw domowych' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02.03', name: 'Regulowanie (prostowanie) koryt rzecznych i zmiana ich przebiegu' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód – ogólnie' },
    { code: 'J02.05.02', name: 'Modyfikowanie struktury śródlądowych cieków wodnych' },
    { code: 'J02.06', name: 'Pobór wód powierzchniowych' },
    { code: 'J02.12', name: 'Tamy, wały, sztuczne plaże – ogólnie' },
    { code: 'J03.02', name: 'Antropogeniczne zmniejszenie spójności siedlisk' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K01.02', name: 'Zamulenie' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K04.01', name: 'Konkurencja' },
    { code: 'L08', name: 'Powódź (naturalne procesy)' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: [
    ...methodology7120.otherFields.flatMap((f): FieldDef[] => {
      if (f.name === 'otherValues')
        return [
          {
            ...f,
            hint: 'Np. kompleks z 3230, 3240, 91E0; rzadkie gatunki górskie; ptaki kamieńców.',
            help: 'Wartości przyrodnicze stanowiska poza samym kamieńcem: sąsiednie siedliska nadrzeczne (zarośla wrześni 3230, wierzby siwej 3240, łęgi 91E0), gatunki górskie spływające z wodą (gęsiówka alpejska, wiechlina alpejska żyworodna, len karpacki), ptaki kamieńców (sieweczka rzeczna, brodziec piskliwy, pliszka górska). Brak informacji – „Nie stwierdzono” albo „Nie pozyskano danych”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            help: 'Jakie działania ochronne wykonano i z jakim skutkiem, oraz co proponujesz. Dla 3220 ochrona to przede wszystkim ochrona bierna: niedopuszczanie do regulacji, przegradzania i poboru żwiru. Czynnie – usuwanie gatunków obcych (niecierpek gruczołowaty przed kwitnieniem, rdestowce i nawłoć z częściami podziemnymi). Brak działań – „Brak działań ochronnych”.',
          },
        ]
      if (f.name === 'notes')
        return [
          {
            kind: 'number',
            name: 'shareFV',
            group: 'Udział powierzchni siedliska w stanie FV / U1 / U2 (stanowisko)',
            label: 'Udział powierzchni siedliska w stanie FV',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Karta z przewodnika przy ocenie ogólnej podaje udział powierzchni siedliska o różnym stanie zachowania na stanowisku (Siwa Woda: FV 100%, U1 0%, U2 0%). Trzy liczby powinny dać razem 100%.',
          },
          {
            kind: 'number',
            name: 'shareU1',
            group: 'Udział powierzchni siedliska w stanie FV / U1 / U2 (stanowisko)',
            label: 'Udział powierzchni siedliska w stanie U1',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Procent powierzchni siedliska na stanowisku w stanie niezadowalającym (U1).',
          },
          {
            kind: 'number',
            name: 'shareU2',
            group: 'Udział powierzchni siedliska w stanie FV / U1 / U2 (stanowisko)',
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

  speciesCatalog: SPECIES_3220.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer3220(s) })),
  speciesInfo: (name) => {
    const e = findSpecies3220(name)
    if (!e) return undefined
    if (e.alsoExpansive) return `${GROUP_LABELS_3220.typical}; przy masowym występowaniu – ekspansywny`
    if (e.invasive) return `${GROUP_LABELS_3220.alienWoody}; obcy inwazyjny`
    return GROUP_LABELS_3220[e.group]
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator3220 = (id: string): IndicatorDef => {
  const i = methodology3220.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 3220`)
  return i
}
