// Słownik gatunków dla 1340 (śródlądowe słone łąki, pastwiska i szuwary), zebrany z przewodnika GIOŚ (Piernik 2010,
// rozdz. „Typowe gatunki roślin”, tab. 1 i przykładowa karta Owczary 2008) oraz ze sprawozdań z monitoringu 2016–2018 i 2024.
// Grupy jak w przewodniku (za Wilkoń-Michalską 1963): halofity obligatoryjne, halofity fakultatywne, gatunki towarzyszące
// (indyferentne, nitrofilne, stali towarzysze halofitów i inne glikofity) oraz gatunki obce. Wszystko w warstwie C,
// poza krzewami i drzewami (nasadzenia olszy).
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup1340 =
  | 'obligate' // halofity obligatoryjne – tylko na siedliskach słonych
  | 'facultative' // halofity fakultatywne – najlepiej na słonych, ale spotykane też poza nimi
  | 'otherHalophyte' // słonorośla spoza list przewodnika (ostrzew rudy, babka nadmorska) – nie liczą się do charakterystycznych
  | 'companion' // gatunki towarzyszące: indyferentne, nitrofilne i inne glikofity
  | 'woody' // krzewy i drzewa (nasadzenia olszy, podrost)
  | 'alien' // obce gatunki inwazyjne

export interface SpeciesEntry1340 {
  latin: string
  polish: string
  group: SpeciesGroup1340
  /** Rodzimy gatunek ekspansywny wkraczający na słone łąki (trzcina, perz, życica, trzcinnik). */
  expansive?: boolean
}

export const GROUP_LABELS_1340: Record<SpeciesGroup1340, string> = {
  obligate: 'halofit obligatoryjny',
  facultative: 'halofit fakultatywny',
  otherHalophyte: 'halofit spoza listy przewodnika',
  companion: 'gatunek towarzyszący (glikofit)',
  woody: 'krzew / drzewo',
  alien: 'gatunek obcy',
}

/** Halofit z listy przewodnika: obligatoryjny albo fakultatywny. Tylko one liczą się do gatunków charakterystycznych. */
export const isHalophyteGroup = (g: SpeciesGroup1340 | undefined) => g === 'obligate' || g === 'facultative'
/** Halofit w szerokim sensie (do gatunków dominujących): także słonorośla spoza list przewodnika. */
export const isAnyHalophyte = (g: SpeciesGroup1340 | undefined) => isHalophyteGroup(g) || g === 'otherHalophyte'

/** Trzcina pospolita – w podtypie 1340-3 (szuwar z sitowcem) jej udział >25% nie jest „niewłaściwy” (przewodnik, tab. 1). */
export const PHRAGMITES = 'Phragmites australis'

const e = (latin: string, polish: string, group: SpeciesGroup1340, expansive = false): SpeciesEntry1340 => ({ latin, polish, group, expansive })

