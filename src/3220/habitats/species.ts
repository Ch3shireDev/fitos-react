// Słownik gatunków dla 3220 (pionierska roślinność na kamieńcach górskich potoków), zebrany z przewodnika GIOŚ
// (Perzanowska 2012, „Typowe gatunki roślin”, tab. 1 i 2), z przykładowej karty (Siwa Woda, 2010) i ze sprawozdań
// z monitoringu 2009–2011, 2015–2018 i 2020–2021 (gatunki obce – tab. 4 sprawozdania 2021).
// Kamieniec to luźne ziele na żwirze (warstwa C), z siewkami i odroślami wierzb, olszy i świerka; krzewy (B) są
// nieliczne, bo każde wezbranie je wyrywa albo zasypuje.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup3220 =
  | 'typical' // gatunki typowe kamieńców (przewodnik, rozdz. 4) i inne gatunki górskie spływające z wodą
  | 'companion' // inne gatunki zielne spotykane na kamieńcach (łąkowe, ruderalne, leśne)
  | 'expansive' // rodzime gatunki ekspansywne roślin zielnych (sprawozdania 2011, 2021)
  | 'alien' // obce gatunki inwazyjne – liczą się do wskaźnika
  | 'alienCasual' // obce nieinwazyjne (archeofity, efemerofity z tab. 4 sprawozdania 2021) – do wskaźnika się nie liczą
  | 'shrubNative' // krzewy i drzewa „właściwe” (tab. 2: wierzby Salici-Myricarietum, olsza szara) – gatunki krzewów FV
  | 'shrubOther' // inne rodzime drzewa i krzewy (Salici purpureae, łęgi, grądy i inne lasy) – gatunki krzewów U1
  | 'alienWoody' // drzewa i krzewy obce lub sadzone – gatunki krzewów U2 (i obce inwazyjne, gdy inwazyjne)

export interface SpeciesEntry3220 {
  latin: string
  polish?: string
  group: SpeciesGroup3220
  /** Nazwa przyjęta w katalogu, gdy wpis jest synonimem (liczony jako jeden gatunek). */
  same?: string
  /** Gatunek typowy, który przy masowym występowaniu bywa oceniany jako ekspansywny (trzcinnik szuwarowy, lepiężnik wyłysiały). */
  alsoExpansive?: boolean
  /** Obce drzewo/krzew inwazyjne – liczy się też do „Obcych gatunków inwazyjnych”. */
  invasive?: boolean
  /** Mszak – w zdjęciu warstwa D. */
  cryptogam?: boolean
}

export const GROUP_LABELS_3220: Record<SpeciesGroup3220, string> = {
  typical: 'gatunek typowy kamieńców',
  companion: 'gatunek towarzyszący',
  expansive: 'rodzimy gatunek ekspansywny',
  alien: 'obcy gatunek inwazyjny',
  alienCasual: 'gatunek obcy nieinwazyjny (archeofit/efemerofit) – do „obcych inwazyjnych” się nie liczy',
  shrubNative: 'krzew/drzewo Salici-Myricarietum lub olsza szara (gatunki krzewów: FV)',
  shrubOther: 'inny rodzimy krzew/drzewo – Salici purpureae, łęgi, lasy (gatunki krzewów: U1)',
  alienWoody: 'drzewo/krzew obcy lub z nasadzeń (gatunki krzewów: U2)',
}

const e = (latin: string, polish: string, group: SpeciesGroup3220, extra: Partial<SpeciesEntry3220> = {}): SpeciesEntry3220 => ({ latin, polish, group, ...extra })

