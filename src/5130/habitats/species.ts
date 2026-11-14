// Słownik gatunków dla 5130 (zarośla jałowca pospolitego w murawach nawapiennych lub na wrzosowiskach), zebrany
// z przewodnika GIOŚ (Perzanowska 2012, pkt 4 „Typowe gatunki roślin”, tab. 1 i 2), z przykładowej karty (Poradów, 2010)
// i ze sprawozdań z monitoringu 2009–2011, 2016–2018 i 2021 (gatunki obce, ekspansywne, drzewa zarastające płaty).
// Krzewy i drzewa – warstwa B (drzewa ponad krzewami: A), runo – C, mchy – D.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup5130 =
  | 'juniper' // jałowiec pospolity – gatunek budujący siedlisko
  | 'typicalShrub' // pozostałe krzewy z progu FV wskaźnika „Gatunki krzewów” (dereń, róża, głóg, tarnina, szakłak)
  | 'xericShrub' // inne ciepłolubne krzewy domieszkowe (berberys, wiśnia karłowata…) – neutralne
  | 'mesicShrub' // krzewy bardziej mezofilne, obce siedliskowo (tab. 2, U2: „np. bez czarny, trzmielina”)
  | 'tree' // drzewa – przy wysokości >1,5 m liczą się do „Udziału gatunków drzewiastych”
  | 'grassland' // gatunki charakterystyczne muraw kserotermicznych (kl. Festuco-Brometea)
  | 'mountain' // gatunki charakterystyczne muraw wysokogórskich (kl. Elyno-Seslerietea)
  | 'heath' // gatunki charakterystyczne wrzosowisk (kl. Nardo-Callunetea)
  | 'psammo' // gatunki muraw napiaskowych (6120) – zarośla jałowca na nich to NIE 5130
  | 'expansive' // rodzime gatunki ekspansywne roślin zielnych (sprawozdania 2009–2021)
  | 'alien' // obce gatunki inwazyjne (sprawozdanie 2021, tab. 4)
  | 'companion' // runo: gatunki towarzyszące

export interface SpeciesEntry5130 {
  latin: string
  polish?: string
  group: SpeciesGroup5130
  /** Rodzaj z progu FV „pełny zestaw gatunków typowych” (tab. 2) – róża, głóg itp. liczone po rodzaju. */
  genus?: TypicalGenus
  /** Krzew albo drzewo – w zdjęciu warstwa B. */
  woody?: boolean
  /** Mech – warstwa D. */
  moss?: boolean
}

/** Pełny zestaw gatunków typowych warstwy krzewów (tab. 2, FV): jałowiec, dereń świdwa, róża, głóg, tarnina, szakłak. */
export const TYPICAL_GENERA = ['jałowiec', 'dereń świdwa', 'róża', 'głóg', 'tarnina', 'szakłak'] as const
export type TypicalGenus = (typeof TYPICAL_GENERA)[number]

export const GROUP_LABELS_5130: Record<SpeciesGroup5130, string> = {
  juniper: 'jałowiec – gatunek budujący siedlisko 5130',
  typicalShrub: 'krzew typowy dla 5130 (tab. 2)',
  xericShrub: 'ciepłolubny krzew domieszkowy',
  mesicShrub: 'krzew mezofilny, nietypowy dla 5130',
  tree: 'drzewo – powyżej 1,5 m liczy się do „udziału gatunków drzewiastych”',
  grassland: 'gatunek charakterystyczny murawy kserotermicznej (Festuco-Brometea)',
  mountain: 'gatunek charakterystyczny murawy wysokogórskiej (Elyno-Seslerietea)',
  heath: 'gatunek charakterystyczny wrzosowiska (Nardo-Callunetea)',
  psammo: 'gatunek muraw napiaskowych (6120) – nie 5130',
  expansive: 'rodzimy gatunek ekspansywny',
  alien: 'gatunek obcy inwazyjny',
  companion: 'gatunek towarzyszący',
}

