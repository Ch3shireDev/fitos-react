// Metodyka 3130 (brzegi lub osuszane dna zbiorników wodnych ze zbiorowiskami z Littorelletea, Isoëto-Nanojuncetea)
// jako dane. Źródło: Zalewska-Gałosz J. 2015, „3130 Brzegi lub osuszane dna zbiorników wodnych…” [w:] Mróz W. (red.),
// Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. IV, GIOŚ, s. 106–119 (tab. 1 i 2), z praktyką oceny
// ze sprawozdań z monitoringu 2013–2014, 2015–2018 i 2023–2025.
// Siedlisko efemeryczne, nieleśne: transekt 50–150 m wzdłuż najdłuższej linii płatu (albo 3 najbardziej reprezentatywne
// płaty), 3 zdjęcia fitosocjologiczne po 1 m² (2 m² dla Littorelletea). Dwa podtypy (sprawozdanie 2013–2014):
// 3130-1 – brzegi naturalnych zbiorników, 3130-2 – dna osuszanych stawów rybnych i zbiorników zaporowych.
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_3130,
  SPECIES_3130,
  defaultLayer3130,
  findSpecies3130,
  isAlien3130,
  isCharacteristic3130,
  isExpansive3130,
  isSpiraeaTomentosa,
  isTypicalDominant3130,
  speciesKey3130,
} from './species'

// ---------- progi liczbowe (tab. 2) ----------

/** Klasa zbiorowisk na stanowisku – od niej zależą progi gatunków charakterystycznych. */
export type CommunityClass3130 = 'isoeto' | 'littorelletea' | 'mixed'

/**
 * Gatunki charakterystyczne (liczba z tab. 1). Isoëto-Nanojuncetea (i mozaika obu klas): więcej niż 3 FV, 2–3 U1, 1 U2.
 * Littorelletea: 2 i więcej FV, 1 U1 („ocena U2 nie dotyczy zbiorowisk z klasy Littorelletea”). Brak gatunków
 * charakterystycznych to brak siedliska – U2 w każdej klasie.
 */
export function gradeCharacteristic3130(n: number, cls: CommunityClass3130 | '' = 'isoeto'): Grade {
  if (n <= 0) return 'U2'
  if (cls === 'littorelletea') return n >= 2 ? 'FV' : 'U1'
  return n > 3 ? 'FV' : n >= 2 ? 'U1' : 'U2'
}

/**
 * Gatunki dominujące: same gatunki charakterystyczne (albo formy lądowe gatunków wodnych – tab. 1) FV;
 * charakterystyczne tylko częścią dominantów albo brak dominantów U1; brak charakterystycznych wśród dominantów U2.
 */
export function gradeDominants3130(total: number, typical: number): Grade {
  if (total <= 0) return 'U1'
  if (typical >= total) return 'FV'
  return typical > 0 ? 'U1' : 'U2'
}

/** Gatunki ekspansywne (łączne pokrycie): „do 25%” FV, „od 25 do 50%” U1, „przekracza 50%” U2. 25% to FV, 50% – U1. */
export const gradeExpansive3130 = (p: number): Grade => (p <= 25 ? 'FV' : p <= 50 ? 'U1' : 'U2')

/**
 * Obce gatunki inwazyjne (pokrycie powierzchni siedliska): „nie więcej niż 25%” FV, „25–50%” U1, „więcej niż 50%” U2.
 * Sama obecność tawuły kutnerowatej Spiraea tomentosa daje U2 (tab. 1: „na obniżenie oceny wpływa sama obecność”).
 */
export function gradeAliens3130(cover: number, spiraea = false): Grade {
  if (spiraea) return 'U2'
  return cover <= 25 ? 'FV' : cover <= 50 ? 'U1' : 'U2'
}

/** Udział dobrze zachowanych płatów: „więcej niż 80%” FV, „50–80%” U1, „mniej niż 50%” U2. 80% i 50% to U1. */
export const gradeWellPreserved3130 = (p: number): Grade => (p > 80 ? 'FV' : p >= 50 ? 'U1' : 'U2')

/**
 * Struktura przestrzenna płatów: stopień fragmentacji (tab. 1: duży, średni, mały) i to, czy wynika z przyczyn
 * antropogenicznych. Tab. 2: brak albo mała nieantropogeniczna FV; duża naturalna U1; duża antropogeniczna U2.
 * Średnia – U1 (sprawozdania 2013–2014 i 2023–2025: „średni”/„umiarkowany” stopień fragmentacji → U1).
 * Mała, ale antropogeniczna – U1 (nie spełnia FV, a do U2 brakuje „dużego stopnia”). Duża bez podanej przyczyny – brak podpowiedzi.
 */
export function gradeFragmentation3130(degree: string, cause: string): Grade | null {
  if (degree === 'none') return 'FV'
  if (degree === 'small') return cause === 'anthropogenic' ? 'U1' : 'FV'
  if (degree === 'medium') return 'U1'
  if (degree === 'large') return cause === 'anthropogenic' ? 'U2' : cause === 'natural' ? 'U1' : null
  return null
}

const pct = (v: number) => `${plNum(v)}%`
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey3130(n), n])).values()]
const sumCover = (v: unknown): number | undefined => {
  const covers = speciesRows(v)
    .filter((r) => r.name?.trim())
    .map((r) => num(r.cover))
    .filter((c): c is number => c !== undefined)
  return covers.length ? Math.round(covers.reduce((a, b) => a + b, 0) * 10) / 10 : undefined
}
const classOf = (ctx?: IndicatorContext): CommunityClass3130 | '' => {
  const c = String(ctx?.site?.communityClass ?? '')
  return c === 'isoeto' || c === 'littorelletea' || c === 'mixed' ? c : ''
}

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'smallDecrease', label: 'Nieznaczny spadek (utrata powierzchni do 20% w stosunku do poprzedniego badania)', grade: 'U1' },
  { value: 'clearDecrease', label: 'Wyraźny spadek powierzchni siedliska (utrata powierzchni powyżej 20% w stosunku do poprzedniego badania)', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania albo siedlisko w tym roku się nie wykształciło', grade: 'XX' },
]
const DEGREE = [
  { value: 'none', label: 'Brak fragmentacji (jeden zwarty płat)' },
  { value: 'small', label: 'Mały stopień fragmentacji' },
  { value: 'medium', label: 'Średni stopień fragmentacji' },
  { value: 'large', label: 'Duży stopień fragmentacji' },
]
const CAUSE = [
  { value: '', label: '—' },
  { value: 'natural', label: 'Naturalna (płaty przedzielone roślinnością ekspansywną, sukcesja)' },
  { value: 'anthropogenic', label: 'Antropogeniczna (wydeptywanie, zabudowa brzegów, przekopy itp.)' },
]
const NONE = (label: string, help: string, yes = 'Nie stwierdzono'): FieldDef => ({
  kind: 'select',
  name: 'none',
  label,
  options: [
    { value: '', label: '—' },
    { value: 'yes', label: yes },
  ],
  help,
})

const noteInput = (label: string, placeholder: string, help: string): FieldDef => ({ kind: 'textarea', name: 'note', label, rows: 2, placeholder, help })
const note = (i: InputValues) => String(i.note ?? '').trim()

// ---------- liczenie z list ----------

/** Gatunki charakterystyczne z tab. 1 na liście (synonimy i wszystkie rzęśle/włosieniczniki jako jeden gatunek). */
const characteristicOnList = (i: InputValues) => distinct(rowNames(i.species).filter(isCharacteristic3130))

