// Metodyka 91P0 jako dane. Źródło: Lorens B. 2010. Jodłowy bór świętokrzyski. W: Mróz W. (red.) „Monitoring siedlisk
// przyrodniczych. Przewodnik metodyczny. Część I”, GIOŚ, s. 270–283 (tab. 1 i 2), z korektą waloryzacji odnowienia
// buka przyjętą w monitoringu 2021 („Sprawozdanie z monitoringu siedliska 91P0 w roku 2021”, rozdz. 7).
// Wspólne typy, ocena i formularz są w src/7120, klocki leśne w src/forest – tu są wyłącznie dane i progi 91P0.
import type { FieldDef, Grade, IndicatorDef, Methodology } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import {
  FOREST_IMPACT_CODES,
  alienTrees,
  choiceIndicator,
  deadWoodShare,
  expansiveNatives,
  fmt,
  forestArea,
  forestReleveFields,
  forestSiteFields,
  invasiveAliens,
  loggingDamage,
  plantings,
  speciesInput,
  speciesRegeneration,
  standAge,
  standDamage,
  type GradedOption,
} from '../../forest'
import { GROUP_LABELS_91P0, SPECIES_91P0, coverOf, defaultLayer91P0, findSpecies91P0, typicalMatch } from './species'

// ---------- opcje selectów (z oceną, którą dają) ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'other', label: 'Inne kombinacje (np. niewielki ubytek, fragmentacja)', grade: 'U1' },
  { value: 'decline', label: 'Wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub literaturą', grade: 'U2' },
]

const TYPICAL: GradedOption[] = [
  { value: 'typical', label: 'Typowa, właściwa dla siedliska 91P0', grade: 'FV' },
  { value: 'reduced', label: 'Zubożona w stosunku do typowej', grade: 'U1' },
  { value: 'fragmentary', label: 'Kadłubowa', grade: 'U2' },
]

const DEAD_WOOD: GradedOption[] = [
  { value: 'high', label: 'Ponad 10% zasobności drzewostanu', grade: 'FV' },
  { value: 'mid', label: '3–10% zasobności drzewostanu', grade: 'U1' },
  { value: 'low', label: 'Poniżej 3% zasobności drzewostanu', grade: 'U2' },
]

const WHOLE_TREES = [
  { value: 'yes', label: 'Tak, są całe martwe drzewa (leżące pnie, złomy, wywroty, stojące susze)' },
  { value: 'no', label: 'Nie, tylko gałęzie, pniaki, drobnica' },
]

const PLANTINGS: GradedOption[] = [
  { value: 'none', label: 'Brak nasadzeń lub zgodne z typowym składem boru jodłowego', grade: 'FV' },
  { value: 'few', label: 'Nieliczne nasadzenia gatunków niezgodnych z typowym składem', grade: 'U1' },
  { value: 'many', label: 'Liczne nasadzenia gatunków niezgodnych z typowym składem', grade: 'U2' },
]

const DAMAGE: GradedOption[] = [
  { value: 'none', label: 'Brak lub sporadyczne (poniżej 3% zasobności)', grade: 'FV' },
  { value: 'some', label: 'Niewielkie, 3–5% zasobności', grade: 'U1' },
  { value: 'strong', label: 'Wyraźne, ponad 5% zasobności', grade: 'U2' },
]

// ---------- progi tab. 2 ----------

type Cover = { count: number; total?: number }
const byTotal = (onEmpty: Grade, g: (t: number) => Grade) => ({ count, total }: Cover): Grade | null =>
  count === 0 ? onEmpty : total === undefined ? null : g(total)

const gradeInvasive = byTotal('FV', (t) => (t <= 1 ? 'FV' : t <= 5 ? 'U1' : 'U2'))
const gradeExpansive = byTotal('FV', (t) => (t < 25 ? 'FV' : t <= 50 ? 'U1' : 'U2'))
const gradeAlienTrees = byTotal('FV', (t) => (t === 0 ? 'FV' : t <= 10 ? 'U1' : 'U2'))
const gradeFir = byTotal('U2', (t) => (t > 5 ? 'FV' : t > 0 ? 'U1' : 'U2'))
const gradeBeech = byTotal('FV', (t) => (t < 25 ? 'FV' : t <= 50 ? 'U1' : 'U2'))
const gradeDeadWood = (v: number): Grade => (v > 10 ? 'FV' : v >= 3 ? 'U1' : 'U2')
const gradeDamage = (v: number): Grade => (v < 3 ? 'FV' : v <= 5 ? 'U1' : 'U2')

/**
 * Martwe drewno 91P0: % zasobności (wspólny preset) + „czy są całe martwe drzewa” + liczba leżących pni >20 cm.
 * Same gałęzie i pniaki nie „odpowiadają jakościowo strukturze drzewostanu”, więc podpowiedź to U2 (interpretacja tab. 2).
 */
