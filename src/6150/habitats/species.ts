// Słownik gatunków dla 6150 (wysokogórskie murawy acidofilne Juncion trifidi i bezwapienne wyleżyska śnieżne Salicion
// herbaceae), zebrany z przewodnika GIOŚ (Kozak, Kozłowska, Mróz 2012, pkt 4 „Typowe gatunki roślin” i tab. 1),
// z przykładowej karty (Kopa Kondracka, 2011) i ze sprawozdań z monitoringu 2009–2011, 2016 i 2021 (gatunki
// charakterystyczne dopisane przez ekspertów, ekspansywne, synantropijne zawlekane przez turystów, drzewa i krzewy).
// Drzewa i krzewy – warstwa B, runo – C, mchy, wątrobowce i porosty – D.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup6150 =
  | 'characteristic' // gatunki charakterystyczne i wyróżniające Juncion trifidi / Salicion herbaceae
  | 'expansive' // gatunki ekspansywne (krzewinki, trawy) – spoza listy charakterystycznych
  | 'synanthropic' // gatunki synantropijne zawlekane przez człowieka (wskaźnik „Obce gatunki inwazyjne”)
  | 'woody' // drzewa i krzewy
  | 'companion' // pozostałe gatunki (zdjęcia z karty przykładowej)

export interface SpeciesEntry6150 {
  latin: string
  polish?: string
  group: SpeciesGroup6150
  /**
   * Skąd gatunek charakterystyczny: 'guide' – wykaz w pkt 4 przewodnika; 'report' – dopisany jako charakterystyczny
   * w sprawozdaniach 2009–2021 albo w opisie regionalnym przewodnika (Sudety, Bieszczady).
   */
  source?: 'guide' | 'report'
  /** Gatunek charakterystyczny dla wyleżysk śnieżnych (Salicion herbaceae) – gwiazdka w wykazie przewodnika. */
  snowbed?: boolean
  woody?: boolean
  /** Mech, wątrobowiec albo porost – warstwa D. */
  cryptogam?: boolean
  /** Gatunek obcy geograficznie (kenofit) – reszta grupy „synanthropic” to rodzime apofity. */
  alien?: boolean
}

export const GROUP_LABELS_6150: Record<SpeciesGroup6150, string> = {
  characteristic: 'gatunek charakterystyczny 6150',
  expansive: 'gatunek ekspansywny',
  synanthropic: 'gatunek synantropijny (zawleczony)',
  woody: 'drzewo albo krzew',
  companion: 'gatunek towarzyszący',
}

const e = (latin: string, polish: string, group: SpeciesGroup6150, extra: Partial<SpeciesEntry6150> = {}): SpeciesEntry6150 => ({ latin, polish, group, ...extra })
/** Gatunek z wykazu przewodnika; `*` – wyleżyska śnieżne. */
const g = (latin: string, polish: string, extra: Partial<SpeciesEntry6150> = {}) => e(latin, polish, 'characteristic', { source: 'guide', ...extra })
/** Gatunek uznany za charakterystyczny w sprawozdaniach albo opisie regionalnym przewodnika. */
const r = (latin: string, polish: string, extra: Partial<SpeciesEntry6150> = {}) => e(latin, polish, 'characteristic', { source: 'report', ...extra })
const S = { snowbed: true }
const D = { cryptogam: true }
const SD = { snowbed: true, cryptogam: true }
const W = { woody: true }

