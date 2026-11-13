// Słownik gatunków dla 2160 (nadmorskie wydmy z zaroślami rokitnika), zebrany z przewodnika GIOŚ (Lemke 2012,
// rozdz. „Typowe gatunki roślin”, tab. 1 i 2), z przykładowej karty („Mewia Łacha” 1, 2010) i ze sprawozdań
// z monitoringu 2009–2011, 2015–2018 i 2020–2021 (gatunki ekspansywne i obce). Zarośla rokitnika to jedyne
// siedlisko wydmowe z wyraźną warstwą krzewów – w zdjęciu rokitnik siedzi w B, drzewa ekspansywne w A, runo w C.
import type { Layer } from '../../7120/habitats/types'

export type SpeciesGroup2160 =
  | 'key' // rokitnik zwyczajny – „w zasadzie jedyny gatunek charakterystyczny”
  | 'combination' // charakterystyczna kombinacja gatunków z tab. 1 i 2 (wydma szara + higro- i nitrofilne)
  | 'woody' // drzewa i krzewy (rodzime, poza rokitnikiem)
  | 'companion' // inne gatunki runa
  | 'alien' // obce geograficznie (antropofity)

export interface SpeciesEntry2160 {
  latin: string
  polish: string
  group: SpeciesGroup2160
  /** Gatunek ekspansywny drzew i krzewów (tab. 1 + sprawozdanie 2021). */
  expansive?: boolean
  /** Ekspansywny gatunek obcy w podszyciu i runie (sprawozdania 2016 i 2021, tab. gatunków obcych). */
  invasive?: boolean
  layer?: Layer
}

export const GROUP_LABELS_2160: Record<SpeciesGroup2160, string> = {
  key: 'gatunek charakterystyczny 2160',
  combination: 'charakterystyczna kombinacja gatunków 2160',
  woody: 'drzewo lub krzew',
  companion: 'gatunek towarzyszący',
  alien: 'gatunek obcy geograficznie',
}

const e = (latin: string, polish: string, group: SpeciesGroup2160, extra: Partial<SpeciesEntry2160> = {}): SpeciesEntry2160 => ({
  latin,
  polish,
  group,
  ...extra,
})

