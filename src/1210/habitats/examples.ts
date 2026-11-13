// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Ogrodniczuk, Mróz 2015, rozdz. 1210, pkt 3
// „Przykład karty obserwacji”): Orzechowo, 18.09.2013. Wykonawca zanonimizowany (Jan Kowalski); dodatkowego
// eksperta z karty pominięto.
//  • współrzędne w przewodniku są ucięte do minut („54º 36'…”N 16º 55'…”E”), a środek transektu ma literówkę (50º) –
//    przepisane do minut, bez literówki;
//  • zdjęcia fitosocjologiczne: 3 × 2 m², warstwa C, wysokość 40 cm – jak w karcie;
//  • powierzchnia 0,01 ha i U2 bez trendu (pierwsze badanie) – trendu nie wymyślamy, ocena eksperta;
//  • procent transektu: karta podaje tylko „<10%” – wybrana klasa, bez liczby;
//  • zaśmiecenie: „ok. 30%” w karcie dotyczy stanowiska, nie wiadomo, czy płatów – opis przepisany, liczby nie wpisano;
//  • perspektywy XX, ocena ogólna U2 (przez powierzchnię) – jak w karcie;
//  • oddziaływania: intensywność A → H (silna), C → L (słaba), wpływ „–”.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology1210 } from './methodology'

const COORD = 'N 54°36′; E 16°55′'

const releve = (cover: number, species: [string, string][]) => ({
  coords: COORD,
  altitude: 1,
  area: 2,
  slope: 0,
  exposure: 'brak',
  coverC: cover,
  heightC: 40,
  unit: 'Atriplicetalia littoralis',
  species: species.map(([name, abundance]) => ({ layer: 'C', name, abundance })),
})

