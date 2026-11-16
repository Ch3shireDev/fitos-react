// Słownik gatunków dla 6440 (łąki selernicowe Cnidion dubii), zebrany z przewodnika GIOŚ (Załuski 2012, pkt 4 „Typowe
// gatunki roślin” i tab. 1), z przykładowej karty (Brańszczyk 2, dolina Bugu, 2010) i ze sprawozdań z monitoringu
// 2009–2011 i 2015–2018 (gatunki obce z tab. 10 sprawozdania 2016–2018, rodzime ekspansywne, krzewy i drzewa).
// Drzewa i krzewy – warstwa B, runo – C, mchy – D.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup6440 =
  | 'characteristic' // gatunki charakterystyczne zespołu Violo-Cnidietum dubii i związku Cnidion dubii (tab. 1)
  | 'distinguishing' // gatunki wyróżniające zespół i związek (tab. 1)
  | 'expansive' // rodzime gatunki ekspansywne roślin zielnych
  | 'alien' // gatunki obce geograficznie
  | 'woody' // drzewa i krzewy (wskaźnik „Ekspansja krzewów i podrostu drzew”)
  | 'companion' // pozostałe gatunki łąkowe (zdjęcia z karty przykładowej)

/** Charakter gatunku ekspansywnego (tab. 1): łąkowy – FV dopuszcza, szuwarowy, ziołoroślowy, zrębowy, ruderalny – U2 o nie pyta. */
export type ExpansiveKind = 'meadow' | 'reed' | 'herb' | 'clearing' | 'ruderal'

export interface SpeciesEntry6440 {
  latin: string
  polish?: string
  group: SpeciesGroup6440
  /** Gatunek charakterystyczny wg Brzega i Wojterskiej (2001) – tab. 1 przewodnika, poza listą Załuskiego. */
  regional?: boolean
  kind?: ExpansiveKind
  /** Gatunek rzadki, zagrożony albo chroniony (pkt „Cenne składniki flory” tab. 1, karta przykładowa). */
  valuable?: boolean
  /** Gatunek obcy bez tendencji do inwazji (archeofit) – sprawozdanie 2016–2018: „nie stanowią zagrożenia dla siedliska”. */
  weak?: boolean
  woody?: boolean
}

export const GROUP_LABELS_6440: Record<SpeciesGroup6440, string> = {
  characteristic: 'gatunek charakterystyczny 6440',
  distinguishing: 'gatunek wyróżniający 6440',
  expansive: 'rodzimy gatunek ekspansywny',
  alien: 'obcy gatunek inwazyjny',
  woody: 'drzewo albo krzew',
  companion: 'gatunek łąkowy (towarzyszący)',
}

export const KIND_LABELS_6440: Record<ExpansiveKind, string> = {
  meadow: 'łąkowy',
  reed: 'szuwarowy',
  herb: 'ziołoroślowy',
  clearing: 'zrębowy',
  ruderal: 'ruderalny',
}

const e = (latin: string, polish: string, group: SpeciesGroup6440, extra: Partial<SpeciesEntry6440> = {}): SpeciesEntry6440 => ({ latin, polish, group, ...extra })
const ch = (latin: string, polish: string, extra: Partial<SpeciesEntry6440> = {}) => e(latin, polish, 'characteristic', extra)
const di = (latin: string, polish: string, extra: Partial<SpeciesEntry6440> = {}) => e(latin, polish, 'distinguishing', extra)
const ex = (kind: ExpansiveKind) => (latin: string, polish: string) => e(latin, polish, 'expansive', { kind })
const xm = ex('meadow')
const xr = ex('reed')
const xh = ex('herb')
const xc = ex('clearing')
const xu = ex('ruderal')
const al = (latin: string, polish: string, extra: Partial<SpeciesEntry6440> = {}) => e(latin, polish, 'alien', extra)
const wd = (latin: string, polish: string) => e(latin, polish, 'woody', { woody: true })
const co = (latin: string, polish: string, extra: Partial<SpeciesEntry6440> = {}) => e(latin, polish, 'companion', extra)
const V = { valuable: true }
const WEAK = { weak: true }