export const SPECIES_2160: SpeciesEntry2160[] = [
  e('Hippophaë rhamnoides', 'rokitnik zwyczajny', 'key', { layer: 'B' }),
  // charakterystyczna kombinacja gatunków (tab. 1 i 2): psammofilne z wydm szarych + higro- i nitrofilne
  e('Lathyrus japonicus', 'groszek nadmorski', 'combination'),
  e('Carex arenaria', 'turzyca piaskowa', 'combination'),
  e('Jasione montana', 'jasieniec piaskowy', 'combination'),
  e('Festuca rubra', 'kostrzewa czerwona', 'combination'),
  e('Geranium robertianum', 'bodziszek cuchnący', 'combination'),
  e('Urtica dioica', 'pokrzywa zwyczajna', 'combination'),
  e('Phragmites australis', 'trzcina pospolita', 'combination'),
  // gatunki ekspansywne drzew i krzewów: tab. 1 (pięć gatunków + róża) i sprawozdanie 2021
  e('Pinus sylvestris', 'sosna zwyczajna', 'woody', { expansive: true, layer: 'A' }),
  e('Salix daphnoides', 'wierzba wawrzynkowa', 'woody', { expansive: true, layer: 'B' }),
  e('Populus tremula', 'topola osika', 'woody', { expansive: true, layer: 'A' }),
  e('Betula pendula', 'brzoza brodawkowata', 'woody', { expansive: true, layer: 'A' }),
  e('Salix fragilis', 'wierzba krucha', 'woody', { expansive: true, layer: 'A' }),
  e('Corylus avellana', 'leszczyna pospolita', 'woody', { expansive: true, layer: 'B' }),
  e('Acer platanoides', 'klon zwyczajny', 'woody', { expansive: true, layer: 'A' }),
  e('Salix arenaria', 'wierzba piaskowa', 'woody', { layer: 'B' }),
  e('Frangula alnus', 'kruszyna pospolita', 'woody', { layer: 'B' }),
  e('Quercus robur', 'dąb szypułkowy', 'woody', { layer: 'A' }),
  e('Alnus glutinosa', 'olsza czarna', 'woody', { layer: 'A' }),
  e('Rubus idaeus', 'malina właściwa', 'woody', { layer: 'C' }),
  // obce geograficznie – sadzone do „stabilizacji” wydm (róża, wierzba ostrolistna) i chwasty runa
  e('Rosa rugosa', 'róża pomarszczona', 'alien', { expansive: true, invasive: true, layer: 'B' }),
  e('Salix acutifolia', 'wierzba ostrolistna', 'alien', { expansive: true, invasive: true, layer: 'A' }),
  e('Impatiens parviflora', 'niecierpek drobnokwiatowy', 'alien', { invasive: true }),
  e('Solidago gigantea', 'nawłoć późna', 'alien', { invasive: true }),
  // runo: przykładowa karta (Mewia Łacha 1) i sprawozdanie 2021
  e('Achillea millefolium', 'krwawnik pospolity', 'companion'),
  e('Achillea ptarmica', 'krwawnik kichawiec', 'companion'),
  e('Ammophila arenaria', 'piaskownica zwyczajna', 'companion'),
  e('Angelica archangelica', 'dzięgiel litwor', 'companion'),
  e('Artemisia campestris', 'bylica polna', 'companion'),
  e('Bidens cernua', 'uczep zwisły', 'companion'),
  e('Calamagrostis epigejos', 'trzcinnik piaskowy', 'companion'),
  e('Carex gracilis', 'turzyca zaostrzona', 'companion'),
  e('Carex hirta', 'turzyca owłosiona', 'companion'),
  e('Convolvulus arvensis', 'powój polny', 'companion'),
  e('Corynephorus canescens', 'szczotlicha siwa', 'companion'),
  e('Dactylis glomerata', 'kupkówka pospolita', 'companion'),
  e('Epilobium palustre', 'wierzbownica błotna', 'companion'),
  e('Equisetum sylvaticum', 'skrzyp leśny', 'companion'),
  e('Eupatorium cannabinum', 'sadziec konopiasty', 'companion'),
  e('Filipendula ulmaria', 'wiązówka błotna', 'companion'),
  e('Galeopsis bifida', 'poziewnik dwudzielny', 'companion'),
  e('Helichrysum arenarium', 'kocanki piaskowe', 'companion'),
  e('Hieracium umbellatum', 'jastrzębiec baldaszkowaty', 'companion'),
  e('Humulus lupulus', 'chmiel zwyczajny', 'companion'),
  e('Hypochoeris radicata', 'prosienicznik szorstki', 'companion'),
  e('Iris pseudacorus', 'kosaciec żółty', 'companion'),
  e('Linaria vulgaris', 'lnica pospolita', 'companion'),
  e('Lycopus europaeus', 'karbieniec pospolity', 'companion'),
  e('Melilotus officinalis', 'nostrzyk żółty', 'companion'),
  e('Petasites spurius', 'lepiężnik kutnerowaty', 'companion'),
  e('Ranunculus repens', 'jaskier rozłogowy', 'companion'),
  e('Rumex acetosella', 'szczaw polny', 'companion'),
  e('Scutellaria galericulata', 'tarczyca pospolita', 'companion'),
  e('Sedum acre', 'rozchodnik ostry', 'companion'),
  e('Solanum dulcamara', 'psianka słodkogórz', 'companion'),
  e('Solidago virgaurea', 'nawłoć pospolita', 'companion'),
  e('Stachys palustris', 'czyściec błotny', 'companion'),
  e('Tanacetum vulgare', 'wrotycz pospolity', 'companion'),
  e('Taraxacum officinale', 'mniszek lekarski', 'companion'),
  e('Thalictrum aquilegiifolium', 'rutewka orlikolistna', 'companion'),
  e('Valeriana officinalis', 'kozłek lekarski', 'companion'),
  e('Veronica longifolia', 'przetacznik długolistny', 'companion'),
  e('Vicia angustifolia', 'wyka wąskolistna', 'companion'),
  e('Vicia cracca', 'wyka ptasia', 'companion'),
]

/** Normalizacja do wyszukiwania: małe litery, bez znaków diakrytycznych (Hippophaë = Hippophae), pojedyncze spacje. */
export const normalize2160 = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

const BY_NAME = new Map(SPECIES_2160.map((s) => [normalize2160(s.latin), s]))

export const findSpecies2160 = (name: string): SpeciesEntry2160 | undefined => BY_NAME.get(normalize2160(name))

export const isHippophae2160 = (name: string) => findSpecies2160(name)?.group === 'key'
export const isCombination2160 = (name: string) => findSpecies2160(name)?.group === 'combination'
export const isExpansive2160 = (name: string) => !!findSpecies2160(name)?.expansive
export const isInvasive2160 = (name: string) => !!findSpecies2160(name)?.invasive

/** Warstwa przy dodawaniu do zdjęcia: z katalogu, domyślnie C (runo). */
export const defaultLayer2160 = (s: SpeciesEntry2160): Layer => s.layer ?? 'C'
