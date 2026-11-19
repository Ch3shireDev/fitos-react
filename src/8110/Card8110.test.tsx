import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card8110 } from './Card8110'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card8110 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card8110', () => {
  it('ma kod 8110 bez gwiazdki, wybór podtypu i pasma', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 8110' })).toBeInTheDocument()
    expect(screen.getByText('8110', { selector: 'strong' }).parentElement).toHaveTextContent(/^8110 Piargi i gołoborza krzemianowe/)
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('')
    expect(screen.getByLabelText(/Pasmo górskie/, FIELD)).toHaveValue('')
  })

  it('przykład Dolina Pańszczyca 4: wszystko FV jak w karcie, eksperci zanonimizowani', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Dolina Pańszczyca 4' }))
    expect(screen.getByLabelText(/Ekspert lokalny/, FIELD)).toHaveValue('Jan Kowalski')
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('8110-1')
    expect(screen.getByLabelText(/Pasmo górskie/, FIELD)).toHaveValue('Tatry')
    await user.click(tab('Stan ochrony'))
    for (const id of ['grade-param-area', 'grade-param-structure', 'grade-overall']) expect(within(screen.getByTestId(id)).getByText('FV')).toBeInTheDocument()
    expect(screen.queryByText(/odbiega od progów/)).not.toBeInTheDocument()
  })

  it('kardynalne pogrubione: gatunki typowe, wysokogórskie, obce', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki typowe', 'Gatunki wysokogórskie', 'Obce gatunki inwazyjne']) expect(rowOf(label), label).toHaveClass('hf-cardinal-row')
    for (const label of [
      'Dominująca frakcja rumoszu',
      'Dominujące rodzaje zbiorowisk',
      'Pokrycie przez drzewa i krzewy',
      'Pokrycie roślin zielnych',
      'Procent powierzchni siedliska na transekcie',
      'Ślady antropopresji',
    ])
      expect(rowOf(label), label).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /8110 – Piargi i gołoborza krzemianowe/ })
    expect(link).toHaveAttribute('href', '/8110')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 8110' })).toBeInTheDocument()
  })
})
