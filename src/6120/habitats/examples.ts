// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Kujawa-Pawlaczyk 2010, rozdz. 6120, pkt 3 „Przykład
// wypełnionej karty obserwacji”): Kalinik, 6.08.2008. Ekspert zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („N 52°16′ …; E 23°11′ …”) – przepisane do minut;
//  • literówki w nazwach gatunków poprawione, żeby katalog je rozpoznał: Festuca psammofila → psammophila, Triforium →
//    Trifolium, Gallium → Galium, Euphorbia cyparisias → cyparissias, Hypochoeris → Hypochaeris, „Armeria elongata
//    subsp. maritima” → Armeria maritima subsp. elongata;
//  • gatunki charakterystyczne: karta wymienia 4 gatunki i daje FV; z listy tab. 1 są tylko 3 (zawciąg jest w pkt 4,
//    nie w tab. 1), a tab. 2 wymaga dla FV co najmniej 5 – formularz podpowiada U1, ocena eksperta zostaje;
//  • „Struktura przestrzenna płatów muraw” (kardynalny w tab. 2) – w karcie brak wiersza; ocena FV ze sprawozdania
//    z monitoringu 2006–2008 (Kalinik: wszystkie wskaźniki FV);
//  • „Gatunki dominujące” (wiersz karty, wskaźnik z metodyki 2006–2008, usunięty w 2010) – przeniesione do uwag;
//  • perspektywy ochrony – w karcie sama ocena FV; opis złożony z pól „Zagrożenia” i „Wykonywane działania” karty;
//  • działalność człowieka: stare kody 165 Usuwanie podszytu → B02.03 i 950 Ewolucja biocenotyczna → K02 (słownik
//    2011), intensywność A → H, stare kody w opisie; „Zagrożenia” (tekst) → K02 z oryginalną treścią.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology6120 } from './methodology'

const COORD = 'N 52°16′; E 23°11′'

type Row = [layer: 'B' | 'C' | 'D', name: string, abundance: string]
const releve = (o: { altitude: number; slope?: number; coverC: number; heightC: number; unit: string }, species: Row[]) => ({
  coords: COORD,
  area: 25,
  exposure: 'NE',
  coverB: 0,
  coverD: 0,
  heightB: undefined,
  heightD: undefined,
  slope: undefined,
  ...o,
  species: species.map(([layer, name, abundance]) => ({ layer, name, abundance })),
})

/** „Achillea millefolium 1, Agrostis vulgaris 2, …” → wiersze warstwy C (mchy z katalogu – D). */
const list = (spec: string, moss: string[] = []): Row[] =>
  spec.split(', ').map((s) => {
    const i = s.lastIndexOf(' ')
    const name = s.slice(0, i)
    return [moss.includes(name) ? 'D' : 'C', name, s.slice(i + 1)]
  })

const CHARACTERISTIC_NOTE =
  'Zawciąg pospolity Armeria elongata subsp. maritima 15%, strzęplica sina Koeleria glauca 10%, kostrzewa piaskowa Festuca psammophila 15%, rozchodnik sześciorzędowy Sedum sexangulare 1%'

