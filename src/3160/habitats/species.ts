// Słownik gatunków dla 3160 (naturalne, dystroficzne zbiorniki wodne), zebrany z przewodnika GIOŚ (Wilk-Woźniak i in.
// 2012, rozdz. „Identyfikatory fitosocjologiczne”, „Typowe gatunki roślin”, tab. 1), z przykładowej karty (Jezioro
// Kuźniczek, 2011) i ze sprawozdań z monitoringu 2009–2011 i 2016–2018. Rośliny lustra wody, nie pła torfowiskowego –
// gatunki pła (Carex limosa, Scheuchzeria…) są w katalogu tylko jako „gatunek pła”, bo trafiają do „Innych wartości”.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup3160 =
  | 'sphagnum' // torfowce w formie wodnej
  | 'moss' // inne mchy wodne (Warnstorfia, Scorpidium)
  | 'utricularia' // pływacze
  | 'nymphaeid' // grzybienie, grążele, rdestnica pływająca
  | 'hydrophyte' // inne rośliny wodne typowe dla 3160
  | 'expansive' // rodzime gatunki ekspansywne (rogatek, trzcina)
  | 'invasive' // obce gatunki inwazyjne
  | 'mire' // gatunki pła torfowiskowego
  | 'other'

export interface SpeciesEntry3160 {
  latin: string
  polish?: string
  group: SpeciesGroup3160
  /** Gatunek wymieniony w przewodniku jako typowy (charakterystyczny) dla 3160. */
  typical?: boolean
}

export const GROUP_LABELS_3160: Record<SpeciesGroup3160, string> = {
  sphagnum: 'torfowiec (forma wodna)',
  moss: 'mech wodny',
  utricularia: 'pływacz',
  nymphaeid: 'roślina o liściach pływających',
  hydrophyte: 'roślina wodna',
  expansive: 'rodzimy gatunek ekspansywny',
  invasive: 'obcy gatunek inwazyjny',
  mire: 'gatunek pła torfowiskowego',
  other: 'inny',
}

const e = (latin: string, polish: string, group: SpeciesGroup3160, typical = false): SpeciesEntry3160 => ({ latin, polish, group, typical })

export const SPECIES_3160: SpeciesEntry3160[] = [
  // torfowce – formy wodne
  e('Sphagnum denticulatum', 'torfowiec ząbkowany', 'sphagnum', true),
  e('Sphagnum inundatum', 'torfowiec zanurzony', 'sphagnum', true),
  e('Sphagnum cuspidatum', 'torfowiec spiczastolistny', 'sphagnum', true),
  e('Sphagnum contortum', 'torfowiec skręcony', 'sphagnum', true),
  e('Sphagnum fallax', 'torfowiec kończysty', 'sphagnum', true),
  e('Sphagnum obesum', 'torfowiec obły', 'sphagnum', true),
  // inne mchy
  e('Warnstorfia fluitans', 'warnstorfia pływająca', 'moss', true),
  e('Warnstorfia exannulata', 'warnstorfia bezpierścieniowa', 'moss', true),
  e('Scorpidium scorpioides', 'skorpionowiec brunatnawy', 'moss', true),
  e('Aneura pinguis', 'nużyca tłustawa', 'moss'),
  // pływacze
  e('Utricularia minor', 'pływacz drobny', 'utricularia', true),
  e('Utricularia intermedia', 'pływacz średni', 'utricularia', true),
  e('Utricularia australis', 'pływacz zachodni', 'utricularia', true),
  e('Utricularia ochroleuca', 'pływacz krótkoostrogowy', 'utricularia', true),
  e('Utricularia vulgaris', 'pływacz zwyczajny', 'utricularia', true),
  // nymfeidy
  e('Nymphaea alba', 'grzybienie białe', 'nymphaeid', true),
  e('Nymphaea candida', 'grzybienie północne', 'nymphaeid', true),
  e('Nymphaea × borealis', 'grzybienie (mieszaniec)', 'nymphaeid', true),
  e('Nuphar pumila', 'grążel drobny', 'nymphaeid', true),
  e('Nuphar lutea', 'grążel żółty', 'nymphaeid', true),
  e('Potamogeton natans', 'rdestnica pływająca', 'nymphaeid', true),
  // inne wodne
  e('Sparganium minimum', 'jeżogłówka najmniejsza', 'hydrophyte', true),
  e('Potamogeton gramineus', 'rdestnica trawiasta', 'hydrophyte', true),
  e('Aldrovanda vesiculosa', 'aldrowanda pęcherzykowata', 'hydrophyte', true),
  e('Batrachospermum turfosum', 'krasnorost torfowy', 'hydrophyte'),
  e('Nitella flexilis', 'kryniczka giętka', 'hydrophyte'),
  e('Nitella mucronata', 'kryniczka ostrokończysta', 'hydrophyte'),
  e('Chara delicatula', 'ramienica delikatna', 'hydrophyte'),
  // ekspansywne
  e('Ceratophyllum demersum', 'rogatek sztywny', 'expansive'),
  e('Phragmites australis', 'trzcina pospolita', 'expansive'),
  // inwazyjne
  e('Elodea canadensis', 'moczarka kanadyjska', 'invasive'),
  e('Elodea nuttallii', 'moczarka delikatna', 'invasive'),
  e('Campylopus introflexus', 'krzywoszczeć przywłoka', 'invasive'),
  // pło
  e('Eriophorum angustifolium', 'wełnianka wąskolistna', 'mire'),
  e('Eriophorum vaginatum', 'wełnianka pochwowata', 'mire'),
  e('Rhynchospora alba', 'przygiełka biała', 'mire'),
  e('Carex limosa', 'turzyca bagienna', 'mire'),
  e('Carex rostrata', 'turzyca dzióbkowata', 'mire'),
  e('Scheuchzeria palustris', 'bagnica torfowa', 'mire'),
  e('Andromeda polifolia', 'modrzewnica zwyczajna', 'mire'),
  e('Menyanthes trifoliata', 'bobrek trójlistkowy', 'mire'),
  e('Drosera rotundifolia', 'rosiczka okrągłolistna', 'mire'),
  e('Ledum palustre', 'bagno zwyczajne', 'mire'),
  e('Oxycoccus palustris', 'żurawina błotna', 'mire'),
]

const BY_NAME = new Map(SPECIES_3160.map((s) => [normalizeName(s.latin), s]))

export const findSpecies3160 = (name: string): SpeciesEntry3160 | undefined => BY_NAME.get(normalizeName(name))

/** Gatunki charakterystyczne w rozumieniu wskaźnika – rośliny lustra wody (bez ekspansywnych, inwazyjnych i pła). */
export const isCharacteristicGroup = (g: SpeciesGroup3160) =>
  g === 'sphagnum' || g === 'moss' || g === 'utricularia' || g === 'nymphaeid' || g === 'hydrophyte'

/** Mchy w warstwie D, reszta w C. */
export const defaultLayer3160 = (s: SpeciesEntry3160): Layer => (s.group === 'sphagnum' || s.group === 'moss' ? 'D' : 'C')
