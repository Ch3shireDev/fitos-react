// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Korzeniak 2010, rozdz. 6230, pkt 3 „Przykład wypełnionej
// karty obserwacji”): Piorunowiec (Gorce), 17.08.2007. Koordynator zanonimizowany (Jan Kowalski).
//  • współrzędne w przewodniku są ucięte do minut („N 49°32′ …; E 20°15′ …”) – przepisane do minut, te same dla
//    początku, środka i końca transektu (karta podaje jeden punkt);
//  • „Nazwa obszaru: PLH120018 Ostoja Gorczańska” → „Obszary chronione” (w karcie to pole puste); „Zarządzający
//    terenem: Teren prywatny”; rok, typ monitoringu, „Monitoring jest wymagany” i „Uzasadnienie” → uwagi;
//  • piętro roślinności (pole formularza, nie karty): reglowe – psiara reglowa na 1040–1070 m w Gorcach;
//  • literówki w nazwach gatunków poprawione, żeby katalog je rozpoznał: Dantonia → Danthonia, Pleurozium
//    schreberii → schreberi; „Rumex cfr. acetosa” → Rumex acetosa; świerk z „(b) +, (c) +” – dwa wiersze (B i C);
//  • gatunki charakterystyczne: „ok. 5–10%” → 10, „znikomo” – bez pokrycia;
//  • bogactwo gatunkowe: karta podaje średnią 16 gat./25 m²; to dokładnie średnia z liczby gatunków naczyniowych
//    w trzech zdjęciach (17, 18, 13 – bez mchów, świerk raz);
//  • rodzime gatunki ekspansywne: borówka czarna 30% + brusznica 10% = 40% – tab. 2 daje U2, karta U1 (formularz
//    pokazuje rozjazd, ocena eksperta zostaje); sprawozdania 2013–2014 i 2016–2018 dały Piorunowcowi strukturę U2;
//  • perspektywy ochrony – w karcie sama ocena U1; opis z pól „Zagrożenia” i „Propozycje działań ochronnych”;
//  • działalność człowieka: stare kody 250 Pozyskiwanie / usuwanie roślin ogólnie → F04, 102 Koszenie / ścinanie →
//    A03, 501 Ścieżki, szlaki piesze → D01.01, 161 Zalesianie → B01 (słownik 2011); intensywność C → L; przy 161
//    karta nie podaje wpływu – przyjęto „-”; stare kody w opisie. „Zagrożenia” (tekst) → A04.03 i K02.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology6230 } from './methodology'

const COORD = 'N 49°32′; E 20°15′'

type Row = [layer: 'B' | 'C' | 'D', name: string, abundance: string]
/** „Agrostis capillaris +, Picea abies (B) +, Pleurozium schreberi (D) 1, …” → wiersze; bez dopisku – warstwa C. */
const list = (spec: string): Row[] =>
  spec.split(', ').map((s) => {
    const i = s.lastIndexOf(' ')
    const m = /^(.*) \(([BCD])\)$/.exec(s.slice(0, i))
    return m ? [m[2] as Row[0], m[1], s.slice(i + 1)] : ['C', s.slice(0, i), s.slice(i + 1)]
  })

const UNIT = 'Hieracio vulgati-Nardetum'
const releve = (o: { slope: number; coverB: number; coverD: number; heightB: number; heightC: number }, spec: string) => ({
  coords: COORD,
  altitude: 1040,
  area: 25,
  exposure: 'E',
  coverA: undefined,
  coverC: 100,
  heightA: undefined,
  heightD: undefined,
  unit: UNIT,
  ...o,
  species: list(spec).map(([layer, name, abundance]) => ({ layer, name, abundance })),
})

