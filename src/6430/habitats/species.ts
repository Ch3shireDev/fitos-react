// Słownik gatunków dla 6430 (ziołorośla górskie Adenostylion alliariae i ziołorośla nadrzeczne Convolvuletalia sepium),
// zebrany z przewodnika GIOŚ (Mróz, Świerkosz, Kozak 2012, pkt 4 „Typowe gatunki roślin” i tab. 1), z przykładowej karty
// (Między Kościółkami a przełęczą Brona, Babia Góra, 2011) i ze sprawozdań z monitoringu 2009–2011, 2016–2018
// i 2024–2025 (gatunki charakterystyczne postulowane w 2025 r., rodzime ekspansywne, gatunki obce z tab. 4 sprawozdania).
// Drzewa i krzewy – warstwa B, runo – C, mchy – D.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup6430 =
  | 'characteristic' // gatunki charakterystyczne ziołorośli górskich albo niżowych
  | 'expansive' // rodzime gatunki ekspansywne roślin zielnych
  | 'alien' // gatunki obce (inwazyjne i pozostałe z tab. 4 sprawozdania 2024–2025)
  | 'companion' // pozostałe gatunki (zdjęcia z karty przykładowej, drzewa i krzewy)

export interface SpeciesEntry6430 {
  latin: string
  polish?: string
  group: SpeciesGroup6430
  /**
   * Skąd gatunek charakterystyczny albo ekspansywny: 'tab1' – lista w tab. 1 przewodnika; 'typical' – „Typowe gatunki
   * roślin” (pkt 4 przewodnika) spoza tab. 1; 'card' – gatunki związku Adenostylion alliariae policzone w karcie
   * przykładowej (wg Matuszkiewicza 2001); 'report' – dopisane w sprawozdaniach (2016–2025).
   */
  source?: 'tab1' | 'typical' | 'card' | 'report'
  /** Ziołorośla niżowe (Convolvuletalia sepium) – pozostałe charakterystyczne to ziołorośla górskie. */
  lowland?: boolean
  woody?: boolean
  /** Mech albo wątrobowiec – warstwa D. */
  cryptogam?: boolean
  /** Gatunek obcy bez tendencji do inwazji (archeofit, efemerofit, uciekinier z upraw) – w tab. 4 sprawozdania 2025 jako „obcy”. */
  weak?: boolean
  /** Sprawozdanie 2024–2025 postuluje dopisanie do gatunków charakterystycznych, choć tab. 1 ma go wśród ekspansywnych. */
  postulated?: boolean
}

export const GROUP_LABELS_6430: Record<SpeciesGroup6430, string> = {
  characteristic: 'gatunek charakterystyczny 6430',
  expansive: 'rodzimy gatunek ekspansywny',
  alien: 'obcy gatunek inwazyjny',
  companion: 'gatunek towarzyszący',
}

const e = (latin: string, polish: string, group: SpeciesGroup6430, extra: Partial<SpeciesEntry6430> = {}): SpeciesEntry6430 => ({ latin, polish, group, ...extra })
const ch = (source: SpeciesEntry6430['source']) => (latin: string, polish: string, extra: Partial<SpeciesEntry6430> = {}) =>
  e(latin, polish, 'characteristic', { source, ...extra })
const t1 = ch('tab1')
const ty = ch('typical')
const cd = ch('card')
const rp = ch('report')
const ex = (source: 'tab1' | 'report') => (latin: string, polish: string, extra: Partial<SpeciesEntry6430> = {}) => e(latin, polish, 'expansive', { source, ...extra })
const x1 = ex('tab1')
const xr = ex('report')
const al = (latin: string, polish: string, extra: Partial<SpeciesEntry6430> = {}) => e(latin, polish, 'alien', extra)
const co = (latin: string, polish: string, extra: Partial<SpeciesEntry6430> = {}) => e(latin, polish, 'companion', extra)
const L = { lowland: true }
const W = { woody: true }
const D = { cryptogam: true }
const WEAK = { weak: true }

