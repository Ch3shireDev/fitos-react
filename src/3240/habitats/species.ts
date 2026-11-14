// Słownik gatunków dla 3240 (zarośla wierzby siwej na kamieńcach i żwirowiskach górskich potoków), zebrany z przewodnika
// GIOŚ (Perzanowska 2012, „Typowe gatunki roślin”, tab. 1 i 2), z przykładowej karty (Śnietnica, 2010) i ze sprawozdań
// z monitoringu 2009–2011, 2016–2018 i 2021 (gatunki obce i ekspansywne). Zarośla to warstwa B (wierzby, września,
// olsza szara), pod nimi bogate, często przypadkowe runo nadrzeczne w warstwie C. Warstwy A i D przewodnik nie notuje.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup3240 =
  | 'builder' // gatunki budujące zarośla wymienione w progach FV wskaźnika „Gatunki krzewów” (wierzby + września)
  | 'otherWillow' // inne wierzby (U1: „pojedyncze gatunki innych wierzb”)
  | 'tree' // drzewa i krzewy, które w zaroślach przerastają wierzby (olsze, jesion, świerk…)
  | 'expansive' // rodzime gatunki ekspansywne roślin zielnych (sprawozdania 2016–2021)
  | 'alien' // obce gatunki inwazyjne (przewodnik pkt 5, sprawozdania 2016–2021)
  | 'companion' // runo: gatunki typowe i towarzyszące

export interface SpeciesEntry3240 {
  latin: string
  polish?: string
  group: SpeciesGroup3240
  /** Krzew albo drzewo – w zdjęciu warstwa B. */
  woody?: boolean
}

export const GROUP_LABELS_3240: Record<SpeciesGroup3240, string> = {
  builder: 'gatunek budujący zarośla 3240',
  otherWillow: 'inna wierzba (nie z listy FV)',
  tree: 'drzewo – przy wysokości >3 m liczy się do „udziału gatunków drzewiastych”',
  expansive: 'rodzimy gatunek ekspansywny',
  alien: 'gatunek obcy inwazyjny',
  companion: 'gatunek runa',
}

const e = (latin: string, polish: string, group: SpeciesGroup3240, extra: Partial<SpeciesEntry3240> = {}): SpeciesEntry3240 => ({ latin, polish, group, ...extra })
const W = { woody: true }

