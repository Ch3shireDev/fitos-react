// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Świerkosz 2012, rozdz. 4080, pkt 3 „Przykład wypełnionej
// karty obserwacji”): Kocioł Wielkiego Stawu, Karkonosze, 8.07.2010. Koordynatorzy zanonimizowani (Jan Kowalski, Anna Nowak).
//  • karta ma 5 wierszy struktury (bez „charakterystycznej kombinacji gatunków”, kardynalnej wg tab. 2) – stąd zestaw
//    „karta przykładowa i monitoring 2016–2021”; kombinacja wpisana jako XX „nie oceniano” i nie liczy się do oceny;
//  • nazwy wierszy jak w tab. 2, nie jak w karcie („Gatunki charakterystyczne” = występowanie wierzb, „…śmiałka
//    darniowego” = gatunki dominujące, w tab. 2 „śmiałka pogiętego”);
//  • współrzędne w przewodniku ucięte do minut („15° 41′ …″E – 50° 45′ …″N”) – przepisane tak samo;
//  • „Obszary chronione” i „Nazwa obszaru” (PLH020006) połączone w jedno pole;
//  • zdjęcie III „Nie wykonano z uwagi na brak możliwości dostępu do płatów” – puste, z uwagą;
//  • „Nie stwierdzono oddziaływań ze strony gospodarki człowieka” – brak oddziaływań i zagrożeń, zdanie w komentarzu;
//  • rok, typ monitoringu i uwagi z „Raportu rocznego” – w uwagach.
import type { CardValues, ReleveSpeciesRow } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology4080 } from './methodology'

const COORD = '15°41′…″E – 50°45′…″N'
const UNIT = 'Salicetum lapponum'

/** „Anthoxanthum alpinum r, Calluna vulgaris +” -> wiersze zdjęcia w danej warstwie. */
const layer = (l: 'B' | 'C' | 'D', spec: string): ReleveSpeciesRow[] =>
  spec.split(', ').map((s) => {
    const i = s.lastIndexOf(' ')
    return { layer: l, name: s.slice(0, i), abundance: s.slice(i + 1) as ReleveSpeciesRow['abundance'] }
  })

const releve = (o: { altitude: number; slope: number; exposure: string }, species: ReleveSpeciesRow[]) => ({
  coords: COORD,
  area: 25,
  coverB: 30,
  coverC: 90,
  coverD: 5,
  heightB: undefined,
  heightC: undefined,
  unit: UNIT,
  remarks: '',
  ...o,
  species,
})

