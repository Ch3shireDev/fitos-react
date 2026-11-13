// Metodyka 2110 (inicjalne stadia nadmorskich wydm białych) jako dane. Źródło: Lemke D. 2015, „Inicjalne stadia
// nadmorskich wydm białych (2110)” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny,
// cz. IV, GIOŚ, s. 56–65 (tab. 1 i 2), z praktyką oceny ze sprawozdań z monitoringu 2013–2014, 2016–2018 i 2023–2025.
// Siedlisko nadmorskie, nieleśne, bardzo dynamiczne: pasowy transekt 200×10 m, 3 zdjęcia fitosocjologiczne 5×5 m
// (na początku, w środku i na końcu transektu). Z modułu leśnego brane są tylko klocki generyczne – nic leśnego.
import type { FieldDef, Grade, IndicatorDef, InputValues, Methodology } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, normalizeName, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import { GROUP_LABELS_2110, SPECIES_2110, defaultLayer2110, findSpecies2110, isAlien2110, isCharacteristic2110, isDuneGrass2110 } from './species'

// ---------- progi liczbowe (tab. 2) ----------

/**
 * Kwitnące/owocujące kępy traw wydmotwórczych jako % transektu: co najmniej 10% FV, mniej niż 10% (ale są) U1,
 * brak oznak kwitnienia U2.
 */
export const gradeGrasses2110 = (p: number): Grade => (p >= 10 ? 'FV' : p > 0 ? 'U1' : 'U2')

/**
 * Gatunki obce: brak FV; sporadycznie – maksymalnie 1 kępa o powierzchni poniżej 1 m² albo 1 egzemplarz – U1;
 * więcej niż 1 egzemplarz (kępa) albo powierzchnia większa niż 1 m² – U2. Równo 1 m² liczony do U1
 * (tab. 2: U2 dopiero „większą niż 1 m²”).
 */
export function gradeAliens2110(count: number, areaM2?: number): Grade {
  if (count <= 0) return 'FV'
  if (count > 1) return 'U2'
  return areaM2 !== undefined && areaM2 > 1 ? 'U2' : 'U1'
}

const pct = (v: number) => `${plNum(v)}%`
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'smallDecrease', label: 'Niewielki spadek powierzchni siedliska', grade: 'U1' },
  { value: 'clearDecrease', label: 'Wyraźny spadek powierzchni w porównaniu z wcześniejszymi badaniami lub danymi w literaturze', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const SPECIES: GradedOption[] = [
  { value: 'whole', label: 'Charakterystyczne gatunki roślin występują na całym transekcie', grade: 'FV' },
  { value: 'single', label: 'Pojedyncze występowanie roślin charakterystycznych na transekcie', grade: 'U1' },
  { value: 'none', label: 'Brak roślin charakterystycznych', grade: 'U2' },
]
const GRASSES: GradedOption[] = [
  { value: 'abundant', label: '„Wydmotwórcze” gatunki traw obficie kwitną/owocują (na powierzchni co najmniej 10% transektu)', grade: 'FV' },
  { value: 'sporadic', label: '„Wydmotwórcze” gatunki traw kwitną/owocują sporadycznie (na powierzchni mniejszej niż 10% transektu)', grade: 'U1' },
  { value: 'none', label: 'Brak oznak kwitnienia/owocowania „wydmotwórczych” gatunków traw', grade: 'U2' },
]
const ABRASION: GradedOption[] = [
  { value: 'accumulative', label: 'Brak abrazji, wybrzeże akumulacyjne', grade: 'FV' },
  { value: 'rare', label: 'Rzadkie podcinanie wydm', grade: 'U1' },
  { value: 'abrasive', label: 'Wyraźnie abrazyjny odcinek wybrzeża, wyraźne spłukiwanie wydm inicjalnych do morza', grade: 'U2' },
]
const ALIENS: GradedOption[] = [
  { value: 'none', label: 'Brak gatunków obcych ekologicznie lub geograficznie', grade: 'FV' },
  { value: 'sporadic', label: 'Gatunki obce występują sporadycznie (maksymalnie 1 kępa o powierzchni <1 m² lub 1 egzemplarz)', grade: 'U1' },
  { value: 'many', label: 'Gatunki obce zajmują powierzchnię większą niż 1 m² lub występują w ilości większej niż 1 egzemplarz', grade: 'U2' },
]
const DAMAGE: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'few', label: 'Nieliczne ślady przejazdu pojazdów, ścieżki itp.', grade: 'U1' },
  { value: 'clear', label: 'Wyraźne zniszczenia spowodowane przejazdami pojazdów oraz działalnością człowieka', grade: 'U2' },
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

