// Słownik gatunków dla 2330 (wydmy śródlądowe z murawami napiaskowymi), zebrany z przewodnika GIOŚ (Kulpiński, Tyc 2012,
// rozdz. „Typowe gatunki roślin” i tab. 1), z przykładowej karty (Chechło 2, 2011) i ze sprawozdań z monitoringu
// 2009–2011, 2016–2018 i 2023–2025 (gatunki obce – tab. 3 sprawozdania 2024–2025). Inicjalna murawa szczotlichowa
// to kępy szczotlichy na gołym piasku, terofity wiosenne, płonnik i porosty – w zdjęciu prawie wszystko w C i D;
// nalot sosny, brzozy, wierzby – w B.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup2330 =
  | 'characteristic' // 12 gatunków charakterystycznych z tab. 1 (z synonimami)
  | 'later' // gatunki muraw kserotermicznych, wrzosowisk, borów i łąk – późniejsze etapy sukcesji (wskaźnik „murawy/wrzosowiska”)
  | 'stable6120' // gatunki muraw 6120 (np. strzęplica sina) – tab. 1: do wskaźnika „murawy/wrzosowiska” się NIE liczą
  | 'expansive' // rodzime gatunki ekspansywne (tab. 1 + praktyka 2024)
  | 'alien' // obce (inwazyjne i sadzone do „stabilizacji” piasku)
  | 'woody' // rodzime drzewa i krzewy – ekspansja krzewów i podrostu drzew
  | 'companion' // inne gatunki muraw napiaskowych

export interface SpeciesEntry2330 {
  latin: string
  polish?: string
  group: SpeciesGroup2330
  /** Wymieniony w tab. 1 przewodnika (dla ekspansywnych); bez tego – z praktyki sprawozdań. */
  tab1?: boolean
  /** Mszak albo porost – w zdjęciu warstwa D. */
  cryptogam?: boolean
}

export const GROUP_LABELS_2330: Record<SpeciesGroup2330, string> = {
  characteristic: 'gatunek charakterystyczny 2330',
  later: 'gatunek muraw kserotermicznych/wrzosowisk (późniejsza sukcesja)',
  stable6120: 'gatunek muraw 6120 – nie liczy się do „murawy/wrzosowiska”',
  expansive: 'gatunek ekspansywny',
  alien: 'gatunek obcy',
  woody: 'drzewo lub krzew (ekspansja krzewów i podrostu)',
  companion: 'gatunek towarzyszący',
}

const e = (latin: string, polish: string, group: SpeciesGroup2330, extra: Partial<SpeciesEntry2330> = {}): SpeciesEntry2330 => ({ latin, polish, group, ...extra })
const D = { cryptogam: true }

