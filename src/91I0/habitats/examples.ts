// Przykładowe wypełnienie z przewodnika GIOŚ (rozdz. 91I0, „Przykład wypełnionej karty obserwacji”):
// stanowisko Zimna Woda 1, rezerwat Dąbrowa Grotnicka, 14.08.2007, podtyp 91I0-1.
// Teksty „wartość lub opis” przepisane z karty, selekty i liczby ustawione zgodnie z ocenami eksperta.
// Uwaga: karta podaje strukturę i ocenę ogólną FV, ale reguła z tab. 2 (kardynalne inwazyjne na U1) daje U1 – formularz liczy wg reguły.
// „<1%” zapisane jako 0,5, „znikome” zwarcie warstwy jako 0,5. Wykonawca zanonimizowany (Jan Kowalski).
// Stare kody oddziaływań z karty (141, 501/502, 250) przełożone na A04.03, D01.02 i F04.
// Literówki z oryginału poprawione: „Lilium matragon” -> Lilium martagon, „Majanthemum” -> Maianthemum, „Coryllus” -> Corylus.
import type { CardValues, InputValues, ReleveSpeciesRow } from '../../7120/habitats/types'
import { BRAUN_BLANQUET, type BraunBlanquet } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import { methodology91I0 } from './methodology'

const OBSERVER = 'Jan Kowalski'
const OAK = 'Quercus petraea x robur'

/** „A: Quercus petraea x robur 3; C: Anemone nemorosa 1, Betonica officinalis +” -> wiersze zdjęcia. */
function releveSpecies(text: string): ReleveSpeciesRow[] {
  return text.split(';').flatMap((part) => {
    const [layerRaw, list] = part.split(':')
    const layer = layerRaw.trim().charAt(0) as ReleveSpeciesRow['layer']
    return list
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const m = /^(.*?)\s+(r|\+|[1-5])$/.exec(s)
        const abundance = (m && (BRAUN_BLANQUET as readonly string[]).includes(m[2]) ? m[2] : '+') as BraunBlanquet
        return { layer, name: (m ? m[1] : s).trim(), abundance }
      })
  })
}

const releve = (o: { cover: [number, number, number, number]; height: [number, number, number]; species: string }): InputValues => ({
  coords: 'N 51°55′; E 19°19′',
  altitude: 150,
  area: 200,
  slope: 0,
  exposure: 'brak',
  coverA: o.cover[0],
  coverB: o.cover[1],
  coverC: o.cover[2],
  coverD: o.cover[3],
  heightA: o.height[0],
  heightB: o.height[1],
  heightC: o.height[2],
  heightD: undefined,
  unit: 'Potentillo albae-Quercetum',
  species: releveSpecies(o.species),
})

