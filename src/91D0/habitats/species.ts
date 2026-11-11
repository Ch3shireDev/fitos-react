// Słownik gatunków dla 91D0, zebrany z przewodnika GIOŚ (rozdz. „Typowe gatunki roślin”, tab. 1–2)
// i z kart z Reptowa. Służy do wyszukiwarki gatunków i do liczenia podpowiedzi ocen.
import type { Layer, SpeciesRow } from '../../7120/habitats/types'
import { num } from '../../7120/habitats/assessment'

export type SpeciesGroup91D0 =
  | 'char' // gatunek charakterystyczny (przynajmniej dla jednego wariantu siedliska)
  | 'dwarf-shrub' // charakterystyczna krzewinka bagienna (bagno, borówka bagienna)
  | 'sphagnum' // torfowiec
  | 'tree' // rodzime drzewo budujące drzewostan 91D0
  | 'tree-geo-alien' // drzewo obce geograficznie (zawsze, niezależnie od regionu)
  | 'tree-eco-alien' // drzewo obce ekologicznie (gatunek grądów, buczyn, dąbrów)
  | 'invasive' // inwazyjny gatunek obcy runa
  | 'expansive' // rodzimy ekspansywny apofit runa
  | 'dry-moss' // mech borów świeżych – w dominacji sygnał przesuszenia
  | 'key' // gatunek kluczowy dla różnorodności (wskaźnik fakultatywny)
  | 'other'

export interface SpeciesEntry91D0 {
  latin: string
  polish?: string
  group: SpeciesGroup91D0
  layer?: Layer
}

export const GROUP_LABELS_91D0: Record<SpeciesGroup91D0, string> = {
  char: 'gatunek charakterystyczny',
  'dwarf-shrub': 'charakterystyczna krzewinka',
  sphagnum: 'torfowiec',
  tree: 'drzewo rodzime dla 91D0',
  'tree-geo-alien': 'drzewo obce geograficznie',
  'tree-eco-alien': 'drzewo obce ekologicznie',
  invasive: 'inwazyjny gatunek obcy',
  expansive: 'rodzimy gatunek ekspansywny',
  'dry-moss': 'mech borów świeżych (przesuszenie)',
  key: 'gatunek kluczowy dla różnorodności',
  other: 'inny',
}