/** Liczba gatunków charakterystycznych: wpisana wprost ma pierwszeństwo, inaczej liczona z listy. */
function characteristicCount(i: InputValues): { n: number; from: 'count' | 'list' } | null {
  const c = num(i.count)
  if (c !== undefined) return { n: c, from: 'count' }
  return rowNames(i.species).length ? { n: characteristicOnList(i).length, from: 'list' } : null
}

function dominantsOf(i: InputValues): { total: number; typical: string[]; other: string[] } | null {
  const names = distinct(rowNames(i.species))
  if (!names.length) return i.none === 'yes' ? { total: 0, typical: [], other: [] } : null
  return { total: names.length, typical: names.filter(isTypicalDominant3130), other: names.filter((n) => !isTypicalDominant3130(n)) }
}

/** Pokrycie z pola „łącznie” albo suma z listy. */
const coverOf = (i: InputValues) => num(i.total) ?? sumCover(i.species)

function aliensFromInputs(i: InputValues): Grade | null {
  const names = rowNames(i.species)
  const spiraea = names.some(isSpiraeaTomentosa)
  if (spiraea) return 'U2'
  const c = coverOf(i)
  if (c !== undefined) return gradeAliens3130(c)
  return !names.length && i.none === 'yes' ? 'FV' : null
}

const speciesNote = (i: InputValues, none: string) => {
  if (note(i)) return note(i)
  const list = describeSpecies(speciesRows(i.species))
  if (!list && i.none === 'yes') return none
  const t = num(i.total)
  return [list, t !== undefined ? `łącznie ${pct(t)}` : ''].filter(Boolean).join('; ')
}

