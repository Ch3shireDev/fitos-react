// Metodyka 1230 (klify na wybrzeżu Bałtyku) jako dane. Źródło: Łabuz T.A. 2012, „Klify nadmorskie na wybrzeżu
// Bałtyku” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 40–58
// (tab. 1 i 2), z praktyką oceny ze sprawozdań z monitoringu 2011, 2017 i 2023.
// Siedlisko „geologiczne”: zamiast zdjęć fitosocjologicznych jest profil poprzeczny klifu (od krawędzi do linii wody)
// z zasięgami liniowymi gatunków, a połowa wskaźników to geodynamika stoku i plaży. Przewodnik nie wskazuje wskaźników
// kardynalnych – wszystkie 14 są traktowane jako równorzędne i kardynalne (patrz specyfikacja).
// Z modułu leśnego brane są tylko klocki generyczne (choiceIndicator, measureIndicator, pickField) – nic leśnego.
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { num } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { choiceIndicator, labelOf, measureIndicator, pickField, plNum, type GradedOption } from '../../forest'
import { GROUP_LABELS_1230, SPECIES_1230, defaultLayer1230, findSpecies1230 } from './species'

// ---------- progi liczbowe (tab. 2) ----------

/**
 * Stabilność ściany klifu z udziału powierzchni aktywnej (osuwiska, osypiska, nagi stok) w %.
 * Tab. 2: FV – aktywny w połowie, do 50%; U1 – aktywny do 75% lub nieaktywny do 75%; U2 – aktywny albo nieaktywny
 * powyżej 75%. Przedziały się zazębiają – przyjęto: <25 U2, 25–50 FV, >50–75 U1, >75 U2 (interpretacja).
 */
export const gradeStability1230 = (activePct: number): Grade =>
  activePct > 75 || activePct < 25 ? 'U2' : activePct <= 50 ? 'FV' : 'U1'
/** Nachylenie stoku: do 40° FV, 40–50° U1, powyżej 50° U2. */
export const gradeSlope1230 = (deg: number): Grade => (deg <= 40 ? 'FV' : deg <= 50 ? 'U1' : 'U2')
/** Tempo cofania krawędzi: do 0,5 m/rok FV, 0,5–1,5 U1, powyżej 1,5 U2. */
export const gradeRetreat1230 = (m: number): Grade => (m <= 0.5 ? 'FV' : m <= 1.5 ? 'U1' : 'U2')
/** Osuwiska + wysięki na 100 m długości klifu: 0–1 FV, 2 U1, więcej niż 2 U2. Ułamki (średnia) – do góry. */
export const gradeGeodynamics1230 = (n: number): Grade => (n <= 1 ? 'FV' : n <= 2 ? 'U1' : 'U2')
/** Najwyższe podcięcie abrazyjne u podnóża: brak albo do 0,5 m FV, 0,5–1,5 m U1, powyżej 1,5 m U2. */
export const gradeUndercut1230 = (m: number): Grade => (m <= 0.5 ? 'FV' : m <= 1.5 ? 'U1' : 'U2')
/** Krzewy charakterystyczne – pokrycie: powyżej 15% FV, 5–15% U1, do 5% U2. */
export const gradeShrubs1230 = (p: number): Grade => (p > 15 ? 'FV' : p > 5 ? 'U1' : 'U2')
/** Drzewa charakterystyczne – pokrycie: powyżej 10% FV, 1–10% U1, do 1% U2. */
export const gradeTrees1230 = (p: number): Grade => (p > 10 ? 'FV' : p > 1 ? 'U1' : 'U2')
/** Liczba gatunków zielnych na stoku: min. 15 FV, 5–14 U1, mniej niż 5 U2. */
export const gradeSpeciesCount1230 = (n: number): Grade => (n >= 15 ? 'FV' : n >= 5 ? 'U1' : 'U2')
/** Pokrycie stoku roślinnością: 30–70% FV; 10–30 albo 70–90% U1; poniżej 10 albo powyżej 90% U2. */
export const gradeVegCover1230 = (p: number): Grade => (p >= 30 && p <= 70 ? 'FV' : p >= 10 && p <= 90 ? 'U1' : 'U2')
/** Wysokość (górnej) plaży u podnóża: od 2 m n.p.m. FV, 1–2 U1, poniżej 1 U2. */
export const gradeBeachHeight1230 = (m: number): Grade => (m >= 2 ? 'FV' : m >= 1 ? 'U1' : 'U2')
/**
 * Szerokość plaży – tab. 2 nie podaje progów (tab. 1: średnio ok. 25 m pod klifami, im szersza, tym lepiej).
 * Przyjęto: od 25 m FV, 10–25 m U1, poniżej 10 m U2 – zgodnie z ocenami z 2023 r. (interpretacja).
 */
export const gradeBeachWidth1230 = (m: number): Grade => (m >= 25 ? 'FV' : m >= 10 ? 'U1' : 'U2')

// ---------- opcje selektów ----------

