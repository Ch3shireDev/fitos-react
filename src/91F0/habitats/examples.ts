// Przykład z przewodnika metodycznego GIOŚ (rozdz. 91F0, „Przykład wypełnionej karty obserwacji”):
// stanowisko Bukowy Las Górki 2, 10.09.2009. Teksty „wartość lub opis” przepisane z karty, selekty ustawione
// zgodnie z ocenami z karty. Ekspert zanonimizowany (Jan Kowalski), jak w pozostałych przykładach.
// Skala Braun-Blanqueta w formularzu nie ma podziału 2a/2b, więc oba zapisano jako „2”.
// Stare kody oddziaływań z karty (166, 800) przełożone na B02.04 i J02.01; intensywność A → H, B → M.
import type { CardValues, ReleveSpeciesRow } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import { methodology91F0 } from './methodology'

type R = [ReleveSpeciesRow['layer'], string, ReleveSpeciesRow['abundance']]
const rows = (...r: R[]): ReleveSpeciesRow[] => r.map(([layer, name, abundance]) => ({ layer, name, abundance }))

const releve = (o: {
  coords: string
  altitude: number
  cover: [number?, number?, number?, number?]
  height: [number?, number?]
  species: ReleveSpeciesRow[]
}) => ({
  coords: o.coords,
  altitude: o.altitude,
  area: 100,
  slope: 0,
  exposure: 'brak',
  coverA: o.cover[0],
  coverB: o.cover[1],
  coverC: o.cover[2],
  coverD: o.cover[3],
  heightA: o.height[0],
  heightB: o.height[1],
  heightC: undefined,
  heightD: undefined,
  unit: 'Ficario-Ulmetum minoris',
  species: o.species,
})

