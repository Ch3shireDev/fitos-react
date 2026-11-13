// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Lemke 2015, rozdz. 2180, pkt 3 „Przykład karty obserwacji
// dla siedliska przyrodniczego na stanowisku”): stanowisko Białogóra (PLH220003), 19.10.2013.
// Wszystkie oceny wskaźników i parametrów przepisane z karty i zgodne z podpowiedziami formularza.
// Różnica jest jedna – ocena ogólna. Karta podaje U1 z dopiskiem „powierzchnia siedliska o różnym stanie zachowania na
// stanowisku: FV 20%, U1 80%”, choć wszystkie trzy parametry ma na FV, a tab. 2 przewodnika („wszystkie parametry
// ocenione na FV” → FV) i formularz dają FV. Rozkład 20/80 i ocena U1 z karty są przepisane do uwag i uzasadnienia.
// Uwagi do przepisania:
//  • współrzędne w przewodniku są ucięte („54º 49’…”N 17º 57’…”E”) – przepisane tak, jak są;
//  • „Gatunki obce ekologicznie w drzewostanie” – karta ich nie ma (od 2018 r. GIOŚ ich nie ocenia): XX z opisem, poza oceną;
//  • oddziaływanie „U – nieznane zagrożenie” z wpływem i intensywnością „x” – formularz wymaga obu, więc wpis jest w uwagach;
//  • pokrycia gatunków na transekcie: karta podaje opisy, więc listy wzięto ze zdjęć fitosocjologicznych, a stopnie
//    Braun-Blanqueta (najwyższy z trzech zdjęć) zamieniono na środki przedziałów: + → 0,5; 1 → 2,5; 2 → 15; 3 → 37,5;
//    4 → 62,5; 5 → 87,5 (interpretacja – tylko po to, żeby podpowiedzi formularza miały z czego liczyć);
//  • zdjęcie III ma w karcie „Warstwa B: +” bez nazwy gatunku – przepisane do uwag zdjęcia nie da się, warstwa B pusta;
//  • wykonawca zanonimizowany (Jan Kowalski), jak w innych przykładach FITOS.
import type { CardValues, ReleveSpeciesRow } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology2180 } from './methodology'

const COORDS = '54º 49’…”N 17º 57’…”E'

type Bb = ReleveSpeciesRow['abundance']
const sp = (layer: ReleveSpeciesRow['layer'], list: [string, Bb][]): ReleveSpeciesRow[] =>
  list.map(([name, abundance]) => ({ layer, name, abundance }))

const releve = (o: {
  altitude: number
  coverA: number
  coverB: number
  coverC: number
  coverD: number
  heightB: number
  species: ReleveSpeciesRow[]
}) => ({
  coords: COORDS,
  altitude: o.altitude,
  area: 100,
  slope: 0,
  exposure: '',
  coverA: o.coverA,
  coverB: o.coverB,
  coverC: o.coverC,
  coverD: o.coverD,
  heightA: 16,
  heightB: o.heightB,
  heightC: 10,
  heightD: 5,
  unit: 'Empetro nigri-Pinetum',
  species: o.species,
})

