// Metodyka *6230 (bogate florystycznie górskie i niżowe murawy bliźniczkowe Nardetalia – płaty bogate florystycznie)
// jako dane. Źródło: Korzeniak J. 2010, „6230* Bogate florystycznie górskie i niżowe murawy bliźniczkowe” [w:] Mróz W.
// (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ, s. 130–145 (tab. 1 i 2, karta
// Piorunowiec 2007), z modyfikacją metodyki GIOŚ z 17.07.2015 (nowa waloryzacja „Gatunków dominujących”
// i „Bogactwa gatunkowego”) oraz praktyką oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014, 2015–2018
// i 2023–2025 (badania 2024). Siedlisko priorytetowe, półnaturalne (wypas, koszenie): transekt 20 arów (standardowo
// 10×200 m), 3 zdjęcia fitosocjologiczne po 25 m² (oba końce i środek transektu).
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_6230,
  SPECIES_6230,
  defaultLayer6230,
  findSpecies6230,
  isAlien6230,
  isCharacteristic6230,
  isNitrophilous6230,
  isSlowWoody6230,
  isWeakAlien6230,
  isWoody6230,
  speciesKey6230,
} from './species'

// ---------- progi liczbowe (tab. 2 + modyfikacja 2015) ----------

const RANK: Record<Grade, number> = { FV: 0, U1: 1, U2: 2, XX: -1 }
/** Gorsza z ocen (XX pomijane). */
const worst = (...g: Grade[]): Grade => g.reduce((a, b) => (RANK[b] > RANK[a] ? b : a))

/** Gatunki charakterystyczne i wyróżniające: >6 FV; 4–6 U1; <4 U2. */
export const gradeCharacteristic6230 = (n: number): Grade => (n > 6 ? 'FV' : n >= 4 ? 'U1' : 'U2')

/** Pokrycie bliźniczki psiej trawki w transekcie: >50% FV; 30–50% U1 (obie granice); <30% U2. */
export const gradeNardus6230 = (cover: number): Grade => (cover > 50 ? 'FV' : cover >= 30 ? 'U1' : 'U2')

/** Gatunki spoza Nardetalia o pokryciu >25%: brak FV; 1–2 U1; więcej niż 2 U2. */
export const gradeOtherDominants6230 = (n: number): Grade => (n <= 0 ? 'FV' : n <= 2 ? 'U1' : 'U2')

/**
 * Gatunki dominujące (modyfikacja 2015): gorsza z dwóch ocen – pokrycia bliźniczki (FV także, gdy współpanują gatunki
 * charakterystyczne Nardetalia) i liczby innych gatunków o pokryciu >25%. Tak liczy karta przykładowa (bliźniczka 80%,
 * borówka czarna 30% → U1).
 */
export const gradeDominant6230 = (nardus: number, others: number, coDominance = false): Grade =>
  worst(coDominance ? 'FV' : gradeNardus6230(nardus), gradeOtherDominants6230(others))

/**
 * Bogactwo gatunkowe – średnia liczba gatunków roślin naczyniowych na 25 m² (modyfikacja 2015): >25 FV, 10–25 U1,
 * <10 U2; w piętrze subalpejskim >13 FV, 7–13 U1, <7 U2.
 */
export const gradeRichness6230 = (mean: number, subalpine = false): Grade =>
  subalpine ? (mean > 13 ? 'FV' : mean >= 7 ? 'U1' : 'U2') : mean > 25 ? 'FV' : mean >= 10 ? 'U1' : 'U2'

/** Obce gatunki inwazyjne: brak FV; pokrycie do 10% powierzchni siedliska U1 (10 też); >10% U2. */
export function gradeAliens6230(count: number, cover?: number): Grade {
  if (count <= 0 && !(cover && cover > 0)) return 'FV'
  return cover !== undefined && cover > 10 ? 'U2' : 'U1'
}

/** Rodzime gatunki ekspansywne roślin zielnych – łączne pokrycie: <20% FV; 20–30% U1 (obie granice); >30% U2. */
export const gradeExpansive6230 = (cover: number): Grade => (cover < 20 ? 'FV' : cover <= 30 ? 'U1' : 'U2')

/**
 * Ekspansja krzewów i podrostu drzew – pokrycie warstwy B: „<10–25%” FV, „(10)25–(40)50%” U1, „>(40)50%” U2
 * w zależności od gatunków. Wariant ostry (brzoza, wierzby, sosna, świerk…): <10 FV, 10–40 U1, >40 U2;
 * łagodny (jałowiec – „znacznie mniejsze zagrożenie”): <25 FV, 25–50 U1, >50 U2.
 */
export const gradeShrubs6230 = (cover: number, slow = false): Grade =>
  slow ? (cover < 25 ? 'FV' : cover <= 50 ? 'U1' : 'U2') : cover < 10 ? 'FV' : cover <= 40 ? 'U1' : 'U2'

/** Eutrofizacja z pokrycia gatunków nitrofilnych: brak FV; <10% U1; od 10% – U2 (silna eutrofizacja). */
export const gradeEutrophication6230 = (cover: number): Grade => (cover <= 0 ? 'FV' : cover < 10 ? 'U1' : 'U2')

const pct = (v: number) => `${plNum(v)}%`
const round1 = (n: number) => Math.round(n * 10) / 10
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey6230(n), n])).values()]

/** Suma pokrycia wierszy listy spełniających warunek; 'present' – są wiersze, ale bez pokrycia; undefined – brak wierszy. */
function sumCover(list: unknown, pred: (name: string) => boolean = () => true): number | 'present' | undefined {
  const rows = speciesRows(list).filter((r) => r.name?.trim() && pred(r.name.trim()))
  if (!rows.length) return undefined
  const covers = rows.map((r) => num(r.cover)).filter((c): c is number => c !== undefined)
  return covers.length ? round1(covers.reduce((a, b) => a + b, 0)) : 'present'
}

