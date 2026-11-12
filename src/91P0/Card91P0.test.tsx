import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card91P0 } from './Card91P0'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card91P0 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card91P0', () => {
  it('ma kod 91P0 bez gwiazdki i transekt 200×10 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 91P0' })).toBeInTheDocument()
    expect(screen.getByText('91P0', { selector: 'strong' }).parentElement).toHaveTextContent(/^91P0 Jodłowy bór świętokrzyski/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x10 m')
  })

  it('przykład Stary Lipowiec: oceny jak w karcie z przewodnika, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Stary Lipowiec' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U2')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U2')).toBeInTheDocument()
  })

  it('cztery wskaźniki kardynalne pogrubione w tabeli', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of [
      'Charakterystyczna kombinacja florystyczna',
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Obecność martwego drewna',
      'Naturalne odnowienia jodły',
    ])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    expect(rowOf('Naturalne odnowienia buka')).not.toHaveClass('hf-cardinal-row')
    expect(rowOf('Obce gatunki inwazyjne')).not.toHaveClass('hf-cardinal-row')
  })

  it('odnowienie buka: brak to FV (waloryzacja 2021), mimo U2 w karcie z 2008 r.', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Stary Lipowiec' }))
    await user.click(tab('Stan ochrony'))
    expect(within(rowOf('Naturalne odnowienia buka')).getByRole('button', { name: /Przyjmij FV/ })).toBeInTheDocument()
  })
})
