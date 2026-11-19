// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Buczek 2010, rozdz. 7210, pkt 3 „Przykład wypełnionej karty
// obserwacji”): Rezerwat Bagno Serebryskie 2 (Torfowiska Chełmskie), 2.08.2007. Koordynator zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku ucięte do minut („N 51°09’…; E 23°31’…”) – przepisane do minut;
//  • zespół do progów: Cladietum marisci (jak w karcie);
//  • zdjęcie fitosocjologiczne: w karcie jedno („podobnie wypełniamy dwie rubryki dla pozostałych zdjęć”) – tu jedno;
//    literówki „Caliergonella”, „Campylim”, „Scorpiddium”, „Preissia quadrula” poprawione; „Mentha sp.” jak w karcie;
//  • stopień uwodnienia: w karcie opis i dwa pomiary (12.05: 7 cm nad torfem, 2.08: 10 cm pod) – letni pomiar
//    w punkcie 1, ocena U1 jak w karcie (wynika też z progów);
//  • zniszczenia mechaniczne: „nie więcej niż 5%” → 5%, naturalne;
//  • oddziaływania: stare kody (2007) → słownik 2011: 110 → A07, 180 → J01.01, 390 → C01.07, 501 → D01.01,
//    622 → G01.02, 503 → D01.04, 511 → D02.01.01, 702 → H04, 890 → J02.15, 976 → K04.05; intensywność A/B/C → H/M/L;
//    wpływ przy 180, 390, 501 i 890 w tekście przewodnika nieczytelny – przyjęto „–” (opisy mówią o szkodach);
//  • „Zagrożenia” z raportu rocznego (nasyp kolejowy, podpalenia) → J02.15 i J01.01; rok i typ monitoringu – w uwagach.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology7210 } from './methodology'

const COORD = 'N 51°09′; E 23°31′'

/** „Carex elata +, Cladium mariscus 3, …” → wiersze jednej warstwy. */
const list = (layer: 'C' | 'D', spec: string) =>
  spec.split(', ').map((s) => {
    const i = s.lastIndexOf(' ')
    return { layer, name: s.slice(0, i), abundance: s.slice(i + 1) }
  })

const EXPANSIVE_NOTE =
  'Trzęślica modra Molinia caerulea 5%. Obecność innych gatunków łąkowych: sadziec konopiasty Eupatorium cannabinum, wiązówka błotna Filipendula ulmaria.'
const HYDRATION_NOTE = 'Niewłaściwe przez część sezonu wegetacyjnego – 10 cm poniżej poziomu torfu na początku sierpnia.'
const DAMAGE_NOTE = 'Niewielkie naturalnego pochodzenia (ścieżka zwierząt kopytnych), nie więcej niż 5%.'
const WOODY_NOTE = 'Pojedynczo kruszyna Frangula alnus w warstwie zielnej.'

const empty = emptyCardValues(methodology7210)

