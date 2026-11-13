// Słownik gatunków dla 91T0 (śródlądowy bór chrobotkowy, Cladonio-Pinetum), zebrany z przewodnika GIOŚ
// (Węgrzyn i Masłowska 2010, rozdz. „Typowe gatunki roślin” i tab. 1), z przykładowej karty (Bór Chrobotkowy 2007)
// oraz ze sprawozdań z monitoringu 2013–2014 i 2021 (gatunki obce, ekspansywne, porosty i mszaki towarzyszące).
import type { Layer, SpeciesRow } from '../../7120/habitats/types'
import { normalizeName } from '../../forest'

export type SpeciesGroup91T0 =
  | 'tree' // sosna (i brzoza jako domieszka) – drzewostan boru
  | 'shrub' // podszyt: odnowienia, jałowiec
  | 'herb' // krzewinki i rośliny zielne runa
  | 'lichen' // porosty naziemne (chrobotki, płucnice, chróścik)
  | 'moss' // mszaki
  | 'eco-alien' // drzewa rodzime, ale niezgodne z borem suchym (nasadzane dęby, buk)
  | 'expansive' // rodzimy gatunek ekspansywny (apofit)
  | 'invasive' // gatunek obcy geograficznie
  | 'other'

export interface SpeciesEntry91T0 {
  latin: string
  polish?: string
  group: SpeciesGroup91T0
  /** Gatunek z listy kombinacji charakterystycznej (tab. 1 przewodnika, sprawozdanie 2021) – liczony do %. */
  characteristic?: boolean
  /** Krzewinka lub trawa charakterystyczna, która przy dużym pokryciu (≥3 w skali B-B) staje się ekspansywna. */
  expansiveWhenAbundant?: boolean
  layer?: Layer
}

export const GROUP_LABELS_91T0: Record<SpeciesGroup91T0, string> = {
  tree: 'drzewo boru suchego',
  shrub: 'krzew lub odnowienie w podszycie',
  herb: 'krzewinka lub roślina zielna runa',
  lichen: 'porost naziemny',
  moss: 'mszak',
  'eco-alien': 'drzewo niezgodne z borem chrobotkowym',
  expansive: 'rodzimy gatunek ekspansywny',
  invasive: 'gatunek obcy geograficznie',
  other: 'inny',
}

const C = true

