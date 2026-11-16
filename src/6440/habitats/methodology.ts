// Metodyka 6440 (łąki selernicowe Cnidion dubii) jako dane.
// Źródło: Załuski T. 2012, „6440 Łąki selernicowe (Cnidion dubii)” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych.
// Przewodnik metodyczny, cz. III, GIOŚ, s. 64–78 (tab. 1 i 2, lista wskaźników kardynalnych, karta „Brańszczyk 2”),
// z praktyką oceny ze sprawozdań z monitoringu 2009–2011 (badania 2009–2011, 75 stanowisk) i 2015–2018 (badania 2016,
// 71 stanowisk). Siedlisko niepriorytetowe, tylko region kontynentalny. Transekt 200×10 m albo inny o powierzchni
// 2000 m², trzy zdjęcia fitosocjologiczne 5×5 m: na początku, w środku i na końcu transektu.
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology, SpeciesRow } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_6440,
  KIND_LABELS_6440,
  SPECIES_6440,
  defaultLayer6440,
  expansiveKind6440,
  findSpecies6440,
  isAlien6440,
  isCharacteristic6440,
  isDistinguishing6440,
  isExpansive6440,
  isWeakAlien6440,
  isWoody6440,
  speciesKey6440,
} from './species'

// ---------- progi liczbowe (tab. 2) ----------

/** Procent powierzchni transektu zajęty przez siedlisko: powyżej 40% FV; 20–40% U1 (obie granice); poniżej 20% U2. */
export const gradeShare6440 = (p: number): Grade => (p > 40 ? 'FV' : p >= 20 ? 'U1' : 'U2')

/**
 * Gatunki charakterystyczne: dwa lub więcej – FV („zwykle jeden z nich rośnie licznie (>25%)” – tak jak karta przykładowa,
 * formularz tego nie wymaga); jeden gatunek rosnący licznie (≥25%) – U1 („stan pośredni”); jeden rosnący nielicznie (<25%)
 * albo brak – U2. Jeden gatunek bez pokrycia – brak podpowiedzi.
 */
export function gradeCharacteristic6440(count: number, maxCover?: number): Grade | null {
  if (count >= 2) return 'FV'
  if (count <= 0) return 'U2'
  if (maxCover === undefined) return null
  return maxCover >= 25 ? 'U1' : 'U2'
}

/** Cenne składniki flory: kilka (3+) gatunków albo 1–2 rosnące licznie (łącznie >25%) – FV; 1–2 o mniejszym udziale – U1; brak – U2. */
export function gradeValuable6440(count: number, total?: number): Grade | null {
  if (count >= 3) return 'FV'
  if (count <= 0) return 'U2'
  if (total === undefined) return null
  return total > 25 ? 'FV' : 'U1'
}

/** Obce gatunki inwazyjne (łączne pokrycie transektu, %): brak – FV; udział nieznaczny (do 5%) – U1; wyraźny (>5%) – U2. */
export function gradeAliens6440(cover: number, present = cover > 0): Grade {
  if (!present && cover <= 0) return 'FV'
  return cover <= 5 ? 'U1' : 'U2'
}

/** Gatunki ekspansywne roślin zielnych (łączne pokrycie, %): <10% FV; 10–30% U1 (obie granice); >30% U2. */
export const gradeExpansive6440 = (cover: number): Grade => (cover < 10 ? 'FV' : cover <= 30 ? 'U1' : 'U2')

/**
 * Ekspansja krzewów i podrostu drzew (łączne pokrycie, %): brak albo pojedyncze wystąpienia w runi (do 0,5%) – FV;
 * do 1% albo krzewy tworzą już warstwę b – U1 („stan pośredni”); wyraźny udział (>1%) – U2.
 */
export function gradeShrubs6440(cover: number, layerB = false): Grade {
  if (cover > 1) return 'U2'
  if (layerB && cover > 0) return 'U1'
  return cover <= 0.5 ? 'FV' : 'U1'
}

/** Zachowanie płatów lokalnie typowych (% powierzchni łąki selernicowej w transekcie): >40% FV; 10–40% U1; <10% U2. */
export const gradeTypical6440 = (p: number): Grade => (p > 40 ? 'FV' : p >= 10 ? 'U1' : 'U2')

/** Wojłok (średnia grubość, cm): <0,5 cm FV; 0,5–2 cm U1 (obie granice); >2 cm U2. */
export const gradeLitter6440 = (cm: number): Grade => (cm < 0.5 ? 'FV' : cm <= 2 ? 'U1' : 'U2')

const pct = (v: number) => `${plNum(v)}%`
const round1 = (n: number) => Math.round(n * 10) / 10
const named = (v: unknown): SpeciesRow[] => speciesRows(v).filter((r) => r.name?.trim())
const rowNames = (v: unknown) => named(v).map((r) => r.name.trim())
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey6440(n), n])).values()]

