// Metodyka 4030 (suche wrzosowiska) jako dane. Źródło: Pawlaczyk P. 2012, „4030 Suche wrzosowiska (Calluno-Genistion,
// Pohlio-Callunion, Calluno-Arctostaphylion)” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik
// metodyczny, cz. II, GIOŚ, s. 230–246 (tab. 1 i 2), z praktyką oceny ze sprawozdań z monitoringu 2009–2011, 2016–2018
// i 2020–2021 (te ostatnie nadal oceniały „wg Pawlaczyk 2012”). Siedlisko nieleśne, półnaturalne, utrzymywane przez
// zaburzenia (poligony, pożary, wypas, koszenie): transekt 200×10 m, 3 zdjęcia fitosocjologiczne po 100 m².
// Silnik wspólny (src/7120) bez zmian; z modułu leśnego tylko klocki generyczne.
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_4030,
  SPECIES_4030,
  defaultLayer4030,
  findSpecies4030,
  isAlien4030,
  isExpansive4030,
  isGrass4030,
  isTree4030,
  speciesKey4030,
} from './species'

// ---------- progi liczbowe (tab. 2) ----------

/**
 * Pokrycie wrzosu (na wrzosowiskach mącznicowych: wrzosu i mącznicy łącznie): „>50%” FV, „30–50%” U1, „<30%” U2.
 * Obie granice przedziału 30–50% należą do U1 (FV dopiero powyżej 50%).
 */
export const gradeCalluna4030 = (p: number): Grade => (p > 50 ? 'FV' : p >= 30 ? 'U1' : 'U2')

/** Pokrycie traw i zarośnięcie przez drzewa: „<10%” FV, „10–30%” U1, „>30%” U2 (10% i 30% – U1). */
export const gradeCover10to30_4030 = (p: number): Grade => (p < 10 ? 'FV' : p <= 30 ? 'U1' : 'U2')
export const gradeGrasses4030 = gradeCover10to30_4030
export const gradeTrees4030 = gradeCover10to30_4030

/**
 * Gatunki obce i ekspansywne rodzime: „Brak” FV, „Pojedyncze, <10%” U1, „>10%” U2.
 * Równo 10% formularz liczy do U1 (U2 dopiero powyżej 10%). Gatunki obecne, ale bez podanego pokrycia – U1.
 */
export function gradePresence4030(count: number, cover?: number): Grade {
  if (count <= 0 && !(cover !== undefined && cover > 0)) return 'FV'
  return cover !== undefined && cover > 10 ? 'U2' : 'U1'
}

const pct = (v: number) => `${plNum(v)}%`
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey4030(n), n])).values()]
const sumCover = (v: unknown): number | undefined => {
  const covers = speciesRows(v)
    .filter((r) => r.name?.trim())
    .map((r) => num(r.cover))
    .filter((c): c is number => c !== undefined)
  return covers.length ? Math.round(covers.reduce((a, b) => a + b, 0) * 10) / 10 : undefined
}

// ---------- opcje selektów ----------

export const HEATH_TYPES = [
  { value: '', label: '—' },
  { value: 'pohlio', label: 'Wrzosowisko knotnikowe (Pohlio-Callunetum)' },
  { value: 'genista', label: 'Wrzosowisko janowcowe (Genisto germanicae-Callunetum, Genisto pilosae-Callunetum)' },
  { value: 'arctostaphylos', label: 'Wrzosowisko mącznicowe (Arctostaphylo-Callunetum)' },
  { value: 'scabiosa', label: 'Kwietne wrzosowisko janowcowe (Scabioso canescentis-Genistetum)' },
  { value: 'wet', label: 'Wilgotna postać wrzosowiska (z torfowcami, rosiczką, borówką bagienną)' },
]
const isArcto = (site: InputValues | undefined) => site?.heathType === 'arctostaphylos'

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie zmniejsza się, nie jest antropogenicznie pofragmentowana', grade: 'FV' },
  { value: 'slow', label: 'Wykazuje powolny trend spadkowy lub jest antropogenicznie pofragmentowana', grade: 'U1' },
  { value: 'fast', label: 'Wykazuje szybki trend spadkowy lub jest silnie antropogenicznie pofragmentowana', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const POPULATION: GradedOption[] = [
  { value: 'all', label: 'Obecne i liczne wszystkie fazy rozwojowe – osobniki juwenilne, generatywne, senilne', grade: 'FV' },
  { value: 'fewJuvenile', label: 'Wszystkie fazy rozwojowe obecne, ale osobniki juwenilne skąpo reprezentowane', grade: 'U1' },
  { value: 'senile', label: 'Brak osobników juwenilnych, objawy starzenia się populacji przy braku jej odnowienia', grade: 'U2' },
]
const KEY_SPECIES: GradedOption[] = [
  { value: 'all', label: 'Stan wszystkich gatunków właściwy (FV)', grade: 'FV' },
  { value: 'someU1', label: 'Stan niektórych gatunków niezadowalający (U1)', grade: 'U1' },
  { value: 'someU2', label: 'Stan niektórych gatunków zły (U2)', grade: 'U2' },
  { value: 'noData', label: 'Brak danych (XX)', grade: 'XX' },
]
const DISTORTIONS: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'minor', label: 'Występują, lecz mało znaczące', grade: 'U1' },
  { value: 'strong', label: 'Silne', grade: 'U2' },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

/** Select niewymagany – gdy oceniasz ekspercko albo wpisujesz opis. */
const optionalSelect = (label: string, options: GradedOption[], help?: string): FieldDef => ({ ...selectInput(label, options, help), required: false })

const noteInput = (label: string, placeholder: string, help: string): FieldDef => ({ kind: 'textarea', name: 'note', label, rows: 2, placeholder, help })
const note = (i: InputValues) => String(i.note ?? '').trim()

