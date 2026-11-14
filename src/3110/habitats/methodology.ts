// Metodyka 3110 (jeziora lobeliowe) jako dane. Źródło: Wilk-Woźniak E., Kraska M., Piotrowicz R., Klimaszyk P. 2012,
// „3110 Jeziora lobeliowe” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ,
// s. 114–129 (tab. 1 i 2), z modyfikacją GIOŚ z 30.09.2015 (reguła oceny ogólnej) i praktyką oceny ze sprawozdań
// z monitoringu 2009–2011 (waloryzacja powierzchni), 2015–2018 i 2020–2021.
// Siedlisko wodne: transekt 30×30 m w litoralu, pomiary fizyczno-chemiczne i plankton z najgłębszej, centralnej części
// jeziora (pelagial, warstwa 0,5–1 m). Zdjęcia fitosocjologiczne nieobowiązkowe – przykład z przewodnika ich nie ma.
// Z modułu leśnego brane są tylko klocki generyczne (choiceIndicator, selecty z oceną) – nic leśnego.
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { num } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { choiceIndicator, labelOf, pickField, plNum, type GradedOption } from '../../forest'
import { CHARACTERISTIC_3110, DEGENERATION_3110, GROUP_LABELS_3110, SPECIES_3110, defaultLayer3110, findSpecies3110 } from './species'

// ---------- progi liczbowe (tab. 2) ----------

/** Odczyn: 5,5–7,5 FV; 4,5–<5,5 albo >7,5–8,5 U1; <4,5 albo >8,5 U2. */
export const gradePH3110 = (ph: number): Grade => (ph >= 5.5 && ph <= 7.5 ? 'FV' : ph >= 4.5 && ph <= 8.5 ? 'U1' : 'U2')
/** Konduktywność: <100 µS/cm FV, 100–250 U1, >250 U2. */
export const gradeConductivity3110 = (c: number): Grade => (c < 100 ? 'FV' : c <= 250 ? 'U1' : 'U2')
/** Przezroczystość (krążek Secchiego): >3,5 m FV, 1,5–3,5 U1, <1,5 U2. */
export const gradeSecchi3110 = (m: number): Grade => (m > 3.5 ? 'FV' : m >= 1.5 ? 'U1' : 'U2')
/** Ubytek powierzchni (monitoring 2009–2011): <5% FV, 5–25% U1, >25% U2. */
export const gradeAreaLoss3110 = (pct: number): Grade => (pct < 5 ? 'FV' : pct <= 25 ? 'U1' : 'U2')

// ---------- podtypy (pole stanowiska, tylko do ostrzeżeń) ----------

const SUBTYPES: SelectOption[] = [
  { value: 'dys-oligo', label: 'Dystroficzne oligohumusowe' },
  { value: 'dys-poli', label: 'Dystroficzne polihumusowe' },
  { value: 'balanced', label: 'Zrównoważone' },
  { value: 'eutrophied', label: 'Zeutrofizowane' },
  { value: 'degraded', label: 'Zdegradowane' },
]
const isDystrophic = (ctx?: IndicatorContext) => String(ctx?.site?.subtype ?? '').startsWith('dys-')

// ---------- powierzchnia ----------

const AREA_CHANGE: SelectOption[] = [
  { value: 'stable', label: 'Powierzchnia nie uległa zmianom' },
  { value: 'increase', label: 'Powierzchnia zwiększyła się' },
  { value: 'decrease', label: 'Powierzchnia zmniejszyła się' },
  { value: 'unknown', label: 'Brak danych do porównania' },
]

export function gradeArea3110(change: unknown, lossPct: number | undefined): Grade | null {
  if (change === 'stable' || change === 'increase') return 'FV'
  if (change === 'unknown') return 'XX'
  if (change === 'decrease') return lossPct === undefined ? null : gradeAreaLoss3110(lossPct)
  return null
}

// ---------- spisy gatunków w transekcie ----------

export const ABUNDANCE: SelectOption[] = [
  { value: 'sporadic', label: 'sporadyczne' },
  { value: 'veryFew', label: 'bardzo nieliczne' },
  { value: 'numerous', label: 'liczne' },
  { value: 'mass', label: 'masowe' },
]
const isAbundant = (a: string) => a === 'numerous' || a === 'mass'

export interface SpeciesHit {
  name: string
  abundance: string
}

/** Kompletne wiersze spisu (gatunek + liczebność). */
export function speciesHits(value: unknown): SpeciesHit[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((r: Record<string, unknown>) => {
    const name = String(r?.species ?? '').trim()
    const abundance = String(r?.abundance ?? '')
    return name && ABUNDANCE.some((a) => a.value === abundance) ? [{ name, abundance }] : []
  })
}

/** „Lobelia dortmanna (liczne), Isoëtes lacustris (masowe)”. */
export const describeHits = (hits: SpeciesHit[]) => hits.map((h) => `${h.name} (${labelOf(ABUNDANCE, h.abundance)})`).join(', ')

const isCharacteristic = (name: string) => findSpecies3110(name)?.group === 'characteristic'
const isDegeneration = (name: string) => findSpecies3110(name)?.group === 'degeneration'

const speciesTable = (s: { name: string; label: string; help: string; placeholder: string }): FieldDef => ({
  kind: 'table',
  name: s.name,
  label: s.label,
  addLabel: 'Dodaj gatunek',
  rowLabel: 'Gatunek',
  help: s.help,
  columns: [
    { kind: 'text', name: 'species', label: 'Gatunek', placeholder: s.placeholder, required: true, help: 'Nazwa naukowa gatunku. Nazwy z katalogu karty (np. Lobelia dortmanna, Isoëtes lacustris, Nuphar lutea) są rozpoznawane w podpowiedziach.' },
    { kind: 'select', name: 'abundance', label: 'Liczebność', options: ABUNDANCE, required: true, help: 'Ocena ilościowa z metodyki: występowanie sporadyczne, bardzo nieliczne, liczne albo masowe.' },
  ],
})

// ---------- liczba zbiorowisk z listy ----------

/** „Isoeto-Lobelietum littorelletosum; zb. z Drepanocladus tenuinervis” -> lista nazw (przecinek, średnik, nowa linia). */
export const splitCommunities = (text: unknown): string[] =>
  String(text ?? '')
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)

