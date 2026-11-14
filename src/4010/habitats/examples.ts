// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Pawlaczyk 2012, rozdz. 4010, pkt 3 „Przykład wypełnionej
// karty obserwacji”): Gniewoszyce, 14.09.2011. Wykonawca zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („14°48′…″ E – 51°36′…″ N”) – przepisane do minut;
//  • zdjęcia: 3 × 25 m² (metodyka zaleca 100 m²); zwarcie warstwy D „<5%” nie mieści się w polu liczbowym –
//    zostało puste, wartość w uwagach; zdjęcie II ma w karcie 198 m n.p.m., choć stanowisko to 188–191 m – przepisane;
//  • pokrycie wrzośca „Ok. 8–10%” → 10 (po zaokrągleniu do dziesiątek), zarośnięcie „Ok. 40%” → 40;
//  • apofity „Jeżyna Rubus sp. <1%” → FV (ślad, praktyka 2011); trzęślica nie jest wpisana jako ekspansywna, bo
//    karta jej tak nie potraktowała (sprawozdanie 2021 uważa to za pomyłkę – opis w specyfikacji);
//  • oceny jak w karcie: powierzchnia U2, struktura U2, perspektywy U2, ocena ogólna U2;
//  • działalność człowieka – kody z karty (stara lista 2007) przepisane na listę 2011: 160 → B02, 950 → K02;
//    intensywność A → H (duża), B → M (średnia).
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology4010 } from './methodology'

const COORD = 'N 51°36′; E 14°48′'
const UNIT = 'Ericetum tetralicis'

type Row = [layer: 'B' | 'C' | 'D', name: string, abundance: string]
const releve = (o: { altitude: number; slope: number; exposure: string; coverB: number; coverC: number; heightB: number }, species: Row[]) => ({
  coords: COORD,
  altitude: o.altitude,
  area: 25,
  slope: o.slope,
  exposure: o.exposure,
  coverB: o.coverB,
  coverC: o.coverC,
  coverD: undefined,
  heightB: o.heightB,
  heightC: 40,
  heightD: 3,
  unit: UNIT,
  species: species.map(([layer, name, abundance]) => ({ layer, name, abundance })),
})

