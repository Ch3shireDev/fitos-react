// Metodyka 4060 (wysokogórskie borówczyska bażynowe Empetro-Vaccinietum) jako dane. Źródło: Świerkosz K. 2012,
// „4060 Wysokogórskie borówczyska bażynowe (Empetro-Vaccinietum)” [w:] Mróz W. (red.), Monitoring siedlisk
// przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 247–256 (tab. 1 i 2, przykładowa karta „Kopa”), z praktyką
// oceny ze sprawozdań z monitoringu 2009–2011, 2016 i 2021. Siedlisko nieleśne, wysokogórskie, małopowierzchniowe:
// płaty rozproszone na upłazach, półkach skalnych i torfowiskach, więc transekt zwykle niestandardowy, a zdjęcia
// fitosocjologiczne od 10 m² (na półkach skalnych nawet 3–4 m²). Z modułu leśnego tylko klocki generyczne.
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import { GROUP_LABELS_4060, SPECIES_4060, defaultLayer4060, findSpecies4060, isDiagnostic4060, speciesKey4060 } from './species'

// ---------- progi liczbowe (tab. 2) ----------

/**
 * Gatunki charakterystyczne – pokrycie gatunków typowych (wyznaczników zespołu): „>5%” FV, „2–5%” U1, „<2%” U2.
 * Granice 2% i 5% należą do U1 (FV dopiero powyżej 5%).
 */
export const gradeCharacteristic4060 = (p: number): Grade => (p > 5 ? 'FV' : p >= 2 ? 'U1' : 'U2')

/**
 * Gatunki dominujące, w tym ekspansja borówki czarnej: „poniżej 50%” FV, „50–70%” U1, „powyżej 70%” U2.
 * Liczony udział największego dominanta spoza wyznaczników zespołu (bażyny, borówki halnej). 50% i 70% to U1.
 */
export const gradeDominants4060 = (p: number): Grade => (p < 50 ? 'FV' : p <= 70 ? 'U1' : 'U2')

/** Ekspansja kosodrzewiny: udział „nie większy niż 30%” FV, „30–50%” U1, „>50%” U2. 30% to FV, 50% to U1. */
export const gradeMugo4060 = (p: number): Grade => (p <= 30 ? 'FV' : p <= 50 ? 'U1' : 'U2')

const pct = (v: number) => `${plNum(v)}%`
const round1 = (v: number) => Math.round(v * 10) / 10
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const distinct = (names: string[]) => [...new Map(names.map((n) => [speciesKey4060(n), n])).values()]
const sumCoverWhere = (v: unknown, pred: (name: string) => boolean): number | undefined => {
  const covers = speciesRows(v)
    .filter((r) => r.name?.trim() && pred(r.name))
    .map((r) => num(r.cover))
    .filter((c): c is number => c !== undefined)
  return covers.length ? round1(covers.reduce((a, b) => a + b, 0)) : undefined
}

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'smallDecrease', label: 'Spadek powierzchni zajmowanej przez siedlisko nie większy niż 5%', grade: 'U1' },
  { value: 'clearDecrease', label: 'Spadek powierzchni siedliska o więcej niż 5% w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const MECHANICAL: GradedOption[] = [
  { value: 'none', label: 'Brak śladów antropopresji', grade: 'FV' },
  { value: 'traces', label: 'Pojedyncze ślady pobytu człowieka', grade: 'U1' },
  { value: 'intense', label: 'Intensywna antropopresja', grade: 'U2' },
]

const optionalSelect = (label: string, options: GradedOption[], help?: string): FieldDef => ({ ...selectInput(label, options, help), required: false })
const noteInput = (label: string, placeholder: string, help: string): FieldDef => ({ kind: 'textarea', name: 'note', label, rows: 2, placeholder, help })
const note = (i: InputValues) => String(i.note ?? '').trim()

// ---------- liczenie z list ----------

/** Pokrycie gatunków charakterystycznych: łączne wpisane wprost ma pierwszeństwo, inaczej suma wyznaczników z listy. */
const characteristicCover = (i: InputValues): number | undefined => num(i.total) ?? sumCoverWhere(i.species, isDiagnostic4060)

/** Największy dominant spoza wyznaczników zespołu (bażyny, borówki halnej). */
function topDominant(i: InputValues): { name: string; cover: number } | undefined {
  let best: { name: string; cover: number } | undefined
  for (const r of speciesRows(i.species)) {
    const c = num(r.cover)
    if (!r.name?.trim() || c === undefined || isDiagnostic4060(r.name)) continue
    if (!best || c > best.cover) best = { name: r.name.trim(), cover: c }
  }
  return best
}