function communitiesOf(i: InputValues, ctx?: IndicatorContext): { names: string[]; from?: 'list' | 'site' } {
  const fromList = splitCommunities(i.list)
  if (fromList.length) return { names: fromList, from: 'list' }
  const fromSite = splitCommunities(ctx?.site?.communities)
  return fromSite.length ? { names: fromSite, from: 'site' } : { names: [] }
}

// ---------- opcje selektów ----------

const COMBINATION: GradedOption[] = [
  {
    value: 'typical',
    label: 'Dominują płaty Lobelietum dortmannae, Isoetetum lacustris lub Myriophylletum alterniflori; gatunki charakterystyczne liczne lub masowe',
    grade: 'FV',
  },
  {
    value: 'poor',
    label: 'Roślinność Isoeto-Lobelietum nieliczna, Myriophyllum spicatum dominuje nad M. alterniflorum; gatunki charakterystyczne nieliczne, bardzo nieliczne lub sporadyczne',
    grade: 'U1',
  },
  {
    value: 'absent',
    label: 'Gatunki charakterystyczne nie występują (choć były notowane) albo pojedynczo, wśród roślinności jezior eutroficznych lub dystroficznych',
    grade: 'U2',
  },
]
const DEGENERATION: GradedOption[] = [
  { value: 'absent', label: 'Brak', grade: 'FV' },
  { value: 'single', label: 'Występują pojedynczo', grade: 'U1' },
  { value: 'increasing', label: 'Zwiększają swój udział w zbiorowiskach', grade: 'U2' },
]
const COLOUR: GradedOption[] = [
  { value: 'blue', label: 'Przezroczysta, sinoniebieska lub niebieska', grade: 'FV' },
  { value: 'greenish', label: 'Niebieska z odcieniem zielonym lub żółtozielonym', grade: 'U1' },
  { value: 'brown', label: 'Brunatna lub wyraźnie zielona', grade: 'U2' },
]
const PHYTO: GradedOption[] = [
  {
    value: 'mixotrophic',
    label: 'Wiele taksonów miksotroficznych (złotowiciowce, drobne zielenice, sinice chrookokalne bez Microcystis i Woronichinia), ewentualnie dominacja dinofitów lub kryptofitów, Gonyostomum semen',
    grade: 'FV',
  },
  { value: 'codominance', label: 'Współdominacja sinic i zielenic', grade: 'U1' },
  { value: 'bloom', label: 'Dominacja sinic nitkowatych lub Microcystis, Woronichinia; zakwity sinicowe', grade: 'U2' },
  { value: 'notStudied', label: 'Nie badano', grade: 'XX' },
]
const ZOO: GradedOption[] = [
  { value: 'filtrators', label: 'Częste Rotatoria i Cladocera przy małym zagęszczeniu, nieliczne Copepoda, przewaga dużych filtratorów (Daphnia)', grade: 'FV' },
  { value: 'small', label: 'Obecne wrotki i małe wioślarki (Bosmina, Chydorus)', grade: 'U1' },
  { value: 'rotifers', label: 'Dominacja wrotków, zwłaszcza Keratella cochlearis f. tecta', grade: 'U2' },
  { value: 'notStudied', label: 'Nie badano', grade: 'XX' },
]
const TO_BOTTOM: SelectOption[] = [
  { value: 'no', label: 'Nie' },
  { value: 'yes', label: 'Tak – krążek widoczny na dnie' },
]

const RANK: Record<Grade, number> = { FV: 0, U1: 1, U2: 2, XX: -1 }
/** Niższa (gorsza) z ocen fito- i zooplanktonu; „Nie badano” pomijane, oba niebadane → XX. */
export function gradePlankton3110(phyto: unknown, zoo: unknown): Grade | null {
  const p = PHYTO.find((o) => o.value === phyto)?.grade
  const z = ZOO.find((o) => o.value === zoo)?.grade
  if (!p || !z) return null
  const graded = [p, z].filter((g) => g !== 'XX')
  if (!graded.length) return 'XX'
  return graded.reduce((a, b) => (RANK[b] > RANK[a] ? b : a))
}

const PELAGIAL = `Gdzie: w centralnej, najgłębszej części jeziora (albo wydzielonej części jeziora), z niezarośniętego lustra wody – pelagialu, z warstwy powierzchniowej ok. 0,5–1 m. Nie w strefie litoralu.`

// ---------- wskaźnik liczbowy ----------

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
  warn?: (v: number | undefined, i: InputValues, ctx?: IndicatorContext) => string | null
  describe: (v: number, i: InputValues) => string
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
    warn: s.warn ? (i, ctx) => s.warn!(num(i.value), i, ctx) : undefined,
    describe: (i) => {
      const v = num(i.value)
      return v === undefined ? '' : s.describe(v, i)
    },
  }
}

// ---------- wskaźniki ----------

const combinationBase = choiceIndicator({
  id: 'combination',
  label: 'Charakterystyczna kombinacja zbiorowisk w obrębie transektu',
  cardinal: true,
  description:
    'Występowanie zbiorowisk roślinności w obrębie transektu: rozpoznane syntaksony i stan zachowania zbiorowisk izoetydów, obecność i liczebność gatunków wskaźnikowych jezior lobeliowych.',
  help: `Co wybrać: opis najbliższy temu, co widać na transekcie. Wymień rozpoznane syntaksony (bez wyszczególniania zbiorowisk turzycowych) i – opcjonalnie – gatunki charakterystyczne z oceną ilościową: sporadyczne, bardzo nieliczne, liczne, masowe.

Gatunki charakterystyczne jezior lobeliowych: lobelia jeziorna Lobelia dortmanna, poryblin jeziorny Isoëtes lacustris, poryblin kolczasty Isoëtes echinospora, brzeżyca jednokwiatowa Littorella uniflora, wywłócznik skrętoległy Myriophyllum alterniflorum, elisma wodna Luronium natans.

Transekt: ten sam co przy poprzednim badaniu (współrzędne GPS). Przy pierwszym badaniu wyznacz reprezentatywny transekt; jeśli się przesunął – zapisz nowe współrzędne i oceń, czy zbiorowisko się zmniejszyło, zwiększyło czy jest porównywalne. Gatunki bywają trudne do odnalezienia – gdy nie widać ich z łodzi na stanowisku, gdzie wcześniej były dobrze rozwinięte, rozważ metodę nurkową, zanim wpiszesz U2.

Maksymalną głębokość występowania roślinności (opcjonalnie) monitoring 2021 traktował jako dodatkowy wskaźnik kardynalny – metodyka nie podaje dla niej progów, więc formularz ją tylko zapisuje w opisie.

Wskaźnik kardynalny (biocenotyczny – opisuje kondycję zespołu roślinnego).`,
  options: COMBINATION,
  inputLabel: 'Stan zbiorowisk',
})

