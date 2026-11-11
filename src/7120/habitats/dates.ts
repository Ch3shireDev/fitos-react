// Daty: w formularzu piszemy po polsku (DD.MM.RRRR), w danych trzymamy ISO (RRRR-MM-DD).
// Natywny <input type="date"> pokazuje format z ustawień przeglądarki (często MM/DD/YYYY), więc go nie używamy do wpisywania.

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/
const PL = /^(\d{1,2})[.\-/ ](\d{1,2})[.\-/ ](\d{4})$/

function valid(y: number, m: number, d: number): boolean {
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Czy to poprawna data ISO (także 30 lutego odpada). */
export function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const m = ISO.exec(value)
  return Boolean(m && valid(+m[1], +m[2], +m[3]))
}

/** „14.07.2025”, „14.7.2025”, „14-07-2025” → „2025-07-14”. Niepoprawne → null. */
export function plToIso(text: string): string | null {
  const m = PL.exec(text.trim())
  if (!m) return null
  const [d, mo, y] = [+m[1], +m[2], +m[3]]
  return valid(y, mo, d) ? `${y}-${pad(mo)}-${pad(d)}` : null
}

/** „2025-07-14” → „14.07.2025”. Coś innego zwraca bez zmian (np. niedokończony tekst). */
export function isoToPl(value: unknown): string {
  if (typeof value !== 'string') return ''
  const m = ISO.exec(value)
  return m ? `${m[3]}.${m[2]}.${m[1]}` : value
}

/**
 * Wstawia kropki podczas pisania samych cyfr: „14” → „14.”, „1407” → „14.07.”, „14072025” → „14.07.2025”.
 * Przy kasowaniu (tekst krótszy niż poprzednio) nic nie dokleja.
 */
export function autoDots(next: string, prev: string): string {
  if (next.length < prev.length) return next
  const digits = next.replace(/\D/g, '')
  if (/^\d+$/.test(next) && digits.length === 8) return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`
  if (/^\d{2}$/.test(next) || /^\d{1,2}\.\d{2}$/.test(next)) return `${next}.`
  return next
}
