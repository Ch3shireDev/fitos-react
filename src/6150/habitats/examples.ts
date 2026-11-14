// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Kozak, Kozłowska, Mróz 2012, rozdz. 6150, pkt 3 „Przykład
// wypełnionej karty obserwacji”): Kopa Kondracka (Tatry), 05.08.2011. Obserwatorzy zanonimizowani (Jan Kowalski i trzy
// osoby w „Dodatkowych ekspertach”).
//  • współrzędne w przewodniku są ucięte do minut („49° 14′ …″N – 19° 55′ …″E”) – przepisane do minut;
//  • „Data wypełnienia: –” – w uwagach;
//  • powierzchnia siedliska: w komórce wartości karty jest też „Powierzchnia siedliska o różnym stanie zachowania na
//    stanowisku” – to etykieta wiersza oceny ogólnej rozcięta łamaniem tabeli, nie część wartości;
//  • gatunki ekspansywne: „Borówka brusznica Vaccinium vitis-idaea (<5%)” – pokrycie 5 (górna granica) w liście;
//  • krzewy: karta podaje tylko zwarcie łączne („ok. 2%”, kosodrzewina i świerk) – w polu „Łączne zwarcie”;
//  • zdjęcia: warstwa (D) jak w karcie, pozostałe gatunki w C (także kosodrzewina w zdjęciu III); „V. vitis-idaea” →
//    Vaccinium vitis-idaea; zdjęcia mają tylko warstwy c i d;
//  • karta nie ma tabel oddziaływań i zagrożeń – zostają puste; perspektywy wg karty.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology6150 } from './methodology'

const COORD = '49°14′ N – 19°55′ E'
const UNIT = 'Oreochloo distichae-Juncetum trifidi'

type Row = [layer: 'C' | 'D', name: string, abundance: string]
/** „Agrostis rupestris 1; Cetraria islandica (D) 1; …” → wiersze; „(D)” – warstwa D, reszta – C. */
const list = (spec: string): Row[] =>
  spec.split('; ').map((s) => {
    const i = s.lastIndexOf(' ')
    const name = s.slice(0, i)
    const d = name.endsWith(' (D)')
    return [d ? 'D' : 'C', d ? name.slice(0, -4) : name, s.slice(i + 1)]
  })

const releve = (o: { altitude: number; exposure: string; coverD: number; heightC: number }, spec: string) => ({
  coords: COORD,
  area: 25,
  slope: 40,
  coverA: undefined,
  coverB: undefined,
  coverC: 90,
  heightA: undefined,
  heightB: undefined,
  heightD: undefined,
  unit: UNIT,
  ...o,
  species: list(spec).map(([layer, name, abundance]) => ({ layer, name, abundance })),
})

const CHARACTERISTIC_NOTE =
  'Dziewięć gatunków: mietlica skalna Agrostis rupestris, owsica pstra Avenula versicolor, dzwonek alpejski Campanula alpina, kostrzewa niska Festuca airoides, jastrzębiec alpejski Hieracium alpinum, wroniec widlasty Huperzia selago, sit skucina Juncus trifidus, boimka dwurzędowa Oreochloa disticha, sasanka alpejska Pulsatilla alba. Gatunki te zdecydowanie dominują na transekcie.'

