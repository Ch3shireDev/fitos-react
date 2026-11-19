// Słownik gatunków dla 7210 (torfowiska nakredowe: Cladietum marisci, Caricetum buxbaumii, Schoenetum nigricantis),
// zebrany z przewodnika GIOŚ (Buczek 2010, pkt 4 „Typowe gatunki roślin” i tab. 1), z karty przykładowej (Rezerwat Bagno
// Serebryskie 2, 2007) i ze sprawozdań z monitoringu 2006–2008, 2013–2014, 2016–2018 i 2024 (gatunki ekspansywne,
// synantropijne, obce, drzewa i krzewy). Drzewa i krzewy – warstwa B, runo – C, mszaki – D.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup7210 =
  | 'characteristic' // gatunki charakterystyczne i zarazem siedliskotwórcze
  | 'expansive' // rodzime gatunki ekspansywne roślin zielnych
  | 'synanthropic' // gatunki synantropijne (wydepczyskowe, ruderalne)
  | 'alien' // obce gatunki inwazyjne
  | 'woody' // rodzime drzewa i krzewy
  | 'companion' // pozostałe

/** Grupa progów dla gatunków ekspansywnych (tab. 1 i 2): trzęślica albo trzcina z turzycą sztywną i nitkowatą. */
export type ExpansiveKind7210 = 'molinia' | 'reed'

export interface SpeciesEntry7210 {
  latin: string
  polish?: string
  group: SpeciesGroup7210
  /** Gatunek budujący szuwar (kłoć, turzyca Buxbauma, marzyce) – w odróżnieniu od storczyków towarzyszących marzycy. */
  builder?: boolean
  /** Marzyca (Schoenus) – w Schoenetum nigricantis sama marzyca, bez storczyków, daje U1. */
  schoenus?: boolean
  /** Gatunek ekspansywny z progiem liczbowym w tab. 2. */
  expansiveKind?: ExpansiveKind7210
  woody?: boolean
  cryptogam?: boolean
}

export const GROUP_LABELS_7210: Record<SpeciesGroup7210, string> = {
  characteristic: 'gatunek charakterystyczny 7210',
  expansive: 'rodzimy gatunek ekspansywny',
  synanthropic: 'gatunek synantropijny',
  alien: 'gatunek obcy',
  woody: 'drzewo lub krzew',
  companion: 'gatunek towarzyszący',
}

const e = (latin: string, polish: string | undefined, group: SpeciesGroup7210, extra: Partial<SpeciesEntry7210> = {}): SpeciesEntry7210 => ({
  latin,
  ...(polish ? { polish } : {}),
  group,
  ...extra,
})
const ch = (latin: string, polish: string, extra: Partial<SpeciesEntry7210> = {}) => e(latin, polish, 'characteristic', extra)
const ex = (latin: string, polish: string, extra: Partial<SpeciesEntry7210> = {}) => e(latin, polish, 'expansive', extra)
const sy = (latin: string, polish: string) => e(latin, polish, 'synanthropic')
const al = (latin: string, polish: string, extra: Partial<SpeciesEntry7210> = {}) => e(latin, polish, 'alien', extra)
const wd = (latin: string, polish: string) => e(latin, polish, 'woody', { woody: true })
const co = (latin: string, polish: string | undefined, extra: Partial<SpeciesEntry7210> = {}) => e(latin, polish, 'companion', extra)
const M = { cryptogam: true }

