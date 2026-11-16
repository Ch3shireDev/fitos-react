// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Mróz, Świerkosz, Kozak 2012, rozdz. 6430, pkt 3 „Przykład
// wypełnionej karty obserwacji”): Między Kościółkami a przełęczą Brona (Babia Góra), 15.09.2011. Koordynator
// zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („19° 30′ …″ E – 49° 34′ …″ N”) – przepisane do minut;
//  • wysokość: „minimalna 1490, maksymalna 1560 m n.p.m.” → „1490–1560”;
//  • podtyp: karta go nie podaje – Adenostyletum alliariae to 6430-1 (ziołorośla subalpejskie i reglowe);
//  • gatunki charakterystyczne: siedem gatunków związku Adenostylion z pokryciem z karty; wierzbownica alpejska i kozłek
//    bzowy spoza tab. 1 – katalog zna je jako „gatunki z karty przykładowej”; i tak 5 z tab. 1 → FV;
//  • bogactwo gatunkowe: karta podaje 25, 24 i 22 gatunki (średnio 23,7), choć w zdjęciach wpisano 22, 22 i 20 gatunków –
//    sama karta wyjaśnia, że wliczono taksony nieoznaczone do gatunku; liczby jak w karcie;
//  • zdjęcia: malina w warstwie B, reszta w C; mszaków nie zbierano (uwaga z karty w uwagach do zdjęcia I);
//  • oddziaływania: stare kody (2011) → słownik 2011 jak w sprawozdaniu 2016–2018: 424 → E03.04, 900 → K01.01, 942 → L04;
//    intensywność B → M, C → L; stary kod w opisie;
//  • „Zagrożenia” w karcie to tekst bez kodów – rozpisane na G01.02 i H05.01, treść przepisana do opisów;
//  • rok, typ monitoringu, puste „Nazwa obszaru” i „Dodatkowi koordynatorzy” – w uwagach.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology6430 } from './methodology'

const COORD = '19°30′ E – 49°34′ N'
const UNIT = 'Adenostylion alliariae'

/** „Aconitum firmum +, Cicerbita alpina 2, …” → wiersze warstwy C. */
const list = (spec: string) =>
  spec.split(', ').map((s) => {
    const i = s.lastIndexOf(' ')
    return { layer: 'C' as const, name: s.slice(0, i), abundance: s.slice(i + 1) }
  })

const releve = (o: { altitude: number; slope: number; coverB: number; coverC: number; coverD: number; rubus: string; remarks?: string }, spec: string) => ({
  coords: COORD,
  altitude: o.altitude,
  area: 25,
  slope: o.slope,
  exposure: 'NE',
  coverA: undefined,
  coverB: o.coverB,
  coverC: o.coverC,
  coverD: o.coverD,
  heightA: undefined,
  heightB: 0.6,
  heightC: 60,
  heightD: 2,
  unit: UNIT,
  species: [{ layer: 'B' as const, name: 'Rubus idaeus', abundance: o.rubus }, ...list(spec)],
  remarks: o.remarks ?? '',
})

const CHARACTERISTIC_NOTE =
  'Aconitum firmum – 1%, Adenostyles alliariae – 2%, Cicerbita alpina – 5%, Doronicum austriacum – 10%, Epilobium alpestre – 2%, Petasites kablikianus – 25%, Valeriana sambucifolia – 1%.'
const RICHNESS_NOTE =
  'W zdjęciach 1, 2 i 3 odnotowano kolejno 25, 24 i 22 gatunki; średnio 23,7 gatunku/zdjęcie. Uwaga: do łącznej liczby gatunków włączono również taksony nieoznaczone do gatunku, a tym samym takie, które nie zostały ujęte w zdjęciach fitosocjologicznych wpisanych do bazy.'
const COMPLEX_NOTE =
  'W otoczeniu płatów monitorowanego siedliska inne naturalne zbiorowiska piętra subalpejskiego: zarośla kosodrzewiny Pinetum mugo, jarzębiny i wierzby śląskiej, maliniska, borówczyska i murawy naskalne.'
const BRYOPHYTES =
  'Zgodnie z metodyką stosowaną w dotychczasowym monitoringu, w czasie badań terenowych nie gromadzono informacji o występowaniu gatunków mszaków. Jednak po późniejszych konsultacjach uznano, że jest to niezbędne, więc powinny tu zostać wykazane wszystkie, opisane w terenie lub oznaczone z pomocą specjalisty, gatunki mszaków naziemnych oraz ich ilościowość. Uwaga ta dotyczy również pozostałych zdjęć fitosocjologicznych w formularzu.'

