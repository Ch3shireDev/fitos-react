// Przykładowe wypełnienia z „Karta obserwacji 91D0_AK.docx” (Reptowo XI, VIII i X, 14.07.2025).
// Teksty „wartość lub opis” przepisane z karty, selekty ustawione zgodnie z ocenami z karty.
// „<1%” zapisane jako 0,5. Wykonawca i autor zdjęć zanonimizowani (Jan Kowalski).
// Literówka z oryginału („Vaccicnio”) poprawiona na Vaccinio.
import type { CardValues, Impact, IndicatorValue, Threat } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import { methodology91D0 } from './methodology'

const COMMUNITIES = 'Silnie zdegradowane Vaccinio uliginosi-Pinetum, Vaccinio uliginosi-Betuletum pubescentis'
const PROTECTED = 'Torfowisko Reptowo PLH320056\nZespół przyrodniczo-krajobrazowy „Torfowisko Reptowo”'
const OBSERVER = 'Jan Kowalski'

const DESC_HEAD =
  'Stanowisko obejmuje fragment dużego kompleksu borów bagiennych, zlokalizowanego w obrębie silnie zdegradowanego torfowiska wysokiego, będącego częścią obszaru Natura 2000 Torfowisko Reptowo. Obszar ten był intensywnie eksploatowany w związku z wydobyciem torfu od końca XIX wieku, aż do okresu przedwojennego. W wyniku działalności wydobywczej został pocięty gęstą siecią rowów odwadniających, z których większość nadal funkcjonuje, przyczyniając się do znacznego odwodnienia siedliska. Obecne granice płatu są wyznaczone w oparciu o dawne pola eksploatacyjne. W drzewostanie współdominują sosna zwyczajna Pinus sylvestris i brzoza omszona Betula pubescens.'
const DESC_TAIL =
  'O postępującym przesuszeniu świadczą również zmiany w strukturze warstwy mszystej, której ogólne pokrycie wynosi około 30–40%, ale skład gatunkowy jest typowy raczej dla suchych odmian borów, z dominacją gatunków, takich jak rokietnik pospolity Pleurozium schreberi, brodawkowiec czysty Pseudoscleropodium purum oraz widłoząb kędzierzawy Dicranum polysetum. Udział torfowców jest silnie ograniczony w stosunku do typowego dla siedliska.'
const DESC_XI = `${DESC_HEAD} Typowe dla siedliska krzewinki, takie jak bagno zwyczajne Ledum palustre, występują jedynie pojedynczo. W runie zdecydowanie dominuje borówka czarna Vaccinium myrtillus wraz z trzęślicą modrą Molinia caerulea oraz orlicą pospolitą Pteridium aquilinum, co świadczy o silnym przesuszeniu siedliska, natomiast gatunki charakterystyczne dla boru bagiennego pojawiają się sporadycznie, głównie w rowach melioracyjnych. ${DESC_TAIL}`
const DESC_RUBUS = `${DESC_HEAD} Typowe dla siedliska krzewinki, takie jak bagno zwyczajne Ledum palustre, występują pojedynczo. W runie zdecydowanie dominuje borówka czarna Vaccinium myrtillus wraz z trzęślicą modrą Molinia caerulea oraz gatunkami z rodzaju Rubus, co świadczy o silnym przesuszeniu siedliska, natomiast gatunki charakterystyczne dla boru bagiennego pojawiają się sporadycznie, głównie w rowach melioracyjnych. ${DESC_TAIL}`

const PROSPECTS_BASE =
  'Istnieje szansa poprawy warunków wodnych i regeneracji siedliska po zablokowaniu nadmiernego odpływu istniejącą siecią melioracyjną.'
const PROSPECTS_TAIL =
  'Niemniej jednak, biorąc pod uwagę bardzo wysoki stopień degradacji siedliska, jego regeneracja może być bardzo utrudniona.'
const OVERALL =
  'Wynika z ocen nadanych poszczególnym parametrom. Na ocenę ogólną największy wpływ miało obniżenie ocen wskaźników kardynalnych „Uwodnienie” oraz „Występowanie mchów torfowców”, co spowodowało nadanie parametrowi „Specyficzna struktura i funkcja” oceny złej (U2).'
