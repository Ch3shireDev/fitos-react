// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Lemke 2012, rozdz. 2160, pkt 3 „Przykład wypełnionej
// karty obserwacji”): „Mewia Łacha” 1, Ostoja w Ujściu Wisły, 16.09.2010. Wykonawca zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („N 54° 18' …'' – E 18° 26' …''”) – przepisane do minut;
//  • wartości wskaźników przepisane z karty słowo w słowo jako opisy; oceny jak w karcie;
//  • liczby tam, gdzie karta je podaje: powierzchnia kępy ok. 150 m², 0% uszkodzonych pędów, 0,02 ha;
//  • „Powierzchnia siedliska” bez wartości w karcie, U1 – wybrana opcja „stabilna, ale bardzo mała”;
//  • „Działalność człowieka: brak” – brak oddziaływań i zagrożeń;
//  • struktura liczy się U1, nie FV jak w karcie: kardynalny wskaźnik „Gatunki ekspansywne” ma U1 (patrz specyfikacja).
import type { CardValues, ReleveSpeciesRow } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology2160 } from './methodology'

const COORD = 'N 54°18′; E 18°26′'

type Row = [ReleveSpeciesRow['layer'], string, ReleveSpeciesRow['abundance']]
const rows = (list: Row[]): ReleveSpeciesRow[] => list.map(([layer, name, abundance]) => ({ layer, name, abundance }))

const C = (spec: string): Row[] =>
  spec.split(',').map((s) => {
    const t = s.trim()
    const i = t.lastIndexOf(' ')
    return ['C', t.slice(0, i), t.slice(i + 1) as ReleveSpeciesRow['abundance']]
  })

const RELEVE_SPECIES = rows([
  ['A', 'Betula pendula', '1'],
  ['A', 'Salix acutifolia', '2'],
  ['A', 'Salix daphnoides', '1'],
  ['B', 'Frangula alnus', '+'],
  ['B', 'Hippophaë rhamnoides', '4'],
  ...C(
    'Achillea millefolium +, Achillea ptarmica r, Alnus glutinosa r, Ammophila arenaria +, Angelica archangelica r, ' +
      'Artemisia campestris +, Betula pendula +, Bidens cernua r, Calamagrostis epigejos 1, Carex arenaria 1, Carex gracilis r, ' +
      'Carex hirta +, Convolvulus arvensis +, Corynephorus canescens r, Dactylis glomerata +, Epilobium palustre +, ' +
      'Equisetum sylvaticum +, Eupatorium cannabinum +, Festuca rubra +, Filipendula ulmaria +, Galeopsis bifida +, ' +
      'Hippophaë rhamnoides +, Humulus lupulus +, Hypochoeris radicata r, Iris pseudacorus r, Jasione montana +, ' +
      'Lathyrus japonicus +, Linaria vulgaris +, Lycopus europaeus +, Melilotus officinalis r, Petasites spurius +, ' +
      'Phragmites australis +, Pinus sylvestris r, Quercus robur r, Ranunculus repens +, Rosa rugosa +, Rubus idaeus +, ' +
      'Rumex acetosella r, Scutellaria galericulata +, Sedum acre +, Solanum dulcamara +, Solidago virgaurea +, ' +
      'Stachys palustris r, Tanacetum vulgare +, Taraxacum officinale r, Thalictrum aquilegiifolium r, Urtica dioica +, ' +
      'Valeriana officinalis r, Veronica longifolia r, Vicia angustifolia r, Vicia cracca r',
  ),
])

const COMBINATION_TEXT =
  'Występuje rokitnik oraz specyficzna kombinacja gatunków związanych z wydmami szarymi, takich jak: Lathyrus japonicus, Jasione montana, Festuca rubra oraz higro- i nitrofilnych, takich jak: Petasites spurius, Urtica dioica czy nawet Phragmites australis.'
const EXPANSIVE_TEXT = 'W obrębie zarośli licznie występują i górują nad rokitnikiem drzewiaste Salix daphnoides i Salix acutifolia.'

