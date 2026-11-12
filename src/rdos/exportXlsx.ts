// Eksport karty do .xlsx w układzie arkuszy RDOŚ we Wrocławiu (wzór: PLH020050_6510_02.xlsx, PLH020050_6510_06.xlsx):
// „część ogólna”, „zdjęcia fitosocjologiczne”, „ocena”, „oddziaływania_zagrożenia”, „działania” i ukryte „słowniki”.
// Formuły (nazwa obszaru, nazwy oddziaływań, kody działań, odwołania do kodu stanowiska) są zapisane razem z policzoną
// wartością, więc plik wygląda poprawnie od razu, a Excel i tak przelicza je przy otwarciu.
// Różnice wobec wzoru: naprawione odwołania #REF! (kod siedliska, kody działań przesunięte o wiersz) i brak
// pustych formuł w nieużywanych wierszach (we wzorze dawały #N/D).
import { aggregateOverall, aggregateStructure, assessCard, isCardinal, isExcluded, num } from '../7120/habitats/assessment'
import { isoToPl } from '../7120/habitats/dates'
import {
  BB_LABELS,
  BRAUN_BLANQUET,
  LAYERS,
  type CardValues,
  type FieldDef,
  type GradeOrEmpty,
  type InputValues,
  type Methodology,
  type PhotoRow,
  type ReleveSpeciesRow,
} from '../7120/habitats/types'
import type { CardExport } from '../7120/components/habitat-form/HabitatCardForm'
import { ACTION_CHARACTER, ACTION_GOALS, ACTION_KINDS, ACTION_TYPES, IMPACT_DICT, N2K_AREAS } from './dictionaries'
import { n2kName, refOf } from './fields'
import { STYLE, Sheet, buildXlsx, ref, sheetRef } from './xlsx'

export interface RdosProfile {
  /** Nazwa siedliska w B1 „części ogólnej” (brzmienie z rozporządzenia, jak w arkuszu RDOŚ). */
  habitatName: string
  /** Etykiety wierszy arkusza „ocena”, gdy RDOŚ nazywa wskaźnik inaczej niż przewodnik (id → etykieta). */
  rowLabels?: Record<string, string>
  /** Podpowiedzi w kolumnie H arkusza „ocena” (id → tekst); domyślne są w HINTS. */
  hints?: Record<string, string>
}

export const SHEETS = {
  general: 'część ogólna',
  releves: 'zdjęcia fitosocjologiczne',
  assessment: 'ocena',
  impacts: 'oddziaływania_zagrożenia',
  actions: 'działania',
  dict: 'słowniki',
} as const

/** Podpowiedzi z kolumny H wzoru – po identyfikatorach wskaźników używanych w kartach łąkowych. */
const HINTS: Record<string, string> = {
  area: 'Należy wskazać, czy powierzchnia uległa zmniejszeniu',
  structure:
    'FV - wszystkie wskaźniki kardynalne oceniono na FV, pozostałe w większości przynajmniej na U1\nU1 - wszystkie wskaźniki kardynalne oceniono co najmniej na U1\nU2 - jeden lub więcej wskaźników kardynalnych oceniono na U2',
  percent: 'Należy określić wartość procentową',
  characteristic: 'Należy podać listę gatunków (nazwa polska i łacińska) oraz ich procentowy udział',
  typical: 'Należy podać listę gatunków (nazwa polska i łacińska) oraz ich procentowy udział',
  dominant:
    'Należy podać listę gatunków (nazwa polska i łacińska) oraz ich procentowy udział, należy wskazać, czy dominują gatunki charakterystyczne dla siedliska',
  invasive: 'Należy podać listę gatunków (nazwa polska i łacińska), stopień ich inwazyjności oraz ich procentowy udział',
  expansive:
    'Należy podać listę gatunków (nazwa polska i łacińska) oraz ich procentowy udział, należy wskazać, czy są to gatunki silnie ekspansywne',
  shrubs: 'Należy podać listę gatunków (nazwa polska i łacińska) oraz ich procentowy udział',
  wellPreserved: 'Należy określić wartość procentową',
  litter: 'Należy podać grubość w cm',
  spatial: 'Należy określić stopień fragmentacji',
  prospects:
    'Należy przedstawić krótką prognozę stanu siedliska na stanowisku w perspektywie 10-20 lat w nawiązaniu do jego aktualnego stanu i obserwowanych trendów zmian, z uwzględnieniem wszelkich działań i planów, których skutki mogą wpłynąć na siedlisko',
  overall:
    'FV - wszystkie parametry oceniono na FV \nU1 - co najmniej jeden parametr oceniono na U1, brak U2\nU2 - jeden lub więcej parametrów oceniono na U2',
}