export const SPECIES_3220: SpeciesEntry3220[] = [
  // gatunki typowe – przewodnik, rozdz. 4 „Typowe gatunki roślin”
  e('Calamagrostis pseudophragmites', 'trzcinnik szuwarowy', 'typical', { alsoExpansive: true }),
  e('Chamaenerion palustre', 'wierzbówka nadrzeczna', 'typical'),
  e('Epilobium dodonaei', 'wierzbówka nadrzeczna', 'typical', { same: 'Chamaenerion palustre' }),
  e('Festuca rubra', 'kostrzewa czerwona', 'typical'),
  e('Reseda lutea', 'rezeda żółta', 'typical'),
  e('Equisetum variegatum', 'skrzyp pstry', 'typical'),
  e('Galeopsis angustifolia', 'poziewnik wąskolistny', 'typical'),
  e('Galeopsis ladanum', 'poziewnik polny', 'typical'),
  e('Leontodon hispidus', 'brodawnik zwyczajny', 'typical'),
  e('Linaria vulgaris', 'lnica zwyczajna', 'typical'),
  e('Chaenorhinum minus', 'lniczka mała', 'typical'),
  e('Poa granitica', 'wiechlina granitowa', 'typical'),
  e('Rumex scutatus', 'szczaw tarczolistny', 'typical'),
  e('Silene vulgaris', 'lepnica rozdęta', 'typical'),
  e('Silene vulgaris subsp. prostrata', 'lepnica rozdęta rozesłana', 'typical'),
  e('Tussilago farfara', 'podbiał pospolity', 'typical'),
  // gatunki górskie spływające z wodą (karta Siwa Woda, sprawozdanie 2011)
  e('Arabis alpina', 'gęsiówka alpejska', 'typical'),
  e('Poa alpina', 'wiechlina alpejska', 'typical'),
  e('Poa alpina var. vivipara', 'wiechlina alpejska żyworodna', 'typical'),
  e('Petasites kablikianus', 'lepiężnik wyłysiały', 'typical', { alsoExpansive: true }),
  e('Linum extraaxillare', 'len karpacki', 'typical'),
  e('Arenaria serpyllifolia', 'piaskowiec macierzankowy', 'typical'),
  e('Cardaminopsis arenosa', 'rzeżusznik piaskowy', 'typical'),
  e('Arabidopsis arenosa', 'rzeżusznik piaskowy', 'typical', { same: 'Cardaminopsis arenosa' }),
  e('Aconitum firmum', 'tojad mocny', 'typical'),
  e('Carduus personata', 'oset łopianowaty', 'typical'),
  e('Chaerophyllum hirsutum', 'świerząbek orzęsiony', 'typical'),
  e('Alchemilla', 'przywrotnik', 'companion'),
  e('Alchemilla sp.', 'przywrotnik', 'companion', { same: 'Alchemilla' }),
  e('Epilobium', 'wierzbownica', 'companion'),
  e('Epilobium sp.', 'wierzbownica', 'companion', { same: 'Epilobium' }),
  e('Euphrasia', 'świetlik', 'companion'),
  e('Euphrasia sp.', 'świetlik', 'companion', { same: 'Euphrasia' }),
  e('Rubus', 'jeżyna/malina', 'companion'),
  e('Rubus sp.', 'jeżyna/malina', 'companion', { same: 'Rubus' }),
  // towarzyszące – łąkowe, ruderalne, leśne, nadrzeczne
  e('Aegopodium podagraria', 'podagrycznik pospolity', 'companion'),
  e('Agrostis vulgaris', 'mietlica pospolita', 'companion'),
  e('Agrostis capillaris', 'mietlica pospolita', 'companion', { same: 'Agrostis vulgaris' }),
  e('Agrostis stolonifera', 'mietlica rozłogowa', 'companion'),
  e('Cardamine impatiens', 'rzeżucha niecierpkowa', 'companion'),
  e('Cerastium vulgatum', 'rogownica pospolita', 'companion'),
  e('Cerastium holosteoides', 'rogownica pospolita', 'companion', { same: 'Cerastium vulgatum' }),
  e('Cirsium palustre', 'ostrożeń błotny', 'companion'),
  e('Elymus caninus', 'perz psi', 'companion'),
  e('Equisetum arvense', 'skrzyp polny', 'companion'),
  e('Festuca pratensis', 'kostrzewa łąkowa', 'companion'),
  e('Fragaria vesca', 'poziomka pospolita', 'companion'),
  e('Galium mollugo', 'przytulia pospolita', 'companion'),
  e('Geranium robertianum', 'bodziszek cuchnący', 'companion'),
  e('Heracleum sphondylium', 'barszcz zwyczajny', 'companion'),
  e('Leucanthemum vulgare', 'złocień właściwy', 'companion'),
  e('Medicago lupulina', 'lucerna nerkowata', 'companion'),
  e('Melandrium rubrum', 'bniec czerwony', 'companion'),
  e('Silene dioica', 'bniec czerwony', 'companion', { same: 'Melandrium rubrum' }),
  e('Myosotis palustris', 'niezapominajka błotna', 'companion'),
  e('Myosotis scorpioides', 'niezapominajka błotna', 'companion', { same: 'Myosotis palustris' }),
  e('Plantago intermedia', 'babka pośrednia', 'companion'),
  e('Poa annua', 'wiechlina roczna', 'companion'),
  e('Poa palustris', 'wiechlina błotna', 'companion'),
  e('Potentilla anserina', 'pięciornik gęsi', 'companion'),
  e('Prunella vulgaris', 'głowienka pospolita', 'companion'),
  e('Ranunculus repens', 'jaskier rozłogowy', 'companion'),
  e('Stellaria nemorum', 'gwiazdnica gajowa', 'companion'),
  e('Taraxacum officinale', 'mniszek lekarski', 'companion'),
  e('Trifolium pratense', 'koniczyna łąkowa', 'companion'),
  e('Trifolium repens', 'koniczyna biała', 'companion'),
  e('Veronica chamaedrys', 'przetacznik ożankowy', 'companion'),
  e('Veronica beccabunga', 'przetacznik bobowniczek', 'companion'),
  e('Mentha longifolia', 'mięta długolistna', 'companion'),
  e('Barbarea vulgaris', 'gorczycznik pospolity', 'companion'),
  e('Rorippa sylvestris', 'rzepicha leśna', 'companion'),
  e('Deschampsia caespitosa', 'śmiałek darniowy', 'companion'),
  e('Dactylis glomerata', 'kupkówka pospolita', 'companion'),
  e('Lotus corniculatus', 'komonica zwyczajna', 'companion'),
  e('Achillea millefolium', 'krwawnik pospolity', 'companion'),
  e('Hypericum perforatum', 'dziurawiec zwyczajny', 'companion'),
  e('Melilotus albus', 'nostrzyk biały', 'companion'),
  e('Echium vulgare', 'żmijowiec zwyczajny', 'companion'),
  e('Bryum', 'prątnik', 'companion', { cryptogam: true }),
  // rodzime ekspansywne – sprawozdania 2009–2011 i 2020–2021
  e('Petasites hybridus', 'lepiężnik różowy', 'expansive'),
  e('Phalaris arundinacea', 'mozga trzcinowata', 'expansive'),
  e('Phalaroides arundinacea', 'mozga trzcinowata', 'expansive', { same: 'Phalaris arundinacea' }),
  e('Calamagrostis epigejos', 'trzcinnik piaskowy', 'expansive'),
  e('Calamagrostis epigeios', 'trzcinnik piaskowy', 'expansive', { same: 'Calamagrostis epigejos' }),
  e('Artemisia vulgaris', 'bylica pospolita', 'expansive'),
  e('Tanacetum vulgare', 'wrotycz pospolity', 'expansive'),
  e('Epilobium hirsutum', 'wierzbownica kosmata', 'expansive'),
  e('Persicaria lapathifolia', 'rdest szczawiolistny', 'expansive'),
  e('Polygonum lapathifolium', 'rdest szczawiolistny', 'expansive', { same: 'Persicaria lapathifolia' }),
  e('Urtica dioica', 'pokrzywa zwyczajna', 'expansive'),
  e('Rubus caesius', 'jeżyna popielica', 'expansive'),
  e('Elymus repens', 'perz właściwy', 'expansive'),
  e('Cytisus scoparius', 'żarnowiec miotlasty', 'expansive'),
  e('Sarothamnus scoparius', 'żarnowiec miotlasty', 'expansive', { same: 'Cytisus scoparius' }),
  // obce inwazyjne – przewodnik (rozdz. 5) i tab. 4 sprawozdania 2021
  e('Impatiens glandulifera', 'niecierpek gruczołowaty', 'alien'),
  e('Impatiens parviflora', 'niecierpek drobnokwiatowy', 'alien'),
  e('Solidago gigantea', 'nawłoć późna', 'alien'),
  e('Solidago canadensis', 'nawłoć kanadyjska', 'alien'),
  e('Echinocystis lobata', 'kolczurka klapowana', 'alien'),
  e('Heracleum sosnowskyi', 'barszcz Sosnowskiego', 'alien'),
  e('Heracleum mantegazzianum', 'barszcz Mantegazziego', 'alien'),
  e('Reynoutria japonica', 'rdestowiec ostrokończysty', 'alien'),
  e('Fallopia japonica', 'rdestowiec ostrokończysty', 'alien', { same: 'Reynoutria japonica' }),
  e('Reynoutria sachalinensis', 'rdestowiec sachaliński', 'alien'),
  e('Reynoutria ×bohemica', 'rdestowiec czeski', 'alien'),
  e('Rudbeckia laciniata', 'rudbekia naga', 'alien'),
  e('Rudbeckia hirta', 'rudbekia owłosiona', 'alien'),
  e('Erigeron annuus', 'przymiotno białe', 'alien'),
  e('Conyza canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Erigeron canadensis', 'przymiotno kanadyjskie', 'alien', { same: 'Conyza canadensis' }),
  e('Epilobium ciliatum', 'wierzbownica gruczołowata', 'alien'),
  e('Epilobium adenocaulon', 'wierzbownica gruczołowata', 'alien', { same: 'Epilobium ciliatum' }),
  e('Bidens frondosa', 'uczep amerykański', 'alien'),
  e('Bunias orientalis', 'rukiewnik wschodni', 'alien'),
  e('Helianthus tuberosus', 'słonecznik bulwiasty', 'alien'),
  e('Veronica filiformis', 'przetacznik nitkowaty', 'alien'),
  e('Lupinus polyphyllus', 'łubin trwały', 'alien'),
  e('Aster novae-angliae', 'aster nowoangielski', 'alien'),
  e('Symphyotrichum novae-angliae', 'aster nowoangielski', 'alien', { same: 'Aster novae-angliae' }),
  e('Oxalis stricta', 'szczawik żółty', 'alien'),
  e('Galinsoga parviflora', 'żółtlica drobnokwiatowa', 'alien'),
  e('Galinsoga quadriradiata', 'żółtlica owłosiona', 'alien'),
  e('Matricaria discoidea', 'rumianek bezpromieniowy', 'alien'),
  e('Chamomilla suaveolens', 'rumianek bezpromieniowy', 'alien', { same: 'Matricaria discoidea' }),
  // obce nieinwazyjne (archeofity, efemerofity) – tab. 4 sprawozdania 2021
  e('Onopordum acanthium', 'popłoch pospolity', 'alienCasual'),
  e('Viola arvensis', 'fiołek polny', 'alienCasual'),
  e('Tripleurospermum inodorum', 'maruna bezwonna', 'alienCasual'),
  e('Apera spica-venti', 'miotła zbożowa', 'alienCasual'),
  e('Capsella bursa-pastoris', 'tasznik pospolity', 'alienCasual'),
  e('Echinochloa crus-galli', 'chwastnica jednostronna', 'alienCasual'),
  e('Setaria viridis', 'włośnica zielona', 'alienCasual'),
  e('Lactuca serriola', 'sałata kompasowa', 'alienCasual'),
  e('Lycopersicon esculentum', 'pomidor zwyczajny', 'alienCasual'),
  e('Fallopia convolvulus', 'rdestówka powojowata', 'alienCasual'),
  e('Senecio vulgaris', 'starzec zwyczajny', 'alienCasual'),
  e('Veronica persica', 'przetacznik perski', 'alienCasual'),
  // krzewy i drzewa „właściwe” – tab. 2: wierzby Salici-Myricarietum, olsza szara
  e('Myricaria germanica', 'września pobrzeżna', 'shrubNative'),
  e('Salix eleagnos', 'wierzba siwa', 'shrubNative'),
  e('Salix elaeagnos', 'wierzba siwa', 'shrubNative', { same: 'Salix eleagnos' }),
  e('Salix daphnoides', 'wierzba wawrzynkowa', 'shrubNative'),
  e('Alnus incana', 'olsza szara', 'shrubNative'),
  // inne rodzime krzewy i drzewa – Salici purpureae, łęgi, grądy (tab. 2: U1)
  e('Salix purpurea', 'wierzba purpurowa', 'shrubOther'),
  e('Salix fragilis', 'wierzba krucha', 'shrubOther'),
  e('Salix ×rubens', 'wierzba różowa', 'shrubOther'),
  e('Salix alba', 'wierzba biała', 'shrubOther'),
  e('Salix triandra', 'wierzba trójpręcikowa', 'shrubOther'),
  e('Salix viminalis', 'wierzba wiciowa', 'shrubOther'),
  e('Salix caprea', 'wierzba iwa', 'shrubOther'),
  e('Salix silesiaca', 'wierzba śląska', 'shrubOther'),
  e('Salix cinerea', 'wierzba szara', 'shrubOther'),
  e('Alnus glutinosa', 'olsza czarna', 'shrubOther'),
  e('Picea abies', 'świerk pospolity', 'shrubOther'),
  e('Acer pseudoplatanus', 'klon jawor', 'shrubOther'),
  e('Fraxinus excelsior', 'jesion wyniosły', 'shrubOther'),
  e('Padus avium', 'czeremcha zwyczajna', 'shrubOther'),
  e('Sambucus nigra', 'bez czarny', 'shrubOther'),
  e('Sambucus racemosa', 'bez koralowy', 'shrubOther'),
  e('Corylus avellana', 'leszczyna pospolita', 'shrubOther'),
  e('Frangula alnus', 'kruszyna pospolita', 'shrubOther'),
  e('Viburnum opulus', 'kalina koralowa', 'shrubOther'),
  e('Euonymus europaeus', 'trzmielina pospolita', 'shrubOther'),
  e('Cornus sanguinea', 'dereń świdwa', 'shrubOther'),
  e('Rubus idaeus', 'malina właściwa', 'shrubOther'),
  e('Populus tremula', 'topola osika', 'shrubOther'),
  e('Betula pendula', 'brzoza brodawkowata', 'shrubOther'),
  e('Pinus sylvestris', 'sosna zwyczajna', 'shrubOther'),
  // drzewa i krzewy obce lub z nasadzeń (tab. 2: U2)
  e('Robinia pseudoacacia', 'robinia akacjowa', 'alienWoody', { invasive: true }),
  e('Acer negundo', 'klon jesionolistny', 'alienWoody', { invasive: true }),
  e('Populus ×canadensis', 'topola kanadyjska', 'alienWoody'),
  e('Populus balsamifera', 'topola balsamiczna', 'alienWoody'),
  e('Aesculus hippocastanum', 'kasztanowiec zwyczajny', 'alienWoody'),
  e('Sorbaria sorbifolia', 'tawlina jarzębolistna', 'alienWoody', { invasive: true }),
]

