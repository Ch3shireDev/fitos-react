// Słownik gatunków dla 7110 (torfowiska wysokie z roślinnością torfotwórczą – żywe), zebrany z przewodnika GIOŚ
// (Stańko 2010: „Typowe gatunki roślin”, tab. 1 i 2, przykładowa karta Supraśl 2008) i ze sprawozdań z monitoringu
// 2013–2014 i 2020–2021 (najczęstsze gatunki charakterystyczne, ekspansywne, obce, zarastające drzewa i krzewy).
// Liczenie ocen: torfowce i rośliny naczyniowe charakterystyczne (gatunki charakterystyczne), torfowce kępkowe
// z tab. 2 (pokrycie i struktura torfowców), drzewa i krzewy, gatunki ekspansywne i obce.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

/** Podtypy 7110 (poradnik ochrony siedlisk; przykładowa karta: „7110-1 Niżowe torfowiska wysokie”). */
export const SUBTYPES_7110 = ['7110-1', '7110-2'] as const
export type Subtype7110 = (typeof SUBTYPES_7110)[number]
export const SUBTYPE_LABELS_7110: Record<Subtype7110, string> = {
  '7110-1': '7110-1 Niżowe torfowiska wysokie',
  '7110-2': '7110-2 Górskie torfowiska wysokie',
}

export type SpeciesGroup7110 =
  | 'char-vascular' // roślina naczyniowa charakterystyczna (wymieniona w tab. 1 / „Typowe gatunki roślin”)
  | 'sphagnum-hummock' // torfowiec kępkowy z tab. 2 (magellański, brodawkowaty, brunatny, czerwonawy, ostrolistny)
  | 'sphagnum-char' // inny torfowiec charakterystyczny torfowisk wysokich (Russowa)
  | 'sphagnum-hollow' // torfowiec dolinkowy (sekcja Cuspidata, grupa torfowca kończystego)
  | 'sphagnum-other' // torfowiec niecharakterystyczny dla torfowisk wysokich
  | 'moss' // inny mszak lub porost (warstwa D)
  | 'transitional' // gatunek torfowisk przejściowych / dolinek (Scheuchzerio-Caricetea), nieliczony
  | 'expansive' // rodzimy gatunek ekspansywny (wrzos, trzęślica, trzcina…)
  | 'tree' // drzewo (także nalot i podrost)
  | 'shrub' // krzew lub krzewinka do wskaźnika „Obecność krzewów i drzew”
  | 'alien' // obcy geograficznie (inwazyjny)
  | 'other'

export interface SpeciesEntry7110 {
  latin: string
  polish?: string
  group: SpeciesGroup7110
  /**
   * Krzewinka liczona do krzewów we wskaźniku „Obecność krzewów i drzew”, choć należy do innej grupy
   * (bagno zwyczajne, borówka bagienna – tab. 2 wymienia je przy krzewach, tab. 1 przy gatunkach charakterystycznych).
   */
  shrub?: boolean
}

export const GROUP_LABELS_7110: Record<SpeciesGroup7110, string> = {
  'char-vascular': 'charakterystyczna roślina naczyniowa',
  'sphagnum-hummock': 'torfowiec kępkowy (charakterystyczny)',
  'sphagnum-char': 'torfowiec charakterystyczny',
  'sphagnum-hollow': 'torfowiec dolinkowy (charakterystyczny)',
  'sphagnum-other': 'torfowiec niecharakterystyczny',
  moss: 'mszak / porost',
  transitional: 'gatunek torfowisk przejściowych',
  expansive: 'gatunek ekspansywny',
  tree: 'drzewo',
  shrub: 'krzew / krzewinka',
  alien: 'obcy inwazyjny',
  other: 'inny',
}

type Extra = Omit<SpeciesEntry7110, 'latin' | 'polish' | 'group'>
const e = (latin: string, polish: string | undefined, group: SpeciesGroup7110, extra: Extra = {}): SpeciesEntry7110 => ({
  latin,
  ...(polish ? { polish } : {}),
  group,
  ...extra,
})

