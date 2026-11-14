// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Kozak, Kozłowska 2012, rozdz. 6170, pkt 3 „Przykład
// wypełnionej karty obserwacji”): Upłaziańska Kopa 2 (Tatry, podtyp 6170-1), 03.08.2010. Obserwatorzy zanonimizowani
// (Jan Kowalski, Anna Nowak).
//  • współrzędne w przewodniku są ucięte do minut („49° 14′ …″N – 19° 53′ …″E”) – przepisane do minut;
//  • obszary chronione: w karcie jedno pole („Sieć Natura 2000: SOO i OSO Tatry (PLC 120001); Tatrzański Park
//    Narodowy”) – rozdzielone na „Natura 2000” i „Obszary chronione”;
//  • zdjęcia: warstwy jak w karcie – Pinus mugo w B i C, Picea abies (siewki) w C, porosty (Cetraria, Thamnolia) w D;
//    „Poaceae indet.” zostaje; „Galium anisophyllon” jak w karcie (katalog zna obie pisownie);
//  • wskaźniki – wartości jak w karcie; listy gatunków cennych (51), nawapiennych (35) i bezwapiennych (6) przepisane
//    w całości, żeby podpowiedź liczyła się z listy; status gatunków (CHR, CL, PCzKR…) – w opisie;
//  • oddziaływania: kod 900 „Erozja” (lista 1999) → K01.01 Erozja (słownik 2011), intensywność B → M;
//  • powierzchnia siedliska: w karcie wartość pusta, ocena FV – formularz wpisuje etykietę klasy;
//  • ocena ogólna: udział powierzchni FV 95%, U1 5%, U2 0% – w „Innych informacjach”; data wypełnienia „–” – w uwagach.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology6170 } from './methodology'

const COORD = 'N 49°14′; E 19°53′'
const UNIT = 'Zbiorowisko ze związku Seslerion tatrae'

type Row = { layer: 'B' | 'C' | 'D'; name: string; abundance: string }
/** „Agrostis rupestris +; Cetraria islandica (D) 3; …” → wiersze; domyślnie warstwa C, „(B)”/„(C)”/„(D)” po nazwie ją zmienia. */
const list = (spec: string): Row[] =>
  spec.split('; ').map((s) => {
    const i = s.lastIndexOf(' ')
    const abundance = s.slice(i + 1)
    const m = /^(.*) \(([BCD])\)$/.exec(s.slice(0, i))
    return m ? { layer: m[2] as Row['layer'], name: m[1], abundance } : { layer: 'C', name: s.slice(0, i), abundance }
  })

const releve = (
  o: { altitude: number; slope: number; coverB?: number; coverC: number; coverD: number; heightB?: number; heightC: number },
  species: Row[],
) => ({
  coords: COORD,
  unit: UNIT,
  area: 25,
  exposure: 'W',
  coverA: undefined,
  coverB: undefined,
  heightA: undefined,
  heightB: undefined,
  heightD: undefined,
  ...o,
  species,
})

/** „a, b, c” → wiersze listy gatunków bez pokrycia. */
const names = (spec: string) => spec.split(', ').map((name) => ({ name }))

