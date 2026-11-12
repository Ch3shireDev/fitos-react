// Słownik gatunków dla *91E0, zebrany z przewodnika GIOŚ (rozdz. „Typowe gatunki roślin” i tab. 1)
// oraz z przykładowej karty (Tomasówka Górna). Służy do wyszukiwarki gatunków i do podpowiedzi ocen.
import type { Layer, SpeciesRow } from '../../7120/habitats/types'

export type SpeciesGroup91E0 =
  | 'char' // gatunek typowy dla łęgów (przynajmniej jednego podtypu)
  | 'tree' // rodzime drzewo łęgowe
  | 'tree-geo-alien' // drzewo obce geograficznie (zawsze)
  | 'invasive' // inwazyjny gatunek obcy runa i podszytu
  | 'expansive' // rodzimy ekspansywny apofit runa
  | 'key' // gatunek kluczowy dla różnorodności (wskaźnik fakultatywny)
  | 'other'

export interface SpeciesEntry91E0 {
  latin: string
  polish?: string
  group: SpeciesGroup91E0
  layer?: Layer
}

export const GROUP_LABELS_91E0: Record<SpeciesGroup91E0, string> = {
  char: 'gatunek typowy dla łęgów',
  tree: 'drzewo łęgowe',
  'tree-geo-alien': 'drzewo obce geograficznie',
  invasive: 'inwazyjny gatunek obcy',
  expansive: 'rodzimy gatunek ekspansywny',
  key: 'gatunek kluczowy dla różnorodności',
  other: 'inny',
}

