// Metodyka *2130 (nadmorskie wydmy szare, Helichryso-Jasionetum litoralis) jako dane. Źródło: Braun M. 2010,
// „Nadmorskie wydmy szare (2130)” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny,
// cz. I, GIOŚ, s. 61–72 (tab. 1 i 2, przykład karty), z praktyką oceny ze sprawozdań z monitoringu 2006–2008,
// 2013–2014, 2016–2018 i 2023–2025. Siedlisko priorytetowe, nadmorskie, nieleśne: transekt 10×200 m, 3 zdjęcia
// fitosocjologiczne 5×5 m (na początku, w środku i na końcu transektu). Progi w skali Braun-Blanqueta przeliczane są
// z pokrycia w %: „najwyżej 1” = poniżej 5%, „większy od 1” = od 5% (klasa 2 to 5–25%).
// Z modułu leśnego brane są tylko klocki generyczne – nic leśnego.
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology, SpeciesRow } from '../../7120/habitats/types'
import { formatCover, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import { ROLE_LABELS_2130, SPECIES_2130, binomial2130, defaultLayer2130, findSpecies2130, hasRole2130, type Role2130 } from './species'

// ---------- progi liczbowe (tab. 2) ----------

/** Pokrycie w skali Br.-Bl. „najwyżej 1” ⇔ poniżej 5% (klasa 2 zaczyna się od 5%). */
export const BB1_MAX = 5

/**
 * Łączne pokrycie (obce inwazyjne, rodzime ekspansywne) albo pokrycie gatunku (krzewy i krzewinki):
 * brak FV; najwyżej 1 w skali Br.-Bl. (<5%) U1; większe od 1 (≥5%) U2.
 */
export const gradeCoverBB2130 = (cover: number): Grade => (cover <= 0 ? 'FV' : cover < BB1_MAX ? 'U1' : 'U2')

/**
 * Nalot drzew: brak albo pojedyncze siewki sosny FV; zajmuje 1 w skali Br.-Bl. (<5%) U1; powyżej 1 U2.
 * „Pojedyncze siewki” = sama sosna o łącznym pokryciu <1% (r, + w skali Br.-Bl.).
 */
export function gradeTrees2130(total: number, onlyPine: boolean): Grade {
  if (total <= 0) return 'FV'
  if (onlyPine && total < 1) return 'FV'
  return total < BB1_MAX ? 'U1' : 'U2'
}

/**
 * Gatunki nitrofilne: brak FV; jeden lub dwa gatunki o pokryciu r–1 w skali Br.-Bl. (<5%) U1;
 * pokrycie któregokolwiek >1 (≥5%) albo więcej niż dwa gatunki U2.
 */
export function gradeNitrophilous2130(count: number, maxCover?: number): Grade | null {
  if (count <= 0) return 'FV'
  if (count > 2) return 'U2'
  if (maxCover === undefined) return null
  return maxCover < BB1_MAX ? 'U1' : 'U2'
}

/**
 * Charakterystyczna kombinacja florystyczna: ≥3 gatunki charakterystyczne i wyróżniające + warstwa porostowo-mszysta
 * >50% FV; ≥2 gatunki (i warstwa <50%) U1; inne kombinacje albo niszczona warstwa porostowo-mszysta U2.
 * Równo 50% i ≥3 gatunki przy warstwie ≤50% liczone do U1. Bez pokrycia warstwy D przy ≥3 gatunkach – null.
 */
export function gradeFlora2130(count: number, cryptoCover?: number, damaged = false): Grade | null {
  if (damaged || count < 2) return 'U2'
  if (count === 2) return 'U1'
  if (cryptoCover === undefined) return null
  return cryptoCover > 50 ? 'FV' : 'U1'
}

// ---------- pomocnicze ----------

const pct = (v: number) => `${plNum(v)}%`
const named = (v: unknown) => speciesRows(v).filter((r) => r.name?.trim())
const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s)

/** Pokrycia z listy; undefined, gdy któremuś gatunkowi brakuje pokrycia (nie da się policzyć progu). */
function coversOf(rows: SpeciesRow[]): number[] | undefined {
  const covers = rows.map((r) => num(r.cover))
  return covers.every((c): c is number => c !== undefined) ? covers : undefined
}
const sum = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) * 10) / 10

/** „Bylica polna nadmorska Artemisia campestris subsp. sericea 20%, krótkosz bielejący Brachythecium albicans (d) 50%” – jak w karcie. */
export function describeList2130(value: unknown): string {
  const text = named(value)
    .map((r) => {
      const e = findSpecies2130(r.name)
      const polish = e && e.latin.toLowerCase() === r.name.trim().toLowerCase() ? e.polish : undefined
      return [polish, r.name.trim(), e?.roles.includes('cryptogam') ? '(d)' : '', formatCover(num(r.cover))].filter(Boolean).join(' ')
    })
    .join(', ')
  return capitalize(text)
}

/** Odmiany tego samego gatunku (Jasione montana i J. montana var. litoralis) liczą się raz. */
export const characteristicCount2130 = (value: unknown) =>
  new Set(named(value).filter((r) => hasRole2130(r.name, 'characteristic')).map((r) => binomial2130(r.name))).size

const outsideRole = (value: unknown, role: Role2130) =>
  named(value)
    .map((r) => r.name.trim())
    .filter((n) => findSpecies2130(n) && !hasRole2130(n, role))

/** Select niewymagany – gdy lista ma pokrycia, wystarczy lista. */
const optionalSelect = (label: string, options: GradedOption[], help?: string): FieldDef => ({ ...selectInput(label, options, help), required: false })
const noteInput = (label: string, placeholder: string, help: string): FieldDef => ({ kind: 'textarea', name: 'note', label, rows: 2, placeholder, help })
const percentInput = (label: string, help: string): FieldDef => ({ kind: 'number', name: 'percent', label, unit: '%', min: 0, max: 100, help })

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

/** Ostrzeżenie, gdy podpowiedź z listy/pomiaru różni się od wybranej klasy. */
function mismatch(options: GradedOption[], i: InputValues, computed: Grade | null): string | null {
  if (!computed || !i.choice) return null
  const chosen = gradeMap(options)[String(i.choice)]
  return chosen && chosen !== computed ? `Wg pokrycia z listy to ${computed}, a wybrano klasę ${chosen}.` : null
}