export const SPECIES_6430: SpeciesEntry6430[] = [
  // tab. 1 – gatunki charakterystyczne ziołorośli górskich
  t1('Adenostyles alliariae', 'miłosna górska'),
  t1('Adenostyles alliaria', 'miłosna górska (syn.)'),
  t1('Cicerbita alpina', 'modrzyk górski'),
  t1('Mulgedium alpinum', 'modrzyk górski (syn.)'),
  t1('Doronicum austriacum', 'omieg górski'),
  t1('Aconitum firmum', 'tojad mocny'),
  t1('Athyrium distentifolium', 'wietlica alpejska'),
  t1('Petasites kablikianus', 'lepiężnik wyłysiały'),
  t1('Petasites albus', 'lepiężnik biały'),
  // tab. 1 – gatunki charakterystyczne ziołorośli niżowych
  t1('Calystegia sepium', 'kielisznik zaroślowy', L),
  t1('Cuscuta europaea', 'kanianka pospolita', L),
  t1('Carduus crispus', 'oset kędzierzawy', L),
  t1('Cuscuta lupuliformis', 'kanianka wielka', L),
  t1('Angelica archangelica subsp. litoralis', 'dzięgiel litwor nadbrzeżny', L),
  t1('Archangelica litoralis', 'dzięgiel litwor nadbrzeżny (syn.)', L),
  t1('Senecio fluviatilis', 'starzec nadrzeczny', L),
  t1('Senecio sarracenicus', 'starzec nadrzeczny (syn.)', L),
  t1('Galium rivale', 'przytulia lepczyca', L),
  t1('Epilobium hirsutum', 'wierzbownica kosmata', L),

  // pkt 4 przewodnika – typowe gatunki ziołorośli górskich spoza tab. 1
  ty('Angelica archangelica', 'dzięgiel litwor'),
  ty('Senecio fuchsii', 'starzec Fuchsa'),
  ty('Senecio ovatus', 'starzec Fuchsa (syn.)'),
  ty('Rumex alpestris', 'szczaw górski'),
  ty('Rumex arifolius', 'szczaw górski (syn.)'),
  ty('Ranunculus platanifolius', 'jaskier platanolistny'),
  ty('Phyteuma spicatum', 'zerwa kłosowa'),
  ty('Senecio subalpinus', 'starzec górski'),
  ty('Veratrum lobelianum', 'ciemiężyca zielona'),
  ty('Chaerophyllum hirsutum', 'świerząbek orzęsiony'),
  ty('Carduus personata', 'oset łopianowaty'),
  ty('Orobanche lutea', 'zaraza żółta'),
  ty('Stellaria nemorum', 'gwiazdnica gajowa'),
  ty('Cardamine amara', 'rzeżucha gorzka'),

  // karta przykładowa – gatunki związku Adenostylion alliariae wg Matuszkiewicza (2001), spoza tab. 1 i pkt 4
  cd('Epilobium alpestre', 'wierzbownica alpejska'),
  cd('Valeriana sambucifolia', 'kozłek bzowy'),

  // sprawozdanie 2024–2025 – gatunki notowane jako charakterystyczne i postulowane do listy diagnostycznej
  rp('Aconitum variegatum', 'tojad dzióbaty'),
  rp('Aconitum plicatum', 'tojad sudecki'),
  rp('Petasites hybridus', 'lepiężnik różowy'),
  rp('Senecio nemorensis', 'starzec gajowy'),
  rp('Senecio hercynicus', 'starzec hercyński'),
  rp('Senecio germanicus', 'starzec niemiecki'),
  rp('Rhizomnium punctatum', 'merzyk kropkowany', D),
  rp('Fallopia dumetorum', 'rdestówka zaroślowa', L),
  rp('Polygonum dumetorum', 'rdestówka zaroślowa (syn.)', L),

  // tab. 1 – rodzime gatunki ekspansywne roślin zielnych
  x1('Eupatorium cannabinum', 'sadziec konopiasty', { postulated: true }),
  x1('Phalaris arundinacea', 'mozga trzcinowata'),
  x1('Mentha longifolia', 'mięta długolistna'),
  x1('Brachypodium sylvaticum', 'kłosownica leśna'),
  x1('Filipendula ulmaria', 'wiązówka błotna'),
  x1('Rubus idaeus', 'malina właściwa', W),
  x1('Aegopodium podagraria', 'podagrycznik pospolity'),
  // sprawozdania 2009–2011 (gatunki synantropijne i dominujące) i 2024–2025
  xr('Chamaenerion angustifolium', 'wierzbówka kiprzyca'),
  xr('Epilobium angustifolium', 'wierzbówka kiprzyca (syn.)'),
  xr('Calamagrostis epigejos', 'trzcinnik piaskowy'),
  xr('Rubus hirtus', 'jeżyna gruczołowata', W),
  xr('Rubus caesius', 'jeżyna popielica', W),
  xr('Rubus sp.', 'jeżyna', W),
  xr('Phragmites australis', 'trzcina pospolita'),
  xr('Carex acuta', 'turzyca zaostrzona'),
  xr('Carex gracilis', 'turzyca zaostrzona (syn.)'),
  xr('Cirsium arvense', 'ostrożeń polny'),
  xr('Vaccinium myrtillus', 'borówka czernica'),
  xr('Urtica dioica', 'pokrzywa zwyczajna'),
  xr('Galeopsis sp.', 'poziewnik'),
  xr('Galium aparine', 'przytulia czepna'),
  xr('Geum urbanum', 'kuklik pospolity'),
  xr('Rumex obtusifolius', 'szczaw tępolistny'),

  // obce gatunki inwazyjne: tab. 1 przewodnika i tab. 4 sprawozdania 2024–2025
  al('Impatiens glandulifera', 'niecierpek gruczołowaty'),
  al('Impatiens parviflora', 'niecierpek drobnokwiatowy'),
  al('Rudbeckia laciniata', 'rudbekia naga'),
  al('Rudbeckia hirta', 'rudbekia owłosiona'),
  al('Aster novi-belgii', 'aster nowobelgijski'),
  al('Symphyotrichum novi-belgii', 'aster nowobelgijski (syn.)'),
  al('Aster tradescantii', 'aster drobnokwiatowy'),
  al('Solidago canadensis', 'nawłoć kanadyjska'),
  al('Solidago gigantea', 'nawłoć późna'),
  al('Reynoutria japonica', 'rdestowiec ostrokończysty'),
  al('Fallopia japonica', 'rdestowiec ostrokończysty (syn.)'),
  al('Reynoutria sachalinensis', 'rdestowiec sachaliński'),
  al('Reynoutria ×bohemica', 'rdestowiec czeski'),
  al('Digitalis purpurea', 'naparstnica purpurowa'),
  al('Mimulus guttatus', 'kroplik żółty'),
  al('Echinocystis lobata', 'kolczurka klapowana'),
  al('Heracleum sosnowskyi', 'barszcz Sosnowskiego'),
  al('Heracleum mantegazzianum', 'barszcz Mantegazziego'),
  al('Erigeron annuus', 'przymiotno białe'),
  al('Conyza canadensis', 'przymiotno kanadyjskie'),
  al('Bidens frondosa', 'uczep amerykański'),
  al('Lupinus polyphyllus', 'łubin trwały'),
  al('Epilobium ciliatum', 'wierzbownica gruczołowata'),
  al('Epilobium adenocaulon', 'wierzbownica gruczołowata (syn.)'),
  al('Acer negundo', 'klon jesionolistny', W),
  al('Padus serotina', 'czeremcha amerykańska', W),
  al('Prunus serotina', 'czeremcha amerykańska (syn.)', W),
  al('Symphoricarpos albus', 'śnieguliczka biała', W),
  al('Spiraea ×pseudosalicifolia', 'tawuła nibywierzbolistna', W),
  // gatunki obce bez tendencji do inwazji (archeofity, efemerofity, uciekinierzy z upraw) – tab. 4 sprawozdania 2025
  al('Juglans regia', 'orzech włoski', { ...W, ...WEAK }),
  al('Malus domestica', 'jabłoń domowa', { ...W, ...WEAK }),
  al('Viola arvensis', 'fiołek polny', WEAK),
  al('Lamium amplexicaule', 'jasnota różowa', WEAK),
  al('Ballota nigra', 'mierznica czarna', WEAK),
  al('Apera spica-venti', 'miotła zbożowa', WEAK),
  al('Sonchus asper', 'mlecz kolczasty', WEAK),
  al('Sonchus oleraceus', 'mlecz zwyczajny', WEAK),
  al('Avena fatua', 'owies głuchy', WEAK),
  al('Capsella bursa-pastoris', 'tasznik pospolity', WEAK),
  al('Thlaspi arvense', 'tobołki polne', WEAK),
  al('Setaria viridis', 'włośnica zielona', WEAK),
  al('Descurainia sophia', 'stulicha psia', WEAK),
  al('Lactuca serriola', 'sałata kompasowa', WEAK),
  al('Medicago sativa', 'lucerna siewna', WEAK),
  al('Rumex longifolius', 'szczaw domowy', WEAK),

  // pozostałe gatunki ze zdjęć karty przykładowej
  co('Geranium sylvaticum', 'bodziszek leśny'),
  co('Geum rivale', 'kuklik zwisły'),
  co('Heracleum sphondylium', 'barszcz zwyczajny'),
  co('Hypericum maculatum', 'dziurawiec czteroboczny'),
  co('Melandrium rubrum', 'bniec czerwony'),
  co('Silene dioica', 'bniec czerwony (syn.)'),
  co('Milium effusum', 'prosownica rozpierzchła'),
  co('Polygonum bistorta', 'rdest wężownik'),
  co('Bistorta officinalis', 'rdest wężownik (syn.)'),
  co('Primula elatior', 'pierwiosnek wyniosły'),
  co('Sedum fabaria', 'rozchodnik karpacki'),
  co('Thalictrum aquilegiifolium', 'rutewka orlikolistna'),
  co('Veratrum album', 'ciemiężyca biała'),
  co('Viola biflora', 'fiołek dwukwiatowy'),
  co('Mutellina purpurea', 'marchwica pospolita'),
  co('Oxalis acetosella', 'szczawik zajęczy'),
  co('Calamagrostis villosa', 'trzcinnik owłosiony'),
  co('Soldanella carpatica', 'urdzik karpacki'),
  // drzewa i krzewy w otoczeniu i na skraju płatów
  co('Pinus mugo', 'kosodrzewina', W),
  co('Sorbus aucuparia', 'jarząb pospolity', W),
  co('Salix silesiaca', 'wierzba śląska', W),
  co('Alnus incana', 'olsza szara', W),
  co('Alnus glutinosa', 'olsza czarna', W),
  co('Picea abies', 'świerk pospolity', W),
  co('Salix fragilis', 'wierzba krucha', W),
]

const BY_NAME = new Map(SPECIES_6430.map((s) => [normalizeName(s.latin), s]))

export const findSpecies6430 = (name: string): SpeciesEntry6430 | undefined => BY_NAME.get(normalizeName(name))

/** Klucz do liczenia gatunków: synonimy (Senecio fuchsii/ovatus, Cicerbita/Mulgedium…) dają jeden klucz. */
export const speciesKey6430 = (name: string) => (findSpecies6430(name)?.polish ?? normalizeName(name)).replace(/ \(syn\.\)$/, '')

const groupOf = (name: string) => findSpecies6430(name)?.group
export const isCharacteristic6430 = (name: string) => groupOf(name) === 'characteristic'
export const isExpansive6430 = (name: string) => groupOf(name) === 'expansive'
export const isAlien6430 = (name: string) => groupOf(name) === 'alien'
export const isWeakAlien6430 = (name: string) => Boolean(findSpecies6430(name)?.weak)

export const defaultLayer6430 = (s: SpeciesEntry6430): Layer => (s.woody ? 'B' : s.cryptogam ? 'D' : 'C')
