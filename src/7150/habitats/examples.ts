// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Koczur 2012, rozdz. 7150, pkt 3 „Przykład wypełnionej karty
// obserwacji”): Bór na Czerwonem (Torfowiska Orawsko-Nowotarskie), 28.06.2010. Ekspert zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („N 49° 27′…″ – E 20° 02′…″”) – przepisane do minut, te same dla
//    początku, środka i końca (karta podaje jedną parę);
//  • podtyp: karta go nie podaje (podział na podtypy to propozycja ze sprawozdania 2009–2011) – puste;
//  • zdjęcie I ma 5×4 m = 20 m²; nachylenie zdjęcia III „10–15°” i podwójne wysokości warstwy C („20/10 cm”, „30/10 cm”)
//    nie mieszczą się w polach liczbowych – wyższa wartość w polu, pełny zapis w uwagach do zdjęcia;
//  • wskaźniki: wartości i opisy z karty; „wartość” = opis z kolumny „Opis” albo wartość z pomiaru, jak w karcie;
//  • stopień uwodnienia: karta podaje tylko zakres („2 cm powyżej do 1 cm poniżej”) – wpisane dwa skrajne pomiary;
//  • oddziaływania: stare kody (2010) → słownik 2011: 853 → J02.05, 950 → K02, 720 → G05.01; intensywność B → M, C → L;
//  • „Zagrożenia” w karcie to tekst bez kodów – rozpisane na K02 (zarastanie sosną) i G05.01 (ścieżka dydaktyczna);
//  • ocena ogólna: U1 jak w karcie (powierzchnia U1, struktura U1, perspektywy FV).
import type { CardValues, ReleveSpeciesRow } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology7150 } from './methodology'

const COORD = 'N 49°27′ – E 20°02′'
const UNIT = 'Rhynchosporetum albae'

/** „B: Betula pubescens +, Pinus sylvestris +” → wiersze warstwy B. */
const layer = (l: 'B' | 'C' | 'D', spec: string): ReleveSpeciesRow[] =>
  spec.split(', ').map((s) => {
    const i = s.lastIndexOf(' ')
    return { layer: l, name: s.slice(0, i), abundance: s.slice(i + 1) as ReleveSpeciesRow['abundance'] }
  })

const releve = (
  o: { altitude: number; area: number; slope?: number; exposure: string; coverB: number; heightB: number; coverC: number; heightC: number; coverD: number; remarks: string },
  b: string,
  c: string,
  d: string,
) => ({
  coords: COORD,
  altitude: o.altitude,
  area: o.area,
  slope: o.slope,
  exposure: o.exposure,
  coverA: undefined,
  coverB: o.coverB,
  coverC: o.coverC,
  coverD: o.coverD,
  heightA: undefined,
  heightB: o.heightB,
  heightC: o.heightC,
  heightD: undefined,
  unit: UNIT,
  species: [...layer('B', b), ...layer('C', c), ...layer('D', d)],
  remarks: o.remarks,
})

const WOODY = 'Sosna zwyczajna Pinus sylvestris – 0,5%. Udział drzew i krzewów znikomy.'

