// Słownik gatunków dla 6510 (ekstensywnie użytkowane niżowe łąki świeże, Arrhenatherion), zebrany z przewodnika GIOŚ
// (Korzeniak 2012, rozdz. „Typowe gatunki roślin”, tab. 1–2), przykładu karty Kowaliki 1 i sprawozdań z monitoringu
// 2009–2011, 2015–2018 i 2023–2025 (gatunki obce, ekspansywne, krzewy). Służy do wyszukiwarki i podpowiedzi ocen.
// Grupy obcych, ekspansywnych i drzewiastych są wspólne z 6410 (ten sam typ łąk, te same zagrożenia).
import type { Layer, SpeciesRow } from '../../7120/habitats/types'

export type SpeciesGroup6510 =
  | 'char' // charakterystyczny dla zw. Arrhenatherion i zespołu Arrhenatheretum elatioris (lista z tab. 1)
  | 'char-local' // lokalnie charakterystyczny: Galium album (Ziemia Lubuska), Festuca rubra (Sudety i Przedgórze)
  | 'poa-festuca' // diagnostyczny dla zb. Poa pratensis-Festuca rubra (wiechlina łąkowa, kostrzewa czerwona)
  | 'meadow' // gatunek łąkowy (Arrhenatheretalia, Molinio-Arrhenatheretea) – typowy dla łąk świeżych
  | 'expansive-strong' // gatunek ekspansywny wymieniony w tab. 1 przewodnika
  | 'expansive' // inny rodzimy gatunek ekspansywny (ze sprawozdań)
  | 'invasive-high' // obcy gatunek wysoce inwazyjny
  | 'invasive-low' // obcy gatunek o niskim stopniu inwazyjności
  | 'woody' // krzew lub drzewo
  | 'other'

export interface SpeciesEntry {
  latin: string
  polish?: string
  group: SpeciesGroup6510
  layer?: Layer
  synonyms?: string[]
}

export const GROUP_LABELS_6510: Record<SpeciesGroup6510, string> = {
  char: 'gatunek charakterystyczny',
  'char-local': 'gatunek lokalnie charakterystyczny',
  'poa-festuca': 'gatunek łąkowy (diagnostyczny dla zb. Poa pratensis-Festuca rubra)',
  meadow: 'gatunek łąkowy (typowy dla łąk świeżych)',
  'expansive-strong': 'gatunek ekspansywny (wymieniony w przewodniku)',
  expansive: 'rodzimy gatunek ekspansywny',
  'invasive-high': 'obcy gatunek wysoce inwazyjny',
  'invasive-low': 'obcy gatunek o niskim stopniu inwazyjności',
  woody: 'krzew lub drzewo',
  other: 'inny',
}

