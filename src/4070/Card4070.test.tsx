import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card4070 } from './Card4070'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card4070 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card4070', () => {
  it('ma kod 4070 bez gwiazdki i transekt 200×10 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 4070' })).toBeInTheDocument()
    expect(screen.getByText('4070', { selector: 'strong' }).parentElement).toHaveTextContent(/^4070 Zarośla kosodrzewiny/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x10 m')
  })

  it('przykład Sokolica: powierzchnia, struktura i ocena ogólna FV jak w karcie, ekspert zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Sokolica' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('FV')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: gatunki typowe, zniszczenia mechaniczne, porosty', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki typowe', 'Zniszczenia mechaniczne', 'Bogactwo porostów epifitycznych']) expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Udział procentowy siedliska na transekcie', 'Gatunki dominujące', 'Naturalny kompleks siedlisk subalpejskich', 'Obumieranie igieł kosodrzewiny'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /4070 – Zarośla kosodrzewiny/ })
    expect(link).toHaveAttribute('href', '/4070')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 4070' })).toBeInTheDocument()
  })
})
