import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card2110 } from './Card2110'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card2110 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card2110', () => {
  it('ma kod 2110 bez gwiazdki i transekt 200×10 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 2110' })).toBeInTheDocument()
    expect(screen.getByText('2110', { selector: 'strong' }).parentElement).toHaveTextContent(/^2110 Inicjalne stadia nadmorskich wydm białych/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x10 m')
  })

  it('przykład Świnoujście: struktura FV, ogólna FV, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Świnoujście' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('FV')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: kondycja traw i sedymentacja/abrazja', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Kondycja i forma wzrostu wydmotwórczych gatunków traw', 'Występowanie sedymentacji/abrazji'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Gatunki charakterystyczne', 'Zniszczenia mechaniczne', 'Występowanie gatunków obcych ekologicznie lub geograficznie'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /2110 – Inicjalne stadia nadmorskich wydm białych/ })
    expect(link).toHaveAttribute('href', '/2110')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 2110' })).toBeInTheDocument()
  })
})
