// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Koczur 2012, rozdz. 7230, pkt 3 „Przykład wypełnionej karty
// obserwacji”): Za Stronią (Pieniny), 15.07.2009. Ekspert zanonimizowany (Jan Kowalski).
//  • podtyp 7230-1 (młaki górskie), typ stanowiska „Badawcze”, transekt „0,2 ha” – jak w karcie;
//  • współrzędne w przewodniku podane do minut („N 49°24′ – E 20°22′”) – wspólne dla trzech punktów transektu;
//  • gatunki charakterystyczne: polskie nazwy z karty przepisane na łacińskie (turzyca prosowata = Carex panicea,
//    ponikło skąpokwiatowe = Eleocharis quinqueflora, limprichtia pośrednia = Limprichtia cossonii);
//  • pH: karta podaje tylko zakres „7,2–7,6” – wpisany jako min/max;
//  • krzewy: kalina 1% + świerk 1% = 2% to wg tab. 2 U1, ekspert dał FV („pojedyncze”) – ocena ekspercka, formularz ostrzega;
//  • zdjęcia: siewki świerka i leszczyny („c”) w warstwie C; „Euphrasia sp.”, „Polygala sp.” – do rodzaju;
//  • oddziaływania: stary kod 140 Wypas, intensywność A → A04 Wypas, H; wpływ 0 jak w karcie;
//  • zagrożenia: „Zaniechanie użytkowania, sukcesja wtórna” → A03.03 i K02.01;
//  • sprawozdanie 2009–2011 podaje dla Za Stronią strukturę FV, karta w przewodniku – U1; przykład idzie za kartą.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology7230 } from './methodology'

const COORD = 'N 49°24′ – E 20°22′'

/** „Briza media 3, Carex flacca 1, …” → wiersze jednej warstwy; „Picea abies (c) +” → siewka w warstwie C. */
const list = (layer: 'C' | 'D', spec: string) =>
  spec.split(', ').map((s) => {
    const i = s.lastIndexOf(' ')
    return { layer, name: s.slice(0, i).replace(/ \(c\)$/, '').replace(/ sp\.$/, ''), abundance: s.slice(i + 1) }
  })

const releve = (o: { altitude: number; slope: number; exposure: string; coverC: number; coverD: number; heightC: number }, c: string, d: string) => ({
  coords: COORD,
  altitude: o.altitude,
  area: 25,
  slope: o.slope,
  exposure: o.exposure,
  coverA: undefined,
  coverB: undefined,
  coverC: o.coverC,
  coverD: o.coverD,
  heightA: undefined,
  heightB: undefined,
  heightC: o.heightC,
  heightD: 5,
  unit: 'Valeriano-Caricetum flavae',
  species: [...list('C', c), ...list('D', d)],
  remarks: '',
})

const AREA_NOTE = 'Jednorodna, zwarta powierzchnia siedliska zapewnia ciągłość istnienia młaki eutroficznej na stanowisku.'
const SHARE_NOTE =
  'Transekt został wyznaczony w największym kompleksie młak eutroficznych reprezentujących siedlisko 7230 w obszarze Pieniny, w taki sposób, aby nie ujmował innych zbiorowisk, które nie należą do siedliska.'
const CHARACTERISTIC_NOTE =
  'Warstwa C: kozłek całolistny Valeriana simplicifolia – 5%, kruszczyk błotny Epipactis palustris – 2%, ponikło skąpokwiatowe Eleocharis quinqueflora – 1%, turzyca Davalla Carex davalliana – 10%, turzyca prosowata Carex panicea – 10%, turzyca żółta Carex flava – 1%, wełnianka szerokolistna Eriophorum latifolium – 2%. Warstwa D: Tomentypnum nitens – 1%, Limprichtia cossonii – 5%, Campylium stellatum – 5%.'
