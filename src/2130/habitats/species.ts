// Słownik gatunków dla *2130 (nadmorskie wydmy szare), zebrany z przewodnika GIOŚ (Braun 2010, rozdz. „Typowe gatunki
// roślin” i tab. 1), z przykładowej karty (Przebrno/Siekierki, 2008) i ze sprawozdań z monitoringu 2013–2014,
// 2016–2018 i 2023–2025 (gatunki obce – tab. 3 sprawozdania 2024). Jeden gatunek może pełnić kilka ról naraz: tab. 1
// wymienia piaskownicę i wśród gatunków charakterystycznych („przechodzące z innych zbiorowisk”), i wśród ekspansywnych,
// a stokłosę miękką – wśród ekspansywnych i nitrofilnych. Dlatego role są flagami, a nie jedną grupą.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type Role2130 =
  | 'characteristic' // charakterystyczna kombinacja florystyczna – rośliny zielne (tab. 1) + kocanki
  | 'cryptogam' // porosty i mszaki warstwy D
  | 'expansive' // rodzime gatunki ekspansywne roślin zielnych (tab. 1)
  | 'nitrophilous' // gatunki nitrofilne (tab. 1)
  | 'alien' // obce gatunki inwazyjne (sprawozdania 2014–2024)
  | 'tree' // nalot drzew (tab. 1)
  | 'shrub' // krzewy i krzewinki (tab. 1)
  | 'companion' // inne gatunki wydm i muraw

export interface SpeciesEntry2130 {
  latin: string
  polish?: string
  roles: Role2130[]
}

export const ROLE_LABELS_2130: Record<Role2130, string> = {
  characteristic: 'gatunek charakterystyczny 2130',
  cryptogam: 'porost/mszak',
  expansive: 'rodzimy gatunek ekspansywny',
  nitrophilous: 'gatunek nitrofilny',
  alien: 'gatunek obcy inwazyjny',
  tree: 'drzewo (nalot)',
  shrub: 'krzew/krzewinka',
  companion: 'gatunek towarzyszący',
}

const e = (latin: string, polish: string, ...roles: Role2130[]): SpeciesEntry2130 => ({ latin, polish, roles })

