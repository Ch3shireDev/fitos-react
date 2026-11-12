// Eksport karty do .docx w układzie karty obserwacji GIOŚ: jedna tabela, szare paski sekcji,
// kolumna etykiet F2F2F2, Times New Roman 10 pt, A4 z marginesami 2,5 cm.
// Szerokości kolumn (w twipach) przepisane z oryginalnej karty, żeby wydruk wyglądał tak samo.
import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  type IImageOptions,
} from 'docx'
import { assessCard, describeSpecies, habitatCode, isCardinal, isExcluded, num, speciesRows } from '../../habitats/assessment'
import { isoToPl } from '../../habitats/dates'
import {
  LAYERS,
  type CardValues,
  type FieldDef,
  type GradeOrEmpty,
  type InputValues,
  type Methodology,
  type PhotoRow,
  type ReleveSpeciesRow,
} from '../../habitats/types'

const FONT = 'Times New Roman'
const SIZE = 20 // pół-punkty = 10 pt
const TABLE_W = 9351
const FILL = { title: 'A6A6A6', section: 'BFBFBF', bar: 'D9D9D9', label: 'F2F2F2' } as const
const EMPTY = '–'
/** Szerokość obrazka w komórce „Dokumentacja fotograficzna” (6549 twipów ≈ 4,5 cala) w pikselach 96 dpi, z marginesem. */
const PHOTO_MAX_W = 420

// ---------- tekst ----------

/** Wyrażenie łapiące nazwy łacińskie z katalogu – w karcie pisze się je kursywą. */
function latinMatcher(m: Methodology): RegExp | null {
  const names = (m.speciesCatalog ?? []).map((o) => o.value).filter((v) => /\s/.test(v))
  if (names.length === 0) return null
  const escaped = names.sort((a, b) => b.length - a.length).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  return new RegExp(`(${escaped.join('|')})`, 'g')
}

type RunOpts = { bold?: boolean; italic?: boolean; size?: number }

function runs(text: string, latin: RegExp | null, opts: RunOpts = {}): TextRun[] {
  const base = { font: FONT, size: opts.size ?? SIZE, bold: opts.bold }
  if (!latin) return [new TextRun({ ...base, text, italics: opts.italic })]
  return text
    .split(latin) // grupa w wyrażeniu -> nieparzyste indeksy to nazwy łacińskie
    .map((part, i) => [part, i] as const)
    .filter(([part]) => part !== '')
    .map(([part, i]) => new TextRun({ ...base, text: part, italics: opts.italic || i % 2 === 1 }))
}

type Align = (typeof AlignmentType)[keyof typeof AlignmentType]

/** Tekst z enterami -> osobne akapity (tak jak w oryginale). */
function paragraphs(text: string, latin: RegExp | null, opts: RunOpts & { align?: Align } = {}): Paragraph[] {
  const lines = (text.trim() === '' ? EMPTY : text).split(/\r?\n/)
  return lines.map(
    (line) =>
      new Paragraph({
        alignment: opts.align,
        spacing: { before: 0, after: 0, line: 240 },
        children: runs(line, latin, opts),
      }),
  )
}

// ---------- komórki ----------

interface CellOpts {
  width: number
  span?: number
  rowSpan?: number
  fill?: string
  bold?: boolean
  italic?: boolean
  align?: Align
  center?: boolean
  size?: number
}

function cell(content: string | Paragraph[], o: CellOpts, latin: RegExp | null = null): TableCell {
  const children =
    typeof content === 'string'
      ? paragraphs(content, latin, { bold: o.bold, italic: o.italic, size: o.size, align: o.center ? AlignmentType.CENTER : o.align })
      : content
  return new TableCell({
    children,
    width: { size: o.width, type: WidthType.DXA },
    columnSpan: o.span,
    rowSpan: o.rowSpan,
    verticalAlign: o.center ? VerticalAlign.CENTER : VerticalAlign.TOP,
    shading: o.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fill } : undefined,
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
  })
}

/** Pasek sekcji na całą szerokość; `cols` = liczba kolumn tabeli, w której stoi. */
const bar = (text: string, fill: string, cols = 2) =>
  new TableRow({ children: [cell(text, { width: TABLE_W, span: cols, fill, bold: true, center: true })], cantSplit: true })

const BORDER = { style: BorderStyle.SINGLE, size: 4, color: '000000' }
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER, insideHorizontal: BORDER, insideVertical: BORDER }

