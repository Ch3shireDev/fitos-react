// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Nobis 2015, rozdz. 3270, pkt 3 „Przykład karty obserwacji”):
// Sandomierz, 20.09.2013. Ekspert lokalny zanonimizowany (Jan Kowalski), dodatkowy ekspert pominięty.
// Rozbieżności z kartą papierową (wszystkie bez wpływu na oceny – te wychodzą 1:1):
//  • pokrycie „<5%” (7 gatunków charakterystycznych) nie mieści się w polu liczbowym – pokrycie puste, lista w uwagach;
//  • „sięgające 30–40%” przy komosie czerwonej → 40% (górna granica, jak w innych kartach);
//  • „Powierzchnia zajęta przez siedlisko na transekcie 80%” – w karcie bez własnej oceny, tu pole informacyjne w „Strukturze
//    przestrzennej”;
//  • współrzędne w przewodniku ucięte („50º40'…''N 21º45'…''E”) – przepisane tak samo;
//  • zagrożenia z „Raportu rocznego” (regulacja koryta, penetracja przez wędkarzy) przepisane na kody J02.03 i F02.03;
//    oddziaływanie z karty: F02.03, intensywność C → L, wpływ „–”.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology3270 } from './methodology'

const COORD = '50°40′…″N 21°45′…″E'
const UNIT = 'Chenopodion rubri'

const releve = (coverC: number, species: [string, string][]) => ({
  coords: COORD,
  altitude: 130,
  area: 2,
  slope: 0,
  exposure: 'brak',
  coverA: 0,
  coverB: 0,
  coverC,
  coverD: 0,
  heightA: 0,
  heightB: 0,
  heightC: 20,
  heightD: 0,
  unit: UNIT,
  species: species.map(([name, abundance]) => ({ layer: 'C', name, abundance })),
})