const INTENSITY: Record<string, string> = { H: 'A', M: 'B', L: 'C' }

const str = (v: unknown) => (v === undefined || v === null ? '' : String(v)).trim()
const fmtNum = (n: number) => String(n).replace('.', ',')

/** „100%” albo „40 %” → 1 / 0,4 (w arkuszu jako liczba z formatem procentowym, jak we wzorze). */
function percentOf(text: string): number | undefined {
  const m = /^(\d+(?:[.,]\d+)?)\s*%(?:\s+powierzchni transektu)?$/.exec(text.trim())
  return m ? Number(m[1].replace(',', '.')) / 100 : undefined
}

function setValue(sh: Sheet, cell: string, text: string) {
  const p = percentOf(text)
  if (p !== undefined) sh.set(cell, p, STYLE.percent)
  else sh.set(cell, text)
}

/** Daty z karty: „08.05.2025 r.” albo „08.05.2025 r., 14.07.2025 r.”. */
function datesText(site: InputValues): string {
  const first = site.date ? `${isoToPl(site.date)} r.` : ''
  const rest = str(site.datesExtra)
    .split(/[,;]\s*/)
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => (/r\.?$/.test(d) ? d : `${d} r.`))
  return [first, ...rest].filter(Boolean).join(', ')
}

/** Nazwisko pierwszego obserwatora – do nazw plików zdjęć („…_1_Kowalski”). */
export function firstSurname(observer: unknown): string {
  const first = str(observer).split(/[,;]/)[0]?.trim() ?? ''
  const parts = first.split(/\s+/).filter(Boolean)
  return parts[parts.length - 1] ?? ''
}

/** Linie „Dokumentacji fotograficznej” w formule RDOŚ: „KOD_1_Nazwisko.jpg - podpis”. */
export function photoLines(site: InputValues, photos: PhotoRow[]): string {
  const code = str(site.siteName)
  const author = firstSurname(site.observer)
  return photos
    .map((p, i) => {
      const caption = p.caption.trim()
      if (code && caption.startsWith(code)) return caption
      const ext = /\.(jpe?g|png|tiff?|heic)$/i.exec(p.name ?? '')?.[0]?.toLowerCase() ?? ''
      const file = [code || 'stanowisko', i + 1, author].filter((x) => x !== '').join('_') + ext
      return `${file} -   ${caption}`
    })
    .join('\n')
}

function fieldText(f: FieldDef | undefined, v: unknown): string {
  if (!f || v === undefined || v === null || v === '') return ''
  if (f.kind === 'number') {
    const n = num(v)
    return n === undefined ? str(v) : `${fmtNum(n)}${f.unit ? ` ${f.unit}` : ''}`
  }
  if (f.kind === 'text' && f.unit) return `${str(v)} ${f.unit}`
  if (f.kind === 'select') return f.options.find((o) => o.value === v)?.label ?? str(v)
  if (f.kind === 'date') return isoToPl(v)
  return str(v)
}

// ---------- arkusze ----------