const DOMINANT_NOTE = 'Skrzyp błotny Equisetum palustre – 25%.'
const MOSSES_NOTE = '70% wyłącznie mchy brunatne.'
const ALIENS_NOTE = 'Na stanowisku nie stwierdzono obcych gatunków.'
const EXPANSIVE_NOTE = 'Sadziec konopiasty Eupatorium cannabinum – 5%.'
const WOODY_NOTE = 'Kalina koralowa Viburnum opulus – 1%, świerk pospolity Picea abies – 1%.'
const HYDRATION_NOTE =
  'W miejscach wykonania zdjęć fitosocjologicznych woda wypływa na powierzchnię gleby podczas chodzenia, ale stanowisko nie nosi śladów zalewania. Pomiędzy zdjęciami podobnie – gleba jest przesiąknięta wodą, ale bez znamion zalewania.'
const PEAT_NOTE = 'Na stanowisku brak śladów pozyskiwania torfu.'
const DRAINAGE_NOTE = 'Na stanowisku brak jakiejkolwiek infrastruktury melioracyjnej.'

export const zaStronia: CardValues = {
  ...emptyCardValues(methodology7230),
  site: {
    subtype: '7230-1',
    siteName: 'Za Stronią',
    guid: '',
    siteType: 'Badawcze',
    areaName: 'Pieniny',
    communities: 'Valeriano-Caricetum flavae',
    description:
      'Największy w Pieninach kompleks bogatych florystycznie młak eutroficznych na polanie wśród lasu, na gruntach prywatnych. Młaka nieużytkowana, z incydentalnym przepędem owiec, podlega naturalnej sukcesji.',
    areaHa: '1,44',
    protectedAreas: 'Pieniński Park Narodowy, Obszar Natura 2000 „Pieniny” PLH120013, Obszar Natura 2000 „Pieniny” PLB120008',
    manager: 'Osoby fizyczne – właściciele gruntów',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '0,2 ha',
    altitude: '640–670',
    date: '2009-07-15',
    observer: 'Jan Kowalski',
    additionalExperts: '',
  },
  releves: [
    releve(
      { altitude: 640, slope: 2, exposure: 'S', coverC: 98, coverD: 100, heightC: 30 },
      'Achillea millefolium +, Briza media 3, Calamagrostis varia +, Caltha palustris +, Carex davalliana 3, Carex flacca 1, Carex flava +, Carex nigra 2, Carex panicea 2, Centaurea jacea +, Cirsium rivulare +, Colchicum autumnale +, Crepis paludosa +, Deschampsia caespitosa +, Epipactis palustris +, Equisetum fluviatile +, Equisetum palustre 3, Equisetum variegatum 1, Eriophorum latifolium 1, Eupatorium cannabinum +, Festuca pratensis +, Festuca rubra 1, Galium mollugo +, Gymnadenia conopsea +, Juncus articulatus +, Juncus inflexus +, Knautia arvensis +, Lathyrus pratensis +, Leontodon hispidus +, Linum catharticum +, Lychnis flos-cuculi +, Lysimachia vulgaris +, Mentha arvensis 1, Ononis vulgaris +, Picea abies (c) +, Plantago lanceolata +, Poa trivialis +, Potentilla erecta 2, Prunella vulgaris 1, Ranunculus acris 1, Tussilago farfara +, Valeriana simplicifolia 1, Vicia cracca +',
      'Calliergonella cuspidata 2, Campylium stellatum 2, Climacium dendroides 1, Cratoneuron filicinum +, Plagiomnium elatum +, Tomentypnum nitens 3',
    ),
    releve(
      { altitude: 660, slope: 5, exposure: 'SE', coverC: 100, coverD: 80, heightC: 40 },
      'Briza media 1, Caltha palustris 1, Carex davalliana 2, Carex flacca 1, Carex nigra 1, Carex panicea 1, Carex rostrata +, Cirsium rivulare +, Crepis paludosa +, Cruciata glabra +, Dactylorhiza majalis 1, Deschampsia caespitosa +, Epipactis palustris 1, Equisetum palustre 4, Equisetum variegatum +, Eriophorum latifolium 1, Eupatorium cannabinum +, Festuca rubra 1, Galium mollugo +, Gymnadenia conopsea +, Juncus articulatus +, Lathyrus pratensis +, Lysimachia nummularia 1, Lysimachia vulgaris 1, Mentha arvensis +, Picea abies (c) +, Poa trivialis 1, Potentilla erecta 2, Prunella vulgaris +, Ranunculus acris +, Trifolium pratense +, Triglochin palustre +, Tussilago farfara +, Valeriana simplicifolia 2',
      'Bryum pseudotriquetrum +, Calliergonella cuspidata 2, Campylium stellatum +, Cratoneuron filicinum 3, Plagiomnium elatum 2',
    ),
    releve(
      { altitude: 670, slope: 1, exposure: 'SE', coverC: 90, coverD: 90, heightC: 20 },
      'Blysmus compressus +, Briza media 2, Calamagrostis varia +, Carex flacca 2, Carex nigra 1, Carex panicea 2, Carex paniculata +, Centaurea jacea +, Cirsium palustre +, Corylus avellana (c) +, Dactylorhiza majalis +, Eleocharis quinqueflora +, Epipactis palustris 1, Equisetum palustre +, Eriophorum latifolium +, Eupatorium cannabinum +, Euphrasia sp. +, Lathyrus pratensis +, Leontodon hispidus +, Linum catharticum +, Picea abies (c) +, Polygala sp. +, Potentilla erecta 3, Prunella vulgaris 2, Triglochin palustre +, Valeriana simplicifolia +',
      'Bryum pseudotriquetrum +, Campylium stellatum 2, Limprichtia cossonii 3, Philonotis calcarea +',
    ),
  ],
  indicators: {
    area: {
      inputs: { choice: 'stable', areaText: '1,44 ha', note: AREA_NOTE },
      value: AREA_NOTE,
      grade: 'FV',
    },
    share: {
      inputs: { share: 100, choice: '', note: SHARE_NOTE },
      value: `100%. ${SHARE_NOTE}`,
      grade: 'FV',
    },
    characteristic: {
      inputs: {
        species: [
          { name: 'Valeriana simplicifolia', cover: 5 },
          { name: 'Epipactis palustris', cover: 2 },
          { name: 'Eleocharis quinqueflora', cover: 1 },
          { name: 'Carex davalliana', cover: 10 },
          { name: 'Carex panicea', cover: 10 },
          { name: 'Carex flava', cover: 1 },
          { name: 'Eriophorum latifolium', cover: 2 },
          { name: 'Tomentypnum nitens', cover: 1 },
          { name: 'Limprichtia cossonii', cover: 5 },
          { name: 'Campylium stellatum', cover: 5 },
        ],
        count: undefined,
        total: undefined,
        choice: '',
        note: CHARACTERISTIC_NOTE,
      },
      value: CHARACTERISTIC_NOTE,
      grade: 'FV',
    },
    dominant: {
      inputs: { species: [{ name: 'Equisetum palustre', cover: 25 }], choice: '', note: DOMINANT_NOTE },
      value: DOMINANT_NOTE,
      grade: 'U1',
    },
    mosses: {
      inputs: { mossCover: 70, brownShare: 100, sphagnumShare: 0, note: MOSSES_NOTE },
      value: MOSSES_NOTE,
      grade: 'FV',
    },
    aliens: {
      inputs: { species: [], total: undefined, none: 'yes', note: ALIENS_NOTE },
      value: ALIENS_NOTE,
      grade: 'FV',
    },
    expansive: {
      inputs: { species: [{ name: 'Eupatorium cannabinum', cover: 5 }], total: undefined, none: '', choice: '', note: EXPANSIVE_NOTE },
      value: EXPANSIVE_NOTE,
      grade: 'U1',
    },
    ph: {
      inputs: { ph1: undefined, ph2: undefined, ph3: undefined, ph4: undefined, ph5: undefined, phMin: 7.2, phMax: 7.6, choice: '', note: '' },
      value: 'pH 7,2–7,6',
      grade: 'FV',
    },
    woody: {
      inputs: {
        species: [
          { name: 'Viburnum opulus', cover: 1 },
          { name: 'Picea abies', cover: 1 },
        ],
        total: undefined,
        none: '',
        choice: 'FV',
        note: WOODY_NOTE,
      },
      value: WOODY_NOTE,
      grade: 'FV',
    },
    hydration: {
      inputs: { depth1: undefined, depth2: undefined, depth3: undefined, depth4: undefined, depth5: undefined, piezometer: undefined, observed: 'wet', note: HYDRATION_NOTE },
      value: HYDRATION_NOTE,
      grade: 'FV',
    },
    peat: {
      inputs: { choice: 'none', method: '', damaged: undefined, note: PEAT_NOTE },
      value: PEAT_NOTE,
      grade: 'FV',
    },
    drainage: {
      inputs: { choice: 'none', note: DRAINAGE_NOTE },
      value: DRAINAGE_NOTE,
      grade: 'FV',
    },
  },
  prospects: {
    value:
      'Stanowisko leży w Pienińskim Parku Narodowym, ale na gruntach prywatnych, co uniemożliwia prowadzenie zabiegów ochronnych. Duży, jednorodny płat pozwala zachować siedlisko mimo silnej presji gatunków drzewiastych z otaczającego lasu.',
    grade: 'U1',
  },
  impacts: [
    {
      code: 'A04',
      name: 'Wypas',
      influence: '0',
      intensity: 'H',
      description:
        'Przepęd owiec kilkoma ścieżkami niszczy ruń i mchy w stopniu niezagrażającym siedlisku, a hamuje sukcesję drzew. Od 1998 r. nie zaobserwowano niekorzystnych zmian. (Kod w karcie z 2009 r.: 140 Wypas, intensywność A.)',
    },
  ],
  threats: [
    { code: 'A03.03', name: 'Zaniechanie / brak koszenia', description: 'Zaniechanie użytkowania.' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)', description: 'Sukcesja wtórna – presja drzew i krzewów z otaczającego lasu.' },
  ],
  other: {
    otherValues: 'W trzech miejscach relikt glacjalny mech błyszcze włoskowate Tomentypnum nitens; w 2009 r. stwierdzono storczyk wyblin jednolistny Malaxis monophyllos.',
    conservation: 'Aktualnie nie wykonuje się żadnych zabiegów z wyjątkiem incydentalnego, krótkiego wypasu podczas przepędu owiec.',
    proposals: 'Autor nie proponuje innych form ochrony. Uzasadnione byłoby wprowadzenie systemu motywacyjnego (dopłat) dla właścicieli polany.',
    monitoringRequired: 'tak',
    justification:
      'Największy w Pieninach kompleks bogatych florystycznie młak eutroficznych. Brak zabiegów ochronnych (grunty prywatne), incydentalny przepęd owiec, naturalna sukcesja – warto śledzić kierunek zmian.',
    shareFV: 90,
    shareU1: 10,
    shareU2: 0,
    notes:
      'Rok: 2009. Typ monitoringu: zintegrowany. Dodatkowi koordynatorzy – w karcie „–”. Współrzędne w przewodniku podane do minut. Krzewy (2%) wg tab. 2 dają U1 – ekspert ocenił je jako pojedyncze (FV). Sprawozdanie 2009–2011 podaje dla tego stanowiska strukturę FV, karta w przewodniku – U1.',
    photos: [],
  },
  overallComment: '',
}

export const examples7230: CardExample[] = [{ id: 'za-stronia', label: 'Za Stronią', values: zaStronia }]