const e = (latin: string, polish: string, group: SpeciesGroup5130, extra: Partial<SpeciesEntry5130> = {}): SpeciesEntry5130 => ({ latin, polish, group, ...extra })
const W = { woody: true }
const typ = (latin: string, polish: string, genus: TypicalGenus) => e(latin, polish, genus === 'jałowiec' ? 'juniper' : 'typicalShrub', { genus, woody: true })

export const SPECIES_5130: SpeciesEntry5130[] = [
  // warstwa krzewów – pełny zestaw z progu FV (tab. 2)
  typ('Juniperus communis', 'jałowiec pospolity', 'jałowiec'),
  typ('Cornus sanguinea', 'dereń świdwa', 'dereń świdwa'),
  typ('Rosa canina', 'róża dzika', 'róża'),
  typ('Rosa rubiginosa', 'róża rdzawa', 'róża'),
  typ('Rosa gallica', 'róża francuska', 'róża'),
  typ('Rosa sp.', 'róża', 'róża'),
  typ('Crataegus monogyna', 'głóg jednoszyjkowy', 'głóg'),
  typ('Crataegus laevigata', 'głóg dwuszyjkowy', 'głóg'),
  typ('Crataegus rhipidophylla', 'głóg odgiętodziałkowy', 'głóg'),
  typ('Crataegus sp.', 'głóg', 'głóg'),
  typ('Prunus spinosa', 'tarnina', 'tarnina'),
  typ('Rhamnus cathartica', 'szakłak pospolity', 'szakłak'),

  // inne krzewy ciepłolubne (definicja siedliska: berberys w domieszce)
  e('Berberis vulgaris', 'berberys zwyczajny', 'xericShrub', W),
  e('Prunus fruticosa', 'wiśnia karłowata', 'xericShrub', W),
  e('Cotoneaster integerrimus', 'irga zwyczajna', 'xericShrub', W),
  e('Viburnum lantana', 'kalina hordowina', 'xericShrub', W),

  // krzewy mezofilne, obce siedliskowo (tab. 2: U2 „np. bez czarny, trzmielina”; sprawozdania 2009–2021)
  e('Sambucus nigra', 'bez czarny', 'mesicShrub', W),
  e('Euonymus europaeus', 'trzmielina pospolita', 'mesicShrub', W),
  e('Ligustrum vulgare', 'ligustr pospolity', 'mesicShrub', W),
  e('Viburnum opulus', 'kalina koralowa', 'mesicShrub', W),
  e('Frangula alnus', 'kruszyna pospolita', 'mesicShrub', W),
  e('Corylus avellana', 'leszczyna pospolita', 'mesicShrub', W),
  e('Prunus cerasifera', 'śliwa wiśniowa (ałycza)', 'mesicShrub', W),
  e('Prunus domestica', 'śliwa domowa', 'mesicShrub', W),

  // drzewa zarastające płaty (sprawozdania 2009–2021)
  e('Pinus sylvestris', 'sosna zwyczajna', 'tree', W),
  e('Picea abies', 'świerk pospolity', 'tree', W),
  e('Larix decidua', 'modrzew europejski', 'tree', W),
  e('Larix europaea', 'modrzew europejski', 'tree', W),
  e('Betula pendula', 'brzoza brodawkowata', 'tree', W),
  e('Fraxinus excelsior', 'jesion wyniosły', 'tree', W),
  e('Acer platanoides', 'klon zwyczajny', 'tree', W),
  e('Acer pseudoplatanus', 'klon jawor', 'tree', W),
  e('Acer campestre', 'klon polny', 'tree', W),
  e('Populus tremula', 'topola osika', 'tree', W),
  e('Quercus robur', 'dąb szypułkowy', 'tree', W),
  e('Quercus petraea', 'dąb bezszypułkowy', 'tree', W),
  e('Quercus sessilis', 'dąb bezszypułkowy', 'tree', W),
  e('Carpinus betulus', 'grab zwyczajny', 'tree', W),
  e('Prunus avium', 'czereśnia (wiśnia ptasia)', 'tree', W),
  e('Cerasus avium', 'czereśnia (wiśnia ptasia)', 'tree', W),
  e('Malus sylvestris', 'jabłoń dzika', 'tree', W),
  e('Pyrus communis', 'grusza pospolita', 'tree', W),
  e('Pyrus pyraster', 'grusza polna', 'tree', W),
  e('Sorbus aucuparia', 'jarząb pospolity', 'tree', W),
  e('Alnus glutinosa', 'olsza czarna', 'tree', W),
  e('Ulmus minor', 'wiąz polny', 'tree', W),
  e('Tilia cordata', 'lipa drobnolistna', 'tree', W),

  // gatunki charakterystyczne murawy: kl. Festuco-Brometea (przewodnik pkt 4a, karta Poradów, sprawozdanie 2021)
  e('Aster amellus', 'aster gawędka', 'grassland'),
  e('Cirsium pannonicum', 'ostrożeń pannoński', 'grassland'),
  e('Inula ensifolia', 'oman wąskolistny', 'grassland'),
  e('Iris aphylla', 'kosaciec bezlistny', 'grassland'),
  e('Linum flavum', 'len złocisty', 'grassland'),
  e('Linum hirsutum', 'len włochaty', 'grassland'),
  e('Carlina onopordifolia', 'dziewięćsił popłocholistny', 'grassland'),
  e('Dorycnium germanicum', 'szyplin jedwabisty', 'grassland'),
  e('Campanula bononiensis', 'dzwonek boloński', 'grassland'),
  e('Campanula sibirica', 'dzwonek syberyjski', 'grassland'),
  e('Orchis purpurea', 'storczyk purpurowy', 'grassland'),
  e('Melampyrum arvense', 'pszeniec różowy', 'grassland'),
  e('Eryngium campestre', 'mikołajek polny', 'grassland'),
  e('Adonis vernalis', 'miłek wiosenny', 'grassland'),
  e('Gentiana cruciata', 'goryczka krzyżowa', 'grassland'),
  e('Scorzonera purpurea', 'wężymord stepowy', 'grassland'),
  e('Viola rupestris', 'fiołek skalny', 'grassland'),
  e('Sesleria uliginosa', 'sesleria błotna', 'grassland'),
  e('Carex humilis', 'turzyca niska', 'grassland'),
  e('Carex michelii', 'turzyca Michela', 'grassland'),
  e('Carex praecox', 'turzyca wczesna', 'grassland'),
  e('Senecio erucifolius', 'starzec srebrzysty', 'grassland'),
  e('Senecio integrifolius', 'starzec polny', 'grassland'),
  e('Seseli annuum', 'żebrzyca roczna', 'grassland'),
  e('Stipa joannis', 'ostnica Jana', 'grassland'),
  e('Thalictrum simplex', 'rutewka pojedyncza', 'grassland'),
  e('Veronica austriaca', 'przetacznik ząbkowany', 'grassland'),
  e('Elymus hispidus', 'perz siny', 'grassland'),
  e('Festuca rupicola', 'kostrzewa bruzdkowana', 'grassland'),
  e('Origanum vulgare', 'lebiodka pospolita', 'grassland'),
  e('Stachys recta', 'czyściec prosty', 'grassland'),
  e('Clinopodium vulgare', 'czyścica storzyszek', 'grassland'),
  e('Brachypodium pinnatum', 'kłosownica pierzasta', 'grassland'),
  e('Agrimonia eupatoria', 'rzepik pospolity', 'grassland'),
  e('Inula conyzae', 'oman szlachtawa', 'grassland'),
  e('Inula conyza', 'oman szlachtawa', 'grassland'),
  e('Carex flacca', 'turzyca sina', 'grassland'),
  e('Asperula tinctoria', 'marzanka barwierska', 'grassland'),
  e('Galium boreale', 'przytulia północna', 'grassland'),
  e('Salvia pratensis', 'szałwia łąkowa', 'grassland'),
  e('Salvia verticillata', 'szałwia okręgowa', 'grassland'),
  e('Galium album', 'przytulia biała', 'grassland'),
  e('Euphorbia cyparissias', 'wilczomlecz sosnka', 'grassland'),
  e('Vincetoxicum hirundinaria', 'ciemiężyk białokwiatowy', 'grassland'),
  e('Medicago falcata', 'lucerna sierpowata', 'grassland'),
  e('Sanguisorba minor', 'krwiściąg mniejszy', 'grassland'),
  e('Anthyllis vulneraria', 'przelot pospolity', 'grassland'),
  e('Thymus pannonicus', 'macierzanka pannońska', 'grassland'),
  e('Thymus marschallianus', 'macierzanka Marschalla', 'grassland'),
  e('Potentilla heptaphylla', 'pięciornik siedmiolistkowy', 'grassland'),
  e('Achillea pannonica', 'krwawnik pannoński', 'grassland'),
  e('Centaurea scabiosa', 'chaber driakiewnik', 'grassland'),
  e('Scabiosa ochroleuca', 'driakiew żółtawa', 'grassland'),
  e('Coronilla varia', 'cieciorka pstra', 'grassland'),
  e('Asperula cynanchica', 'marzanka pagórkowa', 'grassland'),
  e('Onobrychis arenaria', 'sparceta piaskowa', 'grassland'),
  e('Pimpinella saxifraga', 'biedrzeniec mniejszy', 'grassland'),
  e('Fragaria viridis', 'poziomka twardawa', 'grassland'),
  e('Dianthus carthusianorum', 'goździk kartuzek', 'grassland'),
  e('Viola hirta', 'fiołek kosmaty', 'grassland'),
  e('Galium cracoviense', 'przytulia krakowska', 'grassland'),
  e('Bromus erectus', 'stokłosa prosta', 'grassland'),
  e('Koeleria macrantha', 'strzęplica nadobna', 'grassland'),
  e('Koeleria pyramidata', 'strzęplica piramidalna', 'grassland'),
  e('Gentianella ciliata', 'goryczuszka orzęsiona', 'grassland'),
  e('Teucrium chamaedrys', 'ożanka właściwa', 'grassland'),
  e('Peucedanum cervaria', 'gorysz siny', 'grassland'),
  e('Anemone sylvestris', 'zawilec wielkokwiatowy', 'grassland'),
  e('Prunella grandiflora', 'głowienka wielkokwiatowa', 'grassland'),

  // gatunki charakterystyczne muraw wysokogórskich: kl. Elyno-Seslerietea (przewodnik pkt 4a, sprawozdanie 2021)
  e('Knautia kitaibelii', 'świerzbnica karpacka', 'mountain'),
  e('Sesleria varia', 'sesleria skalna', 'mountain'),
  e('Sesleria tatrae', 'sesleria tatrzańska', 'mountain'),
  e('Erysimum wittmannii', 'pszonak Wittmanna', 'mountain'),
  e('Helianthemum alpestre', 'posłonek alpejski', 'mountain'),
  e('Agrostis alpina', 'mietlica alpejska', 'mountain'),
  e('Bellidiastrum michelii', 'stokrotnica górska', 'mountain'),
  e('Carex sempervirens', 'turzyca wiecznie zielona', 'mountain'),
  e('Erigeron hungaricus', 'przymiotno węgierskie', 'mountain'),
  e('Festuca versicolor', 'kostrzewa pstra', 'mountain'),
  e('Oxytropis carpatica', 'ostrołódka karpacka', 'mountain'),
  e('Pedicularis oederi', 'gnidosz dwubarwny', 'mountain'),
  e('Ranunculus oreophilus', 'jaskier skalny', 'mountain'),
  e('Silene acaulis', 'lepnica bezłodygowa', 'mountain'),
  e('Thesium alpinum', 'leniec alpejski', 'mountain'),
  e('Thymus pulcherrimus', 'macierzanka nadobna', 'mountain'),
  e('Carlina acaulis', 'dziewięćsił bezłodygowy', 'mountain'),
  e('Festuca tatrae', 'kostrzewa tatrzańska', 'mountain'),
  e('Scabiosa lucida', 'driakiew lśniąca', 'mountain'),
  e('Phyteuma orbiculare', 'zerwa kulista', 'mountain'),
  e('Dendranthema zawadzkii', 'złocień Zawadzkiego', 'mountain'),

  // gatunki charakterystyczne wrzosowisk: kl. Nardo-Callunetea (przewodnik pkt 4b, sprawozdanie 2021)
  e('Calluna vulgaris', 'wrzos zwyczajny', 'heath'),
  e('Arctostaphylos uva-ursi', 'mącznica lekarska', 'heath'),
  e('Empetrum nigrum', 'bażyna czarna', 'heath'),
  e('Erica tetralix', 'wrzosiec bagienny', 'heath'),
  e('Carex ericetorum', 'turzyca wrzosowiskowa', 'heath'),
  e('Diphasiastrum tristachyum', 'widlicz cyprysowy', 'heath'),
  e('Hieracium umbellatum', 'jastrzębiec baldaszkowy', 'heath'),
  e('Vaccinium myrtillus', 'borówka czarna', 'heath'),
  e('Vaccinium vitis-idaea', 'borówka brusznica', 'heath'),
  e('Vaccinium uliginosum', 'borówka bagienna', 'heath'),
  e('Deschampsia flexuosa', 'śmiałek pogięty', 'heath'),
  e('Avenella flexuosa', 'śmiałek pogięty', 'heath'),
  e('Nardus stricta', 'bliźniczka psia trawka', 'heath'),
  e('Pohlia nutans', 'knotnik zwisły', 'heath', { moss: true }),
  e('Genista pilosa', 'janowiec włosisty', 'heath', W),
  e('Genista tinctoria', 'janowiec barwierski', 'heath', W),
  e('Viola canina', 'fiołek psi', 'heath'),

  // gatunki muraw napiaskowych (6120) – sprawozdanie 2021: zarośla jałowca na nich to nie 5130
  e('Koeleria glauca', 'strzęplica sina', 'psammo'),
  e('Corynephorus canescens', 'szczotlicha siwa', 'psammo'),
  e('Festuca psammophila', 'kostrzewa piaskowa', 'psammo'),
  e('Dianthus arenarius', 'goździk piaskowy', 'psammo'),
  e('Helichrysum arenarium', 'kocanki piaskowe', 'psammo'),
  e('Jasione montana', 'jasieniec piaskowy', 'psammo'),
  e('Gypsophila fastigiata', 'łyszczec wiechowaty', 'psammo'),

  // rodzime gatunki ekspansywne (sprawozdania 2009–2021)
  e('Calamagrostis epigejos', 'trzcinnik piaskowy', 'expansive'),
  e('Calamagrostis varia', 'trzcinnik pstry', 'expansive'),
  e('Pteridium aquilinum', 'orlica pospolita', 'expansive'),
  e('Rubus caesius', 'jeżyna popielica', 'expansive', W),
  e('Rubus sp.', 'jeżyna', 'expansive', W),
  e('Festuca rubra', 'kostrzewa czerwona', 'expansive'),
  e('Arrhenatherum elatius', 'rajgras wyniosły', 'expansive'),
  e('Elymus repens', 'perz właściwy', 'expansive'),
  e('Solidago virgaurea', 'nawłoć pospolita', 'expansive'),

  // obce gatunki inwazyjne (sprawozdanie 2021, tab. 4)
  e('Robinia pseudoacacia', 'robinia akacjowa', 'alien', W),
  e('Quercus rubra', 'dąb czerwony', 'alien', W),
  e('Prunus serotina', 'czeremcha amerykańska', 'alien', W),
  e('Padus serotina', 'czeremcha amerykańska', 'alien', W),
  e('Pinus nigra', 'sosna czarna', 'alien', W),
  e('Populus balsamifera', 'topola balsamiczna', 'alien', W),
  e('Juglans regia', 'orzech włoski', 'alien', W),
  e('Solidago gigantea', 'nawłoć późna', 'alien'),
  e('Solidago canadensis', 'nawłoć kanadyjska', 'alien'),
  e('Conyza canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Erigeron canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Erigeron annuus', 'przymiotno białe', 'alien'),

  // runo: gatunki towarzyszące (zdjęcia z karty Poradów)
  e('Achillea millefolium', 'krwawnik pospolity', 'companion'),
  e('Briza media', 'drżączka średnia', 'companion'),
  e('Cerinthe minor', 'ośmiał mniejszy', 'companion'),
  e('Convolvulus arvensis', 'powój polny', 'companion'),
  e('Crepis sp.', 'pępawa', 'companion'),
  e('Echium vulgare', 'żmijowiec zwyczajny', 'companion'),
  e('Galium mollugo', 'przytulia pospolita', 'companion'),
  e('Galium pumilum', 'przytulia niska', 'companion'),
  e('Hieracium pilosella', 'jastrzębiec kosmaczek', 'companion'),
  e('Hypericum perforatum', 'dziurawiec zwyczajny', 'companion'),
  e('Lotus corniculatus', 'komonica zwyczajna', 'companion'),
  e('Melampyrum pratense', 'pszeniec zwyczajny', 'companion'),
  e('Ononis arvensis', 'wilżyna bezbronna', 'companion'),
  e('Plantago lanceolata', 'babka lancetowata', 'companion'),
  e('Plantago media', 'babka średnia', 'companion'),
  e('Poa compressa', 'wiechlina spłaszczona', 'companion'),
  e('Ranunculus sp.', 'jaskier', 'companion'),
  e('Stellaria holostea', 'gwiazdnica wielkokwiatowa', 'companion'),
  e('Taraxacum officinale', 'mniszek pospolity', 'companion'),
  e('Festuca ovina', 'kostrzewa owcza', 'companion'),
  e('Hypnum cupressiforme', 'rokietnik cyprysowaty', 'companion', { moss: true }),
]

