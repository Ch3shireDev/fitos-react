// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Braun 2010, rozdz. 2140, pkt 3 „Przykład wypełnionej
// karty obserwacji”): Czołpino, 7.08.2008. Koordynator zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („N 54°44′; E 17°17′”) – przepisane do minut;
//  • zdjęcia: I i III 3×3 m (9 m²), II 5×5 m (25 m²); nachylenie I i II „<5°” nie mieści się w polu liczbowym –
//    zostało puste, wartość w uwagach; zwarcia C/D jak w karcie; „Cladonia cocifera” to literówka (C. coccifera);
//  • wartości wskaźników przepisane z karty jako opisy (karta nie podaje pokrycia warstwy mszysto-porostowej);
//  • wszystkie wskaźniki FV, struktura FV, perspektywy FV, ocena ogólna FV – jak w karcie;
//  • „Działalność człowieka” w karcie nie ma kodu, tylko opis „Ochrona ścisła w SPN” – trafia do uwag;
//    „Zagrożenia: aktualnie brak, w perspektywie sukcesja do boru bażynowego” – jako K02.01 (kod dopisany).
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology2140 } from './methodology'

const COORD = 'N 54°44′; E 17°17′'
const UNIT = 'Carici arenariae-Empetretum nigri'

type Row = [layer: 'C' | 'D', name: string, abundance: string]
const releve = (o: { area: number; slope?: number; coverC: number; coverD: number }, species: Row[]) => ({
  coords: COORD,
  altitude: undefined,
  area: o.area,
  slope: o.slope,
  exposure: 'N',
  coverB: undefined,
  coverC: o.coverC,
  coverD: o.coverD,
  heightB: undefined,
  heightC: undefined,
  heightD: undefined,
  unit: UNIT,
  species: species.map(([layer, name, abundance]) => ({ layer, name, abundance })),
})

