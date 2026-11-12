// Pola wspólne dla kart w standardzie PZO RDOŚ we Wrocławiu (wzór: PLH020050_6510_02.xlsx i PLH020050_6510_06.xlsx).
// Ten standard odbiega od karty GIOŚ: „część ogólna” ma kod stanowiska zamiast nazwy, kod i nazwę obszaru Natura 2000,
// każdy wskaźnik ma obok oceny rzeczywistej ocenę referencyjną z prognozą, a karta kończy się tabelą działań ochronnych.
// Wszystko, czego nie ma w silniku karty GIOŚ, siedzi tutaj i trafia do `values.other` (zakładki dodatkowe).
import { GRADES, type ExtraStep, type FieldDef, type IndicatorDef, type InputValues, type SelectOption } from '../7120/habitats/types'
import { ACTION_CHARACTER, ACTION_GOALS, ACTION_KINDS, ACTION_TYPES, IMPACT_DICT, N2K_AREAS } from './dictionaries'

export const RDOS_TERM_DEFAULT = 'od momentu aktualizacji planu zadań ochronnych'

/** Klucze pól oceny referencyjnej w `values.other` dla wskaźnika (albo „prospects”). */
export const refKeys = (id: string) => ({
  grade: `ref_${id}_grade`,
  value: `ref_${id}_value`,
  term: `ref_${id}_term`,
  reason: `ref_${id}_reason`,
})

const GRADE_OPTIONS: SelectOption[] = GRADES.map((g) => ({ value: g, label: g }))

export const n2kName = (code: unknown) => N2K_AREAS.find((a) => a.code === String(code ?? '').trim().toUpperCase())?.name

// ---------- część ogólna ----------

/**
 * Pola „części ogólnej” w kolejności z arkusza. `community` i `extra` pozwalają dopiąć to, co specyficzne dla siedliska
 * (lista zbiorowisk, wariant regionalny gatunków charakterystycznych).
 */