export const borNaCzerwonem: CardValues = {
  ...emptyCardValues(methodology7150),
  site: {
    subtype: '',
    siteName: 'Bór na Czerwonem',
    guid: '',
    siteType: 'Badawcze',
    areaName: 'Torfowiska Orawsko-Nowotarskie',
    communities: 'Rhynchosporetum albae',
    description:
      'Zbiorowisko z przygiełką białą Rhynchospora alba rozwija się na erodującym torfie w miejscach silnych spływów powierzchniowych (rynny erozyjne). Na torfowisku Bór na Czerwonem występuje w postaci niewielkich płatów (5–50 m²) w częściach peryferyjnych kopuły, zwykle powyżej osiadających skarp, pozostałych po eksploatacji torfu.',
    areaHa: '0,03 ha (powierzchnia pojedynczych płatów: 3–50 m²)',
    protectedAreas: 'Rezerwat przyrody Bór na Czerwonem; obszar Natura 2000 „Torfowiska Orawsko-Nowotarskie” PLH120016',
    manager: 'Nadleśnictwo Nowy Targ',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: 'Pojedyncze płaty o powierzchni 20–50 m², oddalone od siebie o kilkadziesiąt metrów.',
    altitude: '613–614',
    date: '2010-06-28',
    observer: 'Jan Kowalski',
    additionalExperts: '',
  },
  releves: [
    releve(
      { altitude: 613, area: 20, slope: 4, exposure: 'NW', coverB: 2, heightB: 1, coverC: 50, heightC: 20, coverD: 60, remarks: 'Powierzchnia zdjęcia 5×4 m. Wysokość warstwy C: 20/10 cm.' },
      'Betula pubescens +, Pinus sylvestris +',
      'Andromeda polifolia 1, Calluna vulgaris +, Drosera rotundifolia 2, Eriophorum vaginatum +, Ledum palustre +, Oxycoccus palustris 1, Rhynchospora alba 3, Vaccinium uliginosum +',
      'Sphagnum cuspidatum +, Sphagnum fallax 2, Sphagnum magellanicum +, Sphagnum rubellum +, Sphagnum tenellum 1',
    ),
    releve(
      { altitude: 613, area: 25, slope: 5, exposure: 'NW', coverB: 0.5, heightB: 0.5, coverC: 85, heightC: 30, coverD: 40, remarks: 'Wysokość warstwy C: 30/10 cm.' },
      'Pinus sylvestris +',
      'Andromeda polifolia 1, Carex nigra +, Drosera rotundifolia 2, Eriophorum angustifolium 2, Eriophorum vaginatum +, Ledum palustre +, Oxycoccus palustris 1, Pinus sylvestris +, Rhynchospora alba 4, Vaccinium uliginosum +',
      'Sphagnum cuspidatum 2, Sphagnum fallax 2, Sphagnum palustre 1, Sphagnum rubellum +, Sphagnum tenellum 2',
    ),
    releve(
      { altitude: 614, area: 25, exposure: 'NNW', coverB: 0.5, heightB: 0.4, coverC: 40, heightC: 10, coverD: 15, remarks: 'Nachylenie 10–15°.' },
      'Pinus sylvestris +',
      'Andromeda polifolia +, Calluna vulgaris +, Drosera rotundifolia 1, Eriophorum vaginatum +, Oxycoccus palustris +, Rhynchospora alba 2',
      'Sphagnum compactum +, Sphagnum cuspidatum +, Sphagnum fallax +, Sphagnum rubellum +, Sphagnum tenellum 1',
    ),
  ],
  indicators: {
    area: {
      inputs: { choice: 'other', areaText: '0,03 ha', note: 'Powierzchnia nieznacznie zmniejsza się w wyniku rozwoju okolicznych mszarów.' },
      value: 'Powierzchnia nieznacznie zmniejsza się w wyniku rozwoju okolicznych mszarów.',
      grade: 'U1',
    },
    share: {
      inputs: { share: 20, note: '' },
      value: '20%',
      grade: 'U1',
    },
    patches: {
      inputs: {
        choice: 'medium',
        note: 'Duży stopień fragmentacji siedliska na stanowisku. Pojedyncze płaty o powierzchni 3–50 m², oddalone od siebie o kilka do kilkudziesięciu metrów.',
      },
      value: 'Duży stopień fragmentacji siedliska na stanowisku. Pojedyncze płaty o powierzchni 3–50 m², oddalone od siebie o kilka do kilkudziesięciu metrów.',
      grade: 'U1',
    },
    characteristic: {
      inputs: {
        species: [
          { name: 'Rhynchospora alba', cover: 50 },
          { name: 'Drosera rotundifolia', cover: 15 },
        ],
        count: undefined,
        total: undefined,
        choice: '',
        note: '',
      },
      value: 'Rhynchospora alba 50%, Drosera rotundifolia 15%',
      grade: 'FV',
    },
    dominant: {
      inputs: {
        choice: 'characteristic',
        species: [
          { name: 'Rhynchospora alba', cover: 50 },
          { name: 'Drosera rotundifolia', cover: 15 },
        ],
        note: '',
      },
      value: 'Rhynchospora alba 50%, Drosera rotundifolia 15%',
      grade: 'FV',
    },
    barePeat: {
      inputs: { cover: 40, note: '10–60% w obrębie płatów reprezentujących siedlisko na transekcie' },
      value: '40% (10–60% w obrębie płatów reprezentujących siedlisko na transekcie)',
      grade: 'U1',
    },
    mosses: {
      inputs: { cover: 35, sphagnum: 90, brown: 0, liverworts: 10, note: '' },
      value: 'Mszaki – 35%; Mchy brunatne – 0%, Torfowce – 90%, Wątrobowce – 10%',
      grade: 'U1',
    },
    aliens: {
      inputs: { species: [], total: undefined, none: 'yes', note: '' },
      value: 'Brak',
      grade: 'FV',
    },
    expansive: {
      inputs: { species: [], total: undefined, none: 'yes', choice: '', note: '' },
      value: 'Brak',
      grade: 'FV',
    },
    woody: {
      inputs: { species: [{ name: 'Pinus sylvestris', cover: 0.5 }], total: undefined, none: '', note: WOODY },
      value: WOODY,
      grade: 'FV',
    },
    water: {
      inputs: {
        depth1: -2,
        depth2: undefined,
        depth3: undefined,
        depth4: undefined,
        depth5: 1,
        choice: '',
        note: '2 cm powyżej do 1 cm poniżej. Poziom wód gruntowych równy z poziomem gruntu.',
      },
      value: '2 cm powyżej do 1 cm poniżej. Poziom wód gruntowych równy z poziomem gruntu.',
      grade: 'FV',
    },
    peat: {
      inputs: { choice: 'none', note: 'Obecnie brak. Wydobycie prowadzone było do około 1925 roku.' },
      value: 'Obecnie brak. Wydobycie prowadzone było do około 1925 roku.',
      grade: 'FV',
    },
    drainage: {
      inputs: {
        choice: 'none',
        note: 'Wykonywane prawdopodobnie w XIX w., obecnie ślady zatarte. Czynne rowy melioracyjne nie oddziałują na stanowisko.',
      },
      value: 'Wykonywane prawdopodobnie w XIX w., obecnie ślady zatarte. Czynne rowy melioracyjne nie oddziałują na stanowisko.',
      grade: 'FV',
    },
    genesis: {
      inputs: {
        choice: 'natural',
        note: 'Dominują czynniki naturalne (rynny erozyjne). Brzeg kopuły był w przeszłości zmieniony przez eksploatację, jednak obecnie czynniki antropogeniczne nie odgrywają większej roli.',
      },
      value:
        'Dominują czynniki naturalne (rynny erozyjne). Brzeg kopuły był w przeszłości zmieniony przez eksploatację, jednak obecnie czynniki antropogeniczne nie odgrywają większej roli.',
      grade: 'FV',
    },
  },
  prospects: {
    value: 'Dobre. Siedlisko w miarę stabilne, chronione w granicach rezerwatu przyrody. Działania ochrony czynnej sprzyjają przetrwaniu siedliska.',
    grade: 'FV',
  },
  impacts: [
    {
      code: 'J02.05',
      name: 'Modyfikowanie funkcjonowania wód – ogólnie',
      influence: '+',
      intensity: 'M',
      description: 'Budowa kilku zastawek na sąsiednim cieku, poprawa uwodnienia torfowiska. (Kod w karcie z 2010 r.: 853 Kształtowanie poziomu wód, intensywność B.)',
    },
    {
      code: 'K02',
      name: 'Ewolucja biocenotyczna, sukcesja',
      influence: '-',
      intensity: 'L',
      description: 'Powolne zarastanie sosną (ewolucja w kierunku boru bagiennego). (Kod w karcie z 2010 r.: 950 Ewolucja biocenotyczna, intensywność C.)',
    },
    {
      code: 'G05.01',
      name: 'Wydeptywanie, nadmierne użytkowanie',
      influence: '-',
      intensity: 'M',
      description:
        'Dotychczas dzikie ścieżki wydeptywane głównie przez zbieraczy jagód i sporadycznych turystów. Wybudowanie ścieżki dydaktycznej zwiększyło stopień penetracji torfowiska i może powodować uszkodzenie płatów (pierwsze symptomy już widoczne). (Kod w karcie z 2010 r.: 720 Wydeptywanie, nadmierne użytkowanie, intensywność B.)',
    },
  ],
  threats: [
    {
      code: 'K02',
      name: 'Ewolucja biocenotyczna, sukcesja',
      description: 'Powolne zarastanie przez sosnę zwyczajną może w niekorzystnych warunkach w przyszłości zmniejszyć zarówno areał otwartych mszarów, jak i przygiełkowisk.',
    },
    {
      code: 'G05.01',
      name: 'Wydeptywanie, nadmierne użytkowanie',
      description: 'Wybudowanie ścieżki dydaktycznej zwiększy stopień penetracji torfowiska i może powodować uszkodzenia płatów.',
    },
  ],
  other: {
    otherValues: 'Siedlisko występuje w kompleksie z mszarami wysokotorfowiskowymi 7110, torfowiskami przejściowymi 7140 i borem bagiennym 91D0.',
    adjacentCommunities: 'Vaccinio uliginosi-Pinetum, Pino rhaeticae-Sphagnetum, Sphagnetum magellanici, zbiorowisko Eriophorum vaginatum-Sphagnum fallax',
    conservation:
      'Ochrona czynna – wycinka sosny zwyczajnej (na kopule torfowiska), budowa zastawek na rowach i sąsiednim cieku (w przeszłości prawdopodobnie sztucznie pogłębionym). Podwyższenie poziomu wód gruntowych przez wybudowanie zastawek na sąsiednim cieku.',
    proposals: 'Montowanie kolejnych zastawek i budowa wału ziemnego w północnej części torfowiska.',
    plans: 'Plan ochrony rezerwatu przyrody',
    monitoringRequired: 'tak',
    justification:
      'Konieczne jest monitorowanie wpływu zwiększonego wydeptywania przez turystów w wyniku łatwiejszego dostępu do siedliska (budowy pomostu przez okrajek).',
    otherMonitoring: 'Badania poziomu wód gruntowych (zainstalowano sieć piezometrów).',
    shareFV: 30,
    shareU1: 60,
    shareU2: 10,
    notes:
      'Rok badań wyjątkowo mokry, wyższy niż normalnie poziom wód gruntowych. Dodatkowo zmiany w hydrologii związane z montażem zastawek (rok wcześniej).\nRok: 2010. Typ monitoringu: zintegrowany. Zarządzanie terenem: Nadleśnictwo Nowy Targ. Uwagi metodyczne w karcie: brak. Współrzędne w przewodniku podane do minut (sekundy ucięte), jedna para dla całego stanowiska. Termin 28.06 – przed optymalnym oknem (lipiec–sierpień). Zagrożenia w karcie opisane tekstem, bez kodów – rozpisane na kody w zakładce zagrożeń.',
    photos: [],
  },
  overallComment: 'Powierzchnia siedliska o różnym stanie zachowania na stanowisku.',
}

export const examples7150: CardExample[] = [{ id: 'bor-na-czerwonem', label: 'Bór na Czerwonem', values: borNaCzerwonem }]
