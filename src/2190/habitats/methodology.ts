// Metodyka 2190 (wilgotne zagłębienia międzywydmowe) jako dane. Źródło: Izydorek I. 2015, „2190 Wilgotne
// zagłębienia międzywydmowe” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny,
// cz. IV, GIOŚ, s. 87–105 (tab. 1 i 2), z praktyką oceny ze sprawozdań z monitoringu 2013–2014, 2016–2018 i 2023–2025.
// Siedlisko nadmorskie, nieleśne, mozaika 7 podtypów: transekt liniowy 200 m (zdjęcie obejmuje całą szerokość
// zagłębienia), 3 skompleksowane zdjęcia fitosocjologiczne – na początku, w centrum i na końcu transektu.
// Liczba gatunków charakterystycznych dla FV zależy od podtypu, więc podtyp wybiera się w „Stanowisku”.
// Z modułu leśnego brane są tylko klocki generyczne – nic leśnego.
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology } from '../../7120/habitats/types'
import { describeSpecies, gradeByLowerBounds, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, listCover, normalizeName, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_2190,
  SPECIES_2190,
  SUBTYPES_2190,
  SUBTYPE_LABELS_2190,
  defaultLayer2190,
  findSpecies2190,
  isAlien2190,
  isCharacteristic2190,
  isExpansive2190,
  isHighlyInvasive2190,
  isMoss2190,
  isShrub2190,
  isStronglyExpansive2190,
  isTree2190,
  type Subtype2190,
} from './species'

// ---------- podtyp ----------

export const subtypeOf2190 = (site?: InputValues): Subtype2190 | undefined => {
  const v = String(site?.subtype ?? '')
  return (SUBTYPES_2190 as readonly string[]).includes(v) ? (v as Subtype2190) : undefined
}
const subtypeName = (s: Subtype2190) => SUBTYPE_LABELS_2190[s]

// ---------- progi liczbowe (tab. 2) ----------

/**
 * Gatunki charakterystyczne – minimalna liczba dla FV wg podtypu (tab. 2). U1 od 3, U2 przy 2 lub mniej.
 * Podtyp 2: FV „4 i 5”, U1 „3 i 4” – 4 jest w obu klasach; liczona do U1 (jak w podtypach 3–5, gdzie FV to 5).
 */
export const SPECIES_FV_MIN_2190: Record<Subtype2190, number> = { '1': 5, '2': 5, '3': 5, '4': 5, '5': 5, '6': 4, '7': 4 }

export function gradeCharacteristic2190(count: number, subtype: Subtype2190): Grade {
  if (count >= SPECIES_FV_MIN_2190[subtype]) return 'FV'
  return count >= 3 ? 'U1' : 'U2'
}

/** Nalot i podrost drzew: <5% FV, 5–10% U1, >10% U2. */
export const gradeTrees2190 = (p: number): Grade => (p < 5 ? 'FV' : p <= 10 ? 'U1' : 'U2')

/** Krzewy i krzewinki: >10% FV, 5–10% U1, <5% U2 (krzewinki są tu pożądane – tab. 1). */
export const gradeShrubs2190 = (p: number): Grade => (p > 10 ? 'FV' : p >= 5 ? 'U1' : 'U2')

/** Dobrze zachowane płaty: ≥80% FV, 50–79% U1, <50% U2. */
export const gradePatches2190 = (p: number): Grade => gradeByLowerBounds(p, 80, 50)!

/**
 * Gatunki ekspansywne: łącznie >50% U2; brak silnie ekspansywnych i łącznie <20% FV; reszta U1.
 * Silnie ekspansywny powyżej 10% przy sumie ≤50% to luka w tab. 2 – liczony do U1 (praktyka 2024: trzęślica 30–60% → U1).
 */
export function gradeExpansive2190(total: number | undefined, strongCount: number): Grade | null {
  if (total !== undefined && total > 50) return 'U2'
  if (strongCount > 0) return 'U1'
  if (total === undefined) return null
  return total < 20 ? 'FV' : 'U1'
}

const pct = (v: number) => `${plNum(v)}%`
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const uniq = (names: string[]) => [...new Map(names.map((n) => [normalizeName(n), n])).values()]

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'smallDecrease', label: 'Niewielki spadek powierzchni siedliska', grade: 'U1' },
  { value: 'clearDecrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi w literaturze', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const ALIEN_AMOUNT: GradedOption[] = [
  { value: 'none', label: 'Brak gatunków obcych', grade: 'FV' },
  { value: 'single', label: 'Pojedyncze osobniki', grade: 'FV' },
  { value: 'more', label: 'Więcej niż pojedyncze osobniki (podaj pokrycie)', grade: 'U1' },
]
const TREES: GradedOption[] = [
  { value: 'low', label: 'Łączne pokrycie na transekcie <5%', grade: 'FV' },
  { value: 'mid', label: 'Łączne pokrycie na transekcie 5–10%', grade: 'U1' },
  { value: 'high', label: 'Łączne pokrycie na transekcie >10%', grade: 'U2' },
]
const SHRUBS: GradedOption[] = [
  { value: 'high', label: 'Łączne pokrycie na transekcie >10%', grade: 'FV' },
  { value: 'mid', label: 'Łączne pokrycie na transekcie 5–10%', grade: 'U1' },
  { value: 'low', label: 'Łączne pokrycie na transekcie <5%', grade: 'U2' },
]
const PATCHES: GradedOption[] = [
  { value: 'good', label: 'Płaty dobrze zachowane stanowią nie mniej niż 80% powierzchni transektu', grade: 'FV' },
  { value: 'mid', label: 'Płaty dobrze zachowane stanowią 50–79% powierzchni transektu lub generalnie płaty na transekcie mało typowe, średnio bogate w gatunki', grade: 'U1' },
  { value: 'poor', label: 'Płaty dobrze zachowane stanowią mniej niż 50% powierzchni transektu lub generalnie płaty na transekcie źle zachowane, ubogie w gatunki', grade: 'U2' },
]
const VERTICAL: GradedOption[] = [
  { value: 'proper', label: 'Właściwa', grade: 'FV' },
  { value: 'disturbed', label: 'Zakłócona', grade: 'U1' },
  { value: 'bad', label: 'Zła', grade: 'U2' },
]
const EOLIAN: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'slight', label: 'Niewielkie', grade: 'U1' },
  { value: 'intense', label: 'Intensywne', grade: 'U2' },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

/** Select niewymagany – gdy wpiszesz liczbę, wystarczy liczba. */
const optionalSelect = (label: string, options: GradedOption[], help?: string, name = 'choice'): FieldDef => ({ ...selectInput(label, options, help, name), required: false })

const noteInput = (placeholder: string, help: string, label = 'Opis (opcjonalnie)'): FieldDef => ({ kind: 'textarea', name: 'note', label, rows: 2, placeholder, help })
const NOTE_HELP = 'Krótki opis, który trafi do „wartości” w karcie zamiast tekstu zbudowanego z pomiarów – np. wartość i opis wskaźnika jak w karcie papierowej.'