/** Obce, ekspansywne i drzewiaste – wspólne dla łąk 6510 i 6410. */
export const MEADOW_THREAT_SPECIES: SpeciesEntry[] = [
  // --- obce wysoce inwazyjne (tab. 1 przewodnika 6510 + sprawozdania) ---
  { latin: 'Reynoutria japonica', polish: 'rdestowiec ostrokończysty', group: 'invasive-high', synonyms: ['Fallopia japonica'] },
  { latin: 'Reynoutria ×bohemica', polish: 'rdestowiec pośredni', group: 'invasive-high', synonyms: ['Reynoutria x bohemica', 'Reynoutria bohemica'] },
  { latin: 'Reynoutria sachalinensis', polish: 'rdestowiec sachaliński', group: 'invasive-high' },
  { latin: 'Solidago canadensis', polish: 'nawłoć kanadyjska', group: 'invasive-high' },
  { latin: 'Solidago gigantea', polish: 'nawłoć późna', group: 'invasive-high' },
  { latin: 'Heracleum sosnowskyi', polish: 'barszcz Sosnowskiego', group: 'invasive-high' },
  { latin: 'Heracleum mantegazzianum', polish: 'barszcz Mantegazziego', group: 'invasive-high' },
  { latin: 'Prunus serotina', polish: 'czeremcha amerykańska', group: 'invasive-high', layer: 'B', synonyms: ['Padus serotina'] },
  { latin: 'Helianthus tuberosus', polish: 'słonecznik bulwiasty', group: 'invasive-high' },
  { latin: 'Erigeron annuus', polish: 'przymiotno białe', group: 'invasive-high' },
  { latin: 'Lupinus polyphyllus', polish: 'łubin trwały', group: 'invasive-high' },
  { latin: 'Rumex confertus', polish: 'szczaw omszony', group: 'invasive-high' },
  { latin: 'Acer negundo', polish: 'klon jesionolistny', group: 'invasive-high', layer: 'B' },
  { latin: 'Impatiens glandulifera', polish: 'niecierpek gruczołowaty', group: 'invasive-high' },
  { latin: 'Echinocystis lobata', polish: 'kolczurka klapowana', group: 'invasive-high' },
  { latin: 'Robinia pseudoacacia', polish: 'robinia akacjowa', group: 'invasive-high', layer: 'B', synonyms: ['Robinia pseudacacia'] },
  { latin: 'Bidens frondosa', polish: 'uczep amerykański', group: 'invasive-high' },
  { latin: 'Aster novi-belgii', polish: 'aster nowobelgijski', group: 'invasive-high', synonyms: ['Symphyotrichum novi-belgii'] },
  // --- obce o niskim stopniu inwazyjności ---
  { latin: 'Conyza canadensis', polish: 'przymiotno kanadyjskie', group: 'invasive-low', synonyms: ['Erigeron canadensis'] },
  { latin: 'Impatiens parviflora', polish: 'niecierpek drobnokwiatowy', group: 'invasive-low' },
  { latin: 'Epilobium ciliatum', polish: 'wierzbownica gruczołowata', group: 'invasive-low', synonyms: ['Epilobium adenocaulon'] },
  { latin: 'Juncus tenuis', polish: 'sit chudy', group: 'invasive-low' },
  { latin: 'Oxalis stricta', polish: 'szczawik żółty', group: 'invasive-low', synonyms: ['Oxalis fontana'] },
  { latin: 'Bryonia alba', polish: 'przestęp biały', group: 'invasive-low' },
  { latin: 'Erigeron ramosus', polish: 'przymiotno gałęziste', group: 'invasive-low' },
  { latin: 'Lycium barbarum', polish: 'kolcowój szkarłatny', group: 'invasive-low', layer: 'B' },
  { latin: 'Aronia melanocarpa', polish: 'aronia czarna', group: 'invasive-low', layer: 'B' },
  { latin: 'Quercus rubra', polish: 'dąb czerwony', group: 'invasive-low', layer: 'B' },
  // --- ekspansywne wymienione w przewodnikach 6510 i 6410 ---
  { latin: 'Calamagrostis epigejos', polish: 'trzcinnik piaskowy', group: 'expansive-strong' },
  { latin: 'Calamagrostis canescens', polish: 'trzcinnik lancetowaty', group: 'expansive-strong' },
  { latin: 'Deschampsia caespitosa', polish: 'śmiałek darniowy', group: 'expansive-strong', synonyms: ['Deschampsia cespitosa'] },
  { latin: 'Elymus repens', polish: 'perz właściwy', group: 'expansive-strong', synonyms: ['Agropyron repens', 'Elytrigia repens'] },
  { latin: 'Phragmites australis', polish: 'trzcina pospolita', group: 'expansive-strong' },
  { latin: 'Urtica dioica', polish: 'pokrzywa zwyczajna', group: 'expansive-strong' },
  { latin: 'Cirsium arvense', polish: 'ostrożeń polny', group: 'expansive-strong' },
  { latin: 'Chaerophyllum aromaticum', polish: 'świerząbek korzenny', group: 'expansive-strong' },
  { latin: 'Aegopodium podagraria', polish: 'podagrycznik pospolity', group: 'expansive-strong' },
  { latin: 'Anthriscus sylvestris', polish: 'trybula leśna', group: 'expansive-strong' },
  { latin: 'Galium aparine', polish: 'przytulia czepna', group: 'expansive-strong' },
  { latin: 'Tanacetum vulgare', polish: 'wrotycz pospolity', group: 'expansive-strong' },
  { latin: 'Artemisia vulgaris', polish: 'bylica pospolita', group: 'expansive-strong' },
  { latin: 'Pteridium aquilinum', polish: 'orlica pospolita', group: 'expansive-strong' },
  { latin: 'Filipendula ulmaria', polish: 'wiązówka błotna', group: 'expansive-strong' },
  { latin: 'Rubus idaeus', polish: 'malina właściwa', group: 'expansive-strong' },
  // --- inne ekspansywne ze sprawozdań ---
  { latin: 'Holcus mollis', polish: 'kłosówka miękka', group: 'expansive' },
  { latin: 'Hypericum maculatum', polish: 'dziurawiec czteroboczny', group: 'expansive' },
  { latin: 'Lysimachia vulgaris', polish: 'tojeść pospolita', group: 'expansive' },
  { latin: 'Phalaris arundinacea', polish: 'mozga trzcinowata', group: 'expansive' },
  { latin: 'Carex brizoides', polish: 'turzyca drżączkowata', group: 'expansive' },
  { latin: 'Equisetum arvense', polish: 'skrzyp polny', group: 'expansive' },
  // --- krzewy i drzewa ---
  { latin: 'Crataegus monogyna', polish: 'głóg jednoszyjkowy', group: 'woody', layer: 'B' },
  { latin: 'Prunus spinosa', polish: 'śliwa tarnina', group: 'woody', layer: 'B' },
  { latin: 'Rosa canina', polish: 'róża dzika', group: 'woody', layer: 'B' },
  { latin: 'Cornus sanguinea', polish: 'dereń świdwa', group: 'woody', layer: 'B' },
  { latin: 'Euonymus europaeus', polish: 'trzmielina pospolita', group: 'woody', layer: 'B', synonyms: ['Euonymus europaea'] },
  { latin: 'Rhamnus cathartica', polish: 'szakłak pospolity', group: 'woody', layer: 'B' },
  { latin: 'Frangula alnus', polish: 'kruszyna pospolita', group: 'woody', layer: 'B' },
  { latin: 'Salix cinerea', polish: 'wierzba szara', group: 'woody', layer: 'B' },
  { latin: 'Salix caprea', polish: 'wierzba iwa', group: 'woody', layer: 'B' },
  { latin: 'Salix aurita', polish: 'wierzba uszata', group: 'woody', layer: 'B' },
  { latin: 'Betula pendula', polish: 'brzoza brodawkowata', group: 'woody', layer: 'B' },
  { latin: 'Populus tremula', polish: 'topola osika', group: 'woody', layer: 'B' },
  { latin: 'Pinus sylvestris', polish: 'sosna zwyczajna', group: 'woody', layer: 'B' },
  { latin: 'Juniperus communis', polish: 'jałowiec pospolity', group: 'woody', layer: 'B' },
  { latin: 'Alnus glutinosa', polish: 'olsza czarna', group: 'woody', layer: 'B' },
  { latin: 'Quercus robur', polish: 'dąb szypułkowy', group: 'woody', layer: 'B' },
  { latin: 'Fraxinus excelsior', polish: 'jesion wyniosły', group: 'woody', layer: 'B' },
  { latin: 'Malus domestica', polish: 'jabłoń domowa', group: 'woody', layer: 'B' },
  { latin: 'Pyrus communis', polish: 'grusza pospolita', group: 'woody', layer: 'B' },
  { latin: 'Prunus cerasifera', polish: 'śliwa wiśniowa (ałycza)', group: 'woody', layer: 'B' },
  { latin: 'Sambucus nigra', polish: 'bez czarny', group: 'woody', layer: 'B' },
  { latin: 'Rubus caesius', polish: 'jeżyna popielica', group: 'woody', layer: 'B' },
]

