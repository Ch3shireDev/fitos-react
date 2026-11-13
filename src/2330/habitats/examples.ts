// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Kulpiński, Tyc 2012, rozdz. 2330, pkt 3 „Przykład
// wypełnionej karty obserwacji”): Pustynia Błędowska, Chechło 2, 17.09.2011. Obserwatorzy zanonimizowani (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („N 50° 21' …'' – E 19° 31' …''”) – przepisane do minut;
//  • zdjęcia fitosocjologiczne jak w karcie (warstwy B, C, D; „Festuca sp.” zostaje jak w oryginale);
//  • gatunki charakterystyczne: karta liczy 5 (z Rumex acetosella i Cladonia sp., spoza listy tab. 1) – liczba 5 wpisana
//    wprost, więc FV jak w karcie; formularz ostrzega, że wg listy tab. 1 są tylko 3;
//  • ekspansja krzewów 40% → U1 (granica 40% do U1 – tak w karcie); obce: 1 gatunek, 1–3% → wpisane 3% → U1;
//  • oddziaływania: stare kody (2010) → słownik 2011: 424 → E03.04, 622 → G01.02, 623 → G01.03, 730 → G04.01,
//    950 → K02; intensywność A/B/C → H/M/L (stary kod w opisie);
//  • udział powierzchni o różnym stanie zachowania (FV 70%, U1 10%, U2 20%) – w polach „Inne informacje”.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology2330 } from './methodology'

const COORD = 'N 50°21′; E 19°31′'

type Row = [layer: 'B' | 'C' | 'D', name: string, abundance: string]
const releve = (o: { altitude: number; slope: number; exposure: string; coverB?: number; coverC: number; coverD: number; heightB?: number; heightC: number; heightD?: number }, species: Row[]) => ({
  coords: COORD,
  area: 25,
  unit: 'Spergulo vernalis-Corynephoretum',
  coverB: undefined,
  heightB: undefined,
  heightD: undefined,
  ...o,
  species: species.map(([layer, name, abundance]) => ({ layer, name, abundance })),
})

