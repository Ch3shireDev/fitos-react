import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card65XX } from './Card65XX'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card65XX />)
  return user
}
type User = ReturnType<typeof setup>
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const loadExample = (user: User) => user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Wołosate' }))
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card65XX', () => {
  it('ma kod bez gwiazdki, transekt 200×10 m i trzy zdjęcia 5×5 m', async () => {
    const user = setup()
    expect(screen.getByRole('heading', { name: 'Karta 65XX' })).toBeInTheDocument()
    expect(screen.getByText('65XX', { selector: 'strong' }).parentElement).toHaveTextContent(/^65XX Eutroficzne łąki wilgotne/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x10 m')
    await user.click(tab('Zdjęcia fitosocjologiczne'))
    expect(screen.getAllByLabelText(/Powierzchnia zdjęcia/, FIELD).map((e) => (e as HTMLInputElement).value)).toEqual(['25', '25', '25'])
  })

  it('przykład Wołosate: oceny jak w karcie, wykonawca zanonimizowany', async () => {
    const user = setup()
    await loadExample(user)
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('FV')).toBeInTheDocument()
  })

  it('kardynalne: gatunki charakterystyczne, ekspansywne i ekspansja krzewów', async () => {
    const user = setup()
    await loadExample(user)
    await user.click(tab('Stan ochrony'))
    for (const l of ['Gatunki charakterystyczne', 'Gatunki ekspansywne roślin zielnych', 'Ekspansja krzewów i podrostu drzew'])
      expect(rowOf(l)).toHaveClass('hf-cardinal-row')
    expect(rowOf('Gatunki dominujące')).not.toHaveClass('hf-cardinal-row')
    expect(within(rowOf('Gatunki charakterystyczne')).getByText(/Gatunków charakterystycznych: 7/)).toBeInTheDocument()
  })
})
