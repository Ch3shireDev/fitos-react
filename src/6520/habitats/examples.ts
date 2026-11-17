// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Korzeniak 2012, rozdz. 6520, pkt 3 „Przykład wypełnionej
// karty obserwacji”): Lasówka (Dzika Orlica), 25.07.2009. Obserwator zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („N 50° 18′ …″ – E 16° 26′ …″”) – przepisane do minut;
//  • podtyp „6520-1 Sudecka łąka konietlicowa” z nagłówka karty; region: Sudety;
//  • zdjęcia: warstwa C 100%, D 20–30%, wysokość runi 0,5–0,6 m → 50–60 cm; głóg jednoszyjkowy „juv. +” w runi (warstwa C,
//    uwaga w zdjęciu I); mszaki (d) w warstwie D;
//  • oceny wskaźników jak w karcie. Tam, gdzie ekspert odszedł od progów tab. 2, ocena jest wybrana w polu „Ocena” i
//    formularz to sygnalizuje: gatunki charakterystyczne (5 gatunków → z progu U1, ekspert FV), procent powierzchni
//    (80% → z progu FV, ekspert U1 – sprawozdanie 2016–2018 uznało to za zaniżenie), wojłok (średnio 1 cm → z progu FV,
//    ekspert U1 – grubszy w płatach ziołoroślowych);
//  • oddziaływania: stare kody (2009) → słownik 2011: 102 → A03, 403 → E01.03, 502 → D01.02, 511 → D02.01;
//    intensywność B → M, C → L; stary kod w opisie;
//  • zagrożeń karta nie wymienia osobno – planowana zabudowa jest w perspektywach ochrony i w oddziaływaniach;
//  • data wypełnienia (24.09.2009) i typ monitoringu – w uwagach.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology6520 } from './methodology'

const COORD = 'N 50°18′ – E 16°26′'

/** „Achillea millefolium 1, Agrostis capillaris 3, …” → wiersze; „(d)” – warstwa D. */
const list = (spec: string) =>
  spec.split(', ').map((s) => {
    const i = s.lastIndexOf(' ')
    const raw = s.slice(0, i)
    const moss = raw.endsWith(' (d)')
    return { layer: moss ? ('D' as const) : ('C' as const), name: moss ? raw.slice(0, -4) : raw, abundance: s.slice(i + 1) }
  })

const releve = (o: { coverD: number; heightC: number; unit: string; remarks?: string }, spec: string) => ({
  coords: COORD,
  altitude: 710,
  area: 25,
  slope: 10,
  exposure: 'SW',
  coverA: undefined,
  coverB: undefined,
  coverC: 100,
  coverD: o.coverD,
  heightA: undefined,
  heightB: undefined,
  heightC: o.heightC,
  heightD: undefined,
  unit: o.unit,
  species: list(spec),
  remarks: o.remarks ?? '',
})

const CHARACTERISTIC_NOTE =
  'Warstwa c: przywrotniki Alchemilla spp. 10%, pozostałe 1% lub <1%: rzeżusznik Hallera Cardaminopsis halleri, konietlica łąkowa Trisetum flavescens, bniec czerwony Melandrium rubrum, pępawa czarcikęsolistna Crepis succisifolia.'
const DOMINANT_NOTE =
  'Warstwa c: mietlica pospolita Agrostis capillaris 30%, dziurawiec czteroboczny Hypericum maculatum 30%, kostrzewa czerwona Festuca rubra 10%. Warstwa d: fałdownik nastroszony Rhytidiadelphus squarrosus 20%.'
const EXPANSIVE_NOTE =
  'Dziurawiec czteroboczny Hypericum maculatum 30%. Pozostałe ze znikomym pokrywaniem, m.in. podagrycznik pospolity Aegopodium podagraria, szczaw kędzierzawy Rumex crispus, poziewnik szorstki Galeopsis tetrahit.'
