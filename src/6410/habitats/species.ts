// Słownik gatunków dla 6410 (zmiennowilgotne łąki trzęślicowe, Molinion), zebrany z przewodnika GIOŚ
// (Michalska-Hejduk, Kopeć 2012, rozdz. „Typowe gatunki roślin”, tab. 1–2, przykład karty Wędziszew) i sprawozdań
// z monitoringu 2009–2011, 2015–2018 i 2023–2025. Obce, ekspansywne i drzewiaste – wspólne z 6510.
import type { Layer, SpeciesRow } from '../../7120/habitats/types'
import { MEADOW_THREAT_SPECIES, speciesIndex, type SpeciesEntry } from '../../6510/habitats/species'

export type SpeciesGroup6410 =
  | 'char' // charakterystyczny dla zw. Molinion (+ 2 gatunki rzędu Molinietalia przywiązane do łąk trzęślicowych)
  | 'dist' // wyróżniający zw. Molinion
  | 'dist-junco' // wyróżniający łąkę sitowo-trzęślicową Junco-Molinietum (podtyp 6410-2)
  | 'meadow'

export const GROUP_LABELS_6410: Record<string, string> = {
  char: 'gatunek charakterystyczny (zw. Molinion)',
  dist: 'gatunek wyróżniający zw. Molinion',
  'dist-junco': 'gatunek wyróżniający Junco-Molinietum (tylko podtyp 6410-2)',
  meadow: 'gatunek łąkowy (Molinio-Arrhenatheretea)',
  'expansive-strong': 'gatunek ekspansywny (wymieniony w przewodniku)',
  expansive: 'rodzimy gatunek ekspansywny',
  'invasive-high': 'obcy gatunek wysoce inwazyjny',
  'invasive-low': 'obcy gatunek o niskim stopniu inwazyjności',
  woody: 'krzew lub drzewo',
  other: 'inny',
}

type Entry6410 = Omit<SpeciesEntry, 'group'> & { group: SpeciesGroup6410 | SpeciesEntry['group'] }