const degenerationBase = choiceIndicator({
  id: 'degeneration',
  label: 'Gatunki wskazujące na degenerację siedliska',
  cardinal: true,
  description:
    'Pojawianie się gatunków charakterystycznych dla wód zeutrofizowanych: grążel żółty, rogatek sztywny, wywłócznik kłosowy, żabiściek pływający, moczarka kanadyjska. Daje możliwość stwierdzenia postępującej degradacji siedliska.',
  help: `Co wybrać: czy na transekcie (tym samym, co przy poprzednim badaniu) rosną gatunki typowe dla wód zeutrofizowanych i jak licznie. Spis poniżej jest opcjonalny – trafia do opisu w karcie.

Gatunki wskazujące na degenerację z tab. 2: grążel żółty Nuphar lutea, rogatek sztywny Ceratophyllum demersum, wywłócznik kłosowy Myriophyllum spicatum, żabiściek pływający Hydrocharis morsus-ranae, moczarka kanadyjska Elodea canadensis. Sprawozdanie 2015–2018 proponuje dopisać „w tym obce gatunki inwazyjne” – moczarka to gatunek obcy, jej wpływ na jeziora miękkowodne nie jest rozpoznany i wymaga obserwacji.

Do 2011 r. wskaźnik nazywał się „Gatunki inwazyjne i/lub obce dla zbiorowisk makrofitów” – zakres waloryzacji ten sam, więc stare karty da się porównać.

Wskaźnik kardynalny.`,
  options: DEGENERATION,
  inputLabel: 'Gatunki wskazujące na degenerację',
})

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description: 'Zmiana powierzchni płatów siedliska (zbiorowisk roślinności lobeliowej) na stanowisku od poprzedniego badania.',
    help: `Co wybrać: czy powierzchnia płatów siedliska na stanowisku zmieniła się od poprzedniego badania (porównaj z poprzednią kartą, wielkością zbiorowisk na transekcie, mapami). Przy ubytku wpisz, o ile procent.

Tab. 2 przewodnika nie podaje progów dla powierzchni. Formularz bierze waloryzację z monitoringu 2009–2011: zmiana <5% – FV, 5–25% – U1, >25% – U2. Wzrost powierzchni roślinności lobeliowej to nie degradacja, więc „zwiększyła się” daje FV. Brak danych do porównania – XX.

Sprawozdanie 2015–2018 proponuje mierzyć to przez powierzchnię transektu: szerokość 30 m, długość do maksymalnego zasięgu głębokościowego roślin – spadek głębokości zasiedlenia zmniejsza transekt.

Dlaczego: jeziora lobeliowe są małe i płytkie, a izoetydy wycofują się szybko przy eutrofizacji i dystrofizacji – ubytek płatów to pierwszy widoczny objaw.`,
    thresholds: {
      FV: 'Powierzchnia bez zmian, zwiększyła się albo ubytek <5% (monitoring 2009–2011)',
      U1: 'Ubytek powierzchni 5–25%',
      U2: 'Ubytek powierzchni >25%',
    },
    inputs: [
      { kind: 'select', name: 'change', label: 'Zmiana powierzchni', options: AREA_CHANGE, required: true, help: 'Jak zmieniła się powierzchnia płatów siedliska od poprzedniego badania. „Brak danych do porównania” – pierwsze badanie stanowiska (podpowiedź XX).' },
      { kind: 'number', name: 'lossPct', label: 'Ubytek powierzchni', unit: '%', min: 0, max: 100, help: 'Tylko przy „zmniejszyła się”: o ile procent zmniejszyła się powierzchnia płatów. <5% FV, 5–25% U1, >25% U2.' },
    ],
    suggest: (i) => gradeArea3110(i.change, num(i.lossPct)),
    explain: (i) => (i.change === 'decrease' && num(i.lossPct) === undefined ? 'Podaj ubytek w %, żeby dostać podpowiedź oceny.' : null),
    describe: (i) => {
      const label = labelOf(AREA_CHANGE, i.change)
      const loss = num(i.lossPct)
      return i.change === 'decrease' && loss !== undefined ? `${label} o ${plNum(loss)}%` : label
    },
  },
  {
    ...combinationBase,
    inputs: [
      {
        kind: 'textarea',
        name: 'list',
        label: 'Syntaksony na transekcie',
        rows: 3,
        placeholder: 'np. Isoeto-Lobelietum littorelletosum; zb. z Drepanocladus tenuinervis',
        help: 'Zbiorowiska roślinne stwierdzone na transekcie, oddzielone przecinkiem, średnikiem albo nową linią. Puste – do karty trafiają nazwy z pola „Zbiorowiska roślinne” w zakładce Stanowisko.',
      },
      speciesTable({
        name: 'species',
        label: 'Gatunki charakterystyczne na transekcie (opcjonalnie)',
        placeholder: 'np. Lobelia dortmanna',
        help: 'Gatunki charakterystyczne dla jezior lobeliowych z oceną ilościową. Formularz porównuje spis z wybranym stanem zbiorowisk i ostrzega przy sprzecznościach. Spis trafia do opisu w karcie.',
      }),
      ...combinationBase.inputs,
      {
        kind: 'number',
        name: 'maxDepth',
        label: 'Maksymalna głębokość występowania roślinności (opcjonalnie)',
        unit: 'm',
        min: 0,
        help: 'Najgłębsze miejsce, gdzie rosną makrofity na transekcie. Monitoring 2021 oceniał ją jako dodatkowy wskaźnik kardynalny, ale metodyka nie podaje progów – formularz tylko dopisuje ją do opisu i porównuje z przezroczystością.',
      },
    ],
    explain: (i, ctx) => {
      const hits = speciesHits(i.species).filter((h) => isCharacteristic(h.name))
      const { names, from } = communitiesOf(i, ctx)
      const parts = [
        hits.length ? `Gatunki charakterystyczne: ${new Set(hits.map((h) => h.name)).size} z ${CHARACTERISTIC_3110.length}.` : '',
        from === 'site' ? `Syntaksony z pola „Zbiorowiska roślinne” (${names.length}).` : '',
      ].filter(Boolean)
      return parts.length ? parts.join(' ') : null
    },
    warn: (i) => {
      const hits = speciesHits(i.species)
      const charHits = hits.filter((h) => isCharacteristic(h.name))
      if (i.choice === 'absent' && charHits.some((h) => isAbundant(h.abundance)))
        return `W spisie są licznie gatunki charakterystyczne (${charHits.filter((h) => isAbundant(h.abundance)).map((h) => h.name).join(', ')}), a wybrano stan zły.`
      if (i.choice === 'typical' && hits.length && !charHits.some((h) => isAbundant(h.abundance)))
        return 'Wybrano stan właściwy, ale w spisie nie ma licznie ani masowo występujących gatunków charakterystycznych.'
      return null
    },
    describe: (i, ctx) => {
      const { names } = communitiesOf(i, ctx)
      const hits = speciesHits(i.species)
      const depth = num(i.maxDepth)
      return [
        names.join(', '),
        hits.length ? `gatunki charakterystyczne: ${describeHits(hits)}` : '',
        depth !== undefined ? `roślinność do głębokości ${plNum(depth)} m` : '',
      ]
        .filter(Boolean)
        .join('; ') || labelOf(COMBINATION, i.choice)
    },
  },
  {
    ...degenerationBase,
    inputs: [
      speciesTable({
        name: 'species',
        label: 'Gatunki wskazujące na degenerację na transekcie (opcjonalnie)',
        placeholder: 'np. Nuphar lutea',
        help: 'Gatunki wód zeutrofizowanych z oceną ilościową. Spis trafia do opisu w karcie, a formularz ostrzega, gdy jest sprzeczny z wyborem „Brak”.',
      }),
      ...degenerationBase.inputs,
    ],
    explain: (i) => {
      const unknown = speciesHits(i.species).filter((h) => !isDegeneration(h.name))
      return unknown.length
        ? `Spoza listy z tab. 2 (${DEGENERATION_3110.map((s) => s.latin).join(', ')}): ${unknown.map((h) => h.name).join(', ')} – oceń, czy to też wskaźnik eutrofizacji.`
        : null
    },
    warn: (i) => {
      const hits = speciesHits(i.species)
      if (i.choice === 'absent' && hits.length) return `W spisie są gatunki (${hits.map((h) => h.name).join(', ')}), a wybrano „Brak”.`
      if (hits.some((h) => findSpecies3110(h.name)?.latin === 'Elodea canadensis'))
        return 'Moczarka kanadyjska to gatunek obcy – dopisz oddziaływanie I01 (obce gatunki inwazyjne) i obserwuj jej udział.'
      return null
    },
    describe: (i) => {
      const hits = speciesHits(i.species)
      const label = labelOf(DEGENERATION, i.choice)
      return hits.length ? [label, describeHits(hits)].filter(Boolean).join(': ') : label
    },
  },
  {
    ...choiceIndicator({
      id: 'colour',
      label: 'Barwa wody',
      cardinal: true,
      description:
        'Jeden z parametrów jakości wody. Na barwę wpływają odpady organiczne, substancje humusowe, erozja gleb, ścieki i licznie rozwijający się fitoplankton – wszystkie prowadzą do pogorszenia stanu siedliska.',
      help: `Co wybrać: barwę wody w centralnej, najgłębszej części jeziora – przezroczysta sinoniebieska albo niebieska (FV), niebieska z odcieniem zielonym lub żółtozielonym (U1), brunatna lub wyraźnie zielona (U2). Opcjonalnie dopisz własny opis i barwę zmierzoną w mg Pt/dm³ (jak w karcie z przewodnika).

Tab. 2 nie podaje progów w mg Pt/dm³ – wynik liczbowy idzie tylko do opisu, ocenę daje wybór. Sprawozdania 2015–2021 przyznają, że poza skrajnymi przypadkami ocena barwy jest uznaniowa i orientacyjna.

Uwaga: jeziora lobeliowe dystroficzne polihumusowe mają wodę naturalnie jasno- lub ciemnobrunatną od substancji humusowych. Od jezior dystroficznych (3160) odróżnia je obecność roślinności lobeliowej.

${PELAGIAL}

Wskaźnik kardynalny.`,
      options: COLOUR,
      inputLabel: 'Barwa wody',
    }),
    inputs: [
      { kind: 'select', name: 'choice', label: 'Barwa wody', options: COLOUR.map(({ value, label }) => ({ value, label })), required: true, help: COLOUR.map((o) => `• ${o.label} – ${o.grade}`).join('\n') },
      { kind: 'text', name: 'note', label: 'Opis barwy (opcjonalnie)', placeholder: 'np. Woda przezroczysta o niebieskawej barwie', help: 'Własny opis barwy do karty. Puste – do karty trafia opis z wybranej kategorii.' },
      { kind: 'number', name: 'pt', label: 'Barwa (opcjonalnie)', unit: 'mg Pt/dm³', min: 0, help: 'Barwa oznaczona w skali platynowo-kobaltowej, w mg Pt/dm³, jeśli ją masz. Metodyka nie podaje dla niej progów – trafia tylko do opisu.' },
    ],
    warn: (i, ctx) =>
      i.choice === 'brown' && String(ctx?.site?.subtype ?? '') === 'dys-poli'
        ? 'Jezioro dystroficzne polihumusowe ma wodę naturalnie brunatną. Tab. 2 i tak daje U2 – jeśli to stan naturalny, oceń ekspercko i uzasadnij w uwagach.'
        : null,
    describe: (i) => {
      const text = String(i.note ?? '').trim() || labelOf(COLOUR, i.choice)
      const pt = num(i.pt)
      return [text, pt !== undefined ? `Barwa ${plNum(pt)} mg Pt/dm³` : ''].filter(Boolean).join('. ')
    },
  },
  measure({
    id: 'ph',
    label: 'Odczyn wody',
    description: 'Kwasowość lub zasadowość wody. Obniżające się pH świadczy o zanikaniu roślin lobeliowych i przechodzeniu w dystrofię, zbyt wysokie – o przemianie w jezioro eutroficzne.',
    help: `Co wpisać: pH wody zmierzone sondą (pH-metrem) z warstwy powierzchniowej ok. 0,5–1 m w strefie pelagialu.

Progi: pH 5,5–7,5 FV; <5,5 do 4,5 albo >7,5 do 8,5 U1; <4,5 albo >8,5 U2.

Uwaga: jeziora lobeliowe dystroficzne mają naturalnie kwaśny odczyn (pH 3,8–5,9), zrównoważone 6,0–7,6. Tab. 2 nie robi wyjątku dla dystroficznych – formularz ostrzega, gdy w zakładce Stanowisko wybrano podtyp dystroficzny. Pomiar jest chwilowy: zależy od opadów i warunków hydrologicznych, a w dzień fotosynteza podnosi pH.

${PELAGIAL}

Wskaźnik kardynalny.`,
    thresholds: { FV: 'pH 5,5–7,5', U1: 'pH <5,5 do 4,5 lub >7,5 do 8,5', U2: 'pH <4,5 lub >8,5' },
    unit: 'pH',
    inputLabel: 'Odczyn wody',
    inputHelp: 'pH z sondy, z warstwy 0,5–1 m w pelagialu, np. 6,35.',
    grade: gradePH3110,
    warn: (v, _i, ctx) => {
      if (v === undefined) return null
      if (v > 14) return 'pH powyżej 14? Sprawdź wpis.'
      if (v < 5.5 && isDystrophic(ctx))
        return 'Jezioro lobeliowe dystroficzne ma naturalnie pH 3,8–5,9. Tab. 2 i tak daje U1/U2 – oceń ekspercko i uzasadnij w uwagach.'
      return null
    },
    describe: (v) => `pH ${plNum(v)}`,
  }),
  measure({
    id: 'conductivity',
    label: 'Konduktywność (przewodnictwo elektrolityczne)',
    description: 'Odzwierciedla zawartość jonów w wodzie. Rośnie przy zanieczyszczeniach: zrzutach ścieków, spływach z pól z nawozami fosforowymi i azotowymi.',
    help: `Co wpisać: przewodnictwo elektrolityczne zmierzone sondą (konduktometrem) z warstwy powierzchniowej ok. 0,5–1 m w strefie pelagialu, w µS/cm.

Progi: <100 µS/cm FV, 100–250 µS/cm U1, >250 µS/cm U2.

Dlaczego: izoetydy żyją tylko w wodach miękkich, słabo zmineralizowanych, ubogich w wapń. Wzrost przewodnictwa to dopływ jonów – ścieki, nawozy, gazy z powietrza (CO₂, SO₂, NO₃, NH₃). Pomiar chwilowy, zależny od opadów.

${PELAGIAL}

Wskaźnik kardynalny.`,
    thresholds: { FV: '<100 µS/cm', U1: '100–250 µS/cm', U2: '>250 µS/cm' },
    unit: 'µS/cm',
    inputLabel: 'Przewodnictwo',
    inputHelp: 'W µS/cm, np. 60. Sonda podaje mS/cm? Pomnóż przez 1000.',
    grade: gradeConductivity3110,
    warn: (v) => (v !== undefined && v > 0 && v < 1 ? 'Poniżej 1 µS/cm – czy to nie mS/cm? Pomnóż przez 1000.' : null),
    describe: (v) => `${plNum(v)} µS/cm`,
  }),
  measure({
    id: 'secchi',
    label: 'Przezroczystość wody',
    description: 'Widzialność krążka Secchiego. Słaba przezroczystość szkodzi roślinności zanurzonej i bywa efektem silnego rozwoju fitoplanktonu albo zawiesiny w wodzie.',
    help: `Co wpisać: głębokość, na której biały krążek Secchiego (średnica 30 cm), opuszczany na znakowanej linie, przestaje być widoczny – w metrach. Pomiar w centralnej, najgłębszej części jeziora.

Progi: >3,5 m FV, 1,5–3,5 m U1, <1,5 m U2.

Płytkie jezioro: gdy krążek leży widoczny na dnie, wynik mówi o głębokości, nie o wodzie. Sprawozdanie 2015–2018 proponuje (jak dla 3140) dla jezior o głębokości maksymalnej <5 m przyjąć „do dna” jako stan właściwy – to tylko propozycja, więc formularz nie zmienia podpowiedzi, ale ostrzega.

Dlaczego: izoetydy rosną przy dnie – bez światła na kilku metrach głębokości zanikają. Wskaźnik kardynalny, zmienny w ciągu roku – pojedyncza zmiana oceny nie musi oznaczać zmiany stanu.`,
    thresholds: { FV: '>3,5 m', U1: '1,5–3,5 m', U2: '<1,5 m' },
    unit: 'm',
    inputLabel: 'Widzialność krążka Secchiego',
    inputHelp: 'Głębokość zniknięcia krążka w metrach, np. 5,1.',
    grade: gradeSecchi3110,
    extra: [{ kind: 'select', name: 'toBottom', label: 'Krążek widoczny do dna', options: TO_BOTTOM, help: 'Tak – gdy krążek leży widoczny na dnie (jezioro płytsze niż zasięg widzialności). Opcjonalne.' }],
    warn: (v, i, ctx) => {
      if (v === undefined) return null
      if (i.toBottom === 'yes' && v <= 3.5)
        return 'Krążek widoczny do dna – woda może być przejrzysta, a wynik zaniżony przez głębokość. Propozycja z 2015–2018: w jeziorach płytkich (<5 m) „do dna” = FV. Oceń ekspercko.'
      const depth = num(ctx?.indicators?.combination?.inputs?.maxDepth)
      if (depth !== undefined && depth > v * 3) return `Roślinność do ${plNum(depth)} m przy widzialności ${plNum(v)} m? Sprawdź jednostki.`
      return null
    },
    describe: (v, i) => `${plNum(v)} m${i.toBottom === 'yes' ? ' (do dna)' : ''}`,
  }),
  {
    id: 'plankton',
    label: 'Plankton (fito- i zooplankton)',
    parameter: 'structure',
    excluded: true,
    excludedNote: 'wskaźnik pomocniczy – nie liczy się do oceny struktury',
    description:
      'Analiza fitoplanktonu i zooplanktonu w próbce. Oceny wykonuje się osobno dla obu grup; gdy się różnią, za ocenę końcową przyjmuje się niższą. Wskaźnik pomocniczy, nieobowiązkowy.',
    help: `Co wybrać: osobno stan fitoplanktonu i zooplanktonu wg tab. 2 – formularz bierze niższą z ocen. Opisy (grupy dominujące, udział procentowy) trafiają do karty. Niebadany – „Nie badano” (XX).

Próbka: siatka planktonowa (oczka ≤20 µm) w centralnej, najgłębszej części jeziora, z warstwy 0,5–1 m, utrwalona płynem Lugola. Zgrubna analiza różnorodności i udziału procentowego w co najmniej 20 polach widzenia mikroskopu. Bez siatki fitoplankton można oznaczyć metodą osadzania.

Wskaźnik pomocniczy: wpisywany do karty, ale pomijany w ocenie specyficznej struktury i funkcji (sprawozdania 2015–2021: „ocena nie jest obligatoryjna”). Plankton reaguje na zmiany najszybciej – zanim zmienią się rośliny wyższe.

Zakwit sinicowy to sygnał rosnącej trofii i zanikania siedliska – wymaga natychmiastowych działań ochronnych.`,
    thresholds: {
      FV: 'Fitoplankton: taksony miksotroficzne, złotowiciowce, drobne zielenice; zooplankton: przewaga dużych filtratorów (Daphnia)',
      U1: 'Fitoplankton: współdominacja sinic i zielenic; zooplankton: wrotki i małe wioślarki (Bosmina, Chydorus)',
      U2: 'Fitoplankton: dominacja sinic nitkowatych, Microcystis, Woronichinia, zakwity; zooplankton: dominacja wrotków (Keratella cochlearis f. tecta)',
    },
    inputs: [
      { kind: 'select', name: 'phyto', label: 'Fitoplankton', options: PHYTO.map(({ value, label }) => ({ value, label })), required: true, help: PHYTO.map((o) => `• ${o.label} – ${o.grade}`).join('\n') },
      { kind: 'textarea', name: 'phytoNote', label: 'Fitoplankton – opis', rows: 3, help: 'Grupy dominujące i ich udział procentowy, obecność zakwitu. Np. „Brak zakwitu. Najwyższy udział zielenic Chlorophyceae (80%)…”.' },
      { kind: 'select', name: 'zoo', label: 'Zooplankton', options: ZOO.map(({ value, label }) => ({ value, label })), required: true, help: ZOO.map((o) => `• ${o.label} – ${o.grade}`).join('\n') },
      { kind: 'textarea', name: 'zooNote', label: 'Zooplankton – opis', rows: 3, help: 'Grupy dominujące i ich udział procentowy. Np. „Przeważają wrotki (dominacja Keratella cochlearis)…”.' },
    ],
    suggest: (i) => gradePlankton3110(i.phyto, i.zoo),
    warn: (i) => (i.phyto === 'bloom' ? 'Zakwit sinicowy: rośnie trofia jeziora – zwróć szczególną uwagę na stan ekosystemu i zaproponuj natychmiastowe działania ochronne.' : null),
    describe: (i) => {
      if (i.phyto === 'notStudied' && i.zoo === 'notStudied') return 'Nie badano'
      const part = (name: string, opts: GradedOption[], choice: unknown, note: unknown) => {
        const o = opts.find((x) => x.value === choice)
        if (!o) return ''
        const text = String(note ?? '').trim() || o.label
        return o.value === 'notStudied' ? `${name}: nie badano` : `${name} (${o.grade}): ${text}`
      }
      return [part('Fitoplankton', PHYTO, i.phyto, i.phytoNote), part('Zooplankton', ZOO, i.zoo, i.zooNote)].filter(Boolean).join(' ')
    },
  },
]

