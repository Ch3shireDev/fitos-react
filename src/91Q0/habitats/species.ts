// Słownik gatunków dla 91Q0 (górskie reliktowe laski sosnowe, Erico-Pinion), zebrany z przewodnika GIOŚ
// (Perzanowska 2010, rozdz. „Typowe gatunki roślin” i tab. 1), z przykładowej karty (Macelowa Góra 2008)
// oraz ze sprawozdań z monitoringu 2013–2014 i 2021 (gatunki charakterystyczne, ciepłolubne, obce ekologicznie).
import type { Layer, SpeciesRow } from '../../7120/habitats/types'
import { num } from '../../7120/habitats/assessment'
import { normalizeName } from '../../forest'

export type SpeciesGroup91Q0 =
  | 'tree' // sosna – jedyne drzewo budujące laski
  | 'shrub' // krzew podszytu typowy dla siedliska
  | 'herb' // roślina runa typowa dla lasków (gatunki naskalne, murawowe, borowe)
  | 'thermo' // gatunek ciepłolubny runa (Festuco-Brometea, okrajki) – nie z listy charakterystycznych
  | 'eco-alien' // drzewo rodzime, ale obce ekologicznie w laskach (buk, świerk, jodła, jesion, olsza szara, modrzew)
  | 'expansive' // rodzimy gatunek ekspansywny (apofit) – w laskach dotąd nie notowany
  | 'invasive' // gatunek obcy geograficznie – w laskach dotąd nie notowany
  | 'other'

export type Region91Q0 = 'pieniny' | 'tatry'

export interface SpeciesEntry91Q0 {
  latin: string
  polish?: string
  group: SpeciesGroup91Q0
  /** Gatunek charakterystyczny lasków (tab. 1 przewodnika, typowe gatunki, sprawozdania). */
  characteristic?: boolean
  /** Gatunek ciepłolubny runa (do wskaźnika „Gatunki ciepłolubne w runie”). */
  thermophilous?: boolean
  /** Gatunek wymieniany w przewodniku tylko dla jednego regionu. */
  region?: Region91Q0
  layer?: Layer
}

export const GROUP_LABELS_91Q0: Record<SpeciesGroup91Q0, string> = {
  tree: 'drzewo lasków sosnowych',
  shrub: 'krzew podszytu lasków',
  herb: 'gatunek runa lasków sosnowych',
  thermo: 'gatunek ciepłolubny runa',
  'eco-alien': 'drzewo obce ekologicznie w 91Q0',
  expansive: 'rodzimy gatunek ekspansywny',
  invasive: 'gatunek obcy geograficznie',
  other: 'inny',
}

const C = true

