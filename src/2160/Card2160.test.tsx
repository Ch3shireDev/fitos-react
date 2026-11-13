import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card2160 } from './Card2160'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card2160 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card2160', () => {
  it('ma kod 2160 bez gwiazdki i stanowisko punktowe', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 2160' })).toBeInTheDocument()
    expect(screen.getByText('2160', { selector: 'strong' }).parentElement).toHaveTextContent(/^2160 Nadmorskie wydmy z zaroślami rokitnika/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('Stanowisko punktowe – obserwacja całego płatu zarośli')
  })

  it('przykład „Mewia Łacha” 1: powierzchnia U1, struktura U1, ogólna U1, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: „Mewia Łacha” 1' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U1')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: gatunki ekspansywne, powierzchnia kępy, stan zdrowotny', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki ekspansywne drzew i krzewów', 'Powierzchnia kępy', 'Stan zdrowotny krzewów rokitnika'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Charakterystyczna kombinacja gatunków', 'Wysokość krzewów (średnia)', 'Odnowienie naturalne rokitnika', 'Ekspansywne gatunki obce w podszyciu i runie'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /2160 – Nadmorskie wydmy z zaroślami rokitnika/ })
    expect(link).toHaveAttribute('href', '/2160')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 2160' })).toBeInTheDocument()
  })
})
