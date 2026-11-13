// Metodyka *2140 (nadmorskie wrzosowiska bażynowe) jako dane. Źródło: Braun M. 2010, „Nadmorskie wrzosowiska
// bażynowe (2140)” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ,
// s. 73–83 (tab. 1 i 2), z praktyką oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014, 2016–2018 i 2023–2025.
// Siedlisko priorytetowe, nadmorskie, nieleśne, małopowierzchniowe (płaty po kilkadziesiąt–kilkaset m²): transekt
// zwykle nieregularny, 3 zdjęcia fitosocjologiczne po 4–16 m². Aż 7 z 8 wskaźników struktury jest kardynalnych.
// Z modułu leśnego brane są tylko klocki generyczne – nic leśnego.
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, coverWhere, gradeMap, labelOf, listCover, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_2140,
  SPECIES_2140,
  defaultLayer2140,
  findSpecies2140,
  isAlien2140,
  isBryoLichen2140,
  isExpansive2140,
  isNitrophilous2140,
  isShrub2140,
  isTree2140,
} from './species'

// ---------- progi liczbowe (tab. 2) ----------

/** Skala Braun-Blanqueta: stopnie r, +, 1 to pokrycie poniżej 5%; od stopnia 2 – 5% i więcej. */
export const BB1_MAX_COVER = 5

/**
 * Obce gatunki inwazyjne i rodzime gatunki ekspansywne: brak FV; łączny stopień pokrycia w skali Br.-Bl.
 * najwyżej 1 (= poniżej 5%) U1; większy od 1 (= 5% i więcej) U2.
 */
export const gradeCoverBB2140 = (count: number, totalCover: number): Grade =>
  count <= 0 ? 'FV' : totalCover < BB1_MAX_COVER ? 'U1' : 'U2'

/**
 * Gatunki nitrofilne: brak FV; jeden lub dwa gatunki ze stopniem pokrycia r lub 1 (= poniżej 5%) U1;
 * pokrycie któregokolwiek gatunku większe od 1 (= 5% i więcej) albo więcej niż dwa gatunki U2.
 */
export function gradeNitrophilous2140(covers: (number | undefined)[]): Grade {
  if (covers.length === 0) return 'FV'
  if (covers.length > 2) return 'U2'
  return covers.some((c) => c !== undefined && c >= BB1_MAX_COVER) ? 'U2' : 'U1'
}

/**
 * Nalot drzew jako % powierzchni płatu: pojedyncze siewki (poniżej 1%) FV; nieliczny nalot do 10% U1;
 * więcej (zwarte drzewa, nalot sosnowy i brzozowy) U2.
 */
export const gradeTrees2140 = (cover: number): Grade => (cover < 1 ? 'FV' : cover <= 10 ? 'U1' : 'U2')

/**
 * Charakterystyczna kombinacja florystyczna z liczby krzewinek i pokrycia warstwy mszysto-porostowej (% płatu):
 * FV – co najmniej 2 krzewinki (w tym bażyna), bogata i zwarta (≥50%) warstwa mszysto-porostowa, brak nalotu drzew;
 * U2 – brak krzewinek albo brak warstwy mszysto-porostowej; U1 – pozostałe (tab. 2: 1 krzewinka + mchy ≥50% i
 * kombinacje pośrednie).
 */
export function gradeCombination2140(o: { shrubs: number; empetrum: boolean; mossCover: number; trees: boolean }): Grade {
  if (o.shrubs === 0 || o.mossCover === 0) return 'U2'
  if (o.shrubs >= 2 && o.empetrum && o.mossCover >= 50 && !o.trees) return 'FV'
  return 'U1'
}

/** Pędy krzewinek bez liści: ponad połowa – U2 (tab. 2). */
export const LEAFLESS_U2 = 50

const pct = (v: number) => `${plNum(v)}%`
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const uniq = <T,>(xs: T[]) => [...new Set(xs)]

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'other', label: 'Inne kombinacje (np. niewielki spadek powierzchni)', grade: 'U1' },
  { value: 'clearDecrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const COMBINATION: GradedOption[] = [
  {
    value: 'full',
    label: 'Występują co najmniej 2 gatunki krzewinkowe (jeden z nich to bażyna czarna Empetrum nigrum) oraz bogata i zwarta warstwa mszysto-porostowa. Brak nalotów drzew',
    grade: 'FV',
  },
  { value: 'reduced', label: 'Występuje jeden gatunek krzewinkowy oraz warstwa mszysto-porostowa pokrywająca nie mniej niż 50% płatu', grade: 'U1' },
  {
    value: 'vanishing',
    label:
      'Zbiorowisko na krawędzi zaniku w wyniku antropogenicznych (mechaniczne niszczenie) i naturalnych (abrazja, procesy eoliczne) czynników, zbiorowisko bez warstwy mszysto-porostowej jedynie z gatunkiem/gatunkami krzewinkowymi z osłabioną żywotnością',
    grade: 'U2',
  },
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
  { value: 'low', label: 'Jeden lub dwa gatunki ze stopniem pokrycia w skali Br.-Bl. r lub 1', grade: 'U1' },
  { value: 'high', label: 'Pokrycie któregokolwiek gatunku w skali Br.-Bl. większe od 1, lub więcej niż dwa gatunki nitrofilne', grade: 'U2' },
]
const VITALITY: GradedOption[] = [
  { value: 'good', label: 'Bardzo dobra żywotność, bujny wzrost, obfite kwitnienie i owocowanie krzewinek', grade: 'FV' },
  { value: 'ageing', label: 'Starzenie się płatów, niewielkie fragmenty pędów bez liści, szczególnie widoczne jest to w przypadku okazów wrzosu', grade: 'U1' },
  { value: 'poor', label: 'Słabe lub brak kwitnienia i owocowania, ponad połowa wszystkich pędów krzewinek bez liści', grade: 'U2' },
]
const ABRASION: GradedOption[] = [
  { value: 'accumulative', label: 'Brak abrazji, wybrzeże akumulacyjne', grade: 'FV' },
  { value: 'inland', label: 'Brak abrazji – stanowisko w głębi lądu, poza zasięgiem morza', grade: 'FV' },
  { value: 'rare', label: 'Rzadkie podcinanie wałów wydm białych i przednich', grade: 'U1' },
  { value: 'cliff', label: 'Podcinanie i tworzenie się klifowych krawędzi wydm szarych, co może stanowić zagrożenie dla trwałości siedliska', grade: 'U2' },
]
const TREES: GradedOption[] = [
  { value: 'none', label: 'Brak nalotu, lub pojedyncze siewki sosny, brzozy', grade: 'FV' },
  { value: 'sparse', label: 'Nieliczny nalot drzew, zajmuje do 10% powierzchni', grade: 'U1' },
  { value: 'dense', label: 'Zwarte drzewa lub nalot np. sosnowy i brzozowy', grade: 'U2' },
]
const DAMAGE: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'paths', label: 'Wyraźne ścieżki zwierzyny i penetracji ludzkiej poza szlakami, zniszczenia pojazdami mechanicznymi', grade: 'U1' },
  { value: 'aeolian', label: 'Ścieżki penetracji ludzkiej poza szlakami, zniszczenia pojazdami mechanicznymi, które uruchomiły procesy eoliczne', grade: 'U2' },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

