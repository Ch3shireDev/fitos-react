import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card91E0 } from './Card91E0'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }
const setup = () => {
  const user = userEvent.setup()
  render(<Card91E0 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card91E0', () => {
  it('ma kod priorytetowy, podtyp siedliska i transekt 200×10 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 91E0' })).toBeInTheDocument()
    expect(screen.getByText('*91E0', { selector: 'strong' }).parentElement).toHaveTextContent(/^\*91E0 Łęgi wierzbowe/)
    const subtype = screen.getByLabelText(/Podtyp siedliska/, FIELD)
    expect(within(subtype).getAllByRole('option').map((o) => o.textContent)).toEqual(
      expect.arrayContaining([expect.stringMatching(/^91E0-1 /), expect.stringMatching(/^91E0-8 /)]),
    )
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x10 m')
  })

  it('przykład Tomasówka Górna: oceny jak w karcie z przewodnika', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Tomasówka Górna' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U1')).toBeInTheDocument()
    expect(rowOf('Martwe drewno leżące lub stojące > 3 m długości i > 50 cm grubości')).toHaveClass('hf-cardinal-row')
  })

  it('w górskiej olszynie martwe drewno i wiek są oznaczone jako niewliczane', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Tomasówka Górna' }))
    await user.selectOptions(screen.getByLabelText(/Podtyp siedliska/, FIELD), '91E0-6')
    await user.click(tab('Stan ochrony'))
    const row = rowOf('Martwe drewno leżące lub stojące > 3 m długości i > 50 cm grubości')
    expect(row).not.toHaveClass('hf-cardinal-row')
    expect(within(row).getByText(/nie liczy się do oceny struktury/)).toBeInTheDocument()
    expect(within(rowOf('Wiek drzewostanu')).getByText(/nie liczy się do oceny struktury/)).toBeInTheDocument()
    expect(within(rowOf('Reżim wodny (w tym rytm zalewów, jeśli występują)')).queryByText(/nie liczy się/)).toBeNull()
  })
})
