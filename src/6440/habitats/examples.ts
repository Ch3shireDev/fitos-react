// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Załuski 2012, rozdz. 6440, pkt 3 „Przykład wypełnionej karty
// obserwacji”): Brańszczyk 2 (dolina Bugu, Ostoja Nadbużańska), 14.08.2010. Eksperci lokalni zanonimizowani (Jan Kowalski,
// Anna Nowak).
//  • współrzędne w przewodniku są ucięte do minut („21°37′ …″E 52°37′ …″N”) – przepisane do minut;
//  • zarządzający: w karcie dwa wiersze (RDOŚ w Warszawie, właściciele prywatni) – połączone średnikiem;
//  • pokrycia „<5%” (karta podaje je „w dziesiątkach procentów”) wpisane jako 1%; „5%”, „10%”, „15%” – wprost;
//  • ekspansja krzewów: karta wymienia trzy gatunki „<5%” w warstwie c bez sumy – gatunki bez pokrycia, łącznie 1%
//    (pojedyncze krzewy w runi, ocena eksperta U1);
//  • gatunki ekspansywne: karta wpisuje tu też szczaw omszony (gatunek obcy) – zostaje na liście, formularz go pomija;
//  • zdjęcia: wszystko w warstwie C; „Phleum pretense” i „Trifolium pretense” poprawione na pratense; wysokość
//    warstwy D „5 cm” (karta: „c 40 cm, 5 cm”);
//  • oddziaływania: stare kody (2010) → słownik 2011: 102 → A03, 140 → A04, 930 → K01.04, 950 → K02, 954 → I01;
//    intensywność B → M, C → L; stary kod w opisie;
//  • „Zagrożenia” w karcie to tekst bez kodów – rozpisane na A04.01, A03.03 i K02.01;
//  • rok i typ monitoringu – w uwagach.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology6440 } from './methodology'

const COORD = '21°37′ E – 52°37′ N'

/** „Achillea millefolium +, Allium angulosum 1, …” → wiersze warstwy C. */
const list = (spec: string) =>
  spec.split(', ').map((s) => {
    const i = s.lastIndexOf(' ')
    return { layer: 'C' as const, name: s.slice(0, i), abundance: s.slice(i + 1) }
  })

const releve = (o: { slope: number; exposure: string; coverD: number; heightC: number; heightD?: number; unit: string }, spec: string) => ({
  coords: COORD,
  altitude: 89,
  area: 25,
  slope: o.slope,
  exposure: o.exposure,
  coverA: undefined,
  coverB: 0,
  coverC: 100,
  coverD: o.coverD,
  heightA: undefined,
  heightB: undefined,
  heightC: o.heightC,
  heightD: o.heightD,
  unit: o.unit,
  species: list(spec),
  remarks: '',
})

const CHARACTERISTIC_NOTE =
  'Gatunki charakterystyczne: selernica żyłkowana Cnidium dubium (5%), czosnek kątowaty Allium angulosum (<5%), konitrut błotny Gratiola officinalis (<5%), sit czarny Juncus atratus (<5%). Gatunki wyróżniające: groszek błotny Lathyrus palustris (<5%), turzyca wczesna Carex praecox (<5%), wiechlina wąskolistna Poa angustifolia (<5%).'
const DOMINANT_NOTE =
  'Przytulia północna Galium boreale (15%), wyczyniec łąkowy Alopecurus pratensis (15%), babka lancetowata Plantago lanceolata (10%), chaber łąkowy Centaurea jacea (10%), jaskier ostry Ranunculus acris (10%), jastrzębiec baldaszkowaty Hieracium umbellatum (10%), brodawnik jesienny Leontodon autumnalis (5%), krwawnica pospolita Lythrum salicaria (5%), selernica żyłkowana Cnidium dubium (5%), turzyca zaostrzona Carex gracilis (5%), wiązówka bulwkowa Filipendula vulgaris (5%).'
