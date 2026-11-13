// Słownik gatunków dla 2170 (nadmorskie wydmy z zaroślami wierzby piaskowej), zebrany z przewodnika GIOŚ (Lemke 2012,
// rozdz. „Typowe gatunki roślin”, tab. 1), z przykładowej karty (Helskie Wydmy 1, 2010) i ze sprawozdań z monitoringu
// 2009–2011, 2016 i 2021. Siedlisko to kępy wierzby piaskowej (warstwa B) w kompleksie wydm białych i szarych – runo
// z gatunkami Elymo-Ammophiletum i Helichryso-Jasionetum (warstwa C).
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup2170 =
  | 'willow' // wierzba piaskowa – gatunek budujący siedlisko (z synonimami)
  | 'characteristic' // pozostałe gatunki z tab. 1: trawy wydm białych i gatunki wydmy szarej
  | 'companion' // inne gatunki wydm nadmorskich ze sprawozdań
  | 'expansive' // ekspansywne gatunki drzew i krzewów z tab. 1 (rodzime)
  | 'alien' // obce geograficznie

export interface SpeciesEntry2170 {
  latin: string
  polish?: string
  group: SpeciesGroup2170
}

export const GROUP_LABELS_2170: Record<SpeciesGroup2170, string> = {
  willow: 'gatunek budujący 2170',
  characteristic: 'gatunek charakterystyczny 2170',
  companion: 'gatunek towarzyszący',
  expansive: 'gatunek ekspansywny drzew i krzewów',
  alien: 'gatunek obcy geograficznie',
}

const e = (latin: string, polish: string, group: SpeciesGroup2170): SpeciesEntry2170 => ({ latin, polish, group })

export const SPECIES_2170: SpeciesEntry2170[] = [
  // wierzba piaskowa i jej synonimy (przewodnik: Salix arenaria = S. repens subsp. arenaria; raporty UK: subsp. argentea)
  e('Salix arenaria', 'wierzba piaskowa', 'willow'),
  e('Salix repens subsp. arenaria', 'wierzba piaskowa', 'willow'),
  e('Salix repens subsp. argentea', 'wierzba piaskowa', 'willow'),
  e('Salix repens', 'wierzba płożąca', 'willow'),
  // tab. 1: gatunki diagnostyczne wydm białych i szarych
  e('Ammophila arenaria', 'piaskownica zwyczajna', 'characteristic'),
  e('Carex arenaria', 'turzyca piaskowa', 'characteristic'),
  e('Festuca rubra', 'kostrzewa czerwona', 'characteristic'),
  e('Festuca rubra subsp. arenaria', 'kostrzewa czerwona piaskowa', 'characteristic'),
  e('Jasione montana', 'jasieniec piaskowy', 'characteristic'),
  e('Lathyrus japonicus', 'groszek nadmorski', 'characteristic'),
  e('Lathyrus japonicus subsp. maritimus', 'groszek nadmorski', 'characteristic'),
  e('Hieracium umbellatum', 'jastrzębiec baldaszkowaty', 'characteristic'),
  e('Hieracium umbellatum var. linariifolium', 'jastrzębiec baldaszkowaty', 'characteristic'),
  e('Artemisia campestris', 'bylica polna', 'characteristic'),
  e('Artemisia campestris var. sericea', 'bylica polna', 'characteristic'),
  // towarzyszące – wydmy białe i szare, bór bażynowy (sprawozdania 2010, 2016, 2021)
  e('Leymus arenarius', 'wydmuchrzyca piaskowa', 'companion'),
  e('Elymus arenarius', 'wydmuchrzyca piaskowa', 'companion'),
  e('× Calammophila baltica', 'trzcinnikownica bałtycka', 'companion'),
  e('Festuca villosa', 'kostrzewa kosmata', 'companion'),
  e('Helichrysum arenarium', 'kocanki piaskowe', 'companion'),
  e('Corynephorus canescens', 'szczotlicha siwa', 'companion'),
  e('Empetrum nigrum', 'bażyna czarna', 'companion'),
  e('Calluna vulgaris', 'wrzos zwyczajny', 'companion'),
  e('Hypochaeris radicata', 'prosienicznik szorstki', 'companion'),
  e('Sedum acre', 'rozchodnik ostry', 'companion'),
  e('Thymus serpyllum', 'macierzanka piaskowa', 'companion'),
  e('Viola tricolor subsp. curtisii', 'fiołek nadmorski', 'companion'),
  e('Eryngium maritimum', 'mikołajek nadmorski', 'companion'),
  e('Deschampsia flexuosa', 'śmiałek pogięty', 'companion'),
  e('Polypodium vulgare', 'paprotka zwyczajna', 'companion'),
  // ekspansywne gatunki drzew i krzewów (tab. 1; „Salix acutiformis” w przewodniku to literówka – S. acutifolia)
  e('Pinus sylvestris', 'sosna zwyczajna', 'expansive'),
  e('Populus tremula', 'topola osika', 'expansive'),
  e('Salix daphnoides', 'wierzba wawrzynkowa', 'expansive'),
  e('Salix acutifolia', 'wierzba ostrolistna', 'expansive'),
  e('Rosa rugosa', 'róża pomarszczona', 'expansive'),
  // obce geograficznie spoza tab. 1 (sprawozdanie 2016 i 2021, tab. 3)
  e('Conyza canadensis', 'przymiotno kanadyjskie', 'alien'),
]

const BY_NAME = new Map(SPECIES_2170.map((s) => [normalizeName(s.latin), s]))

/** Szukanie w katalogu – z „×” i bez, „Salix acutiformis” (literówka przewodnika) jako S. acutifolia. */
export const findSpecies2170 = (name: string): SpeciesEntry2170 | undefined => {
  const n = normalizeName(name)
  if (n === normalizeName('Salix acutiformis')) return BY_NAME.get(normalizeName('Salix acutifolia'))
  return BY_NAME.get(n) ?? BY_NAME.get(`x ${n}`) ?? BY_NAME.get(n.replace(/^x /, ''))
}

export const isWillow2170 = (name: string) => findSpecies2170(name)?.group === 'willow'
/** Gatunek typowy z tab. 1: wierzba piaskowa i 7 gatunków wydm białych i szarych (z odmianami). */
export const isCharacteristic2170 = (name: string) => {
  const g = findSpecies2170(name)?.group
  return g === 'willow' || g === 'characteristic'
}
export const isExpansive2170 = (name: string) => findSpecies2170(name)?.group === 'expansive'

/** Drzewa i krzewy (wierzba piaskowa, ekspansywne) do warstwy B, reszta do C. */
export const defaultLayer2170 = (s: SpeciesEntry2170): Layer => (s.group === 'willow' || s.group === 'expansive' ? 'B' : 'C')
