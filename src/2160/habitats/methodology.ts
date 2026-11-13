// Metodyka 2160 (nadmorskie wydmy z zaroślami rokitnika) jako dane. Źródło: Lemke D. 2012, „2160 Nadmorskie wydmy
// z zaroślami rokitnika” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II,
// GIOŚ, s. 85–92 (tab. 1 i 2), z praktyką oceny ze sprawozdań z monitoringu 2009–2011, 2015–2018 i 2020–2021.
// Siedlisko nadmorskie, skrajnie rzadkie (kilka płatów w rez. „Mewia Łacha” i okolicy). Płaty zwykle poniżej
// 50–150 m², więc zamiast transektu – obserwacja płatu (stanowisko punktowe) i jedno zdjęcie fitosocjologiczne 5×5 m.
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, forestReleveFields, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_2160,
  SPECIES_2160,
  defaultLayer2160,
  findSpecies2160,
  isCombination2160,
  isExpansive2160,
  isHippophae2160,
  isInvasive2160,
} from './species'

// ---------- progi liczbowe (tab. 2) ----------

/** Średnia wysokość krzewów: >2 m FV, 1–2 m U1 (granice włącznie), <1 m U2. */
export const gradeHeight2160 = (m: number): Grade => (m > 2 ? 'FV' : m >= 1 ? 'U1' : 'U2')

/** Powierzchnia kępy: >100 m² FV, 50–100 m² U1 (granice włącznie), <50 m² U2. */
export const gradePatch2160 = (m2: number): Grade => (m2 > 100 ? 'FV' : m2 >= 50 ? 'U1' : 'U2')

/**
 * Stan zdrowotny: % uszkodzonych pędów wierzchołkowych w płacie. Tab. 2: FV „10%”, U1 „do 50%, pędy się
 * regenerują”, U2 „powyżej 50%”. Czytamy: ≤10% FV, >10% i ≤50% U1, >50% U2.
 */
export const gradeHealth2160 = (p: number): Grade => (p <= 10 ? 'FV' : p <= 50 ? 'U1' : 'U2')

const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const uniq = (xs: string[]) => [...new Set(xs)]

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Powierzchnia nie zmienia się lub zwiększa się', grade: 'FV' },
  { value: 'small', label: 'Powierzchnia stabilna, ale bardzo mała – pojedyncze niewielkie kępy (sprawozdanie 2009–2011)', grade: 'U1' },
  { value: 'smallDecrease', label: 'Niewielki spadek powierzchni siedliska', grade: 'U1' },
  { value: 'clearDecrease', label: 'Wyraźny spadek powierzchni albo zanik zarośli w porównaniu z wcześniejszymi badaniami', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const COMBINATION: GradedOption[] = [
  {
    value: 'typical',
    label:
      'Występuje rokitnik oraz specyficzna kombinacja gatunków związanych z wydmami szarymi (Lathyrus japonicus, Carex arenaria, Jasione montana, Festuca rubra) oraz higro- i nitrofilnych (Geranium robertianum, Urtica dioica, Phragmites australis)',
    grade: 'FV',
  },
  {
    value: 'altered',
    label: 'Skład gatunkowy częściowo przekształcony w stosunku do flory wydm szarych – z ilościowością większą od 1 występują gatunki roślin zielnych spoza przedstawionej listy',
    grade: 'U1',
  },
  {
    value: 'poor',
    label: 'Wyraźne zubożenie florystyczne – wśród gatunków o ilościowości powyżej 1 brak rokitnika oraz wymienionych gatunków roślin zielnych',
    grade: 'U2',
  },
]
const EXPANSIVE: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'single', label: 'Pojedyncze egzemplarze', grade: 'U1' },
  { value: 'clumps', label: 'Kępy zagrażające trwałości zarośli', grade: 'U2' },
]
const HEIGHT: GradedOption[] = [
  { value: 'tall', label: '>2 m', grade: 'FV' },
  { value: 'mid', label: '1–2 m', grade: 'U1' },
  { value: 'low', label: '<1 m', grade: 'U2' },
]
const REGENERATION: GradedOption[] = [
  { value: 'many', label: 'Obecne liczne młode pędy wegetatywne, szczególnie na zewnątrz kępy', grade: 'FV' },
  { value: 'few', label: 'Obecne, ale nieliczne', grade: 'U1' },
  { value: 'none', label: 'Brak', grade: 'U2' },
]
const PATCH: GradedOption[] = [
  { value: 'large', label: '>100 m²', grade: 'FV' },
  { value: 'medium', label: '50–100 m²', grade: 'U1' },
  { value: 'small', label: '<50 m²', grade: 'U2' },
]
const HEALTH: GradedOption[] = [
  { value: 'good', label: 'Uszkodzenia pędów wierzchołkowych do 10%', grade: 'FV' },
  { value: 'medium', label: 'Uszkodzenia pędów wierzchołkowych do 50%, pędy się regenerują', grade: 'U1' },
  { value: 'bad', label: 'Uszkodzenia pędów wierzchołkowych powyżej 50%', grade: 'U2' },
]
const ALIENS: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'single', label: 'Występują pojedynczo, brak widocznej ekspansji', grade: 'U1' },
  { value: 'many', label: 'Liczne i ekspansywne', grade: 'U2' },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

