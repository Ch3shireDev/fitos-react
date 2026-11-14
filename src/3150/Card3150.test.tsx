import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card3150 } from './Card3150'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card3150 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card3150', () => {
  it('ma kod 3150 bez gwiazdki, podtyp i transekt 10×100 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 3150' })).toBeInTheDocument()
    expect(screen.getByText('3150', { selector: 'strong' }).parentElement).toHaveTextContent(/^3150 Starorzecza i naturalne eutroficzne zbiorniki wodne/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('10x100 m')
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toBeInTheDocument()
  })

  it('przykład Brzeg I: powierzchnia, struktura i ocena ogólna FV, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Brzeg I' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    for (const id of ['grade-param-area', 'grade-param-structure', 'grade-overall'])
      expect(within(screen.getByTestId(id)).getByText('FV')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: kombinacja, degeneracja, konduktywność, przezroczystość; barwa, pH i plankton nie', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of [
      'Charakterystyczna kombinacja zbiorowisk w obrębie transektu',
      'Gatunki wskazujące na degenerację siedliska',
      'Konduktywność (przewodnictwo elektrolityczne)',
      'Przezroczystość wody',
    ])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Barwa wody', 'Odczyn wody', 'Fito- i zooplankton']) expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /3150 – Starorzecza i naturalne eutroficzne zbiorniki wodne/ })
    expect(link).toHaveAttribute('href', '/3150')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 3150' })).toBeInTheDocument()
  })
})
