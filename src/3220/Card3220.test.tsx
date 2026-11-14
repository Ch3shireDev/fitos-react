import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card3220 } from './Card3220'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card3220 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card3220', () => {
  it('ma kod 3220 bez gwiazdki i transekt 200×10 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 3220' })).toBeInTheDocument()
    expect(screen.getByText('3220', { selector: 'strong' }).parentElement).toHaveTextContent(/^3220 Pionierska roślinność na kamieńcach górskich potoków/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x10 m')
  })

  it('przykład Siwa Woda: powierzchnia FV, struktura U1 (kompleks kardynalny U1), ogólna U1, ekspert zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Siwa Woda' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U1')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: ekspansywne, obce, zwarcie krzewów, kompleks siedlisk', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki ekspansywnych roślin zielnych', 'Obce gatunki inwazyjne', 'Zwarcie krzewów na transekcie', 'Obecność kompleksu siedlisk nadrzecznych: 3220, 3230, 3240, 91E0'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Szerokość kamieńców', 'Pokrycie kamieńców przez roślinność zielną', 'Wysokość warstwy zielnej', 'Gatunki krzewów', 'Udział gatunków drzewiastych (powyżej 1,5 m wys.)'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /3220 – Pionierska roślinność na kamieńcach górskich potoków/ })
    expect(link).toHaveAttribute('href', '/3220')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 3220' })).toBeInTheDocument()
  })
})