function table(columns: number[], rows: TableRow[]): Table {
  return new Table({
    rows,
    columnWidths: columns,
    width: { size: TABLE_W, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
    borders: BORDERS,
  })
}

// ---------- wartości pól ----------

function isEmpty(v: unknown) {
  return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)
}

/** Wartość pola tak, jak trafia do karty (polska data, przecinek dziesiętny, jednostka). */
export function formatFieldValue(f: FieldDef, v: unknown): string {
  if (isEmpty(v)) return ''
  switch (f.kind) {
    case 'number': {
      const n = num(v)
      if (n === undefined) return String(v)
      return `${String(n).replace('.', ',')}${f.unit ? ` ${f.unit}` : ''}`
    }
    case 'text':
      return f.unit ? `${String(v)} ${f.unit}` : String(v)
    case 'date':
      return isoToPl(v)
    case 'select':
      return f.options.find((o) => o.value === v)?.label ?? String(v)
    case 'species':
      return describeSpecies(speciesRows(v))
    case 'releve-species':
      return releveSpeciesText(v as ReleveSpeciesRow[])
    case 'photos':
      return (v as PhotoRow[]).map((r) => r.caption).join('\n')
    default:
      return String(v)
  }
}

function releveSpeciesText(rows: ReleveSpeciesRow[]): string {
  return rows.map((r) => `${r.layer || '?'}: ${r.name} ${r.abundance || ''}`.trim()).join('\n')
}

type Row = { label: string; fields: FieldDef[] }

/** Pola z tą samą grupą lądują w jednym wierszu karty (np. „Współrzędne geograficzne”). */
function groupRows(fields: FieldDef[]): Row[] {
  const rows: Row[] = []
  for (const f of fields) {
    const last = rows[rows.length - 1]
    if (f.group && last?.label === f.group) last.fields.push(f)
    else rows.push({ label: f.group ?? f.label, fields: [f] })
  }
  return rows
}

function rowText(r: Row, values: InputValues): string {
  if (r.fields.length === 1) return formatFieldValue(r.fields[0], values[r.fields[0].name])
  return r.fields
    .map((f) => [f, formatFieldValue(f, values[f.name])] as const)
    .filter(([, text]) => text !== '')
    .map(([f, text]) => `${f.label}: ${text}`)
    .join('\n')
}

const LABEL_W = 2689
const VALUE_W = TABLE_W - LABEL_W

function labelValueRows(fields: FieldDef[], values: InputValues, latin: RegExp | null): TableRow[] {
  return groupRows(fields)
    .filter((r) => r.fields.every((f) => f.kind !== 'photos' && f.kind !== 'releve-species'))
    .map(
      (r) =>
        new TableRow({
          children: [cell(r.label, { width: LABEL_W, fill: FILL.label }), cell(rowText(r, values), { width: VALUE_W }, latin)],
        }),
    )
}

// ---------- zdjęcia ----------

type ImageType = 'jpg' | 'png' | 'gif' | 'bmp'

function decodeDataUrl(url: string): { data: Uint8Array; type: ImageType } | null {
  const m = /^data:image\/(jpeg|jpg|png|gif|bmp);base64,(.+)$/i.exec(url)
  if (!m) return null
  const bin = atob(m[2])
  const data = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) data[i] = bin.charCodeAt(i)
  const t = m[1].toLowerCase()
  return { data, type: (t === 'jpeg' ? 'jpg' : t) as ImageType }
}

/** Wymiary z nagłówka pliku (PNG: IHDR, JPEG: znacznik SOF) – bez dekodowania obrazu, działa wszędzie. */
export function imageDims(data: Uint8Array, type: ImageType): { w: number; h: number } | null {
  const u16 = (i: number) => (data[i] << 8) | data[i + 1]
  const u32 = (i: number) => ((data[i] << 24) | (data[i + 1] << 16) | (data[i + 2] << 8) | data[i + 3]) >>> 0
  if (type === 'png' && data.length > 24) return { w: u32(16), h: u32(20) }
  if (type === 'gif' && data.length > 10) return { w: data[6] | (data[7] << 8), h: data[8] | (data[9] << 8) }
  if (type === 'bmp' && data.length > 26) {
    const le = (i: number) => data[i] | (data[i + 1] << 8) | (data[i + 2] << 16) | (data[i + 3] << 24)
    return { w: Math.abs(le(18)), h: Math.abs(le(22)) }
  }
  if (type === 'jpg') {
    let i = 2
    while (i + 9 < data.length) {
      if (data[i] !== 0xff) return null
      const marker = data[i + 1]
      // SOF0–SOF15 poza DHT (C4), JPG (C8) i DAC (CC)
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { w: u16(i + 7), h: u16(i + 5) }
      i += 2 + u16(i + 2)
    }
  }
  return null
}