export const SPECIES_91D0: SpeciesEntry91D0[] = [
  // --- krzewinki bagienne ---
  { latin: 'Ledum palustre', polish: 'bagno zwyczajne', group: 'dwarf-shrub' },
  { latin: 'Vaccinium uliginosum', polish: 'borówka bagienna', group: 'dwarf-shrub' },
  // --- charakterystyczne (różne warianty) ---
  { latin: 'Oxycoccus palustris', polish: 'żurawina błotna', group: 'char' },
  { latin: 'Andromeda polifolia', polish: 'modrzewnica zwyczajna', group: 'char' },
  { latin: 'Eriophorum vaginatum', polish: 'wełnianka pochwowata', group: 'char' },
  { latin: 'Lycopodium annotinum', polish: 'widłak jałowcowaty', group: 'char' },
  { latin: 'Stellaria longifolia', polish: 'gwiazdnica długolistna', group: 'char' },
  { latin: 'Listera cordata', polish: 'listera sercowata', group: 'char' },
  { latin: 'Thelypteris palustris', polish: 'zachylnik błotny', group: 'char' },
  { latin: 'Carex chordorrhiza', polish: 'turzyca strunowa', group: 'char' },
  { latin: 'Menyanthes trifoliata', polish: 'bobrek trójlistkowy', group: 'char' },
  { latin: 'Epipactis palustris', polish: 'kruszczyk błotny', group: 'char' },
  { latin: 'Parnassia palustris', polish: 'dziewięciornik błotny', group: 'char' },
  { latin: 'Drosera rotundifolia', polish: 'rosiczka okrągłolistna', group: 'other' },
  { latin: 'Carex rostrata', polish: 'turzyca dzióbkowata', group: 'other' },
  { latin: 'Eriophorum angustifolium', polish: 'wełnianka wąskolistna', group: 'other' },
  // --- torfowce ---
  { latin: 'Sphagnum magellanicum', polish: 'torfowiec magellański', group: 'sphagnum' },
  { latin: 'Sphagnum capillifolium', polish: 'torfowiec ostrolistny', group: 'sphagnum' },
  { latin: 'Sphagnum rubellum', polish: 'torfowiec czerwonawy', group: 'sphagnum' },
  { latin: 'Sphagnum fallax', polish: 'torfowiec kończysty', group: 'sphagnum' },
  { latin: 'Sphagnum angustifolium', polish: 'torfowiec wąskolistny', group: 'sphagnum' },
  { latin: 'Sphagnum fimbriatum', polish: 'torfowiec frędzlowaty', group: 'sphagnum' },
  { latin: 'Sphagnum palustre', polish: 'torfowiec błotny', group: 'sphagnum' },
  { latin: 'Sphagnum girgensohnii', polish: 'torfowiec Girgensohna', group: 'sphagnum' },
  { latin: 'Sphagnum russowii', polish: 'torfowiec Russowa', group: 'sphagnum' },
  { latin: 'Sphagnum squarrosum', polish: 'torfowiec nastroszony', group: 'sphagnum' },
  { latin: 'Sphagnum centrale', polish: 'torfowiec pośredni', group: 'sphagnum' },
  { latin: 'Sphagnum cuspidatum', polish: 'torfowiec szpiczastolistny', group: 'sphagnum' },
  { latin: 'Sphagnum spp.', polish: 'torfowce', group: 'sphagnum' },
  // --- drzewa rodzime ---
  { latin: 'Pinus sylvestris', polish: 'sosna zwyczajna', group: 'tree', layer: 'A' },
  { latin: 'Betula pubescens', polish: 'brzoza omszona', group: 'tree', layer: 'A' },
  { latin: 'Betula pendula', polish: 'brzoza brodawkowata', group: 'tree', layer: 'A' },
  { latin: 'Picea abies', polish: 'świerk pospolity (w naturalnym zasięgu)', group: 'tree', layer: 'A' },
  { latin: 'Pinus mugo', polish: 'kosodrzewina', group: 'tree', layer: 'B' },
  { latin: 'Pinus ×rhaetica', polish: 'sosna błotna', group: 'tree', layer: 'A' },
  { latin: 'Alnus glutinosa', polish: 'olsza czarna', group: 'tree', layer: 'A' },
  { latin: 'Frangula alnus', polish: 'kruszyna pospolita', group: 'other', layer: 'B' },
  { latin: 'Sorbus aucuparia', polish: 'jarząb pospolity', group: 'other', layer: 'B' },
  // --- drzewa obce geograficznie ---
  { latin: 'Larix decidua', polish: 'modrzew europejski', group: 'tree-geo-alien', layer: 'A' },
  { latin: 'Pinus strobus', polish: 'sosna wejmutka', group: 'tree-geo-alien', layer: 'A' },
  { latin: 'Quercus rubra', polish: 'dąb czerwony', group: 'tree-geo-alien', layer: 'A' },
  { latin: 'Prunus serotina', polish: 'czeremcha amerykańska', group: 'tree-geo-alien', layer: 'B' },
  { latin: 'Pseudotsuga menziesii', polish: 'daglezja zielona', group: 'tree-geo-alien', layer: 'A' },
  // --- drzewa obce ekologicznie ---
  { latin: 'Fagus sylvatica', polish: 'buk zwyczajny', group: 'tree-eco-alien', layer: 'A' },
  { latin: 'Quercus robur', polish: 'dąb szypułkowy', group: 'tree-eco-alien', layer: 'A' },
  { latin: 'Quercus petraea', polish: 'dąb bezszypułkowy', group: 'tree-eco-alien', layer: 'A' },
  { latin: 'Carpinus betulus', polish: 'grab zwyczajny', group: 'tree-eco-alien', layer: 'A' },
  // --- inwazyjne obce w runie ---
  { latin: 'Spiraea tomentosa', polish: 'tawuła kutnerowata', group: 'invasive', layer: 'B' },
  { latin: 'Impatiens parviflora', polish: 'niecierpek drobnokwiatowy', group: 'invasive' },
  { latin: 'Vaccinium corymbosum', polish: 'borówka wysoka (amerykańska)', group: 'invasive', layer: 'B' },
  // --- rodzime ekspansywne w runie ---
  { latin: 'Molinia caerulea', polish: 'trzęślica modra', group: 'expansive' },
  { latin: 'Vaccinium myrtillus', polish: 'borówka czarna', group: 'expansive' },
  { latin: 'Rubus spp.', polish: 'jeżyny', group: 'expansive' },
  { latin: 'Rubus sp.', polish: 'jeżyna', group: 'expansive' },
  { latin: 'Calamagrostis epigejos', polish: 'trzcinnik piaskowy', group: 'expansive' },
  { latin: 'Pteridium aquilinum', polish: 'orlica pospolita', group: 'expansive' },
  // --- inne runo ---
  { latin: 'Vaccinium vitis-idaea', polish: 'borówka brusznica', group: 'other' },
  { latin: 'Calluna vulgaris', polish: 'wrzos zwyczajny', group: 'other' },
  { latin: 'Dryopteris carthusiana', polish: 'nerecznica krótkoostna', group: 'other' },
  { latin: 'Trientalis europaea', polish: 'siódmaczek leśny', group: 'other' },
  { latin: 'Maianthemum bifolium', polish: 'konwalijka dwulistna', group: 'other' },
  // --- mchy ---
  { latin: 'Pleurozium schreberi', polish: 'rokietnik pospolity', group: 'dry-moss', layer: 'D' },
  { latin: 'Pseudoscleropodium purum', polish: 'brodawkowiec czysty', group: 'dry-moss', layer: 'D' },
  { latin: 'Dicranum polysetum', polish: 'widłoząb kędzierzawy', group: 'dry-moss', layer: 'D' },
  { latin: 'Dicranum scoparium', polish: 'widłoząb miotłowy', group: 'dry-moss', layer: 'D' },
  { latin: 'Hylocomium splendens', polish: 'gajnik lśniący', group: 'dry-moss', layer: 'D' },
  { latin: 'Polytrichum commune', polish: 'płonnik pospolity', group: 'other', layer: 'D' },
  { latin: 'Polytrichum strictum', polish: 'płonnik cienki', group: 'other', layer: 'D' },
  { latin: 'Aulacomnium palustre', polish: 'próchniczek błotny', group: 'other', layer: 'D' },
  { latin: 'Dicranum undulatum', polish: 'widłoząb falisty', group: 'other', layer: 'D' },
  { latin: 'Bazzania trilobata', polish: 'bazzania trójząbkowa', group: 'other', layer: 'D' },
  // --- kluczowe dla różnorodności (wskaźnik fakultatywny) ---
  { latin: 'Rubus chamaemorus', polish: 'malina moroszka', group: 'key' },
  { latin: 'Chamaedaphne calyculata', polish: 'chamedafne północna', group: 'key' },
  { latin: 'Empetrum nigrum', polish: 'bażyna czarna', group: 'key' },
]

