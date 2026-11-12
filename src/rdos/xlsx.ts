// Minimalny zapis .xlsx (SpreadsheetML) bez ciężkich bibliotek: komórki z tekstem, liczbami i formułami
// (z wartością policzoną zawczasu), szerokości kolumn, wysokości wierszy, scalenia, listy rozwijane i ukryte arkusze.
// Zip robi fflate, które i tak jest w projekcie (archiwum karty).
import { strToU8, zipSync } from 'fflate'

/** Style komórek – indeksy w cellXfs w styles.xml niżej. */
export const STYLE = {
  default: 0,
  /** Arial 10, ramka, zawijanie, do środka w pionie. */
  text: 1,
  /** Nagłówek: szare tło, wyśrodkowany. */
  head: 2,
  /** Pogrubiony tekst z ramką (nazwy parametrów). */
  bold: 3,
  /** Podpowiedź do wypełnienia (kolumny pomocnicze arkusza). */
  hint: 4,
  /** Ocena: wyśrodkowana. */
  grade: 5,
  /** Procent (0%). */
  percent: 6,
  /** Kolumny techniczne do zestawień (Calibri, ramka). */
  plain: 7,
  /** Etykieta z lewej strony (Arial 10, ramka, wyśrodkowana w pionie, bez tła). */
  label: 8,
} as const
export type StyleId = (typeof STYLE)[keyof typeof STYLE]

export interface Cell {
  /** Tekst albo liczba. Dla formuły – wartość policzona (pokazywana, dopóki Excel nie przeliczy). */
  v?: string | number
  /** Formuła bez „=”. */
  f?: string
  s?: StyleId
}

export interface Validation {
  sqref: string
  /** Formuła listy, np. 'słowniki'!$J$2:$J$414 albo "FV,U1,U2,XX". */
  list: string
}

export class Sheet {
  readonly cells = new Map<number, Map<number, Cell>>()
  readonly merges: string[] = []
  readonly validations: Validation[] = []
  readonly colWidths: Record<number, number> = {}
  readonly rowHeights: Record<number, number> = {}

  readonly name:string;
  readonly hidden:boolean;

  constructor(
      name: string,
      hidden = false
  ) {
    this.name = name;
    this.hidden = hidden;
  }

  /** set('B2', 'tekst') albo set('B2', 0.4, STYLE.percent) albo set('B7', 'U2', STYLE.text, 'ocena!C14'). */
  set(ref: string, v: string | number | undefined, s: StyleId = STYLE.text, f?: string): this {
    const { row, col } = parseRef(ref)
    let r = this.cells.get(row)
    if (!r) this.cells.set(row, (r = new Map()))
    r.set(col, { v, s, f })
    return this
  }

  get(ref: string): Cell | undefined {
    const { row, col } = parseRef(ref)
    return this.cells.get(row)?.get(col)
  }

  /** Szerokości kolumn w jednostkach Excela, od kolumny A. */
  widths(...w: number[]): this {
    w.forEach((x, i) => (this.colWidths[i + 1] = x))
    return this
  }

  merge(range: string): this {
    this.merges.push(range)
    return this
  }

  list(sqref: string, list: string): this {
    this.validations.push({ sqref, list })
    return this
  }

  height(row: number, h: number): this {
    this.rowHeights[row] = h
    return this
  }
}