// ---------- pola stanowiska ----------

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Jezioro Chlewo',
    help: `Nazwa jeziora, a przy kilku stanowiskach w jednym jeziorze – z numerem lub częścią jeziora, np. „Jezioro Bobięcińskie Wielkie, st. 2”.

Dlaczego: stanowiskiem może być całe jezioro albo jego wyraźnie wydzielona część – w dużych jeziorach wyznacza się więcej niż jedno. Stabilna nazwa pozwala zestawić kolejne karty.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'select',
    name: 'subtype',
    label: 'Podtyp jeziora lobeliowego (opcjonalnie)',
    options: SUBTYPES,
    help: `Podział wg właściwości fizyczno-chemicznych wód i udziału gatunków charakterystycznych:
• dystroficzne oligohumusowe – kwaśne (pH 3,8–5,9), mało substancji humusowych, woda jasna, czasem jasnoniebieska;
• dystroficzne polihumusowe – kwaśne, dużo humin, woda jasno- lub ciemnobrunatna;
• zrównoważone – pH 6,0–7,6, niskie przewodnictwo, więcej wapnia;
• zeutrofizowane – więcej azotu, fosforu, wapnia, zanikają izoetydy, pojawia się roślinność jezior eutroficznych;
• zdegradowane – historycznie lobeliowe, roślinność charakterystyczna zanikła.