const SHRUBS_NOTE = 'Pokrycie łączne <1% – tylko pojedyncze i rozproszone osobniki juwenilne głogu jednoszyjkowego Crataegus monogyna.'
const PERCENT_NOTE = '80% i powoli zmniejsza się na skutek procesu ubożenia łąki. Zwiększa się udział gatunków acydofilnych diagnostycznych dla klasy Nardo-Callunetea.'
const LITTER_NOTE = '0,5–3 cm, średnio 1 cm, w płatach ziołoroślowych grubsza niż w traworoślach.'
const UNIT_PT = 'Zbiorowisko ze związku Polygono-Trisetion'

export const lasowka: CardValues = {
  ...emptyCardValues(methodology6520),
  site: {
    subtype: '6520-1 Sudecka łąka konietlicowa',
    region: 'sudety',
    siteName: 'Lasówka',
    guid: '',
    areaName: 'Dzika Orlica',
    protectedAreas: 'Sieć Natura 2000: SOO PLH020061 Dzika Orlica; Obszar Krajobrazu Chronionego Góry Bystrzyckie i Orlickie',
    manager: '',
    description:
      'Lasówka, zbocze doliny Dzikiej Orlicy w północnej części wsi. Blisko szosy. Większość to łąki górskie użytkowane kośnie. Zbocze o ekspozycji SW i niewielkim nachyleniu przeciętnie dziesięć stopni. Gleba gliniasta, kwaśna.',
    communities:
      'Zbiorowisko ze związku Polygono-Trisetion, zbiorowisko mietlicy pospolitej Agrostis capillaris (Arrhenatheretalia), zbiorowisko kłosówki miękkiej Holcus mollis (Arrhenatheretalia)',
    areaHa: '1,5 (±0,1)',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    altitude: '705–720',
    transect: '20x100 m trawersem zbocza',
    date: '2009-07-25',
    observer: 'Jan Kowalski',
    additionalExperts: '',
  },
  releves: [
    releve(
      { coverD: 30, heightC: 50, unit: UNIT_PT, remarks: 'Crataegus monogyna – osobnik juwenilny (juv.) w runi; warstwy B w zdjęciu brak.' },
      'Achillea millefolium 1, Aegopodium podagraria +, Agrostis capillaris 3, Alchemilla monticola 1, Alopecurus pratensis +, Angelica sylvestris +, Avenula pubescens +, Briza media +, Campanula rotundifolia +, Cardaminopsis halleri +, Centaurea jacea +, Cirsium palustre +, Crataegus monogyna +, Crepis succisifolia +, Dactylis glomerata +, Deschampsia caespitosa +, Euphrasia stricta +, Festuca rubra 2, Galeopsis tetrahit +, Galium mollugo 1, Hieracium pilosella +, Hieracium sulphureum +, Holcus mollis +, Hypericum maculatum 2, Lathyrus pratensis +, Leontodon autumnalis +, Leontodon hispidus 1, Leucanthemum vulgare +, Lotus corniculatus +, Luzula multiflora +, Nardus stricta +, Phleum pratense +, Plantago lanceolata +, Poa pratensis 2, Polygala vulgaris +, Potentilla erecta +, Ranunculus acris +, Rhinanthus minor +, Rumex acetosa +, Sanguisorba officinalis +, Stellaria graminea +, Trifolium pratense +, Trifolium repens 1, Trisetum flavescens 1, Veronica chamaedrys 2, Vicia cracca +, Vicia sepium +, Brachythecium sp. (d) +, Rhytidiadelphus squarrosus (d) 3',
    ),
    releve(
      { coverD: 20, heightC: 60, unit: UNIT_PT },
      'Achillea millefolium 1, Agrostis capillaris 3, Alchemilla monticola 2, Alopecurus pratensis +, Angelica sylvestris +, Briza media +, Campanula patula +, Campanula rotundifolia +, Cardaminopsis halleri +, Carex spicata +, Cirsium palustre +, Crepis succisifolia 1, Dactylis glomerata +, Festuca rubra 2, Galium mollugo +, Heracleum sphondylium +, Holcus mollis 2, Hypericum maculatum 3, Knautia arvensis +, Lathyrus pratensis +, Leontodon autumnalis +, Leucanthemum vulgare +, Luzula multiflora +, Melandrium rubrum +, Nardus stricta +, Phleum pratense +, Plantago lanceolata 1, Poa pratensis 1, Polygonum bistorta +, Potentilla erecta +, Prunella vulgaris +, Ranunculus acris +, Rhinanthus minor +, Rumex acetosa +, Rumex crispus +, Senecio ovatus +, Stellaria graminea +, Taraxacum officinale +, Trifolium pratense +, Trifolium repens +, Trisetum flavescens +, Veronica chamaedrys 1, Vicia cracca +, Vicia sepium +, Brachythecium sp. (d) +, Rhytidiadelphus squarrosus (d) 3',
    ),
    releve(
      { coverD: 20, heightC: 60, unit: 'Zbiorowisko z mietlicą pospolitą Agrostis capillaris z rzędu Arrhenatheretalia' },
      'Achillea millefolium 1, Agrostis capillaris 4, Alchemilla monticola 1, Alopecurus pratensis +, Angelica sylvestris 2, Anthoxanthum odoratum +, Avenula pubescens +, Briza media +, Campanula rotundifolia +, Cardaminopsis halleri +, Carex spicata +, Carex pallescens +, Crepis succisifolia +, Dactylis glomerata 1, Euphrasia stricta +, Festuca rubra 2, Galium mollugo +, Heracleum sphondylium +, Hieracium pilosella +, Hieracium sulphureum +, Holcus mollis 2, Hypericum maculatum 2, Knautia arvensis +, Lathyrus pratensis +, Leucanthemum vulgare +, Luzula multiflora +, Lychnis flos-cuculi +, Melandrium rubrum +, Nardus stricta 1, Phleum pratense +, Plantago lanceolata 1, Poa pratensis 1, Polygonum bistorta +, Potentilla erecta +, Ranunculus acris +, Rhinanthus minor +, Rumex acetosa +, Sanguisorba officinalis +, Senecio ovatus +, Solidago virgaurea +, Stellaria graminea +, Trifolium pratense +, Trifolium repens +, Trisetum flavescens +, Veronica chamaedrys 1, Vicia cracca +, Vicia sepium +, Rhytidiadelphus squarrosus (d) 2',
    ),
  ],
  indicators: {
    area: {
      inputs: { choice: 'stable', areaText: '1,5 ha (±0,1 ha)', note: 'Areał stabilny, 1,5 ha (±0,1 ha).' },
      value: 'Areał stabilny, 1,5 ha (±0,1 ha).',
      grade: 'FV',
    },
    percent: {
      inputs: { percent: 80, choice: 'U1', note: PERCENT_NOTE },
      value: PERCENT_NOTE,
      grade: 'U1',
    },
    spatial: {
      inputs: { choice: 'none', patchSize: '', note: 'Brak fragmentacji, zwarty płat.' },
      value: 'Brak fragmentacji, zwarty płat.',
      grade: 'FV',
    },
    characteristic: {
      inputs: {
        species: [
          { name: 'Alchemilla spp.', cover: 10 },
          { name: 'Cardaminopsis halleri', cover: 1 },
          { name: 'Trisetum flavescens', cover: 1 },
          { name: 'Melandrium rubrum', cover: 1 },
          { name: 'Crepis succisifolia', cover: 1 },
        ],
        count: undefined,
        choice: 'FV',
        note: CHARACTERISTIC_NOTE,
      },
      value: CHARACTERISTIC_NOTE,
      grade: 'FV',
    },
    dominant: {
      inputs: {
        species: [
          { name: 'Agrostis capillaris', cover: 30 },
          { name: 'Hypericum maculatum', cover: 30 },
          { name: 'Festuca rubra', cover: 10 },
          { name: 'Rhytidiadelphus squarrosus', cover: 20 },
        ],
        choice: '',
        note: DOMINANT_NOTE,
      },
      value: DOMINANT_NOTE,
      grade: 'FV',
    },
    aliens: {
      inputs: { species: [], total: undefined, none: 'yes', note: '' },
      value: 'Brak',
      grade: 'FV',
    },
    expansive: {
      inputs: {
        species: [{ name: 'Hypericum maculatum', cover: 30 }, { name: 'Aegopodium podagraria' }, { name: 'Rumex crispus' }, { name: 'Galeopsis tetrahit' }],
        total: undefined,
        none: '',
        choice: '',
        note: EXPANSIVE_NOTE,
      },
      value: EXPANSIVE_NOTE,
      grade: 'FV',
    },
    shrubs: {
      inputs: { species: [{ name: 'Crataegus monogyna' }], total: 0.5, none: '', note: SHRUBS_NOTE },
      value: SHRUBS_NOTE,
      grade: 'FV',
    },
    ecotone: {
      inputs: { choice: 'none', width: undefined, note: 'Brak ekotonu.' },
      value: 'Brak ekotonu.',
      grade: 'FV',
    },
    litter: {
      inputs: { min: 0.5, max: 3, mean: 1, choice: 'U1', note: LITTER_NOTE },
      value: LITTER_NOTE,
      grade: 'U1',
    },
  },
  prospects: {
    value: 'Teren prawdopodobnie planowanej budowy domu jednorodzinnego, inwestycja zniszczy siedlisko na tym stanowisku.',
    grade: 'U1',
  },
  impacts: [
    {
      code: 'A03',
      name: 'Koszenie / ścinanie trawy',
      influence: '+',
      intensity: 'M',
      description: 'Całość powierzchni jest koszona, siano jest zabierane, regularność koszenia nieznana. (Kod w karcie z 2009 r.: 102 Koszenie/ścinanie, intensywność B.)',
    },
    {
      code: 'E01.03',
      name: 'Zabudowa rozproszona',
      influence: '-',
      intensity: 'M',
      description:
        'Teren prawdopodobnie do zabudowy jednorodzinnej. W roku 2007–2009 wybudowano szutrowy zjazd z szosy na łąkę. W sąsiedztwie w płatach podobnych łąk już wybudowano kilka domów jednorodzinnych – rozwija się funkcja letniskowa wsi. (Kod w karcie z 2009 r.: 403 Zabudowa rozproszona, intensywność B.)',
    },
    {
      code: 'D01.02',
      name: 'Drogi, autostrady',
      influence: '0',
      intensity: 'L',
      description: 'Od wschodniej strony przylega do transektu szosa asfaltowa – droga wojewódzka nr 389. (Kod w karcie z 2009 r.: 502 Drogi, szosy, intensywność C.)',
    },
    {
      code: 'D02.01',
      name: 'Linie elektryczne i telefoniczne',
      influence: '0',
      intensity: 'L',
      description: 'W sąsiedztwie przechodzi napowietrzna linia elektryczna (słupy). (Kod w karcie z 2009 r.: 511 Linie elektryczne, intensywność C.)',
    },
  ],
  threats: [],
  other: {
    ...emptyCardValues(methodology6520).other,
    otherValues: '',
    conservation: '',
    proposals: '',
    monitoringRequired: '',
    justification: '',
    shareFV: 40,
    shareU1: 60,
    shareU2: 0,
    notes:
      'Data wypełnienia karty: 24.09.2009. Współrzędne w przewodniku podane do minut (sekundy ucięte). Transekt 20x100 m (20 arów) zamiast 10x200 m. Zagrożeń karta nie wymienia osobno – planowana zabudowa opisana w perspektywach ochrony i oddziaływaniach.',
    photos: [],
  },
  overallComment: '',
}

export const examples6520: CardExample[] = [{ id: 'lasowka', label: 'Lasówka', values: lasowka }]
