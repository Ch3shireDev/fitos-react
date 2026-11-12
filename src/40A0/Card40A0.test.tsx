import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card40A0 } from './Card40A0'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card40A0 />)
  return user
}
type User = ReturnType<typeof setup>
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const loadExample = (user: User) => user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Garb Pińczowski' }))
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card40A0', () => {
  it('ma kod i nazwę siedliska oraz wybór wariantu wisienka / irga', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 40A0' })).toBeInTheDocument()
    expect(screen.getByText('40A0', { selector: 'strong' }).parentElement).toHaveTextContent(/^40A0 Subkontynentalne zarośla okołopannońskie/)
    const variant = screen.getByLabelText(/Wariant siedliska/, FIELD)
    expect(within(variant).getAllByRole('option').map((o) => o.textContent)).toEqual(
      expect.arrayContaining([expect.stringMatching(/^Zarośla wisienki stepowej/), expect.stringMatching(/^Naskalne zarośla irgi/)]),
    )
  })

  it('przykład Garb Pińczowski: oceny jak w karcie, wykonawca zanonimizowany', async () => {
    const user = setup()
    await loadExample(user)
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    expect(screen.getByLabelText(/Nazwa stanowiska/, FIELD)).toHaveValue('Garb Pińczowski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('FV')).toBeInTheDocument()
  })

  it('wysokość wisienki przestaje być kardynalna w zaroślach irgi', async () => {
    const user = setup()
    await loadExample(user)
    await user.click(tab('Stan ochrony'))
    expect(rowOf('Wysokość krzewów wisienki (tylko dla zarośli wisienki stepowej)')).toHaveClass('hf-cardinal-row')
    expect(rowOf('Stan populacji gatunków charakterystycznych')).toHaveClass('hf-cardinal-row')

    await user.click(tab('Stanowisko'))
    await user.selectOptions(screen.getByLabelText(/Wariant siedliska/, FIELD), 'cotoneaster')
    await user.click(tab('Stan ochrony'))
    expect(rowOf('Wysokość krzewów wisienki (tylko dla zarośli wisienki stepowej)')).not.toHaveClass('hf-cardinal-row')
    expect(rowOf('Udział wisienki stepowej lub irgi zwyczajnej w warstwie krzewów')).toHaveClass('hf-cardinal-row')
  })

  it('gatunki charakterystyczne liczą się w dwóch klasach', async () => {
    const user = setup()
    await loadExample(user)
    await user.click(tab('Stan ochrony'))
    expect(within(rowOf('Gatunki charakterystyczne')).getByText(/Krzewy \(Rhamno-Prunetea\): 6; murawy \(Festuco-Brometea\): 8/)).toBeInTheDocument()
  })
})