const VALUABLE_NOTE =
  'storczykowate: potrostek alpejski Chamorchis alpina* (PCzKR, CzKKP, CL, CHR), ozorka zielona Coeloglossum viride (CL, CHR), gółka długoostrogowa Gymnadenia conopsea (CHR), listera jajowata Listera ovata (CHR), storczyca kulista Traunsteinera globosa (CHR). Inne: mietlica skalna Agrostis rupestris*, przywrotnik siwy Alchemilla flabellata* (CL), naradka włosista Androsace chamaejasme*, tomka alpejska Anthoxanthum alpinum*, piaskowiec orzęsiony Arenaria tenella*, bartsia alpejska Bartsia alpina*, stokrotnica górska Bellidiastrum michelii*, pleszczotka górska Biscutella laevigata (CL), podejźrzon księżycowy Botrychium lunaria (CL, ch), dzwonek wąskolistny Campanula polymorpha*, turzyca zawsze zielona Carex sempervirens subsp. tatrorum*, goździk postrzępiony wczesny Dianthus plumarius subsp. praecox* (CHR), dębik ośmiopłatkowy Dryas octopetala*, przymiotno węgierskie Erigeron hungaricus* (PCzKR, CzKKP, CL), świetlik salzburski Euphrasia salisburgensis*, świetlik tatrzański Euphrasia tatrae*, kostrzewa pstra Festuca versicolor, goryczka śniegowa Gentiana nivalis* (CHR), goryczka wiosenna Gentiana verna* (CHR), posłonek rozesłany wielkokwiatowy Helianthemum nummularium subsp. grandiflorum, sit skucina Juncus trifidus*, brodawnik tatrzański Leontodon pseudotaraxaci*, szarotka alpejska Leontopodium alpinum* (CHR), marchwica pospolita Mutellina purpurea*, len karpacki Linum extraaxillare*, mokrzyca rozchodnikowata Minuartia sedoides*, gnidosz okółkowy Pedicularis verticillata* (CHR), zerwa kulista Phyteuma orbiculare (CHR), kosodrzewina Pinus mugo* (CHR), wiechlina alpejska Poa alpina*, rdest żyworodny Polygonum viviparum*, jaskier okrągłolistny Ranunculus thora*, różeniec górski Rhodiola rosea*, wierzba alpejska Salix alpina*, wierzba żyłkowana Salix reticulata*, skalnica nakrapiana Saxifraga aizoides*, skalnica gronkowa Saxifraga paniculata (CHR), skalnica tatrzańska Saxifraga wahlenbergii*, driakiew lśniąca Scabiosa lucida*, widliczka ostrozębna Selaginella selaginoides* (CHR), sesleria tatrzańska Sesleria tatrae, lepnica bezłodygowa Silene acaulis subsp. pannonica*, macierzanka nadobna Thymus pulcherrimus*, koniczyna brunatna Trifolium badium*, przetacznik różyczkowaty Veronica aphylla*, przetacznik krzewinkowy Veronica fruticans*. (* – gatunek wysokogórski; PCzKR – Polska Czerwona Księga Roślin; CzKKP – Czerwona Księga Karpat Polskich; CL – czerwona lista 2006; CHR – gatunek chroniony)'

const CALCICOLE_NOTE =
  'przywrotnik siwy Alchemilla flabellata*, naradka włosista Androsace chamaejasme*, piaskowiec orzęsiony Arenaria tenella, bartsia alpejska Bartsia alpina*, stokrotnica górska Bellidiastrum michelii*, pleszczotka górska Biscutella laevigata*, potrostek alpejski Chamorchis alpina*, goździk postrzępiony wczesny Dianthus plumarius subsp. praecox*, dębik ośmiopłatkowy Dryas octopetala*, przymiotno węgierskie Erigeron hungaricus*, świetlik salzburski Euphrasia salisburgensis, świetlik tatrzański Euphrasia tatrae, przytulia nierównolistna Galium anisophyllon, goryczka śniegowa Gentiana nivalis, goryczka wiosenna Gentiana verna*, posłonek rozesłany wielkokwiatowy Helianthemum nummularium subsp. grandiflorum*, brodawnik tatrzański Leontodon pseudotaraxaci, szarotka alpejska Leontopodium alpinum, len karpacki Linum extraaxillare, gnidosz okółkowy Pedicularis verticillata*, zerwa kulista Phyteuma orbiculare*, jaskier skalny Ranunculus oreophilus*, jaskier okrągłolistny Ranunculus thora, wierzba alpejska Salix alpina*, wierzba żyłkowana Salix reticulata, skalnica nakrapiana Saxifraga aizoides, skalnica gronkowa Saxifraga paniculata*, skalnica tatrzańska Saxifraga wahlenbergii, driakiew lśniąca Scabiosa lucida*, widliczka ostrozębna Selaginella selaginoides*, sesleria tatrzańska Sesleria tatrae*, macierzanka nadobna Thymus pulcherrimus*, koniczyna brunatna Trifolium badium, przetacznik różyczkowaty Veronica aphylla, przetacznik krzewinkowy Veronica fruticans. (* gatunki charakterystyczne lub wyróżniające dla związku Seslerion tatrae)'

const ACID_NOTE =
  'mietlica skalna Agrostis rupestris, podbiałek alpejski Homogyne alpina, sit skucina Juncus trifidus, kosmatka gajowa Luzula luzuloides, gruszyczka jednokwiatowa Moneses uniflora, pięciornik złoty Potentilla aurea'

