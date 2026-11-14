// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Perzanowska 2012, rozdz. 3230, pkt 3 „Przykład wypełnionej
// karty obserwacji”): Białka 03, Dolina Białki, 27.09.2009. Ekspert zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („N 49° 22' …'' – E 20° 12' …''”) – przepisane do minut; zdjęcia II i III
//    mają w karcie N 49° 27′ – przepisane jak są;
//  • zdjęcia fitosocjologiczne jak w karcie (warstwy B i C; wrześnię karta wpisuje w C – zostaje w C); wysokość warstwy C
//    „2,0 m” → 200 cm; literówka „Chrysantemum leucantemum” (zdjęcie II) poprawiona na Chrysanthemum leucanthemum;
//  • oceny wskaźników jak w karcie, także tam, gdzie tab. 2 mówi co innego: udział drzew „Brak” → U1 (tab. 2: FV),
//    szerokość kamieńców „5–30 m” → FV (tab. 2: U2–U1; liczb nie wpisano, podpowiedzi brak);
//  • struktura i ocena ogólna liczone przez formularz: U1 (w karcie FV) – dwa kardynalne wskaźniki U1. Rozbieżność opisana
//    w specyfikacji i w uzasadnieniu oceny ogólnej;
//  • oddziaływania: stare kody (2010) → słownik 2011: 421 → E03.01, 830 → J02.03, 608 → G02.08, 941 → L08; intensywność
//    A/B/C → H/M/L (stary kod w opisie); zagrożenia z pola tekstowego karty rozpisane na kody;
//  • typ stanowiska, zarządzający, typ monitoringu, „monitoring wymagany” i uwagi – w „Uwagach”.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology3230 } from './methodology'

const COORD = 'N 49°22′; E 20°12′'
const COORD_27 = 'N 49°27′; E 20°12′'

type Row = [layer: 'B' | 'C', name: string, abundance: string]
const releve = (o: { coords: string; area: number; coverB: number; coverC: number; heightB: number }, species: Row[]) => ({
  altitude: 540,
  slope: 0,
  exposure: 'N',
  coverA: undefined,
  coverD: undefined,
  heightA: undefined,
  heightC: 200,
  heightD: undefined,
  unit: 'Myricario-Salicetum',
  ...o,
  species: species.map(([layer, name, abundance]) => ({ layer, name, abundance })),
})

const OVERALL_NOTE = 'Powierzchnia siedliska o różnym stanie zachowania na stanowisku.'