export const czolpino: CardValues = {
  ...emptyCardValues(methodology2140),
  site: {
    siteName: 'Czołpino',
    guid: '',
    subtype: '2140-1',
    communities: 'Carici arenariae-Empetretum nigri, Helichryso-Jasionetum litoralis',
    description:
      'Zbiorowisko rozmieszczone jest w nieregularnych płatach po kilkadziesiąt m² na stokach wydm tzw. szarej i brunatnej o ekspozycji północnej o nachyleniu do 15°. W płatach dominuje bażyna czarna.',
    areaM2: 100,
    protectedAreas: 'Obszar Natura 2000 – Ostoja Słowińska, Słowiński Park Narodowy',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: 'Zbiorowisko małopowierzchniowe, transekt – prostokąt o długości 200 m i szerokości do 10 m, płaty zbiorowiska rozmieszczone nierównomiernie',
    altitude: '4–10',
    date: '2008-08-07',
    observer: 'Jan Kowalski',
  },
  releves: [
    releve({ area: 9, coverC: 50, coverD: 40 }, [
      ['C', 'Deschampsia flexuosa', '1'],
      ['C', 'Empetrum nigrum', '3'],
      ['C', 'Festuca rubra', '+'],
      ['C', 'Hieracium umbellatum var. dunense', '+'],
      ['C', 'Jasione montana', '+'],
      ['D', 'Cladonia coccifera', '+'],
      ['D', 'Cladonia fimbriata', '+'],
      ['D', 'Cladonia scabriuscula', '+'],
      ['D', 'Cladonia subulata', '+'],
      ['D', 'Dicranum scoparium', '2'],
      ['D', 'Hypogymnia physodes', '1'],
      ['D', 'Peltigera sp.', '1'],
      ['D', 'Pleurozium schreberi', '+'],
    ]),
    releve({ area: 25, coverC: 20, coverD: 80 }, [
      ['C', 'Calluna vulgaris', '1'],
      ['C', 'Empetrum nigrum', '2'],
      ['C', 'Hieracium umbellatum var. dunense', '+'],
      ['D', 'Cladonia coccifera', '+'],
      ['D', 'Cladonia cornuta', '+'],
      ['D', 'Cladonia furcata', '+'],
      ['D', 'Cladonia sylvatica', '+'],
      ['D', 'Dicranum scoparium', '4'],
      ['D', 'Hypogymnia physodes', '1'],
    ]),
    releve({ area: 9, slope: 10, coverC: 100, coverD: 40 }, [
      ['C', 'Calluna vulgaris', '5'],
      ['C', 'Deschampsia flexuosa', '1'],
      ['C', 'Empetrum nigrum', '1'],
      ['D', 'Cladonia fimbriata', '+'],
      ['D', 'Cladonia scabriuscula', '+'],
      ['D', 'Dicranum undulatum', '3'],
      ['D', 'Peltigera polydactyla', '+'],
      ['D', 'Peltigera rufescens', '+'],
    ]),
  ],
  indicators: {
    area: {
      inputs: { choice: 'stable', areaM2: undefined, note: 'Powierzchnia badanego siedliska na stanowisku wynosi około 100 m²' },
      value: 'Powierzchnia badanego siedliska na stanowisku wynosi około 100 m²',
      grade: 'FV',
    },
    combination: {
      inputs: {
        species: [
          { name: 'Calluna vulgaris', cover: 2 },
          { name: 'Empetrum nigrum', cover: 4 },
          { name: 'Dicranum scoparium', cover: 2 },
          { name: 'Dicranum undulatum', cover: 1 },
        ],
        mossCover: undefined,
        choice: 'full',
        note: 'Wrzos zwyczajny Calluna vulgaris 2%, bażyna czarna Empetrum nigrum 4%, widłoząb miotlasty Dicranum scoparium 2%, widłoząb kędzierzawy Dicranum undulatum 1%',
      },
      value: 'Wrzos zwyczajny Calluna vulgaris 2%, bażyna czarna Empetrum nigrum 4%, widłoząb miotlasty Dicranum scoparium 2%, widłoząb kędzierzawy Dicranum undulatum 1%',
      grade: 'FV',
    },
    aliens: { inputs: { species: [], choice: 'none' }, value: 'Brak', grade: 'FV' },
    expansive: { inputs: { species: [], choice: 'none' }, value: 'Brak', grade: 'FV' },
    nitrophilous: { inputs: { species: [], choice: 'none' }, value: 'Brak', grade: 'FV' },
    vitality: {
      inputs: {
        callunaCover: 2,
        empetrumCover: 4,
        leaflessPct: undefined,
        choice: 'good',
        buried: '',
        note: 'Żywotność bardzo dobra i dobra, bujny wzrost, osobniki kwitnące i owocujące',
      },
      value: 'Powierzchnia pokrycia w transekcie: wrzos zwyczajny Calluna vulgaris 2%, bażyna czarna Empetrum nigrum 4%. Żywotność bardzo dobra i dobra, bujny wzrost, osobniki kwitnące i owocujące',
      grade: 'FV',
    },
    abrasion: { inputs: { choice: 'accumulative', note: 'Brak' }, value: 'Brak', grade: 'FV' },
    trees: {
      inputs: {
        species: [{ name: 'Pinus sylvestris' }],
        cover: undefined,
        choice: 'none',
        note: 'Sosna zwyczajna Pinus sylvestris, pojedyncze siewki w transekcie',
      },
      value: 'Sosna zwyczajna Pinus sylvestris, pojedyncze siewki w transekcie',
      grade: 'FV',
    },
    damage: { inputs: { choice: 'none', note: '' }, value: 'Brak', grade: 'FV' },
  },
  prospects: { value: 'Stanowisko znajduje się w obszarze ochrony ścisłej SPN; brak zagrożeń', grade: 'FV' },
  impacts: [],
  threats: [{ code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)', description: 'Aktualnie brak, w perspektywie sukcesja do boru bażynowego.' }],
  other: {
    otherValues: 'Stanowisko znajduje się w obszarze ochrony ścisłej SPN.',
    conservation: 'Wykonywane zabiegi ochronne: stanowisko znajduje się w obszarze ochrony ścisłej SPN. Propozycje: brak.',
    notes:
      'Typ stanowiska: referencyjne. Zarządzający terenem: Słowiński Park Narodowy, Urząd Morski w Słupsku. Nazwa obszaru N2000: PLH220023 Ostoja Słowińska. Rok: 2008, typ monitoringu: szczegółowy. Monitoring jest wymagany: tak – jako stanowisko referencyjne, faza terminalna rozwoju wrzosowiska, co 5 lat. Działalność człowieka: ochrona ścisła w Słowińskim Parku Narodowym. Nachylenie zdjęć I i II: <5°. Udział powierzchni w stanie FV: 100%, U1: 0%, U2: 0%.',
    photos: [],
  },
  overallComment: '',
}

export const examples2140: CardExample[] = [{ id: 'czolpino', label: 'Czołpino', values: czolpino }]
