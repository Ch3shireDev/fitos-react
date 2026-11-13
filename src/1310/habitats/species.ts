// Słownik gatunków dla 1310 (śródlądowe błotniste solniska z solirodkiem), zebrany z przewodnika GIOŚ (Bosiacka 2012,
// rozdz. „Typowe gatunki roślin” i tab. 1), z przykładowej karty (Kołobrzeg-Budzistowo, 2009) i ze sprawozdań z monitoringu
// 2016 i 2021. Grupy jak w przewodniku: pionierskie halofity obligatoryjne, inne halofity obligatoryjne, halofity
// fakultatywne, gatunki indyferentne i glikofity. Wszystko roślinność zielna – w zdjęciu warstwa C.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup1310 =
  | 'pioneer' // pionierskie halofity obligatoryjne (soliród i towarzysze na najsilniej zasolonym podłożu)
  | 'halophyte' // inne halofity obligatoryjne
  | 'facultative' // halofity fakultatywne
  | 'indifferent' // gatunki indyferentne i glikofity (w tym ekspansywne)
  | 'alien' // obce gatunki inwazyjne
  | 'other'

export interface SpeciesEntry1310 {
  latin: string
  polish?: string
  group: SpeciesGroup1310
  /** Rodzimy gatunek ekspansywny wnikający na solnisko (trzcina, mietlica rozłogowa…). */
  expansive?: boolean
}

export const GROUP_LABELS_1310: Record<SpeciesGroup1310, string> = {
  pioneer: 'pionierski halofit obligatoryjny',
  halophyte: 'halofit obligatoryjny',
  facultative: 'halofit fakultatywny',
  indifferent: 'gatunek indyferentny / glikofit',
  alien: 'gatunek obcy',
  other: 'inny',
}

/** Gatunek charakterystyczny siedliska – w ocenie liczy się tylko on (przewodnik, tab. 1). */
export const SALICORNIA = 'Salicornia europaea'

/** Halofity w rozumieniu wskaźnika „Gatunki dominujące” (wszystkie trzy grupy halofitów). */
export const isHalophyteGroup = (g: SpeciesGroup1310 | undefined) => g === 'pioneer' || g === 'halophyte' || g === 'facultative'

const e = (latin: string, polish: string, group: SpeciesGroup1310, expansive = false): SpeciesEntry1310 => ({ latin, polish, group, expansive })

export const SPECIES_1310: SpeciesEntry1310[] = [
  // pionierskie halofity obligatoryjne
  e('Salicornia europaea', 'soliród zielny', 'pioneer'),
  e('Spergularia salina', 'muchotrzew solniskowy', 'pioneer'),
  e('Spergularia marina', 'muchotrzew solniskowy', 'pioneer'),
  e('Atriplex prostrata subsp. prostrata var. salina', 'łoboda oszczepowata odm. solniskowa', 'pioneer'),
  e('Atriplex prostrata subsp. prostrata', 'łoboda oszczepowata', 'pioneer'),
  e('Atriplex prostrata', 'łoboda oszczepowata', 'pioneer'),
  e('Puccinellia maritima', 'mannica nadmorska', 'pioneer'),
  // inne halofity obligatoryjne
  e('Aster tripolium', 'aster solny', 'halophyte'),
  e('Tripolium pannonicum', 'aster solny', 'halophyte'),
  e('Glaux maritima', 'mlecznik nadmorski', 'halophyte'),
  e('Lysimachia maritima', 'mlecznik nadmorski', 'halophyte'),
  e('Triglochin maritimum', 'świbka morska', 'halophyte'),
  e('Triglochin maritima', 'świbka morska', 'halophyte'),
  e('Juncus gerardi', 'sit Gerarda', 'halophyte'),
  e('Plantago maritima', 'babka nadmorska', 'halophyte'),
  // halofity fakultatywne
  e('Puccinellia distans', 'mannica odstająca', 'facultative'),
  e('Bolboschoenus maritimus', 'sitowiec nadmorski', 'facultative'),
  e('Plantago winteri', 'babka Wintera', 'facultative'),
  // gatunki indyferentne i glikofity
  e('Phragmites australis', 'trzcina pospolita', 'indifferent', true),
  e('Agrostis stolonifera', 'mietlica rozłogowa', 'indifferent', true),
  e('Phalaris arundinacea', 'mozga trzcinowata', 'indifferent', true),
  e('Calamagrostis epigejos', 'trzcinnik piaskowy', 'indifferent', true),
  e('Festuca arundinacea', 'kostrzewa trzcinowata', 'indifferent', true),
  e('Elymus repens', 'perz właściwy', 'indifferent', true),
  e('Ranunculus sceleratus', 'jaskier jadowity', 'indifferent'),
]

const BY_NAME = new Map(SPECIES_1310.map((s) => [normalizeName(s.latin), s]))

export const findSpecies1310 = (name: string): SpeciesEntry1310 | undefined => BY_NAME.get(normalizeName(name))

export const isSalicornia = (name: string) => normalizeName(name) === normalizeName(SALICORNIA)

/** Wszystko w warstwie C – na słonym błocie nie ma drzew, krzewów ani mszystej. */
export const defaultLayer1310 = (_s: SpeciesEntry1310): Layer => 'C'
