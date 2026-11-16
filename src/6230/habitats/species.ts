// Słownik gatunków dla *6230 (bogate florystycznie górskie i niżowe murawy bliźniczkowe Nardetalia), zebrany
// z przewodnika GIOŚ (Korzeniak 2010, pkt 4 „Typowe gatunki roślin” i tab. 1), z przykładowej karty (Piorunowiec, 2007)
// i ze sprawozdań z monitoringu 2006–2008, 2013–2014, 2015–2018 i 2023–2025 (gatunki obce – tab. 4 sprawozdania 2024).
// Murawa to warstwa C (trawy, byliny, krzewinki) i D (mchy, porosty); podrost drzew i krzewy – B.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup6230 =
  | 'characteristic' // gatunki charakterystyczne i wyróżniające Nardetalia / Nardo-Callunetea i zespołów z tab. 1
  | 'expansive' // rodzime gatunki ekspansywne roślin zielnych (tab. 1 + sprawozdania)
  | 'alien' // gatunki obce (tab. 4 sprawozdania 2024 i wcześniejsze)
  | 'woody' // rodzime drzewa i krzewy – ekspansja krzewów i podrostu drzew
  | 'nitrophilous' // gatunki nitrofilne i ruderalne – eutrofizacja
  | 'companion' // pozostałe gatunki (zdjęcia karty przykładowej)

export interface SpeciesEntry6230 {
  latin: string
  polish?: string
  group: SpeciesGroup6230
  /**
   * Skąd gatunek charakterystyczny: 'guide' – pkt 4 albo tab. 1 przewodnika; 'report' – uznany za charakterystyczny
   * w sprawozdaniach (przytulia hercyńska, goryczka wąskolistna z Gentiano-Nardetum).
   */
  source?: 'guide' | 'report'
  /** Wskazuje też na eutrofizację (nitrofilny) – niezależnie od grupy (np. świerząbek korzenny jest też ekspansywny). */
  nitro?: boolean
  /** Drzewo albo krzew (warstwa B). */
  woody?: boolean
  /** Drzewo lub krzew o mniejszym zagrożeniu dla muraw (przewodnik: jałowiec „znacznie mniejsze zagrożenie niż brzoza czy wierzby”). */
  slow?: boolean
  /** Mszak albo porost – warstwa D. */
  cryptogam?: boolean
  /** Obcy, ale archeofit albo efemeryczny chwast – sprawozdanie 2024: większość takich „nie jest uznawana za inwazyjne”. */
  weak?: boolean
}

export const GROUP_LABELS_6230: Record<SpeciesGroup6230, string> = {
  characteristic: 'gatunek charakterystyczny lub wyróżniający 6230',
  expansive: 'rodzimy gatunek ekspansywny',
  alien: 'gatunek obcy',
  woody: 'drzewo lub krzew (ekspansja krzewów i podrostu)',
  nitrophilous: 'gatunek nitrofilny (eutrofizacja)',
  companion: 'gatunek towarzyszący',
}

const e = (latin: string, polish: string, group: SpeciesGroup6230, extra: Partial<SpeciesEntry6230> = {}): SpeciesEntry6230 => ({ latin, polish, group, ...extra })
/** Gatunek charakterystyczny z przewodnika (pkt 4, tab. 1). */
const c = (latin: string, polish: string, extra: Partial<SpeciesEntry6230> = {}) => e(latin, polish, 'characteristic', { source: 'guide', ...extra })
const W = { woody: true }
const D = { cryptogam: true }
const N = { nitro: true }
const WEAK = { weak: true }