function naturalSize(data: Uint8Array, type: ImageType): { w: number; h: number } {
  const d = imageDims(data, type)
  // nie da się odczytać – zakładamy typowe 4:3
  return d && d.w > 0 && d.h > 0 ? d : { w: 1600, h: 1200 }
}

async function photoParagraphs(photos: PhotoRow[], latin: RegExp | null): Promise<Paragraph[]> {
  if (photos.length === 0) return paragraphs('', latin)
  const out: Paragraph[] = []
  for (const photo of photos) {
    const img = photo.dataUrl ? decodeDataUrl(photo.dataUrl) : null
    if (img) {
      const { w, h } = naturalSize(img.data, img.type)
      const width = Math.min(PHOTO_MAX_W, w)
      const options = {
        type: img.type,
        data: img.data,
        transformation: { width, height: Math.round((width * h) / w) },
        altText: { name: photo.name || 'zdjęcie', description: photo.caption, title: photo.caption },
      } as IImageOptions
      out.push(new Paragraph({ spacing: { before: 60, after: 0 }, children: [new ImageRun(options)] }))
    } else if (photo.dataUrl) {
      out.push(...paragraphs('(plik w formacie, którego Word nie wyświetli – zapisz zdjęcie jako JPG albo PNG)', null, { italic: true }))
    }
    out.push(...paragraphs(photo.caption, latin))
  }
  return out
}

// ---------- sekcje ----------

function siteSection(m: Methodology, v: CardValues, latin: RegExp | null): TableRow[] {
  return [
    bar('Karta obserwacji siedliska przyrodniczego na stanowisku', FILL.title),
    bar('Stanowisko – informacje podstawowe', FILL.section),
    new TableRow({
      children: [
        cell('Kod i nazwa siedliska przyrodniczego', { width: LABEL_W, fill: FILL.label }),
        cell(`${habitatCode(m)} ${m.name}`, { width: VALUE_W }),
      ],
    }),
    ...labelValueRows(m.siteFields, v.site ?? {}, latin),
  ]
}

const S = { param: 1405, ind: 2680, value: 3279, grade: 993, paramGrade: 994 }

function gradeText(g: GradeOrEmpty) {
  return g || EMPTY
}

function statusSection(m: Methodology, v: CardValues, latin: RegExp | null): TableRow[] {
  const a = assessCard(m, v)
  const head = { fill: FILL.bar, bold: true, center: true }
  const rows: TableRow[] = [
    bar('Stan ochrony siedliska przyrodniczego na stanowisku', FILL.section, 5),
    new TableRow({
      tableHeader: false,
      children: [
        cell('Parametr', { width: S.param, rowSpan: 2, ...head }),
        cell('Wskaźniki', { width: S.ind, rowSpan: 2, ...head }),
        cell('Wartość lub opis', { width: S.value, rowSpan: 2, ...head }),
        cell('Ocena', { width: S.grade + S.paramGrade, span: 2, ...head }),
      ],
    }),
    new TableRow({
      children: [
        cell('wskaźnika', { width: S.grade, ...head, size: 16 }),
        cell('parametru', { width: S.paramGrade, ...head, size: 16 }),
      ],
    }),
  ]
  const params = [
    { label: 'Powierzchnia', grade: a.area, list: m.indicators.filter((i) => i.parameter === 'area') },
    { label: 'Specyficzna struktura i funkcja', grade: a.structure, list: m.indicators.filter((i) => i.parameter === 'structure') },
  ]
  for (const p of params) {
    p.list.forEach((ind, idx) => {
      const iv = v.indicators?.[ind.id]
      const children = [
        cell(isExcluded(ind, v.site) ? `${ind.label} (pomocniczy, nie liczy się do oceny)` : ind.label, {
          width: S.ind,
          bold: isCardinal(ind, v.site) && !isExcluded(ind, v.site),
        }),
        cell(iv?.value ?? '', { width: S.value }, latin),
        cell(gradeText(iv?.grade ?? ''), { width: S.grade, center: true }),
      ]
      if (idx === 0) {
        children.unshift(cell(p.label, { width: S.param, rowSpan: p.list.length, fill: FILL.label, bold: true, center: true }))
        children.push(cell(gradeText(p.grade), { width: S.paramGrade, rowSpan: p.list.length, bold: true, center: true }))
      }
      rows.push(new TableRow({ children, cantSplit: true }))
    })
  }
  const wide = S.ind + S.value + S.grade
  rows.push(
    new TableRow({
      cantSplit: true,
      children: [
        cell('Perspektywy ochrony', { width: S.param, fill: FILL.label, bold: true }),
        cell(v.prospects?.value ?? '', { width: wide, span: 3 }, latin),
        cell(gradeText(v.prospects?.grade ?? ''), { width: S.paramGrade, bold: true, center: true }),
      ],
    }),
    new TableRow({
      cantSplit: true,
      children: [
        cell('Ocena ogólna', { width: S.param, fill: FILL.label, bold: true }),
        cell(v.overallComment ?? '', { width: wide, span: 3 }, latin),
        cell(gradeText(a.overall), { width: S.paramGrade, bold: true, center: true }),
      ],
    }),
  )
  return rows
}

