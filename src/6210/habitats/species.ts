// Słownik gatunków dla 6210 (murawy kserotermiczne Festuco-Brometea), zebrany z przewodnika GIOŚ (Mróz, Bąba 2010:
// tab. 1 – gatunki strukturotwórcze i gatunki trzech podtypów, pkt 4 „Typowe gatunki roślin”, tab. 1 – gatunki
// ekspansywne), z przykładowej karty (Radomice, 2008) i ze sprawozdań z monitoringu 2006–2008, 2013–2014 i 2020–2021
// (gatunki obce – tab. 4 sprawozdania 2021, storczykowate i ekspansywne – opisy wskaźników).
//
// „Gatunki charakterystyczne” w 6210 to otwarta lista: tab. 1 każe liczyć gatunki strukturotwórcze, gatunki z list
// podtypów „oraz pozostałe gatunki charakterystyczne dla klasy Festuco-Brometea”. Tu jest lista robocza: tab. 1 + pkt 4
// (gatunki muraw) + najczęstsze gatunki charakterystyczne klasy, rzędów i związków Festuco-Brometea (wg Matuszkiewicza).
// Gatunki z pkt 4 z innych klas (okrajki Trifolio-Geranietea: lebiodka, klinopodium, rzepik…) są osobno – w 2021 r.
// nazwano je „gatunkami wyróżniającymi” i nie liczono. Karta z przewodnika też ich nie liczy.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

export type SpeciesGroup6210 =
  | 'characteristic' // gatunki charakterystyczne Festuco-Brometea (tab. 1 + pkt 4 + klasa) – liczą się do wskaźnika
  | 'typical' // z pkt 4 przewodnika, ale z okrajków i łąk (Trifolio-Geranietea, Molinion) – wyróżniające, NIE liczą się
  | 'orchid' // storczykowate – wskaźnik „Liczba gatunków storczykowatych”
  | 'expansive' // rodzime gatunki ekspansywne roślin zielnych (tab. 1 + praktyka 2013–2021)
  | 'alien' // obce (tab. 4 sprawozdania 2021)
  | 'woody' // rodzime drzewa i krzewy – ekspansja krzewów i podrostu drzew
  | 'companion' // inne gatunki muraw, łąk i okrajków

export type Subtype6210 = '6210-1' | '6210-2' | '6210-3'

export interface SpeciesEntry6210 {
  latin: string
  polish?: string
  group: SpeciesGroup6210
  /** Na liście podtypu w tab. 1 przewodnika (6210-1 naskalne, 6210-2 ostnicowe, 6210-3 kwietne). */
  subtypes?: Subtype6210[]
  /** Gatunek strukturotwórczy z tab. 1 (kostrzewy, ostnice, turzyce, strzęplice). */
  structural?: boolean
  /** Charakterystyczny, ale w tab. 1 albo w praktyce 2013–2021 wymieniany też jako ekspansywny (kłosownica, perz siny, pajęcznica). */
  expansiveToo?: boolean
  /** Wymieniony wprost w tab. 1 (dla ekspansywnych); bez tego – z praktyki sprawozdań. */
  tab1?: boolean
  /** Mszak albo porost – w zdjęciu warstwa D. */
  cryptogam?: boolean
  /** Obcy, ale archeofit, roślina uprawna albo efemeryczny chwast – 2021: „tylko część z nich ma charakter inwazyjnych”. */
  weak?: boolean
}

export const GROUP_LABELS_6210: Record<SpeciesGroup6210, string> = {
  characteristic: 'gatunek charakterystyczny Festuco-Brometea',
  typical: 'gatunek wyróżniający (pkt 4, okrajki lub łąki) – do gatunków charakterystycznych się nie liczy',
  orchid: 'storczykowaty',
  expansive: 'rodzimy gatunek ekspansywny',
  alien: 'gatunek obcy',
  woody: 'drzewo lub krzew (ekspansja krzewów i podrostu)',
  companion: 'gatunek towarzyszący',
}

export const SUBTYPE_LABELS_6210: Record<Subtype6210, string> = {
  '6210-1': '6210-1 Murawy naskalne (Seslerio-Festucion duriusculae)',
  '6210-2': '6210-2 Murawy ostnicowe (Festuco-Stipion)',
  '6210-3': '6210-3 Kwietne murawy kserotermiczne (Cirsio-Brachypodion, Mesobromion)',
}