const HERBS: GradedOption[] = [
  { value: 'all', label: 'Wszystkie gatunki charakterystyczne, powyżej 25% pokrycia', grade: 'FV' },
  { value: 'some', label: '1–2 gatunki charakterystyczne, 10–25% pokrycia', grade: 'U1' },
  { value: 'minimum', label: 'Minimum roślin charakterystycznych, do 10% pokrycia', grade: 'U2' },
]
const SHRUBS: GradedOption[] = [
  { value: 'all', label: 'Wszystkie gatunki charakterystyczne, powyżej 15% pokrycia', grade: 'FV' },
  { value: 'some', label: '1–2 gatunki charakterystyczne, 5–15% pokrycia', grade: 'U1' },
  { value: 'minimum', label: 'Minimum roślin charakterystycznych, do 5% pokrycia', grade: 'U2' },
]
const TREES: GradedOption[] = [
  { value: 'all', label: 'Wszystkie gatunki charakterystyczne, powyżej 10% pokrycia', grade: 'FV' },
  { value: 'some', label: '1–2 gatunki charakterystyczne, 1–10% pokrycia', grade: 'U1' },
  { value: 'minimum', label: 'Minimum roślin charakterystycznych, do 1% pokrycia', grade: 'U2' },
]
const REGENERATION: GradedOption[] = [
  { value: 'many', label: 'Liczne okazy gatunków charakterystycznych w płatach oraz pojedyncze inne typowe', grade: 'FV' },
  { value: 'single', label: 'Pojedyncze okazy gatunków charakterystycznych', grade: 'U1' },
  { value: 'none', label: 'Brak odnowień', grade: 'U2' },
]
const SURGE: GradedOption[] = [
  { value: 'none', label: 'Brak lub przy linii wody', grade: 'FV' },
  { value: 'middle', label: 'W środkowej części plaży', grade: 'U1' },
  { value: 'foot', label: 'Widoczny u podnóża stoku klifu', grade: 'U2' },
]
const UNDERCUT_KIND: SelectOption[] = [
  { value: 'none', label: 'Brak podcięć' },
  { value: 'point', label: 'Punktowe podcięcia' },
  { value: 'clear', label: 'Wyraźne podcięcia na długich odcinkach' },
]
const AREA_OPTIONS: GradedOption[] = [
  { value: 'stable', label: 'Nie zmniejsza się (cofanie klifu przesuwa siedlisko, ale go nie ubywa)', grade: 'FV' },
  { value: 'slow', label: 'Zmniejsza się, np. przez umocnienia brzegu lub zabudowę korony', grade: 'U1' },
  { value: 'fast', label: 'Wyraźnie się zmniejsza, siedlisko przekształcane lub niszczone', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do oceny', grade: 'XX' },
]

const DYNAMIC_STATE: SelectOption[] = [
  { value: 'active', label: 'Aktywny (żywy)' },
  { value: 'partly', label: 'Częściowo aktywny / okresowo ustabilizowany' },
  { value: 'inactive', label: 'Nieaktywny (martwy)' },
]
const GEOLOGY: SelectOption[] = [
  { value: 'sand', label: 'Piaszczysty' },
  { value: 'clay', label: 'Gliniasty' },
  { value: 'mixed', label: 'Piaszczysto-gliniasty (złożona budowa)' },
  { value: 'other', label: 'Inny (iły, torfy, gytie…)' },
]
const BASE_TYPE: SelectOption[] = [
  { value: 'beach', label: 'Plaża' },
  { value: 'platform', label: 'Platforma abrazyjna (glina, żwir, głazy)' },
  { value: 'none', label: 'Brak – woda dochodzi do podnóża' },
]

// ---------- pomoc wspólna ----------

const TRANSECT_HELP = `Pomiar wzdłuż profilu poprzecznego: od 1–5 m za krawędzią klifu w dół stoku, przez plażę do linii wody (niwelator, teodolit, łata, taśma albo klizymetr). Gatunki notuje się w pasie 25 m po obu stronach profilu.`

const BOTANY_TIP = `Wskaźnik opisuje fazę sukcesji – raport z 2017 r. podkreśla, że klif pozbawiony drzew czy krzewów bywa w pełni naturalny (aktywny, gliniasty). Ocena idzie jednak wg tab. 2.`

// ---------- wskaźniki ----------

const herbsBase = choiceIndicator({
  id: 'herbs',
  label: 'Obecność charakterystycznych roślin zielnych',
  cardinal: true,
  description: 'Gatunki zielne charakterystyczne dla podłoża i fazy sukcesji: na glinie podbiał, ostrożeń, skrzyp, potem kupkówka i groszek; na piasku trzcinnik piaskowy, przelot, koniczyna polna, potem szczotlicha i gatunki muraw; u podnóża psammofity i halofity.',
  help: `Co wybrać: jak licznie na stoku rosną zielne gatunki charakterystyczne dla jego podłoża – wszystkie typowe z pokryciem ponad 25%, 1–2 gatunki z pokryciem 10–25%, albo tylko pojedyncze rośliny.

Gatunki charakterystyczne (tab. 1):
• glina, pierwsza faza: podbiał Tussilago farfara, ostrożeń Cirsium arvense, skrzyp polny Equisetum arvense; później kupkówka Dactylis glomerata, groszek łąkowy Lathyrus pratensis;
• piasek, pierwsza faza: trzcinnik piaskowy Calamagrostis epigejos, przelot Anthyllis, koniczyna polna Trifolium arvense; na stabilnym podłożu szczotlicha Corynephorus canescens, kostrzewa owcza, jasieniec, jastrzębiec baldaszkowaty, rozchodnik, lepiężnik;
• przewiewany piasek, stożki osuwiskowe: kostrzewa piaskowa, piaskownica, wydmuchrzyca, u podnóża honkenia i rukwiel nadmorska;
• podłoże mieszane: obok powyższych licznie przelot Anthyllis vulneraria.

Lista gatunków jest opcjonalna – trafia do opisu i podpowiada liczbę gatunków niżej.

${BOTANY_TIP}`,
  options: HERBS,
  inputLabel: 'Rośliny zielne charakterystyczne',
})

const indicators: IndicatorDef[] = [
  choiceIndicator({
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description:
      'Powierzchnia stoku klifu od krawędzi do podnóża na odcinku stanowiska (zwykle 100–300 m wzdłuż brzegu). Przewodnik nie podaje progów – w 2011, 2017 i 2023 r. wszystkie stanowiska dostały FV.',
    help: `Co wybrać: czy powierzchnia siedliska na stanowisku się utrzymuje. Cofanie krawędzi przez abrazję i osuwiska to proces naturalny – siedlisko przesuwa się w głąb lądu, ale go nie ubywa. Ubywa go dopiero, gdy klif zostaje zabudowany (opaska, gabiony, geowłóknina, narzut) albo korona jest zagospodarowana i siedlisko się przekształca.

Powierzchnię płatów w hektarach wpisz w zakładce Stanowisko. W 2023 r. stanowiska miały od 0,1 do 1 ha.

Przewodnik (2012) nie ma progów dla tego parametru – opcje są interpretacją wg ogólnych zasad GIOŚ i praktyki monitoringu.`,
    options: AREA_OPTIONS,
    inputLabel: 'Jak zmienia się powierzchnia?',
    inputHelp: 'Trend powierzchni stoku porośniętego siedliskiem na stanowisku. Pierwsze badanie bez danych do porównania – zwykle „nie zmniejsza się”.',
  }),
  {
    id: 'stability',
    label: 'Stabilność ściany klifu',
    parameter: 'structure',
    cardinal: true,
    description: 'Podział na klif aktywny, nieaktywny lub częściowo aktywny – informacja o dynamice podłoża i pokrywającej je roślinności.',
    help: `Co wpisać: jaka część powierzchni ściany klifu na stanowisku jest aktywna – osuwiska, osypiska, obrywy, nagi stok bez roślin, w procentach. Resztę traktuje się jako nieaktywną (utrwaloną roślinnością).

Progi (tab. 2): klif aktywny w połowie, do 50% – FV; aktywny do 75% albo nieaktywny do 75% – U1; aktywny albo nieaktywny powyżej 75% – U2. Przedziały w tabeli się zazębiają, formularz przyjmuje: 25–50% aktywnego FV, ponad 50 do 75% U1, poniżej 25% albo ponad 75% U2 (interpretacja).

Dlaczego: najwyższą różnorodność daje klif „w połowie drogi” – mozaika płatów pionierskich i utrwalonych. Klif cały aktywny nie ma roślin, cały martwy zarasta lasem. Raport z 2017 r. zwraca uwagę, że kryterium jest krzywdzące dla klifów martwych – opisz to w polu wartości.`,
    thresholds: {
      FV: 'Klif aktywny w połowie, do 50% powierzchni',
      U1: 'Klif aktywny do 75% lub nieaktywny do 75% powierzchni',
      U2: 'Klif aktywny powyżej 75% powierzchni lub nieaktywny powyżej 75% powierzchni',
    },
    inputs: [
      { kind: 'number', name: 'activePct', label: 'Powierzchnia aktywna', unit: '%', min: 0, max: 100, required: true, help: 'Procent powierzchni ściany klifu w stanie aktywnym (osuwiska, osypiska, obrywy, nagi stok). 0 – klif całkowicie martwy, 100 – cały aktywny.' },
      { kind: 'select', name: 'state', label: 'Stan dynamiczny (opisowo)', options: DYNAMIC_STATE, help: 'Ogólna charakterystyka do opisu. Nie wpływa na ocenę.' },
    ],
    suggest: (i) => {
      const v = num(i.activePct)
      return v === undefined ? null : gradeStability1230(v)
    },
    warn: (i) => {
      const v = num(i.activePct)
      if (v === undefined || !i.state) return null
      if (i.state === 'inactive' && v > 50) return `Klif opisany jako nieaktywny, a ${plNum(v)}% powierzchni aktywnej?`
      if (i.state === 'active' && v < 25) return `Klif opisany jako aktywny, a tylko ${plNum(v)}% powierzchni aktywnej?`
      return null
    },
    describe: (i) => {
      const v = num(i.activePct)
      return [i.state ? labelOf(DYNAMIC_STATE, i.state) : '', v !== undefined ? `aktywny na ${plNum(v)}% powierzchni` : ''].filter(Boolean).join(', ')
    },
  },
  measureIndicator({
    id: 'slope',
    label: 'Nachylenie stoku/ściany klifu',
    cardinal: true,
    description: 'Decyduje o długości stoku, a tym samym o kształtowaniu się roślinności. Informuje o procesach geodynamicznych, w tym o odległości krawędzi od podnóża narażonego na abrazję.',
    help: `Co wpisać: średnie nachylenie stoku w stopniach – z profilu niwelacyjnego (wysokość klifu i odległość krawędź–podnóże), klinometru albo klizymetru. Zróżnicowanie (np. „w górnej części do 70°, w dolnej 10–15° na koluwium”) dopisz w polu wartości.

Typowo: klif osypiskowy (piaski) do 30°, obrywowy (gliny) 60–80°, osypiskowo-zsuwowy – zmienne.

Progi: do 40° FV, 40–50° U1, powyżej 50° U2. Raport z 2017 r.: te same kryteria dla glin i piasków krzywdzą strome klify gliniaste – to ich naturalny stan. ${TRANSECT_HELP}`,
    thresholds: { FV: 'Do 40°', U1: '40–50°', U2: 'Powyżej 50°' },
    field: { label: 'Średnie nachylenie', unit: '°', min: 0, max: 90, help: 'Średnie nachylenie stoku od krawędzi do podnóża, w stopniach.' },
    grade: gradeSlope1230,
  }),
  measureIndicator({
    id: 'retreat',
    label: 'Tempo cofania klifu',
    cardinal: true,
    description: 'Informuje o częstotliwości i skali narażenia klifu na erozję, a także o jego aktywności.',
    help: `Co wpisać: średnie tempo cofania krawędzi klifu w metrach na rok – z reperów (paliki, charakterystyczne drzewo) za krawędzią: odległość reper–krawędź teraz i przy poprzednim pomiarze, podzielona przez liczbę lat. Cofanie podnóża mierzy się od dużego głazu na plaży (Wolin, Rozewie).

Bez reperów – z porównania ortofotomap albo danych Urzędu Morskiego; zapisz źródło w polu wartości.

Progi: do 0,5 m/rok FV, 0,5–1,5 m/rok U1, powyżej 1,5 m/rok U2.`,
    thresholds: { FV: 'Do 0,5 m na rok', U1: '0,5–1,5 m na rok', U2: 'Powyżej 1,5 m na rok' },
    field: { label: 'Cofanie krawędzi', unit: 'm/rok', min: 0, help: 'Średnio w metrach na rok, np. 0,5.' },
    grade: gradeRetreat1230,
  }),
  {
    id: 'geodynamics',
    label: 'Zjawiska geodynamiczne na stoku',
    parameter: 'structure',
    cardinal: true,
    description: 'Wysięki wód podziemnych i ruchy masowe (osuwiska, spływy) – świadczą o dynamice klifu i narażeniu roślinności na niszczenie.',
    help: `Co wpisać: liczbę osuwisk (w tym spływów, obrywów, zerw) i liczbę wysięków wód podziemnych na stanowisku oraz długość stanowiska wzdłuż brzegu. Formularz przeliczy je na 100 m długości klifu.

Progi (tab. 2): 1 osuwisko lub wysięk na 100 m – FV; 2 – U1; więcej niż 2 – U2. Brak zjawisk formularz traktuje jak FV. Średnie ułamkowe (np. 1,5 na 100 m) – na korzyść gorszej oceny powyżej 1.

Dlaczego: osuwiska odmładzają stok i niszczą roślinność, ale też przenoszą płaty z krawędzi na podnóże (pojedynczy buk, sosna z mchami). Wysięki na warstwach nieprzepuszczalnych (glina, gytia) uruchamiają spływy.`,
    thresholds: {
      FV: '1 osuwisko lub wysięk na 100 m długości klifu',
      U1: '2 osuwiska lub wysięki na 100 m długości klifu',
      U2: 'Więcej niż 2 osuwiska lub wysięki na 100 m długości klifu',
    },
    inputs: [
      { kind: 'number', name: 'landslides', label: 'Osuwiska, spływy, obrywy', unit: 'szt.', min: 0, required: true, help: 'Liczba aktywnych osuwisk (i spływów, obrywów, zerw) na całym stanowisku.' },
      { kind: 'number', name: 'seeps', label: 'Wysięki', unit: 'szt.', min: 0, help: 'Liczba wysięków wód podziemnych na stanowisku. Puste = 0.' },
      { kind: 'number', name: 'lengthM', label: 'Długość stanowiska wzdłuż brzegu', unit: 'm', min: 1, defaultValue: 100, help: 'Zwykle 100–300 m. Wynik jest przeliczany na 100 m długości klifu.' },
    ],
    suggest: (i) => {
      const per = geoPer100(i)
      return per === undefined ? null : gradeGeodynamics1230(per)
    },
    explain: (i) => {
      const per = geoPer100(i)
      const len = num(i.lengthM) ?? 100
      return per === undefined || len === 100 ? null : `${plNum(Math.round(per * 10) / 10)} zjawiska na 100 m długości klifu.`
    },
    describe: (i) => {
      const l = num(i.landslides)
      if (l === undefined) return ''
      const s = num(i.seeps) ?? 0
      const len = num(i.lengthM) ?? 100
      return `Osuwiska: ${plNum(l)}, wysięki: ${plNum(s)} na ${plNum(len)} m (${plNum(Math.round(geoPer100(i)! * 10) / 10)} na 100 m)`
    },
  },
  {
    id: 'lowerPart',
    label: 'Stan zachowania dolnej części klifu',
    parameter: 'structure',
    cardinal: true,
    description: 'Stabilizacja podnóża (rośliny zielne, nawet krzewy) albo świeże podcięcia abrazyjne – informuje o stabilizacji lub erozji związanej z abrazją morską.',
    help: `Co wpisać: wysokość najwyższego świeżego podcięcia abrazyjnego (niszy, skarpy) u podnóża stoku, w metrach. Brak podcięć – 0.

Progi: brak podcięć lub do 0,5 m FV; punktowe podcięcia 0,5–1,5 m U1; wyraźne podcięcia powyżej 1,5 m U2.

Dlaczego: podcięcie to ślad ostatnich spiętrzeń sztormowych – morze zabiera podnóże, a stok nad nim traci podparcie. Porośnięte podnóże oznacza kilka spokojnych sezonów. Najlepiej oglądać jesienią, przed sztormami, i po każdym silnym sztormie.`,
    thresholds: {
      FV: 'Brak podcięć abrazyjnych lub do wysokości 0,5 m',
      U1: 'Punktowe podcięcia o wysokości 0,5–1,5 m',
      U2: 'Widoczne wyraźne podcięcia abrazyjne o wysokości powyżej 1,5 m',
    },
    inputs: [
      { kind: 'number', name: 'height', label: 'Najwyższe podcięcie', unit: 'm', min: 0, required: true, help: 'Wysokość najwyższego świeżego podcięcia abrazyjnego u podnóża, w metrach. Brak podcięć – 0.' },
      { kind: 'select', name: 'kind', label: 'Charakter podcięć', options: UNDERCUT_KIND, help: 'Opisowo – do pola wartości. Nie wpływa na ocenę.' },
    ],
    suggest: (i) => {
      const v = num(i.height)
      return v === undefined ? null : gradeUndercut1230(v)
    },
    warn: (i) => {
      const v = num(i.height)
      return i.kind === 'none' && v !== undefined && v > 0 ? `Wybrano „Brak podcięć”, a podcięcie ma ${plNum(v)} m.` : null
    },
    describe: (i) => {
      const v = num(i.height)
      if (i.kind === 'none' && (v === undefined || v === 0)) return 'Brak podcięć abrazyjnych'
      return [i.kind ? labelOf(UNDERCUT_KIND, i.kind) : '', v !== undefined ? `do ${plNum(v)} m wysokości` : ''].filter(Boolean).join(', ')
    },
  },
  {
    ...herbsBase,
    inputs: [
      ...herbsBase.inputs,
      {
        kind: 'species',
        name: 'species',
        label: 'Gatunki zielne na stoku (opcjonalnie)',
        help: 'Gatunki zielne stwierdzone na stoku z pokryciem w %. Opcjonalne – trafiają do opisu wskaźnika, a ich liczba podpowiada wskaźnik „Liczba gatunków roślin zielnych na stoku”.',
      },
    ],
    explain: (i) => {
      const n = herbRows(i.species).length
      if (!n) return null
      const typical = herbRows(i.species).filter((r) => isCharacteristicHerb(r.name)).length
      return `Na liście: ${n} ${speciesWord(n)}, w tym ${typical} charakterystycznych z katalogu.`
    },
    describe: (i) => {
      const list = herbRows(i.species)
        .map((r) => (r.cover !== undefined ? `${r.name} ${plNum(r.cover)}%` : r.name))
        .join(', ')
      return [labelOf(HERBS, i.choice), list].filter(Boolean).join('. ')
    },
  },
  measureIndicator({
    id: 'shrubs',
    label: 'Obecność charakterystycznych krzewów',
    cardinal: true,
    description: 'Warstwę krzewów można wydzielić na klifach nieaktywnych od kilku lat: na glinie rokitnik, jarząb, róża dzika; na podłożu mieszanym obok rokitnika sosna, osika, wierzba iwa. Im dłuższa stabilizacja, tym większe zakrzewienie.',
    help: `Co wybrać: skład krzewów charakterystycznych na stoku. Jeśli wpiszesz pokrycie warstwy krzewów w %, podpowiedź liczy się z niego (powyżej 15% FV, 5–15% U1, do 5% U2), a przy niezgodności z wyborem pojawi się ostrzeżenie.

Gatunki (tab. 1): rokitnik Hippophaë rhamnoides, jarząb Sorbus aucuparia, róża dzika Rosa canina, sosna Pinus sylvestris, osika Populus tremula, wierzba iwa Salix caprea; przy dłuższej stabilizacji głóg, jawor, brzoza, bez czarny, leszczyna.

${BOTANY_TIP}`,
    thresholds: thresholdsOf(SHRUBS),
    options: SHRUBS,
    inputLabel: 'Krzewy charakterystyczne',
    field: { name: 'cover', label: 'Pokrycie krzewów (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Pokrycie warstwy krzewów (b) na stoku, w %. Gdy wpisane, ma pierwszeństwo przed wyborem.' },
    grade: gradeShrubs1230,
  }),
  measureIndicator({
    id: 'trees',
    label: 'Obecność drzew',
    cardinal: true,
    description: 'Klify utrwalone w zależności od podłoża porastają buki lub sosny; na podłożu mieszanym jesiony, brzozy, dęby, rzadziej jarząb i jawor. Im bardziej utrwalone podłoże, tym większe zróżnicowanie gatunków.',
    help: `Co wybrać: skład drzew charakterystycznych na stoku. Jeśli wpiszesz pokrycie warstwy drzew w %, podpowiedź liczy się z niego (powyżej 10% FV, 1–10% U1, do 1% U2).

Gatunki: buk Fagus sylvatica (glina), sosna Pinus sylvestris (piasek), jesion, wiąz, jawor, brzoza, dęby, osika, jarząb. Drzewa obce (robinia, czeremcha amerykańska, wierzba ostrolistna) nie są charakterystyczne – zapisz je w oddziaływaniach (I01).

${BOTANY_TIP}`,
    thresholds: thresholdsOf(TREES),
    options: TREES,
    inputLabel: 'Drzewa charakterystyczne',
    field: { name: 'cover', label: 'Pokrycie drzew (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Pokrycie warstwy drzew (a) na stoku, w %. Gdy wpisane, ma pierwszeństwo przed wyborem.' },
    grade: gradeTrees1230,
  }),
  choiceIndicator({
    id: 'regeneration',
    label: 'Odnowienia, osobniki juwenilne wśród krzewów i drzew',
    cardinal: true,
    description: 'Świadczą o trwającym co najmniej od 2 lat procesie stabilizacji klifu i wzroście różnorodności gatunkowej.',
    help: `Co wybrać: czy na stoku są młode osobniki (siewki, podrost) krzewów i drzew charakterystycznych – liczne w płatach, pojedyncze, czy brak.

Dlaczego: odnowienie oznacza, że stok jest stabilny od co najmniej 2 lat i sukcesja idzie dalej. Na klifie aktywnym ich brak jest naturalny. Juwenilne buki pod krawędzią pochodzą zwykle z lasu na wierzchowinie.`,
    options: REGENERATION,
    inputLabel: 'Odnowienia krzewów i drzew',
  }),
  {
    id: 'speciesCount',
    label: 'Liczba gatunków roślin zielnych na stoku',
    parameter: 'structure',
    cardinal: true,
    description: 'Minimum 15 gatunków świadczy o zróżnicowaniu siedlisk. Poniżej 5 gatunków zróżnicowanie jest niewielkie.',
    help: `Co wpisać: liczbę gatunków roślin zielnych stwierdzonych na stoku w obrębie stanowiska (pas 25 m po obu stronach profilu), wszystkich – także synantropijnych. Puste – formularz policzy listę z wskaźnika „Obecność charakterystycznych roślin zielnych”, jeśli ją wypełniłeś.

Progi: min. 15 FV, 5–14 U1, mniej niż 5 U2. Raport z 2017 r. rekomenduje zachowanie tego wskaźnika bez zmian – mówi wprost o różnorodności biologicznej siedliska.`,
    thresholds: { FV: 'Minimum 15 gatunków', U1: 'Pomiędzy 5 a 15 gatunków', U2: 'Mniej niż 5 gatunków' },
    inputs: [{ kind: 'number', name: 'count', label: 'Liczba gatunków zielnych', unit: 'szt.', min: 0, help: 'Wszystkie gatunki zielne na stoku. Puste = liczba gatunków z listy przy roślinach charakterystycznych.' }],
    suggest: (i, ctx) => {
      const n = num(i.count) ?? herbListCount(ctx?.indicators?.herbs?.inputs)
      return n === undefined ? null : gradeSpeciesCount1230(n)
    },
    explain: (i, ctx) => {
      if (num(i.count) !== undefined) return null
      const n = herbListCount(ctx?.indicators?.herbs?.inputs)
      return n === undefined ? null : `Policzono ${n} ${speciesWord(n)} z listy przy roślinach charakterystycznych.`
    },
    warn: (i, ctx) => {
      const typed = num(i.count)
      const n = herbListCount(ctx?.indicators?.herbs?.inputs)
      return typed !== undefined && n !== undefined && typed < n ? `Lista przy roślinach charakterystycznych ma ${n} ${speciesWord(n)}, a wpisano ${plNum(typed)}.` : null
    },
    describe: (i, ctx) => {
      const n = num(i.count) ?? herbListCount(ctx?.indicators?.herbs?.inputs)
      return n === undefined ? '' : `${plNum(n)} ${speciesWord(n)}`
    },
  },
  measureIndicator({
    id: 'vegCover',
    label: 'Procent pokrycia stoku roślinnością w stosunku do odkrytych powierzchni',
    cardinal: true,
    description: 'Pokrycie podłoża roślinnością w 30–70% decyduje o największej różnorodności i jednocześnie dynamice klifu. Mniejsze obniża różnorodność, większe obniża walor dynamiki i powoduje zarastanie.',
    help: `Co wpisać: jaka część powierzchni stoku (rzut pionowy) jest pokryta roślinnością – wszystkimi warstwami łącznie – w stosunku do nagiego podłoża. Przy zróżnicowanym stoku („w dolnej części 100%, na stoku do 80%”) wpisz średnią, a rozkład opisz w polu wartości.

Progi: 30–70% FV; 10–30% albo 70–90% U1; poniżej 10% albo powyżej 90% U2. Raport z 2017 r.: kryterium bez rozróżnienia klifu aktywnego i martwego daje martwym fałszywie negatywny wynik.`,
    thresholds: { FV: 'Więcej niż 30% i mniej niż 70% roślin', U1: 'Mniej niż 30%, więcej niż 70% roślin', U2: 'Mniej niż 10% i więcej niż 90% roślin' },
    field: { label: 'Pokrycie stoku roślinnością', unit: '%', min: 0, max: 100, help: 'Procent powierzchni stoku pokryty roślinnością (wszystkie warstwy łącznie).' },
    grade: gradeVegCover1230,
  }),
  measureIndicator({
    id: 'beachWidth',
    label: 'Szerokość plaży',
    cardinal: true,
    description: 'Średnia szerokość plaż w Polsce to 35 m, pod klifami ok. 25 m. Im szersza plaża, tym większe prawdopodobieństwo ochrony klifu przed spiętrzeniem sztormowym i dowód na okresową akumulację.',
    help: `Co wpisać: szerokość plaży (albo platformy abrazyjnej) od podnóża klifu do linii wody, średnio na stanowisku, w metrach. Pod klifami gliniastymi często zamiast plaży jest platforma abrazyjna z głazami – wpisz jej szerokość i zaznacz to w zakładce Stanowisko. Brak plaży – 0.

Progi: tab. 2 przewodnika nie podaje ich dla tego wskaźnika (jest tylko w tab. 1). Formularz przyjmuje: od 25 m FV, 10–25 m U1, poniżej 10 m U2 – średnia z tab. 1 i oceny z monitoringu 2023 (Rozewie śr. 8,75 m, Kępa Redłowska 6,5 m – U2; stanowiska FV miały 25–30 m). To interpretacja.`,
    thresholds: { FV: 'Od 25 m (średnia szerokość plaż pod klifami)', U1: '10–25 m', U2: 'Poniżej 10 m lub brak plaży' },
    field: { label: 'Szerokość plaży', unit: 'm', min: 0, help: 'Średnia szerokość plaży lub platformy abrazyjnej u podnóża, w metrach.' },
    grade: gradeBeachWidth1230,
  }),
  measureIndicator({
    id: 'beachHeight',
    label: 'Wysokość plaży (górnej) u podnóża klifu',
    cardinal: true,
    description: 'Im wyższa plaża, tym większe prawdopodobieństwo ochrony ściany klifu przed spiętrzeniem sztormowym. Plaża o wysokości min. 2 m n.p.m. chroni przed typowymi corocznymi spiętrzeniami (1–1,5 m).',
    help: `Co wpisać: wysokość górnej plaży u podnóża klifu względem średniego poziomu morza, w m n.p.m. – z profilu niwelacyjnego, z poprawką na poziom morza w dniu pomiaru (dane z najbliższego kapitanatu portu).

Progi: od 2 m n.p.m. FV, 1–2 m U1, poniżej 1 m U2. Plaża 2,5 m chroni przed większością krótkotrwałych spiętrzeń na południowym Bałtyku. Bruk morenowy i głazy na platformie abrazyjnej też chronią – w 2023 r. podwyższono za to ocenę w Ustce.`,
    thresholds: { FV: 'Wyższa od 2 m n.p.m.', U1: 'Pomiędzy 1 a 2 m n.p.m.', U2: 'Niższa od 1 m n.p.m.' },
    field: { label: 'Wysokość górnej plaży', unit: 'm n.p.m.', min: 0, help: 'Wysokość górnej plaży u podnóża klifu nad średnim poziomem morza.' },
    grade: gradeBeachHeight1230,
  }),
  choiceIndicator({
    id: 'surge',
    label: 'Zasięg napływu morza na plażę',
    cardinal: true,
    description: 'Zasięg wyznaczony przez liniowo wyrzuconą na plażę materię organiczną lub artefakty antropogeniczne (kidzinę) – wyznacznik zagrożeń dla siedlisk klifu od falującego morza.',
    help: `Co wybrać: gdzie leży najwyższa linia kidziny (wodorosty, trzcina, drewno, śmieci wyrzucone przez morze) – przy linii wody, w środkowej części plaży, czy u samego podnóża klifu.

Dlaczego: kidzina u podnóża oznacza, że ostatnie spiętrzenie sztormowe dotarło do stoku i mogło go podciąć. Ten wskaźnik i „Stan zachowania dolnej części klifu” mierzą podobny proces – oceny zwykle idą w parze.`,
    options: SURGE,
    inputLabel: 'Zasięg napływu (linia kidziny)',
  }),
]

function geoPer100(i: InputValues): number | undefined {
  const l = num(i.landslides)
  if (l === undefined) return undefined
  const s = num(i.seeps) ?? 0
  const len = num(i.lengthM) ?? 100
  if (len <= 0) return undefined
  return ((l + s) / len) * 100
}

function thresholdsOf(opts: GradedOption[]): IndicatorDef['thresholds'] {
  const of = (g: Grade) => opts.find((o) => o.grade === g)?.label ?? ''
  return { FV: of('FV'), U1: of('U1'), U2: of('U2') }
}

function herbRows(value: unknown): { name: string; cover?: number }[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((r: Record<string, unknown>) => {
    const name = String(r?.name ?? '').trim()
    return name ? [{ name, cover: num(r?.cover) }] : []
  })
}
const herbListCount = (inputs: InputValues | undefined): number | undefined => {
  const n = new Set(herbRows(inputs?.species).map((r) => r.name.toLowerCase())).size
  return n || undefined
}
const isCharacteristicHerb = (name: string) => {
  const g = findSpecies1230(name)?.group
  return g === 'clay' || g === 'sand' || g === 'psammo'
}

/** 1 gatunek, 2–4 gatunki, 5+ gatunków (ale 12–14 gatunków). */
export const speciesWord = (n: number) =>
  n === 1 ? 'gatunek' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'gatunki' : 'gatunków'

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} stanowiska z odbiornika GPS (WGS84) – odczyt nad krawędzią klifu; podnóże opisz w zakładce „Profil klifu”. Zwarte korony drzew utrudniają odbiór pozycji. Trzymaj jeden format w całej karcie.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Kl1 Rozewie 1',
    help: `Nazwa stanowiska w Państwowym Monitoringu Środowiska – oznaczenie „Kl” z numerem i miejscowość, np. „Kl1 Rozewie 1”, „Kl14 Świdna Kępa W, WPN 2”.

Dlaczego: stanowiska klifowe przesuwają się z cofaniem brzegu, a nazwa i kilometraż pozwalają je odnaleźć i zestawić kolejne karty.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'areaName',
    label: 'Nazwa obszaru',
    required: true,
    placeholder: 'np. Kaszubskie Klify',
    help: 'Odcinek wybrzeża albo obszar Natura 2000, w którym leży stanowisko, np. „Kaszubskie Klify”, „Wolin i Uznam”, „Klify Poddębskie”. Poza obszarami – nazwa odcinka brzegu.',
  },
  {
    kind: 'text',
    name: 'chainage',
    label: 'Kilometraż brzegu',
    unit: 'km',
    placeholder: 'np. 128',
    help: 'Kilometraż brzegu morskiego wg słupków Urzędu Morskiego (np. 128 – Rozewie, 408,5 – Świdna Kępa). Ułatwia odnalezienie stanowiska.',
  },
  {
    kind: 'select',
    name: 'geology',
    label: 'Budowa geologiczna klifu',
    options: GEOLOGY,
    required: true,
    help: `Z czego zbudowany jest klif: piaski (fluwioglacjalne, eoliczne) – typ osypiskowy, nachylenie do ok. 30°; gliny – typ obrywowy, 60–80°; budowa złożona (gliny, gytie, torfy, piaski) – typ osypiskowo-zsuwowy. Szczegóły (np. „w dolnej części glina, wyżej gytia i torfy pod piaskami eolicznymi”) w opisie.

