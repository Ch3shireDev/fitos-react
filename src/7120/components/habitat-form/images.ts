// Wczytywanie zdjęć do formularza: zmniejszenie do rozsądnego rozmiaru i zamiana na data URL.
// Bez backendu zdjęcie musi jakoś trafić do zapisanej karty – data URL to jedyna opcja, która przetrwa JSON.

/** Dłuższy bok po zmniejszeniu. 1600 px wystarcza do raportu, a zdjęcie z telefonu chudnie z ~5 MB do ~300 kB. */
export const MAX_PHOTO_SIDE = 1600

export const isImageFile = (file: File) => file.type.startsWith('image/')

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('Nie udało się odczytać pliku'))
    reader.readAsDataURL(file)
  })
}

async function resize(file: File, maxSide: number): Promise<string | null> {
  if (typeof createImageBitmap !== 'function' || typeof document === 'undefined') return null
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const url = canvas.toDataURL('image/jpeg', 0.85)
    return url.startsWith('data:image/') ? url : null
  } finally {
    bitmap.close()
  }
}

/** Zdjęcie → data URL (JPEG, max {@link MAX_PHOTO_SIDE} px). Gdy przeglądarka nie umie przeskalować – oryginał. */
export async function photoToDataUrl(file: File, maxSide = MAX_PHOTO_SIDE): Promise<string> {
  try {
    const small = await resize(file, maxSide)
    if (small) return small
  } catch {
    // np. HEIC, którego przeglądarka nie dekoduje – zostaje oryginał
  }
  return readAsDataUrl(file)
}
