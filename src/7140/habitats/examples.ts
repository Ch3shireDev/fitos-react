// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Koczur 2012, rozdz. 7140, pkt 3 „Przykład wypełnionej karty
// obserwacji”): Chyżne Borcok (Kotlina Orawsko-Nowotarska), 31.07.2011. Koordynator zanonimizowany (Jan Kowalski).
//  • w karcie kod „7140*” z gwiazdką – 7140 nie jest priorytetowe (tytuł rozdziału i dyrektywa bez gwiazdki); formularz bez;
//  • współrzędne w przewodniku ucięte do minut („19° 44’…’’ – E 49° 24’…’’ N”) – przepisane do minut;
//  • podtyp: karta go nie podaje – Kotlina Orawsko-Nowotarska to region alpejski, więc 7140-2;
//  • „Procent powierzchni zajęty przez siedlisko na transekcie” – karta tego wskaźnika nie ma: XX („nie oceniono”);
//  • gatunki charakterystyczne: jak w karcie, z płonnikiem pospolitym, którego nie ma na liście z pkt 4 (formularz go nie
//    liczy i ostrzega – ocena i tak FV, bo pokrycie gatunków charakterystycznych przekracza 50%);
//  • mchy: „Mchy brunatne – 10%” w karcie to w praktyce płonnik pospolity (jedyny mech poza torfowcem) – przepisane jak są;
//  • zdjęcia: literówki „Ocycoccus”, „Vaccinum” poprawione; w zdjęciu III nachylenie i ekspozycja puste jak w karcie;
//  • oddziaływania: stare kody (2011) → słownik 2011: 161 Zalesianie → B01, 810 Odwadnianie → J02.01.02; intensywność C → L;
//  • „Zagrożenia: Nie zaobserwowano” → X; rok, typ monitoringu i braki karty – w uwagach.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology7140 } from './methodology'

const COORD = '19°44′ E – 49°24′ N'

/** „Carex nigra 2, Carex rostrata +, …” → wiersze jednej warstwy. */
const list = (layer: 'C' | 'D', spec: string) =>
  spec.split(', ').map((s) => {
    const i = s.lastIndexOf(' ')
    return { layer, name: s.slice(0, i), abundance: s.slice(i + 1) }
  })

const releve = (o: { altitude: number; slope?: number; exposure: string; coverC: number; heightC: number; unit: string; remarks?: string }, c: string, d: string) => ({
  coords: COORD,
  altitude: o.altitude,
  area: 25,
  slope: o.slope,
  exposure: o.exposure,
  coverA: undefined,
  coverB: undefined,
  coverC: o.coverC,
  coverD: 100,
  heightA: undefined,
  heightB: undefined,
  heightC: o.heightC,
  heightD: 15,
  unit: o.unit,
  species: [...list('C', c), ...list('D', d)],
  remarks: o.remarks ?? '',
})

const UNIT_II = 'zb. Eriophorum angustifolium-Sphagnum fallax'

const CHARACTERISTIC_NOTE =
  'Gatunki charakterystyczne występujące masowo: wełnianka wąskolistna Eriophorum angustifolium – 40%, turzyca pospolita Carex nigra – 5%, sit cienki Juncus filiformis – 1%, torfowiec kończysty Sphagnum fallax – 90%, płonnik pospolity Polytrichum commune – 10%.'
const DOMINANT_NOTE = 'Wełnianka wąskolistna Eriophorum angustifolium – 40%, torfowiec kończysty Sphagnum fallax – 90%. Dominują gatunki charakterystyczne.'
const MOSSES_NOTE = 'Pokrycie mszaków 100%, mchy brunatne – 10%, torfowce – 90%. Struktura prawidłowa.'
const WOODY_NOTE =
  'Brak. Pojedyncze drzewa wchodzą jedynie w części najpłytszej (sosna zwyczajna Pinus sylvestris, świerk Picea abies) na niewielkim obszarze. W pozostałej części torfowiska, pojedyncze obumarłe drzewa.'
