// Słownik gatunków dla 1210 (kidzina na brzegu morskim), zebrany z przewodnika GIOŚ (Ogrodniczuk, Mróz 2015,
// rozdz. „Typowe gatunki roślin” i tab. 1), z przykładowej karty (Orzechowo, 2013) i ze sprawozdań z monitoringu
// 2013–2014, 2016–2018 i 2023–2025 (lista gatunków obcych, tab. 3 sprawozdania 2024). Kidzina to jednoroczne
// halofilne nitrofity na wale szczątków organicznych – w zdjęciu fitosocjologicznym wszystko ląduje w warstwie C.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup1210 =
  | 'characteristic' // 6 gatunków charakterystycznych wymienionych w tab. 1
  | 'companion' // inne gatunki kidzin i plaż (nitrofity, halofity, gatunki wydm inicjalnych)
  | 'alien' // obce geograficznie (antropofity) – wskaźnik „Występowanie gatunków obcych”
  | 'alienEco' // rodzime, ale obce ekologicznie: krzewy sadzone przez Urząd Morski do „stabilizacji” brzegu

export interface SpeciesEntry1210 {
  latin: string
  polish?: string
  group: SpeciesGroup1210
  /** Gatunek obcy o wyraźnej ekspansji – już jeden daje U2 we wskaźniku gatunków obcych. */
  expansive?: boolean
}

export const GROUP_LABELS_1210: Record<SpeciesGroup1210, string> = {
  characteristic: 'gatunek charakterystyczny 1210',
  companion: 'gatunek towarzyszący',
  alien: 'gatunek obcy geograficznie',
  alienEco: 'gatunek obcy ekologicznie (nasadzenia)',
}

const e = (latin: string, polish: string, group: SpeciesGroup1210, expansive = false): SpeciesEntry1210 => ({ latin, polish, group, expansive })

export const SPECIES_1210: SpeciesEntry1210[] = [
  // gatunki charakterystyczne (tab. 1 przewodnika) + synonimy spotykane w kartach
  e('Atriplex calotheca', 'łoboda zdobna', 'characteristic'),
  e('Atriplex littoralis', 'łoboda nadbrzeżna', 'characteristic'),
  e('Atriplex prostrata', 'łoboda oszczepowata', 'characteristic'),
  e('Atriplex prostrata subsp. prostrata', 'łoboda oszczepowata typowa', 'characteristic'),
  e('Cakile maritima', 'rukwiel nadmorska', 'characteristic'),
  e('Cakile maritima subsp. maritima', 'rukwiel nadmorska typowa', 'characteristic'),
  e('Matricaria maritima', 'maruna nadmorska', 'characteristic'),
  e('Tripleurospermum maritimum', 'maruna nadmorska', 'characteristic'),
  e('Salsola kali', 'solanka kolczysta', 'characteristic'),
  e('Salsola kali subsp. kali', 'solanka kolczysta typowa', 'characteristic'),
  // towarzyszące
  e('Atriplex glabriuscula', 'łoboda nagawa', 'companion'),
  e('Atriplex patula', 'łoboda rozłożysta', 'companion'),
  e('Chenopodium album', 'komosa biała', 'companion'),
  e('Honckenya peploides', 'honkenia piaskowa', 'companion'),
  e('Elymus farctus', 'perz sitowy', 'companion'),
  e('Leymus arenarius', 'wydmuchrzyca piaskowa', 'companion'),
  e('Ammophila arenaria', 'piaskownica zwyczajna', 'companion'),
  e('Polygonum aviculare', 'rdest ptasi', 'companion'),
  e('Senecio vulgaris', 'starzec zwyczajny', 'companion'),
  e('Tussilago farfara', 'podbiał pospolity', 'companion'),
  e('Juncus gerardii', 'sit Gerarda', 'companion'),
  e('Lycopus europaeus', 'karbieniec pospolity', 'companion'),
  e('Sonchus arvensis', 'mlecz polny', 'companion'),
  e('Potentilla anserina', 'pięciornik gęsi', 'companion'),
  e('Elymus repens', 'perz właściwy', 'companion'),
  e('Lathyrus japonicus subsp. maritimus', 'groszek nadmorski', 'companion'),
  e('Eryngium maritimum', 'mikołajek nadmorski', 'companion'),
  e('Phragmites australis', 'trzcina pospolita', 'companion'),
  e('Bolboschoenus maritimus', 'sitowiec nadmorski', 'companion'),
  // obce ekologicznie – rodzime krzewy wysadzane w ramach „stabilizacji” brzegu (przewodnik, przykład karty)
  e('Salix daphnoides', 'wierzba wawrzynkowa', 'alienEco'),
  e('Hippophaë rhamnoides', 'rokitnik zwyczajny', 'alienEco'),
  // obce geograficznie (sprawozdanie 2024, tab. 3)
  e('Rosa rugosa', 'róża pomarszczona', 'alien', true),
  e('Salix acutifolia', 'wierzba ostrolistna', 'alien', true),
  e('Reynoutria japonica', 'rdestowiec ostrokończysty', 'alien', true),
  e('Solidago gigantea', 'nawłoć późna', 'alien', true),
  e('Padus serotina', 'czeremcha amerykańska', 'alien', true),
  e('Acer negundo', 'klon jesionolistny', 'alien', true),
  e('Echinocystis lobata', 'kolczurka klapowana', 'alien', true),
  e('Impatiens parviflora', 'niecierpek drobnokwiatowy', 'alien', true),
  e('Xanthium albinum', 'rzepień brzegowy', 'alien'),
  e('Xanthium strumarium', 'rzepień pospolity', 'alien'),
  e('Bidens frondosa', 'uczep amerykański', 'alien'),
  e('Conyza canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Echinochloa crus-galli', 'chwastnica jednostronna', 'alien'),
  e('Datura stramonium', 'bieluń dziędzierzawa', 'alien'),
  e('Chenopodium strictum', 'komosa wzniesiona', 'alien'),
  e('Sonchus asper', 'mlecz kolczasty', 'alien'),
  e('Sonchus oleraceus', 'mlecz zwyczajny', 'alien'),
  e('Lycopersicon esculentum', 'pomidor zwyczajny', 'alien'),
  e('Lactuca serriola', 'sałata kompasowa', 'alien'),
  e('Lactuca tatarica', 'sałata tatarska', 'alien'),
  e('Juncus tenuis', 'sit chudy', 'alien'),
  e('Rumex confertus', 'szczaw omszony', 'alien'),
]

const BY_NAME = new Map(SPECIES_1210.map((s) => [normalizeName(s.latin), s]))

export const findSpecies1210 = (name: string): SpeciesEntry1210 | undefined => BY_NAME.get(normalizeName(name))

export const isCharacteristic1210 = (name: string) => findSpecies1210(name)?.group === 'characteristic'
export const isAlien1210 = (name: string) => {
  const g = findSpecies1210(name)?.group
  return g === 'alien' || g === 'alienEco'
}

/** Krzewy obce ekologicznie do warstwy B, reszta (jednoroczne nitrofity, byliny plaży) do C. */
export const defaultLayer1210 = (s: SpeciesEntry1210): Layer =>
  s.group === 'alienEco' || ['Rosa rugosa', 'Salix acutifolia', 'Padus serotina', 'Acer negundo'].includes(s.latin) ? 'B' : 'C'
