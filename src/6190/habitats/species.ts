// Słownik gatunków dla 6190 (murawy pannońskie Stipo-Festucetalia pallentis; w Polsce murawy naskalne z kostrzewą bladą
// Asplenio septentrionalis-Festucion pallentis na skałach bezwapiennych Sudetów i ich Przedgórza). Przewodnika
// metodycznego z tab. 1 nie opublikowano (Świerkosz 2021, maszynopis), więc katalog zebrano ze sprawozdań z monitoringu
// 2015–2018 (badania 2016) i 2023–2025 (badania 2024): gatunki diagnostyczne wymieniane przy „Gatunkach
// charakterystycznych”, typowe dominanty (kostrzewa owcza, mszaki), drzewa i krzewy, gatunki synantropijne wkraczające
// przy wydeptywaniu, gatunki obce (tab. 3 sprawozdania 2024) oraz mszaki z propozycji metodyki z 2018 r.
// Drzewa i krzewy – warstwa B, rośliny zielne – C, mchy i porosty – D.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup6190 =
  | 'characteristic' // gatunki diagnostyczne muraw z kostrzewą bladą (sprawozdania 2016 i 2024) – liczą się do wskaźnika
  | 'typicalDominant' // typowe dominanty: kostrzewa owcza, ciepłolubne mszaki – typowe, ale nie charakterystyczne
  | 'typical' // gatunki typowe/towarzyszące muraw naskalnych – NIE są charakterystyczne
  | 'shade' // gatunki wkraczające przy ocienieniu (propozycja metodyki 2018: rokietnik cyprysowaty)
  | 'woody' // drzewa i krzewy – wskaźnik „Ekspansja krzewów i podrostu drzew”
  | 'expansive' // rodzime (i zadomowione dawno) gatunki ekspansywne, w 6190 głównie synantropijne
  | 'alien' // obce gatunki inwazyjne
  | 'companion' // pozostałe

export interface SpeciesEntry6190 {
  latin: string
  polish?: string
  group: SpeciesGroup6190
  /** Mech, wątrobowiec albo porost – warstwa D. */
  moss?: boolean
}

export const GROUP_LABELS_6190: Record<SpeciesGroup6190, string> = {
  characteristic: 'gatunek charakterystyczny muraw z kostrzewą bladą',
  typicalDominant: 'typowy dominant (nie charakterystyczny)',
  typical: 'gatunek typowy muraw naskalnych – nie charakterystyczny',
  shade: 'gatunek wkraczający przy ocienieniu',
  woody: 'drzewo/krzew – „Ekspansja krzewów i podrostu drzew”',
  expansive: 'gatunek ekspansywny (synantropijny)',
  alien: 'gatunek obcy inwazyjny',
  companion: 'gatunek towarzyszący',
}

const e = (latin: string, polish: string, group: SpeciesGroup6190, extra: Partial<SpeciesEntry6190> = {}): SpeciesEntry6190 => ({ latin, polish, group, ...extra })
const M = { moss: true }

/** Gatunek wyznaczający siedlisko – jego brak wśród dominantów obniża „Gatunki dominujące” (sprawozdanie 2024). */
export const KEY_DOMINANT_6190 = 'Festuca pallens'