export const SPECIES_2330: SpeciesEntry2330[] = [
  // gatunki charakterystyczne – tab. 1 (12 gatunków) + synonimy spotykane w kartach i sprawozdaniach
  e('Corynephorus canescens', 'szczotlicha siwa', 'characteristic'),
  e('Spergula morisonii', 'sporek wiosenny', 'characteristic'),
  e('Spergula vernalis', 'sporek wiosenny', 'characteristic'),
  e('Teesdalia nudicaulis', 'chroszcz nagołodygowy', 'characteristic'),
  e('Teesdalea nudicaulis', 'chroszcz nagołodygowy', 'characteristic'),
  e('Veronica dillenii', 'przetacznik Dillena', 'characteristic'),
  e('Agrostis vinealis', 'mietlica piaskowa', 'characteristic'),
  e('Agrostis coarctata', 'mietlica piaskowa', 'characteristic'),
  e('Jasione montana', 'jasieniec piaskowy', 'characteristic'),
  e('Scleranthus perennis', 'czerwiec trwały', 'characteristic'),
  e('Polytrichum piliferum', 'płonnik włosisty', 'characteristic', D),
  e('Cetraria aculeata', 'płucnica kolczasta', 'characteristic', D),
  e('Coelocaulon aculeatum', 'płucnica kolczasta', 'characteristic', D),
  e('Cladonia floerkeana', 'chrobotek Floerkego', 'characteristic', D),
  e('Cladonia floërkeana', 'chrobotek Floerkego', 'characteristic', D),
  e('Cladonia arbuscula subsp. mitis', 'chrobotek łagodny', 'characteristic', D),
  e('Cladonia mitis', 'chrobotek łagodny', 'characteristic', D),
  e('Stereocaulon condensatum', 'chróścik karłowaty', 'characteristic', D),
  // towarzyszące – murawy napiaskowe (spoza tab. 1; do oceny gatunków charakterystycznych się nie liczą)
  e('Rumex acetosella', 'szczaw polny', 'companion'),
  e('Veronica verna', 'przetacznik wiosenny', 'companion'),
  e('Filago minima', 'nicennica drobna', 'companion'),
  e('Filago arvensis', 'nicennica polna', 'companion'),
  e('Erophila verna', 'wiosnówka pospolita', 'companion'),
  e('Arabidopsis thaliana', 'rzodkiewnik pospolity', 'companion'),
  e('Myosotis stricta', 'niezapominajka drobnokwiatowa', 'companion'),
  e('Trifolium arvense', 'koniczyna polna', 'companion'),
  e('Cerastium semidecandrum', 'rogownica pięciopręcikowa', 'companion'),
  e('Carex arenaria', 'turzyca piaskowa', 'companion'),
  e('Spergularia rubra', 'sporek czerwony', 'companion'),
  e('Ceratodon purpureus', 'zęboząb purpurowy', 'companion', D),
  e('Cladonia sp.', 'chrobotek', 'companion', D),
  e('Cladonia rangiferina', 'chrobotek reniferowy', 'companion', D),
  e('Cladonia furcata', 'chrobotek widlasty', 'companion', D),
  e('Cladonia uncialis', 'chrobotek bezlistny', 'companion', D),
  // murawy 6120 i dalsze etapy w obrębie klasy – tab. 1: NIE liczą się do „murawy/wrzosowiska”
  e('Koeleria glauca', 'strzęplica sina', 'stable6120'),
  e('Festuca psammophila', 'kostrzewa piaskowa', 'stable6120'),
  e('Dianthus arenarius', 'goździk piaskowy', 'stable6120'),
  e('Gypsophila fastigiata', 'łyszczec baldachogroniasty', 'stable6120'),
  e('Helichrysum arenarium', 'kocanki piaskowe', 'stable6120'),
  // późniejsze etapy sukcesji: murawy kserotermiczne, wrzosowiska, bory, łąki (tab. 1 + sprawozdania 2011, 2024)
  e('Hieracium pilosella', 'jastrzębiec kosmaczek', 'later'),
  e('Sedum acre', 'rozchodnik ostry', 'later'),
  e('Pilosella officinarum', 'jastrzębiec kosmaczek', 'later'),
  e('Deschampsia flexuosa', 'śmiałek pogięty', 'later'),
  e('Avenella flexuosa', 'śmiałek pogięty', 'later'),
  e('Achillea millefolium', 'krwawnik pospolity', 'later'),
  e('Dianthus carthusianorum', 'goździk kartuzek', 'later'),
  e('Calluna vulgaris', 'wrzos zwyczajny', 'later'),
  e('Thymus serpyllum', 'macierzanka piaskowa', 'later'),
  e('Euphorbia cyparissias', 'wilczomlecz sosnka', 'later'),
  e('Festuca ovina', 'kostrzewa owcza', 'later'),
  e('Festuca rubra', 'kostrzewa czerwona', 'later'),
  e('Agrostis capillaris', 'mietlica pospolita', 'later'),
  e('Lembotropis nigricans', 'szczodrzyk czerniejący', 'later'),
  e('Solidago virgaurea', 'nawłoć pospolita', 'later'),
  e('Peucedanum oreoselinum', 'gorysz pagórkowy', 'later'),
  e('Anthericum ramosum', 'pajęcznica gałęzista', 'later'),
  e('Artemisia campestris', 'bylica polna', 'later'),
  e('Hypochoeris radicata', 'prosienicznik szorstki', 'later'),
  e('Potentilla argentea', 'pięciornik srebrny', 'later'),
  // ekspansywne: tab. 1 (trzcinnik piaskowy, wydmuchrzyca) + praktyka sprawozdania 2024–2025
  e('Calamagrostis epigejos', 'trzcinnik piaskowy', 'expansive', { tab1: true }),
  e('Elymus arenarius', 'wydmuchrzyca piaskowa', 'expansive', { tab1: true }),
  e('Leymus arenarius', 'wydmuchrzyca piaskowa', 'expansive', { tab1: true }),
  e('Calamagrostis arundinacea', 'trzcinnik leśny', 'expansive'),
  e('Elymus repens', 'perz właściwy', 'expansive'),
  e('Pteridium aquilinum', 'orlica pospolita', 'expansive'),
  e('Rubus plicatus', 'jeżyna fałdowana', 'expansive'),
  e('Molinia caerulea', 'trzęślica modra', 'expansive'),
  e('Carex praecox', 'turzyca wczesna', 'expansive'),
  e('Carex hirta', 'turzyca owłosiona', 'expansive'),
  // obce (przewodnik tab. 1, sprawozdania 2011 i 2024–2025 tab. 3)
  e('Conyza canadensis', 'przymiotno kanadyjskie (konyza kanadyjska)', 'alien'),
  e('Erigeron canadensis', 'przymiotno kanadyjskie (konyza kanadyjska)', 'alien'),
  e('Artemisia annua', 'bylica roczna', 'alien'),
  e('Quercus rubra', 'dąb czerwony', 'alien'),
  e('Salix acutifolia', 'wierzba ostrolistna', 'alien'),
  e('Padus serotina', 'czeremcha amerykańska', 'alien'),
  e('Prunus serotina', 'czeremcha amerykańska', 'alien'),
  e('Robinia pseudoacacia', 'robinia akacjowa', 'alien'),
  e('Campylopus introflexus', 'krzywoszczeć przywłoka', 'alien', D),
  e('Acer negundo', 'klon jesionolistny', 'alien'),
  e('Solidago gigantea', 'nawłoć późna', 'alien'),
  e('Solidago canadensis', 'nawłoć kanadyjska', 'alien'),
  e('Senecio vernalis', 'starzec wiosenny', 'alien'),
  e('Bromus tectorum', 'stokłosa dachowa', 'alien'),
  e('Erigeron annuus', 'przymiotno białe', 'alien'),
  e('Rumex confertus', 'szczaw omszony', 'alien'),
  e('Anthoxanthum aristatum', 'tomka oścista', 'alien'),
  e('Digitaria sanguinalis', 'palusznik krwawy', 'alien'),
  e('Lupinus luteus', 'łubin żółty', 'alien'),
  e('Lupinus polyphyllus', 'łubin trwały', 'alien'),
  e('Stachys byzantina', 'czyściec wełnisty', 'alien'),
  e('Pinus banksiana', 'sosna Banksa', 'alien'),
  e('Pinus nigra', 'sosna czarna', 'alien'),
  // rodzime drzewa i krzewy – ekspansja krzewów i podrostu drzew
  e('Pinus sylvestris', 'sosna zwyczajna', 'woody'),
  e('Betula pendula', 'brzoza brodawkowata', 'woody'),
  e('Populus tremula', 'topola osika', 'woody'),
  e('Populus nigra', 'topola czarna', 'woody'),
  e('Populus alba', 'topola biała', 'woody'),
  e('Salix repens', 'wierzba płożąca', 'woody'),
  e('Salix caprea', 'wierzba iwa', 'woody'),
  e('Frangula alnus', 'kruszyna pospolita', 'woody'),
  e('Sorbus aucuparia', 'jarząb pospolity', 'woody'),
  e('Juniperus communis', 'jałowiec pospolity', 'woody'),
  e('Quercus robur', 'dąb szypułkowy', 'woody'),
]

