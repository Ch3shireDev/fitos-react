// Metodyka 6150 (wysokogórskie murawy acidofilne Juncion trifidi i bezwapienne wyleżyska śnieżne Salicion herbaceae)
// jako dane. Źródło: Kozak M., Kozłowska K., Mróz W. 2012, „6150 Wysokogórskie murawy acydofilne (Juncion trifidi)
// i bezwapienne wyleżyska śnieżne (Salicion herbaceae)” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych.
// Przewodnik metodyczny, cz. II, GIOŚ, s. 282–298 (tab. 1 i 2, karta Kopa Kondracka), z praktyką oceny ze sprawozdań
// z monitoringu 2009–2011, 2015–2018 (badania 2016) i 2020–2021 (badania 2021).
// Siedlisko niepriorytetowe, regiony alpejski (Tatry, Babia Góra, Bieszczady) i kontynentalny (Karkonosze, Śnieżnik).
// Transekt ok. 100–200 × 10–15 m (po poziomicy), 3 zdjęcia 5 × 5 m (początek, środek, koniec); przy wyleżyskach – stanowiska punktowe.
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_6150,
  SPECIES_6150,
  defaultLayer6150,
  findSpecies6150,
  hasOwnIndicator6150,
  isCharacteristic6150,
  isSynanthropic6150,
  isWoody6150,
  speciesKey6150,
} from './species'

// ---------- progi liczbowe (tab. 2) ----------

/** Ekspansja borówki czarnej: <10% FV; 10–50% U1 (obie granice); >50% U2. */
export const gradeBilberry6150 = (cover: number): Grade => (cover < 10 ? 'FV' : cover <= 50 ? 'U1' : 'U2')

/** Ekspansja krzewów i podrostu drzew: <10% FV; 10–25% U1 (obie granice); >25% U2. */
export const gradeShrubs6150 = (cover: number): Grade => (cover < 10 ? 'FV' : cover <= 25 ? 'U1' : 'U2')

/** Gatunki charakterystyczne: >5 FV; 3–5 U1; <3 U2. */
export const gradeCharacteristic6150 = (count: number): Grade => (count > 5 ? 'FV' : count >= 3 ? 'U1' : 'U2')

/** Gatunki ekspansywne – łączne pokrycie: <10% FV; 10–50% U1 (obie granice); >50% U2. */
export const gradeExpansive6150 = (cover: number): Grade => (cover < 10 ? 'FV' : cover <= 50 ? 'U1' : 'U2')

/**
 * Obce gatunki inwazyjne (w praktyce: synantropijne): zupełny brak – FV; pojedyncze osobniki tylko jednego gatunku
 * o pokryciu <10% – U1 (granicę 10% formularz liczy do U1); kilka gatunków albo jeden o pokryciu >10% – U2.
 */
export function gradeAliens6150(count: number, cover?: number): Grade {
  if (count <= 0) return 'FV'
  if (count >= 2) return 'U2'
  return cover !== undefined && cover > 10 ? 'U2' : 'U1'
}

/** Procent powierzchni transektu zajęty przez siedlisko: >75 FV; 50–75 U1 (obie granice); <50 U2. */
export const gradeHabitatShare6150 = (share: number): Grade => (share > 75 ? 'FV' : share >= 50 ? 'U1' : 'U2')

/** Występowanie śmiałka pogiętego: <10% FV; 10–25% U1 (obie granice); >25% U2. */
export const gradeDeschampsia6150 = (cover: number): Grade => (cover < 10 ? 'FV' : cover <= 25 ? 'U1' : 'U2')

/** Zniszczenia mechaniczne – % powierzchni transektu: 0 FV; do 25% U1 (25 też); >25% U2. */
export const gradeMechanical6150 = (share: number): Grade => (share <= 0 ? 'FV' : share <= 25 ? 'U1' : 'U2')

const pct = (v: number) => `${plNum(v)}%`
const round1 = (n: number) => Math.round(n * 10) / 10
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey6150(n), n])).values()]
const subtypeOf = (ctx?: { site?: InputValues }) => String(ctx?.site?.subtype ?? '')

