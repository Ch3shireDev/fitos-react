import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card6230 } from './Card6230'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card6230 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card6230', () => {
  it('ma kod *6230 z gwiazdką (priorytetowe) i wybór podtypu', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 6230' })).toBeInTheDocument()
    expect(screen.getByText('*6230', { selector: 'strong' }).parentElement).toHaveTextContent(/^\*6230 Bogate florystycznie górskie i niżowe murawy bliźniczkowe/)
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('')
  })

  it('przykład Piorunowiec: struktura U1, obserwator zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Piorunowiec' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('6230-2')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U1')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: charakterystyczne, ekspansywne, krzewy, struktura przestrzenna', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of [
      'Gatunki charakterystyczne',
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Ekspansja krzewów i podrostu drzew',
      'Struktura przestrzenna płatów siedliska',
    ])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Gatunki dominujące', 'Bogactwo gatunkowe', 'Obce gatunki inwazyjne', 'Eutrofizacja'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /6230 – Bogate florystycznie/ })
    expect(link).toHaveAttribute('href', '/6230')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 6230' })).toBeInTheDocument()
  })
})
