// Słownik gatunków dla 7150 (obniżenia na podłożu torfowym z roślinnością ze związku Rhynchosporion), zebrany z przewodnika
// GIOŚ (Koczur, cz. III, pkt 4 „Typowe gatunki roślin” i tab. 1), z przykładowej karty (Bór na Czerwonem, 2010) i ze
// sprawozdań z monitoringu 2009–2011 i 2015–2018 (gatunki ekspansywne, obce, drzewa i krzewy, gatunki ziemnowodne).
// Drzewa i krzewy – warstwa B, runo – C, mszaki – D.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup7150 =
  | 'characteristic' // gatunki charakterystyczne przygiełkowisk (tab. 1 i pkt 4 przewodnika)
  | 'expansive' // rodzime gatunki ekspansywne roślin zielnych
  | 'alien' // gatunki obce (inwazyjne)
  | 'woody' // drzewa i krzewy (wskaźnik „Obecność krzewów i podrostu drzew”)
  | 'companion' // pozostałe gatunki (zdjęcia z karty przykładowej, mszary, torfowiska przejściowe)

export interface SpeciesEntry7150 {
  latin: string
  polish?: string
  group: SpeciesGroup7150
  /**
   * Skąd gatunek charakterystyczny: 'representative' – „gatunki reprezentatywne” z tab. 1 (przygiełki, widłaczek, rosiczki);
   * 'local' – „inne lokalnie charakterystyczne” z tab. 1 (wełnianeczka, wełnianka wąskolistna, turzyca dzióbkowata,
   * torfowiec cieniutki i ząbkowany); 'typical' – stała domieszka na podłożu mineralno-torfowym z pkt 4 (sit drobny, wąkrota).
   */
  source?: 'representative' | 'local' | 'typical'
  /** Mech albo wątrobowiec – warstwa D. */
  cryptogam?: boolean
  /** Krótki dopisek do etykiety gatunku (np. skąd w katalogu). */
  note?: string
}

export const GROUP_LABELS_7150: Record<SpeciesGroup7150, string> = {
  characteristic: 'gatunek charakterystyczny 7150',
  expansive: 'rodzimy gatunek ekspansywny',
  alien: 'obcy gatunek inwazyjny',
  woody: 'drzewo lub krzew',
  companion: 'gatunek towarzyszący',
}

const e = (latin: string, polish: string, group: SpeciesGroup7150, extra: Partial<SpeciesEntry7150> = {}): SpeciesEntry7150 => ({ latin, polish, group, ...extra })
const ch = (source: SpeciesEntry7150['source']) => (latin: string, polish: string, extra: Partial<SpeciesEntry7150> = {}) =>
  e(latin, polish, 'characteristic', { source, ...extra })
const rep = ch('representative')
const loc = ch('local')
const typ = ch('typical')
const ex = (latin: string, polish: string, extra: Partial<SpeciesEntry7150> = {}) => e(latin, polish, 'expansive', extra)
const al = (latin: string, polish: string, extra: Partial<SpeciesEntry7150> = {}) => e(latin, polish, 'alien', extra)
const wd = (latin: string, polish: string, extra: Partial<SpeciesEntry7150> = {}) => e(latin, polish, 'woody', extra)
const co = (latin: string, polish: string, extra: Partial<SpeciesEntry7150> = {}) => e(latin, polish, 'companion', extra)
const D = { cryptogam: true }