export const SPECIES_3240: SpeciesEntry3240[] = [
  // gatunki krzewów z progu FV (tab. 2)
  e('Salix eleagnos', 'wierzba siwa', 'builder', W),
  e('Salix elaeagnos', 'wierzba siwa', 'builder', W),
  e('Salix purpurea', 'wierzba purpurowa', 'builder', W),
  e('Salix fragilis', 'wierzba krucha', 'builder', W),
  e('Salix triandra', 'wierzba trójpręcikowa', 'builder', W),
  e('Myricaria germanica', 'września pobrzeżna', 'builder', W),

  // inne wierzby
  e('Salix alba', 'wierzba biała', 'otherWillow', W),
  e('Salix ×rubens', 'wierzba różowa', 'otherWillow', W),
  e('Salix viminalis', 'wierzba wiciowa', 'otherWillow', W),
  e('Salix caprea', 'wierzba iwa', 'otherWillow', W),
  e('Salix cinerea', 'wierzba szara', 'otherWillow', W),
  e('Salix myrsinifolia', 'wierzba czerniejąca', 'otherWillow', W),
  e('Salix silesiaca', 'wierzba śląska', 'otherWillow', W),
  e('Salix aurita', 'wierzba uszata', 'otherWillow', W),

  // drzewa i wysokie krzewy – sukcesja w stronę łęgu (91E0)
  e('Alnus incana', 'olsza szara', 'tree', W),
  e('Alnus glutinosa', 'olsza czarna', 'tree', W),
  e('Fraxinus excelsior', 'jesion wyniosły', 'tree', W),
  e('Acer pseudoplatanus', 'klon jawor', 'tree', W),
  e('Betula pendula', 'brzoza brodawkowata', 'tree', W),
  e('Picea abies', 'świerk pospolity', 'tree', W),
  e('Pinus sylvestris', 'sosna zwyczajna', 'tree', W),
  e('Populus tremula', 'topola osika', 'tree', W),
  e('Populus nigra', 'topola czarna', 'tree', W),
  e('Padus avium', 'czeremcha zwyczajna', 'tree', W),
  e('Ulmus glabra', 'wiąz górski', 'tree', W),
  e('Corylus avellana', 'leszczyna pospolita', 'tree', W),
  e('Sambucus nigra', 'bez czarny', 'tree', W),

  // rodzime ekspansywne rośliny zielne (sprawozdania 2016–2018 i 2021)
  e('Calamagrostis epigejos', 'trzcinnik piaskowy', 'expansive'),
  e('Phalaris arundinacea', 'mozga trzcinowata', 'expansive'),
  e('Festuca altissima', 'kostrzewa leśna', 'expansive'),
  e('Rubus caesius', 'jeżyna popielica', 'expansive'),
  e('Urtica dioica', 'pokrzywa zwyczajna', 'expansive'),
  e('Elymus repens', 'perz właściwy', 'expansive'),
  e('Petasites hybridus', 'lepiężnik różowy', 'expansive'),
  e('Rubus idaeus', 'malina właściwa', 'expansive'),
  e('Calamagrostis arundinacea', 'trzcinnik leśny', 'expansive'),

  // obce inwazyjne
  e('Reynoutria japonica', 'rdestowiec japoński', 'alien'),
  e('Reynoutria sachalinensis', 'rdestowiec sachaliński', 'alien'),
  e('Reynoutria ×bohemica', 'rdestowiec czeski', 'alien'),
  e('Heracleum sosnowskyi', 'barszcz Sosnowskiego', 'alien'),
  e('Heracleum mantegazzianum', 'barszcz Mantegazziego', 'alien'),
  e('Impatiens glandulifera', 'niecierpek gruczołowaty', 'alien'),
  e('Impatiens parviflora', 'niecierpek drobnokwiatowy', 'alien'),
  e('Solidago gigantea', 'nawłoć późna', 'alien'),
  e('Solidago canadensis', 'nawłoć kanadyjska', 'alien'),
  e('Conyza canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Erigeron canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Erigeron annuus', 'przymiotno białe', 'alien'),
  e('Echinocystis lobata', 'kolczurka klapowana', 'alien'),
  e('Rudbeckia laciniata', 'rudbekia naga', 'alien'),
  e('Helianthus tuberosus', 'słonecznik bulwiasty', 'alien'),
  e('Symphyotrichum novi-belgii', 'aster nowobelgijski', 'alien'),
  e('Aster novi-belgii', 'aster nowobelgijski', 'alien'),
  e('Bidens frondosa', 'uczep amerykański', 'alien'),
  e('Lupinus polyphyllus', 'łubin trwały', 'alien'),
  e('Robinia pseudoacacia', 'robinia akacjowa', 'alien', W),
  e('Acer negundo', 'klon jesionolistny', 'alien', W),

  // runo – gatunki typowe (przewodnik pkt 4) i z przykładowej karty
  e('Calamagrostis pseudophragmites', 'trzcinnik szuwarowy', 'companion'),
  e('Tussilago farfara', 'podbiał pospolity', 'companion'),
  e('Petasites kablikianus', 'lepiężnik biały (Kablika)', 'companion'),
  e('Petasites albus', 'lepiężnik biały', 'companion'),
  e('Aegopodium podagraria', 'podagrycznik zwyczajny', 'companion'),
  e('Chaerophyllum hirsutum', 'świerząbek korzenny', 'companion'),
  e('Chaerophyllum aromaticum', 'świerząbek orzęsiony', 'companion'),
  e('Elymus caninus', 'perz psi', 'companion'),
  e('Eupatorium cannabinum', 'sadziec konopiasty', 'companion'),
  e('Achillea millefolium', 'krwawnik pospolity', 'companion'),
  e('Alchemilla sp.', 'przywrotnik', 'companion'),
  e('Artemisia vulgaris', 'bylica pospolita', 'companion'),
  e('Barbarea vulgaris', 'gorczycznik pospolity', 'companion'),
  e('Brachypodium sylvaticum', 'kłosownica leśna', 'companion'),
  e('Calystegia sepium', 'kielisznik zaroślowy', 'companion'),
  e('Carex hirta', 'turzyca owłosiona', 'companion'),
  e('Centaurea jacea', 'chaber łąkowy', 'companion'),
  e('Chenopodium album', 'komosa biała', 'companion'),
  e('Cirsium arvense', 'ostrożeń polny', 'companion'),
  e('Cirsium palustre', 'ostrożeń błotny', 'companion'),
  e('Crepis paludosa', 'pępawa błotna', 'companion'),
  e('Dactylis glomerata', 'kupkówka pospolita', 'companion'),
  e('Daucus carota', 'marchew zwyczajna', 'companion'),
  e('Deschampsia caespitosa', 'śmiałek darniowy', 'companion'),
  e('Epilobium roseum', 'wierzbownica bladoróżowa', 'companion'),
  e('Equisetum arvense', 'skrzyp polny', 'companion'),
  e('Galium mollugo', 'przytulia pospolita', 'companion'),
  e('Geranium robertianum', 'bodziszek cuchnący', 'companion'),
  e('Glechoma hederacea', 'bluszczyk kurdybanek', 'companion'),
  e('Heracleum sphondylium', 'barszcz zwyczajny', 'companion'),
  e('Hypericum perforatum', 'dziurawiec zwyczajny', 'companion'),
  e('Juncus articulatus', 'sit członowany', 'companion'),
  e('Leucanthemum vulgare', 'jastrun właściwy', 'companion'),
  e('Lotus corniculatus', 'komonica zwyczajna', 'companion'),
  e('Lycopus europaeus', 'karbieniec pospolity', 'companion'),
  e('Lysimachia nummularia', 'tojeść rozesłana', 'companion'),
  e('Lysimachia vulgaris', 'tojeść pospolita', 'companion'),
  e('Mentha longifolia', 'mięta długolistna', 'companion'),
  e('Myosotis palustris', 'niezapominajka błotna', 'companion'),
  e('Phleum pratense', 'tymotka łąkowa', 'companion'),
  e('Plantago lanceolata', 'babka lancetowata', 'companion'),
  e('Polygonum aviculare', 'rdest ptasi', 'companion'),
  e('Ranunculus acris', 'jaskier ostry', 'companion'),
  e('Ranunculus flammula', 'jaskier płomiennik', 'companion'),
  e('Ranunculus repens', 'jaskier rozłogowy', 'companion'),
  e('Rumex acetosa', 'szczaw zwyczajny', 'companion'),
  e('Rumex obtusifolius', 'szczaw tępolistny', 'companion'),
  e('Solanum dulcamara', 'psianka słodkogórz', 'companion'),
  e('Taraxacum officinale', 'mniszek pospolity', 'companion'),
  e('Trifolium pratense', 'koniczyna łąkowa', 'companion'),
  e('Vicia cracca', 'wyka ptasia', 'companion'),
]

