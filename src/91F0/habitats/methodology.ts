// Metodyka *91F0 jako dane. Źródło: P. Pawlaczyk 2012, „Łęgowe lasy dębowo-wiązowo-jesionowe (Ficario-Ulmetum)”,
// w: W. Mróz (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. III, GIOŚ, s. 292–315 (tab. 1 i 2),
// oraz sprawozdanie z monitoringu 91F0 w 2024 r. (18 wskaźników struktury, martwe drewno w m³/ha).
// Wspólne typy, logika ocen i komponenty formularza leżą w src/7120, wspólne klocki leśne w src/forest – tu są wyłącznie dane 91F0.
import { isIsoDate } from '../../7120/habitats/dates'
import type { FieldDef, Grade, IndicatorContext, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import {
  byOption,
  choiceIndicator,
  ecoAlienTrees,
  fmt,
  forestArea,
  forestReleveFields,
  geoAlienTrees,
  keySpecies,
  labelOf,
  listCover,
  loggingDamage,
  otherDistortions,
  pct,
  pickField,
  plNum,
  selectInput,
  speciesCoverIndicator,
  speciesInput,
  standAge,
  verticalStructure,
  type GradedOption,
} from '../../forest'
import {
  GROUP_LABELS_91F0,
  SPECIES_91F0,
  defaultLayer91F0,
  distinctSpecies,
  elmOakAshSpecies,
  findSpecies91F0,
  rowsOfGroups,
} from './species'

const dec = plNum

/** Lista gatunków: liczba, suma i największe pokrycie (największe – do progu „facjalnej dominacji”). */
function coverStats(i: InputValues) {
  const base = listCover(i)
  const covers = speciesRows(i.species)
    .filter((r) => r.name?.trim())
    .map((r) => num(r.cover))
    .filter((v): v is number => v !== undefined)
  return { ...base, max: covers.length ? Math.max(...covers) : undefined }
}

const COORD_HELP = (where: string) =>
  `Współrzędne geograficzne ${where} osi transektu, odczytane z odbiornika GPS (układ WGS84). Trzymaj jeden format w całej karcie, najlepiej stopnie-minuty-sekundy z oznaczeniem N/E.

Dlaczego: transekt ma zostać odnaleziony i powtórzony w tym samym miejscu za 3–6 lat. W jego obrębie (zwykle na początku, w środku i na końcu) wykonuje się trzy zdjęcia fitosocjologiczne po 100 m².`

const pick = (fields: FieldDef[], name: string) => pickField(fields, name)

// ---------- postać łęgu ----------

export const FORM_OPTIONS: SelectOption[] = [
  { value: 'valley', label: 'Łęg w dolinie dużej rzeki (zalewowy, na madach)' },
  { value: 'offValley', label: 'Łęg poza dolinami (śledziennicowy, przepływowe wody gruntowe)' },
  { value: 'atypical', label: 'Postać nietypowa lub przejściowa (np. łęgowo-grądowa, Astrantio-Fraxinetum)' },
]

export const formOf = (site: InputValues | undefined) => {
  const v = site?.form
  return typeof v === 'string' && FORM_OPTIONS.some((o) => o.value === v) ? v : undefined
}

/** Stosunki wodne są kardynalne tylko dla typowych postaci Ficario-Ulmetum. Bez wybranej postaci – kardynalne. */
const hydrologyCardinal = (ctx?: IndicatorContext) => formOf(ctx?.site) !== 'atypical'

// ---------- opcje selektów (kolejność: FV, U1, U2) ----------

const AREA_TREND: GradedOption[] = [
  { value: 'stable', label: 'Nie zmniejsza się, nie jest antropogenicznie pofragmentowana', grade: 'FV' },
  { value: 'slow', label: 'Powolny trend spadkowy lub antropogeniczna fragmentacja', grade: 'U1' },
  { value: 'fast', label: 'Szybki trend spadkowy lub silna antropogeniczna fragmentacja', grade: 'U2' },
]

const FLORISTIC: GradedOption[] = [
  { value: 'typical', label: 'Typowa, właściwa dla siedliska (z uwzględnieniem specyfiki regionalnej)', grade: 'FV' },
  { value: 'impoverished', label: 'Zubożona w stosunku do typowej dla siedliska w regionie', grade: 'U1' },
  { value: 'fragmentary', label: 'Kadłubowa', grade: 'U2' },
]

const DOMINANCE: GradedOption[] = [
  { value: 'natural', label: 'We wszystkich warstwach dominują gatunki typowe, stosunki ilościowe naturalne', grade: 'FV' },
  { value: 'disturbed', label: 'Dominują gatunki typowe, ale relacje ilościowe są zaburzone', grade: 'U1' },
  { value: 'foreign', label: 'W co najmniej jednej warstwie dominuje gatunek obcy dla naturalnego łęgu', grade: 'U2' },
]

const MIN_DIAMETER: SelectOption[] = [
  { value: '50', label: '> 50 cm (standard)' },
  { value: '30', label: '> 30 cm (drzewa z natury nie dorastają do 50 cm)' },
]

const REGENERATION: GradedOption[] = [
  { value: 'abundant', label: 'Tak, ponad 2 gatunki, obfite, reagujące na luki i prześwietlenia', grade: 'FV' },
  { value: 'limited', label: 'Tak, pojedyncze lub ograniczone do jednego gatunku', grade: 'U1' },
  { value: 'none', label: 'Brak', grade: 'U2' },
]

const VERTICAL: GradedOption[] = [
  { value: 'diverse', label: 'Zróżnicowana; ponad 70% powierzchni pokryte zwartym drzewostanem, ale obecne luki i prześwietlenia', grade: 'FV' },
  { value: 'partly', label: 'Jednolity stary drzewostan albo struktura zróżnicowana ze zwartym starym drzewostanem na 30–70% powierzchni', grade: 'U1' },
  { value: 'uniform', label: 'Jednolite odnowienia albo struktura zróżnicowana z fragmentami starego drzewostanu na mniej niż 30% powierzchni', grade: 'U2' },
]

const GRAD: GradedOption[] = [
  { value: 'none', label: 'Brak lub nieznaczne', grade: 'FV' },
  { value: 'clear', label: 'Wyraźne', grade: 'U1' },
  { value: 'advanced', label: 'Silnie zaawansowane', grade: 'U2' },
]

const APOPHYTES: GradedOption[] = [
  { value: 'single', label: 'Co najwyżej pojedynczo', grade: 'FV' },
  { value: 'raised', label: 'Udział podwyższony, lecz nie bardzo ekspansywne', grade: 'U1' },
  { value: 'strong', label: 'Silnie ekspansywne', grade: 'U2' },
]

const HYDROLOGY: GradedOption[] = [
  { value: 'natural', label: 'Zalewy rzeczne co najmniej raz na kilka lat (poza dolinami: naturalne warunki wilgotnościowe)', grade: 'FV' },
  { value: 'altered', label: 'Zalewy wyjątkowe, zastępowane przesiąkami lub stagnowaniem wody opadowej; uwilgotnienie niewiele odbiega od naturalnego', grade: 'U1' },
  { value: 'dry', label: 'Brak zalewów wodami rzecznymi i objawy przesuszenia', grade: 'U2' },
]

const LOGGING: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'single', label: 'Pojedyncze ślady', grade: 'U1' },
  { value: 'many', label: 'Liczne ślady', grade: 'U2' },
]

const DISTORTIONS: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'minor', label: 'Występują, lecz mało znaczące', grade: 'U1' },
  { value: 'strong', label: 'Silne', grade: 'U2' },
]

const KEY_SPECIES: GradedOption[] = [
  { value: 'all', label: 'Stan wszystkich takich gatunków właściwy (FV)', grade: 'FV' },
  { value: 'someU1', label: 'Stan niektórych niezadowalający (U1)', grade: 'U1' },
  { value: 'someU2', label: 'Stan niektórych zły (U2)', grade: 'U2' },
  { value: 'noData', label: 'Brak danych', grade: 'XX' },
]

// ---------- progi liczbowe (tab. 2) ----------