const VALUABLE_NOTE =
  'Selernica żyłkowana Cnidium dubium (5%), czosnek kątowaty Allium angulosum (<5%), groszek błotny Lathyrus palustris (<5%), komonica wąskolistna Lotus tenuis (<5%), konitrut błotny Gratiola officinalis (<5%), rutewka wąskolistna Thalictrum lucidum (<5%), sit czarny Juncus atratus (<5%), turzyca wczesna Carex praecox (<5%), wilczomlecz błyszczący Euphorbia lucida (<5%).'
const ALIENS_NOTE = 'Szczaw omszony Rumex confertus (<5%), uczep amerykański Bidens frondosa (<5%).'
const EXPANSIVE_NOTE =
  'Wyczyniec łąkowy Alopecurus pratensis (15%), krwawnik wierzbolistny Achillea salicifolia (<5%), przetacznik długolistny Veronica longifolia (<5%), szczaw omszony Rumex confertus (<5%), wiązówka błotna Filipendula ulmaria (<5%).'
const SHRUBS_NOTE = 'Warstwa c: szakłak pospolity Rhamnus cathartica (<5%), śliwa tarnina Prunus spinosa (<5%), wierzba szara Salix cinerea (<5%).'

const sp = (...rows: [string, number?][]) => rows.map(([name, cover]) => (cover === undefined ? { name } : { name, cover }))

