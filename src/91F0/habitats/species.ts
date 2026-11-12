// Słownik gatunków dla *91F0, zebrany z przewodnika GIOŚ (rozdz. „Typowe gatunki roślin”, tab. 1–2),
// z przykładowej karty Bukowy Las Górki 2 i ze sprawozdania z monitoringu 2024 (gatunki obce).
// Służy do wyszukiwarki gatunków i do liczenia podpowiedzi ocen.
import type { Layer, SpeciesRow } from '../../7120/habitats/types'
import { num } from '../../7120/habitats/assessment'

export type SpeciesGroup91F0 =
  | 'tree-core' // wiązy, dąb szypułkowy, jesion – wskaźnik „Liczba gatunków z grupy wiązy, dąb, jesion”
  | 'tree' // inne rodzime drzewa łęgu (klon polny, czeremcha, olsza, topole, wierzby…)
  | 'tree-grad' // grab i lipa – rodzime, ale ich dominacja to objaw grądowienia
  | 'shrub' // typowy krzew łęgu
  | 'tree-eco-alien' // rodzime drzewo obce ekologicznie łęgom (buk, świerk, sosna, brzoza, osika)
  | 'tree-geo-alien' // drzewo obce geograficznie (klon jesionolistny, topole euroamerykańskie…)
  | 'invasive' // inwazyjny gatunek obcy podszytu i runa
  | 'expansive' // rodzimy apofit ekspansywny (jeżyny poza popielicą, trzcinnik piaskowy, trawy łąkowe)
  | 'char' // gatunek typowy dla runa łęgu (aspekt wiosenny, letni, łęg śledziennicowy)
  | 'grad' // gatunek runa typowy raczej dla grądów – liczny sygnalizuje grądowienie
  | 'key' // gatunek kluczowy lokalnie (wskaźnik fakultatywny)
  | 'moss' // typowy mech warstwy D
  | 'other'

export interface SpeciesEntry91F0 {
  latin: string
  polish?: string
  group: SpeciesGroup91F0
  layer?: Layer
}

export const GROUP_LABELS_91F0: Record<SpeciesGroup91F0, string> = {
  'tree-core': 'drzewo z grupy wiązy, dąb, jesion',
  tree: 'drzewo rodzime dla łęgu',
  'tree-grad': 'drzewo grądowe (dominacja = grądowienie)',
  shrub: 'krzew typowy dla łęgu',
  'tree-eco-alien': 'drzewo obce ekologicznie',
  'tree-geo-alien': 'drzewo obce geograficznie',
  invasive: 'inwazyjny gatunek obcy',
  expansive: 'rodzimy gatunek ekspansywny (apofit)',
  char: 'gatunek typowy dla runa łęgu',
  grad: 'gatunek grądowy (sygnał grądowienia)',
  key: 'gatunek kluczowy lokalnie',
  moss: 'mech',
  other: 'inny',
}