const BY_NAME = new Map(SPECIES_3240.map((s) => [normalizeName(s.latin), s]))

export const findSpecies3240 = (name: string): SpeciesEntry3240 | undefined => BY_NAME.get(normalizeName(name))

/**
 * Klucz gatunku do liczenia: synonimy (Salix eleagnos = S. elaeagnos, Conyza = Erigeron canadensis…) dają ten sam
 * klucz – polską nazwę z katalogu. Spoza katalogu – nazwa znormalizowana.
 */
export const speciesKey3240 = (name: string) => findSpecies3240(name)?.polish ?? normalizeName(name)

export const isAlien3240 = (name: string) => findSpecies3240(name)?.group === 'alien'
export const isExpansive3240 = (name: string) => findSpecies3240(name)?.group === 'expansive'
/** Wierzba siwa (oba zapisy nazwy). */
export const isSalixEleagnos = (name: string) => speciesKey3240(name) === 'wierzba siwa'
export const isMyricaria = (name: string) => speciesKey3240(name) === 'września pobrzeżna'
/** Wierzba (dowolna, także spoza katalogu) – po nazwie rodzajowej. */
export const isWillow = (name: string) => /^salix\b/.test(normalizeName(name))

/** Krzewy i drzewa do B, reszta do C. */
export const defaultLayer3240 = (s: SpeciesEntry3240): Layer => (s.woody ? 'B' : 'C')
