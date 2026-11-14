// Słownik gatunków dla 3130 (brzegi lub osuszane dna zbiorników wodnych ze zbiorowiskami z Littorelletea,
// Isoëto-Nanojuncetea), zebrany z przewodnika GIOŚ (Zalewska-Gałosz 2015, tom IV, rozdz. „Typowe gatunki roślin”
// i tab. 1), z przykładowej karty (Przeborek, 2013) i ze sprawozdań z monitoringu 2013–2014, 2015–2018
// i 2023–2025 (gatunki obce – tab. 4 sprawozdania 2023–2025). Zbiorowiska namuliskowe to niska, jednowarstwowa
// ruń – w zdjęciu prawie wszystko w C, mszaki, wątrobowce i glon w D, nalot wierzb w B.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup3130 =
  | 'characteristic' // gatunki charakterystyczne z tab. 1 (Lobelion, Hydrocotylo-Baldellion, Elatini-Eleocharition ovatae)
  | 'aquatic' // formy lądowe gatunków wodnych – tab. 1: mogą lokalnie dominować (gatunki dominujące)
  | 'expansive' // rodzime gatunki ekspansywne: szuwary, Bidentetea, nalot wierzb (tab. 1 + sprawozdania)
  | 'alien' // gatunki obce (tab. 1 + tab. 4 sprawozdania 2023–2025)
  | 'companion' // inne gatunki towarzyszące

export interface SpeciesEntry3130 {
  latin: string
  polish?: string
  group: SpeciesGroup3130
  /** Wymieniony w tab. 1 przewodnika (dla ekspansywnych i obcych); bez tego – z praktyki sprawozdań. */
  tab1?: boolean
  /** Mszak, wątrobowiec, glewik albo glon – w zdjęciu warstwa D. */
  cryptogam?: boolean
  /** Drzewo lub krzew – w zdjęciu warstwa B. */
  woody?: boolean
  /** Gatunek zbiorczy (rodzaj): „Callitriche sp.”, „Batrachium juv.” – każda nazwa z tym rodzajem trafia tutaj. */
  genus?: boolean
}

export const GROUP_LABELS_3130: Record<SpeciesGroup3130, string> = {
  characteristic: 'gatunek charakterystyczny 3130',
  aquatic: 'forma lądowa gatunku wodnego – może dominować',
  expansive: 'gatunek ekspansywny',
  alien: 'gatunek obcy',
  companion: 'gatunek towarzyszący',
}

const e = (latin: string, polish: string, group: SpeciesGroup3130, extra: Partial<SpeciesEntry3130> = {}): SpeciesEntry3130 => ({ latin, polish, group, ...extra })
const D = { cryptogam: true }
const T1 = { tab1: true }

