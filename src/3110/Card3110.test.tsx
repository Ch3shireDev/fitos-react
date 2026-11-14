import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card3110 } from './Card3110'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card3110 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card3110', () => {
  it('ma kod 3110 bez gwiazdki i transekt 30×30 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 3110' })).toBeInTheDocument()
    expect(screen.getByText('3110', { selector: 'strong' }).parentElement).toHaveTextContent(/^3110 Jeziora lobeliowe/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('30x30 m')
  })

  it('przykład Jezioro Chlewo: powierzchnia, struktura i ocena ogólna FV, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Jezioro Chlewo' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    for (const id of ['grade-param-area', 'grade-param-structure', 'grade-overall'])
      expect(within(screen.getByTestId(id)).getByText('FV')).toBeInTheDocument()
  })

  it('sześć kardynalnych pogrubionych; plankton niepogrubiony, z dopiskiem „wskaźnik pomocniczy”', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of [
      'Charakterystyczna kombinacja zbiorowisk w obrębie transektu',
      'Gatunki wskazujące na degenerację siedliska',
      'Barwa wody',
      'Odczyn wody',
      'Konduktywność (przewodnictwo elektrolityczne)',
      'Przezroczystość wody',
    ])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    expect(rowOf('Plankton (fito- i zooplankton)')).not.toHaveClass('hf-cardinal-row')
    expect(within(rowOf('Plankton (fito- i zooplankton)')).getByText(/wskaźnik pomocniczy/)).toBeInTheDocument()
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /3110 – Jeziora lobeliowe/ })
    expect(link).toHaveAttribute('href', '/3110')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 3110' })).toBeInTheDocument()
  })
})