const e = (latin: string, polish: string, group: SpeciesGroup6210, extra: Partial<SpeciesEntry6210> = {}): SpeciesEntry6210 => ({ latin, polish, group, ...extra })
const c = (latin: string, polish: string, extra: Partial<SpeciesEntry6210> = {}) => e(latin, polish, 'characteristic', extra)
const S1: Partial<SpeciesEntry6210> = { subtypes: ['6210-1'] }
const S2: Partial<SpeciesEntry6210> = { subtypes: ['6210-2'] }
const S3: Partial<SpeciesEntry6210> = { subtypes: ['6210-3'] }
const D = { cryptogam: true }
const T = { tab1: true }
const W = { weak: true }

export const SPECIES_6210: SpeciesEntry6210[] = [
  // gatunki strukturotwórcze (tab. 1)
  c('Festuca pallens', 'kostrzewa blada', { structural: true, subtypes: ['6210-1'] }),
  c('Festuca rupicola', 'kostrzewa bruzdkowana', { structural: true, subtypes: ['6210-2'] }),
  c('Festuca sulcata', 'kostrzewa bruzdkowana', { structural: true, subtypes: ['6210-2'] }),
  c('Festuca valesiaca', 'kostrzewa walezyjska', { structural: true, subtypes: ['6210-2'] }),
  c('Stipa capillata', 'ostnica włosowata', { structural: true, subtypes: ['6210-2'] }),
  c('Stipa joannis', 'ostnica Jana', { structural: true, subtypes: ['6210-2', '6210-3'] }),
  c('Stipa pennata', 'ostnica Jana', { structural: true, subtypes: ['6210-2', '6210-3'] }),
  c('Stipa pulcherrima', 'ostnica powabna', { structural: true, subtypes: ['6210-2'] }),
  c('Carex humilis', 'turzyca niska', { structural: true }),
  c('Carex ornithopoda', 'turzyca ptasie łapki', { structural: true }),
  c('Carex supina', 'turzyca delikatna', { structural: true, subtypes: ['6210-2'] }),
  c('Carex michelii', 'turzyca Michela', { structural: true }),
  c('Koeleria macrantha', 'strzęplica nadobna', { structural: true, subtypes: ['6210-2'] }),
  c('Koeleria cristata', 'strzęplica nadobna', { structural: true, subtypes: ['6210-2'] }),
  c('Koeleria pyramidata', 'strzęplica piramidalna', { structural: true }),

  // 6210-1 murawy naskalne (tab. 1)
  c('Jovibarba sobolifera', 'rojownik pospolity', S1),
  c('Sempervivum soboliferum', 'rojownik pospolity', S1),
  c('Allium montanum', 'czosnek skalny', S1),
  c('Allium senescens subsp. montanum', 'czosnek skalny', S1),
  c('Hieracium bifidum', 'jastrzębiec siny', S1),
  c('Libanotis pyrenaica', 'oleśnik górski', S1),
  c('Seseli libanotis', 'oleśnik górski', S1),
  c('Melica transsilvanica', 'perłówka siedmiogrodzka', S1),
  c('Thymus praecox', 'macierzanka wczesna', S1),
  c('Melica ciliata', 'perłówka orzęsiona', S1),
  c('Teucrium botrys', 'ożanka pierzastosieczna', S1),
  c('Dianthus carthusianorum', 'goździk kartuzek', S1),
  c('Stachys recta', 'czyściec prosty', S1),
  c('Centaurea stoebe', 'chaber nadreński', S1),
  c('Centaurea rhenana', 'chaber nadreński', S1),

  // 6210-2 murawy ostnicowe (tab. 1)
  c('Arabis recta', 'gęsiówka uszkowata', S2),
  c('Arabis auriculata', 'gęsiówka uszkowata', S2),
  c('Sisymbrium polymorphum', 'stulisz miotłowy', S2),
  c('Alyssum montanum', 'smagliczka pagórkowa', S2),
  c('Potentilla arenaria', 'pięciornik piaskowy', S2),
  c('Potentilla incana', 'pięciornik piaskowy', S2),
  c('Gypsophila fastigiata', 'łyszczec baldachogronowy', S2),
  c('Hieracium echioides', 'jastrzębiec żmijowcowaty', S2),
  c('Oxytropis pilosa', 'ostrołódka kosmata', S2),
  c('Erysimum crepidifolium', 'pszonak pępawolistny', S2),
  c('Anthericum liliago', 'pajęcznica liliowata', S2),

  // 6210-3 kwietne murawy kserotermiczne (tab. 1)
  c('Aster amellus', 'aster gawędka', S3),
  c('Cirsium pannonicum', 'ostrożeń pannoński', S3),
  c('Inula ensifolia', 'oman wąskolistny', S3),
  c('Iris aphylla', 'kosaciec bezlistny', S3),
  c('Linum flavum', 'len złocisty', S3),
  c('Linum hirsutum', 'len włochaty', S3),
  c('Carlina onopordifolia', 'dziewięćsił popłocholistny', S3),
  c('Dorycnium germanicum', 'szyplin jedwabisty', S3),
  c('Campanula bononiensis', 'dzwonek boloński', S3),
  c('Adonis vernalis', 'miłek wiosenny', S3),
  c('Scorzonera purpurea', 'wężymord stepowy', S3),
  c('Senecio macrophyllus', 'starzec cienisty', S3),

  // pkt 4 „Typowe gatunki roślin” – gatunki muraw
  c('Campanula sibirica', 'dzwonek syberyjski'),
  c('Melampyrum arvense', 'pszeniec różowy'),
  c('Eryngium campestre', 'mikołajek polny'),
  c('Gentiana cruciata', 'goryczka krzyżowa'),
  c('Viola rupestris', 'fiołek skalny'),
  c('Sesleria uliginosa', 'sesleria błotna'),
  c('Sesleria caerulea', 'sesleria błotna'),
  c('Carex praecox', 'turzyca wczesna'),
  c('Ranunculus illyricus', 'jaskier illiryjski'),
  c('Senecio erucifolius', 'starzec srebrzysty'),
  c('Senecio integrifolius', 'starzec polny'),
  c('Seseli annuum', 'żebrzyca roczna'),
  c('Veronica austriaca', 'przetacznik ząbkowany'),
  c('Veronica teucrium', 'przetacznik ząbkowany'),
  c('Elymus hispidus', 'perz siny', { expansiveToo: true }),
  c('Elymus hispidus subsp. barbulatus', 'perz siny', { expansiveToo: true }),
  c('Elytrigia intermedia', 'perz siny', { expansiveToo: true }),
  c('Brachypodium pinnatum', 'kłosownica pierzasta', { expansiveToo: true, tab1: true }),
  c('Carex flacca', 'turzyca sina'),
  c('Tetragonolobus maritimus', 'komonicznik skrzydlatostrąkowy'),
  c('Lotus maritimus', 'komonicznik skrzydlatostrąkowy'),
  c('Asperula tinctoria', 'marzanka barwierska'),

  // inne gatunki charakterystyczne klasy, rzędów i związków Festuco-Brometea (lista robocza)
  c('Achillea pannonica', 'krwawnik pannoński'),
  c('Acinos arvensis', 'czyścica drobnokwiatowa'),
  c('Anthericum ramosum', 'pajęcznica gałęzista', { expansiveToo: true }),
  c('Anthyllis vulneraria', 'przelot pospolity'),
  c('Asperula cynanchica', 'marzanka pagórkowa'),
  c('Aster linosyris', 'aster złotowłos'),
  c('Astragalus danicus', 'traganek duński'),
  c('Astragalus onobrychis', 'traganek długożagielkowy'),
  c('Avenula pratensis', 'owsica łąkowa'),
  c('Helictotrichon pratense', 'owsica łąkowa'),
  c('Bromus erectus', 'stokłosa prosta'),
  c('Bupleurum falcatum', 'przewiercień sierpowaty'),
  c('Carex caryophyllea', 'turzyca wiosenna'),
  c('Carlina acaulis', 'dziewięćsił bezłodygowy'),
  c('Carlina vulgaris', 'dziewięćsił pospolity'),
  c('Centaurea scabiosa', 'chaber driakiewnik'),
  c('Cirsium acaule', 'ostrożeń bezłodygowy'),
  c('Echium russicum', 'żmijowiec czerwony'),
  c('Echium rubrum', 'żmijowiec czerwony'),
  c('Euphorbia cyparissias', 'wilczomlecz sosnka'),
  c('Euphorbia seguieriana', 'wilczomlecz Seguiera'),
  c('Filipendula vulgaris', 'wiązówka bulwkowa'),
  c('Fragaria viridis', 'poziomka twardawa'),
  c('Gentianella ciliata', 'goryczuszka orzęsiona'),
  c('Gentiana ciliata', 'goryczuszka orzęsiona'),
  c('Helianthemum nummularium', 'posłonek rozesłany'),
  c('Helianthemum obscurum', 'posłonek rozesłany'),
  c('Inula hirta', 'oman szorstki'),
  c('Medicago falcata', 'lucerna sierpowata'),
  c('Onobrychis arenaria', 'sparceta piaskowa'),
  c('Ononis spinosa', 'wilżyna ciernista'),
  c('Phleum phleoides', 'tymotka Boehmera'),
  c('Pimpinella saxifraga', 'biedrzeniec mniejszy'),
  c('Plantago media', 'babka średnia'),
  c('Polygala comosa', 'krzyżownica czubata'),
  c('Prunella grandiflora', 'głowienka wielkokwiatowa'),
  c('Prunella laciniata', 'głowienka wcinanolistna'),
  c('Pulsatilla pratensis', 'sasanka łąkowa'),
  c('Pulsatilla patens', 'sasanka otwarta'),
  c('Ranunculus bulbosus', 'jaskier bulwkowy'),
  c('Salvia pratensis', 'szałwia łąkowa'),
  c('Sanguisorba minor', 'krwiściąg mniejszy'),
  c('Scabiosa ochroleuca', 'driakiew żółtawa'),
  c('Scabiosa canescens', 'driakiew wonna'),
  c('Silene otites', 'lepnica wąskopłatkowa'),
  c('Teucrium chamaedrys', 'ożanka właściwa'),
  c('Thesium linophyllon', 'leniec bezpodkwiatkowy'),
  c('Thymus marschallianus', 'macierzanka Marschalla'),
  c('Trifolium montanum', 'koniczyna pagórkowa'),
  c('Veronica spicata', 'przetacznik kłosowy'),
  c('Veronica prostrata', 'przetacznik rozesłany'),

  // pkt 4, ale z okrajków i łąk – „gatunki wyróżniające” (2021), do wskaźnika się nie liczą
  e('Origanum vulgare', 'lebiodka pospolita', 'typical'),
  e('Clinopodium vulgare', 'klinopodium zwyczajne', 'typical'),
  e('Agrimonia eupatoria', 'rzepik pospolity', 'typical'),
  e('Inula conyza', 'oman szlachtawa', 'typical'),
  e('Galium boreale', 'przytulia północna', 'typical'),
  e('Thalictrum simplex', 'rutewka pojedyncza', 'typical'),
  e('Stachys germanica', 'czyściec niemiecki', 'typical'),

  // storczykowate (sprawozdania 2013–2014 i 2020–2021, karta z przewodnika)
  e('Orchis purpurea', 'storczyk purpurowy', 'orchid', S3),
  e('Orchis militaris', 'storczyk kukawka', 'orchid'),
  e('Orchis mascula', 'storczyk męski', 'orchid'),
  e('Orchis pallens', 'storczyk blady', 'orchid'),
  e('Orchis ustulata', 'storczyk drobnokwiatowy', 'orchid'),
  e('Neotinea ustulata', 'storczyk drobnokwiatowy', 'orchid'),
  e('Orchis morio', 'storczyk samiczy', 'orchid'),
  e('Anacamptis morio', 'storczyk samiczy', 'orchid'),
  e('Ophrys insectifera', 'dwulistnik muszy', 'orchid'),
  e('Ophrys muscifera', 'dwulistnik muszy', 'orchid'),
  e('Cypripedium calceolus', 'obuwik pospolity', 'orchid'),
  e('Platanthera bifolia', 'podkolan biały', 'orchid'),
  e('Platanthera chlorantha', 'podkolan zielonawy', 'orchid'),
  e('Listera ovata', 'listera jajowata', 'orchid'),
  e('Neottia ovata', 'listera jajowata', 'orchid'),
  e('Epipactis helleborine', 'kruszczyk szerokolistny', 'orchid'),
  e('Epipactis atrorubens', 'kruszczyk rdzawoczerwony', 'orchid'),
  e('Cephalanthera alba', 'buławnik wielkokwiatowy', 'orchid'),
  e('Cephalanthera damasonium', 'buławnik wielkokwiatowy', 'orchid'),
  e('Cephalanthera rubra', 'buławnik czerwony', 'orchid'),
  e('Cephalanthera longifolia', 'buławnik mieczolistny', 'orchid'),
  e('Gymnadenia conopsea', 'gółka długoostrogowa', 'orchid'),
  e('Dactylorhiza sambucina', 'kukułka bzowa', 'orchid'),
  e('Coeloglossum viride', 'ozorka zielona', 'orchid'),
  e('Herminium monorchis', 'wątlik błotny', 'orchid'),
  e('Traunsteinera globosa', 'storczyca kulista', 'orchid'),
  e('Neottia nidus-avis', 'gnieźnik leśny', 'orchid'),

  // rodzime gatunki ekspansywne roślin zielnych (tab. 1 + sprawozdania 2013–2021)
  e('Calamagrostis epigejos', 'trzcinnik piaskowy', 'expansive', T),
  e('Elymus repens', 'perz właściwy', 'expansive', T),
  e('Elytrigia repens', 'perz właściwy', 'expansive', T),
  e('Rubus sp.', 'jeżyna', 'expansive', T),
  e('Rubus caesius', 'jeżyna popielica', 'expansive', T),
  e('Rubus fruticosus agg.', 'jeżyna fałdowana (agg.)', 'expansive', T),
  e('Arrhenatherum elatius', 'rajgras wyniosły', 'expansive'),
  e('Bromus inermis', 'stokłosa bezostna', 'expansive'),
  e('Urtica dioica', 'pokrzywa zwyczajna', 'expansive'),
  e('Pteridium aquilinum', 'orlica pospolita', 'expansive'),
  e('Molinia caerulea', 'trzęślica modra', 'expansive'),
  e('Artemisia vulgaris', 'bylica pospolita', 'expansive'),
  e('Aegopodium podagraria', 'podagrycznik pospolity', 'expansive'),
  e('Chaerophyllum aromaticum', 'świerząbek korzenny', 'expansive'),
  e('Cirsium arvense', 'ostrożeń polny', 'expansive'),
  e('Anthriscus sylvestris', 'trybula leśna', 'expansive'),
  e('Vincetoxicum hirundinaria', 'ciemiężyk białokwiatowy', 'expansive'),
  e('Tanacetum vulgare', 'wrotycz pospolity', 'expansive'),

  // obce (tab. 4 sprawozdania 2021) – weak: archeofity, rośliny uprawne, chwasty bez tendencji do inwazji
  e('Aronia melanocarpa', 'aronia czarna', 'alien'),
  e('Syringa vulgaris', 'bez lilak', 'alien'),
  e('Geranium pyrenaicum', 'bodziszek pirenejski', 'alien', W),
  e('Geranium dissectum', 'bodziszek porozcinany', 'alien', W),
  e('Echinochloa crus-galli', 'chwastnica jednostronna', 'alien', W),
  e('Cichorium intybus', 'cykoria podróżnik', 'alien', W),
  e('Padus serotina', 'czeremcha amerykańska', 'alien'),
  e('Prunus serotina', 'czeremcha amerykańska', 'alien'),
  e('Quercus rubra', 'dąb czerwony', 'alien'),
  e('Fumaria officinalis', 'dymnica pospolita', 'alien', W),
  e('Viola arvensis', 'fiołek polny', 'alien', W),
  e('Sinapis arvensis', 'gorczyca polna', 'alien', W),
  e('Lathyrus tuberosus', 'groszek bulwiasty', 'alien', W),
  e('Pyrus communis', 'grusza pospolita', 'alien', W),
  e('Malus domestica', 'jabłoń domowa', 'alien', W),
  e('Fraxinus pennsylvanica', 'jesion pensylwański', 'alien'),
  e('Aesculus hippocastanum', 'kasztanowiec zwyczajny', 'alien'),
  e('Acer negundo', 'klon jesionolistny', 'alien'),
  e('Lycium barbarum', 'kolcowój szkarłatny', 'alien'),
  e('Echinocystis lobata', 'kolczurka klapowana', 'alien'),
  e('Lupinus polyphyllus', 'łubin trwały', 'alien'),
  e('Myrrhis odorata', 'marchewnik anyżowy', 'alien'),
  e('Solidago canadensis', 'nawłoć kanadyjska', 'alien'),
  e('Solidago gigantea', 'nawłoć późna', 'alien'),
  e('Impatiens parviflora', 'niecierpek drobnokwiatowy', 'alien'),
  e('Impatiens glandulifera', 'niecierpek gruczołowaty', 'alien'),
  e('Juglans regia', 'orzech włoski', 'alien'),
  e('Carduus nutans', 'oset zwisły', 'alien', W),
  e('Consolida regalis', 'ostróżeczka polna', 'alien', W),
  e('Clematis vitalba', 'powojnik pnący', 'alien'),
  e('Erigeron annuus', 'przymiotno białe', 'alien'),
  e('Erigeron ramosus', 'przymiotno gałęziste', 'alien'),
  e('Conyza canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Erigeron canadensis', 'przymiotno kanadyjskie', 'alien'),
  e('Robinia pseudacacia', 'robinia akacjowa', 'alien'),
  e('Robinia pseudoacacia', 'robinia akacjowa', 'alien'),
  e('Sedum spurium', 'rozchodnik kaukaski', 'alien'),
  e('Rosa multiflora', 'róża wielokwiatowa', 'alien'),
  e('Bunias orientalis', 'rukiewnik wschodni', 'alien'),
  e('Lactuca serriola', 'sałata kompasowa', 'alien', W),
  e('Helianthus tuberosus', 'słonecznik bulwiasty', 'alien'),
  e('Pinus banksiana', 'sosna Banksa', 'alien'),
  e('Onobrychis viciifolia', 'sparceta siewna', 'alien', W),
  e('Rhus typhina', 'sumak octowiec', 'alien'),
  e('Malva alcea', 'ślaz zygmarek', 'alien', W),
  e('Prunus cerasifera', 'śliwa wiśniowa', 'alien'),
  e('Amelanchier spicata', 'świdośliwa kłosowa', 'alien'),
  e('Capsella bursa-pastoris', 'tasznik pospolity', 'alien', W),
  e('Populus nigra var. italica', 'topola włoska', 'alien'),
  e('Populus ×canadensis', 'topola kanadyjska', 'alien'),
  e('Asclepias syriaca', 'trojeść amerykańska', 'alien'),
  e('Bidens frondosa', 'uczep amerykański', 'alien'),
  e('Parthenocissus inserta', 'winobluszcz zaroślowy', 'alien'),
  e('Vicia hirsuta', 'wyka drobnokwiatowa', 'alien', W),
  e('Galinsoga parviflora', 'żółtlica drobnokwiatowa', 'alien', W),
  e('Lolium multiflorum', 'życica wielokwiatowa', 'alien', W),
  e('Aristolochia clematitis', 'kokornak powojnikowy', 'alien', W),
  e('Fallopia convolvulus', 'rdestówka powojowata', 'alien', W),
  e('Onopordum acanthium', 'popłoch pospolity', 'alien', W),
  e('Cerasus mahaleb', 'wiśnia wonna', 'alien'),

  // rodzime drzewa i krzewy (tab. 1 i sprawozdania)
  e('Prunus spinosa', 'śliwa tarnina', 'woody'),
  e('Crataegus monogyna', 'głóg jednoszyjkowy', 'woody'),
  e('Crataegus laevigata', 'głóg dwuszyjkowy', 'woody'),
  e('Crataegus sp.', 'głóg', 'woody'),
  e('Rosa canina', 'róża dzika', 'woody'),
  e('Rosa sp.', 'róża', 'woody'),
  e('Cornus sanguinea', 'dereń świdwa', 'woody'),
  e('Pinus sylvestris', 'sosna zwyczajna', 'woody'),
  e('Juniperus communis', 'jałowiec pospolity', 'woody'),
  e('Frangula alnus', 'kruszyna pospolita', 'woody'),
  e('Rhamnus cathartica', 'szakłak pospolity', 'woody'),
  e('Berberis vulgaris', 'berberys zwyczajny', 'woody'),
  e('Corylus avellana', 'leszczyna pospolita', 'woody'),
  e('Ligustrum vulgare', 'ligustr pospolity', 'woody'),
  e('Viburnum opulus', 'kalina koralowa', 'woody'),
  e('Viburnum lantana', 'kalina hordowina', 'woody'),
  e('Cotoneaster integerrimus', 'irga zwyczajna', 'woody'),
  e('Euonymus europaeus', 'trzmielina zwyczajna', 'woody'),
  e('Prunus fruticosa', 'wisienka karłowata', 'woody'),
  e('Pyrus pyraster', 'grusza polna', 'woody'),
  e('Sambucus nigra', 'bez czarny', 'woody'),
  e('Betula pendula', 'brzoza brodawkowata', 'woody'),
  e('Populus tremula', 'topola osika', 'woody'),
  e('Quercus robur', 'dąb szypułkowy', 'woody'),
  e('Quercus petraea', 'dąb bezszypułkowy', 'woody'),
  e('Acer campestre', 'klon polny', 'woody'),
  e('Acer platanoides', 'klon zwyczajny', 'woody'),
  e('Acer pseudoplatanus', 'klon jawor', 'woody'),
  e('Fagus sylvatica', 'buk zwyczajny', 'woody'),
  e('Carpinus betulus', 'grab zwyczajny', 'woody'),
  e('Fraxinus excelsior', 'jesion wyniosły', 'woody'),
  e('Sorbus aucuparia', 'jarząb pospolity', 'woody'),
  e('Salix caprea', 'wierzba iwa', 'woody'),
  e('Tilia cordata', 'lipa drobnolistna', 'woody'),
  e('Ulmus minor', 'wiąz polny', 'woody'),
  e('Picea abies', 'świerk pospolity', 'woody'),
  e('Larix decidua', 'modrzew europejski', 'woody'),

  // gatunki towarzyszące (karta Radomice i najczęstsze w zdjęciach)
  e('Achillea millefolium', 'krwawnik pospolity', 'companion'),
  e('Anthoxanthum odoratum', 'tomka wonna', 'companion'),
  e('Arabis hirsuta', 'gęsiówka szorstkowłosa', 'companion'),
  e('Briza media', 'drżączka średnia', 'companion'),
  e('Campanula rotundifolia', 'dzwonek okrągłolistny', 'companion'),
  e('Campanula glomerata', 'dzwonek skupiony', 'companion'),
  e('Centaurea jacea', 'chaber łąkowy', 'companion'),
  e('Coronilla varia', 'cieciorka pstra', 'companion'),
  e('Securigera varia', 'cieciorka pstra', 'companion'),
  e('Dactylis glomerata', 'kupkówka pospolita', 'companion'),
  e('Daucus carota', 'marchew zwyczajna', 'companion'),
  e('Festuca ovina', 'kostrzewa owcza', 'companion'),
  e('Festuca rubra', 'kostrzewa czerwona', 'companion'),
  e('Fragaria vesca', 'poziomka pospolita', 'companion'),
  e('Galium mollugo', 'przytulia pospolita', 'companion'),
  e('Galium verum', 'przytulia właściwa', 'companion'),
  e('Hieracium pilosella', 'jastrzębiec kosmaczek', 'companion'),
  e('Hypericum perforatum', 'dziurawiec zwyczajny', 'companion'),
  e('Knautia arvensis', 'świerzbnica polna', 'companion'),
  e('Lathyrus pratensis', 'groszek łąkowy', 'companion'),
  e('Leucanthemum vulgare', 'jastrun właściwy', 'companion'),
  e('Linum catharticum', 'len przeczyszczający', 'companion'),
  e('Lotus corniculatus', 'komonica zwyczajna', 'companion'),
  e('Medicago lupulina', 'lucerna nerkowata', 'companion'),
  e('Peucedanum cervaria', 'gorysz siny', 'companion'),
  e('Peucedanum oreoselinum', 'gorysz pagórkowy', 'companion'),
  e('Plantago lanceolata', 'babka lancetowata', 'companion'),
  e('Poa angustifolia', 'wiechlina wąskolistna', 'companion'),
  e('Poa compressa', 'wiechlina spłaszczona', 'companion'),
  e('Poa pratensis', 'wiechlina łąkowa', 'companion'),
  e('Silene vulgaris', 'lepnica rozdęta', 'companion'),
  e('Thalictrum minus', 'rutewka mniejsza', 'companion'),
  e('Thymus pulegioides', 'macierzanka zwyczajna', 'companion'),
  e('Trifolium medium', 'koniczyna pogięta', 'companion'),
  e('Veronica chamaedrys', 'przetacznik ożankowy', 'companion'),
  e('Vicia cracca', 'wyka ptasia', 'companion'),
  e('Viola hirta', 'fiołek kosmaty', 'companion'),
  e('Abietinella abietina', 'jodełkowiec jodłowy', 'companion', D),
  e('Homalothecium lutescens', 'połyskniec żółtawy', 'companion', D),
  e('Hypnum cupressiforme', 'rokietnik pospolity', 'companion', D),
  e('Rhytidium rugosum', 'pomarszczek pospolity', 'companion', D),
  e('Tortella tortuosa', 'kędzierzawiec skręcony', 'companion', D),
  e('Cladonia sp.', 'chrobotek', 'companion', D),
]

