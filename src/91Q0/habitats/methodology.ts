// Metodyka 91Q0 jako dane. Źródło: Perzanowska J. 2010. Górskie reliktowe laski sosnowe Erico-Pinion. W: Mróz W. (red.)
// „Monitoring siedlisk przyrodniczych. Przewodnik metodyczny. Część I”, GIOŚ, s. 284–294 (tab. 1 i 2), z doprecyzowaniami
// ze sprawozdań z monitoringu 2006–2008, 2013–2014 i 2021 (gatunki obce ekologicznie, odnowienie buka, zniszczenia naturalne).
// Wspólne typy, ocena i formularz są w src/7120, klocki leśne w src/forest – tu są wyłącznie dane i progi 91Q0.
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import {
  FOREST_IMPACT_CODES,
  byOption,
  choiceIndicator,
  fmt,
  forestArea,
  forestReleveFields,
  forestSiteFields,
  gradeMap,
  labelOf,
  loggingDamage,
  plNum,
  selectInput,
  speciesCoverIndicator,
  speciesInput,
  type GradedOption,
} from '../../forest'
import {
  GROUP_LABELS_91Q0,
  SPECIES_91Q0,
  characteristicSummary,
  defaultLayer91Q0,
  findSpecies91Q0,
  namesOfGroup,
  thermophilousSummary,
} from './species'

// ---------- podtypy ----------

export const SUBTYPES_91Q0 = {
  '91Q0-1': '91Q0-1 Reliktowe laski sosnowe w Pieninach',
  '91Q0-2': '91Q0-2 Reliktowe laski sosnowe w Tatrach',
} as const
export type Subtype91Q0 = keyof typeof SUBTYPES_91Q0

// ---------- opcje selectów (z oceną, którą dają) ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'other', label: 'Inne kombinacje (np. niewielki ubytek, zarastanie brzegów płatu)', grade: 'U1' },
  { value: 'decline', label: 'Wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub literaturą', grade: 'U2' },
]

const DOMINANT: SelectOption[] = [
  { value: 'yes', label: 'Tak, dominują w runie' },
  { value: 'no', label: 'Nie, w runie dominują inne gatunki' },
]

const PATTERN: SelectOption[] = [
  { value: 'single', label: 'Pojedyncze osobniki' },
  { value: 'patch', label: 'Łanowo (zwarte płaty)' },
]

const STRUCTURE: GradedOption[] = [
  { value: 'diverse', label: 'Drzewostan zróżnicowany pod względem wysokości i pierśnicy drzew', grade: 'FV' },
  { value: 'evenAged', label: 'Drzewostan jednowiekowy, ale obecny podrost', grade: 'U1' },
  { value: 'uniform', label: 'Drzewostan jednowiekowy, niezróżnicowany pod względem wysokości i pierśnicy', grade: 'U2' },
]

const ALIEN_ABUNDANCE: SelectOption[] = [
  { value: 'single', label: 'Pojedyncze osobniki' },
  { value: 'many', label: 'Liczne populacje' },
]

const PLANTED: SelectOption[] = [
  { value: 'no', label: 'Nie, pojawiły się samoczynnie' },
  { value: 'yes', label: 'Tak, są nasadzenia' },
]

const PINE_REGEN: GradedOption[] = [
  { value: 'diverse', label: 'Obecne odnowienie sosnowe, różnowiekowe', grade: 'FV' },
  { value: 'sporadic', label: 'Sporadyczne odnowienie sosnowe', grade: 'U1' },
  { value: 'none', label: 'Brak odnowienia sosny', grade: 'U2' },
]

const INVADERS: GradedOption[] = [
  { value: 'none', label: 'Brak odnowienia świerka i innych drzew obcych ekologicznie', grade: 'FV' },
  { value: 'single', label: 'Pojedynczy świerk (buk, jodła)', grade: 'U1' },
  { value: 'intensive', label: 'Intensywnie wkraczający świerk (buk, jodła)', grade: 'U2' },
]

const LOGGING: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'single', label: 'Pojedyncze działania, np. usuwanie wywróconych drzew', grade: 'U1' },
  { value: 'managed', label: 'Prowadzona gospodarka leśna', grade: 'U2' },
]

const THERMO_SET: GradedOption[] = [
  { value: 'full', label: 'Pełny zestaw, charakterystyczny dla warunków lokalnych', grade: 'FV' },
  { value: 'present', label: 'Obecne, przynajmniej więcej niż 3 gatunki', grade: 'U1' },
  { value: 'poor', label: 'Brak lub pojedyncze gatunki, każdy w niewielkich liczebnościach', grade: 'U2' },
]

const MECHANICAL: GradedOption[] = [
  { value: 'none', label: 'Brak zniszczeń', grade: 'FV' },
  { value: 'natural', label: 'Tylko pochodzenia naturalnego (osuwiska, obrywy, erozja, osypujący się rumosz)', grade: 'FV' },
  { value: 'humanSmall', label: 'Wywołane przez człowieka, na niewielkiej (<30%) powierzchni', grade: 'U1' },
  { value: 'humanLarge', label: 'Wywołane przez człowieka, na znacznej (>30%) powierzchni', grade: 'U2' },
]

// ---------- progi tab. 2 ----------

const RANK: Record<Grade, number> = { FV: 0, U1: 1, U2: 2, XX: -1 }
const worse = (a: Grade, b: Grade): Grade => (RANK[a] >= RANK[b] ? a : b)

/** Próg „łanowo” z pokrycia, gdy obserwator nie wybrał sposobu występowania – to interpretacja. */
export const PATCH_COVER = 5

/** Gatunki charakterystyczne: >5 i dominują w runie FV, 1–5 U1 (także >5, gdy nie dominują – interpretacja), brak U2. */
export function gradeCharacteristic(count: number, dominant: unknown): Grade {
  if (count === 0) return 'U2'
  if (count > 5) return dominant === 'no' ? 'U1' : 'FV'
  return 'U1'
}

/**
 * Obce inwazyjne / rodzime ekspansywne: brak FV; pojedyncze osobniki, najwyżej `maxSpecies` gatunków U1;
 * łanowo albo więcej gatunków U2. Bez wybranego sposobu występowania „łanowo” = pokrycie gatunku ≥5% (interpretacja).
 */