export const SPECIES_2130: SpeciesEntry2130[] = [
  // charakterystyczna kombinacja florystyczna (tab. 1): odmiany nadmorskie + gatunki przechodzące z innych zbiorowisk
  e('Jasione montana', 'jasieniec piaskowy', 'characteristic'),
  e('Jasione montana var. litoralis', 'jasieniec piaskowy nadmorski', 'characteristic'),
  e('Hieracium umbellatum', 'jastrzębiec baldaszkowaty', 'characteristic'),
  e('Hieracium umbellatum subsp. dunense', 'jastrzębiec baldaszkowaty nadmorski', 'characteristic'),
  e('Hieracium umbellatum var. linariifolium', 'jastrzębiec baldaszkowaty nadmorski', 'characteristic'),
  e('Viola tricolor subsp. maritima', 'fiołek trójbarwny nadmorski', 'characteristic'),
  e('Viola tricolor subsp. curtisii', 'fiołek trójbarwny nadmorski', 'characteristic'),
  e('Artemisia campestris subsp. sericea', 'bylica polna nadmorska', 'characteristic'),
  e('Helichrysum arenarium', 'kocanki piaskowe', 'characteristic'),
  e('Carex arenaria', 'turzyca piaskowa', 'characteristic'),
  e('Corynephorus canescens', 'szczotlicha siwa', 'characteristic'),
  e('Ammophila arenaria', 'piaskownica zwyczajna', 'characteristic', 'expansive'),
  // inne gatunki muraw psammofilnych (rozdz. 4 przewodnika, karta)
  e('Artemisia campestris', 'bylica polna', 'companion'),
  e('Festuca polesica', 'kostrzewa poleska', 'companion'),
  e('Festuca rubra subsp. arenaria', 'kostrzewa czerwona piaskowa', 'companion'),
  e('Festuca rubra subsp. litoralis', 'kostrzewa czerwona nadmorska', 'companion'),
  e('Festuca ovina', 'kostrzewa owcza', 'companion'),
  e('Lathyrus japonicus subsp. maritimus', 'groszek nadmorski', 'companion'),
  e('Eryngium maritimum', 'mikołajek nadmorski', 'companion'),
  e('Linaria odora', 'lnica wonna', 'companion'),
  e('Epipactis atrorubens', 'kruszczyk rdzawoczerwony', 'companion'),
  e('Sedum acre', 'rozchodnik ostry', 'companion'),
  e('Cerastium semidecandrum', 'rogownica pięciopręcikowa', 'companion'),
  e('Vicia hirsuta', 'wyka drobnokwiatowa', 'companion'),
  e('Polypodium vulgare', 'paprotka zwyczajna', 'companion'),
  e('Leymus arenarius', 'wydmuchrzyca piaskowa', 'companion'),
  e('× Calammophila baltica', 'trzcinnikownica bałtycka', 'companion'),
  e('Calamagrostis epigejos', 'trzcinnik piaskowy', 'companion'),
  e('Rumex acetosella', 'szczaw polny', 'companion'),
  // rodzime gatunki ekspansywne roślin zielnych (tab. 1)
  e('Aira praecox', 'śmiałka wczesna', 'expansive'),
  e('Bromus hordeaceus', 'stokłosa miękka', 'expansive', 'nitrophilous'),
  e('Luzula campestris', 'kosmatka polna', 'expansive'),
  e('Deschampsia flexuosa', 'śmiałek pogięty', 'expansive'),
  // gatunki nitrofilne (tab. 1)
  e('Artemisia vulgaris', 'bylica pospolita', 'nitrophilous'),
  e('Achillea millefolium', 'krwawnik pospolity', 'nitrophilous'),
  e('Conyza canadensis', 'przymiotno kanadyjskie', 'nitrophilous', 'alien'),
  e('Cardaminopsis arenosa', 'rzeżusznik piaskowy', 'nitrophilous'),
  e('Senecio viscosus', 'starzec lepki', 'nitrophilous'),
  e('Senecio sylvaticus', 'starzec leśny', 'nitrophilous'),
  e('Senecio vernalis', 'starzec wiosenny', 'nitrophilous', 'alien'),
  e('Senecio vulgaris', 'starzec zwyczajny', 'nitrophilous'),
  e('Rumex tenuifolius', 'szczaw wąskolistny', 'nitrophilous'),
  e('Anthoxanthum odoratum', 'tomka wonna', 'nitrophilous'),
  e('Chamaenerion angustifolium', 'wierzbówka kiprzyca', 'nitrophilous'),
  e('Oenothera biennis', 'wiesiołek dwuletni', 'nitrophilous'),
  e('Tanacetum vulgare', 'wrotycz pospolity', 'nitrophilous'),
  e('Solidago virgaurea', 'nawłoć pospolita', 'nitrophilous'),
  e('Urtica urens', 'pokrzywa żegawka', 'nitrophilous'),
  // obce gatunki inwazyjne (sprawozdania 2014–2024, tab. 3 z 2024)
  e('Rosa rugosa', 'róża pomarszczona', 'alien', 'shrub'),
  e('Salix acutifolia', 'wierzba ostrolistna', 'alien', 'shrub'),
  e('Elaeagnus commutata', 'oliwnik srebrzysty', 'alien', 'shrub'),
  e('Acer negundo', 'klon jesionolistny', 'alien', 'tree'),
  e('Pinus nigra', 'sosna czarna', 'alien', 'tree'),
  e('Padus serotina', 'czeremcha amerykańska', 'alien', 'tree'),
  // nalot drzew (tab. 1, sprawozdanie 2024)
  e('Pinus sylvestris', 'sosna zwyczajna', 'tree'),
  e('Betula pendula', 'brzoza brodawkowata', 'tree'),
  e('Quercus robur', 'dąb szypułkowy', 'tree'),
  e('Sorbus aucuparia', 'jarząb pospolity', 'tree'),
  e('Populus tremula', 'topola osika', 'tree'),
  e('Salix caprea', 'wierzba iwa', 'tree'),
  e('Acer platanoides', 'klon zwyczajny', 'tree'),
  e('Acer pseudoplatanus', 'klon jawor', 'tree'),
  // krzewy i krzewinki (tab. 1, sprawozdanie 2024)
  e('Calluna vulgaris', 'wrzos zwyczajny', 'shrub'),
  e('Empetrum nigrum', 'bażyna czarna', 'shrub'),
  e('Vaccinium vitis-idaea', 'borówka brusznica', 'shrub'),
  e('Vaccinium myrtillus', 'borówka czarna', 'shrub'),
  e('Salix daphnoides', 'wierzba wawrzynkowa', 'shrub'),
  e('Salix repens subsp. arenaria', 'wierzba piaskowa', 'shrub'),
  e('Pinus mugo', 'kosodrzewina', 'shrub'),
  e('Rubus caesius', 'jeżyna popielica', 'shrub'),
  // porosty i mszaki (tab. 1, rozdz. 4, karta)
  e('Cladonia arbuscula subsp. mitis', 'chrobotek łagodny', 'cryptogam'),
  e('Cladonia chlorophaea', 'chrobotek kieliszkowaty', 'cryptogam'),
  e('Cladonia cornuta', 'chrobotek różowaty', 'cryptogam'),
  e('Cladonia fimbriata', 'chrobotek strzępiasty', 'cryptogam'),
  e('Cladonia foliacea', 'chrobotek rosochaty', 'cryptogam'),
  e('Cladonia furcata', 'chrobotek widlasty', 'cryptogam'),
  e('Cladonia glauca', 'chrobotek siwy', 'cryptogam'),
  e('Cladonia gracilis', 'chrobotek wysmukły', 'cryptogam'),
  e('Cladonia portentosa', 'chrobotek najeżony', 'cryptogam'),
  e('Cladonia macilenta subsp. floerkeana', 'chrobotek Floerkego', 'cryptogam'),
  e('Cladonia scabriuscula', 'chrobotek trocinowaty', 'cryptogam'),
  e('Cladonia subulata', 'chrobotek rogokształtny', 'cryptogam'),
  e('Cladonia pyxidata', 'chrobotek kubkowaty', 'cryptogam'),
  e('Cladonia rangiformis', 'chrobotek reniferowy', 'cryptogam'),
  e('Cetraria muricata', 'płucnica darenkowata', 'cryptogam'),
  e('Coelocaulon aculeatum', 'płucnica darenkowata', 'cryptogam'),
  e('Hypogymnia physodes', 'pustułka pęcherzykowata', 'cryptogam'),
  e('Peltigera rufescens', 'pawężnica', 'cryptogam'),
  e('Cephaloziella divaricata', 'główkowiec rozwidlony', 'cryptogam'),
  e('Brachythecium albicans', 'krótkosz bielejący', 'cryptogam'),
  e('Ceratodon purpureus', 'zęboróg purpurowy', 'cryptogam'),
  e('Dicranum polysetum', 'widłoząb kędzierzawy', 'cryptogam'),
  e('Dicranum scoparium', 'widłoząb miotlasty', 'cryptogam'),
  e('Pleurozium schreberi', 'rokietnik pospolity', 'cryptogam'),
  e('Pohlia nutans', 'knotnik zwisły', 'cryptogam'),
  e('Racomitrium canescens', 'skalniczek siwy', 'cryptogam'),
  e('Hypnum cupressiforme var. ericetorum', 'rokiet cyprysowaty', 'cryptogam'),
  e('Pseudoscleropodium purum', 'mszar właściwy', 'cryptogam'),
  e('Plagiomnium affine', 'płaskomerzyk pokrewny', 'cryptogam'),
]

