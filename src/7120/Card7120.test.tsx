import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card7120 } from './Card7120'

afterEach(cleanup) // na wypadek gdyby vitest nie miał globals: true

/** Szukamy kontrolki, nie przycisku „?” z aria-label „Wyjaśnienie: …”. */
const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card7120 />)
  return user
}

type User = ReturnType<typeof setup>
const sectionTitles = () => screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const loadExample = (user: User, name = 'Reptowo 2') =>
  user.click(screen.getByRole('button', { name: `Wczytaj przykład: ${name}` }))

/** Otwiera panel „Pomiary i progi” danego wskaźnika. */
const openMeasurements = (user: User, indicator: string) =>
  user.click(screen.getByRole('button', { name: new RegExp(`Pomiary i progi.*– ${indicator}`) }))

describe('Card7120 – układ jak w karcie obserwacji', () => {
  it('startuje od sekcji „Stanowisko – informacje podstawowe”', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 7120' })).toBeInTheDocument()
    expect(screen.getByText('Karta obserwacji siedliska przyrodniczego na stanowisku')).toBeInTheDocument()
    expect(sectionTitles()).toEqual(['Stanowisko – informacje podstawowe'])
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x10 m')
  })

  it('zakładki i sekcje mają kolejność i nazwy z karty', async () => {
    const user = setup()
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual([
      'Stanowisko',
      'Stan ochrony',
      'Oddziaływania',
      'Zagrożenia',
      'Inne informacje',
      'Zdjęcia fitosocjologiczne',
      'Całość',
    ])
    await user.click(tab('Całość'))
    expect(sectionTitles()).toEqual([
      'Stanowisko – informacje podstawowe',
      'Stan ochrony siedliska przyrodniczego na stanowisku',
      'Oddziaływania',
      'Zagrożenia (przyszłe, przewidywane oddziaływania)',
      'Inne informacje',
      'Zdjęcia fitosocjologiczne',
    ])
  })

  it('tabela stanu ochrony ma kolumny z karty', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    const headers = screen.getAllByRole('columnheader').map((h) => h.textContent)
    expect(headers).toEqual(['Wskaźniki', 'Wartość lub opis?', 'Ocena wskaźnika i parametru?'])
  })

  it('jednostka siedzi w polu, a czytnik ekranu dostaje ją w etykiecie', () => {
    setup()
    const altitude = screen.getByLabelText(/Wysokość n\.p\.m\. \(m n\.p\.m\.\)/, FIELD)
    expect(altitude.closest('.hf-box')).toHaveTextContent('m n.p.m.')
  })
})

describe('Card7120 – nawigacja i zapis', () => {
  it('obsługuje strzałki na liście zakładek', async () => {
    const user = setup()
    tab('Stanowisko').focus()
    await user.keyboard('{ArrowRight}')
    expect(tab('Stan ochrony')).toHaveFocus()
    expect(sectionTitles()).toEqual(['Stan ochrony siedliska przyrodniczego na stanowisku'])
    await user.keyboard('{End}')
    expect(tab('Całość')).toHaveAttribute('aria-selected', 'true')
  })

  it('pusta karta przy zapisie: komunikat, skok do pierwszej zakładki z błędem i znaczniki', async () => {
    const user = setup()
    await user.click(tab('Oddziaływania'))
    await user.click(screen.getByRole('button', { name: 'Zapisz kartę (.zip)' }))
    expect(await screen.findByText(/Karta nie zapisana\. Błędy w: Stanowisko, Stan ochrony/)).toBeInTheDocument()
    expect(sectionTitles()).toEqual(['Stanowisko – informacje podstawowe'])
    expect(screen.getByLabelText(/Nazwa stanowiska/, FIELD)).toHaveAttribute('aria-invalid', 'true')
    expect(within(tab(/Stan ochrony/)).getByLabelText('zawiera błędy')).toBeInTheDocument()
    expect(within(tab(/Oddziaływania/)).queryByLabelText('zawiera błędy')).toBeNull()
  })

  it('data po polsku: kropki wstawiają się same, termin poza oknem daje ostrzeżenie', async () => {
    const user = setup()
    const date = screen.getByLabelText(/Data obserwacji/, FIELD)
    await user.type(date, '10042025')
    expect(date).toHaveValue('10.04.2025')
    expect(screen.getByText(/Termin poza optymalnym oknem/)).toBeInTheDocument()
    await user.clear(date)
    await user.type(date, '14.7.2025')
    expect(screen.queryByText(/Termin poza optymalnym oknem/)).toBeNull()
  })

  it('przykład pokazuje datę jako DD.MM.RRRR, a nieistniejąca data blokuje zapis', async () => {
    const user = setup()
    await loadExample(user)
    const date = screen.getByLabelText(/Data obserwacji/, FIELD)
    expect(date).toHaveValue('14.07.2025')
    await user.clear(date)
    await user.type(date, '31.02.2025')
    await user.click(screen.getByRole('button', { name: 'Zapisz kartę (.zip)' }))
    expect(await screen.findByText('Podaj datę w formacie DD.MM.RRRR, np. 14.07.2025')).toBeInTheDocument()
  })

  it('wczytuje przykład z karty docx i liczy oceny jak w karcie', async () => {
    const user = setup()
    await loadExample(user)
    expect(screen.getByLabelText(/Nazwa stanowiska/, FIELD)).toHaveValue('Reptowo 2')
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')

    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U2')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Zapisz kartę (.zip)' }))
    expect(await screen.findByText(/Karta zapisana/)).toBeInTheDocument()
  })
})

