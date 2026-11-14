// Słownik gatunków dla 6120* (ciepłolubne śródlądowe murawy napiaskowe Koelerion glaucae), zebrany z przewodnika GIOŚ
// (Kujawa-Pawlaczyk 2010, pkt 4 „Typowe gatunki roślin” i tab. 1), z przykładowej karty (Kalinik, 2008) i ze sprawozdań
// z monitoringu 2006–2008, 2013–2014, 2015–2018 i 2023–2025 (gatunki obce – tab. 3 sprawozdania 2024).
// Murawa napiaskowa to warstwa C (kępowe trawy, byliny, terofity) i D (mchy, porosty); nalot sosny, brzozy – w B.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup6120 =
  | 'characteristic' // 22 gatunki charakterystyczne związku Koelerion glaucae z tab. 1 (z synonimami)
  | 'typical' // typowe gatunki z pkt 4 przewodnika, których nie ma w tab. 1 – do wskaźnika się NIE liczą
  | 'expansive' // rodzime gatunki ekspansywne roślin zielnych (tab. 1 + praktyka 2016–2024)
  | 'alien' // obce (tab. 3 sprawozdania 2024 i wcześniejszych)
  | 'woody' // rodzime drzewa i krzewy – ekspansja krzewów i podrostu drzew
  | 'companion' // inne gatunki muraw i łąk

export interface SpeciesEntry6120 {
  latin: string
  polish?: string
  group: SpeciesGroup6120
  /** Wymieniony w tab. 1 przewodnika (dla ekspansywnych i drzew); bez tego – z praktyki sprawozdań. */
  tab1?: boolean
  /** Mszak albo porost – w zdjęciu warstwa D. */
  cryptogam?: boolean
  /** Obcy, ale archeofit albo efemeryczny chwast pól – 2024: sporadyczny udział bez tendencji do inwazji nie obniża oceny. */
  weak?: boolean
}

export const GROUP_LABELS_6120: Record<SpeciesGroup6120, string> = {
  characteristic: 'gatunek charakterystyczny 6120 (tab. 1)',
  typical: 'gatunek typowy (pkt 4), ale spoza listy tab. 1 – nie liczy się',
  expansive: 'rodzimy gatunek ekspansywny',
  alien: 'gatunek obcy',
  woody: 'drzewo lub krzew (ekspansja krzewów i podrostu)',
  companion: 'gatunek towarzyszący',
}

const e = (latin: string, polish: string, group: SpeciesGroup6120, extra: Partial<SpeciesEntry6120> = {}): SpeciesEntry6120 => ({ latin, polish, group, ...extra })
const D = { cryptogam: true }
const T = { tab1: true }
const W = { weak: true }