export const orzechowo: CardValues = {
  ...emptyCardValues(methodology1210),
  site: {
    siteName: 'Orzechowo',
    guid: '',
    communities: 'Atriplicetalia littoralis',
    description:
      'Siedlisko występuje u podnóża klifu, na kamieniach. Siedlisko występuje punktowo (3 stanowiska, każde o powierzchni ok. 10 m²). Kidzina co najmniej całoroczna, mocno rozłożona, warstwa kilku cm. Zbudowana głównie z drewna, kamieni, piasku i kory. Siedlisko stanowi pas o max. szerokości ok. 1–1,5 m i długości 10–15 m.',
    areaHa: 0.01,
    protectedAreas: 'Obszar Chronionego Krajobrazu „Pas pobrzeży na wschód od Ustki”\nobszar Natura 2000 PLH220100 Klify Poddębskie',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '175 m',
    altitude: '1',
    date: '2013-09-18',
    observer: 'Jan Kowalski',
  },
  releves: [
    releve(10, [
      ['Atriplex prostrata', '2'],
      ['Cakile maritima', '1'],
      ['Matricaria maritima', '+'],
      ['Polygonum aviculare', '2'],
      ['Senecio vulgaris', '1'],
      ['Tussilago farfara', '+'],
    ]),
    releve(50, [
      ['Atriplex prostrata', '3'],
      ['Juncus gerardii', '+'],
      ['Lycopus europaeus', '+'],
      ['Polygonum aviculare', '1'],
      ['Tussilago farfara', '3'],
    ]),
    releve(10, [
      ['Atriplex prostrata', '2'],
      ['Cakile maritima', '1'],
      ['Tussilago farfara', '1'],
    ]),
  ],
  indicators: {
    area: { inputs: { choice: '', areaHa: 0.01 }, value: '0,01 ha', grade: 'U2' },
    species: {
      inputs: {
        species: [
          { name: 'Atriplex prostrata', cover: 20 },
          { name: 'Cakile maritima', cover: 15 },
          { name: 'Matricaria maritima', cover: 15 },
        ],
        choice: 'below50',
      },
      value: 'Atriplex prostrata 20%, Cakile maritima 15%, Matricaria maritima 15%',
      grade: 'U1',
    },
    coverage: { inputs: { segments: undefined, length: 175, value: undefined, choice: 'below10' }, value: '<10% transektu', grade: 'U2' },
    waves: { inputs: { choice: 'none', value: undefined, note: '' }, value: 'brak ograniczeń naturalnej działalności fal i sztormów', grade: 'FV' },
    aliens: { inputs: { species: [], choice: 'none' }, value: 'nie stwierdzono', grade: 'FV' },
    damage: { inputs: { choice: 'below10', value: undefined, note: 'brak' }, value: 'brak', grade: 'FV' },
    litter: {
      inputs: {
        choice: 'part',
        value: undefined,
        note: 'Częściowo zaśmiecone stanowisko (ok. 30%), zbierana kidzina w związku z pracami porządkowymi na plaży.',
      },
      value: 'Częściowo zaśmiecone stanowisko (ok. 30%), zbierana kidzina w związku z pracami porządkowymi na plaży.',
      grade: 'U1',
    },
  },
  // karta podaje tylko XX, a w kolumnie opisu szablonowy tekst wskaźnika – formularz wymaga opisu, więc krótka notka
  prospects: { value: 'Nie oceniono (XX) – brak danych o lokalnej dynamice siedliska.', grade: 'XX' },
  impacts: [
    { code: 'G05.05', name: 'Intensywne utrzymywanie parków publicznych / oczyszczanie plaż', influence: '-', intensity: 'H', description: 'Zagrożenie stanowi oczyszczanie plaż i usuwanie kidziny.' },
    { code: 'J02.05.06', name: 'Zmiany ekspozycji na fale', influence: '-', intensity: 'L', description: 'Zagrożenie związane z obroną przed aktywnością morza i ochroną wybrzeży, groble.' },
    {
      code: 'J02.12.01',
      name: 'Prace związane z obroną przed aktywnością morza i ochroną wybrzeży, groble',
      influence: '-',
      intensity: 'L',
      description: 'Zagrożenie związane z potencjalną działalnością człowieka w celu obrony przed aktywnością fal.',
    },
  ],
  threats: [
    { code: 'G05.05', name: 'Intensywne utrzymywanie parków publicznych / oczyszczanie plaż', description: 'Oczyszczanie plaż.' },
    { code: 'J02.05.01', name: 'Modyfikowanie przepływów wodnych (pływów i prądów morskich)', description: 'Modyfikowanie przepływów wodnych (pływów i prądów morskich).' },
    { code: 'J02.05.06', name: 'Zmiany ekspozycji na fale', description: 'Zmiany ekspozycji na fale.' },
    { code: 'J02.12.01', name: 'Prace związane z obroną przed aktywnością morza i ochroną wybrzeży, groble', description: 'Prace związane z obroną przed aktywnością morza i ochroną wybrzeży, groble.' },
  ],
  other: {
    otherValues: 'W sąsiedztwie występowania siedliska 1210 występują inne siedliska przyrodnicze tj. 2130 – Nadmorskie wydmy szare, 1230 – Klify na wybrzeżu Bałtyku.',
    conservation: 'Wykonywane działania ochronne: brak. Propozycje wprowadzenia działań ochronnych: brak.',
    notes:
      'Typ stanowiska: badawcze. Zarządzający terenem: Urząd Morski w Słupsku. Nazwa obszaru N2000: PLH220100 Klify Poddębskie. Monitoring jest wymagany: tak. Udział powierzchni w stanie U2: 100%.',
    photos: [],
  },
  overallComment: 'Ocena ogólna U2 przez powierzchnię (punktowe płaty, 0,01 ha); struktura U1 (gatunki charakterystyczne i zaśmiecenie U1), perspektywy nieznane.',
}

export const examples1210: CardExample[] = [{ id: 'orzechowo', label: 'Orzechowo', values: orzechowo }]