export const SPECIES_6440: SpeciesEntry6440[] = [
  // tab. 1 – gatunki charakterystyczne zespołu Violo-Cnidietum dubii i związku Cnidion dubii (Załuski 1995, Matuszkiewicz 2005)
  ch('Cnidium dubium', 'selernica żyłkowana', V),
  ch('Cnidium venosum', 'selernica żyłkowana (syn.)', V),
  ch('Allium angulosum', 'czosnek kątowaty', V),
  ch('Gratiola officinalis', 'konitrut błotny', V),
  ch('Juncus atratus', 'sit czarny', V),
  ch('Scutellaria hastifolia', 'tarczyca oszczepowata', V),
  ch('Viola pumila', 'fiołek drobny', V),
  ch('Viola elatior', 'fiołek wyniosły', V),
  // tab. 1 – charakterystyczne zespołu Violo persicifoliae-Cnidietum dubii wg Brzega i Wojterskiej (2001)
  ch('Succisella inflexa', 'czarcikęsik Kluka', { ...V, regional: true }),
  ch('Viola montana', 'fiołek nibypsi', { regional: true }),
  // tab. 1 – gatunki wyróżniające zespół i związek
  di('Viola stagnina', 'fiołek mokradłowy', V),
  di('Viola persicifolia', 'fiołek mokradłowy (syn.)', V),
  di('Carex praecox', 'turzyca wczesna', V),
  di('Poa angustifolia', 'wiechlina wąskolistna'),
  di('Poa pratensis subsp. angustifolia', 'wiechlina wąskolistna (syn.)'),
  di('Lathyrus palustris', 'groszek błotny', V),
  di('Arabis planisiliqua', 'gęsiówka Gerarda'),
  di('Arabis gerardii', 'gęsiówka Gerarda (syn.)'),

  // rodzime gatunki ekspansywne – tab. 1 przewodnika (szuwarowe, ziołoroślowe, zrębowe, ruderalne, niektóre trawy łąkowe)
  xr('Phalaris arundinacea', 'mozga trzcinowata'),
  xr('Carex disticha', 'turzyca dwustronna'),
  xr('Carex gracilis', 'turzyca zaostrzona'),
  xr('Carex acuta', 'turzyca zaostrzona (syn.)'),
  xh('Achillea salicifolia', 'krwawnik wierzbolistny'),
  xh('Achillea cartilaginea', 'krwawnik wierzbolistny (syn.)'),
  xh('Veronica longifolia', 'przetacznik długolistny'),
  xh('Pseudolysimachion longifolium', 'przetacznik długolistny (syn.)'),
  xh('Lysimachia vulgaris', 'tojeść pospolita'),
  xc('Calamagrostis epigejos', 'trzcinnik piaskowy'),
  xu('Cirsium arvense', 'ostrożeń polny'),
  xu('Elymus repens', 'perz właściwy'),
  xu('Agropyron repens', 'perz właściwy (syn.)'),
  xm('Alopecurus pratensis', 'wyczyniec łąkowy'),
  xm('Festuca rubra', 'kostrzewa czerwona'),
  xm('Deschampsia caespitosa', 'śmiałek darniowy'),
  xm('Deschampsia cespitosa', 'śmiałek darniowy (syn.)'),
  // ekspansywne z karty przykładowej i sprawozdań
  xh('Filipendula ulmaria', 'wiązówka błotna'),
  xr('Phragmites australis', 'trzcina pospolita'),
  xr('Glyceria maxima', 'manna mielec'),
  xr('Carex acutiformis', 'turzyca błotna'),
  xr('Carex riparia', 'turzyca brzegowa'),
  xu('Urtica dioica', 'pokrzywa zwyczajna'),
  xu('Tanacetum vulgare', 'wrotycz pospolity'),

  // gatunki obce – tab. 1 przewodnika i tab. 10 sprawozdania 2016–2018
  al('Rumex confertus', 'szczaw omszony'),
  al('Solidago gigantea', 'nawłoć późna'),
  al('Solidago canadensis', 'nawłoć kanadyjska'),
  al('Bidens frondosa', 'uczep amerykański'),
  al('Conyza canadensis', 'przymiotno kanadyjskie'),
  al('Erigeron canadensis', 'przymiotno kanadyjskie (syn.)'),
  al('Erigeron annuus', 'przymiotno białe'),
  al('Galinsoga parviflora', 'żółtlica drobnokwiatowa'),
  al('Amaranthus retroflexus', 'szarłat szorstki'),
  al('Datura stramonium', 'bieluń dziędzierzawa'),
  al('Aster novi-belgii', 'aster nowobelgijski'),
  al('Symphyotrichum novi-belgii', 'aster nowobelgijski (syn.)'),
  al('Aster lanceolatus', 'aster lancetowaty'),
  al('Echinocystis lobata', 'kolczurka klapowana'),
  al('Impatiens glandulifera', 'niecierpek gruczołowaty'),
  al('Acer negundo', 'klon jesionolistny', { woody: true }),
  al('Padus serotina', 'czeremcha amerykańska', { woody: true }),
  al('Prunus serotina', 'czeremcha amerykańska (syn.)', { woody: true }),
  // archeofity z tab. 10 sprawozdania 2016–2018 („nie stanowią zagrożenia dla siedliska”); chwastnica jest jednak przykładem w tab. 1
  al('Echinochloa crus-galli', 'chwastnica jednostronna', WEAK),
  al('Setaria pumila', 'włośnica sina', WEAK),
  al('Setaria viridis', 'włośnica zielona', WEAK),
  al('Fallopia convolvulus', 'rdestówka powojowata', WEAK),
  al('Lathyrus tuberosus', 'groszek bulwiasty', WEAK),

  // drzewa i krzewy – karta przykładowa i sprawozdania
  wd('Rhamnus cathartica', 'szakłak pospolity'),
  wd('Prunus spinosa', 'śliwa tarnina'),
  wd('Salix cinerea', 'wierzba szara'),
  wd('Salix aurita', 'wierzba uszata'),
  wd('Salix pentandra', 'wierzba pięciopręcikowa'),
  wd('Salix fragilis', 'wierzba krucha'),
  wd('Salix alba', 'wierzba biała'),
  wd('Salix triandra', 'wierzba trójpręcikowa'),
  wd('Salix viminalis', 'wierzba wiciowa'),
  wd('Salix purpurea', 'wierzba purpurowa'),
  wd('Alnus glutinosa', 'olsza czarna'),
  wd('Fraxinus excelsior', 'jesion wyniosły'),
  wd('Quercus robur', 'dąb szypułkowy'),
  wd('Ulmus laevis', 'wiąz szypułkowy'),
  wd('Populus tremula', 'topola osika'),
  wd('Betula pendula', 'brzoza brodawkowata'),
  wd('Pyrus pyraster', 'grusza polna'),
  wd('Crataegus monogyna', 'głóg jednoszyjkowy'),
  wd('Rosa canina', 'róża dzika'),
  wd('Frangula alnus', 'kruszyna pospolita'),
  wd('Viburnum opulus', 'kalina koralowa'),
  wd('Cornus sanguinea', 'dereń świdwa'),
  wd('Euonymus europaeus', 'trzmielina zwyczajna'),

  // gatunki cenne z karty przykładowej (poza charakterystycznymi)
  co('Lotus tenuis', 'komonica wąskolistna', V),
  co('Thalictrum lucidum', 'rutewka wąskolistna', V),
  co('Euphorbia lucida', 'wilczomlecz błyszczący', V),
  co('Iris sibirica', 'kosaciec syberyjski', V),
  co('Gentiana pneumonanthe', 'goryczka wąskolistna', V),
  // pozostałe gatunki ze zdjęć karty przykładowej
  co('Achillea millefolium', 'krwawnik pospolity'),
  co('Agrostis stolonifera', 'mietlica rozłogowa'),
  co('Agrostis capillaris', 'mietlica pospolita'),
  co('Agrostis gigantea', 'mietlica olbrzymia'),
  co('Armeria maritima', 'zawciąg pospolity'),
  co('Cardamine pratensis', 'rzeżucha łąkowa'),
  co('Carex flacca', 'turzyca sina'),
  co('Centaurea jacea', 'chaber łąkowy'),
  co('Equisetum palustre', 'skrzyp błotny'),
  co('Festuca pratensis', 'kostrzewa łąkowa'),
  co('Filipendula vulgaris', 'wiązówka bulwkowa'),
  co('Fragaria viridis', 'poziomka twardawa'),
  co('Galium boreale', 'przytulia północna'),
  co('Glechoma hederacea', 'bluszczyk kurdybanek'),
  co('Hieracium umbellatum', 'jastrzębiec baldaszkowaty'),
  co('Lathyrus pratensis', 'groszek łąkowy'),
  co('Leontodon autumnalis', 'brodawnik jesienny'),
  co('Leontodon hispidus', 'brodawnik zwyczajny'),
  co('Linum catharticum', 'len przeczyszczający'),
  co('Lotus uliginosus', 'komonica błotna'),
  co('Lythrum salicaria', 'krwawnica pospolita'),
  co('Medicago lupulina', 'lucerna nerkowata'),
  co('Phleum pratense', 'tymotka łąkowa'),
  co('Plantago lanceolata', 'babka lancetowata'),
  co('Poa palustris', 'wiechlina błotna'),
  co('Potentilla erecta', 'pięciornik kurze ziele'),
  co('Ranunculus acris', 'jaskier ostry'),
  co('Ranunculus repens', 'jaskier rozłogowy'),
  co('Rumex acetosa', 'szczaw zwyczajny'),
  co('Sedum sexangulare', 'rozchodnik sześciorzędowy'),
  co('Stellaria graminea', 'gwiazdnica trawiasta'),
  co('Stellaria palustris', 'gwiazdnica błotna'),
  co('Trifolium pratense', 'koniczyna łąkowa'),
  co('Trifolium repens', 'koniczyna biała'),
  co('Vicia cracca', 'wyka ptasia'),
  co('Viola canina', 'fiołek psi'),
  // typowe gatunki łąk zmiennowilgotnych w kontakcie z 6440
  co('Sanguisorba officinalis', 'krwiściąg lekarski'),
  co('Galium uliginosum', 'przytulia błotna'),
  co('Molinia caerulea', 'trzęślica modra'),
  co('Serratula tinctoria', 'sierpik barwierski'),
]

