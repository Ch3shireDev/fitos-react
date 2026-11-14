// Słownik gatunków dla 4070 (zarośla kosodrzewiny), zebrany z przewodnika GIOŚ (Mróz 2010, „Typowe gatunki roślin”,
// tab. 1 i 2), z przykładowej karty (Sokolica, Babia Góra, 2007) i ze sprawozdań z monitoringu 2006–2008, 2013–2014
// i 2021. Zarośla to warstwa B (kosodrzewina z jarzębem, jałowcem halnym, wierzbą śląską), nad nią czasem biogrupy
// świerka (A), pod nią runo borówkowo-paprociowe (C) i mszaki (D). Porosty epifityczne rosną na pędach kosodrzewiny –
// nie wchodzą do zdjęć, ale mają własny wskaźnik.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup4070 =
  | 'mugo' // kosodrzewina
  | 'typical' // pozostałe gatunki typowe z tab. 1 (wskaźnik „Gatunki typowe”)
  | 'shrub' // inne krzewy zarośli subalpejskich (przewodnik pkt 4), nie liczone do gatunków typowych z tab. 1
  | 'tree' // drzewa górnej granicy lasu (biogrupy świerkowe, limba)
  | 'herb' // runo: gatunki z pkt 4 przewodnika i z karty przykładowej
  | 'clearing' // gatunki zrębów i prześwietleń (sprawozdanie 2021: sygnał przekształceń)
  | 'moss' // mszaki
  | 'lichen' // pięć porostów epifitycznych ze wskaźnika „Bogactwo porostów”
  | 'otherLichen' // inne porosty (nie liczą się do wskaźnika)

export interface SpeciesEntry4070 {
  latin: string
  polish?: string
  group: SpeciesGroup4070
  /** Klucz gatunku do liczenia: synonimy i podgatunki zapisane różnie (np. Sorbus aucuparia subsp. glabrata / S. aucuparia) dają ten sam. */
  key?: string
  /** Domyślna warstwa w zdjęciu fitosocjologicznym. */
  layer?: Layer
}

export const GROUP_LABELS_4070: Record<SpeciesGroup4070, string> = {
  mugo: 'kosodrzewina – gatunek budujący siedlisko',
  typical: 'gatunek typowy 4070 (tab. 1)',
  shrub: 'krzew zarośli subalpejskich (spoza listy gatunków typowych tab. 1)',
  tree: 'drzewo górnej granicy lasu',
  herb: 'gatunek runa',
  clearing: 'gatunek zrębów i prześwietleń',
  moss: 'mszak',
  lichen: 'porost epifityczny ze wskaźnika „Bogactwo porostów”',
  otherLichen: 'porost (nie liczy się do wskaźnika)',
}

const e = (latin: string, polish: string, group: SpeciesGroup4070, extra: Partial<SpeciesEntry4070> = {}): SpeciesEntry4070 => ({ latin, polish, group, ...extra })
const B = { layer: 'B' as Layer }