function generalSheet(m: Methodology, v: CardValues, profile: RdosProfile, overallRow: number, overall: GradeOrEmpty): Sheet {
  const sh = new Sheet(SHEETS.general).widths(24.9, 68.4, 103.5)
  const site = v.site ?? {}
  const other = v.other ?? {}
  const code = str(site.n2kCode).toUpperCase()
  const dictName = n2kName(code)
  const areaField = m.siteFields.find((f) => f.name === 'areaHa')
  const invasive = v.indicators?.invasive?.value?.trim()
  const rows: [string, string | number | undefined, string?, string?][] = [
    ['Nazwa siedliska', profile.habitatName],
    ['Kod stanowiska', str(site.siteName), 'Należy podać kod stanowiska w formule:\nkod obszaru Natura 2000_kod siedliska_numer stanowiska\nKod stanowiska winien być zgodny z nazwą pliku karty'],
    ['Kod SDGIS / Kod N2K', m.code],
    ['Zbiorowisko roślinne', str(site.community)],
    ['Powierzchnia płatów siedliska ', fieldText(areaField, site.areaHa), 'Należy podać wartość powierzchni w ha/a/m2'],
    ['Wymiary transektu', str(site.transect)],
    ['Stan zachowania', overall, undefined, `${sheetRef(SHEETS.assessment)}!C${overallRow}`],
    ['Daty obserwacji', datesText(site), 'Należy podać wszystkie daty obserwacji na stanowisku w kolejności chronologicznej'],
    ['Kod obszaru Natura 2000', code, 'Należy podać kod obszaru Natura 2000'],
    [
      'Nazwa obszaru Natura 2000',
      dictName ?? str(site.n2kName),
      'Nazwa obszaru generuje się na podstawie wpisanego kodu',
      dictName ? `VLOOKUP(B9,${sheetRef(SHEETS.dict)}!$A$2:$B$${N2K_AREAS.length + 1},2,FALSE)` : undefined,
    ],
    ['Opis siedliska na stanowisku', str(site.description), 'Należy przedstawić krótką charakterystykę siedliska, opisać typ siedliska, rodzaje siedlisk w otoczeniu stanowiska'],
    ['Informacje o siedlisku na stanowisku', str(site.history), 'Należy podać syntetyczne informacje o występowaniu siedliska na stanowisku, dotychczasowe badania i inne istotne fakty; wyniki badań z lat poprzednich'],
    ['Wykonywane działania ochronne i ocena ich skuteczności', str(other.conservation)],
    ['Obserwator', str(site.observer), 'Należy wymienić wszystkich ekspertów prowadzących badania na stanowisku '],
    ['Inne wartości przyrodnicze', str(other.otherValues), 'Należy przedstawić tu także informację o liczebności gatunków stwierdzonych na stanowisku'],
    ['Gatunki obce i inwazyjne', str(other.alienSpecies) || invasive || 'Brak', 'Należy podać gatunek i informacje na temat jego liczebności/ zajmowanej powierzchni'],
    [
      'Dokumentacja fotograficzna',
      photoLines(site, (other.photos as PhotoRow[] | undefined) ?? []),
      'Należy wymienić nazwy plików zdjęć fotograficznych i opisać co przedstawiają (np. PLH020088_9130_1_1_autor - zdjęcie fitosocjologiczne 1; PLH020088_9130_1_2_autor - gatunek obcy w płacie siedliska)',
    ],
    ['Uwagi', str(other.notes)],
  ]
  rows.forEach(([label, value, hint, formula], i) => {
    const r = i + 1
    sh.set(`A${r}`, label, STYLE.label)
    sh.set(`B${r}`, value, STYLE.text, formula)
    if (hint) sh.set(`C${r}`, hint, STYLE.hint)
  })
  sh.list('B7', `${sheetRef(SHEETS.dict)}!$H$2:$H$5`)
  return sh
}

