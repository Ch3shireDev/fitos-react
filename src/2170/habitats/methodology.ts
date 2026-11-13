// Metodyka 2170 (nadmorskie wydmy z zaroślami wierzby piaskowej) jako dane. Źródło: Lemke D. 2012, „Nadmorskie wydmy
// z zaroślami wierzby piaskowej (2170)” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny,
// cz. II, GIOŚ, s. 93–101 (tab. 1 i 2), z praktyką oceny ze sprawozdań z monitoringu 2009–2011, 2016 i 2021.
// Siedlisko nadmorskie, nieleśne, bardzo rzadkie: pojedyncze kępy wierzby piaskowej (zwykle < 50 m²), badane jako
// stanowisko punktowe – jeden płat, jedno zdjęcie fitosocjologiczne 5×5 m. Z modułu leśnego brane są tylko klocki
// generyczne (select, lista gatunków, pola zdjęcia) – nic leśnego.
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import {
  byOption,
  forestReleveFields,
  gradeMap,
  labelOf,
  normalizeName,
  pickField,
  plNum,
  selectInput,
  speciesInput,
  type GradedOption,
} from '../../forest'
import {
  GROUP_LABELS_2170,
  SPECIES_2170,
  defaultLayer2170,
  findSpecies2170,
  isCharacteristic2170,
  isExpansive2170,
  isWillow2170,
} from './species'

// ---------- progi liczbowe (tab. 2) ----------

/** Średnia wysokość krzewów: powyżej 1 m FV, 0,2–1 m U1, poniżej 0,2 m U2 (granice 0,2 i 1 m – U1). */
export const gradeHeight2170 = (m: number): Grade => (m > 1 ? 'FV' : m >= 0.2 ? 'U1' : 'U2')

/** Powierzchnia kępy: powyżej 100 m² FV, 50–100 m² U1, poniżej 50 m² U2 (granice 50 i 100 m² – U1). */
export const gradeClump2170 = (m2: number): Grade => (m2 > 100 ? 'FV' : m2 >= 50 ? 'U1' : 'U2')

/** Uszkodzone pędy terminalne (% płatu): do 10% FV, do 50% U1, powyżej 50% U2. */
export const gradeDamage2170 = (p: number): Grade => (p <= 10 ? 'FV' : p <= 50 ? 'U1' : 'U2')

const WORSE: Record<Grade, number> = { FV: 0, XX: 1, U1: 2, U2: 3 }
const worse = (a: Grade, b: Grade): Grade => (WORSE[a] >= WORSE[b] ? a : b)