Od budowy zależy skład roślinności i to, które gatunki są charakterystyczne.`,
  },
  {
    kind: 'number',
    name: 'cliffHeight',
    label: 'Wysokość krawędzi klifu',
    unit: 'm n.p.m.',
    min: 0,
    help: 'Wysokość krawędzi klifu nad średnim poziomem morza – z profilu. Od 6 m (Bagicz) do 95 m (Wolin).',
  },
  {
    kind: 'select',
    name: 'baseType',
    label: 'U podnóża',
    options: BASE_TYPE,
    help: 'Co jest u podnóża: plaża piaszczysta, platforma abrazyjna (nachylona ku morzu powierzchnia wycięta w glinie, często ze żwirem i głazami), czy nic – woda dochodzi do podnóża.',
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Violo odoratae-Ulmetum, zarośla jaworowo-jarzębinowe',
    help: `Zbiorowiska na stoku, nazwami fitosocjologicznymi albo opisowo, wraz z fazą sukcesji. Klify aktywne: Poo-Tussilaginetum farfarae (glina), Trifolio-Anthyllidetum maritimae, zb. Bromus hordeaceus-Myosotis (piasek). Częściowo stabilne: Hippophaëtum rhamnoidis, zarośla z Prunus spinosa i Rhamnus, zb. Salix caprea-Populus tremula. Martwe: Galio odorati-Fagetum, Luzulo pilosae-Fagetum, Violo odoratae-Ulmetum, bór Empetro nigri-Pinetum.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Budowa i stan stoku, osuwiska, koluwium, podcięcia, plaża/platforma, roślinność w warstwach, umocnienia brzegu.',
    help: `Syntetyczny opis stanowiska:
• budowa geologiczna i morfologia: krawędź, stok, podnóże; nisze i języki osuwiskowe, koluwium, zerwy, wysięki;
• stan dynamiczny: które części są aktywne, które utrwalone;
• podnóże: plaża czy platforma abrazyjna, głazy, podcięcia;
• roślinność: gatunki dominujące w warstwach a, b, c, d, płaty przeniesione osuwiskami;
• umocnienia brzegu (opaski, gabiony, geowłóknina, faszyna), zejścia na plażę, zabudowa korony.

Dlaczego: przewodnik nie wymaga zdjęć fitosocjologicznych – opis i profil klifu to główna dokumentacja roślinności.`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Powierzchnia stoku na stanowisku (krawędź–podnóże × długość odcinka), w hektarach. W 2023 r. stanowiska miały 0,1–1 ha.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas'),
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    required: true,
    placeholder: 'np. 100x30 m',
    hint: '100–300 m wzdłuż brzegu × długość stoku (5–50 m).',
    help: `Stanowisko to pas stoku od krawędzi do podnóża: 100 albo 300 m wzdłuż brzegu, szerokość = długość stoku od krawędzi do podnóża (5–50 m). Wpisz faktyczne wymiary, np. „88x204 m”.

Przy większej zmienności gatunkowej albo kilku zbiorowiskach wykonuje się dwa i więcej profili – opisz je w zakładce „Profil klifu”.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 2–30',
    help: 'Zakres od podnóża (wysokość plaży) do krawędzi klifu, np. „2–30”.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 16.10.2011',
    required: true,
    hint: 'Optymalnie od lipca do października, najlepiej wczesną jesienią przed sztormami.',
    help: 'Dzień badań terenowych. Monitoring co 2–3 lata, najlepiej wczesną jesienią: plaże są już węższe, wysięki i spływy dobrze widoczne, większość gatunków kwitnie w lipcu–październiku. Po silnych sztormach warto zrobić dodatkową wizytację. Kolejne daty (np. z wcześniejszej wizyty) dopisz w „Innych informacjach”.',
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 7 && m <= 10 ? null : 'Termin poza optymalnym oknem (lipiec–październik). Część gatunków może być niewidoczna.'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- profil klifu (dodatkowa zakładka) ----------

const LAYER_OPTIONS: SelectOption[] = [
  { value: 'a', label: 'a – drzewa' },
  { value: 'b', label: 'b – krzewy' },
  { value: 'c', label: 'c – zielne' },
  { value: 'd', label: 'd – mszysta' },
]

const profileFields: FieldDef[] = [
  { kind: 'text', name: 'profileAzimuth', label: 'Azymut profilu', unit: '°', placeholder: 'np. 32', help: 'Azymut linii profilu poprzecznego (od krawędzi ku morzu), żeby powtórzyć go za 2–3 lata.' },
  {
    kind: 'text',
    name: 'profileBase',
    label: 'Współrzędne podnóża',
    wide: true,
    help: 'Współrzędne GPS końca siedliska u podnóża stoku (początek i koniec), bo te w zakładce Stanowisko są z krawędzi.',
  },
  {
    kind: 'textarea',
    name: 'profileMeasurements',
    label: 'Pomiary profilu',
    rows: 4,
    placeholder: 'np. 0 m – krawędź 30 m n.p.m.; 12 m – 22 m n.p.m.; 40 m – podnóże 2,8 m; 52 m – linia wody',
    help: `Ciąg niwelacyjny od 1–5 m za krawędzią w dół stoku, przez plażę do linii wody: odległość od początku profilu i wysokość punktów charakterystycznych (krawędź, załomy, nisze, podnóże, górna plaża, linia wody). Z tego liczy się wysokość klifu, wysokość plaży i nachylenie stoku.

