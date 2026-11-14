// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Wilk-Woźniak i in. 2012, rozdz. 3150, pkt 3
// „Przykład wypełnionej karty obserwacji”): starorzecze Pilicy Brzeg I, 13.06.2011. Wykonawca zanonimizowany
// (Jan Kowalski), koordynatorów z raportu rocznego nie przepisujemy.
// Oceny jak w karcie: powierzchnia FV, struktura FV, perspektywy FV, ogólna FV. Rozbieżności z przewodnikiem:
//  • plankton: karta ma dwa wiersze (fitoplankton U1, zooplankton U1), formularz – jeden wskaźnik „Fito- i zooplankton”
//    (tab. 1: łączna ocena, gorsza z dwóch) → U1. Fitoplankton z dominacją okrzemek wg tab. 2 to FV („dominacja innych
//    grup z wyjątkiem sinic”) – karta dała U1 (pewnie przez obecność Microcystis). Łączny wynik i tak U1 przez zooplankton
//    (5% gatunków eutroficznych = „od 5 do 50%”), więc ocena wskaźnika jest jak w karcie;
//  • data 13.06.2011 – przed oknem metodyki (lipiec–połowa września): formularz ostrzega, nie blokuje;
//  • przezroczystość „1,0 m, widzialność do dna” – w formularzu „1 m, widzialność do dna” (zapis liczby);
//  • kody oddziaływań przepisane ze słownika 2009 na słownik 2011: 424 → E03.04, 502 → D01.02, 952 → K02.03;
//    intensywność A → H (silna);
//  • karta nie ma zdjęć fitosocjologicznych – lista zdjęć pusta.
// Współrzędne w przewodniku są z wykropkowanymi sekundami – przepisane jak są.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology3150 } from './methodology'

const COORD = '20° 23′ …″E – 51° 35′ …″N'

export const brzeg1: CardValues = {
  ...emptyCardValues(methodology3150),
  site: {
    siteName: 'Brzeg I',
    guid: '',
    subtype: '3150-2',
    waterBody: 'Starorzecze Pilicy koło Brzegu',
    communities:
      'Ceratophylletum demersi, Hydrocharitetum morsus-ranae, Lemno-Spirodeletum polyrrhizae, Lemnetum trisulcae, Nymphaeo albae-Nupharetum luteae',
    description:
      'Starorzecze rzeki Pilicy (ok. 400 m od rzeki) położone na zachód od miejscowości Brzeg. Starorzecze otoczone drzewami i krzewami, od strony południowej brak ols. Brak typowego szuwaru, rośliny szuwarowe rosną w kępach. Obecne: kosaciec żółty Iris pseudacorus, turzyca Carex sp., manna wodna Glyceria maxima i tylko ta ostatnia tworzy większe płaty.',
    areaHa: 0.1,
    protectedAreas: 'Obszar Natura 2000: PLH140016 Dolina Dolnej Pilicy, PLB140003 Dolina Pilicy\nSpalski Park Krajobrazowy',
    manager: 'Wojewoda Łódzki',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '10x100 m',
    altitude: '137',
    date: '2011-06-13',
    observer: 'Jan Kowalski',
  },
  releves: [],
  indicators: {
    area: { inputs: { choice: 'stable', areaHa: undefined }, value: 'Nie uległa zmianom albo się zwiększa', grade: 'FV' },
    combination: {
      inputs: { nymphaeids: 'yes', elodeids: 'yes', pleustoCover: 40, ceratoShare: undefined, fragmentary: '', rare: '', species: [] },
      value: 'Obecne nymfeidy i elodeidy. Pleustofity pokrywają ok. 40% powierzchni lustra wody',
      grade: 'FV',
    },
    degeneration: { inputs: { species: [], abundance: '' }, value: 'Brak', grade: 'FV' },
    conductivity: { inputs: { value: 433 }, value: '433 µS/cm', grade: 'FV' },
    secchi: { inputs: { value: 1, toBottom: 'yes', maxDepth: undefined }, value: '1 m, widzialność do dna', grade: 'FV' },
    colour: { inputs: { choice: 'fv', note: 'Woda słabo przezroczysta' }, value: 'Woda słabo przezroczysta', grade: 'FV' },
    ph: { inputs: { value: 7.7 }, value: '7,7 pH', grade: 'FV' },
    plankton: {
      inputs: {
        phyto: 'other',
        phytoNote: 'Dominacja okrzemek (ponad 75%), z 15% udziałem zielenic oraz mniejszym, 5% udziałem sinic (Microcystis)',
        zooEutrophic: 5,
        zooNote:
          'Dominacja wrotków nad skorupiakami (Rotifera 70%, Crustacea 30%). Niski stopień zróżnicowania taksonomicznego w obu grupach zooplanktonu. Niewielki udział gatunków eutroficznych wśród planktonu zwierzęcego (5%). Pojedynczo występujące duże wioślarki z rodzaju Daphnia',
      },
      value:
        'Fitoplankton: Dominacja okrzemek (ponad 75%), z 15% udziałem zielenic oraz mniejszym, 5% udziałem sinic (Microcystis); zooplankton: Dominacja wrotków nad skorupiakami (Rotifera 70%, Crustacea 30%). Niski stopień zróżnicowania taksonomicznego w obu grupach zooplanktonu. Niewielki udział gatunków eutroficznych wśród planktonu zwierzęcego (5%). Pojedynczo występujące duże wioślarki z rodzaju Daphnia',
      grade: 'U1',
    },
  },
  prospects: {
    value: 'Perspektywy ochrony dobre – starorzecze w obszarze Natura 2000 i w parku krajobrazowym (karta z przewodnika nie zawiera opisu).',
    grade: 'FV',
  },
  impacts: [
    { code: 'E03.04', name: 'Inne odpady', influence: '-', intensity: 'H', description: 'Zbiornik zaśmiecony – plastikowe butelki, pojemniki (w karcie z 2011 r.: kod 424, intensywność A).' },
    { code: 'D01.02', name: 'Drogi, autostrady', influence: '-', intensity: 'H', description: 'W karcie z 2011 r.: kod 502, intensywność A.' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)', influence: '-', intensity: 'H', description: 'W karcie z 2011 r.: kod 952, intensywność A.' },
  ],
  threats: [
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)', description: 'Eutrofizacja.' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja', description: 'Zarastanie.' },
  ],
  other: {
    otherValues: 'Występowanie jednego z gatunków charakterystycznych dla siedliska przyrodniczego 3150 – grążel żółty Nuphar lutea.',
    conservation:
      'Wykonywane działania: zbiornik położony na terenie obszaru Natura 2000 i Spalskiego Parku Krajobrazowego. Propozycje: sprzątanie starorzecza, zwrócenie uwagi potencjalnym użytkownikom na wartość siedliska i konieczność dbania o dobry stan zarówno samego siedliska, jak i jego otoczenia.',
    notes:
      'Typ stanowiska: badawcze. Typ monitoringu: zintegrowany. Monitoring jest wymagany – konieczność monitorowania siedliska, jakim są starorzecza, ze względu na szczególną podatność na eutrofizację i zarastanie. Wysokość n.p.m.: minimalna i maksymalna 137 m. Nazwa obszaru: PLH140016 Dolina Dolnej Pilicy. Udział powierzchni w stanie FV: 100%.',
    photos: [],
  },
  overallComment: 'Wszystkie wskaźniki kardynalne FV; plankton (wskaźnik pomocniczy) U1 nie obniża oceny struktury.',
}

export const examples3150: CardExample[] = [{ id: 'brzeg-1', label: 'Brzeg I', values: brzeg1 }]
