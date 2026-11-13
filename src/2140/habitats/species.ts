// Słownik gatunków dla *2140 (nadmorskie wrzosowiska bażynowe), zebrany z przewodnika GIOŚ (Braun 2010, rozdz.
// „Typowe gatunki roślin”, tab. 1 i przykładowa karta Czołpino 2008) oraz ze sprawozdań z monitoringu 2013–2014,
// 2016–2018 i 2023–2025 (gatunki obce – tab. 3 sprawozdania 2024; nitrofilne – opisy wskaźnika).
// Wrzosowisko to krzewinki (warstwa C) na dobrze rozwiniętej warstwie mszysto-porostowej (D); nalot drzew – B.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup2140 =
  | 'shrub' // krzewinki: bażyna, wrzos, borówki – rdzeń „charakterystycznej kombinacji florystycznej”
  | 'lowShrub' // wierzba piaskowa – niski krzew kombinacji florystycznej
  | 'herb' // zielne kombinacji florystycznej i towarzyszące (murawa psammofilna, wydma szara, bór)
  | 'moss' // mszaki warstwy mszysto-porostowej
  | 'lichen' // porosty warstwy mszysto-porostowej
  | 'tree' // drzewa – nalot i podrost
  | 'nitrophilous' // gatunki nitrofilne (tab. 1)
  | 'alien' // obce geograficznie (inwazyjne)

export interface SpeciesEntry2140 {
  latin: string
  polish?: string
  group: SpeciesGroup2140
  /** Rodzimy gatunek ekspansywny roślin zielnych (tab. 1: piaskownica w miejscach z aktywnymi procesami eolicznymi). */
  expansive?: boolean
  /** Wymieniony w „charakterystycznej kombinacji florystycznej” (tab. 1). */
  combination?: boolean
}

export const GROUP_LABELS_2140: Record<SpeciesGroup2140, string> = {
  shrub: 'krzewinka',
  lowShrub: 'niski krzew',
  herb: 'roślina zielna',
  moss: 'mszak',
  lichen: 'porost',
  tree: 'drzewo (nalot)',
  nitrophilous: 'gatunek nitrofilny',
  alien: 'gatunek obcy inwazyjny',
}

const e = (latin: string, polish: string, group: SpeciesGroup2140, extra: Partial<SpeciesEntry2140> = {}): SpeciesEntry2140 => ({
  latin,
  polish,
  group,
  ...extra,
})
const C = { combination: true }