// ---------- opcje selektów (tab. 2) ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'other', label: 'Inne kombinacje (np. niewielki spadek powierzchni)', grade: 'U1' },
  { value: 'clearDecrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const FLORA_STATE: GradedOption[] = [
  { value: 'ok', label: 'Murawa i warstwa porostowo-mszysta niezniszczone', grade: 'FV' },
  { value: 'damaged', label: 'Siedlisko zniekształcone przez czynniki antropogeniczne lub naturalne, warstwa porostowo-mszysta ulega niszczeniu', grade: 'U2' },
]
const ALIENS: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'low', label: 'Stopień pokrycia, w skali Br.-Bl., wszystkich obcych gatunków inwazyjnych łącznie wynosi najwyżej 1', grade: 'U1' },
  { value: 'high', label: 'Stopień pokrycia, w skali Br.-Bl., gatunków inwazyjnych jest większy od 1', grade: 'U2' },
]
const EXPANSIVE: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'low', label: 'Stopień pokrycia, w skali Br.-Bl., wszystkich gatunków ekspansywnych łącznie wynosi najwyżej 1', grade: 'U1' },
  { value: 'high', label: 'Stopień pokrycia, w skali Br.-Bl., gatunków ekspansywnych jest większy od 1', grade: 'U2' },
]
const NITRO: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'few', label: 'Jeden lub dwa gatunki ze stopniem pokrycia w skali Br.-Bl. „r” lub „1”', grade: 'U1' },
  { value: 'many', label: 'Pokrycie któregokolwiek gatunku, w skali Br.-Bl., większe od 1, lub więcej niż dwa gatunki nitrofilne', grade: 'U2' },
]
const TREES: GradedOption[] = [
  { value: 'none', label: 'Brak nalotu, lub pojedyncze siewki sosny', grade: 'FV' },
  { value: 'bb1', label: 'Nalot drzew zajmuje 1 w skali Br.-Bl. Zjawisko świadczy o procesie sukcesji w kierunku boru', grade: 'U1' },
  { value: 'high', label: 'Nalot drzew zajmuje powyżej 1 w skali Br.-Bl.', grade: 'U2' },
]
const SHRUBS: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  {
    value: 'bb1',
    label: 'Stopień pokrycia gatunku, w skali Br.-Bl., na 1; mogą być to gatunki siedlisk małopowierzchniowych tworzących naturalny ciąg sukcesyjny, np. nadmorskie wrzosowiska bażynowe',
    grade: 'U1',
  },
  { value: 'high', label: 'Stopień pokrycia gatunku, w skali Br.-Bl., powyżej 1; mogą to być nasadzenia sztuczne lub płat wrzosowiska bażynowego, zarośli wierzbowych', grade: 'U2' },
]
const ABRASION: GradedOption[] = [
  { value: 'none', label: 'Brak abrazji, wybrzeże akumulacyjne', grade: 'FV' },
  { value: 'rare', label: 'Rzadkie podcinanie wałów wydm białych i przednich', grade: 'U1' },
  { value: 'cliff', label: 'Podcinanie i tworzenie się klifowych krawędzi wydm szarych, co może stanowić zagrożenie dla trwałości siedliska', grade: 'U2' },
]
const DAMAGE: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'paths', label: 'Wyraźne ścieżki zwierzyny i penetracji ludzkiej poza szlakami, zniszczenia pojazdami mechanicznymi', grade: 'U1' },
  { value: 'eolian', label: 'Ścieżki penetracji ludzkiej poza szlakami, zniszczenia pojazdami mechanicznymi, które uruchomiły procesy eoliczne', grade: 'U2' },
]
// Wskaźniki pomocnicze z karty przewodnika (2006–2008) – w tab. 2 nie mają progów, więc etykiety są dopowiedziane
// (procesy eoliczne – z wiersza „Perspektywy ochrony” tab. 2). Patrz specyfikacja.
const EOLIAN: GradedOption[] = [
  { value: 'slight', label: 'Brak lub nieznaczne nawiewanie piasku', grade: 'FV' },
  { value: 'sporadic', label: 'Sporadyczne procesy eoliczne', grade: 'U1' },
  { value: 'intense', label: 'Uruchomione, intensywne procesy eoliczne (wydmuchy, niecki deflacyjne, zasypywanie murawy)', grade: 'U2' },
]
const DOMINANT: GradedOption[] = [
  { value: 'turf', label: 'Dominują gatunki murawy psammofilnej i warstwy porostowo-mszystej', grade: 'FV' },
  { value: 'mixed', label: 'Wśród dominujących są gatunki ekspansywne, nitrofilne, krzewinki lub nalot drzew', grade: 'U1' },
  { value: 'replaced', label: 'Dominują gatunki ekspansywne, obce, krzewy lub drzewa – murawa zanika', grade: 'U2' },
]

// ---------- wskaźniki listowe ----------

/** Łączne pokrycie gatunków z listy → próg Br.-Bl.; undefined, gdy listy brak albo nie ma pokryć. */
function totalGrade(i: InputValues): Grade | null {
  const rows = named(i.species)
  if (!rows.length) return null
  const covers = coversOf(rows)
  return covers ? gradeCoverBB2130(sum(covers)) : null
}

function listWarn(i: InputValues, options: GradedOption[], role: Role2130, computed: Grade | null): string | null {
  const rows = named(i.species)
  if (i.choice === 'none' && rows.length) return 'Wybrano „Brak”, a lista gatunków nie jest pusta.'
  const other = outsideRole(i.species, role)
  if (other.length) return `Spoza listy z tab. 1 (${ROLE_LABELS_2130[role]}): ${other.join(', ')} – sprawdź, czy na pewno tu pasują.`
  return mismatch(options, i, computed)
}

const describeOr = (i: InputValues, options: GradedOption[]) =>
  String(i.note ?? '').trim() || describeList2130(i.species) || (i.choice === 'none' ? 'Brak' : labelOf(options, i.choice))

// ---------- wskaźniki ----------

