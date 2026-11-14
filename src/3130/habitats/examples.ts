// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Zalewska-Gałosz 2015, tom IV, rozdz. 3130, pkt 3 „Przykład
// karty obserwacji”): staw Przeborek (Mały Przebór) w kompleksie stawowym Brzeszcze k. Oświęcimia, 21.10.2013.
// Osoby zanonimizowane (ekspert lokalny – Jan Kowalski, dodatkowy ekspert – Anna Nowak, zarządzający – gospodarstwo rybackie).
//  • współrzędne w przewodniku są ucięte do minut („50º00'…''N 19º08'…''E”) – przepisane do minut;
//  • zdjęcia fitosocjologiczne jak w karcie (1 m², tylko warstwa C); literówki „Calitriche”, „aciularis” poprawione;
//  • „Powierzchnia zajęta przez siedlisko na transekcie” (100%, FV) – jest w karcie, ale nie w tab. 2: pomocniczy, poza oceną;
//  • klasa zbiorowisk: mozaika (Cyperus fuscus-Limosella – Isoëto-Nanojuncetea, Eleocharitetum acicularis – Littorelletea);
//  • oddziaływanie F01 z intensywnością A → H; zagrożenia („nie stwierdzono”, potencjalne – zaniechanie gospodarki
//    rybackiej) i pola „Raportu rocznego” w uwagach; udział FV/U1/U2 = 100/0/0 w „Innych informacjach”.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology3130 } from './methodology'

const COORD = 'N 50°00′; E 19°08′'

type Row = [name: string, abundance: string]
const releve = (coverC: number, unit: string, species: Row[]) => ({
  coords: COORD,
  altitude: 233,
  area: 1,
  slope: 0,
  exposure: 'brak',
  coverA: 0,
  coverB: 0,
  coverC,
  coverD: 0,
  heightA: 0,
  heightB: 0,
  heightC: 5,
  heightD: 0,
  unit,
  species: species.map(([name, abundance]) => ({ layer: 'C', name, abundance })),
})