describe('Card7120 – wskaźniki', () => {
  it('podpowiada ocenę z pomiarów i pozwala ją przyjąć jednym kliknięciem', async () => {
    const user = setup()
    await loadExample(user, 'Reptowo IV')
    await user.click(tab('Stan ochrony'))
    await openMeasurements(user, 'Gatunki ekspansywne roślin zielnych')

    const cover = screen.getByLabelText(/Łączne pokrycie gatunków ekspansywnych/, FIELD)
    await user.clear(cover)
    await user.type(cover, '80')
    const row = cover.closest('tr')!
    expect(within(row).getByText('Ocena U1 odbiega od progów (U2) – uzasadnij w opisie.')).toBeInTheDocument()

    await user.click(within(row).getByRole('button', { name: 'Przyjmij U2' }))
    expect(screen.getByLabelText('Ocena wskaźnika: Gatunki ekspansywne roślin zielnych')).toHaveValue('U2')
  })

  it('lista gatunków jest od razu w kolumnie wartości; dodaje własny gatunek z pokryciem <1%', async () => {
    const user = setup()
    await loadExample(user)
    await user.click(tab('Stan ochrony'))
    const list = screen.getByRole('group', { name: /Gatunki charakterystyczne na transekcie/ })
    const row = list.closest('tr')!
    expect(within(row).getByText(/Torfowce charakterystyczne: 2 \(Sphagnum cuspidatum, Sphagnum fallax\)/)).toBeInTheDocument()

    const picker = within(list).getByLabelText('Gatunek', FIELD)
    await user.type(picker, 'Kaktus')
    await user.click(within(list).getByRole('option', { name: 'Dodaj własny: „Kaktus”' }))
    const cover = within(list).getByLabelText('Pokrycie', FIELD)
    expect(cover).toHaveFocus()
    await user.type(cover, '<1{Enter}')
    expect(within(list).getByLabelText('Gatunek 5')).toHaveValue('Kaktus')
    expect(within(list).getByLabelText('Pokrycie 5 (%)')).toHaveValue('<1')
    expect(picker).toHaveValue('')
    expect(picker).toHaveFocus()
    expect(within(row).getByText(/Nie rozpoznano: Kaktus/)).toBeInTheDocument()
  })

  it('„Dodaj gatunek” bez gatunku podpowiada, co zrobić; pokrycie 0,5 z przykładu pokazuje się jako <1', async () => {
    const user = setup()
    await loadExample(user)
    await user.click(tab('Stan ochrony'))
    const list = screen.getByRole('group', { name: /Gatunki charakterystyczne na transekcie/ })
    await user.click(within(list).getByRole('button', { name: '+ Dodaj gatunek' }))
    expect(within(list).getByText('Najpierw wybierz albo wpisz gatunek.')).toBeInTheDocument()
    const covers = within(list).getAllByLabelText(/^Pokrycie \d+ \(%\)$/).map((el) => (el as HTMLInputElement).value)
    expect(covers).toContain('<1')
  })

  it('wyszukuje gatunek po polskiej nazwie bez ogonków i dodaje go klawiaturą', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    const list = screen.getByRole('group', { name: /Gatunki charakterystyczne na transekcie/ })
    await user.type(within(list).getByLabelText('Gatunek', FIELD), 'zurawina blo')
    expect(within(list).getByRole('option', { name: /Oxycoccus palustris – żurawina błotna/ })).toBeInTheDocument()
    await user.keyboard('{Enter}')
    await user.keyboard('12{Enter}')
    expect(within(list).getByLabelText('Gatunek 1')).toHaveValue('Oxycoccus palustris')
    expect(within(list).getByLabelText('Pokrycie 1 (%)')).toHaveValue('12')
    expect(within(list).getByText(/żurawina błotna · charakterystyczna roślina naczyniowa/)).toBeInTheDocument()
  })
})