const CHARACTERISTIC_NOTE =
  'Bliźniczka psia trawka Nardus stricta 80%, turzyca pigułkowata Carex pilulifera ok. 5–10%, jastrzębiec Lachenala Hieracium lachenalii ok. 10%, wrzos pospolity Calluna vulgaris ok. 10%, krzyżownica zwyczajna Polygala vulgaris (znikomo), macierzanka zwyczajna Thymus pulegioides (znikomo), dziewięćsił bezłodygowy Carlina acaulis (znikomo), widłak goździsty Lycopodium clavatum ok. 5%'
const DOMINANT_NOTE = 'Bliźniczka psia trawka Nardus stricta 80%, borówka czarna Vaccinium myrtillus 30%, borówka brusznica Vaccinium vitis-idaea 10%'
const EXPANSIVE_NOTE = 'Borówka czarna Vaccinium myrtillus 30%, borówka brusznica Vaccinium vitis-idaea 10%'
const SHRUBS_NOTE =
  'Świerk pospolity Picea abies (znikomo), jałowiec pospolity Juniperus communis (znikomo), brzoza brodawkowata Betula pendula (znikomo), wierzba iwa Salix caprea (znikomo); sumaryczne pokrycie ok. 5%'
const SPATIAL_NOTE =
  '1. Zwarcie muraw ok. 95–100%; 2. Wielkość powierzchni poszczególnych płatów przeważnie znacznie powyżej 1000 m²; 3. Stopień fragmentacji nieznaczny. Bliźniczyska są nieznacznie rozfragmentowane, przede wszystkim płatami borówczysk. Murawa w wyniku wieloletniego nieużytkowania bardzo zwarta, przez co rośliny wymagające większej ilości światła i bezpośredniego dostępu do gleby właściwie tu nie występują lub są bardzo rzadkie'
const AREA_NOTE =
  'W ostatnich latach powierzchnia bliźniczyska nie uległa wyraźnej zmianie, tylko niewielka część polany położona w najbardziej północnej jej części oraz przy skraju lasu zarosła borówką'

