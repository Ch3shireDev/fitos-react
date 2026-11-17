// Słownik gatunków dla 6520 (górskie łąki konietlicowe i mietlicowe użytkowane ekstensywnie, Polygono-Trisetion
// i Arrhenatherion), zebrany z przewodnika GIOŚ (Korzeniak 2012: pkt 4 „Typowe gatunki roślin” i tab. 1), z przykładowej
// karty (Lasówka, Dzika Orlica, 2009) i ze sprawozdań z monitoringu 2009–2011, 2016–2018 i 2024–2025 (gatunki
// charakterystyczne notowane najczęściej, rodzime ekspansywne, gatunki obce z tab. 4 sprawozdania 2025).
// Drzewa i krzewy – warstwa B, runo – C, mchy – D.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup6520 =
  | 'characteristic' // gatunki charakterystyczne i diagnostyczne łąk górskich
  | 'expansive' // rodzime gatunki ekspansywne roślin zielnych
  | 'alien' // gatunki obcego pochodzenia
  | 'companion' // pozostałe gatunki (zdjęcia z karty przykładowej, drzewa i krzewy)

/** Region, w którym gatunek liczy się jako charakterystyczny („lokalnie reprezentatywny”, pkt 4 przewodnika). */
export type Region6520 = 'sudety' | 'karpaty' | 'pieniny' | 'tatry'

export interface SpeciesEntry6520 {
  latin: string
  polish?: string
  group: SpeciesGroup6520
  /**
   * Skąd gatunek charakterystyczny: 'tab1' – lista w tab. 1 przewodnika (gatunki rzędu Arrhenatheretalia, klasy
   * Molinio-Arrhenatheretea i z Interpretation Manual); 'arrh' – charakterystyczne dla związku Arrhenatherion
   * (bez taksonów niżowego Arrhenatheretum elatioris); 'sudety' / 'karpaty' / 'pieniny' / 'tatry' – „Typowe gatunki
   * roślin” (pkt 4) dla danego obszaru; 'report' – dopisane w sprawozdaniach.
   * Ekspansywnego: 'tab1' – wymieniony w tab. 1; 'card' – w karcie przykładowej; 'report' – w sprawozdaniach.
   */
  source?: 'tab1' | 'arrh' | 'sudety' | 'karpaty' | 'pieniny' | 'tatry' | 'card' | 'report'
  /** Liczy się jako charakterystyczny tylko w tym regionie (kostrzewa czerwona w Sudetach, gatunki łąki pienińskiej, tatrzańskiej). */
  region?: Region6520
  /** Gatunek ekspansywny wymieniony w tab. 1 – „silnie ekspansywny” w sensie tab. 2. */
  strong?: boolean
  /** Status sporny (dziurawiec czteroboczny: ekspansywny w sprawozdaniach, diagnostyczny Polygono-Trisetion u botaników czeskich). */
  disputed?: boolean
  /** Gatunek obcy o wysokim stopniu inwazyjności – „na obniżenie oceny wpływa już sama obecność”. */
  high?: boolean
  /** Takson niżowego Arrhenatheretum elatioris – przewodnik wyłącza go z gatunków charakterystycznych 6520. */
  lowland?: boolean
  woody?: boolean
  /** Mech – warstwa D. */
  cryptogam?: boolean
}

export const GROUP_LABELS_6520: Record<SpeciesGroup6520, string> = {
  characteristic: 'gatunek charakterystyczny 6520',
  expansive: 'rodzimy gatunek ekspansywny',
  alien: 'gatunek obcy',
  companion: 'gatunek towarzyszący',
}

export const REGION_LABELS_6520: Record<Region6520, string> = {
  sudety: 'Sudety',
  karpaty: 'Karpaty',
  pieniny: 'Pieniny i Pieniński Pas Skałkowy (Anthyllidi-Trifolietum montani)',
  tatry: 'Tatry i Podtatrze (Phyteumo-Trifolietum pratensis)',
}

const e = (latin: string, polish: string, group: SpeciesGroup6520, extra: Partial<SpeciesEntry6520> = {}): SpeciesEntry6520 => ({ latin, polish, group, ...extra })
const ch = (source: SpeciesEntry6520['source']) => (latin: string, polish: string, extra: Partial<SpeciesEntry6520> = {}) =>
  e(latin, polish, 'characteristic', { source, ...extra })