export const branszczyk: CardValues = {
  ...emptyCardValues(methodology6440),
  site: {
    siteName: 'Brańszczyk 2',
    guid: '',
    siteType: 'Referencyjne',
    areaName: 'Ostoja Nadbużańska',
    communities: 'Violo-Cnidietum dubii',
    description:
      'Kompleks łąk w szerokim odcinku doliny Bugu. Gleby aluwialne, rzeźba dna doliny zróżnicowana. Miejscami starorzecza, kompleksy szuwarów i wilgotne zarośla. Użytkowanie zróżnicowane – łąki corocznie koszone lub nieużytkowane, wypas tylko na obrzeżach kompleksu łąk. W miejscach płaskich i wyniesionych łąki ze zw. Molinion (Galietum borealis), a w obniżonych – roślinność turzycowiskowa (Caricetum gracilis, Phalaridetum arundinaceae). Na łąkach nieużytkowanych występują ziołorośla (Scutellario-Veronicetum longifoliae, zb. Achillea salicifolia). Łąki selernicowe w układzie pasowym, zwykle na granicy wyniesień i obniżeń, niekiedy w płaskich obniżeniach.',
    areaHa: '5',
    protectedAreas: 'Ostoja Nadbużańska PLH140011',
    manager: 'Regionalna Dyrekcja Ochrony Środowiska w Warszawie; właściciele prywatni',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '100x20 m = 2000 m²',
    altitude: '89',
    date: '2010-08-14',
    observer: 'Jan Kowalski',
    additionalExperts: 'Anna Nowak',
  },
  releves: [
    releve(
      { slope: 0, exposure: '-', coverD: 2, heightC: 40, heightD: 5, unit: 'Violo-Cnidietum dubii, postać przejściowa, nawiązująca silnie w kierunku Galietum borealis' },
      'Achillea millefolium +, Agrostis stolonifera +, Allium angulosum 1, Alopecurus pratensis 1, Armeria maritima +, Cardamine pratensis +, Carex flacca 3, Carex praecox 1, Centaurea jacea +, Cnidium dubium 2, Deschampsia caespitosa 1, Festuca rubra +, Filipendula ulmaria 1, Filipendula vulgaris 3, Fragaria viridis +, Galium boreale 2, Glechoma hederacea +, Lathyrus pratensis 1, Leontodon autumnalis 2, Lotus tenuis +, Lotus uliginosus 1, Medicago lupulina +, Phleum pratense +, Plantago lanceolata 2, Poa angustifolia 1, Potentilla erecta +, Ranunculus acris 2, Ranunculus repens 3, Rumex acetosa 2, Rumex confertus 2, Sedum sexangulare +, Thalictrum lucidum 1, Trifolium repens 2, Veronica longifolia 1, Vicia cracca +, Viola canina +',
    ),
    releve(
      { slope: 5, exposure: 'N', coverD: 2, heightC: 60, heightD: 5, unit: 'Violo-Cnidietum dubii' },
      'Achillea salicifolia +, Allium angulosum +, Alopecurus pratensis 3, Cardamine pratensis 1, Carex praecox 1, Carex riparia +, Cnidium dubium 1, Deschampsia caespitosa 2, Equisetum palustre 1, Filipendula ulmaria 2, Filipendula vulgaris +, Galium boreale 2, Gratiola officinalis 2, Lathyrus pratensis +, Leontodon hispidus 1, Medicago lupulina +, Phleum pratense +, Poa angustifolia +, Poa palustris +, Potentilla erecta +, Ranunculus repens 1, Rumex acetosa 1, Stellaria palustris +, Trifolium pratense +, Veronica longifolia 2, Vicia cracca +',
    ),
    releve(
      { slope: 5, exposure: 'S', coverD: 0, heightC: 30, unit: 'Violo-Cnidietum dubii' },
      'Agrostis capillaris 1, Agrostis gigantea 1, Allium angulosum 2, Alopecurus pratensis 2, Carex praecox 1, Centaurea jacea 2, Cnidium dubium 1, Deschampsia caespitosa 2, Festuca pratensis 1, Festuca rubra +, Filipendula vulgaris +, Galium boreale 1, Leontodon autumnalis 2, Leontodon hispidus 1, Linum catharticum +, Lotus tenuis 2, Plantago lanceolata 1, Poa angustifolia 1, Ranunculus acris 2, Ranunculus repens 1, Rumex acetosa 1, Stellaria graminea +, Trifolium pratense +, Trifolium repens 1, Veronica longifolia 1',
    ),
  ],
  indicators: {
    area: {
      inputs: { choice: 'stable', areaText: '5 ha', note: 'Powierzchnia nie uległa zmianom' },
      value: 'Powierzchnia nie uległa zmianom',
      grade: 'FV',
    },
    share: { inputs: { share: 30, note: '' }, value: '30%', grade: 'U1' },
    spatial: {
      inputs: { choice: 'none', note: 'Stopień fragmentacji mały' },
      value: 'Stopień fragmentacji mały',
      grade: 'FV',
    },
    characteristic: {
      inputs: {
        species: sp(['Cnidium dubium', 5], ['Allium angulosum', 1], ['Gratiola officinalis', 1], ['Juncus atratus', 1], ['Lathyrus palustris', 1], ['Carex praecox', 1], ['Poa angustifolia', 1]),
        count: undefined,
        choice: '',
        note: CHARACTERISTIC_NOTE,
      },
      value: CHARACTERISTIC_NOTE,
      grade: 'FV',
    },
    dominant: {
      inputs: {
        species: sp(
          ['Galium boreale', 15],
          ['Alopecurus pratensis', 15],
          ['Plantago lanceolata', 10],
          ['Centaurea jacea', 10],
          ['Ranunculus acris', 10],
          ['Hieracium umbellatum', 10],
          ['Leontodon autumnalis', 5],
          ['Lythrum salicaria', 5],
          ['Cnidium dubium', 5],
          ['Carex gracilis', 5],
          ['Filipendula vulgaris', 5],
        ),
        choice: '',
        note: DOMINANT_NOTE,
      },
      value: DOMINANT_NOTE,
      grade: 'FV',
    },
    valuable: {
      inputs: {
        species: sp(
          ['Cnidium dubium', 5],
          ['Allium angulosum', 1],
          ['Lathyrus palustris', 1],
          ['Lotus tenuis', 1],
          ['Gratiola officinalis', 1],
          ['Thalictrum lucidum', 1],
          ['Juncus atratus', 1],
          ['Carex praecox', 1],
          ['Euphorbia lucida', 1],
        ),
        none: '',
        choice: '',
        note: VALUABLE_NOTE,
      },
      value: VALUABLE_NOTE,
      grade: 'FV',
    },
    aliens: {
      inputs: { species: sp(['Rumex confertus', 1], ['Bidens frondosa', 1]), total: undefined, none: '', note: ALIENS_NOTE },
      value: ALIENS_NOTE,
      grade: 'U1',
    },
    expansive: {
      inputs: {
        species: sp(['Alopecurus pratensis', 15], ['Achillea salicifolia', 1], ['Veronica longifolia', 1], ['Rumex confertus', 1], ['Filipendula ulmaria', 1]),
        total: undefined,
        none: '',
        choice: '',
        note: EXPANSIVE_NOTE,
      },
      value: EXPANSIVE_NOTE,
      grade: 'U1',
    },
    shrubs: {
      inputs: { species: sp(['Rhamnus cathartica'], ['Prunus spinosa'], ['Salix cinerea']), total: 1, layer: 'c', none: '', note: SHRUBS_NOTE },
      value: SHRUBS_NOTE,
      grade: 'U1',
    },
    typical: { inputs: { share: 50, note: '' }, value: '50%', grade: 'FV' },
    litter: { inputs: { min: 0, max: 2, mean: 0.2, note: '0-2 cm, śr. 0,2 cm' }, value: '0-2 cm, śr. 0,2 cm', grade: 'FV' },
  },
  prospects: {
    value: 'Łąki selernicowe dobrze zachowane, o znacznym areale; część łąk corocznie koszona, wypas tylko na obrzeżach kompleksu.',
    grade: 'FV',
  },
  impacts: [
    { code: 'A03', name: 'Koszenie / ścinanie trawy', influence: '+', intensity: 'L', description: 'Późne koszenie. (Kod w karcie z 2010 r.: 102 Koszenie/ścinanie, intensywność C.)' },
    { code: 'A04', name: 'Wypas', influence: '-', intensity: 'L', description: 'Wypas w niektórych latach. (Kod w karcie z 2010 r.: 140 Wypas, intensywność C.)' },
    { code: 'K01.04', name: 'Zatopienie', influence: '+', intensity: 'M', description: 'Okresowe podtapianie łąk wiosną. (Kod w karcie z 2010 r.: 930 Zatopienie, intensywność B.)' },
    {
      code: 'K02',
      name: 'Ewolucja biocenotyczna, sukcesja',
      influence: '-',
      intensity: 'L',
      description: 'Brak koszenia i stopniowy rozwój ziołorośli. (Kod w karcie z 2010 r.: 950 Ewolucja biocenotyczna, intensywność C.)',
    },
    {
      code: 'I01',
      name: 'Obce gatunki inwazyjne',
      influence: '-',
      intensity: 'L',
      description: 'Szczaw omszony Rumex confertus, sporadycznie uczep amerykański Bidens frondosa. (Kod w karcie z 2010 r.: 954 Inwazja gatunku, intensywność C.)',
    },
  ],
  threats: [
    { code: 'A04.01', name: 'Wypas intensywny', description: 'Intensyfikacja wypasu.' },
    { code: 'A03.03', name: 'Zaniechanie / brak koszenia', description: 'Brak koszenia.' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)', description: 'Rozwój ziołorośli.' },
  ],
  other: {
    otherValues: 'W dolinie Bugu cenne gatunki zwierząt, szczególnie ryb i ptaków. Na dużym areale siedlisko przyrodnicze 6410 – zmiennowilgotne łąki trzęślicowe (zw. Molinion).',
    conservation: 'Brak',
    proposals: 'Brak',
    monitoringRequired: 'tak',
    justification: 'Łąki selernicowe są tu dobrze zachowane i mają znaczny areał.',
    shareFV: 100,
    shareU1: 0,
    shareU2: 0,
    notes:
      'Wskazane prowadzenie monitoringu w okresie czerwiec–sierpień.\nRok: 2010. Typ monitoringu: zintegrowany. Współrzędne w przewodniku podane do minut (sekundy ucięte). Perspektywy ochrony w karcie bez opisu (tylko ocena FV) – opis z uzasadnienia i opisu stanowiska. Zagrożenia w karcie opisane tekstem, bez kodów – rozpisane na kody w zakładce zagrożeń.',
    photos: [],
  },
  overallComment: '',
}

export const examples6440: CardExample[] = [{ id: 'branszczyk', label: 'Brańszczyk 2', values: branszczyk }]
