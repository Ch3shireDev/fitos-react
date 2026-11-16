import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card6440 } from './Card6440'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card6440 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card6440', () => {
  it('ma kod 6440 bez gwiazdki i domyślny transekt 200x10 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 6440' })).toBeInTheDocument()
    expect(screen.getByText('6440', { selector: 'strong' }).parentElement).toHaveTextContent(/^6440 Łąki selernicowe \(Cnidion dubii\)/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x10 m')
  })

  it('przykład Brańszczyk 2: powierzchnia i perspektywy FV, struktura i ocena ogólna U1 (reguła ogólna), eksperci zanonimizowani', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Brańszczyk 2' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    for (const id of ['grade-param-structure', 'grade-overall']) expect(within(screen.getByTestId(id)).getByText('U1')).toBeInTheDocument()
    expect(screen.queryByText(/odbiega od progów/)).not.toBeInTheDocument()
  })

  it('kardynalne pogrubione: charakterystyczne, obce, ekspansywne, krzewy', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki charakterystyczne', 'Obce gatunki inwazyjne', 'Gatunki ekspansywne roślin zielnych', 'Ekspansja krzewów i podrostu drzew'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of [
      'Procent powierzchni zajęty przez siedlisko na transekcie',
      'Struktura przestrzenna płatów siedliska',
      'Gatunki dominujące',
      'Cenne składniki flory',
      'Zachowanie płatów lokalnie typowych',
      'Wojłok (martwa materia organiczna)',
    ])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /6440 – Łąki selernicowe/ })
    expect(link).toHaveAttribute('href', '/6440')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 6440' })).toBeInTheDocument()
  })
})