export const sandomierz: CardValues = {
  ...emptyCardValues(methodology3270),
  site: {
    siteName: 'Sandomierz',
    guid: '',
    siteType: 'referencyjne',
    communities: 'klasa Bidentetea tripartiti, związek Chenopodion fluviatile',
    description:
      'Na monitorowanym stanowisku zbiorowiska roślinne typowe dla siedliska 3270 występują w pobliżu mostu na Wiśle przy ulicy Lwowskiej, na lewym brzegu rzeki. Występują one w postaci różnej wielkości płatów (zwykle 1–10 m², sporadycznie kilkanaście lub kilkadziesiąt m²) rozwijających się od końca lata, na odsłoniętym, mulistym brzegu rzeki. Płaty te ułożone są wzdłuż koryta, na odcinku ok. 100 m. Odległości między płatami zbiorowisk typowych dla siedliska zwykle nie przekraczają 5 m. Na stanowisku w bezpośrednim sąsiedztwie siedliska występują piaszczyste łachy, na których ze znikomym pokryciem występują gatunki typowe dla siedliska 3270. W sąsiedztwie siedliska występują również płaty szuwarów zdominowane przez Phalaris arundinacea i płaty zbiorowisk ruderalnych z Artemisia vulgaris, Tanacetum vulgare i Solidago gigantea oraz znaczącym udziałem gatunków typowych dla siedliska 3270. Na monitorowanym stanowisku koryto rzeki jest nieznacznie uregulowane.',
    riverRegulation: 'slight',
    waterLevel: 'low',
    areaHa: 0.02,
    protectedAreas: 'Brak',
    natura2000: 'PLH180049 Tarnobrzeska Dolina Wisły',
    manager: 'RZGW Kraków',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect:
      'Powierzchnia płatów, jaką zajmują zbiorowiska roślinne typowe dla siedliska, waha się na tym stanowisku od jednego do kilkudziesięciu m². Często płaty te znajdują się w różnych odległościach od siebie. W związku z tym monitoring siedliska 3270 nie jest prowadzony z wykorzystaniem metody transektu. Prowadząc monitoring na stanowisku, w trzech najbardziej reprezentatywnych płatach wykonano zdjęcia fitosocjologiczne dokumentujące badane siedlisko. Odległości między dokumentowanymi płatami nie są jednakowe.',
    altitude: '130',
    date: '2013-09-20',
    observer: 'Jan Kowalski',
  },
  releves: [
    releve(50, [
      ['Atriplex prostrata', '+'],
      ['Capsella bursa-pastoris', '+'],
      ['Chenopodium ficifolium', '1'],
      ['Chenopodium glaucum', '1'],
      ['Chenopodium rubrum', '3'],
      ['Cyperus fuscus', '+'],
      ['Echinochloa crus-galli', '1'],
      ['Gnaphalium uliginosum', '+'],
      ['Limosella aquatica', '+'],
      ['Plantago intermedia', '+'],
      ['Polygonum aviculare', '+'],
      ['Polygonum lapathifolium', '2'],
      ['Rorippa palustris', '2'],
    ]),
    releve(50, [
      ['Bidens frondosa', '+'],
      ['Bidens tripartita', '+'],
      ['Chenopodium ficifolium', '1'],
      ['Chenopodium glaucum', '1'],
      ['Chenopodium polyspermum', '1'],
      ['Chenopodium rubrum', '3'],
      ['Matricaria maritima ssp. inodora', '1'],
      ['Plantago intermedia', '+'],
      ['Plantago major', '+'],
      ['Polygonum lapathifolium', '4'],
      ['Rumex maritimus', '+'],
      ['Salix alba', '+'],
      ['Urtica dioica', '+'],
    ]),
    releve(60, [
      ['Atriplex prostrata', '+'],
      ['Bidens tripartita', '+'],
      ['Capsella bursa-pastoris', '+'],
      ['Chenopodium album', '+'],
      ['Chenopodium ficifolium', '+'],
      ['Chenopodium glaucum', '1'],
      ['Chenopodium rubrum', '2'],
      ['Echinochloa crus-galli', '1'],
      ['Matricaria maritima ssp. inodora', '1'],
      ['Plantago major', '+'],
      ['Polygonum lapathifolium', '2'],
      ['Rorippa amphibia', '+'],
      ['Rorippa palustris', '2'],
    ]),
  ],
  indicators: {
    area: { inputs: { trend: '', areaHa: 0.02 }, value: '0,02 ha', grade: 'FV' },
    spatial: {
      inputs: {
        choice: 'natural',
        distance: undefined,
        cause: 'natural',
        transectShare: 80,
        note: 'Stanowisko cechuje mały stopień fragmentacji siedliska. Fragmentacja siedliska wynika głównie z charakteru siedliska i działania czynników naturalnych.',
      },
      value:
        'Stanowisko cechuje mały stopień fragmentacji siedliska. Fragmentacja siedliska wynika głównie z charakteru siedliska i działania czynników naturalnych; przyczyna: czynniki naturalne; powierzchnia zajęta przez siedlisko na transekcie 80%',
      grade: 'FV',
    },
    characteristic: {
      inputs: {
        species: [
          { name: 'Bidens tripartita', cover: 5 },
          { name: 'Chenopodium ficifolium', cover: 5 },
          { name: 'Chenopodium polyspermum', cover: undefined },
          { name: 'Chenopodium rubrum', cover: 25 },
          { name: 'Polygonum lapathifolium', cover: 10 },
          { name: 'Rumex maritimus', cover: undefined },
          { name: 'Polygonum minus', cover: undefined },
          { name: 'Ranunculus sceleratus', cover: undefined },
          { name: 'Rorippa palustris', cover: 5 },
          { name: 'Cyperus fuscus', cover: 5 },
          { name: 'Gnaphalium uliginosum', cover: undefined },
          { name: 'Juncus bufonius', cover: undefined },
          { name: 'Limosella aquatica', cover: undefined },
          { name: 'Chenopodium glaucum', cover: 5 },
          { name: 'Plantago intermedia', cover: 5 },
          { name: 'Atriplex prostrata', cover: 5 },
        ],
        count: undefined,
        note: 'Pokrycie <5%: Chenopodium polyspermum, Rumex maritimus, Polygonum minus, Ranunculus sceleratus, Gnaphalium uliginosum, Juncus bufonius, Limosella aquatica. W składzie florystycznym oprócz licznego udziału gatunków charakterystycznych zaznacza się również typowy dla tego siedliska udział gatunków przywiązanych do upraw okopowych, np. chwastnicy jednostronnej Echinochloa crus-galli, maruny bezwonnej Matricaria maritima ssp. inodora, żółtlicy drobnokwiatowej Galinsoga parviflora',
      },
      value:
        'Bidens tripartita 5%, Chenopodium ficifolium 5%, Chenopodium polyspermum, Chenopodium rubrum 25%, Polygonum lapathifolium 10%, Rumex maritimus, Polygonum minus, Ranunculus sceleratus, Rorippa palustris 5%, Cyperus fuscus 5%, Gnaphalium uliginosum, Juncus bufonius, Limosella aquatica, Chenopodium glaucum 5%, Plantago intermedia 5%, Atriplex prostrata 5%; Pokrycie <5%: Chenopodium polyspermum, Rumex maritimus, Polygonum minus, Ranunculus sceleratus, Gnaphalium uliginosum, Juncus bufonius, Limosella aquatica. W składzie florystycznym oprócz licznego udziału gatunków charakterystycznych zaznacza się również typowy dla tego siedliska udział gatunków przywiązanych do upraw okopowych, np. chwastnicy jednostronnej Echinochloa crus-galli, maruny bezwonnej Matricaria maritima ssp. inodora, żółtlicy drobnokwiatowej Galinsoga parviflora',
      grade: 'FV',
    },
    dominant: {
      inputs: {
        species: [
          { name: 'Chenopodium rubrum', cover: 40 },
          { name: 'Polygonum lapathifolium', cover: 60 },
        ],
        note: 'Nie można wskazać jednego gatunku, który jest dominantem w obrębie całego stanowiska. W niektórych płatach monitorowanego siedliska zaznacza się zwiększone pokrycie komosy czerwonej Chenopodium rubrum (sięgające 30–40%) i rdestu szczawiolistnego Polygonum lapathifolium s.l. (sięgające 60%).',
      },
      value:
        'Nie można wskazać jednego gatunku, który jest dominantem w obrębie całego stanowiska. W niektórych płatach monitorowanego siedliska zaznacza się zwiększone pokrycie komosy czerwonej Chenopodium rubrum (sięgające 30–40%) i rdestu szczawiolistnego Polygonum lapathifolium s.l. (sięgające 60%). Dominanty: Chenopodium rubrum 40%, Polygonum lapathifolium 60%',
      grade: 'FV',
    },
    invasive: {
      inputs: {
        species: [
          { name: 'Xanthium albinum', cover: 1 },
          { name: 'Eragrostis albensis', cover: 1 },
          { name: 'Bidens frondosa', cover: 1 },
        ],
      },
      value: 'Xanthium albinum 1%, Eragrostis albensis 1%, Bidens frondosa 1%',
      grade: 'FV',
    },
    expansive: { inputs: { species: [] }, value: 'Brak', grade: 'FV' },
    wellPreserved: {
      inputs: { share: 95, note: 'Na monitorowanym stanowisku dominują dobrze zachowane płaty siedliska.' },
      value: '95%. Na monitorowanym stanowisku dominują dobrze zachowane płaty siedliska.',
      grade: 'FV',
    },
  },
  prospects: {
    value:
      'W związku z tym, że badane stanowisko znajduje się w granicach obszaru chronionego w ramach programu Natura 2000 i stan zachowania siedliska jest tu bardzo dobry, istnieje bardzo duża szansa na jego zachowanie nawet w dłuższej perspektywie czasu.',
    grade: 'FV',
  },
  impacts: [
    {
      code: 'F02.03',
      name: 'Wędkarstwo',
      influence: '-',
      intensity: 'L',
      description:
        'Monitorowane stanowisko jest penetrowane przez okolicznych wędkarzy, którzy wydeptują płaty zbiorowisk roślinnych typowych dla tego siedliska. (W karcie: intensywność C.)',
    },
  ],
  threats: [
    {
      code: 'J02.03',
      name: 'Regulowanie (prostowanie) koryt rzecznych i zmiana przebiegu koryt rzecznych',
      description: 'Zagrożeniem dla siedliska 3270 na tym stanowisku może być regulacja koryta rzeki. (W karcie opisowo, bez kodu.)',
    },
    {
      code: 'F02.03',
      name: 'Wędkarstwo',
      description: 'Penetracja siedliska przez wędkarzy. (W karcie opisowo, bez kodu.)',
    },
  ],
  other: {
    otherValues:
      'Stanowisko położone w obrębie jednego z nielicznych w Polsce, dobrze zachowanych fragmentów dużych dolin. Obszar bytowania zwierząt z załącznika II Dyrektywy Siedliskowej (np. bóbr Castor fiber, wydra Lutra lutra).',
    conservation: 'Wykonywane działania ochronne: brak. Propozycje wprowadzenia działań ochronnych: brak propozycji.',
    shareFV: 100,
    shareU1: 0,
    shareU2: 0,
    notes:
      'Rok: 2013. Monitoring jest wymagany: tak – siedlisko w zależności od warunków pogodowych panujących w danym roku może być w różnym stopniu rozwinięte, okresowe kontrole pozwolą uzyskać pełniejszy obraz stanu siedliska. Data kontroli: 20.09.2013. Inne obserwacje: brak. Uwagi metodyczne: optymalny termin obserwacji – jesień, w zależności od warunków pogodowych wrzesień–październik.',
    photos: [],
  },
  overallComment: 'Wszystkie parametry ocenione na FV.',
}

export const examples3270: CardExample[] = [{ id: 'sandomierz', label: 'Sandomierz', values: sandomierz }]