function deadWood91P0(o: Parameters<typeof deadWoodShare>[0]): IndicatorDef {
  const base = deadWoodShare(o)
  return {
    ...base,
    inputs: [
      ...base.inputs,
      {
        kind: 'select',
        name: 'wholeTrees',
        label: 'Czy są całe martwe drzewa?',
        options: WHOLE_TREES,
        help: 'Przewodnik wymaga przy FV i U1, żeby martwe drewno „odpowiadało jakościowo strukturze drzewostanu”: były całe martwe drzewa, a nie tylko gałęzie. Same gałęzie i pniaki – formularz podpowiada U2.',
      },
      {
        kind: 'number',
        name: 'logs',
        label: 'Leżące pnie o średnicy >20 cm na transekcie',
        unit: 'szt.',
        min: 0,
        help: 'Liczba leżących pni drzew o średnicy ponad 20 cm w obrębie transektu (200×10 m). Pole opcjonalne, służy dokumentacji.',
      },
    ],
    suggest: (i, ctx) => (i.wholeTrees === 'no' ? 'U2' : (base.suggest?.(i, ctx) ?? null)),
    explain: (i) => (i.wholeTrees === 'no' ? 'Tylko gałęzie i pniaki – martwe drewno nie odpowiada jakościowo strukturze drzewostanu.' : null),
    describe: (i, ctx) => {
      const logs = num(i.logs)
      return [
        base.describe?.(i, ctx) ?? '',
        i.wholeTrees === 'no' ? 'głównie gałęzie i pniaki' : '',
        logs === undefined ? '' : `leżących pni >20 cm: ${logs}`,
      ]
        .filter(Boolean)
        .join(', ')
    },
  }
}

const COORD_HELP = (where: string) =>
  `Współrzędne geograficzne ${where} transektu z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie, np. stopnie-minuty-sekundy z N/E. Gdy transekt nie jest linią prostą, podaj punkty, w których zaczyna się, zmienia kierunek i kończy.

Dlaczego: transekt trzeba odnaleźć i powtórzyć za kilka lat. W tych samych trzech punktach (początek, środek, koniec) wykonuje się zdjęcia fitosocjologiczne 10×10 m.`

