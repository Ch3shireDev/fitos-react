// Zapis i odczyt karty jako .zip: `karta.json` + zdjęcia jako zwykłe pliki w `zdjecia/`.
// Zdjęcia nie siedzą w JSON-ie jako base64, więc plik da się otworzyć zwykłym archiwizatorem i obejrzeć zdjęcia.
import { strFromU8, strToU8, unzipSync, zipSync, type Zippable } from 'fflate'
import { assessCard, emptyCardValues } from '../../habitats/assessment'
import { isoToPl } from '../../habitats/dates'
import type { CardValues, FieldDef, InputValues, Methodology, PhotoRow } from '../../habitats/types'

export const CARD_FORMAT = 'fitos-karta'
export const CARD_VERSION = 1
const JSON_NAME = 'karta.json'
const PHOTO_DIR = 'zdjecia/'

/** Zdjęcie w zapisanej karcie: zamiast data URL – ścieżka pliku w archiwum. */
type StoredPhoto = Omit<PhotoRow, 'dataUrl'> & { file?: string }

export interface StoredCard {
  format: typeof CARD_FORMAT
  version: number
  habitat: string
  savedAt: string
  values: CardValues
  /** Oceny policzone w chwili zapisu – dla wygody czytającego JSON; przy wczytaniu i tak liczone od nowa. */
  assessment?: unknown
}

export class CardFileError extends Error {}

const MIME: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp', heic: 'image/heic' }
const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'image/bmp': 'bmp', 'image/heic': 'heic' }

function dataUrlToBytes(url: string): { bytes: Uint8Array; mime: string } | null {
  const m = /^data:([^;,]+);base64,(.*)$/s.exec(url)
  if (!m) return null
  const bin = atob(m[2])
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return { bytes, mime: m[1] }
}

function bytesToDataUrl(bytes: Uint8Array, mime: string): string {
  let bin = ''
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  return `data:${mime};base64,${btoa(bin)}`
}

