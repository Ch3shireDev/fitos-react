// Słownik gatunków dla 7140 (torfowiska przejściowe i trzęsawiska, przeważnie z roślinnością z Scheuchzerio-Caricetea nigrae),
// zebrany z przewodnika GIOŚ (Koczur 2012, pkt 4 „Typowe gatunki roślin” i tab. 1), z karty przykładowej (Chyżne Borcok,
// 2011) i ze sprawozdań z monitoringu 2009–2011, 2016–2018 i 2024 (rodzime gatunki ekspansywne, gatunki obce z tab. 4
// sprawozdania 2024, drzewa i krzewy zarastające torfowiska). Drzewa i krzewy – warstwa B, runo – C, mszaki – D.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup7140 =
  | 'characteristic' // gatunki charakterystyczne (pkt 4 przewodnika, uzupełnione o gatunki klasy Scheuchzerio-Caricetea)
  | 'expansive' // rodzime gatunki ekspansywne roślin zielnych
  | 'alien' // gatunki obce (tab. 4 sprawozdania 2024 i wcześniejsze)
  | 'woody' // rodzime drzewa i krzewy zarastające torfowiska
  | 'companion' // pozostałe gatunki (zdjęcia z karty przykładowej, gatunki torfowisk wysokich, mchy)

export interface SpeciesEntry7140 {
  latin: string
  polish?: string
  group: SpeciesGroup7140
  /**
   * Skąd gatunek charakterystyczny: 'guide' – lista z pkt 4 przewodnika (rzędy Scheuchzerietalia palustris i Caricetalia
   * nigrae, ich związki, klasa i poszczególne zespoły); 'class' – inne gatunki charakterystyczne klasy Scheuchzerio-Caricetea
   * nigrae wg Matuszkiewicza (2001), bo przewodnik podaje gatunki klasy „m.in.”.
   */
  source?: 'guide' | 'class'
  /**
   * Gatunek torfowisk wysokich (Oxycocco-Sphagnetea) wymieniony w pkt 4 wśród gatunków poszczególnych zespołów –
   * „ich obecność nie powinna decydować o klasyfikacji płatu”; w praktyce raz liczony jako charakterystyczny, raz nie.
   */
  bog?: boolean
  /** Wełnianka pochwowata: w pkt 4 wśród gatunków zespołów, a w sprawozdaniach (2011, 2017, 2024) także wśród ekspansywnych. */
  alsoExpansive?: boolean
  woody?: boolean
  /** Mszak – warstwa D. */
  cryptogam?: boolean
  /** Torfowiec (Sphagnum). */
  sphagnum?: boolean
}

export const GROUP_LABELS_7140: Record<SpeciesGroup7140, string> = {
  characteristic: 'gatunek charakterystyczny 7140',
  expansive: 'rodzimy gatunek ekspansywny',
  alien: 'gatunek obcy',
  woody: 'drzewo lub krzew',
  companion: 'gatunek towarzyszący',
}

const e = (latin: string, polish: string | undefined, group: SpeciesGroup7140, extra: Partial<SpeciesEntry7140> = {}): SpeciesEntry7140 => ({
  latin,
  ...(polish ? { polish } : {}),
  group,
  ...extra,
})
const ch = (latin: string, polish: string, extra: Partial<SpeciesEntry7140> = {}) => e(latin, polish, 'characteristic', { source: 'guide', ...extra })
const cl = (latin: string, polish: string, extra: Partial<SpeciesEntry7140> = {}) => e(latin, polish, 'characteristic', { source: 'class', ...extra })
const ex = (latin: string, polish: string, extra: Partial<SpeciesEntry7140> = {}) => e(latin, polish, 'expansive', extra)
const al = (latin: string, polish: string, extra: Partial<SpeciesEntry7140> = {}) => e(latin, polish, 'alien', extra)
const wd = (latin: string, polish: string) => e(latin, polish, 'woody', { woody: true })
const co = (latin: string, polish: string | undefined, extra: Partial<SpeciesEntry7140> = {}) => e(latin, polish, 'companion', extra)
const M = { cryptogam: true }
const SPH = { cryptogam: true, sphagnum: true }
const W = { woody: true }