Nie wpływa na podpowiedzi ocen. Przy podtypach dystroficznych formularz ostrzega, że niskie pH i brunatna woda mogą być naturalne.`,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Isoeto-Lobelietum littorelletosum; zb. z Drepanocladus tenuinervis',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi, oddzielone przecinkiem albo średnikiem: Isoeto-Lobelietum (Lobelietum dortmannae), Isoetetum lacustris, Isoetetum echinosporae, Myriophylletum alterniflori, Luronietum natantis, zbiorowiska mchów (Drepanocladus, Sphagnum denticulatum), Sparganietum minimi.

Gdy we wskaźniku „Charakterystyczna kombinacja zbiorowisk” nie wpiszesz syntaksonów, formularz weźmie je stąd.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Wielkość i kształt jeziora, brzegi, zlewnia, zasięg głębokościowy izoetydów, objawy eutrofizacji.',
    help: `Syntetyczny opis stanowiska:
• wielkość jeziora (ha), kształt, linia brzegowa, charakter brzegów (piaszczyste, strome);
• zlewnia: lasy (bory, buczyny), torfowiska, pola, zabudowa rekreacyjna, ośrodki;
• rozmieszczenie roślinności charakterystycznej – na jakich głębokościach rośnie lobelia, brzeżyca, poryblin, mchy;
• objawy eutrofizacji (glony nitkowate na roślinności) lub dystrofizacji (brunatnienie wody);
• gospodarka ściekowa, wędkarstwo, kąpieliska, zarybianie.

