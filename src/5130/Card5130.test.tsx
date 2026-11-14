import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card5130 } from './Card5130'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card5130 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card5130', () => {
  it('ma kod 5130 bez gwiazdki i transekt 200×10 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 5130' })).toBeInTheDocument()
    expect(screen.getByText('5130', { selector: 'strong' }).parentElement).toHaveTextContent(/^5130 Zarośla jałowca pospolitego w murawach nawapiennych lub na wrzosowiskach/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x10 m')
  })

  it('przykład Poradów: powierzchnia FV, struktura U1, ogólna U1, ekspert zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Poradów' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U1')).toBeInTheDocument()
    // odnowienie: ekspert FV, próg tab. 2 U1 – formularz pokazuje rozjazd
    expect(rowOf('Odnowienie jałowców (obecność nalotu – do ok. 30 cm wys.)')).toHaveTextContent(/odbiega od progów \(U1\)/)
  })

  it('kardynalne pogrubione: gatunki krzewów, drzewiaste, gatunki charakterystyczne', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki krzewów', 'Udział gatunków drzewiastych (powyżej 1,5 m wys.)', 'Gatunki charakterystyczne murawy kserotermicznej/wrzosowiska'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Powierzchnia zajęta przez siedlisko na transekcie', 'Wysokość krzewów (średnia)', 'Zwarcie krzewów w płacie', 'Obce gatunki inwazyjne'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('zestaw tab. 2 (domyślny): stan zdrowotny oznaczony jako nieliczony; zestaw karty 2010 – liczony', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    expect(rowOf('Stan zdrowotny jałowców')).toHaveTextContent('nie liczy się do oceny struktury')
    await user.click(tab('Stanowisko'))
    await user.selectOptions(screen.getByLabelText(/Zestaw wskaźników struktury/, FIELD), 'card2010')
    await user.click(tab('Stan ochrony'))
    expect(rowOf('Stan zdrowotny jałowców')).not.toHaveTextContent('nie liczy się do oceny struktury')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /5130 – Zarośla jałowca/ })
    expect(link).toHaveAttribute('href', '/5130')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 5130' })).toBeInTheDocument()
  })
})
