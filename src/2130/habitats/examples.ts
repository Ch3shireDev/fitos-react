// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Braun 2010, rozdz. 2130, pkt 3 „Przykład wypełnionej karty
// obserwacji”): Przebrno/Siekierki, Mierzeja Wiślana, 2008. Koordynator zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („N 54°22′…; E 19°22′…”) – przepisane do minut, jedne dla
//    całego transektu i wszystkich zdjęć;
//  • kontrola dwudniowa (2.07.2008 i 25.08.2008): data = pierwszy dzień, drugi w uwagach;
//  • zdjęcia fitosocjologiczne: 3 × 25 m², nachylenie 10°, ekspozycja NWW, zwarcie i wysokość warstw jak w karcie,
//    rośliny zielne (z siewkami sosny i dębu „(c)”) w warstwie C, „mszaki i porosty” w D;
//  • wartości wskaźników przepisane z karty; pokrycia gatunków jak w karcie („do 5%” → 5, „<1%” → 0,5);
//    pokrycie warstwy porostowo-mszystej na transekcie (karta go nie podaje) – 75%, najniższe ze zdjęć (75–80%);
//  • wszystkie oceny jak w karcie (FV). Gatunki nitrofilne i nalot drzew wg tab. 2 wychodzą U2 – formularz to
//    podpowiada, ale ocena z karty zostaje (patrz specyfikacja);
//  • działalność człowieka: stare kody 161 (zalesianie) → B01, 720 (wydeptywanie) → G05.01; intensywność A → H,
//    C → L; wpływ (w karcie pusty) → „–”. Zagrożenie „Niewłaściwe zabiegi utrwalające wydmy” → G05.07;
//  • pozycje karty bez osobnego pola (typ stanowiska, zarządzający, obszar, rok, koordynator, monitoring wymagany,
//    udział FV/U1/U2) – w uwagach.
import type { CardValues, Layer, ReleveSpeciesRow } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology2130 } from './methodology'

const COORD = 'N 54°22′; E 19°22′'

type Row = [name: string, abundance: ReleveSpeciesRow['abundance'], layer?: Layer]

const releve = (cover: { c: number; d: number }, heightC: number, rows: Row[]) => ({
  coords: COORD,
  altitude: undefined,
  area: 25,
  slope: 10,
  exposure: 'NWW',
  coverA: 0,
  coverB: 0,
  coverC: cover.c,
  coverD: cover.d,
  heightA: 0,
  heightB: 0,
  heightC,
  heightD: 10,
  unit: 'Helichryso-Jasionetum litoralis',
  species: rows.map(([name, abundance, layer = 'C']) => ({ layer, name, abundance })),
})

const sp = (rows: [string, number][]) => rows.map(([name, cover]) => ({ name, cover }))

