// Przykładowe wypełnienie z karty obserwacji w przewodniku metodycznym GIOŚ (rozdz. 65XX, „Przykład karty
// obserwacji dla siedliska przyrodniczego na stanowisku”): Wołosate, Bieszczadzki PN, 4.07.2013.
// Teksty „wartość lub opis” przepisane z karty, selekty ustawione zgodnie z ocenami z karty, „<1%” zapisane jako 0,5.
// Wykonawca zanonimizowany (Jan Kowalski). Współrzędne w przewodniku są ucięte („49° 03'…''”) – zostawione jak w źródle.
// Odstępstwa od karty:
// • wiersz „Procent powierzchni zajętej przez siedlisko na transekcie” (85%, FV) nie należy do wskaźników z tab. 1–2
//   przewodnika ani ze sprawozdań, więc formularz go nie ma; 85% trafiło do „Udziału dobrze zachowanych płatów”,
//   gdzie w karcie wpisano „brak” przy ocenie FV (zgodne z oceną ogólną „FV 85%, U1 15%”);
// • intensywność oddziaływań w karcie jest w starej skali A/B/C – C zapisane jako L (niska).
import type { CardValues, InputValues, Layer, ReleveSpeciesRow } from '../../7120/habitats/types'
import { BRAUN_BLANQUET } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import { methodology65XX } from './methodology'

/** „Achillea millefolium +, Angelica sylvestris 1” → wiersze zdjęcia (warstwa C, jak w karcie). */
export function parseReleveSpecies(text: string, layer: Layer = 'C'): ReleveSpeciesRow[] {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = /^(.*\S)\s+(\S+)$/.exec(s)
      const abundance = m?.[2] as ReleveSpeciesRow['abundance']
      if (!m || !(BRAUN_BLANQUET as readonly string[]).includes(abundance)) throw new Error(`Zła pozycja zdjęcia: „${s}”`)
      return { layer, name: m[1], abundance }
    })
}

const COORDS = "49° 03'…'' N 22° 41'…'' E"

const releve = (o: {
  altitude: number
  slope: number
  coverD: number
  heightC: number
  unit: string
  species: string
}): InputValues => ({
  coords: COORDS,
  altitude: o.altitude,
  area: 25,
  slope: o.slope,
  exposure: 'N',
  coverA: 0,
  coverB: 0,
  coverC: 100,
  coverD: o.coverD,
  heightA: undefined,
  heightB: undefined,
  heightC: o.heightC,
  heightD: undefined,
  unit: o.unit,
  species: parseReleveSpecies(o.species),
})

const RELEVE_I =
  'Achillea millefolium +, Agrostis capillaris +, Alchemilla acutiloba +, Alchemilla gracilis +, Alchemilla monticola +, Angelica sylvestris 1, Anthoxanthum odoratum 1, Briza media 1, Carex flava 2, Carex nigra 1, Carex ovalis +, Carex pallescens +, Carex panicea 1, Carex pilulifera +, Cirsium palustre +, Cirsium rivulare 2, Cruciata glabra +, Cynosurus cristatus 2, Dactylorhiza majalis +, Deschampsia caespitosa +, Equisetum arvense +, Equisetum palustre +, Festuca pratensis 2, Galium mollugo +, Holcus lanatus +, Juncus articulatus +, Juncus conglomeratus 1, Juncus effusus +, Lathyrus pratensis +, Leucanthemum vulgare +, Linum catharticum +, Listera ovata +, Lotus corniculatus 1, Luzula multiflora +, Lychnis flos-cuculi +, Lysimachia nummularia +, Myosotis palustris 1, Nardus stricta +, Phleum pratense +, Plantago lanceolata 1, Polygala vulgaris +, Potentilla erecta +, Prunella vulgaris +, Ranunculus acris 2, Ranunculus repens +, Rhinanthus serotinus +, Rumex acetosa +, Stellaria graminea +, Succisa pratensis 1, Trifolium hybridum 2, Trifolium medium +, Trifolium pratense 2, Trifolium repens +, Veronica chamaedrys +, Vicia cracca +'

