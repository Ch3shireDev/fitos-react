// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Pawlaczyk 2012, rozdz. 4030, pkt 3 „Przykład wypełnionej karty
// obserwacji”): Duchny Młode I, Czerwony Bór (PLH200018), 26.08.2011. Koordynator zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („22° 02' ...'' E – 52° 59' ...'' N”) – przepisane do minut;
//  • typ wrzosowiska: janowcowe (Calluno-Genistetum) – mącznica (2%) nie jest doliczana do wrzosu; wrzos „75–80%” → 75;
//  • trawy: Festuca ovina 5, Agrostis capillaris 0,5, Calamagrostis epigejos „2–3%” → 2,5; razem 8% → FV (bez
//    zaokrąglania do dziesiątek, o którym mówi tab. 1 – z zaokrągleniem byłoby 10% → U1, a karta daje FV);
//  • drzewa: Pinus sylvestris 3 + Betula pendula 2 = 5% → FV;
//  • apofity: trzcinnik „w niewielkiej ilości, nie stwarza zagrożenia” → FV jak w karcie, czyli „Nie stwierdzono” ekspansji
//    i opis; wpisany na listę dałby U1 („pojedyncze”);
//  • „Inne zniekształcenia” – karta z przewodnika nie ma tego wiersza (choć tab. 1 i 2 go mają): ocena XX z opisem; XX
//    wskaźnika niekardynalnego nie zmienia struktury (FV);
//  • zdjęcia jak w karcie (po 25 m², nie 100 m² jak w metodyce; „Arctostaphyllos” poprawione na Arctostaphylos);
//  • oddziaływania: stare kody (2010) → słownik 2011: 100 Uprawa → A01, 161 Zalesianie → B01, 950 → K02;
//    intensywność A/B → H/M (stary kod w opisie);
//  • udział powierzchni o różnym stanie zachowania (FV –, U1 100%, U2 –) – w polach „Inne informacje”.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology4030 } from './methodology'

const COORD = 'N 52°59′; E 22°02′'

type Row = [layer: 'B' | 'C' | 'D', name: string, abundance: string]
const releve = (o: { altitude: number; slope: number; exposure: string; coverB?: number; coverC: number; coverD: number; heightB?: number; heightC: number; heightD: number }, species: Row[]) => ({
  coords: COORD,
  area: 25,
  unit: 'Calluno-Genistetum',
  coverB: undefined,
  heightB: undefined,
  ...o,
  species: species.map(([layer, name, abundance]) => ({ layer, name, abundance })),
})

const AREA_NOTE =
  'Potencjalna powierzchnia siedliska jest znacznie większa. Zasięg występowania 4030 został ograniczony w wyniku sztucznych nasadzeń, głównie brzozy i sosny. Mniejsza część powierzchni uległa samoczynnemu zarośnięciu w wyniku zarzucenia użytkowania wojskowego-poligonowego.'