export const SPECIES_6510: SpeciesEntry[] = [
  // --- charakterystyczne (tab. 1 przewodnika) ---
  { latin: 'Arrhenatherum elatius', polish: 'rajgras wyniosły', group: 'char' },
  { latin: 'Geranium pratense', polish: 'bodziszek łąkowy', group: 'char' },
  { latin: 'Rumex thyrsiflorus', polish: 'szczaw rozpierzchły', group: 'char' },
  { latin: 'Campanula patula', polish: 'dzwonek rozpierzchły', group: 'char' },
  { latin: 'Crepis biennis', polish: 'pępawa dwuletnia', group: 'char' },
  { latin: 'Galium mollugo', polish: 'przytulia pospolita', group: 'char' },
  { latin: 'Knautia arvensis', polish: 'świerzbnica polna', group: 'char' },
  { latin: 'Pastinaca sativa', polish: 'pasternak zwyczajny', group: 'char' },
  { latin: 'Tragopogon orientalis', polish: 'kozibród wschodni', group: 'char' },
  { latin: 'Tragopogon pratensis', polish: 'kozibród łąkowy', group: 'char' },
  // --- lokalnie charakterystyczne ---
  { latin: 'Galium album', polish: 'przytulia biała', group: 'char-local' },
  { latin: 'Festuca rubra', polish: 'kostrzewa czerwona', group: 'poa-festuca' },
  { latin: 'Poa pratensis', polish: 'wiechlina łąkowa', group: 'poa-festuca' },
  // --- stałe składniki łąk świeżych (Arrhenatheretalia, Molinio-Arrhenatheretea) ---
  { latin: 'Bromus hordeaceus', polish: 'stokłosa miękka', group: 'meadow', synonyms: ['Bromus mollis'] },
  { latin: 'Dactylis glomerata', polish: 'kupkówka pospolita', group: 'meadow' },
  { latin: 'Trisetum flavescens', polish: 'konietlica łąkowa', group: 'meadow' },
  { latin: 'Phleum pratense', polish: 'tymotka łąkowa', group: 'meadow' },
  { latin: 'Poa trivialis', polish: 'wiechlina zwyczajna', group: 'meadow' },
  { latin: 'Alopecurus pratensis', polish: 'wyczyniec łąkowy', group: 'meadow' },
  { latin: 'Festuca pratensis', polish: 'kostrzewa łąkowa', group: 'meadow' },
  { latin: 'Holcus lanatus', polish: 'kłosówka wełnista', group: 'meadow' },
  { latin: 'Anthoxanthum odoratum', polish: 'tomka wonna', group: 'meadow' },
  { latin: 'Avenula pubescens', polish: 'owsica omszona', group: 'meadow', synonyms: ['Helictotrichon pubescens'] },
  { latin: 'Briza media', polish: 'drżączka średnia', group: 'meadow' },
  { latin: 'Agrostis capillaris', polish: 'mietlica pospolita', group: 'meadow' },
  { latin: 'Agrostis gigantea', polish: 'mietlica olbrzymia', group: 'meadow' },
  { latin: 'Cynosurus cristatus', polish: 'grzebienica pospolita', group: 'meadow' },
  { latin: 'Lolium perenne', polish: 'życica trwała', group: 'meadow' },
  { latin: 'Cerastium holosteoides', polish: 'rogownica pospolita', group: 'meadow', synonyms: ['Cerastium fontanum'] },
  { latin: 'Carum carvi', polish: 'kminek zwyczajny', group: 'meadow' },
  { latin: 'Daucus carota', polish: 'marchew zwyczajna', group: 'meadow' },
  { latin: 'Heracleum sphondylium', polish: 'barszcz zwyczajny', group: 'meadow' },
  { latin: 'Heracleum sibiricum', polish: 'barszcz syberyjski', group: 'meadow' },
  { latin: 'Achillea millefolium', polish: 'krwawnik pospolity', group: 'meadow' },
  { latin: 'Leucanthemum vulgare', polish: 'jastrun właściwy', group: 'meadow' },
  { latin: 'Centaurea jacea', polish: 'chaber łąkowy', group: 'meadow' },
  { latin: 'Centaurea scabiosa', polish: 'chaber driakiewnik', group: 'meadow' },
  { latin: 'Leontodon hispidus', polish: 'brodawnik zwyczajny', group: 'meadow' },
  { latin: 'Taraxacum officinale', polish: 'mniszek pospolity', group: 'meadow' },
  { latin: 'Lotus corniculatus', polish: 'komonica zwyczajna', group: 'meadow' },
  { latin: 'Lathyrus pratensis', polish: 'groszek łąkowy', group: 'meadow' },
  { latin: 'Trifolium pratense', polish: 'koniczyna łąkowa', group: 'meadow' },
  { latin: 'Trifolium dubium', polish: 'koniczyna drobnogłówkowa', group: 'meadow' },
  { latin: 'Trifolium repens', polish: 'koniczyna biała', group: 'meadow' },
  { latin: 'Vicia cracca', polish: 'wyka ptasia', group: 'meadow' },
  { latin: 'Saxifraga granulata', polish: 'skalnica ziarenkowata', group: 'meadow' },
  { latin: 'Ranunculus acris', polish: 'jaskier ostry', group: 'meadow' },
  { latin: 'Rumex acetosa', polish: 'szczaw zwyczajny', group: 'meadow' },
  { latin: 'Plantago lanceolata', polish: 'babka lancetowata', group: 'meadow' },
  { latin: 'Prunella vulgaris', polish: 'głowienka pospolita', group: 'meadow' },
  { latin: 'Veronica chamaedrys', polish: 'przetacznik ożankowy', group: 'meadow' },
  { latin: 'Stellaria graminea', polish: 'gwiazdnica trawiasta', group: 'meadow' },
  { latin: 'Galium verum', polish: 'przytulia właściwa', group: 'meadow' },
  { latin: 'Alchemilla monticola', polish: 'przywrotnik pasterski', group: 'meadow' },
  { latin: 'Pimpinella major', polish: 'biedrzeniec wielki', group: 'meadow' },
  { latin: 'Pimpinella saxifraga', polish: 'biedrzeniec mniejszy', group: 'meadow' },
  { latin: 'Campanula glomerata', polish: 'dzwonek skupiony', group: 'meadow' },
  { latin: 'Primula veris', polish: 'pierwiosnek lekarski', group: 'meadow' },
  { latin: 'Medicago lupulina', polish: 'lucerna nerkowata', group: 'meadow' },
  { latin: 'Medicago falcata', polish: 'lucerna sierpowata', group: 'meadow' },
  { latin: 'Agrimonia eupatoria', polish: 'rzepik pospolity', group: 'meadow' },
  { latin: 'Thymus pulegioides', polish: 'macierzanka zwyczajna', group: 'meadow' },
  { latin: 'Linum catharticum', polish: 'len przeczyszczający', group: 'meadow' },
  { latin: 'Fragaria viridis', polish: 'poziomka twardawa', group: 'meadow' },
  { latin: 'Coronilla varia', polish: 'cieciorka pstra', group: 'meadow', synonyms: ['Securigera varia'] },
  { latin: 'Rhinanthus minor', polish: 'szelężnik mniejszy', group: 'meadow' },
  { latin: 'Sanguisorba officinalis', polish: 'krwiściąg lekarski', group: 'meadow' },
  ...MEADOW_THREAT_SPECIES,
]

