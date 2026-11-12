// Słownik gatunków dla 91I0, zebrany z przewodnika GIOŚ (rozdz. 91I0, „Typowe gatunki roślin”, tab. 1 i 2)
// i z przykładowej karty (Zimna Woda 1). Służy do wyszukiwarki i do liczenia podpowiedzi ocen.
import type { Layer, SpeciesRow } from '../../7120/habitats/types'
import { coverWhere, normalizeName } from '../../forest'

export type SpeciesGroup91I0 =
  | 'oak' // dąb budujący drzewostan (gatunek charakterystyczny drzewostanu)
  | 'char-tree' // inne drzewo charakterystyczne (brekinia)
  | 'quercetalia' // charakterystyczny dla rzędu Quercetalia pubescenti-petraeae (runo, podszyt)
  | 'thermo-margin' // ciepłolubny okrajkowy / murawowy (Trifolio-Geranietea, Festuco-Brometea)
  | 'molinion' // gatunek łąk trzęślicowych (Molinion) – wyróżnia podtyp 91I0-1
  | 'thermo-other' // inny gatunek ciepłolubny (szersze rozumienie)
  | 'shading' // gatunek zacieniający dno lasu (grąd, buczyna, leszczyna) – podszyt i odnowienie
  | 'tree' // inne drzewo rodzime
  | 'tree-alien' // drzewo obce geograficznie
  | 'invasive' // inwazyjny gatunek obcy runa i podszytu
  | 'expansive' // rodzimy gatunek ekspansywny
  | 'other'

export interface SpeciesEntry91I0 {
  latin: string
  polish?: string
  group: SpeciesGroup91I0
  layer?: Layer
}

export const GROUP_LABELS_91I0: Record<SpeciesGroup91I0, string> = {
  oak: 'dąb – gatunek charakterystyczny drzewostanu',
  'char-tree': 'drzewo charakterystyczne',
  quercetalia: 'gatunek charakterystyczny Quercetalia pubescenti-petraeae',
  'thermo-margin': 'gatunek ciepłolubny okrajkowy lub murawowy',
  molinion: 'gatunek łąk trzęślicowych (Molinion)',
  'thermo-other': 'inny gatunek ciepłolubny',
  shading: 'gatunek zacieniający dno lasu',
  tree: 'drzewo rodzime',
  'tree-alien': 'drzewo obce geograficznie',
  invasive: 'inwazyjny gatunek obcy',
  expansive: 'rodzimy gatunek ekspansywny',
  other: 'inny',
}

