// Słownik gatunków dla 7120, zebrany z przewodnika (rozdz. „Typowe gatunki roślin” i tab. 1–2).
// Służy do podpowiedzi w polach (datalist) i do automatycznego liczenia ocen.
import type { Layer, SpeciesRow } from '../types'
import { num } from '../assessment'

export type SpeciesGroup =
  | 'char-vascular' // roślina naczyniowa charakterystyczna dla Oxycocco-Sphagnetea
  | 'char-moss' // mszak charakterystyczny (nie torfowiec)
  | 'sphagnum-hummock' // torfowiec kępkowy
  | 'sphagnum-hollow' // torfowiec dolinkowy (sekcja Cuspidata)
  | 'sphagnum-other' // torfowiec niecharakterystyczny dla torfowisk wysokich
  | 'peat-typical' // typowy dla torfowisk wysokich, ale nie charakterystyczny dla klasy
  | 'expansive' // ekspansywny gatunek zielny / krzewinka
  | 'woody' // drzewo lub krzew
  | 'invasive' // obcy inwazyjny
  | 'other'

export interface SpeciesEntry {
  latin: string
  polish?: string
  group: SpeciesGroup
  /** Warstwa domyślna, gdy nie wynika z grupy (np. mchy z grupy „inne”). */
  layer?: Layer
}

/** Warstwa, do której gatunek trafia domyślnie w zdjęciu fitosocjologicznym. */
export function defaultLayer(e: SpeciesEntry): Layer {
  if (e.layer) return e.layer
  if (e.group === 'woody' || e.group === 'invasive') return 'B'
  if (e.group.startsWith('sphagnum') || e.group === 'char-moss') return 'D'
  return 'C'
}

export const GROUP_LABELS: Record<SpeciesGroup, string> = {
  'char-vascular': 'charakterystyczna roślina naczyniowa',
  'char-moss': 'charakterystyczny mszak',
  'sphagnum-hummock': 'torfowiec kępkowy (charakterystyczny)',
  'sphagnum-hollow': 'torfowiec dolinkowy (charakterystyczny)',
  'sphagnum-other': 'torfowiec niecharakterystyczny',
  'peat-typical': 'typowy dla torfowisk',
  expansive: 'gatunek ekspansywny',
  woody: 'drzewo/krzew',
  invasive: 'obcy inwazyjny',
  other: 'inny',
}

