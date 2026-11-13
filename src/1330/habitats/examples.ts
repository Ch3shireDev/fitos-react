// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Bosiacka 2012, rozdz. 1330, pkt 3 „Przykład wypełnionej karty
// obserwacji”): Jarzębowo, 19.07.2009. Wykonawcy zanonimizowani (Jan Kowalski); zarządca to gmina i „własność prywatna” bez nazwisk.
// Karta jest starsza niż zestaw wskaźników z przewodnika:
//  • „Struktura przestrzenna płatów” – w karcie jej nie ma (doszła w 2017 r.). Wybrano FV z opisu karty („wyraźny gradient
//    zasolenia z kierunku NW ku SE”); tak też oceniono Jarzębowo w 2017 r. Wskaźnik niekardynalny – struktura i tak FV.
//  • „Ekspansja krzewów” – olsza „pojedynczo”, bez pokrycia: formularz nie podpowiada, FV wpisane ręcznie jak w karcie.
//  • „Powierzchnia siedliska” – pierwsze badanie, bez trendu: FV jak w karcie, w wartości 7 ha z nagłówka karty.
// Kody oddziaływań przepisane na słownik 2011: 102 koszenie → A03, 140 wypas → A04, 810 odwadnianie → J02.01.02
// (stare kody i intensywności w opisie; intensywność C → L, B → M).
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology1330 } from './methodology'

const COORD = 'N 53°54′…″ – E 14°39′…″'
const c = (name: string, abundance: string) => ({ layer: 'C' as const, name, abundance })

