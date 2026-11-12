import { describe, expect, it } from 'vitest'
import { strFromU8, unzipSync } from 'fflate'
import { cardToXlsx, firstSurname, photoLines, xlsxFileName } from './exportXlsx'
import { methodology6510, rdosProfile6510 } from '../6510/habitats/methodology'
import { plh020050_6510_02, plh020050_6510_06 } from '../6510/habitats/examples'
import { methodology6410, rdosProfile6410 } from '../6410/habitats/methodology'
import { wedziszew6410 } from '../6410/habitats/examples'

const unpack = (bytes: Uint8Array) => {
  const files = unzipSync(bytes)
  const text = (p: string) => strFromU8(files[p])
  return { files, text }
}

describe('eksport xlsx RDOŚ', () => {
  it('ma arkusze w kolejności wzoru, słowniki ukryte', () => {
    const { text } = unpack(cardToXlsx(methodology6510, plh020050_6510_02, rdosProfile6510))
    const wb = text('xl/workbook.xml')
    const names = [...wb.matchAll(/<sheet name="([^"]+)"/g)].map((m) => m[1])
    expect(names).toEqual(['część ogólna', 'zdjęcia fitosocjologiczne', 'ocena', 'oddziaływania_zagrożenia', 'działania', 'słowniki'])
    expect(wb).toMatch(/<sheet name="słowniki"[^>]*state="hidden"/)
    expect(wb).toContain('fullCalcOnLoad="1"')
  })

  it('część ogólna: kod stanowiska, nazwa obszaru z VLOOKUP, ocena z arkusza ocena, wykonawca zanonimizowany', () => {
    const { text } = unpack(cardToXlsx(methodology6510, plh020050_6510_02, rdosProfile6510))
    const s = text('xl/worksheets/sheet1.xml')
    expect(s).toContain('PLH020050_6510_02')
    expect(s).toContain('VLOOKUP')
    expect(s).toMatch(/<f>'ocena'!C\d+<\/f>/)
    expect(s).toContain('Jan Kowalski')
    expect(s).toContain('Kowalski')
  })

  it('dane walidowane listami ze słowników', () => {
    const { text } = unpack(cardToXlsx(methodology6510, plh020050_6510_06, rdosProfile6510))
    expect(text('xl/worksheets/sheet3.xml')).toContain('<dataValidation')
    expect(text('xl/worksheets/sheet5.xml')).toContain("'słowniki'!")
  })

  it('autor pliku i wykonawca to Jan Kowalski', () => {
    for (const [m, v, p] of [
      [methodology6510, plh020050_6510_02, rdosProfile6510],
      [methodology6510, plh020050_6510_06, rdosProfile6510],
      [methodology6410, wedziszew6410, rdosProfile6410],
    ] as const) {
      const { files, text } = unpack(cardToXlsx(m, v, p))
      const all = Object.keys(files).filter((f) => f.endsWith('.xml')).map(text).join('\n')
      expect(all).toContain('Jan Kowalski')
      const creators = [...all.matchAll(/<dc:creator>([^<]*)</g)].map((x) => x[1])
      expect(creators).toEqual(['Jan Kowalski'])
    }
  })

  it('6410: nazwa siedliska i wiersz gatunków typowych', () => {
    const { text } = unpack(cardToXlsx(methodology6410, wedziszew6410, rdosProfile6410))
    expect(text('xl/worksheets/sheet1.xml')).toContain('Zmiennowilgotne łąki trzęślicowe (Molinion)')
    expect(text('xl/worksheets/sheet3.xml')).toContain('Gatunki typowe')
    expect(text('xl/worksheets/sheet4.xml')).toContain('K02')
  })

  it('nazwa pliku = kod stanowiska', () => {
    expect(xlsxFileName(methodology6510, plh020050_6510_02)).toBe('PLH020050_6510_02.xlsx')
    expect(xlsxFileName(methodology6410, wedziszew6410)).toBe('PLC140001_6410_Wedziszew.xlsx')
    const empty = { ...wedziszew6410, site: { ...wedziszew6410.site, siteName: '' } }
    expect(xlsxFileName(methodology6410, empty)).toBe('Karta_6410.xlsx')
  })

  it('podpisy zdjęć: kod_nr_Nazwisko', () => {
    expect(firstSurname('Jan Kowalski')).toBe('Kowalski')
    const lines = photoLines({ siteName: 'PLH020050_6510_02', observer: 'Jan Kowalski' }, [{ caption: 'widok ogólny' } as never])
    expect(lines).toBe('PLH020050_6510_02_1_Kowalski -   widok ogólny')
  })
})
