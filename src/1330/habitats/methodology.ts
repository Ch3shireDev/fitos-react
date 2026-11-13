// Metodyka 1330 (solniska nadmorskie, Glauco-Puccinellietalia część – zbiorowiska nadmorskie) jako dane.
// Źródło: Bosiacka B. 2012, „1330 Solniska nadmorskie” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik
// metodyczny, cz. II, GIOŚ, s. 72–84 (tab. 1 i 2), z praktyką ocen ze sprawozdań z monitoringu 2017 i 2021 (te same
// 8 wskaźników struktury, 4 kardynalne – w odróżnieniu od 1310 nic nie wypadło).
// Siedlisko półnaturalne: słone łąki, pastwiska i półszuwary utrzymywane wypasem i koszeniem, zasilane wodami morskimi
// (ingresja) albo wysiękami słonych wód podziemnych. Z modułu leśnego brane są tylko klocki generyczne.
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology, SelectOption, SpeciesRow } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { choiceIndicator, fmt, labelOf, pickField, plNum, speciesCoverIndicator, speciesInput, type GradedOption } from '../../forest'
import { GROUP_LABELS_1330, SPECIES_1330, defaultLayer1330, findSpecies1330, isCharacteristic1330, isHalophyte } from './species'

// ---------- progi liczbowe (tab. 2) ----------

/** Udział siedliska na transekcie: 75–100% FV, 50–75% U1, <50% U2 (75 i 50 – do lepszej klasy). */
export const gradeTransect1330 = (pct: number): Grade => (pct >= 75 ? 'FV' : pct >= 50 ? 'U1' : 'U2')
/** Halofity + „bazowe” indyferentne w % łącznej powierzchni płatów: 40–100% FV, 20–40% U1, <20% U2 (40 i 20 – do lepszej klasy). */
export const gradeCharacteristic1330 = (pct: number): Grade => (pct >= 40 ? 'FV' : pct >= 20 ? 'U1' : 'U2')
/** Obce inwazyjne i rodzime ekspansywne: <10% FV, 10–25% U1, >25% U2. */
export const gradeShare1330 = (pct: number): Grade => (pct < 10 ? 'FV' : pct <= 25 ? 'U1' : 'U2')
/** Drzewa i krzewy: <5% FV, 5–15% U1, >15% U2. */
export const gradeShrubs1330 = (pct: number): Grade => (pct < 5 ? 'FV' : pct <= 15 ? 'U1' : 'U2')
/** Współdominacja: halofity pokrywają co najmniej połowę tego, co dominujące gatunki indyferentne (interpretacja). */
export const CODOMINANCE = 0.5

// ---------- powierzchnia ----------