export const SPECIES_4070: SpeciesEntry4070[] = [
  // kosodrzewina
  e('Pinus mugo', 'kosodrzewina', 'mugo', { ...B, key: 'kosodrzewina' }),
  e('Pinus mughus', 'kosodrzewina', 'mugo', { ...B, key: 'kosodrzewina' }),
  e('Pinus mugo subsp. mugo', 'kosodrzewina', 'mugo', { ...B, key: 'kosodrzewina' }),

  // gatunki typowe z tab. 1 – warstwa B
  e('Sorbus aucuparia subsp. glabrata', 'jarząb pospolity górski', 'typical', { ...B, key: 'jarząb' }),
  e('Sorbus aucuparia var. glabrata', 'jarząb pospolity górski', 'typical', { ...B, key: 'jarząb' }),
  e('Sorbus aucuparia', 'jarząb pospolity (jarzębina)', 'typical', { ...B, key: 'jarząb' }),
  e('Juniperus communis subsp. alpina', 'jałowiec halny', 'typical', { ...B, key: 'jałowiec halny' }),
  e('Juniperus communis subsp. nana', 'jałowiec halny', 'typical', { ...B, key: 'jałowiec halny' }),
  e('Juniperus sibirica', 'jałowiec halny', 'typical', { ...B, key: 'jałowiec halny' }),
  e('Ribes petraeum', 'porzeczka skalna', 'typical', B),
  // gatunki typowe z tab. 1 – warstwa C
  e('Vaccinium myrtillus', 'borówka czarna', 'typical'),
  e('Vaccinium vitis-idaea', 'borówka brusznica', 'typical'),
  e('Homogyne alpina', 'podbiałek alpejski', 'typical'),
  e('Deschampsia flexuosa', 'śmiałek pogięty', 'typical', { key: 'śmiałek pogięty' }),
  e('Avenella flexuosa', 'śmiałek pogięty', 'typical', { key: 'śmiałek pogięty' }),
  e('Athyrium distentifolium', 'wietlica alpejska', 'typical', { key: 'wietlica alpejska' }),
  e('Athyrium alpestre', 'wietlica alpejska', 'typical', { key: 'wietlica alpejska' }),

  // inne krzewy zarośli subalpejskich (pkt 4)
  e('Salix silesiaca', 'wierzba śląska', 'shrub', B),
  e('Betula pubescens subsp. carpatica', 'brzoza omszona karpacka', 'shrub', B),
  e('Rosa pendulina', 'róża alpejska', 'shrub', B),
  e('Salix lapponum', 'wierzba lapońska', 'shrub', B),

  // drzewa (biogrupy świerkowe, limba)
  e('Picea abies', 'świerk pospolity', 'tree', { layer: 'A' }),
  e('Pinus cembra', 'limba', 'tree', { layer: 'A' }),
  e('Larix decidua', 'modrzew europejski', 'tree', { layer: 'A' }),
  e('Abies alba', 'jodła pospolita', 'tree', { layer: 'A' }),

  // runo (pkt 4 przewodnika i karta przykładowa)
  e('Soldanella carpatica', 'urdzik karpacki', 'herb'),
  e('Leucanthemum waldsteinii', 'złocień okrągłolistny', 'herb'),
  e('Dryopteris expansa', 'nerecznica górska', 'herb'),
  e('Dryopteris dilatata', 'nerecznica szerokolistna', 'herb'),
  e('Luzula sylvatica', 'kosmatka olbrzymia', 'herb'),
  e('Luzula luzuloides', 'kosmatka gajowa', 'herb'),
  e('Oxalis acetosella', 'szczawik zajęczy', 'herb'),
  e('Calamagrostis villosa', 'trzcinnik owłosiony', 'herb'),
  e('Lycopodium annotinum', 'widłak jałowcowaty', 'herb'),
  e('Huperzia selago', 'wroniec widlasty', 'herb'),
  e('Gentiana asclepiadea', 'goryczka trojeściowa', 'herb'),
  e('Rumex sp.', 'szczaw', 'herb'),
  e('Rumex alpestris', 'szczaw górski', 'herb'),
  e('Nardus stricta', 'bliźniczka psia trawka', 'herb'),
  e('Veratrum lobelianum', 'ciemiężyca zielona', 'herb'),
  e('Adenostyles alliariae', 'miłosna górska', 'herb'),
  e('Senecio nemorensis', 'starzec gajowy', 'herb'),
  e('Solidago virgaurea', 'nawłoć pospolita', 'herb'),
  e('Trientalis europaea', 'siódmaczek leśny', 'herb'),
  e('Empetrum nigrum', 'bażyna czarna', 'herb'),
  e('Calluna vulgaris', 'wrzos zwyczajny', 'herb'),
  e('Melampyrum sylvaticum', 'pszeniec leśny', 'herb'),
  e('Blechnum spicant', 'podrzeń żebrowiec', 'herb'),
  e('Phegopteris connectilis', 'zachyłka oszczepowata', 'herb'),

  // gatunki zrębów i prześwietleń
  e('Rubus idaeus', 'malina właściwa', 'clearing'),
  e('Epilobium angustifolium', 'wierzbówka kiprzyca', 'clearing', { key: 'wierzbówka kiprzyca' }),
  e('Chamaenerion angustifolium', 'wierzbówka kiprzyca', 'clearing', { key: 'wierzbówka kiprzyca' }),
  e('Senecio ovatus', 'starzec Fuchsa', 'clearing'),

  // mszaki (pkt 4 i karta)
  e('Plagiothecium undulatum', 'płaszczeniec marszczony', 'moss', { layer: 'D' }),
  e('Plagiothecium curvifolium', 'płaszczeniec zgiętolistny', 'moss', { layer: 'D' }),
  e('Rhytidiadelphus triquetrus', 'fałdownik trzyrzędowy', 'moss', { layer: 'D' }),
  e('Ptilium crista-castrensis', 'piórosz grzebieniasty', 'moss', { layer: 'D' }),
  e('Pleurozium schreberi', 'rokietnik pospolity', 'moss', { layer: 'D' }),
  e('Hylocomium splendens', 'gajnik lśniący', 'moss', { layer: 'D' }),
  e('Dicranum scoparium', 'widłoząb miotlasty', 'moss', { layer: 'D' }),
  e('Barbilophozia lycopodioides', 'bagiennik widłakowy', 'moss', { layer: 'D' }),
  e('Barbilophozia hatcheri', 'bagiennik', 'moss', { layer: 'D' }),
  e('Anastrepta orcadensis', 'anastrepta', 'moss', { layer: 'D' }),
  e('Polytrichum commune', 'płonnik pospolity', 'moss', { layer: 'D' }),
  e('Polytrichum formosum', 'płonnik strojny', 'moss', { layer: 'D' }),
  e('Sphagnum girgensohnii', 'torfowiec Girgensohna', 'moss', { layer: 'D' }),

  // porosty epifityczne – wskaźnik „Bogactwo porostów epifitycznych” (tab. 2)
  e('Hypogymnia physodes', 'pustułka pęcherzykowata', 'lichen'),
  e('Parmeliopsis ambigua', 'płaskotka rozlana', 'lichen'),
  e('Parmeliopsis hyperopta', 'płaskotka reglowa', 'lichen'),
  e('Pseudevernia furfuracea', 'mąklik otrębiasty', 'lichen'),
  e('Vulpicida pinastri', 'złotlinka jaskrawa', 'lichen', { key: 'złotlinka jaskrawa' }),
  e('Cetraria pinastri', 'złotlinka jaskrawa', 'lichen', { key: 'złotlinka jaskrawa' }),
  // inne porosty
  e('Parmeliopsis sp.', 'płaskotka (nieoznaczona)', 'otherLichen'),
  e('Hypogymnia tubulosa', 'pustułka rurkowata', 'otherLichen'),
  e('Usnea sp.', 'brodaczka', 'otherLichen'),
  e('Bryoria sp.', 'włostka', 'otherLichen'),
  e('Platismatia glauca', 'płucnik modry', 'otherLichen'),
]

