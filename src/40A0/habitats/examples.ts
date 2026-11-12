// Przykładowe wypełnienie z karty obserwacji w przewodniku metodycznym GIOŚ (tom IV, rozdz. 40A0,
// „Przykład karty obserwacji dla siedliska przyrodniczego na stanowisku”): Garb Pińczowski, 16.05.2013.
// Teksty „wartość lub opis” przepisane z karty, selekty ustawione zgodnie z ocenami z karty.
// Ekspert zanonimizowany (Jan Kowalski). Literówki z oryginału poprawione: Cenataurea -> Centaurea,
// Crategus -> Crataegus, Cornus sanquinea -> sanguinea, Euonymus verrucosa -> verrucosus.
//
// Interpretacje (karta nie podaje liczby, a pole jej wymaga albo podpowiedź jej potrzebuje):
// - nachylenie zdjęć: karta podaje 25%, 20% i 5%, pole jest w stopniach -> 14°, 11°, 3°;
// - udział wisienki: „od 100% w dużych skupieniach po 60% w zarastających” -> 80%;
// - zwarcie innych krzewów: „średnio dla transektu 10–20%” -> 15%;
// - wojłok: „do 5–10 cm” -> minimum 5, maksimum 10 (bez średniej);
// - gatunki charakterystyczne: krzewy z karty plus krzewy i gatunki muraw ze zdjęć fitosocjologicznych
//   tej samej karty („pełny zestaw gatunków charakterystycznych muraw kserotermicznych”);
// - „Struktura przestrzenna zarośli” nie występuje w karcie z przewodnika (doszła w monitoringu 2013–2024) -> XX.
// Współrzędne są w karcie wykropkowane („50° 32'…"”) – przepisane tak, jak są.
import type { CardValues, ReleveSpeciesRow } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import { methodology40A0 } from './methodology'

type Abundance = ReleveSpeciesRow['abundance']
const layer = (l: 'A' | 'B' | 'C', list: [string, Abundance][]): ReleveSpeciesRow[] =>
  list.map(([name, abundance]) => ({ layer: l, name, abundance }))

const COORD_RELEVE = '50° 32\'…" N 20° 30\'…" E'

const releveI = {
  coords: COORD_RELEVE,
  altitude: 280,
  area: 25,
  slope: 14,
  exposure: 'S',
  coverA: 2,
  coverB: 45,
  coverC: 75,
  coverD: undefined,
  heightA: 4,
  heightB: 2,
  heightC: 40,
  heightD: undefined,
  unit: 'Inuletum ensifoliae',
  species: [
    ...layer('A', [['Betula pendula', '+']]),
    ...layer('B', [
      ['Cerasus fruticosa', '2'],
      ['Cornus sanguinea', '+'],
      ['Crataegus sp.', '1'],
      ['Euonymus verrucosus', '2'],
      ['Frangula alnus', '1'],
      ['Juniperus communis', '+'],
      ['Prunus spinosa', '2'],
      ['Rosa canina', '+'],
    ]),
    ...layer('C', [
      ['Adonis vernalis', '+'],
      ['Agrimonia eupatoria', '+'],
      ['Carex humilis', '1'],
      ['Centaurea scabiosa', '+'],
      ['Cerasus fruticosa', '1'],
      ['Elymus hispidus', '1'],
      ['Euphorbia cyparissias', '2'],
      ['Festuca rupicola', '1'],
      ['Festuca valesiaca', '+'],
      ['Fragaria viridis', '+'],
      ['Frangula alnus', '+'],
      ['Galium verum', '+'],
      ['Helianthemum nummularium', '+'],
      ['Inula ensifolia', '1'],
      ['Peucedanum cervaria', '2'],
      ['Pimpinella saxifraga', '+'],
      ['Salvia pratensis', '+'],
      ['Veronica spicata', '+'],
      ['Vincetoxicum hirundinaria', '3'],
    ]),
  ],
}