const BY_NAME = new Map(SPECIES_3220.map((s) => [normalizeName(s.latin), s]))

export const findSpecies3220 = (name: string): SpeciesEntry3220 | undefined => BY_NAME.get(normalizeName(name))

/**
 * Klucz gatunku do liczenia: synonimy (Fallopia = Reynoutria japonica, Conyza = Erigeron canadensis…) dają ten sam klucz –
 * nazwę przyjętą w katalogu. Spoza katalogu – nazwa znormalizowana.
 */
export const speciesKey3220 = (name: string) => {
  const s = findSpecies3220(name)
  return normalizeName(s?.same ?? s?.latin ?? name)
}

export const groupOf3220 = (name: string) => findSpecies3220(name)?.group

/** Obcy inwazyjny: zielne z grupy „alien” i inwazyjne obce drzewa/krzewy (robinia, klon jesionolistny). */
export const isInvasive3220 = (name: string) => {
  const s = findSpecies3220(name)
  return s?.group === 'alien' || Boolean(s?.invasive)
}

/** Ekspansywny rodzimy – z grupy „expansive” albo typowy, który przy masowym występowaniu bywa oceniany jako ekspansywny. */
export const isExpansive3220 = (name: string) => {
  const s = findSpecies3220(name)
  return s?.group === 'expansive' || Boolean(s?.alsoExpansive)
}

export const isWoody3220 = (name: string) => {
  const g = groupOf3220(name)
  return g === 'shrubNative' || g === 'shrubOther' || g === 'alienWoody'
}

/** Drzewa i krzewy do B, mszaki do D, reszta (z siewkami) do C. */
export const defaultLayer3220 = (s: SpeciesEntry3220): Layer => {
  if (s.cryptogam) return 'D'
  if (s.group === 'shrubNative' || s.group === 'shrubOther' || s.group === 'alienWoody') return s.latin === 'Rubus idaeus' ? 'C' : 'B'
  return 'C'
}
