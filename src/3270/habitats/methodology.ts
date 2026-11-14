// Metodyka 3270 (zalewane muliste brzegi rzek, Bidention tripartiti p.p. i Chenopodion rubri p.p.) jako dane.
// Źródło: Nobis A. 2015, „3270 Zalewane muliste brzegi rzek” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych.
// Przewodnik metodyczny, cz. IV, GIOŚ, Biblioteka Monitoringu Środowiska, s. 141–152 (tab. 1 i 2, przykładowa karta
// Sandomierz 2013), z praktyką ocen ze sprawozdań z monitoringu 2013–2014, 2016 i 2023–2024 (metodyki nie zmieniano:
// 6 wskaźników struktury, 3 kardynalne).
//
// Siedlisko efemeryczne: jednoroczne zbiorowiska na odsłoniętych namuliskach, rozwijają się po opadnięciu wody, najlepiej
// we wrześniu–październiku, a w mokre lata nie rozwijają się wcale. Metoda transektu nie jest stosowana – stanowisko to
// grupa małych płatów albo pas kilkunastu–kilkudziesięciu metrów, z 3 zdjęciami (1–10 m²) w najbardziej typowych płatach.
// Przy wysokim stanie wody sprawozdania 2021 i 2023–2024 dają XX wskaźnikom i powierzchni (perspektywy oceniane normalnie) –
// formularz podpowiada to samo z pola „Stan wody w rzece”.
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology, SelectOption, SpeciesRow } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { fmt, labelOf, pickField, plNum, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_3270,
  SPECIES_3270,
  defaultLayer3270,
  findSpecies3270,
  isCharacteristic3270,
  isTypical3270,
  speciesKey3270,
} from './species'

// ---------- progi liczbowe (tab. 2) ----------

/** Gatunki charakterystyczne: więcej niż 4 FV, 3–4 U1, mniej niż 3 U2. */
export const gradeCharacteristic3270 = (n: number): Grade => (n > 4 ? 'FV' : n >= 3 ? 'U1' : 'U2')
/** Obce gatunki inwazyjne – łączne pokrycie: ≤25% FV (brak albo „nie więcej niż 25%”), 25–50% U1, >50% U2. */
export const gradeInvasive3270 = (pct: number): Grade => (pct <= 25 ? 'FV' : pct <= 50 ? 'U1' : 'U2')
/** Rodzime ekspansywne – łączne pokrycie: ≤10% FV, 10–25% U1, >25% U2 („przekracza 25%”). */
export const gradeExpansive3270 = (pct: number): Grade => (pct <= 10 ? 'FV' : pct <= 25 ? 'U1' : 'U2')
/** Udział dobrze zachowanych płatów: ≥80% FV, 50–79% U1, <50% U2. */
export const gradeWellPreserved3270 = (pct: number): Grade => (pct >= 80 ? 'FV' : pct >= 50 ? 'U1' : 'U2')
/** Odległość między płatami: ≤5 m FV („nie większe niż 5 m”), 5–10 m U1, ≥10 m U2 („co najmniej 10 m”). */
export const gradeDistance3270 = (m: number): Grade => (m <= 5 ? 'FV' : m < 10 ? 'U1' : 'U2')

// ---------- stan wody (praktyka 2021–2024: XX przy zalanych namuliskach) ----------

export const WATER_LEVEL: SelectOption[] = [
  { value: 'low', label: 'Niski – namuliska odsłonięte, siedlisko wykształcone' },
  { value: 'medium', label: 'Średni – namuliska częściowo zalane, siedlisko wykształcone słabiej' },
  { value: 'high', label: 'Wysoki – namuliska zalane, siedlisko się nie wykształciło (ocena niemożliwa)' },
]

/** Siedlisko nie wykształciło się przez wysoki stan wody – wskaźniki i powierzchnia dostają XX (sprawozdania 2021, 2023–2024). */
export const isHighWater = (ctx?: IndicatorContext) => ctx?.site?.waterLevel === 'high'
const HIGH_WATER_NOTE = 'Wysoki stan wody – siedlisko się nie wykształciło, wskaźnika nie da się ocenić (XX, jak w sprawozdaniach 2021 i 2023–2024).'

/** Opakowanie podpowiedzi: przy wysokiej wodzie XX, inaczej podpowiedź wskaźnika. */
const unlessHighWater =
  (fn: (i: InputValues, ctx?: IndicatorContext) => Grade | null) =>
  (i: InputValues, ctx?: IndicatorContext): Grade | null =>
    isHighWater(ctx) ? 'XX' : fn(i, ctx)
const explainUnlessHighWater =
  (fn?: (i: InputValues, ctx?: IndicatorContext) => string | null) =>
  (i: InputValues, ctx?: IndicatorContext): string | null =>
    isHighWater(ctx) ? HIGH_WATER_NOTE : (fn?.(i, ctx) ?? null)

const RIVER_REGULATION: SelectOption[] = [
  { value: 'none', label: 'Nieuregulowane' },
  { value: 'slight', label: 'Uregulowane nieznacznie' },
  { value: 'moderate', label: 'Uregulowane umiarkowanie (ostrogi, opaski na części odcinka)' },
  { value: 'strong', label: 'Silnie uregulowane (prostowanie, profilowanie, umocnione brzegi)' },
]

// ---------- gatunki ----------

const named = (value: unknown): SpeciesRow[] => speciesRows(value).filter((r) => r.name?.trim())
const unique = (names: string[]) => [...new Map(names.map((n) => [speciesKey3270(n), n])).values()]
const sum = (rows: SpeciesRow[]) => {
  const covers = rows.map((r) => num(r.cover)).filter((v): v is number => v !== undefined)
  return covers.length ? Math.round(covers.reduce((a, b) => a + b, 0) * 10) / 10 : undefined
}

/** Gatunki charakterystyczne z listy (tab. 1 + lokalne, synonimy raz) i liczba wpisana wprost. */
export function characteristicCount3270(i: InputValues): { count?: number; fromList: string[]; outside: string[]; typed?: number } {
  const rows = named(i.species)
  const fromList = unique(rows.map((r) => r.name.trim()).filter(isCharacteristic3270))
  const outside = rows.map((r) => r.name.trim()).filter((n) => !isCharacteristic3270(n))
  const typed = num(i.count)
  return { count: typed ?? (rows.length ? fromList.length : undefined), fromList, outside, typed }
}

