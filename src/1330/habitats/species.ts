// Słownik gatunków dla 1330 (solniska nadmorskie, Glauco-Puccinellietalia – zbiorowiska nadmorskie), zebrany z przewodnika
// GIOŚ (Bosiacka 2012, rozdz. „Typowe gatunki roślin” i tab. 1), z przykładowej karty (Jarzębowo, 2009) i ze sprawozdań
// z monitoringu 2017 i 2021. Grupy jak w przewodniku: halofity obligatoryjne, halofity fakultatywne, gatunki indyferentne
// (w tym „bazowe”), glikofity. Do tego drzewa i krzewy (wskaźnik „Ekspansja krzewów…”) i gatunki obce.
// Gatunki ze zdjęć, których przewodnik nie wymienia w żadnej grupie (mięta wodna, manna mielec…), są tu glikofitami –
// to interpretacja: ani halofit, ani wymieniony gatunek indyferentny.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup1330 =
  | 'obligate' // halofity obligatoryjne
  | 'facultative' // halofity fakultatywne
  | 'indifferent' // gatunki indyferentne (w tym „bazowe”)
  | 'glycophyte' // glikofity (w tym ekspansywne)
  | 'woody' // drzewa i krzewy
  | 'alien' // obce gatunki inwazyjne

export interface SpeciesEntry1330 {
  latin: string
  polish?: string
  group: SpeciesGroup1330
  /** „Bazowy” gatunek indyferentny (tab. 1): liczy się do gatunków charakterystycznych razem z halofitami. */
  base?: boolean
  /** Rodzimy gatunek ekspansywny wkraczający na słone łąki (trzcina, perz, śmiałek…). */
  expansive?: boolean
}

export const GROUP_LABELS_1330: Record<SpeciesGroup1330, string> = {
  obligate: 'halofit obligatoryjny',
  facultative: 'halofit fakultatywny',
  indifferent: 'gatunek indyferentny',
  glycophyte: 'glikofit',
  woody: 'drzewo / krzew',
  alien: 'gatunek obcy',
}

export const isHalophyte = (g: SpeciesGroup1330 | undefined) => g === 'obligate' || g === 'facultative'

type Extra = { base?: boolean; expansive?: boolean }
const e = (latin: string, polish: string, group: SpeciesGroup1330, x: Extra = {}): SpeciesEntry1330 => ({ latin, polish, group, ...x })
const BASE = { base: true }
const EXP = { expansive: true }

