// Metodyka 91XX (olsy, Carici elongatae-Alnetum) jako dane. Źródło: Pawlaczyk P. 2015, „Olsy (Carici elongatae-Alnetum)”
// [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. IV, GIOŚ, s. 290–313 (tab. 1 i 2),
// z erratą GIOŚ z 30.09.2015 (charakterystyczna kombinacja florystyczna jest kardynalna – ocena struktury nie może być
// od niej lepsza) i zestawem 12 wskaźników ze sprawozdania z monitoringu 2024 (2 kardynalne).
// Olsy nie są siedliskiem z zał. I dyrektywy siedliskowej – „91XX” to kod roboczy GIOŚ, bez gwiazdki.
// Silnik formularza i ocen leży w src/7120, wspólne wskaźniki leśne w src/forest – tu są tylko dane i różnice 91XX.
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology } from '../../7120/habitats/types'
import { num, speciesRows } from '../../7120/habitats/assessment'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import {
  FOREST_IMPACT_CODES,
  choiceIndicator,
  forestArea,
  forestReleveFields,
  forestSiteFields,
  geoAlienTrees,
  keySpecies,
  labelOf,
  otherDistortions,
  plNum,
  speciesCoverIndicator,
  speciesInput,
  type GradedOption,
} from '../../forest'
import { GROUP_LABELS_91XX, SPECIES_91XX, defaultLayer91XX, findSpecies91XX, rowsOfGroups, typicalMatch } from './species'

// ---------- opcje selektów (tab. 2) ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie zmniejsza się, nie jest antropogenicznie pofragmentowana', grade: 'FV' },
  { value: 'slow', label: 'Powolny trend spadkowy lub antropogeniczna fragmentacja', grade: 'U1' },
  { value: 'fast', label: 'Szybki trend spadkowy lub silna antropogeniczna fragmentacja', grade: 'U2' },
]

const FLORISTIC: GradedOption[] = [
  { value: 'typical', label: 'Typowa, właściwa dla olsu (z uwzględnieniem specyfiki regionalnej i lokalnej)', grade: 'FV' },
  { value: 'altered', label: 'Zniekształcona lub uproszczona, ale bez dominacji gatunków obcych ekologicznie', grade: 'U1' },
  { value: 'dominated', label: 'Zdominowana przez gatunki świadczące o zniekształceniu warunków wodnych', grade: 'U2' },
]

const ECOHYDRO: GradedOption[] = [
  { value: 'full', label: 'W pełni zachowana', grade: 'FV' },
  { value: 'partial', label: 'Częściowo pogorszona (przekształcenie, fragmentacja lub zmiany warunków wodnych)', grade: 'U1' },
  { value: 'impaired', label: 'Silnie upośledzona przez przekształcenie olsu, fragmentację lub zmiany warunków wodnych', grade: 'U2' },
]

const WATER: GradedOption[] = [
  { value: 'natural', label: 'Naturalne dla danej sytuacji topograficzno-hydrologicznej', grade: 'FV' },
  { value: 'slight', label: 'Lekko zniekształcone – okresowe przesuszenie, ale bez warstwy murszu', grade: 'U1' },
  { value: 'drained', label: 'Silne przesuszenie z wyraźnym murszeniem torfu', grade: 'U2' },
  { value: 'flooded', label: 'Antropogeniczne ciągłe, całoroczne zalanie – w runie tylko gatunki wodno-bagienne', grade: 'U2' },
]

const MURSH = [
  { value: 'no', label: 'Brak murszu' },
  { value: 'yes', label: 'Wyraźna warstwa murszu' },
]

const DITCHES: GradedOption[] = [
  { value: 'none', label: 'Brak, ewentualnie są, ale całkiem niedrożne i nie odprowadzają wody', grade: 'FV' },
  { value: 'draining', label: 'Są i odprowadzają wodę, ale w olsie nie ma objawów przesuszenia', grade: 'U1' },
  { value: 'drying', label: 'Są i powodują wyraźne objawy przesuszenia', grade: 'U2' },
]

const EUTROPHICATION: GradedOption[] = [
  { value: 'none', label: 'Nie ma', grade: 'FV' },
  { value: 'minor', label: 'Nieznaczne, dostrzegalne, ale nie zubażające kompozycji roślinności', grade: 'U1' },
  { value: 'strong', label: 'Wyraźne, odzwierciedlone w roślinności (uproszczenie struktury, zaburzone stosunki dominacji)', grade: 'U2' },
]

const PIECE_KIND = [
  { value: 'lying', label: 'Leżące (kłoda, fragment)' },
  { value: 'standing', label: 'Stojące (posusz, złom)' },
]

// ---------- progi liczbowe ----------

/** Gatunki obce w drzewostanie: <5% FV, 5–15% U1, >15% U2 (odnawianie się – zawsze U2, w presecie). */
export const gradeGeoAlien91XX = (t: number): Grade => (t < 5 ? 'FV' : t <= 15 ? 'U1' : 'U2')
/** Martwe drewno łączne: >20 m³/ha FV, 10–20 U1, <10 U2. */
export const gradeDeadWood91XX = (m3: number): Grade => (m3 > 20 ? 'FV' : m3 >= 10 ? 'U1' : 'U2')
/** Martwe drewno wielkowymiarowe: >5 szt./ha FV, 3–5 U1, <3 U2. */
export const gradeLargeDeadWood91XX = (n: number): Grade => (n > 5 ? 'FV' : n >= 3 ? 'U1' : 'U2')
/** Mikrosiedliska drzewne: >20 szt./ha FV, 10–20 U1, <10 U2. */
export const gradeMicrohabitats91XX = (n: number): Grade => (n > 20 ? 'FV' : n >= 10 ? 'U1' : 'U2')

/**
 * Inwazyjne gatunki obce w podszycie i runie (progi opisowe tab. 2, interpretacja):
 * brak – FV; 1 gatunek do 25% pokrycia („nie bardzo silnie ekspansywny”) – U1; więcej gatunków albo 1 powyżej 25% – U2.
 */
export function gradeInvasive91XX({ count, total }: { count: number; total?: number }): Grade | null {
  if (count === 0) return 'FV'
  if (count > 1) return 'U2'
  return total === undefined ? null : total <= 25 ? 'U1' : 'U2'
}

// ---------- spis martwego drewna i mikrosiedlisk z transektu ----------

/** Powierzchnia transektu w ha z pola „Wymiary transektu” („100x40 m”, „40 × 100 m”); domyślnie 0,4 ha. */
export function transectHa(site?: InputValues): number {
  const m = /(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)/i.exec(String(site?.transect ?? ''))
  if (!m) return 0.4
  const ha = (Number(m[1].replace(',', '.')) * Number(m[2].replace(',', '.'))) / 10000
  return ha > 0 ? ha : 0.4
}

export interface DeadWoodPiece {
  kind: 'lying' | 'standing'
  /** Średnica w połowie długości (leżące) albo pierśnica (stojące), cm. */
  d: number
  /** Długość (leżące) albo wysokość (stojące), m. */
  l: number
}

/** Kompletne wiersze spisu martwego drewna (rodzaj, średnica i długość > 0). */
export function deadWoodPieces(value: unknown): DeadWoodPiece[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((r: Record<string, unknown>) => {
    const d = num(r?.diameter)
    const l = num(r?.length)
    const kind = r?.kind
    return (kind === 'lying' || kind === 'standing') && d && l && d > 0 && l > 0 ? [{ kind, d, l }] : []
  })
}

