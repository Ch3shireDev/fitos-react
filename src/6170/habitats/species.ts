// Słownik gatunków dla 6170 (nawapienne murawy wysokogórskie Seslerion tatrae i wyleżyska śnieżne Arabidion coeruleae),
// zebrany z przewodnika GIOŚ (Kozak, Kozłowska 2012, pkt 4 „Typowe gatunki roślin” – listy dla Tatr, Babiej Góry
// i Pienin; gwiazdka = gatunek charakterystyczny lub wyróżniający dla klasy Seslerietea variae / związku Arabidion
// coeruleae wg Matuszkiewicza 2008), z przykładowej karty (Upłaziańska Kopa 2, 2010) i ze sprawozdań z monitoringu
// 2009–2011, 2015–2018 i 2020–2021 (gatunki typowe dla podłoża bezwapiennego, drzewa i krzewy, synantropijne, obce).
// Drzewa i krzewy – warstwa B, runo – C, mchy i porosty – D.
import type { Layer } from '../../7120/habitats/types'
import { normalizeName } from '../../forest/helpers'

/** Pasma górskie z listami gatunków typowych (pkt 4 przewodnika) – od pasma zależą też progi części wskaźników (tab. 2). */
export const RANGES_6170 = ['tatry', 'babia', 'pieniny'] as const
export type Range6170 = (typeof RANGES_6170)[number]

export const RANGE_LABELS_6170: Record<Range6170, string> = {
  tatry: 'Tatry',
  babia: 'Babia Góra',
  pieniny: 'Pieniny',
}

export type SpeciesGroup6170 =
  | 'calcicole' // gatunki nawapienne (typowe, pkt 4 przewodnika) – z pasmami
  | 'acidophilous' // gatunki typowe dla podłoża bezwapiennego (sprawozdania 2009–2011, 2021, karta przykładowa)
  | 'expansive' // rodzime gatunki ekspansywne roślin zielnych
  | 'woody' // drzewa i krzewy (w tym kosodrzewina)
  | 'synanthropic' // gatunki synantropijne, zawleczone przez człowieka (także obce)
  | 'companion' // pozostałe gatunki runa i warstwy D

export interface SpeciesEntry6170 {
  latin: string
  polish?: string
  group: SpeciesGroup6170
  /** Gatunek nawapienny: pasma, w których przewodnik wymienia go wśród typowych. */
  ranges?: Range6170[]
  /** Gwiazdka w przewodniku: charakterystyczny lub wyróżniający dla Seslerietea variae / Arabidion coeruleae. */
  star?: boolean
  woody?: boolean
  /** Krzewinka (borówki, bażyna) – w „Gatunkach ekspansywnych” liczona z krzewami, nie z roślinami zielnymi. */
  dwarfShrub?: boolean
  /** Kosodrzewina – osobne progi w „Gatunkach ekspansywnych” i „Pokryciu drzew i krzewów”. */
  mugo?: boolean
  /** Gatunek obcy geograficznie (karta 6170 nie ma osobnego wskaźnika obcych – liczy się z synantropijnymi). */
  alien?: boolean
  /** Mech albo porost – warstwa D. */
  cryptogam?: boolean
}

export const GROUP_LABELS_6170: Record<SpeciesGroup6170, string> = {
  calcicole: 'gatunek nawapienny',
  acidophilous: 'gatunek typowy dla podłoża bezwapiennego',
  expansive: 'rodzimy gatunek ekspansywny',
  woody: 'drzewo albo krzew',
  synanthropic: 'gatunek synantropijny',
  companion: 'gatunek towarzyszący',
}

const e = (latin: string, polish: string, group: SpeciesGroup6170, extra: Partial<SpeciesEntry6170> = {}): SpeciesEntry6170 => ({ latin, polish, group, ...extra })
const T: Range6170[] = ['tatry']
const P: Range6170[] = ['pieniny']
/** Gatunek nawapienny; star – gwiazdka w przewodniku. */
const ca = (latin: string, polish: string, ranges: Range6170[], star = false, extra: Partial<SpeciesEntry6170> = {}) =>
  e(latin, polish, 'calcicole', { ranges, star, ...extra })
