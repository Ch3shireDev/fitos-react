// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Wilk-Woźniak i in. 2012, rozdz. 3110, pkt 3
// „Przykład wypełnionej karty obserwacji”): Jezioro Chlewo, 09.2009. Wykonawca zanonimizowany (Jan Kowalski).
// Rozbieżności z kartą papierową (wszystkie opisane w specyfikacji):
//  • data – karta podaje tylko „09.2009”; formularz wymaga dnia, wpisano 01.09.2009;
//  • fito- i zooplankton – w karcie dwa wiersze (FV i U1); tu jeden wskaźnik pomocniczy z niższą oceną (U1),
//    jak każe tab. 1 – na ocenę struktury i tak nie wpływa;
//  • kody oddziaływań przepisane ze słownika 2009 na słownik 2011 (251 → F04.01, 600 → G02), intensywność B → M, C → L;
//  • barwa – literówka „Woda o przezroczysta” poprawiona, opis i mg Pt/dm³ złożone w jedno zdanie;
//  • współrzędne są w karcie obcięte („16°40′…″E, 53°56′…″N”) – przepisane jak są.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology3110 } from './methodology'

const COMMUNITIES = 'Isoeto-Lobelietum littorelletosum; Isoeto-Lobelietum isoetosum; zb. z Drepanocladus tenuinervis'

