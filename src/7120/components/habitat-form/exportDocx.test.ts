import { describe, expect, it } from 'vitest'
import { Packer } from 'docx'
import { strFromU8, unzipSync } from 'fflate'
import { emptyCardValues, emptyReleve } from '../../habitats/assessment'
import { examples7120 } from '../../habitats/7120/examples'
import { methodology7120 as m } from '../../habitats/7120/methodology'
import type { CardValues } from '../../habitats/types'
import { buildCardDocument, docxFileName, formatFieldValue, imageDims } from './exportDocx'

/** 1×1 px PNG */
const PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

async function docxParts(values: CardValues) {
  const buf = await Packer.toBuffer(await buildCardDocument(m, values))
  const files = unzipSync(new Uint8Array(buf))
  const xml = strFromU8(files['word/document.xml'])
  const text = [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('|')
  return { files, xml, text }
}

describe('eksport karty do docx', () => {
  const example = examples7120[0].values

  it('ma sekcje, etykiety i wartości jak karta GIOŚ', async () => {
    const { text, xml } = await docxParts(example)
    for (const t of [
      'Karta obserwacji siedliska przyrodniczego na stanowisku',
      'Stanowisko – informacje podstawowe',
      'Kod i nazwa siedliska przyrodniczego',
      'Stan ochrony siedliska przyrodniczego na stanowisku',
      'Wartość lub opis',
      'Perspektywy ochrony',
      'Ocena ogólna',
      'Oddziaływania',
      'Zagrożenia (przyszłe, przewidywane oddziaływania)',
      'Inne informacje',
      'Reptowo 2',
      '14.07.2025',
      'Jan Kowalski',
      'C01.03.02',
    ]) {
      expect(text).toContain(t)
    }
    // kolory pasków i kolumny etykiet z oryginału, Times New Roman, A4
    for (const fill of ['A6A6A6', 'BFBFBF', 'D9D9D9', 'F2F2F2']) expect(xml).toContain(`w:fill="${fill}"`)
    expect(xml).toContain('Times New Roman')
    expect(xml).toContain('w:w="11906"')
  })

  it('liczy oceny parametrów i ogólną jak formularz', async () => {
    const { text } = await docxParts(example)
    expect(text).toMatch(/Ocena ogólna\|.*\|U2/)
  })

  it('pisze nazwy łacińskie z katalogu kursywą', async () => {
    const { xml } = await docxParts(example)
    expect(xml).toMatch(/<w:i\/>.*?<w:t[^>]*>Eriophorum vaginatum<\/w:t>/s)
  })

  it('wstawia zdjęcia z podpisami i zdjęcia fitosocjologiczne ze składem gatunkowym', async () => {
    const values: CardValues = {
      ...example,
      other: { ...example.other, photos: [{ name: 'a.png', dataUrl: PNG, caption: 'Fot. 1. Test (fot. J. Kowalski)' }] },
      releves: [
        {
          ...emptyReleve(m),
          coverA: 0,
          heightB: 1.5,
          species: [
            { layer: 'D', name: 'Sphagnum fallax', abundance: '3' },
            { layer: 'B', name: 'Pinus sylvestris', abundance: '+' },
          ],
        },
      ],
    }
    const { files, text } = await docxParts(values)
    expect(Object.keys(files).some((f) => f.startsWith('word/media/'))).toBe(true)
    expect(text).toContain('Fot. 1. Test (fot. J. Kowalski)')
    expect(text).toContain('Zdjęcie fitosocjologiczne I')
    expect(text).toContain('Wysokość B: 1,5 m')
    // warstwy posortowane B przed D
    expect(text.lastIndexOf('Pinus sylvestris')).toBeLessThan(text.lastIndexOf('Sphagnum fallax'))
  })

  it('czyta wymiary zdjęcia z nagłówka PNG, żeby nie wyszła miniatura 1×1 cm', () => {
    const bin = atob(PNG.split(',')[1])
    const data = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    expect(imageDims(data, 'png')).toEqual({ w: 1, h: 1 })
  })

  it('pusta karta też się generuje, a puste pola mają kreskę', async () => {
    const { text } = await docxParts(emptyCardValues(m))
    expect(text).toContain('–')
    expect(text).toContain('Brak oddziaływań.')
  })

  it('formatuje wartości po polsku i nazywa plik po stanowisku i dacie', () => {
    const area = m.siteFields.find((f) => f.name === 'areaHa')!
    expect(formatFieldValue(area, 5.91)).toBe('5,91 ha')
    const date = m.siteFields.find((f) => f.name === 'date')!
    expect(formatFieldValue(date, '2025-07-14')).toBe('14.07.2025')
    expect(docxFileName(m, example)).toBe('Karta_7120_Reptowo_2_14.07.2025.docx')
  })
})