export const jarzebowo: CardValues = {
  ...emptyCardValues(methodology1330),
  site: {
    siteName: 'Jarzębowo',
    guid: '',
    subtype: 'both',
    communities: 'Juncetum gerardi, Scirpetum maritimi',
    description:
      'Rozległe, podmokłe pastwiska dochodzące bezpośrednio do Dziwny, od zachodu częściowo graniczące z lasem. Wyraźny gradient zasolenia z kierunku NW ku SE (na odcinku ok. 0,5 km wzrasta udział halofitów). Rowy melioracyjne częściowo zarośnięte przez trzcinę, najszersze pokryte trudnym do przekroczenia płem. Poza spasanymi przez krowy i konie płatami słonaw i szuwarów półhalofilnych, słonorośla wkraczają do „podkaszanych” szuwarów z turzycą dwustronną Carex disticha, manną mielec Glyceria maxima, tatarakiem zwyczajnym Acorus calamus, trzciną pospolitą Phragmites australis.',
    areaHa: 7,
    protectedAreas: 'Ujście Odry i Zalew Szczeciński PLH320018',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '10x200 m, ale nie po linii prostej (w poprzek i wzdłuż)',
    altitude: 'poniżej 10',
    date: '2009-07-19',
    observer: 'Jan Kowalski',
  },
  releves: [
    {
      coords: COORD,
      area: 25,
      cover: 100,
      unit: 'Juncetum gerardi',
      species: [
        c('Plantago maritima', '1'),
        c('Leontodon autumnalis', '+'),
        c('Lychnis flos-cuculi', '+'),
        c('Ranunculus repens', '1'),
        c('Trifolium fragiferum', '2'),
        c('Trifolium repens', '1'),
        c('Agrostis stolonifera', '3'),
        c('Schoenoplectus tabernaemontani', '+'),
        c('Inula britannica', '+'),
        c('Potentilla anserina', '2'),
        c('Juncus articulatus', '2'),
        c('Juncus gerardi', '2'),
        c('Bolboschoenus maritimus', '1'),
        c('Triglochin palustre', '+'),
        c('Triglochin maritima', '2'),
        c('Acorus calamus', '+'),
        c('Carex disticha', '+'),
      ],
    },
    {
      coords: COORD,
      area: 25,
      cover: 100,
      unit: 'Scirpetum maritimi',
      species: [
        c('Plantago winteri', '+'),
        c('Menyanthes trifoliata', '+'),
        c('Ranunculus repens', '+'),
        c('Trifolium fragiferum', '+'),
        c('Oenanthe fistulosa', '1'),
        c('Glyceria maxima', '2'),
        c('Sium latifolium', '+'),
        c('Agrostis stolonifera', '1'),
        c('Mentha aquatica', '+'),
        c('Schoenoplectus tabernaemontani', '4'),
        c('Inula britannica', 'r'),
        c('Potentilla anserina', '+'),
        c('Berula erecta', '1'),
        c('Juncus gerardi', '+'),
        c('Triglochin maritima', '1'),
        c('Senecio jacobaea', '+'),
        c('Rumex hydrolapathum', '+'),
      ],
    },
    {
      coords: COORD,
      area: 25,
      cover: 100,
      unit: 'Juncetum gerardi',
      species: [
        c('Plantago maritima', '2'),
        c('Leontodon autumnalis', '+'),
        c('Ranunculus flammula', '+'),
        c('Trifolium fragiferum', '2'),
        c('Trifolium repens', '+'),
        c('Dactylorhiza incarnata', 'r'),
        c('Agrostis stolonifera', '3'),
        c('Glaux maritima', '+'),
        c('Schoenoplectus tabernaemontani', '1'),
        c('Blysmus compressus', '+'),
        c('Potentilla anserina', '1'),
        c('Juncus articulatus', '2'),
        c('Juncus gerardi', '2'),
        c('Juncus compressus', '+'),
        c('Triglochin maritima', '2'),
        c('Hydrocotyle vulgaris', '+'),
        c('Eriophorum angustifolium', '+'),
      ],
    },
  ],
  indicators: {
    area: { inputs: { trend: '', areaM2: 70000 }, value: '70000 m²', grade: 'FV' },
    transect: { inputs: { share: 100 }, value: '100%', grade: 'FV' },
    characteristic: {
      inputs: {
        species: [
          { name: 'Plantago maritima', cover: 1 },
          { name: 'Plantago winteri', cover: 0.01 },
          { name: 'Juncus gerardi', cover: 15 },
          { name: 'Triglochin maritima', cover: 5 },
          { name: 'Glaux maritima', cover: 0.01 },
          { name: 'Trifolium fragiferum', cover: 15 },
          { name: 'Schoenoplectus tabernaemontani', cover: 10 },
        ],
      },
      value: 'Plantago maritima 1%, Plantago winteri <1%, Juncus gerardi 15%, Triglochin maritima 5%, Glaux maritima <1%, Trifolium fragiferum 15%, Schoenoplectus tabernaemontani 10%',
      grade: 'FV',
    },
    dominant: {
      inputs: {
        species: [
          { name: 'Agrostis stolonifera', cover: 40 },
          { name: 'Trifolium fragiferum', cover: 15 },
          { name: 'Juncus gerardi', cover: 15 },
        ],
      },
      value: 'Agrostis stolonifera 40%, Trifolium fragiferum 15%, Juncus gerardi 15%',
      grade: 'FV',
    },
    invasive: { inputs: { species: [] }, value: 'Brak', grade: 'FV' },
    expansive: { inputs: { species: [] }, value: 'Brak', grade: 'FV' },
    shrubs: { inputs: { species: [{ name: 'Alnus glutinosa', cover: undefined }] }, value: 'Alnus glutinosa – pojedynczo', grade: 'FV' },
    spatial: { inputs: { choice: 'gradient' }, value: 'Mozaikowy lub pasowy układ roślinności zgodny z gradientem zasolenia i wilgotności', grade: 'FV' },
    saltWater: {
      inputs: {
        choice: 'free',
        source: 'sea',
        ece: undefined,
        groundwater: undefined,
        waterEc: undefined,
        note: 'Rozlewiska rzeki Dziwny (ingresja wód morskich do rzeki); nieliczne, zamulone rowy melioracyjne',
      },
      value: 'Rozlewiska rzeki Dziwny (ingresja wód morskich do rzeki); nieliczne, zamulone rowy melioracyjne; źródło: ingresja wód morskich',
      grade: 'FV',
    },
  },
  prospects: {
    value: 'Ekstensywny wypas (krowy, konie) i koszenie w ramach programu rolnośrodowiskowego; w karcie nie wskazano zagrożeń.',
    grade: 'FV',
  },
  impacts: [
    {
      code: 'A03',
      name: 'Koszenie / ścinanie trawy',
      influence: '+',
      intensity: 'L',
      description: 'Fizjonomia otaczających słonawy szuwarów wskazuje na nieregularne koszenie. (W karcie z 2009 r.: kod 102, intensywność C.)',
    },
    {
      code: 'A04',
      name: 'Wypas',
      influence: '+',
      intensity: 'M',
      description: 'Wypas prowadzony poprawnie, ekstensywnie (krowy i konie). (W karcie: kod 140, intensywność B.)',
    },
    {
      code: 'J02.01.02',
      name: 'Osuszanie terenów morskich, ujściowych, bagiennych',
      influence: '0',
      intensity: 'L',
      description: 'Rowy zamulone, częściowo zarośnięte. (W karcie: kod 810 odwadnianie, intensywność C.)',
    },
  ],
  threats: [],
  other: {
    otherValues:
      'W płatach szuwarów dosyć licznie występuje kropidło Oenanthe fistulosa (gatunek bezpośrednio zagrożony wymarciem na Pomorzu Zachodnim, kat. EN) oraz regionalnie rzadki, subhalofilny oman Inula britannica.',
    conservation: 'Prowadzone zabiegi ochronne: wypas, koszenie. Istniejące plany i programy: program rolnośrodowiskowy.',
    notes:
      'Typ stanowiska: referencyjne. Zarządzanie terenem: Gmina Kamień Pomorski i własność prywatna. Data wypełnienia karty: 30.07.2009. Udział powierzchni siedliska w stanie FV 100%. Inne obserwacje: wzorcowa, rozległa, niskodarniowa słonawa o jednorodnej fizjonomii i składzie gatunkowym; wyjątkowo duży płat oczeretu Schoenoplectus tabernaemontani. Zagrożeń w karcie nie wskazano. Wskaźnika „Struktura przestrzenna płatów” w karcie z 2009 r. nie było – wyprowadzono go z opisu stanowiska (gradient zasolenia NW–SE).',
    photos: [],
  },
  overallComment: 'Wszystkie parametry FV: wzorcowa słonawa utrzymywana ekstensywnym wypasem i koszeniem, zasilana rozlewiskami Dziwny.',
}

export const examples1330: CardExample[] = [{ id: 'jarzebowo', label: 'Jarzębowo', values: jarzebowo }]
