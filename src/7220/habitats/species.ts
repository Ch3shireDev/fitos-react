// Słownik gatunków dla *7220 (źródliska wapienne ze zbiorowiskami Cratoneurion commutati), zebrany z przewodnika GIOŚ
// (Parusel 2010, pkt 4 „Typowe gatunki roślin” i tab. 1), z karty przykładowej (Las Grabicz 1, 2007) i ze sprawozdań
// z monitoringu 2013–2014, 2016–2018 i 2024–2025 (propozycja rozszerzenia listy gatunków charakterystycznych z 2018 r.,
// gatunki ekspansywne, nitrofilne, wątrobowce, gatunki obce z tab. 4 sprawozdania 2025). Drzewa i krzewy – warstwa B,
// runo – C, mszaki – D.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup7220 =
  | 'characteristic' // gatunki charakterystyczne (tab. 1 przewodnika, klasa Montio-Cardaminetea, propozycja 2018)
  | 'alien' // gatunki obce (tab. 4 sprawozdania 2024–2025)
  | 'other' // pozostałe: ekspansywne, nitrofilne, wątrobowce spoza listy, gatunki z karty przykładowej

export interface SpeciesEntry7220 {
  latin: string
  polish?: string
  group: SpeciesGroup7220
  /**
   * Skąd gatunek charakterystyczny:
   * 'guide' – tab. 1 przewodnika (związek Cratoneurion commutati i wymienione gatunki Montio-Cardaminetea) i pkt 4;
   * 'class' – inne gatunki klasy Montio-Cardaminetea, którą tab. 1 zalicza do gatunków charakterystycznych w całości
   *           (śledziennica skrętolistna – pkt 4 przewodnika wymienia ją jako gatunek Cardamino-Montion);
   * 'proposed' – propozycja rozszerzenia listy ze sprawozdania 2016–2018 (pkt V), stosowana przez ekspertów w 2024 r.
   */
  source?: 'guide' | 'class' | 'proposed'
  /** Wątrobowiec (wskaźnik „Obecność i pokrycie wątrobowców”). */
  liverwort?: boolean
  /** Rodzimy gatunek ekspansywny (tab. 1 i sprawozdania 2013–2025). */
  expansive?: boolean
  /** Gatunek nitrofilny albo ziołoroślowy, wskazujący na eutrofizację (tab. 1 i sprawozdania 2013–2025). */
  eutrophic?: boolean
  woody?: boolean
  /** Mszak – warstwa D. */
  cryptogam?: boolean
}

export const GROUP_LABELS_7220: Record<SpeciesGroup7220, string> = {
  characteristic: 'gatunek charakterystyczny 7220',
  alien: 'gatunek obcy',
  other: 'gatunek towarzyszący',
}

const e = (latin: string, polish: string | undefined, group: SpeciesGroup7220, extra: Partial<SpeciesEntry7220> = {}): SpeciesEntry7220 => ({
  latin,
  ...(polish ? { polish } : {}),
  group,
  ...extra,
})
const ch = (latin: string, polish: string | undefined, extra: Partial<SpeciesEntry7220> = {}) => e(latin, polish, 'characteristic', { source: 'guide', ...extra })
const cl = (latin: string, polish: string | undefined, extra: Partial<SpeciesEntry7220> = {}) => e(latin, polish, 'characteristic', { source: 'class', ...extra })
const pr = (latin: string, polish: string | undefined, extra: Partial<SpeciesEntry7220> = {}) => e(latin, polish, 'characteristic', { source: 'proposed', ...extra })
const al = (latin: string, polish: string, extra: Partial<SpeciesEntry7220> = {}) => e(latin, polish, 'alien', extra)
const ot = (latin: string, polish: string | undefined, extra: Partial<SpeciesEntry7220> = {}) => e(latin, polish, 'other', extra)
const M = { cryptogam: true }
const LW = { cryptogam: true, liverwort: true }
const EX = { expansive: true }
const EU = { eutrophic: true }
const EXU = { expansive: true, eutrophic: true }
const W = { woody: true }

