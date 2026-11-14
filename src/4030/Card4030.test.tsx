import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card4030 } from './Card4030'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card4030 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card4030', () => {
  it('ma kod 4030 bez gwiazdki i transekt 200×10 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 4030' })).toBeInTheDocument()
    expect(screen.getByText('4030', { selector: 'strong' }).parentElement).toHaveTextContent(/^4030 Suche wrzosowiska \(Calluno-Genistion/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x10 m')
    expect(screen.getByLabelText(/Typ wrzosowiska/, FIELD)).toBeInTheDocument()
  })

  it('przykład Duchny Młode I: powierzchnia U1, struktura FV, ogólna U1, koordynator zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Duchny Młode I' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U1')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: pokrycie wrzosu, zarośnięcie przez drzewa, gatunki obce', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of [
      'Pokrycie wrzosu zwyczajnego Calluna vulgaris (ewentualnie łączne wrzosu i mącznicy lekarskiej Arctostaphylos uva-ursi)',
      'Zarośnięcie przez drzewa',
      'Gatunki obce geograficznie',
    ])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Pokrycie traw', 'Ekspansywne gatunki rodzime (apofity)', 'Struktura populacji kluczowych gatunków', 'Inne zniekształcenia'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /4030 – Suche wrzosowiska/ })
    expect(link).toHaveAttribute('href', '/4030')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 4030' })).toBeInTheDocument()
  })
})