export const serebryskie: CardValues = {
  ...empty,
  site: {
    ...empty.site,
    siteName: 'Rezerwat Bagno Serebryskie 2',
    guid: '',
    siteType: 'Badawczy',
    areaName: 'Torfowiska Chełmskie',
    communities: 'Zespół kłoci wiechowatej Cladietum marisci',
    association: 'cladietum',
    description:
      'Fragment otwartego torfowiska położonego w bezodpływowej niecce kredowej o pow. ok. 244 ha otoczonej niewielkimi (do 182,6 m n.p.m.) wzniesieniami. Do torfowiska przylegają łąki, zarośla wierzbowe i na niewielkim obszarze pola uprawne. Małe, wyludniające się przysiółki w bliskim sąsiedztwie niecki torfowej: Gotówka Niemiecka (w części północno-wschodniej) i Nowiny (w części zachodniej). Torfowisko oddalone ok. 2 km na północny zachód od miasta Chełm i wyrobiska kredy przy cementowni Chełm.',
    areaHa:
      'Powierzchnia szuwaru kłoci wiechowatej Cladietum marisci w części torfowiska, na którym zlokalizowano transekt, wynosi ok. 160 ha (szacowanie na podstawie zdjęć lotniczych i badań terenowych). Powierzchnia stabilna od lat pięćdziesiątych (dane porównawcze na podstawie zdjęć lotniczych z lat 1952, 1983 i 1998 oraz prowadzonych od 1994 roku badań monitoringowych). Stan szuwarów kłoci wiechowatej na stanowisku pogorszył się w stosunku do lat osiemdziesiątych – 244 ha.',
    protectedAreas:
      'Obszar Natura 2000 Torfowiska Chełmskie, Obszar Natura 2000 Chełmskie Torfowiska Węglanowe, Rezerwat przyrody Bagno Serebryskie, Chełmski Park Krajobrazowy',
    manager: 'Parki Krajobrazowe Polesia',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '10x200 m',
    altitude: '177',
    date: '2007-08-02',
    observer: 'Jan Kowalski',
    additionalExperts: '',
  },
  releves: [
    {
      ...empty.releves[0],
      coords: COORD,
      altitude: 177,
      area: 100,
      slope: undefined,
      exposure: '',
      coverA: undefined,
      coverB: undefined,
      coverC: 50,
      coverD: 20,
      unit: 'Cladietum marisci',
      species: [
        ...list(
          'C',
          'Carex elata +, Carex buxbaumii +, Cirsium palustre +, Cladium mariscus 3, Equisetum palustre +, Eupatorium cannabinum +, Frangula alnus +, Galium uliginosum +, Lathyrus palustris +, Lysimachia vulgaris +, Lythrum salicaria +, Menyanthes trifoliata +, Mentha sp. +, Molinia caerulea 1, Peucedanum palustre +, Phragmites australis 1',
        ),
        ...list('D', 'Calliergonella cuspidata 2, Campylium stellatum 1, Fissidens adianthoides +, Preissia quadrata +, Scorpidium scorpioides +'),
      ],
      waterLevel: '0,07 m powyżej poziomu torfu (12.05.2007); 0,1 m poniżej poziomu torfu (2.08.2007)',
      remarks: 'W karcie z przewodnika jedno zdjęcie; nachylenia, ekspozycji i wysokości warstw nie podano.',
    },
  ],
  indicators: {
    area: {
      inputs: { choice: 'unknown', areaText: 'ok. 160 ha', note: '' },
      value: 'ok. 160 ha',
      grade: 'XX',
    },
    share: {
      inputs: { share: 100, choice: '', note: '' },
      value: '100%',
      grade: 'FV',
    },
    characteristic: {
      inputs: { species: [{ name: 'Cladium mariscus', cover: 50 }], total: undefined, none: '', choice: '', note: '' },
      value: 'Cladium mariscus 50%',
      grade: 'FV',
    },
    dominant: {
      inputs: { species: [{ name: 'Cladium mariscus', cover: 50 }], choice: '', note: '' },
      value: 'Cladium mariscus 50%',
      grade: 'FV',
    },
    aliens: {
      inputs: { species: [], total: undefined, none: 'yes', note: '' },
      value: 'Nie stwierdzono',
      grade: 'FV',
    },
    expansive: {
      inputs: {
        species: [{ name: 'Molinia caerulea', cover: 5 }, { name: 'Eupatorium cannabinum' }, { name: 'Filipendula ulmaria' }],
        none: '',
        choice: '',
        note: EXPANSIVE_NOTE,
      },
      value: EXPANSIVE_NOTE,
      grade: 'FV',
    },
    synanthropic: {
      inputs: { species: [], total: undefined, none: 'yes', note: '' },
      value: 'Nie stwierdzono',
      grade: 'FV',
    },
    density: {
      inputs: { density: 50, choice: '', note: '' },
      value: '50%',
      grade: 'FV',
    },
    woody: {
      inputs: { species: [{ name: 'Frangula alnus', cover: 0.5 }], total: undefined, none: '', note: WOODY_NOTE },
      value: WOODY_NOTE,
      grade: 'FV',
    },
    hydration: {
      inputs: { level1: -10, level2: undefined, level3: undefined, level4: undefined, level5: undefined, choice: '', note: HYDRATION_NOTE },
      value: HYDRATION_NOTE,
      grade: 'U1',
    },
    pollution: {
      inputs: { choice: 'none', note: '' },
      value: 'Nie stwierdzono',
      grade: 'FV',
    },
    damage: {
      inputs: { damaged: 5, origin: 'natural', note: DAMAGE_NOTE },
      value: DAMAGE_NOTE,
      grade: 'FV',
    },
  },
  prospects: {
    value: 'Ochrona rezerwatowa, brak możliwości podniesienia poziomu wody.',
    grade: 'U1',
  },
  impacts: [
    {
      code: 'A07',
      name: 'Stosowanie biocydów, hormonów i chemikaliów',
      influence: '0',
      intensity: 'L',
      description: 'Herbicydy stosowane są do odchwaszczania torowiska kolejowego biegnącego po nasypie przecinającym rezerwat. (Kod w karcie z 2007 r.: 110 Stosowanie pestycydów, intensywność C.)',
    },
    {
      code: 'J01.01',
      name: 'Wypalanie',
      influence: '-',
      intensity: 'H',
      description: 'Średnio raz na dwa lata szuwar kłociowy jest podpalany. Ostatnie podpalenie miało miejsce w 2005 r. (Kod w karcie z 2007 r.: 180 Wypalanie, intensywność A.)',
    },
    {
      code: 'C01.07',
      name: 'Działalność górnicza i wydobywcza nie wymieniona powyżej',
      influence: '-',
      intensity: 'L',
      description:
        'Wyrobisko kredy przy cementowni Chełm. Część torfowiska leży w obrębie leja depresyjnego związanego z wyrobiskiem kredy przy cementowni w Chełmie. (Kod w karcie z 2007 r.: 390 Inna działalność górnicza lub wydobywcza, intensywność C.)',
    },
    {
      code: 'D01.01',
      name: 'Ścieżki, szlaki piesze, szlaki rowerowe',
      influence: '-',
      intensity: 'L',
      description: 'Mało intensywny ruch po ścieżce biegnącej po nasypie kolejowym przecinającym rezerwat. (Kod w karcie z 2007 r.: 501, intensywność C.)',
    },
    {
      code: 'G01.02',
      name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych',
      influence: '0',
      intensity: 'L',
      description: 'Turystyka piesza wzdłuż ścieżki dydaktycznej wytyczonej na nasypie kolejowym. (Kod w karcie z 2007 r.: 622 Turystyka piesza, intensywność C.)',
    },
    {
      code: 'D01.04',
      name: 'Linie kolejowe, TGV',
      influence: '0',
      intensity: 'L',
      description: 'Pojedyncze tory na nasypie kolejowym. (Kod w karcie z 2007 r.: 503 Drogi kolejowe, intensywność C.)',
    },
    {
      code: 'D02.01.01',
      name: 'Napowietrzne linie elektryczne i telefoniczne',
      influence: '0',
      intensity: 'L',
      description: 'Linia elektryczna biegnie po torfowisku równolegle do nasypu kolejowego. (Kod w karcie z 2007 r.: 511 Linie elektryczne, intensywność C.)',
    },
    {
      code: 'H04',
      name: 'Zanieczyszczenie powietrza, zanieczyszczenia transportowane drogą powietrzną',
      influence: '0',
      intensity: 'L',
      description:
        'Zanieczyszczenia pyłowe i gazowe z pobliskiej cementowni, znacznie ograniczone po założeniu urządzeń odpylających w latach dziewięćdziesiątych. (Kod w karcie z 2007 r.: 702 Zanieczyszczenie powietrza, intensywność C.)',
    },
    {
      code: 'J02.15',
      name: 'Inne zmiany warunków hydraulicznych spowodowane przez człowieka',
      influence: '-',
      intensity: 'M',
      description:
        'Nasyp kolejowy przegradza torfowisko i utrudnia odpływ wody z bardziej wilgotnej części wschodniej do zachodniej. (Kod w karcie z 2007 r.: 890 Inne spowodowane przez człowieka zmiany stosunków wodnych, intensywność B.)',
    },
    {
      code: 'K04.05',
      name: 'Szkody wyrządzane przez roślinożerców (w tym zwierzynę łowną)',
      influence: '0',
      intensity: 'L',
      description: 'Ścieżki wydeptywane w szuwarach kłociowych przez sarny i dziki. (Kod w karcie z 2007 r.: 976 Szkody wyrządzane przez zwierzynę łowną, intensywność C.)',
    },
  ],
  threats: [
    {
      code: 'J02.15',
      name: 'Inne zmiany warunków hydraulicznych spowodowane przez człowieka',
      description:
        'Nasyp kolejowy przegradza nieckę torfowiskową na dwie nierówne części i uniemożliwia swobodny spływ wody z wilgotniejszej części wschodniej (z funkcjonującymi najprawdopodobniej źródłami wód naporowych) do większej obszarowo części zachodniej. W roku prowadzenia monitoringu szczegółowego uwidoczniła się znacząco różnica pomiędzy zbyt uwilgotnioną częścią przed nasypem (strona wschodnia rezerwatu) a częścią zachodnią, gdzie wyznaczono transekt do monitoringu.',
    },
    {
      code: 'J01.01',
      name: 'Wypalanie',
      description:
        'Celowe podpalenia dokonywane w miesiącach jesiennych, zimowych lub wczesnowiosennych prowadzą do całkowitego zniszczenia części pędów kłoci wiechowatej Cladium mariscus ponad powierzchnią wody (lodu). Ostatnie podpalenie na stanowisku w 2005 roku. Od momentu rozpoczęcia obserwacji na tym terenie (1986 r.) odnotowano co najmniej 10 wypaleń szuwarów kłociowych w tej części torfowiska. W latach dziewięćdziesiątych stwierdzono tutaj negatywny wpływ pożarów na szuwar kłociowy. Pożary ułatwiały wkraczanie gatunków łąkowych, zwłaszcza trzęślicy modrej Molinia caerulea, przy niskim (poniżej poziomu torfu) stanie wody w miesiącach letnich. W roku bieżącym nie zauważono znaczącej ekspansji roślin łąkowych na tym terenie. Powierzchnia zajmowana przez trzęślicę modrą była procentowo mniejsza niż w latach dziewięćdziesiątych.',
    },
  ],
  other: {
    ...empty.other,
    otherValues: 'Miejsce lęgów wodniczki Acrocephalus paludicola, kropiatki Porzana porzana, błotniaka łąkowego Circus pygargus.',
    conservation: '',
    proposals: '',
    monitoringRequired: 'tak',
    justification: '',
    shareFV: undefined,
    shareU1: 100,
    shareU2: undefined,
    notes:
      'Stan siedliska poprawił się od czasu obserwacji w latach dziewięćdziesiątych. Zmniejszyła się znacząco ekspansja trzęślicy modrej Molinia caerulea. Obecność w warstwie zielnej hydrofitów świadczy o dobrym uwilgotnieniu siedliska przez większą część roku. Niemniej jednak żywotność kłoci wiechowatej Cladium mariscus w tej części torfowiska jest najgorsza. Przejawia się to znikomą liczbą pędów generatywnych, mniejszymi rozmiarami pędów wegetatywnych oraz mniejszym zwarciem szuwaru.\n\nRok: 2007. Typ monitoringu: szczegółowy. Dodatkowi koordynatorzy, uzasadnienie monitoringu, zabiegi ochronne i propozycje działań – w karcie puste. Współrzędne w przewodniku podane do minut (sekundy ucięte).',
    photos: [],
  },
  overallComment: '',
}

export const examples7210: CardExample[] = [{ id: 'bagno-serebryskie-2', label: 'Rezerwat Bagno Serebryskie 2', values: serebryskie }]
