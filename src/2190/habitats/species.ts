// Słownik gatunków dla 2190 (wilgotne zagłębienia międzywydmowe), zebrany z przewodnika GIOŚ (Izydorek 2015,
// rozdz. „Typowe gatunki roślin” i tab. 1 – gatunki charakterystyczne osobno dla 7 podtypów, gatunki ekspansywne),
// z przykładowej karty (Madwiny 1, 2013) i ze sprawozdań z monitoringu 2013–2014, 2016–2018 i 2023–2025
// (gatunki obce, ekspansywne, nalot drzew). Mszaki w warstwie D, krzewinki w C, krzewy w B, drzewa w A.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

/** Podtypy 2190 wg przewodnika (tab. 1 i 2). */
export const SUBTYPES_2190 = ['1', '2', '3', '4', '5', '6', '7'] as const
export type Subtype2190 = (typeof SUBTYPES_2190)[number]

export const SUBTYPE_LABELS_2190: Record<Subtype2190, string> = {
  '1': '2190-1 Pionierskie stadia kolonizacji piasków',
  '2': '2190-2 Mszary i torfowiska (mszarniki wrzosowcowe)',
  '3': '2190-3 Kwaśna młaka turzycowa',
  '4': '2190-4 Wilgotne wrzosowiska bażynowe',
  '5': '2190-5 Łozowiska z wierzbą uszatą',
  '6': '2190-6 Zarośla woskownicy europejskiej',
  '7': '2190-7 Zbiorowiska drobnych bylin ziemnowodnych',
}

export type SpeciesGroup2190 =
  | 'characteristic' // charakterystyczny i wyróżniający dla co najmniej jednego podtypu (tab. 1)
  | 'companion' // inne gatunki zagłębień i ich otoczenia
  | 'expansive' // ekspansywny rodzimy (tab. 1 i sprawozdania)
  | 'tree' // nalot i podrost drzew
  | 'alien' // obcy geograficznie

export interface SpeciesEntry2190 {
  latin: string
  polish?: string
  group: SpeciesGroup2190
  /** Podtypy, dla których gatunek jest charakterystyczny i wyróżniający (tab. 1). */
  subtypes?: Subtype2190[]
  /** Mszak (warstwa D) – nie liczy się do „silnej dominacji” w warstwach naczyniowych. */
  moss?: boolean
  /** Krzew albo krzewinka – do wskaźnika „Obecność krzewów i krzewinek”. */
  shrub?: boolean
  /** Gatunek silnie ekspansywny (tab. 1: trzęślica, sit rozpierzchły, ponikło błotne; opis: trzcina). */
  strong?: boolean
  /** Obcy o wysokim stopniu inwazyjności. */
  highlyInvasive?: boolean
}

export const GROUP_LABELS_2190: Record<SpeciesGroup2190, string> = {
  characteristic: 'gatunek charakterystyczny 2190',
  companion: 'gatunek towarzyszący',
  expansive: 'gatunek ekspansywny',
  tree: 'drzewo (nalot, podrost)',
  alien: 'gatunek obcy geograficznie',
}

type Extra = Omit<SpeciesEntry2190, 'latin' | 'polish' | 'group'>
const ch = (latin: string, polish: string, subtypes: Subtype2190[], extra: Extra = {}): SpeciesEntry2190 => ({ latin, polish, group: 'characteristic', subtypes, ...extra })
const e = (latin: string, polish: string, group: SpeciesGroup2190, extra: Extra = {}): SpeciesEntry2190 => ({ latin, polish, group, ...extra })

