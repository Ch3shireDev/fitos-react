// Przykłady z kart RDOŚ we Wrocławiu (PZO dla PLH020050): PLH020050_6510_02.xlsx i PLH020050_6510_06.xlsx.
// Teksty i oceny przepisane z arkuszy; obserwatorzy zanonimizowani (Jan Kowalski), także w nazwach plików zdjęć.
// Odstępstwa od arkuszy:
// • arkusze nie mają zdjęć fitosocjologicznych (pusty arkusz) – w przykładach też ich nie ma;
// • listy gatunków rozpisane na wiersze z pokryciem („<1%” = 0,5), a „wartość lub opis” przepisana z arkusza;
// • intensywność oddziaływań w skali A/B/C zapisana jako H/M/L (A = H, B = M, C = L) – eksport .xlsx zamienia z powrotem;
// • „Szacunkowy średni koszt…” stał we wzorze w kolumnie „nr rekordu z warstwy działań” – tu przeniesiony do uwag działania;
// • cel działania monitoringu („obserwacja zmian w obrębie siedliska”) spoza słownika – zastąpiony słownikowym
//   „Nie dotyczy - np. w przypadku monitoringu”;
// • w 02 arkusz miał zepsuty wiersz oddziaływania (#REF!) – pominięty; zagrożenie „X” (brak zagrożeń, p) zostaje.
import { emptyCardValues } from '../../7120/habitats/assessment'
import type { CardValues, InputValues } from '../../7120/habitats/types'
import type { CardExample } from '../../7120/components/habitat-form/HabitatCardForm'
import { RDOS_TERM_DEFAULT, impactName, refKeys } from '../../rdos/fields'
import { methodology6510 } from './methodology'

const T = RDOS_TERM_DEFAULT
const sp = (...rows: [string, number][]) => rows.map(([name, cover]) => ({ name, cover }))

type Ref = [grade: string, value?: string, term?: string, reason?: string]
const refs = (r: Record<string, Ref>): InputValues =>
  Object.fromEntries(
    Object.entries(r).flatMap(([id, [grade, value = '', term = T, reason = '']]) => {
      const k = refKeys(id)
      return [
        [k.grade, grade],
        [k.value, value],
        [k.term, term],
        [k.reason, reason],
      ]
    }),
  )

const MOWING_ACTION = {
  type: 'Ochrona czynna',
  kind: 'prowadzenie na terenie siedlisk przyrodniczych ekstensywnego użytkowania kośnego z usunięciem biomasy lub/i wypasu',
  character: 'obligatoryjne',
  description: 'coroczne ekstensywne koszenie, prowadzone po 15 czerwca oraz usuwanie pozyskanej w tej sposób biomasy poza siedlisko',
  term: 'co roku w terminie po 15 czerwca',
  responsible:
    'Właściciele lub posiadacze obszaru na podstawie umowy zawartej z organem sprawującym nadzór nad obszarem Natura 2000 albo na podstawie zobowiązania podjętego w związku z korzystaniem z programów wsparcia z tytułu utraty dochodowości.',
  notes: 'Szacunkowy średni koszt wykonania działań 5000 zł/ha/rok',
  area: '',
}

const MONITORING_ACTION = {
  type: 'Monitoring stanu przedmiotów ochrony',
  kind: 'realizacja monitoringu zaplanowanego w ramach Planów Zadań Ochronnych',
  goal: 'Nie dotyczy - np. w przypadku monitoringu',
  character: 'obligatoryjne',
  description: 'Monitoring siedliska przyrodniczego 6510 na założonym stanowisku zgodnie z metodyką stosowaną w Państwowym Monitoringu Środowiska.',
  term: 'Co 3-5 lat',
  responsible: 'RDOŚ we Wrocławiu',
  notes: 'Szacunkowy średni koszt wykonania działań 1000 zł/stanowisko',
  area: '',
}

const photos = (code: string) => [
  { caption: `${code}_1_Kowalski -   zdjęcie fitosocjologiczne nr 1` },
  { caption: `${code}_2_Kowalski -   zdjęcie fitosocjologiczne nr 2` },
  { caption: `${code}_3_Kowalski -   zdjęcie fitosocjologiczne nr 3` },
  { caption: `${code}_4_Kowalski -   widok ogólny stanowiska` },
]

