// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Perzanowska 2012, rozdz. 3220, pkt 3 „Przykład wypełnionej
// karty obserwacji”): Siwa Woda, 10.07.2010. Ekspert zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („N 49° 17' …'' – E 19° 50' …''”) – przepisane do minut;
//  • zakresy z karty wpisane środkiem przedziału, oryginał zostaje w opisie wskaźnika: szerokość 1–2 m + 5–6 m →
//    1,5 + 5,5 = 7 m (FV), pokrycie 5–10% → 7,5%, wysokość 5–20 cm → 12,5 cm (max. 60 cm);
//  • „Powierzchnia kamieńców na transekcie” (50%) z części struktury karty 2010 przeniesiona do parametru
//    „Powierzchnia siedliska” (tak jest w tab. 2 i od 2016 r.) – razem z „0,25 ha/500 m koryta rzeki”;
//  • gatunki krzewów: wybrane FV jak w karcie; wg listy (wierzba purpurowa) formularz pokazuje U1 – ostrzeżenie;
//  • kompleks siedlisk U1 jak w karcie. Wskaźnik jest kardynalny, więc wg tab. 2 struktura wychodzi U1 i ocena
//    ogólna U1 – karta z przewodnika (i sprawozdanie 2011) podaje FV/FV. Rozbieżność opisana w uwagach;
//  • oddziaływania: stare kody (2010) → słownik 2011: 690 → G01, 941 → L08; intensywność A/B → H/M;
//  • „Zagrożenia” z raportu rocznego (sukcesja, odnawianie przez wezbrania) → K02; „Typ stanowiska: referencyjne”,
//    typ monitoringu i uzasadnienie – w uwagach.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology3220 } from './methodology'

const COORD = 'N 49°17′; E 19°50′'

const releve = (o: { altitude: number; slope: number; exposure: string; heightC: number }, species: [name: string, abundance: string][]) => ({
  coords: COORD,
  area: 25,
  unit: '',
  coverB: undefined,
  coverC: 5,
  coverD: undefined,
  heightB: undefined,
  heightD: undefined,
  ...o,
  species: species.map(([name, abundance]) => ({ layer: 'C', name, abundance })),
})

const p = (...names: string[]): [string, string][] => names.map((n) => [n, '+'])

