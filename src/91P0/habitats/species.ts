// Słownik gatunków dla 91P0 (jodłowy bór świętokrzyski, Abietetum polonicum), zebrany z przewodnika GIOŚ
// (Lorens 2010, rozdz. „Typowe gatunki roślin”, tab. 1), z przykładowej karty w przewodniku
// i z wykazu gatunków obcych w sprawozdaniach z monitoringu 2013–2014 i 2021.
import type { Layer, SpeciesRow } from '../../7120/habitats/types'
import { num } from '../../7120/habitats/assessment'

export type SpeciesGroup91P0 =
  | 'tree' // rodzime drzewo budujące drzewostan 91P0
  | 'shrub' // krzew podszytu
  | 'herb' // roślina runa typowa dla boru jodłowego
  | 'moss' // mszak typowy dla boru jodłowego
  | 'expansive' // rodzimy gatunek ekspansywny runa (jeżyny, malina, trzcinniki, orlica)
  | 'invasive' // inwazyjny gatunek obcy runa
  | 'alien-tree' // drzewo obce (geograficznie) – w drzewostanie i podszycie, zwykle też inwazyjne
  | 'pine-forest' // gatunek borów sosnowych – w większym udziale sygnał ubogiej postaci
  | 'fertile' // gatunek grądów i buczyn – sygnał przejścia w 9170/9130
  | 'other'

export interface SpeciesEntry91P0 {
  latin: string
  polish?: string
  group: SpeciesGroup91P0
  /** Czy należy do typowej kombinacji florystycznej (gatunki o najwyższej frekwencji z przewodnika). */
  typical?: boolean
  layer?: Layer
}

export const GROUP_LABELS_91P0: Record<SpeciesGroup91P0, string> = {
  tree: 'drzewo rodzime dla 91P0',
  shrub: 'krzew podszytu',
  herb: 'gatunek runa boru jodłowego',
  moss: 'mszak boru jodłowego',
  expansive: 'rodzimy gatunek ekspansywny',
  invasive: 'inwazyjny gatunek obcy',
  'alien-tree': 'drzewo obce',
  'pine-forest': 'gatunek borów sosnowych',
  fertile: 'gatunek grądów i buczyn',
  other: 'inny',
}