export const SPECIES_1340: SpeciesEntry1340[] = [
  // halofity obligatoryjne (przewodnik, tab. 1)
  e('Salicornia europaea', 'soliród zielny', 'obligate'),
  e('Spergularia salina', 'muchotrzew solniskowy', 'obligate'),
  e('Spergularia marina', 'muchotrzew solniskowy', 'obligate'),
  e('Aster tripolium', 'aster solny', 'obligate'),
  e('Tripolium pannonicum', 'aster solny', 'obligate'),
  e('Juncus gerardi', 'sit Gerarda', 'obligate'),
  e('Glaux maritima', 'mlecznik nadmorski', 'obligate'),
  e('Lysimachia maritima', 'mlecznik nadmorski', 'obligate'),
  e('Triglochin maritimum', 'świbka morska', 'obligate'),
  e('Triglochin maritima', 'świbka morska', 'obligate'),
  e('Atriplex prostrata subsp. prostrata var. salina', 'łoboda oszczepowata odm. solniskowa', 'obligate'),
  e('Atriplex prostrata', 'łoboda oszczepowata (odm. solniskowa)', 'obligate'),
  // halofity fakultatywne (przewodnik, tab. 1)
  e('Puccinellia distans', 'mannica odstająca', 'facultative'),
  e('Lotus tenuis', 'komonica wąskolistna', 'facultative'),
  e('Lotus glaber', 'komonica wąskolistna', 'facultative'),
  e('Melilotus dentatus', 'nostrzyk ząbkowany', 'facultative'),
  e('Melilotus dentata', 'nostrzyk ząbkowany', 'facultative'),
  e('Tetragonolobus maritimus', 'komonica skrzydlatostrąkowa', 'facultative'),
  e('Tetragonolobus maritimus subsp. siliquosus', 'komonica skrzydlatostrąkowa', 'facultative'),
  e('Lotus maritimus', 'komonica skrzydlatostrąkowa', 'facultative'),
  e('Althaea officinalis', 'prawoślaz lekarski', 'facultative'),
  e('Trifolium fragiferum', 'koniczyna rozdęta', 'facultative'),
  e('Schoenoplectus tabernaemontani', 'oczeret Tabernemontana', 'facultative'),
  e('Bolboschoenus maritimus', 'sitowiec nadmorski', 'facultative'),
  e('Scirpus maritimus', 'sitowiec nadmorski', 'facultative'),
  e('Carex distans', 'turzyca odległokłosa', 'facultative'),
  e('Centaurium pulchellum', 'centuria nadobna', 'facultative'),
  e('Festuca arundinacea', 'kostrzewa trzcinowata', 'facultative'),
  e('Juncus ranarius', 'sit żabi', 'facultative'),
  e('Leontodon taraxacoides', 'brodawnik różnoowockowy', 'facultative'),
  e('Leontodon saxatilis', 'brodawnik różnoowockowy', 'facultative'),
  // słonorośla spoza list przewodnika (podtyp 1340-5 z ostrzewem rudym, sprawozdania)
  e('Blysmus rufus', 'ostrzew rudy', 'otherHalophyte'),
  e('Plantago maritima', 'babka nadmorska', 'otherHalophyte'),
  // gatunki indyferentne (dobrze znoszące zasolenie)
  e('Myosurus minimus', 'mysiurek drobny', 'companion'),
  e('Carex cuprina', 'turzyca nibylisia', 'companion'),
  e('Odontites serotina', 'zagorzałek późny', 'companion'),
  e('Inula britannica', 'oman łąkowy', 'companion'),
  e('Agrostis stolonifera', 'mietlica rozłogowa', 'companion'),
  e('Blysmus compressus', 'ostrzew spłaszczony', 'companion'),
  // gatunki nitrofilne
  e('Potentilla anserina', 'pięciornik gęsi', 'companion'),
  e('Plantago major', 'babka zwyczajna', 'companion'),
  e('Plantago intermedia', 'babka wielonasienna', 'companion'),
  e('Lepidium ruderale', 'pieprzyca gruzowa', 'companion'),
  e('Plantago media', 'babka średnia', 'companion'),
  e('Plantago lanceolata', 'babka lancetowata', 'companion'),
  e('Chenopodium glaucum', 'komosa sina', 'companion'),
  e('Chenopodium rubrum', 'komosa czerwona', 'companion'),
  e('Atriplex oblongifolia', 'łoboda długolistna', 'companion'),
  e('Atriplex patula', 'łoboda rozłożysta', 'companion'),
  // stali towarzysze halofitów, także na silnie zasolonym
  e('Phragmites australis', 'trzcina pospolita', 'companion', true),
  e('Elymus repens', 'perz właściwy', 'companion', true),
  e('Juncus compressus', 'sit ściśniony', 'companion'),
  e('Leontodon autumnalis', 'brodawnik jesienny', 'companion'),
  e('Sonchus arvensis', 'mlecz polny', 'companion'),
  e('Juncus articulatus', 'sit członowaty', 'companion'),
  e('Juncus bufonius', 'sit dwudzielny', 'companion'),
  e('Eleocharis palustris', 'ponikło błotne', 'companion'),
  e('Eleocharis uniglumis', 'ponikło jednoprzysadkowe', 'companion'),
  e('Bromus hordeaceus', 'stokłosa miękka', 'companion'),
  e('Achillea millefolium', 'krwawnik pospolity', 'companion'),
  // inne glikofity ekspansywne (sprawozdanie 2024) i częste w zdjęciach
  e('Lolium perenne', 'życica trwała', 'companion', true),
  e('Calamagrostis epigejos', 'trzcinnik piaskowy', 'companion', true),
  e('Poa pratensis', 'wiechlina łąkowa', 'companion'),
  e('Festuca rubra', 'kostrzewa czerwona', 'companion'),
  e('Festuca pratensis', 'kostrzewa łąkowa', 'companion'),
  e('Potentilla reptans', 'pięciornik rozłogowy', 'companion'),
  e('Catabrosa aquatica', 'brzeżyca wodna', 'companion'),
  e('Taraxacum officinale', 'mniszek lekarski', 'companion'),
  e('Ranunculus acris', 'jaskier ostry', 'companion'),
  // krzewy i drzewa
  e('Alnus glutinosa', 'olsza czarna', 'woody'),
  e('Sambucus nigra', 'bez czarny', 'woody'),
  e('Salix cinerea', 'wierzba szara', 'woody'),
  // obce inwazyjne (przewodnik, sprawozdania 2016–2018 i 2024)
  e('Hordeum jubatum', 'jęczmień grzywiasty', 'alien'),
  e('Solidago gigantea', 'nawłoć późna', 'alien'),
  e('Solidago canadensis', 'nawłoć kanadyjska', 'alien'),
  e('Conyza canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Erigeron canadensis', 'przymiotno kanadyjskie', 'alien'),
]

const BY_NAME = new Map(SPECIES_1340.map((s) => [normalizeName(s.latin), s]))

export const findSpecies1340 = (name: string): SpeciesEntry1340 | undefined => BY_NAME.get(normalizeName(name))

export const groupOf1340 = (name: string) => findSpecies1340(name)?.group

export const isPhragmites = (name: string) => normalizeName(name) === normalizeName(PHRAGMITES)

/** Krzewy i drzewa w warstwie B, reszta w C. */
export const defaultLayer1340 = (s: SpeciesEntry1340): Layer => (s.group === 'woody' ? 'B' : 'C')
