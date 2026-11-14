// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Wilk-Woźniak, Gąbka i in. 2012, rozdz. 3160, pkt 3
// „Przykład wypełnionej karty obserwacji”): Jezioro Kuźniczek, rez. „Kuźnik”, 12.08.2011. Wykonawca zanonimizowany
// (Jan Kowalski), bez dodatkowych koordynatorów.
//  • Karta nie ma wiersza HDI (w 2011 r. DOC/DIC nie oznaczano) – stąd „Oznaczenie DOC/DIC: Nie”, HDI = XX poza oceną.
//  • Przezroczystość 2,1 m przy głębokości maksymalnej 2,1 m – do dna, FV.
//  • Plankton FV mimo Gonyostomum semen wśród dominantów – tak jest w karcie (patrz pomoc wskaźnika).
//  • Współrzędne w karcie są wykropkowane („16°44′…″E”) – przepisane jak są.
//  • Kody oddziaływań przepisane na słownik 2011: 160 → B02, 164 → B02.02, 501 → D01.01; intensywność A → H, wpływ 0.
//  • „Peridinium incospicuum” z karty poprawione na P. inconspicuum.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology3160 } from './methodology'

export const kuzniczek: CardValues = {
  ...emptyCardValues(methodology3160),
  site: {
    siteName: 'Jezioro Kuźniczek',
    guid: '',
    siteType: 'badawcze',
    lakeType: 'macrophyte',
    maxDepth: 2.1,
    hdiMeasured: 'no',
    communities: 'Potametum natantis, Sphagnetum cuspidato-obesi',
    description:
      'Jezioro Kuźniczek położone jest na terenie Nadleśnictwa Zdrojowa Góra (obręb Zdrojowa Góra, oddział 192), na terenie rezerwatu przyrody „Kuźnik”; miasto i powiat Piła, województwo wielkopolskie. Powierzchnia jeziora wynosi 0,032 ha, głębokość maksymalna 2,1 m. Jest to niewielki naturalny zbiornik zaawansowany w zarastaniu i wypłycaniu, położony centralnie w obrębie torfowiska mszarnego (pow. torfowisk ok. 0,5 ha). Jezioro ma charakter mezotroficznego, silnie kwaśnego zbiornika wodnego typu „suchar” z torfowiskami otaczającymi koncentrycznie jezioro w postaci pływającego pła (szerokość pła od 15 m do około 30 m). Jezioro jest zdominowane przez zbiorowiska rdestnicy pływającej i podwodnych torfowców. Zbiornik wypełniony jest silnie uwodnionymi osadami organicznymi o charakterze gytii detrytusowych ciemnobrunatnych, silnie kwaśnych. W zlewni bezpośredniej jeziora dominują lasy z przewagą sosny, kwaśne dąbrowy i lasy bagienne.',
    areaHa: 0.032,
    protectedAreas: 'Obszar Natura 2000 – PLH300045 „Ostoja Pilska”, PLB300012 „Puszcza nad Gwdą”, rezerwat przyrody „Kuźnik”',
    manager: 'Nadleśnictwo Zdrojowa Góra',
    coordStart: '16°44′…″E – 53°11′…″N',
    coordMiddle: '16°44′…″E – 53°11′…″N',
    coordEnd: '16°44′…″E – 53°11′…″N',
    transect: '5x30 m',
    altitude: '62',
    areaName: 'PLH300045 Ostoja Pilska',
    date: '2011-08-12',
    observer: 'Jan Kowalski',
  },
  releves: [],
  indicators: {
    area: { inputs: { choice: 'stable', changePct: undefined }, value: 'Nie podlega zmianom większym niż 10% lub zwiększa się', grade: 'FV' },
    characteristic: {
      inputs: {
        species: [
          { species: 'Potamogeton natans', share: '<60%' },
          { species: 'Sphagnum cuspidatum', share: '<5%' },
          { species: 'Nymphaea alba', share: '<5%' },
          { species: 'Utricularia minor', share: '<15%' },
          { species: 'Utricularia vulgaris', share: '<5%' },
        ],
        choice: 'stable',
      },
      value: 'Potamogeton natans <60%, Sphagnum cuspidatum <5%, Nymphaea alba <5%, Utricularia minor <15%, Utricularia vulgaris <5%',
      grade: 'FV',
    },
    expansive: { inputs: { value: 0, species: '' }, value: 'Brak', grade: 'FV' },
    invasive: { inputs: { choice: 'none', species: '' }, value: 'Brak', grade: 'FV' },
    colour: { inputs: { value: 26, visual: '' }, value: '26 mg Pt/dm³', grade: 'FV' },
    ph: { inputs: { value: 4.9, previous: undefined, change: '' }, value: 'pH 4,9', grade: 'FV' },
    conductivity: { inputs: { value: 19, previous: undefined, change: '' }, value: '19 µS/cm', grade: 'FV' },
    drainage: { inputs: { choice: 'none', ditches: undefined, connected: '' }, value: 'Brak', grade: 'FV' },
    hdi: { inputs: { doc: undefined, dic: undefined, hdi: undefined }, value: 'Nie oznaczono (brak DOC/DIC)', grade: 'XX' },
    secchi: { inputs: { value: 2.1, toBottom: '', previous: undefined, change: '' }, value: '2,1 m (do dna)', grade: 'FV' },
    plankton: {
      inputs: {
        choice: 'dystrophic',
        dominants:
          'Gonyostomum semen, Peridinium inconspicuum, Ankistrodesmus falcatus, Peridinium bipes f. oculatum, Lepocinclis acus, Dinobryon sociale, drobne zielenice kokalne',
      },
      value:
        'Gatunki dominujące: Gonyostomum semen, Peridinium inconspicuum, Ankistrodesmus falcatus, Peridinium bipes f. oculatum, Lepocinclis acus, Dinobryon sociale, drobne zielenice kokalne',
      grade: 'FV',
    },
    tds: { inputs: { value: 19.6, previous: undefined, change: '' }, value: '19,6 mg/dm³', grade: 'FV' },
  },
  prospects: {
    value:
      'Jezioro we właściwym wzorcowym stanie, zdominowanym przez makrofity. Torfowiska bez objawów degeneracji i przesuszenia. Poziom wody gruntowej w centralnej części południowego mszaru – 2 cm (DWT). W części zachodniej silny rozwój trzciny.',
    grade: 'FV',
  },
  impacts: [
    { code: 'B02', name: 'Gospodarka leśna – ogólnie', influence: '0', intensity: 'H', description: 'W karcie z 2011 r.: kod 160, intensywność A, wpływ 0.' },
    { code: 'B02.02', name: 'Wycinka lasu', influence: '0', intensity: 'H', description: 'W karcie z 2011 r.: kod 164, intensywność A, wpływ 0.' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe', influence: '0', intensity: 'H', description: 'W karcie z 2011 r.: kod 501, intensywność A, wpływ 0.' },
  ],
  threats: [
    {
      code: 'K02.01',
      name: 'Zmiana składu gatunkowego (sukcesja)',
      description: 'Nie stwierdzono bezpośrednich zagrożeń, poza naturalnymi procesami związanymi z zarastaniem i wypłycaniem.',
    },
  ],
  other: {
    otherValues:
      'Obecność rzadkich i bardzo rzadkich w skali kraju gatunków roślin w obrębie lustra wody jeziora: Utricularia minor, Utricularia vulgaris, Nymphaea alba (Nymphaea × borealis?) i Sphagnum cuspidatum. W strefie torfowiskowej obecność rzadkich zbiorowisk, np. Sphagno apiculati-Caricetum rostratae, Caricetum limosae i licznych gatunków chronionych oraz zagrożonych, np. Carex limosa, Andromeda polifolia, Scheuchzeria palustris, Menyanthes trifoliata, Drosera rotundifolia, Ledum palustre, Lycopodium annotinum i Sphagnum spp.',
    conservation:
      'Wykonywane: działania ochronne zgodnie z operatem rezerwatu, m.in. usuwanie obcych gatunków drzew i krzewów. Propozycje: w obecnym stanie nie ma potrzeby prowadzenia czynnych działań ochronnych. Jezioro zostało wyłączone z użytkowania rybackiego i wędkarskiego.',
    notes:
      'Typ monitoringu: zintegrowany. Monitoring jest wymagany: tak – objęte stałym monitoringiem naukowym; powinno znaleźć się w grupie obiektów referencyjnych dla dystroficznych jezior Polski. W otoczeniu jeziora widoczne pozytywne oddziaływanie bobrów. HDI w 2011 r. nie był oznaczany (brak DOC/DIC). Udział powierzchni siedliska w stanie FV: 100%.',
    photos: [],
  },
  overallComment: 'Jezioro we właściwym, wzorcowym stanie, zdominowane przez makrofity; wszystkie oceniane wskaźniki FV. Udział powierzchni siedliska w stanie FV: 100%.',
}

export const examples3160: CardExample[] = [{ id: 'kuzniczek', label: 'Jezioro Kuźniczek', values: kuzniczek }]
