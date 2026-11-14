// Metodyka 4080 (subalpejskie zarośla wierzby lapońskiej lub wierzby śląskiej) jako dane. Źródło: Świerkosz K. 2012,
// „4080 Subalpejskie zarośla wierzby lapońskiej lub wierzby śląskiej (Salicetum lapponum, Salicetum silesiacae)”
// [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 257–267 (tab. 1 i 2,
// lista wskaźników kardynalnych, przykładowa karta), z praktyką oceny ze sprawozdań z monitoringu 2009–2011, 2016–2018
// i 2021. Siedlisko zaroślowe, niepriorytetowe, region alpejski (Tatry, Babia Góra, Pilsko, Bieszczady) i kontynentalny
// (Karkonosze). Płaty małe i rozproszone – przewodnik nie przewiduje stałego transektu, zdjęcia po 25 m².
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { gradeMap, labelOf, pickField, plNum, speciesInput, type GradedOption } from '../../forest'
import { GROUP_LABELS_4080, SPECIES_4080, defaultLayer4080, findSpecies4080, isPinusMugo, isTypicalWillow4080, isWillow } from './species'

// ---------- liczby i zakresy ----------

/**
 * Liczba albo zakres wpisany jak w karcie papierowej: „30”, „0,5”, „20–50”, „ok. 35%”, „<1”.
 * Zakres daje środek przedziału (do podpowiedzi oceny), „<1” to 0,5 (jak w innych kartach). Bzdura -> undefined.
 */
export function parseRange4080(value: unknown): { lo: number; hi: number; mid: number } | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? { lo: value, hi: value, mid: value } : undefined
  const t = String(value ?? '')
    .toLowerCase()
    .replace(/śr\.?|ok\.?|około|%/g, '')
    .replace(/,/g, '.')
    .replace(/\s+/g, '')
  if (/^<1(\.0*)?$/.test(t)) return { lo: 0.5, hi: 0.5, mid: 0.5 }
  const m = /^(\d+(?:\.\d+)?)(?:[-–—](\d+(?:\.\d+)?))?$/.exec(t)
  if (!m) return undefined
  const lo = Number(m[1])
  const hi = m[2] !== undefined ? Number(m[2]) : lo
  return { lo: Math.min(lo, hi), hi: Math.max(lo, hi), mid: Math.round(((lo + hi) / 2) * 100) / 100 }
}

// ---------- progi liczbowe (tab. 2) ----------

/**
 * Występowanie wierzb typowych w warstwie krzewów (pokrycie płatu, %): tab. 2 „>30%” FV, „10–30%” U1, „<10%” U2.
 * 30% → FV: tab. 1 mówi „z pokryciem co najmniej 30%”, a karta przykładowa ocenia „Salix lapponum – 30%” na FV. 10% → U1.
 */
export const gradeWillows4080 = (p: number): Grade => (p >= 30 ? 'FV' : p >= 10 ? 'U1' : 'U2')

/**
 * Naturalne odnowienie wierzb (udział siewek i młodych osobników w runie, %): tab. 2 „powyżej 0,5%” FV, „sporadycznie” U1,
 * „nie występuje” U2. 0,5% → FV: tab. 1 podaje naturalne odnowienie „0,5 do 5% pokrycia”, a karta ocenia 0,5% na FV.
 */
export const gradeRegeneration4080 = (p: number): Grade => (p >= 0.5 ? 'FV' : p > 0 ? 'U1' : 'U2')

/**
 * Charakterystyczna kombinacja gatunków (udział gatunków ziołoroślowych lub typowych w warstwie zielnej, %): tab. 2
 * „zgodna z opisem” FV, „<50%” U1, „<10%” U2. Liczbowo: ≥50 FV, 10–<50 U1, <10 U2.
 */
export const gradeCombination4080 = (p: number): Grade => (p >= 50 ? 'FV' : p >= 10 ? 'U1' : 'U2')

/** Gatunek dominujący w runie (%): tab. 2 „poniżej 50%” FV, „50–70%” U1 (obie granice), „powyżej 70%” U2. */
export const gradeDominant4080 = (p: number): Grade => (p < 50 ? 'FV' : p <= 70 ? 'U1' : 'U2')

/** Kosodrzewina (udział w płacie, %): tab. 2 „nie większy niż 30%” FV, „30–50%” U1 (50 też), „>50%” U2. */
export const gradeMugo4080 = (p: number): Grade => (p <= 30 ? 'FV' : p <= 50 ? 'U1' : 'U2')

const pct = (v: number) => `${plNum(v)}%`
const rangeText = (s: string) => s.trim().replace(/\s*[-–—]\s*/, '–')
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)

