// Słownik gatunków dla 3270 (zalewane muliste brzegi rzek, Bidention tripartiti i Chenopodion fluviatile), zebrany
// z przewodnika GIOŚ (Nobis 2015, rozdz. „Typowe gatunki roślin” i tab. 1), z przykładowej karty (Sandomierz, 2013)
// i ze sprawozdań z monitoringu 2013–2014, 2016 i 2023–2024. Wszystko roślinność zielna jednoroczna – w zdjęciu warstwa C
// (siewki wierzb też C).
//
// Grupy:
//  • characteristic – 16 gatunków charakterystycznych z tab. 1 (Bidention, Chenopodion fluviatile, Nanocyperion),
//  • local          – gatunki lokalnie charakterystyczne (uczep śląski na zachodzie, komosa ostroklapowa na NE) – liczą się jak wyżej,
//  • companion      – „stały udział” gatunków upraw okopowych (chwastnica jednostronna) – typowe, ale nie charakterystyczne,
//  • expansive      – rodzime gatunki ekspansywne (tab. 1: trzcina, mozga; sprawozdanie 2016: mietlica rozłogowa),
//  • invasive       – obce gatunki inwazyjne (tab. 1 i najczęstsze ze sprawozdań),
//  • other          – pozostałe (ruderalne, łąkowe, szuwarowe, siewki drzew) – „ekologicznie obce” przy dominantach.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup3270 = 'characteristic' | 'local' | 'companion' | 'expansive' | 'invasive' | 'other'

export interface SpeciesEntry3270 {
  latin: string
  polish?: string
  group: SpeciesGroup3270
  /** Synonimy nomenklaturowe (stare i nowe nazwy rodzajowe) – liczone jako ten sam gatunek. */
  synonyms?: string[]
}

export const GROUP_LABELS_3270: Record<SpeciesGroup3270, string> = {
  characteristic: 'gatunek charakterystyczny (tab. 1)',
  local: 'gatunek lokalnie charakterystyczny',
  companion: 'gatunek towarzyszący typowy (upraw okopowych)',
  expansive: 'rodzimy gatunek ekspansywny',
  invasive: 'obcy gatunek inwazyjny',
  other: 'gatunek ekologicznie obcy dla siedliska',
}

const e = (latin: string, polish: string, group: SpeciesGroup3270, ...synonyms: string[]): SpeciesEntry3270 => ({
  latin,
  polish,
  group,
  ...(synonyms.length ? { synonyms } : {}),
})

