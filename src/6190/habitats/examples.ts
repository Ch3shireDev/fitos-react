// Przykład poglądowy – NIE jest przepisaną kartą z terenu. Dla 6190 nie opublikowano przewodnika z przykładową kartą,
// więc przykład złożono z opisu stanowiska „Ostrzyca stok zachodni” w sprawozdaniach z monitoringu 2016 i 2024:
//  • oceny wskaźników, parametrów i ocena ogólna – tak jak wynikają ze sprawozdania 2024 (ekspansywne U1: pojedynczo rdest
//    ptasi, wiechlina roczna, mniszek; zniszczenia U1: ślady wydeptywania; reszta FV; powierzchnia FV i perspektywy U1 bez
//    zmian od 2016 r.; struktura i ocena ogólna U1 – Ostrzyca stok zachodni to jedno z 3 stanowisk U1 w 2024 r.);
//  • gatunki charakterystyczne – zestaw, który sprawozdania wymieniają dla większości stanowisk FV; pokrycia orientacyjne
//    („pojedynczo” = 0,5%, kostrzewa blada „zwykle ok. 20%”);
//  • oddziaływania – kody ze sprawozdania 2016 dla tego stanowiska (słownik 2011);
//  • data, współrzędne (ucięte do minut) i wykonawca umowne („Jan Kowalski”); zdjęcia fitosocjologiczne puste – sprawozdania
//    ich nie publikują.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues, emptyReleve } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology6190 } from './methodology'

const COORD = 'N 51°03′; E 15°49′'
const NO_RELEVE = 'Przykład poglądowy – sprawozdania z monitoringu nie publikują zdjęć fitosocjologicznych.'

