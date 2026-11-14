// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (rozdz. 3140, pkt 3 „Przykład karty obserwacji”):
// Jezioro Budzisławskie (Anastazewo), stanowisko 1, 24.07.2013. Wykonawcy zanonimizowani (Jan Kowalski).
// • Współrzędne są w przewodniku celowo ucięte („50º 32’…’’N 20º 30’…’’E”) – przepisane jak są.
// • Powierzchnia: karta nie podaje tendencji („Brak możliwości określenia tendencji zmian poziomów wody”), ekspert dał U1 –
//   trend „nie da się określić”, ocena eksperta.
// • Struktura roślinności: pierwsze badanie jeziora głębokiego – ocena ekspercka FV z opisu układu zbiorowisk.
// • Odczyn i przewodność: brak wyników z poprzednich badań. pH 8,45 mieści się w zakresie 7,0–8,5 z tab. 1 → FV;
//   przewodność bez porównania nie ma podpowiedzi – FV eksperta jak w karcie.
// • Ocena ogólna: karta (2013, metodyka sprzed erraty) ma FV przy powierzchni U1 („dwa FV i jeden U1”); po errata
//   „najgorszy decyduje” – i w formularzu – wychodzi U1. To jedyna rozbieżność z oryginałem.
// • Intensywność oddziaływań A/B przepisana jako H/M; wpływ „–” (pogrubiony minus) jak „-”.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology3140 } from './methodology'

const CHAROPHYTES = [
  'Nitella opaca',
  'Nitella flexilis',
  'Nitellopsis obtusa',
  'Chara tomentosa',
  'Chara rudis',
  'Chara aspera',
  'Chara contraria',
  'Chara polyacantha',
  'Chara virgata',
  'Chara globularis',
  'Chara filiformis',
]

const PHYTO =
  'Fitoplankton: brak widocznego zakwitu; złotowiciowce: Dinobryon divergens, D. cylindricum, D. sociale, Uroglena americana, Chrysococcus rufescens; zielenice: Coelastrum astroideum, Cosmarium margaritatum, C. regnellii, C. abreviatum, Eutetramorus fottii, Scenedesmus arcuatus var. platydiscus; sinice: Anabaena flos-aquae, Chroococcus limneticus, Ch. turgidus, Planktolyngbya limnetica, Cyanodictyon reticulatum; okrzemki: Fragilaria ulna var. angustissima, F. crotonensis, Epithemia zebra, Amphipleura pellucida, Gomphonema truncatum, Navicula radiosa; kryptofity: Cryptomonas erosa; bruzdnice: Ceratium hirundinella'

const ZOO =
  'Wyraźna dominacja wrotków nad skorupiakami. Obecne pojedyncze egzemplarze małych wioślarek, głównie z rodzaju Bosmina, Chydorus i Ceriodaphnia. Obecna Keratella cochlearis f. tecta (około 10% populacji Keratella cochlearis) w niewysokich liczebnościach.'

const COORD = (s: string) => `${s}: 50º 32’…’’N 20º 30’…’’E`

