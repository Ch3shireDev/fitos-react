// Metodyka 91I0 jako dane. Źródło: „Monitoring siedlisk przyrodniczych. Przewodnik metodyczny”
// (GIOŚ, Biblioteka Monitoringu Środowiska), rozdział 91I0 Ciepłolubne dąbrowy (Kiedrzyński, Jakubowska-Gabara, Kurowski), tab. 1 i 2.
// Wspólne typy, ocena i formularz leżą w src/7120, klocki leśne w src/forest – tu są wyłącznie dane 91I0.
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import {
  FOREST_IMPACT_CODES,
  alienTrees,
  choiceIndicator,
  deadWoodShare,
  dominantSpecies,
  expansiveNatives,
  fmt,
  forestArea,
  forestReleveFields,
  forestSiteFields,
  invasiveAliens,
  labelOf,
  listCover,
  loggingDamage,
  measureIndicator,
  plNum,
  plantings,
  speciesInput,
  standDamage,
  type GradedOption,
} from '../../forest'
import {
  GROUP_LABELS_91I0,
  SPECIES_91I0,
  SUBTYPES_91I0,
  THERMO_CHAR_GROUPS,
  coverOfGroups,
  defaultLayer91I0,
  findSpecies91I0,
  subtypeOf,
  type Subtype91I0,
} from './species'

// ---------- gatunki charakterystyczne i ciepłolubne (wskaźniki sprzężone) ----------

/** Liczby potrzebne do oceny gatunków charakterystycznych i ciepłolubnych. */
export interface ThermoSummary {
  /** Pokrycie gatunków charakterystycznych Quercetalia w runie i podszycie. */
  quercetalia?: number
  quercetaliaCount: number
  /** Ciepłolubne gatunki charakterystyczne: Quercetalia + okrajkowe + murawowe. */
  thermoChar?: number
  molinion: string[]
  /** Pozostałe gatunki ciepłolubne (lista wskaźnika „Gatunki ciepłolubne”). */
  thermoOther?: number
  /** Suma ciepłolubnych: charakterystyczne + pozostałe. */
  thermoTotal?: number
}

const add = (...v: (number | undefined)[]) => {
  const d = v.filter((x): x is number => x !== undefined)
  return d.length ? Math.round(d.reduce((a, b) => a + b, 0) * 10) / 10 : undefined
}

export function thermoSummary(charInputs: InputValues | undefined, thermoInputs: InputValues | undefined): ThermoSummary {
  const charRows = charInputs?.species
  const q = coverOfGroups(charRows, ['quercetalia'])
  const t = coverOfGroups(charRows, THERMO_CHAR_GROUPS)
  const other = thermoInputs ? listCover(thermoInputs) : { count: 0, total: undefined }
  return {
    quercetalia: q.total,
    quercetaliaCount: q.names.length,
    thermoChar: t.total,
    molinion: coverOfGroups(charRows, ['molinion']).names,
    thermoOther: other.count ? other.total : undefined,
    thermoTotal: add(t.total, other.count ? other.total : undefined),
  }
}

const charOf = (ctx?: IndicatorContext) => ctx?.indicators?.characteristic?.inputs
const thermoOf = (ctx?: IndicatorContext) => ctx?.indicators?.thermophilous?.inputs

/** Ocena gatunków charakterystycznych wg tab. 2 (z dopiskiem dla podtypu 91I0-1). */
export function gradeCharacteristic(s: ThermoSummary, subtype: Subtype91I0 | undefined): Grade | null {
  const q = s.quercetalia ?? 0
  const thermo = s.thermoTotal ?? s.thermoChar ?? 0
  const needsMolinion = subtype === '91I0-1'
  const molinionOk = !needsMolinion || s.molinion.length > 0
  if (s.quercetaliaCount === 0 && thermo < 1) return molinionOk && needsMolinion ? 'U1' : 'U2'
  if ((q >= 5 || thermo > 10) && molinionOk) return 'FV'
  return 'U1'
}

export const gradeThermophilous = (total: number | undefined): Grade | null =>
  total === undefined ? null : total > 20 ? 'FV' : total >= 1 ? 'U1' : 'U2'

// ---------- opcje ----------

const AREA_OPTIONS: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'other', label: 'Inne kombinacje (np. niewielki spadek, fragmentacja)', grade: 'U1' },
  { value: 'decline', label: 'Wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub literaturą', grade: 'U2' },
]

const DOMINANT_OPTIONS: GradedOption[] = [
  { value: 'natural', label: 'Dominują gatunki niepowodujące zakłóceń w strukturze siedliska', grade: 'FV' },
  { value: 'codominant', label: 'Współdominują gatunki ograniczające rozwój gatunków ciepłolubnych', grade: 'U1' },
  { value: 'dominant', label: 'Dominują gatunki ograniczające rozwój gatunków ciepłolubnych', grade: 'U2' },
]

