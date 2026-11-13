import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card1210 } from './Card1210'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card1210 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card1210', () => {
  it('ma kod 1210 bez gwiazdki i transekt 400×20 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 1210' })).toBeInTheDocument()
    expect(screen.getByText('1210', { selector: 'strong' }).parentElement).toHaveTextContent(/^1210 Kidzina na brzegu morskim/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('400x20 m')
  })

  it('przykład Orzechowo: struktura U1, ogólna U2, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Orzechowo' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('U2')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U2')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: gatunki charakterystyczne, zniszczenia, zaśmiecenie', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki charakterystyczne', 'Zniszczenia mechaniczne', 'Zaśmiecenie']) expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Naturalna działalność fal i sztormów', 'Procent powierzchni zajęty przez siedlisko na transekcie'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /1210 – Kidzina na brzegu morskim/ })
    expect(link).toHaveAttribute('href', '/1210')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 1210' })).toBeInTheDocument()
  })
})
