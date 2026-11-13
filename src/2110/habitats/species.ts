// Słownik gatunków dla 2110 (inicjalne stadia nadmorskich wydm białych), zebrany z przewodnika GIOŚ (Lemke 2015,
// rozdz. „Typowe gatunki roślin” i tab. 1), z przykładowej karty (Świnoujście, 2013) i ze sprawozdań z monitoringu
// 2013–2014, 2016–2018 i 2023–2025 (lista gatunków obcych – tab. 3 sprawozdania 2024). Wydma inicjalna to rzadka
// murawa traw wydmotwórczych i kilku sukulentów na gołym piasku – w zdjęciu fitosocjologicznym prawie wszystko
// ląduje w warstwie C; krzewy sadzone do „stabilizacji” brzegu – w B.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup2110 =
  | 'characteristic' // 5 gatunków charakterystycznych z tab. 1 (z synonimami)
  | 'companion' // inne gatunki plaży i wydm (kidzina, wydma biała, wydma szara)
  | 'alien' // obce geograficznie (antropofity)
  | 'alienEco' // rodzime, ale obce ekologicznie: krzewy sadzone przez Urząd Morski do „stabilizacji” brzegu

export interface SpeciesEntry2110 {
  latin: string
  polish?: string
  group: SpeciesGroup2110
  /** Trawa wydmotwórcza – liczy się we wskaźniku „Kondycja i forma wzrostu wydmotwórczych gatunków traw”. */
  duneGrass?: boolean
}

export const GROUP_LABELS_2110: Record<SpeciesGroup2110, string> = {
  characteristic: 'gatunek charakterystyczny 2110',
  companion: 'gatunek towarzyszący',
  alien: 'gatunek obcy geograficznie',
  alienEco: 'gatunek obcy ekologicznie (nasadzenia)',
}

const e = (latin: string, polish: string, group: SpeciesGroup2110, duneGrass = false): SpeciesEntry2110 => ({ latin, polish, group, duneGrass })

export const SPECIES_2110: SpeciesEntry2110[] = [
  // gatunki charakterystyczne (tab. 1 przewodnika) + synonimy spotykane w kartach i sprawozdaniach
  e('Honckenya peploides', 'honkenia piaskowa', 'characteristic'),
  e('Cakile maritima', 'rukwiel nadmorska', 'characteristic'),
  e('Cakile maritima subsp. baltica', 'rukwiel nadmorska', 'characteristic'),
  e('Ammophila arenaria', 'piaskownica zwyczajna', 'characteristic', true),
  e('Leymus arenarius', 'wydmuchrzyca piaskowa', 'characteristic', true),
  e('Elymus arenarius', 'wydmuchrzyca piaskowa', 'characteristic', true),
  e('Agropyron junceum', 'perz sitowy', 'characteristic', true),
  e('Elymus farctus', 'perz sitowy', 'characteristic', true),
  e('Elytrigia juncea', 'perz sitowy', 'characteristic', true),
  // towarzyszące – trawy wydmy białej (wydmotwórcze, ale spoza listy z tab. 1)
  e('× Calammophila baltica', 'trzcinnikownica bałtycka', 'companion', true),
  e('Festuca villosa', 'kostrzewa kosmata', 'companion', true),
  e('Festuca rubra', 'kostrzewa czerwona', 'companion'),
  e('Festuca rubra subsp. arenaria', 'kostrzewa czerwona piaskowa', 'companion'),
  e('Carex arenaria', 'turzyca piaskowa', 'companion'),
  // towarzyszące – kidzina, plaża, wydma biała i szara
  e('Salsola kali', 'solanka kolczysta', 'companion'),
  e('Atriplex prostrata', 'łoboda oszczepowata', 'companion'),
  e('Atriplex littoralis', 'łoboda nadbrzeżna', 'companion'),
  e('Atriplex calotheca', 'łoboda zdobna', 'companion'),
  e('Matricaria maritima', 'maruna nadmorska', 'companion'),
  e('Lathyrus japonicus subsp. maritimus', 'groszek nadmorski', 'companion'),
  e('Eryngium maritimum', 'mikołajek nadmorski', 'companion'),
  e('Sonchus arvensis', 'mlecz polny', 'companion'),
  e('Hieracium umbellatum', 'jastrzębiec baldaszkowaty', 'companion'),
  e('Jasione montana', 'jasieniec piaskowy', 'companion'),
  e('Corynephorus canescens', 'szczotlicha siwa', 'companion'),
  e('Petasites spurius', 'lepiężnik kutnerowaty', 'companion'),
  e('Tussilago farfara', 'podbiał pospolity', 'companion'),
  e('Elymus repens', 'perz właściwy', 'companion'),
  e('Polygonum aviculare', 'rdest ptasi', 'companion'),
  e('Senecio vulgaris', 'starzec zwyczajny', 'companion'),
  e('Oenothera biennis', 'wiesiołek dwuletni', 'companion'),
  // obce ekologicznie – rodzime krzewy wysadzane w ramach „stabilizacji” brzegu (przewodnik, tab. 1)
  e('Salix daphnoides', 'wierzba wawrzynkowa', 'alienEco'),
  e('Hippophaë rhamnoides', 'rokitnik zwyczajny', 'alienEco'),
  // obce geograficznie (przewodnik tab. 1 i sprawozdanie 2024, tab. 3)
  e('Rosa rugosa', 'róża pomarszczona', 'alien'),
  e('Salix acutifolia', 'wierzba ostrolistna', 'alien'),
  e('Xanthium albinum', 'rzepień brzegowy', 'alien'),
  e('Xanthium strumarium', 'rzepień pospolity', 'alien'),
  e('Lactuca tatarica', 'sałata tatarska', 'alien'),
  e('Senecio vernalis', 'starzec wiosenny', 'alien'),
  e('Conyza canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Bidens frondosa', 'uczep amerykański', 'alien'),
  e('Amaranthus retroflexus', 'szarłat szorstki', 'alien'),
  e('Digitaria sanguinalis', 'palusznik krwawy', 'alien'),
  e('Diplotaxis tenuifolia', 'dwurząd wąskolistny', 'alien'),
  e('Helianthus annuus', 'słonecznik zwyczajny', 'alien'),
  e('Padus serotina', 'czeremcha amerykańska', 'alien'),
]

const BY_NAME = new Map(SPECIES_2110.map((s) => [normalizeName(s.latin), s]))

/** Szukanie w katalogu – z „×” i bez (× Calammophila = Calammophila). */
export const findSpecies2110 = (name: string): SpeciesEntry2110 | undefined => {
  const n = normalizeName(name)
  return BY_NAME.get(n) ?? BY_NAME.get(`x ${n}`) ?? BY_NAME.get(n.replace(/^x /, ''))
}

export const isCharacteristic2110 = (name: string) => findSpecies2110(name)?.group === 'characteristic'
export const isAlien2110 = (name: string) => {
  const g = findSpecies2110(name)?.group
  return g === 'alien' || g === 'alienEco'
}
export const isDuneGrass2110 = (name: string) => !!findSpecies2110(name)?.duneGrass

/** Krzewy (obce ekologicznie, róża, wierzba ostrolistna, czeremcha) do warstwy B, reszta do C. */
export const defaultLayer2110 = (s: SpeciesEntry2110): Layer =>
  s.group === 'alienEco' || ['Rosa rugosa', 'Salix acutifolia', 'Padus serotina'].includes(s.latin) ? 'B' : 'C'
