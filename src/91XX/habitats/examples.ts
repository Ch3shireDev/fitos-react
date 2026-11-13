// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Pawlaczyk 2015, rozdz. Olsy, pkt 3 „Przykład karty obserwacji”):
// stanowisko referencyjne Kozi Rynek (Ostoja Augustowska), 7.08.2013.
// Karta pochodzi z pierwszego cyklu monitoringu – zdjęcia fitosocjologiczne mają po 100 m² (metodyka: 200 m²).
// Spis martwego drewna i drzew biocenotycznych przepisany z karty; formularz liczy z niego:
//  • martwe drewno łączne – 24,5 m³/ha (karta: 24,4; różnica z zaokrąglenia π), FV jak w karcie;
//  • drewno wielkowymiarowe – 7 szt. ≥30 cm i ≥3 m na 0,4 ha = 17,5 szt./ha, dokładnie jak w karcie;
//  • mikrosiedliska – 7 na 5 drzewach = 17,5 szt./ha → podpowiedź U1, a ekspert wpisał „Nie oceniono” (XX).
//    Formularz to pokazuje, ocena eksperta zostaje.
// Lista gatunków przy kombinacji florystycznej zebrana ze zdjęć (karta ma tam tylko opis). Wykonawca zanonimizowany (Jan Kowalski).
import type { CardValues, ReleveSpeciesRow } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology91XX } from './methodology'

const COORDS = '53° 48′ …″ N 23° 13′ …″ E'

type Bb = ReleveSpeciesRow['abundance']
const sp = (layer: ReleveSpeciesRow['layer'], list: [string, Bb][]): ReleveSpeciesRow[] =>
  list.map(([name, abundance]) => ({ layer, name, abundance }))

const releve = (o: { coverA: number; coverB: number; coverC: number; heightA: number; species: ReleveSpeciesRow[] }) => ({
  coords: COORDS,
  altitude: 128,
  area: 100,
  slope: undefined,
  exposure: 'teren płaski',
  coverA: o.coverA,
  coverB: o.coverB,
  coverC: o.coverC,
  coverD: 0,
  heightA: o.heightA,
  heightB: 3,
  heightC: 0.5,
  heightD: undefined,
  unit: 'Ribeso nigri-Alnetum',
  species: o.species,
})

const lying = (d: number, l: number) => ({ kind: 'lying', diameter: d, length: l })
const standing = (d: number, l: number) => ({ kind: 'standing', diameter: d, length: l })