/** Select niewymagany – gdy wpiszesz liczbę, wystarczy liczba (albo ocena ekspercka). */
const optionalSelect = (label: string, options: GradedOption[], help?: string): FieldDef => ({ ...selectInput(label, options, help), required: false })

const noteInput = (label: string, placeholder: string, help: string): FieldDef => ({ kind: 'textarea', name: 'note', label, rows: 2, placeholder, help })

const note = (i: InputValues) => String(i.note ?? '').trim()

/** Liczba ma pierwszeństwo, bez niej – klasa z selecta. */
const numberOrChoice = (grade: (v: number) => Grade, options: GradedOption[]) => (i: InputValues) => {
  const v = num(i.value)
  return v !== undefined ? grade(v) : byOption(gradeMap(options))(i)
}
const mismatch = (grade: (v: number) => Grade, options: GradedOption[], text: (v: number) => string) => (i: InputValues) => {
  const v = num(i.value)
  if (v === undefined || !i.choice) return null
  return gradeMap(options)[String(i.choice)] === grade(v) ? null : `${text(v)} nie pasuje do wybranej klasy.`
}

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description:
      'Powierzchnia płatów zarośli rokitnika na stanowisku i jej zmiana w porównaniu z wcześniejszymi badaniami. Tab. 2 przewodnika nie podaje progów – ocena wg zasad ogólnych i praktyki ze sprawozdań.',
    help: `Co wybrać: jak zmieniła się powierzchnia zarośli rokitnika na stanowisku od poprzedniej obserwacji. Powierzchnię w hektarach możesz wpisać obok – trafi do pola „wartość”.

Siedlisko jest skrajnie rzadkie: w całej Polsce kilkanaście kęp o łącznej powierzchni poniżej 0,5 ha (sprawozdanie 2009–2011), w 2021 r. trzy stanowiska razem 0,04 ha. Dlatego w praktyce ekspert obniżał ocenę do U1 także przy stabilnej, ale bardzo małej powierzchni (pojedyncze kępy) – stąd osobna opcja.

Uwaga na nasadzenia: rokitnik sadzony przez Urząd Morski do stabilizacji wydm (Hel, Kuźnica, Jastarnia, Mechelinki, Sopot) to nie siedlisko 2160 (Interpretation Manual 2013). Sprawozdanie 2021 dawało takim stanowiskom U2 – „nie o złym stanie, lecz o braku siedliska”.

Pole puste, gdy oceniasz ekspercko.`,
    thresholds: {
      FV: 'Powierzchnia nie zmienia się lub zwiększa się',
      U1: 'Niewielki spadek powierzchni albo powierzchnia stabilna, lecz bardzo mała (pojedyncze kępy)',
      U2: 'Wyraźny spadek powierzchni albo zanik zarośli w porównaniu z wcześniejszymi badaniami',
    },
    inputs: [
      optionalSelect('Zmiana powierzchni', AREA, 'Puste, gdy oceniasz ekspercko.'),
      {
        kind: 'number',
        name: 'areaHa',
        label: 'Powierzchnia (opcjonalnie)',
        unit: 'ha',
        min: 0,
        help: 'Powierzchnia płatów zarośli rokitnika na stanowisku, jeśli ją znasz – trafi do pola „wartość”. Zwykle setne części hektara (0,02 ha w karcie z przewodnika).',
      },
      noteInput('Opis (opcjonalnie)', 'np. powierzchnia stabilna, część kęp ocieniona przez brzozę', 'Krótki opis zmian powierzchni, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => {
      const ha = num(i.areaHa)
      return [ha !== undefined ? `${plNum(ha)} ha` : '', note(i) || (i.choice ? labelOf(AREA, i.choice).toLowerCase() : '')].filter(Boolean).join('; ')
    },
  },
  {
    id: 'combination',
    label: 'Charakterystyczna kombinacja gatunków',
    parameter: 'structure',
    description:
      'Typowość składu gatunkowego fitocenoz na stanowisku. W zasadzie jedynym gatunkiem charakterystycznym jest rokitnik; w runie specyficzna mieszanka gatunków wydm szarych oraz higro- i nitrofilnych. W SI MGSP i sprawozdaniach także „Gatunki charakterystyczne”.',
    help: `Co wpisać: rokitnika i gatunki z charakterystycznej kombinacji stwierdzone w płacie (z pokryciem w %), a potem wybrać, jak wygląda skład gatunkowy.

Kombinacja wg przewodnika (tab. 1 i 2): rokitnik Hippophaë rhamnoides + gatunki wydm szarych – groszek nadmorski Lathyrus japonicus, turzyca piaskowa Carex arenaria, jasieniec piaskowy Jasione montana, kostrzewa czerwona Festuca rubra – oraz higro- i nitrofilne: bodziszek cuchnący Geranium robertianum, pokrzywa zwyczajna Urtica dioica, a nawet trzcina pospolita Phragmites australis. Lista jest otwarta („takie jak”), więc inne gatunki wydmowe też pasują – ale do licznika się nie liczą.

Progi: rokitnik + specyficzna kombinacja – FV; skład częściowo przekształcony (z ilościowością >1 gatunki zielne spoza listy) – U1; wyraźne zubożenie: wśród gatunków o ilościowości >1 brak rokitnika i gatunków z listy – U2. Ilościowość to skala Braun-Blanqueta ze zdjęcia.

Praktyka 2021: rokitnik ok. 30–40% warstwy krzewów + kilka gatunków psammofilnych (turzyca piaskowa, jasieniec, jastrzębiec baldaszkowaty, kocanki, szczotlicha) – FV. Mieszanka z nasadzeń (rokitnik + róża pomarszczona) – U1.`,
    thresholds: thresholdsOf(COMBINATION),
    inputs: [
      speciesInput(
        'Rokitnik i gatunki kombinacji w płacie',
        'Rokitnik i gatunki charakterystycznej kombinacji z przybliżonym pokryciem płatu w %, np. Hippophaë rhamnoides 60, Carex arenaria 5.',
      ),
      selectInput('Skład gatunkowy', COMBINATION),
      noteInput('Opis (opcjonalnie)', 'np. występuje rokitnik oraz specyficzna kombinacja gatunków…', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków (np. jak w karcie z przewodnika).'),
    ],
    suggest: byOption(gradeMap(COMBINATION)),
    explain: (i) => {
      const names = rowNames(i.species)
      if (!names.length) return null
      const hip = names.some(isHippophae2160)
      const comb = uniq(names.filter(isCombination2160).map((n) => findSpecies2160(n)!.latin))
      return `Rokitnik: ${hip ? 'jest' : 'brak'}. Gatunków kombinacji z tab. 1: ${comb.length} z 7.`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (!names.length) return null
      if (!names.some(isHippophae2160) && i.choice === 'typical') return 'Na liście nie ma rokitnika – bez niego to nie jest FV (tab. 2: rokitnik i kombinacja gatunków).'
      if (names.some(isHippophae2160) && names.some(isCombination2160) && i.choice === 'poor')
        return 'Wybrano „wyraźne zubożenie”, a na liście są rokitnik i gatunki kombinacji – sprawdź ich ilościowość.'
      return null
    },
    describe: (i) => note(i) || describeSpecies(speciesRows(i.species)) || labelOf(COMBINATION, i.choice),
  },
  {
    id: 'expansive',
    label: 'Gatunki ekspansywne drzew i krzewów',
    parameter: 'structure',
    cardinal: true,
    description:
      'Obecność ekspansywnych gatunków roślin drzewiastych w granicach płatu i w jego bezpośredniej bliskości: sosna zwyczajna, wierzba wawrzynkowa, wierzba ostrolistna, topola osika, brzoza brodawkowata i róża pomarszczona. W SI MGSP także „Gatunki ekspansywne roślin drzewiastych”.',
    help: `Co wpisać: drzewa i krzewy ekspansywne w płacie i tuż przy nim (z pokryciem w %), a potem wybrać klasę.

Lista z przewodnika (tab. 1): sosna zwyczajna Pinus sylvestris, wierzba wawrzynkowa Salix daphnoides, wierzba ostrolistna Salix acutifolia, topola osika Populus tremula, brzoza brodawkowata Betula pendula, róża pomarszczona Rosa rugosa. Sprawozdanie 2021 dopisało wierzbę kruchą Salix fragilis (najszybciej się rozrasta), leszczynę i klon zwyczajny.

Sosna i osika to sukcesja w kierunku lasu. Wierzby i róża to zwykle dawne nasadzenia stabilizujące wydmy – róża jest tu najbardziej ekspansywna.

Progi: brak – FV; pojedyncze egzemplarze – U1; kępy zagrażające trwałości zarośli – U2. (W tab. 2 przy U2 stoi „kępy zagrażające trwałości zarośli wierzby piaskowej” – to pozostałość z innego siedliska; chodzi o zarośla rokitnika.)

Wskaźnik kardynalny. Dlaczego: sprawozdanie 2016 uznało sukcesję drzew przygłuszających rokitnik za najpoważniejsze zagrożenie – bez usuwania drzew kępy zanikną. Praktyka: brzoza i wierzba ostrolistna przy kępie – U1 (prawie każde stanowisko); zwarcie drzew ok. 80% nad rokitnikiem – U2.`,
    thresholds: thresholdsOf(EXPANSIVE),
    inputs: [
      speciesInput('Gatunki ekspansywne w płacie i przy nim', 'Drzewa i krzewy ekspansywne z przybliżonym pokryciem w %, np. Betula pendula 5, Salix acutifolia 10.'),
      selectInput('Występowanie', EXPANSIVE),
      noteInput('Opis (opcjonalnie)', 'np. w obrębie zarośli licznie występują i górują nad rokitnikiem…', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: byOption(gradeMap(EXPANSIVE)),
    warn: (i) => {
      const names = rowNames(i.species)
      if (names.length && i.choice === 'none') return 'Wybrano „Brak”, a lista gatunków ekspansywnych nie jest pusta.'
      const other = names.filter((n) => !isExpansive2160(n))
      return other.length ? `Spoza listy gatunków ekspansywnych: ${other.join(', ')} – sprawdź, czy rzeczywiście się rozprzestrzeniają.` : null
    },
    describe: (i) => {
      const n = note(i)
      if (n) return n
      if (i.choice === 'none' && !rowNames(i.species).length) return 'brak'
      return describeSpecies(speciesRows(i.species)) || labelOf(EXPANSIVE, i.choice)
    },
  },
  {
    id: 'height',
    label: 'Wysokość krzewów (średnia)',
    parameter: 'structure',
    description: 'Średnia wysokość krzewów rokitnika w płacie, w metrach, oraz rozpiętość wysokości. Pośrednio pokazuje wiek krzewów i strukturę zarośli.',
    help: `Co wpisać: średnią wysokość krzewów rokitnika w płacie (w metrach) albo tylko klasę. Rozpiętość („2–5 m”) wpisz w opisie – trafi do karty.

Progi: >2 m – FV; 1–2 m – U1; <1 m – U2. Granice: równo 2 m i równo 1 m to U1 (przedział „1–2 m” jest domknięty).

Praktyka: w rez. „Mewia Łacha” krzewy mają 4–5 m (FV na wszystkich stanowiskach 2010, 2016, 2021). Niskie krzewy (do 1,5 m) to zwykle młode nasadzenia, nie siedlisko.`,
    thresholds: thresholdsOf(HEIGHT),
    inputs: [
      { kind: 'number', name: 'value', label: 'Średnia wysokość', unit: 'm', min: 0, help: 'Średnia wysokość krzewów rokitnika w płacie, w metrach. Ma pierwszeństwo przed wyborem klasy.' },
      optionalSelect('Klasa (gdy bez pomiaru)', HEIGHT, 'Wybierz, gdy nie mierzysz średniej, np. gdy w karcie jest tylko zakres.'),
      noteInput('Rozpiętość (opcjonalnie)', 'np. 2–5 m', 'Zakres wysokości krzewów w płacie. Gdy jest, trafia do „wartości” w karcie.'),
    ],
    suggest: numberOrChoice(gradeHeight2160, HEIGHT),
    warn: mismatch(gradeHeight2160, HEIGHT, (v) => `${plNum(v)} m`),
    describe: (i) => {
      const v = num(i.value)
      return note(i) || (v !== undefined ? `${plNum(v)} m` : labelOf(HEIGHT, i.choice))
    },
  },
  {
    id: 'regeneration',
    label: 'Odnowienie naturalne rokitnika',
    parameter: 'structure',
    description: 'Obecność młodych wegetatywnych pędów rokitnika. Charakteryzuje dynamikę zarośli, możliwości ich ekspansji.',
    help: `Co ocenić: czy wokół i wewnątrz kęp są młode pędy odroślowe (z rozłogów korzeniowych) i siewki rokitnika. Owocowanie zapisz w opisie – pokazuje potencjał rozmnażania generatywnego.

Progi: obecne liczne młode pędy wegetatywne, szczególnie na zewnątrz kępy – FV; obecne, ale nieliczne – U1; brak – U2.

Dlaczego: siedlisko jest tak rzadkie, że każda kępa musi się sama odnawiać. Praktyka 2021: młode pędy na całym areale – FV, tylko na obrzeżach kęp – U1, brak (ocienienie przez drzewa, konkurencja roślin zielnych) – U2.`,
    thresholds: thresholdsOf(REGENERATION),
    inputs: [
      selectInput('Odnowienie', REGENERATION),
      noteInput('Opis (opcjonalnie)', 'np. rokitnik owocuje i odnawia się naturalnie', 'Krótki opis odnowienia i owocowania. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(REGENERATION)),
    describe: (i) => note(i) || labelOf(REGENERATION, i.choice),
  },
  {
    id: 'patch',
    label: 'Powierzchnia kępy',
    parameter: 'structure',
    cardinal: true,
    description: 'Powierzchnia monitorowanego płatu zarośli wyrażona w m². Wskaźnik ma znaczenie dla monitorowania zmian w czasie.',
    help: `Co wpisać: powierzchnię monitorowanej kępy (płatu) zarośli rokitnika w m² – z pomiaru taśmą (np. dwie osie elipsy) albo z obrysu GPS. Albo tylko klasę.

Progi: >100 m² – FV; 50–100 m² – U1; <50 m² – U2. Granice: równo 100 m² i równo 50 m² to U1.

Wskaźnik kardynalny. Dlaczego: przy tak małych płatach każda utrata kilku krzewów to wymierna strata siedliska. Typowo płaty mają poniżej 50 m² (przewodnik) albo 50–200 m² (sprawozdanie 2010); najlepsza kępa w rez. „Mewia Łacha” ma ok. 150 m² (FV).`,
    thresholds: thresholdsOf(PATCH),
    inputs: [
      { kind: 'number', name: 'value', label: 'Powierzchnia kępy', unit: 'm²', min: 0, help: 'Powierzchnia monitorowanego płatu zarośli w m². Ma pierwszeństwo przed wyborem klasy.' },
      optionalSelect('Klasa (gdy bez pomiaru)', PATCH, 'Wybierz, gdy nie mierzysz powierzchni.'),
      noteInput('Opis (opcjonalnie)', 'np. ok. 150 m², jedna z większych kęp w rezerwacie', 'Krótki opis kępy. Gdy jest, trafia do „wartości” w karcie zamiast samej liczby.'),
    ],
    suggest: numberOrChoice(gradePatch2160, PATCH),
    warn: mismatch(gradePatch2160, PATCH, (v) => `${plNum(v)} m²`),
    describe: (i) => {
      const v = num(i.value)
      return note(i) || (v !== undefined ? `${plNum(v)} m²` : labelOf(PATCH, i.choice))
    },
  },
  {
    id: 'health',
    label: 'Stan zdrowotny krzewów rokitnika',
    parameter: 'structure',
    cardinal: true,
    description: 'Procentowa ilość uszkodzonych pędów rokitnika w płacie w relacji do całego płatu.',
    help: `Co wpisać: jaki procent pędów wierzchołkowych rokitnika w płacie jest uszkodzony (zaschnięty, złamany, zgryziony), oraz czy pędy się regenerują. Albo tylko klasę.

Progi: uszkodzenia pędów wierzchołkowych do 10% – FV; do 50%, pędy się regenerują – U1; powyżej 50% – U2. W tab. 2 przy FV stoi samo „10%” – czytamy jako „do 10%”.

Wskaźnik kardynalny. Dlaczego: rokitnik jest światłożądny – przerzedzone korony i zamierające pędy to pierwszy sygnał przygłuszania przez drzewa (praktyka 2021: U1 pod presją wierzby kruchej).`,
    thresholds: thresholdsOf(HEALTH),
    inputs: [
      { kind: 'number', name: 'value', label: 'Uszkodzone pędy wierzchołkowe', unit: '%', min: 0, max: 100, help: 'Procent uszkodzonych pędów wierzchołkowych w płacie. 0 = nie stwierdzono uszkodzeń. Ma pierwszeństwo przed wyborem klasy.' },
      optionalSelect('Klasa (gdy bez pomiaru)', HEALTH, 'Wybierz, gdy nie szacujesz procentu.'),
      noteInput('Opis (opcjonalnie)', 'np. krzewy w dobrej kondycji, uszkodzeń nie stwierdzono', 'Krótki opis kondycji krzewów. Gdy jest, trafia do „wartości” w karcie.'),
    ],
    suggest: numberOrChoice(gradeHealth2160, HEALTH),
    warn: mismatch(gradeHealth2160, HEALTH, (v) => `${plNum(v)}% uszkodzonych pędów`),
    describe: (i) => {
      const v = num(i.value)
      return note(i) || (v !== undefined ? `uszkodzone pędy wierzchołkowe: ${plNum(v)}%` : labelOf(HEALTH, i.choice))
    },
  },
  {
    id: 'aliens',
    label: 'Ekspansywne gatunki obce w podszyciu i runie',
    parameter: 'structure',
    description: 'Obecność ekspansywnych gatunków obcych w podszyciu i runie zarośli.',
    help: `Co wpisać: gatunki obce w podszyciu i runie płatu (z pokryciem w %), a potem klasę.

Stwierdzane na stanowiskach (sprawozdania 2010–2021): róża pomarszczona Rosa rugosa i wierzba ostrolistna Salix acutifolia (sadzone do stabilizacji wydm, największe zagrożenie), niecierpek drobnokwiatowy Impatiens parviflora, nawłoć późna Solidago gigantea.

Progi: brak – FV; występują pojedynczo, brak widocznej ekspansji – U1; liczne i ekspansywne – U2.

Uwaga: róża i wierzba ostrolistna liczą się też we wskaźniku „Gatunki ekspansywne drzew i krzewów” – tam ocenia się ich presję na kępę, tu obecność w podszyciu i runie. Sprawozdanie 2021 dało FV przy róży 3–5% i wierzbie 1–2% („sporadycznie”) – to odstępstwo od tab. 2 (FV = brak); formularz trzyma się tabeli.`,
    thresholds: thresholdsOf(ALIENS),
    inputs: [
      speciesInput('Gatunki obce', 'Gatunki obce w podszyciu i runie z przybliżonym pokryciem płatu w %, np. Rosa rugosa 3.'),
      selectInput('Występowanie', ALIENS),
      noteInput('Opis (opcjonalnie)', 'np. pojedyncze krzewy róży na skraju kępy', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: byOption(gradeMap(ALIENS)),
    warn: (i) => {
      const names = rowNames(i.species)
      if (names.length && i.choice === 'none') return 'Wybrano „Brak”, a lista gatunków obcych nie jest pusta.'
      const native = names.filter((n) => findSpecies2160(n) && !isInvasive2160(n))
      return native.length ? `W katalogu jako rodzime: ${native.join(', ')} – sprawdź, czy to gatunek obcy.` : null
    },
    describe: (i) => {
      const n = note(i)
      if (n) return n
      if (i.choice === 'none' && !rowNames(i.species).length) return 'Brak'
      return describeSpecies(speciesRows(i.species)) || labelOf(ALIENS, i.choice)
    },
  },
]

// ---------- pola stanowiska ----------

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. „Mewia Łacha” 1',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Mewia Łacha” 1.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tej samej kępy.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    defaultValue: 'Hippophaëtum rhamnoidis',
    placeholder: 'np. Hippophaëtum rhamnoidis',
    help: 'Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Dla 2160: klasa Rhamno-Prunetea, rząd Prunetalia spinosae, związek Salicion arenariae, zespół Hippophaëtum rhamnoidis.',
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 6,
    required: true,
    hint: 'Położenie kępy (obniżenie międzywydmowe, zbocze wału), sąsiedztwo, drzewa i krzewy wokół, pochodzenie (naturalne czy nasadzenie).',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• położenie płatu w obrębie wydm (zwykle wydmy szare, obniżenie międzywydmowe, zbocze lub wierzchołek wału);
• liczba i wielkość kęp, wysokość krzewów, owocowanie;
• drzewa i krzewy ekspansywne wokół (brzoza, sosna, wierzby, róża pomarszczona);
• pochodzenie: naturalne zarośla czy nasadzenia Urzędu Morskiego (nasadzenia to nie 2160).`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Łączna powierzchnia płatów zarośli rokitnika na stanowisku, w hektarach – zwykle setne części hektara (0,02 ha w karcie z przewodnika, 0,04 ha na trzech stanowiskach w 2021 r.).',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „Rezerwat przyrody „Mewia Łacha”, Park Krajobrazowy Mierzei Wiślanej, PLH220044 Ostoja w Ujściu Wisły”. Brak – „brak”.',
  }),
  {
    kind: 'text',
    name: 'coordMiddle',
    label: 'Współrzędne geograficzne (środek płatu)',
    required: true,
    placeholder: 'np. N 54°18′; E 18°26′',
    help: `Współrzędne środka monitorowanego płatu z odbiornika GPS (WGS84). Stanowisko jest punktowe, więc wystarczy jeden punkt.

Dlaczego: kępy są małe i rozproszone w wydmach – w 2016 r. jedno stanowisko „zgubiono” właśnie przez niedokładne współrzędne.`,
  },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    required: true,
    defaultValue: 'Stanowisko punktowe – obserwacja całego płatu zarośli',
    hint: 'Zwykle bez transektu: płaty są za małe.',
    help: `Przewodnik nie przewiduje transektu: szczegółowe obserwacje prowadzi się w konkretnych płatach zarośli, a jedno zdjęcie fitosocjologiczne (25 m²) ilustruje skład płatu. W karcie z przewodnika: „Monitoring przeprowadzono na stanowisku punktowym z powodu małej powierzchni poszczególnych kęp zarośli rokitnika”.

Gdy jednak wytyczasz transekt (duży płat), wpisz jego wymiary.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 2',
    help: 'Wysokość nad poziomem morza w metrach – zarośla na wydmach nadmorskich leżą zwykle 1–10 m n.p.m.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 16.09.2010',
    required: true,
    hint: 'Optymalnie od czerwca do sierpnia (najlepiej czerwiec albo koniec sierpnia).',
    help: `Dzień badań terenowych. Optymalny termin: czerwiec–sierpień; ze względu na ruch turystyczny najlepiej czerwiec albo ostatnia dekada sierpnia. Badania powtarza się co 3–6 lat.

W poprzednich cyklach badano w pierwszej połowie września (przykład z przewodnika: 16.09.2010) – formularz to przyjmie, ale ostrzeże.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 6 && m <= 8 ? null : 'Termin poza optymalnym oknem (czerwiec–sierpień).'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcie fitosocjologiczne: jedno, 5×5 m ----------

const releveFields: FieldDef[] = forestReleveFields({
  area: 25,
  helps: {
    coords: 'Współrzędne GPS środka zdjęcia – zwykle w środku monitorowanej kępy.',
    altitude: 'Wysokość nad poziomem morza środka zdjęcia, w metrach.',
    slope: 'Nachylenie powierzchni w stopniach. W obniżeniu międzywydmowym zwykle 0°, na zboczu wału wydmowego więcej.',
    exposure: 'Kierunek, w którym opada powierzchnia (N, NE…). Dla powierzchni płaskiej wpisz „brak”.',
    coverA: 'Warstwa A – drzewa: procent powierzchni zdjęcia przykryty koronami drzew (brzoza, wierzby, sosna) górujących nad rokitnikiem. 25% w karcie z przewodnika.',
    coverB: 'Warstwa B – krzewy: procent powierzchni zdjęcia przykryty przez krzewy, głównie rokitnik. 70% w karcie z przewodnika.',
    coverC: 'Warstwa C – zielna: procent powierzchni zdjęcia przykryty przez rośliny zielne (gatunki wydm szarych, higro- i nitrofilne).',
    coverD: 'Warstwa D – mszysta: procent powierzchni zdjęcia przykryty przez mchy i porosty. W zaroślach zwykle 0.',
    heightA: 'Typowa wysokość drzew (warstwa A), w metrach. Brak warstwy = puste.',
    heightB: 'Typowa wysokość krzewów rokitnika (warstwa B), w metrach – zwykle 2–5 m.',
    heightC: 'Typowa wysokość warstwy zielnej, w centymetrach.',
    heightD: 'Typowa wysokość warstwy mszystej, w centymetrach. Brak warstwy = puste.',
    unit: 'Jednostka fitosocjologiczna zdjęcia, zwykle Hippophaëtum rhamnoidis.',
    species:
      'Wszystkie gatunki naczyniowe w poletku z warstwą i ilościowością w skali Braun-Blanqueta (r, +, 1–5). Rokitnik w B (jego siewki w C), drzewa ekspansywne w A albo B.',
  },
  overrides: { unit: { placeholder: 'np. Hippophaëtum rhamnoidis' } },
})

export const methodology2160: Methodology = {
  code: '2160',
  name: 'Nadmorskie wydmy z zaroślami rokitnika',
  source:
    'Lemke D. 2012, 2160 Nadmorskie wydmy z zaroślami rokitnika, [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 85–92 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2009–2011, 2015–2018 i 2020–2021',

  siteFields,

  releves: {
    defaultCount: 1,
    intro:
      'Skład gatunkowy płatu ilustruje jedno zdjęcie fitosocjologiczne klasyczną metodą Braun-Blanqueta na poletku 5×5 m (25 m²), z podziałem na warstwy: drzewa (A), krzewy z rokitnikiem (B), zielna (C), mszysta (D).',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Ocena realnych możliwości utrzymania siedliska we właściwej kondycji, uwzględniająca jego obecny stan zachowania oraz czynniki, mogące na nie oddziaływać w najbliższej przyszłości.',
    help: `Weź pod uwagę: ochronę prawną (rezerwat „Mewia Łacha” – zakaz schodzenia ze ścieżek), postęp sukcesji drzew (brzoza, sosna, wierzba krucha) nad kępami, ekspansję róży pomarszczonej i wierzby ostrolistnej, prace przy umacnianiu brzegu (nasadzenia obcych gatunków), dojścia na plażę, sztormy i abrazję, zalewanie (Przekop Wisły), żeremia i zgryzanie przez bobry.

Działania ochronne z przewodnika i sprawozdań: usuwanie drzew ocieniających kępy (brzoza, wierzba krucha, sosna), usuwanie róży pomarszczonej i wierzby ostrolistnej, rezygnacja z nasadzeń obcych gatunków przy umacnianiu brzegu.

Praktyka: FV, gdy kępa duża i nie widać bezpośrednich zagrożeń; U1 przy sukcesji drzew lub małej powierzchni; U2, gdy sukcesja intensyfikuje się i stan struktury się pogarsza (2021).`,
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
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02.04', name: 'Zalewanie – modyfikacje' },
    { code: 'J02.12.01', name: 'Prace związane z obroną przed aktywnością morza i ochroną wybrzeży, groble' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K04', name: 'Międzygatunkowe interakcje wśród roślin' },
    { code: 'K04.01', name: 'Konkurencja' },
    { code: 'L07', name: 'Sztorm, cyklon' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. sąsiedztwo 2120, 2130, 2180; groszek nadmorski; ptaki.',
        help: 'Wartości przyrodnicze stanowiska poza samymi zaroślami: sąsiednie siedliska wydmowe (2120, 2130, 2180), gatunki chronione, ptaki (rez. „Mewia Łacha” to ostoja ptaków). Brak informacji – „Nie stwierdzono” albo „Nie pozyskano danych”.',
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: 'Jakie działania ochronne wykonano i jaka jest ich skuteczność, oraz co proponujesz. Typowe dla 2160: usuwanie drzew ocieniających kępy rokitnika (brzoza, wierzba krucha, sosna), usuwanie róży pomarszczonej i wierzby ostrolistnej, rezygnacja z nasadzeń obcych gatunków przy umacnianiu brzegu. Brak działań – „Nie prowadzono”.',
      }
    return f
  }),

  speciesCatalog: SPECIES_2160.map((s) => ({ value: s.latin, label: s.polish, layer: defaultLayer2160(s) })),
  speciesInfo: (name) => {
    const e = findSpecies2160(name)
    if (!e) return undefined
    const tags = [GROUP_LABELS_2160[e.group], e.expansive ? 'ekspansywny' : '', e.invasive ? 'obcy w podszyciu/runie' : ''].filter(Boolean)
    return tags.join(', ')
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator2160 = (id: string): IndicatorDef => {
  const i = methodology2160.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 2160`)
  return i
}
