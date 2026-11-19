// Metodyka 7210 (torfowiska nakredowe: Cladietum marisci, Caricetum buxbaumii, Schoenetum nigricantis) jako dane.
// Źródło: Buczek A. 2010, „7210 Torfowiska nakredowe (Cladietum marisci, Caricetum buxbaumii, Schoenetum nigricantis)”
// [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ, s. 161–173 (tab. 1 i 2,
// lista wskaźników kardynalnych, karta „Rezerwat Bagno Serebryskie 2”), z praktyką oceny ze sprawozdań z monitoringu
// 2006–2008, 2013–2014, 2015–2018 (badania 2018) i 2023–2025 (badania 2024). Przy rozjazdach pierwszeństwo ma tab. 2,
// a praktyka trafia do pomocy i ostrzeżeń. Gdy tab. 2 sama sobie przeczy (trzcina, uwodnienie pozostałych zespołów) –
// tab. 1 i poprawka ze sprawozdania 2016–2018.
// Siedlisko niepriorytetowe, wyłącznie region kontynentalny (7210-1). Transekt 10×200 m, zdjęcia fitosocjologiczne,
// poziom wody latem w pięciu punktach co 50 m. Progi zwarcia i uwodnienia zależą od zespołu – wybór w „Stanowisku”.
// Struktura i ocena ogólna – reguły silnika (tab. 2 7210 mówi to samo).
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, mean, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_7210,
  SPECIES_7210,
  defaultLayer7210,
  expansiveKind7210,
  findSpecies7210,
  isAlien7210,
  isCharacteristic7210,
  isExpansive7210,
  isSchoenus7210,
  isSynanthropic7210,
  isWoody7210,
  speciesKey7210,
} from './species'

// ---------- zespoły (progi zwarcia, uwodnienia i gatunków charakterystycznych) ----------

export const ASSOCIATIONS_7210 = ['cladietum', 'buxbaumii', 'schoenetum', 'ferruginei'] as const
export type Association7210 = (typeof ASSOCIATIONS_7210)[number]
export const ASSOCIATION_LABELS_7210: Record<Association7210, string> = {
  cladietum: 'Cladietum marisci – szuwar kłoci wiechowatej',
  buxbaumii: 'Caricetum buxbaumii – szuwar turzycy Buxbauma',
  schoenetum: 'Schoenetum nigricantis – zespół marzycy czarniawej',
  ferruginei: 'Schoenetum ferruginei – zespół marzycy rudej',
}
const ASSOCIATION_OPTIONS: SelectOption[] = [{ value: '', label: '—' }, ...ASSOCIATIONS_7210.map((a) => ({ value: a, label: ASSOCIATION_LABELS_7210[a] }))]

/** Zespół wybrany w „Stanowisku”; bez wyboru – Cladietum marisci (najczęstszy, w 2024 r. zwykle jedyny). */
export const associationOf = (ctx?: IndicatorContext): Association7210 => {
  const a = String(ctx?.site?.association ?? '')
  return (ASSOCIATIONS_7210 as readonly string[]).includes(a) ? (a as Association7210) : 'cladietum'
}
const associationChosen = (ctx?: IndicatorContext) => (ASSOCIATIONS_7210 as readonly string[]).includes(String(ctx?.site?.association ?? ''))
const isCladium = (a: Association7210) => a === 'cladietum'
const assocNote = (ctx?: IndicatorContext) => (associationChosen(ctx) ? '' : ' Zespołu nie wybrano w „Stanowisku” – przyjęto Cladietum marisci.')

// ---------- progi liczbowe (tab. 2) ----------

/** Udział procentowy siedliska na transekcie: min. 70% FV; 40–70% U1; poniżej 40% U2. */
export const gradeShare7210 = (share: number): Grade => (share >= 70 ? 'FV' : share >= 40 ? 'U1' : 'U2')

/**
 * Gatunki charakterystyczne. Tab. 2 bez liczb: „znaczący udział” – FV, „wypierane przez inne gatunki” – U1, „sporadyczny
 * udział” – U2. Interpretacja: łączne pokrycie gatunków charakterystycznych co najmniej jak próg FV zwarcia (40% dla kłoci,
 * 30% dla pozostałych) – FV; od 1% – U1; poniżej 1% (pojedyncze) albo brak – U2. W Schoenetum nigricantis sama marzyca
 * bez lipiennika i storczyka błotnego – najwyżej U1 (tab. 2, kolumna U1, pkt 1).
 */
export function gradeCharacteristic7210(cover: number, association: Association7210 = 'cladietum', onlySchoenus = false): Grade {
  if (cover < 1) return 'U2'
  const fv = cover >= (isCladium(association) ? 40 : 30)
  if (!fv) return 'U1'
  return association === 'schoenetum' && onlySchoenus ? 'U1' : 'FV'
}

/**
 * Gatunki dominujące: udział gatunków charakterystycznych w łącznym pokryciu dominantów. Tab. 2 nie podaje liczb –
 * „dominacja” = co najmniej 60%, „współdominacja” = 40–60%, „dominacja innych” = poniżej 40%. To interpretacja, nie norma.
 */
export const gradeDominant7210 = (share: number): Grade => (share >= 60 ? 'FV' : share >= 40 ? 'U1' : 'U2')

/** Obce gatunki inwazyjne i synantropijne: brak – FV; do 5% – U1 (obecne bez pokrycia też); powyżej 5% – U2. */
export function gradePresence7210(cover: number, present = cover > 0): Grade {
  if (!present && cover <= 0) return 'FV'
  return cover <= 5 ? 'U1' : 'U2'
}

/** Trzęślica modra: do 5% FV; 5–15% U1; powyżej 15% U2. */
export const gradeMolinia7210 = (cover: number): Grade => (cover <= 5 ? 'FV' : cover <= 15 ? 'U1' : 'U2')

/**
 * Trzcina pospolita, turzyca sztywna, turzyca nitkowata (każdy gatunek osobno): do 20% FV; 20–30% U1; powyżej 30% U2.
 * Tab. 1 i kolumna dla turzyc w tab. 2; dla trzciny tab. 2 pisze „U1 – udział 20%, U2 – powyżej 20%” (U1 bez przedziału).
 */
export const gradeReed7210 = (cover: number): Grade => (cover <= 20 ? 'FV' : cover <= 30 ? 'U1' : 'U2')

/** Zwarcie szuwarów: kłoć – co najmniej 40% FV, 20–40% U1; pozostałe – co najmniej 30% FV, 20–30% U1; poniżej 20% – U2. */
export const gradeDensity7210 = (density: number, association: Association7210 = 'cladietum'): Grade =>
  density >= (isCladium(association) ? 40 : 30) ? 'FV' : density >= 20 ? 'U1' : 'U2'

/** Krzewy i podrost drzew: pojedyncze (poniżej 5%) – FV; 5–10% U1; powyżej 10% U2. */
export const gradeWoody7210 = (cover: number): Grade => (cover < 5 ? 'FV' : cover <= 10 ? 'U1' : 'U2')

/**
 * Stopień uwodnienia – poziom wody latem względem powierzchni torfu, w cm (nad powierzchnią dodatni, pod – ujemny):
 * 0–20 cm nad (kłoć) albo 0–10 cm nad (pozostałe) – FV; do 20 cm pod powierzchnią albo za wysoko do 30 cm nad – U1;
 * głębiej niż 20 cm pod albo ponad 30 cm nad – U2.
 */
export function gradeHydration7210(level: number, association: Association7210 = 'cladietum'): Grade {
  if (level < -20 || level > 30) return 'U2'
  if (level < 0) return 'U1'
  return level <= (isCladium(association) ? 20 : 10) ? 'FV' : 'U1'
}

/** Zniszczenia mechaniczne (tab. 2): do 5% powierzchni FV; do 10% U1; powyżej 10% U2. */
export const gradeDamage7210 = (damaged: number): Grade => (damaged <= 5 ? 'FV' : damaged <= 10 ? 'U1' : 'U2')

const pct = (v: number) => `${plNum(v)}%`
const round1 = (n: number) => Math.round(n * 10) / 10
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey7210(n), n])).values()]

/** Suma pokrycia wierszy listy spełniających warunek; 'present' – są wiersze, ale bez pokrycia; undefined – brak wierszy. */
function sumCover(list: unknown, pred: (name: string) => boolean = () => true): number | 'present' | undefined {
  const rows = speciesRows(list).filter((r) => r.name?.trim() && pred(r.name.trim()))
  if (!rows.length) return undefined
  const covers = rows.map((r) => num(r.cover)).filter((c): c is number => c !== undefined)
  return covers.length ? round1(covers.reduce((a, b) => a + b, 0)) : 'present'
}

