// Słownik gatunków dla 1230 (klify na wybrzeżu Bałtyku), zebrany z przewodnika GIOŚ (Łabuz 2012, rozdz.
// „Identyfikatory fitosocjologiczne”, „Typowe gatunki roślin”, tab. 1 – wskaźniki botaniczne), z przykładowej karty
// (Rozewie 1, 2011) i ze sprawozdań z monitoringu 2016–2018 i 2023 (gatunki obce, ekspansywne).
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup1230 =
  | 'clay' // pionierskie i utrwalające na glinie (podbiał, ostrożeń, skrzyp, kupkówka)
  | 'sand' // pionierskie i murawowe na piasku (przelot, trzcinnik, szczotlicha, kostrzewy)
  | 'psammo' // psammofity i halofity podnóża (piaskownica, wydmuchrzyca, honkenia, rukwiel)
  | 'herb' // inne zielne typowe (runo buczyn i łęgów na klifach martwych)
  | 'shrub' // krzewy charakterystyczne
  | 'tree' // drzewa charakterystyczne
  | 'alien' // obce, w tym inwazyjne
  | 'expansive' // rodzime ekspansywne

export interface SpeciesEntry1230 {
  latin: string
  polish?: string
  group: SpeciesGroup1230
}

export const GROUP_LABELS_1230: Record<SpeciesGroup1230, string> = {
  clay: 'zielna klifu gliniastego',
  sand: 'zielna klifu piaszczystego',
  psammo: 'psammofit / halofit podnóża',
  herb: 'zielna typowa',
  shrub: 'krzew charakterystyczny',
  tree: 'drzewo charakterystyczne',
  alien: 'gatunek obcy',
  expansive: 'rodzimy ekspansywny',
}

const e = (latin: string, polish: string, group: SpeciesGroup1230): SpeciesEntry1230 => ({ latin, polish, group })