export const SPECIES_91P0: SpeciesEntry91P0[] = [
  // --- drzewostan ---
  { latin: 'Abies alba', polish: 'jodła pospolita', group: 'tree', typical: true, layer: 'A' },
  { latin: 'Picea abies', polish: 'świerk pospolity', group: 'tree', typical: true, layer: 'A' },
  { latin: 'Fagus sylvatica', polish: 'buk zwyczajny', group: 'tree', typical: true, layer: 'A' },
  { latin: 'Pinus sylvestris', polish: 'sosna zwyczajna', group: 'tree', typical: true, layer: 'A' },
  { latin: 'Carpinus betulus', polish: 'grab zwyczajny', group: 'tree', layer: 'A' },
  { latin: 'Populus tremula', polish: 'topola osika', group: 'tree', layer: 'A' },
  { latin: 'Betula pendula', polish: 'brzoza brodawkowata', group: 'tree', layer: 'A' },
  { latin: 'Acer pseudoplatanus', polish: 'klon jawor', group: 'tree', layer: 'A' },
  { latin: 'Quercus robur', polish: 'dąb szypułkowy', group: 'tree', layer: 'A' },
  { latin: 'Quercus petraea', polish: 'dąb bezszypułkowy', group: 'tree', layer: 'A' },
  { latin: 'Larix decidua', polish: 'modrzew europejski', group: 'tree', layer: 'A' },
  // --- podszyt ---
  { latin: 'Sorbus aucuparia', polish: 'jarząb pospolity', group: 'shrub', typical: true, layer: 'B' },
  { latin: 'Frangula alnus', polish: 'kruszyna pospolita', group: 'shrub', layer: 'B' },
  { latin: 'Sambucus racemosa', polish: 'bez koralowy', group: 'shrub', layer: 'B' },
  { latin: 'Sambucus nigra', polish: 'bez czarny', group: 'shrub', layer: 'B' },
  { latin: 'Corylus avellana', polish: 'leszczyna pospolita', group: 'shrub', layer: 'B' },
  // --- runo ---
  { latin: 'Oxalis acetosella', polish: 'szczawik zajęczy', group: 'herb', typical: true },
  { latin: 'Vaccinium myrtillus', polish: 'borówka czarna', group: 'herb', typical: true },
  { latin: 'Maianthemum bifolium', polish: 'konwalijka dwulistna', group: 'herb', typical: true },
  { latin: 'Carex digitata', polish: 'turzyca palczasta', group: 'herb', typical: true },
  { latin: 'Cruciata glabra', polish: 'krzyżownica naga (przytulia wiosenna)', group: 'herb', typical: true },
  { latin: 'Trientalis europaea', polish: 'siódmaczek leśny', group: 'herb', typical: true },
  { latin: 'Lycopodium annotinum', polish: 'widłak jałowcowaty', group: 'herb', typical: true },
  { latin: 'Mycelis muralis', polish: 'sałatnik leśny', group: 'herb', typical: true },
  { latin: 'Viola reichenbachiana', polish: 'fiołek leśny', group: 'herb', typical: true },
  { latin: 'Galeobdolon luteum', polish: 'gajowiec żółty', group: 'herb', typical: true },
  { latin: 'Luzula pilosa', polish: 'kosmatka owłosiona', group: 'herb', typical: true },
  { latin: 'Hieracium murorum', polish: 'jastrzębiec leśny', group: 'herb', typical: true },
  { latin: 'Circaea alpina', polish: 'czartawa drobna', group: 'herb', typical: true },
  { latin: 'Geranium robertianum', polish: 'bodziszek cuchnący', group: 'herb', typical: true },
  { latin: 'Epilobium montanum', polish: 'wierzbownica górska', group: 'herb', typical: true },
  { latin: 'Dryopteris dilatata', polish: 'nerecznica szerokolistna', group: 'herb', typical: true },
  { latin: 'Dryopteris carthusiana', polish: 'nerecznica krótkoostna', group: 'herb', typical: true },
  { latin: 'Dryopteris filix-mas', polish: 'nerecznica samcza', group: 'herb', typical: true },
  { latin: 'Gymnocarpium dryopteris', polish: 'zachyłka trójkątna', group: 'herb', typical: true },
  { latin: 'Phegopteris connectilis', polish: 'zachyłka oszczepowata', group: 'herb', typical: true },
  { latin: 'Athyrium filix-femina', polish: 'wietlica samicza', group: 'herb', typical: true },
  { latin: 'Rubus pedemontanus', polish: 'jeżyna Bellardiego', group: 'herb', typical: true },
  { latin: 'Huperzia selago', polish: 'wroniec widlasty', group: 'herb' },
  { latin: 'Calamagrostis arundinacea', polish: 'trzcinnik leśny', group: 'herb' },
  { latin: 'Deschampsia flexuosa', polish: 'śmiałek pogięty', group: 'herb' },
  { latin: 'Molinia caerulea', polish: 'trzęślica modra', group: 'herb' },
  // --- mszaki ---
  { latin: 'Polytrichastrum formosum', polish: 'płonnik strojny', group: 'moss', typical: true, layer: 'D' },
  { latin: 'Pleurozium schreberi', polish: 'rokietnik pospolity', group: 'moss', typical: true, layer: 'D' },
  { latin: 'Thuidium tamariscinum', polish: 'tujowiec tamaryszkowaty', group: 'moss', typical: true, layer: 'D' },
  { latin: 'Atrichum undulatum', polish: 'żurawiec falisty', group: 'moss', typical: true, layer: 'D' },
  { latin: 'Plagiomnium affine', polish: 'płaskomerzyk pokrewny', group: 'moss', typical: true, layer: 'D' },
  { latin: 'Hylocomium splendens', polish: 'gajnik lśniący', group: 'moss', typical: true, layer: 'D' },
  { latin: 'Dicranum scoparium', polish: 'widłoząb miotlasty', group: 'moss', layer: 'D' },
  { latin: 'Brachythecium spp.', polish: 'krótkosze', group: 'moss', layer: 'D' },
  { latin: 'Sphagnum spp.', polish: 'torfowce', group: 'moss', layer: 'D' },
  // --- ekspansywne (tab. 1: jeżyna gruczołowata i malina; sprawozdanie 2021: trzcinnik piaskowy) ---
  { latin: 'Rubus hirtus', polish: 'jeżyna gruczołowata', group: 'expansive', typical: true },
  { latin: 'Rubus idaeus', polish: 'malina właściwa', group: 'expansive' },
  { latin: 'Rubus spp.', polish: 'jeżyny', group: 'expansive' },
  { latin: 'Calamagrostis epigejos', polish: 'trzcinnik piaskowy', group: 'expansive' },
  { latin: 'Calamagrostis villosa', polish: 'trzcinnik owłosiony', group: 'expansive' },
  { latin: 'Pteridium aquilinum', polish: 'orlica pospolita', group: 'expansive' },
  // --- obce (tab. 1 i wykaz gatunków obcych ze sprawozdań 2013–2014 i 2021) ---
  { latin: 'Padus serotina', polish: 'czeremcha amerykańska', group: 'alien-tree', layer: 'B' },
  { latin: 'Quercus rubra', polish: 'dąb czerwony', group: 'alien-tree', layer: 'A' },
  { latin: 'Pseudotsuga menziesii', polish: 'daglezja zielona', group: 'alien-tree', layer: 'A' },
  { latin: 'Pinus strobus', polish: 'sosna wejmutka', group: 'alien-tree', layer: 'A' },
  { latin: 'Robinia pseudoacacia', polish: 'robinia akacjowa', group: 'alien-tree', layer: 'A' },
  { latin: 'Impatiens parviflora', polish: 'niecierpek drobnokwiatowy', group: 'invasive' },
  { latin: 'Solidago gigantea', polish: 'nawłoć późna', group: 'invasive' },
  { latin: 'Solidago canadensis', polish: 'nawłoć kanadyjska', group: 'invasive' },
  { latin: 'Erigeron annuus', polish: 'przymiotno białe', group: 'invasive' },
  { latin: 'Erechtites hieraciifolia', polish: 'erechtites jastrzębcowaty', group: 'invasive' },
  { latin: 'Bidens frondosa', polish: 'uczep amerykański', group: 'invasive' },
  { latin: 'Epilobium ciliatum', polish: 'wierzbownica gruczołowata', group: 'invasive' },
  // --- gatunki borów sosnowych (sygnał ubogiej postaci) ---
  { latin: 'Melampyrum pratense', polish: 'pszeniec zwyczajny', group: 'pine-forest' },
  { latin: 'Vaccinium vitis-idaea', polish: 'borówka brusznica', group: 'pine-forest' },
  { latin: 'Leucobryum glaucum', polish: 'bielistka siwa', group: 'pine-forest', layer: 'D' },
  { latin: 'Dicranum polysetum', polish: 'widłoząb kędzierzawy', group: 'pine-forest', layer: 'D' },
  { latin: 'Cladonia spp.', polish: 'chrobotki', group: 'pine-forest', layer: 'D' },
  // --- gatunki żyźniejszych lasów liściastych (sygnał przejścia w 9170 lub 9130) ---
  { latin: 'Galium odoratum', polish: 'przytulia wonna (marzanka)', group: 'fertile' },
  { latin: 'Asarum europaeum', polish: 'kopytnik pospolity', group: 'fertile' },
  { latin: 'Pulmonaria obscura', polish: 'miodunka ćma', group: 'fertile' },
  { latin: 'Galium schultesii', polish: 'przytulia Schultesa', group: 'fertile' },
  { latin: 'Anemone nemorosa', polish: 'zawilec gajowy', group: 'fertile' },
  { latin: 'Dentaria glandulosa', polish: 'żywiec gruczołowaty', group: 'fertile' },
]

