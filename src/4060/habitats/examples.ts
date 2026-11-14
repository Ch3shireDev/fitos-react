// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Świerkosz 2012, rozdz. 4060, pkt 3 „Przykład wypełnionej
// karty obserwacji”): Karkonosze, stanowisko Kopa, 24.08.2011. Koordynatorzy i obserwator zanonimizowani (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („15° 43′ …″E – 50° 44′ …″N”) – przepisane do minut;
//  • zdjęcia fitosocjologiczne jak w karcie (warstwy C i D; siewki kosówki, wierzba śląska i jarząb w C, jak w oryginale;
//    literówka „Calamagrostis villlosa” poprawiona);
//  • gatunki charakterystyczne: bażyna obupłciowa „2–5%” → 5, borówka halna „sporadycznie” → 0,5; razem 5,5% > 5% → FV,
//    zgodnie z opisem karty („z udziałem powyżej 5% na stanowisku”);
//  • gatunki dominujące: wrzos „20–30%” → 30, borówka czarna „10–30%” → 30; największy dominant 30% < 50% → FV;
//  • kosodrzewina: „pojedyncze siewki” → 0,5% → FV;
//  • oddziaływań brak („Nie stwierdzono oddziaływań ze strony gospodarki człowieka”), zagrożeń brak;
//  • udział powierzchni o różnym stanie zachowania (FV 100%, U1 0%, U2 0%) – w polach „Inne informacje”.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology4060 } from './methodology'

const COORD = 'N 50°44′; E 15°43′'

type Row = [layer: 'C' | 'D', name: string, abundance: string]
const releve = (o: { area: number; slope: number; exposure: string; coverC: number; coverD?: number }, species: Row[]) => ({
  coords: COORD,
  altitude: 1325,
  unit: 'Empetro-Vaccinietum',
  coverB: undefined,
  coverD: undefined,
  heightB: undefined,
  heightC: undefined,
  heightD: undefined,
  ...o,
  species: species.map(([layer, name, abundance]) => ({ layer, name, abundance })),
})