export const duchnyMlode1: CardValues = {
  ...emptyCardValues(methodology4030),
  site: {
    siteName: 'Duchny Młode I',
    guid: '',
    heathType: 'genista',
    communities: 'Calluno-Genistetum odmiana subkontynentalna',
    description:
      'Stanowisko zlokalizowane na byłym poligonie wojskowym. Powierzchnia siedliska jest znaczna, lecz na dużej części wydzielenia leśnego zauważalna jest sukcesja wtórna, pozostała część została zalesiona (głównie sosną i brzozą). Teren wyraźnie pofalowany o zmiennym kierunku ekspozycji. W obrębie stanowiska występują pojedyncze wyniesienia – wydmy, z których wiele porośnięte jest drzewami lub krzewami. Zbiorowisko jednorodne choć miejscowo występują jednogatunkowe agregacje trzcinnika piaskowego Calamagrostis epigejos bądź z dominacją kostrzewy owczej Festuca ovina i dużym pokryciem Rumex acetosella (poza transektem). W dniu wizji wrzos zwyczajny Calluna vulgaris – początek pełni kwitnienia. Nie stwierdzono występowania janowca ciernistego Genista germanica, odnotowano obecność janowca barwierskiego Genista tinctoria.\n\nStruktura warstwy (c) wyraźnie dwuwarstwowa, wysokość (c): 10–50 cm. Wyższą warstwę tworzy janowiec, żarnowiec oraz wrzos, niższą, takie rośliny jak: szczaw polny Rumex acetosella, fiołek psi Viola canina i przetacznik leśny Veronica officinalis, turzyca wrzosowiskowa Carex ericetorum. Warstwa mszysta średnio rozwinięta, zdominowana przez rokietnik pospolity Pleurozium schreberi.',
    areaHa: 0.8,
    protectedAreas: 'PLH200018 Czerwony Bór',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '10x200 m',
    altitude: '138–141',
    date: '2011-08-26',
    observer: 'Jan Kowalski',
  },
  releves: [
    releve({ altitude: 141, slope: 0, exposure: '', coverC: 75, coverD: 5, heightC: 50, heightD: 2 }, [
      ['C', 'Arctostaphylos uva-ursi', '+'],
      ['C', 'Calluna vulgaris', '4'],
      ['C', 'Danthonia decumbens', 'r'],
      ['C', 'Festuca ovina', '+'],
      ['C', 'Genista tinctoria', '+'],
      ['C', 'Hieracium pilosella', '+'],
      ['C', 'Hypericum perforatum', '+'],
      ['C', 'Juniperus communis', 'r'],
      ['C', 'Rumex acetosella', '+'],
      ['C', 'Sarothamnus scoparius', '+'],
      ['C', 'Solidago virgaurea', '+'],
      ['C', 'Thymus serpyllum', '+'],
      ['C', 'Viola canina', '+'],
      ['D', 'Pleurozium schreberi', '1'],
    ]),
    releve({ altitude: 140, slope: 0, exposure: '', coverB: 1, coverC: 85, coverD: 5, heightB: 1.5, heightC: 50, heightD: 2 }, [
      ['B', 'Pinus sylvestris', 'r'],
      ['C', 'Calluna vulgaris', '5'],
      ['C', 'Carex ericetorum', '+'],
      ['C', 'Festuca ovina', '+'],
      ['C', 'Genista tinctoria', '+'],
      ['C', 'Jasione montana', 'r'],
      ['C', 'Rumex acetosella', '+'],
      ['C', 'Sarothamnus scoparius', '1'],
      ['C', 'Viola canina', '+'],
      ['D', 'Pleurozium schreberi', '1'],
    ]),
    releve({ altitude: 139, slope: 1, exposure: 'NW', coverC: 80, coverD: 5, heightC: 50, heightD: 2 }, [
      ['C', 'Agrostis capillaris', '+'],
      ['C', 'Betula pendula', 'r'],
      ['C', 'Calamagrostis epigejos', 'r'],
      ['C', 'Calluna vulgaris', '4'],
      ['C', 'Festuca ovina', '1'],
      ['C', 'Genista tinctoria', '+'],
      ['C', 'Jasione montana', 'r'],
      ['C', 'Pinus sylvestris', '+'],
      ['C', 'Rumex acetosella', '+'],
      ['C', 'Sarothamnus scoparius', '1'],
      ['C', 'Solidago virgaurea', 'r'],
      ['C', 'Vaccinium myrtillus', '+'],
      ['C', 'Vaccinium vitis-idaea', '+'],
      ['C', 'Veronica officinalis', '+'],
      ['D', 'Pleurozium schreberi', '1'],
    ]),
  ],
  indicators: {
    area: { inputs: { choice: 'slow', areaHa: undefined, note: AREA_NOTE }, value: AREA_NOTE, grade: 'U1' },
    calluna: {
      inputs: { calluna: 75, arcto: 2, note: 'Pokrycie na transekcie: wrzos 75–80%, mącznica 2%.' },
      value: 'Pokrycie na transekcie: wrzos 75–80%, mącznica 2%.',
      grade: 'FV',
    },
    grasses: {
      inputs: {
        species: [
          { name: 'Festuca ovina', cover: 5 },
          { name: 'Agrostis capillaris', cover: 0.5 },
          { name: 'Calamagrostis epigejos', cover: 2.5 },
        ],
        total: undefined,
        note: 'Festuca ovina 5%, Agrostis capillaris 0,5%, Calamagrostis epigejos 2–3%.',
      },
      value: 'Festuca ovina 5%, Agrostis capillaris 0,5%, Calamagrostis epigejos 2–3%.',
      grade: 'FV',
    },
    trees: {
      inputs: {
        species: [
          { name: 'Pinus sylvestris', cover: 3 },
          { name: 'Betula pendula', cover: 2 },
        ],
        total: undefined,
        note: 'Pinus sylvestris 3% wys. 1,5–2,5 m; Betula pendula 2%, wys. 5–8 m.',
      },
      value: 'Pinus sylvestris 3% wys. 1,5–2,5 m; Betula pendula 2%, wys. 5–8 m.',
      grade: 'FV',
    },
    aliens: {
      inputs: { species: [], total: undefined, none: 'yes', note: 'Nie stwierdzono obecności gatunków obcych geograficznie.' },
      value: 'Nie stwierdzono obecności gatunków obcych geograficznie.',
      grade: 'FV',
    },
    expansive: {
      inputs: {
        species: [],
        total: undefined,
        none: 'yes',
        note: 'Obecny trzcinnik piaskowy Calamagrostis epigejos, ale w niewielkiej ilości; na tę chwilę nie stwarza zagrożenia dla monitorowanego siedliska.',
      },
      value: 'Obecny trzcinnik piaskowy Calamagrostis epigejos, ale w niewielkiej ilości; na tę chwilę nie stwarza zagrożenia dla monitorowanego siedliska.',
      grade: 'FV',
    },
    population: {
      inputs: { choice: 'all', note: 'Obecne i liczne wszystkie fazy rozwojowe wrzosu i mącznicy; stan populacji stabilny.' },
      value: 'Obecne i liczne wszystkie fazy rozwojowe wrzosu i mącznicy; stan populacji stabilny.',
      grade: 'FV',
    },
    keySpecies: { inputs: { choice: 'noData', note: 'Brak danych' }, value: 'Brak danych', grade: 'XX' },
    distortions: {
      inputs: { choice: '', note: 'Brak w karcie z przewodnika – wskaźnika nie oceniono.' },
      value: 'Brak w karcie z przewodnika – wskaźnika nie oceniono.',
      grade: 'XX',
    },
  },
  prospects: {
    value: 'Postępujący proces sukcesji wtórnej; niepodjęcie działań w dalszej perspektywie doprowadzi do degradacji siedliska 4030.',
    grade: 'U1',
  },
  impacts: [
    { code: 'A01', name: 'Uprawa', influence: '-', intensity: 'M', description: 'Sztuczne nasadzenia na terenie popoligonowym. (Kod w karcie z 2011 r.: 100 Uprawa, intensywność B.)' },
    { code: 'B01', name: 'Zalesianie terenów otwartych', influence: '-', intensity: 'M', description: 'Duże powierzchnie byłego poligonu zostały już zalesione. (Kod w karcie z 2011 r.: 161 Zalesianie, intensywność B.)' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja', influence: '-', intensity: 'H', description: 'Sukcesja wtórna. (Kod w karcie z 2011 r.: 950 Ewolucja biocenotyczna, intensywność A.)' },
  ],
  threats: [],
  other: {
    otherValues: 'Nie zaobserwowano',
    conservation:
      'Wykonywane działania ochronne: nie obserwowano, raczej brak. Propozycje: usuwanie nalotu drzew i krzewów co kilka, kilkanaście lat; kontrolowane wypalanie małopowierzchniowe.',
    shareFV: 0,
    shareU1: 100,
    shareU2: 0,
    notes:
      'Typ stanowiska: referencyjne. Zarządzający terenem: Lasy Państwowe, Nadleśnictwo Łomża. Typ monitoringu: zintegrowany, rok 2011. Zagrożenia (w karcie opisowo): sukcesja wtórna oraz sztuczne nasadzenia prowadzone przez jednostkę zarządzającą (LP). Monitoring jest wymagany – płat siedliska 4030 dobrze wykształcony, dość zróżnicowany gatunkowo; monitoring jest również wskazany w celu podjęcia właściwych działań ochronnych w momencie zbyt silnego zarastania przez gatunki drzewiaste i krzewy. Uwagi z karty: zaniechać nowych sztucznych nasadzeń, obecnie ogromna część byłego poligonu została poddana pod zalesianie. Zdjęcia fitosocjologiczne po 25 m² (metodyka: 100 m²).',
    photos: [],
  },
  overallComment: '',
}

export const examples4030: CardExample[] = [{ id: 'duchnyMlode1', label: 'Duchny Młode I', values: duchnyMlode1 }]