export const SPECIES_6190: SpeciesEntry6190[] = [
  // gatunki charakterystyczne (diagnostyczne) – sprawozdania 2016 i 2024; synonimy liczone raz (klucz – nazwa polska)
  e('Festuca pallens', 'kostrzewa blada', 'characteristic'),
  e('Asplenium septentrionale', 'zanokcica północna', 'characteristic'),
  e('Asplenium trichomanes', 'zanokcica skalna', 'characteristic'),
  e('Polypodium vulgare', 'paprotka zwyczajna', 'characteristic'),
  e('Sedum maximum', 'rozchodnik wielki', 'characteristic'),
  e('Hylotelephium maximum', 'rozchodnik wielki', 'characteristic'),
  e('Sedum reflexum', 'rozchodnik ościsty', 'characteristic'),
  e('Sedum rupestre', 'rozchodnik ościsty', 'characteristic'),
  e('Sedum acre', 'rozchodnik ostry', 'characteristic'),
  e('Jovibarba sobolifera', 'rojownik pospolity', 'characteristic'),
  e('Sempervivum soboliferum', 'rojownik pospolity', 'characteristic'),
  e('Potentilla argentea', 'pięciornik srebrny', 'characteristic'),
  e('Acinos arvensis', 'czyścica drobnokwiatowa', 'characteristic'),
  e('Clinopodium acinos', 'czyścica drobnokwiatowa', 'characteristic'),
  e('Vincetoxicum hirundinaria', 'ciemiężyk białokwiatowy', 'characteristic'),
  e('Allium montanum', 'czosnek skalny', 'characteristic'),
  e('Allium senescens subsp. montanum', 'czosnek skalny', 'characteristic'),
  e('Veronica spicata', 'przetacznik kłosowy', 'characteristic'),
  e('Phleum phleoides', 'tymotka Boehmera', 'characteristic'),
  e('Dianthus carthusianorum', 'goździk kartuzek', 'characteristic'),

  // typowe dominanty – typowe dla siedliska, ale ich dominacja to zanik roślinności zielnej (sprawozdania 2016 i 2024)
  e('Festuca ovina', 'kostrzewa owcza', 'typicalDominant'),
  e('Polytrichum piliferum', 'płonnik włosisty', 'typicalDominant', M),
  e('Ceratodon purpureus', 'zęboróg purpurowy', 'typicalDominant', M),
  e('Brachythecium albicans', 'krótkosz bielawy', 'typicalDominant', M),
  e('Mannia fragrans', 'mannia pachnąca', 'typicalDominant', M),

  // gatunki typowe/towarzyszące muraw naskalnych na skałach bezwapiennych
  e('Thymus pulegioides', 'macierzanka zwyczajna', 'typical'),
  e('Hieracium pilosella', 'jastrzębiec kosmaczek', 'typical'),
  e('Rumex acetosella', 'szczaw polny', 'typical'),
  e('Scleranthus perennis', 'czerwiec trwały', 'typical'),
  e('Jasione montana', 'jasieniec piaskowy', 'typical'),
  e('Silene nutans', 'lepnica zwisła', 'typical'),
  e('Campanula rotundifolia', 'dzwonek okrągłolistny', 'typical'),
  e('Euphorbia cyparissias', 'wilczomlecz sosnka', 'typical'),
  e('Arenaria serpyllifolia', 'piaskowiec macierzankowy', 'typical'),
  e('Cladonia sp.', 'chrobotek', 'typical', M),

  // wkraczające przy ocienieniu (propozycja metodyki 2018: dominacja rokietnika = degeneracja)
  e('Hypnum cupressiforme', 'rokietnik cyprysowaty', 'shade', M),
  e('Poa nemoralis', 'wiechlina gajowa', 'shade'),

  // drzewa i krzewy (sprawozdania 2016 i 2024)
  e('Rosa canina', 'róża dzika', 'woody'),
  e('Malus sylvestris', 'jabłoń dzika', 'woody'),
  e('Sorbus aucuparia', 'jarząb pospolity', 'woody'),
  e('Populus tremula', 'topola osika', 'woody'),
  e('Betula pendula', 'brzoza brodawkowata', 'woody'),
  e('Taxus baccata', 'cis pospolity', 'woody'),
  e('Quercus petraea', 'dąb bezszypułkowy', 'woody'),
  e('Pinus sylvestris', 'sosna zwyczajna', 'woody'),
  e('Tilia cordata', 'lipa drobnolistna', 'woody'),
  e('Cotoneaster integerrimus', 'irga zwyczajna', 'woody'),
  e('Crataegus monogyna', 'głóg jednoszyjkowy', 'woody'),
  e('Prunus spinosa', 'tarnina', 'woody'),

  // gatunki ekspansywne – w 6190 to rośliny synantropijne wkraczające przy wydeptywaniu i eutrofizacji (2016, 2024)
  e('Polygonum aviculare', 'rdest ptasi', 'expansive'),
  e('Poa annua', 'wiechlina roczna', 'expansive'),
  e('Taraxacum officinale', 'mniszek lekarski', 'expansive'),
  e('Chenopodium strictum', 'komosa prążkowana', 'expansive'),
  e('Chenopodium album', 'komosa biała', 'expansive'),
  e('Fallopia dumetorum', 'rdestówka zaroślowa', 'expansive'),
  e('Capsella bursa-pastoris', 'tasznik pospolity', 'expansive'),
  e('Lolium perenne', 'życica trwała', 'expansive'),
  e('Calamagrostis epigejos', 'trzcinnik piaskowy', 'expansive'),
  e('Urtica dioica', 'pokrzywa zwyczajna', 'expansive'),
  e('Artemisia vulgaris', 'bylica pospolita', 'expansive'),

  // obce gatunki inwazyjne (tab. 10 sprawozdania 2016, tab. 3 sprawozdania 2024)
  e('Chamomilla suaveolens', 'rumianek bezpromieniowy', 'alien'),
  e('Matricaria discoidea', 'rumianek bezpromieniowy', 'alien'),
  e('Conyza canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Erigeron canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Robinia pseudoacacia', 'robinia akacjowa', 'alien'),
  e('Solidago canadensis', 'nawłoć kanadyjska', 'alien'),
  e('Solidago gigantea', 'nawłoć późna', 'alien'),

  // towarzyszące
  e('Origanum vulgare', 'lebiodka pospolita', 'companion'),
  e('Achillea millefolium', 'krwawnik pospolity', 'companion'),
]

const BY_NAME = new Map(SPECIES_6190.map((s) => [normalizeName(s.latin), s]))

export const findSpecies6190 = (name: string): SpeciesEntry6190 | undefined => BY_NAME.get(normalizeName(name))

/** Klucz gatunku do liczenia: synonimy (Jovibarba/Sempervivum, Acinos/Clinopodium…) dają ten sam klucz – nazwę polską. */
export const speciesKey6190 = (name: string) => findSpecies6190(name)?.polish ?? normalizeName(name)

const groupOf = (name: string) => findSpecies6190(name)?.group
export const isCharacteristic6190 = (name: string) => groupOf(name) === 'characteristic'
/** Dominant typowy dla siedliska: gatunek charakterystyczny albo typowy dominant (kostrzewa owcza, ciepłolubne mszaki). */
export const isTypicalDominant6190 = (name: string) => ['characteristic', 'typicalDominant'].includes(groupOf(name) ?? '')
export const isKeyDominant6190 = (name: string) => speciesKey6190(name) === speciesKey6190(KEY_DOMINANT_6190)
export const isWoody6190 = (name: string) => groupOf(name) === 'woody'
export const isAlien6190 = (name: string) => groupOf(name) === 'alien'
export const isExpansive6190 = (name: string) => groupOf(name) === 'expansive'

/** Drzewa i krzewy do B, mchy i porosty do D, reszta do C. */
export const defaultLayer6190 = (s: SpeciesEntry6190): Layer => (s.group === 'woody' ? 'B' : s.moss ? 'D' : 'C')