/** Suma pokrycia wierszy listy spełniających warunek; 'present' – są wiersze, ale bez pokrycia; undefined – brak wierszy. */
function sumCover(list: unknown, pred: (name: string) => boolean = () => true): number | 'present' | undefined {
  const rows = named(list).filter((r) => pred(r.name.trim()))
  if (!rows.length) return undefined
  const covers = rows.map((r) => num(r.cover)).filter((c): c is number => c !== undefined)
  return covers.length ? round1(covers.reduce((a, b) => a + b, 0)) : 'present'
}

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'minor', label: 'Niewielki spadek powierzchni siedliska (inne kombinacje)', grade: 'U1' },
  { value: 'decrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi danymi z badań lub literatury', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const SPATIAL: GradedOption[] = [
  { value: 'none', label: 'Brak fragmentacji lub fragmentacja nieznaczna, wynikająca głównie z naturalnego ukształtowania dna doliny', grade: 'FV' },
  { value: 'medium', label: 'Średni stopień fragmentacji; niekiedy fragmentacja wyraźna, ale wynikająca głównie z ukształtowania dna doliny', grade: 'U1' },
  { value: 'strong', label: 'Silna fragmentacja, wynikająca głównie z uwarunkowań antropogenicznych lub zaawansowanej sukcesji wtórnej', grade: 'U2' },
]
const LAYER: { value: string; label: string }[] = [
  { value: '', label: '—' },
  { value: 'c', label: 'Tylko w runi (warstwa c – siewki, odrosty)' },
  { value: 'b', label: 'Tworzą warstwę krzewów (warstwa b)' },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

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
const percentInput = (label: string, help: string): FieldDef => ({ kind: 'number', name: 'share', label, unit: '%', min: 0, max: 100, help })

const describeList = (i: InputValues) => {
  if (note(i)) return note(i)
  const list = describeSpecies(named(i.species))
  const t = num(i.total)
  if (list) return t !== undefined ? `${list} – łącznie ${pct(t)}` : list
  if (t !== undefined) return `Łącznie ${pct(t)}`
  return i.none === 'yes' ? 'Brak' : ''
}

const noneConflict = (i: InputValues) => i.none === 'yes' && (named(i.species).length > 0 || (num(i.total) ?? 0) > 0)
const NONE_CONFLICT = 'Zaznaczono „Nie stwierdzono”, a lista albo pokrycie nie są puste.'

// ---------- gatunki charakterystyczne ----------

const characteristicRows = (i: InputValues) => named(i.species).filter((r) => isCharacteristic6440(r.name.trim()))
const characteristicNames = (i: InputValues) => distinct(characteristicRows(i).map((r) => r.name.trim()))
function characteristicCount(i: InputValues): number | undefined {
  const c = num(i.count)
  if (c !== undefined) return c
  return named(i.species).length ? characteristicNames(i).length : undefined
}
function characteristicMax(i: InputValues): number | undefined {
  const covers = characteristicRows(i)
    .map((r) => num(r.cover))
    .filter((c): c is number => c !== undefined)
  return covers.length ? Math.max(...covers) : undefined
}

// ---------- gatunki dominujące ----------

/** Gatunki innych siedlisk wśród dominantów: ekspansywne szuwarowe, ziołoroślowe, zrębowe i ruderalne, obce, drzewa i krzewy. */
const isForeignDominant = (n: string) => {
  const s = findSpecies6440(n)
  if (!s) return false
  if (s.group === 'alien' || s.group === 'woody') return true
  return s.group === 'expansive' && s.kind !== 'meadow'
}
const isDiagnostic = (n: string) => isCharacteristic6440(n) || isDistinguishing6440(n)

// ---------- gatunki ekspansywne ----------

const countsAsExpansive = (n: string) => !isCharacteristic6440(n) && !isDistinguishing6440(n) && !isAlien6440(n) && !isWoody6440(n)

// ---------- wskaźniki ----------

const SURFACE = 'w % powierzchni transektu (przewodnik: „w dziesiątkach procentów”; dla „<5%” z dawnych kart wpisz 1, dla pojedynczych osobników 0,5)'

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description: 'Powierzchnia płatów łąk selernicowych na stanowisku i jej zmiany w porównaniu z wcześniejszymi danymi z badań lub literatury.',
    help: `Co wybrać: czy powierzchnia łąk selernicowych na stanowisku jest stabilna (albo rośnie), czy maleje. Samą powierzchnię wpisz obok – trafi do „wartości”, gdy nie ma opisu.

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; inne kombinacje – U1; wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi danymi z badań lub literatury – U2. Przy pierwszym badaniu bez danych do porównania – „Brak danych” (XX) albo ocena ekspercka.

Praktyka: w 2009–2011 FV na 41, U1 na 27, U2 na 6 stanowiskach; w 2016 już FV 31, U1 17, U2 23 – głównie przez zaniechanie koszenia i zamianę łąk w grunty orne (9 stanowisk zanikło i wypadło z monitoringu). Sprawozdanie 2016–2018: „pomiar powierzchni siedliska nie ma określonej metodyki” – postuluje, by była to powierzchnia płatów Cnidion dubii o granicach zaznaczonych przez eksperta na mapie. Karta z przewodnika: „Powierzchnia nie uległa zmianom” → FV.`,
    thresholds: { FV: 'Nie podlega zmianom lub zwiększa się', U1: 'Inne kombinacje', U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi danymi z badań lub literatury' },
    inputs: [
      selectInput('Zmiana powierzchni', AREA, 'Jak zmieniła się powierzchnia łąk selernicowych od poprzedniego badania (albo względem literatury).'),
      { kind: 'text', name: 'areaText', label: 'Powierzchnia (opcjonalnie)', placeholder: 'np. 5 ha', help: 'Powierzchnia płatów łąk selernicowych na stanowisku, np. „5 ha” – trafi do pola „wartość”, gdy nie ma opisu.' },
      noteInput('Opis (opcjonalnie)', 'np. Powierzchnia nie uległa zmianom.', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => note(i) || String(i.areaText ?? '').trim() || labelOf(AREA, i.choice),
  },
  {
    id: 'share',
    label: 'Procent powierzchni zajęty przez siedlisko na transekcie',
    parameter: 'structure',
    description:
      'Powierzchnia zajęta przez badane siedlisko przyrodnicze w stosunku do powierzchni transektu 2000 m² (w dziesiątkach procentów), o ile zachowany jest standardowy areał transektu.',
    help: `Co wpisać: jaki procent transektu (2000 m²) zajmują płaty łąki selernicowej – reszta to inne łąki (trzęślicowe, wyczyńcowe, świeże), turzycowiska, szuwary, ziołorośla.

Progi (tab. 2): powyżej 40% – FV; 20–40% – U1; poniżej 20% – U2. Granice 20% i 40% formularz liczy do U1.

Praktyka: w 2009–2011 od 5% (Sekundowo nad Bugiem) do 100% (Ścinawa Polder); mały udział szczególnie w Ostoi Nadbużańskiej, gdzie łąki selernicowe tworzą wąskie pasy na granicy wyniesień i obniżeń. Udział wynika zarówno z warunków naturalnych (mikrorzeźba dna doliny, wilgotność), jak i z użytkowania. Sprawozdanie 2016–2018 wiąże spadki z niskimi stanami wód i krótszymi zalewami. Nazwa „na transekcie” – za sprawozdaniem 2016–2018 (w tab. 2 jest „na stanowisku”, w opisie tab. 1 – transekt). Karta z przewodnika: 30% → U1.`,
    thresholds: { FV: 'Powyżej 40%', U1: '20–40%', U2: 'Poniżej 20%' },
    inputs: [
      percentInput('Udział siedliska na transekcie', 'Procent powierzchni transektu zajęty przez łąkę selernicową, w dziesiątkach procentów (np. 30).'),
      noteInput('Opis (opcjonalnie)', 'np. 30%', 'Krótki opis, który trafi do „wartości” w karcie zamiast samej liczby (np. gdy transekt ma niestandardową powierzchnię).'),
    ],
    suggest: (i) => {
      const v = num(i.share)
      return v === undefined ? null : gradeShare6440(v)
    },
    warn: (i) => {
      const v = num(i.share)
      return v !== undefined && v > 100 ? 'Udział nie może przekraczać 100%.' : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const v = num(i.share)
      return v === undefined ? '' : pct(v)
    },
  },
  {
    id: 'spatial',
    label: 'Struktura przestrzenna płatów siedliska',
    parameter: 'structure',
    description:
      'Stopień fragmentacji siedliska, czyli wielkość powierzchni i wzajemne położenie poszczególnych płatów, określany w sposób opisowy. Wskaźnik jest istotny, o ile fragmentacja jest antropogeniczna.',
    help: `Co wybrać: jak bardzo łąka selernicowa jest pocięta na osobne płaty i z czego to wynika. Łąki selernicowe często naturalnie tworzą wąskie pasy na skłonach między wyniesieniami a obniżeniami – taka fragmentacja nie obniża oceny.

Progi (tab. 2): brak fragmentacji lub fragmentacja nieznaczna, wynikająca głównie z naturalnego ukształtowania dna doliny – FV; średni stopień fragmentacji, niekiedy wyraźna, ale wynikająca głównie z ukształtowania dna doliny – U1; silna fragmentacja, wynikająca głównie z uwarunkowań antropogenicznych lub zaawansowanej sukcesji wtórnej – U2.

Praktyka: w 2009–2011 FV 42, U1 21, U2 12 stanowisk (m.in. Pietrzyków, Brańszczyk 1, Lulkowo, Wilków, Sekundowo); w 2016 FV 36, U1 20, U2 15. Sprawozdanie 2016–2018 wiąże część zmian z poziomem wody i długością zalewów (rok 2011 rekordowo mokry, potem lata suche). Karta z przewodnika: „Stopień fragmentacji mały” → FV.`,
    thresholds: thresholdsOf(SPATIAL),
    inputs: [
      selectInput('Stopień fragmentacji', SPATIAL, 'Fragmentacja płatów łąki selernicowej na transekcie i jej przyczyna.'),
      noteInput('Opis (opcjonalnie)', 'np. Stopień fragmentacji mały.', 'Opis wielkości i położenia płatów – trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(SPATIAL)),
    describe: (i) => note(i) || labelOf(SPATIAL, i.choice),
  },
  {
    id: 'characteristic',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków charakterystycznych i wyróżniających (w tym regionalnie) dla zespołu Violo-Cnidietum dubii oraz związku Cnidion dubii, z przybliżonym procentem pokrycia transektu. Charakterystyczne: selernica żyłkowana, czosnek kątowaty, konitrut błotny, sit czarny, tarczyca oszczepowata, fiołek drobny, fiołek wyniosły, czarcikęsik Kluka, fiołek nibypsi. Wyróżniające: fiołek mokradłowy, turzyca wczesna, wiechlina wąskolistna, groszek błotny, gęsiówka Gerarda.',
    help: `Co wpisać: gatunki charakterystyczne i wyróżniające stwierdzone na transekcie, z pokryciem ${SURFACE}. Liczbę gatunków charakterystycznych możesz też wpisać wprost.

Progi (tab. 2): dwa lub więcej gatunków charakterystycznych, zwykle jeden z nich rośnie licznie (>25%) – FV; stan pośredni – U1; jeden gatunek charakterystyczny, rosnący nielicznie (<25%) – U2.

Jak liczy formularz: ocena wybrana w polu ma pierwszeństwo; bez niej liczba wpisana wprost; bez niej gatunki charakterystyczne z listy (synonimy raz). 2 i więcej – FV (bez wymogu gatunku >25%, bo „zwykle” – tak oceniła karta przykładowa: 4 gatunki po 5% i mniej → FV); jeden rosnący licznie (25% i więcej) – U1; jeden nieliczny albo brak – U2. Gatunki wyróżniające formularz pokazuje, ale ich nie liczy – tab. 2 mówi o charakterystycznych.

Rozjazdy: sprawozdanie 2016–2018 wskazuje lukę (kilka gatunków, żaden liczny – FV czy U1?) i proponuje: FV – 2 lub więcej gatunków charakterystycznych lub wyróżniających, w tym jeden dominujący; U1 – jeden lub więcej niedominujących i inne sporadycznie; U2 – brak albo tylko sporadycznie. Gdy oceniasz wg tej propozycji, wybierz ocenę w polu i uzasadnij. W 2016 r. FV spadło z 49 do 29 stanowisk – częściowo dlatego, że w 2009–2011 „wpisywano jako charakterystyczne rośliny, które nie znalazły się ostatecznie na liście”. Najczęściej notowane: selernica (Odra, Warta, Wisła, Bug, Pisa), czosnek kątowaty (dominuje nad Nidą), sit czarny (masowo nad Bugiem); fiołka wyniosłego w monitoringu nie znaleziono. Badania jesienne (sierpień–wrzesień) utrudniają odnalezienie wiechliny wąskolistnej i turzycy wczesnej.

Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Dwa lub więcej gatunków charakterystycznych, zwykle jeden z nich rośnie licznie (>25%)',
      U1: 'Stan pośredni',
      U2: 'Jeden gatunek charakterystyczny, rosnący nielicznie (<25%)',
    },
    inputs: [
      speciesInput('Gatunki charakterystyczne i wyróżniające', `Gatunki charakterystyczne i wyróżniające stwierdzone na transekcie z pokryciem ${SURFACE}, np. Cnidium dubium 5, Allium angulosum 1.`),
      { kind: 'number', name: 'count', label: 'Liczba gatunków charakterystycznych (opcjonalnie)', min: 0, help: 'Łączna liczba gatunków charakterystycznych (bez wyróżniających) na transekcie, wpisana wprost – ma pierwszeństwo przed liczeniem z listy.' },
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed liczbą gatunków (np. gdy oceniasz wg propozycji ze sprawozdania 2016–2018 albo gatunki rosną tylko pojedynczo). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Gatunki charakterystyczne: selernica żyłkowana Cnidium dubium (5%), …', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const c = characteristicCount(i)
      return c === undefined ? null : gradeCharacteristic6440(c, characteristicMax(i))
    },
    explain: (i) => {
      if (chosenGrade(i)) return null
      const c = characteristicCount(i)
      if (c === undefined) return null
      const names = characteristicNames(i)
      const dist = distinct(rowNames(i.species).filter(isDistinguishing6440))
      const max = characteristicMax(i)
      const parts = [num(i.count) !== undefined ? `Gatunków charakterystycznych: ${plNum(c)}` : `Gatunki charakterystyczne z katalogu: ${names.length}${names.length ? ` (${names.join(', ')})` : ''}`]
      if (dist.length) parts.push(`wyróżniające (nie liczą się do progu): ${dist.join(', ')}`)
      if (c >= 2 && (max === undefined || max <= 25)) parts.push('żaden nie rośnie licznie (>25%) – tab. 2 pisze „zwykle”, więc to nadal FV; sprawozdanie 2016–2018 wymagałoby dominanta')
      if (c === 1 && max === undefined) parts.push('jeden gatunek bez pokrycia – wpisz pokrycie (≥25% → U1, mniej → U2)')
      return `${parts.join('; ')}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      const other = names.filter((n) => findSpecies6440(n) && !isCharacteristic6440(n) && !isDistinguishing6440(n))
      if (other.length) parts.push(`Nie są gatunkami charakterystycznymi ani wyróżniającymi: ${other.join(', ')}.`)
      const g = chosenGrade(i)
      const c = characteristicCount(i)
      const auto = c === undefined ? null : gradeCharacteristic6440(c, characteristicMax(i))
      if (g && auto && g !== auto) parts.push(`Wybrano ${g}, a z liczby gatunków wychodzi ${auto} – uzasadnij w opisie.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(named(i.species))
      const c = num(i.count)
      return list || (c !== undefined ? `${plNum(c)} gat.` : '')
    },
  },
  {
    id: 'dominant',
    label: 'Gatunki dominujące',
    parameter: 'structure',
    description:
      'Lista gatunków dominujących w siedlisku, dla każdego gatunku przybliżony procent pokrycia w transekcie. Uwzględnia się gatunki charakterystyczne dla różnego typu łąk, ziołoroślowe, szuwarowe, ruderalne i zrębowe; ocenia się udział gatunków charakterystycznych i wyróżniających wśród dominantów.',
    help: `Co wpisać: gatunki dominujące na transekcie z pokryciem ${SURFACE}.

Progi (tab. 2): wśród dominantów zwykle jeden z gatunków charakterystycznych lub wyróżniających, współdominują różne gatunki łąkowe – FV; stan pośredni – U1; wśród dominantów brak gatunków charakterystycznych lub wyróżniających, obok gatunków łąkowych współdominują gatunki innych siedlisk – U2.

Jak liczy formularz: ocena wybrana w polu ma pierwszeństwo. Jest wśród dominantów gatunek charakterystyczny albo wyróżniający – FV; nie ma, ale są gatunki innych siedlisk (ekspansywne szuwarowe, ziołoroślowe, zrębowe i ruderalne, obce, krzewy) – U2; nie ma, a dominują same gatunki łąkowe (w tym trawy łąkowe: wyczyniec, kostrzewa czerwona, śmiałek) – U1.

Praktyka: najczęściej U1 (2009–2011: FV 25, U1 44, U2 6; 2016: FV 19, U1 33, U2 19) – „wzrost dominacji traw uważanych za rodzime gatunki ekspansywne”. Sprawozdanie 2016–2018 zauważa, że wg tab. 2 do FV wystarcza jeden gatunek wyróżniający wśród dominantów, i proponuje: FV – charakterystyczne lub wyróżniające oraz gatunki łąk wilgotnych; U1 – dominują gatunki łąk wilgotnych bez charakterystycznych; U2 – dominują gatunki szuwarowe, porębowe, ruderalne. Karta z przewodnika: przytulia północna, wyczyniec, babka lancetowata, chaber… i selernica 5% → FV.`,
    thresholds: {
      FV: 'Wśród dominantów zwykle jeden z gatunków charakterystycznych lub wyróżniających, współdominują różne gatunki łąkowe',
      U1: 'Stan pośredni',
      U2: 'Wśród dominantów brak gatunków charakterystycznych lub wyróżniających, obok gatunków łąkowych współdominują gatunki innych siedlisk',
    },
    inputs: [
      speciesInput('Gatunki dominujące', `Dominanty z pokryciem ${SURFACE}, np. Galium boreale 15, Alopecurus pratensis 15, Cnidium dubium 5.`),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed podpowiedzią (np. gdy gatunek charakterystyczny jest wśród dominantów tylko symbolicznie). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Przytulia północna Galium boreale (15%), …', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const names = rowNames(i.species)
      if (!names.length) return null
      if (names.some(isDiagnostic)) return 'FV'
      return names.some(isForeignDominant) ? 'U2' : 'U1'
    },
    explain: (i) => {
      if (chosenGrade(i)) return null
      const names = distinct(rowNames(i.species))
      if (!names.length) return null
      const diag = names.filter(isDiagnostic)
      if (diag.length) return `Wśród dominantów gatunki charakterystyczne lub wyróżniające: ${diag.join(', ')}.`
      const foreign = names.filter(isForeignDominant)
      if (foreign.length) return `Brak charakterystycznych i wyróżniających; gatunki innych siedlisk: ${foreign.join(', ')}.`
      return 'Brak charakterystycznych i wyróżniających; dominują gatunki łąkowe.'
    },
    warn: (i) => {
      const g = chosenGrade(i)
      if (!g) return null
      const names = rowNames(i.species)
      if (!names.length) return null
      const auto = names.some(isDiagnostic) ? 'FV' : names.some(isForeignDominant) ? 'U2' : 'U1'
      return g !== auto ? `Wybrano ${g}, a z listy dominantów wychodzi ${auto} – uzasadnij w opisie.` : null
    },
    describe: (i) => note(i) || describeSpecies(named(i.species)),
  },
  {
    id: 'valuable',
    label: 'Cenne składniki flory',
    parameter: 'structure',
    description:
      'Lista gatunków chronionych, rzadkich i zagrożonych (z list krajowych i regionalnych), dla każdego gatunku przybliżony procent pokrycia w stosunku do powierzchni transektu.',
    help: `Co wpisać: gatunki chronione (ochrona ścisła i częściowa wg aktualnego rozporządzenia) oraz rzadkie i zagrożone – z czerwonych list krajowych i regionalnych – z pokryciem ${SURFACE}. Łąki selernicowe niemal zawsze je mają: selernica, czosnek kątowaty, sit czarny, tarczyca oszczepowata, fiołek drobny i wyniosły, turzyca wczesna, groszek błotny są na czerwonej liście (Zarzycki, Szeląg 2006), a konitrut błotny, czarcikęsik Kluka i fiołek mokradłowy są chronione.

Progi (tab. 2): kilka gatunków, albo jeden lub dwa gatunki rosnące licznie (łącznie >25%) – FV; jeden lub dwa gatunki, ich udział ilościowy jest mniejszy – U1; brak – U2.

Jak liczy formularz: liczy każdy wpisany gatunek (synonimy raz) – co jest cenne, decydujesz Ty. 3 i więcej – FV; 1–2 o łącznym pokryciu ponad 25% – FV, mniejszym – U1; „nie stwierdzono” – U2.

Praktyka: najlepiej oceniany wskaźnik (2009–2011: 67 FV, 8 U1); w 2016 FV już tylko 42 – sprawozdanie przypisuje to subiektywności i zmianie rozporządzenia o ochronie gatunkowej roślin z 2014 r. (mniej gatunków chronionych). Zapisz w opisie, wg jakiej listy oceniasz. Karta z przewodnika: 9 gatunków → FV.`,
    thresholds: {
      FV: 'Kilka gatunków, albo jeden lub dwa gatunki rosnące licznie (łącznie >25%)',
      U1: 'Jeden lub dwa gatunki, ich udział ilościowy jest mniejszy',
      U2: 'Brak',
    },
    inputs: [
      speciesInput('Cenne składniki flory', `Gatunki chronione, rzadkie i zagrożone z pokryciem ${SURFACE}, np. Cnidium dubium 5, Gratiola officinalis 1.`),
      NONE_FIELD('Brak gatunków cennych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków chronionych, rzadkich ani zagrożonych – wtedy wskaźnik to U2.'),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed liczbą gatunków. Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Selernica żyłkowana Cnidium dubium (5%), …', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const names = distinct(rowNames(i.species))
      if (!names.length) return i.none === 'yes' ? 'U2' : null
      const t = sumCover(i.species)
      return gradeValuable6440(names.length, typeof t === 'number' ? t : undefined)
    },
    explain: (i) => {
      if (chosenGrade(i)) return null
      const names = distinct(rowNames(i.species))
      if (!names.length) return null
      const t = sumCover(i.species)
      const cover = typeof t === 'number' ? `; łączne pokrycie ${pct(t)}` : names.length < 3 ? '; brak pokrycia – wpisz je (łącznie >25% → FV)' : ''
      return `Gatunków cennych: ${names.length}${cover}.`
    },
    warn: (i) => {
      const parts: string[] = []
      if (noneConflict(i)) parts.push(NONE_CONFLICT)
      const bad = distinct(rowNames(i.species)).filter((n) => isAlien6440(n) || isExpansive6440(n))
      if (bad.length) parts.push(`To gatunki obce albo ekspansywne, nie cenne: ${bad.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków obcych geograficznie, dla każdego gatunku przybliżony procent pokrycia w transekcie. Są to zarówno byliny ruderalne i ziołoroślowe (np. szczaw omszony, nawłoć późna), jak i segetalne terofity (np. chwastnica jednostronna).',
    help: `Co wpisać: gatunki obce z pokryciem ${SURFACE}. Łączne pokrycie możesz wpisać wprost. Najczęstsze: szczaw omszony (doliny Bugu i Wisły, ok. 30% stanowisk w 2016 r.), nawłoć późna (najgroźniejsza), uczep amerykański, przymiotno kanadyjskie i białe, klon jesionolistny, czeremcha amerykańska.

Progi (tab. 2): brak – FV; udział nieznaczny – U1; udział wyraźny (>5%) – U2. Formularz: obecne do 5% łącznie – U1, ponad 5% – U2.

Jak liczy: łączne pokrycie wpisane wprost, a bez niego suma z listy; „nie stwierdzono” → FV. Gatunek na liście bez pokrycia – brak podpowiedzi (pojedyncze osobniki wpisz jako 0,5). Archeofity z tab. 10 sprawozdania 2016–2018 (włośnice, rdestówka powojowata, groszek bulwiasty, chwastnica) sprawozdanie uznaje za „niestanowiące zagrożenia dla siedliska” – formularz je liczy (chwastnica jest przykładem w tab. 1), ale ostrzega.

Rozjazdy: sprawozdanie 2016–2018 uważa wskaźnik za „zdecydowanie zbyt czuły” (jeden osobnik obniża ocenę wskaźnika kardynalnego) i proponuje: pojedyncze osobniki albo brak – FV, 1–5% – U1, ponad 5% – U2. Formularz idzie za tab. 2; przy ocenie wg propozycji wybierz ocenę ręcznie w stanie ochrony i opisz. Praktyka: 2009–2011 FV 43, U1 31, U2 1 (Zabełcze nad Wisłą); 2016 FV 51, U1 19, U2 1. Karta z przewodnika: szczaw omszony <5%, uczep amerykański <5% → U1.

Wskaźnik kardynalny.`,
    thresholds: { FV: 'Brak', U1: 'Udział nieznaczny', U2: 'Udział wyraźny (>5%)' },
    inputs: [
      speciesInput('Obce gatunki inwazyjne', `Gatunki obce z pokryciem ${SURFACE}, np. Rumex confertus 1, Bidens frondosa 1.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków obcych w % transektu – ma pierwszeństwo przed sumą z listy. Dla pojedynczych osobników wpisz 0,5.'),
      NONE_FIELD('Brak gatunków obcych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków obcych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Szczaw omszony Rumex confertus (<5%), …', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const present = rowNames(i.species).length > 0
      const t = num(i.total)
      if (t !== undefined) return gradeAliens6440(t, present || t > 0)
      if (!present) return i.none === 'yes' ? 'FV' : null
      const c = sumCover(i.species)
      return typeof c === 'number' ? gradeAliens6440(c, true) : null
    },
    explain: (i) => {
      const t = num(i.total)
      const names = distinct(rowNames(i.species))
      if (t !== undefined) return `Łączne pokrycie gatunków obcych: ${pct(t)}.`
      if (!names.length) return null
      const c = sumCover(i.species)
      return c === 'present' ? 'Gatunki obce bez pokrycia – wpisz pokrycie (pojedyncze osobniki: 0,5) albo łączne pokrycie.' : `Gatunków obcych: ${names.length}; łączne pokrycie ${pct(c as number)}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (noneConflict(i)) parts.push(NONE_CONFLICT)
      const native = names.filter((n) => findSpecies6440(n) && !isAlien6440(n))
      if (native.length) parts.push(`To nie gatunki obce: ${native.join(', ')}${native.some(isExpansive6440) ? ' (rodzime ekspansywne wpisz w swoim wskaźniku)' : ''}.`)
      const weak = names.filter(isWeakAlien6440)
      if (weak.length) parts.push(`${weak.join(', ')} – archeofity; sprawozdanie 2016–2018 uznaje je za niezagrażające siedlisku. Usuń je, jeśli nie chcesz ich liczyć.`)
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
      'Lista gatunków wykazujących ekspansję, dla każdego gatunku przybliżony procent pokrycia w transekcie. Na ogół szuwarowe (mozga trzcinowata, turzyca dwustronna, turzyca zaostrzona), ziołoroślowe (krwawnik wierzbolistny, przetacznik długolistny, tojeść pospolita), zrębowe (trzcinnik piaskowy) i ruderalne (ostrożeń polny, perz właściwy); także niektóre trawy łąkowe (wyczyniec łąkowy, kostrzewa czerwona, śmiałek darniowy).',
    help: `Co wpisać: rodzime gatunki ekspansywne z pokryciem ${SURFACE}. Gatunki obce formularz pomija (mają swój wskaźnik), podobnie charakterystyczne i wyróżniające.

Progi (tab. 2): brak albo pojedyncze gatunki ekspansywne, ich łączny udział <10%, wśród nich głównie gatunki łąkowe – FV; stan pośredni – U1; co najmniej kilka gatunków ekspansywnych, ich łączny udział >30%, wśród nich głównie gatunki szuwarowe, ziołoroślowe, zrębowe lub ruderalne – U2.

Jak liczy formularz: ocena wybrana w polu ma pierwszeństwo; bez niej łączne pokrycie wpisane wprost albo suma z listy: <10% – FV, 10–30% – U1, >30% – U2. Gdy suma przekracza 30%, ale co najmniej połowę daje trawa łąkowa (wyczyniec, kostrzewa czerwona, śmiałek), warunek „głównie szuwarowe, ziołoroślowe…” nie jest spełniony – formularz daje U1 i to pisze.

Rozjazdy: w 2016 r. U2 aż na 35 z 71 stanowisk – sprawozdanie 2016–2018 tłumaczy to zaliczaniem do ekspansywnych traw łąkowych (wyczyniec, mozga) i proponuje liczyć tylko gatunki szuwarowe i ruderalne, z progami <10% FV, 10–30% U1, >30% U2. Jeśli oceniasz wg tej propozycji, wybierz ocenę w polu i opisz. Karta z przewodnika: wyczyniec 15%, krwawnik wierzbolistny, przetacznik długolistny, szczaw omszony i wiązówka błotna po <5% → U1.

Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Brak albo pojedyncze gatunki ekspansywne, ich łączny udział <10%; wśród nich głównie gatunki łąkowe',
      U1: 'Stan pośredni',
      U2: 'Co najmniej kilka gatunków ekspansywnych, ich łączny udział >30%; wśród nich głównie gatunki szuwarowe, ziołoroślowe, zrębowe lub ruderalne',
    },
    inputs: [
      speciesInput('Gatunki ekspansywne', `Rodzime gatunki ekspansywne z pokryciem ${SURFACE}, np. Alopecurus pratensis 15, Achillea salicifolia 1.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków ekspansywnych w % transektu – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak gatunków ekspansywnych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma rodzimych gatunków ekspansywnych – wtedy wskaźnik to FV.'),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed sumą pokrycia (np. gdy oceniasz wg propozycji ze sprawozdania 2016–2018, bez traw łąkowych). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Wyczyniec łąkowy Alopecurus pratensis (15%), …', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const t = num(i.total)
      if (t !== undefined) return gradeExpansive6440(t)
      if (!rowNames(i.species).length) return i.none === 'yes' ? 'FV' : null
      const c = sumCover(i.species, countsAsExpansive)
      if (c === undefined) return 'FV' // same obce, charakterystyczne albo krzewy
      if (c === 'present') return null
      const grade = gradeExpansive6440(c)
      if (grade !== 'U2') return grade
      const meadow = sumCover(i.species, (n) => countsAsExpansive(n) && expansiveKind6440(n) === 'meadow')
      return typeof meadow === 'number' && meadow * 2 >= c ? 'U1' : 'U2'
    },
    explain: (i) => {
      if (chosenGrade(i)) return null
      const t = num(i.total)
      if (t !== undefined) return `Łączne pokrycie gatunków ekspansywnych: ${pct(t)}.`
      const names = distinct(rowNames(i.species))
      if (!names.length) return null
      const skipped = names.filter((n) => !countsAsExpansive(n))
      const c = sumCover(i.species, countsAsExpansive)
      const meadow = sumCover(i.species, (n) => countsAsExpansive(n) && expansiveKind6440(n) === 'meadow')
      const kinds = distinct(rowNames(i.species).filter(countsAsExpansive))
        .map((n) => expansiveKind6440(n))
        .filter((k): k is NonNullable<typeof k> => Boolean(k))
      const kindText = kinds.length ? ` (${[...new Set(kinds)].map((k) => KIND_LABELS_6440[k]).join(', ')})` : ''
      return [
        skipped.length ? `Pominięte (obce, charakterystyczne, wyróżniające albo krzewy – mają swoje wskaźniki): ${skipped.join(', ')}` : '',
        typeof c === 'number' ? `łączne pokrycie gatunków ekspansywnych${kindText}: ${pct(c)}` : c === 'present' ? 'gatunki bez pokrycia – wpisz pokrycie albo wybierz ocenę' : 'gatunków ekspansywnych: brak',
        typeof c === 'number' && c > 30 && typeof meadow === 'number' && meadow * 2 >= c ? `ponad połowę (${pct(meadow)}) dają trawy łąkowe, a U2 wymaga „głównie szuwarowych, ziołoroślowych, zrębowych lub ruderalnych” – U1` : '',
      ]
        .filter(Boolean)
        .join('; ')
        .concat('.')
    },
    warn: (i) => {
      const parts: string[] = []
      if (noneConflict(i)) parts.push(NONE_CONFLICT)
      const typical = distinct(rowNames(i.species).filter(isDiagnostic))
      if (typical.length) parts.push(`Gatunki charakterystyczne i wyróżniające nie są ekspansywnymi: ${typical.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'shrubs',
    label: 'Ekspansja krzewów i podrostu drzew',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków drzew i krzewów, z uwzględnieniem warstwy zbiorowiska oraz przybliżonego procentu pokrycia w transekcie. Na ocenę składa się liczba gatunków, ich pokrycie i dynamizm; istotne, czy gatunki są tylko w warstwie zielnej c, czy tworzą już warstwę krzewów b.',
    help: `Co wpisać: drzewa i krzewy na transekcie (także siewki i odrosty w runi) z pokryciem ${SURFACE}, łączne pokrycie (z rzutu koron – korony się nakładają) i to, czy rosną tylko w runi, czy tworzą już warstwę krzewów. Najczęściej: wierzby (szara, krucha, biała), szakłak, tarnina, olsza czarna, jesion, dąb, głóg, róże.

Progi (tab. 2): brak albo pojedyncze wystąpienia w runi – FV; stan pośredni – U1; wyraźny udział w runi lub w warstwie krzewów (>1%) – U2.

Jak liczy formularz: łączne pokrycie wpisane wprost, a bez niego suma z listy; „nie stwierdzono” → FV. Do 0,5% w runi (pojedyncze wystąpienia) – FV; do 1% albo krzewy w warstwie b – U1; ponad 1% – U2. Sprawozdanie 2016–2018: nie uwzględnia się powierzchni nigdy nie koszonych (rowy, miedze).

Praktyka: zwykle juwenilne osobniki w runi; 2009–2011 FV 43, U1 18, U2 4 (Grądy 2, Potrzymiech 3 i 4, Stany); 2016 FV 54, U1 12, U2 5 – ekspansja krzewów świadczy o całkowitym zaprzestaniu koszenia. Karta z przewodnika: „Warstwa c: szakłak, tarnina, wierzba szara (po <5%)” → U1 (karta nie podaje sumy; przykład ma łącznie 1%).

Wskaźnik kardynalny.`,
    thresholds: { FV: 'Brak albo pojedyncze wystąpienia w runi', U1: 'Stan pośredni', U2: 'Wyraźny udział w runi lub w warstwie krzewów (>1%)' },
    inputs: [
      speciesInput('Drzewa i krzewy', `Gatunki drzew i krzewów z pokryciem ${SURFACE}, np. Salix cinerea 0,5, Prunus spinosa 0,5.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie drzew i krzewów w % transektu (rzut pionowy) – ma pierwszeństwo przed sumą z listy.'),
      { kind: 'select', name: 'layer', label: 'Gdzie rosną', options: LAYER, help: 'Czy drzewa i krzewy są tylko w runi (warstwa c: siewki, odrosty po koszeniu), czy tworzą już warstwę krzewów (b). Warstwa b przy pokryciu do 1% daje U1 zamiast FV.' },
      NONE_FIELD('Brak drzew i krzewów', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma drzew ani krzewów – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Warstwa c: szakłak pospolity Rhamnus cathartica (<5%), …', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const present = rowNames(i.species).length > 0
      const t = num(i.total)
      const layerB = i.layer === 'b'
      if (t !== undefined) return gradeShrubs6440(t, layerB)
      if (!present) return i.none === 'yes' ? 'FV' : null
      const c = sumCover(i.species)
      return typeof c === 'number' ? gradeShrubs6440(c, layerB) : null
    },
    explain: (i) => {
      const t = num(i.total)
      const where = i.layer === 'b' ? '; tworzą warstwę krzewów' : i.layer === 'c' ? '; tylko w runi' : ''
      if (t !== undefined) return `Łączne pokrycie drzew i krzewów: ${pct(t)}${where}.`
      const names = distinct(rowNames(i.species))
      if (!names.length) return null
      const c = sumCover(i.species)
      return c === 'present' ? 'Drzewa i krzewy bez pokrycia – wpisz pokrycie (pojedyncze: 0,5) albo łączne pokrycie.' : `Suma pokryć z listy: ${pct(c as number)}${where}.`
    },
    warn: (i) => {
      const parts: string[] = []
      if (noneConflict(i)) parts.push(NONE_CONFLICT)
      const herbs = distinct(rowNames(i.species)).filter((n) => findSpecies6440(n) && !isWoody6440(n))
      if (herbs.length) parts.push(`To nie drzewa ani krzewy: ${herbs.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'typical',
    label: 'Zachowanie płatów lokalnie typowych',
    parameter: 'structure',
    description:
      'Powierzchnia zajęta przez płaty łąki selernicowej najbardziej typowe i niezdegenerowane w stosunku do łącznej powierzchni łąki selernicowej w transekcie (w dziesiątkach procentów).',
    help: `Co wpisać: jaki procent łąki selernicowej w transekcie (nie całego transektu) to płaty typowo wykształcone – z wyraźnym udziałem gatunków charakterystycznych, bogate gatunkowo, bez gatunków obcych i inwazyjnych, niezarastające krzewami – w stosunku do postaci przejściowych, nietypowych, zdegenerowanych i z gatunkami ekspansywnymi.

Progi (tab. 2): duży udział płatów lokalnie typowych i dobrze zachowanych (>40%) – FV; średni (10–40%) – U1; mały (<10%) – U2. Granice 10% i 40% formularz liczy do U1.

Uwaga: wskaźnik złożony, opiera się na innych wskaźnikach i – jak pisze przewodnik – może być interpretowany subiektywnie; wymaga znajomości regionalnego zróżnicowania łąk selernicowych. Praktyka: 2009–2011 FV 21, U1 32, U2 19; 2016 FV 16, U1 28, U2 27 (zaniechanie koszenia, zamiana na grunty orne). Karta z przewodnika: 50% → FV.`,
    thresholds: {
      FV: 'Duży udział płatów lokalnie typowych i dobrze zachowanych (>40%)',
      U1: 'Średni udział płatów lokalnie typowych i dobrze zachowanych (10–40%)',
      U2: 'Mały udział płatów lokalnie typowych i dobrze zachowanych (<10%)',
    },
    inputs: [
      percentInput('Udział płatów typowych', 'Procent łącznej powierzchni łąki selernicowej w transekcie zajęty przez płaty typowe i niezdegenerowane, w dziesiątkach procentów (np. 50).'),
      noteInput('Opis (opcjonalnie)', 'np. 50%', 'Krótki opis, który trafi do „wartości” w karcie zamiast samej liczby.'),
    ],
    suggest: (i) => {
      const v = num(i.share)
      return v === undefined ? null : gradeTypical6440(v)
    },
    warn: (i) => {
      const v = num(i.share)
      return v !== undefined && v > 100 ? 'Udział nie może przekraczać 100%.' : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const v = num(i.share)
      return v === undefined ? '' : pct(v)
    },
  },
  {
    id: 'litter',
    label: 'Wojłok (martwa materia organiczna)',
    parameter: 'structure',
    description:
      'Minimalna, maksymalna i średnia grubość martwej materii organicznej (wojłoku) w centymetrach. Pomiar po nacięciu darni nożem, linijką lub taśmą; optymalnie 20 pomiarów w różnych miejscach darni, głównie w miejscach zdjęć fitosocjologicznych.',
    help: `Jak mierzyć: w ok. 20 miejscach (głównie przy zdjęciach fitosocjologicznych) natnij darń nożem i zmierz grubość nierozłożonej materii organicznej. Wpisz minimum, maksimum i średnią.

Progi (tab. 2, średnia): brak lub warstwa znikoma (<0,5 cm) – FV; warstwa średniej miąższości (0,5–2 cm) – U1; warstwa znacznej miąższości (>2 cm) – U2. Granice 0,5 i 2 cm formularz liczy do U1.

Pułapki: nie myl wojłoku z sianem pozostawionym po pokosie – sprawozdanie 2016–2018 przypisuje wzrost ocen U1 i U2 (FV z 61 do 38 stanowisk) badaniom po pokosie i wcześniejszemu koszeniu (od 15 czerwca w PROW 2014–2020). Po powodziach wojłok dochodzi miejscami do 10 cm. Karta z przewodnika: 0–2 cm, średnio 0,2 cm → FV.`,
    thresholds: { FV: 'Brak lub warstwa znikoma (średnio <0,5 cm)', U1: 'Warstwa średniej miąższości (średnio 0,5–2 cm)', U2: 'Warstwa znacznej miąższości (średnio >2 cm)' },
    inputs: [
      { kind: 'number', name: 'min', label: 'Minimum', unit: 'cm', min: 0, group: 'Grubość wojłoku', groupCols: 3, help: 'Najmniejsza zmierzona grubość wojłoku, w cm.' },
      { kind: 'number', name: 'max', label: 'Maksimum', unit: 'cm', min: 0, group: 'Grubość wojłoku', help: 'Największa zmierzona grubość wojłoku, w cm.' },
      { kind: 'number', name: 'mean', label: 'Średnia', unit: 'cm', min: 0, group: 'Grubość wojłoku', help: 'Średnia ze wszystkich pomiarów (optymalnie 20), w cm. Od niej zależy podpowiedź oceny.' },
      noteInput('Opis (opcjonalnie)', 'np. 0–2 cm, śr. 0,2 cm', 'Krótki opis, który trafi do „wartości” w karcie zamiast zakresu wygenerowanego z liczb.'),
    ],
    suggest: (i) => {
      const v = num(i.mean)
      return v === undefined ? null : gradeLitter6440(v)
    },
    warn: (i) => {
      const [a, b, c] = [num(i.min), num(i.max), num(i.mean)]
      if (c === undefined) return null
      if ((a !== undefined && c < a) || (b !== undefined && c > b)) return 'Średnia leży poza zakresem minimum–maksimum.'
      return null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const [a, b, c] = [num(i.min), num(i.max), num(i.mean)]
      const range = a !== undefined && b !== undefined ? `${plNum(a)}–${plNum(b)} cm` : ''
      const avg = c === undefined ? '' : `średnio ${plNum(c)} cm`
      return [range, avg].filter(Boolean).join('; ')
    },
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu (zdjęcia fitosocjologicznego nr ${where === 'początku' ? 1 : where === 'środka' ? 2 : 3}), z odbiornika GPS (WGS84). Punkt środkowy nie musi leżeć centralnie.

Dlaczego: transekt powtarza się co pięć lat w tym samym miejscu – przy łamanym albo łukowatym transekcie bez współrzędnych nie da się go odtworzyć.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Brańszczyk 2',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Brańszczyk 2”, „Walga 2”, „Wólka Zamkowa”, „Opoka Duża 1”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego stanowiska. Stanowiskiem jest zwykle wyodrębniający się przestrzennie kompleks łąk z płatami 6440 albo odrębna topograficznie część dużego kompleksu łąkowego.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. referencyjne',
    help: `Typ stanowiska w sieci monitoringu, np. „referencyjne” – dobrze wykształcone siedlisko, punkt odniesienia dla innych. Jeśli nie wiesz, zostaw puste.

Dlaczego: przy ocenie regionu stanowiska referencyjne (w 2016 r. m.in. Walga 2, Wólka Zamkowa, Brzuza 1) pokazują, jak wygląda 6440 w dobrym stanie.`,
  },
  {
    kind: 'text',
    name: 'areaName',
    label: 'Nazwa obszaru',
    placeholder: 'np. Ostoja Nadbużańska',
    help: 'Obszar Natura 2000 albo dolina rzeki, w której leży stanowisko, np. „Ostoja Nadbużańska”, „Ostoja Nidziańska”, „Rogalińska Dolina Warty”. W 2009–2011 r. stanowiska leżały w 17 obszarach Natura 2000.',
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Violo-Cnidietum dubii',
    help: 'Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Łąki selernicowe: klasa Molinio-Arrhenatheretea, rząd Molinietalia, związek Cnidion dubii, zespół Violo-Cnidietum dubii (łąka fiołkowo-selernicowa; u Brzega i Wojterskiej – Violo persicifoliae-Cnidietum dubii, u Ratyńskiej i in. – Violo stagninae-Molinietum caeruleae). Dyskusyjne zespoły z dominacją situ czarnego albo turzycy wczesnej: Juncetum atrati, Gratiolo-Caricetum praecocis. Postaci przejściowe opisz wprost (karta przykładowa: „postać przejściowa nawiązująca do Galietum borealis”).',
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Położenie w dolinie, rzeźba dna, gleby, warunki wilgotnościowe, użytkowanie, sąsiednie zbiorowiska.',
    help: `Krótka charakterystyka stanowiska i transektu (przewodnik):
• położenie: taras zalewowy, starorzecza, deniwelacje dna doliny; wąskie pasy na skłonach między wyniesieniami a obniżeniami czy płaty wielkopowierzchniowe;
• gleby (mady, gleby murszowe, kreda jeziorna) i warunki wilgotnościowe (zalewy, podtopienia, podsiąkanie);
• użytkowanie: koszenie (ile razy, kiedy), wypas, nieużytkowanie, nawożenie, programy rolnośrodowiskowe;
• sąsiednie zbiorowiska: łąki trzęślicowe 6410 (Molinion, Galietum borealis), łąki świeże, turzycowiska (Caricetum gracilis), szuwary (Phalaridetum), ziołorośla (Scutellario-Veronicetum longifoliae).`,
  },
  {
    kind: 'text',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    required: true,
    placeholder: 'np. 5',
    help: 'Łączna powierzchnia płatów łąk selernicowych na stanowisku, w hektarach albo opisem (karta z przewodnika: 5 ha). Sprawozdanie 2016–2018 postuluje, by była to powierzchnia płatów Cnidion dubii o granicach zaznaczonych przez eksperta na mapie.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „Ostoja Nadbużańska PLH140011”.',
    help: `Obszary Natura 2000, parki krajobrazowe, rezerwaty i inne formy ochrony obejmujące stanowisko (karta z przewodnika: „Ostoja Nadbużańska PLH140011”).

Dlaczego: na łąkach w obszarach Natura 2000 działają pakiety rolnośrodowiskowe – od nich zależy termin i sposób koszenia, a więc perspektywy siedliska.`,
  }),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. właściciele prywatni',
    help: `Kto zarządza terenem: właściciele prywatni (w 2016 r. 61 z 71 stanowisk), RDOŚ (obszar Natura 2000), park krajobrazowy, gmina, Wody Polskie (międzywala).

Dlaczego: łąki selernicowe utrzymuje tylko ekstensywne koszenie przez gospodarzy – kontakt z właścicielem decyduje o perspektywach.`,
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
    placeholder: 'np. 100x20 m = 2000 m²',
    hint: 'Standard 200×10 m; częściej krótszy i szerszy, ale zawsze 2000 m².',
    help: `Przewodnik: transekt 10 × 200 m. Płaty łąk selernicowych rzadko mają 200 m długości, dlatego bardzo często wyznacza się transekty o tej samej powierzchni 2000 m², ale krótsze i szersze; prostokąt może być w połowie załamany albo cały transekt łukowaty. Karta z przewodnika: 100×20 m = 2000 m².

Dlaczego: „Procent powierzchni zajęty przez siedlisko” i wszystkie pokrycia odnoszą się do 2000 m² – przy innej powierzchni wyniki nie są porównywalne.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 89',
    help: 'Wysokość nad poziomem morza – liczba albo zakres (karta z przewodnika: 89 m). Siedlisko występuje tylko na niżu, w dolinach dużych rzek (Odra, Warta, Wisła, Bug, Narew, Nida, Pisa) i ujściowych odcinkach dopływów.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 14.08.2010',
    required: true,
    hint: 'Koniec czerwca – sierpień; dopuszczalnie wrzesień. Przed pierwszym pokosem albo na odrośniętej runi.',
    help: `Dzień badań terenowych. Przewodnik: koniec czerwca, lipiec, sierpień lub nawet wrzesień, gdy większość roślin jest dobrze rozwinięta; najlepiej przed pierwszymi sianokosami albo po nich, ale z odpowiednio odrośniętą warstwą zielną. Na terenach popowodziowych termin ustala się indywidualnie. Obserwacje powtarza się co pięć lat.

Praktyka: w 2009–2011 i 2016 głównie od początku sierpnia do końca września (nieliczne w lipcu i październiku) – aspekt letni, gdy po pokosie kwitną selernica, czosnek kątowaty, konitrut i tarczyca. Jesienią trudno znaleźć wiechlinę wąskolistną i turzycę wczesną, a wojłok po pokosie bywa zawyżony. Karta z przewodnika: 14.08.2010; jej uwagi zalecają czerwiec–sierpień.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const [, mm, dd] = v.split('-').map(Number)
      const md = mm * 100 + dd
      if (md < 615 || md > 1015) return 'Termin poza okresem z przewodnika i praktyki monitoringu (połowa czerwca – połowa października). Opisz powód w uwagach.'
      if (md < 620 || md > 831)
        return 'Termin dopuszczalny (przewodnik: „nawet we wrześniu”), ale poza optymalnym (koniec czerwca – sierpień). Zapisz w uwagach, czy łąka była po pokosie i czy wiosenne gatunki dało się odnaleźć.'
      return null
    },
  },
  pickField(methodology7120.siteFields, 'observer', {
    help: `Imię i nazwisko eksperta, który wykonał obserwację i odpowiada za dane (w karcie z przewodnika: „Eksperci lokalni”).

Dlaczego: kilka wskaźników (cenne składniki flory, płaty lokalnie typowe, wojłok) sprawozdanie 2016–2018 uznaje za subiektywne – trzeba wiedzieć, kogo zapytać o uzasadnienie.`,
  }),
  {
    kind: 'text',
    name: 'additionalExperts',
    label: 'Dodatkowi eksperci',
    placeholder: 'np. —',
    help: 'Osoby, które brały udział w badaniu poza wykonawcą (karta z przewodnika wymienia dwóch ekspertów lokalnych). Brak – zostaw puste albo wpisz „—”.',
  },
]

// ---------- zdjęcia fitosocjologiczne ----------

const r7120 = methodology7120.releves.fields
const LAYERS = 'Zwarcie i wysokość warstw B, C, D'
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, group: LAYERS, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia (WGS84). Trzy zdjęcia: na początku, w środku i na końcu transektu.' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach (karta z przewodnika: 89 m).' }),
  pickField(r7120, 'area', {
    defaultValue: 25,
    help: 'Powierzchnia zdjęcia w m² – w karcie z przewodnika 5×5 m = 25 m². W wąskich pasach łąki wpisz faktyczną powierzchnię.',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach – na dnach dolin zwykle 0–5° (karta z przewodnika: 0 i 5°).' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, NW). Dla powierzchni płaskiej wpisz „brak” albo „–”.' }),
  layerField('coverB', 'Warstwa B – krzewy: procent powierzchni zdjęcia pod krzewami (wierzby, tarnina, szakłak). Na koszonej łące zwykle 0%.', { groupCols: 3 }),
  layerField('coverC', 'Warstwa C – zielna: procent powierzchni zdjęcia pokryty przez ruń (karta z przewodnika: 100%).'),
  layerField('coverD', 'Warstwa D – mszysta: procent powierzchni zdjęcia pokryty przez mszaki (karta z przewodnika: 0–2%).'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów, w metrach.'),
  layerField('heightC', 'Warstwa C – typowa wysokość runi, w centymetrach (karta z przewodnika: 30–60 cm; zależy od terminu pokosu).'),
  layerField('heightD', 'Warstwa D – wysokość mszaków, w centymetrach (karta z przewodnika: 5 cm).'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Violo-Cnidietum dubii',
    help: 'Jednostka fitosocjologiczna zdjęcia – zespół albo związek, np. Violo-Cnidietum dubii, Cnidion dubii; postaci przejściowe opisz wprost (karta z przewodnika: „Violo-Cnidietum dubii, postać przejściowa, nawiązująca silnie w kierunku Galietum borealis”).',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w poletku z ilościowością w siedmiostopniowej skali Braun-Blanqueta (r, +, 1–5): warstwa B – krzewy, C – rośliny zielne, D – mszaki. Warstwa podpowiada się sama po wyborze gatunku.',
  }),
  {
    kind: 'textarea',
    name: 'remarks',
    label: 'Uwagi do zdjęcia',
    rows: 2,
    placeholder: 'np. Zdjęcie po pokosie, ruń odrośnięta',
    help: 'Odstępstwa i problemy: zdjęcie po pokosie, mniejsza powierzchnia, gatunki wiosenne nieodnalezione, taksony nieoznaczone do gatunku.',
  },
]

export const methodology6440: Methodology = {
  code: '6440',
  name: 'Łąki selernicowe (Cnidion dubii)',
  source:
    'Załuski T. 2012, 6440 Łąki selernicowe (Cnidion dubii), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. III, GIOŚ, s. 64–78 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2009–2011 i 2015–2018.',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj 3 zdjęcia fitosocjologiczne 5×5 m – na początku, w środku i na końcu transektu (punkt środkowy nie musi leżeć centralnie). Metoda Braun-Blanqueta z siedmiostopniową skalą ilościowości; warstwy B (krzewy), C (zielna) i D (mszaki).',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Realne możliwości zachowania właściwego stanu siedliska oraz poprawy stanu niewłaściwego, z informacją o potencjalnych zabiegach ochronnych, w tym specjalnych działaniach w zakresie ochrony czynnej.',
    help: `Weź pod uwagę: czy łąka jest koszona ekstensywnie, ale systematycznie (najlepiej raz w roku, dość późno); zaniechanie koszenia i sukcesję (ziołorośla, krzewy, las – najczęstsza przyczyna pogorszenia w 2016 r., 47 stanowisk); intensyfikację (nawożenie, częste koszenie, wypas, podsiewanie traw, przeoranie); zamianę łąk na grunty orne; osuszanie i brak okresowych zalewów (sprawozdanie 2016–2018: siedlisko szczególnie wrażliwe na przesuszanie); gatunki inwazyjne. Po stronie plusów: programy rolnośrodowiskowe (pakiety 4 i 5 PROW), naturalny reżim zalewów.

Przewodnik (pkt 5): zachowanie 6440 wymaga ekstensywnego, ale systematycznego użytkowania; przy zaniechaniu – koszenie w ramach ochrony czynnej; nie nawozić, nie osuszać, nie przeorywać; szczególnie narażone są małe, izolowane, śródpolne stanowiska.

Praktyka: 2009–2011 FV 29, U1 40, U2 6; 2016 FV 16, U1 38, U2 17. Karta z przewodnika (Brańszczyk 2) → FV.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre, nie przewiduje się wyraźnego oddziaływania czynników zagrażających, przetrwanie w dłuższej perspektywie czasowej prawdopodobne',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A01', name: 'Uprawa' },
    { code: 'A02', name: 'Zmiana sposobu uprawy' },
    { code: 'A02.01', name: 'Intensyfikacja rolnictwa' },
    { code: 'A02.03', name: 'Usuwanie łąk pod grunty orne' },
    { code: 'A03', name: 'Koszenie / ścinanie trawy' },
    { code: 'A03.01', name: 'Intensywne koszenie lub intensyfikacja' },
    { code: 'A03.02', name: 'Nieintensywne koszenie' },
    { code: 'A03.03', name: 'Zaniechanie / brak koszenia' },
    { code: 'A04', name: 'Wypas' },
    { code: 'A04.01', name: 'Wypas intensywny' },
    { code: 'A04.02', name: 'Wypas nieintensywny' },
    { code: 'A04.03', name: 'Zarzucenie pasterstwa, brak wypasu' },
    { code: 'A07', name: 'Stosowanie biocydów, hormonów i chemikaliów' },
    { code: 'A08', name: 'Nawożenie / nawozy sztuczne' },
    { code: 'A11', name: 'Inne rodzaje praktyk rolniczych, nie wymienione powyżej' },
    { code: 'B01', name: 'Zalesianie terenów otwartych' },
    { code: 'B01.01', name: 'Zalesianie terenów otwartych (drzewa rodzime)' },
    { code: 'C01.01', name: 'Wydobywanie piasku i żwiru' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D01.02', name: 'Drogi, autostrady' },
    { code: 'E03.04', name: 'Inne odpady' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J01.01', name: 'Wypalanie' },
    { code: 'J02.01', name: 'Zasypywanie terenu, melioracje i osuszanie – ogólnie' },
    { code: 'J02.04', name: 'Zalewanie – modyfikacje' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód – ogólnie' },
    { code: 'J02.06', name: 'Pobór wód powierzchniowych' },
    { code: 'J02.12', name: 'Tamy, wały, sztuczne plaże – ogólnie' },
    { code: 'K01.02', name: 'Zamulenie' },
    { code: 'K01.03', name: 'Wyschnięcie' },
    { code: 'K01.04', name: 'Zatopienie' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.02', name: 'Nagromadzenie materii organicznej' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'K04', name: 'Międzygatunkowe interakcje wśród roślin' },
    { code: 'K04.01', name: 'Konkurencja' },
    { code: 'K04.05', name: 'Szkody wyrządzane przez roślinożerców (w tym przez zwierzynę łowną)' },
    { code: 'L08', name: 'Powódź (procesy naturalne)' },
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
            hint: 'Np. cenne gatunki zwierząt, sąsiednie siedliska 6410, 6510.',
            help: 'Wartości przyrodnicze stanowiska poza samą łąką selernicową: sąsiednie siedliska (6410 łąki trzęślicowe, 6510 łąki świeże, 3150 i 3270 przy starorzeczach i brzegach, 91E0 i 91F0 łęgi), rzadkie gatunki roślin i zwierząt (ptaki łąk zalewowych, ryby, motyle). Karta z przewodnika: „W dolinie Bugu cenne gatunki zwierząt, szczególnie ryb i ptaków. Na dużym areale siedlisko 6410”. Brak informacji – „Nie stwierdzono”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            label: 'Wykonywane działania ochronne',
            help: 'Jakie działania ochronne wykonano i z jakim skutkiem: koszenie w ramach ochrony czynnej, pakiety rolnośrodowiskowe (4 i 5 PROW), zakaz nawożenia, odkrzaczanie. Sprawozdanie 2016–2018: działań z planów zadań ochronnych nie stwierdzono – łąki utrzymują gospodarze. Brak – „Brak”.',
          },
          {
            kind: 'textarea',
            name: 'proposals',
            label: 'Propozycje wprowadzenia działań ochronnych',
            rows: 3,
            hint: 'Np. wznowienie koszenia raz w roku; zakaz nawożenia i osuszania.',
            help: 'Jakie działania proponujesz, konkretnie: ekstensywne koszenie raz w roku (przy zaniechaniu – w ramach ochrony czynnej), późniejszy termin pokosu, zakaz nawożenia, podsiewania, przeorywania i osuszania, zachowanie okresowych zalewów, odkrzaczanie, zwalczanie nawłoci. Brak – „Brak”.',
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
            help: 'Czy stanowisko powinno zostać w sieci monitoringu (pole „Raportu rocznego” w karcie z przewodnika). Uzasadnienie wpisz niżej.',
          },
          {
            kind: 'textarea',
            name: 'justification',
            label: 'Uzasadnienie',
            rows: 3,
            help: 'Dlaczego monitoring jest (albo nie jest) potrzebny: dobrze zachowane łąki o znacznym areale (karta z przewodnika), zagrożenia; albo wniosek o usunięcie stanowiska (w 2016 r. 9 stanowisk zanikło po zaniechaniu koszenia albo zaoraniu).',
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
            help: 'Karta z przewodnika podaje przy ocenie ogólnej udział procentowy powierzchni siedliska o różnym stanie zachowania na całym stanowisku, w stosunku do całkowitej powierzchni siedliska (Brańszczyk 2: FV 100%, U1 –, U2 –). Trzy liczby powinny dać razem 100%.',
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
            help: `${f.help ?? ''}\n\nDla 6440 zapisz tu także rok i typ monitoringu, czy łąka była przed, czy po pokosie, niestandardowy kształt transektu i – przy ocenach odbiegających od tab. 2 – wg jakiej propozycji oceniano (sprawozdanie 2016–2018).`.trim(),
          },
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_6440.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer6440(s) })),
  speciesInfo: (name) => {
    const s = findSpecies6440(name)
    if (!s) return undefined
    const valuable = s.valuable ? '; gatunek cenny' : ''
    if (s.group === 'characteristic') return `${GROUP_LABELS_6440.characteristic} (tab. 1${s.regional ? ', wg Brzega i Wojterskiej 2001' : ''}${valuable})`
    if (s.group === 'distinguishing') return `${GROUP_LABELS_6440.distinguishing} (tab. 1${valuable})`
    if (s.group === 'expansive') return `${GROUP_LABELS_6440.expansive} (${KIND_LABELS_6440[s.kind ?? 'meadow']})`
    if (s.group === 'alien') return s.weak ? 'gatunek obcy – archeofit, bez tendencji do inwazji' : GROUP_LABELS_6440.alien
    if (s.group === 'woody') return GROUP_LABELS_6440.woody
    return `${GROUP_LABELS_6440.companion}${valuable}`
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator6440 = (id: string): IndicatorDef => {
  const i = methodology6440.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 6440`)
  return i
}
