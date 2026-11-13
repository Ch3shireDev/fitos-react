// Słownik gatunków dla 91XX (olsy, Carici elongatae-Alnetum), zebrany z przewodnika GIOŚ (Pawlaczyk 2015,
// rozdz. „Typowe gatunki roślin” i tab. 1), z przykładowej karty (Kozi Rynek 2013) oraz ze sprawozdań z monitoringu
// 2013–2014, 2015–2018 i 2024 (gatunki obce, tab. 3 sprawozdania 2024).
import type { Layer, SpeciesRow } from '../../7120/habitats/types'
import { normalizeName } from '../../forest'

export type SpeciesGroup91XX =
  | 'tree' // drzewostan olsu (olsza czarna, brzozy, sosna, świerk na NE)
  | 'shrub' // podszyt (porzeczki, kruszyna, czeremcha, jarząb)
  | 'bog' // gatunki bagienne dolinek – trzon kombinacji olsowej
  | 'hummock' // gatunki leśne kęp (szczawik, konwalijka, borówka)
  | 'swamp-forest' // gatunki łęgowe i przejściowe (podzespół symphytetosum, kępy żyźniejsze)
  | 'peat' // gatunki torfowiskowe (postać torfowcowa, comaretosum)
  | 'meadow' // gatunki łąkowe – ich dominacja świadczy o przesuszeniu
  | 'pleustophyte' // pleustofity – ich wyłączność świadczy o stałym zalaniu albo eutrofizacji
  | 'invasive' // gatunki obce geograficznie (runo, podszyt, drzewostan)
  | 'other'

export interface SpeciesEntry91XX {
  latin: string
  polish?: string
  group: SpeciesGroup91XX
  /** Gatunek typowy dla olsu wg przewodnika (tab. 1, rozdz. 4) – formularz pokazuje, ile ich jest na liście. */
  typical?: boolean
  layer?: Layer
}

export const GROUP_LABELS_91XX: Record<SpeciesGroup91XX, string> = {
  tree: 'drzewo olsu',
  shrub: 'krzew podszytu',
  bog: 'gatunek bagienny (dolinki)',
  hummock: 'gatunek leśny kęp',
  'swamp-forest': 'gatunek łęgowy, przejściowy',
  peat: 'gatunek torfowiskowy',
  meadow: 'gatunek łąkowy (sygnał przesuszenia)',
  pleustophyte: 'pleustofit (sygnał zalania lub eutrofizacji)',
  invasive: 'gatunek obcy geograficznie',
  other: 'inny',
}

const T = true

