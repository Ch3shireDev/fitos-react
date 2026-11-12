import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card91F0 } from './Card91F0'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card91F0 />)
  return user
}
type User = ReturnType<typeof setup>
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const loadExample = (user: User) => user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Bukowy Las Górki 2' }))
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card91F0', () => {
  it('ma kod priorytetowy, postać łęgu i transekt 200×10 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 91F0' })).toBeInTheDocument()
    expect(screen.getByText('*91F0', { selector: 'strong' }).parentElement).toHaveTextContent(/^\*91F0 Łęgowe lasy dębowo-wiązowo-jesionowe/)
    const form = screen.getByLabelText(/Postać łęgu/, FIELD)
    expect(within(form).getAllByRole('option').map((o) => o.textContent)).toEqual(
      expect.arrayContaining([expect.stringMatching(/^Łęg w dolinie/), expect.stringMatching(/^Łęg poza dolinami/)]),
    )
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x10 m')
  })

  it('przykład z przewodnika: oceny jak w karcie, wykonawca zanonimizowany', async () => {
    const user = setup()
    await loadExample(user)
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U2')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U2')).toBeInTheDocument()
  })

  it('stosunki wodne przestają być kardynalne w postaci nietypowej', async () => {
    const user = setup()
    await loadExample(user)
    await user.click(tab('Stan ochrony'))
    expect(rowOf('Stosunki wodno-wilgotnościowe')).toHaveClass('hf-cardinal-row')
    expect(rowOf('Gatunki obce geograficznie w drzewostanie')).toHaveClass('hf-cardinal-row')

    await user.click(tab('Stanowisko'))
    await user.selectOptions(screen.getByLabelText(/Postać łęgu/, FIELD), 'atypical')
    await user.click(tab('Stan ochrony'))
    expect(rowOf('Stosunki wodno-wilgotnościowe')).not.toHaveClass('hf-cardinal-row')
  })
})
