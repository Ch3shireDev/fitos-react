// Metodyka 3150 (starorzecza i naturalne eutroficzne zbiorniki wodne ze zbiorowiskami z Nympheion, Potamion) jako dane.
// Źródło: Wilk-Woźniak E., Gąbka M., Pęczuła W. i in. 2012, „3150 Starorzecza i naturalne eutroficzne zbiorniki wodne…”
// [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 130–149 (tab. 1 i 2),
// z praktyką oceny ze sprawozdań z monitoringu 2016–2018 i 2024 (cykl 2023–2025, metodyka „wraz z aktualizacją”):
//  • wskaźniki kardynalne: 4 (kombinacja zbiorowisk, gatunki degeneracji, konduktywność, przezroczystość) – barwa wody,
//    w przewodniku 2012 kardynalna, w cyklu 2023–2025 jest już wskaźnikiem zwykłym (sprawozdanie 2024, tab. 2–3);
//  • odczyn i plankton – pomocnicze (liczą się do oceny struktury jako niekardynalne);
//  • plankton = jedna łączna ocena fito- i zooplanktonu, gorsza z dwóch.
// Siedlisko wodne: transekt 10×100 m, pomiary wody w najgłębszym (centralnym) miejscu zbiornika, opłynięcie zbiornika.
// Z modułu leśnego brane są tylko klocki generyczne (choiceIndicator, selecty z oceną, listy gatunków) – nic leśnego.
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { choiceIndicator, labelOf, pickField, plNum, speciesInput, type GradedOption } from '../../forest'
import { GROUP_LABELS_3150, SPECIES_3150, defaultLayer3150, findSpecies3150, isRareName, type SpeciesGroup3150 } from './species'

// ---------- progi liczbowe (tab. 2) ----------

/** Konduktywność: ≤600 µS/cm FV, 600–900 U1, >900 U2 (tab. 2: „600–899” i „>900” – 899–900 domyka się do U1). */
export const gradeConductivity3150 = (c: number): Grade => (c <= 600 ? 'FV' : c <= 900 ? 'U1' : 'U2')

/**
 * Przezroczystość (krążek Secchiego): do dna albo >2,5 m FV; 1,0–2,5 m U1; <1,0 m U2.
 * „W przypadku jezior bardzo płytkich widzialność krążka nie sięgająca dna” – U1: gdy zbiornik ma <1 m głębokości,
 * krążek z definicji nie zejdzie poniżej 1 m, więc brak widoczności dna daje U1, a nie U2 (interpretacja).
 */
export function gradeSecchi3150(secchi: number | undefined, toBottom: boolean, maxDepth?: number): Grade | null {
  if (toBottom) return 'FV'
  if (secchi === undefined) return null
  if (secchi > 2.5) return 'FV'
  if (secchi >= 1) return 'U1'
  return maxDepth !== undefined && maxDepth < 1 ? 'U1' : 'U2'
}

/** Odczyn: pH 6,5–7,9 FV, 8,0–9,0 U1, >9,0 U2. Luka 7,9–8,0 → FV; poniżej 6,5 tab. 2 milczy – U1 (interpretacja). */
export const gradePH3150 = (ph: number): Grade => (ph > 9 ? 'U2' : ph >= 8 ? 'U1' : ph >= 6.5 ? 'FV' : 'U1')

/** Zooplankton: udział gatunków eutroficznych <5% FV, 5–50% U1, >50% U2. */
export const gradeZooplankton3150 = (share: number): Grade => (share < 5 ? 'FV' : share <= 50 ? 'U1' : 'U2')

const ORDER: Grade[] = ['FV', 'U1', 'U2']
/** Gorsza z dwóch ocen (plankton: „jeśli oceny obu składowych różnią się, przyjmuje się niższą”). */
export const worseGrade = (a: Grade, b: Grade): Grade => (ORDER.indexOf(a) >= ORDER.indexOf(b) ? a : b)

// ---------- podtyp ----------

export const SUBTYPES: SelectOption[] = [
  { value: '3150-1', label: '3150-1 Jeziora eutroficzne' },
  { value: '3150-2', label: '3150-2 Eutroficzne starorzecza i naturalne, drobne zbiorniki wodne' },
]
/** Próg pokrycia pleustofitów: jeziora 25%, starorzecza i drobne zbiorniki 50%. Bez podtypu – próg jeziorny. */
export const pleustoLimit3150 = (subtype: unknown) => (subtype === '3150-2' ? 50 : 25)

// ---------- charakterystyczna kombinacja zbiorowisk ----------

const YES_NO: SelectOption[] = [
  { value: 'yes', label: 'Tak' },
  { value: 'no', label: 'Nie' },
]

export interface CombinationFacts {
  nymph?: boolean
  elod?: boolean
  /** Pokrycie lustra wody przez pleustofity, %. */
  pleusto?: number
  /** Udział rogatka sztywnego w zbiorowiskach elodeidów, %. */
  cerato?: number
  fragmentary: boolean
  /** Nazwy gatunków rzadkich/chronionych (albo „tak”, gdy wybrano ręcznie). */
  rare: string[]
  /** Skąd wzięto fakty: wybór w selectach czy lista gatunków. */
  derived: string[]
}

const round1 = (n: number) => Math.round(n * 10) / 10
const yn = (v: unknown): boolean | undefined => (v === 'yes' ? true : v === 'no' ? false : undefined)

/** Fakty do oceny kombinacji: najpierw wybory w polach, a puste pola – z listy gatunków transektu. */
export function combinationFacts(i: InputValues): CombinationFacts {
  const rows = speciesRows(i.species).filter((r) => r.name?.trim())
  const groupOf = (n: string): SpeciesGroup3150 | undefined => findSpecies3150(n)?.group
  const inGroup = (g: SpeciesGroup3150) => rows.filter((r) => groupOf(r.name) === g)
  const sumCover = (rs: typeof rows) => {
    const c = rs.map((r) => num(r.cover)).filter((v): v is number => v !== undefined)
    return c.length ? round1(c.reduce((a, b) => a + b, 0)) : undefined
  }
  const derived: string[] = []

  let nymph = yn(i.nymphaeids)
  if (nymph === undefined && rows.length) {
    nymph = inGroup('nymphaeid').length > 0
    derived.push('nymfeidy')
  }
  let elod = yn(i.elodeids)
  if (elod === undefined && rows.length) {
    elod = inGroup('elodeid').length > 0
    derived.push('elodeidy')
  }
  let pleusto = num(i.pleustoCover)
  if (pleusto === undefined && inGroup('pleustophyte').length) {
    pleusto = sumCover(inGroup('pleustophyte'))
    if (pleusto !== undefined) derived.push('pokrycie pleustofitów')
  }
  let cerato = num(i.ceratoShare)
  if (cerato === undefined) {
    const elodRows = inGroup('elodeid')
    const all = sumCover(elodRows)
    const ce = sumCover(elodRows.filter((r) => findSpecies3150(r.name)?.latin === 'Ceratophyllum demersum'))
    if (all && ce !== undefined) {
      cerato = Math.round((ce / all) * 100)
      derived.push('udział rogatka')
    }
  }
  let rare: string[] = []
  if (i.rare === 'yes') rare = ['tak']
  else if (i.rare !== 'no') {
    rare = rows.map((r) => r.name.trim()).filter(isRareName)
    if (rare.length) derived.push('gatunki rzadkie')
  }
  return { nymph, elod, pleusto, cerato, fragmentary: i.fragmentary === 'yes', rare, derived }
}

