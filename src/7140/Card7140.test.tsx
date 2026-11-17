import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card7140 } from './Card7140'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card7140 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card7140', () => {
  it('ma kod 7140 bez gwiazdki i wybór podtypu', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 7140' })).toBeInTheDocument()
    expect(screen.getByText('7140', { selector: 'strong' }).parentElement).toHaveTextContent(/^7140 Torfowiska przejściowe i trzęsawiska/)
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('')
  })

  it('przykład Chyżne Borcok: wszystko FV jak w karcie, koordynator zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Chyżne Borcok' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('7140-2')
    await user.click(tab('Stan ochrony'))
    for (const id of ['grade-param-area', 'grade-param-structure', 'grade-overall']) expect(within(screen.getByTestId(id)).getByText('FV')).toBeInTheDocument()
    expect(screen.queryByText(/odbiega od progów/)).not.toBeInTheDocument()
  })

  it('kardynalne pogrubione: charakterystyczne, mchy, obce, ekspansywne, uwodnienie', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki charakterystyczne', 'Pokrycie i struktura gatunkowa mchów', 'Obce gatunki inwazyjne', 'Gatunki ekspansywne roślin zielnych', 'Stopień uwodnienia'])
      expect(rowOf(label), label).toHaveClass('hf-cardinal-row')
    for (const label of ['Procent powierzchni zajęty przez siedlisko na transekcie', 'Gatunki dominujące', 'Obecność krzewów i podrostu drzew', 'Pozyskanie torfu', 'Melioracje odwadniające'])
      expect(rowOf(label), label).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /7140 – Torfowiska przejściowe i trzęsawiska/ })
    expect(link).toHaveAttribute('href', '/7140')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 7140' })).toBeInTheDocument()
  })
})
