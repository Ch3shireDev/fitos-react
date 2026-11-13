import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card1340 } from './Card1340'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card1340 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card1340', () => {
  it('ma kod *1340 z gwiazdką (priorytetowe) i pole podtypów', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 1340' })).toBeInTheDocument()
    expect(screen.getByText('*1340', { selector: 'strong' }).parentElement).toHaveTextContent(/^\*1340 Śródlądowe słone łąki, pastwiska i szuwary/)
    expect(screen.getByLabelText(/Podtypy siedliska/, FIELD)).toHaveValue('')
  })

  it('przykład Owczary: powierzchnia U1, struktura U2, ocena ogólna U2, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Owczary k. Buska-Zdroju' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('U1')).toBeInTheDocument()
    for (const id of ['grade-param-structure', 'grade-overall']) expect(within(screen.getByTestId(id)).getByText('U2')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: transekt, charakterystyczne, dominujące, ekspansywne, zasilanie', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of [
      'Procent powierzchni zajęty przez siedlisko na transekcie',
      'Gatunki charakterystyczne',
      'Gatunki dominujące',
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Zasilanie wodami słonymi',
    ])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Obce gatunki inwazyjne', 'Ekspansja krzewów i podrostu drzew', 'Struktura przestrzenna płatów siedliska', 'Uwilgotnienie'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /1340 – Śródlądowe słone łąki/ })
    expect(link).toHaveAttribute('href', '/1340')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 1340' })).toBeInTheDocument()
  })
})