export const SPECIES_2140: SpeciesEntry2140[] = [
  // krzewinki – tab. 1 (bażyna i wrzos dominują przemiennie, brusznica wyróżnia podtyp 2140-2)
  e('Empetrum nigrum', 'bażyna czarna', 'shrub', C),
  e('Calluna vulgaris', 'wrzos zwyczajny', 'shrub', C),
  e('Vaccinium vitis-idaea', 'borówka brusznica', 'shrub', C),
  e('Vaccinium myrtillus', 'borówka czarna', 'shrub'),
  e('Vaccinium uliginosum', 'borówka bagienna', 'shrub'),
  // zielne kombinacji florystycznej (tab. 1) i murawy psammofilnej Helichryso-Jasionetum
  e('Salix repens subsp. arenaria', 'wierzba piaskowa', 'lowShrub', C),
  e('Salix arenaria', 'wierzba piaskowa', 'lowShrub', C),
  e('Deschampsia flexuosa', 'śmiałek pogięty', 'herb', C),
  e('Ammophila arenaria', 'piaskownica zwyczajna', 'herb', { combination: true, expansive: true }),
  e('Artemisia campestris subsp. sericea', 'bylica polna jedwabista', 'herb', C),
  e('Jasione montana', 'jasieniec piaskowy', 'herb', C),
  e('Carex arenaria', 'turzyca piaskowa', 'herb', C),
  e('Festuca rubra subsp. arenaria', 'kostrzewa czerwona piaskowa', 'herb'),
  e('Festuca rubra', 'kostrzewa czerwona', 'herb'),
  e('Hieracium umbellatum', 'jastrzębiec baldaszkowaty', 'herb'),
  e('Hieracium umbellatum var. dunense', 'jastrzębiec baldaszkowaty wydmowy', 'herb'),
  e('Corynephorus canescens', 'szczotlicha siwa', 'herb'),
  e('Helichrysum arenarium', 'kocanki piaskowe', 'herb'),
  e('Rumex acetosella', 'szczaw polny', 'herb'),
  e('Calamagrostis epigejos', 'trzcinnik piaskowy', 'herb', { expansive: true }),
  // mszaki (tab. 1, karta Czołpino)
  e('Ceratodon purpureus', 'zęboróg purpurowy', 'moss', C),
  e('Brachythecium albicans', 'krótkosz białawy', 'moss', C),
  e('Dicranum scoparium', 'widłoząb miotlasty', 'moss', C),
  e('Dicranum polysetum', 'widłoząb kędzierzawy', 'moss', C),
  e('Dicranum undulatum', 'widłoząb kędzierzawy', 'moss', C),
  e('Hypnum cupressiforme', 'rokiet cyprysowaty', 'moss', C),
  e('Pleurozium schreberi', 'rokietnik pospolity', 'moss', C),
  e('Pseudoscleropodium purum', 'brodawkowiec czysty', 'moss', C),
  e('Polytrichum piliferum', 'płonnik włosisty', 'moss'),
  // porosty (tab. 1, karta Czołpino)
  e('Cetraria aculeata', 'płucnica kolczasta', 'lichen', C),
  e('Cetraria muricata', 'płucnica darenkowa', 'lichen', C),
  e('Cladonia arbuscula', 'chrobotek leśny', 'lichen', C),
  e('Cladonia arbuscula subsp. mitis', 'chrobotek leśny łagodny', 'lichen', C),
  e('Cladonia sylvatica', 'chrobotek leśny', 'lichen', C),
  e('Cladonia chlorophaea', 'chrobotek kieliszkowy', 'lichen', C),
  e('Cladonia coccifera', 'chrobotek koralkowy', 'lichen', C),
  e('Cladonia cornuta', 'chrobotek rożkowaty', 'lichen', C),
  e('Cladonia furcata', 'chrobotek widlasty', 'lichen', C),
  e('Cladonia portentosa', 'chrobotek najeżony', 'lichen', C),
  e('Cladonia scabriuscula', 'chrobotek trocinowaty', 'lichen', C),
  e('Cladonia subulata', 'chrobotek rogokształtny', 'lichen', C),
  e('Cladonia uncialis', 'chrobotek gwiazdkowaty', 'lichen', C),
  e('Cladonia fimbriata', 'chrobotek strzępiasty', 'lichen'),
  e('Hypogymnia physodes', 'pustułka pęcherzykowata', 'lichen', C),
  e('Platismatia glauca', 'płucnik modry', 'lichen', C),
  e('Placynthiella uliginosa', 'ziarniak humusowy', 'lichen', C),
  e('Trapeliopsis granulosa', 'szarek gruzełkowaty', 'lichen'),
  e('Peltigera polydactyla', 'pawężnica palczasta', 'lichen'),
  e('Peltigera rufescens', 'pawężnica rudawa', 'lichen'),
  // drzewa – nalot i podrost (tab. 1, sprawozdania)
  e('Pinus sylvestris', 'sosna zwyczajna', 'tree'),
  e('Betula pendula', 'brzoza brodawkowata', 'tree'),
  e('Quercus robur', 'dąb szypułkowy', 'tree'),
  e('Sorbus aucuparia', 'jarząb pospolity', 'tree'),
  e('Populus tremula', 'topola osika', 'tree'),
  e('Salix caprea', 'wierzba iwa', 'tree'),
  // nitrofilne (tab. 1, karta, sprawozdania)
  e('Solidago virgaurea', 'nawłoć pospolita', 'nitrophilous'),
  e('Chamaenerion angustifolium', 'wierzbówka kiprzyca', 'nitrophilous'),
  e('Epilobium angustifolium', 'wierzbówka kiprzyca', 'nitrophilous'),
  e('Urtica urens', 'pokrzywa żegawka', 'nitrophilous'),
  e('Urtica dioica', 'pokrzywa zwyczajna', 'nitrophilous'),
  // obce inwazyjne (sprawozdania 2013–2024, tab. 3 sprawozdania 2024)
  e('Rosa rugosa', 'róża pomarszczona', 'alien'),
  e('Pinus nigra', 'sosna czarna', 'alien'),
  e('Pinus mugo', 'kosodrzewina (obca ekologicznie)', 'alien'),
  e('Padus serotina', 'czeremcha amerykańska', 'alien'),
  e('Prunus serotina', 'czeremcha amerykańska', 'alien'),
  e('Campylopus introflexus', 'krzywoszczeć przywłoka', 'alien'),
  e('Clematis vitalba', 'powojnik pnący', 'alien'),
]

const BY_NAME = new Map(SPECIES_2140.map((s) => [normalizeName(s.latin), s]))

export const findSpecies2140 = (name: string): SpeciesEntry2140 | undefined => BY_NAME.get(normalizeName(name))

export const isShrub2140 = (name: string) => findSpecies2140(name)?.group === 'shrub'
export const isBryoLichen2140 = (name: string) => {
  const g = findSpecies2140(name)?.group
  return g === 'moss' || g === 'lichen'
}
export const isTree2140 = (name: string) => findSpecies2140(name)?.group === 'tree'
export const isNitrophilous2140 = (name: string) => findSpecies2140(name)?.group === 'nitrophilous'
export const isAlien2140 = (name: string) => findSpecies2140(name)?.group === 'alien'
export const isExpansive2140 = (name: string) => !!findSpecies2140(name)?.expansive

/** Mszaki i porosty do D, drzewa i krzewy obce do B, reszta (krzewinki, zielne) do C. */
export const defaultLayer2140 = (s: SpeciesEntry2140): Layer => {
  if (s.group === 'moss' || s.group === 'lichen' || s.latin === 'Campylopus introflexus') return 'D'
  if (s.group === 'tree' || ['Rosa rugosa', 'Pinus nigra', 'Pinus mugo', 'Padus serotina', 'Prunus serotina', 'Clematis vitalba'].includes(s.latin)) return 'B'
  return 'C'
}
