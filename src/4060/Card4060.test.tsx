import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card4060 } from './Card4060'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card4060 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card4060', () => {
  it('ma kod 4060 bez gwiazdki i niestandardowy transekt', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 4060' })).toBeInTheDocument()
    expect(screen.getByText('4060', { selector: 'strong' }).parentElement).toHaveTextContent(/^4060 Wysokogórskie borówczyska bażynowe \(Empetro-Vaccinietum\)/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('Niestandardowy na skutek rozproszenia płatów siedliska')
  })

  it('przykład Kopa: wszystko FV jak w karcie, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Kopa' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    for (const id of ['grade-param-area', 'grade-param-structure', 'grade-overall']) expect(within(screen.getByTestId(id)).getByText('FV')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: gatunki charakterystyczne, dominujące, zniszczenia mechaniczne', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki charakterystyczne', 'Gatunki dominujące, w tym ekspansja borówki czarnej Vaccinium myrtillus', 'Zniszczenia mechaniczne'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    expect(rowOf('Ekspansja kosodrzewiny Pinus mugo')).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /4060 – Wysokogórskie borówczyska bażynowe/ })
    expect(link).toHaveAttribute('href', '/4060')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 4060' })).toBeInTheDocument()
  })
})
