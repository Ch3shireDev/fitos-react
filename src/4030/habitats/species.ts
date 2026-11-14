// Słownik gatunków dla 4030 (suche wrzosowiska), zebrany z przewodnika GIOŚ (Pawlaczyk 2012, rozdz. „Typowe gatunki
// roślin”, tab. 1 i przykładowa karta Duchny Młode I, 2011) oraz ze sprawozdań z monitoringu 2009–2011, 2016–2018
// i 2020–2021 (gatunki obce i ekspansywne). Wrzosowisko to krzewinki (wrzos, mącznica) z niskimi roślinami zielnymi
// w warstwie C i mchami/porostami w D; nalot sosny i brzozy – w B (albo w C, gdy niski).
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup4030 =
  | 'key' // gatunki kluczowe: wrzos i mącznica lekarska
  | 'expansive' // rodzime gatunki ekspansywne (apofity)
  | 'alien' // gatunki obce geograficznie
  | 'tree' // rodzime drzewa – zarośnięcie przez drzewa
  | 'shrub' // rodzime krzewy – nie liczą się do „zarośnięcia przez drzewa”
  | 'local' // gatunki kluczowe dla różnorodności (wskaźnik fakultatywny), np. widłak goździsty
  | 'companion' // inne gatunki wrzosowisk

export interface SpeciesEntry4030 {
  latin: string
  polish?: string
  group: SpeciesGroup4030
  /** Trawa (Poaceae) – liczy się do wskaźnika „Pokrycie traw”, niezależnie od grupy. */
  grass?: boolean
  /** Drzewo (także obce, np. czeremcha amerykańska) – liczy się do „Zarośnięcia przez drzewa”. */
  tree?: boolean
  /** Mszak albo porost – w zdjęciu warstwa D. */
  cryptogam?: boolean
  /** Wymieniony w tab. 1 przewodnika; bez tego – z praktyki sprawozdań. */
  tab1?: boolean
}

export const GROUP_LABELS_4030: Record<SpeciesGroup4030, string> = {
  key: 'gatunek kluczowy wrzosowiska',
  expansive: 'ekspansywny gatunek rodzimy (apofit)',
  alien: 'gatunek obcy geograficznie',
  tree: 'drzewo (zarośnięcie przez drzewa)',
  shrub: 'krzew',
  local: 'gatunek kluczowy dla różnorodności (wskaźnik fakultatywny)',
  companion: 'gatunek towarzyszący',
}

const e = (latin: string, polish: string, group: SpeciesGroup4030, extra: Partial<SpeciesEntry4030> = {}): SpeciesEntry4030 => ({ latin, polish, group, ...extra })
const D = { cryptogam: true }
const G = { grass: true }