/** Udział dominanta: wpisany wprost > największy z listy > „brak wyraźnego dominanta” (0). */
function dominantShare(i: InputValues): { v: number; from: 'value' | 'list' | 'none' } | null {
  const v = num(i.value)
  if (v !== undefined) return { v, from: 'value' }
  const top = topDominant(i)
  if (top) return { v: top.cover, from: 'list' }
  const covered = speciesRows(i.species).some((r) => r.name?.trim() && num(r.cover) !== undefined)
  if (covered || i.none === 'yes') return { v: 0, from: 'none' }
  return null
}

const BILBERRIES = ['Vaccinium myrtillus', 'Vaccinium vitis-idaea'].map(speciesKey4060)

// ---------- wskaźniki ----------

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description: 'Zmiana powierzchni płatów siedliska na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury.',
    help: `Co wybrać: jak zmieniła się powierzchnia płatów borówczyska bażynowego na stanowisku od poprzedniego badania (albo względem literatury, zdjęć lotniczych). Metodyka zaleca liczyć powierzchnię metodami fotogrametrycznymi po terenowej weryfikacji płatów widocznych na zdjęciach lotniczych.

Progi (tab. 2): nie podlega zmianom lub zwiększa się – FV; spadek nie większy niż 5% – U1; spadek o więcej niż 5% – U2. Przy pierwszym badaniu wybierz „Brak danych do porównania” (XX) albo oceń ekspercko i opisz.

Praktyka: siedlisko jest z natury małopowierzchniowe (zwykle kilka arów), więc mała powierzchnia sama w sobie nie obniża oceny, jeśli jest stabilna (sprawozdanie 2021: Sudety – areał do 6 arów, ale stabilny → FV). Spadek powodują wydeptywanie przy szlakach i sukcesja w stronę borówczyska czernicowego albo kosówki (Dolina Pięciu Stawów Polskich: U2).`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się',
      U1: 'Spadek powierzchni zajmowanej przez siedlisko nie większy niż 5%',
      U2: 'Spadek powierzchni siedliska o więcej niż 5% w porównaniu z wcześniejszymi badaniami lub podawanymi w literaturze',
    },
    inputs: [
      optionalSelect('Zmiana powierzchni', AREA, 'Puste, gdy oceniasz ekspercko (np. pierwsze badanie).'),
      { kind: 'number', name: 'areaHa', label: 'Powierzchnia (opcjonalnie)', unit: 'ha', min: 0, help: 'Powierzchnia płatów siedliska na stanowisku, jeśli ją znasz – trafi do pola „wartość”. W sprawozdaniu 2021: od 2 arów do 12 ha (Śnieżnik), na połowie stanowisk karpackich poniżej 0,05 ha.' },
      noteInput('Opis (opcjonalnie)', 'np. Całość dostępnego siedliska zajęta przez zbiorowisko', 'Krótki opis, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => {
      const ha = num(i.areaHa)
      return [ha !== undefined ? `${plNum(ha)} ha` : '', note(i) || (i.choice ? labelOf(AREA, i.choice).toLowerCase() : '')].filter(Boolean).join('; ')
    },
  },
  {
    id: 'species',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Występowanie i pokrycie gatunków typowych dla siedliska – wyznaczników zespołu Empetro-Vaccinietum: bażyny obupłciowej Empetrum hermaphroditum i borówki halnej Vaccinium gaultherioides (w piaskowcowej postaci z Gór Stołowych zastępczo bażyny czarnej E. nigrum i borówki bagiennej V. uliginosum).',
    help: `Co wpisać: wyznaczniki zespołu stwierdzone na stanowisku z pokryciem w procentach („sporadycznie”, „<1%” – wpisz 0,5). Formularz sumuje pokrycie bażyny obupłciowej, borówki halnej, bażyny czarnej i borówki bagiennej; inne gatunki z listy się nie liczą. Łączne pokrycie możesz wpisać wprost – ma pierwszeństwo.

Progi (tab. 2): gatunki typowe dla siedliska powyżej 5% pokrycia – FV; 2–5% – U1; poniżej 2% – U2. Równo 5% to jeszcze U1, równo 2% też U1.

Dlaczego tylko wyznaczniki: tab. 1 odsyła do listy „typowych gatunków” z rozdz. 4, ale na niej są też borówka czarna i brusznica, które pokrywają niemal każde borówczysko – liczone razem dawałyby zawsze FV. Sprawozdanie 2016 krytykuje taką interpretację, a w 2021 ocena opierała się na obecności i pokryciu bażyny obupłciowej i borówki halnej (Dolina Pięciu Stawów: śladowe pokrycie → U1). W Górach Stołowych w 2021 brano bażynę czarną (20–35%) i borówkę bagienną.

Wskaźnik kardynalny.`,
    thresholds: { FV: 'Występowanie gatunków typowych dla siedliska >5% pokrycia', U1: 'Występowanie gatunków typowych dla siedliska 2–5% pokrycia', U2: 'Występowanie gatunków typowych dla siedliska <2% pokrycia' },
    inputs: [
      speciesInput('Gatunki charakterystyczne z pokryciem', 'Wyznaczniki zespołu z pokryciem w %, np. Empetrum hermaphroditum 5, Vaccinium gaultherioides 0,5. Dla „sporadycznie” albo „<1%” wpisz 0,5.'),
      { kind: 'number', name: 'total', label: 'Łączne pokrycie (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Łączne pokrycie gatunków charakterystycznych wpisane wprost. Ma pierwszeństwo przed sumą z listy – użyj, gdy szacujesz łącznie albo liczysz inaczej niż formularz.' },
      noteInput('Opis (opcjonalnie)', 'np. Obecne oba gatunki charakterystyczne, z udziałem powyżej 5% na stanowisku.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const c = characteristicCover(i)
      return c !== undefined ? gradeCharacteristic4060(c) : null
    },
    explain: (i) => {
      const names = rowNames(i.species)
      if (!names.length && num(i.total) === undefined) return null
      const sum = sumCoverWhere(i.species, isDiagnostic4060)
      const t = num(i.total)
      return t !== undefined
        ? `Łączne pokrycie wpisane wprost: ${pct(t)}.${sum !== undefined ? ` Suma z listy: ${pct(sum)}.` : ''}`
        : `Pokrycie wyznaczników zespołu: ${sum !== undefined ? pct(sum) : '— (wpisz pokrycie)'}.`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      const parts: string[] = []
      const other = distinct(names.filter((n) => !isDiagnostic4060(n)))
      if (other.length) parts.push(`Nie liczą się (spoza wyznaczników zespołu): ${other.join(', ')}.`)
      if (names.length) {
        const keys = new Set(names.filter(isDiagnostic4060).map(speciesKey4060))
        const empetrum = keys.has('bażyna obupłciowa') || keys.has('bażyna czarna')
        const vaccinium = keys.has('borówka halna') || keys.has('borówka bagienna')
        if (!empetrum) parts.push('Brak bażyny na liście – sprawdź, czy to wciąż płat 4060.')
        else if (!vaccinium) parts.push('Brak borówki halnej (w Górach Stołowych – bagiennej). Na Babiej Górze to norma, gdzie indziej zanotuj w opisie.')
      }
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      const t = num(i.total)
      return note(i) || describeSpecies(speciesRows(i.species)) || (t !== undefined ? `łącznie ${pct(t)}` : '')
    },
  },
  {
    id: 'dominants',
    label: 'Gatunki dominujące, w tym ekspansja borówki czarnej Vaccinium myrtillus',
    parameter: 'structure',
    cardinal: true,
    description:
      'Gatunkami dominującymi w siedlisku, zależnie od stanowiska, mogą być oba gatunki bażyny, Empetrum spp., a także wszystkie gatunki borówek Vaccinium spp. lub wrzos zwyczajny Calluna vulgaris. Jeśli udział borówki czarnej Vaccinium myrtillus w płacie przekracza 50%, może to zagrażać występowaniu rzadszych i bardziej wrażliwych na konkurencję gatunków, szczególnie bażyn.',
    help: `Co wpisać: gatunki dominujące w płatach z pokryciem w procentach. Formularz bierze udział największego dominanta spoza wyznaczników zespołu (bażyna i borówka halna mogą dominować – to dobrze). Gdy żaden gatunek nie wybija się ponad resztę, zaznacz „Brak wyraźnego dominanta”. Udział wpisany wprost ma pierwszeństwo.

Progi (tab. 2): poniżej 50% – FV; 50–70% – U1; powyżej 70% – U2. Równo 50% i równo 70% to U1.

Praktyka: w karcie z przewodnika (Kopa) wrzos 20–30% i borówka czarna 10–30% → „brak gatunku dominującego z udziałem powyżej 30%”, FV. Sprawozdanie 2021: niezadowalająca ocena przy kilku gatunkach o znacznym pokryciu (borówka czarna, wrzos, kosodrzewina, trzęślica modra); Gówniak 01 – „obie borówki pokrywały 90%” → U2. Jeśli oceniasz łącznie borówkę czarną z brusznicą, wpisz ich sumę wprost – formularz pokaże tę sumę w ostrzeżeniu.

Sprawozdania 2016 i 2021 oceniały też osobno „ekspansję borówki czarnej” (do 50% FV, 60% U1) – metodyka 2012 włącza ją do tego wskaźnika, więc nie ma osobnego wiersza. Wskaźnik kardynalny.`,
    thresholds: { FV: 'Poniżej 50%', U1: '50–70%', U2: 'Powyżej 70%' },
    inputs: [
      speciesInput('Gatunki dominujące z pokryciem', 'Dominanty w płatach z pokryciem w %, np. Calluna vulgaris 30, Vaccinium myrtillus 30. Bażyna i borówka halna mogą być na liście – nie obniżają oceny.'),
      { kind: 'number', name: 'value', label: 'Udział dominanta (opcjonalnie)', unit: '%', min: 0, max: 100, help: 'Udział gatunku dominującego (albo kilku łącznie, np. obu borówek) wpisany wprost. Ma pierwszeństwo przed największym pokryciem z listy.' },
      {
        kind: 'select',
        name: 'none',
        label: 'Brak wyraźnego dominanta',
        options: [
          { value: '', label: '—' },
          { value: 'yes', label: 'Brak wyraźnego dominanta' },
        ],
        help: 'Zaznacz, gdy żaden gatunek nie dominuje (np. mozaika kilku krzewinek po kilkanaście procent) i nie wpisujesz pokryć – wtedy wskaźnik to FV.',
      },
      noteInput('Opis (opcjonalnie)', 'np. Brak gatunku dominującego z udziałem powyżej 30%.', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków.'),
    ],
    suggest: (i) => {
      const d = dominantShare(i)
      return d ? gradeDominants4060(d.v) : null
    },
    explain: (i) => {
      const d = dominantShare(i)
      if (!d) return null
      if (d.from === 'value') return `Udział wpisany wprost: ${pct(d.v)}.`
      if (d.from === 'none') return 'Brak dominanta spoza wyznaczników zespołu.'
      const top = topDominant(i)!
      return `Największy dominant spoza wyznaczników: ${top.name} ${pct(top.cover)}.`
    },
    warn: (i) => {
      if (i.none === 'yes' && topDominant(i)) return 'Zaznaczono „Brak wyraźnego dominanta”, a na liście są gatunki z pokryciem.'
      const bilberries = sumCoverWhere(i.species, (n) => BILBERRIES.includes(speciesKey4060(n)))
      const top = topDominant(i)
      if (num(i.value) === undefined && bilberries !== undefined && top && gradeDominants4060(bilberries) !== gradeDominants4060(top.cover))
        return `Borówka czarna z brusznicą łącznie ${pct(bilberries)} (${gradeDominants4060(bilberries)}) – sprawozdanie 2021 oceniało je czasem łącznie. Jeśli tak oceniasz, wpisz udział wprost.`
      return null
    },
    describe: (i) => {
      if (note(i)) return note(i)
      const list = describeSpecies(speciesRows(i.species))
      const v = num(i.value)
      if (!list && i.none === 'yes') return 'brak wyraźnego dominanta'
      return [list, v !== undefined ? `dominant ${pct(v)}` : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'mugo',
    label: 'Ekspansja kosodrzewiny Pinus mugo',
    parameter: 'structure',
    description:
      'Udział pojedynczych krzewów lub siewek kosodrzewiny Pinus mugo jest naturalny dla tego typu siedliska, które z reguły rozwija się w postaci niewielkich płatów bezpośrednio graniczących z zaroślami kosodrzewiny lub torfowiskami, na których również gatunek ten może występować.',
    help: `Co wpisać: pokrycie kosodrzewiny w płatach siedliska w procentach (w warstwie krzewów i zielnej łącznie, siewki też). Tam, gdzie kosówki nie ma, a wkraczają inne krzewy (jarząb w formie górskiej, wierzba śląska, świerk), wpisz ich pokrycie i wymień je na liście – tak oceniano w 2021 r. stanowisko w Bieszczadach (luźne zarośla jarzębiny ok. 5% → FV).

Progi (tab. 2): udział nie większy niż 30% – FV (przyjęto, że nie zaburza struktury i funkcji siedliska); 30–50% – U1; powyżej 50% – U2. Równo 30% to FV, równo 50% to U1.

Praktyka 2021: Równia pod Śnieżką – kosówka 45% → U1; Ornak i Kozi Wierch – widoczna ekspansja → U1. Na Śnieżniku kosodrzewina jest sadzona (XIX–XX w.). Wskaźnik niekardynalny.`,
    thresholds: { FV: 'Przyjęto, że udział nie większy niż 30% nie zaburza struktury i funkcji siedliska', U1: 'Udział 30%–50%', U2: 'Udział >50%' },
    inputs: [
      { kind: 'number', name: 'value', label: 'Pokrycie kosodrzewiny', unit: '%', min: 0, max: 100, required: true, help: 'Pokrycie kosodrzewiny (albo innych krzewów, gdzie kosówki nie ma) w płatach siedliska, w procentach. Pojedyncze siewki – 0,5. Brak = 0.' },
      speciesInput('Krzewy i drzewa (opcjonalnie)', 'Gatunki krzewów i drzew w płatach, np. Pinus mugo, Sorbus aucuparia var. glabrata, Salix silesiaca. Pokrycie opcjonalne.'),
      noteInput('Opis (opcjonalnie)', 'np. W płatach pojedyncze siewki kosodrzewiny Pinus mugo.', 'Krótki opis, który trafi do „wartości” w karcie zamiast procentu.'),
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v !== undefined ? gradeMugo4060(v) : null
    },
    warn: (i) => {
      const odd = rowNames(i.species).filter((n) => findSpecies4060(n) && findSpecies4060(n)!.group !== 'woody')
      return odd.length ? `Na liście są gatunki inne niż krzewy i drzewa: ${odd.join(', ')}.` : null
    },
    describe: (i) => {
      const v = num(i.value)
      const list = describeSpecies(speciesRows(i.species))
      return note(i) || [v !== undefined ? `pokrycie ${v > 0 && v < 1 ? '<1%' : pct(v)}` : '', list].filter(Boolean).join('; ')
    },
  },
  {
    id: 'mechanical',
    label: 'Zniszczenia mechaniczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Stopień antropopresji związany z bezpośrednią ingerencją człowieka w siedlisko, łatwo zauważalny na powierzchniach monitoringowych dzięki tworzeniu się ścieżek lub zamieraniu krzewinek. Szczególnie wrażliwym na wydeptywanie gatunkiem jest bażyna czarna Empetrum nigrum.',
    help: `Co wybrać: ślady wydeptywania (ścieżki w płatach, zamarłe krzewinki, odsłonięta gleba), zaśmiecenie, ślady wspinaczy. Opisz w notatce, co widać – trafi do karty.

Progi (tab. 2): brak śladów antropopresji – FV; pojedyncze ślady pobytu człowieka – U1; intensywna antropopresja – U2.

Praktyka 2021: ścieżki wydeptane przez jelenie i niewielkie osunięcia gleby nie obniżały oceny (FV); ślady wydeptywania przy szlakach (Szczeliniec Wielki III, Karkonosze – poniżej Wielkiego Stawu I, Śnieżnik z metalowymi resztkami wieży) – U1. Wskaźnik kardynalny.`,
    thresholds: { FV: 'Brak śladów antropopresji', U1: 'Pojedyncze ślady pobytu człowieka', U2: 'Intensywna antropopresja' },
    inputs: [
      selectInput('Zniszczenia mechaniczne', MECHANICAL),
      noteInput('Opis (opcjonalnie)', 'np. Brak', 'Krótki opis, co i w jakiej skali niszczy płaty. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(MECHANICAL)),
    describe: (i) => note(i) || labelOf(MECHANICAL, i.choice),
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (which: string) =>
  `Współrzędne geograficzne ${which} (WGS84, z GPS). Płaty 4060 są zwykle rozproszone, więc transektu najczęściej nie ma – podaj punkty płatów albo zdjęć fitosocjologicznych (w karcie z przewodnika trzy). Trzymaj jeden format w całej karcie.

Dlaczego: przy powtórzeniu badania za 3–6 lat ktoś musi odnaleźć te same płaty.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Kopa',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Kopa”, „Siwa Przełęcz”, „Gówniak 01”, „Szczeliniec Wielki I”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego stanowiska.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. referencyjne',
    hint: 'Jak w bazie monitoringu, np. „referencyjne”.',
    help: 'Typ stanowiska w sieci monitoringu, np. „referencyjne” – stanowisko o dobrze wykształconym siedlisku, służące za punkt odniesienia (karta z przewodnika: „referencyjne”). Jeśli nie wiesz, zostaw puste.',
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    defaultValue: 'Empetro-Vaccinietum',
    placeholder: 'np. Empetro-Vaccinietum',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. W Polsce siedlisko zawężono do jednego zespołu: Empetro-Vaccinietum (wysokogórskie borówczyska bażynowe). W Górach Stołowych na piaskowcowych półkach skalnych rośnie zbiorowisko z bażyną czarną, prawdopodobnie tożsame z Vaccinio-Empetretum nigri.

Uwaga: borówczysko czernicowe bez bażyny i borówki halnej (Vaccinietum myrtilli) to nie jest 4060 – sprawozdanie 2021 wskazuje sukcesję w tym kierunku jako główne zagrożenie.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Podłoże i położenie płatów, nachylenie, ekspozycja, dominanty, udział bażyny i borówki halnej, zagrożenia.',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• podłoże i forma: wychodnie i półki skalne (granit, piaskowiec), upłazy, kopuły torfowiskowe;
• nachylenie i ekspozycja, warunki atmosferyczne;
• dominujące krzewinki (borówka czarna, wrzos) i udział gatunków charakterystycznych (bażyna, borówka halna);
• kosodrzewina, wydeptywanie, sąsiedztwo szlaków.

Metodyka: stanowisko to grupa wyraźnie wyodrębnionych płatów rozwijających się w zbliżonych warunkach (torfowisko, wrzosowisko, upłazy skalne).`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Łączna powierzchnia płatów siedliska na stanowisku, w hektarach (karta z przewodnika: ok. 0,006 ha). Zwykle bardzo mała – kilka do kilkunastu arów; metodyka zaleca metody fotogrametryczne po weryfikacji płatów w terenie.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „Karkonoski Park Narodowy; PLH020006 Karkonosze”. Brak – „brak”.',
  }),
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. Karkonoski Park Narodowy',
    help: 'Kto zarządza terenem: park narodowy (Tatrzański, Karkonoski, Babiogórski, Bieszczadzki, Gór Stołowych), nadleśnictwo (Śnieżnik, Pilsko – rezerwaty). Prywatnych działek na stanowiskach 4060 nie ma (sprawozdanie 2016).',
  },
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Punkt 1', required: true, help: coordHelp('pierwszego płatu albo punktu') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Punkt 2', help: coordHelp('drugiego płatu albo punktu') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Punkt 3', help: coordHelp('trzeciego płatu albo punktu') },
  {
    kind: 'text',
    name: 'transect',
    label: 'Wymiary transektu',
    defaultValue: 'Niestandardowy na skutek rozproszenia płatów siedliska',
    required: true,
    hint: 'Zwykle niestandardowy – płaty są rozproszone.',
    help: `Metodyka: ze względu na rozmieszczenie siedliska badania na transektach rzadko są możliwe – zajmuje ono izolowane powierzchnie, rozmieszczone zgodnie z gradientem warunków abiotycznych, na stromych ścianach i zboczach uwarunkowane odsłonięciem skały. Jeśli wyznaczasz transekt, wpisz jego wymiary; jeśli nie – zostaw tekst domyślny (jak w karcie z przewodnika).`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    help: 'Wysokość nad poziomem morza, z GPS albo mapy; można wpisać zakres. Siedlisko rośnie powyżej górnej granicy lasu, w Górach Stołowych schodzi do ok. 870–910 m n.p.m. (karta z przewodnika: 1325 m n.p.m.).',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 24.07.2021',
    required: true,
    hint: 'Optymalnie od końca czerwca do połowy sierpnia.',
    help: `Dzień badań terenowych. Metodyka: raz w roku, między końcem czerwca a połową sierpnia, gdy trwa pełnia rozwoju krzewinek i bylin; cykl 3–6 lat (częściej przy bezpośrednim zagrożeniu, np. wydeptywaniu przy szlaku). Na torfowiskach – w okresach suchych (zwykle sierpień). W praktyce (2016, 2021) badano od 23 czerwca do 25 sierpnia.

Bezpieczeństwo: na upłazach skalnych przy nachyleniu powyżej 40° może być potrzebny sprzęt asekuracyjny (lina, uprząż, karabinki) i przeszkolenie.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const [, m, d] = v.split('-').map(Number)
      const ok = (m === 6 && d >= 20) || m === 7 || (m === 8 && d <= 15)
      return ok ? null : 'Termin poza optymalnym oknem metodyki (koniec czerwca – połowa sierpnia).'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcia fitosocjologiczne ----------

const r7120 = methodology7120.releves.fields
const layerField = (name: string, help: string, extra: Partial<FieldDef> = {}) => pickField(r7120, name, { help, ...extra })

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia fitosocjologicznego.' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach.' }),
  pickField(r7120, 'area', {
    defaultValue: 10,
    help: 'Powierzchnia zdjęcia w m². Metodyka: minimalnie 10 m², w uzasadnionych przypadkach mniej – na półkach skalnych nawet 3–4 m². W karcie z przewodnika 12–20 m².',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Na upłazach i półkach skalnych często 40–45° (karta Kopa).' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…, SW). Dla powierzchni płaskiej zostaw puste albo wpisz „brak”.' }),
  layerField('coverB', 'Warstwa B – krzewy: procent powierzchni zdjęcia pod kosodrzewiną, jarzębem, wierzbą śląską. Brak = 0 (siewki kosówki wpisuj w C, jak w karcie Kopa).', { groupCols: 3 }),
  layerField('coverC', 'Warstwa C – krzewinki i zielne: bażyna, borówki, wrzos, trawy, byliny. W borówczysku zwykle 60–100%.\n\nDlaczego: zwarcie krzewinek pokazuje, czy płat jest dobrze wykształcony.'),
  layerField('coverD', 'Warstwa D – mszysta: mchy, wątrobowce, torfowce i porosty naziemne. Od kilku procent na upłazach do 90% na torfowiskach – sama w sobie nie świadczy o stanie (sprawozdanie 2011).'),
  layerField('heightB', 'Warstwa B – typowa wysokość krzewów, w metrach. Brak warstwy – zostaw puste.'),
  layerField('heightC', 'Warstwa C – typowa wysokość krzewinek, w centymetrach (zwykle 10–40 cm).'),
  layerField('heightD', 'Warstwa D – typowa wysokość warstwy mszystej, w centymetrach.'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Empetro-Vaccinietum',
    help: 'Jednostka fitosocjologiczna zdjęcia, zwykle zespół Empetro-Vaccinietum.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki w zdjęciu z ilościowością w skali Braun-Blanqueta (r, +, 1–5): warstwa B – krzewy, C – krzewinki i zielne, D – mszaki i porosty. Warstwa podpowiada się sama po wyborze gatunku.',
  }),
]

export const methodology4060: Methodology = {
  code: '4060',
  name: 'Wysokogórskie borówczyska bażynowe (Empetro-Vaccinietum)',
  source:
    'Świerkosz K. 2012, 4060 Wysokogórskie borówczyska bażynowe (Empetro-Vaccinietum), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. II, GIOŚ, s. 247–256 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2009–2011, 2016 i 2021',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Wykonaj zdjęcia fitosocjologiczne w płatach siedliska – w karcie z przewodnika trzy. Powierzchnia minimalnie 10 m², na półkach skalnych nawet 3–4 m². Ilościowość w skali Braun-Blanqueta; warstwy B (krzewy), C (krzewinki i zielne), D (mszaki i porosty).',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Dłuższa perspektywa czasowa i szereg czynników, których negatywne oddziaływanie na siedlisko może się kumulować. Najpoważniejsze zagrożenia krótkofalowe to bezpośrednie oddziaływanie człowieka poprzez wydeptywanie płatów (lokalnie istotny problem); długofalowe – czynniki ponadlokalne, jak zanieczyszczenie powietrza powodujące eutrofizację płatów i fluktuacje klimatyczne.',
    help: `Weź pod uwagę: bliskość szlaków i punktów widokowych (wydeptywanie, eutrofizacja, wkraczanie gatunków synantropijnych), wspinaczkę, sukcesję w stronę borówczyska czernicowego albo zarośli kosodrzewiny, ocieplenie klimatu, presję jeleni (Równia pod Śnieżką).

Praktyka 2021: stanowiska leżą w ochronie ścisłej parków narodowych i rezerwatów, więc o ocenie perspektyw decydowała zwykle ocena struktury; Śnieżnik dostał FV zamiast U1 z powodu planowanej kanalizacji ruchu turystycznego. Metody ochrony: ochrona ścisła dobrze wykształconych płatów, odsuwanie lub grodzenie szlaków, unikanie tras zjazdowych przez płaty.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Zauważalne są tendencje, które mogą w przyszłości prowadzić do spadku powierzchni siedliska lub zaburzeń jego struktury i funkcji',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających (np. sukcesja wtórna), nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'C01', name: 'Kopalnie, wydobywanie surowców' },
    { code: 'C01.01', name: 'Wydobywanie piasku i żwiru' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'E01.03', name: 'Zabudowa rozproszona' },
    { code: 'E01.04', name: 'Inne typy zabudowy' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.04', name: 'Turystyka górska, wspinaczka, speleologia' },
    { code: 'G01.04.01', name: 'Wspinaczka górska i skałkowa' },
    { code: 'G01.06', name: 'Narciarstwo, narciarstwo pozatrasowe' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'H04', name: 'Zanieczyszczenie powietrza, zanieczyszczenia transportowane drogą powietrzną' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'K02.03', name: 'Eutrofizacja (naturalna)' },
    { code: 'K04.01', name: 'Konkurencja' },
    { code: 'K04.05', name: 'Szkody spowodowane przez roślinożerców (w tym przez zwierzynę łowną)' },
    { code: 'L04', name: 'Lawiny' },
    { code: 'M01', name: 'Zmiany warunków abiotycznych' },
    { code: 'M01.01', name: 'Zmiany temperatury (np. wzrost temperatury, ekstremalne temperatury)' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: [
    ...methodology7120.otherFields.flatMap((f): FieldDef[] => {
      if (f.name === 'otherValues')
        return [
          {
            ...f,
            hint: 'Np. sąsiedztwo 4070, 6150, 7110; gatunki chronione.',
            help: 'Wartości przyrodnicze stanowiska poza samym borówczyskiem: sąsiednie siedliska (zarośla kosodrzewiny 4070, acydofilne murawy alpejskie 6150, torfowiska wysokie 7110), gatunki chronione i endemity (karta Kopa: gnidosz sudecki Pedicularis sudetica, dzwonek karkonoski Campanula bohemica, czosnek syberyjski Allium sibiricum). Brak – „Nie stwierdzono”.',
          },
        ]
      if (f.name === 'conservation')
        return [
          {
            ...f,
            help: 'Jakie działania ochronne wykonano i z jakim skutkiem oraz co proponujesz. Dla dobrze wykształconych płatów właściwa jest ochrona bierna (ścisła). Inne: odsunięcie lub ogrodzenie szlaku (Równia pod Śnieżką – siatki), kanalizacja ruchu turystycznego, usuwanie śmieci i pozostałości budowli, unikanie tras zjazdowych przez płaty. Karta z przewodnika: „Nie wymagane. Propozycje: ochrona bierna.”',
          },
        ]
      if (f.name === 'notes')
        return [
          {
            kind: 'number',
            name: 'shareFV',
            group: 'Udział powierzchni siedliska w stanie FV / U1 / U2',
            label: 'Udział powierzchni siedliska w stanie FV',
            unit: '%',
            min: 0,
            max: 100,
            help: 'Karta z przewodnika podaje przy ocenie ogólnej udział powierzchni siedliska o różnym stanie zachowania (Kopa: FV 100%, U1 0%, U2 0%). Trzy liczby powinny dać razem 100%.',
          },
          { kind: 'number', name: 'shareU1', group: 'Udział powierzchni siedliska w stanie FV / U1 / U2', label: 'Udział powierzchni siedliska w stanie U1', unit: '%', min: 0, max: 100, help: 'Procent powierzchni siedliska na stanowisku w stanie niezadowalającym (U1).' },
          { kind: 'number', name: 'shareU2', group: 'Udział powierzchni siedliska w stanie FV / U1 / U2', label: 'Udział powierzchni siedliska w stanie U2', unit: '%', min: 0, max: 100, help: 'Procent powierzchni siedliska na stanowisku w stanie złym (U2).' },
          f,
        ]
      return [f]
    }),
  ],

  speciesCatalog: SPECIES_4060.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer4060(s) })),
  speciesInfo: (name) => {
    const e = findSpecies4060(name)
    return e ? GROUP_LABELS_4060[e.group] : undefined
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator4060 = (id: string): IndicatorDef => {
  const i = methodology4060.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 4060`)
  return i
}