const RELEVE_II =
  'Agrostis canina +, Agrostis capillaris +, Alchemilla acutiloba 1, Alchemilla glabra 1, Alchemilla gracilis 1, Angelica sylvestris 2, Anthoxanthum odoratum 1, Briza media 1, Caltha palustris +, Carex flava 2, Carex nigra +, Carex pallescens +, Carex panicea 2, Centaurea jacea +, Cirsium rivulare 3, Crepis paludosa +, Cruciata glabra 1, Cynosurus cristatus 1, Dactylis glomerata +, Danthonia decumbens +, Deschampsia caespitosa +, Equisetum palustre +, Festuca pratensis +, Galium mollugo +, Gymnadenia conopsea +, Holcus lanatus 2, Juncus articulatus +, Juncus conglomeratus +, Lathyrus pratensis +, Leucanthemum vulgare +, Linum catharticum +, Listera ovata r, Lotus corniculatus 1, Luzula multiflora +, Lychnis flos-cuculi +, Mentha arvensis +, Myosotis palustris +, Nardus stricta +, Plantago lanceolata 1, Polygala vulgaris +, Potentilla erecta +, Prunella vulgaris 1, Ranunculus acris 2, Ranunculus flammula +, Ranunculus repens +, Rhinanthus serotinus +, Succisa pratensis +, Trifolium hybridum 1, Trifolium medium +, Trifolium pratense 2, Veronica chamaedrys +, Vicia cracca +'

const RELEVE_III =
  'Agrostis capillaris +, Alchemilla acutiloba 1, Alchemilla monticola 1, Angelica sylvestris 1, Anthoxanthum odoratum 1, Briza media 2, Caltha palustris 2, Campanula patula +, Carex echinata +, Carex flava 2, Carex nigra 2, Carex pallescens +, Carex panicea 2, Cirsium rivulare 3, Crepis biennis r, Crepis paludosa 1, Cruciata glabra 1, Dactylis glomerata +, Dactylorhiza majalis +, Festuca pratensis 2, Galium mollugo +, Gymnadenia conopsea +, Holcus lanatus +, Juncus conglomeratus +, Juncus effusus +, Lathyrus pratensis +, Leucanthemum vulgare +, Linum catharticum +, Listera ovata r, Lotus corniculatus +, Luzula multiflora +, Lychnis flos-cuculi +, Mentha arvensis +, Myosotis palustris 1, Phleum pratense +, Plantago lanceolata 1, Polygala vulgaris +, Potentilla erecta +, Primula elatior r, Prunella vulgaris 1, Ranunculus acris 2, Ranunculus flammula +, Ranunculus repens +, Salix sp. r, Succisa pratensis +, Trifolium hybridum 1, Trifolium medium +, Trifolium pratense 2, Trifolium repens +, Valeriana simplicifolia 3, Veronica chamaedrys +, Vicia cracca +'