export const SPECIES_2190: SpeciesEntry2190[] = [
  // ---------- charakterystyczne i wyróżniające (tab. 1, podtypy 1–7) z synonimami ----------
  ch('Agrostis stolonifera', 'mietlica rozłogowa', ['1']),
  ch('Juncus articulatus subsp. litoralis', 'sit członowaty (podgatunek nadmorski)', ['1']),
  ch('Juncus articulatus', 'sit członowaty', ['1']),
  ch('Juncus balticus', 'sit bałtycki', ['1', '4']),
  ch('Juncus bulbosus', 'sit drobny', ['1', '7']),
  ch('Arenaria serpyllifolia', 'piaskowiec macierzankowy', ['1']),
  ch('Centaurium littorale', 'centuria nadbrzeżna', ['1']),
  ch('Polytrichum commune var. perigoniale', 'płonnik pospolity', ['1', '4'], { moss: true }),
  ch('Polytrichum commune', 'płonnik pospolity', ['1', '4'], { moss: true }),
  ch('Pohlia nutans', 'borześlad zwisły', ['1', '4'], { moss: true }),
  ch('Gymnocolea inflata', 'wątrobowiec Gymnocolea inflata', ['1', '4'], { moss: true }),
  ch('Cephalozia bicuspidata', 'głowiak dwukończysty', ['1'], { moss: true }),

  ch('Erica tetralix', 'wrzosiec bagienny', ['2'], { shrub: true }),
  ch('Vaccinium oxycoccos', 'żurawina błotna', ['2'], { shrub: true }),
  ch('Vaccinium oxycoccus', 'żurawina błotna', ['2'], { shrub: true }),
  ch('Oxycoccus palustris', 'żurawina błotna', ['2'], { shrub: true }),
  ch('Salix repens subsp. arenaria', 'wierzba piaskowa', ['2'], { shrub: true }),
  ch('Salix arenaria', 'wierzba piaskowa', ['2'], { shrub: true }),
  ch('Lycopodiella inundata', 'widłaczek torfowy', ['2']),
  ch('Drosera anglica', 'rosiczka długolistna', ['2']),
  ch('Drosera intermedia', 'rosiczka pośrednia', ['2']),
  ch('Drosera × obovata', 'rosiczka owalna', ['2']),
  ch('Eriophorum angustifolium', 'wełnianka wąskolistna', ['2', '3', '5', '6']),
  ch('Rhynchospora fusca', 'przygiełka brunatna', ['2']),
  ch('Sphagnum cuspidatum', 'torfowiec spiczastolistny', ['2'], { moss: true }),
  ch('Sphagnum contortum', 'torfowiec skręcony', ['2'], { moss: true }),
  ch('Sphagnum compactum', 'torfowiec szorstki', ['2'], { moss: true }),
  ch('Sphagnum denticulatum', 'torfowiec ząbkowany', ['2', '4'], { moss: true }),

  ch('Agrostis canina', 'mietlica psia', ['3']),
  ch('Carex curta', 'turzyca siwa', ['3', '5']),
  ch('Carex canescens', 'turzyca siwa', ['3', '5']),
  ch('Carex echinata', 'turzyca gwiazdkowata', ['3']),
  ch('Carex nigra', 'turzyca pospolita', ['3', '5', '6']),
  ch('Juncus filiformis', 'sit cienki', ['3']),
  ch('Sphagnum inundatum', 'torfowiec zanurzony', ['3', '6', '7'], { moss: true }),
  ch('Sphagnum fimbriatum', 'torfowiec frędzlowaty', ['3'], { moss: true }),
  ch('Warnstorfia exannulata', 'warnstorfia bezpierścieniowa', ['3', '5'], { moss: true }),

  ch('Empetrum nigrum', 'bażyna czarna', ['4'], { shrub: true }),
  ch('Vaccinium uliginosum', 'borówka bagienna', ['4'], { shrub: true }),
  ch('Calluna vulgaris', 'wrzos zwyczajny', ['4'], { shrub: true }),
  ch('Carex arenaria', 'turzyca piaskowa', ['4']),
  ch('Drosera rotundifolia', 'rosiczka okrągłolistna', ['4']),
  ch('Aulacomnium palustre', 'próchniczek błotny', ['4'], { moss: true }),

  ch('Salix aurita', 'wierzba uszata', ['5'], { shrub: true }),
  ch('Carex lasiocarpa', 'turzyca nitkowata', ['5']),
  ch('Calamagrostis canescens', 'trzcinnik lancetowaty', ['5']),
  ch('Peucedanum palustre', 'gorysz błotny', ['5']),
  ch('Sphagnum fallax', 'torfowiec kończysty', ['5'], { moss: true }),
  ch('Sphagnum squarrosum', 'torfowiec nastroszony', ['5'], { moss: true }),

  ch('Myrica gale', 'woskownica europejska', ['6'], { shrub: true }),
  ch('Molinia caerulea', 'trzęślica modra', ['6'], { strong: true }),

  ch('Eleocharis multicaulis', 'ponikło wielołodygowe', ['7']),
  ch('Ranunculus flammula', 'jaskier płomiennik', ['7']),
  ch('Hydrocotyle vulgaris', 'wąkrota zwyczajna', ['7']),
  ch('Littorella uniflora', 'brzeżyca jednokwiatowa', ['7']),
  ch('Potamogeton polygonifolius', 'rdestnica podługowata', ['7']),

  // ---------- ekspansywne (tab. 1 „Gatunki ekspansywne”, s. 93 przewodnika, sprawozdania) ----------
  e('Juncus effusus', 'sit rozpierzchły', 'expansive', { strong: true }),
  e('Eleocharis palustris', 'ponikło błotne', 'expansive', { strong: true }),
  e('Phragmites australis', 'trzcina pospolita', 'expansive', { strong: true }),
  e('Salix caprea', 'wierzba iwa', 'expansive', { shrub: true }),
  e('Salix cinerea', 'wierzba szara', 'expansive', { shrub: true }),

  // ---------- drzewa (nalot, podrost) ----------
  e('Pinus sylvestris', 'sosna zwyczajna', 'tree'),
  e('Betula pubescens', 'brzoza omszona', 'tree'),
  e('Betula pendula', 'brzoza brodawkowata', 'tree'),
  e('Alnus glutinosa', 'olsza czarna', 'tree'),
  e('Frangula alnus', 'kruszyna pospolita', 'companion', { shrub: true }),

  // ---------- obce geograficznie (sprawozdania 2013–2025) ----------
  e('Juncus tenuis', 'sit chudy', 'alien'),
  e('Alnus rugosa', 'olsza pomarszczona', 'alien'),
  e('Pinus strobus', 'sosna wejmutka', 'alien'),
  e('Picea abies', 'świerk pospolity (poza zasięgiem)', 'alien'),
  e('Pinus mugo', 'kosodrzewina (nasadzenia)', 'alien'),
  e('Prunus serotina', 'czeremcha amerykańska', 'alien', { highlyInvasive: true }),
  e('Rosa rugosa', 'róża pomarszczona', 'alien', { highlyInvasive: true }),
  e('Amelanchier spicata', 'świdośliwa kłosowa', 'alien', { highlyInvasive: true }),
  e('Quercus rubra', 'dąb czerwony', 'alien', { highlyInvasive: true }),

  // ---------- towarzyszące (przykładowa karta, opis siedliska) ----------
  e('Carex flava', 'turzyca żółta', 'companion'),
  e('Epilobium palustre', 'wierzbownica błotna', 'companion'),
  e('Juncus conglomeratus', 'sit skupiony', 'companion'),
  e('Eriophorum vaginatum', 'wełnianka pochwowata', 'companion'),
  e('Comarum palustre', 'siedmiopalecznik błotny', 'companion'),
  e('Carex rostrata', 'turzyca dzióbkowata', 'companion'),
  e('Ceratodon purpureus', 'zęboząb purpurowy', 'companion', { moss: true }),
  e('Pohlia bulbifera', 'borześlad cebulkowy', 'companion', { moss: true }),
  e('Pohlia filum', 'borześlad nitkowaty', 'companion', { moss: true }),
  e('Lophozia capitata', 'wątrobowiec Lophozia capitata', 'companion', { moss: true }),
]

