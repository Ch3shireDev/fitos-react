// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Izydorek 2015, rozdz. 2190, pkt 3 „Przykład karty
// obserwacji”): Madwiny 1, 03.09.2013, podtyp 1 (zbiorowisko z Agrostis stolonifera i Juncus articulatus subsp. litoralis).
// Wykonawca zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („17º 23' …''E 54º 44' …''N”) – przepisane do minut;
//  • zdjęcia fitosocjologiczne: 3 × 100 m², zwarcie i wysokość warstw C i D, gatunki jak w karcie
//    („Areneria serpyllifolia” w zdjęciach II i III to literówka – poprawiona; „Carex cf. flava” → Carex flava);
//  • wartości wskaźników = „Wartość wskaźnika” i „Opis wskaźnika” z karty, sklejone w jednym polu;
//  • oceny jak w karcie: wszystkie FV poza gatunkami ekspansywnymi U1 (niekardynalny) → struktura FV, ogólna FV;
//  • procesy eoliczne: „nieznaczne” → w tab. 2 to „niewielkie” (U1), ekspert dał FV – formularz to pokazuje;
//  • oddziaływania: intensywność C → L (słaba), A → H (silna), wpływ „–”.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology2190 } from './methodology'

const COORD = 'N 54°44′; E 17°23′'
const UNIT = 'Zbiorowisko z Agrostis stolonifera i Juncus articulatus subsp. litoralis (= Juncetum littoralis)'

type L = 'B' | 'C' | 'D'
const releve = (o: { exposure: string; coverD: number; heightC: number }, species: [L, string, string][]) => ({
  coords: COORD,
  altitude: 5,
  area: 100,
  slope: 0,
  exposure: o.exposure,
  coverC: 80,
  coverD: o.coverD,
  heightC: o.heightC,
  heightD: 10,
  unit: UNIT,
  species: species.map(([layer, name, abundance]) => ({ layer, name, abundance })),
})

const note = (value: string, opis = '') => ({ note: opis ? `${value}. ${opis}` : value })
const iv = (inputs: Record<string, unknown>, grade: 'FV' | 'U1' | 'U2') => ({ inputs, value: String(inputs.note), grade })