export const SPECIES_6120: SpeciesEntry6120[] = [
  // gatunki charakterystyczne – tab. 1 (22 gatunki) + synonimy spotykane w kartach i sprawozdaniach
  e('Silene tatarica', 'lepnica tatarska', 'characteristic'),
  e('Silene lithuanica', 'lepnica litewska', 'characteristic'),
  e('Corynephorus canescens', 'szczotlicha siwa', 'characteristic'),
  e('Sedum sexangulare', 'rozchodnik sześciorzędowy', 'characteristic'),
  e('Dianthus carthusianorum', 'goździk kartuzek', 'characteristic'),
  e('Silene otites', 'lepnica wąskopłatkowa', 'characteristic'),
  e('Koeleria macrantha', 'strzęplica nadobna', 'characteristic'),
  e('Koeleria cristata', 'strzęplica nadobna', 'characteristic'),
  e('Festuca psammophila', 'kostrzewa piaskowa', 'characteristic'),
  e('Astragalus arenarius', 'traganek piaskowy', 'characteristic'),
  e('Ammophila arenaria', 'piaskownica zwyczajna', 'characteristic'),
  e('Festuca vaginata', 'kostrzewa pochwiasta', 'characteristic'),
  e('Koeleria glauca', 'strzęplica sina', 'characteristic'),
  e('Silene borysthenica', 'lepnica drobnokwiatowa', 'characteristic'),
  e('Dianthus arenarius', 'goździk piaskowy', 'characteristic'),
  e('Festuca polesica', 'kostrzewa poleska', 'characteristic'),
  e('Kochia laniflora', 'mietelnik piaskowy', 'characteristic'),
  e('Bassia laniflora', 'mietelnik piaskowy', 'characteristic'),
  e('Alyssum turkestanicum', 'smagliczka drobna', 'characteristic'),
  e('Alyssum desertorum', 'smagliczka drobna', 'characteristic'),
  e('Alyssum montanum subsp. gmelinii', 'smagliczka pagórkowata', 'characteristic'),
  e('Alyssum gmelinii', 'smagliczka pagórkowata', 'characteristic'),
  e('Androsace septentrionalis', 'naradka północna', 'characteristic'),
  e('Potentilla pusilla', 'pięciornik omszony', 'characteristic'),
  e('Potentilla puberula', 'pięciornik omszony', 'characteristic'),
  e('Chondrilla juncea', 'chondrilla sztywna', 'characteristic'),
  e('Gypsophila fastigiata', 'łyszczec baldachogronowy', 'characteristic'),

  // typowe gatunki z pkt 4 przewodnika, spoza listy tab. 1
  e('Armeria maritima subsp. elongata', 'zawciąg pospolity', 'typical'),
  e('Armeria elongata', 'zawciąg pospolity', 'typical'),
  e('Elymus arenarius', 'wydmuchrzyca piaskowa', 'typical'),
  e('Leymus arenarius', 'wydmuchrzyca piaskowa', 'typical'),
  e('Carex praecox', 'turzyca wczesna', 'typical'),
  e('Petasites spurius', 'lepiężnik kutnerowaty', 'typical'),
  e('Potentilla arenaria', 'pięciornik piaskowy', 'typical'),
  e('Potentilla incana', 'pięciornik piaskowy', 'typical'),
  e('Potentilla leucopolitana', 'pięciornik jedwabisty', 'typical'),
  e('Berteroa incana', 'pyleniec pospolity', 'typical'),
  e('Helichrysum arenarium', 'kocanki piaskowe', 'typical'),
  e('Hieracium echioides', 'jastrzębiec żmijowcowaty', 'typical'),
  e('Cerastium semidecandrum', 'rogownica pięciopręcikowa', 'typical'),
  e('Cerastium brachypetalum', 'rogownica drobnokwiatowa', 'typical'),
  e('Erophila verna', 'wiosnówka pospolita', 'typical'),
  e('Medicago minima', 'lucerna kolczastostrąkowa', 'typical'),
  e('Silene chlorantha', 'lepnica zielonawa', 'typical'),
  e('Sedum reflexum', 'rozchodnik ościsty', 'typical'),
  e('Peucedanum oreoselinum', 'gorysz pagórkowy', 'typical'),
  e('Centaurea stoebe', 'chaber nadreński', 'typical'),
  e('Centaurea rhenana', 'chaber nadreński', 'typical'),
  e('Phleum phleoides', 'tymotka Boehmera', 'typical'),
  e('Festuca trachyphylla', 'kostrzewa szczeciniasta', 'typical'),
  e('Thymus serpyllum', 'macierzanka piaskowa', 'typical'),
  e('Sedum acre', 'rozchodnik ostry', 'typical'),
  e('Jasione montana', 'jasieniec piaskowy', 'typical'),
  e('Trifolium arvense', 'koniczyna polna', 'typical'),
  e('Jovibarba sobolifera', 'rojownik pospolity', 'typical'),
  e('Plantago arenaria', 'babka piaskowa', 'typical'),
  e('Plantago indica', 'babka piaskowa', 'typical'),
  e('Myosotis ramosissima', 'niezapominajka pagórkowa', 'typical'),

  // rodzime gatunki ekspansywne roślin zielnych: tab. 1 – trzcinnik piaskowy; reszta z praktyki 2016–2018 i 2024
  e('Calamagrostis epigejos', 'trzcinnik piaskowy', 'expansive', T),
  e('Elymus repens', 'perz właściwy', 'expansive'),
  e('Elytrigia repens', 'perz właściwy', 'expansive'),
  e('Arrhenatherum elatius', 'rajgras wyniosły', 'expansive'),
  e('Agrostis capillaris', 'mietlica pospolita', 'expansive'),
  e('Agrostis vulgaris', 'mietlica pospolita', 'expansive'),
  e('Holcus lanatus', 'kłosówka wełnista', 'expansive'),
  e('Carex hirta', 'turzyca owłosiona', 'expansive'),
  e('Tanacetum vulgare', 'wrotycz pospolity', 'expansive'),
  e('Artemisia vulgaris', 'bylica pospolita', 'expansive'),
  e('Cirsium arvense', 'ostrożeń polny', 'expansive'),
  e('Rubus caesius', 'jeżyna popielica', 'expansive'),
  e('Equisetum arvense', 'skrzyp polny', 'expansive'),
  e('Pteridium aquilinum', 'orlica pospolita', 'expansive'),

  // gatunki obce – tab. 3 sprawozdania 2024 (+ 2013–2018); weak = archeofity i chwasty polne bez tendencji do inwazji
  e('Padus serotina', 'czeremcha amerykańska', 'alien'),
  e('Prunus serotina', 'czeremcha amerykańska', 'alien'),
  e('Conyza canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Erigeron canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Erigeron annuus', 'przymiotno białe', 'alien'),
  e('Acer negundo', 'klon jesionolistny', 'alien'),
  e('Robinia pseudoacacia', 'robinia akacjowa', 'alien'),
  e('Robinia pseudacacia', 'robinia akacjowa', 'alien'),
  e('Quercus rubra', 'dąb czerwony', 'alien'),
  e('Solidago gigantea', 'nawłoć późna', 'alien'),
  e('Solidago canadensis', 'nawłoć kanadyjska', 'alien'),
  e('Lupinus polyphyllus', 'łubin trwały', 'alien'),
  e('Salix acutifolia', 'wierzba ostrolistna', 'alien'),
  e('Echinocystis lobata', 'kolczurka klapowana', 'alien'),
  e('Rosa rugosa', 'róża pomarszczona', 'alien'),
  e('Parthenocissus inserta', 'winobluszcz zaroślowy', 'alien'),
  e('Asclepias syriaca', 'trojeść amerykańska', 'alien'),
  e('Rhus typhina', 'sumak octowiec', 'alien'),
  e('Mahonia aquifolium', 'mahonia pospolita', 'alien'),
  e('Campylopus introflexus', 'krzywoszczeć przywłoka', 'alien', D),
  e('Impatiens parviflora', 'niecierpek drobnokwiatowy', 'alien'),
  e('Bidens frondosa', 'uczep amerykański', 'alien'),
  e('Lepidium densiflorum', 'pieprzyca gęstokwiatowa', 'alien'),
  e('Corispermum leptopterum', 'wrzosowiec cienkoskrzydełkowy', 'alien'),
  e('Syringa vulgaris', 'lilak pospolity', 'alien'),
  e('Juglans regia', 'orzech włoski', 'alien'),
  e('Prunus cerasifera', 'śliwa wiśniowa', 'alien'),
  e('Prunus domestica', 'śliwa domowa', 'alien', W),
  e('Malus domestica', 'jabłoń domowa', 'alien', W),
  e('Pyrus communis', 'grusza pospolita', 'alien', W),
  e('Cerasus mahaleb', 'wiśnia wonna', 'alien'),
  e('Senecio vernalis', 'starzec wiosenny', 'alien', W),
  e('Bromus tectorum', 'stokłosa dachowa', 'alien', W),
  e('Anthoxanthum aristatum', 'tomka oścista', 'alien', W),
  e('Setaria pumila', 'włośnica sina', 'alien', W),
  e('Setaria viridis', 'włośnica zielona', 'alien', W),
  e('Centaurea cyanus', 'chaber bławatek', 'alien', W),
  e('Cichorium intybus', 'cykoria podróżnik', 'alien', W),
  e('Papaver rhoeas', 'mak polny', 'alien', W),
  e('Papaver dubium', 'mak wątpliwy', 'alien', W),
  e('Consolida regalis', 'ostróżeczka polna', 'alien', W),
  e('Veronica arvensis', 'przetacznik polny', 'alien', W),
  e('Fallopia convolvulus', 'rdestówka powojowata', 'alien', W),
  e('Lactuca serriola', 'sałata kompasowa', 'alien', W),
  e('Senecio vulgaris', 'starzec zwyczajny', 'alien', W),
  e('Capsella bursa-pastoris', 'tasznik pospolity', 'alien', W),
  e('Vicia tetrasperma', 'wyka czteronasienna', 'alien', W),
  e('Vicia hirsuta', 'wyka drobnokwiatowa', 'alien', W),
  e('Odontites verna', 'zagorzałek wiosenny', 'alien', W),

  // rodzime drzewa i krzewy – tab. 1 (sosna, brzoza, tarnina, głogi, berberys, szakłak, jałowiec, kruszyna) + praktyka
  e('Pinus sylvestris', 'sosna zwyczajna', 'woody', T),
  e('Betula pendula', 'brzoza brodawkowata', 'woody', T),
  e('Prunus spinosa', 'śliwa tarnina', 'woody', T),
  e('Crataegus monogyna', 'głóg jednoszyjkowy', 'woody', T),
  e('Crataegus laevigata', 'głóg dwuszyjkowy', 'woody', T),
  e('Crataegus sp.', 'głóg', 'woody', T),
  e('Berberis vulgaris', 'berberys zwyczajny', 'woody', T),
  e('Rhamnus cathartica', 'szakłak pospolity', 'woody', T),
  e('Juniperus communis', 'jałowiec pospolity', 'woody', T),
  e('Frangula alnus', 'kruszyna pospolita', 'woody', T),
  e('Populus tremula', 'topola osika', 'woody'),
  e('Populus nigra', 'topola czarna', 'woody'),
  e('Salix caprea', 'wierzba iwa', 'woody'),
  e('Salix repens', 'wierzba płożąca', 'woody'),
  e('Rosa canina', 'róża dzika', 'woody'),
  e('Cytisus scoparius', 'żarnowiec miotlasty', 'woody'),
  e('Sarothamnus scoparius', 'żarnowiec miotlasty', 'woody'),
  e('Quercus robur', 'dąb szypułkowy', 'woody'),
  e('Sorbus aucuparia', 'jarząb pospolity', 'woody'),

  // gatunki towarzyszące (m.in. ze zdjęć karty Kalinik)
  e('Achillea millefolium', 'krwawnik pospolity', 'companion'),
  e('Anthoxanthum odoratum', 'tomka wonna', 'companion'),
  e('Briza media', 'drżączka średnia', 'companion'),
  e('Campanula patula', 'dzwonek rozpierzchły', 'companion'),
  e('Cuscuta epithymum', 'kanianka macierzankowa', 'companion'),
  e('Euphorbia cyparissias', 'wilczomlecz sosnka', 'companion'),
  e('Euphrasia stricta', 'świetlik wyprostowany', 'companion'),
  e('Filipendula vulgaris', 'wiązówka bulwkowa', 'companion'),
  e('Galium verum', 'przytulia właściwa', 'companion'),
  e('Hieracium pilosella', 'jastrzębiec kosmaczek', 'companion'),
  e('Pilosella officinarum', 'jastrzębiec kosmaczek', 'companion'),
  e('Hypochaeris radicata', 'prosienicznik szorstki', 'companion'),
  e('Leucanthemum vulgare', 'jastrun właściwy', 'companion'),
  e('Lotus corniculatus', 'komonica zwyczajna', 'companion'),
  e('Nardus stricta', 'bliźniczka psia trawka', 'companion'),
  e('Pimpinella saxifraga', 'biedrzeniec mniejszy', 'companion'),
  e('Plantago lanceolata', 'babka lancetowata', 'companion'),
  e('Poa angustifolia', 'wiechlina wąskolistna', 'companion'),
  e('Prunella vulgaris', 'głowienka pospolita', 'companion'),
  e('Rumex acetosa', 'szczaw zwyczajny', 'companion'),
  e('Rumex acetosella', 'szczaw polny', 'companion'),
  e('Rumex thyrsiflorus', 'szczaw rozpierzchły', 'companion'),
  e('Sanguisorba minor', 'krwiściąg mniejszy', 'companion'),
  e('Trifolium campestre', 'koniczyna różnoogonkowa', 'companion'),
  e('Trifolium pratense', 'koniczyna łąkowa', 'companion'),
  e('Trifolium repens', 'koniczyna biała', 'companion'),
  e('Festuca ovina', 'kostrzewa owcza', 'companion'),
  e('Festuca rubra', 'kostrzewa czerwona', 'companion'),
  e('Deschampsia flexuosa', 'śmiałek pogięty', 'companion'),
  e('Calluna vulgaris', 'wrzos zwyczajny', 'companion'),
  e('Scleranthus perennis', 'czerwiec trwały', 'companion'),
  e('Veronica spicata', 'przetacznik kłosowy', 'companion'),
  e('Veronica dillenii', 'przetacznik Dillena', 'companion'),
  e('Spergula morisonii', 'sporek wiosenny', 'companion'),
  e('Teesdalia nudicaulis', 'chroszcz nagołodygowy', 'companion'),
  e('Arenaria serpyllifolia', 'piaskowiec macierzankowy', 'companion'),
  e('Hypericum perforatum', 'dziurawiec zwyczajny', 'companion'),
  e('Artemisia campestris', 'bylica polna', 'companion'),
  e('Scabiosa ochroleuca', 'driakiew żółtawa', 'companion'),
  e('Sedum maximum', 'rozchodnik wielki', 'companion'),
  e('Brachythecium albicans', 'krótkosz białawy', 'companion', D),
  e('Polytrichum piliferum', 'płonnik włosisty', 'companion', D),
  e('Ceratodon purpureus', 'zęboróg purpurowy', 'companion', D),
  e('Hypnum cupressiforme', 'rokietnik pospolity', 'companion', D),
  e('Cladonia sp.', 'chrobotek', 'companion', D),
  e('Cetraria aculeata', 'płucnica kolczasta', 'companion', D),
]