const IMP = [1413, 2210, 848, 1411, 3469]
const THR = [1413, 3058, 4880]

function impactsSection(v: CardValues, latin: RegExp | null): TableRow[] {
  const head = (t: string, w: number) => cell(t, { width: w, fill: FILL.label, bold: true, center: true })
  const list = v.impacts ?? []
  return [
    bar('Oddziaływania', FILL.bar, 5),
    new TableRow({ children: ['Kod', 'Nazwa', 'Wpływ', 'Intensywność', 'Opis'].map((t, i) => head(t, IMP[i])) }),
    ...(list.length
      ? list.map(
          (r) =>
            new TableRow({
              cantSplit: true,
              children: [
                cell(r.code, { width: IMP[0], center: true }),
                cell(r.name, { width: IMP[1] }),
                cell(r.influence, { width: IMP[2], center: true }),
                cell(r.intensity, { width: IMP[3], center: true }),
                cell(r.description, { width: IMP[4] }, latin),
              ],
            }),
        )
      : [new TableRow({ children: [cell('Brak oddziaływań.', { width: TABLE_W, span: 5, italic: true })] })]),
  ]
}

function threatsSection(v: CardValues, latin: RegExp | null): TableRow[] {
  const head = (t: string, w: number) => cell(t, { width: w, fill: FILL.label, bold: true, center: true })
  const list = v.threats ?? []
  return [
    bar('Zagrożenia (przyszłe, przewidywane oddziaływania)', FILL.bar, 3),
    new TableRow({ children: ['Kod', 'Nazwa', 'Opis'].map((t, i) => head(t, THR[i])) }),
    ...(list.length
      ? list.map(
          (r) =>
            new TableRow({
              cantSplit: true,
              children: [
                cell(r.code, { width: THR[0], center: true }),
                cell(r.name, { width: THR[1] }),
                cell(r.description, { width: THR[2] }, latin),
              ],
            }),
        )
      : [new TableRow({ children: [cell('Brak zagrożeń.', { width: TABLE_W, span: 3, italic: true })] })]),
  ]
}

const OTHER = [2802, 6549]

async function otherSection(m: Methodology, v: CardValues, latin: RegExp | null): Promise<TableRow[]> {
  const rows: TableRow[] = [bar('Inne informacje', FILL.bar)]
  const values = v.other ?? {}
  for (const f of m.otherFields) {
    const content =
      f.kind === 'photos'
        ? await photoParagraphs((values[f.name] as PhotoRow[] | undefined) ?? [], latin)
        : paragraphs(formatFieldValue(f, values[f.name]), latin)
    rows.push(
      new TableRow({
        children: [cell(f.label, { width: OTHER[0], fill: FILL.label }), cell(content, { width: OTHER[1] })],
      }),
    )
  }
  return rows
}

const toRoman = (n: number) =>
  [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ].reduce<[number, string]>(
    ([rest, out], [v, s]) => {
      while (rest >= (v as number)) {
        rest -= v as number
        out += s
      }
      return [rest, out]
    },
    [n, ''],
  )[1]