/** Select niewymagany – gdy są pomiary, wystarczą pomiary. */
const optionalSelect = (label: string, options: GradedOption[], help?: string): FieldDef => ({ ...selectInput(label, options, help), required: false })

const noteInput = (label: string, placeholder: string, help: string): FieldDef => ({ kind: 'textarea', name: 'note', label, rows: 2, placeholder, help })

/** „Wartość” w karcie: notatka obserwatora, a bez niej etykieta wybranej klasy. */
const noteOr = (i: InputValues, options: GradedOption[]) => String(i.note ?? '').trim() || labelOf(options, i.choice)

/** Ostrzeżenie, gdy wybrana klasa nie zgadza się z policzoną. */
const mismatch = (options: GradedOption[], i: InputValues, computed: Grade | null, what: string) => {
  if (!computed || !i.choice) return null
  const chosen = gradeMap(options)[String(i.choice)]
  return chosen && chosen !== computed ? `Wg ${what} to ${computed}, a wybrano ${chosen}.` : null
}

// ---------- obliczenia wskaźników ----------

/** Nalot drzew stwierdzony we wskaźniku „Obecność nalotu drzew” (ocena U1/U2 albo pokrycie ≥1%). */
function treesPresent(ctx?: IndicatorContext): boolean {
  const t = ctx?.indicators?.trees
  if (!t) return false
  if (t.grade === 'U1' || t.grade === 'U2') return true
  const c = num(t.inputs?.cover)
  return c !== undefined && c >= 1
}

function combinationOf(i: InputValues, ctx?: IndicatorContext) {
  const names = rowNames(i.species)
  const shrubs = uniq(names.filter(isShrub2140).map((n) => findSpecies2140(n)!.latin))
  const empetrum = shrubs.includes('Empetrum nigrum')
  const moss = num(i.mossCover)
  const trees = treesPresent(ctx)
  let grade: Grade | null = null
  if (moss !== undefined && names.length) grade = gradeCombination2140({ shrubs: shrubs.length, empetrum, mossCover: moss, trees })
  else if (names.length && shrubs.length === 0) grade = 'U2'
  return { names, shrubs, empetrum, moss, trees, grade }
}

/** Obce/ekspansywne: lista z pokryciem ma pierwszeństwo; lista bez żadnego pokrycia → klasa z selecta. */
function coverListGrade(i: InputValues): Grade | null {
  const { count, total } = listCover(i)
  if (count === 0) return null
  if (total === undefined) return null
  return gradeCoverBB2140(count, total)
}

function nitroGrade(i: InputValues): Grade | null {
  const rows = speciesRows(i.species).filter((r) => r.name?.trim())
  if (!rows.length) return null
  return gradeNitrophilous2140(rows.map((r) => num(r.cover)))
}

function vitalityGrade(i: InputValues): { grade: Grade | null; from?: 'leafless' | 'absent' } {
  const leafless = num(i.leaflessPct)
  if (leafless !== undefined && leafless > LEAFLESS_U2) return { grade: 'U2', from: 'leafless' }
  const c = num(i.callunaCover)
  const en = num(i.empetrumCover)
  if (c === 0 && en === 0) return { grade: 'U2', from: 'absent' }
  return { grade: byOption(gradeMap(VITALITY))(i) }
}

function treesGrade(i: InputValues): Grade | null {
  const c = num(i.cover)
  return c !== undefined ? gradeTrees2140(c) : byOption(gradeMap(TREES))(i)
}

/** Opis listy gatunków obcych/ekspansywnych/nitrofilnych: lista z pokryciem, a bez niej „Brak” lub etykieta klasy. */
const describeList = (i: InputValues, options: GradedOption[]) => {
  const list = describeSpecies(speciesRows(i.species))
  if (list) return list
  return i.choice === 'none' ? 'Brak' : labelOf(options, i.choice)
}