const OWN: Entry6410[] = [
  // --- charakterystyczne dla zw. Molinion (Matuszkiewicz 2008) + Molinietalia ---
  { latin: 'Betonica officinalis', polish: 'bukwica zwyczajna', group: 'char', synonyms: ['Stachys officinalis'] },
  { latin: 'Succisa pratensis', polish: 'czarcikęs łąkowy', group: 'char' },
  { latin: 'Gentiana pneumonanthe', polish: 'goryczka wąskolistna', group: 'char' },
  { latin: 'Dianthus superbus', polish: 'goździk pyszny', group: 'char' },
  { latin: 'Tetragonolobus maritimus', polish: 'komonica skrzydlastostrąkowa', group: 'char', synonyms: ['Lotus maritimus'] },
  { latin: 'Silaum silaus', polish: 'koniopłoch łąkowy', group: 'char' },
  { latin: 'Iris sibirica', polish: 'kosaciec syberyjski', group: 'char' },
  { latin: 'Gladiolus imbricatus', polish: 'mieczyk dachówkowaty', group: 'char' },
  { latin: 'Ophioglossum vulgatum', polish: 'nasięźrzał pospolity', group: 'char' },
  { latin: 'Laserpitium prutenicum', polish: 'okrzyn łąkowy', group: 'char' },
  { latin: 'Selinum carvifolia', polish: 'olszewnik kminkolistny', group: 'char', synonyms: ['Selinum carvifolium'] },
  { latin: 'Inula salicina', polish: 'oman wierzbolistny', group: 'char' },
  { latin: 'Galium boreale', polish: 'przytulia północna', group: 'char' },
  { latin: 'Molinia caerulea', polish: 'trzęślica modra', group: 'char', synonyms: ['Molinia coerulea'] },
  { latin: 'Carex tomentosa', polish: 'turzyca filcowata', group: 'char' },
  { latin: 'Serratula tinctoria', polish: 'sierpik barwierski', group: 'char' },
  { latin: 'Sanguisorba officinalis', polish: 'krwiściąg lekarski', group: 'char' },
  // --- wyróżniające zw. Molinion ---
  { latin: 'Pimpinella saxifraga', polish: 'biedrzeniec mniejszy', group: 'dist' },
  { latin: 'Briza media', polish: 'drżączka średnia', group: 'dist' },
  { latin: 'Parnassia palustris', polish: 'dziewięciornik błotny', group: 'dist' },
  { latin: 'Gentianella amarella', polish: 'goryczuszka gorzkawa', group: 'dist' },
  { latin: 'Gentianella uliginosa', polish: 'goryczuszka błotna', group: 'dist' },
  { latin: 'Linum catharticum', polish: 'len przeczyszczający', group: 'dist' },
  { latin: 'Potentilla erecta', polish: 'pięciornik kurze ziele', group: 'dist' },
  { latin: 'Carex flava', polish: 'turzyca żółta', group: 'dist' },
  { latin: 'Salix rosmarinifolia', polish: 'wierzba rokita', group: 'dist', layer: 'B', synonyms: ['Salix repens subsp. rosmarinifolia'] },
  // --- wyróżniające Junco-Molinietum (podtyp 6410-2) ---
  { latin: 'Juncus acutiflorus', polish: 'sit ostrokwiatowy', group: 'dist-junco' },
  { latin: 'Juncus conglomeratus', polish: 'sit skupiony', group: 'dist-junco' },
  { latin: 'Juncus effusus', polish: 'sit rozpierzchły', group: 'dist-junco', synonyms: ['Juncus effussus'] },
  // --- łąkowe Molinio-Arrhenatheretea (z przykładu Wędziszew) ---
  { latin: 'Achillea millefolium', polish: 'krwawnik pospolity', group: 'meadow' },
  { latin: 'Agrostis gigantea', polish: 'mietlica olbrzymia', group: 'meadow' },
  { latin: 'Alopecurus pratensis', polish: 'wyczyniec łąkowy', group: 'meadow' },
  { latin: 'Anthoxanthum odoratum', polish: 'tomka wonna', group: 'meadow' },
  { latin: 'Arrhenatherum elatius', polish: 'rajgras wyniosły', group: 'meadow' },
  { latin: 'Campanula patula', polish: 'dzwonek rozpierzchły', group: 'meadow' },
  { latin: 'Cardamine pratensis', polish: 'rzeżucha łąkowa', group: 'meadow' },
  { latin: 'Carex leporina', polish: 'turzyca zajęcza', group: 'meadow', synonyms: ['Carex ovalis'] },
  { latin: 'Carex pallescens', polish: 'turzyca blada', group: 'meadow' },
  { latin: 'Carex panicea', polish: 'turzyca prosowata', group: 'meadow' },
  { latin: 'Carex hirta', polish: 'turzyca owłosiona', group: 'meadow' },
  { latin: 'Centaurea jacea', polish: 'chaber łąkowy', group: 'meadow' },
  { latin: 'Dactylis glomerata', polish: 'kupkówka pospolita', group: 'meadow' },
  { latin: 'Festuca rubra', polish: 'kostrzewa czerwona', group: 'meadow' },
  { latin: 'Festuca pratensis', polish: 'kostrzewa łąkowa', group: 'meadow' },
  { latin: 'Galium uliginosum', polish: 'przytulia bagienna', group: 'meadow' },
  { latin: 'Galium verum', polish: 'przytulia właściwa', group: 'meadow' },
  { latin: 'Galium palustre', polish: 'przytulia błotna', group: 'meadow' },
  { latin: 'Genista tinctoria', polish: 'janowiec barwierski', group: 'meadow' },
  { latin: 'Holcus lanatus', polish: 'kłosówka wełnista', group: 'meadow' },
  { latin: 'Lathyrus pratensis', polish: 'groszek łąkowy', group: 'meadow' },
  { latin: 'Lotus corniculatus', polish: 'komonica zwyczajna', group: 'meadow' },
  { latin: 'Lotus uliginosus', polish: 'komonica błotna', group: 'meadow', synonyms: ['Lotus pedunculatus'] },
  { latin: 'Luzula multiflora', polish: 'kosmatka wielokwiatowa', group: 'meadow' },
  { latin: 'Lychnis flos-cuculi', polish: 'firletka poszarpana', group: 'meadow' },
  { latin: 'Poa pratensis', polish: 'wiechlina łąkowa', group: 'meadow' },
  { latin: 'Ranunculus acris', polish: 'jaskier ostry', group: 'meadow' },
  { latin: 'Ranunculus auricomus', polish: 'jaskier różnolistny', group: 'meadow' },
  { latin: 'Ranunculus repens', polish: 'jaskier rozłogowy', group: 'meadow' },
  { latin: 'Rumex acetosa', polish: 'szczaw zwyczajny', group: 'meadow' },
  { latin: 'Stellaria graminea', polish: 'gwiazdnica trawiasta', group: 'meadow' },
  { latin: 'Stellaria palustris', polish: 'gwiazdnica błotna', group: 'meadow' },
  { latin: 'Veronica chamaedrys', polish: 'przetacznik ożankowy', group: 'meadow' },
  { latin: 'Veronica longifolia', polish: 'przetacznik długolistny', group: 'meadow', synonyms: ['Pseudolysimachion longifolium'] },
  { latin: 'Vicia cracca', polish: 'wyka ptasia', group: 'meadow' },
  { latin: 'Viola canina', polish: 'fiołek psi', group: 'meadow' },
  { latin: 'Avenula pubescens', polish: 'owsica omszona', group: 'meadow' },
  { latin: 'Hypericum perforatum', polish: 'dziurawiec zwyczajny', group: 'meadow' },
  { latin: 'Peucedanum palustre', polish: 'gorysz błotny', group: 'meadow' },
  { latin: 'Linaria vulgaris', polish: 'lnica pospolita', group: 'meadow' },
  { latin: 'Scrophularia nodosa', polish: 'trędownik bulwiasty', group: 'meadow' },
  { latin: 'Galeopsis tetrahit', polish: 'poziewnik szorstki', group: 'meadow' },
  { latin: 'Polygonum persicaria', polish: 'rdest plamisty', group: 'meadow', synonyms: ['Persicaria maculosa'] },
]

