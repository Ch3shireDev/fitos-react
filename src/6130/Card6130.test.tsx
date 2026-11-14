import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card6130 } from './Card6130'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card6130 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card6130', () => {
  it('ma kod 6130 bez gwiazdki i wybór regionu', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 6130' })).toBeInTheDocument()
    expect(screen.getByText('6130', { selector: 'strong' }).parentElement).toHaveTextContent(/^6130 Murawy galmanowe \(Violetalia calaminariae\)/)
    expect(screen.getByLabelText(/Region \(zespół stanowisk\)/, FIELD)).toHaveValue('')
  })

  it('przykład Miedzianka: wszystko U2 jak w karcie, ekspert zanonimizowany, rozjazd przy niszczeniu hałd', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Miedzianka' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('U2')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U2')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U2')).toBeInTheDocument()
    // niszczenie: ekspert U1, próg tab. 2 (pobór kruszywa) U2 – formularz pokazuje rozjazd
    expect(rowOf('Niszczenie i zaśmiecanie hałd')).toHaveTextContent(/odbiega od progów \(U2\)/)
  })

  it('kardynalne pogrubione: kombinacja, obce, nitrofilne, krzewy, niszczenie', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of [
      'Charakterystyczna kombinacja florystyczna',
      'Obce gatunki inwazyjne',
      'Gatunki synantropijne i nitrofilne',
      'Występowanie krzewów i podrostu drzew',
      'Niszczenie i zaśmiecanie hałd',
    ])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Fizjonomia zbiorowiska roślinnego', 'Gatunki ekspansywne roślin zielnych', 'Ślady wypasu'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /6130 – Murawy galmanowe/ })
    expect(link).toHaveAttribute('href', '/6130')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 6130' })).toBeInTheDocument()
  })
})
