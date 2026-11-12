import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card91I0 } from './Card91I0'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card91I0 />)
  return user
}
type User = ReturnType<typeof setup>
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const loadExample = (user: User) => user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Zimna Woda 1' }))
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card91I0', () => {
  it('ma kod priorytetowy, podtyp siedliska i transekt 200×20 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 91I0' })).toBeInTheDocument()
    expect(screen.getByText('*91I0', { selector: 'strong' }).parentElement).toHaveTextContent(/^\*91I0 Ciepłolubne dąbrowy/)
    const subtype = screen.getByLabelText(/Podtyp siedliska/, FIELD)
    expect(within(subtype).getAllByRole('option').map((o) => o.textContent)).toEqual(
      expect.arrayContaining([expect.stringMatching(/^91I0-1 Dąbrowa świetlista/), expect.stringMatching(/^91I0-3/)]),
    )
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x20 m')
  })

  it('przykład Zimna Woda 1: oceny wg reguł tab. 2, wykonawca zanonimizowany', async () => {
    const user = setup()
    await loadExample(user)
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    // kardynalne „obce gatunki inwazyjne” na U1 -> struktura U1 (karta w przewodniku ma tu niespójne FV)
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U1')).toBeInTheDocument()
    for (const label of ['Gatunki charakterystyczne', 'Gatunki ciepłolubne', 'Zwarcie podszytu', 'Zwarcie koron drzew'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
  })

  it('gatunki ciepłolubne liczą też charakterystyczne z drugiego wskaźnika', async () => {
    const user = setup()
    await loadExample(user)
    await user.click(tab('Stan ochrony'))
    expect(within(rowOf('Gatunki ciepłolubne')).getByText(/łącznie 41,5%/)).toBeInTheDocument()
  })
})