function releveSheet(m: Methodology, v: CardValues): Sheet {
  const sh = new Sheet(SHEETS.releves).widths(12.9, 16.5, 25.6, 25.6, 25.6)
  const releves = v.releves ?? []
  const n = Math.max(3, releves.length)
  const field = (name: string) => m.releves.fields.find((f) => f.name === name)
  const head: [string, string][] = [
    ['Współrzędne w układzie PL-1992', 'coords'],
    ['Wysokość n.p.m.', 'altitude'],
    ['Powierzchnia zdjęcia', 'area'],
    ['Nachylenie', 'slope'],
    ['Ekspozycja', 'exposure'],
    ['Zwarcie warstwy A', 'coverA'],
    ['Zwarcie warstwy B', 'coverB'],
    ['Zwarcie warstwy C', 'coverC'],
    ['Zwarcie warstwy D', 'coverD'],
    ['Wysokość warstwy A', 'heightA'],
    ['Wysokość warstwy B', 'heightB'],
    ['Wysokość warstwy C', 'heightC'],
    ['Wysokość warstwy D', 'heightD'],
    ['Jednostka fitosocjologiczna', 'unit'],
  ]
  sh.set('A1', 'Zdjęcie fitosocjologiczne', STYLE.label).set('B1', '', STYLE.label).merge('A1:B1')
  for (let i = 0; i < n; i++) sh.set(ref(3 + i, 1), i + 1, STYLE.head)
  head.forEach(([label, name], k) => {
    const r = 2 + k
    sh.set(`A${r}`, label, STYLE.label).set(`B${r}`, '', STYLE.label).merge(`A${r}:B${r}`)
    for (let i = 0; i < n; i++) sh.set(ref(3 + i, r), fieldText(field(name), releves[i]?.[name]))
  })
  // gatunki: warstwa × ilościowość (od 5 do r), w komórce lista gatunków
  const order = [...BRAUN_BLANQUET].reverse()
  LAYERS.forEach((layer, li) => {
    const top = 16 + li * order.length
    sh.merge(`A${top}:A${top + order.length - 1}`)
    order.forEach((ab, k) => {
      const r = top + k
      sh.set(`A${r}`, k === 0 ? `WARSTWA ${layer}` : '', STYLE.label)
      sh.set(`B${r}`, `pokrycie ${ab}`, STYLE.label)
      for (let i = 0; i < n; i++) {
        const rows = ((releves[i]?.species as ReleveSpeciesRow[] | undefined) ?? []).filter((s) => s.layer === layer && s.abundance === ab && s.name.trim())
        sh.set(ref(3 + i, r), rows.map((s) => s.name.trim()).join(', '))
      }
    })
  })
  sh.set(`A${16 + LAYERS.length * order.length + 1}`, `Skala Braun-Blanqueta: ${order.map((a) => BB_LABELS[a]).join('; ')}.`, STYLE.default)
  return sh
}

interface AssessmentLayout {
  sheet: Sheet
  overallRow: number
}

