// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Szoszkiewicz, Gebler 2012, rozdz. 3260, pkt 3
// „Przykład wypełnionej karty obserwacji”): Kanał Miejski – Sławno, 16.07.2011. Wykonawca zanonimizowany (Jan Kowalski).
//  • Współrzędne w przewodniku są ucięte („N 54° 21’ ...’’”) – przepisane do minut.
//  • Wartości wskaźników przepisane z karty dosłownie (także „Ranunculus fluitans” i „Veronica anagalis-aquatica”);
//    pola pomiarowe wypełnione tak, by podpowiedzi wyszły jak oceny w karcie.
//  • Stan ekologiczny: karta podaje MIR = 47,1 i „stan dobry” – to II klasa.
//  • Zacienienie: karta podaje tylko wynik (17%), bez danych RHS – wpisany wprost.
//  • Kod oddziaływania 400 (słownik 2010) → E01 (słownik 2011), intensywność A → H; stary zapis w opisie.
//  • Ocena ogólna: karta ma U1 (reguła przewodnika 2012), formularz liczy U2 („najgorszy decyduje”, od 2016 r.) –
//    patrz specyfikacja. Struktura i funkcje wychodzą U1, jak w karcie.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology3260 } from './methodology'

const COORDS = 'N 54°21′ – E 16°40′'

export const slawno: CardValues = {
  ...emptyCardValues(methodology3260),
  site: {
    river: 'Kanał Miejski',
    siteName: 'Sławno',
    guid: '',
    protectedAreas: 'Brak',
    manager: 'RZGW w Gdańsku, Okręg PZW w Koszalinie',
    coordStart: COORDS,
    coordMiddle: COORDS,
    coordEnd: COORDS,
    altitude: '19–20',
    description: 'Głębokość maks. 1,0 m, środek odcinka makrofitowego zlokalizowany na moście',
    communities: 'Zbiorowisko ze związku Ranunculion fluitantis',
    patches: 'Włosieniczniki występują na 200 m odcinku rzeki umocnionym narzutem kamiennym',
    transect: '8x500 m',
    date: '2011-07-16',
    observer: 'Jan Kowalski',
  },
  releves: [
    {
      coords: COORDS,
      altitude: 19,
      area: 20,
      unit: 'Zbiorowisko ze związku Ranunculion fluitantis',
      species: [
        { layer: 'C', name: 'Batrachium fluitans', abundance: '5' },
        { layer: 'C', name: 'Callitriche cophocarpa', abundance: '1' },
        { layer: 'C', name: 'Elodea canadensis', abundance: '+' },
        { layer: 'C', name: 'Berula erecta', abundance: 'r' },
      ],
    },
  ],
  indicators: {
    area: {
      inputs: { cover: '', note: 'Dobrze wykształcone zbiorowisko włosienicznika rzecznego (Ranunculion fluitantis)' },
      value: 'Dobrze wykształcone zbiorowisko włosienicznika rzecznego (Ranunculion fluitantis)',
      grade: 'FV',
    },
    batrachium: {
      inputs: { rows: [{ species: 'Batrachium fluitans', name: '', mmor: '6' }], none: '' },
      value: 'Ranunculus fluitans – 6',
      grade: 'FV',
    },
    characteristic: {
      inputs: {
        rows: [
          { species: 'Callitriche cophocarpa', name: '', mmor: '3' },
          { species: 'Fontinalis antipyretica', name: '', mmor: '2' },
          { species: 'other', name: 'Berula erecta', mmor: '1' },
          { species: 'other', name: 'Veronica anagallis-aquatica', mmor: '1' },
        ],
        none: '',
      },
      value: 'Callitriche cophocarpa – 3, Fontinalis antipyretica – 2, Berula erecta – 1, Veronica anagalis-aquatica – 1',
      grade: 'FV',
    },
    substrate: {
      inputs: { stones: undefined, gravel: 30, riprap: 10, sand: 60, mud: undefined, otherBed: undefined },
      value: 'Piasek – 60%, kamyki lub/i żwir – 30%; narzut kamienny – 10%',
      grade: 'FV',
    },
    ecoStatus: { inputs: { ecoClass: '2', mir: 47.1 }, value: 'Wartość wskaźnika MIR = 47,1 – stan ekologiczny dobry', grade: 'FV' },
    elodea: { inputs: { mmor: '2' }, value: '2', grade: 'FV' },
    flow: {
      inputs: { broken: undefined, unbroken: 10, rippled: 18, smooth: 72, none: undefined, otherFlow: undefined },
      value: 'Rwący – 10%, wartki – 18%, gładki – 72%',
      grade: 'U1',
    },
    impoundment: { inputs: { choice: 'none' }, value: 'Brak', grade: 'FV' },
    hqa: { inputs: { value: 35 }, value: 'Wartość wskaźnika HQA = 35', grade: 'U1' },
    hms: { inputs: { value: 55 }, value: 'Wartość wskaźnika HMS = 55', grade: 'U2' },
    morphology: { inputs: { rows: [], none: 'yes' }, value: 'Brak', grade: 'U2' },
    shade: { inputs: { treesLeft: '', treesRight: '', shading: '', percent: 17 }, value: '17%', grade: 'FV' },
    aliens: {
      inputs: {
        rows: [
          { species: 'Echinocystis lobata', name: '', abundance: 'present' },
          { species: 'Reynoutria japonica', name: '', abundance: 'present' },
          { species: 'Impatiens parviflora', name: '', abundance: 'present' },
        ],
        none: '',
      },
      value: 'Echinocystis lobata, Reynoutria japonica, Impatiens parviflora – mało liczne',
      grade: 'U1',
    },
    sewage: { inputs: { choice: 'no' }, value: 'Nie', grade: 'FV' },
  },
  prospects: { value: 'Stanowisko znajduje się w centrum miasta, poza obszarami chronionymi', grade: 'U2' },
  impacts: [
    {
      code: 'E01',
      name: 'Tereny zurbanizowane, tereny zamieszkane',
      influence: '-',
      intensity: 'H',
      description: 'Stanowisko badawcze znajduje się w centrum miasta (w karcie z 2011 r.: kod 400 „Tereny zurbanizowane”, intensywność A, wpływ –).',
    },
  ],
  threats: [],
  other: {
    ...emptyCardValues(methodology3260).other,
    notes: 'Data wypełnienia karty: 16.07.2011. Ocena ogólna w karcie z przewodnika: U1 (reguła z 2012 r.); od 2016 r. obowiązuje „najgorszy decyduje”, stąd U2.',
  },
  overallComment:
    'Powierzchnia FV (bujny włosienicznik rzeczny), struktura U1 (HMS 55 i brak naturalnych elementów morfologicznych – U2, przepływy, HQA i gatunki inwazyjne – U1), perspektywy U2 (centrum miasta, poza obszarami chronionymi).',
}

export const examples3260: CardExample[] = [{ id: 'slawno', label: 'Kanał Miejski – Sławno', values: slawno }]
