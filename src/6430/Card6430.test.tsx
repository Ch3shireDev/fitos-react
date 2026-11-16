import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card6430 } from './Card6430'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card6430 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card6430', () => {
  it('ma kod 6430 bez gwiazdki i wybór podtypu', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 6430' })).toBeInTheDocument()
    expect(screen.getByText('6430', { selector: 'strong' }).parentElement).toHaveTextContent(/^6430 Ziołorośla górskie \(Adenostylion alliariae\)/)
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('')
  })

  it('przykład Między Kościółkami a przełęczą Brona: wszystko FV jak w karcie, koordynator zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Między Kościółkami a przełęczą Brona' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('6430-1')
    await user.click(tab('Stan ochrony'))
    for (const id of ['grade-param-area', 'grade-param-structure', 'grade-overall']) expect(within(screen.getByTestId(id)).getByText('FV')).toBeInTheDocument()
    expect(screen.queryByText(/odbiega od progów/)).not.toBeInTheDocument()
  })

  it('kardynalne pogrubione: tylko gatunki charakterystyczne', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    expect(rowOf('Gatunki charakterystyczne')).toHaveClass('hf-cardinal-row')
    for (const label of [
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Bogactwo gatunkowe',
      'Obce gatunki inwazyjne',
      'Naturalność koryta rzecznego (brak regulacji)',
      'Naturalny kompleks siedlisk',
    ])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /6430 – Ziołorośla górskie i ziołorośla nadrzeczne/ })
    expect(link).toHaveAttribute('href', '/6430')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 6430' })).toBeInTheDocument()
  })
})
