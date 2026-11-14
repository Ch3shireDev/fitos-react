// Słownik gatunków dla 6110 (skały wapienne i neutrofilne z roślinnością pionierską Alysso-Sedion), zebrany z przewodnika
// GIOŚ (Świerkosz, Szczęśniak, Reczyńska 2010, pkt 4 „Typowe gatunki roślin”, tab. 1), z karty przykładowej (Wapniarka, 2008)
// i ze sprawozdań z monitoringu 2006–2008, 2013–2014, 2015–2018 i 2024 (drzewa i krzewy zarastające skałki, gatunki
// ekspansywne, gatunki obce).
// Drzewa i krzewy – warstwa B, rośliny zielne – C, mchy i porosty – D.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup6110 =
  | 'characteristic' // gatunki charakterystyczne zespołów i związku Alysso-Sedion (tab. 1) – liczą się do wskaźnika
  | 'typicalDominant' // typowe dominanty muraw (tab. 1): kostrzewa owcza, zęboróg purpurowy – nie są charakterystyczne
  | 'typical' // gatunki typowe/towarzyszące muraw naskalnych – NIE są charakterystyczne (sprawozdanie 2024)
  | 'shade' // gatunki wkraczające przy ocienieniu (tab. 1: rokietnik cyprysowaty, wiechlina gajowa)
  | 'woody' // drzewa i krzewy – wskaźnik „Ekspansja krzewów i podrostu drzew”
  | 'expansive' // rodzime gatunki ekspansywne roślin zielnych
  | 'alien' // obce gatunki inwazyjne
  | 'companion' // pozostałe

export interface SpeciesEntry6110 {
  latin: string
  polish?: string
  group: SpeciesGroup6110
  /** Mech albo porost – warstwa D. */
  moss?: boolean
}

export const GROUP_LABELS_6110: Record<SpeciesGroup6110, string> = {
  characteristic: 'gatunek charakterystyczny Alysso-Sedion (tab. 1)',
  typicalDominant: 'typowy dominant muraw naskalnych (nie charakterystyczny)',
  typical: 'gatunek typowy muraw naskalnych – nie charakterystyczny',
  shade: 'gatunek wkraczający przy ocienieniu',
  woody: 'drzewo/krzew – „Ekspansja krzewów i podrostu drzew”',
  expansive: 'rodzimy gatunek ekspansywny',
  alien: 'gatunek obcy inwazyjny',
  companion: 'gatunek towarzyszący',
}

const e = (latin: string, polish: string, group: SpeciesGroup6110, extra: Partial<SpeciesEntry6110> = {}): SpeciesEntry6110 => ({ latin, polish, group, ...extra })
const M = { moss: true }