export function rdosSiteFields(o: {
  code: string
  communityHelp: string
  communityPlaceholder: string
  dateHint: string
  dateWarn?: (v: unknown) => string | null
  extra?: FieldDef[]
}): FieldDef[] {
  return [
    {
      kind: 'text',
      name: 'siteName',
      label: 'Kod stanowiska',
      required: true,
      placeholder: `np. PLH020050_${o.code}_02`,
      hint: 'Kod obszaru Natura 2000_kod siedliska_numer stanowiska. Taki sam jak nazwa pliku karty.',
      help: `Kod stanowiska w formule: kod obszaru Natura 2000_kod siedliska_numer stanowiska, np. „PLH020050_${o.code}_02”. Kod musi być zgodny z nazwą pliku karty – formularz nazywa pliki .xlsx, .docx i .zip właśnie tym kodem.

Dlaczego: w dokumentacji PZO stanowisko identyfikuje się wyłącznie kodem. Z kodu powstają też nazwy plików zdjęć (np. PLH020050_${o.code}_02_1_Kowalski).`,
      warn: (v) => {
        const s = String(v ?? '').trim()
        if (!s) return null
        return new RegExp(`^PL[BCH]\\d{6}_${o.code}_\\w+$`).test(s) ? null : `Kod nie ma postaci „PLH000000_${o.code}_01” (obszar_siedlisko_numer).`
      },
    },
    {
      kind: 'text',
      name: 'community',
      label: 'Zbiorowisko roślinne',
      required: true,
      placeholder: o.communityPlaceholder,
      help: o.communityHelp,
    },
    ...(o.extra ?? []),
    {
      kind: 'number',
      name: 'areaHa',
      label: 'Powierzchnia płatów siedliska',
      unit: 'ha',
      min: 0,
      required: true,
      help: `Łączna powierzchnia płatów siedliska na stanowisku, w hektarach (np. 0,66). W karcie trafia jako „0,66 ha”. Najlepiej z GIS (granice płatu na ortofotomapie) albo pomiaru GPS.

Dlaczego: to wartość wskaźnika „Powierzchnia siedliska”. Spadek względem poprzednich ekspertyz obniża ocenę parametru.`,
    },
    {
      kind: 'text',
      name: 'transect',
      label: 'Wymiary transektu',
      defaultValue: '10 x 200 m',
      required: true,
      help: `Faktyczne wymiary transektu. Standard to pas 10×200 m. Gdy płat jest za mały albo ma nieregularny kształt, zastępuje się go 20-arową powierzchnią o innych wymiarach (np. 20 x 100 m) – wpisz faktyczne wymiary.

Dlaczego: pokrycia (%) w ocenie wskaźników liczy się względem powierzchni transektu.`,
    },
    {
      kind: 'date',
      name: 'date',
      label: 'Data obserwacji',
      required: true,
      placeholder: 'DD.MM.RRRR',
      hint: o.dateHint,
      help: `Dzień (pierwszy) obserwacji na stanowisku. Kolejne daty wpisz w polu niżej – w karcie trafią wszystkie, w kolejności chronologicznej.

Dlaczego: ocena łąki zależy od fenologii – po pokosie nie da się ocenić składu ani pokrycia.`,
      warn: o.dateWarn,
    },
    {
      kind: 'text',
      name: 'datesExtra',
      label: 'Kolejne daty obserwacji',
      placeholder: 'np. 14.07.2025, 02.09.2025',
      help: 'Pozostałe daty kontroli stanowiska, oddzielone przecinkami, w kolejności chronologicznej. Gdy była jedna wizyta – zostaw puste.',
    },
    {
      kind: 'text',
      name: 'n2kCode',
      label: 'Kod obszaru Natura 2000',
      required: true,
      placeholder: 'np. PLH020050',
      hint: 'Nazwa obszaru uzupełnia się sama dla obszarów ze słownika RDOŚ we Wrocławiu.',
      help: `Kod obszaru Natura 2000, w którym leży stanowisko (np. PLH020050). Słownik karty zawiera 94 obszary województwa dolnośląskiego – dla nich nazwa obszaru wypełnia się w arkuszu sama. Dla obszaru spoza słownika wpisz nazwę w polu niżej.`,
      warn: (v) => {
        const s = String(v ?? '').trim()
        if (!s) return null
        const name = n2kName(s)
        return name ? `Obszar: ${name}.` : 'Kod spoza słownika RDOŚ we Wrocławiu – wpisz nazwę obszaru w polu niżej.'
      },
    },
    {
      kind: 'text',
      name: 'n2kName',
      label: 'Nazwa obszaru Natura 2000 (spoza słownika)',
      help: 'Wypełnij tylko wtedy, gdy kodu obszaru nie ma w słowniku karty (obszary spoza województwa dolnośląskiego). W pozostałych przypadkach arkusz bierze nazwę ze słownika.',
    },
    {
      kind: 'textarea',
      name: 'description',
      label: 'Opis siedliska na stanowisku',
      rows: 6,
      required: true,
      help: `Krótka charakterystyka siedliska: położenie płatu (terasa, skarpa, dolina), typ siedliska i jego zróżnicowanie, rodzaje siedlisk w otoczeniu stanowiska, sposób użytkowania.

Dlaczego: to jedyny opis, z którego kolejny ekspert dowie się, czego się spodziewać na stanowisku.`,
    },
    {
      kind: 'textarea',
      name: 'history',
      label: 'Informacje o siedlisku na stanowisku',
      rows: 4,
      help: `Syntetyczne informacje o występowaniu siedliska na stanowisku: dotychczasowe badania, wyniki z lat poprzednich, inne istotne fakty. Gdy płat nie był wcześniej wykazany – napisz to wprost (np. „Płat nie wykazany w poprzednich ekspertyzach.”).

Dlaczego: porównanie z poprzednimi danymi to podstawa oceny powierzchni i trendu.`,
    },
    {
      kind: 'text',
      name: 'observer',
      label: 'Obserwator',
      required: true,
      placeholder: 'np. Jan Kowalski',
      help: 'Wszyscy eksperci prowadzący badania na stanowisku, oddzieleni przecinkami. Nazwisko pierwszego trafia do nazw plików zdjęć (np. …_1_Kowalski).',
    },
  ]
}

// ---------- zdjęcia fitosocjologiczne ----------

/** Pola zdjęcia fitosocjologicznego z łąkowej karty GIOŚ, ze współrzędnymi w PL-1992 jak w arkuszu RDOŚ. */
export function rdosReleveFields(base: FieldDef[]): FieldDef[] {
  return base.map((f) =>
    f.name === 'coords'
      ? {
          ...f,
          label: 'Współrzędne w układzie PL-1992',
          placeholder: 'np. X 345678, Y 456789',
          help: 'Współrzędne środka poletka 5×5 m w układzie PL-1992 (EPSG:2180), tak jak wymaga arkusz RDOŚ. Zdjęcia robi się na początku, w środku i na końcu transektu.\n\nDlaczego: zdjęcia powtarza się dokładnie w tych samych miejscach – to najdokładniejszy zapis zmian roślinności.',
        }
      : f,
  )
}

