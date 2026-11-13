import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card1330 } from './Card1330'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card1330 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card1330', () => {
  it('ma kod 1330 bez gwiazdki, transekt 200×10 m i wybór podtypu', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 1330' })).toBeInTheDocument()
    expect(screen.getByText('1330', { selector: 'strong' }).parentElement).toHaveTextContent(/^1330 Solniska nadmorskie/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x10 m')
    expect(within(screen.getByLabelText(/Podtyp siedliska/, FIELD)).getByRole('option', { name: /1330-2 Halofilne półszuwary/ })).toBeInTheDocument()
  })

  it('przykład Jarzębowo: wszystko FV, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Jarzębowo' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    for (const id of ['grade-param-area', 'grade-param-structure', 'grade-overall'])
      expect(within(screen.getByTestId(id)).getByText('FV')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: charakterystyczne, dominujące, ekspansywne, zasilanie', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki charakterystyczne', 'Gatunki dominujące', 'Rodzime gatunki ekspansywne roślin zielnych', 'Zasilanie wodami słonymi'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Udział procentowy siedliska na transekcie', 'Obce gatunki inwazyjne', 'Ekspansja krzewów i podrostu drzew', 'Struktura przestrzenna płatów siedliska'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /1330 – Solniska nadmorskie/ })
    expect(link).toHaveAttribute('href', '/1330')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 1330' })).toBeInTheDocument()
  })
})
