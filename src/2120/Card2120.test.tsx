import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card2120 } from './Card2120'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card2120 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card2120', () => {
  it('ma kod 2120 bez gwiazdki i transekt 200×10 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 2120' })).toBeInTheDocument()
    expect(screen.getByText('2120', { selector: 'strong' }).parentElement).toHaveTextContent(/^2120 Nadmorskie wydmy białe/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x10 m')
    expect(screen.getByLabelText(/Kondycja traw w ocenie struktury/, FIELD)).toHaveValue('')
  })

  it('przykład Jezioro Wicko: kondycja U1, struktura FV, ogólna FV, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Jezioro Wicko' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('FV')).toBeInTheDocument()
    // późny termin: kondycja traw nie jest pogrubiona jako kardynalna
    expect(rowOf('Kondycja i kwitnięcie/owocowanie gatunków traw')).not.toHaveClass('hf-cardinal-row')
  })

  it('kardynalne pogrubione: nitrofilne, kondycja traw, sedymentacja/abrazja, zniszczenia', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of [
      'Gatunki nitrofilne',
      'Kondycja i kwitnięcie/owocowanie gatunków traw',
      'Występowanie sedymentacji/abrazji',
      'Zniszczenia mechaniczne',
    ])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Gatunki charakterystyczne', 'Występowanie gatunków obcych ekologicznie lub geograficznie'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
    expect(screen.getByText(/wskaźnik pomocniczy – nie liczy się do oceny struktury/)).toBeInTheDocument()
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /2120 – Nadmorskie wydmy białe/ })
    expect(link).toHaveAttribute('href', '/2120')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 2120' })).toBeInTheDocument()
  })
})
