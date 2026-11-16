import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card6190 } from './Card6190'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card6190 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card6190', () => {
  it('ma kod 6190 bez gwiazdki', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 6190' })).toBeInTheDocument()
    expect(screen.getByText('6190', { selector: 'strong' }).parentElement).toHaveTextContent(/^6190 Murawy pannońskie/)
  })

  it('przykład poglądowy Ostrzyca: powierzchnia FV, struktura U1, ogólna U1, wykonawca umowny', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: /Wczytaj przykład: Ostrzyca stok zachodni/ }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U1')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: charakterystyczne, dominujące, ekspansywne, ekspansja krzewów, ocienienie', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki charakterystyczne', 'Gatunki dominujące', 'Rodzime gatunki ekspansywne roślin zielnych', 'Ekspansja krzewów i podrostu drzew', 'Ocienienie muraw'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Obce gatunki inwazyjne', 'Zniszczenia mechaniczne']) expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
    expect(rowOf('Ocienienie muraw')).not.toHaveTextContent('nie liczy się do oceny struktury')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /6190 – Murawy pannońskie/ })
    expect(link).toHaveAttribute('href', '/6190')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 6190' })).toBeInTheDocument()
  })
})
