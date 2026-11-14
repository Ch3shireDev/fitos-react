// Słownik gatunków dla 4080 (subalpejskie zarośla wierzby lapońskiej lub wierzby śląskiej), zebrany z przewodnika GIOŚ
// (Świerkosz 2012, „Typowe gatunki roślin”, „Warunki ekologiczne”, tab. 1 i 2), z przykładowej karty (Kocioł Wielkiego
// Stawu, 2010) i ze sprawozdań z monitoringu 2009–2011, 2016–2018 i 2021. Zarośla to warstwa B (wierzby, olsza zielona,
// jarząb, kosodrzewina), pod nimi ziołorośla, traworośla i krzewinki w warstwie C oraz mchy i torfowce w D.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup4080 =
  | 'willow' // wierzby typowe dla siedliska (tab. 1: lapońska, śląska, szwajcarska) – liczą się do wskaźnika występowania
  | 'shrub' // inne krzewy zarośli subalpejskich (olsza zielona, jarząb, porzeczka skalna)
  | 'mugo' // kosodrzewina – wskaźnik „Ekspansja kosodrzewiny”
  | 'tallherb' // ziołorośla i traworośla Betulo-Adenostyletea – „Charakterystyczna kombinacja gatunków”
  | 'typical' // inne gatunki typowe z pkt 4 przewodnika (krzewinki, gatunki borowe i wysokogórskie)
  | 'companion' // gatunki towarzyszące (postać torfowiskowa, karta przykładowa)
  | 'moss' // mszaki warstwy D

export interface SpeciesEntry4080 {
  latin: string
  polish?: string
  group: SpeciesGroup4080
  /** Krzew albo drzewo – w zdjęciu warstwa B. */
  woody?: boolean
  /** Gatunek wymieniony w tab. 1 jako możliwy dominant runa (wskaźnik „Gatunki dominujące”). */
  dominant?: boolean
}

export const GROUP_LABELS_4080: Record<SpeciesGroup4080, string> = {
  willow: 'wierzba typowa dla 4080',
  shrub: 'krzew zarośli subalpejskich',
  mugo: 'kosodrzewina – liczy się do „ekspansji kosodrzewiny”',
  tallherb: 'gatunek ziołoroślowy / traworoślowy (Betulo-Adenostyletea)',
  typical: 'gatunek typowy dla 4080 (pkt 4 przewodnika)',
  companion: 'gatunek towarzyszący',
  moss: 'mszak',
}

const e = (latin: string, polish: string, group: SpeciesGroup4080, extra: Partial<SpeciesEntry4080> = {}): SpeciesEntry4080 => ({ latin, polish, group, ...extra })
const W = { woody: true }
const D = { dominant: true }