const BY_NAME = new Map(SPECIES_2130.map((s) => [normalizeName(s.latin), s]))

/** Dwa pierwsze człony nazwy (rodzaj + gatunek): „Hieracium umbellatum var. dunense” → „hieracium umbellatum”. */
export const binomial2130 = (name: string) => normalizeName(name).replace(/^x /, '').split(' ').slice(0, 2).join(' ')

/** Szukanie w katalogu: pełna nazwa, z „×” i bez, a potem sam rodzaj + gatunek (odmiany i podgatunki spoza katalogu). */
export const findSpecies2130 = (name: string): SpeciesEntry2130 | undefined => {
  const n = normalizeName(name)
  return BY_NAME.get(n) ?? BY_NAME.get(`x ${n}`) ?? BY_NAME.get(n.replace(/^x /, '')) ?? BY_NAME.get(binomial2130(name))
}

export const hasRole2130 = (name: string, role: Role2130) => !!findSpecies2130(name)?.roles.includes(role)

/** Warstwa przy dodawaniu do zdjęcia: porosty i mszaki – D, drzewa i krzewy – B, reszta (z krzewinkami) – C. */
export function defaultLayer2130(s: SpeciesEntry2130): Layer {
  if (s.roles.includes('cryptogam')) return 'D'
  if (['Calluna vulgaris', 'Empetrum nigrum', 'Vaccinium vitis-idaea', 'Vaccinium myrtillus', 'Rubus caesius'].includes(s.latin)) return 'C'
  if (s.roles.includes('tree') || s.roles.includes('shrub')) return 'B'
  return 'C'
}
