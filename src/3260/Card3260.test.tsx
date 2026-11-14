import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card3260 } from './Card3260'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card3260 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card3260', () => {
  it('ma kod 3260, nazwę rzeki i wymiary transektu', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 3260' })).toBeInTheDocument()
    expect(screen.getByText('3260', { selector: 'strong' }).parentElement).toHaveTextContent(/^3260 Nizinne i podgórskie rzeki ze zbiorowiskami włosieniczników/)
    expect(screen.getByLabelText(/Nazwa rzeki/, FIELD)).toBeInTheDocument()
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toBeInTheDocument()
  })

  it('przykład Sławno: powierzchnia FV, struktura U1, ogólna U2; wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Kanał Miejski – Sławno' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    expect(screen.getByLabelText(/Nazwa rzeki/, FIELD)).toHaveValue('Kanał Miejski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U2')).toBeInTheDocument()
  })

  it('9 kardynalnych pogrubionych, 4 pomocnicze nie', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki charakterystyczne – włosieniczniki', 'Materiał dna koryta', 'Przepływy', 'Wskaźnik przekształcenia siedliska (HMS)'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Naturalne elementy morfologiczne', 'Zacienienie rzeki', 'Gatunki inwazyjne', 'Ścieki']) expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /3260 – Nizinne i podgórskie rzeki/ })
    expect(link).toHaveAttribute('href', '/3260')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 3260' })).toBeInTheDocument()
  })
})
