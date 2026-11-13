import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card2190 } from './Card2190'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card2190 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card2190', () => {
  it('ma kod 2190 bez gwiazdki, transekt 10×200 m i wybór podtypu', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 2190' })).toBeInTheDocument()
    expect(screen.getByText('2190', { selector: 'strong' }).parentElement).toHaveTextContent(/^2190 Wilgotne zagłębienia międzywydmowe/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('10x200 m')
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toBeInTheDocument()
  })

  it('przykład Madwiny 1: struktura FV, ogólna FV, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Madwiny 1' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('1')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('FV')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: gatunki charakterystyczne, krzewy i krzewinki, dobrze zachowane płaty', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki charakterystyczne i wyróżniające', 'Obecność krzewów i krzewinek', 'Udział dobrze zachowanych płatów siedliska'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Gatunki dominujące', 'Gatunki ekspansywne', 'Obecność nalotu i podrostu drzew', 'Występowanie procesów eolicznych'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /2190 – Wilgotne zagłębienia międzywydmowe/ })
    expect(link).toHaveAttribute('href', '/2190')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 2190' })).toBeInTheDocument()
  })
})
