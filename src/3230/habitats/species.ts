// Słownik gatunków dla 3230 (zarośla wrześni na kamieńcach i żwirowiskach górskich potoków), zebrany z przewodnika GIOŚ
// (Perzanowska 2012, rozdz. „Typowe gatunki roślin”, tab. 1 i 2), z przykładowej karty (Białka 03, 2009) i ze sprawozdań
// z monitoringu 2009–2011, 2015–2018 i 2020–2021 (gatunki obce – tab. 10 sprawozdania 2016–2018 i tab. 3 sprawozdania 2021,
// gatunki ekspansywne – opisy wskaźnika w sprawozdaniach 2009 i 2021). W zdjęciu: krzewy i drzewa w B, reszta w C.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup3230 =
  | 'typicalShrub' // krzewy typowe (tab. 2 „pełny zestaw gatunków typowych” + rozdz. 4): września, wierzby, olsza szara
  | 'otherShrub' // inne krzewy – tab. 2 U2: „obecne inne krzewy, np. bez czarny, trzmielina”
  | 'tree' // gatunki drzewiaste – wskaźnik „Udział gatunków drzewiastych (powyżej 1,5 m wys.)”
  | 'typicalHerb' // typowe rośliny zielne kamieńców (rozdz. 4)
  | 'expansive' // rodzime gatunki ekspansywne roślin zielnych (sprawozdania 2009 i 2021)
  | 'alien' // obce gatunki inwazyjne (sprawozdania 2016–2018 i 2021)
  | 'companion' // inne gatunki runa (np. z przykładowej karty)

export interface SpeciesEntry3230 {
  latin: string
  polish?: string
  group: SpeciesGroup3230
}

export const GROUP_LABELS_3230: Record<SpeciesGroup3230, string> = {
  typicalShrub: 'krzew typowy dla 3230',
  otherShrub: 'krzew nietypowy dla 3230 (tab. 2: obniża „Gatunki krzewów”)',
  tree: 'gatunek drzewiasty (ocienia wrześnię)',
  typicalHerb: 'typowa roślina zielna kamieńców',
  expansive: 'rodzimy gatunek ekspansywny',
  alien: 'gatunek obcy inwazyjny',
  companion: 'gatunek towarzyszący',
}

const e = (latin: string, polish: string, group: SpeciesGroup3230): SpeciesEntry3230 => ({ latin, polish, group })

