// Słownik gatunków dla 7230 (górskie i nizinne torfowiska zasadowe o charakterze młak, turzycowisk i mechowisk),
// zebrany z przewodnika GIOŚ (Koczur 2012, pkt 4 „Typowe gatunki roślin”), z karty przykładowej (Za Stronią, 2009)
// i ze sprawozdań z monitoringu 2009–2011, 2016–2018 i 2024–2025 (gatunki charakterystyczne liczone przez ekspertów,
// rodzime gatunki ekspansywne, gatunki obce z tab. 10 sprawozdania 2017 i tab. 4 sprawozdania 2024, drzewa i krzewy
// zarastające młaki). Drzewa i krzewy – warstwa B, runo – C, mszaki – D.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup7230 =
  | 'characteristic' // gatunki charakterystyczne (pkt 4 przewodnika, uzupełnione o gatunki klasy Scheuchzerio-Caricetea)
  | 'expansive' // rodzime gatunki ekspansywne roślin zielnych
  | 'alien' // gatunki obce
  | 'woody' // rodzime drzewa i krzewy zarastające młaki
  | 'companion' // pozostałe gatunki (zdjęcia z karty przykładowej, gatunki łąkowe, młak kwaśnych, mchy)

export interface SpeciesEntry7230 {
  latin: string
  polish?: string
  group: SpeciesGroup7230
  /**
   * Skąd gatunek charakterystyczny: 'guide' – lista z pkt 4 przewodnika (rząd Caricetalia davallianae i związek Caricion
   * davallianae, gatunki klasy Scheuchzerio-Caricetea zasiedlające głównie siedliska alkaliczne, gatunki poszczególnych
   * zespołów); 'class' – inne gatunki klasy Scheuchzerio-Caricetea nigrae, które eksperci liczyli w sprawozdaniu 2024
   * (tab. 2 każe podać gatunki „dla danego zbiorowiska i wyższych jednostek: Caricetalia davallianae i Scheuchzerio-Caricetea”).
   */
  source?: 'guide' | 'class'
  /**
   * Gatunek o optimum na kwaśniejszych torfowiskach przejściowych (Caricion lasiocarpae) – sprawozdanie 2017 (Wetlina)
   * przestało go liczyć jako diagnostyczny, gdy dominował; sprawozdanie 2024 znowu liczy.
   */
  acidic?: boolean
  /** Duże turzyce z Magnocaricion – w 2024 r. w ekspansywnych, w 2017 r. turzyca sztywna wśród charakterystycznych dominantów. */
  magno?: boolean
  woody?: boolean
  /** Mszak – warstwa D. */
  cryptogam?: boolean
  /** Mech brunatny (Amblystegiaceae i pokrewne) – od jego udziału zależy wskaźnik mchów. */
  brown?: boolean
  /** Torfowiec (Sphagnum). */
  sphagnum?: boolean
}

export const GROUP_LABELS_7230: Record<SpeciesGroup7230, string> = {
  characteristic: 'gatunek charakterystyczny 7230',
  expansive: 'rodzimy gatunek ekspansywny',
  alien: 'gatunek obcy',
  woody: 'drzewo lub krzew',
  companion: 'gatunek towarzyszący',
}

const e = (latin: string, polish: string | undefined, group: SpeciesGroup7230, extra: Partial<SpeciesEntry7230> = {}): SpeciesEntry7230 => ({
  latin,
  ...(polish ? { polish } : {}),
  group,
  ...extra,
})
const ch = (latin: string, polish: string, extra: Partial<SpeciesEntry7230> = {}) => e(latin, polish, 'characteristic', { source: 'guide', ...extra })
const cl = (latin: string, polish: string, extra: Partial<SpeciesEntry7230> = {}) => e(latin, polish, 'characteristic', { source: 'class', ...extra })
const ex = (latin: string, polish: string, extra: Partial<SpeciesEntry7230> = {}) => e(latin, polish, 'expansive', extra)
const al = (latin: string, polish: string, extra: Partial<SpeciesEntry7230> = {}) => e(latin, polish, 'alien', extra)
const wd = (latin: string, polish: string) => e(latin, polish, 'woody', { woody: true })
const co = (latin: string, polish: string | undefined, extra: Partial<SpeciesEntry7230> = {}) => e(latin, polish, 'companion', extra)
const M = { cryptogam: true }
const BR = { cryptogam: true, brown: true }
const SPH = { cryptogam: true, sphagnum: true }
const W = { woody: true }

