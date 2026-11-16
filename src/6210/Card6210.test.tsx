import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card6210 } from './Card6210'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card6210 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card6210', () => {
  it('ma kod 6210 bez gwiazdki, wybór podtypu i transekt 200 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 6210' })).toBeInTheDocument()
    expect(screen.getByText('6210', { selector: 'strong' }).parentElement).toHaveTextContent(/^6210 Murawy kserotermiczne \(Festuco-Brometea\)/)
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('')
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200 m')
  })

  it('przykład Radomice: oceny jak w karcie (U1), rozjazd tylko przy gatunkach charakterystycznych (próg 2022)', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Radomice' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('6210-3')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U1')).toBeInTheDocument()
    expect(screen.getAllByText(/odbiega od progów/)).toHaveLength(1)
    expect(screen.getByText(/Ocena FV odbiega od progów \(U1\)/)).toBeInTheDocument()
  })

  it('kardynalne pogrubione: gatunki charakterystyczne, ekspansywne, krzewy', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki charakterystyczne', 'Rodzime gatunki ekspansywne roślin zielnych', 'Ekspansja krzewów i podrostu drzew'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Obce gatunki inwazyjne', 'Liczba gatunków storczykowatych', 'Zachowanie strefy ekotonowej']) expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /6210 – Murawy kserotermiczne/ })
    expect(link).toHaveAttribute('href', '/6210')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 6210' })).toBeInTheDocument()
  })
})