export const siwaWoda: CardValues = {
  ...emptyCardValues(methodology3220),
  site: {
    siteName: 'Siwa Woda',
    guid: '',
    river: 'Siwa Woda (powyżej połączenia z Kirową Wodą)',
    communities: '?',
    description:
      'Stanowisko obejmuje odcinek Siwej Wody, powyżej połączenia z Kirową Wodą, i ok. 100 m powyżej mostu. W obecnej chwili nurt biegnie kilkoma odnogami; obecne są tu kamieniste wyspy, lewy brzeg świeżo podmyty przez wodę, urwany, wysoki 1–1,5 m. Transekt zlokalizowany na wyspie oraz lewym i prawym brzegu, na niedawno naniesionych kamieńcach. Średnia wielkość kamieni to 15–25 cm średnicy, często obecne są pojedyncze, większe. Miejscami, w zagłębieniach terenu, naniesione są dość duże łachy piasku i drobnego żwiru. Kamieńce miejscami usypane do 1 m ponad lustro wody. Na brzegach – pas zarośli wierzbowych (S. eleagnos, S. purpurea) a bezpośrednio za nimi – świerczyny. Na kamieńcach, po powodzi mającej miejsce cztery tygodnie wcześniej, niewielkie zwarcie roślinności. Pojedyncze, wyrzucone przez wodę drewno i kępy runi. Koryto naturalne, na prawym brzegu, poniżej transektu – brzeg obłożony narzutem kamiennym aż do mostu.',
    areaHa: 0.25,
    protectedAreas: 'Obszar nie objęty ochroną, poniżej granic TPN; poza obszarem Natura 2000',
    manager: 'RZGW Kraków',
    section: 'Ok. 500 m biegu rzeki powyżej mostu; siedlisko ułożone pasmowo wzdłuż koryta i na wyspach',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '10x200 m',
    altitude: '882–893',
    date: '2010-07-10',
    floods: 'Powódź ok. 4 tygodnie przed obserwacją (czerwiec 2010) – nowe kamieńce, niewielkie zwarcie roślinności.',
    observer: 'Jan Kowalski',
  },
  releves: [
    releve({ altitude: 882, slope: 2, exposure: 'N', heightC: 12.5 }, [
      ...p('Acer pseudoplatanus', 'Agrostis vulgaris', 'Alchemilla sp.'),
      ['Arabis alpina', '1'],
      ...p('Arenaria serpyllifolia', 'Cardaminopsis arenosa'),
      ['Cerastium vulgatum', '1'],
      ...p('Chaerophyllum hirsutum', 'Cirsium palustre', 'Elymus caninus', 'Epilobium sp.', 'Euphrasia sp.', 'Festuca pratensis', 'Galium mollugo', 'Geranium robertianum', 'Heracleum sphondylium', 'Leucanthemum vulgare', 'Linum extraaxillare', 'Medicago lupulina', 'Melandrium rubrum', 'Myosotis palustris'),
      ['Petasites kablikianus', '1'],
      ...p('Picea abies', 'Plantago intermedia'),
      ['Poa alpina var. vivipara', '1'],
      ...p('Poa annua', 'Potentilla anserina', 'Prunella vulgaris', 'Ranunculus repens', 'Rubus sp.', 'Salix eleagnos', 'Silene vulgaris', 'Taraxacum officinale', 'Trifolium pratense'),
    ]),
    releve({ altitude: 888, slope: 0, exposure: 'NE', heightC: 15 }, [
      ...p('Aegopodium podagraria', 'Agrostis vulgaris', 'Alchemilla sp.', 'Arabis alpina', 'Cardaminopsis arenosa', 'Carduus personata', 'Cerastium vulgatum', 'Chaerophyllum hirsutum', 'Cirsium palustre', 'Elymus caninus', 'Epilobium sp.', 'Galium mollugo', 'Geranium robertianum', 'Leucanthemum vulgare', 'Medicago lupulina', 'Arenaria serpyllifolia', 'Myosotis palustris'),
      ['Petasites kablikianus', '1'],
      ...p('Picea abies', 'Plantago intermedia', 'Poa alpina var. vivipara', 'Poa annua', 'Poa palustris', 'Prunella vulgaris', 'Ranunculus repens', 'Rubus sp.', 'Salix purpurea', 'Salix eleagnos', 'Silene vulgaris', 'Stellaria nemorum', 'Taraxacum officinale', 'Trifolium pratense', 'Tussilago farfara', 'Veronica chamaedrys'),
    ]),
    releve({ altitude: 893, slope: 0.1, exposure: 'N', heightC: 10 }, [
      ...p('Acer pseudoplatanus', 'Agrostis vulgaris', 'Alchemilla sp.', 'Alnus incana', 'Cardaminopsis arenosa', 'Carduus personata', 'Cerastium vulgatum', 'Cardamine impatiens', 'Fragaria vesca', 'Chaerophyllum hirsutum', 'Elymus caninus', 'Equisetum arvense', 'Festuca rubra', 'Galium mollugo', 'Geranium robertianum', 'Medicago lupulina', 'Melandrium rubrum', 'Myosotis palustris', 'Petasites kablikianus', 'Picea abies', 'Poa alpina var. vivipara', 'Aconitum firmum', 'Poa palustris', 'Prunella vulgaris', 'Ranunculus repens', 'Rubus sp.', 'Salix purpurea', 'Salix eleagnos', 'Silene vulgaris', 'Taraxacum officinale'),
    ]),
  ],
  indicators: {
    area: {
      inputs: { share: 50, choice: '', areaHa: 0.25, note: '0,25 ha/500 m koryta rzeki; kamieńce 50% transektu (pozostała część to koryto rzeki i zarośla wierzbowe)' },
      value: '0,25 ha/500 m koryta rzeki; kamieńce 50% transektu (pozostała część to koryto rzeki i zarośla wierzbowe)',
      grade: 'FV',
    },
    width: { inputs: { widthA: 1.5, widthB: 5.5, bedWidth: undefined, note: '1–2 m + 5–6 m' }, value: '1–2 m + 5–6 m', grade: 'FV' },
    herbCover: { inputs: { value: 7.5, note: '5–10%' }, value: '5–10%', grade: 'FV' },
    herbHeight: { inputs: { measurements: '', mean: 12.5, max: 60, note: '5–20 cm, max. 60 cm' }, value: '5–20 cm, max. 60 cm', grade: 'FV' },
    expansive: { inputs: { choice: 'none', species: [], note: 'Brak' }, value: 'Brak', grade: 'FV' },
    aliens: { inputs: { choice: 'none', species: [], note: 'Brak' }, value: 'Brak', grade: 'FV' },
    shrubSpecies: {
      inputs: {
        choice: 'native',
        species: [
          { name: 'Salix eleagnos', cover: 0.5 },
          { name: 'Salix purpurea', cover: 0.5 },
          { name: 'Alnus incana', cover: 0.5 },
        ],
        absent: '',
        note: 'Wierzba siwa Salix eleagnos <1,0%, wierzba purpurowa S. purpurea <1,0%, olsza szara Alnus incana <1%',
      },
      value: 'Wierzba siwa Salix eleagnos <1,0%, wierzba purpurowa S. purpurea <1,0%, olsza szara Alnus incana <1%',
      grade: 'FV',
    },
    shrubCover: { inputs: { choice: 'young', value: undefined, note: '<15%' }, value: '<15%', grade: 'FV' },
    trees: {
      inputs: {
        choice: 'none',
        species: [{ name: 'Picea abies' }, { name: 'Alnus incana' }, { name: 'Salix eleagnos' }, { name: 'Salix purpurea' }],
        total: 0.5,
        note: 'Świerk pospolity Picea abies, olsza szara Alnus incana, wierzba siwa Salix eleagnos, wierzba purpurowa Salix purpurea. Łącznie <1%',
      },
      value: 'Świerk pospolity Picea abies, olsza szara Alnus incana, wierzba siwa Salix eleagnos, wierzba purpurowa Salix purpurea. Łącznie <1%',
      grade: 'FV',
    },
    complex: {
      inputs: { h3220: 'good', h3230: 'absent', h3240: 'good', h91E0: 'remnant', note: '3220, 3240 – oba wykształcone wzorcowo; 91E0 – szczątkowo' },
      value: '3220, 3240 – oba wykształcone wzorcowo; 91E0 – szczątkowo',
      grade: 'U1',
    },
  },
  prospects: {
    value:
      'Odcinek koryta Siwej Wody o naturalnym charakterze doskonale się odnawiający w wyniku wezbrań. Brak obudowy koryta i zbiorników hamujących napływ materiału skalnego z górnego biegu, tuż poniżej granic Tatrzańskiego Parku Narodowego; presja ludzka niewielka, wyłącznie rekreacyjna. Poniżej punkt poboru wody.',
    grade: 'FV',
  },
  impacts: [
    {
      code: 'G01',
      name: 'Sporty i różne formy czynnego wypoczynku, uprawiane w plenerze',
      influence: '0',
      intensity: 'M',
      description: 'Rekreacja – pojedyncze osoby lub rodziny plażujące nad wodą. (Kod w karcie z 2010 r.: 690 Inne możliwe oddziaływania aktywności rekreacyjnej, intensywność B.)',
    },
    {
      code: 'L08',
      name: 'Powódź (naturalne procesy)',
      influence: '+',
      intensity: 'H',
      description: 'Regularne, silne wezbrania. (Kod w karcie z 2010 r.: 941 Powódź, intensywność A.)',
    },
  ],
  threats: [{ code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja', description: 'Ulega procesom sukcesji naturalnej, ale odnawia się w wyniku wezbrań wody.' }],
  other: {
    otherValues: 'W kompleksie siedlisk nadrzecznych, z 3240.',
    conservation: 'Brak działań ochronnych. Propozycje: brak – sugerowana ochrona bierna.',
    shareFV: 100,
    shareU1: 0,
    shareU2: 0,
    notes:
      'Typ stanowiska: referencyjne. Raport roczny 2010, monitoring zintegrowany, bez dodatkowych ekspertów. Monitoring jest wymagany – dobrze wykształcone siedlisko na górnym odcinku potoku, lokalizacja w górnym zasięgu wysokości kamieńców. Data kontroli: 10.07.2010. Karta z przewodnika ocenia specyficzną strukturę i funkcje oraz stan ogólny na FV, mimo kardynalnego wskaźnika „Obecność kompleksu siedlisk nadrzecznych” na U1 (tab. 2 dałaby U1; sprawozdanie 2011 uznało kompleks na Siwej Wodzie za właściwy ze względu na warunki fizjograficzne).',
    photos: [],
  },
  overallComment: '',
}

export const examples3220: CardExample[] = [{ id: 'siwaWoda', label: 'Siwa Woda', values: siwaWoda }]
