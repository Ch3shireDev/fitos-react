// Słownik gatunków dla 3150 (starorzecza i naturalne eutroficzne zbiorniki wodne ze zbiorowiskami z Nympheion,
// Potamion), zebrany z przewodnika GIOŚ (Wilk-Woźniak i in. 2012, rozdz. „Identyfikatory fitosocjologiczne”
// i „Typowe gatunki roślin”), z przykładowej karty (Brzeg I, 2011) i ze sprawozdań z monitoringu 2016–2018 i 2024
// (gatunki obce: Elodea nuttallii, Azolla filiculoides). Grupy morfologiczno-ekologiczne odpowiadają tab. 2:
// elodeidy (zanurzone), nymfeidy (zakorzenione o liściach pływających), pleustofity (wolno pływające).
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup3150 =
  | 'elodeid' // zanurzone zakorzenione: rdestnice, wywłóczniki, rogatki, moczarki, jezierza, włosieniczniki
  | 'nymphaeid' // zakorzenione o liściach pływających: grążel, grzybienie, grzybieńczyk, kotewka, rdestnica pływająca
  | 'pleustophyte' // wolno pływające: rzęsy, spirodela, wolffia, salwinia, żabiściek, osoka, pływacze, wgłębka
  | 'helophyte' // szuwar i rośliny ziemnowodne (nie są przedmiotem oceny, ale trafiają do opisu i zdjęć)
  | 'moss' // mchy wodne (Fontinalis)
  | 'charophyte' // ramienice – pojedyncze osobniki dopuszczalne (odróżnienie od 3140)

export interface SpeciesEntry3150 {
  latin: string
  polish?: string
  group: SpeciesGroup3150
  /** Gatunek wymieniony w przewodniku jako typowy dla 3150. */
  typical?: boolean
  /**
   * Gatunek chroniony lub rzadki z tab. 2 („salwinia pływająca, kotewka orzech wodny, grzybieńczyk wodny,
   * różne gatunki z rodzaju pływacz”) – jego zbiorowisko utrzymuje ocenę FV mimo uboższej kombinacji.
   */
  rare?: boolean
  /**
   * Gatunek obcy/inwazyjny (wskaźnik „Gatunki wskazujące na degenerację siedliska”).
   * `ignored` – moczarka kanadyjska: obca, ale tab. 2 każe jej nie brać pod uwagę.
   */
  alien?: 'yes' | 'ignored'
}

export const GROUP_LABELS_3150: Record<SpeciesGroup3150, string> = {
  elodeid: 'elodeid (roślina zanurzona)',
  nymphaeid: 'nymfeid (liście pływające)',
  pleustophyte: 'pleustofit (wolno pływający)',
  helophyte: 'roślina szuwarowa',
  moss: 'mech wodny',
  charophyte: 'ramienica',
}

const e = (latin: string, polish: string, group: SpeciesGroup3150, extra: Partial<SpeciesEntry3150> = {}): SpeciesEntry3150 => ({
  latin,
  polish,
  group,
  ...extra,
})
const T = { typical: true }