const RELEVES: InputValues[] = [
  releve({
    cover: [55, 20, 80, 0.5],
    height: [25, 4, 1],
    species: `A: ${OAK} 3; B: Corylus avellana 2, Frangula alnus +, ${OAK} 1; C: Anemone nemorosa 1, Betonica officinalis 1, Brachypodium pinnatum +, Calamagrostis arundinacea 1, Convallaria majalis 2, Corylus avellana +, Cruciata glabra +, Fragaria vesca 1, Frangula alnus +, Galium boreale +, Galium mollugo 1, Galium schultesii 1, Hieracium lachenalii +, Lilium martagon +, Luzula pilosa +, Lysimachia vulgaris +, Melampyrum pratense 1, Melica nutans +, Melittis melissophyllum 1, Milium effusum +, Padus serotina +, Poa angustifolia +, Polygonatum odoratum +, Potentilla alba +, Pteridium aquilinum 2, ${OAK} 1, Rubus saxatilis +, Scorzonera humilis +, Serratula tinctoria +, Sorbus aucuparia 1, Trientalis europaea 1, Vaccinium myrtillus 3, Veronica chamaedrys 1, Viburnum opulus +, Viola reichenbachiana +, Viola riviniana 1`,
  }),
  releve({
    cover: [50, 0.5, 90, 0.5],
    height: [25, 2, 1.2],
    species: `A: ${OAK} 3; B: ${OAK} +; C: Adenophora liliifolia +, Ajuga reptans 1, Anemone nemorosa 1, Betonica officinalis 1, Brachypodium pinnatum 3, Calamagrostis arundinacea 2, Clinopodium vulgare +, Convallaria majalis 2, Corylus avellana +, Daphne mezereum +, Festuca gigantea +, Fragaria vesca 1, Frangula alnus +, Galium mollugo 1, Genista tinctoria 1, Hieracium umbellatum +, Juniperus communis +, Lathyrus niger 1, Lathyrus vernus +, Lilium martagon +, Maianthemum bifolium 1, Melica nutans +, Melittis melissophyllum 1, Milium effusum 1, Padus serotina +, Poa angustifolia +, Pteridium aquilinum 2, Pyrus communis +, ${OAK} 1, Rubus saxatilis +, Rubus sp. +, Serratula tinctoria 1, Vaccinium myrtillus +, Veronica chamaedrys 1, Vicia cassubica +, Vicia sepium +, Viola riviniana 1`,
  }),
  releve({
    cover: [50, 0.5, 80, 0.5],
    height: [22, 2, 1],
    species: `A: ${OAK} 3; B: Juniperus communis +, ${OAK} +, Sorbus aucuparia +; C: Anemone nemorosa 1, Anthericum ramosum +, Betonica officinalis +, Brachypodium pinnatum +, Calamagrostis arundinacea 2, Carex digitata +, Clinopodium vulgare +, Convallaria majalis 3, Festuca ovina +, Fragaria vesca +, Genista tinctoria +, Hieracium lachenalii +, Hieracium umbellatum +, Juniperus communis +, Lathyrus niger +, Luzula pilosa +, Melampyrum pratense 2, Melica nutans 1, Melittis melissophyllum 1, Poa angustifolia +, Polygonatum odoratum +, Pteridium aquilinum 2, ${OAK} 2, Rubus saxatilis +, Rubus sp. +, Solidago virgaurea +, Sorbus aucuparia +, Trientalis europaea +, Vaccinium myrtillus +, Veronica chamaedrys 1, Vicia cassubica +, Viola canina +, Viola riviniana +`,
  }),
]

const sp = (...rows: [string, number][]) => rows.map(([name, cover]) => ({ name, cover }))

