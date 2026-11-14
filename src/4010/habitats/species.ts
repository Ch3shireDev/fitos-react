// Słownik gatunków dla 4010 (wilgotne wrzosowiska z wrzoścem bagiennym), zebrany z przewodnika GIOŚ (Pawlaczyk 2012,
// rozdz. „Typowe gatunki roślin”, tab. 1 i przykładowa karta Gniewoszyce 2011) oraz ze sprawozdań z monitoringu
// 2009–2011, 2015–2018 i 2020–2021 (gatunki ekspansywne i obce – opisy wskaźników w sprawozdaniu 2021).
// Wrzosowisko to krzewinki i zielne (warstwa C) na warstwie mszystej (D); nalot drzew i krzewów – B.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup4010 =
  | 'shrub' // krzewinki: wrzosiec, wrzos, borówki, żurawina, modrzewnica
  | 'herb' // rośliny zielne (w tym trawy, turzyce, sity, rosiczki)
  | 'moss' // mchy właściwe i torfowce
  | 'liverwort' // wątrobowce
  | 'lichen' // porosty
  | 'tree' // drzewa i krzewy zarastające wrzosowisko (warstwa B)
  | 'alien' // obce geograficznie

export interface SpeciesEntry4010 {
  latin: string
  polish?: string
  group: SpeciesGroup4010
  /** Gatunek atlantycki/subatlantycki wymieniony w opisie siedliska (pkt 3 przewodnika). */
  atlantic?: boolean
  /** Rodzimy gatunek ekspansywny (apofit): jeżyny (tab. 1), trzęślica, trzcina, tojeść (sprawozdanie 2021). */
  expansive?: boolean
  /** Przykład gatunku kluczowego, lokalnie typowego dla siedliska (tab. 1 i sprawozdanie 2021). */
  key?: boolean
}

export const GROUP_LABELS_4010: Record<SpeciesGroup4010, string> = {
  shrub: 'krzewinka',
  herb: 'roślina zielna',
  moss: 'mszak',
  liverwort: 'wątrobowiec',
  lichen: 'porost',
  tree: 'drzewo lub krzew (zarastanie)',
  alien: 'gatunek obcy geograficznie',
}

const e = (latin: string, polish: string, group: SpeciesGroup4010, extra: Partial<SpeciesEntry4010> = {}): SpeciesEntry4010 => ({
  latin,
  polish,
  group,
  ...extra,
})
const A = { atlantic: true }
const K = { key: true }
const X = { expansive: true }