export const SPECIES_1330: SpeciesEntry1330[] = [
  // halofity obligatoryjne
  e('Salicornia europaea', 'soliród zielny', 'obligate'),
  e('Aster tripolium', 'aster solny', 'obligate'),
  e('Tripolium pannonicum', 'aster solny', 'obligate'),
  e('Glaux maritima', 'mlecznik nadmorski', 'obligate'),
  e('Lysimachia maritima', 'mlecznik nadmorski', 'obligate'),
  e('Triglochin maritimum', 'świbka morska', 'obligate'),
  e('Triglochin maritima', 'świbka morska', 'obligate'),
  e('Juncus gerardi', 'sit Gerarda', 'obligate'),
  e('Plantago maritima', 'babka nadmorska', 'obligate'),
  e('Centaurium litorale', 'centuria nadbrzeżna', 'obligate'),
  e('Spergularia salina', 'muchotrzew solniskowy', 'obligate'),
  e('Spergularia marina', 'muchotrzew solniskowy', 'obligate'),
  e('Atriplex prostrata subsp. prostrata var. salina', 'łoboda oszczepowata odm. solniskowa', 'obligate'),
  e('Atriplex prostrata subsp. prostrata', 'łoboda oszczepowata', 'obligate'),
  e('Atriplex prostrata', 'łoboda oszczepowata', 'obligate'), // sprawozdanie 2021 wymienia ją wśród halofitów bez odmiany
  e('Puccinellia maritima', 'mannica nadmorska', 'obligate'), // sprawozdanie 2021: flora słonych łąk bałtyckich
  // halofity fakultatywne
  e('Plantago coronopus', 'babka pierzasta', 'facultative'),
  e('Blysmus rufus', 'ostrzew rudy', 'facultative'),
  e('Puccinellia distans', 'mannica odstająca', 'facultative'),
  e('Lotus tenuis', 'komonica wąskolistna', 'facultative'),
  e('Trifolium fragiferum', 'koniczyna rozdęta', 'facultative'),
  e('Schoenoplectus tabernaemontani', 'oczeret Tabernaemontana', 'facultative'),
  e('Bolboschoenus maritimus', 'sitowiec nadmorski', 'facultative'),
  e('Carex distans', 'turzyca odległokłosa', 'facultative'),
  e('Centaurium pulchellum', 'centuria nadobna', 'facultative'),
  e('Festuca arundinacea', 'kostrzewa trzcinowata', 'facultative'),
  e('Juncus ranarius', 'sit żabi', 'facultative'),
  e('Plantago winteri', 'babka Wintera', 'facultative'),
  e('Samolus valerandi', 'jarnik solankowy', 'facultative'),
  // gatunki indyferentne; „bazowe” wg tab. 1 (Festuca rubra i Eleocharis uniglumis rozdz. 4 wymienia wśród glikofitów –
  // przyjęto tab. 1, bo to ona mówi o ocenie)
  e('Agrostis stolonifera', 'mietlica rozłogowa', 'indifferent', BASE),
  e('Potentilla anserina', 'pięciornik gęsi', 'indifferent', BASE),
  e('Festuca rubra', 'kostrzewa czerwona', 'indifferent', BASE),
  e('Eleocharis uniglumis', 'ponikło jednoprzysadkowe', 'indifferent', BASE),
  e('Carex cuprina', 'turzyca niby-lisia', 'indifferent'),
  e('Odontites serotina', 'zagorzałek późny', 'indifferent'),
  e('Inula britannica', 'oman łąkowy', 'indifferent'),
  e('Blysmus compressus', 'ostrzew spłaszczony', 'indifferent'),
  e('Plantago major', 'babka zwyczajna', 'indifferent'),
  e('Plantago intermedia', 'babka wielonasienna', 'indifferent'),
  e('Plantago lanceolata', 'babka lancetowata', 'indifferent'),
  e('Chenopodium glaucum', 'komosa sina', 'indifferent'),
  e('Chenopodium rubrum', 'komosa czerwona', 'indifferent'),
  // glikofity (ekspansywne wg tab. 1 i sprawozdań)
  e('Phragmites australis', 'trzcina pospolita', 'glycophyte', EXP),
  e('Elymus repens', 'perz właściwy', 'glycophyte', EXP),
  e('Deschampsia caespitosa', 'śmiałek darniowy', 'glycophyte', EXP),
  e('Juncus effusus', 'sit rozpierzchły', 'glycophyte', EXP),
  e('Cirsium arvense', 'ostrożeń polny', 'glycophyte', EXP),
  e('Urtica dioica', 'pokrzywa zwyczajna', 'glycophyte', EXP),
  e('Juncus compressus', 'sit ściśniony', 'glycophyte'),
  e('Juncus articulatus', 'sit członowaty', 'glycophyte'),
  e('Juncus bufonius', 'sit dwudzielny', 'glycophyte'),
  e('Eleocharis palustris', 'ponikło błotne', 'glycophyte'),
  e('Ranunculus sceleratus', 'jaskier jadowity', 'glycophyte'),
  e('Sonchus arvensis', 'mlecz polny', 'glycophyte'),
  e('Lychnis flos-cuculi', 'firletka poszarpana', 'glycophyte'),
  e('Leontodon autumnalis', 'brodawnik jesienny', 'glycophyte'),
  // pozostałe z przykładowej karty (glikofity – interpretacja)
  e('Ranunculus repens', 'jaskier rozłogowy', 'glycophyte'),
  e('Ranunculus flammula', 'jaskier płomiennik', 'glycophyte'),
  e('Trifolium repens', 'koniczyna rozesłana', 'glycophyte'),
  e('Carex disticha', 'turzyca dwustronna', 'glycophyte'),
  e('Glyceria maxima', 'manna mielec', 'glycophyte'),
  e('Acorus calamus', 'tatarak zwyczajny', 'glycophyte'),
  e('Triglochin palustre', 'świbka błotna', 'glycophyte'),
  e('Menyanthes trifoliata', 'bobrek trójlistkowy', 'glycophyte'),
  e('Oenanthe fistulosa', 'kropidło piszczałkowate', 'glycophyte'),
  e('Sium latifolium', 'marek szerokolistny', 'glycophyte'),
  e('Mentha aquatica', 'mięta wodna', 'glycophyte'),
  e('Berula erecta', 'potocznik wąskolistny', 'glycophyte'),
  e('Senecio jacobaea', 'starzec jakubek', 'glycophyte'),
  e('Rumex hydrolapathum', 'szczaw lancetowaty', 'glycophyte'),
  e('Dactylorhiza incarnata', 'kukułka krwista', 'glycophyte'),
  e('Hydrocotyle vulgaris', 'wąkrota zwyczajna', 'glycophyte'),
  e('Eriophorum angustifolium', 'wełnianka wąskolistna', 'glycophyte'),
  // drzewa i krzewy (sprawozdania 2017 i 2021)
  e('Alnus glutinosa', 'olsza czarna', 'woody'),
  e('Salix cinerea', 'wierzba szara', 'woody'),
  e('Betula pendula', 'brzoza brodawkowata', 'woody'),
  e('Betula pubescens', 'brzoza omszona', 'woody'),
  // obce
  e('Rosa rugosa', 'róża pomarszczona', 'alien'),
  e('Echinocystis lobata', 'kolczurka klapowana', 'alien'),
]

const BY_NAME = new Map(SPECIES_1330.map((s) => [normalizeName(s.latin), s]))

export const findSpecies1330 = (name: string): SpeciesEntry1330 | undefined => BY_NAME.get(normalizeName(name))

/** Halofit albo „bazowy” gatunek indyferentny – liczy się do wskaźnika „Gatunki charakterystyczne”. */
export const isCharacteristic1330 = (name: string) => {
  const s = findSpecies1330(name)
  return Boolean(s && (isHalophyte(s.group) || s.base))
}

/** Słone łąki to roślinność zielna (C); drzewa i krzewy – B (podrost, łoza), róża pomarszczona też B. */
export const defaultLayer1330 = (s: SpeciesEntry1330): Layer => (s.group === 'woody' || s.latin === 'Rosa rugosa' ? 'B' : 'C')
