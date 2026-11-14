// Słownik gatunków dla 3110 (jeziora lobeliowe), zebrany z przewodnika GIOŚ (Wilk-Woźniak i in. 2012,
// „Identyfikatory fitosocjologiczne”, „Typowe gatunki roślin”, tab. 2) i ze sprawozdań z monitoringu 2009–2011,
// 2015–2018 i 2020–2021. Grupy decydują o podpowiedziach dwóch wskaźników kardynalnych:
// „Charakterystyczna kombinacja zbiorowisk” (gatunki charakterystyczne – izoetydy) i „Gatunki wskazujące na degenerację”.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup3110 =
  | 'characteristic' // gatunki charakterystyczne jezior lobeliowych (izoetydy + Luronium)
  | 'degeneration' // gatunki wskazujące na degenerację (wody zeutrofizowane) – tab. 2
  | 'companion' // towarzyszące z Littorelletea, Utricularietea, Charetea, Potametea
  | 'moss' // mchy wodne i torfowce
  | 'helophyte' // szuwary i turzycowiska strefy brzegowej

export interface SpeciesEntry3110 {
  latin: string
  polish?: string
  group: SpeciesGroup3110
}

export const GROUP_LABELS_3110: Record<SpeciesGroup3110, string> = {
  characteristic: 'gatunek charakterystyczny jezior lobeliowych',
  degeneration: 'gatunek wskazujący na degenerację siedliska',
  companion: 'roślina wodna towarzysząca',
  moss: 'mech wodny / torfowiec',
  helophyte: 'gatunek szuwarowy',
}

const e = (latin: string, polish: string, group: SpeciesGroup3110): SpeciesEntry3110 => ({ latin, polish, group })

export const SPECIES_3110: SpeciesEntry3110[] = [
  // charakterystyczne (tab. 2, FV)
  e('Lobelia dortmanna', 'lobelia jeziorna', 'characteristic'),
  e('Isoëtes lacustris', 'poryblin jeziorny', 'characteristic'),
  e('Isoëtes echinospora', 'poryblin kolczasty', 'characteristic'),
  e('Littorella uniflora', 'brzeżyca jednokwiatowa', 'characteristic'),
  e('Myriophyllum alterniflorum', 'wywłócznik skrętoległy', 'characteristic'),
  e('Luronium natans', 'elisma wodna', 'characteristic'),
  // wskazujące na degenerację (tab. 2, U2)
  e('Nuphar lutea', 'grążel żółty', 'degeneration'),
  e('Ceratophyllum demersum', 'rogatek sztywny', 'degeneration'),
  e('Myriophyllum spicatum', 'wywłócznik kłosowy', 'degeneration'),
  e('Hydrocharis morsus-ranae', 'żabiściek pływający', 'degeneration'),
  e('Elodea canadensis', 'moczarka kanadyjska', 'degeneration'),
  // towarzyszące
  e('Juncus bulbosus', 'sit drobny', 'companion'),
  e('Eleocharis acicularis', 'ponikło igłowate', 'companion'),
  e('Ranunculus reptans', 'jaskier płomiennik', 'companion'),
  e('Sparganium angustifolium', 'jeżogłówka pokrewna', 'companion'),
  e('Sparganium natans', 'jeżogłówka najmniejsza', 'companion'),
  e('Utricularia intermedia', 'pływacz pośredni', 'companion'),
  e('Utricularia minor', 'pływacz drobny', 'companion'),
  e('Utricularia vulgaris', 'pływacz zwyczajny', 'companion'),
  e('Nitella flexilis', 'krynicznica giętka', 'companion'),
  e('Nitella capillaris', 'krynicznica włosowata', 'companion'),
  e('Potamogeton natans', 'rdestnica pływająca', 'companion'),
  e('Potamogeton polygonifolius', 'rdestnica podługowata', 'companion'),
  e('Persicaria amphibia', 'rdest ziemnowodny', 'companion'),
  e('Nymphaea alba', 'grzybienie białe', 'companion'),
  e('Nymphaea candida', 'grzybienie północne', 'companion'),
  e('Nuphar pumila', 'grążel drobny', 'companion'),
  // mchy
  e('Drepanocladus tenuinervis', 'sierpowiec cienkożebrowy', 'moss'),
  e('Warnstorfia exannulata', 'sierpowiec bezpierścieniowy', 'moss'),
  e('Fontinalis antipyretica', 'zdrojek pospolity', 'moss'),
  e('Sphagnum denticulatum', 'torfowiec ząbkowany', 'moss'),
  e('Sphagnum cuspidatum', 'torfowiec spiczastolistny', 'moss'),
  // szuwary i turzycowiska
  e('Phragmites australis', 'trzcina pospolita', 'helophyte'),
  e('Equisetum fluviatile', 'skrzyp bagienny', 'helophyte'),
  e('Carex rostrata', 'turzyca dzióbkowata', 'helophyte'),
  e('Carex lasiocarpa', 'turzyca nitkowata', 'helophyte'),
  e('Carex elata', 'turzyca sztywna', 'helophyte'),
  e('Calla palustris', 'czermień błotna', 'helophyte'),
  e('Menyanthes trifoliata', 'bobrek trójlistkowy', 'helophyte'),
  e('Comarum palustre', 'siedmiopalecznik błotny', 'helophyte'),
  e('Schoenoplectus lacustris', 'oczeret jeziorny', 'helophyte'),
  e('Typha latifolia', 'pałka szerokolistna', 'helophyte'),
]

// „Isoëtes” bywa pisane bez diaerezy – normalizacja zrównuje oba zapisy.
const key = (s: string) => normalizeName(s.replace(/ë/g, 'e'))
const BY_NAME = new Map(SPECIES_3110.map((s) => [key(s.latin), s]))

export const findSpecies3110 = (name: string): SpeciesEntry3110 | undefined => BY_NAME.get(key(name))

/** Mchy i torfowce w warstwie D, reszta w C – w wodzie nie ma drzew ani krzewów. */
export const defaultLayer3110 = (s: SpeciesEntry3110): Layer => (s.group === 'moss' ? 'D' : 'C')

export const CHARACTERISTIC_3110 = SPECIES_3110.filter((s) => s.group === 'characteristic')
export const DEGENERATION_3110 = SPECIES_3110.filter((s) => s.group === 'degeneration')