export const SPECIES_7230: SpeciesEntry7230[] = [
  // pkt 4 – rząd Caricetalia davallianae i związek Caricion davallianae
  ch('Bryum pseudotriquetrum', 'prątnik nabrzmiały', M),
  ch('Campylium stellatum', 'złocieniec gwiazdkowaty', BR),
  ch('Carex davalliana', 'turzyca Davalla'),
  ch('Carex dioica', 'turzyca dwupienna'),
  ch('Carex flava', 'turzyca żółta'),
  ch('Carex hostiana', 'turzyca Hosta'),
  ch('Carex lepidocarpa', 'turzyca łuszczkowata'),
  ch('Carex pulicaris', 'turzyca pchla'),
  ch('Eleocharis quinqueflora', 'ponikło skąpokwiatowe'),
  ch('Epipactis palustris', 'kruszczyk błotny'),
  ch('Eriophorum latifolium', 'wełnianka szerokolistna'),
  ch('Limprichtia cossonii', 'limprichtia pośrednia', BR),
  ch('Scorpidium cossonii', 'limprichtia pośrednia (syn.)', BR),
  ch('Drepanocladus cossonii', 'limprichtia pośrednia (syn.)', BR),
  ch('Liparis loeselii', 'lipiennik Loesela'),
  ch('Orchis palustris', 'storczyk błotny'),
  ch('Anacamptis palustris', 'storczyk błotny (syn.)'),
  ch('Parnassia palustris', 'dziewięciornik błotny'),
  ch('Pinguicula vulgaris', 'tłustosz pospolity'),
  ch('Primula farinosa', 'pierwiosnek omączony'),
  ch('Scorpidium scorpioides', 'skorpionowiec brunatnawy', BR),
  ch('Swertia perennis', 'niebielistka trwała'),
  ch('Tofieldia calyculata', 'kosatka kielichowa'),
  // pkt 4 – gatunki klasy Scheuchzerio-Caricetea nigrae zasiedlające głównie siedliska alkaliczne
  ch('Drepanocladus aduncus', 'sierpowiec zakrzywiony', BR),
  ch('Hamatocaulis vernicosus', 'haczykowiec błyszczący', BR),
  ch('Drepanocladus vernicosus', 'haczykowiec błyszczący (syn.)', BR),
  ch('Juncus alpino-articulatus', 'sit alpejski'),
  ch('Juncus alpinus', 'sit alpejski (syn.)'),
  ch('Pedicularis palustris', 'gnidosz błotny'),
  ch('Pedicularis sceptrum-carolinum', 'gnidosz królewski'),
  ch('Triglochin palustre', 'świbka błotna'),
  ch('Triglochin palustris', 'świbka błotna (syn.)'),
  ch('Warnstorfia exannulata', 'warnstorfia bezpierścieniowa', BR),
  ch('Warnstorfia fluitans', 'warnstorfia pływająca', BR),
  ch('Warnstorfia sarmentosa', 'warnstorfia sznurecznik', BR),
  // pkt 4 – gatunki charakterystyczne poszczególnych zespołów i zbiorowisk
  ch('Valeriana simplicifolia', 'kozłek całolistny'),
  ch('Schoenus ferrugineus', 'marzyca ruda'),
  ch('Schoenus nigricans', 'marzyca czarniawa'),
  ch('Carex panicea', 'turzyca prosowata'),
  ch('Ctenidium molluscum', 'grzebieniowiec piórkowaty', M),
  ch('Dactylorhiza incarnata', 'kukułka krwista'),
  ch('Dactylorhiza majalis', 'kukułka szerokolistna'),
  ch('Fissidens adianthoides', 'skrzydlik paprociowaty', M),
  ch('Helodium blandowii', 'błotniszek wełnisty', BR),
  ch('Paludella squarrosa', 'mszar krokiewkowaty', M),
  ch('Sphagnum teres', 'torfowiec obły', SPH),
  ch('Sphagnum warnstorfii', 'torfowiec Warnstorfa', SPH),
  ch('Tomentypnum nitens', 'błyszcze włoskowate', BR),
  ch('Tomenthypnum nitens', 'błyszcze włoskowate (syn.)', BR),
  // uzupełnienie – inne gatunki klasy Scheuchzerio-Caricetea nigrae, liczone przez ekspertów w 2024 r.
  cl('Carex diandra', 'turzyca obła'),
  cl('Carex lasiocarpa', 'turzyca nitkowata'),
  cl('Carex chordorrhiza', 'turzyca strunowa'),
  cl('Carex limosa', 'turzyca bagienna'),
  cl('Carex rostrata', 'turzyca dzióbkowata'),
  cl('Menyanthes trifoliata', 'bobrek trójlistkowy', { acidic: true }),
  cl('Drosera anglica', 'rosiczka długolistna'),
  cl('Utricularia minor', 'pływacz drobny'),
  cl('Cinclidium stygium', 'drabinowiec mroczny', M),
  cl('Calliergon giganteum', 'mokradłosz olbrzymi', BR),
  cl('Pseudocalliergon trifarium', 'bagiennik żmijowaty', BR),
  cl('Limprichtia revolvens', 'limprichtia długokończysta', BR),
  cl('Scorpidium revolvens', 'limprichtia długokończysta (syn.)', BR),

  // rodzime gatunki ekspansywne roślin zielnych (sprawozdania 2009–2024)
  ex('Phragmites australis', 'trzcina pospolita'),
  ex('Molinia caerulea', 'trzęślica modra'),
  ex('Eupatorium cannabinum', 'sadziec konopiasty'),
  ex('Lysimachia vulgaris', 'tojeść pospolita'),
  ex('Scirpus sylvaticus', 'sitowie leśne'),
  ex('Mentha longifolia', 'mięta długolistna'),
  ex('Filipendula ulmaria', 'wiązówka błotna'),
  ex('Cirsium arvense', 'ostrożeń polny'),
  ex('Hypericum maculatum', 'dziurawiec czteroboczny'),
  ex('Urtica dioica', 'pokrzywa zwyczajna'),
  ex('Phalaris arundinacea', 'mozga trzcinowata'),
  ex('Selinum carvifolia', 'olszewnik kminkolistny'),
  ex('Deschampsia caespitosa', 'śmiałek darniowy'),
  ex('Deschampsia cespitosa', 'śmiałek darniowy (syn.)'),
  ex('Holcus lanatus', 'kłosówka wełnista'),
  ex('Calamagrostis epigeios', 'trzcinnik piaskowy'),
  ex('Thelypteris palustris', 'zachylnik błotny'),
  ex('Carex elata', 'turzyca sztywna', { magno: true }),
  ex('Carex paniculata', 'turzyca prosowa', { magno: true }),
  ex('Carex acutiformis', 'turzyca błotna', { magno: true }),

  // gatunki obce (sprawozdanie 2017, tab. 10; sprawozdanie 2024, tab. 4)
  al('Padus serotina', 'czeremcha amerykańska', W),
  al('Prunus serotina', 'czeremcha amerykańska (syn.)', W),
  al('Quercus rubra', 'dąb czerwony', W),
  al('Mimulus guttatus', 'kroplik żółty'),
  al('Solidago canadensis', 'nawłoć kanadyjska'),
  al('Solidago gigantea', 'nawłoć późna'),
  al('Impatiens parviflora', 'niecierpek drobnokwiatowy'),
  al('Erigeron annuus', 'przymiotno białe'),
  al('Conyza canadensis', 'przymiotno kanadyjskie'),
  al('Erigeron canadensis', 'przymiotno kanadyjskie (syn.)'),
  al('Parthenocissus inserta', 'winobluszcz zaroślowy', W),
  al('Juncus tenuis', 'sit chudy'),
  al('Bidens frondosa', 'uczep amerykański'),
  al('Vicia dasycarpa', 'wyka pstra'),

  // drzewa i krzewy zarastające młaki (sprawozdania 2009–2024, karta przykładowa)
  wd('Picea abies', 'świerk pospolity'),
  wd('Pinus sylvestris', 'sosna zwyczajna'),
  wd('Betula pendula', 'brzoza brodawkowata'),
  wd('Betula pubescens', 'brzoza omszona'),
  wd('Alnus glutinosa', 'olsza czarna'),
  wd('Alnus incana', 'olsza szara'),
  wd('Acer pseudoplatanus', 'klon jawor'),
  wd('Corylus avellana', 'leszczyna pospolita'),
  wd('Fraxinus excelsior', 'jesion wyniosły'),
  wd('Frangula alnus', 'kruszyna pospolita'),
  wd('Viburnum opulus', 'kalina koralowa'),
  wd('Sorbus aucuparia', 'jarząb pospolity'),
  wd('Populus tremula', 'topola osika'),
  wd('Salix silesiaca', 'wierzba śląska'),
  wd('Salix aurita', 'wierzba uszata'),
  wd('Salix cinerea', 'wierzba szara'),
  wd('Salix rosmarinifolia', 'wierzba rokita'),
  wd('Salix pentandra', 'wierzba pięciopręcikowa'),

  // pozostałe: zdjęcia z karty przykładowej, gatunki łąkowe i młak kwaśnych, częste mchy
  co('Equisetum palustre', 'skrzyp błotny'),
  co('Carex nigra', 'turzyca pospolita', { acidic: true }),
  co('Agrostis canina', 'mietlica psia', { acidic: true }),
  co('Achillea millefolium', 'krwawnik pospolity'),
  co('Anthoxanthum odoratum', 'tomka wonna'),
  co('Agrostis capillaris', 'mietlica pospolita'),
  co('Blysmus compressus', 'nadbrzeżyca spłaszczona'),
  co('Briza media', 'drżączka średnia'),
  co('Calamagrostis varia', 'trzcinnik pstry'),
  co('Caltha palustris', 'knieć błotna'),
  co('Carex flacca', 'turzyca sina'),
  co('Centaurea jacea', 'chaber łąkowy'),
  co('Cirsium palustre', 'ostrożeń błotny'),
  co('Cirsium rivulare', 'ostrożeń łąkowy'),
  co('Colchicum autumnale', 'zimowit jesienny'),
  co('Crepis paludosa', 'pępawa błotna'),
  co('Cruciata glabra', 'krzyżownica naga'),
  co('Equisetum fluviatile', 'skrzyp bagienny'),
  co('Equisetum variegatum', 'skrzyp pstry'),
  co('Euphrasia', 'świetlik'),
  co('Festuca pratensis', 'kostrzewa łąkowa'),
  co('Festuca rubra', 'kostrzewa czerwona'),
  co('Galium mollugo', 'przytulia pospolita'),
  co('Gymnadenia conopsea', 'gółka długoostrogowa'),
  co('Juncus articulatus', 'sit członowaty'),
  co('Juncus inflexus', 'sit siny'),
  co('Knautia arvensis', 'świerzbnica polna'),
  co('Lathyrus pratensis', 'groszek łąkowy'),
  co('Leontodon hispidus', 'brodawnik zwyczajny'),
  co('Linum catharticum', 'len przeczyszczający'),
  co('Lychnis flos-cuculi', 'firletka poszarpana'),
  co('Lysimachia nummularia', 'tojeść rozesłana'),
  co('Mentha arvensis', 'mięta polna'),
  co('Ononis vulgaris', undefined),
  co('Plantago lanceolata', 'babka lancetowata'),
  co('Poa trivialis', 'wiechlina zwyczajna'),
  co('Polygala', 'krzyżownica'),
  co('Potentilla erecta', 'pięciornik kurze ziele'),
  co('Prunella vulgaris', 'głowienka pospolita'),
  co('Ranunculus acris', 'jaskier ostry'),
  co('Trifolium pratense', 'koniczyna łąkowa'),
  co('Tussilago farfara', 'podbiał pospolity'),
  co('Vicia cracca', 'wyka ptasia'),
  co('Calliergonella cuspidata', 'mokradłoszka zaostrzona', M),
  co('Climacium dendroides', 'drabik drzewkowaty', M),
  co('Cratoneuron filicinum', 'żebrowiec paprociowaty', M),
  co('Palustriella commutata', 'żebrowiec zmienny', M),
  co('Plagiomnium elatum', 'płaskomerzyk okazały', M),
  co('Philonotis calcarea', 'bagnik wapieniolubny', M),
  co('Straminergon stramineum', 'słomiaczek złotawy', { cryptogam: true, acidic: true }),
  co('Sphagnum capillifolium', 'torfowiec ostrolistny', SPH),
  co('Sphagnum fallax', 'torfowiec kończysty', SPH),
  co('Sphagnum palustre', 'torfowiec błotny', SPH),
  co('Sphagnum squarrosum', 'torfowiec nastroszony', SPH),
  co('Sphagnum magellanicum', 'torfowiec magellański', SPH),
  co('Sphagnum fimbriatum', 'torfowiec frędzlowaty', SPH),
]