export const budzislawskie1: CardValues = {
  ...emptyCardValues(methodology3140),
  site: {
    siteName: 'Jezioro Budzisławskie (Anastazewo) stanowisko 1',
    guid: '',
    waterBody: 'Jezioro Budzisławskie',
    lakeType: 'deep',
    lakeMaxDepth: 35.2,
    communities:
      'Zbiorowiska z klasy Charetea fragilis: Nitelletum flexilis, Nitelletum opacae, Nitello-Vaucherietum dichotomae, Nitellopsidetum obtusae, Charetum tomentosae, Charetum contrariae, Charetum filiformis, Charetum rudis, Charetum asperae, Charetum fragilis, Charetum delicatulae. Inne zbiorowiska: Potametum pectinati, Najadetum marinae, Myriophylletum spicati',
    description:
      'Głębokie (głębokość maks. 35,2 m) jezioro rynnowe, zdominowane przez podwodne łąki ramienicowe (gmina Kleczew, powiat koniński, województwo wielkopolskie). Zbiornik wydłużony na osi północny wschód-południowy zachód, z niewielką wyspą i rozległym podwodnym garbem na głębokości ok. 12 m. Linia brzegowa jeziora o małym zróżnicowaniu i dostępności, o charakterze naturalnym. Strefy szuwarowe wąskie, strome stoki misy jeziornej. Jezioro zasilane (przy wysokich stanach wód) przez Dopływ spod Nieborzyna. Powierzchnia lustra wody (na podstawie bieżącej inwentaryzacji 2013) wynosi 153,45 ha. Zlewnia bezpośrednia jeziora rolnicza, dominują ekstensywne uprawy (i ugory), częściowo kwaśne dąbrowy i lasy sosnowe. Wzdłuż prawie całej linii brzegowej rozmieszczona zabudowa stała i rekreacyjna (główne skupiska zabudowy w miejscowościach Stare Tręby, Anastazewo i Adamowo). Jezioro intensywnie użytkowane rekreacyjnie w sezonie letnim.',
    areaHa: 55,
    protectedAreas: 'Pojezierze Gnieźnieńskie PLH300026\nPowidzki Park Krajobrazowy\nObszar Chronionego Krajobrazu „Powidzko-Bieniszewski”',
    manager: 'Jezioro znajduje się na terenach stanowiących własność skarbu państwa, użytkownik rybacki: prywatny dzierżawca.',
    coordStart: COORD('Początek'),
    coordMiddle: COORD('Środek'),
    coordEnd: COORD('Koniec'),
    transect: 'Powierzchnia prostokątna o wymiarach 135 m × 16 m',
    altitude: '99',
    date: '2013-07-24',
    observer: 'Jan Kowalski',
  },
  releves: [],
  indicators: {
    area: {
      inputs: { trend: 'unknown', areaHa: undefined, note: 'Powierzchnia ulega bardzo zmianom. Brak możliwości określenia tendencji zmian poziomów wody.' },
      value: 'Powierzchnia ulega bardzo zmianom. Brak możliwości określenia tendencji zmian poziomów wody.',
      grade: 'U1',
    },
    charaStructure: {
      inputs: {
        trend: 'first',
        cover: undefined,
        note: 'Jezioro o typowym pasowym układzie zbiorowisk ramienic, z bardzo głębokim zasięgiem litoralu 15,5 m. Ramienice zajmują poniżej 50% dna jeziora.',
      },
      value:
        'Jezioro o typowym pasowym układzie zbiorowisk ramienic, z bardzo głębokim zasięgiem litoralu 15,5 m. Ramienice zajmują poniżej 50% dna jeziora.',
      grade: 'FV',
    },
    charophytes: {
      inputs: { species: CHAROPHYTES.map((name) => ({ name })), count: undefined },
      value: `Łącznie stwierdzono 11 gatunków ramienic. Lista gatunków: ${CHAROPHYTES.join(', ')}`,
      grade: 'FV',
    },
    degeneration: {
      inputs: { species: [{ name: 'Potamogeton pectinatus' }], expansive: 'absent', aliens: 'absent', note: 'bez wpływu na stan łąk ramienicowych' },
      value: 'Potamogeton pectinatus, bez wpływu na stan łąk ramienicowych',
      grade: 'FV',
    },
    maxDepth: { inputs: { value: 15.4 }, value: '15,4 m', grade: 'FV' },
    lightZone: { inputs: { value: 20.3, secchi: undefined }, value: '20,3 m', grade: 'FV' },
    ph: { inputs: { value: 8.45, previous: undefined }, value: 'pH 8,45', grade: 'FV' },
    conductivity: { inputs: { value: 535, previous: undefined }, value: '535 µS/cm', grade: 'FV' },
    phytoplankton: { inputs: { choice: 'greens', taxa: PHYTO }, value: PHYTO, grade: 'FV' },
    zooplankton: { inputs: { choice: 'diverse', taxa: ZOO }, value: ZOO, grade: 'FV' },
  },
  prospects: { value: 'Jedno z najlepiej zachowanych jezior ramienicowych w zachodniej Polsce.', grade: 'FV' },
  impacts: [
    { code: 'B02', name: 'Gospodarka leśna – ogólnie', influence: '0', intensity: 'M', description: 'W karcie: intensywność B, wpływ 0.' },
    { code: 'B02.02', name: 'Wycinka lasu', influence: '0', intensity: 'M', description: 'W karcie: intensywność B, wpływ 0.' },
    { code: 'C01.04', name: 'Kopalnie', influence: '-', intensity: 'H', description: 'W karcie: intensywność A, wpływ –. Lej depresyjny odkrywkowej kopalni węgla brunatnego.' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe', influence: '0', intensity: 'H', description: 'W karcie: intensywność A, wpływ 0.' },
    { code: 'E01', name: 'Tereny zurbanizowane, tereny zamieszkane', influence: '-', intensity: 'M', description: 'W karcie: intensywność B, wpływ –.' },
    { code: 'F02.03', name: 'Wędkarstwo', influence: '-', intensity: 'H', description: 'W karcie: intensywność A, wpływ –.' },
    { code: 'H01', name: 'Zanieczyszczenia wód', influence: '-', intensity: 'H', description: 'W karcie: intensywność A, wpływ – (silnie negatywny).' },
    { code: 'J02.01', name: 'Odwadnianie', influence: '-', intensity: 'M', description: 'W karcie: intensywność B, wpływ – (silnie negatywny).' },
  ],
  threats: [
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód – ogólnie', description: 'Wahania poziomu lustra wody związane prawdopodobnie z oddziaływaniem leja depresyjnego odkrywkowych kopalni węgla brunatnego.' },
    {
      code: 'H01.08',
      name: 'Rozproszone zanieczyszczenie wód powierzchniowych z powodu ścieków z gospodarstw domowych',
      description: 'Brak uregulowanej gospodarki wodno-ściekowej w zlewni jeziora (5 nieskanalizowanych wsi); odprowadzenia nieczystości rozwiązane połowicznie bez gwarancji szczelności instalacji.',
    },
    {
      code: 'G01',
      name: 'Sporty i różne formy czynnego wypoczynku, uprawiane w plenerze',
      description:
        'Użytkowanie rekreacyjne: dwa ośrodki wypoczynkowe, pola namiotowe oraz rozproszona lub zwarta indywidualna zabudowa letniskowa. W południowo-wschodniej części jeziora, w miejscowości Tręby Stare, gminne kąpielisko z drewnianym pomostem, tuż obok plaży ośrodek wypoczynkowy.',
    },
    { code: 'E01.03', name: 'Zabudowa rozproszona', description: 'Nieuregulowana zabudowa letniskowa; zabudowa stromych stoków jeziornych.' },
    {
      code: 'G05.01',
      name: 'Wydeptywanie, nadmierne użytkowanie',
      description: 'Silna fragmentacja stref szuwarowych; budowa licznych dojść wędkarskich, pomostów, dzikich obozowisk i zaśmiecanie. Usuwanie roślinności ramienicowej ze stref kąpielisk.',
    },
  ],
  other: {
    otherValues:
      'Jedno z najlepiej zachowanych jezior ramienicowych w zachodniej Polsce. Obecność rzadkich i bardzo rzadkich w skali kraju zbiorowisk roślinnych w obrębie lustra wody: np. Charetum rudis, Charetum filiformis, Nitelletum opacae i Najadetum marinae. Występowanie gatunków chronionych np.: Chara filiformis, Chara polyacantha, Nitella opaca i Utricularia australis. Jezioro o wysokich walorach krajobrazowych.',
    conservation:
      'Wykonywane działania ochronne: nie wykonywano działań ochronnych. Propozycje: Jezioro należy zabezpieczyć przed gwałtownymi zmianami poziomu wody. Wymagane jest szczegółowe rozpoznanie warunków hydrologicznych i zasilania jeziora oraz wpływu leja depresyjnego kopalni węgla brunatnego i np. ujęć wody, budowy zbiorników przeciwpożarowych i intensywności wykorzystania zasobów wód podziemnych (studnie). Ochrona siedliska przyrodniczego 3140 powinna polegać również na ograniczeniu w planie zagospodarowania przestrzennego możliwości zabudowywania najbliższych brzegów jeziora (szczególnie stromych brzegów). Wymagane jest również uregulowanie gospodarki wodno-ściekowej w zlewni jeziora. W gospodarce rybackiej wymagane jest utrzymanie sielawowego typu rybackiego i zmniejszenie liczebności ryb karpiowatych. Ze względu na unikatowe walory przyrodnicze i wzorcowy stan zachowania, jezior docelowo należy wyłączyć z użytkowania rybackiego.',
    notes:
      'Typ stanowiska: badawcze. Monitoring jest wymagany – uzasadnienie: zmiany poziomu wody. Inne obserwacje: brak. Uwagi metodyczne: brak. Wymiary transektu i pomiary PAR, pH, przewodności i planktonu wg przewodnika. Ocena ogólna w karcie z 2013 r.: FV (FV 100%) – reguła sprzed erraty „najgorszy decyduje”.',
    photos: [],
  },
  overallComment:
    'Struktura i perspektywy FV – jedno z najlepiej zachowanych jezior ramienicowych w zachodniej Polsce. Powierzchnia U1 przez silne wahania poziomu wody (lej depresyjny kopalni). Karta z 2013 r. ma ocenę ogólną FV (dwa FV i jeden U1 wg metodyki sprzed erraty); po errata „najgorszy decyduje” – U1.',
}

export const examples3140: CardExample[] = [{ id: 'budzislawskie-1', label: 'Budzisławskie 1', values: budzislawskie1 }]