export const SPECIES_7120: SpeciesEntry[] = [
  // --- naczyniowe charakterystyczne dla Oxycocco-Sphagnetea ---
  { latin: 'Andromeda polifolia', polish: 'modrzewnica zwyczajna', group: 'char-vascular' },
  { latin: 'Carex pauciflora', polish: 'turzyca skąpokwiatowa', group: 'char-vascular' },
  { latin: 'Drosera rotundifolia', polish: 'rosiczka okrągłolistna', group: 'char-vascular' },
  { latin: 'Eriophorum vaginatum', polish: 'wełnianka pochwowata', group: 'char-vascular' },
  { latin: 'Erica tetralix', polish: 'wrzosiec bagienny', group: 'char-vascular' },
  { latin: 'Oxycoccus palustris', polish: 'żurawina błotna', group: 'char-vascular' },
  { latin: 'Oxycoccus microcarpus', polish: 'żurawina drobnoowockowa', group: 'char-vascular' },
  { latin: 'Rubus chamaemorus', polish: 'malina moroszka', group: 'char-vascular' },
  // --- mszaki charakterystyczne ---
  { latin: 'Aulacomnium palustre', polish: 'próchniczek błotny', group: 'char-moss' },
  { latin: 'Polytrichum strictum', polish: 'płonnik cienki', group: 'char-moss' },
  // --- torfowce kępkowe ---
  { latin: 'Sphagnum magellanicum', polish: 'torfowiec magellański', group: 'sphagnum-hummock' },
  { latin: 'Sphagnum medium', polish: 'torfowiec (z grupy S. magellanicum)', group: 'sphagnum-hummock' },
  { latin: 'Sphagnum divinum', polish: 'torfowiec (z grupy S. magellanicum)', group: 'sphagnum-hummock' },
  { latin: 'Sphagnum rubellum', polish: 'torfowiec czerwonawy', group: 'sphagnum-hummock' },
  { latin: 'Sphagnum capillifolium', polish: 'torfowiec ostrolistny', group: 'sphagnum-hummock' },
  { latin: 'Sphagnum fuscum', polish: 'torfowiec brunatny', group: 'sphagnum-hummock' },
  { latin: 'Sphagnum papillosum', polish: 'torfowiec brodawkowaty', group: 'sphagnum-hummock' },
  // --- torfowce dolinkowe ---
  { latin: 'Sphagnum cuspidatum', polish: 'torfowiec szpiczastolistny', group: 'sphagnum-hollow' },
  { latin: 'Sphagnum fallax', polish: 'torfowiec kończysty', group: 'sphagnum-hollow' },
  { latin: 'Sphagnum angustifolium', polish: 'torfowiec wąskolistny', group: 'sphagnum-hollow' },
  { latin: 'Sphagnum balticum', polish: 'torfowiec bałtycki', group: 'sphagnum-hollow' },
  { latin: 'Sphagnum tenellum', polish: 'torfowiec delikatny', group: 'sphagnum-hollow' },
  // --- inne torfowce ---
  { latin: 'Sphagnum fimbriatum', polish: 'torfowiec frędzlowaty', group: 'sphagnum-other' },
  { latin: 'Sphagnum compactum', polish: 'torfowiec zbity', group: 'sphagnum-other' },
  { latin: 'Sphagnum palustre', polish: 'torfowiec błotny', group: 'sphagnum-other' },
  { latin: 'Sphagnum squarrosum', polish: 'torfowiec nastroszony', group: 'sphagnum-other' },
  { latin: 'Sphagnum russowii', polish: 'torfowiec Russowa', group: 'sphagnum-other' },
  { latin: 'Sphagnum girgensohnii', polish: 'torfowiec Girgensohna', group: 'sphagnum-other' },
  // --- typowe dla torfowisk (niecharakterystyczne dla klasy) ---
  { latin: 'Ledum palustre', polish: 'bagno zwyczajne', group: 'peat-typical' },
  { latin: 'Vaccinium uliginosum', polish: 'borówka bagienna', group: 'peat-typical' },
  { latin: 'Empetrum nigrum', polish: 'bażyna czarna', group: 'peat-typical' },
  { latin: 'Rhynchospora alba', polish: 'przygiełka biała', group: 'peat-typical' },
  { latin: 'Eriophorum angustifolium', polish: 'wełnianka wąskolistna', group: 'peat-typical' },
  { latin: 'Drosera anglica', polish: 'rosiczka długolistna', group: 'peat-typical' },
  { latin: 'Drosera intermedia', polish: 'rosiczka pośrednia', group: 'peat-typical' },
  { latin: 'Scheuchzeria palustris', polish: 'bagnica torfowa', group: 'peat-typical' },
  { latin: 'Carex limosa', polish: 'turzyca bagienna', group: 'peat-typical' },
  { latin: 'Carex rostrata', polish: 'turzyca dzióbkowata', group: 'peat-typical' },
  { latin: 'Menyanthes trifoliata', polish: 'bobrek trójlistkowy', group: 'peat-typical' },
  { latin: 'Comarum palustre', polish: 'siedmiopalecznik błotny', group: 'peat-typical' },
  // --- ekspansywne ---
  { latin: 'Molinia caerulea', polish: 'trzęślica modra', group: 'expansive' },
  { latin: 'Calluna vulgaris', polish: 'wrzos zwyczajny', group: 'expansive' },
  { latin: 'Phragmites australis', polish: 'trzcina pospolita', group: 'expansive' },
  { latin: 'Calamagrostis canescens', polish: 'trzcinnik lancetowaty', group: 'expansive' },
  // --- drzewa i krzewy ---
  { latin: 'Pinus sylvestris', polish: 'sosna zwyczajna', group: 'woody' },
  { latin: 'Pinus mugo', polish: 'kosodrzewina', group: 'woody' },
  { latin: 'Betula pendula', polish: 'brzoza brodawkowata', group: 'woody' },
  { latin: 'Betula pubescens', polish: 'brzoza omszona', group: 'woody' },
  { latin: 'Frangula alnus', polish: 'kruszyna pospolita', group: 'woody' },
  { latin: 'Picea abies', polish: 'świerk pospolity', group: 'woody' },
  { latin: 'Salix aurita', polish: 'wierzba uszata', group: 'woody' },
  { latin: 'Salix cinerea', polish: 'wierzba szara', group: 'woody' },
  { latin: 'Sorbus aucuparia', polish: 'jarząb pospolity', group: 'woody' },
  { latin: 'Alnus glutinosa', polish: 'olsza czarna', group: 'woody' },
  { latin: 'Quercus robur', polish: 'dąb szypułkowy', group: 'woody' },
  // --- obce inwazyjne ---
  { latin: 'Prunus serotina', polish: 'czeremcha amerykańska', group: 'invasive' },
  { latin: 'Quercus rubra', polish: 'dąb czerwony', group: 'invasive' },
  // --- inne zielne i krzewinki ---
  { latin: 'Vaccinium vitis-idaea', polish: 'borówka brusznica', group: 'other' },
  { latin: 'Vaccinium myrtillus', polish: 'borówka czarna', group: 'other' },
  { latin: 'Potentilla erecta', polish: 'pięciornik kurze ziele', group: 'other' },
  { latin: 'Juncus effusus', polish: 'sit rozpierzchły', group: 'other' },
  { latin: 'Agrostis canina', polish: 'mietlica psia', group: 'other' },
  { latin: 'Carex nigra', polish: 'turzyca pospolita', group: 'other' },
  // --- inne mszaki i porosty (warstwa D) ---
  { latin: 'Pleurozium schreberi', polish: 'rokietnik pospolity', group: 'other', layer: 'D' },
  { latin: 'Pseudoscleropodium purum', group: 'other', layer: 'D' },
  { latin: 'Polytrichum commune', polish: 'płonnik pospolity', group: 'other', layer: 'D' },
  { latin: 'Dicranum scoparium', polish: 'widłoząb miotłowy', group: 'other', layer: 'D' },
  { latin: 'Dicranum polysetum', polish: 'widłoząb kędzierzawy', group: 'other', layer: 'D' },
  { latin: 'Hylocomium splendens', polish: 'gajnik lśniący', group: 'other', layer: 'D' },
  { latin: 'Hypnum jutlandicum', polish: 'rokiet duński', group: 'other', layer: 'D' },
  { latin: 'Hypnum cupressiforme', polish: 'rokiet cyprysowy', group: 'other', layer: 'D' },
  { latin: 'Cladonia spp.', polish: 'chrobotki', group: 'other', layer: 'D' },
  { latin: 'Cladonia rangiferina', polish: 'chrobotek reniferowy', group: 'other', layer: 'D' },
]

