import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card3130 } from './Card3130'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card3130 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card3130', () => {
  it('ma kod 3130 bez gwiazdki, podtyp i klasę zbiorowisk w stanowisku', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 3130' })).toBeInTheDocument()
    expect(screen.getByText('3130', { selector: 'strong' }).parentElement).toHaveTextContent(/^3130 Brzegi lub osuszane dna zbiorników wodnych/)
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toBeInTheDocument()
    expect(screen.getByLabelText(/Klasa zbiorowisk/, FIELD)).toBeInTheDocument()
  })

  it('przykład Przeborek: wszystko FV, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Przeborek' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('FV')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: gatunki charakterystyczne, dominujące, udział dobrze zachowanych płatów; powierzchnia na transekcie poza oceną', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki charakterystyczne', 'Gatunki dominujące', 'Udział dobrze zachowanych płatów siedliska'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Struktura przestrzenna płatów siedliska', 'Gatunki ekspansywne roślin zielnych', 'Obce gatunki inwazyjne', 'Powierzchnia zajęta przez siedlisko na transekcie'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
    expect(rowOf('Powierzchnia zajęta przez siedlisko na transekcie')).toHaveTextContent(/nie liczy się do oceny struktury/)
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /3130 – Brzegi lub osuszane dna zbiorników wodnych/ })
    expect(link).toHaveAttribute('href', '/3130')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 3130' })).toBeInTheDocument()
  })
})