export const bialka03: CardValues = {
  ...emptyCardValues(methodology3230),
  site: {
    siteName: 'Białka 03',
    guid: '',
    river: 'Białka, ok. 1 km w górę od mostu (Nowa Biała – Trybsz), lewy brzeg',
    communities: 'Myricario-Salicetum',
    description:
      'Luźne płaty wrześni na kamieńcach wykształconych wzdłuż koryta rzeki Białka, około kilometra w górę od mostu (Nowa Biała – Trybsz), na lewym brzegu rzeki. Na całym stanowisku siedlisko tworzy skupienia, w których występują duże, ok. półtora metra wysokie rośliny, tworzące zwarte zarośla razem z wierzbą siwą, a pomiędzy nimi, na kamieńcach obserwuje się młody podrost niewielkich okazów wrześni.',
    areaHa: 0.5,
    protectedAreas: 'PLH120024 Dolina Białki (obszar Natura 2000). Innych form ochrony brak („Brak obszaru chronionego”).',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '20x100 m',
    altitude: '540',
    date: '2009-09-27',
    floods: '',
    observer: 'Jan Kowalski',
  },
  releves: [
    releve({ coords: COORD, area: 25, coverB: 25, coverC: 60, heightB: 2 }, [
      ['B', 'Salix eleagnos', '3'],
      ['C', 'Barbarea vulgaris', '+'],
      ['C', 'Calamagrostis epigeios', '+'],
      ['C', 'Conyza canadensis', '+'],
      ['C', 'Chrysanthemum leucanthemum', '+'],
      ['C', 'Deschampsia caespitosa', '+'],
      ['C', 'Epilobium palustre', '+'],
      ['C', 'Galium mollugo', '+'],
      ['C', 'Medicago lupulina', '1'],
      ['C', 'Melilotus alba', '+'],
      ['C', 'Mentha longifolia', '+'],
      ['C', 'Myricaria germanica', '3'],
      ['C', 'Petasites albus', '1'],
      ['C', 'Rhinanthus serotinus', '+'],
      ['C', 'Urtica dioica', '+'],
    ]),
    releve({ coords: COORD_27, area: 25, coverB: 10, coverC: 80, heightB: 2 }, [
      ['B', 'Salix eleagnos', '2'],
      ['C', 'Achillea millefolium', '+'],
      ['C', 'Barbarea vulgaris', '1'],
      ['C', 'Cardaminopsis arenosa', '+'],
      ['C', 'Calamagrostis epigeios', '+'],
      ['C', 'Chrysanthemum leucanthemum', '+'],
      ['C', 'Cirsium arvense', '+'],
      ['C', 'Conyza canadensis', '1'],
      ['C', 'Deschampsia caespitosa', '+'],
      ['C', 'Echium vulgare', '1'],
      ['C', 'Epilobium palustre', '1'],
      ['C', 'Hypericum maculatum', '+'],
      ['C', 'Myricaria germanica', '3'],
      ['C', 'Petasites albus', '2'],
      ['C', 'Pinus sylvestris', '+'],
      ['C', 'Rhinanthus serotinus', '+'],
    ]),
    releve({ coords: COORD_27, area: 100, coverB: 50, coverC: 70, heightB: 2.5 }, [
      ['B', 'Salix eleagnos', '3'],
      ['C', 'Barbarea vulgaris', '+'],
      ['C', 'Cardaminopsis arenosa', '+'],
      ['C', 'Calamagrostis epigeios', '1'],
      ['C', 'Cirsium arvense', '+'],
      ['C', 'Conyza canadensis', '+'],
      ['C', 'Deschampsia caespitosa', '1'],
      ['C', 'Dactylis glomerata', '+'],
      ['C', 'Epilobium palustre', '+'],
      ['C', 'Galium mollugo', '1'],
      ['C', 'Hypericum maculatum', '+'],
      ['C', 'Impatiens glandulifera', '+'],
      ['C', 'Mentha longifolia', '+'],
      ['C', 'Medicago lupulina', '+'],
      ['C', 'Myricaria germanica', '4'],
      ['C', 'Pinus sylvestris', '+'],
      ['C', 'Plantago lanceolata', '+'],
      ['C', 'Rhinanthus serotinus', '+'],
      ['C', 'Symphytum officinale', '+'],
    ]),
  ],
  indicators: {
    area: { inputs: { choice: 'stable', areaHa: undefined, note: '' }, value: 'nie podlega zmianom lub zwiększa się', grade: 'FV' },
    share: {
      inputs: { value: 100, note: '100% siedlisko ma charakter płatowaty na całym obszarze, ale siewki i młode rośliny spotykane wszędzie' },
      value: '100% siedlisko ma charakter płatowaty na całym obszarze, ale siewki i młode rośliny spotykane wszędzie',
      grade: 'FV',
    },
    shrubSpecies: {
      inputs: { choice: 'full', species: [{ name: 'Salix eleagnos', cover: 40 }], note: 'Wierzba siwa Salix eleagnos 40%' },
      value: 'Wierzba siwa Salix eleagnos 40%',
      grade: 'FV',
    },
    height: { inputs: { value: 2, note: '2,0 m' }, value: '2,0 m', grade: 'FV' },
    cover: { inputs: { value: 40, note: '' }, value: '40%', grade: 'FV' },
    spatial: {
      inputs: {
        choice: 'patches',
        note: 'Większe płaty w miejscach dużego nagromadzenia żwiru, kamieni i piasku, w zakolach starych nurtów rzeki, młode siewki i rośliny do 20 cm, na nagich, świeżo utworzonych kamieńcach',
      },
      value:
        'Większe płaty w miejscach dużego nagromadzenia żwiru, kamieni i piasku, w zakolach starych nurtów rzeki, młode siewki i rośliny do 20 cm, na nagich, świeżo utworzonych kamieńcach',
      grade: 'FV',
    },
    trees: { inputs: { choice: 'none', value: undefined, species: [], note: 'Brak' }, value: 'Brak', grade: 'U1' },
    expansive: {
      inputs: { choice: 'clumps', species: [{ name: 'Calamagrostis epigeios', cover: 15 }], note: 'Trzcinnik piaskowy Calamagrostis epigeios 15%' },
      value: 'Trzcinnik piaskowy Calamagrostis epigeios 15%',
      grade: 'U1',
    },
    regeneration: {
      inputs: { choice: 'common', note: 'Wszędzie obserwowane siewki i formy młodociane' },
      value: 'Wszędzie obserwowane siewki i formy młodociane',
      grade: 'FV',
    },
    width: { inputs: { left: undefined, right: undefined, value: undefined, note: '5–30 m' }, value: '5–30 m', grade: 'FV' },
    aliens: {
      inputs: {
        species: [{ name: 'Impatiens glandulifera', cover: 5 }],
        abundance: 'small',
        count: undefined,
        none: '',
        note: 'Niecierpek gruczołowaty Impatiens glandulifera 5%',
      },
      value: 'Niecierpek gruczołowaty Impatiens glandulifera 5%',
      grade: 'U1',
    },
    complex: {
      inputs: { h3220: 'good', h3230: 'good', h3240: 'good', h91E0: 'good', note: '3220, 3230, 3240, 91E0 – wszystkie wykształcone typowo' },
      value: '3220, 3230, 3240, 91E0 – wszystkie wykształcone typowo',
      grade: 'FV',
    },
  },
  prospects: {
    value: 'Siedlisko jest dobrze zachowane i raczej nie ulegnie degradacji. Duże rozlewisko rzeki i jej naturalny charakter gwarantują dobrze wykształcające się kamieńce.',
    grade: 'FV',
  },
  impacts: [
    {
      code: 'E03.01',
      name: 'Pozbywanie się odpadów z gospodarstw domowych / obiektów rekreacyjnych',
      influence: '-',
      intensity: 'H',
      description: 'Obecność nielegalnych wysypisk śmieci oraz gruzu budowlanego, często zawierającego elementy z eternitu (azbest). (Kod w karcie z 2009 r.: 421 Pozbywanie się odpadów z gospodarstw domowych, intensywność A.)',
    },
    {
      code: 'J02.03',
      name: 'Regulowanie (prostowanie) koryt rzecznych i zmiana ich przebiegu',
      influence: '-',
      intensity: 'L',
      description: 'Uregulowanie koryta rzeki spowoduje całkowite zniszczenie siedliska. (Kod w karcie z 2009 r.: 830 Regulowanie (prostowanie) koryt rzecznych, intensywność C.)',
    },
    {
      code: 'G02.08',
      name: 'Kempingi i karawaningi',
      influence: '-',
      intensity: 'M',
      description: 'Obecność dzikich campingów (przyczepy campingowe, samochody, namioty). (Kod w karcie z 2009 r.: 608 Kempingi i karawaningi, intensywność B.)',
    },
    {
      code: 'L08',
      name: 'Powódź (procesy naturalne)',
      influence: '0',
      intensity: 'L',
      description: 'Powodzie zmieniają położenie koryta rzeki oraz kamieńców, stare kamieńce zanikają, a na nowo utworzonych widać wyraźną sukcesję siedliska. (Kod w karcie z 2009 r.: 941 Powódź, intensywność C.)',
    },
  ],
  threats: [
    { code: 'J02.03', name: 'Regulowanie (prostowanie) koryt rzecznych i zmiana ich przebiegu', description: 'Zagrożeniem może być próba regulacji brzegów rzeki.' },
    { code: 'G02.08', name: 'Kempingi i karawaningi', description: 'Nad brzegami Białki w sezonie letnim tworzą się dzikie campingi. Zbierane jest drewno naniesione na kamieńce, tym samym siedlisko jest stale penetrowane.' },
    { code: 'E03.01', name: 'Pozbywanie się odpadów z gospodarstw domowych / obiektów rekreacyjnych', description: 'Bardzo dużo śmieci jest niesionych z prądem rzeki, jak również wyrzucane są worki ze śmieciami do rzeki.' },
  ],
  other: {
    otherValues: 'Kompleks siedlisk nadrzecznych',
    conservation:
      'Wykonywane działania ochronne: brak. Propozycje: kontrola nielegalnego poboru piasku i żwiru, likwidacja dzikich śmietnisk. Usuwanie gatunków inwazyjnych w miarę ich pojawiania się.',
    shareFV: 100,
    shareU1: 0,
    shareU2: 0,
    notes:
      'Typ stanowiska: referencyjne. Zarządzający terenem: RZGW Kraków, na terenie Gminy Nowy Targ. Rok: 2009, typ monitoringu: zintegrowany, dodatkowi eksperci: –. Monitoring jest wymagany: tak. Uzasadnienie: obszar stale jest modelowany przez wysokie stany wody. Należy monitorować wszelkie zmiany rozmieszczenia siedliska, w celu określania trendu jego zmian. Dodatkowo silna penetracja przez okoliczną ludność oraz nielegalny pobór żwiru i kamienia mogą znacząco zaszkodzić siedlisku. Uwagi dodatkowe: naturalna struktura przestrzenna siedliska przedstawia się w postaci kilku większych płatów w miejscach dogodnych dla jego sukcesji oraz nalotowi niewielkich roślin i siewek na przestrzeni całej powierzchni kamieńców i brzegów. Płatowatość nie jest wskaźnikiem negatywnym, a jedynie konsekwencją niestabilności podłoża wynikającego z cyklicznego zalewania wodą i przenoszenia materiału piaszczysto-żwirowego z miejsca na miejsce. Tym samym można przypuszczać, że przy kolejnym monitoringu siedliska na tym stanowisku nie będzie istniało w tym samym miejscu co obecnie, ale będzie ono występowało zapewne w niedalekiej odległości od obecnych stanowisk. Odstępstwa od metodyki: transekt 20×100 m (20 arów) zamiast 200×10 m; termin (27.09) poza oknem czerwiec–sierpień; wysokość warstwy C w zdjęciach podana w karcie jako 2,0 m.',
    photos: [],
  },
  overallComment: `${OVERALL_NOTE} W karcie z przewodnika: specyficzna struktura i funkcje FV, ocena ogólna FV (udział FV 100%). Formularz liczy strukturę U1, bo dwa wskaźniki kardynalne (udział gatunków drzewiastych, gatunki ekspansywne) mają w karcie U1, a tab. 2 wymaga dla FV wszystkich kardynalnych na FV.`,
}

export const examples3230: CardExample[] = [{ id: 'bialka03', label: 'Białka 03', values: bialka03 }]