export const SPECIES_4030: SpeciesEntry4030[] = [
  // gatunki kluczowe
  e('Calluna vulgaris', 'wrzos zwyczajny', 'key'),
  e('Arctostaphylos uva-ursi', 'mącznica lekarska', 'key'),
  e('Arctostaphyllos uva-ursi', 'mącznica lekarska', 'key'), // pisownia z karty przykładowej

  // trawy (Poaceae) – wskaźnik „Pokrycie traw”
  e('Festuca ovina', 'kostrzewa owcza', 'companion', G),
  e('Festuca rubra', 'kostrzewa czerwona', 'companion', G),
  e('Festuca psammophila', 'kostrzewa piaskowa', 'companion', G),
  e('Agrostis capillaris', 'mietlica pospolita', 'companion', G),
  e('Agrostis vinealis', 'mietlica piaskowa', 'companion', G),
  e('Deschampsia flexuosa', 'śmiałek pogięty', 'companion', G),
  e('Avenella flexuosa', 'śmiałek pogięty', 'companion', G),
  e('Danthonia decumbens', 'izgrzyca przyziemna', 'companion', G),
  e('Nardus stricta', 'bliźniczka psia trawka', 'companion', G),
  e('Anthoxanthum odoratum', 'tomka wonna', 'companion', G),
  e('Corynephorus canescens', 'szczotlicha siwa', 'companion', G),
  e('Koeleria glauca', 'strzęplica sina', 'companion', G),
  e('Poa pratensis', 'wiechlina łąkowa', 'companion', G),
  e('Calamagrostis epigejos', 'trzcinnik piaskowy', 'expansive', { ...G, tab1: true }),
  e('Molinia caerulea', 'trzęślica modra', 'expansive', G),
  e('Molinia coerulea', 'trzęślica modra', 'expansive', G),
  e('Elymus repens', 'perz właściwy', 'expansive', G),

  // ekspansywne rodzime (apofity)
  e('Rubus spp.', 'jeżyny', 'expansive', { tab1: true }),
  e('Rubus plicatus', 'jeżyna fałdowana', 'expansive'),
  e('Vincetoxicum hirundinaria', 'ciemiężyk białokwiatowy', 'expansive', { tab1: true }),
  e('Pteridium aquilinum', 'orlica pospolita', 'expansive'),
  e('Tanacetum vulgare', 'wrotycz pospolity', 'expansive'),
  e('Cytisus scoparius', 'żarnowiec miotlasty', 'expansive'),
  e('Sarothamnus scoparius', 'żarnowiec miotlasty', 'expansive'),
  e('Artemisia campestris', 'bylica polna', 'expansive'),

  // obce geograficznie
  e('Padus serotina', 'czeremcha amerykańska', 'alien', { tree: true, tab1: true }),
  e('Prunus serotina', 'czeremcha amerykańska', 'alien', { tree: true }),
  e('Conyza canadensis', 'przymiotno kanadyjskie', 'alien', { tab1: true }),
  e('Erigeron canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Lupinus polyphyllus', 'łubin trwały', 'alien', { tab1: true }),
  e('Solidago gigantea', 'nawłoć późna', 'alien', { tab1: true }),
  e('Solidago canadensis', 'nawłoć kanadyjska', 'alien'),
  e('Erigeron annuus', 'przymiotno białe', 'alien'),
  e('Senecio vernalis', 'starzec wiosenny', 'alien'),
  e('Setaria viridis', 'włośnica zielona', 'alien', G),
  e('Digitaria sanguinalis', 'palusznik krwawy', 'alien', G),
  e('Corispermum leptopterum', 'wielbłądka cienkoskrzydełkowa', 'alien'),
  e('Campylopus introflexus', 'krzywoszczeć przywłoka', 'alien', D),
  e('Robinia pseudoacacia', 'robinia akacjowa', 'alien', { tree: true }),
  e('Quercus rubra', 'dąb czerwony', 'alien', { tree: true }),
  e('Pinus banksiana', 'sosna Banksa', 'alien', { tree: true }),
  e('Amelanchier spicata', 'świdośliwa kłosowa', 'alien'),

  // rodzime drzewa
  e('Pinus sylvestris', 'sosna zwyczajna', 'tree'),
  e('Betula pendula', 'brzoza brodawkowata', 'tree'),
  e('Betula pubescens', 'brzoza omszona', 'tree'),
  e('Populus tremula', 'topola osika', 'tree'),
  e('Quercus robur', 'dąb szypułkowy', 'tree'),
  e('Quercus petraea', 'dąb bezszypułkowy', 'tree'),
  e('Sorbus aucuparia', 'jarząb pospolity', 'tree'),

  // rodzime krzewy
  e('Juniperus communis', 'jałowiec pospolity', 'shrub'),
  e('Frangula alnus', 'kruszyna pospolita', 'shrub'),
  e('Salix repens', 'wierzba płożąca', 'shrub'),

  // gatunki kluczowe dla różnorodności (fakultatywny)
  e('Lycopodium clavatum', 'widłak goździsty', 'local'),
  e('Diphasiastrum complanatum', 'widlicz spłaszczony', 'local'),

  // gatunki towarzyszące
  e('Genista germanica', 'janowiec ciernisty', 'companion'),
  e('Genista pilosa', 'janowiec włosisty', 'companion'),
  e('Genista tinctoria', 'janowiec barwierski', 'companion'),
  e('Hieracium pilosella', 'jastrzębiec kosmaczek', 'companion'),
  e('Pilosella officinarum', 'jastrzębiec kosmaczek', 'companion'),
  e('Hypericum perforatum', 'dziurawiec zwyczajny', 'companion'),
  e('Rumex acetosella', 'szczaw polny', 'companion'),
  e('Solidago virgaurea', 'nawłoć pospolita', 'companion'),
  e('Thymus serpyllum', 'macierzanka piaskowa', 'companion'),
  e('Viola canina', 'fiołek psi', 'companion'),
  e('Veronica officinalis', 'przetacznik leśny', 'companion'),
  e('Euphrasia micrantha', 'świetlik wątły', 'companion'),
  e('Carex ericetorum', 'turzyca wrzosowiskowa', 'companion'),
  e('Carex arenaria', 'turzyca piaskowa', 'companion'),
  e('Carex pilulifera', 'turzyca pigułkowata', 'companion'),
  e('Jasione montana', 'jasieniec piaskowy', 'companion'),
  e('Vaccinium myrtillus', 'borówka czarna', 'companion'),
  e('Vaccinium vitis-idaea', 'borówka brusznica', 'companion'),
  e('Vaccinium uliginosum', 'borówka bagienna', 'companion'),
  e('Empetrum nigrum', 'bażyna czarna', 'companion'),
  e('Drosera rotundifolia', 'rosiczka okrągłolistna', 'companion'),
  e('Scabiosa canescens', 'driakiew wonna', 'companion'),
  e('Dianthus carthusianorum', 'goździk kartuzek', 'companion'),
  e('Potentilla erecta', 'pięciornik kurze ziele', 'companion'),
  e('Galium saxatile', 'przytulia hercyńska', 'companion'),
  e('Antennaria dioica', 'ukwap dwupienny', 'companion'),
  e('Pohlia nutans', 'knotnik zwisły', 'companion', D),
  e('Pleurozium schreberi', 'rokietnik pospolity', 'companion', D),
  e('Dicranum scoparium', 'widłoząb miotlasty', 'companion', D),
  e('Hypnum jutlandicum', 'rokiet jutlandzki', 'companion', D),
  e('Polytrichum piliferum', 'płonnik włosisty', 'companion', D),
  e('Polytrichum juniperinum', 'płonnik jałowcowaty', 'companion', D),
  e('Ceratodon purpureus', 'zęboróg purpurowy', 'companion', D),
  e('Cladonia spp.', 'chrobotki', 'companion', D),
  e('Cetraria islandica', 'płucnica islandzka', 'companion', D),
  e('Cetraria aculeata', 'płucnica kolczasta', 'companion', D),
]