export const SPECIES_91XX: SpeciesEntry91XX[] = [
  // --- drzewostan ---
  { latin: 'Alnus glutinosa', polish: 'olsza czarna', group: 'tree', typical: T, layer: 'A' },
  { latin: 'Betula pubescens', polish: 'brzoza omszona', group: 'tree', layer: 'A' },
  { latin: 'Betula pendula', polish: 'brzoza brodawkowata', group: 'tree', layer: 'A' },
  { latin: 'Pinus sylvestris', polish: 'sosna zwyczajna', group: 'tree', layer: 'A' },
  { latin: 'Picea abies', polish: 'świerk pospolity', group: 'tree', layer: 'A' },
  { latin: 'Fraxinus excelsior', polish: 'jesion wyniosły', group: 'tree', layer: 'A' },
  { latin: 'Quercus robur', polish: 'dąb szypułkowy', group: 'tree', layer: 'A' },
  { latin: 'Tilia cordata', polish: 'lipa drobnolistna', group: 'tree', layer: 'A' },
  // --- podszyt ---
  { latin: 'Ribes nigrum', polish: 'porzeczka czarna', group: 'shrub', typical: T, layer: 'B' },
  { latin: 'Ribes spicatum', polish: 'porzeczka kłosowa', group: 'shrub', layer: 'B' },
  { latin: 'Frangula alnus', polish: 'kruszyna pospolita', group: 'shrub', typical: T, layer: 'B' },
  { latin: 'Sorbus aucuparia', polish: 'jarząb pospolity', group: 'shrub', layer: 'B' },
  { latin: 'Padus avium', polish: 'czeremcha zwyczajna', group: 'shrub', layer: 'B' },
  { latin: 'Salix cinerea', polish: 'wierzba szara', group: 'shrub', layer: 'B' },
  { latin: 'Salix aurita', polish: 'wierzba uszata', group: 'shrub', layer: 'B' },
  { latin: 'Rubus sp.', polish: 'jeżyna', group: 'shrub', layer: 'B' },
  // --- gatunki bagienne dolinek (tab. 1, rozdz. 4) ---
  { latin: 'Carex elongata', polish: 'turzyca długokłosa', group: 'bog', typical: T },
  { latin: 'Solanum dulcamara', polish: 'psianka słodkogórz', group: 'bog', typical: T },
  { latin: 'Lycopus europaeus', polish: 'karbieniec pospolity', group: 'bog', typical: T },
  { latin: 'Caltha palustris', polish: 'knieć błotna', group: 'bog', typical: T },
  { latin: 'Calla palustris', polish: 'czermień błotna', group: 'bog', typical: T },
  { latin: 'Peucedanum palustre', polish: 'gorysz błotny', group: 'bog', typical: T },
  { latin: 'Galium palustre', polish: 'przytulia błotna', group: 'bog', typical: T },
  { latin: 'Iris pseudacorus', polish: 'kosaciec żółty', group: 'bog', typical: T },
  { latin: 'Hottonia palustris', polish: 'okrężnica bagienna', group: 'bog', typical: T },
  { latin: 'Myosotis palustris', polish: 'niezapominajka błotna', group: 'bog', typical: T },
  { latin: 'Carex acutiformis', polish: 'turzyca błotna', group: 'bog', typical: T },
  { latin: 'Thelypteris palustris', polish: 'zachylnik błotny', group: 'bog', typical: T },
  { latin: 'Rumex hydrolapathum', polish: 'szczaw lancetowaty', group: 'bog', typical: T },
  { latin: 'Calamagrostis canescens', polish: 'trzcinnik lancetowaty', group: 'bog', typical: T },
  { latin: 'Cicuta virosa', polish: 'szalej jadowity', group: 'bog' },
  { latin: 'Lysimachia vulgaris', polish: 'tojeść pospolita', group: 'bog' },
  { latin: 'Lysimachia thyrsiflora', polish: 'tojeść bukietowa', group: 'bog' },
  { latin: 'Scutellaria galericulata', polish: 'tarczyca pospolita', group: 'bog' },
  { latin: 'Ranunculus lingua', polish: 'jaskier wielki', group: 'bog' },
  { latin: 'Mentha aquatica', polish: 'mięta nadwodna', group: 'bog' },
  { latin: 'Berula erecta', polish: 'potocznik wąskolistny', group: 'bog' },
  { latin: 'Equisetum fluviatile', polish: 'skrzyp bagienny', group: 'bog' },
  { latin: 'Galium uliginosum', polish: 'przytulia bagienna', group: 'bog' },
  { latin: 'Phragmites australis', polish: 'trzcina pospolita', group: 'bog' },
  { latin: 'Phalaris arundinacea', polish: 'mozga trzcinowata', group: 'bog' },
  { latin: 'Cardamine amara', polish: 'rzeżucha gorzka', group: 'bog' },
  { latin: 'Carex riparia', polish: 'turzyca brzegowa', group: 'bog' },
  { latin: 'Carex pseudocyperus', polish: 'turzyca nibyciborowata', group: 'bog' },
  { latin: 'Glyceria maxima', polish: 'manna mielec', group: 'bog' },
  // --- gatunki leśne kęp ---
  { latin: 'Oxalis acetosella', polish: 'szczawik zajęczy', group: 'hummock' },
  { latin: 'Maianthemum bifolium', polish: 'konwalijka dwulistna', group: 'hummock' },
  { latin: 'Vaccinium myrtillus', polish: 'borówka czarna', group: 'hummock' },
  { latin: 'Dryopteris carthusiana', polish: 'nerecznica krótkoostna', group: 'hummock' },
  { latin: 'Dryopteris dilatata', polish: 'nerecznica szerokolistna', group: 'hummock' },
  { latin: 'Trientalis europaea', polish: 'siódmaczek leśny', group: 'hummock' },
  { latin: 'Athyrium filix-femina', polish: 'wietlica samicza', group: 'hummock' },
  { latin: 'Circaea alpina', polish: 'czartawa drobna', group: 'hummock' },
  // --- gatunki łęgowe, przejściowe (Ribeso nigri-Alnetum symphytetosum) ---
  { latin: 'Humulus lupulus', polish: 'chmiel zwyczajny', group: 'swamp-forest' },
  { latin: 'Symphytum officinale', polish: 'żywokost lekarski', group: 'swamp-forest' },
  { latin: 'Eupatorium cannabinum', polish: 'sadziec konopiasty', group: 'swamp-forest' },
  { latin: 'Stachys palustris', polish: 'czyściec błotny', group: 'swamp-forest' },
  { latin: 'Urtica dioica', polish: 'pokrzywa zwyczajna', group: 'swamp-forest' },
  { latin: 'Impatiens noli-tangere', polish: 'niecierpek pospolity', group: 'swamp-forest' },
  { latin: 'Filipendula ulmaria', polish: 'wiązówka błotna', group: 'swamp-forest' },
  { latin: 'Cirsium oleraceum', polish: 'ostrożeń warzywny', group: 'swamp-forest' },
  { latin: 'Galeobdolon luteum', polish: 'gajowiec żółty', group: 'swamp-forest' },
  { latin: 'Glechoma hederacea', polish: 'bluszczyk kurdybanek', group: 'swamp-forest' },
  { latin: 'Geranium robertianum', polish: 'bodziszek cuchnący', group: 'swamp-forest' },
  { latin: 'Epilobium montanum', polish: 'wierzbownica górska', group: 'swamp-forest' },
  // --- gatunki torfowiskowe (postać torfowcowa, comaretosum) ---
  { latin: 'Comarum palustre', polish: 'siedmiopalecznik błotny', group: 'peat' },
  { latin: 'Menyanthes trifoliata', polish: 'bobrek trójlistkowy', group: 'peat' },
  { latin: 'Sphagnum squarrosum', polish: 'torfowiec nastroszony', group: 'peat' },
  { latin: 'Sphagnum palustre', polish: 'torfowiec błotny', group: 'peat' },
  { latin: 'Sphagnum capillifolium', polish: 'torfowiec ostrolistny', group: 'peat' },
  { latin: 'Oxycoccus palustris', polish: 'żurawina błotna', group: 'peat' },
  { latin: 'Dryopteris cristata', polish: 'nerecznica grzebieniasta', group: 'peat' },
  { latin: 'Hydrocotyle vulgaris', polish: 'wąkrota zwyczajna', group: 'peat' },
  { latin: 'Carex lasiocarpa', polish: 'turzyca nitkowata', group: 'peat' },
  { latin: 'Agrostis canina', polish: 'mietlica psia', group: 'peat' },
  // --- gatunki łąkowe (dominacja = zniekształcone warunki wodne, tab. 2) ---
  { latin: 'Deschampsia cespitosa', polish: 'śmiałek darniowy', group: 'meadow' },
  { latin: 'Holcus lanatus', polish: 'kłosówka wełnista', group: 'meadow' },
  { latin: 'Juncus effusus', polish: 'sit rozpierzchły', group: 'meadow' },
  { latin: 'Poa trivialis', polish: 'wiechlina zwyczajna', group: 'meadow' },
  { latin: 'Ranunculus repens', polish: 'jaskier rozłogowy', group: 'meadow' },
  { latin: 'Lychnis flos-cuculi', polish: 'firletka poszarpana', group: 'meadow' },
  // --- pleustofity (rzęsa, manna jadalna – objaw eutrofizacji wód, tab. 1) ---
  { latin: 'Lemna minor', polish: 'rzęsa drobna', group: 'pleustophyte' },
  { latin: 'Lemna trisulca', polish: 'rzęsa trójrowkowa', group: 'pleustophyte' },
  { latin: 'Spirodela polyrhiza', polish: 'spirodela wielokorzeniowa', group: 'pleustophyte' },
  { latin: 'Hydrocharis morsus-ranae', polish: 'żabiściek pływający', group: 'pleustophyte' },
  { latin: 'Glyceria fluitans', polish: 'manna jadalna', group: 'pleustophyte' },
  // --- obce geograficznie (tab. 1 przewodnika, sprawozdanie 2024, tab. 3) ---
  { latin: 'Bidens frondosa', polish: 'uczep amerykański', group: 'invasive' },
  { latin: 'Impatiens parviflora', polish: 'niecierpek drobnokwiatowy', group: 'invasive' },
  { latin: 'Impatiens glandulifera', polish: 'niecierpek gruczołowaty', group: 'invasive' },
  { latin: 'Solidago gigantea', polish: 'nawłoć późna', group: 'invasive' },
  { latin: 'Solidago canadensis', polish: 'nawłoć kanadyjska', group: 'invasive' },
  { latin: 'Erechtites hieraciifolius', polish: 'erechtites jastrzębcowaty', group: 'invasive' },
  { latin: 'Echinocystis lobata', polish: 'kolczurka klapowana', group: 'invasive' },
  { latin: 'Padus serotina', polish: 'czeremcha amerykańska', group: 'invasive', layer: 'B' },
  { latin: 'Fraxinus pennsylvanica', polish: 'jesion pensylwański', group: 'invasive', layer: 'A' },
  { latin: 'Acer negundo', polish: 'klon jesionolistny', group: 'invasive', layer: 'A' },
  { latin: 'Quercus rubra', polish: 'dąb czerwony', group: 'invasive', layer: 'A' },
  { latin: 'Populus ×canadensis', polish: 'topola kanadyjska', group: 'invasive', layer: 'A' },
]