Dlaczego: jeziora lobeliowe są niestabilne i szybko degradują – opis pozwala uchwycić zmiany między badaniami.`,
  },
  {
    kind: 'number',
    name: 'areaM2',
    label: 'Powierzchnia płatów siedliska (łącznie)',
    unit: 'm²',
    min: 0,
    required: true,
    help: 'Łączna powierzchnia płatów siedliska (zbiorowisk roślinności lobeliowej i towarzyszących) na transekcie, w m². Rozbicie na zbiorowiska wpisz w polu niżej.',
  },
  {
    kind: 'textarea',
    name: 'patchAreas',
    label: 'Powierzchnia płatów według zbiorowisk (opcjonalnie)',
    rows: 3,
    placeholder: 'np. Isoeto-Lobelietum littorelletosum: 150 m²',
    help: 'Powierzchnia każdego zbiorowiska osobno, jak w karcie z przewodnika: jedna linia na zbiorowisko. Pozwala porównać, które zbiorowisko się kurczy.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas'),
  {
    kind: 'text',
    name: 'coordStart',
    group: 'Współrzędne geograficzne',
    wide: true,
    label: 'Początek transektu',
    required: true,
    help: `Współrzędne geograficzne początku transektu z odbiornika GPS (WGS84).

Dlaczego: przy kolejnym badaniu transekt trzeba znaleźć w tym samym miejscu. Jeśli się przesunął – zapisz nowe współrzędne i opisz to w uwagach.`,
  },
  {
    kind: 'text',
    name: 'coordEnd',
    group: 'Współrzędne geograficzne',
    wide: true,
    label: 'Koniec transektu (opcjonalnie)',
    help: 'Współrzędne końca transektu (najgłębszy punkt z roślinnością), jeśli je masz. Karta z przewodnika podaje tylko początek.',
  },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    defaultValue: '30x30 m',
    required: true,
    hint: 'Standard: 30×30 m w litoralu, prostopadle do brzegu.',
    help: `Transekt w strefie litoralu, w karcie z przewodnika 30×30 m. Sprawozdanie 2015–2018 proponuje szerokość 30 m i długość do maksymalnego zasięgu głębokościowego roślin – wtedy zmiana długości pokazuje zmianę zasięgu siedliska.

