// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Lemke 2015, rozdz. 2120, pkt 3 „Przykład karty
// obserwacji”): Jezioro Wicko, 28.09.2013. Wykonawca zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („54º 33'…”N 16º 35'…”E”) – przepisane do minut;
//  • zdjęcia fitosocjologiczne: 3 × 25 m², 7 m n.p.m., gatunki i zwarcia jak w karcie (w zdjęciu III krzewy
//    Salix acutifolia w warstwie B, 2 m);
//  • wartości wskaźników przepisane z karty jako opisy (karta nie podaje procentów);
//  • kondycja traw U1 przy strukturze FV – jak w karcie. Sprawozdanie 2016–2018 tłumaczy tę U1 późnym terminem,
//    więc stanowisko ma „Kondycja traw w ocenie struktury” = niekardynalny (patrz specyfikacja);
//  • gatunki obce (wskaźnik pomocniczy, w karcie z przewodnika go nie ma): przepisane ze zdjęć i oddziaływań –
//    Salix acutifolia i Pinus nigra; nie zmieniają oceny;
//  • oddziaływania: intensywność A → H (silna), wpływ „–”.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology2120 } from './methodology'

const COORD = 'N 54°33′; E 16°35′'

type Row = [layer: 'B' | 'C', name: string, abundance: string]

const releve = (cover: { B?: number; C: number }, height: { B?: number; C: number }, species: Row[]) => ({
  coords: COORD,
  altitude: 7,
  area: 25,
  slope: 0,
  exposure: 'brak',
  coverB: cover.B,
  coverC: cover.C,
  heightB: height.B,
  heightC: height.C,
  unit: 'Elymo-Ammophiletum arenariae',
  species: species.map(([layer, name, abundance]) => ({ layer, name, abundance })),
})

export const jezioroWicko: CardValues = {
  ...emptyCardValues(methodology2120),
  site: {
    siteName: 'Jezioro Wicko',
    guid: '',
    communities: 'Elymo-Ammophiletum arenariae',
    description: 'Siedlisko obejmuje wąski pas wydmy przedniej na szerokiej mierzei Jeziora Wicko.',
    areaHa: 1,
    protectedAreas: 'brak',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '200x10 m',
    altitude: '5–7',
    date: '2013-09-28',
    grassesRole: 'late',
    observer: 'Jan Kowalski',
  },
  releves: [
    releve({ C: 15 }, { C: 30 }, [
      ['C', 'Ammophila arenaria', '1'],
      ['C', 'Artemisia campestris subsp. sericea', '2'],
      ['C', 'Eryngium maritimum', 'r'],
      ['C', 'Festuca villosa', '+'],
      ['C', 'Hieracium umbellatum', '+'],
      ['C', 'Honckenya peploides', '+'],
      ['C', 'Petasites spurius', 'r'],
    ]),
    releve({ C: 40 }, { C: 30 }, [
      ['C', 'Ammophila arenaria', '3'],
      ['C', 'Artemisia campestris subsp. sericea', '+'],
      ['C', 'Festuca rubra', '3'],
      ['C', 'Hieracium umbellatum', '+'],
      ['C', 'Pinus nigra', 'r'],
      ['C', 'Pinus sylvestris', 'r'],
    ]),
    releve({ B: 40, C: 5 }, { B: 2, C: 30 }, [
      ['B', 'Salix acutifolia', '3'],
      ['C', 'Ammophila arenaria', '+'],
      ['C', 'Artemisia campestris subsp. sericea', '1'],
      ['C', 'Corynephorus canescens', '+'],
      ['C', 'Epipactis sp.', '1'],
      ['C', 'Hieracium umbellatum', '+'],
      ['C', 'Linaria odora', '+'],
    ]),
  ],
  indicators: {
    area: { inputs: { choice: 'stable', areaHa: undefined, note: 'Powierzchnia stabilna, nie zmniejsza się.' }, value: 'Powierzchnia stabilna, nie zmniejsza się.', grade: 'FV' },
    species: {
      inputs: {
        species: [
          { name: 'Ammophila arenaria' },
          { name: 'Festuca villosa' },
          { name: 'Eryngium maritimum' },
          { name: 'Linaria odora' },
        ],
        choice: 'whole',
        note: 'Występują gatunki charakterystyczne. Duże bogactwo gatunkowe na stanowisku, występuje cała gama gatunków, w tym Linaria odora i Eryngium maritimum.',
      },
      value: 'Występują gatunki charakterystyczne. Duże bogactwo gatunkowe na stanowisku, występuje cała gama gatunków, w tym Linaria odora i Eryngium maritimum.',
      grade: 'FV',
    },
    nitrophilous: { inputs: { species: [], abundance: '', choice: 'none' }, value: 'brak', grade: 'FV' },
    grasses: {
      inputs: { value: undefined, choice: 'sporadic', note: 'Trawy kwitną i owocują, ale sporadycznie.' },
      value: 'Trawy kwitną i owocują, ale sporadycznie.',
      grade: 'U1',
    },
    aliens: {
      inputs: { species: [{ name: 'Salix acutifolia' }, { name: 'Pinus nigra' }], choice: 'many' },
      value: 'Salix acutifolia, Pinus nigra',
      grade: 'U2',
    },
    abrasion: {
      inputs: { choice: 'accumulative', note: 'Brak śladów abrazji brzegu morskiego.' },
      value: 'Brak śladów abrazji brzegu morskiego.',
      grade: 'FV',
    },
    damage: { inputs: { choice: 'none', note: 'Nie stwierdzono' }, value: 'Nie stwierdzono', grade: 'FV' },
  },
  prospects: { value: 'Istnieje prawdopodobieństwo niepogorszenia stanu ochrony.', grade: 'FV' },
  impacts: [
    {
      code: 'J02.12.01',
      name: 'Prace związane z obroną przed aktywnością morza i ochroną wybrzeży, groble',
      influence: '-',
      intensity: 'H',
      description: 'Stabilizacja wydm za pomocą nasadzeń Salix acutifolia i Salix daphnoides.',
    },
  ],
  threats: [
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)', description: 'Sukcesja w kierunku zespołu Helichryso-Jasionetum litoralis.' },
  ],
  other: {
    otherValues: 'Na stanowisku występuje Eryngium maritimum i Linaria odora.',
    conservation: 'Wykonywane działania ochronne: nie prowadzono. Propozycje: brak.',
    notes:
      'Typ stanowiska: badawcze. Zarządzający terenem: Urząd Morski w Słupsku. Monitoring jest wymagany: tak – należy monitorować dynamikę siedliska ze względu na stopniową stabilizację wydmy – sukcesję w kierunku zespołu Helichryso-Jasionetum litoralis. Udział powierzchni w stanie FV: 100%. Kondycja traw liczona jako niekardynalna: późny termin badań (koniec września) – sprawozdanie 2016–2018 tłumaczy nim ocenę U1 tego wskaźnika na stanowisku.',
    photos: [],
  },
  overallComment: 'Jeden z lepiej zachowanych płatów, występuje cała gama gatunków charakterystycznych dla wydmy białej.',
}

export const examples2120: CardExample[] = [{ id: 'jezioro-wicko', label: 'Jezioro Wicko', values: jezioroWicko }]