export const brona: CardValues = {
  ...emptyCardValues(methodology6430),
  site: {
    subtype: '6430-1',
    siteName: 'Między Kościółkami a przełęczą Brona',
    guid: '',
    siteType: 'Referencyjne',
    areaName: '',
    communities: 'Adenostyletum alliariae',
    description:
      'Płaty ziołorośli zespołu Adenostyletum alliariae występują na stromych i wilgotnych zboczach schodzących z głównego grzbietu masywu Babiej Góry, między przełęczą Brona a Kościółkami, występując zwykle w lokalnych obniżeniach, płytkich żlebach, miejscach bardziej wilgotnych. Z reguły mają one niewielką powierzchnię, ograniczoną do kilkudziesięciu metrów kwadratowych, największy z nich zajmuje około 400 m2. Poprzedzielane są one fragmentami innych zbiorowisk piętra subalpejskiego, przede wszystkim płatami kosodrzewiny Pinus mugo oraz zaroślami z dużym udziałem jarzębiny Sorbus aucuparia i wierzby śląskiej Salix silesiaca.',
    areaHa: '0,08',
    protectedAreas:
      'Babiogórski Park Narodowy; Specjalny Obszar Ochrony Siedlisk PLH120001 Babia Góra i Obszar Specjalnej Ochrony Ptaków PLB120011 Babia Góra; Rezerwat Biosfery „Babia Góra”',
    manager: 'Babiogórski Park Narodowy',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '150x10 m',
    altitude: '1490–1560',
    date: '2011-09-15',
    observer: 'Jan Kowalski',
    additionalExperts: '',
  },
  releves: [
    releve(
      { altitude: 1560, slope: 45, coverB: 1, coverC: 80, coverD: 60, rubus: '+', remarks: BRYOPHYTES },
      'Aconitum firmum +, Adenostyles alliariae +, Cicerbita alpina 2, Doronicum austriacum 2, Epilobium alpestre +, Geranium sylvaticum +, Geum rivale +, Heracleum sphondylium 2, Hypericum maculatum +, Melandrium rubrum 2, Milium effusum 3, Petasites kablikianus 3, Polygonum bistorta +, Primula elatior 2, Ranunculus platanifolius +, Rumex alpestris 2, Sedum fabaria 1, Thalictrum aquilegiifolium 3, Valeriana sambucifolia 1, Veratrum album +, Viola biflora 1',
    ),
    releve(
      { altitude: 1550, slope: 40, coverB: 3, coverC: 90, coverD: 60, rubus: '1' },
      'Aconitum firmum 1, Cicerbita alpina 2, Doronicum austriacum 2, Epilobium alpestre 1, Geranium sylvaticum +, Geum rivale 1, Heracleum sphondylium 2, Hypericum maculatum +, Melandrium rubrum 1, Milium effusum 2, Mutellina purpurea +, Oxalis acetosella +, Petasites kablikianus 4, Polygonum bistorta +, Primula elatior 2, Ranunculus platanifolius +, Rumex alpestris 2, Sedum fabaria 1, Senecio subalpinus +, Thalictrum aquilegiifolium 3, Viola biflora 1',
    ),
    releve(
      { altitude: 1490, slope: 40, coverB: 1, coverC: 90, coverD: 30, rubus: '+' },
      'Adenostyles alliariae 1, Athyrium distentifolium +, Calamagrostis villosa 2, Chaerophyllum hirsutum +, Cicerbita alpina 2, Doronicum austriacum 3, Epilobium alpestre 2, Geranium sylvaticum +, Heracleum sphondylium 2, Milium effusum 2, Mutellina purpurea +, Phyteuma spicatum +, Polygonum bistorta +, Ranunculus platanifolius +, Rumex alpestris 2, Sedum fabaria +, Senecio subalpinus +, Soldanella carpatica +, Thalictrum aquilegiifolium +',
    ),
  ],
  indicators: {
    area: {
      inputs: { choice: 'stable', areaText: '0,08 ha', note: 'Zbiorowisko zajmuje wszystkie odpowiednie miejsca w obrębie stanowiska.' },
      value: 'Zbiorowisko zajmuje wszystkie odpowiednie miejsca w obrębie stanowiska.',
      grade: 'FV',
    },
    characteristic: {
      inputs: {
        species: [
          { name: 'Aconitum firmum', cover: 1 },
          { name: 'Adenostyles alliariae', cover: 2 },
          { name: 'Cicerbita alpina', cover: 5 },
          { name: 'Doronicum austriacum', cover: 10 },
          { name: 'Epilobium alpestre', cover: 2 },
          { name: 'Petasites kablikianus', cover: 25 },
          { name: 'Valeriana sambucifolia', cover: 1 },
        ],
        count: undefined,
        choice: '',
        note: CHARACTERISTIC_NOTE,
      },
      value: CHARACTERISTIC_NOTE,
      grade: 'FV',
    },
    expansive: {
      inputs: { species: [], total: undefined, none: 'yes', choice: '', note: 'Brak ekspansywnych gatunków roślin zielnych.' },
      value: 'Brak ekspansywnych gatunków roślin zielnych.',
      grade: 'FV',
    },
    richness: {
      inputs: { n1: 25, n2: 24, n3: 22, count: undefined, note: RICHNESS_NOTE },
      value: RICHNESS_NOTE,
      grade: 'FV',
    },
    aliens: {
      inputs: { species: [], total: undefined, none: 'yes', note: 'Brak' },
      value: 'Brak',
      grade: 'FV',
    },
    river: {
      inputs: { choice: 'natural', note: 'Stosunki wodne bez śladów ludzkiej ingerencji.' },
      value: 'Stosunki wodne bez śladów ludzkiej ingerencji.',
      grade: 'FV',
    },
    complex: {
      inputs: { choice: 'natural', note: COMPLEX_NOTE },
      value: COMPLEX_NOTE,
      grade: 'FV',
    },
  },
  prospects: {
    value: 'Stanowisko znajduje się w obszarze ochrony ścisłej Babiogórskiego Parku Narodowego.',
    grade: 'FV',
  },
  impacts: [
    {
      code: 'E03.04',
      name: 'Inne odpady',
      influence: '-',
      intensity: 'L',
      description: 'W płatach zbiorowiska położonych tuż poniżej szlaku turystycznego obecne śmieci. (Kod w karcie z 2011 r.: 424 Inne odpady, intensywność C.)',
    },
    {
      code: 'K01.01',
      name: 'Erozja',
      influence: '-',
      intensity: 'M',
      description: 'Na stromych, skalistych stokach ruchy grawitacyjne materiału skalnego, nie zagrażające jednak istnieniu stanowiska. (Kod w karcie z 2011 r.: 900 Erozja, intensywność B.)',
    },
    {
      code: 'L04',
      name: 'Lawina',
      influence: '0',
      intensity: 'M',
      description: 'Ze względu na okres występowania tego zjawiska nie ma ono istotnego wpływu na zbiorowiska ziołoroślowe. (Kod w karcie z 2011 r.: 942 Lawina, intensywność B.)',
    },
  ],
  threats: [
    {
      code: 'G01.02',
      name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych',
      description:
        'Mimo że bardzo blisko stanowiska przebiega bardzo uczęszczany turystyczny szlak pieszy, nie wydaje się być ono silnie zagrożone. Ze względu na lokalne warunki topograficzne (bardzo strome, kamieniste zbocza) jest ono w naturalny sposób zabezpieczone przed niepożądaną penetracją.',
    },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe', description: 'Jedynym niepożądanym efektem ruchu turystycznego jest obecność śmieci w obrębie stanowiska.' },
  ],
  other: {
    otherValues: 'Obecność innych zbiorowisk właściwych piętru subalpejskiemu, rzadkich w skali kraju (Pinetum mugo, Salicetum silesiaceae).',
    conservation: 'Obszar ochrony ścisłej Babiogórskiego Parku Narodowego.',
    proposals: 'Zachować dotychczasowy status ochronny.',
    monitoringRequired: 'tak',
    justification: 'Ze względu na typowo wykształcone, bogate florystycznie płaty ziołorośli zespołu Adenostyletum alliariae, z dużym udziałem gatunków wysokogórskich, rzadkich w skali kraju.',
    shareFV: 100,
    shareU1: 0,
    shareU2: 0,
    notes:
      'Ze względu na dość późny termin wykonania monitoringu wskaźniki ilościowości dla niektórych gatunków charakterystycznych dla zbiorowiska o dużych, szybko obumierających liściach (np. Adenostyles alliariae, Cicerbita alpina, Doronicum austriacum) mogą być zaniżone. Stąd też wskazane jest wykonywanie kontroli w czasie optymalnego rozwoju ziołorośli (koniec lipca, początek sierpnia).\nRok: 2011. Typ monitoringu: zintegrowany. Nazwa obszaru i dodatkowi koordynatorzy – w karcie puste. Współrzędne w przewodniku podane do minut (sekundy ucięte). Zagrożenia w karcie opisane tekstem, bez kodów – rozpisane na kody w zakładce zagrożeń.',
    photos: [],
  },
  overallComment: '',
}

export const examples6430: CardExample[] = [{ id: 'brona', label: 'Między Kościółkami a przełęczą Brona', values: brona }]