export const gradeElmOakAsh = (n: number): Grade => (n >= 3 ? 'FV' : n === 2 ? 'U1' : 'U2')
export const gradeShrubs = (n: number): Grade => (n >= 4 ? 'FV' : n >= 2 ? 'U1' : 'U2')
export const gradeDeadWoodVolume = (m3: number): Grade => (m3 > 20 ? 'FV' : m3 >= 10 ? 'U1' : 'U2')
export const gradeDeadWoodShare = (p: number): Grade => (p > 10 ? 'FV' : p >= 3 ? 'U1' : 'U2')
export const gradeLargeDeadWood = (perHa: number): Grade => (perHa > 5 ? 'FV' : perHa >= 3 ? 'U1' : 'U2')

/** Wiek drzewostanu z progiem 10% drzew >100 lat – baza do dopisania pola „wiek w latach”. */
const AGE_BASE = standAge({ old100: 10 })

const DOMINANT_RED_FLAGS = new Set(['tree-eco-alien', 'tree-geo-alien', 'invasive', 'expansive', 'tree-grad'])

export const methodology91F0: Methodology = {
  code: '91F0',
  priority: true,
  name: 'Łęgowe lasy dębowo-wiązowo-jesionowe (Ficario-Ulmetum)',
  source:
    'GIOŚ, Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. III, rozdz. 91F0 (P. Pawlaczyk 2012, tab. 1 i 2), oraz sprawozdanie z monitoringu 91F0 w 2024 r.',

  siteFields: [
    {
      kind: 'text',
      name: 'siteName',
      label: 'Nazwa stanowiska',
      required: true,
      placeholder: 'np. Bukowy Las Górki 2',
      help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Bukowy Las Górki 2”. Jeśli stanowisko już istnieje w bazie GIOŚ, przepisz nazwę co do znaku.

Dlaczego: obserwacje powtarza się co 3–6 lat. Stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty i zobaczyć trend.`,
    },
    pick(methodology7120.siteFields, 'guid'),
    {
      kind: 'select',
      name: 'form',
      label: 'Postać łęgu',
      options: FORM_OPTIONS,
      required: true,
      hint: 'Od postaci zależy, czy „Stosunki wodno-wilgotnościowe” są wskaźnikiem kardynalnym.',
      help: `Wybierz postać, do której należy płat na transekcie:
• łęg w dolinie dużej rzeki – na madach, na terasach zalewanych epizodycznie (nie co roku); podstawowym czynnikiem są okresowe zalewy rzeczne;
• łęg poza dolinami – tzw. łęg śledziennicowy w dolinkach małych cieków, wilgotnych zagłębieniach, rynnach i wąwozach, na czarnych ziemiach; kształtuje go ruch wód gruntowych, bez zalewów;
• postać nietypowa lub przejściowa – np. przejście łęgowo-grądowe, Astrantio-Fraxinetum z Przedgórza Sudeckiego i Górnego Śląska, łęg przyjeziorny.

Dlaczego: przewodnik uznaje „Stosunki wodno-wilgotnościowe” za wskaźnik kardynalny tylko dla typowych postaci Ficario-Ulmetum. Postać mówi też, czego oczekiwać: brak zalewów w łęgu, który nigdy nie był zalewany, to nie zniekształcenie.`,
    },
    {
      kind: 'text',
      name: 'communities',
      label: 'Zbiorowiska roślinne',
      required: true,
      hint: 'Np. Ficario-Ulmetum minoris.',
      help: `Zbiorowiska roślinne faktycznie występujące na transekcie, nazwami fitosocjologicznymi. Dla 91F0 to Ficario-Ulmetum minoris (łęg wiązowo-jesionowy, podzwiązek Ulmenion minoris, związek Alno-Ulmion), w tym regionalny Astrantio-Fraxinetum. Postać przejściową zaznacz wprost (np. „Ficario-Ulmetum, postać zgrądowiała”).

Dlaczego: zespół wyznacza punkt odniesienia dla oceny. Przejścia do grądów (9160, 9170) i łęgów olszowo-jesionowych (91E0) bywają płynne – nazwa zbiorowiska pokazuje, co faktycznie oceniasz.`,
    },
    {
      kind: 'textarea',
      name: 'description',
      label: 'Opis siedliska na stanowisku',
      rows: 10,
      required: true,
      hint: 'Położenie względem rzeki i wałów, warunki wodne, drzewostan, runo, sąsiedztwo grądów.',
      help: `Syntetyczny opis stanowiska w kilku zdaniach:
• położenie: dolina rzeki czy poza nią, odległość od koryta, wały przeciwpowodziowe, starorzecza;
• warunki wodne: czy bywa zalewany, czy woda przepływa, czy są objawy przesuszenia;
• drzewostan: dąb, jesion, wiązy, ich udział i wiek, zamieranie jesionu;
• krzewy i runo: geofity wiosenne, gatunki grądowe, gatunki obce (np. niecierpek drobnokwiatowy);
• w jakim kompleksie leży płat (grądy, buczyny, łęgi olszowo-jesionowe).

Dlaczego: łęgi odcięte od zalewów brunatnieją i „grądowieją”. Opis pokazuje, czy płat jest nadal łęgiem, i pozwala następnemu obserwatorowi zrozumieć przyczyny zmian.`,
    },
    {
      kind: 'number',
      name: 'areaHa',
      label: 'Powierzchnia płatu siedliska',
      unit: 'ha',
      min: 0,
      required: true,
      help: `Powierzchnia płatu 91F0 na stanowisku, w hektarach. Nie powierzchnia transektu (0,2 ha) ani całego kompleksu leśnego. Minimalna wielkość stanowiska monitorowanego to 0,2 ha. Najlepiej z GIS albo mapy leśnej – pamiętaj, że wiele łęgów leży poza gruntami Lasów Państwowych i ich identyfikacja w danych leśnych bywa błędna.

Dlaczego: zmiana powierzchni płatu między obserwacjami to podstawa parametru „Powierzchnia siedliska”.`,
      warn: (v) => {
        const n = num(v)
        return n !== undefined && n < 0.2 ? 'Płat mniejszy niż 0,2 ha – przewodnik uznaje 0,2 ha za minimalną wielkość stanowiska.' : null
      },
    },
    pick(methodology7120.siteFields, 'protectedAreas'),
    {
      kind: 'text',
      name: 'manager',
      label: 'Zarządzający terenem',
      placeholder: 'np. Nadleśnictwo Karnieszewice',
      help: `Kto zarządza terenem stanowiska: nadleśnictwo (z leśnictwem i numerem wydzielenia, jeśli znasz), park narodowy, gmina, właściciel prywatny.

Dlaczego: od zarządcy zależy gospodarka w płacie, a perspektywy ochrony łęgów w dużej mierze wynikają z zapisów planu urządzenia lasu i z tego, czy płat formalnie jest lasem.`,
    },
    {
      kind: 'text',
      name: 'coordStart',
      group: 'Współrzędne geograficzne',
      wide: true,
      label: 'Początek transektu',
      required: true,
      placeholder: '54° 13\' 4,1" N 16° 9\' 2,3" E',
      help: COORD_HELP('początku'),
    },
    { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', required: true, help: COORD_HELP('środka') },
    { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', required: true, help: COORD_HELP('końca') },
    {
      kind: 'text',
      name: 'transect',
      label: 'Wymiary transektu',
      defaultValue: '200x10 m',
      required: true,
      hint: 'Standard to 200×10 m.',
      help: `Faktyczne wymiary transektu. Standard to pas 200×10 m (0,2 ha) z trzema zdjęciami fitosocjologicznymi po 100 m². Gdy taki transekt nie mieści się w płacie, zmień wymiary przy zachowaniu powierzchni i wpisz faktyczne.

Dlaczego: wszystkie pokrycia (%) i liczby sztuk na hektar liczy się względem powierzchni transektu. Bez znanych wymiarów wyniki z różnych lat są nieporównywalne.`,
    },
    {
      kind: 'text',
      name: 'altitude',
      label: 'Wysokość n.p.m.',
      unit: 'm n.p.m.',
      placeholder: 'np. 35',
      required: true,
      help: `Wysokość nad poziomem morza w metrach, z GPS albo mapy. Przy różnicy wysokości na transekcie podaj zakres.

Dlaczego: kontekst geograficzny. 91F0 to siedlisko niżowe – na przedgórzach pojawia się postać z jarzmianką i olszą szarą.`,
    },
    {
      kind: 'date',
      name: 'date',
      label: 'Data obserwacji',
      placeholder: 'DD.MM.RRRR, np. 24.06.2025',
      required: true,
      hint: 'Optymalnie maj (aspekt wiosenny) i lipiec–sierpień; przy jednej wizycie czerwiec lub początek lipca.',
      help: `Dzień obserwacji w terenie. Termin zależy przede wszystkim od dostępności terenu (braku zalewu). Optymalnie robi się dwie obserwacje: aspekt wczesnowiosenny (maj) i letni (lipiec–sierpień). Jedna wizyta w czerwcu lub na początku lipca uchwyci, choć nie idealnie, oba aspekty. Wczesną jesienią ocena stanu jest jeszcze możliwa, ale pokrycia części gatunków będą zaniżone, a geofitów wiosennych już nie zobaczysz.

Dlaczego: runo łęgu ma silną zmienność sezonową. Badanie powtarza się co najmniej raz na 5–6 lat, optymalnie co 3 lata, w podobnym terminie.`,
      warn: (v) => {
        if (!isIsoDate(v)) return null
        const m = Number(v.split('-')[1])
        if (m >= 5 && m <= 8) return null
        if (m === 9) return 'Wczesna jesień: stan ochrony da się ocenić, ale geofity wiosenne są już niewidoczne, a pokrycia części gatunków zaniżone.'
        return 'Termin poza sezonem (maj–sierpień). Runo łęgu może być nie do oceny.'
      },
    },
    pick(methodology7120.siteFields, 'observer'),
  ],

  releves: {
    defaultCount: 3,
    intro:
      'Metodyka przewiduje trzy zdjęcia fitosocjologiczne w obrębie transektu, każde o powierzchni 100 m² (np. 10×10 m), w skali Braun-Blanqueta. Gdy płat ma nietypowy kształt, zdjęcia można rozmieścić inaczej, dlatego ich liczbę możesz zmieniać.',
    fields: forestReleveFields({
      area: 100,
      helps: {
        coords: 'Współrzędne GPS środka powierzchni zdjęcia (100 m², np. 10×10 m). Zdjęcia robi się zwykle na początku, w środku i na końcu transektu.\n\nDlaczego: zdjęcia powtarza się dokładnie w tych samych miejscach – to najdokładniejszy zapis zmian roślinności.',
        coverA: 'Warstwa A – drzewostan. Procent powierzchni zdjęcia przykryty koronami drzew, w rzucie pionowym. W dobrze wykształconym łęgu zwarcie jest umiarkowane (ok. 50–60%), drzewostan dwu- lub trzywarstwowy.\n\nDlaczego: zwarcie i skład drzewostanu pokazują, czy płat ma naturalną strukturę, czy jest litą, równowiekową dębiną albo luką po zamarłych jesionach.',
        coverB: 'Warstwa B – podszyt i podrost: dereń, szakłak, głogi, trzmielina, czeremcha, bez czarny, kalina, leszczyna, podrost wiązów i jesionu.\n\nDlaczego: bujna, wielogatunkowa warstwa krzewów to cecha naturalnego łęgu, zwłaszcza zalewanego.',
        coverC: 'Warstwa C – runo: geofity wiosenne (ziarnopłon, zawilce, złoć), byliny letnie (czyściec leśny, podagrycznik, pokrzywa), siewki drzew.\n\nDlaczego: w runie najlepiej widać kierunek zmian – udział gatunków grądowych i obcych (niecierpek drobnokwiatowy) albo ekspansję jeżyn.',
        coverD: 'Warstwa D – mszysta: w łęgach zwykle słabo rozwinięta (żurawiec, merzyki, krótkosz, dzióbkowiec).\n\nDlaczego: warstwa mszysta uzupełnia obraz struktury płatu i bywa siedliskiem rzadkich mszaków.',
        unit: 'Zespół albo zbiorowisko, do którego należy zdjęcie, np. „Ficario-Ulmetum minoris” albo „Ficario-Ulmetum, postać zgrądowiała”.\n\nDlaczego: łączy zdjęcie z opisem zbiorowisk stanowiska i pozwala śledzić, czy płat przechodzi w grąd.',
        ...Object.fromEntries(
          methodology7120.releves.fields
            .filter((f) => f.name.startsWith('height'))
            .map((f) => [f.name, `${String(f.help).split('\n')[0]}\n\nDlaczego: wysokości warstw opisują strukturę pionową – w naturalnym łęgu drzewostan ma dwie–trzy warstwy, a dąb i jesion dorastają do 40 m.`]),
        ),
      },
    }),
  },

  indicators: [
    forestArea({
      options: AREA_TREND,
      inputHelp: 'Wybierz kierunek zmiany. Pułapka z naturalną mozaiką łęgów jest opisana pod „?” przy nazwie wskaźnika.',
      label: 'Powierzchnia siedliska na stanowisku',
      description:
        'Trend zmian powierzchni (np. utrata łęgów przez grądowienie) i antropogeniczna fragmentacja: użytkowanie rolnicze, zręby, wycinki w międzywalu, groble, drogi.',
      help: `Co wybrać: jak zmienia się powierzchnia płatu 91F0 i czy jest on pocięty przez człowieka – użytkowanie rolnicze części potencjalnego łęgu, zręby, wycinki drzew w międzywalu w celach przeciwpowodziowych, groble, drogi.

Pułapka: nie oceniaj jako fragmentacji płatów rozdzielonych korytem rzeki, starorzeczami albo będących naturalnie małymi elementami mozaiki łęgów wierzbowych, olszowych, wiązowo-jesionowych i grądów.

Przy pierwszej obserwacji, bez danych do porównania, wybierz stan na podstawie map i ortofotomap albo oceń XX i opisz to w polu wartości.`,
      thresholds: {
        FV: 'Nie zmniejsza się, nie jest antropogenicznie pofragmentowana',
        U1: 'Wykazuje powolny trend spadkowy lub jest antropogenicznie pofragmentowana',
        U2: 'Wykazuje szybki trend spadkowy lub jest silnie antropogenicznie pofragmentowana',
      },
    }),
    {
      id: 'floristic',
      label: 'Charakterystyczna kombinacja florystyczna runa',
      parameter: 'structure',
      cardinal: true,
      description:
        'Odkształcenie składu runa od typowej kompozycji najlepiej zachowanych łęgów w obszarze. Ocenia się charakter całej kompozycji, nie liczbę gatunków.',
      help: `Co wpisać: gatunki runa stwierdzone na transekcie (z pokryciem) i ocenę, na ile cała kompozycja odbiega od typowej dla łęgu w danym obszarze.

Typowe runo to byliny żyznych siedlisk z bogatym aspektem wiosennym: ziarnopłon wiosenny, złoć żółta, zawilce, piżmaczek, kokorycze, miodunka ćma, czworolist. Latem: czyściec leśny, czartawa, niecierpek pospolity, kostrzewa olbrzymia, jeżyna popielica, skrzyp zimowy, czosnaczek, kuklik, bluszczyk, przytulia czepna, jasnota plamista, podagrycznik, trędownik, pokrzywa, prosownica, turzyca leśna. W łęgu śledziennicowym (poza dolinami): śledziennica skrętolistna, kopytnik, gwiazdnica gajowa, szczyr trwały, pępawa błotna, kuklik zwisły, turzyca rzadkokłosa.

Pułapki:
• nie ma ogólnokrajowego wzorca – porównuj z najlepiej zachowanymi łęgami w obszarze i w podobnym położeniu;
• łęgi mają z natury otwartą, zmienną kompozycję – za właściwą uznaj każdą kombinację, która nie jest wyraźnie zniekształcona przez człowieka;
• naturalna reakcja runa na lokalne uwilgotnienie to nie zniekształcenie.

Formularz policzy gatunki typowe i grądowe z listy, ale ocenę wybierasz sam – przewodnik wprost odradza liczenie gatunków.

Dlaczego: runo najszybciej reaguje na zmianę warunków wodnych i gospodarkę. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'Typowa, właściwa dla siedliska (z uwzględnieniem specyfiki regionalnej)',
        U1: 'Zubożona w stosunku do typowej dla siedliska w regionie',
        U2: 'Kadłubowa',
      },
      inputs: [
        speciesInput('Gatunki runa na transekcie', 'Gatunki runa (warstwa C) z pokryciem w % transektu: typowe łęgowe, ale też grądowe i obce – całość pokazuje odkształcenie kompozycji.'),
        selectInput('Jak wygląda kompozycja runa?', FLORISTIC),
      ],
      suggest: byOption({ typical: 'FV', impoverished: 'U1', fragmentary: 'U2' }),
      explain: (i) => {
        const rows = speciesRows(i.species)
        if (!rows.some((r) => r.name?.trim())) return null
        const typical = rowsOfGroups(rows, ['char', 'key'])
        const grad = rowsOfGroups(rows, ['grad'])
        return `Gatunki typowe dla runa łęgu: ${typical.names.length}${typical.names.length ? ` (${typical.names.join(', ')})` : ''}. Gatunki grądowe: ${grad.names.length}${grad.total !== undefined ? `, łącznie ${fmt(grad.total)}` : ''}. To tylko pomoc – ocena wynika z charakteru całej kompozycji.`
      },
      describe: (i) => describeSpecies(speciesRows(i.species)) || labelOf(FLORISTIC, i.choice),
    },
    {
      id: 'dominant',
      label: 'Gatunki dominujące w poszczególnych warstwach fitocenozy',
      parameter: 'structure',
      cardinal: true,
      description:
        'Czy w każdej warstwie dominują gatunki typowe dla naturalnego łęgu. Najczęstsze zniekształcenia: nasadzona sosna, dominacja grabu lub lipy.',
      help: `Co wpisać: dominanty każdej warstwy z pokryciem (A – drzewostan, B – krzewy, C – runo, D – mchy) i ocenę, czy to gatunki typowe dla łęgu.

Naturalna jest dominacja:
• w drzewostanie: dębu, jesionu, wiązów;
• w krzewach: derenia, szakłaka, głogów, trzmieliny, czeremchy, suchodrzewu, bzu czarnego, kaliny, porzeczki, podrostu jesionu, wiązów, klonu polnego, dębu;
• w runie: gatunków lasowych z listy typowego runa (ziarnopłon, zawilce, czyściec leśny, podagrycznik, pokrzywa, śledziennica itd.).

Zniekształceniem jest dominacja gatunku obcego dla łęgu: nasadzonej sosny, buka, świerku, gatunków obcych geograficznie, a także grabu i lipy (objaw grądowienia) czy apofitów (trzcinnik piaskowy, jeżyny inne niż popielica). Formularz ostrzega, gdy takie gatunki mają na liście co najmniej 10%, a wybrano „naturalne”.

Dlaczego: struktura dominacji pokazuje, czy płat jest nadal łęgiem, czy przechodzi w grąd albo w drzewostan gospodarczy. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'We wszystkich warstwach dominują te gatunki typowe dla siedliska, przy czym są to naturalne stosunki ilościowe',
        U1: 'We wszystkich warstwach dominują gatunki typowe dla siedliska, przy czym są zaburzone relacje ilościowe',
        U2: 'W jednej lub więcej warstw dominuje gatunek obcy dla naturalnego zbiorowiska roślinnego',
      },
      inputs: [
        speciesInput('Gatunki dominujące w warstwach', 'Dominanty każdej warstwy z pokryciem w % transektu. Warstwę i jej zwarcie dopisz w opisie wskaźnika („A (70%): Quercus robur 40%, Fraxinus excelsior 30%; B: …”).'),
        selectInput('Czy dominanty są typowe?', DOMINANCE),
      ],
      suggest: byOption({ natural: 'FV', disturbed: 'U1', foreign: 'U2' }),
      warn: (i) => {
        if (i.choice !== 'natural') return null
        const bad = speciesRows(i.species).filter(
          (r) => (num(r.cover) ?? 0) >= 10 && DOMINANT_RED_FLAGS.has(findSpecies91F0(r.name ?? '')?.group ?? 'other'),
        )
        return bad.length
          ? `Wybrano „naturalne”, a dominują też: ${bad.map((r) => r.name).join(', ')} – to gatunki nietypowe dla dominacji w łęgu. Jeśli to świadoma ocena (np. jawor czy buk tylko w podroście), uzasadnij ją w opisie.`
          : null
      },
      describe: (i) => describeSpecies(speciesRows(i.species)),
    },
    {
      id: 'elmOakAsh',
      label: 'Liczba gatunków z grupy wiązy, dąb, jesion występujących w drzewostanie',
      parameter: 'structure',
      description:
        'Różnorodność gatunkowa drzewostanu: ile z gatunków wiąz szypułkowy, wiąz polny, wiąz górski, dąb szypułkowy, jesion wyniosły rośnie w drzewostanie.',
      help: `Co wpisać: gatunki z grupy wiązy (szypułkowy Ulmus laevis, polny U. minor, górski U. glabra), dąb szypułkowy Quercus robur i jesion wyniosły Fraxinus excelsior obecne w drzewostanie, każdy z przybliżonym pokryciem transektu (w dziesiątkach procent).

Formularz sam liczy gatunki z grupy: 3 i więcej – FV, 2 – U1, 1 – U2. Pozostałe drzewa wpisane na listę nie są liczone. „Ulmus sp.” liczy się jako jeden wiąz.

Dlaczego: naturalny łęg ma wielogatunkowy drzewostan. Częstym zniekształceniem są jednogatunkowe drzewostany, np. czysto dębowe, sadzone na siedlisku łęgu. Zamieranie jesionu też obniża ten wskaźnik. Wskaźnik pomocniczy.`,
      thresholds: { FV: 'Trzy i więcej', U1: 'Dwa', U2: 'Jeden' },
      inputs: [speciesInput('Wiązy, dąb i jesion w drzewostanie', 'Gatunki z grupy wiązy, dąb, jesion w drzewostanie, z pokryciem w % transektu.', true)],
      suggest: (i) => {
        const rows = speciesRows(i.species)
        if (!rows.some((r) => r.name?.trim())) return null
        return gradeElmOakAsh(elmOakAshSpecies(rows).length)
      },
      explain: (i) => {
        const rows = speciesRows(i.species)
        if (!rows.some((r) => r.name?.trim())) return null
        const hits = elmOakAshSpecies(rows)
        return `Gatunki z grupy wiązy, dąb, jesion: ${hits.length}${hits.length ? ` (${hits.join(', ')})` : ''}.`
      },
      describe: (i) => describeSpecies(speciesRows(i.species)),
    },
    {
      id: 'shrubs',
      label: 'Różnorodność gatunkowa warstwy krzewów',
      parameter: 'structure',
      description: 'Liczba gatunków w warstwie krzewów (podszyt i podrost). Naturalne łęgi mają bogatą i różnorodną warstwę krzewów.',
      help: `Co wpisać: wszystkie gatunki warstwy krzewów (B), czyli krzewy i podrost drzew, np. czeremcha, głogi, dereń świdwa, trzmielina, kalina, bez czarny, leszczyna, a także podrost jesionu, wiązów, jaworu czy grabu. Pokrycie podaj, jeśli je szacowałeś.

Formularz liczy różne gatunki na liście: 4 i więcej – FV, 2–3 – U1, jeden lub brak – U2.

Dlaczego: bujna, wielogatunkowa warstwa krzewów to cecha łęgów, zwłaszcza zalewanych. Uproszczenie podszytu wynika zwykle z gospodarki leśnej. Wskaźnik pomocniczy.`,
      thresholds: { FV: 'Cztery i więcej gatunków', U1: 'Dwa–trzy gatunki', U2: 'Jeden gatunek lub brak' },
      inputs: [speciesInput('Gatunki warstwy krzewów', 'Wszystkie gatunki krzewów i podrostu drzew w warstwie B. Brak warstwy krzewów – zostaw pustą listę (ocena U2).')],
      suggest: (i) => gradeShrubs(distinctSpecies(speciesRows(i.species)).length),
      explain: (i) => {
        const list = distinctSpecies(speciesRows(i.species))
        return list.length ? `Gatunków w warstwie krzewów: ${list.length}.` : null
      },
      describe: (i) => {
        const list = distinctSpecies(speciesRows(i.species))
        return list.length ? `W warstwie krzewów ${list.length} gat.: ${describeSpecies(speciesRows(i.species))}` : 'Brak warstwy krzewów'
      },
    },
    ecoAlienTrees({
      grade: ({ total }) => (total === undefined ? null : total < 10 ? 'FV' : total <= 50 ? 'U1' : 'U2'),
      inputHelp: 'Gatunki drzew obce ekologicznie łęgom, z udziałem w drzewostanie w %. Brak – zostaw pustą listę.',
      label: 'Gatunki obce ekologicznie w drzewostanie',
      description:
        'Nasadzone rodzime gatunki obce ekologicznie łęgom: buk, świerk, sosna, brzoza, osika. Do 10% jest tolerowane.',
      help: `Co wpisać: rodzime gatunki drzew, które nie należą do łęgu i zwykle zostały nasadzone – buk, świerk, sosna, brzoza, osika – każdy z udziałem w drzewostanie w %. Udział szacuj wzrokowo albo weź z opisu taksacyjnego. Gatunków obcych geograficznie tu nie wpisuj – mają swój wskaźnik.

Formularz sumuje udziały: poniżej 10% – FV, 10–50% – U1, ponad 50% – U2.

Dlaczego: nasadzenia gatunków obcych ekologicznie zmieniają ściółkę, zacienienie i skład runa. Niewielki udział jest tolerowany. Wskaźnik pomocniczy.`,
      thresholds: { FV: 'Poniżej 10%', U1: '10–50%', U2: 'Ponad 50%' },
    }),
    geoAlienTrees({
      label: 'Gatunki obce geograficznie w drzewostanie',
      description:
        'Drzewa poza naturalnym zasięgiem: klon jesionolistny, topole euroamerykańskie, jesion pensylwański, czeremcha amerykańska, dąb czerwony, świerk poza zasięgiem.',
      help: `Co wpisać: każdy gatunek drzewa rosnący poza swoim naturalnym zasięgiem (definicja z ustawy o ochronie przyrody), z udziałem w drzewostanie w %, oraz czy się odnawia. W łęgach notowano np. klon jesionolistny Acer negundo, topole euroamerykańskie Populus ×canadensis, jesion pensylwański Fraxinus pennsylvanica, czeremchę amerykańską Padus serotina, dąb czerwony Quercus rubra, robinię akacjową, świerk poza naturalnym zasięgiem.

Przypadkowe 1–2 osobniki (np. pojedyncze topole euroamerykańskie) można tolerować nawet przy FV. Większy niż jednostkowy udział, a zwłaszcza odnawianie się, obniża ocenę.

Dlaczego: łęgi są bardzo podatne na inwazje, a obce drzewa (szczególnie klon jesionolistny) potrafią przejąć drzewostan. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'Poniżej 1% i nie odnawiające się',
        U1: 'Poniżej 10% i nie odnawiające się',
        U2: 'Ponad 10% lub spontanicznie się odnawiające, niezależnie od udziału',
      },
    }),
    {
      id: 'deadWood',
      label: 'Martwe drewno (łączne zasoby)',
      parameter: 'structure',
      description:
        'Zasoby rozkładającego się drewna w m³/ha (od 7 cm grubości w cieńszym końcu, bez pniaków). Dawniej szacowane jako % miąższości drzewostanu.',
      help: `Co wpisać: łączną objętość martwego drewna (drzewa i ich części, leżące i stojące, od 7 cm grubości w cieńszym końcu; pniaków nie wliczasz) w m³ na hektar. Na transekcie 0,2 ha zsumuj objętości fragmentów i pomnóż przez 5. Możesz też skorzystać z danych urządzania lasu (od 2011 r. instrukcja przewiduje pomiar martwego drewna).

Gdy masz tylko szacunek starą metodą (2006–2011) – proporcję objętości martwego drewna do objętości drzew żywych w % – wpisz go w drugie pole. Formularz bierze m³/ha, jeśli są, inaczej %. Brak danych – zostaw puste i oceń XX.

Progi: ponad 20 m³/ha – FV, 10–20 – U1, poniżej 10 – U2 (stara metoda: ponad 10% – FV, 3–10% – U1, poniżej 3% – U2).

Dlaczego: martwe drewno to kluczowy element struktury lasu dla różnorodności biologicznej. Próg 20 m³/ha jest i tak ok. dwa razy niższy niż potrzeby organizmów ksylobiontycznych – w rezerwatach i ostojach wyższe zasoby nie są powodem do usuwania drzew. Wskaźnik pomocniczy.`,
      thresholds: {
        FV: 'Ponad 20 m³/ha (dawniej: ponad 10% miąższości żywego drzewostanu)',
        U1: '10–20 m³/ha (dawniej: 3–10% miąższości)',
        U2: 'Poniżej 10 m³/ha (dawniej: poniżej 3% miąższości)',
      },
      inputs: [
        {
          kind: 'number',
          name: 'volume',
          label: 'Zasoby martwego drewna',
          unit: 'm³/ha',
          min: 0,
          help: 'Objętość martwego drewna (≥7 cm w cieńszym końcu, bez pniaków) w m³ na hektar. Z transektu 0,2 ha: suma objętości × 5. Brak pomiaru – zostaw puste.',
        },
        pct('share', 'Albo: udział w miąższości drzewostanu', {
          required: false,
          help: 'Stara metoda (monitoring 2006–2011): wzrokowy szacunek objętości martwego drewna jako % objętości drzew żywych. Wypełnij tylko, gdy nie masz m³/ha.',
        }),
      ],
      suggest: (i) => {
        const v = num(i.volume)
        if (v !== undefined) return gradeDeadWoodVolume(v)
        const s = num(i.share)
        return s === undefined ? null : gradeDeadWoodShare(s)
      },
      explain: (i) => {
        const v = num(i.volume)
        if (v !== undefined) return `${dec(v)} m³/ha.`
        const s = num(i.share)
        return s === undefined ? null : `Szacunek starą metodą: ${fmt(s)} miąższości drzewostanu.`
      },
      describe: (i) => {
        const v = num(i.volume)
        if (v !== undefined) return `${dec(v)} m³/ha`
        const s = num(i.share)
        return s === undefined ? 'Brak danych' : `${fmt(s)} miąższości żywego drzewostanu`
      },
    },
    {
      id: 'largeDeadWood',
      label: 'Martwe drewno leżące lub stojące >3 m długości i >50 cm grubości',
      parameter: 'structure',
      cardinal: true,
      description:
        'Liczba grubych kłód i stojących martwych pni na hektar. Próg grubości obniża się do 30 cm, gdy drzewa z natury nie dorastają do 50 cm.',
      help: `Co wpisać: liczbę kłód leżących i martwych drzew stojących o długości (wysokości) ponad 3 m i grubości ponad 50 cm – mierzonej w pierśnicy u drzew stojących, a u kłód w pierśnicy (jeśli da się ją określić) albo w grubszym końcu – przeliczoną na hektar. Na transekcie 200×10 m (0,2 ha) policz sztuki i pomnóż przez 5.

Gdy w płacie drzewa z przyczyn naturalnych nie dorastają do 50 cm, liczy się próg 30 cm – zaznacz to w drugim polu. Brak danych – zostaw puste i oceń XX.

Progi: ponad 5 szt./ha – FV, 3–5 – U1, poniżej 3 – U2.

Dlaczego: grube rozkładające się kłody to mikrosiedlisko dla najbardziej wymagających organizmów ksylobiontycznych, należących do najsilniej zagrożonych. W lasach gospodarczych tego drewna brakuje najbardziej. Wskaźnik kardynalny.`,
      thresholds: { FV: 'Ponad 5 szt./ha', U1: '3–5 szt./ha', U2: 'Poniżej 3 szt./ha' },
      inputs: [
        {
          kind: 'number',
          name: 'perHa',
          label: 'Liczba sztuk na hektar',
          unit: 'szt./ha',
          min: 0,
          help: 'Kłody i stojące martwe pnie >3 m długości i powyżej progu grubości, na hektar. Z transektu 0,2 ha: liczba sztuk × 5. Brak danych – zostaw puste.',
        },
        {
          kind: 'select',
          name: 'minDiameter',
          label: 'Próg grubości',
          options: MIN_DIAMETER,
          defaultValue: '50',
          help: 'Standardowo liczy się drewno grubsze niż 50 cm. Próg 30 cm stosuj tylko wtedy, gdy drzewa w płacie z przyczyn naturalnych nie dorastają do 50 cm – i napisz o tym w opisie.',
        },
      ],
      suggest: (i) => {
        const v = num(i.perHa)
        return v === undefined ? null : gradeLargeDeadWood(v)
      },
      describe: (i) => {
        const v = num(i.perHa)
        if (v === undefined) return 'Brak danych'
        return `${dec(v)} szt./ha (grubość >${i.minDiameter === '30' ? 30 : 50} cm)`
      },
    },
    standAge({
      old100: 10,
      inputs: [
        ...AGE_BASE.inputs,
        {
          kind: 'number',
          name: 'years',
          label: 'Wiek drzewostanu (jeśli znany)',
          unit: 'lat',
          min: 0,
          help: 'Wiek głównego piętra drzewostanu w latach, np. z opisu taksacyjnego („ok. 110 lat”). Opcjonalne – trafia do opisu wskaźnika.',
        },
      ],
      describe: (i) => {
        const y = num(i.years)
        const base = AGE_BASE.describe!(i)
        return [y === undefined ? '' : `ok. ${dec(y)} lat`, base].filter(Boolean).join(', ')
      },
      label: 'Wiek drzewostanu (obecność starodrzewu)',
      description: 'Dojrzałość fitocenozy mierzona udziałem objętościowym drzew starszych niż 100 i 50 lat.',
      help: `Co wybrać: udział objętościowy (miąższość) drzew starszych niż 100 lat i starszych niż 50 lat. Szacuj wzrokowo albo weź z opisu taksacyjnego wydzielenia, w którym leży transekt. Liczby możesz dopisać w polach poniżej – formularz sprawdzi zgodność z klasą.

Dlaczego: stare i grube drzewa to kluczowy element struktury lasu – bez nich trzeba się spodziewać zubożenia flory i fauny związanej z drzewostanem. Wskaźnik pomocniczy.`,
      thresholds: {
        FV: 'Ponad 10% udziału objętościowego drzew starszych niż 100 lat',
        U1: 'Poniżej 10% udziału drzew starszych niż 100 lat, ale ponad 50% udziału drzew starszych niż 50 lat',
        U2: 'Poniżej 10% udziału drzew starszych niż 100 lat i poniżej 50% udziału drzew starszych niż 50 lat',
      },
    }),
    {
      id: 'regeneration',
      label: 'Naturalne odnowienie drzewostanu',
      parameter: 'structure',
      description:
        'Obecność spontanicznego odnowienia gatunków drzew naturalnie występujących w drzewostanie i jego łączne pokrycie.',
      help: `Co wybrać: czy pod drzewostanem są siewki i podrost gatunków drzew naturalnie występujących w łęgu (jesion, wiązy, dąb, klon polny, czeremcha…), ile gatunków się odnawia i czy odnowienie reaguje na luki i prześwietlenia. Liczy się odnowienie spontaniczne, nie z nasadzeń. W opisie wymień gatunki.

Dlaczego: drzewostan powinien się odtwarzać sam. Brak odnowienia może być chwilowy i wynikać z fazy rozwoju drzewostanu, dlatego wskaźnik jest pomocniczy i nie przesądza o ocenie struktury.`,
      thresholds: {
        FV: 'Tak, więcej niż 2 gatunki, obfite, reagujące na luki i prześwietlenia',
        U1: 'Tak, pojedyncze lub ograniczone do jednego gatunku',
        U2: 'Brak',
      },
      inputs: [
        selectInput('Odnowienie naturalne', REGENERATION),
        speciesInput('Gatunki odnawiające się', 'Gatunki drzew w odnowieniu (siewki, podrost), z pokryciem w % transektu. Opcjonalne – trafia do opisu.'),
      ],
      suggest: byOption({ abundant: 'FV', limited: 'U1', none: 'U2' }),
      warn: (i) => {
        const n = distinctSpecies(speciesRows(i.species)).length
        return i.choice === 'abundant' && n > 0 && n <= 2 ? `Na liście ${n} gat., a FV wymaga odnowienia więcej niż 2 gatunków.` : null
      },
      describe: (i) => {
        const list = describeSpecies(speciesRows(i.species))
        return [labelOf(REGENERATION, i.choice), list].filter(Boolean).join(': ')
      },
    },
    verticalStructure({
      options: VERTICAL,
      inputLabel: 'Struktura drzewostanu',
      describe: (i) => labelOf(VERTICAL, i.choice),
      label: 'Struktura pionowa i przestrzenna drzewostanu',
      description:
        'Stopień uproszczenia struktury przez hodowlę jednolitych gatunkowo i wiekowo drzewostanów. Właściwa jest struktura wielogeneracyjna.',
      help: `Co wybrać: jak zróżnicowany jest drzewostan w pionie (warstwy, pokolenia) i w przestrzeni (luki, prześwietlenia, fragmenty starego drzewostanu).

• FV – zróżnicowana: ponad 70% powierzchni pod zwartym drzewostanem, ale są luki i prześwietlenia z odnowieniem;
• U1 – jednolity stary drzewostan albo struktura zróżnicowana, w której zwarty stary drzewostan zajmuje 30–70% powierzchni (np. duże luki po zamarłych jesionach);
• U2 – jednolite odnowienia albo struktura zróżnicowana, w której stary drzewostan zajmuje mniej niż 30% powierzchni.

Dlaczego: naturalne łęgi mają strukturę wielogeneracyjną. Nadmierne wyrównanie wieku i budowy drzewostanu to skutek gospodarki leśnej. Wskaźnik pomocniczy.`,
      thresholds: {
        FV: 'Zróżnicowana; >70% powierzchni pokryte przez zwarty drzewostan, jednak obecne luki, prześwietlenia',
        U1: 'Jednolity stary drzewostan lub struktura zróżnicowana ze zwartym starym drzewostanem zajmującym 30–70% powierzchni',
        U2: 'Jednolite odnowienia lub zróżnicowana struktura z <30% powierzchni zajętej przez fragmenty starego drzewostanu',
      },
    }),
    {
      ...choiceIndicator({
        options: GRAD,
        inputLabel: 'Przejawy grądowienia',
        after: [
          pct('gradCover', 'Pokrycie transektu przez gatunki grądowe', {
            required: false,
            help: 'Szacowane łączne pokrycie gatunków grądowych (grab, lipa, gatunki runa lasów świeżych) w % transektu. Opcjonalne – trafia do opisu.',
          }),
        ],
        id: 'gradification',
        label: 'Przejawy procesu grądowienia',
        parameter: 'structure',
        description:
          'Natężenie przekształcania się łęgu w grąd: brunatnienie mad, ekspansja graba, przewaga gatunków lasów świeżych nad wilgociolubnymi w runie.',
        help: `Co wybrać i opisać: jak silnie łęg przekształca się w grąd. Przejawy:
• ekspansja graba (i lipy) w drzewostanie i podroście;
• w runie przewaga gatunków lasów świeżych (np. przytulia wonna, gajowiec, wiechlina gajowa, turzyca palczasta) nad wilgociolubnymi;
• brunatnienie mad rzecznych (jeśli masz dane glebowe);
• sygnał pomocniczy: trwałe wysychanie i zarastanie starorzeczy.

Możesz podać pokrycie transektu przez gatunki grądowe – przykład z przewodnika: „ok. 40% – bardzo silne przejawy grądowienia”.

Pułapka: nie oceniaj jako zniekształcenia sytuacji, w której łęg naturalnie przeplata się z grądem w mozaice mikrotopograficznej i stąd ma lokalnie więcej gatunków grądowych.

Dlaczego: grądowienie to najczęstszy proces zagrażający łęgom, zwykle skutek odcięcia od zalewów i obniżenia wód gruntowych. Wskaźnik pomocniczy.`,
        thresholds: { FV: 'Brak lub nieznaczne', U1: 'Wyraźne', U2: 'Silnie zaawansowane' },
      }),
      describe: (i: InputValues) => {
        const c = num(i.gradCover)
        return [labelOf(GRAD, i.choice), c === undefined ? '' : `pokrycie gatunków grądowych ok. ${fmt(c)}`].filter(Boolean).join(', ')
      },
    },
    speciesCoverIndicator({
      id: 'invasive',
      label: 'Ekspansywne gatunki obce w podszycie i runie',
      parameter: 'structure',
      description:
        'Inwazyjne neofity w podszycie i runie: niecierpek drobnokwiatowy, klon jesionolistny, winobluszcz pięciolistkowy, rdestowce, nawłocie.',
      help: `Co wpisać: każdy gatunek obcy geograficznie w podszycie i runie, z pokryciem w % transektu. Najczęstsze w 91F0: niecierpek drobnokwiatowy Impatiens parviflora (na ok. 3/4 stanowisk), klon jesionolistny Acer negundo w podroście, winobluszcz pięciolistkowy, rdestowce, nawłocie, niecierpek gruczołowaty. Brak – zostaw pustą listę.

Odnotuj każdy gatunek obcy, ale ocenę obniża dopiero lokalna inwazyjność. Progi z przewodnika są opisowe; formularz przyjmuje:
• FV – brak albo najwyżej jeden gatunek, nieliczny (pokrycie do 1%);
• U1 – więcej niż jeden gatunek albo jeden liczny (powyżej 1%);
• U2 – facjalna dominacja: gatunek obcy z pokryciem co najmniej 25% transektu.
To interpretacja, nie norma – przy facjalnej dominacji w płatach przy mniejszym pokryciu popraw ocenę i opisz to.

Dlaczego: łęgi są bardzo podatne na neofityzację. Dobrze zachowany płat wymaga braku inwazyjnych gatunków obcych. Wskaźnik pomocniczy.`,
      thresholds: {
        FV: 'Obecny najwyżej jeden gatunek, nieliczny, sporadyczny',
        U1: 'Więcej niż jeden gatunek lub nawet jeden gatunek, jeżeli liczny',
        U2: 'Facjalna dominacja gatunku obcego',
      },
      inputLabel: 'Gatunki obce w podszycie i runie',
      inputHelp: 'Gatunki obce geograficznie w podszycie i runie, z pokryciem w % transektu. Brak – zostaw pustą listę.',
      grade: (_, i) => {
        const { count, total, max } = coverStats(i)
        if (count === 0) return 'FV'
        if (max !== undefined && max >= 25) return 'U2'
        if (count === 1 && total !== undefined) return total <= 1 ? 'FV' : 'U1'
        if (count > 1) return 'U1'
        return null
      },
      note: 'Progi „nieliczny” (do 1%) i „facjalna dominacja” (od 25%) to interpretacja.',
    }),
    {
      id: 'apophytes',
      label: 'Ekspansywne gatunki rodzime (apofity) w runie',
      parameter: 'structure',
      description:
        'Rodzime gatunki zachowujące się ekspansywnie, z tendencją do dominacji: jeżyny, trzcinnik piaskowy, gatunki łąkowe, czasem pokrzywa.',
      help: `Co wpisać: rodzime gatunki runa, które wyraźnie się rozprzestrzeniają i dążą do dominacji: jeżyny (inne niż typowa dla łęgów popielica), trzcinnik piaskowy Calamagrostis epigejos, gatunki łąkowe (kupkówka, mozga trzcinowata, śmiałek). Bierz je pod uwagę tylko wtedy, gdy zachowują się ekspansywnie. Pokrzywa zwyczajna jest typowa dla łęgów, ale masowa na całym transekcie (jak w przykładzie z przewodnika) też może być ekspansją.

Dlaczego: apofityzacja to sygnał eutrofizacji, przesuszenia albo prześwietlenia drzewostanu. Właściwy stan wymaga braku ekspansywnych apofitów. Wskaźnik pomocniczy.`,
      thresholds: {
        FV: 'Co najwyżej pojedynczo',
        U1: 'Udział podwyższony, lecz nie bardzo ekspansywne',
        U2: 'Silnie ekspansywne',
      },
      inputs: [
        speciesInput('Ekspansywne gatunki rodzime', 'Rodzime gatunki ekspansywne w runie, z pokryciem w % transektu. Brak – zostaw pustą listę.'),
        selectInput('Natężenie ekspansji', APOPHYTES),
      ],
      suggest: byOption({ single: 'FV', raised: 'U1', strong: 'U2' }),
      warn: (i) => {
        const { total } = listCover(i)
        return i.choice === 'single' && total !== undefined && total >= 25
          ? `Wybrano „pojedynczo”, a łączne pokrycie apofitów to ${fmt(total)}.`
          : null
      },
      describe: (i) => describeSpecies(speciesRows(i.species)) || labelOf(APOPHYTES, i.choice),
    },
    {
      ...choiceIndicator({
        options: HYDROLOGY,
        inputLabel: 'Warunki wodne',
        inputHelp: 'Oceniaj względem tego, jaki reżim wodny jest naturalny dla płatu (zalewy w dolinie, przepływ wód gruntowych poza nią).',
        id: 'hydrology',
        label: 'Stosunki wodno-wilgotnościowe',
        parameter: 'structure',
        cardinal: (ctx: IndicatorContext) => hydrologyCardinal(ctx),
        description:
          'Zniekształcenie warunków hydrologicznych, np. odcięcie łęgu od okazjonalnych zalewów rzecznych. Uwzględnia lokalną specyfikę.',
        help: `Co wybrać i opisać: czy łęg ma warunki wodne, w jakich się wykształcił.
• W dolinach rzek: czy zdarzają się zalewy wodami rzecznymi (co najmniej raz na kilka lat), czy łęg odcięły wały, czy koryto pogłębiono lub uregulowano, czy rzeka okresowo wysycha.
• Poza dolinami: czy zachowane są naturalne warunki wilgotnościowe – przepływająca woda gruntowa, wysięki, wilgotne dolinki.

Pułapka: brak zalewów w miejscu, które nigdy nie było zalewane (łęg pozadolinowy), to nie zniekształcenie.

Wskaźnik jest kardynalny tylko dla typowych postaci Ficario-Ulmetum. Formularz przestaje go traktować jako kardynalny, gdy w „Stanowisku” wybierzesz postać nietypową lub przejściową.

Dlaczego: woda decyduje o specyfice łęgu. Odcięcie od zalewów przerywa procesy aluwialne, uruchamia brunatnienie gleb i przemianę łęgu w grąd.`,
        thresholds: {
          FV: 'Zalewy wodami rzecznymi zdarzające się co najmniej raz na kilka lat. W przypadku łęgów poza dolinami – naturalne warunki wilgotnościowe',
          U1: 'Zalewy wodami rzecznymi zdarzające się wyjątkowo, lecz zastępowane przez przesiąki lub stagnowanie wody opadowej; znaczne uwilgotnienie, niewiele tylko odbiegające od stanu naturalnego',
          U2: 'Brak zalewów wodami rzecznymi i objawy przesuszenia',
        },
      }),
      explain: (_: InputValues, ctx?: IndicatorContext) =>
        hydrologyCardinal(ctx) ? null : 'Postać nietypowa – w tym płacie wskaźnik nie jest kardynalny.',
    },
    loggingDamage({
      options: LOGGING,
      label: 'Zniszczenia runa i gleby związane z pozyskaniem drewna',
      description:
        'Naruszenia runa, gleby, podszytu, podrostów i zasobów martwego drewna przy pracach leśnych. Sam fakt pozyskania i pniaki to jeszcze nie zniszczenie.',
      help: `Co wybrać: jak bardzo prace leśne naruszyły runo, powierzchnię gleby, podszyt, podrost i zasoby martwego drewna. Patrz na koleiny po zrywce, rozjeżdżone mady, zniszczone krzewy, uprzątnięte martwe drewno. Same pniaki nie obniżają oceny.

Dlaczego: łęgi rosną na żyznych, wilgotnych glebach, które łatwo rozjeździć. Ekstensywne użytkowanie nie przesądza jednak o ocenie – wskaźnik jest pomocniczy.`,
      thresholds: { FV: 'Brak', U1: 'Pojedyncze ślady', U2: 'Liczne ślady' },
    }),
    otherDistortions({
      options: DISTORTIONS,
      label: 'Inne zniekształcenia (rozjeżdżanie, wydeptywanie, zaśmiecanie)',
      description: 'Rozjeżdżanie, wydeptywanie, zaśmiecanie i podobne przekształcenia niezwiązane z pozyskaniem drewna.',
      help: `Co wybrać i opisać: inne przekształcenia płatu niezwiązane z pozyskaniem drewna – rozjeżdżanie (quady, ciężki sprzęt), wydeptywanie, zaśmiecanie (także śmieci naniesione przez powodzie), wysypiska, drogi i groble przecinające płat. W polu opisu wymień je krótko.

Dlaczego: każde z nich niszczy runo albo zmienia warunki wodne. Wskaźnik pomocniczy.`,
      thresholds: { FV: 'Brak', U1: 'Występują, lecz mało znaczące', U2: 'Silne' },
    }),
    keySpecies({
      options: KEY_SPECIES,
      label: 'Stan kluczowych dla różnorodności biologicznej gatunków lokalnie typowych dla siedliska (wskaźnik fakultatywny)',
      description:
        'Stosować tylko, gdy są dane: np. dzięcioł średni, muchołówka białoszyja, zgniotek, pachnica, kozioróg dębosz, śnieżyczka, śnieżyca, pierwiosnek wyniosły.',
      help: `Co wybrać: stan gatunków chronionych, zagrożonych i rzadkich, typowych lokalnie dla łęgu. Wybór zależy od obszaru, np.:
• zwierzęta: dzięcioł średni Dendrocopos medius, dzięcioł białogrzbiety D. leucotos, muchołówka białoszyja Ficedula albicollis, zgniotki Cucujus spp., kwietnica okazała Protaetia aeruginosa, ciołek matowy Dorcus parallelipipedus, pachnica Osmoderma spp., kozioróg dębosz Cerambyx cerdo, przeplatka maturna Euphydryas maturna;
• rośliny decydujące o lokalnej specyfice: śnieżyczka przebiśnieg, śnieżyca wiosenna, jarzmianka większa, pierwiosnek wyniosły, podkolan biały, klon polny, skrzyp zimowy.

Wskaźnik fakultatywny – gdy brak danych, wybierz „Brak danych” (XX). XX tego wskaźnika nie psuje oceny struktury, bo nie jest on kardynalny.

Dlaczego: pokazuje, czy łęg utrzymuje gatunki, dla których jest ostoją.`,
      thresholds: {
        FV: 'Stan wszystkich takich gatunków właściwy (FV)',
        U1: 'Stan niektórych takich gatunków niezadowalający (U1)',
        U2: 'Stan niektórych takich gatunków zły (U2)',
      },
    }),
  ],

  prospects: {
    description:
      'Czy siedlisko utrzyma się w stanie niepogorszonym w perspektywie 10–20 lat: status lasu, zarządca, zagrożenie wycinką, gospodarka, plany hydrotechniczne, neofityzacja.',
    help: `Co wpisać: ekspercką ocenę przyszłości płatu w perspektywie 10–20 lat. Przewodnik każe zwrócić uwagę na:
• czy płat jest formalnie lasem, czy zadrzewieniem, i w czyim jest zarządzie;
• zagrożenie wycinką łęgów, np. w ramach ochrony przeciwpowodziowej;
• czy specyfika łęgu została prawidłowo rozpoznana w danych glebowo-siedliskowych gospodarki leśnej i w inwentaryzacji przyrodniczej;
• jaka gospodarka jest prowadzona i jakie zapisy ma plan urządzenia lasu dla tych wydzieleń;
• czy są płaty pozostawione jako powierzchnie referencyjne, wyłączone z użytkowania;
• narażenie na neofityzację i inne przewidywane formy presji;
• plany inwestycji hydrotechnicznych (wały, regulacja, pogłębianie koryta).

Dlaczego: perspektywy to osobny parametr oceny ogólnej. Łęg w złym stanie, ale z planem przywrócenia zalewów, wymaga innych decyzji niż taki, który dalej się przesusza.`,
    thresholds: {
      FV: 'Brak zagrożeń i negatywnych trendów. Zachowanie siedliska w stanie niepogorszonym w perspektywie 10–20 lat jest niemal pewne',
      U1: 'Zachowanie siedliska w stanie niepogorszonym w perspektywie 10–20 lat nie jest pewne, ale jest prawdopodobne, o ile uda się zapobiec istniejącym zagrożeniom',
      U2: 'Zachowanie siedliska w stanie niepogorszonym w perspektywie 10–20 lat będzie bardzo trudne: zaawansowane procesy recesji, silne negatywne trendy lub znaczne zagrożenia',
    },
  },

  impactCodes: [
    { code: 'A04', name: 'Wypas' },
    { code: 'B02', name: 'Gospodarka leśna – ogólnie' },
    { code: 'B02.01', name: 'Odnawianie lasu po wycince' },
    { code: 'B02.02', name: 'Wycinka lasu' },
    { code: 'B02.03', name: 'Usuwanie podszytu' },
    { code: 'B02.04', name: 'Usuwanie martwych i umierających drzew' },
    { code: 'B02.06', name: 'Przerzedzanie drzewostanu' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'G01', name: 'Sporty i różne formy czynnego wypoczynku' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02.01', name: 'Zasypywanie terenu, melioracje i osuszanie – ogólnie' },
    { code: 'J02.03', name: 'Kanalizowanie i przekierowanie wód' },
    { code: 'J02.04.02', name: 'Brak zalewów' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód – ogólnie' },
    { code: 'J02.07', name: 'Pobór wód gruntowych' },
    { code: 'J02.12.02', name: 'Wały przeciwpowodziowe i zabezpieczenia przed zalaniem w śródlądowych systemach wodnych' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K04.03', name: 'Wprowadzanie chorób (mikrobiologicznych patogenów), np. zamieranie jesionu' },
    { code: 'M01.02', name: 'Susze i zmniejszenie opadów' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. sąsiedztwo grądów, starorzeczy, łęgów 91E0, storczyki, dzięcioł średni.',
        help: `Wartości przyrodnicze stanowiska poza samym siedliskiem 91F0: rzadkie i chronione gatunki, sąsiedztwo innych siedlisk (grądy 9160/9170, łęgi 91E0, starorzecza 3150), funkcja ostoi. Brak – „Nie stwierdzono”.

Dlaczego: łęgi tworzą mozaikę z innymi siedliskami dolin rzecznych. Planując ochronę (np. przywrócenie zalewów), trzeba wiedzieć, co jeszcze się na nich odbije.`,
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: `Jakie działania ochronne wykonano (kiedy, kto, w jakiej skali): wyłączenie z użytkowania, pozostawianie martwego drewna, usuwanie gatunków obcych, udrożnienie starorzeczy, odsunięcie wałów i przywrócenie zalewów. Do tego ocena skuteczności poparta obserwacjami. Brak działań – „Nie prowadzono działań ochronnych”.

Dlaczego: monitoring ma odpowiedzieć, czy ochrona działa. Kluczem do ochrony łęgów jest zachowanie lub odtworzenie warunków wodnych, w jakich się wykształciły.`,
      }
    return f
  }),

  speciesCatalog: SPECIES_91F0.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer91F0(s) })),
  speciesInfo: (name) => {
    const e = findSpecies91F0(name)
    return e ? GROUP_LABELS_91F0[e.group] : undefined
  },
}