export const kociolWielkiegoStawu: CardValues = {
  ...emptyCardValues(methodology4080),
  site: {
    siteName: 'Kocioł Wielkiego Stawu',
    guid: '',
    siteType: 'referencyjne',
    indicatorSet: 'monitoring',
    communities: UNIT,
    description:
      'Siedlisko rozwija się wzdłuż cieków spływających ze stromych, trudno dostępnych ścian kotła polodowcowego o nachyleniu osiągającym 45°, tworzy niewielkie enklawy wśród zbiorowisk ze związku Calamagrostion villosae. Dwa większe płaty siedliska zajmują strome żleby w centralnej części Kotła i są trudno dostępne, stanowiąc enklawy wśród zarośli kosodrzewiny Pinetum mughi oraz zbiorowisk ziołoroślowych i traworoślowych.',
    areaHa: 'Dobrze wykształcone płaty na łącznej powierzchni około 2 ha',
    protectedAreas: 'Karkonoski Park Narodowy; PLH020006 „Karkonosze”',
    manager: 'Karkonoski Park Narodowy',
    coords: `${COORD}\n${COORD}`,
    transect: 'Niestandardowy na skutek rozproszenia płatów siedliska.',
    altitude: '1320–1480',
    date: '2010-07-08',
    observer: 'Jan Kowalski',
    additionalExperts: 'Anna Nowak',
  },
  releves: [
    releve({ altitude: 1320, slope: 45, exposure: 'NE' }, [
      ...layer('B', 'Salix lapponum 3'),
      ...layer(
        'C',
        'Anthoxanthum alpinum r, Calluna vulgaris +, Carex pallescens +, Deschampsia cespitosa +, Deschampsia flexuosa r, Dryopteris carthusiana r, Eriophorum angustifolium +, Homogyne alpina +, Juncus filiformis r, Molinia caerulea 4, Salix silesiaca +, Trichophorum cespitosum +, Vaccinium myrtillus +, Veratrum lobelianum 1',
      ),
      ...layer('D', 'Sphagnum compactum 1, Polytrichum juniperinum +'),
    ]),
    releve({ altitude: 1340, slope: 40, exposure: 'E' }, [
      ...layer('B', 'Salix lapponum 3'),
      ...layer(
        'C',
        'Adenostyles alliariae +, Anthoxanthum alpinum +, Athyrium distentifolium +, Calluna vulgaris +, Carex pallescens +, Deschampsia cespitosa +, Dryopteris carthusiana r, Homogyne alpina +, Molinia caerulea 4, Polygonum bistorta r, Prenanthes purpurea r, Salix silesiaca +, Trichophorum cespitosum r, Vaccinium myrtillus +, Veratrum lobelianum 2, Nardus stricta r, Viola palustris +',
      ),
      ...layer('D', 'Sphagnum compactum 1, Polytrichum juniperinum +'),
    ]),
    {
      coords: '',
      altitude: undefined,
      area: undefined,
      slope: undefined,
      exposure: '',
      coverB: undefined,
      coverC: undefined,
      coverD: undefined,
      heightB: undefined,
      heightC: undefined,
      unit: '',
      species: [],
      remarks: 'Nie wykonano z uwagi na brak możliwości dostępu do płatów.',
    },
  ],
  indicators: {
    area: {
      inputs: { choice: 'stable', areaText: '', note: 'Nie obserwowano zmniejszania się powierzchni aktualnie zajętej przez siedlisko.' },
      value: 'Nie obserwowano zmniejszania się powierzchni aktualnie zajętej przez siedlisko.',
      grade: 'FV',
    },
    willows: {
      inputs: { species: [{ name: 'Salix lapponum', cover: 30 }], choice: '', note: 'Salix lapponum – 30% pokrycia.' },
      value: 'Salix lapponum – 30% pokrycia.',
      grade: 'FV',
    },
    regeneration: {
      inputs: { cover: '0,5', choice: '', note: 'Salix silesiaca – pokrycie 0,5%, Salix lapponum – sporadycznie.' },
      value: 'Salix silesiaca – pokrycie 0,5%, Salix lapponum – sporadycznie.',
      grade: 'FV',
    },
    combination: {
      inputs: { share: '', choice: '', note: '' },
      value: 'Nie oceniano – wskaźnika nie ma w karcie przykładowej',
      grade: 'XX',
    },
    dominants: {
      inputs: {
        species: 'Molinia caerulea',
        cover: '20–50',
        choice: '',
        note: 'W płatach dominuje Molinia caerulea osiągając 20–50% pokrycia. Z uwagi na niskie zwarcie krzewów i dobre warunki świetlne w warstwie runa dominuje jeden gatunek – zjawisko naturalne.',
      },
      value:
        'W płatach dominuje Molinia caerulea osiągając 20–50% pokrycia. Z uwagi na niskie zwarcie krzewów i dobre warunki świetlne w warstwie runa dominuje jeden gatunek – zjawisko naturalne.',
      grade: 'FV',
    },
    mugo: {
      inputs: { cover: '0', note: 'Nie obserwowano występowania w płatach siedliska.' },
      value: 'Nie obserwowano występowania w płatach siedliska.',
      grade: 'FV',
    },
    damage: {
      inputs: { choice: 'none', note: 'Brak' },
      value: 'Brak',
      grade: 'FV',
    },
  },
  prospects: {
    value: 'Perspektywy ochrony siedliska bardzo dobre. Siedlisko znajduje się w granicach parku narodowego w miejscu praktycznie niedostępnym.',
    grade: 'FV',
  },
  impacts: [],
  threats: [],
  other: {
    otherValues:
      'W sąsiedztwie stanowiska doskonale wykształcony kompleks siedlisk subalpejskich (3160, 6430, 4070, 9410) z wieloma gatunkami chronionymi, w tym z gnidoszem sudeckim Pedicularis sudetica, dzwonkiem karkonoskim Campanula bohemica, poryblinem jeziornym Isoëtes lacustris i czosnkiem syberyjskim Allium sibiricum. Obszar objęty ochroną ścisłą.',
    conservation: 'Nie są wymagane. Siedlisko jest stabilne i doskonale przystosowane do panujących warunków, ponadto znajduje się na terenie rezerwatu ścisłego.',
    proposals: 'Ochrona ścisła.',
    monitoringRequired: 'tak',
    justification:
      'Siedlisko skrajnie rzadkie w Polsce, w którego skład wchodzi wiele gatunków chronionych i wysokogórskich. Istnieje możliwość zachodzenia powolnych zmian w składzie gatunkowym lub żywotności i udziale poszczególnych gatunków typowych, z uwagi na zmiany klimatyczne i związane z tym stopniowe ocieplanie klimatów górskich. Z uwagi na małą zmienność siedliska w czasie, oczekiwany okres monitoringu – raz na 6 lat w wyznaczonych punktach.',
    shareFV: 100,
    shareU1: 0,
    shareU2: 0,
    notes:
      'Rok: 2010. Typ monitoringu: zintegrowany. Zagrożenia: nie stwierdzono. W karcie z przewodnika nie ma wskaźnika „Charakterystyczna kombinacja gatunków” – oceniono 5 wskaźników struktury, jak w monitoringu 2016–2021.',
    photos: [],
  },
  overallComment: 'Nie stwierdzono oddziaływań ze strony gospodarki człowieka.',
}

export const examples4080: CardExample[] = [{ id: 'kociol-wielkiego-stawu', label: 'Kocioł Wielkiego Stawu', values: kociolWielkiegoStawu }]
