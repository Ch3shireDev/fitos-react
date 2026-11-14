// Metodyka 4070 (zarośla kosodrzewiny Pinetum mugo) jako dane. Źródło: Mróz W. 2010, „Zarośla kosodrzewiny Pinetum mugo”
// [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ, s. 84–94 (tab. 1 i 2),
// z praktyką oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014 i 2021.
// Siedlisko zaroślowe piętra subalpejskiego (Tatry, Babia Góra, Pilsko, Karkonosze, Góry Izerskie), niepriorytetowe.
// Stanowisko to jednostka topograficzna (dolina, grzbiet) 5–30 ha, na nim jeden transekt 200 m (w karcie 10×200 m)
// i 3 zdjęcia fitosocjologiczne co 100 m (początek, środek, koniec transektu).
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_4070,
  SPECIES_4070,
  defaultLayer4070,
  findSpecies4070,
  isGoodDominantC,
  isIndicatorLichen,
  isLichen4070,
  isMugo,
  isTypical4070,
  speciesKey4070,
} from './species'

// ---------- liczby i zakresy ----------

/**
 * Procent wpisany jak w karcie papierowej: „10”, „do 10”, „ok. 5”, „10–30”. Zakres daje środek przedziału.
 * Bzdura -> undefined.
 */
export function parsePercent4070(value: unknown): { lo: number; hi: number; mid: number } | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? { lo: value, hi: value, mid: value } : undefined
  const t = String(value ?? '')
    .toLowerCase()
    .replace(/śr\.?|ok\.?|około|do|poniżej|%/g, '')
    .replace(/,/g, '.')
    .replace(/\s+/g, '')
  const m = /^(\d+(?:\.\d+)?)(?:[-–—](\d+(?:\.\d+)?))?$/.exec(t)
  if (!m) return undefined
  const lo = Number(m[1])
  const hi = m[2] !== undefined ? Number(m[2]) : lo
  return { lo: Math.min(lo, hi), hi: Math.max(lo, hi), mid: Math.round(((lo + hi) / 2) * 100) / 100 }
}

// ---------- progi liczbowe (tab. 2) ----------

/** Udział procentowy siedliska na transekcie: „>70%” FV, „70–40%” U1 (obie granice w U1, sprawozdanie 2021: 40% → U1), „<40%” U2. */
export const gradeShare4070 = (p: number): Grade => (p > 70 ? 'FV' : p >= 40 ? 'U1' : 'U2')

/** Zniszczenia mechaniczne: „nie większe niż 5%” FV, „od 5 do 30%” U1, „większe od 30%” U2. */
export const gradeDamage4070 = (p: number): Grade => (p <= 5 ? 'FV' : p <= 30 ? 'U1' : 'U2')

/** Obumieranie igieł kosodrzewiny: „do 10%” FV, „od 10 do 30%” U1, „większe niż 30%” U2. */
export const gradeNeedles4070 = (p: number): Grade => (p <= 10 ? 'FV' : p <= 30 ? 'U1' : 'U2')

/**
 * Gatunki typowe (tab. 2): kosodrzewina i co najmniej cztery inne typowe FV; kosodrzewina i co najmniej dwa inne U1;
 * brak gatunków typowych poza kosodrzewiną U2. Luki tab. 2: kosodrzewina + jeden inny → U2 (nie spełnia U1),
 * brak kosodrzewiny → U2 (sprawozdanie 2021, Polica: brak siedliska).
 */
export function gradeTypical4070(hasMugo: boolean, others: number): Grade {
  if (!hasMugo) return 'U2'
  return others >= 4 ? 'FV' : others >= 2 ? 'U1' : 'U2'
}

/**
 * Gatunki dominujące (tab. 2): dominuje kosodrzewina, a w warstwie C borówka czarna lub śmiałek pogięty FV;
 * dominacja innego gatunku w warstwie B lub C U1; dominacja innych gatunków w obu warstwach U2.
 */
export function gradeDominant4070(okB: boolean, okC: boolean): Grade {
  if (okB && okC) return 'FV'
  return okB || okC ? 'U1' : 'U2'
}

/**
 * Bogactwo porostów epifitycznych (pięć gatunków z tab. 2): co najmniej cztery FV; co najmniej dwa U1; brak albo jeden U2.
 * Warunek „o pokryciu większym niż 5%” przy U1 formularz tylko sygnalizuje (sprawozdanie 2021, Izera i Sokolica:
 * dwa gatunki o niskim pokryciu → U1).
 */
export const gradeLichens4070 = (count: number): Grade => (count >= 4 ? 'FV' : count >= 2 ? 'U1' : 'U2')

/** Kompleks siedlisk subalpejskich: udział kosodrzewiny i to, jakie siedliska towarzyszą. */
export function gradeComplex4070(mugo: number | undefined, companions: string): Grade | null {
  if (companions === 'dominant') return 'U2'
  if (companions === 'none') return 'XX'
  if (companions === 'grazing') return 'U1'
  if (companions !== 'natural') return null
  if (mugo === undefined) return null
  return mugo > 50 ? 'FV' : 'U1'
}