function assessmentSheet(m: Methodology, v: CardValues, profile: RdosProfile): AssessmentLayout {
  const sh = new Sheet(SHEETS.assessment).widths(18.6, 25.1, 17, 17.4, 17.4, 17.4, 25.5, 55)
  const a = assessCard(m, v)
  const other = v.other ?? {}
  const hint = (id: string) => profile.hints?.[id] ?? HINTS[id] ?? ''
  const label = (id: string, fallback: string) => profile.rowLabels?.[id] ?? fallback
  ;[
    'PARAMETR/\nWskaźnik',
    'Wartość',
    'Ocena rzeczywista',
    'Ocena referencyjna',
    'Prognozowana wartość \n(dot. oceny referencyjnej)',
    'Prognozowany termin osiągnięcia wartości i oceny referencyjnej (jeśli dotyczy)',
    'Uzasadnienie braku możliwości osiągnięcia wartości odpowiadającej ocenie FV (jeśli dotyczy)',
  ].forEach((t, i) => sh.set(ref(i + 1, 1), t, STYLE.head))
  sh.height(1, 62.5)

  const refRow = (r: number, id: string) => {
    const x = refOf(other, id)
    sh.set(`D${r}`, x.grade, STYLE.grade)
    setValue(sh, `E${r}`, x.value)
    sh.set(`F${r}`, x.term)
    sh.set(`G${r}`, x.reason)
    return x.grade as GradeOrEmpty
  }
  const indicatorRow = (r: number, id: string, text: string, value: string, grade: GradeOrEmpty, bold = false) => {
    sh.set(`A${r}`, text, bold ? STYLE.bold : STYLE.label)
    setValue(sh, `B${r}`, value)
    sh.set(`C${r}`, grade, STYLE.grade)
    const g = refRow(r, id)
    const h = hint(id)
    if (h) sh.set(`H${r}`, h, STYLE.hint)
    return g
  }

  let r = 2
  const areaRefs: GradeOrEmpty[] = []
  for (const ind of m.indicators.filter((i) => i.parameter === 'area')) {
    const iv = v.indicators?.[ind.id]
    areaRefs.push(indicatorRow(r++, ind.id, label(ind.id, 'POWIERZCHNIA SIEDLISKA'), iv?.value ?? '', iv?.grade ?? '', true))
  }
  const structureRow = r++
  const structureRefs: { grade: GradeOrEmpty; cardinal: boolean }[] = []
  for (const ind of m.indicators.filter((i) => i.parameter === 'structure')) {
    const iv = v.indicators?.[ind.id]
    const g = indicatorRow(r++, ind.id, label(ind.id, ind.label), iv?.value ?? '', iv?.grade ?? '')
    if (!isExcluded(ind, v.site)) structureRefs.push({ grade: g, cardinal: isCardinal(ind, v.site) })
  }
  const structureRef = aggregateStructure(structureRefs)
  sh.set(`A${structureRow}`, 'SPECYFICZNA STRUKTURA I FUNKCJE', STYLE.bold)
  sh.set(`C${structureRow}`, a.structure, STYLE.grade)
  sh.set(`D${structureRow}`, structureRef, STYLE.grade)
  sh.set(`H${structureRow}`, hint('structure'), STYLE.hint)

  const prospectsRef = indicatorRow(r++, 'prospects', 'PERSPEKTYWY ZACHOWANIA', v.prospects?.value ?? '', v.prospects?.grade ?? '', true)
  const overallRow = r
  sh.set(`A${overallRow}`, 'OCENA OGÓLNA', STYLE.bold)
  sh.set(`C${overallRow}`, a.overall, STYLE.grade)
  sh.set(`D${overallRow}`, aggregateOverall([aggregateOverall(areaRefs), structureRef, prospectsRef]), STYLE.grade)
  sh.set(`H${overallRow}`, hint('overall'), STYLE.hint)
  if (v.overallComment?.trim()) sh.set(`A${overallRow + 2}`, `Uwagi do oceny: ${v.overallComment.trim()}`, STYLE.default)
  sh.list(`C2:D${overallRow}`, `${sheetRef(SHEETS.dict)}!$H$2:$H$5`)
  return { sheet: sh, overallRow }
}