export const przeborek: CardValues = {
  ...emptyCardValues(methodology3130),
  site: {
    siteName: 'Przeborek',
    guid: '',
    subtype: '3130-2',
    communityClass: 'mixed',
    siteType: 'Referencyjne',
    communities: 'Cyperus fuscus-Limosella aquatica zbiorowisko cibory brunatnej i namulnika brzegowego; Eleocharitetum acicularis zespół ponikła igłowatego',
    description:
      'Staw Przeborek (Mały Przebór) znajduje się w kompleksie stawowym Brzeszcze k. Oświęcimia. Siedlisko zajmuje całe dno osuszonego stawu. Miejscami obserwuje się agregacje rzepichy ziemnowodnej Rorippa amphibia, zaznacza się też udział pojedynczych okazów wierzb (Salix ssp.)',
    areaHa: 3.36,
    protectedAreas: 'Brak',
    natura2000: 'PLB120009 Stawy w Brzeszczach',
    manager: 'Gospodarstwo rybackie',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '150 m; w związku z tym, że środkowa część stawu była bardzo grząska transekt poprowadzono w strefie przybrzeżnej, w kształcie litery L',
    altitude: '233',
    date: '2013-10-21',
    observer: 'Jan Kowalski',
    additionalExperts: 'Anna Nowak',
  },
  releves: [
    releve(90, 'asocjacja reprezentująca związek Elatini-Eleocharition ovatae', [
      ['Agrostis stolonifera', 'r'],
      ['Alisma plantago-aquatica', 'r'],
      ['Batrachium sp.', '1'],
      ['Callitriche sp.', '3'],
      ['Elatine triandra', '1'],
      ['Eleocharis ovata', '1'],
      ['Glyceria maxima', 'r'],
      ['Gnaphalium uliginosum', '2'],
    ]),
    releve(80, 'Cyperus fuscus-Limosella aquatica', [
      ['Agrostis stolonifera', '+'],
      ['Alisma plantago-aquatica', '+'],
      ['Batrachium sp.', '+'],
      ['Callitriche sp.', '2'],
      ['Cyperus fuscus', 'r'],
      ['Eleocharis ovata', '1'],
      ['Eleocharis acicularis', '2'],
      ['Gnaphalium uliginosum', '1'],
      ['Juncus bufonius', '+'],
      ['Limosella aquatica', '1'],
      ['Polygonum lapathifolium', 'r'],
      ['Rorippa amphibia', '+'],
    ]),
    releve(60, 'Cyperus fuscus-Limosella aquatica', [
      ['Agrostis stolonifera', 'r'],
      ['Alisma plantago-aquatica', 'r'],
      ['Batrachium sp.', '+'],
      ['Callitriche sp.', '2'],
      ['Elatine triandra', 'r'],
      ['Eleocharis ovata', 'r'],
      ['Eleocharis acicularis', '1'],
      ['Gnaphalium uliginosum', '2'],
      ['Limosella aquatica', '2'],
      ['Polygonum lapathifolium', 'r'],
      ['Rorippa amphibia', 'r'],
    ]),
  ],
  indicators: {
    area: { inputs: { choice: 'stable', areaHa: 3.36, note: '' }, value: '3,36 ha', grade: 'FV' },
    transectShare: { inputs: { value: 100, note: '' }, value: '100%', grade: 'FV' },
    fragmentation: {
      inputs: { degree: 'none', cause: '', note: 'Brak fragmentacji, jeden zwarty płat' },
      value: 'Brak fragmentacji, jeden zwarty płat',
      grade: 'FV',
    },
    species: {
      inputs: {
        species: [
          { name: 'Eleocharis acicularis', cover: 60 },
          { name: 'Limosella aquatica', cover: 40 },
          { name: 'Callitriche sp.', cover: 40 },
          { name: 'Gnaphalium uliginosum', cover: 30 },
          { name: 'Eleocharis ovata', cover: 5 },
          { name: 'Plantago intermedia', cover: 5 },
          { name: 'Batrachium sp.', cover: 1 },
          { name: 'Elatine triandra', cover: 1 },
          { name: 'Cyperus fuscus', cover: 0.5 },
        ],
        count: undefined,
        note:
          'ponikło igłowate Eleocharis acicularis 60%, namulnik brzegowy Limosella aquatica 40%, rzęśl Callitriche sp. 40%, szarota błotna Gnaphalium uliginosum 30%, ponikło jajowate Eleocharis ovata 5%, babka wielonasienna Plantago intermedia <5%, włosiennicznik Batrachium juv. 1%, nadwodnik trójpręcikowy Elatine triandra 1%, cibora brunatna Cyperus fuscus <1%',
      },
      value:
        'ponikło igłowate Eleocharis acicularis 60%, namulnik brzegowy Limosella aquatica 40%, rzęśl Callitriche sp. 40%, szarota błotna Gnaphalium uliginosum 30%, ponikło jajowate Eleocharis ovata 5%, babka wielonasienna Plantago intermedia <5%, włosiennicznik Batrachium juv. 1%, nadwodnik trójpręcikowy Elatine triandra 1%, cibora brunatna Cyperus fuscus <1%',
      grade: 'FV',
    },
    dominants: {
      inputs: {
        species: [
          { name: 'Eleocharis acicularis', cover: 60 },
          { name: 'Limosella aquatica', cover: 40 },
          { name: 'Callitriche sp.', cover: 40 },
        ],
        none: '',
        note: 'ponikło igłowate Eleocharis acicularis 60%, namulnik brzegowy Limosella aquatica 40%, rzęśl Callitriche sp. 40%',
      },
      value: 'ponikło igłowate Eleocharis acicularis 60%, namulnik brzegowy Limosella aquatica 40%, rzęśl Callitriche sp. 40%',
      grade: 'FV',
    },
    expansive: {
      inputs: {
        species: [
          { name: 'Rorippa amphibia', cover: 5 },
          { name: 'Salix sp.', cover: 5 },
          { name: 'Phragmites australis', cover: 1 },
        ],
        total: undefined,
        none: '',
        note: 'rzepicha ziemnowodna Rorippa amphibia 5%, wierzba Salix ssp. 5%, trzcina pospolita Phragmites australis 1% (lokalnie)',
      },
      value: 'rzepicha ziemnowodna Rorippa amphibia 5%, wierzba Salix ssp. 5%, trzcina pospolita Phragmites australis 1% (lokalnie)',
      grade: 'FV',
    },
    aliens: { inputs: { species: [], total: undefined, none: 'yes', note: 'Brak' }, value: 'Brak', grade: 'FV' },
    wellPreserved: { inputs: { value: 95, note: '' }, value: '95%', grade: 'FV' },
  },
  prospects: { value: 'Perspektywy zachowania siedliska są dobre pod warunkiem dalszego prowadzenia zrównoważonej gospodarki rybackiej', grade: 'FV' },
  impacts: [
    {
      code: 'F01',
      name: 'Akwakultura morska i słodkowodna',
      influence: '+',
      intensity: 'H',
      description:
        'Siedlisko istnieje dzięki zrównoważonej gospodarce rybackiej, polegającej na użytkowaniu stawu w sezonie wegetacyjnym (staw z wodą) oraz spuszczaniu wody na okres zimowy. Odsłonięte dno stawu w okresie jesienno-wiosennym umożliwia rozwój siedliska 3130. Zaprzestanie użytkowania może w krótkim czasie doprowadzić do zarośnięcia powierzchni dna stawu roślinami typowymi dla kolejnych stadiów sukcesyjnych, co uniemożliwi rozwój inicjalnym zbiorowiskom terofitów. (Intensywność w karcie: A.)',
    },
  ],
  threats: [],
  other: {
    otherValues:
      'Z tego stanowiska notowana jest lindernia mułowa Lindernia procumbens, jednak w 2013 gatunku nie obserwowano. Na stanowisku występuje dość rzadka w Polsce południowej rdestnica trawiasta Potamogeton gramineus, w siedlisku obecna w formie lądowej. Kompleks stawów Brzeszcze jest siedliskiem wielu gatunków ptaków, jest zatwierdzony jako ostoja ptasia PLB120009 „Stawy w Brzeszczach”.',
    conservation: 'Brak',
    proposals: 'Brak. Warunkiem trwałości siedliska jest utrzymanie gospodarki rybackiej na aktualnym poziomie.',
    shareFV: 100,
    shareU1: 0,
    shareU2: 0,
    notes:
      'Rok: 2013. Data kontroli: 21.10.2013. Zagrożenia: nie stwierdzono. Potencjalnym zagrożeniem jest zaniechanie zrównoważonej gospodarki rybackiej.\nMonitoring jest wymagany: tak. Uzasadnienie: siedlisko w zależności od warunków pogodowych panujących w danym roku może być w różnym stopniu rozwinięte, monitoring (okresowe kontrole) pozwoli uzyskać pełniejszy obraz stanu siedliska.\nInne obserwacje: brak.\nUwagi metodyczne: optymalny termin obserwacji – przełom wiosny i lata oraz późna jesień, w zależności od warunków pogodowych październik i/lub listopad.\nUwagi dodatkowe: Lindernia procumbens jest gatunkiem objętym ścisłą ochroną gatunkową w Polsce, umieszczonym na Czerwonej Liście Roślin Naczyniowych w Polsce (Zarzycki, Szeląg 2006) w kategorii V – narażony na wymarcie oraz w Polskiej Czerwonej Księdze Roślin (Kaźmierczakowa, Zarzycki 2001) w kategorii CR – krytycznie zagrożony. Jest to również gatunek o znaczeniu wspólnotowym.',
    photos: [],
  },
  overallComment: '',
}

export const examples3130: CardExample[] = [{ id: 'przeborek', label: 'Przeborek', values: przeborek }]