const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const m2 = (v: number) => `${plNum(v)} m²`
const metres = (v: number) => `${plNum(v)} m`

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Areał stabilny lub zwiększa się', grade: 'FV' },
  { value: 'smallDecrease', label: 'Niewielki spadek powierzchni (np. ocienianie przez sosny, zasypywanie piaskiem)', grade: 'U1' },
  { value: 'clearDecrease', label: 'Wyraźny spadek powierzchni albo zanik siedliska na stanowisku', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const SPECIES: GradedOption[] = [
  { value: 'most', label: 'Występuje większość gatunków typowych dla zespołu lub zbiorowiska', grade: 'FV' },
  { value: 'impoverished', label: 'Relatywnie niewielkie zubożenie florystyczne', grade: 'U1' },
  { value: 'none', label: 'Brak gatunków typowych lub wyraźne zubożenie florystyczne', grade: 'U2' },
]
const EXPANSIVE: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'single', label: 'Pojedyncze egzemplarze', grade: 'U1' },
  { value: 'clumps', label: 'Kępy zagrażające trwałości zarośli wierzby piaskowej', grade: 'U2' },
]
const HEIGHT: GradedOption[] = [
  { value: 'high', label: 'Powyżej 1 m', grade: 'FV' },
  { value: 'medium', label: '0,2–1 m', grade: 'U1' },
  { value: 'low', label: 'Poniżej 0,2 m', grade: 'U2' },
]
const REGENERATION: GradedOption[] = [
  { value: 'many', label: 'Obecne liczne młode pędy wegetatywne, szczególnie na zewnątrz kępy', grade: 'FV' },
  { value: 'few', label: 'Obecne, ale nieliczne', grade: 'U1' },
  { value: 'none', label: 'Brak', grade: 'U2' },
]
const CLUMP: GradedOption[] = [
  { value: 'large', label: 'Powyżej 100 m²', grade: 'FV' },
  { value: 'medium', label: '50–100 m²', grade: 'U1' },
  { value: 'small', label: 'Poniżej 50 m²', grade: 'U2' },
]
const HEALTH: GradedOption[] = [
  { value: 'good', label: 'Uszkodzenia pędów terminalnych do 10%', grade: 'FV' },
  { value: 'damaged', label: 'Uszkodzenia pędów terminalnych do 50%, pędy się regenerują', grade: 'U1' },
  { value: 'bad', label: 'Uszkodzenia pędów terminalnych powyżej 50%', grade: 'U2' },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

/** Select niewymagany – gdy wpiszesz liczbę, wystarczy liczba. */
const optionalSelect = (label: string, options: GradedOption[], help?: string): FieldDef => ({ ...selectInput(label, options, help), required: false })

const noteInput = (label: string, placeholder: string, help: string): FieldDef => ({ kind: 'textarea', name: 'note', label, rows: 2, placeholder, help })

/** „Wartość” w karcie: notatka obserwatora, a bez niej etykieta wybranej klasy. */
const noteOr = (i: InputValues, options: GradedOption[]) => String(i.note ?? '').trim() || labelOf(options, i.choice)
const note = (i: InputValues) => String(i.note ?? '').trim()

/** Podpowiedź z liczby (ma pierwszeństwo), a bez niej z selecta. */
const numberOrChoice = (field: string, grade: (v: number) => Grade, options: GradedOption[]) => (i: InputValues) => {
  const v = num(i[field])
  return v !== undefined ? grade(v) : byOption(gradeMap(options))(i)
}
/** Ostrzeżenie, gdy liczba i wybrana klasa się rozjeżdżają. */
const numberVsChoice = (field: string, grade: (v: number) => Grade, options: GradedOption[], what: (v: number) => string) => (i: InputValues) => {
  const v = num(i[field])
  if (v === undefined || !i.choice) return null
  return gradeMap(options)[String(i.choice)] === grade(v) ? null : `${what(v)} nie pasuje do wybranej klasy.`
}

// ---------- powierzchnia siedliska: wielkość płatu i trend ----------

/** Wielkość płatu (praktyka 2016/2021: progi jak dla kępy) i trend; gorsza z dwóch. Trend „brak danych” nie obniża. */
export function gradeArea2170(i: InputValues): Grade | null {
  const area = num(i.areaM2)
  const trend = gradeMap(AREA)[String(i.choice)] as Grade | undefined
  const fromSize = area !== undefined ? (area <= 0 ? 'U2' : gradeClump2170(area)) : undefined
  if (fromSize && trend && trend !== 'XX') return worse(fromSize, trend)
  return fromSize ?? trend ?? null
}

// ---------- wskaźniki ----------

const SI_MGSP = (name: string) => `W SI MGSP i w sprawozdaniach z monitoringu wskaźnik nazywa się „${name}”.`

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description:
      'Powierzchnia płatów zarośli wierzby piaskowej na stanowisku i jej zmiana w porównaniu z wcześniejszymi badaniami. Przewodnik nie podaje progów dla tego parametru – ocena wg praktyki monitoringu 2016 i 2021.',
    help: `Co wpisać: łączną powierzchnię płatów zarośli wierzby piaskowej na stanowisku w m² i – jeśli masz z czym porównać – jak się zmieniła od poprzedniego badania. Formularz bierze gorszą z dwóch ocen.

Wielkość płatu (praktyka 2016 i 2021, te same progi co „Powierzchnia kępy”): powyżej 100 m² – FV; 50–100 m² – U1 („kępy mniejsze niż 100 m², w miarę stabilne”); poniżej 50 m² – U2 („bardzo małe kępy, których egzystencja jest zagrożona”); siedlisko zanikło (0 m²) – U2.

Trend: areał stabilny – FV; niewielki spadek (ocienianie przez sosny, zasypywanie piaskiem) – U1; wyraźny spadek albo zanik – U2. Przy pierwszym badaniu wybierz „Brak danych do porównania” – wtedy liczy się sama wielkość.

Dlaczego: w Polsce znane zasoby siedliska to łącznie mniej niż 1 ha, a typowa kępa ma kilka–kilkadziesiąt m². Karta z przewodnika (Helskie Wydmy 1): 50 m², areał stabilny – U1.`,
    thresholds: {
      FV: 'Płaty powyżej 100 m², areał stabilny lub zwiększa się',
      U1: 'Płaty 50–100 m² albo niewielki spadek powierzchni',
      U2: 'Płaty poniżej 50 m², wyraźny spadek powierzchni albo zanik siedliska',
    },
    inputs: [
      { kind: 'number', name: 'areaM2', label: 'Powierzchnia płatów', unit: 'm²', min: 0, help: 'Łączna powierzchnia płatów zarośli wierzby piaskowej na stanowisku, w m². 0 = siedlisko zanikło. Ma pierwszeństwo przed samym trendem – formularz bierze gorszą z dwóch ocen.' },
      optionalSelect('Zmiana powierzchni', AREA, 'Trend od poprzedniego badania. „Brak danych do porównania” nie obniża oceny z wielkości płatu.'),
      noteInput('Opis (opcjonalnie)', 'np. areał stabilny', 'Krótki opis zmian, który trafi do „wartości” w karcie razem z powierzchnią.'),
    ],
    suggest: (i) => gradeArea2170(i),
    explain: (i) => {
      const area = num(i.areaM2)
      if (area === undefined) return null
      const size = area <= 0 ? 'U2' : gradeClump2170(area)
      return `Wielkość płatu ${m2(area)} → ${size}${i.choice && i.choice !== 'unknown' ? `, trend → ${gradeMap(AREA)[String(i.choice)]}; liczy się gorsza` : ''}.`
    },
    describe: (i) => {
      const area = num(i.areaM2)
      return [area !== undefined ? m2(area) : '', note(i) || (i.choice ? labelOf(AREA, i.choice).toLowerCase() : '')].filter(Boolean).join('; ')
    },
  },
  {
    id: 'species',
    label: 'Charakterystyczna kombinacja gatunków',
    parameter: 'structure',
    description: `Wskaźnik służy ocenie typowości składu gatunkowego fitocenoz reprezentujących siedlisko na stanowisku. Uwzględnia przede wszystkim liczbę gatunków diagnostycznych dla wydm nadmorskich szarych i białych: Salix arenaria, Ammophila arenaria, Carex arenaria, Festuca rubra; w miejscach osłoniętych gatunki wydmy szarej: Jasione montana, Lathyrus japonicus var. maritimus, Hieracium umbellatum var. linariifolium, Artemisia campestris var. sericea. ${SI_MGSP('Charakterystyczna kombinacja florystyczna')} (w 2010 r. „Gatunki charakterystyczne”).`,
    help: `Co wpisać: gatunki typowe stwierdzone w płacie (z przybliżonym pokryciem płatu w %), a potem wybrać, czy występuje ich większość, czy skład jest zubożony.

Gatunki typowe wg przewodnika (tab. 1): wierzba piaskowa Salix arenaria (= S. repens subsp. arenaria), piaskownica zwyczajna Ammophila arenaria, turzyca piaskowa Carex arenaria, kostrzewa czerwona Festuca rubra; w miejscach osłoniętych i w zwartych płatach – jasieniec piaskowy Jasione montana, groszek nadmorski Lathyrus japonicus, jastrzębiec baldaszkowaty Hieracium umbellatum, bylica polna Artemisia campestris. W miejscach odkrytych gatunków jest niewiele – to naturalne.

Progi (tab. 2, opisowe): większość gatunków typowych dla zespołu lub zbiorowiska – FV; relatywnie niewielkie zubożenie florystyczne – U1; brak gatunków typowych lub wyraźne zubożenie – U2.

Praktyka 2021: U1 przy sukcesji w stronę boru bażynowego (udział gatunków innych niż oczekiwane); U2 tam, gdzie wierzby piaskowej już nie ma.`,
    thresholds: thresholdsOf(SPECIES),
    inputs: [
      speciesInput(
        'Gatunki typowe w płacie',
        'Gatunki typowe stwierdzone w płacie z przybliżonym pokryciem płatu w %, np. Salix arenaria 60, Ammophila arenaria 5. Lista trafia do karty jako „wartość”, jeśli nie wpiszesz opisu.',
      ),
      selectInput('Skład gatunkowy', SPECIES),
      noteInput('Opis (opcjonalnie)', 'np. występują gatunki charakterystyczne dla zespołu', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków (jak w karcie z przewodnika).'),
    ],
    suggest: byOption(gradeMap(SPECIES)),
    explain: (i) => {
      const names = rowNames(i.species)
      if (!names.length) return null
      const typical = new Set(names.filter(isCharacteristic2170).map((n) => findSpecies2170(n)!.polish))
      return `Gatunków typowych z tab. 1 na liście: ${typical.size} z 8.`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (!names.length) return null
      if (!names.some(isWillow2170)) return 'Na liście nie ma wierzby piaskowej – bez niej to nie jest siedlisko 2170.'
      const exp = names.filter(isExpansive2170)
      if (exp.length) return `Na liście są gatunki ekspansywne: ${exp.join(', ')} – wpisz je we wskaźniku „Gatunki ekspansywne drzew i krzewów”.`
      if (i.choice === 'none' && names.filter(isCharacteristic2170).length > 1) return 'Wybrano „Brak gatunków typowych”, a na liście są gatunki typowe.'
      return null
    },
    describe: (i) => note(i) || describeSpecies(speciesRows(i.species)) || labelOf(SPECIES, i.choice),
  },
  {
    id: 'expansive',
    label: 'Gatunki ekspansywne drzew i krzewów',
    parameter: 'structure',
    cardinal: true,
    description: `Odnotowanie obecności ekspansywnych gatunków roślin drzewiastych w granicach płatu i w jego bezpośredniej bliskości wraz z pokryciem. Lista obejmuje w zasadzie pięć gatunków: Rosa rugosa, Pinus sylvestris, Salix daphnoides, Salix acutifolia i Populus tremula. ${SI_MGSP('Gatunki ekspansywne')} (w 2010 r. i w liście kardynalnych przewodnika – „Gatunki ekspansywne roślin drzewiastych”).`,
    help: `Co wpisać: gatunki ekspansywne drzew i krzewów w płacie i tuż przy nim, z pokryciem (%), a potem wybrać klasę.

Gatunki (tab. 1): sosna zwyczajna Pinus sylvestris i topola osika Populus tremula – sygnał stabilizacji wydmy i sukcesji w stronę lasu; wierzba wawrzynkowa Salix daphnoides, wierzba ostrolistna Salix acutifolia i przede wszystkim róża pomarszczona Rosa rugosa – zwykle dawne nasadzenia stabilizujące wydmy. Róża jest szczególnie ekspansywna.

Progi (tab. 2): brak – FV; pojedyncze egzemplarze – U1; kępy zagrażające trwałości zarośli wierzby piaskowej – U2.

Praktyka: karta z przewodnika i sprawozdania 2010 i 2021 dają FV przy pojedynczych starych sosnach w sąsiedztwie kępy, które jej nie ocieniają („brak lub sporadyczne występowanie”). Sosna ocieniająca kępę – U1; zwarcie sosny i osiki ok. 20% albo róża 10–15% (Piaski 2021) – U2.

Wskaźnik kardynalny. Dlaczego: sprawozdanie 2016 – sukcesja sosny to największe zagrożenie dla siedliska; jej przygłuszanie najczęściej obniżało ocenę struktury.`,
    thresholds: thresholdsOf(EXPANSIVE),
    inputs: [
      speciesInput('Gatunki ekspansywne w płacie i przy nim', 'Gatunki ekspansywne drzew i krzewów z pokryciem płatu w %. Brak – zostaw pustą listę i wybierz „Brak”.'),
      selectInput('Występowanie', EXPANSIVE),
      noteInput('Opis (opcjonalnie)', 'np. w bezpośredniej bliskości kępy pojedyncze stare sosny', 'Krótki opis: gdzie rosną, czy ocieniają kępę. Gdy jest, trafia do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: byOption(gradeMap(EXPANSIVE)),
    explain: (i) => {
      const names = rowNames(i.species)
      return names.some((n) => normalizeName(findSpecies2170(n)?.latin ?? '') === normalizeName('Rosa rugosa'))
        ? 'Róża pomarszczona – najbardziej ekspansywna z listy; nawet niewielkie pokrycie szybko rośnie.'
        : null
    },
    warn: (i) => {
      const names = rowNames(i.species)
      const other = names.filter((n) => findSpecies2170(n) && !isExpansive2170(n))
      if (other.length) return `Na liście są gatunki spoza listy ekspansywnych: ${other.join(', ')}.`
      if (i.choice === 'none' && names.length && !note(i))
        return 'Wybrano „Brak”, a lista nie jest pusta – dopisz w opisie, dlaczego (np. pojedyncze stare sosny, które nie ocieniają kępy).'
      return null
    },
    describe: (i) => note(i) || describeSpecies(speciesRows(i.species)) || labelOf(EXPANSIVE, i.choice),
  },
  {
    id: 'height',
    label: 'Wysokość krzewów (średnia)',
    parameter: 'structure',
    description: 'Ocena wysokości wyrażona w metrach (średnia), jak również rozpiętość wysokości krzewów w płacie. Wskaźnik pokazuje pośrednio wiek krzewów i strukturę zarośli.',
    help: `Co wpisać: średnią wysokość krzewów wierzby piaskowej w płacie (m) i – jak w karcie – rozpiętość od–do. Bez średniej formularz liczy ze środka rozpiętości.

Progi (tab. 2): powyżej 1 m – FV; 0,2–1 m – U1; poniżej 0,2 m – U2.

Praktyka: krzewy mają zwykle 0,5–2 m; na wydmie białej są naturalnie niższe niż na szarej. Spadek do ok. 0,5 m bywa skutkiem zasypania przez piasek (Helskie Wydmy 2, 2021) – opisz to.`,
    thresholds: thresholdsOf(HEIGHT),
    inputs: [
      { kind: 'number', name: 'mean', label: 'Średnia wysokość', unit: 'm', min: 0, help: 'Średnia wysokość krzewów wierzby piaskowej w płacie, w metrach. Ma pierwszeństwo przed rozpiętością i klasą.' },
      { kind: 'number', name: 'min', label: 'Rozpiętość: od', unit: 'm', min: 0, help: 'Wysokość najniższych krzewów w płacie, w metrach (np. 1 dla „1–1,5 m”).' },
      { kind: 'number', name: 'max', label: 'Rozpiętość: do', unit: 'm', min: 0, help: 'Wysokość najwyższych krzewów w płacie, w metrach (np. 1,5 dla „1–1,5 m”).' },
      optionalSelect('Klasa (gdy bez pomiaru)', HEIGHT, 'Wybierz, gdy nie mierzysz wysokości.'),
    ],
    suggest: (i) => {
      const v = heightOf(i)
      return v !== undefined ? gradeHeight2170(v) : byOption(gradeMap(HEIGHT))(i)
    },
    explain: (i) => (num(i.mean) === undefined && heightOf(i) !== undefined ? `Bez średniej – liczona ze środka rozpiętości: ${metres(heightOf(i)!)}.` : null),
    warn: (i) => {
      const lo = num(i.min)
      const hi = num(i.max)
      if (lo !== undefined && hi !== undefined && lo > hi) return 'Rozpiętość „od” jest większa niż „do”.'
      const v = heightOf(i)
      if (v === undefined || !i.choice) return null
      return gradeMap(HEIGHT)[String(i.choice)] === gradeHeight2170(v) ? null : `${metres(v)} nie pasuje do wybranej klasy.`
    },
    describe: (i) => {
      const mean = num(i.mean)
      const lo = num(i.min)
      const hi = num(i.max)
      const range = lo !== undefined && hi !== undefined ? `${plNum(lo)}–${plNum(hi)} m` : ''
      if (mean !== undefined) return [`średnio ${metres(mean)}`, range ? `rozpiętość ${range}` : ''].filter(Boolean).join(', ')
      return range || labelOf(HEIGHT, i.choice)
    },
  },
  {
    id: 'regeneration',
    label: 'Odnowienie naturalne wierzby piaskowej',
    parameter: 'structure',
    description:
      'Odnotowanie obecności młodych wegetatywnych pędów wierzby piaskowej. Wskaźnik charakteryzuje dynamikę zarośli oraz możliwości ich ekspansji, co wydaje się niezwykle istotne z uwagi na rzadkość siedliska.',
    help: `Co ocenić: czy wokół kępy i w niej są młode pędy wegetatywne (odrosty z rozłogów) wierzby piaskowej – szczególnie na zewnątrz kępy, gdzie płat może się poszerzać.

Progi (tab. 2): obecne liczne młode pędy wegetatywne, szczególnie na zewnątrz kępy – FV; obecne, ale nieliczne – U1; brak – U2.

Praktyka: najlepsze odnowienie jest tam, gdzie przemieszcza się piasek (wydmy białe w rezerwacie Helskie Wydmy). Na stokach wydm odnowienie utrudnia osuwający się piasek. W 2021 r. liczne młode pędy tylko na 3 z 14 stanowisk.`,
    thresholds: thresholdsOf(REGENERATION),
    inputs: [
      selectInput('Młode pędy wegetatywne', REGENERATION),
      noteInput('Opis (opcjonalnie)', 'np. nie stwierdzono', 'Krótki opis odnowienia. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(REGENERATION)),
    describe: (i) => noteOr(i, REGENERATION),
  },
  {
    id: 'clump',
    label: 'Powierzchnia kępy',
    parameter: 'structure',
    cardinal: true,
    description: 'Odnotowanie powierzchni monitorowanego płatu zarośli wyrażonej w m². Wskaźnik ma znaczenie dla monitorowania zmian w czasie.',
    help: `Co wpisać: powierzchnię monitorowanej kępy (płatu zarośli) wierzby piaskowej w m² – zmierz albo oszacuj (np. długość × szerokość). Albo tylko wybierz klasę.

Progi (tab. 2): powyżej 100 m² – FV; 50–100 m² – U1; poniżej 50 m² – U2. Równo 50 i równo 100 m² – U1.

Wskaźnik kardynalny. Praktyka: kępy mają zwykle od kilku do ok. 20 m², największe – ok. 100–200 m² (Łeba 1 i 2, Helskie Wydmy 4). Sprawozdanie 2021: ocena wg progów metodyki, nawet gdy kępa ~20 m² się nie zmieniła (Helskie Wydmy 3: z FV na U2 – „zmiana pozorna”). Najczęściej to ten wskaźnik obniża ocenę struktury.`,
    thresholds: thresholdsOf(CLUMP),
    inputs: [
      { kind: 'number', name: 'value', label: 'Powierzchnia kępy', unit: 'm²', min: 0, help: 'Powierzchnia monitorowanej kępy wierzby piaskowej w m². Ma pierwszeństwo przed wyborem klasy.' },
      optionalSelect('Klasa (gdy bez pomiaru)', CLUMP, 'Wybierz, gdy nie mierzysz kępy.'),
      noteInput('Opis (opcjonalnie)', 'np. ok. 50 m²', 'Krótki opis (np. „ok. 50 m²”, „kępa zasypywana przez stok wydmy”). Gdy jest, trafia do „wartości” w karcie.'),
    ],
    suggest: numberOrChoice('value', gradeClump2170, CLUMP),
    warn: numberVsChoice('value', gradeClump2170, CLUMP, m2),
    describe: (i) => {
      const v = num(i.value)
      return note(i) || (v !== undefined ? m2(v) : labelOf(CLUMP, i.choice))
    },
  },
  {
    id: 'health',
    label: 'Stan zdrowotny krzewów wierzby piaskowej',
    parameter: 'structure',
    cardinal: true,
    description: 'Odnotowanie procentowej ilości uszkodzonych pędów wierzby w płacie w relacji do całego płatu.',
    help: `Co ocenić: jaka część pędów terminalnych (wierzchołkowych) wierzby w płacie jest uszkodzona – zamierająca, uschnięta, złamana – i czy uszkodzone pędy się regenerują. Wpisz procent – ma pierwszeństwo – albo tylko wybierz klasę.

Progi (tab. 2): uszkodzenia pędów terminalnych do 10% – FV; do 50%, pędy się regenerują – U1; powyżej 50% – U2.

Wskaźnik kardynalny. Praktyka: uszkodzenia dotyczą zwykle górnych fragmentów pędów (wahania wód gruntowych, nagrzewanie piasku, silne wiatry, susza) i wierzba silnie się regeneruje. Gorszy stan – w kępach przygłuszonych przez sosnę i zasypywanych przez osuwający się piasek. 10–50% bez regeneracji pędów opisz w notatce i rozważ U2.`,
    thresholds: thresholdsOf(HEALTH),
    inputs: [
      { kind: 'number', name: 'value', label: 'Uszkodzone pędy terminalne', unit: '%', min: 0, max: 100, help: 'Procent uszkodzonych pędów terminalnych w płacie. 0 = uszkodzeń nie stwierdzono. Ma pierwszeństwo przed wyborem klasy.' },
      optionalSelect('Klasa (gdy bez szacowania)', HEALTH, 'Wybierz, gdy nie szacujesz procentu.'),
      noteInput('Opis (opcjonalnie)', 'np. krzewy w dobrej kondycji, uszkodzeń pędów nie stwierdzono', 'Krótki opis kondycji krzewów. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: numberOrChoice('value', gradeDamage2170, HEALTH),
    warn: numberVsChoice('value', gradeDamage2170, HEALTH, (v) => `${plNum(v)}% uszkodzonych pędów`),
    describe: (i) => {
      const v = num(i.value)
      return note(i) || (v !== undefined ? `uszkodzone pędy terminalne: ${plNum(v)}%` : labelOf(HEALTH, i.choice))
    },
  },
]

/** Średnia wysokość: wpisana, a bez niej środek rozpiętości (gdy podane oba końce). */
function heightOf(i: InputValues): number | undefined {
  const mean = num(i.mean)
  if (mean !== undefined) return mean
  const lo = num(i.min)
  const hi = num(i.max)
  return lo !== undefined && hi !== undefined ? (lo + hi) / 2 : undefined
}

// ---------- pola stanowiska ----------

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. „Helskie Wydmy” 1',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – zwykle miejscowość albo rezerwat z numerem kępy, np. „Helskie Wydmy 1”, „Łeba 2”, „Stilo”.

Dlaczego: stanowisk jest kilkanaście w całym kraju i monitoruje się wszystkie – stabilna nazwa (razem z GUID) pozwala porównać tę samą kępę w kolejnych cyklach.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'natura2000',
    label: 'Nazwa obszaru',
    placeholder: 'np. Zatoka Pucka i Półwysep Helski',
    help: 'Nazwa obszaru Natura 2000, w którym leży stanowisko (np. Zatoka Pucka i Półwysep Helski, Ostoja Słowińska, Zalew Wiślany i Mierzeja Wiślana). Poza obszarem – „brak”.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „Rezerwat przyrody „Helskie Wydmy”, PLH220032 Zatoka Pucka i Półwysep Helski”. Brak – „brak”.',
  }),
  {
    kind: 'text',
    name: 'coordMiddle',
    group: 'Współrzędne geograficzne',
    wide: true,
    label: 'Środek płatu',
    required: true,
    help: `Współrzędne geograficzne środka płatu zarośli (stanowisko punktowe), z odbiornika GPS (WGS84).

Dlaczego: w 2016 r. stanowiska Łeba 2 nie odnaleziono, bo współrzędne z 2010 r. wskazywały linię brzegową – zapisz je dokładnie.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 10–20',
    help: 'Wysokość płatu nad poziomem morza – zbocza i wierzchołki wałów wydmowych, zwykle kilka–kilkanaście metrów. Można wpisać zakres („10–20”).',
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska przyrodniczego na stanowisku',
    rows: 6,
    required: true,
    hint: 'Gdzie leży kępa (wydma biała czy szara, zbocze, wierzchołek, obniżenie), jak wygląda, co jej grozi.',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• położenie kępy w kompleksie wydm: wydma biała czy szara, zbocze (jaka wystawa), wierzchołek wału, obniżenie międzywydmowe;
• wielkość i zwartość zarośli, czy kępa jest zasypywana piaskiem;
• sąsiedztwo: murawy wydmy szarej, bór bażynowy, sosny ocieniające kępę;
• antropopresja: ścieżki, zejścia na plażę, wydeptywanie.

Siedlisko identyfikuje się praktycznie wyłącznie po obecności zarośli Salix arenaria. Sztuczne nasadzenia wierzby (stabilizacja wydm) nie są siedliskiem 2170.`,
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Elymo-Ammophiletum',
    help: `Zbiorowiska roślinne, w kompleksie których rośnie kępa. 2170 nie ma jednoznacznych identyfikatorów fitosocjologicznych – zarośla wierzby piaskowej nawiązują do związków Empetrion nigri (klasa Nardo-Callunetea), Corynephorion canescentis (Koelerio glaucae-Corynephoretea canescentis) i Ammophilion borealis (Ammophiletea). Na wydmie białej zwykle Elymo-Ammophiletum, na szarej Helichryso-Jasionetum.`,
  },
  {
    kind: 'number',
    name: 'areaM2',
    label: 'Powierzchnia płatów siedliska',
    unit: 'm²',
    min: 0,
    required: true,
    help: 'Łączna powierzchnia płatów zarośli wierzby piaskowej na stanowisku, w m² – zwykle od kilku do ok. 200 m² (50 m² w karcie z przewodnika). Trend („areał stabilny”) wpisz w ocenie powierzchni siedliska.',
  },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    defaultValue: 'stanowisko punktowe (jeden płat zarośli)',
    required: true,
    hint: 'Zwykle stanowisko punktowe – kępy są za małe na transekt.',
    help: `Obserwacje prowadzi się w konkretnych płatach siedliska. Przy małej powierzchni kęp (zwykle < 50 m²) monitoring prowadzi się na stanowisku punktowym – jeden płat, jedno zdjęcie fitosocjologiczne 5×5 m. Jeśli mimo to wytyczasz transekt, wpisz jego wymiary.`,
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 15.09.2010',
    required: true,
    hint: 'Optymalnie od czerwca do sierpnia (najlepiej czerwiec i koniec sierpnia).',
    help: `Dzień badań terenowych. Optymalny termin: czerwiec–sierpień; ze względu na ruch turystyczny najlepiej czerwiec albo ostatnia dekada sierpnia. Skład gatunkowy nie zależy od fenologii, więc większość gatunków rozpoznasz w całym okresie. Monitoring co 3–6 lat.

Uwaga: w praktyce badania robiono też we wrześniu (2010, 2016) – ostrzeżenie nie blokuje zapisu.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const mo = Number(v.split('-')[1])
      return mo >= 6 && mo <= 8 ? null : 'Termin poza optymalnym oknem (czerwiec–sierpień).'
    },
  },
  {
    kind: 'date',
    name: 'fillDate',
    label: 'Data wypełnienia',
    placeholder: 'DD.MM.RRRR',
    help: 'Dzień wypełnienia karty – zwykle ten sam co obserwacji. Pole jak w karcie z przewodnika.',
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcie fitosocjologiczne: 1 × 5×5 m w płacie ----------

const releveFields: FieldDef[] = forestReleveFields({
  area: 25,
  helps: {
    coords: 'Współrzędne GPS środka zdjęcia. Zdjęcie robi się w obrębie płatu zarośli – zwykle w jego środku.',
    altitude: 'Wysokość nad poziomem morza środka zdjęcia, w metrach (zbocza wydm – kilka do kilkunastu metrów).',
    slope: 'Nachylenie powierzchni w stopniach. Kępy często porastają zbocza wałów wydmowych – 10° w karcie z przewodnika.',
    exposure: 'Kierunek, w którym opada powierzchnia (N, NE…, SW w karcie z przewodnika). Dla powierzchni płaskiej wpisz „brak”.',
    coverA: 'Warstwa A – drzewa. Na wydmie zwykle brak; zwarcie sosny nad kępą wpisz tutaj i we wskaźniku gatunków ekspansywnych.',
    coverB: 'Warstwa B – krzewy. Procent powierzchni zdjęcia przykryty przez wierzbę piaskową (i ewentualne krzewy ekspansywne). 50% w karcie z przewodnika.',
    coverD: 'Warstwa D – mszysta. Mszaki i porosty naziemne (wydma szara). Brak – 0.',
    heightA: 'Warstwa A – drzewa. Typowa wysokość w metrach. Brak – 0.',
    heightB: 'Warstwa B – krzewy wierzby piaskowej. Typowa wysokość w metrach (1 m w karcie z przewodnika).',
    heightC: 'Warstwa C – zielna. Typowa wysokość w centymetrach (0,2 m = 20 cm w karcie z przewodnika).',
    heightD: 'Warstwa D – mszysta. Typowa wysokość w centymetrach. Brak – 0.',
    unit: 'Jednostka fitosocjologiczna zdjęcia, np. „zespół wydmuchrzycy piaskowej i piaskownicy zwyczajnej Elymo-Ammophiletum” albo Helichryso-Jasionetum.',
    species:
      'Wszystkie gatunki naczyniowe w poletku 5×5 m z ilościowością w skali Braun-Blanqueta (r, +, 1–5). Wierzba piaskowa i krzewy – warstwa B, zielne – C.',
  },
  overrides: {
    coverC: {
      kind: 'text',
      unit: '%',
      placeholder: 'np. 20 albo <5',
      help: 'Warstwa C – zielna. Procent powierzchni zdjęcia przykryty przez rośliny zielne. Można wpisać „<5”, jak w karcie z przewodnika.',
    } as Partial<FieldDef>,
  },
})

export const methodology2170: Methodology = {
  code: '2170',
  name: 'Nadmorskie wydmy z zaroślami wierzby piaskowej',
  source:
    'Lemke D. 2012, Nadmorskie wydmy z zaroślami wierzby piaskowej (2170), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 93–101 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2009–2011, 2016 i 2021',

  siteFields,

  releves: {
    defaultCount: 1,
    intro:
      'Kompozycję gatunkową płatu ilustruje jedno zdjęcie fitosocjologiczne klasyczną metodą Braun-Blanqueta na poletku 5×5 m (25 m²) w obrębie płatu zarośli. Wierzba piaskowa w warstwie B, runo w C.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Ocena realnych możliwości utrzymania siedliska we właściwej kondycji, uwzględniająca jego obecny stan zachowania oraz czynniki mogące na nie oddziaływać w najbliższej przyszłości.',
    help: `Weź pod uwagę: sukcesję sosny i osiki (ocienianie, przygłuszanie kęp), ekspansję róży pomarszczonej, zasypywanie kęp przez czoło wydmy białej, abrazję brzegu i sztormy (Czołpino 1 zanikło w 2021 r.), presję turystów (ścieżki, zejścia na plażę, wydeptywanie) i status ochronny terenu.

Praktyka: FV, gdy brak istotnych zagrożeń, teren chroniony i stan stabilny (Łeba 1, Helskie Wydmy 4); U1, gdy jest szansa poprawy pod warunkiem działań – głównie ograniczenia drzew; U2 przy zaniku siedliska albo stanie pogarszającym się bez regeneracji. Karta z przewodnika: „ze względu na właściwości kęp wierzby piaskowej istnieje możliwość przetrwania zarośli” – U1.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się oddziaływania czynników zagrażających',
      U1: 'Perspektywy zachowania siedliska dobre, przy czym obserwowany jest wpływ czynników zagrażających, które jednak w dłuższej perspektywie czasowej nie powinny zagrozić zasobom siedliska',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'B01', name: 'Zalesianie terenów otwartych' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'J02.12.01', name: 'Prace związane z obroną przed aktywnością morza i ochroną wybrzeży, groble' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K01.05', name: 'Salinizacja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K04.01', name: 'Konkurencja' },
    { code: 'L07', name: 'Sztorm, cyklon' },
    { code: 'M01.07', name: 'Zmiana poziomu morza' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. kompleks wydm białych i szarych, bór bażynowy, groszek nadmorski.',
        help: 'Wartości przyrodnicze stanowiska poza samą kępą: sąsiednie siedliska (wydmy białe 2120, szare 2130, bór bażynowy 2180), gatunki chronione i rzadkie (groszek nadmorski, mikołajek nadmorski). Brak informacji – „Nie stwierdzono” albo „Nie pozyskano danych”.',
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: 'Jakie działania ochronne wykonano i jaka jest ich skuteczność, oraz co proponujesz. Typowe dla 2170 (sprawozdania 2016 i 2021): usunięcie albo podkrzesanie sosen ocieniających kępę, ograniczenie róży pomarszczonej i osiki, kanalizacja ruchu turystycznego (zejścia na plażę). Ochrona bierna (konserwatorska) sprzyja sukcesji sosny – sama nie wystarcza. Brak działań – „Nie prowadzono”.',
      }
    return f
  }),

  speciesCatalog: SPECIES_2170.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer2170(s) })),
  speciesInfo: (name) => {
    const e = findSpecies2170(name)
    return e ? GROUP_LABELS_2170[e.group] : undefined
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator2170 = (id: string): IndicatorDef => {
  const i = methodology2170.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 2170`)
  return i
}
