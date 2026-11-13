import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card2170 } from './Card2170'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card2170 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card2170', () => {
  it('ma kod 2170 bez gwiazdki i stanowisko punktowe', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 2170' })).toBeInTheDocument()
    expect(screen.getByText('2170', { selector: 'strong' }).parentElement).toHaveTextContent(/^2170 Nadmorskie wydmy z zaroślami wierzby piaskowej/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('stanowisko punktowe (jeden płat zarośli)')
  })

  it('przykład Helskie Wydmy 1: powierzchnia U1, ogólna U1, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Helskie Wydmy 1' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('U1')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U1')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: ekspansywne, powierzchnia kępy, stan zdrowotny', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki ekspansywne drzew i krzewów', 'Powierzchnia kępy', 'Stan zdrowotny krzewów wierzby piaskowej'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Charakterystyczna kombinacja gatunków', 'Wysokość krzewów (średnia)', 'Odnowienie naturalne wierzby piaskowej'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /2170 – Nadmorskie wydmy z zaroślami wierzby piaskowej/ })
    expect(link).toHaveAttribute('href', '/2170')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 2170' })).toBeInTheDocument()
  })
})