export function gradeOccurrence(maxSpecies: number) {
  return (c: { count: number }, i: InputValues): Grade | null => {
    if (c.count === 0) return 'FV'
    if (c.count > maxSpecies || i.pattern === 'patch') return 'U2'
    if (i.pattern === 'single') return 'U1'
    const covers = speciesRows(i.species)
      .filter((r) => r.name?.trim())
      .map((r) => num(r.cover))
    if (covers.some((v) => v !== undefined && v >= PATCH_COVER)) return 'U2'
    return covers.every((v) => v !== undefined) ? 'U1' : null
  }
}

/** Gatunki obce w drzewostanie: brak FV; nasadzenia albo >1 gatunek w licznych populacjach U2; reszta U1. */
export function gradeAlienTrees(count: number, i: InputValues): Grade | null {
  if (i.planted === 'yes') return 'U2'
  if (count === 0) return 'FV'
  if (count === 1) return 'U1'
  if (i.abundance === 'many') return 'U2'
  return i.abundance === 'single' ? 'U1' : null
}

/** Naturalne odnowienie: gorsza z ocen odnowienia sosny i wkraczania świerka (buka, jodły). */
export function gradeRegeneration(i: InputValues): Grade | null {
  const pine = gradeMap(PINE_REGEN)[String(i.pine)]
  const inv = gradeMap(INVADERS)[String(i.invaders)]
  return pine && inv ? worse(pine, inv) : null
}

// ---------- pomocnicze ----------

const optionalSelect = (name: string, label: string, options: SelectOption[], help: string): FieldDef => ({
  kind: 'select',
  name,
  label,
  options,
  help,
})

const occurrenceIndicator = (o: {
  id: string
  label: string
  cardinal?: boolean
  maxSpecies: number
  description: string
  help: string
  thresholds: IndicatorDef['thresholds']
  inputLabel: string
  inputHelp: string
  patternHelp: string
}): IndicatorDef => {
  const grade = gradeOccurrence(o.maxSpecies)
  const base = speciesCoverIndicator({
    id: o.id,
    label: o.label,
    cardinal: o.cardinal,
    description: o.description,
    help: o.help,
    thresholds: o.thresholds,
    inputLabel: o.inputLabel,
    inputHelp: o.inputHelp,
    grade,
    emptyText: 'Brak',
    after: [optionalSelect('pattern', 'Jak występują?', PATTERN, o.patternHelp)],
  })
  return {
    ...base,
    explain: (i) => {
      const rows = speciesRows(i.species).filter((r) => r.name?.trim())
      if (!rows.length) return null
      const parts = [`Gatunków: ${rows.length} (U1 dopuszcza najwyżej ${o.maxSpecies}).`]
      if (!i.pattern)
        parts.push(`Nie wybrano sposobu występowania – za „łanowo” formularz uznaje gatunek o pokryciu od ${PATCH_COVER}% (interpretacja).`)
      return parts.join(' ')
    },
    describe: (i) => {
      const list = describeSpecies(speciesRows(i.species))
      if (!list) return 'Brak'
      return i.pattern ? `${list} – ${labelOf(PATTERN, i.pattern).toLowerCase()}` : list
    },
  }
}

const COORD_HELP = (where: string) =>
  `Współrzędne geograficzne ${where} transektu z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie, np. stopnie-minuty-sekundy z N/E. Na skałach transekt rzadko jest prostą linią – podaj punkty, w których zaczyna się, zmienia kierunek i kończy.

Dlaczego: płat trzeba odnaleźć za 6 lat (taki jest cykl monitoringu 91Q0). W tych samych punktach wykonuje się zdjęcia fitosocjologiczne 5×5 m.`

