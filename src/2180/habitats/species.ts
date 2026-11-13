// Słownik gatunków dla 2180 (lasy mieszane i bory na wydmach nadmorskich), zebrany z przewodnika GIOŚ
// (Lemke 2015, rozdz. „Typowe gatunki roślin” i tab. 1), z przykładowej karty (Białogóra 2013) oraz ze sprawozdań
// z monitoringu 2013–2014, 2016–2018 i 2024 (gatunki obce geograficznie, inwazyjne, drzewostany zastępcze).
import type { Layer, SpeciesRow } from '../../7120/habitats/types'
import { normalizeName } from '../../forest'

/** Zbiorowiska siedliska 2180 wg przewodnika – od zbiorowiska zależy lista gatunków charakterystycznych. */
export const VARIANTS_2180 = {
  empetro: 'Empetro nigri-Pinetum – nadmorski bór bażynowy',
  betulo: 'Betulo pendulae-Quercetum roboris – nadmorski las brzozowo-dębowy',
} as const
export type Variant2180 = keyof typeof VARIANTS_2180

export const variantOf = (site: { variant?: unknown } | undefined): Variant2180 | undefined => {
  const v = site?.variant
  return typeof v === 'string' && v in VARIANTS_2180 ? (v as Variant2180) : undefined
}

export type SpeciesGroup2180 =
  | 'tree' // drzewa właściwe dla siedliska
  | 'shrub' // krzewy i podszyt
  | 'herb' // krzewinki i rośliny zielne runa
  | 'moss' // mszaki
  | 'eco-alien' // drzewo rodzime, ale obce ekologicznie dla zbiorowisk 2180
  | 'alien' // gatunek obcy geograficznie (drzewa wprowadzane na wydmy, neofity)

export interface SpeciesEntry2180 {
  latin: string
  polish?: string
  group: SpeciesGroup2180
  /** Gatunek charakterystyczny dla zbiorowiska (tab. 1 przewodnika). */
  characteristic?: Variant2180[]
  /** Gatunek wymieniony w przewodniku wprost jako „przyjęty za charakterystyczny” (bór bażynowy: 4 gatunki). */
  core?: boolean
  /** Drzewo lub krzew – liczy się do „gatunków obcych geograficznie w drzewostanie i podroście”. */
  woody?: boolean
  layer?: Layer
}

export const GROUP_LABELS_2180: Record<SpeciesGroup2180, string> = {
  tree: 'drzewo lasu nadmorskiego',
  shrub: 'krzew lub podszyt',
  herb: 'krzewinka lub roślina zielna runa',
  moss: 'mszak',
  'eco-alien': 'drzewo obce ekologicznie dla siedliska',
  alien: 'gatunek obcy geograficznie',
}

const E: Variant2180[] = ['empetro']
const B: Variant2180[] = ['betulo']
const EB: Variant2180[] = ['empetro', 'betulo']