export const SPECIES_91F0: SpeciesEntry91F0[] = [
  // --- wiązy, dąb, jesion ---
  { latin: 'Quercus robur', polish: 'dąb szypułkowy', group: 'tree-core' },
  { latin: 'Fraxinus excelsior', polish: 'jesion wyniosły', group: 'tree-core' },
  { latin: 'Ulmus laevis', polish: 'wiąz szypułkowy', group: 'tree-core' },
  { latin: 'Ulmus minor', polish: 'wiąz polny', group: 'tree-core' },
  { latin: 'Ulmus glabra', polish: 'wiąz górski', group: 'tree-core' },
  // --- inne rodzime drzewa łęgu ---
  { latin: 'Acer campestre', polish: 'klon polny', group: 'tree' },
  { latin: 'Acer platanoides', polish: 'klon pospolity', group: 'tree' },
  { latin: 'Acer pseudoplatanus', polish: 'klon jawor', group: 'tree' },
  { latin: 'Alnus glutinosa', polish: 'olsza czarna', group: 'tree' },
  { latin: 'Alnus incana', polish: 'olsza szara', group: 'tree' },
  { latin: 'Malus sylvestris', polish: 'jabłoń dzika', group: 'tree' },
  { latin: 'Populus alba', polish: 'topola biała', group: 'tree' },
  { latin: 'Populus nigra', polish: 'topola czarna', group: 'tree' },
  { latin: 'Salix alba', polish: 'wierzba biała', group: 'tree' },
  { latin: 'Salix fragilis', polish: 'wierzba krucha', group: 'tree' },
  { latin: 'Pyrus pyraster', polish: 'grusza polna', group: 'tree' },
  // --- drzewa grądowe ---
  { latin: 'Carpinus betulus', polish: 'grab zwyczajny', group: 'tree-grad' },
  { latin: 'Tilia cordata', polish: 'lipa drobnolistna', group: 'tree-grad' },
  // --- krzewy ---
  { latin: 'Prunus padus', polish: 'czeremcha zwyczajna', group: 'shrub', layer: 'B' },
  { latin: 'Padus avium', polish: 'czeremcha zwyczajna (Padus avium)', group: 'shrub', layer: 'B' },
  { latin: 'Cornus sanguinea', polish: 'dereń świdwa', group: 'shrub' },
  { latin: 'Rhamnus cathartica', polish: 'szakłak pospolity', group: 'shrub' },
  { latin: 'Crataegus laevigata', polish: 'głóg dwuszyjkowy', group: 'shrub' },
  { latin: 'Crataegus monogyna', polish: 'głóg jednoszyjkowy', group: 'shrub' },
  { latin: 'Sambucus nigra', polish: 'bez czarny', group: 'shrub' },
  { latin: 'Euonymus europaeus', polish: 'trzmielina pospolita', group: 'shrub' },
  { latin: 'Viburnum opulus', polish: 'kalina koralowa', group: 'shrub' },
  { latin: 'Ribes spicatum', polish: 'porzeczka czerwona', group: 'shrub' },
  { latin: 'Corylus avellana', polish: 'leszczyna pospolita', group: 'shrub' },
  { latin: 'Lonicera xylosteum', polish: 'suchodrzew pospolity', group: 'shrub' },
  { latin: 'Frangula alnus', polish: 'kruszyna pospolita', group: 'shrub' },
  // --- drzewa obce ekologicznie ---
  { latin: 'Fagus sylvatica', polish: 'buk zwyczajny', group: 'tree-eco-alien' },
  { latin: 'Picea abies', polish: 'świerk pospolity', group: 'tree-eco-alien' },
  { latin: 'Pinus sylvestris', polish: 'sosna zwyczajna', group: 'tree-eco-alien' },
  { latin: 'Betula pendula', polish: 'brzoza brodawkowata', group: 'tree-eco-alien' },
  { latin: 'Populus tremula', polish: 'topola osika', group: 'tree-eco-alien' },
  // --- drzewa obce geograficznie ---
  { latin: 'Acer negundo', polish: 'klon jesionolistny', group: 'tree-geo-alien' },
  { latin: 'Populus ×canadensis', polish: 'topola kanadyjska (euroamerykańska)', group: 'tree-geo-alien' },
  { latin: 'Fraxinus pennsylvanica', polish: 'jesion pensylwański', group: 'tree-geo-alien' },
  { latin: 'Padus serotina', polish: 'czeremcha amerykańska', group: 'tree-geo-alien' },
  { latin: 'Prunus serotina', polish: 'czeremcha amerykańska (Prunus serotina)', group: 'tree-geo-alien' },
  { latin: 'Quercus rubra', polish: 'dąb czerwony', group: 'tree-geo-alien' },
  { latin: 'Robinia pseudoacacia', polish: 'robinia akacjowa', group: 'tree-geo-alien' },
  { latin: 'Aesculus hippocastanum', polish: 'kasztanowiec zwyczajny', group: 'tree-geo-alien' },
  { latin: 'Juglans regia', polish: 'orzech włoski', group: 'tree-geo-alien' },
  { latin: 'Larix decidua', polish: 'modrzew europejski', group: 'tree-geo-alien' },
  // --- inwazyjne w podszycie i runie ---
  { latin: 'Impatiens parviflora', polish: 'niecierpek drobnokwiatowy', group: 'invasive' },
  { latin: 'Impatiens glandulifera', polish: 'niecierpek gruczołowaty', group: 'invasive' },
  { latin: 'Parthenocissus quinquefolia', polish: 'winobluszcz pięciolistkowy', group: 'invasive' },
  { latin: 'Reynoutria japonica', polish: 'rdestowiec ostrokończysty', group: 'invasive' },
  { latin: 'Reynoutria sachalinensis', polish: 'rdestowiec sachaliński', group: 'invasive' },
  { latin: 'Solidago canadensis', polish: 'nawłoć kanadyjska', group: 'invasive' },
  { latin: 'Solidago gigantea', polish: 'nawłoć późna', group: 'invasive' },
  { latin: 'Echinocystis lobata', polish: 'kolczurka klapowana', group: 'invasive' },
  { latin: 'Bidens frondosa', polish: 'uczep amerykański', group: 'invasive' },
  { latin: 'Aster lanceolatus', polish: 'aster lancetowaty', group: 'invasive' },
  { latin: 'Erechtites hieraciifolia', polish: 'erechtites jastrzębcowaty', group: 'invasive' },
  { latin: 'Conyza canadensis', polish: 'przymiotno kanadyjskie', group: 'invasive' },
  { latin: 'Oxalis stricta', polish: 'szczawik żółty', group: 'invasive' },
  { latin: 'Symphoricarpos albus', polish: 'śnieguliczka biała', group: 'invasive', layer: 'B' },
  { latin: 'Spiraea tomentosa', polish: 'tawuła kutnerowata', group: 'invasive', layer: 'B' },
  // --- rodzime ekspansywne (apofity) ---
  { latin: 'Calamagrostis epigejos', polish: 'trzcinnik piaskowy', group: 'expansive' },
  { latin: 'Rubus idaeus', polish: 'malina właściwa', group: 'expansive' },
  { latin: 'Rubus plicatus', polish: 'jeżyna fałdowana', group: 'expansive' },
  { latin: 'Phalaris arundinacea', polish: 'mozga trzcinowata', group: 'expansive' },
  { latin: 'Dactylis glomerata', polish: 'kupkówka pospolita', group: 'expansive' },
  { latin: 'Deschampsia caespitosa', polish: 'śmiałek darniowy', group: 'expansive' },
  // --- typowe runo łęgu: aspekt wiosenny ---
  { latin: 'Ficaria verna', polish: 'ziarnopłon wiosenny', group: 'char' },
  { latin: 'Gagea lutea', polish: 'złoć żółta', group: 'char' },
  { latin: 'Anemone ranunculoides', polish: 'zawilec żółty', group: 'char' },
  { latin: 'Anemone nemorosa', polish: 'zawilec gajowy', group: 'char' },
  { latin: 'Adoxa moschatellina', polish: 'piżmaczek wiosenny', group: 'char' },
  { latin: 'Corydalis cava', polish: 'kokorycz pusta', group: 'char' },
  { latin: 'Corydalis intermedia', polish: 'kokorycz wątła', group: 'char' },
  { latin: 'Corydalis solida', polish: 'kokorycz pełna', group: 'char' },
  { latin: 'Pulmonaria obscura', polish: 'miodunka ćma', group: 'char' },
  { latin: 'Paris quadrifolia', polish: 'czworolist pospolity', group: 'char' },
  // --- typowe runo łęgu: aspekt letni ---
  { latin: 'Stachys sylvatica', polish: 'czyściec leśny', group: 'char' },
  { latin: 'Circaea lutetiana', polish: 'czartawa pospolita', group: 'char' },
  { latin: 'Impatiens noli-tangere', polish: 'niecierpek pospolity', group: 'char' },
  { latin: 'Festuca gigantea', polish: 'kostrzewa olbrzymia', group: 'char' },
  { latin: 'Rubus caesius', polish: 'jeżyna popielica', group: 'char' },
  { latin: 'Equisetum hyemale', polish: 'skrzyp zimowy', group: 'char' },
  { latin: 'Alliaria petiolata', polish: 'czosnaczek pospolity', group: 'char' },
  { latin: 'Geum urbanum', polish: 'kuklik pospolity', group: 'char' },
  { latin: 'Glechoma hederacea', polish: 'bluszczyk kurdybanek', group: 'char' },
  { latin: 'Galium aparine', polish: 'przytulia czepna', group: 'char' },
  { latin: 'Lamium maculatum', polish: 'jasnota plamista', group: 'char' },
  { latin: 'Aegopodium podagraria', polish: 'podagrycznik pospolity', group: 'char' },
  { latin: 'Scrophularia nodosa', polish: 'trędownik bulwiasty', group: 'char' },
  { latin: 'Urtica dioica', polish: 'pokrzywa zwyczajna', group: 'char' },
  { latin: 'Milium effusum', polish: 'prosownica rozpierzchła', group: 'char' },
  { latin: 'Carex sylvatica', polish: 'turzyca leśna', group: 'char' },
  // --- typowe runo łęgu: łęg śledziennicowy (poza dolinami) ---
  { latin: 'Chrysosplenium alternifolium', polish: 'śledziennica skrętolistna', group: 'char' },
  { latin: 'Asarum europaeum', polish: 'kopytnik pospolity', group: 'char' },
  { latin: 'Stellaria nemorum', polish: 'gwiazdnica gajowa', group: 'char' },
  { latin: 'Mercurialis perennis', polish: 'szczyr trwały', group: 'char' },
  { latin: 'Crepis paludosa', polish: 'pępawa błotna', group: 'char' },
  { latin: 'Oxalis acetosella', polish: 'szczawik zajęczy', group: 'char' },
  { latin: 'Ajuga reptans', polish: 'dąbrówka rozłogowa', group: 'char' },
  { latin: 'Maianthemum bifolium', polish: 'konwalijka dwulistna', group: 'char' },
  { latin: 'Athyrium filix-femina', polish: 'wietlica samicza', group: 'char' },
  { latin: 'Geum rivale', polish: 'kuklik zwisły', group: 'char' },
  { latin: 'Carex remota', polish: 'turzyca rzadkokłosa', group: 'char' },
  { latin: 'Chaerophyllum aromaticum', polish: 'świerząbek korzenny', group: 'char' },
  { latin: 'Stellaria holostea', polish: 'gwiazdnica wielkokwiatowa', group: 'char' },
  { latin: 'Hepatica nobilis', polish: 'przylaszczka pospolita', group: 'char' },
  // --- runo grądowe ---
  { latin: 'Galium odoratum', polish: 'przytulia wonna', group: 'grad' },
  { latin: 'Lamiastrum galeobdolon', polish: 'gajowiec żółty', group: 'grad' },
  { latin: 'Galeobdolon luteum', polish: 'gajowiec żółty (Galeobdolon luteum)', group: 'grad' },
  { latin: 'Poa nemoralis', polish: 'wiechlina gajowa', group: 'grad' },
  { latin: 'Carex digitata', polish: 'turzyca palczasta', group: 'grad' },
  { latin: 'Melica nutans', polish: 'perłówka zwisła', group: 'grad' },
  { latin: 'Dentaria bulbifera', polish: 'żywiec cebulkowy', group: 'grad' },
  { latin: 'Viola reichenbachiana', polish: 'fiołek leśny', group: 'grad' },
  { latin: 'Polygonatum multiflorum', polish: 'kokoryczka wielokwiatowa', group: 'grad' },
  { latin: 'Festuca altissima', polish: 'kostrzewa leśna', group: 'grad' },
  { latin: 'Brachypodium sylvaticum', polish: 'kłosownica leśna', group: 'grad' },
  // --- inne runo z kart ---
  { latin: 'Lysimachia nummularia', polish: 'tojeść rozesłana', group: 'other' },
  { latin: 'Lamium purpureum', polish: 'jasnota purpurowa', group: 'other' },
  { latin: 'Poa trivialis', polish: 'wiechlina zwyczajna', group: 'other' },
  { latin: 'Ranunculus auricomus', polish: 'jaskier różnolistny', group: 'other' },
  { latin: 'Ranunculus lanuginosus', polish: 'jaskier kosmaty', group: 'other' },
  { latin: 'Pulmonaria officinalis', polish: 'miodunka plamista', group: 'other' },
  { latin: 'Geranium robertianum', polish: 'bodziszek cuchnący', group: 'other' },
  { latin: 'Dryopteris carthusiana', polish: 'nerecznica krótkoostna', group: 'other' },
  { latin: 'Filipendula ulmaria', polish: 'wiązówka błotna', group: 'other' },
  // --- kluczowe lokalnie (wskaźnik fakultatywny) ---
  { latin: 'Galanthus nivalis', polish: 'śnieżyczka przebiśnieg', group: 'key' },
  { latin: 'Leucojum vernum', polish: 'śnieżyca wiosenna', group: 'key' },
  { latin: 'Astrantia major', polish: 'jarzmianka większa', group: 'key' },
  { latin: 'Primula elatior', polish: 'pierwiosnek wyniosły', group: 'key' },
  { latin: 'Platanthera bifolia', polish: 'podkolan biały', group: 'key' },
  // --- mchy ---
  { latin: 'Atrichum undulatum', polish: 'żurawiec falisty', group: 'moss' },
  { latin: 'Eurhynchium hians', polish: 'dzióbkowiec Swartza', group: 'moss' },
  { latin: 'Plagiomnium undulatum', polish: 'merzyk fałdowany', group: 'moss' },
  { latin: 'Brachythecium rutabulum', polish: 'krótkosz szorstki', group: 'moss' },
  { latin: 'Fissidens taxifolius', polish: 'skrzydlik cisolistny', group: 'moss' },
  { latin: 'Plagiomnium affine', polish: 'merzyk pokrewny', group: 'moss' },
  { latin: 'Mnium affine', polish: 'merzyk pokrewny (Mnium affine)', group: 'moss' },
  { latin: 'Dicranum sp.', polish: 'widłoząb', group: 'moss' },
]