// ---------- gatunki obce: liczba egzemplarzy z pola albo z listy ----------

function aliensFromInputs(i: InputValues): { grade: Grade; from: 'count' | 'list' } | null {
  const count = num(i.count)
  const area = num(i.areaM2)
  if (count !== undefined) return { grade: gradeAliens2110(count, area), from: 'count' }
  const names = [...new Set(rowNames(i.species).map(normalizeName))]
  if (names.length > 1) return { grade: 'U2', from: 'list' }
  if (names.length === 1 && area !== undefined && area > 1) return { grade: 'U2', from: 'list' }
  return null
}

// ---------- wskaźniki ----------

const SI_MGSP = (name: string) => `W SI MGSP i w sprawozdaniach z monitoringu wskaźnik nazywa się „${name}”.`

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description: 'Zmiana powierzchni płatów inicjalnych stadiów wydm białych na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury.',
    help: `Co wybrać: jak zmieniła się powierzchnia wydm inicjalnych na stanowisku od poprzedniej obserwacji (albo względem danych z literatury, ortofotomap, warstw mapy numerycznej Urzędu Morskiego). Powierzchnię w hektarach możesz wpisać obok – trafi do pola „wartość”.

Uwaga na dynamikę: siedlisko w kilka lat potrafi przejść w wydmę białą 2120 albo zostać spłukane przez sztorm. Do interpretacji potrzebna jest wiedza o lokalnej dynamice brzegu – przewodnik wskazuje zdjęcia lotnicze, ortofotomapy i dane Urzędu Morskiego. Przy pierwszym badaniu (nie ma z czym porównać) wybierz „Brak danych do porównania” albo oceń ekspercko.

Praktyka 2024: stanowiska, na których siedlisko zanikło (spłukane, zadeptane), dostawały U2.`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się',
      U1: 'Niewielki spadek powierzchni siedliska',
      U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi w literaturze',
    },
    inputs: [
      optionalSelect('Zmiana powierzchni', AREA, 'Puste, gdy oceniasz ekspercko (np. pierwsze badanie).'),
      { kind: 'number', name: 'areaHa', label: 'Powierzchnia (opcjonalnie)', unit: 'ha', min: 0, help: 'Powierzchnia płatów siedliska na stanowisku, jeśli ją znasz – trafi do pola „wartość”. Zwykle od kilkunastu arów do kilku hektarów.' },
      noteInput('Opis (opcjonalnie)', 'np. powierzchnia stabilna, nie zmniejsza się', 'Krótki opis zmian, który trafi do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(AREA)),
    describe: (i) => {
      const ha = num(i.areaHa)
      const note = String(i.note ?? '').trim()
      return [ha !== undefined ? `${plNum(ha)} ha` : '', note || (i.choice ? labelOf(AREA, i.choice).toLowerCase() : '')].filter(Boolean).join('; ')
    },
  },
  {
    id: 'species',
    label: 'Gatunki charakterystyczne',
    parameter: 'structure',
    description:
      'Lista gatunków charakterystycznych dla siedliska wraz z przybliżonym procentem pokrycia transektu przez dany gatunek. Ocena uwzględnia głównie liczbę gatunków diagnostycznych dla zbiorowiska.',
    help: `Co wpisać: gatunki charakterystyczne stwierdzone na transekcie z przybliżonym pokryciem transektu (%), a potem wybrać, jak występują – na całym transekcie, pojedynczo, czy wcale.

Gatunki charakterystyczne wg przewodnika (tab. 1): honkenia piaskowa Honckenya peploides, rukwiel nadmorska Cakile maritima, piaskownica zwyczajna Ammophila arenaria, wydmuchrzyca piaskowa Leymus arenarius (= Elymus arenarius), perz sitowy Agropyron junceum (= Elymus farctus). Inne gatunki (kostrzewa kosmata, trzcinnikownica bałtycka, kostrzewa czerwona) do oceny się nie liczą – wpisz je w zdjęciach.

Praktyka 2024: FV, gdy gatunki były rozproszone na całym transekcie (pokrycie do ok. 30%); U2, gdy ich brak albo pojedyncze okazy o znikomym pokryciu.

Dlaczego: inicjalna wydma to kilka gatunków na gołym piasku – ich obecność na całym pasie jest jedynym dowodem, że to jeszcze siedlisko, a nie sama plaża.`,
    thresholds: thresholdsOf(SPECIES),
    inputs: [
      speciesInput(
        'Gatunki charakterystyczne na transekcie',
        'Gatunki charakterystyczne z przybliżonym pokryciem transektu w %, np. Ammophila arenaria 5, Honckenya peploides 2. Lista trafia do karty jako „wartość”.',
      ),
      selectInput('Występowanie na transekcie', SPECIES),
      noteInput('Opis (opcjonalnie)', 'np. występuje całe spektrum gatunkowe', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków (np. jak w karcie z przewodnika).'),
    ],
    suggest: byOption(gradeMap(SPECIES)),
    explain: (i) => {
      const names = rowNames(i.species)
      if (!names.length) return null
      const ch = new Set(names.filter(isCharacteristic2110).map((n) => findSpecies2110(n)!.polish))
      return `Gatunków charakterystycznych na liście: ${ch.size} z 5 (tab. 1).`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (!names.length) return null
      const ch = names.filter(isCharacteristic2110)
      const other = names.filter((n) => !isCharacteristic2110(n))
      if (!ch.length && (i.choice === 'whole' || i.choice === 'single'))
        return 'Na liście nie ma żadnego z 5 gatunków charakterystycznych z tab. 1 – sprawdź wybór (bez nich to U2).'
      if (ch.length && i.choice === 'none') return 'Wybrano „Brak”, a na liście są gatunki charakterystyczne.'
      return other.length ? `Spoza listy gatunków charakterystycznych: ${other.join(', ')} – nie liczą się do oceny (wpisz je w zdjęciach).` : null
    },
    describe: (i) => String(i.note ?? '').trim() || describeSpecies(speciesRows(i.species)) || labelOf(SPECIES, i.choice),
  },
  {
    id: 'grasses',
    label: 'Kondycja i forma wzrostu wydmotwórczych gatunków traw',
    parameter: 'structure',
    cardinal: true,
    description:
      'Opis kondycji gatunków traw „budujących” wydmę – w głównej mierze pionierskich gatunków traw, takich jak piaskownica zwyczajna Ammophila arenaria. Wszystkie gatunki wydmotwórcze wymagają dopływu piasku – jeśli w danym miejscu brakuje zasypywania kęp traw, trawy (zwłaszcza piaskownica) obumierają.',
    help: `Co ocenić: na jakiej części transektu kępy traw wydmotwórczych (piaskownica, wydmuchrzyca, perz sitowy, trzcinnikownica) kwitną albo owocują. Wpisz procent powierzchni transektu – ma pierwszeństwo – albo tylko wybierz klasę. Kondycję (żywotność kęp, zasypywanie piaskiem, zamieranie) opisz w notatce.

Progi: obficie kwitną/owocują na co najmniej 10% transektu – FV; sporadycznie, na mniej niż 10% – U1; brak oznak kwitnienia/owocowania – U2.

Wskaźnik kardynalny. Dlaczego: kwitnąca i owocująca piaskownica to znak, że kępy są regularnie zasypywane świeżym piaskiem – czyli że wydma rośnie. Zamierające, niekwitnące kępy znaczą, że dopływ piasku ustał. Sprawozdanie 2024: najgorzej oceniony wskaźnik (U2 na 48% stanowisk). Termin ma znaczenie – w czerwcu trawy mogą jeszcze nie kwitnąć, zapisz to w uwagach.`,
    thresholds: thresholdsOf(GRASSES),
    inputs: [
      { kind: 'number', name: 'value', label: 'Kwitnące/owocujące kępy (% transektu)', unit: '%', min: 0, max: 100, help: 'Procent powierzchni transektu, na którym trawy wydmotwórcze kwitną albo owocują. 0 = brak oznak kwitnienia. Ma pierwszeństwo przed wyborem klasy.' },
      optionalSelect('Klasa (gdy bez pomiaru)', GRASSES, 'Wybierz, gdy nie szacujesz procentu.'),
      noteInput('Kondycja traw (opcjonalnie)', 'np. trawy w dobrej kondycji, pojedynczo owocują', 'Krótki opis kondycji kęp. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v !== undefined ? gradeGrasses2110(v) : byOption(gradeMap(GRASSES))(i)
    },
    warn: (i) => {
      const v = num(i.value)
      if (v === undefined || !i.choice) return null
      return gradeMap(GRASSES)[String(i.choice)] === gradeGrasses2110(v) ? null : `${pct(v)} transektu nie pasuje do wybranej klasy.`
    },
    describe: (i) => {
      const v = num(i.value)
      return [noteOr(i, GRASSES), v !== undefined ? `kwitnienie/owocowanie na ${pct(v)} transektu` : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'abrasion',
    label: 'Występowanie sedymentacji/abrazji',
    parameter: 'structure',
    cardinal: true,
    description: `Opis aktualnie przeważających procesów geomorfologicznych w obrębie powierzchni zajmowanej przez siedlisko. ${SI_MGSP('Występowanie abrazji')}`,
    help: `Co wybrać: czy na transekcie przeważa akumulacja piasku (szeroka plaża, świeże nawiewy, rosnące zawiązki wydm), czy abrazja (podcięte wydmy, klif wydmowy, spłukane wydmy inicjalne, wąska plaża). Opisz w notatce, co widać – trafi do karty.

Progi: brak abrazji, wybrzeże akumulacyjne – FV; rzadkie podcinanie wydm – U1; wyraźnie abrazyjny odcinek, wyraźne spłukiwanie wydm inicjalnych do morza – U2.

Wskaźnik kardynalny. Dlaczego: siedlisko istnieje tylko tam, gdzie morze więcej piasku dokłada, niż zabiera. Po silnych sztormach (np. zima 2016/2017) całe transekty znikały – sprawozdanie 2018: U2 na 45% stanowisk. Patrz też poza transekt, na sąsiedni odcinek brzegu.`,
    thresholds: thresholdsOf(ABRASION),
    inputs: [
      selectInput('Przeważający proces', ABRASION),
      noteInput('Co widać (opcjonalnie)', 'np. szeroka plaża, brak oznak abrazji brzegu morskiego', 'Krótki opis procesów: szerokość plaży, podcięcia, klif wydmowy, spłukane wydmy. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(ABRASION)),
    describe: (i) => noteOr(i, ABRASION),
  },
  {
    id: 'aliens',
    label: 'Występowanie gatunków obcych ekologicznie lub geograficznie',
    parameter: 'structure',
    description: `Lista gatunków obcych w ekosystemie. Najczęściej są to krzewy wysadzane przez pracowników Urzędu Morskiego w ramach „stabilizacji” brzegu. ${SI_MGSP('Gatunki obce geograficznie')}`,
    help: `Co wpisać: gatunki obce stwierdzone na transekcie, łączną liczbę egzemplarzy (kęp) i – gdy to jedna kępa – jej powierzchnię. Albo tylko wybrać klasę.

Obce ekologicznie: krzewy sadzone do „stabilizacji” brzegu – róża pomarszczona Rosa rugosa, wierzba ostrolistna Salix acutifolia (także żywe płotki faszynowe, które się ukorzeniły), wierzba wawrzynkowa S. daphnoides, rokitnik Hippophaë rhamnoides. Obce geograficznie (sprawozdanie 2024): rzepień brzegowy Xanthium albinum, sałata tatarska, przymiotno kanadyjskie, uczep amerykański, szarłat szorstki…

Progi: brak – FV; sporadycznie, maksymalnie 1 kępa o powierzchni poniżej 1 m² albo 1 egzemplarz – U1; powierzchnia większa niż 1 m² albo więcej niż 1 egzemplarz – U2. Liczba egzemplarzy ma pierwszeństwo; bez niej formularz liczy z listy (2 gatunki to już co najmniej 2 egzemplarze, więc U2).

Dlaczego: ukorzenione płotki wierzbowe i róża utrwalają piasek i zatrzymują jego ruch, a bez ruchu piasku nie ma wydmy inicjalnej.`,
    thresholds: thresholdsOf(ALIENS),
    inputs: [
      speciesInput('Gatunki obce na transekcie', 'Gatunki obce (ekologicznie i geograficznie) z przybliżonym pokryciem transektu w %. Brak – zostaw pustą listę i wybierz „Brak”.'),
      { kind: 'number', name: 'count', label: 'Liczba egzemplarzy (kęp)', min: 0, help: 'Łączna liczba egzemplarzy albo kęp gatunków obcych na transekcie. 0 = brak. Ma pierwszeństwo przed wyborem klasy.' },
      { kind: 'number', name: 'areaM2', label: 'Powierzchnia zajęta przez gatunki obce', unit: 'm²', min: 0, help: 'Łączna powierzchnia kęp gatunków obcych. Ważna przy jednej kępie: poniżej 1 m² to U1, więcej – U2.' },
      optionalSelect('Klasa (gdy bez liczenia)', ALIENS, 'Wybierz, gdy nie liczysz egzemplarzy.'),
    ],
    suggest: (i) => aliensFromInputs(i)?.grade ?? byOption(gradeMap(ALIENS))(i),
    explain: (i) => {
      const names = [...new Set(rowNames(i.species))]
      const eco = names.filter((n) => findSpecies2110(n)?.group === 'alienEco' || ['Rosa rugosa', 'Salix acutifolia'].includes(findSpecies2110(n)?.latin ?? ''))
      const r = aliensFromInputs(i)
      if (r?.from === 'list') return `Gatunków obcych na liście: ${names.length} – to więcej niż 1 egzemplarz, więc U2.`
      return eco.length ? `Krzewy sadzone do „stabilizacji” brzegu: ${eco.join(', ')}.` : null
    },
    warn: (i) => {
      const names = rowNames(i.species)
      const count = num(i.count)
      if (count === 0 && names.length) return 'Wpisano 0 egzemplarzy, a lista gatunków obcych nie jest pusta.'
      if (i.choice === 'none' && names.length) return 'Wybrano „Brak”, a lista gatunków obcych nie jest pusta.'
      const other = names.filter((n) => findSpecies2110(n) && !isAlien2110(n))
      if (other.length) return `Na liście gatunków obcych są gatunki rodzime: ${other.join(', ')}.`
      const r = aliensFromInputs(i)
      if (!r || !i.choice) return null
      const chosen = gradeMap(ALIENS)[String(i.choice)]
      return chosen !== r.grade ? `Wg liczby egzemplarzy i powierzchni to ${r.grade}, a wybrano ${chosen}.` : null
    },
    describe: (i) => {
      const list = describeSpecies(speciesRows(i.species))
      const count = num(i.count)
      if (!list && (i.choice === 'none' || count === 0)) return 'nie stwierdzono'
      const area = num(i.areaM2)
      const extra = [count !== undefined ? `${plNum(count)} egz.` : '', area !== undefined ? `${plNum(area)} m²` : ''].filter(Boolean).join(', ')
      return [list || labelOf(ALIENS, i.choice), extra].filter(Boolean).join('; ')
    },
  },
  {
    id: 'damage',
    label: 'Zniszczenia mechaniczne',
    parameter: 'structure',
    description: `Obserwowanie na transekcie i w zasięgu wzroku obecności zniekształcenia siedliska w postaci rozjeżdżania, wydeptania. ${SI_MGSP('Mechaniczne zniszczenie')}`,
    help: `Co ocenić: ślady rozjeżdżania (quady, ciężki sprzęt do sprzątania plaż i opróżniania koszy, pojazdy służb), wydeptania, plażowania w obrębie wydm inicjalnych, wydeptane ścieżki i nielegalne zejścia na plażę. Patrz na transekcie i w zasięgu wzroku. Krótki opis w notatce trafi do karty.

Progi: brak – FV; nieliczne ślady przejazdu pojazdów, ścieżki itp. – U1; wyraźne zniszczenia spowodowane przejazdami pojazdów oraz działalnością człowieka – U2.

Wskaźnik niekardynalny (w przewodniku kardynalne są tylko kondycja traw i sedymentacja/abrazja). Dlaczego mimo to ważny: zawiązki wydm to kilka kęp na gołym piasku – jeden sezon plażowania potrafi je wyrównać. Sprawozdanie 2024: U2 na 42% stanowisk. Badania przed szczytem sezonu dają zwykle lepsze oceny – zapisz termin w uwagach.`,
    thresholds: thresholdsOf(DAMAGE),
    inputs: [
      selectInput('Zniszczenia', DAMAGE),
      noteInput('Opis zniszczeń (opcjonalnie)', 'np. ślady quadów biegnące po inicjalnych stadiach wydm', 'Krótki opis, co zniszczyło wydmy inicjalne. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(DAMAGE)),
    describe: (i) => noteOr(i, DAMAGE),
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu, z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie.

Dlaczego: wydma inicjalna przesuwa się z każdym sztormem, ale transekt ma być ten sam – za 3 lata ktoś musi przejść ten sam pas i porównać.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Świnoujście',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – zwykle miejscowość, np. „Świnoujście”, „Czołpino 1”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego odcinka brzegu.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    defaultValue: 'Elymo-Ammophiletum',
    placeholder: 'np. Elymo-Ammophiletum arenariae honckenyetosum',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Dla 2110: klasa Ammophiletea, rząd Ammophiletalia; związek Agropyro-Honckenyion peploidis z zespołem Honckenyo-Agropyretum juncei (tylko wschodnia część wybrzeża) i związek Ammophilion borealis z zespołem Elymo-Ammophiletum (całe wybrzeże; inicjalne stadia – podzespół honckenyetosum).`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Gdzie leży pas wydm inicjalnych, typ brzegu, szerokość plaży, jak wyglądają kępy traw, antropopresja.',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• położenie pasa wydm inicjalnych (między plażą a wydmą białą), jego szerokość i ciągłość;
• typ brzegu: akumulacyjny czy abrazyjny, szerokość plaży;
• jak wyglądają zawiązki wydm: rozproszone kępy, wały, czy kępy są zasypywane piaskiem;
• sąsiedztwo: wydma biała 2120, kidzina 1210;
• antropopresja: wejścia na plażę, płotki faszynowe, ogrodzenia, sprzątanie.

Za stanowisko przyjmuje się dający się wyodrębnić w terenie, w miarę jednorodny i ciągły w przestrzeni pas wydm białych w stadium inicjalnym.`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Łączna powierzchnia płatów siedliska na stanowisku, w hektarach – zwykle od kilkunastu arów do kilku hektarów (0,2 ha w karcie z przewodnika). Oszacuj w terenie albo z ortofotomapy.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „Słowiński Park Narodowy; PLH220023 Ostoja Słowińska”. Brak – „brak”.',
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
    hint: 'Pasowy transekt 200×10 m wzdłuż pasa wydm inicjalnych.',
    help: `Na stanowisku wytycza się pasowy transekt o szerokości 10 m i długości 200 m, na którym ocenia się wskaźniki struktury i funkcji. Co 100 m (na początku, w środku i na końcu) robi się zdjęcie fitosocjologiczne 5×5 m.

Gdy pas wydm inicjalnych jest krótszy niż 200 m, wpisz faktyczną długość i opisz to w uwagach metodycznych.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    defaultValue: '0–1',
    required: true,
    help: 'Wydmy inicjalne leżą tuż nad plażą – zwykle 0–2 m n.p.m. Można wpisać zakres („0–1”).',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 12.10.2013',
    required: true,
    hint: 'Optymalnie od czerwca do października.',
    help: `Dzień badań terenowych. Optymalny termin: czerwiec–październik. Ze względu na dynamikę siedliska i prognozowane podniesienie poziomu morza stanowiska kontroluje się co 3 lata.

Uwaga: w środku sezonu plażowego zniszczenia mechaniczne wychodzą gorzej, a na początku czerwca trawy mogą jeszcze nie kwitnąć – zapisz to w uwagach.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 6 && m <= 10 ? null : 'Termin poza optymalnym oknem (czerwiec–październik). Kwitnienie traw może być nieczytelne.'
    },
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcia fitosocjologiczne: 3 × 5×5 m co 100 m ----------

const r7120 = methodology7120.releves.fields

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', {
    help: 'Współrzędne GPS środka zdjęcia. Zdjęcia robi się na początku, w środku i na końcu transektu (co 100 m).',
  }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, zwykle 0–2 m.' }),
  pickField(r7120, 'area', {
    defaultValue: 25,
    help: 'Powierzchnia zdjęcia w m². Metodyka: poletka 5×5 m = 25 m².',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Na wydmie inicjalnej zwykle 0°.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…). Dla powierzchni płaskiej wpisz „brak”.' }),
  {
    kind: 'number',
    name: 'coverC',
    group: 'Warstwa C',
    label: 'Zwarcie C',
    unit: '%',
    min: 0,
    max: 100,
    help: 'Procent powierzchni zdjęcia pokryty przez rośliny (warstwa C – zielna). Na wydmie inicjalnej zwykle kilka procent (2% w karcie z przewodnika).',
  },
  {
    kind: 'number',
    name: 'heightC',
    group: 'Warstwa C',
    label: 'Wysokość C',
    unit: 'cm',
    min: 0,
    help: 'Typowa wysokość roślin w warstwie C, w centymetrach (kępy traw zwykle 20–60 cm).',
  },
  pickField(r7120, 'unit', {
    placeholder: 'np. Elymo-Ammophiletum arenariae honckenyetosum',
    help: 'Jednostka fitosocjologiczna zdjęcia: Honckenyo-Agropyretum juncei albo Elymo-Ammophiletum (inicjalne stadia: podzespół honckenyetosum).',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki naczyniowe w poletku z ilościowością w skali Braun-Blanqueta (r, +, 1–5). Prawie wszystko w warstwie C; sadzone krzewy (róża, wierzba ostrolistna) – w B.',
  }),
]

export const methodology2110: Methodology = {
  code: '2110',
  name: 'Inicjalne stadia nadmorskich wydm białych',
  source:
    'Lemke D. 2015, Inicjalne stadia nadmorskich wydm białych (2110), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. IV, GIOŚ, s. 56–65 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2013–2014, 2016–2018 i 2023–2025',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Na transekcie co 100 m (na początku, w środku i na końcu) wykonaj zdjęcie fitosocjologiczne klasyczną metodą Braun-Blanqueta na poletku 5×5 m. Prawie wszystko w warstwie C.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Ocena realnych możliwości utrzymania siedliska we właściwej kondycji, uwzględniająca jego obecny stan zachowania oraz czynniki, mogące na nie oddziaływać w najbliższej przyszłości.',
    help: `Weź pod uwagę cały odcinek brzegu, nie tylko transekt: czy brzeg jest akumulacyjny czy abrazyjny, presję plażowiczów i zejścia na plażę, ruch pojazdów przy sprzątaniu plaż i opróżnianiu koszy, refulację, płotki z żywych pędów wierzby ostrolistnej, ekspansję róży pomarszczonej, ryzyko sztormów.

Działania ochronne, o których warto wspomnieć: ogrodzenie pasa wydm od plaży w sezonie (np. siatką), kanalizacja ruchu (wyznaczone zejścia, likwidacja nielegalnych), płotki faszynowe z martwego materiału, nasadzenia piaskownicy na odcinkach akumulacyjnych, usuwanie wierzby ostrolistnej i róży, edukacja.

Praktyka 2024: perspektywy oceniano lepiej tam, gdzie prowadzi się ochronę czynną (płotki, ogrodzenia); zanik siedliska na stanowisku – U2.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się oddziaływania czynników zagrażających',
      U1: 'Perspektywy zachowania siedliska dobre, przy czym obserwowany jest wpływ czynników zagrażających, które jednak w dłuższej perspektywie czasowej nie powinny zagrozić zasobom siedliska',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'C01.01.02', name: 'Usuwanie materiału z plaż' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D05', name: 'Usprawniony dostęp do obszaru' },
    { code: 'E01.02', name: 'Nieciągła miejska zabudowa' },
    { code: 'E03.01', name: 'Pozbywanie się odpadów z gospodarstw domowych / obiektów rekreacyjnych' },
    { code: 'G01', name: 'Sporty i różne formy czynnego wypoczynku, uprawiane w plenerze' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
    { code: 'G04.01', name: 'Poligony' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'G05.05', name: 'Intensywne utrzymywanie parków publicznych / oczyszczanie plaż' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'J02.11', name: 'Zmiana w procesie odkładania się osadów, zrzut, odkładanie wybagrowanych materiałów' },
    { code: 'J02.11.01', name: 'Zrzut, odkładanie wybagrowanych materiałów' },
    { code: 'J02.12', name: 'Wały przeciwpowodziowe i konstrukcje zapobiegające powodziom w wodach śródlądowych' },
    { code: 'J02.12.01', name: 'Prace związane z obroną przed aktywnością morza i ochroną wybrzeży, groble' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K01.05', name: 'Zmiany w procesie sedymentacji' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'L07', name: 'Sztorm, cyklon' },
    { code: 'M01.07', name: 'Zmiana poziomu morza' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. sąsiedztwo 1210, 2120, 2130; mikołajek nadmorski; ptaki siewkowe.',
        help: 'Wartości przyrodnicze stanowiska poza samą wydmą inicjalną: sąsiednie siedliska (kidzina 1210, wydmy białe 2120, wydmy szare 2130), gatunki chronione (mikołajek nadmorski, groszek nadmorski), ptaki siewkowe gniazdujące na plaży. Brak informacji – „Nie stwierdzono” albo „Nie pozyskano danych”.',
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: `Jakie działania ochronne wykonano i jaka jest ich skuteczność, oraz co proponujesz. Typowe dla 2110: ogrodzenie pasa wydm od plaży w sezonie letnim, płotki faszynowe, gałęziówka u podnóża wydmy, nasadzenia piaskownicy na odcinkach akumulacyjnych, kanalizacja ruchu turystycznego (wyznaczone zejścia), usuwanie wierzby ostrolistnej i róży pomarszczonej, edukacja. Brak działań – „Nie prowadzono”.`,
      }
    return f
  }),

  speciesCatalog: SPECIES_2110.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer2110(s) })),
  speciesInfo: (name) => {
    const e = findSpecies2110(name)
    if (!e) return undefined
    return isDuneGrass2110(name) ? `${GROUP_LABELS_2110[e.group]}, trawa wydmotwórcza` : GROUP_LABELS_2110[e.group]
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator2110 = (id: string): IndicatorDef => {
  const i = methodology2110.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 2110`)
  return i
}