const REGENERATION_OPTIONS: GradedOption[] = [
  { value: 'oak', label: 'Odnowienie dębowe obecne, brak lub znikomy udział gatunków grądowych', grade: 'FV' },
  { value: 'moderate', label: 'Brak odnowienia dębowego, umiarkowany udział gatunków grądowych', grade: 'U1' },
  { value: 'massive', label: 'Brak odnowienia dębowego, masowe odnowienie gatunków grądowych', grade: 'U2' },
]

const LAYER_OPTIONS = [
  { value: 'one', label: 'Jedna warstwa drzew' },
  { value: 'two', label: 'Dwie warstwy drzew (A1 i A2)' },
]

// ---------- wskaźniki niestandardowe ----------

const characteristic: IndicatorDef = {
  id: 'characteristic',
  label: 'Gatunki charakterystyczne',
  parameter: 'structure',
  cardinal: true,
  description:
    'Gatunki charakterystyczne rzędu Quercetalia pubescenti-petraeae i dąb budujący drzewostan, a pomocniczo ciepłolubne gatunki okrajkowe i murawowe. W podtypie 91I0-1 także gatunki łąk trzęślicowych (Molinion).',
  help: `Co wpisać: gatunki charakterystyczne stwierdzone na transekcie, z pokryciem w %:
• drzewostan i podszyt: dąb bezszypułkowy, dąb szypułkowy, dąb omszony, jarząb brekinia;
• runo, Quercetalia: dzwonek brzoskwiniolistny, dziurawiec skąpolistny, groszek czerniejący, miodownik melisowaty, pięciornik biały, miodunka wąskolistna, jaskier wielokwiatowy, wyka kaszubska (i inne z katalogu);
• ciepłolubne okrajkowe i murawowe (Trifolio-Geranietea, Festuco-Brometea): kłosownica pierzasta, czyścica storzyszek, kokoryczka wonna, pajęcznice, bodziszek czerwony;
• w podtypie 91I0-1 także gatunki łąk trzęślicowych (Molinion): bukwica zwyczajna, przytulia północna, sierpik barwierski, wężymord niski.

Jak liczy formularz (tab. 2 przewodnika):
• FV – gatunki Quercetalia pokrywają co najmniej 5% transektu albo gatunki ciepłolubne ponad 10%, a w 91I0-1 są gatunki Molinion;
• U1 – mniej (Quercetalia poniżej 5%, ciepłolubne do 10%) albo w 91I0-1 brak gatunków Molinion;
• U2 – brak gatunków Quercetalia i pokrycie ciepłolubnych poniżej 1%.
„Gatunki ciepłolubne” to suma ciepłolubnych charakterystycznych z tej listy i pozostałych ciepłolubnych ze wskaźnika „Gatunki ciepłolubne”. Gatunki spoza katalogu nie są liczone.

Dlaczego: gatunki charakterystyczne pokazują, czy płat jest nadal świetlistą dąbrową, czy przechodzi w grąd. Wskaźnik kardynalny.`,
  thresholds: {
    FV: 'Gatunki charakterystyczne dla rzędu Quercetalia p.-p. co najmniej 5% pow. transektu lub gatunki ciepłolubne pow. 10%. Dodatkowo w podtypie 91I0-1: obecność gatunków charakterystycznych dla Molinion',
    U1: 'Poniżej 1% transektu lub gatunki ciepłolubne poniżej 10%. Dodatkowo w podtypie 91I0-1: brak gatunków charakterystycznych dla Molinion',
    U2: 'Brak i pokrycie gatunków ciepłolubnych poniżej 1%. Dodatkowo w podtypie 91I0-1: brak gatunków charakterystycznych dla Molinion',
  },
  inputs: [
    speciesInput(
      'Gatunki charakterystyczne na transekcie',
      'Dęby i brekinia, gatunki Quercetalia, ciepłolubne okrajkowe i murawowe, a w 91I0-1 gatunki Molinion – z pokryciem w % transektu. Pełna lista jest pod „?” przy nazwie wskaźnika.',
      true,
    ),
  ],
  suggest: (i, ctx) => {
    if (!speciesRows(i.species).some((r) => r.name?.trim())) return null
    return gradeCharacteristic(thermoSummary(i, thermoOf(ctx)), subtypeOf(ctx?.site))
  },
  explain: (i, ctx) => {
    if (!speciesRows(i.species).some((r) => r.name?.trim())) return null
    const s = thermoSummary(i, thermoOf(ctx))
    const sub = subtypeOf(ctx?.site)
    return [
      `Quercetalia: ${s.quercetaliaCount} gat., ${fmt(s.quercetalia ?? 0)}.`,
      `Ciepłolubne charakterystyczne: ${fmt(s.thermoChar ?? 0)}${s.thermoOther !== undefined ? `, razem z pozostałymi ciepłolubnymi: ${fmt(s.thermoTotal)}` : ''}.`,
      sub === '91I0-1' ? `Molinion: ${s.molinion.join(', ') || 'brak'}.` : '',
      sub ? '' : 'Wybierz podtyp w „Stanowisku” – w 91I0-1 liczą się też gatunki Molinion.',
    ]
      .filter(Boolean)
      .join(' ')
  },
  describe: (i) => describeSpecies(speciesRows(i.species)),
}