export const wolosate: CardValues = {
  ...emptyCardValues(methodology65XX),
  site: {
    siteName: 'Wołosate',
    guid: '',
    communities:
      'Cirsietum rivularis, zbiorowisko pośrednie między Cirsietum rivularis a Valeriano-Caricetum flavae, zbiorowisko pośrednie między Cirsietum rivularis a łąką mietlicową Agrostietum capillaris',
    description:
      'Rozległy, lecz silnie rozczłonkowany płat wilgotnej łąki z ostrożeniem łąkowym w mozaice z łąką świeżą (Agrostietum z Dactylis glomerata) i młaką eutroficzną, położony na północnym stoku Wołczego Berda. Łąka regularnie koszona.',
    areaHa: 0.2,
    protectedAreas: 'Bieszczadzki Park Narodowy\nPLC180001 Bieszczady',
    coordStart: COORDS,
    coordMiddle: COORDS,
    coordEnd: COORDS,
    transect: '11x180 m – ze względu na kształt i rozmiary płatu transekt nie jest prostoliniowy',
    altitude: '770–787',
    date: '2013-07-04',
    observer: 'Jan Kowalski',
  },
  releves: [
    releve({ altitude: 787, slope: 2, coverD: 80, heightC: 20, unit: 'Cirsietum rivularis', species: RELEVE_I }),
    releve({ altitude: 778, slope: 1, coverD: 50, heightC: 20, unit: 'Cirsietum rivularis', species: RELEVE_II }),
    releve({
      altitude: 770,
      slope: 1,
      coverD: 2,
      heightC: 25,
      unit: 'Cirsietum rivularis nawiązujące do Valeriano-Caricetum flavae',
      species: RELEVE_III,
    }),
  ],
  indicators: {
    area: { inputs: { choice: 'stable' }, value: '0,2 ha', grade: 'FV' },
    spatial: {
      inputs: { choice: 'medium' },
      value: 'Średni stopień fragmentacji – łąki wilgotne w mozaice ze świeżymi i młaką eutroficzną w zależności od zasilania w wodę',
      grade: 'U1',
    },
    characteristic: {
      inputs: {
        species: [
          { name: 'Cirsium rivulare', cover: 30 },
          { name: 'Trifolium hybridum', cover: 3 },
          { name: 'Crepis paludosa', cover: 1 },
          { name: 'Caltha palustris', cover: 1 },
          { name: 'Myosotis palustris', cover: 1 },
          { name: 'Juncus effusus', cover: 0.5 },
          { name: 'Juncus conglomeratus', cover: 0.5 },
        ],
      },
      value:
        'ostrożeń łąkowy Cirsium rivulare 30%; koniczyna białoróżowa Trifolium hybridum 3%; pępawa błotna Crepis paludosa 1%; knieć błotna Caltha palustris 1%; niezapominajka błotna Myosotis palustris 1%; sit rozpierzchły Juncus effusus <1%; sit skupiony Juncus conglomeratus <1%',
      grade: 'FV',
    },
    dominant: {
      inputs: {
        species: [
          { name: 'Cirsium rivulare', cover: 30 },
          { name: 'Trifolium pratense', cover: 20 },
          { name: 'Carex flava', cover: 15 },
          { name: 'Carex panicea', cover: 15 },
        ],
      },
      value: 'ostrożeń łąkowy Cirsium rivulare 30%; koniczyna łąkowa Trifolium pratense 20%; turzyca żółta Carex flava 15%; turzyca prosowata Carex panicea 15%',
      grade: 'FV',
    },
    invasive: { inputs: { species: [] }, value: 'Brak', grade: 'FV' },
    expansive: { inputs: { species: [] }, value: 'Brak', grade: 'FV' },
    shrubs: { inputs: { species: [], total: undefined }, value: 'Brak', grade: 'FV' },
    wellPreserved: { inputs: { share: 85 }, value: '85% powierzchni transektu', grade: 'FV' },
    litter: { inputs: { min: 0, max: 3, mean: 0.5 }, value: '0–3 cm; średnio 0,5 cm', grade: 'FV' },
    drainage: {
      inputs: { choice: 'none' },
      value: 'Pozostałości drenów z lat 1980., brak czynnych rowów melioracyjnych, siedlisko dobrze uwodnione',
      grade: 'FV',
    },
  },
  prospects: { value: 'Stanowisko regularnie koszone raz w roku, siedlisko dobrze uwodnione', grade: 'FV' },
  impacts: [
    {
      code: 'A03.02',
      name: 'Nieintensywne koszenie',
      influence: '+',
      intensity: 'L',
      description: 'Łąka użytkowana jako jednokośna co najmniej od początku lat 1990.',
    },
    {
      code: 'J02',
      name: 'Spowodowane przez człowieka zmiany stosunków wodnych',
      influence: '0',
      intensity: 'L',
      description: 'Ślady po melioracjach odwadniających (lata 1980?) – bez wpływu na stan uwodnienia siedliska',
    },
  ],
  threats: [],
  other: {
    otherValues:
      'Siedlisko bardzo bogate florystycznie (52–55 gatunków/25 m²); sąsiaduje z młaką eutroficzną 7230, górską łąką świeżą 6520. Dość licznie występujące storczykowate (kukułka szerokolistna Dactylorhiza majalis, kruszczyk błotny Epipactis palustris, gółka długoostrogowa Gymnadenia conopsea, listera jajowata Listera ovata).',
    conservation: 'Koszenie z usuwaniem biomasy w ramach ochrony aktywnej, realizowanej przez Bieszczadzki Park Narodowy.',
    notes:
      'Zagrożenia: przy utrzymaniu ekstensywnego koszenia i nieingerowaniu w reżim hydrologiczny siedlisko nie jest zagrożone.\nPropozycje działań ochronnych: utrzymanie dotychczasowych zabiegów, które sprzyjają zachowaniu łąki ostrożeniowej oraz sąsiadujących z nią zbiorowisk nieleśnych (młaki eutroficznej 7230, świeżej łąki mietlicowej 6520).\nUwagi metodyczne: optymalny termin kontroli siedliska na stanowisku to przełom czerwca i lipca.',
    photos: [],
  },
  overallComment: 'Powierzchnia siedliska o różnym stanie zachowania na stanowisku: FV 85%, U1 15%, U2 –.',
}

export const examples65XX = [{ id: 'wolosate', label: 'Wołosate', values: wolosate }]