describe('Card7120 – oddziaływania', () => {
  it('kod oddziaływania uzupełnia nazwę', async () => {
    const user = setup()
    await loadExample(user)
    await user.click(tab('Oddziaływania'))
    await user.click(screen.getByRole('button', { name: '+ Dodaj oddziaływanie' }))
    await user.type(screen.getByLabelText('Kod oddziaływania 6'), 'K01.03')
    await user.tab()
    expect(screen.getByLabelText('Nazwa oddziaływania 6')).toHaveValue('Wyschnięcie')
  })
})

describe('Card7120 – zdjęcia fitosocjologiczne', () => {
  it('nowa karta ma 3 zdjęcia, można dodawać i usuwać, numeracja się przelicza', async () => {
    const user = setup()
    await user.click(tab('Zdjęcia fitosocjologiczne'))
    const legends = () => screen.getAllByRole('group', { name: /^Zdjęcie fitosocjologiczne [IVX]+/ }).length
    expect(legends()).toBe(3)

    await user.click(screen.getByRole('button', { name: '+ Dodaj zdjęcie fitosocjologiczne' }))
    expect(screen.getByRole('group', { name: /^Zdjęcie fitosocjologiczne IV/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Usuń zdjęcie I' }))
    await user.click(screen.getByRole('button', { name: 'Usuń zdjęcie I' }))
    expect(legends()).toBe(2)
    expect(screen.getByText(/Zdjęć: 2\. Metodyka przewiduje 3/)).toBeInTheDocument()
  })

  it('przykład z docx nie ma zdjęć (bo karta ich nie ma) i to widać', async () => {
    const user = setup()
    await loadExample(user)
    await user.click(tab('Zdjęcia fitosocjologiczne'))
    expect(screen.getByText(/Brak zdjęć fitosocjologicznych/)).toBeInTheDocument()
  })

  it('dodaje gatunek z warstwą podpowiedzianą z katalogu', async () => {
    const user = setup()
    await user.click(tab('Zdjęcia fitosocjologiczne'))
    const releve = screen.getByRole('group', { name: /^Zdjęcie fitosocjologiczne I Usuń/ })
    await user.type(within(releve).getByLabelText('Dodaj gatunek', FIELD), 'sph magel')
    await user.click(within(releve).getByRole('option', { name: /Sphagnum magellanicum/ }))
    expect(within(releve).getByLabelText('Gatunek 1')).toHaveValue('Sphagnum magellanicum')
    expect(within(releve).getByLabelText('Warstwa 1')).toHaveValue('D')

    await user.type(within(releve).getByLabelText('Dodaj gatunek', FIELD), 'sosna')
    await user.click(within(releve).getByRole('option', { name: /Pinus sylvestris/ }))
    expect(within(releve).getByLabelText('Warstwa 2')).toHaveValue('B')
    await user.selectOptions(within(releve).getByLabelText('Ilościowość 2'), '1')
    expect(within(releve).getByLabelText('Ilościowość 2')).toHaveValue('1')
  })
})

describe('Card7120 – wyjaśnienia', () => {
  it('„?” rozwija wyjaśnienie, a tryb dla początkujących rozwija wszystkie', async () => {
    const user = setup()
    const btn = screen.getByRole('button', { name: 'Wyjaśnienie: Nazwa stanowiska' })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    await user.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/Stabilna nazwa \(razem z GUID\)/)).toBeInTheDocument()

    await user.click(screen.getByLabelText(/Rozwiń wszystkie wyjaśnienia/, FIELD))
    expect(screen.getByRole('button', { name: 'Wyjaśnienie: GUID' })).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('Card7120 – etykiety nad polami i panele', () => {
  it('etykieta i „?” stoją nad polem, poza jego ramką; placeholder widać od razu', async () => {
    const user = setup()
    await user.click(tab('Zdjęcia fitosocjologiczne'))
    const exposure = document.querySelector<HTMLInputElement>('input[id$="releves-0-exposure"]')!
    expect(exposure.getAttribute('placeholder')).toMatch(/np\. S/)
    const field = exposure.closest('.hf-f')!
    const head = field.querySelector('.hf-f-head')!
    const box = exposure.closest('.hf-box')!
    expect(head).toContainElement(screen.getAllByRole('button', { name: 'Wyjaśnienie: Ekspozycja' })[0])
    expect(box.querySelector('.hf-help-btn')).toBeNull()
    expect(head.compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('w trybie „rozwiń wszystkie” wyjaśnienia kolumn listy gatunków są pod nagłówkami, nie w kolumnie', async () => {
    const user = setup()
    await loadExample(user)
    await user.click(tab('Stan ochrony'))
    await user.click(screen.getByLabelText(/Rozwiń wszystkie wyjaśnienia/))
    const head = document.querySelector('.hf-species-head')!
    expect(head.querySelector('.hf-help')).toBeNull()
    expect(head.nextElementSibling).toHaveClass('hf-col-help')
    expect(head.nextElementSibling).toHaveTextContent(/Wpisz kilka liter nazwy/)
  })

  it('pokrycie gatunku da się skasować do zera i wpisać nowe', async () => {
    const user = setup()
    await loadExample(user)
    await user.click(tab('Stan ochrony'))
    const cover = screen.getAllByLabelText(/^Pokrycie 1 \(%\)/)[0] as HTMLInputElement
    expect(cover.value).not.toBe('')
    await user.clear(cover)
    expect(cover).toHaveValue('')
    await user.type(cover, '12')
    expect(cover).toHaveValue('12')
    await user.clear(cover)
    await user.tab()
    expect(cover).toHaveValue('')
  })

  it('„?” otwiera dymek poza polem; Escape zamyka i wraca na przycisk', async () => {
    const user = setup()
    await user.click(tab('Zdjęcia fitosocjologiczne'))
    const btn = screen.getAllByRole('button', { name: 'Wyjaśnienie: Ekspozycja' })[0]
    const field = btn.closest('.hf-f')!
    await user.click(btn)
    const pop = screen.getByRole('dialog', { name: 'Wyjaśnienie: Ekspozycja' })
    expect(pop).toHaveTextContent(/Kierunek, w którym opada powierzchnia/)
    expect(field.contains(pop)).toBe(false)
    expect(field).not.toHaveClass('hf-help-open')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(btn).toHaveFocus()
  })

  it('tryb „rozwiń wszystkie” pokazuje wyjaśnienia w treści, a pole zajmuje cały wiersz grupy', async () => {
    const user = setup()
    await user.click(screen.getByRole('checkbox', { name: /Rozwiń wszystkie wyjaśnienia/ }))
    await user.click(tab('Zdjęcia fitosocjologiczne'))
    const btn = screen.getAllByRole('button', { name: 'Wyjaśnienie: Ekspozycja' })[0]
    expect(btn.closest('.hf-f')).toHaveClass('hf-help-open')
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('wysokość warstw to cztery pola z jednostkami, w jednej grupie ze zwarciem', async () => {
    const user = setup()
    await user.click(tab('Zdjęcia fitosocjologiczne'))
    const group = screen.getAllByRole('group', { name: 'Zwarcie i wysokość warstw A, B, C, D' })[0]
    const labels = within(group).getAllByRole('textbox').map((el) => (el as HTMLInputElement).labels?.[0]?.textContent)
    expect(labels).toEqual([
      'Zwarcie A (%)', 'Zwarcie B (%)', 'Zwarcie C (%)', 'Zwarcie D (%)',
      'Wysokość A (m)', 'Wysokość B (m)', 'Wysokość C (cm)', 'Wysokość D (cm)',
    ])
  })

  it('pole opisu rośnie z treścią', async () => {
    setup()
    const desc = screen.getByLabelText(/Opis siedliska na stanowisku/, FIELD)
    expect(desc).toHaveAttribute('rows', '10')
  })
})

describe('Card7120 – dokumentacja fotograficzna', () => {
  const png = (name: string) => new File([new Uint8Array([137, 80, 78, 71])], name, { type: 'image/png' })

  it('wgrywa zdjęcia z podpisami „Fot. N.”, odrzuca nie-zdjęcia i przenumerowuje po usunięciu', async () => {
    const user = userEvent.setup({ applyAccept: false })
    render(<Card7120 />)
    await user.click(tab('Inne informacje'))
    const upload = screen.getByLabelText('Dodaj zdjęcia')
    await user.upload(upload, [png('a.png'), png('b.png'), new File(['x'], 'notatki.txt', { type: 'text/plain' })])

    expect(await screen.findByLabelText('Podpis zdjęcia 2')).toHaveValue('Fot. 2. ')
    expect(screen.getByLabelText('Podpis zdjęcia 1')).toHaveValue('Fot. 1. ')
    expect(screen.getByRole('img', { name: 'Fot. 1.' })).toHaveAttribute('src', expect.stringMatching(/^data:image\//))
    expect(screen.getByText(/Pominięto 1 plik/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Usuń fotografię 1' }))
    expect(screen.queryByLabelText('Podpis zdjęcia 2')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Podpis zdjęcia 1')).toHaveValue('Fot. 1. ')
    expect(screen.getByText('b.png')).toBeInTheDocument()
  })

  it('przykład ma zdjęcie bez pliku – można dołączyć plik do istniejącego podpisu', async () => {
    const user = setup()
    await loadExample(user)
    await user.click(tab('Inne informacje'))
    expect(screen.getByLabelText('Podpis zdjęcia 1')).toHaveValue(
      'Fot. 1. Widok ogólny na stanowisko 7120 Reptowo 2 (fot. J. Kowalski)',
    )
    await user.upload(screen.getByLabelText(/dodaj plik do zdjęcia 1/i), png('widok.png'))
    expect(await screen.findByRole('img', { name: /Widok ogólny/ })).toBeInTheDocument()
  })
})

describe('Card7120 – eksport do Worda', () => {
  it('„Pobierz kartę (.docx)” pobiera plik nazwany po stanowisku i dacie', async () => {
    const created = vi.fn((_: Blob) => 'blob:karta')
    const origCreate = URL.createObjectURL
    const origRevoke = URL.revokeObjectURL
    URL.createObjectURL = created as unknown as typeof URL.createObjectURL
    URL.revokeObjectURL = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe('Karta_7120_Reptowo_2_14.07.2025.docx')
    })
    try {
      const user = setup()
      await loadExample(user)
      await user.click(screen.getByRole('button', { name: 'Pobierz kartę (.docx)' }))
      await waitFor(() => expect(click).toHaveBeenCalledTimes(1), { timeout: 5000 })
      expect(created.mock.calls[0][0].size).toBeGreaterThan(5000)
    } finally {
      click.mockRestore()
      URL.createObjectURL = origCreate
      URL.revokeObjectURL = origRevoke
    }
  })
})

describe('Card7120 – zapis i wczytanie z pliku', () => {
  it('„Wczytaj z pliku” jest pierwszym przyciskiem i wczytuje .zip zapisany przez formularz', async () => {
    const { cardToZip } = await import('./components/habitat-form/cardArchive')
    const { methodology7120 } = await import('./habitats/7120/methodology')
    const { examples7120 } = await import('./habitats/7120/examples')
    const user = setup()
    const first = screen.getAllByRole('button')[0]
    expect(first).toHaveTextContent('Wczytaj z pliku')

    const bytes = cardToZip(methodology7120, examples7120[0].values)
    const file = new File([bytes as BlobPart], 'Karta_7120_Reptowo_2_14.07.2025.zip', { type: 'application/zip' })
    const input = document.getElementById('hf-load-file') as HTMLInputElement
    await user.upload(input, file)
    expect(await screen.findByText(/Wczytano kartę z pliku Karta_7120_Reptowo_2_14\.07\.2025\.zip/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Nazwa stanowiska/, FIELD)).toHaveValue('Reptowo 2')
  })

  it('zły plik: komunikat zamiast cichej porażki', async () => {
    const user = setup()
    const input = document.getElementById('hf-load-file') as HTMLInputElement
    await user.upload(input, new File(['{"a":1}'], 'zly.json', { type: 'application/json' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/To nie jest karta 7120/)
  })

  it('pustą kartę da się zapisać jako wersję roboczą', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Zapisz kartę (.zip)' }))
    await user.click(await screen.findByRole('button', { name: /Zapisz mimo braków/ }))
    expect(await screen.findByText(/Karta zapisana do pliku/)).toBeInTheDocument()
  })
})