export const uplazianskaKopa2: CardValues = {
  ...emptyCardValues(methodology6170),
  site: {
    subtype: '6170-1',
    rockFace: '',
    areaName: 'Tatry',
    siteName: 'Upłaziańska Kopa 2',
    guid: '',
    protectedAreas: 'Tatrzański Park Narodowy',
    natura2000: 'PLC120001 Tatry (Specjalny Obszar Ochrony siedlisk oraz Obszar Specjalnej Ochrony Ptaków)',
    coords: 'Początek (zdj. nr 1): N 49°14′, E 19°53′; środek (zdj. nr 2): N 49°14′, E 19°53′; koniec (zdj. nr 3): N 49°14′, E 19°53′',
    altitude: '1760–1785',
    description:
      'Klasycznie wykształcone, wielkopowierzchniowe, niskie lecz zwarte i bardzo bogate florystycznie murawy w górnej części zachodniego stoku Upłaziańskiej Kopy.',
    communities: 'Zbiorowiska ze związku Seslerion tatrae',
    areaHa: '0,18 ha (100% transektu). Poza transektem siedlisko zajmuje w tym rejonie przynajmniej kilkadziesiąt hektarów. Areał stabilny.',
    transect: '120 × 15 m',
    observer: 'Jan Kowalski',
    additionalExperts: 'Anna Nowak',
    date: '2010-08-03',
  },
  releves: [
    releve(
      { altitude: 1785, slope: 20, coverC: 80, coverD: 40, heightC: 10 },
      list(
        'Agrostis rupestris +; Androsace chamaejasme 1; Anthoxanthum alpinum 1; Arenaria tenella +; Botrychium lunaria +; Campanula polymorpha +; Carex sempervirens subsp. tatrorum +; Cetraria islandica (D) 3; Cetraria sp. (D) 1; Chamorchis alpina +; Coeloglossum viride +; Dryas octopetala 3; Erigeron hungaricus 1; Euphrasia salisburgensis +; Euphrasia tatrae 1; Festuca versicolor 2; Galium anisophyllon +; Gentiana nivalis +; Gentiana verna +; Gymnadenia conopsea +; Helianthemum nummularium subsp. grandiflorum +; Leontodon pseudotaraxaci +; Luzula multiflora +; Parnassia palustris +; Pedicularis verticillata 2; Phyteuma orbiculare +; Poa alpina +; Polygonum viviparum 1; Ranunculus thora +; Rhodiola rosea +; Salix alpina +; Salix reticulata +; Saxifraga paniculata 1; Scabiosa lucida 1; Selaginella selaginoides +; Silene acaulis subsp. pannonica +; Thamnolia vermicularis (D) +; Thymus pulcherrimus +; Traunsteinera globosa +; Trifolium badium 3; Trifolium pratense +; Poaceae indet. +',
      ),
    ),
    releve(
      { altitude: 1775, slope: 35, coverB: 2, coverC: 75, coverD: 30, heightB: 0.5, heightC: 10 },
      list(
        'Pinus mugo (B) +; Pinus mugo (C) +; Agrostis rupestris 1; Alchemilla flabellata +; Androsace chamaejasme +; Anthoxanthum alpinum 1; Bartsia alpina +; Bellidiastrum michelii +; Botrychium lunaria +; Campanula polymorpha 1; Carex sempervirens subsp. tatrorum +; Cetraria islandica (D) 3; Cetraria sp. (D) +; Chamorchis alpina +; Coeloglossum viride +; Dryas octopetala 3; Erigeron hungaricus 2; Euphrasia salisburgensis +; Euphrasia tatrae 1; Festuca versicolor 2; Galium anisophyllon +; Gentiana nivalis +; Gymnadenia conopsea +; Hieracium sp. +; Leontopodium alpinum +; Luzula multiflora +; Minuartia sedoides +; Moneses uniflora +; Parnassia palustris +; Pedicularis verticillata 1; Picea abies (C) +; Polygonum viviparum 2; Ranunculus oreophilus +; Salix alpina 2; Saxifraga paniculata +; Scabiosa lucida 1; Selaginella selaginoides 1; Sesleria tatrae +; Silene acaulis subsp. pannonica +; Thymus pulcherrimus +; Traunsteinera globosa +; Trifolium badium 2; Veronica aphylla +; Veronica fruticans +',
      ),
    ),
    releve(
      { altitude: 1760, slope: 40, coverC: 90, coverD: 30, heightC: 10 },
      list(
        'Agrostis rupestris +; Alchemilla flabellata +; Androsace chamaejasme +; Anthoxanthum alpinum 1; Arenaria tenella +; Botrychium lunaria +; Campanula polymorpha 1; Cerastium holosteoides +; Cetraria islandica (D) 3; Chamorchis alpina +; Coeloglossum viride 1; Dianthus plumarius subsp. praecox +; Dryas octopetala 2; Euphrasia salisburgensis +; Euphrasia tatrae 2; Festuca versicolor 2; Galium anisophyllon 1; Gentiana verna +; Gymnadenia conopsea +; Homogyne alpina +; Linum extraaxillare +; Listera ovata +; Luzula luzuloides 1; Luzula multiflora +; Mutellina purpurea 1; Parnassia palustris 1; Pedicularis verticillata +; Phyteuma orbiculare +; Picea abies (C) +; Polygonum viviparum 2; Potentilla aurea +; Ranunculus oreophilus +; Rhodiola rosea +; Salix alpina 1; Salix reticulata +; Saxifraga wahlenbergii +; Scabiosa lucida +; Selaginella selaginoides +; Sesleria tatrae 1; Silene acaulis subsp. pannonica +; Thymus pulcherrimus +; Trifolium badium 3; Trifolium pratense 4',
      ),
    ),
  ],
  indicators: {
    area: {
      inputs: { choice: 'stable', areaText: '', note: '' },
      value: 'Nie podlega zmianom lub zwiększa się',
      grade: 'FV',
    },
    richness: {
      inputs: { count: 40, note: '' },
      value: 'Wyjątkowo duże, ok. 40 gat. roślin naczyniowych/25 m²',
      grade: 'FV',
    },
    valuable: {
      inputs: {
        species: names(
          'Chamorchis alpina, Coeloglossum viride, Gymnadenia conopsea, Listera ovata, Traunsteinera globosa, Agrostis rupestris, Alchemilla flabellata, Androsace chamaejasme, Anthoxanthum alpinum, Arenaria tenella, Bartsia alpina, Bellidiastrum michelii, Biscutella laevigata, Botrychium lunaria, Campanula polymorpha, Carex sempervirens subsp. tatrorum, Dianthus plumarius subsp. praecox, Dryas octopetala, Erigeron hungaricus, Euphrasia salisburgensis, Euphrasia tatrae, Festuca versicolor, Gentiana nivalis, Gentiana verna, Helianthemum nummularium subsp. grandiflorum, Juncus trifidus, Leontodon pseudotaraxaci, Leontopodium alpinum, Mutellina purpurea, Linum extraaxillare, Minuartia sedoides, Pedicularis verticillata, Phyteuma orbiculare, Pinus mugo, Poa alpina, Polygonum viviparum, Ranunculus thora, Rhodiola rosea, Salix alpina, Salix reticulata, Saxifraga aizoides, Saxifraga paniculata, Saxifraga wahlenbergii, Scabiosa lucida, Selaginella selaginoides, Sesleria tatrae, Silene acaulis subsp. pannonica, Thymus pulcherrimus, Trifolium badium, Veronica aphylla, Veronica fruticans',
        ),
        count: undefined,
        choice: '',
        note: `51 gat. ${VALUABLE_NOTE}`,
      },
      value: `51 gat. ${VALUABLE_NOTE}`,
      grade: 'FV',
    },
    erosion: {
      inputs: { choice: 'local', share: undefined, note: 'Nasilona tylko w niektórych miejscach, widoczne ślady erozji wodnej oraz grawitacyjnych ruchów masowych.' },
      value: 'Nasilona tylko w niektórych miejscach, widoczne ślady erozji wodnej oraz grawitacyjnych ruchów masowych.',
      grade: 'U1',
    },
    expansive: {
      inputs: { species: [], herbTotal: undefined, woodyTotal: undefined, none: 'yes', choice: '', note: 'Brak' },
      value: 'Brak',
      grade: 'FV',
    },
    calcicole: {
      inputs: {
        species: names(
          'Alchemilla flabellata, Androsace chamaejasme, Arenaria tenella, Bartsia alpina, Bellidiastrum michelii, Biscutella laevigata, Chamorchis alpina, Dianthus plumarius subsp. praecox, Dryas octopetala, Erigeron hungaricus, Euphrasia salisburgensis, Euphrasia tatrae, Galium anisophyllon, Gentiana nivalis, Gentiana verna, Helianthemum nummularium subsp. grandiflorum, Leontodon pseudotaraxaci, Leontopodium alpinum, Linum extraaxillare, Pedicularis verticillata, Phyteuma orbiculare, Ranunculus oreophilus, Ranunculus thora, Salix alpina, Salix reticulata, Saxifraga aizoides, Saxifraga paniculata, Saxifraga wahlenbergii, Scabiosa lucida, Selaginella selaginoides, Sesleria tatrae, Thymus pulcherrimus, Trifolium badium, Veronica aphylla, Veronica fruticans',
        ),
        count: undefined,
        choice: '',
        note: `35 gat. ${CALCICOLE_NOTE}`,
      },
      value: `35 gat. ${CALCICOLE_NOTE}`,
      grade: 'FV',
    },
    synanthropic: {
      inputs: { species: [], planted: undefined, none: 'yes', note: 'Brak' },
      value: 'Brak',
      grade: 'FV',
    },
    acidophilous: {
      inputs: {
        species: names('Agrostis rupestris, Homogyne alpina, Juncus trifidus, Luzula luzuloides, Moneses uniflora, Potentilla aurea'),
        count: undefined,
        none: '',
        note: `6 gat. ${ACID_NOTE}`,
      },
      value: `6 gat. ${ACID_NOTE}`,
      grade: 'U1',
    },
    shrubs: {
      inputs: { species: [], total: undefined, level: 'negligible', mugoOnly: '', note: 'Znikome' },
      value: 'Znikome',
      grade: 'FV',
    },
    habitatShare: { inputs: { value: 100, note: '' }, value: '100', grade: 'FV' },
    calcicolePopulation: {
      inputs: { choice: 'fv', note: 'Gatunki liczne o nieobniżonej żywotności, zdecydowanie dominujące w transekcie.' },
      value: 'Gatunki liczne o nieobniżonej żywotności, zdecydowanie dominujące w transekcie.',
      grade: 'FV',
    },
    acidophilousPopulation: {
      inputs: { choice: 'fv', cover: undefined, note: 'Gatunki nieliczne, rosną w postaci pojedynczych, często płonych, osobników.' },
      value: 'Gatunki nieliczne, rosną w postaci pojedynczych, często płonych, osobników.',
      grade: 'FV',
    },
    spatialStructure: {
      inputs: {
        choice: 'fv',
        note: 'Murawy zwarte i stosunkowo jednolite, o bardzo dużej powierzchni, zaburzone tylko w nielicznych miejscach w wyniku nasilonej erozji.',
      },
      value: 'Murawy zwarte i stosunkowo jednolite, o bardzo dużej powierzchni, zaburzone tylko w nielicznych miejscach w wyniku nasilonej erozji.',
      grade: 'FV',
    },
    trampling: { inputs: { choice: 'fv', note: 'Brak' }, value: 'Brak', grade: 'FV' },
    herbCover: { inputs: { value: 80, note: '' }, value: 'Ok. 80%', grade: 'FV' },
  },
  prospects: {
    value: 'Właściwe ze względu na położenie z dala od szlaków, na terenie Tatrzańskiego Parku Narodowego.',
    grade: 'FV',
  },
  impacts: [
    {
      code: 'K01.01',
      name: 'Erozja',
      influence: '-',
      intensity: 'M',
      description: 'Erozja nasilona tylko w niektórych miejscach. (W karcie: kod 900 „Erozja”, intensywność B.)',
    },
  ],
  threats: [],
  other: {
    otherValues: '',
    conservation: '',
    proposals: '',
    shareFV: 95,
    shareU1: 5,
    shareU2: 0,
    notes: 'Rok: 2010. Data wypełnienia w karcie: –. Obserwatorów w karcie dwóch (zanonimizowani).',
    photos: [],
  },
  overallComment: '',
}

export const examples6170: CardExample[] = [{ id: 'uplazianska-kopa-2', label: 'Upłaziańska Kopa 2', values: uplazianskaKopa2 }]