const normalize = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^s\.\s*/, 'sphagnum ')
    .replace(/\s+(spp?\.?)$/, '')

const INDEX = new Map<string, SpeciesEntry>()
for (const e of SPECIES_7120) {
  INDEX.set(normalize(e.latin), e)
  if (e.polish) INDEX.set(normalize(e.polish), e)
}

/** Znajduje gatunek po nazwie łacińskiej („S. fallax” też przejdzie) albo polskiej. */
export function findSpecies(name: string): SpeciesEntry | undefined {
  return INDEX.get(normalize(name))
}

export const isCharSphagnum = (g?: SpeciesGroup) => g === 'sphagnum-hummock' || g === 'sphagnum-hollow'

/** Gatunki „wysokotorfowiskowe” na potrzeby wskaźnika „gatunki dominujące”. */
export const isPeatSpecies = (g?: SpeciesGroup) =>
  g === 'char-vascular' || g === 'char-moss' || isCharSphagnum(g) || g === 'peat-typical'

export function classify(rows: SpeciesRow[]) {
  const named = rows.filter((r) => r.name?.trim())
  const withEntry = named.map((r) => ({ row: r, entry: findSpecies(r.name) }))
  return {
    charSphagnum: withEntry.filter((x) => isCharSphagnum(x.entry?.group)).map((x) => x.entry!.latin),
    charVascular: withEntry.filter((x) => x.entry?.group === 'char-vascular').map((x) => x.entry!.latin),
    unknown: withEntry.filter((x) => !x.entry).map((x) => x.row.name.trim()),
    /** Udział (%) pokrycia gatunków wysokotorfowiskowych w sumie pokrycia podanych gatunków. */
    peatShare: (() => {
      const total = named.reduce((s, r) => s + (num(r.cover) ?? 0), 0)
      if (total === 0) return undefined
      const peat = withEntry
        .filter((x) => isPeatSpecies(x.entry?.group))
        .reduce((s, x) => s + (num(x.row.cover) ?? 0), 0)
      return Math.round((peat / total) * 100)
    })(),
  }
}
