// Słownik gatunków dla 40A0, zebrany z przewodnika GIOŚ (rozdz. 40A0, „Typowe gatunki roślin”, tab. 1),
// z przykładowej karty (Garb Pińczowski) i ze sprawozdań z monitoringu 2013–2024.
// Służy do wyszukiwarki gatunków i do liczenia podpowiedzi ocen.
import type { Layer, SpeciesRow } from '../../7120/habitats/types'
import { num } from '../../7120/habitats/assessment'

export type SpeciesGroup40A0 =
  | 'key' // gatunek siedliskotwórczy: wisienka stepowa albo irga zwyczajna
  | 'shrub' // krzew charakterystyczny zarośli ciepłolubnych (Rhamno-Prunetea, Prunetalia spinosae)
  | 'grassland' // gatunek charakterystyczny muraw kserotermicznych i naskalnych (Festuco-Brometea, Alysso-Sedion)
  | 'tree' // drzewo rodzime – liczy się do „zwarcia drzew i krzewów innych niż wisienka”
  | 'expansive' // rodzimy gatunek ekspansywny roślin zielnych
  | 'invasive-high' // obcy, silnie inwazyjny
  | 'invasive-low' // obcy o niskim stopniu inwazyjności
  | 'other'

export interface SpeciesEntry40A0 {
  latin: string
  polish?: string
  group: SpeciesGroup40A0
  layer?: Layer
}

export const GROUP_LABELS_40A0: Record<SpeciesGroup40A0, string> = {
  key: 'gatunek siedliskotwórczy (wisienka / irga)',
  shrub: 'krzew charakterystyczny (Rhamno-Prunetea)',
  grassland: 'gatunek charakterystyczny muraw (Festuco-Brometea)',
  tree: 'drzewo',
  expansive: 'gatunek ekspansywny',
  'invasive-high': 'obcy, silnie inwazyjny',
  'invasive-low': 'obcy, nisko inwazyjny',
  other: 'inny',
}

export const CERASUS = 'Cerasus fruticosa'
export const COTONEASTER = 'Cotoneaster integerrimus'

