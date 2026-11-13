// Metodyka 2120 (nadmorskie wydmy białe, Elymo-Ammophiletum) jako dane. Źródło: Lemke D. 2015, „Nadmorskie wydmy
// białe (2120)” [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. IV, GIOŚ,
// s. 66–74 (tab. 1 i 2), z praktyką oceny ze sprawozdań z monitoringu 2013–2014, 2016–2018 i 2023–2025.
// Siedlisko nadmorskie, nieleśne, dynamiczne: pasowy transekt 200×10 m, 3 zdjęcia fitosocjologiczne 5×5 m
// (na początku, w środku i na końcu transektu). Z modułu leśnego brane są tylko klocki generyczne – nic leśnego.
// Interpretacje i dopowiedzenia: ../specyfikacja-karty-2120.md.
import type { FieldDef, Grade, IndicatorContext, IndicatorDef, InputValues, Methodology, SelectOption } from '../../7120/habitats/types'
import { describeSpecies, num, speciesRows } from '../../7120/habitats/assessment'
import { isIsoDate } from '../../7120/habitats/dates'
import { methodology7120 } from '../../7120/habitats/7120/methodology'
import { byOption, gradeMap, labelOf, normalizeName, pickField, plNum, selectInput, speciesInput, type GradedOption } from '../../forest'
import {
  GROUP_LABELS_2120,
  SPECIES_2120,
  defaultLayer2120,
  findSpecies2120,
  isAlien2120,
  isCharacteristic2120,
  isDuneGrass2120,
  isNitrophilous2120,
} from './species'

// ---------- progi liczbowe (tab. 2) ----------

/**
 * Kwitnące/owocujące kępy traw wydmotwórczych jako % transektu: co najmniej 10% FV, mniej niż 10% (ale są) U1,
 * brak oznak kwitnienia/owocowania U2.
 */
export const gradeGrasses2120 = (p: number): Grade => (p >= 10 ? 'FV' : p > 0 ? 'U1' : 'U2')

/** Ilościowość w skali Braun-Blanqueta: „r” i „+” to najniższe stopnie, 1–5 – wyższe. */
export type NitroAbundance = 'low' | 'high'

/**
 * Gatunki nitrofilne (tab. 2): brak FV; maksymalnie jeden gatunek o stopniu pokrycia r lub + – U1;
 * jeden gatunek o stopniu pokrycia 1 lub wyższym albo więcej niż jeden gatunek – U2.
 */
export function gradeNitrophilous2120(count: number, abundance?: NitroAbundance): Grade | null {
  if (count <= 0) return 'FV'
  if (count > 1) return 'U2'
  if (abundance === 'high') return 'U2'
  if (abundance === 'low') return 'U1'
  return null
}

const pct = (v: number) => `${plNum(v)}%`
const rowNames = (v: unknown) => speciesRows(v).map((r) => r.name?.trim() ?? '').filter(Boolean)
const uniqueNames = (v: unknown) => [...new Map(rowNames(v).map((n) => [normalizeName(n), n])).values()]

// ---------- opcje selektów ----------

const AREA: GradedOption[] = [
  { value: 'stable', label: 'Nie podlega zmianom lub zwiększa się', grade: 'FV' },
  { value: 'smallDecrease', label: 'Niewielki spadek powierzchni siedliska', grade: 'U1' },
  { value: 'clearDecrease', label: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi w literaturze', grade: 'U2' },
  { value: 'unknown', label: 'Brak danych do porównania', grade: 'XX' },
]
const SPECIES: GradedOption[] = [
  { value: 'whole', label: 'Charakterystyczne gatunki roślin występują na całym transekcie', grade: 'FV' },
  { value: 'single', label: 'Pojedyncze występowanie roślin charakterystycznych na transekcie', grade: 'U1' },
  { value: 'none', label: 'Brak roślin charakterystycznych', grade: 'U2' },
]
const NITRO: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'one', label: 'Maksymalnie jeden gatunek o stopniu pokrycia w skali Braun-Blanqueta r lub +', grade: 'U1' },
  {
    value: 'more',
    label: 'Występowanie jednego gatunku w stopniu pokrycia w skali Braun-Blanqueta przynajmniej 1 lub występowanie więcej niż jednego gatunku',
    grade: 'U2',
  },
]
const NITRO_ABUNDANCE: SelectOption[] = [
  { value: 'low', label: 'r albo + (pojedyncze osobniki, pokrycie znikome)' },
  { value: 'high', label: '1 albo wyżej (pokrycie od 1%)' },
]
const GRASSES: GradedOption[] = [
  { value: 'abundant', label: '„Wydmotwórcze” gatunki traw obficie kwitną/owocują (na powierzchni co najmniej 10% transektu)', grade: 'FV' },
  { value: 'sporadic', label: '„Wydmotwórcze” gatunki traw kwitną/owocują sporadycznie (na powierzchni mniejszej niż 10% transektu)', grade: 'U1' },
  { value: 'none', label: 'Brak oznak kwitnięcia/owocowania „wydmotwórczych” gatunków traw', grade: 'U2' },
]
const ABRASION: GradedOption[] = [
  { value: 'accumulative', label: 'Brak abrazji, wybrzeże akumulacyjne', grade: 'FV' },
  { value: 'rare', label: 'Rzadkie podcinanie wydm', grade: 'U1' },
  { value: 'abrasive', label: 'Wyraźnie abrazyjny odcinek wybrzeża, wyraźne spłukiwanie wydm inicjalnych do morza', grade: 'U2' },
]
const DAMAGE: GradedOption[] = [
  { value: 'none', label: 'Brak', grade: 'FV' },
  { value: 'few', label: 'Nieliczne ślady przejazdu pojazdów, ścieżki itp.', grade: 'U1' },
  { value: 'clear', label: 'Wyraźne zniszczenia spowodowane przejazdami pojazdów oraz działalnością człowieka', grade: 'U2' },
]
const ALIENS: GradedOption[] = [
  { value: 'none', label: 'Brak gatunków obcych ekologicznie lub geograficznie', grade: 'FV' },
  { value: 'sporadic', label: 'Pojedyncze egzemplarze lub kępy gatunków obcych', grade: 'U1' },
  { value: 'many', label: 'Gatunki obce liczne, tworzą zwarte kępy lub nasadzenia', grade: 'U2' },
]