export const SPECIES_91I0: SpeciesEntry91I0[] = [
  // --- drzewostan: dęby i brekinia ---
  { latin: 'Quercus petraea', polish: 'dąb bezszypułkowy', group: 'oak', layer: 'A' },
  { latin: 'Quercus robur', polish: 'dąb szypułkowy', group: 'oak', layer: 'A' },
  { latin: 'Quercus petraea x robur', polish: 'dąb mieszaniec', group: 'oak', layer: 'A' },
  { latin: 'Quercus pubescens', polish: 'dąb omszony', group: 'oak', layer: 'A' },
  { latin: 'Sorbus torminalis', polish: 'jarząb brekinia', group: 'char-tree', layer: 'A' },
  // --- Quercetalia pubescenti-petraeae ---
  { latin: 'Potentilla alba', polish: 'pięciornik biały', group: 'quercetalia' },
  { latin: 'Pulmonaria angustifolia', polish: 'miodunka wąskolistna', group: 'quercetalia' },
  { latin: 'Ranunculus polyanthemos', polish: 'jaskier wielokwiatowy', group: 'quercetalia' },
  { latin: 'Vicia cassubica', polish: 'wyka kaszubska', group: 'quercetalia' },
  { latin: 'Campanula persicifolia', polish: 'dzwonek brzoskwiniolistny', group: 'quercetalia' },
  { latin: 'Hypericum montanum', polish: 'dziurawiec skąpolistny', group: 'quercetalia' },
  { latin: 'Lathyrus niger', polish: 'groszek czerniejący', group: 'quercetalia' },
  { latin: 'Melittis melissophyllum', polish: 'miodownik melisowaty', group: 'quercetalia' },
  { latin: 'Peucedanum cervaria', polish: 'gorysz siny', group: 'quercetalia' },
  { latin: 'Tanacetum corymbosum', polish: 'wrotycz baldachogroniasty', group: 'quercetalia' },
  { latin: 'Vincetoxicum hirundinaria', polish: 'ciemiężyk białokwiatowy', group: 'quercetalia' },
  { latin: 'Adenophora liliifolia', polish: 'dzwonecznik wonny', group: 'quercetalia' },
  { latin: 'Lithospermum purpurocaeruleum', polish: 'nawrot czerwonobłękitny', group: 'quercetalia' },
  { latin: 'Cephalanthera longifolia', polish: 'buławnik mieczolistny', group: 'quercetalia' },
  { latin: 'Fragaria moschata', polish: 'poziomka wysoka', group: 'quercetalia' },
  { latin: 'Dactylorhiza sambucina', polish: 'kukułka bzowa', group: 'quercetalia' },
  { latin: 'Silene nutans', polish: 'lepnica zwisła', group: 'quercetalia' },
  { latin: 'Lathyrus pisiformis', polish: 'groszek wielkoprzylistkowy', group: 'quercetalia' },
  { latin: 'Lychnis viscaria', polish: 'smółka pospolita', group: 'quercetalia' },
  // --- ciepłolubne okrajkowe i murawowe (Trifolio-Geranietea, Festuco-Brometea) ---
  { latin: 'Brachypodium pinnatum', polish: 'kłosownica pierzasta', group: 'thermo-margin' },
  { latin: 'Clinopodium vulgare', polish: 'czyścica storzyszek', group: 'thermo-margin' },
  { latin: 'Polygonatum odoratum', polish: 'kokoryczka wonna', group: 'thermo-margin' },
  { latin: 'Anthericum ramosum', polish: 'pajęcznica gałęzista', group: 'thermo-margin' },
  { latin: 'Anthericum liliago', polish: 'pajęcznica liliowata', group: 'thermo-margin' },
  { latin: 'Trifolium alpestre', polish: 'koniczyna dwukłosowa', group: 'thermo-margin' },
  { latin: 'Trifolium medium', polish: 'koniczyna pogięta', group: 'thermo-margin' },
  { latin: 'Trifolium rubens', polish: 'koniczyna długokłosowa', group: 'thermo-margin' },
  { latin: 'Geranium sanguineum', polish: 'bodziszek czerwony', group: 'thermo-margin' },
  { latin: 'Origanum vulgare', polish: 'lebiodka pospolita', group: 'thermo-margin' },
  { latin: 'Thalictrum minus', polish: 'rutewka mniejsza', group: 'thermo-margin' },
  { latin: 'Laserpitium latifolium', polish: 'okrzyn szerokolistny', group: 'thermo-margin' },
  { latin: 'Veronica teucrium', polish: 'przetacznik pagórkowy', group: 'thermo-margin' },
  { latin: 'Viola hirta', polish: 'fiołek kosmaty', group: 'thermo-margin' },
  { latin: 'Primula veris', polish: 'pierwiosnek lekarski', group: 'thermo-margin' },
  { latin: 'Fragaria viridis', polish: 'poziomka twardawa', group: 'thermo-margin' },
  { latin: 'Agrimonia eupatoria', polish: 'rzepik pospolity', group: 'thermo-margin' },
  { latin: 'Inula hirta', polish: 'oman szorstki', group: 'thermo-margin' },
  { latin: 'Cytisus nigricans', polish: 'szczodrzeniec czerniejący', group: 'thermo-margin' },
  { latin: 'Genista tinctoria', polish: 'janowiec barwierski', group: 'thermo-margin' },
  { latin: 'Peucedanum oreoselinum', polish: 'gorysz pagórkowy', group: 'thermo-margin' },
  // --- łąki trzęślicowe (Molinion) ---
  { latin: 'Betonica officinalis', polish: 'bukwica zwyczajna', group: 'molinion' },
  { latin: 'Galium boreale', polish: 'przytulia północna', group: 'molinion' },
  { latin: 'Serratula tinctoria', polish: 'sierpik barwierski', group: 'molinion' },
  { latin: 'Scorzonera humilis', polish: 'wężymord niski', group: 'molinion' },
  { latin: 'Iris sibirica', polish: 'kosaciec syberyjski', group: 'molinion' },
  { latin: 'Inula salicina', polish: 'oman wierzbolistny', group: 'molinion' },
  { latin: 'Gentiana pneumonanthe', polish: 'goryczka wąskolistna', group: 'molinion' },
  { latin: 'Selinum carvifolia', polish: 'olszewnik kminkolistny', group: 'molinion' },
  { latin: 'Succisa pratensis', polish: 'czarcikęs łąkowy', group: 'molinion' },
  // --- inne ciepłolubne (szersze rozumienie) ---
  { latin: 'Convallaria majalis', polish: 'konwalia majowa', group: 'thermo-other' },
  { latin: 'Poa angustifolia', polish: 'wiechlina wąskolistna', group: 'thermo-other' },
  { latin: 'Calamagrostis arundinacea', polish: 'trzcinnik leśny', group: 'thermo-other' },
  { latin: 'Lilium martagon', polish: 'lilia złotogłów', group: 'thermo-other' },
  { latin: 'Hieracium umbellatum', polish: 'jastrzębiec baldaszkowy', group: 'thermo-other' },
  { latin: 'Solidago virgaurea', polish: 'nawłoć pospolita', group: 'thermo-other' },
  { latin: 'Rubus saxatilis', polish: 'malina kamionka', group: 'thermo-other' },
  { latin: 'Melica nutans', polish: 'perłówka zwisła', group: 'other' },
  // --- zacieniające (grąd, buczyna) ---
  { latin: 'Carpinus betulus', polish: 'grab zwyczajny', group: 'shading', layer: 'B' },
  { latin: 'Corylus avellana', polish: 'leszczyna pospolita', group: 'shading', layer: 'B' },
  { latin: 'Fagus sylvatica', polish: 'buk zwyczajny', group: 'shading', layer: 'A' },
  { latin: 'Tilia cordata', polish: 'lipa drobnolistna', group: 'shading', layer: 'A' },
  { latin: 'Acer platanoides', polish: 'klon zwyczajny', group: 'shading', layer: 'B' },
  // --- inne drzewa i krzewy rodzime ---
  { latin: 'Pinus sylvestris', polish: 'sosna zwyczajna', group: 'tree', layer: 'A' },
  { latin: 'Betula pendula', polish: 'brzoza brodawkowata', group: 'tree', layer: 'A' },
  { latin: 'Sorbus aucuparia', polish: 'jarząb pospolity', group: 'tree', layer: 'B' },
  { latin: 'Frangula alnus', polish: 'kruszyna pospolita', group: 'tree', layer: 'B' },
  { latin: 'Juniperus communis', polish: 'jałowiec pospolity', group: 'tree', layer: 'B' },
  { latin: 'Pyrus communis', polish: 'grusza pospolita', group: 'tree', layer: 'B' },
  { latin: 'Viburnum opulus', polish: 'kalina koralowa', group: 'tree', layer: 'B' },
  { latin: 'Picea abies', polish: 'świerk pospolity', group: 'tree', layer: 'A' },
  // --- drzewa obce geograficznie ---
  { latin: 'Robinia pseudoacacia', polish: 'robinia akacjowa', group: 'tree-alien', layer: 'A' },
  { latin: 'Quercus rubra', polish: 'dąb czerwony', group: 'tree-alien', layer: 'A' },
  { latin: 'Larix decidua', polish: 'modrzew europejski', group: 'tree-alien', layer: 'A' },
  { latin: 'Pseudotsuga menziesii', polish: 'daglezja zielona', group: 'tree-alien', layer: 'A' },
  { latin: 'Pinus strobus', polish: 'sosna wejmutka', group: 'tree-alien', layer: 'A' },
  // --- inwazyjne obce ---
  { latin: 'Padus serotina', polish: 'czeremcha amerykańska', group: 'invasive', layer: 'B' },
  { latin: 'Impatiens parviflora', polish: 'niecierpek drobnokwiatowy', group: 'invasive' },
  { latin: 'Carex brizoides', polish: 'turzyca drżączkowata (neofit regionalnie)', group: 'invasive' },
  { latin: 'Solidago canadensis', polish: 'nawłoć kanadyjska', group: 'invasive' },
  { latin: 'Solidago gigantea', polish: 'nawłoć późna', group: 'invasive' },
  { latin: 'Erigeron annuus', polish: 'przymiotno białe', group: 'invasive' },
  // --- rodzime ekspansywne ---
  { latin: 'Calamagrostis epigejos', polish: 'trzcinnik piaskowy', group: 'expansive' },
  { latin: 'Rubus idaeus', polish: 'malina właściwa', group: 'expansive' },
  { latin: 'Rubus sp.', polish: 'jeżyna', group: 'expansive' },
  { latin: 'Pteridium aquilinum', polish: 'orlica pospolita', group: 'other' },
  { latin: 'Urtica dioica', polish: 'pokrzywa zwyczajna', group: 'expansive' },
  // --- inne częste ---
  { latin: 'Vaccinium myrtillus', polish: 'borówka czarna', group: 'other' },
  { latin: 'Anemone nemorosa', polish: 'zawilec gajowy', group: 'other' },
  { latin: 'Fragaria vesca', polish: 'poziomka pospolita', group: 'other' },
  { latin: 'Melampyrum pratense', polish: 'pszeniec zwyczajny', group: 'other' },
  { latin: 'Veronica chamaedrys', polish: 'przetacznik ożankowy', group: 'other' },
  { latin: 'Viola riviniana', polish: 'fiołek Rivina', group: 'other' },
  { latin: 'Luzula pilosa', polish: 'kosmatka owłosiona', group: 'other' },
  { latin: 'Galium mollugo', polish: 'przytulia pospolita', group: 'other' },
  { latin: 'Trientalis europaea', polish: 'siódmaczek leśny', group: 'other' },
]

