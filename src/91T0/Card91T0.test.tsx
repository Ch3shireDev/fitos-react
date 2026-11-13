import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card91T0 } from './Card91T0'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card91T0 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card91T0', () => {
  it('ma kod 91T0 bez gwiazdki i transekt 200×10 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 91T0' })).toBeInTheDocument()
    expect(screen.getByText('91T0', { selector: 'strong' }).parentElement).toHaveTextContent(/^91T0 Śródlądowy bór chrobotkowy/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x10 m')
  })

  it('przykład Bór Chrobotkowy: wszystkie parametry FV, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Bór Chrobotkowy' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('FV')).toBeInTheDocument()
  })

  it('cztery wskaźniki kardynalne pogrubione w tabeli, wiek drzewostanu nie', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of [
      'Charakterystyczna kombinacja florystyczna',
      'Występowanie i stan populacji chrobotków',
      'Stosunek pokrycia chrobotków do mchów i roślin naczyniowych',
      'Obecność drewna martwego w dnie lasu',
    ])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Wiek drzewostanu', 'Udział procentowy siedliska na transekcie', 'Naturalne odnowienie drzewostanu'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('stosunek pokrycia w przykładzie: 80/20 daje podpowiedź U1 mimo FV eksperta', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Bór Chrobotkowy' }))
    await user.click(tab('Stan ochrony'))
    expect(within(rowOf('Stosunek pokrycia chrobotków do mchów i roślin naczyniowych')).getByRole('button', { name: /Przyjmij U1/ })).toBeInTheDocument()
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /91T0 – Śródlądowy bór chrobotkowy/ })
    expect(link).toHaveAttribute('href', '/91T0')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 91T0' })).toBeInTheDocument()
  })
})