export const SPECIES_3270: SpeciesEntry3270[] = [
  // gatunki charakterystyczne – tab. 1, w kolejności przewodnika
  e('Alopecurus aequalis', 'wyczyniec czerwonożółty', 'characteristic'),
  e('Bidens tripartita', 'uczep trójlistkowy', 'characteristic'),
  e('Bidens cernua', 'uczep zwisły', 'characteristic'),
  e('Chenopodium ficifolium', 'komosa jesienna', 'characteristic'),
  e('Chenopodium polyspermum', 'komosa wielonasienna', 'characteristic', 'Lipandra polysperma'),
  e('Chenopodium rubrum', 'komosa czerwona', 'characteristic', 'Oxybasis rubra'),
  e('Polygonum hydropiper', 'rdest ostrogorzki', 'characteristic', 'Persicaria hydropiper'),
  e('Polygonum lapathifolium', 'rdest szczawiolistny', 'characteristic', 'Persicaria lapathifolia', 'Polygonum lapathifolium s.l.'),
  e('Polygonum minus', 'rdest mniejszy', 'characteristic', 'Persicaria minor'),
  e('Ranunculus sceleratus', 'jaskier jadowity', 'characteristic'),
  e('Rorippa palustris', 'rzepicha błotna', 'characteristic'),
  e('Atriplex prostrata', 'łoboda oszczepowata', 'characteristic', 'Atriplex hastata', 'Atriplex prostrata typowa'),
  e('Chenopodium glaucum', 'komosa sina', 'characteristic', 'Oxybasis glauca'),
  e('Polygonum amphibium', 'rdest ziemnowodny', 'characteristic', 'Persicaria amphibia'),
  e('Rumex maritimus', 'szczaw nadmorski', 'characteristic'),
  e('Cyperus fuscus', 'cibora brunatna', 'characteristic'),
  e('Gnaphalium uliginosum', 'szarota błotna', 'characteristic', 'Filaginella uliginosa'),
  e('Juncus bufonius', 'sit dwudzielny', 'characteristic'),
  e('Limosella aquatica', 'namulnik brzegowy', 'characteristic'),
  e('Plantago intermedia', 'babka wielonasienna', 'characteristic', 'Plantago major subsp. intermedia', 'Plantago uliginosa'),
  e('Potentilla supina', 'pięciornik niski', 'characteristic'),
  // lokalnie charakterystyczne
  e('Bidens radiata', 'uczep śląski', 'local'),
  e('Chenopodium acerifolium', 'komosa ostroklapowa', 'local'),
  // stały udział gatunków upraw okopowych
  e('Echinochloa crus-galli', 'chwastnica jednostronna', 'companion'),
  // rodzime gatunki ekspansywne
  e('Phalaris arundinacea', 'mozga trzcinowata', 'expansive'),
  e('Phragmites australis', 'trzcina pospolita', 'expansive'),
  e('Agrostis stolonifera', 'mietlica rozłogowa', 'expansive'),
  // obce gatunki inwazyjne – tab. 1
  e('Bidens frondosa', 'uczep amerykański', 'invasive'),
  e('Eragrostis albensis', 'miłka połabska', 'invasive'),
  e('Echinocystis lobata', 'kolczurka klapowana', 'invasive'),
  e('Impatiens glandulifera', 'niecierpek gruczołowaty', 'invasive'),
  e('Xanthium albinum', 'rzepień włoski (brzegowy)', 'invasive', 'Xanthium riparium'),
  e('Xanthium spinosum', 'rzepień kolczysty', 'invasive'),
  e('Xanthium strumarium', 'rzepień pospolity', 'invasive'),
  // obce gatunki inwazyjne – najczęstsze w sprawozdaniach 2013–2016
  e('Solidago gigantea', 'nawłoć późna', 'invasive'),
  e('Solidago canadensis', 'nawłoć kanadyjska', 'invasive'),
  e('Conyza canadensis', 'przymiotno kanadyjskie', 'invasive', 'Erigeron canadensis'),
  e('Acer negundo', 'klon jesionolistny', 'invasive'),
  e('Aster lanceolatus', 'aster lancetowaty', 'invasive', 'Symphyotrichum lanceolatum'),
  e('Galinsoga parviflora', 'żółtlica drobnokwiatowa', 'invasive'),
  e('Galinsoga quadriradiata', 'żółtlica owłosiona', 'invasive', 'Galinsoga ciliata'),
  e('Amaranthus retroflexus', 'szarłat szorstki', 'invasive'),
  e('Erigeron annuus', 'przymiotno białe', 'invasive'),
  e('Reynoutria japonica', 'rdestowiec ostrokończysty', 'invasive', 'Fallopia japonica'),
  // pozostałe – częste w zdjęciach z namulisk, ekologicznie obce dla siedliska
  e('Capsella bursa-pastoris', 'tasznik pospolity', 'other'),
  e('Chenopodium album', 'komosa biała', 'other'),
  e('Matricaria maritima subsp. inodora', 'maruna bezwonna', 'other', 'Matricaria maritima ssp. inodora', 'Tripleurospermum inodorum', 'Matricaria maritima'),
  e('Plantago major', 'babka zwyczajna', 'other'),
  e('Polygonum aviculare', 'rdest ptasi', 'other'),
  e('Rorippa amphibia', 'rzepicha ziemnowodna', 'other'),
  e('Urtica dioica', 'pokrzywa zwyczajna', 'other'),
  e('Salix alba', 'wierzba biała (siewki)', 'other'),
  e('Artemisia vulgaris', 'bylica pospolita', 'other'),
  e('Tanacetum vulgare', 'wrotycz pospolity', 'other'),
  e('Lythrum salicaria', 'krwawnica pospolita', 'other'),
  e('Rumex obtusifolius', 'szczaw tępolistny', 'other'),
  e('Lycopus europaeus', 'karbieniec pospolity', 'other'),
  e('Mentha aquatica', 'mięta nadwodna', 'other'),
]

const BY_NAME = new Map<string, SpeciesEntry3270>()
for (const s of SPECIES_3270) for (const n of [s.latin, ...(s.synonyms ?? [])]) BY_NAME.set(normalizeName(n), s)

export const findSpecies3270 = (name: string): SpeciesEntry3270 | undefined => BY_NAME.get(normalizeName(name))

/** Klucz gatunku (nazwa akceptowana) – synonimy liczą się raz. */
export const speciesKey3270 = (name: string) => findSpecies3270(name)?.latin ?? normalizeName(name)

/** Gatunek charakterystyczny tab. 1 albo lokalnie charakterystyczny – liczy się do wskaźnika „Gatunki charakterystyczne”. */
export const isCharacteristic3270 = (name: string) => {
  const g = findSpecies3270(name)?.group
  return g === 'characteristic' || g === 'local'
}

/** Typowy dla siedliska przy ocenie dominantów: charakterystyczny, lokalnie charakterystyczny albo stały towarzysz (chwastnica). */
export const isTypical3270 = (name: string) => {
  const g = findSpecies3270(name)?.group
  return g === 'characteristic' || g === 'local' || g === 'companion'
}

/** Wszystko w warstwie C – jednoroczne zbiorowiska namulisk (siewki wierzb też w C). */
export const defaultLayer3270 = (_s: SpeciesEntry3270): Layer => 'C'