export const SPECIES_40A0: SpeciesEntry40A0[] = [
  // --- gatunki siedliskotwórcze ---
  { latin: CERASUS, polish: 'wisienka stepowa (wiśnia karłowata)', group: 'key', layer: 'B' },
  { latin: COTONEASTER, polish: 'irga zwyczajna', group: 'key', layer: 'B' },
  // --- krzewy zarośli ciepłolubnych (Rhamno-Prunetea) ---
  { latin: 'Spiraea media', polish: 'tawuła średnia', group: 'shrub', layer: 'B' },
  { latin: 'Rosa canina', polish: 'róża dzika', group: 'shrub', layer: 'B' },
  { latin: 'Rosa tomentosa', polish: 'róża kutnerowata', group: 'shrub', layer: 'B' },
  { latin: 'Rosa dumalis', polish: 'róża sina', group: 'shrub', layer: 'B' },
  { latin: 'Rosa rubiginosa', polish: 'róża rdzawa', group: 'shrub', layer: 'B' },
  { latin: 'Rosa gallica', polish: 'róża francuska', group: 'shrub', layer: 'B' },
  { latin: 'Rosa sp.', polish: 'róża', group: 'shrub', layer: 'B' },
  { latin: 'Acer campestre', polish: 'klon polny', group: 'shrub', layer: 'B' },
  { latin: 'Clematis vitalba', polish: 'powojnik pnący', group: 'shrub', layer: 'B' },
  { latin: 'Cornus sanguinea', polish: 'dereń świdwa', group: 'shrub', layer: 'B' },
  { latin: 'Crataegus monogyna', polish: 'głóg jednoszyjkowy', group: 'shrub', layer: 'B' },
  { latin: 'Crataegus laevigata', polish: 'głóg dwuszyjkowy', group: 'shrub', layer: 'B' },
  { latin: 'Crataegus rhipidophylla', polish: 'głóg odgiętodziałkowy', group: 'shrub', layer: 'B' },
  { latin: 'Crataegus sp.', polish: 'głóg', group: 'shrub', layer: 'B' },
  { latin: 'Euonymus europaeus', polish: 'trzmielina pospolita', group: 'shrub', layer: 'B' },
  { latin: 'Euonymus verrucosus', polish: 'trzmielina brodawkowata', group: 'shrub', layer: 'B' },
  { latin: 'Prunus spinosa', polish: 'śliwa tarnina', group: 'shrub', layer: 'B' },
  { latin: 'Rhamnus cathartica', polish: 'szakłak pospolity', group: 'shrub', layer: 'B' },
  { latin: 'Ulmus minor', polish: 'wiąz polny (var. suberosa)', group: 'shrub', layer: 'B' },
  { latin: 'Juniperus communis', polish: 'jałowiec pospolity', group: 'shrub', layer: 'B' },
  { latin: 'Berberis vulgaris', polish: 'berberys zwyczajny', group: 'shrub', layer: 'B' },
  { latin: 'Ligustrum vulgare', polish: 'ligustr pospolity', group: 'shrub', layer: 'B' },
  { latin: 'Viburnum lantana', polish: 'kalina hordowina', group: 'shrub', layer: 'B' },
  { latin: 'Cotoneaster melanocarpus', polish: 'irga czarnoowocowa', group: 'shrub', layer: 'B' },
  // --- inne krzewy ---
  { latin: 'Frangula alnus', polish: 'kruszyna pospolita', group: 'other', layer: 'B' },
  { latin: 'Corylus avellana', polish: 'leszczyna pospolita', group: 'other', layer: 'B' },
  { latin: 'Sambucus nigra', polish: 'bez czarny', group: 'other', layer: 'B' },
  // --- drzewa ---
  { latin: 'Betula pendula', polish: 'brzoza brodawkowata', group: 'tree', layer: 'A' },
  { latin: 'Pinus sylvestris', polish: 'sosna zwyczajna', group: 'tree', layer: 'A' },
  { latin: 'Pyrus communis', polish: 'grusza pospolita', group: 'tree', layer: 'A' },
  { latin: 'Pyrus pyraster', polish: 'grusza polna', group: 'tree', layer: 'A' },
  { latin: 'Malus sylvestris', polish: 'jabłoń dzika', group: 'tree', layer: 'A' },
  { latin: 'Fraxinus excelsior', polish: 'jesion wyniosły', group: 'tree', layer: 'A' },
  { latin: 'Quercus robur', polish: 'dąb szypułkowy', group: 'tree', layer: 'A' },
  { latin: 'Quercus petraea', polish: 'dąb bezszypułkowy', group: 'tree', layer: 'A' },
  { latin: 'Carpinus betulus', polish: 'grab zwyczajny', group: 'tree', layer: 'A' },
  { latin: 'Populus tremula', polish: 'topola osika', group: 'tree', layer: 'A' },
  { latin: 'Acer pseudoplatanus', polish: 'klon jawor', group: 'tree', layer: 'A' },
  { latin: 'Acer platanoides', polish: 'klon zwyczajny', group: 'tree', layer: 'A' },
  { latin: 'Sorbus aucuparia', polish: 'jarząb pospolity', group: 'tree', layer: 'A' },
  { latin: 'Picea abies', polish: 'świerk pospolity', group: 'tree', layer: 'A' },
  { latin: 'Tilia cordata', polish: 'lipa drobnolistna', group: 'tree', layer: 'A' },
  { latin: 'Cerasus avium', polish: 'czereśnia (wiśnia ptasia)', group: 'tree', layer: 'A' },
  { latin: 'Cerasus vulgaris', polish: 'wiśnia pospolita (hodowlana)', group: 'tree', layer: 'B' },
  { latin: 'Prunus domestica', polish: 'śliwa domowa', group: 'tree', layer: 'B' },
  // --- murawy kserotermiczne i naskalne (Festuco-Brometea, Alysso-Sedion) ---
  { latin: 'Adonis vernalis', polish: 'miłek wiosenny', group: 'grassland' },
  { latin: 'Anemone sylvestris', polish: 'zawilec wielkokwiatowy', group: 'grassland' },
  { latin: 'Inula ensifolia', polish: 'oman wąskolistny', group: 'grassland' },
  { latin: 'Carex humilis', polish: 'turzyca niska', group: 'grassland' },
  { latin: 'Festuca rupicola', polish: 'kostrzewa bruzdkowana', group: 'grassland' },
  { latin: 'Festuca valesiaca', polish: 'kostrzewa walezyjska', group: 'grassland' },
  { latin: 'Festuca pallens', polish: 'kostrzewa blada', group: 'grassland' },
  { latin: 'Euphorbia cyparissias', polish: 'wilczomlecz sosnka', group: 'grassland' },
  { latin: 'Helianthemum nummularium', polish: 'posłonek rozesłany', group: 'grassland' },
  { latin: 'Peucedanum cervaria', polish: 'gorysz siny', group: 'grassland' },
  { latin: 'Pimpinella saxifraga', polish: 'biedrzeniec mniejszy', group: 'grassland' },
  { latin: 'Salvia pratensis', polish: 'szałwia łąkowa', group: 'grassland' },
  { latin: 'Veronica spicata', polish: 'przetacznik kłosowy', group: 'grassland' },
  { latin: 'Vincetoxicum hirundinaria', polish: 'ciemiężyk białokwiatowy', group: 'grassland' },
  { latin: 'Thymus austriacus', polish: 'macierzanka austriacka', group: 'grassland' },
  { latin: 'Thymus kosteleckyanus', polish: 'macierzanka Kosteleckiego', group: 'grassland' },
  { latin: 'Thymus pulegioides', polish: 'macierzanka zwyczajna', group: 'grassland' },
  { latin: 'Scabiosa ochroleuca', polish: 'driakiew żółtawa', group: 'grassland' },
  { latin: 'Medicago falcata', polish: 'lucerna sierpowata', group: 'grassland' },
  { latin: 'Potentilla arenaria', polish: 'pięciornik piaskowy', group: 'grassland' },
  { latin: 'Campanula bononiensis', polish: 'dzwonek boloński', group: 'grassland' },
  { latin: 'Falcaria vulgaris', polish: 'sierpnica pospolita', group: 'grassland' },
  { latin: 'Fragaria viridis', polish: 'poziomka twardawa', group: 'grassland' },
  { latin: 'Galium verum', polish: 'przytulia właściwa', group: 'grassland' },
  { latin: 'Centaurea scabiosa', polish: 'chaber driakiewnik', group: 'grassland' },
  { latin: 'Achillea pannonica', polish: 'krwawnik pannoński', group: 'grassland' },
  { latin: 'Pulsatilla pratensis', polish: 'sasanka łąkowa', group: 'grassland' },
  { latin: 'Orchis ustulata', polish: 'storczyk drobnokwiatowy', group: 'grassland' },
  { latin: 'Linum hirsutum', polish: 'len włochaty', group: 'grassland' },
  { latin: 'Carlina onopordifolia', polish: 'dziewięćsił popłocholistny', group: 'grassland' },
  { latin: 'Stipa capillata', polish: 'ostnica włosowata', group: 'grassland' },
  { latin: 'Stipa joannis', polish: 'ostnica Jana', group: 'grassland' },
  { latin: 'Koeleria macrantha', polish: 'strzęplica nadobna', group: 'grassland' },
  { latin: 'Teucrium chamaedrys', polish: 'ożanka właściwa', group: 'grassland' },
  { latin: 'Asperula cynanchica', polish: 'marzanka pagórkowa', group: 'grassland' },
  { latin: 'Aster amellus', polish: 'aster gawędka', group: 'grassland' },
  { latin: 'Cirsium pannonicum', polish: 'ostrożeń pannoński', group: 'grassland' },
  { latin: 'Seseli annuum', polish: 'żebrzyca roczna', group: 'grassland' },
  { latin: 'Allium montanum', polish: 'czosnek skalny', group: 'grassland' },
  { latin: 'Phleum phleoides', polish: 'tymotka Boehmera', group: 'grassland' },
  { latin: 'Viola hirta', polish: 'fiołek kosmaty', group: 'grassland' },
  { latin: 'Sedum album', polish: 'rozchodnik biały', group: 'grassland' },
  { latin: 'Sedum maximum', polish: 'rozchodnik wielki', group: 'grassland' },
  { latin: 'Jovibarba sobolifera', polish: 'rojownik pospolity', group: 'grassland' },
  { latin: 'Asplenium septentrionale', polish: 'zanokcica północna', group: 'grassland' },
  { latin: 'Asplenium ruta-muraria', polish: 'zanokcica murowa', group: 'grassland' },
  { latin: 'Galium pumilum', polish: 'przytulia hercyńska', group: 'grassland' },
  { latin: 'Silene vulgaris', polish: 'lepnica rozdęta', group: 'grassland' },
  { latin: 'Hieracium schmidtii', polish: 'jastrzębiec Schmidta', group: 'grassland' },
  // --- inne gatunki runa ---
  { latin: 'Agrimonia eupatoria', polish: 'rzepik pospolity', group: 'other' },
  { latin: 'Cruciata glabra', polish: 'krzyżownica naga', group: 'other' },
  { latin: 'Lathyrus pratensis', polish: 'groszek łąkowy', group: 'other' },
  { latin: 'Phleum pratense', polish: 'tymotka łąkowa', group: 'other' },
  { latin: 'Poa angustifolia', polish: 'wiechlina wąskolistna', group: 'other' },
  { latin: 'Polygala sp.', polish: 'krzyżownica', group: 'other' },
  { latin: 'Taraxacum officinale', polish: 'mniszek lekarski', group: 'other' },
  { latin: 'Achillea millefolium', polish: 'krwawnik pospolity', group: 'other' },
  { latin: 'Carex sp.', polish: 'turzyca', group: 'other' },
  { latin: 'Inula conyza', polish: 'oman szlachtawa', group: 'other' },
  { latin: 'Digitalis grandiflora', polish: 'naparstnica zwyczajna', group: 'other' },
  { latin: 'Polypodium vulgare', polish: 'paprotka zwyczajna', group: 'other' },
  { latin: 'Galeopsis ladanum', polish: 'poziewnik polny', group: 'other' },
  { latin: 'Origanum vulgare', polish: 'lebiodka pospolita', group: 'other' },
  // --- rodzime ekspansywne rośliny zielne ---
  { latin: 'Calamagrostis epigejos', polish: 'trzcinnik piaskowy', group: 'expansive' },
  { latin: 'Elymus repens', polish: 'perz właściwy', group: 'expansive' },
  { latin: 'Elymus hispidus', polish: 'perz siny', group: 'expansive' },
  { latin: 'Artemisia vulgaris', polish: 'bylica pospolita', group: 'expansive' },
  { latin: 'Rubus spp.', polish: 'jeżyny', group: 'expansive' },
  { latin: 'Rubus sp.', polish: 'jeżyna', group: 'expansive' },
  { latin: 'Pteridium aquilinum', polish: 'orlica pospolita', group: 'expansive' },
  { latin: 'Arrhenatherum elatius', polish: 'rajgras wyniosły', group: 'expansive' },
  { latin: 'Brachypodium pinnatum', polish: 'kłosownica pierzasta', group: 'expansive' },
  { latin: 'Urtica dioica', polish: 'pokrzywa zwyczajna', group: 'expansive' },
  // --- obce, silnie inwazyjne ---
  { latin: 'Solidago gigantea', polish: 'nawłoć późna', group: 'invasive-high' },
  { latin: 'Solidago canadensis', polish: 'nawłoć kanadyjska', group: 'invasive-high' },
  { latin: 'Robinia pseudoacacia', polish: 'robinia akacjowa', group: 'invasive-high', layer: 'B' },
  { latin: 'Ailanthus altissima', polish: 'bożodrzew gruczołowaty', group: 'invasive-high', layer: 'B' },
  { latin: 'Prunus serotina', polish: 'czeremcha amerykańska', group: 'invasive-high', layer: 'B' },
  { latin: 'Acer negundo', polish: 'klon jesionolistny', group: 'invasive-high', layer: 'B' },
  { latin: 'Reynoutria japonica', polish: 'rdestowiec ostrokończysty', group: 'invasive-high' },
  { latin: 'Erigeron annuus', polish: 'przymiotno białe', group: 'invasive-high' },
  // --- obce, nisko inwazyjne ---
  { latin: 'Juglans regia', polish: 'orzech włoski', group: 'invasive-low', layer: 'B' },
  { latin: 'Syringa vulgaris', polish: 'lilak pospolity', group: 'invasive-low', layer: 'B' },
  { latin: 'Lycium barbarum', polish: 'kolcowój pospolity', group: 'invasive-low', layer: 'B' },
  { latin: 'Rhus typhina', polish: 'sumak octowiec', group: 'invasive-low', layer: 'B' },
  { latin: 'Mahonia aquifolium', polish: 'mahonia pospolita', group: 'invasive-low', layer: 'B' },
  { latin: 'Conyza canadensis', polish: 'konyza kanadyjska', group: 'invasive-low' },
]