/** Suma pokrycia wierszy listy spełniających warunek; 'present' – są wiersze, ale bez pokrycia; undefined – brak wierszy. */
function sumCover(list: unknown, pred: (name: string) => boolean = () => true): number | 'present' | undefined {
  const rows = speciesRows(list).filter((r) => r.name?.trim() && pred(r.name.trim()))
  if (!rows.length) return undefined
  const covers = rows.map((r) => num(r.cover)).filter((c): c is number => c !== undefined)
  return covers.length ? round1(covers.reduce((a, b) => a + b, 0)) : 'present'
}

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Powierzchnia stabilna lub zwiększa się (siedlisko zajmuje całą dostępną powierzchnię stanowiska)', grade: 'FV' },
  { value: 'minor', label: 'Niewielki spadek powierzchni albo silna fragmentacja płatów (np. erozja przy szlakach i trasach narciarskich)', grade: 'U1' },
  { value: 'decrease', label: 'Wyraźny spadek powierzchni siedliska', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const MECHANICAL: GradedOption[] = [
  { value: 'none', label: 'Brak zniszczeń (nie uwzględnia się zniszczeń związanych z procesami geomorfologicznymi)', grade: 'FV' },
  {
    value: 'minor',
    label: 'Pojedyncze ślady antropopresji na niewielkiej powierzchni, np. w postaci jednej lub najwyżej kilku mało uczęszczanych ścieżek',
    grade: 'U1',
  },
  { value: 'major', label: 'Zniszczenia dotyczą ponad 25% powierzchni transektu', grade: 'U2' },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

/** Select niewymagany – gdy liczba wystarcza, nie trzeba go wybierać. */
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
const coverInput = (label: string, help: string): FieldDef => ({ kind: 'number', name: 'cover', label, unit: '%', min: 0, max: 100, help })

/** Łączne pokrycie: wpisane wprost > suma z listy > 0 przy „nie stwierdzono”. 'present' – lista bez pokrycia. */
function coverOf(i: InputValues, pred?: (name: string) => boolean): number | 'present' | undefined {
  const t = num(i.total)
  if (t !== undefined) return t
  const s = sumCover(i.species, pred)
  if (s !== undefined) return s
  return i.none === 'yes' ? 0 : undefined
}

/** Pokrycie jednego gatunku (borówka czarna, śmiałek): liczba > „nie stwierdzono” (0). */
const singleCover = (i: InputValues): number | undefined => num(i.cover) ?? (i.none === 'yes' ? 0 : undefined)

const describeList = (i: InputValues) => {
  if (note(i)) return note(i)
  const list = describeSpecies(speciesRows(i.species))
  const t = num(i.total)
  if (list) return t !== undefined ? `${list} – łącznie ${pct(t)}` : list
  if (t !== undefined) return `Łącznie ${pct(t)}`
  return i.none === 'yes' ? 'Brak' : ''
}

// ---------- podtypy (przewodnik, pkt 2) ----------

export const SUBTYPES_6150 = ['6150-1', '6150-2', '6150-3', '6150-4'] as const
export const SUBTYPE_LABELS_6150: Record<(typeof SUBTYPES_6150)[number], string> = {
  '6150-1': '6150-1 – Wysokogórskie murawy acydofilne hal i połonin w Karpatach',
  '6150-2': '6150-2 – Murawy acydofilne piętra subniwalnego Tatr',
  '6150-3': '6150-3 – Wysokogórskie murawy acydofilne w Sudetach',
  '6150-4': '6150-4 – Wysokogórskie bezwapienne wyleżyska śnieżne',
}
export const SUBTYPE_OPTIONS: SelectOption[] = [{ value: '', label: '—' }, ...SUBTYPES_6150.map((s) => ({ value: s, label: SUBTYPE_LABELS_6150[s] }))]

// ---------- gatunki charakterystyczne ----------

const characteristicNames = (i: InputValues) => distinct(rowNames(i.species).filter(isCharacteristic6150))
function characteristicCount(i: InputValues): number | undefined {
  const c = num(i.count)
  if (c !== undefined) return c
  return rowNames(i.species).length ? characteristicNames(i).length : undefined
}

// ---------- wskaźniki ----------

const SURFACE = 'w % powierzchni transektu (z dokładnością do ok. 5%; „zwarcie znikome” to 0–5%)'

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description:
      'Powierzchnia siedliska na stanowisku i jej zmiany w porównaniu z wcześniejszymi badaniami. Tab. 2 przewodnika nie podaje progów dla tego parametru – ocena wg zasad ogólnych i praktyki sprawozdań.',
    help: `Co wybrać: czy powierzchnia płatów 6150 na stanowisku jest stabilna, czy maleje albo się rozpada (erozja, wydeptywanie, zarastanie). Samą powierzchnię wpisz obok – trafi do „wartości”.

Progi: tab. 2 przewodnika ich nie podaje (ma tylko wskaźniki struktury, perspektywy i ocenę ogólną). Formularz stosuje zasadę ogólną i praktykę sprawozdań: powierzchnia stabilna – FV; niewielki spadek albo silna fragmentacja – U1; wyraźny spadek – U2. Przy pierwszym badaniu i braku danych – „Brak danych do porównania” (XX) albo ocena ekspercka.

Praktyka: 2009–2011 Babia Góra – U1 za fragmentację płatów; 2021 Kasprowy Wierch 2 – U1 za erozję przy trasie narciarskiej i szlaku, Połonina Wetlińska – U1 (małe, rozproszone płaty), Mały Śnieżny Kocioł i Śnieżnik – U1 za zmniejszanie się areału. Małe, ale stabilne wyleżysko (kilkadziesiąt m²) – FV. Karta z przewodnika (Kopa Kondracka): „Siedlisko zajmuje 100% powierzchni stanowiska”, areał stabilny → FV.`,
    thresholds: thresholdsOf(AREA.filter((o) => o.grade !== 'XX')),
    inputs: [
      selectInput('Zmiana powierzchni', AREA, 'Jak zmieniła się powierzchnia siedliska od poprzedniego badania (albo w porównaniu z mapą roślinności parku).'),
      { kind: 'text', name: 'areaText', label: 'Powierzchnia (opcjonalnie)', placeholder: 'np. 0,12 ha', help: 'Powierzchnia płatów siedliska na stanowisku albo w transekcie, np. „0,12 ha (100% transektu)” – trafi do pola „wartość”, gdy nie ma opisu.' },
      noteInput('Opis (opcjonalnie)', 'np. Siedlisko zajmuje 100% powierzchni stanowiska.', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => note(i) || String(i.areaText ?? '').trim() || labelOf(AREA, i.choice),
  },
  {
    id: 'bilberry',
    label: 'Ekspansja borówki czarnej Vaccinium myrtillus',
    parameter: 'structure',
    description:
      'Odnotowanie liczebności borówki czarnej Vaccinium myrtillus – szacunkowe pokrycie (z dokładnością do ok. 5%) tego gatunku na całym transekcie. Zwarcie 0–5% określa się jako „znikome”. Gatunek jest naturalnym składnikiem płatów siedliska – niepożądany jest dopiero znaczny wzrost zwarcia.',
    help: `Co wpisać: szacunkowe pokrycie borówki czarnej ${SURFACE}. Gdy jej nie ma – „Nie stwierdzono”.

Progi (tab. 2): <10% – FV; 10–50% – U1; >50% – U2. Granice 10% i 50% formularz liczy do U1.

Przewodnik: arbitralnie przyjęto, że borówka może stanowić zagrożenie dopiero przy zwarciu przekraczającym ok. 10%. Praktyka: w Tatrach zwykle 0–10% (FV), na Babiej Górze 20–35% (U1), na Połoninie Wetlińskiej w Bieszczadach 60% (U2, 2021). Sprawozdanie 2016 zastrzega, że stały udział borówki nie musi oznaczać ekspansji. Karta z przewodnika (Kopa Kondracka): „Zwarcie znikome (ok. 1–2%)” → FV.`,
    thresholds: { FV: '<10%', U1: '10–50%', U2: '>50%' },
    inputs: [
      coverInput('Pokrycie borówki czarnej', `Szacunkowe pokrycie Vaccinium myrtillus ${SURFACE}. Dla „ok. 1–2%” wpisz 2.`),
      NONE_FIELD('Brak borówki czarnej', 'Zaznacz „Nie stwierdzono”, gdy borówki czarnej nie ma na transekcie – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Zwarcie znikome (ok. 1–2%).', 'Krótki opis, który trafi do „wartości” w karcie zamiast samej liczby.'),
    ],
    suggest: (i) => {
      const c = singleCover(i)
      return c === undefined ? null : gradeBilberry6150(c)
    },
    warn: (i) => (i.none === 'yes' && (num(i.cover) ?? 0) > 0 ? 'Zaznaczono „Nie stwierdzono”, a pokrycie jest większe od zera.' : null),
    describe: (i) => {
      if (note(i)) return note(i)
      const c = num(i.cover)
      return c !== undefined ? pct(c) : i.none === 'yes' ? 'Brak' : ''
    },
  },
  {
    id: 'shrubs',
    label: 'Ekspansja krzewów i podrostu drzew',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista drzew i krzewów wraz z ich szacunkowym zwarciem w transekcie (w %, z dokładnością do ok. 5%). Krzewy to rośliny zdrewniałe o wysokości powyżej 50 cm – wyjątkiem są mocno zwarte osobniki kosodrzewiny, które rozrastając się wszerz mogą być niższe.',
    help: `Co wpisać: drzewa i krzewy na transekcie (kosodrzewina, świerk, jałowiec halny, jarząb, wierzba śląska) z pokryciem ${SURFACE}. Łączne zwarcie wpisz wprost albo zostaw – formularz zsumuje listę. Pomiń zdrewniałe rośliny niższe niż 50 cm (karłowate świerki, wierzby) – z wyjątkiem zwartych, płożących się kęp kosodrzewiny.

Progi (tab. 2): <10% – FV; 10–25% – U1; >25% – U2. Granice 10% i 25% formularz liczy do U1.

Praktyka: w Tatrach i Karkonoszach kosodrzewina zwykle poniżej 5% (FV); Babia Góra 5–9% (FV), Gówniak 03 20–25% (U1, 2016); w 2009–2011 przy 5–10% oceniano ekspercko na U1 – w 2016 uznano to za zmianę pozorną. Pojedyncze kosodrzewiny (do 25 m²) są integralną częścią siedliska. Karta z przewodnika (Kopa Kondracka): „Zwarcie znikome (ok. 2%) (kosodrzewina, świerk)” → FV.

Wskaźnik kardynalny.`,
    thresholds: { FV: '<10%', U1: '10–25%', U2: '>25%' },
    inputs: [
      speciesInput('Drzewa i krzewy', `Drzewa i krzewy powyżej 50 cm z pokryciem ${SURFACE}, np. Pinus mugo 2.`),
      totalInput('Łączne zwarcie drzew i krzewów (opcjonalnie)', 'Łączne zwarcie drzew i krzewów w % powierzchni transektu – ma pierwszeństwo przed sumą z listy (np. „ok. 2%” dla kilku gatunków razem).'),
      NONE_FIELD('Brak drzew i krzewów', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma drzew ani krzewów powyżej 50 cm – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Zwarcie znikome (ok. 2%) (kosodrzewina Pinus mugo, świerk pospolity Picea abies).', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = coverOf(i)
      return typeof c === 'number' ? gradeShrubs6150(c) : null
    },
    explain: (i) => {
      const c = coverOf(i)
      if (c === 'present') return 'Drzewa i krzewy bez pokrycia – wpisz pokrycie gatunków albo łączne zwarcie.'
      return typeof c === 'number' && c > 0 ? `Zwarcie drzew i krzewów: ${pct(c)}.` : null
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista albo zwarcie nie są puste.')
      const herbs = names.filter((n) => findSpecies6150(n) && !isWoody6150(n))
      if (herbs.length) parts.push(`To nie drzewa ani krzewy: ${herbs.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'characteristic',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków charakterystycznych oraz wyróżniających dla zbiorowisk ze związków Juncion trifidi oraz Salicion herbaceae (Matuszkiewicz 2001). Oprócz obecności istotna jest również częstość ich występowania – gdy gatunki te nie są dominujące na transekcie, należy obniżyć wartość wskaźnika.',
    help: `Co wpisać: gatunki charakterystyczne stwierdzone na transekcie (nazwy polskie i łacińskie; pokrycie opcjonalnie). Katalog zna wykaz z przewodnika (pkt 4: m.in. sit skucina, boimka dwurzędowa, kostrzewa niska, mietlica skalna, owsica pstra, dzwonek alpejski, jastrzębiec alpejski, wroniec widlasty, sasanka alpejska, turzyca tęga, wierzba zielna, sybaldia, płonnik górski, porosty: płucnica islandzka, chrobotki, oskrzelki, szydlina) oraz gatunki dopisywane w sprawozdaniach i w opisie regionalnym (rozchodnik alpejski, wierzbownica drobnolistna, przetacznik alpejski, omieg kozłowiec, turzyca czarniawa; Sudety – dzwonek karkonoski; Bieszczady – pięciornik złoty, macierzanka halna, sesleria Bielza). Liczbę gatunków możesz wpisać wprost.

Progi (tab. 2): >5 gatunków – FV; 3–5 – U1; <3 – U2.

Jak liczy formularz: ocena wybrana w polu ma pierwszeństwo; bez niej liczba wpisana wprost, a bez niej gatunki z listy znane katalogowi jako charakterystyczne (synonimy raz). Przewodnik każe obniżyć ocenę, gdy gatunki nie dominują na transekcie – to wybierz ręcznie. Praktyka: Tatry 5–16 gatunków (FV), Babia Góra 6–8 (FV od 2016), Bieszczady 4 bez pięciornika złotego (U1, 2021). Wyleżyska (6150-4) bywają naturalnie bardzo ubogie: Mały Śnieżny Kocioł z 1 gatunkiem (płonnik ok. 70%) dostał w 2016 i 2021 r. U1 zamiast U2 z tab. 2. Karta z przewodnika (Kopa Kondracka): 9 gatunków, dominują na transekcie → FV.

Wskaźnik kardynalny.`,
    thresholds: { FV: '>5', U1: '3–5', U2: '<3' },
    inputs: [
      speciesInput('Gatunki charakterystyczne', 'Gatunki charakterystyczne stwierdzone na transekcie, np. Juncus trifidus, Oreochloa disticha, Festuca airoides. Pokrycie nie jest wymagane.'),
      { kind: 'number', name: 'count', label: 'Liczba gatunków charakterystycznych (opcjonalnie)', min: 0, help: 'Łączna liczba gatunków charakterystycznych na transekcie, wpisana wprost – ma pierwszeństwo przed liczeniem z listy.' },
      {
        kind: 'select',
        name: 'choice',
        label: 'Ocena (opcjonalnie)',
        options: [{ value: '', label: '—' }, ...(['FV', 'U1', 'U2'] as const).map((g) => ({ value: g, label: g }))],
        help: 'Ocena ekspercka – ma pierwszeństwo przed liczbą gatunków. Wybierz ją, gdy gatunki charakterystyczne nie dominują na transekcie albo gdy wyleżysko jest naturalnie ubogie.',
      },
      noteInput('Opis (opcjonalnie)', 'np. Dziewięć gatunków: mietlica skalna Agrostis rupestris, … Gatunki te zdecydowanie dominują na transekcie.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const g = String(i.choice ?? '')
      if (g === 'FV' || g === 'U1' || g === 'U2') return g
      const c = characteristicCount(i)
      return c === undefined ? null : gradeCharacteristic6150(c)
    },
    explain: (i) => {
      if (i.choice) return null
      const c = characteristicCount(i)
      if (c === undefined) return null
      if (num(i.count) !== undefined) return `Gatunków charakterystycznych: ${plNum(c)}.`
      const names = characteristicNames(i)
      return `Gatunki charakterystyczne z katalogu: ${names.length}${names.length ? ` (${names.join(', ')})` : ''}.`
    },
    warn: (i, ctx) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      const other = names.filter((n) => findSpecies6150(n) && !isCharacteristic6150(n))
      if (other.length) parts.push(`Nie liczą się jako charakterystyczne: ${other.join(', ')}.`)
      const g = String(i.choice ?? '')
      const c = characteristicCount(i)
      if ((g === 'FV' || g === 'U1' || g === 'U2') && c !== undefined && g !== gradeCharacteristic6150(c))
        parts.push(`Wybrano ${g}, a z liczby gatunków wychodzi ${gradeCharacteristic6150(c)} – uzasadnij w opisie.`)
      if (!g && c !== undefined && c < 3 && subtypeOf(ctx) === '6150-4')
        parts.push('Wyleżyska bywają naturalnie bardzo ubogie – w Małym Śnieżnym Kotle 1 gatunek oceniono ekspercko na U1. Rozważ ocenę ekspercką.')
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
    id: 'expansive',
    label: 'Gatunki ekspansywne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Wykaz oraz pokrycie roślin (zielnych oraz drzewiastych) o skłonnościach do występowania w zwartych skupieniach, które stanowią obecnie lub potencjalnie mogą w najbliższym czasie tworzyć zagrożenie dla struktury i różnorodności florystycznej płatów siedliska. Chodzi tylko o gatunki towarzyszące, a nie o rośliny charakterystyczne.',
    help: `Co wpisać: gatunki ekspansywne z pokryciem ${SURFACE}. Sprawozdania: śmiałek pogięty, borówka czarna i brusznica, trzcinnik owłosiony, śmiałek darniowy (Karkonosze), wrzos, malina. Gatunki charakterystyczne formularz pomija – to nie są ekspansywne w rozumieniu przewodnika.

Progi (tab. 2): brak lub nieliczne, o pokryciu <10% – FV; łączne pokrycie 10–50% – U1; >50% – U2. Granice 10% i 50% formularz liczy do U1.

Jak liczy formularz: suma pokrycia gatunków spoza listy charakterystycznych; „nie stwierdzono” → FV. Rozjazd w praktyce: w 2009–2011 śmiałek pogięty obniżał ten wskaźnik na wielu stanowiskach; w 2016 r. uznano to za zmianę pozorną (śmiałek i borówka czarna mają własne wskaźniki) i podniesiono oceny na FV; w 2021 r. na Babiej Górze znowu U1 za śmiałka 20–30%. Formularz liczy je jak tab. 2 (każdy gatunek spoza charakterystycznych) i ostrzega – jeśli nie chcesz liczyć ich podwójnie, wybierz ocenę ręcznie i uzasadnij. Karta z przewodnika (Kopa Kondracka): borówka brusznica <5% → FV.

Ocena wybrana w polu ma pierwszeństwo przed sumą. Wskaźnik kardynalny.`,
    thresholds: { FV: 'Brak lub nieliczne, o pokryciu <10%', U1: 'Łączne pokrycie 10–50%', U2: 'Łączne pokrycie >50%' },
    inputs: [
      speciesInput('Gatunki ekspansywne', `Gatunki ekspansywne z pokryciem ${SURFACE}, np. Vaccinium vitis-idaea 5, Calamagrostis villosa 30. Dla „<5%” wpisz 5.`),
      NONE_FIELD('Brak gatunków ekspansywnych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków ekspansywnych – wtedy wskaźnik to FV.'),
      {
        kind: 'select',
        name: 'choice',
        label: 'Ocena (opcjonalnie)',
        options: [{ value: '', label: '—' }, ...(['FV', 'U1', 'U2'] as const).map((g) => ({ value: g, label: g }))],
        help: 'Ocena ekspercka – ma pierwszeństwo przed sumą pokrycia (np. gdy nie liczysz śmiałka pogiętego i borówki czarnej, które mają osobne wskaźniki).',
      },
      noteInput('Opis (opcjonalnie)', 'np. Borówka brusznica Vaccinium vitis-idaea (<5%).', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const g = String(i.choice ?? '')
      if (g === 'FV' || g === 'U1' || g === 'U2') return g
      const names = rowNames(i.species)
      if (!names.length) return i.none === 'yes' ? 'FV' : null
      const c = sumCover(i.species, (n) => !isCharacteristic6150(n))
      if (c === undefined) return 'FV' // same gatunki charakterystyczne
      return c === 'present' ? null : gradeExpansive6150(c)
    },
    explain: (i) => {
      if (i.choice) return null
      const names = distinct(rowNames(i.species))
      if (!names.length) return null
      const typical = names.filter(isCharacteristic6150)
      const c = sumCover(i.species, (n) => !isCharacteristic6150(n))
      return [
        typical.length ? `Pominięte gatunki charakterystyczne: ${typical.join(', ')}` : '',
        typeof c === 'number' ? `łączne pokrycie gatunków ekspansywnych: ${pct(c)}` : c === 'present' ? 'gatunki bez pokrycia – wpisz pokrycie albo wybierz ocenę' : 'gatunków ekspansywnych: brak',
      ]
        .filter(Boolean)
        .join('; ')
        .concat('.')
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && names.length) parts.push('Zaznaczono „Nie stwierdzono”, a lista nie jest pusta.')
      const own = names.filter(hasOwnIndicator6150)
      if (own.length && !i.choice) parts.push(`${own.join(', ')} – mają też osobne wskaźniki; w 2016 r. nie obniżano za nie tego wskaźnika, w 2021 r. na Babiej Górze tak. Zdecyduj i uzasadnij.`)
      const woody = names.filter(isWoody6150)
      if (woody.length) parts.push(`Drzewa i krzewy wpisz we wskaźniku „Ekspansja krzewów i podrostu drzew”: ${woody.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      return describeSpecies(speciesRows(i.species)) || (i.none === 'yes' ? 'Brak' : '')
    },
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    description:
      'Lista roślin zawleczonych przez człowieka, charakterystycznych dla zbiorowisk synantropijnych – zarówno z innych regionów geograficznych (kenofity), jak i gatunków rodzimych typowych dla zbiorowisk synantropijnych. Taksony takie w płatach muraw zupełnie nie powinny występować.',
    help: `Co wpisać: gatunki zawleczone (głównie przez turystów) z pokryciem ${SURFACE} – także rodzime gatunki synantropijne (jaskier ostry, mietlica pospolita, rogownica pospolita, wiechlina roczna, babka zwyczajna, koniczyna biała, szczaw alpejski przy schroniskach, zęboróg purpurowy). Przewodnik sam proponuje nazwę „gatunki synantropijne” – tak też liczono w 2021 r.

Progi (tab. 2): zupełny brak – FV; pojedyncze osobniki tylko jednego gatunku o pokryciu <10% – U1; kilka gatunków lub tylko jeden gatunek, jeśli jego pokrycie w transekcie wynosi >10% – U2.

Jak liczy formularz: 0 gatunków → FV; jeden gatunek do 10% (granicę 10% formularz liczy do U1) albo bez pokrycia → U1; dwa i więcej gatunków albo jeden powyżej 10% → U2. Liczbę gatunków możesz wpisać wprost. Praktyka: w Tatrach, na Babiej Górze i w Karkonoszach nie stwierdzono ich nigdy (FV); Śnieżnik Kłodzki 2021 – 4 gatunki zawleczone, łącznie ok. 1% → U2. Karta z przewodnika (Kopa Kondracka): brak → FV.`,
    thresholds: {
      FV: 'Zupełny brak',
      U1: 'Pojedyncze osobniki tylko jednego gatunku o pokryciu <10%',
      U2: 'Kilka gatunków lub tylko jeden gatunek, jeśli jego pokrycie w transekcie wynosi >10%',
    },
    inputs: [
      speciesInput('Gatunki zawleczone', `Gatunki obce i synantropijne z pokryciem ${SURFACE}, np. Ranunculus acris 0,5.`),
      { kind: 'number', name: 'count', label: 'Liczba gatunków (opcjonalnie)', min: 0, help: 'Liczba gatunków zawleczonych wpisana wprost – ma pierwszeństwo przed liczeniem z listy.' },
      totalInput('Łączne pokrycie (opcjonalnie)', 'Łączne pokrycie gatunków zawleczonych w % transektu – ma pierwszeństwo przed sumą z listy. Liczy się tylko przy jednym gatunku (próg 10%).'),
      NONE_FIELD('Brak gatunków zawleczonych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków obcych ani synantropijnych – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Brak.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const n = num(i.count) ?? (rowNames(i.species).length ? distinct(rowNames(i.species)).length : i.none === 'yes' ? 0 : undefined)
      if (n === undefined) return num(i.total) !== undefined ? (num(i.total)! > 0 ? 'U1' : 'FV') : null
      const c = coverOf(i)
      return gradeAliens6150(n, typeof c === 'number' ? c : undefined)
    },
    explain: (i) => {
      const n = num(i.count) ?? distinct(rowNames(i.species)).length
      if (!n) return null
      const c = coverOf(i)
      return `Gatunków zawleczonych: ${plNum(n)}${typeof c === 'number' ? `; łączne pokrycie ${pct(c)}` : ''}.`
    },
    warn: (i) => {
      const names = distinct(rowNames(i.species))
      const parts: string[] = []
      if (i.none === 'yes' && (names.length || (num(i.total) ?? 0) > 0 || (num(i.count) ?? 0) > 0)) parts.push('Zaznaczono „Nie stwierdzono”, a lista, liczba albo pokrycie nie są puste.')
      const typical = names.filter((n) => findSpecies6150(n) && !isSynanthropic6150(n))
      if (typical.length) parts.push(`To nie gatunki synantropijne: ${typical.join(', ')}.`)
      return parts.length ? parts.join(' ') : null
    },
    describe: describeList,
  },
  {
    id: 'habitatShare',
    label: 'Procent powierzchni zajęty przez siedlisko na transekcie',
    parameter: 'structure',
    description:
      'Szacunkowa ocena (w %) powierzchni zajętej przez typowe płaty siedliska na transekcie, łącznie z płatami muraw nawiązującymi do innych zbiorowisk (murawy naskalne, bliźniczkowe, borówczyska, piargi). Pojedyncze kosodrzewiny do 25 m² są integralną częścią siedliska. Miejsca zupełnie nieodpowiednie (głazy, ściany skalne) nie obniżają wskaźnika.',
    help: `Co wpisać: jaki procent potencjalnego siedliska na transekcie zajmują monitorowane fitocenozy. Miejsca zupełnie nieodpowiednie dla fitocenoz (głównie przy wyleżyskach 6150-4) pomiń w obliczeniu; leżące głazy i ściany skalne (szczególnie w podtypie 6150-2) są integralną częścią siedliska i nie obniżają wartości. W uwagach napisz, czy na transekcie są płaty o charakterze pośrednim i jak częste.

Progi (tab. 2): >75% – FV; 50–75% – U1; <50% – U2. Granice 50% i 75% formularz liczy do U1.

Praktyka: zwykle 80–100% (FV), także tam, gdzie resztę transektu zajmują głazowiska (Kozi Wierch, Kozia Dolinka – siedlisko zajmuje całość dostępnego podłoża); Połonina Wetlińska 50% → U1 (2021). Sprawozdanie 2016: wskaźnika nie ocenia się w skali obszaru Natura 2000. Karta z przewodnika (Kopa Kondracka): 100 → FV.`,
    thresholds: { FV: '>75', U1: '50–75', U2: '<50' },
    inputs: [
      { kind: 'number', name: 'value', label: 'Udział siedliska na transekcie', unit: '%', min: 0, max: 100, required: true, help: 'Procent potencjalnego siedliska na transekcie zajęty przez płaty 6150 (bez miejsc zupełnie nieodpowiednich, z głazami i ścianami skalnymi jako częścią siedliska).' },
      noteInput('Opis (opcjonalnie)', 'np. Pozostałą część transektu zajmuje głazowisko.', 'Krótki opis, który trafi do „wartości” w karcie zamiast samej liczby.'),
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v === undefined ? null : gradeHabitatShare6150(v)
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const v = num(i.value)
      return v === undefined ? '' : plNum(v)
    },
  },
  {
    id: 'deschampsia',
    label: 'Występowanie śmiałka pogiętego Deschampsia flexuosa',
    parameter: 'structure',
    description:
      'Odnotowanie liczebności śmiałka pogiętego Deschampsia flexuosa – gatunku wykazującego tendencje do rozprzestrzeniania się na wysokogórskich siedliskach zaburzonych. Szacunkowe pokrycie (z dokładnością do ok. 5%) na całym transekcie; zwarcie 0–5% – „znikome”.',
    help: `Co wpisać: szacunkowe pokrycie śmiałka pogiętego ${SURFACE}. Gdy go nie ma – „Nie stwierdzono”.

Progi (tab. 2): <10% – FV; 10–25% – U1; >25% – U2. Granice 10% i 25% formularz liczy do U1.

Przewodnik: gatunek jest naturalnym składnikiem płatów siedliska, nie należy przeceniać wskaźnika; w przyszłości ma być połączony z „Gatunkami ekspansywnymi”. Rozjazd w praktyce: przy pokryciu ok. 10% Kozi Wierch (2016) i stanowiska karkonoskie (2021, „nie przekraczał 10%”) dostały FV, a tab. 2 daje przy 10% już U1 – formularz idzie za tab. 2. Babia Góra 20–30% (U1, Diablak 30% → U2 w 2021), Mały Śnieżny Kocioł 20–25% (U1). W Bieszczadach śmiałek jest rzadki. Karta z przewodnika (Kopa Kondracka): „Zwarcie znikome (ok. 2%)” → FV.`,
    thresholds: { FV: '<10%', U1: '10–25%', U2: '>25%' },
    inputs: [
      coverInput('Pokrycie śmiałka pogiętego', `Szacunkowe pokrycie Deschampsia flexuosa ${SURFACE}.`),
      NONE_FIELD('Brak śmiałka pogiętego', 'Zaznacz „Nie stwierdzono”, gdy śmiałka pogiętego nie ma na transekcie – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Zwarcie znikome (ok. 2%).', 'Krótki opis, który trafi do „wartości” w karcie zamiast samej liczby.'),
    ],
    suggest: (i) => {
      const c = singleCover(i)
      return c === undefined ? null : gradeDeschampsia6150(c)
    },
    warn: (i) => (i.none === 'yes' && (num(i.cover) ?? 0) > 0 ? 'Zaznaczono „Nie stwierdzono”, a pokrycie jest większe od zera.' : null),
    describe: (i) => {
      if (note(i)) return note(i)
      const c = num(i.cover)
      return c !== undefined ? pct(c) : i.none === 'yes' ? 'Brak' : ''
    },
  },
  {
    id: 'mechanical',
    label: 'Zniszczenia mechaniczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Odnotowanie widocznych śladów działalności człowieka, najczęściej w postaci ścieżek, szlaków wspinaczkowych lub innych miejsc intensywnie wydeptywanych. Na wartość wskaźnika wpływa zarówno powierzchnia zniszczeń (w % dla całego transektu), jak i ich stopień, związany z natężeniem ruchu na ścieżkach. Do tej pory oceniano tylko powierzchnię transektu; przewodnik zaleca uwzględniać też otoczenie stanowiska (do ok. 50 m).',
    help: `Co wybrać: rodzaj i skalę zniszczeń na transekcie (wydeptywanie, ścieżki, erozja turystyczna, ślady ratraków i nart). Procent powierzchni transektu ze zniszczeniami możesz wpisać liczbą. Zniszczeń wynikających z procesów geomorfologicznych (lawiny, obrywy, erozja naturalna) nie liczy się.

Progi (tab. 2): brak zniszczeń – FV; pojedyncze ślady antropopresji na niewielkiej powierzchni, np. jedna lub najwyżej kilka mało uczęszczanych ścieżek – U1; zniszczenia dotyczą ponad 25% powierzchni transektu – U2. Liczbą: 0 → FV, do 25% (włącznie) → U1, powyżej → U2. Wybór ma pierwszeństwo przed liczbą.

Rozjazdy w praktyce: (1) otoczenie transektu – karta z przewodnika (Kopa Kondracka) daje FV, bo zniszczenia przy szlaku są poza transektem, a Czerwony Grzbiet przy takim samym układzie (szlak 10–15 m od transektu) dostał U1 w 2009–2011, 2016 i 2021; (2) Śnieżnik Kłodzki 2021 – zniszczenia na ok. 15% transektu plus silnie wydeptane otoczenie → U2, choć tab. 2 daje U2 dopiero powyżej 25%. Kasprowy Wierch – zniszczenia na 10–20% transektu → U1. Jeśli oceniasz z otoczeniem, zostaw swoją ocenę i opisz – karta pokaże rozjazd z progiem.

Wskaźnik kardynalny od publikacji metodyki w 2012 r. (w 2009–2011 nie był).`,
    thresholds: thresholdsOf(MECHANICAL),
    inputs: [
      optionalSelect('Zniszczenia mechaniczne', MECHANICAL, 'Puste, gdy wpisujesz procent zniszczeń liczbą. Wybór ma pierwszeństwo przed liczbą.'),
      { kind: 'number', name: 'share', label: 'Zniszczona powierzchnia transektu (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Procent powierzchni transektu z widocznymi zniszczeniami. 0 – FV, do 25% – U1, powyżej 25% – U2.' },
      noteInput('Opis (opcjonalnie)', 'np. Brak. Zniszczenia ograniczają się do sąsiedztwa szlaku (poza transektem).', 'Rodzaj, stopień i przyczyna zniszczeń – trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: (i) => {
      const chosen = gradeMap(MECHANICAL)[String(i.choice)]
      if (chosen) return chosen
      const s = num(i.share)
      return s === undefined ? null : gradeMechanical6150(s)
    },
    explain: (i) => {
      const s = num(i.share)
      return !i.choice && s !== undefined ? `Zniszczona powierzchnia transektu: ${pct(s)}.` : null
    },
    warn: (i) => {
      const chosen = gradeMap(MECHANICAL)[String(i.choice)]
      const s = num(i.share)
      if (!chosen || s === undefined) return null
      const calc = gradeMechanical6150(s)
      return calc !== chosen ? `Wybrano ${chosen}, a z procentu zniszczeń (${pct(s)}) wychodzi ${calc} – sprawdź albo uzasadnij (np. zniszczenia w otoczeniu transektu).` : null
    },
    describe: (i) => note(i) || (i.choice ? labelOf(MECHANICAL, i.choice) : num(i.share) !== undefined ? `Zniszczenia na ${pct(num(i.share)!)} transektu` : ''),
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu (zdjęcia fitosocjologicznego nr ${where === 'początku' ? 1 : where === 'środka' ? 2 : 3}), z odbiornika GPS (WGS84).

Dlaczego: przewodnik wymaga dokładnych współrzędnych dla środka każdego zdjęcia – na rozległych halach bez nich nie da się odtworzyć transektu za 6 lat.`

const siteFields: FieldDef[] = [
  {
    kind: 'select',
    name: 'subtype',
    label: 'Podtyp siedliska',
    options: SUBTYPE_OPTIONS,
    required: true,
    hint: 'Podtyp dominujący na transekcie; przy wyleżyskach (6150-4) formularz ostrzega o naturalnie ubogich płatach.',
    help: `Podtyp dominujący na transekcie (przewodnik, pkt 2):
• 6150-1 – wysokogórskie murawy acydofilne hal i połonin w Karpatach (Oreochloo distichae-Juncetum trifidi w Tatrach, Junco trifidi-Festucetum airoidis na Babiej Górze, Potentillo aureae-Festucetum airoidis w Bieszczadach);
• 6150-2 – murawy acydofilne piętra subniwalnego Tatr (Oreochloetum distichae subnivale, zbiorowisko Oreochloa disticha-Gentiana frigida), powyżej 2100–2300 m n.p.m., na półkach skalnych;
• 6150-3 – wysokogórskie murawy acydofilne w Sudetach (Carici rigidae-Festucetum airoidis; Karkonosze, Śnieżnik);
• 6150-4 – bezwapienne wyleżyska śnieżne (Polytrichetum sexangularis, Salicetum herbaceae, Luzuletum alpino-pilosae, Poo-Cerastietum cerastoidis).

Dlaczego: karta przykładowa podaje podtyp obok kodu („6150-1 – Wysokogórskie murawy acydofilne hal i połonin w Karpatach”); od podtypu zależy też, czego oczekiwać – wyleżyska są naturalnie bardzo ubogie w gatunki, a w podtypie 6150-2 skały są częścią siedliska.`,
  },
  {
    kind: 'text',
    name: 'massif',
    label: 'Nazwa obszaru',
    placeholder: 'np. Tatry',
    required: true,
    help: `Pasmo albo masyw, w którym leży stanowisko: Tatry, Babia Góra, Bieszczady (region alpejski), Karkonosze, Śnieżnik Kłodzki (region kontynentalny). W karcie z przewodnika: „Tatry”.

Dlaczego: stan siedliska różni się bardzo między pasmami (Babia Góra i Bieszczady – płaty mniejsze i uboższe), a oceny regionu liczy się osobno dla regionu alpejskiego i kontynentalnego.`,
  },
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Kopa Kondracka',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – szczyt, dolina albo kocioł, np. „Kopa Kondracka”, „Czerwony Grzbiet”, „Kozia Dolinka 1”, „Gówniak 01”, „Mały Śnieżny Kocioł”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego stanowiska.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  pickField(methodology7120.siteFields, 'protectedAreas', {
    label: 'Obszary chronione, na których znajduje się stanowisko',
    hint: 'Np. „SOO i OSO Tatry (PLC120001); Tatrzański Park Narodowy”.',
    help: `Obszar Natura 2000 i inne formy ochrony obejmujące stanowisko: PLC120001 Tatry, PLH120001 Ostoja Babiogórska, PLC180001 Bieszczady, PLC020001 Karkonosze, PLH020016 Góry Bialskie i Grupa Śnieżnika; parki narodowe (TPN, BgPN, BdPN, KPN), rezerwat „Śnieżnik Kłodzki”.

Dlaczego: wszystkie stanowiska leżą w strefie ochrony ścisłej – forma ochrony wpływa na perspektywy (szlaki, narciarstwo).`,
  }),
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska przyrodniczego na stanowisku',
    rows: 6,
    required: true,
    hint: 'Wykształcenie muraw, nachylenie i ekspozycja, kosodrzewina, sąsiedztwo, szlaki i trasy narciarskie.',
    help: `Krótka charakterystyka stanowiska:
• jakie murawy albo wyleżyska, jak zwarte i typowo wykształcone, na jakim stoku (nachylenie, ekspozycja, wysokość);
• udział kosodrzewiny i innych krzewów, płaty pośrednie (murawy bliźniczkowe, borówczyska, piargi);
• inne typy siedlisk w sąsiedztwie (kosodrzewina 4070, piargi 8110, murawy 6170);
• oddziaływania i zagrożenia: szlaki turystyczne, trasy narciarskie, schroniska, erozja, lawiny.
Przy wskaźniku „Zniszczenia mechaniczne” opisz także otoczenie transektu (do ok. 50 m).`,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Oreochloo distichae-Juncetum trifidi',
    help: 'Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi (klasa Juncetea trifidi albo Salicetea herbaceae), np. Oreochloo distichae-Juncetum trifidi, Junco trifidi-Festucetum airoidis, Carici (rigidae)-Festucetum airoidis, Potentillo aureae-Festucetum airoidis, Salicetum herbaceae, Luzuletum alpino-pilosae.',
  },
  {
    kind: 'text',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    required: true,
    placeholder: 'np. 0,12',
    help: 'Powierzchnia płatów siedliska w transekcie i – jeśli wiadomo – w rejonie stanowiska, w hektarach albo opisem (karta z przewodnika: „0,12 ha (100% transektu). Poza transektem siedlisko zajmuje w tym rejonie ok. 7 ha. Areał stabilny.”). Wyleżyska bywają bardzo małe – 30 m² do kilku arów.',
  },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    defaultValue: '120x10 m',
    required: true,
    hint: 'Ok. 100–200 × 10–15 m, po poziomicy; przy wyleżyskach – stanowisko punktowe.',
    help: `Przewodnik: transekt ok. 100–200 × 10–15 m (w dotychczasowych badaniach zwykle 1200–2000 m²), wyznaczony tak, by uchwycić zróżnicowanie typów fitocenoz; na zboczu po poziomicy albo prostopadle do niej. Przy wyraźnie odgraniczonych wyleżyskach dopuszcza się stanowiska punktowe – wpisz to tutaj. W karcie z przewodnika: 120×10 m.

Dlaczego: wszystkie dane liczbowe i florystyczne odnoszą się tylko do obszaru transektu – następny obserwator musi wyznaczyć ten sam.`,
    warn: (v) => {
      const m = String(v ?? '').replace(/,/g, '.').match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/)
      if (!m) return null
      const [a, b] = [Number(m[1]), Number(m[2])].sort((x, y) => y - x)
      return a >= 100 && a <= 200 && b >= 10 && b <= 15 ? null : 'Przewodnik zaleca transekt ok. 100–200 × 10–15 m. Opisz odstępstwo w uwagach (np. stanowisko punktowe na wyleżysku).'
    },
  },
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek (zdjęcie nr 1)', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek (zdjęcie nr 2)', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec (zdjęcie nr 3)', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    help: 'Wysokość nad poziomem morza transektu (albo zakres), z GPS albo mapy. Tatry: piętro alpejskie ok. 1800–2300 m, subniwalne powyżej 2100–2300 m; Babia Góra ok. 1600–1725 m; Karkonosze powyżej ok. 1400 m (karta z przewodnika: 1785–1820 m).',
  },
  pickField(methodology7120.siteFields, 'observer', {
    help: `Imię i nazwisko eksperta, który wykonał obserwację i odpowiada za dane (karta z przewodnika podaje czterech obserwatorów – pozostałych wpisz w „Dodatkowych ekspertach”).

Dlaczego: ocena zawiera elementy oceny eksperckiej – trzeba wiedzieć, kogo zapytać o uzasadnienie.`,
  }),
  {
    kind: 'text',
    name: 'additionalExperts',
    label: 'Dodatkowi eksperci',
    placeholder: 'np. —',
    help: 'Pozostali obserwatorzy (w terenie wysokogórskim przewodnik odradza pracę w pojedynkę). Brak – zostaw puste albo wpisz „—”.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 05.08.2011',
    required: true,
    hint: 'Od końca czerwca do końca sierpnia; murawy – lipiec, wyleżyska – ok. połowy sierpnia.',
    help: `Dzień badań terenowych. Przewodnik: najlepszy termin od końca czerwca do końca sierpnia; optimum fenologiczne muraw przypada z reguły na lipiec, wyleżysk śnieżnych (6150-4) – mniej więcej na połowę sierpnia. W 2016 i 2021 r. badano od 30 lipca do 15 sierpnia.

Monitoring co 6 lat; na stanowiskach w górnej części piętra alpejskiego i w piętrze subniwalnym, bez presji człowieka, można wydłużyć okres do 7 lat.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const [, mm, dd] = v.split('-').map(Number)
      const md = mm * 100 + dd
      return md >= 620 && md <= 910 ? null : 'Termin poza zalecanym oknem (koniec czerwca – koniec sierpnia). Opisz powód w uwagach.'
    },
  },
]

// ---------- zdjęcia fitosocjologiczne: 3 × 25 m² ----------

const r7120 = methodology7120.releves.fields
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia. Trzy zdjęcia 5 × 5 m: na początku, w środku i na końcu transektu – przewodnik wymaga dokładnych współrzędnych dla każdego.' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach (karta z przewodnika: 1785, 1800, 1820 m).' }),
  pickField(r7120, 'area', {
    defaultValue: 25,
    help: 'Powierzchnia zdjęcia w m² – przewodnik: 5 × 5 m (25 m²). Przy małych wyleżyskach opisz mniejsze zdjęcie w uwagach.',
    warn: (v) => {
      const a = num(v)
      return a !== undefined && a < 25 ? 'Mniej niż 25 m² – przewodnik zaleca zdjęcia 5 × 5 m. Opisz powód w uwagach.' : null
    },
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach (karta z przewodnika: 40°; w piętrze subniwalnym Tatr średnio 40–50°).' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, NW). Dla powierzchni płaskiej wpisz „płasko” albo „brak”.' }),
  layerField('coverA', 'Warstwa A – drzewa: procent powierzchni zdjęcia. W murawach wysokogórskich zwykle brak – zostaw puste.'),
  layerField('coverB', 'Warstwa B – krzewy (kosodrzewina, jałowiec halny): procent powierzchni zdjęcia. W murawie zwykle brak albo pojedyncze kępy.\n\nDlaczego: zwarcie krzewów to jeden z wskaźników kardynalnych.'),
  layerField('coverC', 'Warstwa C – zielna i krzewinki: procent powierzchni zdjęcia (karta z przewodnika: 90%).'),
  layerField('coverD', 'Warstwa D – mchy, wątrobowce i porosty: procent powierzchni zdjęcia (karta z przewodnika: 5–60%). Porosty (płucnica, chrobotki, oskrzelki) i mszaki wyleżysk należą do gatunków charakterystycznych.\n\nDlaczego: w zdjęciu uwzględnia się je obowiązkowo – na wyleżyskach to główny składnik.'),
  layerField('heightA', 'Warstwa A – typowa wysokość drzew, w metrach. Zwykle brak.'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów, w metrach.'),
  layerField('heightC', 'Warstwa C – typowa wysokość runi, w centymetrach (karta z przewodnika: 15–20 cm).'),
  layerField('heightD', 'Warstwa D – wysokość mchów i porostów, w centymetrach.'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Oreochloo distichae-Juncetum trifidi',
    help: 'Jednostka fitosocjologiczna zdjęcia, np. Oreochloo distichae-Juncetum trifidi, Junco trifidi-Festucetum airoidis, Salicetum herbaceae.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w poletku z ilościowością w skali Braun-Blanqueta (r, +, 1–5), z mszakami i porostami (warstwa D). Zdjęcie robi się w szczycie rozwoju fenologicznego, z kompletną listą florystyczną – przewodnik uważa je za najważniejszą część monitoringu. Warstwa podpowiada się sama po wyborze gatunku.',
  }),
]

export const methodology6150: Methodology = {
  code: '6150',
  name: 'Wysokogórskie murawy acidofilne (Juncion trifidi) i bezwapienne wyleżyska śnieżne (Salicion herbaceae)',
  source:
    'Kozak M., Kozłowska K., Mróz W. 2012, 6150 Wysokogórskie murawy acydofilne (Juncion trifidi) i bezwapienne wyleżyska śnieżne (Salicion herbaceae), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 282–298 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2009–2011, 2015–2018 i 2020–2021.',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj 3 zdjęcia fitosocjologiczne 5 × 5 m – na początku, w środku i na końcu transektu – w punkcie szczytowym rozwoju fenologicznego, z kompletną listą florystyczną (z mszakami i porostami). Ilościowość w skali Braun-Blanqueta.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description: 'Ocena realnych możliwości utrzymania siedliska we właściwej kondycji, uwzględniająca jego obecny stan zachowania oraz czynniki mogące na nie oddziaływać w najbliższej przyszłości.',
    help: `Weź pod uwagę: ruch turystyczny (wydeptywanie przy szlakach, schroniskach, na szczytach – szczególnie Babia Góra, Kasprowy Wierch, Śnieżnik), narciarstwo i ratraki, sukcesję w niżej położonych płatach (borówka, trzcinnik owłosiony, kosodrzewina – także sztucznie wprowadzona na Śnieżniku), zmiany klimatu (krótsze zaleganie śniegu – zagrożenie dla wyleżysk), a po stronie plusów – strefę ochrony ścisłej i działania parków (remonty szlaków, ogrodzenia).

Przewodnik (pkt 5): najlepszą formą ochrony jest ochrona bierna; regeneracja muraw trwa bardzo długo. Praktyka 2021: Kasprowy Wierch 2 – U1 (presja narciarska się nie zmniejszy), Połonina Wetlińska – U2 (małe płaty zarastane przez borówkę i trzcinnik), Czerwony Grzbiet – poprawa z U1 na FV po remoncie szlaku.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A04.03', name: 'Zarzucenie pasterstwa, brak wypasu' },
    { code: 'B01.02', name: 'Sztuczne nasadzenia na terenach otwartych (drzewa nierodzime)' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'E01.04', name: 'Inne typy zabudowy' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.04.01', name: 'Turystyka górska i wspinaczka' },
    { code: 'G01.06', name: 'Narciarstwo, narciarstwo pozatrasowe' },
    { code: 'G02.02', name: 'Kompleksy narciarskie' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'L04', name: 'Lawina' },
    { code: 'L05', name: 'Zapadnięcie się terenu, osuwisko' },
    { code: 'M01', name: 'Zmiany warunków abiotycznych' },
    { code: 'M01.02', name: 'Susze i zmniejszenie opadów' },
    { code: 'M02', name: 'Zmiana czynników biotycznych' },
    { code: 'U', name: 'Nieznane zagrożenie lub nacisk' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: [
    ...methodology7120.otherFields.flatMap((f): FieldDef[] => {
      if (f.name === 'otherValues')
        return [
          {
            ...f,
            hint: 'Np. gatunki chronione i endemity, wyleżyska z sybaldią.',
            help: 'Wartości przyrodnicze stanowiska poza samą murawą: gatunki chronione, z czerwonej listy i endemiczne (dzwonek alpejski, goryczka przezroczysta, sybaldia rozesłana, dzwonek karkonoski), sąsiednie siedliska (4070 kosodrzewina, 8110 piargi, 6170 murawy na wapieniach). Przewodnik (pkt 6) zapowiada wskaźnik „cenne składniki flory” – zapisz je tutaj. Brak informacji – „Nie stwierdzono”.',
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
            help: 'Karta z przewodnika podaje przy ocenie ogólnej powierzchnię siedliska o różnym stanie zachowania na stanowisku (Kopa Kondracka: FV 100%, U1 0%, U2 0%). Trzy liczby powinny dać razem 100%.',
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
            help: `${f.help ?? ''}\n\nDla 6150 zapisz tu także: płaty o charakterze pośrednim na transekcie (przy wskaźniku „Procent powierzchni”), zniszczenia w otoczeniu transektu (do ok. 50 m), odstępstwa od wymiarów transektu i zdjęć (stanowiska punktowe na wyleżyskach) oraz datę wypełnienia karty.`.trim(),
          },
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_6150.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer6150(s) })),
  speciesInfo: (name) => {
    const s = findSpecies6150(name)
    if (!s) return undefined
    if (s.group === 'characteristic')
      return `${GROUP_LABELS_6150.characteristic}${s.snowbed ? ' (wyleżyska śnieżne)' : ''}${s.source === 'report' ? ' – wg sprawozdań' : ''}`
    if (s.group === 'synanthropic') return s.alien ? 'gatunek obcy (zawleczony)' : GROUP_LABELS_6150.synanthropic
    return GROUP_LABELS_6150[s.group]
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator6150 = (id: string): IndicatorDef => {
  const i = methodology6150.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 6150`)
  return i
}