/**
 * Tab. 2:
 * FV – duża różnorodność, obecne nymfeidy i elodeidy, pleustofity ≤25% (jeziora) / ≤50% (starorzecza);
 * U1 – brak nymfeidów albo elodeidów, albo obie grupy, ale rogatek sztywny >25% w zbiorowiskach elodeidów;
 *      pleustofity powyżej progu;
 * U2 – jedno zbiorowisko nymfeidów lub elodeidów jednogatunkowe (kadłubowe), fragmentaryczne;
 * wyjątek: zbiorowisko z gatunkiem chronionym lub rzadkim (salwinia, kotewka, grzybieńczyk, pływacze) – FV.
 * Brak obu grup naraz (same pleustofity albo nic) – U2 (interpretacja: gorzej niż „brak jednej z grup”).
 */
export function gradeCombination3150(f: CombinationFacts, subtype: unknown): Grade | null {
  if (f.rare.length) return 'FV'
  if (f.fragmentary) return 'U2'
  if (f.nymph === undefined || f.elod === undefined) return null
  if (!f.nymph && !f.elod) return 'U2'
  if (!f.nymph || !f.elod) return 'U1'
  if (f.cerato !== undefined && f.cerato > 25) return 'U1'
  if (f.pleusto !== undefined && f.pleusto > pleustoLimit3150(subtype)) return 'U1'
  return 'FV'
}

function describeCombination(i: InputValues): string {
  const f = combinationFacts(i)
  const presence =
    f.nymph === undefined || f.elod === undefined
      ? ''
      : f.nymph && f.elod
        ? 'Obecne nymfeidy i elodeidy'
        : f.nymph
          ? 'Obecne nymfeidy, brak elodeidów'
          : f.elod
            ? 'Obecne elodeidy, brak nymfeidów'
            : 'Brak nymfeidów i elodeidów'
  const rareText = f.rare.length ? (f.rare[0] === 'tak' ? 'Zbiorowisko z gatunkiem chronionym lub rzadkim' : `Zbiorowisko z gatunkiem rzadkim: ${f.rare.join(', ')}`) : ''
  return [
    presence,
    f.fragmentary ? 'Jedno zbiorowisko jednogatunkowe (kadłubowe), wykształcone fragmentarycznie' : '',
    f.cerato !== undefined ? `Rogatek sztywny ${plNum(f.cerato)}% w zbiorowiskach elodeidów` : '',
    f.pleusto !== undefined ? `Pleustofity pokrywają ok. ${plNum(f.pleusto)}% powierzchni lustra wody` : '',
    rareText,
    describeSpecies(speciesRows(i.species)),
  ]
    .filter(Boolean)
    .join('. ')
}

// ---------- gatunki wskazujące na degenerację ----------

const ALIEN_ABUNDANCE: GradedOption[] = [
  { value: 'single', label: 'Pojedyncze osobniki', grade: 'U1' },
  { value: 'many', label: 'Liczne', grade: 'U2' },
]

/** Wpisane gatunki degeneracji bez moczarki kanadyjskiej (tab. 2 każe jej nie brać pod uwagę). */
export function degenerationNames(value: unknown): { counted: string[]; ignored: string[] } {
  const names = speciesRows(value)
    .map((r) => r.name?.trim())
    .filter((n): n is string => Boolean(n))
  const isIgnored = (n: string) => findSpecies3150(n)?.alien === 'ignored'
  return { counted: names.filter((n) => !isIgnored(n)), ignored: names.filter(isIgnored) }
}

export function gradeDegeneration3150(i: InputValues): Grade | null {
  const { counted } = degenerationNames(i.species)
  if (!counted.length) return 'FV'
  return ALIEN_ABUNDANCE.find((o) => o.value === i.abundance)?.grade ?? null
}

// ---------- barwa, plankton ----------

const COLOUR: GradedOption[] = [
  { value: 'fv', label: 'Słabo zielona, słabo przezroczysta, brązowawo-przezroczysta', grade: 'FV' },
  { value: 'green', label: 'Wyraźnie zielone zabarwienie', grade: 'U1' },
  { value: 'bluegreen', label: 'Widoczne sinozielone zabarwienie – jak rozlana farba olejna na powierzchni wody', grade: 'U2' },
]

export const PHYTO: GradedOption[] = [
  { value: 'green', label: 'Dominacja zielenic', grade: 'FV' },
  { value: 'other', label: 'Dominacja innych grup (okrzemki, kryptofity, bruzdnice, złotowiciowce) – z wyjątkiem sinic', grade: 'FV' },
  { value: 'codominance', label: 'Współdominacja sinic i zielenic', grade: 'U1' },
  { value: 'cyano', label: 'Dominacja sinic nitkowatych lub z rodzaju Microcystis, Woronichinia; długotrwałe zakwity sinicowe', grade: 'U2' },
]

export function planktonGrades(i: InputValues): { phyto: Grade | null; zoo: Grade | null } {
  const phyto = PHYTO.find((o) => o.value === i.phyto)?.grade ?? null
  const share = num(i.zooEutrophic)
  return { phyto, zoo: share === undefined ? null : gradeZooplankton3150(share) }
}

// ---------- pomoc ----------

const WATER_POINT = `Gdzie mierzyć: w centralnej, najgłębszej części zbiornika (albo wydzielonego obszaru jeziora), z warstwy podpowierzchniowej 0,5–1,0 m. W tym samym punkcie mierzysz barwę, przezroczystość, przewodnictwo i pH oraz pobierasz plankton.`

const SUBTYPE_NOTE = `Sprawozdanie 2016–2018 zwraca uwagę, że w starorzeczach (3150-2), często naturalnie mętnych i zasilanych wodami podziemnymi, wskaźniki wody bywają mało miarodajne. Progi i kardynalność są jednak wspólne dla obu podtypów (tak oceniano też w 2024 r.). Okoliczności zapisz w uwagach.`

// ---------- wskaźniki ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie uległa zmianom albo się zwiększa', grade: 'FV' },
  { value: 'decrease', label: 'Zmniejsza się (zarastanie, wypłycanie, zamulanie, fragmentacja)', grade: 'U1' },
  { value: 'loss', label: 'Zanik siedliska (całkowite zarośnięcie, wyschnięcie, zasypanie)', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania (pierwsze badanie)', grade: 'XX' },
]