export const kopaKondracka: CardValues = {
  ...emptyCardValues(methodology6150),
  site: {
    subtype: '6150-1',
    massif: 'Tatry',
    siteName: 'Kopa Kondracka',
    guid: '',
    protectedAreas: 'Sieć Natura 2000: Specjalny Obszar Ochrony Siedlisk oraz Obszar Specjalnej Ochrony Ptaków „Tatry” (PLC120001); Tatrzański Park Narodowy',
    description:
      'Zwarte i typowo wykształcone murawy acidofilne porastające północno-zachodnie zbocza Kopy Kondrackiej („czapka krystaliczna” Czerwonych Wierchów). W obrębie transektu znikomy udział kosodrzewiny, około 2%.\nW pobliżu stanowiska zwarte płaty kosodrzewiny. W odległości kilkudziesięciu metrów przebiega uczęszczany szlak turystyczny.',
    communities: 'Oreochloo distichae-Juncetum trifidi',
    areaHa: '0,12 ha (100% transektu). Poza transektem siedlisko zajmuje w tym rejonie ok. 7 ha. Areał stabilny.',
    transect: '120x10 m',
    coordStart: '49°14′ N – 19°55′ E',
    coordMiddle: '49°14′ N – 19°55′ E',
    coordEnd: '49°14′ N – 19°55′ E',
    altitude: '1785–1820',
    observer: 'Jan Kowalski',
    additionalExperts: 'Anna Nowak, Piotr Wiśniewski, Ewa Zielińska',
    date: '2011-08-05',
  },
  releves: [
    releve(
      { altitude: 1785, exposure: 'NW', coverD: 60, heightC: 20 },
      'Cetraria islandica (D) 2; Cladonia sp. (D) 1; Deschampsia flexuosa 1; Festuca airoides 2; Hieracium alpinum 2; Juncus trifidus 4; Luzula alpino-pilosa +; Oreochloa disticha 1; Pleurozium schreberi (D) 3; Polytrichum sp. (D) 2; Vaccinium myrtillus +',
    ),
    releve(
      { altitude: 1800, exposure: 'W', coverD: 5, heightC: 20 },
      'Agrostis rupestris 1; Avenula versicolor +; Cetraria islandica (D) 1; Deschampsia flexuosa 2; Festuca airoides 1; Hieracium alpinum 2; Juncus trifidus 4; Luzula alpino-pilosa 2; Oreochloa disticha 1',
    ),
    releve(
      { altitude: 1820, exposure: 'NW', coverD: 10, heightC: 15 },
      'Agrostis rupestris 1; Cetraria islandica (D) 1; Cladonia sp. (D) +; Deschampsia flexuosa +; Festuca airoides +; Hieracium alpinum 1; Homogyne alpina +; Huperzia selago +; Juncus trifidus 4; Oreochloa disticha 1; Pinus mugo +; Polygonum bistorta +; Sphagnum sp. (D) +; Vaccinium myrtillus +; Vaccinium vitis-idaea 3',
    ),
  ],
  indicators: {
    area: {
      inputs: { choice: 'stable', areaText: '0,12 ha', note: 'Siedlisko zajmuje 100% powierzchni stanowiska.' },
      value: 'Siedlisko zajmuje 100% powierzchni stanowiska.',
      grade: 'FV',
    },
    bilberry: {
      inputs: { cover: 2, none: '', note: 'Zwarcie znikome (ok. 1–2%).' },
      value: 'Zwarcie znikome (ok. 1–2%).',
      grade: 'FV',
    },
    shrubs: {
      inputs: {
        species: [{ name: 'Pinus mugo' }, { name: 'Picea abies' }],
        total: 2,
        none: '',
        note: 'Zwarcie znikome (ok. 2%) (kosodrzewina Pinus mugo, świerk pospolity Picea abies).',
      },
      value: 'Zwarcie znikome (ok. 2%) (kosodrzewina Pinus mugo, świerk pospolity Picea abies).',
      grade: 'FV',
    },
    characteristic: {
      inputs: {
        species: [
          { name: 'Agrostis rupestris' },
          { name: 'Avenula versicolor' },
          { name: 'Campanula alpina' },
          { name: 'Festuca airoides' },
          { name: 'Hieracium alpinum' },
          { name: 'Huperzia selago' },
          { name: 'Juncus trifidus' },
          { name: 'Oreochloa disticha' },
          { name: 'Pulsatilla alba' },
        ],
        count: undefined,
        choice: '',
        note: CHARACTERISTIC_NOTE,
      },
      value: CHARACTERISTIC_NOTE,
      grade: 'FV',
    },
    expansive: {
      inputs: { species: [{ name: 'Vaccinium vitis-idaea', cover: 5 }], none: '', choice: '', note: 'Borówka brusznica Vaccinium vitis-idaea (<5%).' },
      value: 'Borówka brusznica Vaccinium vitis-idaea (<5%).',
      grade: 'FV',
    },
    aliens: {
      inputs: { species: [], count: undefined, total: undefined, none: 'yes', note: 'Brak.' },
      value: 'Brak.',
      grade: 'FV',
    },
    habitatShare: { inputs: { value: 100, note: '' }, value: '100', grade: 'FV' },
    deschampsia: {
      inputs: { cover: 2, none: '', note: 'Zwarcie znikome (ok. 2%).' },
      value: 'Zwarcie znikome (ok. 2%).',
      grade: 'FV',
    },
    mechanical: {
      inputs: {
        choice: 'none',
        share: undefined,
        note: 'Brak. W tym rejonie mechaniczne zniszczenia ograniczają się jedynie do bezpośredniego sąsiedztwa szlaku turystycznego (poza transektem!), gdzie murawy są mocno zniszczone.',
      },
      value:
        'Brak. W tym rejonie mechaniczne zniszczenia ograniczają się jedynie do bezpośredniego sąsiedztwa szlaku turystycznego (poza transektem!), gdzie murawy są mocno zniszczone.',
      grade: 'FV',
    },
  },
  prospects: {
    value:
      'Właściwe (z wyjątkiem bezpośredniego sąsiedztwa przebiegającego w pobliżu szlaku, gdzie duże natężenie ruchu turystycznego zaburza płaty tego siedliska oraz uniemożliwia jego naturalną regenerację).',
    grade: 'FV',
  },
  impacts: [],
  threats: [],
  other: {
    otherValues: '',
    conservation: '',
    shareFV: 100,
    shareU1: 0,
    shareU2: 0,
    notes:
      'Rok: 2011. Data wypełnienia w karcie: –. Współrzędne w przewodniku podane do minut (sekundy ucięte). Karta z przewodnika nie zawiera tabel oddziaływań i zagrożeń.',
    photos: [],
  },
  overallComment: '',
}

export const examples6150: CardExample[] = [{ id: 'kopa-kondracka', label: 'Kopa Kondracka', values: kopaKondracka }]