export const SPECIES_7140: SpeciesEntry7140[] = [
  // pkt 4 – rząd Scheuchzerietalia palustris
  ch('Carex limosa', 'turzyca bagienna'),
  ch('Drosera anglica', 'rosiczka długolistna'),
  ch('Rhynchospora alba', 'przygiełka biała'),
  ch('Sphagnum contortum', 'torfowiec skręcony', SPH),
  ch('Sphagnum cuspidatum', 'torfowiec szpiczastolistny', SPH),
  ch('Sphagnum subsecundum', 'torfowiec jednoboczny', SPH),
  // pkt 4 – związek Rhynchosporion albae
  ch('Drosera intermedia', 'rosiczka pośrednia'),
  ch('Hammarbya paludosa', 'wątlik błotny'),
  ch('Malaxis paludosa', 'wątlik błotny (syn.)'),
  ch('Scheuchzeria palustris', 'bagnica torfowa'),
  // pkt 4 – związek Caricion lasiocarpae
  ch('Bryum subneodamense', 'prątnik jajowaty', M),
  ch('Bryum ovatum', 'prątnik jajowaty (syn.)', M),
  ch('Carex chordorrhiza', 'turzyca strunowa'),
  ch('Carex diandra', 'turzyca obła'),
  ch('Carex heleonastes', 'turzyca torfowa'),
  ch('Carex lasiocarpa', 'turzyca nitkowata'),
  ch('Cinclidium stygium', 'drabinowiec mroczny', M),
  ch('Eriophorum gracile', 'wełnianka delikatna'),
  ch('Sphagnum teres', 'torfowiec obły', SPH),
  ch('Comarum palustre', 'siedmiopalecznik błotny'),
  ch('Potentilla palustris', 'siedmiopalecznik błotny (syn.)'),
  // pkt 4 – rząd Caricetalia nigrae i związek Caricion nigrae
  ch('Calamagrostis stricta', 'trzcinnik prosty'),
  ch('Calamagrostis neglecta', 'trzcinnik prosty (syn.)'),
  ch('Carex echinata', 'turzyca gwiazdkowata'),
  ch('Carex nigra', 'turzyca pospolita'),
  ch('Carex fusca', 'turzyca pospolita (syn.)'),
  ch('Hydrocotyle vulgaris', 'wąkrota zwyczajna'),
  ch('Juncus filiformis', 'sit cienki'),
  ch('Ranunculus flammula', 'jaskier płomiennik'),
  ch('Stellaria palustris', 'gwiazdnica błotna'),
  ch('Veronica scutellata', 'przetacznik błotny'),
  ch('Viola palustris', 'fiołek błotny'),
  // pkt 4 – klasa Scheuchzerio-Caricetea nigrae (gatunki siedlisk oligotroficznych)
  ch('Straminergon stramineum', 'słomiaczek złotawy', M),
  ch('Calliergon stramineum', 'słomiaczek złotawy (syn.)', M),
  ch('Eriophorum angustifolium', 'wełnianka wąskolistna'),
  // pkt 4 – gatunki poszczególnych zespołów i zbiorowisk
  ch('Agrostis canina', 'mietlica psia'),
  ch('Carex canescens', 'turzyca siwa'),
  ch('Carex rostrata', 'turzyca dzióbkowata'),
  ch('Epilobium nutans', 'wierzbownica zwieszona'),
  ch('Sphagnum obtusum', 'torfowiec tępolistny', SPH),
  ch('Eriophorum vaginatum', 'wełnianka pochwowata', { bog: true, alsoExpansive: true }),
  ch('Oxycoccus palustris', 'żurawina błotna', { bog: true }),
  ch('Vaccinium oxycoccos', 'żurawina błotna (syn.)', { bog: true }),
  ch('Sphagnum angustifolium', 'torfowiec wąskolistny', SPH),
  ch('Sphagnum fallax', 'torfowiec kończysty', SPH),
  ch('Sphagnum recurvum', 'torfowiec kończysty (syn.)', SPH),
  // uzupełnienie – inne gatunki klasy Scheuchzerio-Caricetea nigrae (Matuszkiewicz 2001)
  cl('Menyanthes trifoliata', 'bobrek trójlistkowy'),
  cl('Aulacomnium palustre', 'bagniak błotny', M),
  cl('Pedicularis palustris', 'gnidosz błotny'),
  cl('Epilobium palustre', 'wierzbownica błotna'),

  // rodzime gatunki ekspansywne roślin zielnych (tab. 1 i sprawozdania 2011–2024)
  ex('Molinia caerulea', 'trzęślica modra'),
  ex('Phragmites australis', 'trzcina pospolita'),
  ex('Calamagrostis canescens', 'trzcinnik lancetowaty'),
  ex('Calamagrostis villosa', 'trzcinnik owłosiony'),
  ex('Juncus effusus', 'sit rozpierzchły'),
  ex('Juncus conglomeratus', 'sit skupiony'),
  ex('Deschampsia caespitosa', 'śmiałek darniowy'),
  ex('Deschampsia cespitosa', 'śmiałek darniowy (syn.)'),
  ex('Holcus mollis', 'kłosówka miękka'),
  ex('Carex cespitosa', 'turzyca darniowa'),
  ex('Vaccinium myrtillus', 'borówka czarna'),

  // gatunki obce (sprawozdanie 2024, tab. 4; sprawozdania 2011 i 2016–2018)
  al('Spiraea tomentosa', 'tawuła kutnerowata', W),
  al('Alnus rugosa', 'olsza pomarszczona', W),
  al('Padus serotina', 'czeremcha amerykańska', W),
  al('Prunus serotina', 'czeremcha amerykańska (syn.)', W),
  al('Quercus rubra', 'dąb czerwony', W),
  al('Aronia melanocarpa', 'aronia czarna', W),
  al('Prunus cerasifera', 'śliwa wiśniowa', W),
  al('Erechtites hieraciifolia', 'erechtites jastrzębcowaty'),
  al('Sarracenia purpurea', 'kapturnica purpurowa'),
  al('Campylopus introflexus', 'krzywoszczeć przywłoka', M),
  al('Lupinus polyphyllus', 'łubin trwały'),
  al('Solidago gigantea', 'nawłoć późna'),
  al('Rumex longifolius', 'szczaw domowy'),
  al('Epilobium adenocaulon', 'wierzbownica gruczołowata'),
  al('Epilobium ciliatum', 'wierzbownica gruczołowata (syn.)'),
  al('Bidens frondosa', 'uczep amerykański'),

  // drzewa i krzewy zarastające torfowiska (sprawozdania 2011–2024, karta przykładowa)
  wd('Pinus sylvestris', 'sosna zwyczajna'),
  wd('Picea abies', 'świerk pospolity'),
  wd('Betula pubescens', 'brzoza omszona'),
  wd('Betula pendula', 'brzoza brodawkowata'),
  wd('Frangula alnus', 'kruszyna pospolita'),
  wd('Alnus glutinosa', 'olsza czarna'),
  wd('Populus tremula', 'topola osika'),
  wd('Salix aurita', 'wierzba uszata'),
  wd('Salix cinerea', 'wierzba szara'),
  wd('Salix pentandra', 'wierzba pięciopręcikowa'),

  // pozostałe: zdjęcia z karty przykładowej, gatunki torfowisk wysokich i inne częste na torfowiskach przejściowych
  co('Dactylorhiza maculata', 'kukułka plamista'),
  co('Potentilla erecta', 'pięciornik kurze ziele'),
  co('Vaccinium uliginosum', 'borówka bagienna'),
  co('Polytrichum commune', 'płonnik pospolity', M),
  co('Drosera rotundifolia', 'rosiczka okrągłolistna'),
  co('Andromeda polifolia', 'modrzewnica zwyczajna'),
  co('Ledum palustre', 'bagno zwyczajne'),
  co('Calla palustris', 'czermień błotna'),
  co('Carex panicea', 'turzyca prosowata'),
  co('Sphagnum magellanicum', 'torfowiec magellański', SPH),
  co('Sphagnum palustre', 'torfowiec błotny', SPH),
  co('Sphagnum squarrosum', 'torfowiec nastroszony', SPH),
  co('Sphagnum fimbriatum', 'torfowiec frędzlowaty', SPH),
  co('Hamatocaulis vernicosus', 'sierpowiec błyszczący', M),
  co('Calliergon giganteum', undefined, M),
  co('Scorpidium scorpioides', undefined, M),
  co('Warnstorfia exannulata', undefined, M),
  co('Warnstorfia fluitans', undefined, M),
]