const W = { woody: true }
const D = { cryptogam: true }

export const SPECIES_6170: SpeciesEntry6170[] = [
  // gatunki nawapienne – Tatry (pkt 4 przewodnika; część także na Babiej Górze i w Pieninach)
  ca('Alchemilla flabellata', 'przywrotnik siwy', ['tatry', 'babia'], true),
  ca('Androsace chamaejasme', 'naradka włosista', T, true),
  ca('Anthyllis alpestris', 'przelot alpejski', T, true),
  ca('Arenaria tenella', 'piaskowiec orzęsiony', T),
  ca('Astragalus australis', 'traganek jasny', T, true),
  ca('Astragalus frigidus', 'traganek wytrzymały', T, true),
  ca('Bartsia alpina', 'bartsia alpejska', ['tatry', 'babia'], true),
  ca('Bellidiastrum michelii', 'stokrotnica górska', T, true),
  ca('Biscutella laevigata', 'pleszczotka górska', T, true),
  ca('Bupleurum ranunculoides', 'przewiercień jaskrowaty', T),
  ca('Campanula cochleariifolia', 'dzwonek drobny', T),
  ca('Carduus glaucus', 'oset siny', ['tatry', 'pieniny'], true),
  ca('Carex firma', 'turzyca mocna', T, true),
  ca('Carex sempervirens subsp. tatrorum', 'turzyca zawsze zielona tatrzańska', T, true),
  ca('Cerastium lanatum', 'rogownica wełnista', T, true),
  ca('Chamorchis alpina', 'potrostek alpejski', T, true),
  ca('Crepis jacquinii', 'pępawa Jacquina', T, true),
  ca('Dianthus plumarius subsp. praecox', 'goździk postrzępiony wczesny', ['tatry', 'pieniny'], true),
  ca('Dryas octopetala', 'dębik ośmiopłatkowy', T, true),
  ca('Erigeron hungaricus', 'przymiotno węgierskie', T, true),
  ca('Euphrasia salisburgensis', 'świetlik salzburski', T),
  ca('Euphrasia tatrae', 'świetlik tatrzański', T),
  ca('Festuca tatrae', 'kostrzewa tatrzańska', T, true),
  ca('Festuca versicolor', 'kostrzewa pstra', ['tatry', 'babia'], true),
  ca('Galium anisophyllum', 'przytulia nierównolistna', ['tatry', 'babia']),
  ca('Galium anisophyllon', 'przytulia nierównolistna (syn.)', ['tatry', 'babia']),
  ca('Gentiana clusii', 'goryczka krótkołodygowa', T, true),
  ca('Gentiana nivalis', 'goryczka śniegowa', T),
  ca('Gentiana verna', 'goryczka wiosenna', T, true),
  ca('Gnaphalium hoppeanum', 'szarota Hoppego', T, true),
  ca('Gymnadenia odoratissima', 'gółka wonna', T, true),
  ca('Gypsophila repens', 'gipsówka rozesłana', T),
  ca('Hedysarum hedysaroides', 'siekiernica górska', T, true),
  ca('Helianthemum nummularium subsp. grandiflorum', 'posłonek rozesłany wielkokwiatowy', T, true),
  ca('Hieracium bupleuroides', 'jastrzębiec przewiertniowaty', ['tatry', 'pieniny'], true),
  ca('Hieracium caesium', 'jastrzębiec modry', T),
  ca('Hieracium villosum', 'jastrzębiec kosmaty', T, true),
  ca('Hutchinsia alpina', 'rzeżuszka alpejska', T, true),
  ca('Jovibarba hirta', 'rojnik włochaty', ['tatry', 'pieniny'], true),
  ca('Kernera saxatilis', 'warzuszka skalna', T),
  ca('Knautia kitaibelii', 'świerzbica karpacka', T, true),
  ca('Leontodon incanus', 'brodawnik szary', ['tatry', 'pieniny'], true),
  ca('Leontodon pseudotaraxaci', 'brodawnik tatrzański', T),
  ca('Leontopodium alpinum', 'szarotka alpejska', T),
  ca('Linum extraaxillare', 'len karpacki', ['tatry', 'pieniny']),
  ca('Onobrychis montana', 'sparceta górska', T),
  ca('Oxytropis campestris', 'ostrołódka polna', T, true),
  ca('Oxytropis carpatica', 'ostrołódka karpacka', T, true),
  ca('Oxytropis halleri', 'ostrołódka Hallera', T, true),
  ca('Pedicularis oederi', 'gnidosz dwubarwny', T, true),
  ca('Pedicularis verticillata', 'gnidosz okółkowy', T, true),
  ca('Phyteuma orbiculare', 'zerwa kulista', ['tatry', 'babia', 'pieniny'], true),
  ca('Plantago atrata', 'babka górska', T, true),
  ca('Potentilla crantzii', 'pięciornik alpejski', T, true),
  ca('Ranunculus alpestris', 'jaskier alpejski', T, true),
  ca('Ranunculus oreophilus', 'jaskier skalny', ['tatry', 'babia', 'pieniny'], true),
  ca('Ranunculus thora', 'jaskier okrągłolistny', T),
  ca('Salix alpina', 'wierzba alpejska', T, true),
  ca('Salix reticulata', 'wierzba żyłkowana', T, true),
  ca('Salix retusa', 'wierzba wykrojona', T, true),
  ca('Saxifraga aizoides', 'skalnica nakrapiana', T),
  ca('Saxifraga androsacea', 'skalnica naradkowata', T, true),
  ca('Saxifraga caesia', 'skalnica seledynowa', T, true),
  ca('Saxifraga paniculata', 'skalnica gronkowa', ['tatry', 'babia', 'pieniny'], true),
  ca('Saxifraga wahlenbergii', 'skalnica tatrzańska', T, true),
  ca('Scabiosa lucida', 'driakiew lśniąca', ['tatry', 'pieniny'], true),
  ca('Sedum atratum', 'rozchodnik czarniawy', T),
  ca('Selaginella selaginoides', 'widliczka ostrozębna', ['tatry', 'babia', 'pieniny'], true),
  ca('Senecio capitatus', 'starzec główkowaty', T, true),
  ca('Sesleria tatrae', 'sesleria tatrzańska', T, true),
  ca('Silene acaulis subsp. pannonica', 'lepnica bezłodygowa', T, true),
  ca('Thesium alpinum', 'leniec alpejski', T, true),
  ca('Thymus pulcherrimus', 'macierzanka nadobna', T, true),
  ca('Trifolium badium', 'koniczyna brunatna', T),
  ca('Trisetum alpestre', 'konietlica alpejska', T),
  ca('Veronica aphylla', 'przetacznik różyczkowaty', T, true),
  ca('Veronica fruticans', 'przetacznik krzewinkowy', T),
  ca('Viola alpina', 'fiołek alpejski', T),
  // gatunki nawapienne – tylko Babia Góra
  ca('Anemone narcissifolia', 'zawilec narcyzowy', ['babia']),
  ca('Arabis alpina', 'gęsiówka alpejska', ['babia']),
  ca('Dianthus speciosus', 'goździk okazały', ['babia']),
  // gatunki nawapienne – tylko Pieniny
  ca('Allium montanum', 'czosnek skalny', P, true),
  ca('Alyssum saxatile', 'smagliczka skalna', P),
  ca('Aster alpinus', 'aster alpejski', P),
  ca('Bupleurum falcatum', 'przewiercień sierpowaty', P),
  ca('Centaurea triumfettii', 'chaber barwny', P, true),
  ca('Dendranthema zawadzkii', 'chryzantema Zawadzkiego', P, true),
  ca('Erysimum wittmannii', 'pszonak Wittmanna', P, true),
  ca('Helianthemum alpestre subsp. rupifragum', 'posłonek alpejski skalny', P, true),
  ca('Polygala amara subsp. brachyptera', 'krzyżownica gorzka górska', P),
  ca('Sesleria varia', 'sesleria skalna', P, true),
  ca('Teucrium montanum', 'ożanka górska', P),
  ca('Thymus carpaticus', 'macierzanka karpacka', P),

  // gatunki typowe dla podłoża bezwapiennego (sprawozdania 2009–2011 i 2021, karta Upłaziańska Kopa 2)
  e('Agrostis rupestris', 'mietlica skalna', 'acidophilous'),
  e('Calamagrostis villosa', 'trzcinnik owłosiony', 'acidophilous'),
  e('Deschampsia flexuosa', 'śmiałek pogięty', 'acidophilous'),
  e('Empetrum hermaphroditum', 'bażyna obupłciowa', 'acidophilous', { dwarfShrub: true }),
  e('Festuca airoides', 'kostrzewa niska', 'acidophilous'),
  e('Geum montanum', 'kuklik górski', 'acidophilous'),
  e('Hieracium alpinum', 'jastrzębiec alpejski', 'acidophilous'),
  e('Homogyne alpina', 'podbiałek alpejski', 'acidophilous'),
  e('Huperzia selago', 'widłak wroniec', 'acidophilous'),
  e('Hypochoeris uniflora', 'prosienicznik jednogłówkowy', 'acidophilous'),
  e('Juncus trifidus', 'sit skucina', 'acidophilous'),
  e('Luzula alpino-pilosa', 'kosmatka brunatna', 'acidophilous'),
  e('Luzula luzuloides', 'kosmatka gajowa', 'acidophilous'),
  e('Luzula sylvatica', 'kosmatka olbrzymia', 'acidophilous'),
  e('Moneses uniflora', 'gruszyczka jednokwiatowa', 'acidophilous'),
  e('Oxalis acetosella', 'szczawik zajęczy', 'acidophilous'),
  e('Poa laxa', 'wiechlina wiotka', 'acidophilous'),
  e('Potentilla aurea', 'pięciornik złoty', 'acidophilous'),
  e('Pulsatilla alba', 'sasanka alpejska', 'acidophilous'),
  e('Ranunculus pseudomontanus', 'jaskier halny', 'acidophilous'),
  e('Sempervivum montanum', 'rojnik górski', 'acidophilous'),
  e('Vaccinium myrtillus', 'borówka czarna', 'acidophilous', { dwarfShrub: true }),
  e('Vaccinium vitis-idaea', 'borówka brusznica', 'acidophilous', { dwarfShrub: true }),

  // rodzime gatunki ekspansywne roślin zielnych
  e('Calamagrostis varia', 'trzcinnik pstry', 'expansive'),
  e('Deschampsia cespitosa', 'śmiałek darniowy', 'expansive'),
  e('Calamagrostis arundinacea', 'trzcinnik leśny', 'expansive'),

  // drzewa i krzewy (sprawozdania: kosodrzewina, świerk, modrzew, jałowiec, wierzby, jarząb, jawor, klon, leszczyna, dereń, tarnina, róże)
  e('Pinus mugo', 'kosodrzewina', 'woody', { woody: true, mugo: true }),
  e('Picea abies', 'świerk pospolity', 'woody', W),
  e('Larix decidua', 'modrzew europejski', 'woody', W),
  e('Juniperus communis', 'jałowiec pospolity', 'woody', W),
  e('Salix silesiaca', 'wierzba śląska', 'woody', W),
  e('Sorbus aucuparia', 'jarząb pospolity', 'woody', W),
  e('Acer pseudoplatanus', 'klon jawor', 'woody', W),
  e('Acer platanoides', 'klon zwyczajny', 'woody', W),
  e('Corylus avellana', 'leszczyna pospolita', 'woody', W),
  e('Cornus sanguinea', 'dereń świdwa', 'woody', W),
  e('Prunus spinosa', 'śliwa tarnina', 'woody', W),
  e('Rosa sp.', 'róża', 'woody', W),
  e('Pinus sylvestris', 'sosna zwyczajna', 'woody', W),
  e('Fagus sylvatica', 'buk zwyczajny', 'woody', W),
  e('Alnus incana', 'olsza szara', 'woody', W),

  // gatunki synantropijne i zawleczone (w tym obce: winobluszcz i niecierpek – jedyne obce stwierdzone w monitoringu)
  e('Poa annua', 'wiechlina roczna', 'synanthropic'),
  e('Urtica dioica', 'pokrzywa zwyczajna', 'synanthropic'),
  e('Plantago major', 'babka zwyczajna', 'synanthropic'),
  e('Malus domestica', 'jabłoń domowa', 'synanthropic', W),
  e('Parthenocissus inserta', 'winobluszcz zaroślowy', 'synanthropic', { woody: true, alien: true }),
  e('Impatiens parviflora', 'niecierpek drobnokwiatowy', 'synanthropic', { alien: true }),

  // runo – gatunki towarzyszące (zdjęcia z karty Upłaziańska Kopa 2)
  e('Anthoxanthum alpinum', 'tomka alpejska', 'companion'),
  e('Botrychium lunaria', 'podejźrzon księżycowy', 'companion'),
  e('Campanula polymorpha', 'dzwonek wąskolistny', 'companion'),
  e('Cerastium holosteoides', 'rogownica pospolita', 'companion'),
  e('Coeloglossum viride', 'ozorka zielona', 'companion'),
  e('Gymnadenia conopsea', 'gółka długoostrogowa', 'companion'),
  e('Hieracium sp.', 'jastrzębiec', 'companion'),
  e('Listera ovata', 'listera jajowata', 'companion'),
  e('Luzula multiflora', 'kosmatka wielokwiatowa', 'companion'),
  e('Minuartia sedoides', 'mokrzyca rozchodnikowata', 'companion'),
  e('Mutellina purpurea', 'marchwica pospolita', 'companion'),
  e('Parnassia palustris', 'dziewięciornik błotny', 'companion'),
  e('Poa alpina', 'wiechlina alpejska', 'companion'),
  e('Polygonum viviparum', 'rdest żyworodny', 'companion'),
  e('Rhodiola rosea', 'różeniec górski', 'companion'),
  e('Traunsteinera globosa', 'storczyca kulista', 'companion'),
  e('Trifolium pratense', 'koniczyna łąkowa', 'companion'),
  e('Poaceae indet.', 'trawa nieoznaczona', 'companion'),
  e('Cetraria islandica', 'płucnica islandzka', 'companion', D),
  e('Cetraria sp.', 'płucnica', 'companion', D),
  e('Thamnolia vermicularis', 'porost Thamnolia (porost)', 'companion', D),
]