const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ').replace('×', '').replace(' x ', ' ')

const INDEX = new Map<string, SpeciesEntry91F0>()
for (const e of SPECIES_91F0) {
  INDEX.set(normalize(e.latin), e)
  if (e.polish) INDEX.set(normalize(e.polish), e)
}

/** Szuka po nazwie łacińskiej albo polskiej. Wiązy i jeżyny bez epitetu rozpoznaje po rodzaju. */
export function findSpecies91F0(name: string): SpeciesEntry91F0 | undefined {
  const n = normalize(name)
  const hit = INDEX.get(n)
  if (hit) return hit
  if (/^ulmus( sp\.?| spp\.?)?$/.test(n)) return { latin: name.trim(), group: 'tree-core' }
  if (n.startsWith('rubus') && !n.includes('caesius')) return { latin: name.trim(), group: 'expansive' }
  if (n.startsWith('corydalis')) return { latin: name.trim(), group: 'char' }
  return undefined
}

export function defaultLayer91F0(e: SpeciesEntry91F0): Layer {
  if (e.layer) return e.layer
  if (e.group === 'moss') return 'D'
  if (e.group === 'shrub') return 'B'
  if (e.group.startsWith('tree')) return 'A'
  return 'C'
}

const filled = (rows: SpeciesRow[]) => rows.filter((r) => r.name?.trim())

