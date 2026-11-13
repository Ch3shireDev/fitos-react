// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Lemke 2012, rozdz. 2170, pkt 3 „Przykład wypełnionej karty
// obserwacji”): „Helskie Wydmy” 1, 15.09.2010. Wykonawca zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („N 54° 18' …'' – E 18° 26' …''”) – przepisane do minut;
//    w zdjęciu fitosocjologicznym przewodnik ma „N 50° 18' – E 16° 26'” (to Kotlina Kłodzka, nie Hel) – literówka,
//    poprawione na współrzędne stanowiska;
//  • „Wysokość warstw: d 1 m” – warstwa mszysta nie ma 1 m, a d to „brak”; 1 m to krzewy wierzby (b) – przepisane do B;
//  • oceny wskaźników jak w karcie; wartości przepisane jako opisy, liczby (50 m², 1–1,5 m, 0%) tam, gdzie karta je podaje;
//  • struktura: formularz liczy U1 (kardynalna „Powierzchnia kępy” = U1), karta ma FV – patrz specyfikacja;
//    ocena ogólna U1 jak w karcie;
//  • oddziaływanie: stary kod 622 „Turystyka piesza” → G01.02 (lista 2011), intensywność B → M (średnia), wpływ „–”.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology2170 } from './methodology'

const COORD = 'N 54°18′; E 18°26′'

export const helskieWydmy1: CardValues = {
  ...emptyCardValues(methodology2170),
  site: {
    siteName: '„Helskie Wydmy” 1',
    guid: '',
    natura2000: 'Zatoka Pucka i Półwysep Helski',
    protectedAreas: 'Rezerwat przyrody „Helskie Wydmy”, PLH220032 Zatoka Pucka i Półwysep Helski',
    coordMiddle: COORD,
    altitude: '10–20',
    description: 'Zarośla porastają wschodnie zbocze wydmy białej, w centralnej części rezerwatu „Helskie Wydmy”.',
    communities: 'Zespół wydmuchrzycy piaskowej i piaskownicy zwyczajnej Elymeto-Ammophiletum.',
    areaM2: 50,
    transect: 'Monitoring przeprowadzono na stanowisku punktowym z powodu małej powierzchni poszczególnych kęp zarośli wierzby piaskowej.',
    date: '2010-09-15',
    fillDate: '2010-09-15',
    observer: 'Jan Kowalski',
  },
  releves: [
    {
      coords: COORD,
      altitude: 10,
      area: 25,
      slope: 10,
      exposure: 'SW',
      coverA: undefined,
      coverB: 50,
      coverC: '<5',
      coverD: 0,
      heightA: undefined,
      heightB: 1,
      heightC: 20,
      heightD: undefined,
      unit: 'Zespół wydmuchrzycy piaskowej i piaskownicy zwyczajnej Elymeto-Ammophiletum',
      species: [
        { layer: 'B', name: 'Salix arenaria', abundance: '4' },
        { layer: 'C', name: 'Carex arenaria', abundance: '+' },
        { layer: 'C', name: 'Ammophila arenaria', abundance: '1' },
        { layer: 'C', name: 'Festuca rubra', abundance: '+' },
        { layer: 'C', name: 'Lathyrus japonicus', abundance: 'r' },
      ],
    },
  ],
  indicators: {
    area: {
      inputs: { areaM2: 50, choice: 'stable', note: 'areał stabilny' },
      value: '50 m²; areał stabilny',
      grade: 'U1',
    },
    species: {
      inputs: {
        species: [{ name: 'Salix arenaria' }, { name: 'Ammophila arenaria' }, { name: 'Carex arenaria' }, { name: 'Festuca rubra' }, { name: 'Lathyrus japonicus' }],
        choice: 'most',
        note: 'Występują gatunki charakterystyczne dla zespołu.',
      },
      value: 'Występują gatunki charakterystyczne dla zespołu.',
      grade: 'FV',
    },
    expansive: {
      inputs: { species: [], choice: 'none', note: 'W bezpośredniej bliskości kępy występują pojedyncze stare egzemplarze sosny zwyczajnej Pinus sylvestris.' },
      value: 'W bezpośredniej bliskości kępy występują pojedyncze stare egzemplarze sosny zwyczajnej Pinus sylvestris.',
      grade: 'FV',
    },
    height: { inputs: { mean: undefined, min: 1, max: 1.5, choice: '' }, value: '1–1,5 m', grade: 'FV' },
    regeneration: { inputs: { choice: 'none', note: 'Nie stwierdzono' }, value: 'Nie stwierdzono', grade: 'U2' },
    clump: { inputs: { value: 50, choice: '', note: 'Ok. 50 m²' }, value: 'Ok. 50 m²', grade: 'U1' },
    health: {
      inputs: { value: 0, choice: '', note: 'Krzewy wierzby piaskowej w dobrej kondycji, uszkodzeń pędów nie stwierdzono.' },
      value: 'Krzewy wierzby piaskowej w dobrej kondycji, uszkodzeń pędów nie stwierdzono.',
      grade: 'FV',
    },
  },
  prospects: { value: 'Ze względu na właściwości kęp wierzby piaskowej istnieje możliwość przetrwania zarośli na stanowisku.', grade: 'U1' },
  impacts: [
    {
      code: 'G01.02',
      name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych',
      influence: '-',
      intensity: 'M',
      description: 'Zarośla znajdują się w pobliżu ścieżki edukacyjno-przyrodniczej w rezerwacie przyrody.',
    },
  ],
  threats: [],
  other: {
    otherValues: '',
    conservation: '',
    notes:
      'Powierzchnia siedliska o różnym stanie zachowania na stanowisku: FV 0%, U1 100%, U2 0%. Oddziaływanie w karcie z przewodnika: kod 622 „Turystyka piesza”, intensywność B.',
    photos: [],
  },
  overallComment: '',
}

export const examples2170: CardExample[] = [{ id: 'helskie-wydmy-1', label: 'Helskie Wydmy 1', values: helskieWydmy1 }]
