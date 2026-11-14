// Słownik gatunków dla 3140 (twardowodne jeziora ramienicowe), zebrany z przewodnika GIOŚ (Gąbka, Pełechaty i in.,
// rozdz. 3140 „Typowe gatunki roślin”, tab. 1 i przykładowa karta – Jezioro Budzisławskie 2013) oraz ze sprawozdań
// z monitoringu 2013–2014 (21 gatunków ramienic), 2016–2018 i 2023–2025 (gatunki obce: moczarka kanadyjska, moczarka
// delikatna). Synonimy ramienic sklejone w jeden takson – liczba gatunków charakterystycznych nie liczy ich podwójnie.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup3140 =
  | 'charophyte' // ramienice (Characeae) – gatunki charakterystyczne
  | 'expansive' // rodzime gatunki ekspansywne, wskazujące na degenerację (eutrofizację)
  | 'alien' // obce gatunki inwazyjne
  | 'hydrophyte' // inne rośliny wodne typowe dla jezior ramienicowych
  | 'reed' // szuwar (np. kłoć wiechowata)

export interface SpeciesEntry3140 {
  latin: string
  polish?: string
  group: SpeciesGroup3140
  /** Nazwa przyjęta – synonimy wskazują na nią, żeby liczyć takson raz. */
  accepted?: string
}

export const GROUP_LABELS_3140: Record<SpeciesGroup3140, string> = {
  charophyte: 'ramienica – gatunek charakterystyczny',
  expansive: 'gatunek ekspansywny (degeneracja siedliska)',
  alien: 'obcy gatunek inwazyjny',
  hydrophyte: 'roślina wodna towarzysząca',
  reed: 'gatunek szuwarowy',
}

const e = (latin: string, polish: string, group: SpeciesGroup3140, accepted?: string): SpeciesEntry3140 => ({ latin, polish, group, accepted })

export const SPECIES_3140: SpeciesEntry3140[] = [
  // ramienice – lista z rozdziału „Typowe gatunki roślin” + sprawozdanie 2013–2014
  e('Chara aspera', 'ramienica szorstka', 'charophyte'),
  e('Chara contraria', 'ramienica przeciwstawna', 'charophyte'),
  e('Chara filiformis', 'ramienica grzywiasta', 'charophyte'),
  e('Chara globularis', 'ramienica krucha', 'charophyte'),
  e('Chara fragilis', 'ramienica krucha (synonim)', 'charophyte', 'Chara globularis'),
  e('Chara hispida', 'ramienica kosmata (szczecinowata)', 'charophyte'),
  e('Chara intermedia', 'ramienica kolczasta', 'charophyte'),
  e('Chara polyacantha', 'ramienica wielokolczasta', 'charophyte'),
  e('Chara rudis', 'ramienica zwyczajna', 'charophyte'),
  e('Chara strigosa', 'ramienica zgrzebłowata', 'charophyte'),
  e('Chara tenuispina', 'ramienica cienkokolczasta', 'charophyte'),
  e('Chara tomentosa', 'ramienica omszona', 'charophyte'),
  e('Chara virgata', 'ramienica delikatna', 'charophyte'),
  e('Chara delicatula', 'ramienica delikatna (synonim)', 'charophyte', 'Chara virgata'),
  e('Chara vulgaris', 'ramienica pospolita', 'charophyte'),
  e('Lychnothamnus barbatus', 'lychnotamnus brodaty', 'charophyte'),
  e('Nitella capillaris', 'krynicznik włosowaty', 'charophyte'),
  e('Nitella flexilis', 'krynicznik giętki', 'charophyte'),
  e('Nitella gracilis', 'krynicznik smukły', 'charophyte'),
  e('Nitella mucronata', 'krynicznik kolczasty', 'charophyte'),
  e('Nitella opaca', 'krynicznik ćmy', 'charophyte'),
  e('Nitella syncarpa', 'krynicznik obskubany', 'charophyte'),
  e('Nitellopsis obtusa', 'krynicznica tępa', 'charophyte'),
  e('Tolypella glomerata', 'rozsocha skupiona', 'charophyte'),
  // gatunki wskazujące na degenerację (tab. 1, sprawozdania 2013–2014 i 2024)
  e('Ceratophyllum demersum', 'rogatek sztywny', 'expansive'),
  e('Ceratophyllum submersum', 'rogatek krótkoszyjkowy', 'expansive'),
  e('Potamogeton pectinatus', 'rdestnica grzebieniasta', 'expansive'),
  e('Stuckenia pectinata', 'rdestnica grzebieniasta (synonim)', 'expansive', 'Potamogeton pectinatus'),
  e('Myriophyllum spicatum', 'wywłócznik kłosowy', 'expansive'),
  e('Cladophora sp.', 'glony nitkowate', 'expansive'),
  e('Elodea canadensis', 'moczarka kanadyjska', 'alien'),
  e('Elodea nuttallii', 'moczarka delikatna', 'alien'),
  // inne rośliny typowe dla jezior ramienicowych
  e('Najas marina', 'jezierza morska', 'hydrophyte'),
  e('Nymphaea alba', 'grzybienie białe', 'hydrophyte'),
  e('Nuphar lutea', 'grążel żółty', 'hydrophyte'),
  e('Potamogeton natans', 'rdestnica pływająca', 'hydrophyte'),
  e('Potamogeton perfoliatus', 'rdestnica przeszyta', 'hydrophyte'),
  e('Potamogeton lucens', 'rdestnica połyskująca', 'hydrophyte'),
  e('Utricularia australis', 'pływacz zachodni', 'hydrophyte'),
  e('Utricularia vulgaris', 'pływacz zwyczajny', 'hydrophyte'),
  e('Cladium mariscus', 'kłoć wiechowata', 'reed'),
  e('Phragmites australis', 'trzcina pospolita', 'reed'),
]

const BY_NAME = new Map(SPECIES_3140.map((s) => [normalizeName(s.latin), s]))

export const findSpecies3140 = (name: string): SpeciesEntry3140 | undefined => BY_NAME.get(normalizeName(name))

/** Nazwa przyjęta taksonu (synonim → nazwa przyjęta), do liczenia gatunków bez dublowania. */
export const acceptedName3140 = (name: string): string => {
  const s = findSpecies3140(name)
  return s ? (s.accepted ?? s.latin) : name.trim()
}

/** Ramienica: z katalogu albo po rodzaju (Chara, Nitella, Nitellopsis, Tolypella, Lychnothamnus). */
export const isCharophyte3140 = (name: string): boolean =>
  findSpecies3140(name)?.group === 'charophyte' || /^(chara|nitella|nitellopsis|tolypella|lychnothamnus)\b/i.test(name.trim())

/** Wszystko w warstwie C – w wodzie nie ma drzew ani krzewów. */
export const defaultLayer3140 = (): Layer => 'C'