export const SPECIES_91Q0: SpeciesEntry91Q0[] = [
  // --- drzewostan ---
  { latin: 'Pinus sylvestris', polish: 'sosna zwyczajna', group: 'tree', characteristic: C, layer: 'A' },
  // --- podszyt (tab. 1) ---
  { latin: 'Cornus sanguinea', polish: 'dereń świdwa', group: 'shrub', characteristic: C, layer: 'B' },
  { latin: 'Lonicera xylosteum', polish: 'wiciokrzew suchodrzew', group: 'shrub', characteristic: C, layer: 'B' },
  { latin: 'Berberis vulgaris', polish: 'berberys zwyczajny', group: 'shrub', characteristic: C, layer: 'B' },
  { latin: 'Frangula alnus', polish: 'kruszyna pospolita', group: 'shrub', characteristic: C, layer: 'B' },
  { latin: 'Juniperus communis', polish: 'jałowiec pospolity', group: 'shrub', characteristic: C, layer: 'B' },
  { latin: 'Viburnum opulus', polish: 'kalina koralowa', group: 'shrub', characteristic: C, layer: 'B' },
  { latin: 'Corylus avellana', polish: 'leszczyna pospolita', group: 'shrub', characteristic: C, layer: 'B' },
  { latin: 'Rosa spp.', polish: 'róże', group: 'shrub', characteristic: C, layer: 'B' },
  { latin: 'Crataegus spp.', polish: 'głogi', group: 'shrub', characteristic: C, layer: 'B' },
  { latin: 'Cotoneaster spp.', polish: 'irgi', group: 'shrub', characteristic: C, layer: 'B' },
  { latin: 'Cotoneaster integerrimus', polish: 'irga zwyczajna', group: 'shrub', characteristic: C, layer: 'B' },
  { latin: 'Sorbus aria', polish: 'jarząb mączny', group: 'shrub', characteristic: C, layer: 'B' },
  { latin: 'Ribes alpinum', polish: 'porzeczka alpejska', group: 'shrub', characteristic: C, layer: 'B' },
  { latin: 'Rubus saxatilis', polish: 'malina kamionka', group: 'herb', characteristic: C },
  // --- runo, oba regiony ---
  { latin: 'Calamagrostis varia', polish: 'trzcinnik pstry', group: 'herb', characteristic: C },
  { latin: 'Sesleria varia', polish: 'sesleria skalna', group: 'herb', characteristic: C, thermophilous: C },
  { latin: 'Pimpinella saxifraga', polish: 'biedrzeniec mniejszy', group: 'herb', characteristic: C, thermophilous: C },
  // --- runo, Pieniny ---
  { latin: 'Carex alba', polish: 'turzyca biała', group: 'herb', characteristic: C, region: 'pieniny' },
  { latin: 'Carex digitata', polish: 'turzyca palczasta', group: 'herb', characteristic: C, region: 'pieniny' },
  { latin: 'Orthilia secunda', polish: 'gruszyczka jednostronna', group: 'herb', characteristic: C, region: 'pieniny' },
  { latin: 'Melica nutans', polish: 'perłówka zwisła', group: 'herb', characteristic: C, region: 'pieniny' },
  { latin: 'Hieracium murorum', polish: 'jastrzębiec leśny', group: 'herb', characteristic: C, region: 'pieniny' },
  { latin: 'Valeriana tripteris', polish: 'kozłek trójlistkowy', group: 'herb', characteristic: C, region: 'pieniny' },
  { latin: 'Epipactis atrorubens', polish: 'kruszczyk rdzawoczerwony', group: 'herb', characteristic: C, thermophilous: C, region: 'pieniny' },
  { latin: 'Clematis alpina', polish: 'powojnik alpejski', group: 'herb', characteristic: C, region: 'pieniny' },
  { latin: 'Bupleurum falcatum', polish: 'przewiercień sierpowaty', group: 'herb', characteristic: C, thermophilous: C, region: 'pieniny' },
  { latin: 'Salvia verticillata', polish: 'szałwia okółkowa', group: 'herb', characteristic: C, thermophilous: C, region: 'pieniny' },
  { latin: 'Euphorbia cyparissias', polish: 'wilczomlecz sosnka', group: 'herb', characteristic: C, thermophilous: C, region: 'pieniny' },
  // --- runo, Tatry ---
  { latin: 'Carex sempervirens subsp. tatrorum', polish: 'turzyca zawsze zielona tatrzańska', group: 'herb', characteristic: C, region: 'tatry' },
  { latin: 'Polygonatum multiflorum', polish: 'kokoryczka wielokwiatowa', group: 'herb', characteristic: C, region: 'tatry' },
  { latin: 'Convallaria majalis', polish: 'konwalia majowa', group: 'herb', characteristic: C, region: 'tatry' },
  { latin: 'Carduus glaucus', polish: 'oset siny', group: 'herb', characteristic: C, region: 'tatry' },
  { latin: 'Primula auricula', polish: 'pierwiosnek łyszczak', group: 'herb', characteristic: C, region: 'tatry' },
  { latin: 'Leontodon incanus', polish: 'brodawnik szary', group: 'herb', characteristic: C, region: 'tatry' },
  { latin: 'Jovibarba sobolifera', polish: 'rojownik pospolity', group: 'herb', characteristic: C, region: 'tatry' },
  { latin: 'Pulsatilla slavica', polish: 'sasanka słowacka', group: 'herb', characteristic: C, region: 'tatry' },
  { latin: 'Anthyllis alpestris', polish: 'przelot alpejski', group: 'herb', characteristic: C, region: 'tatry' },
  { latin: 'Allium montanum', polish: 'czosnek skalny', group: 'herb', characteristic: C, thermophilous: C, region: 'tatry' },
  { latin: 'Campanula cochleariifolia', polish: 'dzwonek drobny', group: 'herb', characteristic: C, region: 'tatry' },
  { latin: 'Vaccinium vitis-idaea', polish: 'borówka brusznica', group: 'herb', characteristic: C, region: 'tatry' },
  { latin: 'Thesium alpinum', polish: 'leniec alpejski', group: 'herb', characteristic: C, region: 'tatry' },
  { latin: 'Festuca tatrae', polish: 'kostrzewa tatrzańska', group: 'herb', characteristic: C, region: 'tatry' },
  { latin: 'Bellidiastrum michelii', polish: 'stokrotnica górska', group: 'herb', characteristic: C, region: 'tatry' },
  { latin: 'Phyteuma orbiculare', polish: 'zerwa kulista', group: 'herb', characteristic: C, region: 'tatry' },
  { latin: 'Hieracium bupleuroides', polish: 'jastrzębiec przewiercieniolistny', group: 'herb', characteristic: C, region: 'tatry' },
  // --- pozostałe gatunki ciepłolubne runa (przykładowa karta 2008, sprawozdania 2014 i 2021) ---
  { latin: 'Coronilla varia', polish: 'cieciorka pstra', group: 'thermo', thermophilous: C },
  { latin: 'Vincetoxicum hirundinaria', polish: 'ciemiężyk białokwiatowy', group: 'thermo', thermophilous: C },
  { latin: 'Carlina acaulis', polish: 'dziewięćsił bezłodygowy', group: 'thermo', thermophilous: C },
  { latin: 'Polygonatum odoratum', polish: 'kokoryczka wonna', group: 'thermo', thermophilous: C },
  { latin: 'Origanum vulgare', polish: 'lebiodka pospolita', group: 'thermo', thermophilous: C },
  { latin: 'Teucrium montanum', polish: 'ożanka górska', group: 'thermo', thermophilous: C },
  { latin: 'Hieracium bifidum', polish: 'jastrzębiec siny', group: 'thermo', thermophilous: C },
  { latin: 'Clinopodium vulgare', polish: 'czyścica storzyszek', group: 'thermo', thermophilous: C },
  { latin: 'Medicago falcata', polish: 'lucerna sierpowata', group: 'thermo', thermophilous: C },
  { latin: 'Libanotis pyrenaica', polish: 'oleśnik górski', group: 'thermo', thermophilous: C },
  { latin: 'Thymus pulegioides', polish: 'macierzanka zwyczajna', group: 'thermo', thermophilous: C },
  { latin: 'Galium album', polish: 'przytulia biała', group: 'thermo', thermophilous: C },
  // --- drzewa obce ekologicznie (tab. 1, sprawozdania 2014 i 2021) ---
  { latin: 'Fagus sylvatica', polish: 'buk zwyczajny', group: 'eco-alien', layer: 'A' },
  { latin: 'Picea abies', polish: 'świerk pospolity', group: 'eco-alien', layer: 'A' },
  { latin: 'Abies alba', polish: 'jodła pospolita', group: 'eco-alien', layer: 'A' },
  { latin: 'Fraxinus excelsior', polish: 'jesion wyniosły', group: 'eco-alien', layer: 'A' },
  { latin: 'Alnus incana', polish: 'olsza szara', group: 'eco-alien', layer: 'A' },
  { latin: 'Larix decidua', polish: 'modrzew europejski', group: 'eco-alien', layer: 'A' },
  // --- rodzime ekspansywne: w laskach dotąd nie notowane; typowe apofity lasów górskich (interpretacja) ---
  { latin: 'Calamagrostis epigejos', polish: 'trzcinnik piaskowy', group: 'expansive' },
  { latin: 'Rubus idaeus', polish: 'malina właściwa', group: 'expansive' },
  { latin: 'Urtica dioica', polish: 'pokrzywa zwyczajna', group: 'expansive' },
  { latin: 'Chamaenerion angustifolium', polish: 'wierzbówka kiprzyca', group: 'expansive' },
  // --- obce geograficznie: w laskach nie notowane w 2006–2021; najczęstsze inwazyjne w Karpatach (interpretacja) ---
  { latin: 'Impatiens parviflora', polish: 'niecierpek drobnokwiatowy', group: 'invasive' },
  { latin: 'Impatiens glandulifera', polish: 'niecierpek gruczołowaty', group: 'invasive' },
  { latin: 'Solidago gigantea', polish: 'nawłoć późna', group: 'invasive' },
  { latin: 'Solidago canadensis', polish: 'nawłoć kanadyjska', group: 'invasive' },
  { latin: 'Erigeron annuus', polish: 'przymiotno białe', group: 'invasive' },
  { latin: 'Reynoutria japonica', polish: 'rdestowiec ostrokończysty', group: 'invasive' },
  { latin: 'Robinia pseudoacacia', polish: 'robinia akacjowa', group: 'invasive', layer: 'A' },
]