export const gniewoszyce: CardValues = {
  ...emptyCardValues(methodology4010),
  site: {
    siteName: 'Gniewoszyce',
    guid: '',
    communities: 'Ericetum tetralicis',
    description:
      'Wilgotne wrzosowisko zlokalizowane ok. 0,83 km na północny zachód od wsi Gniewoszyce. Siedlisko wykształciło się na powierzchni funkcjonującej w Lasach Państwowych jako powierzchnia leśna, którą kilkakrotnie próbowano zalesić. Obecnie wrzosowisko silnie zarasta głównie sosną zwyczajną Pinus sylvestris i brzozą brodawkowatą Betula pendula.',
    areaHa: 0.6,
    protectedAreas: 'Park Krajobrazowy Łuk Mużakowa',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '120x10 m',
    altitude: '188–191',
    date: '2011-09-14',
    observer: 'Jan Kowalski',
  },
  releves: [
    releve({ altitude: 188, slope: 0, exposure: 'brak', coverB: 10, coverC: 95, heightB: 2 }, [
      ['B', 'Alnus glutinosa', '+'],
      ['B', 'Betula pendula', '1'],
      ['B', 'Frangula alnus', '+'],
      ['B', 'Pinus sylvestris', '1'],
      ['B', 'Salix aurita', '+'],
      ['C', 'Calluna vulgaris', '3'],
      ['C', 'Erica tetralix', '2'],
      ['C', 'Molinia caerulea', '3'],
      ['C', 'Potentilla erecta', '+'],
      ['C', 'Vaccinium vitis-idaea', '1'],
      ['D', 'Sphagnum sp.', '+'],
      ['D', 'Pleurozium schreberi', '+'],
      ['D', 'Hypnum jutlandicum', '+'],
      ['D', 'Polytrichum juniperinum', '+'],
    ]),
    releve({ altitude: 198, slope: 5, exposure: 'W', coverB: 45, coverC: 90, heightB: 3 }, [
      ['B', 'Alnus glutinosa', '+'],
      ['B', 'Betula pendula', '2'],
      ['B', 'Frangula alnus', '+'],
      ['B', 'Pinus sylvestris', '3'],
      ['C', 'Calluna vulgaris', '4'],
      ['C', 'Erica tetralix', '2'],
      ['C', 'Frangula alnus', '+'],
      ['C', 'Molinia caerulea', '2'],
      ['C', 'Vaccinium myrtillus', '+'],
      ['C', 'Vaccinium vitis-idaea', '+'],
      ['D', 'Hypnum jutlandicum', '1'],
      ['D', 'Pleurozium schreberi', '1'],
    ]),
    releve({ altitude: 191, slope: 5, exposure: 'W', coverB: 25, coverC: 90, heightB: 3 }, [
      ['B', 'Alnus glutinosa', '+'],
      ['B', 'Betula pendula', '1'],
      ['B', 'Frangula alnus', '+'],
      ['B', 'Pinus sylvestris', '2'],
      ['C', 'Calluna vulgaris', '4'],
      ['C', 'Carex panicea', '+'],
      ['C', 'Carex pilulifera', '+'],
      ['C', 'Danthonia decumbens', '+'],
      ['C', 'Erica tetralix', '2'],
      ['C', 'Frangula alnus', '+'],
      ['C', 'Molinia caerulea', '2'],
      ['C', 'Nardus stricta', '1'],
      ['C', 'Potentilla erecta', '+'],
      ['C', 'Vaccinium vitis-idaea', '+'],
      ['D', 'Polytrichum piliferum', '+'],
      ['D', 'Hypnum jutlandicum', '+'],
    ]),
  ],
  indicators: {
    area: { inputs: { choice: 'fast', areaHa: undefined, note: 'Siedlisko w zaniku.' }, value: 'Siedlisko w zaniku.', grade: 'U2' },
    erica: { inputs: { cover: 10, note: 'Ok. 8–10% pokrycia na transekcie.' }, value: 'Ok. 8–10% pokrycia na transekcie.', grade: 'U2' },
    trees: { inputs: { cover: 40, species: [], note: 'Ok. 40%' }, value: 'Ok. 40%', grade: 'U2' },
    moisture: {
      inputs: {
        choice: 'strong',
        ditches: '',
        note: 'Silnie przesuszone. Siedlisko wykształciło się na słabo przepuszczalnych glebach, największym zagrożeniem jest pojawiający się nalot drzew, który pochłania znaczne ilości wody.',
      },
      value:
        'Silnie przesuszone. Siedlisko wykształciło się na słabo przepuszczalnych glebach, największym zagrożeniem jest pojawiający się nalot drzew, który pochłania znaczne ilości wody.',
      grade: 'U2',
    },
    aliens: { inputs: { species: [], choice: 'none', note: '' }, value: 'Brak', grade: 'FV' },
    expansive: {
      inputs: { species: [{ name: 'Rubus sp.', cover: 0.5 }], choice: '', note: 'Jeżyna Rubus sp. <1%' },
      value: 'Jeżyna Rubus sp. <1%',
      grade: 'FV',
    },
    keySpecies: { inputs: { choice: 'noData', species: [], note: '' }, value: 'Brak danych', grade: 'XX' },
    otherDamage: { inputs: { choice: 'none', note: '' }, value: 'Brak', grade: 'FV' },
  },
  prospects: {
    value:
      'Wydzielenie, w którym występuje siedlisko, funkcjonuje jako powierzchnia leśna, ponadto teren ten znajduje się jedynie w granicach Parku Krajobrazowego Łuk Mużakowa.',
    grade: 'U2',
  },
  impacts: [
    {
      code: 'B02',
      name: 'Gospodarka leśna – ogólnie',
      influence: '-',
      intensity: 'H',
      description: 'Powierzchnia usilnie kilkakrotnie zalesiana. (Kod w karcie z 2011 r.: 160 Gospodarka leśna – ogólnie, intensywność A.)',
    },
    {
      code: 'K02',
      name: 'Ewolucja biocenotyczna, sukcesja',
      influence: '-',
      intensity: 'M',
      description: 'Sukcesja roślinności – spontanicznie pojawiające się naloty drzew i krzewów. (Kod w karcie z 2011 r.: 950 Ewolucja biocenotyczna, intensywność B.)',
    },
  ],
  threats: [{ code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja', description: 'Silna ekspansja drzew, głównie brzozy brodawkowatej i sosny zwyczajnej.' }],
  other: {
    otherValues: '',
    conservation: 'Wykonywane działania ochronne: brak. Propozycje: konieczne systematyczne usuwanie wszystkich nalotów drzew i krzewów.',
    shareFV: undefined,
    shareU1: undefined,
    shareU2: 100,
    notes:
      'Typ stanowiska: badawcze. Zarządzający terenem: Nadleśnictwo Lipinki. Rok: 2011, typ monitoringu: zintegrowany, koordynator: Klub Przyrodników. Monitoring jest wymagany: tak – każda powierzchnia siedliska wilgotne wrzosowiska powinna zostać objęta monitoringiem; w województwie lubuskim siedlisko zajmuje znikomą powierzchnię i z reguły na każdym stanowisku zagrożone jest silną ekspansją drzew. Zwarcie warstwy D we wszystkich zdjęciach: <5%. Zdjęcie I: nachylenie 0, ekspozycja 0.',
    photos: [],
  },
  overallComment: '',
}

export const examples4010: CardExample[] = [{ id: 'gniewoszyce', label: 'Gniewoszyce', values: gniewoszyce }]
