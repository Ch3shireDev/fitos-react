// Przykładowe wypełnienia z „Karta obserwacji 7120_AK.docx” (Reptowo 2 i Reptowo IV, 14.07.2025).
// Teksty „wartość lub opis” przepisane z karty; liczby w polach pomiarowych odczytane z tych opisów.
// „<1%” zapisane jako 0,5. Literówka z oryginału („Molina coerulea”) poprawiona na Molinia caerulea.
import type { CardValues, Impact, Threat } from '../types'
import { emptyCardValues } from '../assessment'
import { methodology7120 } from './methodology'

const impacts: Impact[] = [
  {
    code: 'C01.03.02',
    name: 'Mechaniczne pozyskanie torfu',
    influence: '-',
    intensity: 'H',
    description:
      'Aktualne pozyskanie torfu ok. 300 m od granicy obszaru i bieżące odwadnianie części kompleksu torfowiskowego stanowiącego jeden wspólny i powiązany hydrologicznie ekosystem przyczynia się do pogarszania warunków wodnych całego obszaru.',
  },
  {
    code: 'I02',
    name: 'Problematyczne gatunki rodzime',
    influence: '-',
    intensity: 'H',
    description: 'W płacie dominuje Molinia caerulea. Tak silna ekspansja tego gatunku świadczy o przesuszeniu płatu.',
  },
  {
    code: 'J02.01.02',
    name: 'Osuszanie terenów morskich, ujściowych, bagiennych',
    influence: '-',
    intensity: 'H',
    description:
      'Gęsta sieć melioracji odwadniających zarówno na stanowisku, jak i w jego sąsiedztwie przyczynia się do nadmiernego odpływu wód z obszaru torfowiska, pomimo podejmowanych w przeszłości działań ochronnych.',
  },
  {
    code: 'K02.01',
    name: 'Zmiana składu gatunkowego (sukcesja)',
    influence: '-',
    intensity: 'L',
    description: 'Ekspansja drzew i krzewów, obecnie o niewielkim nasileniu.',
  },
  {
    code: 'M01.02',
    name: 'Susze i zmniejszenie opadów',
    influence: '-',
    intensity: 'H',
    description:
      'Coraz częściej występujące długotrwałe okresy susz oraz obniżenie poziomu wód gruntowych są efektem wielkopowierzchniowych zmian w układzie hydrologicznym oraz postępującego ocieplania się klimatu i przyczyniają się do degradacji siedliska.',
  },
]

const threats: Threat[] = [
  {
    code: 'M01.02',
    name: 'Susze i zmniejszenie opadów',
    description:
      'Coraz częściej występujące długotrwałe okresy susz oraz obniżenie poziomu wód gruntowych są efektem wielkopowierzchniowych zmian w układzie hydrologicznym oraz postępującego ocieplania się klimatu i przyczyniają się do degradacji siedliska. Zjawisko prawdopodobnie będzie ulegało nasileniu w kolejnych latach.',
  },
  {
    code: 'J02.01.02',
    name: 'Osuszanie terenów morskich, ujściowych, bagiennych',
    description:
      'W przyszłości sieć rowów melioracyjnych może nadal intensywnie drenować siedlisko, przyczyniając się do jego postępującej degradacji, chyba że zostanie wybudowana odpowiednia sieć zastawek.',
  },
]

const PROSPECTS =
  'Istnieje realna szansa poprawy warunków wodnych i regeneracji siedliska po zablokowaniu nadmiernego odpływu istniejącą siecią melioracyjną.'
const OVERALL =
  'Wynika z ocen nadanych poszczególnym parametrom. Na ocenę ogólną największy wpływ miało obniżenie oceny wskaźnika kardynalnego „Pokrycie i struktura gatunkowa mchów”, co spowodowało nadanie parametrowi „Specyficzna struktura i funkcja” oceny złej (U2).'
const DRAINAGE_TEXT = 'Liczne rowy melioracyjne, w trakcie obserwacji niemal całkowicie pozbawione wody'
const PROTECTED = 'Torfowisko Reptowo PLH320056\nZespół przyrodniczo-krajobrazowy „Torfowisko Reptowo”'

// Karta docx nie zawiera zdjęć fitosocjologicznych, więc przykłady mają ich zero.
const base = () => ({ ...emptyCardValues(methodology7120), releves: [] })

