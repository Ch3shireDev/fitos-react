import { describe, expect, it } from 'vitest'
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'
import { examples7120 } from '../../habitats/7120/examples'
import { methodology7120 as m } from '../../habitats/7120/methodology'
import type { CardValues, PhotoRow } from '../../habitats/types'
import { CARD_FORMAT, CardFileError, cardFileName, cardFromFile, cardToZip } from './cardArchive'

/** 1×1 px PNG */
const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

const withPhoto = (): CardValues => {
  const v = structuredClone(examples7120[0].values)
  v.other.photos = [
    { caption: 'Fot. 1. Widok ogólny (fot. J. Kowalski)', name: 'IMG 001.png', dataUrl: PNG },
    { caption: 'Fot. 2. Sam podpis, bez pliku' },
  ] satisfies PhotoRow[]
  return v
}

describe('zapis karty do .zip', () => {
  it('karta.json + zdjęcia jako osobne pliki, bez base64 w JSON-ie', () => {
    const files = unzipSync(cardToZip(m, withPhoto()))
    const names = Object.keys(files)
    expect(names).toContain('karta.json')
    const photo = names.find((n) => n.startsWith('zdjecia/'))
    expect(photo).toBe('zdjecia/01_photos_IMG_001.png')
    expect(files[photo!][0]).toBe(0x89) // nagłówek PNG
    const json = strFromU8(files['karta.json'])
    expect(json).not.toContain('base64')
    const stored = JSON.parse(json)
    expect(stored.format).toBe(CARD_FORMAT)
    expect(stored.habitat).toBe('7120')
    expect(stored.values.other.photos[0].file).toBe(photo)
    expect(stored.assessment.overall).toBeTruthy()
  })

  it('wczytanie odtwarza kartę razem ze zdjęciami', () => {
    const original = withPhoto()
    const loaded = cardFromFile(m, cardToZip(m, original), 'karta.zip')
    expect(loaded.photos).toBe(1)
    expect(loaded.missingPhotos).toEqual([])
    expect(loaded.values).toEqual(original)
  })

  it('brakujące zdjęcie w archiwum: karta się wczytuje, zdjęcie trafia na listę braków', () => {
    const files = unzipSync(cardToZip(m, withPhoto()))
    const json = files['karta.json']
    const loaded = cardFromFile(m, zipSync({ 'karta.json': json }))
    expect(loaded.photos).toBe(0)
    expect(loaded.missingPhotos).toEqual(['zdjecia/01_photos_IMG_001.png'])
    expect((loaded.values.other.photos as PhotoRow[])[0].caption).toMatch(/Fot\. 1/)
  })

  it('czyta też stary eksport „Pobierz JSON”', () => {
    const v = examples7120[0].values
    const old = JSON.stringify({ habitat: '7120', ...v, assessment: { overall: 'U2' } })
    const loaded = cardFromFile(m, strToU8(old), 'karta-7120.json')
    expect(loaded.values).toEqual(v)
  })

  it('odrzuca kartę innego siedliska i pliki, które nie są kartą', () => {
    const other = JSON.stringify({ format: CARD_FORMAT, version: 1, habitat: '91D0', values: examples7120[0].values })
    expect(() => cardFromFile(m, strToU8(other), 'x.json')).toThrow(/To karta siedliska 91D0/)
    expect(() => cardFromFile(m, strToU8('{"a":1}'), 'x.json')).toThrow(CardFileError)
    expect(() => cardFromFile(m, strToU8('nie json'), 'x.txt')).toThrow(CardFileError)
    expect(() => cardFromFile(m, zipSync({ 'cos.txt': strToU8('x') }))).toThrow(/karta\.json/)
  })

  it('nazwa pliku z kodu, stanowiska i daty', () => {
    expect(cardFileName(m, examples7120[0].values)).toBe('Karta_7120_Reptowo_2_14.07.2025.zip')
  })
})