export const SPECIES_6150: SpeciesEntry6150[] = [
  // wykaz gatunków z przewodnika (pkt 4), gwiazdka = wyleżyska śnieżne
  g('Agrostis rupestris', 'mietlica skalna'),
  g('Alectoria ochroleuca', 'żyłecznik halny', D),
  g('Androsace obtusifolia', 'naradka tępolistna'),
  g('Anthelia juratzkana', 'wątrobowiec Anthelia juratzkana', SD),
  g('Avenula versicolor', 'owsica pstra'),
  g('Helictotrichon versicolor', 'owsica pstra (syn.)'),
  g('Campanula alpina', 'dzwonek alpejski'),
  g('Carex bigelowii subsp. rigida', 'turzyca tęga'),
  g('Carex rigida', 'turzyca tęga (syn.)'),
  g('Carex bigelowii', 'turzyca tęga (syn.)'),
  g('Carex dacica', 'turzyca dacka'),
  g('Carex lachenalii', 'turzyca Lachenala', S),
  g('Carex rupestris', 'turzyca skalna'),
  g('Cerastium cerastoides', 'rogownica trójszyjkowa', S),
  g('Cerastium cerastioides', 'rogownica trójszyjkowa (syn.)', S),
  g('Cetraria islandica', 'płucnica islandzka', D),
  g('Cladonia arbuscula', 'chrobotek leśny', D),
  g('Cladonia bellidiflora', 'chrobotek strojny', D),
  g('Cladonia rangiferina', 'chrobotek reniferowy', D),
  g('Diphasiastrum alpinum', 'widlicz alpejski'),
  g('Gentiana frigida', 'goryczka przezroczysta'),
  g('Festuca airoides', 'kostrzewa niska'),
  g('Festuca supina', 'kostrzewa niska (syn.)'),
  g('Flavocetraria cucullata', 'oskrzelka rynienkowata', D),
  g('Flavocetraria nivalis', 'oskrzelka niwalna', D),
  g('Gnaphalium supinum', 'szarota drobna', S),
  g('Hieracium alpinum', 'jastrzębiec alpejski'),
  g('Huperzia selago', 'wroniec widlasty'),
  g('Juncus trifidus', 'sit skucina'),
  g('Kiaeria falcata', 'mech Kiaeria falcata', SD),
  g('Kiaeria starkei', 'mech Kiaeria starkei', SD),
  g('Leucanthemopsis alpina', 'złocieniec alpejski'),
  g('Luzula alpino-pilosa', 'kosmatka brunatna', S),
  g('Luzula alpinopilosa', 'kosmatka brunatna (syn.)', S),
  g('Luzula spicata', 'kosmatka kłosowa'),
  g('Minuartia sedoides', 'mokrzyca rozchodnikowa'),
  g('Moerckia blyttii', 'wątrobowiec Moerckia blyttii', SD),
  g('Oligotrichum hercynicum', 'mech Oligotrichum hercynicum', SD),
  g('Oreochloa disticha', 'boimka dwurzędowa'),
  g('Poa alpina', 'wiechlina alpejska', S),
  g('Poa granitica', 'wiechlina granitowa', S),
  g('Poa supina', 'wiechlina niska', S),
  g('Polytrichastrum sexangulare', 'płonnik górski', SD),
  g('Polytrichum sexangulare', 'płonnik górski (syn.)', SD),
  g('Primula minima', 'pierwiosnek maleńki'),
  g('Pulsatilla alba', 'sasanka alpejska'),
  g('Racomitrium lanuginosum', 'skalniczek wełnisty', D),
  g('Ranunculus pseudomontanus', 'jaskier halny', S),
  g('Salix herbacea', 'wierzba zielna', S),
  g('Saussurea pygmaea', 'saussurea wielogłowa'),
  g('Senecio carniolicus', 'starzec kraiński'),
  g('Senecio carpaticus', 'starzec karpacki'),
  g('Silene acaulis subsp. norica', 'lepnica bezłodygowa'),
  g('Sibbaldia procumbens', 'sybaldia rozesłana', S),
  g('Thamnolia vermicularis', 'szydlina różowa', D),
  // dopisane jako charakterystyczne w sprawozdaniach 2009–2021 i w opisie regionalnym przewodnika (pkt 4)
  r('Sedum alpestre', 'rozchodnik alpejski'),
  r('Epilobium anagallidifolium', 'wierzbownica drobnolistna'),
  r('Veronica alpina', 'przetacznik alpejski'),
  r('Doronicum clusii', 'omieg kozłowiec'),
  r('Carex atrata', 'turzyca czarniawa'),
  r('Campanula bohemica', 'dzwonek karkonoski'),
  r('Potentilla aurea', 'pięciornik złoty'),
  r('Thymus alpestris', 'macierzanka halna'),
  r('Sesleria bielzii', 'sesleria Bielza'),

  // gatunki ekspansywne (tab. 1, sprawozdania 2009–2021); śmiałek pogięty i borówka czarna mają też własne wskaźniki
  e('Deschampsia flexuosa', 'śmiałek pogięty', 'expansive'),
  e('Avenella flexuosa', 'śmiałek pogięty (syn.)', 'expansive'),
  e('Vaccinium myrtillus', 'borówka czarna', 'expansive'),
  e('Vaccinium vitis-idaea', 'borówka brusznica', 'expansive'),
  e('Calamagrostis villosa', 'trzcinnik owłosiony', 'expansive'),
  e('Deschampsia caespitosa', 'śmiałek darniowy', 'expansive'),
  e('Calluna vulgaris', 'wrzos zwyczajny', 'expansive'),
  e('Rubus idaeus', 'malina właściwa', 'expansive'),
  e('Nardus stricta', 'bliźniczka psia trawka', 'expansive'),

  // synantropijne zawlekane przez turystów (sprawozdanie 2021: Śnieżnik Kłodzki) i typowe dla wydeptywanych miejsc
  e('Ranunculus acris', 'jaskier ostry', 'synanthropic'),
  e('Agrostis capillaris', 'mietlica pospolita', 'synanthropic'),
  e('Cerastium holosteoides', 'rogownica pospolita', 'synanthropic'),
  e('Ceratodon purpureus', 'zęboróg purpurowy', 'synanthropic', D),
  e('Poa annua', 'wiechlina roczna', 'synanthropic'),
  e('Plantago major', 'babka zwyczajna', 'synanthropic'),
  e('Trifolium repens', 'koniczyna biała', 'synanthropic'),
  e('Taraxacum officinale', 'mniszek pospolity', 'synanthropic'),
  e('Urtica dioica', 'pokrzywa zwyczajna', 'synanthropic'),
  e('Rumex alpinus', 'szczaw alpejski', 'synanthropic'),
  e('Chenopodium bonus-henricus', 'komosa strzałkowata', 'synanthropic'),
  e('Sagina procumbens', 'karmnik rozesłany', 'synanthropic'),
  e('Juncus tenuis', 'sit chudy', 'synanthropic', { alien: true }),
  e('Matricaria discoidea', 'rumianek bezpromieniowy', 'synanthropic', { alien: true }),

  // drzewa i krzewy (tab. 1, sprawozdania)
  e('Pinus mugo', 'kosodrzewina', 'woody', W),
  e('Picea abies', 'świerk pospolity', 'woody', W),
  e('Juniperus communis subsp. alpina', 'jałowiec halny', 'woody', W),
  e('Juniperus nana', 'jałowiec halny (syn.)', 'woody', W),
  e('Sorbus aucuparia', 'jarząb pospolity', 'woody', W),
  e('Salix silesiaca', 'wierzba śląska', 'woody', W),
  e('Pinus cembra', 'limba', 'woody', W),

  // pozostałe gatunki ze zdjęć karty przykładowej (Kopa Kondracka)
  e('Cladonia sp.', 'chrobotek', 'companion', D),
  e('Pleurozium schreberi', 'rokietnik pospolity', 'companion', D),
  e('Polytrichum sp.', 'płonnik', 'companion', D),
  e('Sphagnum sp.', 'torfowiec', 'companion', D),
  e('Homogyne alpina', 'podbiałek alpejski', 'companion'),
  e('Polygonum bistorta', 'rdest wężownik', 'companion'),
  e('Bistorta officinalis', 'rdest wężownik (syn.)', 'companion'),
]

