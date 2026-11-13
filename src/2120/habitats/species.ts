// Słownik gatunków dla 2120 (nadmorskie wydmy białe, Elymo-Ammophiletum), zebrany z przewodnika GIOŚ (Lemke 2015,
// rozdz. „Typowe gatunki roślin” i tab. 1), z przykładowej karty (Jezioro Wicko, 2013) i ze sprawozdań z monitoringu
// 2013–2014, 2016–2018 i 2023–2025 (gatunki nitrofilne – sprawozdanie 2018 i 2024; gatunki obce – tab. 3
// sprawozdania 2024). Wydma biała to murawa traw wydmotwórczych na ruchomym piasku – w zdjęciu fitosocjologicznym
// prawie wszystko ląduje w warstwie C; krzewy i drzewa sadzone do „stabilizacji” brzegu – w B.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup2120 =
  | 'characteristic' // gatunki charakterystyczne z tab. 1 i rozdz. „Typowe gatunki roślin” (z synonimami)
  | 'companion' // inne gatunki plaży i wydm (wydma inicjalna, wydma szara)
  | 'nitrophilous' // nitrofilne: liczba wskaźnikowa Ellenberga N 7–9 (tab. 1) i gatunki wskazane w sprawozdaniach
  | 'alien' // obce geograficznie (antropofity)
  | 'alienEco' // rodzime albo obce, ale obce ekologicznie: krzewy i drzewa sadzone przez Urząd Morski

export interface SpeciesEntry2120 {
  latin: string
  polish?: string
  group: SpeciesGroup2120
  /** Trawa wydmotwórcza – liczy się we wskaźniku „Kondycja i kwitnięcie/owocowanie gatunków traw”. */
  duneGrass?: boolean
  /** Drzewo albo krzew – domyślnie warstwa B. */
  woody?: boolean
}

export const GROUP_LABELS_2120: Record<SpeciesGroup2120, string> = {
  characteristic: 'gatunek charakterystyczny 2120',
  companion: 'gatunek towarzyszący',
  nitrophilous: 'gatunek nitrofilny (Ellenberg N 7–9)',
  alien: 'gatunek obcy geograficznie',
  alienEco: 'gatunek obcy ekologicznie (nasadzenia)',
}

const e = (latin: string, polish: string, group: SpeciesGroup2120, extra: Partial<SpeciesEntry2120> = {}): SpeciesEntry2120 => ({
  latin,
  polish,
  group,
  ...extra,
})
const grass = { duneGrass: true }
const woody = { woody: true }