export const mewiaLacha1: CardValues = {
  ...emptyCardValues(methodology2160),
  site: {
    siteName: '„Mewia Łacha” 1',
    guid: '',
    communities: 'Hippophaëtum rhamnoidis',
    description: 'Zarośla porastają wschodni brzeg sztucznego przekopu Wisły.',
    areaHa: 0.02,
    protectedAreas: 'Rezerwat przyrody „Mewia Łacha”, Park Krajobrazowy Mierzei Wiślanej, PLH220044 Ostoja w Ujściu Wisły',
    coordMiddle: COORD,
    transect: 'Monitoring przeprowadzono na stanowisku punktowym z powodu małej powierzchni poszczególnych kęp zarośli rokitnika.',
    altitude: '2',
    date: '2010-09-16',
    observer: 'Jan Kowalski',
  },
  releves: [
    {
      coords: COORD,
      altitude: 2,
      area: 25,
      slope: 0,
      exposure: 'brak',
      coverA: 25,
      coverB: 70,
      coverC: 30,
      coverD: 0,
      heightA: 8,
      heightB: 4,
      heightC: 30,
      heightD: undefined,
      unit: 'Hippophaëtum rhamnoidis',
      species: RELEVE_SPECIES,
    },
  ],
  indicators: {
    area: { inputs: { choice: 'small', areaHa: 0.02, note: '' }, value: '0,02 ha; powierzchnia stabilna, ale bardzo mała – pojedyncze niewielkie kępy (sprawozdanie 2009–2011)', grade: 'U1' },
    combination: {
      inputs: {
        species: [
          { name: 'Hippophaë rhamnoides' },
          { name: 'Lathyrus japonicus' },
          { name: 'Jasione montana' },
          { name: 'Festuca rubra' },
          { name: 'Urtica dioica' },
          { name: 'Phragmites australis' },
        ],
        choice: 'typical',
        note: COMBINATION_TEXT,
      },
      value: COMBINATION_TEXT,
      grade: 'FV',
    },
    expansive: {
      inputs: { species: [{ name: 'Salix daphnoides' }, { name: 'Salix acutifolia' }], choice: 'single', note: EXPANSIVE_TEXT },
      value: EXPANSIVE_TEXT,
      grade: 'U1',
    },
    height: { inputs: { value: undefined, choice: 'tall', note: '2–5 m' }, value: '2–5 m', grade: 'FV' },
    regeneration: {
      inputs: { choice: 'many', note: 'Rokitnik owocuje i odnawia się naturalnie.' },
      value: 'Rokitnik owocuje i odnawia się naturalnie.',
      grade: 'FV',
    },
    patch: {
      inputs: { value: 150, choice: '', note: 'Ok. 150 m², jedna z większych kęp w rezerwacie.' },
      value: 'Ok. 150 m², jedna z większych kęp w rezerwacie.',
      grade: 'FV',
    },
    health: {
      inputs: { value: 0, choice: '', note: 'Krzewy rokitnika w dobrej kondycji, uszkodzeń pędów nie stwierdzono.' },
      value: 'Krzewy rokitnika w dobrej kondycji, uszkodzeń pędów nie stwierdzono.',
      grade: 'FV',
    },
    aliens: { inputs: { species: [], choice: 'none', note: '' }, value: 'Brak', grade: 'FV' },
  },
  prospects: { value: 'Ze względu na właściwości rokitnika istnieje możliwość przetrwania zarośli na stanowisku.', grade: 'U1' },
  impacts: [],
  threats: [],
  other: {
    otherValues: '',
    conservation: '',
    notes:
      'Nazwa obszaru: Ostoja w Ujściu Wisły. Data wypełnienia karty: 16.09.2010. Powierzchnia siedliska o różnym stanie zachowania na stanowisku: FV 0%, U1 100%, U2 0%. Działalność człowieka: brak.',
    photos: [],
  },
  overallComment: '',
}

export const examples2160: CardExample[] = [{ id: 'mewia-lacha-1', label: '„Mewia Łacha” 1', values: mewiaLacha1 }]