const BY_NAME = new Map(SPECIES_6440.map((s) => [normalizeName(s.latin), s]))

export const findSpecies6440 = (name: string): SpeciesEntry6440 | undefined => BY_NAME.get(normalizeName(name))

/** Klucz do liczenia gatunków: synonimy (Cnidium dubium/venosum, Viola stagnina/persicifolia…) dają jeden klucz. */
export const speciesKey6440 = (name: string) => (findSpecies6440(name)?.polish ?? normalizeName(name)).replace(/ \(syn\.\)$/, '')

const groupOf = (name: string) => findSpecies6440(name)?.group
export const isCharacteristic6440 = (name: string) => groupOf(name) === 'characteristic'
export const isDistinguishing6440 = (name: string) => groupOf(name) === 'distinguishing'
export const isExpansive6440 = (name: string) => groupOf(name) === 'expansive'
export const isAlien6440 = (name: string) => groupOf(name) === 'alien'
export const isWeakAlien6440 = (name: string) => Boolean(findSpecies6440(name)?.weak)
export const isWoody6440 = (name: string) => Boolean(findSpecies6440(name)?.woody)
export const expansiveKind6440 = (name: string): ExpansiveKind | undefined => findSpecies6440(name)?.kind

export const defaultLayer6440 = (s: SpeciesEntry6440): Layer => (s.woody ? 'B' : 'C')