// ---------- inne informacje ----------

export function rdosOtherFields(): FieldDef[] {
  return [
    {
      kind: 'textarea',
      name: 'conservation',
      label: 'Wykonywane działania ochronne i ocena ich skuteczności',
      rows: 3,
      help: `Jakie działania ochronne są prowadzone (koszenie, wypas, pakiety PRŚK, usuwanie nalotu) i czy działają. Brak – „Brak”.

Dlaczego: bez tej informacji nie da się odróżnić naturalnych zmian od efektów (albo braku efektów) ochrony.`,
    },
    {
      kind: 'textarea',
      name: 'otherValues',
      label: 'Inne wartości przyrodnicze',
      rows: 3,
      help: 'Rzadkie i chronione gatunki stwierdzone na stanowisku, z informacją o ich liczebności, sąsiedztwo innych cennych siedlisk. Brak – „Nie stwierdzono”.',
    },
    {
      kind: 'textarea',
      name: 'alienSpecies',
      label: 'Gatunki obce i inwazyjne',
      rows: 2,
      hint: 'Puste – arkusz weźmie listę ze wskaźnika „Obce gatunki inwazyjne”.',
      help: 'Gatunki obce i inwazyjne na stanowisku z informacją o liczebności albo zajmowanej powierzchni. Gdy zostawisz puste, do arkusza trafi wartość wskaźnika „Obce gatunki inwazyjne” (albo „Brak”).',
    },
    {
      kind: 'photos',
      name: 'photos',
      label: 'Dokumentacja fotograficzna',
      help: `Wgraj zdjęcia albo dodaj same podpisy. W podpisie napisz, co przedstawia zdjęcie, np. „zdjęcie fitosocjologiczne nr 1” albo „widok ogólny stanowiska”.

W arkuszu nazwy plików powstają według wzoru RDOŚ: kod stanowiska_numer_nazwisko pierwszego obserwatora, np. „PLH020050_6510_02_1_Kowalski – zdjęcie fitosocjologiczne nr 1”.`,
    },
    {
      kind: 'textarea',
      name: 'notes',
      label: 'Uwagi',
      rows: 3,
      help: 'Np. GUID płatu z dokumentacji PZO, problemy z dostępem, nietypowe warunki w dniu obserwacji.',
    },
  ]
}

// ---------- ocena referencyjna (PZO) ----------

const refHelp = (label: string) =>
  `Ocena referencyjna wskaźnika „${label}”: stan, jaki ma osiągnąć siedlisko dzięki działaniom z planu zadań ochronnych.
• Ocena referencyjna – zwykle FV; niższa tylko wtedy, gdy FV jest nieosiągalne.
• Prognozowana wartość – wartość wskaźnika przy ocenie referencyjnej (np. „<2 cm”, „100%”, „Brak”).
• Termin – kiedy wartość zostanie osiągnięta; najczęściej „${RDOS_TERM_DEFAULT}”.
• Uzasadnienie – tylko gdy ocena referencyjna jest gorsza niż FV: dlaczego nie da się jej poprawić.`

function refGroup(id: string, label: string): FieldDef[] {
  const k = refKeys(id)
  return [
    { kind: 'select', name: k.grade, group: label, groupCols: 2, label: 'Ocena referencyjna', options: GRADE_OPTIONS, help: refHelp(label) },
    { kind: 'text', name: k.term, group: label, label: 'Termin osiągnięcia', placeholder: RDOS_TERM_DEFAULT, help: refHelp(label) },
    { kind: 'textarea', name: k.value, group: label, rows: 1, label: 'Prognozowana wartość', help: refHelp(label) },
    { kind: 'textarea', name: k.reason, group: label, rows: 1, label: 'Uzasadnienie braku możliwości osiągnięcia FV', help: refHelp(label) },
  ]
}

// ---------- działania ochronne ----------

const dictOptions = (entries: { label: string }[]): SelectOption[] => entries.map((e) => ({ value: e.label, label: e.label }))