const t1 = ch('tab1')
const ar = ch('arrh')
const su = ch('sudety')
const ka = ch('karpaty')
const pi = (latin: string, polish: string) => e(latin, polish, 'characteristic', { source: 'pieniny', region: 'pieniny' })
const ta = (latin: string, polish: string) => e(latin, polish, 'characteristic', { source: 'tatry', region: 'tatry' })
const rp = ch('report')
const xs = (latin: string, polish: string, extra: Partial<SpeciesEntry6520> = {}) => e(latin, polish, 'expansive', { source: 'tab1', strong: true, ...extra })
const xm = (source: 'card' | 'report') => (latin: string, polish: string, extra: Partial<SpeciesEntry6520> = {}) => e(latin, polish, 'expansive', { source, ...extra })
const xc = xm('card')
const xr = xm('report')
const al = (latin: string, polish: string, extra: Partial<SpeciesEntry6520> = {}) => e(latin, polish, 'alien', extra)
const ah = (latin: string, polish: string, extra: Partial<SpeciesEntry6520> = {}) => al(latin, polish, { high: true, ...extra })
const co = (latin: string, polish: string, extra: Partial<SpeciesEntry6520> = {}) => e(latin, polish, 'companion', extra)
const W = { woody: true }
const D = { cryptogam: true }