Gdy transekt trzeba było dopasować do kształtu jeziora, wpisz faktyczne wymiary.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 152,3',
    help: 'Wysokość lustra wody nad poziomem morza, z mapy topograficznej albo GPS. Jeziora pomorskie leżą zwykle 100–200 m n.p.m., Wielki Staw w Karkonoszach ok. 1225 m.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data kontroli',
    placeholder: 'DD.MM.RRRR, np. 01.09.2009',
    required: true,
    hint: 'Optymalnie lipiec–sierpień, nie wcześniej niż początek lipca i nie później niż połowa września.',
    help: 'Dzień badań terenowych. Badania prowadzi się w sezonie letnim: od początku lipca do połowy września, najlepiej w lipcu i sierpniu. Częstotliwość wg przewodnika – raz na 3 lata (w praktyce PMŚ co 4–6 lat), częściej przy wyraźnych objawach pogorszenia.',
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const [, m, d] = v.split('-').map(Number)
      return m === 7 || m === 8 || (m === 9 && d <= 15) ? null : 'Termin poza optymalnym oknem (początek lipca – połowa września).'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcia fitosocjologiczne (nieobowiązkowe) ----------

const releveFields: FieldDef[] = [
  { kind: 'text', name: 'coords', label: 'Współrzędne środka zdjęcia', help: 'Współrzędne GPS środka powierzchni zdjęcia.' },
  { kind: 'text', name: 'depth', label: 'Głębokość', unit: 'm', placeholder: 'np. 0,5–1,0', help: 'Zakres głębokości wody, na której wykonano zdjęcie – izoetydy tworzą pasy głębokościowe (lobelia i brzeżyca płycej, poryblin głębiej).' },
  {
    kind: 'number',
    name: 'area',
    group: 'Powierzchnia i pokrycie',
    label: 'Powierzchnia zdjęcia',
    unit: 'm²',
    min: 0,
    help: 'Powierzchnia zdjęcia w m². Przewodnik nie narzuca wielkości – wpisz faktyczną.',
  },
  { kind: 'number', name: 'cover', group: 'Powierzchnia i pokrycie', label: 'Ogólne pokrycie', unit: '%', min: 0, max: 100, help: 'Procent powierzchni zdjęcia pokryty przez roślinność (rzut pionowy).' },
  { kind: 'text', name: 'unit', label: 'Jednostka fitosocjologiczna', placeholder: 'np. Isoeto-Lobelietum isoetosum', help: 'Zespół lub zbiorowisko, do którego należy zdjęcie.' },
  {
    kind: 'releve-species',
    name: 'species',
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki na powierzchni zdjęcia z ilościowością w skali Braun-Blanqueta (r, +, 1–5). Rośliny naczyniowe w warstwie C, mchy wodne i torfowce w D.',
  },
]

