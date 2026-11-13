// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Bosiacka 2012, rozdz. 1310, pkt 3 „Przykład wypełnionej karty
// obserwacji”): Kołobrzeg-Budzistowo, 03.07.2009. Wykonawca zanonimizowany (Jan Kowalski), właściciel terenu też.
// Karta jest starsza niż obecny zestaw wskaźników:
//  • „Stosunek powierzchni płatów do potencjalnej” – w karcie go nie ma (jest „procent powierzchni zajęty przez siedlisko
//    na transekcie”: 25%, U1). Nie zgadujemy – XX, a wartość z karty przepisana w opisie;
//  • „Struktura przestrzenna płatów” – w karcie też jej nie ma, a jest kardynalna. Wybrano FV z opisu karty (płaty
//    rozproszone w szuwarze na ok. 50 ha, transekt 300 m w rozproszonych płatach). To interpretacja – w 2016 r. ekspert dał U1;
//    struktura i tak wychodzi U1 (trzcina 15% w ekspansywnych), jak w karcie.
//  • „Gatunki dominujące” – pokrycie warstwy C = średnia ze zdjęć (80, 85, 95%) ≈ 87%.
// Kody oddziaływań przepisane na słownik 2011: 810 odwadnianie → J02.01.02, 502 drogi → D01.02 (stare kody w opisie).
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology1310 } from './methodology'

const UNIT = 'Puccinellio distantis-Salicornietum brachystachyae'

