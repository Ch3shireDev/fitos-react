// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Mróz, Bąba 2010, rozdz. 6210, pkt 3 „Przykład wypełnionej
// karty obserwacji”): Radomice (Ostoja nad Bobrem), 26.07.2008, podtyp 6210-3. Koordynator zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („N 50°29′ …; E 15°37′ …”) – przepisane do minut;
//  • literówka „Agronomia eupatoria” (zdjęcie II) poprawiona na Agrimonia eupatoria;
//  • krzewy i podrost (Crataegus, Prunus spinosa, Pyrus communis, Rosa canina) w zdjęciach bez warstwy – wpisane do B,
//    zwarcie B niepodane (karta podaje tylko warstwę C);
//  • gatunki charakterystyczne: karta wymienia 5 gatunków i daje FV (tab. 2 z 2010 r.: ≥5). Po modyfikacji 2022 (≥6)
//    formularz podpowiada U1 – ocena eksperta zostaje, rozjazd widać w karcie. Ze zdjęć wychodzi 6 (doszedłby biedrzeniec
//    mniejszy Pimpinella saxifraga) – czyli FV i po nowemu;
//  • wiersz „Udział procentowy siedliska na transekcie” (100%, FV) – spoza tab. 2, przeniesiony do uwag;
//  • „Zagrożenia” (tekst) → A04.03, K02, I01; działalność człowieka: stary kod 141 Zarzucenie pasterstwa → A04.03,
//    intensywność A → H; kolumna „wpływ” w karcie pusta – wpisano „-”, stary kod w opisie.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology6210 } from './methodology'
import { findSpecies6210, defaultLayer6210 } from './species'

const COORD = 'N 50°29′; E 15°37′'

type Row = [name: string, abundance: string]
/** „Agrimonia eupatoria +, Arrhenatherum elatius +, …” → wiersze; warstwa z katalogu (krzewy B, reszta C). */
const list = (spec: string): Row[] =>
  spec.split(', ').map((s) => {
    const i = s.lastIndexOf(' ')
    return [s.slice(0, i), s.slice(i + 1)]
  })
const releve = (o: { altitude: number; coverC: number }, rows: Row[]) => ({
  coords: COORD,
  area: 25,
  slope: 5,
  exposure: 'S',
  coverB: undefined,
  coverD: undefined,
  heightB: undefined,
  heightC: 60,
  heightD: undefined,
  unit: 'Scabioso ochroleucae-Brachypodietum pinnati (wymaga dalszych badań syntaksonomicznych)',
  ...o,
  species: rows.map(([name, abundance]) => {
    const s = findSpecies6210(name)
    return { layer: s ? defaultLayer6210(s) : 'C', name, abundance }
  }),
})

const T = {
  area: 'Szacunkowa powierzchnia całkowita siedliska w obszarze to około 2 ha; ocenie zostało poddane 0,2 ha (jedno stanowisko siedliska). Powierzchnia siedliska na stanowisku ma tendencję do zmniejszania się wskutek zwiększającego się pokrycia drzew i krzewów. Tempo zmian nie jest jednak zbyt duże. Obecnie zwarcie krzewów wynosi około 10% i nadal na stanowisku obecne są gatunki charakterystyczne oraz rzadkie i chronione.',
  species:
    'Chaber driakiewnik Centaurea scabiosa 25%, kłosownica pierzasta Brachypodium pinnatum 15%, turzyca sina Carex flacca 5%, dziewięćsił bezłodygowy Carlina acaulis 5%, goryczka krzyżowa Gentiana cruciata 5%',
  aliens: 'Nawłoć kanadyjska Solidago canadensis 3%',
  expansive: 'Rajgras wyniosły Arrhenatherum elatius 3%',
  shrubs: 'Zwarcie warstwy krzewów 10%; Pyrus communis poniżej 2%, Rosa canina 5%, Prunus spinosa 2%, Crataegus monogyna 2%',
  orchids: '2 gatunki: Listera ovata, Epipactis helleborine',
  ecotone: 'Strefa ekotonowa słabo rozwinięta utworzona głównie z Prunus spinosa (b)',
}