const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ')

const INDEX = new Map<string, SpeciesEntry40A0>()
for (const e of SPECIES_40A0) {
  INDEX.set(normalize(e.latin), e)
  if (e.polish) INDEX.set(normalize(e.polish), e)
}
// Pisownia z kart terenowych i literatury
INDEX.set('cornus sanquinea', INDEX.get('cornus sanguinea')!)
INDEX.set('euonymus europaea', INDEX.get('euonymus europaeus')!)
INDEX.set('euonymus verrucosa', INDEX.get('euonymus verrucosus')!)
INDEX.set('prunus fruticosa', INDEX.get('cerasus fruticosa')!)
INDEX.set('agropyron intermedium', INDEX.get('elymus hispidus')!)

/** Szuka po nazwie łacińskiej (także „Cornus sanquinea”, „Prunus fruticosa”) albo polskiej. */
export function findSpecies40A0(name: string): SpeciesEntry40A0 | undefined {
  const n = normalize(name)
  const hit = INDEX.get(n)
  if (hit) return hit
  if (n.startsWith('rubus')) return { latin: name.trim(), group: 'expansive' }
  if (n.startsWith('rosa ')) return { latin: name.trim(), group: 'shrub', layer: 'B' }
  if (n.startsWith('crataegus ')) return { latin: name.trim(), group: 'shrub', layer: 'B' }
  return undefined
}