const worst = (grades: Grade[]): Grade | null => (grades.includes('U2') ? 'U2' : grades.includes('U1') ? 'U1' : grades.length ? 'FV' : null)

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Powierzchnia nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'minor', label: 'Inne kombinacje (np. niewielki ubytek, zarastanie brzegów płatu)', grade: 'U1' },
  { value: 'decrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const DAMAGE_ORIGIN: SelectOption[] = [
  { value: '', label: '—' },
  { value: 'none', label: 'Nie stwierdzono' },
  { value: 'natural', label: 'Naturalne (bobry, zwierzęta kopytne – ścieżki, wydeptywanie)' },
  { value: 'human', label: 'Antropogeniczne (wędkarze, ciężki sprzęt, koszenie w złej porze, wypas)' },
]
const POLLUTION: GradedOption[] = [
  { value: 'none', label: 'Nie stwierdzono zanieczyszczenia pestycydami ani przenawożenia', grade: 'FV' },
  { value: 'present', label: 'Objawy zanieczyszczenia lub przenawożenia (wskaźnik bez waloryzacji – XX)', grade: 'XX' },
  { value: 'unknown', label: 'Nie da się ustalić', grade: 'XX' },
]

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
  options: [{ value: '', label: '—' }, ...(['FV', 'U1', 'U2'] as const).map((g) => ({ value: g, label: g })), { value: 'XX', label: 'XX – nie oceniono' }],
  help,
})
const chosenGrade = (i: InputValues): Grade | null => {
  const g = String(i.choice ?? '')
  return g === 'FV' || g === 'U1' || g === 'U2' || g === 'XX' ? g : null
}
const mismatch = (chosen: Grade | null, calc: Grade | null, what: string) =>
  chosen && chosen !== 'XX' && calc && chosen !== calc ? `Wybrano ${chosen}, a z ${what} wychodzi ${calc} – uzasadnij w opisie.` : null

const totalInput = (label: string, help: string): FieldDef => ({ kind: 'number', name: 'total', label, unit: '%', min: 0, max: 100, help })

const describeList = (i: InputValues) => {
  if (note(i)) return note(i)
  const list = describeSpecies(speciesRows(i.species))
  const t = num(i.total)
  if (list) return t !== undefined ? `${list} – łącznie ${pct(t)}` : list
  if (t !== undefined) return `Łącznie ${pct(t)}`
  return i.none === 'yes' ? 'Nie stwierdzono' : ''
}

/** Wskaźnik „lista + łączne + nie stwierdzono” z progiem brak/do 5%/powyżej 5% (obce, synantropijne). */
function presenceSuggest(i: InputValues, pred: (n: string) => boolean): Grade | null {
  const present = rowNames(i.species).length > 0
  const t = num(i.total)
  if (t !== undefined) return gradePresence7210(t, present || t > 0)
  if (!present) return i.none === 'yes' ? 'FV' : null
  const c = sumCover(i.species, pred)
  if (c === undefined) return 'FV'
  return gradePresence7210(typeof c === 'number' ? c : 0, true)
}
function presenceExplain(i: InputValues, what: string, pred: (n: string) => boolean): string | null {
  const t = num(i.total)
  if (t !== undefined) return `Łączne pokrycie ${what}: ${pct(t)}.`
  const names = distinct(rowNames(i.species).filter(pred))
  if (!names.length) return null
  const c = sumCover(i.species, pred)
  return c === 'present' ? `Gatunków: ${names.length}, bez pokrycia – liczę jak pojedyncze pędy (U1).` : `Gatunków: ${names.length}; łączne pokrycie ${pct(c as number)}.`
}
const noneConflict = (i: InputValues) => (i.none === 'yes' && (rowNames(i.species).length || (num(i.total) ?? 0) > 0) ? 'Zaznaczono „Nie stwierdzono”, a lista albo pokrycie nie są puste.' : null)

// ---------- gatunki charakterystyczne ----------

const characteristicNames = (i: InputValues) => distinct(rowNames(i.species).filter(isCharacteristic7210))
function characteristicCover(i: InputValues): number | undefined {
  const t = num(i.total)
  if (t !== undefined) return t
  const c = sumCover(i.species, isCharacteristic7210)
  if (c === undefined) return rowNames(i.species).length || i.none === 'yes' ? 0 : undefined
  return typeof c === 'number' ? c : undefined
}
const onlySchoenus = (i: InputValues) => {
  const names = characteristicNames(i)
  return names.length > 0 && names.every(isSchoenus7210)
}
const characteristicCalc = (i: InputValues, ctx?: IndicatorContext): Grade | null => {
  const c = characteristicCover(i)
  return c === undefined ? null : gradeCharacteristic7210(c, associationOf(ctx), onlySchoenus(i))
}

// ---------- gatunki dominujące ----------

function dominantShare(i: InputValues): number | undefined {
  const all = sumCover(i.species)
  if (typeof all !== 'number' || all <= 0) return undefined
  const ch = sumCover(i.species, isCharacteristic7210)
  return Math.round(((typeof ch === 'number' ? ch : 0) / all) * 100)
}

// ---------- gatunki ekspansywne ----------

/** Oceny cząstkowe: każdy gatunek z progiem osobno (synonimy razem); gatunki bez pokrycia pomijane. */
function expansiveParts(i: InputValues): { name: string; cover: number; grade: Grade }[] {
  const byKey = new Map<string, { name: string; cover: number; kind: 'molinia' | 'reed' }>()
  for (const r of speciesRows(i.species)) {
    const name = r.name?.trim()
    const kind = name ? expansiveKind7210(name) : undefined
    const c = num(r.cover)
    if (!name || !kind || c === undefined) continue
    const k = speciesKey7210(name)
    const prev = byKey.get(k)
    byKey.set(k, { name: prev?.name ?? name, cover: round1((prev?.cover ?? 0) + c), kind })
  }
  return [...byKey.values()].map((x) => ({ name: x.name, cover: x.cover, grade: x.kind === 'molinia' ? gradeMolinia7210(x.cover) : gradeReed7210(x.cover) }))
}
function expansiveCalc(i: InputValues): Grade | null {
  const parts = expansiveParts(i)
  if (parts.length) return worst(parts.map((p) => p.grade))
  const names = rowNames(i.species)
  if (!names.length) return i.none === 'yes' ? 'FV' : null
  // lista bez gatunków z progiem (albo bez ich pokrycia)
  return names.some((n) => expansiveKind7210(n)) ? null : 'FV'
}

// ---------- stopień uwodnienia ----------

const POINTS = [1, 2, 3, 4, 5] as const
const levels = (i: InputValues) => POINTS.map((n) => num(i[`level${n}`])).filter((v): v is number => v !== undefined)
const meanLevel = (i: InputValues) => mean(levels(i))
const signed = (v: number) => (v > 0 ? `${plNum(v)} cm nad powierzchnią` : v < 0 ? `${plNum(-v)} cm pod powierzchnią` : 'na poziomie powierzchni')

// ---------- wskaźniki ----------