export const radomice: CardValues = {
  ...emptyCardValues(methodology6210),
  site: {
    subtype: '6210-3',
    siteName: 'Radomice',
    guid: '',
    siteType: 'badawcze',
    communities: 'Prawdopodobnie All. Cirsio-Brachypodion pinnati, Ass. Scabioso ochroleucae-Brachypodietum pinnati. Siedlisko wymaga dokładniejszych badań syntaksonomicznych',
    description:
      'Murawa kserotermiczna porasta stok o wystawie południowej w sąsiedztwie nieczynnego już kamieniołomu wapienia w Radomicach. Siedlisko występuje tu w kompleksie z innym siedliskiem 6510.',
    areaHa: 2,
    protectedAreas: 'Park Krajobrazowy Doliny Bobru; Natura 2000 SOO Ostoja nad Bobrem',
    manager:
      'Lasy i Dolina Bobru są własnością Skarbu Państwa. Dolnośląski Zespół Parków Krajobrazowych we Wrocławiu, Lasy w zarządzie Regionalnej Dyrekcji Lasów Państwowych we Wrocławiu (Nadleśnictwo Lwówek Śląski), Regionalny Zarząd Gospodarki Wodnej we Wrocławiu',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '20x100 m',
    altitude: '415–420',
    date: '2008-07-26',
    observer: 'Jan Kowalski',
    additionalExperts: '',
  },
  releves: [
    releve(
      { altitude: 417, coverC: 100 },
      list(
        'Agrimonia eupatoria +, Arrhenatherum elatius +, Brachypodium pinnatum 1, Briza media +, Carex flacca 1, Carlina acaulis +, Centaurea jacea +, Centaurea scabiosa 3, Clinopodium vulgare 1, Coronilla varia +, Crataegus monogyna +, Dactylis glomerata +, Festuca rubra 2, Fragaria vesca 1, Galium mollugo 1, Hypericum perforatum +, Knautia arvensis +, Lathyrus pratensis 1, Pimpinella saxifraga +, Poa pratensis 1',
      ),
    ),
    releve(
      { altitude: 417, coverC: 95 },
      list(
        'Agrimonia eupatoria +, Anthoxanthum odoratum +, Arrhenatherum elatius 1, Brachypodium pinnatum 1, Briza media +, Campanula rotundifolia +, Carex flacca +, Carlina acaulis +, Centaurea jacea +, Centaurea scabiosa 2, Clinopodium vulgare 1, Coronilla varia +, Crataegus monogyna +, Dactylis glomerata +, Festuca ovina +, Galium mollugo 1, Gentiana cruciata 2, Hypericum perforatum +, Knautia arvensis +, Lathyrus pratensis +, Pimpinella saxifraga 1, Poa pratensis 2, Prunus spinosa +, Pyrus communis +, Rosa canina 1, Solidago canadensis +, Vicia cracca +',
      ),
    ),
    releve(
      { altitude: 415, coverC: 100 },
      list(
        'Achillea millefolium +, Agrimonia eupatoria 1, Artemisia vulgaris +, Brachypodium pinnatum 2, Briza media 1, Carex flacca +, Carlina acaulis +, Centaurea jacea +, Centaurea scabiosa 3, Clinopodium vulgare 1, Coronilla varia +, Dactylis glomerata +, Galium mollugo +, Hypericum perforatum +, Pimpinella saxifraga +, Poa pratensis 2, Rosa canina +, Silene vulgaris +, Solidago canadensis +, Viola hirta +',
      ),
    ),
  ],
  indicators: {
    area: { inputs: { choice: 'other', areaHa: undefined, note: T.area }, value: T.area, grade: 'U1' },
    species: {
      inputs: {
        species: [
          { name: 'Centaurea scabiosa', cover: 25 },
          { name: 'Brachypodium pinnatum', cover: 15 },
          { name: 'Carex flacca', cover: 5 },
          { name: 'Carlina acaulis', cover: 5 },
          { name: 'Gentiana cruciata', cover: 5 },
        ],
        count: undefined,
        none: '',
        note: T.species,
      },
      value: T.species,
      grade: 'FV',
    },
    aliens: {
      inputs: { species: [{ name: 'Solidago canadensis', cover: 3 }], count: undefined, total: undefined, none: '', note: T.aliens },
      value: T.aliens,
      grade: 'U1',
    },
    expansive: {
      inputs: { species: [{ name: 'Arrhenatherum elatius', cover: 3 }], count: undefined, occurrence: 'scattered', maxAbundance: '1', none: '', note: T.expansive },
      value: T.expansive,
      grade: 'U1',
    },
    shrubs: {
      inputs: {
        value: 10,
        species: [
          { name: 'Pyrus communis', cover: 1 },
          { name: 'Rosa canina', cover: 5 },
          { name: 'Prunus spinosa', cover: 2 },
          { name: 'Crataegus monogyna', cover: 2 },
        ],
        note: T.shrubs,
      },
      value: T.shrubs,
      grade: 'U1',
    },
    orchids: {
      inputs: { species: [{ name: 'Listera ovata' }, { name: 'Epipactis helleborine' }], count: undefined, none: '', status: '', note: T.orchids },
      value: T.orchids,
      grade: 'U1',
    },
    ecotone: { inputs: { choice: 'noGradual', note: T.ecotone }, value: T.ecotone, grade: 'U1' },
  },
  prospects: {
    value: 'Perspektywy ochrony siedliska są bardzo dobre pod warunkiem wprowadzenia odpowiednich zabiegów (ekstensywny wypas, usunięcie nalotu krzewów)',
    grade: 'FV',
  },
  impacts: [
    {
      code: 'A04.03',
      name: 'Zarzucenie pasterstwa, brak wypasu',
      influence: '-',
      intensity: 'H',
      description:
        'Na badanym stanowisku siedliska nie stosuje się ekstensywnego wypasu, utrzymującego prawidłową strukturę siedliska. (Kod w karcie z 2008 r.: 141 Zarzucenie pasterstwa, intensywność A; wpływ w karcie niepodany.)',
    },
  ],
  threats: [
    {
      code: 'A04.03',
      name: 'Zarzucenie pasterstwa, brak wypasu',
      description: 'Głównym zagrożeniem dla siedliska jest zarzucenie tradycyjnych metod gospodarowania, tj. wypasu, ewentualnie koszenia.',
    },
    {
      code: 'K02',
      name: 'Ewolucja biocenotyczna, sukcesja',
      description: 'Skutkiem zarzucenia użytkowania jest obecność gatunków krzewów (róże, głogi, śliwa tarnina).',
    },
    {
      code: 'I01',
      name: 'Obce gatunki inwazyjne',
      description: 'Obecność gatunków inwazyjnych (nawłoć kanadyjska).',
    },
  ],
  other: {
    otherValues:
      'Siedlisko wykształciło się wyłącznie na jedynym stanowisku. Jest ono miejscem występowania kilku gatunków chronionych: Gentiana cruciata (VU), Gentiana ciliata, Carlina acaulis (LR), Listera ovata',
    conservation: 'Siedlisko chronione w granicach PK Doliny Bobru; nie są obserwowane żadne znaczące działania ochronne',
    proposals:
      'Objęcie stanowiska siedliska ochroną czynną, która zahamuje procesy sukcesji wtórnej; najbardziej wskazany byłby w tym miejscu ekstensywny wypas oraz usunięcie nalotu krzewów (zwłaszcza tarniny)',
    shareFV: 85,
    shareU1: 15,
    shareU2: 0,
    notes:
      'Rok: 2008. Typ monitoringu: zintegrowany. Nazwa obszaru: Ostoja nad Bobrem. Monitoring jest wymagany: tak – jedyny płat siedliska na terenie Ostoi nad Bobrem; w płacie widoczne zaburzenia struktury (udział gatunków inwazyjnych, podrost krzewów). Udział procentowy siedliska na transekcie (wiersz karty spoza tab. 2): siedlisko zajmuje 100% powierzchni monitoringowej – FV. Transekt w karcie: powierzchnia prostokątna 20×100 m. Udział U2 w karcie: „–”.',
    photos: [],
  },
  overallComment: '',
}

export const examples6210: CardExample[] = [{ id: 'radomice', label: 'Radomice', values: radomice }]
