import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card4010 } from './Card4010'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card4010 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card4010', () => {
  it('ma kod 4010 (nie priorytetowe) i domyślne zbiorowisko', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 4010' })).toBeInTheDocument()
    expect(screen.getByText('4010', { selector: 'strong' }).parentElement).toHaveTextContent(/^4010 Wilgotne wrzosowiska z wrzoścem bagiennym Erica tetralix/)
    expect(screen.getByLabelText(/Zbiorowiska roślinne/, FIELD)).toHaveValue('Ericetum tetralicis')
  })

  it('przykład Gniewoszyce: wszystko U2 jak w przewodniku, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Gniewoszyce' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    for (const id of ['grade-param-area', 'grade-param-structure', 'grade-overall'])
      expect(within(screen.getByTestId(id)).getByText('U2')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: wrzosiec, drzewa, uwilgotnienie, gatunki obce; pomocnicze nie', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Pokrycie wrzośca bagiennego Erica tetralix', 'Zarośnięcie przez drzewa', 'Uwilgotnienie', 'Gatunki obce geograficznie'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of [
      'Ekspansywne gatunki rodzime (apofity)',
      'Stan kluczowych dla różnorodności biologicznej gatunków lokalnie typowych dla siedliska',
      'Inne zniekształcenia (rozjeżdżenie, wydeptanie, zaśmiecenie)',
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
    const link = screen.getByRole('link', { name: /4010 – Wilgotne wrzosowiska z wrzoścem bagiennym/ })
    expect(link).toHaveAttribute('href', '/4010')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 4010' })).toBeInTheDocument()
  })
})
