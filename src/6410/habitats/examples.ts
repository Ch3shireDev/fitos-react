// Przykład z karty obserwacji w przewodniku metodycznym GIOŚ (rozdz. 6410, „Przykład wypełnionej karty obserwacji”):
// Wędziszew, Puszcza Kampinoska (PLC140001), 5.07.2010, przepisany do układu karty RDOŚ.
// Obserwatorzy zanonimizowani (Jan Kowalski). Teksty „wartość lub opis” i oceny przepisane z karty, selekty ustawione
// zgodnie z ocenami. Odstępstwa:
// • kod stanowiska ułożony wg formuły RDOŚ z kodu obszaru i nazwy stanowiska (PLC140001_6410_Wedziszew);
// • obszaru PLC140001 nie ma w słowniku RDOŚ we Wrocławiu – nazwa wpisana ręcznie;
// • współrzędne zdjęć w przewodniku są ucięte i w WGS84 („N 52°21'…”), a nie w PL-1992 – zostawione jak w źródle;
// • kod oddziaływania 950 (stara lista) zapisany jako K02 „Ewolucja biocenotyczna, sukcesja”, intensywność B jako M;
// • „Selinum carvifolia1” w zdjęciu I to literówka źródła – zapisane jako „Selinum carvifolia 1”;
// • karta nie ma oceny referencyjnej ani działań ochronnych (to wymogi RDOŚ) – zakładki zostają puste.
// Dwie podpowiedzi formularza różnią się od ocen eksperta: gatunki typowe (brak wyróżniających na liście → U1, ekspert FV)
// i krzewy (5% + do 1% = 6% → U1, ekspert FV). W karcie zostają oceny eksperta.
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardValues, InputValues } from '../../7120/habitats/types'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { parseReleveSpecies } from '../../65XX/habitats/examples'
import { impactName } from '../../rdos/fields'
import { methodology6410 } from './methodology'

const sp = (...rows: [string, number][]) => rows.map(([name, cover]) => ({ name, cover }))

const releve = (o: { coverC: number; coverD: number; heightC: number; species: string }): InputValues => ({
  coords: "N 52°21'… E 20°37'…",
  altitude: 73,
  area: 25,
  slope: 0,
  exposure: 'brak',
  coverA: 0,
  coverB: 0,
  coverC: o.coverC,
  coverD: o.coverD,
  heightA: undefined,
  heightB: undefined,
  heightC: o.heightC,
  heightD: undefined,
  unit: 'Selino-Molinietum',
  species: parseReleveSpecies(o.species),
})

const RELEVE_I =
  'Achillea millefolium 1, Agropyron repens +, Agrostis gigantea 3, Alopecurus pratensis 1, Anthoxanthum odoratum 1, Arrhenatherum elatius +, Campanula patula 1, Carex leporina 1, Carex pallescens 1, Centaurea jacea 1, Deschampsia caespitosa 3, Festuca rubra 1, Galeopsis tetrahit 1, Galium boreale 3, Galium uliginosum 1, Galium verum +, Genista tinctoria 1, Holcus lanatus 1, Hypericum perforatum 2, Inula salicina +, Juncus conglomeratus 2, Juncus effusus +, Lotus corniculatus 1, Luzula multiflora 1, Lychnis flos-cuculi +, Lysimachia vulgaris 1, Molinia caerulea 2, Poa pratensis 1, Polygonum persicaria +, Potentilla erecta 2, Rumex acetosa 1, Salix cinerea +, Sanguisorba officinalis 1, Scrophularia nodosa 1, Selinum carvifolia 1, Serratula tinctoria 2, Stellaria graminea 1, Veronica longifolia 1, Viola canina +'

const RELEVE_II =
  'Achillea millefolium 1, Agrostis gigantea 2, Anthoxanthum odoratum 1, Artemisia vulgaris +, Betonica officinalis 1, Campanula patula +, Cardamine pratensis +, Carex hirta +, Carex leporina +, Dactylis glomerata 1, Deschampsia caespitosa 2, Festuca rubra 2, Galium boreale 1, Galium palustre +, Galium uliginosum 1, Iris sibirica 3, Juncus conglomeratus 2, Lathyrus pratensis 1, Linaria vulgaris +, Lotus uliginosus 2, Luzula multiflora 1, Lychnis flos-cuculi +, Lysimachia vulgaris 2, Molinia caerulea 3, Peucedanum palustre +, Poa pratensis 1, Potentilla erecta 1, Rumex acetosa 1, Sanguisorba officinalis 1, Serratula tinctoria +, Stellaria palustris 1, Veronica chamaedrys 1, Vicia cracca 1'

const RELEVE_III =
  'Achillea millefolium 1, Agrostis gigantea 1, Anthoxanthum odoratum 1, Avenula pubescens +, Campanula patula +, Cirsium arvense 1, Dactylis glomerata 1, Deschampsia caespitosa 2, Festuca pratensis 2, Festuca rubra 2, Filipendula ulmaria 1, Galium boreale 4, Galium uliginosum 1, Genista tinctoria 1, Holcus lanatus 1, Lathyrus pratensis 1, Lychnis flos-cuculi 1, Lysimachia vulgaris 2, Ranunculus auricomus +, Ranunculus repens 1, Rumex acetosa 1, Selinum carvifolia 2, Serratula tinctoria 2, Veronica chamaedrys 2, Veronica longifolia 2, Vicia cracca 1'