export const SPECIES_91E0: SpeciesEntry91E0[] = [
  // --- drzewa łęgowe ---
  { latin: 'Alnus glutinosa', polish: 'olsza czarna', group: 'tree', layer: 'A' },
  { latin: 'Alnus incana', polish: 'olsza szara', group: 'tree', layer: 'A' },
  { latin: 'Fraxinus excelsior', polish: 'jesion wyniosły', group: 'tree', layer: 'A' },
  { latin: 'Salix alba', polish: 'wierzba biała', group: 'tree', layer: 'A' },
  { latin: 'Salix fragilis', polish: 'wierzba krucha', group: 'tree', layer: 'A' },
  { latin: 'Populus alba', polish: 'topola biała', group: 'tree', layer: 'A' },
  { latin: 'Populus nigra', polish: 'topola czarna', group: 'tree', layer: 'A' },
  { latin: 'Populus ×canescens', polish: 'topola szara', group: 'tree', layer: 'A' },
  { latin: 'Padus avium', polish: 'czeremcha zwyczajna', group: 'tree', layer: 'B' },
  { latin: 'Acer pseudoplatanus', polish: 'klon jawor', group: 'tree', layer: 'A' },
  { latin: 'Acer platanoides', polish: 'klon zwyczajny', group: 'tree', layer: 'A' },
  { latin: 'Ulmus glabra', polish: 'wiąz górski', group: 'tree', layer: 'A' },
  { latin: 'Ulmus laevis', polish: 'wiąz szypułkowy', group: 'tree', layer: 'A' },
  { latin: 'Quercus robur', polish: 'dąb szypułkowy', group: 'tree', layer: 'A' },
  { latin: 'Picea abies', polish: 'świerk pospolity (w naturalnym zasięgu)', group: 'tree', layer: 'A' },
  { latin: 'Salix triandra', polish: 'wierzba trójpręcikowa', group: 'char', layer: 'B' },
  { latin: 'Corylus avellana', polish: 'leszczyna zwyczajna', group: 'char', layer: 'B' },
  { latin: 'Frangula alnus', polish: 'kruszyna pospolita', group: 'char', layer: 'B' },
  { latin: 'Ribes nigrum', polish: 'porzeczka czarna', group: 'char', layer: 'B' },
  { latin: 'Humulus lupulus', polish: 'chmiel zwyczajny', group: 'char', layer: 'B' },
  { latin: 'Lonicera xylosteum', polish: 'suchodrzew pospolity', group: 'other', layer: 'B' },
  { latin: 'Rosa pendulina', polish: 'róża alpejska', group: 'other', layer: 'B' },
  { latin: 'Sorbus aucuparia', polish: 'jarząb pospolity', group: 'other', layer: 'B' },
  { latin: 'Ribes uva-crispa', polish: 'porzeczka agrest', group: 'other', layer: 'B' },
  // --- drzewa obce geograficznie ---
  { latin: 'Fraxinus pennsylvanica', polish: 'jesion pensylwański', group: 'tree-geo-alien', layer: 'A' },
  { latin: 'Populus ×canadensis', polish: 'topola kanadyjska (euroamerykańska)', group: 'tree-geo-alien', layer: 'A' },
  { latin: 'Acer negundo', polish: 'klon jesionolistny', group: 'tree-geo-alien', layer: 'A' },
  { latin: 'Robinia pseudacacia', polish: 'robinia akacjowa', group: 'tree-geo-alien', layer: 'A' },
  { latin: 'Quercus rubra', polish: 'dąb czerwony', group: 'tree-geo-alien', layer: 'A' },
  // --- runo: gatunki typowe łęgów (tab. 1) ---
  { latin: 'Aegopodium podagraria', polish: 'podagrycznik zwyczajny', group: 'char' },
  { latin: 'Anemone ranunculoides', polish: 'zawilec żółty', group: 'char' },
  { latin: 'Anemone nemorosa', polish: 'zawilec gajowy', group: 'char' },
  { latin: 'Athyrium filix-femina', polish: 'wietlica samicza', group: 'char' },
  { latin: 'Calystegia sepium', polish: 'kielisznik zaroślowy', group: 'char' },
  { latin: 'Carex elongata', polish: 'turzyca długokłosa', group: 'char' },
  { latin: 'Carex rostrata', polish: 'turzyca dzióbkowata', group: 'char' },
  { latin: 'Carex remota', polish: 'turzyca odległokłosa', group: 'char' },
  { latin: 'Chaerophyllum hirsutum', polish: 'świerząbek orzęsiony', group: 'char' },
  { latin: 'Chrysosplenium alternifolium', polish: 'śledziennica skrętolistna', group: 'char' },
  { latin: 'Circaea alpina', polish: 'czartawa drobna', group: 'char' },
  { latin: 'Circaea lutetiana', polish: 'czartawa pospolita', group: 'char' },
  { latin: 'Circaea intermedia', polish: 'czartawa pośrednia', group: 'char' },
  { latin: 'Eupatorium cannabinum', polish: 'sadziec konopiasty', group: 'char' },
  { latin: 'Festuca gigantea', polish: 'kostrzewa olbrzymia', group: 'char' },
  { latin: 'Ficaria verna', polish: 'ziarnopłon wiosenny', group: 'char' },
  { latin: 'Galium aparine', polish: 'przytulia czepna', group: 'char' },
  { latin: 'Galium palustre', polish: 'przytulia błotna', group: 'char' },
  { latin: 'Geum rivale', polish: 'kuklik zwisły', group: 'char' },
  { latin: 'Impatiens noli-tangere', polish: 'niecierpek pospolity', group: 'char' },
  { latin: 'Iris pseudacorus', polish: 'kosaciec żółty', group: 'char' },
  { latin: 'Galeobdolon luteum', polish: 'gajowiec żółty', group: 'char' },
  { latin: 'Lycopus europaeus', polish: 'karbieniec pospolity', group: 'char' },
  { latin: 'Lysimachia vulgaris', polish: 'tojeść pospolita', group: 'char' },
  { latin: 'Lysimachia nemorum', polish: 'tojeść gajowa', group: 'char' },
  { latin: 'Lythrum salicaria', polish: 'krwawnica pospolita', group: 'char' },
  { latin: 'Phalaris arundinacea', polish: 'mozga trzcinowata', group: 'char' },
  { latin: 'Rubus caesius', polish: 'jeżyna popielica', group: 'char' },
  { latin: 'Salvia glutinosa', polish: 'szałwia lepka', group: 'char' },
  { latin: 'Scutellaria galericulata', polish: 'tarczyca pospolita', group: 'char' },
  { latin: 'Solanum dulcamara', polish: 'psianka słodkogórz', group: 'char' },
  { latin: 'Stachys sylvatica', polish: 'czyściec leśny', group: 'char' },
  { latin: 'Stellaria nemorum', polish: 'gwiazdnica gajowa', group: 'char' },
  { latin: 'Symphytum officinale', polish: 'żywokost lekarski', group: 'char' },
  { latin: 'Urtica dioica', polish: 'pokrzywa zwyczajna', group: 'char' },
  { latin: 'Rorippa amphibia', polish: 'rzepicha ziemnowodna', group: 'char' },
  { latin: 'Ranunculus repens', polish: 'jaskier rozłogowy', group: 'char' },
  { latin: 'Ranunculus lanuginosus', polish: 'jaskier kosmaty', group: 'char' },
  { latin: 'Elymus repens', polish: 'perz właściwy', group: 'char' },
  { latin: 'Artemisia vulgaris', polish: 'bylica pospolita', group: 'char' },
  { latin: 'Cirsium arvense', polish: 'ostrożeń polny', group: 'char' },
  { latin: 'Equisetum arvense', polish: 'skrzyp polny', group: 'char' },
  { latin: 'Galeopsis tetrahit', polish: 'poziewnik szorstki', group: 'char' },
  { latin: 'Glechoma hederacea', polish: 'bluszczyk kurdybanek', group: 'char' },
  { latin: 'Cardamine amara', polish: 'rzeżucha gorzka', group: 'char' },
  { latin: 'Mercurialis perennis', polish: 'szczyr trwały', group: 'char' },
  { latin: 'Senecio fuchsii', polish: 'starzec Fuchsa', group: 'char' },
  { latin: 'Senecio nemorensis', polish: 'starzec gajowy', group: 'other' },
  { latin: 'Astrantia major', polish: 'jarzmianka większa', group: 'char' },
  { latin: 'Equisetum telmateia', polish: 'skrzyp olbrzymi', group: 'char' },
  { latin: 'Rumex sanguineus', polish: 'szczaw gajowy', group: 'char' },
  { latin: 'Asarum europaeum', polish: 'kopytnik pospolity', group: 'char' },
  { latin: 'Veronica montana', polish: 'przetacznik górski', group: 'char' },
  { latin: 'Veronica beccabunga', polish: 'przetacznik bobowniczek', group: 'char' },
  { latin: 'Geranium phaeum', polish: 'bodziszek żałobny', group: 'char' },
  { latin: 'Matteuccia struthiopteris', polish: 'pióropusznik strusi', group: 'char' },
  { latin: 'Leucojum vernum', polish: 'śnieżyca wiosenna', group: 'char' },
  { latin: 'Carduus personata', polish: 'oset łopianowaty', group: 'char' },
  { latin: 'Thalictrum aquilegiifolium', polish: 'rutewka orlikolistna', group: 'char' },
  { latin: 'Anthriscus nitida', polish: 'trybula lśniąca', group: 'char' },
  { latin: 'Aposeris foetida', polish: 'sałatnica leśna', group: 'char' },
  { latin: 'Euphorbia amygdaloides', polish: 'wilczomlecz migdałolistny', group: 'char' },
  { latin: 'Petasites kablikianus', polish: 'lepiężnik wyłysiały', group: 'char' },
  { latin: 'Petasites hybridus', polish: 'lepiężnik różowy', group: 'char' },
  { latin: 'Petasites albus', polish: 'lepiężnik biały', group: 'char' },
  { latin: 'Symphytum cordatum', polish: 'żywokost sercowaty', group: 'char' },
  { latin: 'Tussilago farfara', polish: 'podbiał pospolity', group: 'char' },
  { latin: 'Telekia speciosa', polish: 'smotrawa okazała', group: 'char' },
  { latin: 'Cirsium oleraceum', polish: 'ostrożeń warzywny', group: 'char' },
  { latin: 'Crepis paludosa', polish: 'pępawa błotna', group: 'char' },
  { latin: 'Filipendula ulmaria', polish: 'wiązówka błotna', group: 'char' },
  { latin: 'Poa nemoralis', polish: 'wiechlina gajowa', group: 'char' },
  { latin: 'Caltha laeta', polish: 'knieć błotna górska', group: 'char' },
  { latin: 'Valeriana simplicifolia', polish: 'kozłek całolistny', group: 'char' },
  { latin: 'Scirpus sylvaticus', polish: 'sitowie leśne', group: 'char' },
  { latin: 'Myosotis palustris', polish: 'niezapominajka błotna', group: 'char' },
  // --- inne z przykładowej karty ---
  { latin: 'Campanula trachelium', polish: 'dzwonek pokrzywolistny', group: 'other' },
  { latin: 'Carex sylvatica', polish: 'turzyca leśna', group: 'other' },
  { latin: 'Deschampsia caespitosa', polish: 'śmiałek darniowy', group: 'other' },
  { latin: 'Dryopteris carthusiana', polish: 'nerecznica krótkoostna', group: 'other' },
  { latin: 'Dryopteris filix-mas', polish: 'nerecznica samcza', group: 'other' },
  { latin: 'Epilobium montanum', polish: 'wierzbownica górska', group: 'other' },
  { latin: 'Euphorbia dulcis', polish: 'wilczomlecz słodki', group: 'other' },
  { latin: 'Geranium robertianum', polish: 'bodziszek cuchnący', group: 'other' },
  { latin: 'Geum urbanum', polish: 'kuklik pospolity', group: 'other' },
  { latin: 'Heracleum sphondylium', polish: 'barszcz zwyczajny', group: 'other' },
  { latin: 'Maianthemum bifolium', polish: 'konwalijka dwulistna', group: 'other' },
  { latin: 'Mycelis muralis', polish: 'sałatnik leśny', group: 'other' },
  { latin: 'Oxalis acetosella', polish: 'szczawik zajęczy', group: 'other' },
  { latin: 'Paris quadrifolia', polish: 'czworolist pospolity', group: 'other' },
  { latin: 'Phyteuma spicatum', polish: 'złocień kłosowy', group: 'other' },
  { latin: 'Poa remota', polish: 'wiechlina odległokłosa', group: 'other' },
  { latin: 'Poa trivialis', polish: 'wiechlina zwyczajna', group: 'other' },
  { latin: 'Polygonatum verticillatum', polish: 'kokoryczka okółkowa', group: 'other' },
  { latin: 'Primula elatior', polish: 'pierwiosnek wyniosły', group: 'other' },
  { latin: 'Rubus idaeus', polish: 'malina właściwa', group: 'other' },
  { latin: 'Veratrum lobelianum', polish: 'ciemiężyca zielona', group: 'other' },
  { latin: 'Viola reichenbachiana', polish: 'fiołek leśny', group: 'other' },
  // --- inwazyjne gatunki obce (tab. 1 i raport 2013–2014) ---
  { latin: 'Impatiens parviflora', polish: 'niecierpek drobnokwiatowy', group: 'invasive' },
  { latin: 'Impatiens glandulifera', polish: 'niecierpek gruczołowaty', group: 'invasive' },
  { latin: 'Bidens frondosa', polish: 'uczep amerykański', group: 'invasive' },
  { latin: 'Echinocystis lobata', polish: 'kolczurka klapowana', group: 'invasive' },
  { latin: 'Solidago gigantea', polish: 'nawłoć późna', group: 'invasive' },
  { latin: 'Solidago canadensis', polish: 'nawłoć kanadyjska', group: 'invasive' },
  { latin: 'Parthenocissus quinquefolia', polish: 'winobluszcz pięciolistkowy', group: 'invasive' },
  { latin: 'Reynoutria japonica', polish: 'rdestowiec ostrokończysty', group: 'invasive' },
  { latin: 'Reynoutria sachalinensis', polish: 'rdestowiec sachaliński', group: 'invasive' },
  { latin: 'Mimulus guttatus', polish: 'kroplik żółty', group: 'invasive' },
  { latin: 'Heracleum sosnowskyi', polish: 'barszcz Sosnowskiego', group: 'invasive' },
  // --- rodzime ekspansywne ---
  { latin: 'Rubus hirtus', polish: 'jeżyna gruczołowata', group: 'expansive' },
  { latin: 'Brachypodium sylvaticum', polish: 'kłosownica leśna', group: 'expansive' },
  // --- kluczowe dla różnorodności (wskaźnik fakultatywny) ---
  { latin: 'Dendrocopos leucotos', polish: 'dzięcioł białogrzbiety', group: 'key' },
  { latin: 'Dendrocopos medius', polish: 'dzięcioł średni', group: 'key' },
  { latin: 'Ficedula albicollis', polish: 'muchołówka białoszyja', group: 'key' },
  { latin: 'Cucujus cinnaberinus', polish: 'zgniotek cynobrowy', group: 'key' },
  { latin: 'Protaetia aeruginosa', polish: 'kwietnica okazała', group: 'key' },
  { latin: 'Dorcus parallelipipedus', polish: 'ciołek matowy', group: 'key' },
  { latin: 'Osmoderma eremita', polish: 'pachnica dębowa', group: 'key' },
  { latin: 'Euphydryas maturna', polish: 'przeplatka maturna', group: 'key' },
]

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[×x]\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const INDEX = new Map<string, SpeciesEntry91E0>()
for (const e of SPECIES_91E0) {
  INDEX.set(normalize(e.latin), e)
  if (e.polish) INDEX.set(normalize(e.polish), e)
}