export const SPECIES_6410 = [...OWN, ...MEADOW_THREAT_SPECIES] as SpeciesEntry[]

export const findSpecies6410 = speciesIndex(SPECIES_6410)

export const defaultLayer6410 = (e: { layer?: Layer }): Layer => e.layer ?? 'C'

/** Czy stanowisko to łąka sitowo-trzęślicowa (6410-2) – wtedy sity liczą się jako wyróżniające. */
export const isJuncoMolinietum = (site: { community?: unknown } | undefined) => /junco|6410-2|sitowo/i.test(String(site?.community ?? ''))

/** Gatunki typowe na liście: charakterystyczne i wyróżniające, bez powtórzeń. */
export function typical6410(rows: SpeciesRow[], junco: boolean) {
  const seen = new Set<string>()
  const char: string[] = []
  const dist: string[] = []
  const skipped: string[] = []
  for (const r of rows) {
    const name = r.name?.trim()
    if (!name) continue
    const e = findSpecies6410(name)
    if (!e || seen.has(e.latin)) continue
    const g = e.group as string
    if (g === 'char') char.push(name)
    else if (g === 'dist' || (g === 'dist-junco' && junco)) dist.push(name)
    else if (g === 'dist-junco') skipped.push(name)
    else continue
    seen.add(e.latin)
  }
  return { char, dist, skipped }
}