export const SPECIES_3150: SpeciesEntry3150[] = [
  // elodeidy
  e('Ceratophyllum demersum', 'rogatek sztywny', 'elodeid', T),
  e('Ceratophyllum submersum', 'rogatek krótkoszyjkowy', 'elodeid'),
  e('Myriophyllum spicatum', 'wywłócznik kłosowy', 'elodeid', T),
  e('Myriophyllum verticillatum', 'wywłócznik okółkowy', 'elodeid', T),
  e('Hippuris vulgaris', 'przęstka pospolita', 'elodeid', T),
  e('Batrachium circinatum', 'włosienicznik krążkolistny', 'elodeid', T),
  e('Batrachium aquatile', 'włosienicznik wodny', 'elodeid'),
  e('Batrachium peltatum', 'włosienicznik tarczowaty', 'elodeid'),
  e('Batrachium trichophyllum', 'włosienicznik krótkolistny', 'elodeid'),
  e('Hottonia palustris', 'okrężnica bagienna', 'elodeid', T),
  e('Zannichellia palustris', 'zamętnica błotna', 'elodeid', T),
  e('Najas marina', 'jezierza morska', 'elodeid', T),
  e('Najas minor', 'jezierza mniejsza', 'elodeid'),
  e('Elodea canadensis', 'moczarka kanadyjska', 'elodeid', { typical: true, alien: 'ignored' }),
  e('Elodea nuttallii', 'moczarka delikatna', 'elodeid', { alien: 'yes' }),
  e('Vallisneria spiralis', 'nurzaniec śrubowy', 'elodeid', { alien: 'yes' }),
  e('Potamogeton pectinatus', 'rdestnica grzebieniasta', 'elodeid', T),
  e('Potamogeton crispus', 'rdestnica kędzierzawa', 'elodeid', T),
  e('Potamogeton ×nitens', 'rdestnica lśniąca', 'elodeid', T),
  e('Potamogeton filiformis', 'rdestnica nitkowata', 'elodeid', T),
  e('Potamogeton acutifolius', 'rdestnica ostrolistna', 'elodeid', T),
  e('Potamogeton lucens', 'rdestnica połyskująca', 'elodeid', T),
  e('Potamogeton perfoliatus', 'rdestnica przeszyta', 'elodeid', T),
  e('Potamogeton obtusifolius', 'rdestnica stępiona', 'elodeid', T),
  e('Potamogeton compressus', 'rdestnica ścieśniona', 'elodeid', T),
  e('Potamogeton pusillus', 'rdestnica drobna', 'elodeid'),
  e('Potamogeton friesii', 'rdestnica Friesa', 'elodeid'),
  e('Potamogeton trichoides', 'rdestnica włosowata', 'elodeid'),
  e('Potamogeton gramineus', 'rdestnica trawiasta', 'elodeid'),
  e('Potamogeton praelongus', 'rdestnica długolistna', 'elodeid'),
  e('Utricularia minor', 'pływacz drobny', 'elodeid', { rare: true }),
  // nymfeidy
  e('Nuphar lutea', 'grążel żółty', 'nymphaeid', T),
  e('Nymphaea alba', 'grzybienie białe', 'nymphaeid', T),
  e('Nymphaea candida', 'grzybienie północne', 'nymphaeid'),
  e('Nymphoides peltata', 'grzybieńczyk wodny', 'nymphaeid', { typical: true, rare: true }),
  e('Trapa natans', 'kotewka orzech wodny', 'nymphaeid', { typical: true, rare: true }),
  e('Potamogeton natans', 'rdestnica pływająca', 'nymphaeid', T),
  e('Polygonum amphibium', 'rdest ziemnowodny', 'nymphaeid', T),
  // pleustofity
  e('Lemna minor', 'rzęsa drobna', 'pleustophyte', T),
  e('Lemna gibba', 'rzęsa garbata', 'pleustophyte', T),
  e('Lemna trisulca', 'rzęsa trójrowkowa', 'pleustophyte', T),
  e('Spirodela polyrhiza', 'spirodela wielokorzeniowa', 'pleustophyte', T),
  e('Wolffia arrhiza', 'wolffia bezkorzeniowa', 'pleustophyte'),
  e('Riccia fluitans', 'wgłębka wodna', 'pleustophyte', T),
  e('Ricciocarpos natans', 'wgłębik pływający', 'pleustophyte', T),
  e('Hydrocharis morsus-ranae', 'żabiściek pływający', 'pleustophyte', T),
  e('Stratiotes aloides', 'osoka aloesowata', 'pleustophyte', T),
  e('Salvinia natans', 'salwinia pływająca', 'pleustophyte', { typical: true, rare: true }),
  e('Utricularia vulgaris', 'pływacz zwyczajny', 'pleustophyte', { rare: true }),
  e('Utricularia australis', 'pływacz zachodni', 'pleustophyte', { rare: true }),
  e('Azolla filiculoides', 'azolla drobna', 'pleustophyte', { alien: 'yes' }),
  // mchy i ramienice
  e('Fontinalis antipyretica', 'zdrojek pospolity', 'moss', T),
  e('Chara globularis', 'ramienica krucha', 'charophyte'),
  e('Chara contraria', 'ramienica przeciwstawna', 'charophyte'),
  // szuwar (opis stanowiska, zdjęcia)
  e('Phragmites australis', 'trzcina pospolita', 'helophyte'),
  e('Typha latifolia', 'pałka szerokolistna', 'helophyte'),
  e('Typha angustifolia', 'pałka wąskolistna', 'helophyte'),
  e('Glyceria maxima', 'manna mielec', 'helophyte'),
  e('Iris pseudacorus', 'kosaciec żółty', 'helophyte'),
  e('Carex pseudocyperus', 'turzyca ciborowata', 'helophyte'),
  e('Carex acutiformis', 'turzyca błotna', 'helophyte'),
  e('Carex riparia', 'turzyca brzegowa', 'helophyte'),
  e('Acorus calamus', 'tatarak zwyczajny', 'helophyte'),
  e('Sparganium erectum', 'jeżogłówka gałęzista', 'helophyte'),
  e('Sagittaria sagittifolia', 'strzałka wodna', 'helophyte'),
  e('Butomus umbellatus', 'łączeń baldaszkowy', 'helophyte'),
  e('Oenanthe aquatica', 'kropidło wodne', 'helophyte'),
  e('Rorippa amphibia', 'rzepicha ziemnowodna', 'helophyte'),
  e('Equisetum fluviatile', 'skrzyp bagienny', 'helophyte'),
  e('Schoenoplectus lacustris', 'oczeret jeziorny', 'helophyte'),
  e('Phalaris arundinacea', 'mozga trzcinowata', 'helophyte'),
]

