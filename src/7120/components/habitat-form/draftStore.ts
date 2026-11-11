// Kopia robocza karty w pamięci przeglądarki (IndexedDB – zdjęcia jako data URL nie zmieściłyby się w localStorage, limit ~5 MB).
// Dane zostają po zamknięciu karty przeglądarki, po restarcie telefonu i offline. Kasuje je dopiero „Wyczyść” (po potwierdzeniu).
import type { CardValues } from '../../habitats/types'

const DB = 'fitos'
const STORE = 'drafts'

export interface Draft {
  values: CardValues
  savedAt: string
}

function open(): Promise<IDBDatabase> | null {
  if (typeof indexedDB === 'undefined') return null
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T | undefined> {
  const pending = open()
  if (!pending) return undefined
  const db = await pending
  try {
    return await new Promise<T>((resolve, reject) => {
      const req = fn(db.transaction(STORE, mode).objectStore(STORE))
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  } finally {
    db.close()
  }
}

export const draftKey = (habitat: string) => `karta-${habitat}`

export async function loadDraft(key: string): Promise<Draft | undefined> {
  try {
    return (await run<Draft>('readonly', (s) => s.get(key) as IDBRequest<Draft>)) ?? undefined
  } catch {
    return undefined
  }
}

export async function saveDraft(key: string, values: CardValues): Promise<void> {
  const draft: Draft = { values, savedAt: new Date().toISOString() }
  await run('readwrite', (s) => s.put(draft, key))
}

export async function deleteDraft(key: string): Promise<void> {
  await run('readwrite', (s) => s.delete(key))
}
