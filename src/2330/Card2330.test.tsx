import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card2330 } from './Card2330'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card2330 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card2330', () => {
  it('ma kod 2330 bez gwiazdki i transekt 200×10 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 2330' })).toBeInTheDocument()
    expect(screen.getByText('2330', { selector: 'strong' }).parentElement).toHaveTextContent(/^2330 Wydmy śródlądowe z murawami napiaskowymi/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x10 m')
  })

  it('przykład Chechło 2: powierzchnia FV, struktura U1, ogólna U1, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Chechło 2' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U1')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: gatunki charakterystyczne, krzewy, procesy eoliczne', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki charakterystyczne', 'Ekspansja krzewów i podrostu drzew', 'Występowanie procesów eolicznych'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Gatunki ekspansywne', 'Obce gatunki inwazyjne', 'Procent powierzchni zajęty przez siedlisko na transekcie', 'Gatunki charakterystyczne murawy kserotermicznej/wrzosowiska'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /2330 – Wydmy śródlądowe z murawami napiaskowymi/ })
    expect(link).toHaveAttribute('href', '/2330')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 2330' })).toBeInTheDocument()
  })
})