export const SPECIES_7220: SpeciesEntry7220[] = [
  // tab. 1 – związek Cratoneurion commutati
  ch('Palustriella commutata', 'źródliskowiec zmienny', M),
  ch('Cratoneuron commutatum', 'źródliskowiec zmienny (syn.)', M),
  ch('Cratoneuron filicinum', 'żebrowiec paprociowaty', M),
  ch('Philonotis calcarea', 'bagniak wapienny', M),
  ch('Arabis soyeri subsp. subcoriacea', 'gęsiówka stokrotkolistna'),
  ch('Arabis soyeri', 'gęsiówka stokrotkolistna (syn.)'),
  ch('Heliosperma quadridentatum', 'słonecznica wąskolistna'),
  ch('Saxifraga aizoides', 'skalnica nakrapiana'),
  ch('Swertia perennis subsp. alpestris', 'niebielistka trwała'),
  ch('Swertia perennis', 'niebielistka trwała (syn.)'),
  ch('Cochlearia polonica', 'warzucha polska'),
  ch('Preissia quadrata', 'porostniczka czterodzielna', LW),
  ch('Pellia endiviifolia', 'pleszanka kędzierzawa', LW),
  ch('Pellia endiviaefolia', 'pleszanka kędzierzawa (syn.)', LW),
  // tab. 1 – Montio-Cardaminetea
  ch('Cardamine amara', 'rzeżucha gorzka'),
  ch('Cardamine amara subsp. amara', 'rzeżucha gorzka (syn.)'),
  ch('Cratoneuron decipiens', 'źródliskowiec tujowaty', M),
  ch('Palustriella decipiens', 'źródliskowiec tujowaty (syn.)', M),
  ch('Epilobium alsinifolium', 'wierzbownica mokrzycowa'),
  // pkt 4 – gatunki charakteryzujące siedlisko
  ch('Aneura pinguis', 'beznerw tłusty', LW),
  // inne gatunki klasy Montio-Cardaminetea (tab. 1 zalicza klasę w całości)
  cl('Chrysosplenium alternifolium', 'śledziennica skrętolistna'),
  cl('Chrysosplenium oppositifolium', 'śledziennica naprzeciwlistna'),
  cl('Stellaria alsine', 'gwiazdnica bagienna'),
  cl('Stellaria uliginosa', 'gwiazdnica bagienna (syn.)'),
  cl('Montia fontana', 'zdrojek pospolity'),
  cl('Philonotis fontana', 'bagniak zdrojowy', M),
  cl('Cardamine amara subsp. opizii', 'rzeżucha gorzka Opiza'),
  cl('Cardamine opizii', 'rzeżucha gorzka Opiza (syn.)'),
  // propozycja rozszerzenia listy (sprawozdanie 2016–2018, pkt V) – liczona przez ekspertów w 2024 r.
  pr('Bryum pseudotriquetrum', 'prątnik nabrzmiały', M),
  pr('Brachythecium rivulare', 'krótkosz strumieniowy', M),
  pr('Conocephalum conicum', 'stożka ostrokrężna', LW),
  pr('Conocephalum salebrosum', 'stożka matowa', LW),
  pr('Rhizomnium magnifolium', undefined, M),
  pr('Rhizomnium punctatum', 'merzyk kropkowany', M),
  pr('Chaerophyllum hirsutum', 'świerząbek orzęsiony'),
  pr('Epilobium anagallidifolium', 'wierzbownica drobnolistna'),
  pr('Viola biflora', 'fiołek dwukwiatowy'),
  pr('Eucladium verticillatum', 'gałęziak przęślik', M),

  // gatunki obce (sprawozdanie 2024–2025, tab. 4)
  al('Impatiens parviflora', 'niecierpek drobnokwiatowy'),
  al('Heracleum sosnowskyi', 'barszcz Sosnowskiego'),
  al('Solidago canadensis', 'nawłoć kanadyjska'),
  al('Elodea canadensis', 'moczarka kanadyjska'),
  al('Juglans regia', 'orzech włoski', W),

  // rodzime gatunki ekspansywne i nitrofilne (tab. 1, sprawozdania 2013–2025)
  ot('Urtica dioica', 'pokrzywa zwyczajna', EXU),
  ot('Cirsium oleraceum', 'ostrożeń warzywny', EXU),
  ot('Eupatorium cannabinum', 'sadziec konopiasty', EXU),
  ot('Equisetum telmateia', 'skrzyp olbrzymi', EXU),
  ot('Galium aparine', 'przytulia czepna', EXU),
  ot('Phalaris arundinacea', 'mozga trzcinowata', EXU),
  ot('Impatiens noli-tangere', 'niecierpek pospolity', EXU),
  ot('Rubus idaeus', 'malina właściwa', EXU),
  ot('Carex acutiformis', 'turzyca błotna', EXU),
  ot('Mentha longifolia', 'mięta długolistna', EXU),
  ot('Lotus uliginosus', 'komonica błotna', EXU),
  ot('Lotus pedunculatus', 'komonica błotna (syn.)', EXU),
  ot('Holcus lanatus', 'kłosówka wełnista', EXU),
  ot('Calliergonella cuspidata', 'mokradłoszka zaostrzona', { ...EXU, ...M }),
  ot('Aegopodium podagraria', 'podagrycznik pospolity', EU),
  ot('Alliaria petiolata', 'czosnaczek pospolity', EU),
  ot('Alliaria officinalis', 'czosnaczek pospolity (syn.)', EU),
  ot('Petasites hybridus', 'lepiężnik różowy', EX),
  ot('Deschampsia caespitosa', 'śmiałek darniowy', EX),
  ot('Deschampsia cespitosa', 'śmiałek darniowy (syn.)', EX),
  ot('Festuca carpatica', 'kostrzewa karpacka', EX),
  ot('Juncus inflexus', 'sit siny', EX),
  ot('Valeriana simplicifolia', 'kozłek całolistny', EX),
  ot('Solanum dulcamara', 'psianka słodkogórz', EX),
  ot('Carex paniculata', 'turzyca prosowa', EX),
  ot('Filipendula ulmaria', 'wiązówka błotna', EX),
  ot('Scirpus sylvaticus', 'sitowie leśne', EX),
  ot('Agrostis stolonifera', 'mietlica rozłogowa', EX),
  ot('Glyceria fluitans', 'manna jadalna', EX),
  ot('Circaea lutetiana', 'czartawa pospolita', EX),
  ot('Galeobdolon luteum', 'gajowiec żółty', EX),
  ot('Lamium galeobdolon', 'gajowiec żółty (syn.)', EX),
  ot('Sambucus nigra', 'bez czarny', { ...EX, ...W }),
  ot('Ribes spicatum', 'porzeczka skandynawska', { ...EX, ...W }),

  // wątrobowce spoza listy gatunków charakterystycznych (sprawozdania 2014–2025)
  ot('Plagiochila porelloides', 'skosatka parzochowata', LW),
  ot('Trichocolea tomentella', 'piórkowiec kutnerowaty', LW),
  ot('Chiloscyphus pallescens', 'wargowiec blady', LW),
  ot('Lophocolea bidentata', 'płozik dwuzębny', LW),
  ot('Marchantia polymorpha', 'porostnica wielokształtna', LW),
  ot('Moerckia hibernica', undefined, LW),

  // pozostałe: zdjęcia z karty przykładowej (Las Grabicz 1) i częste gatunki towarzyszące źródlisk
  ot('Ajuga reptans', 'dąbrówka rozłogowa'),
  ot('Anthriscus nitidus', 'trybula lśniąca'),
  ot('Athyrium filix-femina', 'wietlica samicza'),
  ot('Carex remota', 'turzyca rzadkokłosa'),
  ot('Carex sylvatica', 'turzyca leśna'),
  ot('Carex pendula', 'turzyca zwisła'),
  ot('Fraxinus excelsior', 'jesion wyniosły'),
  ot('Galium odoratum', 'przytulia wonna'),
  ot('Geranium robertianum', 'bodziszek cuchnący'),
  ot('Juncus effusus', 'sit rozpierzchły'),
  ot('Milium effusum', 'prosownica rozpierzchła'),
  ot('Petasites albus', 'lepiężnik biały'),
  ot('Primula elatior', 'pierwiosnek wyniosły'),
  ot('Pulmonaria obscura', 'miodunka ćma'),
  ot('Ranunculus lanuginosus', 'jaskier kosmaty'),
  ot('Salvia glutinosa', 'szałwia lepka'),
  ot('Senecio fuchsii', 'starzec Fuchsa'),
  ot('Senecio ovatus', 'starzec Fuchsa (syn.)'),
  ot('Veronica montana', 'przetacznik górski'),
  ot('Equisetum palustre', 'skrzyp błotny'),
  ot('Myosotis palustris', 'niezapominajka błotna'),
  ot('Myosotis scorpioides', 'niezapominajka błotna (syn.)'),
  ot('Brachypodium sylvaticum', 'kłosownica leśna'),
  ot('Mercurialis perennis', 'szczyr trwały'),
  ot('Sanicula europaea', 'żankiel zwyczajny'),
  ot('Viola sylvestris', 'fiołek leśny'),
  ot('Viola reichenbachiana', 'fiołek leśny (syn.)'),
  ot('Mentha aquatica', 'mięta nadwodna'),
  ot('Caltha palustris', 'knieć błotna'),
  ot('Plagiomnium undulatum', 'płaskomerzyk falisty', M),
  ot('Platyhypnidium riparioides', undefined, M),
]