const BY_NAME = new Map(SPECIES_6150.map((s) => [normalizeName(s.latin), s]))

export const findSpecies6150 = (name: string): SpeciesEntry6150 | undefined => BY_NAME.get(normalizeName(name))

/** Klucz do liczenia gatunków: synonimy (Avenula/Helictotrichon, Luzula alpino-pilosa/alpinopilosa…) dają jeden klucz. */
export const speciesKey6150 = (name: string) => (findSpecies6150(name)?.polish ?? normalizeName(name)).replace(/ \(syn\.\)$/, '')

const groupOf = (name: string) => findSpecies6150(name)?.group
export const isCharacteristic6150 = (name: string) => groupOf(name) === 'characteristic'
export const isSynanthropic6150 = (name: string) => groupOf(name) === 'synanthropic'
export const isWoody6150 = (name: string) => Boolean(findSpecies6150(name)?.woody)
/** Gatunki z osobnymi wskaźnikami („Ekspansja borówki czarnej”, „Występowanie śmiałka pogiętego”). */
export const hasOwnIndicator6150 = (name: string) => ['borówka czarna', 'śmiałek pogięty'].includes(speciesKey6150(name))

export const defaultLayer6150 = (s: SpeciesEntry6150): Layer => (s.woody ? 'B' : s.cryptogam ? 'D' : 'C')