export const bialogora: CardValues = {
  ...emptyCardValues(methodology2180),
  site: {
    siteName: 'Białogóra',
    guid: '',
    variant: 'empetro',
    communities: 'Empetro nigri-Pinetum',
    description:
      'Siedlisko obejmuje rozległy, dobrze zachowany kompleks borów bażynowych na północ od miejscowości Białogóra. Zarządzający terenem: ALP – Nadleśnictwo Choczewo.',
    areaHa: 20,
    protectedAreas: 'Obszar Natura 2000 Białogóra PLH220003, Nadmorski Park Krajobrazowy',
    coordStart: COORDS,
    coordMiddle: COORDS,
    coordEnd: COORDS,
    transect: 'Powierzchnia prostokątna o wymiarach 10x200 m',
    altitude: '10',
    date: '2013-10-19',
    observer: 'Jan Kowalski',
  },
  releves: [
    releve({
      altitude: 5,
      coverA: 40,
      coverB: 0,
      coverC: 60,
      coverD: 90,
      heightB: 2,
      species: [
        ...sp('A', [['Pinus sylvestris', '3']]),
        ...sp('B', [['Pinus sylvestris', '+']]),
        ...sp('C', [
          ['Calluna vulgaris', '1'],
          ['Carex arenaria', '1'],
          ['Deschampsia flexuosa', '+'],
          ['Empetrum nigrum', '2'],
          ['Vaccinium vitis-idaea', '3'],
        ]),
        ...sp('D', [
          ['Hylocomium splendens', '5'],
          ['Pseudoscleropodium purum', '1'],
          ['Dicranum scoparium', '+'],
        ]),
      ],
    }),
    releve({
      altitude: 10,
      coverA: 70,
      coverB: 0,
      coverC: 40,
      coverD: 90,
      heightB: 2,
      species: [
        ...sp('A', [['Pinus sylvestris', '4']]),
        ...sp('C', [
          ['Calluna vulgaris', '1'],
          ['Deschampsia flexuosa', '+'],
          ['Empetrum nigrum', '1'],
          ['Vaccinium myrtillus', '1'],
          ['Vaccinium vitis-idaea', '3'],
        ]),
        ...sp('D', [['Pseudoscleropodium purum', '5']]),
      ],
    }),
    releve({
      altitude: 10,
      coverA: 60,
      coverB: 0,
      coverC: 40,
      coverD: 70,
      heightB: 0,
      species: [
        ...sp('A', [['Pinus sylvestris', '4']]),
        ...sp('C', [
          ['Carex arenaria', '1'],
          ['Deschampsia flexuosa', '+'],
          ['Empetrum nigrum', '2'],
          ['Vaccinium myrtillus', '1'],
          ['Vaccinium vitis-idaea', '2'],
        ]),
        ...sp('D', [
          ['Pseudoscleropodium purum', '4'],
          ['Dicranum scoparium', '+'],
          ['Hypnum cupressiforme', '+'],
        ]),
      ],
    }),
  ],
  indicators: {
    area: { inputs: { choice: 'stable' }, value: 'Brak zagrożeń', grade: 'FV' },
    characteristic: {
      inputs: {
        species: [
          { name: 'Pinus sylvestris', cover: 62.5 },
          { name: 'Empetrum nigrum', cover: 15 },
          { name: 'Carex arenaria', cover: 2.5 },
          { name: 'Vaccinium vitis-idaea', cover: 37.5 },
          { name: 'Calluna vulgaris', cover: 2.5 },
          { name: 'Deschampsia flexuosa', cover: 0.5 },
        ],
        choice: 'full',
      },
      value: 'Występują wszystkie gatunki charakterystyczne',
      grade: 'FV',
    },
    dominant: {
      inputs: {
        species: [
          { name: 'Pinus sylvestris', cover: 62.5 },
          { name: 'Vaccinium vitis-idaea', cover: 37.5 },
          { name: 'Empetrum nigrum', cover: 15 },
          { name: 'Hylocomium splendens', cover: 87.5 },
          { name: 'Pseudoscleropodium purum', cover: 87.5 },
        ],
        choice: 'natural',
      },
      value: 'We wszystkich warstwach dominują gatunki charakterystyczne',
      grade: 'FV',
    },
    invasive: { inputs: { species: [] }, value: 'Brak', grade: 'FV' },
    age: { inputs: { oldShare: 100 }, value: 'Starodrzew – drzewostan w wieku powyżej 100 lat.', grade: 'FV' },
    ecoAlien: { inputs: { species: [] }, value: 'Wskaźnika nie ma w karcie z przewodnika (nie oceniany od 2018 r.)', grade: 'XX' },
    geoAlien: { inputs: { species: [] }, value: 'Nie występują', grade: 'FV' },
    deadWood: { inputs: { choice: 'below' }, value: 'Poniżej 5 m3/ha, ale występuje', grade: 'U1' },
    regeneration: { inputs: { species: [], choice: 'single' }, value: 'Występuje sporadycznie', grade: 'U1' },
    distortions: { inputs: { choice: 'none' }, value: 'Nie stwierdzono', grade: 'FV' },
  },
  prospects: {
    value: 'Istnieje duża szansa na zachowanie stanu ochrony w dłuższej perspektywie czasowej',
    grade: 'FV',
  },
  impacts: [],
  threats: [{ code: 'X', name: 'Brak zagrożeń i nacisków', description: 'Brak.' }],
  other: {
    otherValues: 'Jeden z lepiej zachowanych rozległych płatów siedliska w skali całego areału występowania',
    conservation:
      'Wykonywane działania ochronne: brak. Propozycje: konsekwentne pozostawianie martwych i obumierających drzew, pozostawianie fragmentów drzewostanów do naturalnego rozwoju.',
    notes:
      'Typ stanowiska: referencyjne. Monitoring jest wymagany: tak – dobrze zachowany płat siedliska z dużą ilością martwego drewna. Zarządzający terenem: ALP – Nadleśnictwo Choczewo. Uwagi metodyczne: optymalny termin obserwacji – maj–czerwiec, wrzesień–październik, poza sezonem turystycznym. Udział powierzchni siedliska o różnym stanie zachowania na stanowisku: FV 20%, U1 80% – na tej podstawie karta z przewodnika podaje ocenę ogólną U1. W zdjęciu fitosocjologicznym III karta podaje „Warstwa B: +” bez nazwy gatunku. Aktualne oddziaływania wg karty: „U – Nieznane zagrożenie lub nacisk”, intensywność i wpływ „x”, opis: „W trakcie monitoringu nie stwierdzono występowania oddziaływań na siedlisko” – tabela oddziaływań wymaga wpływu i intensywności, więc wpis przeniesiono tutaj.',
    photos: [],
  },
  overallComment:
    'Powierzchnia siedliska o różnym stanie zachowania na stanowisku: FV 20%, U1 80%. W karcie z przewodnika ocena ogólna U1 (wszystkie parametry FV).',
}

export const examples2180: CardExample[] = [{ id: 'bialogora', label: 'Białogóra', values: bialogora }]