// Nazwy z przewodnika i sprawozdań (literówki, synonimy), które trzeba rozpoznać.
const SYNONYMS: Record<string, string> = {
  'iris pseudoacorus': 'Iris pseudacorus',
  'myosotis scorpioides': 'Myosotis palustris',
  'potentilla palustris': 'Comarum palustre',
  'vaccinium oxycoccos': 'Oxycoccus palustris',
  'thelypteris thelypteroides': 'Thelypteris palustris',
  'lamium galeobdolon': 'Galeobdolon luteum',
  'lamiastrum galeobdolon': 'Galeobdolon luteum',
  'prunus serotina': 'Padus serotina',
  'prunus padus': 'Padus avium',
  'erechtites hieraciifolia': 'Erechtites hieraciifolius',
  'deschampsia caespitosa': 'Deschampsia cespitosa',
  'populus canadensis': 'Populus ×canadensis',
  'populus x canadensis': 'Populus ×canadensis',
  'rubus': 'Rubus sp.',
  'rubus spp.': 'Rubus sp.',
}

const BY_LATIN = new Map(SPECIES_91XX.map((s) => [normalizeName(s.latin), s]))

/** Wpis katalogu po nazwie naukowej (synonimy, literówki z przewodnika, podgatunki → gatunek). */
export function findSpecies91XX(name: string): SpeciesEntry91XX | undefined {
  const key = normalizeName(name)
  if (!key) return undefined
  const look = (k: string) => BY_LATIN.get(k) ?? BY_LATIN.get(normalizeName(SYNONYMS[k] ?? ''))
  const direct = look(key)
  if (direct) return direct
  const binomial = key.split(' ').slice(0, 2).join(' ')
  return binomial !== key ? look(binomial) : undefined
}

