import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card1150 } from './Card1150'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card1150 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card1150', () => {
  it('ma kod *1150 i transekt nurkowy 50×30 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 1150' })).toBeInTheDocument()
    expect(screen.getByText('*1150', { selector: 'strong' }).parentElement).toHaveTextContent(/^\*1150 Zalewy i jeziora przymorskie \(laguny\)/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('50x30 m, podwodny')
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toBeInTheDocument()
  })

  it('przykład Bukowo 2: powierzchnia, struktura i ocena ogólna U1, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Bukowo 2' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    for (const id of ['grade-param-area', 'grade-param-structure', 'grade-overall'])
      expect(within(screen.getByTestId(id)).getByText('U1')).toBeInTheDocument()
  })

  it('ramienice: niepogrubione, z dopiskiem „wskaźnik pomocniczy”; chlorki i hydrofity kardynalne', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    expect(rowOf('Obecność ramienic')).not.toHaveClass('hf-cardinal-row')
    expect(within(rowOf('Obecność ramienic')).getByText(/wskaźnik pomocniczy/)).toBeInTheDocument()
    for (const label of ['Liczba zbiorowisk', 'Obecność hydrofitów', 'Zawartość chlorków', 'Odczyn wody']) expect(rowOf(label)).toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /1150 – Zalewy i jeziora przymorskie/ })
    expect(link).toHaveAttribute('href', '/1150')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 1150' })).toBeInTheDocument()
  })
})
