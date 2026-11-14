import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card3140 } from './Card3140'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card3140 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card3140', () => {
  it('ma kod 3140, typ i głębokość jeziora w stanowisku', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 3140' })).toBeInTheDocument()
    expect(screen.getByText('3140', { selector: 'strong' }).parentElement).toHaveTextContent(/^3140 Twardowodne oligo- i mezotroficzne zbiorniki/)
    expect(screen.getByLabelText(/Typ jeziora/, FIELD)).toBeInTheDocument()
    expect(screen.getByLabelText(/Głębokość maksymalna jeziora/, FIELD)).toBeInTheDocument()
  })

  it('przykład Budzisławskie 1: powierzchnia U1, struktura FV, perspektywy FV, ogólna U1; wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Budzisławskie 1' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    expect(screen.getByLabelText(/Typ jeziora/, FIELD)).toHaveValue('deep')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U1')).toBeInTheDocument()
  })

  it('pięć wskaźników kardynalnych pogrubionych, pomocnicze nie', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Struktura roślinności ramienicowej', 'Gatunki charakterystyczne', 'Maksymalna głębokość występowania łąk ramienicowych', 'Zasięg strefy świetlnej w jeziorze'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Odczyn wody', 'Plankton: fitoplankton', 'Plankton: zooplankton']) expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /3140 – Twardowodne jeziora z podwodnymi łąkami ramienic/ })
    expect(link).toHaveAttribute('href', '/3140')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 3140' })).toBeInTheDocument()
  })
})
