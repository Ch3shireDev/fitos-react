// Słownik gatunków dla 1150 (zalewy i jeziora przymorskie), zebrany z przewodnika GIOŚ (Zalewska-Gałosz 2010,
// rozdz. „Identyfikatory fitosocjologiczne” i „Typowe gatunki roślin”), z przykładowej karty (Bukowo 2, 2008)
// i ze sprawozdania z monitoringu 2013–2014. Rośliny wodne i szuwarowe – w zdjęciu fitosocjologicznym wszystkie
// lądują w warstwie C (zielnej); warstw A, B i D w szuwarze praktycznie nie ma.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup1150 =
  | 'submerged' // hydrofity zanurzone (Potamion, Ceratophyllum, Myriophyllum, Najas)
  | 'floating' // hydrofity o liściach pływających (Nymphaeion) i pleustofity (Lemna, Hydrocharis)
  | 'charophyte' // ramienice – wskaźnik pomocniczy
  | 'reed' // szuwary (Phragmition, Magnocaricion)
  | 'isoetid' // roślinność lobeliowa (Littorelletea)
  | 'moss' // mchy wodne (Fontinalis)
  | 'other'

export interface SpeciesEntry1150 {
  latin: string
  polish?: string
  group: SpeciesGroup1150
  /** Gatunek wymieniony w przewodniku jako typowy dla 1150. */
  typical?: boolean
}

export const GROUP_LABELS_1150: Record<SpeciesGroup1150, string> = {
  submerged: 'hydrofit zanurzony',
  floating: 'hydrofit pływający / pleustofit',
  charophyte: 'ramienica',
  reed: 'gatunek szuwarowy',
  isoetid: 'gatunek lobeliowy (Littorelletea)',
  moss: 'mech wodny',
  other: 'inny',
}

/** Hydrofity w rozumieniu wskaźnika „Obecność hydrofitów” – zanurzone i pływające, bez szuwaru i ramienic. */
export const isHydrophyteGroup = (g: SpeciesGroup1150) => g === 'submerged' || g === 'floating' || g === 'isoetid' || g === 'moss'

const e = (latin: string, polish: string, group: SpeciesGroup1150, typical = false): SpeciesEntry1150 => ({ latin, polish, group, typical })

export const SPECIES_1150: SpeciesEntry1150[] = [
  // hydrofity zanurzone
  e('Potamogeton crispus', 'rdestnica kędzierzawa', 'submerged', true),
  e('Potamogeton lucens', 'rdestnica połyskująca', 'submerged', true),
  e('Potamogeton pectinatus', 'rdestnica grzebieniasta', 'submerged', true),
  e('Stuckenia pectinata', 'rdestnica grzebieniasta', 'submerged', true),
  e('Potamogeton perfoliatus', 'rdestnica przeszyta', 'submerged', true),
  e('Potamogeton pusillus', 'rdestnica drobna', 'submerged'),
  e('Potamogeton compressus', 'rdestnica spłaszczona', 'submerged'),
  e('Najas marina', 'jezierza morska', 'submerged', true),
  e('Ceratophyllum demersum', 'rogatek sztywny', 'submerged', true),
  e('Myriophyllum spicatum', 'wywłócznik kłosowy', 'submerged', true),
  e('Myriophyllum verticillatum', 'wywłócznik okółkowy', 'submerged', true),
  e('Batrachium circinatum', 'włosienicznik krążkolistny', 'submerged', true),
  e('Elodea canadensis', 'moczarka kanadyjska', 'submerged'),
  e('Zannichellia palustris', 'zamętnica błotna', 'submerged'),
  e('Ruppia maritima', 'rupia morska', 'submerged'),
  e('Zostera marina', 'zostera morska', 'submerged'),
  // pływające i pleustofity
  e('Lemna minor', 'rzęsa drobna', 'floating', true),
  e('Lemna trisulca', 'rzęsa trójrowkowa', 'floating', true),
  e('Spirodela polyrhiza', 'spirodela wielokorzeniowa', 'floating'),
  e('Hydrocharis morsus-ranae', 'żabiściek pływający', 'floating'),
  e('Nuphar lutea', 'grążel żółty', 'floating'),
  e('Nymphaea alba', 'grzybienie białe', 'floating'),
  e('Nymphaea candida', 'grzybienie północne', 'floating'),
  e('Potamogeton natans', 'rdestnica pływająca', 'floating'),
  // ramienice
  e('Chara tomentosa', 'ramienica omszona', 'charophyte', true),
  e('Chara aspera', 'ramienica szorstka', 'charophyte', true),
  e('Chara contraria', 'ramienica przeciwstawna', 'charophyte', true),
  e('Chara vulgaris', 'ramienica pospolita', 'charophyte', true),
  e('Chara globularis', 'ramienica krucha', 'charophyte'),
  e('Nitellopsis obtusa', 'krynicznica tępa', 'charophyte'),
  // lobeliowe, mchy
  e('Isoëtes lacustris', 'poryblin jeziorny', 'isoetid'),
  e('Lobelia dortmanna', 'lobelia jeziorna', 'isoetid'),
  e('Littorella uniflora', 'brzeżyca jednokwiatowa', 'isoetid'),
  e('Fontinalis antipyretica', 'zdrojek pospolity', 'moss'),
  // szuwary
  e('Phragmites australis', 'trzcina pospolita', 'reed'),
  e('Typha angustifolia', 'pałka wąskolistna', 'reed'),
  e('Typha latifolia', 'pałka szerokolistna', 'reed'),
  e('Sparganium erectum', 'jeżogłówka gałęzista', 'reed', true),
  e('Sparganium emersum', 'jeżogłówka pojedyncza', 'reed'),
  e('Bolboschoenus maritimus', 'sitowiec nadmorski', 'reed', true),
  e('Schoenoplectus lacustris', 'oczeret jeziorny', 'reed'),
  e('Schoenoplectus tabernaemontani', 'oczeret Tabernaemontana', 'reed'),
  e('Glyceria maxima', 'manna mielec', 'reed'),
  e('Acorus calamus', 'tatarak zwyczajny', 'reed'),
  e('Equisetum fluviatile', 'skrzyp bagienny', 'reed'),
  e('Oenanthe aquatica', 'kropidło wodne', 'reed'),
  e('Rorippa amphibia', 'rzepicha ziemnowodna', 'reed'),
  e('Sagittaria sagittifolia', 'strzałka wodna', 'reed'),
  e('Phalaris arundinacea', 'mozga trzcinowata', 'reed'),
  e('Cicuta virosa', 'szalej jadowity', 'reed'),
  e('Carex pseudocyperus', 'turzyca ciborowata', 'reed'),
  e('Thelypteris palustris', 'zachylnik błotny', 'reed'),
  e('Carex acutiformis', 'turzyca błotna', 'reed'),
  e('Carex riparia', 'turzyca brzegowa', 'reed'),
  e('Carex acuta', 'turzyca zaostrzona', 'reed'),
  e('Carex paniculata', 'turzyca prosowa', 'reed'),
  e('Iris pseudacorus', 'kosaciec żółty', 'reed'),
]

const BY_NAME = new Map(SPECIES_1150.map((s) => [normalizeName(s.latin), s]))

export const findSpecies1150 = (name: string): SpeciesEntry1150 | undefined => BY_NAME.get(normalizeName(name))

/** Wszystko w warstwie C – w szuwarze i w wodzie nie ma drzew ani krzewów, a mchy wodne to wyjątek. */
export const defaultLayer1150 = (s: SpeciesEntry1150): Layer => (s.group === 'moss' ? 'D' : 'C')