Poziom morza z dnia pomiaru pobierz z najbliższego kapitanatu portu.`,
  },
  {
    kind: 'table',
    name: 'profileRanges',
    label: 'Zasięgi gatunków wzdłuż profilu',
    addLabel: 'Dodaj gatunek',
    rowLabel: 'Gatunek',
    help: 'Zasięg liniowy gatunków na stoku w pasie 25 m po obu stronach profilu, z podziałem na warstwy: od którego do którego metra profilu (licząc od krawędzi) występuje gatunek. Gatunek z dwoma odcinkami – dwa wiersze.',
    columns: [
      { kind: 'text', name: 'species', label: 'Gatunek', placeholder: 'np. Tussilago farfara', required: true, help: 'Nazwa naukowa gatunku.' },
      { kind: 'select', name: 'layer', label: 'Warstwa', options: LAYER_OPTIONS, help: 'a – drzewa, b – krzewy, c – zielne, d – mszysta.' },
      { kind: 'number', name: 'from', label: 'Od', unit: 'm', min: 0, help: 'Początek zasięgu na profilu, w metrach od krawędzi.' },
      { kind: 'number', name: 'to', label: 'Do', unit: 'm', min: 0, help: 'Koniec zasięgu na profilu, w metrach od krawędzi.' },
    ],
  },
  {
    kind: 'textarea',
    name: 'hydroMeteo',
    label: 'Dane hydrometeorologiczne (opcjonalnie)',
    rows: 3,
    help: 'Uzupełniające wskaźniki zalecane przez przewodnik na przyszłość: wysokość i liczba spiętrzeń sztormowych od ostatniego monitoringu, okresy intensywnych opadów, liczba dni i zasięg zlodzenia plaży. Nie wpływają na ocenę.',
  },
]

export const methodology1230: Methodology = {
  code: '1230',
  name: 'Klify na wybrzeżu Bałtyku',
  source:
    'Łabuz T.A. 2012, Klify nadmorskie na wybrzeżu Bałtyku, [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 40–58 (tab. 1 i 2)',

  siteFields,

  releves: {
    defaultCount: 0,
    intro:
      'Przewodnik dla klifów nie wymaga zdjęć fitosocjologicznych – płaty są zbyt zmienne i często niedostępne (osuwiska, półki, pionowe ściany). Roślinność dokumentują zasięgi gatunków wzdłuż profilu (zakładka „Profil klifu”) i opis stanowiska. Zdjęcie dodaj tylko wtedy, gdy na stoku jest stabilny, dostępny płat, np. buczyny albo łęgu na klifie martwym.',
    fields: [
      { kind: 'text', name: 'coords', label: 'Współrzędne środka zdjęcia', help: 'Współrzędne GPS środka powierzchni zdjęcia.' },
      { kind: 'number', name: 'area', group: 'Powierzchnia i pokrycie', label: 'Powierzchnia zdjęcia', unit: 'm²', min: 0, defaultValue: 100, help: 'Powierzchnia zdjęcia w m² – na stoku zwykle 10×10 m, mniej, gdy płat jest wąski.' },
      { kind: 'number', name: 'cover', group: 'Powierzchnia i pokrycie', label: 'Ogólne pokrycie', unit: '%', min: 0, max: 100, help: 'Procent powierzchni zdjęcia pokryty roślinnością.' },
      { kind: 'text', name: 'unit', label: 'Jednostka fitosocjologiczna', placeholder: 'np. Violo odoratae-Ulmetum', help: 'Zbiorowisko (zespół), do którego należy płat, np. buczyna albo łęg na klifie martwym.' },
      { kind: 'releve-species', name: 'species', label: 'Gatunki (skala Braun-Blanqueta)', help: 'Gatunki w warstwach A–D z ilościowością w skali Braun-Blanqueta.' },
    ],
  },

  extraSteps: [
    {
      id: 'profile',
      tab: 'Profil klifu',
      title: 'Profil klifu i zasięgi gatunków',
      intro:
        'Profil poprzeczny od krawędzi do linii wody (niwelator, teodolit, łata) i zasięgi liniowe gatunków wzdłuż niego – odpowiednik „dodatkowego formularza” z przewodnika. Wszystko opcjonalne, ale z tego liczy się nachylenie, wysokość klifu i plaży.',
      after: 'site',
      fields: profileFields,
    },
  ],

  indicators,

  prospects: {
    description:
      'Realne możliwości zachowania siedliska. Wszystkie stanowiska leżą w pasie technicznym brzegu, gdzie zabudowa i penetracja są ograniczone, ale siedlisko jest trwale narażone na zabudowę hydrotechniczną brzegu, zagospodarowanie korony, gatunki obce i wydeptywanie.',
    help: `Ocena eksperta. Weź pod uwagę zagrożenia wskazane w sprawozdaniu z 2017 r.:
• zabudowa hydrotechniczna i biotechniczna powstrzymująca erozję (opaski, gabiony, geowłóknina, narzut, faszyna) – zatrzymuje procesy typowe dla klifu;
• zabudowa lub intensywne zagospodarowanie przy koronie, które wymusi ochronę brzegu;
• gatunki obce, zwłaszcza inwazyjne: robinia, czeremcha amerykańska, wierzba ostrolistna, róża pomarszczona, rdestowce;
• ekspansywne gatunki rodzime (trzcinnik piaskowy, orlica, trzcina, jeżyna popielica);
• wydeptywanie, ścieżki i zejścia na plażę, zaśmiecanie.

Abrazja i ruchy masowe to procesy naturalne – nie obniżają perspektyw. Praktyka 2023: U1 dla Jastrzębiej Góry (opaska gabionowa i plany jej rozbudowy) i Gąsek (sąsiedztwo latarni, presja na umocnienie brzegu).`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Inne kombinacje',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających (umocnienia brzegu, zabudowa korony, gatunki inwazyjne), nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'B02.02', name: 'Wycinka lasu' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D05', name: 'Usprawniony dostęp do obszaru' },
    { code: 'E01.03', name: 'Zabudowa rozproszona' },
    { code: 'E01.04', name: 'Inne typy zabudowy' },
    { code: 'E03.01', name: 'Pozbywanie się odpadów z gospodarstw domowych / obiektów rekreacyjnych' },
    { code: 'F04.01', name: 'Plądrowanie stanowisk roślin' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na rowerze' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'G05.04', name: 'Wandalizm' },
    { code: 'H05.01', name: 'Odpadki i odpady stałe' },
    { code: 'I01', name: 'Nierodzime gatunki zaborcze' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02.12.01', name: 'Prace związane z obroną przed aktywnością morza i ochroną wybrzeży, groble' },
    { code: 'J02.12.02', name: 'Groble, nasypy, sztuczne plaże – ogólnie' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.02', name: 'Nagromadzenie materii organicznej' },
    { code: 'L07', name: 'Sztorm, tsunami' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. kontakt z buczyną 9130/9110 na wierzchowinie, wydmy 2110/2120 u podnóża, ptaki gniazdujące w ścianie.',
        help: 'Wartości przyrodnicze stanowiska poza samym siedliskiem: siedliska w kontakcie (buczyny i bory na wierzchowinie, wydmy przednie u podnóża), gatunki chronione i rzadkie, jaskółki brzegówki w ścianie, profil geologiczny o wartości edukacyjnej. Brak informacji – „Nie pozyskano danych”.',
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: `Jakie działania wykonano (ochrona przyrody i ochrona brzegu to nie to samo – opisz oba) i co proponujesz. Typowe dla 1230: usuwanie gatunków obcych (robinia, czeremcha amerykańska, róża pomarszczona, rdestowiec), kanalizowanie ruchu i grodzenie zejść na plażę, sprzątanie, rezygnacja z faszyny z łatwo korzeniących się gałęzi (osika, wierzby, dereń), sztuczne zasilanie plaży zamiast opasek. Brak działań – „Brak”.`,
      }
    return f
  }),

  speciesCatalog: SPECIES_1230.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer1230(s) })),
  speciesInfo: (name) => {
    const e = findSpecies1230(name)
    return e ? GROUP_LABELS_1230[e.group] : undefined
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator1230 = (id: string): IndicatorDef => {
  const i = methodology1230.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 1230`)
  return i
}
