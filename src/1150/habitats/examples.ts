// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Zalewska-Gałosz 2010, rozdz. 1150, pkt 3
// „Przykład wypełnionej karty obserwacji”): Jezioro Bukowo, stanowisko 2, 20.09.2008. Wykonawca zanonimizowany (Jan Kowalski).
// Karta jest sprzed modyfikacji metodyki z 2015 r.:
//  • azot – w karcie azot nieorganiczny (0,56 mg/dm³); progi są te same, więc FV jak w karcie;
//  • pH 6,9 – FV zarówno wg progów z 2010, jak i z 2015;
//  • ramienice – brak (U2), ale od 2015 to wskaźnik pomocniczy; i tak nie zmienia oceny (U1 przez zasilanie i fosfor).
// Powierzchnia: karta podaje tylko 105 ha i U1, bez trendów trzciny i fitolitoralu (to było pierwsze badanie),
// więc trendów nie wymyślamy – pola zostają puste, ocena eksperta U1.
// Współrzędne w karcie są tylko do minut (N 54°21′, E 16°16′) – przepisane jak są.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology1150 } from './methodology'

const COORDS = 'N 54°21′; E 16°16′'

export const bukowo2: CardValues = {
  ...emptyCardValues(methodology1150),
  site: {
    siteName: 'Jezioro Bukowo, stanowisko 2',
    guid: '',
    subtype: '1150-2',
    waterBody: 'Jezioro Bukowo',
    communities: 'Lemnetum minoris, Lemnetum trisulcae, Phragmitetum australis, Potamogetonetum pectinati, Potamogetonetum perfoliati',
    description:
      'Siedlisko znajdujące się na północnym brzegu jeziora Bukowo, około 2 km na SW od miejscowości Dąbki. Siedlisko położone przy kanale (po południowo-zachodniej stronie kanału) łączącym jezioro z morzem – w tym miejscu następuje bezpośredni wpływ wód słonych. Litoral zajęty przez szeroki (około 100–200 m) pas szuwarów trzcinowych. Litoral piaszczysto-mulisty.',
    areaHa: 105,
    protectedAreas: 'Jezioro Bukowo PLH320041',
    coordStart: COORDS,
    coordMiddle: COORDS,
    coordEnd: COORDS,
    transect: '50x30 m, podwodny',
    altitude: '0',
    date: '2008-09-20',
    observer: 'Jan Kowalski',
  },
  releves: [
    {
      coords: COORDS,
      area: 25,
      cover: undefined,
      unit: 'Lemnetum minoris, Lemnetum trisulcae, Phragmitetum communis',
      species: [
        { layer: 'C', name: 'Phragmites australis', abundance: '5' },
        { layer: 'C', name: 'Lemna trisulca', abundance: '1' },
        { layer: 'C', name: 'Lemna minor', abundance: '1' },
      ],
    },
  ],
  indicators: {
    area: { inputs: { reed: '', littoral: '', areaHa: 105 }, value: '105 ha', grade: 'U1' },
    communities: { inputs: { count: 5, list: '' }, value: '5', grade: 'FV' },
    hydrophytes: {
      inputs: {
        transect: [
          { zone: 'A', species: 'Lemna trisulca', plots: 2 },
          { zone: 'B', species: 'Potamogeton pectinatus', plots: 3 },
          { zone: 'B', species: 'Potamogeton perfoliatus', plots: 2 },
        ],
        choice: 'communities',
      },
      value:
        'Obecne, tworzą zbiorowiska. Strefa A (0–0,25 m): Lemna trisulca 20%; strefa B (0,25–0,5 m): Potamogeton pectinatus 30%, Potamogeton perfoliatus 20%; strefa C (0,5–1,0 m): brak roślinności podwodnej',
      grade: 'FV',
    },
    charophytes: { inputs: { choice: 'absent' }, value: 'Brak', grade: 'U2' },
    saltWater: { inputs: { choice: 'sporadic' }, value: 'Sporadyczne', grade: 'U1' },
    secchi: { inputs: { value: 0.5 }, value: '0,5 m', grade: 'FV' },
    nitrogen: { inputs: { value: 0.56, form: 'inorganic' }, value: '0,56 mg N/dm³ (azot nieorganiczny)', grade: 'FV' },
    phosphorus: { inputs: { value: 0.781 }, value: '0,781 mg P/dm³', grade: 'U1' },
    chlorides: { inputs: { value: 831.3 }, value: '831,3 mg Cl/dm³', grade: 'FV' },
    ph: { inputs: { value: 6.9, conductivity: undefined }, value: 'pH 6,9', grade: 'FV' },
  },
  prospects: { value: 'Perspektywy ochrony siedliska nie są najgorsze pod warunkiem zahamowania eutrofizacji.', grade: 'U1' },
  impacts: [
    {
      code: 'F02',
      name: 'Rybołówstwo i zbieranie zasobów wodnych',
      influence: '0',
      intensity: 'L',
      description: 'Rybołówstwo (w karcie z 2008 r.: kod 210, intensywność C, wpływ 0).',
    },
  ],
  threats: [
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)', description: 'Eutrofizacja.' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)', description: 'Ekspansja trzciny pospolitej.' },
  ],
  other: {
    otherValues: '',
    conservation:
      'Wykonywane zabiegi: brak. Propozycje: ograniczanie (koszenie) trzciny pospolitej, zakaz intensywnej gospodarki rybackiej (a zwłaszcza dokarmiania ryb i introdukcji obcych gatunków).',
    notes:
      'Typ stanowiska: badawcze. Typ monitoringu: zintegrowany. Zarządzający terenem: Urząd Morski. Monitoring jest wymagany – siedlisko wrażliwe na zmiany parametrów, tendencje degradacyjne. Azot oznaczono jako azot nieorganiczny (metodyka sprzed 2015 r.). Udział powierzchni w stanie U1: 100%.',
    photos: [],
  },
  overallComment: 'Struktura U1 przez sporadyczne zasilanie wodami słonymi i podwyższony fosfor; perspektywy U1 pod warunkiem zahamowania eutrofizacji.',
}

export const examples1150: CardExample[] = [{ id: 'bukowo-2', label: 'Bukowo 2', values: bukowo2 }]