export const koziRynek: CardValues = {
  ...emptyCardValues(methodology91XX),
  site: {
    siteName: 'Kozi Rynek',
    guid: '',
    communities: 'Ribeso nigri-Alnetum',
    description:
      'Rozległy powierzchniowo kompleks lasów olszowych zachowanych w bardzo dobrym stanie. W skład kompleksu objętego ochroną w formie rezerwatu wchodzą nie tylko siedliska olsów, ale także łęgi i lasy bagienne (głównie świerczyna na torfie). Znaczna część oddziałów znajduje się na terenie rezerwatu i jest wyłączona z użytkowania leśnego. Struktura kępkowo-dolinkowa jest dobrze widoczna. Występują niewielkie obniżenia terenu, w których woda stagnuje przez cały rok. Obecny jest starodrzew. Ilość martwego drewna jest znacząca. Warunki wodne właściwe. Nie stwierdzono czynnych urządzeń wodnych. Przez kompleks przebiega droga dojazdowa (utwardzona, zbudowana na żwiru i piasku). Zbiorowisko podlega dynamicznym procesom – zamierania starodrzewu i zastępowanie go nowym pokoleniem. Wiele młodych drzew korzysta z powalonych, martwych pni gdyż wysoki poziom wody utrzymuje się przez większą część roku. Zarówno w warstwie B jak i C odnotowano obecność odnowień olszy. Młode osobniki świerka występują pojedynczo. Struktura pionowa zbiorowiska oraz skład gatunkowy są właściwe. Nie stwierdzono gatunków inwazyjnych ani ekspansywnych.',
    areaHa: 24,
    protectedAreas: 'Obszary Natura 2000: Ostoja Augustowska PLH200005, Puszcza Augustowska PLB200002; rezerwat Kozi Rynek',
    coordStart: COORDS,
    coordMiddle: COORDS,
    coordEnd: COORDS,
    transect: '40x100 m',
    altitude: '120–132',
    date: '2013-08-07',
    observer: 'Jan Kowalski',
  },
  releves: [
    releve({
      coverA: 80,
      coverB: 15,
      coverC: 95,
      heightA: 12,
      species: [
        ...sp('A', [['Alnus glutinosa', '5']]),
        ...sp('B', [
          ['Alnus glutinosa', '2'],
          ['Frangula alnus', '+'],
          ['Padus avium', '+'],
          ['Picea abies', '+'],
          ['Sorbus aucuparia', '+'],
          ['Tilia cordata', '+'],
        ]),
        ...sp('C', [
          ['Carex acutiformis', '4'],
          ['Solanum dulcamara', '2'],
          ['Lycopus europaeus', '1'],
          ['Athyrium filix-femina', '+'],
          ['Alnus glutinosa', '+'],
          ['Calla palustris', '+'],
          ['Caltha palustris', '+'],
          ['Cardamine amara', '+'],
          ['Cicuta virosa', '+'],
          ['Circaea alpina', '+'],
          ['Cirsium oleraceum', '+'],
          ['Filipendula ulmaria', '+'],
          ['Frangula alnus', '+'],
          ['Galeobdolon luteum', '+'],
          ['Galium palustre', '+'],
          ['Glechoma hederacea', '+'],
          ['Impatiens noli-tangere', '+'],
          ['Iris pseudacorus', '+'],
          ['Lysimachia vulgaris', '+'],
          ['Maianthemum bifolium', '+'],
          ['Myosotis palustris', '+'],
          ['Oxalis acetosella', '+'],
          ['Padus avium', '+'],
          ['Picea abies', '+'],
          ['Ribes nigrum', '+'],
          ['Rubus sp.', '+'],
          ['Scutellaria galericulata', '+'],
          ['Urtica dioica', '+'],
        ]),
      ],
    }),
    releve({
      coverA: 75,
      coverB: 10,
      coverC: 85,
      heightA: 12,
      species: [
        ...sp('A', [
          ['Alnus glutinosa', '4'],
          ['Picea abies', '+'],
        ]),
        ...sp('B', [
          ['Alnus glutinosa', '1'],
          ['Quercus robur', '+'],
          ['Ribes nigrum', '1'],
        ]),
        ...sp('C', [
          ['Athyrium filix-femina', '3'],
          ['Solanum dulcamara', '2'],
          ['Phalaris arundinacea', '2'],
          ['Caltha palustris', '1'],
          ['Cirsium oleraceum', '1'],
          ['Galium palustre', '1'],
          ['Iris pseudacorus', '1'],
          ['Lycopus europaeus', '1'],
          ['Myosotis palustris', '1'],
          ['Alnus glutinosa', '+'],
          ['Berula erecta', '+'],
          ['Calla palustris', '+'],
          ['Carex acutiformis', '+'],
          ['Cicuta virosa', '+'],
          ['Filipendula ulmaria', '+'],
          ['Impatiens noli-tangere', '+'],
          ['Lysimachia vulgaris', '+'],
          ['Maianthemum bifolium', '+'],
          ['Oxalis acetosella', '+'],
          ['Peucedanum palustre', '+'],
          ['Picea abies', '+'],
          ['Ribes nigrum', '+'],
          ['Rubus sp.', '+'],
          ['Urtica dioica', '+'],
        ]),
      ],
    }),
    releve({
      coverA: 50,
      coverB: 10,
      coverC: 90,
      heightA: 10,
      species: [
        ...sp('A', [['Alnus glutinosa', '4']]),
        ...sp('B', [
          ['Alnus glutinosa', '1'],
          ['Ribes nigrum', '1'],
        ]),
        ...sp('C', [
          ['Phalaris arundinacea', '3'],
          ['Athyrium filix-femina', '2'],
          ['Galium palustre', '2'],
          ['Solanum dulcamara', '2'],
          ['Calla palustris', '1'],
          ['Cicuta virosa', '1'],
          ['Cirsium oleraceum', '1'],
          ['Iris pseudacorus', '1'],
          ['Filipendula ulmaria', '1'],
          ['Mentha aquatica', '1'],
          ['Agrostis canina', '+'],
          ['Alnus glutinosa', '+'],
          ['Cardamine amara', '+'],
          ['Epilobium montanum', '+'],
          ['Equisetum fluviatile', '+'],
          ['Galium uliginosum', '+'],
          ['Geranium robertianum', '+'],
          ['Lycopus europaeus', '+'],
          ['Lysimachia thyrsiflora', '+'],
          ['Myosotis palustris', '+'],
          ['Peucedanum palustre', '+'],
          ['Ranunculus lingua', '+'],
          ['Ranunculus sp.', '+'],
          ['Ribes nigrum', '+'],
          ['Rumex hydrolapathum', '+'],
          ['Sorbus aucuparia', 'r'],
          ['Urtica dioica', '+'],
        ]),
      ],
    }),
  ],
  indicators: {
    area: {
      inputs: { choice: 'stable' },
      value: 'Rozległy kompleks lasów bagiennych. Powierzchnia nie zmienia się i nie jest antropogenicznie pofragmentowana.',
      grade: 'FV',
    },
    characteristic: {
      inputs: {
        species: [
          { name: 'Alnus glutinosa' },
          { name: 'Ribes nigrum' },
          { name: 'Frangula alnus' },
          { name: 'Carex acutiformis' },
          { name: 'Solanum dulcamara' },
          { name: 'Lycopus europaeus' },
          { name: 'Caltha palustris' },
          { name: 'Calla palustris' },
          { name: 'Peucedanum palustre' },
          { name: 'Galium palustre' },
          { name: 'Iris pseudacorus' },
          { name: 'Myosotis palustris' },
          { name: 'Rumex hydrolapathum' },
          { name: 'Athyrium filix-femina' },
          { name: 'Oxalis acetosella' },
          { name: 'Maianthemum bifolium' },
        ],
        choice: 'typical',
      },
      value:
        'Kombinacja gatunkowa charakterystyczna dla olsów Polski płn.-wsch. Zwarcie warstwy A1 jest stosunkowo niewielkie. W badanym fragmencie wiele drzew uległo naturalnej śmierci. Drzewostan z wyraźną dominacją olszy czarnej. Pojedynczo spotyka się osobniki świerka pospolitego. Zwarcie A2 określono na około 60%. Warstwa krzewów średnio rozwinięta (15%) budowana przez czeremchę pospolitą, kruszynę, jarzębinę, porzeczkę czarną, świerka, dąb i olszę. Ruń zwarta, wielowarstwowa 80–90% z dominacją turzycy błotnej, przy znacznym udziale wietlicy samiczej, psianki słodkogórz, również mozgi (lokalnie). Warstwa mszysta słabo rozwinięta. Torfowców nie stwierdzono.',
      grade: 'FV',
    },
    geoAlien: { inputs: { species: [] }, value: 'Nie stwierdzono', grade: 'FV' },
    invasive: { inputs: { species: [] }, value: 'Nie stwierdzono', grade: 'FV' },
    ecohydro: { inputs: { choice: 'full' }, value: 'W pełni zachowany naturalny układ ekohydrologiczny.', grade: 'FV' },
    water: {
      inputs: { choice: 'natural', mursh: 'no' },
      value: 'Warunki wodne prawie naturalne. Aktywnie działają na tym terenie bobry. Grząsko, miejscami stoi woda.',
      grade: 'FV',
    },
    ditches: { inputs: { choice: 'none' }, value: 'Nie stwierdzono', grade: 'FV' },
    eutrophication: { inputs: { choice: 'none' }, value: 'Nie stwierdzono', grade: 'FV' },
    deadWood: {
      inputs: {
        pieces: [
          lying(20, 10),
          lying(25, 12),
          lying(38, 10),
          lying(32, 15),
          lying(12, 6),
          lying(21, 8),
          lying(20, 15),
          lying(30, 14),
          standing(35, 20),
          standing(34, 4),
          standing(37, 18),
          standing(36, 5),
        ],
      },
      value: '24,4 m³/ha',
      grade: 'FV',
    },
    largeDeadWood: { inputs: { minDiameter: 30 }, value: '17,5 szt./ha', grade: 'FV' },
    microhabitats: {
      inputs: { trees: [{ codes: 'Ob' }, { codes: 'Dz' }, { codes: 'Dz' }, { codes: 'Os, Dz' }, { codes: 'Os, Dz' }] },
      value: 'Nie oceniono',
      grade: 'XX',
    },
    otherDistortions: { inputs: { choice: 'none' }, value: 'Nie stwierdzono', grade: 'FV' },
    keySpecies: { inputs: { choice: 'noData' }, value: 'Nie uzyskano danych', grade: 'XX' },
  },
  prospects: { value: 'Brak zagrożeń i negatywnych trendów.', grade: 'FV' },
  impacts: [
    {
      code: 'D01.01',
      name: 'Drogi',
      influence: '-',
      intensity: 'L',
      description:
        'Przez kompleks przebiega droga dojazdowa (utwardzona, zbudowana z żwiru i piasku). Nie zaobserwowano jej aktualnego negatywnego wpływu, ale potencjalnie może stanowić barierę hydrologiczną wpływającą na warunki wodne oraz szlak inwazji gatunków obcych (w karcie z 2013 r.: intensywność C).',
    },
  ],
  threats: [],
  other: {
    otherValues: 'Nie pozyskano danych',
    conservation: 'Nie prowadzi się działań; ochrona bierna – rezerwatowa. Propozycje: kontynuacja ochrony ścisłej.',
    notes:
      'Typ stanowiska: referencyjne. Monitoring jest wymagany – powierzchnia referencyjna, monitoring wskazany w celach badawczych oraz w celu kontroli występowania ewentualnych zagrożeń i oceny ich oddziaływania. Zarządzający terenem: Nadleśniczy Nadleśnictwa Augustów. Fotografie 1123–1127. Zdjęcia fitosocjologiczne wykonano na powierzchniach 100 m².',
    photos: [],
  },
  overallComment: 'Wszystkie ocenione wskaźniki wskazują na stan FV.',
}

export const examples91XX: CardExample[] = [{ id: 'kozi-rynek', label: 'Kozi Rynek', values: koziRynek }]