export const chlewo: CardValues = {
  ...emptyCardValues(methodology3110),
  site: {
    siteName: 'Jezioro Chlewo',
    guid: '',
    subtype: '',
    communities: 'Isoeto-Lobelietum littorelletosum; Isoeto-Lobelietum isoetosum (syn. Isoetetum lacustris); zb. z Drepanocladus tenuinervis',
    description:
      'Duże jezioro lobeliowe (pow. 54,9 ha) wyraźnie rozdzielone na dwa plosa. Linia brzegowa niezbyt urozmaicona. Brzegi jeziora piaszczyste, od strony południowej strome, obecnie gęsto zabudowane domkami rekreacyjnymi ośrodków wypoczynkowych. Strona północna najbliższej zlewni jeziora porośnięta lasem liściastym i w mniejszym stopniu iglastym. Lasy na całym obszarze zlewni jeziora zajmują ponad połowę jej powierzchni. Pozostała część to głównie pola uprawne, użytki zielone i zabudowania. Roślinność charakterystyczna dla jezior lobeliowych występuje obficie, w szczególności na płyciznach oraz na łagodnie opadających stokach dna. Do głębokości 100 cm największy udział ma Lobelia dortmanna i Littorella uniflora. W jeziorze tym poryblin (Isoëtes lacustris) zajmuje przedział głębokości od 100 do 300 cm, a zwarcie poryblinu przekracza często 60%. Do głębokości 4–4,5 m występuje mech Drepanocladus tenuinervis. W jeziorze Chlewo widoczne są symptomy eutrofizacji. Przejawiają się one w postaci obecności glonów nitkowatych na roślinności podwodnej. Należałoby więc poddać ocenie gospodarkę ściekową zabudowy rekreacyjnej nad brzegami jeziora.',
    areaM2: 900,
    patchAreas:
      'Isoeto-Lobelietum littorelletosum: 150 m²\nIsoeto-Lobelietum isoetosum: 480 m²\nzb. z Drepanocladus tenuinervis: 270 m²',
    protectedAreas: 'PLH320001 Bobolickie Jeziora Lobeliowe',
    coordStart: '16°40′…″E, 53°56′…″N',
    coordEnd: '',
    transect: '30x30 m',
    altitude: '152,3',
    date: '2009-09-01',
    observer: 'Jan Kowalski',
  },
  releves: [],
  indicators: {
    area: { inputs: { change: 'stable', lossPct: undefined }, value: 'Powierzchnia nie uległa zmianom', grade: 'FV' },
    combination: {
      inputs: { list: COMMUNITIES, species: [], choice: 'typical', maxDepth: undefined },
      value: 'Isoeto-Lobelietum littorelletosum, Isoeto-Lobelietum isoetosum, zb. z Drepanocladus tenuinervis',
      grade: 'FV',
    },
    degeneration: { inputs: { species: [], choice: 'absent' }, value: 'Brak', grade: 'FV' },
    colour: {
      inputs: { choice: 'blue', note: 'Woda przezroczysta o niebieskawej barwie', pt: 8 },
      value: 'Woda przezroczysta o niebieskawej barwie. Barwa 8 mg Pt/dm³',
      grade: 'FV',
    },
    ph: { inputs: { value: 6.35 }, value: 'pH 6,35', grade: 'FV' },
    conductivity: { inputs: { value: 60 }, value: '60 µS/cm', grade: 'FV' },
    secchi: { inputs: { value: 5.1, toBottom: '' }, value: '5,1 m', grade: 'FV' },
    plankton: {
      inputs: {
        phyto: 'mixotrophic',
        phytoNote:
          'Brak zakwitu. Pod względem ogólnej liczebności najwyższy udział posiadały zielenice Chlorophyceae (80% ogólnej liczby fitoplanktonu). Kolejną grupą pod względem liczebności były kryptofity (9% ogólnej liczebności).',
        zoo: 'small',
        zooNote:
          'W powierzchniowych strefach toni wodnej zdecydowanie przeważają wrotki (dominacja Keratella cochlearis). W dwukrotnie mniejszej liczebności występują wioślarki (dominacja Diaphanosoma brachyurum).',
      },
      value:
        'Fitoplankton (FV): Brak zakwitu. Pod względem ogólnej liczebności najwyższy udział posiadały zielenice Chlorophyceae (80% ogólnej liczby fitoplanktonu). Kolejną grupą pod względem liczebności były kryptofity (9% ogólnej liczebności). Zooplankton (U1): W powierzchniowych strefach toni wodnej zdecydowanie przeważają wrotki (dominacja Keratella cochlearis). W dwukrotnie mniejszej liczebności występują wioślarki (dominacja Diaphanosoma brachyurum).',
      grade: 'U1',
    },
  },
  prospects: {
    value: 'W karcie z 2009 r. bez opisu, ocena FV. Zagrożenie wskazane w karcie: intensywna zabudowa rekreacyjna na obrzeżach zbiornika.',
    grade: 'FV',
  },
  impacts: [
    {
      code: 'F04.01',
      name: 'Plądrowanie stanowisk roślin',
      influence: '-',
      intensity: 'M',
      description: 'Niszczenie roślinności jezior lobeliowych spowodowane intensywną rekreacją. (W karcie z 2009 r.: kod 251, intensywność B.)',
    },
    {
      code: 'G02',
      name: 'Infrastruktura sportowa i rekreacyjna',
      influence: '-',
      intensity: 'L',
      description: 'Intensywna zabudowa rekreacyjna na obrzeżach zbiornika. (W karcie z 2009 r.: kod 600, intensywność C.)',
    },
  ],
  threats: [{ code: 'G02', name: 'Infrastruktura sportowa i rekreacyjna', description: 'Intensywna zabudowa rekreacyjna na obrzeżach zbiornika.' }],
  other: {
    otherValues: '',
    conservation:
      'Wykonywane działania: brak danych. Propozycje: zakaz zarybiania karpiowatymi i obcymi gatunkami, zakaz zanęcania ryb, zakaz kąpieli poza miejscami wyznaczonymi, uregulowana gospodarka wodno-ściekowa zabudowy rekreacyjnej.',
    notes:
      'Typ stanowiska: badawcze. Typ monitoringu: zintegrowany. Obszar: Bobolickie Jeziora Lobeliowe. Monitoring jest wymagany – tendencje do degradacji. W karcie z 2009 r. fitoplankton (FV) i zooplankton (U1) oceniono w osobnych wierszach. Udział powierzchni w stanie FV: 100%.',
    photos: [],
  },
  overallComment: 'Wszystkie wskaźniki kardynalne FV; zooplankton U1 to wskaźnik pomocniczy i nie obniża oceny struktury.',
}

export const examples3110: CardExample[] = [{ id: 'chlewo', label: 'Jezioro Chlewo', values: chlewo }]