export const ostrzycaZachod: CardValues = {
  ...emptyCardValues(methodology6190),
  site: {
    siteName: 'Ostrzyca stok zachodni',
    guid: '',
    siteType: 'badawcze',
    communities: 'Asplenio septentrionalis-Festucion pallentis',
    description:
      'Murawy z kostrzewą bladą na bazaltowych skałach i rumowiskach zachodniego stoku Ostrzycy Proboszczowickiej, w rezerwacie przyrody. Płaty przy szlaku turystycznym na szczyt – widoczne ślady wydeptywania, pojedynczo gatunki synantropijne.',
    areaHa: 'ok. 0,02 ha',
    protectedAreas: 'PLH020042 Ostrzyca Proboszczowicka; rezerwat przyrody Ostrzyca Proboszczowicka',
    manager: 'Skarb Państwa',
    coords: COORD,
    transect: 'Płaty na skałach wzdłuż stoku',
    altitude: '450–500',
    date: '2024-07-01',
    observer: 'Jan Kowalski',
    additionalExperts: '',
  },
  releves: [0, 1, 2].map(() => ({ ...emptyReleve(methodology6190), remarks: NO_RELEVE })),
  indicators: {
    area: {
      inputs: { choice: 'stable', areaText: '', note: 'Powierzchnia stabilna – cała dostępna powierzchnia skał zajęta przez murawy z kostrzewą bladą' },
      value: 'Powierzchnia stabilna – cała dostępna powierzchnia skał zajęta przez murawy z kostrzewą bladą',
      grade: 'FV',
    },
    characteristic: {
      inputs: {
        species: [
          { name: 'Festuca pallens', cover: 20 },
          { name: 'Asplenium septentrionale', cover: 0.5 },
          { name: 'Sedum maximum', cover: 0.5 },
          { name: 'Potentilla argentea', cover: 0.5 },
          { name: 'Acinos arvensis', cover: 0.5 },
        ],
        count: undefined,
        none: '',
        note: '',
      },
      value: 'Festuca pallens 20%, Asplenium septentrionale <1%, Sedum maximum <1%, Potentilla argentea <1%, Acinos arvensis <1%',
      grade: 'FV',
    },
    dominant: {
      inputs: { species: [{ name: 'Festuca pallens', cover: 20 }], choice: '', note: '' },
      value: 'Festuca pallens 20%',
      grade: 'FV',
    },
    aliens: { inputs: { species: [], cover: undefined, none: 'yes', note: '' }, value: 'Brak', grade: 'FV' },
    expansive: {
      inputs: {
        species: [
          { name: 'Polygonum aviculare', cover: 0.5 },
          { name: 'Poa annua', cover: 0.5 },
          { name: 'Taraxacum officinale', cover: 0.5 },
        ],
        cover: undefined,
        none: '',
        note: 'Pojedynczo rdest ptasi Polygonum aviculare, wiechlina roczna Poa annua, mniszek lekarski Taraxacum officinale',
      },
      value: 'Pojedynczo rdest ptasi Polygonum aviculare, wiechlina roczna Poa annua, mniszek lekarski Taraxacum officinale',
      grade: 'U1',
    },
    shrubs: { inputs: { species: [], cover: undefined, none: 'yes', note: '' }, value: 'Brak', grade: 'FV' },
    shade: { inputs: { value: '0', note: 'Brak ocienienia' }, value: 'Brak ocienienia', grade: 'FV' },
    damage: {
      inputs: { kind: 'human', cover: undefined, note: 'Ślady wydeptywania przy szlaku: niski wzrost, połamane rośliny, zgniecione kępy kostrzewy bladej' },
      value: 'Ślady wydeptywania przy szlaku: niski wzrost, połamane rośliny, zgniecione kępy kostrzewy bladej',
      grade: 'U1',
    },
  },
  prospects: {
    value: 'Położenie w rezerwacie chroni przed innymi zagrożeniami, ale brak działań ograniczających wydeptywanie przy szlaku i punkcie widokowym.',
    grade: 'U1',
  },
  impacts: [
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych', influence: '-', intensity: 'M', description: 'Szlak turystyczny na szczyt Ostrzycy.' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie', influence: '-', intensity: 'M', description: 'Ruch turystyczny poza szlakiem, wydeptywanie płatów.' },
    { code: 'H04.02', name: 'Wnoszenie azotu', influence: '-', intensity: 'L', description: 'W płatach pojawiają się gatunki azotolubne – najprawdopodobniej azot atmosferyczny.' },
    { code: 'M01.01', name: 'Zmiana temperatury (np. wzrost temperatury i temperatur skrajnych)', influence: '-', intensity: 'L', description: 'Ocieplenie klimatu; skala wpływu nieznana.' },
  ],
  threats: [
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie', description: 'Dalsze wydeptywanie płatów przy szlaku i punkcie widokowym.' },
    { code: 'M01.02', name: 'Susze i zmniejszenie opadów', description: 'Suche i gorące lata osłabiają naskalne gatunki.' },
  ],
  other: {
    otherValues: 'Nie pozyskano danych.',
    conservation: 'Nie – ochrona bierna w rezerwacie.',
    proposals: 'Ograniczyć wydeptywanie: tablice informacyjne o wartościach przyrodniczych siedliska, zagrodzenie wstępu na połogie partie skalne (np. barierami).',
    notes:
      'PRZYKŁAD POGLĄDOWY złożony z opisu stanowiska w sprawozdaniach z monitoringu 2016 i 2024 – nie jest kartą z terenu. Data, współrzędne, pokrycia i wykonawca umowne. Rok: 2024 (badania 12.06–26.07.2024).',
    photos: [],
  },
  overallComment: 'Struktura U1 przez kardynalny wskaźnik gatunków ekspansywnych (pojedyncze gatunki synantropijne) i wydeptywanie; perspektywy U1 – presja turystyczna bez działań ochronnych.',
}

export const examples6190: CardExample[] = [{ id: 'ostrzyca-zachod', label: 'Ostrzyca stok zachodni (poglądowy)', values: ostrzycaZachod }]
