// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Świerkosz, Szczęśniak, Reczyńska 2010, rozdz. 6110, pkt 3
// „Przykład wypełnionej karty obserwacji”): Wapniarka (Pasmo Krowiarki), 28.08.2008. Koordynator i dodatkowy koordynator
// zanonimizowani (Jan Kowalski, Anna Nowak).
//  • współrzędne w przewodniku są ucięte do minut („N 50°21′ …; E 16°40′ …”) – przepisane do minut;
//  • zestaw wskaźników „Przewodnik 2010” – karta ma „Ocienienie muraw” (2% → FV), usunięte modyfikacją z 2015 r.;
//  • zdjęcia: karta nie podaje warstw – przyjęto domyślne z katalogu (brzoza i wierzba iwa w B, reszta w C); zdjęcie II
//    bez wysokości n.p.m. (w karcie brak); zdjęcie III – „Brak możliwości wykonania zdjęcia” w uwagach do zdjęcia;
//  • ekspansja krzewów: brzoza 1% + wierzba iwa 1% z oceną FV, choć wg tab. 2 FV to „brak” (do 30% – U1) – ocena eksperta
//    zostaje, formularz pokazuje rozjazd z progiem (na wynik nie wpływa: struktura i tak U2 przez gatunki
//    charakterystyczne i dominujące);
//  • literówki w nazwach mięczaków: Charpentiera ornata → Charpentieria ornata, Helicigonia lapacida → Helicigona lapicida;
//  • działalność człowieka: stary kod 301 Kamieniołomy → C01 (słownik 2011), intensywność A → H, wpływ „–/+” → „+”
//    (siedlisko istnieje dzięki odsłoniętym ściankom), część „–” (intensyfikacja wydobycia) jako zagrożenie C01 z treścią
//    „Zagrożenia” z karty; stary kod i wpływ w opisie.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues, emptyReleve } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology6110 } from './methodology'

const COORD = 'N 50°21′; E 16°40′'

type Row = [layer: 'B' | 'C', name: string, abundance: string]
const releve = (o: Record<string, unknown>, species: Row[] = []) => ({
  ...emptyReleve(methodology6110),
  ...o,
  species: species.map(([layer, name, abundance]) => ({ layer, name, abundance })),
})