const noteOf = (i: InputValues) => String(i.note ?? '').trim()

/** Wartość liczbowa z pola albo suma pokrycia z listy; `from` mówi, skąd. */
function coverOf(i: InputValues, field = 'value'): { value?: number; from: 'field' | 'list' | null } {
  const v = num(i[field])
  if (v !== undefined) return { value: v, from: 'field' }
  const { count, total } = listCover(i)
  if (count && total !== undefined) return { value: total, from: 'list' }
  return { from: null }
}

/** Opis „Betula pubescens 3%, Pinus sylvestris 1%; łącznie 4%”. */
function describeCover(i: InputValues, options: GradedOption[]): string {
  const note = noteOf(i)
  if (note) return note
  const list = describeSpecies(speciesRows(i.species))
  const { value, from } = coverOf(i)
  const total = value !== undefined ? `łącznie ${pct(value)}` : ''
  if (list) return [list, from === 'field' || speciesRows(i.species).length > 1 ? total : ''].filter(Boolean).join('; ')
  return total || labelOf(options, i.choice)
}

const SUBTYPE_MISSING = 'Wybierz podtyp siedliska w zakładce „Stanowisko” – od niego zależy próg liczby gatunków.'

// ---------- gatunki charakterystyczne ----------

function characteristicCount(i: InputValues, ctx?: IndicatorContext): { count?: number; subtype?: Subtype2190; names: string[]; from: 'field' | 'list' | null } {
  const subtype = subtypeOf2190(ctx?.site)
  const names = uniq(rowNames(i.species)).filter((n) => isCharacteristic2190(n, subtype))
  // płonnik i jego odmiana, sit członowaty i jego podgatunek, synonimy – liczone raz (po nazwie polskiej)
  const distinct = new Set(names.map((n) => (findSpecies2190(n)!.polish ?? n).split(' (')[0]))
  const manual = num(i.count)
  if (manual !== undefined) return { count: manual, subtype, names, from: 'field' }
  if (rowNames(i.species).length) return { count: distinct.size, subtype, names, from: 'list' }
  return { subtype, names, from: null }
}

// ---------- gatunki dominujące ----------

function dominantsGrade(i: InputValues, ctx?: IndicatorContext): { grade: Grade; why: string } | null {
  const subtype = subtypeOf2190(ctx?.site)
  const rows = speciesRows(i.species).filter((r) => r.name?.trim())
  if (!rows.length) return null
  const bad = rows.filter((r) => isExpansive2190(r.name, subtype) || isAlien2190(r.name) || isTree2190(r.name)).map((r) => r.name.trim())
  if (bad.length) return { grade: 'U2', why: `Wśród dominantów gatunki ekspansywne lub obce dla siedliska: ${bad.join(', ')}.` }
  const strong = rows.filter((r) => !isMoss2190(r.name) && (num(r.cover) ?? 0) > 50).map((r) => `${r.name.trim()} ${pct(num(r.cover)!)}`)
  if (strong.length) return { grade: 'U1', why: `Silna dominacja (>50%) w warstwach roślin naczyniowych: ${strong.join(', ')}.` }
  const notTypical = rows.filter((r) => findSpecies2190(r.name) && !isCharacteristic2190(r.name)).map((r) => r.name.trim())
  if (notTypical.length) return { grade: 'U1', why: `Status dominanta mają gatunki spoza listy charakterystycznych: ${notTypical.join(', ')}.` }
  return { grade: 'FV', why: 'Dominują gatunki charakterystyczne dla siedliska, bez silnej dominacji (>50%) w warstwach roślin naczyniowych.' }
}

// ---------- gatunki ekspansywne ----------

function expansiveInfo(i: InputValues, ctx?: IndicatorContext) {
  const subtype = subtypeOf2190(ctx?.site)
  const names = uniq(rowNames(i.species))
  const strong = names.filter((n) => isStronglyExpansive2190(n, subtype))
  const manual = num(i.value)
  const { count, total } = listCover(i)
  const sum = manual ?? (count ? total : undefined)
  return { names, strong, total: sum, empty: manual === undefined && !count }
}

// ---------- obce gatunki inwazyjne ----------