export const methodology91P0: Methodology = {
  code: '91P0',
  name: 'Jodłowy bór świętokrzyski (Abietetum polonicum)',
  source:
    'Lorens B. 2010. Jodłowy bór świętokrzyski. W: Mróz W. (red.) Monitoring siedlisk przyrodniczych. Przewodnik metodyczny. Cz. I, GIOŚ, s. 270–283 (tab. 1 i 2), z waloryzacją odnowienia buka wg monitoringu 2021',

  siteFields: forestSiteFields({
    code: '91P0',
    transect: '200x10 m',
    releveArea: 100,
    dateWindow: (iso) => {
      const month = Number(iso.split('-')[1])
      return month === 7 || month === 8
        ? null
        : 'Termin poza przełomem lipca i sierpnia. Skład runa w zdjęciach fitosocjologicznych może być niepełny.'
    },
    overrides: {
      siteName: {
        placeholder: 'np. Stanowisko nr 1 Stary Lipowiec',
        help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Łysogóry – Święty Krzyż”. Jeśli stanowisko jest już w bazie GIOŚ, przepisz nazwę co do znaku.

Dlaczego: bory jodłowe monitoruje się co kilka lat (cykle 2006–2008, 2013–2014, 2021). Stała nazwa razem z GUID pozwala zestawić kolejne karty i zobaczyć trend.`,
      },
      communities: {
        placeholder: 'np. Abietetum polonicum typicum',
        help: `Zbiorowisko na transekcie, nazwą fitosocjologiczną: Abietetum polonicum (wyżynny jodłowy bór mieszany). Jeśli rozpoznajesz podzespół, dopisz go: typicum (typowy, z wariantem z sosną), circaeetosum (żyzny, wilgotny) albo vaccinietosum (ubogi, z borówką). Zaznacz też fragmenty innych zbiorowisk w płacie (np. grąd Tilio-Carpinetum abietetosum, buczyna Dentario glandulosae-Fagetum).

Dlaczego: najżyźniejsze płaty przechodzą w grąd (9170) lub żyzną buczynę karpacką (9130), najuboższe w bory sosnowe i mieszane z jodłą. Podzespół mówi, czego się spodziewać w runie.`,
      },
      description: {
        hint: 'Położenie, rzeźba (zbocze, dolina, wierzchowina), drzewostan i jego historia, runo, mszaki, sąsiednie siedliska.',
        help: `Syntetyczny opis stanowiska w kilku zdaniach:
• gdzie leży płat i co go otacza (inne lasy, łąki, drogi);
• rzeźba: wierzchowina, zbocze z ekspozycją, dno doliny – od tego zależy żyzność i wilgotność;
• drzewostan: udział jodły, świerka, buka, sosny, wiek, piętrowość, ślady gospodarki (np. sosnowe monokultury z jodłą pod okapem);
• runo i mszaki: czy dominują gatunki borowe (borówka czarna, rokietnik), mezotroficzne (szczawik, paprocie), czy grądowe;
• kto zarządza terenem (nadleśnictwo, park narodowy, lasy prywatne).

Dlaczego: opis pozwala kolejnemu obserwatorowi zrozumieć przyczyny zmian i odróżnić bór jodłowy od grądu, buczyny lub boru mieszanego.`,
      },
      areaHa: {
        help: `Łączna powierzchnia płatu (lub płatów) siedliska 91P0, w którym leży transekt, w hektarach. Nie powierzchnia transektu (0,2 ha) ani całego kompleksu leśnego. Najlepiej z GIS (mapa leśna, ortofotomapa, Bank Danych o Lasach) albo z operatu urządzeniowego.

Dlaczego: zmiana powierzchni płatu między cyklami monitoringu to podstawa parametru „Powierzchnia siedliska”.`,
      },
      coordStart: { placeholder: '50° 51\' 32" N 21° 03\' 18" E', help: COORD_HELP('początku') },
      coordMiddle: { help: COORD_HELP('środka') },
      coordEnd: { help: COORD_HELP('końca') },
      transect: {
        help: `Faktyczne wymiary transektu. Standard to pas 200×10 m. Transekt zwykle jest linią prostą, ale gdy płat ma nieregularny kształt, może być łamany (np. w rogach kwadratu o boku 100 m) – opisz wtedy jego przebieg.

Dlaczego: pokrycia gatunków i odnowień liczy się w procentach powierzchni transektu. Bez znanych wymiarów wyniki z różnych lat są nieporównywalne.`,
      },
      altitude: {
        placeholder: 'np. 198–200',
        help: `Wysokość nad poziomem morza w metrach, z GPS albo mapy. Na zboczach i w dolinach podaj zakres.

Dlaczego: bór jodłowy rośnie od dolin Roztocza (ok. 200 m) po stoki Łysogór (ponad 500 m). Wysokość i położenie na zboczu wpływają na żyzność i wilgotność płatu.`,
      },
      date: {
        placeholder: 'DD.MM.RRRR, np. 16.08.2021',
        hint: 'Optymalnie przełom lipca i sierpnia.',
        help: `Dzień obserwacji w terenie. Optymalny termin to pełnia sezonu wegetacyjnego, czyli przełom lipca i sierpnia. W żyźniejszych płatach może rosnąć zawilec gajowy – wtedy potrzebna jest dodatkowa wizyta wiosną.

Dlaczego: późnym latem i jesienią w zdjęciach fitosocjologicznych brakuje geofitów, a paprocie i borówki zaczynają zamierać. Ocena stanu prawie nie korzysta ze zdjęć, ale ich skład gatunkowy porównuje się między cyklami.`,
      },
    },
  }),

  releves: {
    defaultCount: 3,
    intro:
      'Metodyka przewiduje trzy zdjęcia fitosocjologiczne 10×10 m (100 m²): na początku, w środku i na końcu transektu, w skali Braun-Blanqueta. Gdy transekt ma nietypowy kształt, zdjęcia można rozmieścić inaczej, dlatego ich liczbę możesz zmieniać.',
    fields: forestReleveFields({
      area: 100,
      helps: {
        coverA: 'Warstwa A – drzewostan: procent powierzchni zdjęcia przykryty koronami drzew. Gdy drzewostan ma kilka pięter (a1 sosna, a2–a3 jodła), podaj zwarcie łączne, a podwarstwy z wysokościami dopisz w jednostce fitosocjologicznej.\n\nDlaczego: jodła potrzebuje zwartego, cienistego drzewostanu. Silne prześwietlenie sprzyja borówce, jeżynom i trzcinnikom.',
        coverB: 'Warstwa B – podszyt i podrost: młode jodły, świerki i buki, jarząb, kruszyna, bez koralowy, leszczyna.\n\nDlaczego: w warstwie B widać odnowienie jodły (właściwe) i ekspansję buka (konkurencja dla jodły).',
        coverC: 'Warstwa C – runo: rośliny zielne, krzewinki, paprocie i siewki drzew (także siewki jodły).\n\nDlaczego: skład runa odróżnia bór jodłowy od boru sosnowego (pszeniec, brusznica) i od grądu (kopytnik, przytulia wonna).',
        coverD: 'Warstwa D – mszysta: mchy, wątrobowce i porosty naziemne.\n\nDlaczego: w borze jodłowym mszaki są ważnym składnikiem runa (płonnik strojny, rokietnik, tujowiec, gajnik). Bielistka i chrobotki wskazują na ubogą, borową postać.',
        unit: 'Zespół albo podzespół, do którego należy zdjęcie, np. „Abietetum polonicum typicum”. Tu dopisz podwarstwy drzewostanu, np. „a1 30% 27 m, a2 20% 19 m, a3 80% 12 m”.\n\nDlaczego: łączy zdjęcie z opisem zbiorowisk stanowiska i pozwala śledzić przechodzenie płatu w grąd, buczynę albo bór mieszany.',
      },
    }),
  },

  indicators: [
    forestArea({
      options: AREA,
      inputLabel: 'Jak zmienia się powierzchnia?',
      inputHelp: 'Wybierz kierunek zmiany powierzchni płatu.',
      label: 'Powierzchnia siedliska na stanowisku',
      description: 'Zmiana powierzchni płatu w porównaniu z wcześniejszymi badaniami lub danymi z literatury.',
      help: `Co wybrać: jak zmieniła się powierzchnia płatu 91P0 od poprzedniej obserwacji. W polu wartości podaj powierzchnię (np. „Ok. 4 ha”) i źródło porównania.

Przy pierwszej obserwacji, bez danych do porównania, wybierz „nie podlega zmianom” albo oceń XX i napisz to w opisie.

Dlaczego: przewodnik ocenia wyłącznie trend. W 2021 r. 99% stanowisk miało tu FV – dawne obniżone oceny były raczej przeniesieniem złego stanu struktury na powierzchnię, czego robić nie należy.`,
      thresholds: {
        FV: 'Nie podlega zmianom lub zwiększa się',
        U1: 'Inne kombinacje',
        U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze',
      },
    }),
    {
      ...choiceIndicator({
        id: 'typical',
        label: 'Charakterystyczna kombinacja florystyczna',
        parameter: 'structure',
        cardinal: true,
        description:
          'Gatunki charakterystyczne i dominujące w warstwach A, B, C, D, tworzące typową dla regionu kombinację florystyczną boru jodłowego.',
        help: `Co wpisać: gatunki charakterystyczne i dominujące w każdej warstwie (A drzewostan, B podszyt, C runo, D mszaki) z pokryciem transektu w %. Ocenę wybierz w selekcie:
• FV – kombinacja typowa: dominuje jodła (z domieszką świerka, buka, sosny), w runie szczawik, borówka czarna, konwalijka, turzyca palczasta, paprocie (nerecznice, zachyłki, wietlica), w mszakach płonnik strojny, rokietnik, tujowiec;
• U1 – zubożona w stosunku do typowej (brak części grup, np. paproci lub mszaków, albo udział jodły niewielki);
• U2 – kadłubowa (pojedyncze gatunki boru jodłowego).

Formularz liczy, ile gatunków o najwyższej frekwencji z przewodnika jest na liście, i ostrzega, gdy brakuje jodły albo pojawiają się gatunki grądowe (kopytnik, przytulia wonna, miodunka ćma, przytulia Schultesa) – to sygnał, że płat może należeć do 9170 lub 9130. Pszeniec zwyczajny i borówka brusznica wskazują na najuboższą postać, bliską borom sosnowym.

Dlaczego: zespół nie ma własnych gatunków charakterystycznych, wyróżnia go dominacja jodły z udziałem gatunków borowych, mezotroficznych i kilku górskich. Wskaźnik kardynalny.`,
        thresholds: {
          FV: 'Typowa, właściwa dla siedliska 91P0',
          U1: 'Zubożona w stosunku do typowej',
          U2: 'Kadłubowa',
        },
        options: TYPICAL,
        inputLabel: 'Kombinacja florystyczna',
        inputHelp: 'Wybierz opis najbliższy temu, co widać na transekcie. Pełne wyjaśnienie jest pod „?” przy nazwie wskaźnika.',
        before: [
          speciesInput(
            'Gatunki charakterystyczne i dominujące',
            'Gatunki typowe i dominanty warstw z pokryciem w % transektu. Warstwę możesz dopisać w opisie („Warstwa A: Abies alba 40%”).',
            true,
          ),
        ],
      }),
      explain: (i) => {
        const rows = speciesRows(i.species)
        if (!rows.some((r) => r.name?.trim())) return null
        const t = typicalMatch(rows)
        const fir = coverOf(rows, 'Abies alba')
        return [
          `Gatunki o najwyższej frekwencji w Abietetum polonicum: ${t.present.length} z ${t.total}.`,
          t.hasFir ? `Jodła: ${fmt(fir)}.` : 'Brak jodły na liście.',
          t.pineForest.length ? `Gatunki borów sosnowych: ${t.pineForest.join(', ')}.` : '',
        ]
          .filter(Boolean)
          .join(' ')
      },
      warn: (i) => {
        const rows = speciesRows(i.species)
        if (!rows.some((r) => r.name?.trim())) return null
        const t = typicalMatch(rows)
        if (t.fertile.length)
          return `Na liście są gatunki grądów i buczyn (${t.fertile.join(', ')}) – sprawdź, czy płat to nie grąd (9170) lub żyzna buczyna (9130).`
        if (i.choice === 'typical' && !t.hasFir) return 'Wybrano „typowa”, a na liście nie ma jodły – w borze jodłowym jodła dominuje w drzewostanie.'
        return null
      },
      describe: (i) => describeSpecies(speciesRows(i.species)),
    },
    invasiveAliens({
      cardinal: false,
      inputLabel: 'Obce gatunki inwazyjne',
      inputHelp: 'Gatunki obce geograficznie we wszystkich warstwach, z pokryciem w % transektu. Brak – zostaw pustą listę.',
      grade: gradeInvasive,
      label: 'Obce gatunki inwazyjne',
      description:
        'Gatunki obce geograficznie we wszystkich warstwach: najczęściej czeremcha amerykańska i dąb czerwony (drzewa, krzewy) oraz niecierpek drobnokwiatowy (runo).',
      help: `Co wpisać: każdy gatunek obcy geograficznie na transekcie z pokryciem w %. W borach jodłowych najczęściej: czeremcha amerykańska Padus serotina, dąb czerwony Quercus rubra, niecierpek drobnokwiatowy Impatiens parviflora, rzadziej nawłoć późna, przymiotno białe, erechtites, daglezja. Brak – zostaw pustą listę.

Progi (tab. 2): łączne pokrycie do 1% (brak lub sporadycznie) – FV, 1–5% – U1, ponad 5% – U2.

Dlaczego: niecierpek i czeremcha wkraczają po prześwietleniu drzewostanu i wzdłuż dróg, wypierając rodzime runo i odnowienie jodły. Wskaźnik pomocniczy.`,
      thresholds: {
        FV: 'Brak lub sporadycznie, o łącznym pokryciu nieprzekraczającym 1%',
        U1: 'Sporadycznie, łączne pokrycie 1–5%',
        U2: 'Łączne pokrycie >5%',
      },
    }),
    expansiveNatives({
      inputLabel: 'Rodzime gatunki ekspansywne',
      grade: gradeExpansive,
      label: 'Rodzime gatunki ekspansywne roślin zielnych',
      cardinal: true,
      description:
        'Gatunki rodzime tworzące zwarte łany w prześwietlonych drzewostanach: zwykle jeżyna gruczołowata i malina, także trzcinniki i orlica.',
      help: `Co wpisać: rodzime gatunki ekspansywne z pokryciem w %: jeżyna gruczołowata Rubus hirtus, malina Rubus idaeus, inne jeżyny, trzcinnik piaskowy Calamagrostis epigejos, trzcinnik owłosiony Calamagrostis villosa (zagrożenie w Górach Świętokrzyskich), orlica Pteridium aquilinum. Gatunków obcych tu nie wpisuj – mają swój wskaźnik.

Progi (tab. 2): łączne pokrycie poniżej 25% – FV, 25–50% – U1, ponad 50% – U2.

Dlaczego: zwarte łany jeżyn i trzcinników w prześwietlonym drzewostanie zubażają runo i blokują odnowienie jodły. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'Brak lub występują spoza listy gatunków typowej kombinacji florystycznej z pokryciem <25%',
        U1: 'Występują z pokryciem 25–50%',
        U2: 'Występują z pokryciem >50%',
      },
    }),
    deadWood91P0({
      id: 'deadWood',
      label: 'Obecność martwego drewna',
      cardinal: true,
      description:
        'Zasoby martwego drewna jako procent zasobności drzewostanu, z liczbą leżących pni o średnicy ponad 20 cm.',
      help: `Co wpisać:
• udział martwego drewna (leżącego i stojącego) w zasobności drzewostanu, w % – oszacuj na transekcie, zasobność drzewostanu weź z Banku Danych o Lasach lub opisu taksacyjnego;
• czy są całe martwe drzewa, a nie tylko gałęzie i pniaki – przewodnik wymaga tego przy FV i U1;
• opcjonalnie liczbę leżących pni o średnicy ponad 20 cm na transekcie.

Progi (tab. 2): ponad 10% zasobności – FV, 3–10% – U1, poniżej 3% – U2. Gdy są tylko gałęzie i pniaki, formularz podpowiada U2 (martwe drewno nie odpowiada jakościowo strukturze drzewostanu – interpretacja).

Dlaczego: martwe drewno to podstawa różnorodności grzybów, mszaków i bezkręgowców. W 2021 r. ten wskaźnik najczęściej obniżał ocenę struktury (36% stanowisk z U2). W cyklu 2013–2014 traktowano go jako pomocniczy, ale w 2021 r. wrócono do zapisu przewodnika: wskaźnik kardynalny.`,
      thresholds: {
        FV: 'Odpowiada jakościowo strukturze drzewostanu, a ilościowo przekracza 10% zasobności drzewostanu',
        U1: 'Odpowiada jakościowo strukturze drzewostanu, a ilościowo 3–10% zasobności drzewostanu',
        U2: 'Zasoby martwego drewna mniejsze niż 3% zasobności drzewostanu',
      },
      options: DEAD_WOOD,
      inputLabel: 'Udział martwego drewna',
      inputHelp: 'Klasa udziału w zasobności drzewostanu. Gdy znasz procent, wpisz go poniżej – ma pierwszeństwo.',
      fieldLabel: 'Udział w zasobności drzewostanu (jeśli szacowany)',
      fieldHelp: 'Martwe drewno jako procent zasobności (miąższości) drzewostanu. Pole opcjonalne – ma pierwszeństwo przed klasą wybraną wyżej.',
      grade: gradeDeadWood,
    }),
    standAge({
      label: 'Wiek drzewostanu',
      description: 'Średni wiek drzewostanu oraz wiek i udział starodrzewu (egzemplarze ponad 100-letnie).',
      help: `Co wpisać: udział (objętościowy) drzew starszych niż 100 lat i starszych niż 50 lat, średni wiek drzewostanu i wiek jodeł. Dane są w Banku Danych o Lasach albo operacie urządzeniowym. Gdy wpiszesz liczby, ocena liczy się z nich; inaczej wybierz klasę.

Progi (tab. 2): ponad 20% drzew starszych niż 100 lat – FV; poniżej 20% drzew >100 lat, ale ponad 50% drzew >50 lat – U1; poniżej 20% drzew >100 lat i poniżej 50% drzew >50 lat – U2.

Dlaczego: stary, zróżnicowany wiekowo drzewostan to warunek trwałości boru jodłowego. Wycinanie starodrzewu jodłowego to jedno z głównych zagrożeń. Wskaźnik pomocniczy.`,
      thresholds: {
        FV: '>20% udział objętości drzew starszych niż 100 lat',
        U1: '<20% udział drzew starszych niż 100 lat, ale >50% udział drzew starszych niż 50 lat',
        U2: '<20% udział drzew starszych niż 100 lat, <50% udział drzew starszych niż 50 lat',
      },
    }),
    alienTrees({
      inputHelp: 'Gatunki drzew spoza typowego składu, z udziałem w drzewostanie w %. Brak – zostaw pustą listę.',
      grade: gradeAlienTrees,
      describe: (i) => describeSpecies(speciesRows(i.species)) || 'Nie stwierdzono',
      label: 'Gatunki obce w drzewostanie',
      description:
        'Gatunki drzew spoza typowej kombinacji florystycznej, np. dąb czerwony, czeremcha amerykańska, modrzew.',
      help: `Co wpisać: gatunki drzew spoza typowego składu boru jodłowego z udziałem w drzewostanie w %. Najczęściej dąb czerwony Quercus rubra, rzadko czeremcha amerykańska Padus serotina (częściej w podszycie), daglezja; w 2021 r. jako obce zaliczono też modrzew europejski i osikę. Brak – zostaw pustą listę.

Progi (tab. 2): brak – FV, z pokryciem 5–10% – U1, ponad 10% – U2. Udział poniżej 5% formularz traktuje jak U1 (każda obecność wyklucza FV – interpretacja zgodna ze sprawozdaniem 2021).

Dlaczego: gospodarka leśna w borach jodłowych zwykle trzyma się składu zgodnego z siedliskiem, więc obce drzewa to rzadkość i wyraźny sygnał. Wskaźnik pomocniczy.`,
      thresholds: {
        FV: 'Brak',
        U1: 'Spoza listy gatunków typowej kombinacji florystycznej – występujące z pokryciem 5–10%',
        U2: 'Spoza listy gatunków typowej kombinacji florystycznej – występujące z pokryciem >10%',
      },
    }),
    speciesRegeneration({
      id: 'firRegeneration',
      inputLabel: 'Odnowienie jodły',
      inputHelp: 'Wpisz jodłę pospolitą Abies alba z procentem powierzchni transektu zajętym przez jej odnowienie (nalot, podrost). Brak odnowienia – zostaw pustą listę.',
      grade: gradeFir,
      label: 'Naturalne odnowienia jodły',
      cardinal: true,
      description: 'Procent powierzchni transektu zajętej przez odnowienie jodły (nalot, podrost).',
      help: `Co wpisać: procent powierzchni transektu zajętej przez naturalne odnowienie jodły (siewki, nalot, podrost), w rzucie pionowym. Gdy nie szacowałeś procentu, wybierz klasę. W opisie dodaj, czy odnowienie jest równomierne i zróżnicowane wiekowo, i czy nie ogranicza go buk albo zgryzanie.

Progi (tab. 2): zwarcie ponad 5% – FV, poniżej 5% – U1, brak lub sporadyczne – U2.

Dlaczego: jodła po kryzysie z lat 80. odnawia się dynamicznie, a jej odnowienie decyduje o przyszłości boru jodłowego. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'Występują, osiągając zwarcie >5%',
        U1: 'Występują, osiągając zwarcie <5%',
        U2: 'Brak lub sporadyczne',
      },
    }),
    speciesRegeneration({
      id: 'beechRegeneration',
      inputLabel: 'Odnowienie buka',
      inputHelp: 'Wpisz buka zwyczajnego Fagus sylvatica z procentem powierzchni transektu zajętym przez jego odnowienie. Brak odnowienia – zostaw pustą listę.',
      grade: gradeBeech,
      label: 'Naturalne odnowienia buka',
      description: 'Procent powierzchni transektu zajętej przez odnowienie buka – im więcej, tym silniejsza konkurencja dla jodły.',
      help: `Co wpisać: procent powierzchni transektu zajętej przez odnowienie buka (nalot, podrost). Brak odnowienia – wpisz 0.

Progi: poniżej 25% (także brak) – FV, 25–50% – U1, ponad 50% – U2. To waloryzacja z monitoringu 2021: wcześniej brak odnowienia buka dawał U2, ale buk w borze jodłowym jest tylko domieszką i z natury go brak w uboższych płatach (np. Abietetum polonicum vaccinietosum) i na granicy zasięgu, więc wskaźnik informuje wyłącznie o nadmiernej ekspansji buka.

Dlaczego: na Roztoczu i w Lasach Suchedniowskich buk bywa ekspansywny i ogranicza młode pokolenie jodły. Wskaźnik pomocniczy.`,
      thresholds: {
        FV: 'Występują, osiągając zwarcie <25%, lub brak',
        U1: 'Występują, osiągając zwarcie 25–50%',
        U2: 'Występują, osiągając zwarcie >50%',
      },
    }),
    plantings({
      options: PLANTINGS,
      inputHelp: 'Wybierz opis najbliższy temu, co widać na stanowisku.',
      label: 'Obecność nasadzeń drzew',
      description: 'Nasadzenia gatunków drzew niezgodnych ze składem gatunkowym boru jodłowego.',
      help: `Co wybrać: czy na stanowisku są nasadzenia drzew, a jeśli tak – czy zgodne ze składem boru jodłowego (jodła, świerk, buk, sosna). W opisie wymień gatunki z pokryciem transektu w % i miejsce (np. „na obrzeżach stanowiska”).

Dlaczego: Lasy Państwowe zwykle protegują jodłę i sadzą gatunki zgodne z siedliskiem, ale dawniej na siedliskach boru jodłowego zakładano monokultury sosnowe. Wskaźnik pomocniczy.`,
      thresholds: {
        FV: 'Brak nasadzeń lub zgodne z typowym składem gatunkowym dla boru jodłowego',
        U1: 'Spotykane nieliczne nasadzenia gatunków niezgodnych z typowym składem florystycznym dla boru jodłowego',
        U2: 'Spotykane liczne nasadzenia gatunków niezgodnych z typowym składem florystycznym dla boru jodłowego',
      },
    }),
    loggingDamage({
      label: 'Zniszczenia runa i gleby związane z pozyskaniem drewna',
      description:
        'Ślady zrywki, uszkodzenia pozostałych drzew, zaśmiecenie po pracach leśnych. Liczy się naruszenie runa, gleby, podszytu i martwego drewna, nie sam fakt pozyskania.',
      help: `Co wybrać: jak bardzo prace leśne naruszyły runo, glebę, podszyt, podrost i zasoby martwego drewna. Patrz na koleiny po zrywce, uszkodzone drzewa i odnowienia jodły, pozostałości po pracach. Same pniaki to jeszcze nie zniszczenie. W opisie podaj, czego dotyczy pozyskanie i jak intensywne było.

Dlaczego: zrywka niszczy odnowienie jodły i runo, a nadmierne przerzedzenie odsłania dno lasu, co sprzyja borówce i jeżynom. Wskaźnik pomocniczy.`,
      thresholds: {
        FV: 'Brak',
        U1: 'Nieliczne ślady, naruszony <1% powierzchni terenu, liczby drzew',
        U2: 'Znaczące, obejmujące >1% powierzchni terenu, liczby drzew itp.',
      },
    }),
    standDamage({
      options: DAMAGE,
      inputLabel: 'Klasa zniszczeń',
      fieldLabel: 'Zniszczona zasobność (jeśli szacowana)',
      fieldHelp: 'Procent zasobności drzewostanu zniszczony przez wiatr, śnieg lub owady. Opcjonalne – ma pierwszeństwo przed klasą.',
      grade: gradeDamage,
      label: 'Zniszczenia drzewostanów, np. na skutek wiatrołomów lub gradacji owadów',
      description: 'Rodzaj i procent zniszczonego drzewostanu: zwójki jodłowe, okiść śniegowa, silne wiatry.',
      help: `Co wpisać: procent zniszczonej zasobności drzewostanu (w dziesiątkach procent, a poniżej 10% dokładniej). Gdy nie szacowałeś procentu, wybierz klasę. W opisie podaj rodzaj zniszczeń: zwójki jodłowe, okiść śniegowa, wiatrołomy, zamieranie jodeł.

Progi (tab. 2): brak lub sporadyczne (poniżej 3% zasobności) – FV, 3–5% – U1, ponad 5% – U2.

Dlaczego: duże zniszczenia otwierają drzewostan, a jodła źle znosi nagłe odsłonięcie. Wskaźnik pomocniczy.`,
      thresholds: {
        FV: 'Brak lub sporadyczne (<3% zasobności drzewostanu)',
        U1: 'Niewielkie, 3–5% zasobności drzewostanu',
        U2: 'Wyraźne, >5% zasobności drzewostanu',
      },
    }),
  ],

  prospects: {
    description:
      'Realne możliwości zachowania właściwego stanu siedliska lub poprawy stanu niewłaściwego, z informacją o potrzebnych zabiegach ochronnych.',
    help: `Co wpisać: ekspercką ocenę przyszłości płatu i potencjalne zabiegi ochronne. Zwróć uwagę na:
• gospodarkę leśną – czy protegowana jest jodła, czy pozyskanie jest umiarkowane, czy usuwa się starodrzew jodłowy;
• stopniowe usuwanie sosny nad odnowieniem jodły (nagłe odsłonięcie szkodzi młodym jodłom);
• ekspansję buka (Roztocze, Lasy Suchedniowskie) i trzcinnika owłosionego (Góry Świętokrzyskie);
• pozostawianie martwego drewna.

Perspektywy borów jodłowych są zwykle pomyślne (w 2021 r. 85% stanowisk FV). W najlepiej zachowanych płatach wystarcza ochrona bierna.

Dlaczego: perspektywy to osobny parametr oceny ogólnej.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  // Kody leśne ze wspólnej listy + kody ze sprawozdania 2013–2014 dla 91P0 (odpady, hałas, pasożytnictwo – jemioła).
  impactCodes: [
    ...FOREST_IMPACT_CODES,
    { code: 'E03', name: 'Pozbywanie się odpadów' },
    { code: 'E03.01', name: 'Pozbywanie się odpadów z gospodarstw domowych' },
    { code: 'H06.01', name: 'Uciążliwy hałas' },
    { code: 'K03.02', name: 'Pasożytnictwo' },
  ].sort((x, y) => x.code.localeCompare(y.code)),

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. sąsiedztwo grądów (9170) i buczyn (9130), chronione gatunki, starodrzew.',
        help: `Wartości przyrodnicze stanowiska poza samym siedliskiem 91P0: rzadkie i chronione gatunki (np. widłaki, wroniec), stare drzewa, sąsiedztwo innych siedlisk (grądy 9170, buczyny 9130, bory mieszane). Brak – „Nie stwierdzono”.

Dlaczego: bór jodłowy często tworzy kompleks z grądami i buczynami. Planując ochronę, trzeba wiedzieć, co jeszcze się na nich odbije.`,
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: `Jakie zabiegi ochronne wykonano i jak skutecznie, oraz propozycje działań: protegowanie odnowienia jodły, stopniowe usuwanie sosny i podrostu buka, pozostawianie martwego drewna (np. 10–15% martwych drzew), ograniczenie wycinki starodrzewu, usuwanie czeremchy amerykańskiej. Brak działań – „Brak”.

Dlaczego: monitoring ma odpowiedzieć, czy gospodarka i ochrona służą siedlisku. Bez tej informacji nie da się odróżnić naturalnych zmian od skutków zabiegów.`,
      }
    return f
  }),

  speciesCatalog: SPECIES_91P0.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer91P0(s) })),
  speciesInfo: (name) => {
    const e = findSpecies91P0(name)
    return e ? GROUP_LABELS_91P0[e.group] : undefined
  },
}