const normalize = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^s\.\s*/, 'sphagnum ')

const INDEX = new Map<string, SpeciesEntry91D0>()
for (const e of SPECIES_91D0) {
  INDEX.set(normalize(e.latin), e)
  if (e.polish) INDEX.set(normalize(e.polish), e)
}

/** Szuka po nazwie łacińskiej („S. fallax” też przejdzie) albo polskiej. Każdy „Sphagnum …” to torfowiec. */
export function findSpecies91D0(name: string): SpeciesEntry91D0 | undefined {
  const n = normalize(name)
  const hit = INDEX.get(n)
  if (hit) return hit
  if (n.startsWith('sphagnum')) return { latin: name.trim(), group: 'sphagnum', layer: 'D' }
  if (n.startsWith('rubus') && !n.includes('chamaemorus')) return { latin: name.trim(), group: 'expansive' }
  return undefined
}

export function defaultLayer91D0(e: SpeciesEntry91D0): Layer {
  if (e.layer) return e.layer
  if (e.group === 'sphagnum' || e.group === 'dry-moss') return 'D'
  if (e.group.startsWith('tree')) return 'A'
  return 'C'
}

// ---------- warianty siedliska i listy gatunków charakterystycznych (tab. 1 przewodnika) ----------

export type Variant91D0 = 'pineBog' | 'birchBog' | 'spruceBog' | 'pineBirchBoreal'