export const SPECIES_2180: SpeciesEntry2180[] = [
  // --- Empetro nigri-Pinetum: gatunki „przyjęte za charakterystyczne” (tab. 1) ---
  { latin: 'Empetrum nigrum', polish: 'bażyna czarna', group: 'herb', characteristic: E, core: true },
  { latin: 'Carex arenaria', polish: 'turzyca piaskowa', group: 'herb', characteristic: E, core: true },
  { latin: 'Goodyera repens', polish: 'tajęża jednostronna', group: 'herb', characteristic: E, core: true },
  { latin: 'Moneses uniflora', polish: 'gruszyczka jednokwiatowa', group: 'herb', characteristic: E, core: true },
  // --- Empetro nigri-Pinetum: typowe gatunki borowe runa, postać wilgotna, drzewostan, podszyt ---
  { latin: 'Trientalis europaea', polish: 'siódmaczek leśny', group: 'herb', characteristic: EB },
  { latin: 'Melampyrum pratense', polish: 'pszeniec zwyczajny', group: 'herb', characteristic: E },
  { latin: 'Vaccinium vitis-idaea', polish: 'borówka brusznica', group: 'herb', characteristic: E },
  { latin: 'Deschampsia flexuosa', polish: 'śmiałek pogięty', group: 'herb', characteristic: E },
  { latin: 'Calluna vulgaris', polish: 'wrzos zwyczajny', group: 'herb', characteristic: E },
  { latin: 'Erica tetralix', polish: 'wrzosiec bagienny', group: 'herb', characteristic: E },
  { latin: 'Vaccinium uliginosum', polish: 'borówka bagienna', group: 'herb', characteristic: E },
  { latin: 'Pinus sylvestris', polish: 'sosna zwyczajna', group: 'tree', characteristic: E, layer: 'A' },
  { latin: 'Betula pendula', polish: 'brzoza brodawkowata', group: 'tree', characteristic: E, layer: 'A' },
  { latin: 'Sorbus aucuparia', polish: 'jarząb pospolity', group: 'shrub', characteristic: E, layer: 'B' },
  { latin: 'Salix arenaria', polish: 'wierzba piaskowa', group: 'shrub', characteristic: E, layer: 'B' },
  // --- Betulo pendulae-Quercetum roboris (tab. 1) ---
  { latin: 'Quercus robur', polish: 'dąb szypułkowy', group: 'tree', characteristic: B, layer: 'A' },
  { latin: 'Betula pubescens', polish: 'brzoza omszona', group: 'tree', characteristic: B, layer: 'A' },
  { latin: 'Quercus petraea', polish: 'dąb bezszypułkowy', group: 'tree', characteristic: B, layer: 'A' },
  { latin: 'Frangula alnus', polish: 'kruszyna pospolita', group: 'shrub', characteristic: B, layer: 'B' },
  { latin: 'Padus avium', polish: 'czeremcha zwyczajna', group: 'shrub', characteristic: B, layer: 'B' },
  { latin: 'Lonicera periclymenum', polish: 'wiciokrzew pomorski', group: 'shrub', characteristic: B, layer: 'B' },
  { latin: 'Luzula pilosa', polish: 'kosmatka owłosiona', group: 'herb', characteristic: B },
  { latin: 'Pteridium aquilinum', polish: 'orlica pospolita', group: 'herb', characteristic: B },
  { latin: 'Vaccinium myrtillus', polish: 'borówka czarna', group: 'herb', characteristic: B },
  { latin: 'Molinia caerulea', polish: 'trzęślica modra', group: 'herb', characteristic: B },
  { latin: 'Lathyrus linifolius', polish: 'groszek skrzydlasty', group: 'herb', characteristic: B },
  // --- pozostałe gatunki towarzyszące z opisu siedliska ---
  { latin: 'Fagus sylvatica', polish: 'buk zwyczajny', group: 'eco-alien', layer: 'A' },
  { latin: 'Ribes alpinum', polish: 'porzeczka alpejska', group: 'shrub', layer: 'B' },
  { latin: 'Corylus avellana', polish: 'leszczyna pospolita', group: 'shrub', layer: 'B' },
  { latin: 'Myrica gale', polish: 'woskownica europejska', group: 'shrub', layer: 'B' },
  { latin: 'Ledum palustre', polish: 'bagno zwyczajne', group: 'herb' },
  { latin: 'Hylocomium splendens', polish: 'gajnik lśniący', group: 'moss' },
  { latin: 'Pleurozium schreberi', polish: 'rokietnik pospolity', group: 'moss' },
  { latin: 'Pseudoscleropodium purum', polish: 'brodawkowiec czysty', group: 'moss' },
  { latin: 'Dicranum scoparium', polish: 'widłoząb miotlasty', group: 'moss' },
  { latin: 'Dicranum polysetum', polish: 'widłoząb kędzierzawy', group: 'moss' },
  { latin: 'Hypnum cupressiforme', polish: 'rokiet cyprysowaty', group: 'moss' },
  { latin: 'Epipactis atrorubens', polish: 'kruszczyk rdzawoczerwony', group: 'herb' },
  // --- obce geograficznie: drzewa wprowadzane na wydmy (tab. 1, sprawozdania 2013–2024) ---
  { latin: 'Pinus nigra', polish: 'sosna czarna', group: 'alien', woody: true, layer: 'A' },
  { latin: 'Pinus mugo', polish: 'sosna kosa (kosodrzewina)', group: 'alien', woody: true, layer: 'B' },
  { latin: 'Pinus contorta', polish: 'sosna wydmowa', group: 'alien', woody: true, layer: 'A' },
  { latin: 'Pinus banksiana', polish: 'sosna Banksa', group: 'alien', woody: true, layer: 'A' },
  { latin: 'Pinus strobus', polish: 'sosna wejmutka', group: 'alien', woody: true, layer: 'A' },
  { latin: 'Picea abies', polish: 'świerk pospolity', group: 'alien', woody: true, layer: 'A' },
  { latin: 'Quercus rubra', polish: 'dąb czerwony', group: 'alien', woody: true, layer: 'A' },
  { latin: 'Padus serotina', polish: 'czeremcha amerykańska', group: 'alien', woody: true, layer: 'B' },
  { latin: 'Rosa rugosa', polish: 'róża pomarszczona', group: 'alien', woody: true, layer: 'B' },
  { latin: 'Prunus domestica', polish: 'śliwa domowa', group: 'alien', woody: true, layer: 'B' },
  { latin: 'Symphoricarpos albus', polish: 'śnieguliczka biała', group: 'alien', woody: true, layer: 'B' },
  // --- obce inwazyjne w runie (tab. 1 za Tokarską-Guzik 2005, sprawozdania) ---
  { latin: 'Impatiens parviflora', polish: 'niecierpek drobnokwiatowy', group: 'alien' },
  { latin: 'Reynoutria japonica', polish: 'rdestowiec ostrokończysty', group: 'alien' },
  { latin: 'Reynoutria ×bohemica', polish: 'rdestowiec pośredni', group: 'alien' },
  { latin: 'Solidago canadensis', polish: 'nawłoć kanadyjska', group: 'alien' },
  { latin: 'Solidago gigantea', polish: 'nawłoć późna', group: 'alien' },
  { latin: 'Heracleum sosnowskyi', polish: 'barszcz Sosnowskiego', group: 'alien' },
  { latin: 'Heracleum mantegazzianum', polish: 'barszcz Mantegazziego', group: 'alien' },
  { latin: 'Helianthus tuberosus', polish: 'słonecznik bulwiasty', group: 'alien' },
  { latin: 'Erigeron annuus', polish: 'przymiotno białe', group: 'alien' },
  { latin: 'Lupinus polyphyllus', polish: 'łubin trwały', group: 'alien' },
  { latin: 'Rumex confertus', polish: 'szczaw omszony', group: 'alien' },
]