const releveII = {
  coords: COORD_RELEVE,
  altitude: 290,
  area: 25,
  slope: 11,
  exposure: 'S',
  coverA: undefined,
  coverB: 95,
  coverC: 40,
  coverD: undefined,
  heightA: undefined,
  heightB: 2,
  heightC: 25,
  heightD: undefined,
  unit: 'Prunion fruticosae',
  species: [
    ...layer('B', [
      ['Cerasus fruticosa', '5'],
      ['Cornus sanguinea', '+'],
      ['Crataegus sp.', '+'],
      ['Rosa canina', '+'],
    ]),
    ...layer('C', [
      ['Achillea millefolium', '+'],
      ['Adonis vernalis', '+'],
      ['Anemone sylvestris', '+'],
      ['Campanula bononiensis', '+'],
      ['Carex sp.', '+'],
      ['Cerasus fruticosa', '1'],
      ['Cruciata glabra', '+'],
      ['Falcaria vulgaris', '+'],
      ['Fragaria viridis', '1'],
      ['Galium verum', '1'],
      ['Inula ensifolia', '+'],
      ['Lathyrus pratensis', '+'],
      ['Peucedanum cervaria', '2'],
      ['Phleum pratense', '+'],
      ['Poa angustifolia', '2'],
      ['Polygala sp.', '+'],
      ['Salvia pratensis', '+'],
      ['Taraxacum officinale', '+'],
      ['Vincetoxicum hirundinaria', '+'],
      ['Viola hirta', '+'],
    ]),
  ],
}

const releveIII = {
  coords: COORD_RELEVE,
  altitude: 270,
  area: 25,
  slope: 3,
  exposure: 'S',
  coverA: 25,
  coverB: 75,
  coverC: 40,
  coverD: undefined,
  heightA: 3,
  heightB: 2,
  heightC: 20,
  heightD: undefined,
  unit: 'Inuletum ensifoliae',
  species: [
    ...layer('A', [['Pyrus communis', '2']]),
    ...layer('B', [
      ['Cerasus fruticosa', '4'],
      ['Crataegus sp.', '+'],
      ['Frangula alnus', '+'],
      ['Fraxinus excelsior', '+'],
      ['Rosa canina', '2'],
    ]),
    ...layer('C', [
      ['Achillea pannonica', '+'],
      ['Agrimonia eupatoria', '+'],
      ['Carex humilis', '+'],
      ['Cerasus fruticosa', '1'],
      ['Elymus hispidus', '1'],
      ['Euphorbia cyparissias', '1'],
      ['Festuca rupicola', '+'],
      ['Galium verum', '+'],
      ['Helianthemum nummularium', '+'],
      ['Inula ensifolia', '3'],
      ['Medicago falcata', '+'],
      ['Peucedanum cervaria', '+'],
      ['Pimpinella saxifraga', '1'],
      ['Potentilla arenaria', '+'],
      ['Rosa sp.', '+'],
      ['Salvia pratensis', '1'],
      ['Scabiosa ochroleuca', '+'],
      ['Thymus austriacus', '2'],
      ['Thymus kosteleckyanus', '+'],
      ['Viola hirta', '+'],
    ]),
  ],
}

const sp = (...names: string[]) => names.map((name) => ({ name }))