/** Psiara krzyżownicowa (Polygalo-Nardetum) – wtedy dziurawiec czteroboczny jest gatunkiem charakterystycznym. */
const polygaloOf = (ctx?: IndicatorContext) => /polygalo/i.test(String(ctx?.site?.communities ?? ''))
const subalpineOf = (ctx?: IndicatorContext) => ctx?.site?.belt === 'subalpine'

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'other', label: 'Inne kombinacje (np. powolny ubytek albo areał stabilny, lecz bardzo mały)', grade: 'U1' },
  { value: 'clearDecrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze', grade: 'U2' },
  { value: 'lost', label: 'Siedlisko zanikło na stanowisku (praktyka 2024)', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const EUTRO: GradedOption[] = [
  { value: 'none', label: 'Brak oznak, ew. przyczyną wzrostu żyzności siedliska jest wyłącznie naturalna sukcesja, a pokrycie gatunków nitrofilnych nieznaczne', grade: 'FV' },
  { value: 'minor', label: 'Obecne gatunki nitrofilne, lecz ich pokrycie <10%', grade: 'U1' },
  { value: 'strong', label: 'Silna/długotrwała eutrofizacja (np. spływ nawozów z pól, koszarowanie owiec, nawożenie)', grade: 'U2' },
]
const SPATIAL: GradedOption[] = [
  { value: 'compact', label: 'Płaty siedliska zwarte i rozległe', grade: 'FV' },
  { value: 'smallStable', label: 'Siedlisko z natury drobnopowierzchniowe, lecz wielkość płatów stabilna', grade: 'FV' },
  { value: 'intermediate', label: 'Stan pośredni (np. średni stopień fragmentacji, płaty rozdzielone borówczyskami lub zaroślami)', grade: 'U1' },
  { value: 'tiny', label: 'Skrajnie małe (poniżej 1 ara) i izolowane płaty', grade: 'U2' },
  { value: 'lost', label: 'Siedlisko zanikło lub zostało zniszczone (praktyka 2024)', grade: 'U2' },
]
const FRAGMENTATION: SelectOption[] = [
  { value: '', label: '—' },
  { value: '1', label: '1 – mały (nieznaczny)' },
  { value: '2', label: '2 – średni' },
  { value: '3', label: '3 – duży' },
]
const SHRUB_VARIANT: SelectOption[] = [
  { value: '', label: '— (z listy gatunków)' },
  { value: 'fast', label: 'Gatunki szybko zarastające (brzoza, wierzby, sosna, świerk, osika…) – progi 10/40%' },
  { value: 'slow', label: 'Gatunki o mniejszym zagrożeniu (głównie jałowiec) – progi 25/50%' },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

/** Select niewymagany – gdy liczba albo lista wystarcza, nie trzeba go wybierać. */
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

const totalInput = (label: string, help: string): FieldDef => ({ kind: 'number', name: 'total', label, unit: '%', min: 0, max: 100, help })

/** Łączne pokrycie: wpisane wprost > suma z listy > 0 przy „nie stwierdzono”. 'present' – lista bez pokrycia. */
function coverOf(i: InputValues, pred?: (name: string) => boolean): number | 'present' | undefined {
  const t = num(i.total)
  if (t !== undefined) return t
  const s = sumCover(i.species, pred)
  if (s !== undefined) return s
  return i.none === 'yes' ? 0 : undefined
}

const describeList = (i: InputValues) => {
  if (note(i)) return note(i)
  const list = describeSpecies(speciesRows(i.species))
  const t = num(i.total)
  if (list) return t !== undefined ? `${list} – łącznie ${pct(t)}` : list
  if (t !== undefined) return `Łącznie ${pct(t)}`
  return i.none === 'yes' ? 'Brak' : ''
}

const SURFACE = 'w % powierzchni transektu (z dokładnością do 10%; śladowe – „znikomo”, wpisz np. 1)'

// ---------- podtypy (sprawozdanie 2006–2008, karta przykładowa) ----------

export const SUBTYPES_6230 = ['6230-1', '6230-2', '6230-3', '6230-4'] as const
export const SUBTYPE_LABELS_6230: Record<(typeof SUBTYPES_6230)[number], string> = {
  '6230-1': '6230-1 – Bieszczadzkie (wschodniokarpackie) murawy bliźniczkowe',
  '6230-2': '6230-2 – Zachodniokarpackie murawy bliźniczkowe',
  '6230-3': '6230-3 – Sudeckie murawy bliźniczkowe',
  '6230-4': '6230-4 – Niżowe murawy bliźniczkowe',
}
const SUBTYPE_OPTIONS: SelectOption[] = [{ value: '', label: '—' }, ...SUBTYPES_6230.map((s) => ({ value: s, label: SUBTYPE_LABELS_6230[s] }))]

export const BELT_OPTIONS: SelectOption[] = [
  { value: '', label: '—' },
  { value: 'lowland', label: 'Niż i wyżyny' },
  { value: 'foothill', label: 'Piętro pogórza' },
  { value: 'montane', label: 'Piętro reglowe (regiel dolny i górny, połoniny poniżej granicy lasu)' },
  { value: 'subalpine', label: 'Piętro subalpejskie (psiary wysokogórskie Tatr i Karkonoszy, połoniny)' },
]

// ---------- liczenie ----------

function characteristicNames(i: InputValues, ctx?: IndicatorContext) {
  const polygalo = polygaloOf(ctx)
  return distinct(rowNames(i.species).filter((n) => isCharacteristic6230(n, polygalo)))
}
function characteristicCount(i: InputValues, ctx?: IndicatorContext): number | undefined {
  const c = num(i.count)
  if (c !== undefined) return c
  return rowNames(i.species).length || i.none === 'yes' ? characteristicNames(i, ctx).length : undefined
}

const isNardus = (n: string) => speciesKey6230(n) === 'bliźniczka psia trawka'

interface DominantCalc {
  nardus: number
  /** Łączne pokrycie bliźniczki i innych gatunków charakterystycznych. */
  characteristic: number
  /** Gatunki spoza listy charakterystycznych o pokryciu >25%. */
  others: string[]
  missingCover: boolean
}
function dominantCalc(i: InputValues, ctx?: IndicatorContext): DominantCalc | null {
  const rows = speciesRows(i.species).filter((r) => r.name?.trim())
  const nardusDirect = num(i.nardus)
  if (!rows.length && nardusDirect === undefined) return null
  const polygalo = polygaloOf(ctx)
  let nardus = 0
  let characteristic = 0
  const others = new Map<string, string>()
  let missingCover = false
  for (const r of rows) {
    const name = r.name.trim()
    const c = num(r.cover)
    if (c === undefined) {
      missingCover = true
      continue
    }
    if (isNardus(name)) nardus += c
    if (isCharacteristic6230(name, polygalo)) characteristic += c
    else if (c > 25) others.set(speciesKey6230(name), name)
  }
  if (nardusDirect !== undefined) {
    characteristic += nardusDirect - nardus
    nardus = nardusDirect
  }
  return { nardus: round1(nardus), characteristic: round1(characteristic), others: [...others.values()], missingCover }
}

function richnessMean(i: InputValues): { mean: number; from: 'value' | 'releves'; counts: number[] } | null {
  const v = num(i.value)
  const counts = ['count1', 'count2', 'count3'].map((k) => num(i[k])).filter((c): c is number => c !== undefined)
  if (v !== undefined) return { mean: v, from: 'value', counts }
  if (!counts.length) return null
  return { mean: round1(counts.reduce((a, b) => a + b, 0) / counts.length), from: 'releves', counts }
}

function shrubVariant(i: InputValues): { slow: boolean; auto: boolean } {
  if (i.variant === 'slow') return { slow: true, auto: false }
  if (i.variant === 'fast') return { slow: false, auto: false }
  const woody = distinct(rowNames(i.species)).filter((n) => findSpecies6230(n))
  return { slow: woody.length > 0 && woody.every(isSlowWoody6230), auto: true }
}

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description: 'Zmiana powierzchni płatów muraw bliźniczkowych na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury. W miarę możliwości – tempo zarastania psiar (procent zmniejszenia się powierzchni siedliska w danym okresie).',
    help: `Co wybrać: jak zmieniła się powierzchnia psiary na stanowisku od poprzedniego badania (albo względem literatury, map roślinności, ortofotomap). Powierzchnię w hektarach możesz wpisać obok – trafi do „wartości”.

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; inne kombinacje – U1; wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub literaturą – U2. Przy pierwszym badaniu – „Brak danych do porównania” (XX), jak w 2024 r. na nowym stanowisku Durbaszka, albo ocena ekspercka.

Praktyka: 2016–2018 – U1 także za areał „stabilny, lecz niewielki” albo powoli malejący, U2 za „bardzo mały lub mały z tendencją do zmniejszania się”; 2024 – U2 tam, gdzie siedlisko zanikło (Hala Lipowska, Skrzyczne, Puścizna Wielka…). Poprawa oceny w 2024 r. nigdzie nie oznaczała przyrostu areału, tylko stwierdzenie, że niewielki areał jest stabilny. Karta z przewodnika (Piorunowiec): powierzchnia bez wyraźnej zmiany, zarosła borówką tylko niewielka część polany → FV.`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się',
      U1: 'Inne kombinacje',
      U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze',
    },
    inputs: [
      selectInput('Zmiana powierzchni', AREA, 'Jak zmieniła się powierzchnia płatów 6230 na stanowisku od poprzedniego badania.'),
      { kind: 'number', name: 'areaHa', label: 'Powierzchnia (opcjonalnie)', unit: 'ha', min: 0, help: 'Powierzchnia płatów siedliska na stanowisku, jeśli ją znasz – trafi do pola „wartość”, gdy nie ma opisu. Karta z przewodnika: ok. 25 ha.' },
      noteInput('Opis (opcjonalnie)', 'np. Powierzchnia bez wyraźnej zmiany, niewielka część polany zarosła borówką.', 'Krótki opis zmian, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => {
      if (note(i)) return note(i)
      const ha = num(i.areaHa)
      return ha !== undefined ? `${plNum(ha)} ha` : labelOf(AREA, i.choice)
    },
  },
  {
    id: 'characteristic',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Obecność, a na stanowiskach także procent pokrycia, gatunków uznanych za charakterystyczne i wyróżniające dla zespołów rzędu Nardetalia oraz innych, decydujących o regionalnej specyfice siedliska (tab. 1: Carici rigidae-Nardetum, Hieracio alpini-Nardetum, Hypochoeridi uniflorae-Nardetum, Hieracio-Nardetum, Nardo-Juncetum, Calluno-Nardetum, Polygalo-Nardetum).',
    help: `Co wpisać: gatunki charakterystyczne i wyróżniające stwierdzone na transekcie, z pokryciem każdego ${SURFACE}. Katalog zna wykaz z przewodnika (pkt 4 i tab. 1): bliźniczka psia trawka, turzyca pigułkowata, izgrzyca przyziemna, jastrzębce Lachenala, kosmaczek i gronkowy, kosmatki polna i licznokwiatowa, widłak goździsty, krzyżownice, pięciornik kurze ziele, fiołek psi, przetacznik leśny, arnika, ukwap, podejźrzony, ozorka; w górach – prosienicznik jednogłówkowy, pięciornik złoty, kuklik górski, podbiałek alpejski, goryczka kropkowana, kosmatka sudecka, widlicz alpejski; lokalnie – dzwonek brodaty, turzyca tęga (Sudety), turzyca zawsze zielona, szafran spiski, marchwica (Tatry), wężymord górski, goździk skupiony, kostrzewa niska (Bieszczady), turzyce blada i zajęcza, dziewięćsił bezłodygowy, macierzanka zwyczajna (regle Karpat Zachodnich); na niżu – sit sztywny, gnidosz rozesłany, wrzos pospolity; ze sprawozdań – przytulia hercyńska. Liczbę możesz wpisać wprost.

Progi (tab. 2): >6 gatunków – FV; 4–6 – U1; <4 – U2 („proponowane orientacyjne zakresy”).

Jak liczy formularz: liczba wpisana wprost ma pierwszeństwo; bez niej – gatunki z listy znane katalogowi jako charakterystyczne (synonimy raz). Dziurawiec czteroboczny liczy się tylko w psiarze krzyżownicowej Polygalo-Nardetum (wpisanej w „Zbiorowiskach roślinnych”) – w innych zespołach wskazuje na brak użytkowania i sukcesję (sprawozdanie 2024: Podcibórz – zmiana pozorna, bo wcześniej liczono dziurawiec). Praktyka: Beskid Śląski – tylko bliźniczka i przytulia hercyńska albo pięciornik kurze ziele (U2). Karta z przewodnika (Piorunowiec): 8 gatunków → FV.

Wskaźnik kardynalny.`,
    thresholds: { FV: '>6 gatunków charakterystycznych i wyróżniających', U1: '4–6 gatunków charakterystycznych i wyróżniających', U2: '<4 gatunki charakterystyczne i wyróżniające' },
    inputs: [
      speciesInput('Gatunki charakterystyczne', `Gatunki charakterystyczne i wyróżniające z pokryciem ${SURFACE}, np. Nardus stricta 80, Carex pilulifera 10, Polygala vulgaris (znikomo – bez pokrycia albo 1).`),
      { kind: 'number', name: 'count', label: 'Liczba gatunków charakterystycznych (opcjonalnie)', min: 0, help: 'Łączna liczba gatunków charakterystycznych i wyróżniających na transekcie, wpisana wprost – ma pierwszeństwo przed liczeniem z listy.' },
      NONE_FIELD('Brak gatunków charakterystycznych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma żadnego gatunku charakterystycznego – wtedy wskaźnik to U2.'),
      noteInput('Opis (opcjonalnie)', 'np. Bliźniczka psia trawka Nardus stricta 80%, turzyca pigułkowata Carex pilulifera ok. 5–10%…', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i, ctx) => {
      const c = characteristicCount(i, ctx)
      return c === undefined ? null : gradeCharacteristic6230(c)
    },
    explain: (i, ctx) => {
      const c = characteristicCount(i, ctx)
      if (c === undefined) return null
      if (num(i.count) !== undefined) return `Gatunków charakterystycznych: ${plNum(c)}.`
      const names = characteristicNames(i, ctx)
      return `Gatunki charakterystyczne z katalogu: ${names.length}${names.length ? ` (${names.join(', ')})` : ''}.`
    },
    warn: (i, ctx) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.count) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo liczba nie są puste.')
      const polygalo = polygaloOf(ctx)
      const hyp = names.filter((n) => speciesKey6230(n) === 'dziurawiec czteroboczny')
      if (hyp.length && !polygalo) parts.push('Dziurawiec czteroboczny liczy się tylko w psiarze krzyżownicowej Polygalo-Nardetum – w innych zespołach wskazuje na sukcesję (sprawozdanie 2024). Pominięty.')
      const other = names.filter((n) => findSpecies6230(n) && !isCharacteristic6230(n, polygalo) && speciesKey6230(n) !== 'dziurawiec czteroboczny')
      if (other.length) parts.push(`Nie liczą się jako charakterystyczne: ${other.join(', ')}.`)
      const c = num(i.count)
      const fromList = characteristicNames(i, ctx).length
      if (c !== undefined && names.length && gradeCharacteristic6230(c) !== gradeCharacteristic6230(fromList))
        parts.push(`Wpisano ${plNum(c)} gatunków, a z listy wychodzi ${fromList} (${gradeCharacteristic6230(fromList)}).`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      const c = num(i.count)
      return list || (c !== undefined ? `${plNum(c)} gat.` : i.none === 'yes' ? 'Brak' : '')
    },
  },
  {
    id: 'dominant',
    label: 'Gatunki dominujące',
    parameter: 'structure',
    description:
      'Obecność i procent pokrycia gatunków współpanujących i panujących (o ilościowości 3 i większej wg skali Braun-Blanqueta). Gatunkiem dominującym w murawach powinna być i zwykle jest bliźniczka psia trawka, na niżu dość często także izgrzyca przyziemna i pięciornik kurze ziele, w tłokach – wrzos pospolity. W górach w płatach psiar dominują często: borówka czarna, mietlica pospolita, śmiałki, kostrzewa czerwona, dziurawiec czteroboczny, na połoninach trzcinnik leśny.',
    help: `Co wpisać: gatunki o pokryciu co najmniej ok. 10% transektu (karta: „należy wymienić tylko gatunki o pokryciu ≥10%”), z pokryciem każdego ${SURFACE}. Pokrycie bliźniczki możesz też wpisać osobno. Korzystaj ze zdjęć fitosocjologicznych.

Progi (modyfikacja metodyki z 17.07.2015): pokrycie bliźniczki psiej trawki >50% LUB współpanują gatunki charakterystyczne i wyróżniające dla Nardetalia – FV; bliźniczka 30–50% lub obecne 1–2 gatunki o pokryciu >25% – U1; bliźniczka <30% lub więcej niż 2 gatunki osiągają pokrycie >25% – U2.

Jak liczy formularz: gorsza z dwóch ocen – (1) pokrycia bliźniczki (FV także, gdy bliźniczka razem z innymi gatunkami charakterystycznymi pokrywa ponad 50% transektu – „współpanowanie”), (2) liczby gatunków spoza charakterystycznych o pokryciu >25%. Tak oceniono kartę z przewodnika (Piorunowiec): bliźniczka 80%, ale borówka czarna 30% → U1. Wrzos jest gatunkiem charakterystycznym, nie obniża oceny (2024: Włochów S – wcześniejsze uznanie wrzosu za niepożądany było błędem).

Praktyka: najgorzej oceniany wskaźnik 2024 (region alpejski 62% U2) – zwykle bliźniczka <10% i ekspansja borówki, mietlicy, trzcinnika piaskowego, krzewów. W Sudetach Środkowych (suche murawy Violion caninae) mały udział bliźniczki jest naturalny – oceń ekspercko.`,
    thresholds: {
      FV: 'Pokrycie bliźniczki psiej trawki Nardus stricta w transekcie >50% lub współpanują gatunki charakterystyczne i wyróżniające dla rzędu Nardetalia',
      U1: 'Pokrycie bliźniczki psiej trawki w transekcie 30–50% lub obecne 1–2 gatunki o pokryciu >25%',
      U2: 'Pokrycie bliźniczki psiej trawki w transekcie <30% lub więcej niż 2 gatunki osiągają pokrycie >25%',
    },
    inputs: [
      speciesInput('Gatunki dominujące', `Gatunki o pokryciu ≥10% transektu, z pokryciem ${SURFACE}, np. Nardus stricta 80, Vaccinium myrtillus 30, Vaccinium vitis-idaea 10.`),
      { kind: 'number', name: 'nardus', label: 'Pokrycie bliźniczki psiej trawki (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Pokrycie Nardus stricta w % powierzchni transektu – ma pierwszeństwo przed pokryciem z listy.' },
      noteInput('Opis (opcjonalnie)', 'np. Bliźniczka psia trawka Nardus stricta 80%, borówka czarna Vaccinium myrtillus 30%…', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i, ctx) => {
      const d = dominantCalc(i, ctx)
      if (!d) return null
      if (d.missingCover && d.nardus === 0 && !d.others.length) return null
      return gradeDominant6230(d.nardus, d.others.length, d.characteristic > 50)
    },
    explain: (i, ctx) => {
      const d = dominantCalc(i, ctx)
      if (!d) return null
      const parts = [`bliźniczka ${pct(d.nardus)} (${gradeNardus6230(d.nardus)})`]
      if (d.characteristic > 50 && d.nardus <= 50) parts.push(`współpanują gatunki charakterystyczne (łącznie ${pct(d.characteristic)}) → FV`)
      parts.push(d.others.length ? `gatunki spoza charakterystycznych o pokryciu >25%: ${d.others.join(', ')} (${gradeOtherDominants6230(d.others.length)})` : 'brak innych gatunków o pokryciu >25%')
      if (d.missingCover) parts.push('część gatunków bez pokrycia – wpisz pokrycie')
      return `${parts.join('; ')}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      const low = speciesRows(i.species).filter((r) => r.name?.trim() && (num(r.cover) ?? 100) < 10)
      if (low.length) parts.push(`Karta wymienia tylko gatunki o pokryciu ≥10%: ${low.map((r) => r.name.trim()).join(', ')}.`)
      const nd = num(i.nardus)
      const listed = sumCover(i.species, isNardus)
      if (nd !== undefined && typeof listed === 'number' && listed !== nd) parts.push(`Pokrycie bliźniczki wpisane osobno (${pct(nd)}) różni się od listy (${pct(listed)}) – liczy się wpisane osobno.`)
      const woody = names.filter(isWoody6230)
      if (woody.length) parts.push(`Drzewa i krzewy oceń też we wskaźniku „Ekspansja krzewów i podrostu drzew”: ${woody.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      const nd = num(i.nardus)
      return list || (nd !== undefined ? `Bliźniczka psia trawka ${pct(nd)}` : '')
    },
  },
  {
    id: 'richness',
    label: 'Bogactwo gatunkowe',
    parameter: 'structure',
    description:
      'Liczba gatunków na 25 m² – wartość średnia z 3 zdjęć fitosocjologicznych. Murawy bliźniczkowe są z natury ubogie florystycznie; duża liczba gatunków wynika zwykle z postępującej sukcesji, jest charakterystyczna dla jej stadiów pośrednich i nie oznacza dobrego stanu murawy.',
    help: `Co wpisać: liczbę gatunków roślin naczyniowych w każdym z 3 zdjęć fitosocjologicznych (25 m²) – formularz policzy średnią. Średnią możesz też wpisać wprost. Mchów i porostów nie licz (modyfikacja 2015: „gatunków roślin naczyniowych/25 m²”); gatunek w dwóch warstwach (np. świerk w b i c) licz raz. Dla podpowiedzi wybierz „Piętro roślinności” w zakładce „Stanowisko”.

Progi (modyfikacja metodyki z 17.07.2015, stosowana od cyklu 2016–2018): >25 gatunków/25 m² – FV, w piętrze subalpejskim >13; 10–25 – U1, w subalpejskim 7–13; <10 – U2, w subalpejskim <7. (Pierwotna tab. 2: FV w subalpejskim >20, U1 „stan pośredni”.)

Uwaga: sprawozdania 2015–2018 i 2024 proponują rezygnację ze wskaźnika – wysokie bogactwo coraz częściej oznacza przekształcanie się psiary w łąkę mezofilną (2024: Bircza, Kińczyk Bukowski, Gronowo, Jeleniewo), a karkonoskie psiary subalpejskie są z natury bardzo ubogie (2014: FV mimo niskich wartości). Jeśli bogactwo wynika z gatunków łąkowych, obniż ocenę ekspercko i uzasadnij w opisie. Karta z przewodnika (Piorunowiec): 16 gatunków/25 m² (zdjęcia: 17, 18, 13) → U1.`,
    thresholds: {
      FV: '>25 gatunków/25 m², w piętrze subalpejskim >13 gatunków/25 m²',
      U1: '10–25 gatunków/25 m², w piętrze subalpejskim 7–13 gatunków/25 m²',
      U2: '<10 gatunków/25 m², w piętrze subalpejskim <7 gatunków/25 m²',
    },
    inputs: [
      { kind: 'number', name: 'count1', group: 'Liczba gatunków roślin naczyniowych w zdjęciach', groupCols: 3, label: 'Zdjęcie I', min: 0, help: 'Liczba gatunków roślin naczyniowych w zdjęciu fitosocjologicznym I (25 m², początek transektu).' },
      { kind: 'number', name: 'count2', group: 'Liczba gatunków roślin naczyniowych w zdjęciach', label: 'Zdjęcie II', min: 0, help: 'Liczba gatunków roślin naczyniowych w zdjęciu fitosocjologicznym II (25 m², środek transektu).' },
      { kind: 'number', name: 'count3', group: 'Liczba gatunków roślin naczyniowych w zdjęciach', label: 'Zdjęcie III', min: 0, help: 'Liczba gatunków roślin naczyniowych w zdjęciu fitosocjologicznym III (25 m², koniec transektu).' },
      { kind: 'number', name: 'value', label: 'Średnia liczba gatunków na 25 m² (opcjonalnie)', unit: 'gat./25 m²', min: 0, help: 'Średnia wpisana wprost – ma pierwszeństwo przed średnią z trzech zdjęć.' },
      noteInput('Opis (opcjonalnie)', 'np. 16 gat./25 m²; dużo gatunków łąkowych.', 'Krótki opis, który trafi do „wartości” w karcie zamiast samej liczby.'),
    ],
    suggest: (i, ctx) => {
      const r = richnessMean(i)
      return r ? gradeRichness6230(r.mean, subalpineOf(ctx)) : null
    },
    explain: (i, ctx) => {
      const r = richnessMean(i)
      if (!r) return null
      const src = r.from === 'releves' ? `średnia z ${r.counts.length} zdjęć (${r.counts.map(plNum).join(', ')})` : 'średnia wpisana wprost'
      const belt = subalpineOf(ctx) ? 'progi dla piętra subalpejskiego (13/7)' : ctx?.site?.belt ? 'progi poza piętrem subalpejskim (25/10)' : 'piętro nie wybrane – progi poza piętrem subalpejskim (25/10)'
      return `${plNum(r.mean)} gat./25 m² – ${src}; ${belt}.`
    },
    warn: (i) => {
      const r = richnessMean(i)
      if (!r) return null
      const parts: string[] = []
      if (r.from === 'value' && r.counts.length) {
        const m = round1(r.counts.reduce((a, b) => a + b, 0) / r.counts.length)
        if (m !== r.mean) parts.push(`Średnia wpisana (${plNum(r.mean)}) różni się od średniej ze zdjęć (${plNum(m)}).`)
      }
      if (r.counts.length && r.counts.length < 3) parts.push('Metodyka: średnia z 3 zdjęć fitosocjologicznych.')
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const r = richnessMean(i)
      return r ? `${plNum(r.mean)} gat./25 m²` : ''
    },
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    description:
      'Lista inwazyjnych gatunków obcych geograficznie wraz z udziałem procentowym powierzchni zajętej przez każdy gatunek na transekcie. Murawy bliźniczkowe nie należą do siedlisk podatnych na ekspansję obcych gatunków inwazyjnych – wskaźnik wprowadzono głównie z uwagi na potencjalną możliwość ich wystąpienia.',
    help: `Co wpisać: gatunki obce z pokryciem ${SURFACE}. Najczęściej (sprawozdanie 2024, tab. 4): czeremcha amerykańska (28 stanowisk, tylko region kontynentalny), nawłocie późna i kanadyjska, łubin trwały, przymiotno kanadyjskie, naparstnica purpurowa i sit chudy (Beskid Śląski, Tatry), dąb czerwony, rudbekia naga, krzywoszczeć przywłoka; w Górach Słonnych i na Nizinie Północnopodlaskiej – żarnowiec miotlasty.

Progi (tab. 2): brak – FV; pokrycie gatunku inwazyjnego do 10% powierzchni siedliska – U1; >10% – U2. Granicę 10% formularz liczy do U1.

Jak liczy formularz: łączne pokrycie wpisane wprost albo suma z listy; gatunek bez pokrycia – U1. Rozjazdy w praktyce: 2015–2018 Maśluchy 2 – czeremcha 10% → U2, Zielona – 3 gatunki obce → U2 (tab. 2 mówi tylko o pokryciu). Sprawozdanie 2024: większość gatunków obcych notowanych po raz pierwszy (archeofity, chwasty pól, drzewa owocowe) „nie jest uznawana za inwazyjne” – formularz je nazywa w ostrzeżeniu. Karta z przewodnika (Piorunowiec): brak → FV.`,
    thresholds: { FV: 'Brak', U1: 'Pokrycie gatunku inwazyjnego do 10% powierzchni siedliska', U2: 'Pokrycie gatunku inwazyjnego >10% siedliska' },
    inputs: [
      speciesInput('Gatunki obce', `Gatunki obce z pokryciem ${SURFACE}, np. Padus serotina 2, Lupinus polyphyllus 1.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków inwazyjnych w % powierzchni siedliska na transekcie – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak gatunków obcych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków obcych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const n = distinct(rowNames(i.species)).length
      const c = coverOf(i)
      if (c === undefined) return null
      return gradeAliens6230(n, typeof c === 'number' ? c : undefined)
    },
    explain: (i) => {
      const n = distinct(rowNames(i.species)).length
      const c = coverOf(i)
      if (!n && !(typeof c === 'number' && c > 0)) return null
      return `Gatunków obcych: ${n}${typeof c === 'number' ? `; łączne pokrycie ${pct(c)}` : '; bez pokrycia'}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo pokrycie nie są puste.')
      const weak = names.filter(isWeakAlien6230)
      if (weak.length) parts.push(`Archeofity, chwasty i drzewa owocowe – sprawozdanie 2024 nie uznaje ich za inwazyjne: ${weak.join(', ')}.`)
      const native = names.filter((n) => findSpecies6230(n) && !isAlien6230(n))
      if (native.length) parts.push(`To gatunki rodzime: ${native.join(', ')}.`)
      if (names.length > 2) parts.push('Więcej niż 2 gatunki obce – w 2018 r. (Zielona) oceniono to na U2, choć tab. 2 mówi tylko o pokryciu.')
      const c = coverOf(i)
      if (c === 10) parts.push('Pokrycie dokładnie 10% – tab. 2: U1; w 2018 r. (Maśluchy 2, czeremcha 10%) – U2.')
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'expansive',
    label: 'Rodzime gatunki ekspansywne roślin zielnych',
    parameter: 'structure',
    cardinal: true,
    description:
      'Gatunki, których ekspansja prowadzi do zaburzenia struktury muraw bliźniczkowych: przede wszystkim borówka czarna Vaccinium myrtillus (najpoważniejsze i najczęstsze zagrożenie, zwłaszcza w górach), dziurawiec czteroboczny, trzcinniki, śmiałek darniowy i pogięty, mietlica pospolita, kostrzewa czerwona, kłosówka miękka, ostrożeń dwubarwny (Góry Stołowe), goryczka trojeściowa oraz jeżyny i malina.',
    help: `Co wpisać: gatunki ekspansywne z pokryciem ${SURFACE}. Na połoninach – trzcinnik leśny; na niżu – śmiałek darniowy, trzcinnik piaskowy, trzęślica, kłosówka wełnista; w Sudetach – borówki i śmiałek pogięty. Gatunki charakterystyczne (np. wrzos) formularz pomija – nie są ekspansywne w rozumieniu przewodnika (2024: uznanie wrzosu za ekspansywny we Włochowie S było błędem). Dziurawiec czteroboczny liczy się tu wszędzie poza Polygalo-Nardetum.

Progi (tab. 2, „wstępnie proponowane”): łączne pokrycie gatunków ekspansywnych <20% – FV; gatunki ekspansywne o pokryciu 20–30% – U1; >30% – U2. Granice 20% i 30% formularz liczy do U1.

Jak liczy formularz: łączne pokrycie wpisane wprost albo suma z listy (bez gatunków charakterystycznych, drzew, krzewów i gatunków obcych); „nie stwierdzono” → FV. Rozjazd: karta z przewodnika (Piorunowiec) przy borówce czarnej 30% i brusznicy 10% (łącznie 40%) daje U1 – jakby liczyła pokrycie pojedynczego gatunku; formularz liczy łącznie (jak FV w tab. 2 i sprawozdanie 2014: „pokrycie gatunków uznanych za ekspansywne przekraczało 40%” → U2) i pokazuje rozjazd. Koszenie skutecznie ogranicza borówkę (Pańska Przechybka, 2024).

Wskaźnik kardynalny – w 2024 r. najczęstsza przyczyna złej oceny struktury (region alpejski 52% U2).`,
    thresholds: { FV: 'Łączne pokrycie gatunków ekspansywnych <20%', U1: 'Obecne gatunki ekspansywne o pokryciu 20–30%', U2: 'Obecne gatunki ekspansywne o pokryciu >30%' },
    inputs: [
      speciesInput('Gatunki ekspansywne', `Rodzime gatunki ekspansywne z pokryciem ${SURFACE}, np. Vaccinium myrtillus 30, Vaccinium vitis-idaea 10.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków ekspansywnych w % transektu – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak gatunków ekspansywnych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma rodzimych gatunków ekspansywnych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Borówka czarna Vaccinium myrtillus 30%, borówka brusznica Vaccinium vitis-idaea 10%.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i, ctx) => {
      const polygalo = polygaloOf(ctx)
      const c = coverOf(i, (n) => !isCharacteristic6230(n, polygalo) && !isWoody6230(n) && !isAlien6230(n))
      if (c === undefined) return rowNames(i.species).length ? 'FV' : null
      return c === 'present' ? null : gradeExpansive6230(c)
    },
    explain: (i, ctx) => {
      const names = distinct(rowNames(i.species))
      const polygalo = polygaloOf(ctx)
      const skipped = names.filter((n) => isCharacteristic6230(n, polygalo) || isWoody6230(n) || isAlien6230(n))
      const c = coverOf(i, (n) => !isCharacteristic6230(n, polygalo) && !isWoody6230(n) && !isAlien6230(n))
      if (c === undefined && !skipped.length) return null
      return [
        skipped.length ? `Pominięte (nie są rodzimymi gatunkami ekspansywnymi): ${skipped.join(', ')}` : '',
        typeof c === 'number' ? `łączne pokrycie gatunków ekspansywnych: ${pct(c)}` : c === 'present' ? 'gatunki bez pokrycia – wpisz pokrycie' : 'gatunków ekspansywnych: brak',
      ]
        .filter(Boolean)
        .join('; ')
        .concat('.')
    },
    warn: (i, ctx) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo pokrycie nie są puste.')
      const polygalo = polygaloOf(ctx)
      const typical = names.filter((n) => isCharacteristic6230(n, polygalo))
      if (typical.some((n) => speciesKey6230(n) === 'wrzos pospolity')) parts.push('Wrzos jest gatunkiem charakterystycznym psiar (tłoki Calluno-Nardetum) – nie obniża oceny (2024, Włochów S).')
      const woody = names.filter(isWoody6230)
      if (woody.length) parts.push(`Drzewa i krzewy wpisz we wskaźniku „Ekspansja krzewów i podrostu drzew”: ${woody.join(', ')}.`)
      const alien = names.filter((n) => isAlien6230(n) && !isWoody6230(n))
      if (alien.length) parts.push(`Gatunki obce wpisz we wskaźniku „Obce gatunki inwazyjne”: ${alien.join(', ')}.`)
      const c = coverOf(i, (n) => !isCharacteristic6230(n, polygalo) && !isWoody6230(n) && !isAlien6230(n))
      const covers = speciesRows(i.species)
        .filter((r) => r.name?.trim() && !isCharacteristic6230(r.name.trim(), polygalo) && !isWoody6230(r.name.trim()) && !isAlien6230(r.name.trim()))
        .map((r) => num(r.cover))
        .filter((x): x is number => x !== undefined)
      if (typeof c === 'number' && c > 30 && covers.length > 1 && Math.max(...covers) <= 30)
        parts.push(`Łącznie ${pct(c)} (U2), ale żaden gatunek nie przekracza 30% – karta z przewodnika (Piorunowiec) w takim układzie dała U1. Zdecyduj i uzasadnij.`)
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
      'Lista gatunków krzewów i drzew wkraczających na murawy wraz z ich łącznym pokryciem na transekcie (pokrycie warstwy B), a w miarę możliwości tempo zarastania psiar. Psiary na niżu po zaprzestaniu wypasu przechodzą w bory – wtedy ocenia się udział gatunków borowych (brzoza, jałowiec, świerk, sosna, wierzby). Jałowiec pospolity stanowi znacznie mniejsze zagrożenie dla muraw niż brzoza brodawkowata czy wierzby.',
    help: `Co wpisać: drzewa i krzewy na transekcie z pokryciem ${SURFACE}; łączne pokrycie warstwy B wpisz wprost albo zostaw – formularz zsumuje listę. Najczęściej (sprawozdania 2018–2024): w Gorcach i Beskidzie Śląskim świerk, w Bieszczadach brzoza, jałowiec i wierzby (w strefie reglowej utrata struktury w ok. 20 lat), na Orawie wierzby, sosna, osika, brzoza; na niżu sosna, brzozy, kruszyna, osika, czeremcha.

Progi (tab. 2): pokrycie warstwy B „<10–25%” – FV; „(10)25–(40)50%” – U1; „>(40)50%” – U2, w zależności od tego, jakie to gatunki. Formularz: gatunki szybko zarastające (brzoza, wierzby, sosna, świerk, osika…) – <10% FV, 10–40% U1, >40% U2; sam jałowiec (mniejsze zagrożenie) – <25% FV, 25–50% U1, >50% U2. Wariant wybiera się sam z listy (sam jałowiec → łagodny) albo ręcznie.

Praktyka: 2016–2018 ocena FV do 10%, U1 do 25%, U2 od 30% (region kontynentalny: 30 do ponad 90%). Pokrycie 25–40% przy szybko zarastających gatunkach to w tab. 2 jeszcze U1 – formularz ostrzega. Karta z przewodnika (Piorunowiec): świerk, jałowiec, brzoza, wierzba iwa – znikomo, łącznie ok. 5% → FV.

Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Pokrycie warstwy B w transekcie <10–25% (w zależności od tego, jakie to gatunki)',
      U1: 'Pokrycie warstwy B (10)25–(40)50%',
      U2: 'Pokrycie warstwy B >(40)50%',
    },
    inputs: [
      speciesInput('Drzewa i krzewy', `Drzewa i krzewy wkraczające na murawę, z pokryciem ${SURFACE}, np. Picea abies 2, Betula pendula 1.`),
      totalInput('Łączne pokrycie warstwy B (opcjonalnie)', 'Sumaryczne pokrycie krzewów i podrostu drzew w % transektu – ma pierwszeństwo przed sumą z listy (np. „sumaryczne pokrycie ok. 5%”).'),
      { kind: 'select', name: 'variant', label: 'Jakie gatunki zarastają (opcjonalnie)', options: SHRUB_VARIANT, help: 'Tab. 2 uzależnia progi od gatunków. Puste – formularz wybierze sam: łagodne progi tylko wtedy, gdy na liście jest wyłącznie jałowiec.' },
      NONE_FIELD('Brak drzew i krzewów', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma krzewów ani podrostu drzew – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Świerk pospolity Picea abies (znikomo), jałowiec pospolity (znikomo)… sumaryczne pokrycie ok. 5%.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = coverOf(i)
      if (typeof c !== 'number') return null
      return gradeShrubs6230(c, shrubVariant(i).slow)
    },
    explain: (i) => {
      const c = coverOf(i)
      if (c === 'present') return 'Drzewa i krzewy bez pokrycia – wpisz pokrycie gatunków albo łączne pokrycie warstwy B.'
      if (typeof c !== 'number') return null
      const v = shrubVariant(i)
      return `Pokrycie warstwy B: ${pct(c)}; progi ${v.slow ? 'łagodne 25/50% (jałowiec)' : 'ostre 10/40%'}${v.auto ? ' – wybrane z listy' : ''}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo pokrycie nie są puste.')
      const herbs = names.filter((n) => findSpecies6230(n) && !isWoody6230(n))
      if (herbs.length) parts.push(`To nie drzewa ani krzewy: ${herbs.join(', ')}.`)
      const t = num(i.total)
      const s = sumCover(i.species)
      if (t !== undefined && typeof s === 'number' && s > t) parts.push(`Suma pokrycia gatunków (${pct(s)}) jest większa niż pokrycie łączne (${pct(t)}).`)
      const c = coverOf(i)
      if (typeof c === 'number' && !shrubVariant(i).slow && c > 25 && c <= 40) parts.push('Pokrycie 25–40%: tab. 2 – U1, ale w 2016–2018 od ok. 30% oceniano U2. Zdecyduj i uzasadnij.')
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'eutrophication',
    label: 'Eutrofizacja',
    parameter: 'structure',
    description:
      'Oznaki wzrostu żyzności siedliska, jej źródło i natężenie. Obecność gatunków nitrofilnych (perz właściwy, pokrzywa zwyczajna, szczaw alpejski), często z ruderalnymi (ostrożeń polny), zazwyczaj świadczy o nawożeniu – koszarowaniu, składowaniu obornika, zachodzących owcach, krowach czy koniach. Ocena powinna uwzględniać zmiany całkowitej liczby gatunków i proporcji gatunków muraw ubogich do gatunków łąk mezofilnych.',
    help: `Co wybrać albo wpisać: oznaki eutrofizacji na transekcie – wybór opisu albo lista gatunków nitrofilnych z pokryciem ${SURFACE}. W opisie podaj źródło (koszarowanie, nawożenie łąki obok, spływ z pól, nieuprzątnięta biomasa po koszeniu lub mulczowaniu) i natężenie.

Progi (tab. 2): brak oznak, ew. przyczyną wzrostu żyzności jest wyłącznie naturalna sukcesja, a pokrycie gatunków nitrofilnych nieznaczne – FV; obecne gatunki nitrofilne, lecz ich pokrycie <10% – U1; silna/długotrwała eutrofizacja – U2.

Jak liczy formularz: wybór ma pierwszeństwo; bez niego – suma pokrycia gatunków nitrofilnych z listy: brak („nie stwierdzono”) → FV, poniżej 10% → U1, od 10% → U2. Praktyka 2024: U1 za pokrzywę, przytulię czepną, podagrycznik, świerząbki, komosę i gatunki żyznych łąk; U2 przy nawożeniu (Bukowiec, Swojęcin, Tokary, Źródła Biebrzy) i przy silnym udziale gatunków łąkowych (Pierwsze Pola). Jeżyna nie świadczy o eutrofizacji w Beskidzie Niskim (2018), a w Gorcach znikome ślady wiązały się z wypasem owiec. Karta z przewodnika (Piorunowiec): brak → FV.`,
    thresholds: thresholdsOf(EUTRO),
    inputs: [
      optionalSelect('Eutrofizacja', EUTRO, 'Puste, gdy wystarcza lista gatunków nitrofilnych. Wybór ma pierwszeństwo przed listą.'),
      speciesInput('Gatunki nitrofilne', `Gatunki nitrofilne i ruderalne z pokryciem ${SURFACE}, np. Urtica dioica 2, Elymus repens 1.`),
      NONE_FIELD('Brak gatunków nitrofilnych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków nitrofilnych ani innych oznak eutrofizacji – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak. / Pokrzywa przy dawnym koszarze, ok. 2%.', 'Źródło i natężenie eutrofizacji – trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: (i) => {
      const chosen = gradeMap(EUTRO)[String(i.choice)]
      if (chosen) return chosen
      const c = sumCover(i.species, isNitrophilous6230)
      if (c === undefined) return rowNames(i.species).length ? null : i.none === 'yes' ? 'FV' : null
      return c === 'present' ? 'U1' : gradeEutrophication6230(c)
    },
    explain: (i) => {
      if (i.choice) return null
      const c = sumCover(i.species, isNitrophilous6230)
      if (c === undefined) return null
      return c === 'present' ? 'Gatunki nitrofilne bez pokrycia – obecne, więc co najmniej U1; wpisz pokrycie.' : `Pokrycie gatunków nitrofilnych: ${pct(c)}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && names.length) parts.push('Zaznaczono „Nie stwierdzono”, a lista nie jest pusta.')
      const other = names.filter((n) => !isNitrophilous6230(n))
      if (other.some((n) => /^rubus\b/i.test(n))) parts.push('Jeżyny i malina to w 6230 gatunki ekspansywne – o eutrofizacji świadczą nie wszędzie (2018: Beskid Niski).')
      const known = other.filter((n) => findSpecies6230(n) && !/^rubus\b/i.test(n))
      if (known.length) parts.push(`Nie są na liście gatunków nitrofilnych: ${known.join(', ')}.`)
      const chosen = gradeMap(EUTRO)[String(i.choice)]
      const c = sumCover(i.species, isNitrophilous6230)
      if (chosen && typeof c === 'number') {
        const calc = gradeEutrophication6230(c)
        if (calc !== chosen) parts.push(`Wybrano ${chosen}, a z pokrycia gatunków nitrofilnych (${pct(c)}) wychodzi ${calc} – sprawdź albo uzasadnij.`)
      }
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => note(i) || describeSpecies(speciesRows(i.species)) || (i.choice ? labelOf(EUTRO, i.choice) : i.none === 'yes' ? 'Brak' : ''),
  },
  {
    id: 'spatial',
    label: 'Struktura przestrzenna płatów siedliska',
    parameter: 'structure',
    cardinal: true,
    description:
      'Wskaźnik pozwalający na bardziej precyzyjną ocenę fragmentacji siedliska. Obejmuje oszacowanie procentowego zwarcia muraw, wielkości poszczególnych płatów bliźniczyska oraz stopnia ich rozproszenia (3 – duży, 2 – średni, 1 – mały).',
    help: `Co wybrać i wpisać: stan płatów siedliska na stanowisku i trzy elementy z karty – zwarcie muraw (%), wielkość poszczególnych płatów (np. „przeważnie znacznie powyżej 1000 m²”) i stopień rozproszenia (1 – mały, 2 – średni, 3 – duży).

Progi (tab. 2): płaty siedliska zwarte i rozległe albo siedlisko z natury drobnopowierzchniowe, lecz wielkość płatów stabilna – FV; stan pośredni – U1; skrajnie małe (poniżej 1 ara) i izolowane płaty – U2. Sprawozdanie 2024 dawało U2 także tam, gdzie siedlisko zanikło lub zostało zniszczone – to osobna opcja.

Praktyka: w Tatrach fragmentację bywa naturalna (bloki skalne na transekcie) – nie obniża oceny; mozaika z wrzosowiskiem, której nie da się rozdzielić, to FV (2024: Włochów S i N); fragmentacja przez borówczyska, zarośla, ekspansję roślinności łąkowej – U1/U2. Najgorzej oceniany wskaźnik kardynalny 2024 (region alpejski 58% U2). Karta z przewodnika (Piorunowiec): zwarcie 95–100%, płaty przeważnie znacznie powyżej 1000 m², fragmentacja nieznaczna (borówczyska), ale murawa po latach bez użytkowania zbyt zwarta dla roślin światłożądnych → U1.

Wskaźnik kardynalny.`,
    thresholds: thresholdsOf(SPATIAL),
    inputs: [
      selectInput('Struktura przestrzenna', SPATIAL),
      { kind: 'number', name: 'closure', label: 'Zwarcie muraw (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Procentowe zwarcie muraw na transekcie (karta z przewodnika: ok. 95–100%).' },
      { kind: 'text', name: 'patchSize', label: 'Wielkość płatów (opcjonalnie)', placeholder: 'np. przeważnie znacznie powyżej 1000 m²', help: 'Wielkość poszczególnych płatów bliźniczyska, np. „przeważnie znacznie powyżej 1000 m²”, „kilka płatów po 2–5 arów”. Płaty poniżej 1 ara to próg U2.' },
      { kind: 'select', name: 'fragmentation', label: 'Stopień rozproszenia (opcjonalnie)', options: FRAGMENTATION, help: 'Ocena stopnia rozproszenia płatów wg karty: 3 – duży, 2 – średni, 1 – mały (nieznaczny).' },
      noteInput('Opis (opcjonalnie)', 'np. Bliźniczyska są nieznacznie rozfragmentowane, przede wszystkim płatami borówczysk…', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(SPATIAL)),
    warn: (i) => {
      const g = gradeMap(SPATIAL)[String(i.choice)]
      if (!g) return null
      const parts: string[] = []
      if (g === 'FV' && i.fragmentation === '3') parts.push('Wybrano FV, a stopień rozproszenia płatów jest duży (3) – sprawdź albo uzasadnij.')
      if (g === 'U2' && i.choice === 'tiny' && i.fragmentation === '1') parts.push('Wybrano skrajnie małe i izolowane płaty, a stopień rozproszenia jest mały (1) – sprawdź.')
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const parts = [
        num(i.closure) !== undefined ? `Zwarcie muraw ok. ${pct(num(i.closure)!)}` : '',
        String(i.patchSize ?? '').trim() ? `wielkość płatów: ${String(i.patchSize).trim()}` : '',
        i.fragmentation ? `stopień rozproszenia: ${labelOf(FRAGMENTATION, i.fragmentation)}` : '',
      ].filter(Boolean)
      return parts.length ? parts.join('; ') : labelOf(SPATIAL, i.choice)
    },
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu, z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie.

Dlaczego: w 2013–2014 na kilku stanowiskach (Piorunowiec, Pańska Przechybka, Góry Kamienne) nowy ekspert bez dokładnych współrzędnych wytyczył transekty gdzie indziej – wyników nie dało się porównać, a w Górach Kamiennych transekty trafiły tam, gdzie siedliska nie było.`

const siteFields: FieldDef[] = [
  {
    kind: 'select',
    name: 'subtype',
    label: 'Podtyp siedliska',
    options: SUBTYPE_OPTIONS,
    required: true,
    hint: 'Karta z przewodnika: „6230-2 Zachodniokarpackie murawy bliźniczkowe”.',
    help: `Podtyp siedliska na stanowisku (sprawozdanie 2006–2008, karta przykładowa):
• 6230-1 – bieszczadzkie (wschodniokarpackie) murawy bliźniczkowe, m.in. bliźniczysko połoninowe Hypochoeridi uniflorae-Nardetum;
• 6230-2 – zachodniokarpackie murawy bliźniczkowe: psiara reglowa Hieracio vulgati-Nardetum, tatrzańska psiara wysokogórska Hieracio alpini-Nardetum;
• 6230-3 – sudeckie murawy bliźniczkowe, w tym karkonoska psiara wysokogórska Carici rigidae-Nardetum;
• 6230-4 – niżowe murawy bliźniczkowe (Violion caninae): Polygalo-Nardetum, Nardo-Juncetum squarrosi, Calluno-Nardetum, Gentiano pneumonanthes-Nardetum.

Dlaczego: karta przykładowa podaje podtyp obok kodu, a od regionu zależą gatunki charakterystyczne i dominujące.`,
  },
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Piorunowiec',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – polana, hala, wierch albo miejscowość, np. „Piorunowiec”, „Hala Ostre 1”, „Ubocze i Róweń pod Połoniną Wetlińską”, „Włochów S”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego stanowiska. Za stanowisko uznaje się wyodrębniający się przestrzennie płat siedliska (polana, fragment kompleksu łąk).`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. referencyjne',
    help: `Typ stanowiska w sieci monitoringu, np. „referencyjne” (karta z przewodnika: Piorunowiec – jeden z najlepiej zachowanych płatów psiary reglowej w Gorcach), „badawcze”, „uzupełniające”. Jeśli nie wiesz, zostaw puste.

Dlaczego: stanowiska referencyjne są punktem odniesienia przy ocenie regionu.`,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Psiara reglowa Hieracio vulgati-Nardetum',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Klasa Nardo-Callunetea, rząd Nardetalia. Związek Nardion: Hieracio (vulgati)-Nardetum – psiara reglowa, Hieracio (alpini)-Nardetum – tatrzańska psiara wysokogórska, Carici (rigidae)-Nardetum – karkonoska psiara wysokogórska, Hypochoeridi uniflorae-Nardetum – bliźniczysko połoninowe, zbiorowisko z Nardus stricta. Związek Violion caninae: Polygalo-Nardetum – sucha psiara krzyżownicowa, Nardo-Juncetum squarrosi – mokra psiara, Calluno-Nardetum – tłoki; wg sprawozdania 2024 także Gentiano pneumonanthes-Nardetum (Wielkopolska, lubuskie).

Uwaga: wpisanie Polygalo-Nardetum sprawia, że dziurawiec czteroboczny liczy się jako gatunek charakterystyczny.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 6,
    required: true,
    hint: 'Położenie (polana, grzbiet, hala, piaski), ekspozycja i nachylenie, użytkowanie, zarastanie, mozaika z innymi zbiorowiskami.',
    help: `Krótka charakterystyka stanowiska:
• położenie: polana reglowa, partia przygrzbietowa, hala, połonina, piaszczyste wzniesienie, obrzeże torfowiska; ekspozycja i nachylenie (bliźniczyska do ok. 45°, najczęściej wypłaszczenia i połogie stoki);
• użytkowanie: wypas (czym, jak intensywnie), koszenie z usuwaniem biomasy, porzucenie;
• zarastanie: borówka, trzcinnik, świerk, brzoza, wierzby, jałowiec;
• mozaika z łąkami, ziołoroślami, borówczyskami, wrzosowiskami, torfowiskami;
• zagrożenia: zalesianie, zabudowa, nawożenie, intensyfikacja.`,
  },
  {
    kind: 'text',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    required: true,
    placeholder: 'np. ok. 25',
    help: 'Łączna powierzchnia płatów siedliska na stanowisku, w hektarach albo opisem (karta z przewodnika: „ok. 25 ha”). Sprawozdanie 2024: w Karpatach zwykle do 50 arów, na 12 stanowiskach poniżej 6 arów; w regionie kontynentalnym często powyżej 1 ha.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „PLH120018 Ostoja Gorczańska; Gorczański Park Narodowy”. Brak – „brak”.',
    help: `Obszar Natura 2000 i inne formy ochrony obejmujące stanowisko (park narodowy lub krajobrazowy, rezerwat). Większość stanowisk PMŚ leży w obszarach Natura 2000, m.in. PLC120001 Tatry, PLH120018 Ostoja Gorczańska, PLC180001 Bieszczady, PLH240005 Beskid Śląski, PLH240006 Beskid Żywiecki, PLH120016 Torfowiska Orawsko-Nowotarskie, PLH020004 Góry Stołowe, PLH020038 Góry Kamienne, PLH200023 Dolina Pisy, PLH060043 Lasy Sobiborskie.

Dlaczego: poza nielicznymi wyjątkami (Gorczański, Magurski, Narwiański PN) położenie na obszarze chronionym nie przekłada się na skuteczną ochronę psiar (2024) – trzeba to uwzględnić w perspektywach.`,
  }),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. teren prywatny',
    help: `Kto zarządza terenem: właściciele prywatni, park narodowy lub krajobrazowy, Lasy Państwowe, wspólnota, gmina. Siedlisko występuje w przewadze na gruntach prywatnych (2018: 67 ze 110 stanowisk).

Dlaczego: od właściciela zależy, czy murawa będzie wypasana albo koszona – najważniejszy czynnik dla 6230.`,
  },
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    defaultValue: '10x200 m',
    required: true,
    hint: 'Transekt 20 arów, standardowo pas 10×200 m.',
    help: `Ocenę wskaźników struktury i funkcji przeprowadza się na transekcie o powierzchni 20 arów – standardowo pas długości 200 m i szerokości 10 m. Gdy płaty muraw są bardzo niewielkie i rozproszone, kształt transektu może być inny, dostosowany do rozmieszczenia siedliska – o przebiegu i kształcie decyduje ekspert (opisz w uwagach). Zdjęcia fitosocjologiczne: na przeciwległych końcach i w środku transektu.`,
    warn: (v) => {
      const m = String(v ?? '').replace(/,/g, '.').match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/)
      if (!m) return null
      const a = Number(m[1]) * Number(m[2])
      return Math.abs(a - 2000) < 1 ? null : `${plNum(a)} m² – metodyka: transekt 20 arów (standardowo 10×200 m). Opisz odstępstwo w uwagach.`
    },
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    help: 'Wysokość nad poziomem morza transektu (albo zakres), z GPS albo mapy (karta z przewodnika: 1070 m). Psiary sięgają do ok. 1500 m n.p.m. w Sudetach i 1800 m n.p.m. w Karpatach.',
  },
  {
    kind: 'select',
    name: 'belt',
    label: 'Piętro roślinności',
    options: BELT_OPTIONS,
    required: true,
    hint: 'Od piętra zależą progi „Bogactwa gatunkowego” (subalpejskie: 13/7 gatunków).',
    help: `Piętro roślinności, w którym leży transekt: niż i wyżyny, pogórze, piętro reglowe (polany reglowe, połoniny poniżej granicy lasu), piętro subalpejskie (psiary wysokogórskie Tatr – Hieracio alpini-Nardetum, Karkonoszy – Carici rigidae-Nardetum).

Dlaczego: modyfikacja metodyki z 2015 r. ma osobne progi bogactwa gatunkowego dla piętra subalpejskiego (FV >13, U1 7–13, U2 <7 gatunków/25 m²), bo psiary wysokogórskie są z natury ubogie florystycznie.`,
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 17.08.2007',
    required: true,
    hint: 'Optymalnie od połowy lipca do końca sierpnia.',
    help: `Dzień badań terenowych. Optymalny termin: od połowy lipca do końca sierpnia, gdy znaczna część gatunków jest w optimum kwitnienia. Prace w późniejszym czasie (wrzesień) są możliwe, ale trzeba się liczyć z problemami przy identyfikacji turzycowatych, traw i storczykowatych oraz ocenie ich pokrycia. W praktyce: 2017 – od 3 czerwca, 2018 – 17 czerwca – 31 sierpnia, 2024 – 16 czerwca – 12 września (bardzo ciepła wiosna, przyspieszona fenologia).

Obserwacje powtarza się co 5–6 lat (przewodnik); karta przykładowa: na stanowisku referencyjnym co ok. 3–5 lat.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const [, mm, dd] = v.split('-').map(Number)
      const md = mm * 100 + dd
      return md >= 715 && md <= 831 ? null : 'Termin poza optymalnym oknem (połowa lipca – koniec sierpnia). Przy wczesnej fenologii (jak w 2024 r.) albo we wrześniu opisz powód w uwagach.'
    },
  },
  pickField(methodology7120.siteFields, 'observer', {
    help: `Imię i nazwisko eksperta, który wykonał obserwację i odpowiada za dane (w karcie z przewodnika – „Koordynator”).

Dlaczego: ocena części wskaźników (gatunki dominujące, struktura przestrzenna, eutrofizacja) jest ekspercka – trzeba wiedzieć, kogo zapytać o uzasadnienie.`,
  }),
  {
    kind: 'text',
    name: 'additionalExperts',
    label: 'Dodatkowi koordynatorzy',
    placeholder: 'np. —',
    help: 'Osoby, które brały udział w badaniu poza wykonawcą (koordynatorem). Brak – zostaw puste albo wpisz „—”.',
  },
]

// ---------- zdjęcia fitosocjologiczne: 3 × 25 m² ----------

const r7120 = methodology7120.releves.fields
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia. Trzy zdjęcia po 25 m²: na przeciwległych końcach transektu i w jego centralnej części.' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach (karta z przewodnika: 1040 m).' }),
  pickField(r7120, 'area', {
    defaultValue: 25,
    help: 'Powierzchnia zdjęcia w m² – przewodnik: 25 m². Na tej powierzchni liczy się też „Bogactwo gatunkowe”.',
    warn: (v) => {
      const a = num(v)
      return a !== undefined && a !== 25 ? 'Metodyka: zdjęcie 25 m² – bogactwo gatunkowe liczy się na 25 m². Opisz odstępstwo w uwagach.' : null
    },
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach (karta z przewodnika: 5–15°). Bliźniczyska zajmują miejsca o nachyleniu do ok. 45°.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, NW). Psiary nie wykazują preferencji co do ekspozycji. Dla powierzchni płaskiej wpisz „brak”.' }),
  layerField('coverA', 'Warstwa A – drzewa: procent powierzchni zdjęcia. W murawie zwykle brak – zostaw puste.'),
  layerField('coverB', 'Warstwa B – krzewy i podrost drzew: procent powierzchni zdjęcia (karta z przewodnika: 2–5%).\n\nDlaczego: pokrycie warstwy B to wskaźnik kardynalny „Ekspansja krzewów i podrostu drzew”.'),
  layerField('coverC', 'Warstwa C – zielna i krzewinki: procent powierzchni zdjęcia (karta z przewodnika: 100%).'),
  layerField('coverD', 'Warstwa D – mchy i porosty: procent powierzchni zdjęcia (karta z przewodnika: 2–30%).'),
  layerField('heightA', 'Warstwa A – typowa wysokość drzew, w metrach. Zwykle brak.'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów i podrostu, w metrach (karta z przewodnika: 0,8–2 m).'),
  layerField('heightC', 'Warstwa C – typowa wysokość runi, w centymetrach (karta z przewodnika: 15–20 cm).'),
  layerField('heightD', 'Warstwa D – wysokość mchów i porostów, w centymetrach.'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Hieracio vulgati-Nardetum',
    help: 'Jednostka fitosocjologiczna zdjęcia, np. Hieracio vulgati-Nardetum, Hypochoeridi uniflorae-Nardetum, Carici rigidae-Nardetum, Polygalo-Nardetum, Nardo-Juncetum squarrosi, Calluno-Nardetum.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w poletku z ilościowością w skali Braun-Blanqueta (r, +, 1–5): warstwa B – krzewy i podrost, C – zielna, D – mszaki i porosty. Gatunki o ilościowości 3 i więcej to dominanty – wpisz je też we wskaźniku „Gatunki dominujące”; liczbę gatunków naczyniowych – w „Bogactwie gatunkowym”. Warstwa podpowiada się sama po wyborze gatunku.',
  }),
]

export const methodology6230: Methodology = {
  code: '6230',
  name: 'Bogate florystycznie górskie i niżowe murawy bliźniczkowe (Nardetalia – płaty bogate florystycznie)',
  priority: true,
  source:
    'Korzeniak J. 2010, 6230* Bogate florystycznie górskie i niżowe murawy bliźniczkowe (Nardetalia – płaty bogate florystycznie), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ, s. 130–145 (tab. 1 i 2); modyfikacja metodyki GIOŚ z 17.07.2015 (gatunki dominujące, bogactwo gatunkowe); praktyka oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014, 2015–2018 i 2023–2025.',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj 3 zdjęcia fitosocjologiczne po 25 m² – na przeciwległych końcach transektu i w jego centralnej części – w skali Braun-Blanqueta. Ze zdjęć bierzesz gatunki dominujące (ilościowość 3 i więcej) i bogactwo gatunkowe (średnia liczba gatunków naczyniowych na 25 m²).',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Realne możliwości zachowania właściwego stanu siedliska oraz poprawy stanu niewłaściwego, z informacją o potencjalnych zabiegach ochronnych. Oprócz aktualnego stanu ochrony (obecność na obszarze chronionym, zapisy w planach i operatach ochrony) i oddziaływań biotycznych i antropogenicznych uwzględnia się stan zachowania siedliska – wysokie oceny powierzchni i struktury powinny rzutować na wyższą ocenę perspektyw.',
    help: `Weź pod uwagę: czy murawa jest i będzie wypasana albo koszona (z usuwaniem biomasy), szanse na pasterskie użytkowanie (programy „Owca Plus”, działania parków), tempo sukcesji (borówka, trzcinnik, świerk, brzoza, wierzby), wysokość n.p.m. (w surowym klimacie przemiany są wolniejsze – psiary subalpejskie Tatr i Karkonoszy mają lepsze perspektywy), zalesianie, zabudowę, nawożenie i intensyfikację, gatunki obce (czeremcha).

Przewodnik (pkt 5): zachowanie siedliska wymaga ochrony czynnej – ekstensywnego wypasu lub koszenia ograniczającego sukcesję bez wzrostu trofii; koszenie eliminuje borówkę czarną. Mulczowanie bez późniejszego koszenia z usunięciem siana zwiększa żyzność (2018).

Praktyka 2024: FV – stanowiska wypasane (Jamne) lub koszone z usuwaniem biomasy (Ciechania W, Roztoki Górne, Pańska Przechybka, Jankówki) i dobrze zachowane psiary subalpejskie (Dolina Pięciu Stawów, Czarna Skała); U2 – zagrożenie przemianami sukcesyjnymi (56% stanowisk w Karpatach).`,
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
    { code: 'A04.01', name: 'Wypas intensywny' },
    { code: 'A04.02', name: 'Wypas nieintensywny' },
    { code: 'A04.03', name: 'Zarzucenie pasterstwa, brak wypasu' },
    { code: 'A07', name: 'Stosowanie biocydów, hormonów i środków chemicznych' },
    { code: 'A08', name: 'Nawożenie' },
    { code: 'B01', name: 'Zalesianie terenów otwartych' },
    { code: 'B01.01', name: 'Zalesianie terenów otwartych (drzewa rodzime)' },
    { code: 'B01.02', name: 'Sztuczne nasadzenia na terenach otwartych (drzewa nierodzime)' },
    { code: 'B02', name: 'Gospodarka leśna' },
    { code: 'C01.01', name: 'Wydobywanie piasku i żwiru' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D01.02', name: 'Drogi, autostrady' },
    { code: 'E01', name: 'Tereny zurbanizowane, tereny zamieszkane' },
    { code: 'E01.03', name: 'Zabudowa rozproszona' },
    { code: 'F04', name: 'Pozyskiwanie / usuwanie roślin lądowych, ogólnie' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G02.10', name: 'Inne kompleksy sportowe i rekreacyjne' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02.01', name: 'Zasypywanie i osuszanie lądu' },
    { code: 'J02.06', name: 'Pobór wód powierzchniowych' },
    { code: 'K01.03', name: 'Wyschnięcie' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.02', name: 'Nagromadzenie materii organicznej' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'K04', name: 'Interakcje międzygatunkowe wśród flory' },
    { code: 'U', name: 'Nieznane zagrożenie lub nacisk' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: [
    ...methodology7120.otherFields.flatMap((f): FieldDef[] => {
      if (f.name === 'otherValues')
        return [
          {
            ...f,
            hint: 'Np. rzadkie gatunki wysokogórskie, storczyki, arnika, sąsiedztwo 6520, 7140, 4030.',
            help: 'Wartości przyrodnicze stanowiska poza samą murawą: rzadkie i chronione gatunki (arnika górska, podejźrzony, gołek białawy, ozorka zielona, goryczki, storczyki), sąsiednie siedliska (6520 łąki konietlicowe, 6510 łąki świeże, 4030 wrzosowiska, 7140 torfowiska przejściowe, 6150 murawy wysokogórskie), funkcja ostoi. Karta z przewodnika: „Potencjalne siedlisko dla rzadkich w Gorcach gatunków roślin wysokogórskich”. Brak – „Nie stwierdzono”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            help: 'Jakie zabiegi wykonano i z jakim skutkiem: wypas (owce, kozy, bydło; jak intensywny), koszenie z usuwaniem biomasy (termin, czy całość płatu), wycinka podrostu świerka, usuwanie krzewów, koszenie borówczysk, mulczowanie. Karta z przewodnika: „Brak (koszenie tylko niewielkiej części płatu, poza transektem)”. Brak działań – „Brak”.',
          },
          {
            kind: 'textarea',
            name: 'proposals',
            label: 'Propozycje wprowadzenia działań ochronnych',
            rows: 3,
            hint: 'Np. systematyczne koszenie w drugiej połowie lata, ekstensywny wypas owiec.',
            help: 'Jakie działania proponujesz: regularny ekstensywny wypas (owce, kozy, rzadziej bydło) z wykaszaniem niedojadów, koszenie raz w roku w drugiej połowie lata lub jesienią z usunięciem biomasy, wycinka podrostu drzew, koszenie płatów borówki, rezygnacja z nawożenia i mulczowania. Karta z przewodnika: „Systematyczne koszenie odbywające się najlepiej w drugiej połowie lata lub nawet na jesieni”.',
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
            help: 'Karta z przewodnika podaje przy ocenie ogólnej udział procentowy powierzchni siedliska o różnym stanie zachowania na całym stanowisku, w stosunku do całkowitej powierzchni siedliska (Piorunowiec: FV 40%, U1 55%, U2 5%). Trzy liczby powinny dać razem 100%.',
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
            help: `${f.help ?? ''}\n\nDla 6230 zapisz tu także: rok i typ monitoringu, czy monitoring jest wymagany i z jakim uzasadnieniem (pola karty z przewodnika), odstępstwa od kształtu transektu, przyczyny badań poza optymalnym terminem.`.trim(),
          },
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_6230.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer6230(s) })),
  speciesInfo: (name) => {
    const s = findSpecies6230(name)
    if (!s) return undefined
    if (s.group === 'characteristic') return `${GROUP_LABELS_6230.characteristic}${s.source === 'report' ? ' – wg sprawozdań' : ''}`
    if (speciesKey6230(name) === 'dziurawiec czteroboczny') return `${GROUP_LABELS_6230.expansive} (charakterystyczny tylko w Polygalo-Nardetum)`
    if (s.group === 'alien') return s.weak ? `${GROUP_LABELS_6230.alien} (archeofit, chwast lub drzewo owocowe – nie inwazyjny)` : GROUP_LABELS_6230.alien
    if (s.group === 'woody' && s.slow) return `${GROUP_LABELS_6230.woody} – mniejsze zagrożenie`
    if (s.nitro) return `${GROUP_LABELS_6230[s.group]}, nitrofilny`
    return GROUP_LABELS_6230[s.group]
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator6230 = (id: string): IndicatorDef => {
  const i = methodology6230.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 6230`)
  return i
}
