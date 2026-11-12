// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Perzanowska 2010, rozdz. 91Q0, pkt 3 „Przykład wypełnionej
// karty obserwacji”): stanowisko Macelowa Góra (91Q0-1, Pieniny), 30.07.2008.
// Karta pochodzi z pierwszego cyklu monitoringu, więc ma wskaźniki spoza tab. 2 („Udział procentowy siedliska na
// transekcie”, „Gatunki dominujące”, „Gatunki nawapienne”, „Wiek drzewostanu”) – ich wartości przeniesiono do uwag,
// a dominanty do listy gatunków charakterystycznych (pokrycie sosny i trzcinnika pstrego).
// Zdjęcia fitosocjologiczne w przewodniku nie mają spisu gatunków – przepisano tylko nagłówki.
// Oceny przepisane z karty. Jedna odbiega od podpowiedzi formularza i formularz to pokazuje: naturalne odnowienie –
// ekspert dał FV, choć w odnowieniu jest świerk „miejscami dość licznie” (tab. 2: pojedynczy świerk to już U1).
// Wykonawca zanonimizowany (Jan Kowalski). Powierzchnia „łącznie 20 a” z karty = 0,2 ha.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology91Q0 } from './methodology'

const COORDS = 'N 49°24′; E 20°23′'

const releve = (o: { altitude: number; area: number; slope: number; exposure: string; coverC: number; coverD: number; heightB: number; heightC: number }) => ({
  coords: COORDS,
  altitude: o.altitude,
  area: o.area,
  slope: o.slope,
  exposure: o.exposure,
  coverA: undefined,
  coverB: 1,
  coverC: o.coverC,
  coverD: o.coverD,
  heightA: undefined,
  heightB: o.heightB,
  heightC: o.heightC,
  heightD: undefined,
  unit: 'zbiorowisko Pinus sylvestris-Calamagrostis varia',
  species: [],
})

