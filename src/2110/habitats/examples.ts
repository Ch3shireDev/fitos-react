// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Lemke 2015, rozdz. 2110, pkt 3 „Przykład karty
// obserwacji”): Świnoujście, 12.10.2013. Wykonawca zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („53º 54'…”N 14º 18'…”E”) – przepisane do minut;
//  • zdjęcia fitosocjologiczne: 3 × 25 m², zwarcie C 2%, wysokość 30 cm, gatunki jak w karcie
//    (Elymus arenarius = Leymus arenarius, „Cakile maritime” w zdjęciu III to literówka);
//  • wartości wskaźników przepisane z karty jako opisy (karta nie podaje procentów ani liczby egzemplarzy);
//  • zniszczenia mechaniczne U1 (niekardynalny) – struktura FV, ocena ogólna FV, jak w karcie;
//  • oddziaływania: intensywność A → H (silna), wpływ „–”.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology2110 } from './methodology'

const COORD = 'N 53°54′; E 14°18′'

const releve = (species: [string, string][]) => ({
  coords: COORD,
  altitude: 0,
  area: 25,
  slope: 0,
  exposure: 'brak',
  coverC: 2,
  heightC: 30,
  unit: 'Elymo-Ammophiletum arenariae honckenyetosum',
  species: species.map(([name, abundance]) => ({ layer: 'C', name, abundance })),
})

export const swinoujscie: CardValues = {
  ...emptyCardValues(methodology2110),
  site: {
    siteName: 'Świnoujście',
    guid: '',
    communities: 'Elymo-Ammophiletum arenariae honckenyetosum',
    description: 'Stanowisko obejmuje pas wydm nadmorskich w stadium inicjalnym na wschód od ujścia rzeki Świny.',
    areaHa: 0.2,
    protectedAreas: 'brak',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '200x10 m',
    altitude: '0–1',
    date: '2013-10-12',
    observer: 'Jan Kowalski',
  },
  releves: [
    releve([
      ['Ammophila arenaria', '1'],
      ['Cakile maritima', '1'],
      ['Elymus arenarius', '1'],
      ['Honckenya peploides', '1'],
    ]),
    releve([
      ['Ammophila arenaria', '1'],
      ['Cakile maritima', '1'],
      ['Elymus arenarius', '1'],
      ['Festuca rubra', '+'],
      ['Honckenya peploides', '1'],
    ]),
    releve([
      ['Ammophila arenaria', '1'],
      ['Cakile maritima', '1'],
      ['Elymus arenarius', '+'],
      ['Honckenya peploides', '1'],
    ]),
  ],
  indicators: {
    area: { inputs: { choice: 'stable', areaHa: undefined, note: 'Powierzchnia stabilna, nie zmniejsza się.' }, value: 'Powierzchnia stabilna, nie zmniejsza się.', grade: 'FV' },
    species: {
      inputs: {
        species: [{ name: 'Ammophila arenaria' }, { name: 'Cakile maritima' }, { name: 'Elymus arenarius' }, { name: 'Honckenya peploides' }],
        choice: 'whole',
        note: 'Występuje całe spektrum gatunkowe.',
      },
      value: 'Występuje całe spektrum gatunkowe.',
      grade: 'FV',
    },
    grasses: {
      inputs: { value: undefined, choice: 'abundant', note: 'Trawy w dobrej kondycji, pojedynczo owocują.' },
      value: 'Trawy w dobrej kondycji, pojedynczo owocują.',
      grade: 'FV',
    },
    abrasion: {
      inputs: { choice: 'accumulative', note: 'Szeroka plaża, brak oznak abrazji brzegu morskiego.' },
      value: 'Szeroka plaża, brak oznak abrazji brzegu morskiego.',
      grade: 'FV',
    },
    aliens: { inputs: { species: [], count: undefined, areaM2: undefined, choice: 'none' }, value: 'nie stwierdzono', grade: 'FV' },
    damage: {
      inputs: { choice: 'few', note: 'Widoczne ślady pojazdów mechanicznych (prawdopodobnie quadów) biegnące po inicjalnych stadiach wydm.' },
      value: 'Widoczne ślady pojazdów mechanicznych (prawdopodobnie quadów) biegnące po inicjalnych stadiach wydm.',
      grade: 'U1',
    },
  },
  prospects: { value: 'Istnieje szansa na zachowanie zasobów siedliska w niepogorszonym stanie ochrony.', grade: 'FV' },
  impacts: [
    {
      code: 'G01.02',
      name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych',
      influence: '-',
      intensity: 'H',
      description:
        'Siedlisko często bywa obiektem silnej antropopresji, nasilającej się zwłaszcza w okresie letnim. Z tego powodu istotna kwestią wydaje się monitoring wskaźników związanych z pozostawieniem śladów po turystach, zwłaszcza wydeptywania. Szczególnie w pobliżu miejscowości turystycznych zauważalne są ślady zadeptywania przez turystów i plażowiczów.',
    },
    { code: 'L07', name: 'Sztorm, cyklon', influence: '-', intensity: 'H', description: 'Silne sztormy mają negatywny wpływ na zasoby siedliska.' },
  ],
  threats: [
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych', description: 'Intensywna presja ruchu turystycznego.' },
    { code: 'J02.12.01', name: 'Prace związane z obroną przed aktywnością morza i ochroną wybrzeży, groble', description: 'Budowa falochronu gazoportu.' },
  ],
  other: {
    otherValues: 'Nie stwierdzono.',
    conservation:
      'Wykonywane działania ochronne: nie prowadzono. Propozycje: działania edukacyjne, ogrodzenie w sezonie letnim szerszego pasa wydm łącznie ze stadium inicjalnym.',
    notes:
      'Typ stanowiska: referencyjne. Zarządzający terenem: Urząd Morski w Szczecinie. Nazwa obszaru N2000: PLH320019 Wolin i Uznam. Monitoring jest wymagany: tak – stanowisko poddane silnej antropopresji, popularne miejsce plażowania i spacerów. Udział powierzchni w stanie FV: 100%.',
    photos: [],
  },
  overallComment: 'Jeden z lepiej zachowanych płatów siedliska na całym wybrzeżu.',
}

export const examples2110: CardExample[] = [{ id: 'swinoujscie', label: 'Świnoujście', values: swinoujscie }]