export const SPECIES_6520: SpeciesEntry6520[] = [
  // tab. 1 – gatunki charakterystyczne rzędu Arrhenatheretalia, klasy Molinio-Arrhenatheretea i z Interpretation Manual
  t1('Trisetum flavescens', 'konietlica łąkowa'),
  t1('Heracleum sphondylium', 'barszcz zwyczajny'),
  t1('Astrantia major', 'jarzmianka większa'),
  t1('Carum carvi', 'kminek zwyczajny'),
  t1('Crepis mollis', 'pępawa miękka'),
  t1('Polygonum bistorta', 'rdest wężownik'),
  t1('Bistorta officinalis', 'rdest wężownik (syn.)'),
  t1('Bistorta major', 'rdest wężownik (syn.)'),
  t1('Silene vulgaris', 'lepnica rozdęta'),
  t1('Campanula glomerata', 'dzwonek skupiony'),
  t1('Salvia pratensis', 'szałwia łąkowa'),
  t1('Anthoxanthum odoratum', 'tomka wonna'),
  t1('Melandrium rubrum', 'bniec czerwony'),
  t1('Silene dioica', 'bniec czerwony (syn.)'),
  t1('Geranium phaeum', 'bodziszek żałobny'),
  t1('Geranium sylvaticum', 'bodziszek leśny'),
  t1('Trollius europaeus', 'pełnik europejski'),
  t1('Pimpinella major', 'biedrzeniec wielki'),
  t1('Lilium bulbiferum', 'lilia bulwkowata'),
  t1('Viola saxatilis', 'fiołek trwały'),
  t1('Viola tricolor subsp. saxatilis', 'fiołek trwały (syn.)'),
  t1('Phyteuma orbiculare', 'zerwa kulista'),
  t1('Primula elatior', 'pierwiosnek wyniosły'),
  t1('Chaerophyllum hirsutum', 'świerząbek orzęsiony'),
  t1('Alchemilla spp.', 'przywrotniki'),
  t1('Alchemilla sp.', 'przywrotniki (syn.)'),
  // związek Arrhenatherion – bez taksonów niżowego Arrhenatheretum elatioris (przewodnik pkt 4, tab. 1)
  ar('Campanula patula', 'dzwonek rozpierzchły'),
  ar('Crepis biennis', 'pępawa dwuletnia'),
  ar('Galium mollugo', 'przytulia pospolita'),
  ar('Knautia arvensis', 'świerzbnica polna'),
  ar('Tragopogon orientalis', 'kozibród wschodni'),
  ar('Tragopogon pratensis', 'kozibród łąkowy'),
  // pkt 4 – diagnostyczne dla sudeckich łąk górskich (pozostałe z tej listy są już wyżej)
  su('Meum athamanticum', 'wszewłoga górska'),
  su('Festuca rubra', 'kostrzewa czerwona', { region: 'sudety' }),
  su('Crepis succisifolia', 'pępawa czarcikęsolistna'),
  su('Phyteuma spicatum', 'zerwa kłosowa'),
  su('Cardaminopsis halleri', 'rzeżusznik Hallera'),
  su('Arabidopsis halleri', 'rzeżusznik Hallera (syn.)'),
  su('Potentilla aurea', 'pięciornik złoty'),
  su('Poa chaixii', 'wiechlina Chaixa'),
  // pkt 4 – Karpaty: Gladiolo-Agrostietum i bogate florystycznie łąki mietlicowe
  ka('Alchemilla gracilis', 'przywrotnik połyskujący'),
  ka('Alchemilla monticola', 'przywrotnik pasterski'),
  ka('Alchemilla crinita', 'przywrotnik płytkoklapowy'),
  ka('Alchemilla walasii', 'przywrotnik Walasa'),
  ka('Centaurea oxylepis', 'chaber ostrołuskowy'),
  ka('Crocus scepusiensis', 'szafran spiski'),
  ka('Campanula serrata', 'dzwonek piłkowany'),
  ka('Gladiolus imbricatus', 'mieczyk dachówkowaty'),
  // pkt 4 – ciepłolubna łąka pienińska Anthyllidi-Trifolietum montani (liczą się tylko w Pieninach)
  pi('Anthyllis vulneraria', 'przelot pospolity'),
  pi('Trifolium montanum', 'koniczyna pagórkowa'),
  pi('Medicago falcata', 'lucerna sierpowata'),
  pi('Polygala comosa', 'krzyżownica czubata'),
  pi('Salvia verticillata', 'szałwia okręgowa'),
  pi('Thymus pulegioides', 'macierzanka zwyczajna'),
  pi('Ranunculus polyanthemos', 'jaskier wielokwiatowy'),
  // pkt 4 – tatrzańskie Phyteumo-Trifolietum i nawapienne murawy wysokogórskie (liczą się tylko w Tatrach)
  ta('Trifolium pratense', 'koniczyna łąkowa'),
  ta('Plantago media', 'babka średnia'),
  ta('Polygala brachyptera', 'krzyżownica górska'),
  ta('Ranunculus oreophilus', 'jaskier skalny'),
  ta('Thymus pulcherrimus', 'macierzanka nadobna'),
  ta('Pedicularis verticillata', 'gnidosz okółkowy'),
  // sprawozdania – notowane jako charakterystyczne
  rp('Cirsium heterophyllum', 'ostrożeń dwubarwny'),
  rp('Cirsium helenioides', 'ostrożeń dwubarwny (syn.)'),
  rp('Centaurea pseudophrygia', 'chaber perukowy'),
  e('Senecio subalpinus', 'starzec górski', 'characteristic', { source: 'report', region: 'tatry' }),
  e('Alchemilla glabra', 'przywrotnik prawie nagi', 'characteristic', { source: 'report', region: 'tatry' }),
  e('Alchemilla acutiloba', 'przywrotnik ostroklapowy', 'characteristic', { source: 'report', region: 'tatry' }),

  // tab. 1 – gatunki ekspansywne (silnie ekspansywne w sensie tab. 2)
  xs('Deschampsia caespitosa', 'śmiałek darniowy'),
  xs('Elymus repens', 'perz właściwy'),
  xs('Agropyron repens', 'perz właściwy (syn.)'),
  xs('Elytrigia repens', 'perz właściwy (syn.)'),
  xs('Chaerophyllum aromaticum', 'świerząbek korzenny'),
  xs('Senecio ovatus', 'starzec jajowaty'),
  xs('Senecio fuchsii', 'starzec Fuchsa (syn.)'),
  xs('Aegopodium podagraria', 'podagrycznik pospolity'),
  xs('Rubus sp.', 'jeżyna', W),
  xs('Rubus plicatus', 'jeżyna fałdowana', W),
  xs('Rubus idaeus', 'malina właściwa', W),
  xs('Chamaenerion angustifolium', 'wierzbówka kiprzyca'),
  xs('Epilobium angustifolium', 'wierzbówka kiprzyca (syn.)'),
  xs('Pteridium aquilinum', 'orlica pospolita'),
  xs('Vaccinium myrtillus', 'borówka czarna'),
  xs('Urtica dioica', 'pokrzywa zwyczajna'),
  xs('Cirsium arvense', 'ostrożeń polny'),
  // karta przykładowa i sprawozdania – pozostałe ekspansywne
  xr('Hypericum maculatum', 'dziurawiec czteroboczny', { disputed: true }),
  xr('Holcus mollis', 'kłosówka miękka'),
  xr('Anthriscus sylvestris', 'trybula leśna'),
  xr('Anthriscus nitida', 'trybula lśniąca'),
  xr('Calamagrostis epigejos', 'trzcinnik piaskowy'),
  xr('Tanacetum vulgare', 'wrotycz pospolity'),
  xr('Angelica sylvestris', 'dzięgiel leśny'),
  xr('Trifolium repens', 'koniczyna biała'),
  xc('Galeopsis tetrahit', 'poziewnik szorstki'),
  xc('Rumex crispus', 'szczaw kędzierzawy'),

  // gatunki obce – wysoki stopień inwazyjności (tab. 1, sprawozdania 2016–2025)
  ah('Reynoutria japonica', 'rdestowiec ostrokończysty'),
  ah('Reynoutria sachalinensis', 'rdestowiec sachaliński'),
  ah('Reynoutria ×bohemica', 'rdestowiec czeski'),
  ah('Impatiens glandulifera', 'niecierpek gruczołowaty'),
  ah('Solidago canadensis', 'nawłoć kanadyjska'),
  ah('Solidago gigantea', 'nawłoć późna'),
  ah('Heracleum sosnowskyi', 'barszcz Sosnowskiego'),
  ah('Heracleum mantegazzianum', 'barszcz Mantegazziego'),
  ah('Lupinus polyphyllus', 'łubin trwały'),
  ah('Rudbeckia laciniata', 'rudbekia naga'),
  ah('Bunias orientalis', 'rukiewnik wschodni'),
  ah('Erigeron annuus', 'przymiotno białe'),
  ah('Quercus rubra', 'dąb czerwony', W),
  ah('Padus serotina', 'czeremcha amerykańska', W),
  ah('Acer negundo', 'klon jesionolistny', W),
  // gatunki obce – niski stopień inwazyjności (tab. 4 sprawozdania 2025 i wcześniejsze)
  al('Juncus tenuis', 'sit chudy'),
  al('Epilobium ciliatum', 'wierzbownica gruczołowata'),
  al('Epilobium adenocaulon', 'wierzbownica gruczołowata (syn.)'),
  al('Veronica filiformis', 'przetacznik nitkowaty'),
  al('Oxalis stricta', 'szczawik żółty'),
  al('Oxalis fontana', 'szczawik żółty (syn.)'),
  al('Cuscuta epithymum', 'kanianka macierzankowa'),
  al('Myrrhis odorata', 'marchewnik anyżowy'),
  al('Sedum spurium', 'rozchodnik kaukaski'),
  al('Digitalis purpurea', 'naparstnica purpurowa'),
  al('Armoracia rusticana', 'chrzan pospolity'),
  al('Lolium multiflorum', 'życica wielokwiatowa'),
  al('Rumex longifolius', 'szczaw domowy'),
  al('Inula helenium', 'oman wielki'),
  al('Spiraea ×pseudosalicifolia', 'tawuła nibywierzbolistna', W),
  al('Lactuca serriola', 'sałata kompasowa'),
  al('Sonchus oleraceus', 'mlecz zwyczajny'),
  al('Myosotis arvensis', 'niezapominajka polna'),
  al('Spergula arvensis', 'sporek polny'),
  al('Chenopodium bonus-henricus', 'komosa strzałkowata'),
  al('Impatiens parviflora', 'niecierpek drobnokwiatowy'),

  // taksony niżowego Arrhenatheretum elatioris – przewodnik wyłącza je z gatunków charakterystycznych 6520
  co('Arrhenatherum elatius', 'rajgras wyniosły', { lowland: true }),
  co('Geranium pratense', 'bodziszek łąkowy', { lowland: true }),
  co('Pastinaca sativa', 'pasternak zwyczajny', { lowland: true }),
  co('Rumex thyrsiflorus', 'szczaw rozpierzchły', { lowland: true }),
  // trawy i zioła łąkowe – typowe, ale spoza list gatunków charakterystycznych
  co('Agrostis capillaris', 'mietlica pospolita'),
  co('Dactylis glomerata', 'kupkówka pospolita'),
  co('Phleum pratense', 'tymotka łąkowa'),
  co('Festuca pratensis', 'kostrzewa łąkowa'),
  co('Deschampsia flexuosa', 'śmiałek pogięty'),
  co('Holcus lanatus', 'kłosówka wełnista'),
  co('Poa pratensis', 'wiechlina łąkowa'),
  co('Alopecurus pratensis', 'wyczyniec łąkowy'),
  co('Nardus stricta', 'bliźniczka psia trawka'),
  co('Avenula pubescens', 'owsica omszona'),
  co('Briza media', 'drżączka średnia'),
  co('Luzula multiflora', 'kosmatka wielokwiatowa'),
  co('Carex spicata', 'turzyca ściśniona'),
  co('Carex pallescens', 'turzyca blada'),
  co('Achillea millefolium', 'krwawnik pospolity'),
  co('Campanula rotundifolia', 'dzwonek okrągłolistny'),
  co('Centaurea jacea', 'chaber łąkowy'),
  co('Cirsium palustre', 'ostrożeń błotny'),
  co('Euphrasia stricta', 'świetlik sztywny'),
  co('Hieracium pilosella', 'jastrzębiec kosmaczek'),
  co('Hieracium sulphureum', 'jastrzębiec siarkowy'),
  co('Lathyrus pratensis', 'groszek łąkowy'),
  co('Leontodon autumnalis', 'brodawnik jesienny'),
  co('Leontodon hispidus', 'brodawnik zwyczajny'),
  co('Leucanthemum vulgare', 'jastrun właściwy'),
  co('Lotus corniculatus', 'komonica zwyczajna'),
  co('Lychnis flos-cuculi', 'firletka poszarpana'),
  co('Plantago lanceolata', 'babka lancetowata'),
  co('Polygala vulgaris', 'krzyżownica zwyczajna'),
  co('Potentilla erecta', 'pięciornik kurze ziele'),
  co('Prunella vulgaris', 'głowienka pospolita'),
  co('Ranunculus acris', 'jaskier ostry'),
  co('Rhinanthus minor', 'szelężnik mniejszy'),
  co('Rumex acetosa', 'szczaw zwyczajny'),
  co('Sanguisorba officinalis', 'krwiściąg lekarski'),
  co('Solidago virgaurea', 'nawłoć pospolita'),
  co('Stellaria graminea', 'gwiazdnica trawiasta'),
  co('Taraxacum officinale', 'mniszek pospolity'),
  co('Veronica chamaedrys', 'przetacznik ożankowy'),
  co('Vicia cracca', 'wyka ptasia'),
  co('Vicia sepium', 'wyka płotowa'),
  // mchy
  co('Rhytidiadelphus squarrosus', 'fałdownik nastroszony', D),
  co('Brachythecium sp.', 'krótkosz', D),
  // drzewa i krzewy wkraczające na łąki (sprawozdania 2009–2025)
  co('Crataegus monogyna', 'głóg jednoszyjkowy', W),
  co('Crataegus sp.', 'głóg', W),
  co('Prunus spinosa', 'śliwa tarnina', W),
  co('Sorbus aucuparia', 'jarząb pospolity', W),
  co('Acer pseudoplatanus', 'klon jawor', W),
  co('Betula pendula', 'brzoza brodawkowata', W),
  co('Picea abies', 'świerk pospolity', W),
  co('Salix caprea', 'wierzba iwa', W),
  co('Salix aurita', 'wierzba uszata', W),
  co('Salix sp.', 'wierzba', W),
  co('Rosa canina', 'róża dzika', W),
  co('Rosa sp.', 'róża', W),
  co('Populus tremula', 'topola osika', W),
  co('Frangula alnus', 'kruszyna pospolita', W),
  co('Juniperus communis', 'jałowiec pospolity', W),
  co('Fraxinus excelsior', 'jesion wyniosły', W),
  co('Corylus avellana', 'leszczyna pospolita', W),
  co('Alnus glutinosa', 'olsza czarna', W),
]