const INDEX = new Map(SPECIES_2190.map((s) => [normalizeName(s.latin), s]))
// literówki i warianty spotykane w kartach (np. „Areneria serpyllifolia” w zdjęciu II przykładu)
const ALIASES: Record<string, string> = {
  'areneria serpyllifolia': 'Arenaria serpyllifolia',
  'drosera obovata': 'Drosera × obovata',
  'juncus articulatus ssp. litoralis': 'Juncus articulatus subsp. litoralis',
  'molinia coerulea': 'Molinia caerulea',
  'polytrichum communae': 'Polytrichum commune',
  'carex cf. flava': 'Carex flava',
  'carex cf flava': 'Carex flava',
}

export function findSpecies2190(name: string): SpeciesEntry2190 | undefined {
  const n = normalizeName(name)
  const alias = ALIASES[n]
  return INDEX.get(alias ? normalizeName(alias) : n)
}

/** Charakterystyczny dla podanego podtypu (albo dla dowolnego, gdy podtyp nieznany). */
export function isCharacteristic2190(name: string, subtype?: Subtype2190): boolean {
  const s = findSpecies2190(name)
  if (!s?.subtypes) return false
  return subtype ? s.subtypes.includes(subtype) : true
}

export const isMoss2190 = (name: string) => Boolean(findSpecies2190(name)?.moss)
export const isShrub2190 = (name: string) => Boolean(findSpecies2190(name)?.shrub)
export const isTree2190 = (name: string) => findSpecies2190(name)?.group === 'tree'
export const isAlien2190 = (name: string) => findSpecies2190(name)?.group === 'alien'
export const isHighlyInvasive2190 = (name: string) => Boolean(findSpecies2190(name)?.highlyInvasive)

/**
 * Silnie ekspansywny w danym podtypie. Trzęślica jest charakterystyczna dla zarośli woskownicy (podtyp 6) –
 * tam się nie liczy; ponikło błotne tab. 1 wymienia jako zagrożenie postaci pionierskich (podtypy 1 i 7),
 * ale bez podtypu liczymy je zawsze.
 */
export function isStronglyExpansive2190(name: string, subtype?: Subtype2190): boolean {
  const s = findSpecies2190(name)
  if (!s?.strong) return false
  if (subtype && s.subtypes?.includes(subtype)) return false
  return true
}

/** Ekspansywny (silnie albo nie) w danym podtypie – do oceny gatunków dominujących. */
export function isExpansive2190(name: string, subtype?: Subtype2190): boolean {
  const s = findSpecies2190(name)
  if (!s) return false
  if (subtype && s.subtypes?.includes(subtype)) return false
  return s.group === 'expansive' || Boolean(s.strong)
}

export function defaultLayer2190(s: SpeciesEntry2190): Layer {
  if (s.moss) return 'D'
  if (s.group === 'tree') return 'B'
  if (s.shrub && ['Salix aurita', 'Salix caprea', 'Salix cinerea', 'Myrica gale', 'Frangula alnus'].includes(s.latin)) return 'B'
  return 'C'
}
