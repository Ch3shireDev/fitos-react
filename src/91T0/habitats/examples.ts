// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Węgrzyn i Masłowska 2010, rozdz. 91T0, pkt 3 „Przykład
// wypełnionej karty obserwacji”): stanowisko 327d_01 w rezerwacie Bór Chrobotkowy (Bory Tucholskie), 26.07.2007.
// Karta pochodzi z pierwszego cyklu monitoringu – zdjęcia fitosocjologiczne mają po 400 m² (metodyka mówi o 100 m²),
// a stosunek pokrycia oceniano jeszcze wg starszego kryterium („FV – pokrycie płatami porostów zbliżone do 70%”).
// Oceny przepisane z karty. Trzy odbiegają od podpowiedzi formularza (wg tab. 2) i formularz to pokazuje:
//  • kombinacja florystyczna – z listy 10 gatunków jest 6 (brak borówek, śmiałka, chrobotka widlastego na transekcie) → U1, ekspert FV;
//  • stosunek pokrycia – „80/20” to w tab. 2 klasa U1 (FV wymaga 90/10), ekspert FV;
//  • naturalne odnowienie – „nieliczne odnowienia” to w tab. 2 FV, ekspert dał U1.
// Wykonawca zanonimizowany (Jan Kowalski). Pokrycia w zdjęciach w skali Braun-Blanqueta, na transekcie w % (z karty).
import type { CardValues, ReleveSpeciesRow } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology91T0 } from './methodology'

const COORDS = 'N 53°55′; E 17°46′'

type Bb = ReleveSpeciesRow['abundance']
const sp = (layer: ReleveSpeciesRow['layer'], list: [string, Bb][]): ReleveSpeciesRow[] =>
  list.map(([name, abundance]) => ({ layer, name, abundance }))

const releve = (o: { coverA: number; coverB: number; coverC: number; coverD: number; species: ReleveSpeciesRow[] }) => ({
  coords: COORDS,
  altitude: 160,
  area: 400,
  slope: undefined,
  exposure: '',
  coverA: o.coverA,
  coverB: o.coverB,
  coverC: o.coverC,
  coverD: o.coverD,
  heightA: 20,
  heightB: 2,
  heightC: 0.4,
  heightD: undefined,
  unit: 'Cladonio-Pinetum',
  species: o.species,
})