export const methodology3110: Methodology = {
  code: '3110',
  name: 'Jeziora lobeliowe',
  source:
    'Wilk-Woźniak E., Kraska M., Piotrowicz R., Klimaszyk P. 2012, 3110 Jeziora lobeliowe, [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 114–129 (tab. 1 i 2), z modyfikacją metodyki z 30.09.2015',

  siteFields,

  releves: {
    defaultCount: 0,
    intro:
      'Przewodnik nie wymaga zdjęć fitosocjologicznych – stan roślinności opisuje wskaźnik „Charakterystyczna kombinacja zbiorowisk”. W monitoringu 2016–2021 wykonywano zwykle po jednym zdjęciu w każdym zbiorowisku na transekcie (sprawozdanie 2015–2018 proponuje zamiast tego jedno zdjęcie synfitosocjologiczne całego transektu). Dodaj zdjęcia, jeśli je robisz.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Realne możliwości zachowania właściwego stanu siedliska oraz poprawy stanu niewłaściwego: stan zlewni i sposób jej zagospodarowania, gospodarka wodno-ściekowa, zabudowa rekreacyjna, gospodarka rybacka i wędkarska.',
    help: `Oceń stan zlewni jeziora i sposób jej zagospodarowania: czy istnieje gospodarka wodno-ściekowa, czy zanieczyszczenia nie trafiają do jeziora (domostwa, gospodarstwa, zabudowa rekreacyjna), jak gospodarowane są pola i lasy w bezpośrednim otoczeniu i w zlewni, jak gospodaruje się samym jeziorem (zarybianie, zanęcanie). Przy jeziorach udostępnionych do rekreacji oceń infrastrukturę rekreacyjną.

W opisie umieść potencjalne zabiegi ochronne: uregulowanie gospodarki ściekowej, wyłączenie z gospodarki rybackiej i wędkarstwa (zakaz zanęcania, zarybiania karpiowatymi i obcymi gatunkami), wyznaczone kąpieliska i miejsca do połowu, zachowanie stref buforowych (zadrzewienia, szuwary), niedopuszczanie spływów z meliorowanych terenów.`,
    thresholds: {
      FV: 'Perspektywy ochrony siedliska dobre lub doskonałe; nie przewiduje się znaczącego oddziaływania czynników zagrażających; przetrwanie w dłuższej perspektywie czasowej bardzo prawdopodobne',
      U1: 'Kombinacje pośrednie',
      U2: 'Perspektywy ochrony siedliska są złe, można się spodziewać lub obserwowany jest silny wpływ czynników zagrażających (odwadnianie terenu, zła gospodarka jeziorami, zła gospodarka w zlewni itd.); nie można zagwarantować przetrwania w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A01', name: 'Uprawa' },
    { code: 'A08', name: 'Nawożenie / nawozy sztuczne' },
    { code: 'B02.02', name: 'Wycinka lasu' },
    { code: 'B02.03', name: 'Usuwanie podszytu' },
    { code: 'B02.06', name: 'Przerzedzenie warstwy drzew' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'E01', name: 'Tereny zurbanizowane, tereny zamieszkane' },
    { code: 'E01.03', name: 'Zabudowa rozproszona' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'E03.01', name: 'Pozbywanie się odpadów z gospodarstw domowych / obiektów rekreacyjnych' },
    { code: 'F01', name: 'Akwakultura morska i słodkowodna' },
    { code: 'F02.01', name: 'Rybołówstwo bierne' },
    { code: 'F02.03', name: 'Wędkarstwo' },
    { code: 'F04.01', name: 'Plądrowanie stanowisk roślin' },
    { code: 'F05.04', name: 'Kłusownictwo' },
    { code: 'F06', name: 'Inne formy polowania, łowienia ryb i kolekcjonowania, nie wymienione powyżej' },
    { code: 'G01', name: 'Sporty i różne formy czynnego wypoczynku, uprawiane w plenerze' },
    { code: 'G01.01', name: 'Żeglarstwo' },
    { code: 'G02', name: 'Infrastruktura sportowa i rekreacyjna' },
    { code: 'G02.10', name: 'Inne kompleksy sportowe i rekreacyjne' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'G05.04', name: 'Wandalizm' },
    { code: 'H01.05', name: 'Rozproszone zanieczyszczenie wód powierzchniowych z powodu działalności związanej z rolnictwem i leśnictwem' },
    { code: 'H01.08', name: 'Rozproszone zanieczyszczenie wód powierzchniowych z powodu ścieków z gospodarstw domowych' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'J02.01', name: 'Zasypywanie terenu, melioracje i osuszanie – ogólnie' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód – ogólnie' },
    { code: 'K01.03', name: 'Wyschnięcie' },
    { code: 'K02.02', name: 'Nagromadzenie materii organicznej' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'K02.04', name: 'Zakwaszenie (naturalne)' },
    { code: 'M01.02', name: 'Susze i zmniejszenie opadów' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. elisma wodna Luronium natans, pływak szerokobrzeżek, kreślinek nizinny, sąsiedztwo torfowisk.',
        help: 'Wartości przyrodnicze stanowiska poza samym siedliskiem: gatunki z załącznika II Dyrektywy Siedliskowej obecne w jeziorach lobeliowych (elisma wodna Luronium natans, pływak szerokobrzeżek Dytiscus latissimus, kreślinek nizinny Graphoderus bilineatus), sąsiedztwo torfowisk (7110, 7140), borów i kwaśnych buczyn. Brak informacji – „Nie pozyskano danych”.',
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: 'Jakie działania ochronne wykonano i jaka jest ich skuteczność, oraz co proponujesz. Typowe dla 3110: uregulowana gospodarka wodno-ściekowa (także zabudowy rekreacyjnej), zakaz zarybiania karpiowatymi i gatunkami obcymi, zakaz zanęcania ryb, wyznaczone kąpieliska i miejsca do połowu (kładki), zakaz poruszania się poza ścieżkami, ograniczenie nawożenia w zlewni, rozważenie reintrodukcji poryblinu. Brak działań – „Brak”.',
      }
    return f
  }),

  speciesCatalog: SPECIES_3110.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer3110(s) })),
  speciesInfo: (name) => {
    const e = findSpecies3110(name)
    return e ? GROUP_LABELS_3110[e.group] : undefined
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator3110 = (id: string): IndicatorDef => {
  const i = methodology3110.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 3110`)
  return i
}