export const SPECIES_3130: SpeciesEntry3130[] = [
  // gatunki charakterystyczne – tab. 1: rośliny naczyniowe (z synonimami spotykanymi w kartach i sprawozdaniach)
  e('Juncus bulbosus', 'sit drobny', 'characteristic'),
  e('Ranunculus reptans', 'jaskier leżący', 'characteristic'),
  e('Pilularia globulifera', 'gałuszka kulecznica', 'characteristic'),
  e('Limosella aquatica', 'namulnik brzegowy', 'characteristic'),
  e('Cyperus fuscus', 'cibora brunatna', 'characteristic'),
  e('Eleocharis acicularis', 'ponikło igłowate', 'characteristic'),
  e('Carex bohemica', 'turzyca ciborowata', 'characteristic'),
  e('Eleocharis ovata', 'ponikło jajowate', 'characteristic'),
  e('Elatine hexandra', 'nadwodnik sześciopręcikowy', 'characteristic'),
  e('Elatine triandra', 'nadwodnik trójpręcikowy', 'characteristic'),
  e('Elatine hydropiper', 'nadwodnik naprzeciwlistny', 'characteristic'),
  e('Elatine alsinastrum', 'nadwodnik okółkowy', 'characteristic'),
  e('Lindernia procumbens', 'lindernia mułowa', 'characteristic'),
  e('Coleanthus subtilis', 'koleantus delikatny', 'characteristic'),
  e('Peplis portula', 'bebłek błotny', 'characteristic'),
  e('Lythrum portula', 'bebłek błotny', 'characteristic'),
  e('Littorella uniflora', 'brzeżyca jednokwiatowa', 'characteristic'),
  e('Samolus valerandi', 'jarnik solankowy', 'characteristic'),
  e('Dichostylis micheliana', 'dichostylis Michela', 'characteristic'),
  e('Cyperus michelianus', 'dichostylis Michela', 'characteristic'),
  e('Crassula aquatica', 'uwroć wodna', 'characteristic'),
  e('Potentilla supina', 'pięciornik niski', 'characteristic'),
  e('Cyperus flavescens', 'cibora żółta', 'characteristic'),
  e('Pycreus flavescens', 'cibora żółta', 'characteristic'),
  e('Isolepis setacea', 'sitniczka szczecinowata', 'characteristic'),
  e('Plantago intermedia', 'babka pośrednia (wielonasienna)', 'characteristic'),
  e('Plantago major subsp. intermedia', 'babka pośrednia (wielonasienna)', 'characteristic'),
  e('Juncus bufonius', 'sit dwudzielny', 'characteristic'),
  e('Callitriche sp.', 'rzęśl (formy lądowe)', 'characteristic', { genus: true }),
  e('Gnaphalium uliginosum', 'szarota błotna', 'characteristic'),
  e('Filaginella uliginosa', 'szarota błotna', 'characteristic'),
  e('Gnaphalium luteo-album', 'szarota żółtobiała', 'characteristic'),
  e('Pseudognaphalium luteoalbum', 'szarota żółtobiała', 'characteristic'),
  e('Carex oederi', 'turzyca Oedera', 'characteristic'),
  e('Carex viridula', 'turzyca Oedera', 'characteristic'),
  e('Myosurus minimus', 'mysiurek drobny', 'characteristic'),
  e('Batrachium sp.', 'włosienicznik (stadia młodociane)', 'characteristic', { genus: true }),
  e('Centaurium pulchellum', 'centuria nadobna', 'characteristic'),
  // gatunki charakterystyczne – tab. 1: mchy, wątrobowce, glewiki, glon
  e('Physcomitrium eurystomum', 'czarecznik szerokootworowy', 'characteristic', D),
  e('Physcomitrium sphaericum', 'czarecznik jajowaty', 'characteristic', D),
  e('Physcomitrium pyriforme', 'czarecznik gruszkowaty', 'characteristic', D),
  e('Leptobryum pyriforme', 'zgliszczyn gruszkowaty', 'characteristic', D),
  e('Bryum rubens agg.', 'prątnik czerwonawy', 'characteristic', D),
  e('Bryum rubens', 'prątnik czerwonawy', 'characteristic', D),
  e('Dicranella staphylina', 'widłoząbek rozmnóżkowy', 'characteristic', D),
  e('Trichodon cylindricus', 'krętoząb cienkolistny', 'characteristic', D),
  e('Tortula truncata', 'brodek ucięty', 'characteristic', D),
  e('Pohlia wahlenbergii', 'borześlad białawy', 'characteristic', D),
  e('Riccia cavernosa', 'wgłębka jamkowata', 'characteristic', D),
  e('Riccia sorocarpa', 'wgłębka wąskopłatowa', 'characteristic', D),
  e('Riccia canaliculata', 'wgłębka rynnowata', 'characteristic', D),
  e('Fossombronia wondraczekii', 'czarostka Wondraczekiego', 'characteristic', D),
  e('Anthoceros agrestis', 'glewik polny', 'characteristic', D),
  e('Phaeoceros carolinianus', 'glewiczek karoliński', 'characteristic', D),
  e('Botrydium granulatum', 'wydętka ziarnista (glon)', 'characteristic', D),
  // formy lądowe gatunków wodnych – tab. 1: mogą lokalnie dominować (do oceny gatunków charakterystycznych się nie liczą)
  e('Potamogeton gramineus', 'rdestnica trawiasta (forma lądowa)', 'aquatic'),
  e('Potamogeton natans', 'rdestnica pływająca (forma lądowa)', 'aquatic'),
  e('Polygonum amphibium', 'rdest ziemnowodny (forma lądowa)', 'aquatic'),
  e('Persicaria amphibia', 'rdest ziemnowodny (forma lądowa)', 'aquatic'),
  e('Myriophyllum alterniflorum', 'wywłócznik skrętoległy (forma lądowa)', 'aquatic'),
  e('Hippuris vulgaris', 'przęstka pospolita (forma lądowa)', 'aquatic'),
  e('Lobelia dortmanna', 'lobelia jeziorna', 'aquatic'),
  e('Isoëtes lacustris', 'poryblin jeziorny', 'aquatic'),
  e('Sparganium natans', 'jeżogłówka najmniejsza (forma lądowa)', 'aquatic'),
  e('Sagittaria sagittifolia', 'strzałka wodna (forma lądowa)', 'aquatic'),
  // ekspansywne – tab. 1 (szuwary, Bidentetea, nalot wierzb) + sprawozdania 2013–2014 i 2023–2025
  e('Eleocharis palustris', 'ponikło błotne', 'expansive', T1),
  e('Equisetum fluviatile', 'skrzyp bagienny', 'expansive', T1),
  e('Carex rostrata', 'turzyca dzióbkowata', 'expansive', T1),
  e('Juncus articulatus', 'sit członowany', 'expansive', T1),
  e('Phragmites australis', 'trzcina pospolita', 'expansive', T1),
  e('Typha latifolia', 'pałka szerokolistna', 'expansive', T1),
  e('Typha angustifolia', 'pałka wąskolistna', 'expansive', T1),
  e('Schoenoplectus lacustris', 'oczeret jeziorny', 'expansive', T1),
  e('Polygonum lapathifolium', 'rdest szczawiolistny', 'expansive', T1),
  e('Persicaria lapathifolia', 'rdest szczawiolistny', 'expansive', T1),
  e('Polygonum persicaria', 'rdest plamisty', 'expansive', T1),
  e('Persicaria maculosa', 'rdest plamisty', 'expansive', T1),
  e('Bidens tripartita', 'uczep trójlistkowy', 'expansive', T1),
  e('Bidens cernua', 'uczep zwisły', 'expansive', T1),
  e('Bidens radiata', 'uczep śląski', 'expansive', T1),
  e('Rorippa palustris', 'rzepicha błotna', 'expansive', T1),
  e('Rorippa amphibia', 'rzepicha ziemnowodna', 'expansive', T1),
  e('Ranunculus sceleratus', 'jaskier jadowity', 'expansive', T1),
  e('Salix sp.', 'wierzba (nalot)', 'expansive', { tab1: true, genus: true, woody: true }),
  e('Polygonum hydropiper', 'rdest ostrogorzki', 'expansive'),
  e('Persicaria hydropiper', 'rdest ostrogorzki', 'expansive'),
  e('Rumex maritimus', 'szczaw nadmorski', 'expansive'),
  e('Sparganium erectum', 'jeżogłówka gałęzista', 'expansive'),
  e('Juncus effusus', 'sit rozpierzchły', 'expansive'),
  e('Juncus conglomeratus', 'sit skupiony', 'expansive'),
  e('Glyceria maxima', 'manna mielec', 'expansive'),
  e('Glyceria fluitans', 'manna jadalna', 'expansive'),
  e('Agrostis stolonifera', 'mietlica rozłogowa', 'expansive'),
  e('Deschampsia flexuosa', 'śmiałek pogięty', 'expansive'),
  e('Phalaris arundinacea', 'mozga trzcinowata', 'expansive'),
  e('Carex acuta', 'turzyca zaostrzona', 'expansive'),
  e('Carex vesicaria', 'turzyca pęcherzykowata', 'expansive'),
  e('Carex nigra', 'turzyca pospolita', 'expansive'),
  e('Alnus glutinosa', 'olsza czarna (nalot)', 'expansive', { woody: true }),
  // obce – tab. 1 i tab. 4 sprawozdania 2023–2025
  e('Spiraea tomentosa', 'tawuła kutnerowata', 'alien', T1),
  e('Bidens frondosa', 'uczep amerykański', 'alien', T1),
  e('Lindernia dubia', 'lindernia ząbkowana', 'alien', T1),
  e('Veronica peregrina', 'przetacznik obcy', 'alien', T1),
  e('Echinochloa crus-galli', 'chwastnica jednostronna', 'alien'),
  e('Conyza canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Erigeron canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Solidago canadensis', 'nawłoć kanadyjska', 'alien'),
  e('Solidago gigantea', 'nawłoć późna', 'alien'),
  e('Juncus tenuis', 'sit chudy', 'alien'),
  e('Epilobium ciliatum', 'wierzbownica gruczołowata', 'alien'),
  e('Epilobium adenocaulon', 'wierzbownica gruczołowata', 'alien'),
  e('Erechtites hieraciifolia', 'erechtites jastrzębcowaty', 'alien'),
  e('Eragrostis albensis', 'miłka połabska', 'alien'),
  e('Echinocystis lobata', 'kolczurka klapowana', 'alien'),
  e('Azolla filiculoides', 'azolla drobna', 'alien'),
  e('Impatiens glandulifera', 'niecierpek gruczołowaty', 'alien'),
  e('Portulaca oleracea', 'portulaka pospolita', 'alien'),
  e('Erigeron annuus', 'przymiotno białe', 'alien'),
  e('Chamomilla suaveolens', 'rumianek bezpromieniowy', 'alien'),
  e('Matricaria discoidea', 'rumianek bezpromieniowy', 'alien'),
  e('Xanthium albinum', 'rzepień brzegowy', 'alien'),
  // towarzyszące – częste na namuliskach, do żadnego wskaźnika się nie liczą
  e('Alisma plantago-aquatica', 'żabieniec babka wodna', 'companion'),
  e('Ranunculus flammula', 'jaskier płomiennik', 'companion'),
  e('Hydrocotyle vulgaris', 'wąkrota zwyczajna', 'companion'),
  e('Lycopus europaeus', 'karbieniec pospolity', 'companion'),
  e('Lythrum salicaria', 'krwawnica pospolita', 'companion'),
  e('Mentha aquatica', 'mięta nadwodna', 'companion'),
  e('Veronica beccabunga', 'przetacznik bobowniczek', 'companion'),
  e('Veronica anagallis-aquatica', 'przetacznik bobownik', 'companion'),
  e('Eleocharis mamillata', 'ponikło sutkowate', 'companion'),
  e('Juncus alpinoarticulatus', 'sit alpejski', 'companion'),
  e('Spergularia rubra', 'sporek czerwony', 'companion'),
  e('Rumex palustris', 'szczaw błotny', 'companion'),
  e('Chenopodium rubrum', 'komosa czerwonawa', 'companion'),
  e('Chenopodium glaucum', 'komosa sina', 'companion'),
  e('Rorippa sylvestris', 'rzepicha leśna', 'companion'),
  e('Ranunculus repens', 'jaskier rozłogowy', 'companion'),
  e('Potentilla anserina', 'pięciornik gęsi', 'companion'),
  e('Plantago major', 'babka zwyczajna', 'companion'),
]