const thermophilous: IndicatorDef = {
  id: 'thermophilous',
  label: 'Gatunki ciepłolubne',
  parameter: 'structure',
  cardinal: true,
  description:
    'Suma pokrycia ciepłolubnych gatunków charakterystycznych i pozostałych gatunków ciepłolubnych (leśnych, okrajkowych, murawowych).',
  help: `Co wpisać: pozostałe gatunki ciepłolubne, których nie ma na liście gatunków charakterystycznych, z pokryciem w %: np. konwalia majowa, wiechlina wąskolistna, trzcinnik leśny, lilia złotogłów. Przyjmuje się szerokie rozumienie gatunków ciepłolubnych – nie tylko charakterystyczne fitosocjologicznie.

Formularz dolicza do tej listy ciepłolubne gatunki charakterystyczne (Quercetalia, okrajkowe, murawowe) wpisane we wskaźniku „Gatunki charakterystyczne”, więc nie wpisuj ich drugi raz. Progi: ponad 20% – FV, 1–20% – U1, brak albo poniżej 1% – U2.

Dlaczego: bogactwo gatunków ciepłolubnych to istota świetlistej dąbrowy. Ich ustępowanie oznacza zacienienie i grądowienie płatu. Wskaźnik kardynalny.`,
  thresholds: { FV: 'Powyżej 20%', U1: 'Poniżej 20%', U2: 'Brak, pokrycie poniżej 1%' },
  inputs: [
    speciesInput(
      'Pozostałe gatunki ciepłolubne',
      'Gatunki ciepłolubne spoza listy charakterystycznej, z pokryciem w % transektu. Charakterystyczne doliczają się same.',
    ),
  ],
  suggest: (i, ctx) => {
    const s = thermoSummary(charOf(ctx), i)
    if (s.thermoTotal === undefined && !speciesRows(charOf(ctx)?.species).length && !listCover(i).count) return null
    return gradeThermophilous(s.thermoTotal ?? 0)
  },
  explain: (i, ctx) => {
    const s = thermoSummary(charOf(ctx), i)
    return `Ciepłolubne charakterystyczne (z listy gatunków charakterystycznych): ${fmt(s.thermoChar ?? 0)}; pozostałe: ${fmt(s.thermoOther ?? 0)}; łącznie ${fmt(s.thermoTotal ?? 0)}.`
  },
  describe: (i, ctx) => {
    const s = thermoSummary(charOf(ctx), i)
    const other = describeSpecies(speciesRows(i.species))
    return [
      `Ciepłolubne gatunki charakterystyczne – ${fmt(s.thermoChar ?? 0)}`,
      other ? `pozostałe gatunki ciepłolubne – ${fmt(s.thermoOther)}: ${other}` : '',
      `łącznie gatunki ciepłolubne – ${fmt(s.thermoTotal ?? 0)}`,
    ]
      .filter(Boolean)
      .join('; ')
  },
}

const shrubClosure: IndicatorDef = {
  id: 'shrubClosure',
  label: 'Zwarcie podszytu',
  parameter: 'structure',
  cardinal: true,
  description:
    'Ilość światła docierającego do dna lasu. Optymalne jest znikome zwarcie podszytu. Szczególna uwaga na grab, leszczynę, buk i czeremchę amerykańską.',
  help: `Co wpisać: zwarcie warstwy krzewów (B) w % powierzchni transektu oraz gatunki podszytu z pokryciem. Przy każdym gatunku dopisz w opisie tendencję („zwiększa się”, „bez zmian”, „zmniejsza się”) – zwłaszcza dla grabu, leszczyny, buka i czeremchy amerykańskiej.

Progi: do 20% – FV, 20–50% – U1, powyżej 50% – U2.

Dlaczego: gęsty podszyt zacienia runo i eliminuje gatunki światłolubne – to główna przyczyna zaniku świetlistych dąbrów po zaprzestaniu wypasu. Wskaźnik kardynalny.`,
  thresholds: { FV: 'Do 20%', U1: '20 do 50%', U2: 'Powyżej 50%' },
  inputs: [
    { kind: 'number', name: 'closure', label: 'Zwarcie podszytu', unit: '%', min: 0, max: 100, required: true, help: 'Zwarcie warstwy krzewów (B) w % powierzchni transektu, z dokładnością do 10%.' },
    speciesInput('Gatunki podszytu', 'Gatunki warstwy krzewów z pokryciem w % transektu. Tendencję dopisz w opisie.'),
  ],
  suggest: (i) => {
    const v = num(i.closure)
    return v === undefined ? null : v <= 20 ? 'FV' : v <= 50 ? 'U1' : 'U2'
  },
  explain: (i) => {
    const shading = coverOfGroups(i.species, ['shading', 'invasive'])
    return shading.names.length ? `Gatunki zacieniające w podszycie: ${shading.names.join(', ')} (${fmt(shading.total)}).` : null
  },
  describe: (i) => {
    const v = num(i.closure)
    const list = describeSpecies(speciesRows(i.species))
    return [v === undefined ? '' : `Zwarcie podszytu: ${plNum(v)}%`, list].filter(Boolean).join('; ')
  },
}

