// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Perzanowska 2012, rozdz. 5130, pkt 3 „Przykład wypełnionej
// karty obserwacji”): Poradów, 8.06.2010. Ekspert zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („N 50° 19′ …'' – E 20° 03′ …''”) – przepisane do minut;
//  • literówki w nazwach gatunków poprawione, żeby katalog je rozpoznał: Ligusticum vulgare → Ligustrum vulgare (ligustr –
//    w karcie przy krzewach podany po polsku), Cornus/Coprnus sanquinea → Cornus sanguinea, Sanquisorba → Sanguisorba,
//    Galium pumillum → G. pumilum, Quercus sesilis → Q. sessilis, Convulvulus → Convolvulus, Pirus → Pyrus;
//  • zdjęcia: wysokość B „max. 2,5 m, śr. 70 cm” → 0,7 m (średnia; maksimum przepada – pole na jedną liczbę);
//  • powierzchnia siedliska: w karcie tylko „0,1 ha FV” (w danych stanowiska 0,5 ha) – trend nie podany, przyjęte
//    „nie podlega zmianom”; obie liczby przepisane jak w oryginale;
//  • zestaw wskaźników „karta przykładowa i 2009–2010” – karta ma stan zdrowotny jałowców (U1), którego nie ma w tab. 2;
//  • odnowienie: „Słabe, ale obecne” z oceną FV, choć wg tab. 2 „obecne, ale rzadkie” to U1 – ocena eksperta zostaje,
//    formularz pokazuje rozjazd z progiem (na strukturę nie wpływa: wskaźnik niekardynalny, struktura i tak U1);
//  • działalność człowieka: stary kod 950 Ewolucja biocenotyczna → K02 (słownik 2011), intensywność B → M, stary kod
//    w opisie; „Zagrożenia” (tekst) → kod K02 z oryginalną treścią.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology5130 } from './methodology'

const COORD = 'N 50°19′; E 20°03′'
const UNIT = 'Inuletum ensifoliae'

type Row = [layer: 'A' | 'B' | 'C', name: string, abundance: string]
const releve = (
  o: { altitude: number; slope: number; exposure: string; coverA?: number; coverB: number; coverC: number; heightA?: number; heightB: number; heightC: number },
  species: Row[],
) => ({
  coords: COORD,
  area: 25,
  unit: UNIT,
  coverA: undefined,
  heightA: undefined,
  ...o,
  species: species.map(([layer, name, abundance]) => ({ layer, name, abundance })),
})

/** „Achillea pannonica +, Brachypodium pinnatum 2, …” → wiersze warstwy L. */
const list = (layer: 'B' | 'C', spec: string): Row[] =>
  spec.split(', ').map((s) => {
    const i = s.lastIndexOf(' ')
    return [layer, s.slice(0, i), s.slice(i + 1)]
  })