/** Rola kondycji traw w ocenie struktury – pole stanowiska (patrz specyfikacja, pkt „Kondycja traw”). */
export const GRASSES_ROLE: SelectOption[] = [
  { value: '', label: 'Kardynalny (metodyka)' },
  { value: 'late', label: 'Niekardynalny – późny termin, trawy po owocowaniu (ocena ekspercka)' },
]

const thresholdsOf = (o: GradedOption[]) => ({
  FV: o.filter((x) => x.grade === 'FV').map((x) => x.label).join('; '),
  U1: o.filter((x) => x.grade === 'U1').map((x) => x.label).join('; '),
  U2: o.filter((x) => x.grade === 'U2').map((x) => x.label).join('; '),
})

/** Select niewymagany – gdy wpiszesz liczbę albo listę, wystarczy liczba albo lista. */
const optionalSelect = (label: string, options: GradedOption[], help?: string): FieldDef => ({ ...selectInput(label, options, help), required: false })

const noteInput = (label: string, placeholder: string, help: string): FieldDef => ({ kind: 'textarea', name: 'note', label, rows: 2, placeholder, help })

/** „Wartość” w karcie: notatka obserwatora, a bez niej etykieta wybranej klasy. */
const noteOr = (i: InputValues, options: GradedOption[]) => String(i.note ?? '').trim() || labelOf(options, i.choice)

/** Czy kondycja traw jest kardynalna na tym stanowisku (domyślnie tak – jak w metodyce). */
export const grassesCardinal2120 = (ctx: IndicatorContext) => ctx.site?.grassesRole !== 'late'

// ---------- gatunki nitrofilne: lista + ilościowość ----------

function nitroFromInputs(i: InputValues): Grade | null {
  const names = uniqueNames(i.species)
  if (!names.length) return null
  return gradeNitrophilous2120(names.length, i.abundance === 'low' || i.abundance === 'high' ? i.abundance : undefined)
}

// ---------- wskaźniki ----------

const SI_MGSP = (name: string) => `W SI MGSP i w sprawozdaniach z monitoringu wskaźnik nazywa się „${name}”.`