const BY_NAME = new Map(SPECIES_6120.map((s) => [normalizeName(s.latin), s]))

export const findSpecies6120 = (name: string): SpeciesEntry6120 | undefined => BY_NAME.get(normalizeName(name))

export const isCharacteristic6120 = (name: string) => findSpecies6120(name)?.group === 'characteristic'
export const isTypical6120 = (name: string) => findSpecies6120(name)?.group === 'typical'
export const isExpansive6120 = (name: string) => findSpecies6120(name)?.group === 'expansive'
export const isAlien6120 = (name: string) => findSpecies6120(name)?.group === 'alien'
export const isWeakAlien6120 = (name: string) => Boolean(findSpecies6120(name)?.weak)
export const isWoody6120 = (name: string) => findSpecies6120(name)?.group === 'woody'

/**
 * Klucz gatunku do liczenia: synonimy (Koeleria cristata = K. macrantha, Conyza = Erigeron canadensis…) dają ten sam
 * klucz – polską nazwę z katalogu. Spoza katalogu – nazwa znormalizowana.
 */
export const speciesKey6120 = (name: string) => findSpecies6120(name)?.polish ?? normalizeName(name)

const WOODY_ALIENS = new Set(['Padus serotina', 'Prunus serotina', 'Acer negundo', 'Robinia pseudoacacia', 'Robinia pseudacacia', 'Quercus rubra', 'Salix acutifolia', 'Rosa rugosa', 'Rhus typhina', 'Mahonia aquifolium', 'Syringa vulgaris', 'Juglans regia', 'Prunus cerasifera', 'Prunus domestica', 'Malus domestica', 'Pyrus communis', 'Cerasus mahaleb'])

/** Drzewa i krzewy do B, mszaki i porosty do D, reszta do C. */
export const defaultLayer6120 = (s: SpeciesEntry6120): Layer => {
  if (s.cryptogam) return 'D'
  if (s.group === 'woody') return s.latin === 'Salix repens' ? 'C' : 'B'
  if (WOODY_ALIENS.has(s.latin)) return 'B'
  return 'C'
}