export const reptowo2: CardValues = {
  ...base(),
  site: {
    siteName: 'Reptowo 2',
    guid: '928fb2ad-4ad4-4406-8083-b8ce58f233e1',
    communities: 'Eriophoro vaginati-Sphagnetum recurvii',
    description:
      'Stanowisko obejmuje fragment silnie przesuszonego torfowiska wysokiego, zlokalizowanego na terenie dawnego pola poeksploatacyjnego, na którym wydobycie torfu prowadzono od końca XIX wieku, aż do okresu przedwojennego. W wyniku działalności eksploatacyjnej obszar ten został pocięty gęstą siecią rowów odwadniających. Obecne granice płatu są wyznaczone w oparciu o dawne pola eksploatacyjne. Otwarty charakter torfowiska utrzymywany jest poprzez odkrzaczanie. Kilkanaście lat temu, w wyniku działań ochronnych, polegających na budowie sieci zastawek, zaobserwowano regenerację mszarów. Obecnie jednak siedlisko jest silnie przesuszone, na co wskazuje dominacja trzęślicy modrej Molinia caerulea, silnie wykępionej wełnianki pochwowatej Eriophorum vaginatum oraz niemal całkowity zanik warstwy mszystej.',
    areaHa: 5.91,
    protectedAreas: PROTECTED,
    coordStart: "r45: 53° 23' 19.572'' N 14° 49' 24.887'' E",
    coordMiddle: "r46: 53° 23' 16.908'' N 14° 49' 22.043'' E",
    coordEnd: "r47: 53° 23' 14.568'' N 14° 49' 19.272'' E",
    transect: '200x10 m',
    altitude: '19',
    date: '2025-07-14',
    observer: 'Jan Kowalski',
  },
  indicators: {
    area: { inputs: { trend: 'stable' }, value: 'Nie ulega zmianom', grade: 'FV' },
    characteristic: {
      inputs: {
        species: [
          { name: 'Eriophorum vaginatum', cover: 40 },
          { name: 'Sphagnum fimbriatum', cover: 0.5 },
          { name: 'Sphagnum cuspidatum', cover: 0.5 },
          { name: 'Sphagnum fallax', cover: 1 },
        ],
      },
      value: 'Eriophorum vaginatum 40%, Sphagnum fimbriatum <1%, Sphagnum cuspidatum <1%, Sphagnum fallax 1%',
      grade: 'U1',
    },
    dominant: {
      inputs: {
        species: [
          { name: 'Molinia caerulea', cover: 55 },
          { name: 'Eriophorum vaginatum', cover: 40 },
        ],
      },
      value: 'Molinia caerulea 55%, Eriophorum vaginatum 40%',
      grade: 'U1',
    },
    mosses: {
      inputs: { mossCover: 2, hummockShare: 0 },
      value: 'Sphagnum fallax 1%, Sphagnum fimbriatum <1%, Sphagnum cuspidatum <1%',
      grade: 'U2',
    },
    invasive: { inputs: { cover: 0 }, value: 'Brak', grade: 'FV' },
    expansive: { inputs: { species: [{ name: 'Molinia caerulea', cover: 55 }] }, value: 'Molinia caerulea 55%', grade: 'U1' },
    woody: {
      inputs: {
        cover: 1,
        species: [
          { name: 'Betula pendula', cover: 1 },
          { name: 'Betula pubescens', cover: 0.5 },
          { name: 'Pinus sylvestris', cover: 0.5 },
          { name: 'Frangula alnus', cover: 0.5 },
        ],
      },
      value:
        'Ogólne pokrycie drzew i krzewów 1% – Betula pendula 1%, Betula pubescens <1%, Pinus sylvestris <1%, Frangula alnus <1%',
      grade: 'FV',
    },
    wellDeveloped: { inputs: { share: 0, species: [] }, value: '0%', grade: 'U2' },
    hydration: {
      inputs: {},
      value: 'Więcej niż 40 cm poniżej powierzchni gruntu. Bardzo przesuszone',
      grade: 'U2',
    },
    peat: { inputs: { timing: 'old', method: '' }, value: 'Aktualnie brak', grade: 'U1' },
    drainage: { inputs: { state: 'strong' }, value: DRAINAGE_TEXT, grade: 'U2' },
  },
  prospects: { value: PROSPECTS, grade: 'U1' },
  impacts,
  threats,
  other: {
    otherValues: 'Nie stwierdzono',
    conservation:
      'Torfowisko jest odkrzaczane, co powoduje utrzymanie jego otwartego charakteru.\nW latach 2004-2007 w ramach projektu ochrony torfowisk bałtyckich wykonano kilkadziesiąt progów hamujących odpływ wody z powierzchni całego kompleksu torfowiskowego. Na niewielkiej powierzchni usunięto naloty drzew. Działania okazały się bardzo skuteczne, bowiem spowodowały dynamiczny rozwój mszarów, co potwierdził wykonany w roku 2013 monitoring siedliska. W roku 2016 w ramach monitoringu zaobserwowano silny spadek poziomu wód, zanikanie torfowców i ekspansję gatunków charakterystycznych dla siedlisk innych niż torfowiska. W roku 2020 i 2025 odnotowano dalsze pogłębiające się niekorzystne zmiany. Między rokiem 2020 a 2025 odnotowano znaczący spadek udziału torfowców na transekcie – z 15% do 1%. Wycofywanie się torfowców jest zaawansowanym sygnałem degradacji siedliska.',
    notes: '',
    photos: [{ caption: 'Fot. 1. Widok ogólny na stanowisko 7120 Reptowo 2 (fot. J. Kowalski)' }],
  },
  overallComment: OVERALL,
}