// Nazwy z przewodnika i sprawozdań (literówki, synonimy), które trzeba rozpoznać.
const SYNONYMS: Record<string, string> = {
  'cornus sanquinea': 'Cornus sanguinea',
  'popiela saxifraga': 'Pimpinella saxifraga',
  'euphorbia cyparisias': 'Euphorbia cyparissias',
  'campanula cochlearifolia': 'Campanula cochleariifolia',
  'carex sempervirens': 'Carex sempervirens subsp. tatrorum',
  'carex tatrorum': 'Carex sempervirens subsp. tatrorum',
  'aster bellidiastrum': 'Bellidiastrum michelii',
  'seseli libanotis': 'Libanotis pyrenaica',
  'polygonatum officinale': 'Polygonatum odoratum',
  'epilobium angustifolium': 'Chamaenerion angustifolium',
  'fallopia japonica': 'Reynoutria japonica',
  'solidago serotina': 'Solidago gigantea',
}

const BY_LATIN = new Map(SPECIES_91Q0.map((s) => [s.latin.toLowerCase(), s]))

/** Wpis katalogu po nazwie naukowej (także synonimie albo z dopiskiem „sp.”/„spp.”). */
export function findSpecies91Q0(name: string): SpeciesEntry91Q0 | undefined {
  const key = normalizeName(name)
  if (!key) return undefined
  const direct = BY_LATIN.get(key) ?? BY_LATIN.get(SYNONYMS[key]?.toLowerCase() ?? '')
  if (direct) return direct
  const genus = key.split(' ')[0]
  // „Rosa sp.”, „Cotoneaster sp.” → pozycja zbiorcza rodzaju
  if (/ spp?\.?$/.test(key)) return BY_LATIN.get(`${genus} spp.`)
  return undefined
}