export const SPECIES_6230: SpeciesEntry6230[] = [
  // --- gatunki charakterystyczne klasy Nardo-Callunetea i rzędu Nardetalia (pkt 4) ---
  c('Nardus stricta', 'bliźniczka psia trawka'),
  c('Antennaria dioica', 'ukwap dwupienny'),
  c('Arnica montana', 'arnika górska'),
  c('Botrychium lunaria', 'podejźrzon księżycowy'),
  c('Botrychium multifidum', 'podejźrzon rutolistny'),
  c('Carex pilulifera', 'turzyca pigułkowata'),
  c('Coeloglossum viride', 'ozorka zielona'),
  c('Dactylorhiza viridis', 'ozorka zielona (syn.)'),
  c('Danthonia decumbens', 'izgrzyca przyziemna'),
  c('Sieglingia decumbens', 'izgrzyca przyziemna (syn.)'),
  c('Hieracium lactucella', 'jastrzębiec gronkowy'),
  c('Pilosella lactucella', 'jastrzębiec gronkowy (syn.)'),
  c('Hieracium lachenalii', 'jastrzębiec Lachenala'),
  c('Hieracium pilosella', 'jastrzębiec kosmaczek'),
  c('Pilosella officinarum', 'jastrzębiec kosmaczek (syn.)'),
  c('Luzula campestris', 'kosmatka polna'),
  c('Luzula multiflora', 'kosmatka licznokwiatowa'),
  c('Lycopodium clavatum', 'widłak goździsty'),
  c('Polygala vulgaris', 'krzyżownica zwyczajna'),
  c('Polygala oxyptera', 'krzyżownica ostroskrzydełkowa'),
  c('Potentilla erecta', 'pięciornik kurze ziele'),
  c('Viola canina', 'fiołek psi'),
  c('Veronica officinalis', 'przetacznik leśny'),
  // --- psiary reglowe i wysokogórskie (pkt 4, tab. 1) ---
  c('Ajuga pyramidalis', 'dąbrówka piramidalna'),
  c('Diphasiastrum alpinum', 'widlicz alpejski'),
  c('Gnaphalium norvegicum', 'szarota norweska'),
  c('Omalotheca norvegica', 'szarota norweska (syn.)'),
  c('Geum montanum', 'kuklik górski'),
  c('Homogyne alpina', 'podbiałek alpejski'),
  c('Hypochoeris uniflora', 'prosienicznik jednogłówkowy'),
  c('Hypochaeris uniflora', 'prosienicznik jednogłówkowy (syn.)'),
  c('Leucorchis albida', 'gołek białawy'),
  c('Pseudorchis albida', 'gołek białawy (syn.)'),
  c('Luzula sudetica', 'kosmatka sudecka'),
  c('Crepis conyzifolia', 'pępawa wielkokwiatowa'),
  c('Gentiana punctata', 'goryczka kropkowana'),
  c('Potentilla aurea', 'pięciornik złoty'),
  c('Pulsatilla alba', 'sasanka alpejska'),
  c('Solidago alpestris', 'nawłoć alpejska'),
  c('Solidago virgaurea subsp. minuta', 'nawłoć alpejska (syn.)'),
  // Carici rigidae-Nardetum – gatunki wysokogórskie (Diff. Ass., tab. 1)
  c('Hieracium alpinum', 'jastrzębiec alpejski'),
  c('Huperzia selago', 'wroniec widlasty'),
  c('Primula minima', 'pierwiosnek maleńki'),
  c('Agrostis rupestris', 'mietlica skalna'),
  // gatunki lokalnie charakterystyczne i wyróżniające: Sudety
  c('Campanula barbata', 'dzwonek brodaty'),
  c('Carex bigelowii subsp. rigida', 'turzyca tęga'),
  c('Carex rigida', 'turzyca tęga (syn.)'),
  // Tatry
  c('Carex sempervirens subsp. tatrorum', 'turzyca zawsze zielona'),
  c('Carex sempervirens', 'turzyca zawsze zielona (syn.)'),
  c('Crocus scepusiensis', 'szafran spiski'),
  c('Mutellina purpurea', 'marchwica pospolita'),
  c('Ligusticum mutellina', 'marchwica pospolita (syn.)'),
  c('Phleum commutatum', 'tymotka alpejska'),
  // Bieszczady
  c('Scorzonera rosea', 'wężymord górski'),
  c('Viola dacica', 'fiołek dacki'),
  c('Chrysanthemum corymbosum subsp. clusii', 'wrotycz baldachogroniasty Kluzjusza'),
  c('Tanacetum corymbosum subsp. clusii', 'wrotycz baldachogroniasty Kluzjusza (syn.)'),
  c('Dianthus compactus', 'goździk skupiony'),
  c('Festuca airoides', 'kostrzewa niska'),
  c('Festuca supina', 'kostrzewa niska (syn.)'),
  // piętra reglowe Karpat Zachodnich
  c('Carex pallescens', 'turzyca blada'),
  c('Carex leporina', 'turzyca zajęcza'),
  c('Carex ovalis', 'turzyca zajęcza (syn.)'),
  c('Carlina acaulis', 'dziewięćsił bezłodygowy'),
  c('Thymus pulegioides', 'macierzanka zwyczajna'),
  // niż, pogórze, regle – zależnie od warunków edaficznych
  c('Juncus squarrosus', 'sit sztywny'),
  c('Pedicularis sylvatica', 'gnidosz rozesłany'),
  c('Calluna vulgaris', 'wrzos pospolity'),
  // uznane za charakterystyczne w sprawozdaniach
  c('Galium saxatile', 'przytulia hercyńska', { source: 'report' }),
  c('Galium harcynicum', 'przytulia hercyńska (syn.)', { source: 'report' }),
  c('Gentiana pneumonanthe', 'goryczka wąskolistna', { source: 'report' }),

  // --- rodzime gatunki ekspansywne roślin zielnych (tab. 1, sprawozdania) ---
  // dziurawiec czteroboczny: charakterystyczny tylko w Polygalo-Nardetum (f. glabrum) – sprawozdanie 2024
  e('Hypericum maculatum', 'dziurawiec czteroboczny', 'expansive'),
  e('Vaccinium myrtillus', 'borówka czarna', 'expansive'),
  e('Vaccinium vitis-idaea', 'borówka brusznica', 'expansive'),
  e('Calamagrostis arundinacea', 'trzcinnik leśny', 'expansive'),
  e('Calamagrostis epigejos', 'trzcinnik piaskowy', 'expansive'),
  e('Calamagrostis villosa', 'trzcinnik owłosiony', 'expansive'),
  e('Calamagrostis sp.', 'trzcinnik', 'expansive'),
  e('Deschampsia caespitosa', 'śmiałek darniowy', 'expansive'),
  e('Deschampsia flexuosa', 'śmiałek pogięty', 'expansive'),
  e('Avenella flexuosa', 'śmiałek pogięty (syn.)', 'expansive'),
  e('Agrostis capillaris', 'mietlica pospolita', 'expansive'),
  e('Agrostis tenuis', 'mietlica pospolita (syn.)', 'expansive'),
  e('Agrostis vulgaris', 'mietlica pospolita (syn.)', 'expansive'),
  e('Festuca rubra', 'kostrzewa czerwona', 'expansive'),
  e('Holcus mollis', 'kłosówka miękka', 'expansive'),
  e('Holcus lanatus', 'kłosówka wełnista', 'expansive'),
  e('Cirsium helenioides', 'ostrożeń dwubarwny', 'expansive'),
  e('Cirsium heterophyllum', 'ostrożeń dwubarwny (syn.)', 'expansive'),
  e('Gentiana asclepiadea', 'goryczka trojeściowa', 'expansive'),
  e('Rubus idaeus', 'malina właściwa', 'expansive'),
  e('Rubus hirtus', 'jeżyna gruczołowata', 'expansive'),
  e('Rubus caesius', 'jeżyna popielica', 'expansive'),
  e('Rubus fruticosus agg.', 'jeżyna krzewiasta', 'expansive'),
  e('Rubus sp.', 'jeżyna', 'expansive'),
  e('Molinia caerulea', 'trzęślica modra', 'expansive'),
  e('Lysimachia vulgaris', 'tojeść zwyczajna', 'expansive'),
  e('Avenula pubescens', 'owsica omszona', 'expansive'),
  e('Avenastrum pubescens', 'owsica omszona (syn.)', 'expansive'),
  e('Potentilla anserina', 'pięciornik gęsi', 'expansive'),
  e('Chaerophyllum aromaticum', 'świerząbek korzenny', 'expansive', N),

  // --- gatunki nitrofilne i ruderalne (eutrofizacja) ---
  e('Urtica dioica', 'pokrzywa zwyczajna', 'nitrophilous'),
  e('Elymus repens', 'perz właściwy', 'nitrophilous'),
  e('Agropyron repens', 'perz właściwy (syn.)', 'nitrophilous'),
  e('Rumex alpinus', 'szczaw alpejski', 'nitrophilous'),
  e('Cirsium arvense', 'ostrożeń polny', 'nitrophilous'),
  e('Galium aparine', 'przytulia czepna', 'nitrophilous'),
  e('Aegopodium podagraria', 'podagrycznik pospolity', 'nitrophilous'),
  e('Chenopodium album', 'komosa biała', 'nitrophilous'),
  e('Chaerophyllum hirsutum', 'świerząbek orzęsiony', 'nitrophilous'),
  e('Galeopsis tetrahit', 'poziewnik szorstki', 'nitrophilous'),
  e('Galeopsis sp.', 'poziewnik', 'nitrophilous'),

  // --- gatunki obce (tab. 4 sprawozdania 2024 i sprawozdania wcześniejsze) ---
  e('Padus serotina', 'czeremcha amerykańska', 'alien', W),
  e('Prunus serotina', 'czeremcha amerykańska (syn.)', 'alien', W),
  e('Aronia melanocarpa', 'aronia czarna', 'alien', W),
  e('Quercus rubra', 'dąb czerwony', 'alien', W),
  e('Robinia pseudacacia', 'robinia akacjowa', 'alien', W),
  e('Sarothamnus scoparius', 'żarnowiec miotlasty', 'alien', W),
  e('Cytisus scoparius', 'żarnowiec miotlasty (syn.)', 'alien', W),
  e('Pyrus communis', 'grusza pospolita', 'alien', { ...W, ...WEAK }),
  e('Malus domestica', 'jabłoń domowa', 'alien', { ...W, ...WEAK }),
  e('Prunus domestica', 'śliwa domowa', 'alien', { ...W, ...WEAK }),
  e('Prunus cerasifera', 'śliwa wiśniowa', 'alien', W),
  e('Lupinus polyphyllus', 'łubin trwały', 'alien'),
  e('Solidago gigantea', 'nawłoć późna', 'alien'),
  e('Solidago canadensis', 'nawłoć kanadyjska', 'alien'),
  e('Rudbeckia laciniata', 'rudbekia naga', 'alien'),
  e('Digitalis purpurea', 'naparstnica purpurowa', 'alien'),
  e('Conyza canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Erigeron canadensis', 'przymiotno kanadyjskie (syn.)', 'alien'),
  e('Erigeron annuus', 'przymiotno białe', 'alien'),
  e('Erechtites hieraciifolia', 'erechtites jastrzębcowaty', 'alien'),
  e('Juncus tenuis', 'sit chudy', 'alien'),
  e('Epilobium adenocaulon', 'wierzbownica gruczołowata', 'alien'),
  e('Epilobium ciliatum', 'wierzbownica gruczołowata (syn.)', 'alien'),
  e('Lolium multiflorum', 'życica wielokwiatowa', 'alien'),
  e('Campylopus introflexus', 'krzywoszczeć przywłoka', 'alien', D),
  e('Echinochloa crus-galli', 'chwastnica jednostronna', 'alien', WEAK),
  e('Scleranthus annuus', 'czerwiec roczny', 'alien', WEAK),
  e('Viola arvensis', 'fiołek polny', 'alien', WEAK),
  e('Myosotis arvensis', 'niezapominajka polna', 'alien', WEAK),
  e('Capsella bursa-pastoris', 'tasznik pospolity', 'alien', WEAK),
  e('Setaria pumila', 'włośnica sina', 'alien', WEAK),
  e('Setaria viridis', 'włośnica zielona', 'alien', WEAK),
  e('Vicia tetrasperma', 'wyka czteronasienna', 'alien', WEAK),
  e('Malva moschata', 'ślaz piżmowy', 'alien', WEAK),

  // --- rodzime drzewa i krzewy (sprawozdania 2013–2024) ---
  e('Betula pendula', 'brzoza brodawkowata', 'woody', W),
  e('Betula pubescens', 'brzoza omszona', 'woody', W),
  e('Picea abies', 'świerk pospolity', 'woody', W),
  e('Pinus sylvestris', 'sosna zwyczajna', 'woody', W),
  e('Pinus mugo', 'kosodrzewina', 'woody', W),
  e('Juniperus communis', 'jałowiec pospolity', 'woody', { ...W, slow: true }),
  e('Salix caprea', 'wierzba iwa', 'woody', W),
  e('Salix aurita', 'wierzba uszata', 'woody', W),
  e('Salix cinerea', 'wierzba szara', 'woody', W),
  e('Salix sp.', 'wierzba', 'woody', W),
  e('Sorbus aucuparia', 'jarząb pospolity', 'woody', W),
  e('Populus tremula', 'topola osika', 'woody', W),
  e('Frangula alnus', 'kruszyna pospolita', 'woody', W),
  e('Padus avium', 'czeremcha zwyczajna', 'woody', W),
  e('Fagus sylvatica', 'buk zwyczajny', 'woody', W),
  e('Acer pseudoplatanus', 'klon jawor', 'woody', W),
  e('Prunus spinosa', 'tarnina', 'woody', W),
  e('Crataegus sp.', 'głóg', 'woody', W),
  e('Rosa sp.', 'róża', 'woody', W),
  e('Rhamnus cathartica', 'szakłak pospolity', 'woody', W),
  e('Quercus robur', 'dąb szypułkowy', 'woody', W),
  e('Alnus incana', 'olsza szara', 'woody', W),

  // --- pozostałe gatunki ze zdjęć karty przykładowej (Piorunowiec) i częste w psiarach ---
  e('Anthoxanthum odoratum', 'tomka wonna', 'companion'),
  e('Rumex acetosella', 'szczaw polny', 'companion'),
  e('Rumex acetosa', 'szczaw zwyczajny', 'companion'),
  e('Chamaenerion angustifolium', 'wierzbówka kiprzyca', 'companion'),
  e('Epilobium angustifolium', 'wierzbówka kiprzyca (syn.)', 'companion'),
  e('Festuca ovina', 'kostrzewa owcza', 'companion'),
  e('Briza media', 'drżączka średnia', 'companion'),
  e('Pleurozium schreberi', 'rokietnik pospolity', 'companion', D),
  e('Polytrichum formosum', 'płonnik strojny', 'companion', D),
  e('Polytrichum commune', 'płonnik pospolity', 'companion', D),
  e('Hylocomium splendens', 'gajnik lśniący', 'companion', D),
]