export const piorunowiec: CardValues = {
  ...emptyCardValues(methodology6230),
  site: {
    subtype: '6230-2',
    siteName: 'Piorunowiec',
    guid: '',
    siteType: 'referencyjne',
    communities: 'Psiara reglowa Hieracio vulgati-Nardetum',
    description: 'Wielkopowierzchniowe bliźniczysko przy grzbiecie między Gorcem Kamienickim a Piorunowcem, ekspozycja E, nachylenie ok. 10°',
    areaHa: 'ok. 25',
    protectedAreas: 'PLH120018 Ostoja Gorczańska',
    manager: 'Teren prywatny',
    coordStart: COORD,
    coordMiddle: COORD,
    coordEnd: COORD,
    transect: '10x200 m',
    altitude: '1070',
    belt: 'montane',
    date: '2007-08-17',
    observer: 'Jan Kowalski',
    additionalExperts: '',
  },
  releves: [
    releve(
      { slope: 5, coverB: 2, coverD: 2, heightB: 0.8, heightC: 15 },
      'Agrostis capillaris +, Anthoxanthum odoratum +, Calluna vulgaris +, Carex pilulifera +, Danthonia decumbens +, Festuca rubra 1, Hieracium lachenalii +, Hypericum maculatum +, Luzula multiflora 1, Lycopodium clavatum 2, Nardus stricta 4, Picea abies (B) +, Picea abies (C) +, Potentilla erecta +, Rumex acetosella +, Rumex acetosa +, Vaccinium myrtillus 1, Vaccinium vitis-idaea 3',
    ),
    releve(
      { slope: 5, coverB: 5, coverD: 5, heightB: 2, heightC: 15 },
      'Agrostis capillaris +, Anthoxanthum odoratum 1, Betula pendula (B) 1, Calluna vulgaris 1, Carex pilulifera 1, Danthonia decumbens +, Festuca rubra 1, Hieracium lachenalii 1, Hypericum maculatum +, Juniperus communis (B) +, Luzula multiflora 1, Nardus stricta 5, Picea abies (B) +, Picea abies (C) +, Pinus sylvestris (C) +, Pleurozium schreberi (D) 1, Potentilla erecta +, Rumex acetosa +, Vaccinium myrtillus 2, Veronica officinalis +',
    ),
    releve(
      { slope: 15, coverB: 2, coverD: 30, heightB: 1, heightC: 20 },
      'Agrostis capillaris 1, Anthoxanthum odoratum 1, Calluna vulgaris +, Carex pilulifera +, Chamaenerion angustifolium +, Danthonia decumbens +, Festuca rubra 1, Hieracium lachenalii 1, Luzula multiflora +, Nardus stricta 5, Picea abies (B) +, Picea abies (C) +, Pleurozium schreberi (D) 3, Potentilla erecta 1, Vaccinium myrtillus 2',
    ),
  ],
  indicators: {
    area: { inputs: { choice: 'stable', areaHa: undefined, note: AREA_NOTE }, value: AREA_NOTE, grade: 'FV' },
    characteristic: {
      inputs: {
        species: [
          { name: 'Nardus stricta', cover: 80 },
          { name: 'Carex pilulifera', cover: 10 },
          { name: 'Hieracium lachenalii', cover: 10 },
          { name: 'Calluna vulgaris', cover: 10 },
          { name: 'Polygala vulgaris' },
          { name: 'Thymus pulegioides' },
          { name: 'Carlina acaulis' },
          { name: 'Lycopodium clavatum', cover: 5 },
        ],
        count: undefined,
        none: '',
        note: CHARACTERISTIC_NOTE,
      },
      value: CHARACTERISTIC_NOTE,
      grade: 'FV',
    },
    dominant: {
      inputs: {
        species: [
          { name: 'Nardus stricta', cover: 80 },
          { name: 'Vaccinium myrtillus', cover: 30 },
          { name: 'Vaccinium vitis-idaea', cover: 10 },
        ],
        nardus: undefined,
        note: DOMINANT_NOTE,
      },
      value: DOMINANT_NOTE,
      grade: 'U1',
    },
    richness: { inputs: { count1: 17, count2: 18, count3: 13, value: undefined, note: '' }, value: '16 gat./25 m²', grade: 'U1' },
    aliens: { inputs: { species: [], total: undefined, none: 'yes', note: 'Brak' }, value: 'Brak', grade: 'FV' },
    expansive: {
      inputs: {
        species: [
          { name: 'Vaccinium myrtillus', cover: 30 },
          { name: 'Vaccinium vitis-idaea', cover: 10 },
        ],
        total: undefined,
        none: '',
        note: EXPANSIVE_NOTE,
      },
      value: EXPANSIVE_NOTE,
      grade: 'U1',
    },
    shrubs: {
      inputs: {
        species: [{ name: 'Picea abies' }, { name: 'Juniperus communis' }, { name: 'Betula pendula' }, { name: 'Salix caprea' }],
        total: 5,
        variant: '',
        none: '',
        note: SHRUBS_NOTE,
      },
      value: SHRUBS_NOTE,
      grade: 'FV',
    },
    eutrophication: { inputs: { choice: 'none', species: [], none: '', note: 'Brak' }, value: 'Brak', grade: 'FV' },
    spatial: {
      inputs: { choice: 'intermediate', closure: 95, patchSize: 'przeważnie znacznie powyżej 1000 m²', fragmentation: '1', note: SPATIAL_NOTE },
      value: SPATIAL_NOTE,
      grade: 'U1',
    },
  },
  prospects: {
    value:
      'Największym zagrożeniem jest brak użytkowania – bliźniczyska szybko zarastają borówką, a wskutek naturalnej sukcesji wtórnej wkraczają na nie drzewa i krzewy. Koszenie obejmuje tylko niewielką część płatu (poza transektem); potrzebne systematyczne koszenie w drugiej połowie lata lub jesienią. (W karcie sama ocena U1 – opis z pól „Zagrożenia” i „Propozycje działań ochronnych”.)',
    grade: 'U1',
  },
  impacts: [
    {
      code: 'F04',
      name: 'Pozyskiwanie / usuwanie roślin lądowych, ogólnie',
      influence: '0',
      intensity: 'L',
      description: 'Sporadyczny zbiór borówek oraz grzybów. (Kod w karcie z 2007 r.: 250 Pozyskiwanie / usuwanie roślin ogólnie, intensywność C.)',
    },
    {
      code: 'A03',
      name: 'Koszenie / ścinanie trawy',
      influence: '+',
      intensity: 'L',
      description: 'Regularne koszenie odbywa się tylko na niewielkiej powierzchni poza transektem, wpływ wybitnie korzystny. (Kod w karcie z 2007 r.: 102 Koszenie / ścinanie, intensywność C.)',
    },
    {
      code: 'D01.01',
      name: 'Ścieżki, szlaki piesze, szlaki rowerowe',
      influence: '0',
      intensity: 'L',
      description:
        'Ścieżka i szlak turystyczny (poza transektem). Umiarkowane wydeptywanie korzystnie wpływa na rozwój bliźniczysk, dlatego też wielokrotnie obserwowano wąskie i długie płaty tych zbiorowisk wykształcone wzdłuż ścieżek i szlaków turystycznych. (Kod w karcie z 2007 r.: 501 Ścieżki, szlaki piesze, szlaki rowerowe, intensywność C.)',
    },
    {
      code: 'B01',
      name: 'Zalesianie terenów otwartych',
      influence: '-',
      intensity: 'L',
      description: 'Zaobserwowano zalesianie świerkiem, lecz tylko na niewielkiej części polany (poza transektem). (Kod w karcie z 2007 r.: 161 Zalesianie, intensywność C; wpływu karta nie podaje.)',
    },
  ],
  threats: [
    { code: 'A04.03', name: 'Zarzucenie pasterstwa, brak wypasu', description: 'Największym zagrożeniem jest brak użytkowania tego terenu, w wyniku czego bliźniczyska szybko zarastają borówką.' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja', description: 'Wskutek procesu naturalnej sukcesji wtórnej wkraczają na bliźniczyska różne gatunki drzew i krzewów.' },
  ],
  other: {
    otherValues: 'Potencjalne siedlisko dla rzadkich w Gorcach gatunków roślin wysokogórskich',
    conservation: 'Brak (koszenie tylko niewielkiej części płatu, poza transektem)',
    proposals: 'Systematyczne koszenie odbywające się najlepiej w drugiej połowie lata lub nawet na jesieni',
    shareFV: 40,
    shareU1: 55,
    shareU2: 5,
    notes:
      'Rok: 2007. Typ monitoringu: szczegółowy. Nazwa obszaru: PLH120018 Ostoja Gorczańska. Monitoring jest wymagany: tak – jeden z najlepiej zachowanych płatów psiary reglowej w obszarze, obserwacje co ok. 3–5 lat. Optymalny czas badań: od drugiej połowy lipca do końca sierpnia (ewentualnie wrzesień). Powierzchnia ta została wskazana jako referencyjna, chociaż nie jest zachowana idealnie, widoczna jest tu m.in. ekspansja borówki, a murawa na skutek wieloletniego braku użytkowania kośnego jest zbyt zwarta, co utrudnia egzystencję wielu niewielkim gatunkom wymagającym mniej zwartych siedlisk. Jest to jednak jeden z najlepiej w Gorcach zachowanych płatów bliźniczysk o tak dużej powierzchni, stąd z pewnym przybliżeniem można go wskazać jako wzorcowy.',
    photos: [],
  },
  overallComment: '',
}

export const examples6230: CardExample[] = [{ id: 'piorunowiec', label: 'Piorunowiec', values: piorunowiec }]