export const macelowaGora: CardValues = {
  ...emptyCardValues(methodology91Q0),
  site: {
    siteName: 'Macelowa Góra',
    guid: '',
    subtype: '91Q0-1',
    communities: 'Zb. Pinus sylvestris-Calamagrostis varia, zb. Pinus sylvestris-Carex alba',
    description:
      'Siedlisko zajmuje południowe stoki Macelowej Góry, ponad szosą biegnącą wzdłuż Dunajca, a poniżej wapiennej ściany skalnej, położonej na SW stoku góry. Nachylenie od 35° do 45°, miejscami pionowe ścianki skalne przedzielające płat siedliska. Ponadto liczne wychodnie wapienne na stoku, płytka i bardzo płytka warstwa gleby, a miejscami nie do końca ustabilizowany piarg. Zarządzający terenem: Pieniński Park Narodowy.',
    areaHa: 0.2,
    protectedAreas: 'Natura 2000, Pieniński Park Narodowy',
    coordStart: COORDS,
    coordMiddle: COORDS,
    coordEnd: COORDS,
    transect:
      'Z uwagi na topografię terenu nie wyznaczano transektu. Zdjęcia były wykonywane na powierzchniach 5x5 m (25 m²), jeśli tylko pozwoliły na to warunki.',
    altitude: '470–550',
    date: '2008-07-30',
    observer: 'Jan Kowalski',
  },
  releves: [
    releve({ altitude: 581, area: 15, slope: 20, exposure: 'NW', coverC: 20, coverD: 25, heightB: 1, heightC: 15 }),
    releve({ altitude: 575, area: 15, slope: 30, exposure: 'W', coverC: 35, coverD: 40, heightB: 1.5, heightC: 15 }),
    releve({ altitude: 654, area: 25, slope: 20, exposure: 'E', coverC: 30, coverD: 35, heightB: 0.7, heightC: 20 }),
  ],
  indicators: {
    area: {
      inputs: { choice: 'stable' },
      value:
        'Siedlisko zajmuje całość dostępnego terenu o odpowiadających mu właściwościach abiotycznych. Nie obserwuje się zmian w powierzchni. Możliwa ekspansja na murawy kserotermiczne.',
      grade: 'FV',
    },
    characteristic: {
      inputs: {
        dominant: 'yes',
        species: [
          { name: 'Pinus sylvestris', cover: 70 },
          { name: 'Cornus sanguinea' },
          { name: 'Lonicera xylosteum' },
          { name: 'Berberis vulgaris' },
          { name: 'Frangula alnus' },
          { name: 'Juniperus communis' },
          { name: 'Viburnum opulus' },
          { name: 'Corylus avellana' },
          { name: 'Rosa spp.' },
          { name: 'Cotoneaster spp.' },
          { name: 'Carex alba' },
          { name: 'Calamagrostis varia', cover: 50 },
        ],
      },
      value:
        'Drzewostan: sosna zwyczajna Pinus sylvestris. Podszyt: dereń świdwa Cornus sanguinea, wiciokrzew suchodrzew Lonicera xylosteum, berberys zwyczajny Berberis vulgaris, kruszyna pospolita Frangula alnus, jałowiec pospolity Juniperus communis, kalina koralowa Viburnum opulus, leszczyna pospolita Corylus avellana, róża Rosa sp., irga Cotoneaster sp. Runo: turzyca biała Carex alba, trzcinnik pstry Calamagrostis varia – niepełne zwarcie ok. 80%, oraz szereg gatunków ciepłolubnych. Dominanty: warstwa A – sosna zwyczajna 70%, warstwa C – trzcinnik pstry 50%.',
      grade: 'FV',
    },
    invasive: { inputs: { species: [] }, value: 'Brak', grade: 'FV' },
    expansive: { inputs: { species: [] }, value: 'Brak', grade: 'FV' },
    structure: {
      inputs: { choice: 'diverse', dbh: 'do 20–30', crown: 80 },
      value: 'Drzewostan sosnowy – Pinus sylvestris, pierśnica do 20–30 cm, zwarcie koron ok. 80%.',
      grade: 'FV',
    },
    alienTrees: { inputs: { species: [] }, value: 'Brak gatunków obcych', grade: 'FV' },
    regeneration: {
      inputs: {
        species: [{ name: 'Picea abies' }, { name: 'Pinus sylvestris' }, { name: 'Fraxinus excelsior' }],
        pine: 'diverse',
        invaders: 'single',
      },
      value: 'Świerk (miejscami dość licznie), sosna, od strony zachodniej pojawia się w podszycie jesion, na razie pojedynczo.',
      grade: 'FV',
    },
    logging: { inputs: { choice: 'none' }, value: 'Brak pozyskania', grade: 'FV' },
    thermophilous: {
      inputs: {
        choice: 'full',
        species: [
          { name: 'Coronilla varia', cover: 1 },
          { name: 'Vincetoxicum hirundinaria', cover: 2 },
          { name: 'Carlina acaulis', cover: 1 },
          { name: 'Polygonatum odoratum', cover: 2 },
          { name: 'Epipactis atrorubens', cover: 5 },
          { name: 'Origanum vulgare', cover: 1 },
          { name: 'Teucrium montanum', cover: 5 },
          { name: 'Bupleurum falcatum', cover: 1 },
          { name: 'Euphorbia cyparissias', cover: 2 },
        ],
      },
      value:
        'Cieciorka pstra Coronilla varia 1%, ciemiężyk białokwiatowy Vincetoxicum hirundinaria 2%, dziewięćsił bezłodygowy Carlina acaulis 1%, kokoryczka wonna Polygonatum odoratum 2%, kruszczyk rdzawoczerwony Epipactis atrorubens 5%, lebiodka pospolita Origanum vulgare 1%, ożanka górska Teucrium montanum 5%, przewiercień sierpowaty Bupleurum falcatum 1%, wilczomlecz sosnka Euphorbia cyparissias 2%',
      grade: 'FV',
    },
    mechanical: {
      inputs: { choice: 'natural' },
      value: 'Brak – osypujący się rumosz może powodować niewielkie uszkodzenia, ale wobec skali tego zjawiska jest to nieistotne.',
      grade: 'FV',
    },
  },
  prospects: { value: 'Zbiorowisko stabilne ze względów siedliskowych, strefa ochrony ścisłej.', grade: 'FV' },
  impacts: [],
  threats: [{ code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)', description: 'Sukcesja naturalna.' }],
  other: {
    otherValues: '',
    conservation: 'Ochrona ścisła. Propozycje: aktualnie pozostawić bez zabiegów, jednakże prowadzić monitoring zmian.',
    notes:
      'Typ stanowiska: referencyjne. Monitoring wymagany: tak – jedno z nielicznych w Polsce miejsc występowania siedliska. Udział powierzchni siedliska o różnym stanie zachowania na stanowisku: FV 80%, U1 20%. Wskaźniki z karty 2008 spoza tab. 2: udział siedliska na transekcie 80% (FV); gatunki dominujące – warstwa A sosna zwyczajna 70%, warstwa C trzcinnik pstry 50% (FV); gatunki nawapienne – biedrzeniec mniejszy 5%, jastrzębiec siny 3%, trzcinnik pstry 50% i gatunki ciepłolubne (FV); wiek drzewostanu – średnio 110 lat, starodrzew wyodrębnia się pośród drzewostanu, bez badań struktury wieku (FV). Działalność człowieka: brak.',
    photos: [],
  },
  overallComment: 'Wszystkie parametry ocenione na FV.',
}

export const examples91Q0: CardExample[] = [{ id: 'macelowa-gora', label: 'Macelowa Góra', values: macelowaGora }]
