// Słownik gatunków dla 3260 (nizinne i podgórskie rzeki ze zbiorowiskami włosieniczników Ranunculion fluitantis),
// zebrany z przewodnika GIOŚ (Szoszkiewicz, Gebler 2012, rozdz. „Typowe gatunki roślin”, tab. 2), z przykładowej karty
// (Kanał Miejski – Sławno, 2011) i ze sprawozdań z monitoringu 2016–2018 i 2024 (tab. 3 – gatunki obce).
// Włosieniczniki podajemy w rodzaju Batrachium (jak przewodnik), z synonimami Ranunculus – w karcie z przewodnika
// i w MMOR pisze się też „Ranunculus fluitans”.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup3260 =
  | 'batrachium' // włosieniczniki liczone we wskaźniku (wszystkie rodzime poza krążkolistnym)
  | 'circinatum' // włosienicznik krążkolistny – NIE liczy się
  | 'characteristic' // inne gatunki charakterystyczne Ranunculion fluitantis
  | 'elodea' // moczarka kanadyjska – osobny wskaźnik kardynalny
  | 'alien' // obce gatunki inwazyjne (brzeg i pas 50 m)
  | 'macrophyte' // inne makrofity rzeczne (towarzyszące)
  | 'moss' // mchy i wątrobowce wodne (towarzyszące)

export interface SpeciesEntry3260 {
  latin: string
  polish: string
  group: SpeciesGroup3260
  /** Nazwa „kanoniczna” – synonimy liczone jako jeden gatunek. */
  same?: string
}

export const GROUP_LABELS_3260: Record<SpeciesGroup3260, string> = {
  batrachium: 'włosienicznik (liczy się we wskaźniku)',
  circinatum: 'włosienicznik krążkolistny – nie liczy się',
  characteristic: 'gatunek charakterystyczny Ranunculion fluitantis',
  elodea: 'moczarka kanadyjska – osobny wskaźnik',
  alien: 'obcy gatunek inwazyjny',
  macrophyte: 'makrofit towarzyszący',
  moss: 'mszak wodny towarzyszący',
}

const e = (latin: string, polish: string, group: SpeciesGroup3260, same?: string): SpeciesEntry3260 => ({ latin, polish, group, same })