const NOT_DEVELOPED = `Gdy siedlisko w roku badania się nie wykształciło (zbyt wysoka woda, staw niespuszczony): wskaźnik oceń na XX – tak robiono w sprawozdaniach 2015–2018 i 2023–2025, bo struktury nie da się ocenić bez roślinności.`

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description:
      'Zmiana powierzchni płatów siedliska na stanowisku w stosunku do poprzedniego badania. Powierzchnia zbiorowisk namuliskowych w poszczególnych latach naturalnie się waha (zależy od poziomu wody i pogody) – nie zawsze świadczy to o degradacji.',
    help: `Co wybrać: jak zmieniła się powierzchnia płatów siedliska na stanowisku od poprzedniego badania. Powierzchnię w hektarach wpisz obok – trafi do pola „wartość” (w karcie z przewodnika: „3,36 ha”).

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; nieznaczny spadek, utrata do 20% – U1; wyraźny spadek, utrata powyżej 20% – U2. Przy pierwszym badaniu (brak danych porównawczych) sprawozdanie 2013–2014 dawało XX, ale karta z przewodnika (Przeborek 2013) – FV; oceń ekspercko.

Uwaga na efemeryczność: gdy siedlisko w danym roku się nie wykształciło (wysoka woda, staw niespuszczony), w 2017 r. dawano U2, w 2023–2025 – U2 albo XX. Sprawozdanie 2015–2018 przestrzega, że to spadek pozorny – przy sprzyjającej hydrologii siedlisko wraca. Opisz sytuację w notatce. Sprawozdanie 2013–2014: w stadiach inicjalnych, gdy zbiorowiska nie rozwinęły się optymalnie, powierzchnię oceniano na U1.`,
    thresholds: { FV: AREA[0].label, U1: AREA[1].label, U2: AREA[2].label },
    inputs: [
      { ...selectInput('Zmiana powierzchni', AREA, 'Puste, gdy oceniasz ekspercko.'), required: false },
      { kind: 'number', name: 'areaHa', label: 'Powierzchnia (opcjonalnie)', unit: 'ha', min: 0, help: 'Powierzchnia płatów siedliska na stanowisku w hektarach – trafi do pola „wartość” zamiast etykiety klasy. W karcie z przewodnika 3,36 ha (całe dno osuszonego stawu).' },
      noteInput('Opis (opcjonalnie)', 'np. siedlisko nie wykształciło się – staw niespuszczony', 'Krótki opis zmian, który trafi do „wartości” w karcie zamiast powierzchni i etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => {
      const ha = num(i.areaHa)
      return note(i) || (ha !== undefined ? `${plNum(ha)} ha` : labelOf(AREA, i.choice).toLowerCase())
    },
  },
  {
    id: 'transectShare',
    label: 'Powierzchnia zajęta przez siedlisko na transekcie',
    parameter: 'structure',
    excluded: true,
    excludedNote: 'pomocniczy – tab. 2 nie podaje progów, sprawozdania go nie oceniają; nie liczy się do oceny struktury',
    description: 'Procent powierzchni transektu zajęty przez siedlisko. Wskaźnik jest w przykładowej karcie z przewodnika (Przeborek: 100% – FV), ale nie ma go w tab. 2 ani w zestawieniach sprawozdań 2013–2025.',
    help: `Co wpisać: jaka część transektu jest zajęta przez płaty zbiorowisk namuliskowych (reszta to szuwar, woda, goły muł, roślinność Bidentetea). W procentach.

Ocena: tab. 2 nie podaje progów, a sprawozdania 2013–2014, 2015–2018 i 2023–2025 oceniają strukturę sześcioma wskaźnikami – bez tego. Dlatego formularz nie podpowiada oceny i nie wlicza wskaźnika do oceny struktury i funkcji. Jeśli chcesz zachować układ karty z przewodnika, wybierz ocenę ręcznie (w przykładzie: 100% – FV).

Dlaczego warto wpisać: porównanie z kolejnym badaniem pokazuje, czy płaty kurczą się na rzecz szuwaru.`,
    thresholds: { FV: 'Brak progów w tab. 2 – ocena ekspercka', U1: 'Brak progów w tab. 2 – ocena ekspercka', U2: 'Brak progów w tab. 2 – ocena ekspercka' },
    inputs: [
      { kind: 'number', name: 'value', label: 'Udział siedliska na transekcie', unit: '%', min: 0, max: 100, help: 'Procent powierzchni transektu zajęty przez siedlisko 3130. Tylko do zapisu – formularz nie podpowiada oceny.' },
      noteInput('Opis (opcjonalnie)', 'np. Siedlisko zajmuje cały transekt.', 'Krótki opis, który trafi do „wartości” w karcie zamiast samego procentu.'),
    ],
    describe: (i) => {
      const v = num(i.value)
      return note(i) || (v !== undefined ? pct(v) : '')
    },
  },
  {
    id: 'fragmentation',
    label: 'Struktura przestrzenna płatów siedliska',
    parameter: 'structure',
    description:
      'Stopień fragmentacji siedliska w skali porządkowej (duży, średni, mały) i to, czy fragmentacja wynika z przyczyn antropogenicznych. Siedlisko ze swej natury wykształca się punktowo i w sposób nieciągły – naturalna fragmentacja (np. między płatami szuwaru) jest zjawiskiem normalnym.',
    help: `Co wybrać: jak bardzo rozdrobnione są płaty siedliska na stanowisku i z jakiej przyczyny. Przyczynę podaj zawsze przy fragmentacji dużej – od niej zależy ocena.

Progi (tab. 2): brak fragmentacji albo mała, niewynikająca z działania człowieka – FV; duży stopień fragmentacji z przyczyn naturalnych (płaty w znacznym oddaleniu, przedzielane roślinnością ekspansywną, sukcesywnie zarastającą siedlisko) – U1; duży stopień fragmentacji z przyczyn antropogenicznych (wydeptywanie, zabudowa brzegów, przekopy) – U2.

Interpretacje (tab. 2 nie mówi o średniej fragmentacji): średnia – U1, tak jak w sprawozdaniach 2013–2014 („średni stopień fragmentacji”) i 2023–2025 („umiarkowany” → U1); mała, ale antropogeniczna – U1.

${NOT_DEVELOPED}`,
    thresholds: {
      FV: 'Brak fragmentacji lub mała fragmentacja niewynikająca z działania czynników antropogenicznych',
      U1: 'Duży stopień fragmentacji wynikającej z przyczyn naturalnych; płaty siedliska w znacznym oddaleniu, przedzielane płatami roślinności ekspansywnej, sukcesywnie zarastającej siedlisko',
      U2: 'Duży stopień fragmentacji wynikający z przyczyn antropogenicznych (np. wydeptywanie, zabudowa brzegów, przekopy itp.)',
    },
    inputs: [
      {
        kind: 'select',
        name: 'degree',
        label: 'Stopień fragmentacji',
        options: DEGREE,
        required: true,
        help: 'Brak – jeden zwarty płat (karta z przewodnika: „Brak fragmentacji, jeden zwarty płat”); mały – kilka płatów blisko siebie; średni – płaty wyraźnie rozdzielone, ale w zasięgu wzroku; duży – płaty w znacznym oddaleniu, przedzielone innym zbiorowiskiem.',
      },
      {
        kind: 'select',
        name: 'cause',
        label: 'Przyczyna fragmentacji',
        options: CAUSE,
        help: 'Naturalna – płaty rozdziela szuwar, roślinność ekspansywna albo woda (w 3130-1 to zjawisko dość naturalne). Antropogeniczna – wydeptywanie (kąpieliska, wędkarze), zabudowa brzegów, przekopy, umocnienia. Przy braku fragmentacji zostaw puste.',
      },
      noteInput('Opis (opcjonalnie)', 'np. Brak fragmentacji, jeden zwarty płat', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety stopnia fragmentacji.'),
    ],
    suggest: (i) => gradeFragmentation3130(String(i.degree ?? ''), String(i.cause ?? '')),
    warn: (i) =>
      i.degree === 'large' && !i.cause
        ? 'Przy dużej fragmentacji podaj przyczynę – naturalna daje U1, antropogeniczna U2.'
        : i.degree === 'none' && i.cause
          ? 'Wybrano przyczynę fragmentacji przy jej braku.'
          : null,
    describe: (i) => {
      if (note(i)) return note(i)
      const d = labelOf(DEGREE, i.degree)
      const c = i.cause === 'natural' ? 'naturalna' : i.cause === 'anthropogenic' ? 'antropogeniczna' : ''
      return [d, c].filter(Boolean).join(', ')
    },
  },
  {
    id: 'species',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Liczba gatunków charakterystycznych dla związków Lobelion i Hydrocotylo-Baldellion z klasy Littorelletea uniflorae oraz związku Elatini-Eleocharition ovatae z klasy Isoëto-Nanojuncetea (lista z tab. 1), stwierdzonych na stanowisku. Pokrycie opcjonalne.',
    help: `Co wpisać: gatunki charakterystyczne stwierdzone na stanowisku (pokrycie opcjonalne, jak w karcie z przewodnika). Formularz policzy te z listy tab. 1: synonimy jako jeden gatunek, a wszystkie rzęśle (Callitriche, formy lądowe) i włosieniczniki (Batrachium, stadia młodociane) – każde jako jeden gatunek. Liczba wpisana wprost ma pierwszeństwo.

Lista tab. 1: sit drobny, jaskier leżący, gałuszka kulecznica, namulnik brzegowy, cibora brunatna, ponikło igłowate, turzyca ciborowata, ponikło jajowate, nadwodniki (sześciopręcikowy, trójpręcikowy, naprzeciwlistny, okółkowy), lindernia mułowa, koleantus delikatny, bebłek błotny, brzeżyca jednokwiatowa, jarnik solankowy, dichostylis Michela, uwroć wodna, pięciornik niski, cibora żółta, sitniczka szczecinowata, babka pośrednia, sit dwudzielny, rzęśl, szarota błotna i żółtobiała, turzyca Oedera, mysiurek drobny, włosienicznik, centuria nadobna; mchy (czareczniki, zgliszczyn gruszkowaty, prątnik czerwonawy, widłoząbek rozmnóżkowy, krętoząb cienkolistny, brodek ucięty, borześlad białawy), wątrobowce i glewiki (wgłębki, czarostka Wondraczekiego, glewik polny, glewiczek karoliński) i glon wydętka ziarnista.

Progi zależą od klasy zbiorowisk (pole „Klasa zbiorowisk” w Stanowisku): Isoëto-Nanojuncetea – więcej niż 3 FV, 2–3 U1, 1 U2; Littorelletea – 2 i więcej FV, 1 U1 (U2 nie dotyczy Littorelletea). Mozaika obu klas – progi Isoëto-Nanojuncetea. Brak gatunków charakterystycznych – U2 (to już nie jest siedlisko).

Wskaźnik kardynalny. ${NOT_DEVELOPED}`,
    thresholds: {
      FV: 'Na stanowisku występują więcej niż 3 gatunki charakterystyczne dla siedliska (w przypadku zbiorowisk z klasy Littorelletea 2 gatunki)',
      U1: 'Na stanowisku występują 2–3 gatunki charakterystyczne dla siedliska (w przypadku zbiorowisk z klasy Littorelletea 1 gatunek)',
      U2: 'Na stanowisku występuje 1 gatunek charakterystyczny dla siedliska (ocena U2 nie dotyczy zbiorowisk z klasy Littorelletea)',
    },
    inputs: [
      speciesInput('Gatunki charakterystyczne na stanowisku', 'Gatunki charakterystyczne stwierdzone na stanowisku, pokrycie opcjonalne (np. Eleocharis acicularis 60). Liczą się te z listy tab. 1 – inne zostaną pokazane w ostrzeżeniu.'),
      { kind: 'number', name: 'count', label: 'Liczba gatunków (opcjonalnie)', min: 0, help: 'Liczba gatunków charakterystycznych wpisana wprost. Ma pierwszeństwo przed liczeniem z listy – użyj, gdy liczysz inaczej niż formularz.' },
      noteInput('Opis (opcjonalnie)', 'np. ponikło igłowate Eleocharis acicularis 60%…', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i, ctx) => {
      const c = characteristicCount(i)
      return c ? gradeCharacteristic3130(c.n, classOf(ctx)) : null
    },
    explain: (i, ctx) => {
      const c = characteristicCount(i)
      if (!c) return null
      const cls = classOf(ctx)
      const scale = cls === 'littorelletea' ? 'progi Littorelletea' : cls ? 'progi Isoëto-Nanojuncetea' : 'progi Isoëto-Nanojuncetea – wybierz klasę zbiorowisk w Stanowisku'
      const onList = characteristicOnList(i).length
      return c.from === 'count' ? `Liczba wpisana wprost: ${plNum(c.n)} (${scale}). Z listy tab. 1 rozpoznano: ${onList}.` : `Gatunków charakterystycznych z tab. 1 na liście: ${onList} (${scale}).`
    },
    warn: (i, ctx) => {
      const names = rowNames(i.species)
      const other = distinct(names.filter((n) => !isCharacteristic3130(n)))
      const c = num(i.count)
      const onList = characteristicOnList(i).length
      const cls = classOf(ctx)
      const parts: string[] = []
      if (other.length) parts.push(`Spoza listy tab. 1: ${other.join(', ')} – formularz ich nie liczy.`)
      if (c !== undefined && names.length && gradeCharacteristic3130(c, cls) !== gradeCharacteristic3130(onList, cls))
        parts.push(`Wg listy tab. 1 byłoby ${onList} (${gradeCharacteristic3130(onList, cls)}), a wpisano ${plNum(c)} (${gradeCharacteristic3130(c, cls)}).`)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      const c = num(i.count)
      return note(i) || describeSpecies(speciesRows(i.species)) || (c !== undefined ? `${plNum(c)} gat.` : '')
    },
  },
  {
    id: 'dominants',
    label: 'Gatunki dominujące',
    parameter: 'structure',
    cardinal: true,
    description:
      'Gatunki osiągające największe pokrycie w płatach siedliska na stanowisku, z pokryciem w procentach. Stan jest właściwy, gdy dominują gatunki typowe dla siedliska. Oprócz gatunków charakterystycznych lokalnie dominować mogą formy lądowe rzęśli, włosieniczników, sit dwudzielny i formy lądowe gatunków z sąsiednich zbiorowisk wodnych.',
    help: `Co wpisać: 2–4 gatunki o największym pokryciu w płatach siedliska, z pokryciem w procentach (karta z przewodnika: ponikło igłowate 60%, namulnik brzegowy 40%, rzęśl 40%). Gdy żaden gatunek nie dominuje – zaznacz „Brak gatunków dominujących” (to U1).

Formularz sprawdza każdy dominant: gatunek charakterystyczny z tab. 1 albo forma lądowa gatunku wodnego (rdestnica trawiasta, rdest ziemnowodny, przęstka, lobelia, poryblin…) to dominant typowy; wszystko inne – szuwar, Bidentetea, trawy – nietypowy. Gatunek spoza katalogu liczy się jako nietypowy.

Progi (tab. 2): dominują wyłącznie gatunki charakterystyczne – FV; gatunki charakterystyczne stanowią tylko część dominantów albo brak gatunków dominujących – U1; brak gatunków charakterystycznych wśród dominantów – U2.

Wskaźnik kardynalny. Sprawozdanie 2023–2025: tylko na 27% stanowisk dominowały gatunki charakterystyczne (najczęściej ponikło jajowate i igłowate, nadwodnik sześciopręcikowy, namulnik, bebłek, brzeżyca); na pozostałych – rodzime gatunki ekspansywne. Główna przyczyna: niewłaściwe uwodnienie podłoża (sprawozdanie 2015–2018). ${NOT_DEVELOPED}`,
    thresholds: {
      FV: 'W płatach dominują wyłącznie gatunki charakterystyczne',
      U1: 'Wśród dominantów gatunki charakterystyczne stanowią tylko część. Także brak gatunków dominujących',
      U2: 'Wśród dominantów w płatach brak gatunków charakterystycznych',
    },
    inputs: [
      speciesInput('Gatunki dominujące', 'Gatunki o największym pokryciu w płatach siedliska, z pokryciem w %, np. Eleocharis acicularis 60.'),
      NONE('Brak gatunków dominujących', 'Zaznacz, gdy w płatach żaden gatunek wyraźnie nie dominuje – tab. 2 ocenia to na U1. Lista ma być wtedy pusta.', 'Brak gatunków dominujących'),
      noteInput('Opis (opcjonalnie)', 'np. ponikło igłowate 60%, namulnik brzegowy 40%', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const d = dominantsOf(i)
      return d ? gradeDominants3130(d.total, d.typical.length) : null
    },
    explain: (i) => {
      const d = dominantsOf(i)
      if (!d || !d.total) return null
      return `Dominantów: ${d.total}, typowych (charakterystyczne lub formy lądowe gatunków wodnych): ${d.typical.length}.${d.other.length ? ` Nietypowe: ${d.other.join(', ')}.` : ''}`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (i.none === 'yes' && names.length) return 'Zaznaczono „Brak gatunków dominujących”, a lista nie jest pusta.'
      const unknown = distinct(names.filter((n) => !findSpecies3130(n)))
      return unknown.length ? `Spoza katalogu (liczone jako nietypowe): ${unknown.join(', ')}.` : null
    },
    describe: (i) => speciesNote(i, 'brak gatunków dominujących'),
  },
  {
    id: 'expansive',
    label: 'Gatunki ekspansywne roślin zielnych',
    parameter: 'structure',
    description:
      'Gatunki roślin rozprzestrzeniających się w siedlisku i mogących stanowić dla niego zagrożenie, z szacunkowym pokryciem badanych płatów. Siedlisko ma charakter pionierski i krótkotrwały, szybko ulega zarastaniu. Na ocenę wpływa sumaryczne pokrycie gatunków ekspansywnych – wskaźnik informuje o zarastaniu i przekształcaniu się siedliska w kolejne stadia sukcesyjne.',
    help: `Co wpisać: gatunki ekspansywne w płatach siedliska z pokryciem w procentach. Formularz sumuje pokrycia; łączne pokrycie wpisane wprost ma pierwszeństwo. Brak – zaznacz „Nie stwierdzono”.

Gatunki (tab. 1): na brzegach jezior i starorzeczy – szuwary, zwłaszcza niskie: ponikło błotne, skrzyp bagienny, turzyca dzióbkowata, sit członowany, a także trzcina, pałki, oczeret jeziorny. Na dnach osuszonych stawów – rdesty (szczawiolistny, plamisty), uczepy (trójlistkowy, zwisły, śląski), rzepichy (błotna, ziemnowodna), jaskier jadowity, nalot wierzb. Sprawozdania dokładają: rdest ostrogorzki, szczaw nadmorski, jeżogłówkę gałęzistą, sity rozpierzchły i skupiony, turzyce, mannę mielec, mietlicę rozłogową, śmiałka pogiętego, nalot olszy. Wszystkie są w katalogu i się sumują.

Progi (tab. 2): łączne pokrycie do 25% – FV; od 25 do 50% – U1; powyżej 50% – U2. Równo 25% formularz liczy do FV („do 25%”), 50% do U1 (U2 to „przekracza 50%”).

Dlaczego: wobec braku odnowienia (ponownego zalania i odsłonięcia) zbiorowiska namuliskowe są sukcesywnie zastępowane przez szuwar i terofity z klasy Bidentetea. Sprawozdanie 2023–2025: stan właściwy tylko na ¼ stanowisk.`,
    thresholds: {
      FV: 'Łączne pokrycie gatunków ekspansywnych zajmuje do 25% powierzchni siedliska na stanowisku',
      U1: 'Pokrycie gatunków ekspansywnych od 25 do 50% powierzchni siedliska na stanowisku',
      U2: 'Łączne pokrycie gatunków ekspansywnych przekracza 50% powierzchni siedliska na stanowisku',
    },
    inputs: [
      speciesInput('Gatunki ekspansywne', 'Gatunki ekspansywne z pokryciem płatów siedliska w %, np. Rorippa amphibia 5, Salix sp. 5. Dla „<1%” wpisz 0,5.'),
      { kind: 'number', name: 'total', label: 'Łączne pokrycie (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Łączne pokrycie gatunków ekspansywnych wpisane wprost. Ma pierwszeństwo przed sumą z listy (np. gdy płaty szuwaru i uczepu nakładają się).' },
      NONE('Brak gatunków ekspansywnych', 'Zaznacz „Nie stwierdzono”, gdy w płatach siedliska nie ma gatunków ekspansywnych – wtedy wskaźnik to FV, a do karty trafia „nie stwierdzono”.'),
      noteInput('Opis (opcjonalnie)', 'np. trzcina pospolita 1% (lokalnie)', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = coverOf(i)
      if (c !== undefined) return gradeExpansive3130(c)
      if (i.none === 'yes' && !rowNames(i.species).length) return 'FV'
      return null
    },
    explain: (i) => {
      const names = rowNames(i.species)
      if (!names.length) return null
      const t = coverOf(i)
      return `Gatunków: ${distinct(names).length}, łączne pokrycie ${t !== undefined ? pct(t) : '— (wpisz pokrycie)'}.`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (i.none === 'yes' && names.length) return 'Zaznaczono „Nie stwierdzono”, a lista nie jest pusta.'
      const odd = names.filter((n) => findSpecies3130(n) && !isExpansive3130(n))
      return odd.length ? `Na liście są gatunki spoza grupy ekspansywnych: ${odd.join(', ')}.` : null
    },
    describe: (i) => speciesNote(i, 'nie stwierdzono'),
  },
  {
    id: 'aliens',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    description:
      'Gatunki obce geograficznie w płatach siedliska, z pokryciem w procentach powierzchni siedliska. Na ocenę wpływa obfitość gatunku obcego na stanowisku i jego predyspozycje do szybkiego rozprzestrzeniania się. Na brzegach zbiorników w zachodniej Polsce najgroźniejsza jest tawuła kutnerowata Spiraea tomentosa – na obniżenie oceny wpływa sama jej obecność.',
    help: `Co wpisać: gatunki obce z pokryciem powierzchni siedliska w procentach. Formularz sumuje pokrycia; łączne pokrycie wpisane wprost ma pierwszeństwo. Brak – zaznacz „Nie stwierdzono”.

Gatunki (tab. 1): uczep amerykański Bidens frondosa, lindernia ząbkowana Lindernia dubia, przetacznik obcy Veronica peregrina (dwa ostatnie nie spełniają definicji inwazyjnych i nie zagrażają różnorodności siedliska, ale są obce i się liczą), tawuła kutnerowata Spiraea tomentosa. Sprawozdanie 2023–2025 (tab. 4) dokłada m.in. chwastnicę jednostronną, przymiotno kanadyjskie, nawłoć kanadyjską i późną, sit chudy, wierzbownicę gruczołowatą, erechtitesa, miłkę połabską – wszystkie w katalogu.

Progi (tab. 2): brak gatunków inwazyjnych albo gatunki obce zajmują nie więcej niż 25% powierzchni siedliska i brak tawuły kutnerowatej – FV; gatunki obce zajmują 25–50% powierzchni, brak tawuły – U1; ponad 50% powierzchni i/lub obecna tawuła kutnerowata – U2. 25% to FV, 50% to U1.

Dlaczego: namuły są mocno uwodnione i zwykle nie są preferowane przez gatunki inwazyjne (sprawozdanie 2013–2014) – wskaźnik rzadko spada poniżej FV, ale tawuła na brzegach jezior lobeliowych to wyjątek.`,
    thresholds: {
      FV: 'Brak gatunków inwazyjnych lub gatunki obce obecne, ale zajmują one nie więcej niż 25% powierzchni siedliska, brak okazów Spiraea tomentosa',
      U1: 'Obecne na stanowisku gatunki obce zajmują 25–50% powierzchni siedliska, brak okazów Spiraea tomentosa',
      U2: 'Obecne na stanowisku obce gatunki inwazyjne zajmują więcej niż 50% powierzchni siedliska i/lub w płatach obecne okazy Spiraea tomentosa',
    },
    inputs: [
      speciesInput('Obce gatunki w płatach siedliska', 'Gatunki obce z pokryciem powierzchni siedliska w %, np. Bidens frondosa 2. Brak – pusta lista i „Nie stwierdzono”.'),
      { kind: 'number', name: 'total', label: 'Łączne pokrycie (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Łączne pokrycie gatunków obcych wpisane wprost. Ma pierwszeństwo przed sumą z listy. Tawuła kutnerowata na liście i tak daje U2.' },
      NONE('Brak gatunków obcych', 'Zaznacz „Nie stwierdzono”, gdy w płatach siedliska nie ma gatunków obcych – wtedy wskaźnik to FV, a do karty trafia „nie stwierdzono” (w karcie z przewodnika: „Brak”).'),
      noteInput('Opis (opcjonalnie)', 'np. Brak', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: aliensFromInputs,
    explain: (i) => {
      const names = rowNames(i.species)
      if (!names.length) return null
      if (names.some(isSpiraeaTomentosa)) return 'Na liście jest tawuła kutnerowata – sama obecność daje U2.'
      const t = coverOf(i)
      return `Gatunków obcych: ${distinct(names).length}, łączne pokrycie ${t !== undefined ? pct(t) : '— (wpisz pokrycie)'}.`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (i.none === 'yes' && names.length) return 'Zaznaczono „Nie stwierdzono”, a lista gatunków obcych nie jest pusta.'
      const native = names.filter((n) => findSpecies3130(n) && !isAlien3130(n))
      return native.length ? `Na liście gatunków obcych są gatunki rodzime: ${native.join(', ')}.` : null
    },
    describe: (i) => speciesNote(i, 'nie stwierdzono'),
  },
  {
    id: 'wellPreserved',
    label: 'Udział dobrze zachowanych płatów siedliska',
    parameter: 'structure',
    cardinal: true,
    description:
      'Oszacowanie powierzchni, jaką zajmują dobrze wykształcone, typowe płaty siedliska (osiągające oceny poszczególnych wskaźników na FV), i ich udziału na stanowisku w porównaniu do powierzchni płatów przejściowych, nietypowych, z udziałem gatunków ekspansywnych. Wyodrębniając płaty typowe, zwraca się uwagę na udział gatunków charakterystycznych.',
    help: `Co wpisać: jaki procent powierzchni zajętej przez siedlisko na stanowisku stanowią płaty dobrze zachowane – typowe, z gatunkami charakterystycznymi, bez zarastania (karta z przewodnika: 95%).

Progi (tab. 2): więcej niż 80% – FV; 50–80% – U1; mniej niż 50% – U2. Równo 80% i równo 50% formularz liczy do U1.

Wskaźnik kardynalny. Sprawozdanie 2013–2014: na dnach stawów część namulisk odsłania się wcześniej, część później, więc płaty w różnych stadiach sukcesji to rzecz naturalna – wskaźnik zależy od czasu, jaki upłynął od odsłonięcia mułu. Sprawozdanie 2023–2025: najgorzej oceniany wskaźnik (U2 na 67% stanowisk). ${NOT_DEVELOPED}`,
    thresholds: {
      FV: 'Płaty dobrze zachowane zajmują więcej niż 80% powierzchni zajętej przez siedlisko na stanowisku',
      U1: 'Płaty dobrze zachowane zajmują 50–80% powierzchni zajętej przez siedlisko na stanowisku',
      U2: 'Płaty dobrze zachowane zajmują mniej niż 50% powierzchni zajętej przez siedlisko na stanowisku',
    },
    inputs: [
      { kind: 'number', name: 'value', label: 'Udział dobrze zachowanych płatów', unit: '%', min: 0, max: 100, required: true, help: 'Procent powierzchni siedliska na stanowisku zajęty przez dobrze zachowane, typowe płaty (w stosunku do płatów zaburzonych i podlegających sukcesji).' },
      noteInput('Opis (opcjonalnie)', 'np. 95%', 'Krótki opis, który trafi do „wartości” w karcie zamiast samego procentu.'),
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v !== undefined ? gradeWellPreserved3130(v) : null
    },
    describe: (i) => {
      const v = num(i.value)
      return note(i) || (v !== undefined ? pct(v) : '')
    },
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu (albo kolejnego z trzech badanych płatów), z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie.

Dlaczego: siedlisko jest efemeryczne – w kolejnym cyklu może go w ogóle nie być, a i tak trzeba wrócić dokładnie w to samo miejsce.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Przeborek',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – zwykle nazwa jeziora albo stawu, np. „Przeborek”, „Jezioro Gubisz”, „Miłowice II”, „Jez. Żywieckie – Klin”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego stanowiska – także te z lat, w których siedlisko się nie wykształciło.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'select',
    name: 'subtype',
    label: 'Podtyp siedliska',
    required: true,
    options: [
      { value: '3130-1', label: '3130-1 – brzegi naturalnych zbiorników (jeziora, starorzecza)' },
      { value: '3130-2', label: '3130-2 – dna osuszanych stawów rybnych i zbiorników zaporowych' },
    ],
    hint: 'Od podtypu zależy termin badań i oddziaływania.',
    help: `Podtypy wg sprawozdania 2013–2014:
• 3130-1 – siedlisko na okresowo odsłanianych brzegach oligo- i mezotroficznych jezior i starorzeczy, miejsca naturalne i zwykle dobrze zachowane;
• 3130-2 – siedlisko antropogeniczne: dna osuszanych stawów rybnych, obrzeża i dna opróżnianych zbiorników zaporowych.

Dlaczego: optymalny termin badań jest inny (3130-1 – przełom czerwca i lipca; 3130-2 – wrzesień–październik, po spuszczeniu wody), a w 3130-2 istnienie siedliska zależy od gospodarki rybackiej.`,
  },
  {
    kind: 'select',
    name: 'communityClass',
    label: 'Klasa zbiorowisk',
    required: true,
    options: [
      { value: 'isoeto', label: 'Isoëto-Nanojuncetea – namuliska terofitów (Elatini-Eleocharition ovatae)' },
      { value: 'littorelletea', label: 'Littorelletea – drobne byliny ziemnowodne (Lobelion, Hydrocotylo-Baldellion, Eleocharition acicularis)' },
      { value: 'mixed', label: 'Mozaika obu klas' },
    ],
    hint: 'Od klasy zależą progi gatunków charakterystycznych i powierzchnia zdjęć.',
    help: `Do której klasy należą zbiorowiska diagnostyczne na stanowisku:
• Isoëto-Nanojuncetea – drobne terofity letnie i jesienne na wilgotnych mułach: Eleocharitetum ovatae, zbiorowisko Cyperus fuscus-Limosella aquatica, Cyperetum flavescentis;
• Littorelletea uniflorae – drobne byliny wodne lub ziemnowodne na brzegach jezior miękkowodnych: Ranunculo-Juncetum bulbosi, Pilularietum globuliferae, Eleocharitetum acicularis.

Dlaczego: zbiorowiska Littorelletea są z natury ubogie w gatunki – tab. 2 wymaga od nich tylko 2 gatunków charakterystycznych do FV (zamiast więcej niż 3), a U2 ich nie dotyczy. Zdjęcia: 1 m², dla Littorelletea 2 m². Przy mozaice obu klas (jak w karcie z przewodnika) formularz stosuje progi Isoëto-Nanojuncetea.`,
  },
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. referencyjne',
    hint: 'Jak w bazie monitoringu, np. „referencyjne”.',
    help: 'Typ stanowiska w sieci monitoringu, np. „referencyjne” – stanowisko o dobrze wykształconym siedlisku, służące za punkt odniesienia (karta z przewodnika: „Referencyjne”). Jeśli nie wiesz, zostaw puste.',
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. Cyperus fuscus-Limosella aquatica, Eleocharitetum acicularis',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Dla 3130:
• Littorelletea uniflorae: Ranunculo-Juncetum bulbosi (jaskra leżącego i situ drobnego), Pilularietum globuliferae (gałuszki kulecznicy), Eleocharitetum acicularis (ponikła igłowatego);
• Isoëto-Nanojuncetea: Eleocharitetum ovatae (ponikła jajowatego), zb. Cyperus fuscus-Limosella aquatica (cibory brunatnej i namulnika), Cyperetum flavescentis (cibory żółtej).

Uwaga: zespół ponikła wielołodygowego Eleocharitetum multicaulis bywa też wskaźnikiem 2190 (zagłębienia międzywydmowe), a Ranunculo-Juncetum bulbosi – jezior lobeliowych 3110. Do 3130 zaliczaj płaty w strefie ekotonu – „obrzeża zbiorników wodnych”.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 6,
    required: true,
    hint: 'Typ i uwilgocenie podłoża, zbiorowiska w sąsiedztwie, miejsce naturalne czy antropogeniczne.',
    help: `Krótka, ogólna charakterystyka przyrodnicza stanowiska (przewodnik):
• typ i uwilgocenie podłoża – muł, piasek, żwir; świeżo odsłonięty czy przesychający;
• zbiorowiska w sąsiedztwie – szuwar, Bidentetea, roślinność wodna;
• czy zbiorowisko rozwija się w miejscu naturalnym (brzeg jeziora, starorzecze), czy antropogenicznym (dno stawu, zbiornik zaporowy) i jak gospodaruje się wodą.

Za stanowisko przyjmuje się kilkunastometrowy lub większy płat zbiorowiska diagnostycznego, a przy mniejszych – grupę położonych blisko siebie, wyraźnie wyodrębnionych płatów.`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Łączna powierzchnia płatów siedliska na stanowisku, w hektarach (3,36 ha w karcie z przewodnika – całe dno osuszonego stawu). Zmierz taśmą albo obejdź z GPS; w roku niewykształcenia wpisz 0.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    label: 'Obszary chronione (z pominięciem obszaru Natura 2000)',
    hint: 'Np. rezerwat, park krajobrazowy, użytek ekologiczny. Brak – „brak”.',
  }),
  {
    kind: 'text',
    name: 'natura2000',
    label: 'Nazwa obszaru Natura 2000',
    placeholder: 'np. PLB120009 Stawy w Brzeszczach',
    help: 'Kod i nazwa obszaru Natura 2000, w którym leży stanowisko (np. PLB120009 Stawy w Brzeszczach, PLH080060 Uroczyska Borów Zasieckich). Poza obszarem – „brak”.',
  },
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. gospodarstwo rybackie',
    help: `Kto zarządza terenem: gospodarstwo rybackie, PGW Wody Polskie, Lasy Państwowe, gmina, właściciel prywatny.

Dlaczego: w podtypie 3130-2 siedlisko istnieje tylko dzięki spuszczaniu wody ze stawu – od zarządzającego zależy, czy i kiedy dno się odsłoni (sprawozdania 2015–2018 i 2023–2025: stanowiska niewykształcone przez niespuszczenie albo zbyt późne spuszczenie stawów).`,
  },
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Początek transektu', required: true, help: coordHelp('początku') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Środek transektu', help: coordHelp('środka') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Koniec transektu', help: coordHelp('końca') },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    required: true,
    placeholder: 'np. 150 m',
    hint: 'Transekt 50–150 m wzdłuż najdłuższej linii płatu albo opis 3 badanych płatów.',
    help: `Długość transektu wyznaczonego wzdłuż najdłuższej linii, którą można przeprowadzić przez płat siedliska – metodyka: 50–150 m. Gdy siedlisko to grupa małych płatów (1–2 m²), transektu nie ma – opisz trzy badane, najbardziej reprezentatywne płaty. Odstępstwa (np. kształt litery L, jak w karcie z przewodnika, bo środek stawu był grząski) dopisz po średniku.`,
    warn: (v) => {
      const m = String(v ?? '').replace(',', '.').match(/(\d+(?:\.\d+)?)\s*m(?![²2\w])/)
      if (!m) return null
      const len = Number(m[1])
      return len >= 50 && len <= 150 ? null : `${plNum(len)} m – metodyka przewiduje transekt o długości 50–150 m. Opisz odstępstwo.`
    },
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    help: 'Wysokość nad poziomem morza, z GPS albo mapy (233 m w karcie z przewodnika). Siedlisko występuje głównie na niżu i w kotlinach; w regionie alpejskim – na zbiornikach zaporowych w okolicach Żywca i na Solinie.',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 21.10.2013',
    required: true,
    hint: 'Jeziora i starorzecza (3130-1): przełom czerwca i lipca; stawy (3130-2): wrzesień–październik.',
    help: `Dzień badań terenowych. Zbiorowiska namuliskowe pojawiają się na przełomie wiosny i lata oraz późną jesienią, gdy świeżo odsłonięty mokry substrat trafi na ciepłą pogodę.
• 3130-1 (naturalne zbiorniki): optymalnie przełom czerwca i lipca; po lipcowych powodziach także sierpień–wrzesień.
• 3130-2 (stawy rybne): wrzesień–październik, zależnie od terminu spuszczenia stawu (karta z przewodnika: 21.10.2013; uwagi metodyczne – nawet październik i/lub listopad).
Sprawozdanie 2023–2025: dopuszczalne okno od 1 czerwca do 31 października. Stanowiska bada się nie rzadziej niż raz na 6 lat, wybierając lata dogodne pogodowo.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 6 && m <= 10 ? null : 'Termin poza dopuszczalnym oknem (1 czerwca – 31 października, sprawozdanie 2023–2025). Opisz powód w uwagach.'
    },
  },
  { ...pickField(methodology7120.siteFields, 'observer'), label: 'Wykonawca (ekspert lokalny)' },
  {
    kind: 'text',
    name: 'additionalExperts',
    label: 'Dodatkowi eksperci',
    help: 'Imiona i nazwiska osób, które uczestniczyły w obserwacji albo konsultowały oznaczenia (np. briolog – mchy i wątrobowce namulisk są w tab. 1). Brak – zostaw puste.',
  },
]

// ---------- zdjęcia fitosocjologiczne: 3 × 1 m² ----------

const r7120 = methodology7120.releves.fields
const layerField = (name: string, help: string) => pickField(r7120, name, { help })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', {
    help: 'Współrzędne GPS środka zdjęcia. Zdjęcia robi się na początku, w środku i na końcu transektu albo w trzech najbardziej reprezentatywnych płatach.',
  }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach.' }),
  pickField(r7120, 'area', {
    defaultValue: 1,
    help: 'Powierzchnia zdjęcia w m². Metodyka: 1 m², dla zbiorowisk z klasy Littorelletea 2 m². Przy grupie małych płatów (1–2 m²) – cały płat.',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Na dnie stawu i płaskim brzegu 0°.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, SW). Dla powierzchni płaskiej wpisz „brak” – tak jak w karcie z przewodnika.' }),
  layerField('coverA', 'Warstwa A – drzewa: procent powierzchni zdjęcia pod koronami drzew. Na namuliskach brak = 0.'),
  layerField('coverB', 'Warstwa B – krzewy i podrost: zwykle nalot wierzb na dnie stawu. Brak = 0.\n\nDlaczego: nalot wierzb to sukcesja – przy braku odnowienia dno stawu zarasta.'),
  layerField('coverC', 'Warstwa C – zielna: procent powierzchni zdjęcia pokryty przez rośliny naczyniowe (ponikła, nadwodniki, namulnik, rzęśle). Na dobrze wykształconym namulisku często 60–90%.\n\nDlaczego: zbiorowiska namuliskowe mają strukturę jednowarstwową – prawie wszystko jest w C.'),
  layerField('coverD', 'Warstwa D – mszysta: mchy (czareczniki, prątnik), wątrobowce (wgłębki), glewiki, glon wydętka ziarnista. Brak = 0.\n\nDlaczego: mszaki namulisk są w tab. 1 jako gatunki charakterystyczne – warto ich szukać.'),
  layerField('heightA', 'Warstwa A – wysokość drzew, w metrach. Brak warstwy = 0.'),
  layerField('heightB', 'Warstwa B – wysokość krzewów i podrostu, w metrach. Brak warstwy = 0.'),
  layerField('heightC', 'Warstwa C – typowa wysokość roślin zielnych, w centymetrach (namuliska zwykle kilka cm, w karcie z przewodnika 5 cm).'),
  layerField('heightD', 'Warstwa D – wysokość warstwy mszystej, w centymetrach. Brak warstwy = 0.'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Cyperus fuscus-Limosella aquatica',
    help: 'Jednostka fitosocjologiczna zdjęcia, np. Eleocharitetum ovatae, zb. Cyperus fuscus-Limosella aquatica, Eleocharitetum acicularis, albo „asocjacja reprezentująca związek Elatini-Eleocharition ovatae”, gdy płat jest kadłubowy.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w zdjęciu z ilościowością w skali Braun-Blanqueta (r, +, 1–5): warstwa C – rośliny naczyniowe, D – mchy, wątrobowce, glon, B – nalot wierzb. Warstwa podpowiada się sama po wyborze gatunku.',
  }),
]

const otherFields: FieldDef[] = methodology7120.otherFields.flatMap((f): FieldDef[] => {
  if (f.name === 'otherValues')
    return [
      {
        ...f,
        hint: 'Np. rzadkie gatunki (lindernia mułowa, koleantus), ostoja ptaków, sąsiednie siedliska wodne.',
        help: 'Wartości przyrodnicze stanowiska poza samym siedliskiem: rzadkie i chronione gatunki namulisk (lindernia mułowa, koleantus delikatny, gałuszka kulecznica – gatunki z Czerwonej Księgi i o znaczeniu wspólnotowym), rośliny wodne w formie lądowej, sąsiednie siedliska (3110, 3150, 2190), ptaki wodno-błotne. Brak informacji – „Nie stwierdzono”.',
      },
    ]
  if (f.name === 'conservation')
    return [
      {
        ...f,
        label: 'Wykonywane działania ochronne i ocena ich skuteczności',
        help: 'Jakie działania ochronne wykonano i z jakim skutkiem. Typowe dla 3130 (sprawozdania): wykaszanie i usuwanie szuwarów z brzegów i dna, usuwanie biomasy, likwidacja dzikich kąpielisk, sterowanie wodą na stawach z myślą o namuliskach (Stawy Milickie). Brak działań – „Brak”.',
      },
      {
        kind: 'textarea',
        name: 'proposals',
        label: 'Propozycje wprowadzenia działań ochronnych',
        rows: 4,
        help: 'Jakie działania proponujesz. Dla 3130-2: utrzymanie zrównoważonej gospodarki rybackiej z okresowym spuszczaniem stawów (pozostawianie osuszonych den na kilka miesięcy, spuszczanie późnym latem/jesienią). Dla 3130-1: ograniczenie wydeptywania i rekreacji, przeciwdziałanie zabudowie i przekształcaniu linii brzegowej, ochrona zlewni przed eutrofizacją, systematyczne wykaszanie szuwaru.',
      },
    ]
  if (f.name === 'notes')
    return [
      {
        kind: 'number',
        name: 'shareFV',
        group: 'Powierzchnia siedliska o różnym stanie zachowania na stanowisku',
        label: 'Udział powierzchni siedliska w stanie FV',
        unit: '%',
        min: 0,
        max: 100,
        help: 'Karta z przewodnika przy ocenie ogólnej podaje powierzchnię siedliska o różnym stanie zachowania (Przeborek: FV 100%, U1 –, U2 –). Trzy liczby powinny dać razem 100%.',
      },
      {
        kind: 'number',
        name: 'shareU1',
        group: 'Powierzchnia siedliska o różnym stanie zachowania na stanowisku',
        label: 'Udział powierzchni siedliska w stanie U1',
        unit: '%',
        min: 0,
        max: 100,
        help: 'Procent powierzchni siedliska na stanowisku w stanie niezadowalającym (U1). Brak – 0.',
      },
      {
        kind: 'number',
        name: 'shareU2',
        group: 'Powierzchnia siedliska o różnym stanie zachowania na stanowisku',
        label: 'Udział powierzchni siedliska w stanie U2',
        unit: '%',
        min: 0,
        max: 100,
        help: 'Procent powierzchni siedliska na stanowisku w stanie złym (U2). Brak – 0.',
      },
      {
        ...f,
        help: 'Wszystko, co nie zmieściło się gdzie indziej, w tym pola „Raportu rocznego” z karty z przewodnika: czy monitoring jest wymagany i dlaczego, data kontroli, inne obserwacje, uwagi metodyczne (np. termin spuszczenia stawu, stan wody w dniu obserwacji, przyczyna niewykształcenia się siedliska), uwagi dodatkowe.',
      },
    ]
  return [f]
})

export const methodology3130: Methodology = {
  code: '3130',
  name: 'Brzegi lub osuszane dna zbiorników wodnych ze zbiorowiskami z Littorelletea, Isoëto-Nanojuncetea',
  source:
    'Zalewska-Gałosz J. 2015, 3130 Brzegi lub osuszane dna zbiorników wodnych ze zbiorowiskami z Littorelletea, Isoëto-Nanojuncetea, [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. IV, GIOŚ, s. 106–119 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2013–2014, 2015–2018 i 2023–2025',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj 3 zdjęcia fitosocjologiczne po 1 m² (2 m² dla zbiorowisk z klasy Littorelletea): na początku, w środku i na końcu transektu, a przy grupie małych płatów – w trzech najbardziej reprezentatywnych płatach. Pokrycie gatunków w siedmiostopniowej skali Braun-Blanqueta.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description: 'Ocena realnych możliwości utrzymania siedliska we właściwej kondycji, uwzględniająca jego obecny stan zachowania oraz czynniki mogące na nie oddziaływać w przyszłości.',
    help: `Weź pod uwagę hydrologię: w 3130-1 – reżim wahań poziomu wody, eutrofizację, rekreację i zabudowę brzegów; w 3130-2 – czy gospodarka rybacka z jesiennym spuszczaniem stawów będzie kontynuowana (karta z przewodnika: „dobre pod warunkiem dalszego prowadzenia zrównoważonej gospodarki rybackiej”).

Sprawozdania: dobre perspektywy mogą współistnieć ze złym stanem pozostałych parametrów (brak zagrożeń, a siedlisko się w danym roku nie wykształciło). Złe – presja turystyczna, zaniechanie użytkowania stawu, sukcesja szuwaru; w ostatnich latach także ciepłe jesienie i zimy, przez które stawów nie spuszcza się wcale.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre, nie obserwuje się oddziaływania czynników zagrażających',
      U1: 'Obserwuje się wpływ czynników zagrażających, jednak ich wpływ nie jest znaczący',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A01', name: 'Uprawa' },
    { code: 'A04.02', name: 'Wypas nieintensywny' },
    { code: 'A04.02.01', name: 'Nieintensywny wypas bydła' },
    { code: 'A07', name: 'Stosowanie biocydów, hormonów i chemikaliów' },
    { code: 'A08', name: 'Nawożenie / nawozy sztuczne' },
    { code: 'B01', name: 'Zalesianie terenów otwartych' },
    { code: 'C01.01.02', name: 'Usuwanie materiału z plaż' },
    { code: 'D01', name: 'Drogi, ścieżki i drogi kolejowe' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, rowerowe' },
    { code: 'E01.04', name: 'Inne typy zabudowy' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'E03.01', name: 'Pozbywanie się odpadów z gospodarstw domowych / obiektów rekreacyjnych' },
    { code: 'E03.04', name: 'Inne odpady' },
    { code: 'F01', name: 'Akwakultura morska i słodkowodna' },
    { code: 'F02', name: 'Rybołówstwo i zbieranie zasobów wodnych' },
    { code: 'F02.03', name: 'Wędkarstwo' },
    { code: 'G01', name: 'Sporty i różne formy czynnego wypoczynku' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G05', name: 'Inna ingerencja i zakłócenia powodowane przez działalność człowieka' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'H01', name: 'Zanieczyszczenie wód powierzchniowych (limnicznych, lądowych, morskich i słonawych)' },
    { code: 'H01.03', name: 'Inne zanieczyszczenie wód powierzchniowych ze źródeł punktowych' },
    { code: 'H01.08', name: 'Rozproszone zanieczyszczenie wód powierzchniowych z powodu ścieków z gospodarstw domowych' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J02.01', name: 'Zasypywanie terenu, melioracje i osuszanie – ogólnie' },
    { code: 'J02.02', name: 'Usuwanie osadów (mułu…)' },
    { code: 'J02.04', name: 'Zalewanie - modyfikacje' },
    { code: 'J02.04.02', name: 'Brak zalewania' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód - ogólnie' },
    { code: 'J02.05.03', name: 'Modyfikowanie akwenów wód stojących' },
    { code: 'J02.05.04', name: 'Zbiorniki wodne' },
    { code: 'J02.13', name: 'Zaniechanie gospodarki wodnej' },
    { code: 'K01.04', name: 'Zatopienie' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'M01.02', name: 'Susze i zmniejszenie opadów' },
    { code: 'M01.03', name: 'Powodzie i zwiększenie opadów' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields,

  speciesCatalog: SPECIES_3130.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer3130(s) })),
  speciesInfo: (name) => {
    const e = findSpecies3130(name)
    if (!e) return undefined
    if ((e.group === 'expansive' || e.group === 'alien') && !e.tab1) return `${GROUP_LABELS_3130[e.group]} (sprawozdania)`
    return GROUP_LABELS_3130[e.group]
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator3130 = (id: string): IndicatorDef => {
  const i = methodology3130.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 3130`)
  return i
}