export function colName(col: number): string {
  let s = ''
  for (let n = col; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s
  return s
}

export function parseRef(ref: string): { row: number; col: number } {
  const m = /^([A-Z]+)(\d+)$/.exec(ref)
  if (!m) throw new Error(`Zły adres komórki: ${ref}`)
  const col = [...m[1]].reduce((a, c) => a * 26 + c.charCodeAt(0) - 64, 0)
  return { row: Number(m[2]), col }
}

export const ref = (col: number, row: number) => `${colName(col)}${row}`

/** Nazwa arkusza w formule – zawsze w apostrofach (spacje, polskie litery). */
export const sheetRef = (name: string) => `'${name.replace(/'/g, "''")}'`

// ---------- XML ----------

const esc = (s: string) =>
  s
    // znaki sterujące są niedozwolone w XML (poza tab, LF, CR)
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

function cellXml(r: string, c: Cell): string {
  const s = c.s ? ` s="${c.s}"` : ''
  const isNum = typeof c.v === 'number' && Number.isFinite(c.v)
  if (c.f !== undefined) {
    const f = `<f>${esc(c.f)}</f>`
    if (c.v === undefined || c.v === '') return `<c r="${r}"${s} t="str">${f}<v></v></c>`
    return isNum ? `<c r="${r}"${s}>${f}<v>${c.v}</v></c>` : `<c r="${r}"${s} t="str">${f}<v>${esc(String(c.v))}</v></c>`
  }
  if (c.v === undefined || c.v === '') return `<c r="${r}"${s}/>`
  if (isNum) return `<c r="${r}"${s}><v>${c.v}</v></c>`
  return `<c r="${r}"${s} t="inlineStr"><is><t xml:space="preserve">${esc(String(c.v))}</t></is></c>`
}

function sheetXml(sh: Sheet): string {
  const rows = [...sh.cells.keys(), ...Object.keys(sh.rowHeights).map(Number)]
  const rowNums = [...new Set(rows)].sort((a, b) => a - b)
  const cols = Object.entries(sh.colWidths)
    .map(([c, w]) => `<col min="${c}" max="${c}" width="${w}" customWidth="1"/>`)
    .join('')
  const data = rowNums
    .map((rn) => {
      const cells = [...(sh.cells.get(rn)?.entries() ?? [])].sort((a, b) => a[0] - b[0])
      const h = sh.rowHeights[rn] ? ` ht="${sh.rowHeights[rn]}" customHeight="1"` : ''
      return `<row r="${rn}"${h}>${cells.map(([cn, c]) => cellXml(ref(cn, rn), c)).join('')}</row>`
    })
    .join('')
  const merges = sh.merges.length ? `<mergeCells count="${sh.merges.length}">${sh.merges.map((m) => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>` : ''
  const dv = sh.validations.length
    ? `<dataValidations count="${sh.validations.length}">${sh.validations
        .map(
          (v) =>
            `<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="0" sqref="${v.sqref}"><formula1>${esc(v.list)}</formula1></dataValidation>`,
        )
        .join('')}</dataValidations>`
    : ''
  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15"/>` +
    (cols ? `<cols>${cols}</cols>` : '') +
    `<sheetData>${data}</sheetData>${merges}${dv}` +
    `<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/></worksheet>`
  )
}

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="3">
<font><sz val="10"/><name val="Arial"/><family val="2"/><charset val="238"/></font>
<font><b/><sz val="10"/><name val="Arial"/><family val="2"/><charset val="238"/></font>
<font><sz val="11"/><name val="Calibri"/><family val="2"/><charset val="238"/><scheme val="minor"/></font>
</fonts>
<fills count="4">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFE7E6E6"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFFFF2CC"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="2">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border><left style="thin"><color auto="1"/></left><right style="thin"><color auto="1"/></right><top style="thin"><color auto="1"/></top><bottom style="thin"><color auto="1"/></bottom><diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="9">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="2" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
<xf numFmtId="9" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="2" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"/>
<xf numFmtId="0" fontId="0" fillId="2" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`

/** Składa skoroszyt. Zwraca bajty pliku .xlsx. */
export function buildXlsx(sheets: Sheet[], meta: { creator?: string; title?: string } = {}): Uint8Array {
  const n = sheets.length
  const ct =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
    sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('') +
    `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
    `<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>` +
    `<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`
  const rels =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
    `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>` +
    `<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`
  const wbRels =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('') +
    `<Relationship Id="rId${n + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`
  const firstVisible = Math.max(0, sheets.findIndex((s) => !s.hidden))
  const wb =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<bookViews><workbookView activeTab="${firstVisible}"/></bookViews><sheets>` +
    sheets.map((s, i) => `<sheet name="${esc(s.name)}" sheetId="${i + 1}"${s.hidden ? ' state="hidden"' : ''} r:id="rId${i + 1}"/>`).join('') +
    `</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`
  const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z')
  const core =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">` +
    `<dc:title>${esc(meta.title ?? '')}</dc:title><dc:creator>${esc(meta.creator ?? 'FITOS')}</dc:creator>` +
    `<dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`
  const app = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>FITOS</Application></Properties>`

  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': strToU8(ct),
    '_rels/.rels': strToU8(rels),
    'docProps/core.xml': strToU8(core),
    'docProps/app.xml': strToU8(app),
    'xl/workbook.xml': strToU8(wb),
    'xl/_rels/workbook.xml.rels': strToU8(wbRels),
    'xl/styles.xml': strToU8(STYLES_XML),
  }
  sheets.forEach((s, i) => (files[`xl/worksheets/sheet${i + 1}.xml`] = strToU8(sheetXml(s))))
  return zipSync(files, { level: 6 })
}