/** Synonimy spotykane w kartach: Persicaria = Polygonum, Stuckenia = P. pectinatus, Ranunculus = Batrachium. */
const SYNONYMS: Record<string, string> = {
  'persicaria amphibia': 'Polygonum amphibium',
  'stuckenia pectinata': 'Potamogeton pectinatus',
  'ranunculus circinatus': 'Batrachium circinatum',
  'ranunculus aquatilis': 'Batrachium aquatile',
  'ranunculus peltatus': 'Batrachium peltatum',
  'ranunculus trichophyllus': 'Batrachium trichophyllum',
  'potamogeton nitens': 'Potamogeton ×nitens',
  'potamogeton x nitens': 'Potamogeton ×nitens',
  'ricciocarpus natans': 'Ricciocarpos natans',
  'spirodela polyrrhiza': 'Spirodela polyrhiza',
}

const BY_NAME = new Map(SPECIES_3150.map((s) => [normalizeName(s.latin), s]))

export function findSpecies3150(name: string): SpeciesEntry3150 | undefined {
  const n = normalizeName(name)
  return BY_NAME.get(n) ?? (SYNONYMS[n] ? BY_NAME.get(normalizeName(SYNONYMS[n])) : undefined)
}

/** Ramienice (Chara, Nitella…) poza katalogiem rozpoznawane po rodzaju. */
export const isCharophyteName = (name: string) =>
  findSpecies3150(name)?.group === 'charophyte' || /^(chara|nitella|nitellopsis|tolypella)\b/i.test(name.trim())

/** Pływacze (Utricularia spp.) – tab. 2 wymienia cały rodzaj jako rzadki. */
export const isRareName = (name: string) => Boolean(findSpecies3150(name)?.rare) || /^utricularia\b/i.test(name.trim())

/** W zdjęciu fitosocjologicznym wszystko w warstwie C, mchy wodne w D. */
export const defaultLayer3150 = (s: SpeciesEntry3150): Layer => (s.group === 'moss' ? 'D' : 'C')
