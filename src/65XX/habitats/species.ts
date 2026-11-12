// Słownik gatunków dla 65XX (eutroficzne łąki wilgotne, zw. Calthion), zebrany z przewodnika GIOŚ
// (rozdz. „Typowe gatunki roślin”, tab. 1–2) i ze sprawozdań z monitoringu 2013–2014, 2016–2018 i 2024–2025.
// Służy do wyszukiwarki gatunków i do liczenia podpowiedzi ocen.
import type { Layer, SpeciesRow } from '../../7120/habitats/types'

export type SpeciesGroup65XX =
  | 'char' // gatunek charakterystyczny dla zw. Calthion lub diagnostyczny dla zespołów siedliska
  | 'char-montane' // diagnostyczny tylko dla górskiego Polygono bistortae-Cirsietum heterophylli (Sudety)
  | 'meadow' // gatunek łąkowy z klasy Molinio-Arrhenatheretea (typowy dominant)
  | 'fen' // gatunek młak eutroficznych (Scheuchzerio-Caricetea fuscae)
  | 'expansive-strong' // gatunek silnie ekspansywny (wymieniony w tab. 1 przewodnika)
  | 'expansive' // inny rodzimy gatunek ekspansywny
  | 'invasive-high' // obcy gatunek wysoce inwazyjny
  | 'invasive-low' // obcy gatunek o niskim stopniu inwazyjności
  | 'woody' // krzew lub drzewo (wskaźnik „Ekspansja krzewów i podrostu drzew”)
  | 'other'

export interface SpeciesEntry65XX {
  latin: string
  polish?: string
  group: SpeciesGroup65XX
  layer?: Layer
  /** Synonimy nazwy naukowej (np. Polygonum bistorta = Bistorta officinalis). */
  synonyms?: string[]
}

export const GROUP_LABELS_65XX: Record<SpeciesGroup65XX, string> = {
  char: 'gatunek charakterystyczny',
  'char-montane': 'gatunek charakterystyczny (tylko łąka z ostrożeniem różnolistnym)',
  meadow: 'gatunek łąkowy (Molinio-Arrhenatheretea)',
  fen: 'gatunek młak eutroficznych',
  'expansive-strong': 'gatunek silnie ekspansywny',
  expansive: 'rodzimy gatunek ekspansywny',
  'invasive-high': 'obcy gatunek wysoce inwazyjny',
  'invasive-low': 'obcy gatunek o niskim stopniu inwazyjności',
  woody: 'krzew lub drzewo',
  other: 'inny',
}

