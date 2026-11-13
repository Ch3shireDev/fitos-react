// Metodyka 91T0 jako dane. Źródło: Węgrzyn M., Masłowska M. 2010. Śródlądowy bór chrobotkowy. W: Mróz W. (red.)
// „Monitoring siedlisk przyrodniczych. Przewodnik metodyczny. Część I”, GIOŚ, s. 295–311 (tab. 1 i 2), z modyfikacją
// GIOŚ z 17.07.2015 (nowa nazwa wskaźnika stosunku pokrycia) i doprecyzowaniami ze sprawozdań z monitoringu
// 2006–2008, 2013–2014 i 2021 (wiek drzewostanu bez statusu kardynalnego, gatunki obce, martwe drewno).
// Wspólne typy, ocena i formularz są w src/7120, klocki leśne w src/forest – tu są wyłącznie dane i progi 91T0.
import type { FieldDef, Grade, IndicatorDef, InputValues, SelectOption } from '../../7120/habitats/types'
import type { Methodology } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import {
  FOREST_IMPACT_CODES,
  choiceIndicator,
  fmt,
  forestArea,
  forestReleveFields,
  forestSiteFields,
  gradeMap,
  labelOf,
  listCover,
  loggingDamage,
  measureIndicator,
  plNum,
  plantings,
  selectInput,
  speciesCoverIndicator,
  speciesInput,
  standDamage,
  type GradedOption,
} from '../../forest'
import {
  CHARACTERISTIC_91T0,
  GROUP_LABELS_91T0,
  SPECIES_91T0,
  characteristicSummary,
  cladoniaOf,
  defaultLayer91T0,
  findSpecies91T0,
  namesOfGroup,
} from './species'

// ---------- opcje selectów (z oceną, którą dają) ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'other', label: 'Inne kombinacje (np. niewielki ubytek, zarastanie skraju płatu)', grade: 'U1' },
  { value: 'decline', label: 'Wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub literaturą', grade: 'U2' },
]

const THALLUS: GradedOption[] = [
  { value: 'good', label: 'Kondycja plech dobra (plechy wysokie, do 10 cm, rosną pionowo)', grade: 'FV' },
  { value: 'medium', label: 'Kondycja plech średnia', grade: 'U1' },
  { value: 'poor', label: 'Kondycja plech zła (plechy niskie, płożące się, „rozdeptane”)', grade: 'U2' },
]

const CARPET: GradedOption[] = [
  { value: 'dense', label: 'Runo zwarte', grade: 'FV' },
  { value: 'patchy', label: 'Runo słabo płatowate', grade: 'U1' },
  { value: 'scattered', label: 'Runo silnie płatowate', grade: 'U2' },
]

const ABUNDANCE: SelectOption[] = [
  { value: 'few', label: 'Nieliczne' },
  { value: 'many', label: 'Liczne, bardzo liczne' },
]

const DEAD_WOOD: GradedOption[] = [
  { value: 'none', label: 'Brak drewna (pojedyncze gałęzie i pnie się nie liczą)', grade: 'FV' },
  { value: 'little', label: 'Niewielka ilość drewna martwego z naturalnego opadu', grade: 'U1' },
  { value: 'much', label: 'Duża ilość martwego drewna (np. stosy gałęzi, resztki pozrębowe)', grade: 'U2' },
]

const REGENERATION: GradedOption[] = [
  { value: 'few', label: 'Występuje, ale w małych ilościach', grade: 'FV' },
  { value: 'none', label: 'Całkowity brak odnowienia', grade: 'U1' },
  { value: 'many', label: 'Liczne', grade: 'U1' },
  { value: 'veryMany', label: 'Bardzo liczne (podrost zacienia runo)', grade: 'U2' },
]

const PLANTINGS: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'few', label: 'Są nieliczne', grade: 'U1' },
  { value: 'many', label: 'Są bardzo liczne', grade: 'U2' },
]

const LOGGING: GradedOption[] = [
  { value: 'weak', label: 'Słabe (brak lub ślady bez wpływu na runo)', grade: 'FV' },
  { value: 'medium', label: 'Średnie', grade: 'U1' },
  { value: 'strong', label: 'Duże (np. pozostawione resztki pozrębowe, zręby, zrywka przez płat)', grade: 'U2' },
]

const DAMAGE: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'medium', label: 'Istnieją, ale ich intensywność na średnim poziomie', grade: 'U1' },
  { value: 'intense', label: 'Bardzo intensywne', grade: 'U2' },
]

// ---------- progi tab. 2 (luki między progami – patrz komentarze) ----------

const RANK: Record<Grade, number> = { FV: 0, U1: 1, U2: 2, XX: -1 }
const worse = (a: Grade, b: Grade): Grade => (RANK[a] >= RANK[b] ? a : b)

/** Kombinacja florystyczna: ≥80% listy FV, <50% U2, reszta U1 (luka 50–59% w tab. 2 → U1, interpretacja). */
export const gradeCharacteristic = (percent: number): Grade => (percent >= 80 ? 'FV' : percent < 50 ? 'U2' : 'U1')

/** Udział siedliska na transekcie: ≥70% FV, <30% U2, reszta U1 (luka 30–49% w tab. 2 → U1, interpretacja). */
export const gradeShare = (v: number): Grade => (v >= 70 ? 'FV' : v < 30 ? 'U2' : 'U1')

/** Rodzime ekspansywne: łączne pokrycie do 10% FV, do 20% U1, ponad 20% U2. */
export const gradeExpansive = (total: number): Grade => (total <= 10 ? 'FV' : total <= 20 ? 'U1' : 'U2')

/** Wiek drzewostanu: >90 lat FV, 50–90 U1, <50 U2. */
export const gradeAge = (years: number): Grade => (years > 90 ? 'FV' : years >= 50 ? 'U1' : 'U2')

/** Próg „liczne” dla gatunków obcych, gdy obserwator nie wybrał liczebności – łączne pokrycie ponad 5% (interpretacja). */
export const MANY_COVER = 5

/** Obce inwazyjne / obce w drzewostanie: brak FV, nieliczne U1, liczne U2. */
export function gradeAliens(c: { count: number; total?: number }, abundance: unknown): Grade | null {
  if (c.count === 0) return 'FV'
  if (abundance === 'many') return 'U2'
  if (abundance === 'few') return 'U1'
  if (c.total === undefined) return null
  return c.total > MANY_COVER ? 'U2' : 'U1'
}

export interface GroundRatio {
  /** Porosty + mszaki jako % runa (porosty + mszaki + rośliny naczyniowe). */
  cryptogams: number
  /** Same porosty jako % runa. */
  lichens: number
}

