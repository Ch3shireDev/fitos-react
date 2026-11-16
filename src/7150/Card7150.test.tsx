import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card7150 } from './Card7150'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card7150 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card7150', () => {
  it('ma kod 7150 bez gwiazdki i wybór podtypu', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 7150' })).toBeInTheDocument()
    expect(screen.getByText('7150', { selector: 'strong' }).parentElement).toHaveTextContent(/^7150 Obniżenia na podłożu torfowym/)
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('')
  })

  it('przykład Bór na Czerwonem: oceny jak w karcie (powierzchnia U1, struktura U1, perspektywy FV, ogólna U1), ekspert zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Bór na Czerwonem' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U1')).toBeInTheDocument()
    expect(screen.queryByText(/odbiega od progów/)).not.toBeInTheDocument()
  })

  it('kardynalne pogrubione: struktura płatów, charakterystyczne, odsłonięty torf, obce, ekspansywne, krzewy', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of [
      'Struktura przestrzenna płatów siedliska',
      'Gatunki charakterystyczne',
      'Odsłonięty torf',
      'Obce gatunki inwazyjne',
      'Gatunki ekspansywne roślin zielnych',
      'Obecność krzewów i podrostu drzew',
    ])
      expect(rowOf(label), label).toHaveClass('hf-cardinal-row')
    for (const label of [
      'Procent powierzchni zajęty przez siedlisko na transekcie',
      'Gatunki dominujące',
      'Pokrycie i struktura gatunkowa mszaków',
      'Stopień uwodnienia',
      'Pozyskanie torfu',
      'Melioracje odwadniające',
      'Geneza siedliska',
    ])
      expect(rowOf(label), label).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /7150 – Obniżenia na podłożu torfowym/ })
    expect(link).toHaveAttribute('href', '/7150')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 7150' })).toBeInTheDocument()
  })
})
