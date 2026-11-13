import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card91XX } from './Card91XX'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card91XX />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card91XX', () => {
  it('ma kod 91XX bez gwiazdki i transekt 100×40 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 91XX' })).toBeInTheDocument()
    expect(screen.getByText('91XX', { selector: 'strong' }).parentElement).toHaveTextContent(/^91XX Olsy \(Carici elongatae-Alnetum\)/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('100x40 m')
  })

  it('przykład Kozi Rynek: wszystkie parametry FV, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Kozi Rynek' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('FV')).toBeInTheDocument()
  })

  it('dwa wskaźniki kardynalne pogrubione w tabeli, pozostałe nie', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Charakterystyczna kombinacja florystyczna', 'Warunki wodne']) expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Gatunki obce geograficznie w drzewostanie', 'Inwazyjne gatunki obce w podszycie i runie', 'Martwe drewno wielkowymiarowe'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('przykład: spis z transektu liczy martwe drewno, a mikrosiedliska podpowiadają U1 mimo XX eksperta', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Kozi Rynek' }))
    await user.click(tab('Stan ochrony'))
    for (const label of ['Martwe drewno (łączne zasoby)', 'Martwe drewno wielkowymiarowe'])
      await user.click(within(rowOf(label)).getByRole('button', { name: /Pomiary i progi \(wg progów: FV\)/ }))
    expect(within(rowOf('Martwe drewno (łączne zasoby)')).getByText(/Ze spisu: 12 fragm\., 9,78 m³ na 0,4 ha = 24,5 m³\/ha/)).toBeInTheDocument()
    expect(within(rowOf('Martwe drewno wielkowymiarowe')).getByText(/7 szt\. ≥30 cm i ≥3 m na 0,4 ha = 17,5 szt\.\/ha/)).toBeInTheDocument()
    expect(within(rowOf('Mikrosiedliska drzewne (drzewa biocenotyczne)')).getByRole('button', { name: /Przyjmij U1/ })).toBeInTheDocument()
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /91XX – Olsy/ })
    expect(link).toHaveAttribute('href', '/91XX')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 91XX' })).toBeInTheDocument()
  })
})