const BY_NAME = new Map(SPECIES_6210.map((s) => [normalizeName(s.latin), s]))

export const findSpecies6210 = (name: string): SpeciesEntry6210 | undefined => BY_NAME.get(normalizeName(name))

export const isCharacteristic6210 = (name: string) => findSpecies6210(name)?.group === 'characteristic'
export const isTypical6210 = (name: string) => findSpecies6210(name)?.group === 'typical'
export const isOrchid6210 = (name: string) => findSpecies6210(name)?.group === 'orchid'
/** Ekspansywny: z grupy ekspansywnych albo charakterystyczny wymieniany też jako ekspansywny (kłosownica, perz siny, pajęcznica). */
export const isExpansive6210 = (name: string) => {
  const s = findSpecies6210(name)
  return s?.group === 'expansive' || Boolean(s?.expansiveToo)
}
export const isAlien6210 = (name: string) => findSpecies6210(name)?.group === 'alien'
export const isWeakAlien6210 = (name: string) => Boolean(findSpecies6210(name)?.weak)
export const isWoody6210 = (name: string) => findSpecies6210(name)?.group === 'woody'

/**
 * Klucz gatunku do liczenia: synonimy (Festuca rupicola = F. sulcata, Listera = Neottia ovata…) dają ten sam klucz –
 * polską nazwę z katalogu. Spoza katalogu – nazwa znormalizowana.
 */
