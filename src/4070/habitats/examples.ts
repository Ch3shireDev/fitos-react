// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Mróz 2010, rozdz. 4070, pkt 3 „Przykład wypełnionej karty
// obserwacji”): Babia Góra, Sokolica, 26.08.2007. Ekspert (koordynator) zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („N 49°34′ …''; E 19°33′ …''”) – przepisane do minut;
//  • wysokości warstw C i D w karcie w metrach (C 1 m, 0,5 m; D 0,05 m, 0,03 m) → formularz w cm (100, 50, 5, 3);
//  • „Politrichum commune” (literówka w karcie) → Polytrichum commune;
//  • powierzchnia siedliska: w karcie tylko „FV” bez opisu – przyjęte „nie podlega zmianom”;
//  • gatunki typowe: lista z karty (B: kosodrzewina, jarząb, wierzba śląska; C: pięć gatunków) – wierzba śląska nie jest
//    na liście tab. 1, więc się nie liczy; i tak 6 innych typowych → FV;
//  • kompleks: karta podaje tylko towarzyszące zbiorowiska (40% + 20%), bez udziału kosodrzewiny – formularz bierze
//    udział siedliska na transekcie (80%) → FV;
//  • obumieranie igieł: „na dopuszczalnym poziomie do 10%” → „do 10” → FV (granica 10% należy do FV);
//  • oddziaływania: stare kody (2007) → słownik 2011: 501 → D01.01, 624 → G01.04.01 (tak przemapowano je w sprawozdaniu
//    2013–2014); intensywność B → M, wpływ „–”; stary kod w opisie;
//  • „Zagrożenia” w karcie to tekst bez kodów – rozpisane na G05.01, D01.01, H05.01, treść przepisana do opisów.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology4070 } from './methodology'

const COORD = 'N 49°34′; E 19°33′'
const UNIT = 'Pinetum mughi carpaticum'

type Layer = 'A' | 'B' | 'C' | 'D'
type Row = [layer: Layer, name: string, abundance: string]
const releve = (
  o: { altitude: number; slope: number; exposure: string; coverA: number; coverB: number; coverC: number; coverD: number; heightA: number; heightB: number; heightC: number; heightD: number },
  species: Row[],
) => ({
  coords: COORD,
  area: 100,
  unit: UNIT,
  ...o,
  species: species.map(([layer, name, abundance]) => ({ layer, name, abundance })),
})