const BY_NAME = new Map(SPECIES_7220.map((s) => [normalizeName(s.latin), s]))

export const findSpecies7220 = (name: string): SpeciesEntry7220 | undefined => BY_NAME.get(normalizeName(name))

/** Klucz do liczenia gatunków: synonimy (Palustriella/Cratoneuron commutatum, Pellia endiviaefolia…) dają jeden klucz. */
export const speciesKey7220 = (name: string) => {
  const s = findSpecies7220(name)
  return (s?.polish ?? normalizeName(name)).replace(/ \(syn\.\)$/, '')
}

/**
 * Gatunek charakterystyczny: lista z tab. 1 i pkt 4 przewodnika oraz klasa Montio-Cardaminetea; z `extended` – także
 * propozycja rozszerzenia listy ze sprawozdania 2016–2018 (krótkosz strumieniowy, stożki, merzyk, świerząbek orzęsiony…).
 */
export const isCharacteristic7220 = (name: string, extended = false) => {
  const s = findSpecies7220(name)
  return s?.group === 'characteristic' && (extended || s.source !== 'proposed')
}
/** Gatunek z propozycji rozszerzenia listy (2018) – typowy dla źródlisk, nawet gdy liczony wg samego przewodnika. */
export const isProposed7220 = (name: string) => findSpecies7220(name)?.source === 'proposed'
export const isAlien7220 = (name: string) => findSpecies7220(name)?.group === 'alien'
export const isLiverwort7220 = (name: string) => Boolean(findSpecies7220(name)?.liverwort)
export const isExpansive7220 = (name: string) => Boolean(findSpecies7220(name)?.expansive)
export const isEutrophic7220 = (name: string) => Boolean(findSpecies7220(name)?.eutrophic)

export const defaultLayer7220 = (s: SpeciesEntry7220): Layer => (s.woody ? 'B' : s.cryptogam ? 'D' : 'C')