export const SPECIES_65XX: SpeciesEntry65XX[] = [
  // --- charakterystyczne dla zw. Calthion i diagnostyczne dla zespołów (rozdz. 4 przewodnika) ---
  { latin: 'Cirsium rivulare', polish: 'ostrożeń łąkowy', group: 'char' },
  { latin: 'Cirsium oleraceum', polish: 'ostrożeń warzywny', group: 'char' },
  { latin: 'Polygonum bistorta', polish: 'rdest wężownik', group: 'char', synonyms: ['Bistorta officinalis', 'Bistorta major', 'Persicaria bistorta'] },
  { latin: 'Crepis paludosa', polish: 'pępawa błotna', group: 'char' },
  { latin: 'Trollius europaeus', polish: 'pełnik europejski', group: 'char' },
  { latin: 'Bromus racemosus', polish: 'stokłosa groniasta', group: 'char' },
  { latin: 'Caltha palustris', polish: 'knieć błotna', group: 'char' },
  { latin: 'Lotus uliginosus', polish: 'komonica błotna', group: 'char', synonyms: ['Lotus pedunculatus'] },
  { latin: 'Lathyrus palustris', polish: 'groszek błotny', group: 'char' },
  { latin: 'Myosotis palustris', polish: 'niezapominajka błotna', group: 'char', synonyms: ['Myosotis scorpioides'] },
  { latin: 'Trifolium hybridum', polish: 'koniczyna białoróżowa', group: 'char' },
  { latin: 'Geum rivale', polish: 'kuklik zwisły', group: 'char' },
  { latin: 'Cirsium canum', polish: 'ostrożeń siwy', group: 'char' },
  { latin: 'Juncus acutiflorus', polish: 'sit ostrokwiatowy', group: 'char' },
  { latin: 'Juncus conglomeratus', polish: 'sit skupiony', group: 'char' },
  { latin: 'Juncus effusus', polish: 'sit rozpierzchły', group: 'char' },
  { latin: 'Juncus subnodulosus', polish: 'sit tępokwiatowy', group: 'char' },
  { latin: 'Cirsium heterophyllum', polish: 'ostrożeń różnolistny', group: 'char' },
  { latin: 'Crepis mollis', polish: 'pępawa miękka', group: 'char' },
  { latin: 'Galium uliginosum', polish: 'przytulia błotna', group: 'char' },
  // --- diagnostyczne tylko dla górskiego Polygono bistortae-Cirsietum heterophylli (Chytrý 2007) ---
  { latin: 'Hypericum maculatum', polish: 'dziurawiec czteroboczny', group: 'char-montane' },
  { latin: 'Ranunculus auricomus', polish: 'jaskier różnolistny', group: 'char-montane' },
  { latin: 'Agrostis capillaris', polish: 'mietlica pospolita', group: 'char-montane' },
  // --- łąkowe Molinio-Arrhenatheretea (typowe dominanty i towarzysze) ---
  { latin: 'Briza media', polish: 'drżączka średnia', group: 'meadow' },
  { latin: 'Festuca rubra', polish: 'kostrzewa czerwona', group: 'meadow' },
  { latin: 'Poa trivialis', polish: 'wiechlina zwyczajna', group: 'meadow' },
  { latin: 'Alopecurus pratensis', polish: 'wyczyniec łąkowy', group: 'meadow' },
  { latin: 'Festuca pratensis', polish: 'kostrzewa łąkowa', group: 'meadow' },
  { latin: 'Dactylis glomerata', polish: 'kupkówka pospolita', group: 'meadow' },
  { latin: 'Agrostis stolonifera', polish: 'mietlica rozłogowa', group: 'meadow' },
  { latin: 'Agrostis canina', polish: 'mietlica psia', group: 'meadow' },
  { latin: 'Anthoxanthum odoratum', polish: 'tomka wonna', group: 'meadow' },
  { latin: 'Holcus lanatus', polish: 'kłosówka wełnista', group: 'meadow' },
  { latin: 'Phleum pratense', polish: 'tymotka łąkowa', group: 'meadow' },
  { latin: 'Trifolium pratense', polish: 'koniczyna łąkowa', group: 'meadow' },
  { latin: 'Trifolium repens', polish: 'koniczyna biała', group: 'meadow' },
  { latin: 'Trifolium medium', polish: 'koniczyna pogięta', group: 'meadow' },
  { latin: 'Ranunculus acris', polish: 'jaskier ostry', group: 'meadow' },
  { latin: 'Ranunculus repens', polish: 'jaskier rozłogowy', group: 'meadow' },
  { latin: 'Lychnis flos-cuculi', polish: 'firletka poszarpana', group: 'meadow' },
  { latin: 'Plantago lanceolata', polish: 'babka lancetowata', group: 'meadow' },
  { latin: 'Achillea millefolium', polish: 'krwawnik pospolity', group: 'meadow' },
  { latin: 'Leucanthemum vulgare', polish: 'złocień właściwy', group: 'meadow' },
  { latin: 'Centaurea jacea', polish: 'chaber łąkowy', group: 'meadow' },
  { latin: 'Rumex acetosa', polish: 'szczaw zwyczajny', group: 'meadow' },
  { latin: 'Lathyrus pratensis', polish: 'groszek łąkowy', group: 'meadow' },
  { latin: 'Vicia cracca', polish: 'wyka ptasia', group: 'meadow' },
  { latin: 'Lotus corniculatus', polish: 'komonica zwyczajna', group: 'meadow' },
  { latin: 'Cynosurus cristatus', polish: 'grzebienica pospolita', group: 'meadow' },
  { latin: 'Succisa pratensis', polish: 'czarcikęs łąkowy', group: 'meadow' },
  { latin: 'Sanguisorba officinalis', polish: 'krwiściąg lekarski', group: 'meadow' },
  { latin: 'Angelica sylvestris', polish: 'dzięgiel leśny', group: 'meadow' },
  { latin: 'Cirsium palustre', polish: 'ostrożeń błotny', group: 'meadow' },
  { latin: 'Equisetum palustre', polish: 'skrzyp błotny', group: 'meadow' },
  { latin: 'Lysimachia nummularia', polish: 'tojeść rozesłana', group: 'meadow' },
  { latin: 'Prunella vulgaris', polish: 'głowienka pospolita', group: 'meadow' },
  { latin: 'Rhinanthus serotinus', polish: 'szelężnik większy', group: 'meadow' },
  { latin: 'Stellaria graminea', polish: 'gwiazdnica trawiasta', group: 'meadow' },
  { latin: 'Veronica chamaedrys', polish: 'przetacznik ożankowy', group: 'meadow' },
  { latin: 'Cruciata glabra', polish: 'krzyżownica naga', group: 'meadow' },
  { latin: 'Galium mollugo', polish: 'przytulia pospolita', group: 'meadow' },
  { latin: 'Luzula multiflora', polish: 'kosmatka wielokwiatowa', group: 'meadow' },
  { latin: 'Alchemilla monticola', polish: 'przywrotnik pasterski', group: 'meadow' },
  { latin: 'Alchemilla acutiloba', polish: 'przywrotnik ostroklapowy', group: 'meadow' },
  { latin: 'Alchemilla gracilis', polish: 'przywrotnik smukły', group: 'meadow' },
  { latin: 'Alchemilla glabra', polish: 'przywrotnik prawie nagi', group: 'meadow' },
  { latin: 'Polygala vulgaris', polish: 'krzyżownica zwyczajna', group: 'meadow' },
  { latin: 'Linum catharticum', polish: 'len przeczyszczający', group: 'meadow' },
  { latin: 'Potentilla erecta', polish: 'pięciornik kurze ziele', group: 'meadow' },
  { latin: 'Nardus stricta', polish: 'bliźniczka psia trawka', group: 'meadow' },
  { latin: 'Danthonia decumbens', polish: 'izgrzyca przyziemna', group: 'meadow' },
  { latin: 'Mentha arvensis', polish: 'mięta polna', group: 'meadow' },
  { latin: 'Campanula patula', polish: 'dzwonek rozpierzchły', group: 'meadow' },
  { latin: 'Crepis biennis', polish: 'pępawa dwuletnia', group: 'meadow' },
  { latin: 'Primula elatior', polish: 'pierwiosnek wyniosły', group: 'meadow' },
  { latin: 'Ranunculus flammula', polish: 'jaskier płomiennik', group: 'meadow' },
  { latin: 'Valeriana simplicifolia', polish: 'kozłek całolistny', group: 'meadow' },
  { latin: 'Scirpus sylvaticus', polish: 'sitowie leśne', group: 'meadow' },
  { latin: 'Molinia caerulea', polish: 'trzęślica modra', group: 'meadow' },
  // --- młaki eutroficzne (Scheuchzerio-Caricetea fuscae) ---
  { latin: 'Carex flava', polish: 'turzyca żółta', group: 'fen' },
  { latin: 'Carex nigra', polish: 'turzyca pospolita', group: 'fen' },
  { latin: 'Carex panicea', polish: 'turzyca prosowata', group: 'fen' },
  { latin: 'Carex echinata', polish: 'turzyca gwiazdkowata', group: 'fen' },
  { latin: 'Carex pallescens', polish: 'turzyca blada', group: 'fen' },
  { latin: 'Carex ovalis', polish: 'turzyca zajęcza', group: 'fen' },
  { latin: 'Carex pilulifera', polish: 'turzyca pigułkowata', group: 'fen' },
  { latin: 'Juncus articulatus', polish: 'sit członowaty', group: 'fen' },
  { latin: 'Valeriana dioica', polish: 'kozłek dwupienny', group: 'fen' },
  { latin: 'Dactylorhiza majalis', polish: 'kukułka szerokolistna', group: 'fen' },
  { latin: 'Epipactis palustris', polish: 'kruszczyk błotny', group: 'fen' },
  { latin: 'Gymnadenia conopsea', polish: 'gółka długoostrogowa', group: 'fen' },
  { latin: 'Listera ovata', polish: 'listera jajowata', group: 'other' },
  { latin: 'Parnassia palustris', polish: 'dziewięciornik błotny', group: 'fen' },
  // --- silnie ekspansywne (tab. 1 przewodnika) ---
  { latin: 'Filipendula ulmaria', polish: 'wiązówka błotna', group: 'expansive-strong' },
  { latin: 'Lysimachia vulgaris', polish: 'tojeść pospolita', group: 'expansive-strong' },
  { latin: 'Mentha longifolia', polish: 'mięta długolistna', group: 'expansive-strong' },
  { latin: 'Chaerophyllum hirsutum', polish: 'świerząbek orzęsiony', group: 'expansive-strong' },
  { latin: 'Chaerophyllum aromaticum', polish: 'świerząbek korzenny', group: 'expansive-strong' },
  { latin: 'Chaerophyllum sp.', polish: 'świerząbek', group: 'expansive-strong' },
  { latin: 'Valeriana officinalis', polish: 'kozłek lekarski', group: 'expansive-strong' },
  { latin: 'Deschampsia caespitosa', polish: 'śmiałek darniowy', group: 'expansive-strong' },
  { latin: 'Calamagrostis epigejos', polish: 'trzcinnik piaskowy', group: 'expansive-strong' },
  { latin: 'Calamagrostis canescens', polish: 'trzcinnik lancetowaty', group: 'expansive-strong' },
  { latin: 'Calamagrostis arundinacea', polish: 'trzcinnik leśny', group: 'expansive-strong' },
  { latin: 'Calamagrostis sp.', polish: 'trzcinnik', group: 'expansive-strong' },
  { latin: 'Phalaris arundinacea', polish: 'mozga trzcinowata', group: 'expansive-strong' },
  { latin: 'Phragmites australis', polish: 'trzcina pospolita', group: 'expansive-strong' },
  { latin: 'Carex brizoides', polish: 'turzyca drżączkowata', group: 'expansive-strong' },
  { latin: 'Urtica dioica', polish: 'pokrzywa zwyczajna', group: 'expansive-strong' },
  // --- inne ekspansywne (sprawozdania z monitoringu) ---
  { latin: 'Holcus mollis', polish: 'kłosówka miękka', group: 'expansive' },
  { latin: 'Lythrum salicaria', polish: 'krwawnica pospolita', group: 'expansive' },
  { latin: 'Aegopodium podagraria', polish: 'podagrycznik pospolity', group: 'expansive' },
  { latin: 'Anthriscus sylvestris', polish: 'trybula leśna', group: 'expansive' },
  { latin: 'Cirsium arvense', polish: 'ostrożeń polny', group: 'expansive' },
  { latin: 'Carex acutiformis', polish: 'turzyca błotna', group: 'expansive' },
  { latin: 'Carex acuta', polish: 'turzyca zaostrzona', group: 'expansive', synonyms: ['Carex gracilis'] },
  { latin: 'Glyceria maxima', polish: 'manna mielec', group: 'expansive' },
  { latin: 'Elymus repens', polish: 'perz właściwy', group: 'expansive' },
  { latin: 'Rubus sp.', polish: 'jeżyna', group: 'woody', layer: 'B' },
  // --- obce wysoce inwazyjne ---
  { latin: 'Solidago gigantea', polish: 'nawłoć późna', group: 'invasive-high' },
  { latin: 'Solidago canadensis', polish: 'nawłoć kanadyjska', group: 'invasive-high' },
  { latin: 'Heracleum sosnowskyi', polish: 'barszcz Sosnowskiego', group: 'invasive-high' },
  { latin: 'Heracleum mantegazzianum', polish: 'barszcz kaukaski', group: 'invasive-high' },
  { latin: 'Impatiens glandulifera', polish: 'niecierpek gruczołowaty', group: 'invasive-high' },
  { latin: 'Reynoutria japonica', polish: 'rdestowiec ostrokończysty', group: 'invasive-high', synonyms: ['Fallopia japonica'] },
  { latin: 'Reynoutria sachalinensis', polish: 'rdestowiec sachaliński', group: 'invasive-high' },
  { latin: 'Lupinus polyphyllus', polish: 'łubin trwały', group: 'invasive-high' },
  { latin: 'Echinocystis lobata', polish: 'kolczurka klapowana', group: 'invasive-high' },
  { latin: 'Rudbeckia laciniata', polish: 'rudbekia naga', group: 'invasive-high' },
  { latin: 'Bidens frondosa', polish: 'uczep amerykański', group: 'invasive-high' },
  { latin: 'Erigeron annuus', polish: 'przymiotno białe', group: 'invasive-high' },
  { latin: 'Acer negundo', polish: 'klon jesionolistny', group: 'invasive-high', layer: 'B' },
  { latin: 'Padus serotina', polish: 'czeremcha amerykańska', group: 'invasive-high', layer: 'B', synonyms: ['Prunus serotina'] },
  // --- obce o niskim stopniu inwazyjności ---
  { latin: 'Epilobium ciliatum', polish: 'wierzbownica gruczołowata', group: 'invasive-low' },
  { latin: 'Impatiens parviflora', polish: 'niecierpek drobnokwiatowy', group: 'invasive-low' },
  { latin: 'Conyza canadensis', polish: 'przymiotno kanadyjskie', group: 'invasive-low', synonyms: ['Erigeron canadensis'] },
  { latin: 'Parthenocissus inserta', polish: 'winobluszcz zaroślowy', group: 'invasive-low' },
  { latin: 'Spiraea ×pseudosalicifolia', polish: 'tawuła nibywierzbolistna', group: 'invasive-low', layer: 'B' },
  // --- krzewy i drzewa ---
  { latin: 'Salix cinerea', polish: 'wierzba szara', group: 'woody', layer: 'B' },
  { latin: 'Salix aurita', polish: 'wierzba uszata', group: 'woody', layer: 'B' },
  { latin: 'Salix caprea', polish: 'wierzba iwa', group: 'woody', layer: 'B' },
  { latin: 'Salix pentandra', polish: 'wierzba pięciopręcikowa', group: 'woody', layer: 'B' },
  { latin: 'Salix silesiaca', polish: 'wierzba śląska', group: 'woody', layer: 'B' },
  { latin: 'Salix sp.', polish: 'wierzba', group: 'woody', layer: 'B' },
  { latin: 'Prunus spinosa', polish: 'śliwa tarnina', group: 'woody', layer: 'B' },
  { latin: 'Viburnum opulus', polish: 'kalina koralowa', group: 'woody', layer: 'B' },
  { latin: 'Rosa canina', polish: 'róża dzika', group: 'woody', layer: 'B' },
  { latin: 'Frangula alnus', polish: 'kruszyna pospolita', group: 'woody', layer: 'B' },
  { latin: 'Alnus glutinosa', polish: 'olsza czarna', group: 'woody', layer: 'B' },
  { latin: 'Alnus incana', polish: 'olsza szara', group: 'woody', layer: 'B' },
  { latin: 'Betula pendula', polish: 'brzoza brodawkowata', group: 'woody', layer: 'B' },
  { latin: 'Picea abies', polish: 'świerk pospolity', group: 'woody', layer: 'B' },
  { latin: 'Acer pseudoplatanus', polish: 'klon jawor', group: 'woody', layer: 'B' },
  { latin: 'Prunus avium', polish: 'czereśnia (wiśnia ptasia)', group: 'woody', layer: 'B' },
  { latin: 'Populus tremula', polish: 'topola osika', group: 'woody', layer: 'B' },
  { latin: 'Pinus sylvestris', polish: 'sosna zwyczajna', group: 'woody', layer: 'B' },
  { latin: 'Fraxinus excelsior', polish: 'jesion wyniosły', group: 'woody', layer: 'B' },
]

