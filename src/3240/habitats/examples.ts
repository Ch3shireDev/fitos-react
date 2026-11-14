// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Perzanowska 2012, rozdz. 3240, pkt 3 „Przykład wypełnionej
// karty obserwacji”): Biała Tarnowska, Śnietnica, 21.07.2010. Ekspert zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („N 49° 30′ …'' – E 21° 03′ …''”) – przepisane do minut;
//  • zdjęcia: nachylenie „<1” → 0; wysokość B „150–200 cm” → 1,75 m, „100 cm, max 2,5 m” → 1 m, „300 cm, max 400–500 cm” → 3 m;
//  • powierzchnia siedliska: w karcie tylko „<0,5 ha FV” – trend nie podany, przyjęte „nie podlega zmianom”;
//  • udział gatunków drzewiastych: karta liczy od 1,5 m, formularz od 3 m – przy „Brak” bez różnicy;
//  • obce: rdestowiec <1% na transekcie + barszcz Sosnowskiego „obok” → 2 gatunki → U1, jak w karcie;
//  • oddziaływania: stare kody (2010) → słownik 2011: 830 → J02.03.02, 941 → L08; intensywność A → H (stary kod w opisie);
//  • „Zagrożenia” w karcie to tekst bez kodów – rozpisane na pięć kodów zagrożeń, treść przepisana do opisów;
//  • ocena struktury: karta ma FV, choć kardynalny wskaźnik „obce gatunki inwazyjne” ma U1 – tab. 2 daje wtedy U1
//    (i ocenę ogólną U1). Formularz liczy wg tab. 2; rozjazd opisany w specyfikacji.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology3240 } from './methodology'

const COORD = 'N 49°30′; E 21°03′'
const UNIT = 'Salici eleagni-Myricarietum'

type Row = [layer: 'B' | 'C', name: string, abundance: string]
const releve = (o: { altitude: number; exposure: string; coverB: number; coverC: number; heightB: number; heightC: number }, species: Row[]) => ({
  coords: COORD,
  area: 25,
  slope: 0,
  unit: UNIT,
  ...o,
  species: species.map(([layer, name, abundance]) => ({ layer, name, abundance })),
})

const C = (spec: string): Row[] =>
  spec.split(', ').map((s) => {
    const i = s.lastIndexOf(' ')
    return ['C', s.slice(0, i), s.slice(i + 1)]
  })