export const SPECIES_7110: SpeciesEntry7110[] = [
  // ---------- naczyniowe charakterystyczne (tab. 1, „Typowe gatunki roślin”, karta Supraśl) ----------
  e('Andromeda polifolia', 'modrzewnica zwyczajna', 'char-vascular'),
  e('Drosera rotundifolia', 'rosiczka okrągłolistna', 'char-vascular'),
  e('Oxycoccus palustris', 'żurawina błotna', 'char-vascular'),
  e('Oxycoccus microcarpus', 'żurawina drobnoowocowa', 'char-vascular'),
  e('Eriophorum vaginatum', 'wełnianka pochwowata', 'char-vascular'),
  e('Baeothryon cespitosum', 'wełnianeczka darniowa', 'char-vascular'),
  e('Carex pauciflora', 'turzyca skąpokwiatowa', 'char-vascular'),
  e('Erica tetralix', 'wrzosiec bagienny', 'char-vascular'),
  e('Rubus chamaemorus', 'malina moroszka', 'char-vascular'),
  e('Empetrum nigrum', 'bażyna czarna', 'char-vascular'),
  e('Ledum palustre', 'bagno zwyczajne', 'char-vascular', { shrub: true }),
  e('Vaccinium uliginosum', 'borówka bagienna', 'char-vascular', { shrub: true }),
  // dolinki: tab. 1 wymienia je przy gatunkach charakterystycznych
  e('Carex limosa', 'turzyca bagienna', 'char-vascular'),
  e('Rhynchospora alba', 'przygiełka biała', 'char-vascular'),
  e('Scheuchzeria palustris', 'bagnica torfowa', 'char-vascular'),

  // ---------- torfowce ----------
  e('Sphagnum magellanicum', 'torfowiec magellański', 'sphagnum-hummock'),
  e('Sphagnum medium', 'torfowiec (z grupy S. magellanicum)', 'sphagnum-hummock'),
  e('Sphagnum divinum', 'torfowiec (z grupy S. magellanicum)', 'sphagnum-hummock'),
  e('Sphagnum papillosum', 'torfowiec brodawkowaty', 'sphagnum-hummock'),
  e('Sphagnum fuscum', 'torfowiec brunatny', 'sphagnum-hummock'),
  e('Sphagnum rubellum', 'torfowiec czerwonawy', 'sphagnum-hummock'),
  e('Sphagnum capillifolium', 'torfowiec ostrolistny', 'sphagnum-hummock'),
  e('Sphagnum russowii', 'torfowiec Russowa', 'sphagnum-char'),
  e('Sphagnum fallax', 'torfowiec kończysty', 'sphagnum-hollow'),
  e('Sphagnum cuspidatum', 'torfowiec szpiczastolistny', 'sphagnum-hollow'),
  e('Sphagnum angustifolium', 'torfowiec wąskolistny', 'sphagnum-hollow'),
  e('Sphagnum balticum', 'torfowiec bałtycki', 'sphagnum-hollow'),
  e('Sphagnum tenellum', 'torfowiec delikatny', 'sphagnum-hollow'),
  e('Sphagnum majus', 'torfowiec większy', 'sphagnum-hollow'),
  e('Sphagnum compactum', 'torfowiec zbity', 'sphagnum-other'),
  e('Sphagnum fimbriatum', 'torfowiec frędzlowaty', 'sphagnum-other'),
  e('Sphagnum palustre', 'torfowiec błotny', 'sphagnum-other'),
  e('Sphagnum squarrosum', 'torfowiec nastroszony', 'sphagnum-other'),
  e('Sphagnum girgensohnii', 'torfowiec Girgensohna', 'sphagnum-other'),
  e('Sphagnum flexuosum', 'torfowiec giętki', 'sphagnum-other'),

  // ---------- inne mszaki i porosty ----------
  e('Aulacomnium palustre', 'próchniczek błotny', 'moss'),
  e('Polytrichum strictum', 'płonnik cienki', 'moss'),
  e('Polytrichum commune', 'płonnik pospolity', 'moss'),
  e('Pleurozium schreberi', 'rokietnik pospolity', 'moss'),
  e('Dicranum polysetum', 'widłoząb kędzierzawy', 'moss'),
  e('Dicranum undulatum', 'widłoząb falisty', 'moss'),
  e('Dicranum scoparium', 'widłoząb miotłowy', 'moss'),
  e('Hypnum jutlandicum', 'rokiet duński', 'moss'),
  e('Mylia anomala', 'mylia anomalna', 'moss'),
  e('Cladonia spp.', 'chrobotki', 'moss'),

  // ---------- torfowisk przejściowych i okrajka (nieliczone) ----------
  e('Eriophorum angustifolium', 'wełnianka wąskolistna', 'transitional'),
  e('Carex rostrata', 'turzyca dzióbkowata', 'transitional'),
  e('Carex lasiocarpa', 'turzyca nitkowata', 'transitional'),
  e('Carex nigra', 'turzyca pospolita', 'transitional'),
  e('Carex echinata', 'turzyca gwiazdkowata', 'transitional'),
  e('Drosera anglica', 'rosiczka długolistna', 'transitional'),
  e('Drosera intermedia', 'rosiczka pośrednia', 'transitional'),
  e('Menyanthes trifoliata', 'bobrek trójlistkowy', 'transitional'),
  e('Comarum palustre', 'siedmiopalecznik błotny', 'transitional'),

  // ---------- ekspansywne (tab. 1, sprawozdanie 2020–2021) ----------
  e('Calluna vulgaris', 'wrzos zwyczajny', 'expansive'),
  e('Molinia caerulea', 'trzęślica modra', 'expansive'),
  e('Phragmites australis', 'trzcina pospolita', 'expansive'),
  e('Juncus effusus', 'sit rozpierzchły', 'expansive'),
  e('Calamagrostis canescens', 'trzcinnik lancetowaty', 'expansive'),

  // ---------- drzewa ----------
  e('Pinus sylvestris', 'sosna zwyczajna', 'tree'),
  e('Pinus mugo', 'kosodrzewina', 'tree'),
  e('Pinus × rhaetica', 'sosna drzewokosa', 'tree'),
  e('Betula pubescens', 'brzoza omszona', 'tree'),
  e('Betula pendula', 'brzoza brodawkowata', 'tree'),
  e('Picea abies', 'świerk pospolity', 'tree'),
  e('Alnus glutinosa', 'olsza czarna', 'tree'),
  e('Quercus robur', 'dąb szypułkowy', 'tree'),
  e('Sorbus aucuparia', 'jarząb pospolity', 'tree'),

  // ---------- krzewy i krzewinki (poza charakterystycznymi) ----------
  e('Frangula alnus', 'kruszyna pospolita', 'shrub'),
  e('Salix aurita', 'wierzba uszata', 'shrub'),
  e('Salix cinerea', 'wierzba szara', 'shrub'),
  e('Vaccinium myrtillus', 'borówka czarna', 'shrub'),
  e('Vaccinium vitis-idaea', 'borówka brusznica', 'shrub'),
  e('Chamaedaphne calyculata', 'chamedafne północna', 'shrub'),

  // ---------- obce (sprawozdania 2013–2014 i 2020–2021) ----------
  e('Quercus rubra', 'dąb czerwony', 'alien'),
  e('Erechtites hieraciifolia', 'erechtites jastrzębcowaty', 'alien'),
  e('Solidago gigantea', 'nawłoć późna', 'alien'),
  e('Conyza canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Prunus serotina', 'czeremcha amerykańska', 'alien'),

  // ---------- inne ----------
  e('Potentilla erecta', 'pięciornik kurze ziele', 'other'),
  e('Agrostis canina', 'mietlica psia', 'other'),
]