function impactsSheet(m: Methodology, v: CardValues): Sheet {
  const sh = new Sheet(SHEETS.impacts).widths(15.9, 33.5, 14.1, 14.5, 9.5, 63.4, 34.5, 20, 9.1, 19.6, 15.4, 14, 14, 14, 14.6, 11.4)
  const heads: [string, string][] = [
    ['A', 'KOD oddziaływania'],
    ['B', 'Nazwa oddziaływania'],
    ['C', 'Istniejące (i) / potencjalne (p)'],
    ['D', 'Intensywność'],
    ['E', 'Wpływ'],
    ['F', 'Opis'],
    ['G', 'Jeśli obszar zagrożenia jest taki sam jak powierzchnia stanowiska siedliska - pole należy pozostawić puste.\nJeśli obszar zagrożenia jest inny niż powierzchnia stanowiska siedliska - należy podać nr rekordu zagrożenia z dodatkowej warstwy zagrożeń.'],
    ['H', 'Jeśli źródło zagrożenia zlokalizowane jest poza powierzchnią siedliska gatunku - należy podać nr rekordu zagrożenia z dodatkowej warstwy źródeł zagrożeń.'],
    ['J', 'Kod stanowiska'],
    ['K', 'KOD działalności'],
    ['L', 'Istniejące (i) / potencjalne (p)'],
    ['M', 'Uwagi'],
    ['N', 'Powierzchnia z gisu'],
    ['O', 'Kod siedliska'],
    ['P', 'Kod obszaru'],
  ]
  heads.forEach(([c, t]) => sh.set(`${c}1`, t, STYLE.head))
  sh.height(1, 87.5)
  const general = sheetRef(SHEETS.general)
  const rows = [
    ...(v.impacts ?? []).map((i) => ({ code: i.code, name: i.name, ip: 'i', intensity: INTENSITY[i.intensity] ?? '', influence: i.influence, description: i.description })),
    ...(v.threats ?? []).map((t) => ({ code: t.code, name: t.name, ip: 'p', intensity: '', influence: '', description: t.description })),
  ].filter((x) => str(x.code))
  rows.forEach((x, k) => {
    const r = k + 2
    const code = str(x.code)
    const dict = IMPACT_DICT.find((d) => d.code === code)
    sh.set(`A${r}`, code)
    if (dict) sh.set(`B${r}`, dict.name, STYLE.text, `VLOOKUP(A${r},${sheetRef(SHEETS.dict)}!$J$2:$K$${IMPACT_DICT.length + 1},2,0)`)
    else sh.set(`B${r}`, str(x.name))
    sh.set(`C${r}`, x.ip, STYLE.grade)
    sh.set(`D${r}`, x.intensity, STYLE.grade)
    sh.set(`E${r}`, x.influence === '-' ? '-' : x.influence, STYLE.grade)
    sh.set(`F${r}`, str(x.description))
    sh.set(`G${r}`, '')
    sh.set(`H${r}`, '')
    sh.set(`J${r}`, str(v.site?.siteName), STYLE.plain, `${general}!$B$2`)
    sh.set(`K${r}`, code, STYLE.plain, `A${r}`)
    sh.set(`L${r}`, x.ip, STYLE.plain, `C${r}`)
    sh.set(`M${r}`, '', STYLE.plain)
    sh.set(`N${r}`, '', STYLE.plain)
    sh.set(`O${r}`, m.code, STYLE.plain, `${general}!$B$3`)
    sh.set(`P${r}`, str(v.site?.n2kCode).toUpperCase(), STYLE.plain, `${general}!$B$9`)
  })
  const last = Math.max(21, rows.length + 11)
  sh.list(`A2:A${last}`, `${sheetRef(SHEETS.dict)}!$J$2:$J$${IMPACT_DICT.length + 1}`)
  sh.list(`C2:C${last}`, `${sheetRef(SHEETS.dict)}!$M$2:$M$3`)
  sh.list(`D2:D${last}`, `${sheetRef(SHEETS.dict)}!$O$2:$O$4`)
  sh.list(`E2:E${last}`, `${sheetRef(SHEETS.dict)}!$Q$2:$Q$4`)
  return sh
}