const HYDRATION_NOTE =
  'Poziom wód gruntowych powyżej powierzchni gruntu (miejscami do 20 cm) lub równy z nią. Uwodnienie prawidłowe, w ostatnim okresie poziom wód gruntowych musiał się podnieść, o czym świadczą obumarłe drzewa.'
const DRAINAGE_NOTE = 'Brak. Rowy odwadniające w bezpośrednim otoczeniu (okoliczne nasadzenia sosnowe) nie wpływają na uwodnienie torfowiska.'
const SHARE_NOTE = 'Nie oceniono – karta z przewodnika nie ma tego wskaźnika.'

export const chyzne: CardValues = {
  ...emptyCardValues(methodology7140),
  site: {
    subtype: '7140-2',
    siteName: 'Chyżne Borcok',
    guid: '',
    siteType: 'Referencyjne',
    areaName: 'Torfowiska Orawsko-Nowotarskie',
    communities: 'Caricetum nigrae, zb. Eriophorum angustifolium-Sphagnum fallax',
    description:
      'Torfowisko przejściowe na rozległej polanie, wśród borów bagiennych, porasta teren źródliskowy potoku Borcok (transekt usytuowany na lewym, lepiej zachowanym brzegu głównego potoku). W części centralnej rośnie bór bagienny rozdzielający torfowisko na dwie części. Torfowisko otoczone jest lasami sosnowymi o charakterze boru bagiennego, pochodzącymi z nasadzeń założonych na obrzeżach torfowiska po ich wcześniejszym odwodnieniu.',
    areaHa: '0,5',
    protectedAreas: 'Obszar Natura 2000 „Torfowiska Orawsko-Nowotarskie” PLH120016',
    manager: 'Wspólnota wsi Chyżne',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '10x103 m',
    altitude: '683',
    date: '2011-07-31',
    observer: 'Jan Kowalski',
    additionalExperts: '',
  },
  releves: [
    releve(
      { altitude: 683, slope: 0, exposure: 'brak', coverC: 35, heightC: 30, unit: 'Caricetum nigrae' },
      'Carex nigra 2, Carex rostrata +, Dactylorhiza maculata r, Eriophorum angustifolium 1, Juncus filiformis 1, Oxycoccus palustris 1, Potentilla erecta +, Vaccinium uliginosum +',
      'Sphagnum fallax 5, Polytrichum commune 2',
    ),
    releve(
      { altitude: 685, slope: 0, exposure: 'brak', coverC: 40, heightC: 30, unit: UNIT_II },
      'Carex nigra 1, Carex rostrata +, Dactylorhiza maculata r, Eriophorum angustifolium 2, Eriophorum vaginatum 2, Oxycoccus palustris 2',
      'Sphagnum fallax 5, Polytrichum commune 2',
    ),
    releve(
      { exposure: '', altitude: 684, coverC: 40, heightC: 40, unit: UNIT_II, remarks: 'Nachylenia i ekspozycji w karcie nie podano.' },
      'Carex rostrata 1, Eriophorum angustifolium 2, Eriophorum vaginatum +, Oxycoccus palustris 2',
      'Sphagnum fallax 5, Polytrichum commune +',
    ),
  ],
  indicators: {
    area: {
      inputs: { choice: 'stable', areaText: '0,5 ha', note: 'Powierzchnia siedliska duża, stabilna.' },
      value: 'Powierzchnia siedliska duża, stabilna.',
      grade: 'FV',
    },
    share: {
      inputs: { share: undefined, choice: 'XX', note: SHARE_NOTE },
      value: SHARE_NOTE,
      grade: 'XX',
    },
    characteristic: {
      inputs: {
        species: [
          { name: 'Eriophorum angustifolium', cover: 40 },
          { name: 'Carex nigra', cover: 5 },
          { name: 'Juncus filiformis', cover: 1 },
          { name: 'Sphagnum fallax', cover: 90 },
          { name: 'Polytrichum commune', cover: 10 },
        ],
        count: undefined,
        total: undefined,
        choice: '',
        note: CHARACTERISTIC_NOTE,
      },
      value: CHARACTERISTIC_NOTE,
      grade: 'FV',
    },
    dominant: {
      inputs: {
        species: [
          { name: 'Eriophorum angustifolium', cover: 40 },
          { name: 'Sphagnum fallax', cover: 90 },
        ],
        choice: '',
        note: DOMINANT_NOTE,
      },
      value: DOMINANT_NOTE,
      grade: 'FV',
    },
    mosses: {
      inputs: { mossCover: 100, sphagnumShare: 90, brownShare: 10, note: MOSSES_NOTE },
      value: MOSSES_NOTE,
      grade: 'FV',
    },
    aliens: {
      inputs: { species: [], total: undefined, none: 'yes', note: 'Brak.' },
      value: 'Brak.',
      grade: 'FV',
    },
    expansive: {
      inputs: { species: [], total: undefined, none: 'yes', choice: '', note: 'Brak.' },
      value: 'Brak.',
      grade: 'FV',
    },
    woody: {
      inputs: { species: [{ name: 'Pinus sylvestris' }, { name: 'Picea abies' }], total: 0.5, none: '', note: WOODY_NOTE },
      value: WOODY_NOTE,
      grade: 'FV',
    },
    hydration: {
      inputs: { depth1: undefined, depth2: undefined, depth3: undefined, depth4: undefined, depth5: undefined, piezometer: undefined, observed: 'wet', note: HYDRATION_NOTE },
      value: HYDRATION_NOTE,
      grade: 'FV',
    },
    peat: {
      inputs: { choice: 'none', method: '', damaged: undefined, note: 'Brak.' },
      value: 'Brak.',
      grade: 'FV',
    },
    drainage: {
      inputs: { choice: 'outside', note: DRAINAGE_NOTE },
      value: DRAINAGE_NOTE,
      grade: 'FV',
    },
  },
  prospects: {
    value: 'Bardzo dobre, o ile nie nastąpi zmiana sposobu użytkowania.',
    grade: 'FV',
  },
  impacts: [
    {
      code: 'B01',
      name: 'Zalesianie terenów otwartych',
      influence: '-',
      intensity: 'L',
      description:
        'Zalesienia w przeszłości zmniejszyły powierzchnię torfowiska, obecnie nie są prowadzone, a drzewa najbliżej obecnej granicy torfowiska wypadają. (Kod w karcie z 2011 r.: 161 Zalesianie, intensywność C.)',
    },
    {
      code: 'J02.01.02',
      name: 'Osuszanie terenów morskich, ujściowych, bagiennych',
      influence: '-',
      intensity: 'L',
      description: 'Rowy odwadniające w bezpośrednim otoczeniu (okoliczne nasadzenia sosnowe) nie wpływają na uwodnienie torfowiska. (Kod w karcie z 2011 r.: 810 Odwadnianie, intensywność C.)',
    },
  ],
  threats: [{ code: 'X', name: 'Brak zagrożeń i nacisków', description: 'Nie zaobserwowano.' }],
  other: {
    otherValues:
      'Siedlisko występuje w kompleksie z borem bagiennym 91D0, obecne rzadkie i chronione gatunki roślin (kukułka plamista Dactylorhiza maculata, wełnianka delikatna Eriophorum gracile).',
    conservation: 'Brak',
    proposals: 'Ochrona ścisła',
    monitoringRequired: 'tak',
    justification: 'Wskazane jest śledzenie ewentualnych zmian.',
    shareFV: 100,
    shareU1: 0,
    shareU2: 0,
    notes:
      'Rok: 2011. Typ monitoringu: zintegrowany. Dodatkowi koordynatorzy – w karcie puste. Współrzędne w przewodniku podane do minut (sekundy ucięte). W karcie kod „7140*” z gwiazdką – siedlisko nie jest priorytetowe. Karta nie ma wskaźnika „Procent powierzchni zajęty przez siedlisko na transekcie” (tu XX) ani oceny parametru „Specyficzna struktura i funkcje”.',
    photos: [],
  },
  overallComment: '',
}

export const examples7140: CardExample[] = [{ id: 'chyzne-borcok', label: 'Chyżne Borcok', values: chyzne }]
