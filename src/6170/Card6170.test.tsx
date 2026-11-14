import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card6170 } from './Card6170'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card6170 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card6170', () => {
  it('ma kod 6170 bez gwiazdki, wybór podtypu i typu płatów', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 6170' })).toBeInTheDocument()
    expect(screen.getByText('6170', { selector: 'strong' }).parentElement).toHaveTextContent(/^6170 Nawapienne murawy wysokogórskie \(Seslerion tatrae\)/)
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('')
    expect(screen.getByLabelText(/Typ płatów/, FIELD)).toHaveValue('')
  })

  it('przykład Upłaziańska Kopa 2: wszystko FV jak w karcie, obserwator zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Upłaziańska Kopa 2' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('6170-1')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('FV')).toBeInTheDocument()
    // niekardynalne U1 (erozja, gatunki bezwapienne) nie obniżają struktury; żadnych rozjazdów z progami
    expect(rowOf('Erozja')).toHaveTextContent('U1')
    expect(rowOf('Gatunki typowe dla podłoża bezwapiennego')).toHaveTextContent('U1')
    expect(screen.queryByText(/odbiega od progów/)).not.toBeInTheDocument()
  })

  it('kardynalne pogrubione: bogactwo, cenne składniki, gatunki nawapienne', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Bogactwo gatunkowe', 'Cenne składniki flory', 'Gatunki nawapienne']) expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Erozja', 'Gatunki ekspansywne', 'Gatunki synantropijne', 'Ślady wspinaczki lub wydeptywania', 'Średnie pokrycie roślin zielnych w transekcie'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /6170 – Nawapienne murawy wysokogórskie/ })
    expect(link).toHaveAttribute('href', '/6170')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 6170' })).toBeInTheDocument()
  })
})