export const bukowyLasGorki2: CardValues = {
  ...emptyCardValues(methodology91F0),
  site: {
    siteName: 'Bukowy Las Górki 2',
    guid: '',
    form: 'offValley',
    communities: 'Ficario-Ulmetum minoris',
    description:
      'Las łęgowy wiązowo-jesionowy położony w kompleksie żyznych lasów liściastych – grądów subatlantyckich, żyznych buczyn i lasów łęgowych jesionowo-wiązowych, w obszarze nadmorskim, na południe od jeziora Jamno.',
    areaHa: 3,
    protectedAreas: 'Bukowy Las Górki PLH320062',
    manager: 'Nadleśnictwo Karnieszewice',
    coordStart: '54° 13\' N 16° 09\' E',
    coordMiddle: '54° 13\' N 16° 08\' E',
    coordEnd: '54° 13\' N 16° 08\' E',
    transect: '200x10 m',
    altitude: '35',
    date: '2009-09-10',
    observer: 'Jan Kowalski',
  },
  releves: [
    releve({
      coords: '54° 13\' N 16° 09\' E',
      altitude: 34,
      cover: [30, 40, 95],
      height: [28, 5],
      species: rows(
        ['A', 'Fraxinus excelsior', '3'],
        ['B', 'Acer pseudoplatanus', '3'],
        ['B', 'Prunus padus', '2'],
        ['B', 'Crataegus laevigata', '+'],
        ['B', 'Fagus sylvatica', '+'],
        ['C', 'Urtica dioica', '4'],
        ['C', 'Lysimachia nummularia', '3'],
        ['C', 'Stellaria nemorum', '2'],
        ['C', 'Ajuga reptans', '1'],
        ['C', 'Stellaria holostea', '+'],
        ['C', 'Lamium purpureum', '+'],
        ['C', 'Geum rivale', '+'],
        ['C', 'Poa nemoralis', '2'],
        ['C', 'Milium effusum', '+'],
        ['C', 'Poa trivialis', '1'],
        ['C', 'Ranunculus auricomus', '+'],
      ),
    }),
    releve({
      coords: '54° 13\' N 16° 08\' E',
      altitude: 35,
      cover: [70, 40, 95, 20],
      height: [30, 5],
      species: rows(
        ['A', 'Quercus robur', '4'],
        ['B', 'Carpinus betulus', '+'],
        ['B', 'Acer pseudoplatanus', '2'],
        ['B', 'Prunus padus', '2'],
        ['B', 'Corylus avellana', '1'],
        ['B', 'Fraxinus excelsior', '2'],
        ['B', 'Quercus robur', '+'],
        ['C', 'Urtica dioica', '3'],
        ['C', 'Pulmonaria officinalis', '2'],
        ['C', 'Athyrium filix-femina', '1'],
        ['C', 'Milium effusum', '2'],
        ['C', 'Galium odoratum', '+'],
        ['C', 'Aegopodium podagraria', '2'],
        ['C', 'Lamiastrum galeobdolon', '2'],
        ['C', 'Circaea lutetiana', '+'],
        ['C', 'Quercus robur', '+'],
        ['C', 'Poa nemoralis', '+'],
        ['C', 'Fraxinus excelsior', '+'],
        ['C', 'Polygonatum multiflorum', '+'],
        ['C', 'Geranium robertianum', '+'],
        ['D', 'Mnium affine', '1'],
        ['D', 'Atrichum undulatum', '1'],
        ['D', 'Dicranum sp.', '2'],
      ),
    }),
    releve({
      coords: '54° 13\' N 16° 08\' E',
      altitude: 35,
      cover: [70, 50, 100, 10],
      height: [30, 3],
      species: rows(
        ['A', 'Fraxinus excelsior', '2'],
        ['A', 'Quercus robur', '2'],
        ['A', 'Fagus sylvatica', '2'],
        ['B', 'Acer pseudoplatanus', '2'],
        ['B', 'Prunus padus', '2'],
        ['B', 'Fraxinus excelsior', '2'],
        ['C', 'Aegopodium podagraria', '3'],
        ['C', 'Stellaria nemorum', '3'],
        ['C', 'Galium odoratum', '+'],
        ['C', 'Lamium purpureum', '+'],
        ['C', 'Milium effusum', '2'],
        ['C', 'Carex sylvatica', '2'],
        ['C', 'Urtica dioica', '3'],
        ['C', 'Lamiastrum galeobdolon', '1'],
        ['C', 'Pulmonaria officinalis', '2'],
        ['C', 'Ajuga reptans', '+'],
        ['C', 'Brachypodium sylvaticum', '+'],
        ['C', 'Festuca gigantea', '+'],
        ['C', 'Festuca altissima', '2'],
        ['D', 'Dicranum sp.', '2'],
      ),
    }),
  ],
  indicators: {
    area: {
      inputs: { choice: 'slow' },
      value: 'Zaobserwowano proces kurczenia się siedliska – w wyniku szybko zachodzącego procesu grądowacenia lasu łęgowego.',
      grade: 'U1',
    },
    floristic: {
      inputs: {
        choice: 'impoverished',
        species: [
          { name: 'Urtica dioica', cover: 40 },
          { name: 'Aegopodium podagraria', cover: 20 },
          { name: 'Stellaria nemorum', cover: 15 },
          { name: 'Carex sylvatica', cover: 10 },
          { name: 'Milium effusum', cover: 5 },
          { name: 'Galium odoratum', cover: 0.5 },
          { name: 'Lamiastrum galeobdolon', cover: 5 },
          { name: 'Poa nemoralis', cover: 5 },
        ],
      },
      value:
        'Kombinacja gatunków: na powierzchni spotykają się i występują gatunki z dwóch grup siedliskowych, gatunki ściśle związane z lasami łęgowymi Ficario-Ulmetum oraz gatunki grądowe. Taki układ jest wynikiem zaburzeń stosunków wodnych i odzwierciedla obecny stan siedliska.',
      grade: 'U1',
    },
    dominant: {
      inputs: {
        choice: 'natural',
        species: [
          { name: 'Quercus robur', cover: 40 },
          { name: 'Fraxinus excelsior', cover: 30 },
          { name: 'Acer pseudoplatanus', cover: 15 },
          { name: 'Fagus sylvatica', cover: 10 },
          { name: 'Urtica dioica', cover: 40 },
          { name: 'Aegopodium podagraria', cover: 20 },
          { name: 'Stellaria nemorum', cover: 15 },
          { name: 'Carex sylvatica', cover: 10 },
          { name: 'Dicranum sp.', cover: 5 },
        ],
      },
      value:
        'Warstwa A (średnie pokrycie 70%): Quercus robur 40%, Fraxinus excelsior 30%; warstwa B (25%): Acer pseudoplatanus 15%, Fagus sylvatica 10%; warstwa C (95%): Urtica dioica 40%, Aegopodium podagraria 20%, Stellaria nemorum 15%, Carex sylvatica 10%; warstwa D (5%): Dicranum sp.',
      grade: 'FV',
    },
    elmOakAsh: {
      inputs: {
        species: [
          { name: 'Quercus robur', cover: 40 },
          { name: 'Fraxinus excelsior', cover: 30 },
        ],
      },
      value:
        'Dąb szypułkowy Quercus robur i jesion wyniosły Fraxinus excelsior stanowią główne gatunki lasotwórcze w drzewostanie. Pokrycie gatunków osiąga 70%, z czego dąb szypułkowy zajmuje 40%, a jesion wyniosły 30%. Nie stwierdzono występowania wiązu.',
      // W karcie z przewodnika FV, choć dwa gatunki to według tab. 2 U1 – zostawiamy ocenę eksperta (patrz testy).
      grade: 'FV',
    },
    shrubs: {
      inputs: {
        species: [
          { name: 'Prunus padus' },
          { name: 'Crataegus laevigata' },
          { name: 'Acer pseudoplatanus' },
          { name: 'Fagus sylvatica' },
          { name: 'Carpinus betulus' },
          { name: 'Corylus avellana' },
          { name: 'Quercus robur' },
        ],
      },
      value:
        'W warstwie krzewów występuje 7 gatunków: czeremcha zwyczajna Prunus padus, głóg dwuszyjkowy Crataegus laevigata, jawor Acer pseudoplatanus, buk zwyczajny Fagus sylvatica, grab pospolity Carpinus betulus, leszczyna pospolita Corylus avellana, dąb szypułkowy Quercus robur.',
      grade: 'FV',
    },
    ecoAlien: { inputs: { species: [] }, value: 'Nie stwierdzono występowania gatunków ekologicznie obcych w drzewostanie.', grade: 'FV' },
    geoAlien: { inputs: { species: [], regenerating: '' }, value: 'Nie stwierdzono występowania gatunków geograficznie obcych w drzewostanie.', grade: 'FV' },
    deadWood: { inputs: { volume: undefined, share: undefined }, value: 'Brak danych', grade: 'XX' },
    largeDeadWood: { inputs: { perHa: undefined, minDiameter: '50' }, value: 'Brak danych', grade: 'XX' },
    age: {
      inputs: { choice: 'old', share100: undefined, share50: undefined, years: 110 },
      value: 'Około 110 lat',
      grade: 'FV',
    },
    regeneration: {
      inputs: {
        choice: 'abundant',
        species: [
          { name: 'Acer pseudoplatanus' },
          { name: 'Fagus sylvatica' },
          { name: 'Fraxinus excelsior' },
          { name: 'Quercus robur' },
        ],
      },
      value:
        'Główne gatunki pojawiające się w podroście i podszycie to: jawor Acer pseudoplatanus, buk zwyczajny Fagus sylvatica, jesion wyniosły Fraxinus excelsior oraz w mniejszym stopniu dąb szypułkowy Quercus robur.',
      grade: 'FV',
    },
    vertical: {
      inputs: { choice: 'partly' },
      value:
        'Struktura pionowa drzewostanu prawidłowa. Struktura przestrzenna zaburzona – w wyniku obniżania poziomu wód gruntowych i zamierania jesionu. W wyniku tych zaburzeń na powierzchni obserwowane były płaty bardziej grądowe i bardziej łęgowe.',
      grade: 'U1',
    },
    gradification: {
      inputs: { choice: 'advanced', gradCover: 40 },
      value:
        'Bardzo silne przejawy grądowienia. Gatunki grądowe spotykane są zarówno w warstwie zielnej (C), jak i w warstwie mszystej (D). Pokrycie na transekcie przez gatunki grądowe wynosi około 40%.',
      grade: 'U2',
    },
    invasive: { inputs: { species: [] }, value: 'Brak ekspansywnych obcych geograficznie i ekologicznie gatunków w podszycie i w runie.', grade: 'FV' },
    apophytes: {
      inputs: { choice: 'raised', species: [{ name: 'Urtica dioica', cover: 40 }] },
      value: 'Najsilniej ekspansywnym gatunkiem rodzimym jest pokrzywa Urtica dioica, która występuje w znacznej liczebności na całym transekcie.',
      grade: 'U1',
    },
    hydrology: {
      inputs: { choice: 'dry' },
      value:
        'Zaobserwowano procesy przesuszenia. Poziom wody w przepływającej w pobliżu rzece Dzierżęcince uległ gwałtownie obniżeniu (okresowe wysychanie koryta rzeki).',
      grade: 'U2',
    },
    logging: {
      inputs: { choice: 'none' },
      value: 'Nie zaobserwowano śladów zniszczenia runa i gleby związanego z prowadzonymi wcześniej pracami leśnymi.',
      grade: 'FV',
    },
    otherDistortions: { inputs: { choice: 'none' }, value: 'Nie stwierdzono innych zniekształceń.', grade: 'FV' },
    keySpecies: {
      inputs: { choice: 'someU1' },
      value: 'Na transekcie występuje bardzo niewielka różnorodność mszaków. Stwierdzono występowanie około 3 gatunków mchów.',
      grade: 'U1',
    },
  },
  prospects: {
    value:
      'Zamieranie jesionu i obniżanie poziomu wód gruntowych to najważniejsze zagrożenia. Zahamowanie tych procesów jest bardzo trudne do wykonania, a od nich zależy utrzymanie lasów łęgowych jesionowo-wiązowych. Najlepszym rozwiązaniem problemu jest ochrona bierna drzewostanów.',
    grade: 'U2',
  },
  impacts: [
    { code: 'B02.04', name: 'Usuwanie martwych i umierających drzew', influence: '-', intensity: 'H', description: '' },
    { code: 'J02.01', name: 'Zasypywanie terenu, melioracje i osuszanie – ogólnie', influence: '-', intensity: 'M', description: '' },
  ],
  threats: [
    {
      code: 'K04.03',
      name: 'Wprowadzanie chorób (mikrobiologicznych patogenów), np. zamieranie jesionu',
      description: 'Zamieranie jesionu Fraxinus excelsior powoduje zmiany w składzie drzewostanu i runa.',
    },
    {
      code: 'J02.01',
      name: 'Zasypywanie terenu, melioracje i osuszanie – ogólnie',
      description:
        'Obniżanie się poziomu wód gruntowych prowadzi do przekształcania się łęgów wiązowo-jesionowych w kierunku grądów.',
    },
  ],
  other: {
    otherValues: 'Bogate populacje storczyków i gatunków górskich',
    conservation: 'Nie prowadzono działań ochronnych',
    notes:
      'Propozycje działań ochronnych: objęcie obszaru Bukowy Las Górki ochroną rezerwatową (ochrona ścisła) i obserwacja zmian zachodzących po zaprzestaniu użytkowania gospodarczego.',
    photos: [],
  },
  overallComment: 'Ocena ogólna U2 wynika z oceny złej (U2) parametrów „Specyficzna struktura i funkcje” (kardynalny wskaźnik „Stosunki wodno-wilgotnościowe”) oraz „Perspektywy ochrony”.',
}

export const examples91F0 = [{ id: 'bukowy-las-gorki-2', label: 'Bukowy Las Górki 2', values: bukowyLasGorki2 }]