const BY_NAME = new Map(SPECIES_3130.map((s) => [normalizeName(s.latin), s]))
// „Isoëtes” i „Isoetes”, „luteo-album” i „luteoalbum” – ta sama nazwa
const fold = (s: string) => normalizeName(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/-/g, '')
const BY_FOLDED = new Map(SPECIES_3130.map((s) => [fold(s.latin), s]))
const GENERA = new Map(SPECIES_3130.filter((s) => s.genus).map((s) => [normalizeName(s.latin.split(' ')[0]), s]))

/**
 * Wpis katalogu dla nazwy. Rodzaje zbiorcze z tab. 1 łapią każdą nazwę z tego rodzaju: „Callitriche palustris”,
 * „Calitriche sp.” (literówka z karty), „Batrachium juv.”, „Salix cinerea” (nalot wierzb).
 */
export function findSpecies3130(name: string): SpeciesEntry3130 | undefined {
  const hit = BY_NAME.get(normalizeName(name)) ?? BY_FOLDED.get(fold(name))
  if (hit) return hit
  const genus = normalizeName(name).split(' ')[0].replace(/^calitriche$/, 'callitriche')
  return GENERA.get(genus)
}

export const isCharacteristic3130 = (name: string) => findSpecies3130(name)?.group === 'characteristic'
/** Gatunek, którego dominacja nie obniża oceny: charakterystyczny albo forma lądowa gatunku wodnego (tab. 1). */
export const isTypicalDominant3130 = (name: string) => {
  const g = findSpecies3130(name)?.group
  return g === 'characteristic' || g === 'aquatic'
}
export const isExpansive3130 = (name: string) => findSpecies3130(name)?.group === 'expansive'
export const isAlien3130 = (name: string) => findSpecies3130(name)?.group === 'alien'
export const isSpiraeaTomentosa = (name: string) => findSpecies3130(name)?.latin === 'Spiraea tomentosa'

/**
 * Klucz gatunku do liczenia: synonimy (Peplis portula = Lythrum portula, Gnaphalium uliginosum = Filaginella uliginosa…)
 * i wszystkie rzęśle / włosieniczniki dają ten sam klucz – polską nazwę z katalogu. Spoza katalogu – nazwa znormalizowana.
 */
export const speciesKey3130 = (name: string) => findSpecies3130(name)?.polish ?? normalizeName(name)

/** Mszaki, wątrobowce i glon do D, nalot wierzb, olszy i tawuła do B, reszta do C. */
export const defaultLayer3130 = (s: SpeciesEntry3130): Layer => {
  if (s.cryptogam) return 'D'
  if (s.woody || s.latin === 'Spiraea tomentosa') return 'B'
  return 'C'
}
