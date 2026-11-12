// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Lorens 2010, rozdz. 91P0, pkt 3 „Przykład wypełnionej
// karty obserwacji”): stanowisko nr 1 Stary Lipowiec, obszar Dolina Dolnej Tanwi, 16.08.2008.
// Karta pochodzi z pierwszego cyklu monitoringu, więc ma dwa wskaźniki, których dziś nie ma („Gatunki dominujące”
// i „Występowanie jeżyn, malin, bzu”). Jeżynę przeniesiono do „Rodzimych gatunków ekspansywnych”, dominanty do opisu.
// Stare kody oddziaływań (160, 164, 166) zamieniono na kody z bieżącej listy (B02, B02.02, B02.04).
// Oceny przepisane z karty. Dwie z nich odbiegają od dzisiejszych progów i formularz to pokazuje:
// • odnowienie buka – „Brak” dawało w 2008 r. U2, od 2021 r. brak odnowienia buka to FV;
// • obce gatunki inwazyjne – nawłoć sporadycznie (≤1%) to wg tab. 2 FV, ekspert dał U1.
// Wykonawca zanonimizowany (Jan Kowalski). Podwarstwy drzewostanu A1–A3 zapisano w jednostce fitosocjologicznej,
// bo formularz ma jedną warstwę A.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology91P0 } from './methodology'

const COORDS = 'N 50°27′; E 22°49′'

const releve = (o: {
  altitude: number
  coverB: number
  coverC: number
  coverD: number
  heightA: number
  heightB: number
  heightC: number
  heightD: number
  sublayers: string
  species: [string, string, string][]
}) => ({
  coords: COORDS,
  altitude: o.altitude,
  area: 100,
  slope: 0,
  exposure: 'brak',
  coverA: undefined,
  coverB: o.coverB,
  coverC: o.coverC,
  coverD: o.coverD,
  heightA: o.heightA,
  heightB: o.heightB,
  heightC: o.heightC,
  heightD: o.heightD,
  unit: `Abietetum polonicum (warstwa A: ${o.sublayers})`,
  species: o.species.map(([layer, name, abundance]) => ({ layer, name, abundance })),
})

