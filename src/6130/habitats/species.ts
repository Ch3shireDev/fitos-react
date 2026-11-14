// Słownik gatunków dla 6130 (murawy galmanowe Violetalia calaminariae), zebrany z przewodnika GIOŚ (Świerkosz,
// Reczyńska 2015, pkt 4 „Typowe gatunki roślin” i tab. 1), z przykładowej karty (Miedzianka, 2012–2013) i ze sprawozdań
// z monitoringu 2013–2014, 2018 i 2024 (gatunki obce, ekspansywne, nitrofilne, drzewa i krzewy zarastające hałdy).
// Drzewa i krzewy – warstwa B, runo – C, mchy i porosty – D.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

/** Zespoły stanowisk z tab. 1 – każdy ma własne gatunki charakterystycznej kombinacji florystycznej (pkt b–d). */
export const REGIONS_6130 = ['rudawy', 'olkusz', 'zlotyStok'] as const
export type Region6130 = (typeof REGIONS_6130)[number]

export const REGION_LABELS_6130: Record<Region6130, string> = {
  rudawy: 'Rudawy Janowickie (hałdy polimetaliczne)',
  olkusz: 'Wyżyna Olkuska i Garb Tarnogórski (hałdy cynkowo-ołowiowe)',
  zlotyStok: 'Hałdy koło Złotego Stoku, Góry Złote (hałdy arsenowe)',
}

export type SpeciesGroup6130 =
  | 'characteristic' // charakterystyczna kombinacja florystyczna (tab. 1, pkt a–d) – z regionami
  | 'expansive' // rodzime gatunki ekspansywne (tab. 1 i sprawozdania) – spoza typowej kombinacji
  | 'nitrophilous' // gatunki synantropijne i nitrofilne (tab. 1, sprawozdania)
  | 'woody' // krzewy i podrost drzew (tab. 1 i sprawozdania)
  | 'alien' // obce gatunki inwazyjne (tab. 1, sprawozdanie 2024 tab. 3)
  | 'companion' // pozostałe gatunki runa i warstwy D

export interface SpeciesEntry6130 {
  latin: string
  polish?: string
  group: SpeciesGroup6130
  /**
   * Gatunek charakterystyczny: 'all' – w całym zasięgu w Polsce (tab. 1 pkt a, pkt 4 przewodnika);
   * lista regionów – tylko tam (tab. 1 pkt b–d).
   */
  regions?: 'all' | Region6130[]
  woody?: boolean
  /** Mech albo porost – warstwa D. */
  cryptogam?: boolean
}

export const GROUP_LABELS_6130: Record<SpeciesGroup6130, string> = {
  characteristic: 'gatunek charakterystycznej kombinacji florystycznej 6130',
  expansive: 'rodzimy gatunek ekspansywny',
  nitrophilous: 'gatunek synantropijny / nitrofilny',
  woody: 'krzew albo podrost drzew',
  alien: 'gatunek obcy inwazyjny',
  companion: 'gatunek towarzyszący',
}

const e = (latin: string, polish: string, group: SpeciesGroup6130, extra: Partial<SpeciesEntry6130> = {}): SpeciesEntry6130 => ({ latin, polish, group, ...extra })
const ch = (latin: string, polish: string, regions: SpeciesEntry6130['regions'] = 'all', extra: Partial<SpeciesEntry6130> = {}) =>
  e(latin, polish, 'characteristic', { regions, ...extra })
const W = { woody: true }
const D = { cryptogam: true }