const BY_NAME = new Map(SPECIES_6520.map((s) => [normalizeName(s.latin), s]))

export const findSpecies6520 = (name: string): SpeciesEntry6520 | undefined => BY_NAME.get(normalizeName(name))

/** Klucz do liczenia gatunków: synonimy (Melandrium rubrum/Silene dioica, Senecio ovatus/fuchsii…) dają jeden klucz. */
export const speciesKey6520 = (name: string) => (findSpecies6520(name)?.polish ?? normalizeName(name)).replace(/ \(syn\.\)$/, '').replace(/^starzec Fuchsa$/, 'starzec jajowaty')

const groupOf = (name: string) => findSpecies6520(name)?.group
/** Charakterystyczny w danym regionie (gatunki „lokalnie reprezentatywne” liczą się tylko w swoim regionie). */
export const isCharacteristic6520 = (name: string, region?: string) => {
  const s = findSpecies6520(name)
  return s?.group === 'characteristic' && (!s.region || s.region === region)
}
export const isExpansive6520 = (name: string) => groupOf(name) === 'expansive'
export const isStrongExpansive6520 = (name: string) => Boolean(findSpecies6520(name)?.strong)
export const isAlien6520 = (name: string) => groupOf(name) === 'alien'
export const isHighAlien6520 = (name: string) => Boolean(findSpecies6520(name)?.high)
export const isWoody6520 = (name: string) => Boolean(findSpecies6520(name)?.woody)

export const defaultLayer6520 = (s: SpeciesEntry6520): Layer => (s.woody ? 'B' : s.cryptogam ? 'D' : 'C')