const pct = (v: number) => `${plNum(v)}%`
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey4070(n), n])).values()]

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'other', label: 'Inne kombinacje (np. niewielki spadek)', grade: 'U1' },
  { value: 'decrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const TYPICAL: GradedOption[] = [
  { value: 'fv', label: 'Występuje kosodrzewina i cztery inne typowe gatunki roślin', grade: 'FV' },
  { value: 'u1', label: 'Występuje kosodrzewina i przynajmniej dwa inne typowe gatunki roślin', grade: 'U1' },
  { value: 'u2', label: 'Brak gatunków typowych poza kosodrzewiną', grade: 'U2' },
]
const DOMINANT: GradedOption[] = [
  { value: 'fv', label: 'Dominuje kosodrzewina, a w warstwie C – borówka czarna lub śmiałek pogięty', grade: 'FV' },
  { value: 'u1', label: 'Dominacja innego gatunku w warstwie B lub C', grade: 'U1' },
  { value: 'u2', label: 'Dominacja innych gatunków w obu warstwach', grade: 'U2' },
]
const COMPANIONS: SelectOption[] = [
  { value: 'natural', label: 'Tylko naturalne siedliska subalpejskie (biogrupy świerka, zarośla jarzębu i wierzby śląskiej, jałowiec halny, borówczyska, ziołorośla)' },
  { value: 'grazing', label: 'Poza naturalnymi także spory udział siedlisk związanych z wypasem (np. psiary)' },
  { value: 'dominant', label: 'Dominacja siedlisk półnaturalnych' },
  { value: 'none', label: 'W tym piętrze nie ma zbiorowisk subalpejskich – nie da się ocenić (XX)' },
]
const NEEDLES: GradedOption[] = [
  { value: 'fv', label: 'Igły w większości zdrowe', grade: 'FV' },
  { value: 'u1', label: 'Nadmierne obumieranie igieł na dużej ilości krzewów', grade: 'U1' },
  { value: 'u2', label: 'Nadmierne obumieranie igieł często obserwowane', grade: 'U2' },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

/** Select niewymagany – gdy liczby lub lista wystarczają, nie trzeba go wybierać. */
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

// ---------- gatunki typowe ----------

/** Kosodrzewina na liście i liczba pozostałych gatunków typowych z tab. 1 (synonimy liczone raz). */
export function typicalCounts(list: unknown): { mugo: boolean; others: string[] } | null {
  const names = rowNames(list)
  if (!names.length) return null
  const typical = distinct(names.filter(isTypical4070))
  return { mugo: names.some(isMugo), others: typical.filter((n) => !isMugo(n)) }
}

function typicalFromList(i: InputValues): Grade | null {
  const c = typicalCounts(i.species)
  return c ? gradeTypical4070(c.mugo, c.others.length) : null
}

// ---------- gatunki dominujące ----------

/** Gatunki o największym pokryciu w warstwie (remis – wszystkie). Brak pokryć – undefined. */
function topSpecies(list: unknown): string[] | undefined {
  const rows = speciesRows(list).filter((r) => r.name?.trim())
  const covers = rows.map((r) => num(r.cover))
  const max = Math.max(...covers.filter((c): c is number => c !== undefined))
  if (!Number.isFinite(max)) return undefined
  return rows.filter((_, k) => covers[k] === max).map((r) => r.name.trim())
}

export function dominantLayers(i: InputValues): { okB: boolean; okC: boolean; topB: string[]; topC: string[] } | null {
  const topB = topSpecies(i.speciesB)
  const topC = topSpecies(i.speciesC)
  if (!topB || !topC) return null
  return { okB: topB.some(isMugo), okC: topC.some(isGoodDominantC), topB, topC }
}

function dominantFromLists(i: InputValues): Grade | null {
  const d = dominantLayers(i)
  return d ? gradeDominant4070(d.okB, d.okC) : null
}

// ---------- porosty ----------

function lichenCount(i: InputValues): number | undefined {
  const names = distinct(rowNames(i.species).filter(isIndicatorLichen))
  const listed = rowNames(i.species).length
  return num(i.count) ?? (listed || i.none === 'yes' ? names.length : undefined)
}

// ---------- kompleks ----------

function complexMugo(i: InputValues, share: unknown): { value?: number; fromShare: boolean } {
  const own = num(i.mugo)
  if (own !== undefined) return { value: own, fromShare: false }
  const s = num(share)
  return { value: s, fromShare: s !== undefined }
}

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description: 'Zmiana powierzchni zarośli kosodrzewiny na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury.',
    help: `Co wybrać: jak zmieniła się powierzchnia zarośli kosodrzewiny na stanowisku od poprzedniego badania albo względem literatury, map roślinności i ortofotomap. Powierzchnię płatów wpisz obok – trafi do „wartości”.

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; inne kombinacje – U1; wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub literaturą – U2. Przy pierwszym badaniu (nie ma z czym porównać) wybierz „Brak danych do porównania” (XX) albo oceń ekspercko.

Uwaga: kosodrzewina jest bardzo żywotna, więc ubytki powierzchni to zwykle narciarstwo (trasy, wyciągi), wycinanie przy szlakach albo – w niższych masywach (Polica) – zamieranie płatów i sukcesja świerka. Nasadzeń kosodrzewiny (np. Śnieżnik) nie traktuje się jako 4070.`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się',
      U1: 'Inne kombinacje',
      U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze',
    },
    inputs: [
      optionalSelect('Zmiana powierzchni', AREA, 'Puste, gdy oceniasz ekspercko (np. pierwsze badanie).'),
      {
        kind: 'text',
        name: 'areaText',
        label: 'Powierzchnia (opcjonalnie)',
        placeholder: 'np. 23,5 ha',
        help: 'Powierzchnia płatów kosodrzewiny na stanowisku (stanowisko to jednostka topograficzna, zwykle 5–30 ha) – trafi do pola „wartość”.',
      },
      noteInput('Opis (opcjonalnie)', 'np. płaty przy nartostradzie wycięte w 2019 r.', 'Krótki opis zmian, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => {
      const a = String(i.areaText ?? '').trim()
      return [a, note(i) || (i.choice ? labelOf(AREA, i.choice).toLowerCase() : '')].filter(Boolean).join('; ')
    },
  },
  {
    id: 'share',
    label: 'Udział procentowy siedliska na transekcie',
    parameter: 'structure',
    description:
      'Procent powierzchni transektu zajętej przez zarośla kosodrzewiny (z dokładnością do 10%). Obniżają go przekształcenia antropogeniczne: nartostrady, wyciągi, szlaki i wydeptane punkty widokowe; naturalna nieciągłość (płaty malin, ziołorośla, biogrupy świerka) oceny nie obniża.',
    help: `Co wpisać: jaka część transektu (200 m, w karcie 10×200 m) leży w zaroślach kosodrzewiny, w procentach. Brak siedliska = 0. Opisz, co zajmuje resztę (świerk, ziołorośla, szlak).

Progi (tab. 2): >70% – FV; 70–40% – U1; <40% – U2. Obie granice 70% i 40% formularz liczy do U1 (sprawozdanie 2021: Sokolica 40% → U1).

Uwaga (tab. 1): zwykle wartość wynosi 100% albo jest nieco obniżona przez naturalną nieciągłość kompleksu – to nie powinno obniżać oceny. Jeśli niższy procent wynika wyłącznie z naturalnych płatów (np. biogrupy świerka przy górnej granicy lasu), oceń ekspercko i opisz to.`,
    thresholds: { FV: '>70%', U1: '70–40%', U2: '<40%' },
    inputs: [
      { kind: 'number', name: 'value', label: 'Udział siedliska na transekcie', unit: '%', min: 0, max: 100, required: true, help: 'Procent długości/powierzchni transektu zajęty przez zarośla kosodrzewiny, z dokładnością do 10%. W karcie z przewodnika: 80%.' },
      noteInput('Opis (opcjonalnie)', 'np. transekt przy górnej granicy lasu, ok. 20% płatów świerkowych', 'Krótki komentarz – trafi do „wartości” w karcie po procencie.'),
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v !== undefined ? gradeShare4070(v) : null
    },
    describe: (i) => {
      const v = num(i.value)
      return [v !== undefined ? pct(v) : '', note(i)].filter(Boolean).join('. ')
    },
  },
  {
    id: 'typical',
    label: 'Gatunki typowe',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków typowych (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy gatunek na transekcie (z dokładnością do 10%). Warstwa B: kosodrzewina, jarząb pospolity górski, jałowiec halny, porzeczka skalna; warstwa C: borówka czarna, borówka brusznica, podbiałek alpejski, śmiałek pogięty, wietlica alpejska.',
    help: `Co wpisać: gatunki typowe stwierdzone na transekcie z pokryciem. Formularz liczy kosodrzewinę i pozostałe gatunki typowe z tab. 1:
• warstwa B – jarząb pospolity górski Sorbus aucuparia subsp. glabrata, jałowiec halny Juniperus communis subsp. alpina, porzeczka skalna Ribes petraeum;
• warstwa C – borówka czarna Vaccinium myrtillus, borówka brusznica V. vitis-idaea, podbiałek alpejski Homogyne alpina, śmiałek pogięty Deschampsia flexuosa, wietlica alpejska Athyrium distentifolium.
Inne gatunki (np. wierzba śląska) możesz wpisać – zostaną w opisie, ale do liczby się nie liczą.

Progi (tab. 2): kosodrzewina i cztery inne typowe gatunki – FV; kosodrzewina i przynajmniej dwa inne – U1; brak gatunków typowych poza kosodrzewiną – U2.

Jak liczy formularz: brak kosodrzewiny → U2; poza nią ≥4 gatunki → FV, 2–3 → U1, 0–1 → U2 (jeden gatunek nie spełnia U1). Synonimy (Avenella/Deschampsia flexuosa, Sorbus aucuparia z podgatunkiem i bez) liczone raz.

Wskaźnik kardynalny. Sprawozdanie 2021: Sokolica dostała U1 mimo kompletu gatunków typowych – przez gatunki zrębów i prześwietleń oraz świerk nad kosówką. Taką korektę wybierz w polu „Ocena ekspercka” (ma pierwszeństwo przed listą).`,
    thresholds: thresholdsOf(TYPICAL),
    inputs: [
      speciesInput('Gatunki typowe na transekcie', 'Gatunki typowe z pokryciem w % transektu, np. Pinus mugo 40, Vaccinium myrtillus 50.', true),
      optionalSelect('Ocena ekspercka (opcjonalnie)', TYPICAL, 'Ma pierwszeństwo przed liczeniem z listy. Użyj, gdy skład gatunkowy jest kompletny, ale zniekształcony (gatunki zrębowe, świerk nad kosówką).'),
      noteInput('Opis (opcjonalnie)', 'np. Warstwa B: kosodrzewina Pinus mugo 40%…', 'Opis jak w karcie papierowej – trafi do „wartości” zamiast samej listy gatunków.'),
    ],
    suggest: (i) => gradeMap(TYPICAL)[String(i.choice)] ?? typicalFromList(i),
    explain: (i) => {
      const c = typicalCounts(i.species)
      if (!c) return null
      return `Kosodrzewina: ${c.mugo ? 'jest' : 'brak'}; inne typowe (${c.others.length}): ${c.others.join(', ') || '—'} – z listy ${typicalFromList(i)}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      const notCounted = names.filter((n) => !isTypical4070(n))
      if (notCounted.length) parts.push(`Nie liczą się do gatunków typowych z tab. 1: ${notCounted.join(', ')}.`)
      const clearing = names.filter((n) => findSpecies4070(n)?.group === 'clearing')
      if (clearing.length) parts.push(`Gatunki zrębów i prześwietleń (${clearing.join(', ')}) – w 2021 r. obniżały ocenę do U1; rozważ ocenę ekspercką.`)
      const chosen = gradeMap(TYPICAL)[String(i.choice)]
      const fromList = typicalFromList(i)
      if (chosen && fromList && chosen !== fromList) parts.push(`Wybrano ${chosen}, a z listy wychodzi ${fromList} – opisz powód.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => note(i) || describeSpecies(speciesRows(i.species)) || (i.choice ? labelOf(TYPICAL, i.choice) : ''),
  },
  {
    id: 'dominant',
    label: 'Gatunki dominujące',
    parameter: 'structure',
    description:
      'Lista gatunków dominujących na transekcie (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy gatunek; należy wymienić tylko gatunki o pokryciu ≥10%. W warstwie krzewów dominuje kosodrzewina, w warstwie C – borówka czarna lub śmiałek pogięty.',
    help: `Co wpisać: osobno dla warstwy B (krzewy) i C (runo) gatunki o pokryciu co najmniej 10% transektu, z pokryciem. Formularz sprawdza, który gatunek ma największe pokrycie w każdej warstwie (przy remisie liczą się wszystkie z remisu).

Progi (tab. 2): dominuje kosodrzewina, a w warstwie C borówka czarna lub śmiałek pogięty – FV; dominacja innego gatunku w warstwie B lub C – U1; dominacja innych gatunków w obu warstwach – U2.

Sprawozdanie 2021: U1 na Sokolicy (kosówka 40%, ale świerk 30% i jarzębina 20% – wkracza bór górnoreglowy) i na Pilsku (jałowiec halny 40%, kosodrzewina 15%); U2 na Policy (brak kosodrzewiny, świerk i jarzębina). Gdy kosodrzewina formalnie dominuje, ale udział świerka szybko rośnie, wybierz ocenę ekspercką.`,
    thresholds: thresholdsOf(DOMINANT),
    inputs: [
      speciesInput('Dominujące w warstwie B (krzewy)', 'Gatunki krzewów o pokryciu ≥10% transektu, z pokryciem, np. Pinus mugo 40, Sorbus aucuparia subsp. glabrata 30.', true, 'speciesB'),
      speciesInput('Dominujące w warstwie C (runo)', 'Gatunki runa o pokryciu ≥10% transektu, z pokryciem, np. Vaccinium myrtillus 50.', true, 'speciesC'),
      optionalSelect('Ocena ekspercka (opcjonalnie)', DOMINANT, 'Ma pierwszeństwo przed liczeniem z list (np. gdy kosodrzewina ledwo dominuje nad świerkiem).'),
      noteInput('Opis (opcjonalnie)', 'np. W obrębie transektu dominują gatunki charakterystyczne…', 'Opis jak w karcie papierowej – trafi do „wartości” zamiast samych list.'),
    ],
    suggest: (i) => gradeMap(DOMINANT)[String(i.choice)] ?? dominantFromLists(i),
    explain: (i) => {
      const d = dominantLayers(i)
      return d ? `Najwięcej w B: ${d.topB.join(', ')}; w C: ${d.topC.join(', ')} – z list ${gradeDominant4070(d.okB, d.okC)}.` : null
    },
    warn: (i) => {
      const parts: string[] = []
      const low = [...speciesRows(i.speciesB), ...speciesRows(i.speciesC)].filter((r) => r.name?.trim() && (num(r.cover) ?? 100) < 10).map((r) => r.name.trim())
      if (low.length) parts.push(`Pokrycie poniżej 10% – metodyka każe wymienić tylko gatunki od 10%: ${low.join(', ')}.`)
      const chosen = gradeMap(DOMINANT)[String(i.choice)]
      const fromList = dominantFromLists(i)
      if (chosen && fromList && chosen !== fromList) parts.push(`Wybrano ${chosen}, a z list wychodzi ${fromList} – opisz powód.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const b = describeSpecies(speciesRows(i.speciesB))
      const c = describeSpecies(speciesRows(i.speciesC))
      return [b && `Warstwa B: ${b}`, c && `warstwa C: ${c}`].filter(Boolean).join(', ')
    },
  },
  {
    id: 'complex',
    label: 'Naturalny kompleks siedlisk subalpejskich',
    parameter: 'structure',
    description:
      'Lista zbiorowisk na transekcie z przybliżonym procentem pokrycia (z dokładnością do 10%). Typowy kompleks subalpejski to zarośla kosodrzewiny, biogrupy świerkowe, zarośla jałowca halnego i niewielkie płaty borówczysk, psiar i ziołorośli.',
    help: `Co wpisać: udział kosodrzewiny w kompleksie roślinności na transekcie i jakie siedliska jej towarzyszą. Zbiorowiska z procentami wpisz w opisie (np. „Liściaste zarośla subalpejskie z jarzębem i wierzbą śląską 40%; biogrupy świerkowe 20%”).

Progi (tab. 2): udział kosodrzewiny >50%, występują tylko naturalne siedliska subalpejskie – FV; udział kosodrzewiny <50%, poza naturalnymi siedliskami także spory udział siedlisk związanych z wypasem (np. psiar) – U1; dominacja siedlisk półnaturalnych – U2.

Jak liczy formularz: dominacja półnaturalnych → U2; spory udział siedlisk powypasowych → U1; tylko naturalne i kosodrzewina >50% → FV, ≤50% → U1. Pole „Udział kosodrzewiny” puste → formularz bierze udział siedliska na transekcie. Gdy w tym piętrze nie ma zbiorowisk subalpejskich (sprawozdanie 2021, Polica 2 – ok. 1370 m n.p.m.), wybierz ostatnią opcję – ocena XX.`,
    thresholds: {
      FV: 'Udział kosodrzewiny >50%, występują tylko naturalne siedliska subalpejskie',
      U1: 'Udział kosodrzewiny <50%; poza naturalnymi siedliskami także spory udział siedlisk związanych z wypasem, np. psiar',
      U2: 'Dominacja siedlisk półnaturalnych',
    },
    inputs: [
      { kind: 'number', name: 'mugo', label: 'Udział kosodrzewiny (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Udział zarośli kosodrzewiny w mozaice roślinności na transekcie, w procentach. Puste – formularz weźmie „Udział procentowy siedliska na transekcie”.' },
      { kind: 'select', name: 'companions', label: 'Siedliska towarzyszące', options: [{ value: '', label: '—' }, ...COMPANIONS], required: true, help: 'Jakie siedliska tworzą kompleks z kosodrzewiną na transekcie: tylko naturalne subalpejskie, także powypasowe (psiary, hale), czy półnaturalne dominują.' },
      noteInput('Lista zbiorowisk (opcjonalnie)', 'np. Liściaste zarośla subalpejskie z Sorbus aucuparia subsp. glabrata, Salix silesiaca 40%; biogrupy świerkowe 20%', 'Zbiorowiska z przybliżonym procentem pokrycia transektu – trafi do „wartości” w karcie.'),
    ],
    suggest: (i, ctx) => gradeComplex4070(complexMugo(i, ctx?.indicators?.share?.inputs?.value).value, String(i.companions ?? '')),
    explain: (i, ctx) => {
      const m = complexMugo(i, ctx?.indicators?.share?.inputs?.value)
      return m.fromShare && m.value !== undefined ? `Udział kosodrzewiny wzięty z udziału siedliska na transekcie: ${pct(m.value)}.` : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const m = num(i.mugo)
      return [m !== undefined ? `kosodrzewina ${pct(m)}` : '', i.companions ? labelOf(COMPANIONS, i.companions).toLowerCase() : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'damage',
    label: 'Zniszczenia mechaniczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Przyczyna zniszczeń pędów kosodrzewiny i procent zniszczonych pędów. Najlepszy wskaźnik wpływu człowieka na siedlisko; zniszczenia ograniczają się zwykle do strefy do 5 m od szlaku i poza nią nie wpływają na dynamikę zarośli.',
    help: `Co wpisać: jaki procent pędów kosodrzewiny na transekcie jest zniszczony mechanicznie (połamany, przycięty, okorowany, wydeptany) i z jakiej przyczyny: ruch turystyczny, schodzenie ze szlaku, narty, przycinanie przy szlaku, budowa infrastruktury.

Progi (tab. 2): zniszczenia nie większe niż 5% – FV; od 5 do 30% – U1; większe od 30% – U2. Granica 5% należy do FV, 30% – do U1.

Wskaźnik kardynalny. Sprawozdanie 2021: U1 za wyraźne wydeptywanie okolic szlaku (Sokolica) i stare, mocne przycięcie pędów przy szlaku (Pilsko nad Kozińcem); U2 za uszkodzenia krzewów przez narty (Pilsko – zachodnie zbocze).`,
    thresholds: { FV: 'Zniszczenia mechaniczne nie większe niż 5%', U1: 'Zniszczenia od 5 do 30%', U2: 'Zniszczenia większe od 30%' },
    inputs: [
      { kind: 'number', name: 'value', label: 'Zniszczone pędy kosodrzewiny', unit: '%', min: 0, max: 100, required: true, help: 'Procent zniszczonych pędów kosodrzewiny na transekcie. W karcie z przewodnika: ok. 5%.' },
      { kind: 'text', name: 'cause', label: 'Przyczyna (opcjonalnie)', placeholder: 'np. ruch turystyczny', help: 'Główna przyczyna zniszczeń: ruch turystyczny, narciarstwo, przycinanie przy szlaku, infrastruktura – trafi do „wartości”.' },
      noteInput('Opis (opcjonalnie)', 'np. W niewielkim stopniu ok. 5%, głównie w wyniku ruchu turystycznego…', 'Opis jak w karcie papierowej – trafi do „wartości” zamiast procentu i przyczyny.'),
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v !== undefined ? gradeDamage4070(v) : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const v = num(i.value)
      return [v !== undefined ? pct(v) : '', String(i.cause ?? '').trim()].filter(Boolean).join(', ')
    },
  },
  {
    id: 'needles',
    label: 'Obumieranie igieł kosodrzewiny',
    parameter: 'structure',
    description:
      'Występowanie zjawiska i skala (procent krzewów dotkniętych nadmiernym obumieraniem igieł). Obumieranie igieł do 10% to naturalne zjawisko związane z biologią kosodrzewiny – występuje także w doskonale zachowanych zaroślach.',
    help: `Co wpisać: jaki procent krzewów kosodrzewiny na transekcie ma nadmiernie obumierające (brązowiejące, opadające) igły – liczba („10”), „do 10” albo zakres („10–20”, liczony środek). Zamiast liczby możesz wybrać klasę opisową z karty.

Progi (tab. 2): do 10% – FV; od 10 do 30% – U1; więcej niż 30% – U2. Granica 10% należy do FV, 30% – do U1. Klasy z karty: igły w większości zdrowe – FV; nadmierne obumieranie na dużej ilości krzewów – U1; nadmierne obumieranie często obserwowane – U2.

Sprawozdanie 2021: U2 na Policy (tylko martwe pędy bez igieł); na Pilsku utratę igliwia spowodowało nadmierne przycięcie rozgałęzień – po odrośnięciu ocena wróciła do FV.`,
    thresholds: { FV: 'Do 10% (igły w większości zdrowe)', U1: 'Od 10 do 30% (nadmierne obumieranie igieł na dużej ilości krzewów)', U2: 'Większe niż 30% (nadmierne obumieranie igieł często obserwowane)' },
    inputs: [
      { kind: 'text', name: 'value', label: 'Krzewy z obumierającymi igłami', unit: '%', placeholder: 'np. do 10', help: 'Procent krzewów z nadmiernym obumieraniem igieł: liczba, „do 10” albo zakres „10–20”. Liczba ma pierwszeństwo przed klasą.' },
      optionalSelect('Klasa (opcjonalnie)', NEEDLES, 'Klasa opisowa z karty – używana, gdy nie wpisano procentu.'),
      noteInput('Opis (opcjonalnie)', 'np. Na dopuszczalnym poziomie do 10%…', 'Opis jak w karcie papierowej – trafi do „wartości” zamiast procentu.'),
    ],
    suggest: (i) => {
      const r = parsePercent4070(i.value)
      return r ? gradeNeedles4070(r.mid) : (gradeMap(NEEDLES)[String(i.choice)] ?? null)
    },
    explain: (i) => {
      const r = parsePercent4070(i.value)
      return r && r.lo !== r.hi ? `Środek zakresu: ${pct(r.mid)}.` : null
    },
    warn: (i) => {
      const v = String(i.value ?? '').trim()
      if (v && !parsePercent4070(v)) return 'Nie rozumiem procentu – wpisz liczbę, „do 10” albo zakres, np. 10–20.'
      const r = parsePercent4070(v)
      const chosen = gradeMap(NEEDLES)[String(i.choice)]
      if (r && chosen && chosen !== gradeNeedles4070(r.mid)) return `Klasa ${chosen} nie zgadza się z procentem (${gradeNeedles4070(r.mid)}) – liczy się procent.`
      return null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const v = String(i.value ?? '').trim()
      return v ? `${v.replace(/\s*%$/, '')}%` : i.choice ? labelOf(NEEDLES, i.choice) : ''
    },
  },
  {
    id: 'lichens',
    label: 'Bogactwo porostów epifitycznych',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków porostów (polska i łacińska nazwa) oraz średni procent powierzchni pędów pokrytej przez poszczególne gatunki (z dokładnością do 10%). W dobrze zachowanych płatach występuje zespół pięciu porostów o podobnym pokryciu 5–15%.',
    help: `Co wpisać: porosty epifityczne na pędach kosodrzewiny (i jarzębu) wzdłuż transektu, z szacunkowym pokryciem pędów. Formularz liczy pięć gatunków z tab. 2:
• pustułka pęcherzykowata Hypogymnia physodes,
• płaskotka rozlana Parmeliopsis ambigua,
• płaskotka reglowa Parmeliopsis hyperopta,
• mąklik otrębiasty Pseudevernia furfuracea,
• złotlinka jaskrawa Vulpicida pinastri (syn. Cetraria pinastri).
Inne porosty możesz wpisać – zostaną w opisie, do liczby się nie liczą.

Progi (tab. 2): co najmniej cztery z pięciu – FV; co najmniej dwa o pokryciu większym niż 5% – U1; brak lub tylko jeden – U2.

Jak liczy formularz: ≥4 gatunki → FV, 2–3 → U1, 0–1 → U2. Dwa–trzy gatunki o pokryciu ≤5% tab. 2 nie klasyfikuje; sprawozdanie 2021 dało im U1 (Izera: „tylko 2 gatunki o niskim stopniu pokrycia”), formularz też – z ostrzeżeniem.

Wskaźnik kardynalny – w 2021 r. najczęściej obniżał ocenę struktury (Pilsko, Polica). W Karkonoszach biota porostów jest naturalnie uboższa.`,
    thresholds: {
      FV: 'Występują przynajmniej cztery z porostów: Hypogymnia physodes, Parmeliopsis ambigua, P. hyperopta, Pseudevernia furfuracea, Vulpicida pinastri',
      U1: 'Występują przynajmniej dwa z tych porostów o pokryciu większym niż 5%',
      U2: 'Brak lub tylko jeden z tych porostów',
    },
    inputs: [
      speciesInput('Porosty epifityczne', 'Porosty na pędach kosodrzewiny z pokryciem w % powierzchni pędów, np. Hypogymnia physodes 10.'),
      NONE_FIELD('Brak porostów', 'Zaznacz „Nie stwierdzono”, gdy na pędach nie ma żadnego z pięciu porostów – wtedy wskaźnik to U2.'),
      { kind: 'number', name: 'count', label: 'Liczba gatunków z listy (opcjonalnie)', min: 0, max: 5, help: 'Liczba z pięciu porostów wskaźnikowych wpisana wprost – ma pierwszeństwo przed liczeniem z listy.' },
      noteInput('Opis (opcjonalnie)', 'np. Pustułka pęcherzykowata Hypogymnia physodes 10%…', 'Opis jak w karcie papierowej – trafi do „wartości” zamiast samej listy.'),
    ],
    suggest: (i) => {
      const c = lichenCount(i)
      return c === undefined ? null : gradeLichens4070(c)
    },
    explain: (i) => {
      const names = distinct(rowNames(i.species).filter(isIndicatorLichen))
      if (!names.length) return null
      const big = speciesRows(i.species).filter((r) => r.name?.trim() && isIndicatorLichen(r.name) && (num(r.cover) ?? 0) > 5).length
      return `Porostów z tab. 2: ${names.length} (z pokryciem >5%: ${big}).`
    },
    warn: (i) => {
      const parts: string[] = []
      const names = distinct(rowNames(i.species))
      if (i.none === 'yes' && names.length) parts.push('Zaznaczono „Nie stwierdzono”, a lista nie jest pusta.')
      const notLichens = names.filter((n) => findSpecies4070(n) && !isLichen4070(n))
      if (notLichens.length) parts.push(`To nie porosty: ${notLichens.join(', ')}.`)
      const rows = speciesRows(i.species).filter((r) => r.name?.trim() && isIndicatorLichen(r.name))
      const n = distinct(rows.map((r) => r.name)).length
      if (num(i.count) === undefined && n >= 2 && n <= 3 && rows.every((r) => num(r.cover) !== undefined) && rows.filter((r) => (num(r.cover) ?? 0) > 5).length < 2)
        parts.push('Tab. 2 wymaga przy U1 pokrycia >5% co najmniej dwóch gatunków – tu go nie ma. Formularz daje U1 (jak sprawozdanie 2021); oceń ekspercko.')
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      if (!list && i.none === 'yes') return 'nie stwierdzono'
      const c = num(i.count)
      return list || (c !== undefined ? `${plNum(c)} gat.` : '')
    },
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu, z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie.

Dlaczego: transekt zwykle biegnie szlakiem albo starą ścieżką – bez punktów GPS za 6 lat nikt nie odtworzy tego samego odcinka.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Sokolica',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – zwykle szczyt, dolina albo grzbiet, np. „Sokolica”, „Izdebczyska”, „Masyw Pilska – część szczytowa”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego stanowiska.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. badawcze',
    help: `Typ stanowiska w sieci monitoringu, np. „badawcze” albo „referencyjne”. Przewodnik zaleca zagęścić stanowiska w miejscach zagrożonych (okolice stacji narciarskich). Jeśli nie wiesz, zostaw puste.

Dlaczego: przy ocenie regionu stanowiska referencyjne (np. w strefie ochrony ścisłej) pokazują, jak wygląda 4070 bez presji.`,
  },
  {
    kind: 'text',
    name: 'massif',
    label: 'Nazwa obszaru (pasmo, masyw)',
    placeholder: 'np. Babia Góra',
    help: 'Pasmo albo masyw górski, w którym leży stanowisko: Tatry, Babia Góra, Pilsko, Polica, Karkonosze, Góry Izerskie. Przewodnik zaleca 3–10 stanowisk w każdym paśmie.',
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Pinetum mughi carpaticum',
    hint: 'Karpaty: Pinetum mughi carpaticum; Sudety: Pinetum mughi sudeticum.',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Klasa Vaccinio-Piceetea, rząd Vaccinio-Piceetalia, związek Piceion abietis (=Vaccinio-Piceion); zespoły: Pinetum mughi carpaticum – karpackie zarośla kosodrzewiny, Pinetum mughi sudeticum – sudeckie.

Uwaga: rozproszona kosodrzewina w mozaice z murawami to strefa przejściowa do 6150/6170 – do 4070 kwalifikuje się płat, w którym zarośla kosodrzewiny dominują.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Położenie, rzeźba, podłoże, zwarcie i jednolitość płatów, przejście do boru, szlaki i narciarstwo.',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• położenie (szczyt, grzbiet, dolina), wysokość, nachylenie, podłoże (wapienne – rędziny, krystaliczne – rankery);
• zarośla: zwarte czy rozproszone, jednolite czy w mozaice z biogrupami świerka, murawami, piargami, borówczyskami;
• przejście do górnoreglowego boru świerkowego (9410) albo do muraw alpejskich (6150, 6170);
• antropopresja: szlaki, schroniska, wyciągi, nartostrady, przycinanie pędów, śmieci;
• sztuczne nasadzenia (limba, kosodrzewina poza naturalnym zasięgiem – np. Śnieżnik to nie 4070).`,
  },
  {
    kind: 'text',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    required: true,
    placeholder: 'np. 23,5',
    help: 'Łączna powierzchnia płatów 4070 na stanowisku, w hektarach – liczba albo opis jak w karcie („suma powierzchni wydzieleń …”). Przewodnik: stanowisko 5–30 ha. Oszacuj z mapy roślinności albo ortofotomapy.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „Obszar Natura 2000, Babiogórski Park Narodowy”. Brak – „brak”.',
  }),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. Babiogórski Park Narodowy',
    help: `Kto zarządza terenem: najczęściej park narodowy (TPN, BgPN, KPN), poza parkami – Lasy Państwowe albo właściciel stacji narciarskiej.

Dlaczego: od zarządcy zależą modernizacja szlaków, grodzenia i inwestycje narciarskie – główne zagrożenia 4070.`,
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
    hint: 'Jeden transekt 200 m (w karcie 10×200 m), zwykle wzdłuż szlaku.',
    help: `Na każdym stanowisku wyznacza się jeden transekt o długości 200 m – zwykle wzdłuż szlaku turystycznego, a w strefie ochrony ścisłej wzdłuż starych ścieżek, potoku albo grzbietu. Co 100 m (początek, środek, koniec) robi się zdjęcie fitosocjologiczne. Karta z przewodnika podaje wymiary 10×200 m.

Dlaczego: przejście tym samym transektem w kolejnych cyklach pokazuje, jak zmienia się presja turystyczna przy szlaku.`,
    warn: (v) => {
      const m = String(v ?? '').replace(',', '.').match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/)
      if (!m) return null
      return Math.max(Number(m[1]), Number(m[2])) === 200 ? null : 'Metodyka wymaga transektu o długości 200 m. Opisz odstępstwo w uwagach.'
    },
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    help: 'Wysokość nad poziomem morza transektu, z GPS albo mapy. Karpaty: piętro kosodrzewiny ok. 1500–1800 m n.p.m. (w żlebach lawinowych i na skałach niżej), Babia Góra i Pilsko od ok. 1350 m, Karkonosze 1250–1500 m.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 26.08.2007',
    required: true,
    hint: 'Optymalnie lipiec–sierpień.',
    help: `Dzień badań terenowych. Optymalny termin: lipiec–sierpień. Badania powtarza się raz na 6 lat; przy ocenie wpływu działalności człowieka (np. nartostrady) na poziomie obszaru Natura 2000 – co 2 lata.

W 2021 r. jedno stanowisko zbadano 1 września, bo do 31 sierpnia obowiązywała strefa ochrony okresowej gatunku – takie odstępstwo opisz w uwagach.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 7 && m <= 8 ? null : 'Termin poza optymalnym oknem (lipiec–sierpień). Opisz powód w uwagach.'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
  {
    kind: 'text',
    name: 'additionalExperts',
    label: 'Dodatkowi eksperci',
    placeholder: 'np. —',
    help: 'Osoby, które brały udział w badaniu poza wykonawcą (w karcie z przewodnika: „dodatkowi koordynatorzy”). Brak – zostaw puste albo wpisz „—”.',
  },
]

// ---------- zdjęcia fitosocjologiczne: 3 × 100 m² ----------

const r7120 = methodology7120.releves.fields
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia. Zdjęcia robi się co 100 m: na początku, w środku i na końcu transektu.' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach.' }),
  pickField(r7120, 'area', { defaultValue: 100, help: 'Powierzchnia zdjęcia w m². W karcie z przewodnika: 100 m².' }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Zarośla kosodrzewiny rosną często na stromych stokach (w karcie 15–20°).' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, SW). Dla powierzchni płaskiej zostaw puste albo wpisz „brak”.' }),
  layerField('coverA', 'Warstwa A – drzewa: procent powierzchni zdjęcia pod koronami drzew (biogrupy świerka, limba). W zwartej kosodrzewinie zwykle 0; przy górnej granicy lasu 30–70% (karta z przewodnika).\n\nDlaczego: rosnące zwarcie A to wkraczanie boru górnoreglowego – w 2021 r. obniżało ocenę gatunków typowych i dominujących.', { groupCols: 4 }),
  layerField('coverB', 'Warstwa B – krzewy: procent powierzchni zdjęcia pod kosodrzewiną, jarzębem, wierzbą śląską, jałowcem (rzut pionowy). W zwartych zaroślach 80–100%.\n\nDlaczego: zwarcie B to stan samych zarośli.'),
  layerField('coverC', 'Warstwa C – zielna i krzewinki: procent powierzchni zdjęcia pod borówkami, śmiałkiem, wietlicą, paprociami.\n\nDlaczego: w luce zarośli rośnie pokrycie C – łany maliny i wierzbówki to sygnał przerzedzenia.'),
  layerField('coverD', 'Warstwa D – mszysta: procent powierzchni zdjęcia pod mchami i wątrobowcami (rokietnik, gajnik, płaszczeńce, płonnik). Pod zwartą kosodrzewiną zwykle niewielki.'),
  layerField('heightA', 'Warstwa A – typowa wysokość drzew, w metrach (w karcie z przewodnika 5–10 m). Brak warstwy = 0.'),
  layerField('heightB', 'Warstwa B – typowa wysokość zarośli kosodrzewiny, w metrach (zwykle 1,5–2,5 m).'),
  layerField('heightC', 'Warstwa C – typowa wysokość runa, w centymetrach (karta z przewodnika: 0,5–1 m, czyli 50–100 cm).'),
  layerField('heightD', 'Warstwa D – typowa wysokość mszaków, w centymetrach (karta z przewodnika: 0,03–0,05 m, czyli 3–5 cm).'),
  pickField(r7120, 'unit', { placeholder: 'np. Pinetum mughi carpaticum', help: 'Jednostka fitosocjologiczna zdjęcia, zwykle Pinetum mughi carpaticum (Karpaty) albo Pinetum mughi sudeticum (Sudety).' }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w poletku z ilościowością w skali Braun-Blanqueta (r, +, 1–5): warstwa A – drzewa, B – kosodrzewina i krzewy, C – runo, D – mszaki. Warstwa podpowiada się sama po wyborze gatunku.',
  }),
]

export const methodology4070: Methodology = {
  code: '4070',
  name: 'Zarośla kosodrzewiny',
  source:
    'Mróz W. 2010, Zarośla kosodrzewiny Pinetum mugo, [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ, s. 84–94 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014 i 2021.',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj 3 zdjęcia fitosocjologiczne po 100 m² co 100 m transektu: na początku, w środku i na końcu. Ilościowość w skali Braun-Blanqueta; warstwy A (drzewa), B (kosodrzewina i krzewy), C (runo), D (mszaki).',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Perspektywy zachowania siedliska przy analizie czynników realnie oddziałujących na nie w najbliższej przyszłości. Właściwe są dla zwartych zarośli objętych ochroną ścisłą albo położonych w parkach narodowych z dala od bardziej uczęszczanych szlaków.',
    help: `Weź pod uwagę: plany rozwoju infrastruktury narciarskiej i rekreacyjnej, presję ruchu pieszego wzdłuż szlaków, schodzenie ze szlaków, przycinanie pędów, śmieci i eutrofizację przy szlaku, sukcesję świerka w niższych położeniach.

Przewodnik (tab. 1): perspektywy w Tatrach i na Babiej Górze są bardzo dobre (parki narodowe, duże powierzchnie), wyraźnie gorsze tam, gdzie siedlisko zajmuje niewielkie powierzchnie (Pilsko). Kosodrzewina jest bardzo żywotna – drobne zniszczenia przy szlakach nie mają znaczenia w Tatrach, ale na Pilsku mogą mieć dramatyczne skutki.

Praktyka 2021: U1 za wpływ ruchu turystycznego i naturalne zmiany (wkraczanie świerka); U2 – Pilsko (narciarstwo) i Polica (zanik siedliska).`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających (np. plany rozwoju infrastruktury narciarskiej i rekreacyjnej), nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'B02.02', name: 'Wycinka lasu' },
    { code: 'D01', name: 'Drogi, ścieżki i drogi kolejowe' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D02', name: 'Sieci usługowe (linie energetyczne, telekomunikacyjne)' },
    { code: 'E01.04', name: 'Inne typy zabudowy' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'F04', name: 'Pozyskiwanie / usuwanie roślin lądowych, ogólnie' },
    { code: 'G01', name: 'Sporty i różne formy czynnego wypoczynku, rekreacji, uprawiane w plenerze' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
    { code: 'G01.04.01', name: 'Turystyka górska i wspinaczka' },
    { code: 'G01.06', name: 'Narciarstwo, w tym poza trasami' },
    { code: 'G02', name: 'Infrastruktura sportowa i rekreacyjna' },
    { code: 'G02.02', name: 'Kompleksy narciarskie' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'G05.04', name: 'Wandalizm' },
    { code: 'H04', name: 'Zanieczyszczenie powietrza, zanieczyszczenia przenoszone drogą powietrzną' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K04.03', name: 'Wprowadzanie chorób (mikrobiologicznych patogenów)' },
    { code: 'L04', name: 'Lawina' },
    { code: 'M01', name: 'Zmiany warunków abiotycznych' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: [
    ...methodology7120.otherFields.flatMap((f): FieldDef[] => {
      if (f.name === 'otherValues')
        return [
          {
            ...f,
            hint: 'Np. kompleks z 9410, 6150/6170; rzadkie gatunki flory i fauny subalpejskiej.',
            help: 'Wartości przyrodnicze stanowiska poza samymi zaroślami: sąsiednie siedliska (górnoreglowy bór świerkowy 9410, murawy alpejskie 6150/6170, borówczyska bażynowe 4060, zarośla wierzbowe 4080), rzadkie i chronione gatunki roślin i zwierząt. Brak informacji – „Nie stwierdzono” albo „Nie pozyskano danych”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            label: 'Wykonywane zabiegi ochronne i ocena ich skuteczności',
            help: 'Jakie działania ochronne wykonano i z jakim skutkiem, np. modernizacja szlaków ograniczająca schodzenie z nich, grodzenia, sprzątanie szlaków. Właściwą formą ochrony 4070 jest ochrona bierna, najlepiej ścisła. Brak działań – „Brak działań”.',
          },
          {
            kind: 'textarea',
            name: 'proposals',
            label: 'Propozycje wprowadzenia działań ochronnych',
            rows: 4,
            hint: 'Np. grodzenie szlaku w miejscach silnej penetracji; rezygnacja z rozbudowy tras narciarskich.',
            help: 'Jakie działania proponujesz, konkretnie: grodzenia i modernizacja szlaków, punkty sanitarne w miejscach zbiorczych, zakaz przycinania pędów, rezygnacja z rozbudowy infrastruktury narciarskiej, kontrola ruchu poza szlakami. Brak – „Brak”.',
          },
        ]
      if (f.name === 'notes')
        return [
          {
            kind: 'number',
            name: 'shareFV',
            group: 'Powierzchnia siedliska o różnym stanie zachowania',
            label: 'Udział powierzchni siedliska w stanie FV',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Karta z przewodnika podaje przy ocenie ogólnej udział procentowy powierzchni siedliska o różnym stanie zachowania na całym stanowisku (Sokolica: FV 100%, U1 0%, U2 0%). Trzy liczby powinny dać razem 100%.',
          },
          {
            kind: 'number',
            name: 'shareU1',
            group: 'Powierzchnia siedliska o różnym stanie zachowania',
            label: 'Udział powierzchni siedliska w stanie U1',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Procent powierzchni siedliska na stanowisku w stanie niezadowalającym (U1).',
          },
          {
            kind: 'number',
            name: 'shareU2',
            group: 'Powierzchnia siedliska o różnym stanie zachowania',
            label: 'Udział powierzchni siedliska w stanie U2',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Procent powierzchni siedliska na stanowisku w stanie złym (U2).',
          },
          {
            ...f,
            help: `${f.help ?? ''}\n\nDla 4070 zapisz tu także: rok i typ monitoringu, czy monitoring jest wymagany i dlaczego (np. „stanowisko badawcze, co 5 lat”) oraz odstępstwa od metodyki (termin, przebieg transektu).`.trim(),
          },
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_4070.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer4070(s) })),
  speciesInfo: (name) => {
    const e = findSpecies4070(name)
    return e ? GROUP_LABELS_4070[e.group] : undefined
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator4070 = (id: string): IndicatorDef => {
  const i = methodology4070.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 4070`)
  return i
}