export function gradeCrownClosure(closure: number | undefined, layers: unknown): Grade | null {
  if (closure === undefined) return null
  if (closure < 50) return 'U2'
  if (closure <= 70) return 'FV'
  return layers === 'two' ? 'U2' : layers === 'one' ? 'U1' : null
}

const crownClosure: IndicatorDef = {
  id: 'crownClosure',
  label: 'Zwarcie koron drzew',
  parameter: 'structure',
  cardinal: true,
  description: 'Zwarcie drzewostanu (dostęp światła). Najkorzystniejsze jest zwarcie umiarkowane, 50–70%.',
  help: `Co wpisać: zwarcie koron drzewostanu w % (z dokładnością do 10%) i liczbę warstw drzew. Gdy drzewostan jest dwupiętrowy (A1 i A2), podaj łączne zwarcie.

Progi:
• 50–70% – FV;
• powyżej 70% w jednej warstwie drzew – U1;
• powyżej 70% w dwóch warstwach drzewostanu albo zwarcie poniżej 50% – U2.

Dlaczego: przy zbyt zwartym drzewostanie runo traci gatunki światłolubne, przy zbyt luźnym – wkraczają gatunki łąkowe i ekspansywne trawy. Wskaźnik kardynalny.`,
  thresholds: {
    FV: '50–70%',
    U1: 'Powyżej 70%, jedna warstwa drzew',
    U2: 'Powyżej 70%, w dwóch warstwach drzewostanu lub zwarcie poniżej 50%',
  },
  inputs: [
    { kind: 'number', name: 'closure', label: 'Zwarcie koron', unit: '%', min: 0, max: 100, required: true, help: 'Zwarcie koron drzew w % powierzchni transektu, z dokładnością do 10%.' },
    { kind: 'select', name: 'layers', label: 'Warstwy drzewostanu', options: LAYER_OPTIONS, help: 'Ma znaczenie tylko przy zwarciu powyżej 70%: jedna warstwa – U1, dwie warstwy – U2.' },
  ],
  suggest: (i) => gradeCrownClosure(num(i.closure), i.layers),
  explain: (i) => {
    const v = num(i.closure)
    return v !== undefined && v > 70 && !i.layers ? 'Zwarcie powyżej 70% – wybierz liczbę warstw drzewostanu.' : null
  },
  describe: (i) => {
    const v = num(i.closure)
    if (v === undefined) return ''
    return `${plNum(v)}%${v > 70 && i.layers ? `, ${labelOf(LAYER_OPTIONS, i.layers).toLowerCase()}` : ''}`
  },
}

const regeneration: IndicatorDef = (() => {
  const base = choiceIndicator({
    id: 'regeneration',
    label: 'Naturalne odnowienie',
    description:
      'Odnowienie gatunków drzewiastych. Właściwe jest odnowienie dębowe przy braku lub znikomym udziale gatunków grądowych (grab, lipa, klon, buk).',
    help: `Co wpisać: gatunki odnowienia (siewki, podrost) z pokryciem w % transektu oraz ocenę. W opisie podaj też łączne pokrycie odnowienia, np. „11%: dąb 10%, grusza <1%”.

Dlaczego: bez odnowienia dębowego dąbrowa nie utrzyma się, a masowe odnowienie grabu i lipy to grądowienie – główny kierunek degeneracji 91I0.`,
    options: REGENERATION_OPTIONS,
    inputLabel: 'Ocena odnowienia',
    before: [speciesInput('Gatunki odnowienia', 'Gatunki odnowienia naturalnego z pokryciem w % transektu.')],
  })
  return {
    ...base,
    warn: (i: InputValues) => {
      const oaks = coverOfGroups(i.species, ['oak'])
      const shading = coverOfGroups(i.species, ['shading'])
      if (i.choice === 'oak' && speciesRows(i.species).length && !oaks.names.length)
        return 'Wybrano „odnowienie dębowe obecne”, a na liście nie ma dębu.'
      if (i.choice === 'oak' && (shading.total ?? 0) >= 10)
        return `Gatunki grądowe w odnowieniu: ${shading.names.join(', ')} (${fmt(shading.total)}) – to więcej niż „znikomy udział”.`
      return null
    },
    describe: (i: InputValues) => {
      const { total } = listCover(i)
      const list = describeSpecies(speciesRows(i.species))
      return list ? `${total !== undefined ? `${fmt(total)}: ` : ''}${list}` : labelOf(REGENERATION_OPTIONS, i.choice)
    },
  }
})()

// ---------- metodyka ----------

