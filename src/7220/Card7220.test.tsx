import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card7220 } from './Card7220'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card7220 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card7220', () => {
  it('ma kod *7220 z gwiazdką, wybór podtypu, wariantu i listy gatunków', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 7220' })).toBeInTheDocument()
    expect(screen.getByText('*7220', { selector: 'strong' }).parentElement).toHaveTextContent(/^\*7220 Źródliska wapienne ze zbiorowiskami Cratoneurion commutati/)
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('')
    expect(screen.getByLabelText(/^Wariant/, FIELD)).toHaveValue('')
    expect(screen.getByLabelText(/Lista gatunków charakterystycznych/, FIELD)).toHaveValue('')
  })

  it('przykład Las Grabicz 1: oceny jak w karcie, struktura i ocena ogólna U1 wg tab. 2, koordynator zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Las Grabicz 1' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('7220-1')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('XX')).toBeInTheDocument()
    for (const id of ['grade-param-structure', 'grade-overall']) expect(within(screen.getByTestId(id)).getByText('U1')).toBeInTheDocument()
    expect(screen.getAllByText(/odbiega od progów/)).toHaveLength(3)
  })

  it('kardynalne pogrubione: gatunki charakterystyczne, proces i występowanie martwicy, uwodnienie, cztery erozje', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki charakterystyczne', 'Proces wytrącania się martwicy wapiennej', 'Występowanie martwicy wapiennej', 'Stan uwodnienia', 'Erozja wsteczna', 'Erozja zboczowa', 'Erozja denna koryta cieków', 'Erozja chemiczna'])
      expect(rowOf(label), label).toHaveClass('hf-cardinal-row')
    for (const label of ['Gatunki dominujące', 'Rodzime gatunki ekspansywne roślin zielnych', 'Obce gatunki inwazyjne', 'Gatunki wskazujące na eutrofizację siedliska', 'Obecność i pokrycie wątrobowców'])
      expect(rowOf(label), label).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /7220 – Źródliska wapienne ze zbiorowiskami Cratoneurion commutati/ })
    expect(link).toHaveAttribute('href', '/7220')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 7220' })).toBeInTheDocument()
  })
})