/** Suma pokrycia wierszy spełniających warunek; „present” gdy są, ale bez pokrycia; undefined gdy brak. */
function coverOn(list: unknown, pred: (name: string) => boolean): number | 'present' | undefined {
  const rows = speciesRows(list).filter((r) => r.name?.trim() && pred(r.name))
  if (!rows.length) return undefined
  const covers = rows.map((r) => num(r.cover)).filter((c): c is number => c !== undefined)
  return covers.length ? Math.round(covers.reduce((a, b) => a + b, 0) * 10) / 10 : 'present'
}

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'small', label: 'Spadek powierzchni zajmowanej przez siedlisko nie większy niż 5%', grade: 'U1' },
  { value: 'large', label: 'Spadek powierzchni siedliska o więcej niż 5% w porównaniu z wcześniejszymi badaniami lub literaturą', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const WILLOWS: GradedOption[] = [
  { value: 'fv', label: 'Występowanie wierzb typowych dla siedliska >30% w warstwie krzewów', grade: 'FV' },
  { value: 'u1', label: 'Występowanie wierzb typowych dla siedliska 10–30% w warstwie krzewów', grade: 'U1' },
  { value: 'u2', label: 'Występowanie wierzb typowych dla siedliska <10% pokrycia', grade: 'U2' },
]
const REGEN: GradedOption[] = [
  { value: 'fv', label: 'Występuje – powyżej 0,5% udziału w runie', grade: 'FV' },
  { value: 'u1', label: 'Występuje tylko sporadycznie', grade: 'U1' },
  { value: 'u2', label: 'Nie występuje', grade: 'U2' },
]
const COMBINATION: GradedOption[] = [
  { value: 'fv', label: 'Zgodna z opisem podtypów i form geograficznych', grade: 'FV' },
  { value: 'u1', label: 'Udział ziołoroślowych lub typowych dla siedliska gatunków warstwy zielnej mniejszy niż 50%', grade: 'U1' },
  { value: 'u2', label: 'Udział ziołoroślowych lub typowych dla siedliska gatunków warstwy zielnej mniejszy niż 10%', grade: 'U2' },
]
const DOMINANT: GradedOption[] = [
  { value: 'fv', label: 'Udział gatunku dominującego w runie poniżej 50%', grade: 'FV' },
  { value: 'u1', label: 'Udział gatunku dominującego w runie 50–70%', grade: 'U1' },
  { value: 'u2', label: 'Udział gatunku dominującego w runie powyżej 70%', grade: 'U2' },
]
const MUGO: GradedOption[] = [
  { value: 'fv', label: 'Udział nie większy niż 30% – nie zaburza struktury i funkcji siedliska', grade: 'FV' },
  { value: 'u1', label: 'Udział 30–50%', grade: 'U1' },
  { value: 'u2', label: 'Udział >50%', grade: 'U2' },
]
const DAMAGE: GradedOption[] = [
  { value: 'none', label: 'Brak śladów antropopresji i zniszczeń mechanicznych', grade: 'FV' },
  { value: 'some', label: 'Pojedyncze ślady zniszczeń mechanicznych lub pobytu człowieka', grade: 'U1' },
  { value: 'heavy', label: 'Intensywna antropopresja lub zniszczenia powodowane przez zwierzynę płową', grade: 'U2' },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

/** Select oceny eksperckiej – niewymagany, ma pierwszeństwo przed liczbą. */
const choiceInput = (label: string, options: GradedOption[], help: string, required = false): FieldDef => ({
  kind: 'select',
  name: 'choice',
  label,
  required,
  options: [{ value: '', label: '—' }, ...options.map(({ value, label: l }) => ({ value, label: l }))],
  help: `${help}\n\nOpcje:\n${options.map((o) => `• ${o.label} – ${o.grade}`).join(',\n')}.`,
})
const noteInput = (placeholder: string, help: string): FieldDef => ({ kind: 'textarea', name: 'note', label: 'Opis (opcjonalnie)', rows: 2, placeholder, help })
const note = (i: InputValues) => String(i.note ?? '').trim()
const chosen = (o: GradedOption[], i: InputValues): Grade | undefined => gradeMap(o)[String(i.choice ?? '')]

// ---------- zestaw wskaźników ----------

/** Przewodnik (tab. 2, 6 wskaźników) albo karta przykładowa i monitoring 2016–2021 (5 – bez charakterystycznej kombinacji). */
export const INDICATOR_SETS: SelectOption[] = [
  { value: 'guide', label: 'Przewodnik (tab. 2) – 6 wskaźników, z charakterystyczną kombinacją gatunków' },
  { value: 'monitoring', label: 'Karta przykładowa i monitoring 2016–2021 – 5 wskaźników' },
]
const reduced = (ctx: IndicatorContext) => ctx.site?.indicatorSet === 'monitoring'

// ---------- wskaźniki ----------

function willowsFromList(i: InputValues): number | 'present' | undefined {
  return coverOn(i.species, isTypicalWillow4080)
}

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description: 'Zmiana powierzchni płatów siedliska na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury. Powierzchnię liczy się z uwzględnieniem metod fotogrametrycznych, po terenowej weryfikacji płatów widocznych na zdjęciach lotniczych.',
    help: `Co wybrać: jak zmieniła się łączna powierzchnia płatów 4080 na stanowisku od poprzedniego badania albo względem literatury i zdjęć lotniczych. Samą powierzchnię wpisz obok – trafi do „wartości”.

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; spadek nie większy niż 5% – U1; spadek o więcej niż 5% – U2. Przy pierwszym badaniu (nie ma z czym porównać) wybierz „Brak danych do porównania” (XX) albo oceń ekspercko – w karcie z przewodnika i w monitoringu 2021 nowe stanowiska dostawały FV, gdy płaty były dobrze wykształcone.

Uwaga: płaty 4080 są małe (od 20 m² do kilku hektarów) i rozproszone w mozaice z ziołoroślami, kosodrzewiną i borówczyskami. W 2016 r. trzech stanowisk w Karkonoszach nie odnaleziono – zapewne przez złe współrzędne, nie przez zanik siedliska. Zanim wpiszesz duży spadek, sprawdź lokalizację. W 2021 r. ocenę obniżano do U1 przy rozdrobnieniu płatów (Pilsko) i zarastaniu przez kosodrzewinę (Zielony Szlak).`,
    thresholds: { FV: AREA[0].label, U1: AREA[1].label, U2: AREA[2].label },
    inputs: [
      choiceInput('Zmiana powierzchni', AREA, 'Puste, gdy oceniasz ekspercko (wybierz ocenę ręcznie).'),
      {
        kind: 'text',
        name: 'areaText',
        label: 'Powierzchnia (opcjonalnie)',
        placeholder: 'np. ok. 2 ha',
        help: 'Łączna powierzchnia płatów siedliska na stanowisku, tak jak w karcie („ok. 2 ha”, „20 m²”, „15–20 arów”) – trafi do pola „wartość”.',
      },
      noteInput('np. Nie obserwowano zmniejszania się powierzchni aktualnie zajętej przez siedlisko', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: (i) => chosen(AREA, i) ?? null,
    describe: (i) => {
      const a = String(i.areaText ?? '').trim()
      return note(i) || [a, i.choice ? labelOf(AREA, i.choice).toLowerCase() : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'willows',
    label: 'Występowanie w warstwie krzewów wierzby lapońskiej lub wierzby śląskiej',
    parameter: 'structure',
    cardinal: true,
    description:
      'Kluczowymi dla określenia typu są wysokogórskie gatunki wierzb – lapońska Salix lapponum oraz śląska S. silesiaca, a być może także wierzba szwajcarska S. helvetica. Ich występowanie – z pokryciem co najmniej 30% w płatach zarośli subalpejskich – jest wskaźnikiem występowania siedliska. W karcie przykładowej i w monitoringu 2016–2021 wskaźnik nazywa się „Gatunki charakterystyczne”.',
    help: `Co wpisać: krzewy w płatach siedliska z pokryciem w procentach (rzut pionowy). Formularz sumuje wierzby typowe: lapońską Salix lapponum, śląską S. silesiaca i szwajcarską S. helvetica. Olsza zielona Alnus viridis, jarząb i kosodrzewina są wpisywane, ale się nie liczą.

Progi (tab. 2): wierzby typowe >30% w warstwie krzewów – FV; 10–30% – U1; <10% – U2. Formularz liczy 30% do FV (tab. 1: „co najmniej 30%”, karta przykładowa: „Salix lapponum – 30% pokrycia” = FV), 10% do U1.

Uwaga (przypis do tab. 2): przy pokryciu wierzb poniżej 10% rozważ, czy to nie inne siedlisko subalpejskie (6430 ziołorośla, 4060 borówczyska, 4070 kosodrzewina) z pojedynczymi wierzbami. W Bieszczadach wierzbie śląskiej towarzyszy olsza zielona (zbiorowisko Salix silesiaca-Alnus viridis) – sprawozdanie 2021 oceniało tam wskaźnik na FV.

Wskaźnik kardynalny. Jeśli lista nie oddaje sytuacji, wybierz ocenę ekspercką – ma pierwszeństwo.`,
    thresholds: thresholdsOf(WILLOWS),
    inputs: [
      speciesInput('Krzewy w płatach siedliska', 'Krzewy z pokryciem w % płatu, np. Salix lapponum 30, Salix silesiaca 5, Pinus mugo 2.'),
      choiceInput('Ocena ekspercka (opcjonalnie)', WILLOWS, 'Ma pierwszeństwo przed sumą z listy. Użyj, gdy lista nie oddaje sytuacji.'),
      noteInput('np. Salix lapponum – 30% pokrycia', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = chosen(WILLOWS, i)
      if (c) return c
      if (!rowNames(i.species).length) return null
      const w = willowsFromList(i)
      return w === undefined ? 'U2' : w === 'present' ? null : gradeWillows4080(w)
    },
    explain: (i) => {
      if (!rowNames(i.species).length) return null
      const w = willowsFromList(i)
      if (w === undefined) return 'Na liście nie ma wierzby lapońskiej, śląskiej ani szwajcarskiej – U2.'
      if (w === 'present') return 'Wierzby typowe są na liście, ale bez pokrycia – wpisz procent.'
      return `Wierzby typowe razem: ${pct(w)} – ${gradeWillows4080(w)}.`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      const parts: string[] = []
      const herbs = names.filter((n) => findSpecies4080(n) && !findSpecies4080(n)!.woody)
      if (herbs.length) parts.push(`To nie krzewy: ${herbs.join(', ')}.`)
      const otherWillows = names.filter((n) => isWillow(n) && !isTypicalWillow4080(n))
      if (otherWillows.length) parts.push(`Nie liczę wierzb spoza listy typowych: ${otherWillows.join(', ')}.`)
      const c = chosen(WILLOWS, i)
      const w = willowsFromList(i)
      const fromList = w === undefined && names.length ? 'U2' : typeof w === 'number' ? gradeWillows4080(w) : undefined
      if (c && fromList && c !== fromList) parts.push(`Wybrano ${c}, a z listy wychodzi ${fromList} – sprawdź.`)
      if (typeof w === 'number' && w < 10) parts.push('Wierzb poniżej 10% – sprawdź, czy to nie 6430, 4060 albo 4070 z pojedynczymi wierzbami (przypis do tab. 2).')
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => note(i) || describeSpecies(speciesRows(i.species)) || (i.choice ? labelOf(WILLOWS, i.choice) : ''),
  },
  {
    id: 'regeneration',
    label: 'Naturalne odnowienie wierzby lapońskiej lub śląskiej',
    parameter: 'structure',
    cardinal: true,
    description:
      'W typowych płatach odnowienie obu gatunków wierzb występuje z reguły z niewielką liczebnością (0,5 do 5% pokrycia), co jest zjawiskiem naturalnym. Zagrożeniem dla przetrwania siedliska może być stwierdzenie całkowitego braku odnowień.',
    help: `Co wpisać: łączny udział siewek i młodych osobników wierzb typowych (lapońskiej, śląskiej) w runie płatów, w procentach. „<1” = 0,5. Jeśli odnowienie jest, ale nie da się go sensownie wycenić procentem, wybierz klasę w polu oceny.

Progi (tab. 2): występuje – powyżej 0,5% udziału w runie – FV; występuje tylko sporadycznie – U1; nie występuje – U2. Formularz: ≥0,5% FV (karta przykładowa: „Salix silesiaca – pokrycie 0,5%” = FV; tab. 1: typowo 0,5–5%), więcej niż 0 i mniej niż 0,5% – U1 (sporadycznie), 0 – U2.

Praktyka 2021: U1 dano przy „sporadycznej obecności siewek” (Tarnica, Bieszczady) – to obniżyło strukturę i ocenę ogólną stanowiska do U1. W monitoringu 2016–2021 wskaźnik nazywa się „Naturalne odnowienie wierzby śląskiej”, ale w Karkonoszach liczono obie wierzby.

Wskaźnik kardynalny.`,
    thresholds: thresholdsOf(REGEN),
    inputs: [
      {
        kind: 'text',
        name: 'cover',
        label: 'Udział odnowienia w runie',
        unit: '%',
        placeholder: 'np. 0,5',
        help: 'Udział siewek i młodych osobników wierzb typowych w runie, w procentach: liczba („0,5”, „2”), „<1” albo zakres („0,5–5”, liczony środek). Brak odnowienia = 0.',
      },
      choiceInput('Ocena (opcjonalnie)', REGEN, 'Klasa z tab. 2 – ma pierwszeństwo przed procentem. Użyj, gdy odnowienie opisujesz słownie („sporadycznie”).'),
      noteInput('np. Salix silesiaca – pokrycie 0,5%, Salix lapponum – sporadycznie', 'Krótki opis, który trafi do „wartości” w karcie zamiast samego procentu.'),
    ],
    suggest: (i) => {
      const c = chosen(REGEN, i)
      if (c) return c
      const r = parseRange4080(i.cover)
      return r ? gradeRegeneration4080(r.mid) : null
    },
    explain: (i) => {
      const r = parseRange4080(i.cover)
      return r && r.lo !== r.hi ? `Środek zakresu: ${pct(r.mid)}.` : null
    },
    warn: (i) => {
      const t = String(i.cover ?? '').trim()
      if (t && !parseRange4080(t)) return 'Nie rozumiem udziału – wpisz liczbę, „<1” albo zakres, np. 0,5–5.'
      const r = parseRange4080(t)
      return r && r.hi > 30 ? 'Ponad 30% runa to siewki wierzb? Sprawdź, czy to nie pokrycie samych krzewów.' : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const t = String(i.cover ?? '').trim()
      if (t && parseRange4080(t)) return `${rangeText(t).replace(/%$/, '')}% udziału w runie`
      return i.choice ? labelOf(REGEN, i.choice) : ''
    },
  },
  {
    id: 'combination',
    label: 'Charakterystyczna kombinacja gatunków',
    parameter: 'structure',
    cardinal: true,
    excluded: reduced,
    excludedNote: 'w zestawie karty przykładowej i monitoringu 2016–2021 nie liczy się do oceny struktury',
    description:
      'Z gatunków uważanych za typowe dla siedliska (pkt 4 przewodnika) na monitorowanych stanowiskach odnotowano do tej pory występowanie wszystkich. Udział gatunków ziołoroślowych lub typowych dla siedliska w warstwie zielnej.',
    help: `Co wpisać: jaki procent warstwy zielnej płatów zajmują gatunki ziołoroślowe (Betulo-Adenostyletea) i typowe dla 4080. Typowe wg przewodnika: wietlica alpejska, tojad mocny, szczaw górski, jaskier platanolistny, miłosna górska, modrzyk górski, trzcinnik owłosiony, rdest wężownik, ciemiężyca zielona, podbiałek alpejski, nawłoć alpejska, borówki, nerecznica szerokolistna, szczawik zajęczy, dzwonek wąskolistny, kosmatki, jastrzębiec alpejski, widłak wroniec, marchwica, kuklik górski, urdzik karpacki (część tylko w jednym paśmie). Gatunki z katalogu mają przy nazwie etykietę grupy.

Progi (tab. 2): zgodna z opisem podtypów i form geograficznych – FV; udział ziołoroślowych lub typowych gatunków warstwy zielnej <50% – U1; <10% – U2. Formularz: ≥50% FV, 10–<50% U1, <10% U2. Ocena ekspercka ma pierwszeństwo.

Uwaga: sprawozdanie 2016–2018 uznało waloryzację za nieścisłą (nie wiadomo, które gatunki są „typowe”) i proponowało liczyć gatunki charakterystyczne związku Adenostylion alliariae i rzędu Calamagrostietalia villosae (FV liczne, U1 mniej niż 5, U2 1–2 gatunki). Karta przykładowa tego wskaźnika nie ma, a monitoring 2016 i 2021 go nie oceniał – w zestawie „karta przykładowa i monitoring 2016–2021” (Stanowisko) zostaje w karcie, ale nie liczy się do oceny.

Wskaźnik kardynalny (lista pod tab. 2).`,
    thresholds: thresholdsOf(COMBINATION),
    inputs: [
      {
        kind: 'text',
        name: 'share',
        label: 'Udział gatunków ziołoroślowych i typowych w warstwie zielnej',
        unit: '%',
        placeholder: 'np. 60',
        help: 'Procent pokrycia warstwy zielnej przypadający na gatunki ziołoroślowe i typowe dla 4080 – liczba albo zakres (liczony środek).',
      },
      choiceInput('Ocena ekspercka (opcjonalnie)', COMBINATION, 'Ma pierwszeństwo przed procentem – np. gdy skład jest zgodny z opisem podtypu, choć dominuje trawa.'),
      noteInput('np. Aconitum firmum, Athyrium distentifolium, Rumex alpestris, Cicerbita alpina obficie', 'Krótki opis składu, który trafi do „wartości” w karcie.'),
    ],
    suggest: (i) => {
      const c = chosen(COMBINATION, i)
      if (c) return c
      const r = parseRange4080(i.share)
      return r ? gradeCombination4080(r.mid) : null
    },
    warn: (i) => {
      const t = String(i.share ?? '').trim()
      return t && !parseRange4080(t) ? 'Nie rozumiem udziału – wpisz liczbę albo zakres, np. 40–60.' : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const t = String(i.share ?? '').trim()
      if (t && parseRange4080(t)) return `Gatunki ziołoroślowe i typowe – ${rangeText(t).replace(/%$/, '')}% warstwy zielnej`
      return i.choice ? labelOf(COMBINATION, i.choice) : ''
    },
  },
  {
    id: 'dominants',
    label: 'Gatunki dominujące, w tym ekspansja borówki czarnej i śmiałka pogiętego',
    parameter: 'structure',
    description:
      'Gatunkami dominującymi w runie, zależnie od stanowiska, mogą być: trzcinnik owłosiony Calamagrostis villosa, śmiałek pogięty Deschampsia flexuosa, śmiałek darniowy D. caespitosa, wietlica alpejska Athyrium distentifolium, borówka czarna Vaccinium myrtillus, sporadycznie także trzęślica modra Molinia caerulea. O ekspansji tych gatunków możemy mówić dopiero, gdy pokrycie jednego z nich przekracza 50% w płacie i powoduje wyraźne zubożenie składu gatunkowego.',
    help: `Co wpisać: najsilniej dominujący gatunek runa i jego pokrycie w płatach, w procentach – liczba albo zakres jak w karcie („20–50”); z zakresu liczony jest środek.

Progi (tab. 2): udział gatunku dominującego w runie poniżej 50% – FV; 50–70% – U1; powyżej 70% – U2. Granice 50% i 70% należą do U1.

Uwaga: dominacja to nie zawsze ekspansja. Karta przykładowa: trzęślica 20–50% „przy niskim zwarciu krzewów i dobrych warunkach świetlnych – zjawisko naturalne” – FV. Jeśli dominacja jest naturalna (np. trzcinnik w ziołoroślowej postaci siedliska), wybierz ocenę ekspercką i opisz to. Sprawozdanie 2016–2018 zwraca uwagę, że w ziołoroślach dominanty często przekraczają 50% i proponuje liczyć tylko gatunki spoza Betulo-Adenostyletea (np. borówkę). W monitoringu 2016–2021 wskaźnik nazywa się „Ekspansja borówki czarnej”.`,
    thresholds: thresholdsOf(DOMINANT),
    inputs: [
      { kind: 'text', name: 'species', label: 'Gatunek dominujący', placeholder: 'np. Molinia caerulea', help: 'Nazwa najsilniej dominującego gatunku runa (naukowa albo polska). Kilka – po przecinku, procent wpisz dla najsilniejszego.' },
      { kind: 'text', name: 'cover', label: 'Pokrycie gatunku dominującego', unit: '%', placeholder: 'np. 20–50', help: 'Pokrycie dominanta w runie płatów, w procentach: liczba albo zakres (liczony środek).' },
      choiceInput('Ocena ekspercka (opcjonalnie)', DOMINANT, 'Ma pierwszeństwo przed procentem – np. gdy dominacja jest naturalna, a nie ekspansją.'),
      noteInput('np. W płatach dominuje Molinia caerulea osiągając 20–50% pokrycia', 'Krótki opis, który trafi do „wartości” w karcie.'),
    ],
    suggest: (i) => {
      const c = chosen(DOMINANT, i)
      if (c) return c
      const r = parseRange4080(i.cover)
      return r ? gradeDominant4080(r.mid) : null
    },
    explain: (i) => {
      const r = parseRange4080(i.cover)
      if (!r || r.lo === r.hi) return null
      const lo = gradeDominant4080(r.lo)
      const hi = gradeDominant4080(r.hi)
      return `Środek zakresu: ${pct(r.mid)} – ${gradeDominant4080(r.mid)}.${lo !== hi ? ` Zakres obejmuje ${lo} i ${hi} – rozstrzygnij ekspercko, jeśli środek nie oddaje sytuacji.` : ''}`
    },
    warn: (i) => {
      const t = String(i.cover ?? '').trim()
      if (t && !parseRange4080(t)) return 'Nie rozumiem pokrycia – wpisz liczbę albo zakres, np. 20–50.'
      return t && !String(i.species ?? '').trim() ? 'Podaj, który gatunek dominuje.' : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const s = String(i.species ?? '').trim()
      const t = String(i.cover ?? '').trim()
      const c = t && parseRange4080(t) ? `${rangeText(t).replace(/%$/, '')}%` : ''
      return [s, c].filter(Boolean).join(' ') || (i.choice ? labelOf(DOMINANT, i.choice) : '')
    },
  },
  {
    id: 'mugo',
    label: 'Ekspansja kosodrzewiny',
    parameter: 'structure',
    description:
      'Udział pojedynczych krzewów lub siewek kosodrzewiny jest naturalny dla tego typu siedliska, które z reguły rozwija się w postaci niewielkich płatów, bezpośrednio graniczących z zaroślami kosodrzewiny lub torfowiskami, na których również ten gatunek może występować. O ekspansji gatunku może świadczyć wzrastający jego udział – umownie przyjęto, że granicą jest przekroczenie 30% udziału w płacie (wskaźnik wymaga kalibracji).',
    help: `Co wpisać: udział kosodrzewiny Pinus mugo w płatach siedliska, w procentach. Brak = 0. Jeśli wpisałeś kosodrzewinę na liście krzewów (wskaźnik występowania wierzb), formularz podpowie jej pokrycie.

Progi (tab. 2): udział nie większy niż 30% – FV; 30–50% – U1; >50% – U2. Granica 30% należy do FV, 50% do U1.

Praktyka 2021: na stanowisku Zielony Szlak (Karkonosze) udział kosodrzewiny wzrósł z 10% do 35% – ocena spadła z FV do U1, a zarastanie płatu obniżyło też powierzchnię i perspektywy. W Bieszczadach kosodrzewiny nie ma (jej miejsce zajmuje olsza zielona) – wskaźnik ocenia się tam na FV.`,
    thresholds: thresholdsOf(MUGO),
    inputs: [
      { kind: 'text', name: 'cover', label: 'Udział kosodrzewiny w płacie', unit: '%', placeholder: 'np. 0', help: 'Udział Pinus mugo w płatach siedliska, w procentach: liczba albo zakres (liczony środek). Brak = 0.' },
      noteInput('np. Nie obserwowano występowania w płatach siedliska', 'Krótki opis, który trafi do „wartości” w karcie zamiast procentu.'),
    ],
    suggest: (i) => {
      const r = parseRange4080(i.cover)
      return r ? gradeMugo4080(r.mid) : null
    },
    explain: (i, ctx) => {
      const r = parseRange4080(i.cover)
      if (r && r.lo !== r.hi) return `Środek zakresu: ${pct(r.mid)}.`
      if (String(i.cover ?? '').trim()) return null
      const m = coverOn(ctx?.indicators?.willows?.inputs?.species, isPinusMugo)
      return typeof m === 'number' ? `Na liście krzewów kosodrzewina ma ${pct(m)} – ${gradeMugo4080(m)}.` : null
    },
    warn: (i) => {
      const t = String(i.cover ?? '').trim()
      return t && !parseRange4080(t) ? 'Nie rozumiem udziału – wpisz liczbę albo zakres, np. 10–20.' : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const t = String(i.cover ?? '').trim()
      const r = parseRange4080(t)
      if (!r) return ''
      return r.hi === 0 ? 'Brak kosodrzewiny w płatach' : `${rangeText(t).replace(/%$/, '')}% udziału w płacie`
    },
  },
  {
    id: 'damage',
    label: 'Zniszczenia mechaniczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Wskaźnik opisujący stopień antropopresji związany z bezpośrednią ingerencją człowieka w siedlisko, łatwo zauważalny na powierzchniach monitoringowych dzięki tworzeniu się ścieżek lub zamieraniu krzewów. Obserwowano także zniszczenia mechaniczne w górnych partiach krzewów (zmrozowisko, lawiny) i zgryzanie przez zwierzynę płową. Poważnym zagrożeniem na niektórych stanowiskach może być erozja.',
    help: `Co wybrać: czy w płatach widać ścieżki, wydeptanie, połamane lub zamierające krzewy z powodu ludzi (turystyka, narciarstwo) albo zgryzanie przez jelenie.

Progi (tab. 2): brak śladów antropopresji i zniszczeń mechanicznych – FV; pojedyncze ślady zniszczeń mechanicznych lub pobytu człowieka – U1; intensywna antropopresja lub zniszczenia powodowane przez zwierzynę płową – U2.

Uwaga: zniszczenia naturalne (lawiny, wezbrania potoków, przemarzanie) przewodnik notuje, ale karta przykładowa przy płatach narażonych na lawiny daje „Brak” i FV, gdy nie widać ich skutków. Praktyka 2016: pojedyncze ślady wydeptywania przy szlaku – U1.

Wskaźnik kardynalny.`,
    thresholds: thresholdsOf(DAMAGE),
    inputs: [
      choiceInput('Zniszczenia', DAMAGE, 'Klasa z tab. 2.', true),
      noteInput('np. Płaty narażone na lawiny, nie obserwowano zniszczeń', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: (i) => chosen(DAMAGE, i) ?? null,
    describe: (i) => note(i) || (i.choice ? labelOf(DAMAGE, i.choice) : ''),
  },
]

// ---------- pola stanowiska ----------

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Kocioł Wielkiego Stawu',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Kocioł Wielkiego Stawu”, „Mały Staw 2”, „Diablak”, „Niżna Świstówka”, „Masyw Tarnicy”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego stanowiska – w trudnym terenie łatwo je pomylić.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. referencyjne',
    help: `Typ stanowiska w sieci monitoringu, np. „referencyjne” – dobrze wykształcone siedlisko, punkt odniesienia dla innych. Jeśli nie wiesz, zostaw puste.

Dlaczego: przy ocenie regionu stanowiska referencyjne pokazują, jak wygląda 4080 w dobrym stanie.`,
  },
  {
    kind: 'select',
    name: 'indicatorSet',
    label: 'Zestaw wskaźników struktury',
    options: INDICATOR_SETS,
    defaultValue: 'guide',
    required: true,
    hint: 'Przewodnik liczy też charakterystyczną kombinację gatunków; karta przykładowa i monitoring 2016–2021 – nie.',
    help: `Przewodnik (tab. 2, lista kardynalnych) ocenia strukturę 6 wskaźnikami, z „charakterystyczną kombinacją gatunków” (kardynalna). Karta przykładowa z tego samego przewodnika ma tylko 5 wierszy – bez kombinacji – i tak samo oceniano stanowiska w 2016 i 2021 r. (5 wskaźników, 3 kardynalne).

Przy zestawie „karta przykładowa i monitoring 2016–2021” kombinacja zostaje w karcie (możesz ją wpisać), ale nie liczy się do oceny struktury. Pozostałe kardynalne są w obu zestawach te same: występowanie wierzb, naturalne odnowienie, zniszczenia mechaniczne.`,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Salicetum lapponum',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Do 4080 należą: Salicetum lapponum – zespół wierzby lapońskiej (Karkonosze), Salicetum silesiacae – zespół wierzby śląskiej (Tatry, Babia Góra, Pilsko) oraz zbiorowisko Salix silesiaca-Alnus viridis (Bieszczady). Klasa Betulo-Adenostyletea, rząd Calamagrostietalia villosae, związek Adenostylion alliariae.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Położenie (kocioł, żleb, stok, torfowisko), liczba i wielkość płatów, nachylenie, kontakt z kosodrzewiną i ziołoroślami, dostępność.',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• położenie: kocioł polodowcowy, żleb, stromy stok, krawędź terasy potoku, niecka torfowiskowa; wysokość i nachylenie;
• płaty: ile ich jest, jak duże, czy tworzą enklawy wśród ziołorośli, traworośli lub kosodrzewiny;
• postać siedliska: ziołoroślowa (wzdłuż cieków), uboższa na stokach z borówką i śmiałkiem, torfowiskowa z torfowcami;
• dostępność i ślady ludzi: szlaki, ścieżki, narciarstwo.
Za stanowisko uznaje się grupę płatów leżących w sąsiedztwie (do 100 m między płatami skrajnymi) w zbliżonych warunkach ekologicznych.`,
  },
  {
    kind: 'text',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    required: true,
    placeholder: 'np. dobrze wykształcone płaty na łącznej powierzchni ok. 2 ha',
    help: 'Łączna powierzchnia płatów 4080 na stanowisku – liczba z jednostką albo opis jak w karcie („ok. 2 ha”, „20 m²”, „15–20 arów”). Przewodnik: zwykle od kilku do kilkunastu arów; sprawozdanie 2021: od 20 m² do 2,5 ha. Liczy się z uwzględnieniem zdjęć lotniczych, po weryfikacji w terenie.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „Karkonoski Park Narodowy; PLH020006 Karkonosze”.',
  }),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. Karkonoski Park Narodowy',
    help: `Kto zarządza terenem: wszystkie dotychczasowe stanowiska leżą w parkach narodowych (Karkonoskim, Tatrzańskim, Babiogórskim, Bieszczadzkim) albo na gruntach Lasów Państwowych (Pilsko).

Dlaczego: od zarządcy zależy przebieg szlaków i ewentualne grodzenie lub odsuwanie ich od płatów – główne zalecane działanie ochronne.`,
  },
  {
    kind: 'textarea',
    name: 'coords',
    label: 'Współrzędne geograficzne',
    rows: 2,
    required: true,
    placeholder: 'np. 15°41′…″E – 50°45′…″N',
    help: `Współrzędne GPS (WGS84) płatów siedliska – po jednej linii na płat albo punkt, w jednym formacie w całej karcie.

Dlaczego: w 2016 r. trzech stanowisk w Karkonoszach nie odnaleziono, prawdopodobnie przez błędne lub nieprecyzyjne współrzędne. W wysokogórskim terenie bez dokładnych punktów następny obserwator nie trafi w te same płaty.`,
  },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    placeholder: 'np. niestandardowy na skutek rozproszenia płatów siedliska',
    help: `Przewodnik: badania na transektach są praktycznie niemożliwe, bo 4080 tworzy niewielkie, nieregularnie rozmieszczone płaty. Opisz, jak wyznaczono powierzchnię badań: „niestandardowy na skutek rozproszenia płatów” (karta przykładowa) albo wymiary, jeśli wyznaczono transekt (w 2021 r. pokrycia podawano „na transekcie”).`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 1320–1480',
    help: 'Wysokość nad poziomem morza płatów – liczba albo zakres („1320–1480”). Siedlisko rośnie zwykle na wysokości 1180–1650 m n.p.m.',
    warn: (v) => {
      const r = parseRange4080(String(v ?? '').replace(/m\b|n\.p\.m\./g, ''))
      if (!r) return null
      return r.lo < 1000 || r.hi > 2000 ? 'Poza typowym zakresem 1180–1650 m n.p.m. (przewodnik) – sprawdź wysokość albo przynależność do 4080.' : null
    },
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 8.07.2010',
    required: true,
    hint: 'Optymalnie od końca czerwca do końca lipca.',
    help: `Dzień badań terenowych. Przewodnik: raz w roku, między końcem czerwca a końcem lipca, gdy jest pełnia rozwoju krzewinek i bylin; cykl sześcioletni. Na torfowiskach – w okresach suchych (zwykle sierpień), żeby nie zapadać się w podłoże.

Praktyka: w 2016 r. badano w sierpniu, w Tatrach we wrześniu – sprawozdanie uznało wyniki za porównywalne (krzewy i byliny łatwo rozpoznać także późnym latem). Przy nachyleniu powyżej 40° może być potrzebny sprzęt asekuracyjny.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const [, mo, d] = v.split('-').map(Number)
      if ((mo === 6 && d >= 20) || mo === 7) return null
      return mo === 8 || mo === 9
        ? 'Poza oknem z przewodnika (koniec czerwca – koniec lipca). Sierpień–wrzesień bywał stosowany (2016) – zaznacz to w uwagach.'
        : 'Termin poza sezonem z przewodnika (koniec czerwca – koniec lipca). Część gatunków runa może być nierozpoznawalna – opisz to w uwagach.'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
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
const LAYERS = 'Zwarcie i wysokość warstw B, C, D'
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, group: LAYERS, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia (WGS84), w tym samym formacie co współrzędne stanowiska.' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach.' }),
  pickField(r7120, 'area', {
    defaultValue: 25,
    help: 'Powierzchnia zdjęcia w m². Przewodnik: podstawowa powierzchnia 25 m²; w małych płatach dokumentowano też 20, a nawet 12 m² – wpisz faktyczną.',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Płaty na stromych stokach i w żlebach: często 30–45°.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, SW). Dla powierzchni płaskiej wpisz „brak”.' }),
  layerField('coverB', 'Warstwa B – krzewy: procent powierzchni zdjęcia pod wierzbami, olszą zieloną, jarzębem i kosodrzewiną (rzut pionowy). Przewodnik: zwarcie zarośli 30–90%.', { groupCols: 3 }),
  layerField('coverC', 'Warstwa C – zielna i krzewinki: procent powierzchni zdjęcia pokryty przez ziołorośla, trawy, borówki i siewki.'),
  layerField('coverD', 'Warstwa D – mszysta: procent powierzchni zdjęcia pokryty przez mchy i torfowce (w postaci torfowiskowej – zwarta warstwa z torfowcami i płonnikiem).'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów, w metrach. Wierzba lapońska od ok. 1 m, śląska do 2–3 m.'),
  layerField('heightC', 'Warstwa C – typowa wysokość runa, w centymetrach.'),
  pickField(r7120, 'unit', { placeholder: 'np. Salicetum lapponum', help: 'Jednostka fitosocjologiczna zdjęcia: Salicetum lapponum, Salicetum silesiacae albo zbiorowisko Salix silesiaca-Alnus viridis.' }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w poletku z ilościowością w skali Braun-Blanqueta (r, +, 1–5): warstwa B – krzewy (wierzby, olsza zielona, jarząb), C – runo, D – mchy i torfowce. Warstwa podpowiada się sama po wyborze gatunku.',
  }),
  {
    kind: 'textarea',
    name: 'remarks',
    label: 'Uwagi do zdjęcia',
    rows: 2,
    placeholder: 'np. Nie wykonano z uwagi na brak możliwości dostępu do płatów',
    help: 'Odstępstwa i problemy: zdjęcie niewykonane (np. brak dostępu do płatów na stromym stoku), mniejsza powierzchnia, wątpliwe oznaczenia.',
  },
]

export const methodology4080: Methodology = {
  code: '4080',
  name: 'Subalpejskie zarośla wierzby lapońskiej lub wierzby śląskiej',
  source:
    'Świerkosz K. 2012, 4080 Subalpejskie zarośla wierzby lapońskiej lub wierzby śląskiej (Salicetum lapponum, Salicetum silesiacae), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 257–267 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2009–2011, 2016–2018 i 2021.',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj zdjęcia fitosocjologiczne w płatach siedliska, zwykle 25 m² (w małych płatach 20 lub 12 m²). Ilościowość w skali Braun-Blanqueta; warstwy B (krzewy), C (runo) i D (mchy). Zdjęcie niewykonane (np. brak dostępu) opisz w uwagach do zdjęcia.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'W ocenie perspektyw ochrony należy brać pod uwagę dłuższą perspektywę czasową oraz szereg czynników, których negatywne oddziaływanie na siedlisko może się kumulować. Do najpoważniejszych zagrożeń krótkofalowych może należeć bezpośrednie oddziaływanie człowieka poprzez wydeptywanie płatów lub prowadzenie w ich sąsiedztwie zjazdowych tras narciarskich, a także nadmierne zagęszczenie zwierzyny płowej. Do istotnych zagrożeń długofalowych należy zaliczyć czynniki oddziałujące w skali ponadlokalnej: zanieczyszczenie powietrza tlenkami azotu (eutrofizacja) oraz fluktuacje klimatyczne.',
    help: `Weź pod uwagę: szlaki i ścieżki w pobliżu płatów, trasy narciarskie, zagęszczenie jeleni, zarastanie przez kosodrzewinę, eutrofizację z powietrza i ocieplanie klimatu (spadek wilgotności siedliska, wycofywanie się gatunków wysokogórskich).

Przewodnik (pkt 5): zalecana ścisła ochrona dobrze wykształconych płatów oraz odsuwanie lub grodzenie szlaków od stanowisk narażonych na presję turystyczną.

Praktyka 2021: U1 dano przy małej, rozdrobnionej powierzchni płatów z możliwym wnikaniem kosodrzewiny (Pilsko) i przy rozprzestrzenianiu się kosodrzewiny kosztem siedliska (Zielony Szlak). Stanowiska w parkach narodowych, trudno dostępne – FV.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Zauważalne są tendencje, które mogą w przyszłości prowadzić do spadku powierzchni siedliska lub zaburzeń jego struktury i funkcji',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających (np. sukcesja wtórna), nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A04', name: 'Wypas' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na rowerze' },
    { code: 'G01.04', name: 'Wspinaczka górska, wspinaczka skałkowa, speleologia' },
    { code: 'G01.04.01', name: 'Wspinaczka górska i skałkowa' },
    { code: 'G01.06', name: 'Narciarstwo, narciarstwo pozatrasowe' },
    { code: 'G02.02', name: 'Kompleksy narciarskie' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'H04', name: 'Zanieczyszczenie powietrza, zanieczyszczenia transportowane drogą powietrzną' },
    { code: 'H04.02', name: 'Zrzut azotu' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K04.05', name: 'Szkody spowodowane przez roślinożerców (w tym zgryzanie przez zwierzynę)' },
    { code: 'L04', name: 'Lawina' },
    { code: 'L05', name: 'Zapadnięcie się terenu, osuwisko' },
    { code: 'M01', name: 'Zmiany warunków abiotycznych' },
    { code: 'M01.01', name: 'Zmiany temperatury (np. wzrost temperatury / ekstremalne temperatury)' },
    { code: 'M01.02', name: 'Susze i zmniejszenie opadów' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: [
    ...methodology7120.otherFields.flatMap((f): FieldDef[] => {
      if (f.name === 'otherValues')
        return [
          {
            ...f,
            hint: 'Np. kompleks siedlisk subalpejskich 3160, 6430, 4070, 9410; gatunki chronione.',
            help: 'Wartości przyrodnicze stanowiska poza samymi zaroślami: sąsiednie siedliska subalpejskie (ziołorośla 6430, kosodrzewina 4070, borówczyska 4060, torfowiska 7110, jeziorka 3160, bory 9410), rzadkie i chronione gatunki (np. gnidosz sudecki, dzwonek karkonoski, poryblin jeziorny). Brak informacji – „Nie stwierdzono”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            label: 'Wykonywane działania ochronne',
            help: 'Jakie działania ochronne wykonano i z jakim skutkiem. Na dotychczasowych stanowiskach nie były potrzebne – siedlisko jest stabilne, a stanowiska leżą w ochronie ścisłej parków narodowych. Brak działań – „Nie są wymagane” albo „Brak działań”.',
          },
          {
            kind: 'textarea',
            name: 'proposals',
            label: 'Propozycje wprowadzenia działań ochronnych',
            rows: 3,
            hint: 'Np. ochrona ścisła; odsunięcie szlaku od płatów.',
            help: 'Jakie działania proponujesz, konkretnie: ochrona ścisła dobrze wykształconych płatów, odsunięcie lub ogrodzenie szlaku, ograniczenie zejść ze szlaku, regulacja liczebności jeleni. Brak – „Brak”.',
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
            help: 'Dlaczego monitoring jest (albo nie jest) potrzebny: rzadkość siedliska, gatunki chronione, zagrożenia, zmiany klimatyczne; ewentualnie wniosek o usunięcie stanowiska (np. brak siedliska w podanej lokalizacji).',
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
            help: 'Karta z przewodnika podaje przy ocenie ogólnej powierzchnię siedliska o różnym stanie zachowania na stanowisku (Kocioł Wielkiego Stawu: FV 100%, U1 0%, U2 0%). Trzy liczby powinny dać razem 100%.',
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
            help: `${f.help ?? ''}\n\nDla 4080 zapisz tu także rok i typ monitoringu, koordynatora oraz odstępstwa od metodyki (termin, powierzchnia zdjęć, brak transektu, niedostępne płaty).`.trim(),
          },
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_4080.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer4080(s) })),
  speciesInfo: (name) => {
    const e = findSpecies4080(name)
    return e ? GROUP_LABELS_4080[e.group] : undefined
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator4080 = (id: string): IndicatorDef => {
  const i = methodology4080.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 4080`)
  return i
}

