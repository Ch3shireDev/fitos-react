// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Stawowczyk, Kozłowska-Kozak, Kozak 2015, rozdz. 8110, pkt 3
// „Przykład karty obserwacji”): Dolina Pańszczyca 4 (Tatry), 15.08.2013. Ekspert lokalny i dodatkowi eksperci
// zanonimizowani (Jan Kowalski, Anna Nowak, Piotr Wiśniewski).
//  • współrzędne w przewodniku są ucięte („20° 02′…″E 49° 13′…N”) – przepisane do minut, takie same dla trzech punktów;
//  • karta nie ma pól „Typ”, „Pasmo” – pasmo Tatry wywiedzione z obszaru Natura 2000 i podtypu 8110-1;
//  • „Pokrycie przez drzewa i krzewy: 0%” – łączne pokrycie 0 (lista pusta);
//  • „Zagrożenia: Stanowisko nie jest zagrożone.” – zagrożenie X; intensywność oddziaływań w karcie „A” → H (nowa skala);
//  • zdjęcia: warstwy C i D jak w karcie; „musci indet.” i „Cladonia sp.” w warstwie D;
//  • „Data kontroli”, „Uwagi metodyczne”, „Uwagi dodatkowe: –” – w uwagach.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology8110 } from './methodology'

const COORD = '49°13′ N – 20°02′ E'
const UNIT = 'Oxyrio digynae-Saxifragetum carpaticae'

type Row = { layer: 'C' | 'D'; name: string; abundance: string }
/** „Agrostis rupestris +; Luzula alpino-pilosa 1” → wiersze warstwy C; `d` – gatunki warstwy D. */
const list = (c: string, d: string): Row[] => [
  ...[c, d].flatMap((spec, k) =>
    spec.split('; ').map((s) => {
      const i = s.lastIndexOf(' ')
      return { layer: (k ? 'D' : 'C') as 'C' | 'D', name: s.slice(0, i), abundance: s.slice(i + 1) }
    }),
  ),
]

const releve = (o: { altitude: number; slope: number; exposure: string; coverC: number; coverD: number; heightC: number }, species: Row[]) => ({
  coords: COORD,
  area: 25,
  coverA: undefined,
  coverB: undefined,
  heightA: undefined,
  heightB: undefined,
  heightD: 5,
  unit: UNIT,
  ...o,
  species,
})

const TYPICAL = [
  'Cardaminopsis neglecta',
  'Cerastium uniflorum',
  'Geum reptans',
  'Leucanthemopsis alpina',
  'Oxyria digyna',
  'Poa laxa',
  'Saxifraga bryoides',
  'Saxifraga carpatica',
  'Saxifraga wahlenbergii',
  'Agrostis rupestris',
  'Deschampsia flexuosa',
  'Doronicum clusii',
  'Festuca picta',
  'Homogyne alpina',
  'Huperzia selago',
  'Luzula alpino-pilosa',
  'Mutellina purpurea',
  'Poa granitica',
  'Veronica alpina',
]
const TYPICAL_NOTE =
  '19 gatunków: dla 8110-1 – rzeżusznik tatrzański Cardaminopsis neglecta, rogownica jednokwiatowa Cerastium uniflorum, kuklik rozesłany Geum reptans, złocieniec alpejski Leucanthemopsis alpina, szczawiór alpejski Oxyria digyna, wiechlina wiotka Poa laxa, skalnica mchowata Saxifraga bryoides, skalnica karpacka Saxifraga carpatica, skalnica tatrzańska Saxifraga wahlenbergii; dla 8110-2 – mietlica skalna Agrostis rupestris, śmiałek pogięty Deschampsia flexuosa, omieg kozłowiec Doronicum clusii, kostrzewa barwna Festuca picta, podbiałek alpejski Homogyne alpina, wroniec widlasty Huperzia selago, kosmatka brunatna Luzula alpino-pilosa, marchwica pospolita Mutellina purpurea, wiechlina granitowa Poa granitica, przetacznik alpejski Veronica alpina.'

