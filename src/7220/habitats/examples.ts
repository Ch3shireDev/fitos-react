// Przykładowe wypełnienie z przewodnika metodycznego GIOŚ (Parusel 2010, rozdz. 7220, pkt 3 „Przykład wypełnionej karty
// obserwacji”): Las Grabicz 1 (Cieszyńskie Źródła Tufowe), 15.09.2007. Koordynator zanonimizowany (Jan Kowalski).
// Oceny wskaźników i perspektyw – jak w karcie, także tam, gdzie odbiegają od tab. 2 (formularz pokazuje wtedy
// „odbiega od progów”):
//  • gatunki dominujące FV – wg tab. 2 pięć dominantów spoza listy z łącznym pokryciem 75% to U2;
//  • gatunki ekspansywne FV – ostrożeń warzywny i sadziec po 10% to wg tab. 2 U1 (2 gatunki, 20%);
//  • gatunki wskazujące na eutrofizację FV – te same dwa gatunki to wg tab. 2 U2 (≥2 gatunki); ekspert tłumaczy je
//    prześwietleniem dna potoku w jednym miejscu.
// Parametry liczy formularz: gatunki charakterystyczne (kardynalne) U1 → struktura U1, a z nią ocena ogólna U1. Karta
// wpisuje strukturę FV i ocenę ogólną FV – to sprzeczne z jej własną tab. 2 („wszystkie kardynalne FV”), opisane w uwagach.
// Inne przeniesienia:
//  • karta łączy „Proces wytrącania się martwicy” i „Występowanie martwicy” w jeden wiersz („Liczne” → FV) – tu dwa wskaźniki
//    z tą samą oceną; erozje „Brak” → „Nie stwierdzono”;
//  • gatunki charakterystyczne: „przetacznik górski, śledziennica skrętolistna – pokrycie znikome (+), 5%; Palustriella
//    commutata – znikome (+)” – przetacznik i źródliskowiec 0,5, śledziennica 5%; przetacznik nie jest gatunkiem
//    charakterystycznym (formularz ostrzega);
//  • uwodnienie: zdjęcia I–III to punkty 1, 3, 5, „między zdjęciami” – 2 i 4; „podłoże wilgotne” w zdjęciu III – puste pole;
//  • współrzędne w przewodniku ucięte do minut – przepisane do minut; brak środka transektu (karta podaje początek i koniec);
//  • wariant (/g, /w, /n) – karta go nie podaje, zostaje pusty; obszar chroniony „Natura 2000” uzupełniony o nazwę i kod;
//  • oddziaływania: stare kody (2007) → słownik 2011: 160 → B02, 501 → D01.01, 502 → D01.02; intensywność C → L;
//  • „Zagrożenia” (tekst) → H01 i G01.02; rok, typ monitoringu i rozjazdy karty – w uwagach.
import type { CardValues } from '../../7120/habitats/types'
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { methodology7220 } from './methodology'

const COORD_START = 'N 49°43′; E 18°43′'
const COORD_END = 'N 49°43′; E 18°42′'
const UNIT = 'zbiorowisko ze związku Cratoneurion commutati'

/** „Carex remota 1, Carex sylvatica +, …” → wiersze jednej warstwy. */
const list = (layer: 'C' | 'D', spec: string) =>
  spec.split(', ').map((s) => {
    const i = s.lastIndexOf(' ')
    return { layer, name: s.slice(0, i), abundance: s.slice(i + 1) }
  })

const releve = (o: { area: number; slope: number; coverC: number; coverD: number; heightC: number; unit: string }, c: string, d: string) => ({
  coords: COORD_START,
  altitude: 375,
  area: o.area,
  slope: o.slope,
  exposure: 'W',
  coverA: undefined,
  coverB: undefined,
  coverC: o.coverC,
  coverD: o.coverD,
  heightA: undefined,
  heightB: undefined,
  heightC: o.heightC,
  heightD: undefined,
  unit: o.unit,
  species: [...list('C', c), ...list('D', d)],
  remarks: '',
})