export const staryLipowiec: CardValues = {
  ...emptyCardValues(methodology91P0),
  site: {
    siteName: 'Stanowisko nr 1 Stary Lipowiec',
    guid: '',
    communities: 'Abietetum polonicum',
    description:
      'Płat siedliska Abietetum polonicum zlokalizowany jest ok. 1300 m na południowy zachód od miejscowości Stary Lipowiec. Jest to niewielkie wyniesienie terenu otoczone od południa łąkami trzęślicowymi, od północy fragmentami boru i boru mieszanego z jodłą oraz dalej łąkami świeżymi i murawami napiaskowymi. Płat siedliska nie jest jednolity, miejscami w obniżeniach występują fragmenty grądów niskich i łęgów. Zarządzający terenem: lasy prywatne.',
    areaHa: 4,
    protectedAreas: 'Brak',
    coordStart: COORDS,
    coordMiddle: COORDS,
    coordEnd: COORDS,
    transect: '10x200 m, ale nie w linii prostej, tylko w rogach kwadratu o boku 100 m. Taki kształt transektu został podyktowany kształtem płatu siedliska.',
    altitude: '198–200',
    date: '2008-08-16',
    observer: 'Jan Kowalski',
  },
  releves: [
    releve({
      altitude: 199,
      coverB: 20,
      coverC: 30,
      coverD: 30,
      heightA: 27,
      heightB: 3,
      heightC: 20,
      heightD: 5,
      sublayers: 'a1 30% 27 m, a2 20% 19 m, a3 80% 12 m',
      species: [
        ['A', 'Pinus sylvestris', '3'],
        ['A', 'Abies alba', '5'],
        ['B', 'Abies alba', '2'],
        ['B', 'Frangula alnus', '+'],
        ['B', 'Picea abies', '+'],
        ['C', 'Abies alba', '1'],
        ['C', 'Frangula alnus', '1'],
        ['C', 'Maianthemum bifolium', '1'],
        ['C', 'Melampyrum pratense', '+'],
        ['C', 'Picea abies', '+'],
        ['C', 'Pinus sylvestris', '+'],
        ['C', 'Quercus robur', '+'],
        ['C', 'Sorbus aucuparia', '+'],
        ['C', 'Vaccinium myrtillus', '2'],
        ['D', 'Brachythecium spp.', '+'],
        ['D', 'Cladonia spp.', '+'],
        ['D', 'Dicranum undulatum', '+'],
        ['D', 'Leucobryum glaucum', '2'],
        ['D', 'Plagiomnium affine', '+'],
        ['D', 'Pleurozium schreberi', '1'],
        ['D', 'Polytrichastrum formosum', '1'],
      ],
    }),
    releve({
      altitude: 200,
      coverB: 30,
      coverC: 60,
      coverD: 70,
      heightA: 26,
      heightB: 5,
      heightC: 20,
      heightD: 5,
      sublayers: 'a1 40% 26 m, a2 60% 18 m',
      species: [
        ['A', 'Pinus sylvestris', '3'],
        ['A', 'Abies alba', '4'],
        ['A', 'Betula pendula', '1'],
        ['A', 'Picea abies', '1'],
        ['B', 'Abies alba', '3'],
        ['B', 'Frangula alnus', '+'],
        ['B', 'Picea abies', '2'],
        ['C', 'Betula pendula', '+'],
        ['C', 'Maianthemum bifolium', '+'],
        ['C', 'Melampyrum pratense', '1'],
        ['C', 'Molinia caerulea', '+'],
        ['C', 'Picea abies', '+'],
        ['C', 'Pinus sylvestris', '+'],
        ['C', 'Pteridium aquilinum', '2'],
        ['C', 'Quercus robur', '+'],
        ['C', 'Rubus spp.', '+'],
        ['C', 'Sorbus aucuparia', '+'],
        ['C', 'Trientalis europaea', '+'],
        ['C', 'Vaccinium myrtillus', '3'],
        ['C', 'Vaccinium vitis-idaea', '+'],
        ['D', 'Hylocomium splendens', '1'],
        ['D', 'Leucobryum glaucum', '1'],
        ['D', 'Pleurozium schreberi', '3'],
        ['D', 'Sphagnum spp.', '+'],
      ],
    }),
    releve({
      altitude: 198,
      coverB: 15,
      coverC: 70,
      coverD: 70,
      heightA: 28,
      heightB: 3,
      heightC: 20,
      heightD: 5,
      sublayers: 'a1 50% 28 m, a3 80% 12 m',
      species: [
        ['A', 'Pinus sylvestris', '4'],
        ['A', 'Abies alba', '5'],
        ['B', 'Abies alba', '1'],
        ['B', 'Frangula alnus', '+'],
        ['B', 'Quercus robur', '+'],
        ['C', 'Abies alba', '+'],
        ['C', 'Betula pendula', '+'],
        ['C', 'Dryopteris carthusiana', '+'],
        ['C', 'Frangula alnus', '+'],
        ['C', 'Melampyrum pratense', '+'],
        ['C', 'Pinus sylvestris', '+'],
        ['C', 'Pteridium aquilinum', '1'],
        ['C', 'Sorbus aucuparia', '+'],
        ['C', 'Trientalis europaea', '+'],
        ['C', 'Vaccinium myrtillus', '4'],
        ['C', 'Vaccinium vitis-idaea', '+'],
        ['D', 'Brachythecium spp.', '+'],
        ['D', 'Leucobryum glaucum', '2'],
        ['D', 'Pleurozium schreberi', '3'],
        ['D', 'Polytrichastrum formosum', '1'],
        ['D', 'Sphagnum spp.', '+'],
      ],
    }),
  ],
  indicators: {
    area: { inputs: { choice: 'stable' }, value: 'Ok. 4 ha', grade: 'FV' },
    typical: {
      inputs: {
        choice: 'typical',
        species: [
          { name: 'Abies alba', cover: 40 },
          { name: 'Pinus sylvestris', cover: 60 },
          { name: 'Picea abies', cover: 20 },
          { name: 'Sorbus aucuparia', cover: 10 },
          { name: 'Vaccinium myrtillus', cover: 60 },
          { name: 'Maianthemum bifolium', cover: 10 },
          { name: 'Trientalis europaea', cover: 1 },
          { name: 'Dryopteris carthusiana', cover: 1 },
          { name: 'Polytrichastrum formosum', cover: 10 },
          { name: 'Pleurozium schreberi', cover: 30 },
          { name: 'Plagiomnium affine', cover: 5 },
        ],
      },
      value:
        'Warstwa A: jodła pospolita Abies alba 40%, sosna zwyczajna Pinus sylvestris 60%. Warstwa B: jodła pospolita Abies alba 30%, świerk pospolity Picea abies 20%, jarząb pospolity Sorbus aucuparia 10%. Warstwa C: borówka czarna Vaccinium myrtillus 60%, konwalijka dwulistna Maianthemum bifolium 10%, siódmaczek leśny Trientalis europaea 1%, nerecznica krótkoostna Dryopteris carthusiana 1%. Warstwa D: płonnik strojny Polytrichastrum formosum 10%, rokietnik pospolity Pleurozium schreberi 30%, płaskomerzyk pokrewny Plagiomnium affine <10%. Brak gatunków mezotroficznych. Dominanty: A – Pinus sylvestris 60%, Abies alba 40%; B – Abies alba 30%, Picea abies 20%; C – Vaccinium myrtillus 60%, Pteridium aquilinum 20%; D – Pleurozium schreberi 30%, Leucobryum glaucum 10%.',
      grade: 'FV',
    },
    invasive: {
      inputs: { species: [{ name: 'Solidago gigantea', cover: 0.5 }] },
      value: 'Nawłoć późna Solidago serotina (= S. gigantea) – sporadycznie',
      grade: 'U1',
    },
    expansive: {
      inputs: { species: [{ name: 'Rubus spp.', cover: 5 }] },
      value:
        'Nie stwierdzono ekspansji gatunków zielnych. Jeżyna Rubus sp. 5%, głównie w jednym miejscu przecinającym transekt pasie roślinności porębowej.',
      grade: 'FV',
    },
    deadWood: {
      inputs: { choice: 'low', wholeTrees: 'no' },
      value: 'Poniżej 3% zasobności, głównie gałęzie i pniaki',
      grade: 'U2',
    },
    age: {
      inputs: { choice: 'mid', share100: 0 },
      value:
        'Drzewostan zróżnicowany. W pierwszym piętrze dominuje sosna, jodła ze świerkiem tworzą niższe warstwy oraz podrost i podszyt. Jodła charakteryzuje się zróżnicowaniem wiekowym, sosna jest raczej jednowiekowa. Wiek sosen ok. 80 lat, a jodeł 20–60 lat.',
      grade: 'U1',
    },
    alienTrees: { inputs: { species: [] }, value: 'Nie stwierdzono', grade: 'FV' },
    firRegeneration: {
      inputs: { species: [{ name: 'Abies alba', cover: 30 }] },
      value:
        'Odnowienie naturalne jodły o zróżnicowanym wieku występuje obficie w podszycie i podroście. Nieco mniej jest nalotu jodłowego, co zapewne ma związek z ocienieniem i obfitym rozwojem borówki czarnej.',
      grade: 'FV',
    },
    beechRegeneration: { inputs: { species: [] }, value: 'Brak', grade: 'U2' },
    plantings: {
      inputs: { species: [], choice: 'none' },
      value: 'Sosna w górnym piętrze być może pochodzi z odnowienia sztucznego. Innych, świeżych nasadzeń nie stwierdzono.',
      grade: 'FV',
    },
    logging: {
      inputs: { choice: 'few' },
      value: 'Pozyskanie występuje w niewielkim stopniu i głównie dotyczy piętra sosen. W ciągu ostatniego 5-lecia usunięto około 5% drzew.',
      grade: 'U1',
    },
    standDamage: { inputs: { choice: 'none' }, value: 'Nie stwierdzono', grade: 'FV' },
  },
  prospects: { value: 'Nie określono', grade: 'XX' },
  impacts: [
    {
      code: 'B02',
      name: 'Gospodarka leśna – ogólnie',
      influence: '+',
      intensity: 'M',
      description: 'Na plus – usuwanie górnego piętra sosny, promowanie jodły.',
    },
    {
      code: 'B02',
      name: 'Gospodarka leśna – ogólnie',
      influence: '-',
      intensity: 'M',
      description:
        'Na minus – przerzedzenie górnego piętra skutkuje odsłonięciem dna lasu i w efekcie dominacją gatunków borowych, głównie borówki czarnej. Wpływa to również na kondycję jodły, która raptownie odsłonięta cierpi od nadmiaru nasłonecznienia.',
    },
    {
      code: 'B02.02',
      name: 'Wycinka lasu',
      influence: '-',
      intensity: 'L',
      description:
        'Nadmierne przerzedzenie i prowadzenie przebierowej wycinki. Usuwane są najlepsze stare i dobre jakościowo drzewa, a pozostawiane dolne piętro.',
    },
    {
      code: 'B02.04',
      name: 'Usuwanie martwych i umierających drzew',
      influence: '-',
      intensity: 'M',
      description: 'Usuwanie z lasu martwego drewna. W efekcie siedlisko pozostaje zubożone.',
    },
  ],
  threats: [
    { code: 'B02.02', name: 'Wycinka lasu', description: 'Możliwa nadmierna eksploatacja lasów ze względu na ich formę własności.' },
    {
      code: 'B02.06',
      name: 'Przerzedzanie drzewostanu',
      description: 'Fragmentami na stanowisku występują mocno przerzedzone lasy jodłowe z jodłą w wieku 40–50 lat, bez starodrzewi.',
    },
  ],
  other: {
    otherValues: '',
    conservation:
      'Brak. Propozycje: usankcjonowanie pozostawiania ok. 10–15% martwych drzew, niedopuszczanie do nadmiernego przerzedzania górnego piętra (stopniowe odsłanianie jodły).',
    notes:
      'Monitoring wymagany: tak, co 3–5 lat. Na stanowisku, zależnie od dalszej gospodarki leśnej, mogą zachodzić procesy recesji bądź progresji siedliska. Udział powierzchni siedliska o różnym stanie zachowania na stanowisku: FV 10%, U1 60%, U2 30%.',
    photos: [],
  },
  overallComment:
    'Wynika z ocen parametrów. O ocenie złej (U2) przesądził wskaźnik kardynalny „Obecność martwego drewna”: poniżej 3% zasobności, głównie gałęzie i pniaki.',
}

export const examples91P0: CardExample[] = [{ id: 'stary-lipowiec', label: 'Stary Lipowiec', values: staryLipowiec }]