export const SPECIES_3260: SpeciesEntry3260[] = [
  // włosieniczniki (tab. 2: wszystkie rodzime poza krążkolistnym)
  e('Batrachium aquatile', 'włosienicznik wodny', 'batrachium'),
  e('Batrachium baudotii', 'włosienicznik Baudota', 'batrachium'),
  e('Batrachium fluitans', 'włosienicznik rzeczny', 'batrachium'),
  e('Batrachium peltatum', 'włosienicznik tarczowaty', 'batrachium'),
  e('Batrachium penicillatum', 'włosienicznik pędzelkowaty', 'batrachium'),
  e('Batrachium trichophyllum', 'włosienicznik skąpopręcikowy', 'batrachium'),
  e('Ranunculus aquatilis', 'włosienicznik wodny', 'batrachium', 'Batrachium aquatile'),
  e('Ranunculus baudotii', 'włosienicznik Baudota', 'batrachium', 'Batrachium baudotii'),
  e('Ranunculus fluitans', 'włosienicznik rzeczny', 'batrachium', 'Batrachium fluitans'),
  e('Ranunculus peltatus', 'włosienicznik tarczowaty', 'batrachium', 'Batrachium peltatum'),
  e('Ranunculus penicillatus', 'włosienicznik pędzelkowaty', 'batrachium', 'Batrachium penicillatum'),
  e('Ranunculus trichophyllus', 'włosienicznik skąpopręcikowy', 'batrachium', 'Batrachium trichophyllum'),
  e('Batrachium circinatum', 'włosienicznik krążkolistny', 'circinatum'),
  e('Ranunculus circinatus', 'włosienicznik krążkolistny', 'circinatum', 'Batrachium circinatum'),
  // inne gatunki charakterystyczne (tab. 2)
  e('Callitriche hamulata', 'rzęśl hakowata', 'characteristic'),
  e('Callitriche cophocarpa', 'rzęśl długoszyjkowa', 'characteristic'),
  e('Groenlandia densa', 'rdestniczka gęsta', 'characteristic'),
  e('Potamogeton nodosus', 'rdestnica nawodna', 'characteristic'),
  e('Fontinalis antipyretica', 'zdrojek pospolity', 'characteristic'),
  e('Scapania undulata', 'wątrobowiec', 'characteristic'),
  // moczarka
  e('Elodea canadensis', 'moczarka kanadyjska', 'elodea'),
  // makrofity towarzyszące (karta Sławno, MMOR)
  e('Berula erecta', 'potocznik wąskolistny', 'macrophyte'),
  e('Veronica anagallis-aquatica', 'przetacznik bobownik', 'macrophyte'),
  e('Veronica beccabunga', 'przetacznik bobowniczek', 'macrophyte'),
  e('Sium latifolium', 'marek szerokolistny', 'macrophyte'),
  e('Sparganium emersum', 'jeżogłówka pojedyncza', 'macrophyte'),
  e('Sparganium erectum', 'jeżogłówka gałęzista', 'macrophyte'),
  e('Potamogeton pectinatus', 'rdestnica grzebieniasta', 'macrophyte'),
  e('Potamogeton crispus', 'rdestnica kędzierzawa', 'macrophyte'),
  e('Potamogeton perfoliatus', 'rdestnica przeszyta', 'macrophyte'),
  e('Potamogeton natans', 'rdestnica pływająca', 'macrophyte'),
  e('Potamogeton alpinus', 'rdestnica alpejska', 'macrophyte'),
  e('Potamogeton lucens', 'rdestnica połyskująca', 'macrophyte'),
  e('Nuphar lutea', 'grążel żółty', 'macrophyte'),
  e('Sagittaria sagittifolia', 'strzałka wodna', 'macrophyte'),
  e('Butomus umbellatus', 'łączeń baldaszkowy', 'macrophyte'),
  e('Myriophyllum spicatum', 'wywłócznik kłosowy', 'macrophyte'),
  e('Ceratophyllum demersum', 'rogatek sztywny', 'macrophyte'),
  e('Callitriche platycarpa', 'rzęśl płaskoowockowa', 'macrophyte'),
  e('Callitriche stagnalis', 'rzęśl wiosenna', 'macrophyte'),
  e('Lemna minor', 'rzęsa drobna', 'macrophyte'),
  e('Phalaris arundinacea', 'mozga trzcinowata', 'macrophyte'),
  e('Glyceria maxima', 'manna mielec', 'macrophyte'),
  e('Glyceria fluitans', 'manna jadalna', 'macrophyte'),
  e('Phragmites australis', 'trzcina pospolita', 'macrophyte'),
  e('Myosotis palustris', 'niezapominajka błotna', 'macrophyte'),
  e('Nasturtium officinale', 'rukiew wodna', 'macrophyte'),
  e('Hildenbrandia rivularis', 'krasnorost (Hildenbrandia)', 'macrophyte'),
  e('Cladophora glomerata', 'gałęzatka kłębiasta', 'macrophyte'),
  e('Leptodictyum riparium', 'mech wodny (Leptodictyum)', 'moss'),
  e('Platyhypnidium riparioides', 'mech wodny (Platyhypnidium)', 'moss'),
  // obce gatunki inwazyjne (sprawozdania 2016–2018 i 2024, tab. 3)
  e('Elodea nuttallii', 'moczarka delikatna', 'alien'),
  e('Impatiens parviflora', 'niecierpek drobnokwiatowy', 'alien'),
  e('Impatiens glandulifera', 'niecierpek gruczołowaty', 'alien'),
  e('Impatiens capensis', 'niecierpek pomarańczowy', 'alien'),
  e('Reynoutria japonica', 'rdestowiec japoński', 'alien'),
  e('Reynoutria sachalinensis', 'rdestowiec sachaliński', 'alien'),
  e('Reynoutria ×bohemica', 'rdestowiec pośredni', 'alien'),
  e('Echinocystis lobata', 'kolczurka klapowana', 'alien'),
  e('Solidago canadensis', 'nawłoć kanadyjska', 'alien'),
  e('Solidago gigantea', 'nawłoć późna', 'alien'),
  e('Bidens frondosa', 'uczep amerykański', 'alien'),
  e('Acer negundo', 'klon jesionolistny', 'alien'),
  e('Padus serotina', 'czeremcha amerykańska', 'alien'),
  e('Prunus serotina', 'czeremcha amerykańska', 'alien', 'Padus serotina'),
  e('Robinia pseudoacacia', 'robinia akacjowa', 'alien'),
  e('Rhus typhina', 'sumak octowiec', 'alien'),
  e('Lupinus polyphyllus', 'łubin trwały', 'alien'),
  e('Heracleum sosnowskyi', 'barszcz Sosnowskiego', 'alien'),
  e('Heracleum mantegazzianum', 'barszcz Mantegazziego', 'alien'),
  e('Helianthus tuberosus', 'słonecznik bulwiasty', 'alien'),
  e('Symphyotrichum ×salignum', 'aster wierzbolistny', 'alien'),
]

const BY_NAME = new Map(SPECIES_3260.map((s) => [normalizeName(s.latin), s]))

export const findSpecies3260 = (name: string): SpeciesEntry3260 | undefined => BY_NAME.get(normalizeName(name))

/** Klucz do liczenia gatunków: synonimy (Ranunculus fluitans = Batrachium fluitans) dają ten sam klucz. */
export const speciesKey3260 = (name: string): string => {
  const s = findSpecies3260(name)
  return normalizeName(s?.same ?? s?.latin ?? name)
}

/** Włosienicznik liczony we wskaźniku (bez krążkolistnego). Nieznane z katalogu – po rodzaju: Batrachium/Ranunculus sp. nie liczymy. */
export const isBatrachium3260 = (name: string) => findSpecies3260(name)?.group === 'batrachium'
export const isCircinatum3260 = (name: string) => findSpecies3260(name)?.group === 'circinatum'
export const isCharacteristic3260 = (name: string) => findSpecies3260(name)?.group === 'characteristic'
export const isElodea3260 = (name: string) => findSpecies3260(name)?.group === 'elodea'

/** Mszaki i Scapania w warstwie D, reszta – rośliny wodne – w C. */
export const defaultLayer3260 = (s: SpeciesEntry3260): Layer =>
  s.group === 'moss' || s.latin === 'Fontinalis antipyretica' || s.latin === 'Scapania undulata' ? 'D' : 'C'

/** Opcje selecta „gatunek” w tabelach wskaźników: [wartość = nazwa łacińska, etykieta „nazwa – polska”]. */
export const optionsOf = (group: SpeciesGroup3260, withSynonyms = false) =>
  SPECIES_3260.filter((s) => s.group === group && (withSynonyms || !s.same)).map((s) => ({ value: s.latin, label: `${s.latin} – ${s.polish}` }))
