import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card3230 } from './Card3230'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card3230 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card3230', () => {
  it('ma kod 3230 bez gwiazdki i transekt 200×10 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 3230' })).toBeInTheDocument()
    expect(screen.getByText('3230', { selector: 'strong' }).parentElement).toHaveTextContent(/^3230 Zarośla wrześni na kamieńcach i żwirowiskach górskich potoków/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x10 m')
    expect(screen.getByLabelText(/Rzeka \/ potok/, FIELD)).toBeInTheDocument()
  })

  it('przykład Białka 03: powierzchnia FV, struktura U1, perspektywy FV, ogólna U1, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Białka 03' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U1')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: gatunki krzewów, drzewa, ekspansywne, odnowienie', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki krzewów', 'Udział gatunków drzewiastych (powyżej 1,5 m wys.)', 'Gatunki ekspansywnych roślin zielnych', 'Odnowienie krzewów wrześni'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Powierzchnia zajęta przez siedlisko na transekcie', 'Wysokość krzewów wrześni (średnia)', 'Szerokość kamieńców', 'Obce gatunki inwazyjne'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /3230 – Zarośla wrześni na kamieńcach i żwirowiskach górskich potoków/ })
    expect(link).toHaveAttribute('href', '/3230')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 3230' })).toBeInTheDocument()
  })
})