const INDEX = new Map<string, SpeciesEntry91I0>()
for (const s of SPECIES_91I0) {
  INDEX.set(normalizeName(s.latin), s)
  if (s.polish) INDEX.set(normalizeName(s.polish), s)
}

/** Szuka po nazwie łacińskiej albo polskiej. Każdy „Rubus …” poza kamionką to jeżyna (ekspansywna). */
export function findSpecies91I0(name: string): SpeciesEntry91I0 | undefined {
  const n = normalizeName(name)
  const hit = INDEX.get(n)
  if (hit) return hit
  if (n.startsWith('rubus') && !n.includes('saxatilis')) return { latin: name.trim(), group: 'expansive' }
  if (n.startsWith('quercus') && !n.includes('rubra')) return { latin: name.trim(), group: 'oak', layer: 'A' }
  return undefined
}

export function defaultLayer91I0(e: SpeciesEntry91I0): Layer {
  return e.layer ?? 'C'
}

const groupOf = (name: string) => findSpecies91I0(name)?.group

/** Pokrycie gatunków z grup (w tym nazwy, nieznane pomijane). */
export const coverOfGroups = (rows: SpeciesRow[] | unknown, groups: SpeciesGroup91I0[]) =>
  coverWhere(rows, (n) => groups.includes(groupOf(n) ?? 'other'))

/** Grupy liczone jako „ciepłolubne gatunki charakterystyczne” (Quercetalia + okrajkowe + murawowe). */
export const THERMO_CHAR_GROUPS: SpeciesGroup91I0[] = ['quercetalia', 'thermo-margin']

// ---------- podtypy siedliska ----------

export type Subtype91I0 = '91I0-1' | '91I0-2' | '91I0-3'

export const SUBTYPES_91I0: Record<Subtype91I0, string> = {
  '91I0-1': '91I0-1 Dąbrowa świetlista (Potentillo albae-Quercetum)',
  '91I0-2': '91I0-2 Podgórska ciepłolubna dąbrowa brekiniowa (Sorbo torminalis-Quercetum)',
  '91I0-3': '91I0-3 Kserotermiczna dąbrowa z dębem omszonym (Quercetum pubescenti-petraeae)',
}

export const subtypeOf = (site: { subtype?: unknown } | undefined): Subtype91I0 | undefined => {
  const v = site?.subtype
  return typeof v === 'string' && v in SUBTYPES_91I0 ? (v as Subtype91I0) : undefined
}