const NONE_FIELD = (label: string, help: string): FieldDef => ({
  kind: 'select',
  name: 'none',
  label,
  options: [
    { value: '', label: '—' },
    { value: 'yes', label: 'Nie stwierdzono' },
  ],
  help,
})

// ---------- liczenie z list ----------

/** Pokrycie z pola „łącznie” albo suma z listy. */
const coverOf = (i: InputValues) => num(i.total) ?? sumCover(i.species)

/** Pokrycie wrzosu, a na wrzosowisku mącznicowym – wrzosu i mącznicy łącznie. */
function callunaCover(i: InputValues, site: InputValues | undefined): number | undefined {
  const c = num(i.calluna)
  if (c === undefined) return undefined
  const a = num(i.arcto)
  return isArcto(site) && a !== undefined ? Math.round((c + a) * 10) / 10 : c
}

/** Obce i ekspansywne: liczba gatunków i pokrycie z listy albo wprost. */
function presenceFromInputs(i: InputValues): Grade | null {
  const names = distinct(rowNames(i.species))
  const cover = coverOf(i)
  if (names.length || cover !== undefined) return gradePresence4030(names.length, cover)
  if (i.none === 'yes') return 'FV'
  return null
}

const describePresence = (i: InputValues) => {
  if (note(i)) return note(i)
  const list = describeSpecies(speciesRows(i.species))
  if (!list && i.none === 'yes') return 'nie stwierdzono'
  const t = num(i.total)
  return [list, t !== undefined ? `łącznie ${pct(t)}` : ''].filter(Boolean).join('; ')
}