const indicators: IndicatorDef[] = [
  {
    ...choiceIndicator({
      id: 'area',
      label: 'Powierzchnia siedliska',
      parameter: 'area',
      description:
        'Czy powierzchnia siedliska (otwartego lustra wody z roślinnością wodną) na stanowisku zmieniła się od poprzedniego badania: zarastanie brzegów, wypłycanie, fragmentacja, zanik.',
      help: `Co wybrać: kierunek zmian powierzchni siedliska na stanowisku od poprzedniego badania (poprzednia karta, ortofotomapa, dane archiwalne). Przewodnik każe ocenić „zarastanie brzegów jeziora lub starorzecza, wypłycanie, fragmentację siedliska”, ale nie podaje progów – formularz stosuje praktykę z monitoringu:
• bez zmian albo wzrost – FV (przykład z przewodnika: „Powierzchnia nie uległa zmianom”);
• zmniejszanie się przez zarastanie szuwarem, wypłycanie, zamulanie – U1;
• zanik (całkowite zarośnięcie, wyschnięcie, zasypanie) – U2;
• pierwsze badanie, nie ma z czym porównać – XX.

Starorzecze przedzielone groblą albo rozpadające się na części przez zarastanie – każdą część traktuj jako osobne stanowisko.

Dlaczego: starorzecza i drobne zbiorniki naturalnie zarastają i zanikają; tempo tego procesu (przyspieszone obniżeniem wód gruntowych i rzecznych) mówi o stanie siedliska.`,
      options: AREA,
      inputLabel: 'Zmiana powierzchni siedliska',
      thresholds: {
        FV: 'Powierzchnia nie uległa zmianom albo się zwiększa',
        U1: 'Powierzchnia zmniejsza się (zarastanie, wypłycanie, zamulanie)',
        U2: 'Zanik siedliska na stanowisku',
      },
      after: [
        { kind: 'number', name: 'areaHa', label: 'Powierzchnia (opcjonalnie)', unit: 'ha', min: 0, help: 'Powierzchnia siedliska na stanowisku, jeśli ją znasz – trafi do pola „wartość”. Opcjonalne.' },
      ],
    }),
    describe: (i) => {
      const ha = num(i.areaHa)
      return [labelOf(AREA, i.choice), ha !== undefined ? `${plNum(ha)} ha` : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'combination',
    label: 'Charakterystyczna kombinacja zbiorowisk w obrębie transektu',
    parameter: 'structure',
    cardinal: true,
    description:
      'Występowanie i stan zbiorowisk roślin wodnych charakterystycznych dla siedliska w reprezentatywnym transekcie: nymfeidy, elodeidy, pleustofity (bez zbiorowisk szuwarowych i turzycowych).',
    help: `Co ustalić w transekcie (bez szuwaru i turzycowisk):
• czy są nymfeidy – zakorzenione rośliny o liściach pływających (grążel, grzybienie, rdestnica pływająca, rdest ziemnowodny, grzybieńczyk, kotewka);
• czy są elodeidy – rośliny zanurzone (rdestnice, wywłóczniki, rogatki, moczarka, jezierza, włosieniczniki);
• jaki procent lustra wody pokrywają pleustofity – drobne rośliny wolno pływające (rzęsy, spirodela, wolffia, salwinia, żabiściek);
• jaki jest udział rogatka sztywnego w zbiorowiskach elodeidów;
• czy jest tylko jedno zbiorowisko jednogatunkowe (kadłubowe), wykształcone fragmentarycznie;
• czy jest zbiorowisko z gatunkiem chronionym lub rzadkim: salwinia pływająca, kotewka orzech wodny, grzybieńczyk wodny, pływacze (Utricularia spp.).

Możesz wypełnić same pola wyboru albo wpisać listę gatunków z pokryciem – puste pola formularz uzupełni z listy (grupy z katalogu, suma pokrycia pleustofitów, udział rogatka w pokryciu elodeidów, gatunki rzadkie).

Progi (tab. 2): FV – obecne nymfeidy i elodeidy, pleustofity do 25% w jeziorach i do 50% w starorzeczach; U1 – brak jednej z grup, rogatek >25% w zbiorowiskach elodeidów albo pleustofity powyżej progu; U2 – jedno zbiorowisko jednogatunkowe, fragmentaryczne. Zbiorowisko z gatunkiem chronionym lub rzadkim – zawsze FV. Brak obu grup naraz formularz traktuje jak U2 (interpretacja).

W regionie alpejskim struktura roślinności jest naturalnie uboższa – sprawozdanie 2024 zaznacza, że U1 wynika tam z metodyki, niekoniecznie ze złego stanu.

Wskaźnik kardynalny. Transekt jest stały (współrzędne z poprzedniego badania); przy przesunięciu zanotuj nowe współrzędne.`,
    thresholds: {
      FV: 'Duża różnorodność fitocenotyczna zbiorowisk, obecne nymfeidy i elodeidy; pleustofity drobne obecne lub nie (w jeziorach do 25%, w starorzeczach do 50% pokrycia powierzchni)',
      U1: 'Brak nymfeidów lub elodeidów lub obecne obie grupy, ale w zbiorowiskach elodeidów rogatek sztywny >25%; pleustofity >25% (jeziora) / >50% (starorzecza)',
      U2: 'Jedno zbiorowisko nymfeidów lub elodeidów składające się z jednego gatunku (kadłubowe), wykształcone fragmentarycznie; zbiorowisko z gatunkiem chronionym lub rzadkim (salwinia, kotewka, grzybieńczyk, pływacze) pozostaje FV',
    },
    inputs: [
      { kind: 'select', name: 'nymphaeids', label: 'Nymfeidy obecne', options: YES_NO, help: 'Zakorzenione rośliny o liściach pływających: Nuphar lutea, Nymphaea alba, Potamogeton natans, Polygonum amphibium, Nymphoides peltata, Trapa natans. Puste – formularz sprawdzi listę gatunków.' },
      { kind: 'select', name: 'elodeids', label: 'Elodeidy obecne', options: YES_NO, help: 'Rośliny zanurzone: rdestnice (Potamogeton), wywłóczniki (Myriophyllum), rogatki (Ceratophyllum), moczarki (Elodea), jezierza (Najas), włosieniczniki (Batrachium). Puste – formularz sprawdzi listę gatunków.' },
      { kind: 'number', name: 'pleustoCover', label: 'Pokrycie lustra wody przez pleustofity', unit: '%', min: 0, max: 100, help: 'Jaki procent powierzchni lustra wody pokrywają rzęsy, spirodela, wolffia, salwinia, żabiściek. Próg: 25% w jeziorach, 50% w starorzeczach i drobnych zbiornikach (podtyp z zakładki Stanowisko). Puste – suma pokrycia pleustofitów z listy.' },
      { kind: 'number', name: 'ceratoShare', label: 'Udział rogatka sztywnego w zbiorowiskach elodeidów', unit: '%', min: 0, max: 100, help: 'Jaką część zbiorowisk roślin zanurzonych stanowi rogatek sztywny Ceratophyllum demersum. Powyżej 25% – U1 (gatunek odporny na eutrofizację, wypiera inne). Puste – udział rogatka w łącznym pokryciu elodeidów z listy.' },
      { kind: 'select', name: 'fragmentary', label: 'Tylko jedno zbiorowisko jednogatunkowe (kadłubowe)', options: YES_NO, help: 'Tak, gdy w transekcie jest jedno zbiorowisko nymfeidów albo elodeidów złożone z jednego gatunku, wykształcone fragmentarycznie – to U2 (chyba że to zbiorowisko gatunku chronionego lub rzadkiego).' },
      { kind: 'select', name: 'rare', label: 'Zbiorowisko z gatunkiem chronionym lub rzadkim', options: YES_NO, help: 'Salwinia pływająca, kotewka orzech wodny, grzybieńczyk wodny, pływacze (Utricularia spp.). Takie zbiorowisko utrzymuje FV. Puste – formularz sprawdzi listę gatunków.' },
      speciesInput('Gatunki roślin wodnych w transekcie (opcjonalnie)', 'Rośliny wodne stwierdzone w transekcie, z pokryciem w % powierzchni transektu. Z listy formularz uzupełnia puste pola powyżej: obecność nymfeidów i elodeidów, pokrycie pleustofitów, udział rogatka, gatunki rzadkie.'),
    ],
    suggest: (i, ctx) => gradeCombination3150(combinationFacts(i), ctx?.site?.subtype),
    explain: (i, ctx) => {
      const f = combinationFacts(i)
      const parts: string[] = []
      if (f.derived.length) parts.push(`Z listy gatunków: ${f.derived.join(', ')}.`)
      if (f.pleusto !== undefined) {
        const limit = pleustoLimit3150(ctx?.site?.subtype)
        parts.push(`Próg pleustofitów ${limit}%${ctx?.site?.subtype ? '' : ' (podtyp nie wybrany – próg jeziorny)'}.`)
      }
      return parts.length ? parts.join(' ') : null
    },
    warn: (i) => {
      const f = combinationFacts(i)
      return f.rare.length && f.rare[0] !== 'tak' && i.fragmentary === 'yes'
        ? 'Zbiorowisko jednogatunkowe, ale z gatunkiem rzadkim – tab. 2 zostawia wtedy FV.'
        : null
    },
    describe: (i) => describeCombination(i),
  },
  {
    id: 'degeneration',
    label: 'Gatunki wskazujące na degenerację siedliska',
    parameter: 'structure',
    cardinal: true,
    description:
      'Gatunki inwazyjne i/lub obce dla zbiorowisk roślin wodnych w transekcie. Moczarki kanadyjskiej Elodea canadensis nie bierze się pod uwagę.',
    help: `Co wpisać: obce i inwazyjne gatunki w zbiorowiskach roślin wodnych transektu (i zauważone przy opływaniu zbiornika), a potem ich liczebność. Pusta lista – FV.

Typowe w monitoringu 2024: moczarka delikatna Elodea nuttallii (Jezioro Mikołajskie, Dolna Wisła, Dolna Odra), azolla drobna Azolla filiculoides; w planktonie także sinica Raphidiopsis raciborskii i haptofit Prymnesium parvum (opisz je raczej przy planktonie).

Moczarka kanadyjska Elodea canadensis jest obca, ale tab. 2 każe jej nie brać pod uwagę – formularz ją pomija nawet, gdy ją wpiszesz.

Progi: brak – FV; pojedyncze osobniki – U1; liczne – U2. Wskaźnik kardynalny (w latach 2009–2011 nazywał się „Gatunki inwazyjne i/lub obce dla zbiorowisk makrofitów”).`,
    thresholds: {
      FV: 'Brak gatunków obcych i inwazyjnych (dopuszcza się obecność moczarki kanadyjskiej Elodea canadensis)',
      U1: 'Gatunek lub gatunki obce i inwazyjne obecne jako pojedyncze osobniki (nie bierze się pod uwagę moczarki kanadyjskiej)',
      U2: 'Gatunki lub gatunek obcy liczne, obecne gatunki inwazyjne (nie bierze się pod uwagę moczarki kanadyjskiej)',
    },
    inputs: [
      speciesInput('Gatunki obce i inwazyjne', 'Gatunki obce i inwazyjne w transekcie, np. Elodea nuttallii, Azolla filiculoides. Pokrycie opcjonalne. Pusta lista – brak, FV.'),
      { kind: 'select', name: 'abundance', label: 'Liczebność', options: ALIEN_ABUNDANCE.map(({ value, label }) => ({ value, label })), help: 'Pojedyncze osobniki – U1, liczne – U2. Wybierz, gdy lista nie jest pusta.' },
    ],
    suggest: (i) => gradeDegeneration3150(i),
    explain: (i) => {
      const { ignored } = degenerationNames(i.species)
      return ignored.length ? 'Moczarka kanadyjska pominięta (tab. 2).' : null
    },
    warn: (i, ctx) => {
      const listed = new Set(degenerationNames(i.species).counted.map((n) => findSpecies3150(n)?.latin ?? n))
      const inTransect = speciesRows(ctx?.indicators?.combination?.inputs?.species)
        .map((r) => findSpecies3150(r.name ?? ''))
        .filter((s) => s?.alien === 'yes' && !listed.has(s.latin))
        .map((s) => s!.latin)
      if (inTransect.length) return `W liście gatunków transektu są gatunki obce: ${inTransect.join(', ')} – dopisz je tutaj.`
      return degenerationNames(i.species).counted.length && !i.abundance ? 'Wybierz liczebność gatunków obcych.' : null
    },
    describe: (i) => {
      const { counted } = degenerationNames(i.species)
      if (!counted.length) return 'Brak'
      const ab = labelOf(ALIEN_ABUNDANCE, i.abundance).toLowerCase()
      return `${describeSpecies(speciesRows(i.species).filter((r) => counted.includes(r.name?.trim())))}${ab ? ` – ${ab}` : ''}`
    },
  },
  {
    id: 'conductivity',
    label: 'Konduktywność (przewodnictwo elektrolityczne)',
    parameter: 'structure',
    cardinal: true,
    description: 'Przewodnictwo elektrolityczne wody (µS/cm) – miara zawartości jonów, w tym zanieczyszczeń ze ścieków i spływów z pól.',
    help: `Co wpisać: przewodnictwo elektrolityczne wody zmierzone konduktometrem (sondą), w µS/cm.

${WATER_POINT}

Progi: ≤600 µS/cm FV, 600–900 U1, >900 U2. Tab. 2 podaje U1 jako „600–899” – wartości między 899 a 900 formularz liczy jako U1 (sprawozdanie 2016–2018 proponuje zresztą zapis „>600 U1, >900 U2”).

Uwaga: pomiar jest chwilowy i zależy od opadów i stanu wód. W starorzeczach zasilanych zasolonymi wodami podziemnymi (i w pobliżu dużych miast) wysokie przewodnictwo bywa naturalne – zapisz to w uwagach. ${SUBTYPE_NOTE}

Dlaczego: zanieczyszczenia ulegające dysocjacji (ścieki, nawozy) podnoszą przewodnictwo. Wskaźnik kardynalny.`,
    thresholds: { FV: '≤600 µS/cm', U1: '600–899 µS/cm', U2: '>900 µS/cm' },
    inputs: [{ kind: 'number', name: 'value', label: 'Przewodnictwo elektrolityczne', unit: 'µS/cm', min: 0, help: 'W µS/cm, z sondy, w najgłębszym miejscu zbiornika, 0,5–1,0 m pod powierzchnią. mS/cm przelicz ×1000. Gdy pomiar był niemożliwy – zostaw puste, opisz powód w „wartości” i wybierz XX.' }],
    suggest: (i) => {
      const v = num(i.value)
      return v === undefined ? null : gradeConductivity3150(v)
    },
    warn: (i) => {
      const v = num(i.value)
      return v !== undefined && v > 0 && v < 5 ? 'Poniżej 5 µS/cm – to raczej mS/cm. Przelicz ×1000.' : null
    },
    describe: (i) => {
      const v = num(i.value)
      return v === undefined ? '' : `${plNum(v)} µS/cm`
    },
  },
  {
    id: 'secchi',
    label: 'Przezroczystość wody',
    parameter: 'structure',
    cardinal: true,
    description: 'Widzialność krążka Secchiego. Słaba przezroczystość ogranicza rozwój roślinności zanurzonej – to efekt silnego rozwoju fitoplanktonu albo zawiesiny.',
    help: `Co wpisać: głębokość, na której biały krążek Secchiego (20–30 cm średnicy) przestaje być widoczny, w metrach; zaznacz, czy krążek był widoczny aż do dna. Opcjonalnie głębokość zbiornika w punkcie pomiaru.

${WATER_POINT}

Progi (tab. 2): widzialność do dna albo powyżej 2,5 m – FV; 1,0–2,5 m – U1; poniżej 1,0 m – U2. Wyjątek z tab. 2: w bardzo płytkich zbiornikach krążek niesięgający dna to U1 – formularz stosuje go, gdy głębokość zbiornika jest mniejsza niż 1 m (interpretacja; wtedy krążek fizycznie nie zejdzie niżej). Przykład z przewodnika: 1,0 m, widzialność do dna – FV.

${SUBTYPE_NOTE} Sprawozdanie 2016–2018 proponowało dla starorzeczy łagodniejsze progi (do dna lub >1,5 m FV; 0,8–1,5 m U1; <0,8 m U2) – nie zostały wprowadzone, formularz ich nie stosuje.

Dlaczego: przezroczystość mówi o dostępności światła dla roślin zanurzonych i o stopniu eutrofizacji. Zmienia się nawet w ciągu roku – pojedynczy pomiar to migawka. Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Widzialność krążka Secchiego do dna lub powyżej 2,5 m',
      U1: '1,0–2,5 m (dla zbiorników głębokich); w jeziorach bardzo płytkich widzialność niesięgająca dna',
      U2: 'Widzialność krążka Secchiego <1,0 m',
    },
    inputs: [
      { kind: 'number', name: 'value', label: 'Widzialność krążka Secchiego', unit: 'm', min: 0, help: 'W metrach, np. 1,2. Gdy krążek widać na dnie – wpisz głębokość dna i zaznacz „widoczny do dna”.' },
      { kind: 'select', name: 'toBottom', label: 'Krążek widoczny do dna', options: YES_NO, help: 'Tak – krążek widać aż na dnie (FV niezależnie od głębokości).' },
      { kind: 'number', name: 'maxDepth', label: 'Głębokość zbiornika w punkcie pomiaru (opcjonalnie)', unit: 'm', min: 0, help: 'Głębokość w miejscu pomiaru (sonda, linka z obciążeniem). Przy zbiorniku płytszym niż 1 m krążek niesięgający dna daje U1 zamiast U2.' },
    ],
    suggest: (i) => gradeSecchi3150(num(i.value), i.toBottom === 'yes', num(i.maxDepth)),
    explain: (i) => {
      const v = num(i.value)
      const d = num(i.maxDepth)
      return i.toBottom !== 'yes' && v !== undefined && v < 1 && d !== undefined && d < 1
        ? 'Zbiornik płytszy niż 1 m – krążek niesięgający dna oceniony na U1 (wyjątek dla jezior bardzo płytkich).'
        : null
    },
    warn: (i) => {
      const v = num(i.value)
      const d = num(i.maxDepth)
      return v !== undefined && d !== undefined && v > d ? 'Widzialność większa niż głębokość zbiornika – zaznacz raczej „widoczny do dna”.' : null
    },
    describe: (i) => {
      const v = num(i.value)
      const d = num(i.maxDepth)
      return [v !== undefined ? `${plNum(v)} m` : '', i.toBottom === 'yes' ? 'widzialność do dna' : '', d !== undefined ? `głębokość ${plNum(d)} m` : '']
        .filter(Boolean)
        .join(', ')
    },
  },
  {
    ...choiceIndicator({
      id: 'colour',
      label: 'Barwa wody',
      description:
        'Barwa wody w centralnej, najgłębszej części zbiornika. Bywa skutkiem zanieczyszczeń organicznych, substancji humusowych, erozji gleb, ścieków albo nadmiernego rozwoju fitoplanktonu.',
      help: `Co wybrać: barwę wody oglądaną w punkcie pomiarowym (centralna, najgłębsza część zbiornika), najlepiej na tle krążka Secchiego. Do opisu możesz dopisać własne słowa (np. „woda słabo przezroczysta”) – trafią do karty zamiast etykiety.

Progi (tab. 2): słabo zielona, słabo przezroczysta, brązowawo-przezroczysta – FV; wyraźnie zielone zabarwienie – U1; sinozielone zabarwienie jak rozlana farba olejna – U2 (zakwit sinic).

Uwaga: ocena jest w dużej mierze uznaniowa (sprawozdania 2016–2018 i 2024). Brązowe zabarwienie od substancji humusowych (torfowiska, lasy w zlewni) to nie degradacja; po ulewnych deszczach barwa bywa chwilowo gorsza – zapisz to w uwagach. W małych starorzeczach woda jest naturalnie mętna i brunatna.

W przewodniku 2012 wskaźnik kardynalny; w cyklu monitoringu 2023–2025 – zwykły (sprawozdanie 2024: 4 kardynalne bez barwy; już sprawozdanie 2016–2018 postulowało, by barwa nie była kardynalna). Formularz idzie za praktyką 2024: barwa U2 nie przesądza o U2 struktury.`,
      options: COLOUR,
      inputLabel: 'Barwa wody',
      after: [{ kind: 'text', name: 'note', label: 'Opis barwy (opcjonalnie)', placeholder: 'np. Woda słabo przezroczysta', help: 'Własny opis barwy do karty, np. „woda słabo przezroczysta, lekko brązowawa (humusowa)”. Puste – do karty trafia etykieta wybranej opcji.' }],
    }),
    describe: (i) => String(i.note ?? '').trim() || labelOf(COLOUR, i.choice),
  },
  {
    id: 'ph',
    label: 'Odczyn wody',
    parameter: 'structure',
    description: 'Wskaźnik pomocniczy. pH wody; zbyt wysokie (>9) świadczy o silnej eutrofizacji prowadzącej do hypertrofii.',
    help: `Co wpisać: pH wody z pH-metru (sondy).

${WATER_POINT}

Progi (tab. 2): pH 6,5–7,9 FV; 8,0–9,0 U1; >9,0 U2. Wartości między 7,9 a 8,0 formularz liczy jako FV. Poniżej 6,5 tab. 2 nie przewiduje oceny – formularz podpowiada U1 (interpretacja: odchylenie od zakresu typowego 6,5–9,0 z opisu siedliska), sprawdź wtedy, czy to nie zbiornik dystroficzny (3160).

Uwaga: pH waha się w ciągu doby (fotosynteza podnosi je w dzień) i bywa podwyższone naturalnie (sprawozdanie 2016–2018 i 2024: starorzecze Popradu, pH 8,15–8,62). Zapisz godzinę pomiaru przy wyniku na granicy.

Wskaźnik pomocniczy (dodatkowy) – liczy się do oceny struktury, ale nie jest kardynalny.`,
    thresholds: { FV: 'pH 6,5–7,9', U1: 'pH 8,0–9,0', U2: 'pH >9,0' },
    inputs: [{ kind: 'number', name: 'value', label: 'Odczyn wody', unit: 'pH', min: 0, max: 14, help: 'pH z sondy, np. 7,7. Najgłębsze miejsce zbiornika, 0,5–1,0 m pod powierzchnią. Pomiar niemożliwy – zostaw puste i wybierz XX.' }],
    suggest: (i) => {
      const v = num(i.value)
      return v === undefined ? null : gradePH3150(v)
    },
    explain: (i) => {
      const v = num(i.value)
      return v !== undefined && v < 6.5 ? 'pH poniżej 6,5 – tab. 2 nie podaje oceny; podpowiedź U1 to interpretacja.' : null
    },
    describe: (i) => {
      const v = num(i.value)
      return v === undefined ? '' : `${plNum(v)} pH`
    },
  },
  {
    id: 'plankton',
    label: 'Fito- i zooplankton',
    parameter: 'structure',
    description: 'Wskaźnik pomocniczy. Łączna ocena fito- i zooplanktonu – gdy oceny składowych się różnią, przyjmuje się niższą.',
    help: `Co wpisać: wynik analizy próbki planktonu.
• Fitoplankton – która grupa dominuje (wystarczy poziom grup, nie gatunków). Zielenice albo inne grupy bez sinic – FV; współdominacja sinic i zielenic – U1; dominacja sinic nitkowatych albo Microcystis, Woronichinia, długotrwałe zakwity sinicowe – U2.
• Zooplankton – udział gatunków eutroficznych w całym zespole: <5% FV; 5–50% U1; >50% U2. Opisowo: FV to duże zróżnicowanie taksonomiczne, gatunki rzadkie i chronione; U1 – drobne wioślarki i wrotki; U2 – dominacja wrotków, małe zróżnicowanie.
Ocena wskaźnika = gorsza z dwóch.

Próbka: siatka planktonowa o oczkach ≤20 µm w najgłębszym miejscu, warstwa 0,5–1,0 m; 100–200 cm³ zagęszczonej próbki, utrwalić płynem Lugola (do koloru herbaty). Analiza w min. 20 polach widzenia mikroskopu świetlnego. Bez siatki – metoda osadzania prób (Starmach 1989).

Obecność, a nawet krótkotrwałe zakwity sinic są w 3150 naturalne; zły stan to długotrwałe zakwity i hypertrofia.

Wskaźnik pomocniczy – liczy się do oceny struktury, ale nie jest kardynalny. W cyklu 2023–2025 badany obowiązkowo; gdy próby nie dało się pobrać, wybierz ocenę XX.`,
    thresholds: {
      FV: 'Fitoplankton: dominacja zielenic lub innych grup z wyjątkiem sinic. Zooplankton: duże zróżnicowanie, gatunki eutroficzne <5%, gatunki rzadkie i chronione',
      U1: 'Fitoplankton: współdominacja sinic i zielenic. Zooplankton: drobne wioślarki i wrotki, gatunki eutroficzne 5–50%',
      U2: 'Fitoplankton: dominacja sinic nitkowatych lub Microcystis, Woronichinia, długotrwałe zakwity. Zooplankton: dominacja wrotków, małe zróżnicowanie, gatunki eutroficzne >50%',
    },
    inputs: [
      { kind: 'select', name: 'phyto', label: 'Fitoplankton – grupa dominująca', options: PHYTO.map(({ value, label }) => ({ value, label })), help: 'Dominacja zielenic albo innych grup bez sinic – FV; współdominacja sinic i zielenic – U1; dominacja sinic (nitkowate, Microcystis, Woronichinia), długotrwały zakwit – U2.' },
      { kind: 'text', name: 'phytoNote', label: 'Fitoplankton – opis (opcjonalnie)', placeholder: 'np. Dominacja okrzemek (75%), zielenice 15%, sinice 5%', help: 'Skład fitoplanktonu z procentowym udziałem grup – trafia do karty. Puste – etykieta wybranej grupy.' },
      { kind: 'number', name: 'zooEutrophic', label: 'Zooplankton – udział gatunków eutroficznych', unit: '%', min: 0, max: 100, help: 'Procentowy udział gatunków eutroficznych (wskaźników wysokiej trofii) w całym zespole zooplanktonu: <5% FV, 5–50% U1, >50% U2.' },
      { kind: 'textarea', name: 'zooNote', label: 'Zooplankton – opis (opcjonalnie)', rows: 2, placeholder: 'np. Dominacja wrotków nad skorupiakami (Rotifera 70%, Crustacea 30%)', help: 'Zróżnicowanie taksonomiczne, proporcje wrotków i skorupiaków, gatunki rzadkie i chronione – trafia do karty. Puste – sam udział gatunków eutroficznych.' },
    ],
    suggest: (i) => {
      const { phyto, zoo } = planktonGrades(i)
      return phyto && zoo ? worseGrade(phyto, zoo) : null
    },
    explain: (i) => {
      const { phyto, zoo } = planktonGrades(i)
      if (!phyto && !zoo) return null
      if (!phyto || !zoo) return `Jest ocena tylko ${phyto ? 'fitoplanktonu' : 'zooplanktonu'} – wskaźnik to łączna ocena obu składowych.`
      return `Fitoplankton ${phyto}, zooplankton ${zoo} – przyjęto gorszą.`
    },
    describe: (i) => {
      const share = num(i.zooEutrophic)
      const phyto = String(i.phytoNote ?? '').trim() || labelOf(PHYTO, i.phyto)
      const zooNote = String(i.zooNote ?? '').trim()
      const zooShare = share !== undefined ? `gatunki eutroficzne ${plNum(share)}%` : ''
      const zoo = zooNote ? (zooShare && !zooNote.includes('%') ? `${zooNote} (${zooShare})` : zooNote) : zooShare
      return [phyto ? `Fitoplankton: ${phyto}` : '', zoo ? `zooplankton: ${zoo}` : ''].filter(Boolean).join('; ')
    },
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie.

Dlaczego: transekt jest stały – przy kolejnym badaniu trzeba go znaleźć w tym samym miejscu. Gdy transekt się przesunął, wpisz nowe współrzędne i opisz zmianę w uwagach.`

/** Okno terminu: metodyka – lipiec do połowy września; cykl 2023–2025 uznawał badania od 15 czerwca. */
export function dateWarning3150(v: unknown): string | null {
  if (!isIsoDate(v)) return null
  const [, m, d] = v.split('-').map(Number)
  if (m === 7 || m === 8 || (m === 9 && d <= 15)) return null
  if (m === 6 && d >= 15)
    return 'Przed lipcem – metodyka zaleca lipiec–sierpień (najwcześniej początek lipca). W cyklu 2023–2025 badania od połowy czerwca uznawano za wiarygodne.'
  return 'Termin poza oknem metodyki (początek lipca – połowa września). Roślinność wodna może być nierozwinięta albo już zamierać.'
}

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Brzeg I',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – zwykle nazwa jeziora albo starorzecza (z numerem stanowiska), np. „Brzeg I”, „Starorzecze Warty 14”, „Jezioro Mikołajskie, stanowisko 3”.

Dlaczego: w dużym jeziorze wyznacza się kilka stanowisk, a starorzecze rozdzielone groblą albo zarastaniem to osobne stanowiska. Stabilna nazwa (z GUID) pozwala zestawić kolejne karty.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'select',
    name: 'subtype',
    label: 'Podtyp siedliska',
    options: SUBTYPES,
    required: true,
    help: `3150-1 – jeziora eutroficzne (naturalne, zwykle powyżej 1 ha, trwałe, z litoralem; także mezotroficzne jeziora „typu Potamogeton”).
3150-2 – eutroficzne starorzecza (dawne koryta odcięte przez rzekę) i naturalne, drobne zbiorniki („oczka” wytopiskowe).

Podtyp ustala próg pokrycia pleustofitów we wskaźniku „Charakterystyczna kombinacja zbiorowisk”: 25% w jeziorach, 50% w starorzeczach i drobnych zbiornikach. Pozostałe progi są wspólne.`,
  },
  {
    kind: 'text',
    name: 'waterBody',
    label: 'Zbiornik (jezioro, starorzecze)',
    required: true,
    placeholder: 'np. starorzecze Pilicy koło Brzegu',
    help: 'Zbiornik, w którym leży stanowisko: nazwa jeziora albo rzeki, której to starorzecze, z najbliższą miejscowością. Obszar Natura 2000 wpisz osobno w „Obszarach chronionych”.',
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Ceratophylletum demersi, Lemno-Spirodeletum polyrrhizae, Nymphaeo albae-Nupharetum luteae',
    help: `Zbiorowiska roślin wodnych stwierdzone na stanowisku, nazwami fitosocjologicznymi (wg Ratyńskiej i in. 2010), oddzielone przecinkiem. Bez szuwarów i turzycowisk. Typowe: Potametum lucentis, P. perfoliati, P. pectinati, Ceratophylletum demersi, Myriophylletum spicati, Nymphaeo albae-Nupharetum luteae, Potametum natantis, Trapetum natantis, Lemnetum minoris, Lemno-Spirodeletum polyrrhizae, Lemno minoris-Salvinietum natantis, Lemno-Hydrocharitetum morsus-ranae, Stratiotetum aloidis.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Położenie (rzeka, odległość od koryta), otoczenie, szuwar, połączenie z rzeką, zarastanie, wypłycanie.',
    help: `Syntetyczny opis stanowiska:
• czym jest zbiornik: jezioro (rynnowe, wytopiskowe, płytkie/głębokie) czy starorzecze (której rzeki, jak daleko od koryta, czy ma okresowy kontakt z rzeką);
• otoczenie: drzewa, krzewy, pola, zabudowa, drogi, kąpieliska, miejsca wydobycia żwiru i piasku;
• szuwar: czy jest typowy pas szuwaru, jakie gatunki (bez szczegółowej oceny);
• zarastanie, wypłycanie, fragmentacja, zmiany od poprzedniego badania.

Dlaczego: oddziaływania i perspektywy ochrony zależą od otoczenia zbiornika i (w starorzeczach) od naturalności rzeki – opis pozwala je uzasadnić.`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Powierzchnia siedliska na stanowisku (lustra wody z roślinnością wodną; w małym starorzeczu – całego zbiornika), w hektarach, z GIS albo oszacowana.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', { hint: 'Z kodem obszaru Natura 2000, np. „Dolina Dolnej Pilicy PLH140016”.' }),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. Wojewoda Łódzki, Wody Polskie',
    help: 'Kto zarządza zbiornikiem albo gruntem: Wody Polskie, gmina, wojewoda, nadleśnictwo, osoba prywatna, dzierżawca rybacki. Nie wiadomo – zostaw puste.',
  },
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    defaultValue: '10x100 m',
    required: true,
    hint: 'W przykładzie z przewodnika 10×100 m.',
    help: `Reprezentatywny transekt w obrębie roślinności wodnej, wyznaczony przy pierwszym badaniu i powtarzany w tym samym miejscu (dostępne współrzędne). Przykład z przewodnika: 10×100 m. Gdy zbiornik jest mały albo transekt trzeba dopasować do kształtu starorzecza, wpisz faktyczne wymiary.

Poza transektem opłyń albo obejdź cały zbiornik (w dużym jeziorze – wydzieloną część), żeby wychwycić płaty i pojedyncze osobniki gatunków rzadkich, chronionych i obcych.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    help: 'Wysokość lustra wody nad poziomem morza z mapy lub GPS. Przewodnik ma osobno minimalną i maksymalną – dla zbiornika to zwykle ta sama liczba; różne wpisz jako „137–139”.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 25.07.2024',
    required: true,
    hint: 'Optymalnie lipiec–sierpień, najpóźniej do połowy września.',
    help: `Dzień badań terenowych. Metodyka: lato, lipiec–sierpień, nie wcześniej niż początek lipca i nie później niż połowa września. W cyklu 2023–2025 za wiarygodne uznawano badania od połowy czerwca do połowy września (formularz ostrzega poza oknem, nie blokuje).

Badania powtarza się co 3 lata; przy wyraźnie złym stanie, zasypywaniu albo silnym zarastaniu – po roku.`,
    warn: dateWarning3150,
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcie fitosocjologiczne ----------

const releveFields: FieldDef[] = [
  { kind: 'text', name: 'coords', label: 'Współrzędne środka zdjęcia', help: 'Współrzędne GPS środka powierzchni zdjęcia w obrębie transektu.' },
  { kind: 'number', name: 'area', group: 'Powierzchnia i pokrycie', label: 'Powierzchnia zdjęcia', unit: 'm²', min: 0, defaultValue: 25, help: 'Powierzchnia płatu objętego zdjęciem, np. 25 m² (5×5 m). W wąskim starorzeczu dopasuj do płatu.' },
  { kind: 'number', name: 'cover', group: 'Powierzchnia i pokrycie', label: 'Ogólne pokrycie', unit: '%', min: 0, max: 100, help: 'Procent powierzchni zdjęcia pokryty roślinnością wodną (rzut pionowy, łącznie z roślinami zanurzonymi).' },
  { kind: 'text', name: 'unit', label: 'Jednostka fitosocjologiczna', placeholder: 'np. Nymphaeo albae-Nupharetum luteae', help: 'Zespół albo zbiorowisko, do którego należy zdjęcie (wg Ratyńskiej i in. 2010).' },
  {
    kind: 'releve-species',
    name: 'species',
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki na powierzchni zdjęcia z ilościowością w skali Braun-Blanqueta (r, +, 1–5). Rośliny wodne wpisuj w warstwie C (zielnej), mchy wodne (Fontinalis) w D. Rośliny zanurzone wyciągaj kotwiczką.',
  },
]

export const methodology3150: Methodology = {
  code: '3150',
  name: 'Starorzecza i naturalne eutroficzne zbiorniki wodne ze zbiorowiskami z Nympheion, Potamion',
  source:
    'Wilk-Woźniak E., Gąbka M., Pęczuła W. i in. 2012, 3150 Starorzecza i naturalne eutroficzne zbiorniki wodne ze zbiorowiskami z Nympheion, Potamion, [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 130–149 (tab. 1 i 2), z praktyką oceny z monitoringu 2016–2018 i 2024',

  siteFields,

  releves: {
    defaultCount: 1,
    intro:
      'Zdjęcia fitosocjologiczne roślinności wodnej w obrębie transektu – po jednym w każdym wyróżnionym zbiorowisku (nymfeidy, elodeidy, pleustofity). Skala Braun-Blanqueta, wszystko w warstwie C. Rośliny zanurzone wyciągaj kotwiczką. Szuwaru nie trzeba zdejmować.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Realne możliwości zachowania właściwego stanu albo poprawy stanu niewłaściwego: stan zlewni jezior i otoczenia starorzeczy, gospodarka wodno-ściekowa, rolnictwo, leśnictwo, rekreacja; w starorzeczach także naturalność rzeki.',
    help: `Oceń stan zlewni jeziora i otoczenia starorzecza: czy gospodarka wodno-ściekowa jest uregulowana (domy, gospodarstwa, zabudowa rekreacyjna), jak gospodaruje się polami i lasami w zlewni, jak użytkuje się sam zbiornik (rybactwo, wędkarstwo), stan infrastruktury rekreacyjnej.

W starorzeczach dodatkowo stopień naturalności rzeki – czy mogą powstawać nowe starorzecza:
• FV: rzeka nienaruszona, naturalna, powstają nowe starorzecza, albo przekształcona najwyżej w 60% z zachowanymi terasami zalewowymi i okresowym kontaktem z rzeką;
• U1: rzeka przekształcona w 60–90%, ale z możliwością okresowego kontaktu z istniejącymi starorzeczami;
• U2: rzeka przekształcona w ponad 90%, obwałowana, bez teras zalewowych, bez możliwości tworzenia nowych starorzeczy; starorzecza silnie zamulone, praktycznie zanikające, przekształcone na żwirownie.

Weź pod uwagę miejsca wydobycia żwiru i piasku, prace i plany regulacji rzek, planowane drogi i autostrady.

W opisie podaj potencjalne zabiegi ochronne: uregulowanie gospodarki ściekowej, strefa ochronna bez zabudowy, ograniczenie nawożenia i wypasu przy brzegu, zakaz zaśmiecania, prawidłowa gospodarka rybacka.`,
    thresholds: {
      FV: 'Perspektywy dobre lub doskonałe; nie przewiduje się znaczącego oddziaływania czynników zagrażających. W starorzeczach: rzeka naturalna albo przekształcona ≤60%, zachowane terasy zalewowe, możliwość tworzenia się nowych starorzeczy i okresowy kontakt z rzeką',
      U1: 'Kombinacje pośrednie. W starorzeczach: rzeka przekształcona w 60–90%, ale z możliwością zachowania okresowego kontaktu z istniejącymi starorzeczami',
      U2: 'Perspektywy złe, silny wpływ czynników zagrażających (odwadnianie, zła gospodarka akwenami i w zlewni, antropopresja, regulacja rzek); nie można zagwarantować przetrwania. W starorzeczach: rzeka przekształcona >90%, obwałowana, brak teras, starorzecza silnie zamulone, zanikające lub przekształcone na żwirownie',
    },
  },

  impactCodes: [
    { code: 'A01', name: 'Uprawa' },
    { code: 'A02.01', name: 'Intensyfikacja rolnictwa' },
    { code: 'A04', name: 'Wypas' },
    { code: 'A07', name: 'Stosowanie biocydów, hormonów i substancji chemicznych' },
    { code: 'A08', name: 'Nawożenie /nawozy sztuczne/' },
    { code: 'B02.02', name: 'Wycinka lasu' },
    { code: 'C01.01', name: 'Wydobywanie piasku i żwiru' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D01.02', name: 'Drogi, autostrady' },
    { code: 'E01', name: 'Tereny zurbanizowane, tereny zamieszkane' },
    { code: 'E01.03', name: 'Zabudowa rozproszona' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'E03.01', name: 'Pozbywanie się odpadów z gospodarstw domowych / obiektów rekreacyjnych' },
    { code: 'E03.04', name: 'Inne odpady' },
    { code: 'F01', name: 'Akwakultura morska i słodkowodna' },
    { code: 'F02', name: 'Rybołówstwo i zbieranie zasobów wodnych' },
    { code: 'F02.03', name: 'Wędkarstwo' },
    { code: 'F05.04', name: 'Kłusownictwo' },
    { code: 'G01', name: 'Sporty i różne formy czynnego wypoczynku i rekreacji, uprawiane w plenerze' },
    { code: 'G01.01', name: 'Żeglarstwo' },
    { code: 'G02.08', name: 'Kempingi i karawaningi' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'H01', name: 'Zanieczyszczenie wód powierzchniowych (limnicznych, lądowych, morskich i słonawych)' },
    { code: 'H01.05', name: 'Rozproszone zanieczyszczenie wód powierzchniowych z powodu działalności związanej z rolnictwem i leśnictwem' },
    { code: 'H01.08', name: 'Rozproszone zanieczyszczenie wód powierzchniowych z powodu ścieków z gospodarstw domowych' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'J02.01', name: 'Zasypywanie terenu, melioracje i osuszanie – ogólnie' },
    { code: 'J02.01.03', name: 'Wypełnianie rowów, tam, stawów, sadzawek, bagien lub torfianek' },
    { code: 'J02.03', name: 'Regulowanie (prostowanie) koryt rzecznych i zmiana przebiegu koryt' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód – ogólnie' },
    { code: 'J02.06', name: 'Pobór wód z wód powierzchniowych' },
    { code: 'J02.12', name: 'Tamy, wały, sztuczne plaże – ogólnie' },
    { code: 'K01.02', name: 'Zamulenie' },
    { code: 'K01.03', name: 'Wyschnięcie' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.02', name: 'Nagromadzenie materii organicznej' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'M01.02', name: 'Susze i zmniejszenie opadów' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. gatunki typowe dla siedliska, rzadkie rośliny wodne, płazy, ptaki wodno-błotne.',
        help: 'Wartości przyrodnicze stanowiska poza samym siedliskiem: gatunki chronione i rzadkie (salwinia, kotewka, grzybieńczyk, osoka), płazy, ptaki wodno-błotne, ichtiofauna, sąsiedztwo innych siedlisk (łęgi 91E0, 91F0, ziołorośla 6430). Przykład z przewodnika: „Występowanie jednego z gatunków charakterystycznych – grążel żółty Nuphar lutea”. Brak informacji – „Nie pozyskano danych”.',
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: `Jakie działania ochronne wykonano i jaka jest ich skuteczność, oraz co proponujesz. Typowe dla 3150: uregulowanie gospodarki wodno-ściekowej w zlewni, strefa ochronna wokół zbiornika bez zabudowy, zakaz budowy parkingów, toalet i punktów gastronomicznych przy brzegu, ograniczenie nawożenia i wypasu przy brzegu, sprzątanie i zakaz zaśmiecania, prawidłowa gospodarka rybacka, zachowanie naturalnych procesów w dolinie rzeki (nowe starorzecza), edukacja właścicieli i użytkowników. Usuwanie szuwaru budzi wątpliwości (sprawozdanie 2016–2018). Brak działań – „Brak”.`,
      }
    return f
  }),

  speciesCatalog: SPECIES_3150.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer3150(s) })),
  speciesInfo: (name) => {
    const s = findSpecies3150(name)
    if (!s) return undefined
    const tags = [GROUP_LABELS_3150[s.group], s.rare ? 'rzadki/chroniony' : '', s.alien === 'yes' ? 'obcy' : s.alien === 'ignored' ? 'obcy, pomijany w ocenie' : '']
    return tags.filter(Boolean).join(', ')
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator3150 = (id: string): IndicatorDef => {
  const i = methodology3150.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 3150`)
  return i
}