export const SPECIES_1230: SpeciesEntry1230[] = [
  // glina: pierwsza faza sukcesji i utrwalanie (tab. 1)
  e('Tussilago farfara', 'podbiał pospolity', 'clay'),
  e('Cirsium arvense', 'ostrożeń polny', 'clay'),
  e('Equisetum arvense', 'skrzyp polny', 'clay'),
  e('Dactylis glomerata', 'kupkówka pospolita', 'clay'),
  e('Lathyrus pratensis', 'groszek łąkowy', 'clay'),
  e('Poa compressa', 'wiechlina spłaszczona', 'clay'),
  // piasek: pierwsza faza i murawy
  e('Calamagrostis epigejos', 'trzcinnik piaskowy', 'sand'),
  e('Anthyllis vulneraria', 'przelot pospolity', 'sand'),
  e('Anthyllis vulneraria subsp. maritima', 'przelot pospolity nadmorski', 'sand'),
  e('Trifolium arvense', 'koniczyna polna', 'sand'),
  e('Corynephorus canescens', 'szczotlicha siwa', 'sand'),
  e('Festuca ovina', 'kostrzewa owcza', 'sand'),
  e('Festuca rubra', 'kostrzewa czerwona', 'sand'),
  e('Jasione montana', 'jasieniec piaskowy', 'sand'),
  e('Hieracium umbellatum', 'jastrzębiec baldaszkowaty', 'sand'),
  e('Sedum acre', 'rozchodnik ostry', 'sand'),
  e('Helichrysum arenarium', 'kocanki piaskowe', 'sand'),
  e('Artemisia campestris', 'bylica polna', 'sand'),
  e('Bromus hordeaceus', 'stokłosa miękka', 'sand'),
  e('Myosotis ramosissima', 'niezapominajka pagórkowa', 'sand'),
  e('Rumex thyrsiflorus', 'szczaw rozpierzchły', 'sand'),
  e('Petasites spurius', 'lepiężnik kutnerowaty', 'sand'),
  // psammofity i halofity podnóża
  e('Festuca arenaria', 'kostrzewa piaskowa', 'psammo'),
  e('Ammophila arenaria', 'piaskownica zwyczajna', 'psammo'),
  e('Leymus arenarius', 'wydmuchrzyca piaskowa', 'psammo'),
  e('Honckenya peploides', 'honkenia piaskowa', 'psammo'),
  e('Cakile maritima', 'rukwiel nadmorska', 'psammo'),
  e('Salsola kali', 'solanka kolczysta', 'psammo'),
  // runo klifów martwych (buczyny, łęg)
  e('Galium aparine', 'przytulia czepna', 'herb'),
  e('Torilis japonica', 'kłobuczka pospolita', 'herb'),
  e('Hedera helix', 'bluszcz pospolity', 'herb'),
  e('Deschampsia flexuosa', 'śmiałek pogięty', 'herb'),
  e('Fragaria vesca', 'poziomka pospolita', 'herb'),
  e('Viola odorata', 'fiołek wonny', 'herb'),
  e('Galium odoratum', 'przytulia wonna', 'herb'),
  e('Luzula pilosa', 'kosmatka owłosiona', 'herb'),
  e('Polypodium vulgare', 'paprotka zwyczajna', 'herb'),
  e('Phragmites australis', 'trzcina pospolita', 'expansive'),
  e('Pteridium aquilinum', 'orlica pospolita', 'expansive'),
  e('Rubus caesius', 'jeżyna popielica', 'expansive'),
  // krzewy
  e('Hippophae rhamnoides', 'rokitnik zwyczajny', 'shrub'),
  e('Rosa canina', 'róża dzika', 'shrub'),
  e('Crataegus monogyna', 'głóg jednoszyjkowy', 'shrub'),
  e('Prunus spinosa', 'tarnina', 'shrub'),
  e('Rhamnus cathartica', 'szakłak pospolity', 'shrub'),
  e('Sambucus nigra', 'bez czarny', 'shrub'),
  e('Corylus avellana', 'leszczyna pospolita', 'shrub'),
  e('Salix caprea', 'wierzba iwa', 'shrub'),
  e('Salix cinerea', 'wierzba szara', 'shrub'),
  e('Ribes spicatum', 'porzeczka skandynawska', 'shrub'),
  // drzewa
  e('Fagus sylvatica', 'buk zwyczajny', 'tree'),
  e('Pinus sylvestris', 'sosna zwyczajna', 'tree'),
  e('Sorbus aucuparia', 'jarząb pospolity', 'tree'),
  e('Acer pseudoplatanus', 'klon jawor', 'tree'),
  e('Acer platanoides', 'klon zwyczajny', 'tree'),
  e('Fraxinus excelsior', 'jesion wyniosły', 'tree'),
  e('Ulmus glabra', 'wiąz górski', 'tree'),
  e('Populus tremula', 'topola osika', 'tree'),
  e('Betula pendula', 'brzoza brodawkowata', 'tree'),
  e('Quercus robur', 'dąb szypułkowy', 'tree'),
  e('Quercus petraea', 'dąb bezszypułkowy', 'tree'),
  e('Padus avium', 'czeremcha zwyczajna', 'tree'),
  e('Malus sylvestris', 'jabłoń dzika', 'tree'),
  // obce (sprawozdania 2017 i 2023)
  e('Robinia pseudoacacia', 'robinia akacjowa', 'alien'),
  e('Padus serotina', 'czeremcha amerykańska', 'alien'),
  e('Salix acutifolia', 'wierzba ostrolistna', 'alien'),
  e('Rosa rugosa', 'róża pomarszczona', 'alien'),
  e('Reynoutria japonica', 'rdestowiec ostrokończysty', 'alien'),
  e('Cornus alba', 'dereń biały', 'alien'),
  e('Cotoneaster horizontalis', 'irga pozioma', 'alien'),
  e('Larix kaempferi', 'modrzew japoński', 'alien'),
  e('Pinus nigra', 'sosna czarna', 'alien'),
  e('Populus ×berolinensis', 'topola berlińska', 'alien'),
  e('Solidago canadensis', 'nawłoć kanadyjska', 'alien'),
  e('Conyza canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Senecio vulgaris', 'starzec zwyczajny', 'alien'),
  e('Lactuca serriola', 'sałata kompasowa', 'alien'),
  e('Setaria viridis', 'włośnica zielona', 'alien'),
]

const BY_NAME = new Map(SPECIES_1230.map((s) => [normalizeName(s.latin), s]))

export const findSpecies1230 = (name: string): SpeciesEntry1230 | undefined => BY_NAME.get(normalizeName(name))

/** Warstwa domyślna w profilu: drzewa A, krzewy B, reszta C. Obce drzewiaste też w B (zwykle podrost i zarośla). */
export const defaultLayer1230 = (s: SpeciesEntry1230): Layer => (s.group === 'tree' ? 'A' : s.group === 'shrub' ? 'B' : 'C')