function actionsSheet(m: Methodology, v: CardValues): Sheet {
  const sh = new Sheet(SHEETS.actions).widths(30.5, 42.5, 30.6, 10.4, 41.1, 15.9, 20, 16.4, 49.6, 9.1, 15.4, 14.6, 16.5, 10.1, 8.9, 10.4, 41.1, 14.5, 20.4, 11.4)
  const heads: [string, string][] = [
    ['A', 'Typ działania'],
    ['B', 'Rodzaj działania'],
    ['C', 'Cel działania'],
    ['D', 'Charakter działania'],
    ['E', 'Opis działania'],
    ['F', 'Termin realizacji'],
    ['G', 'Uwagi'],
    ['H', 'Podmiot odpowiedzialny za wykonanie'],
    ['I', 'Jeśli obszar wdrażania jest taki sam jak powierzchnia stanowiska siedliska - pole należy pozostawić puste.\nJeśli obszar wdrażania jest inny niż powierzchnia stanowiska siedliska - należy podać nr rekordu działania z dodatkowej warstwy działań ochronnych.'],
    ['K', 'Kod stanowiska'],
    ['L', 'Kod siedliska'],
    ['M', 'Typ działania - kod'],
    ['N', 'Rodzaj działania - kod'],
    ['O', 'Cel działania - kod'],
    ['P', 'Charakter działania'],
    ['Q', 'Opis działania'],
    ['R', 'Powierzchnia (z geometrii)'],
    ['S', 'Uwagi (do weryfikacji)'],
    ['T', 'Kod obszaru'],
  ]
  heads.forEach(([c, t]) => sh.set(`${c}1`, t, STYLE.head))
  sh.height(1, 62.5)
  const general = sheetRef(SHEETS.general)
  const dict = sheetRef(SHEETS.dict)
  const actions = ((v.other?.actions as Record<string, unknown>[] | undefined) ?? []).filter((a) => Object.values(a).some((x) => str(x)))
  const codeOf = (list: { label: string; code: string }[], label: string) => list.find((e) => e.label === label)?.code ?? ''
  actions.forEach((a, k) => {
    const r = k + 2
    const [type, kind, goal] = [str(a.type), str(a.kind), str(a.goal)]
    sh.set(`A${r}`, type)
    sh.set(`B${r}`, kind)
    sh.set(`C${r}`, goal)
    sh.set(`D${r}`, str(a.character))
    sh.set(`E${r}`, str(a.description))
    sh.set(`F${r}`, str(a.term))
    sh.set(`G${r}`, str(a.notes))
    sh.set(`H${r}`, str(a.responsible))
    sh.set(`I${r}`, str(a.area))
    sh.set(`K${r}`, str(v.site?.siteName), STYLE.plain, `${general}!$B$2`)
    sh.set(`L${r}`, m.code, STYLE.plain, `${general}!$B$3`)
    sh.set(`M${r}`, codeOf(ACTION_TYPES, type), STYLE.text, `VLOOKUP(A${r},${dict}!$S$2:$T$${ACTION_TYPES.length + 1},2,0)`)
    sh.set(`N${r}`, codeOf(ACTION_KINDS, kind), STYLE.text, `VLOOKUP(B${r},${dict}!$V$2:$W$${ACTION_KINDS.length + 1},2,0)`)
    sh.set(`O${r}`, codeOf(ACTION_GOALS, goal), STYLE.text, `VLOOKUP(C${r},${dict}!$Y$2:$Z$${ACTION_GOALS.length + 1},2,0)`)
    sh.set(`P${r}`, str(a.character), STYLE.text, `D${r}`)
    sh.set(`Q${r}`, str(a.description), STYLE.text, `E${r}`)
    sh.set(`R${r}`, '', STYLE.text)
    sh.set(`S${r}`, str(a.notes), STYLE.text, `G${r}`)
    sh.set(`T${r}`, str(v.site?.n2kCode).toUpperCase(), STYLE.plain, `${general}!$B$9`)
  })
  const last = Math.max(9, actions.length + 6)
  sh.set(
    `A${last + 4}`,
    'Jeśli nie ma konieczności prowadzenia działań ochronnych, w tym monitoringu, w kolumnie "Opis działania" należy wpisać "BRAK KONIECZNOŚCI DZIAŁAŃ OCHRONNYCH" i/lub "BRAK KONIECZNOŚCI MONITORINGU", w polu uwagi należy wyjaśnić dlaczego, a pozostałe pola należy pozostawić niewypełnione',
    STYLE.hint,
  )
  sh.merge(`A${last + 4}:E${last + 4}`).height(last + 4, 45)
  sh.list(`A2:A${last}`, `${dict}!$S$2:$S$${ACTION_TYPES.length + 1}`)
  sh.list(`B2:B${last}`, `${dict}!$V$2:$V$${ACTION_KINDS.length + 1}`)
  sh.list(`C2:C${last}`, `${dict}!$Y$2:$Y$${ACTION_GOALS.length + 1}`)
  sh.list(`D2:D${last}`, `${dict}!$AB$2:$AB$${ACTION_CHARACTER.length + 1}`)
  return sh
}