const INDEX = new Map<string, SpeciesEntry7110>()
for (const s of SPECIES_7110) {
  INDEX.set(normalizeName(s.latin), s)
  if (s.polish && !s.polish.includes('(')) INDEX.set(normalizeName(s.polish), s)
}

/** Synonimy i zapisy spotykane w kartach i sprawozdaniach. */
const ALIASES: Record<string, string> = {
  'vaccinium oxycoccus': 'Oxycoccus palustris',
  'vaccinium oxycoccos': 'Oxycoccus palustris',
  'oxyccocus palustris': 'Oxycoccus palustris',
  'oxycoccus quadripetalus': 'Oxycoccus palustris',
  'vaccinium microcarpum': 'Oxycoccus microcarpus',
  'trichophorum cespitosum': 'Baeothryon cespitosum',
  'trichophorum caespitosum': 'Baeothryon cespitosum',
  'baeothryon caespitosum': 'Baeothryon cespitosum',
  'scirpus cespitosus': 'Baeothryon cespitosum',
  'rhododendron tomentosum': 'Ledum palustre',
  'empetrum hermaphroditum': 'Empetrum nigrum',
  'empetrum nigrum subsp. hermaphroditum': 'Empetrum nigrum',
  'sphagnum capilifolium': 'Sphagnum capillifolium',
  'sphagnum nemoreum': 'Sphagnum capillifolium',
  'sphagnum recurvum': 'Sphagnum fallax',
  'molinia coerulea': 'Molinia caerulea',
  'entodon schreberi': 'Pleurozium schreberi',
  'erechtites hieracifolia': 'Erechtites hieraciifolia',
  'erigeron canadensis': 'Conyza canadensis',
  'cladonia sp.': 'Cladonia spp.',
  cladonia: 'Cladonia spp.',
}