const REL = [1405, 5952, 1994]

/** Każde zdjęcie: tabela etykieta | wartość + tabela składu gatunkowego (inne kolumny, więc osobna tabela). */
function relevesTables(m: Methodology, v: CardValues, latin: RegExp | null): Table[] {
  const releves = v.releves ?? []
  if (releves.length === 0) return []
  const speciesField = m.releves.fields.find((f) => f.kind === 'releve-species')
  const out: Table[] = []
  releves.forEach((r, i) => {
    out.push(
      table(
        [LABEL_W, VALUE_W],
        [
          ...(i === 0 ? [bar('Zdjęcia fitosocjologiczne', FILL.bar)] : []),
          bar(`Zdjęcie fitosocjologiczne ${toRoman(i + 1)}`, FILL.label),
          ...labelValueRows(m.releves.fields, r, latin),
        ],
      ),
    )
    if (!speciesField) return
    const list = [...((r[speciesField.name] as ReleveSpeciesRow[] | undefined) ?? [])].sort(
      (a, b) => LAYERS.indexOf(a.layer as never) - LAYERS.indexOf(b.layer as never),
    )
    const head = (t: string, w: number) => cell(t, { width: w, fill: FILL.label, bold: true, center: true })
    const rows = [
      new TableRow({ children: [cell(speciesField.label, { width: TABLE_W, span: 3, fill: FILL.label, bold: true })] }),
      new TableRow({ children: [head('Warstwa', REL[0]), head('Gatunek', REL[1]), head('Ilościowość (B-B)', REL[2])] }),
      ...(list.length
        ? list.map(
            (s) =>
              new TableRow({
                cantSplit: true,
                children: [
                  cell(s.layer || EMPTY, { width: REL[0], center: true }),
                  cell(s.name, { width: REL[1] }, latin),
                  cell(s.abundance || EMPTY, { width: REL[2], center: true }),
                ],
              }),
          )
        : [new TableRow({ children: [cell('Brak gatunków.', { width: TABLE_W, span: 3, italic: true })] })]),
    ]
    out.push(table(REL, rows))
  })
  return out
}

// ---------- dokument ----------

export async function buildCardDocument(m: Methodology, v: CardValues): Promise<Document> {
  const latin = latinMatcher(m)
  const section = (rows: TableRow[], cols: number[]) => table(cols, rows)
  const hasCardinal = m.indicators.some((i) => isCardinal(i, v.site))
  const blocks = [
    ...(hasCardinal
      ? [
          new Paragraph({
            spacing: { after: 80 },
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun({
                font: FONT,
                size: SIZE,
                bold: true,
                text: 'Pogrubioną czcionką zaznaczono wskaźniki kardynalne dla oceny parametru „Specyficzna struktura i funkcje”',
              }),
            ],
          }),
        ]
      : []),
    section(siteSection(m, v, latin), [LABEL_W, VALUE_W]),
    section(statusSection(m, v, latin), [S.param, S.ind, S.value, S.grade, S.paramGrade]),
    section(impactsSection(v, latin), IMP),
    section(threatsSection(v, latin), THR),
    section(await otherSection(m, v, latin), OTHER),
    ...relevesTables(m, v, latin),
  ]
  // Tabele idą jedna pod drugą bez odstępu – w Wordzie wyglądają jak jedna karta, jak w oryginale.
  return new Document({
    creator: 'FITOS',
    title: `Karta obserwacji ${m.code} – ${String(v.site?.siteName ?? '')}`,
    styles: { default: { document: { run: { font: FONT, size: SIZE } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1417, right: 1417, bottom: 1417, left: 1417 },
          },
        },
        children: blocks,
      },
    ],
  })
}

/** Nazwa pliku: „Karta_7120_Reptowo_2_14.07.2025.docx”. */
export function docxFileName(m: Methodology, v: CardValues): string {
  const safe = (s: string) => s.trim().replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '_')
  const parts = ['Karta', m.code, safe(String(v.site?.siteName ?? '')) || 'stanowisko', isoToPl(v.site?.date)].filter(Boolean)
  return `${parts.join('_')}.docx`
}

export async function cardToDocxBlob(m: Methodology, v: CardValues): Promise<Blob> {
  return Packer.toBlob(await buildCardDocument(m, v))
}