// Nazwy z przykładowej karty z przewodnika i synonimy, które trzeba rozpoznać.
const SYNONYMS: Record<string, string> = {
  'majanthemum bifolium': 'Maianthemum bifolium',
  'asperula odorata': 'Galium odoratum',
  'prunus serotina': 'Padus serotina',
  'epilobium adenocaulon': 'Epilobium ciliatum',
  'lamium galeobdolon': 'Galeobdolon luteum',
  'solidago serotina': 'Solidago gigantea',
  'erechtites hieraciifolius': 'Erechtites hieraciifolia',
  'thelypteris phegopteris': 'Phegopteris connectilis',
  'polytrichum formosum': 'Polytrichastrum formosum',
  'mnium affine': 'Plagiomnium affine',
}

const BY_LATIN = new Map(SPECIES_91P0.map((s) => [s.latin.toLowerCase(), s]))

/** Wpis katalogu po nazwie naukowej (także synonimie albo z dopiskiem „sp.”). */
export function findSpecies91P0(name: string): SpeciesEntry91P0 | undefined {
  const key = name.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!key) return undefined
  const direct = BY_LATIN.get(key) ?? BY_LATIN.get(SYNONYMS[key]?.toLowerCase() ?? '')
  if (direct) return direct
  // „Rubus sp.”, „Brachythecium sp.” → pozycja zbiorcza rodzaju
  const genus = key.split(' ')[0]
  if (/ spp?\.?$/.test(key)) return BY_LATIN.get(`${genus} spp.`)
  return undefined
}