export const poradow: CardValues = {
  ...emptyCardValues(methodology5130),
  site: {
    siteName: 'Poradów',
    guid: '',
    siteType: 'badawcze',
    indicatorSet: 'card2010',
    communities: UNIT,
    description:
      'Południowe zbocza pagórków położonych na północ od drogi przechodzącej przez wieś Poradów. Na wierzchowinie i u podstawy zbocza – pola uprawne oraz pojedyncze łąki, a bliżej drogi – zabudowania. Zagłębienia terenu na zboczach, podobnie jak najniższe ich partie zarastają krzewami i drzewami. Wysokość zboczy do kilkunastu metrów.',
    areaHa: '0,5',
    protectedAreas: 'Obszar Natura 2000 Poradów',
    manager: 'Własność prywatna',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '20x100 m',
    altitude: '299–305',
    date: '2010-06-08',
    observer: 'Jan Kowalski',
    additionalExperts: '',
  },
  releves: [
    releve({ altitude: 299, slope: 40, exposure: 'SW', coverB: 20, coverC: 80, heightB: 0.7, heightC: 30 }, [
      ...list('B', 'Cerasus avium +, Crataegus sp. +, Juniperus communis 2, Larix europaea +, Rosa canina +'),
      ...list(
        'C',
        'Achillea pannonica +, Agrimonia eupatoria +, Anthyllis vulneraria +, Brachypodium pinnatum 2, Campanula bononiensis +, Campanula sibirica +, Carex humilis +, Centaurea scabiosa +, Cerasus avium +, Cerinthe minor +, Cornus sanguinea +, Coronilla varia +, Crataegus sp. +, Crepis sp. +, Echium vulgare +, Euphorbia cyparissias 1, Galium pumilum +, Galium boreale +, Inula ensifolia 4, Ligustrum vulgare +, Medicago falcata +, Melampyrum arvense +, Onobrychis arenaria +, Pimpinella saxifraga +, Plantago lanceolata +, Poa compressa +, Potentilla heptaphylla +, Quercus sessilis +, Ranunculus sp. +, Rosa canina +, Salvia pratensis 1, Salvia verticillata +, Sanguisorba minor 2, Scabiosa ochroleuca +, Taraxacum officinale +, Thymus marschallianus +, Thymus pannonicus 1',
      ),
    ]),
    releve({ altitude: 301, slope: 50, exposure: 'W', coverA: 1, coverB: 25, coverC: 90, heightA: 3, heightB: 0.7, heightC: 35 }, [
      ...list('B', 'Prunus spinosa +, Cornus sanguinea +, Juniperus communis 2, Rosa canina +'),
      ...list(
        'C',
        'Achillea pannonica +, Brachypodium pinnatum +, Campanula bononiensis +, Carex humilis 2, Centaurea scabiosa +, Cerasus avium +, Coronilla varia +, Crataegus sp. +, Crepis sp. 2, Echium vulgare +, Euphorbia cyparissias 1, Festuca rubra +, Fragaria viridis +, Galium boreale 1, Inula ensifolia 5, Ligustrum vulgare +, Melampyrum arvense +, Pimpinella saxifraga +, Plantago lanceolata +, Poa compressa +, Potentilla heptaphylla 1, Quercus sessilis +, Ranunculus sp. +, Rosa canina 1, Salvia pratensis +, Salvia verticillata +, Sanguisorba minor 2, Scabiosa ochroleuca +, Sorbus aucuparia +, Stellaria holostea +, Thymus pannonicus +, Thymus marschallianus +, Viola hirta +',
      ),
    ]),
    releve({ altitude: 305, slope: 45, exposure: 'W', coverB: 30, coverC: 85, heightB: 0.8, heightC: 20 }, [
      ...list('B', 'Ligustrum vulgare +, Sorbus aucuparia +, Cerasus avium +, Juniperus communis 2, Rosa canina 2'),
      ...list(
        'C',
        'Achillea pannonica +, Agrimonia eupatoria +, Anthyllis vulneraria +, Asperula cynanchica +, Aster amellus +, Brachypodium pinnatum 1, Briza media +, Campanula sibirica +, Carex humilis 1, Centaurea scabiosa +, Cerasus avium +, Convolvulus arvensis +, Cornus sanguinea +, Coronilla varia +, Crataegus sp. +, Euphorbia cyparissias 1, Festuca rubra +, Fraxinus excelsior +, Galium mollugo +, Hieracium pilosella +, Hypericum perforatum +, Inula ensifolia 4, Juniperus communis +, Koeleria glauca +, Lotus corniculatus +, Melampyrum pratense +, Onobrychis arenaria +, Ononis arvensis +, Pyrus communis +, Plantago lanceolata +, Plantago media +, Poa compressa +, Potentilla heptaphylla +, Quercus sessilis +, Ranunculus sp. +, Rosa canina 1, Salvia pratensis +, Salvia verticillata +, Sanguisorba minor 1, Scabiosa ochroleuca +, Thymus pannonicus +, Thymus marschallianus +, Viburnum opulus +',
      ),
    ]),
  ],
  indicators: {
    area: { inputs: { choice: 'stable', areaText: '0,1 ha', note: '' }, value: '0,1 ha', grade: 'FV' },
    share: { inputs: { value: '30–40', note: '' }, value: '30–40%', grade: 'FV' },
    shrubs: {
      inputs: {
        species: [
          { name: 'Cerasus avium', cover: 0.5 },
          { name: 'Cornus sanguinea', cover: 5 },
          { name: 'Juniperus communis', cover: 80 },
          { name: 'Ligustrum vulgare', cover: 0.5 },
          { name: 'Prunus spinosa', cover: 0.5 },
          { name: 'Rosa canina', cover: 10 },
          { name: 'Sorbus aucuparia', cover: 0.5 },
        ],
        choice: '',
        note: 'wiśnia ptasia Cerasus avium <1%, dereń Cornus sanguinea 5%, jałowiec Juniperus communis 80%, ligustr Ligustrum vulgare <1%, tarnina Prunus spinosa <1%, róża Rosa canina 10%, jarzębina Sorbus aucuparia <1%',
      },
      value:
        'wiśnia ptasia Cerasus avium <1%, dereń Cornus sanguinea 5%, jałowiec Juniperus communis 80%, ligustr Ligustrum vulgare <1%, tarnina Prunus spinosa <1%, róża Rosa canina 10%, jarzębina Sorbus aucuparia <1%',
      grade: 'U1',
    },
    height: { inputs: { height: '0,8–1', max: '2,5', note: '' }, value: 'Max. 2,5 m; śr. 0,8–1 m', grade: 'FV' },
    cover: { inputs: { value: '15–20', note: '' }, value: '15–20%', grade: 'U1' },
    structure: {
      inputs: { choice: 'clumps', note: 'Kilka płatów lub niewielkie kępy, lub też pojedyncze jałowce w rozproszeniu na murawie' },
      value: 'Kilka płatów lub niewielkie kępy, lub też pojedyncze jałowce w rozproszeniu na murawie',
      grade: 'U1',
    },
    trees: {
      inputs: {
        choice: '',
        cover: undefined,
        species: [
          { name: 'Cerasus avium', cover: 0.5 },
          { name: 'Pinus sylvestris', cover: 0.5 },
        ],
        none: '',
        note: 'wiśnia ptasia Cerasus avium: <1%; sosna zwyczajna Pinus sylvestris <1%',
      },
      value: 'wiśnia ptasia Cerasus avium: <1%; sosna zwyczajna Pinus sylvestris <1%',
      grade: 'U1',
    },
    characteristic: {
      inputs: {
        species: [{ name: 'Inula ensifolia' }, { name: 'Carex humilis' }, { name: 'Aster amellus' }, { name: 'Brachypodium pinnatum' }, { name: 'Salvia pratensis' }],
        count: undefined,
        choice: '',
        note: 'oman wąskolistny Inula ensifolia, turzyca niska Carex humilis, aster gawędka Aster amellus, kłosownica pierzasta Brachypodium pinnatum, szałwia łąkowa Salvia pratensis',
      },
      value:
        'oman wąskolistny Inula ensifolia, turzyca niska Carex humilis, aster gawędka Aster amellus, kłosownica pierzasta Brachypodium pinnatum, szałwia łąkowa Salvia pratensis',
      grade: 'FV',
    },
    expansive: { inputs: { species: [], none: 'yes', choice: '', note: '' }, value: 'Brak', grade: 'FV' },
    health: { inputs: { choice: 'some', note: 'Mały procent krzewów uschniętych' }, value: 'Mały procent krzewów uschniętych', grade: 'U1' },
    regeneration: { inputs: { choice: 'rare', note: 'Słabe, ale obecne' }, value: 'Słabe, ale obecne', grade: 'FV' },
    aliens: { inputs: { species: [], abundance: '', count: undefined, none: 'yes', note: '' }, value: 'Brak', grade: 'FV' },
  },
  prospects: {
    value:
      'Teren bez tradycji ochroniarskich, brak użytkowania kośno-pasterskiego i brak zwierząt gospodarskich w okolicznych domach. Zapoczątkowany proces sukcesji, na co wskazuje obecność młodych osobników różnych gatunków drzew w murawie. Ponadto zbocze powoli zarasta różami i tarniną, oraz zaroślami śliw od podnóża. W najbliższych latach prawdopodobnie murawa i jałowce zostaną ocienione przez konkurencyjne gatunki. W sąsiedztwie rozrasta się robinia akacjowa – silna ekspansja.',
    grade: 'U1',
  },
  impacts: [
    {
      code: 'K02',
      name: 'Ewolucja biocenotyczna, sukcesja',
      influence: '-',
      intensity: 'M',
      description: 'Brak użytkowania. (Kod w karcie z 2010 r.: 950 Ewolucja biocenotyczna, intensywność B.)',
    },
  ],
  threats: [
    {
      code: 'K02',
      name: 'Ewolucja biocenotyczna, sukcesja',
      description: 'Głównym zagrożeniem dla siedliska na stanowisku jest sukcesja naturalna.',
    },
  ],
  other: {
    otherValues: 'Siedlisko 6210',
    conservation: 'Brak',
    proposals: 'Najkorzystniejszym działaniem byłby wypas ew. wykaszanie muraw, eliminacja krzewów i drzew ekspansywnych, jak tarnina itp.',
    shareFV: 30,
    shareU1: 65,
    shareU2: 5,
    notes:
      'Rok: 2010. Typ monitoringu: zintegrowany. Monitoring jest wymagany: tak – niewielki, nie objęty dotychczas żadną formą ochrony obiekt, narażony na niekorzystne przemiany, wobec braku użytkowania. Transekt w karcie opisany jako powierzchnia prostokątna 20×100 m. Powierzchnia płatów siedliska 0,5 ha (dane stanowiska), a przy wskaźniku powierzchni 0,1 ha – jak w oryginale.',
    photos: [],
  },
  overallComment: '',
}

export const examples5130: CardExample[] = [{ id: 'poradow', label: 'Poradów', values: poradow }]
