// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Świerkosz, Reczyńska 2015, rozdz. 6130, pkt 3 „Przykład karty
// obserwacji”): Miedzianka (Rudawy Janowickie), 2012–2013. Eksperci zanonimizowani (Jan Kowalski, Anna Nowak).
//  • współrzędne w przewodniku są ucięte do minut („N 50º 52' …'' – 50º 52' …''”) – przepisane do minut;
//  • data kontroli „26–27.06.2012, 7.07.2013” – w polu daty ostatnia wizyta, wcześniejsze w uwagach;
//  • zdjęcia: wysokości warstw C i D w karcie w metrach (0,2–0,3 m; 0,01 m) → centymetry (20–30; 1); zdjęcie I
//    „płasko” → nachylenie 0, ekspozycja „płasko”; siewki drzew w warstwie C – jak w karcie; literówka
//    „Ceratodon purpuraeus” → C. purpureus;
//  • obce: karta podaje tylko pokrycie łączne („łącznie 5% hałdy”) – w polu „Łączne pokrycie”;
//  • niszczenie: „eksploatacja kruszywa na około 10% hałdy” ekspert ocenił na U1, a tab. 2 wymienia pobór kruszywa przy
//    U2 – ocena eksperta zostaje, formularz pokazuje rozjazd z progiem (struktura i tak U2 przez obce gatunki);
//  • oddziaływania: intensywność A → H, B → M; I01 w karcie „Nierodzime gatunki zaborcze” – nazwa wg słownika 2011;
//    intensywność zagrożeń (A) w opisie, bo pole zagrożenia jej nie ma;
//  • „Raport roczny” (rok, zagrożenia tekstem, inne wartości, monitoring wymagany i uzasadnienie) – w uwagach.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology6130 } from './methodology'

const COORD = 'E 15°56′; N 50°52′'
const UNIT = 'zbiorowisko Silene vulgaris-Agrostis capillaris'

type Row = [layer: 'C' | 'D', name: string, abundance: string]
/** „Acer platanoides r; Aegopodium podagraria +; …” → wiersze warstwy L. */
const list = (layer: 'C' | 'D', spec: string): Row[] =>
  spec.split('; ').map((s) => {
    const i = s.lastIndexOf(' ')
    return [layer, s.slice(0, i), s.slice(i + 1)]
  })

const releve = (
  o: { altitude: number; area: number; slope: number; exposure: string; coverC: number; coverD?: number; heightC: number; heightD?: number },
  species: Row[],
) => ({
  coords: COORD,
  unit: UNIT,
  coverA: undefined,
  coverB: undefined,
  coverD: undefined,
  heightA: undefined,
  heightB: undefined,
  heightD: undefined,
  ...o,
  species: species.map(([layer, name, abundance]) => ({ layer, name, abundance })),
})