export const SPECIES_2120: SpeciesEntry2120[] = [
  // gatunki charakterystyczne (tab. 1 przewodnika) + synonimy spotykane w kartach i sprawozdaniach
  e('Ammophila arenaria', 'piaskownica zwyczajna', 'characteristic', grass),
  e('Leymus arenarius', 'wydmuchrzyca piaskowa', 'characteristic', grass),
  e('Elymus arenarius', 'wydmuchrzyca piaskowa', 'characteristic', grass),
  e('× Calammophila baltica', 'trzcinnikownica nadbrzeżna', 'characteristic', grass),
  e('Ammocalamagrostis baltica', 'trzcinnikownica nadbrzeżna', 'characteristic', grass),
  e('Festuca villosa', 'kostrzewa kosmata', 'characteristic'),
  e('Festuca rubra subsp. arenaria', 'kostrzewa kosmata', 'characteristic'), // = Festuca arenaria, F. villosa
  e('Lathyrus japonicus subsp. maritimus', 'groszek nadmorski', 'characteristic'),
  e('Lathyrus maritimus', 'groszek nadmorski', 'characteristic'),
  e('Carex arenaria', 'turzyca piaskowa', 'characteristic'),
  e('Linaria odora', 'lnica wonna', 'characteristic'),
  e('Linaria loeselii', 'lnica wonna', 'characteristic'),
  e('Eryngium maritimum', 'mikołajek nadmorski', 'characteristic'),
  // towarzyszące – wydma inicjalna, wydma biała i szara
  e('Honckenya peploides', 'honkenia piaskowa', 'companion'),
  e('Cakile maritima', 'rukwiel nadmorska', 'companion'),
  e('Agropyron junceum', 'perz sitowy', 'companion', grass),
  e('Elymus farctus', 'perz sitowy', 'companion', grass),
  e('Festuca rubra', 'kostrzewa czerwona', 'companion'),
  e('Artemisia campestris subsp. sericea', 'bylica polna jedwabista', 'companion'),
  e('Artemisia campestris', 'bylica polna', 'companion'),
  e('Hieracium umbellatum', 'jastrzębiec baldaszkowaty', 'companion'),
  e('Petasites spurius', 'lepiężnik kutnerowaty', 'companion'),
  e('Corynephorus canescens', 'szczotlicha siwa', 'companion'),
  e('Jasione montana', 'jasieniec piaskowy', 'companion'),
  e('Helichrysum arenarium', 'kocanki piaskowe', 'companion'),
  e('Sedum acre', 'rozchodnik ostry', 'companion'),
  e('Hypochoeris radicata', 'prosienicznik szorstki', 'companion'),
  e('Epipactis sp.', 'kruszczyk', 'companion'),
  e('Epipactis atrorubens', 'kruszczyk rdzawoczerwony', 'companion'),
  e('Tussilago farfara', 'podbiał pospolity', 'companion'),
  e('Sonchus arvensis', 'mlecz polny', 'companion'),
  e('Oenothera biennis', 'wiesiołek dwuletni', 'companion'),
  e('Pinus sylvestris', 'sosna zwyczajna', 'companion', woody),
  // nitrofilne (Ellenberg N 7–9) – na wydmie zwykle jednoroczne, z wyrzuconej kidziny albo po eutrofizacji
  e('Cirsium vulgare', 'ostrożeń lancetowaty', 'nitrophilous'),
  e('Cirsium arvense', 'ostrożeń polny', 'nitrophilous'),
  e('Sisymbrium officinale', 'stulisz lekarski', 'nitrophilous'),
  e('Taraxacum officinale', 'mniszek lekarski', 'nitrophilous'),
  e('Urtica dioica', 'pokrzywa zwyczajna', 'nitrophilous'),
  e('Artemisia vulgaris', 'bylica pospolita', 'nitrophilous'),
  e('Chenopodium album', 'komosa biała', 'nitrophilous'),
  e('Atriplex prostrata', 'łoboda oszczepowata', 'nitrophilous'),
  e('Atriplex littoralis', 'łoboda nadbrzeżna', 'nitrophilous'),
  e('Galium aparine', 'przytulia czepna', 'nitrophilous'),
  e('Senecio vulgaris', 'starzec zwyczajny', 'nitrophilous'),
  e('Stellaria media', 'gwiazdnica pospolita', 'nitrophilous'),
  e('Elymus repens', 'perz właściwy', 'nitrophilous'),
  e('Sambucus nigra', 'bez czarny', 'nitrophilous', woody),
  // obce ekologicznie – krzewy i drzewa sadzone do „stabilizacji” brzegu (przewodnik, tab. 1; sprawozdanie 2024)
  e('Salix daphnoides', 'wierzba wawrzynkowa', 'alienEco', woody),
  e('Hippophaë rhamnoides', 'rokitnik zwyczajny', 'alienEco', woody),
  e('Pinus mugo', 'kosodrzewina', 'alienEco', woody),
  e('Pinus nigra', 'sosna czarna', 'alienEco', woody),
  e('Pinus uliginosa', 'sosna błotna', 'alienEco', woody),
  // obce geograficznie (przewodnik tab. 1 i sprawozdanie 2024, tab. 3)
  e('Rosa rugosa', 'róża pomarszczona', 'alien', woody),
  e('Salix acutifolia', 'wierzba ostrolistna', 'alien', woody),
  e('Padus serotina', 'czeremcha amerykańska', 'alien', woody),
  e('Impatiens parviflora', 'niecierpek drobnokwiatowy', 'alien'),
  e('Conyza canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Xanthium albinum', 'rzepień brzegowy', 'alien'),
  e('Lactuca tatarica', 'sałata tatarska', 'alien'),
  e('Rumex confertus', 'szczaw omszony', 'alien'),
]

const BY_NAME = new Map(SPECIES_2120.map((s) => [normalizeName(s.latin), s]))

/** Szukanie w katalogu – z „×” i bez (× Calammophila = Calammophila). */
export const findSpecies2120 = (name: string): SpeciesEntry2120 | undefined => {
  const n = normalizeName(name)
  return BY_NAME.get(n) ?? BY_NAME.get(`x ${n}`) ?? BY_NAME.get(n.replace(/^x /, ''))
}

export const isCharacteristic2120 = (name: string) => findSpecies2120(name)?.group === 'characteristic'
export const isNitrophilous2120 = (name: string) => findSpecies2120(name)?.group === 'nitrophilous'
export const isAlien2120 = (name: string) => {
  const g = findSpecies2120(name)?.group
  return g === 'alien' || g === 'alienEco'
}
export const isDuneGrass2120 = (name: string) => !!findSpecies2120(name)?.duneGrass

/** Drzewa i krzewy do warstwy B, reszta do C. */
export const defaultLayer2120 = (s: SpeciesEntry2120): Layer => (s.woody ? 'B' : 'C')
