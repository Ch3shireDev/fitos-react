// Dokumentacja fotograficzna: wgrywanie zdjęć (przycisk albo przeciągnięcie), miniatury i podpisy.
import { useState, type DragEvent } from 'react'
import { useFieldArray, useFormContext, useWatch, type Control } from 'react-hook-form'
import type { CardValues, PhotoRow } from '../../habitats/types'
import { ErrorText, InputBox, p, toId, useFieldError, useRowError } from './fields'
import { isImageFile, photoToDataUrl } from './images'

const CAPTION_NUMBER = /^Fot\. \d+\./

/** Domyślny podpis, który obserwator dokańcza: „Fot. 3. ” */
export const defaultCaption = (n: number) => `Fot. ${n}. `

export function PhotosField({ path, labelId }: { path: string; labelId: string }) {
  const { control, getValues, setValue } = useFormContext<CardValues>()
  const { fields, append, remove, update } = useFieldArray({
    control: control as unknown as Control<{ list: PhotoRow[] }>,
    name: path as 'list',
  })
  const error = useFieldError(path)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const id = toId(path)

  const readFiles = async (files: File[]) => {
    const images = files.filter(isImageFile)
    const skipped = files.length - images.length
    setLoadError(skipped ? `Pominięto ${skipped} ${skipped === 1 ? 'plik, który nie jest' : 'pliki, które nie są'} zdjęciem.` : null)
    setBusy(true)
    try {
      return await Promise.all(images.map(async (f) => ({ name: f.name, dataUrl: await photoToDataUrl(f) })))
    } catch {
      setLoadError('Nie udało się wczytać zdjęcia. Spróbuj innego pliku (JPG albo PNG).')
      return []
    } finally {
      setBusy(false)
    }
  }

  const addFiles = async (files: File[]) => {
    const start = (getValues(p(path)) as PhotoRow[] | undefined)?.length ?? 0
    const loaded = await readFiles(files)
    if (loaded.length) append(loaded.map((f, i) => ({ ...f, caption: defaultCaption(start + i + 1) })))
  }

  const attachFile = async (index: number, files: File[]) => {
    const [loaded] = await readFiles(files.slice(0, 1))
    if (!loaded) return
    const row = (getValues(p(`${path}.${index}`)) as PhotoRow | undefined) ?? { caption: '' }
    update(index, { ...row, ...loaded })
  }

  const removeAt = (index: number) => {
    remove(index)
    // Podpisy „Fot. N.” przenumerowujemy, żeby numeracja nie miała dziur.
    const rows = (getValues(p(path)) as PhotoRow[] | undefined) ?? []
    rows.forEach((row, i) => {
      if (CAPTION_NUMBER.test(row.caption)) {
        const next = row.caption.replace(CAPTION_NUMBER, `Fot. ${i + 1}.`)
        if (next !== row.caption) setValue(p(`${path}.${i}.caption`), next)
      }
    })
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    void addFiles(Array.from(e.dataTransfer.files))
  }

  return (
    <div className="hf-list" role="group" aria-labelledby={labelId}>
      {fields.length > 0 && (
        <ul className="hf-photos">
          {fields.map((row, idx) => (
            <PhotoRowEditor
              key={row.id}
              path={`${path}.${idx}`}
              index={idx}
              onRemove={() => removeAt(idx)}
              onAttach={(files) => void attachFile(idx, files)}
            />
          ))}
        </ul>
      )}
      <div
        className={`hf-drop${dragging ? ' hf-drop-active' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <input
          id={`${id}-upload`}
          type="file"
          accept="image/*"
          multiple
          className="hf-sr-only"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            e.target.value = ''
            void addFiles(files)
          }}
        />
        <label htmlFor={`${id}-upload`} className="hf-btn-like">
          Dodaj zdjęcia
        </label>
        <span className="hf-drop-text">
          {busy ? 'Wczytuję…' : 'albo przeciągnij je tutaj. Duże zdjęcia zmniejszamy do 1600 px, żeby karta nie ważyła setek MB.'}
        </span>
      </div>
      {loadError && (
        <p className="hf-warn" role="status">
          {loadError}
        </p>
      )}
      <ErrorText id={`${id}-error`} message={error} />
    </div>
  )
}

function PhotoRowEditor({
  path,
  index,
  onRemove,
  onAttach,
}: {
  path: string
  index: number
  onRemove: () => void
  onAttach: (files: File[]) => void
}) {
  const { register, control } = useFormContext<CardValues>()
  const row = useWatch({ control, name: p(path) }) as PhotoRow | undefined
  const captionError = useRowError(`${path}.caption`)
  const captionId = toId(`${path}.caption`)
  const fileId = toId(`${path}.file`)
  const n = index + 1
  return (
    <li className="hf-photo">
      <div className={`hf-photo-thumb${row?.dataUrl ? '' : ' hf-photo-thumb-empty'}`}>
        {row?.dataUrl ? (
          <img src={row.dataUrl} alt={row.caption?.trim() || `Zdjęcie ${n}`} title={row.name} />
        ) : (
          <>
            <input
              id={fileId}
              type="file"
              accept="image/*"
              className="hf-sr-only"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? [])
                e.target.value = ''
                onAttach(files)
              }}
            />
            <label htmlFor={fileId} className="hf-photo-missing">
              brak pliku
              <span className="hf-link-like">dodaj plik</span>
              <span className="hf-sr-only"> do zdjęcia {n}</span>
            </label>
          </>
        )}
      </div>
      <div className="hf-photo-meta">
        <label htmlFor={captionId} className="hf-photo-label">
          Podpis zdjęcia {n}
        </label>
        <InputBox invalid={Boolean(captionError)}>
          <input
            id={captionId}
            type="text"
            className="hf-control"
            aria-invalid={captionError ? true : undefined}
            {...register(p(`${path}.caption`))}
          />
        </InputBox>
        {captionError && <span className="hf-error">{captionError}</span>}
        {row?.name && <span className="hf-tag">{row.name}</span>}
      </div>
      <button type="button" className="hf-icon" onClick={onRemove} aria-label={`Usuń fotografię ${n}`}>
        ✕
      </button>
    </li>
  )
}
