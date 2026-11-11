import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card91D0 } from './Card91D0'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card91D0 />)
  return user
}
type User = ReturnType<typeof setup>
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const loadExample = (user: User, name = 'Reptowo XI') =>
  user.click(screen.getByRole('button', { name: `Wczytaj przykład: ${name}` }))
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card91D0', () => {
  it('ma kod priorytetowy, wariant siedliska i transekt 200×10 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 91D0' })).toBeInTheDocument()
    expect(screen.getByText('*91D0', { selector: 'strong' }).parentElement).toHaveTextContent(/^\*91D0 Bory i lasy bagienne/)
    const variant = screen.getByLabelText(/Wariant siedliska/, FIELD)
    expect(within(variant).getAllByRole('option').map((o) => o.textContent)).toEqual(
      expect.arrayContaining([expect.stringMatching(/^Bór bagienny/), expect.stringMatching(/^Świerczyna bagienna/)]),
    )
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x10 m')
  })

  it('przykład Reptowo XI: oceny jak w karcie, wykonawca zanonimizowany', async () => {
    const user = setup()
    await loadExample(user)
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U2')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U2')).toBeInTheDocument()
  })

  it('torfowce są kardynalne tylko w borze bagiennym', async () => {
    const user = setup()
    await loadExample(user)
    await user.click(tab('Stan ochrony'))
    expect(rowOf('Występowanie mchów torfowców')).toHaveClass('hf-cardinal-row')
    expect(rowOf('Uwodnienie')).toHaveClass('hf-cardinal-row')

    await user.click(tab('Stanowisko'))
    await user.selectOptions(screen.getByLabelText(/Wariant siedliska/, FIELD), 'birchBog')
    await user.click(tab('Stan ochrony'))
    expect(rowOf('Występowanie mchów torfowców')).not.toHaveClass('hf-cardinal-row')
    expect(rowOf('Gatunki charakterystyczne')).toHaveClass('hf-cardinal-row')
  })

  it('lista gatunków charakterystycznych liczy się wg wariantu', async () => {
    const user = setup()
    await loadExample(user)
    await user.click(tab('Stan ochrony'))
    expect(within(rowOf('Gatunki charakterystyczne')).getByText(/Obecne 3 z 6 pozycji listy \(50%\)/)).toBeInTheDocument()
  })
})