export const normalizeName = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ').replace(/\s*[×x]\s+/, ' ×')

export function speciesIndex(list: SpeciesEntry[]) {
  const index = new Map<string, SpeciesEntry>()
  for (const e of list) for (const n of [e.latin, e.polish, ...(e.synonyms ?? [])]) if (n) index.set(normalizeName(n), e)
  return (name: string): SpeciesEntry | undefined => {
    const n = normalizeName(name)
    const hit = index.get(n)
    if (hit) return hit
    if (/^(salix|rosa|crataegus|rubus) /.test(n) && !/^rubus idaeus/.test(n)) return { latin: name.trim(), group: 'woody', layer: 'B' }
    if (/^calamagrostis /.test(n)) return { latin: name.trim(), group: 'expansive-strong' }
    if (/^(solidago|reynoutria|fallopia) /.test(n)) return { latin: name.trim(), group: 'invasive-high' }
    return undefined
  }
}

export const findSpecies6510 = speciesIndex(SPECIES_6510)

export const defaultLayer = (e: SpeciesEntry): Layer => e.layer ?? 'C'

/** Wariant lokalny z „części ogólnej” – decyduje, czy Galium album / Festuca rubra liczą się jako charakterystyczne. */
export type LocalVariant = '' | 'lubuska' | 'sudety'