/** Udziały w runie z trzech pokryć (każde w % powierzchni). Pusta suma → undefined. */
export function groundRatio(i: InputValues): GroundRatio | undefined {
  const l = num(i.lichens)
  const m = num(i.mosses)
  const v = num(i.vascular)
  if (l === undefined || m === undefined || v === undefined) return undefined
  const sum = l + m + v
  if (sum <= 0) return undefined
  const r = (x: number) => Math.round((x / sum) * 1000) / 10
  return { cryptogams: r(l + m), lichens: r(l) }
}

/**
 * Stosunek pokrycia chrobotków (porostów) i mchów do roślin naczyniowych (tab. 2).
 * Porosty + mchy: ≥90% FV, <60% U2; same porosty: ≥60% FV, <40% U2. Liczy się gorsza z dwóch ocen.
 * Luki tab. 2 (80–89% i 60–69% dla porostów z mchami) → U1 (interpretacja). Porosty >90% runa → FV (tab. 2 podaje
 * „60–90%”, ale więcej porostów nie jest gorsze – interpretacja).
 */
export function gradeRatio(r: GroundRatio): Grade {
  const a: Grade = r.cryptogams >= 90 ? 'FV' : r.cryptogams < 60 ? 'U2' : 'U1'
  const b: Grade = r.lichens >= 60 ? 'FV' : r.lichens < 40 ? 'U2' : 'U1'
  return worse(a, b)
}

/** Chrobotki: gorsza z ocen kondycji plech i zwartości runa. */
export function gradeCladonia(i: InputValues): Grade | null {
  const a = gradeMap(THALLUS)[String(i.thallus)]
  const b = gradeMap(CARPET)[String(i.carpet)]
  if (a && b) return worse(a, b)
  return null
}

// ---------- pomocnicze ----------

const optionalSelect = (name: string, label: string, options: SelectOption[], help: string): FieldDef => ({
  kind: 'select',
  name,
  label,
  options,
  help,
})

const ABUNDANCE_HELP = (what: string) =>
  `Czy ${what} są nieliczne (pojedyncze osobniki, siewki), czy liczne. Pole opcjonalne: bez niego formularz uzna za „liczne” łączne pokrycie ponad ${MANY_COVER}% transektu (interpretacja).

Dlaczego: tab. 2 nie podaje progu liczbowego, tylko „nieliczne” i „liczne” – to ocena obserwatora.`

const COORD_HELP = (where: string) =>
  `Współrzędne geograficzne ${where} transektu z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie, np. stopnie-minuty-sekundy z N/E. Jeśli punkt ma oznaczenie w bazie, dopisz je.

Dlaczego: transekt trzeba odnaleźć za 6 lat (taki jest cykl monitoringu 91T0). W tych samych punktach (początek, środek, koniec) wykonuje się zdjęcia fitosocjologiczne po 100 m².`

const aliensDescribe = (i: InputValues, empty: string) => {
  const list = describeSpecies(speciesRows(i.species))
  if (!list) return empty
  return i.abundance ? `${list} – ${labelOf(ABUNDANCE, i.abundance).toLowerCase()}` : list
}

