// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Łabuz 2012, rozdz. 1230, pkt 3 „Przykład wypełnionej
// karty obserwacji”): Kl1 Rozewie 1, obserwacje 25.05.2010 i 16.10.2011. Obserwatorzy zanonimizowani (Jan Kowalski).
// Rozbieżności z kartą z przewodnika:
//  • Struktura: w karcie FV (ocena eksperta mimo U2 dolnej części klifu i trzech U1). Formularz liczy wg ogólnej
//    reguły – wszystkie wskaźniki równorzędne, jedno U2 daje U2 – więc struktura i ocena ogólna wychodzą U2.
//  • Pokrycie stoku: w karcie „pomiędzy 30 a 80%”, U1 – wpisano 80% (U1).
//  • Szerokość plaży: karta jej nie ocenia (wskaźnik bez progów w tab. 2); 12 m wzięto z tab. 3 przewodnika -> U1.
//  • Stabilność ściany: karta podaje tylko FV bez liczb – przyjęto 40% powierzchni aktywnej (FV).
//  • Zjawiska geodynamiczne: „jedno duże osuwisko oraz liczne wysięki”, U1 – wpisano 1 osuwisko + 1 wysięk na 100 m.
// Współrzędne w karcie są urwane („18°19′…″”) – przepisane jak są.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology1230 } from './methodology'

const base = emptyCardValues(methodology1230)