const BY_NAME = new Map(SPECIES_5130.map((s) => [normalizeName(s.latin), s]))

export const findSpecies5130 = (name: string): SpeciesEntry5130 | undefined => BY_NAME.get(normalizeName(name))

/**
 * Klucz gatunku do liczenia: synonimy (Cerasus avium = Prunus avium, Conyza = Erigeron canadensis…) dają ten sam
 * klucz – polską nazwę z katalogu. Spoza katalogu – nazwa znormalizowana.
 */
export const speciesKey5130 = (name: string) => findSpecies5130(name)?.polish ?? normalizeName(name)

const groupOf = (name: string) => findSpecies5130(name)?.group
export const isAlien5130 = (name: string) => groupOf(name) === 'alien'
export const isJuniper = (name: string) => groupOf(name) === 'juniper'
export const isMesicShrub = (name: string) => groupOf(name) === 'mesicShrub'
export const isTree5130 = (name: string) => groupOf(name) === 'tree'
export const isPsammo = (name: string) => groupOf(name) === 'psammo'
/** Gatunek charakterystyczny murawy/wrzosowiska (Festuco-Brometea, Elyno-Seslerietea albo Nardo-Callunetea). */
export const isCharacteristic5130 = (name: string) => ['grassland', 'mountain', 'heath'].includes(groupOf(name) ?? '')
/** Rodzaj z „pełnego zestawu gatunków typowych” (tab. 2) albo undefined. Rodzaj rozpoznawany też poza katalogiem (np. „Rosa ×…”). */
export function typicalGenus(name: string): TypicalGenus | undefined {
  const g = findSpecies5130(name)?.genus
  if (g) return g
  const n = normalizeName(name)
  if (/^rosa\b/.test(n)) return 'róża'
  if (/^crataegus\b/.test(n)) return 'głóg'
  if (/^juniperus communis\b/.test(n)) return 'jałowiec'
  return undefined
}
export const isTarnina = (name: string) => typicalGenus(name) === 'tarnina'

/** Krzewy i drzewa do B, mchy do D, reszta do C. */
export const defaultLayer5130 = (s: SpeciesEntry5130): Layer => (s.woody ? 'B' : s.moss ? 'D' : 'C')