export const wapniarka: CardValues = {
  ...emptyCardValues(methodology6110),
  site: {
    siteName: 'Wapniarka',
    guid: '',
    siteType: 'badawcze',
    indicatorSet: 'guide2010',
    communities: 'Saxifrago-Poetum compressae',
    description:
      'Siedlisko w formie inicjalnej, rozwija się na półkach skalnych w obecnie nie eksploatowanym kamieniołomie marmuru i dolomitu u północnego podnóża góry Wapniarka.',
    areaHa: 'Znane 6 m², potencjalnie w niedostępnej części ściany dalsze 40 m²',
    protectedAreas: 'PLH020019 Pasmo Krowiarki',
    manager: 'Własność: Zakłady Przetwórcze Surowców Chemicznych i Mineralnych Piotrowice',
    coords: COORD,
    transect: 'Tylko 2 płaty, wykonanie transektu niemożliwe',
    altitude: '400–410',
    date: '2008-08-28',
    date2: '',
    observer: 'Jan Kowalski',
    additionalExperts: 'Anna Nowak',
  },
  releves: [
    releve({ coords: COORD, altitude: 400, area: 2, slope: 90, exposure: 'E' }, [
      ['B', 'Betula pendula', '+'],
      ['C', 'Campanula rotundifolia', 'r'],
      ['C', 'Geranium robertianum', '+'],
      ['C', 'Poa compressa', '2'],
    ]),
    releve({ coords: COORD, area: 4, slope: 40, exposure: 'S' }, [
      ['C', 'Artemisia vulgaris', '+'],
      ['B', 'Betula pendula', '+'],
      ['C', 'Campanula rotundifolia', '+'],
      ['C', 'Origanum vulgare', '+'],
      ['C', 'Poa nemoralis', '2'],
      ['C', 'Poa compressa', '+'],
      ['B', 'Salix caprea', '1'],
    ]),
    releve({ remarks: 'Brak możliwości wykonania zdjęcia fitosocjologicznego' }),
  ],
  indicators: {
    area: {
      inputs: { choice: 'other', areaText: '', note: 'Siedlisko w formach inicjalnych, znane z 6 m², potencjalnie w niedostępnej części ściany dalsze 40 m²' },
      value: 'Siedlisko w formach inicjalnych, znane z 6 m², potencjalnie w niedostępnej części ściany dalsze 40 m²',
      grade: 'U1',
    },
    share: { inputs: { value: '', notDone: 'yes', note: '' }, value: 'Nie wykonano transektu', grade: 'XX' },
    characteristic: {
      inputs: { species: [{ name: 'Poa compressa', cover: 2 }], count: undefined, none: '', note: 'Wiechlina spłaszczona Poa compressa 2%' },
      value: 'Wiechlina spłaszczona Poa compressa 2%',
      grade: 'U2',
    },
    dominant: {
      inputs: { species: [{ name: 'Poa nemoralis', cover: 10 }], choice: '', note: 'Wiechlina gajowa Poa nemoralis 10%' },
      value: 'Wiechlina gajowa Poa nemoralis 10%',
      grade: 'U2',
    },
    aliens: { inputs: { species: [], cover: undefined, none: 'yes', note: '' }, value: 'Brak', grade: 'FV' },
    expansive: {
      inputs: { species: [{ name: 'Artemisia vulgaris', cover: 2 }], cover: undefined, none: '', note: 'Bylica pospolita Artemisia vulgaris 2%' },
      value: 'Bylica pospolita Artemisia vulgaris 2%',
      grade: 'U1',
    },
    structure: {
      inputs: { choice: 'kept', note: 'Mozaika siedliskowa zachowana; 2 płaty, zwarcie 10–30%' },
      value: 'Mozaika siedliskowa zachowana; 2 płaty, zwarcie 10–30%',
      grade: 'FV',
    },
    shrubs: {
      inputs: {
        species: [
          { name: 'Betula pendula', cover: 1 },
          { name: 'Salix caprea', cover: 1 },
        ],
        cover: undefined,
        none: '',
        note: 'Brzoza brodawkowata Betula pendula 1%, wierzba iwa Salix caprea 1%',
      },
      value: 'Brzoza brodawkowata Betula pendula 1%, wierzba iwa Salix caprea 1%',
      grade: 'FV',
    },
    shade: { inputs: { value: '2', note: '' }, value: '2%', grade: 'FV' },
    damage: {
      inputs: { kind: 'natural', cover: undefined, note: 'Niewielkie pojedyncze głazy odrywające się od ścian skalnych – zjawisko naturalne' },
      value: 'Niewielkie pojedyncze głazy odrywające się od ścian skalnych – zjawisko naturalne',
      grade: 'FV',
    },
  },
  prospects: {
    value: 'Planowane otwarcie kamieniołomu. Wykonana ocena środowiskowa powinna zabezpieczyć siedlisko, jednak nie wiadomo, czy jej zalecenia będą przestrzegane.',
    grade: 'U2',
  },
  impacts: [
    {
      code: 'C01',
      name: 'Kopalnie, kamieniołomy, wydobywanie',
      influence: '+',
      intensity: 'H',
      description:
        'Stanowisko rozwija się w kamieniołomie na odsłoniętych wskutek działalności ściankach skalnych (+), jednak intensyfikacja wydobycia spowoduje jego zniszczenie (–). (Kod w karcie z 2008 r.: 301 Kamieniołomy, intensywność A, wpływ –/+.)',
    },
  ],
  threats: [{ code: 'C01', name: 'Kopalnie, kamieniołomy, wydobywanie', description: 'Planowane ponowne otwarcie kamieniołomu.' }],
  other: {
    otherValues:
      'W obrębie kamieniołomu na Wapniarce, poza występowaniem mięczaków Charpentieria ornata i Helicigona lapicida, nie obserwowano. W sąsiedztwie występuje jednak szereg cennych siedlisk przyrodniczych (w tym murawy kserotermiczne z 3 gatunkami goryczek oraz buczyny storczykowe z obuwikiem pospolitym) i 27 chronionych gatunków roślin naczyniowych.',
    conservation: 'Nie',
    proposals: 'Nie',
    notes:
      'Rok: 2008. Typ monitoringu: szczegółowy. Monitoring jest wymagany: tak – z uwagi na inicjalne wykształcenie siedliska i jego występowanie tylko w dwóch niewielkich płatach dostępnych do obserwacji założenie stałych powierzchni badawczych nie wydaje się możliwe. Konieczny jest jednak monitoring dla zapobieżenia zniszczeniu stanowiska. Kontrola pod koniec sierpnia – poza optymalnym terminem (maj–lipiec).',
    photos: [],
  },
  overallComment: 'Minimalna powierzchnia, inicjalne formy siedliska, brak gatunków charakterystycznych, niepewne perspektywy zachowania.',
}

export const examples6110: CardExample[] = [{ id: 'wapniarka', label: 'Wapniarka', values: wapniarka }]
