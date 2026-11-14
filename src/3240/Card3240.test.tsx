import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card3240 } from './Card3240'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card3240 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card3240', () => {
  it('ma kod 3240 bez gwiazdki i transekt 200×10 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 3240' })).toBeInTheDocument()
    expect(screen.getByText('3240', { selector: 'strong' }).parentElement).toHaveTextContent(/^3240 Zarośla wierzby siwej na kamieńcach i żwirowiskach górskich potoków/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x10 m')
  })

  it('przykład Śnietnica: powierzchnia FV, struktura U1 (kardynalne obce U1), ogólna U1, ekspert zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Śnietnica' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U1')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: gatunki krzewów, drzewiaste, obce, kompleks siedlisk', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki krzewów', 'Udział gatunków drzewiastych (powyżej 3 m wys.)', 'Obce gatunki inwazyjne', 'Obecność kompleksu siedlisk nadrzecznych: 3220, 3230, 3240, 91E0'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Powierzchnia zajęta przez siedlisko na transekcie', 'Wysokość krzewów (średnia)', 'Zwarcie krzewów na transekcie', 'Odnowienie wierzby (obecność nalotu)', 'Gatunki ekspansywnych roślin zielnych'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('zestaw „po harmonizacji 2016”: udział na transekcie oznaczony jako nieliczony', async () => {
    const user = setup()
    await user.selectOptions(screen.getByLabelText(/Zestaw wskaźników struktury/, FIELD), 'harmonized')
    await user.click(tab('Stan ochrony'))
    expect(rowOf('Powierzchnia zajęta przez siedlisko na transekcie')).toHaveTextContent('po harmonizacji 2016 nie liczy się do oceny struktury')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /3240 – Zarośla wierzby siwej/ })
    expect(link).toHaveAttribute('href', '/3240')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 3240' })).toBeInTheDocument()
  })
})