export const SPECIES_6130: SpeciesEntry6130[] = [
  // charakterystyczna kombinacja – cały zasięg w Polsce (tab. 1 pkt a, pkt 4)
  ch('Armeria maritima subsp. halleri', 'zawciąg pospolity galmanowy'),
  ch('Armeria maritima', 'zawciąg pospolity'),
  ch('Armeria halleri', 'zawciąg pospolity galmanowy (syn.)'),
  ch('Silene vulgaris', 'lepnica rozdęta'),
  ch('Silene vulgaris var. humilis', 'lepnica rozdęta odm. niska'),
  ch('Festuca ovina', 'kostrzewa owcza'),
  ch('Scabiosa ochroleuca', 'driakiew żółtawa'),
  ch('Anthyllis vulneraria', 'przelot pospolity'),
  ch('Pimpinella saxifraga', 'biedrzeniec mniejszy'),
  ch('Galium album', 'przytulia biała'),
  ch('Thymus pulegioides', 'macierzanka zwyczajna'),
  ch('Cladonia foliacea', 'chrobotek rosochaty', 'all', D),
  ch('Cladonia alcicornis', 'chrobotek rosochaty (syn.)', 'all', D),
  ch('Cladonia pyxidata', 'chrobotek kubkowaty', 'all', D),
  ch('Cladonia pocillum', 'chrobotek rozetkowy', 'all', D),
  ch('Cladonia glauca', 'chrobotek siwy', 'all', D),
  ch('Rumex acetosa', 'szczaw zwyczajny'),
  ch('Rumex thyrsiflorus', 'szczaw rozpierzchły'),
  ch('Carlina vulgaris', 'dziewięćsił pospolity'),
  ch('Minuartia verna', 'mokrzyca wiosenna'),
  ch('Asperula cynanchica', 'marzanka pagórkowa'),
  ch('Potentilla heptaphylla', 'pięciornik siedmiolistkowy'),
  ch('Scabiosa canescens', 'driakiew wonna'),
  ch('Linum catharticum', 'len przeczyszczający'),
  // b) Rudawy Janowickie (+ Agrostis i Dianthus deltoides także na hałdach arsenowych – sprawozdanie 2013–2014)
  ch('Agrostis capillaris', 'mietlica pospolita', ['rudawy', 'zlotyStok']),
  ch('Agrostis vulgaris', 'mietlica pospolita (syn.)', ['rudawy', 'zlotyStok']),
  ch('Dianthus deltoides', 'goździk kropkowany', ['rudawy', 'zlotyStok']),
  ch('Equisetum arvense', 'skrzyp polny', ['rudawy']),
  ch('Sedum maximum', 'rozchodnik wielki', ['rudawy']),
  ch('Rumex tenuifolius', 'szczaw cienkolistny', ['rudawy']),
  // c) Wyżyna Olkuska
  ch('Biscutella laevigata', 'pleszczotka górska', ['olkusz']),
  ch('Dianthus carthusianorum', 'goździk kartuzek', ['olkusz']),
  ch('Gypsophila fastigiata', 'łyszczec baldachogronowy', ['olkusz']),
  ch('Potentilla arenaria', 'pięciornik piaskowy', ['olkusz']),
  // d) hałdy koło Złotego Stoku
  ch('Centaurea scabiosa', 'chaber driakiewnik', ['zlotyStok']),
  ch('Centaurium erythraea', 'centuria pospolita', ['zlotyStok']),
  ch('Centaurium umbellatum', 'centuria pospolita (syn.)', ['zlotyStok']),
  ch('Gentianella germanica', 'goryczuszka Wettsteina', ['zlotyStok']),
  ch('Calluna vulgaris', 'wrzos zwyczajny', ['zlotyStok']),
  ch('Hieracium pilosella', 'jastrzębiec kosmaczek', ['zlotyStok']),
  ch('Deschampsia flexuosa', 'śmiałek pogięty', ['zlotyStok']),

  // rodzime gatunki ekspansywne (sprawozdania 2013–2024)
  e('Calamagrostis epigejos', 'trzcinnik piaskowy', 'expansive'),
  e('Molinia caerulea', 'trzęślica modra', 'expansive'),
  e('Festuca rubra', 'kostrzewa czerwona', 'expansive'),
  e('Arrhenatherum elatius', 'rajgras wyniosły', 'expansive'),
  e('Peucedanum oreoselinum', 'gorysz pagórkowy', 'expansive'),
  e('Bromus sp.', 'stokłosa', 'expansive'),
  e('Hieracium murorum', 'jastrzębiec leśny', 'expansive'),
  e('Rubus sp.', 'jeżyna', 'expansive'),
  e('Rubus plicatus', 'jeżyna fałdowana', 'expansive'),
  e('Dactylis glomerata', 'kupkówka pospolita', 'expansive'),
  e('Tanacetum vulgare', 'wrotycz pospolity', 'expansive'),

  // synantropijne i nitrofilne (tab. 1, sprawozdania)
  e('Rubus idaeus', 'malina właściwa', 'nitrophilous'),
  e('Urtica dioica', 'pokrzywa zwyczajna', 'nitrophilous'),
  e('Chaerophyllum aromaticum', 'świerząbek korzenny', 'nitrophilous'),
  e('Geranium pusillum', 'bodziszek drobny', 'nitrophilous'),
  e('Rumex crispus', 'szczaw kędzierzawy', 'nitrophilous'),
  e('Anthriscus sylvestris', 'trybula leśna', 'nitrophilous'),
  e('Aegopodium podagraria', 'podagrycznik pospolity', 'nitrophilous'),
  e('Eupatorium cannabinum', 'sadziec konopiasty', 'nitrophilous'),
  e('Chelidonium majus', 'glistnik jaskółcze ziele', 'nitrophilous'),
  e('Heracleum sphondylium', 'barszcz zwyczajny', 'nitrophilous'),

  // krzewy i podrost drzew (tab. 1, sprawozdania)
  e('Crataegus monogyna', 'głóg jednoszyjkowy', 'woody', W),
  e('Rosa sp.', 'róża', 'woody', W),
  e('Fraxinus excelsior', 'jesion wyniosły', 'woody', W),
  e('Sorbus aucuparia', 'jarząb pospolity', 'woody', W),
  e('Betula pendula', 'brzoza brodawkowata', 'woody', W),
  e('Populus tremula', 'topola osika', 'woody', W),
  e('Pinus sylvestris', 'sosna zwyczajna', 'woody', W),
  e('Acer pseudoplatanus', 'klon jawor', 'woody', W),
  e('Acer platanoides', 'klon zwyczajny', 'woody', W),
  e('Quercus petraea', 'dąb bezszypułkowy', 'woody', W),
  e('Quercus robur', 'dąb szypułkowy', 'woody', W),
  e('Salix caprea', 'wierzba iwa', 'woody', W),
  e('Corylus avellana', 'leszczyna pospolita', 'woody', W),
  e('Frangula alnus', 'kruszyna pospolita', 'woody', W),

  // obce gatunki inwazyjne (tab. 1, sprawozdanie 2024 tab. 3)
  e('Padus serotina', 'czeremcha amerykańska', 'alien', W),
  e('Prunus serotina', 'czeremcha amerykańska', 'alien', W),
  e('Solidago gigantea', 'nawłoć późna', 'alien'),
  e('Solidago canadensis', 'nawłoć kanadyjska', 'alien'),
  e('Quercus rubra', 'dąb czerwony', 'alien', W),
  e('Reynoutria japonica', 'rdestowiec ostrokończysty', 'alien'),
  e('Reynoutria sachalinensis', 'rdestowiec sachaliński', 'alien'),
  e('Impatiens glandulifera', 'niecierpek gruczołowaty', 'alien'),
  e('Impatiens parviflora', 'niecierpek drobnokwiatowy', 'alien'),
  e('Robinia pseudacacia', 'robinia akacjowa', 'alien', W),
  e('Pseudotsuga menziesii', 'daglezja zielona', 'alien', W),
  e('Aster novae-angliae', 'aster nowoangielski', 'alien'),
  e('Cornus alba', 'dereń biały', 'alien', W),
  e('Caragana arborescens', 'karagana syberyjska', 'alien', W),
  e('Spiraea x pseudosalicifolia', 'tawuła nibywierzbolistna', 'alien', W),

  // runo – gatunki towarzyszące (zdjęcia z karty Miedzianka)
  e('Achillea millefolium', 'krwawnik pospolity', 'companion'),
  e('Angelica sylvestris', 'dzięgiel leśny', 'companion'),
  e('Carex sp.', 'turzyca', 'companion'),
  e('Cerastium arvense', 'rogownica polna', 'companion'),
  e('Fragaria vesca', 'poziomka pospolita', 'companion'),
  e('Fragaria viridis', 'poziomka twardawa', 'companion'),
  e('Knautia arvensis', 'świerzbnica polna', 'companion'),
  e('Linaria vulgaris', 'lnica pospolita', 'companion'),
  e('Trifolium arvense', 'koniczyna polna', 'companion'),
  e('Viola canina', 'fiołek psi', 'companion'),
  e('Leucanthemum vulgare', 'jastrun właściwy', 'companion'),
  e('Lotus corniculatus', 'komonica zwyczajna', 'companion'),
  e('Rumex acetosella', 'szczaw polny', 'companion'),
  e('Ceratodon purpureus', 'zęboróg purpurowy', 'companion', D),
  e('Cladonia sp.', 'chrobotek', 'companion', D),
  e('Cornicularia sp.', 'płucnik (porost)', 'companion', D),
]