export const snietnica: CardValues = {
  ...emptyCardValues(methodology3240),
  site: {
    siteName: 'Śnietnica',
    guid: '',
    siteType: 'referencyjne',
    indicatorSet: 'guide',
    communities: UNIT,
    description:
      'Odcinek Białej Tarnowskiej powyżej zabytkowej cerkwi w Śnietnicy. W obecnej chwili główny nurt biegnie pod lewym brzegiem, od koryta odchodzą niewielkie odnogi, obecne są kamieniste wyspy, oba brzegi świeżo podmyte przez wodę, urwane, wysokie ponad 1–1,5 m. Transekt zlokalizowany na niedawno naniesionych kamieńcach. Średnia wielkość otoczaków to 10–20 cm średnicy, rzadziej większa. Miejscami naniesione łachy piasku i drobnego żwiru. Na ustalonych kamieńcach w sąsiedztwie (powyżej transektu) – płat zarośli wierzbowych (S. eleagnos, S. purpurea i Myricaria germanica) na lewym brzegu – pas młodego łęgu wierzbowo-olszowego. Na kamieńcach po powodzi, mającej miejsce trzy tygodnie wcześniej, niewielkie zwarcie roślinności. Duża ilość wyrzuconego przez wodę drewna i całych kęp runi oraz drzew z korzeniami, przy nich żywe rośliny (gatunki łąkowe). Grubsze pnie usunięte przez mieszkańców, pozostają głównie gałęzie. Lokalnie na łachach i żwirach obsiana września i osobniki prawdopodobnie przysypane, wytwarzające odrosty tworzące szczotkę pędów (30–40 cm wysokości). Na namuliskach widoczne kiełkujące masowo rośliny, często jest to września.',
    areaHa: '<0,5',
    protectedAreas: 'Obszar Natura 2000 Biała Tarnowska',
    manager: 'Własność prywatna gruntów wzdłuż rzeki, koryto – RZGW',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '10x200 m',
    altitude: '448',
    date: '2010-07-21',
    observer: 'Jan Kowalski',
    additionalExperts: '–',
  },
  releves: [
    releve({ altitude: 448, exposure: 'NW', coverB: 60, coverC: 60, heightB: 1.75, heightC: 30 }, [
      ['B', 'Salix eleagnos', '3'],
      ['B', 'Salix purpurea', '1'],
      ['B', 'Myricaria germanica', '1'],
      ...C(
        'Achillea millefolium +, Aegopodium podagraria 1, Alnus incana +, Artemisia vulgaris +, Barbarea vulgaris +, Calystegia sepium +, Centaurea jacea +, Cirsium arvense +, Crepis paludosa +, Equisetum arvense +, Eupatorium cannabinum 2, Geranium robertianum +, Hypericum perforatum +, Juncus articulatus +, Lotus corniculatus +, Lysimachia nummularia +, Lysimachia vulgaris +, Mentha longifolia 1, Myricaria germanica 1, Petasites kablikianus 2, Plantago lanceolata +, Polygonum aviculare +, Ranunculus repens +, Reynoutria japonica +, Rubus caesius 1, Salix fragilis 1, Salix eleagnos 1, Taraxacum officinale +, Tussilago farfara 2',
      ),
    ]),
    releve({ altitude: 446, exposure: 'N', coverB: 40, coverC: 50, heightB: 1, heightC: 30 }, [
      ['B', 'Salix eleagnos', '2'],
      ['B', 'Salix purpurea', '2'],
      ['B', 'Myricaria germanica', '+'],
      ...C(
        'Achillea millefolium +, Aegopodium podagraria 1, Carex hirta +, Artemisia vulgaris +, Barbarea vulgaris +, Corylus avellana +, Eupatorium cannabinum +, Dactylis glomerata +, Galium mollugo +, Lysimachia vulgaris +, Myricaria germanica +, Petasites kablikianus 1, Polygonum aviculare +, Heracleum sphondylium +, Ranunculus acris +, Ranunculus repens +, Reynoutria japonica +, Trifolium pratense +, Rubus caesius +, Salix fragilis +, Salix eleagnos 2, Salix purpurea 2, Urtica dioica +, Taraxacum officinale +, Tussilago farfara +',
      ),
    ]),
    releve({ altitude: 447, exposure: 'N', coverB: 90, coverC: 50, heightB: 3, heightC: 40 }, [
      ['B', 'Alnus glutinosa', '+'],
      ['B', 'Myricaria germanica', '1'],
      ['B', 'Salix eleagnos', '4'],
      ['B', 'Salix fragilis', '1'],
      ['B', 'Salix purpurea', '1'],
      ...C(
        'Aegopodium podagraria +, Alchemilla sp. +, Artemisia vulgaris +, Brachypodium sylvaticum 1, Chaerophyllum aromaticum +, Chenopodium album +, Cirsium arvense +, Cirsium palustre +, Daucus carota +, Deschampsia caespitosa +, Elymus caninus 2, Epilobium roseum +, Equisetum arvense +, Eupatorium cannabinum 2, Galium mollugo +, Glechoma hederacea +, Leucanthemum vulgare +, Lotus corniculatus +, Lycopus europaeus +, Lysimachia vulgaris +, Mentha longifolia 1, Myosotis palustris +, Myricaria germanica +, Petasites kablikianus 3, Phalaris arundinacea +, Phleum pratense +, Ranunculus flammula +, Rumex acetosa +, Rumex obtusifolius +, Salix fragilis +, Salix eleagnos +, Solanum dulcamara +, Tussilago farfara +, Urtica dioica +, Vicia cracca +',
      ),
    ]),
  ],
  indicators: {
    area: { inputs: { choice: 'stable', areaText: '<0,5 ha', note: '' }, value: '<0,5 ha; nie podlega zmianom lub zwiększa się', grade: 'FV' },
    share: { inputs: { value: 50, note: '' }, value: '50%', grade: 'FV' },
    shrubs: {
      inputs: {
        species: [
          { name: 'Salix fragilis', cover: 15 },
          { name: 'Salix eleagnos', cover: 65 },
          { name: 'Salix purpurea', cover: 15 },
          { name: 'Alnus incana', cover: 0.5 },
          { name: 'Myricaria germanica', cover: 3 },
        ],
        myricariaNearby: '',
        choice: '',
        note: 'Wierzba krucha Salix fragilis 15%, wierzba siwa Salix eleagnos 65%, wierzba purpurowa Salix purpurea 15%, olsza szara Alnus incana <1%, września pobrzeżna Myricaria germanica 3%',
      },
      value:
        'Wierzba krucha Salix fragilis 15%, wierzba siwa Salix eleagnos 65%, wierzba purpurowa Salix purpurea 15%, olsza szara Alnus incana <1%, września pobrzeżna Myricaria germanica 3%',
      grade: 'FV',
    },
    height: { inputs: { height: '1,5–2', max: '3–5', note: '' }, value: '1,5–2 m, max. 3–5 m', grade: 'FV' },
    cover: { inputs: { value: '40–90', note: '' }, value: 'śr. 40–90%', grade: 'FV' },
    structure: { inputs: { choice: 'patches', note: 'Kilka płatów lub niewielkie kępy' }, value: 'Kilka płatów lub niewielkie kępy', grade: 'U1' },
    trees: { inputs: { choice: 'none', species: [], note: 'Brak' }, value: 'Brak', grade: 'FV' },
    health: {
      inputs: { choice: 'good', note: 'Pojedyncze krzewy połamane, wywrócone – efekt powodzi, poza tym brak uszkodzeń' },
      value: 'Pojedyncze krzewy połamane, wywrócone – efekt powodzi, poza tym brak uszkodzeń',
      grade: 'FV',
    },
    regeneration: {
      inputs: { choice: 'common', note: 'Młode osobniki dość często, z odrostów i liczne siewki.' },
      value: 'Młode osobniki dość często, z odrostów i liczne siewki.',
      grade: 'FV',
    },
    expansive: {
      inputs: {
        species: [
          { name: 'Petasites kablikianus', cover: 5 },
          { name: 'Rubus caesius', cover: 5 },
        ],
        none: '',
        choice: 'fv',
        note: 'Lepiężnik różowy Petasites kablikianus 5%, jeżyna popielica Rubus caesius 5%',
      },
      value: 'Lepiężnik różowy Petasites kablikianus 5%, jeżyna popielica Rubus caesius 5%',
      grade: 'FV',
    },
    aliens: {
      inputs: {
        species: [{ name: 'Reynoutria japonica', cover: 0.5 }, { name: 'Heracleum sosnowskyi' }],
        abundance: '',
        count: undefined,
        none: '',
        note: 'Rdestowiec japoński Reynoutria japonica <1%. Obok: poj. barszcz Sosnowskiego Heracleum sosnowskyi',
      },
      value: 'Rdestowiec japoński Reynoutria japonica <1%. Obok: poj. barszcz Sosnowskiego Heracleum sosnowskyi',
      grade: 'U1',
    },
    complex: {
      inputs: { h3220: 'good', h3230: 'good', h3240: 'good', h91E0: 'good', note: '3220, 3230, 3240, 91E0 – wszystkie tworzą reprezentatywne płaty' },
      value: '3220, 3230, 3240, 91E0 – wszystkie tworzą reprezentatywne płaty',
      grade: 'FV',
    },
  },
  prospects: {
    value:
      'W części naturalnie ukształtowany płat zarośli na kamienisku, w dość zaawansowanym stadium sukcesyjnym – przejście w stronę łęgu. Na kamieńcach obok kształtują się nowe stadia – młode zarośla.',
    grade: 'FV',
  },
  impacts: [
    {
      code: 'J02.03.02',
      name: 'Kanalizowanie (prostowanie koryt rzecznych)',
      influence: '-',
      intensity: 'H',
      description:
        'Na krótkim odcinku, na części transektu i poniżej – kształtowanie spychaczem nowego koryta pod lewym brzegiem i sypanie „wałów powodziowych”. (Kod w karcie z 2010 r.: 830 Regulowanie koryt rzecznych, intensywność A.)',
    },
    {
      code: 'L08',
      name: 'Powódź (procesy naturalne)',
      influence: '+',
      intensity: 'H',
      description: 'Regularnie wysokie fale powodziowe. (Kod w karcie z 2010 r.: 941 Powódź, intensywność A.)',
    },
  ],
  threats: [
    {
      code: 'L08',
      name: 'Powódź (procesy naturalne)',
      description: 'Okresowe niszczenie przez wezbrania (w dłuższym okresie – zjawisko pozytywne, odnawia siedlisko).',
    },
    { code: 'I01', name: 'Obce gatunki inwazyjne', description: 'Pojawienie się gatunków inwazyjnych.' },
    { code: 'J02.03.02', name: 'Kanalizowanie (prostowanie koryt rzecznych)', description: 'Antropogeniczne – próby prostowania koryta.' },
    { code: 'E03', name: 'Odpady, ścieki', description: 'Antropogeniczne – wysypywanie śmieci.' },
    {
      code: 'K02',
      name: 'Ewolucja biocenotyczna, sukcesja',
      description: 'Naturalne zagrożenie to sukcesja fragmentów zarośli na wyżej położonej terasie w kierunku łęgu.',
    },
  ],
  other: {
    otherValues: 'Kompleks siedlisk nadrzecznych z 3220, 3230 i 91E0',
    conservation: 'Brak działań',
    proposals: 'Brak',
    shareFV: 70,
    shareU1: 30,
    shareU2: 0,
    notes:
      'Rok: 2010. Typ monitoringu: zintegrowany. Monitoring jest wymagany: tak – jedno z lepiej zachowanych stanowisk siedliska w Beskidach. Zagrożenia w karcie z przewodnika opisane tekstem, bez kodów – rozpisane na kody w zakładce zagrożeń. Udział gatunków drzewiastych w karcie liczony od 1,5 m wysokości.',
    photos: [],
  },
  overallComment: '',
}

export const examples3240: CardExample[] = [{ id: 'snietnica', label: 'Śnietnica', values: snietnica }]