export function defaultLayer40A0(e: SpeciesEntry40A0): Layer {
  if (e.layer) return e.layer
  if (e.group === 'tree') return 'A'
  if (e.group === 'shrub' || e.group === 'key') return 'B'
  return 'C'
}

// ---------- warianty siedliska ----------

export type Variant40A0 = 'cerasus' | 'cotoneaster'

export const VARIANTS_40A0: Record<Variant40A0, { label: string; keySpecies: string; keyName: string }> = {
  cerasus: {
    label: 'Zarośla wisienki stepowej (Prunetum fruticosae)',
    keySpecies: CERASUS,
    keyName: 'wisienka stepowa',
  },
  cotoneaster: {
    label: 'Naskalne zarośla irgi zwyczajnej (Junipero communis-Cotoneasteretum integerrimi)',
    keySpecies: COTONEASTER,
    keyName: 'irga zwyczajna',
  },
}

export const variantOf = (site: { variant?: unknown } | undefined): Variant40A0 | undefined => {
  const v = site?.variant
  return typeof v === 'string' && v in VARIANTS_40A0 ? (v as Variant40A0) : undefined
}

// ---------- liczenie ----------

const named = (rows: SpeciesRow[]) => rows.filter((r) => r.name?.trim())

/** Liczba różnych gatunków charakterystycznych w każdej z dwóch klas (krzewy / murawy). */
export function characteristicByClass(rows: SpeciesRow[]) {
  const shrubs = new Set<string>()
  const grassland = new Set<string>()
  for (const r of named(rows)) {
    const e = findSpecies40A0(r.name)
    if (!e) continue
    if (e.group === 'key' || e.group === 'shrub') shrubs.add(e.latin)
    if (e.group === 'grassland') grassland.add(e.latin)
  }
  return { shrubs: [...shrubs], grassland: [...grassland] }
}

/** Gatunki z listy należące do grup i ich łączne pokrycie (undefined, gdy żaden nie ma pokrycia). */
export function rowsOfGroups(rows: SpeciesRow[], groups: SpeciesGroup40A0[], { unknownAs }: { unknownAs?: SpeciesGroup40A0 } = {}) {
  const hits = named(rows).filter((r) => {
    const g = findSpecies40A0(r.name)?.group ?? unknownAs
    return g !== undefined && groups.includes(g)
  })
  const covers = hits.map((r) => num(r.cover)).filter((v): v is number => v !== undefined)
  return {
    names: hits.map((r) => r.name.trim()),
    total: covers.length ? Math.round(covers.reduce((a, b) => a + b, 0) * 10) / 10 : undefined,
  }
}