export const sokolica: CardValues = {
  ...emptyCardValues(methodology4070),
  site: {
    siteName: 'Sokolica',
    guid: '',
    siteType: 'badawcze',
    massif: 'Babia Góra',
    communities: UNIT,
    description:
      'Jeden z wyróżnionych podszczytów pasma Babiej Góry. Obszar o bardzo stromych północnych ścianach o charakterze urwiska skalnego. Teren wypłaszczony, leżący w strefie górnej granicy lasu. Siedlisko nie jest jednolite i ma charakter przejściowy z górnoreglowego boru świerkowego do karpackich zarośli kosodrzewiny. Występują tu biogrupy świerka, sztucznie dosadzana limba oraz zwarte płaty kosodrzewiny.',
    areaHa: 'Suma powierzchni wydzieleń 25d, 25g, 19–23,51',
    protectedAreas: 'Obszar Natura 2000, Babiogórski Park Narodowy',
    manager: 'Babiogórski Park Narodowy z Dyrekcją w Zawoi',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '10x200 m',
    altitude: '1367',
    date: '2007-08-26',
    observer: 'Jan Kowalski',
    additionalExperts: '',
  },
  releves: [
    releve({ altitude: 1374, slope: 20, exposure: 'NE', coverA: 30, coverB: 80, coverC: 80, coverD: 0, heightA: 10, heightB: 2, heightC: 100, heightD: 5 }, [
      ['A', 'Picea abies', '2'],
      ['A', 'Pinus cembra', '2'],
      ['B', 'Pinus cembra', '1'],
      ['B', 'Pinus mugo', '3'],
      ['B', 'Sorbus aucuparia subsp. glabrata', '3'],
      ['B', 'Salix silesiaca', '2'],
      ['C', 'Deschampsia flexuosa', '+'],
      ['C', 'Vaccinium myrtillus', '4'],
      ['C', 'Vaccinium vitis-idaea', '1'],
    ]),
    releve({ altitude: 1383, slope: 20, exposure: 'E', coverA: 50, coverB: 80, coverC: 90, coverD: 0, heightA: 5, heightB: 2, heightC: 50, heightD: 5 }, [
      ['A', 'Picea abies', '2'],
      ['B', 'Pinus mugo', '4'],
      ['B', 'Sorbus aucuparia subsp. glabrata', '2'],
      ['C', 'Athyrium distentifolium', '3'],
      ['C', 'Epilobium angustifolium', '+'],
      ['C', 'Gentiana asclepiadea', '+'],
      ['C', 'Homogyne alpina', '+'],
      ['C', 'Vaccinium myrtillus', '3'],
      ['C', 'Rubus idaeus', '1'],
      ['C', 'Rumex sp.', '1'],
      ['C', 'Salix silesiaca', '+'],
    ]),
    releve({ altitude: 1393, slope: 15, exposure: 'NE', coverA: 70, coverB: 40, coverC: 70, coverD: 5, heightA: 5, heightB: 1.5, heightC: 50, heightD: 3 }, [
      ['A', 'Picea abies', '2'],
      ['B', 'Pinus mugo', '2'],
      ['B', 'Sorbus aucuparia subsp. glabrata', '3'],
      ['C', 'Athyrium distentifolium', '1'],
      ['C', 'Deschampsia flexuosa', '+'],
      ['C', 'Homogyne alpina', '+'],
      ['C', 'Oxalis acetosella', '+'],
      ['C', 'Rubus idaeus', '+'],
      ['C', 'Rumex sp.', '+'],
      ['C', 'Vaccinium myrtillus', '3'],
      ['D', 'Polytrichum commune', '+'],
    ]),
  ],
  indicators: {
    area: { inputs: { choice: 'stable', areaText: '', note: '' }, value: 'nie podlega zmianom lub zwiększa się', grade: 'FV' },
    share: {
      inputs: { value: 80, note: 'Jest to transekt przy górnej granicy lasu, tym samym zbiorowisko kosodrzewiny zawiera duży udział płatów świerkowych – około 20%' },
      value: '80%. Jest to transekt przy górnej granicy lasu, tym samym zbiorowisko kosodrzewiny zawiera duży udział płatów świerkowych – około 20%',
      grade: 'FV',
    },
    typical: {
      inputs: {
        species: [
          { name: 'Pinus mugo', cover: 40 },
          { name: 'Sorbus aucuparia subsp. glabrata', cover: 40 },
          { name: 'Salix silesiaca', cover: 10 },
          { name: 'Vaccinium myrtillus', cover: 50 },
          { name: 'Vaccinium vitis-idaea', cover: 10 },
          { name: 'Homogyne alpina', cover: 10 },
          { name: 'Deschampsia flexuosa', cover: 10 },
          { name: 'Athyrium distentifolium', cover: 20 },
        ],
        choice: '',
        note: 'Warstwa B: kosodrzewina Pinus mugo 40%, jarząb pospolity Sorbus aucuparia subsp. glabrata 40%, wierzba śląska Salix silesiaca 10%. Warstwa C: borówka czarna Vaccinium myrtillus 50%, borówka brusznica Vaccinium vitis-idaea 10%, podbiałek alpejski Homogyne alpina 10%, śmiałek pogięty Deschampsia flexuosa 10%, wietlica alpejska Athyrium distentifolium 20%. Występują wszystkie gatunki krzewiaste charakterystyczne dla tego zbiorowiska. W warstwie C występują gatunki charakterystyczne przy odpowiedniej ilościowości',
      },
      value:
        'Warstwa B: kosodrzewina Pinus mugo 40%, jarząb pospolity Sorbus aucuparia subsp. glabrata 40%, wierzba śląska Salix silesiaca 10%. Warstwa C: borówka czarna Vaccinium myrtillus 50%, borówka brusznica Vaccinium vitis-idaea 10%, podbiałek alpejski Homogyne alpina 10%, śmiałek pogięty Deschampsia flexuosa 10%, wietlica alpejska Athyrium distentifolium 20%. Występują wszystkie gatunki krzewiaste charakterystyczne dla tego zbiorowiska. W warstwie C występują gatunki charakterystyczne przy odpowiedniej ilościowości',
      grade: 'FV',
    },
    dominant: {
      inputs: {
        speciesB: [
          { name: 'Pinus mugo', cover: 40 },
          { name: 'Sorbus aucuparia subsp. glabrata', cover: 30 },
        ],
        speciesC: [{ name: 'Vaccinium myrtillus', cover: 50 }],
        choice: '',
        note: 'Warstwa B: kosodrzewina Pinus mugo 40%, jarząb pospolity Sorbus aucuparia subsp. glabrata 30%, warstwa C: borówka czarna Vaccinium myrtillus 50%. W obrębie transektu dominują gatunki charakterystyczne dla zbiorowiska zarośli kosodrzewiny.',
      },
      value:
        'Warstwa B: kosodrzewina Pinus mugo 40%, jarząb pospolity Sorbus aucuparia subsp. glabrata 30%, warstwa C: borówka czarna Vaccinium myrtillus 50%. W obrębie transektu dominują gatunki charakterystyczne dla zbiorowiska zarośli kosodrzewiny.',
      grade: 'FV',
    },
    complex: {
      inputs: { mugo: undefined, companions: 'natural', note: 'Liściaste zarośla subalpejskie z Sorbus aucuparia subsp. glabrata, Salix silesiaca 40%; biogrupy świerkowe 20%.' },
      value: 'Liściaste zarośla subalpejskie z Sorbus aucuparia subsp. glabrata, Salix silesiaca 40%; biogrupy świerkowe 20%.',
      grade: 'FV',
    },
    damage: {
      inputs: {
        value: 5,
        cause: 'ruch turystyczny',
        note: 'W niewielkim stopniu ok. 5%, głównie w wyniku ruchu turystycznego. Na całej długości transektu nie odnotowano dużych zniszczeń gałęzi kosodrzewiny, jedynie sporadyczne uszkodzenia.',
      },
      value: 'W niewielkim stopniu ok. 5%, głównie w wyniku ruchu turystycznego. Na całej długości transektu nie odnotowano dużych zniszczeń gałęzi kosodrzewiny, jedynie sporadyczne uszkodzenia.',
      grade: 'FV',
    },
    needles: {
      inputs: { value: 'do 10', choice: 'fv', note: 'Na dopuszczalnym poziomie do 10%. Nie odnotowano znaczącego zjawiska obumierania igieł kosodrzewiny' },
      value: 'Na dopuszczalnym poziomie do 10%. Nie odnotowano znaczącego zjawiska obumierania igieł kosodrzewiny',
      grade: 'FV',
    },
    lichens: {
      inputs: {
        species: [
          { name: 'Hypogymnia physodes', cover: 10 },
          { name: 'Parmeliopsis ambigua', cover: 10 },
          { name: 'Parmeliopsis hyperopta', cover: 5 },
          { name: 'Pseudevernia furfuracea', cover: 10 },
          { name: 'Vulpicida pinastri', cover: 5 },
        ],
        none: '',
        count: undefined,
        note: 'Pustułka pęcherzykowata Hypogymnia physodes 10%, płaskotka rozlana Parmeliopsis ambigua 10%, płaskotka reglowa Parmeliopsis hyperopta 5%, mąklik otrębiasty Pseudevernia furfuracea 10%, złotlinka jaskrawa Vulpicida pinastri 5%. Trudne jest oszacowanie procentowe pokrycia gałęzi kosodrzewiny i jarząbu przez plechy porostowe. Podane wartości są bardzo szacunkowe',
      },
      value:
        'Pustułka pęcherzykowata Hypogymnia physodes 10%, płaskotka rozlana Parmeliopsis ambigua 10%, płaskotka reglowa Parmeliopsis hyperopta 5%, mąklik otrębiasty Pseudevernia furfuracea 10%, złotlinka jaskrawa Vulpicida pinastri 5%. Trudne jest oszacowanie procentowe pokrycia gałęzi kosodrzewiny i jarząbu przez plechy porostowe. Podane wartości są bardzo szacunkowe',
      grade: 'FV',
    },
  },
  prospects: {
    value: 'Perspektywy zachowania siedliska bardzo dobre, nie przewiduje się znacznego oddziaływania czynników zagrażających',
    grade: 'FV',
  },
  impacts: [
    {
      code: 'D01.01',
      name: 'Ścieżki, szlaki piesze, szlaki rowerowe',
      influence: '-',
      intensity: 'M',
      description:
        'Występowanie sieci szlaków turystycznych w obrębie Babiogórskiego Parku Narodowego. Płaty kosodrzewiny przylegające bezpośrednio do szlaków nie wykazują znaczących negatywnych zmian strukturalnych. Zdarzają się sporadycznie: uschnięte gałęzie, okorowania, gałęzie pozbawione igieł. Widoczne stare przycięcia gałęzi wzdłuż szlaku. Wymienione zniszczenia występują sporadycznie, a ich częstotliwość występowania nie powinna się znacząco zwiększać. Duże zaniepokojenie może budzić fakt silnego zanieczyszczenia obszaru zbiorowiska w najbliższym sąsiedztwie szlaku (do 5 m po obu stronach). Zjawisko to może prowadzić do silnej eutrofizacji płatów zbiorowiska tuż przy szlaku. (Kod w karcie z 2007 r.: 501 Szlaki piesze, intensywność B.)',
    },
    {
      code: 'G01.04.01',
      name: 'Turystyka górska i wspinaczka',
      influence: '-',
      intensity: 'M',
      description:
        'W sezonie letnim w obrębie szlaku głównego, biegnącego grzbietem masywu Babiej Góry, w tym również w zaroślach kosodrzewiny, występuje bardzo intensywna turystyka górska. Zabiegi ochronne na trasie zmniejszają negatywne oddziaływanie turystyki na zarośla kosówki. Do najbardziej widocznych negatywnych skutków można zaliczyć: mechaniczne niszczenie gałęzi kosodrzewiny, bezpośrednio przylegających do szlaku turystycznego; głębszą penetrację zarośli i tworzenie dzikich ścieżek poza szlakiem; zanieczyszczenie obszarów zarośli przylegających do szlaku. Szlak po stronie południowej masywu nie jest zbytnio popularny, a tym samym negatywny wpływ turystyki górskiej jest minimalny. (Kod w karcie z 2007 r.: 624 Turystyka górska, intensywność B.)',
    },
  ],
  threats: [
    {
      code: 'G05.01',
      name: 'Wydeptywanie, nadmierne użytkowanie',
      description:
        'Głównym zagrożeniem jest nadmiar liczby turystów, przekraczający pojemność turystyczną szlaków. Skutkiem czego jest nadmierna penetracja najbliższego otoczenia ścieżek turystycznych, wydeptywanie ścieżek bocznych',
    },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe', description: 'Wydeptywanie ścieżek bocznych wzdłuż szlaków.' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe', description: 'Związane z ruchem turystycznym zanieczyszczenie stanowiska.' },
  ],
  other: {
    otherValues: '',
    conservation:
      'Stosowane metody przy modernizacji szlaków turystycznych, zapobiegające znacznej penetracji przez turystów obszarów przylegających do samego szlaku. Sezonowe sprzątanie szlaków turystycznych.',
    proposals:
      'W miejscach silnej penetracji turystycznej należy intensywniej zastosować metody grodzeniowe. W punktach zbiorczych należy udostępnić większą ilość punktów sanitarnych. Działania mające na celu ochronę naturalnych siedlisk na terenie Babiogórskiego Parku Narodowego są prowadzone w sposób prawidłowy.',
    shareFV: 100,
    shareU1: 0,
    shareU2: 0,
    notes:
      'Na długości transektu zaobserwowano prawidłowo przeprowadzoną modernizację szlaku turystycznego w celu dostosowania go do potrzeb i standardów turystycznych, a jednocześnie przy ograniczeniu nadmiernej ingerencji w naturalną roślinność obszaru chronionego. Rok: 2007. Typ monitoringu: szczegółowy. Monitoring jest wymagany: tak – stanowisko badawcze, co 5 lat. Zagrożenia w karcie z przewodnika opisane tekstem, bez kodów – rozpisane na kody w zakładce zagrożeń.',
    photos: [],
  },
  overallComment: '',
}

export const examples4070: CardExample[] = [{ id: 'sokolica', label: 'Sokolica', values: sokolica }]
