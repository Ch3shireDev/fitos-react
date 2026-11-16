// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Stańko 2010, rozdz. 7110, pkt 3 „Przykład wypełnionej karty
// obserwacji”): Supraśl, 30.06.2008, 7110-1 niżowe torfowiska wysokie, stanowisko referencyjne, monitoring zintegrowany.
// Koordynator zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („N 53°11′; E 23°20′”) – przepisane tak samo w każdym punkcie;
//  • zdjęcia fitosocjologiczne jak w karcie (100, 100 i 10 m², nie standardowe 25 m²); warstwa b „<1%” → 0,5,
//    wysokość c „1 m” i d „0,3 m” → 100 i 30 cm;
//  • gatunki charakterystyczne: lista z karty plus torfowiec kończysty 30% z wiersza „Pokrycie i struktura torfowców”
//    (gatunek z listy tab. 1, na transekcie jest) – bez niego wychodzą 2 torfowce, czyli U1 zamiast FV z karty;
//  • torfowce: karta pisze „40% zajęte przez torfowce, w tym S. magellanicum 60%, S. rubellum 2%, S. fallax 30%”,
//    a w gatunkach charakterystycznych S. magellanicum ma 60% transektu, warstwa d w zdjęciach 90–100%. Przyjęto
//    pokrycia transektu (60 + 2 + 30 = 92%, kępkowe 67%) → FV jak w karcie; dosłowne „40%” dałoby U1;
//  • karta: „Obecność krzewów i drzew” U2 (sosna 40%), a mimo to „Specyficzna struktura i funkcje” FV i ocena ogólna FV.
//    Wskaźnik jest kardynalny, więc wg tab. 2 struktura i ocena ogólna to U2 – formularz liczy U2 (przewodnik
//    jest tu sam ze sobą sprzeczny). W 2021 r. stanowisko Supraśl wyłączono z monitoringu – przeszło w bór bagienny;
//  • oddziaływania: intensywność C → L (słaba), B → M (średnia); wpływ gospodarki leśnej w PDF-ie zgubiony
//    (prawdopodobnie „–”, bo opis mówi o możliwym negatywnym wpływie).
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology7110 } from './methodology'

const COORD = 'N 53°11′; E 23°20′'

type L = 'A' | 'B' | 'C' | 'D'
const releve = (
  o: { area: number; coverA?: number; coverC: number; coverD: number; heightA?: number; heightC: number; unit: string },
  species: [L, string, string][],
) => ({
  coords: COORD,
  altitude: 145,
  area: o.area,
  slope: 0,
  exposure: 'brak',
  coverA: o.coverA,
  coverB: 0.5,
  coverC: o.coverC,
  coverD: o.coverD,
  heightA: o.heightA,
  heightB: 1,
  heightC: o.heightC,
  heightD: 30,
  unit: o.unit,
  species: species.map(([layer, name, abundance]) => ({ layer, name, abundance })),
})

const iv = (inputs: Record<string, unknown>, value: string, grade: 'FV' | 'U1' | 'U2') => ({ inputs: { ...inputs, note: value }, value, grade })