const SURFACE = 'w % powierzchni transektu (dla „<1%” albo pojedynczych pędów wpisz 0,5)'

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description: 'Powierzchnia płatów siedliska na stanowisku i jej zmiany w porównaniu z wcześniejszymi badaniami albo danymi z literatury.',
    help: `Co wybrać: czy powierzchnia torfowiska nakredowego (kłociowiska, szuwaru turzycy Buxbauma, marzycowiska) na stanowisku jest stabilna, rośnie, czy maleje. Samą powierzchnię wpisz obok – trafi do „wartości”, gdy nie ma opisu.

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; inne kombinacje – U1; wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze – U2. Bez danych do porównania – XX.

Praktyka: zdjęcia lotnicze z różnych lat to najlepsze porównanie. 2024 – płaty od kilku m² do kilkuset ha; zanik siedliska (Młyny, Sarbinowo, Słupów) – U2; „poprawa” bywa tylko brakiem dalszego ubytku. Karta z przewodnika: kłociowisko ok. 160 ha, stabilne od lat 50., ale mniejsze niż w latach 80. (244 ha) → XX.`,
    thresholds: { FV: 'Nie podlega zmianom lub zwiększa się', U1: 'Inne kombinacje', U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze' },
    inputs: [
      selectInput('Zmiana powierzchni', AREA, 'Jak zmieniła się powierzchnia siedliska od poprzedniego badania.'),
      { kind: 'text', name: 'areaText', label: 'Powierzchnia (opcjonalnie)', placeholder: 'np. ok. 160 ha', help: 'Powierzchnia płatów siedliska na stanowisku, np. „ok. 160 ha” – trafi do pola „wartość”, gdy nie ma opisu.' },
      noteInput('Opis (opcjonalnie)', 'np. Powierzchnia stabilna od lat 50., mniejsza niż w latach 80.', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => note(i) || String(i.areaText ?? '').trim() || labelOf(AREA, i.choice),
  },
  {
    id: 'share',
    label: 'Udział procentowy siedliska na transekcie',
    parameter: 'structure',
    description:
      'Procent powierzchni transektu zajęty przez siedlisko 7210 (z dokładnością do 10%). Pokazuje ciągłość płatów albo ich fragmentaryczność – w mozaice z szuwarami, mechowiskami i łąkami albo jako resztka po melioracji.',
    help: `Co wpisać: jaką część transektu 10×200 m (albo mniejszej powierzchni, gdy transektu nie da się wyznaczyć) zajmują płaty torfowiska nakredowego.

Progi (tab. 2): co najmniej 70% – FV; 40–70% – U1; poniżej 40% – U2. Tab. 1 dodaje: jeśli nie udało się wyznaczyć transektu o wymiarach 200×10 m, stan można uznać za niezadowalający (U1) – wybierz wtedy ocenę i opisz.

Praktyka: 2013–2014 – U2 zwykle przy udziale poniżej 20%, na dwóch stanowiskach 0%. 2024 – na czterech stanowiskach ocena wzrosła wyłącznie przez „korektę podejścia metodycznego”, a jedna zmiana była poprawką zawyżonej oceny z 2018 r. Karta z przewodnika: 100% → FV.`,
    thresholds: { FV: 'Min. 70%', U1: '70–40%', U2: '<40%' },
    inputs: [
      { kind: 'number', name: 'share', label: 'Udział siedliska na transekcie', unit: '%', min: 0, max: 100, help: 'Procent powierzchni transektu zajęty przez siedlisko 7210, z dokładnością do 10%.' },
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed udziałem (np. U1, gdy nie dało się wyznaczyć transektu 200×10 m). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Siedlisko zajmuje cały transekt.', 'Krótki opis, który trafi do „wartości” w karcie zamiast liczby.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const s = num(i.share)
      return s === undefined ? null : gradeShare7210(s)
    },
    explain: (i) => {
      if (chosenGrade(i)) return null
      const s = num(i.share)
      return s === undefined ? null : `Siedlisko zajmuje ${pct(s)} transektu.`
    },
    warn: (i) => {
      const s = num(i.share)
      return s === undefined ? null : mismatch(chosenGrade(i), gradeShare7210(s), 'udziału')
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const s = num(i.share)
      return s === undefined ? '' : pct(s)
    },
  },
  {
    id: 'characteristic',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków charakterystycznych (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy gatunek na transekcie. W 7210 gatunki charakterystyczne są zarazem siedliskotwórcze: kłoć wiechowata, turzyca Buxbauma, marzyca czarniawa (we wschodniej Polsce – marzyca ruda), a w Schoenetum nigricantis także storczyk błotny i lipiennik Loesela.',
    help: `Co wpisać: gatunki charakterystyczne stwierdzone na transekcie, każdy z pokryciem ${SURFACE}. Łączne pokrycie możesz wpisać wprost. Gdy żadnego nie ma – zaznacz „Nie stwierdzono” (U2).

Progi (tab. 2): znaczący udział w pokryciu kłoci wiechowatej (Cladietum marisci) i turzycy Buxbauma (Caricetum buxbaumii), a w Schoenetum nigricantis znaczący udział wszystkich gatunków charakterystycznych (marzyca, lipiennik, storczyk błotny) – FV; obecność jedynie marzycy w Schoenetum nigricantis albo kłoć lub turzyca Buxbauma wypierana przez inne gatunki dominujące – U1; sporadyczny udział gatunków charakterystycznych, tylko na części stanowiska – U2.

Jak liczy formularz: tab. 2 nie podaje liczb, więc przyjęto: łączne pokrycie gatunków charakterystycznych co najmniej 40% (Cladietum marisci) albo 30% (pozostałe zespoły) – jak próg FV zwarcia szuwarów – FV; od 1% – U1; poniżej 1% albo brak – U2. W Schoenetum nigricantis sama marzyca bez storczyków – najwyżej U1. Zespół wybierz w „Stanowisku”. To interpretacja; ocena wybrana w polu ma pierwszeństwo.

Praktyka: 2013–2014 – FV nawet przy jednym gatunku, gdy kłoć ma duże zwarcie; U1 przy niewielkim pokryciu (do 1% – Jez. Brożane), U2 przy kłoci poniżej 1% (Mielubagno) i braku gatunków. Ten sam raport liczy też niektóre mchy (Scorpidium scorpioides, Limprichtia cossonii) – formularz ich nie liczy, wpisz je w opisie. 2016–2018: kłoć zwykle 40–90%, najczęściej 70–80%. 2024: na większości stanowisk jedynym gatunkiem jest kłoć. Karta z przewodnika: kłoć wiechowata 50% → FV.

Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Znaczący udział w pokryciu kłoci wiechowatej i turzycy Buxbauma (Cladietum marisci, Caricetum buxbaumii); w Schoenetum nigricantis znaczący udział wszystkich gatunków charakterystycznych (marzyca czarniawa, lipiennik Loesela, storczyk błotny)',
      U1: 'Obecność jedynie marzycy czarniawej w Schoenetum nigricantis; kłoć wiechowata lub turzyca Buxbauma wypierana przez inne gatunki dominujące',
      U2: 'Sporadyczny udział gatunków charakterystycznych; tylko na części stanowisk',
    },
    inputs: [
      speciesInput('Gatunki charakterystyczne', `Gatunki charakterystyczne stwierdzone na transekcie z pokryciem ${SURFACE}, np. Cladium mariscus 50.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków charakterystycznych w % transektu – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak gatunków charakterystycznych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma żadnego gatunku charakterystycznego – wtedy wskaźnik to U2.'),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed pokryciem (np. kłoć wypierana przez trzcinę mimo dużego pokrycia). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Cladium mariscus 50%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i, ctx) => chosenGrade(i) ?? characteristicCalc(i, ctx),
    explain: (i, ctx) => {
      if (chosenGrade(i)) return null
      const c = characteristicCover(i)
      if (c === undefined) return null
      const a = associationOf(ctx)
      const names = characteristicNames(i)
      const head = num(i.total) !== undefined ? `Łączne pokrycie gatunków charakterystycznych: ${pct(c)}` : `Gatunki charakterystyczne z katalogu: ${names.length ? `${names.join(', ')}; łączne pokrycie ${pct(c)}` : 'brak'}`
      const school = a === 'schoenetum' && onlySchoenus(i) && c >= 30 ? ' W Schoenetum nigricantis sama marzyca (bez lipiennika i storczyka błotnego) – U1.' : ''
      return `${head}. Próg FV ${isCladium(a) ? '40' : '30'}% (${isCladium(a) ? 'kłoć' : 'pozostałe zespoły'}) to interpretacja „znaczącego udziału”.${school}${assocNote(ctx)}`
    },
    warn: (i, ctx) => {
      const parts: string[] = []
      const conflict = noneConflict(i)
      if (conflict) parts.push(conflict)
      const other = distinct(rowNames(i.species)).filter((n) => !isCharacteristic7210(n))
      if (other.length) parts.push(`Nie liczą się jako charakterystyczne: ${other.join(', ')}.`)
      const m = mismatch(chosenGrade(i), characteristicCalc(i, ctx), 'pokrycia')
      if (m) parts.push(m)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'dominant',
    label: 'Gatunki dominujące',
    parameter: 'structure',
    description:
      'Lista gatunków dominujących na transekcie (polska i łacińska nazwa) z udziałem procentowym; tylko gatunki o pokryciu co najmniej 10%. W dobrze wykształconych płatach dominują gatunki siedliskotwórcze, zarazem charakterystyczne.',
    help: `Co wpisać: gatunki o pokryciu co najmniej 10% transektu, każdy z pokryciem w % (z dokładnością do 10%).

Progi (tab. 2): dominacja gatunków siedliskotwórczych – FV; współdominacja gatunków siedliskotwórczych (np. na równi z trzciną czy trzęślicą) – U1; dominacja innych gatunków, np. trzciny pospolitej, trzęślicy modrej – U2.

Jak liczy formularz: udział gatunków charakterystycznych w łącznym pokryciu dominantów; co najmniej 60% – FV, 40–60% („współdominacja”) – U1, poniżej 40% – U2. To interpretacja, nie norma; ocena wybrana w polu ma pierwszeństwo.

Praktyka: obniżone oceny przy współdominacji albo dominacji trzciny, trzęślicy, turzycy sztywnej, nitkowatej, prosowej i dzióbkowatej, zachylnika błotnego, pałki szerokolistnej, wierzb i olszy (2013–2024). W 2018 r. kilka ocen z 2014 r. uznano za błędne – wskaźnik bywa interpretowany różnie. Karta z przewodnika: kłoć wiechowata 50% → FV.`,
    thresholds: {
      FV: 'Dominacja gatunków siedliskotwórczych',
      U1: 'Współdominacja gatunków siedliskotwórczych',
      U2: 'Dominacja innych gatunków, np. trzciny pospolitej Phragmites australis, trzęślicy modrej Molinia caerulea itp.',
    },
    inputs: [
      speciesInput('Gatunki dominujące', 'Gatunki o pokryciu co najmniej 10% transektu, np. Cladium mariscus 50, Phragmites australis 20.'),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed udziałem liczonym z listy. Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Cladium mariscus 50%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const g = chosenGrade(i)
      if (g) return g
      const s = dominantShare(i)
      return s === undefined ? null : gradeDominant7210(s)
    },
    explain: (i) => {
      if (chosenGrade(i)) return null
      const s = dominantShare(i)
      if (s === undefined) return rowNames(i.species).length ? 'Wpisz pokrycie dominantów – bez niego nie da się policzyć udziału.' : null
      const other = distinct(rowNames(i.species)).filter((n) => !isCharacteristic7210(n))
      return `Gatunki siedliskotwórcze dają ${s}% łącznego pokrycia dominantów.${other.length ? ` Pozostałe: ${other.join(', ')}.` : ''} Progi 60% i 40% to interpretacja („współdominacja”).`
    },
    warn: (i) => {
      const parts: string[] = []
      const low = speciesRows(i.species).filter((r) => r.name?.trim() && (num(r.cover) ?? 100) < 10).map((r) => r.name.trim())
      if (low.length) parts.push(`Pokrycie poniżej 10% – to nie dominanty: ${low.join(', ')}.`)
      const s = dominantShare(i)
      const m = s === undefined ? null : mismatch(chosenGrade(i), gradeDominant7210(s), `udziału gatunków siedliskotwórczych (${s}%)`)
      if (m) parts.push(m)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => note(i) || describeSpecies(speciesRows(i.species)),
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    description: 'Lista inwazyjnych gatunków obcych geograficznie (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy gatunek na transekcie. Na torfowiskach nakredowych rzadkie.',
    help: `Co wpisać: gatunki obce z pokryciem ${SURFACE}. Notowano tawułę kutnerowatą (tab. 1), a w 2018 i 2024 r. nawłoć późną, astra lancetowatego, czeremchę amerykańską i przymiotno kanadyjskie – zwykle pojedyncze osobniki.

Progi (tab. 2): brak – FV; stwierdzenie gatunku i jego udział do 5% – U1; udział powyżej 5% – U2. Tab. 1 jest ostrzejsza („większy udział niż pojedyncze pędy – U2”) – formularz idzie za tab. 2. Gatunek bez pokrycia – U1.

Praktyka: 2013–2014 – brak na wszystkich stanowiskach; 2018 i 2024 – pojedyncze osobniki, U1 (5 stanowisk w 2024 r.). Licz tylko gatunki w płatach siedliska. Karta z przewodnika: „Nie stwierdzono” → FV.`,
    thresholds: { FV: 'Brak', U1: 'Stwierdzenie gatunku i jego udział do 5%', U2: 'Stwierdzenie gatunku i jego udział powyżej 5%' },
    inputs: [
      speciesInput('Obce gatunki inwazyjne', `Gatunki obce z pokryciem ${SURFACE}, np. Solidago gigantea 0,5.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków obcych w % transektu – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak gatunków obcych', 'Zaznacz „Nie stwierdzono”, gdy w płatach siedliska nie ma gatunków obcych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Nie stwierdzono', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => presenceSuggest(i, isAlien7210),
    explain: (i) => presenceExplain(i, 'gatunków obcych', isAlien7210),
    warn: (i) => {
      const parts: string[] = []
      const conflict = noneConflict(i)
      if (conflict) parts.push(conflict)
      const native = distinct(rowNames(i.species)).filter((n) => findSpecies7210(n) && !isAlien7210(n))
      if (native.length) parts.push(`To nie gatunki obce: ${native.join(', ')} – nie liczą się tutaj (ekspansywne, synantropijne, drzewa i krzewy mają własne wskaźniki).`)
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
      'Lista rodzimych gatunków ekspansywnych z udziałem procentowym powierzchni zajętej przez każdy gatunek na transekcie. Przy przesuszeniu wkracza trzęślica modra (a za nią gatunki łąk wilgotnych), przy długotrwałym podniesieniu wody – trzcina pospolita, turzyca sztywna i turzyca nitkowata.',
    help: `Co wpisać: rodzime gatunki ekspansywne z pokryciem ${SURFACE}. Progi mają tylko trzęślica modra i trzy gatunki szuwarowe (trzcina pospolita, turzyca sztywna, turzyca nitkowata) – oceniane osobno, decyduje najgorszy. Pozostałe (wiązówka błotna, tojeść, sadziec konopiasty, zachylnik, pałka, trzcinnik piaskowy) wpisz dla opisu – oceny nie zmieniają.

Progi (tab. 2): trzęślica do 5%, trzcina, turzyca nitkowata i sztywna do 20% – FV; trzęślica 5–15%, trzcina i turzyce 20–30% – U1; trzęślica powyżej 15%, trzcina i turzyce powyżej 30% – U2. Dla trzciny tab. 2 pisze „U1 – udział 20%, U2 – powyżej 20%” (U1 bez przedziału) – formularz bierze 20–30% z tab. 1, jak dla turzyc. Granice (5, 15, 20, 30%) – do lepszej klasy.

Praktyka: tab. 1 zastrzega, że ekspansja może mieć charakter fluktuacyjny – nie zawsze oznacza trwałą zmianę. W 2018 r. część ocen z 2014 r. uznano za niezgodne z waloryzacją (Roskosz 1, Osowiec Południowy – „odmienna interpretacja udziału turzycy nitkowatej”). 2024: najgorzej oceniany wskaźnik (U2 na 34% stanowisk), głównie przez trzcinę. Karta z przewodnika: trzęślica modra 5% + sadziec konopiasty i wiązówka błotna (bez pokrycia) → FV.

Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Udział do 5% trzęślicy modrej Molinia caerulea; udział do 20% trzciny Phragmites australis, turzycy nitkowatej Carex lasiocarpa i turzycy sztywnej Carex elata',
      U1: 'Udział 5–15% trzęślicy modrej; udział 20–30% trzciny, turzycy nitkowatej i turzycy sztywnej',
      U2: 'Udział powyżej 15% trzęślicy modrej; udział powyżej 30% trzciny, turzycy nitkowatej i turzycy sztywnej (dla trzciny tab. 2: powyżej 20%)',
    },
    inputs: [
      speciesInput('Gatunki ekspansywne', `Rodzime gatunki ekspansywne z pokryciem ${SURFACE}, np. Molinia caerulea 5, Phragmites australis 10.`),
      NONE_FIELD('Brak gatunków ekspansywnych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma rodzimych gatunków ekspansywnych – wtedy wskaźnik to FV.'),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed progami (np. fluktuacyjne wkraczanie trzciny po mokrym roku). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Trzęślica modra 5%, obecność innych gatunków łąkowych.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => chosenGrade(i) ?? expansiveCalc(i),
    explain: (i) => {
      if (chosenGrade(i)) return null
      const parts = expansiveParts(i)
      const names = distinct(rowNames(i.species))
      if (!names.length) return null
      const free = names.filter((n) => !expansiveKind7210(n))
      const noCover = names.filter((n) => expansiveKind7210(n) && !parts.some((p) => speciesKey7210(p.name) === speciesKey7210(n)))
      return [
        parts.length ? parts.map((p) => `${p.name} ${pct(p.cover)} → ${p.grade}`).join('; ') : '',
        noCover.length ? `bez pokrycia (wpisz je): ${noCover.join(', ')}` : '',
        free.length ? `bez progów w tab. 2 (nie zmieniają oceny): ${free.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('; ')
        .concat('.')
    },
    warn: (i) => {
      const parts: string[] = []
      const conflict = noneConflict(i)
      if (conflict) parts.push(conflict)
      const names = distinct(rowNames(i.species))
      const wrong = names.filter((n) => findSpecies7210(n) && !isExpansive7210(n))
      if (wrong.length) parts.push(`Nie są tu gatunkami ekspansywnymi (mają własne wskaźniki albo są charakterystyczne): ${wrong.join(', ')}.`)
      const reed = expansiveParts(i).filter((p) => expansiveKind7210(p.name) === 'reed' && speciesKey7210(p.name) === speciesKey7210('Phragmites australis') && p.cover > 20 && p.cover <= 30)
      if (reed.length) parts.push('Trzcina 20–30%: tab. 2 daje dla trzciny U2 już powyżej 20% – formularz idzie za tab. 1 (U1); zaznacz to w opisie.')
      const m = mismatch(chosenGrade(i), expansiveCalc(i), 'progów')
      if (m) parts.push(m)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'synanthropic',
    label: 'Gatunki synantropijne',
    parameter: 'structure',
    description: 'Lista gatunków synantropijnych z udziałem procentowym powierzchni zajętej przez każdy gatunek na transekcie. Na torfowiskach nakredowych notowane sporadycznie, np. wydepczyskowa głowienka pospolita albo ruderalny ostrożeń polny.',
    help: `Co wpisać: gatunki synantropijne (wydepczyskowe, ruderalne) z pokryciem ${SURFACE}.

Progi (tab. 2): brak – FV; stwierdzenie gatunku i jego udział do 5% – U1; udział powyżej 5% – U2. Gatunek bez pokrycia (samo pojawienie się) – U1.

Praktyka: do 2018 r. nigdzie nie stwierdzono; 2024 – ostrożeń polny w znikomym pokryciu (Jezioro Niedzięgiel, Linkowo Północne – U1), podbiał, ostrożeń i malina (Jezioro Białe – U2). Karta z przewodnika: „Nie stwierdzono” → FV.`,
    thresholds: { FV: 'Brak', U1: 'Stwierdzenie gatunku i jego udział do 5%', U2: 'Stwierdzenie gatunku i jego udział powyżej 5%' },
    inputs: [
      speciesInput('Gatunki synantropijne', `Gatunki synantropijne z pokryciem ${SURFACE}, np. Cirsium arvense 0,5.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków synantropijnych w % transektu – ma pierwszeństwo przed sumą z listy.'),
      NONE_FIELD('Brak gatunków synantropijnych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków synantropijnych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Nie stwierdzono', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => presenceSuggest(i, (n) => isSynanthropic7210(n) || !findSpecies7210(n)),
    explain: (i) => presenceExplain(i, 'gatunków synantropijnych', (n) => isSynanthropic7210(n) || !findSpecies7210(n)),
    warn: (i) => {
      const parts: string[] = []
      const conflict = noneConflict(i)
      if (conflict) parts.push(conflict)
      const aliens = distinct(rowNames(i.species)).filter(isAlien7210)
      if (aliens.length) parts.push(`Gatunki obce wpisz we wskaźniku „Obce gatunki inwazyjne”: ${aliens.join(', ')}.`)
      const other = distinct(rowNames(i.species)).filter((n) => findSpecies7210(n) && !isSynanthropic7210(n) && !isAlien7210(n))
      if (other.length) parts.push(`Nie są synantropijne (nie liczą się tutaj): ${other.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'density',
    label: 'Zwarcie szuwarów',
    parameter: 'structure',
    cardinal: true,
    description:
      'Zwarcie szuwaru gatunków siedliskotwórczych – kłoci wiechowatej, turzycy Buxbauma, marzycy czarniawej lub rudej – w % (w dziesiątkach procent). Podobnie jak dominacja gatunków charakterystycznych wyraźnie wskazuje na kondycję siedliska.',
    help: `Co wpisać: zwarcie szuwaru gatunków siedliskotwórczych w % (w dziesiątkach procent). Próg zależy od zespołu wybranego w „Stanowisku”.

Progi (tab. 2): kłoć wiechowata – co najmniej 40% FV, 20–40% U1; pozostałe zespoły – co najmniej 30% FV, 20–30% U1; poniżej 20% – U2. Granice 40% i 30% – FV, 20% – U1.

Uwaga: w opisie wskaźnika w karcie z przewodnika są inne progi (kłoć 70–100% FV, 50–70% U1, poniżej 50% U2; pozostałe 40%/30%) – sprzeczne z tab. 2 i samą kartą (zwarcie 50% oceniono tam na FV). Formularz idzie za tab. 2. Waloryzacja 2006–2008: (30)40–100% FV, 20–39% U1.

Praktyka: tab. 1 – spadek zwarcia kłociowiska bez ekspansji innych roślin może być naturalnym cyklem (nadmiar wojłoku). Sprawozdanie 2016–2018 postulowało usunąć wskaźnik z kardynalnych, bo inicjalne stadia rozwoju siedliska są automatycznie oceniane na U2 – postulat nie wszedł (2024: nadal kardynalny). Zanik siedliska – U2 (Sarbinowo 2024, gdzie wstawiono XX, „powinna to być ocena zła”). Karta z przewodnika: 50% → FV.

Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Co najmniej 40% Cladium mariscus; co najmniej 30% pozostałe',
      U1: '40–20% Cladium mariscus; 30–20% pozostałe',
      U2: 'Poniżej 20%',
    },
    inputs: [
      { kind: 'number', name: 'density', label: 'Zwarcie szuwaru', unit: '%', min: 0, max: 100, help: 'Procent pokrycia transektu (płatów siedliska) przez szuwar gatunków siedliskotwórczych, w dziesiątkach procent. Zespół – w „Stanowisku”.' },
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed zwarciem (np. inicjalne stadium siedliska albo naturalny cykl kłociowiska). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. 50%', 'Krótki opis, który trafi do „wartości” w karcie zamiast liczby.'),
    ],
    suggest: (i, ctx) => {
      const g = chosenGrade(i)
      if (g) return g
      const d = num(i.density)
      return d === undefined ? null : gradeDensity7210(d, associationOf(ctx))
    },
    explain: (i, ctx) => {
      if (chosenGrade(i)) return null
      const d = num(i.density)
      if (d === undefined) return null
      const a = associationOf(ctx)
      return `Zwarcie ${pct(d)}; próg FV ${isCladium(a) ? '40% (kłoć)' : '30% (pozostałe zespoły)'}.${assocNote(ctx)}`
    },
    warn: (i, ctx) => {
      const d = num(i.density)
      return d === undefined ? null : mismatch(chosenGrade(i), gradeDensity7210(d, associationOf(ctx)), 'zwarcia')
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const d = num(i.density)
      return d === undefined ? '' : pct(d)
    },
  },
  {
    id: 'woody',
    label: 'Ekspansja krzewów i podrostu drzew',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków drzew i krzewów z udziałem procentowym powierzchni zajętej przez wszystkie ekspansywne gatunki krzewów i drzew na transekcie. Wskazuje na sukcesję w kierunku zarośli, a później lasu – najczęściej brzoza omszona, kruszyna, olsza czarna, wierzba pięciopręcikowa i szara.',
    help: `Co wpisać: drzewa i krzewy (z podrostem) z pokryciem ${SURFACE}. Łączne pokrycie wpisz osobno, bo korony się nakładają; bez niego formularz liczy sumę z listy. Obce (tawuła kutnerowata, czeremcha amerykańska) wpisz w „Obcych gatunkach inwazyjnych”.

Progi (tab. 2): pojedyncze krzewy – FV; udział 5–10% krzewów lub podrostu drzew – U1; udział większy niż 10% – U2. Tab. 1: „obecność pojedynczych krzewów nie obniża oceny”, więc poniżej 5% formularz daje FV; 10% – U1.

Praktyka: waloryzacja 2006–2008 była łagodniejsza (FV poniżej 5%, U1 6–15%, U2 ponad 15%). W 2018 r. ocenę U1 przy 10% z 2014 r. (Osowiec Północny) nazwano „ekspercką, niezgodną z metodyką” – a przy 20–25% dano U2. Odkrzewianie i wypas szybko poprawiają ocenę (Łempis, Rosochaty Róg). 2024: U2 na 30% stanowisk – olsza czarna, wierzby, brzoza, kruszyna. Karta z przewodnika: „Pojedynczo kruszyna Frangula alnus w warstwie zielnej” → FV.

Wskaźnik kardynalny.`,
    thresholds: { FV: 'Pojedyncze krzewy', U1: '5–10% udział krzewów lub podrostu drzew', U2: 'Udział krzewów lub podrostu drzew większy niż 10%' },
    inputs: [
      speciesInput('Drzewa i krzewy', `Rodzime drzewa i krzewy (z podrostem i siewkami) z pokryciem ${SURFACE}, np. Frangula alnus 0,5, Salix cinerea 5.`),
      totalInput('Łączne pokrycie (opcjonalnie)', 'Pokrycie wszystkich drzew i krzewów razem w rzucie pionowym, w % transektu – korony nakładające się liczy się raz. Ma pierwszeństwo przed sumą z listy. Pojedyncze krzewy – 0,5.'),
      NONE_FIELD('Brak drzew i krzewów', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma drzew ani krzewów – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Pojedynczo kruszyna Frangula alnus w warstwie zielnej', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const t = num(i.total)
      if (t !== undefined) return gradeWoody7210(t)
      if (!rowNames(i.species).length) return i.none === 'yes' ? 'FV' : null
      const c = sumCover(i.species, (n) => !isAlien7210(n))
      if (c === undefined) return 'FV'
      return c === 'present' ? null : gradeWoody7210(c)
    },
    explain: (i) => {
      const t = num(i.total)
      if (t !== undefined) return `Łączne pokrycie drzew i krzewów: ${pct(t)}.`
      const c = sumCover(i.species, (n) => !isAlien7210(n))
      if (c === undefined) return null
      return c === 'present'
        ? 'Gatunki bez pokrycia – wpisz pokrycie albo łączne pokrycie (pojedyncze krzewy: 0,5).'
        : `Łączne pokrycie z sumy gatunków: ${pct(c)} (korony się nakładają – jeśli realnie jest mniej, wpisz łączne pokrycie).`
    },
    warn: (i) => {
      const parts: string[] = []
      const conflict = noneConflict(i)
      if (conflict) parts.push(conflict)
      const names = distinct(rowNames(i.species))
      const aliens = names.filter(isAlien7210)
      if (aliens.length) parts.push(`Gatunki obce wpisz we wskaźniku „Obce gatunki inwazyjne”: ${aliens.join(', ')}.`)
      const herbs = names.filter((n) => findSpecies7210(n) && !isWoody7210(n) && !isAlien7210(n))
      if (herbs.length) parts.push(`To nie drzewa ani krzewy: ${herbs.join(', ')} – sprawdź.`)
      const t = num(i.total) ?? sumCover(i.species, (n) => !isAlien7210(n))
      if (typeof t === 'number' && t >= 1 && t < 5) parts.push(`${pct(t)} – więcej niż „pojedyncze”, mniej niż 5% z tab. 2; formularz daje FV (tab. 1: pojedyncze nie obniżają oceny), opisz.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'hydration',
    label: 'Stopień uwodnienia',
    parameter: 'structure',
    cardinal: true,
    description:
      'Głębokość zalegania wody w okresie letnim (VII–VIII), bez specjalistycznego sprzętu, w pięciu punktach co 50 m wzdłuż transektu (trzy w miejscach zdjęć fitosocjologicznych, dwa pomiędzy). Szkodzi i długotrwałe przesuszenie, i zbyt długo utrzymująca się woda ponad 20–30 cm.',
    help: `Co wpisać: poziom wody względem powierzchni torfu, w cm, w 5 punktach co 50 m wzdłuż transektu (3 w miejscach zdjęć fitosocjologicznych, 2 pomiędzy). Woda nad powierzchnią – liczba dodatnia, pod powierzchnią – ujemna (odwrotnie niż w kartach torfowisk wysokich: tu woda nad torfem to norma). Mierz latem (lipiec – sierpień).

Progi (tab. 2): 0–20 cm nad powierzchnią dla kłoci wiechowatej, 0–10 cm dla pozostałych – FV; do 20 cm pod powierzchnią albo 20–30 cm nad – U1; ponad 20 cm pod albo ponad 30 cm nad – U2. Dla pozostałych zespołów woda 10–20 cm nad powierzchnią to luka w tab. 2 – formularz daje U1 (tab. 1: „nie powinien przekraczać 10 cm”; karta z przewodnika: „powyżej 10 cm” – U1). Zespół – w „Stanowisku”. Formularz liczy średnią z pomiarów.

Uwaga: zapis w karcie z przewodnika (U1 –10…–1 cm, U2 poniżej –10 cm dla kłoci) przeczy tab. 2; sprawozdanie 2016–2018 nazwało waloryzację z 2010 r. „błędnym zapisem” i zaproponowało dokładnie progi powyżej – formularz ich używa. Dla pozostałych zespołów przewodnik dopuszcza niższy poziom minimalny przy wyraźnym podsiąku wody do powierzchni – opisz i wybierz ocenę.

Praktyka: Uroczyska Puszczy Drawskiej i Osowiec – kłociowiska na zarastających jeziorach z wodą ponad 30 cm; sprawozdanie 2016–2018 uznało tam taki poziom za właściwy (FV) – wybierz ocenę ręcznie. 2024: U1 na 34%, U2 na 20% stanowisk, zwykle przesuszenie. Karta z przewodnika: 7 cm nad torfem (12.05), 10 cm pod (2.08) – „niewłaściwe przez część sezonu” → U1.

Wskaźnik kardynalny.`,
    thresholds: {
      FV: '0–20 cm dla kłoci wiechowatej; 0–10 cm dla pozostałych',
      U1: '0–20 cm [poniżej powierzchni]; 20–30 cm [powyżej]',
      U2: 'Poniżej 20 cm; powyżej 30 cm',
    },
    inputs: [
      ...POINTS.map(
        (n): FieldDef => ({
          kind: 'number',
          name: `level${n}`,
          group: 'Poziom wody latem (cm; nad powierzchnią +, pod powierzchnią −)',
          groupCols: 5,
          label: `Punkt ${n}`,
          unit: 'cm',
          min: -200,
          max: 200,
          help:
            n % 2 === 1
              ? `Pomiar w miejscu zdjęcia fitosocjologicznego (${n === 1 ? 'początek' : n === 3 ? 'środek' : 'koniec'} transektu). Woda nad powierzchnią torfu – liczba dodatnia, pod – ujemna.`
              : 'Pomiar pomiędzy zdjęciami fitosocjologicznymi (co 50 m). Woda nad powierzchnią torfu – liczba dodatnia, pod – ujemna.',
        }),
      ),
      GRADE_CHOICE('Ocena ekspercka – ma pierwszeństwo przed pomiarami (np. wysoka woda naturalna na zarastającym jeziorze, podsiąk przy niższym poziomie, wahania w sezonie). Uzasadnij w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Niewłaściwe przez część sezonu – 10 cm poniżej poziomu torfu na początku sierpnia.', 'Krótki opis, który trafi do „wartości” w karcie zamiast pomiarów.'),
    ],
    suggest: (i, ctx) => {
      const g = chosenGrade(i)
      if (g) return g
      const m = meanLevel(i)
      return m === undefined ? null : gradeHydration7210(m, associationOf(ctx))
    },
    explain: (i, ctx) => {
      if (chosenGrade(i)) return null
      const m = meanLevel(i)
      if (m === undefined) return null
      return `Średnia z ${levels(i).length} pomiarów: ${signed(round1(m))}; FV od 0 do ${isCladium(associationOf(ctx)) ? '20 cm nad (kłoć)' : '10 cm nad (pozostałe zespoły)'}.${assocNote(ctx)}`
    },
    warn: (i, ctx) => {
      const parts: string[] = []
      const vals = levels(i)
      const a = associationOf(ctx)
      const m = meanLevel(i)
      if (m !== undefined && vals.some((v) => gradeHydration7210(v, a) === 'U2') && gradeHydration7210(m, a) !== 'U2')
        parts.push('W którymś punkcie poziom wody daje U2, a średnia jest łagodniejsza – sprawdź, czy to nie część transektu przesuszona albo zalana.')
      if (vals.some((v) => v < 0) && vals.some((v) => v > 0)) parts.push('Część pomiarów nad, część pod powierzchnią – sprawdź znaki (nad +, pod −).')
      const mm = m === undefined ? null : mismatch(chosenGrade(i), gradeHydration7210(m, a), 'pomiarów')
      if (mm) parts.push(mm)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const vals = levels(i)
      return vals.length ? `Poziom wody: ${vals.map((v) => (v > 0 ? `+${plNum(v)}` : plNum(v))).join(', ')} cm względem powierzchni torfu` : ''
    },
  },
  {
    id: 'pollution',
    label: 'Zanieczyszczenie pestycydami lub przenawożenie',
    parameter: 'structure',
    description:
      'Skala zanieczyszczeń (procent zmienionej powierzchni) i rodzaj spowodowanych zmian. Wskaźnik spoza tab. 2 – jest w karcie z przewodnika i w sprawozdaniach (2013–2024), ale bez waloryzacji.',
    help: `Co wybrać: czy na stanowisku widać skutki pestycydów (np. odchwaszczanie torowisk, spływy z pól) albo przenawożenia (eutrofizacja, ekspansja nitrofilnych gatunków). Skalę i rodzaj zmian opisz.

Waloryzacji brak: tab. 2 tego wskaźnika nie ma (sprawozdanie 2016–2018: „usunięty w 2010 roku, lecz oceniany przez ekspertów”). Formularz daje FV przy braku objawów (tak oceniano w 2013–2024), a przy objawach albo niepewności – XX, jak w 2024 r. (Słupów, Tuchanie). Wskaźnik niekardynalny – XX nie zmienia oceny struktury. Karta z przewodnika: „Nie stwierdzono” → FV.`,
    thresholds: { FV: 'Brak objawów (praktyka 2013–2024)', U1: '— (brak waloryzacji)', U2: '— (brak waloryzacji)' },
    inputs: [
      selectInput('Zanieczyszczenie lub przenawożenie', POLLUTION, 'Brak waloryzacji w tab. 2 – objawy dają XX.'),
      noteInput('Opis (opcjonalnie)', 'np. Nie stwierdzono', 'Skala (procent zmienionej powierzchni) i rodzaj zmian – trafi do „wartości” w karcie zamiast etykiety.'),
    ],
    suggest: byOption(gradeMap(POLLUTION)),
    describe: (i) => note(i) || (i.choice === 'none' ? 'Nie stwierdzono' : labelOf(POLLUTION, i.choice)),
  },
  {
    id: 'damage',
    label: 'Mechaniczne zniszczenie',
    parameter: 'structure',
    description:
      'Rodzaj zniszczeń i procent zniszczonej powierzchni. Najbardziej podatny jest szuwar kłoci wiechowatej: wydeptywanie przez wędkarzy, ugniatanie ciężkim sprzętem przy koszeniu w złej porze, ścieżki zwierząt kopytnych i bobrów.',
    help: `Co wpisać: procent zniszczonej powierzchni transektu i pochodzenie zniszczeń.

Progi (tab. 2): do 5% powierzchni – FV; do 10% – U1; powyżej 10% – U2. Tab. 1 dodaje warunek pochodzenia: FV tylko dla zniszczeń naturalnych (bobry, kopytne) do 5%, antropogeniczne do 10% – U1. Formularz liczy z tab. 2 (sam procent) i ostrzega przy antropogenicznych do 5%.

Praktyka: 2013–2014 – U1 za koszenie traktorem i zbyt częste koszenie w sierpniu (Bagno Staw 1, Roskosz 2); 2018 – 50 m² to poniżej 5% transektu → FV (Półwysep Łapa), koleiny zarosły → FV (Bagno Staw 1), intensywny wypas na całym transekcie → U2 (Rosochaty Róg). Karta z przewodnika: „Niewielkie naturalnego pochodzenia (ścieżka zwierząt kopytnych), nie więcej niż 5%” → FV.`,
    thresholds: { FV: 'Do 5% powierzchni', U1: 'Do 10%', U2: 'Powyżej 10%' },
    inputs: [
      { kind: 'number', name: 'damaged', label: 'Zniszczona powierzchnia', unit: '%', min: 0, max: 100, help: 'Procent powierzchni transektu zniszczonej mechanicznie (ścieżki, koleiny, wydeptanie, rozjechanie). Brak – 0.' },
      { kind: 'select', name: 'origin', label: 'Pochodzenie zniszczeń', options: DAMAGE_ORIGIN, help: 'Tab. 1: zniszczenia naturalne (bobry, kopytne) do 5% – FV; antropogeniczne do 10% – U1. „Nie stwierdzono” – FV bez wpisywania procentu.' },
      noteInput('Opis (opcjonalnie)', 'np. Niewielkie naturalnego pochodzenia (ścieżka zwierząt kopytnych), nie więcej niż 5%', 'Krótki opis, który trafi do „wartości” w karcie zamiast liczby.'),
    ],
    suggest: (i) => {
      const d = num(i.damaged)
      if (d !== undefined) return gradeDamage7210(d)
      return i.origin === 'none' ? 'FV' : null
    },
    explain: (i) => {
      const d = num(i.damaged)
      return d === undefined ? null : `Zniszczone ${pct(d)} powierzchni.`
    },
    warn: (i) => {
      const d = num(i.damaged)
      if (d === undefined) return null
      if (i.origin === 'human' && d > 0 && d <= 5) return 'Zniszczenia antropogeniczne: tab. 2 daje FV do 5%, ale tab. 1 przyznaje FV tylko naturalnym – rozważ U1 i opisz.'
      if (i.origin === 'none' && d > 0) return 'Wybrano „Nie stwierdzono”, a wpisano zniszczoną powierzchnię – sprawdź.'
      return null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const d = num(i.damaged)
      const o = i.origin && i.origin !== 'none' ? labelOf(DAMAGE_ORIGIN, i.origin).replace(/ \(.*\)$/, '').toLowerCase() : ''
      if (d === undefined) return i.origin === 'none' ? 'Nie stwierdzono' : ''
      return d === 0 ? 'Nie stwierdzono' : `${pct(d)} powierzchni${o ? `, ${o}` : ''}`
    },
  },
]

// ---------- pola stanowiska ----------

const s7120 = methodology7120.siteFields
const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu (zdjęcia fitosocjologicznego nr ${where === 'początku' ? 1 : where === 'środka' ? 2 : 3}), z odbiornika GPS (WGS84).

Dlaczego: obserwacje powtarza się co 5–6 lat w tym samym miejscu – tam też mierzy się poziom wody.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Rezerwat Bagno Serebryskie 2',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Rezerwat Bagno Serebryskie 2”, „Kłocie Ostrowieckie”, „Jezioro Stobińskie Północne, brzeg zachodni”. Za stanowisko uznaje się wyodrębniony płat siedliska z charakterystycznymi gatunkami siedliskotwórczymi.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego stanowiska.`,
  },
  pickField(s7120, 'guid'),
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. badawcze',
    help: 'Typ stanowiska w sieci monitoringu, np. „badawcze” (tak w karcie z przewodnika) albo „referencyjne”. Jeśli nie wiesz, zostaw puste.',
  },
  {
    kind: 'text',
    name: 'areaName',
    label: 'Nazwa obszaru',
    placeholder: 'np. Torfowiska Chełmskie',
    help: 'Obszar (Natura 2000, kompleks torfowisk), w którym leży stanowisko, np. „Torfowiska Chełmskie” (karta z przewodnika), „Uroczyska Puszczy Drawskiej”, „Ostoja Poleska”.',
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Zespół kłoci wiechowatej Cladietum marisci',
    help: 'Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi: Cladietum marisci, Caricetum buxbaumii (Magnocaricion), Schoenetum nigricantis (= Orchido-Schoenetum nigricantis), Schoenetum ferruginei (Caricion lasiocarpae / Caricion davallianae). Do progów zwarcia i uwodnienia wybierz też zespół w polu niżej.',
  },
  {
    kind: 'select',
    name: 'association',
    label: 'Zespół na transekcie (do progów)',
    options: ASSOCIATION_OPTIONS,
    hint: 'Od zespołu zależą progi zwarcia szuwarów, uwodnienia i gatunków charakterystycznych.',
    help: `Zespół dominujący na transekcie. Tab. 2 rozróżnia:
• zwarcie szuwarów – kłoć co najmniej 40% FV, pozostałe co najmniej 30%;
• stopień uwodnienia – kłoć 0–20 cm nad powierzchnią FV, pozostałe 0–10 cm;
• gatunki charakterystyczne – w Schoenetum nigricantis sama marzyca bez lipiennika i storczyka błotnego to U1.

Bez wyboru formularz przyjmuje Cladietum marisci – najczęstszy zespół (2024: na większości stanowisk kłoć to jedyny gatunek charakterystyczny). Karta z przewodnika: Cladietum marisci.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Położenie (niecka kredowa, litoral jeziora, torfowisko przyjeziorne), otoczenie, uwodnienie, historia (melioracje, pożary, koszenie).',
    help: `Krótka charakterystyka stanowiska:
• typ: niecka kredowa, strefa litoralu jeziora, gytiowisko, torfowisko niskie na kredzie lub marglu;
• otoczenie: łąki, zarośla wierzbowe, pola, wyrobiska, zabudowa;
• sąsiednie siedliska w mozaice: łąki trzęślicowe 6410, torfowiska zasadowe 7230, łąki ramienicowe 3140, murawy kserotermiczne;
• historia: melioracje, pożary, koszenie, wypas.

Dlaczego: wyjaśnia, skąd fragmentacja, przesuszenie czy ekspansja trzciny – i uzasadnia oceny.`,
  },
  {
    kind: 'textarea',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    rows: 3,
    required: true,
    placeholder: 'np. ok. 160 ha (szacowanie na podstawie zdjęć lotniczych i badań terenowych)',
    help: 'Powierzchnia płatów siedliska 7210 na stanowisku i skąd wiadomo (zdjęcia lotnicze, pomiar GPS). W karcie z przewodnika: „ok. 160 ha … stabilna od lat 50. … pogorszył się w stosunku do lat 80. – 244 ha”. 2024: od kilku m² do kilkuset ha; 1/3 stanowisk do 10 arów.',
  },
  pickField(s7120, 'protectedAreas', {
    hint: 'Np. „Obszar Natura 2000 Torfowiska Chełmskie, rezerwat Bagno Serebryskie”.',
    help: `Parki narodowe, rezerwaty, parki krajobrazowe, obszary Natura 2000 obejmujące stanowisko.

Dlaczego: tab. 2 uzależnia od tego perspektywy ochrony – istniejąca ochrona obszarowa (rezerwat, park narodowy) to FV.`,
  }),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. Parki Krajobrazowe Polesia',
    help: 'Kto zarządza terenem: park narodowy, park krajobrazowy, RDOŚ (rezerwat), nadleśnictwo, gmina, właściciele prywatni (karta z przewodnika: „Parki Krajobrazowe Polesia”).',
  },
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu (zdjęcie nr 1)', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu (zdjęcie nr 2)', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu (zdjęcie nr 3)', required: true, help: coordHelp('końca') },
  pickField(s7120, 'transect', {
    defaultValue: '10x200 m',
    hint: 'Standard 10×200 m; przy małych płatach – mniejsza powierzchnia (opisz).',
    help: `Przewodnik: transekt 10×200 m; gdy go nie da się wyznaczyć – mniejsza powierzchnia (tab. 1 uznaje to za przesłankę do U1 w „Udziale procentowym siedliska”). W karcie z przewodnika: 10x200 m.

Dlaczego: wszystkie pokrycia odnoszą się do transektu – następny obserwator musi wyznaczyć ten sam.`,
  }),
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 177',
    help: 'Wysokość nad poziomem morza – liczba albo zakres (karta z przewodnika: 177 m). Siedlisko tylko na niżu (region kontynentalny).',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 2.08.2007',
    required: true,
    hint: 'Optymalnie od połowy lipca do końca sierpnia.',
    help: `Dzień badań terenowych. Przewodnik: od połowy lipca do końca sierpnia, kiedy znaczna część gatunków jest w optimum kwitnienia; później też można, ale gorzej z oznaczaniem i oceną pokrycia. Obserwacje powtarza się co 5–6 lat.

Praktyka: 2018 – 5.07–9.09, 2024 – 1.07–15.09, oba terminy uznano za zgodne z metodyką. Formularz ostrzega miękko poza 15.07–31.08 i mocniej poza lipcem – wrześniem.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const [, mm, dd] = v.split('-').map(Number)
      const md = mm * 100 + dd
      if (md < 701 || md > 930) return 'Termin poza sezonem badań (lipiec – wrzesień). Część gatunków może być nie do oznaczenia – opisz powód w uwagach.'
      if (md < 715 || md > 831) return 'Termin poza optymalnym (połowa lipca – koniec sierpnia). Dopuszczalny (tak badano w 2018 i 2024 r.), ale zapisz to w uwagach.'
      return null
    },
  },
  pickField(s7120, 'observer', {
    help: `Imię i nazwisko eksperta, który wykonał obserwację i odpowiada za dane (w karcie z przewodnika: „Koordynator” w raporcie rocznym).

Dlaczego: ocena zawiera elementy oceny eksperckiej – trzeba wiedzieć, kogo zapytać o uzasadnienie.`,
  }),
  {
    kind: 'text',
    name: 'additionalExperts',
    label: 'Dodatkowi eksperci',
    placeholder: 'np. —',
    help: 'Osoby, które brały udział w badaniu poza wykonawcą (w karcie z przewodnika: „Dodatkowi koordynatorzy”). Brak – zostaw puste albo wpisz „—”.',
  },
]

// ---------- zdjęcia fitosocjologiczne ----------

const r7120 = methodology7120.releves.fields
const LAYERS = 'Zwarcie i wysokość warstw A, B, C, D'
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, group: LAYERS, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia (WGS84). Trzy zdjęcia na transekcie: na początku, w środku i na końcu – w tych miejscach mierzy się też poziom wody.' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach (karta z przewodnika: 177 m).' }),
  pickField(r7120, 'area', { defaultValue: 100, help: 'Powierzchnia zdjęcia w m² – w karcie z przewodnika 100 m². Przy bardzo małych płatach wpisz faktyczną.' }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Torfowiska nakredowe leżą płasko – zwykle 0°.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, NW). Dla powierzchni płaskiej wpisz „brak”.' }),
  layerField('coverA', 'Warstwa A – drzewa: procent powierzchni zdjęcia pod koronami drzew. Na torfowisku nakredowym zwykle 0.', { groupCols: 4 }),
  layerField('coverB', 'Warstwa B – krzewy i podrost: wierzby, kruszyna, olsza, brzoza – wyraźna warstwa B to sygnał zarastania.'),
  layerField('coverC', 'Warstwa C – zielna: kłoć, turzyce, marzyce, trzcina, trzęślica (karta z przewodnika: 50%).'),
  layerField('coverD', 'Warstwa D – mszysta: mchy brunatne (Scorpidium, Campylium, Calliergonella), wątrobowce (karta z przewodnika: 20%).'),
  layerField('heightA', 'Warstwa A – typowa wysokość drzew, w metrach. Brak – puste.'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów i podrostu, w metrach.'),
  layerField('heightC', 'Warstwa C – typowa wysokość warstwy zielnej, w centymetrach (kłoć bywa wyższa niż 1,5 m).'),
  layerField('heightD', 'Warstwa D – wysokość warstwy mszystej, w centymetrach.'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Cladietum marisci',
    help: 'Jednostka fitosocjologiczna zdjęcia – Cladietum marisci (karta z przewodnika), Caricetum buxbaumii, Schoenetum nigricantis, Schoenetum ferruginei.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w zdjęciu z ilościowością w skali Braun-Blanqueta (r, +, 1–5): A – drzewa, B – krzewy i podrost, C – rośliny zielne, D – mszaki. Warstwa podpowiada się sama po wyborze gatunku.',
  }),
  {
    kind: 'textarea',
    name: 'waterLevel',
    label: 'Poziom wody w miejscu zdjęcia',
    rows: 2,
    placeholder: 'np. 0,07 m powyżej poziomu torfu (12.05.2007); 0,1 m poniżej poziomu torfu (2.08.2007)',
    help: 'Poziom wody w miejscu zdjęcia, z datą pomiaru – jak w karcie z przewodnika. Letni pomiar wpisz też we wskaźniku „Stopień uwodnienia”.',
  },
  {
    kind: 'textarea',
    name: 'remarks',
    label: 'Uwagi do zdjęcia',
    rows: 2,
    help: 'Odstępstwa i problemy: inna powierzchnia, mszaki nieoznaczone do gatunku, puste pola w karcie.',
  },
]

export const methodology7210: Methodology = {
  code: '7210',
  name: 'Torfowiska nakredowe (Cladietum marisci, Caricetum buxbaumii, Schoenetum nigricantis)',
  source:
    'Buczek A. 2010, 7210 Torfowiska nakredowe (Cladietum marisci, Caricetum buxbaumii, Schoenetum nigricantis), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ, s. 161–173 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014, 2015–2018 i 2023–2025.',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj 3 zdjęcia fitosocjologiczne na transekcie – na początku, w środku i na końcu (w karcie z przewodnika: 100 m²). Ilościowość w skali Braun-Blanqueta, warstwy A–D. W tych samych miejscach zmierz poziom wody (wskaźnik „Stopień uwodnienia”).',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Realne możliwości zachowania właściwego stanu siedliska oraz poprawy stanu niewłaściwego. W opisie – potencjalne zabiegi ochronne. Decydują ochrona obszarowa, możliwość ingerencji w układ hydrologiczny i zabezpieczenia przed eutrofizacją.',
    help: `Weź pod uwagę: czy stanowisko leży w rezerwacie lub parku narodowym i czy plany ochrony przewidują ochronę czynną hamującą sukcesję; czy da się regulować poziom wody (zastawki na rowach); czy da się zabezpieczyć siedlisko przed eutrofizacją (gospodarka w zlewni jeziora); istniejące zagrożenia – głębokie rowy, wydeptywanie, spływy nawozów i środków ochrony roślin, presja turystyczna i inwestycyjna.

Progi (tab. 1 i 2): istniejąca ochrona obszarowa (rezerwat, park narodowy) z ochroną czynną albo – poza obszarami chronionymi – realna możliwość ingerencji w układ hydrologiczny – FV; brak możliwości ingerencji w układ hydrologiczny, brak możliwości zabezpieczenia przed eutrofizacją – U1; istniejące rowy odwadniające, eutrofizacja siedliska, presja turystyczna – U2.

Przewodnik (pkt 5): sama ochrona bierna często nie wystarcza; koszenie nie częściej niż raz na 4–5 lat, zimą, przy zlodzeniu, lekkim sprzętem. Praktyka 2024: FV 30%, U1 41%, U2 25%, XX 4% (nieznana reakcja kłociowiska na zmianę poziomu wody – Mnica, Jezioro Brożane). Karta z przewodnika: ochrona rezerwatowa, ale brak możliwości podniesienia poziomu wody → U1.`,
    thresholds: {
      FV: 'Istniejąca ochrona obszarowa (rezerwat, park narodowy); możliwość ingerencji w układ hydrologiczny',
      U1: 'Brak możliwości ingerencji w układ hydrologiczny; brak możliwości zabezpieczenia przed eutrofizacją',
      U2: 'Istniejące rowy odwadniające, eutrofizacja siedliska, presja turystyczna',
    },
  },

  impactCodes: [
    { code: 'A02', name: 'Zmiana sposobu uprawy' },
    { code: 'A03', name: 'Koszenie / ścinanie trawy' },
    { code: 'A03.03', name: 'Zaniechanie / brak koszenia' },
    { code: 'A04', name: 'Wypas' },
    { code: 'A04.03', name: 'Zarzucenie pasterstwa, brak wypasu' },
    { code: 'A07', name: 'Stosowanie biocydów, hormonów i chemikaliów' },
    { code: 'A08', name: 'Nawożenie' },
    { code: 'C01.07', name: 'Działalność górnicza i wydobywcza nie wymieniona powyżej' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D01.04', name: 'Linie kolejowe, TGV' },
    { code: 'D02.01.01', name: 'Napowietrzne linie elektryczne i telefoniczne' },
    { code: 'E01', name: 'Tereny zurbanizowane, tereny zamieszkane' },
    { code: 'G01.01', name: 'Sporty wodne' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'H01.05', name: 'Rozproszone zanieczyszczenie wód powierzchniowych spowodowane działalnością rolniczą i leśną' },
    { code: 'H04', name: 'Zanieczyszczenie powietrza, zanieczyszczenia transportowane drogą powietrzną' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J01.01', name: 'Wypalanie' },
    { code: 'J02.01.02', name: 'Osuszanie terenów morskich, ujściowych, bagiennych' },
    { code: 'J02.04', name: 'Zalewanie - modyfikacje' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód – ogólnie' },
    { code: 'J02.07', name: 'Pobór wód gruntowych' },
    { code: 'J02.15', name: 'Inne zmiany warunków hydraulicznych spowodowane przez człowieka' },
    { code: 'K01.03', name: 'Wyschnięcie' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.02', name: 'Nagromadzenie materii organicznej' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'K04.05', name: 'Szkody wyrządzane przez roślinożerców (w tym zwierzynę łowną)' },
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
            hint: 'Np. lęgi wodniczki, rzadkie storczyki, mozaika z 7230 i 6410.',
            help: 'Wartości przyrodnicze stanowiska poza samym siedliskiem: sąsiednie siedliska (7230, 6410, 3140), rzadkie i chronione gatunki roślin i zwierząt. Karta z przewodnika: „Miejsce lęgów wodniczki, kropiatki, błotniaka łąkowego”. Brak – „Nie stwierdzono”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            label: 'Wykonywane zabiegi ochronne i ocena ich skuteczności',
            help: 'Jakie zabiegi wykonano i z jakim skutkiem: koszenie (zimą, lekkim sprzętem), usuwanie drzew i krzewów, zastawki, wypas. 2018: na ponad 90% stanowisk nie wykonywano ochrony czynnej. Brak – „Brak”.',
          },
          {
            kind: 'textarea',
            name: 'proposals',
            label: 'Propozycje wprowadzenia działań ochronnych',
            rows: 3,
            hint: 'Np. zastawki, usuwanie podrostu, koszenie raz na 4–5 lat zimą.',
            help: 'Jakie działania proponujesz: kontrola i poprawa stosunków wodnych (zastawki), usuwanie podrostu drzew i krzewów, koszenie nie częściej niż raz na 4–5 lat, w okresie zlodzenia, lekkim sprzętem; ograniczenie eutrofizacji w zlewni; na części stanowisk – ochrona bierna (rezerwat).',
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
            help: 'Czy stanowisko powinno zostać w sieci monitoringu (pole w karcie z przewodnika). Uzasadnienie wpisz niżej.',
          },
          {
            kind: 'textarea',
            name: 'justification',
            label: 'Uzasadnienie',
            rows: 3,
            help: 'Dlaczego monitoring jest (albo nie jest) potrzebny. W karcie z przewodnika puste.',
          },
        ]
      if (f.name === 'notes')
        return [
          ...(['FV', 'U1', 'U2'] as const).map(
            (g): FieldDef => ({
              kind: 'number',
              name: `share${g}`,
              group: 'Powierzchnia siedliska o różnym stanie zachowania na stanowisku',
              label: `Udział powierzchni siedliska w stanie ${g}`,
              unit: '%',
              min: 0,
              max: 100,
              help:
                g === 'FV'
                  ? 'Karta z przewodnika podaje przy ocenie ogólnej udział procentowy powierzchni siedliska o różnym stanie zachowania na całym stanowisku (Bagno Serebryskie 2: U1 100%). Trzy liczby powinny dać razem 100%.'
                  : `Procent powierzchni siedliska na stanowisku w stanie ${g === 'U1' ? 'niezadowalającym (U1)' : 'złym (U2)'}.`,
            }),
          ),
          {
            ...f,
            help: `${f.help ?? ''}\n\nDla 7210 zapisz tu także rok i typ monitoringu, termin (poza połową lipca – końcem sierpnia), pomiary wody z innych terminów i odstępstwa od transektu.`.trim(),
          },
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_7210.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer7210(s) })),
  speciesInfo: (name) => {
    const s = findSpecies7210(name)
    if (!s) return undefined
    if (s.group === 'characteristic') return `${GROUP_LABELS_7210.characteristic}${s.builder ? ' (siedliskotwórczy)' : ' (Schoenetum nigricantis)'}`
    if (s.group === 'expansive') return `${GROUP_LABELS_7210.expansive}${s.expansiveKind ? ' (z progiem w tab. 2)' : ' (bez progu w tab. 2)'}`
    return GROUP_LABELS_7210[s.group]
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator7210 = (id: string): IndicatorDef => {
  const i = methodology7210.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 7210`)
  return i
}