/** Gatunki z listy należące do grup i ich łączne pokrycie. */
export function rowsOfGroups(rows: SpeciesRow[], groups: SpeciesGroup91F0[]) {
  const hits = filled(rows).filter((r) => groups.includes(findSpecies91F0(r.name)?.group ?? 'other'))
  const covers = hits.map((r) => num(r.cover)).filter((v): v is number => v !== undefined)
  return {
    names: hits.map((r) => r.name.trim()),
    total: covers.length ? Math.round(covers.reduce((a, b) => a + b, 0) * 10) / 10 : undefined,
  }
}

/**
 * Gatunki z grupy wiązy, dąb, jesion – liczone bez powtórzeń po nazwie z katalogu.
 * „Ulmus sp.” liczy się jako jeden wiąz, chyba że na liście jest już konkretny gatunek wiązu.
 */
export function elmOakAshSpecies(rows: SpeciesRow[]): string[] {
  const named = new Set<string>()
  let genericElm = false
  for (const r of filled(rows)) {
    const e = findSpecies91F0(r.name)
    if (e?.group !== 'tree-core') continue
    if (INDEX.get(normalize(e.latin)) === e) named.add(e.latin)
    else genericElm = true
  }
  const hasNamedElm = [...named].some((n) => n.startsWith('Ulmus'))
  return genericElm && !hasNamedElm ? [...named, 'Ulmus sp.'] : [...named]
}

/** Liczba różnych gatunków na liście (po nazwie z katalogu, inaczej po wpisanej nazwie). */
export function distinctSpecies(rows: SpeciesRow[]): string[] {
  const set = new Set<string>()
  for (const r of filled(rows)) set.add(findSpecies91F0(r.name)?.latin ?? r.name.trim())
  return [...set]
}