const BY_NAME = new Map(SPECIES_6130.map((s) => [normalizeName(s.latin), s]))

export const findSpecies6130 = (name: string): SpeciesEntry6130 | undefined => BY_NAME.get(normalizeName(name))

/** Klucz do liczenia gatunków: synonimy (Padus/Prunus serotina, Agrostis vulgaris/capillaris…) dają jeden klucz. */
export const speciesKey6130 = (name: string) =>
  (findSpecies6130(name)?.polish ?? normalizeName(name)).replace(/ \((syn\.|porost)\)$/, '').replace(/ (galmanowy|odm\. niska)$/, '')

const groupOf = (name: string) => findSpecies6130(name)?.group
export const isAlien6130 = (name: string) => groupOf(name) === 'alien'
export const isNitrophilous6130 = (name: string) => groupOf(name) === 'nitrophilous'
export const isWoody6130 = (name: string) => Boolean(findSpecies6130(name)?.woody)

/**
 * Gatunek charakterystycznej kombinacji florystycznej przy danym regionie. Bez regionu (albo „inne”) liczą się
 * gatunki ze wszystkich list b–d – lepiej policzyć za dużo niż odebrać FV płatowi ze stanowiska spoza trzech zespołów.
 */
export function isCharacteristic6130(name: string, region?: string): boolean {
  const s = findSpecies6130(name)
  if (!s || s.group !== 'characteristic') return false
  if (s.regions === 'all' || s.regions === undefined) return true
  return REGIONS_6130.includes(region as Region6130) ? s.regions.includes(region as Region6130) : true
}

export const defaultLayer6130 = (s: SpeciesEntry6130): Layer => (s.woody ? 'B' : s.cryptogam ? 'D' : 'C')