export const SPECIES_7210: SpeciesEntry7210[] = [
  // gatunki charakterystyczne (pkt 4 i tab. 1): siedliskotwórcze trzech zespołów, marzyca ruda (Schoenetum ferruginei,
  // wschodnia Polska) oraz storczyki charakterystyczne dla Schoenetum nigricantis
  ch('Cladium mariscus', 'kłoć wiechowata', { builder: true }),
  ch('Carex buxbaumii', 'turzyca Buxbauma', { builder: true }),
  ch('Schoenus nigricans', 'marzyca czarniawa', { builder: true, schoenus: true }),
  ch('Schoenus ferrugineus', 'marzyca ruda', { builder: true, schoenus: true }),
  ch('Liparis loeselii', 'lipiennik Loesela'),
  ch('Orchis palustris', 'storczyk błotny'),
  ch('Anacamptis palustris', 'storczyk błotny (syn.)'),

  // rodzime gatunki ekspansywne – z progami w tab. 2
  ex('Molinia caerulea', 'trzęślica modra', { expansiveKind: 'molinia' }),
  ex('Phragmites australis', 'trzcina pospolita', { expansiveKind: 'reed' }),
  ex('Carex elata', 'turzyca sztywna', { expansiveKind: 'reed' }),
  ex('Carex lasiocarpa', 'turzyca nitkowata', { expansiveKind: 'reed' }),
  // … i bez progów (tab. 1 – gatunki łąkowe wkraczające za trzęślicą; sprawozdania 2013–2024)
  ex('Filipendula ulmaria', 'wiązówka błotna'),
  ex('Lysimachia vulgaris', 'tojeść pospolita'),
  ex('Eupatorium cannabinum', 'sadziec konopiasty'),
  ex('Thelypteris palustris', 'zachylnik błotny'),
  ex('Typha latifolia', 'pałka szerokolistna'),
  ex('Calamagrostis epigejos', 'trzcinnik piaskowy'),
  ex('Sesleria uliginosa', 'sesleria błotna'),
  ex('Carex paniculata', 'turzyca prosowa'),
  ex('Carex rostrata', 'turzyca dzióbkowata'),

  // gatunki synantropijne (tab. 1, sprawozdanie 2024)
  sy('Prunella vulgaris', 'głowienka pospolita'),
  sy('Cirsium arvense', 'ostrożeń polny'),
  sy('Tussilago farfara', 'podbiał pospolity'),
  sy('Rubus idaeus', 'malina właściwa'),

  // obce gatunki inwazyjne (tab. 1, sprawozdania 2018 i 2024)
  al('Spiraea tomentosa', 'tawuła kutnerowata', { woody: true }),
  al('Solidago gigantea', 'nawłoć późna'),
  al('Symphyotrichum lanceolatum', 'aster lancetowaty'),
  al('Aster lanceolatus', 'aster lancetowaty (syn.)'),
  al('Prunus serotina', 'czeremcha amerykańska', { woody: true }),
  al('Erigeron canadensis', 'przymiotno kanadyjskie'),
  al('Conyza canadensis', 'przymiotno kanadyjskie (syn.)'),

  // drzewa i krzewy (tab. 1, sprawozdania 2013–2024)
  wd('Betula pubescens', 'brzoza omszona'),
  wd('Betula pendula', 'brzoza brodawkowata'),
  wd('Frangula alnus', 'kruszyna pospolita'),
  wd('Alnus glutinosa', 'olsza czarna'),
  wd('Alnus incana', 'olsza szara'),
  wd('Salix pentandra', 'wierzba pięciopręcikowa'),
  wd('Salix cinerea', 'wierzba szara'),
  wd('Salix aurita', 'wierzba uszata'),
  wd('Salix rosmarinifolia', 'wierzba rokita'),
  wd('Pinus sylvestris', 'sosna zwyczajna'),

  // pozostałe: zdjęcie z karty przykładowej i częste gatunki torfowisk nakredowych
  co('Cirsium palustre', 'ostrożeń błotny'),
  co('Equisetum palustre', 'skrzyp błotny'),
  co('Galium uliginosum', 'przytulia bagienna'),
  co('Lathyrus palustris', 'groszek błotny'),
  co('Lythrum salicaria', 'krwawnica pospolita'),
  co('Menyanthes trifoliata', 'bobrek trójlistkowy'),
  co('Mentha aquatica', 'mięta nadwodna'),
  co('Peucedanum palustre', 'gorysz błotny'),
  co('Carex davalliana', 'turzyca Davalla'),
  co('Carex panicea', 'turzyca prosowata'),
  co('Utricularia minor', 'pływacz drobny'),
  co('Calliergonella cuspidata', undefined, M),
  co('Campylium stellatum', undefined, M),
  co('Fissidens adianthoides', undefined, M),
  co('Preissia quadrata', undefined, M),
  co('Scorpidium scorpioides', undefined, M),
  co('Limprichtia cossonii', undefined, M),
]

const BY_NAME = new Map(SPECIES_7210.map((s) => [normalizeName(s.latin), s]))

export const findSpecies7210 = (name: string): SpeciesEntry7210 | undefined => BY_NAME.get(normalizeName(name))

/** Klucz do liczenia gatunków: synonimy (Orchis/Anacamptis palustris…) dają jeden klucz. */
export const speciesKey7210 = (name: string) => (findSpecies7210(name)?.polish ?? normalizeName(name)).replace(/ \(syn\.\)$/, '')

const groupOf = (name: string) => findSpecies7210(name)?.group
export const isCharacteristic7210 = (name: string) => groupOf(name) === 'characteristic'
export const isSchoenus7210 = (name: string) => Boolean(findSpecies7210(name)?.schoenus)
export const isExpansive7210 = (name: string) => groupOf(name) === 'expansive'
export const expansiveKind7210 = (name: string) => findSpecies7210(name)?.expansiveKind
export const isSynanthropic7210 = (name: string) => groupOf(name) === 'synanthropic'
export const isAlien7210 = (name: string) => groupOf(name) === 'alien'
export const isWoody7210 = (name: string) => groupOf(name) === 'woody'

export const defaultLayer7210 = (s: SpeciesEntry7210): Layer => (s.woody ? 'B' : s.cryptogam ? 'D' : 'C')