export const SPECIES_7150: SpeciesEntry7150[] = [
  // gatunki reprezentatywne (tab. 1)
  rep('Rhynchospora alba', 'przygiełka biała'),
  rep('Rhynchospora fusca', 'przygiełka brunatna'),
  rep('Lycopodiella inundata', 'widłaczek torfowy'),
  rep('Drosera rotundifolia', 'rosiczka okrągłolistna'),
  rep('Drosera intermedia', 'rosiczka pośrednia'),
  // inne lokalnie charakterystyczne (tab. 1; pkt 4: w górach, gdzie brak przygiełek)
  loc('Baeothryon caespitosum', 'wełnianeczka darniowa'),
  loc('Trichophorum cespitosum', 'wełnianeczka darniowa (syn.)'),
  loc('Eriophorum angustifolium', 'wełnianka wąskolistna'),
  loc('Carex rostrata', 'turzyca dzióbkowata'),
  loc('Sphagnum tenellum', 'torfowiec cieniutki', D),
  loc('Sphagnum denticulatum', 'torfowiec ząbkowany', D),
  loc('Sphagnum auriculatum', 'torfowiec ząbkowany (syn.)', D),
  // stała domieszka na podłożu mineralno-torfowym (pkt 4)
  typ('Juncus bulbosus', 'sit drobny'),
  typ('Hydrocotyle vulgaris', 'wąkrota zwyczajna'),

  // rodzime gatunki ekspansywne (sprawozdania 2010–2011 i 2016)
  ex('Molinia caerulea', 'trzęślica modra'),
  ex('Phragmites australis', 'trzcina pospolita'),
  ex('Calluna vulgaris', 'wrzos zwyczajny', { note: 'Łysa Puścizna 2016: „obcy siedliskowo” dominant' }),

  // gatunki obce (sprawozdania 2010–2011 i 2016)
  al('Spiraea tomentosa', 'tawuła kutnerowata'),
  al('Campylopus introflexus', 'krzywoszczeć przywłoka', D),

  // drzewa i krzewy (sprawozdania 2016, karta przykładowa)
  wd('Pinus sylvestris', 'sosna zwyczajna'),
  wd('Pinus ×rhaetica', 'sosna drzewokosa'),
  wd('Betula pubescens', 'brzoza omszona'),
  wd('Betula pendula', 'brzoza brodawkowata'),
  wd('Frangula alnus', 'kruszyna pospolita'),
  wd('Salix aurita', 'wierzba uszata'),
  wd('Salix cinerea', 'wierzba szara'),
  wd('Picea abies', 'świerk pospolity'),
  wd('Alnus glutinosa', 'olsza czarna'),

  // gatunki towarzyszące: zdjęcia z karty przykładowej (mszar wysokotorfowiskowy)
  co('Andromeda polifolia', 'modrzewnica zwyczajna'),
  co('Eriophorum vaginatum', 'wełnianka pochwowata', { note: 'Łysa Puścizna 2016: „obcy siedliskowo” dominant' }),
  co('Ledum palustre', 'bagno zwyczajne'),
  co('Rhododendron tomentosum', 'bagno zwyczajne (syn.)'),
  co('Oxycoccus palustris', 'żurawina błotna'),
  co('Vaccinium oxycoccos', 'żurawina błotna (syn.)'),
  co('Vaccinium uliginosum', 'borówka bagienna'),
  co('Carex nigra', 'turzyca pospolita'),
  co('Sphagnum cuspidatum', 'torfowiec spiczastolistny', D),
  co('Sphagnum fallax', 'torfowiec kończysty', D),
  co('Sphagnum magellanicum', 'torfowiec magellański', D),
  co('Sphagnum rubellum', 'torfowiec czerwonawy', D),
  co('Sphagnum palustre', 'torfowiec błotny', D),
  co('Sphagnum compactum', 'torfowiec zbity', D),
  co('Sphagnum papillosum', 'torfowiec brodawkowaty', D),
  // gatunki torfowisk przejściowych i młak (sprawozdanie 2016–2018: sukcesja do 7140, Caricion fuscae)
  co('Scheuchzeria palustris', 'bagnica torfowa'),
  co('Carex limosa', 'turzyca bagienna'),
  co('Carex lasiocarpa', 'turzyca nitkowata'),
  co('Agrostis canina', 'mietlica psia'),
  co('Menyanthes trifoliata', 'bobrek trójlistkowy'),
  co('Potentilla palustris', 'siedmiopalecznik błotny'),
  // gatunki ziemnowodne i wskaźnikowe (sprawozdanie 2016–2018, „Inne uwagi”)
  co('Sphagnum inundatum', 'torfowiec zatopiony', { ...D, note: 'gatunek ziemnowodny, ważny dla identyfikacji przygiełkowisk (sprawozdanie 2016–2018)' }),
  co('Gymnocolea inflata', 'wątrobowiec Gymnocolea inflata', { ...D, note: 'wskaźnik okresowego przesuszenia (sprawozdanie 2016–2018)' }),
  co('Fossombronia foveolata', 'wątrobowiec Fossombronia foveolata', { ...D, note: 'wskaźnik okresowego przesuszenia (sprawozdanie 2016–2018)' }),
  co('Cladopodiella fluitans', 'wątrobowiec Cladopodiella fluitans', D),
]

const BY_NAME = new Map(SPECIES_7150.map((s) => [normalizeName(s.latin), s]))

export const findSpecies7150 = (name: string): SpeciesEntry7150 | undefined => BY_NAME.get(normalizeName(name))

/** Klucz do liczenia gatunków: synonimy (Baeothryon/Trichophorum, S. denticulatum/auriculatum…) dają jeden klucz. */
export const speciesKey7150 = (name: string) => (findSpecies7150(name)?.polish ?? normalizeName(name)).replace(/ \(syn\.\)$/, '')

const groupOf = (name: string) => findSpecies7150(name)?.group
export const isCharacteristic7150 = (name: string) => groupOf(name) === 'characteristic'
export const isExpansive7150 = (name: string) => groupOf(name) === 'expansive'
export const isAlien7150 = (name: string) => groupOf(name) === 'alien'
export const isWoody7150 = (name: string) => groupOf(name) === 'woody'

export const defaultLayer7150 = (s: SpeciesEntry7150): Layer => (s.group === 'woody' ? 'B' : s.cryptogam ? 'D' : 'C')