const BY_NAME = new Map(SPECIES_6230.map((s) => [normalizeName(s.latin), s]))

export const findSpecies6230 = (name: string): SpeciesEntry6230 | undefined => BY_NAME.get(normalizeName(name))

/** Klucz do liczenia gatunków: synonimy (Hypochoeris/Hypochaeris, Carex rigida…) dają jeden klucz. */
export const speciesKey6230 = (name: string) => (findSpecies6230(name)?.polish ?? normalizeName(name)).replace(/ \(syn\.\)$/, '')

const groupOf = (name: string) => findSpecies6230(name)?.group

/**
 * Gatunek charakterystyczny. Dziurawiec czteroboczny – tylko w psiarze krzyżownicowej Polygalo-Nardetum (przewodnik:
 * f. glabrum); w innych zespołach wskazuje na brak użytkowania i sukcesję (sprawozdanie 2024, Podcibórz).
 */
export const isCharacteristic6230 = (name: string, polygaloNardetum = false) =>
  groupOf(name) === 'characteristic' || (polygaloNardetum && speciesKey6230(name) === 'dziurawiec czteroboczny')
export const isAlien6230 = (name: string) => groupOf(name) === 'alien'
export const isWeakAlien6230 = (name: string) => Boolean(findSpecies6230(name)?.weak)
export const isWoody6230 = (name: string) => Boolean(findSpecies6230(name)?.woody)
/** Drzewa i krzewy o mniejszym zagrożeniu dla muraw (jałowiec) – łagodniejsze progi tab. 2. */
export const isSlowWoody6230 = (name: string) => Boolean(findSpecies6230(name)?.slow)
export const isNitrophilous6230 = (name: string) => groupOf(name) === 'nitrophilous' || Boolean(findSpecies6230(name)?.nitro)
export const isExpansive6230 = (name: string) => groupOf(name) === 'expansive'

export const defaultLayer6230 = (s: SpeciesEntry6230): Layer => (s.woody ? 'B' : s.cryptogam ? 'D' : 'C')