// Synonimy i pisownia z przewodnika i sprawozdań.
const SYNONYMS: Record<string, string> = {
  'pinus silvestris': 'Pinus sylvestris',
  'picea excelsa': 'Picea abies',
  'prunus serotina': 'Padus serotina',
  'prunus padus': 'Padus avium',
  'trientalis europeus': 'Trientalis europaea',
  'molinia coerulea': 'Molinia caerulea',
  'lathyrus montanus': 'Lathyrus linifolius',
  'avenella flexuosa': 'Deschampsia flexuosa',
  'rhododendron tomentosum': 'Ledum palustre',
  'scleropodium purum': 'Pseudoscleropodium purum',
  'reynoutria x bohemica': 'Reynoutria ×bohemica',
  'reynoutria bohemica': 'Reynoutria ×bohemica',
  'fallopia japonica': 'Reynoutria japonica',
  'pinus mugo subsp. mugo': 'Pinus mugo',
}

const BY_LATIN = new Map(SPECIES_2180.map((s) => [normalizeName(s.latin), s]))

/** Wpis katalogu po nazwie naukowej (synonimy, podgatunki, „s.l.”). */
export function findSpecies2180(name: string): SpeciesEntry2180 | undefined {
  const key = normalizeName(name)
  if (!key) return undefined
  const look = (k: string) => BY_LATIN.get(k) ?? (SYNONYMS[k] ? BY_LATIN.get(normalizeName(SYNONYMS[k])) : undefined)
  const direct = look(key)
  if (direct) return direct
  const binomial = key.split(' ').slice(0, 2).join(' ')
  return binomial !== key ? look(binomial) : undefined
}

export function defaultLayer2180(e: SpeciesEntry2180): Layer {
  if (e.layer) return e.layer
  if (e.group === 'tree' || e.group === 'eco-alien') return 'A'
  if (e.group === 'shrub') return 'B'
  if (e.group === 'moss') return 'D'
  return 'C'
}

/** Lista gatunków charakterystycznych zbiorowiska (tab. 1). */
export const characteristicOf = (v: Variant2180) => SPECIES_2180.filter((s) => s.characteristic?.includes(v)).map((s) => s.latin)

const named = (rows: SpeciesRow[]) => rows.filter((r) => r.name?.trim())

export interface CharacteristicSummary2180 {
  present: string[]
  missing: string[]
  /** Procent listy zbiorowiska obecny na transekcie (0–100, do 0,1). */
  percent: number
}

/** Które gatunki z listy zbiorowiska są na liście z karty. */
export function characteristicSummary(rows: SpeciesRow[], v: Variant2180): CharacteristicSummary2180 {
  const present = new Set<string>()
  for (const r of named(rows)) {
    const e = findSpecies2180(r.name)
    if (e?.characteristic?.includes(v)) present.add(e.latin)
  }
  const list = characteristicOf(v)
  return {
    present: list.filter((l) => present.has(l)),
    missing: list.filter((l) => !present.has(l)),
    percent: Math.round((present.size / list.length) * 1000) / 10,
  }
}

/** Gatunki z listy należące do grupy. */
export const namesOfGroup = (rows: SpeciesRow[], ...groups: SpeciesGroup2180[]) =>
  named(rows)
    .filter((r) => {
      const g = findSpecies2180(r.name)?.group
      return g !== undefined && groups.includes(g)
    })
    .map((r) => r.name.trim())