export const zimnaWoda1: CardValues = {
  ...emptyCardValues(methodology91I0),
  site: {
    siteName: 'Zimna Woda 1',
    guid: '',
    subtype: '91I0-1',
    communities: 'Potentillo albae-Quercetum',
    description:
      'Stanowisko zlokalizowane we wschodniej części rezerwatu, w północno-zachodniej części oddziału leśnego 114. Stanowisko obejmuje teren równinny o podłożu piasków gliniastych, pod którymi zalega piaszczysta glina morenowa. Siedlisko obejmuje wydzielenie z 140-letnim drzewostanem dębowym.',
    areaHa: 5,
    protectedAreas: 'SOO Natura 2000 Dąbrowa Grotnicka\nRezerwat przyrody Dąbrowa Grotnicka',
    coordStart: 'N 51°55′; E 19°19′',
    coordMiddle: 'N 51°55′; E 19°19′',
    coordEnd: 'N 51°55′; E 19°19′',
    transect: '200x20 m',
    altitude: '150',
    date: '2007-08-14',
    observer: OBSERVER,
  },
  releves: RELEVES,
  indicators: {
    area: {
      inputs: { choice: 'stable' },
      value: 'Siedlisko zajmuje na stanowisku powierzchnię około 5 ha. Brak oznak zmniejszania się powierzchni.',
      grade: 'FV',
    },
    habitatShare: { inputs: { share: 100 }, value: 'Siedlisko zajmuje 100% powierzchni transektu.', grade: 'FV' },
    characteristic: {
      inputs: {
        species: sp(
          [OAK, 50],
          ['Potentilla alba', 0.5],
          ['Adenophora liliifolia', 0.5],
          ['Vicia cassubica', 0.5],
          ['Lathyrus niger', 2],
          ['Melittis melissophyllum', 5],
          ['Brachypodium pinnatum', 10],
          ['Clinopodium vulgare', 0.5],
          ['Polygonatum odoratum', 1],
          ['Anthericum ramosum', 1],
          ['Betonica officinalis', 5],
          ['Galium boreale', 1],
          ['Serratula tinctoria', 2],
        ),
      },
      value:
        'A: dąb mieszaniec Quercus petraea x robur 50%; B: brak; C: gatunki charakterystyczne dla Quercetalia (10%): pięciornik biały Potentilla alba <1%, dzwonecznik wonny Adenophora liliifolia <1%, wyka kaszubska Vicia cassubica <1%, groszek czerniejący Lathyrus niger 2%, miodownik melisowaty Melittis melissophyllum 5%; gatunki charakterystyczne dla Trifolio-Geranietea i Festuco-Brometea (13%): kłosownica pierzasta Brachypodium pinnatum 10%, czyścica storzyszek Clinopodium vulgare <1%, kokoryczka wonna Polygonatum odoratum 1%, pajęcznica gałęzista Anthericum ramosum 1%; łącznie ciepłolubne gatunki charakterystyczne – 23%. Gatunki łąk trzęślicowych (8%): bukwica zwyczajna Betonica officinalis 5%, przytulia północna Galium boreale 1%, sierpik barwierski Serratula tinctoria 2%. Runo jest wykształcone typowo, heterogeniczne.',
      grade: 'FV',
    },
    dominant: {
      inputs: {
        choice: 'natural',
        species: sp(
          [OAK, 50],
          ['Corylus avellana', 10],
          ['Convallaria majalis', 20],
          ['Pteridium aquilinum', 20],
          ['Vaccinium myrtillus', 10],
          ['Brachypodium pinnatum', 10],
          ['Calamagrostis arundinacea', 10],
        ),
      },
      value:
        'A: dąb mieszaniec Quercus petraea x robur 50%; B: leszczyna pospolita Corylus avellana 10%; C: konwalia majowa Convallaria majalis 20%, orlica pospolita Pteridium aquilinum 20%, borówka czarna Vaccinium myrtillus 10%, kłosownica pierzasta Brachypodium pinnatum 10%, trzcinnik leśny Calamagrostis arundinacea 10%. W poszczególnych warstwach dominują gatunki typowe dla siedliska.',
      grade: 'FV',
    },
    invasive: {
      inputs: { species: sp(['Impatiens parviflora', 1], ['Padus serotina', 0.5]) },
      value: 'B: brak; C: niecierpek drobnokwiatowy Impatiens parviflora 1%, czeremcha amerykańska Padus serotina <1%',
      grade: 'U1',
    },
    expansive: { inputs: { species: [] }, value: 'Brak', grade: 'FV' },
    thermophilous: {
      inputs: { species: sp(['Convallaria majalis', 20], ['Poa angustifolia', 0.5]) },
      value:
        'Ciepłolubne gatunki charakterystyczne – 23%. Pozostałe gatunki ciepłolubne – 21%: konwalia majowa Convallaria majalis 20%, wiechlina wąskolistna Poa angustifolia <1%. Łącznie gatunki ciepłolubne – 44%.',
      grade: 'FV',
    },
    deadWood: { inputs: { share: 10 }, value: '5 pni, 10% zasobności drzewostanu', grade: 'U1' },
    age: { inputs: { years: 140 }, value: '140 lat', grade: 'FV' },
    shrubClosure: {
      inputs: {
        closure: 15,
        species: sp(['Corylus avellana', 10], [OAK, 2], ['Juniperus communis', 0.5], ['Sorbus aucuparia', 0.5], ['Frangula alnus', 0.5]),
      },
      value:
        'Zwarcie podszytu: 15%. Leszczyna pospolita Corylus avellana 10% (zwiększa się), dąb mieszaniec Quercus petraea x robur 2% (zmniejsza się), jałowiec pospolity Juniperus communis <1% (zmniejsza się), jarząb pospolity Sorbus aucuparia <1% (bez zmian), kruszyna pospolita Frangula alnus <1% (zmniejsza się)',
      grade: 'FV',
    },
    crownClosure: { inputs: { closure: 55, layers: 'one' }, value: '50–60%', grade: 'FV' },
    alienTrees: { inputs: { species: [] }, value: 'Brak gatunków obcych w drzewostanie', grade: 'FV' },
    regeneration: {
      inputs: { choice: 'oak', species: sp([OAK, 10], ['Pyrus communis', 0.5]) },
      value: '11%: dąb mieszaniec Quercus petraea x robur 10%, grusza pospolita Pyrus communis <1%',
      grade: 'FV',
    },
    plantings: { inputs: { choice: 'none', species: [] }, value: 'Brak', grade: 'FV' },
    logging: { inputs: { choice: 'none' }, value: 'Brak', grade: 'FV' },
    standDamage: { inputs: { choice: 'none' }, value: 'Brak', grade: 'FV' },
  },
  prospects: {
    value:
      'Perspektywy ochrony siedliska są bardzo dobre. Siedlisko zajmuje dość dużą powierzchnię w obszarze, ponadto nie przejawia zaburzeń struktury i funkcji.',
    grade: 'FV',
  },
  impacts: [
    {
      code: 'A04.03',
      name: 'Zarzucenie pasterstwa, brak wypasu',
      influence: '-',
      intensity: 'H',
      description:
        'W badanych świetlistych dąbrowach prowadzono wypas bydła. Zanik wypasu powoduje stopniową ekspansję gatunków drzew i krzewów zacieniających dno lasu oraz eliminację gatunków termofilnych i łąkowych.',
    },
    {
      code: 'D01.02',
      name: 'Drogi, autostrady',
      influence: '-',
      intensity: 'M',
      description: 'Drogi i ścieżki leśne mogą być miejscem migracji inwazyjnych gatunków obcych.',
    },
    {
      code: 'F04',
      name: 'Pozyskiwanie (grzybobranie, zbieranie roślin)',
      influence: '0',
      intensity: 'M',
      description: 'Wiele osób nie respektuje zakazów rezerwatowych i zbiera grzyby na terenie rezerwatu.',
    },
  ],
  threats: [
    {
      code: 'K02.01',
      name: 'Zmiana składu gatunkowego (sukcesja)',
      description: 'Obecnie brak większych zagrożeń. Potencjalnym zagrożeniem może być wzrost zwarcia podszytu.',
    },
  ],
  other: {
    otherValues:
      'Cenną wartością stanowiska jest występowanie gatunku z Załącznika II Dyrektywy Siedliskowej – dzwonecznika wonnego Adenophora liliifolia. Poza tym swoje stanowiska mają tu inne rzadkie i chronione gatunki roślin, takie jak lilia złotogłów Lilium martagon, miodownik melisowaty Melittis melissophyllum i wawrzynek wilczełyko Daphne mezereum.',
    conservation:
      'Nie zaobserwowano działań ochronnych. Płat siedliska względnie stabilny. Należy monitorować zwiększające się zwarcie podszytu (szczególnie leszczyny) i w razie potrzeby wprowadzić zabiegi ochrony czynnej.',
    notes: 'Stanowisko referencyjne (wzorcowe, wskazujące optymalny stan zachowania siedliska na tym obszarze).',
    photos: [{ caption: 'Fot. 1. Widok ogólny na stanowisko 91I0 Zimna Woda 1 (fot. J. Kowalski)' }],
  },
  overallComment:
    'Karta w przewodniku podaje ocenę ogólną FV (100% powierzchni stanowiska). Według reguły z tab. 2 kardynalny wskaźnik „Obce gatunki inwazyjne w runie i podszycie” na U1 obniża specyficzną strukturę i funkcje do U1, więc formularz wylicza ocenę ogólną U1. Poza tym jedynym odstępstwem jest podwyższony udział leżaniny (U1, wskaźnik pomocniczy).',
}

export const examples91I0 = [{ id: 'zimna-woda-1', label: 'Zimna Woda 1', values: zimnaWoda1 }]