/** Synonimy z kart i przewodnika – sprowadzone do nazwy w słowniku. */
const SYNONYMS: Record<string, string> = {
  'lamiastrum galeobdolon': 'Galeobdolon luteum',
  'lamium galeobdolon': 'Galeobdolon luteum',
  'agropyron repens': 'Elymus repens',
  'caltha palustris subsp. laeta': 'Caltha laeta',
  'matteucia struthiopteris': 'Matteuccia struthiopteris',
  'leucoium vernum': 'Leucojum vernum',
  'ciracea intermedia': 'Circaea intermedia',
  'prunus padus': 'Padus avium',
  'populus canescens': 'Populus ×canescens',
  'populus euramericana': 'Populus ×canadensis',
}

/** Szuka po nazwie łacińskiej albo polskiej (wielkość liter i znak mieszańca bez znaczenia). */
export function findSpecies91E0(name: string): SpeciesEntry91E0 | undefined {
  const n = normalize(name)
  const hit = INDEX.get(n)
  if (hit) return hit
  const syn = SYNONYMS[n]
  if (syn) return INDEX.get(normalize(syn))
  return undefined
}

export function defaultLayer91E0(e: SpeciesEntry91E0): Layer {
  if (e.layer) return e.layer
  if (e.group.startsWith('tree')) return 'A'
  return 'C'
}