export const chechlo2: CardValues = {
  ...emptyCardValues(methodology2330),
  site: {
    siteName: 'Chechło 2',
    guid: '',
    communities: 'Murawy szczotlichowe Spergulo vernalis-Corynephoretum',
    description:
      'Siedlisko wykształcone w północnej, dużo mniej zarośniętej części Pustyni Błędowskiej. Ma charakter inicjalny, występuje w miejscach, gdzie procesy eoliczne są aktywne, w sąsiedztwie znajdują się utrwalone duże wydmy. Transekt usytuowany jest w większości na piaskach otwartych. Gatunki drzewiaste i krzewiaste zajmują około 40%, rosną głównie w końcowej części transektu. Mozaika siedliska 2330 z płatami wierzby płożącej Salix repens i sosny zwyczajnej Pinus sylvestris oraz z wyjeżdżonymi drogami. Rozjeżdżenie jest w niektórych miejscach dość znaczne. W siedlisku rośnie właściwy zestaw gatunków, dominują gatunki charakterystyczne.',
    areaHa: 160,
    protectedAreas: 'PLH120014 Pustynia Błędowska, Park Krajobrazowy Orlich Gniazd',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '20x100 m',
    altitude: '320–322',
    date: '2011-09-17',
    observer: 'Jan Kowalski',
  },
  releves: [
    releve({ altitude: 321, slope: 0, exposure: '', coverC: 25, coverD: 0, heightC: 25 }, [
      ['C', 'Corynephorus canescens', '2'],
      ['C', 'Koeleria glauca', '+'],
    ]),
    releve({ altitude: 320, slope: 0, exposure: '', coverB: 5, coverC: 15, coverD: 5, heightB: 1.5, heightC: 25, heightD: 0.5 }, [
      ['B', 'Salix acutifolia', '1'],
      ['C', 'Corynephorus canescens', '2'],
      ['C', 'Koeleria glauca', '1'],
      ['C', 'Pinus sylvestris', '+'],
      ['C', 'Rumex acetosella', '1'],
      ['C', 'Thymus serpyllum', '+'],
      ['D', 'Polytrichum piliferum', '1'],
    ]),
    releve({ altitude: 322, slope: 10, exposure: 'SW', coverB: 10, coverC: 65, coverD: 30, heightB: 2, heightC: 50, heightD: 0.5 }, [
      ['B', 'Betula pendula', '1'],
      ['B', 'Pinus sylvestris', '2'],
      ['C', 'Calamagrostis epigejos', '+'],
      ['C', 'Corynephorus canescens', '2'],
      ['C', 'Festuca sp.', '2'],
      ['C', 'Gypsophila fastigiata', '1'],
      ['C', 'Hieracium pilosella', '2'],
      ['C', 'Koeleria glauca', '2'],
      ['C', 'Rumex acetosella', '1'],
      ['C', 'Salix repens', '3'],
      ['C', 'Thymus serpyllum', '+'],
      ['D', 'Cetraria aculeata', '1'],
      ['D', 'Polytrichum piliferum', '2'],
    ]),
  ],
  indicators: {
    area: { inputs: { choice: 'stable', areaHa: undefined, note: '' }, value: 'nie podlega zmianom lub zwiększa się', grade: 'FV' },
    species: {
      inputs: {
        species: [
          { name: 'Corynephorus canescens' },
          { name: 'Rumex acetosella' },
          { name: 'Polytrichum piliferum' },
          { name: 'Cetraria aculeata' },
          { name: 'Cladonia sp.' },
        ],
        count: 5,
        note: 'Pięć gatunków: szczotlicha siwa Corynephorus canescens, szczaw polny Rumex acetosella, płonnik włosisty Polytrichum piliferum, płucnica kolczasta Cetraria aculeata, chrobotki Cladonia sp.',
      },
      value:
        'Pięć gatunków: szczotlicha siwa Corynephorus canescens, szczaw polny Rumex acetosella, płonnik włosisty Polytrichum piliferum, płucnica kolczasta Cetraria aculeata, chrobotki Cladonia sp.',
      grade: 'FV',
    },
    shrubs: {
      inputs: {
        value: 40,
        species: [
          { name: 'Salix acutifolia' },
          { name: 'Salix repens' },
          { name: 'Pinus sylvestris' },
          { name: 'Populus tremula' },
          { name: 'Frangula alnus' },
          { name: 'Betula pendula' },
          { name: 'Sorbus aucuparia' },
        ],
        note:
          'Stwierdzono 40% pokrycia dla krzewów i podrostu drzew. Wierzba ostrolistna Salix acutifolia, wierzba płożąca S. repens, sosna zwyczajna Pinus sylvestris, topola osika Populus tremula, kruszyna pospolita Frangula alnus, brzoza brodawkowata Betula pendula, jarząb pospolity Sorbus aucuparia',
      },
      value:
        'Stwierdzono 40% pokrycia dla krzewów i podrostu drzew. Wierzba ostrolistna Salix acutifolia, wierzba płożąca S. repens, sosna zwyczajna Pinus sylvestris, topola osika Populus tremula, kruszyna pospolita Frangula alnus, brzoza brodawkowata Betula pendula, jarząb pospolity Sorbus aucuparia',
      grade: 'U1',
    },
    expansive: {
      inputs: { species: [{ name: 'Calamagrostis epigejos', cover: 1 }], total: undefined, none: '', note: 'trzcinnik piaskowy Calamagrostis epigejos – pokrycie do 1%' },
      value: 'trzcinnik piaskowy Calamagrostis epigejos – pokrycie do 1%',
      grade: 'FV',
    },
    aliens: {
      inputs: {
        species: [{ name: 'Salix acutifolia', cover: 3 }],
        count: undefined,
        total: undefined,
        none: '',
        note: 'Stwierdzono jeden gatunek z pokryciem 1–3% transektu. Wierzba ostrolistna Salix acutifolia – niewiele i zamierająca',
      },
      value: 'Stwierdzono jeden gatunek z pokryciem 1–3% transektu. Wierzba ostrolistna Salix acutifolia – niewiele i zamierająca',
      grade: 'U1',
    },
    eolian: {
      inputs: { choice: 'active', bareSand: undefined, note: 'Obecne aktywne procesy eoliczne (piasek nawiany na kępy traw, pagórki fitogeniczne).' },
      value: 'Obecne aktywne procesy eoliczne (piasek nawiany na kępy traw, pagórki fitogeniczne).',
      grade: 'FV',
    },
    share: { inputs: { value: 60, note: 'Siedlisko zajmuje 60% transektu.' }, value: 'Siedlisko zajmuje 60% transektu.', grade: 'FV' },
    later: {
      inputs: { species: [{ name: 'Hieracium pilosella' }], count: undefined, none: '', note: 'Jeden gatunek – jastrzębiec kosmaczek Hieracium pilosella.' },
      value: 'Jeden gatunek – jastrzębiec kosmaczek Hieracium pilosella.',
      grade: 'FV',
    },
    distortions: {
      inputs: { choice: 'medium', note: 'Rozjeżdżanie przez pojazdy crossowe. Niewielka ilość śmieci komunalnych.' },
      value: 'Rozjeżdżanie przez pojazdy crossowe. Niewielka ilość śmieci komunalnych.',
      grade: 'U1',
    },
  },
  prospects: { value: 'Nadmierne rozjeżdżanie, a miejscami także zarastanie.', grade: 'U1' },
  impacts: [
    { code: 'E03.04', name: 'Inne odpady', influence: '-', intensity: 'L', description: 'Łuski po nabojach i odpady komunalne. (Kod w karcie z 2011 r.: 424 Inne odpady, intensywność C.)' },
    {
      code: 'G01.02',
      name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych',
      influence: '0',
      intensity: 'M',
      description: 'Turystyka tego typu nie ma zasadniczego wpływu na siedlisko. (Kod w karcie z 2011 r.: 622, intensywność B.)',
    },
    {
      code: 'G01.03',
      name: 'Pojazdy zmotoryzowane',
      influence: '-',
      intensity: 'H',
      description:
        'Z jednej strony zapobiega zarastaniu, z drugiej natężenie ruchu pojazdów motorowych (quady, motocykle crossowe) jest zbyt duże. Siedlisko jest nadmiernie rozjeżdżane. (Kod w karcie z 2011 r.: 623, intensywność A.)',
    },
    { code: 'G04.01', name: 'Poligony', influence: '+', intensity: 'M', description: 'Zapobiega zarastaniu. (Kod w karcie z 2011 r.: 730, intensywność B.)' },
    {
      code: 'K02',
      name: 'Ewolucja biocenotyczna, sukcesja',
      influence: '-',
      intensity: 'L',
      description: 'Stabilizacja muraw i sukcesja w stronę bardziej zwartych zbiorowisk. (Kod w karcie z 2011 r.: 950 Ewolucja biocenotyczna, intensywność C.)',
    },
  ],
  threats: [],
  other: {
    otherValues: '',
    conservation: '',
    shareFV: 70,
    shareU1: 10,
    shareU2: 20,
    notes:
      'Data wypełnienia karty: 27.09.2011. Transekt 20×100 m (20 arów) zamiast 200×10 m. Termin badań (wrzesień) poza optymalnym oknem metodyki – w karcie brak terofitów wiosennych. Karta z przewodnika nie zawiera zagrożeń, innych wartości przyrodniczych ani działań ochronnych.',
    photos: [],
  },
  overallComment: '',
}

export const examples2330: CardExample[] = [{ id: 'chechlo2', label: 'Chechło 2', values: chechlo2 }]
