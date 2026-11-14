import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card6110 } from './Card6110'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card6110 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card6110', () => {
  it('ma kod 6110 bez gwiazdki i pole zestawu wskaźników', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 6110' })).toBeInTheDocument()
    expect(screen.getByText('6110', { selector: 'strong' }).parentElement).toHaveTextContent(/^6110 Skały wapienne i neutrofilne z roślinnością pionierską/)
    expect(screen.getByLabelText(/Zestaw wskaźników struktury/, FIELD)).toBeInTheDocument()
  })

  it('przykład Wapniarka: powierzchnia U1, struktura U2, ogólna U2, ekspert zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Wapniarka' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U2')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U2')).toBeInTheDocument()
    // ekspansja krzewów: ekspert FV, próg tab. 2 U1 – formularz pokazuje rozjazd
    expect(rowOf('Ekspansja krzewów i podrostu drzew')).toHaveTextContent(/odbiega od progów \(U1\)/)
  })

  it('kardynalne pogrubione: charakterystyczne, dominujące, ekspansywne, ekspansja krzewów (ocienienie – tylko w zestawie 2010)', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki charakterystyczne', 'Gatunki dominujące', 'Rodzime gatunki ekspansywne roślin zielnych', 'Ekspansja krzewów i podrostu drzew'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Udział procentowy siedliska na transekcie', 'Obce gatunki inwazyjne', 'Struktura przestrzenna płatów siedliska', 'Ocienienie muraw', 'Zniszczenia mechaniczne'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('zestaw z modyfikacji 2015 (domyślny): ocienienie oznaczone jako nieliczone; zestaw przewodnika 2010 – liczone', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    expect(rowOf('Ocienienie muraw')).toHaveTextContent('nie liczy się do oceny struktury')
    await user.click(tab('Stanowisko'))
    await user.selectOptions(screen.getByLabelText(/Zestaw wskaźników struktury/, FIELD), 'guide2010')
    await user.click(tab('Stan ochrony'))
    expect(rowOf('Ocienienie muraw')).not.toHaveTextContent('nie liczy się do oceny struktury')
    expect(rowOf('Ocienienie muraw')).toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /6110 – Skały wapienne/ })
    expect(link).toHaveAttribute('href', '/6110')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 6110' })).toBeInTheDocument()
  })
})