function wedziszew(): CardValues {
  const v = emptyCardValues(methodology6410)
  v.site = {
    ...v.site,
    siteName: 'PLC140001_6410_Wedziszew',
    community: 'Selino-Molinietum',
    areaHa: 0.4,
    transect: '25x80 m',
    date: '2010-07-05',
    datesExtra: '',
    n2kCode: 'PLC140001',
    n2kName: 'Puszcza Kampinoska',
    description:
      'Łąki trzęślicowe na stanowisku Wędziszew tworzą zwarty płat sąsiadujący z łąkami świeżymi (przede wszystkim z łąką z dominacją kłosówki wełnistej Holcetum lanati). W części południowo-zachodniej, bliżej lasu wyraźnie zaznacza się sukcesja objawiająca się większym udziałem gatunków ziołoroślowych ze związku Filipendulion.',
    history: '',
    observer: 'Jan Kowalski',
  }
  v.releves = [
    releve({ coverC: 90, coverD: 5, heightC: 70, species: RELEVE_I }),
    releve({ coverC: 100, coverD: 10, heightC: 90, species: RELEVE_II }),
    releve({ coverC: 100, coverD: 2, heightC: 80, species: RELEVE_III }),
  ]
  const ind = v.indicators
  ind.area = {
    inputs: { choice: 'stable' },
    value:
      'Ponad 80% siedliska na stanowisku jest zachowana właściwie. Pozostałe 20% – ocena U1 z powodu ekspansji gatunków ziołoroślowych, takich jak: tojeść pospolita Lysimachia vulgaris, wiązówka błotna Filipendula ulmaria i przetacznik długolistny Veronica longifolia.',
    grade: 'FV',
  }
  ind.percent = { inputs: { share: 90 }, value: '90%', grade: 'FV' }
  ind.typical = {
    inputs: {
      species: sp(['Molinia caerulea', 20], ['Galium boreale', 50], ['Serratula tinctoria', 10], ['Iris sibirica', 5], ['Selinum carvifolia', 10], ['Inula salicina', 1]),
    },
    value:
      'Warstwa c: trzęślica modra Molinia caerulea (20%), przytulia północna Galium boreale (50%), sierpik barwierski Serratula tinctoria (10%), kosaciec syberyjski Iris sibirica (5%), olszewnik kminkolistny Selinum carvifolium (10%), oman wierzbolistny Inula salicina (1%).',
    grade: 'FV',
  }
  ind.dominant = {
    inputs: { species: sp(['Galium boreale', 50], ['Deschampsia caespitosa', 30]) },
    value: 'Przytulia północna Galium boreale (50%), śmiałek darniowy Deschampsia caespitosa (30%).',
    grade: 'FV',
  }
  ind.invasive = { inputs: { species: [] }, value: 'Brak', grade: 'FV' }
  ind.expansive = {
    inputs: { species: sp(['Deschampsia caespitosa', 30], ['Lysimachia vulgaris', 10]) },
    value: 'Warstwa c: śmiałek darniowy Deschampsia caespitosa (30%), tojeść pospolita Lysimachia vulgaris (10%).',
    grade: 'U1',
  }
  ind.shrubs = {
    inputs: { species: sp(['Betula pendula', 5], ['Salix cinerea', 1]), total: undefined },
    value: 'Warstwa c: pojedyncze osobniki brzozy brodawkowatej Betula pendula (około 5%) i wierzby szarej Salix cinerea (do 1%).',
    grade: 'FV',
  }
  ind.litter = {
    inputs: { min: 1, max: 6, mean: 2.5 },
    value:
      'Min. 1 cm, maks. 6 cm; średnio 2,5 cm – w części płatów warstwa martwej materii organicznej jest niewielka, natomiast w tych miejscach, gdzie osiąga maksimum – tzn. 6 cm, jest to zdecydowanie za dużo, świadczy o braku koszenia i uniemożliwia wzrost części gatunków.',
    grade: 'U1',
  }
  ind.spatial = { inputs: { choice: 'none' }, value: 'Mały stopień fragmentacji, w obrębie transektu niewielkie płaty ziołorośli.', grade: 'FV' }
  v.prospects = {
    value: 'Obecnie łąki są objęte ochroną czynną, którą Kampinoski Park Narodowy prowadzi od 2008 roku. Ochrona ta jest zapisana również w planach na kolejne lata.',
    grade: 'FV',
  }
  v.overallComment = 'Powierzchnia siedliska o różnym stanie zachowania na stanowisku: FV 80%, U1 20%, U2 0%.'
  v.impacts = [
    {
      code: 'K02',
      name: impactName('K02'),
      influence: '-',
      intensity: 'M',
      description:
        'Na skutek braku koszenia siedlisko ulega zarastaniu – w części zaczynają dominować ziołorośla, w niektórych płatach obecne są siewki i podrost drzew – przede wszystkim brzozy brodawkowatej.',
    },
  ]
  v.other = {
    ...v.other,
    conservation: '',
    otherValues: '',
    alienSpecies: 'Brak',
    notes: 'Obszary chronione: sieć Natura 2000 PLC140001 Puszcza Kampinoska, Kampinoski Park Narodowy. Wysokość n.p.m. 73 m. Data wypełnienia karty: 24.09.2010.',
  }
  return v
}

export const wedziszew6410 = wedziszew()

export const examples6410: CardExample[] = [{ id: 'wedziszew', label: 'Wędziszew', values: wedziszew6410 }]