export const SPECIES_91T0: SpeciesEntry91T0[] = [
  // --- kombinacja charakterystyczna (tab. 1, sprawozdanie 2021) ---
  { latin: 'Pinus sylvestris', polish: 'sosna zwyczajna', group: 'tree', characteristic: C, layer: 'A' },
  { latin: 'Cladonia arbuscula', polish: 'chrobotek leśny', group: 'lichen', characteristic: C },
  { latin: 'Cladonia rangiferina', polish: 'chrobotek reniferowy', group: 'lichen', characteristic: C },
  { latin: 'Cladonia gracilis', polish: 'chrobotek wysmukły', group: 'lichen', characteristic: C },
  { latin: 'Cladonia uncialis', polish: 'chrobotek gwiazdkowaty', group: 'lichen', characteristic: C },
  { latin: 'Cladonia furcata', polish: 'chrobotek widlasty', group: 'lichen', characteristic: C },
  { latin: 'Calluna vulgaris', polish: 'wrzos zwyczajny', group: 'herb', characteristic: C, expansiveWhenAbundant: C },
  { latin: 'Vaccinium vitis-idaea', polish: 'borówka brusznica', group: 'herb', characteristic: C, expansiveWhenAbundant: C },
  { latin: 'Vaccinium myrtillus', polish: 'borówka czarna', group: 'herb', characteristic: C, expansiveWhenAbundant: C },
  { latin: 'Deschampsia flexuosa', polish: 'śmiałek pogięty', group: 'herb', characteristic: C, expansiveWhenAbundant: C },
  // --- drzewostan i podszyt ---
  { latin: 'Betula pendula', polish: 'brzoza brodawkowata', group: 'tree', layer: 'A' },
  { latin: 'Juniperus communis', polish: 'jałowiec pospolity', group: 'shrub', layer: 'B' },
  { latin: 'Frangula alnus', polish: 'kruszyna pospolita', group: 'shrub', layer: 'B' },
  { latin: 'Padus avium', polish: 'czeremcha zwyczajna', group: 'shrub', layer: 'B' },
  // --- runo: rzadsze gatunki zielne boru suchego (tab. 1) i murawowe ---
  { latin: 'Festuca ovina', polish: 'kostrzewa owcza', group: 'herb', expansiveWhenAbundant: C },
  { latin: 'Melampyrum pratense', polish: 'pszeniec zwyczajny', group: 'herb', expansiveWhenAbundant: C },
  { latin: 'Rumex acetosella', polish: 'szczaw polny', group: 'herb', expansiveWhenAbundant: C },
  { latin: 'Corynephorus canescens', polish: 'szczotlicha siwa', group: 'herb' },
  { latin: 'Carex arenaria', polish: 'turzyca piaskowa', group: 'herb' },
  { latin: 'Arctostaphylos uva-ursi', polish: 'mącznica lekarska', group: 'herb' },
  { latin: 'Empetrum nigrum', polish: 'bażyna czarna', group: 'herb' },
  { latin: 'Chimaphila umbellata', polish: 'pomocnik baldaszkowy', group: 'herb' },
  { latin: 'Diphasiastrum complanatum', polish: 'widlicz spłaszczony', group: 'herb' },
  { latin: 'Hieracium pilosella', polish: 'jastrzębiec kosmaczek', group: 'herb' },
  // --- porosty naziemne towarzyszące (przykładowa karta 2007, sprawozdania) ---
  { latin: 'Cladonia stellaris', polish: 'chrobotek alpejski', group: 'lichen' },
  { latin: 'Cladonia portentosa', polish: 'chrobotek najeżony', group: 'lichen' },
  { latin: 'Cladonia coccifera', group: 'lichen' },
  { latin: 'Cladonia pleurota', group: 'lichen' },
  { latin: 'Cladonia digitata', polish: 'chrobotek palczasty', group: 'lichen' },
  { latin: 'Cladonia squamosa', polish: 'chrobotek łuseczkowaty', group: 'lichen' },
  { latin: 'Cladonia fimbriata', polish: 'chrobotek strzępiasty', group: 'lichen' },
  { latin: 'Cetraria islandica', polish: 'płucnica islandzka', group: 'lichen' },
  { latin: 'Cetraria aculeata', polish: 'płucnica kolczasta', group: 'lichen' },
  { latin: 'Cetraria ericetorum', group: 'lichen' },
  { latin: 'Cetraria nivalis', polish: 'płucnica śniegowa', group: 'lichen' },
  { latin: 'Stereocaulon paschale', polish: 'chróścik wielkanocny', group: 'lichen' },
  // --- mszaki ---
  { latin: 'Pleurozium schreberi', polish: 'rokiet pospolity', group: 'moss' },
  { latin: 'Dicranum polysetum', polish: 'widłoząb kędzierzawy', group: 'moss' },
  { latin: 'Dicranum scoparium', polish: 'widłoząb miotlasty', group: 'moss' },
  { latin: 'Dicranum spurium', polish: 'widłoząb zdrożny', group: 'moss' },
  { latin: 'Ptilidium ciliare', polish: 'rzęsiak pospolity', group: 'moss' },
  { latin: 'Hypnum cupressiforme', polish: 'rokietnik pospolity', group: 'moss' },
  { latin: 'Hylocomium splendens', polish: 'gajnik lśniący', group: 'moss' },
  { latin: 'Leucobryum glaucum', polish: 'bielistka siwa', group: 'moss' },
  { latin: 'Polytrichum piliferum', polish: 'płonnik włosowy', group: 'moss' },
  { latin: 'Polytrichum juniperinum', polish: 'płonnik jałowcowaty', group: 'moss' },
  { latin: 'Polytrichum commune', polish: 'płonnik pospolity', group: 'moss' },
  { latin: 'Ceratodon purpureus', polish: 'zęboróg purpurowy', group: 'moss' },
  // --- drzewa niezgodne z siedliskiem (nasadzenia dębu i buka – tab. 1) ---
  { latin: 'Quercus robur', polish: 'dąb szypułkowy', group: 'eco-alien', layer: 'A' },
  { latin: 'Quercus petraea', polish: 'dąb bezszypułkowy', group: 'eco-alien', layer: 'A' },
  { latin: 'Fagus sylvatica', polish: 'buk zwyczajny', group: 'eco-alien', layer: 'A' },
  { latin: 'Picea abies', polish: 'świerk pospolity', group: 'eco-alien', layer: 'A' },
  { latin: 'Larix decidua', polish: 'modrzew europejski', group: 'eco-alien', layer: 'A' },
  // --- rodzime ekspansywne (sprawozdania 2014 i 2021; apofity borów – interpretacja) ---
  { latin: 'Calamagrostis epigejos', polish: 'trzcinnik piaskowy', group: 'expansive' },
  { latin: 'Molinia caerulea', polish: 'trzęślica modra', group: 'expansive' },
  { latin: 'Rubus idaeus', polish: 'malina właściwa', group: 'expansive' },
  { latin: 'Pteridium aquilinum', polish: 'orlica pospolita', group: 'expansive' },
  // --- obce geograficznie (sprawozdanie 2021, tab. 3) ---
  { latin: 'Padus serotina', polish: 'czeremcha amerykańska', group: 'invasive', layer: 'B' },
  { latin: 'Campylopus introflexus', polish: 'krzywoszczeć przywłoka', group: 'invasive', layer: 'D' },
  { latin: 'Quercus rubra', polish: 'dąb czerwony', group: 'invasive', layer: 'A' },
  { latin: 'Pinus banksiana', polish: 'sosna Banksa', group: 'invasive', layer: 'A' },
  { latin: 'Pinus strobus', polish: 'sosna wejmutka', group: 'invasive', layer: 'A' },
  { latin: 'Pseudotsuga menziesii', polish: 'daglezja zielona', group: 'invasive', layer: 'A' },
  { latin: 'Robinia pseudoacacia', polish: 'robinia akacjowa', group: 'invasive', layer: 'A' },
]

