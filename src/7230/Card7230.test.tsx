import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card7230 } from './Card7230'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card7230 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card7230', () => {
  it('ma kod 7230 bez gwiazdki i wybór podtypu', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 7230' })).toBeInTheDocument()
    expect(screen.getByText('7230', { selector: 'strong' }).parentElement).toHaveTextContent(/^7230 Górskie i nizinne torfowiska zasadowe/)
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('')
  })

  it('przykład Za Stronią: powierzchnia FV, struktura i ocena ogólna U1 jak w karcie, ekspert zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Za Stronią' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('7230-1')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    for (const id of ['grade-param-structure', 'grade-overall']) expect(within(screen.getByTestId(id)).getByText('U1')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: charakterystyczne, mchy, ekspansywne, pH, krzewy, uwodnienie', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki charakterystyczne', 'Pokrycie i struktura gatunkowa mchów', 'Gatunki ekspansywne roślin zielnych', 'Zakres pH', 'Ekspansja krzewów i podrostu drzew', 'Stopień uwodnienia'])
      expect(rowOf(label), label).toHaveClass('hf-cardinal-row')
    for (const label of ['Procent powierzchni zajęty przez siedlisko na transekcie', 'Gatunki dominujące', 'Obce gatunki inwazyjne', 'Pozyskanie torfu', 'Melioracje odwadniające'])
      expect(rowOf(label), label).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /7230 – Górskie i nizinne torfowiska zasadowe/ })
    expect(link).toHaveAttribute('href', '/7230')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 7230' })).toBeInTheDocument()
  })
})