/** Pozycja listy: „Sphagnum spp.” to jedna pozycja – zalicza ją dowolny torfowiec. */
export const SPHAGNUM_ITEM = 'Sphagnum spp.'

const PINE_BOG = [
  'Ledum palustre',
  'Vaccinium uliginosum',
  SPHAGNUM_ITEM,
  'Oxycoccus palustris',
  'Andromeda polifolia',
  'Eriophorum vaginatum',
]

export const VARIANTS_91D0: Record<Variant91D0, { label: string; list: string[] }> = {
  pineBog: {
    label: 'Bór bagienny (sosnowy Vaccinio uliginosi-Pinetum, także górski)',
    list: PINE_BOG,
  },
  birchBog: {
    label: 'Brzezina bagienna (Vaccinio uliginosi-Betuletum pubescentis)',
    list: ['Lycopodium annotinum', 'Betula pubescens', ...PINE_BOG],
  },
  spruceBog: {
    label: 'Świerczyna bagienna (borealna Sphagno girgensohnii-Piceetum, górskie)',
    list: ['Stellaria longifolia', 'Listera cordata', SPHAGNUM_ITEM, 'Lycopodium annotinum'],
  },
  pineBirchBoreal: {
    label: 'Borealny las sosnowo-brzozowy (Dryopteridi thelypteridis-Betuletum pubescentis)',
    list: [
      'Betula pubescens',
      'Thelypteris palustris',
      'Carex chordorrhiza',
      'Menyanthes trifoliata',
      'Epipactis palustris',
      'Parnassia palustris',
      SPHAGNUM_ITEM,
      'Oxycoccus palustris',
      'Eriophorum vaginatum',
    ],
  },
}

export const variantOf = (site: { variant?: unknown } | undefined): Variant91D0 | undefined => {
  const v = site?.variant
  return typeof v === 'string' && v in VARIANTS_91D0 ? (v as Variant91D0) : undefined
}

/** Które pozycje listy wariantu są obecne na liście gatunków z karty. */
export function characteristicMatch(rows: SpeciesRow[], variant: Variant91D0) {
  const names = rows.filter((r) => r.name?.trim()).map((r) => r.name.trim())
  const list = VARIANTS_91D0[variant].list
  const present = list.filter((item) =>
    item === SPHAGNUM_ITEM
      ? names.some((n) => findSpecies91D0(n)?.group === 'sphagnum')
      : names.some((n) => findSpecies91D0(n)?.latin === item),
  )
  return { present, missing: list.filter((i) => !present.includes(i)), share: Math.round((present.length / list.length) * 100) }
}

/** Gatunki z listy należące do grup (np. torfowce) i ich łączne pokrycie. */
export function rowsOfGroups(rows: SpeciesRow[], groups: SpeciesGroup91D0[]) {
  const hits = rows.filter((r) => r.name?.trim() && groups.includes(findSpecies91D0(r.name)?.group ?? 'other'))
  const covers = hits.map((r) => num(r.cover)).filter((v): v is number => v !== undefined)
  return {
    names: hits.map((r) => r.name.trim()),
    total: covers.length ? Math.round(covers.reduce((a, b) => a + b, 0) * 10) / 10 : undefined,
  }
}
