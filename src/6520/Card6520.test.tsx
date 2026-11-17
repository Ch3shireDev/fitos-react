import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card6520 } from './Card6520'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card6520 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card6520', () => {
  it('ma kod 6520 bez gwiazdki i wybór regionu', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 6520' })).toBeInTheDocument()
    expect(screen.getByText('6520', { selector: 'strong' }).parentElement).toHaveTextContent(/^6520 Górskie łąki konietlicowe i mietlicowe/)
    expect(screen.getByLabelText(/Region/, FIELD)).toHaveValue('')
  })

  it('przykład Lasówka: oceny jak w karcie (struktura FV, perspektywy U1, ogólna U1), obserwator zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Lasówka' }))
    expect(screen.getByLabelText(/Wykonawca|Obserwator/, FIELD)).toHaveValue('Jan Kowalski')
    expect(screen.getByLabelText(/Region/, FIELD)).toHaveValue('sudety')
    await user.click(tab('Stan ochrony'))
    for (const id of ['grade-param-area', 'grade-param-structure']) expect(within(screen.getByTestId(id)).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U1')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: struktura przestrzenna, charakterystyczne, ekspansywne, krzewy', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Struktura przestrzenna płatów siedliska', 'Gatunki charakterystyczne', 'Rodzime gatunki ekspansywne roślin zielnych', 'Ekspansja krzewów i podrostu drzew'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Procent powierzchni zajęty przez siedlisko na transekcie', 'Gatunki dominujące', 'Obce gatunki inwazyjne', 'Zachowanie strefy ekotonowej', 'Wojłok (martwa materia organiczna)'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /6520 – Górskie łąki konietlicowe i mietlicowe/ })
    expect(link).toHaveAttribute('href', '/6520')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 6520' })).toBeInTheDocument()
  })
})