const indicators: IndicatorDef[] = [
  {
    id: 'area',
    label: 'Powierzchnia siedliska na stanowisku',
    parameter: 'area',
    description: 'Zmiana powierzchni płatów wydm białych na stanowisku w porównaniu z wcześniejszymi badaniami lub danymi z literatury.',
    help: `Co wybrać: jak zmieniła się powierzchnia wydmy białej na stanowisku od poprzedniej obserwacji (albo względem danych z literatury, ortofotomap, warstw mapy numerycznej Urzędu Morskiego). Powierzchnię w hektarach możesz wpisać obok – trafi do pola „wartość”.

Uwaga na dynamikę: wydmę białą zjada od strony morza abrazja (podcięcia po sztormach), a od strony lądu sukcesja w kierunku wydmy szarej 2130 (Helichryso-Jasionetum) i zalesienia. Przewodnik wskazuje zdjęcia lotnicze, ortofotomapy i dane Urzędu Morskiego. Przy pierwszym badaniu (nie ma z czym porównać) wybierz „Brak danych do porównania” albo oceń ekspercko.

Praktyka 2018: spadek powierzchni na większości stanowisk to podcięcia abrazyjne po sztormach; sukcesja, zarastanie drzewami i wydeptywanie – rzadziej. Sprawozdanie zaznacza, że ocena jest orientacyjna, bo monitoring nie zakłada kartowania płatów.`,
    thresholds: {
      FV: 'Nie podlega zmianom lub zwiększa się',
      U1: 'Niewielki spadek powierzchni siedliska',
      U2: 'Wyraźny spadek powierzchni siedliska w porównaniu z wcześniejszymi badaniami lub danymi w literaturze',
    },
    inputs: [
      optionalSelect('Zmiana powierzchni', AREA, 'Puste, gdy oceniasz ekspercko (np. pierwsze badanie).'),
      { kind: 'number', name: 'areaHa', label: 'Powierzchnia (opcjonalnie)', unit: 'ha', min: 0, help: 'Powierzchnia płatów siedliska na stanowisku, jeśli ją znasz – trafi do pola „wartość”. Zwykle od kilkunastu arów do kilkudziesięciu hektarów.' },
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
      'Lista gatunków charakterystycznych dla siedliska wraz z przybliżonym procentem pokrycia transektu przez dany gatunek. Wskaźnik pomaga w ocenie typowości składu gatunkowego fitocenoz reprezentujących siedlisko na stanowisku i w obszarze. W ocenie uwzględnia się głównie liczbę gatunków diagnostycznych dla zbiorowiska.',
    help: `Co wpisać: gatunki charakterystyczne stwierdzone na transekcie z przybliżonym pokryciem transektu (%), a potem wybrać, jak występują – na całym transekcie, pojedynczo, czy wcale.

Gatunki charakterystyczne wg przewodnika (tab. 1): piaskownica zwyczajna Ammophila arenaria, wydmuchrzyca piaskowa Leymus arenarius (= Elymus arenarius), trzcinnikownica nadbrzeżna × Calammophila baltica, kostrzewa kosmata Festuca villosa, groszek nadmorski Lathyrus japonicus subsp. maritimus, turzyca piaskowa Carex arenaria, lnica wonna Linaria odora (wschodnia część wybrzeża), mikołajek nadmorski Eryngium maritimum (zwłaszcza Zatoka Pucka). Inne gatunki (honkenia, bylica polna, jastrzębiec baldaszkowaty) do oceny się nie liczą – wpisz je w zdjęciach.

Praktyka: 2013–2014 – na większości stanowisk prawie same trawy (piaskownica, kostrzewa, wydmuchrzyca), bogate tylko Poligon Morski, Wicko, Mewia Łacha, Świnoujście. 2024 – FV na 23 z 24 stanowisk (gatunki często dominują, po kilkadziesiąt procent transektu); U1 tam, gdzie piaskownica i kostrzewa rosły pojedynczo z pokryciem <0,01%.

Wskaźnik niekardynalny (jedyny w tej karcie). Dlaczego: to trawy wydmotwórcze z towarzyszami tworzą wydmę białą – bez nich jest tylko goły piasek albo już wydma szara.`,
    thresholds: thresholdsOf(SPECIES),
    inputs: [
      speciesInput(
        'Gatunki charakterystyczne na transekcie',
        'Gatunki charakterystyczne z przybliżonym pokryciem transektu w %, np. Ammophila arenaria 30, Eryngium maritimum 1. Lista trafia do karty jako „wartość”.',
      ),
      selectInput('Występowanie na transekcie', SPECIES),
      noteInput('Opis (opcjonalnie)', 'np. występuje cała gama gatunków, w tym Linaria odora', 'Krótki opis, który trafi do „wartości” w karcie zamiast listy gatunków (np. jak w karcie z przewodnika).'),
    ],
    suggest: byOption(gradeMap(SPECIES)),
    explain: (i) => {
      const names = rowNames(i.species)
      if (!names.length) return null
      const ch = new Set(names.filter(isCharacteristic2120).map((n) => findSpecies2120(n)!.polish))
      return `Gatunków charakterystycznych na liście: ${ch.size} z 8 (tab. 1).`
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (!names.length) return null
      const ch = names.filter(isCharacteristic2120)
      const other = names.filter((n) => !isCharacteristic2120(n))
      if (!ch.length && (i.choice === 'whole' || i.choice === 'single'))
        return 'Na liście nie ma żadnego z 8 gatunków charakterystycznych z tab. 1 – sprawdź wybór (bez nich to U2).'
      if (ch.length && i.choice === 'none') return 'Wybrano „Brak”, a na liście są gatunki charakterystyczne.'
      return other.length ? `Spoza listy gatunków charakterystycznych: ${other.join(', ')} – nie liczą się do oceny (wpisz je w zdjęciach).` : null
    },
    describe: (i) => String(i.note ?? '').trim() || describeSpecies(speciesRows(i.species)) || labelOf(SPECIES, i.choice),
  },
  {
    id: 'nitrophilous',
    label: 'Gatunki nitrofilne',
    parameter: 'structure',
    cardinal: true,
    description:
      'Lista gatunków nitrofilnych stwierdzonych na transekcie. Za gatunek nitrofilny w tym przypadku uznano gatunki, dla których liczba wskaźnikowa Ellenberga „N” wynosi od 7 do 9 (Ellenberg i in. 1991).',
    help: `Co wpisać: gatunki nitrofilne stwierdzone na transekcie i najwyższą ilościowość w skali Braun-Blanqueta, jaką osiąga którykolwiek z nich. Ocena liczy się sama z listy; bez listy wybierz klasę.

Nitrofilne = liczba wskaźnikowa Ellenberga N od 7 do 9. W katalogu oznaczone m.in.: ostrożeń lancetowaty Cirsium vulgare, stulisz lekarski Sisymbrium officinale, mniszek lekarski, pokrzywa zwyczajna, bylica pospolita, komosa biała, łoboda oszczepowata, przytulia czepna, perz właściwy, bez czarny. Sprawozdanie 2024 liczyło tu też szczaw kędzierzawy, starzec lepki i wiesiołek dwuletni (Władysławowo – U2, „niewykluczona antropogeniczna eutrofizacja”).

Progi: brak – FV; maksymalnie jeden gatunek o stopniu pokrycia r lub + – U1; jeden gatunek o stopniu pokrycia co najmniej 1 albo więcej niż jeden gatunek – U2.

Wskaźnik kardynalny. Dlaczego: wydma biała to uboga w azot piaszczysta pustynia – rośliny azotolubne zdradzają śmieci, odchody, nawożenie albo gnijącą kidzinę zawianą na wydmę. Praktyka: prawie zawsze FV (2013–2014: 23/23; 2024: 22/24), latem łatwiej trafić na jednoroczne nitrofile niż jesienią.`,
    thresholds: thresholdsOf(NITRO),
    inputs: [
      speciesInput('Gatunki nitrofilne na transekcie', 'Gatunki nitrofilne (Ellenberg N 7–9) stwierdzone na transekcie. Brak – zostaw pustą listę i wybierz „Brak”.'),
      {
        kind: 'select',
        name: 'abundance',
        label: 'Najwyższa ilościowość (Braun-Blanquet)',
        options: NITRO_ABUNDANCE,
        help: 'Najwyższy stopień pokrycia w skali Braun-Blanqueta, jaki osiąga którykolwiek gatunek nitrofilny na transekcie. Ważne przy jednym gatunku: r albo + to U1, 1 i wyżej – U2.',
      },
      optionalSelect('Klasa (gdy bez listy)', NITRO, 'Wybierz, gdy nie wypisujesz gatunków.'),
    ],
    suggest: (i) => nitroFromInputs(i) ?? byOption(gradeMap(NITRO))(i),
    explain: (i) => {
      const names = uniqueNames(i.species)
      if (!names.length) return null
      if (names.length > 1) return `Gatunków nitrofilnych na liście: ${names.length} – więcej niż jeden, więc U2.`
      return i.abundance ? null : 'Jeden gatunek nitrofilny – wybierz jego ilościowość (r/+ to U1, 1 i wyżej U2).'
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (i.choice === 'none' && names.length) return 'Wybrano „Brak”, a lista gatunków nitrofilnych nie jest pusta.'
      const notNitro = names.filter((n) => findSpecies2120(n) && !isNitrophilous2120(n))
      if (notNitro.length) return `W katalogu karty te gatunki nie są oznaczone jako nitrofilne (N 7–9): ${notNitro.join(', ')} – sprawdź liczbę Ellenberga.`
      const g = nitroFromInputs(i)
      if (!g || !i.choice) return null
      const chosen = gradeMap(NITRO)[String(i.choice)]
      return chosen !== g ? `Wg listy i ilościowości to ${g}, a wybrano ${chosen}.` : null
    },
    describe: (i) => {
      const list = describeSpecies(speciesRows(i.species))
      if (!list) return i.choice === 'none' ? 'brak' : labelOf(NITRO, i.choice)
      const ab = i.abundance === 'low' ? 'ilościowość r/+' : i.abundance === 'high' ? 'ilościowość ≥1' : ''
      return [list, ab].filter(Boolean).join('; ')
    },
  },
  {
    id: 'grasses',
    label: 'Kondycja i kwitnięcie/owocowanie gatunków traw',
    parameter: 'structure',
    cardinal: grassesCardinal2120,
    description:
      'Opis kondycji gatunków traw „budujących” wydmę. Wskaźnik dotyczy w głównej mierze pionierskich gatunków traw, takich jak piaskownica zwyczajna Ammophila arenaria oraz wydmuchrzyca piaskowa Leymus arenarius.',
    help: `Co ocenić: na jakiej części transektu kępy traw wydmotwórczych (piaskownica, wydmuchrzyca, trzcinnikownica) kwitną albo owocują. Wpisz procent powierzchni transektu – ma pierwszeństwo – albo tylko wybierz klasę. Kondycję (żywotność kęp, zasypywanie piaskiem, zamieranie) opisz w notatce.

Progi: obficie kwitną/owocują na co najmniej 10% transektu – FV; sporadycznie, na mniej niż 10% – U1; brak oznak kwitnięcia/owocowania – U2.

Wskaźnik kardynalny. Dlaczego: kwitnąca i owocująca piaskownica to znak, że kępy są zasypywane świeżym piaskiem i wydma żyje; zamierające, niekwitnące kępy znaczą, że dopływ piasku ustał albo płat zarasta (ocienienie – sprawozdanie 2024).

Termin ma znaczenie: przy badaniu późno (koniec września, październik) trawy bywają już po owocowaniu i ocena wychodzi zaniżona – sprawozdanie 2016–2018 podaje przykład Jeziora Wicko (2013: U1 przez późny termin, a struktura i tak FV). Jeśli tak było, w „Stanowisku” ustaw „Kondycja traw w ocenie struktury” na niekardynalny i opisz to w uwagach metodycznych.`,
    thresholds: thresholdsOf(GRASSES),
    inputs: [
      { kind: 'number', name: 'value', label: 'Kwitnące/owocujące kępy (% transektu)', unit: '%', min: 0, max: 100, help: 'Procent powierzchni transektu, na którym trawy wydmotwórcze kwitną albo owocują. 0 = brak oznak kwitnięcia. Ma pierwszeństwo przed wyborem klasy.' },
      optionalSelect('Klasa (gdy bez pomiaru)', GRASSES, 'Wybierz, gdy nie szacujesz procentu.'),
      noteInput('Kondycja traw (opcjonalnie)', 'np. trawy kwitną i owocują, ale sporadycznie', 'Krótki opis kondycji kęp. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: (i) => {
      const v = num(i.value)
      return v !== undefined ? gradeGrasses2120(v) : byOption(gradeMap(GRASSES))(i)
    },
    explain: (_i, ctx) => (ctx && !grassesCardinal2120(ctx) ? 'Na tym stanowisku wskaźnik liczony jako niekardynalny (późny termin – ustawienie w „Stanowisku”).' : null),
    warn: (i) => {
      const v = num(i.value)
      if (v === undefined || !i.choice) return null
      return gradeMap(GRASSES)[String(i.choice)] === gradeGrasses2120(v) ? null : `${pct(v)} transektu nie pasuje do wybranej klasy.`
    },
    describe: (i) => {
      const v = num(i.value)
      return [noteOr(i, GRASSES), v !== undefined ? `kwitnięcie/owocowanie na ${pct(v)} transektu` : ''].filter(Boolean).join('; ')
    },
  },
  {
    id: 'aliens',
    label: 'Występowanie gatunków obcych ekologicznie lub geograficznie',
    parameter: 'structure',
    excluded: true,
    excludedNote: 'wskaźnik pomocniczy – nie liczy się do oceny struktury (brak progów w tab. 2)',
    description:
      'Lista gatunków obcych w ekosystemie. Najczęściej spotykanymi gatunkami obcymi są sztucznie sadzone przez pracowników Urzędu Morskiego w ramach „stabilizacji” brzegu morskiego drzewiaste: róża pomarszczona Rosa rugosa, wierzba ostrolistna Salix acutifolia, wierzba wawrzynkowa Salix daphnoides i różne gatunki sosen (Pinus mugo, Pinus nigra i inne).',
    help: `Co wpisać: gatunki obce stwierdzone na transekcie (z pokryciem w %) i – orientacyjnie – klasę. Trafia do karty, ale nie zmienia oceny struktury.

Wskaźnik pomocniczy: tab. 1 przewodnika go opisuje, ale tab. 2 nie podaje progów ani nie liczy go do oceny, a sprawozdania 2013–2025 oceniają strukturę 5 wskaźnikami bez niego (gatunki obce zbierają osobno, tab. „Informacja o gatunkach obcych”). Sprawozdanie 2013–2014 proponowało zastąpić nim „gatunki nitrofilne” – nie zostało to wprowadzone. Klasy w formularzu są orientacyjne (dopowiedzenie karty).

Obce ekologicznie: krzewy i drzewa sadzone do „stabilizacji” brzegu – wierzba wawrzynkowa, kosodrzewina, sosna czarna, sosna błotna, rokitnik. Obce geograficznie: róża pomarszczona, wierzba ostrolistna (2014: na 14 stanowiskach, 2025: na 5), przymiotno kanadyjskie, czeremcha amerykańska, niecierpek drobnokwiatowy, sałata tatarska, rzepień brzegowy.

Dlaczego warto wpisać: płotki z żywych pędów wierzby i nasadzenia krzewów utrwalają piasek – sprawozdanie 2024 nazywa obsadzanie wydmy wierzbą ostrolistną kluczowym zagrożeniem dla 2120.`,
    thresholds: thresholdsOf(ALIENS),
    inputs: [
      speciesInput('Gatunki obce na transekcie', 'Gatunki obce (ekologicznie i geograficznie) z przybliżonym pokryciem transektu w %. Brak – zostaw pustą listę i wybierz „Brak”.'),
      optionalSelect('Klasa (orientacyjnie)', ALIENS, 'Klasa orientacyjna – wskaźnik pomocniczy, nie zmienia oceny struktury.'),
    ],
    suggest: (i) => {
      const names = uniqueNames(i.species)
      if (!names.length) return byOption(gradeMap(ALIENS))(i)
      return byOption(gradeMap(ALIENS))(i) ?? (names.length > 1 ? 'U2' : null)
    },
    explain: (i) => {
      const names = uniqueNames(i.species)
      const eco = names.filter((n) => findSpecies2120(n)?.group === 'alienEco')
      return eco.length ? `Nasadzenia do „stabilizacji” brzegu: ${eco.join(', ')}.` : null
    },
    warn: (i) => {
      const names = rowNames(i.species)
      if (i.choice === 'none' && names.length) return 'Wybrano „Brak”, a lista gatunków obcych nie jest pusta.'
      const other = names.filter((n) => findSpecies2120(n) && !isAlien2120(n))
      return other.length ? `Na liście gatunków obcych są gatunki rodzime: ${other.join(', ')}.` : null
    },
    describe: (i) => {
      const list = describeSpecies(speciesRows(i.species))
      if (!list && i.choice === 'none') return 'nie stwierdzono'
      return list || labelOf(ALIENS, i.choice)
    },
  },
  {
    id: 'abrasion',
    label: 'Występowanie sedymentacji/abrazji',
    parameter: 'structure',
    cardinal: true,
    description: `Opis aktualnie przeważających procesów geomorfologicznych w obrębie powierzchni zajmowanej przez siedlisko. ${SI_MGSP('Występowanie abrazji')}`,
    help: `Co wybrać: czy na transekcie przeważa akumulacja piasku (szeroka plaża, świeże nawiewy na wydmie, zasypywane kępy traw), czy abrazja (podcięta wydma, klif wydmowy, spłukane wydmy inicjalne, wąska plaża). Opisz w notatce, co widać – trafi do karty. Liczą się procesy zachodzące w roku obserwacji (sprawozdanie 2016–2018).

Progi: brak abrazji, wybrzeże akumulacyjne – FV; rzadkie podcinanie wydm – U1; wyraźnie abrazyjny odcinek wybrzeża, wyraźne spłukiwanie wydm inicjalnych do morza – U2.

Wskaźnik kardynalny. Dlaczego: po sztormach 2016–2017 sześć stanowisk straciło cechy siedliska – w miejscu transektów zostały podcięcia klifowe (2018: U2 na 11 z 23 stanowisk). 2024: U2 na 5 z 24 (Czołpino, Jastarnia, Jezioro Wicko 2, Rowy 1).`,
    thresholds: thresholdsOf(ABRASION),
    inputs: [
      selectInput('Przeważający proces', ABRASION),
      noteInput('Co widać (opcjonalnie)', 'np. brak śladów abrazji brzegu morskiego', 'Krótki opis procesów: szerokość plaży, podcięcia, klif wydmowy, nawiewy. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(ABRASION)),
    describe: (i) => noteOr(i, ABRASION),
  },
  {
    id: 'damage',
    label: 'Zniszczenia mechaniczne',
    parameter: 'structure',
    cardinal: true,
    description: `Obserwowanie na transekcie i w zasięgu wzroku obecności zniekształcenia siedliska w postaci rozjeżdżania, wydeptania, przekształcania wydm białych na tereny użytkowane rekreacyjnie. ${SI_MGSP('Mechaniczne zniszczenie')}`,
    help: `Co ocenić: ślady rozjeżdżania (quady, sprzęt do sprzątania plaż, pojazdy służb), wydeptania, plażowania na wydmie, wydeptane ścieżki i nielegalne zejścia na plażę, przekształcanie wydmy na teren rekreacyjny. Patrz na transekcie i w zasięgu wzroku. Krótki opis w notatce trafi do karty.

Progi: brak – FV; nieliczne ślady przejazdu pojazdów, ścieżki itp. – U1; wyraźne zniszczenia spowodowane przejazdami pojazdów oraz działalnością człowieka – U2.

Wskaźnik kardynalny. Dlaczego: wydeptana wydma traci roślinność i zaczyna się rozwiewać. Termin ma znaczenie: po sezonie (jesienią) ślady bywają słabsze niż wiosną i latem (sprawozdanie 2016–2018) – zapisz termin w uwagach. 2024: U2 na 3 z 24 stanowisk (Chałupy, Piaski, Rowy 1).`,
    thresholds: thresholdsOf(DAMAGE),
    inputs: [
      selectInput('Zniszczenia', DAMAGE),
      noteInput('Opis zniszczeń (opcjonalnie)', 'np. nie stwierdzono', 'Krótki opis, co zniszczyło wydmę. Gdy jest, trafia do „wartości” w karcie zamiast etykiety klasy.'),
    ],
    suggest: byOption(gradeMap(DAMAGE)),
    describe: (i) => noteOr(i, DAMAGE),
  },
]

// ---------- pola stanowiska ----------

const coordHelp = (where: string) =>
  `Współrzędne geograficzne ${where} transektu, z odbiornika GPS (WGS84). Trzymaj jeden format w całej karcie.

Dlaczego: brzeg się przesuwa z każdym sztormem, ale transekt ma być ten sam – za 3 lata ktoś musi przejść ten sam pas i porównać.`

const siteFields: FieldDef[] = [
  {
    kind: 'text',
    name: 'siteName',
    label: 'Nazwa stanowiska',
    required: true,
    placeholder: 'np. Jezioro Wicko',
    help: `Nazwa, pod którą stanowisko funkcjonuje w Państwowym Monitoringu Środowiska – zwykle miejscowość albo obiekt, np. „Jezioro Wicko”, „Mewia Łacha”, „Czołpino koło rezerwatu”.

Dlaczego: stabilna nazwa (razem z GUID) pozwala zestawić kolejne karty tego samego odcinka brzegu.`,
  },
  pickField(methodology7120.siteFields, 'guid'),
  {
    kind: 'text',
    name: 'communities',
    label: 'Zbiorowiska roślinne',
    required: true,
    defaultValue: 'Elymo-Ammophiletum arenariae',
    placeholder: 'np. Elymo-Ammophiletum arenariae',
    help: `Zbiorowiska roślinne na stanowisku, nazwami fitosocjologicznymi. Dla 2120: klasa Ammophiletea, rząd Ammophiletalia, związek Ammophilion borealis, zespół Elymo-Ammophiletum arenariae. Sąsiadują: wydmy inicjalne 2110 od strony morza i wydmy szare 2130 (Helichryso-Jasionetum litoralis) od strony lądu.`,
  },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Opis siedliska na stanowisku',
    rows: 8,
    required: true,
    hint: 'Gdzie leży pas wydmy białej, typ brzegu, jak wyglądają kępy traw, sukcesja, antropopresja.',
    help: `Krótka charakterystyka przyrodnicza stanowiska:
• położenie pasa wydmy białej (wydma przednia, wały i kopce wydmowe), jego szerokość i ciągłość;
• typ brzegu: akumulacyjny czy abrazyjny, podcięcia po sztormach;
• jak wyglądają kępy traw: zasypywane świeżym piaskiem czy zamierające, zwarcie;
• sukcesja w kierunku wydmy szarej 2130, nasadzenia drzew i krzewów;
• antropopresja: wejścia na plażę, płotki faszynowe, ogrodzenia, wydeptywanie.

Za stanowisko przyjmuje się dający się wyodrębnić w terenie, w miarę jednorodny i ciągły w przestrzeni pas nadmorskich wydm białych. Powierzchnia stanowisk – najczęściej od kilkunastu arów do kilkudziesięciu hektarów.`,
  },
  {
    kind: 'number',
    name: 'areaHa',
    label: 'Powierzchnia płatów siedliska',
    unit: 'ha',
    min: 0,
    required: true,
    help: 'Łączna powierzchnia płatów siedliska na stanowisku, w hektarach – zwykle od kilkunastu arów do kilkudziesięciu hektarów (1 ha w karcie z przewodnika). Oszacuj w terenie albo z ortofotomapy.',
  },
  pickField(methodology7120.siteFields, 'protectedAreas', {
    hint: 'Np. „Słowiński Park Narodowy; rezerwat Helskie Wydmy”. Brak – „brak”.',
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
    hint: 'Pasowy transekt 200×10 m wzdłuż pasa wydmy białej.',
    help: `Na stanowisku wytycza się pasowy transekt o szerokości 10 m i długości 200 m, na którym ocenia się wskaźniki struktury i funkcji. Co 100 m (na początku, w środku i na końcu) robi się zdjęcie fitosocjologiczne 5×5 m.

Gdy pas wydmy białej jest krótszy niż 200 m, wpisz faktyczną długość i opisz to w uwagach metodycznych.`,
  },
  {
    kind: 'text',
    name: 'altitude',
    label: 'Wysokość n.p.m.',
    unit: 'm n.p.m.',
    required: true,
    placeholder: 'np. 5–7',
    help: 'Wysokość wydmy białej nad poziomem morza – zwykle kilka metrów (5–7 m w karcie z przewodnika). Można wpisać zakres („5–7”).',
  },
  {
    kind: 'date',
    name: 'date',
    label: 'Data obserwacji',
    placeholder: 'DD.MM.RRRR, np. 28.09.2013',
    required: true,
    hint: 'Optymalnie od czerwca do października.',
    help: `Dzień badań terenowych. Optymalny termin: czerwiec–październik. Ze względu na dynamikę siedliska i prognozowane podniesienie poziomu morza stanowiska kontroluje się co 3 lata.

Uwaga (sprawozdanie 2016–2018): latem łatwiej o jednoroczne gatunki nitrofilne i ślady wydeptywania, a późno (koniec września, październik) trawy bywają już po owocowaniu – zapisz termin w uwagach.`,
    warn: (v) => {
      if (!isIsoDate(v)) return null
      const m = Number(v.split('-')[1])
      return m >= 6 && m <= 10 ? null : 'Termin poza optymalnym oknem (czerwiec–październik).'
    },
  },
  {
    kind: 'select',
    name: 'grassesRole',
    label: 'Kondycja traw w ocenie struktury',
    options: GRASSES_ROLE,
    hint: 'Zostaw „Kardynalny”, chyba że trawy były już po owocowaniu z powodu późnego terminu.',
    help: `Metodyka: „Kondycja i kwitnięcie/owocowanie gatunków traw” to wskaźnik kardynalny – U1 obniża strukturę do U1.

Wyjątek z praktyki (dopowiedzenie karty): przy późnym terminie trawy bywają już po owocowaniu i wskaźnik wychodzi zaniżony. Karta z przewodnika (Jezioro Wicko, 28.09.2013) ma kondycję U1 i strukturę FV, a sprawozdanie 2016–2018 tłumaczy tę U1 właśnie późnym terminem. Sprawozdanie 2013–2014 proponowało w ogóle odebrać temu wskaźnikowi status kardynalnego.

„Niekardynalny” = ocena ekspercka: wskaźnik dalej jest w karcie, ale U1 nie obniża struktury (U2 nadal tak, jak przy każdym niekardynalnym). Uzasadnij to w uwagach metodycznych.`,
    warn: (v) => (v === 'late' ? 'Kondycja traw liczona jako niekardynalna – uzasadnij to w uwagach metodycznych.' : null),
  },
  pickField(methodology7120.siteFields, 'observer'),
]

// ---------- zdjęcia fitosocjologiczne: 3 × 5×5 m co 100 m ----------

const r7120 = methodology7120.releves.fields

const layerNumber = (name: string, label: string, group: string, unit: string, help: string, max?: number): FieldDef => ({
  kind: 'number',
  name,
  group,
  label,
  unit,
  min: 0,
  ...(max !== undefined ? { max } : {}),
  help,
})

const releveFields: FieldDef[] = [
  pickField(r7120, 'coords', {
    help: 'Współrzędne GPS środka zdjęcia. Zdjęcia robi się na początku, w środku i na końcu transektu (co 100 m).',
  }),
  pickField(r7120, 'altitude', { help: 'Wysokość nad poziomem morza środka zdjęcia, zwykle kilka metrów (7 m w karcie z przewodnika).' }),
  pickField(r7120, 'area', {
    defaultValue: 25,
    help: 'Powierzchnia zdjęcia w m². Metodyka: poletka 5×5 m = 25 m².',
  }),
  pickField(r7120, 'slope', { help: 'Nachylenie powierzchni w stopniach. Na grzbiecie wydmy zwykle 0°, na stoku więcej.' }),
  pickField(r7120, 'exposure', { help: 'Kierunek, w którym opada powierzchnia (N, NE…). Dla powierzchni płaskiej wpisz „brak”.' }),
  layerNumber('coverB', 'Zwarcie B', 'Zwarcie warstw', '%', 'Procent powierzchni zdjęcia pokryty przez krzewy (warstwa B) – zwykle nasadzenia wierzby, róży, sosen. Bez krzewów zostaw puste.', 100),
  layerNumber('coverC', 'Zwarcie C', 'Zwarcie warstw', '%', 'Procent powierzchni zdjęcia pokryty przez rośliny zielne (warstwa C). Na wydmie białej zwykle 15–40%.', 100),
  layerNumber('heightB', 'Wysokość B', 'Wysokość warstw', 'm', 'Typowa wysokość krzewów w warstwie B, w metrach. Bez krzewów zostaw puste.'),
  layerNumber('heightC', 'Wysokość C', 'Wysokość warstw', 'cm', 'Typowa wysokość roślin w warstwie C, w centymetrach (kępy piaskownicy zwykle 30–100 cm).'),
  pickField(r7120, 'unit', {
    placeholder: 'np. Elymo-Ammophiletum arenariae',
    help: 'Jednostka fitosocjologiczna zdjęcia – dla wydmy białej Elymo-Ammophiletum arenariae.',
  }),
  pickField(r7120, 'species', {
    label: 'Gatunki (skala Braun-Blanqueta)',
    help: 'Wszystkie gatunki naczyniowe w poletku z ilościowością w skali Braun-Blanqueta (r, +, 1–5). Zielne w warstwie C; sadzone krzewy i drzewa (wierzby, róża, sosny) – w B.',
  }),
]

export const methodology2120: Methodology = {
  code: '2120',
  name: 'Nadmorskie wydmy białe',
  source:
    'Lemke D. 2015, Nadmorskie wydmy białe (Elymo-Ammophiletum) (2120), [w:] Mróz W. (red.), Monitoring siedlisk przyrodniczych. Przewodnik metodyczny, cz. IV, GIOŚ, s. 66–74 (tab. 1 i 2); praktyka oceny ze sprawozdań z monitoringu 2013–2014, 2016–2018 i 2023–2025',

  siteFields,

  releves: {
    defaultCount: 3,
    intro:
      'Na transekcie co 100 m (na początku, w środku i na końcu) wykonaj zdjęcie fitosocjologiczne klasyczną metodą Braun-Blanqueta na poletku 5×5 m. Zielne w warstwie C, nasadzenia krzewów w B.',
    fields: releveFields,
  },

  indicators,

  prospects: {
    description:
      'Ocena realnych możliwości utrzymania siedliska we właściwej kondycji, uwzględniająca jego obecny stan zachowania oraz czynniki, mogące na nie oddziaływać w najbliższej przyszłości. W tej kwestii należy wziąć pod uwagę przede wszystkim zagrożenia związane z presją rozwoju infrastruktury turystycznej.',
    help: `Weź pod uwagę cały odcinek brzegu, nie tylko transekt: presję rozwoju infrastruktury turystycznej (przewodnik wskazuje ją jako główne zagrożenie), wydeptywanie i nielegalne zejścia na plażę, abrazję i sztormy, sukcesję w kierunku wydmy szarej, nasadzenia wierzby ostrolistnej, róży i sosen, płotki faszynowe.

Działania ochronne, o których warto wspomnieć: grodzenie najbardziej zagrożonych fragmentów (siatka, pniaki, pastuchy dla siewkowatych), likwidacja nielegalnych przejść, edukacja, ograniczenie płotków faszynowych, usuwanie nasadzeń wierzb i sosen, nasadzenia piaskownicy w ich miejsce; na części stanowisk ochrona bierna.

Praktyka 2018: sprawozdanie proponuje oceniać perspektywy w horyzoncie do 10 lat (okres PZO, PUL) i pyta, jak przy ocenie FV pominąć sztormy – zapisz w uwagach, jak je potraktowałeś.`,
    thresholds: {
      FV: 'Perspektywy zachowania siedliska dobre lub doskonałe, nie przewiduje się oddziaływania czynników zagrażających',
      U1: 'Perspektywy zachowania siedliska dobre, przy czym obserwowany jest wpływ czynników, które jednak w dłuższej perspektywie czasowej nie powinny zagrozić zasobom siedliska',
      U2: 'Perspektywy zachowania siedliska złe, obserwowany silny wpływ czynników zagrażających, nie można zagwarantować przetrwania siedliska w dłuższej perspektywie czasowej',
    },
  },

  impactCodes: [
    { code: 'B01', name: 'Zalesianie terenów otwartych' },
    { code: 'C01.01.02', name: 'Usuwanie materiału z plaż' },
    { code: 'D01.01', name: 'Ścieżki, szlaki piesze, szlaki rowerowe' },
    { code: 'D05', name: 'Usprawniony dostęp do obszaru' },
    { code: 'E01.02', name: 'Nieciągła miejska zabudowa' },
    { code: 'E03.01', name: 'Pozbywanie się odpadów z gospodarstw domowych / obiektów rekreacyjnych' },
    { code: 'G01', name: 'Sporty i różne formy czynnego wypoczynku, uprawiane w plenerze' },
    { code: 'G01.02', name: 'Turystyka piesza, jazda konna i jazda na pojazdach niezmotoryzowanych' },
    { code: 'G01.03', name: 'Pojazdy zmotoryzowane' },
    { code: 'G02', name: 'Infrastruktura sportowa i rekreacyjna' },
    { code: 'G05.01', name: 'Wydeptywanie, nadmierne użytkowanie' },
    { code: 'G05.05', name: 'Intensywne utrzymywanie parków publicznych / oczyszczanie plaż' },
    { code: 'H05.01', name: 'Odpadki, śmieci i odpady stałe' },
    { code: 'I01', name: 'Obce gatunki inwazyjne' },
    { code: 'J02.11', name: 'Zmiana w procesie odkładania się osadów, zrzut, odkładanie wybagrowanych materiałów' },
    { code: 'J02.12.01', name: 'Prace związane z obroną przed aktywnością morza i ochroną wybrzeży, groble' },
    { code: 'K01.01', name: 'Erozja' },
    { code: 'K01.05', name: 'Zmiany w procesie sedymentacji' },
    { code: 'K02', name: 'Ewolucja biocenotyczna, sukcesja' },
    { code: 'K02.01', name: 'Zmiana składu gatunkowego (sukcesja)' },
    { code: 'L07', name: 'Sztorm, cyklon' },
    { code: 'M01.07', name: 'Zmiana poziomu morza' },
    { code: 'X', name: 'Brak zagrożeń i nacisków' },
  ],

  otherFields: methodology7120.otherFields.map((f): FieldDef => {
    if (f.name === 'otherValues')
      return {
        ...f,
        hint: 'Np. mikołajek nadmorski, lnica wonna; sąsiedztwo 2110, 2130.',
        help: 'Wartości przyrodnicze stanowiska poza samą wydmą białą: gatunki chronione i rzadkie (mikołajek nadmorski Eryngium maritimum, lnica wonna Linaria odora, groszek nadmorski), sąsiednie siedliska (wydmy inicjalne 2110, wydmy szare 2130, bażyny 2140), ptaki siewkowe na plaży. Brak informacji – „Nie stwierdzono” albo „Nie pozyskano danych”.',
      }
    if (f.name === 'conservation')
      return {
        ...f,
        help: `Jakie działania ochronne wykonano i jaka jest ich skuteczność, oraz co proponujesz. Typowe dla 2120: grodzenie najbardziej zagrożonych fragmentów od plaży, likwidacja nielegalnych przejść, edukacja, rezygnacja z płotków z żywych pędów wierzby, usuwanie nasadzeń wierzby ostrolistnej, róży pomarszczonej i sosen, nasadzenia piaskownicy. Brak działań – „Nie prowadzono”.`,
      }
    return f
  }),

  speciesCatalog: SPECIES_2120.map((s) => ({ value: s.latin, label: s.polish ?? '', layer: defaultLayer2120(s) })),
  speciesInfo: (name) => {
    const e = findSpecies2120(name)
    if (!e) return undefined
    return isDuneGrass2120(name) ? `${GROUP_LABELS_2120[e.group]}, trawa wydmotwórcza` : GROUP_LABELS_2120[e.group]
  },
}

/** Wskaźnik po id (do testów i przykładów). */
export const indicator2120 = (id: string): IndicatorDef => {
  const i = methodology2120.indicators.find((x) => x.id === id)
  if (!i) throw new Error(`Brak wskaźnika ${id} w metodyce 2120`)
  return i
}