function card02(): CardValues {
  const v = emptyCardValues(methodology6510)
  v.site = {
    ...v.site,
    siteName: 'PLH020050_6510_02',
    community: 'Arrhenatheretum elatioris',
    localVariant: '',
    areaHa: 0.66,
    transect: '20 x 100 m',
    date: '2025-05-08',
    datesExtra: '',
    n2kCode: 'PLH020050',
    n2kName: '',
    description:
      'Płat łąki świeżej zlokalizowany pomiędzy korytem rzeki a drogą asfaltową, w obrębie łagodnie nachylonej skarpy. Obejmuje on górną terasę zalewową rzeki oraz przylegające do niej wyniesienie mineralne. Zróżnicowanie mikrorzeźby terenu przekłada się na wewnętrzne zróżnicowanie składu florystycznego. W niżej położonej części płatu, związanej z terasą zalewową, dominują Alopecurus pratensis oraz Rumex acetosa. W części północnej, usytuowanej wyżej, na wyniesieniu mineralnym, wyraźnie wzrasta udział Festuca rubra i Luzula multiflora. Łąka jest regularnie koszona z przeznaczeniem biomasy na paszę dla bydła.',
    history:
      'Brak szczegółowych danych dotyczących stanu zachowania siedliska przyrodniczego 6510 na badanym stanowisku w przeszłości - brak szczegółowej dokumentacji w dotychczasowych ekspertyzach.',
    observer: 'Jan Kowalski',
  }
  v.releves = []
  const ind = v.indicators
  ind.area = {
    inputs: { choice: 'clear' },
    value: '0,66 ha\npowierzchnia zmniejszyła się z ok. 1,35 ha w wyniku zaniechania użytkowania na części płatu',
    grade: 'U2',
  }
  ind.percent = { inputs: { share: 100 }, value: '100%', grade: 'FV' }
  ind.characteristic = {
    inputs: { species: sp(['Arrhenatherum elatius', 0.5], ['Campanula patula', 0.5], ['Poa pratensis', 15], ['Festuca rubra', 2], ['Rumex thyrsiflorus', 2]) },
    value: 'Arrhenatherum elatius <1%,\nCampanula patula <1%,\nPoa pratensis 15%,\nFestuca rubra 2%,\nRumex thyrsiflorus 2%',
    grade: 'FV',
  }
  ind.dominant = {
    inputs: { species: sp(['Alopecurus pratensis', 30], ['Poa pratensis', 15], ['Rumex thyrsiflorus', 20]) },
    value: 'Dominują gatunki typowe dla siedliska:\nAlopecurus pratensis 30%\nPoa pratensis 15%,\nRumex thyrsiflorus 20%',
    grade: 'FV',
  }
  ind.invasive = { inputs: { species: sp(['Solidago canadensis', 0.5]) }, value: 'Solidago canadensis <1%', grade: 'U1' }
  ind.expansive = { inputs: { species: [] }, value: 'Brak', grade: 'FV' }
  ind.shrubs = { inputs: { species: [], total: undefined }, value: 'Brak', grade: 'FV' }
  ind.wellPreserved = { inputs: { share: 100 }, value: '100%', grade: 'FV' }
  ind.litter = { inputs: { min: undefined, max: undefined, mean: undefined }, value: '<2 cm', grade: 'FV' }
  ind.spatial = { inputs: { choice: 'none' }, value: 'Brak fragmentacji.', grade: 'FV' }
  v.prospects = { value: 'Dobre. Powierzchnia systematycznie koszona.', grade: 'FV' }
  v.impacts = [
    {
      code: 'A03',
      name: impactName('A03'),
      influence: '+',
      intensity: 'H',
      description:
        'Regularne koszenie, przynajmniej raz w roku, pozytywnie wpływa na utrzymanie stanu siedliska, zapobiega jego zarastaniu przez krzewy i drzewa, ogranicza rozwój gatunków inwazyjnych i ekspansywnych.',
    },
    {
      code: 'I01',
      name: impactName('I01'),
      influence: '-',
      intensity: 'L',
      description: 'Pojedyncze osobniki Solidago canadensis w marginalnym stopniu oddziałują na roślinność typową dla siedliska.',
    },
  ]
  v.threats = [{ code: 'X', name: impactName('X'), description: '' }]
  v.other = {
    ...v.other,
    conservation: 'Regularne koszenie utrzymuje siedlisko, zapobiega zarastaniu przez krzewy i podrost drzew, zapobiega nadmiernemu rozwojowi gatunków ekspansywnych.',
    otherValues: 'Nie stwierdzono',
    alienSpecies: 'Solidago canadensis',
    photos: photos('PLH020050_6510_02'),
    notes: 'GUID z dokumentacji PZO {3af00084-2eb6-44f3-bdf3-41514ae7da62}',
    ...refs({
      area: ['FV', 'przywrócenie użytkowania na dotychczas niekoszonej części łąki', '2-3 lata od momentu przywrócenia użytkowania'],
      percent: ['FV', '100%'],
      characteristic: ['FV'],
      dominant: ['FV', 'Dominują gatunki typowe dla łąk świeżych.'],
      invasive: [
        'U1',
        'Pojedyncze osobniki gatunków inwazyjnych o wysokim stopniu inwazyjności.',
        T,
        'Brak możliwości zaplanowania działań ochronnych dających pewność całkowitej eliminacji gatunków inwazyjnych. Regularne koszenie powinno zapobiec ekspansji.',
      ],
      expansive: ['FV', 'Brak gatunków silnie ekspansywnych, łączne pokrycie gatunków ekspansywnych poniżej 20%.'],
      shrubs: ['FV', 'Brak'],
      wellPreserved: ['FV', '100%'],
      litter: ['FV', '<2 cm'],
      spatial: ['FV', 'Brak fragmentacji lub fragmentacja nieznaczna.'],
      prospects: ['FV', 'Perspektywy ochrony dobre, powierzchnia regularnie, ekstensywnie użytkowana.'],
    }),
    actions: [{ ...MOWING_ACTION, goal: 'Poprawa stanu zachowania ze złego na właściwy' }, MONITORING_ACTION],
  }
  return v
}

