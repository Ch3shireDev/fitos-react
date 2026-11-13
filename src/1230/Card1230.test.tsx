import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card1230 } from './Card1230'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card1230 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card1230', () => {
  it('ma kod 1230, pola klifu i zakładkę profilu', async () => {
    const user = setup()
    expect(screen.getByRole('heading', { name: 'Karta 1230' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Budowa geologiczna klifu/, FIELD)).toBeInTheDocument()
    expect(screen.getByLabelText(/Kilometraż brzegu/, FIELD)).toBeInTheDocument()
    await user.click(tab(/Profil klifu/))
    expect(screen.getByLabelText(/Azymut profilu/, FIELD)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Dodaj gatunek/ })).toBeInTheDocument()
  })

  it('przykład Rozewie 1: powierzchnia FV, struktura U2, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Rozewie 1' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U2')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U2')).toBeInTheDocument()
  })

  it('wskaźniki geodynamiczne i plażowe pogrubione jako kardynalne', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Stabilność ściany klifu', 'Szerokość plaży', 'Zasięg napływu morza na plażę']) expect(rowOf(label)).toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /1230 – Klify na wybrzeżu Bałtyku/ })
    expect(link).toHaveAttribute('href', '/1230')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 1230' })).toBeInTheDocument()
  })
})