export const SPECIES_3230: SpeciesEntry3230[] = [
  // krzewy typowe
  e('Myricaria germanica', 'września pobrzeżna', 'typicalShrub'),
  e('Salix eleagnos', 'wierzba siwa', 'typicalShrub'),
  e('Salix elaeagnos', 'wierzba siwa', 'typicalShrub'),
  e('Salix purpurea', 'wierzba purpurowa', 'typicalShrub'),
  e('Salix fragilis', 'wierzba krucha', 'typicalShrub'),
  e('Salix triandra', 'wierzba trójpręcikowa', 'typicalShrub'),
  e('Alnus incana', 'olsza szara', 'typicalShrub'),
  // inne krzewy (tab. 2 U2) i wierzby spoza zestawu typowego
  e('Sambucus nigra', 'bez czarny', 'otherShrub'),
  e('Euonymus europaeus', 'trzmielina zwyczajna', 'otherShrub'),
  e('Salix caprea', 'wierzba iwa', 'otherShrub'),
  e('Salix viminalis', 'wierzba wiciowa', 'otherShrub'),
  e('Corylus avellana', 'leszczyna pospolita', 'otherShrub'),
  e('Crataegus monogyna', 'głóg jednoszyjkowy', 'otherShrub'),
  e('Rosa canina', 'róża dzika', 'otherShrub'),
  e('Frangula alnus', 'kruszyna pospolita', 'otherShrub'),
  // drzewa (powyżej 1,5 m ocieniają wrześnię)
  e('Alnus glutinosa', 'olsza czarna', 'tree'),
  e('Salix alba', 'wierzba biała', 'tree'),
  e('Acer pseudoplatanus', 'klon jawor', 'tree'),
  e('Fraxinus excelsior', 'jesion wyniosły', 'tree'),
  e('Betula pendula', 'brzoza brodawkowata', 'tree'),
  e('Pinus sylvestris', 'sosna zwyczajna', 'tree'),
  e('Picea abies', 'świerk pospolity', 'tree'),
  e('Populus nigra', 'topola czarna', 'tree'),
  e('Populus tremula', 'topola osika', 'tree'),
  // typowe rośliny zielne (rozdz. 4)
  e('Calamagrostis pseudophragmites', 'trzcinnik szuwarowy', 'typicalHerb'),
  e('Chamaenerion palustre', 'wierzbówka nadrzeczna', 'typicalHerb'),
  e('Epilobium dodonaei', 'wierzbówka nadrzeczna', 'typicalHerb'),
  e('Festuca rubra', 'kostrzewa czerwona', 'typicalHerb'),
  e('Reseda lutea', 'rezeda żółta', 'typicalHerb'),
  e('Equisetum variegatum', 'skrzyp pstry', 'typicalHerb'),
  e('Galeopsis angustifolia', 'poziewnik wąskolistny', 'typicalHerb'),
  e('Galeopsis ladanum', 'poziewnik polny', 'typicalHerb'),
  e('Leontodon hispidus', 'brodawnik zwyczajny', 'typicalHerb'),
  e('Linaria vulgaris', 'lnica zwyczajna', 'typicalHerb'),
  e('Chaenorhinum minus', 'lniczka mała', 'typicalHerb'),
  e('Poa granitica', 'wiechlina granitowa', 'typicalHerb'),
  e('Rumex scutatus', 'szczaw tarczolistny', 'typicalHerb'),
  e('Silene vulgaris subsp. prostrata', 'lepnica rozdęta', 'typicalHerb'),
  e('Tussilago farfara', 'podbiał pospolity', 'typicalHerb'),
  // rodzime gatunki ekspansywne (2009: wysokie byliny i trawy; 2021: gatunki łęgowe i łąkowe)
  e('Calamagrostis epigejos', 'trzcinnik piaskowy', 'expansive'),
  e('Calamagrostis epigeios', 'trzcinnik piaskowy', 'expansive'),
  e('Phalaris arundinacea', 'mozga trzcinowata', 'expansive'),
  e('Eupatorium cannabinum', 'sadziec konopiasty', 'expansive'),
  e('Tanacetum vulgare', 'wrotycz pospolity', 'expansive'),
  e('Petasites hybridus', 'lepiężnik różowy', 'expansive'),
  e('Urtica dioica', 'pokrzywa zwyczajna', 'expansive'),
  e('Galium aparine', 'przytulia czepna', 'expansive'),
  e('Artemisia vulgaris', 'bylica pospolita', 'expansive'),
  // obce gatunki inwazyjne (sprawozdania 2016–2018 i 2021; 2009: rdest wielokłosowy)
  e('Impatiens glandulifera', 'niecierpek gruczołowaty', 'alien'),
  e('Impatiens parviflora', 'niecierpek drobnokwiatowy', 'alien'),
  e('Erigeron annuus', 'przymiotno białe', 'alien'),
  e('Conyza canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Erigeron canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Solidago canadensis', 'nawłoć kanadyjska', 'alien'),
  e('Solidago gigantea', 'nawłoć późna', 'alien'),
  e('Heracleum sosnowskyi', 'barszcz Sosnowskiego', 'alien'),
  e('Reynoutria japonica', 'rdestowiec ostrokończysty', 'alien'),
  e('Fallopia japonica', 'rdestowiec ostrokończysty', 'alien'),
  e('Reynoutria sachalinensis', 'rdestowiec sachaliński', 'alien'),
  e('Polygonum polystachyum', 'rdest wielokłosowy', 'alien'),
  e('Aster novi-belgii', 'aster nowobelgijski', 'alien'),
  e('Echinocystis lobata', 'kolczurka klapowana', 'alien'),
  e('Bidens frondosa', 'uczep amerykański', 'alien'),
  e('Epilobium adenocaulon', 'wierzbownica gruczołowata', 'alien'),
  e('Epilobium ciliatum', 'wierzbownica gruczołowata', 'alien'),
  e('Galinsoga parviflora', 'żółtlica drobnokwiatowa', 'alien'),
  e('Oxalis stricta', 'szczawik żółty', 'alien'),
  e('Populus ×canadensis', 'topola kanadyjska', 'alien'),
  e('Matricaria maritima', 'maruna nadmorska bezwonna', 'alien'),
  e('Carduus acanthoides', 'oset nastroszony', 'alien'),
  e('Setaria viridis', 'włośnica zielona', 'alien'),
  e('Viola arvensis', 'fiołek polny', 'alien'),
  // gatunki towarzyszące (m.in. z przykładowej karty)
  e('Achillea millefolium', 'krwawnik pospolity', 'companion'),
  e('Barbarea vulgaris', 'gorczycznik pospolity', 'companion'),
  e('Cardaminopsis arenosa', 'rzeżusznik piaskowy', 'companion'),
  e('Chrysanthemum leucanthemum', 'złocień właściwy', 'companion'),
  e('Leucanthemum vulgare', 'złocień właściwy', 'companion'),
  e('Cirsium arvense', 'ostrożeń polny', 'companion'),
  e('Dactylis glomerata', 'kupkówka pospolita', 'companion'),
  e('Deschampsia caespitosa', 'śmiałek darniowy', 'companion'),
  e('Echium vulgare', 'żmijowiec zwyczajny', 'companion'),
  e('Epilobium palustre', 'wierzbownica błotna', 'companion'),
  e('Galium mollugo', 'przytulia pospolita', 'companion'),
  e('Hypericum maculatum', 'dziurawiec czteroboczny', 'companion'),
  e('Medicago lupulina', 'lucerna nerkowata', 'companion'),
  e('Melilotus alba', 'nostrzyk biały', 'companion'),
  e('Mentha longifolia', 'mięta długolistna', 'companion'),
  e('Petasites albus', 'lepiężnik biały', 'companion'),
  e('Plantago lanceolata', 'babka lancetowata', 'companion'),
  e('Rhinanthus serotinus', 'szelężnik większy', 'companion'),
  e('Symphytum officinale', 'żywokost lekarski', 'companion'),
]