export const methodology91I0: Methodology = {
  code: '91I0',
  priority: true,
  name: 'Ciepłolubne dąbrowy (Quercetalia pubescenti-petraeae)',
  source: 'GIOŚ, Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, rozdz. 91I0 Ciepłolubne dąbrowy (tab. 1 i 2)',

  siteFields: forestSiteFields({
    code: '91I0',
    transect: '200x20 m',
    releveArea: 400,
    // optymalnie od połowy czerwca do połowy sierpnia (pełnia kwitnienia runa)
    dateWindow: (iso) => {
      const md = iso.slice(5)
      return md >= '06-15' && md <= '08-15'
        ? null
        : 'Termin poza optymalnym oknem (połowa czerwca – połowa sierpnia). Pokrycie runa i spis gatunków mogą być niepełne.'
    },
    extra: [
      {
        kind: 'select',
        name: 'subtype',
        label: 'Podtyp siedliska',
        required: true,
        options: (Object.keys(SUBTYPES_91I0) as Subtype91I0[]).map((v) => ({ value: v, label: SUBTYPES_91I0[v] })),
        hint: 'W podtypie 91I0-1 do oceny gatunków charakterystycznych liczą się też gatunki łąk trzęślicowych (Molinion).',
        help: `Wybierz podtyp, do którego należy płat:
• 91I0-1 – dąbrowa świetlista Potentillo albae-Quercetum, niżowa i wyżynna, najczęstsza (Wielkopolska, Mazowsze, Podlasie, Polesie, wyżyny);
• 91I0-2 – podgórska ciepłolubna dąbrowa brekiniowa Sorbo torminalis-Quercetum, tylko Pogórze Złotoryjskie;
• 91I0-3 – kserotermiczna dąbrowa z dębem omszonym Quercetum pubescenti-petraeae, tylko rezerwat Bielinek nad Odrą (leśno-zaroślowa struktura).

Dlaczego: w podtypie 91I0-1 tab. 2 przewodnika wymaga do oceny FV gatunków łąk trzęślicowych (Molinion), a w 91I0-3 strukturę przestrzenną ocenia się z uwzględnieniem jej leśno-zaroślowego charakteru.`,
      },
    ],
    overrides: {
      siteName: { placeholder: 'np. Zimna Woda 1' },
      communities: {
        hint: 'Np. Potentillo albae-Quercetum.',
        help: `Zbiorowiska roślinne faktycznie występujące na transekcie: Potentillo albae-Quercetum (dąbrowa świetlista), Sorbo torminalis-Quercetum (dąbrowa brekiniowa), Quercetum pubescenti-petraeae (dąbrowa z dębem omszonym). Postać zdegradowaną albo grądowiejącą zaznacz wprost („grądowiejące Potentillo albae-Quercetum”).

Dlaczego: zespół wyznacza punkt odniesienia dla oceny – czego się spodziewać w drzewostanie i runie.`,
      },
      description: {
        hint: 'Położenie, podłoże, historia (wypas, gospodarka leśna), drzewostan, podszyt, runo.',
        help: `Syntetyczny opis stanowiska w kilku zdaniach:
• gdzie leży płat (oddział leśny, rezerwat) i czym są wyznaczone jego granice;
• podłoże i ukształtowanie terenu (równina, stok, ekspozycja);
• historia użytkowania: wypas, gospodarka leśna, zabiegi ochronne;
• drzewostan: gatunki, wiek, zwarcie; podszyt: zwarcie i gatunki (leszczyna, grab, czeremcha amerykańska);
• runo: czy jest heterogeniczne i bogate w gatunki ciepłolubne, czy zacienione i grądowiejące.

Dlaczego: większość płatów 91I0 powstała dzięki dawnemu wypasowi. Opis pokazuje, czy płat trzyma się jako świetlista dąbrowa, czy już grądowieje.`,
      },
      date: {
        hint: 'Optymalnie od połowy czerwca do połowy sierpnia.',
        help: `Dzień obserwacji w terenie. Optymalny termin dla 91I0 to połowa czerwca – połowa sierpnia, gdy większość gatunków runa kwitnie. Później ocena pokrycia bywa błędna, a części gatunków nie da się oznaczyć.

Dlaczego: płaty dąbrów potrafią się szybko zmieniać, dlatego badanie powtarza się co 5–6 lat, optymalnie co 3–4 lata.`,
      },
    },
  }),

  releves: {
    defaultCount: 3,
    intro:
      'Metodyka przewiduje trzy zdjęcia fitosocjologiczne na początku, w środku i na końcu transektu, każde o powierzchni co najmniej 400 m², w skali Braun-Blanqueta. Gdy transektu nie da się wyznaczyć, zdjęcia wykonuje się w trzech blisko położonych płatach (do 200 m od siebie), dlatego ich liczbę możesz zmieniać.',
    fields: forestReleveFields({
      area: 400,
      helps: {
        coords: 'Współrzędne GPS środka powierzchni zdjęcia. Zdjęcia robi się na początku, w środku i na końcu transektu albo w trzech badanych płatach.\n\nDlaczego: zdjęcia powtarza się dokładnie w tych samych miejscach – to najdokładniejszy zapis zmian roślinności.',
        coverA: 'Warstwa A – drzewostan. Procent powierzchni zdjęcia przykryty koronami drzew. Przy drzewostanie dwupiętrowym podaj A1 i A2 w uwagach.\n\nDlaczego: w świetlistej dąbrowie zwarcie powinno być umiarkowane (50–70%).',
        coverB: 'Warstwa B – podszyt: leszczyna, grab, kruszyna, podrost dębu, czeremcha amerykańska.\n\nDlaczego: gęsty podszyt zacienia runo – to główna przyczyna zaniku dąbrów świetlistych.',
        coverC: 'Warstwa C – runo: rośliny zielne, krzewinki, siewki drzew.\n\nDlaczego: w świetlistej dąbrowie runo jest bujne (często 70–90%) i bogate w gatunki ciepłolubne.',
        coverD: 'Warstwa D – mszysta. W dąbrowach zwykle znikoma.',
        unit: 'Zespół, do którego należy zdjęcie, np. „Potentillo albae-Quercetum”.\n\nDlaczego: łączy zdjęcie z opisem zbiorowisk stanowiska i pozwala śledzić, czy płat przechodzi w grąd.',
      },
    }),
  },

  indicators: [
    forestArea({
      options: AREA_OPTIONS,
      inputLabel: 'Jak zmienia się powierzchnia?',
      description:
        'Tempo zmian powierzchni zajmowanej przez siedlisko. Dąbrowy podlegają szybkiej recesji, więc kartowanie granic płatu jest tu szczególnie ważne.',
      help: `Co wybrać: czy powierzchnia płatu zmienia się w porównaniu z wcześniejszymi badaniami albo danymi z literatury. Najpewniej z kartowania granic płatu odbiornikiem GPS (metoda poligonu).

Przy pierwszej obserwacji, bez danych do porównania, wybierz „nie podlega zmianom” albo oceń XX i opisz to w polu wartości (np. „Siedlisko zajmuje ok. 5 ha, brak oznak zmniejszania się”).`,
    }),
    measureIndicator({
      id: 'habitatShare',
      label: 'Udział procentowy siedliska na transekcie',
      description:
        'Jednorodność dąbrowy na 200-metrowym transekcie. Ważne w płatach antropozoogenicznych, gdzie szybko postępuje grądowienie.',
      help: `Co wpisać: jaki procent powierzchni transektu zajmuje siedlisko 91I0 (z dokładnością do 10%). Fragmenty zgrądowiałe, zarośnięte podszytem albo zajęte przez inny typ lasu nie liczą się.

Dlaczego: pokazuje, czy dąbrowa zajmuje cały transekt, czy rozpada się na fragmenty. Progi: 80–100% – FV, 50–80% – U1, poniżej 50% – U2.`,
      thresholds: { FV: '80–100%', U1: '50–80%', U2: 'Poniżej 50%' },
      field: { name: 'share', label: 'Udział siedliska na transekcie', unit: '%', max: 100, help: 'Procent powierzchni transektu zajęty przez siedlisko, z dokładnością do 10%.' },
      grade: (v) => (v >= 80 ? 'FV' : v >= 50 ? 'U1' : 'U2'),
    }),
    characteristic,
    dominantSpecies({
      options: DOMINANT_OPTIONS,
      inputLabel: 'Czy dominanty zakłócają strukturę?',
      description:
        'Gatunki dominujące w poszczególnych warstwach – czy tworzą dogodne warunki dla heterogenicznego runa, czy ograniczają gatunki ciepłolubne.',
      help: `Co wpisać: gatunki dominujące w każdej warstwie (tylko o pokryciu co najmniej 10% transektu), z pokryciem, np. „A: dąb 50%; B: leszczyna 10%; C: konwalia 20%, kłosownica pierzasta 10%”. Potem oceń, czy ograniczają rozwój gatunków ciepłolubnych.

Gatunki ograniczające to przede wszystkim zacieniające: grab, leszczyna, buk, lipa, czeremcha amerykańska. Formularz ostrzega, gdy któryś z nich ma co najmniej 25% pokrycia, a wybrano „niepowodujące zakłóceń”.

Dlaczego: dominanty wyznaczają ekologiczne ramy dla reszty zbiorowiska – od nich zależy, czy runo może być heterogeniczne.`,
      flag: (n) => {
        const g = findSpecies91I0(n)?.group
        return g === 'shading' || g === 'invasive' || g === 'expansive'
      },
      flagMinCover: 25,
      flagText: 'to gatunki ograniczające rozwój gatunków ciepłolubnych',
    }),
    invasiveAliens({
      label: 'Obce gatunki inwazyjne w runie i podszycie',
      description:
        'Neofityzacja dąbrowy. Największe zagrożenie to gatunki zacieniające runo – czeremcha amerykańska – oraz niecierpek drobnokwiatowy i (regionalnie) turzyca drżączkowata.',
      help: `Co wpisać: wszystkie obce gatunki inwazyjne w runie i podszycie z przybliżonym pokryciem transektu (z dokładnością do 10%; „<1%” wpisz jako 0,5). Najczęstsze: czeremcha amerykańska Padus serotina, niecierpek drobnokwiatowy Impatiens parviflora, w niektórych regionach turzyca drżączkowata Carex brizoides. Brak – zostaw listę pustą.

Progi: brak – FV, łącznie poniżej 5% transektu – U1, powyżej 5% – U2.

Dlaczego: czeremcha amerykańska może zdominować podszyt i zacienić runo, a niecierpek redukuje różnorodność runa. Wskaźnik kardynalny.`,
      thresholds: { FV: 'Brak', U1: 'Poniżej 5% transektu w runie lub podszycie', U2: 'Powyżej 5% transektu w runie lub podszycie' },
      inputLabel: 'Obce gatunki inwazyjne w runie i podszycie',
      inputHelp: 'Gatunki obce inwazyjne z pokryciem w % transektu. Brak – zostaw pustą listę.',
      grade: ({ count, total }) => (count === 0 ? 'FV' : total === undefined ? null : total <= 5 ? 'U1' : 'U2'),
    }),
    expansiveNatives({
      description:
        'Ekspansja rodzimych gatunków wybitnie światłożądnych po przerzedzeniu drzewostanu: trzcinnik piaskowy, jeżyny, malina.',
      help: `Co wpisać: rodzime gatunki ekspansywne z pokryciem w % transektu: trzcinnik piaskowy Calamagrostis epigejos, jeżyny Rubus spp., malina właściwa Rubus idaeus. Brak – zostaw listę pustą.

Progi: brak – FV, łącznie poniżej 20% – U1, powyżej 20% – U2.

Dlaczego: ekspansja tych gatunków ujednolica runo i zmniejsza jego bogactwo florystyczne.`,
      thresholds: { FV: 'Brak', U1: 'Poniżej 20%', U2: 'Powyżej 20%' },
      grade: ({ count, total }) => (count === 0 ? 'FV' : total === undefined ? null : total <= 20 ? 'U1' : 'U2'),
    }),
    thermophilous,
    deadWoodShare({
      id: 'deadWood',
      label: 'Leżące martwe drewno (leżanina)',
      description:
        'Udział leżaniny w zasobności drzewostanu. W 91I0 odwrotnie niż w innych lasach: dużo martwego drewna to źle, bo przyspiesza eutrofizację i grądowienie.',
      help: `Co wpisać: jaki procent zasobności (miąższości) drzewostanu stanowi leżące martwe drewno. W opisie możesz podać liczbę leżących pni o średnicy powyżej 20 cm, np. „5 pni, 10% zasobności drzewostanu”.

Progi: do 5% zasobności – FV, 5–20% – U1, powyżej 20% – U2.

Dlaczego: rozkładające się drewno wzbogaca glebę w biogeny, co przyspiesza przemianę dąbrowy w grąd. Martwe drewno ma też wartość (ksylobionty), dlatego wskaźnik nie jest kardynalny.`,
      thresholds: { FV: 'Do 5% zasobności drzewostanu', U1: '5–20% zasobności drzewostanu', U2: 'Powyżej 20% zasobności drzewostanu' },
      grade: (v) => (v <= 5 ? 'FV' : v <= 20 ? 'U1' : 'U2'),
      fieldLabel: 'Leżanina w zasobności drzewostanu',
    }),
    measureIndicator({
      id: 'age',
      label: 'Wiek drzewostanu',
      description:
        'Średni wiek drzewostanu na transekcie. Runo dąbrów świetlistych rozwija się najlepiej w drzewostanie dojrzewającym (60–80 lat).',
      help: `Co wpisać: średni wiek drzewostanu na transekcie w latach – z operatu urządzeniowego, Banku Danych o Lasach albo szacunkowo.

Progi: powyżej 50 lat – FV, 40–50 lat – U1, młodniki poniżej 40 lat – U2.

Dlaczego: zróżnicowany wiekowo, dojrzały drzewostan daje najwięcej nisz. Wskaźnik pomocniczy.`,
      thresholds: { FV: 'Drzewostany powyżej 50 lat', U1: 'Drzewostany 40–50 lat', U2: 'Młodniki poniżej 40 lat' },
      field: { name: 'years', label: 'Średni wiek drzewostanu', unit: 'lat', max: 400, help: 'Średni wiek drzewostanu na transekcie, w latach.' },
      grade: (v) => (v > 50 ? 'FV' : v >= 40 ? 'U1' : 'U2'),
    }),
    shrubClosure,
    crownClosure,
    alienTrees({
      description:
        'Drzewa obce geograficznie (robinia akacjowa, dąb czerwony) i ekologicznie (buk, grab, lipa, sosna) w drzewostanie.',
      help: `Co wpisać: gatunki obce w drzewostanie z przybliżonym udziałem (z dokładnością do 10%):
• obce geograficznie: robinia akacjowa (zmienia trofię gleby), dąb czerwony (tłumi runo), daglezja, modrzew;
• obce ekologicznie: buk, grab, lipa drobnolistna, sosna (zacieniają dno lasu albo powodują pinetyzację).
Brak – zostaw listę pustą.

Progi przewodnika są opisowe: brak – FV, udział znikomy – U1, współdominacja – U2. Formularz przyjmuje: do 10% – „znikomy”, powyżej 10% – współdominacja. To interpretacja, przy innej ocenie popraw podpowiedź.

Dlaczego: obce drzewa zmieniają dostęp światła i właściwości gleby – runo traci gatunki ciepło- i światłolubne.`,
      thresholds: { FV: 'Brak', U1: 'Udział znikomy', U2: 'Współdominacja' },
      note: 'Próg „udział znikomy” przyjęto jako do 10% – to interpretacja.',
    }),
    regeneration,
    plantings({
      description: 'Zgodność ewentualnych nasadzeń z charakterem siedliska. Szczególnie szkodliwy jest buk, silnie zacieniający dno lasu.',
      help: `Co wpisać: gatunki, których nasadzenia stwierdzono na transekcie, z przybliżonym pokryciem, i ocenę ich zgodności z siedliskiem. Zgodne są nasadzenia dębów; niezgodne – buk, sosna, jodła, gatunki obce.

Dlaczego: sadzenie gatunków zacieniających (zwłaszcza buka) przyspiesza zanik świetlistej dąbrowy.`,
    }),
    loggingDamage({
      help: `Co wybrać: jak bardzo prace leśne naruszyły runo, glebę, podszyt i podrost. Podaj liczbę drzew ściętych lub uszkodzonych w związku z pozyskaniem na całym transekcie i procent powierzchni runa uszkodzonej przy zrywce. Sam fakt pozyskania i obecność pniaków to jeszcze nie zniszczenie.

Dlaczego: rozjeżdżona gleba i zniszczone runo to otwarta droga dla gatunków ekspansywnych i obcych.`,
    }),
    standDamage({
      description: 'Rodzaje zniszczeń drzewostanu (wiatrołomy, gradacje owadów, choroby) i procent zniszczonego drzewostanu.',
      help: `Co wpisać: rodzaje zniszczeń drzewostanu i szacunkowy procent zniszczonego drzewostanu dla każdego rodzaju (z dokładnością do 10%), np. „defoliacja dębów 30%”, „zamieranie ok. 10% drzewostanu”.

Progi są opisowe: brak lub pojedyncze – FV, zauważalne – U1, radykalne – U2. Ocena wynika z wybranej klasy, a procent służy tylko do opisu.`,
    }),
  ],

  prospects: {
    description:
      'Możliwość utrzymania siedliska w stanie niepogorszonym: aktualny stan, powierzchnia, fragmentacja, tendencje dynamiczne (ekspansja gatunków zacieniających, grądowienie) i status ochronny.',
    help: `Co wpisać: ekspercką ocenę przyszłości płatu. Zwróć uwagę na:
• tendencje dynamiczne: zwarcie podszytu, ekspansję gatunków zacieniających runo, grądowienie;
• powierzchnię i fragmentację płatów;
• status ochronny (rezerwat, Natura 2000, park krajobrazowy) i to, czy prowadzi się ochronę czynną (wycinanie podszytu, wypas).

Dlaczego: bez regularnej ochrony czynnej świetliste dąbrowy zarastają. Jednorazowe wycięcie podszytu bez dalszej pielęgnacji kończy się szybkim wzrostem odrośli.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A04.03', name: 'Zarzucenie pasterstwa, brak wypasu' },
    ...FOREST_IMPACT_CODES,
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.02', name: 'Nagromadzenie materii organicznej' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. dzwonecznik wonny, lilia złotogłów, sąsiedztwo 9170, 6210.',
        help: `Wartości przyrodnicze stanowiska poza samym siedliskiem 91I0: gatunki z załącznika II Dyrektywy Siedliskowej (np. dzwonecznik wonny Adenophora liliifolia), rzadkie i chronione rośliny (lilia złotogłów, miodownik melisowaty, wawrzynek wilczełyko), sąsiedztwo innych siedlisk (grądy 9170, murawy 6210). Brak – „Nie stwierdzono”.

Dlaczego: dąbrowy świetliste są ostoją wielu rzadkich gatunków. Planując ochronę (np. wycinanie podszytu), trzeba wiedzieć, co jeszcze się na nią złoży.`,
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: `Jakie działania ochronne wykonano (kiedy, kto, w jakiej skali): wycinanie podszytu ograniczające zacienienie, przywrócenie wypasu, usuwanie czeremchy amerykańskiej, wyłączenie z użytkowania. Do tego ocena skuteczności. Brak działań – „Nie zaobserwowano działań ochronnych”.

Dlaczego: cięcia ograniczające zacienienie zwykle pomagają, ale tylko gdy są powtarzane. Bez tej informacji nie da się odróżnić naturalnych zmian od efektów zabiegów.`,
      }
    return f
  }),

  speciesCatalog: SPECIES_91I0.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer91I0(s) })),
  speciesInfo: (name) => {
    const e = findSpecies91I0(name)
    return e ? GROUP_LABELS_91I0[e.group] : undefined
  },
}
