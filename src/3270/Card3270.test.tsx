import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card3270 } from './Card3270'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card3270 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card3270', () => {
  it('ma kod 3270 bez gwiazdki i opis „bez transektu” w wymiarach', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 3270' })).toBeInTheDocument()
    expect(screen.getByText('3270', { selector: 'strong' }).parentElement).toHaveTextContent(/^3270 Zalewane muliste brzegi rzek/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue(
      'Monitoring nie jest prowadzony metodą transektu – zdjęcia fitosocjologiczne w 3 najbardziej reprezentatywnych płatach.',
    )
  })

  it('przykład Sandomierz: powierzchnia, struktura i ocena ogólna FV, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Sandomierz' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    for (const id of ['grade-param-area', 'grade-param-structure', 'grade-overall'])
      expect(within(screen.getByTestId(id)).getByText('FV')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: charakterystyczne, dominujące, udział dobrze zachowanych płatów', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki charakterystyczne', 'Gatunki dominujące', 'Udział dobrze zachowanych płatów siedliska'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Struktura przestrzenna płatów siedliska', 'Obce gatunki inwazyjne', 'Gatunki ekspansywne roślin zielnych'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /3270 – Zalewane muliste brzegi rzek/ })
    expect(link).toHaveAttribute('href', '/3270')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 3270' })).toBeInTheDocument()
  })
})