function dictSheet(): Sheet {
  const sh = new Sheet(SHEETS.dict, true).widths(23, 36.5, 9, 9, 9, 9, 9, 9, 9, 9, 32, 9, 9, 9, 13.4, 9, 9, 9, 33.5, 9, 9, 60, 9, 9, 50, 9, 9, 19.5)
  const head = STYLE.default
  sh.set('A1', 'Kod obszaru Natura 2000', head).set('B1', 'Nazwa obszaru Natura 2000', head)
  N2K_AREAS.forEach((a, i) => sh.set(`A${i + 2}`, a.code, head).set(`B${i + 2}`, a.name, head))
  sh.set('H1', 'ocena', head)
  ;['FV', 'U1', 'U2', 'XX'].forEach((g, i) => sh.set(`H${i + 2}`, g, head))
  sh.set('J1', 'zagrożenia', head)
  IMPACT_DICT.forEach((d, i) => sh.set(`J${i + 2}`, d.code, head).set(`K${i + 2}`, d.name, head))
  sh.set('M1', 'ist/pot', head)
  ;['i', 'p'].forEach((x, i) => sh.set(`M${i + 2}`, x, head))
  sh.set('O1', 'intensywność', head)
  ;['A', 'B', 'C'].forEach((x, i) => sh.set(`O${i + 2}`, x, head))
  sh.set('Q1', 'wpływ', head)
  ;['+', '-', '0'].forEach((x, i) => sh.set(`Q${i + 2}`, x, head))
  sh.set('S1', 'typ działania', head)
  ACTION_TYPES.forEach((d, i) => sh.set(`S${i + 2}`, d.label, head).set(`T${i + 2}`, d.code, head))
  sh.set('V1', 'rodzaj działania', head)
  ACTION_KINDS.forEach((d, i) => sh.set(`V${i + 2}`, d.label, head).set(`W${i + 2}`, d.code, head))
  sh.set('Y1', 'cel działania', head)
  ACTION_GOALS.forEach((d, i) => sh.set(`Y${i + 2}`, d.label, head).set(`Z${i + 2}`, d.code, head))
  sh.set('AB1', 'charakter działania', head)
  ACTION_CHARACTER.forEach((d, i) => sh.set(`AB${i + 2}`, d, head))
  return sh
}

/** Arkusze karty w kolejności ze wzoru. */
export function buildRdosSheets(m: Methodology, v: CardValues, profile: RdosProfile): Sheet[] {
  const assessment = assessmentSheet(m, v, profile)
  const overall = assessment.sheet.get(`C${assessment.overallRow}`)?.v as GradeOrEmpty
  const general = generalSheet(m, v, profile, assessment.overallRow, overall ?? '')
  return [general, releveSheet(m, v), assessment.sheet, impactsSheet(m, v), actionsSheet(m, v), dictSheet()]
}

export function cardToXlsx(m: Methodology, v: CardValues, profile: RdosProfile): Uint8Array {
  return buildXlsx(buildRdosSheets(m, v, profile), { title: `Karta ${m.code} ${str(v.site?.siteName)}`.trim(), creator: str(v.site?.observer) || 'FITOS' })
}

/** Nazwa pliku = kod stanowiska (wymóg wzoru: „Kod stanowiska winien być zgodny z nazwą pliku karty”). */
export function xlsxFileName(m: Methodology, v: CardValues): string {
  const code = str(v.site?.siteName).replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_')
  return `${code || `Karta_${m.code}`}.xlsx`
}

export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

/** Przycisk eksportu do formularza karty. */
export function rdosXlsxExport(profile: RdosProfile): CardExport {
  return {
    id: 'xlsx-rdos',
    label: 'Pobierz arkusz RDOŚ (.xlsx)',
    title:
      'Karta w układzie arkuszy RDOŚ we Wrocławiu: część ogólna, zdjęcia fitosocjologiczne, ocena (z oceną referencyjną), oddziaływania i zagrożenia, działania. Pobiera to, co jest wpisane – także kartę niedokończoną.',
    build: async (m, values) => ({
      blob: new Blob([cardToXlsx(m, values, profile) as BlobPart], { type: XLSX_MIME }),
      fileName: xlsxFileName(m, values),
    }),
  }
}