export const speciesKey6210 = (name: string) => findSpecies6210(name)?.polish ?? normalizeName(name)

const WOODY_ALIENS = new Set([
  'Aronia melanocarpa',
  'Syringa vulgaris',
  'Padus serotina',
  'Prunus serotina',
  'Quercus rubra',
  'Pyrus communis',
  'Malus domestica',
  'Fraxinus pennsylvanica',
  'Aesculus hippocastanum',
  'Acer negundo',
  'Lycium barbarum',
  'Juglans regia',
  'Robinia pseudacacia',
  'Robinia pseudoacacia',
  'Rosa multiflora',
  'Pinus banksiana',
  'Rhus typhina',
  'Prunus cerasifera',
  'Amelanchier spicata',
  'Populus nigra var. italica',
  'Populus ×canadensis',
  'Cerasus mahaleb',
])

/** Obce drzewo lub krzew – liczy się i do obcych, i do pokrycia krzewów. */
export const isWoodyAlien6210 = (name: string) => {
  const s = findSpecies6210(name)
  return Boolean(s && WOODY_ALIENS.has(s.latin))
}

/** Drzewa i krzewy do B, mszaki i porosty do D, reszta do C. */
export const defaultLayer6210 = (s: SpeciesEntry6210): Layer => {
  if (s.cryptogam) return 'D'
  if (s.group === 'woody' || WOODY_ALIENS.has(s.latin)) return 'B'
  return 'C'
}