export const SPECIES_4080: SpeciesEntry4080[] = [
  // wierzby typowe (tab. 1)
  e('Salix lapponum', 'wierzba lapońska', 'willow', W),
  e('Salix silesiaca', 'wierzba śląska', 'willow', W),
  e('Salix helvetica', 'wierzba szwajcarska', 'willow', W),

  // inne krzewy
  e('Alnus viridis', 'olsza zielona (kosa)', 'shrub', W),
  e('Alnus alnobetula', 'olsza zielona (kosa)', 'shrub', W),
  e('Sorbus aucuparia', 'jarząb pospolity', 'shrub', W),
  e('Ribes petraeum', 'porzeczka skalna', 'shrub', W),
  e('Salix caprea', 'wierzba iwa', 'shrub', W),
  e('Salix aurita', 'wierzba uszata', 'shrub', W),
  e('Picea abies', 'świerk pospolity', 'shrub', W),
  e('Lonicera nigra', 'wiciokrzew czarny', 'shrub', W),
  e('Rosa pendulina', 'róża alpejska', 'shrub', W),
  e('Pinus mugo', 'kosodrzewina', 'mugo', W),

  // ziołorośla i traworośla (Betulo-Adenostyletea)
  e('Athyrium distentifolium', 'wietlica alpejska', 'tallherb', D),
  e('Aconitum firmum', 'tojad mocny', 'tallherb'),
  e('Rumex alpestris', 'szczaw górski', 'tallherb'),
  e('Rumex arifolius', 'szczaw górski', 'tallherb'),
  e('Ranunculus platanifolius', 'jaskier platanolistny', 'tallherb'),
  e('Adenostyles alliariae', 'miłosna górska', 'tallherb'),
  e('Cicerbita alpina', 'modrzyk górski', 'tallherb'),
  e('Calamagrostis villosa', 'trzcinnik owłosiony', 'tallherb', D),
  e('Calamagrostis arundinacea', 'trzcinnik leśny', 'tallherb'),
  e('Veratrum lobelianum', 'ciemiężyca zielona', 'tallherb'),
  e('Polygonum bistorta', 'rdest wężownik', 'tallherb'),
  e('Bistorta officinalis', 'rdest wężownik', 'tallherb'),
  e('Prenanthes purpurea', 'przenęt purpurowy', 'tallherb'),
  e('Valeriana tripteris', 'kozłek trójlistkowy', 'tallherb'),
  e('Rhodiola rosea', 'różeniec górski', 'tallherb'),
  e('Doronicum austriacum', 'omieg górski', 'tallherb'),
  e('Senecio subalpinus', 'starzec kosmatolistny', 'tallherb'),
  e('Streptopus amplexifolius', 'liczydło górskie', 'tallherb'),
  e('Viola biflora', 'fiołek dwukwiatowy', 'tallherb'),
  e('Geranium sylvaticum', 'bodziszek leśny', 'tallherb'),
  e('Delphinium elatum', 'ostróżka wyniosła', 'tallherb'),
  e('Pulmonaria filarszkyana', 'miodunka węgierska', 'tallherb'),

  // inne gatunki typowe (pkt 4): krzewinki, gatunki borowe i wysokogórskie
  e('Vaccinium myrtillus', 'borówka czarna', 'typical', D),
  e('Vaccinium vitis-idaea', 'borówka brusznica', 'typical'),
  e('Deschampsia flexuosa', 'śmiałek pogięty', 'typical', D),
  e('Avenella flexuosa', 'śmiałek pogięty', 'typical', D),
  e('Dryopteris dilatata', 'nerecznica szerokolistna', 'typical'),
  e('Homogyne alpina', 'podbiałek alpejski', 'typical'),
  e('Solidago alpestris', 'nawłoć alpejska', 'typical'),
  e('Solidago virgaurea', 'nawłoć pospolita', 'typical'),
  e('Oxalis acetosella', 'szczawik zajęczy', 'typical'),
  e('Campanula polymorpha', 'dzwonek wąskolistny', 'typical'),
  e('Luzula luzuloides', 'kosmatka gajowa', 'typical'),
  e('Luzula alpinopilosa', 'kosmatka brunatna', 'typical'),
  e('Luzula alpino-pilosa', 'kosmatka brunatna', 'typical'),
  e('Hieracium alpinum', 'jastrzębiec alpejski', 'typical'),
  e('Huperzia selago', 'widłak wroniec', 'typical'),
  e('Mutellina purpurea', 'marchwica pospolita', 'typical'),
  e('Geum montanum', 'kuklik górski', 'typical'),
  e('Soldanella carpatica', 'urdzik karpacki', 'typical'),
  e('Saxifraga paniculata', 'skalnica gronkowa', 'typical'),
  e('Poa laxa', 'wiechlina wiotka', 'typical'),
  e('Poa chaixii', 'wiechlina Chaixa', 'typical'),

  // gatunki towarzyszące (postać torfowiskowa Karkonoszy, karta przykładowa)
  e('Deschampsia cespitosa', 'śmiałek darniowy', 'companion', D),
  e('Deschampsia caespitosa', 'śmiałek darniowy', 'companion', D),
  e('Molinia caerulea', 'trzęślica modra', 'companion', D),
  e('Anthoxanthum alpinum', 'tomka alpejska', 'companion'),
  e('Calluna vulgaris', 'wrzos zwyczajny', 'companion'),
  e('Carex pallescens', 'turzyca blada', 'companion'),
  e('Carex nigra', 'turzyca pospolita', 'companion'),
  e('Carex echinata', 'turzyca gwiazdkowata', 'companion'),
  e('Dryopteris carthusiana', 'nerecznica krótkoostna', 'companion'),
  e('Eriophorum angustifolium', 'wełnianka wąskolistna', 'companion'),
  e('Juncus filiformis', 'sit cienki', 'companion'),
  e('Trichophorum cespitosum', 'wełnianeczka darniowa', 'companion'),
  e('Nardus stricta', 'bliźniczka psia trawka', 'companion'),
  e('Viola palustris', 'fiołek błotny', 'companion'),
  e('Potentilla erecta', 'pięciornik kurze ziele', 'companion'),
  e('Gentiana asclepiadea', 'goryczka trojeściowa', 'companion'),

  // mszaki
  e('Sphagnum compactum', 'torfowiec zbity', 'moss'),
  e('Sphagnum girgensohnii', 'torfowiec Girgensohna', 'moss'),
  e('Sphagnum russowii', 'torfowiec Russowa', 'moss'),
  e('Polytrichum juniperinum', 'płonnik jałowcowaty', 'moss'),
  e('Polytrichum commune', 'płonnik pospolity', 'moss'),
]

const BY_NAME = new Map(SPECIES_4080.map((s) => [normalizeName(s.latin), s]))

export const findSpecies4080 = (name: string): SpeciesEntry4080 | undefined => BY_NAME.get(normalizeName(name))

/** Klucz gatunku: synonimy (Deschampsia cespitosa = D. caespitosa, Alnus viridis = A. alnobetula…) dają ten sam klucz. */
export const speciesKey4080 = (name: string) => findSpecies4080(name)?.polish ?? normalizeName(name)

/** Wierzba typowa dla siedliska (lapońska, śląska, szwajcarska). */
export const isTypicalWillow4080 = (name: string) => findSpecies4080(name)?.group === 'willow'
export const isPinusMugo = (name: string) => findSpecies4080(name)?.group === 'mugo'
/** Wierzba (dowolna, także spoza katalogu) – po nazwie rodzajowej. */
export const isWillow = (name: string) => /^salix\b/.test(normalizeName(name))

/** Krzewy do B, mszaki do D, reszta do C. */
export const defaultLayer4080 = (s: SpeciesEntry4080): Layer => (s.woody ? 'B' : s.group === 'moss' ? 'D' : 'C')