// Nazwy z przewodnika i sprawozdań (literówki, synonimy, podgatunki), które trzeba rozpoznać.
const SYNONYMS: Record<string, string> = {
  'pinus silvestris': 'Pinus sylvestris',
  'vaccnium myrtillus': 'Vaccinium myrtillus',
  'vaccinium vitis idaea': 'Vaccinium vitis-idaea',
  'avenella flexuosa': 'Deschampsia flexuosa',
  'cladonia mitis': 'Cladonia arbuscula',
  'cladina arbuscula': 'Cladonia arbuscula',
  'cladina mitis': 'Cladonia arbuscula',
  'cladina rangiferina': 'Cladonia rangiferina',
  'cladina stellaris': 'Cladonia stellaris',
  'cladina portentosa': 'Cladonia portentosa',
  'cladonia furiata': 'Cladonia furcata',
  'cetraria muricata': 'Cetraria aculeata',
  'prunus serotina': 'Padus serotina',
  'prunus padus': 'Padus avium',
}

const BY_LATIN = new Map(SPECIES_91T0.map((s) => [s.latin.toLowerCase(), s]))

/**
 * Wpis katalogu po nazwie naukowej. Rozpoznaje synonimy, literówki z przewodnika i podgatunki
 * („Cladonia arbuscula subsp. squarrosa” → chrobotek leśny).
 */
export function findSpecies91T0(name: string): SpeciesEntry91T0 | undefined {
  const key = normalizeName(name)
  if (!key) return undefined
  const look = (k: string) => BY_LATIN.get(k) ?? BY_LATIN.get(SYNONYMS[k]?.toLowerCase() ?? '')
  const direct = look(key)
  if (direct) return direct
  // podgatunek / odmiana / „s.l.” → gatunek
  const binomial = key.split(' ').slice(0, 2).join(' ')
  return binomial !== key ? look(binomial) : undefined
}

export function defaultLayer91T0(e: SpeciesEntry91T0): Layer {
  if (e.layer) return e.layer
  if (e.group === 'tree' || e.group === 'eco-alien') return 'A'
  if (e.group === 'shrub') return 'B'
  if (e.group === 'lichen' || e.group === 'moss') return 'D'
  return 'C'
}

/** Lista kombinacji charakterystycznej, od której liczy się procent (10 gatunków). */
export const CHARACTERISTIC_91T0 = SPECIES_91T0.filter((s) => s.characteristic).map((s) => s.latin)

const named = (rows: SpeciesRow[]) => rows.filter((r) => r.name?.trim())

export interface CharacteristicSummary {
  /** Gatunki z listy kombinacji charakterystycznej, które są na transekcie (nazwy łacińskie z katalogu, bez powtórzeń). */
  present: string[]
  /** Gatunki z listy, których brakuje. */
  missing: string[]
  /** Procent listy obecny na transekcie (0–100, zaokrąglony do 1). */
  percent: number
  /** Wpisane gatunki spoza listy (nie liczą się, ale nie przeszkadzają). */
  extra: string[]
}

/** Ile z 10 gatunków kombinacji charakterystycznej jest na liście. */
export function characteristicSummary(rows: SpeciesRow[]): CharacteristicSummary {
  const present = new Set<string>()
  const extra: string[] = []
  for (const r of named(rows)) {
    const e = findSpecies91T0(r.name)
    if (e?.characteristic) present.add(e.latin)
    else extra.push(r.name.trim())
  }
  const list = CHARACTERISTIC_91T0
  return {
    present: list.filter((l) => present.has(l)),
    missing: list.filter((l) => !present.has(l)),
    percent: Math.round((present.size / list.length) * 1000) / 10,
    extra,
  }
}

/** Gatunki z listy należące do grupy (np. „invasive”). */
export const namesOfGroup = (rows: SpeciesRow[], group: SpeciesGroup91T0) =>
  named(rows)
    .filter((r) => findSpecies91T0(r.name)?.group === group)
    .map((r) => r.name.trim())

/** Chrobotki (rodzaj Cladonia) na liście – do oceny różnorodności runa porostowego. */
export const cladoniaOf = (rows: SpeciesRow[]) => named(rows).filter((r) => /^cladonia\b|^cladina\b/i.test(r.name.trim()))
