import { it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from './App'

it('przechodzi ze strony głównej do karty 7120', async () => {
    render(<MemoryRouter><App /></MemoryRouter>)
    await userEvent.click(screen.getByRole('link', { name: /7120/ }))
    expect(screen.getByRole('heading', { name: 'Karta 7120' })).toBeInTheDocument()
})


it('strona główna: opis, karty z kodem i instrukcja instalacji', async () => {
    render(<MemoryRouter><App /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'FITOS' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /91D0 – Bory i lasy bagienne/ })).toHaveAttribute('href', '/91D0')
    expect(screen.getByRole('link', { name: /7120 – Torfowiska wysokie zdegradowane/ })).toHaveAttribute('href', '/7120')
    expect(screen.getByText('*91D0')).toBeInTheDocument()
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href')).filter((h) => /^\/\w{4}$/.test(h ?? ''))
    expect(hrefs.sort()).toEqual(['/40A0', '/6410', '/6510', '/65XX', '/7120', '/91D0', '/91E0', '/91F0', '/91I0', '/91P0'])
    expect(screen.getByRole('heading', { name: 'Dodaj FITOS do ekranu głównego' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').some((li) => /ekran|instalac|Zainstaluj/i.test(li.textContent ?? ''))).toBe(true)
})

it('przechodzi ze strony głównej do karty 91D0', async () => {
    render(<MemoryRouter><App /></MemoryRouter>)
    await userEvent.click(screen.getByRole('link', { name: /91D0/ }))
    expect(screen.getByRole('heading', { name: 'Karta 91D0' })).toBeInTheDocument()
})

it('przechodzi ze strony głównej do karty 40A0', async () => {
    render(<MemoryRouter><App /></MemoryRouter>)
    const link = screen.getByRole('link', { name: /40A0 – Subkontynentalne zarośla okołopannońskie/ })
    expect(link).toHaveAttribute('href', '/40A0')
    await userEvent.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 40A0' })).toBeInTheDocument()
})

it('przechodzi ze strony głównej do karty 65XX', async () => {
    render(<MemoryRouter><App /></MemoryRouter>)
    const link = screen.getByRole('link', { name: /65XX – Eutroficzne łąki wilgotne/ })
    expect(link).toHaveAttribute('href', '/65XX')
    await userEvent.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 65XX' })).toBeInTheDocument()
})

it('przechodzi ze strony głównej do karty 91E0', async () => {
    render(<MemoryRouter><App /></MemoryRouter>)
    const link = screen.getByRole('link', { name: /91E0 – Łęgi wierzbowe, topolowe, olszowe i jesionowe/ })
    expect(link).toHaveAttribute('href', '/91E0')
    await userEvent.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 91E0' })).toBeInTheDocument()
})

it('przechodzi ze strony głównej do karty 91F0', async () => {
    render(<MemoryRouter><App /></MemoryRouter>)
    const link = screen.getByRole('link', { name: /91F0 – Łęgowe lasy dębowo-wiązowo-jesionowe/ })
    expect(link).toHaveAttribute('href', '/91F0')
    await userEvent.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 91F0' })).toBeInTheDocument()
})

it('przechodzi ze strony głównej do karty 91I0', async () => {
    render(<MemoryRouter><App /></MemoryRouter>)
    const link = screen.getByRole('link', { name: /91I0 – Ciepłolubne dąbrowy/ })
    expect(link).toHaveAttribute('href', '/91I0')
    await userEvent.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 91I0' })).toBeInTheDocument()
})

it('przechodzi ze strony głównej do karty 91P0', async () => {
    render(<MemoryRouter><App /></MemoryRouter>)
    const link = screen.getByRole('link', { name: /91P0 – Jodłowy bór świętokrzyski/ })
    expect(link).toHaveAttribute('href', '/91P0')
    await userEvent.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 91P0' })).toBeInTheDocument()
})

it('przechodzi ze strony głównej do karty 6410', async () => {
    render(<MemoryRouter><App /></MemoryRouter>)
    const link = screen.getByRole('link', { name: /6410 – Zmiennowilgotne łąki trzęślicowe/ })
    expect(link).toHaveAttribute('href', '/6410')
    await userEvent.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 6410' })).toBeInTheDocument()
})

it('przechodzi ze strony głównej do karty 6510', async () => {
    render(<MemoryRouter><App /></MemoryRouter>)
    const link = screen.getByRole('link', { name: /6510 – Ekstensywnie użytkowane niżowe łąki świeże/ })
    expect(link).toHaveAttribute('href', '/6510')
    await userEvent.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 6510' })).toBeInTheDocument()
})