function aliensGrade(i: InputValues): Grade | null {
  const names = uniq(rowNames(i.species))
  const high = names.some(isHighlyInvasive2190)
  const manual = num(i.value)
  if (i.amount === 'none' || (!names.length && manual === 0)) return 'FV'
  if (i.amount === 'single') return high ? 'U1' : 'FV'
  if (i.amount === 'more' || (manual !== undefined && manual > 0)) {
    if (high) return 'U2'
    const cover = manual ?? listCover(i).total
    if (cover === undefined) return 'U1'
    return cover > 5 ? 'U2' : 'U1'
  }
  return null
}

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description: 'Zmiana powierzchni siedliska na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury.',
    help: `Co wybrać: jak zmieniła się powierzchnia zagłębienia (płatów siedliska) od poprzedniej obserwacji albo względem danych z literatury i planów ochrony. Powierzchnię w hektarach możesz wpisać obok – trafi do pola „wartość”.

Co ją zmniejsza: zarastanie przez sosnę, brzozę i olszę (płat staje się borem lub brzeziną bagienną – to już nie 2190), zasypanie przez wędrującą wydmę, osuszenie rowami. Przy pierwszym badaniu wybierz „Brak danych do porównania” albo oceń ekspercko.

Praktyka: sprawozdanie 2013–2014 obniżało ocenę za fragmentację przez sukcesję drzew; 2024 – U1 tylko w Czołpinie (wkraczanie olszyny). Stanowiska mają zwykle 0,5–1,5 ha (od 0,2 do 8 ha).`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się',
      U1: 'Niewielki spadek powierzchni siedliska',
      U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi w literaturze',
    },
    inputs: [
      optionalSelect('Zmiana powierzchni', AREA, 'Puste, gdy oceniasz ekspercko.'),
      { kind: 'number', name: 'areaHa', label: 'Powierzchnia (opcjonalnie)', unit: 'ha', min: 0, help: 'Powierzchnia siedliska na stanowisku, jeśli ją znasz – trafi do pola „wartość”. Zwykle od kilku dziesiątych do kilku hektarów.' },
      noteInput('np. Duża (1,45 ha), nie ulega zmniejszeniu', NOTE_HELP),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => {
      const note = noteOf(i)
      if (note) return note
      const ha = num(i.areaHa)
      return [ha !== undefined ? `${plNum(ha)} ha` : '', i.choice ? labelOf(AREA, i.choice).toLowerCase() : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'species',
    label: 'Gatunki charakterystyczne i wyróżniające',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków na transekcie lub w płacie siedliska i ich udział procentowy w warstwach roślinności (b, c, d). Gatunki charakterystyczne i wyróżniające są podane osobno dla każdego z 7 podtypów siedliska.',
    help: `Co wpisać: gatunki charakterystyczne i wyróżniające stwierdzone na transekcie, z przybliżonym pokryciem (%). Formularz liczy te, które pasują do podtypu wybranego w „Stanowisku”. Jeśli liczysz sam (np. „i inne” w karcie), wpisz liczbę – ma pierwszeństwo przed listą.

Progi (tab. 2) – liczba gatunków dla FV / U1: podtyp 1 (pionierskie stadia) więcej niż 4 / więcej niż 2; podtyp 2 (mszary) 5 / 3; podtyp 3 (kwaśna młaka) 5 / 3–4; podtyp 4 (wrzosowiska bażynowe) 5 / 3; podtyp 5 (łozowiska) 5 / 3–4; podtyp 6 (woskownica) 4 / 3; podtyp 7 (drobne byliny ziemnowodne) 4 / 3. U2 – 2 lub mniej. Luki w tabeli (np. 4 gatunki w podtypie 4) liczone są do U1.

Gatunki wg tab. 1 – m.in.: 1: Agrostis stolonifera, Juncus articulatus subsp. litoralis, J. balticus, J. bulbosus, Arenaria serpyllifolia, Centaurium littorale, Polytrichum commune var. perigoniale, Pohlia nutans; 2: Erica tetralix, Vaccinium oxycoccos, Salix repens subsp. arenaria, Lycopodiella inundata, Drosera anglica, D. intermedia, Rhynchospora fusca, torfowce; 3: Agrostis canina, Carex curta, C. echinata, C. nigra, Juncus filiformis, Eriophorum angustifolium; 4: Empetrum nigrum, Vaccinium uliginosum, Calluna vulgaris, Carex arenaria, Drosera rotundifolia; 5: Salix aurita, Carex lasiocarpa, Calamagrostis canescens, Peucedanum palustre; 6: Myrica gale, Molinia caerulea; 7: Eleocharis multicaulis, Ranunculus flammula, Hydrocotyle vulgaris, Littorella uniflora, Potamogeton polygonifolius.

Wskaźnik kardynalny. Dlaczego: zagłębienia to mozaika rzadkich zbiorowisk pionierskich i torfowiskowych – komplet gatunków podtypu świadczy, że to wciąż otwarte, wilgotne siedlisko, a nie bór bagienny. Praktyka 2024: FV na 19 z 21 stanowisk.`,
    thresholds: {
      FV: 'Podtyp 1 – więcej niż 4; 2 – 4 i 5; 3 – 5; 4 – 5; 5 – 5; 6 – 4; 7 – 4',
      U1: 'Podtyp 1 – więcej niż 2; 2 – 3 i 4; 3 – 3 do 4; 4 – 3; 5 – 3–4; 6 – 3; 7 – 3',
      U2: 'Liczba gatunków dla każdego podtypu siedliska – 2 lub mniej',
    },
    inputs: [
      speciesInput(
        'Gatunki charakterystyczne na transekcie',
        'Gatunki charakterystyczne i wyróżniające z przybliżonym pokryciem w %, np. Juncus articulatus 40, Agrostis stolonifera 15. Liczą się te z listy dla podtypu wybranego w „Stanowisku”.',
      ),
      { kind: 'number', name: 'count', label: 'Liczba gatunków (gdy liczysz sam)', min: 0, help: 'Liczba gatunków charakterystycznych dla podtypu stwierdzonych na transekcie – gdy lista jest niepełna („i inne”). Ma pierwszeństwo przed listą.' },
      noteInput('np. Liczne gatunki właściwe dla siedliska', NOTE_HELP),
    ],
    suggest: (i, ctx) => {
      const { count, subtype } = characteristicCount(i, ctx)
      if (count === undefined || !subtype) return null
      return gradeCharacteristic2190(count, subtype)
    },
    explain: (i, ctx) => {
      const { count, subtype, names, from } = characteristicCount(i, ctx)
      if (from === null) return null
      if (!subtype) return SUBTYPE_MISSING
      const fv = SPECIES_FV_MIN_2190[subtype]
      if (from === 'field') return `${subtypeName(subtype)}: ${count} gatunków (FV od ${fv}, U1 od 3).`
      return `${subtypeName(subtype)}: gatunków charakterystycznych na liście ${count} z wymaganych ${fv} dla FV${names.length ? ` (${names.join(', ')})` : ''}.`
    },
    warn: (i, ctx) => {
      const subtype = subtypeOf2190(ctx?.site)
      const names = uniq(rowNames(i.species))
      const other = names.filter((n) => !isCharacteristic2190(n, subtype))
      if (!other.length) return null
      const ofOther = other.filter((n) => isCharacteristic2190(n))
      return `Nie liczą się dla ${subtype ? `podtypu ${subtype}` : 'żadnego podtypu'}: ${other.join(', ')}${ofOther.length ? ` (charakterystyczne dla innego podtypu: ${ofOther.join(', ')} – sprawdź wybór podtypu)` : ''}.`
    },
    describe: (i) => noteOf(i) || describeSpecies(speciesRows(i.species)),
  },
  {
    id: 'dominants',
    label: 'Gatunki dominujące',
    parameter: 'structure',
    description:
      'Lista (kilku) gatunków dominujących lub najliczniejszych wraz z procentem pokrycia transektu lub płatu przez dany gatunek w poszczególnych warstwach roślinności (b, c, d). Wskaźnik informuje o właściwej lub nie strukturze jakościowo-ilościowej flory siedliska. Monotypowość florystyczna nie jest dla niego zjawiskiem właściwym.',
    help: `Co wpisać: 2–4 gatunki o największym pokryciu, z pokryciem w %. Mchy (warstwa D) też wpisz – ale „silną dominację” (>50%) formularz liczy tylko w warstwach roślin naczyniowych (b, c).

Progi (tab. 2): brak gatunków panujących lub status dominanta osiągają gatunki charakterystyczne dla siedliska – FV; silna dominacja (>50%) któregoś z gatunków typowych dla siedliska – U1; wśród dominantów obecne gatunki ekspansywne lub ekologicznie obce dla siedliska – U2.

Ekspansywne: trzęślica modra (poza podtypem 6, gdzie jest charakterystyczna), sit rozpierzchły, trzcina, ponikło błotne, wierzba iwa, wierzba szara. Ekologicznie obce: drzewa (sosna, brzozy, olsza – siedlisko jest nieleśne) i gatunki obce geograficznie.

Dlaczego: monotypowe płaty to zubożałe siedlisko. Przykład z przewodnika (Madwiny 1): płonnik 75% w warstwie D i sit członowaty 40% – ocena FV, więc pokrywa mszysta nie jest „silną dominacją”. Praktyka 2024: U1 przy współdominacji trzęślicy, U2 w Krynicy Morskiej (dominuje bór bagienny).`,
    thresholds: {
      FV: 'Brak gatunków panujących lub status dominanta osiągają gatunki charakterystyczne dla siedliska',
      U1: 'Silna dominacja (>50%) któregoś z gatunków typowych dla siedliska',
      U2: 'Wśród dominantów obecne gatunki ekspansywne lub ekologicznie obce dla siedliska',
    },
    inputs: [
      speciesInput('Gatunki dominujące', 'Gatunki dominujące z pokryciem transektu w %, np. Juncus articulatus 40, Erica tetralix 25, Polytrichum commune var. perigoniale 75.', true),
      noteInput('np. Utrzymuje się dominacja situ członowatego', NOTE_HELP),
    ],
    suggest: (i, ctx) => dominantsGrade(i, ctx)?.grade ?? null,
    explain: (i, ctx) => dominantsGrade(i, ctx)?.why ?? null,
    warn: (i) => {
      const unknown = uniq(rowNames(i.species)).filter((n) => !findSpecies2190(n))
      return unknown.length ? `Spoza katalogu 2190: ${unknown.join(', ')} – formularz ich nie ocenia, sprawdź sam.` : null
    },
    describe: (i) => noteOf(i) || describeSpecies(speciesRows(i.species)),
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    description:
      'Lista gatunków obcych geograficznie i ekologicznie dla siedliska wraz z określeniem szacunkowego procentu pokrycia transektu przez gatunek. Bierze się pod uwagę jego biologiczną predyspozycję do szybkiego rozprzestrzeniania oraz obfitość występowania.',
    help: `Co wpisać: gatunki obce stwierdzone na transekcie i jak występują – pojedyncze osobniki czy więcej (wtedy pokrycie w %).

Progi (tab. 2): brak lub pojedyncze osobniki gatunków o niskim stopniu inwazyjności – FV; gatunki o niskim stopniu inwazyjności w pokryciu <5% transektu lub pojedyncze osobniki gatunków wysoce inwazyjnych – U1; obecne gatunki silnie inwazyjne lub >5% transektu zajęte przez gatunki o niskim stopniu inwazyjności – U2.

Notowane na stanowiskach 2190 (sprawozdania): sit chudy Juncus tenuis, olsza pomarszczona Alnus rugosa, sosna wejmutka Pinus strobus, świerk poza zasięgiem Picea abies – o niskim stopniu inwazyjności. Silnie inwazyjne w katalogu: czeremcha amerykańska, róża pomarszczona, świdośliwa kłosowa, dąb czerwony. Gatunek spoza katalogu formularz traktuje jak gatunek o niskim stopniu inwazyjności.

Dlaczego: siedlisko leży w parku narodowym i rezerwatach, więc obcych jest mało – ale pojawienie się gatunku inwazyjnego na tak małych płatach to sygnał do natychmiastowego usunięcia. Praktyka 2013 i 2024: pojedyncze osobniki situ chudego, wejmutki i świerka dostawały U1 – surowiej niż tab. 2.`,
    thresholds: {
      FV: 'Brak lub pojedyncze osobniki gatunków o niskim stopniu inwazyjności, tj. nie zagrażające różnorodności biologicznej',
      U1: 'Gatunki o niskim stopniu inwazyjności w pokryciu <5% transektu lub pojedyncze osobniki gatunków wysoce inwazyjnych',
      U2: 'Obecne gatunki silnie inwazyjne lub >5% transektu zajęte przez gatunki o niskim stopniu inwazyjności',
    },
    inputs: [
      speciesInput('Gatunki obce na transekcie', 'Gatunki obce geograficznie i ekologicznie z pokryciem transektu w %. Brak – zostaw pustą listę i wybierz „Brak gatunków obcych”.'),
      { ...selectInput('Jak występują', ALIEN_AMOUNT, undefined, 'amount'), required: false, help: 'Pojedyncze osobniki gatunków o niskim stopniu inwazyjności to jeszcze FV; większe pokrycie – U1, a powyżej 5% transektu – U2. Gatunek silnie inwazyjny: pojedynczo U1, więcej U2.' },
      { kind: 'number', name: 'value', label: 'Łączne pokrycie gatunków obcych', unit: '%', min: 0, max: 100, help: 'Łączne pokrycie transektu przez gatunki obce, w %. 0 = brak. Bez tej liczby formularz zsumuje pokrycie z listy.' },
      noteInput('np. Brak', NOTE_HELP),
    ],
    suggest: (i) => aliensGrade(i),
    explain: (i) => {
      const names = uniq(rowNames(i.species))
      const high = names.filter(isHighlyInvasive2190)
      const unknown = names.filter((n) => !findSpecies2190(n))
      return [high.length ? `Silnie inwazyjne: ${high.join(', ')}.` : '', unknown.length ? `Spoza katalogu (liczone jak o niskim stopniu inwazyjności): ${unknown.join(', ')}.` : ''].filter(Boolean).join(' ') || null
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (i.amount === 'none' && names.length) return 'Wybrano „Brak gatunków obcych”, a lista nie jest pusta.'
      const native = names.filter((n) => findSpecies2190(n) && !isAlien2190(n))
      return native.length ? `Na liście gatunków obcych są gatunki rodzime: ${native.join(', ')}.` : null
    },
    describe: (i) => {
      const note = noteOf(i)
      if (note) return note
      const list = describeSpecies(speciesRows(i.species))
      if (!list && (i.amount === 'none' || num(i.value) === 0)) return 'Brak'
      return [list, i.amount === 'single' ? 'pojedyncze osobniki' : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'expansive',
    label: 'Gatunki ekspansywne',
    parameter: 'structure',
    description:
      'Lista gatunków roślin intensywnie rozprzestrzeniających się, również tych o wymaganiach ekologicznych zgodnych z siedliskiem, które mogą stanowić zagrożenie dla jego właściwego składu jakościowo-ilościowego wraz z szacunkowym procentem pokrycia transektu przez dany gatunek.',
    help: `Co wpisać: gatunki ekspansywne na transekcie z pokryciem w %, albo samo łączne pokrycie. Pusta lista i 0 – brak.

Progi (tab. 2): brak gatunków silnie ekspansywnych i łączne pokrycie gatunków ekspansywnych <20% – FV; pokrycie żadnego z gatunków silnie ekspansywnych nie przekracza 10% i łączne pokrycie <50% – U1; łączne pokrycie >50% – U2.

Silnie ekspansywne (tab. 1, s. 93): trzęślica modra Molinia caerulea i sit rozpierzchły Juncus effusus (w postaciach mszarnych), ponikło błotne Eleocharis palustris (w postaciach pionierskich), trzcina pospolita Phragmites australis. Trzęślica w podtypie 6 (zarośla woskownicy) jest gatunkiem charakterystycznym – tam się nie liczy. Inne ekspansywne ze sprawozdań: trzcinnik lancetowaty, wierzba iwa, wierzba szara.

Luka w tab. 2: gatunek silnie ekspansywny powyżej 10% przy łącznym pokryciu ≤50% – formularz daje U1, jak w praktyce 2024 (trzęślica 30–60%, sit rozpierzchły do 30% – U1).

Dlaczego: trzęślica, sit rozpierzchły i trzcina wypierają drobne gatunki pionierskie i torfowiskowe – to pierwszy znak przesuszenia i wzrostu trofii zagłębienia.`,
    thresholds: {
      FV: 'Brak gatunków silnie ekspansywnych i łączne pokrycie gatunków ekspansywnych <20%',
      U1: 'Pokrycie żadnego z gatunków silnie ekspansywnych nie przekracza 10% i łączne pokrycie gatunków ekspansywnych <50%',
      U2: 'Łączne pokrycie gatunków ekspansywnych >50%',
    },
    inputs: [
      speciesInput('Gatunki ekspansywne', 'Gatunki ekspansywne z pokryciem transektu w %, np. Molinia caerulea 15, Phragmites australis 3.'),
      { kind: 'number', name: 'value', label: 'Łączne pokrycie (gdy bez listy pokryć)', unit: '%', min: 0, max: 100, help: 'Łączne pokrycie transektu przez gatunki ekspansywne, w %. 0 = brak. Ma pierwszeństwo przed sumą z listy.' },
      noteInput('np. Udział ilościowy tych gatunków nie jest wysoki', NOTE_HELP),
    ],
    suggest: (i, ctx) => {
      const { strong, total, empty } = expansiveInfo(i, ctx)
      if (empty) return null
      return gradeExpansive2190(total, strong.length)
    },
    explain: (i, ctx) => {
      const { strong, total, empty, names } = expansiveInfo(i, ctx)
      if (empty) return null
      const parts = [strong.length ? `Silnie ekspansywne: ${strong.join(', ')}.` : names.length ? 'Brak gatunków silnie ekspansywnych.' : '']
      parts.push(total !== undefined ? `Łączne pokrycie: ${pct(total)}.` : 'Bez pokrycia nie da się sprawdzić progu 20%.')
      return parts.filter(Boolean).join(' ')
    },
    warn: (i, ctx) => {
      const subtype = subtypeOf2190(ctx?.site)
      const ch = uniq(rowNames(i.species)).filter((n) => subtype && isCharacteristic2190(n, subtype))
      return ch.length ? `Charakterystyczne dla podtypu ${subtype}: ${ch.join(', ')} – w tym podtypie to nie gatunek ekspansywny.` : null
    },
    describe: (i) => {
      const note = noteOf(i)
      if (note) return note
      const list = describeSpecies(speciesRows(i.species))
      const v = num(i.value)
      if (!list && v === 0) return 'Brak'
      return [list, v !== undefined ? `łącznie ${pct(v)}` : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'trees',
    label: 'Obecność nalotu i podrostu drzew',
    parameter: 'structure',
    description:
      'Wskaźnik opisywany jest przez sumaryczne pokrycie drzew na transekcie. Podawana jest także lista zaobserwowanych gatunków oraz procent ich pokrycia w warstwach roślinności (b, c, d). Obecność drzew w zbiorowiskach nieleśnych jest zjawiskiem negatywnym i przejawem starzenia się ich fitocenoz.',
    help: `Co wpisać: drzewa (nalot, podrost) na transekcie z pokryciem w % i/lub łączne pokrycie. Liczba ma pierwszeństwo, bez niej formularz zsumuje listę.

Progi (tab. 2): łączne pokrycie na transekcie <5% – FV; 5–10% – U1; >10% – U2.

Typowe: sosna zwyczajna, brzoza omszona i brodawkowata, olsza czarna (Czołpino). Gatunki obce (wejmutka, świerk) wpisz w „Obce gatunki inwazyjne”.

Dlaczego: sukcesja drzew to główne zagrożenie 2190 – zagłębienia w zalesionych częściach mierzei przechodzą w bory i brzeziny bagienne. Praktyka 2024: najgorzej oceniany wskaźnik (U2 na 5 z 21 stanowisk, pokrycie 20–100%).`,
    thresholds: thresholdsOf(TREES),
    inputs: [
      speciesInput('Drzewa na transekcie', 'Gatunki drzew (nalot, podrost) z pokryciem transektu w %, np. Betula pubescens 3, Pinus sylvestris 1.'),
      { kind: 'number', name: 'value', label: 'Łączne pokrycie drzew', unit: '%', min: 0, max: 100, help: 'Sumaryczne pokrycie transektu przez drzewa (nalot, podrost), w %. 0 = brak. Ma pierwszeństwo przed sumą z listy.' },
      optionalSelect('Klasa (gdy bez pomiaru)', TREES, 'Wybierz, gdy nie szacujesz procentu (np. „<5%” w karcie).'),
      noteInput('np. Betula pubescens c – <5%. Udział tego gatunku jest niewielki', NOTE_HELP),
    ],
    suggest: (i) => {
      const { value } = coverOf(i)
      return value !== undefined ? gradeTrees2190(value) : byOption(gradeMap(TREES))(i)
    },
    warn: (i) => {
      const { value } = coverOf(i)
      if (value !== undefined && i.choice && gradeMap(TREES)[String(i.choice)] !== gradeTrees2190(value)) return `${pct(value)} nie pasuje do wybranej klasy.`
      const notTrees = rowNames(i.species).filter((n) => findSpecies2190(n) && !isTree2190(n))
      return notTrees.length ? `Na liście drzew są inne gatunki: ${notTrees.join(', ')}.` : null
    },
    describe: (i) => describeCover(i, TREES),
  },
  {
    id: 'shrubs',
    label: 'Obecność krzewów i krzewinek',
    parameter: 'structure',
    cardinal: true,
    description:
      'Wskaźnik opisywany jest przez sumaryczne pokrycie krzewów i krzewinek na transekcie. Podawana jest także lista zaobserwowanych gatunków oraz procent ich pokrycia. Wskazuje stopień stabilizacji siedliska i końcowe fazy rozwoju sukcesyjnego płatów roślinności.',
    help: `Co wpisać: krzewy i krzewinki na transekcie z pokryciem w % i/lub łączne pokrycie. Liczba ma pierwszeństwo, bez niej formularz zsumuje listę.

Progi (tab. 2): łączne pokrycie na transekcie >10% – FV; 5–10% – U1; <5% – U2. Uwaga, kierunek jest odwrotny niż przy drzewach: krzewinki (wrzosiec, bażyna, borówka bagienna, żurawina, wrzos) i krzewy wyróżniające (woskownica, wierzba uszata, wierzba piaskowa) są tu pożądane – sprawozdanie 2013–2014: „obecność nano- i mikrofanerofitów jest wskaźnikiem właściwym i pożądanym w większości typów zagłębień”.

Wyjątek: w podtypie 7 (pionierskie zbiorowiska drobnych bylin ziemnowodnych) liczna obecność krzewinek nie jest właściwa (tab. 1) – formularz nie podpowiada wtedy oceny, oceń ekspercko.

Wskaźnik kardynalny. Praktyka 2024: FV przy 15–75% (zwykle 40–60%), U1 przy 3–11% – progi stosowano z tolerancją; formularz trzyma się tab. 2.`,
    thresholds: thresholdsOf(SHRUBS),
    inputs: [
      speciesInput('Krzewy i krzewinki na transekcie', 'Krzewy i krzewinki z pokryciem transektu w %, np. Erica tetralix 25, Salix arenaria 15, Empetrum nigrum 3.'),
      { kind: 'number', name: 'value', label: 'Łączne pokrycie krzewów i krzewinek', unit: '%', min: 0, max: 100, help: 'Sumaryczne pokrycie transektu przez krzewy i krzewinki, w %. Ma pierwszeństwo przed sumą z listy.' },
      optionalSelect('Klasa (gdy bez pomiaru)', SHRUBS, 'Wybierz, gdy nie szacujesz procentu.'),
      noteInput('np. Oceniono ten wskaźnik jako właściwy pomimo obecności wierzby iwy', NOTE_HELP),
    ],
    suggest: (i, ctx) => {
      if (subtypeOf2190(ctx?.site) === '7') return null
      const { value } = coverOf(i)
      return value !== undefined ? gradeShrubs2190(value) : byOption(gradeMap(SHRUBS))(i)
    },
    explain: (i, ctx) => {
      if (subtypeOf2190(ctx?.site) === '7') return 'Podtyp 7: krzewinki nie są tu właściwe (tab. 1) – progi tab. 2 nie pasują, oceń ekspercko.'
      const { value, from } = coverOf(i)
      return from === 'list' && value !== undefined ? `Suma pokrycia z listy: ${pct(value)}.` : null
    },
    warn: (i) => {
      const { value } = coverOf(i)
      if (value !== undefined && i.choice && gradeMap(SHRUBS)[String(i.choice)] !== gradeShrubs2190(value)) return `${pct(value)} nie pasuje do wybranej klasy.`
      const notShrubs = rowNames(i.species).filter((n) => findSpecies2190(n) && !isShrub2190(n))
      return notShrubs.length ? `Na liście krzewów są inne gatunki: ${notShrubs.join(', ')}.` : null
    },
    describe: (i) => describeCover(i, SHRUBS),
  },
  {
    id: 'patches',
    label: 'Udział dobrze zachowanych płatów siedliska',
    parameter: 'structure',
    cardinal: true,
    description:
      'Szacowany w skali transektu procentowy udział dobrze wykształconych płatów siedliska w stosunku do nietypowych, zdegenerowanych, z gatunkami ekspansywnymi, itp. Wyodrębniając płaty typowe zwraca się uwagę na udział gatunków charakterystycznych i wyróżniających dla zbiorowisk i zespołów oraz ich syntaksonów nadrzędnych, a także na bogactwo gatunkowe.',
    help: `Co wpisać: jaki procent powierzchni transektu zajmują płaty dobrze wykształcone – z kompletem gatunków charakterystycznych, bez ekspansji trzęślicy, trzciny czy podrostu drzew. Liczba ma pierwszeństwo przed klasą.

Progi (tab. 2): co najmniej 80% – FV; 50–79% lub płaty generalnie mało typowe, średnio bogate w gatunki – U1; poniżej 50% lub płaty generalnie źle zachowane, ubogie w gatunki – U2.

Wskaźnik kardynalny. Uwaga ze sprawozdania 2016–2018: mozaika różnych zbiorowisk typowych dla 2190 na jednym transekcie to normalna toposekwencja – nie obniża oceny (w 2013 r. bywało inaczej). Praktyka 2024: w Madwinach za „dobrze zachowane” uznano płaty w lukach między podrostem sosny.`,
    thresholds: thresholdsOf(PATCHES),
    inputs: [
      { kind: 'number', name: 'value', label: 'Udział dobrze zachowanych płatów', unit: '%', min: 0, max: 100, help: 'Procent powierzchni transektu zajęty przez dobrze zachowane płaty siedliska. Ma pierwszeństwo przed wyborem klasy.' },
      optionalSelect('Klasa (gdy bez szacunku)', PATCHES, 'Wybierz, gdy nie szacujesz procentu.'),
      noteInput('np. Na niewielkiej części powierzchni występują skupiska Phragmites australis', NOTE_HELP),
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v !== undefined ? gradePatches2190(v) : byOption(gradeMap(PATCHES))(i)
    },
    warn: (i) => {
      const v = num(i.value)
      if (v === undefined || !i.choice) return null
      return gradeMap(PATCHES)[String(i.choice)] === gradePatches2190(v) ? null : `${pct(v)} nie pasuje do wybranej klasy.`
    },
    describe: (i) => {
      const note = noteOf(i)
      if (note) return note
      const v = num(i.value)
      return v !== undefined ? pct(v) : labelOf(PATCHES, i.choice)
    },
  },
  {
    id: 'vertical',
    label: 'Pionowa struktura roślinności',
    parameter: 'structure',
    description: 'Wskaźnik informuje o tym czy pionowa struktura roślinności jest odpowiednia dla poszczególnych postaci (podtypów) siedliska. Właściwa / zakłócona / zła.',
    help: `Co ocenić: czy układ warstw pasuje do podtypu. Pokrycie warstw C (zielna i krzewinki) i D (mszysta) możesz wpisać – trafi do „wartości”.

Progi (tab. 2): właściwa – FV; zakłócona – U1; zła – U2.

Jak rozumieć (sprawozdanie 2013–2014): złożona struktura (b, c, d) jest właściwa w zbiorowiskach z trzęślicą, z wierzbą uszatą i w zespołach krzewinkowych; w pionierskich – nie. Obniżają ocenę: warstwa b z drzewami degradującymi siedlisko (podrost brzozy, sosny, olszy), bardzo uboga warstwa mszysta (np. <20% – Rowy 5, 2024), o ile nie wynika z trwałego zalania.`,
    thresholds: thresholdsOf(VERTICAL),
    inputs: [
      selectInput('Pionowa struktura', VERTICAL),
      { kind: 'number', name: 'coverC', label: 'Pokrycie warstwy c (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Pokrycie warstwy zielnej i krzewinek (c) na transekcie, w %. Trafi do „wartości” w karcie.' },
      { kind: 'number', name: 'coverD', label: 'Pokrycie warstwy d (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Pokrycie warstwy mszystej (d) na transekcie, w %. Trafi do „wartości” w karcie. Bardzo niskie (<20%) bywa powodem obniżenia oceny.' },
      noteInput('np. Bujny stan roślinności wskazuje na dojrzałą (terminalną) postać zespołu', NOTE_HELP),
    ],
    suggest: byOption(gradeMap(VERTICAL)),
    describe: (i) => {
      const note = noteOf(i)
      if (note) return note
      const c = num(i.coverC)
      const d = num(i.coverD)
      const covers = [c !== undefined ? `Pokrycie c – ${pct(c)}` : '', d !== undefined ? `Pokrycie d – ${pct(d)}` : ''].filter(Boolean).join(', ')
      return covers || labelOf(VERTICAL, i.choice)
    },
  },
  {
    id: 'eolian',
    label: 'Występowanie procesów eolicznych',
    parameter: 'structure',
    description: 'Określenie stopnia narażenia siedliska na zasypywanie piaskiem ruchomych wydm wg skali: intensywne / niewielkie / brak.',
    help: `Co ocenić: czy zagłębienie jest zasypywane piaskiem z ruchomych wydm i jak mocno. Patrz na nawiewy piasku na roślinności, czoło wydmy w sąsiedztwie, kierunek wiatrów.

Progi (tab. 2): brak – FV; niewielkie – U1; intensywne – U2.

Uwaga: w przykładowej karcie z przewodnika (Madwiny 1) „nieznaczne” zasypywanie, sporadycznie przy bardzo wietrznej pogodzie, oceniono na FV – wbrew tab. 2. Jeśli też tak uważasz, wybierz „Niewielkie”, wystaw FV i uzasadnij w opisie. Praktyka 2018: U1 w Madwinach 1 i 2 (aktywne wydmy w sąsiedztwie); 2024: FV wszędzie.

Dlaczego: wędrujące wydmy Mierzei Łebskiej tworzą nowe zagłębienia, ale i zasypują istniejące. Monitoring zagłębień przed czołem szybko wędrujących wydm jest bezcelowy.`,
    thresholds: thresholdsOf(EOLIAN),
    inputs: [
      selectInput('Zasypywanie piaskiem', EOLIAN),
      noteInput('np. Zasypywanie piaskiem ma miejsce z małym natężeniem, sporadycznie', NOTE_HELP),
    ],
    suggest: byOption(gradeMap(EOLIAN)),
    describe: (i) => noteOf(i) || labelOf(EOLIAN, i.choice),
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu (albo zdjęcia w małym zagłębieniu), z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie.

Dlaczego: miejsca i kształt zdjęć zaznacza się też na podkładzie mapowym – ułatwia to powtórzenie badań w następnych latach.`

const SUBTYPE_OPTIONS = SUBTYPES_2190.map((s) => ({ value: s, label: SUBTYPE_LABELS_2190[s] }))

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Madwiny 1',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Madwiny 1”, „Czołpino”, „Ulinia 2”, „Białogóra 3”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego zagłębienia.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'select',
    name: 'subtype',
    label: 'Podtyp siedliska',
    options: SUBTYPE_OPTIONS,
    required: true,
    hint: 'Od podtypu zależy, ile gatunków charakterystycznych daje FV.',
    help: `Wybierz podtyp dominujący na transekcie (przewodnik, rozdz. „Opis siedliska”):
• 2190-1 pionierskie stadia kolonizacji piasków (mietlica rozłogowa, sit członowaty nadmorski, sit bałtycki);
• 2190-2 mszary i torfowiska – mszarniki wrzosowcowe (wrzosiec, rosiczki, widłaczek, przygiełka brunatna);
• 2190-3 kwaśna młaka turzycowa (Carici canescentis-Agrostietum caninae);
• 2190-4 wilgotne wrzosowiska bażynowe (bażyna, borówka bagienna, wrzos);
• 2190-5 łozowiska z wierzbą uszatą;
• 2190-6 zarośla woskownicy europejskiej;
• 2190-7 pionierskie zbiorowiska drobnych bylin ziemnowodnych na wilgotnych piaskach (ponikło wielołodygowe, brzeżyca, rdestnica podługowata).

Dlaczego: tab. 2 podaje progi liczby gatunków charakterystycznych osobno dla podtypów, a w podtypie 7 krzewinki nie są pożądane. Gdy transekt to mozaika podtypów (typowa toposekwencja), wybierz przeważający i opisz resztę w opisie siedliska.`,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Zbiorowisko z Agrostis stolonifera i Juncus articulatus subsp. litoralis',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Dla 2190 m.in.: zbiorowisko z Agrostis stolonifera i Juncus articulatus subsp. litoralis (= Juncetum littoralis), Ranunculo-Juncetum bulbosi, Eleocharitetum multicaulis, Rhynchosporetum fuscae, zbiorowisko Juncus effusus–Sphagnum denticulatum, Carici canescentis-Agrostietum caninae, zbiorowisko z Juncus filiformis, Ericetum tetralicis (= Salici repentis-Ericetum), Vaccinio uliginosi-Empetretum nigri, zbiorowisko z Myrica gale (Myricetum gale), zbiorowisko z Salix aurita.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Położenie zagłębienia i sąsiedztwo, uwodnienie, podłoże (torf, pH), wielkość, zagrożenia.',
    help: `Krótka charakterystyka przyrodnicza stanowiska (przewodnik: położenie, także względem sąsiadującej roślinności, wielkość powierzchni, aktualne i przewidywane zagrożenia):
• typ zagłębienia: pole, misa, rów (rynna) deflacyjny, nieckowate obniżenie; czym graniczy (wał wydmowy, wydma ruchoma, las);
• uwodnienie: czy po opadach gromadzi się woda, jak długo stoi, gradient wilgotności;
• podłoże: piasek, warstwa butwiny, torf (miąższość), pH (zwykle 4,0–5,5);
• zarastanie drzewami, ekspansja trzęślicy, trzciny, rowy odwadniające.

Za stanowisko uznaje się powierzchnię trzech zdjęć wzdłuż transektu 200 m; zagłębienia mniejsze niż 0,5 ha opisuje się trzema zdjęciami w trzech sąsiednich zagłębieniach o podobnej roślinności.`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Łączna powierzchnia płatów siedliska na stanowisku, w hektarach. Stanowiska PMŚ mają od 0,2 do 8 ha, najczęściej 0,5–1,5 ha (1,45 ha w karcie z przewodnika).',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „Słowiński Park Narodowy; obszar ochrony ścisłej”. Wszystkie znane stanowiska leżą w obszarach chronionych.',
  }),
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    defaultValue: '10x200 m',
    required: true,
    hint: 'Liniowy transekt 200 m; zdjęcia obejmują całą szerokość zagłębienia.',
    help: `Za stanowisko uznaje się powierzchnię trzech zdjęć fitosocjologicznych wzdłuż liniowego transektu 200 m – na początku, w centrum i na końcu. W zagłębieniach rynnowych zdjęcie obejmuje całą szerokość zagłębienia, aż do granicy maksymalnego zalewu (albo zwartego drzewostanu).

Rów deflacyjny krótszy niż 200 m, ale dłuższy niż 40 m – trzy zdjęcia na tym krótszym odcinku (wpisz faktyczną długość). Zagłębienia mniejsze niż 0,5 ha – trzy zdjęcia w trzech sąsiednich zagłębieniach (wpisz np. „3 zagłębienia”).`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 5',
    help: 'Wysokość nad poziomem morza dna zagłębienia, w metrach – zwykle kilka metrów (5 m n.p.m. w karcie z przewodnika).',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 03.09.2013',
    required: true,
    hint: 'W pełni sezonu wegetacyjnego: lipiec (sierpień).',
    help: `Dzień badań terenowych. Termin: pełnia sezonu wegetacyjnego – lipiec (sierpień); sprawozdanie 2024: lipiec–sierpień. Częstotliwość zależnie od podtypu: optymalnie co 2–3 lata (pionierskie z sitem członowatym – co najmniej co 3 lata), podtypy torfowiskowe, krzewinkowe i krzewiaste – rzadziej, np. co 6 lat, ale nie tam, gdzie postępuje sukcesja fanerofitów.

Uwaga: przykładowa karta z przewodnika jest z 3 września – wrzesień to ostrzeżenie, nie błąd. Badania wymagają zgody zarządcy (park narodowy, rezerwat).`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m === 7 || m === 8 ? null : 'Termin poza optymalnym oknem (lipiec–sierpień, pełnia sezonu wegetacyjnego).'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcia fitosocjologiczne: 3 skompleksowane zdjęcia wzdłuż transektu ----------

const r7120 = methodology7120.releves.fields
const LAYER_HELP = 'Zwarcie i wysokość warstw a (drzewa), b (krzewy i podrost), c (zielna i krzewinki), d (mszysta). Brak warstwy – zostaw puste albo 0.'

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia. Zdjęcia robi się na początku, w centrum i na końcu transektu; miejsca i kształt zaznacz na mapie.' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, zwykle kilka metrów.' }),
  pickField(r7120, 'area', {
    defaultValue: 100,
    help: 'Powierzchnia zdjęcia w m². W zagłębieniu rynnowym zdjęcie obejmuje całą jego szerokość, więc powierzchnia nie jest stała (100 m² w karcie z przewodnika). Ma gwarantować pełną reprezentatywność florystyczną.',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Dno zagłębienia – zwykle 0°.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…). Dla powierzchni płaskiej wpisz „brak”.' }),
  ...['coverA', 'coverB', 'coverC', 'coverD', 'heightA', 'heightB', 'heightC', 'heightD'].map((n) => {
    const f = pickField(r7120, n)
    return { ...f, help: `${LAYER_HELP} ${f.help?.split('\n')[0] ?? ''}`.trim() } as FieldDef
  }),
  pickField(r7120, 'unit', {
    placeholder: 'np. Zbiorowisko z Agrostis stolonifera i Juncus articulatus subsp. litoralis',
    help: 'Jednostka fitosocjologiczna zdjęcia. W zagłębieniach zwykle to kompleks fitocenoz – zdjęcie jest „skompleksowane”, więc wpisz zbiorowisko przeważające.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w zdjęciu z ilościowością w skali Braun-Blanqueta (r, +, 1–5), z warstwą: krzewy i podrost – b, zielne i krzewinki – c, mszaki – d.',
  }),
]

export const methodology2190: Methodology = {
  code: '2190',
  name: 'Wilgotne zagłębienia międzywydmowe',
  source:
    'Izydorek I. 2015, 2190 Wilgotne zagłębienia międzywydmowe, [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. IV, GIOŚ, s. 87–105 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2013–2014, 2016–2018 i 2023–2025',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wzdłuż liniowego transektu 200 m wykonaj trzy skompleksowane zdjęcia fitosocjologiczne – na początku, w centrum i na końcu. W zagłębieniu rynnowym zdjęcie obejmuje całą jego szerokość (do granicy maksymalnego zalewu); w małych zagłębieniach (<0,5 ha) – trzy zdjęcia w trzech sąsiednich zagłębieniach.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Ocena realnych możliwości utrzymania siedliska we właściwej kondycji, uwzględniająca jego obecny stan zachowania oraz czynniki mogące na nie oddziaływać w najbliższej przyszłości.',
    help: `Weź pod uwagę: tempo sukcesji sosny, brzozy i olszy (i to, czy w obszarze ochrony ścisłej da się je usuwać), zasypywanie przez wędrujące wydmy, odwadnianie rowami, ekspansję trzęślicy, situ rozpierzchłego, trzciny i woskownicy, zalesianie otwartych zagłębień, ruch turystyczny (Białogóra, Mierzeja Sarbska).

Działania ochronne, o których warto wspomnieć: usuwanie podrostu drzew, tamowanie rowów odwadniających, ograniczenie ruchu turystycznego przy stanowisku.

Praktyka 2024: U2 tam, gdzie zwierający się podrost sosny grozi zarośnięciem płatu (Madwiny 2 i 3); w 2013 perspektywy płatów w obszarach ochrony ścisłej na terenie zalesionym oceniano jako niepewne.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego wpływu czynników zagrażających',
      U1: 'Perspektywy zachowania siedliska niepewne, możliwy nieznaczny wpływ czynników zagrażających',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'B01', name: 'Zalesianie terenów otwartych' },
    { code: 'B02.02', name: 'Wycinka lasu' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'F03.01.01', name: 'Szkody wyrządzane przez zwierzynę łowną' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02', name: 'Spowodowane przez człowieka zmiany stosunków wodnych' },
    { code: 'J02.01.02', name: 'Osuszanie terenów morskich, ujściowych, bagiennych' },
    { code: 'K01', name: 'Abiotyczne (powolne) procesy naturalne' },
    { code: 'K01.02', name: 'Zamulenie' },
    { code: 'K01.04', name: 'Zatopienie' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'K04.05', name: 'Szkody wyrządzane przez roślinożerców (w tym przez zwierzynę łowną)' },
    { code: 'M01.02', name: 'Susze i zmniejszenie opadów' },
    { code: 'M02', name: 'Zmiana czynników biotycznych' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. sąsiedztwo 2120, 2130, 2140, 2180; rosiczki, widłaczek torfowy, ptaki wodno-błotne.',
        help: 'Wartości przyrodnicze stanowiska poza samym zagłębieniem: sąsiednie siedliska (nadmorskie wydmy białe 2120, szare 2130, wrzosowiska bażynowe 2140, bór bażynowy 2180, wrzosowiska 4010, torfowiska 7140, 7150), gatunki chronione (rosiczki, widłaczek torfowy, woskownica, brzeżyca), noclegowiska ptaków wodno-błotnych. Brak informacji – „Nie stwierdzono” albo „Nie pozyskano danych”.',
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: 'Jakie działania ochronne wykonano i jaka jest ich skuteczność, oraz co proponujesz. Typowe dla 2190: usuwanie nalotu i podrostu sosny, brzozy, olszy; tamowanie rowów odwadniających; ograniczenie ruchu turystycznego przy stanowisku. W obszarach ochrony ścisłej zwykle ochrona bierna – „Nie stwierdzono (obszar ochrony ścisłej)”.',
      }
    return f
  }),

  speciesCatalog: SPECIES_2190.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer2190(s) })),
  speciesInfo: (name) => {
    const e = findSpecies2190(name)
    if (!e) return undefined
    if (e.subtypes) return `${GROUP_LABELS_2190.characteristic} (podtyp ${e.subtypes.join(', ')})`
    return e.highlyInvasive ? `${GROUP_LABELS_2190[e.group]}, silnie inwazyjny` : e.strong ? `${GROUP_LABELS_2190[e.group]}, silnie ekspansywny` : GROUP_LABELS_2190[e.group]
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator2190 = (id: string): IndicatorDef => {
  const i = methodology2190.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 2190`)
  return i
}