const CHARACTERISTIC_NOTE =
  'Warstwa c: przetacznik górski Veronica montana, śledziennica skrętolistna Chrysosplenium alternifolium – pokrycie znikome (+), 5%. Warstwa d: Palustriella commutata – pokrycie znikome (+).'
const DOMINANT_NOTE =
  'Warstwa c: ostrożeń warzywny Cirsium oleraceum – 10%, sadziec konopiasty Eupatorium cannabinum – 10%, świerząbek orzęsiony Chaerophyllum hirsutum – 30%. Warstwa d: Brachythecium rivulare – 15%, Conocephalum conicum – 10%.'
const EXPANSIVE_NOTE = 'Ostrożeń warzywny Cirsium oleraceum – 10%, sadziec konopiasty Eupatorium cannabinum – 10%.'
const EUTROPHIC_NOTE = 'Eupatorium cannabinum, Cirsium oleraceum. Obecność tych gatunków związana jest z prześwietleniem dna potoku w jednym miejscu na lokalnym wypłaszczeniu.'
const HYDRATION_NOTE = 'Zdjęcie 1: 10 cm, zdjęcie 2: 7 cm, zdjęcie 3: podłoże wilgotne. Między zdjęciami 1/2: 15 cm, między zdjęciami 2/3: 15 cm.'