const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ').replace(/\s*×\s*/, ' ×')

const INDEX = new Map<string, SpeciesEntry65XX>()
for (const e of SPECIES_65XX) {
  for (const n of [e.latin, e.polish, ...(e.synonyms ?? [])]) if (n) INDEX.set(normalize(n), e)
}

/** Szuka po nazwie łacińskiej (także synonimie) albo polskiej. „Salix …”, „Rubus …” to krzewy. */
export function findSpecies65XX(name: string): SpeciesEntry65XX | undefined {
  const n = normalize(name)
  const hit = INDEX.get(n)
  if (hit) return hit
  if (/^(salix|rubus|rosa|crataegus) /.test(n)) return { latin: name.trim(), group: 'woody', layer: 'B' }
  if (/^calamagrostis /.test(n)) return { latin: name.trim(), group: 'expansive-strong' }
  return undefined
}

export function defaultLayer65XX(e: SpeciesEntry65XX): Layer {
  return e.layer ?? 'C'
}

/** Czy stanowisko to górska łąka z ostrożeniem różnolistnym (wtedy liczą się też gatunki „char-montane”). */
export const isHeterophyllum = (site: { communities?: unknown } | undefined) =>
  /heterophyll/i.test(String(site?.communities ?? ''))

/** Gatunki charakterystyczne na liście (bez powtórzeń, synonimy liczą się raz). */
export function characteristicOf(rows: SpeciesRow[], montane: boolean) {
  const seen = new Set<string>()
  const counted: string[] = []
  const skipped: string[] = []
  for (const r of rows) {
    const name = r.name?.trim()
    if (!name) continue
    const e = findSpecies65XX(name)
    if (!e || (e.group !== 'char' && e.group !== 'char-montane')) continue
    if (seen.has(e.latin)) continue
    seen.add(e.latin)
    if (e.group === 'char' || montane) counted.push(name)
    else skipped.push(name)
  }
  return { counted, skipped }
}