const safeName = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .replace(/[^\w.-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')

/** Wszystkie miejsca w karcie, gdzie mogą być zdjęcia: [obiekt z wartościami, nazwa pola, prefiks pliku]. */
function photoSlots(m: Methodology, v: CardValues): [InputValues, string, string][] {
  const photos = (fields: FieldDef[]) => fields.filter((f) => f.kind === 'photos').map((f) => f.name)
  return [
    ...photos(m.siteFields).map((n) => [v.site, n, n] as [InputValues, string, string]),
    ...photos(m.otherFields).map((n) => [v.other, n, n] as [InputValues, string, string]),
    ...(v.releves ?? []).flatMap((r, i) =>
      photos(m.releves.fields).map((n) => [r, n, `zdjecie-fito-${i + 1}-${n}`] as [InputValues, string, string]),
    ),
  ].filter(([obj]) => obj)
}

/** Nazwa pliku: „Karta_7120_Reptowo_2_14.07.2025.zip”. */
export function cardFileName(m: Methodology, v: CardValues, ext = 'zip'): string {
  const site = safeName(String(v.site?.siteName ?? '')) || 'stanowisko'
  const date = isoToPl(v.site?.date)
  return `${['Karta', m.code, site, date].filter(Boolean).join('_')}.${ext}`
}

export function cardToZip(m: Methodology, values: CardValues): Uint8Array {
  const v: CardValues = structuredClone(values)
  const files: Zippable = {}
  let counter = 0
  for (const [obj, name, prefix] of photoSlots(m, v)) {
    const list = (obj[name] as PhotoRow[] | undefined) ?? []
    obj[name] = list.map((p): StoredPhoto => {
      const { dataUrl, ...rest } = p
      const decoded = dataUrl ? dataUrlToBytes(dataUrl) : null
      if (!decoded) return rest
      counter++
      const base = safeName((p.name ?? '').replace(/\.[^.]+$/, '')) || 'zdjecie'
      const file = `${PHOTO_DIR}${String(counter).padStart(2, '0')}_${prefix}_${base}.${EXT[decoded.mime] ?? 'bin'}`
      // JPEG/PNG są już skompresowane – level 0 oszczędza czas i nic nie traci
      files[file] = [decoded.bytes, { level: 0 }]
      return { ...rest, file }
    })
  }
  const stored: StoredCard = {
    format: CARD_FORMAT,
    version: CARD_VERSION,
    habitat: m.code,
    savedAt: new Date().toISOString(),
    values: v,
    assessment: assessCard(m, values),
  }
  files[JSON_NAME] = strToU8(JSON.stringify(stored, null, 2))
  return zipSync(files, { level: 6 })
}

/** Uzupełnia brakujące klucze pustymi wartościami (np. karta zapisana starszą wersją metodyki). */
function withDefaults(m: Methodology, v: Partial<CardValues>): CardValues {
  const empty = emptyCardValues(m)
  const indicators = { ...empty.indicators }
  for (const [id, iv] of Object.entries(v.indicators ?? {})) {
    indicators[id] = { ...empty.indicators[id], ...iv, inputs: { ...empty.indicators[id]?.inputs, ...iv?.inputs } }
  }
  return {
    ...empty,
    ...v,
    site: { ...empty.site, ...v.site },
    other: { ...empty.other, ...v.other },
    prospects: { ...empty.prospects, ...v.prospects },
    indicators,
    releves: v.releves ?? empty.releves,
    impacts: v.impacts ?? [],
    threats: v.threats ?? [],
  }
}

function parseStored(m: Methodology, text: string): StoredCard | { values: CardValues; habitat?: string } {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new CardFileError('Plik karty jest uszkodzony (niepoprawny JSON).')
  }
  if (!data || typeof data !== 'object') throw new CardFileError('To nie jest plik karty.')
  const obj = data as Record<string, unknown>
  // nowy format
  if (obj.format === CARD_FORMAT) return obj as unknown as StoredCard
  // stary eksport JSON z „Pobierz JSON”: { habitat, ...values, assessment }
  if ('site' in obj && 'indicators' in obj) {
    const { habitat, assessment: _a, ...values } = obj
    return { habitat: typeof habitat === 'string' ? habitat : undefined, values: values as unknown as CardValues }
  }
  throw new CardFileError(`To nie jest karta ${m.code} zapisana w FITOS.`)
}

export interface LoadedCard {
  values: CardValues
  photos: number
  missingPhotos: string[]
}

/** Wczytuje kartę z .zip (karta.json + zdjęcia) albo z samego .json. */
export function cardFromFile(m: Methodology, bytes: Uint8Array, fileName = ''): LoadedCard {
  const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b // „PK”
  let entries: Record<string, Uint8Array> = {}
  let text: string
  if (isZip) {
    try {
      entries = unzipSync(bytes)
    } catch {
      throw new CardFileError('Nie udało się rozpakować pliku .zip.')
    }
    const jsonName = Object.keys(entries).find((n) => n === JSON_NAME || n.endsWith(`/${JSON_NAME}`))
    if (!jsonName) throw new CardFileError(`W archiwum nie ma pliku ${JSON_NAME}.`)
    text = strFromU8(entries[jsonName])
  } else if (/\.json$/i.test(fileName) || bytes[0] === 0x7b /* { */) {
    text = strFromU8(bytes)
  } else {
    throw new CardFileError('Wybierz plik karty: .zip zapisany przez „Zapisz kartę” albo .json.')
  }

  const stored = parseStored(m, text)
  if (stored.habitat && stored.habitat !== m.code) {
    throw new CardFileError(`To karta siedliska ${stored.habitat}, a ten formularz jest dla ${m.code}.`)
  }
  const values = withDefaults(m, structuredClone(stored.values))
  let photos = 0
  const missingPhotos: string[] = []
  for (const [obj, name] of photoSlots(m, values)) {
    const list = (obj[name] as (StoredPhoto & PhotoRow)[] | undefined) ?? []
    obj[name] = list.map((p): PhotoRow => {
      const { file, ...rest } = p
      if (rest.dataUrl) {
        photos++
        return rest
      }
      if (!file) return rest
      const bytesOf = entries[file]
      if (!bytesOf) {
        missingPhotos.push(file)
        return rest
      }
      photos++
      const ext = file.split('.').pop()?.toLowerCase() ?? ''
      return { ...rest, dataUrl: bytesToDataUrl(bytesOf, MIME[ext] ?? 'application/octet-stream') }
    })
  }
  return { values, photos, missingPhotos }
}