export const lasGrabicz: CardValues = {
  ...emptyCardValues(methodology7220),
  site: {
    subtype: '7220-1',
    variant: '',
    speciesList: '',
    siteName: 'Las Grabicz 1',
    guid: '',
    siteType: 'Referencyjne',
    areaName: 'Cieszyńskie Źródła Tufowe',
    communities: 'Zbiorowisko ze związku Cratoneurion commutati; zbiorowisko Chaerophyllum hirsutum ze związku Alno-Padion',
    description:
      'Płat siedliska położony w zalesionej (grądy i łęgi podgórskie) dolinie lokalnego potoku, wykształca się na jego dnie (szerokość koryta około 1 m) w niewielkiej odległości od źródła. Struktury trawertynowe wykształcają się na odcinku około 100 m i zajmują powierzchnię około 100 m². Teren jest lekko nachylony (5–15°) w kierunku północno-zachodnim. Wydajność źródła zadowalająca.',
    areaM2: '100',
    protectedAreas: 'Obszar Natura 2000 Cieszyńskie Źródła Tufowe PLH240001',
    manager: 'Nadleśnictwo Ustroń',
    method: 'minitransect',
    coordStart: COORD_START,
    coordEnd: COORD_END,
    transect: '2x100 m',
    altitude: '375',
    date: '2007-09-15',
    observer: 'Jan Kowalski',
    additionalExperts: '',
  },
  releves: [
    releve(
      { area: 30, slope: 1, coverC: 70, coverD: 10, heightC: 50, unit: UNIT },
      'Aegopodium podagraria +, Ajuga reptans 1, Anthriscus nitidus +, Athyrium filix-femina +, Carex remota 1, Carex sylvatica +, Chaerophyllum hirsutum 3, Chrysosplenium alternifolium 2, Circaea lutetiana 1, Cirsium oleraceum +, Eupatorium cannabinum +, Fraxinus excelsior +, Galeobdolon luteum 2, Galium odoratum 1, Geranium robertianum 1, Juncus effusus r, Milium effusum 1, Petasites albus +, Primula elatior +, Pulmonaria obscura 1, Ranunculus lanuginosus +, Salvia glutinosa +, Senecio fuchsii +, Urtica dioica +, Veronica montana +',
      'Brachythecium rivulare 2, Conocephalum conicum 2, Palustriella commutata +, Plagiomnium undulatum +',
    ),
    releve(
      { area: 25, slope: 1, coverC: 100, coverD: 60, heightC: 180, unit: UNIT },
      'Aegopodium podagraria +, Carex remota 1, Carex sylvatica +, Chaerophyllum hirsutum 2, Cirsium oleraceum 3, Equisetum palustre +, Eupatorium cannabinum 4, Mentha longifolia 1, Myosotis palustris +, Petasites albus 1, Solanum dulcamara +, Urtica dioica +',
      'Brachythecium rivulare 3, Conocephalum conicum 3, Palustriella commutata +, Plagiomnium undulatum 1',
    ),
    {
      ...releve(
        { area: 30, slope: 3, coverC: 70, coverD: 15, heightC: 30, unit: `zbiorowisko Chaerophyllum hirsutum ze związku Alno-Padion, ${UNIT}` },
        'Ajuga reptans +, Alliaria officinalis +, Brachypodium sylvaticum +, Carex pendula +, Carex remota +, Carex sylvatica +, Chaerophyllum hirsutum 4, Galeobdolon luteum 1, Galium odoratum 1, Mercurialis perennis 1, Petasites albus +, Primula elatior 1, Pulmonaria obscura +, Ranunculus lanuginosus +, Sanicula europaea +, Solanum dulcamara +, Veronica montana +, Viola sylvestris +',
        'Brachythecium rivulare +, Conocephalum conicum 2, Plagiomnium undulatum 2',
      ),
      coords: COORD_END,
    },
  ],
  indicators: {
    area: {
      inputs: { choice: 'unknown', areaText: '100 m²', note: '' },
      value: '100 m²',
      grade: 'XX',
    },
    characteristic: {
      inputs: {
        species: [
          { name: 'Veronica montana', cover: 0.5 },
          { name: 'Chrysosplenium alternifolium', cover: 5 },
          { name: 'Palustriella commutata', cover: 0.5 },
        ],
        count: undefined,
        total: undefined,
        none: '',
        choice: '',
        note: CHARACTERISTIC_NOTE,
      },
      value: CHARACTERISTIC_NOTE,
      grade: 'U1',
    },
    dominant: {
      inputs: {
        species: [
          { name: 'Cirsium oleraceum', cover: 10 },
          { name: 'Eupatorium cannabinum', cover: 10 },
          { name: 'Chaerophyllum hirsutum', cover: 30 },
          { name: 'Brachythecium rivulare', cover: 15 },
          { name: 'Conocephalum conicum', cover: 10 },
        ],
        none: '',
        choice: '',
        note: DOMINANT_NOTE,
      },
      value: DOMINANT_NOTE,
      grade: 'FV',
    },
    expansive: {
      inputs: {
        species: [
          { name: 'Cirsium oleraceum', cover: 10 },
          { name: 'Eupatorium cannabinum', cover: 10 },
        ],
        total: undefined,
        none: '',
        choice: '',
        note: EXPANSIVE_NOTE,
      },
      value: EXPANSIVE_NOTE,
      grade: 'FV',
    },
    aliens: {
      inputs: { species: [], total: undefined, none: 'yes', note: 'Brak' },
      value: 'Brak',
      grade: 'FV',
    },
    eutrophic: {
      inputs: { species: [{ name: 'Eupatorium cannabinum' }, { name: 'Cirsium oleraceum' }], total: undefined, none: '', choice: '', note: EUTROPHIC_NOTE },
      value: EUTROPHIC_NOTE,
      grade: 'FV',
    },
    liverworts: {
      inputs: { species: [{ name: 'Conocephalum conicum', cover: 20 }], total: undefined, none: '', note: '' },
      value: 'Conocephalum conicum 20%',
      grade: 'FV',
    },
    process: {
      inputs: { choice: 'intense', substrate: '', conductivity: undefined, note: 'Liczne' },
      value: 'Liczne',
      grade: 'FV',
    },
    tufa: {
      inputs: { cover: undefined, abundance: 'many', tufaType: '', fossil: '', choice: '', note: 'Liczne' },
      value: 'Liczne',
      grade: 'FV',
    },
    hydration: {
      inputs: { choice: 'proper', depth1: 10, depth2: 15, depth3: 7, depth4: 15, depth5: undefined, note: HYDRATION_NOTE },
      value: HYDRATION_NOTE,
      grade: 'FV',
    },
    ...Object.fromEntries(
      ['erosionBack', 'erosionSlope', 'erosionBed', 'erosionChemical'].map((id) => [id, { inputs: { share: undefined, none: 'yes', choice: '', note: 'Brak' }, value: 'Brak', grade: 'FV' as const }]),
    ),
  },
  prospects: { value: 'Nieznane', grade: 'XX' },
  impacts: [
    {
      code: 'B02',
      name: 'Gospodarka leśna – ogólnie',
      influence: '0',
      intensity: 'L',
      description: 'Na obszarze stanowiska prowadzona jest aktualnie ekstensywna gospodarka leśna. (Kod w karcie z 2007 r.: 160 Gospodarka leśna, intensywność C.)',
    },
    {
      code: 'D01.01',
      name: 'Ścieżki, szlaki piesze, szlaki rowerowe',
      influence: '-',
      intensity: 'L',
      description:
        'Źródło położone jest bezpośrednio przy gruntowej drodze leśnej, udostępnionej także jako szlak pieszy. Intensywność penetracji jest dość duża, o czym świadczy znaczne wydeptanie zejścia do źródła. (Kod w karcie z 2007 r.: 501 Ścieżki, szlaki piesze, szlaki rowerowe, intensywność C.)',
    },
    {
      code: 'D01.02',
      name: 'Drogi, autostrady',
      influence: '-',
      intensity: 'L',
      description: 'Źródło położone jest bezpośrednio przy gruntowej drodze leśnej, wykorzystywanej w trakcie prac gospodarczych. (Kod w karcie z 2007 r.: 502 Drogi, szosy, intensywność C.)',
    },
  ],
  threats: [
    {
      code: 'H01',
      name: 'Zanieczyszczenie wód powierzchniowych (limnicznych, lądowych, morskich i słonawych)',
      description: 'Realne jest zanieczyszczenie wód potoku olejami, smarami i paliwami w przypadku awarii lub katastrofy pojazdów wykorzystywanych w gospodarce leśnej (brak kanalizacji wód).',
    },
    {
      code: 'G01.02',
      name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych',
      description: 'Udostępnienie siedliska dla celów turystycznych może także stanowić zagrożenie.',
    },
  ],
  other: {
    otherValues: 'Primula elatior (chroniona), Carex pendula – rzadka w Karpatach',
    conservation: 'Zabiegów ochronnych brak',
    proposals: 'Wprowadzenie ochrony czynnej: usuwanie roślinności heliofilnej, wzbogacenie koryta potoku w debra organiczne, zmniejszenie spływu powierzchniowego',
    monitoringRequired: 'tak',
    justification: 'Jako stanowisko referencyjne, co 5 lat',
    shareFV: 90,
    shareU1: 10,
    shareU2: 0,
    notes:
      'Rok: 2007. Typ monitoringu: szczegółowy. Dodatkowi koordynatorzy – w karcie puste. Lista gatunków charakterystycznych wg przewodnika. Współrzędne w przewodniku podane do minut, środka transektu brak. Karta łączy proces wytrącania i występowanie martwicy w jeden wiersz („Liczne” – FV). Karta podaje strukturę FV i ocenę ogólną FV przy gatunkach charakterystycznych (wskaźnik kardynalny) ocenionych na U1 – wg tab. 2 struktura to U1, więc i ocena ogólna U1. Gatunki dominujące, ekspansywne i wskazujące na eutrofizację ocenione przez eksperta na FV, choć wg progów tab. 2 wychodzi U2, U1 i U2.',
    photos: [],
  },
  overallComment: '',
}

export const examples7220: CardExample[] = [{ id: 'las-grabicz-1', label: 'Las Grabicz 1', values: lasGrabicz }]