/** Gatunki dominujące: typowe vs ekspansywne / ekologicznie obce (tab. 2 jest opisowa – interpretacja w specyfikacji). */
export function dominance3270(i: InputValues): { grade: Grade | null; reason: string } {
  const rows = named(i.species)
  if (!rows.length) return { grade: null, reason: '' }
  const typical = rows.filter((r) => isTypical3270(r.name))
  const foreign = rows.filter((r) => !isTypical3270(r.name))
  const unknown = foreign.filter((r) => !findSpecies3270(r.name)).map((r) => r.name.trim())
  const tail = unknown.length ? ` Spoza katalogu (liczone jako obce dla siedliska): ${unknown.join(', ')}.` : ''
  if (!foreign.length) return { grade: 'FV', reason: `Dominują wyłącznie gatunki typowe dla siedliska (${typical.length}).` }
  if (!typical.length)
    return { grade: 'U2', reason: `Wśród dominantów wyłącznie gatunki ekspansywne lub ekologicznie obce: ${describeSpecies(foreign)}.${tail}` }
  return { grade: 'U1', reason: `Wśród dominantów obok typowych są ekspansywne lub ekologicznie obce: ${describeSpecies(foreign)}.${tail}` }
}

// ---------- powierzchnia ----------

const AREA_TREND: GradedOption[] = [
  { value: 'increase', label: 'Zwiększa się', grade: 'FV' },
  { value: 'stable', label: 'Nie podlega zmianom', grade: 'FV' },
  { value: 'natural', label: 'Zmniejszenie wynikające wyłącznie z czynników naturalnych (stan wody, powódź)', grade: 'FV' },
  { value: 'decrease', label: 'Nieznaczne zmniejszenie wynikające z działania czynników antropogenicznych', grade: 'U1' },
  { value: 'strongDecrease', label: 'Wyraźne zmniejszenie wynikające z działania czynników antropogenicznych', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]

// ---------- struktura przestrzenna ----------

const SPATIAL: GradedOption[] = [
  { value: 'continuous', label: 'Brak fragmentacji – roślinność typowa dla siedliska tworzy ciągły pas', grade: 'FV' },
  {
    value: 'natural',
    label: 'Mała fragmentacja, wynikająca głównie z czynników naturalnych; odległości między płatami nie większe niż 5 m',
    grade: 'FV',
  },
  {
    value: 'partial',
    label: 'Częściowa fragmentacja; odległości między płatami 5–10 m, fragmentacja przynajmniej częściowo antropogeniczna',
    grade: 'U1',
  },
  {
    value: 'strong',
    label: 'Duży stopień fragmentacji – nieliczne, niewielkie (zwykle do 2 m²) płaty oddalone o co najmniej 10 m, fragmentacja antropogeniczna',
    grade: 'U2',
  },
]

const FRAGMENTATION_CAUSE: SelectOption[] = [
  { value: 'natural', label: 'Czynniki naturalne (charakter siedliska, przebieg brzegu, stan wody)' },
  { value: 'mixed', label: 'Częściowo czynniki antropogeniczne' },
  { value: 'anthropogenic', label: 'Głównie czynniki antropogeniczne (regulacja koryta, pobór piasku, penetracja)' },
]

// ---------- wskaźniki ----------

const SPECIES_COVER_HELP = 'Pokrycie podawaj jako przybliżone średnie pokrycie gatunku we wszystkich obserwowanych płatach siedliska na stanowisku (w %). Dla „<1%” wpisz 0,5.'

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska',
    parameter: 'area',
    description:
      'Zmiana powierzchni siedliska na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi publikowanymi. Obniża ocenę tylko zmniejszenie wynikające z działania czynników antropogenicznych.',
    help: `Co wybrać: jak zmieniła się powierzchnia płatów siedliska od poprzedniego badania (albo względem danych publikowanych). Nie zmienia się albo rośnie – FV. Zmniejszyła się nieznacznie przez działalność człowieka (regulacja, ostrogi, umacnianie brzegu) – U1, wyraźnie – U2. Pierwsze badanie bez danych do porównania – XX.

Zmniejszenie z przyczyn naturalnych: powierzchnia 3270 skacze z roku na rok razem ze stanem wody – tab. 2 wiąże U1 i U2 wyłącznie z czynnikami antropogenicznymi, więc spadek tylko przez wodę formularz liczy jako FV (interpretacja; sprawozdanie 2016 zwraca uwagę, że zmiany powierzchni mają tu „niewielki walor diagnostyczny”).

Gdy w polu „Stan wody w rzece” wybierzesz wysoki stan (namuliska zalane) – podpowiedź XX, jak w sprawozdaniach 2021 i 2023–2024.

Praktyka 2023–2024: Radomyśl nad Sanem (mocno uregulowane koryto, mała powierzchnia mimo sprzyjającej pogody) – U1; Krzeszów (koryto mocno uregulowane) i Nad Wartą (prostowanie i profilowanie, brak namulisk) – U2.

Powierzchnię płatów wpisz poniżej (ha albo m²) – trafi do pola „wartość”. W przykładzie z przewodnika: 0,02 ha, FV.`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się',
      U1: 'Nieznaczne zmniejszenie powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi publikowanymi, zmniejszenie powierzchni wynikające z działania czynników antropogenicznych',
      U2: 'Wyraźne zmniejszenie powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi publikowanymi, zmniejszenie powierzchni wynikające z działania czynników antropogenicznych',
    },
    inputs: [
      {
        kind: 'select',
        name: 'trend',
        label: 'Zmiana powierzchni',
        options: AREA_TREND.map(({ value, label }) => ({ value, label })),
        help: 'Kierunek zmiany powierzchni płatów siedliska od poprzedniego badania i jej przyczyna. Zostaw puste, gdy ocenę wystawiasz sam (np. przepisując starą kartę).',
      },
      {
        kind: 'number',
        name: 'areaHa',
        label: 'Powierzchnia płatów',
        unit: 'ha',
        min: 0,
        help: 'Łączna powierzchnia płatów siedliska na stanowisku, w hektarach (0,02 ha = 200 m²). Płaty mają zwykle 1–10 m², sporadycznie kilkadziesiąt m² – zsumuj je albo oszacuj z długości i szerokości pasa.',
      },
    ],
    suggest: unlessHighWater((i) => AREA_TREND.find((o) => o.value === i.trend)?.grade ?? null),
    explain: explainUnlessHighWater(),
    describe: (i) => {
      const a = num(i.areaHa)
      const t = i.trend ? labelOf(AREA_TREND, i.trend).toLowerCase() : ''
      return [a !== undefined ? `${plNum(a)} ha` : '', t].filter(Boolean).join(', ')
    },
  },
  {
    id: 'spatial',
    label: 'Struktura przestrzenna płatów siedliska',
    parameter: 'structure',
    description:
      'Określenie stopnia fragmentacji siedliska. Jeśli wiadomo, że fragmentacja siedliska na stanowisku jest wynikiem działania czynników naturalnych, a nie antropogenicznych, należy to zaznaczyć w opisie wskaźnika.',
    help: `Co wybrać: jak rozłożone są płaty roślinności typowej dla 3270 wzdłuż brzegu i co je rozdziela.
• Ciągły pas albo mała fragmentacja z przyczyn naturalnych (np. wtrącone płaty zbiorowisk naturalnych, ale nietypowych dla 3270), odległości między płatami typowymi nie większe niż 5 m – FV.
• Częściowa fragmentacja, odległości 5–10 m, przynajmniej częściowo przez człowieka – U1.
• Nieliczne, niewielkie (zwykle do 2 m²) płaty, oddalone o co najmniej 10 m, fragmentacja antropogeniczna – U2.

Odległość między płatami (m) i przyczyna fragmentacji są opcjonalne: odległość podpowie klasę, gdy nic nie wybierzesz, a przy rozjeździe z wyborem formularz ostrzeże (5 m – FV, 10 m – U2, tak jak w tab. 2). Fragmentacja wyłącznie naturalna przy wyborze U1/U2 też da ostrzeżenie – metodyka wiąże niższe oceny z czynnikami antropogenicznymi.

„Powierzchnia zajęta przez siedlisko na transekcie” – w przykładowej karcie (80%) stoi przy tym wskaźniku bez osobnej oceny. Pole jest opcjonalne i trafia do opisu.

Praktyka 2023–2024: U1 przy znacznym uregulowaniu koryta i silnej penetracji (pobór piasku), U2 przy fragmentacji głównie antropogenicznej; XX przy zbyt wysokiej wodzie (11 z 33 stanowisk).`,
    thresholds: {
      FV: 'Brak fragmentacji siedliska na stanowisku (roślinność typowa dla siedliska tworzy ciągły pas) lub mała fragmentacja siedliska wynikająca głównie z działania czynników naturalnych (np. obecności płatów zbiorowisk naturalnych, ale nietypowych dla siedliska 3270; odległości między płatami zbiorowisk typowych dla siedliska nie większe niż 5 m)',
      U1: 'Częściowa fragmentacja siedliska; odległości między płatami siedliska wynoszą od 5 do 10 m, fragmentacja przynajmniej częściowo jest spowodowana czynnikami antropogenicznymi',
      U2: 'Duży stopień fragmentacji – na stanowisku obecne są nieliczne, niewielkie (zwykle do 2 m²) płaty siedliska mocno izolowane (oddalone od siebie o co najmniej 10 m), fragmentacja wynika z działania czynników antropogenicznych',
    },
    inputs: [
      {
        kind: 'select',
        name: 'choice',
        label: 'Rozmieszczenie płatów',
        options: SPATIAL.map(({ value, label }) => ({ value, label })),
        help: `Wybierz opis najbliższy temu, co widać na stanowisku:\n${SPATIAL.map((o) => `• ${o.label} – ${o.grade}`).join(',\n')}.\n\nPełne wyjaśnienie wskaźnika jest pod „?” przy jego nazwie.`,
      },
      {
        kind: 'number',
        name: 'distance',
        label: 'Typowa odległość między płatami (opcjonalnie)',
        unit: 'm',
        min: 0,
        help: 'Typowa odległość między płatami zbiorowisk typowych dla 3270, w metrach. Ciągły pas – 0. Opcjonalne – sprawdza wybór powyżej.',
      },
      {
        kind: 'select',
        name: 'cause',
        label: 'Przyczyna fragmentacji (opcjonalnie)',
        options: FRAGMENTATION_CAUSE,
        help: 'Co rozdziela płaty: naturalny przebieg brzegu i stan wody, czy regulacja koryta (ostrogi, opaski, profilowanie), pobór piasku, wydeptywanie. Metodyka prosi, by zaznaczyć, gdy fragmentacja jest naturalna.',
      },
      {
        kind: 'number',
        name: 'transectShare',
        label: 'Powierzchnia zajęta przez siedlisko na transekcie (opcjonalnie)',
        unit: '%',
        min: 0,
        max: 100,
        help: 'Procent powierzchni zajęty przez siedlisko w obrębie badanego odcinka brzegu (w przykładowej karcie 80%). Bez progów w tab. 2 – tylko informacja do opisu.',
      },
      {
        kind: 'textarea',
        name: 'note',
        label: 'Opis struktury',
        rows: 2,
        help: 'Krótki opis fragmentacji: ciągły pas czy płaty, co je rozdziela, czy fragmentacja jest naturalna. Trafia do pola „wartość” karty.',
      },
    ],
    suggest: unlessHighWater((i) => {
      const chosen = SPATIAL.find((o) => o.value === i.choice)?.grade
      if (chosen) return chosen
      const d = num(i.distance)
      return d === undefined ? null : gradeDistance3270(d)
    }),
    explain: explainUnlessHighWater((i) => {
      const d = num(i.distance)
      return !i.choice && d !== undefined ? `Odległość ${plNum(d)} m – klasa ${gradeDistance3270(d)} (wybierz opis, żeby potwierdzić).` : null
    }),
    warn: (i) => {
      const chosen = SPATIAL.find((o) => o.value === i.choice)
      if (!chosen) return null
      const d = num(i.distance)
      if (d !== undefined && gradeDistance3270(d) !== chosen.grade)
        return `Odległość ${plNum(d)} m to w tab. 2 klasa ${gradeDistance3270(d)}, a wybrano ${chosen.grade}. Sprawdź wybór.`
      if (i.cause === 'natural' && chosen.grade !== 'FV')
        return 'Fragmentacja wyłącznie naturalna – tab. 2 daje U1/U2 tylko przy udziale czynników antropogenicznych. Sprawdź wybór.'
      return null
    },
    describe: (i) => {
      const note = String(i.note ?? '').trim()
      const share = num(i.transectShare)
      const d = num(i.distance)
      return [
        note.replace(/\.$/, '') || labelOf(SPATIAL, i.choice),
        d !== undefined ? `odległości między płatami ok. ${plNum(d)} m` : '',
        i.cause ? `przyczyna: ${labelOf(FRAGMENTATION_CAUSE, i.cause).split(' (')[0].toLowerCase()}` : '',
        share !== undefined ? `powierzchnia zajęta przez siedlisko na transekcie ${fmt(share)}` : '',
      ]
        .filter(Boolean)
        .join('; ')
    },
  },
  {
    id: 'characteristic',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków charakterystycznych dla związków Bidention tripartiti, Chenopodion fluviatile i Nanocyperion występujących na monitorowanym stanowisku, z pokryciem w procentach. Wskaźnik pomaga w ocenie stopnia zachowania siedliska na stanowisku.',
    help: `Co wpisać: wszystkie gatunki charakterystyczne stwierdzone na stanowisku, z przybliżonym średnim pokryciem w płatach. Formularz liczy gatunki z listy tab. 1 (synonimy – np. Persicaria / Polygonum, Oxybasis / Chenopodium – raz):
wyczyniec czerwonożółty Alopecurus aequalis, uczep trójlistkowy Bidens tripartita, uczep zwisły B. cernua, komosa jesienna Chenopodium ficifolium, k. wielonasienna Ch. polyspermum, k. czerwona Ch. rubrum, rdest ostrogorzki Polygonum hydropiper, r. szczawiolistny P. lapathifolium s.l., r. mniejszy P. minus, jaskier jadowity Ranunculus sceleratus, rzepicha błotna Rorippa palustris, łoboda oszczepowata Atriplex prostrata, komosa sina Chenopodium glaucum, rdest ziemnowodny Polygonum amphibium, szczaw nadmorski Rumex maritimus, cibora brunatna Cyperus fuscus, szarota błotna Gnaphalium uliginosum, sit dwudzielny Juncus bufonius, namulnik brzegowy Limosella aquatica, babka wielonasienna Plantago intermedia, pięciornik niski Potentilla supina.
Lokalnie charakterystyczne (też się liczą): uczep śląski Bidens radiata (zachód), komosa ostroklapowa Chenopodium acerifolium (północny wschód).

Nie liczą się: chwastnica jednostronna Echinochloa crus-galli (stały, ale nie charakterystyczny składnik), uczep amerykański Bidens frondosa (gatunek inwazyjny – wpisz go w „Obcych gatunkach inwazyjnych”, choć to także gatunek Chenopodion fluviatile; sprawozdanie 2013–2014 zgłasza ten problem).

Progi: więcej niż 4 gatunki – FV, 3–4 – U1, mniej niż 3 – U2. Możesz wpisać liczbę wprost – ma pierwszeństwo przed listą (formularz ostrzeże o rozjeździe).

Praktyka 2023–2024: Stare Miasto – 4 gatunki, U1; Rakowo Czachy – pojedynczo uczep trójlistkowy i rzepicha (2 gatunki), U2. Przykład z przewodnika: 16 gatunków, FV.

${SPECIES_COVER_HELP} Pokrycie „<5%” z przykładowej karty zostaw puste i dopisz w opisie.`,
    thresholds: {
      FV: 'Na stanowisku występuje więcej niż 4 gatunki charakterystyczne dla siedliska',
      U1: 'Na stanowisku występuje 3–4 gatunki charakterystyczne dla siedliska',
      U2: 'Na stanowisku występuje mniej niż 3 gatunki charakterystyczne dla siedliska',
    },
    inputs: [
      speciesInput('Gatunki charakterystyczne', 'Gatunki charakterystyczne z tab. 1 z przybliżonym średnim pokryciem w płatach siedliska na stanowisku.'),
      {
        kind: 'number',
        name: 'count',
        label: 'Liczba gatunków wprost (opcjonalnie)',
        min: 0,
        help: 'Gdy nie wpisujesz listy albo ekspert liczył inaczej – liczba gatunków charakterystycznych. Ma pierwszeństwo przed listą.',
      },
      {
        kind: 'textarea',
        name: 'note',
        label: 'Uwagi do składu',
        rows: 2,
        help: 'Np. udział gatunków upraw okopowych (chwastnica, maruna, żółtlica), gatunki o pokryciu „<5%”. Trafia na koniec pola „wartość”.',
      },
    ],
    suggest: unlessHighWater((i) => {
      const { count } = characteristicCount3270(i)
      return count === undefined ? null : gradeCharacteristic3270(count)
    }),
    explain: explainUnlessHighWater((i) => {
      const { fromList, typed } = characteristicCount3270(i)
      if (!named(i.species).length && typed === undefined) return null
      const head = `Gatunków charakterystycznych z tab. 1 na liście: ${fromList.length}.`
      return typed !== undefined ? `${head} Wpisano wprost: ${typed} – ma pierwszeństwo.` : head
    }),
    warn: (i) => {
      const { fromList, outside, typed } = characteristicCount3270(i)
      const parts = [
        outside.length ? `Spoza listy tab. 1 (nie liczą się): ${outside.join(', ')}.` : '',
        typed !== undefined && named(i.species).length && typed !== fromList.length
          ? `Z listy byłoby ${fromList.length} (${gradeCharacteristic3270(fromList.length)}), a wpisano ${typed} (${gradeCharacteristic3270(typed)}).`
          : '',
      ].filter(Boolean)
      return parts.length ? parts.join(' ') : null
    },
    describe: (i) => {
      const list = describeSpecies(named(i.species))
      const typed = num(i.count)
      const note = String(i.note ?? '').trim()
      return [typed !== undefined ? `${typed} gatunków charakterystycznych` : '', list, note].filter(Boolean).join('; ')
    },
  },
  {
    id: 'dominant',
    label: 'Gatunki dominujące',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków, które osiągają największe pokrycie w obrębie płatów monitorowanego siedliska na danym stanowisku, wraz z ich pokryciem. Stan zachowania jest właściwy, gdy dominują w nim gatunki typowe dla siedliska.',
    help: `Co wpisać: kilka gatunków o największym pokryciu w płatach (w przykładzie z przewodnika: komosa czerwona 30–40%, rdest szczawiolistny do 60%).

Jak liczy formularz (tab. 2 jest opisowa – interpretacja):
• wszystkie dominanty typowe dla siedliska (gatunki charakterystyczne, lokalnie charakterystyczne, chwastnica jednostronna – „stały udział”) – FV;
• wśród dominantów są i typowe, i ekspansywne albo ekologicznie obce – U1;
• dominują wyłącznie gatunki ekspansywne albo ekologicznie obce – U2.
Ekspansywne: mozga trzcinowata, trzcina, mietlica rozłogowa. Ekologicznie obce: gatunki inwazyjne i wszystko spoza zbiorowisk namuliskowych (ruderalne, łąkowe, szuwarowe, siewki drzew). Gatunek spoza katalogu liczy się jako obcy – formularz to pokaże.

Gdy nie da się wskazać jednego dominanta dla całego stanowiska, wpisz dominanty poszczególnych płatów (tak jak w przykładowej karcie) i opisz to w uwagach.

Praktyka 2023–2024: niższe oceny głównie przez dominację mozgi trzcinowatej Phalaris arundinacea; w 2016 r. także Conyza canadensis, Eragrostis albensis, Lythrum salicaria, Agrostis stolonifera.`,
    thresholds: {
      FV: 'Na stanowisku dominują gatunki charakterystyczne dla siedliska',
      U1: 'Wśród dominantów obecne zarówno gatunki typowe dla siedliska, jak i ekspansywne lub ekologicznie obce dla siedliska',
      U2: 'Wśród dominantów obecne wyłącznie gatunki ekspansywne lub ekologicznie obce dla siedliska',
    },
    inputs: [
      speciesInput('Gatunki dominujące', `Gatunki o największym pokryciu w płatach siedliska. ${SPECIES_COVER_HELP}`),
      {
        kind: 'textarea',
        name: 'note',
        label: 'Opis dominacji',
        rows: 2,
        help: 'Np. „Nie można wskazać jednego dominanta w obrębie całego stanowiska; w niektórych płatach zwiększone pokrycie…”. Gdy wpiszesz opis, to on trafia do pola „wartość”, a lista dominantów na jego koniec.',
      },
    ],
    suggest: unlessHighWater((i) => dominance3270(i).grade),
    explain: explainUnlessHighWater((i) => dominance3270(i).reason || null),
    describe: (i) => {
      const list = describeSpecies(named(i.species))
      const note = String(i.note ?? '').trim()
      return note ? [note, list ? `Dominanty: ${list}` : ''].filter(Boolean).join(' ') : list
    },
  },
  {
    id: 'invasive',
    label: 'Obce gatunki inwazyjne',
    parameter: 'structure',
    description:
      'Lista gatunków obcych geograficznie obserwowanych w obrębie płatów monitorowanego siedliska wraz z ich pokryciem. Na ocenę wpływa obfitość występowania poszczególnych gatunków inwazyjnych.',
    help: `Co wpisać: obce gatunki inwazyjne w płatach siedliska z przybliżonym średnim pokryciem. Najważniejsze dla 3270 (tab. 1): uczep amerykański Bidens frondosa, miłka połabska Eragrostis albensis, kolczurka klapowana Echinocystis lobata, niecierpek gruczołowaty Impatiens glandulifera, rzepienie Xanthium albinum, X. spinosum, X. strumarium. W sprawozdaniach często też nawłoć późna, przymiotno kanadyjskie, klon jesionolistny, żółtlice. Brak – zostaw listę pustą.

Progi (suma pokrycia): brak albo nie więcej niż 25% powierzchni siedliska – FV, 25–50% – U1, więcej niż 50% – U2.

Uwaga z przewodnika: w odróżnieniu od wielu innych siedlisk obecność gatunków inwazyjnych nie jest tu dużym zagrożeniem – zbiorowiska są niszczone przez wysoką wodę jesienią i odtwarzają się co roku od nowa. Uczep amerykański występuje na prawie 90% stanowisk.

Przykład z przewodnika: rzepień włoski, miłka połabska, uczep amerykański po ok. 1% – FV.`,
    thresholds: {
      FV: 'Brak gatunków inwazyjnych lub gatunki inwazyjne obecne, ale zajmują one nie więcej niż 25% powierzchni siedliska',
      U1: 'Obecne na stanowisku gatunki inwazyjne zajmują 25–50% powierzchni siedliska',
      U2: 'Obecne na stanowisku gatunki inwazyjne zajmują więcej niż 50% powierzchni siedliska',
    },
    inputs: [speciesInput('Obce gatunki inwazyjne', `Gatunki obce z pokryciem. Brak – zostaw pustą listę. ${SPECIES_COVER_HELP}`)],
    suggest: unlessHighWater((i) => {
      const rows = named(i.species)
      if (!rows.length) return 'FV'
      const total = sum(rows)
      return total === undefined ? null : gradeInvasive3270(total)
    }),
    explain: explainUnlessHighWater((i) => {
      const rows = named(i.species)
      return rows.length ? `Gatunków: ${rows.length}, łączne pokrycie ${fmt(sum(rows))}.` : null
    }),
    warn: (i) => {
      const odd = named(i.species)
        .filter((r) => {
          const g = findSpecies3270(r.name)?.group
          return g !== undefined && g !== 'invasive'
        })
        .map((r) => r.name.trim())
      return odd.length ? `W katalogu nie są obcymi inwazyjnymi: ${odd.join(', ')}. Sprawdź, czy to nie pomyłka.` : null
    },
    describe: (i) => describeSpecies(named(i.species)) || 'Brak',
  },
  {
    id: 'expansive',
    label: 'Gatunki ekspansywne roślin zielnych',
    parameter: 'structure',
    description:
      'Lista rodzimych gatunków rozprzestrzeniających się w siedlisku i mogących stanowić dla niego zagrożenie, wraz z szacunkowym pokryciem w obrębie płatów monitorowanego siedliska.',
    help: `Co wpisać: rodzime gatunki ekspansywne w płatach siedliska z łącznym szacunkowym pokryciem. Głównie mozga trzcinowata Phalaris arundinacea i trzcina pospolita Phragmites australis – opanowują odsłonięte podłoże, gdy przez kilka lat sumy opadów są niskie, a poziom wody stale obniżony; w sprawozdaniu 2016 także mietlica rozłogowa. Brak – zostaw listę pustą.

Progi (suma pokrycia): brak albo nie więcej niż 10% powierzchni siedliska – FV, 10–25% – U1, więcej niż 25% – U2.

Praktyka 2023–2024: U1 zwykle przez mozgę trzcinowatą na 15–20% powierzchni, U2 przy bardzo dużym pokryciu mozgi i trzciny.`,
    thresholds: {
      FV: 'Brak gatunków ekspansywnych lub gatunki ekspansywne obecne, ale zajmują one nie więcej niż 10% powierzchni siedliska',
      U1: 'Obecne na stanowisku gatunki ekspansywne zajmują 10–25% powierzchni siedliska',
      U2: 'Łączne pokrycie osobników gatunków ekspansywnych przekracza 25% powierzchni siedliska na stanowisku',
    },
    inputs: [speciesInput('Gatunki ekspansywne', `Rodzime gatunki ekspansywne z pokryciem. Brak – zostaw pustą listę. ${SPECIES_COVER_HELP}`)],
    suggest: unlessHighWater((i) => {
      const rows = named(i.species)
      if (!rows.length) return 'FV'
      const total = sum(rows)
      return total === undefined ? null : gradeExpansive3270(total)
    }),
    explain: explainUnlessHighWater((i) => {
      const rows = named(i.species)
      return rows.length ? `Gatunków: ${rows.length}, łączne pokrycie ${fmt(sum(rows))}.` : null
    }),
    describe: (i) => describeSpecies(named(i.species)) || 'Brak',
  },
  {
    id: 'wellPreserved',
    label: 'Udział dobrze zachowanych płatów siedliska',
    parameter: 'structure',
    cardinal: true,
    description:
      'Oszacowanie wielkości powierzchni, jaką zajmują dobrze wykształcone, typowe płaty siedliska, i ich udział na monitorowanym stanowisku w porównaniu do wielkości powierzchni płatów przejściowych, nietypowych, z udziałem gatunków ekspansywnych itp.',
    help: `Co wpisać: jaki procent powierzchni siedliska na stanowisku zajmują płaty dobrze zachowane – typowe, z kompletem gatunków charakterystycznych, bez wyraźnego udziału gatunków ekspansywnych. Resztę stanowią płaty przejściowe, nietypowe, zarastające mozgą lub trzciną, podlegające sukcesji.

Progi: nie mniej niż 80% – FV, 50–79% – U1, mniej niż 50% – U2.

Praktyka 2023–2024: U1 na 12 stanowiskach (płaty dobrze zachowane ok. połowy powierzchni przez małe pokrycie gatunków typowych i dużo mozgi), U2 – udział płatów z kompletem gatunków znikomy. Przykład z przewodnika: 95%, FV.`,
    thresholds: {
      FV: 'Płaty dobrze zachowane zajmują nie mniej niż 80% powierzchni zajętej przez siedlisko na stanowisku',
      U1: 'Płaty dobrze zachowane zajmują 50–79% powierzchni zajętej przez siedlisko na stanowisku',
      U2: 'Płaty dobrze zachowane zajmują mniej niż 50% powierzchni zajętej przez siedlisko na stanowisku',
    },
    inputs: [
      {
        kind: 'number',
        name: 'share',
        label: 'Udział dobrze zachowanych płatów',
        unit: '%',
        min: 0,
        max: 100,
        help: 'Procent powierzchni siedliska na stanowisku zajęty przez dobrze zachowane, typowe płaty (w stosunku do płatów zaburzonych, przejściowych, podlegających sukcesji).',
      },
      {
        kind: 'textarea',
        name: 'note',
        label: 'Komentarz',
        rows: 2,
        help: 'Np. „Na monitorowanym stanowisku dominują dobrze zachowane płaty siedliska.” Trafia do pola „wartość” po liczbie.',
      },
    ],
    suggest: unlessHighWater((i) => {
      const s = num(i.share)
      return s === undefined ? null : gradeWellPreserved3270(s)
    }),
    explain: explainUnlessHighWater(),
    describe: (i) => {
      const s = num(i.share)
      return [s !== undefined ? fmt(s) : '', String(i.note ?? '').trim()].filter(Boolean).join('. ')
    },
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (which: string) =>
  `Współrzędne geograficzne (WGS84, z GPS) ${which}. Transektu się nie wyznacza: przy ciągłym pasie – początek, środek i koniec pasa (tam robi się zdjęcia), przy grupie małych płatów – trzy najbardziej reprezentatywne płaty ze zdjęciami. Trzymaj jeden format w całej karcie.

Dlaczego: płaty 3270 pojawiają się co roku w trochę innym miejscu – współrzędne pozwalają wrócić na ten sam odcinek brzegu.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Sandomierz',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska, np. „Sandomierz”, „Łążek”, „Nasiłów”.

Stanowiskiem jest grupa położonych blisko siebie niewielkich (1–10 m²), wyraźnie wyodrębnionych płatów siedliska albo jeden kilkunasto–kilkudziesięciometrowy pas terenu zajęty przez siedlisko. Wybieraj fitocenozy, których przynależność do 3270 nie budzi wątpliwości.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'siteType',
    label: 'Typ stanowiska',
    placeholder: 'np. referencyjne',
    help: 'Typ stanowiska w sieci monitoringu, np. „referencyjne” – stanowisko z dobrze wykształconym siedliskiem, punkt odniesienia dla innych. Nie wiesz – zostaw puste.',
  },
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    placeholder: 'np. klasa Bidentetea tripartiti, związek Chenopodion fluviatile',
    help: `Jednostki fitosocjologiczne płatów siedliska: klasa Bidentetea tripartiti, rząd Bidentetalia tripartiti, związki Chenopodion fluviatile (zespoły Polygono brittingeri-Chenopodietum rubri, Chenopodietum glauco-rubri, Xanthio riparii-Chenopodietum, Chenopodietum ficifolii) i Bidention tripartiti (Rumici maritimi-Ranunculetum scelerati, Bidentetum tripartitae). W dobrze zachowanych płatach także gatunki Nanocyperion (klasa Isoëto-Nanojuncetea).

Sąsiednie zbiorowiska (szuwary mozgowe, zbiorowiska ruderalne, łozowiska) opisz w opisie siedliska.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Położenie (brzeg rzeki, most, km biegu), wielkość i rozmieszczenie płatów, sąsiednie zbiorowiska, stopień uregulowania koryta.',
    help: `Krótka, ogólna charakterystyka przyrodnicza stanowiska:
• gdzie leżą płaty (rzeka, brzeg lewy/prawy, punkt orientacyjny) i od kiedy rozwijają się w sezonie;
• wielkość płatów (zwykle 1–10 m², sporadycznie kilkadziesiąt), ich ułożenie wzdłuż koryta i długość odcinka;
• typowe odległości między płatami;
• zbiorowiska w sąsiedztwie: płaszczyste łachy, szuwary z mozgą trzcinowatą, zbiorowiska ruderalne (bylica, wrotycz, nawłoć);
• stopień uregulowania koryta rzecznego (przewodnik wymaga go w notatkach).

Dlaczego: siedlisko co roku odtwarza się od nowa – bez opisu kolejny obserwator nie odróżni zmiany naturalnej od skutku regulacji.`,
  },
  {
    kind: 'select',
    name: 'riverRegulation',
    label: 'Stopień uregulowania koryta rzecznego',
    options: RIVER_REGULATION,
    help: 'Metodyka każe w notatkach ze stanowiska podać stopień uregulowania koryta. Siedlisko jest typowe dla rzek nieuregulowanych albo uregulowanych w niewielkim stopniu; regulacja (prostowanie, ostrogi, profilowanie) to główne zagrożenie (kody J02.03, J02.03.02). Sprawozdanie 2013–2014 proponowało nawet osobny wskaźnik.',
  },
  {
    kind: 'select',
    name: 'waterLevel',
    label: 'Stan wody w rzece podczas obserwacji',
    options: WATER_LEVEL,
    hint: 'Przy wysokim stanie (namuliska zalane) formularz podpowie XX dla powierzchni i wszystkich wskaźników.',
    help: `Jak wysoko stała woda w dniu obserwacji. Płaty 3270 rozwijają się dopiero po obniżeniu wody na odsłoniętych aluwiach – w mokre lata siedlisko się nie wykształca.

Gdy namuliska są zalane i siedliska nie da się ocenić, wybierz „Wysoki” – formularz podpowie XX dla powierzchni i wszystkich wskaźników struktury (sprawozdanie 2023–2024: 10 z 33 stanowisk bez oceny ogólnej). Perspektywy ochrony ocenia się normalnie. Opisz sytuację w uwagach i zaproponuj powtórzenie obserwacji w kolejnym sezonie.`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    help: 'Łączna powierzchnia płatów siedliska na stanowisku, w hektarach (np. 0,02 ha = 200 m²). Przy wysokim stanie wody może być nieznana – zostaw puste i opisz.',
  },
  {
    ...pickField(methodology7120.siteFields, 'protectedAreas'),
    label: 'Obszary chronione (z pominięciem obszaru Natura 2000)',
    hint: 'Rezerwaty, parki, użytki ekologiczne. Brak – „Brak”.',
    help: 'Formy ochrony przyrody obejmujące stanowisko, poza obszarem Natura 2000 (ten ma osobne pole): rezerwaty, parki narodowe i krajobrazowe, obszary chronionego krajobrazu, użytki ekologiczne. Brak – wpisz „Brak”.',
  } as FieldDef,
  {
    kind: 'text',
    name: 'natura2000',
    label: 'Nazwa obszaru Natura 2000',
    placeholder: 'np. PLH180049 Tarnobrzeska Dolina Wisły',
    help: 'Kod i nazwa specjalnego obszaru ochrony siedlisk Natura 2000, w którym leży stanowisko. Poza siecią – „Brak”. W sprawozdaniu 2024: 15 z 33 stanowisk w 9 obszarach, najwięcej w PLH180020 Dolina Dolnego Sanu.',
  },
  {
    kind: 'text',
    name: 'manager',
    label: 'Zarządzający terenem',
    placeholder: 'np. RZGW Kraków',
    help: 'Kto zarządza terenem. Brzegi rzek to zwykle grunty Skarbu Państwa w zarządzie Wód Polskich (dawniej RZGW, np. „RZGW Kraków”). Od zarządcy zależą prace regulacyjne i utrzymaniowe w korycie.',
  },
  { kind: 'text', name: 'coordStart', group: 'Współrzędne geograficzne', wide: true, label: 'Płat / początek pasa (zdjęcie I)', required: true, help: coordHelp('pierwszego płatu albo początku pasa') },
  { kind: 'text', name: 'coordMiddle', group: 'Współrzędne geograficzne', wide: true, label: 'Płat / środek pasa (zdjęcie II)', help: coordHelp('drugiego płatu albo środka pasa') },
  { kind: 'text', name: 'coordEnd', group: 'Współrzędne geograficzne', wide: true, label: 'Płat / koniec pasa (zdjęcie III)', help: coordHelp('trzeciego płatu albo końca pasa') },
  {
    kind: 'textarea',
    name: 'transect',
    label: 'Wymiary transektu',
    rows: 3,
    defaultValue: 'Monitoring nie jest prowadzony metodą transektu – zdjęcia fitosocjologiczne w 3 najbardziej reprezentatywnych płatach.',
    help: `Metodyka 3270 nie stosuje transektu: płaty mają od 1 do kilkudziesięciu m² i leżą w różnych odległościach od siebie. Wpisz, jak rozmieszczono zdjęcia – przy ciągłym pasie na jego początku, w środku i na końcu, przy grupie płatów w trzech najbardziej reprezentatywnych – i ewentualnie długość badanego odcinka brzegu.

W przykładowej karcie: „monitoring siedliska 3270 nie jest prowadzony z wykorzystaniem metody transektu… w trzech najbardziej reprezentatywnych płatach wykonano zdjęcia…”.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 130',
    help: 'Wysokość terenu w metrach n.p.m. Stanowiska leżą w dolinach dużych i średnich rzek, zwykle kilkadziesiąt–dwieście kilkadziesiąt metrów (Sandomierz 130 m).',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 20.09.2013',
    required: true,
    hint: 'Koniec września i październik, zależnie od pogody. Nie rzadziej niż raz na 5 lat.',
    help: 'Dzień badań terenowych. Płaty 3270 rozwijają się najlepiej przy niskich sumach opadów od czerwca do sierpnia – nasiona kiełkują dopiero po obniżeniu wody na odsłoniętych aluwiach. Optymalny termin: koniec września i październik (w 2023 r. badano 28.09–29.10, w 2024 r. 5.09–12.10). Częstotliwość zależy od pogody w sezonie; stanowisko nie rzadziej niż raz na 5 lat.',
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m === 9 || m === 10 ? null : 'Termin poza optymalnym oknem (wrzesień–październik). Płaty mogą być jeszcze nierozwinięte albo już zniszczone przez wysoką wodę lub przymrozki.'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcie fitosocjologiczne płatu ----------

const r7120 = methodology7120.releves.fields
const layerHelp = (layer: string, what: string) => `Warstwa ${layer} – ${what}. Na namuliskach zwykle 0 (całość roślinności to warstwa C).`

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', { help: 'Współrzędne GPS środka zdjęcia (WGS84). Zdjęcia robi się na początku, w środku i na końcu pasa albo w trzech najbardziej reprezentatywnych płatach.' }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, w metrach.' }),
  pickField(r7120, 'area', {
    defaultValue: 2,
    help: 'Powierzchnia zdjęcia w m². Metodyka: od 1 do 10 m² – przy płatach 1–2 m² zdjęcie obejmuje cały płat (w przykładowej karcie 2 m²).',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Namuliska są zwykle płaskie – 0°.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek opadania powierzchni (N, NE, …). Dla powierzchni płaskiej – „brak”.' }),
  pickField(r7120, 'coverA', { help: layerHelp('A', 'drzewa, w % powierzchni zdjęcia') }),
  pickField(r7120, 'coverB', { help: layerHelp('B', 'krzewy i podrost, w % powierzchni zdjęcia') }),
  pickField(r7120, 'coverC', { help: 'Warstwa C – roślinność zielna, w % powierzchni zdjęcia. Płaty 3270 bywają luźne (kilkanaście %) albo zwarte (kilkadziesiąt %); w przykładzie 50–60%.' }),
  pickField(r7120, 'coverD', { help: layerHelp('D', 'mszaki i porosty, w %') }),
  pickField(r7120, 'heightA', { help: layerHelp('A', 'typowa wysokość w metrach') }),
  pickField(r7120, 'heightB', { help: layerHelp('B', 'typowa wysokość w metrach') }),
  pickField(r7120, 'heightC', { help: 'Warstwa C – typowa wysokość roślinności zielnej w centymetrach (w przykładzie 20 cm; komosy i rdesty dorastają do kilkudziesięciu).' }),
  pickField(r7120, 'heightD', { help: layerHelp('D', 'typowa wysokość w centymetrach') }),
  pickField(r7120, 'unit', {
    defaultValue: '',
    help: 'Jednostka fitosocjologiczna zdjęcia, np. „Chenopodion rubri” (= Chenopodion fluviatile), „Bidentetum tripartitae”, „Rumici maritimi-Ranunculetum scelerati”.',
  }),
  pickField(r7120, 'species', {
    help: 'Wszystkie gatunki na powierzchni zdjęcia z ilościowością w siedmiostopniowej skali Braun-Blanqueta (r, +, 1–5). Prawie wszystko w warstwie C (siewki wierzb też). Podgatunki i odmiany wpisuj jak w karcie, np. „Matricaria maritima ssp. inodora”.',
  }),
]

export const methodology3270: Methodology = {
  code: '3270',
  name: 'Zalewane muliste brzegi rzek (Bidention p.p. i Chenopodion rubri p.p.)',
  source:
    'Nobis A. 2015, 3270 Zalewane muliste brzegi rzek, [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. IV, GIOŚ, Biblioteka Monitoringu Środowiska, s. 141–152 (tab. 1 i 2), z praktyką ocen z monitoringu 2013–2014, 2016 i 2023–2024',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Trzy zdjęcia fitosocjologiczne po 1–10 m² (metoda Braun-Blanqueta, skala siedmiostopniowa). Przy ciągłym pasie – na jego początku, w środku i na końcu; przy grupie małych płatów (1–2 m²) – w trzech najbardziej reprezentatywnych płatach. Prawie wszystko w warstwie C.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Ocena realnych możliwości utrzymania siedliska we właściwej kondycji, uwzględniająca jego obecny stan zachowania oraz czynniki mogące na nie oddziaływać w przyszłości (np. planowane inwestycje).',
    help: `Weź pod uwagę przede wszystkim regulację koryta (prostowanie, profilowanie, ostrogi, opaski brzegowe – to ona decyduje, czy w ogóle zostaną namuliska), pobór piasku i żwiru, wydeptywanie przez wędkarzy, ekspansję mozgi trzcinowatej i trzciny przy długotrwale niskiej wodzie oraz status ochronny (obszar Natura 2000).

Praktyka: przykład z przewodnika (Sandomierz, obszar Natura 2000, bardzo dobry stan) – FV. W 2023–2024: FV dla ponad połowy stanowisk (głównie w Natura 2000), U1 – 13, U2 – 3, głównie przez silną presję antropogeniczną. Perspektywy ocenia się także przy wysokiej wodzie, gdy reszty karty nie da się ocenić.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub nie przewiduje się znacznego oddziaływania czynników zagrażających',
      U1: 'Obserwuje się słabe oddziaływanie czynników zagrażających, które mogą mieć wpływ na przetrwanie siedliska w dłuższej perspektywie czasowej',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'A04.02.01', name: 'Wypas bydła' },
    { code: 'C01.01', name: 'Wydobywanie piasku i żwiru' },
    { code: 'D', name: 'Transport i sieci komunikacyjne' },
    { code: 'D01.02', name: 'Drogi, autostrady' },
    { code: 'D01.05', name: 'Mosty, wiadukty' },
    { code: 'D03.02.02', name: 'Promowe szlaki pasażerskie (szybkie)' },
    { code: 'E03', name: 'Odpady, ścieki' },
    { code: 'F02.03', name: 'Wędkarstwo' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
    { code: 'G01.08', name: 'Inne rodzaje sportu i aktywnego wypoczynku' },
    { code: 'G02.10', name: 'Inne kompleksy sportowe i rekreacyjne' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'I02', name: 'Problematyczne gatunki rodzime' },
    { code: 'J', name: 'Modyfikacje systemu naturalnego' },
    { code: 'J02.03', name: 'Regulowanie (prostowanie) koryt rzecznych i zmiana przebiegu koryt rzecznych' },
    { code: 'J02.03.02', name: 'Regulowanie (prostowanie) koryt rzecznych' },
    { code: 'J02.04.01', name: 'Zalewanie' },
    { code: 'J02.05', name: 'Modyfikowanie funkcjonowania wód - ogólnie' },
    { code: 'J02.12.01', name: 'Wały przeciwpowodziowe, sztuczne plaże' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'L08', name: 'Powódź (naturalna)' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: methodology7120.otherFields.flatMap((f): FieldDef[] => {
    if (f.name === 'otherValues')
      return [
        {
          ...f,
          hint: 'Np. bóbr i wydra (zał. II Dyrektywy Siedliskowej), sąsiedztwo 3150, 91E0, 91F0, 6430.',
          help: 'Wartości przyrodnicze stanowiska poza samym siedliskiem: gatunki z załącznika II Dyrektywy Siedliskowej (bóbr Castor fiber, wydra Lutra lutra), sąsiednie siedliska (starorzecza 3150, łęgi 91E0 i 91F0, ziołorośla 6430), ptaki rzek roztokowych, dobrze zachowane fragmenty dużych dolin. Brak informacji – „Nie pozyskano danych”.',
        },
      ]
    if (f.name === 'conservation')
      return [
        {
          ...f,
          help: 'Jakie działania ochronne wykonano i z jakim skutkiem, oraz co proponujesz. Przewodnik: brak danych o działaniach ochronnych na stanowiskach, siedlisko jest dynamiczne i zależne od pogody. Najważniejsze – przy pracach regulacyjnych uwzględniać wymagania zbiorowisk namuliskowych, żeby nie wyeliminować możliwości ich pojawiania się; ograniczać pobór piasku i umocnienia brzegów. Brak działań – „Brak”.',
        },
      ]
    if (f.name === 'notes')
      return [
        {
          kind: 'number',
          name: 'shareFV',
          group: 'Powierzchnia siedliska o różnym stanie zachowania na stanowisku',
          label: 'Udział powierzchni w stanie FV',
          unit: '%',
          min: 0,
          max: 100,
          help: 'Przy ocenie ogólnej przewodnik podaje udział powierzchni siedliska o różnym stanie zachowania na stanowisku (FV, U1, U2). W przykładowej karcie: FV 100%. Trzy liczby powinny dać razem 100%.',
        },
        {
          kind: 'number',
          name: 'shareU1',
          group: 'Powierzchnia siedliska o różnym stanie zachowania na stanowisku',
          label: 'Udział powierzchni w stanie U1',
          unit: '%',
          min: 0,
          max: 100,
          help: 'Procent powierzchni siedliska na stanowisku w stanie niezadowalającym (U1). Brak – 0.',
        },
        {
          kind: 'number',
          name: 'shareU2',
          group: 'Powierzchnia siedliska o różnym stanie zachowania na stanowisku',
          label: 'Udział powierzchni w stanie U2',
          unit: '%',
          min: 0,
          max: 100,
          help: 'Procent powierzchni siedliska na stanowisku w stanie złym (U2). Brak – 0.',
        },
        {
          ...f,
          help: 'Pozostałe informacje z karty: rok i ekspert lokalny, dodatkowi eksperci, czy monitoring jest wymagany i dlaczego, data kontroli, inne obserwacje, uwagi metodyczne (np. termin zależny od pogody, wysoki stan wody). W przykładowej karcie: „Optymalny termin obserwacji – jesień, w zależności od warunków pogodowych wrzesień–październik”.',
        },
      ]
    return [f]
  }),

  speciesCatalog: SPECIES_3270.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer3270(s) })),
  speciesInfo: (name) => {
    const e = findSpecies3270(name)
    return e ? GROUP_LABELS_3270[e.group] : undefined
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator3270 = (id: string): IndicatorDef => {
  const i = methodology3270.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 3270`)
  return i
}