// ---------- podtypy siedliska (Poradnik ochrony siedlisk) i ich typowe gatunki (tab. 1 przewodnika) ----------

export type Subtype91E0 = '91E0-1' | '91E0-2' | '91E0-3' | '91E0-4' | '91E0-5' | '91E0-6' | '91E0-7' | '91E0-8'

const ASH_ALDER = [
  'Alnus glutinosa',
  'Fraxinus excelsior',
  'Padus avium',
  'Impatiens noli-tangere',
  'Urtica dioica',
  'Galeobdolon luteum',
  'Stellaria nemorum',
  'Chrysosplenium alternifolium',
  'Circaea lutetiana',
  'Athyrium filix-femina',
  'Lysimachia vulgaris',
]

export const SUBTYPES_91E0: Record<Subtype91E0, { label: string; typical: string[] }> = {
  '91E0-1': {
    label: '91E0-1 Nadrzeczny łęg wierzbowy (Salicetum albae)',
    typical: [
      'Salix alba',
      'Salix fragilis',
      'Calystegia sepium',
      'Galium aparine',
      'Lysimachia vulgaris',
      'Phalaris arundinacea',
      'Rorippa amphibia',
      'Ranunculus repens',
      'Rubus caesius',
      'Salix triandra',
      'Symphytum officinale',
      'Urtica dioica',
    ],
  },
  '91E0-2': {
    label: '91E0-2 Nadrzeczny łęg topolowy (Populetum albae)',
    typical: [
      'Populus alba',
      'Populus nigra',
      'Populus ×canescens',
      'Elymus repens',
      'Artemisia vulgaris',
      'Cirsium arvense',
      'Equisetum arvense',
      'Galeopsis tetrahit',
      'Galium aparine',
      'Glechoma hederacea',
      'Rubus caesius',
      'Urtica dioica',
    ],
  },
  '91E0-3': { label: '91E0-3 Niżowy łęg jesionowo-olszowy (Fraxino-Alnetum)', typical: ASH_ALDER },
  '91E0-4': { label: '91E0-4 Łęg gwiazdnicowy (Stellario nemorum-Alnetum glutinosae)', typical: ASH_ALDER },
  '91E0-5': {
    label: '91E0-5 Podgórski łęg jesionowy (Carici remotae-Fraxinetum)',
    typical: [
      'Fraxinus excelsior',
      'Alnus incana',
      'Senecio fuchsii',
      'Stachys sylvatica',
      'Urtica dioica',
      'Chaerophyllum hirsutum',
      'Impatiens noli-tangere',
      'Astrantia major',
      'Carex remota',
      'Circaea intermedia',
      'Equisetum telmateia',
      'Rumex sanguineus',
      'Asarum europaeum',
      'Anemone nemorosa',
      'Ranunculus lanuginosus',
      'Festuca gigantea',
      'Mercurialis perennis',
      'Aegopodium podagraria',
      'Veronica montana',
    ],
  },
  '91E0-6': {
    label: '91E0-6 Nadrzeczna olszyna górska (Alnetum incanae)',
    typical: [
      'Alnus incana',
      'Geranium phaeum',
      'Matteuccia struthiopteris',
      'Leucojum vernum',
      'Carduus personata',
      'Thalictrum aquilegiifolium',
      'Petasites hybridus',
      'Petasites kablikianus',
      'Salvia glutinosa',
      'Aegopodium podagraria',
      'Chaerophyllum hirsutum',
      'Cirsium oleraceum',
      'Crepis paludosa',
      'Filipendula ulmaria',
      'Geum rivale',
      'Impatiens noli-tangere',
      'Lysimachia nemorum',
      'Stellaria nemorum',
    ],
  },
  '91E0-7': {
    label: '91E0-7 Bagienna olszyna górska (Caltho laetae-Alnetum)',
    typical: [
      'Alnus incana',
      'Caltha laeta',
      'Chaerophyllum hirsutum',
      'Lysimachia nemorum',
      'Crepis paludosa',
      'Valeriana simplicifolia',
      'Scirpus sylvaticus',
      'Myosotis palustris',
      'Petasites albus',
    ],
  },
  '91E0-8': {
    label: '91E0-8 Źródliskowy las olszowy na niżu („Cardamino-Alnetum”)',
    typical: ['Alnus glutinosa', 'Cardamine amara', 'Mercurialis perennis', 'Chrysosplenium alternifolium'],
  },
}

/** Podtypy górskie, w których martwe drewno i wiek drzewostanu są tylko pomocnicze (modyfikacja metodyki 2015). */
export const MOUNTAIN_ALDER_SUBTYPES: Subtype91E0[] = ['91E0-6', '91E0-7']

export const subtypeOf = (site: { subtype?: unknown } | undefined): Subtype91E0 | undefined => {
  const v = site?.subtype
  return typeof v === 'string' && v in SUBTYPES_91E0 ? (v as Subtype91E0) : undefined
}

export const isMountainAlder = (site: { subtype?: unknown } | undefined) => {
  const s = subtypeOf(site)
  return s !== undefined && MOUNTAIN_ALDER_SUBTYPES.includes(s)
}

/** Które gatunki typowe dla podtypu są na liście z karty. */
export function typicalMatch(rows: SpeciesRow[], subtype: Subtype91E0) {
  const found = new Set(
    rows
      .filter((r) => r.name?.trim())
      .map((r) => findSpecies91E0(r.name)?.latin)
      .filter((n): n is string => Boolean(n)),
  )
  const typical = SUBTYPES_91E0[subtype].typical
  const present = typical.filter((t) => found.has(t))
  return { present, missing: typical.filter((t) => !found.has(t)), total: typical.length }
}