const BY_NAME = new Map(SPECIES_7230.map((s) => [normalizeName(s.latin), s]))

export const findSpecies7230 = (name: string): SpeciesEntry7230 | undefined => BY_NAME.get(normalizeName(name))

/** Klucz do liczenia gatunków: synonimy (Limprichtia/Scorpidium cossonii, Juncus alpinus…) dają jeden klucz. */
export const speciesKey7230 = (name: string) => (findSpecies7230(name)?.polish ?? normalizeName(name)).replace(/ \(syn\.\)$/, '')

const groupOf = (name: string) => findSpecies7230(name)?.group
export const isCharacteristic7230 = (name: string) => groupOf(name) === 'characteristic'
export const isAcidic7230 = (name: string) => Boolean(findSpecies7230(name)?.acidic)
export const isMagno7230 = (name: string) => Boolean(findSpecies7230(name)?.magno)
export const isExpansive7230 = (name: string) => groupOf(name) === 'expansive'
export const isAlien7230 = (name: string) => groupOf(name) === 'alien'
/** Rodzime drzewo albo krzew (obce drzewa i krzewy liczą się w „Obcych gatunkach inwazyjnych”). */
export const isWoody7230 = (name: string) => groupOf(name) === 'woody'

export const defaultLayer7230 = (s: SpeciesEntry7230): Layer => (s.woody ? 'B' : s.cryptogam ? 'D' : 'C')