const explainPresence = (what: string) => (i: InputValues) => {
  const names = distinct(rowNames(i.species))
  if (!names.length) return null
  const t = coverOf(i)
  return `${what}: ${names.length}, łączne pokrycie ${t !== undefined ? pct(t) : '— (nie podano – formularz liczy jako „pojedyncze”, U1)'}.`
}

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description: 'Zmiana powierzchni wrzosowiska na stanowisku i jego antropogeniczne pofragmentowanie (zalesienia, drogi, zarastanie).',
    help: `Co wybrać: czy powierzchnia wrzosowiska na stanowisku się zmniejsza (od poprzedniego badania albo względem danych z map, ortofotomap, inwentaryzacji Lasów Państwowych) i czy jest pocięta przez człowieka – zalesienia, drogi, pasy przeciwpożarowe. Powierzchnię w hektarach i krótki opis możesz wpisać obok – opis trafi do „wartości” w karcie.

Progi (tab. 2): nie zmniejsza się, nie jest antropogenicznie pofragmentowana – FV; powolny trend spadkowy albo antropogeniczne pofragmentowanie – U1; szybki trend spadkowy albo silne pofragmentowanie – U2. Przy pierwszym badaniu bez danych do porównania wybierz „Brak danych” (XX) albo oceń ekspercko.

Dlaczego: wrzosowisko znika przede wszystkim pod zalesieniami i samoistnym nalotem drzew. Metodyka: jeśli zarastanie drzewami grozi zanikiem siedliska, ma rzutować także na powierzchnię i perspektywy. Sprawozdanie 2016–2018 zauważa, że brak definicji tego parametru czyni ocenę subiektywną – zaznacz oceniany obszar na mapce.`,
    thresholds: thresholdsOf(AREA),
    inputs: [
      optionalSelect('Zmiana powierzchni', AREA, 'Puste, gdy oceniasz ekspercko i opisujesz w polu obok.'),
      { kind: 'number', name: 'areaHa', label: 'Powierzchnia (opcjonalnie)', unit: 'ha', min: 0, help: 'Powierzchnia płatów wrzosowiska na stanowisku w hektarach, jeśli ją znasz – trafi do pola „wartość”. Od ułamków hektara w krajobrazie borowym do tysięcy hektarów na poligonach.' },
      noteInput('Opis (opcjonalnie)', 'np. zasięg ograniczony przez sztuczne nasadzenia brzozy i sosny', 'Krótki opis zmian powierzchni. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => {
      const ha = num(i.areaHa)
      return [ha !== undefined ? `${plNum(ha)} ha` : '', note(i) || (i.choice ? labelOf(AREA, i.choice).toLowerCase() : '')].filter(Boolean).join('; ')
    },
  },
  {
    id: 'calluna',
    label: 'Pokrycie wrzosu zwyczajnego Calluna vulgaris (ewentualnie łączne wrzosu i mącznicy lekarskiej Arctostaphylos uva-ursi)',
    parameter: 'structure',
    cardinal: true,
    description:
      'Procent powierzchni transektu pokryty przez wrzos zwyczajny, a na wrzosowiskach mącznicowych – łącznie przez wrzos i mącznicę lekarską. Wskaźnik decyduje o strukturze siedliska i o tym, czy to w ogóle jest wrzosowisko.',
    help: `Co wpisać: pokrycie transektu przez wrzos w procentach, a jeśli rośnie tam mącznica lekarska – także jej pokrycie. Mącznicę formularz dolicza tylko wtedy, gdy w danych stanowiska wybrano „Wrzosowisko mącznicowe” (metodyka: „ewentualnie na wrzosowiskach mącznicowych łączne”); na innych typach pokazuje ją tylko w opisie.

Progi: powyżej 50% – FV; 30–50% – U1; poniżej 30% – U2. Równo 50% i równo 30% formularz liczy do U1.

Wskaźnik kardynalny. Sprawozdanie 2016–2018 przypomina, żeby odnosić go wyłącznie do powierzchni transektu – tylko tak da się porównać zmiany pokrycia wrzosu między kolejnymi badaniami.`,
    thresholds: { FV: '>50%', U1: '30–50%', U2: '<30%' },
    inputs: [
      { kind: 'number', name: 'calluna', label: 'Pokrycie wrzosu', unit: '%', min: 0, max: 100, required: true, help: 'Procent powierzchni transektu pokryty przez wrzos zwyczajny Calluna vulgaris. Przy zakresie (np. „75–80%”) wpisz dolną granicę, a zakres w opisie.' },
      { kind: 'number', name: 'arcto', label: 'Pokrycie mącznicy (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Procent powierzchni transektu pokryty przez mącznicę lekarską Arctostaphylos uva-ursi. Doliczana do wrzosu tylko na wrzosowisku mącznicowym (typ wrzosowiska w danych stanowiska).' },
      noteInput('Opis (opcjonalnie)', 'np. Pokrycie na transekcie: wrzos 75–80%, mącznica 2%', 'Krótki opis, który trafi do „wartości” w karcie zamiast samych procentów.'),
    ],
    suggest: (i, ctx) => {
      const c = callunaCover(i, ctx?.site)
      return c !== undefined ? gradeCalluna4030(c) : null
    },
    explain: (i, ctx) => {
      const c = num(i.calluna)
      const a = num(i.arcto)
      if (c === undefined || a === undefined) return null
      return isArcto(ctx?.site)
        ? `Wrzosowisko mącznicowe: wrzos ${pct(c)} + mącznica ${pct(a)} = ${pct(callunaCover(i, ctx?.site)!)}.`
        : `Liczy się sam wrzos (${pct(c)}) – mącznica (${pct(a)}) tylko na wrzosowisku mącznicowym.`
    },
    warn: (i, ctx) => {
      const c = num(i.calluna)
      const a = num(i.arcto)
      if (c !== undefined && a !== undefined && c + a > 100.05) return `Wrzos i mącznica razem ${pct(c + a)} – więcej niż 100% transektu.`
      if (isArcto(ctx?.site) && c !== undefined && a === undefined) return 'Wrzosowisko mącznicowe, a nie podano pokrycia mącznicy – liczy się sam wrzos.'
      return null
    },
    describe: (i) => {
      const c = num(i.calluna)
      const a = num(i.arcto)
      return note(i) || [c !== undefined ? `wrzos ${pct(c)}` : '', a !== undefined ? `mącznica ${pct(a)}` : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'grasses',
    label: 'Pokrycie traw',
    parameter: 'structure',
    description:
      'Sumaryczne pokrycie powierzchni transektu przez gatunki traw, rozumiane jak w fitosocjologii. Wskaźnik negatywny – zarastanie trawami to najpospolitszy kierunek degeneracji wrzosowisk.',
    help: `Co wpisać: trawy na transekcie z pokryciem w procentach (kostrzewa owcza, mietlica pospolita, śmiałek pogięty, izgrzyca, bliźniczka, trzcinnik piaskowy, trzęślica…). Formularz sumuje pokrycia; łączne pokrycie wpisane wprost ma pierwszeństwo. Trzcinnik i trzęślica liczą się tu i – osobno – w apofitach.

Progi: poniżej 10% – FV; 10–30% – U1; powyżej 30% – U2. Równo 10% i 30% formularz liczy do U1. Tab. 1 każe podawać wynik „z zaokrągleniem do pełnych dziesiątek”, ale formularz porównuje z progami sumę bez zaokrąglania – inaczej przykład z przewodnika (Duchny Młode I: 5 + 0,5 + 2–3%) wyszedłby U1 zamiast FV.

Dlaczego: trawy wypierają wrzos przy braku zaburzeń i przy dopływie azotu z powietrza. Sprawozdanie 2021: na najgorszych stanowiskach (U2) trawy pokrywały ok. 40%.`,
    thresholds: { FV: '<10%', U1: '10–30%', U2: '>30%' },
    inputs: [
      speciesInput('Trawy na transekcie', 'Gatunki traw z pokryciem transektu w %, np. Festuca ovina 5. Dla „<1%” wpisz 0,5, dla „2–3%” – 2,5.'),
      { kind: 'number', name: 'total', label: 'Łączne pokrycie traw (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Sumaryczne pokrycie traw wpisane wprost. Ma pierwszeństwo przed sumą z listy.' },
      noteInput('Opis (opcjonalnie)', 'np. Festuca ovina 5%, Agrostis capillaris 0,5%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = coverOf(i)
      return c !== undefined ? gradeGrasses4030(c) : null
    },
    explain: (i) => {
      const names = rowNames(i.species)
      if (!names.length) return null
      const t = coverOf(i)
      return `Gatunków traw: ${distinct(names).length}, łączne pokrycie ${t !== undefined ? pct(t) : '— (wpisz pokrycie)'}.`
    },
    warn: (i) => {
      const odd = distinct(rowNames(i.species).filter((n) => findSpecies4030(n) && !isGrass4030(n)))
      return odd.length ? `Na liście są gatunki, które nie są trawami: ${odd.join(', ')} – sprawdź.` : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      const t = num(i.total)
      return [list, t !== undefined ? `łącznie ${pct(t)}` : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'trees',
    label: 'Zarośnięcie przez drzewa',
    parameter: 'structure',
    cardinal: true,
    description:
      'Procent powierzchni transektu pokryty przez drzewa – zarówno spontaniczne naloty, jak i drzewa nasadzone w wyniku zalesień. Zarastanie drzewami to główne zagrożenie i czynnik degradacji wrzosowisk.',
    help: `Co wpisać: łączne pokrycie transektu przez drzewa w procentach (rzut koron), a obok listę gatunków z pokryciem i np. wysokością w opisie. Liczą się naloty i nasadzenia, także drzewa obce (czeremcha amerykańska, dąb czerwony, robinia – one idą dodatkowo do „Gatunków obcych”). Krzewy (jałowiec, kruszyna, janowce) nie są drzewami.

Progi: poniżej 10% – FV; 10–30% – U1; powyżej 30% – U2. Równo 10% i 30% formularz liczy do U1.

Wskaźnik kardynalny. Jeżeli zarastanie jakichś fragmentów jest tak silne, że grozi zanikiem siedliska, metodyka każe uwzględnić to także w ocenie powierzchni i perspektyw ochrony.`,
    thresholds: { FV: '<10%', U1: '10–30%', U2: '>30%' },
    inputs: [
      speciesInput('Drzewa na transekcie', 'Gatunki drzew z pokryciem transektu w %, np. Pinus sylvestris 3, Betula pendula 2.'),
      { kind: 'number', name: 'total', label: 'Łączne pokrycie drzew (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Pokrycie transektu przez drzewa wpisane wprost. Ma pierwszeństwo przed sumą z listy (korony mogą się nakładać). Brak drzew = 0.' },
      noteInput('Opis (opcjonalnie)', 'np. Pinus sylvestris 3% wys. 1,5–2,5 m; Betula pendula 2%, wys. 5–8 m', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = coverOf(i)
      return c !== undefined ? gradeTrees4030(c) : null
    },
    explain: (i) => {
      const names = rowNames(i.species)
      if (!names.length) return null
      const t = coverOf(i)
      return `Gatunków drzew: ${distinct(names).length}, łączne pokrycie ${t !== undefined ? pct(t) : '— (wpisz pokrycie)'}.`
    },
    warn: (i) => {
      const odd = distinct(rowNames(i.species).filter((n) => findSpecies4030(n) && !isTree4030(n)))
      return odd.length ? `Na liście są gatunki, które nie są drzewami: ${odd.join(', ')} – krzewy i krzewinki się tu nie liczą.` : null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      const t = num(i.total)
      return [t !== undefined ? `pokrycie ${pct(t)}` : '', list].filter(Boolean).join('; ')
    },
  },
  {
    id: 'aliens',
    label: 'Gatunki obce geograficznie',
    parameter: 'structure',
    cardinal: true,
    description:
      'Obecność inwazyjnych gatunków obcych (neofitów) i ich pokrycie na transekcie. Trzeba podać wszystkie gatunki obce geograficznie, lokalnie zachowujące się inwazyjnie, z pokryciem każdego.',
    help: `Co wpisać: wszystkie gatunki obce z pokryciem transektu w procentach. Formularz sumuje pokrycia; łączne pokrycie wpisane wprost ma pierwszeństwo. Brak – zaznacz „Nie stwierdzono”.

Najczęściej (tab. 1): czeremcha amerykańska Padus serotina, przymiotno kanadyjskie Conyza canadensis, łubin trwały Lupinus polyphyllus, nawłoć późna Solidago gigantea. Sprawozdania 2016–2021 dodają m.in. przymiotno białe, starca wiosennego, włośnicę zieloną, palusznika, wielbłądkę i mech krzywoszczeć przywłokę Campylopus introflexus.

Progi: brak – FV; pojedyncze, do 10% pokrycia – U1; powyżej 10% – U2. Równo 10% to jeszcze U1. Gatunek bez podanego pokrycia formularz liczy jako „pojedynczy” (U1).

Wskaźnik kardynalny – więc nawet jeden osobnik konyzy obniża strukturę do U1. Sprawozdanie 2016–2018 proponowało, żeby pojedyncze osobniki dawały FV; propozycji nie przyjęto (2021 oceniano wg tab. 2), formularz trzyma się tab. 2.`,
    thresholds: { FV: 'Brak', U1: 'Pojedyncze, <10%', U2: '>10%' },
    inputs: [
      speciesInput('Gatunki obce na transekcie', 'Gatunki obce geograficznie z pokryciem transektu w %, np. Padus serotina 2. Pojedyncze osobniki – 0,5.'),
      { kind: 'number', name: 'total', label: 'Łączne pokrycie (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Łączne pokrycie gatunków obcych wpisane wprost. Ma pierwszeństwo przed sumą z listy.' },
      NONE_FIELD('Brak gatunków obcych', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków obcych – wtedy wskaźnik to FV, a do karty trafia „nie stwierdzono”.'),
      noteInput('Opis (opcjonalnie)', 'np. Nie stwierdzono obecności gatunków obcych geograficznie.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: presenceFromInputs,
    explain: explainPresence('Gatunków obcych'),
    warn: (i) => {
      const names = rowNames(i.species)
      if (i.none === 'yes' && names.length) return 'Zaznaczono „Nie stwierdzono”, a lista gatunków obcych nie jest pusta.'
      const native = distinct(names.filter((n) => findSpecies4030(n) && !isAlien4030(n)))
      return native.length ? `Na liście gatunków obcych są gatunki rodzime: ${native.join(', ')}.` : null
    },
    describe: describePresence,
  },
  {
    id: 'expansive',
    label: 'Ekspansywne gatunki rodzime (apofity)',
    parameter: 'structure',
    description:
      'Obecność rodzimych gatunków ekspansywnych (apofityzacja) i ich pokrycie na transekcie. Najczęściej trzcinnik piaskowy Calamagrostis epigejos, jeżyny Rubus spp. i gatunki ruderalne, w kwietnym wrzosowisku nawet ciemiężyk białokwiatowy Vincetoxicum hirundinaria.',
    help: `Co wpisać: wszystkie rodzime gatunki ekspansywne z pokryciem transektu w procentach. Formularz sumuje pokrycia; łączne pokrycie wpisane wprost ma pierwszeństwo. Brak – zaznacz „Nie stwierdzono”.

Gatunki: tab. 1 – trzcinnik piaskowy, jeżyny, gatunki ruderalne, ciemiężyk. Sprawozdanie 2021 dodaje orlicę pospolitą, trzęślicę modrą, żarnowiec miotlasty i wrotycz – są w katalogu i też się sumują.

Progi: brak – FV; pojedyncze, do 10% pokrycia – U1; powyżej 10% – U2. Równo 10% to jeszcze U1. Gatunek bez podanego pokrycia formularz liczy jako „pojedynczy” (U1). Jeśli uznasz, że gatunek jest obecny, ale nie zachowuje się ekspansywnie (np. kilka kęp trzcinnika – tak w karcie z przewodnika, FV), nie wpisuj go na listę, tylko opisz w polu opisu i zaznacz „Nie stwierdzono”.

Dlaczego: trzcinnik tworzy zwarte, jednogatunkowe agregacje, których wypieranie jest nierozwiązanym problemem ochrony wrzosowisk.`,
    thresholds: { FV: 'Brak', U1: 'Pojedyncze, <10%', U2: '>10%' },
    inputs: [
      speciesInput('Gatunki ekspansywne na transekcie', 'Rodzime gatunki ekspansywne z pokryciem transektu w %, np. Calamagrostis epigejos 5.'),
      { kind: 'number', name: 'total', label: 'Łączne pokrycie (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Łączne pokrycie gatunków ekspansywnych wpisane wprost. Ma pierwszeństwo przed sumą z listy.' },
      NONE_FIELD('Brak ekspansji', 'Zaznacz „Nie stwierdzono”, gdy na transekcie nie ma gatunków zachowujących się ekspansywnie – wtedy wskaźnik to FV.'),
      noteInput('Opis (opcjonalnie)', 'np. Obecny trzcinnik piaskowy, ale w niewielkiej ilości', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: presenceFromInputs,
    explain: explainPresence('Gatunków ekspansywnych'),
    warn: (i) => {
      const names = rowNames(i.species)
      if (i.none === 'yes' && names.length) return 'Zaznaczono „Nie stwierdzono”, a lista nie jest pusta.'
      const odd = distinct(names.filter((n) => findSpecies4030(n) && !isExpansive4030(n)))
      return odd.length ? `Na liście są gatunki spoza grupy ekspansywnych: ${odd.join(', ')}.` : null
    },
    describe: describePresence,
  },
  {
    id: 'population',
    label: 'Struktura populacji kluczowych gatunków',
    parameter: 'structure',
    description:
      '„Kompletność” stadiów wiekowo-rozwojowych wrzosu zwyczajnego, a na wrzosowiskach mącznicowych – wrzosu i mącznicy lekarskiej, w ocenie eksperta: czy są osobniki juwenilne, dojrzałe, rozmnażające się generatywnie i senilne, i czy struktura populacji sugeruje jej ciągłość w czasie.',
    help: `Co wybrać: jakie fazy rozwojowe wrzosu (i mącznicy na wrzosowisku mącznicowym) widać na transekcie. Młode siewki i odrosty, kwitnące krzewinki, stare, rozpadające się kępy. Opisz w notatce – trafi do karty.

Progi: obecne i liczne wszystkie fazy rozwojowe – FV; wszystkie fazy obecne, ale juwenilne skąpo – U1; brak juwenilnych, starzenie się populacji bez odnowienia – U2.

Uwaga ze sprawozdania 2016–2018: wrzosowisko w fazie optymalnej (prawie cała powierzchnia pod wrzosem generatywnym, odnowienie głównie wegetatywne) z definicji wypada tu słabo, choć jest w dobrym stanie – autorzy proponowali zrezygnować ze wskaźnika. Nie przyjęto tego, więc wskaźnik zostaje; przy takiej sytuacji opisz ją w notatce.`,
    thresholds: thresholdsOf(POPULATION),
    inputs: [
      selectInput('Fazy rozwojowe', POPULATION),
      noteInput('Opis (opcjonalnie)', 'np. Obecne i liczne wszystkie fazy rozwojowe wrzosu i mącznicy; stan populacji stabilny.', 'Krótki opis struktury populacji. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(POPULATION)),
    describe: (i) => note(i) || labelOf(POPULATION, i.choice),
  },
  {
    id: 'keySpecies',
    label: 'Stan kluczowych dla różnorodności biologicznej gatunków lokalnie typowych dla siedliska (wskaźnik fakultatywny)',
    parameter: 'structure',
    description:
      'Zdolność siedliska do utrzymywania lokalnie typowych gatunków chronionych, zagrożonych i rzadkich, np. widłak goździsty Lycopodium clavatum, lerka Lullula arborea, świergotek polny Anthus campestris, cietrzew Tetrao tetrix, modliszka Mantis religiosa, poskocz krasny Eresus cinnaberinus. Stosować tylko, gdy są odpowiednie dane.',
    help: `Co wybrać: stan lokalnie typowych gatunków kluczowych dla różnorodności – wybór zależy od obszaru (widłak goździsty, lerka, świergotek polny, cietrzew, modliszka, poskocz krasny, inne bezkręgowce związane z wrzosowiskami). Wymień je w notatce.

Wskaźnik fakultatywny – gdy brak danych, wybierz „Brak danych” (XX). XX tego wskaźnika nie psuje oceny struktury, bo nie jest kardynalny. Sprawozdanie 2016–2018 proponowało go pominąć (niepowtarzalny, zależny od pogody i pory dnia); w 2021 oceniono go tylko na 7 stanowiskach.`,
    thresholds: { FV: 'Stan wszystkich gatunków właściwy (FV)', U1: 'Stan niektórych gatunków niezadowalający (U1)', U2: 'Stan niektórych gatunków zły (U2)' },
    inputs: [
      selectInput('Stan gatunków kluczowych', KEY_SPECIES),
      noteInput('Opis (opcjonalnie)', 'np. lerka i świergotek polny – kilka par lęgowych', 'Krótki opis: jakie gatunki i w jakim stanie. Gdy jest, trafia do „wartości” w karcie.'),
    ],
    suggest: byOption(gradeMap(KEY_SPECIES)),
    describe: (i) => note(i) || labelOf(KEY_SPECIES, i.choice),
  },
  {
    id: 'distortions',
    label: 'Inne zniekształcenia',
    parameter: 'structure',
    description:
      'Niespecyficzne, ale występujące niekiedy zniekształcenia: zaśmiecenie, pozyskiwanie piasku, rozjeżdżanie, wydeptywanie itp. Za zniekształcenia nie uważa się czynników utrzymujących wrzosowisko, np. śladów miejscowych pożarów na poligonach.',
    help: `Co wybrać: skalę zaśmiecenia, wybierania piasku, rozjeżdżania (quady, motocykle, ciężki sprzęt), przeorania itp. Opisz w notatce, co widać – trafi do karty.

Progi: brak – FV; występują, lecz mało znaczące – U1; silne – U2. Ocenę obniża się do U1 albo U2 odpowiednio do skali, rozległości i natężenia.

Uwaga: to, co utrzymuje wrzosowisko, nie jest zniekształceniem – ślady pożarów i ćwiczeń na czynnym poligonie, kwaterowe koszenie, wypas, drobne uszkodzenia od pocisków odnawiające wrzos (sprawozdanie 2021). Sprawozdanie 2016–2018 proponowało FV dla „mało znaczących” – nie przyjęto, formularz trzyma się tab. 2.`,
    thresholds: thresholdsOf(DISTORTIONS),
    inputs: [
      optionalSelect('Zniekształcenia', DISTORTIONS, 'Puste tylko wtedy, gdy wskaźnika nie oceniano – wtedy wybierz ocenę ręcznie (XX) i napisz dlaczego w opisie.'),
      noteInput('Opis (opcjonalnie)', 'np. Rozjeżdżanie quadami wzdłuż drogi pożarowej, pojedyncze śmieci.', 'Krótki opis, co i w jakiej skali zniekształca siedlisko. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(DISTORTIONS)),
    describe: (i) => note(i) || labelOf(DISTORTIONS, i.choice),
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu, z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie.

Dlaczego: stanowiska obligatoryjnie lokalizuje się GPS i nanosi na mapę 1:10 000 (topograficzną, leśną albo fotomapę) z zaznaczoną biochorą 4030 – przy powtórce za 3–6 lat ktoś musi trafić w ten sam transekt.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Duchny Młode I',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – zwykle miejscowość albo poligon z numerem, np. „Duchny Młode I”, „Poligon Rembertów 4”, „Diabelskie Pustacie – Pod Amboną I”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego transektu.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'select',
    name: 'heathType',
    label: 'Typ wrzosowiska',
    options: HEATH_TYPES,
    help: `Postać wrzosowiska na stanowisku. Ma znaczenie dla oceny: na wrzosowisku mącznicowym wskaźniki „pokrycie wrzosu” i „struktura populacji kluczowych gatunków” obejmują wrzos i mącznicę lekarską łącznie; na pozostałych – sam wrzos.

• knotnikowe (Pohlio-Callunetum) – najpospolitsze: wrzos z mszystą warstwą knotnika zwisłego;
• janowcowe (Genisto-Callunetum) – wrzos z janowcem ciernistym albo włosistym, rzadkie, głównie zachód kraju;
• mącznicowe (Arctostaphylo-Callunetum) – masowy udział mącznicy, głównie środkowa i wschodnia Polska;
• kwietne (Scabioso canescentis-Genistetum) – ciepłolubne, w mozaice z murawami kserotermicznymi;
• wilgotna postać – z torfowcami, rosiczką, borówką bagienną (bez wrzośca – z wrzoścem to już 4010).`,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Calluno-Genistetum odmiana subkontynentalna',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Dla 4030: klasa Nardo-Callunetea, rząd Calluno-Ulicetalia; związki Calluno-Genistion (Genisto germanicae-Callunetum, Genisto pilosae-Callunetum), Pohlio-Callunion (Pohlio-Callunetum), Calluno-Arctostaphylion (Arctostaphylo-Callunetum, Scabioso canescentis-Genistetum).

Uwaga: płaty z wrzosem w Karpatach (region alpejski) to raczej psiary z wrzosem (6230), nie wrzosowiska. Z wrzoścem bagiennym – 4010.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Geneza (poligon, pożar, wypas, pas przeciwpożarowy), zarastanie, zalesienia, struktura warstw, mozaika z innymi zbiorowiskami.',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• „czynnik sprawczy” – czynny albo dawny poligon, pożarzysko, wypas, linia energetyczna, pas przeciwpożarowy, zręby;
• rzeźba (równina, wydmy, stoki), wilgotność podłoża;
• struktura: warstwa krzewinek z wrzosem (i mącznicą, janowcem), niższa warstwa roślin zielnych, mchy i porosty;
• zarastanie drzewami, zalesienia, agregacje trzcinnika;
• mozaika z murawami napiaskowymi, traworoślami, borami.

Za stanowisko przyjmuje się płat (lub kompleks płatów) wrzosowiska z transektem monitoringowym.`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Łączna powierzchnia płatów wrzosowiska na stanowisku, w hektarach (0,8 ha w karcie z przewodnika, Duchny Młode I). Oszacuj w terenie albo z ortofotomapy – na zdjęciach kolorowych wrzosowisko dobrze odróżnia się od zbiorowisk trawiastych, na czarno-białych słabo.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „PLH200018 Czerwony Bór”. Brak – „brak”.',
  }),
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', required: true, help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', required: true, help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    defaultValue: '200x10 m',
    required: true,
    hint: 'Prostokąt 200×10 m; inny kształt dopuszczalny, byle 2000 m².',
    help: `Na wielkopowierzchniowym wrzosowisku powierzchnią monitoringową jest transekt 200×10 m. Jeśli nie mieści się w płacie, zmień wymiary przy zachowaniu powierzchni (2000 m²). W płacie powyżej 10 ha można założyć więcej niż jeden transekt.

Wrzosowiska małopowierzchniowe (drobne płaty w krajobrazie borowym): monitoring obejmuje mapę rozmieszczenia płatów na powierzchni próbnej ok. 100 ha oraz pojedyncze zdjęcie fitosocjologiczne z opisem wskaźników w wybranych płatach – wtedy wpisz rzeczywiste wymiary i opisz to w uwagach.`,
    warn: (v) => {
      const m = String(v ?? '').replace(',', '.').match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/)
      if (!m) return null
      const a = Number(m[1]) * Number(m[2])
      return Math.abs(a - 2000) < 1 ? null : `${plNum(a)} m² – metodyka wymaga 2000 m² (200×10 m). Opisz odstępstwo w uwagach.`
    },
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    help: 'Wysokość nad poziomem morza transektu, z GPS albo mapy. Można wpisać zakres („138–141”, jak minimalna i maksymalna w karcie). Siedlisko występuje na całym niżu, tylko w regionie kontynentalnym.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 26.08.2011',
    required: true,
    hint: 'Optymalnie od lipca do września.',
    help: `Dzień badań terenowych. Optymalny termin: lipiec–wrzesień (wrzos kwitnie); wystarczy jedna obserwacja w roku. W innych porach ocena stanu jest zwykle możliwa, ale zdjęcia fitosocjologiczne mogą mieć błędne pokrycia i nierozpoznane gatunki. W praktyce (2016, 2021) badano od drugiej połowy sierpnia do końca września.

Powtarzanie: co najmniej raz na 5–6 lat, optymalnie co 3 lata.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 7 && m <= 9 ? null : 'Termin poza optymalnym oknem (lipiec–wrzesień). Pokrycia w zdjęciach mogą być niedoszacowane, a część gatunków nierozpoznawalna.'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcia fitosocjologiczne: 3 × 100 m² ----------

const r7120 = methodology7120.releves.fields
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia. Trzy zdjęcia rozkłada się w obrębie transektu.' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach.' }),
  pickField(r7120, 'area', {
    defaultValue: 100,
    help: 'Powierzchnia zdjęcia w m². Metodyka: 100 m² (np. 10×10 m). Karta z przewodnika ma zdjęcia po 25 m² – jeśli robisz mniejsze, wpisz rzeczywistą powierzchnię.',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Na równinie 0°, na stoku wydmy kilka–kilkanaście stopni.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, SW). Dla powierzchni płaskiej zostaw puste albo wpisz „brak”.' }),
  layerField('coverB', 'Warstwa B – krzewy i podrost drzew: procent powierzchni zdjęcia (nalot sosny i brzozy, żarnowiec, jałowiec wyższe niż krzewinki). Brak = 0.\n\nDlaczego: warstwa B to zarastanie – główne zagrożenie wrzosowiska.', { groupCols: 3 }),
  layerField('coverC', 'Warstwa C – krzewinki i zielna: procent powierzchni zdjęcia pod wrzosem, mącznicą, janowcami i roślinami zielnymi. Na dobrze zachowanym wrzosowisku zwykle 70–90%.\n\nDlaczego: zwarcie C to w dużej mierze zwarcie wrzosu – fizjonomia siedliska.'),
  layerField('coverD', 'Warstwa D – mszysta: knotnik zwisły, rokietnik, płonniki, chrobotki i inne mszaki i porosty naziemne. Brak = 0.\n\nDlaczego: w wrzosowisku knotnikowym mszysta warstwa z knotnikiem to cecha diagnostyczna.'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów i podrostu, w metrach. Brak warstwy = 0.'),
  layerField('heightC', 'Warstwa C – typowa wysokość krzewinek i roślin zielnych, w centymetrach (wrzos zwykle 10–50 cm).'),
  layerField('heightD', 'Warstwa D – typowa wysokość warstwy mszystej, w centymetrach (zwykle 1–3 cm).'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Calluno-Genistetum',
    help: 'Jednostka fitosocjologiczna zdjęcia, np. Pohlio-Callunetum, Calluno-Genistetum, Arctostaphylo-Callunetum.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w poletku z ilościowością w skali Braun-Blanqueta (r, +, 1–5): warstwa B – krzewy i podrost drzew, C – krzewinki i zielna, D – mszaki i porosty. Warstwa podpowiada się sama po wyborze gatunku.',
  }),
]

export const methodology4030: Methodology = {
  code: '4030',
  name: 'Suche wrzosowiska (Calluno-Genistion, Pohlio-Callunion, Calluno-Arctostaphylion)',
  source:
    'Pawlaczyk P. 2012, 4030 Suche wrzosowiska (Calluno-Genistion, Pohlio-Callunion, Calluno-Arctostaphylion), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 230–246 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2009–2011, 2016–2018 i 2020–2021',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj 3 zdjęcia fitosocjologiczne po 100 m² w obrębie transektu. Ilościowość w skali Braun-Blanqueta; warstwy B (krzewy i podrost drzew), C (krzewinki i zielna), D (mszaki i porosty). Na wrzosowisku małopowierzchniowym – jedno zdjęcie w badanym płacie.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Czy siedlisko utrzyma się w stanie niepogorszonym w perspektywie 10–20 lat. Kluczowe jest ciągłe istnienie czynnika utrzymującego wrzosowisko albo determinującego jego dynamiczne powstawanie.',
    help: `Zwróć uwagę na:
• ciągłe istnienie czynnika utrzymującego wrzosowisko (czynny poligon, wypas, powtarzające się okazjonalne pożary) albo determinującego jego powstawanie (pożary, gospodarka zrębowa);
• prowadzenie zabiegów ochrony czynnej (usuwanie nalotu, kwaterowe koszenie albo wypalanie, wypas);
• zalesienia, których wzrost nieuchronnie zniszczy zalesioną część wrzosowiska;
• sukcesję i zarastanie drzewami;
• strukturę populacji wrzosu i jego „odnawianie się”;
• zapisy planu urządzenia lasu i programu ochrony przyrody (czy nie zaplanowano zalesień, czy zaplanowano ochronę czynną);
• narażenie na neofityzację i inne przewidywane formy presji.

Dlaczego: wrzosowiska na czynnych poligonach utrzymują się same; na opuszczonych zarastają i bez ochrony czynnej znikają.`,
    thresholds: {
      FV: 'Brak zagrożeń i negatywnych trendów. Zachowanie siedliska w stanie niepogorszonym w perspektywie 10–20 lat jest niemal pewne',
      U1: 'Zachowanie siedliska w stanie niepogorszonym w perspektywie 10–20 lat nie jest pewne, ale jest prawdopodobne, o ile uda się zapobiec istniejącym zagrożeniom',
      U2: 'Zachowanie siedliska w stanie niepogorszonym w perspektywie 10–20 lat będzie bardzo trudne: zaawansowane procesy recesji, silne negatywne trendy lub znaczne zagrożenia',
    },
  },

  impactCodes: [
    { code: 'A01', name: 'Uprawa' },
    { code: 'A04', name: 'Wypas' },
    { code: 'A04.03', name: 'Zarzucenie pasterstwa, brak wypasu' },
    { code: 'A03.03', name: 'Zaniechanie / brak koszenia' },
    { code: 'B01', name: 'Zalesianie terenów otwartych' },
    { code: 'B01.01', name: 'Zalesianie terenów otwartych (drzewa rodzime)' },
    { code: 'B01.02', name: 'Sztuczne nasadzenia na terenach otwartych (drzewa nierodzime)' },
    { code: 'B02', name: 'Gospodarka leśna – ogólnie' },
    { code: 'B02.02', name: 'Wycinka lasu' },
    { code: 'B07', name: 'Inne rodzaje praktyk leśnych, nie wymienione powyżej' },
    { code: 'C01.01', name: 'Wydobywanie piasku i żwiru' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D01.02', name: 'Drogi, autostrady' },
    { code: 'D02.01.01', name: 'Napowietrzne linie elektryczne i telefoniczne' },
    { code: 'E03.01', name: 'Pozbywanie się odpadów z gospodarstw domowych / obiektów rekreacyjnych' },
    { code: 'E03.04', name: 'Inne odpady' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
    { code: 'G04.01', name: 'Poligony' },
    { code: 'G04.02', name: 'Zaniechanie użytkowania dla celów wojskowych' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'H04', name: 'Zanieczyszczenie powietrza, zanieczyszczenia transportowane drogą powietrzną' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J01.01', name: 'Wypalanie' },
    { code: 'J01.02', name: 'Zwalczanie pożarów' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: [
    ...methodology7120.otherFields.flatMap((f): FieldDef[] => {
      if (f.name === 'otherValues')
        return [
          {
            ...f,
            hint: 'Np. lerka, świergotek polny, cietrzew, widłak goździsty, modliszka, poskocz krasny.',
            help: 'Wartości przyrodnicze stanowiska poza samym wrzosowiskiem: ptaki (lerka, świergotek polny, cietrzew), płazy i gady (ropucha paskówka, żmija), bezkręgowce (modliszka, poskocz krasny), widłaki, sąsiednie siedliska (murawy napiaskowe 2330, 6120, bory 91T0). Brak informacji – „Nie zaobserwowano” albo „Nie pozyskano danych”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            help: 'Jakie działania ochronne wykonano i z jakim skutkiem, oraz co proponujesz. Typowe dla 4030: usuwanie nalotu drzew i krzewów (okresowo powtarzane), kwaterowe koszenie wrzosu (co ok. 7–10 lat), kontrolowane, małopowierzchniowe wypalanie, ekstensywny wypas owiec lub bydła, zaniechanie zalesień, częste wykaszanie trzcinnika, usuwanie czeremchy amerykańskiej, ochrona przed wydobyciem piasku i śmieciami. Brak działań – „Nie prowadzono”.',
          },
        ]
      if (f.name === 'notes')
        return [
          {
            kind: 'number',
            name: 'shareFV',
            group: 'Udział powierzchni siedliska w stanie FV / U1 / U2 (stanowisko)',
            label: 'Udział powierzchni siedliska w stanie FV',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Metodyka: przy ocenie ogólnej podaje się udział procentowy powierzchni siedliska o różnym stanie zachowania na całym stanowisku (w stosunku do całkowitej powierzchni siedliska na stanowisku). W karcie z przewodnika: FV –, U1 100%, U2 –. Trzy liczby powinny dać razem 100%.',
          },
          {
            kind: 'number',
            name: 'shareU1',
            group: 'Udział powierzchni siedliska w stanie FV / U1 / U2 (stanowisko)',
            label: 'Udział powierzchni siedliska w stanie U1',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Procent powierzchni siedliska na stanowisku w stanie niezadowalającym (U1).',
          },
          {
            kind: 'number',
            name: 'shareU2',
            group: 'Udział powierzchni siedliska w stanie FV / U1 / U2 (stanowisko)',
            label: 'Udział powierzchni siedliska w stanie U2',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Procent powierzchni siedliska na stanowisku w stanie złym (U2).',
          },
          f,
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_4030.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer4030(s) })),
  speciesInfo: (name) => {
    const e = findSpecies4030(name)
    if (!e) return undefined
    const label = GROUP_LABELS_4030[e.group]
    return e.grass && e.group !== 'companion' ? `${label}; trawa` : e.grass ? 'trawa' : label
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator4030 = (id: string): IndicatorDef => {
  const i = methodology4030.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 4030`)
  return i
}