const BY_NAME = new Map(SPECIES_6170.map((s) => [normalizeName(s.latin), s]))

export const findSpecies6170 = (name: string): SpeciesEntry6170 | undefined => BY_NAME.get(normalizeName(name))

/** Klucz do liczenia gatunków: synonimy (Galium anisophyllon/anisophyllum) dają jeden klucz. */
export const speciesKey6170 = (name: string) => (findSpecies6170(name)?.polish ?? normalizeName(name)).replace(/ \((syn\.|porost)\)$/, '')

const groupOf = (name: string) => findSpecies6170(name)?.group
export const isCalcicole6170 = (name: string) => groupOf(name) === 'calcicole'
export const isAcidophilous6170 = (name: string) => groupOf(name) === 'acidophilous'
export const isSynanthropic6170 = (name: string) => groupOf(name) === 'synanthropic'
export const isWoody6170 = (name: string) => Boolean(findSpecies6170(name)?.woody)
export const isDwarfShrub6170 = (name: string) => Boolean(findSpecies6170(name)?.dwarfShrub)
export const isMugo6170 = (name: string) => Boolean(findSpecies6170(name)?.mugo)

export const defaultLayer6170 = (s: SpeciesEntry6170): Layer => (s.woody ? 'B' : s.cryptogam ? 'D' : 'C')