export const kopa: CardValues = {
  ...emptyCardValues(methodology4060),
  site: {
    siteName: 'Kopa',
    guid: '',
    siteType: 'referencyjne',
    communities: 'Empetro-Vaccinietum',
    description:
      'Płaty siedliska rozwinęły się na granitowych wychodniach skalnych na E stokach Kopy, na bardzo stromych stokach nad Kotłem Łomniczki, przy nachyleniu osiągającym 45°. Jest silnie eksponowane i narażone na surowe warunki atmosferyczne. Siedlisko przyjmuje w tym miejscu postać suchą z większym udziałem krzewinek (borówka czarna Vaccinium myrtillus, wrzos zwyczajny Calluna vulgaris). Ponadto, w płatach pojawiają się inne taksony typowe dla siedliska: bażyna obupłciowa Empetrum hermaphroditum, śmiałek pogięty Deschampsia flexuosa, borówka halna Vaccinium gaultherioides.',
    areaHa: 0.006,
    protectedAreas: 'Karkonoski Park Narodowy; PLH020006 „Karkonosze”',
    manager: 'Karkonoski Park Narodowy',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: 'Niestandardowy na skutek rozproszenia płatów siedliska',
    altitude: '1325',
    date: '2011-08-24',
    observer: 'Jan Kowalski',
  },
  releves: [
    releve({ area: 20, slope: 45, exposure: 'NE', coverC: 60, coverD: 2 }, [
      ['C', 'Calamagrostis villosa', '+'],
      ['C', 'Calluna vulgaris', '3'],
      ['C', 'Deschampsia flexuosa', '2'],
      ['C', 'Empetrum hermaphroditum', '+'],
      ['C', 'Molinia caerulea', '+'],
      ['C', 'Pinus mugo', '+'],
      ['C', 'Vaccinium myrtillus', '1'],
      ['C', 'Vaccinium vitis-idaea', '+'],
      ['D', 'Polytrichum piliferum', '1'],
      ['D', 'Pleurozium schreberi', '1'],
      ['D', 'Cladonia sp.', '+'],
    ]),
    releve({ area: 12, slope: 40, exposure: 'E', coverC: 70, coverD: 5 }, [
      ['C', 'Athyrium distentifolium', 'r'],
      ['C', 'Calamagrostis villosa', '+'],
      ['C', 'Calluna vulgaris', '3'],
      ['C', 'Deschampsia cespitosa', '+'],
      ['C', 'Deschampsia flexuosa', '1'],
      ['C', 'Empetrum hermaphroditum', '1'],
      ['C', 'Gentiana asclepiadea', '+'],
      ['C', 'Molinia caerulea', '+'],
      ['C', 'Pinus mugo', '+'],
      ['C', 'Salix silesiaca', '+'],
      ['C', 'Sorbus aucuparia var. glabrata', 'r'],
      ['C', 'Vaccinium myrtillus', '2'],
      ['C', 'Vaccinium vitis-idaea', '+'],
      ['D', 'Polytrichum piliferum', '+'],
      ['D', 'Polytrichum commune', '1'],
    ]),
    releve({ area: 20, slope: 45, exposure: 'E', coverC: 100 }, [
      ['C', 'Calamagrostis villosa', 'r'],
      ['C', 'Calluna vulgaris', '2'],
      ['C', 'Empetrum hermaphroditum', '+'],
      ['C', 'Molinia caerulea', '1'],
      ['C', 'Pinus mugo', '+'],
      ['C', 'Sorbus aucuparia var. glabrata', 'r'],
      ['C', 'Vaccinium myrtillus', '3'],
      ['C', 'Vaccinium vitis-idaea', '1'],
    ]),
  ],
  indicators: {
    area: {
      inputs: { choice: 'stable', areaHa: undefined, note: 'Całość dostępnego siedliska zajęta przez zbiorowisko' },
      value: 'Całość dostępnego siedliska zajęta przez zbiorowisko',
      grade: 'FV',
    },
    species: {
      inputs: {
        species: [
          { name: 'Empetrum hermaphroditum', cover: 5 },
          { name: 'Vaccinium gaultherioides', cover: 0.5 },
        ],
        total: undefined,
        note: 'Obecne oba gatunki charakterystyczne, z udziałem powyżej 5% na stanowisku. Bażyna obupłciowa Empetrum hermaphroditum – 2–5% pokrycia, borówka halna Vaccinium gaultherioides – sporadycznie.',
      },
      value:
        'Obecne oba gatunki charakterystyczne, z udziałem powyżej 5% na stanowisku. Bażyna obupłciowa Empetrum hermaphroditum – 2–5% pokrycia, borówka halna Vaccinium gaultherioides – sporadycznie.',
      grade: 'FV',
    },
    dominants: {
      inputs: {
        species: [
          { name: 'Calluna vulgaris', cover: 30 },
          { name: 'Vaccinium myrtillus', cover: 30 },
        ],
        value: undefined,
        none: '',
        note: 'Brak gatunku dominującego z udziałem powyżej 30% pokrycia. Wysoki udział borówki czarnej Vaccinium myrtillus i wrzosu zwyczajnego Calluna vulgaris jest typowy dla tej postaci siedliska. Wrzos zwyczajny Calluna vulgaris – 20–30% pokrycia, borówka czarna Vaccinium myrtillus 10–30% pokrycia.',
      },
      value:
        'Brak gatunku dominującego z udziałem powyżej 30% pokrycia. Wysoki udział borówki czarnej Vaccinium myrtillus i wrzosu zwyczajnego Calluna vulgaris jest typowy dla tej postaci siedliska. Wrzos zwyczajny Calluna vulgaris – 20–30% pokrycia, borówka czarna Vaccinium myrtillus 10–30% pokrycia.',
      grade: 'FV',
    },
    mugo: {
      inputs: { value: 0.5, species: [{ name: 'Pinus mugo' }], note: 'Nie obserwowano ekspansji gatunku. W płatach pojedyncze siewki kosodrzewiny Pinus mugo.' },
      value: 'Nie obserwowano ekspansji gatunku. W płatach pojedyncze siewki kosodrzewiny Pinus mugo.',
      grade: 'FV',
    },
    mechanical: { inputs: { choice: 'none', note: 'Brak' }, value: 'Brak', grade: 'FV' },
  },
  prospects: {
    value: 'Perspektywy ochrony siedliska bardzo dobre. Siedlisko znajduje się w granicach parku narodowego w miejscu praktycznie niedostępnym.',
    grade: 'FV',
  },
  impacts: [],
  threats: [],
  other: {
    otherValues:
      'W sąsiedztwie stanowiska doskonale wykształcony kompleks siedlisk subalpejskich z wieloma gatunkami chronionymi, w tym z gnidoszem sudeckim Pedicularis sudetica, dzwonkiem karkonoskim Campanula bohemica i czosnkiem syberyjskim Allium sibiricum.',
    conservation: 'Wykonywane działania ochronne: nie wymagane. Propozycje wprowadzenia działań ochronnych: ochrona bierna.',
    shareFV: 100,
    shareU1: 0,
    shareU2: 0,
    notes:
      'Raport roczny 2011, monitoring zintegrowany. Zagrożenia: nie stwierdzono. Nie stwierdzono oddziaływań ze strony gospodarki człowieka. Monitoring jest wymagany – zagrożenia długofalowe (eutrofizacja, ocieplanie klimatu). Termin badań (24.08.2011) kilka dni po optymalnym oknie metodyki (koniec czerwca – połowa sierpnia).',
    photos: [],
  },
  overallComment: '',
}

export const examples4060: CardExample[] = [{ id: 'kopa', label: 'Kopa', values: kopa }]