/** Objętość fragmentu jako walca: π/4 · d² · l (d w m). Tak samo dla leżących i stojących. */
export const pieceVolume = (p: DeadWoodPiece) => (Math.PI / 4) * (p.d / 100) ** 2 * p.l

const round1 = (n: number) => Math.round(n * 10) / 10

/** Zasoby martwego drewna ze spisu, przeliczone na hektar. */
export function deadWoodFromPieces(pieces: DeadWoodPiece[], ha: number) {
  const volume = pieces.reduce((s, p) => s + pieceVolume(p), 0)
  return { count: pieces.length, volume: Math.round(volume * 100) / 100, perHa: round1(volume / ha) }
}

/** Sztuki drewna wielkowymiarowego ze spisu: grubość ≥ progu (domyślnie 30 cm) i długość/wysokość ≥ 3 m. */
export function largePieces(pieces: DeadWoodPiece[], minDiameter = 30) {
  return pieces.filter((p) => p.d >= minDiameter && p.l >= 3)
}

/** Kody mikrosiedlisk z przewodnika (pkt 3 sposobu wykonania badań). */
export const MICRO_CODES: Record<string, string> = {
  H: 'drzewo z hubami',
  Ob: 'istotne obłamania korony',
  Os: 'zamarłe główne konary w koronie',
  Rz: 'rozszczepienie pnia na wiele drzazg',
  Pr: 'blizna piorunowa',
  Pk: 'pęknięcie pnia',
  Dz: 'dziupla >5 cm',
  DzP: 'dziupla z próchnowiskiem',
  Wk: 'wykrot ze stojącym talerzem korzeni',
  S: 'drzewo stare (ponad 120 lat)',
}
const CODE_BY_LOWER = new Map(Object.keys(MICRO_CODES).map((c) => [c.toLowerCase(), c]))

/** „Os, Dz” -> kody (różne typy na jednym drzewie liczą się osobno, ten sam typ raz) + nierozpoznane tokeny. */
export function parseMicroCodes(text: unknown): { codes: string[]; unknown: string[] } {
  const codes = new Set<string>()
  const unknown: string[] = []
  for (const t of String(text ?? '').split(/[\s,;+/]+/).filter(Boolean)) {
    const c = CODE_BY_LOWER.get(t.toLowerCase())
    if (c) codes.add(c)
    else unknown.push(t)
  }
  return { codes: [...codes], unknown }
}

/** Liczba mikrosiedlisk ze spisu drzew (jeden wiersz = jedno drzewo) i przeliczenie na hektar. */
export function microFromTrees(value: unknown, ha: number) {
  const rows = Array.isArray(value) ? (value as Record<string, unknown>[]) : []
  const parsed = rows.map((r) => parseMicroCodes(r?.codes)).filter((p) => p.codes.length || p.unknown.length)
  const count = parsed.reduce((s, p) => s + p.codes.length, 0)
  return {
    trees: parsed.filter((p) => p.codes.length).length,
    count,
    perHa: round1(count / ha),
    unknown: parsed.flatMap((p) => p.unknown),
  }
}

const haText = (ha: number) => `${plNum(round1(ha * 100) / 100)} ha`
const piecesOf = (ctx?: IndicatorContext) => deadWoodPieces(ctx?.indicators?.deadWood?.inputs?.pieces)

/** Wartość szt./ha dla drewna wielkowymiarowego: liczba wpisana albo wyliczona ze spisu w „Martwym drewnie”. */
function largeDeadWoodValue(i: InputValues, ctx?: IndicatorContext): { perHa?: number; fromList?: { n: number; ha: number; min: number } } {
  const typed = num(i.perHa)
  if (typed !== undefined) return { perHa: typed }
  const pieces = piecesOf(ctx)
  if (!pieces.length) return {}
  const min = num(i.minDiameter) ?? 30
  const ha = transectHa(ctx?.site)
  const n = largePieces(pieces, min).length
  return { perHa: round1(n / ha), fromList: { n, ha, min } }
}

/** Zasoby martwego drewna: liczba wpisana ma pierwszeństwo, inaczej wyliczenie ze spisu. */
function deadWoodValue(i: InputValues, ctx?: IndicatorContext): { perHa?: number; fromList?: ReturnType<typeof deadWoodFromPieces> & { ha: number } } {
  const typed = num(i.volume)
  if (typed !== undefined) return { perHa: typed }
  const pieces = deadWoodPieces(i.pieces)
  if (!pieces.length) return {}
  const ha = transectHa(ctx?.site)
  const r = deadWoodFromPieces(pieces, ha)
  return { perHa: r.perHa, fromList: { ...r, ha } }
}

function microValue(i: InputValues, ctx?: IndicatorContext): { perHa?: number; fromList?: ReturnType<typeof microFromTrees> & { ha: number } } {
  const typed = num(i.perHa)
  if (typed !== undefined) return { perHa: typed }
  const ha = transectHa(ctx?.site)
  const r = microFromTrees(i.trees, ha)
  if (!r.count) return {}
  return { perHa: r.perHa, fromList: { ...r, ha } }
}

const WOOD_IDS = ['deadWood', 'largeDeadWood', 'microhabitats'] as const

/** Tab. 2, „ogólnie struktura i funkcje” – FV wymaga co najmniej jednego FV wśród 3 wskaźników drewna. Silnik tego nie liczy, więc ostrzegamy. */
function woodRuleWarning(ctx?: IndicatorContext): string | null {
  const grades = WOOD_IDS.map((id) => ctx?.indicators?.[id]?.grade)
  if (grades.some((g) => !g) || grades.includes('FV')) return null
  return 'Żaden z trzech wskaźników martwego drewna i drzew biocenotycznych nie ma FV. Wg tab. 2 struktura i funkcje nie powinny wtedy dostać FV – jeśli formularz wyliczy FV, obniż ocenę ręcznie w uzasadnieniu.'
}

const joinText = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(' ') || null

