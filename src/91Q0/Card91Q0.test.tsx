import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card91Q0 } from './Card91Q0'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card91Q0 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card91Q0', () => {
  it('ma kod 91Q0 bez gwiazdki, podtyp i transekt 200×10 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 91Q0' })).toBeInTheDocument()
    expect(screen.getByText('91Q0', { selector: 'strong' }).parentElement).toHaveTextContent(/^91Q0 Górskie reliktowe laski sosnowe/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x10 m')
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toBeInTheDocument()
  })

  it('przykład Macelowa Góra: wszystkie parametry FV, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Macelowa Góra' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('91Q0-1')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('FV')).toBeInTheDocument()
  })

  it('cztery wskaźniki kardynalne pogrubione w tabeli', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki charakterystyczne', 'Rodzime gatunki ekspansywne roślin zielnych', 'Struktura drzewostanu', 'Gatunki obce w drzewostanie'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Obce gatunki inwazyjne', 'Naturalne odnowienie drzewostanu', 'Gatunki ciepłolubne w runie', 'Zniszczenia mechaniczne'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('odnowienie w przykładzie: świerk w podroście daje podpowiedź U1 mimo FV eksperta', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Macelowa Góra' }))
    await user.click(tab('Stan ochrony'))
    expect(within(rowOf('Naturalne odnowienie drzewostanu')).getByRole('button', { name: /Przyjmij U1/ })).toBeInTheDocument()
  })
})