export const borChrobotkowy: CardValues = {
  ...emptyCardValues(methodology91T0),
  site: {
    siteName: '327d_01',
    guid: '',
    communities: 'Cladonio-Pinetum',
    description:
      'Rezerwat Przyrody Bór Chrobotkowy jest obszarem z najlepiej zachowanym na terenie Polski siedliskiem boru suchego z runem chrobotkowym w odmianie suboceanicznej. W pełni wykształcony śródlądowy bór chrobotkowy, wyłącznie z sosną w warstwie drzew o niskim zwarciu na poziomie 0,7. Sosna wykazuje słabe przyrosty i najniższe stopnie bonitacji IV. W bardzo ubogim w rośliny zielne runie dominują porosty krzaczkowate naziemne, głównie z rodzaju Cladonia (chrobotek) i Cetraria (płucnica), tworzące mniej lub bardziej zwarte murawki. Oprócz porostów w runie występują mniej licznie mszaki z rodzaju Ptilidium (rzęsiak) i Dicranum (widłoząb). W większości obszaru powierzchnia rezerwatu jest równinna, natomiast w zachodniej części ograniczona do dużą skarpą. Transekt poprowadzony jest we fragmencie obszaru z najlepiej zachowanym siedliskiem. Zwarcie chrobotków w runie osiąga 100%. Warstwa podszytu nie jest wykształcona lub sprowadza się do pojedynczych odnowień sosnowych i zarośli jałowca. Warstwa roślin zielnych jest bardzo słabo wykształcona. Zarządzający terenem: Wojewódzki Konserwator Przyrody, Nadleśnictwo Przymuszewo.',
    areaHa: 9.39,
    protectedAreas: 'Obszar Natura 2000 Bór Chrobotkowy, Rezerwat Przyrody Bór Chrobotkowy im. Zygmunta Tobolewskiego',
    coordStart: COORDS,
    coordMiddle: COORDS,
    coordEnd: COORDS,
    transect: '200x10 m',
    altitude: '160',
    date: '2007-07-26',
    observer: 'Jan Kowalski',
  },
  releves: [
    releve({
      coverA: 85,
      coverB: 10,
      coverC: 10,
      coverD: 70,
      species: [
        ...sp('A', [['Pinus sylvestris', '5']]),
        ...sp('B', [['Pinus sylvestris', '3']]),
        ...sp('C', [
          ['Calluna vulgaris', '2'],
          ['Festuca ovina', '1'],
        ]),
        ...sp('D', [
          ['Cetraria ericetorum', '+'],
          ['Cladonia arbuscula subsp. mitis', '+'],
          ['Cladonia arbuscula subsp. squarrosa', '4'],
          ['Cladonia gracilis', '3'],
          ['Cladonia pleurota', '+'],
          ['Cladonia rangiferina', '1'],
          ['Cladonia uncialis', '+'],
          ['Dicranum spurium', '1'],
          ['Pleurozium schreberi', '1'],
          ['Polytrichum commune', '+'],
          ['Ptilidium ciliare', '2'],
        ]),
      ],
    }),
    releve({
      coverA: 60,
      coverB: 10,
      coverC: 5,
      coverD: 100,
      species: [
        ...sp('A', [['Pinus sylvestris', '4']]),
        ...sp('B', [
          ['Juniperus communis', '1'],
          ['Pinus sylvestris', '1'],
        ]),
        ...sp('C', [
          ['Festuca ovina', '+'],
          ['Pinus sylvestris', '+'],
        ]),
        ...sp('D', [
          ['Cetraria aculeata', '+'],
          ['Cetraria islandica', '+'],
          ['Cladonia arbuscula subsp. squarrosa', '2'],
          ['Cladonia coccifera', '+'],
          ['Cladonia digitata', '+'],
          ['Cladonia furcata', '+'],
          ['Cladonia gracilis', '2'],
          ['Cladonia pleurota', '+'],
          ['Cladonia rangiferina', '+'],
          ['Cladonia squamosa', '+'],
          ['Cladonia stellaris', '+'],
          ['Cladonia uncialis', '3'],
          ['Dicranum spurium', '1'],
          ['Pleurozium schreberi', '+'],
          ['Polytrichum commune', '+'],
          ['Ptilidium ciliare', '1'],
          ['Stereocaulon paschale', '+'],
        ]),
      ],
    }),
    releve({
      coverA: 90,
      coverB: 0,
      coverC: 5,
      coverD: 80,
      species: [
        ...sp('A', [['Pinus sylvestris', '5']]),
        ...sp('C', [['Festuca ovina', '+']]),
        ...sp('D', [
          ['Cladonia arbuscula subsp. squarrosa', '4'],
          ['Cladonia furcata', '+'],
          ['Cladonia gracilis', '1'],
          ['Cladonia rangiferina', '+'],
          ['Cladonia stellaris', '+'],
          ['Dicranum spurium', '2'],
          ['Pleurozium schreberi', '1'],
          ['Ptilidium ciliare', '+'],
        ]),
      ],
    }),
  ],
  indicators: {
    area: { inputs: { choice: 'stable' }, value: '9,39 ha', grade: 'FV' },
    characteristic: {
      inputs: {
        species: [
          { name: 'Pinus sylvestris' },
          { name: 'Festuca ovina' },
          { name: 'Calluna vulgaris' },
          { name: 'Cladonia arbuscula subsp. squarrosa' },
          { name: 'Cladonia gracilis' },
          { name: 'Cladonia rangiferina' },
          { name: 'Ptilidium ciliare' },
          { name: 'Cladonia arbuscula subsp. mitis' },
          { name: 'Cladonia uncialis' },
          { name: 'Cladonia stellaris' },
          { name: 'Dicranum spurium' },
        ],
      },
      value:
        'Warstwa drzew (A): sosna zwyczajna Pinus sylvestris 3; warstwa krzewów (B): sosna zwyczajna Pinus sylvestris 3; warstwa runa (C): kostrzewa owcza Festuca ovina 1, wrzos zwyczajny Calluna vulgaris 1; warstwa porostowo-mszysta (D): chrobotek leśny Cladonia arbuscula subsp. squarrosa 3, chrobotek wysmukły Cladonia gracilis 3, chrobotek reniferowy Cladonia rangiferina 1, rzęsiak pospolity Ptilidium ciliare 2, chrobotek łagodny Cladonia arbuscula subsp. mitis, chrobotek gwiazdkowaty Cladonia uncialis 1, chrobotek alpejski Cladonia stellaris 1, widłoząb zdrożny Dicranum spurium 1',
      grade: 'FV',
    },
    share: {
      inputs: { value: 100 },
      value: '100% powierzchni zajętej przez siedlisko na transekcie. Transekt poprowadzony jest przez fragment obszaru z najlepiej wykształconym siedliskiem boru chrobotkowego.',
      grade: 'FV',
    },
    invasive: { inputs: { species: [] }, value: 'Na terenie obszaru nie występują', grade: 'FV' },
    expansive: { inputs: { species: [] }, value: 'W obrębie transektu nie stwierdzono roślin zielnych ekspansywnych', grade: 'FV' },
    cladonia: {
      inputs: {
        species: [
          { name: 'Cladonia arbuscula subsp. squarrosa', cover: 30 },
          { name: 'Cladonia gracilis', cover: 30 },
          { name: 'Cladonia rangiferina', cover: 10 },
          { name: 'Cladonia arbuscula subsp. mitis', cover: 5 },
          { name: 'Cladonia uncialis', cover: 15 },
        ],
        thallus: 'good',
        carpet: 'dense',
      },
      value:
        'Chrobotek leśny Cladonia arbuscula subsp. squarrosa 30%, chrobotek wysmukły Cladonia gracilis 30%, chrobotek reniferowy Cladonia rangiferina 10%, chrobotek łagodny Cladonia arbuscula subsp. mitis 5%, chrobotek gwiazdkowaty Cladonia uncialis 15%',
      grade: 'FV',
    },
    ratio: {
      inputs: { lichens: 75, mosses: 5, vascular: 20 },
      value: '80/20. Całość runa zajmują porosty, mszaki mają bardzo mały udział',
      grade: 'FV',
    },
    age: { inputs: { value: 121 }, value: '121 lat. Dobrze zachowany starodrzew', grade: 'FV' },
    deadWood: { inputs: { choice: 'none' }, value: 'Brak', grade: 'FV' },
    alienTrees: { inputs: { species: [] }, value: 'Nie występują', grade: 'FV' },
    regeneration: {
      inputs: { species: [{ name: 'Pinus sylvestris', cover: 10 }], choice: 'few' },
      value: 'Sosna zwyczajna Pinus sylvestris 10%, występują nieliczne odnowienia',
      grade: 'U1',
    },
    plantings: { inputs: { species: [], choice: 'none' }, value: 'Brak', grade: 'FV' },
    logging: { inputs: { choice: 'weak' }, value: 'Brak. Rezerwat Przyrody', grade: 'FV' },
    standDamage: { inputs: { choice: 'none' }, value: 'Nie stwierdzono. Brak zniszczeń w drzewostanie', grade: 'FV' },
  },
  prospects: {
    value: 'Obszar ochrony ścisłej, wyłączony z gospodarki leśnej. Najlepiej zachowane siedlisko 91T0 w Polsce.',
    grade: 'FV',
  },
  impacts: [
    {
      code: 'F04',
      name: 'Pozyskiwanie roślin (grzybobranie, zbieranie chrobotków)',
      influence: '-',
      intensity: 'H',
      description: 'Penetracja w celu zbierania grzybów, a tym samym zadeptywanie gatunków porostów (w karcie z 2007 r.: kod 250, intensywność A).',
    },
    {
      code: 'H04',
      name: 'Zanieczyszczenie powietrza, zanieczyszczenia przenoszone drogą powietrzną',
      influence: '-',
      intensity: 'L',
      description: 'Na siedlisko negatywnie wpływa wzrost zanieczyszczenia powietrza (w karcie z 2007 r.: kod 702, intensywność C).',
    },
  ],
  threats: [
    { code: 'H04', name: 'Zanieczyszczenie powietrza, zanieczyszczenia przenoszone drogą powietrzną', description: 'Wzrost zanieczyszczenia powietrza.' },
    { code: 'F04.02', name: 'Zbieractwo (grzyby, porosty, jagody)', description: 'Bardzo duża penetracja terenu przez lokalną ludność. Zbieractwo grzybów i zadeptywanie plech chrobotków.' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)', description: 'Użyźnienie siedliska.' },
  ],
  other: {
    otherValues: 'Występowanie górskich gatunków porostów naziemnych Stereocaulon paschale, Cetraria nivalis oraz gatunków rodzaju Usnea sp. na korze sosen.',
    conservation:
      'Jest to obszar ochrony ścisłej. Obszar wyłączony z gospodarki leśnej. Nie są wykonywane działania ochrony czynnej. Propozycje: dla obecnego stanu zachowania siedliska nie są konieczne działania ochrony czynnej.',
    notes:
      'Typ stanowiska: referencyjne. Typ monitoringu: szczegółowy. Monitoring wymagany: tak – jako stanowisko referencyjne co 5 lat. Udział powierzchni siedliska o różnym stanie zachowania na stanowisku: FV 100%. Zdjęcia fitosocjologiczne wykonano na powierzchniach 400 m².',
    photos: [],
  },
  overallComment: 'Wszystkie parametry ocenione na FV.',
}

export const examples91T0: CardExample[] = [{ id: 'bor-chrobotkowy', label: 'Bór Chrobotkowy', values: borChrobotkowy }]