export const suprasl: CardValues = {
  ...emptyCardValues(methodology7110),
  site: {
    siteName: 'Supraśl',
    guid: '',
    subtype: '7110-1',
    communities: 'Ledo-Sphagnetum magellanici typicum, Ledo-Sphagnetum magellanici pinetosum, Sphagnetum magellanici, Caricetum limosae',
    description: 'Nadleśnictwo Supraśl, oddział 264, niecka wytopiskowa, przy drodze między Supraślem a osadą Krasny Las.',
    areaHa: 3,
    protectedAreas: 'PLH200006 Ostoja Knyszyńska\nPark Krajobrazowy Puszczy Knyszyńskiej',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '10x200 m',
    altitude: '145–147',
    date: '2008-06-30',
    observer: 'Jan Kowalski',
  },
  releves: [
    releve({ area: 100, coverA: 5, coverC: 40, coverD: 100, heightA: 3, heightC: 100, unit: 'Ledo-Sphagnetum magellanici typicum' }, [
      ['A', 'Pinus sylvestris', '1'],
      ['B', 'Picea abies', '+'],
      ['C', 'Andromeda polifolia', '+'],
      ['C', 'Drosera rotundifolia', '1'],
      ['C', 'Eriophorum vaginatum', '3'],
      ['C', 'Ledum palustre', '2'],
      ['C', 'Pinus sylvestris', '+'],
      ['C', 'Vaccinium myrtillus', '+'],
      ['C', 'Oxycoccus palustris', '3'],
      ['D', 'Aulacomnium palustre', '1'],
      ['D', 'Dicranum polysetum', '+'],
      ['D', 'Polytrichum strictum', '+'],
      ['D', 'Sphagnum angustifolium', '+'],
      ['D', 'Sphagnum magellanicum', '4'],
      ['D', 'Sphagnum fallax', '2'],
      ['D', 'Sphagnum rubellum', '+'],
    ]),
    releve({ area: 100, coverA: 30, coverC: 60, coverD: 100, heightA: 3, heightC: 100, unit: 'Ledo-Sphagnetum magellanici pinetosum' }, [
      ['A', 'Pinus sylvestris', '5'],
      ['B', 'Pinus sylvestris', '+'],
      ['C', 'Andromeda polifolia', '+'],
      ['C', 'Betula pubescens', '+'],
      ['C', 'Drosera rotundifolia', '+'],
      ['C', 'Eriophorum vaginatum', '3'],
      ['C', 'Ledum palustre', '2'],
      ['C', 'Pinus sylvestris', '+'],
      ['C', 'Quercus robur', '+'],
      ['C', 'Vaccinium myrtillus', '+'],
      ['C', 'Oxycoccus palustris', '1'],
      ['D', 'Aulacomnium palustre', '1'],
      ['D', 'Dicranum undulatum', '+'],
      ['D', 'Dicranum polysetum', '+'],
      ['D', 'Polytrichum strictum', '1'],
      ['D', 'Sphagnum angustifolium', '+'],
      ['D', 'Sphagnum magellanicum', '3'],
      ['D', 'Sphagnum fallax', '2'],
      ['D', 'Sphagnum rubellum', '+'],
    ]),
    releve({ area: 10, coverC: 20, coverD: 90, heightC: 50, unit: 'Sphagnetum magellanici, Caricetum limosae (dolinki)' }, [
      ['B', 'Pinus sylvestris', '+'],
      ['C', 'Andromeda polifolia', '1'],
      ['C', 'Carex limosa', '1'],
      ['C', 'Carex lasiocarpa', '+'],
      ['C', 'Drosera rotundifolia', '1'],
      ['C', 'Eriophorum vaginatum', '3'],
      ['C', 'Scheuchzeria palustris', '1'],
      ['C', 'Oxycoccus palustris', '2'],
      ['D', 'Sphagnum angustifolium', '+'],
      ['D', 'Sphagnum fallax', '3'],
      ['D', 'Sphagnum magellanicum', '3'],
      ['D', 'Sphagnum rubellum', '+'],
    ]),
  ],
  indicators: {
    area: iv({ choice: 'stable', areaHa: 3 }, '3 ha', 'FV'),
    characteristic: iv(
      {
        species: [
          { name: 'Ledum palustre', cover: 30 },
          { name: 'Drosera rotundifolia', cover: 1 },
          { name: 'Andromeda polifolia', cover: 2 },
          { name: 'Eriophorum vaginatum', cover: 50 },
          { name: 'Oxycoccus palustris', cover: 15 },
          { name: 'Sphagnum magellanicum', cover: 60 },
          { name: 'Sphagnum rubellum', cover: 2 },
          { name: 'Sphagnum fallax', cover: 30 },
        ],
      },
      'Warstwa c: bagno zwyczajne Ledum palustre 30%, rosiczka okrągłolistna Drosera rotundifolia 1%, modrzewnica zwyczajna Andromeda polifolia 2%, wełnianka pochwowata Eriophorum vaginatum 50%, żurawina błotna Vaccinium oxycoccus 15%; warstwa d: torfowiec magellański Sphagnum magellanicum 60%, torfowiec czerwonawy Sphagnum rubellum 2%',
      'FV',
    ),
    dominant: iv(
      {
        species: [
          { name: 'Pinus sylvestris', cover: 40 },
          { name: 'Ledum palustre', cover: 30 },
          { name: 'Vaccinium uliginosum', cover: 15 },
          { name: 'Eriophorum vaginatum', cover: 30 },
          { name: 'Oxycoccus palustris', cover: 15 },
          { name: 'Vaccinium myrtillus' },
          { name: 'Sphagnum magellanicum', cover: 20 },
          { name: 'Sphagnum fallax', cover: 10 },
        ],
      },
      'Warstwa a: sosna zwyczajna Pinus sylvestris 40%; warstwa c: bagno zwyczajne Ledum palustre 30%, borówka bagienna Vaccinium uliginosum 15%, wełnianka pochwowata Eriophorum vaginatum 30%, żurawina błotna Vaccinium oxycoccus 15%, borówka czernica; warstwa d: torfowiec magellański Sphagnum magellanicum 20%, torfowiec kończysty Sphagnum fallax 10%',
      'FV',
    ),
    sphagnum: iv(
      {
        species: [
          { name: 'Sphagnum magellanicum', cover: 60 },
          { name: 'Sphagnum rubellum', cover: 2 },
          { name: 'Sphagnum fallax', cover: 30 },
        ],
        cover: undefined,
        hummockShare: undefined,
      },
      '40% zajęte przez torfowce, w tym torfowiec magellański Sphagnum magellanicum 60%, torfowiec czerwonawy Sphagnum rubellum 2%, torfowiec kończysty Sphagnum fallax 30%',
      'FV',
    ),
    invasive: iv({ amount: 'none', species: [], cover: undefined }, 'Nie stwierdzono', 'FV'),
    expansive: iv({ species: [], cover: 0 }, 'Nie stwierdzono', 'FV'),
    hydration: iv({ choice: 'high' }, 'Torfowisko lekko przesuszone (w części z Ledo-Sphagnetum magellanici), woda na poziomie 10 cm', 'FV'),
    surface: iv({ choice: 'hummockHollow' }, 'Zgodna z wzorcem', 'FV'),
    peat: iv({ choice: 'never', method: '' }, 'Nie ma śladów pozyskania', 'FV'),
    drainage: iv({ choice: 'none' }, 'Siedlisko znajduje się w dość głębokiej niecce wytopiskowej otoczonej borami, obszar trudny do odwodnienia rowami', 'FV'),
    woody: iv({ species: [{ name: 'Pinus sylvestris', cover: 40 }], treeCover: undefined, shrubCover: undefined }, 'Sosna zwyczajna Pinus sylvestris 40%', 'U2'),
  },
  prospects: {
    value: 'Perspektywy zachowania siedliska dobre, nie przewiduje się znacznego oddziaływania czynników zagrażających',
    grade: 'FV',
  },
  impacts: [
    { code: 'F04.02', name: 'Zbieractwo (grzyby, porosty, jagody)', influence: '0', intensity: 'L', description: 'Pozyskiwanie żurawiny przez miejscową ludność' },
    { code: 'D01.02', name: 'Drogi, autostrady', influence: '0', intensity: 'M', description: 'Możliwy negatywny wpływ w razie rozbudowy drogi – eutrofizacja okrajka' },
    {
      code: 'B02',
      name: 'Gospodarka leśna – ogólnie',
      influence: '-',
      intensity: 'L',
      description: 'Możliwy negatywny wpływ przy wykonaniu zrębów zupełnych w otoczeniu niecki wytopiskowej',
    },
  ],
  threats: [],
  other: {
    otherValues:
      'Rzadkie rośliny: rosiczka okrągłolistna Drosera rotundifolia, bagno zwyczajne Ledum palustre, bagnica torfowa Scheuchzeria palustris, turzyca bagienna Carex limosa.\nInne rzadkie siedliska występujące w kompleksie z badanym siedliskiem: 91D0-2 bór sosnowy bagienny.',
    conservation: '',
    notes:
      'Typ stanowiska: referencyjny. Zarządzający terenem: Nadleśnictwo Supraśl w Supraślu. Nazwa obszaru: PLH200006 Ostoja Knyszyńska. Rok 2008, monitoring zintegrowany. Monitoring jest wymagany: tak – obiekt cenny przyrodniczo, wyjątkowy na obszarze Puszczy Knyszyńskiej.',
    photos: [],
  },
  overallComment: 'Udział powierzchni siedliska o różnym stanie zachowania na stanowisku: FV 90%, U1 5%, U2 –.',
}

export const examples7110: CardExample[] = [{ id: 'suprasl', label: 'Supraśl', values: suprasl }]