const WATER_NOTE = `Naturalne warunki wodne w olsach to zmienność poziomu wody, ale bez jej ruchu: przez większość roku utrzymują się warunki bagienne, a w dolinkach może stać woda. Latem woda może opaść pod powierzchnię – to naturalne.`

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  forestArea({
    description:
      'Trend zmian powierzchni płatu i jego antropogeniczna fragmentacja. Niskie groble i drogi na groblach są dopuszczalne, jeśli nie przerywają ciągłości ekosystemu i warunków wodnych.',
    help: `Co wybrać: jak zmienia się powierzchnia płatu olsu i czy jest on pocięty przez człowieka – zręby zupełne, rowy, drogi, groble.

Dopuszczalne przy FV: niskie groble i drogi na groblach, jeśli nie przerywają ciągłości ekosystemu i ciągłości warunków hydrologicznych.

Przy pierwszej obserwacji, bez danych do porównania, wybierz „nie zmniejsza się” albo oceń XX i opisz to w polu wartości.

Dlaczego: olsy często tworzą małe płaty w obniżeniach i dolinkach. Każde przecięcie (rów, grobla przerywająca przepływ) zmienia warunki wodne całego płatu.`,
    thresholds: {
      FV: 'Nie zmniejsza się, nie jest antropogenicznie pofragmentowana (dopuszczalne niskie groble i drogi na groblach, jeśli nie przerywają ciągłości ekosystemu i ciągłości warunków hydrologicznych)',
      U1: 'Wykazuje powolny trend spadkowy lub jest antropogenicznie pofragmentowana',
      U2: 'Wykazuje szybki trend spadkowy lub jest silnie antropogenicznie pofragmentowana',
    },
    options: AREA,
  }),
  {
    ...choiceIndicator({
      id: 'characteristic',
      label: 'Charakterystyczna kombinacja florystyczna',
      cardinal: true,
      description:
        'Odkształcenie składu florystycznego runa od typowej kompozycji olsu w danym regionie i warunkach hydrologicznych. Ocena ekspercka całej kompozycji.',
      help: `Co wpisać: gatunki runa i podszytu stwierdzone na transekcie (z pokryciem w %, jeśli możesz) i ocenę całej kombinacji florystycznej.

Za typową kompozycję przyjmuje się runo najlepiej zachowanych, dojrzałych olsów w danym obszarze i warunkach wodnych – z pełnym uwzględnieniem lokalnej specyfiki. Oceniaj zniekształcenie runa, nie jego dostosowanie do lokalnych warunków. Odnieś się do pytań:
• czy gatunki dominujące w warstwach są właściwe dla naturalnego olsu (nie muszą być charakterystyczne ani specyficzne);
• czy runo nie jest zdominowane np. przez gatunki łąkowe;
• czy nie wkraczają gatunki obce ekologicznie (przy przesuszeniu).

Nie obniżaj oceny za naturalny przejściowy charakter fitocenozy (między łęgiem a olsem – np. bagienne lasy olszowe na brzegach jezior i w dolinach rzek) ani za fluktuacje uznawane za naturalne (np. ekspansja świerka w olsach płn.-wsch. Polski).

Gatunki typowe (rozdz. 4 przewodnika): olsza czarna, porzeczka czarna, kruszyna; w dolinkach psianka słodkogórz, karbieniec, knieć błotna, czermień błotna, gorysz błotny, przytulia błotna, kosaciec żółty, okrężnica bagienna, niezapominajka błotna, turzyca długokłosa, turzyca błotna, zachylnik błotny, szczaw lancetowaty, trzcinnik lancetowaty; na kępach szczawik, konwalijka, borówka czarna, nerecznica krótkoostna. Formularz pokazuje, ile gatunków typowych jest na liście – to tylko pomoc, ocenę wybierasz sam.

Dlaczego: kombinacja florystyczna rozstrzyga o samej identyfikacji siedliska. Wskaźnik kardynalny (errata GIOŚ z 30.09.2015): ocena struktury i funkcji nie może być lepsza niż ocena tego wskaźnika.`,
      thresholds: {
        FV: 'Typowa, właściwa dla siedliska (z uwzględnieniem specyfiki regionalnej i lokalnej oraz warunków hydrologicznych). W szczególności: brak dominacji gatunków łąkowych; kombinacja nie jest zredukowana wyłącznie do facjalnie występujących gatunków bagiennych',
        U1: 'Zniekształcona w stosunku do typowej kombinacji wykształcającej się lokalnie w olsach. Nie ma dominacji gatunków obcych ekologicznie i świadczących o zmienionych warunkach hydrologicznych; może występować uproszczenie kombinacji, np. zredukowanie do facjalnej dominacji gatunków bagiennych',
        U2: 'Zdominowana przez gatunki świadczące o zniekształceniu warunków hydrologicznych (np. dominacja gatunków łąkowych, występowanie niemal wyłącznie pleustofitów, zupełny brak gatunków bagiennych)',
      },
      options: FLORISTIC,
      inputLabel: 'Kombinacja florystyczna',
      before: [
        speciesInput(
          'Gatunki runa i podszytu na transekcie',
          'Gatunki stwierdzone na transekcie, z pokryciem w % transektu (opcjonalnie). Lista gatunków typowych jest pod „?” przy nazwie wskaźnika.',
        ),
      ],
    }),
    explain: (i) => {
      const rows = speciesRows(i.species)
      if (!rows.some((r) => r.name?.trim())) return null
      const { present, total } = typicalMatch(rows)
      return `Na liście ${present.length} z ${total} gatunków typowych olsu z przewodnika${present.length ? ` (${present.join(', ')})` : ''}. To tylko pomoc – oceniasz całą kombinację.`
    },
    warn: (i) => {
      if (i.choice === 'dominated') return null
      const bad = rowsOfGroups(speciesRows(i.species), ['meadow', 'pleustophyte', 'invasive']).filter((r) => (num(r.cover) ?? 0) >= 25)
      return bad.length
        ? `Wysokie pokrycie gatunków łąkowych, pleustofitów albo obcych: ${bad.map((r) => r.name).join(', ')} – sprawdź, czy runo nie jest nimi zdominowane (U2).`
        : null
    },
  },
  geoAlienTrees({
    label: 'Gatunki obce geograficznie w drzewostanie',
    cardinal: false,
    description:
      'Drzewa obce w drzewostanie (poza naturalnym zasięgiem) i ich odnawianie się. W olsach rzadkie – np. topole kultywowane, jesion pensylwański.',
    help: `Co wpisać: każdy gatunek drzewa obcy geograficznie, z udziałem w drzewostanie w %, oraz czy się odnawia. Udział określa się jak w Instrukcji Urządzania Lasu – można go wziąć z opisu taksacyjnego, albo ocenić w terenie.

Za obce geograficznie uważa się wszystkie gatunki poza naturalnym zasięgiem (definicja z ustawy o ochronie przyrody). W olsach to zwykle kultywary topól, czasem jesion pensylwański albo dąb czerwony. Świerk w płn.-wsch. Polsce jest rodzimy – tu go nie wpisuj.

„Odnawianie się” to istnienie nalotów i podrostów na tyle licznych, że mogą w przyszłości wejść w skład drzewostanu (nie pojedyncze siewki). Odnawianie się zawsze daje U2.

W olsach nie ocenia się osobno składu drzewostanu ani gatunków obcych ekologicznie – przy właściwych warunkach wodnych one tu nie rosną.

Dlaczego: obce drzewa zmieniają ocienienie, ściółkę i strukturę płatu. Od monitoringu 2015–2018 wskaźnik zwykły (wcześniej kardynalny).`,
    thresholds: {
      FV: '<5%, tj. najwyżej miejscami lub pojedynczo, i nie odnawiające się',
      U1: 'Udział 5–15% i nie odnawiające się',
      U2: '>15% lub spontanicznie odnawiające się, niezależnie od udziału',
    },
    grade: gradeGeoAlien91XX,
  }),
  speciesCoverIndicator({
    id: 'invasive',
    label: 'Inwazyjne gatunki obce w podszycie i runie',
    description:
      'Neofity w podszycie i runie: najczęściej uczep amerykański, niecierpek drobnokwiatowy, nawłoć późna, czeremcha amerykańska.',
    help: `Co wpisać: każdy gatunek obcy geograficznie w podszycie i runie, z pokryciem w % transektu. W monitoringu 2024 najczęstsze były uczep amerykański Bidens frondosa (26 stanowisk), niecierpek drobnokwiatowy Impatiens parviflora (22), nawłoć późna Solidago gigantea (9) i czeremcha amerykańska Padus serotina (8); rzadziej jesion pensylwański, nawłoć kanadyjska, erechtites, niecierpek gruczołowaty. Brak – zostaw listę pustą.

Odnotuj każdy gatunek obcy, nawet jeśli nie obniża oceny. Za inwazyjny uznaje się gatunek wykazujący lokalnie tendencję do rozprzestrzeniania się.

Progi tab. 2 są opisowe. Formularz przyjmuje: brak – FV; jeden gatunek o pokryciu do 25% („nie bardzo silnie ekspansywny”) – U1; więcej niż jeden gatunek albo jeden powyżej 25% – U2. To interpretacja – przy innej ocenie popraw podpowiedź.

Dlaczego: przesuszone olsy są podatne na neofityzację. Od monitoringu 2015–2018 wskaźnik zwykły (wcześniej kardynalny).`,
    thresholds: {
      FV: 'Brak',
      U1: 'Obecne, lecz najwyżej 1 gatunek, nie bardzo silnie ekspansywny',
      U2: 'Więcej niż 1 gatunek, albo 1 gatunek bardzo silnie ekspansywny',
    },
    inputLabel: 'Inwazyjne gatunki obce',
    inputHelp: 'Gatunki obce geograficznie w podszycie i runie, z pokryciem w % transektu. Brak – zostaw pustą listę.',
    grade: (c) => gradeInvasive91XX(c),
    note: 'Próg „bardzo silnie ekspansywny” przyjęto jako ponad 25% pokrycia – to interpretacja.',
    emptyText: 'Nie stwierdzono',
  }),
  choiceIndicator({
    id: 'ecohydro',
    label: 'Funkcja ekohydrologiczna w krajobrazie',
    description:
      'Ekspercka ocena, czy płat olsu pełni swoją funkcję ekohydrologiczną: retencję wody, zasilanie cieków, bufor biogeochemiczny wokół torfowisk i wód.',
    help: `Co wybrać: czy funkcja – w sensie ekohydrologicznym – pełniona w krajobrazie przez ten płat olsu została zachowana. Dotyczy to:
• retencji wody,
• zasilania w wodę cieków naturalnych,
• funkcji bufora biogeochemicznego wokół torfowisk i ekosystemów wodnych.

Funkcje te mogą być zaburzone przez: przesuszenie powodujące murszenie torfów, odwodnienie rowami (szybszy odpływ zamiast retencji), fragmentację olsów, zręby zupełne (także zrębami przerywające pierścień olsowy wokół innych ekosystemów hydrogenicznych).

Dlaczego: to wskaźnik jakości – mierzy, czy ols nadal działa jak „gąbka” w krajobrazie. Wiąże się bezpośrednio z warunkami wodnymi.`,
    thresholds: {
      FV: 'W pełni zachowana',
      U1: 'Częściowo pogorszona, w porównaniu ze stanem sprzed przekształceń, przez zniekształcenia olsu, jego fragmentację lub przez zmiany warunków hydrologicznych',
      U2: 'Przekształcenie olsu, jego fragmentacja lub przez zmiany warunków hydrologicznych silnie upośledzające jego funkcję w krajobrazie, w porównaniu ze stanem sprzed przekształceń',
    },
    options: ECOHYDRO,
    inputLabel: 'Funkcja ekohydrologiczna',
  }),
  {
    ...choiceIndicator({
      id: 'water',
      label: 'Warunki wodne',
      cardinal: true,
      description:
        'Zachowanie naturalnych warunków wodnych, oceniane względem zrekonstruowanej naturalnej hydrologii tego konkretnego olsu. Obniża się tylko za zniekształcenia antropogeniczne.',
      help: `Co wybrać: czy warunki wodne są naturalne dla danej sytuacji topograficzno-hydrologicznej. Staraj się zrekonstruować naturalną hydrologię tego konkretnego olsu i obniżaj ocenę tylko za zniekształcenie tych naturalnych warunków.

${WATER_NOTE} Mogą też występować naturalne modyfikacje tego wzorca: olsy przyjeziorne, w których poziom wody zależy od poziomu jeziora. W olsach na torfach niskich wysychanie i występowanie powierzchniowej warstwy murszu wskazuje na zły (U2) stan siedliska.

Antropogeniczne zaburzenie może działać w obie strony: przesuszenie (rowy, pobór wód, obniżenie poziomu jeziora) albo stałe zalanie (np. piętrzenie, tamy bobrowe na rowach) – wtedy runo redukuje się do gatunków wodno-bagiennych. Opisz, na czym opierasz ocenę: łata wodowskazowa, piezometr, dołek w torfie, mursz, roślinność.

Uwaga: obserwacja w suchym lecie może dać zaniżony obraz – takie przesuszenie z naturalnej fluktuacji opisz, ale nie obniżaj za nie oceny.

Dlaczego: warunki wodne to kluczowy dla olsów wskaźnik – od nich zależy torf, runo i funkcja w krajobrazie. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'Naturalne dla danej sytuacji topograficzno-hydrologicznej',
        U1: 'Lekko antropogenicznie zniekształcone. Na glebach torfowych może być okresowe przesuszenie, ale nie ma wytworzonej warstwy murszu',
        U2: 'Silnie zniekształcone. Silne przesuszenie skutkujące wyraźnym murszeniem torfu, lub spowodowane działalnością człowieka, a nie naturalną sytuacją topograficzno-hydrologiczną, ciągłe, całoroczne zalanie wodą redukujące roślinność wyłącznie do gatunków wodno-bagiennych',
      },
      options: WATER,
      inputLabel: 'Warunki wodne',
      after: [
        {
          kind: 'select',
          name: 'mursh',
          label: 'Mursz na powierzchni torfu',
          options: MURSH,
          help: 'Czy na powierzchni torfu jest wyraźna warstwa murszu (rozłożonego, przesuszonego, ziemistego torfu). Wg tab. 2 wytworzona warstwa murszu to już stan zły (U2). Pole opcjonalne – służy do sprawdzenia spójności z wybraną oceną.',
        },
        {
          kind: 'number',
          name: 'level',
          label: 'Poziom wody pod powierzchnią (jeśli mierzony)',
          unit: 'cm',
          min: -200,
          max: 300,
          help: 'Głębokość lustra wody pod powierzchnią gruntu w cm – z łaty wodowskazowej, piezometru albo dołka w torfie. Woda nad powierzchnią – liczba ujemna. Pole opcjonalne, służy do porównań między latami.',
        },
      ],
    }),
    warn: (i) =>
      i.mursh === 'yes' && (i.choice === 'natural' || i.choice === 'slight')
        ? 'Zaznaczono wyraźną warstwę murszu, a ocena jest lepsza niż U2. Wg tab. 2 mursz na torfie to silne przesuszenie (U2), chyba że wynika z naturalnej sytuacji – wtedy to opisz.'
        : null,
    describe: (i) => {
      const lv = num(i.level)
      return [
        labelOf(WATER, i.choice),
        i.mursh === 'yes' ? 'wyraźna warstwa murszu' : '',
        lv === undefined ? '' : lv < 0 ? `woda ${plNum(-lv)} cm nad powierzchnią` : `woda ${plNum(lv)} cm pod powierzchnią`,
      ]
        .filter(Boolean)
        .join(', ')
    },
  },
  {
    ...choiceIndicator({
      id: 'ditches',
      label: 'Obecność rowów odwadniających',
      description:
        'Rowy odwadniające w olsie albo w sąsiedztwie, w odległości wpływającej na jego warunki wodne. Ocena skupia się na istnieniu rowów i odprowadzaniu nimi wody.',
      help: `Co wybrać: czy w olsie – albo w jego sąsiedztwie, w odległości wpływającej na warunki wodne – są sztuczne rowy odwadniające i czy odprowadzają wodę.

Ocena skupia się na istnieniu i działaniu rowów. Niedrożny rów, który nie odprowadza wody, nie obniża oceny – nawet jeśli uważasz, że stagnująca w nim woda szkodzi (to opisz w warunkach wodnych). W opisie podaj, gdzie biegną rowy, czy są konserwowane, czy mają zastawki.

Dlaczego: rowy to najczęstsza przyczyna pogorszenia warunków wodnych i funkcji ekohydrologicznej olsów. Wskaźnik pomocniczy do interpretacji warunków wodnych. Nowe rowy albo udrażnianie istniejących uwzględnij w perspektywach ochrony.`,
      thresholds: {
        FV: 'Brak, ewentualnie są, ale całkiem niedrożne i nie odprowadzające wody',
        U1: 'Są i odprowadzają wodę, ale w olsie nie ma objawów przesuszenia',
        U2: 'Są i powodują wyraźne objawy przesuszenia',
      },
      options: DITCHES,
      inputLabel: 'Rowy odwadniające',
    }),
    warn: (i, ctx) =>
      i.choice === 'drying' && ctx?.indicators?.water?.inputs?.choice === 'natural'
        ? 'Rowy powodują wyraźne objawy przesuszenia, a warunki wodne oceniono jako naturalne – jedna z tych ocen jest chyba niespójna.'
        : null,
  },
  choiceIndicator({
    id: 'eutrophication',
    label: 'Objawy zanieczyszczenia lub nadmiernej eutrofizacji wód',
    description:
      'Wizualnie dostrzegalne przejawy niewłaściwej jakości wód: masowy rozwój rzęsy drobnej i manny jadalnej, zubożenie runa. Także „wewnętrzna eutrofizacja” po zalaniu przesuszonego torfowiska.',
    help: `Co wybrać: czy widać przejawy zanieczyszczenia albo wysokiej eutrofizacji wód w olsie. Typowe objawy to zmiany w strukturze gatunkowej, ograniczona różnorodność runa, masowy rozwój rzęsy drobnej Lemna minor i manny jadalnej Glyceria fluitans, mętna woda, zapach.

Pogorszony stan może być też wynikiem „wewnętrznej eutrofizacji”, np. po wtórnym zalaniu przesuszonego torfowiska – wtedy napisz to w opisie.

Dlaczego: pomocniczy wskaźnik dotyczący jakości wód. Ocenia się go tylko wizualnie, pośrednio – po roślinności.`,
    thresholds: {
      FV: 'Nie ma',
      U1: 'Nieznaczne, dostrzegalne, ale nie zubażające kompozycji roślinności',
      U2: 'Wyraźne, odzwierciedlone w roślinności, np. przez uproszczenie jej struktury lub zaburzenie stosunków dominacyjnych',
    },
    options: EUTROPHICATION,
    inputLabel: 'Objawy eutrofizacji',
  }),
  {
    id: 'deadWood',
    label: 'Martwe drewno (łączne zasoby)',
    parameter: 'structure',
    description:
      'Łączna objętość rozkładającego się drewna (leżące i stojące od 7 cm grubości, bez pniaków) z powierzchni transektu, w m³/ha. Spis fragmentów przelicza się na hektar.',
    help: `Co wpisać: spis fragmentów martwego drewna z transektu – formularz policzy objętość i przeliczy ją na hektar. Albo wpisz od razu wynik w m³/ha (np. z urządzania lasu) w polu na dole – ma pierwszeństwo przed spisem.

Jak spisywać (pas po 20 m od linii transektu, łącznie 0,4 ha):
• leżące – wszystkie fragmenty grubsze niż 10 cm w cieńszym końcu i dłuższe niż 0,1 m, których źródłem jest powierzchnia transektu: długość w metrach (bez części cieńszej niż 7 cm, ale z częścią wystającą poza transekt) i średnica w połowie długości w cm; drzewo pocięte na kawałki – jeden fragment;
• stojące (posusz, złomy) – grubsze niż 7 cm w pierśnicy: wysokość w metrach (bez części cieńszej niż 7 cm) i pierśnica w cm.
Obwody przelicz na średnice (d = obwód / π).

Formularz liczy każdy fragment jako walec: π/4 · d² · długość, i dzieli sumę przez powierzchnię transektu wziętą z „Wymiarów transektu” (np. 100×40 m = 0,4 ha). Ten sam spis zasila wskaźnik „Martwe drewno wielkowymiarowe”.

Olsy zamarłe lub zamierające (np. po zatopieniu) będą miały wysoką ocenę tego wskaźnika – choć inne elementy struktury mogą być ocenione negatywnie. Przekroczenia progu w rezerwatach i parkach narodowych nie są przesłanką do usuwania drewna.

Dlaczego: martwe drewno to kluczowy dla różnorodności biologicznej element lasu (wskaźnik SEBI 018). Wskaźnik jakości.`,
    thresholds: { FV: '>20 m³/ha', U1: '10–20 m³/ha', U2: '<10 m³/ha' },
    inputs: [
      {
        kind: 'table',
        name: 'pieces',
        label: 'Spis martwego drewna z transektu',
        addLabel: 'Dodaj fragment',
        rowLabel: 'Fragment',
        help: 'Jeden wiersz = jeden fragment drewna leżącego albo jedno drzewo martwe stojące. Leżące: średnica w połowie długości i długość. Stojące: pierśnica i wysokość. Lista jest opcjonalna, gdy wpisujesz gotowy wynik w m³/ha.',
        columns: [
          { kind: 'select', name: 'kind', label: 'Rodzaj', options: PIECE_KIND, required: true, help: 'Leżące – kłody i fragmenty na ziemi. Stojące – martwe drzewa stojące (posusz) i złomy (drzewa złamane).' },
          { kind: 'number', name: 'diameter', label: 'Średnica / pierśnica', unit: 'cm', min: 0, max: 300, required: true, help: 'Leżące: średnica w połowie długości. Stojące: pierśnica (na wysokości 1,3 m). W centymetrach.' },
          { kind: 'number', name: 'length', label: 'Długość / wysokość', unit: 'm', min: 0, max: 60, required: true, help: 'Leżące: długość fragmentu bez części cieńszej niż 7 cm. Stojące: wysokość bez części cieńszej niż 7 cm. W metrach.' },
        ],
      },
      {
        kind: 'number',
        name: 'volume',
        label: 'Zasoby martwego drewna (jeśli policzone inaczej)',
        unit: 'm³/ha',
        min: 0,
        help: 'Gotowy wynik w m³/ha, np. z pomiaru według Instrukcji Urządzania Lasu. Gdy go wpiszesz, ma pierwszeństwo przed spisem fragmentów. Opcjonalne.',
      },
    ],
    suggest: (i, ctx) => {
      const { perHa } = deadWoodValue(i, ctx)
      return perHa === undefined ? null : gradeDeadWood91XX(perHa)
    },
    explain: (i, ctx) => {
      const { fromList } = deadWoodValue(i, ctx)
      if (!fromList) return num(i.volume) !== undefined && deadWoodPieces(i.pieces).length ? 'Ocena z wpisanego wyniku w m³/ha (ma pierwszeństwo przed spisem).' : null
      return `Ze spisu: ${fromList.count} fragm., ${plNum(fromList.volume)} m³ na ${haText(fromList.ha)} = ${plNum(fromList.perHa)} m³/ha.`
    },
    describe: (i, ctx) => {
      const { perHa, fromList } = deadWoodValue(i, ctx)
      if (perHa === undefined) return ''
      return fromList ? `${plNum(perHa)} m³/ha (spis ${fromList.count} fragmentów z ${haText(fromList.ha)})` : `${plNum(perHa)} m³/ha`
    },
  },
  {
    id: 'largeDeadWood',
    label: 'Martwe drewno wielkowymiarowe',
    parameter: 'structure',
    description:
      'Grube kłody i stojące pnie: ponad 3 m długości/wysokości i ponad 30 cm grubości (próg: przeciętna pierśnica 80-letniej olszy). Liczone ze spisu w „Martwym drewnie”, przeliczone na hektar.',
    help: `Co wpisać: nic, jeśli wypełniłeś spis fragmentów we wskaźniku „Martwe drewno (łączne zasoby)” – formularz sam policzy sztuki wielkowymiarowe i przeliczy je na hektar. Albo wpisz od razu liczbę sztuk na hektar.

Liczą się kłody leżące i martwe pnie stojące dłuższe (wyższe) niż 3 m i grubsze niż próg – u stojących w pierśnicy, u leżących w pierśnicy, jeśli da się ją określić, albo w grubszym końcu (spis podaje średnicę w połowie długości, więc wynik jest raczej zaniżony). Próg grubości to przeciętna pierśnica 80-letniej olszy w danych warunkach siedliskowych (z tablic bonitacji) – zwykle przyjmuje się 30 cm; zmień go w polu poniżej, jeśli wiesz lepiej.

Formularz liczy sztuki o grubości co najmniej równej progowi i długości co najmniej 3 m – w przykładzie z przewodnika (Kozi Rynek) kłoda 30 cm × 14 m została zaliczona, więc granice przyjęto włącznie.

Dlaczego: grube rozkładające się kłody to mikrosiedliska organizmów ksylobiontycznych, a w olsach brakuje go najczęściej. Wskaźnik jakości.`,
    thresholds: { FV: '>5 szt./ha', U1: '3–5 szt./ha', U2: '<3 szt./ha' },
    inputs: [
      {
        kind: 'number',
        name: 'minDiameter',
        label: 'Próg grubości',
        unit: 'cm',
        min: 10,
        max: 100,
        defaultValue: 30,
        help: 'Przeciętna pierśnica 80-letniej olszy w danych warunkach siedliskowych (tablice bonitacji drzewostanów). Standardowo 30 cm. Zmień tylko, gdy masz podstawy, i napisz to w opisie.',
      },
      {
        kind: 'number',
        name: 'perHa',
        label: 'Sztuk na hektar (jeśli policzone bez spisu)',
        unit: 'szt./ha',
        min: 0,
        help: 'Gotowa liczba kłód i pni wielkowymiarowych na hektar. Gdy ją wpiszesz, ma pierwszeństwo przed wyliczeniem ze spisu martwego drewna. Opcjonalne.',
      },
    ],
    suggest: (i, ctx) => {
      const { perHa } = largeDeadWoodValue(i, ctx)
      return perHa === undefined ? null : gradeLargeDeadWood91XX(perHa)
    },
    explain: (i, ctx) => {
      const { fromList } = largeDeadWoodValue(i, ctx)
      if (!fromList) return null
      return `Ze spisu martwego drewna: ${fromList.n} szt. ≥${fromList.min} cm i ≥3 m na ${haText(fromList.ha)} = ${plNum(round1(fromList.n / fromList.ha))} szt./ha.`
    },
    describe: (i, ctx) => {
      const { perHa, fromList } = largeDeadWoodValue(i, ctx)
      if (perHa === undefined) return ''
      const min = num(i.minDiameter) ?? 30
      return `${plNum(perHa)} szt./ha${fromList ? ` (${fromList.n} szt. na ${haText(fromList.ha)})` : ''}${min !== 30 ? `, próg grubości ${plNum(min)} cm` : ''}`
    },
  },
  {
    id: 'microhabitats',
    label: 'Mikrosiedliska drzewne (drzewa biocenotyczne)',
    parameter: 'structure',
    description:
      'Liczba struktur ważnych dla różnorodności biologicznej na drzewach: huby, obłamania i zamarłe konary, rozszczepienia, blizny, pęknięcia, dziuple, próchnowiska, wykroty, drzewa stare. Na hektar.',
    help: `Co wpisać: spis drzew z mikrosiedliskami z pasa po 20 m od linii transektu (0,4 ha). Jeden wiersz = jedno drzewo, w nim kody mikrosiedlisk oddzielone przecinkiem, np. „Os, Dz”. Dwa mikrosiedliska różnych typów na tym samym drzewie liczą się osobno. Formularz policzy mikrosiedliska i przeliczy je na hektar. Albo wpisz gotową liczbę na hektar w polu na dole.

Kody (przewodnik):
• H – drzewo z hubami;
• Ob – istotne obłamania korony (złamane co najmniej główne konary, pnie złamane pod koroną, drzewa z koroną wtórną);
• Os – zamarłe główne konary w koronie (co najmniej ¼ korony);
• Rz – pień złamany z rozszczepieniem na wiele (≥5) drzazg co najmniej 50 cm długich;
• Pr – blizna piorunowa (≥3 m, sięgająca bielu);
• Pk – pęknięcie pnia (>50 cm długości, ≥2 cm w głąb bielu);
• Dz – dziupla >5 cm średnicy, niewypełniona próchnem;
• DzP – dziupla z próchnowiskiem;
• Wk – wykrot ze stojącym talerzem korzeni ≥1,2 m;
• S – drzewo stare (ponad 120 lat).

Wskaźnik i jego kalibracja wymagają dalszego testowania (przewodnik).

Dlaczego: drzewa biocenotyczne – obok martwego drewna – charakteryzują naturalność płatu. Wskaźnik jakości.`,
    thresholds: { FV: '>20 szt./ha', U1: '10–20 szt./ha', U2: '<10 szt./ha' },
    inputs: [
      {
        kind: 'table',
        name: 'trees',
        label: 'Drzewa z mikrosiedliskami',
        addLabel: 'Dodaj drzewo',
        rowLabel: 'Drzewo',
        help: 'Jeden wiersz = jedno drzewo. Wpisz kody mikrosiedlisk oddzielone przecinkiem (H, Ob, Os, Rz, Pr, Pk, Dz, DzP, Wk, S). Lista jest opcjonalna, gdy wpisujesz gotowy wynik na hektar.',
        columns: [
          {
            kind: 'text',
            name: 'codes',
            label: 'Kody mikrosiedlisk',
            placeholder: 'np. Os, Dz',
            required: true,
            help: 'Kody mikrosiedlisk na tym drzewie, oddzielone przecinkiem: H, Ob, Os, Rz, Pr, Pk, Dz, DzP, Wk, S. Ten sam kod dwa razy na jednym drzewie liczy się raz.',
          },
          { kind: 'text', name: 'tree', label: 'Drzewo (opcjonalnie)', placeholder: 'np. olsza, 45 cm', help: 'Gatunek drzewa i pierśnica albo inna uwaga pozwalająca odnaleźć drzewo przy kolejnym monitoringu. Opcjonalne.' },
        ],
      },
      {
        kind: 'number',
        name: 'perHa',
        label: 'Mikrosiedlisk na hektar (jeśli policzone bez spisu)',
        unit: 'szt./ha',
        min: 0,
        help: 'Gotowa liczba mikrosiedlisk na hektar. Gdy ją wpiszesz, ma pierwszeństwo przed wyliczeniem ze spisu drzew. Opcjonalne.',
      },
    ],
    suggest: (i, ctx) => {
      const { perHa } = microValue(i, ctx)
      return perHa === undefined ? null : gradeMicrohabitats91XX(perHa)
    },
    explain: (i, ctx) => {
      const { fromList } = microValue(i, ctx)
      if (!fromList) return null
      return `Ze spisu: ${fromList.count} mikrosiedlisk na ${fromList.trees} drzewach, ${haText(fromList.ha)} = ${plNum(fromList.perHa)} szt./ha.`
    },
    warn: (i, ctx) => {
      const unknown = microFromTrees(i.trees, 1).unknown
      return joinText(
        unknown.length ? `Nierozpoznane kody: ${[...new Set(unknown)].join(', ')} – nie są liczone. Dozwolone: ${Object.keys(MICRO_CODES).join(', ')}.` : null,
        woodRuleWarning(ctx),
      )
    },
    describe: (i, ctx) => {
      const { perHa, fromList } = microValue(i, ctx)
      if (perHa === undefined) return ''
      if (!fromList) return `${plNum(perHa)} szt./ha`
      const codes = (Array.isArray(i.trees) ? (i.trees as Record<string, unknown>[]) : [])
        .map((r) => parseMicroCodes(r?.codes).codes.join(', '))
        .filter(Boolean)
      return `${plNum(perHa)} szt./ha (${fromList.count} mikrosiedlisk na ${fromList.trees} drzewach: ${codes.join('; ')})`
    },
  },
  otherDistortions({
    label: 'Inne zniekształcenia, w tym zniszczenia runa i gleby związane z pozyskaniem drewna',
    description:
      'Rozjeżdżanie, wydeptywanie, zaśmiecenie, a także uszkodzenia runa, powierzchni gleby, podszytu, podrostów i zasobów martwego drewna, w tym przy pracach leśnych.',
    help: `Co wybrać i opisać: przekształcenia płatu – rozjeżdżanie (koleiny w torfie), wydeptywanie, zaśmiecenie, a także uszkodzenia runa, powierzchni gleby, podszytu, podrostów i zasobów martwego drewna, w tym spowodowane czynnościami gospodarki leśnej (zrywka, rabatowanie po zrębie). W polu opisu wymień je krótko.

Od monitoringu 2015–2018 to jeden wskaźnik – wcześniej osobno oceniano „zniszczenia runa i gleby związane z pozyskaniem drewna”.

Dlaczego: torf olsu jest miękki – rozjeżdżony długo się nie regeneruje, a koleiny działają jak rowy. Wskaźnik jakości.`,
    thresholds: { FV: 'Brak', U1: 'Występują, lecz mało znaczące', U2: 'Silne' },
  }),
  keySpecies({
    description:
      'Stosować tylko, gdy są dane: np. długosz królewski Osmunda regalis, wiciokrzew pomorski Lonicera periclymenum i woskownica europejska Myrica gale (strefa przymorska).',
    help: `Co wybrać: stan gatunków chronionych, zagrożonych i rzadkich, lokalnie typowych dla olsów i ważnych dla różnorodności biologicznej. W olsach mogą to być np. długosz królewski Osmunda regalis, wiciokrzew pomorski Lonicera periclymenum (strefa przymorska), woskownica europejska Myrica gale (strefa przymorska). Wybór gatunków zależy od lokalnej specyfiki obszaru.

Właściwy stan gatunku: liczebność się nie zmniejsza, ma on odpowiednio duże siedlisko i można oczekiwać, że utrzyma się w przyszłości.

Wskaźnik fakultatywny – gdy brak danych, wybierz „Brak danych” (XX). XX tego wskaźnika nie psuje oceny struktury, bo nie jest kardynalny. W monitoringu 2024 nie oceniono go na 98% stanowisk.`,
  }),
]

export const methodology91XX: Methodology = {
  code: '91XX',
  name: 'Olsy (Carici elongatae-Alnetum)',
  source:
    'Pawlaczyk P. 2015, Olsy (Carici elongatae-Alnetum), [w:] GIOŚ, Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. IV, s. 290–313 (tab. 1 i 2), z erratą z 30.09.2015 i zestawem wskaźników monitoringu 2024',

  siteFields: forestSiteFields({
    code: '91XX',
    transect: '100x40 m',
    releveArea: 200,
    dateWindow: [7, 8],
    overrides: {
      siteName: { placeholder: 'np. Kozi Rynek' },
      communities: {
        hint: 'Np. Ribeso nigri-Alnetum, Sphagno squarrosi-Alnetum.',
        help: `Zbiorowiska roślinne faktycznie występujące na transekcie, nazwami fitosocjologicznymi: Ribeso nigri-Alnetum (= Carici elongatae-Alnetum s.l.), z podzespołami typowym, comaretosum (przejściowy do olsów torfowcowych) i symphytetosum (nawiązujący do łęgów); Sphagno squarrosi-Alnetum (ols torfowcowy). Postać zdegradowaną zaznacz wprost.

Uwaga: olsy torfowcowe z dominacją torfowców (Sphagno squarrosi-Alnetum) klasyfikuje się jako siedlisko 91D0 – wtedy użyj karty 91D0.

Dlaczego: zespół i podzespół wyznaczają punkt odniesienia dla oceny kombinacji florystycznej.`,
      },
      description: {
        rows: 10,
        hint: 'Położenie (dolina, obniżenie, brzeg jeziora), struktura kępowo-dolinkowa, woda, drzewostan, runo, rowy, gospodarka.',
        help: `Syntetyczny opis stanowiska w kilku zdaniach:
• gdzie leży płat: zatorfiona dolina, starorzecze, obniżenie, brzeg jeziora; czym są wyznaczone jego granice;
• struktura kępowo-dolinkowa i woda: czy w dolinkach stagnuje woda, jak długo;
• drzewostan: gatunki, wiek, starodrzew, odnowienia (olsza odnawia się często wegetatywnie albo na kłodach – „nurse logs”);
• runo: gatunki bagienne w dolinkach, leśne na kępach, obecność gatunków łąkowych i obcych;
• rowy, drogi, groble, gospodarka leśna, ochrona.

Dlaczego: opis pozwala kolejnemu obserwatorowi zrozumieć punkt odniesienia i przyczyny zmian. Olsy mogą zmieniać się szybko, gdy zmienią się warunki wodne.`,
      },
      areaHa: {
        help: `Powierzchnia płatu olsu na stanowisku, w hektarach – nie powierzchnia transektu (0,4 ha) ani całego kompleksu leśnego. Najlepiej z GIS (ortofotomapa, leśna mapa gospodarcza; w Lasach Państwowych olsom odpowiada najczęściej siedliskowy typ lasu Ol) albo z kartowania granic odbiornikiem GPS.

Dlaczego: zmiana powierzchni płatu między obserwacjami to podstawa parametru „Powierzchnia siedliska”.`,
      },
      transect: {
        help: `Faktyczne wymiary transektu. Standard dla olsów to linia 100 m z pasem po 20 m z każdej strony – razem 100×40 m, czyli 0,4 ha. Gdy taki transekt nie mieści się w płacie, można go skrócić, ale wtedy wskaźniki opisuje się na odpowiednio szerszym pasie, żeby zachować 0,4 ha. Jeżeli wymuszają to warunki terenowe, transekt można załamać w połowie długości.

Dlaczego: formularz bierze z tego pola powierzchnię do przeliczania martwego drewna i mikrosiedlisk na hektar. Wpisz faktyczne wymiary w postaci „100x40 m”.`,
      },
      altitude: { placeholder: 'np. 120–132' },
      date: {
        placeholder: 'DD.MM.RRRR, np. 07.08.2013',
        help: `Dzień obserwacji w terenie. Optymalny termin to lato (lipiec–sierpień), choć do zarejestrowania zmienności warunków wodnych potrzebna jest w zasadzie całoroczna obserwacja. Olsy są fenologicznie spóźnione – lato w olsach Puszczy Białowieskiej zaczyna się ok. 10 lipca, w łęgach ok. 5 czerwca.

Dlaczego: przed lipcem runo dolinek bywa nierozwinięte. Badanie powtarza się co najmniej raz na 5–6 lat, optymalnie co 3 lata.`,
      },
    },
  }),

  releves: {
    defaultCount: 3,
    intro:
      'Metodyka przewiduje trzy typowe zdjęcia fitosocjologiczne na transekcie – na początku, w środku i na końcu – każde o powierzchni 200 m², w skali Braun-Blanqueta. Gdy zdjęcie obejmuje kępy i dolinki, ujmij oba mikrosiedliska.',
    fields: forestReleveFields({
      area: 200,
      helps: {
        coords: 'Współrzędne GPS środka powierzchni zdjęcia (200 m²). Zdjęcia robi się na początku, w środku i na końcu transektu.\n\nDlaczego: zdjęcia powtarza się dokładnie w tych samych miejscach – to najdokładniejszy zapis zmian roślinności.',
        coverA: 'Warstwa A – drzewostan: olsza czarna, czasem brzoza omszona, sosna, świerk. Procent powierzchni zdjęcia przykryty koronami drzew, w rzucie pionowym.',
        coverB: 'Warstwa B – podszyt i podrost: porzeczka czarna, kruszyna, czeremcha, jarząb, młode olsze (często odrośla z szyi korzeniowej).',
        coverC: 'Warstwa C – runo: gatunki bagienne w dolinkach i leśne na kępach.\n\nDlaczego: w runie najlepiej widać, czy płat jest nadal olsem, czy przesycha (gatunki łąkowe, pokrzywa) albo jest stale zalany (pleustofity).',
        coverD: 'Warstwa D – mszysta: mchy na kępach i kłodach, torfowce. W typowych olsach zwykle słabo rozwinięta.',
        unit: 'Zespół albo zbiorowisko, do którego należy zdjęcie, np. „Ribeso nigri-Alnetum”.\n\nDlaczego: łączy zdjęcie z opisem zbiorowisk stanowiska i pozwala śledzić zmiany.',
      },
    }),
  },

  indicators,

  prospects: {
    description:
      'Czy ols utrzyma się w stanie niepogorszonym w perspektywie 10–20 lat: status w ewidencji gruntów, plan urządzenia lasu, rębnie (zupełna jest dla olsu drastyczna), neofityzacja, trendy wskaźników, rowy.',
    help: `Oceniając perspektywy ochrony w przyszłości, zwróć uwagę:
• czy ols w ewidencji gruntów jest lasem (te same regulacje gospodarki leśnej), czy inaczej – wtedy rozważ konsekwencje;
• jakie zapisy dla płatu zaproponowano w planie urządzenia lasu (Lasy Państwowe) albo analogicznych dokumentach;
• czy płat jest objęty gospodarką leśną i jaka to praktyka: czy olsy podlegają użytkowaniu rębnemu i jaką rębnią (często stosowana rębnia zupełna jest dla ekosystemu drastyczna), jak mają się powierzchnie zrębowe do wielkości biochor;
• w płatach nie będących formalnie lasem: czy ols jest użytkowany, czy wycinane są drzewa i z jakim natężeniem;
• narażenie na neofityzację, inne przewidywane presje (nowe rowy, udrażnianie istniejących, pobór wody);
• aktualne trendy poszczególnych wskaźników, jeśli są znane.

Dlaczego: perspektywy to osobny parametr oceny ogólnej. Ols w złym stanie, ale z planowanym zatamowaniem rowów, wymaga innych decyzji niż taki, który dalej jest odwadniany.`,
    thresholds: {
      FV: 'Brak zagrożeń i negatywnych trendów. Zachowanie siedliska w stanie niepogorszonym w perspektywie 10–20 lat jest niemal pewne',
      U1: 'Zachowanie siedliska w stanie niepogorszonym w perspektywie 10–20 lat nie jest pewne, ale jest prawdopodobne, o ile uda się zapobiec istniejącym zagrożeniom',
      U2: 'Zachowanie siedliska w stanie niepogorszonym w perspektywie 10–20 lat będzie bardzo trudne: zaawansowane procesy recesji, silne negatywne trendy lub znaczne zagrożenia',
    },
  },

  impactCodes: [
    ...FOREST_IMPACT_CODES.filter((c) => c.code !== 'F04'),
    { code: 'H01.05', name: 'Rozproszone zanieczyszczenie wód powierzchniowych spowodowane działalnością rolniczą i leśną' },
    { code: 'J02.01.02', name: 'Osuszanie terenów morskich, ujściowych, bagiennych' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód – ogólnie' },
    { code: 'J02.07', name: 'Pobór wód gruntowych' },
    { code: 'K01.03', name: 'Wyschnięcie' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. rzadkie gatunki, sąsiedztwo innych siedlisk (91E0, 91D0, 7140).',
        help: `Wartości przyrodnicze stanowiska poza samym olsem: rzadkie i chronione gatunki (rośliny, porosty, ptaki), sąsiedztwo innych siedlisk (łęgi 91E0, bory i lasy bagienne 91D0, torfowiska 7140), funkcja ostoi. Brak informacji – „Nie pozyskano danych”.

Dlaczego: olsy zwykle tworzą kompleks z innymi siedliskami hydrogenicznymi. Planując ochronę (np. tamowanie rowów), trzeba wiedzieć, co jeszcze się na nich odbije.`,
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: `Jakie działania ochronne wykonano (kiedy, kto, w jakiej skali) i co proponujesz: tamowanie odpływu wody rowami, powstrzymanie się od udrażniania rowów, wyłączenie z użytkowania, pozostawianie martwego drewna, usuwanie gatunków obcych. Do tego ocena skuteczności poparta obserwacjami. Brak działań – „Nie prowadzi się”.

Dlaczego: monitoring ma odpowiedzieć, czy ochrona działa. Za najważniejsze dla olsów uznaje się poprawę, utrzymanie i stabilizację warunków wodnych.`,
      }
    return f
  }),

  speciesCatalog: SPECIES_91XX.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer91XX(s) })),
  speciesInfo: (name) => {
    const e = findSpecies91XX(name)
    return e ? GROUP_LABELS_91XX[e.group] : undefined
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator91XX = (id: string): IndicatorDef => {
  const i = methodology91XX.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 91XX`)
  return i
}