export const reptowoIV: CardValues = {
  ...base(),
  site: {
    siteName: 'Reptowo IV',
    guid: '6ee14492-f7ed-4183-a629-784170983371',
    communities: 'Eriophoro vaginati-Sphagnetum recurvii',
    description:
      'Stanowisko obejmuje centralną część zdegradowanego torfowiska wysokiego typu bałtyckiego, zlokalizowanego na terenie dawnego pola poeksploatacyjnego, gdzie wydobycie torfu prowadzono od końca XIX wieku, aż do okresu przedwojennego. W wyniku działalności eksploatacyjnej obszar ten został pocięty gęstą siecią rowów odwadniających, z których większość nadal funkcjonuje. Obecne granice płatu są wyznaczone w oparciu o dawne pola eksploatacyjne. W przeszłości stanowisko pokryte było borem bagiennym, którego zamieranie nastąpiło w wyniku czasowego podniesienia poziomu wód gruntowych, spowodowanego budową zastawek mających na celu poprawę warunków hydrologicznych. O przemianach tych świadczą licznie występujące martwe, stojące drzewa. Od około dziesięciu lat obserwuje się ponowną sukcesję roślinności leśnej, będącą rezultatem stopniowego obniżania się poziomu wód gruntowych.',
    areaHa: 5.49,
    protectedAreas: PROTECTED,
    coordStart: 'r10: 53° 22\' 58,542" N 14° 49\' 58,594" E',
    coordMiddle: 'r11: 53° 22\' 56,958" N 14° 50\' 4,622" E',
    coordEnd: 'r12: 53° 22\' 54,922" N 14° 50\' 10,328" E',
    transect: '200x10 m',
    altitude: '19',
    date: '2025-07-14',
    observer: 'Jan Kowalski',
  },
  indicators: {
    area: { inputs: { trend: 'stable' }, value: 'Nie ulega zmianom', grade: 'FV' },
    characteristic: {
      inputs: {
        species: [
          { name: 'Eriophorum vaginatum', cover: 10 },
          { name: 'Sphagnum fallax', cover: 1 },
        ],
      },
      value: 'Eriophorum vaginatum 10%, Sphagnum fallax 1%',
      grade: 'U1',
    },
    dominant: {
      inputs: {
        species: [
          { name: 'Molinia caerulea', cover: 70 },
          { name: 'Eriophorum vaginatum', cover: 10 },
        ],
      },
      value: 'Molinia caerulea 70%, Eriophorum vaginatum 10%',
      grade: 'U2',
    },
    mosses: {
      inputs: { mossCover: 3, hummockShare: 0 },
      value: 'Sphagnum fallax 1%, Pleurozium schreberi 1%, Pseudoscleropodium purum 1%',
      grade: 'U2',
    },
    invasive: { inputs: { cover: 0 }, value: 'Brak', grade: 'FV' },
    expansive: { inputs: { species: [{ name: 'Molinia caerulea', cover: 70 }] }, value: 'Molinia caerulea 70%', grade: 'U1' },
    woody: {
      inputs: {
        cover: 25,
        species: [
          { name: 'Betula pendula', cover: 15 },
          { name: 'Betula pubescens', cover: 10 },
          { name: 'Pinus sylvestris', cover: 0.5 },
          { name: 'Frangula alnus', cover: 0.5 },
        ],
      },
      value:
        'Ogólne pokrycie drzew i krzewów 25% – Betula pendula 15%, Betula pubescens 10%, Pinus sylvestris <1%, Frangula alnus <1%',
      grade: 'U1',
    },
    wellDeveloped: { inputs: { share: 0, species: [] }, value: '0%', grade: 'U2' },
    hydration: {
      inputs: {},
      value: 'Około 20 - 40 cm poniżej powierzchni gruntu. Bardzo przesuszone',
      grade: 'U1',
    },
    peat: { inputs: { timing: 'old', method: '' }, value: 'Aktualnie brak', grade: 'FV' },
    drainage: { inputs: { state: 'strong' }, value: DRAINAGE_TEXT, grade: 'U2' },
  },
  prospects: { value: PROSPECTS, grade: 'U1' },
  impacts,
  threats,
  other: {
    otherValues: 'Nie stwierdzono',
    conservation:
      'W latach 2004-2007 w ramach projektu ochrony torfowisk bałtyckich wykonano kilkadziesiąt progów hamujących odpływ wody z powierzchni całego kompleksu torfowiskowego. Na niewielkiej powierzchni usunięto naloty drzew. Działania okazały się bardzo skuteczne, bowiem spowodowały dynamiczny rozwój mszarów co potwierdził wykonany w roku 2013 monitoring siedliska. W roku 2016 w ramach monitoringu zaobserwowano silny spadek poziomu wód, zanikanie torfowców i ekspansję gatunków charakterystycznych dla siedlisk innych niż torfowiska. W roku 2020 i 2025 odnotowano dalsze pogłębiające się niekorzystne zmiany.',
    notes: '',
    photos: [{ caption: 'Fot. 1. Widok ogólny na stanowisko 7120 Reptowo IV (fot. J. Kowalski)' }],
  },
  overallComment: OVERALL,
}

export const examples7120 = [
  { id: 'reptowo-2', label: 'Reptowo 2', values: reptowo2 },
  { id: 'reptowo-iv', label: 'Reptowo IV', values: reptowoIV },
]