export const methodology91T0: Methodology = {
  code: '91T0',
  name: 'Śródlądowy bór chrobotkowy (Cladonio-Pinetum)',
  source:
    'Węgrzyn M., Masłowska M. 2010. Śródlądowy bór chrobotkowy. W: Mróz W. (red.) Monitoring siedlisk przyrodniczych. Przewodnik metodyczny. Cz. I, GIOŚ, s. 295–311 (tab. 1 i 2), z modyfikacją GIOŚ z 17.07.2015 i doprecyzowaniami ze sprawozdań z monitoringu 2006–2008, 2013–2014 i 2021',

  siteFields: forestSiteFields({
    code: '91T0',
    transect: '200x10 m',
    releveArea: 100,
    dateWindow: [4, 10],
    overrides: {
      siteName: {
        placeholder: 'np. 327d_01',
        help: `Nazwa (albo oznaczenie wydzielenia), pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „327d_01”. Jeśli stanowisko jest już w bazie GIOŚ, przepisz nazwę co do znaku.

Dlaczego: bór chrobotkowy monitoruje się co 6 lat (cykle 2006–2008, 2013–2014, 2021). Stanowiska najwygodniej wiązać z granicami wydzieleń leśnych – stała nazwa razem z GUID pozwala je odnaleźć i zestawić kolejne karty.`,
      },
      communities: {
        placeholder: 'np. Cladonio-Pinetum',
        help: `Zbiorowiska na stanowisku, nazwami fitosocjologicznymi. Właściwy jest zespół Cladonio-Pinetum (śródlądowy bór chrobotkowy). Dopisz zbiorowiska, z którymi płat tworzy mozaikę albo w które przechodzi, zwłaszcza bór świeży Leucobryo-Pinetum, i postać zdegradowaną (np. „Cladonio-Pinetum, postać zdegradowana z dominacją mszaków”).

Dlaczego: bory chrobotkowe stopniowo przechodzą w bory świeże. W 2021 r. z sieci usunięto 5 stanowisk, na których „chrobotkowe” płaty okazały się fazą rozwojową Leucobryo-Pinetum.`,
      },
      description: {
        hint: 'Rzeźba (wydmy, równina sandrowa), gleba i próchnica, drzewostan (wiek, zwarcie, bonitacja), podszyt, runo porostowe i mszyste.',
        help: `Syntetyczny opis stanowiska w kilku zdaniach:
• rzeźba i podłoże: wydma, sandr, terasa rzeczna; luźne piaski, gleby bielicowe albo rankery, grubość próchnicy (w dobrze zachowanych borach do 2–4 cm, w zdegradowanych ponad 10 cm);
• drzewostan: sosna, ewentualna domieszka brzozy, wiek, zwarcie (optymalnie ok. 0,7), wysokość, bonitacja (zwykle IV, czasem III);
• podszyt: odnowienia sosny, brzozy, jałowiec – i czy zacieniają runo;
• runo: udział i różnorodność chrobotków, mszaki, krzewinki, śmiałek;
• co otacza płat (bory świeże, uprawy, drogi), zarządzający terenem (nadleśnictwo, park narodowy, rezerwat).

Dlaczego: chrobotki są organizmami światłolubnymi i zanikają wraz z eutrofizacją. Opis pozwala kolejnemu obserwatorowi odróżnić naturalną dynamikę od skutków zabiegów i nawożenia z powietrza.`,
      },
      areaHa: {
        help: `Łączna powierzchnia płatu (lub płatów) boru chrobotkowego na stanowisku, w hektarach – nie powierzchnia transektu ani całego wydzielenia. Najlepiej z kartowania granic płatu GPS albo z mapy wydzieleń, pomniejszonej o fragmenty bez runa porostowego. Granica z borem świeżym bywa płynna: opisz w uwagach, jak ją wyznaczyłeś.

Dlaczego: zmiana powierzchni płatu między cyklami monitoringu to podstawa parametru „Powierzchnia siedliska”. W 2021 r. aż 44% stanowisk miało ten parametr w stanie złym.`,
      },
      coordStart: { placeholder: 'N 53°55′; E 17°46′', help: COORD_HELP('początku') },
      coordMiddle: { help: COORD_HELP('środka') },
      coordEnd: { help: COORD_HELP('końca') },
      transect: {
        help: `Faktyczne wymiary transektu. Standard to pas 200×10 m, wyznaczony w miejscu o najlepiej zachowanym siedlisku. Gdy płat jest mniejszy albo węższy, dopasuj transekt i wpisz faktyczne wymiary.

Dlaczego: „Procent powierzchni zajęty przez siedlisko” i pokrycia gatunków liczy się względem transektu. Bez znanych wymiarów wyniki z różnych lat są nieporównywalne.`,
      },
      altitude: {
        placeholder: 'np. 160',
        help: 'Wysokość nad poziomem morza w metrach, z GPS albo mapy. Na wydmach podaj zakres (np. „95–110”), bo grzbiety wydm są zwykle lepiej zachowane niż ich zbocza.',
      },
      date: {
        placeholder: 'DD.MM.RRRR, np. 26.07.2007',
        hint: 'Najlepiej pełna wiosna; porosty są widoczne cały rok, więc lato i jesień też są dopuszczalne.',
        help: `Dzień obserwacji w terenie. Przewodnik zaleca pełną wiosnę, żeby uchwycić rośliny naczyniowe kwitnące w tym okresie. Porosty – najważniejszy element boru – są obecne przez cały rok, więc badania latem i jesienią są dopuszczalne (w 2014 r. prowadzono je od lipca do końca października, w 2021 r. od maja do sierpnia).

Dlaczego: formularz ostrzega o terminie poza kwietniem–październikiem, kiedy śnieg i szron utrudniają ocenę runa.`,
      },
    },
  }),

  releves: {
    defaultCount: 3,
    intro:
      'Metodyka przewiduje trzy zdjęcia fitosocjologiczne w skali Braun-Blanqueta: na początku, w połowie długości i na końcu transektu, każde o powierzchni 100 m² (w przykładowej karcie z przewodnika – 400 m²). Porosty i mszaki wpisuj w warstwie D, oznaczając je do gatunku – od tego zależy ocena chrobotków. Liczbę zdjęć możesz zmieniać.',
    fields: forestReleveFields({
      area: 100,
      helps: {
        coverA:
          'Warstwa A – drzewostan: procent powierzchni zdjęcia przykryty koronami sosny (i ewentualnie brzozy). Typowo 50–100%, najczęściej 70–90%; w dobrze zachowanym starodrzewie optymalnie ok. 70%.\n\nDlaczego: chrobotki potrzebują światła. Zwarcie powyżej 90% w młodszych drzewostanach zacienia runo i przyspiesza jego zanik.',
        coverB:
          'Warstwa B – podszyt: odnowienia sosny (do 2 m), brzozy, jałowiec, kruszyna, czeremcha. W dobrze zachowanym borze do ok. 10%.\n\nDlaczego: podszyt powyżej 10% mocno zacienia runo chrobotkowe i jest sygnałem eutrofizacji.',
        coverC:
          'Warstwa C – rośliny naczyniowe runa: wrzos, borówki, śmiałek pogięty, kostrzewa owcza, siewki drzew. W dobrze zachowanym siedlisku 10–20%, często mniej.\n\nDlaczego: rosnący udział krzewinek i traw to oznaka użyźnienia podłoża – razem z warstwą D daje „stosunek pokrycia” oceniany w stanie ochrony.',
        coverD:
          'Warstwa D – porosty naziemne i mszaki łącznie. Jeśli możesz, w uwagach do zdjęcia rozdziel pokrycie porostów i mszaków (np. „porosty 70%, mszaki 10%”).\n\nDlaczego: to warstwa, która definiuje bór chrobotkowy. Zastępowanie porostów przez mszaki (rokiet, widłozęby) jest pierwszym etapem degradacji.',
        unit:
          'Zbiorowisko, do którego należy zdjęcie, zwykle „Cladonio-Pinetum”. Gdy płat przechodzi w bór świeży, wpisz np. „Leucobryo-Pinetum” albo „Cladonio-Pinetum, postać zdegradowana”.\n\nDlaczego: łączy zdjęcie z opisem zbiorowisk stanowiska i pozwala śledzić przechodzenie boru chrobotkowego w bór świeży.',
      },
    }),
  },

  indicators: [
    forestArea({
      options: AREA,
      inputLabel: 'Jak zmienia się powierzchnia?',
      inputHelp: 'Wybierz kierunek zmiany powierzchni płatu.',
      label: 'Powierzchnia siedliska na stanowisku',
      description: 'Zmiana powierzchni płatu boru chrobotkowego w porównaniu z wcześniejszymi badaniami lub danymi z literatury.',
      help: `Co wybrać: jak zmieniła się powierzchnia płatu 91T0 od poprzedniej obserwacji. W polu wartości podaj powierzchnię i źródło porównania, np. „9,39 ha, bez zmian od 2014 r.”.

Przy pierwszej obserwacji, bez danych do porównania, wybierz „nie podlega zmianom” albo oceń XX i napisz to w opisie.

Dlaczego: bory chrobotkowe zanikają w wyniku sukcesji i eutrofizacji – runo porostowe zastępują mszaki i krzewinki, a płat staje się borem świeżym. W 2021 r. 44% stanowisk miało ten parametr w stanie złym (U2), wobec 32% w pierwszym cyklu.`,
      thresholds: {
        FV: 'Nie podlega zmianom lub zwiększa się',
        U1: 'Inne kombinacje',
        U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze',
      },
    }),
    {
      id: 'characteristic',
      label: 'Charakterystyczna kombinacja florystyczna',
      parameter: 'structure',
      cardinal: true,
      description:
        'Procent gatunków z listy kombinacji charakterystycznej Cladonio-Pinetum obecnych na transekcie: sosna, 5 chrobotków i 4 gatunki runa.',
      help: `Co wpisać: wszystkie gatunki charakterystyczne stwierdzone na transekcie, z pokryciem w %. Formularz liczy, ile z 10 gatunków listy jest obecnych:
• drzewostan – sosna zwyczajna Pinus sylvestris;
• porosty – chrobotek leśny Cladonia arbuscula (z podgatunkami squarrosa i mitis), chrobotek reniferowy C. rangiferina, chrobotek wysmukły C. gracilis, chrobotek gwiazdkowaty C. uncialis, chrobotek widlasty C. furcata;
• runo – wrzos Calluna vulgaris, borówka brusznica Vaccinium vitis-idaea, borówka czarna V. myrtillus, śmiałek pogięty Deschampsia flexuosa.
Inne gatunki boru (np. chrobotek alpejski, rzęsiak pospolity, kostrzewa owcza) możesz dopisać – trafią do opisu, ale nie liczą się do procentu.

Progi (tab. 2): 80–100% gatunków – FV; 60–79% – U1; poniżej 50% – U2. Luka 50–59% w tabeli – formularz podpowiada U1 (interpretacja). Lista 10 gatunków to zestaw z tab. 1 przewodnika i sprawozdania 2021; jeśli w Twoim regionie GIOŚ stosuje inną listę, oceń ręcznie.

Dlaczego: runo z dużym udziałem chrobotków przy słabym udziale roślin naczyniowych definiuje zespół. W 2021 r. tylko 44% stanowisk miało ten wskaźnik w stanie właściwym. Wskaźnik kardynalny.`,
      thresholds: {
        FV: '80–100% wszystkich gatunków',
        U1: '60–79%',
        U2: '<50%',
      },
      inputs: [
        speciesInput(
          'Gatunki charakterystyczne',
          'Gatunki charakterystyczne drzewostanu, runa i warstwy porostowo-mszystej z pokryciem w % transektu. Podgatunki chrobotka leśnego (squarrosa, mitis) liczą się jako jeden gatunek.',
          true,
        ),
      ],
      suggest: (i) => {
        const rows = speciesRows(i.species).filter((r) => r.name?.trim())
        if (!rows.length) return null
        return gradeCharacteristic(characteristicSummary(rows).percent)
      },
      explain: (i) => {
        const s = characteristicSummary(speciesRows(i.species))
        if (!s.present.length && !s.extra.length) return null
        return [
          `Z listy ${CHARACTERISTIC_91T0.length} gatunków obecnych: ${s.present.length} (${plNum(s.percent)}%).`,
          s.missing.length ? `Brak: ${s.missing.join(', ')}.` : '',
          s.percent >= 50 && s.percent < 60 ? 'Wynik w luce tab. 2 (50–59%) – podpowiedź U1 (interpretacja).' : '',
        ]
          .filter(Boolean)
          .join(' ')
      },
      warn: (i) => {
        const rows = speciesRows(i.species)
        const bad = [...namesOfGroup(rows, 'invasive'), ...namesOfGroup(rows, 'expansive'), ...namesOfGroup(rows, 'eco-alien')]
        return bad.length
          ? `Na liście są gatunki obce, ekspansywne albo niezgodne z siedliskiem (${bad.join(', ')}) – wpisz je we właściwym wskaźniku.`
          : null
      },
      describe: (i) => describeSpecies(speciesRows(i.species)),
    },
    measureIndicator({
      id: 'share',
      label: 'Udział procentowy siedliska na transekcie',
      description: 'Procent powierzchni transektu zajęty przez bór chrobotkowy (z dokładnością do 10%).',
      help: `Co wpisać: jaki procent powierzchni transektu zajmuje siedlisko 91T0, z dokładnością do 10%. W opisie dodaj, czym zajęta jest reszta (np. „zbocza wydmy z borem świeżym, runo mszyste z borówką”).

Progi (tab. 2): 70–100% – FV; 50–70% – U1; poniżej 30% – U2. Luka 30–49% w tabeli – formularz podpowiada U1 (interpretacja).

Dlaczego: dynamika siedliska bywa różna nawet w jednym wydzieleniu – na grzbietach wydm bór chrobotkowy jest zwykle lepiej zachowany niż na zboczach, gdzie spływa materia organiczna. W 2021 r. 43% stanowisk miało ten wskaźnik w stanie złym.`,
      thresholds: { FV: '70–100%', U1: '50–70%', U2: '<30%' },
      field: {
        name: 'value',
        label: 'Udział siedliska na transekcie',
        unit: '%',
        max: 100,
        help: 'Procent powierzchni transektu zajęty przez bór chrobotkowy, z dokładnością do 10%. Wpisz liczbę – formularz podpowie ocenę.',
      },
      grade: gradeShare,
    }),
    {
      ...speciesCoverIndicator({
        id: 'invasive',
        label: 'Obce gatunki inwazyjne',
        description:
          'Gatunki obce geograficznie we wszystkich warstwach, np. czeremcha amerykańska, dąb czerwony, mech krzywoszczeć przywłoka.',
        help: `Co wpisać: każdy gatunek obcy geograficznie na transekcie, z pokryciem w %, i czy jest nieliczny, czy liczny. Brak – zostaw pustą listę.

W 2021 r. najczęściej notowano czeremchę amerykańską Padus serotina (10 stanowisk) i – po raz pierwszy – krzywoszczeć przywłokę Campylopus introflexus (8 stanowisk), inwazyjny mech, który zarasta runo porostowe. Rzadziej: dąb czerwony, sosnę Banksa, sosnę wejmutkę, daglezję.

Progi (tab. 2): brak – FV; są, ale nieliczne – U1; liczne – U2. Bez wybranej liczebności formularz uzna za „liczne” łączne pokrycie ponad ${MANY_COVER}% (interpretacja).

Dlaczego: przewodnik uznawał inwazję w ubogim borze za mało prawdopodobną, ale w 2021 r. obce gatunki były już na 1/3 stanowisk. Wskaźnik pomocniczy.`,
        thresholds: { FV: 'Brak', U1: 'Są, ale nieliczne', U2: 'Liczne' },
        inputLabel: 'Obce gatunki inwazyjne',
        inputHelp: 'Gatunki obce geograficznie z pokryciem w % transektu (z dokładnością do 10%, dla „<1%” wpisz 0,5). Brak – zostaw pustą listę.',
        grade: (c, i) => gradeAliens(c, i.abundance),
        emptyText: 'Brak',
        after: [optionalSelect('abundance', 'Liczebność', ABUNDANCE, ABUNDANCE_HELP('gatunki obce'))],
      }),
      describe: (i) => aliensDescribe(i, 'Brak'),
    },
    {
      ...speciesCoverIndicator({
        id: 'expansive',
        label: 'Rodzime gatunki ekspansywne roślin zielnych',
        description:
          'Łączne pokrycie rodzimych gatunków ekspansywnych. Krzewinki i trawy charakterystyczne (wrzos, borówki, śmiałek) przy dużym udziale (≥3 w skali Braun-Blanqueta) też są ekspansywne.',
        help: `Co wpisać: rodzime gatunki ekspansywne z pokryciem w % transektu. Wpisz tu także gatunki charakterystyczne runa, jeśli ich pokrycie jest duże (≥3 w skali Braun-Blanqueta, czyli ponad 25%): śmiałek pogięty, borówkę czarną i brusznicę, wrzos, a także kostrzewę owczą i pszeńca. Pozostałe przykłady: trzcinnik piaskowy, trzęślica modra, orlica. Gatunków obcych geograficznie tu nie wpisuj.

Progi (tab. 2): łączne pokrycie 0–10% – FV; 11–20% – U1; ponad 20% – U2.

Dlaczego: na skrajnie ubogim podłożu rośliny zielne rosną słabo, więc ich ekspansja to bezpośredni sygnał użyźnienia (opad azotu, rozkład gałęzi). W 2021 r. obniżone oceny dawały głównie śmiałek, borówki i wrzos. Wskaźnik pomocniczy.`,
        thresholds: { FV: '0–10%', U1: '11–20%', U2: '>20%' },
        inputLabel: 'Rodzime gatunki ekspansywne',
        inputHelp: 'Gatunki ekspansywne z pokryciem w % transektu. Brak – zostaw pustą listę (FV).',
        grade: ({ count, total }) => (count === 0 ? 'FV' : total === undefined ? null : gradeExpansive(total)),
        emptyText: 'Brak',
      }),
      warn: (i) => {
        const inv = namesOfGroup(speciesRows(i.species), 'invasive')
        if (inv.length) return `${inv.join(', ')} to gatunki obce geograficznie – wpisz je w „Obce gatunki inwazyjne”.`
        const small = speciesRows(i.species).filter((r) => {
          const e = r.name?.trim() && findSpecies91T0(r.name)
          const c = num(r.cover)
          return e && e.expansiveWhenAbundant && c !== undefined && c <= 5
        })
        return small.length
          ? `${small.map((r) => r.name.trim()).join(', ')} – przy małym pokryciu to gatunki charakterystyczne, nie ekspansywne (próg ≥3 w skali B-B, ok. 25%).`
          : null
      },
    },
    {
      id: 'cladonia',
      label: 'Występowanie i stan populacji chrobotków',
      parameter: 'structure',
      cardinal: true,
      description:
        'Skład gatunkowy chrobotków z pokryciem, kondycja plech i zwartość runa porostowego.',
      help: `Co wpisać: gatunki chrobotków (i innych porostów naziemnych) z przybliżonym pokryciem transektu w %, a następnie oceń osobno:
• kondycję plech – dobra (plechy wysokie, nawet do 10 cm, rosną pionowo), średnia albo zła (niskie, płożące się, jakby rozdeptane);
• zwartość runa – zwarte (ewentualnie z niewielkimi przestrzeniami mszaków), słabo albo silnie płatowate.
Formularz podpowiada gorszą z dwóch ocen.

Progi (tab. 2): kondycja plech dobra, runo zwarte – FV; kondycja średnia, runo słabo płatowate – U1; kondycja zła, runo silnie płatowate – U2.

Wskazówki z przewodnika: dominacja jednego gatunku, zwłaszcza chrobotka leśnego, i obecność płucnicy kolczastej Cetraria aculeata świadczą o stadium sukcesyjnym (młodniki 20–30-letnie). Dominacja chrobotka wysmukłego i duża różnorodność („mozaika murawek o różnych odcieniach szarości i zieleni”) – o siedlisku dobrze wykształconym.

Dlaczego: to najprostszy obraz stanu runa i podstawa prognozy dla płatu. W 2021 r. tylko 15% stanowisk miało ten wskaźnik w stanie właściwym. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'Kondycja plech dobra. Runo zwarte',
        U1: 'Kondycja plech średnia. Runo słabo płatowate',
        U2: 'Kondycja plech zła. Runo silnie płatowate',
      },
      inputs: [
        speciesInput(
          'Chrobotki i inne porosty naziemne',
          'Gatunki porostów naziemnych z pokryciem w % transektu (z dokładnością do 10%), np. „Cladonia arbuscula 30”, „Cladonia gracilis 30”. Pole opcjonalne – ocena wynika z dwóch wyborów poniżej.',
        ),
        selectInput('Kondycja plech', THALLUS, 'Jak wyglądają plechy chrobotków: wysokość, pokrój, żywotność.', 'thallus'),
        selectInput('Zwartość runa porostowego', CARPET, 'Czy runo porostowe tworzy zwarty kobierzec, czy rozpada się na płaty.', 'carpet'),
      ],
      suggest: gradeCladonia,
      explain: (i) => {
        const a = gradeMap(THALLUS)[String(i.thallus)]
        const b = gradeMap(CARPET)[String(i.carpet)]
        const n = cladoniaOf(speciesRows(i.species)).length
        const parts = [a && b ? `Plechy: ${a}, runo: ${b} – liczy się gorsza ocena.` : '', n ? `Gatunków chrobotków: ${n}.` : '']
        const s = parts.filter(Boolean).join(' ')
        return s || null
      },
      warn: (i) => {
        const rows = speciesRows(i.species).filter((r) => r.name?.trim())
        const g = gradeCladonia(i)
        if (g === 'FV' && rows.some((r) => findSpecies91T0(r.name)?.latin === 'Cetraria aculeata'))
          return 'Na liście jest płucnica kolczasta – wg przewodnika nie występuje w zbiorowiskach dobrze wykształconych i stabilnych. Sprawdź ocenę FV.'
        const clad = cladoniaOf(rows)
        const covers = clad.map((r) => num(r.cover) ?? 0)
        const total = covers.reduce((a, b) => a + b, 0)
        if (g === 'FV' && clad.length >= 2 && total > 0 && Math.max(...covers) / total >= 0.8)
          return 'Jeden gatunek chrobotka ma ponad 80% pokrycia porostów – przewodnik wiąże jednogatunkowe runo ze stadium sukcesyjnym. Sprawdź ocenę FV.'
        if (g === 'FV' && rows.length === 1) return 'Na liście jest tylko jeden porost – dobrze zachowane runo jest bogate gatunkowo. Sprawdź ocenę FV.'
        return null
      },
      describe: (i) => {
        const list = describeSpecies(speciesRows(i.species))
        const choices = [labelOf(THALLUS, i.thallus), labelOf(CARPET, i.carpet)]
          .map((l) => l.replace(/ \(.*\)$/, ''))
          .filter(Boolean)
          .join('. ')
        return [list, choices].filter(Boolean).join(' – ')
      },
    },
    {
      id: 'ratio',
      label: 'Stosunek pokrycia chrobotków do mchów i roślin naczyniowych',
      parameter: 'structure',
      cardinal: true,
      description:
        'Proporcje w runie między porostami (chrobotkami), mszakami i roślinami naczyniowymi. Do 2015 r.: „Ogólny stosunek pokrycia porostów i mchów do pokrycia roślin naczyniowych”.',
      help: `Co wpisać: pokrycie trzech składników runa (warstwy C i D razem) w procentach transektu: porosty naziemne (głównie chrobotki), mszaki i rośliny naczyniowe (krzewinki, trawy, siewki). Formularz przelicza je na udziały w runie (suma = 100%) i porównuje z tab. 2:
• porosty + mszaki : rośliny naczyniowe – 90–100% : 10–0% FV; 70–80% : 30–20% U1; <60% : >40% U2;
• w tym same porosty – 60–90% FV; 40–60% U1; poniżej 40% U2.
Liczy się gorsza z dwóch ocen. Luki tab. 2 (80–89% i 60–69% porostów z mszakami) formularz traktuje jako U1, a porosty ponad 90% runa jako FV (interpretacja).

Wpisz też proporcję w polu wartości tak jak w karcie papierowej, np. „80/20, całość runa zajmują porosty, mszaki mają bardzo mały udział”.

Dlaczego: dla tego siedliska ważne są trzy, a nie dwa składniki runa – zastępowanie porostów przez mszaki to pierwszy etap degradacji, a wzrost roślin naczyniowych – drugi. W 2021 r. tylko 3 z 54 stanowisk miały ten wskaźnik w stanie właściwym. Wskaźnik kardynalny.`,
      thresholds: {
        FV: '90–100% : 10–0%. W tym porosty od 60 do 90%',
        U1: '70–80% : 30–20%. W tym porosty od 40 do 60%',
        U2: '<60% : >40%. W tym porosty mniej niż 40%',
      },
      inputs: [
        {
          kind: 'number',
          name: 'lichens',
          label: 'Porosty (chrobotki)',
          unit: '%',
          min: 0,
          max: 100,
          required: true,
          help: 'Pokrycie porostów naziemnych (głównie chrobotków i płucnic) w % powierzchni transektu.\n\nDlaczego: to składnik definiujący bór chrobotkowy – w tab. 2 ma osobny próg („w tym porosty”).',
        },
        {
          kind: 'number',
          name: 'mosses',
          label: 'Mszaki',
          unit: '%',
          min: 0,
          max: 100,
          required: true,
          help: 'Pokrycie mchów i wątrobowców (rokiet, widłozęby, płonniki, rzęsiak) w % powierzchni transektu.\n\nDlaczego: mszaki z porostami tworzą „część zarodnikową” runa; rosnący udział mszaków kosztem porostów to sygnał degradacji.',
        },
        {
          kind: 'number',
          name: 'vascular',
          label: 'Rośliny naczyniowe',
          unit: '%',
          min: 0,
          max: 100,
          required: true,
          help: 'Pokrycie roślin naczyniowych runa (krzewinki, trawy, zioła, siewki drzew) w % powierzchni transektu.\n\nDlaczego: w dobrze zachowanym borze to zwykle 10–20% lub mniej. Wzrost świadczy o użyźnieniu podłoża.',
        },
      ],
      suggest: (i) => {
        const r = groundRatio(i)
        return r ? gradeRatio(r) : null
      },
      explain: (i) => {
        const r = groundRatio(i)
        if (!r) return null
        return `Porosty i mszaki : rośliny naczyniowe = ${plNum(r.cryptogams)} : ${plNum(Math.round((100 - r.cryptogams) * 10) / 10)}; same porosty – ${fmt(r.lichens)} runa.`
      },
      describe: (i) => {
        const r = groundRatio(i)
        if (!r) return ''
        return `${plNum(Math.round(r.cryptogams))}/${plNum(Math.round(100 - r.cryptogams))}, w tym porosty ${fmt(Math.round(r.lichens))} (porosty ${fmt(num(i.lichens))}, mszaki ${fmt(num(i.mosses))}, rośliny naczyniowe ${fmt(num(i.vascular))} pokrycia)`
      },
    },
    {
      ...measureIndicator({
        id: 'age',
        label: 'Wiek drzewostanu',
        description: 'Średni wiek drzewostanu sosnowego oraz wiek i udział starodrzewu.',
        help: `Co wpisać: średni wiek drzewostanu w latach, najlepiej z operatu urządzeniowego albo Banku Danych o Lasach. W opisie podaj wiek i udział starodrzewu, np. „121 lat, dobrze zachowany starodrzew”.

Progi (tab. 2): drzewostan ponad 90 lat – FV; 50–90 lat – U1; poniżej 50 lat – U2.

Status: w przewodniku (2010) wskaźnik kardynalny, ale w monitoringu 2021 GIOŚ nie traktował go jako kardynalnego – badania pokazały, że kluczowe są światło i eutrofizacja, a nie wiek (Węgrzyn i in. 2021: o zaniku porostów decyduje raczej wysokość drzew). Formularz stosuje praktykę 2021 r. Jeśli zlecający wymaga metodyki 2010, uwzględnij to przy ocenie struktury ręcznie.

Dlaczego: starodrzew na ubogim podłożu sam tworzy niskie zwarcie (ok. 0,7), co sprzyja chrobotkom. Wiele stanowisk to jednak drzewostany 40–60-letnie.`,
        thresholds: { FV: 'Drzewostan >90 lat', U1: '50–90 lat', U2: '<50 lat' },
        field: {
          name: 'value',
          label: 'Średni wiek drzewostanu',
          unit: 'lat',
          max: 300,
          help: 'Średni wiek drzewostanu w latach, z operatu urządzeniowego, BDL albo oszacowany. Wpisz liczbę – formularz podpowie ocenę.',
        },
        grade: gradeAge,
      }),
      inputs: [
        {
          kind: 'number',
          name: 'value',
          label: 'Średni wiek drzewostanu',
          unit: 'lat',
          min: 0,
          max: 300,
          required: true,
          help: 'Średni wiek drzewostanu w latach, z operatu urządzeniowego, BDL albo oszacowany. Wpisz liczbę – formularz podpowie ocenę.',
        },
        {
          kind: 'number',
          name: 'oldShare',
          label: 'Udział starodrzewu',
          unit: '%',
          min: 0,
          max: 100,
          help: 'Udział drzew starszych niż 90 lat w drzewostanie, w %. Pole opcjonalne, służy dokumentacji (przewodnik każe opisać „wiek i udział procentowy starodrzewu”).',
        },
      ],
      describe: (i) => {
        const v = num(i.value)
        const s = num(i.oldShare)
        return [v === undefined ? '' : `${plNum(v)} lat`, s === undefined ? '' : `udział starodrzewu ${fmt(s)}`].filter(Boolean).join(', ')
      },
    },
    choiceIndicator({
      id: 'deadWood',
      label: 'Obecność drewna martwego w dnie lasu',
      cardinal: true,
      description:
        'Ilość martwego drewna w dnie lasu, zwłaszcza gałęzi i konarów pozostawionych po zabiegach hodowlanych. W 91T0 drewno jest niepożądane.',
      help: `Co wybrać: ile martwego drewna leży w dnie lasu na transekcie. W opisie podaj, skąd pochodzi (naturalny opad, pozostałości po trzebieży, stosy gałęzi) i na jakiej części transektu leży.

Progi (tab. 2): brak drewna – FV; niewielka ilość drewna martwego z naturalnego opadu – U1; duża ilość martwego drewna (np. stosy gałęzi) – U2. W 2014 r. pojedynczych pni i gałęzi nie brano pod uwagę (formularz to stosuje).

Uwaga: odwrotnie niż w innych lasach! Dużo drewna w borze chrobotkowym w krótkim czasie wzbogaca podłoże w substancje biogenne, rośnie konkurencja mszaków i roślin zielnych, a porosty zanikają – po pozostawieniu gałęzi po trzebieży nawet w ciągu 1–2 sezonów.

Dlaczego: w 2021 r. udział stanowisk z oceną U2 wzrósł z 3% do 17%. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'Brak drewna',
        U1: 'Niewielka ilość drewna martwego z naturalnego opadu',
        U2: 'Duża ilość martwego drewna (np. stosy gałęzi)',
      },
      options: DEAD_WOOD,
      inputLabel: 'Ilość martwego drewna',
      inputHelp: 'Wybierz opis najbliższy temu, co widać na transekcie.',
    }),
    {
      ...speciesCoverIndicator({
        id: 'alienTrees',
        label: 'Gatunki obce w drzewostanie',
        description: 'Drzewa obce geograficznie (np. sosna Banksa, sosna wejmutka, dąb czerwony, daglezja) w drzewostanie.',
        help: `Co wpisać: gatunki obce w drzewostanie z przybliżonym pokryciem transektu w % i ich liczebność. Brak – zostaw pustą listę. Nasadzenia rodzimych dębów i buka wpisuj w „Obecność nasadzeń drzew”.

Progi (tab. 2): brak – FV; są nieliczne – U1; są bardzo liczne – U2. Bez wybranej liczebności formularz uzna za „bardzo liczne” łączne pokrycie ponad ${MANY_COVER}% (interpretacja).

Dlaczego: na skrajnie ubogim podłożu sosna ma zdecydowaną przewagę, więc obce drzewa pojawiają się głównie przez dosadzanie i zmieniają charakter zbiorowiska. W 2021 r. tylko 1 stanowisko miało U1 (sosna Banksa). Wskaźnik pomocniczy.`,
        thresholds: { FV: 'Brak', U1: 'Są nieliczne', U2: 'Są bardzo liczne' },
        inputLabel: 'Gatunki obce w drzewostanie',
        inputHelp: 'Gatunki drzew obce geograficznie z pokryciem w % transektu. Brak – zostaw pustą listę.',
        grade: (c, i) => gradeAliens(c, i.abundance),
        emptyText: 'Nie występują',
        after: [optionalSelect('abundance', 'Liczebność', ABUNDANCE, ABUNDANCE_HELP('obce drzewa'))],
      }),
      warn: (i) => {
        const own = speciesRows(i.species)
          .filter((r) => r.name?.trim())
          .filter((r) => {
            const g = findSpecies91T0(r.name)?.group
            return g === 'tree'
          })
          .map((r) => r.name.trim())
        return own.length ? `${own.join(', ')} to gatunki właściwe dla boru – nie wpisuj ich jako obcych.` : null
      },
      describe: (i) => aliensDescribe(i, 'Nie występują'),
    },
    {
      ...choiceIndicator({
        id: 'regeneration',
        label: 'Naturalne odnowienie drzewostanu',
        description:
          'Obecność i ilość odnowienia (sosny, brzozy). Inaczej niż w innych lasach: najlepsze jest odnowienie nieliczne, a ekspansja podrostu wskazuje na eutrofizację.',
        help: `Co wpisać: gatunki odnowienia z pokryciem transektu w % (np. „Pinus sylvestris 10”) i ocenę ilości.

Progi (tab. 2): występuje, ale w małych ilościach – FV; liczne lub całkowity brak – U1; bardzo liczne – U2. Przewodnik w opisie (tab. 1) uznaje także brak odnowienia za dopuszczalny, ale tab. 2 i sprawozdanie 2021 oceniają brak na U1 – formularz trzyma się tab. 2.

Dlaczego: podszyt powyżej ok. 10% zacienia światłolubne runo chrobotkowe. Usuwanie nadmiaru odnowień sosny i dębu przewodnik wymienia jako metodę ochrony czynnej. Wskaźnik pomocniczy.`,
        thresholds: {
          FV: 'Występują, ale w małych ilościach',
          U1: 'Liczne lub całkowity brak',
          U2: 'Bardzo liczne',
        },
        options: REGENERATION,
        inputLabel: 'Ilość odnowienia',
        inputHelp: 'Wybierz opis najbliższy temu, co widać na transekcie.',
        before: [
          speciesInput(
            'Gatunki odnowienia',
            'Gatunki odnowienia (nalot, podrost) z pokryciem w % transektu, np. „Pinus sylvestris 10”, „Betula pendula 2”. Pole opcjonalne – ocena wynika z wyboru poniżej.',
          ),
        ],
      }),
      warn: (i) => {
        const { count, total } = listCover(i)
        if (i.choice === 'none' && count) return 'Wybrano „całkowity brak odnowienia”, a lista odnowienia nie jest pusta.'
        if (i.choice === 'few' && total !== undefined && total > 10)
          return `Odnowienie pokrywa ${fmt(total)} transektu – przewodnik za normę uznaje do ok. 10%. Sprawdź, czy to nadal „małe ilości”.`
        return null
      },
      describe: (i) => {
        const list = describeSpecies(speciesRows(i.species))
        return [list, labelOf(REGENERATION, i.choice).replace(/ \(.*\)$/, '').toLowerCase()].filter(Boolean).join(' – ')
      },
    },
    plantings({
      options: PLANTINGS,
      inputLabel: 'Nasadzenia',
      inputHelp: 'Wybierz opis najbliższy temu, co widać na transekcie.',
      description:
        'Nasadzenia drzew, głównie dębu szypułkowego i buka, rozmieszczone w równych odstępach pod starym drzewostanem sosnowym.',
      help: `Co wpisać: gatunki sadzone na transekcie z przybliżonym pokryciem w % i ocenę ich liczebności. Nasadzenia łatwo odróżnić od samosiewu – rosną w równych odstępach pod okapem sosny.

Progi (tab. 2): brak – FV; są nieliczne – U1; są bardzo liczne – U2.

Dlaczego: dęby mają palowy system korzeniowy – sadzi się je, żeby „podciągnąć” wodę i uwodnić suchy bór. To użyźnia siedlisko: rośliny zielne zyskują dostęp do wody i wypierają chrobotki. Wskaźnik pomocniczy.`,
      thresholds: { FV: 'Brak', U1: 'Są nieliczne', U2: 'Są bardzo liczne' },
    }),
    loggingDamage({
      id: 'logging',
      label: 'Pozyskanie drewna i inne przekształcenia związane z użytkowaniem',
      options: LOGGING,
      inputLabel: 'Skala przekształceń',
      inputHelp: 'Wybierz opis najbliższy temu, co widać na stanowisku.',
      description:
        'Negatywne skutki gospodarki leśnej, najczęściej pozostawianie resztek pozrębowych, a także zręby, zrywka, przygotowanie gleby.',
      help: `Co wybrać: jak silnie użytkowanie przekształciło płat. W opisie podaj, co zauważyłeś (np. „po trzebieży pozostawiono drobnicę na całym wydzieleniu”, „rezerwat, brak użytkowania”).

Progi (tab. 2): słabe – FV; średnie – U1; duże – U2.

Sama trzebież nie szkodzi, a nawet pomaga (więcej światła w runie). Szkodzi pozostawienie ściętego drewna, które szybko się rozkłada i użyźnia podłoże – po ok. 2 latach runo chrobotkowe zanika. Dawne grabienie ściółki i zbieranie chrustu sprzyjało borom chrobotkowym.

Dlaczego: gospodarka leśna to drugie najczęstsze zagrożenie 91T0 (2021: 10 stanowisk). Wskaźnik pomocniczy.`,
      thresholds: { FV: 'Słabe', U1: 'Średnie', U2: 'Duże' },
    }),
    standDamage({
      id: 'standDamage',
      label: 'Zniszczenia drzewostanów – wiatrołomy, gradacje owadów',
      options: DAMAGE,
      inputLabel: 'Intensywność zniszczeń',
      fieldLabel: 'Zniszczony drzewostan',
      fieldHelp: 'Szacunkowy procent zniszczonego drzewostanu (z dokładnością do 10%). Pole opcjonalne – ocena wynika z wyboru powyżej.',
      description: 'Obecność i intensywność uszkodzeń drzewostanu: wiatrołomy, gradacje owadów, choroby (np. huba korzeniowa).',
      help: `Co wybrać: czy drzewostan na transekcie jest uszkodzony i jak intensywnie. W opisie podaj rodzaj zniszczeń i szacunkowy procent zniszczonego drzewostanu (np. „pojedyncze sosny porażone hubą korzeniową, ok. 10%”).

Progi (tab. 2): brak – FV; istnieją, ale ich intensywność na średnim poziomie – U1; bardzo intensywne – U2.

Dlaczego: przewodnik uznaje ten czynnik za mało ważny dla 91T0 – przerzedzenie drzewostanu może nawet poprawić warunki świetlne dla chrobotków. W 2021 r. 89% stanowisk miało FV. Wskaźnik pomocniczy.`,
      thresholds: {
        FV: 'Brak',
        U1: 'Istnieją, ale ich intensywność na średnim poziomie',
        U2: 'Bardzo intensywne',
      },
    }),
  ],

  prospects: {
    description:
      'Realne możliwości ochrony siedliska i utrzymania go w stanie niepogorszonym: status ochronny, zapisy planów i operatów, czynniki biotyczne i antropogeniczne, gospodarka, turystyka.',
    help: `Co wpisać: ekspercką ocenę przyszłości płatu. Zwróć uwagę na:
• aktualny stan ochrony – rezerwat, park narodowy, obszar ochrony ścisłej, zapisy planu zadań ochronnych i operatu urządzeniowego;
• eutrofizację – opad azotu z powietrza, rozkład pozostawionego drewna, grubość próchnicy;
• sukcesję – ekspansję mszaków, krzewinek, śmiałka i podrostu sosny, przechodzenie w bór świeży;
• gospodarkę leśną – planowane trzebieże i to, czy drewno będzie wywożone;
• penetrację – zbieranie grzybów i chrobotków, wydeptywanie plech;
• ochronę czynną – grabienie ściółki, wybieranie drewna, rozluźnianie drzewostanu, usuwanie odnowień.

Przewodnik i sprawozdanie 2014: bez ochrony czynnej nawet dobrze dziś zachowane płaty szybko się pogorszą. Najlepsze perspektywy mają płaty w Polsce północnej i zachodniej (Bory Tucholskie, Puszcza Notecka).

Dlaczego: perspektywy to osobny parametr oceny ogólnej. W 2021 r. 43% stanowisk miało go w stanie złym.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  // Kody leśne ze wspólnej listy + kody ze sprawozdań 2013–2014 i 2021 dla 91T0.
  impactCodes: [
    ...FOREST_IMPACT_CODES.filter((c) => c.code !== 'F04'),
    { code: 'F04', name: 'Pozyskiwanie roślin (grzybobranie, zbieranie chrobotków)' },
    { code: 'F04.02', name: 'Zbieractwo (grzyby, porosty, jagody)' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'H04', name: 'Zanieczyszczenie powietrza, zanieczyszczenia przenoszone drogą powietrzną' },
    { code: 'H04.03', name: 'Inne zanieczyszczenia powietrza (związki azotu)' },
    { code: 'J03.01', name: 'Zmniejszenie lub utrata określonych cech siedliska' },
    { code: 'K02.02', name: 'Nagromadzenie materii organicznej' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ].sort((x, y) => x.code.localeCompare(y.code)),

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. rzadkie porosty (chrobotek alpejski, płucnica śniegowa, chróścik), porosty epifityczne (brodaczki), mącznica.',
        help: `Wartości przyrodnicze stanowiska poza samym siedliskiem 91T0: rzadkie i zagrożone porosty naziemne (np. chrobotek alpejski Cladonia stellaris, płucnica śniegowa, chróścik wielkanocny Stereocaulon paschale), porosty na korze sosen (brodaczki Usnea), chronione rośliny (mącznica lekarska, widliczki). Brak – „Nie stwierdzono”.

Dlaczego: obecność rzadkich gatunków świadczy o dawnym bogactwie płatu i podnosi jego priorytet w planowaniu ochrony czynnej.`,
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: `Jakie zabiegi ochronne wykonano i jak skutecznie, oraz propozycje działań. Typowe dla 91T0: rozluźnienie drzewostanu do zwarcia ok. 0,7 z usunięciem biomasy, grabienie ściółki i warstwy mszystej, wybieranie drewna i gałęzi (także po trzebieżach), usuwanie nadmiaru odnowień sosny i dębu, ograniczanie penetracji. Brak działań – „Brak”, np. „Obszar ochrony ścisłej, nie są wykonywane działania ochrony czynnej”.

Dlaczego: w 2021 r. działania ochronne zaproponowano dla 59% stanowisk, a wykonano na jednym. Bez tej informacji nie da się odróżnić naturalnych zmian od skutków zabiegów.`,
      }
    return f
  }),

  speciesCatalog: SPECIES_91T0.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer91T0(s) })),
  speciesInfo: (name) => {
    const e = findSpecies91T0(name)
    if (!e) return undefined
    const label = GROUP_LABELS_91T0[e.group]
    return e.characteristic ? `${label}, z kombinacji charakterystycznej` : label
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator91T0 = (id: string): IndicatorDef => {
  const i = methodology91T0.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id}`)
  return i
}