export const garbPinczowski: CardValues = {
  ...emptyCardValues(methodology40A0),
  site: {
    siteName: 'Garb Pińczowski',
    guid: '',
    variant: 'cerasus',
    siteType: 'Referencyjne',
    communities: 'Inuletum ensifoliae, Thalictro-Salvietum, Rhamno-Prunetea, Prunetum fruticosae',
    description:
      'Zarośla wisienki tworzą lokalnie, w pełni zwarte płaty u południowych podnóży garbu Pińczowskiego (na dawnych odłogach) i na jego zboczach, zwłaszcza w ich dolnej partii. Mają różną powierzchnię, od 0,5 do kilku arów. Pomiędzy nimi występuje wisienka w mniejszych skupieniach, i mniejszym zwarciu – do 50%. Zarośla tworzą się na murawach kserotermicznych z klasy Festuco-Brometea, a towarzyszą im kępy zarośli z kl. Rhamno-Prunetea. Miejscami murawy zajęte są przez łanowo rozrastające się trawy – trzcinnik lub perz.',
    areaHa: 0.12,
    protectedAreas: 'Ostoja Nidziańska PLH260003\nNadnidziański Park Krajobrazowy',
    manager: 'Własność prywatna',
    coordStart: '50° 32\'…" N 20° 30\'…" E',
    coordMiddle: '50° 32\'…" N 20° 30\'…" E',
    coordEnd: '50° 32\'…" N 20° 30\'…" E',
    transect: 'Powierzchnia prostokątna o wymiarach 10x200 m',
    altitude: '270–290',
    date: '2013-05-16',
    observer: 'Jan Kowalski',
    additionalExperts: '',
  },
  releves: [releveI, releveII, releveIII],
  indicators: {
    area: { inputs: { choice: 'stable' }, value: '0,12 ha', grade: 'FV' },
    transectShare: { inputs: { share: 70 }, value: '70%', grade: 'FV' },
    patchStructure: {
      inputs: { choice: 'none' },
      value:
        'Skupienia duże (nawet ponad 1,5 a), z szeregiem rozproszonych mniejszych skupień i poj. krzewów wisienki – ekspansja zarośli',
      grade: 'FV',
    },
    shrubStructure: {
      inputs: { choice: 'noData' },
      value: 'Wskaźnika nie było w karcie z 2013 r. (wprowadzony w monitoringu 2013–2024)',
      grade: 'XX',
    },
    characteristic: {
      inputs: {
        species: sp(
          'Cerasus fruticosa',
          'Crataegus sp.',
          'Rosa sp.',
          'Cornus sanguinea',
          'Prunus spinosa',
          'Euonymus verrucosus',
          'Inula ensifolia',
          'Carex humilis',
          'Festuca rupicola',
          'Peucedanum cervaria',
          'Vincetoxicum hirundinaria',
          'Adonis vernalis',
          'Euphorbia cyparissias',
          'Helianthemum nummularium',
        ),
      },
      value:
        'Wisienka stepowa Cerasus fruticosa, głóg Crataegus sp., róża Rosa sp., dereń Cornus sanguinea; pełny zestaw gatunków charakterystycznych muraw kserotermicznych z kl. Festuco-Brometea',
      grade: 'FV',
    },
    charState: { inputs: { choice: 'good' }, value: 'Dobry, brak oznak chorób lub uszkodzeń', grade: 'FV' },
    keyShare: {
      inputs: { cover: 80 },
      value:
        'Od 100% w dużych skupieniach, po 60% w zarastających innymi krzewami; dominują płaty z bezwzględną dominacją wisienki',
      grade: 'FV',
    },
    otherShrubs: { inputs: { species: [], cover: 15 }, value: 'Od 0 do 30%; średnio dla transektu: 10–20%', grade: 'FV' },
    height: {
      inputs: { min: 20, max: 70, mean: 50 },
      value: 'Od 20–30 cm do max. 70 cm; śr. ok. 50 cm',
      grade: 'FV',
    },
    invasive: { inputs: { species: [] }, value: 'Brak', grade: 'FV' },
    expansive: {
      inputs: {
        species: [
          { name: 'Calamagrostis epigejos', cover: 10 },
          { name: 'Elymus hispidus', cover: 15 },
        ],
        cover: undefined,
      },
      value: 'Trzcinnik Calamagrostis epigejos – 10%, perz siny Elymus hispidus – 15%',
      grade: 'FV',
    },
    litter: { inputs: { min: 5, max: 10, mean: undefined }, value: 'Do 5–10 cm', grade: 'FV' },
  },
  prospects: {
    value:
      'Zarośla rozrosły się w stosunku do obserwacji z końca lat 90. XX w. Zajęły dawne odłogi, zwiększając swoją powierzchnię. Wycofały się natomiast z miejsc, gdzie były obserwowane wcześniej. Ze względu na dużą powierzchnię muraw na Garbie Pińczowskim istnieje potencjalnie rozległe siedlisko, które może być zajęte przez wisienkę. Brak działań ochronnych i rzeczywistej ochrony prawnej tego terenu – własność prywatna, projektowany od lat obszar chroniony, pierwotnie rezerwat roślinności kserotermicznej, potem użytek ekologiczny Serpentyny, nie zrealizowany; w dłuższej perspektywie konieczne prawne rozwiązania.',
    grade: 'FV',
  },
  impacts: [
    {
      code: 'A02',
      name: 'Zmiana sposobu uprawy',
      influence: '+',
      intensity: 'H',
      description:
        'Zaprzestano uprawy na części pól u podnóży stoków, utworzyły się odłogi, kolonizowane przez roślinność kserotermiczną',
    },
    {
      code: 'A04.03',
      name: 'Zarzucenie pasterstwa, brak wypasu',
      influence: '-',
      intensity: 'H',
      description: 'Brak użytkowania pasterskiego – prowadzi do zarastania muraw',
    },
    { code: 'B01.01', name: 'Zalesianie terenów otwartych (drzewa rodzime)', influence: '-', intensity: 'L', description: 'Część dawnych pól jest stopniowo zalesiana' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe', influence: '0', intensity: 'L', description: 'Szereg ścieżek przebiega przez Garb Pińczowski' },
    { code: 'K01.01', name: 'Erozja', influence: '+', intensity: 'L', description: 'Strome partie zboczy ulegają erozji, odsłaniając podłoże – opokę kredową' },
    {
      code: 'K02.01',
      name: 'Zmiana składu gatunkowego (sukcesja)',
      influence: '-',
      intensity: 'M',
      description:
        'Wpływ w karcie: −/+. Część muraw zarasta krzewami, stopniowo wkraczają też drzewa; miejscami wzrasta bujność murawy',
    },
    {
      code: 'K02.02',
      name: 'Nagromadzenie materii organicznej',
      influence: '0',
      intensity: 'M',
      description: 'Na nie użytkowanych fragmentach gromadzi się nie rozłożona warstwa materii organicznej',
    },
  ],
  threats: [
    {
      code: 'K02.01',
      name: 'Zmiana składu gatunkowego (sukcesja)',
      description: 'Sukcesja krzewów tarniny, głogu, derenia, wkraczające sosny, brzozy',
    },
    { code: 'B01.01', name: 'Zalesianie terenów otwartych (drzewa rodzime)', description: 'Zalesienia dawnych odłogów' },
  ],
  other: {
    otherValues:
      'Szereg gatunków rzadkich i chronionych prawnie: storczyk drobnokwiatowy Orchis ustulata, miłek wiosenny Adonis vernalis, sasanka łąkowa Pulsatilla pratensis, zawilec wielkokwiatowy Anemone sylvestris, len włochaty Linum hirsutum, dziewięćsił popłocholistny Carlina onopordifolia; murawy kserotermiczne – siedlisko 6210. Murawy kserotermiczne zajmujące duże powierzchnie, miejsce występowania szeregu rzadkich gatunków roślin naczyniowych, w tym także uznanych za zagrożone w Polsce.',
    conservation: 'Brak',
    proposals: 'Utrzymywanie zwarcia krzewów (innych niż wisienka) w murawie na poziomie do 30%',
    notes:
      'Monitoring jest wymagany: tak – jedno z największych, aktualnie znanych stanowisk siedliska 40A0.\nInne obserwacje: późna wiosna.\nUwagi metodyczne: optymalny termin obserwacji – I połowa maja.',
    photos: [],
  },
  overallComment:
    'Powierzchnia siedliska o różnym stanie zachowania na stanowisku: FV – 90%, U1 – 10%, U2 – brak.',
}

export const examples40A0 = [{ id: 'garb-pinczowski', label: 'Garb Pińczowski', values: garbPinczowski }]