function card06(): CardValues {
  const v = emptyCardValues(methodology6510)
  v.site = {
    ...v.site,
    siteName: 'PLH020050_6510_06',
    community: 'Poa pratensis-Festuca rubra',
    localVariant: '',
    areaHa: 2.63,
    transect: '10 x 200 m',
    date: '2025-05-10',
    datesExtra: '',
    n2kCode: 'PLH020050',
    n2kName: '',
    description:
      'Łąka wykształcona na podłożu mineralnym, położona nad brzegiem Kwisy, w obrębie terasy zalewowej ukształtowanej przez dawne starorzecze, obecnie najprawdopodobniej pozostającej poza zasięgiem regularnych wylewów. Płat przylega do odcinka rzeki zlokalizowanego pomiędzy dwoma progami wodnymi. Łąka użytkowana jest w ramach wariantu 4.7 PRŚK, co wiąże się z pozostawianiem części powierzchni niekoszonej. Występuje w mozaice z innymi typami łąk, których zróżnicowanie wynika z mikrorzeźby terenu; fragmenty położone niżej wykazują cechy zbliżone do łąk wilgotnych. W runie dominują Festuca rubra, Alopecurus pratensis, Calamagrostis epigejos oraz Tanacetum vulgare. Zagrożenie stanowi obecność gatunków ekspansywnych i inwazyjnych, w szczególności Solidago gigantea.',
    history: 'Płat nie wykazany w poprzednich ekspertyzach.',
    observer: 'Jan Kowalski',
  }
  v.releves = []
  const ind = v.indicators
  ind.area = { inputs: { choice: 'unknown' }, value: '2,63 ha\nBrak danych porównawczych', grade: 'XX' }
  ind.percent = { inputs: { share: 100 }, value: '100%', grade: 'FV' }
  ind.characteristic = {
    inputs: {
      species: sp(['Poa pratensis', 10], ['Festuca rubra', 40], ['Rumex thyrsiflorus', 5], ['Campanula patula', 0.5], ['Galium mollugo', 0.5], ['Tragopogon pratensis', 0.5]),
    },
    value: 'Poa pratensis 10%,\nFestuca rubra 40%,\nRumex thyrsiflorus 5%,\nCampanula patula <1%, Galium mollugo <1%,\nTragopogon pratensis <1%',
    grade: 'FV',
  }
  ind.dominant = {
    inputs: { species: sp(['Alopecurus pratensis', 20], ['Poa pratensis', 10], ['Festuca rubra', 40], ['Calamagrostis epigejos', 20], ['Tanacetum vulgare', 15]) },
    value:
      'Dominują gatunki typowe dla siedliska. Oprócz nich wśród dominantów pojawia się gatunek inwazyjny:\nAlopecurus pratensis 20%\nPoa pratensis 10%,\nFestuca rubra 40%,\nCalamagrostis epigejos 20%,\nTanacetum vulgare 15%',
    grade: 'U2',
  }
  ind.invasive = { inputs: { species: sp(['Solidago gigantea', 1], ['Prunus serotina', 1]) }, value: 'Solidago gigantea 1%, Prunus serotina 1%', grade: 'U1' }
  ind.expansive = { inputs: { species: sp(['Calamagrostis epigejos', 20], ['Tanacetum vulgare', 15]) }, value: 'Calamagrostis epigejos 20%,\nTanacetum vulgare 15%', grade: 'U2' }
  ind.shrubs = { inputs: { species: [], total: 0.5 }, value: '<1%', grade: 'FV' }
  ind.wellPreserved = { inputs: { share: 40 }, value: '40%', grade: 'U2' }
  ind.litter = { inputs: { min: 2, max: 5, mean: undefined }, value: '2- 5 cm', grade: 'U1' }
  ind.spatial = { inputs: { choice: 'none' }, value: 'Brak fragmentacji.', grade: 'FV' }
  v.prospects = { value: 'Dobre, łąka ekstensywnie użytkowana. Nie przewiduje się jej zaniku w perspektywie 10 lat.', grade: 'FV' }
  v.impacts = [
    {
      code: 'A03',
      name: impactName('A03'),
      influence: '+',
      intensity: 'L',
      description:
        'Regularne koszenie, przynajmniej raz w roku, pozytywnie wpływa na utrzymanie stanu siedliska, zapobiega jego zarastaniu przez krzewy i drzewa, ogranicza rozwój gatunków inwazyjnych i ekspansywnych.',
    },
    { code: 'I01', name: impactName('I01'), influence: '-', intensity: 'L', description: 'W płacie występuje Solidago gigantea i Prunus serotina' },
    { code: 'I02', name: impactName('I02'), influence: '-', intensity: 'H', description: 'Współdominacja Calamagrostis epigejos i Tanacetum vulgare' },
    {
      code: 'A03.03',
      name: impactName('A03.03'),
      influence: '-',
      intensity: 'L',
      description: 'Łąka użytkowana jest w ramach wariantu 4.7 PRŚK, co wiąże się z pozostawianiem części powierzchni niekoszonej. ',
    },
  ]
  v.threats = []
  const birds = 'Łąka jest regularnie koszona, a mimo to ekspansja występuje. Nie można zwiększyć intensywności koszenia ze względu na ochronę ptaków.'
  v.other = {
    ...v.other,
    conservation: 'łąka użytkowana w ramach Wariantu 4.7 PRŚK',
    otherValues: 'Nie stwierdzono',
    alienSpecies: 'Solidago gigantea',
    photos: photos('PLH020050_6510_06'),
    notes: 'Brak',
    ...refs({
      area: ['FV', 'zachowanie powierzchni na obecnym poziomie'],
      percent: ['FV', '100%'],
      characteristic: ['FV'],
      dominant: ['U2', 'Wśród dominantów obecne gatunki ekspansywne, ale ich łączne pokrycie <50%', T, birds],
      invasive: [
        'U1',
        'Pojedyncze osobniki gatunków inwazyjnych o wysokim stopniu inwazyjności.',
        T,
        'Brak możliwości zaplanowania działań ochronnych dających pewność całkowitej eliminacji gatunków obcych geograficznie. Regularne koszenie powinno zapobiec ekspansji.',
      ],
      expansive: ['U2', 'Wśród dominantów obecne gatunki ekspansywne, ich łączne pokrycie wynosi ok 35%', T, birds],
      shrubs: ['FV', 'Brak'],
      wellPreserved: ['U2', '40%', T, birds],
      litter: ['FV', '<2 cm'],
      spatial: ['FV', 'Brak fragmentacji lub fragmentacja nieznaczna.'],
      prospects: ['FV', 'Perspektywy ochrony dobre, powierzchnia regularnie, ekstensywnie użytkowana.'],
    }),
    actions: [{ ...MOWING_ACTION, goal: 'Utrzymanie złego stanu zachowania' }, MONITORING_ACTION],
  }
  return v
}

export const plh020050_6510_02 = card02()
export const plh020050_6510_06 = card06()

export const examples6510: CardExample[] = [
  { id: 'PLH020050_6510_02', label: 'PLH020050_6510_02', values: plh020050_6510_02 },
  { id: 'PLH020050_6510_06', label: 'PLH020050_6510_06', values: plh020050_6510_06 },
]