const BY_NAME = new Map(SPECIES_4070.map((s) => [normalizeName(s.latin), s]))

export const findSpecies4070 = (name: string): SpeciesEntry4070 | undefined => BY_NAME.get(normalizeName(name))

/** Klucz do liczenia: synonimy dają ten sam klucz (pole `key` albo polska nazwa). Spoza katalogu – nazwa znormalizowana. */
export const speciesKey4070 = (name: string) => {
  const s = findSpecies4070(name)
  return s ? (s.key ?? s.polish ?? normalizeName(s.latin)) : normalizeName(name)
}

export const isMugo = (name: string) => findSpecies4070(name)?.group === 'mugo'
/** Gatunek typowy z tab. 1 (łącznie z kosodrzewiną). */
export const isTypical4070 = (name: string) => {
  const g = findSpecies4070(name)?.group
  return g === 'mugo' || g === 'typical'
}
/** Gatunek, którego dominacja w warstwie C jest właściwa (tab. 2): borówka czarna albo śmiałek pogięty. */
export const isGoodDominantC = (name: string) => ['borówka czarna', 'śmiałek pogięty'].includes(speciesKey4070(name))
/** Jeden z pięciu porostów epifitycznych z tab. 2. */
export const isIndicatorLichen = (name: string) => findSpecies4070(name)?.group === 'lichen'
export const isLichen4070 = (name: string) => {
  const g = findSpecies4070(name)?.group
  return g === 'lichen' || g === 'otherLichen'
}

/** Domyślna warstwa: z katalogu, inaczej C. */
export const defaultLayer4070 = (s: SpeciesEntry4070): Layer => s.layer ?? 'C'
