import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card7110 } from './Card7110'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card7110 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card7110', () => {
  it('ma kod *7110 (priorytetowe) i opcjonalny podtyp', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 7110' })).toBeInTheDocument()
    expect(screen.getByText('*7110', { selector: 'strong' }).parentElement).toHaveTextContent(/^\*7110 Torfowiska wysokie z roślinnością torfotwórczą \(żywe\)/)
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('')
  })

  it('przykład Supraśl: wskaźniki jak w karcie, sosna 40% (U2, kardynalny) → struktura i ocena ogólna U2', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Supraśl' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('7110-1')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    for (const id of ['grade-param-structure', 'grade-overall']) expect(within(screen.getByTestId(id)).getByText('U2')).toBeInTheDocument()
    expect(screen.queryByText(/odbiega od progów/)).not.toBeInTheDocument()
  })

  it('kardynalne pogrubione wg listy pod tab. 2; gatunki dominujące oznaczone jako opisowe', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of [
      'Gatunki charakterystyczne',
      'Pokrycie i struktura gatunkowa torfowców',
      'Odpowiednie uwodnienie',
      'Pozyskanie torfu',
      'Melioracje odwadniające',
      'Obecność krzewów i drzew',
    ])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Obce gatunki inwazyjne', 'Rodzime gatunki ekspansywne roślin zielnych', 'Struktura powierzchni torfowiska (obecność dolinek i kęp)', 'Gatunki dominujące'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
    expect(within(rowOf('Gatunki dominujące')).getByText(/tab. 2 nie podaje progów/)).toBeInTheDocument()
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /7110 – Torfowiska wysokie z roślinnością torfotwórczą \(żywe\)/ })
    expect(link).toHaveAttribute('href', '/7110')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 7110' })).toBeInTheDocument()
  })
})
