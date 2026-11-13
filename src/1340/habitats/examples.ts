// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Piernik 2010, rozdz. 1340, „Przykład wypełnionej karty obserwacji”):
// Owczary k. Buska-Zdroju, 31.05.2008. Wykonawca (koordynator) zanonimizowany – Jan Kowalski. Zarządzający terenem to instytucje
// (zespół parków krajobrazowych, konserwator przyrody) – zostawione.
// Karta jest starsza niż obecny zestaw wskaźników:
//  • „Uwilgotnienie” – w karcie go nie ma (oceniany od 2014 r.) → XX z opisem;
//  • „Gatunki charakterystyczne” – pokrycie „<10%” wpisane jako 5%; 9 halofitów z list przewodnika → U1 jak w karcie;
//  • „Zasilanie wodami słonymi” – ECe gleby 7,62–18,8 dS/m, woda źródła 12,2 dS/m, rów 14,8 dS/m (w opisie).
// Kody oddziaływań przepisane na słownik 2011 (stare kody i intensywność A/B/C w opisach):
//   141 zarzucenie pasterstwa → A04.03, 930 zatopienie → K01.04, 102 koszenie → A03, 970 międzygatunkowe interakcje → K04,
//   971 konkurencja → K04.01, 890 inne zmiany stosunków wodnych → J02.15.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology1340 } from './methodology'

const SCIRPETUM = 'Scirpetum maritimi puccinellietosum'
const POTENTILLO = 'Potentillo-Festucetum arundinaceae'
const COORD = 'N 50°26′ – E 20°45′, 215 m n.p.m.'