export const madwiny1: CardValues = {
  ...emptyCardValues(methodology2190),
  site: {
    siteName: 'Madwiny 1',
    guid: '',
    subtype: '1',
    communities: 'Zbiorowisko z Agrostis stolonifera i Juncus articulatus subsp. litoralis – mietlicy rozłogowej i situ członowatego',
    description:
      'Wgłębienie deflacyjne graniczące od północnego zachodu z terenem zalesionym, od północy z wałem wydmowym, od południowego wschodu z obszarem wydm ruchomych. Na powierzchni zagłębienia, po opadach deszczu, gromadzi się woda. Wilgotność piaszczystego podłoża wzrasta w kierunku północnym. Brak torfu, pH piasku 4,5–5,5.',
    areaHa: 1.45,
    protectedAreas: 'Słowiński Park Narodowy; obszar ochrony ścisłej',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '10x200 m',
    altitude: '5',
    date: '2013-09-03',
    observer: 'Jan Kowalski',
  },
  releves: [
    releve({ exposure: 'brak', coverD: 80, heightC: 60 }, [
      ['C', 'Agrostis stolonifera', '2'],
      ['C', 'Arenaria serpyllifolia', '2'],
      ['C', 'Betula pubescens', '1'],
      ['C', 'Calamagrostis canescens', '+'],
      ['C', 'Calluna vulgaris', '+'],
      ['C', 'Carex arenaria', '+'],
      ['C', 'Carex curta', '1'],
      ['C', 'Carex flava', '+'],
      ['C', 'Drosera anglica', '1'],
      ['C', 'Drosera × obovata', '+'],
      ['C', 'Drosera rotundifolia', '+'],
      ['C', 'Epilobium palustre', '+'],
      ['C', 'Erica tetralix', '1'],
      ['C', 'Juncus articulatus', '2'],
      ['C', 'Juncus balticus', '+'],
      ['C', 'Juncus bulbosus', '+'],
      ['C', 'Juncus conglomeratus', '+'],
      ['C', 'Juncus effusus', '+'],
      ['C', 'Lycopodiella inundata', '1'],
      ['C', 'Salix arenaria', '2'],
      ['C', 'Salix caprea', '+'],
      ['C', 'Vaccinium uliginosum', '+'],
      ['D', 'Ceratodon purpureus', '+'],
      ['D', 'Hydrocotyle vulgaris', '+'],
      ['D', 'Pohlia bulbifera', '+'],
      ['D', 'Pohlia filum', '+'],
      ['D', 'Pohlia nutans', '1'],
      ['D', 'Polytrichum commune var. perigoniale', '5'],
    ]),
    releve({ exposure: 'brak', coverD: 80, heightC: 50 }, [
      ['C', 'Agrostis stolonifera', '1'],
      ['C', 'Arenaria serpyllifolia', '1'],
      ['C', 'Betula pubescens', '+'],
      ['C', 'Calamagrostis canescens', '+'],
      ['C', 'Calluna vulgaris', '+'],
      ['C', 'Carex arenaria', 'r'],
      ['C', 'Carex flava', '+'],
      ['C', 'Drosera anglica', '1'],
      ['C', 'Drosera × obovata', '+'],
      ['C', 'Drosera rotundifolia', '1'],
      ['C', 'Empetrum nigrum', '+'],
      ['C', 'Epilobium palustre', '+'],
      ['C', 'Erica tetralix', '3'],
      ['C', 'Juncus articulatus', '2'],
      ['C', 'Juncus balticus', '1'],
      ['C', 'Juncus conglomeratus', 'r'],
      ['C', 'Juncus effusus', '+'],
      ['C', 'Lycopodiella inundata', '1'],
      ['C', 'Phragmites australis', '+'],
      ['C', 'Salix arenaria', '2'],
      ['C', 'Salix caprea', '+'],
      ['C', 'Vaccinium uliginosum', '1'],
      ['D', 'Ceratodon purpureus', '+'],
      ['D', 'Lophozia capitata', '+'],
      ['D', 'Hydrocotyle vulgaris', '+'],
      ['D', 'Pohlia bulbifera', '+'],
      ['D', 'Pohlia filum', '+'],
      ['D', 'Pohlia nutans', '+'],
      ['D', 'Polytrichum commune var. perigoniale', '5'],
    ]),
    releve({ exposure: 'S', coverD: 70, heightC: 50 }, [
      ['C', 'Agrostis stolonifera', '+'],
      ['C', 'Arenaria serpyllifolia', '+'],
      ['C', 'Calamagrostis canescens', '+'],
      ['C', 'Carex curta', '1'],
      ['C', 'Carex flava', '+'],
      ['C', 'Drosera rotundifolia', '+'],
      ['C', 'Epilobium palustre', '+'],
      ['C', 'Hydrocotyle vulgaris', '1'],
      ['C', 'Juncus articulatus', '4'],
      ['C', 'Juncus balticus', '1'],
      ['C', 'Juncus bulbosus', '+'],
      ['C', 'Juncus conglomeratus', '1'],
      ['C', 'Lycopodiella inundata', '+'],
      ['C', 'Phragmites australis', 'r'],
      ['C', 'Salix arenaria', '1'],
      ['C', 'Salix aurita', '+'],
      ['C', 'Salix caprea', '+'],
      ['C', 'Vaccinium uliginosum', '+'],
      ['D', 'Pohlia filum', '+'],
      ['D', 'Pohlia nutans', '1'],
      ['D', 'Polytrichum commune var. perigoniale', '4'],
    ]),
  ],
  indicators: {
    area: iv({ choice: 'stable', areaHa: 1.45, ...note('Duża (1,45 ha), nie ulega zmniejszeniu') }, 'FV'),
    species: iv(
      {
        species: [
          { name: 'Agrostis stolonifera', cover: 15 },
          { name: 'Juncus articulatus', cover: 40 },
          { name: 'Juncus balticus', cover: 5 },
          { name: 'Juncus bulbosus' },
          { name: 'Polytrichum commune var. perigoniale', cover: 75 },
        ],
        count: undefined,
        ...note(
          'Agrostis stolonifera – 15%, Juncus articulatus – 40%, Juncus balticus – 5%, Juncus bulbosus – <5%, Polytrichum commune var. perigoniale – 75% i inne',
          'Liczne gatunki właściwe dla siedliska',
        ),
      },
      'FV',
    ),
    dominants: iv(
      {
        species: [
          { name: 'Juncus articulatus', cover: 40 },
          { name: 'Erica tetralix', cover: 25 },
          { name: 'Polytrichum commune var. perigoniale', cover: 75 },
        ],
        ...note(
          'Juncus articulatus – 40%, Erica tetralix – 25%, Polytrichum commune var. perigoniale – 75%',
          'Utrzymuje się dominacja situ członowatego, ale miejscami przewagę ilościową uzyskują gatunki właściwe dla zaawansowanych stadiów sukcesyjnych roślinności',
        ),
      },
      'FV',
    ),
    aliens: iv({ species: [], amount: 'none', value: undefined, ...note('Brak') }, 'FV'),
    expansive: iv(
      {
        species: [{ name: 'Salix caprea' }, { name: 'Calamagrostis canescens' }, { name: 'Phragmites australis' }],
        value: undefined,
        ...note('Salix caprea – <5%, Calamagrostis canescens – <5%, Phragmites australis – <5%', 'Udział ilościowy tych gatunków nie jest wysoki'),
      },
      'U1',
    ),
    trees: iv(
      { species: [{ name: 'Betula pubescens' }], value: undefined, choice: 'low', ...note('Betula pubescens c – <5%', 'Udział tego gatunku jest niewielki') },
      'FV',
    ),
    shrubs: iv(
      {
        species: [
          { name: 'Empetrum nigrum' },
          { name: 'Erica tetralix', cover: 25 },
          { name: 'Salix arenaria', cover: 15 },
          { name: 'Salix caprea' },
          { name: 'Salix aurita' },
          { name: 'Vaccinium uliginosum' },
        ],
        value: undefined,
        choice: undefined,
        ...note(
          'Empetrum nigrum – <5%, Erica tetralix – 25%, Salix arenaria – 15%, Salix caprea – <5%, Salix aurita – <5%, Vaccinium uliginosum – <5%',
          'Oceniono ten wskaźnik jako właściwy pomimo obecności wierzby iwy, ponieważ gatunek ten nie rozwija się poza stadium siewek',
        ),
      },
      'FV',
    ),
    patches: iv({ value: 90, choice: undefined, ...note('90%', 'Na niewielkiej części powierzchni siedliska występują skupiska Phragmites australis') }, 'FV'),
    vertical: iv(
      { choice: 'proper', coverC: 80, coverD: 75, ...note('Pokrycie c – 80%, Pokrycie d – 75%', 'Bujny stan roślinności wskazuje na dojrzałą (terminalną) postać zespołu') },
      'FV',
    ),
    eolian: iv(
      {
        choice: 'slight',
        ...note(
          'Nieznaczne',
          'Zasypywanie piaskiem ma miejsce z małym natężeniem, sporadycznie podczas bardzo wietrznej pogody i przy kierunkach wiatru od strony wschodniej',
        ),
      },
      'FV',
    ),
  },
  prospects: {
    value:
      'Współcześnie siedlisko jest poza zasięgiem istotnych destrukcyjnych oddziaływań i zagrożeń. Roślinność znajduje się na zaawansowanym etapie rozwoju, ale możliwość przekształcenia w zbiorowisko leśne nie jest przewidywana w ciągu najbliższych 10 lat. Również prawdopodobieństwo zasypania piaskiem wydmowym jest niewielkie.',
    grade: 'FV',
  },
  impacts: [
    {
      code: 'K02',
      name: 'Ewolucja biocenotyczna, sukcesja',
      influence: '-',
      intensity: 'L',
      description: 'Siedlisko pozostaje pod wpływem warunków naturalnych, a więc z czasem może rozwijać się w leśne formy roślinności.',
    },
  ],
  threats: [
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja', description: 'Siedlisko może rozwijać się w leśne formy roślinności. (intensywność C)' },
    { code: 'K01', name: 'Abiotyczne (powolne) procesy naturalne', description: 'Potencjalnie siedlisko w przyszłości może zostać zasypane piaskiem. (intensywność A)' },
  ],
  other: {
    otherValues: 'Nadmorskie wydmy białe 2120; nadmorskie wydmy szare 2130; nadmorskie wrzosowiska bażynowe 2140; bór bażynowy 2180.',
    conservation: 'Wykonywane działania ochronne: nie stwierdzono (obszar ochrony ścisłej). Propozycje wprowadzenia działań ochronnych: brak.',
    notes:
      'Typ stanowiska: referencyjne. Zarządzający terenem: Słowiński Park Narodowy. Nazwa obszaru N2000: Ostoja Słowińska PLH220023. Typ monitoringu: szczegółowy. Zagrożenia: potencjalne zagrożenie polega na zasypaniu siedliska przez ruchome piaski; jest ono niewielkie, ponieważ stanowisko znajduje się w obszarze o utrwalonej przez roślinność powierzchni. Monitoring jest wymagany: tak – potencjalnie duża dynamika roślinności. Uwagi dodatkowe: kontrola winna określić również stopień zarastania przez fanerofity; sukcesja boru bażynowego może spowodować zanik siedliska 2190. Udział powierzchni siedliska w stanie FV: 90%, U1: 10%, U2: –.',
    photos: [],
  },
  overallComment: 'Powierzchnia siedliska we właściwym stanie zachowania: FV 90%, U1 10%.',
}

export const examples2190: CardExample[] = [{ id: 'madwiny1', label: 'Madwiny 1', values: madwiny1 }]