const ALPINE = [
  'Agrostis rupestris',
  'Anthoxanthum alpinum',
  'Arabis alpina',
  'Campanula alpina',
  'Campanula polymorpha',
  'Cardaminopsis neglecta',
  'Cerastium eriophorum',
  'Cerastium uniflorum',
  'Doronicum clusii',
  'Festuca airoides',
  'Festuca picta',
  'Galium anisophyllon',
  'Gentiana punctata',
  'Geum montanum',
  'Geum reptans',
  'Hieracium alpinum',
  'Juncus trifidus',
  'Leontodon pseudotaraxaci',
  'Leucanthemopsis alpina',
  'Luzula alpino-pilosa',
  'Luzula spicata',
  'Minuartia sedoides',
  'Mutellina purpurea',
  'Oreochloa disticha',
  'Oxyria digyna',
  'Pedicularis oederi',
  'Pedicularis verticillata',
  'Poa alpina',
  'Poa granitica',
  'Poa laxa',
  'Polygonum viviparum',
  'Primula minima',
  'Sagina saginoides',
  'Salix herbacea',
  'Salix retusa',
  'Saxifraga aizoides',
  'Saxifraga bryoides',
  'Saxifraga carpatica',
  'Saxifraga wahlenbergii',
  'Sedum alpestre',
  'Silene acaulis',
  'Thymus alpestris',
  'Veronica alpina',
]
const ALPINE_NOTE =
  '43 gatunki: mietlica skalna Agrostis rupestris, tomka alpejska Anthoxanthum alpinum, gęsiówka alpejska Arabis alpina, dzwonek alpejski Campanula alpina, dzwonek wąskolistny Campanula polymorpha, rzeżusznik tatrzański Cardaminopsis neglecta, rogownica watowata Cerastium eriophorum, rogownica jednokwiatowa Cerastium uniflorum, omieg kozłowiec Doronicum clusii, kostrzewa niska Festuca airoides, kostrzewa barwna Festuca picta, przytulia nierównolistna Galium anisophyllon, goryczka kropkowana Gentiana punctata, kuklik górski Geum montanum, kuklik rozesłany Geum reptans, jastrzębiec alpejski Hieracium alpinum, sit skucina Juncus trifidus, brodawnik tatrzański Leontodon pseudotaraxaci, złocieniec alpejski Leucanthemopsis alpina, kosmatka brunatna Luzula alpino-pilosa, kosmatka kłosowa Luzula spicata, mokrzyca rozchodnikowata Minuartia sedoides, marchwica pospolita Mutellina purpurea, boimka dwurzędowa Oreochloa disticha, szczawiór alpejski Oxyria digyna, gnidosz dwubarwny Pedicularis oederi, gnidosz okółkowy Pedicularis verticillata, wiechlina alpejska Poa alpina, wiechlina granitowa Poa granitica, wiechlina wiotka Poa laxa, rdest żyworodny Polygonum viviparum, pierwiosnek maleńki Primula minima, karmnik skalny Sagina saginoides, wierzba zielna Salix herbacea, wierzba wykrojona Salix retusa, skalnica nakrapiana Saxifraga aizoides, skalnica mchowata Saxifraga bryoides, skalnica karpacka Saxifraga carpatica, skalnica tatrzańska Saxifraga wahlenbergii, rozchodnik alpejski Sedum alpestre, lepnica bezłodygowa Silene acaulis, macierzanka halna Thymus alpestris, przetacznik alpejski Veronica alpina.'

const PROSPECTS =
  'Stanowisko znajduje się w obrębie obszaru ochrony ścisłej Tatrzańskiego Parku Narodowego, w oddaleniu od szlaków turystycznych, co zapewnia mu optymalny sposób ochrony.'