/** Czy zbiorowisko to Poa pratensis-Festuca rubra (inne progi i dwa dodatkowe gatunki diagnostyczne). */
export const isPoaFestuca = (site: { community?: unknown } | undefined) => /poa\s+pratensis|festuca\s+rubra|poo-festuc/i.test(String(site?.community ?? ''))

/** Gatunki charakterystyczne na liście (bez powtórzeń). */
export function characteristic6510(rows: SpeciesRow[], o: { poaFestuca: boolean; variant: LocalVariant }) {
  const seen = new Set<string>()
  const counted: string[] = []
  const skipped: string[] = []
  for (const r of rows) {
    const name = r.name?.trim()
    if (!name) continue
    const e = findSpecies6510(name)
    if (!e || seen.has(e.latin)) continue
    const local =
      (e.latin === 'Galium album' && o.variant === 'lubuska') || (e.latin === 'Festuca rubra' && (o.variant === 'sudety' || o.poaFestuca))
    const poaFestuca = e.group === 'poa-festuca' && o.poaFestuca
    if (e.group === 'char' || local || poaFestuca) {
      seen.add(e.latin)
      counted.push(name)
    } else if (e.group === 'char-local' || e.group === 'poa-festuca') {
      seen.add(e.latin)
      skipped.push(name)
    }
  }
  return { counted, skipped }
}