export const SPECIES_4010: SpeciesEntry4010[] = [
  // krzewinki (pkt 4 przewodnika)
  e('Erica tetralix', 'wrzosiec bagienny', 'shrub', A),
  e('Calluna vulgaris', 'wrzos zwyczajny', 'shrub'),
  e('Vaccinium vitis-idaea', 'borówka brusznica', 'shrub'),
  e('Vaccinium myrtillus', 'borówka czarna', 'shrub'),
  e('Vaccinium uliginosum', 'borówka bagienna', 'shrub'),
  e('Oxycoccus palustris', 'żurawina błotna', 'shrub'),
  e('Andromeda polifolia', 'modrzewnica zwyczajna', 'shrub', K),
  e('Empetrum nigrum', 'bażyna czarna', 'shrub'),
  e('Myrica gale', 'woskownica europejska', 'shrub', A),
  // zielne
  e('Baeothryon cespitosum', 'wełnianeczka darniowa', 'herb', { atlantic: true, key: true }),
  e('Baeothryon cespitosum subsp. germanicum', 'wełnianeczka darniowa niemiecka', 'herb', { atlantic: true, key: true }),
  e('Trichophorum cespitosum', 'wełnianeczka darniowa', 'herb', { atlantic: true, key: true }),
  e('Juncus squarrosus', 'sit sztywny', 'herb', A),
  e('Eriophorum angustifolium', 'wełnianka wąskolistna', 'herb'),
  e('Carex nigra', 'turzyca pospolita', 'herb'),
  e('Carex panicea', 'turzyca prosowata', 'herb'),
  e('Carex pilulifera', 'turzyca pigułkowata', 'herb'),
  e('Carex limosa', 'turzyca bagienna', 'herb', K),
  e('Potentilla erecta', 'pięciornik kurze ziele', 'herb'),
  e('Danthonia decumbens', 'izgrzyca przyziemna', 'herb'),
  e('Nardus stricta', 'bliźniczka psia trawka', 'herb'),
  e('Drosera rotundifolia', 'rosiczka okrągłolistna', 'herb', K),
  e('Drosera intermedia', 'rosiczka pośrednia', 'herb', K),
  e('Rhynchospora fusca', 'przygiełka brunatna', 'herb', K),
  e('Rhynchospora alba', 'przygiełka biała', 'herb', K),
  e('Rubus chamaemorus', 'malina moroszka', 'herb', K),
  // rodzime gatunki ekspansywne (tab. 1: jeżyny; sprawozdanie 2021: trzęślica, trzcina, tojeść)
  e('Molinia caerulea', 'trzęślica modra', 'herb', X),
  e('Phragmites australis', 'trzcina pospolita', 'herb', X),
  e('Lysimachia vulgaris', 'tojeść zwyczajna', 'herb', X),
  e('Calamagrostis epigejos', 'trzcinnik piaskowy', 'herb', X),
  e('Rubus sp.', 'jeżyna', 'shrub', X),
  e('Rubus spp.', 'jeżyny', 'shrub', X),
  e('Rubus plicatus', 'jeżyna fałdowana', 'shrub', X),
  // mszaki
  e('Sphagnum molle', 'torfowiec miękki', 'moss', { atlantic: true, key: true }),
  e('Sphagnum papillosum', 'torfowiec brodawkowaty', 'moss', { atlantic: true, key: true }),
  e('Sphagnum compactum', 'torfowiec szorstki', 'moss', { atlantic: true, key: true }),
  e('Sphagnum tenellum', 'torfowiec cieniutki', 'moss', { atlantic: true, key: true }),
  e('Sphagnum denticulatum', 'torfowiec ząbkowany', 'moss', K),
  e('Sphagnum sp.', 'torfowiec', 'moss'),
  e('Hypnum cupressiforme', 'rokiet cyprysowaty', 'moss'),
  e('Hypnum jutlandicum', 'rokiet jutlandzki', 'moss'),
  e('Aulacomnium palustre', 'próchniczek błotny', 'moss'),
  e('Pleurozium schreberi', 'rokietnik pospolity', 'moss'),
  e('Polytrichum juniperinum', 'płonnik jałowcowaty', 'moss'),
  e('Polytrichum piliferum', 'płonnik włosowy', 'moss'),
  e('Polytrichum strictum', 'płonnik cienki', 'moss'),
  e('Dicranum scoparium', 'widłoząb miotlasty', 'moss'),
  e('Odontoschisma sphagni', 'wątrobowiec Odontoschisma sphagni', 'liverwort', A),
  e('Gymnocolea inflata', 'wątrobowiec Gymnocolea inflata', 'liverwort', A),
  e('Cladonia portentosa', 'chrobotek najeżony', 'lichen', A),
  e('Cladina portentosa', 'chrobotek najeżony', 'lichen', A),
  e('Cladonia incrassata', 'chrobotek zgrubiały', 'lichen', A),
  // drzewa i krzewy zarastające wrzosowisko (karta Gniewoszyce, sprawozdanie 2021)
  e('Pinus sylvestris', 'sosna zwyczajna', 'tree'),
  e('Betula pendula', 'brzoza brodawkowata', 'tree'),
  e('Betula pubescens', 'brzoza omszona', 'tree'),
  e('Picea abies', 'świerk pospolity', 'tree'),
  e('Alnus glutinosa', 'olsza czarna', 'tree'),
  e('Populus tremula', 'topola osika', 'tree'),
  e('Frangula alnus', 'kruszyna pospolita', 'tree'),
  e('Salix aurita', 'wierzba uszata', 'tree'),
  e('Salix cinerea', 'wierzba szara', 'tree'),
  // obce geograficznie (sprawozdanie 2021)
  e('Campylopus introflexus', 'krzywoszczeć przywłoka', 'alien'),
  e('Solidago canadensis', 'nawłoć kanadyjska', 'alien'),
  e('Solidago gigantea', 'nawłoć późna', 'alien'),
  e('Padus serotina', 'czeremcha amerykańska', 'alien'),
  e('Prunus serotina', 'czeremcha amerykańska', 'alien'),
  e('Pinus strobus', 'sosna wejmutka', 'alien'),
  e('Quercus rubra', 'dąb czerwony', 'alien'),
]

const BY_NAME = new Map(SPECIES_4010.map((s) => [normalizeName(s.latin), s]))

export const findSpecies4010 = (name: string): SpeciesEntry4010 | undefined => BY_NAME.get(normalizeName(name))

export const isTree4010 = (name: string) => findSpecies4010(name)?.group === 'tree'
export const isAlien4010 = (name: string) => findSpecies4010(name)?.group === 'alien'
export const isExpansive4010 = (name: string) => !!findSpecies4010(name)?.expansive
export const isKey4010 = (name: string) => !!findSpecies4010(name)?.key

const WOODY_ALIENS = ['Padus serotina', 'Prunus serotina', 'Pinus strobus', 'Quercus rubra']

/** Mszaki i porosty do D, drzewa i krzewy (też obce drzewiaste) do B, reszta (krzewinki, zielne, jeżyny) do C. */
export const defaultLayer4010 = (s: SpeciesEntry4010): Layer => {
  if (s.group === 'moss' || s.group === 'liverwort' || s.group === 'lichen' || s.latin === 'Campylopus introflexus') return 'D'
  if (s.group === 'tree' || WOODY_ALIENS.includes(s.latin)) return 'B'
  return 'C'
}