export function defaultLayer91Q0(e: SpeciesEntry91Q0): Layer {
  if (e.layer) return e.layer
  if (e.group === 'tree' || e.group === 'eco-alien') return 'A'
  if (e.group === 'shrub') return 'B'
  return 'C'
}

export const CHARACTERISTIC_91Q0 = SPECIES_91Q0.filter((s) => s.characteristic).map((s) => s.latin)
export const THERMOPHILOUS_91Q0 = SPECIES_91Q0.filter((s) => s.thermophilous).map((s) => s.latin)

/** Grupy, które na liście gatunków charakterystycznych albo ciepłolubnych nie mają czego szukać. */
const FOREIGN_GROUPS: SpeciesGroup91Q0[] = ['eco-alien', 'expansive', 'invasive']

const named = (rows: SpeciesRow[]) => rows.filter((r) => r.name?.trim())

export interface ListSummary {
  /** Gatunki liczone do wskaźnika (wszystkie wpisane poza obcymi i ekspansywnymi z katalogu). */
  counted: string[]
  /** Z tego rozpoznane w katalogu jako właściwe dla wskaźnika. */
  fromCatalog: string[]
  /** Wpisane, ale z katalogu wiadomo, że nie należą do wskaźnika (drzewa obce ekologicznie, ekspansywne, obce). */
  foreign: string[]
  /** Suma pokrycia liczonych gatunków; undefined, gdy żaden nie ma pokrycia. */
  cover?: number
}

function summarize(rows: SpeciesRow[], belongs: (e: SpeciesEntry91Q0) => boolean): ListSummary {
  const out: ListSummary = { counted: [], fromCatalog: [], foreign: [] }
  const covers: number[] = []
  for (const r of named(rows)) {
    const n = r.name.trim()
    const e = findSpecies91Q0(n)
    if (e && FOREIGN_GROUPS.includes(e.group)) {
      out.foreign.push(n)
      continue
    }
    out.counted.push(n)
    if (e && belongs(e)) out.fromCatalog.push(n)
    const c = num(r.cover)
    if (c !== undefined) covers.push(c)
  }
  if (covers.length) out.cover = Math.round(covers.reduce((a, b) => a + b, 0) * 10) / 10
  return out
}

/** Lista gatunków charakterystycznych: co się liczy, co pochodzi z listy przewodnika, co jest nie na miejscu. */
export const characteristicSummary = (rows: SpeciesRow[]) => summarize(rows, (e) => Boolean(e.characteristic))

/** Lista gatunków ciepłolubnych runa: to samo dla wskaźnika „Gatunki ciepłolubne w runie”. */
export const thermophilousSummary = (rows: SpeciesRow[]) => summarize(rows, (e) => Boolean(e.thermophilous))

/** Gatunki z listy należące do grupy (np. „eco-alien”). */
export const namesOfGroup = (rows: SpeciesRow[], group: SpeciesGroup91Q0) =>
  named(rows)
    .filter((r) => findSpecies91Q0(r.name)?.group === group)
    .map((r) => r.name.trim())