export const kolobrzeg: CardValues = {
  ...emptyCardValues(methodology1310),
  site: {
    siteName: 'Kołobrzeg-Budzistowo',
    guid: '',
    communities: UNIT,
    description:
      'Naturalne płaty błotnistych solnisk z solirodem rozproszone są w szuwarze trzcinowym, porastającym torfy i namuły doliny rzecznej na ok. 50 ha, na wschodnim brzegu Parsęty, między Kołobrzegiem a Budzistowem, 2 km od brzegu morskiego. Po przeciwnej stronie Parsęty, na Wyspie Solnej, siedlisko 1310 było notowane jeszcze w latach 60. XX w., ale całkowicie zanikło wraz z otaczającymi je słonymi łąkami i szuwarami (obecnie teren ogrodów działkowych). Solniska zasilane są na drodze ascenzji reliktowych wód z mezozoiku, wydostających się drogą spękań w uskokach glacitektonicznych antykliny kołobrzeskiej. Zasolenie stagnującej i płynącej w rowach wody w obrębie solniska jest niemal trzykrotnie wyższe niż wody Bałtyku. Roślinność halofilna wykazuje charakterystyczną zonację wokół wysięków solanki – na najbardziej zasolonym, grząskim podłożu dominuje soliród zielny Salicornia europaea i miejscami aster solny Aster tripolium, dalej inicjalne murawy z muchotrzewem solniskowym Spergularia salina i mannicą odstającą Puccinellia distans, przechodzące w zwykle wąską strefę słonej łąki z sitem Gerarda Juncus gerardi, luźno porośniętą przez trzcinę. W miarę oddalania się od wysięku solanki trzcina coraz gęściej zarasta słonawy, ograniczając wzrost słonorośli, które jednak występują z osłabioną żywotnością w szuwarach łączących rozproszone płaty z lepiej wykształconymi fitocenozami halofilnymi.',
    areaHa: 0.15,
    protectedAreas: 'Dorzecze Parsęty PLH320007',
    coordStart: 'N 54°09′ – E 15°34′',
    coordMiddle: 'N 54°09′ – E 15°34′',
    coordEnd: 'N 54°10′ – E 15°34′',
    transect: '10x300 m, nie po linii prostej, w rozproszonych płatach',
    altitude: 'poniżej 10',
    date: '2009-07-03',
    observer: 'Jan Kowalski',
  },
  releves: [
    {
      coords: 'N 54°09′57,7″ – E 15°34′54,5″',
      area: 9,
      cover: 80,
      unit: UNIT,
      species: [
        { layer: 'C', name: 'Atriplex prostrata subsp. prostrata', abundance: '1' },
        { layer: 'C', name: 'Ranunculus sceleratus', abundance: 'r' },
        { layer: 'C', name: 'Puccinellia distans', abundance: '2' },
        { layer: 'C', name: 'Agrostis stolonifera', abundance: '+' },
        { layer: 'C', name: 'Glaux maritima', abundance: '1' },
        { layer: 'C', name: 'Spergularia salina', abundance: '2' },
        { layer: 'C', name: 'Juncus gerardi', abundance: '1' },
        { layer: 'C', name: 'Bolboschoenus maritimus', abundance: 'r' },
        { layer: 'C', name: 'Salicornia europaea', abundance: '3' },
        { layer: 'C', name: 'Phragmites australis', abundance: '1' },
      ],
    },
    {
      coords: 'N 54°09′58,3″ – E 15°34′48,7″',
      area: 9,
      cover: 85,
      unit: UNIT,
      species: [
        { layer: 'C', name: 'Aster tripolium', abundance: '2' },
        { layer: 'C', name: 'Atriplex prostrata subsp. prostrata', abundance: '1' },
        { layer: 'C', name: 'Puccinellia distans', abundance: '2' },
        { layer: 'C', name: 'Agrostis stolonifera', abundance: '+' },
        { layer: 'C', name: 'Glaux maritima', abundance: '1' },
        { layer: 'C', name: 'Spergularia salina', abundance: '1' },
        { layer: 'C', name: 'Salicornia europaea', abundance: '3' },
        { layer: 'C', name: 'Phragmites australis', abundance: '1' },
      ],
    },
    {
      coords: 'N 54°10′02,7″ – E 15°34′56,7″',
      area: 9,
      cover: 95,
      unit: UNIT,
      species: [
        { layer: 'C', name: 'Aster tripolium', abundance: '+' },
        { layer: 'C', name: 'Plantago maritima', abundance: '1' },
        { layer: 'C', name: 'Atriplex prostrata subsp. prostrata', abundance: '1' },
        { layer: 'C', name: 'Ranunculus sceleratus', abundance: 'r' },
        { layer: 'C', name: 'Puccinellia distans', abundance: '2' },
        { layer: 'C', name: 'Glaux maritima', abundance: '1' },
        { layer: 'C', name: 'Spergularia salina', abundance: '2' },
        { layer: 'C', name: 'Juncus gerardi', abundance: '1' },
        { layer: 'C', name: 'Salicornia europaea', abundance: '4' },
        { layer: 'C', name: 'Triglochin maritima', abundance: 'r' },
        { layer: 'C', name: 'Phragmites australis', abundance: '1' },
      ],
    },
  ],
  indicators: {
    area: { inputs: { trend: '', areaM2: 1500 }, value: '1500 m²', grade: 'U1' },
    ratio: {
      inputs: { patches: undefined, potential: undefined, share: undefined },
      value: 'Nie oceniano (wskaźnik od 2016 r.). W karcie: procent powierzchni zajęty przez siedlisko na transekcie 25% – U1 (transekt niestandardowy, obejmuje kilka rozproszonych płatów)',
      grade: 'XX',
    },
    characteristic: { inputs: { species: [{ name: 'Salicornia europaea', cover: 65 }] }, value: 'Salicornia europaea 65%', grade: 'FV' },
    dominant: {
      inputs: {
        species: [
          { name: 'Aster tripolium', cover: 5 },
          { name: 'Puccinellia distans', cover: 10 },
          { name: 'Spergularia salina', cover: 10 },
          { name: 'Salicornia europaea', cover: 60 },
          { name: 'Phragmites australis', cover: 15 },
        ],
        coverC: 87,
      },
      value: 'Aster tripolium 5%, Puccinellia distans 10%, Spergularia salina 10%, Salicornia europaea 60%, Phragmites australis 15%; pokrycie warstwy C 87%',
      grade: 'FV',
    },
    invasive: { inputs: { species: [] }, value: 'Brak', grade: 'FV' },
    expansive: { inputs: { species: [{ name: 'Phragmites australis', cover: 15 }] }, value: 'Phragmites australis 15%', grade: 'U1' },
    spatial: {
      inputs: { choice: 'hundreds', radius: undefined },
      value: 'Płaty rozproszone, wykształcone w promieniu kilkuset metrów wokół wypływów solanki',
      grade: 'FV',
    },
    saltWater: {
      inputs: {
        choice: 'free',
        source: 'natural',
        ece: undefined,
        groundwater: undefined,
        waterEc: undefined,
        note: 'Zasilanie na drodze ascenzji reliktowych wód mezozoiku; w odległości 150–500 m rzeka Parsęta; woda długo stagnuje, tworząc kilka astatycznych oczek wodnych; w rowach melioracyjnych w obrębie solnisk płynie woda silnie zasolona',
      },
      value:
        'Zasilanie na drodze ascenzji reliktowych wód mezozoiku; w odległości 150–500 m rzeka Parsęta; woda długo stagnuje, tworząc kilka astatycznych oczek wodnych; w rowach melioracyjnych w obrębie solnisk płynie woda silnie zasolona; źródło: naturalne',
      grade: 'FV',
    },
  },
  prospects: {
    value: 'Realne zagrożenie ze strony planowanej obwodnicy Kołobrzegu (przebieg ok. 100 m od płatów) i modernizacji sieci rowów melioracyjnych; teren prywatny, bez zabiegów ochronnych.',
    grade: 'U1',
  },
  impacts: [
    {
      code: 'J02.01.02',
      name: 'Osuszanie terenów morskich, ujściowych, bagiennych',
      influence: '0',
      intensity: 'L',
      description:
        'Mimo gęstej sieci rowów melioracyjnych większość jest zamulona i zarośnięta – woda rozlewa się na dużym obszarze i długo stagnuje. (W karcie z 2009 r.: kod 810 odwadnianie, intensywność C, wpływ 0.)',
    },
  ],
  threats: [
    {
      code: 'D01.02',
      name: 'Drogi, autostrady',
      description:
        'Planowana budowa obwodnicy Kołobrzegu (nasyp lub, mniej prawdopodobnie, estakada); III etap wg pierwotnych założeń miał przebiegać dokładnie przez płaty solnisk. Projekt zmodyfikowano, omijając płaty zaledwie o ok. 100 m (przebieg między płatami lub tuż nad nimi), z zachowaniem wskazanych przez ekspertów zasad ochrony siedliska. W obecnym kształcie nadal realne zagrożenie na etapie budowy i eksploatacji. (W karcie: kod 502, intensywność A.)',
    },
    {
      code: 'J02.01.02',
      name: 'Osuszanie terenów morskich, ujściowych, bagiennych',
      description:
        'Obecnie większość rowów jest niedrożna; równocześnie z budową obwodnicy planowana jest modernizacja sieci rowów melioracyjnych. (W karcie: kod 810, intensywność i wpływ XX.)',
    },
  ],
  other: {
    otherValues:
      'Obecnie jedno z dwóch naturalnych stanowisk solirodu zielnego Salicornia europaea w kraju, w porównaniu ze stanowiskiem na Wyspie Chrząszczewskiej wielokrotnie większe, utrzymujące się bez zmian od wielu lat obserwacji. W porównaniu z antropogenicznymi stanowiskami w głębi lądu fitocenozy bogatsze gatunkowo.',
    conservation: 'Wykonywane zabiegi: brak. Istniejące plany: projektowany użytek ekologiczny „Dolina Stramniczki”.',
    notes:
      'Typ stanowiska: referencyjne. Zarządzanie terenem: Gmina Kołobrzeg / własność prywatna. Data wypełnienia karty: 30.07.2009. Udział powierzchni siedliska w stanie FV 70%, U1 30%. Inne obserwacje: przy wysokich stanach Parsęty i obfitych opadach płaty są długo pokryte stagnującą wodą – wegetacja zaczyna się bardzo późno (nawet w lipcu) albo jest przerywana i wznawiana po opadnięciu wody. Soliród pojedynczo spotykany jest w znacznej odległości od wysięków solanki, bo jako jeden z pierwszych kolonizuje zbuchtowane przez dziki nagie podłoże wśród trzcinowisk. Uwagi metodyczne: prace przy obwodnicy wymagają częstego monitoringu (nawet co parę tygodni, zwłaszcza na początku inwestycji) – zaburzenia wypływu/podsiąkania solanki przy wydobyciu torfu i dociążeniu wykopów piaskiem (szczególnie przy wariancie nasypu), funkcjonowanie zmodernizowanej sieci melioracyjnej (pożądany przepływ progowy); długotrwałe utrzymywanie się wody z rozlewów rzeki wysładza siedlisko. Wskaźników „Stosunek powierzchni płatów do potencjalnej” i „Struktura przestrzenna płatów” w karcie z 2009 r. nie było – pierwszy oznaczono XX, drugi wyprowadzono z opisu stanowiska.',
    photos: [],
  },
  overallComment: 'Struktura U1 przez trzcinę (15% – gatunki ekspansywne); powierzchnia i perspektywy U1 (obwodnica, melioracje).',
}

export const examples1310: CardExample[] = [{ id: 'kolobrzeg-budzistowo', label: 'Kołobrzeg-Budzistowo', values: kolobrzeg }]
