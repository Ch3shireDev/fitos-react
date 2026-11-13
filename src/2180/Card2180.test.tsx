import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card2180 } from './Card2180'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card2180 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!
const loadExample = (user: ReturnType<typeof userEvent.setup>) =>
  user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Białogóra' }))

describe('Card2180', () => {
  it('ma kod 2180 bez gwiazdki, transekt 200×10 m i wybór zbiorowiska', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 2180' })).toBeInTheDocument()
    expect(screen.getByText('2180', { selector: 'strong' }).parentElement).toHaveTextContent(
      /^2180 Lasy mieszane i bory na wydmach nadmorskich/,
    )
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x10 m')
    const variant = screen.getByLabelText(/Zbiorowisko \(wariant siedliska\)/, FIELD)
    expect(
      within(variant)
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual(
      expect.arrayContaining([expect.stringMatching(/^Empetro nigri-Pinetum/), expect.stringMatching(/^Betulo pendulae-Quercetum/)]),
    )
  })

  it('przykład Białogóra: parametry FV jak w karcie, wykonawca zanonimizowany', async () => {
    const user = setup()
    await loadExample(user)
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('FV')).toBeInTheDocument()
    expect(within(rowOf('Martwe drewno (łączne zasoby)')).getByDisplayValue('Poniżej 5 m3/ha, ale występuje')).toBeInTheDocument()
  })

  it('dwa wskaźniki kardynalne pogrubione, obce ekologicznie oznaczone jako pomijane', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki charakterystyczne', 'Gatunki obce geograficznie w drzewostanie i podroście'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Martwe drewno (łączne zasoby)', 'Struktura wiekowa', 'Gatunki dominujące w poszczególnych warstwach fitocenozy'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
    expect(within(rowOf('Gatunki obce ekologicznie w drzewostanie')).getByText(/nie oceniany od 2018 r\./)).toBeInTheDocument()
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /2180 – Lasy mieszane i bory na wydmach nadmorskich/ })
    expect(link).toHaveAttribute('href', '/2180')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 2180' })).toBeInTheDocument()
  })
})