const BB_HELP = `Skala Braun-Blanqueta a procenty: r, + i 1 to pokrycie poniżej 5%, stopień 2 – od 5% do 25%. „Najwyżej 1” znaczy więc łącznie mniej niż 5% transektu, „większy od 1” – 5% i więcej.`

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description: 'Zmiana powierzchni płatów wrzosowiska bażynowego na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury.',
    help: `Co wybrać: jak zmieniła się powierzchnia płatów wrzosowiska na stanowisku od poprzedniej obserwacji (albo względem literatury, ortofotomapy). Powierzchnię w m² wpisz obok – trafi do pola „wartość”.

Progi: nie podlega zmianom lub zwiększa się – FV; wyraźny spadek w porównaniu z wcześniejszymi badaniami lub literaturą – U2; inne kombinacje – U1.

Płaty są małe: od kilkudziesięciu m² do kilku arów (sprawozdanie 2024: 40–500 m², zwykle ok. 1 ar). Sprawozdanie 2013–2014 zaleca obrysować płaty odbiornikiem GPS – przy tak małej powierzchni szacunek „na oko” myli się o połowę.

Praktyka 2024: stanowiska, na których wrzosowisko zanikło (abrazja, zarośnięcie borem), dostawały U2. Przy pierwszym badaniu (nie ma z czym porównać) wybierz „Brak danych do porównania” albo oceń ekspercko.`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się',
      U1: 'Inne kombinacje',
      U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze',
    },
    inputs: [
      optionalSelect('Zmiana powierzchni', AREA, 'Puste, gdy oceniasz ekspercko (np. pierwsze badanie).'),
      { kind: 'number', name: 'areaM2', label: 'Powierzchnia (opcjonalnie)', unit: 'm²', min: 0, help: 'Powierzchnia płatów wrzosowiska na stanowisku w m², jeśli ją znasz – trafi do pola „wartość”. Zwykle od kilkudziesięciu do kilkuset m².' },
      noteInput('Opis (opcjonalnie)', 'np. powierzchnia badanego siedliska na stanowisku wynosi około 100 m²', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => {
      const m2 = num(i.areaM2)
      const note = String(i.note ?? '').trim()
      return [m2 !== undefined ? `${plNum(m2)} m²` : '', note || (i.choice ? labelOf(AREA, i.choice).toLowerCase() : '')].filter(Boolean).join('; ')
    },
  },
  {
    id: 'combination',
    label: 'Charakterystyczna kombinacja florystyczna',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków charakterystycznych (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy gatunek na transekcie (z dokładnością do 10%). Nadmorskie wrzosowiska bażynowe nie mają własnych gatunków charakterystycznych w sensie fitosocjologicznym – dominują przemiennie bażyna czarna i wrzos zwyczajny, z dobrze rozwiniętą warstwą mszysto-porostową.',
    help: `Co wpisać: krzewinki (bażyna, wrzos, borówka brusznica, czarna) i najważniejsze mchy i porosty z pokryciem transektu w %, a obok – jaką część płatu pokrywa warstwa mszysto-porostowa. Wtedy formularz sam policzy ocenę. Bez pokrycia mchów wybierz klasę.

Progi: co najmniej 2 gatunki krzewinkowe (jeden z nich to bażyna) oraz bogata i zwarta warstwa mszysto-porostowa, brak nalotów drzew – FV; jeden gatunek krzewinkowy i warstwa mszysto-porostowa pokrywająca nie mniej niż 50% płatu – U1; zbiorowisko na krawędzi zaniku, bez warstwy mszysto-porostowej, jedynie z krzewinkami o osłabionej żywotności – U2.

Jak liczy formularz: „zwarta” warstwa mszysto-porostowa = co najmniej 50% płatu (ten sam próg co w U1). Brak krzewinek albo 0% mchów – U2. Nalot drzew bierze z wskaźnika „Obecność nalotu drzew” (U1/U2 albo pokrycie ≥1% odbiera FV). Pozostałe kombinacje (np. 2 krzewinki bez bażyny, mchy poniżej 50%) – U1.

Wskaźnik kardynalny. Praktyka 2024: FV przy wrzosie, bażynie, brusznicy, czernicy, śmiałku i zwartej warstwie mchów (rokietnik, widłozęby); U1 przy uboższym składzie (wrzos 60–70%, bażyna sporadycznie); U2, gdy wrzosowisko zanikło albo przeszło w bór sosnowy z runem bażynowym. Gatunki wydmowe w płacie na ekotonie wydmy i boru to rzecz normalna – nie obniżają oceny.`,
    thresholds: thresholdsOf(COMBINATION),
    inputs: [
      speciesInput(
        'Gatunki kombinacji florystycznej na transekcie',
        'Krzewinki, mchy i porosty z przybliżonym pokryciem transektu w %, np. Empetrum nigrum 4, Calluna vulgaris 2, Dicranum scoparium 2. Lista trafia do karty jako „wartość”.',
      ),
      { kind: 'number', name: 'mossCover', label: 'Warstwa mszysto-porostowa (% płatu)', unit: '%', min: 0, max: 100, help: 'Jaką część płatu wrzosowiska pokrywa warstwa mszysto-porostowa (mchy i porosty naziemne). Z listą gatunków daje ocenę: od 50% to „zwarta” warstwa, 0% – brak warstwy (U2).' },
      optionalSelect('Klasa (gdy bez pomiaru)', COMBINATION, 'Wybierz, gdy nie szacujesz pokrycia warstwy mszysto-porostowej.'),
      noteInput('Opis (opcjonalnie)', 'np. wrzos zwyczajny Calluna vulgaris 2%, bażyna czarna Empetrum nigrum 4%…', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków (np. z polskimi nazwami, jak w karcie z przewodnika).'),
    ],
    suggest: (i, ctx) => combinationOf(i, ctx).grade ?? byOption(gradeMap(COMBINATION))(i),
    explain: (i, ctx) => {
      const c = combinationOf(i, ctx)
      if (!c.names.length) return null
      const parts = [`Krzewinek na liście: ${c.shrubs.length}${c.empetrum ? ' (w tym bażyna)' : c.shrubs.length ? ' (bez bażyny)' : ''}`]
      const bryo = uniq(c.names.filter(isBryoLichen2140)).length
      parts.push(`mchów i porostów: ${bryo}`)
      if (c.moss !== undefined) parts.push(`warstwa mszysto-porostowa ${pct(c.moss)} płatu`)
      if (c.trees) parts.push('nalot drzew we wskaźniku „Obecność nalotu drzew” – bez FV')
      return `${parts.join(', ')}.`
    },
    warn: (i, ctx) => {
      const c = combinationOf(i, ctx)
      if (!c.names.length) return null
      if (c.grade === null && !i.choice) return null
      return mismatch(COMBINATION, i, c.grade, 'listy i pokrycia mchów')
    },
    describe: (i) => String(i.note ?? '').trim() || describeSpecies(speciesRows(i.species)) || labelOf(COMBINATION, i.choice),
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    description:
      'Lista inwazyjnych gatunków obcych geograficznie (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy gatunek na transekcie (z dokładnością do 10%). Przewodnik: dotychczas nie obserwowano; ze względu na potencjalne zagrożenie wskaźnik należy monitorować.',
    help: `Co wpisać: gatunki obce stwierdzone na transekcie z pokryciem w %. Pusta lista i „Brak” – FV. Formularz sumuje pokrycie z listy; bez pokrycia wybierz klasę.

Progi: brak – FV; łączny stopień pokrycia wszystkich obcych gatunków inwazyjnych w skali Br.-Bl. najwyżej 1 – U1; większy od 1 – U2. ${BB_HELP}

Notowane w sprawozdaniach: róża pomarszczona Rosa rugosa (sadzona do „stabilizacji” wydm), sosna czarna Pinus nigra (z nasadzeń), kosodrzewina Pinus mugo (obca ekologicznie), czeremcha amerykańska Padus serotina, mech krzywoszczeć przywłoka Campylopus introflexus, powojnik pnący Clematis vitalba.

Jedyny wskaźnik niekardynalny w tej karcie.`,
    thresholds: thresholdsOf(ALIENS),
    inputs: [
      speciesInput('Obce gatunki inwazyjne na transekcie', 'Gatunki obce z przybliżonym pokryciem transektu w %. Brak – zostaw pustą listę i wybierz „Brak”.'),
      optionalSelect('Klasa (gdy bez pokrycia)', ALIENS, 'Wybierz, gdy nie szacujesz pokrycia albo nie ma gatunków obcych („Brak”).'),
    ],
    suggest: (i) => coverListGrade(i) ?? byOption(gradeMap(ALIENS))(i),
    explain: (i) => {
      const { count, total } = listCover(i)
      return count && total !== undefined ? `Łączne pokrycie gatunków obcych: ${pct(total)} (${total < BB1_MAX_COVER ? 'Br.-Bl. najwyżej 1' : 'Br.-Bl. powyżej 1'}).` : null
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (i.choice === 'none' && names.length) return 'Wybrano „Brak”, a lista gatunków obcych nie jest pusta.'
      const native = names.filter((n) => findSpecies2140(n) && !isAlien2140(n))
      if (native.length) return `Na liście gatunków obcych są gatunki rodzime: ${native.join(', ')}.`
      return mismatch(ALIENS, i, coverListGrade(i), 'pokrycia z listy')
    },
    describe: (i) => describeList(i, ALIENS),
  },
  {
    id: 'expansive',
    label: 'Rodzime gatunki ekspansywne roślin zielnych',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista rodzimych gatunków ekspansywnych (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy gatunek na transekcie (z dokładnością do 10%). W miejscach z aktywnymi procesami eolicznymi występuje np. piaskownica zwyczajna Ammophila arenaria.',
    help: `Co wpisać: rodzime gatunki ekspansywne na transekcie z pokryciem w %. Pusta lista i „Brak” – FV. Formularz sumuje pokrycie z listy; bez pokrycia wybierz klasę.

Progi: brak – FV; łączny stopień pokrycia wszystkich gatunków ekspansywnych w skali Br.-Bl. najwyżej 1 – U1; większy od 1 – U2. ${BB_HELP}

Wskaźnik kardynalny. Uwaga na interpretację: sprawozdanie 2024 poprawiło oceny z 2018 r. – gatunki wydmy szarej wchodzące w płat na ekotonie wydmy i boru (turzyca piaskowa, szczotlicha, jasieniec) to normalny element siedliska, nie ekspansja. Wpisuj tu tylko gatunki, które faktycznie opanowują płat: piaskownicę na nawiewanym piasku, trzcinnik piaskowy.`,
    thresholds: thresholdsOf(EXPANSIVE),
    inputs: [
      speciesInput('Gatunki ekspansywne na transekcie', 'Rodzime gatunki ekspansywne z przybliżonym pokryciem transektu w %. Brak – zostaw pustą listę i wybierz „Brak”.'),
      optionalSelect('Klasa (gdy bez pokrycia)', EXPANSIVE, 'Wybierz, gdy nie szacujesz pokrycia albo nie ma gatunków ekspansywnych („Brak”).'),
    ],
    suggest: (i) => coverListGrade(i) ?? byOption(gradeMap(EXPANSIVE))(i),
    explain: (i) => {
      const { count, total } = listCover(i)
      return count && total !== undefined ? `Łączne pokrycie gatunków ekspansywnych: ${pct(total)} (${total < BB1_MAX_COVER ? 'Br.-Bl. najwyżej 1' : 'Br.-Bl. powyżej 1'}).` : null
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (i.choice === 'none' && names.length) return 'Wybrano „Brak”, a lista gatunków ekspansywnych nie jest pusta.'
      const typical = names.filter((n) => findSpecies2140(n) && !isExpansive2140(n))
      if (typical.length) return `Spoza listy gatunków ekspansywnych: ${typical.join(', ')} – sprawdź, czy to naprawdę ekspansja (sprawozdanie 2024: gatunki wydmowe na ekotonie to norma).`
      return mismatch(EXPANSIVE, i, coverListGrade(i), 'pokrycia z listy')
    },
    describe: (i) => describeList(i, EXPANSIVE),
  },
  {
    id: 'nitrophilous',
    label: 'Gatunki nitrofilne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków nitrofilnych (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy gatunek na transekcie (z dokładnością do 10%), np. Urtica urens, związana z nadmierną penetracją wydmy przez ludzi i eutrofizacją siedliska. Na ogół tylko pojedyncze osobniki: nawłoć pospolita Solidago virgaurea, wierzbówka kiprzyca Chamaenerion angustifolium.',
    help: `Co wpisać: gatunki nitrofilne na transekcie, każdy z pokryciem w %. Pusta lista i „Brak” – FV.

Progi: brak – FV; jeden lub dwa gatunki ze stopniem pokrycia r lub 1 – U1; pokrycie któregokolwiek gatunku większe od 1 albo więcej niż dwa gatunki – U2. ${BB_HELP}

Jak liczy formularz: liczy gatunki na liście i sprawdza pokrycie każdego z osobna. Gatunek bez wpisanego pokrycia traktowany jest jak pojedyncze osobniki (r/+), bo tak zwykle wygląda w tym siedlisku – jeśli jest go więcej, wpisz pokrycie.

Wskaźnik kardynalny. Praktyka: pojedyncza wierzbówka kiprzyca albo nawłoć – U1 (2014, 2024). Szczaw polny Rumex acetosella (U1 w Rowach w 2018 r.) to raczej gatunek kwaśnych piasków niż nitrofil – w katalogu nie jest nitrofilny.`,
    thresholds: thresholdsOf(NITRO),
    inputs: [
      speciesInput('Gatunki nitrofilne na transekcie', 'Gatunki nitrofilne, każdy z przybliżonym pokryciem transektu w %. Brak – zostaw pustą listę i wybierz „Brak”.'),
      optionalSelect('Klasa (gdy bez listy)', NITRO, 'Wybierz, gdy nie wypisujesz gatunków albo nie ma gatunków nitrofilnych („Brak”).'),
    ],
    suggest: (i) => nitroGrade(i) ?? byOption(gradeMap(NITRO))(i),
    explain: (i) => {
      const rows = speciesRows(i.species).filter((r) => r.name?.trim())
      if (!rows.length) return null
      const big = rows.filter((r) => (num(r.cover) ?? 0) >= BB1_MAX_COVER).map((r) => r.name.trim())
      return `Gatunków nitrofilnych: ${rows.length}${big.length ? `; pokrycie 5% i więcej (Br.-Bl. >1): ${big.join(', ')}` : ''}.`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (i.choice === 'none' && names.length) return 'Wybrano „Brak”, a lista gatunków nitrofilnych nie jest pusta.'
      const other = names.filter((n) => findSpecies2140(n) && !isNitrophilous2140(n))
      if (other.length) return `Spoza katalogu gatunków nitrofilnych: ${other.join(', ')}.`
      return mismatch(NITRO, i, nitroGrade(i), 'listy')
    },
    describe: (i) => describeList(i, NITRO),
  },
  {
    id: 'vitality',
    label: 'Stan populacji gatunków wskaźnikowych: bażyny czarnej Empetrum nigrum i wrzosu zwyczajnego Calluna vulgaris',
    parameter: 'structure',
    cardinal: true,
    description:
      'Ocena żywotności obserwowanych okazów wrzosu zwyczajnego Calluna vulgaris i bażyny czarnej Empetrum nigrum: udział procentowy powierzchni zajętej przez każdy gatunek na transekcie (z dokładnością do 10%) i żywotność. Wskaźnik jest obniżany, jeśli gatunki te są zasypywane przez piasek.',
    help: `Co wpisać: pokrycie transektu przez wrzos i bażynę (%), klasę żywotności i krótki opis (kwitnienie, owocowanie, pędy bez liści, zamieranie). Opcjonalnie – jaka część pędów krzewinek jest bez liści.

Progi: bardzo dobra żywotność, bujny wzrost, obfite kwitnienie i owocowanie – FV; starzenie się płatów, niewielkie fragmenty pędów bez liści (zwłaszcza u wrzosu) – U1; słabe lub brak kwitnienia i owocowania, ponad połowa wszystkich pędów bez liści – U2.

Jak liczy formularz: ponad 50% pędów bez liści – U2 niezależnie od wybranej klasy; wrzos i bażyna 0% (brak gatunków wskaźnikowych, np. po abrazji) – U2. Poza tym ocena z klasy.

Wskaźnik kardynalny. Termin ma znaczenie: lipiec i pierwsza połowa sierpnia. Sprawozdanie 2018: obserwacje jesienne (2006–2014) zawyżały oceny, a susza w 2018 r. mogła je zaniżać – zapisz pogodę w uwagach. Zasypywanie piaskiem: przewodnik każe obniżać ocenę; sprawozdanie 2024 zaznacza, że zasypywane pędy, dopóki są żywotne, nie są powodem do obniżenia – formularz tylko ostrzega.`,
    thresholds: thresholdsOf(VITALITY),
    inputs: [
      { kind: 'number', name: 'callunaCover', group: 'Pokrycie transektu', label: 'Wrzos Calluna vulgaris', unit: '%', min: 0, max: 100, help: 'Pokrycie transektu przez wrzos zwyczajny, w %.' },
      { kind: 'number', name: 'empetrumCover', group: 'Pokrycie transektu', label: 'Bażyna Empetrum nigrum', unit: '%', min: 0, max: 100, help: 'Pokrycie transektu przez bażynę czarną, w %. Wrzos i bażyna 0% – brak gatunków wskaźnikowych, U2.' },
      { kind: 'number', name: 'leaflessPct', label: 'Pędy krzewinek bez liści (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Szacunkowy procent pędów wrzosu i bażyny bez liści. Ponad 50% – U2 (tab. 2).' },
      selectInput('Żywotność', VITALITY),
      {
        kind: 'select',
        name: 'buried',
        label: 'Zasypywanie piaskiem',
        options: [
          { value: 'no', label: 'Nie' },
          { value: 'yes', label: 'Tak – krzewinki zasypywane przez piasek' },
        ],
        help: 'Czy krzewinki są zasypywane przez nawiewany piasek. Przewodnik (tab. 1): wskaźnik się wtedy obniża. Formularz ostrzega przy wyborze FV.',
      },
      noteInput('Żywotność – opis (opcjonalnie)', 'np. żywotność bardzo dobra i dobra, bujny wzrost, osobniki kwitnące i owocujące', 'Krótki opis żywotności. Trafia do „wartości” w karcie po pokryciu wrzosu i bażyny.'),
    ],
    suggest: (i) => vitalityGrade(i).grade,
    explain: (i) => {
      const v = vitalityGrade(i)
      if (v.from === 'leafless') return `Pędy bez liści: ${pct(num(i.leaflessPct)!)} – ponad połowa, więc U2.`
      if (v.from === 'absent') return 'Brak wrzosu i bażyny na transekcie – U2.'
      return null
    },
    warn: (i) => {
      const leafless = num(i.leaflessPct)
      if (i.choice === 'good' && leafless !== undefined && leafless > 0) return `Wybrano FV, a ${pct(leafless)} pędów jest bez liści – przy FV nie powinno ich być.`
      if (i.choice === 'good' && i.buried === 'yes') return 'Krzewinki są zasypywane piaskiem – wg przewodnika ocenę się obniża (sprawozdanie 2024: dopóki pędy są żywotne, nie trzeba).'
      return null
    },
    describe: (i) => {
      const c = num(i.callunaCover)
      const en = num(i.empetrumCover)
      const note = String(i.note ?? '').trim() || labelOf(VITALITY, i.choice)
      const covers = [c !== undefined ? `wrzos zwyczajny Calluna vulgaris ${pct(c)}` : '', en !== undefined ? `bażyna czarna Empetrum nigrum ${pct(en)}` : ''].filter(Boolean)
      if (!covers.length) return note
      return `Powierzchnia pokrycia w transekcie: ${covers.join(', ')}.${note ? ` ${note}` : ''}`
    },
  },
  {
    id: 'abrasion',
    label: 'Występowanie abrazji',
    parameter: 'structure',
    cardinal: true,
    description:
      'Intensywne/sporadyczne/brak. Jest to jeden z czynników decydujących o wielkości powierzchni i stanie zachowania siedliska. Największego zniszczenia dokonują sztormy w czasie jesieni i zimy. W ostatnich latach obserwuje się nasilenie tych procesów.',
    help: `Co wybrać: czy morze podcina wydmy przy stanowisku. Patrz na wały wydm białych i przednich od strony morza i na krawędź wydmy szarej, na której leży płat. Krótki opis w notatce trafi do karty.

Progi: brak abrazji, wybrzeże akumulacyjne – FV; rzadkie podcinanie wałów wydm białych i przednich – U1; podcinanie i tworzenie się klifowych krawędzi wydm szarych, zagrażające trwałości siedliska – U2.

Stanowisko w głębi lądu, poza zasięgiem morza, też dostaje FV (praktyka 2024 – „część stanowisk zlokalizowanych jest w głębi lądu”).

Wskaźnik kardynalny. Dlaczego: jeden sztorm potrafi zabrać płat w całości – w latach 2014–2024 abrazja zlikwidowała kilka stanowisk (SPN-b1, Rowy). Sprawozdanie 2018 uważa wskaźnik za zależny głównie od odległości od brzegu, ale metodyka trzyma go jako kardynalny.`,
    thresholds: thresholdsOf(ABRASION),
    inputs: [
      selectInput('Abrazja', ABRASION),
      noteInput('Co widać (opcjonalnie)', 'np. Brak', 'Krótki opis: podcięte wały, klifowa krawędź wydmy szarej, odległość od brzegu. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(ABRASION)),
    describe: (i) => noteOr(i, ABRASION),
  },
  {
    id: 'trees',
    label: 'Obecność nalotu drzew',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków drzew (polska i łacińska nazwa) z udziałem procentowym powierzchni zajętej przez każdy gatunek na transekcie (z dokładnością do 10%). W naturalnych siedliskach obecność nalotu drzew związana jest ze spontanicznym pojawianiem się pojedynczych siewek i podrostów (głównie sosny zwyczajnej) w wyniku sukcesji w kierunku boru.',
    help: `Co wpisać: gatunki drzew w płacie (siewki, nalot, podrost) z pokryciem, łączne pokrycie nalotu w % powierzchni płatu, albo tylko klasę. Pokrycie ma pierwszeństwo przed klasą.

Progi: brak nalotu lub pojedyncze siewki sosny, brzozy – FV; nieliczny nalot drzew, zajmuje do 10% powierzchni – U1; zwarte drzewa lub nalot np. sosnowy i brzozowy – U2.

Jak liczy formularz: poniżej 1% płatu – „pojedyncze siewki”, FV; od 1% do 10% – U1; powyżej 10% – U2.

Wskaźnik kardynalny i dziś najgorzej oceniany (2024: U2 na połowie stanowisk). Dlaczego: bez usuwania nalotu wrzosowisko zarasta borem bażynowym – a w parkach narodowych i rezerwatach obowiązuje ochrona bierna. Sprawozdanie 2018: wcześniej zaniżano ten wskaźnik – licz też kilkunastoletnie sosny, nie tylko siewki. Nalot ponad 50 cm to już podrost.`,
    thresholds: thresholdsOf(TREES),
    inputs: [
      speciesInput('Drzewa na transekcie', 'Gatunki drzew z pokryciem transektu w %, np. Pinus sylvestris 2, Betula pendula 1. Pojedyncze siewki – bez pokrycia.'),
      { kind: 'number', name: 'cover', label: 'Nalot drzew (% płatu)', unit: '%', min: 0, max: 100, help: 'Łączne pokrycie nalotu i podrostu drzew w płacie wrzosowiska. Poniżej 1% – pojedyncze siewki (FV), do 10% – U1, więcej – U2. Ma pierwszeństwo przed klasą.' },
      optionalSelect('Klasa (gdy bez pomiaru)', TREES, 'Wybierz, gdy nie szacujesz pokrycia.'),
      noteInput('Opis (opcjonalnie)', 'np. sosna zwyczajna Pinus sylvestris, pojedyncze siewki w transekcie', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => treesGrade(i),
    explain: (i) => {
      const names = rowNames(i.species)
      const c = num(i.cover)
      const parts = [names.length ? `Gatunki drzew: ${uniq(names).join(', ')}` : '', c !== undefined ? `nalot ${pct(c)} płatu` : ''].filter(Boolean)
      return parts.length ? `${parts.join('; ')}.` : null
    },
    warn: (i) => {
      const names = rowNames(i.species)
      const other = names.filter((n) => findSpecies2140(n) && !isTree2140(n) && !isAlien2140(n))
      if (other.length) return `Na liście drzew są gatunki niedrzewiaste: ${other.join(', ')}.`
      if (i.choice === 'none' && (coverWhere(i.species, () => true).total ?? 0) > 10) return 'Wybrano „brak nalotu”, a pokrycie drzew z listy przekracza 10%.'
      const c = num(i.cover)
      return c !== undefined ? mismatch(TREES, i, gradeTrees2140(c), 'pokrycia nalotu') : null
    },
    describe: (i) => {
      const note = String(i.note ?? '').trim()
      if (note) return note
      const list = describeSpecies(speciesRows(i.species))
      const c = num(i.cover)
      return [list, c !== undefined ? `nalot ${pct(c)} płatu` : ''].filter(Boolean).join('; ') || labelOf(TREES, i.choice)
    },
  },
  {
    id: 'damage',
    label: 'Zniszczenia mechaniczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Zniszczenia związane są z penetracją i presją turystyczną w pobliżu miejscowości i ośrodków turystycznych, są to dzikie ścieżki i niszczenie pokrywy roślinnej pojazdami mechanicznymi.',
    help: `Co ocenić: dzikie ścieżki (ludzi i zwierzyny) poza wyznaczonymi szlakami, ślady pojazdów, wydeptane płaty, wyrwy w pokrywie roślinnej. Krótki opis w notatce trafi do karty.

Progi: brak – FV; wyraźne ścieżki zwierzyny i penetracji ludzkiej poza szlakami, zniszczenia pojazdami mechanicznymi – U1; ścieżki i zniszczenia, które uruchomiły procesy eoliczne (wywiewanie piasku) – U2.

Wskaźnik kardynalny. W latach 2006–2008 osobno oceniano „Występowanie procesów eolicznych” – dziś mieści się w tym wskaźniku: granicą U1/U2 jest to, czy zniszczenie ruszyło piasek. Praktyka 2024: 13 z 14 stanowisk FV, U2 w Rowach (liczne wydeptane ścieżki mimo parku narodowego). Sprawozdanie 2018 proponowało, by jednorazowe, incydentalne zniszczenie w dobrze wykształconym płacie nie musiało obniżać struktury – metodyki nie zmieniono, więc formularz liczy wg tab. 2.`,
    thresholds: thresholdsOf(DAMAGE),
    inputs: [
      selectInput('Zniszczenia', DAMAGE),
      noteInput('Opis zniszczeń (opcjonalnie)', 'np. wydeptana ścieżka przez płat, odsłonięty piasek', 'Krótki opis zniszczeń. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(DAMAGE)),
    describe: (i) => noteOr(i, DAMAGE),
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu, z odbiornika GPS (WGS84). Przy nieregularnym transekcie to zwykle środki zdjęć fitosocjologicznych. Trzymaj jeden format w całej karcie.

Dlaczego: płaty są małe i rozproszone – bez dokładnych współrzędnych następny obserwator nie trafi w ten sam płat (sprawozdanie 2018: kilku transektów z lat 2006–2014 nie odnaleziono).`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Czołpino',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Czołpino”, „Mierzeja Sarbska 7”, „Białogóra 1, podtyp 2140-1”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego płatu.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'select',
    name: 'subtype',
    label: 'Podtyp',
    options: [
      { value: '2140-1', label: '2140-1 – suche wrzosowisko bażynowe Carici arenariae-Empetretum nigri' },
      { value: '2140-2', label: '2140-2 – wrzosowisko brusznicowo-bażynowe (zbiorowisko Empetrum nigrum-Vaccinium vitis-idaea)' },
    ],
    help: `Podtyp siedliska:
• 2140-1 – suche wrzosowisko bażynowe, najczęściej na północnych stokach starych wydm szarych, oddalonych od morza, i na ich obrzeżach przy borze bażynowym; wyraźna krzewinkowa struktura, pojedyncze gatunki murawy psammofilnej;
• 2140-2 – wrzosowisko brusznicowo-bażynowe z borówką brusznicą, w bezleśnych enklawach i na obrzeżach nadmorskiego boru bażynowego; więcej gatunków leśnych.

Podtyp nie zmienia progów – trafia do karty i do opisu stanowiska.`,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    defaultValue: 'Carici arenariae-Empetretum nigri',
    placeholder: 'np. Carici arenariae-Empetretum nigri, Helichryso-Jasionetum litoralis',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Dla 2140: klasa Nardo-Callunetea, rząd Calluno-Ulicetalia, związek Empetrion nigri – zespół Carici arenariae-Empetretum nigri (suche wrzosowisko bażynowe) i zbiorowisko Empetrum nigrum-Vaccinium vitis-idaea (wrzosowisko brusznicowo-bażynowe). Dopisz sąsiadujące, np. murawę Helichryso-Jasionetum litoralis.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 6,
    required: true,
    hint: 'Gdzie leżą płaty (stok, ekspozycja, nachylenie), co dominuje, sąsiedztwo boru i wydmy szarej, odległość od morza.',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• położenie płatów: stok wydmy szarej/brunatnej, ekspozycja (zwykle N, NE, NW), nachylenie (10–50°), wierzchowina;
• wielkość i rozmieszczenie płatów (zwykle nieregularne, po kilkadziesiąt m²);
• co dominuje: bażyna czy wrzos, borówka brusznica, stan warstwy mszysto-porostowej;
• sąsiedztwo: bór bażynowy, wydma szara 2130, odległość od brzegu morza;
• faza rozwoju (inicjalna, optymalna, terminalna), nalot drzew.`,
  },
  {
    kind: 'number',
    name: 'areaM2',
    label: 'Powierzchnia płatów siedliska',
    unit: 'm²',
    min: 0,
    required: true,
    help: 'Łączna powierzchnia płatów wrzosowiska na stanowisku, w m² – zwykle od kilkudziesięciu do kilkuset m² (ok. 100 m² w karcie z przewodnika). Najlepiej obrysuj płaty odbiornikiem GPS (zalecenie sprawozdania 2013–2014).',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „PLH220023 Ostoja Słowińska; Słowiński Park Narodowy”. Brak – „brak”.',
  }),
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', required: true, help: coordHelp('końca') },
  {
    kind: 'textarea',
    name: 'transect',
    label: 'Wymiary transektu',
    rows: 2,
    required: true,
    hint: 'Zwykle nieregularny – przez wszystkie płaty, z 3 zdjęciami fitosocjologicznymi.',
    help: `Transekt ma najczęściej kształt nieregularny, bo płaty są małe. Stan siedliska ocenia się, przechodząc wzdłuż transektu, na którym robi się trzy zdjęcia fitosocjologiczne – w miarę możliwości na początku, w środku i na końcu – po 4–16 m², zależnie od płatu. Standardowo jeden transekt na stanowisko. Opisz kształt i wymiary, np. „prostokąt 200 m × do 10 m, płaty rozmieszczone nierównomiernie”.

Przebieg transektu nanieś na mapę 1:5000 (wydruk z ortofotomapy) albo topograficzną 1:10 000.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 4–10',
    help: 'Wysokość płatów nad poziomem morza – na stokach wydm zwykle kilka–kilkanaście metrów. Można wpisać zakres („4–10”).',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 07.08.2008',
    required: true,
    hint: 'Optymalnie lipiec i pierwsza połowa sierpnia.',
    help: `Dzień badań terenowych. Najlepszy termin: lipiec i pierwsza połowa sierpnia (kwitnienie wrzosu, owocowanie bażyny). Płaty ocenione na U2, zagrożone szybkim zanikiem, bada się co 2 lata, pozostałe co 3–4 lata.

Uwaga: obserwacje jesienne (wrzesień–październik, jak w latach 2006–2014) zawyżały ocenę żywotności krzewinek – sprawozdanie 2018.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const [, m, d] = v.split('-').map(Number)
      return m === 7 || (m === 8 && d <= 15) ? null : 'Termin poza optymalnym oknem (lipiec – połowa sierpnia). Żywotność krzewinek może wyjść inaczej.'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcia fitosocjologiczne: 3 × 4–16 m² ----------

const r7120 = methodology7120.releves.fields
const LAYERS_GROUP = 'Zwarcie i wysokość warstw'

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', {
    help: 'Współrzędne GPS środka zdjęcia. Zdjęcia robi się w miarę możliwości na początku, w środku i na końcu transektu – ich położenie wyznacza przebieg transektu.',
  }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach.' }),
  pickField(r7120, 'area', {
    defaultValue: 9,
    help: 'Powierzchnia zdjęcia w m². Metodyka: od 4 do 16 m², zależnie od wielkości płatu (w karcie z przewodnika 3×3 m = 9 m²; jedno zdjęcie 5×5 m).',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Wrzosowiska leżą zwykle na stokach wydm o nachyleniu 10–50°; na wierzchowinie wpisz 0.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…). Typowo N, NE, NW. Dla powierzchni płaskiej wpisz „brak”.' }),
  pickField(r7120, 'coverB', { group: LAYERS_GROUP, groupCols: 3, help: 'Warstwa B – nalot i podrost drzew (sosna, brzoza), w % powierzchni zdjęcia. Brak = 0.' }),
  pickField(r7120, 'coverC', { group: LAYERS_GROUP, help: 'Warstwa C – krzewinki i rośliny zielne (bażyna, wrzos, brusznica, śmiałek), w % powierzchni zdjęcia.' }),
  pickField(r7120, 'coverD', { group: LAYERS_GROUP, help: 'Warstwa D – mchy i porosty naziemne, w % powierzchni zdjęcia. Bogata i zwarta warstwa mszysto-porostowa to warunek FV kombinacji florystycznej.' }),
  pickField(r7120, 'heightB', { group: LAYERS_GROUP, help: 'Typowa wysokość nalotu/podrostu drzew w metrach. Brak = 0. Nalot do 50 cm, podrost wyżej (sprawozdanie 2018).' }),
  pickField(r7120, 'heightC', { group: LAYERS_GROUP, help: 'Typowa wysokość krzewinek w centymetrach (zwykle 10–40 cm).' }),
  pickField(r7120, 'heightD', { group: LAYERS_GROUP, help: 'Typowa wysokość warstwy mszysto-porostowej w centymetrach.' }),
  pickField(r7120, 'unit', {
    placeholder: 'np. Carici arenariae-Empetretum nigri',
    help: 'Jednostka fitosocjologiczna zdjęcia: Carici arenariae-Empetretum nigri albo zbiorowisko Empetrum nigrum-Vaccinium vitis-idaea.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w poletku z ilościowością w skali Braun-Blanqueta (r, +, 1–5): krzewinki i zielne w C, mchy i porosty w D, nalot drzew w B (siewki w C).',
  }),
]

export const methodology2140: Methodology = {
  code: '2140',
  name: 'Nadmorskie wrzosowiska bażynowe',
  priority: true,
  source:
    'Braun M. 2010, Nadmorskie wrzosowiska bażynowe (2140), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. I, GIOŚ, s. 73–83 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2006–2008, 2013–2014, 2016–2018 i 2023–2025',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Na transekcie wykonaj trzy zdjęcia fitosocjologiczne metodą Braun-Blanqueta – w miarę możliwości na początku, w środku i na końcu – po 4–16 m², zależnie od wielkości płatu. Krzewinki w warstwie C, mchy i porosty w D.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Ocenie powinny podlegać realne możliwości zachowania właściwego stanu siedliska oraz poprawy stanu niewłaściwego. W opisie należy umieścić informację na temat potencjalnych zabiegów ochronnych dla zachowania bądź poprawy stanu siedliska.',
    help: `Weź pod uwagę: formę ochrony (park narodowy, rezerwat, Natura 2000), położenie względem brzegu (odcinek akumulacyjny czy abrazyjny), postęp sukcesji boru (nalot sosny i brzozy), plany zalesiania wydm, presję turystyczną.

Działania ochronne, o których warto wspomnieć: usuwanie nalotu i podrostu sosny (także czarnej) i brzozy – np. w pasie 3–6 m na skłonie wydmy (zalecenie 2024 dla Mierzei Sarbskiej), wyłączenie terenów z planowanych zalesień, kanalizacja ruchu turystycznego, zatamowanie odpływu wody rowami odwadniającymi. Sprawozdanie 2024: w parkach i rezerwatach obowiązuje ochrona bierna – rozważ wskazanie potrzeby odstępstwa.

Praktyka 2024: U1 przy zagrożeniu dalszą naturalną sukcesją boru albo abrazją; U2 przy zaniku siedliska i silnej sukcesji.`,
    thresholds: {
      FV: 'Siedlisko znajduje się w obszarze chronionym lub na akumulacyjnym fragmencie wybrzeża',
      U1: 'Możliwe zagrożenie naturalną sukcesją boru lub planami zalesiania wydm',
      U2: 'Procesy eoliczne, nagła abrazja brzegu, realizowany plan zalesiania',
    },
  },

  impactCodes: [
    { code: 'B01', name: 'Zalesianie terenów otwartych' },
    { code: 'B02.02', name: 'Wycinka lasu' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'E01.02', name: 'Nieciągła miejska zabudowa' },
    { code: 'E03.01', name: 'Pozbywanie się odpadów z gospodarstw domowych / obiektów rekreacyjnych' },
    { code: 'E03.04', name: 'Inne odpady' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02.06', name: 'Pobór wód z wód powierzchniowych' },
    { code: 'J02.09', name: 'Działanie słonej wody na wody podziemne' },
    { code: 'J02.12.01', name: 'Prace związane z obroną przed aktywnością morza i ochroną wybrzeży, groble' },
    { code: 'J02.15', name: 'Inne spowodowane przez człowieka zmiany stosunków wodnych' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K01.05', name: 'Salinizacja' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K04.05', name: 'Szkody wyrządzane przez roślinożerców (w tym przez zwierzynę łowną)' },
    { code: 'L07', name: 'Sztorm, cyklon' },
    { code: 'L10', name: 'Inne naturalne katastrofy' },
    { code: 'M01.07', name: 'Zmiana poziomu morza' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. sąsiedztwo 2130, 2180, bór bażynowy; obszar ochrony ścisłej.',
        help: 'Wartości przyrodnicze stanowiska poza samym wrzosowiskiem: sąsiednie siedliska (wydmy szare 2130, lasy mieszane i bory na wydmach nadmorskich 2180), rzadkie porosty i mchy, gatunki chronione. Brak informacji – „Nie stwierdzono” albo „Nie pozyskano danych”.',
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: `Jakie działania ochronne wykonano i jaka jest ich skuteczność, oraz co proponujesz. Typowe dla 2140: usuwanie nalotu i podrostu sosny zwyczajnej i czarnej oraz brzozy (np. w Białogórze – widoczny korzystny wpływ), wyłączenie z zalesień, kanalizacja ruchu turystycznego. Na terenach ochrony ścisłej – „Stanowisko w obszarze ochrony ścisłej”. Brak działań – „Nie prowadzono”.`,
      }
    return f
  }),

  speciesCatalog: SPECIES_2140.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer2140(s) })),
  speciesInfo: (name) => {
    const e = findSpecies2140(name)
    if (!e) return undefined
    const tags = [GROUP_LABELS_2140[e.group], e.combination ? 'kombinacja florystyczna 2140' : '', e.expansive ? 'ekspansywny' : ''].filter(Boolean)
    return tags.join(', ')
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator2140 = (id: string): IndicatorDef => {
  const i = methodology2140.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 2140`)
  return i
}