export const SPECIES_6110: SpeciesEntry6110[] = [
  // gatunki charakterystyczne (tab. 1; synonimy liczone raz – klucz to nazwa polska)
  e('Jovibarba sobolifera', 'rojownik pospolity', 'characteristic'),
  e('Sempervivum soboliferum', 'rojownik pospolity', 'characteristic'),
  e('Poa compressa', 'wiechlina spłaszczona', 'characteristic'),
  e('Cerastium pumilum', 'rogownica drobna', 'characteristic'),
  e('Alyssum alyssoides', 'smagliczka kielichowata', 'characteristic'),
  e('Acinos arvensis', 'czyścica drobnokwiatowa', 'characteristic'),
  e('Clinopodium acinos', 'czyścica drobnokwiatowa', 'characteristic'),
  e('Teucrium botrys', 'ożanka pierzastosieczna', 'characteristic'),
  e('Sedum acre', 'rozchodnik ostry', 'characteristic'),
  e('Sedum reflexum', 'rozchodnik ościsty', 'characteristic'),
  e('Sedum rupestre', 'rozchodnik ościsty', 'characteristic'),
  e('Sedum sexangulare', 'rozchodnik sześciorzędowy', 'characteristic'),
  e('Sedum maximum', 'rozchodnik wielki', 'characteristic'),
  e('Hylotelephium maximum', 'rozchodnik wielki', 'characteristic'),
  e('Sedum album', 'rozchodnik biały', 'characteristic'),
  e('Saxifraga tridactylites', 'skalnica trójpalczasta', 'characteristic'),
  e('Allium montanum', 'czosnek skalny', 'characteristic'),
  e('Allium senescens subsp. montanum', 'czosnek skalny', 'characteristic'),

  // typowe dominanty (tab. 1), ale nie gatunki charakterystyczne
  e('Festuca ovina', 'kostrzewa owcza', 'typicalDominant'),
  e('Ceratodon purpureus', 'zęboróg purpurowy', 'typicalDominant', M),

  // gatunki typowe muraw naskalnych – w 2013–2018 bywały liczone jako charakterystyczne, sprawozdanie 2024 to prostuje
  e('Melica transsilvanica', 'perłówka siedmiogrodzka', 'typical'),
  e('Sanguisorba minor', 'krwiściąg mniejszy', 'typical'),
  e('Arenaria serpyllifolia', 'piaskowiec macierzankowy', 'typical'),
  e('Echium vulgare', 'żmijowiec zwyczajny', 'typical'),
  e('Rumex acetosella', 'szczaw polny', 'typical'),
  e('Scabiosa ochroleuca', 'driakiew żółtawa', 'typical'),
  e('Thymus pulegioides', 'macierzanka zwyczajna', 'typical'),
  e('Euphorbia cyparissias', 'wilczomlecz sosnka', 'typical'),
  e('Potentilla argentea', 'pięciornik srebrny', 'typical'),
  e('Hieracium pilosella', 'jastrzębiec kosmaczek', 'typical'),
  e('Brachythecium albicans', 'krótkosz bielawy', 'typical', M),
  e('Tortula muralis', 'pędzlik murowy', 'typical', M),
  e('Bryum argenteum', 'prątnik srebrzysty', 'typical', M),
  e('Polytrichum piliferum', 'płonnik włosisty', 'typical', M),
  e('Cladonia fimbriata', 'chrobotek strzępiasty', 'typical', M),

  // wkraczające przy ocienieniu (tab. 1)
  e('Hypnum cupressiforme', 'rokietnik cyprysowaty', 'shade', M),
  e('Poa nemoralis', 'wiechlina gajowa', 'shade'),

  // drzewa i krzewy (tab. 1 i sprawozdania 2018, 2024)
  e('Betula pendula', 'brzoza brodawkowata', 'woody'),
  e('Salix caprea', 'wierzba iwa', 'woody'),
  e('Crataegus monogyna', 'głóg jednoszyjkowy', 'woody'),
  e('Rosa canina', 'róża dzika', 'woody'),
  e('Rosa sp.', 'róża', 'woody'),
  e('Prunus spinosa', 'tarnina', 'woody'),
  e('Berberis vulgaris', 'berberys zwyczajny', 'woody'),
  e('Fraxinus excelsior', 'jesion wyniosły', 'woody'),
  e('Sorbus aucuparia', 'jarząb pospolity', 'woody'),
  e('Rubus idaeus', 'malina właściwa', 'woody'),
  e('Pinus sylvestris', 'sosna zwyczajna', 'woody'),
  e('Abies alba', 'jodła pospolita', 'woody'),
  e('Acer pseudoplatanus', 'klon jawor', 'woody'),
  e('Picea abies', 'świerk pospolity', 'woody'),
  e('Corylus avellana', 'leszczyna pospolita', 'woody'),
  e('Cornus sanguinea', 'dereń świdwa', 'woody'),
  e('Larix decidua', 'modrzew europejski', 'woody'),
  e('Ulmus glabra', 'wiąz górski', 'woody'),
  e('Frangula alnus', 'kruszyna pospolita', 'woody'),
  e('Cerasus avium', 'czereśnia', 'woody'),
  e('Quercus robur', 'dąb szypułkowy', 'woody'),

  // rodzime gatunki ekspansywne roślin zielnych (tab. 1, karta Wapniarka, sprawozdania 2018 i 2024)
  e('Calamagrostis epigejos', 'trzcinnik piaskowy', 'expansive'),
  e('Brachypodium pinnatum', 'kłosownica pierzasta', 'expansive'),
  e('Artemisia vulgaris', 'bylica pospolita', 'expansive'),
  e('Chamaenerion palustre', 'wierzbówka nadrzeczna', 'expansive'),
  e('Rubus sp.', 'jeżyna', 'expansive'),
  e('Urtica dioica', 'pokrzywa zwyczajna', 'expansive'),

  // obce gatunki inwazyjne (tab. 1, sprawozdanie 2024, tab. 3)
  e('Conyza canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Erigeron canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Erigeron annuus', 'przymiotno białe', 'alien'),
  e('Solidago gigantea', 'nawłoć późna', 'alien'),
  e('Solidago canadensis', 'nawłoć kanadyjska', 'alien'),
  e('Robinia pseudoacacia', 'robinia akacjowa', 'alien'),
  e('Padus serotina', 'czeremcha amerykańska', 'alien'),
  e('Prunus serotina', 'czeremcha amerykańska', 'alien'),
  e('Lupinus polyphyllus', 'łubin trwały', 'alien'),
  e('Impatiens parviflora', 'niecierpek drobnokwiatowy', 'alien'),
  e('Sedum spurium', 'rozchodnik kaukaski', 'alien'),
  e('Lactuca serriola', 'sałata kompasowa', 'alien'),

  // towarzyszące (zdjęcia z karty Wapniarka)
  e('Campanula rotundifolia', 'dzwonek okrągłolistny', 'companion'),
  e('Geranium robertianum', 'bodziszek cuchnący', 'companion'),
  e('Origanum vulgare', 'lebiodka pospolita', 'companion'),
  e('Fragaria vesca', 'poziomka pospolita', 'companion'),
  e('Asplenium viride', 'zanokcica zielona', 'companion'),
]

const BY_NAME = new Map(SPECIES_6110.map((s) => [normalizeName(s.latin), s]))

export const findSpecies6110 = (name: string): SpeciesEntry6110 | undefined => BY_NAME.get(normalizeName(name))

/** Klucz gatunku do liczenia: synonimy (Jovibarba/Sempervivum, Acinos/Clinopodium…) dają ten sam klucz – nazwę polską. */
export const speciesKey6110 = (name: string) => findSpecies6110(name)?.polish ?? normalizeName(name)

const groupOf = (name: string) => findSpecies6110(name)?.group
export const isCharacteristic6110 = (name: string) => groupOf(name) === 'characteristic'
/** Dominant zgodny z tab. 1: gatunek charakterystyczny albo typowy dominant (kostrzewa owcza, zęboróg purpurowy). */
export const isTypicalDominant6110 = (name: string) => ['characteristic', 'typicalDominant'].includes(groupOf(name) ?? '')
export const isWoody6110 = (name: string) => groupOf(name) === 'woody'
export const isAlien6110 = (name: string) => groupOf(name) === 'alien'
export const isExpansive6110 = (name: string) => groupOf(name) === 'expansive'

/** Drzewa i krzewy do B, mchy i porosty do D, reszta do C. */
export const defaultLayer6110 = (s: SpeciesEntry6110): Layer => (s.group === 'woody' ? 'B' : s.moss ? 'D' : 'C')