const LIST_HELP = 'Pokrycie podawaj w procentach powierzchni transektu z dokładnością do 10% (jak w karcie); dla „<1%” wpisz 0,5.'

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description: 'Zmiana powierzchni wydm szarych na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury.',
    help: `Co wybrać: jak zmieniła się powierzchnia murawy na stanowisku od poprzedniej obserwacji (albo względem literatury, ortofotomap). Powierzchnię w hektarach możesz wpisać obok, a krótki opis (np. „blisko 0,2 ha”, jak w karcie z przewodnika) trafi do pola „wartość”.

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; wyraźny spadek w porównaniu z wcześniejszymi badaniami lub literaturą – U2; „inne kombinacje” (np. niewielki ubytek) – U1. Przy pierwszym badaniu wybierz „Brak danych do porównania” albo oceń ekspercko.

Praktyka 2024: stanowiska mają zwykle kilkanaście–25 arów (od 0,02 do 2–3 ha). Stanowiska zniszczone przez abrazję (Mierzeja Sarbska 1, Białogóra 5) dostały U2 albo XX.`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się',
      U1: 'Inne kombinacje',
      U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze',
    },
    inputs: [
      optionalSelect('Zmiana powierzchni', AREA, 'Puste, gdy oceniasz ekspercko (np. pierwsze badanie).'),
      { kind: 'number', name: 'areaHa', label: 'Powierzchnia (opcjonalnie)', unit: 'ha', min: 0, help: 'Powierzchnia płatów siedliska na stanowisku, jeśli ją znasz. Zwykle od kilkunastu arów do kilku hektarów.' },
      noteInput('Opis (opcjonalnie)', 'np. blisko 0,2 ha', 'Krótki opis, który trafi do „wartości” w karcie zamiast powierzchni i etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => {
      const note = String(i.note ?? '').trim()
      if (note) return note
      const ha = num(i.areaHa)
      return [ha !== undefined ? `${plNum(ha)} ha` : '', i.choice ? labelOf(AREA, i.choice).toLowerCase() : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'flora',
    label: 'Charakterystyczna kombinacja florystyczna',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków charakterystycznych (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy gatunek na transekcie. Należy też zwracać uwagę na strukturę przestrzenną, bogactwo warstwy roślin zielnych oraz bogactwo warstwy porostowej.',
    help: `Co wpisać: gatunki charakterystyczne i wyróżniające stwierdzone na transekcie z pokryciem (%), pokrycie warstwy porostowo-mszystej (%) i – gdy trzeba – zaznaczyć, że warstwa porostowo-mszysta jest niszczona.

Gatunki liczone do progu (tab. 1): jasieniec piaskowy Jasione montana (var. litoralis), jastrzębiec baldaszkowaty Hieracium umbellatum (odm. nadmorskie), fiołek trójbarwny nadmorski Viola tricolor subsp. maritima, bylica polna nadmorska Artemisia campestris subsp. sericea, kocanki piaskowe Helichrysum arenarium oraz przechodzące z innych zbiorowisk: turzyca piaskowa, piaskownica zwyczajna, szczotlicha siwa. Porosty i mchy (chrobotki, płucnica, krótkosz, knotnik…) wpisz w zdjęciach – liczą się przez pokrycie warstwy porostowo-mszystej.

Progi (tab. 2): co najmniej 3 gatunki charakterystyczne i wyróżniające roślin zielnych, bogata warstwa porostowo-mszysta z pokryciem ponad 50% – FV; co najmniej 2 gatunki, pokrycie warstwy porostowo-mszystej <50% – U1; inne kombinacje, siedlisko zniekształcone, warstwa porostowo-mszysta ulega niszczeniu – U2.

${LIST_HELP}

Wskaźnik kardynalny. Dlaczego: niska murawa z kocankami i jasieńcem na kobiercu porostów to sedno wydmy szarej. Praktyka 2024: U2 tam, gdzie po intensywnych procesach eolicznych gatunki i warstwa porostowo-mszysta zostały szczątkowo.`,
    thresholds: {
      FV: 'Występują co najmniej 3 gatunki charakterystyczne i wyróżniające dla zespołu roślin zielnych, bogata warstwa porostowo-mszysta z pokryciem ponad 50%',
      U1: 'Występują co najmniej 2 gatunki charakterystyczne i wyróżniające, pokrycie warstwy porostowo-mszystej <50%',
      U2: 'Inne kombinacje; siedlisko zniekształcone w wyniku działania czynników antropogenicznych lub naturalnych, warstwa porostowo-mszysta ulega niszczeniu',
    },
    inputs: [
      speciesInput('Gatunki charakterystyczne na transekcie', `Gatunki charakterystyczne i wyróżniające z pokryciem transektu w %, np. Jasione montana 50. ${LIST_HELP}`),
      {
        kind: 'number',
        name: 'cryptoCover',
        label: 'Pokrycie warstwy porostowo-mszystej',
        unit: '%',
        min: 0,
        max: 100,
        help: 'Procent powierzchni transektu pokryty przez porosty i mszaki (warstwa D). Próg: ponad 50% – bogata warstwa (FV). Gdy nie szacujesz dla całego transektu, weź średnią ze zdjęć fitosocjologicznych.',
      },
      optionalSelect('Stan murawy', FLORA_STATE, 'Wybierz „zniekształcone”, gdy warstwa porostowo-mszysta jest niszczona (rozjeżdżanie, wydeptywanie, wywiewanie, zasypywanie) – to od razu U2.'),
    ],
    suggest: (i) => gradeFlora2130(characteristicCount2130(i.species), num(i.cryptoCover), i.choice === 'damaged'),
    explain: (i) => {
      const n = characteristicCount2130(i.species)
      const c = num(i.cryptoCover)
      if (!named(i.species).length && c === undefined) return null
      return `Gatunków charakterystycznych na liście: ${n}${c !== undefined ? `; warstwa porostowo-mszysta ${pct(c)}` : ''}.${n >= 3 && c === undefined ? ' Wpisz pokrycie warstwy porostowo-mszystej, żeby rozstrzygnąć FV/U1.' : ''}`
    },
    warn: (i) => {
      const other = outsideRole(i.species, 'characteristic')
      return other.length ? `Spoza listy gatunków charakterystycznych: ${other.join(', ')} – nie liczą się do progu (wpisz je w zdjęciach).` : null
    },
    describe: (i) => describeList2130(i.species),
  },
  {
    id: 'dominant',
    label: 'Gatunki dominujące',
    parameter: 'structure',
    excluded: true,
    excludedNote: 'wskaźnik z karty przewodnika (2006–2008) – bez progów w tab. 2, nie liczy się do oceny struktury',
    description:
      'Lista gatunków dominujących na transekcie (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy gatunek (z dokładnością do 10%); należy wymienić tylko gatunki o pokryciu ≥10%.',
    help: `Co wpisać: gatunki o pokryciu co najmniej 10% transektu, z pokryciem. Porosty i mszaki oznaczają się w wartości dopiskiem „(d)”, jak w karcie z przewodnika.

Wskaźnik jest w przykładowej karcie przewodnika, ale nie ma go w tab. 2 i nie był oceniany od 2014 r. (sprawozdanie 2016–2018: „gatunki dominujące” badano tylko w latach 2006–2008). Dlatego formularz go zapisuje, ale nie wlicza do oceny struktury. Progi są dopowiedziane (patrz specyfikacja karty): FV, gdy dominują gatunki murawy i warstwy porostowo-mszystej; gorzej, gdy wśród dominujących są ekspansywne trawy, gatunki nitrofilne, krzewinki, krzewy albo drzewa.

${LIST_HELP}`,
    thresholds: thresholdsOf(DOMINANT),
    inputs: [
      speciesInput('Gatunki dominujące (≥10%)', `Gatunki o pokryciu co najmniej 10% transektu. ${LIST_HELP}`),
      optionalSelect('Ocena ekspercka', DOMINANT, 'Brak progów w tab. 2 – wybierz klasę na podstawie listy.'),
    ],
    suggest: byOption(gradeMap(DOMINANT)),
    warn: (i) => {
      const rows = named(i.species)
      const low = rows.filter((r) => (num(r.cover) ?? 100) < 10).map((r) => r.name.trim())
      if (low.length) return `Poniżej 10% (nie wpisuje się do dominujących): ${low.join(', ')}.`
      const bad = rows
        .map((r) => r.name.trim())
        .filter((n) => (['expansive', 'nitrophilous', 'alien', 'tree', 'shrub'] as Role2130[]).some((role) => hasRole2130(n, role)))
      return bad.length && i.choice === 'turf' ? `Wśród dominujących są gatunki niepożądane: ${bad.join(', ')} – sprawdź klasę.` : null
    },
    describe: (i) => describeList2130(i.species),
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    description:
      'Lista inwazyjnych gatunków obcych geograficznie (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy gatunek na transekcie. Przewodnik nie notował ich na wydmach szarych, ale ze względu na potencjalne zagrożenie wskaźnik należy monitorować.',
    help: `Co wpisać: gatunki obce inwazyjne na transekcie z pokryciem (%). Brak – zostaw pustą listę i wybierz „Brak”.

Najczęstsze (sprawozdanie 2024, tab. 3): róża pomarszczona Rosa rugosa (11 stanowisk), wierzba ostrolistna Salix acutifolia, przymiotno kanadyjskie Conyza canadensis, klon jesionolistny Acer negundo, sosna czarna Pinus nigra; dawniej oliwnik srebrzysty Elaeagnus commutata. Róża i wierzba ostrolistna były sadzone do „stabilizacji” wydm.

Progi (tab. 2): brak – FV; łączne pokrycie wszystkich obcych gatunków inwazyjnych najwyżej 1 w skali Br.-Bl. – U1; większe od 1 – U2. Formularz liczy z sumy pokryć: poniżej 5% to „najwyżej 1”, od 5% (klasa 2) – U2. Lista z pokryciami ma pierwszeństwo przed wyborem klasy.

Wskaźnik niekardynalny. Praktyka 2024: U2 na Mierzei Wiślanej, gdzie pokrycie obcych sięgało 20–50%.`,
    thresholds: thresholdsOf(ALIENS),
    inputs: [
      speciesInput('Obce gatunki inwazyjne na transekcie', `Gatunki obce z pokryciem transektu w %. ${LIST_HELP}`),
      optionalSelect('Klasa (gdy bez pokryć)', ALIENS, 'Wybierz, gdy nie podajesz pokryć gatunków.'),
    ],
    suggest: (i) => totalGrade(i) ?? byOption(gradeMap(ALIENS))(i),
    explain: (i) => {
      const covers = coversOf(named(i.species))
      return covers?.length ? `Łączne pokrycie gatunków obcych: ${pct(sum(covers))} (próg Br.-Bl. 1 = poniżej 5%).` : null
    },
    warn: (i) => listWarn(i, ALIENS, 'alien', totalGrade(i)),
    describe: (i) => describeOr(i, ALIENS),
  },
  {
    id: 'expansive',
    label: 'Rodzime gatunki ekspansywne roślin zielnych',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista rodzimych gatunków ekspansywnych (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy gatunek na transekcie. W wyniku zmian w siedlisku, najczęściej związanych z działalnością człowieka, na powierzchnię wkraczają m.in. śmiałka wczesna, stokłosa miękka, piaskownica zwyczajna, kosmatka polna i śmiałek pogięty.',
    help: `Co wpisać: rodzime gatunki ekspansywne na transekcie z pokryciem (%).

Gatunki z tab. 1: śmiałka wczesna Aira praecox, stokłosa miękka Bromus hordeaceus, piaskownica zwyczajna Ammophila arenaria, kosmatka polna Luzula campestris, śmiałek pogięty Deschampsia flexuosa. Sprawozdania wymieniają też trzcinnikownicę bałtycką i paprotkę zwyczajną – formularz je przyjmie, ale ostrzeże, że są spoza tab. 1.

Progi (tab. 2): brak – FV; łączne pokrycie wszystkich gatunków ekspansywnych najwyżej 1 w skali Br.-Bl. – U1; większe od 1 – U2. Formularz liczy z sumy pokryć: poniżej 5% to „najwyżej 1”, od 5% – U2.

Wskaźnik kardynalny. Uwaga na piaskownicę: tab. 1 wymienia ją i wśród gatunków charakterystycznych („przechodzące z wydmy białej”), i wśród ekspansywnych. Praktyka 2024: pojedyncza piaskownica (1–2%) nie obniżała oceny poniżej FV, ale łączne pokrycie ekspansywnych do 25% (Rowy) to U2.`,
    thresholds: thresholdsOf(EXPANSIVE),
    inputs: [
      speciesInput('Gatunki ekspansywne na transekcie', `Rodzime gatunki ekspansywne z pokryciem transektu w %. ${LIST_HELP}`),
      optionalSelect('Klasa (gdy bez pokryć)', EXPANSIVE, 'Wybierz, gdy nie podajesz pokryć gatunków.'),
    ],
    suggest: (i) => totalGrade(i) ?? byOption(gradeMap(EXPANSIVE))(i),
    explain: (i) => {
      const covers = coversOf(named(i.species))
      return covers?.length ? `Łączne pokrycie gatunków ekspansywnych: ${pct(sum(covers))} (próg Br.-Bl. 1 = poniżej 5%).` : null
    },
    warn: (i) => listWarn(i, EXPANSIVE, 'expansive', totalGrade(i)),
    describe: (i) => describeOr(i, EXPANSIVE),
  },
  {
    id: 'nitrophilous',
    label: 'Gatunki nitrofilne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków nitrofilnych (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy gatunek na transekcie, np. Urtica urens, związana z nadmierną penetracją wydmy przez ludzi i eutrofizacją siedliska.',
    help: `Co wpisać: gatunki nitrofilne na transekcie z pokryciem (%).

Gatunki z tab. 1: bylica pospolita, krwawnik pospolity, przymiotno kanadyjskie, rzeżusznik piaskowy Cardaminopsis arenosa, starzec lepki, leśny, wiosenny i zwyczajny, stokłosa miękka, szczaw wąskolistny Rumex tenuifolius, tomka wonna, wierzbówka kiprzyca, wiesiołek dwuletni, wrotycz pospolity, nawłoć pospolita; w karcie także pokrzywa żegawka.

Progi (tab. 2): brak – FV; jeden lub dwa gatunki ze stopniem pokrycia „r” lub „1” w skali Br.-Bl. – U1; pokrycie któregokolwiek gatunku większe od 1 albo więcej niż dwa gatunki – U2. Formularz liczy: trzy gatunki i więcej – U2; któryś gatunek od 5% – U2; „+” (między „r” a „1”) liczony jak U1.

Wskaźnik kardynalny. Uwaga: przykładowa karta z przewodnika (2008) ocenia rzeżusznik 10% i szczaw do 5% na FV – wg tab. 2 to U2. Formularz podpowiada wg tab. 2, ocena należy do eksperta.`,
    thresholds: thresholdsOf(NITRO),
    inputs: [
      speciesInput('Gatunki nitrofilne na transekcie', `Gatunki nitrofilne z pokryciem transektu w %. ${LIST_HELP}`),
      optionalSelect('Klasa (gdy bez listy)', NITRO, 'Wybierz, gdy nie wpisujesz gatunków.'),
    ],
    suggest: (i) => {
      const rows = named(i.species)
      if (!rows.length) return byOption(gradeMap(NITRO))(i)
      const count = new Set(rows.map((r) => binomial2130(r.name))).size
      const covers = coversOf(rows)
      return gradeNitrophilous2130(count, covers ? Math.max(...covers) : undefined) ?? byOption(gradeMap(NITRO))(i)
    },
    explain: (i) => {
      const rows = named(i.species)
      if (!rows.length) return null
      const covers = coversOf(rows)
      return `Gatunków nitrofilnych: ${new Set(rows.map((r) => binomial2130(r.name))).size}${covers ? `, największe pokrycie ${pct(Math.max(...covers))}` : ''} (U2 przy >2 gatunkach albo którymś od 5%).`
    },
    warn: (i) => {
      const rows = named(i.species)
      const covers = coversOf(rows)
      const computed = rows.length ? gradeNitrophilous2130(new Set(rows.map((r) => binomial2130(r.name))).size, covers ? Math.max(...covers) : undefined) : null
      return listWarn(i, NITRO, 'nitrophilous', computed)
    },
    describe: (i) => describeOr(i, NITRO),
  },
  {
    id: 'trees',
    label: 'Obecność nalotu drzew',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków drzew (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy z gatunków na transekcie, np. sosna lub brzoza. W niezaburzonych siedliskach pojawiają się pojedyncze siewki i podrost (głównie sosny) w wyniku sukcesji w kierunku boru.',
    help: `Co wpisać: drzewa (siewki i podrost) na transekcie z pokryciem (%).

Gatunki z tab. 1: sosna zwyczajna, brzoza brodawkowata, dąb szypułkowy, jarząb pospolity, topola osika, wierzba iwa; sprawozdanie 2024 dodaje klon zwyczajny, jawor i klon jesionolistny.

Progi (tab. 2): brak nalotu albo pojedyncze siewki sosny – FV; nalot zajmuje 1 w skali Br.-Bl. (sukcesja w kierunku boru) – U1; powyżej 1 – U2. Formularz liczy z sumy pokryć: sama sosna poniżej 1% – FV, poniżej 5% – U1, od 5% – U2.

Wskaźnik kardynalny. Praktyka 2024: najgorzej oceniany wskaźnik (U2 na 45% stanowisk, pokrycie nalotu do 20–40%). Przykładowa karta z przewodnika ocenia brzozę i dąb <1% oraz sosnę do 5% na FV – wg tab. 2 wychodzi gorzej; formularz podpowiada wg tab. 2.`,
    thresholds: thresholdsOf(TREES),
    inputs: [
      speciesInput('Nalot drzew na transekcie', `Gatunki drzew z pokryciem transektu w %, np. Pinus sylvestris 5. ${LIST_HELP}`),
      optionalSelect('Klasa (gdy bez pokryć)', TREES, 'Wybierz, gdy nie podajesz pokryć gatunków.'),
    ],
    suggest: (i) => {
      const rows = named(i.species)
      const covers = rows.length ? coversOf(rows) : undefined
      if (!covers) return byOption(gradeMap(TREES))(i)
      return gradeTrees2130(sum(covers), rows.every((r) => binomial2130(r.name) === 'pinus sylvestris'))
    },
    explain: (i) => {
      const covers = coversOf(named(i.species))
      return covers?.length ? `Łączne pokrycie nalotu: ${pct(sum(covers))} (FV tylko pojedyncze siewki sosny; U1 poniżej 5%).` : null
    },
    warn: (i) => {
      const rows = named(i.species)
      const covers = rows.length ? coversOf(rows) : undefined
      const computed = covers ? gradeTrees2130(sum(covers), rows.every((r) => binomial2130(r.name) === 'pinus sylvestris')) : null
      return listWarn(i, TREES, 'tree', computed)
    },
    describe: (i) => describeOr(i, TREES),
  },
  {
    id: 'shrubs',
    label: 'Obecność krzewów i krzewinek',
    parameter: 'structure',
    description:
      'Lista gatunków krzewów i krzewinek (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy z gatunków na transekcie. Krzewinki świadczą o kolejnym etapie sukcesji; krzewy (głównie wierzby) są pozostałością po sztucznym utrwalaniu wydm.',
    help: `Co wpisać: krzewy i krzewinki na transekcie z pokryciem (%).

Krzewinki (tab. 1): wrzos zwyczajny Calluna vulgaris, bażyna czarna Empetrum nigrum, borówka brusznica, borówka czarna. Krzewy: wierzby (wawrzynkowa, piaskowa, ostrolistna), róża pomarszczona, kosodrzewina, jeżyna popielica (sprawozdanie 2024).

Progi (tab. 2) dotyczą pokrycia gatunku: brak – FV; pokrycie gatunku 1 w skali Br.-Bl., np. naturalny ciąg sukcesyjny do wrzosowiska bażynowego – U1; powyżej 1 (nasadzenia sztuczne, płat wrzosowiska, zarośla wierzbowe) – U2. Formularz liczy z największego pokrycia jednego gatunku: poniżej 5% – U1, od 5% – U2.

Wskaźnik niekardynalny. Sprawozdanie 2016–2018 proponowało nazwę „Obecność krzewinek, krzewów i drzew” – wartości i oceny bez zmian.`,
    thresholds: thresholdsOf(SHRUBS),
    inputs: [
      speciesInput('Krzewy i krzewinki na transekcie', `Gatunki krzewów i krzewinek z pokryciem transektu w %. ${LIST_HELP}`),
      optionalSelect('Klasa (gdy bez pokryć)', SHRUBS, 'Wybierz, gdy nie podajesz pokryć gatunków.'),
    ],
    suggest: (i) => {
      const covers = named(i.species).length ? coversOf(named(i.species)) : undefined
      return covers ? gradeCoverBB2130(Math.max(...covers)) : byOption(gradeMap(SHRUBS))(i)
    },
    explain: (i) => {
      const covers = coversOf(named(i.species))
      return covers?.length ? `Największe pokrycie jednego gatunku: ${pct(Math.max(...covers))} (próg Br.-Bl. 1 = poniżej 5%).` : null
    },
    warn: (i) => {
      const covers = named(i.species).length ? coversOf(named(i.species)) : undefined
      return listWarn(i, SHRUBS, 'shrub', covers ? gradeCoverBB2130(Math.max(...covers)) : null)
    },
    describe: (i) => describeOr(i, SHRUBS),
  },
  {
    id: 'eolian',
    label: 'Występowanie procesów eolicznych',
    parameter: 'structure',
    excluded: true,
    excludedNote: 'wskaźnik z karty przewodnika (2006–2008) – bez progów w tab. 2, nie liczy się do oceny struktury',
    description:
      'Intensywne/sporadyczne/brak; procent powierzchni transektu poddanej procesom eolicznym (z dokładnością do 10%), występujące formy eoliczne.',
    help: `Co wpisać: czy i jak intensywnie piasek jest wywiewany albo nawiewany na murawę, jaka część transektu jest temu poddana (%), jakie formy widać (wydmuchy, niecki deflacyjne, nawiane języki piasku).

Wskaźnik jest w przykładowej karcie przewodnika („Nieznaczne nawiewanie piasku (100%)” – FV), ale nie ma go w tab. 2 i nie był oceniany od 2014 r. Formularz go zapisuje, ale nie wlicza do oceny struktury. Progi dopowiedziano z wiersza „Perspektywy ochrony” tab. 2 (sporadyczne procesy eoliczne – U1; uruchomione procesy eoliczne – U2).

Dlaczego warto: sprawozdania 2014 i 2024 wskazują erozję eoliczną i zasypywanie jako główną przyczynę zaniku warstwy porostowo-mszystej. To dobre uzasadnienie oceny kombinacji florystycznej i zniszczeń.`,
    thresholds: thresholdsOf(EOLIAN),
    inputs: [
      optionalSelect('Intensywność', EOLIAN),
      percentInput('Powierzchnia transektu poddana procesom eolicznym', 'Procent powierzchni transektu (z dokładnością do 10%), na której piasek jest wywiewany albo nawiewany.'),
      noteInput('Formy eoliczne (opcjonalnie)', 'np. nieznaczne nawiewanie piasku', 'Krótki opis: intensywność i formy (wydmuchy, niecki deflacyjne, nawiane języki piasku). Trafia do „wartości” razem z procentem.'),
    ],
    suggest: byOption(gradeMap(EOLIAN)),
    describe: (i) => {
      const p = num(i.percent)
      const text = String(i.note ?? '').trim() || labelOf(EOLIAN, i.choice)
      return [text, p !== undefined ? `(${pct(p)})` : ''].filter(Boolean).join(' ')
    },
  },
  {
    id: 'abrasion',
    label: 'Występowanie abrazji',
    parameter: 'structure',
    cardinal: true,
    description:
      'Intensywne/sporadyczne/brak; procent powierzchni transektu poddanej procesom abrazji (z dokładnością do 10%), występujące formy abrazji. Abrazja to jeden z czynników decydujących o wielkości powierzchni i stanie zachowania siedliska; największych zniszczeń dokonują sztormy jesienią i zimą.',
    help: `Co wybrać: czy morze podcina wały wydmowe przed wydmą szarą i czy tworzą się klifowe krawędzie samej wydmy szarej. Procent transektu poddany abrazji i opis form (klif wydmowy, podcięcia, osuwiska) wpisz obok.

Progi (tab. 2): brak abrazji, wybrzeże akumulacyjne – FV; rzadkie podcinanie wałów wydm białych i przednich – U1; podcinanie i tworzenie się klifowych krawędzi wydm szarych, zagrożenie dla trwałości siedliska – U2.

Wskaźnik kardynalny. Praktyka 2024: U1 przy starych śladach abrazji albo abrazji fragmentu stanowiska; U2, gdy powstają strome zbocza i wydma szara wyraźnie się kurczy. Po sztormach 2016/2017 całe stanowiska zostały zmyte (Mierzeja Sarbska 1, Białogóra 5).`,
    thresholds: thresholdsOf(ABRASION),
    inputs: [
      selectInput('Abrazja', ABRASION),
      percentInput('Powierzchnia transektu poddana abrazji', 'Procent powierzchni transektu (z dokładnością do 10%) poddany procesom abrazji. 0 – brak.'),
      noteInput('Formy abrazji (opcjonalnie)', 'np. klif wydmowy wys. 3 m na odcinku 50 m', 'Krótki opis form abrazji. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(ABRASION)),
    warn: (i) => (num(i.percent) !== undefined && num(i.percent)! > 0 && i.choice === 'none' ? 'Wybrano „Brak abrazji”, a część transektu jest jej poddana.' : null),
    describe: (i) => {
      const p = num(i.percent)
      const text = String(i.note ?? '').trim() || (i.choice === 'none' ? 'Brak' : labelOf(ABRASION, i.choice))
      return [text, p ? `(${pct(p)} transektu)` : ''].filter(Boolean).join(' ')
    },
  },
  {
    id: 'damage',
    label: 'Zniszczenia mechaniczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Rodzaj zniszczeń i procent zniszczonej powierzchni transektu. Zniszczenia związane są z penetracją i presją turystyczną w pobliżu miejscowości i ośrodków turystycznych: „dzikie” ścieżki i niszczenie pokrywy roślinnej pojazdami mechanicznymi.',
    help: `Co ocenić: dzikie ścieżki (ludzi i zwierzyny) poza szlakami, nielegalne zejścia na plażę, ślady pojazdów, składowanie materiałów na wydmie – i czy zniszczenia uruchomiły wywiewanie piasku. Rodzaj zniszczeń opisz w notatce, procent zniszczonej powierzchni transektu wpisz obok.

Progi (tab. 2): brak – FV; wyraźne ścieżki zwierzyny i penetracji ludzkiej poza szlakami, zniszczenia pojazdami – U1; ścieżki i zniszczenia, które uruchomiły procesy eoliczne – U2.

Wskaźnik kardynalny. Dlaczego: pionierska murawa należy do ekosystemów najmniej odpornych na deptanie i rozjeżdżanie, a zniszczona darń to początek wydmuchu. Praktyka 2024: U1 na 48% stanowisk (ścieżki, zejścia na plażę); U2 tylko tam, gdzie rozjeżdżono wydmę przy umacnianiu brzegu.`,
    thresholds: thresholdsOf(DAMAGE),
    inputs: [
      selectInput('Zniszczenia', DAMAGE),
      percentInput('Zniszczona powierzchnia transektu', 'Procent powierzchni transektu ze zniszczoną pokrywą roślinną (ścieżki, koleiny, wydeptane place). 0 – brak.'),
      noteInput('Rodzaj zniszczeń (opcjonalnie)', 'np. nie stwierdzono', 'Krótki opis rodzaju zniszczeń. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(DAMAGE)),
    describe: (i) => {
      const p = num(i.percent)
      const text = String(i.note ?? '').trim() || (i.choice === 'none' ? 'Nie stwierdzono' : labelOf(DAMAGE, i.choice))
      return [text, p ? `(${pct(p)} transektu)` : ''].filter(Boolean).join(' ')
    },
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu, z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie. Przebieg transektu nanosi się też na mapę 1:5000 (wydruk ortofotomapy) albo topograficzną 1:10 000.

Dlaczego: za 3 lata ktoś musi przejść ten sam pas murawy i porównać.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Przebrno/Siekierki',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – zwykle miejscowość, np. „Przebrno/Siekierki”, „Czołpino”, „SPN-w3”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego odcinka wybrzeża.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    defaultValue: 'Helichryso-Jasionetum litoralis',
    placeholder: 'np. Helichryso-Jasionetum litoralis',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Dla 2130: klasa Koelerio glaucae-Corynephoretea canescentis, rząd Corynephoretalia canescentis, związek Corynephorion canescentis, zespół Helichryso-Jasionetum litoralis (podzespoły typowy i chrobotkowy). Dopisz sąsiednie zbiorowiska na transekcie, np. Elymo-Ammophiletum (wydma biała), nasadzenia sosny.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 6,
    required: true,
    hint: 'Który wał wydmowy, jego wysokość, szerokość pasa murawy, warstwa porostowa, sukcesja, antropopresja.',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• położenie murawy w układzie wałów wydmowych (za wydmą białą 2120), wysokość wału, szerokość pasa (od kilku do ponad 100 m);
• podzespół: typowy czy chrobotkowy (bujna warstwa porostów, zwykle głębiej w lądzie, przy lesie);
• typ brzegu: akumulacyjny czy abrazyjny;
• sukcesja: nalot sosny, krzewinki, nasadzenia;
• antropopresja: ścieżki, zejścia na plażę, ogrodzenia, płotki.

Np. w karcie z przewodnika: „Drugi wał wydmowy o wysokości do około 10 m”.`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Łączna powierzchnia płatów siedliska na stanowisku, w hektarach. W 2024 r. zwykle kilkanaście–25 arów (od 0,02 do 3 ha); w karcie z przewodnika „blisko 0,2 ha”.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „Słowiński Park Narodowy; PLH220023 Ostoja Słowińska”. Brak – „brak”.',
  }),
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    defaultValue: '10x200 m',
    required: true,
    hint: 'Standard: 10×200 m, jeden transekt na stanowisku.',
    help: `Standardowa powierzchnia transektu to 10×200 m. Metodyka dopuszcza zmianę kształtu i powierzchni transektu tak, by jak najlepiej oddawał charakterystykę zbiorowiska (np. wąski pas murawy) – wtedy wpisz faktyczne wymiary i opisz to w uwagach.

Stan siedliska ocenia się na podstawie przejścia wzdłuż transektu, na którym robi się trzy zdjęcia fitosocjologiczne po 25 m².`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 5–10',
    help: 'Wysokość nad poziomem morza; wały wydm szarych mają zwykle kilka–kilkanaście metrów. Można wpisać zakres („5–10”).',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 2.07.2008',
    required: true,
    hint: 'Najlepiej w lipcu (optimum wegetacji), w praktyce czerwiec–sierpień.',
    help: `Dzień badań terenowych. Metodyka: najlepszy termin to lipiec, gdy występuje optimum wegetacji; badania raz na 3 lata. W 2018 i 2024 r. badania prowadzono od początku czerwca do początku sierpnia i sprawozdanie nie widziało wpływu terminu na wyniki.

Gdy kontrola była dwudniowa (jak w karcie z przewodnika: 2.07.2008 i 25.08.2008), wpisz pierwszy dzień, a drugi w uwagach.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 6 && m <= 8 ? null : 'Termin poza optymalnym oknem (lipiec, w praktyce czerwiec–sierpień).'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcia fitosocjologiczne: 3 × 5×5 m ----------

const releveFields: FieldDef[] = methodology7120.releves.fields.map((f): FieldDef => {
  switch (f.name) {
    case 'coords':
      return { ...f, help: 'Współrzędne GPS środka zdjęcia. Zdjęcia robi się w miarę możliwości na początku, w środku i na końcu transektu.' }
    case 'altitude':
      return { ...f, help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach – na wale wydmowym zwykle kilka–kilkanaście.' }
    case 'area':
      return { ...f, help: 'Powierzchnia zdjęcia w m². Metodyka: 5×5 m = 25 m².' }
    case 'slope':
      return { ...f, help: 'Nachylenie powierzchni w stopniach. Na stokach wałów wydmowych zwykle kilka–kilkanaście stopni (10° w karcie z przewodnika).' }
    case 'exposure':
      return { ...f, placeholder: 'np. NW', help: 'Kierunek, w którym opada powierzchnia (N, NE…, NWW). Dla powierzchni płaskiej wpisz „brak”.' }
    case 'coverA':
      return { ...f, help: 'Warstwa A – drzewa. Na wydmie szarej zwykle 0; zwarcie drzew oznacza, że płat przechodzi w bór (nasadzenia sosny, sukcesja).' }
    case 'coverB':
      return { ...f, help: 'Warstwa B – krzewy i podrost (wierzby, róża pomarszczona, młode sosny). Na dobrze zachowanej murawie zwykle 0.' }
    case 'coverC':
      return { ...f, help: 'Warstwa C – zielna i krzewinki: procent powierzchni zdjęcia pokryty przez rośliny zielne (jasieniec, kocanki, szczotlicha, turzyca piaskowa) i krzewinki. W karcie z przewodnika 50–60%.' }
    case 'coverD':
      return { ...f, help: 'Warstwa D – porosty i mszaki naziemne (chrobotki, płucnica, krótkosz, rokietnik). Dla wydmy szarej kluczowa: pokrycie ponad 50% to „bogata warstwa porostowo-mszysta” z tab. 2. W karcie z przewodnika 75–80%.' }
    case 'heightA':
    case 'heightB':
      return { ...f, help: `${String(f.help).split('\n')[0]}\n\nNa wydmie szarej zwykle 0.` }
    case 'heightC':
      return { ...f, help: 'Warstwa C – zielna. Typowa wysokość w centymetrach (niska murawa: 20–40 cm).' }
    case 'heightD':
      return { ...f, help: 'Warstwa D – porostowo-mszysta. Typowa wysokość w centymetrach (zwykle do 10 cm).' }
    case 'unit':
      return { ...f, placeholder: 'np. Helichryso-Jasionetum litoralis', help: 'Jednostka fitosocjologiczna zdjęcia, zwykle Helichryso-Jasionetum litoralis (podzespół typowy albo chrobotkowy).' }
    case 'species':
      return {
        ...f,
        label: 'Gatunki (skala Braun-Blanqueta)',
        help: 'Wszystkie gatunki w poletku z ilościowością w skali Braun-Blanqueta (r, +, 1–5): rośliny zielne i siewki drzew w warstwie C, mszaki i porosty w warstwie D (w karcie: „Mszaki i porosty: …”).',
      }
    default:
      return f
  }
})

export const methodology2130: Methodology = {
  code: '2130',
  name: 'Nadmorskie wydmy szare',
  priority: true,
  source:
    'Braun M. 2010, Nadmorskie wydmy szare (2130), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ, s. 61–72 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014, 2016–2018 i 2023–2025',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Na transekcie wykonaj trzy zdjęcia fitosocjologiczne po 25 m² (5×5 m), w miarę możliwości na początku, w środku i na końcu transektu, w skali Braun-Blanqueta. Rośliny zielne w warstwie C, porosty i mszaki w D.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Ocenie powinny podlegać realne możliwości zachowania właściwego stanu siedliska oraz poprawy stanu niewłaściwego. W opisie należy umieścić informację na temat potencjalnych zabiegów ochronnych dla zachowania bądź poprawy stanu siedliska.',
    help: `Weź pod uwagę cały odcinek brzegu: czy jest akumulacyjny czy abrazyjny, czy stanowisko jest w obszarze chronionym (park narodowy, rezerwat), presję turystyczną i zejścia na plażę, sukcesję sosny, nasadzenia (sosna, wierzba ostrolistna, róża pomarszczona), umocnienia brzegu.

Działania ochronne, o których warto wspomnieć: ochrona bierna (najwłaściwsza wg przewodnika), egzekwowanie zakazu wstępu na wydmy, grodzenie i likwidacja nielegalnych przejść, zaniechanie nasadzeń ochronnych gatunków obcych, stopniowe usuwanie gatunków obcych, uprzątanie śmieci, edukacja.

Praktyka 2024: najlepiej oceniano stanowiska na akumulacyjnych odcinkach wybrzeża i w parku narodowym; złe perspektywy dawały abrazja, procesy eoliczne i intensywna sukcesja sosny.`,
    thresholds: {
      FV: 'Siedlisko znajduje się w obszarze chronionym, na akumulacyjnym fragmencie wybrzeża',
      U1: 'Sporadyczna abrazja sąsiednich wydm białych i przednich, sporadyczne procesy eoliczne',
      U2: 'Uruchomione procesy eoliczne, intensywna abrazja brzegu podcinająca krawędzie wydm szarych, zagrożenie trwałości siedliska',
    },
  },

  impactCodes: [
    { code: 'B01', name: 'Zalesianie terenów otwartych' },
    { code: 'B01.02', name: 'Sztuczne nasadzenia na terenach nieleśnych (gatunki obce)' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'E03.01', name: 'Pozbywanie się odpadów z gospodarstw domowych / obiektów rekreacyjnych' },
    { code: 'E03.04', name: 'Inne odpady' },
    { code: 'F03.01.01', name: 'Szkody spowodowane przez zwierzynę łowną (nadmierna gęstość populacji)' },
    { code: 'G01', name: 'Sporty i różne formy czynnego wypoczynku, uprawiane w plenerze' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
    { code: 'G02.10', name: 'Inne kompleksy sportowe i rekreacyjne' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'G05.07', name: 'Niewłaściwie realizowane działania ochronne lub ich brak' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02.12.01', name: 'Prace związane z obroną przed aktywnością morza i ochroną wybrzeży, groble' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K04.05', name: 'Szkody wyrządzane przez roślinożerców (w tym przez zwierzynę łowną)' },
    { code: 'L05', name: 'Zapadnięcie się terenu, osuwisko' },
    { code: 'L07', name: 'Sztorm, cyklon' },
    { code: 'M01.07', name: 'Zmiana poziomu morza' },
    { code: 'M02.01', name: 'Przesunięcie i zmiana siedlisk' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. liczna populacja kostrzewy poleskiej; sąsiedztwo 2120, 2140, 2180.',
        help: 'Wartości przyrodnicze stanowiska poza samą murawą: gatunki chronione i rzadkie (kostrzewa poleska, lnica wonna, mikołajek nadmorski, kruszczyk rdzawoczerwony), sąsiednie siedliska (wydmy białe 2120, wrzosowiska bażynowe 2140, lasy na wydmach 2180). Brak informacji – „Nie stwierdzono”.',
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: 'Jakie działania ochronne wykonano i jaka jest ich skuteczność, oraz co proponujesz. Typowe dla 2130: ochrona bierna, egzekwowanie zakazu wstępu na wydmy, grodzenie, kanalizacja ruchu turystycznego, likwidacja nielegalnych przejść na plażę, zaniechanie nasadzeń ochronnych gatunków obcych, usuwanie róży pomarszczonej i wierzby ostrolistnej, uprzątanie śmieci, edukacja. Brak działań – „Nie prowadzono”.',
      }
    if (f.name === 'notes')
      return {
        ...f,
        help: `${String(f.help ?? '')}\n\nDla 2130 wpisz tu też pozycje karty z przewodnika, których formularz nie ma osobno: typ stanowiska, zarządzający terenem, nazwa obszaru Natura 2000, rok i typ monitoringu, czy monitoring jest wymagany (z uzasadnieniem), drugi dzień kontroli oraz udział powierzchni siedliska w stanie FV/U1/U2.`.trim(),
      }
    return f
  }),

  speciesCatalog: SPECIES_2130.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer2130(s) })),
  speciesInfo: (name) => {
    const e = findSpecies2130(name)
    return e ? e.roles.map((r) => ROLE_LABELS_2130[r]).join(', ') : undefined
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator2130 = (id: string): IndicatorDef => {
  const i = methodology2130.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 2130`)
  return i
}