export function defaultLayer91XX(e: SpeciesEntry91XX): Layer {
  if (e.layer) return e.layer
  if (e.group === 'tree') return 'A'
  if (e.group === 'shrub') return 'B'
  if (e.latin.startsWith('Sphagnum')) return 'D'
  return 'C'
}

/** Gatunki typowe olsu z przewodnika (olsza, porzeczka czarna, kruszyna i trzon gatunków bagiennych dolinek). */
export const TYPICAL_91XX = SPECIES_91XX.filter((s) => s.typical).map((s) => s.latin)

const named = (rows: SpeciesRow[]) => rows.filter((r) => r.name?.trim())

/** Ile gatunków typowych olsu jest na liście – tylko pomoc dla eksperckiej oceny kombinacji. */
export function typicalMatch(rows: SpeciesRow[]): { present: string[]; total: number } {
  const present = new Set<string>()
  for (const r of named(rows)) {
    const e = findSpecies91XX(r.name)
    if (e?.typical) present.add(e.latin)
  }
  return { present: TYPICAL_91XX.filter((l) => present.has(l)), total: TYPICAL_91XX.length }
}

/** Wiersze należące do grup (np. łąkowe i pleustofity), z pokryciem. */
export const rowsOfGroups = (rows: SpeciesRow[], groups: SpeciesGroup91XX[]) =>
  named(rows).filter((r) => groups.includes(findSpecies91XX(r.name)?.group ?? 'other'))