const AREA_TREND: GradedOption[] = [
  { value: 'increase', label: 'Zwiększa się', grade: 'FV' },
  { value: 'stable', label: 'Nie podlega zmianom', grade: 'FV' },
  { value: 'decrease', label: 'Zmniejsza się nieznacznie', grade: 'U1' },
  { value: 'strongDecrease', label: 'Znaczny spadek w porównaniu z wcześniejszymi badaniami lub danymi historycznymi', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]

// ---------- gatunki ----------

const named = (value: unknown): SpeciesRow[] => speciesRows(value).filter((r) => r.name?.trim())
const sum = (rows: SpeciesRow[]) => rows.reduce((a, r) => a + (num(r.cover) ?? 0), 0)
const round = (n: number) => Math.round(n * 100) / 100

/** Gatunki charakterystyczne: łączne pokrycie halofitów i „bazowych” indyferentnych (maks. 100%). */
export function characteristic1330(i: InputValues): { pct?: number; counted: SpeciesRow[]; ignored: SpeciesRow[]; missingCover: boolean } {
  const rows = named(i.species)
  const counted = rows.filter((r) => isCharacteristic1330(r.name))
  const ignored = rows.filter((r) => !isCharacteristic1330(r.name))
  const missingCover = counted.some((r) => num(r.cover) === undefined)
  if (!rows.length || missingCover) return { counted, ignored, missingCover }
  return { pct: Math.min(100, round(sum(counted))), counted, ignored, missingCover }
}

type DomGroup = 'halo' | 'base' | 'indiff' | 'glyco'
const domGroupOf = (name: string): DomGroup => {
  const s = findSpecies1330(name)
  if (!s) return 'glyco'
  if (isHalophyte(s.group)) return 'halo'
  if (s.group === 'indifferent') return s.base ? 'base' : 'indiff'
  return 'glyco'
}

/** Gatunki dominujące: która grupa ma największe łączne pokrycie wśród dominantów. */
export function dominance1330(i: InputValues): { grade: Grade | null; reason: string } {
  const rows = named(i.species)
  if (!rows.length) return { grade: null, reason: '' }
  if (rows.some((r) => num(r.cover) === undefined)) return { grade: null, reason: 'Wpisz pokrycie każdego dominanta.' }
  const by = (g: DomGroup) => rows.filter((r) => domGroupOf(r.name) === g)
  const halo = sum(by('halo'))
  const base = sum(by('base'))
  const indiff = sum(by('indiff'))
  const glyco = sum(by('glyco'))
  const nonHalo = base + indiff
  if (glyco > halo && glyco > nonHalo)
    return { grade: 'U2', reason: `Dominują glikofity (${describeSpecies(by('glyco'))}) – łącznie ${fmt(round(glyco))}.` }
  if (halo >= nonHalo) return { grade: 'FV', reason: `Dominują halofity (${describeSpecies(by('halo'))}) – łącznie ${fmt(round(halo))}.` }
  if (halo >= CODOMINANCE * nonHalo && base >= indiff)
    return {
      grade: 'FV',
      reason: `Halofity (${fmt(round(halo))}) współdominują z „bazowymi” gatunkami indyferentnymi (${describeSpecies(by('base'))}).`,
    }
  return {
    grade: 'U1',
    reason: `Dominują gatunki indyferentne (${describeSpecies([...by('base'), ...by('indiff')])}) – halofity łącznie ${fmt(round(halo))}.`,
  }
}

// ---------- zasilanie wodami słonymi ----------

const SALT_WATER: GradedOption[] = [
  { value: 'free', label: 'Swobodny dopływ / wypływ / podsiąkanie i rozlewanie się słonej wody, wysokie zasolenie', grade: 'FV' },
  {
    value: 'limited',
    label: 'Zasilanie ograniczone przez melioracje siedliska, wały przeciwpowodziowe itp., prowadzące do degeneracji siedliska',
    grade: 'U1',
  },
  { value: 'degraded', label: 'Czynniki osłabiające zasilanie jak wyżej, ale o większym natężeniu – prowadzą do degradacji siedliska', grade: 'U2' },
]

const SALT_SOURCE: SelectOption[] = [
  { value: 'sea', label: 'Ingresja wód morskich (zalewy, cofki w ujściach rzek)' },
  { value: 'ground', label: 'Słone wody podziemne (wysięki, ascenzja reliktowych solanek)' },
  { value: 'mixed', label: 'Mieszane' },
]

const DITCHES: SelectOption[] = [
  { value: 'none', label: 'Brak rowów melioracyjnych' },
  { value: 'silted', label: 'Rowy nieliczne, zamulone lub zarośnięte' },
  { value: 'weirs', label: 'Rowy z zastawkami' },
  { value: 'open', label: 'Rowy drożne, bez zastawek' },
]

// ---------- struktura przestrzenna ----------

const SPATIAL: GradedOption[] = [
  { value: 'gradient', label: 'Mozaikowy lub pasowy układ roślinności zgodny z gradientem zasolenia i wilgotności', grade: 'FV' },
  { value: 'partial', label: 'Nie w pełni realizowany mozaikowy lub pasowy układ roślinności', grade: 'U1' },
  { value: 'isolated', label: 'Płaty roślinności halofilnej silnie rozproszone i izolowane', grade: 'U2' },
  { value: 'none', label: 'Siedliska nie stwierdzono', grade: 'U2' },
]

// ---------- wskaźniki ----------

const spatial = choiceIndicator({
  id: 'spatial',
  label: 'Struktura przestrzenna płatów siedliska',
  description:
    'Dla typowych solnisk nadmorskich charakterystyczny jest pasowy układ wzdłuż wybrzeża, zgodny z gradientem zasolenia i wilgotności; na solniskach w strefie przybrzeżnej zasilanych głównie solanką typowy układ roślinności jest mozaikowy.',
  help: `Co wybrać: czy roślinność halofilna układa się zgodnie z gradientem zasolenia i wilgotności. Pasy wzdłuż brzegu (typowe solnisko nadmorskie) albo mozaika wokół wysięków solanki (strefa przybrzeżna) – FV. Układ częściowo zatarty – U1. Płaty halofitów silnie rozproszone i izolowane wśród szuwarów i łąk – U2. Gdy siedliska na stanowisku już nie ma – „Siedliska nie stwierdzono”, U2 (praktyka 2021).

Praktyka: 2017 – U1 za homogenizację roślinności przez eksploatację i ekspansję trzciny oraz za rowy przecinające transekt; 2021 – U1 za przestrzenne ograniczanie płatów przez szuwar trzcinowy, U2 przy nikłym udziale albo zaniku siedliska.

Dlaczego: na solnisku o właściwej strukturze widać strefy od najbardziej zasolonych (halofity obligatoryjne) do słabo zasolonych (szuwar, łąka) – ich zatarcie to znak wysłodzenia albo zaniku użytkowania. Wskaźnik niekardynalny (w przewodniku i sprawozdaniach).`,
  options: SPATIAL,
  inputLabel: 'Układ płatów',
  thresholds: {
    FV: 'Mozaikowy lub pasowy układ roślinności zgodnie z gradientem zasolenia i wilgotności',
    U1: 'Nie w pełni realizowany mozaikowy lub pasowy układ roślinności',
    U2: 'Płaty roślinności halofilnej silnie rozproszone i izolowane',
  },
})

const saltBase = choiceIndicator({
  id: 'saltWater',
  label: 'Zasilanie wodami słonymi',
  cardinal: true,
  description:
    'Intensywność zasilania siedliska w słoną wodę, trwałość i regularność zasilania, poziom lustra wód gruntowych, stopień zasolenia wód gruntowych i powierzchniowych, stopień i charakter zmeliorowania stanowiska.',
  help: `Co wybrać: jak słona woda dociera do łąki. Swobodny dopływ (zalewy, cofki), wypływ albo podsiąkanie, woda rozlewa się, zasolenie wysokie – FV. Zasilanie ograniczone przez melioracje, wały przeciwpowodziowe itp. – U1. To samo, ale silniej, tak że siedlisko się degraduje – U2.

Pomiary (przewodnik: najważniejszy wskaźnik): stopień zmeliorowania i stan rowów (zastawki, drożne, zamulone, zarośnięte), głębokość lustra wody gruntowej i jej zasolenie, zasolenie wód stagnujących i w rowach, zasolenie gleby w strefie korzeni (0–25 cm) w nasyconym ekstrakcie glebowym (ECe). Sprzęt: świder glebowy, szpadel, konduktometr polowy, pudełka na ekstrakt, woda destylowana. Przewodnik nie podaje progów liczbowych – pomiary idą do karty jako uzasadnienie wyboru.

Praktyka: 2017 – U1 za wysłodzenie po zabagnieniu i za odnowienie rowów z budową drogi, U2 po podniesieniu i uszczelnieniu wału; 2021 – U2 tam, gdzie wody nie były zasolone albo teren osuszono. Uwaga: w 2017 r. oceniano z roślinności, w 2021 r. z pomiarów zasolenia gleby – wpisuj pomiary, żeby kolejne karty były porównywalne.

Dlaczego: bez słonej wody halofity przegrywają z trzciną i glikofitami łąkowymi. Wskaźnik kardynalny.`,
  options: SALT_WATER,
  inputLabel: 'Zasilanie słoną wodą',
  after: [
    { kind: 'select', name: 'source', label: 'Źródło zasolenia', options: SALT_SOURCE, help: 'Ingresja wód morskich – zalewy, cofki wód zalewowych w ujściach (delta Świny, Zalew Kamieński, Zatoka Pucka). Słone wody podziemne – wysięki i ascenzja reliktowych solanek w strefie przybrzeżnej (Wyspa Chrząszczewska, Bagna Rozwarowskie, Włodarka, Kołobrzeg).' },
    { kind: 'select', name: 'ditches', label: 'Rowy melioracyjne', options: DITCHES, help: 'Stan rowów na stanowisku: czy są, czy mają zastawki, czy są drożne, zamulone albo zarośnięte. Drożne rowy bez zastawek wysładzają łąkę.' },
    { kind: 'number', name: 'groundwater', label: 'Głębokość lustra wody gruntowej', unit: 'cm', help: 'Od powierzchni gruntu, w cm. Woda na powierzchni (stagnuje) – wpisz 0.' },
    { kind: 'number', name: 'ece', label: 'Zasolenie gleby ECe (0–25 cm)', unit: 'dS/m', min: 0, help: 'Przewodność elektryczna nasyconego ekstraktu glebowego z warstwy korzeniowej 0–25 cm, w dS/m (= mS/cm). Kilka prób – wpisz średnią albo typową, zakres w opisie.' },
    { kind: 'number', name: 'waterEc', label: 'Przewodność wody (gruntowej / w rowach)', unit: 'mS/cm', min: 0, help: 'Zasolenie wody gruntowej, stagnującej albo w rowach, z konduktometru, w mS/cm.' },
    { kind: 'textarea', name: 'note', label: 'Opis zasilania', rows: 2, help: 'Skąd słona woda, zalewy, rowy, wały, stagnowanie wody. Trafia do pola „wartość” karty.' },
  ],
})

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description: 'Zmiana powierzchni siedliska na stanowisku w porównaniu z wcześniejszymi badaniami albo danymi historycznymi.',
    help: `Co wybrać: jak zmieniła się powierzchnia słonych łąk, pastwisk i szuwarów od poprzedniej obserwacji (albo względem danych historycznych). Nie zmienia się albo rośnie – FV, znaczny spadek – U2, inne sytuacje – U1. Pierwsze badanie bez danych do porównania – XX.

Powierzchnię (m²) możesz wpisać poniżej – trafi do pola „wartość”. Stanowiskiem jest obszar porośnięty roślinnością halofilną, izolowany od innych rozległymi płatami innych siedlisk albo infrastrukturą.

Praktyka 2017: spadek powierzchni (zarastanie trzciną, drogi przez transekt, zanik po zaniechaniu wypasu) był główną przyczyną ocen U2.`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się',
      U1: 'Inne kombinacje',
      U2: 'Znaczny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi historycznymi',
    },
    inputs: [
      {
        kind: 'select',
        name: 'trend',
        label: 'Zmiana powierzchni',
        options: AREA_TREND.map(({ value, label }) => ({ value, label })),
        help: 'Kierunek zmiany powierzchni siedliska od poprzedniego badania. Zostaw puste, gdy ocenę wystawiasz sam (np. przepisując starą kartę).',
      },
      { kind: 'number', name: 'areaM2', label: 'Powierzchnia siedliska', unit: 'm²', min: 0, help: 'Powierzchnia płatów siedliska na stanowisku w m² (1 ha = 10 000 m²). Opcjonalne – trafi do pola „wartość”.' },
    ],
    suggest: (i) => AREA_TREND.find((o) => o.value === i.trend)?.grade ?? null,
    describe: (i) => {
      const a = num(i.areaM2)
      return [a !== undefined ? `${plNum(a)} m²` : '', i.trend ? labelOf(AREA_TREND, i.trend).toLowerCase() : ''].filter(Boolean).join(', ')
    },
  },
  {
    id: 'transect',
    label: 'Udział procentowy siedliska na transekcie',
    parameter: 'structure',
    description:
      'Procent powierzchni transektu (200×10 m, niekoniecznie po linii prostej) zajęty przez siedlisko. Ma właściwe znaczenie na typowych solniskach nadmorskich; przy naturalnie rozproszonych płatach wokół wysięków solanki może mijać się z celem.',
    help: `Co wpisać: jaki procent powierzchni transektu zajmują płaty siedliska (słone łąki, pastwiska, półszuwary halofilne). Reszta to inne siedliska – szuwary trzcinowe, łąki glikofilne, zarośla.

Progi: 75–100% FV, 50–75% U1, <50% U2 (wartości 75% i 50% liczone do lepszej klasy – interpretacja). Siedliska na transekcie nie ma – wpisz 0 (U2).

Transekt: standard 200×10 m; dopuszczalny krótszy, dłuższy albo nie po linii prostej (zwłaszcza przy zasilaniu solanką). Przy solniskach zasilanych solanką, z punktowym albo liniowym wypływem, wynik interpretuj ostrożnie i opisz w uwagach.

Praktyka 2021: FV przy 80–100%, U1 przy spadku z 80% do 65% (Jarzębowo), U2 przy 15–40% i przy zaniku.`,
    thresholds: {
      FV: 'Siedlisko zajmuje 75–100% transektu',
      U1: 'Siedlisko zajmuje 50–75% transektu',
      U2: 'Siedlisko zajmuje <50% transektu',
    },
    inputs: [{ kind: 'number', name: 'share', label: 'Udział siedliska na transekcie', unit: '%', min: 0, max: 100, help: 'Procent powierzchni transektu zajęty przez siedlisko 1330.' }],
    suggest: (i) => {
      const p = num(i.share)
      return p === undefined ? null : gradeTransect1330(p)
    },
    describe: (i) => {
      const p = num(i.share)
      return p === undefined ? '' : fmt(p)
    },
  },
  {
    id: 'characteristic',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Udział ilościowy halofitów obligatoryjnych i fakultatywnych. Przedziały można zaniżyć ze względu na naturalnie liczną obecność niektórych „bazowych” gatunków indyferentnych i glikofitów: mietlicy rozłogowej, pięciornika gęsiego, kostrzewy czerwonej, ponikła jednoprzysadkowego.',
    help: `Co wpisać: halofity (obligatoryjne i fakultatywne) i „bazowe” gatunki indyferentne z pokryciem w % łącznej powierzchni płatów siedliska. Formularz zsumuje pokrycie halofitów i gatunków bazowych (najwyżej 100%); inne gatunki możesz dopisać – trafią do karty, ale nie liczą się do oceny.

Halofity obligatoryjne: soliród zielny, aster solny, mlecznik nadmorski, świbka morska, sit Gerarda, babka nadmorska, centuria nadbrzeżna, muchotrzew solniskowy, łoboda oszczepowata odm. solniskowa. Fakultatywne: babka pierzasta, ostrzew rudy, mannica odstająca, komonica wąskolistna, koniczyna rozdęta, oczeret Tabernaemontana, sitowiec nadmorski, turzyca odległokłosa, centuria nadobna, kostrzewa trzcinowata, sit żabi, babka Wintera, jarnik solankowy. Bazowe indyferentne: mietlica rozłogowa, pięciornik gęsi, kostrzewa czerwona, ponikło jednoprzysadkowe.

Progi: 40–100% FV, 20–40% U1, <20% U2 (40% i 20% liczone do lepszej klasy – interpretacja). Lista bez żadnego z tych gatunków – U2.

Przykład z karty 2009 (Jarzębowo): babka nadmorska 1%, babka Wintera 0,01%, sit Gerarda 15%, świbka morska 5%, mlecznik 0,01%, koniczyna rozdęta 15%, oczeret Tabernaemontana 10% – razem ok. 46%, FV.

Dlaczego: wskaźnik bardzo czuły – przy pogorszeniu warunków gwałtownie spada zróżnicowanie i liczebność halofitów (2017: po 7 stanowisk FV i U2, tylko 3 U1). Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Halofity i „bazowe” gatunki indyferentne pokrywają 40–100% łącznej powierzchni płatów siedliska',
      U1: 'Halofity i „bazowe” gatunki indyferentne pokrywają 20–40% łącznej powierzchni płatów siedliska',
      U2: 'Halofity i „bazowe” gatunki indyferentne pokrywają <20% łącznej powierzchni płatów siedliska',
    },
    inputs: [speciesInput('Gatunki charakterystyczne', 'Halofity i „bazowe” gatunki indyferentne z pokryciem w % łącznej powierzchni płatów siedliska.', true)],
    suggest: (i) => {
      const c = characteristic1330(i)
      if (!c.counted.length) return c.ignored.length ? 'U2' : null
      return c.pct === undefined ? null : gradeCharacteristic1330(c.pct)
    },
    explain: (i) => {
      const c = characteristic1330(i)
      if (!c.counted.length && !c.ignored.length) return null
      const head = c.counted.length
        ? c.pct !== undefined
          ? `Halofity i gatunki bazowe łącznie: ${fmt(c.pct)}.`
          : 'Wpisz pokrycie każdego halofitu i gatunku bazowego.'
        : 'Na liście nie ma halofitów ani „bazowych” gatunków indyferentnych – U2.'
      return c.ignored.length ? `${head} Nie liczą się do oceny: ${c.ignored.map((r) => r.name.trim()).join(', ')}.` : head
    },
    describe: (i) => describeSpecies(named(i.species)),
  },
  {
    id: 'dominant',
    label: 'Gatunki dominujące',
    parameter: 'structure',
    cardinal: true,
    description:
      'Pokrywanie roślinności oraz relacje ilościowe grup gatunków: halofitów obligatoryjnych, halofitów fakultatywnych, gatunków indyferentnych i glikofitów (w tym ekspansywnych).',
    help: `Co wpisać: kilka gatunków o największym pokryciu w płatach siedliska, z pokryciem w %. Formularz rozpoznaje grupy z katalogu i porównuje ich łączne pokrycie. Gatunek spoza katalogu liczy się jako glikofit.

Jak liczy formularz (tab. 2 jest opisowa – to interpretacja):
• glikofity mają więcej niż halofity i więcej niż gatunki indyferentne – U2 („dominują glikofity, m.in. wyraźna ekspansja trzciny”);
• halofity mają co najmniej tyle co gatunki indyferentne – FV;
• dominują gatunki indyferentne, ale halofity mają co najmniej połowę ich pokrycia, a wśród indyferentnych przeważają „bazowe” (mietlica rozłogowa, pięciornik gęsi, kostrzewa czerwona, ponikło jednoprzysadkowe) – współdominacja, FV;
• inaczej – dominują gatunki indyferentne, U1.

Przykład z karty 2009 (Jarzębowo): mietlica rozłogowa 40%, koniczyna rozdęta 15%, sit Gerarda 15% – halofity 30% przy 40% mietlicy, współdominacja, FV. Praktyka 2021: U1, gdy największe pokrycie miała mietlica przy słabym udziale halofitów; U2, gdy trzcina pokrywała 50–95% transektu.

Dlaczego: przewaga glikofitów, zwłaszcza trzciny, oznacza zanik słonej łąki. Wskaźnik kardynalny.`,
    thresholds: {
      FV: 'Halofity dominują lub współdominują z „bazowymi” gatunkami indyferentnymi',
      U1: 'Dominują gatunki indyferentne',
      U2: 'Dominują glikofity, m.in. wyraźna ekspansja trzciny',
    },
    inputs: [speciesInput('Gatunki dominujące', 'Kilka gatunków o największym pokryciu w płatach, z pokryciem w %.', true)],
    suggest: (i) => dominance1330(i).grade,
    explain: (i) => dominance1330(i).reason || null,
    describe: (i) => describeSpecies(named(i.species)),
  },
  speciesCoverIndicator({
    id: 'invasive',
    label: 'Obce gatunki inwazyjne',
    description: 'Ze względu na ekstremalne warunki obce gatunki inwazyjne mogą występować tylko sporadycznie i pojedynczo – w czasie opracowania przewodnika nie stwierdzono ich w płatach siedliska.',
    help: `Co wpisać: każdy gatunek obcy w płatach siedliska, z pokryciem w %. Brak – zostaw listę pustą.

Progi: łączny udział <10% – FV, 10–25% – U1, >25% – U2.

Praktyka: 2017 – róża pomarszczona Rosa rugosa wkraczająca z wydm (Mechelińskie Łąki, U1); 2021 – ta sama róża 5% i śladowo kolczurka klapowana Echinocystis lobata, wszędzie FV.

Dlaczego: obcy gatunek na słonej łące to zwykle sygnał przesuszenia albo wysłodzenia.`,
    thresholds: { FV: 'Brak lub udział gatunków obcych <10%', U1: 'Udział gatunków obcych 10–25%', U2: 'Udział gatunków obcych >25%' },
    inputLabel: 'Obce gatunki inwazyjne',
    inputHelp: 'Gatunki obce z pokryciem w % powierzchni siedliska. Brak – zostaw pustą listę.',
    grade: ({ count, total }) => (count === 0 ? 'FV' : total === undefined ? null : gradeShare1330(total)),
  }),
  speciesCoverIndicator({
    id: 'expansive',
    label: 'Rodzime gatunki ekspansywne roślin zielnych',
    cardinal: true,
    description:
      'Głównym gatunkiem ekspansywnym wkraczającym na słone łąki, szczególnie po zaprzestaniu użytkowania, jest trzcina pospolita; mniej – perz właściwy i śmiałek darniowy; przy zbyt intensywnym wypasie – sit rozpierzchły; przy murszeniu – ostrożeń polny, pokrzywa zwyczajna.',
    help: `Co wpisać: rodzime gatunki ekspansywne w płatach siedliska, z pokryciem w %: trzcina pospolita Phragmites australis, perz właściwy Elymus repens, śmiałek darniowy Deschampsia caespitosa, sit rozpierzchły Juncus effusus, ostrożeń polny Cirsium arvense, pokrzywa zwyczajna Urtica dioica. Brak – zostaw listę pustą.

Progi: łączny udział <10% – FV, 10–25% – U1, >25% – U2 (granice 10% i 25% – do U1, interpretacja).

Praktyka 2021: najgorzej oceniony wskaźnik – FV przy trzcinie do 5%, U1 przy 15–20%, U2 przy 40–95%. Trzcina rośnie po zaniechaniu wypasu albo zamianie wypasu na koszenie.

Dlaczego: trzcina to główne zagrożenie słonych łąk – bez wypasu i koszenia wypiera halofity w kilka lat. Wskaźnik kardynalny.`,
    thresholds: { FV: 'Brak lub udział gatunków ekspansywnych <10%', U1: 'Udział gatunków ekspansywnych 10–25%', U2: 'Udział gatunków ekspansywnych >25%' },
    inputLabel: 'Gatunki ekspansywne',
    inputHelp: 'Rodzime gatunki ekspansywne z pokryciem w % powierzchni siedliska. Brak – zostaw pustą listę.',
    grade: ({ count, total }) => (count === 0 ? 'FV' : total === undefined ? null : gradeShare1330(total)),
  }),
  speciesCoverIndicator({
    id: 'shrubs',
    label: 'Ekspansja krzewów i podrostu drzew',
    description:
      'Udział gatunków drzewiastych w płatach roślinności halofilnej jest sporadyczny. Trudno uwzględnić ekspansję tych gatunków na solniska lub ich fragmenty na tyle zdegradowane, że zostały porośnięte już przez odmienne ekosystemy krzewiaste lub drzewiaste.',
    help: `Co wpisać: drzewa i krzewy (podrost, siewki, łoza) w płatach siedliska, z pokryciem w %: najczęściej olsza czarna Alnus glutinosa, wierzba szara Salix cinerea, brzoza. Brak – zostaw listę pustą. Pojedyncze osobniki bez pokrycia – wpisz gatunek bez pokrycia i oceń sam (w karcie z 2009 r.: olsza pojedynczo – FV).

Progi: łączny udział <5% – FV, 5–15% – U1, >15% – U2.

Praktyka 2021: na 15 z 19 stanowisk brak; U1 przy olszy 5–15% transektu (przesuszone, nieużytkowane łąki) i przy nasadzeniach wzdłuż ulicy.

Dlaczego: zasolenie, uwodnienie i wypas nie sprzyjają drzewom – ich pojawienie się znaczy, że łąka przesycha i nie jest użytkowana.`,
    thresholds: { FV: 'Brak lub udział gatunków drzewiastych <5%', U1: 'Udział gatunków drzewiastych 5–15%', U2: 'Udział gatunków drzewiastych >15%' },
    inputLabel: 'Drzewa i krzewy',
    inputHelp: 'Gatunki drzew i krzewów z pokryciem w % powierzchni siedliska. Brak – zostaw pustą listę.',
    grade: ({ count, total }) => (count === 0 ? 'FV' : total === undefined ? null : gradeShrubs1330(total)),
  }),
  spatial,
  {
    ...saltBase,
    describe: (i) => {
      const parts = [
        String(i.note ?? '').trim() || labelOf(SALT_WATER, i.choice),
        i.source ? `źródło: ${labelOf(SALT_SOURCE, i.source).split(' (')[0].toLowerCase()}` : '',
        i.ditches ? labelOf(DITCHES, i.ditches).toLowerCase() : '',
        num(i.groundwater) !== undefined ? `lustro wody gruntowej ${plNum(num(i.groundwater)!)} cm` : '',
        num(i.ece) !== undefined ? `ECe gleby ${plNum(num(i.ece)!)} dS/m` : '',
        num(i.waterEc) !== undefined ? `przewodność wody ${plNum(num(i.waterEc)!)} mS/cm` : '',
      ].filter(Boolean)
      return parts.join('; ')
    },
  },
]

// ---------- pola stanowiska ----------

const SUBTYPES: SelectOption[] = [
  { value: '1330-1', label: '1330-1 Halofilne łąki i pastwiska (Juncetum gerardi, Puccinellio-Spergularietum salinae)' },
  { value: '1330-2', label: '1330-2 Halofilne półszuwary (Junco-Samoletum valerandi, Scirpetum maritimi p.p.)' },
  { value: 'both', label: '1330-1 i 1330-2 (mozaika na stanowisku)' },
]

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu, z odbiornika GPS (WGS84). Transekt nie po linii prostej – podaj punkty, którymi faktycznie biegnie, resztę dopisz w opisie. Trzymaj jeden format w całej karcie.

Dlaczego: w 2017 i 2021 r. część „zmian” wskaźników okazała się pozorna – wynikała z korekty przebiegu transektu. Te same punkty to porównywalne wyniki.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Jarzębowo',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Jarzębowo”, „Beka”, „Karsiborska Kępa”, „Rekowo-Rozwarowo”.

Stanowiskiem jest obszar porośnięty roślinnością halofilną, izolowany od innych rozległymi płatami innych siedlisk albo infrastrukturą. Monitoruje się praktycznie wszystkie stanowiska: wschodnie wybrzeże (Zatoka Pucka), środkowe, deltę wsteczną Świny, ujście Dziwny, Zalew Kamieński i stanowiska przybrzeżne zasilane słonymi wodami podziemnymi.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'select',
    name: 'subtype',
    label: 'Podtyp siedliska',
    options: SUBTYPES,
    required: true,
    help: `1330-1 – halofilne łąki i pastwiska: słonawa Juncetum gerardi i zespół mannicy odstającej i muchotrzewu solniskowego Puccinellio-Spergularietum salinae. 1330-2 – halofilne półszuwary: Junco-Samoletum valerandi i niski szuwar półhalofilny Scirpetum maritimi p.p. Gdy na stanowisku są oba (jak w karcie z 2009 r.) – wybierz mozaikę.

Solniska śródlądowe to 1340, solniska z solirodem – 1310.`,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Juncetum gerardi, Scirpetum maritimi',
    help: 'Zbiorowiska halofilne stwierdzone na stanowisku, nazwami fitosocjologicznymi, oddzielone przecinkiem: Juncetum gerardi, Puccinellio-Spergularietum salinae, Junco-Samoletum valerandi, Scirpetum maritimi. Sąsiednie szuwary i łąki glikofilne opisz w opisie stanowiska.',
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Położenie, zasilanie słoną wodą, gradient zasolenia, rowy, użytkowanie (wypas, koszenie), zarastanie trzciną.',
    help: `Syntetyczny opis stanowiska:
• gdzie leży i jak duże jest, czym jest izolowane od innych stanowisk;
• skąd słona woda: zalewy wodami morskimi (ingresja, cofki w ujściach), wysięki słonych wód podziemnych;
• gradient zasolenia i wilgotności, strefy roślinności (słonawa, półszuwary, szuwary, łąki glikofilne);
• rowy melioracyjne (zastawki, drożne, zamulone, zarośnięte), wały;
• użytkowanie: ślady i intensywność zgryzania, koszenia, wydeptywania przez bydło, buchtowania przez dziki; antropopresja;
• sukcesja: zarastanie trzciną, glikofitami łąkowymi, krzewami, drzewami.

Dlaczego: siedlisko jest półnaturalne – bez opisu użytkowania i zasilania nie da się wyjaśnić zmian w kolejnych cyklach.`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Powierzchnia płatów siedliska na stanowisku, w hektarach (np. 7 ha). Słone łąki w strefie nadmorskiej to dziś ok. 350 ha w całym kraju, w tym ok. 80 ha zasilanych głównie solanką.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas'),
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    defaultValue: '200x10 m',
    required: true,
    hint: 'Standard 200×10 m; dopuszczalny krótszy, dłuższy albo nie po linii prostej.',
    help: `Na większości typowych stanowisk 1330 da się wyznaczyć transekt 200×10 m, choć nie zawsze po linii prostej. Odstępstwa są możliwe, zwłaszcza przy zasilaniu solanką i odmiennej strukturze przestrzennej płatów – transekt może być krótszy albo dłuższy. Wpisz faktyczny przebieg, np. „10x200 m, ale nie po linii prostej (w poprzek i wzdłuż)”.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. poniżej 10',
    help: 'Wysokość terenu w metrach n.p.m. Słone łąki nadmorskie leżą nisko, zwykle „poniżej 10”.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 19.07.2009',
    required: true,
    hint: 'Użytkowane: początek wypasu / przed 1. pokosem (czerwiec), ewentualnie przed 2. (wrzesień). Nieużytkowane: sierpień. Co najmniej co 5 lat.',
    help: 'Dzień badań terenowych. Stanowiska monitoruje się nie rzadziej niż co pięć lat. Przy prawidłowym, ekstensywnym użytkowaniu – na początku sezonu pastwiskowego albo przed pierwszym pokosem (czerwiec), ewentualnie przed drugim (wrzesień). Bez użytkowania optymalny jest sierpień. Na terenach zalewowych licz się z opóźnieniem albo przerwaniem wegetacji. W praktyce: 2017 – sierpień–wrzesień, 2021 – głównie koniec lipca.',
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 6 && m <= 9 ? null : 'Termin poza sezonem badań (czerwiec–wrzesień). Przed wypasem/pokosem – czerwiec, bez użytkowania – sierpień.'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcie fitosocjologiczne ----------

const releveFields: FieldDef[] = [
  { kind: 'text', name: 'coords', label: 'Współrzędne środka zdjęcia', help: 'Współrzędne GPS środka powierzchni zdjęcia (WGS84).' },
  {
    kind: 'number',
    name: 'area',
    group: 'Powierzchnia i pokrycie',
    label: 'Powierzchnia zdjęcia',
    unit: 'm²',
    min: 0,
    defaultValue: 25,
    help: 'W karcie z przewodnika 5×5 m = 25 m². Kładź zdjęcie w jednorodnym płacie jednego zbiorowiska.',
  },
  {
    kind: 'number',
    name: 'cover',
    group: 'Powierzchnia i pokrycie',
    label: 'Pokrycie warstwy C',
    unit: '%',
    min: 0,
    max: 100,
    help: 'Procent powierzchni zdjęcia pokryty przez roślinność zielną (rzut pionowy). Na słonej łące zwykle blisko 100%.',
  },
  {
    kind: 'text',
    name: 'unit',
    label: 'Jednostka fitosocjologiczna',
    placeholder: 'np. Juncetum gerardi',
    help: 'Zespół, do którego należy zdjęcie: Juncetum gerardi, Puccinellio-Spergularietum salinae, Junco-Samoletum valerandi albo Scirpetum maritimi.',
  },
  {
    kind: 'releve-species',
    name: 'species',
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki na powierzchni zdjęcia z ilościowością w siedmiostopniowej skali Braun-Blanqueta (r, +, 1–5). Roślinność zielna – warstwa C; podrost drzew i krzewy – B.',
  },
]

export const methodology1330: Methodology = {
  code: '1330',
  name: 'Solniska nadmorskie (Glauco-Puccinellietalia część – zbiorowiska nadmorskie)',
  source:
    'Bosiacka B. 2012, 1330 Solniska nadmorskie (Glauco-Puccinellietalia część – zbiorowiska nadmorskie), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 72–84 (tab. 1 i 2), z praktyką ocen z monitoringu 2017 i 2021',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Zdjęcia fitosocjologiczne w płatach siedliska na transekcie – po jednym w każdym wyróżnionym zbiorowisku (w karcie z przewodnika trzy zdjęcia 5×5 m). Skala Braun-Blanqueta.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Ocena zależna od stanu zachowania siedliska oraz możliwości jego utrzymania, pogorszenia lub poprawy, intensywności dopływu i odpływu słonej wody, od prowadzonych zabiegów ochronnych, planów przestrzennego zagospodarowania i prawnego statusu ochrony stanowisk.',
    help: `Oceniając perspektywy, weź pod uwagę przede wszystkim użytkowanie (ekstensywny wypas ok. 1 DJP/ha od lipca do października, koszenie; programy rolnośrodowiskowe), dopływ i odpływ słonej wody (rowy, zastawki, wały przeciwpowodziowe), tempo zarastania trzciną, status ochronny i plany inwestycyjne (drogi, zabudowa).

Praktyka 2017 i 2021: perspektywy złe tam, gdzie zaniechano wypasu i trzcina opanowała łąkę, gdzie podniesiono wał albo osuszono teren; dobre na stanowiskach z regularnym ekstensywnym wypasem (Jarzębowo, Karsibór, Beka, Włodarka).`,
    thresholds: {
      FV: 'Perspektywy ochrony siedliska dobre lub doskonałe; nie stwierdzono i nie przewiduje się znaczącego oddziaływania czynników zagrażających; prawdopodobne przetrwanie w dłuższej perspektywie czasowej',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy ochrony siedliska są złe, stwierdzony lub przewidywany wpływ czynników zagrażających; mało prawdopodobne przetrwanie w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A03', name: 'Koszenie / ścinanie trawy' },
    { code: 'A03.02', name: 'Nieintensywne koszenie' },
    { code: 'A03.03', name: 'Zaniechanie / brak koszenia' },
    { code: 'A04', name: 'Wypas' },
    { code: 'A04.01.01', name: 'Intensywny wypas bydła' },
    { code: 'A04.02.01', name: 'Nieintensywny wypas bydła' },
    { code: 'A04.03', name: 'Zarzucenie pasterstwa, brak wypasu' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D01.02', name: 'Drogi, autostrady' },
    { code: 'E01', name: 'Tereny zurbanizowane, tereny zamieszkane' },
    { code: 'E01.04', name: 'Inne typy zabudowy' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G05', name: 'Inna ingerencja i zakłócenia powodowane przez działalność człowieka' },
    { code: 'I01', name: 'Nierodzime gatunki zaborcze' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02.01', name: 'Zasypywanie terenu, melioracje i osuszanie – ogólnie' },
    { code: 'J02.01.02', name: 'Osuszanie terenów morskich, ujściowych, bagiennych' },
    { code: 'J02.04.02', name: 'Brak zalewów' },
    { code: 'J02.06', name: 'Pobór wód z wód powierzchniowych' },
    { code: 'J02.12', name: 'Tamy, wały, sztuczne plaże - ogólnie' },
    { code: 'K01.05', name: 'Salinizacja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. rzadkie gatunki (kropidło piszczałkowate, oman łąkowy), lęgowiska ptaków, sąsiedztwo 1310 i 1340.',
        help: 'Wartości przyrodnicze stanowiska poza samym siedliskiem: rzadkie i zagrożone gatunki roślin (kropidło piszczałkowate Oenanthe fistulosa, oman łąkowy Inula britannica, jarnik solankowy), lęgowiska ptaków siewkowych, sąsiedztwo innych siedlisk solniskowych. Brak informacji – „Nie pozyskano danych”.',
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: `Jakie działania ochronne wykonano i jaka jest ich skuteczność, oraz co proponujesz. Typowe dla 1330: ekstensywny wypas (ok. 1 DJP/ha, lipiec–październik) albo przynajmniej letni pokos; na zdegradowanych stanowiskach na początek zimowe koszenie trzciny przez 2–3 lata, potem letnie przed kwitnieniem trzciny (optymalnie 2. dekada lipca), z zebraniem biomasy; programy rolnośrodowiskowe; utrzymanie zasilania słoną wodą (zastawki, odpływ przelewowy wód słodkich). Brak działań – „Brak”.`,
      }
    return f
  }),

  speciesCatalog: SPECIES_1330.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer1330(s) })),
  speciesInfo: (name) => {
    const e = findSpecies1330(name)
    return e ? (e.base ? `${GROUP_LABELS_1330[e.group]} „bazowy”` : GROUP_LABELS_1330[e.group]) : undefined
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator1330 = (id: string): IndicatorDef => {
  const i = methodology1330.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 1330`)
  return i
}