export const owczary: CardValues = {
  ...emptyCardValues(methodology1340),
  site: {
    siteName: 'Owczary k. Buska-Zdroju',
    guid: '',
    subtypes:
      '1340-3 Halofilny szuwar z sitowcem nadmorskim Scirpetum maritimi puccinellietosum; 1340-4 Subhalofilne łąki z kostrzewą trzcinową i pięciornikiem gęsim Potentillo-Festucetum arundinaceae',
    communities: `Podzespół ${SCIRPETUM}; zespół ${POTENTILLO}`,
    description:
      'Stanowisko zlokalizowane jest w płytkiej denudacyjnej niecce o podmokłym dnie i skomplikowanej budowie geologicznej (Łajczak 2001). Strome zbocza porasta murawa kserotermiczna. Dno zajmują zbiorowiska z udziałem słonorośli: w obniżeniach i miejscach podtopionych podtyp siedliska 1340-3, w miejscach suchszych 1340-4. Teren zasilany jest przez trzy źródła chlorkowo-siarczkowe, przy czym tylko jedno z nich, wypływające na stanowisku po zachodniej stronie, ma charakter stały. Woda z tego źródła spływa po stoku o niewielkim nachyleniu do płytkiego rowu i rozlewa się, powodując zasolenie podłoża na dnie niecki. W 2008 roku ok. 60% powierzchni rezerwatu było wykoszone. Nie skoszono trzciny pospolitej na brzegach rowu przecinającego rezerwat oraz otoczenia źródeł. W sąsiedztwie rezerwatu pasły się krowy.',
    areaHa: 0.61,
    protectedAreas:
      'Rezerwat przyrody Owczary k. Buska-Zdroju; Szaniecki Park Krajobrazowy; sąsiaduje z obszarem Natura 2000 PLH260003 Ostoja Nidziańska',
    coordStart: 'N 50°26′ – E 20°45′',
    coordMiddle: 'N 50°26′ – E 20°45′',
    coordEnd: 'N 50°26′ – E 20°45′',
    transect: '15x145 m (0,22 ha)',
    altitude: '215',
    date: '2008-05-31',
    observer: 'Jan Kowalski',
  },
  releves: [
    {
      coords: COORD,
      place: 'Zachodnia część transektu',
      area: 25,
      cover: 60,
      unit: SCIRPETUM,
      species: [
        { layer: 'C', name: 'Atriplex prostrata subsp. prostrata var. salina', abundance: '1' },
        { layer: 'C', name: 'Brachypodium pinnatum', abundance: '+' },
        { layer: 'C', name: 'Carex cuprina', abundance: '+' },
        { layer: 'C', name: 'Carex distans', abundance: '1' },
        { layer: 'C', name: 'Juncus compressus', abundance: '2' },
        { layer: 'C', name: 'Medicago minima', abundance: '+' },
        { layer: 'C', name: 'Melilotus dentata', abundance: '+' },
        { layer: 'C', name: 'Phragmites australis', abundance: '3' },
        { layer: 'C', name: 'Poa pratensis', abundance: '2' },
        { layer: 'C', name: 'Potentilla anserina', abundance: '+' },
        { layer: 'C', name: 'Scirpus maritimus', abundance: '2' },
        { layer: 'C', name: 'Sonchus arvensis', abundance: '+' },
      ],
    },
    {
      coords: COORD,
      place: 'Środkowa część transektu, ok. 66 m od źródła, fragment nieskoszony (3×8 m)',
      area: 24,
      cover: 98,
      unit: POTENTILLO,
      species: [
        { layer: 'C', name: 'Achillea millefolium', abundance: '3' },
        { layer: 'C', name: 'Agrostis stolonifera', abundance: '1' },
        { layer: 'C', name: 'Avenula pubescens', abundance: '1' },
        { layer: 'C', name: 'Carex cuprina', abundance: '+' },
        { layer: 'C', name: 'Carex distans', abundance: '2' },
        { layer: 'C', name: 'Centaurea jacea', abundance: '1' },
        { layer: 'C', name: 'Cirsium arvense', abundance: '+' },
        { layer: 'C', name: 'Cirsium canum', abundance: '+' },
        { layer: 'C', name: 'Dactylis glomerata', abundance: '+' },
        { layer: 'C', name: 'Festuca arundinacea', abundance: '2' },
        { layer: 'C', name: 'Festuca pratensis', abundance: '3' },
        { layer: 'C', name: 'Festuca rubra', abundance: '2' },
        { layer: 'C', name: 'Galium verum', abundance: '1' },
        { layer: 'C', name: 'Geranium pratense', abundance: '2' },
        { layer: 'C', name: 'Inula britannica', abundance: '+' },
        { layer: 'C', name: 'Lathyrus tuberosus', abundance: '+' },
        { layer: 'C', name: 'Medicago minima', abundance: '+' },
        { layer: 'C', name: 'Melilotus dentata', abundance: '1' },
        { layer: 'C', name: 'Ononis arvensis', abundance: '+' },
        { layer: 'C', name: 'Pastinaca sativa', abundance: '+' },
        { layer: 'C', name: 'Phragmites australis', abundance: '1' },
        { layer: 'C', name: 'Plantago media', abundance: '+' },
        { layer: 'C', name: 'Plantago pauciflora', abundance: 'r' },
        { layer: 'C', name: 'Poa pratensis', abundance: '3' },
        { layer: 'C', name: 'Potentilla anserina', abundance: '2' },
        { layer: 'C', name: 'Potentilla reptans', abundance: '2' },
        { layer: 'C', name: 'Ranunculus acris', abundance: '2' },
        { layer: 'C', name: 'Symphytum officinale', abundance: '+' },
        { layer: 'C', name: 'Taraxacum officinale', abundance: '+' },
        { layer: 'C', name: 'Tetragonolobus maritimus', abundance: '2' },
        { layer: 'C', name: 'Vicia cracca', abundance: '+' },
        { layer: 'C', name: 'Vicia hirsuta', abundance: '+' },
      ],
    },
    {
      coords: COORD,
      place: 'Końcowa część transektu, ok. 100 m od źródła – płat koszonej, niskiej trzciny z kępami Puccinellia distans',
      area: 25,
      cover: 85,
      unit: SCIRPETUM,
      species: [
        { layer: 'C', name: 'Agrostis stolonifera', abundance: '1' },
        { layer: 'C', name: 'Atriplex prostrata subsp. prostrata var. salina', abundance: '1' },
        { layer: 'C', name: 'Catabrosa aquatica', abundance: '+' },
        { layer: 'C', name: 'Festuca arundinacea', abundance: '+' },
        { layer: 'C', name: 'Phragmites australis', abundance: '3' },
        { layer: 'C', name: 'Puccinellia distans', abundance: '2' },
        { layer: 'C', name: 'Scirpus maritimus', abundance: '1' },
      ],
    },
  ],
  indicators: {
    area: {
      inputs: { trend: 'decrease', areaHa: 0.61 },
      value:
        'Całkowita powierzchnia siedliska na stanowisku wynosi 0,61 ha. W stosunku do powierzchni słonych łąk, dla których utworzono rezerwat, można zaobserwować zmniejszenie powierzchni',
      grade: 'U1',
    },
    transect: { inputs: { share: 90, habitatLength: undefined, transectLength: undefined }, value: '90%', grade: 'FV' },
    characteristic: {
      inputs: {
        species: [
          { name: 'Atriplex prostrata subsp. prostrata var. salina', cover: 5 },
          { name: 'Bolboschoenus maritimus', cover: 10 },
          { name: 'Trifolium fragiferum', cover: 5 },
          { name: 'Puccinellia distans', cover: 5 },
          { name: 'Festuca arundinacea', cover: 20 },
          { name: 'Carex distans', cover: 10 },
          { name: 'Melilotus dentatus', cover: 10 },
          { name: 'Lotus tenuis', cover: 5 },
          { name: 'Tetragonolobus maritimus', cover: 5 },
        ],
      },
      value:
        'Gatunki halofitów: łoboda oszczepowata odm. solna Atriplex prostrata subsp. prostrata var. salina <10%, sitowiec nadmorski Bolboschoenus maritimus 10%, koniczyna rozdęta Trifolium fragiferum <10%, mannica odstająca Puccinellia distans <10%, kostrzewa trzcinowata Festuca arundinacea 20%, turzyca odległokłosa Carex distans 10%, nostrzyk ząbkowany Melilotus dentatus 10%, komonica wąskolistna Lotus tenuis <10%, komonica skrzydlatostrąkowa Tetragonolobus maritimus <10%',
      grade: 'U1',
    },
    dominant: {
      inputs: {
        species: [
          { name: 'Bolboschoenus maritimus', cover: 10 },
          { name: 'Festuca arundinacea', cover: 20 },
          { name: 'Carex distans', cover: 10 },
          { name: 'Melilotus dentatus', cover: 10 },
          { name: 'Phragmites australis', cover: 70 },
          { name: 'Poa pratensis', cover: 30 },
        ],
      },
      value:
        'Halofity: sitowiec nadmorski Bolboschoenus maritimus 10%, kostrzewa trzcinowata Festuca arundinacea 20%, turzyca odległokłosa Carex distans 10%, nostrzyk ząbkowany Melilotus dentatus 10%; glikofity: trzcina pospolita Phragmites australis 70%, wiechlina łąkowa Poa pratensis 30%',
      grade: 'U1',
    },
    invasive: { inputs: { species: [] }, value: 'Brak', grade: 'FV' },
    expansive: {
      inputs: { species: [{ name: 'Phragmites australis', cover: 70 }], maxPatch: undefined, reedNatural: 'no' },
      value: 'Phragmites australis 70%',
      grade: 'U2',
    },
    shrubs: { inputs: { choice: 'none', species: [] }, value: 'Brak', grade: 'FV' },
    spatial: { inputs: { choice: 'unclear' }, value: 'Teren świeżo skoszony, wskaźnik trudny do oceny', grade: 'XX' },
    saltWater: {
      inputs: {
        choice: 'limited',
        source: 'spring',
        eceMin: 7.62,
        eceMax: 18.8,
        waterEc: 12.2,
        groundwater: '20–50',
        note: 'Teren zasilany jest przez trzy źródła chlorkowo-siarczkowe, przy czym tylko jedno z nich, wypływające po zachodniej stronie, ma charakter stały. Woda z tego źródła spływa po stoku o niewielkim nachyleniu do płytkiego rowu i rozlewa się, powodując zasolenie podłoża na dnie niecki. Mimo ustanowienia rezerwatu w 1959 r. teren uległ w przeszłości wielu niekorzystnym zmianom antropogenicznym (m.in. melioracja, zaczopowanie źródeł), w związku z czym nastąpiła częściowa dewastacja flory halofilnej. W celu zachowania siedliska powinien być podwyższony poziom wód gruntowych. Rów melioracyjny 14,8 dS/m',
      },
      value:
        'Teren zasilany jest przez trzy źródła chlorkowo-siarczkowe, przy czym tylko jedno z nich, wypływające po zachodniej stronie, ma charakter stały. Woda z tego źródła spływa po stoku o niewielkim nachyleniu do płytkiego rowu i rozlewa się, powodując zasolenie podłoża na dnie niecki. Mimo ustanowienia rezerwatu w 1959 r. teren uległ w przeszłości wielu niekorzystnym zmianom antropogenicznym (m.in. melioracja, zaczopowanie źródeł), w związku z czym nastąpiła częściowa dewastacja flory halofilnej. W celu zachowania siedliska powinien być podwyższony poziom wód gruntowych. Rów melioracyjny 14,8 dS/m; źródło: słone źródła; zasolenie wody 12,2 dS/m; ECe gleby 7,62–18,8 dS/m; wody gruntowe na głębokości 20–50 cm',
      grade: 'U1',
    },
    moisture: {
      inputs: { choice: 'unknown' },
      value: 'Nie oceniano (wskaźnik od 2014 r.). Wody gruntowe w trakcie badań na głębokości 20–50 cm',
      grade: 'XX',
    },
  },
  prospects: {
    value:
      'Ochrona czynna jest warunkiem istnienia siedliska. Teren powinien być koszony lub udostępniony na pastwisko. Powinny zostać zrekonstruowane stosunki wodne w rezerwacie (Łajczak 2001)',
    grade: 'U1',
  },
  impacts: [
    {
      code: 'A04.03',
      name: 'Zarzucenie pasterstwa, brak wypasu',
      influence: '-',
      intensity: 'H',
      description: 'Po wprowadzeniu ochrony rezerwatowej w 1959 roku teren został wyłączony z użytkowania. (W karcie: kod 141, intensywność A, wpływ –.)',
    },
    {
      code: 'K01.04',
      name: 'Zatopienie',
      influence: '0',
      intensity: 'M',
      description: 'Sąsiedztwo źródła stałego i źródeł okresowych są podtapiane. (W karcie: kod 930, intensywność B, wpływ 0.)',
    },
    {
      code: 'A03',
      name: 'Koszenie / ścinanie trawy',
      influence: '+',
      intensity: 'M',
      description: 'W roku 2008 wykoszono około 60% powierzchni rezerwatu. (W karcie: kod 102, intensywność B, wpływ +.)',
    },
    {
      code: 'K04',
      name: 'Międzygatunkowe interakcje wśród roślin',
      influence: '0',
      intensity: 'L',
      description:
        'Procesy prowadzące do ustalenia równowagi pomiędzy gatunkami tworzącymi słoną łąkę, jako wypadkowej dostosowania do warunków siedliska i siły ekspansji gatunków. (W karcie: kod 970, intensywność C, wpływ 0.)',
    },
    {
      code: 'K04.01',
      name: 'Konkurencja',
      influence: '-',
      intensity: 'H',
      description:
        'Konkurencja roślin o miejsce – halofity wybierają miejsca niezacienione przez trzcinę pospolitą Phragmites australis. (W karcie: kod 971, intensywność A, wpływ –.)',
    },
    {
      code: 'J02.15',
      name: 'Inne spowodowane przez człowieka zmiany stosunków wodnych',
      influence: '-',
      intensity: 'M',
      description:
        'Obszar chroniony jest od 1959 roku i mimo to uległ w przeszłości wielu niekorzystnym zmianom (m.in. melioracja, zaczopowanie źródeł), szczegóły: Łajczak A. 2001. Źródła mineralne Niecki Nidziańskiej. Czasopismo Geograficzne LXXII: 151–184. (W karcie: kod 890, intensywność B, wpływ –.)',
    },
  ],
  threats: [
    {
      code: 'K04.01',
      name: 'Konkurencja',
      description:
        'Zbiorowiska halofitów zarosła trzcina pospolita Phragmites australis. Od 2004 roku wprowadzono koszenie rezerwatu, które poprawiło stan siedliska. (W karcie z 2008 r. zagrożenia opisano tylko tekstem – kody przypisano przy przepisywaniu.)',
    },
    {
      code: 'J02.15',
      name: 'Inne spowodowane przez człowieka zmiany stosunków wodnych',
      description:
        'Obszar uległ w przeszłości wielu niekorzystnym zmianom antropogenicznym (m.in. melioracja, zaczopowanie źródeł), w związku z czym nastąpiła częściowa dewastacja flory halofilnej. Tylko podniesienie lustra wód gruntowych może być gwarantem trwałego przywrócenia i zachowania roślinności słonolubnej.',
    },
  ],
  other: {
    otherValues: 'Siedlisko sąsiaduje na tym terenie z murawami kserotermicznymi.',
    conservation:
      'Wykonywane zabiegi ochronne i ocena ich skuteczności: od 2004 roku na terenie rezerwatu wprowadzono koszenie jako zabieg ochronny, ograniczający ekspansję trzciny pospolitej Phragmites australis na słonych łąkach. Propozycje: utrzymanie na terenie rezerwatu tradycyjnego koszenia z wywózką siana lub stosowanie ekstensywnego wypasu – w sąsiedztwie rezerwatu wypasane są krowy mieszkańców wsi Owczary. Należy rozważyć wprowadzenie działań proponowanych przez Łajczaka (2001), mających na celu poprawę stosunków wodnych i odtworzenie warunków bytowania halofitów.',
    notes:
      'Typ stanowiska: badawcze. Typ monitoringu: zintegrowany. Zarządzający terenem: Zespół Świętokrzyskich i Nadnidziańskich Parków Krajobrazowych; Wojewódzki Konserwator Przyrody w Kielcach. Monitoring wymagany – niezbędne jest monitorowanie skutków czynnej ochrony stosowanej na terenie rezerwatu, tj. koszenia i ewentualnej modyfikacji stosunków wodnych. Uwagi: w 2008 roku w maju wykoszono ok. 60% powierzchni rezerwatu. W pokosie dominowała trzcina pospolita. Nie skoszono trzciny pospolitej na brzegach rowu przecinającego rezerwat oraz w otoczeniu źródeł. W sąsiedztwie rezerwatu pasły się krowy, jednak nie wprowadzano ich na teren rezerwatu. Udział powierzchni siedliska w stanie FV 20%, U1 40%, U2 40%. Wskaźnika „Uwilgotnienie” w karcie z 2008 r. nie było – oznaczono XX.',
    photos: [],
  },
  overallComment:
    'Struktura U2 przez trzcinę (70% – rodzime gatunki ekspansywne, wskaźnik kardynalny); powierzchnia U1 (zmniejszenie względem areału z czasu utworzenia rezerwatu), perspektywy U1 (konieczna ochrona czynna i rekonstrukcja stosunków wodnych).',
}

export const examples1340: CardExample[] = [{ id: 'owczary', label: 'Owczary k. Buska-Zdroju', values: owczary }]