const BY_NAME = new Map(SPECIES_2330.map((s) => [normalizeName(s.latin), s]))
// „floërkeana” i „floerkeana” to ten sam gatunek
const fold = (s: string) => normalizeName(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
const BY_FOLDED = new Map(SPECIES_2330.map((s) => [fold(s.latin), s]))

export const findSpecies2330 = (name: string): SpeciesEntry2330 | undefined => BY_NAME.get(normalizeName(name)) ?? BY_FOLDED.get(fold(name))

export const isCharacteristic2330 = (name: string) => findSpecies2330(name)?.group === 'characteristic'
export const isLater2330 = (name: string) => findSpecies2330(name)?.group === 'later'
export const isStable6120 = (name: string) => findSpecies2330(name)?.group === 'stable6120'
export const isExpansive2330 = (name: string) => findSpecies2330(name)?.group === 'expansive'
export const isAlien2330 = (name: string) => findSpecies2330(name)?.group === 'alien'

/**
 * Klucz gatunku do liczenia: synonimy (Spergula vernalis = S. morisonii, Cladonia mitis = C. arbuscula subsp. mitis…)
 * dają ten sam klucz – polską nazwę z katalogu. Spoza katalogu – nazwa znormalizowana.
 */
export const speciesKey2330 = (name: string) => findSpecies2330(name)?.polish ?? normalizeName(name)

/** Drzewa i krzewy do B, mszaki i porosty do D, reszta do C. */
export const defaultLayer2330 = (s: SpeciesEntry2330): Layer => {
  if (s.cryptogam) return 'D'
  if (s.group === 'woody') return s.latin === 'Salix repens' ? 'C' : 'B'
  if (['Quercus rubra', 'Salix acutifolia', 'Padus serotina', 'Prunus serotina', 'Robinia pseudoacacia', 'Acer negundo', 'Pinus banksiana', 'Pinus nigra'].includes(s.latin)) return 'B'
  return 'C'
}