const CONSERVATION =
  'W latach 2004-2007 w ramach projektu ochrony torfowisk bałtyckich wykonano kilkadziesiąt progów hamujących odpływ wody z powierzchni całego kompleksu torfowiskowego. Działania okazały się bardzo skuteczne, bowiem spowodowały dynamiczny rozwój mszarów, co potwierdził wykonany w roku 2013 monitoring położonego w sąsiedztwie siedliska 7120. W roku 2016 w ramach monitoringu zaobserwowano silny spadek poziomu wód, zanikanie torfowców i ekspansję gatunków charakterystycznych dla siedlisk innych niż torfowiska. W roku 2020 i 2025 odnotowano dalsze pogłębiające się niekorzystne zmiany.'
const SPHAGNUM_TEXT = (list: string) =>
  `Pokrycie i bogactwo gatunkowe mchów zmniejszone w stosunku do naturalnego. Torfowce pokrywają mniej niż 1% powierzchni transektu: warstwa D: ${list}`

const impacts = (problemSpecies: string): Impact[] => [
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
    description: `W płacie dominują gatunki świadczące o przesuszeniu siedliska: ${problemSpecies}.`,
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

/** Wskaźniki identyczne na wszystkich trzech stanowiskach. */
const common: Record<string, IndicatorValue> = {
  area: { inputs: { choice: 'stable' }, value: 'Nie ulega zmianom', grade: 'FV' },
  invasive: { inputs: { species: [] }, value: 'Brak', grade: 'FV' },
  hydration: { inputs: { choice: 'strong' }, value: 'Bardzo silnie przesuszony', grade: 'U2' },
  ecoAlien: { inputs: { species: [] }, value: 'Brak', grade: 'FV' },
  deadWood: { inputs: { choice: 'many' }, value: '>3 szt./ha', grade: 'FV' },
  regeneration: { inputs: { choice: 'abundant' }, value: 'Odnawia się brzoza omszona', grade: 'FV' },
  vertical: { inputs: { choice: 'natural' }, value: 'Naturalna, zróżnicowana struktura', grade: 'FV' },
  logging: { inputs: { choice: 'none' }, value: 'Brak', grade: 'FV' },
  otherDistortions: { inputs: { choice: 'strong' }, value: 'Rowy i potorfia', grade: 'U2' },
  keySpecies: { inputs: { choice: 'noData' }, value: 'Brak danych', grade: 'XX' },
}

const OLD_STAND: IndicatorValue = { inputs: { choice: 'old' }, value: '>20% udział drzew starszych niż 100 lat', grade: 'FV' }
const SPRUCE: IndicatorValue = {
  inputs: { species: [{ name: 'Picea abies', cover: 5 }], regenerating: 'no' },
  value: 'Picea abies 5%',
  grade: 'U1',
}
const NO_DWARF: IndicatorValue = { inputs: { species: [], choice: 'none' }, value: 'Brak', grade: 'U2' }

// Karta docx nie zawiera zdjęć fitosocjologicznych, więc przykłady mają ich zero.
const base = () => ({ ...emptyCardValues(methodology91D0), releves: [] })

const site = (o: { name: string; guid: string; area: number; coords: [string, string, string]; description: string }) => ({
  siteName: o.name,
  guid: o.guid,
  variant: 'pineBog',
  communities: COMMUNITIES,
  description: o.description,
  areaHa: o.area,
  protectedAreas: PROTECTED,
  coordStart: o.coords[0],
  coordMiddle: o.coords[1],
  coordEnd: o.coords[2],
  transect: '200x10 m',
  altitude: '19',
  date: '2025-07-14',
  observer: OBSERVER,
})

const other = (name: string, notes = '') => ({
  otherValues: 'Nie stwierdzono',
  conservation: CONSERVATION,
  notes,
  photos: [{ caption: `Fot. 1. Widok ogólny na stanowisko 91D0 ${name} (fot. J. Kowalski)` }],
})

export const reptowoXI: CardValues = {
  ...base(),
  site: site({
    name: 'Reptowo XI',
    guid: 'ffbdd45e-1361-495a-8466-84c0d3756cac',
    area: 31.19,
    coords: [
      'r32: 53° 23\' 24,931" N 14° 49\' 33,465" E',
      'r33: 53° 23\' 23,434" N 14° 49\' 38,911" E',
      'r34: 53° 23\' 22,288" N 14° 49\' 44,678" E',
    ],
    description: DESC_XI,
  }),
  indicators: {
    ...common,
    characteristic: {
      inputs: {
        species: [
          { name: 'Betula pubescens', cover: 20 },
          { name: 'Ledum palustre', cover: 0.5 },
          { name: 'Eriophorum vaginatum', cover: 0.5 },
          { name: 'Sphagnum fallax', cover: 0.5 },
        ],
      },
      value: 'A: Betula pubescens 20%, C: Ledum palustre <1%, Eriophorum vaginatum <1%, Sphagnum fallax <1%',
      grade: 'U1',
    },
    dominant: {
      inputs: {
        choice: 'foreign',
        species: [
          { name: 'Pinus sylvestris', cover: 45 },
          { name: 'Betula pubescens', cover: 20 },
          { name: 'Betula pendula', cover: 10 },
          { name: 'Vaccinium myrtillus', cover: 40 },
          { name: 'Molinia caerulea', cover: 20 },
          { name: 'Pteridium aquilinum', cover: 10 },
          { name: 'Pleurozium schreberi', cover: 30 },
          { name: 'Pseudoscleropodium purum', cover: 40 },
        ],
      },
      value:
        'A: Pinus sylvestris 45%, Betula pubescens 20%, Betula pendula 10%; warstwa C: Vaccinium myrtillus 40%, Molinia caerulea 20%, Pteridium aquilinum 10%; D: Pleurozium schreberi 30%, Pseudoscleropodium purum 40%',
      grade: 'U2',
    },
    expansive: {
      inputs: {
        species: [
          { name: 'Vaccinium myrtillus', cover: 40 },
          { name: 'Molinia caerulea', cover: 20 },
          { name: 'Pteridium aquilinum', cover: 10 },
        ],
      },
      value: 'Vaccinium myrtillus 40%, Molinia caerulea 20%, Pteridium aquilinum 10%',
      grade: 'U2',
    },
    age: {
      inputs: { choice: 'mid' },
      value: '<20% udział drzew starszych niż 100 lat, ale >50% udział drzew starszych niż 50 lat',
      grade: 'U1',
    },
    geoAlien: { inputs: { species: [] }, value: 'Brak', grade: 'FV' },
    sphagnum: {
      inputs: { choice: 'none', species: [{ name: 'Sphagnum fallax', cover: 0.5 }] },
      value: SPHAGNUM_TEXT('Sphagnum fallax <1%'),
      grade: 'U2',
    },
    dwarfShrubs: {
      inputs: { choice: 'sparse', species: [{ name: 'Ledum palustre', cover: 0.5 }] },
      value: 'warstwa B: Ledum palustre <1%',
      grade: 'U1',
    },
  },
  prospects: { value: `${PROSPECTS_BASE} ${PROSPECTS_TAIL}`, grade: 'U1' },
  impacts: impacts('Vaccinium myrtillus, Pteridium aquilinum, Molinia caerulea'),
  threats,
  other: other('Reptowo XI'),
  overallComment: OVERALL,
}

export const reptowoVIII: CardValues = {
  ...base(),
  site: site({
    name: 'Reptowo VIII',
    guid: '0fdfc09a-bfa8-42c3-bc89-a9469192b4a1',
    area: 37.32,
    coords: [
      'r19: 53° 22\' 44,638" N 14° 50\' 8,440" E',
      'r20: 53° 22\' 42,911" N 14° 50\' 2,350" E',
      'r21: 53° 22\' 41,198" N 14° 49\' 56,756" E',
    ],
    description: DESC_RUBUS,
  }),
  indicators: {
    ...common,
    characteristic: {
      inputs: {
        species: [
          { name: 'Betula pubescens', cover: 20 },
          { name: 'Eriophorum vaginatum', cover: 0.5 },
          { name: 'Sphagnum fallax', cover: 0.5 },
          { name: 'Sphagnum palustre', cover: 0.5 },
          { name: 'Sphagnum fimbriatum', cover: 0.5 },
        ],
      },
      value: 'A: Betula pubescens 20%, C: Eriophorum vaginatum <1%, Sphagnum fallax <1%, Sphagnum palustre <1%, Sphagnum fimbriatum <1%',
      grade: 'U1',
    },
    dominant: {
      inputs: {
        choice: 'foreign',
        species: [
          { name: 'Pinus sylvestris', cover: 45 },
          { name: 'Betula pubescens', cover: 20 },
          { name: 'Vaccinium myrtillus', cover: 40 },
          { name: 'Molinia caerulea', cover: 20 },
          { name: 'Pleurozium schreberi', cover: 10 },
          { name: 'Pseudoscleropodium purum', cover: 10 },
        ],
      },
      value:
        'A: Pinus sylvestris 45%, Betula pubescens 20%, C: Vaccinium myrtillus 40%, Molinia caerulea 20%, D: Pleurozium schreberi 10%, Pseudoscleropodium purum 10%',
      grade: 'U2',
    },
    expansive: {
      inputs: {
        species: [
          { name: 'Vaccinium myrtillus', cover: 40 },
          { name: 'Molinia caerulea', cover: 20 },
          { name: 'Rubus sp.', cover: 5 },
        ],
      },
      value: 'Vaccinium myrtillus 40%, Molinia caerulea 20%, Rubus sp. 5%',
      grade: 'U2',
    },
    age: OLD_STAND,
    geoAlien: SPRUCE,
    sphagnum: {
      inputs: {
        choice: 'none',
        species: [
          { name: 'Sphagnum fallax', cover: 0.5 },
          { name: 'Sphagnum palustre', cover: 0.5 },
          { name: 'Sphagnum fimbriatum', cover: 0.5 },
        ],
      },
      value: SPHAGNUM_TEXT('Sphagnum fallax <1%, Sphagnum palustre <1%, Sphagnum fimbriatum <1%'),
      grade: 'U2',
    },
    dwarfShrubs: NO_DWARF,
  },
  prospects: {
    value: `${PROSPECTS_BASE} Nadleśnictwo planuje wybudowanie sieci zastawek na torfowisku. ${PROSPECTS_TAIL}`,
    grade: 'U1',
  },
  impacts: impacts('Vaccinium myrtillus, Molinia caerulea'),
  threats,
  other: other(
    'Reptowo VIII',
    'W obrębie płatu zlokalizowany jest piezometr. W dniu kontroli, 14 lipca 2025 roku, poziom zwierciadła wody w piezometrze wynosił około 1,5 m poniżej powierzchni gruntu. Taka głębokość wskazuje raczej na warunki siedliskowe typowe dla boru świeżego. Należy jednak zaznaczyć, że był to pomiar jednorazowy, wykonany w okresie niskich stanów wód.',
  ),
  overallComment: OVERALL,
}

export const reptowoX: CardValues = {
  ...base(),
  site: site({
    name: 'Reptowo X',
    guid: 'c52b34f7-6e3d-462b-b28f-dbaff54b7e5b',
    area: 31.95,
    coords: [
      'r26: 53° 22\' 52,977" N 14° 49\' 20,180" E',
      'r27: 53° 22\' 56,485" N 14° 49\' 20,195" E',
      'r28: 53° 22\' 59,866" N 14° 49\' 19,620" E',
    ],
    description: DESC_RUBUS,
  }),
  indicators: {
    ...common,
    characteristic: {
      inputs: {
        species: [
          { name: 'Betula pubescens', cover: 35 },
          { name: 'Sphagnum fallax', cover: 0.5 },
        ],
      },
      value: 'A: Betula pubescens 35%, C: Sphagnum fallax <1%',
      grade: 'U2',
    },
    dominant: {
      inputs: {
        choice: 'foreign',
        species: [
          { name: 'Betula pubescens', cover: 35 },
          { name: 'Pinus sylvestris', cover: 20 },
          { name: 'Vaccinium myrtillus', cover: 60 },
          { name: 'Molinia caerulea', cover: 10 },
        ],
      },
      value: 'A: Betula pubescens 35%, Pinus sylvestris 20%, C: Vaccinium myrtillus 60%, Molinia caerulea 10%',
      grade: 'U2',
    },
    expansive: {
      inputs: {
        species: [
          { name: 'Vaccinium myrtillus', cover: 60 },
          { name: 'Molinia caerulea', cover: 10 },
          { name: 'Rubus sp.', cover: 0.5 },
        ],
      },
      value: 'Vaccinium myrtillus 60%, Molinia caerulea 10%, Rubus sp. <1%',
      grade: 'U2',
    },
    age: OLD_STAND,
    geoAlien: SPRUCE,
    sphagnum: {
      inputs: { choice: 'none', species: [{ name: 'Sphagnum fallax', cover: 0.5 }] },
      value: SPHAGNUM_TEXT('Sphagnum fallax <1%'),
      grade: 'U2',
    },
    dwarfShrubs: NO_DWARF,
  },
  prospects: { value: `${PROSPECTS_BASE} ${PROSPECTS_TAIL}`, grade: 'U1' },
  impacts: impacts('Vaccinium myrtillus, Molinia caerulea'),
  threats,
  other: other('Reptowo X'),
  overallComment: OVERALL,
}

export const examples91D0 = [
  { id: 'reptowo-xi', label: 'Reptowo XI', values: reptowoXI },
  { id: 'reptowo-viii', label: 'Reptowo VIII', values: reptowoVIII },
  { id: 'reptowo-x', label: 'Reptowo X', values: reptowoX },
]