export const przebrno: CardValues = {
  ...emptyCardValues(methodology2130),
  site: {
    siteName: 'Przebrno/Siekierki',
    guid: '',
    communities: 'Elymo-Ammophiletum arenariae, Helichryso-Jasionetum litoralis, nasadzenie sosny zbliżone do Empetro nigri-Pinetum',
    description: 'Drugi wał wydmowy o wysokości do około 10 m',
    areaHa: 0.2,
    protectedAreas: 'Park Krajobrazowy „Mierzeja Wiślana”; PLH280007 Zalew Wiślany i Mierzeja Wiślana; Pas techniczny Urzędu Morskiego w Gdyni',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '10x200 m',
    altitude: '5–10',
    date: '2008-07-02',
    observer: 'Jan Kowalski',
  },
  releves: [
    releve({ c: 50, d: 75 }, 30, [
      ['Aira praecox', '+'],
      ['Artemisia campestris subsp. sericea', '1'],
      ['Cardaminopsis arenosa', '1'],
      ['Corynephorus canescens', '2'],
      ['Deschampsia flexuosa', '+'],
      ['Festuca ovina', '+'],
      ['Festuca polesica', '+'],
      ['Festuca rubra subsp. litoralis', '+'],
      ['Hieracium umbellatum var. linariifolium', '+'],
      ['Jasione montana var. litoralis', '2'],
      ['Lathyrus japonicus subsp. maritimus', '2'],
      ['Pinus sylvestris', '+'],
      ['Polypodium vulgare', '1'],
      ['Rumex tenuifolius', '1'],
      ['Vicia hirsuta', '+'],
      ['Brachythecium albicans', '3', 'D'],
      ['Ceratodon purpureus', '2', 'D'],
      ['Cladonia furcata', '2', 'D'],
      ['Cladonia pyxidata', '1', 'D'],
      ['Cladonia rangiformis', '+', 'D'],
      ['Coelocaulon aculeatum', '+', 'D'],
      ['Dicranum scoparium', '2', 'D'],
      ['Hypnum cupressiforme var. ericetorum', '2', 'D'],
      ['Hypogymnia physodes', '+', 'D'],
      ['Peltigera rufescens', '+', 'D'],
      ['Pleurozium schreberi', '1', 'D'],
      ['Pseudoscleropodium purum', '2', 'D'],
    ]),
    releve({ c: 50, d: 75 }, 40, [
      ['Aira praecox', '+'],
      ['Artemisia campestris subsp. sericea', '1'],
      ['Cardaminopsis arenosa', '1'],
      ['Corynephorus canescens', '2'],
      ['Festuca ovina', '1'],
      ['Festuca polesica', '1'],
      ['Festuca rubra subsp. litoralis', '+'],
      ['Hieracium umbellatum var. linariifolium', '+'],
      ['Jasione montana var. litoralis', '2'],
      ['Lathyrus japonicus subsp. maritimus', '2'],
      ['Sedum acre', '+'],
      ['Brachythecium albicans', '2', 'D'],
      ['Ceratodon purpureus', '1', 'D'],
      ['Cladonia fimbriata', '+', 'D'],
      ['Cladonia furcata', '1', 'D'],
      ['Cladonia pyxidata', '2', 'D'],
      ['Cladonia rangiformis', '1', 'D'],
      ['Dicranum scoparium', '2', 'D'],
      ['Hypnum cupressiforme var. ericetorum', '1', 'D'],
      ['Peltigera rufescens', '2', 'D'],
      ['Plagiomnium affine', '1', 'D'],
      ['Pleurozium schreberi', '1', 'D'],
      ['Pseudoscleropodium purum', '3', 'D'],
    ]),
    releve({ c: 60, d: 80 }, 40, [
      ['Ammophila arenaria', '1'],
      ['Artemisia campestris subsp. sericea', '1'],
      ['Calamagrostis epigejos', '+'],
      ['Cardaminopsis arenosa', '1'],
      ['Cerastium semidecandrum', '+'],
      ['Corynephorus canescens', '3'],
      ['Festuca ovina', '1'],
      ['Festuca polesica', '+'],
      ['Hieracium umbellatum var. linariifolium', '+'],
      ['Jasione montana var. litoralis', '3'],
      ['Lathyrus japonicus subsp. maritimus', '2'],
      ['Quercus robur', '+'],
      ['Polypodium vulgare', '1'],
      ['Brachythecium albicans', '2', 'D'],
      ['Ceratodon purpureus', '1', 'D'],
      ['Cladonia fimbriata', '1', 'D'],
      ['Cladonia pyxidata', '1', 'D'],
      ['Cladonia rangiformis', '1', 'D'],
      ['Dicranum scoparium', '2', 'D'],
      ['Hypnum cupressiforme var. ericetorum', '1', 'D'],
      ['Hypogymnia physodes', '+', 'D'],
      ['Peltigera rufescens', '2', 'D'],
      ['Pleurozium schreberi', '2', 'D'],
      ['Pseudoscleropodium purum', '2', 'D'],
    ]),
  ],
  indicators: {
    area: { inputs: { choice: 'stable', areaHa: 0.2, note: 'blisko 0,2 ha' }, value: 'blisko 0,2 ha', grade: 'FV' },
    flora: {
      inputs: {
        species: sp([
          ['Artemisia campestris subsp. sericea', 20],
          ['Jasione montana', 50],
          ['Hieracium umbellatum var. linariifolium', 30],
        ]),
        cryptoCover: 75,
        choice: '',
      },
      value:
        'Bylica polna nadmorska Artemisia campestris subsp. sericea 20%, jasieniec piaskowy Jasione montana 50%, jastrzębiec baldaszkowaty nadmorski Hieracium umbellatum var. linariifolium 30%',
      grade: 'FV',
    },
    dominant: {
      inputs: {
        species: sp([
          ['Lathyrus japonicus subsp. maritimus', 40],
          ['Jasione montana', 50],
          ['Brachythecium albicans', 50],
          ['Peltigera rufescens', 50],
          ['Corynephorus canescens', 60],
        ]),
        choice: 'turf',
      },
      value:
        'Groszek nadmorski Lathyrus japonicus subsp. maritimus 40%, jasieniec piaskowy Jasione montana 50%, krótkosz bielejący Brachythecium albicans (d) 50%, pawężnica Peltigera rufescens (d) 50%, szczotlicha siwa Corynephorus canescens 60%',
      grade: 'FV',
    },
    aliens: { inputs: { species: [], choice: 'none' }, value: 'Brak', grade: 'FV' },
    expansive: { inputs: { species: [], choice: 'none' }, value: 'Brak', grade: 'FV' },
    nitrophilous: {
      inputs: {
        species: sp([
          ['Cardaminopsis arenosa', 10],
          ['Rumex tenuifolius', 5],
        ]),
        choice: '',
      },
      value: 'Rzeżusznik piaskowy Cardaminopsis arenosa 10%, szczaw wąskolistny Rumex tenuifolius do 5%',
      grade: 'FV',
    },
    trees: {
      inputs: {
        species: sp([
          ['Betula pendula', 0.5],
          ['Quercus robur', 0.5],
          ['Pinus sylvestris', 5],
        ]),
        choice: '',
      },
      value: 'Brzoza brodawkowata Betula pendula <1%, dąb szypułkowy Quercus robur <1%, sosna zwyczajna Pinus sylvestris do 5%',
      grade: 'FV',
    },
    shrubs: { inputs: { species: [], choice: 'none' }, value: 'Brak', grade: 'FV' },
    eolian: { inputs: { choice: 'slight', percent: 100, note: 'Nieznaczne nawiewanie piasku' }, value: 'Nieznaczne nawiewanie piasku (100%)', grade: 'FV' },
    abrasion: { inputs: { choice: 'none', percent: 0, note: '' }, value: 'Brak', grade: 'FV' },
    damage: { inputs: { choice: 'none', percent: 0, note: 'Nie stwierdzono' }, value: 'Nie stwierdzono', grade: 'FV' },
  },
  prospects: { value: 'Dobre, pod warunkiem zaniechania nasadzeń ochronnych', grade: 'FV' },
  impacts: [
    { code: 'B01', name: 'Zalesianie terenów otwartych', influence: '-', intensity: 'H', description: 'Nasadzenia sosny i róży pomarszczonej' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie', influence: '-', intensity: 'L', description: 'Penetracja terenu przez turystów i grzybiarzy' },
  ],
  threats: [
    { code: 'G05.07', name: 'Niewłaściwie realizowane działania ochronne lub ich brak', description: 'Niewłaściwe zabiegi utrwalające wydmy' },
  ],
  other: {
    otherValues: 'Liczna populacja kostrzewy poleskiej Festuca polesica',
    conservation:
      'Wykonywane zabiegi ochronne: nasadzenia ochronne (w tym również gatunków obcych) w celu utrwalania wydm. Propozycje: zaniechanie nasadzeń ochronnych gatunków obcych; egzekwowanie zakazu wstępu na wydmę; uprzątnięcie śmieci.',
    notes:
      'Typ stanowiska: badawcze. Zarządzający terenem: Urząd Morski w Gdyni. Nazwa obszaru: Zalew Wiślany i Mierzeja Wiślana. Rok: 2008, typ monitoringu: szczegółowy. Data kontroli: 2.07.2008 i 25.08.2008. Monitoring jest wymagany: nie – niewielka presja turystyczna. Udział powierzchni siedliska: FV 75%, U1 20%, U2 5%.',
    photos: [],
  },
  overallComment: '',
}

export const examples2130: CardExample[] = [{ id: 'przebrno', label: 'Przebrno/Siekierki', values: przebrno }]