export function defaultLayer91P0(e: SpeciesEntry91P0): Layer {
  if (e.layer) return e.layer
  if (e.group === 'moss') return 'D'
  if (e.group === 'tree' || e.group === 'alien-tree') return 'A'
  if (e.group === 'shrub') return 'B'
  return 'C'
}

/** Typowa kombinacja florystyczna: gatunki o najwyższej frekwencji w Abietetum polonicum (przewodnik, rozdz. 4). */
export const TYPICAL_91P0 = SPECIES_91P0.filter((s) => s.typical).map((s) => s.latin)

const named = (rows: SpeciesRow[]) => rows.filter((r) => r.name?.trim())

/** Które gatunki typowej kombinacji są na liście, czy jest jodła i czy są sygnały innych siedlisk. */
export function typicalMatch(rows: SpeciesRow[]) {
  const entries = named(rows).map((r) => findSpecies91P0(r.name))
  const present = TYPICAL_91P0.filter((latin) => entries.some((e) => e?.latin === latin))
  const ofGroup = (g: SpeciesGroup91P0) =>
    named(rows)
      .filter((r) => findSpecies91P0(r.name)?.group === g)
      .map((r) => r.name.trim())
  return {
    present,
    total: TYPICAL_91P0.length,
    hasFir: present.includes('Abies alba'),
    fertile: ofGroup('fertile'),
    pineForest: ofGroup('pine-forest'),
  }
}

/** Pokrycie konkretnego gatunku na liście (suma wierszy z tą nazwą), undefined = brak liczby. */
export function coverOf(rows: SpeciesRow[], latin: string): number | undefined {
  const hits = named(rows).filter((r) => findSpecies91P0(r.name)?.latin === latin)
  const covers = hits.map((r) => num(r.cover)).filter((v): v is number => v !== undefined)
  return covers.length ? Math.round(covers.reduce((a, b) => a + b, 0) * 10) / 10 : undefined
}