const BY_NAME = new Map(SPECIES_4030.map((s) => [normalizeName(s.latin), s]))

/** Gatunek z katalogu; „Rubus sp.”, „Rubus fruticosus agg.” itp. → jeżyny, „Cladonia sp.” → chrobotki. */
export function findSpecies4030(name: string): SpeciesEntry4030 | undefined {
  const n = normalizeName(name)
  const hit = BY_NAME.get(n)
  if (hit) return hit
  if (/^rubus\b/.test(n)) return BY_NAME.get(normalizeName('Rubus spp.'))
  if (/^cladonia\b/.test(n)) return BY_NAME.get(normalizeName('Cladonia spp.'))
  return undefined
}

export const isKey4030 = (name: string) => findSpecies4030(name)?.group === 'key'
export const isGrass4030 = (name: string) => Boolean(findSpecies4030(name)?.grass)
export const isTree4030 = (name: string) => {
  const s = findSpecies4030(name)
  return Boolean(s && (s.group === 'tree' || s.tree))
}
export const isExpansive4030 = (name: string) => findSpecies4030(name)?.group === 'expansive'
export const isAlien4030 = (name: string) => findSpecies4030(name)?.group === 'alien'

/** Klucz gatunku do liczenia: synonimy (Padus/Prunus serotina, Molinia caerulea/coerulea…) dają polską nazwę z katalogu. */
export const speciesKey4030 = (name: string) => findSpecies4030(name)?.polish ?? normalizeName(name)

/** Drzewa do B, mszaki i porosty do D, reszta (z krzewinkami i krzewami wrzosowiska) do C. */
export const defaultLayer4030 = (s: SpeciesEntry4030): Layer => {
  if (s.cryptogam) return 'D'
  if (s.group === 'tree' || s.tree) return 'B'
  return 'C'
}