export const dolinaPanszczyca4: CardValues = {
  ...emptyCardValues(methodology8110),
  site: {
    subtype: '8110-1',
    massif: 'Tatry',
    siteName: 'Dolina Pańszczyca 4',
    guid: '',
    siteType: 'referencyjne',
    areaName: 'Tatry PLC120001',
    communities: 'Oxyrio digynae-Saxifragetum carpaticae',
    description:
      'Stanowisko usytuowane jest pod Wierchem pod Fajkami w Dolinie Pańszczyca. Transekt poprowadzono w pobliżu rynny erozyjnej, w bocznej części stożka piargowego. Piarg w niewielkim stopniu pokryty przez roślinność, którą stanowią płaty zespołu szczawióra alpejskiego i skalnicy karpackiej Oxyrio digynae-Saxifragetum carpaticae. Na stanowisku dominuje rumosz o dość drobnej granulacji – żwirek i niewielkie kamienie do 20 cm średnicy.',
    areaHa: '0,4',
    protectedAreas: 'Tatrzański Park Narodowy',
    manager: 'Tatrzański Park Narodowy',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '140x10 m',
    altitude: '1815–1880',
    date: '2013-08-15',
    observer: 'Jan Kowalski',
    additionalExperts: 'Anna Nowak, Piotr Wiśniewski',
  },
  releves: [
    releve(
      { altitude: 1880, slope: 45, exposure: 'N', coverC: 5, coverD: 1, heightC: 15 },
      list(
        'Agrostis rupestris +; Anthoxanthum alpinum +; Campanula polymorpha +; Cardaminopsis neglecta +; Doronicum clusii +; Festuca picta +; Huperzia selago +; Luzula alpino-pilosa 1; Mutellina purpurea +; Oxyria digyna +; Poa granitica +; Poa laxa +; Primula minima +; Saxifraga carpatica +; Sedum alpestre +; Soldanella carpatica +; Veronica alpina +',
        'musci indet. +',
      ),
    ),
    releve(
      { altitude: 1840, slope: 35, exposure: 'NE', coverC: 10, coverD: 1, heightC: 10 },
      list(
        'Agrostis rupestris +; Anthoxanthum alpinum +; Arabis alpina +; Campanula alpina +; Campanula polymorpha +; Cardaminopsis neglecta +; Cerastium eriophorum +; Cerastium uniflorum +; Doronicum clusii +; Festuca airoides 1; Festuca picta 1; Galium anisophyllon +; Hieracium alpinum +; Leucanthemopsis alpina +; Luzula alpino-pilosa 1; Mutellina purpurea +; Oreochloa disticha +; Oxyria digyna +; Pedicularis verticillata +; Poa granitica +; Poa laxa +; Sagina saginoides +; Saxifraga bryoides +; Saxifraga carpatica +; Saxifraga paniculata +; Sedum alpestre +; Silene acaulis +; Soldanella carpatica +; Taraxacum sp. +; Thymus alpestris +; Veronica alpina +',
        'musci indet. +',
      ),
    ),
    releve(
      { altitude: 1815, slope: 5, exposure: 'E', coverC: 20, coverD: 10, heightC: 10 },
      list(
        'Agrostis rupestris +; Anthoxanthum alpinum +; Campanula alpina +; Campanula polymorpha +; Cardaminopsis neglecta +; Cerastium uniflorum +; Deschampsia flexuosa +; Doronicum clusii +; Festuca airoides 1; Festuca picta +; Geum montanum +; Geum reptans +; Hieracium alpinum +; Homogyne alpina +; Huperzia selago +; Juncus trifidus +; Leontodon pseudotaraxaci +; Leucanthemopsis alpina +; Luzula alpino-pilosa 2; Luzula spicata +; Minuartia sedoides +; Oreochloa disticha +; Oxyria digyna +; Poa alpina +; Poa granitica +; Poa laxa +; Polygonum viviparum +; Primula minima +; Salix herbacea +; Salix silesiaca +; Saxifraga bryoides +; Saxifraga carpatica +; Saxifraga paniculata +; Saxifraga wahlenbergii +; Sedum alpestre 1; Silene acaulis +; Soldanella carpatica +; Vaccinium myrtillus +; Veronica alpina +',
        'Cladonia sp. +',
      ),
    ),
  ],
  indicators: {
    area: { inputs: { choice: 'stable', areaText: '0,4 ha', note: '' }, value: '0,4 ha', grade: 'FV' },
    fraction: {
      inputs: { size: 'Żwirek 3–5 cm i kamienie o średnicy 15–20 cm.', choice: '', note: '' },
      value: 'Żwirek 3–5 cm i kamienie o średnicy 15–20 cm.',
      grade: 'FV',
    },
    communities: {
      inputs: { types: 'Zbiorowiska piargowe związku Androsacion alpinae – 100%.', pinus: undefined, choice: '', note: '' },
      value: 'Zbiorowiska piargowe związku Androsacion alpinae – 100%.',
      grade: 'FV',
    },
    typical: {
      inputs: { species: TYPICAL.map((name) => ({ name })), count: undefined, none: '', choice: '', note: TYPICAL_NOTE },
      value: TYPICAL_NOTE,
      grade: 'FV',
    },
    alpine: {
      inputs: { species: ALPINE.map((name) => ({ name })), count: undefined, none: '', choice: '', note: ALPINE_NOTE },
      value: ALPINE_NOTE,
      grade: 'FV',
    },
    aliens: { inputs: { species: [], count: undefined, total: undefined, none: 'yes', note: 'Brak.' }, value: 'Brak.', grade: 'FV' },
    shrubs: { inputs: { species: [], total: 0, none: '', note: '' }, value: '0%', grade: 'FV' },
    herbs: { inputs: { value: 10, note: '' }, value: '10%', grade: 'FV' },
    habitatShare: { inputs: { value: 100, note: '' }, value: '100%', grade: 'FV' },
    anthropo: { inputs: { choice: 'none', note: 'Brak.' }, value: 'Brak.', grade: 'FV' },
  },
  prospects: { value: PROSPECTS, grade: 'FV' },
  impacts: [
    {
      code: 'K01.01',
      name: 'Erozja',
      influence: '+',
      intensity: 'H',
      description: 'Zjawisko naturalne, warunkujące istnienie piargów i ograniczające ich zarastanie. (Intensywność w karcie z 2013 r.: A.)',
    },
    {
      code: 'L04',
      name: 'Lawina',
      influence: '0',
      intensity: 'H',
      description: 'Zjawisko naturalne, nie wpływające negatywnie na strukturę i funkcjonowanie siedliska. (Intensywność w karcie z 2013 r.: A.)',
    },
  ],
  threats: [{ code: 'X', name: 'Brak zagrożeń i nacisków', description: 'Stanowisko nie jest zagrożone.' }],
  other: {
    otherValues: 'Na stanowisku występuje wiele gatunków wysokogórskich, rzadkich w Polsce. Niektóre z nich to rośliny objęte ochroną ścisłą.',
    conservation: 'Stanowisko znajduje się w obrębie obszaru ochrony ścisłej Tatrzańskiego Parku Narodowego, z dala od przebiegu szlaków turystycznych.',
    proposals: 'Utrzymać dotychczasowy status ochronny.',
    monitoringRequired: 'tak',
    justification:
      'Ze względu na rzadkość występowania siedliska na terenie Polski oraz obecność na stanowisku bardzo dobrze zachowanych, modelowych płatów piargu z roślinnością pionierską, z licznymi reprezentatywnymi dla siedliska gatunkami roślin wysokogórskich.',
    shareFV: 100,
    shareU1: 0,
    shareU2: 0,
    notes:
      'Rok: 2013. Data kontroli: 15.08.2013. Uwagi metodyczne: optymalny termin obserwacji – lipiec, sierpień. Uwagi dodatkowe: –. Współrzędne w przewodniku podane do minut (sekundy ucięte). Intensywność oddziaływań w karcie podana w starej skali (A).',
    photos: [],
  },
  overallComment: '',
}

export const examples8110: CardExample[] = [{ id: 'dolina-panszczyca-4', label: 'Dolina Pańszczyca 4', values: dolinaPanszczyca4 }]