export const methodology91Q0: Methodology = {
  code: '91Q0',
  name: 'Górskie reliktowe laski sosnowe (Erico-Pinion)',
  source:
    'Perzanowska J. 2010. Górskie reliktowe laski sosnowe Erico-Pinion. W: Mróz W. (red.) Monitoring siedlisk przyrodniczych. Przewodnik metodyczny. Cz. I, GIOŚ, s. 284–294 (tab. 1 i 2), z doprecyzowaniami ze sprawozdań z monitoringu 2006–2008, 2013–2014 i 2021',

  siteFields: forestSiteFields({
    code: '91Q0',
    transect: '200x10 m',
    releveArea: 25,
    dateWindow: (iso) => {
      const month = Number(iso.split('-')[1])
      return month === 6 || month === 7
        ? null
        : 'Termin poza czerwcem (Pieniny) i lipcem (Tatry). Część gatunków runa może być przekwitła albo nierozpoznawalna, a pokrycia zaniżone.'
    },
    extra: [
      {
        kind: 'select',
        name: 'subtype',
        label: 'Podtyp siedliska',
        required: true,
        options: (Object.keys(SUBTYPES_91Q0) as Subtype91Q0[]).map((v) => ({ value: v, label: SUBTYPES_91Q0[v] })),
        hint: 'Pieniny (z Pienińskim Pasem Skałkowym) albo Tatry.',
        help: `Wybierz podtyp, do którego należy płat:
• 91Q0-1 – laski sosnowe w Pieninach: Pieniny Właściwe, Pieniny Spiskie (Zielone Skały), Skalice Nowotarskie (Czerwona Skała, Kramnica), Przełom Białki; zb. Pinus sylvestris-Calamagrostis varia i Pinus sylvestris-Carex alba;
• 91Q0-2 – laski sosnowe w Tatrach: Skałka nad Łysą Polaną, Wąwóz Koryciska Wielkie; Vario-Pinetum.

Dlaczego: w obu regionach inny jest skład runa (w Tatrach więcej gatunków wysokogórskich, np. turzyca tatrzańska, pierwiosnek łyszczak, kostrzewa tatrzańska), a sprawozdania podają wyniki osobno dla Pienin i Tatr. Od regionu zależy też optymalny termin badań.`,
      },
    ],
    overrides: {
      siteName: {
        placeholder: 'np. Macelowa Góra',
        help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Macelowa Góra – Kąty”, „Popieska (Masyw Pulsztyna)”, „Skałka nad Łysą Polaną”. Za stanowisko uznaje się wyodrębniony płat siedliska na stokach pojedynczej skały (góry). Jeśli stanowisko jest już w bazie GIOŚ, przepisz nazwę co do znaku.

Dlaczego: laski monitoruje się co 6 lat (cykle 2006–2008, 2013–2014, 2021). Stała nazwa razem z GUID pozwala zestawić kolejne karty i zobaczyć trend.`,
      },
      communities: {
        placeholder: 'np. zb. Pinus sylvestris-Calamagrostis varia',
        help: `Zbiorowiska na stanowisku, nazwami fitosocjologicznymi. W Pieninach: zb. Pinus sylvestris-Calamagrostis varia (laski z trzcinnikiem pstrym) i zb. Pinus sylvestris-Carex alba (laski z turzycą białą). W Tatrach: Vario-Pinetum. Dopisz też zbiorowiska, z którymi płat tworzy mozaikę (murawy naskalne, ciepłolubne zarośla, buczyny).

Dlaczego: reliktowe sośniny to zubożała forma zbiorowisk Erico-Pinion o niejasnej pozycji systematycznej. Zapis zbiorowiska i mozaiki pozwala śledzić, czy płat nie przechodzi w buczynę albo murawę.`,
      },
      description: {
        hint: 'Skała, ekspozycja i nachylenie, podłoże (wapień, dolomit), gleba, drzewostan, podszyt, runo, sąsiednie zbiorowiska.',
        help: `Syntetyczny opis stanowiska w kilku zdaniach:
• gdzie leży płat: skała, grzbiet, półka skalna, ekspozycja (zwykle S lub SW) i nachylenie (zwykle 20–45°);
• podłoże i gleba: wapień albo dolomit, płytkie rędziny, wychodnie, piarg;
• drzewostan: niskie, karłowate sosny, zwarcie, wysokość i pierśnica, czy są buki, świerki, jodły;
• podszyt i runo: krzewy (dereń, jałowiec, irga, jarząb mączny), trzcinnik pstry, turzyca biała, gatunki murawowe;
• co otacza płat (murawy naskalne, buczyny, szosa, szlak) i kto zarządza terenem (park narodowy, nadleśnictwo).

Dlaczego: rozproszenie i fragmentacja płatów są tu naturalne. Opis pozwala kolejnemu obserwatorowi odróżnić naturalną mozaikę od zarastania przez buk i świerk.`,
      },
      areaHa: {
        help: `Łączna powierzchnia płatu (lub płatów) siedliska 91Q0 na stanowisku, w hektarach. Sumuj skartowane płaty, a w miejscach trudno dostępnych oszacuj procentowy udział siedliska w znanej powierzchni, np. wydzielenia albo stoku góry. Płaty 91Q0 bywają bardzo małe: od kilku arów (0,025 ha) do 1–2 ha.

Dlaczego: zmiana powierzchni płatu między cyklami monitoringu to podstawa parametru „Powierzchnia siedliska”.`,
      },
      coordStart: { placeholder: '49° 24\' 30" N 20° 23\' 40" E', help: COORD_HELP('początku') },
      coordMiddle: { help: COORD_HELP('środka') },
      coordEnd: { help: COORD_HELP('końca') },
      transect: {
        help: `Faktyczne wymiary transektu. Standard to pas 200×10 m. Na skałach i stromych stokach często nie da się go wyznaczyć: wtedy transektem obejmij cały płat albo opisz, jak wykonano badania (np. „ze względu na topografię nie wyznaczano transektu, zdjęcia 5×5 m tam, gdzie pozwalał teren”).

Dlaczego: pokrycia gatunków liczy się w procentach powierzchni transektu. Bez znanych wymiarów wyniki z różnych lat są nieporównywalne.`,
      },
      altitude: {
        placeholder: 'np. 470–550',
        help: `Wysokość nad poziomem morza w metrach, z GPS albo mapy. Płaty leżą na stromych stokach, więc zwykle podaj zakres.

Dlaczego: laski rosną od ok. 450 m w Pieninach do ponad 1000 m w Tatrach. Wysokość wpływa na skład runa i tempo zarastania przez świerk.`,
      },
      date: {
        placeholder: 'DD.MM.RRRR, np. 22.06.2021',
        hint: 'Optymalnie czerwiec (Pieniny) i lipiec (Tatry).',
        help: `Dzień obserwacji w terenie. Optymalnie czerwiec w Pieninach i lipiec w Tatrach, gdy runo jest łatwe do rozpoznania, a duża część gatunków kwitnie.

Dlaczego: później w sezonie można się pomylić w pokryciu niektórych gatunków i nie rozpoznać części z nich. Badania w późniejszym terminie są możliwe, ale trzeba to zaznaczyć w uwagach.`,
      },
    },
  }),

  releves: {
    defaultCount: 3,
    intro:
      'Metodyka przewiduje trzy zdjęcia fitosocjologiczne na transekcie, w skali Braun-Blanqueta. Na skałach rób je na powierzchniach 5×5 m (25 m²), jeśli pozwala na to teren, a gdy płat jest mniejszy – na faktycznej powierzchni (w przykładowej karcie 15 m²). Liczbę zdjęć możesz zmieniać.',
    fields: forestReleveFields({
      area: 25,
      helps: {
        coverA:
          'Warstwa A – drzewostan: procent powierzchni zdjęcia przykryty koronami sosen (i ewentualnie innych drzew). Laski są luźne, często z pojedynczymi sosnami na skalistym zboczu – małe zwarcie jest tu normalne.\n\nDlaczego: wysokie zwarcie i udział buka albo świerka w warstwie A to sygnał przekształcania się płatu w las mezofilny.',
        coverB:
          'Warstwa B – podszyt i podrost: dereń świdwa, jałowiec, irga, jarząb mączny, berberys, róże, leszczyna, a także podrost sosny, świerka i buka.\n\nDlaczego: bogaty podszyt jest typowy dla lasków, ale podrost buka i świerka to główne zagrożenie (sukcesja).',
        coverC:
          'Warstwa C – runo: trzcinnik pstry, turzyca biała, sesleria, gatunki naskalne i murawowe (ciepłolubne), siewki drzew.\n\nDlaczego: urozmaicone runo z dużym udziałem gatunków murawowych odróżnia laski od borów i buczyn.',
        coverD:
          'Warstwa D – mszysta: mchy, wątrobowce i porosty naziemne i naskalne.\n\nDlaczego: na płytkich rędzinach i wychodniach warstwa D jest zwykle słaba. Jej skład porównuje się między cyklami.',
        unit:
          'Zbiorowisko, do którego należy zdjęcie, np. „zbiorowisko Pinus sylvestris-Calamagrostis varia”, „zb. Pinus sylvestris-Carex alba” albo „Vario-Pinetum”.\n\nDlaczego: łączy zdjęcie z opisem zbiorowisk stanowiska i pozwala śledzić przechodzenie płatu w buczynę, świerczynę albo murawę.',
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
      help: `Co wybrać: jak zmieniła się powierzchnia płatu 91Q0 od poprzedniej obserwacji. W polu wartości podaj powierzchnię i źródło porównania, np. „Siedlisko zajmuje całość dostępnego terenu, bez zmian od 2014 r.”.

Rozproszenie i fragmentacja płatów są w 91Q0 naturalne i nie obniżają oceny. Obniża ją ubytek powierzchni (np. zarastanie bukiem i jodłą, wycinka w ramach ochrony muraw), izolacja bardzo małych płatów albo bezpośrednie sąsiedztwo infrastruktury (skałki podcięte szosą). Przy pierwszej obserwacji, bez danych do porównania, wybierz „nie podlega zmianom” albo oceń XX i napisz to w opisie.

Dlaczego: powierzchnię laska wyznacza skała – ukształtowanie, nachylenie, ekspozycja i grubość gleby – więc samoczynnego wzrostu nie należy oczekiwać. W 2021 r. 7 z 10 stanowisk miało FV.`,
      thresholds: {
        FV: 'Nie podlega zmianom lub zwiększa się',
        U1: 'Inne kombinacje',
        U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze',
      },
    }),
    {
      id: 'characteristic',
      label: 'Gatunki charakterystyczne',
      parameter: 'structure',
      cardinal: true,
      description:
        'Gatunki charakterystyczne w drzewostanie (sosna), podszycie i runie, typowe dla warunków lokalnych (Pieniny albo Tatry).',
      help: `Co wpisać: gatunki charakterystyczne stwierdzone na transekcie, z pokryciem w %:
• drzewostan – sosna zwyczajna Pinus sylvestris;
• podszyt – dereń świdwa, wiciokrzew suchodrzew, berberys, kruszyna, jałowiec, kalina koralowa, leszczyna, róże, głogi, irgi, jarząb mączny;
• runo – trzcinnik pstry Calamagrostis varia, turzyca biała Carex alba i gatunki ciepłolubne z klas Festuco-Brometea i Elyno-Seslerietea (w Tatrach m.in. turzyca tatrzańska, pierwiosnek łyszczak, kostrzewa tatrzańska).
Wybierz też, czy gatunki charakterystyczne dominują w runie.

Progi (tab. 2): ponad 5 gatunków charakterystycznych dla warunków lokalnych, dominujących w runie – FV; 1–5 gatunków – U1; brak lub tylko pojedyncze osobniki – U2. Gdy jest ponad 5 gatunków, ale w runie dominują inne, formularz podpowiada U1 (interpretacja). Gdy gatunki są, ale tylko w pojedynczych osobnikach, wybierz U2 sam.

Dlaczego: to podstawowy test, czy płat jest jeszcze laskiem sosnowym, a nie murawą albo buczyną. Wskaźnik kardynalny.`,
      thresholds: {
        FV: '>5 gatunków, charakterystycznych dla warunków lokalnych, dominujące w runie',
        U1: '1–5 gatunków charakterystycznych',
        U2: 'Brak, lub tylko pojedyncze osobniki',
      },
      inputs: [
        speciesInput(
          'Gatunki charakterystyczne',
          'Gatunki charakterystyczne drzewostanu, podszytu i runa z pokryciem w % transektu. Warstwę możesz dopisać w opisie („Drzewostan: Pinus sylvestris 70%”).',
          true,
        ),
        optionalSelect(
          'dominant',
          'Czy dominują w runie?',
          DOMINANT,
          'Czy trzcinnik pstry, turzyca biała, sesleria i inne gatunki charakterystyczne tworzą trzon runa. Próg FV z tab. 2 wymaga, żeby gatunki charakterystyczne dominowały w runie.\n\nDlaczego: gdy w runie dominują gatunki lasów mezofilnych (np. pod okapem buka), płat traci charakter lasku mimo obecności wielu gatunków.',
        ),
      ],
      suggest: (i) => gradeCharacteristic(characteristicSummary(speciesRows(i.species)).counted.length, i.dominant),
      explain: (i) => {
        const s = characteristicSummary(speciesRows(i.species))
        if (!s.counted.length && !s.foreign.length) return null
        return [
          `Gatunków charakterystycznych: ${s.counted.length} (z listy przewodnika: ${s.fromCatalog.length}).`,
          s.counted.length > 5 && i.dominant === 'no' ? 'Nie dominują w runie – podpowiedź U1 (interpretacja).' : '',
        ]
          .filter(Boolean)
          .join(' ')
      },
      warn: (i) => {
        const s = characteristicSummary(speciesRows(i.species))
        if (s.foreign.length)
          return `Na liście są gatunki obce ekologicznie, ekspansywne albo inwazyjne (${s.foreign.join(', ')}) – nie liczą się do gatunków charakterystycznych. Wpisz je we właściwym wskaźniku.`
        if (s.counted.length && !s.counted.some((n) => findSpecies91Q0(n)?.latin === 'Pinus sylvestris'))
          return 'Na liście nie ma sosny zwyczajnej – w laskach 91Q0 to jedyny gatunek charakterystyczny drzewostanu.'
        return null
      },
      describe: (i) => {
        const list = describeSpecies(speciesRows(i.species))
        if (!list) return ''
        return i.dominant === 'no' ? `${list}; w runie dominują inne gatunki` : list
      },
    },
    occurrenceIndicator({
      id: 'invasive',
      label: 'Obce gatunki inwazyjne',
      maxSpecies: 1,
      description:
        'Gatunki obce geograficznie we wszystkich warstwach. W laskach sosnowych dotąd ich nie notowano – wskaźnik ujednolica zbieranie danych w kraju.',
      help: `Co wpisać: każdy gatunek obcy geograficznie na transekcie z pokryciem w % i to, czy rośnie w pojedynczych osobnikach, czy łanowo. W monitoringu 2006–2021 w 91Q0 nie stwierdzono żadnego – zwykle zostawisz pustą listę. Najbardziej prawdopodobne są gatunki zawlekane wzdłuż szos i szlaków: niecierpek drobnokwiatowy, nawłocie, przymiotno białe, rdestowiec.

Progi (tab. 2): brak – FV; pojedyncze osobniki jednego gatunku – U1; gatunek występujący łanowo albo więcej niż jeden gatunek – U2. Gdy nie wybierzesz sposobu występowania, formularz uzna za „łanowo” gatunek o pokryciu od ${PATCH_COVER}% (interpretacja).

Dlaczego: zagrożenie jest znikome, ale potencjalnie zawsze istnieje, zwłaszcza na płatach przy drogach. Wskaźnik pomocniczy.`,
      thresholds: {
        FV: 'Brak',
        U1: 'Pojedyncze osobniki, jeden gatunek',
        U2: 'Łanowo występujący gatunek lub więcej niż jeden gatunek',
      },
      inputLabel: 'Obce gatunki inwazyjne',
      inputHelp: 'Gatunki obce geograficznie z pokryciem w % transektu. Brak – zostaw pustą listę.',
      patternHelp:
        'Czy gatunki obce rosną jako pojedyncze osobniki, czy tworzą zwarte płaty (łany). Pojedyncze osobniki jednego gatunku to U1, łan – U2. Pole opcjonalne: bez niego formularz uzna za łan gatunek o pokryciu od 5%.',
    }),
    occurrenceIndicator({
      id: 'expansive',
      label: 'Rodzime gatunki ekspansywne roślin zielnych',
      cardinal: true,
      maxSpecies: 2,
      description:
        'Apofity i gatunki ekologicznie obce dla lasków, pojawiające się pojedynczo albo łanowo w runie (zdjęcia fitosocjologiczne, transekt).',
      help: `Co wpisać: rodzime gatunki ekspansywne i ekologicznie obce dla lasków (np. trzcinnik piaskowy, malina, pokrzywa, wierzbówka kiprzyca) z pokryciem w % i sposobem występowania. Gatunków obcych geograficznie tu nie wpisuj – mają swój wskaźnik. W monitoringu 2014 i 2021 na żadnym stanowisku ich nie stwierdzono.

Progi (tab. 2): brak – FV; pojedyncze osobniki, 1–2 gatunki – U1; gatunek występujący łanowo albo kilka (>2) gatunków – U2. Gdy nie wybierzesz sposobu występowania, formularz uzna za „łanowo” gatunek o pokryciu od ${PATCH_COVER}% (interpretacja).

Dlaczego: skrajne warunki (płytka gleba, susza, strome stoki) chronią laski przed apofitami, więc każdy taki gatunek to sygnał eutrofizacji, wydeptywania albo prześwietlenia. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'Brak',
        U1: 'Pojedyncze osobniki, 1–2 gatunków',
        U2: 'Łanowo występujący gatunek lub kilka (>2) gatunków',
      },
      inputLabel: 'Rodzime gatunki ekspansywne',
      inputHelp: 'Rodzime gatunki ekspansywne z pokryciem w % transektu. Brak – zostaw pustą listę.',
      patternHelp:
        'Czy gatunki ekspansywne rosną jako pojedyncze osobniki, czy tworzą łany. Pojedyncze osobniki 1–2 gatunków to U1, łan – U2. Pole opcjonalne: bez niego formularz uzna za łan gatunek o pokryciu od 5%.',
    }),
    (() => {
      const base = choiceIndicator({
        id: 'structure',
        label: 'Struktura drzewostanu',
        cardinal: true,
        description:
          'Zróżnicowanie drzewostanu pod względem wysokości i pierśnicy drzew. Optimum: drzewostan różnowiekowy z najstarszymi drzewami w wieku min. 60–100 lat.',
        help: `Co wybrać: czy drzewostan jest zróżnicowany pod względem wysokości i pierśnicy. Zmierz albo oszacuj średnią wysokość drzew, zakres pierśnicy i zwarcie koron i wpisz je w polach poniżej. W opisie dodaj gatunki drzew (np. „sosna, w drzewostanie także jodły i pojedyncze buki na obrzeżach”).

Sosny w laskach są niskie i karłowate, więc ich wieku nie da się ocenić „na oko” – wymagałby nawiertów. Wiek oceniaj raczej z historii terenu (np. ochrona i brak użytkowania od kilkudziesięciu lat), a w terenie patrz na wysokość i pierśnicę.

Progi (tab. 2): drzewostan zróżnicowany pod względem wysokości i pierśnicy – FV; jednowiekowy, ale z podrostem – U1; jednowiekowy, niezróżnicowany – U2.

Dlaczego: w 2021 r. obniżenie tego wskaźnika wraz z gatunkami obcymi w drzewostanie przesądziło o pogorszeniu oceny struktury na trzech stanowiskach w Pieninach. Wskaźnik kardynalny.`,
        thresholds: {
          FV: 'Drzewostan zróżnicowany pod względem wysokości i pierśnicy drzew',
          U1: 'Drzewostan jednowiekowy, ale obecny podrost',
          U2: 'Drzewostan jednowiekowy, niezróżnicowany pod względem wysokości i pierśnicy',
        },
        options: STRUCTURE,
        inputLabel: 'Struktura drzewostanu',
        inputHelp: 'Wybierz opis najbliższy temu, co widać na transekcie.',
        after: [
          {
            kind: 'number',
            name: 'height',
            label: 'Średnia wysokość drzew',
            unit: 'm',
            min: 0,
            help: 'Przeciętna wysokość sosen w metrach. Pole opcjonalne, służy dokumentacji. W Pieninach zwykle 6–10 m, w Tatrach najstarsze sosny do 15 m.',
          },
          {
            kind: 'text',
            name: 'dbh',
            label: 'Pierśnica',
            unit: 'cm',
            placeholder: 'np. 20–30, maks. 40',
            help: 'Zakres pierśnicy drzew w centymetrach, np. „20–30, maks. 40”. Pole opcjonalne, służy dokumentacji. Duży rozrzut pierśnic świadczy o zróżnicowaniu drzewostanu.',
          },
          {
            kind: 'number',
            name: 'crown',
            label: 'Zwarcie koron',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Zwarcie koron drzew w procentach. Pole opcjonalne, służy dokumentacji. Laski są zwykle luźne; zwarcie 80–90% z udziałem jodły i buka to sygnał przekształcania się płatu.',
          },
        ],
      })
      return {
        ...base,
        describe: (i: InputValues) => {
          const h = num(i.height)
          const c = num(i.crown)
          const dbh = typeof i.dbh === 'string' && i.dbh.trim() ? `pierśnica ${i.dbh.trim()} cm` : ''
          return [
            labelOf(STRUCTURE, i.choice),
            h === undefined ? '' : `średnia wysokość ${plNum(h)} m`,
            dbh,
            c === undefined ? '' : `zwarcie koron ${fmt(c)}`,
          ]
            .filter(Boolean)
            .join(', ')
        },
      }
    })(),
    {
      id: 'alienTrees',
      label: 'Gatunki obce w drzewostanie',
      parameter: 'structure',
      cardinal: true,
      description:
        'Gatunki obce geograficznie i rodzime, ale niezgodne ekologicznie z laskami: buk, świerk, jodła, jesion, olsza szara, modrzew (sadzony).',
      help: `Co wpisać: gatunki drzew obce dla lasków z udziałem w drzewostanie w %. W 91Q0 za obce uważa się też gatunki rodzime, niezgodne z siedliskiem: buk Fagus sylvatica, świerk Picea abies, jodła Abies alba, jesion Fraxinus excelsior, olsza szara Alnus incana, a także sadzony modrzew. Wybierz, czy występują pojedynczo, czy w licznych populacjach, i czy pochodzą z nasadzeń. Brak – zostaw pustą listę.

Progi (tab. 2): brak – FV; 1 gatunek obcy ekologicznie, pojedyncze osobniki – U1; nasadzenia albo więcej niż 1 gatunek obcy ekologicznie w licznych populacjach – U2. Jeden gatunek formularz ocenia na U1 także przy większym udziale (tak oceniano np. buka 20–30% na Czerteziku w 2014 r. – interpretacja). Kilka gatunków w pojedynczych osobnikach to także U1.

Dlaczego: ekspansja buka, świerka i jodły to dziś główna przyczyna pogorszenia stanu 91Q0 – w 2021 r. obniżyła oceny na trzech stanowiskach w Pienińskim Parku Narodowym. Wskaźnik kardynalny.`,
      thresholds: {
        FV: 'Brak',
        U1: '1 gatunek obcy ekologicznie, pojedyncze osobniki',
        U2: 'Nasadzenia lub więcej niż 1 gatunek obcy ekologicznie, liczne populacje',
      },
      inputs: [
        speciesInput(
          'Gatunki obce w drzewostanie',
          'Gatunki drzew obce geograficznie lub ekologicznie (buk, świerk, jodła, jesion, olsza szara, modrzew) z udziałem w drzewostanie w %. Brak – zostaw pustą listę.',
        ),
        optionalSelect(
          'abundance',
          'Liczebność',
          ALIEN_ABUNDANCE,
          'Czy gatunki obce rosną jako pojedyncze osobniki, czy tworzą liczne populacje (także w podroście i nalocie). Przy kilku gatunkach liczne populacje dają U2, pojedyncze osobniki – U1.',
        ),
        optionalSelect(
          'planted',
          'Czy pochodzą z nasadzeń?',
          PLANTED,
          'Czy obce drzewa zostały posadzone (np. modrzew, świerk na obrzeżach płatu), czy pojawiły się samoczynnie (samosiew buka, świerka). Nasadzenia zawsze dają U2.',
        ),
      ],
      suggest: (i) => {
        const rows = speciesRows(i.species).filter((r) => r.name?.trim())
        return gradeAlienTrees(rows.length, i)
      },
      explain: (i) => {
        const rows = speciesRows(i.species).filter((r) => r.name?.trim())
        if (!rows.length) return i.planted === 'yes' ? 'Nasadzenia – U2.' : null
        const covers = rows.map((r) => num(r.cover)).filter((v): v is number => v !== undefined)
        const total = covers.length ? Math.round(covers.reduce((a, b) => a + b, 0) * 10) / 10 : undefined
        return [
          `Gatunków obcych: ${rows.length}, łączny udział ${fmt(total)}.`,
          rows.length > 1 && !i.abundance && i.planted !== 'yes' ? 'Przy kilku gatunkach wybierz liczebność – od niej zależy U1 albo U2.' : '',
        ]
          .filter(Boolean)
          .join(' ')
      },
      warn: (i) => {
        const own = speciesRows(i.species)
          .filter((r) => r.name?.trim())
          .filter((r) => {
            const e = findSpecies91Q0(r.name)
            return e && (e.group === 'tree' || e.group === 'shrub')
          })
          .map((r) => r.name.trim())
        return own.length ? `${own.join(', ')} to gatunki właściwe dla lasków – nie wpisuj ich jako obcych.` : null
      },
      describe: (i) => {
        const list = describeSpecies(speciesRows(i.species))
        if (!list) return i.planted === 'yes' ? 'Nasadzenia' : 'Brak gatunków obcych'
        return [list, i.abundance ? labelOf(ALIEN_ABUNDANCE, i.abundance).toLowerCase() : '', i.planted === 'yes' ? 'z nasadzeń' : '']
          .filter(Boolean)
          .join(', ')
      },
    },
    {
      id: 'regeneration',
      label: 'Naturalne odnowienie drzewostanu',
      parameter: 'structure',
      description:
        'Odnowienie sosny (siewki, podrost) i wkraczanie gatunków niepożądanych, zwłaszcza świerka, a według monitoringu 2021 także buka i jodły.',
      help: `Co wpisać: gatunki odnowienia (nalot, podrost) z pokryciem transektu w %, a następnie oceń osobno:
• odnowienie sosny – różnowiekowe, sporadyczne albo brak;
• wkraczanie świerka i innych drzew obcych ekologicznie (buk, jodła) – brak, pojedynczo albo intensywnie.
Formularz podpowiada gorszą z dwóch ocen.

Progi (tab. 2): obecne odnowienie sosnowe, różnowiekowe – FV; sporadyczne odnowienie sosnowe lub pojedynczy świerk – U1; brak odnowienia lub intensywnie wkraczający świerk – U2. Buka i jodłę traktuj jak świerk – tak oceniano w 2021 r. (Wąwóz Gorczyński – Budziska: U2 z powodu buka, jodły i świerka w podroście i nalocie).

Dlaczego: w laskach nie należy oczekiwać intensywnego odnowienia sosny. Groźne jest natomiast wkraczanie świerka i buka, które zacieniają płat i wypierają sosnę. Wskaźnik pomocniczy.`,
      thresholds: {
        FV: 'Obecne odnowienie sosnowe, różnowiekowe',
        U1: 'Sporadyczne sosnowe, lub pojedynczy świerk',
        U2: 'Brak, lub wkraczający intensywnie świerk',
      },
      inputs: [
        speciesInput(
          'Gatunki odnowienia',
          'Gatunki w nalocie i podroście z pokryciem w % transektu, np. „Pinus sylvestris 2”, „Picea abies 1”, „Fagus sylvatica 1”. Pole opcjonalne – ocena wynika z dwóch wyborów poniżej.',
        ),
        selectInput('Odnowienie sosny', PINE_REGEN, 'Czy sosna się odnawia i czy jej podrost jest różnowiekowy.', 'pine'),
        selectInput(
          'Wkraczanie świerka (buka, jodły)',
          INVADERS,
          'Czy w nalocie i podroście pojawia się świerk albo inne drzewa obce ekologicznie (buk, jodła).',
          'invaders',
        ),
      ],
      suggest: gradeRegeneration,
      explain: (i) => {
        const pine = gradeMap(PINE_REGEN)[String(i.pine)]
        const inv = gradeMap(INVADERS)[String(i.invaders)]
        if (!pine || !inv) return null
        return `Sosna: ${pine}, świerk (buk, jodła): ${inv} – liczy się gorsza ocena.`
      },
      warn: (i) => {
        const rows = speciesRows(i.species).filter((r) => r.name?.trim())
        const aliens = namesOfGroup(rows, 'eco-alien')
        if (aliens.length && i.invaders === 'none')
          return `Na liście odnowienia są ${aliens.join(', ')}, a wybrano „brak odnowienia świerka i innych drzew obcych ekologicznie”.`
        if (rows.length && i.pine === 'diverse' && !rows.some((r) => findSpecies91Q0(r.name)?.latin === 'Pinus sylvestris'))
          return 'Wybrano różnowiekowe odnowienie sosny, a na liście odnowienia nie ma sosny.'
        return null
      },
      describe: (i) => {
        const list = describeSpecies(speciesRows(i.species))
        const choices = [labelOf(PINE_REGEN, i.pine), labelOf(INVADERS, i.invaders)].filter(Boolean).join('; ')
        return [list, choices].filter(Boolean).join(' – ')
      },
    },
    loggingDamage({
      id: 'logging',
      label: 'Pozyskanie drewna i inne przekształcenia związane z użytkowaniem',
      options: LOGGING,
      inputLabel: 'Pozyskanie i użytkowanie',
      inputHelp: 'Wybierz opis najbliższy temu, co widać na stanowisku.',
      description:
        'Ślady użytkowania płatu: pozyskanie drewna, usuwanie wywróconych i martwych drzew, wycinanie drzew i krzewów (np. przy ochronie muraw).',
      help: `Co wybrać: czy na stanowisku prowadzi się jakiekolwiek użytkowanie. W opisie podaj, co dokładnie zauważyłeś (np. „wycięte usychające świerki”, „ślady usuwania sosen i krzewów przy ochronie czynnej muraw”). Obecność wywałów, wykrotów i martwych drzew stojących i leżących świadczy o braku zabiegów.

Progi (tab. 2): brak – FV; pojedyncze działania, np. usuwanie wywróconych drzew – U1; prowadzona gospodarka leśna – U2.

Dlaczego: strome stoki, funkcja ochronna i niska wartość drewna sprawiają, że gospodarka leśna nie powinna i zwykle nie jest tu prowadzona. Usuwanie drzew i krzewów przy ochronie muraw naskalnych szkodzi laskom, bo usuwa to, co odróżnia je od murawy. Wskaźnik pomocniczy.`,
      thresholds: {
        FV: 'Brak',
        U1: 'Pojedyncze działania, jak np. usuwanie wywróconych drzew',
        U2: 'Prowadzona gospodarka leśna',
      },
    }),
    {
      ...choiceIndicator({
        id: 'thermophilous',
        label: 'Gatunki ciepłolubne w runie',
        description:
          'Gatunki muraw naskalnych, kserotermicznych i górskich (Festuco-Brometea, Elyno-Seslerietea) utrzymujące się w prześwietlonych laskach.',
        help: `Co wpisać: gatunki ciepłolubne w runie z pokryciem transektu w %, np. sesleria skalna, przewiercień sierpowaty, kruszczyk rdzawoczerwony, ożanka górska, ciemiężyk białokwiatowy, kokoryczka wonna, cieciorka pstra, lebiodka, wilczomlecz sosnka, dziewięćsił bezłodygowy, biedrzeniec mniejszy. Potem wybierz, czy zestaw jest pełny dla warunków lokalnych.

Progi (tab. 2): pełny zestaw, charakterystyczny dla warunków lokalnych – FV; obecne, przynajmniej więcej niż 3 gatunki – U1; brak albo pojedyncze gatunki, każdy w niewielkiej liczebności – U2. Obecność nawet kilku z nich wystarcza, żeby zestaw gatunków runa uznać za właściwy. Formularz ostrzega, gdy wybór nie zgadza się z liczbą gatunków na liście.

Dlaczego: laski powstały na miejscu muraw naskalnych i kserotermicznych, a gatunki murawowe zanikają, gdy płat zacienia buk albo świerk. Wskaźnik pomocniczy (w sprawozdaniu 2014 zauważono, że częściowo powtarza „Gatunki charakterystyczne”).`,
        thresholds: {
          FV: 'Pełny zestaw, charakterystyczny dla warunków lokalnych',
          U1: 'Obecne, przynajmniej więcej niż 3 gatunki',
          U2: 'Brak, lub występowanie pojedynczych gatunków, każdy w niewielkich liczebnościach',
        },
        options: THERMO_SET,
        inputLabel: 'Zestaw gatunków ciepłolubnych',
        inputHelp: 'Wybierz opis najbliższy temu, co widać na transekcie.',
        before: [
          speciesInput(
            'Gatunki ciepłolubne',
            'Gatunki ciepłolubne runa z pokryciem w % transektu (dla „<1%” wpisz 0,5).',
          ),
        ],
      }),
      suggest: byOption(gradeMap(THERMO_SET)),
      explain: (i) => {
        const s = thermophilousSummary(speciesRows(i.species))
        if (!s.counted.length) return null
        return `Gatunków na liście: ${s.counted.length} (ciepłolubnych z katalogu: ${s.fromCatalog.length}), łączne pokrycie ${fmt(s.cover)}.`
      },
      warn: (i) => {
        const s = thermophilousSummary(speciesRows(i.species))
        const n = s.counted.length
        if (s.foreign.length) return `Na liście są gatunki obce lub ekspansywne (${s.foreign.join(', ')}) – nie liczą się do gatunków ciepłolubnych.`
        if (!n) return null
        if ((i.choice === 'full' || i.choice === 'present') && n <= 3)
          return `Na liście ${n} gatunki – ocena U1 wymaga więcej niż 3 gatunków ciepłolubnych.`
        if (i.choice === 'poor' && n > 3) return `Na liście ${n} gatunków – U2 dotyczy braku albo pojedynczych gatunków.`
        return null
      },
    },
    {
      ...choiceIndicator({
        id: 'mechanical',
        label: 'Zniszczenia mechaniczne',
        description:
          'Zniszczenia gleby, runa i drzew: antropogeniczne (wydeptywanie, ścieżki, wycięte drzewka) obniżają ocenę, naturalne (osuwiska, obrywy, erozja) – nie.',
        help: `Co wybrać: czy w płacie są zniszczenia mechaniczne i jakie jest ich pochodzenie. Przy zniszczeniach wywołanych przez człowieka oszacuj procent powierzchni płatu, której dotyczą. W opisie podaj rodzaj, np. „wydeptana ścieżka widokowa na grzbiecie”, „wycięte drzewka wzdłuż ścieżki na grani”.

Progi (tab. 2): brak albo pochodzenia naturalnego – FV; wywołane przez człowieka na niewielkiej (<30%) powierzchni – U1; wywołane przez człowieka na znacznej (>30%) powierzchni – U2.

Osuwiska po nawalnych deszczach, obrywy i osypujący się rumosz to procesy naturalne – nie obniżają oceny (w 2021 r. zmieniono z tego powodu ocenę Macelowej Góry – Kąty z U1 na FV), a nawet odmładzają płaty.

Dlaczego: na skałach widokowych i grzbietach z perciami wydeptywanie niszczy cienką warstwę gleby i runo. Wskaźnik pomocniczy.`,
        thresholds: {
          FV: 'Brak lub pochodzenia naturalnego',
          U1: 'Wywołane przez działalność człowieka, na niewielkiej (<30%) powierzchni',
          U2: 'Wywołane przez działalność człowieka, na znacznej (>30%) powierzchni',
        },
        options: MECHANICAL,
        inputLabel: 'Zniszczenia mechaniczne',
        inputHelp: 'Wybierz rodzaj i skalę zniszczeń.',
        after: [
          {
            kind: 'number',
            name: 'share',
            label: 'Powierzchnia zniszczeń antropogenicznych',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Procent powierzchni płatu ze zniszczeniami wywołanymi przez człowieka. Pole opcjonalne – formularz sprawdza zgodność z wybraną klasą (próg 30%).',
          },
        ],
      }),
      warn: (i) => {
        const v = num(i.share)
        if (v === undefined) return null
        if (i.choice === 'humanSmall' && v > 30) return `${plNum(v)}% to znaczna (>30%) powierzchnia – klasa U2.`
        if (i.choice === 'humanLarge' && v < 30) return `${plNum(v)}% to niewielka (<30%) powierzchnia – klasa U1.`
        return null
      },
      describe: (i) => {
        const v = num(i.share)
        const l = labelOf(MECHANICAL, i.choice)
        return v === undefined || !String(i.choice ?? '').startsWith('human') ? l : `${l}, ok. ${fmt(v)}`
      },
    },
  ],

  prospects: {
    description:
      'Możliwości ochrony siedliska i utrzymania go w stanie niepogorszonym: status ochronny, czynniki biotyczne i antropogeniczne, gospodarka, turystyka.',
    help: `Co wpisać: ekspercką ocenę przyszłości płatu. Zwróć uwagę na:
• aktualny stan ochrony – park narodowy, strefa ochrony ścisłej, rezerwat;
• sukcesję – ekspansję buka, świerka i jodły (w 2021 r. główną przyczynę obniżenia perspektyw na stanowiskach w Pienińskim Parku Narodowym);
• izolację i wielkość płatu, wpływ sąsiednich lasów mezofilnych;
• turystykę i wydeptywanie, sąsiedztwo dróg;
• zabiegi ochrony czynnej muraw naskalnych, które usuwają sosny i krzewy z płatów lasków.

Dla większości stanowisk najwłaściwsza jest ochrona bierna, najlepiej ścisła. Przy postępującej ekspansji buka można rozważyć jego ograniczanie.

Dlaczego: perspektywy to osobny parametr oceny ogólnej.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  // Kody leśne ze wspólnej listy + kody ze sprawozdań 2013–2014 i 2021 dla 91Q0.
  impactCodes: [
    ...FOREST_IMPACT_CODES,
    { code: 'G01.04.01', name: 'Turystyka górska i wspinaczka' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'L05', name: 'Zapadnięcie się terenu, osuwisko' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ].sort((x, y) => x.code.localeCompare(y.code)),

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. murawy naskalne (6110, 6170, 6190), ciepłolubne zarośla, storczyki, rzadkie gatunki wysokogórskie.',
        help: `Wartości przyrodnicze stanowiska poza samym siedliskiem 91Q0: rzadkie i chronione gatunki (np. sasanka słowacka, obuwik, storczyki), sąsiedztwo innych siedlisk z mozaiki (murawy naskalne i kserotermiczne, ciepłolubne zarośla, buczyny). Brak – „Nie stwierdzono”.

Dlaczego: laski tworzą dynamiczną mozaikę z innymi siedliskami Natura 2000. Planując ochronę, trzeba wiedzieć, co jeszcze się na niej odbije – np. ochrona czynna muraw może szkodzić laskom.`,
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: `Jakie zabiegi ochronne wykonano i jak skutecznie, oraz propozycje działań. Dla 91Q0 właściwa jest zwykle ochrona bierna (ścisła). Opisz, czy usuwano świerki albo buki, czy przy ochronie muraw usuwano sosny i krzewy z płatu, i czy warto ograniczać ekspansję buka. Brak działań – „Brak”, np. „Ochrona ścisła. Aktualnie pozostawić bez zabiegów, prowadzić monitoring zmian”.

Dlaczego: monitoring ma odpowiedzieć, czy ochrona służy siedlisku. Bez tej informacji nie da się odróżnić naturalnych zmian od skutków zabiegów.`,
      }
    return f
  }),

  speciesCatalog: SPECIES_91Q0.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer91Q0(s) })),
  speciesInfo: (name) => {
    const e = findSpecies91Q0(name)
    if (!e) return undefined
    const label = GROUP_LABELS_91Q0[e.group]
    if (e.group === 'herb' || e.group === 'tree' || e.group === 'shrub')
      return e.thermophilous ? `${label}, ciepłolubny` : label
    return label
  },
}

/** Podtyp z wartości stanowiska (undefined, gdy nie wybrano). */
export const subtypeOf = (site: { subtype?: unknown } | undefined): Subtype91Q0 | undefined => {
  const v = site?.subtype
  return typeof v === 'string' && v in SUBTYPES_91Q0 ? (v as Subtype91Q0) : undefined
}