const BY_NAME = new Map(SPECIES_7140.map((s) => [normalizeName(s.latin), s]))

export const findSpecies7140 = (name: string): SpeciesEntry7140 | undefined => BY_NAME.get(normalizeName(name))

/** Klucz do liczenia gatunków: synonimy (Comarum/Potentilla palustris, Oxycoccus/Vaccinium oxycoccos…) dają jeden klucz. */
export const speciesKey7140 = (name: string) => (findSpecies7140(name)?.polish ?? normalizeName(name)).replace(/ \(syn\.\)$/, '')

const groupOf = (name: string) => findSpecies7140(name)?.group
export const isCharacteristic7140 = (name: string) => groupOf(name) === 'characteristic'
export const isBog7140 = (name: string) => Boolean(findSpecies7140(name)?.bog)
/** Rodzimy gatunek ekspansywny – razem z wełnianką pochwowatą, którą sprawozdania bywa tak traktują. */
export const isExpansive7140 = (name: string) => groupOf(name) === 'expansive' || Boolean(findSpecies7140(name)?.alsoExpansive)
export const isAlien7140 = (name: string) => groupOf(name) === 'alien'
/** Rodzime drzewo albo krzew (obce drzewa i krzewy liczą się w „Obcych gatunkach inwazyjnych”). */
export const isWoody7140 = (name: string) => groupOf(name) === 'woody'

export const defaultLayer7140 = (s: SpeciesEntry7140): Layer => (s.woody ? 'B' : s.cryptogam ? 'D' : 'C')