export const miedzianka: CardValues = {
  ...emptyCardValues(methodology6130),
  site: {
    siteName: 'Miedzianka',
    guid: '',
    siteType: 'Badawcze',
    region: 'rudawy',
    communities: 'zbiorowisko z rzędu Violetalia calaminariae (zbiorowisko Silene vulgaris-Agrostis capillaris)',
    description:
      'Zbiorowiska muraw galmanowych z Rudaw Janowickich charakteryzują się składem florystycznym w którym dominują Agrostis capillaris, Silene vulgaris, Galium album, Pimpinella saxifraga, Rumex acetosa, Dianthus deltoides, Thymus pulegioides, Ceratodon purpureus, Cladonia alcicornis oraz Festuca ovina. Wyraźnie zauważalne jest zróżnicowanie zależne od trofizmu podłoża – w części płatów pojawiają się gatunki łąkowe z klasy Molinio-Arrhenatheretea (Festuca rubra, Achillea millefolium, Leucanthemum vulgare, Lotus corniculatus, Knautia arvensis, Dactylis glomerata), w części zaś do typowego składu płatów wchodzą gatunki klasy Koelerio-Corynephoretea (Sedum maximum, Trifolium arvense, Rumex acetosella s. lato). Interesującą cechą jest także masowe występowanie w wielu płatach Equisetum arvense. Dominacja Agrostis capillaris, Festuca ovina i Silene vulgaris sprawia, że murawy te są doskonale widoczne nawet ze znacznej odległości i zdecydowanie wyróżniają się spośród otaczających je zbiorowisk łąkowych lub antropogenicznych. Spośród taksonów charakterystycznych obserwowano występowanie okazów wykazujących cechy przypisywane Silene vulgaris var. humilis, które jednak towarzyszyły z reguły tu formom typowym gatunku (por. Baumbach 2012). Często obserwowano także formy pośrednie, oraz okazy o typowych cechach S. vulgaris jednak z wyraźnymi zniekształceniami w budowie liści i kwiatostanów. Nie odnaleziono w badanych murawach gatunku charakterystycznego jakim jest Armeria maritima ssp. halleri, jednak z początku XXI wieku był on podawany z jednego tylko stanowiska koło Miedzianki (Brej, Fabiszewski 2006), gdzie występował w „małej liczbie osobników”. Należy jednak pamiętać, że status tego podgatunku jest niepewny.\n\nDo założenia transektu wytypowano dwie silnie zniszczone, jednak z fragmentami typowych zbiorowisk muraw galmanowych hałdy leżące na południe od wsi Miedzianka. Pozostałe stanowiska zachowały się tu tylko we fragmentach lub są niedostępne do badań, znajdują się bowiem na terenach prywatnych pastwisk otoczonych drutem kolczastym. Stan zachowania płatów jest zły, gdyż podlegają one intensywnej antropopresji. Część hałd została zniszczona poprzez pobór kruszywa do celów budowlanych lub uległa zaawansowanej sukcesji, przez co zarówno oceny stanu zachowania specyficznej struktury i funkcji jak i perspektywy ochrony musiały zostać uznane za złe. Istnieje jednak możliwość przywrócenia przynajmniej części hałd do stanu umożliwiającego regenerację muraw galmanowych poprzez wycinkę zarastających je drzew, usunięcie nagromadzonej materii organicznej i ponowne wprowadzenie ekstensywnego wypasu.',
    areaHa: '0,002',
    protectedAreas: 'Nie chronione.',
    natura2000: 'PLH020011 Rudawy Janowickie',
    manager: 'Własność prywatna',
    coords: 'N 50°52′ – 50°52′; E 15°56′ – 15°56′',
    transect: '450 m długości',
    altitude: '480–520',
    date: '2013-07-07',
    observer: 'Jan Kowalski',
    additionalExperts: 'Anna Nowak',
  },
  releves: [
    releve(
      { altitude: 530, area: 10, slope: 0, exposure: 'płasko', coverC: 90, heightC: 20 },
      list(
        'C',
        'Acer platanoides r; Acer pseudoplatanus r; Aegopodium podagraria +; Agrostis capillaris 1; Angelica sylvestris r; Arrhenatherum elatius +; Deschampsia flexuosa 1; Festuca ovina 4; Heracleum sphondylium r; Hieracium pilosella +; Pimpinella saxifraga r; Rumex tenuifolius 1; Sorbus aucuparia r; Tanacetum vulgare +; Viola canina r',
      ),
    ),
    releve({ altitude: 480, area: 25, slope: 20, exposure: 'SW', coverC: 80, coverD: 10, heightC: 30, heightD: 1 }, [
      ...list(
        'C',
        'Achillea millefolium r; Agrostis capillaris 2; Arrhenatherum elatius +; Carex sp. r; Cerastium arvense r; Deschampsia flexuosa +; Dianthus deltoides 2; Festuca ovina 3; Fragaria vesca +; Fragaria viridis +; Galium album 1; Knautia arvensis r; Linaria vulgaris r; Pimpinella saxifraga r; Quercus petraea r; Sedum maximum 1; Silene vulgaris 1; Tanacetum vulgare +; Thymus pulegioides 2; Trifolium arvense r',
      ),
      ...list('D', 'Ceratodon purpureus +; Cladonia sp. 2; Cornicularia sp. 1'),
    ]),
    releve({ altitude: 480, area: 25, slope: 25, exposure: 'W', coverC: 60, coverD: 5, heightC: 30, heightD: 1 }, [
      ...list(
        'C',
        'Acer pseudoplatanus r; Agrostis capillaris 2; Arrhenatherum elatius r; Betula pendula r; Cerastium arvense +; Dianthus deltoides r; Festuca ovina 1; Galium album +; Pimpinella saxifraga r; Populus tremula +; Quercus petraea +; Rumex acetosa 1; Sedum maximum +; Silene vulgaris 2; Thymus pulegioides r; Trifolium arvense r',
      ),
      ...list('D', 'Ceratodon purpureus 1; Cladonia sp. +'),
    ]),
  ],
  indicators: {
    area: {
      inputs: { choice: 'decrease', loss: undefined, areaText: '0,002 ha', note: 'Zmniejsza się znacząco w stosunku do potencjalnego zasięgu.' },
      value: 'Zmniejsza się znacząco w stosunku do potencjalnego zasięgu.',
      grade: 'U2',
    },
    characteristic: {
      inputs: {
        species: [
          { name: 'Agrostis capillaris', cover: 15 },
          { name: 'Silene vulgaris', cover: 7 },
          { name: 'Festuca ovina', cover: 25 },
          { name: 'Rumex tenuifolius', cover: 1.5 },
          { name: 'Pimpinella saxifraga', cover: 0.1 },
          { name: 'Thymus pulegioides', cover: 6 },
          { name: 'Dianthus deltoides', cover: 1.5 },
        ],
        count: undefined,
        choice: '',
        note: 'mietlica pospolita Agrostis capillaris 15%; lepnica rozdęta Silene vulgaris 7%; kostrzewa owcza Festuca ovina 25%; szczaw wąskolistny Rumex tenuifolius 1,5%; biedrzeniec mniejszy Pimpinella saxifraga 0,1%; macierzanka zwyczajna Thymus pulegioides 6%; goździk kropkowany Dianthus deltoides 1,5%',
      },
      value:
        'mietlica pospolita Agrostis capillaris 15%; lepnica rozdęta Silene vulgaris 7%; kostrzewa owcza Festuca ovina 25%; szczaw wąskolistny Rumex tenuifolius 1,5%; biedrzeniec mniejszy Pimpinella saxifraga 0,1%; macierzanka zwyczajna Thymus pulegioides 6%; goździk kropkowany Dianthus deltoides 1,5%',
      grade: 'FV',
    },
    physiognomy: {
      inputs: {
        choice: 'u2',
        height: undefined,
        note: 'Murawy z licznym udziałem wysokich traw, bylin i krzewów. Podłoże hałdy niewidoczne z uwagi na pokrycie roślinności. Płaty muraw rozpoznawalne z bliska, dzięki charakterystycznej kombinacji gatunków, lecz fizjonomicznie słabo odróżnialne.',
      },
      value:
        'Murawy z licznym udziałem wysokich traw, bylin i krzewów. Podłoże hałdy niewidoczne z uwagi na pokrycie roślinności. Płaty muraw rozpoznawalne z bliska, dzięki charakterystycznej kombinacji gatunków, lecz fizjonomicznie słabo odróżnialne.',
      grade: 'U2',
    },
    aliens: {
      inputs: {
        species: [{ name: 'Reynoutria sachalinensis' }, { name: 'Reynoutria japonica' }],
        total: 5,
        none: '',
        note: 'rdestowiec sachaliński Reynoutria sachalinensis; rdestowiec ostrokończysty Reynoutria japonica – łącznie 5% hałdy',
      },
      value: 'rdestowiec sachaliński Reynoutria sachalinensis; rdestowiec ostrokończysty Reynoutria japonica – łącznie 5% hałdy',
      grade: 'U2',
    },
    nitrophilous: {
      inputs: {
        species: [
          { name: 'Rubus idaeus', cover: 2 },
          { name: 'Aegopodium podagraria', cover: 0.5 },
        ],
        total: undefined,
        none: '',
        note: 'malina właściwa Rubus idaeus 2%; podagrycznik pospolity Aegopodium podagraria <0,5%',
      },
      value: 'malina właściwa Rubus idaeus 2%; podagrycznik pospolity Aegopodium podagraria <0,5%',
      grade: 'U1',
    },
    expansive: {
      inputs: {
        species: [
          { name: 'Agrostis capillaris', cover: 15 },
          { name: 'Festuca ovina', cover: 25 },
        ],
        none: '',
        choice: '',
        note: 'Gatunki wchodzące w skład typowej kombinacji gatunkowej: mietlica pospolita Agrostis capillaris 15%, kostrzewa owcza Festuca ovina 25%',
      },
      value: 'Gatunki wchodzące w skład typowej kombinacji gatunkowej: mietlica pospolita Agrostis capillaris 15%, kostrzewa owcza Festuca ovina 25%',
      grade: 'FV',
    },
    shrubs: {
      inputs: {
        species: [
          { name: 'Acer pseudoplatanus', cover: 5 },
          { name: 'Betula pendula', cover: 20 },
          { name: 'Quercus petraea', cover: 0.5 },
          { name: 'Populus tremula', cover: 0.5 },
          { name: 'Sorbus aucuparia', cover: 0.5 },
        ],
        total: undefined,
        none: '',
        note: 'klon jawor Acer pseudoplatanus 5%; brzoza brodawkowata Betula pendula 20%; dąb bezszypułkowy Quercus petraea <0,5%; topola osika Populus tremula <0,5%; jarząb pospolity Sorbus aucuparia <0,5%',
      },
      value:
        'klon jawor Acer pseudoplatanus 5%; brzoza brodawkowata Betula pendula 20%; dąb bezszypułkowy Quercus petraea <0,5%; topola osika Populus tremula <0,5%; jarząb pospolity Sorbus aucuparia <0,5%',
      grade: 'U1',
    },
    grazing: { inputs: { choice: 'none', note: 'Brak wypasu' }, value: 'Brak wypasu', grade: 'U2' },
    destruction: {
      inputs: { choice: 'physical', note: 'Eksploatacja kruszywa na około 10% hałdy' },
      value: 'Eksploatacja kruszywa na około 10% hałdy',
      grade: 'U1',
    },
  },
  prospects: {
    value:
      'Stan zachowania płatów jest zły, gdyż podlegają one intensywnej antropopresji. Część hałd została zniszczona poprzez pobór kruszywa do celów budowlanych lub uległa zaawansowanej sukcesji. Istnieje jednak możliwość przywrócenia przynajmniej części hałd do stanu umożliwiającego regenerację muraw galmanowych poprzez wycinkę zarastających je drzew, usunięcie nagromadzonej materii organicznej i ponowne wprowadzenie ekstensywnego wypasu.',
    grade: 'U2',
  },
  impacts: [
    {
      code: 'A04.03',
      name: 'Zarzucenie pasterstwa, brak wypasu',
      influence: '-',
      intensity: 'H',
      description: 'Płaty siedliska nie podlegają wypasowi, co skutkuje intensywnymi procesami sukcesji w kierunku zbiorowisk zaroślowo-leśnych.',
    },
    {
      code: 'C01.07',
      name: 'Inna działalność górnicza lub wydobywcza',
      influence: '-',
      intensity: 'M',
      description: 'Nielegalny pobór kruszywa, skutkujący zmniejszeniem powierzchni hałd.',
    },
    {
      code: 'I01',
      name: 'Obce gatunki inwazyjne',
      influence: '-',
      intensity: 'M',
      description: 'Na transekcie odnotowano obecność obcych gatunków silnie inwazyjnych: Reynoutria japonica, R. sachalinensis. (W karcie: „Nierodzime gatunki zaborcze”.)',
    },
    {
      code: 'K02',
      name: 'Ewolucja biocenotyczna, sukcesja',
      influence: '-',
      intensity: 'H',
      description:
        'Na skutek zarzucenia wypasu znacząca część hałd na transekcie porośnięta jest przez pionierskie zbiorowiska zaroślowo-leśne, głównie z udziałem brzozy brodawkowatej Betula pendula i topoli osiki Populus tremula.',
    },
  ],
  threats: [
    { code: 'C01.07', name: 'Inna działalność górnicza lub wydobywcza', description: 'Przewiduje się dalsze, intensywne rozbieranie hałd. (Intensywność w karcie: A.)' },
    {
      code: 'K02',
      name: 'Ewolucja biocenotyczna, sukcesja',
      description: 'Brak zabiegów ochrony czynnej skutkował będzie całkowitym zarośnięciem hałd i zanikiem roślinności typowej dla siedliska. (Intensywność w karcie: A.)',
    },
  ],
  other: {
    otherValues:
      'Obszar objęty antropopresją. W otoczeniu miejscowości i w pobliżu badanych stanowisk występują bardzo dobrze zachowane siedliska półnaturalne (niżowe i podgórskie łąki kośne – 6510), jednak bez wybitnych walorów florystycznych.',
    conservation: 'Nie są prowadzone.',
    proposals:
      'Objęcie siedliska ochroną czynną, na którą będą składać się: wznowienie wypasu, odlesienie hałd, usunięcie nagromadzonej materii organicznej oraz – w miarę możliwości – usunięcie gatunków obcych.',
    shareFV: 10,
    shareU1: 30,
    shareU2: 60,
    notes:
      'Rok: 2013. Data kontroli w karcie: 26–27.06.2012, 7.07.2013. Zagrożenia (raport roczny): neofityzacja, brak wypasu, sukcesja w kierunku zbiorowisk leśno-zaroślowych, pobór kruszywa z hałdy. Inne wartości przyrodnicze (raport roczny): w sąsiedztwie hałd często notowano występowanie siedliska 6510. Monitoring jest wymagany: tak – niewielka całkowita powierzchnia siedliska w regionie; siedlisko podlega znacząco negatywnym oddziaływaniom (neofityzacja, nadmierna ekspansja drzew i krzewów, brak wypasu, fizyczne niszczenie siedlisk).',
    photos: [],
  },
  overallComment: '',
}

export const examples6130: CardExample[] = [{ id: 'miedzianka', label: 'Miedzianka', values: miedzianka }]