export const ACTION_COLUMNS: FieldDef[] = [
  { kind: 'select', name: 'type', label: 'Typ działania', options: dictOptions(ACTION_TYPES), required: true, help: 'Typ działania ze słownika PZO, np. „Ochrona czynna”, „Monitoring stanu przedmiotów ochrony”.' },
  { kind: 'select', name: 'kind', label: 'Rodzaj działania', options: dictOptions(ACTION_KINDS), required: true, help: 'Rodzaj działania ze słownika PZO. Dla łąk najczęściej „prowadzenie na terenie siedlisk przyrodniczych ekstensywnego użytkowania kośnego z usunięciem biomasy lub/i wypasu”.' },
  { kind: 'select', name: 'goal', label: 'Cel działania', options: dictOptions(ACTION_GOALS), required: true, help: 'Cel działania ze słownika PZO – zwykle wynika z oceny rzeczywistej i referencyjnej (np. U2 → FV: „Poprawa stanu zachowania ze złego na właściwy”). Dla monitoringu: „Nie dotyczy”.' },
  { kind: 'select', name: 'character', label: 'Charakter działania', options: ACTION_CHARACTER.map((c) => ({ value: c, label: c })), help: 'Obligatoryjne, fakultatywne albo nie dotyczy.' },
  { kind: 'textarea', name: 'description', label: 'Opis działania', rows: 2, required: true, help: 'Co, jak i kiedy, np. „coroczne ekstensywne koszenie po 15 czerwca z usunięciem biomasy”. Gdy działania nie są potrzebne, wpisz „BRAK KONIECZNOŚCI DZIAŁAŃ OCHRONNYCH” i/lub „BRAK KONIECZNOŚCI MONITORINGU”, a w uwagach wyjaśnij dlaczego.' },
  { kind: 'text', name: 'term', label: 'Termin realizacji', placeholder: 'np. co roku w terminie po 15 czerwca' },
  { kind: 'textarea', name: 'responsible', label: 'Podmiot odpowiedzialny za wykonanie', rows: 1, placeholder: 'np. RDOŚ we Wrocławiu' },
  { kind: 'textarea', name: 'notes', label: 'Uwagi', rows: 1, help: 'Np. szacunkowy koszt („5000 zł/ha/rok”) albo wyjaśnienie braku konieczności działań.' },
  { kind: 'text', name: 'area', label: 'Nr rekordu z warstwy działań', help: 'Jeśli obszar wdrażania jest taki sam jak powierzchnia stanowiska – zostaw puste. Jeśli inny – nr rekordu działania z dodatkowej warstwy działań ochronnych.' },
]

/** Zakładki „Ocena referencyjna” i „Działania ochronne” dla podanych wskaźników. */
export function rdosExtraSteps(indicators: IndicatorDef[]): ExtraStep[] {
  return [
    {
      id: 'reference',
      tab: 'Ocena referencyjna',
      title: 'Ocena referencyjna i prognoza (PZO)',
      after: 'status',
      intro:
        'Standard RDOŚ: dla każdego wskaźnika i parametru podaj ocenę referencyjną, prognozowaną wartość i termin jej osiągnięcia. Uzasadnienie wpisz tylko tam, gdzie FV jest nieosiągalne. Ocenę referencyjną struktury i ocenę ogólną arkusz policzy sam.',
      fields: [...indicators.flatMap((i) => refGroup(i.id, i.label)), ...refGroup('prospects', 'Perspektywy zachowania')],
    },
    {
      id: 'actions',
      tab: 'Działania ochronne',
      title: 'Działania ochronne',
      after: 'threats',
      intro:
        'Działania do planu zadań ochronnych, ze słowników PZO. Gdy działania nie są potrzebne, dodaj jeden wiersz z opisem „BRAK KONIECZNOŚCI DZIAŁAŃ OCHRONNYCH” i/lub „BRAK KONIECZNOŚCI MONITORINGU”.',
      fields: [
        {
          kind: 'table',
          name: 'actions',
          label: 'Działania ochronne',
          rowLabel: 'Działanie',
          addLabel: 'Dodaj działanie',
          columns: ACTION_COLUMNS,
          help: 'Każde działanie to osobny wiersz arkusza „działania”. Typ, rodzaj i cel są ze słowników PZO – w arkuszu obok pojawią się ich kody.',
        },
      ],
    },
  ]
}

/** Nazwa oddziaływania ze słownika karty (albo sam kod, gdy go nie ma). */
export const impactName = (code: string) => IMPACT_DICT.find((d) => d.code === code)?.name ?? code

/** Kody oddziaływań do podpowiedzi: słownik z arkusza RDOŚ. */
export const RDOS_IMPACT_CODES = IMPACT_DICT

/** Ocena referencyjna z wartości karty. */
export function refOf(other: InputValues | undefined, id: string) {
  const k = refKeys(id)
  const s = (key: string) => String(other?.[key] ?? '').trim()
  return { grade: s(k.grade), value: s(k.value), term: s(k.term), reason: s(k.reason) }
}