/** Znajduje gatunek po nazwie łacińskiej („S. fallax” też przejdzie), synonimie albo nazwie polskiej. */
export function findSpecies7110(name: string): SpeciesEntry7110 | undefined {
  const n = normalizeName(name).replace(/^s\.\s*/, 'sphagnum ')
  const alias = ALIASES[n]
  return INDEX.get(alias ? normalizeName(alias) : n)
}

const groupOf = (name: string) => findSpecies7110(name)?.group

/** Torfowiec – po katalogu albo po samej nazwie rodzajowej (Sphagnum sp. też jest torfowcem). */
export const isSphagnum7110 = (name: string) =>
  Boolean(groupOf(name)?.startsWith('sphagnum')) || /^(sphagnum|s\.)\s|^sphagnum$|^torfowiec/i.test(name.trim())

/** Torfowiec charakterystyczny (kępkowy z tab. 2, Russowa, dolinkowe z sekcji Cuspidata). */
export const isCharSphagnum7110 = (name: string) => {
  const g = groupOf(name)
  return g === 'sphagnum-hummock' || g === 'sphagnum-char' || g === 'sphagnum-hollow'
}
export const isHummockSphagnum7110 = (name: string) => groupOf(name) === 'sphagnum-hummock'
export const isHollowSphagnum7110 = (name: string) => groupOf(name) === 'sphagnum-hollow'
export const isCharVascular7110 = (name: string) => groupOf(name) === 'char-vascular'
export const isTree7110 = (name: string) => groupOf(name) === 'tree'
export const isShrub7110 = (name: string) => {
  const s = findSpecies7110(name)
  return s?.group === 'shrub' || Boolean(s?.shrub)
}
export const isExpansive7110 = (name: string) => groupOf(name) === 'expansive'
export const isAlien7110 = (name: string) => groupOf(name) === 'alien'

export function defaultLayer7110(s: SpeciesEntry7110): Layer {
  if (s.group.startsWith('sphagnum') || s.group === 'moss') return 'D'
  if (s.group === 'tree' || (s.group === 'shrub' && ['Frangula alnus', 'Salix aurita', 'Salix cinerea'].includes(s.latin))) return 'B'
  if (s.group === 'alien' && s.latin === 'Quercus rubra') return 'B'
  return 'C'
}