const BY_NAME = new Map(SPECIES_3230.map((s) => [normalizeName(s.latin), s]))

export const findSpecies3230 = (name: string): SpeciesEntry3230 | undefined => BY_NAME.get(normalizeName(name))

const inGroup = (g: SpeciesGroup3230) => (name: string) => findSpecies3230(name)?.group === g
export const isTypicalShrub3230 = inGroup('typicalShrub')
export const isOtherShrub3230 = inGroup('otherShrub')
export const isTree3230 = inGroup('tree')
export const isExpansive3230 = inGroup('expansive')
export const isAlien3230 = inGroup('alien')

export const MYRICARIA = 'Myricaria germanica'
export const SALIX_ELEAGNOS = 'Salix eleagnos'

/**
 * Klucz gatunku do liczenia: synonimy i warianty pisowni (Salix eleagnos/elaeagnos, Calamagrostis epigejos/epigeios,
 * Conyza/Erigeron canadensis…) dają ten sam klucz – polską nazwę z katalogu. Spoza katalogu – nazwa znormalizowana.
 */
export const speciesKey3230 = (name: string) => findSpecies3230(name)?.polish ?? normalizeName(name)

/** Krzewy i drzewa do B, reszta do C. */
export const defaultLayer3230 = (s: SpeciesEntry3230): Layer =>
  s.group === 'typicalShrub' || s.group === 'otherShrub' || s.group === 'tree' || s.latin === 'Populus ×canadensis' ? 'B' : 'C'