export const kalinik: CardValues = {
  ...emptyCardValues(methodology6120),
  site: {
    siteName: 'Kalinik',
    guid: '',
    siteType: 'referencyjne',
    communities: 'Sileno otitis-Festucetum – murawy z lepnicą wąskopłatkową',
    description:
      'Kalinik położony jest na terenie dwóch gmin – Konstantynów i Janów Podlaski. Do głównych walorów projektowanego rezerwatu należą starorzecza Bugu z przyległymi szuwarami, łąkami wilgotnymi (Molinietalia caeruleae), murawami psammofilnymi (Koelerion glaucae) i fragmentami łęgów. Projektowany rezerwat jest położony w bezpośrednim sąsiedztwie Bugu, na łachach piaszczystych naniesionych przez rzekę. Od strony zachodniej murawy psammofilne są odgrodzone od łąk i pastwisk zarastającym starorzeczem. Murawy psammofilne w badanym stanowisku, położone na gruntach będących własnością Nadbużańskiego Parku Krajobrazowego, wykazują dobre parametry struktury i funkcji, podobnie jak te będące w posiadaniu rolników indywidualnych, na których prowadzony jest wypas. Część muraw wykształcona na gruntach porolnych nie jest wypasana i w takich płatach obserwuje się silny nalot i podrost drzew, głównie sosny i jałowca. Stanowiska te wskazano do monitoringu w kolejnych latach jako badawcze.',
    areaHa: 2,
    protectedAreas: 'Natura 2000 PLH140011 Ostoja Nadbużańska; projektowany rezerwat przyrody Kalinik; Park Krajobrazowy Podlaski Przełom Bugu',
    manager: 'Park Krajobrazowy Podlaski Przełom Bugu',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '10x200 m',
    altitude: '121–126',
    date: '2008-08-06',
    observer: 'Jan Kowalski',
    additionalExperts: '',
  },
  releves: [
    releve(
      { altitude: 109, slope: 15, coverC: 70, heightC: 40, unit: 'Corynephoro-Silenetum tataricae' },
      list(
        'Achillea millefolium 1, Agrostis vulgaris 2, Anthoxanthum odoratum +, Armeria maritima subsp. elongata 2, Briza media 1, Campanula patula +, Carex hirta +, Cerastium semidecandrum 1, Dianthus carthusianorum 1, Euphorbia cyparissias +, Euphrasia stricta 1, Festuca psammophila 2, Filipendula vulgaris 1, Galium verum 2, Hieracium pilosella 2, Koeleria glauca 1, Leucanthemum vulgare +, Lotus corniculatus +, Pimpinella saxifraga 1, Plantago lanceolata 1, Potentilla arenaria 1, Rumex acetosella 1, Sanguisorba minor +, Thymus serpyllum 3, Trifolium arvense +, Trifolium repens +',
      ),
    ),
    releve(
      { altitude: 121, coverC: 80, heightC: 30, unit: 'Sileno otitis-Festucetum' },
      list(
        'Achillea millefolium 2, Agrostis vulgaris 1, Anthoxanthum odoratum 1, Armeria maritima subsp. elongata 1, Brachythecium albicans 1, Briza media 1, Cerastium semidecandrum +, Dianthus carthusianorum +, Euphrasia stricta 1, Galium verum +, Hypochaeris radicata +, Hieracium pilosella 3, Koeleria glauca 1, Nardus stricta +, Plantago lanceolata 1, Poa angustifolia +, Potentilla arenaria 2, Prunella vulgaris 1, Rumex acetosa +, Rumex acetosella 1, Rumex thyrsiflorus +, Sedum sexangulare 1, Trifolium arvense 1, Trifolium campestre +, Trifolium pratense +',
        ['Brachythecium albicans'],
      ),
    ),
    releve(
      { altitude: 122, coverC: 90, heightC: 20, unit: 'Sileno otitis-Festucetum' },
      list(
        'Achillea millefolium 2, Agrostis vulgaris 2, Anthoxanthum odoratum 2, Armeria maritima subsp. elongata 2, Briza media +, Cuscuta epithymum +, Dianthus carthusianorum 1, Equisetum arvense r, Festuca psammophila 1, Filipendula vulgaris +, Galium verum +, Hieracium pilosella 3, Lotus corniculatus +, Pimpinella saxifraga +, Plantago lanceolata 1, Poa angustifolia +, Potentilla arenaria 2, Rumex acetosella +, Thymus serpyllum 2, Trifolium arvense 1, Trifolium campestre +, Trifolium pratense +, Trifolium repens +',
      ),
    ),
  ],
  indicators: {
    area: { inputs: { choice: 'stable', areaHa: 2, note: '' }, value: '2 ha', grade: 'FV' },
    species: {
      inputs: {
        species: [
          { name: 'Armeria maritima subsp. elongata', cover: 15 },
          { name: 'Koeleria glauca', cover: 10 },
          { name: 'Festuca psammophila', cover: 15 },
          { name: 'Sedum sexangulare', cover: 1 },
        ],
        count: undefined,
        none: '',
        note: CHARACTERISTIC_NOTE,
      },
      value: CHARACTERISTIC_NOTE,
      grade: 'FV',
    },
    aliens: { inputs: { species: [], count: undefined, total: undefined, none: 'yes', note: 'Brak' }, value: 'Brak', grade: 'FV' },
    expansive: { inputs: { species: [], count: undefined, occurrence: '', none: 'yes', note: 'Brak' }, value: 'Brak', grade: 'FV' },
    shrubs: { inputs: { value: 0, species: [], note: 'Brak, usunięto podrost drzew' }, value: 'Brak, usunięto podrost drzew', grade: 'FV' },
    structure: {
      inputs: { choice: 'mosaicGrass', note: 'Brak wiersza w karcie; FV wg sprawozdania z monitoringu 2006–2008' },
      value: 'Brak wiersza w karcie; FV wg sprawozdania z monitoringu 2006–2008',
      grade: 'FV',
    },
    ecotone: {
      inputs: { choice: 'none', note: 'Powierzchnia badawcza otoczona zbiorowiskami murawowymi zajmującymi wielohektarowe powierzchnie' },
      value: 'Powierzchnia badawcza otoczona zbiorowiskami murawowymi zajmującymi wielohektarowe powierzchnie',
      grade: 'FV',
    },
  },
  prospects: {
    value:
      'Przeprowadzone odkrzaczanie zahamowało sukcesję w kierunku zbiorowisk leśnych, ale tylko w części płatów; konieczne są dalsze zabiegi usuwania nalotu drzew i przywrócenie wypasu. (W karcie sama ocena FV – opis z pól „Zagrożenia” i „Wykonywane działania ochronne”.)',
    grade: 'FV',
  },
  impacts: [
    {
      code: 'B02.03',
      name: 'Usuwanie podszytu',
      influence: '+',
      intensity: 'H',
      description: 'Przeprowadzone usunięcie nalotu drzew (sosny zwyczajnej Pinus sylvestris) zahamowało sukcesję murawy w kierunku zbiorowisk leśnych. (Kod w karcie z 2008 r.: 165 Usuwanie podszytu, intensywność A.)',
    },
    {
      code: 'K02',
      name: 'Ewolucja biocenotyczna, sukcesja',
      influence: '-',
      intensity: 'H',
      description: 'Obserwowane zarastanie muraw głównie przez jałowiec. (Kod w karcie z 2008 r.: 950 Ewolucja biocenotyczna, intensywność A.)',
    },
  ],
  threats: [
    {
      code: 'K02',
      name: 'Ewolucja biocenotyczna, sukcesja',
      description:
        'Do głównych zagrożeń należy proces naturalnej sukcesji zbiorowisk murawowych, przejawiający się zarastaniem, głównie sosną. Przeprowadzone odkrzaczanie wprawdzie zahamowało proces sukcesji, ale tylko w części płatów; konieczne są dalsze zabiegi usuwania nalotu drzew; niezbędne jest także przywrócenie wypasu.',
    },
  ],
  other: {
    otherValues: '',
    conservation: 'Odkrzaczenie muraw napiaskowych zahamowało sukcesję w kierunku zbiorowisk leśnych',
    proposals: 'Przywrócenie wypasu',
    shareFV: 80,
    shareU1: 20,
    shareU2: 0,
    notes:
      'Rok: 2008. Typ monitoringu: zintegrowany. Nazwa obszaru: Ostoja Nadbużańska. Monitoring jest wymagany: tak, jako stanowisko referencyjne. Gatunki dominujące (wiersz karty z metodyki 2006–2008, usunięty w 2010 r.): pięciornik piaskowy Potentilla arenaria 15%, macierzanka piaskowa Thymus serpyllum 30% – FV. Karta nie ma wiersza „Struktura przestrzenna płatów muraw” – przyjęto FV ze sprawozdania z monitoringu 2006–2008. Udział U2 w karcie: „–”.',
    photos: [],
  },
  overallComment: '',
}

export const examples6120: CardExample[] = [{ id: 'kalinik', label: 'Kalinik', values: kalinik }]
