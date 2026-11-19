import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card7210 } from './Card7210'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card7210 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card7210', () => {
  it('ma kod 7210 bez gwiazdki i wybór zespołu', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 7210' })).toBeInTheDocument()
    expect(screen.getByText('7210', { selector: 'strong' }).parentElement).toHaveTextContent(/^7210 Torfowiska nakredowe/)
    expect(screen.getByLabelText(/Zespół na transekcie/, FIELD)).toHaveValue('')
  })

  it('przykład Rezerwat Bagno Serebryskie 2: XX, U1, U1 → U1 jak w karcie, koordynator zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Rezerwat Bagno Serebryskie 2' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    expect(screen.getByLabelText(/Zespół na transekcie/, FIELD)).toHaveValue('cladietum')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('XX')).toBeInTheDocument()
    for (const id of ['grade-param-structure', 'grade-overall']) expect(within(screen.getByTestId(id)).getByText('U1')).toBeInTheDocument()
    expect(screen.queryByText(/odbiega od progów/)).not.toBeInTheDocument()
  })

  it('kardynalne pogrubione: charakterystyczne, ekspansywne, zwarcie, krzewy, uwodnienie', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki charakterystyczne', 'Rodzime gatunki ekspansywne roślin zielnych', 'Zwarcie szuwarów', 'Ekspansja krzewów i podrostu drzew', 'Stopień uwodnienia'])
      expect(rowOf(label), label).toHaveClass('hf-cardinal-row')
    for (const label of ['Udział procentowy siedliska na transekcie', 'Gatunki dominujące', 'Obce gatunki inwazyjne', 'Gatunki synantropijne', 'Zanieczyszczenie pestycydami lub przenawożenie', 'Mechaniczne zniszczenie'])
      expect(rowOf(label), label).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /7210 – Torfowiska nakredowe/ })
    expect(link).toHaveAttribute('href', '/7210')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 7210' })).toBeInTheDocument()
  })
})
