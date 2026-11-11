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


it('strona główna: opis, obie karty z kodem i instrukcja instalacji', async () => {
    render(<MemoryRouter><App /></MemoryRouter>)
    expect(screen.getByRole('heading', { level: 1, name: 'FITOS' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /91D0 – Bory i lasy bagienne/ })).toHaveAttribute('href', '/91D0')
    expect(screen.getByRole('link', { name: /7120 – Torfowiska wysokie zdegradowane/ })).toHaveAttribute('href', '/7120')
    expect(screen.getByText('*91D0')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Dodaj FITOS do ekranu głównego' })).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').some((li) => /ekran|instalac|Zainstaluj/i.test(li.textContent ?? ''))).toBe(true)
})

it('przechodzi ze strony głównej do karty 91D0', async () => {
    render(<MemoryRouter><App /></MemoryRouter>)
    await userEvent.click(screen.getByRole('link', { name: /91D0/ }))
    expect(screen.getByRole('heading', { name: 'Karta 91D0' })).toBeInTheDocument()
})