export const rozewie1: CardValues = {
  ...base,
  site: {
    ...base.site,
    siteName: 'Kl1 Rozewie 1',
    guid: '',
    areaName: 'Kaszubskie Klify',
    chainage: '128',
    geology: 'mixed',
    cliffHeight: 30,
    baseType: 'platform',
    communities: 'Violo odoratae-Ulmetum, zarośla jaworowo-jarzębinowe – dojrzałe stadium lasu i zarośli łęgu wiązowo-jesionowego',
    description:
      'W górnej części powstało osuwisko na warstwie piaszczystej, punktowo z podbiałem. Dolna część stoku o niewielkim nachyleniu z licznymi jęzorami osuwiskowymi utrwalona przez drzewa – koluwium. Stok klifu na kontakcie z platformą abrazyjną (brak plaży, jedynie głazy), miejscami z podcięciami abrazyjnymi. W podszycie liczne gatunki, w tym przytulia czepna Galium aparine, kłobuczka pospolita Torilis japonica, bluszcz pospolity Hedera helix, w warstwie krzewów bez, głóg, jarzębina. Drzewa: zbiorowisko łęgu wiązowo-jesionowego z fiołkiem Violo odoratae-Ulmetum i zarośla jaworowo-jarzębinowe, w tym: jawor, klon, buk, leszczyna, czeremcha, dzika jabłoń, brzozy, bez czarny, jarzębina.',
    areaHa: 1.8,
    protectedAreas: 'PLH220072 Kaszubskie Klify',
    coordStart: 'E 18°19′…″ – N 54°50′…″',
    coordMiddle: 'E 18°19′…″ – N 54°50′…″',
    coordEnd: 'E 18°19′…″ – N 54°50′…″',
    transect: '88x204 m',
    altitude: '2–30',
    date: '2011-10-16',
    observer: 'Jan Kowalski',
  },
  releves: [],
  indicators: {
    area: { inputs: { choice: 'stable' }, value: 'Nie zmniejsza się (cofanie klifu przesuwa siedlisko, ale go nie ubywa)', grade: 'FV' },
    stability: { inputs: { activePct: 40, state: 'partly' }, value: 'Częściowo aktywny / okresowo ustabilizowany, aktywny na 40% powierzchni', grade: 'FV' },
    slope: { inputs: { value: 28 }, value: '28°. W górnej części do 70°, w dolnej 10–15° na koluwium.', grade: 'FV' },
    retreat: {
      inputs: { value: 0.5 },
      value: 'Do około 0,5 m/rok. Cofanie niewielkie, miejscami do 0,5 m. Klif chroniony przez głazy na platformie abrazyjnej, która tłumi falowanie. Wysięki powodują osiadanie i spływ podłoża w kierunku morza.',
      grade: 'FV',
    },
    geodynamics: {
      inputs: { landslides: 1, seeps: 1, lengthM: 100 },
      value:
        'Jedno duże osuwisko oraz liczne wysięki. Jedno osuwisko, spływ górnej krawędzi klifu, liczne pęknięcia podłoża, ponadto mnogie drobne wysięki w górnej części klifu. Dolna część – wielkie koluwium o wys. ok. 11 m n.p.m., utrwalone na wierzchowinie.',
      grade: 'U1',
    },
    lowerPart: {
      inputs: { height: 6, kind: 'clear' },
      value: 'Widoczne wyraźne podcięcia abrazyjne o wysokości 1 do 6 m. W kilku miejscach dolna część stabilna, porośnięta przez drzewa (buki).',
      grade: 'U2',
    },
    herbs: {
      inputs: {
        choice: 'all',
        species: [
          { name: 'Tussilago farfara' },
          { name: 'Galium aparine' },
          { name: 'Torilis japonica' },
          { name: 'Hedera helix' },
        ],
      },
      value: 'Wszystkie gatunki charakterystyczne, powyżej 25% pokrycia oraz inne typowe.',
      grade: 'FV',
    },
    shrubs: {
      inputs: { choice: 'all', cover: undefined },
      value:
        'Wszystkie gatunki charakterystyczne powyżej 15% pokrycia oraz inne typowe. Duża liczba krzewów w różnym wieku oraz drzew w warstwie krzewów, w tym: rokitnik, jarzębina, bez, dzika porzeczka, klon, jawor, wiąz, topola osika, buki.',
      grade: 'FV',
    },
    trees: {
      inputs: { choice: 'all', cover: undefined },
      value: 'Stok porośnięty przez łęg wiązowo-jesionowy z licznymi innymi gatunkami drzew. Najgęstsze pokrycie w dolnej części stoku na koluwium.',
      grade: 'FV',
    },
    regeneration: { inputs: { choice: 'many' }, value: 'Tak. Liczne krzewy: bzu, jarzębiny, klonu, rokitnika.', grade: 'FV' },
    speciesCount: {
      inputs: { count: 15 },
      value: 'Minimum 15 gatunków. Stwierdzono bardzo dużo gatunków roślin, w tym synantropijnych (pokrzywa, mniszek lekarski).',
      grade: 'FV',
    },
    vegCover: {
      inputs: { value: 80 },
      value: 'Pomiędzy 30 a 80%. W części dolnej 100%, na stoku do 80%, miejscami mniej niż 30%. Dolna część stoku nad platformą abrazyjną miejscami niepokryta przez rośliny.',
      grade: 'U1',
    },
    beachWidth: { inputs: { value: 12 }, value: '12 m (platforma abrazyjna z głazami, tab. 3 przewodnika)', grade: 'U1' },
    beachHeight: { inputs: { value: 2.8 }, value: '2,8 m n.p.m. Wysoko, dzięki głazom osłaniającym gliniaste podłoże przed rozmywaniem.', grade: 'FV' },
    surge: { inputs: { choice: 'middle' }, value: 'Część środkowa. Śmieci wyrzucone przez morze w środkowej części platformy.', grade: 'U1' },
  },
  prospects: {
    value: 'Stanowisko w pasie ochrony brzegu, w obszarze Natura 2000, z dala od zabudowy. Klif chroniony przez głazy na platformie abrazyjnej.',
    grade: 'FV',
  },
  impacts: [],
  threats: [],
  other: {
    ...base.other,
    profileAzimuth: '',
    profileBase: '',
    profileMeasurements: '',
    profileRanges: [],
    hydroMeteo: '',
    notes: 'Daty obserwacji: 25.05.2010, 16.10.2011. Data wypełnienia: 25.10.2011. Powierzchnia siedliska w stanie FV: 100%.',
  },
  overallComment:
    'W przewodniku struktura i ocena ogólna FV (ocena eksperta). Formularz liczy wszystkie wskaźniki jako równorzędne – podcięcia abrazyjne 1–6 m (U2) dają U2 struktury.',
}

export const examples1230: CardExample[] = [{ id: 'rozewie-1', label: 'Rozewie 1', values: rozewie1 }]
