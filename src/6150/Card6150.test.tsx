import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card6150 } from './Card6150'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card6150 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card6150', () => {
  it('ma kod 6150 bez gwiazdki i wybór podtypu', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 6150' })).toBeInTheDocument()
    expect(screen.getByText('6150', { selector: 'strong' }).parentElement).toHaveTextContent(/^6150 Wysokogórskie murawy acidofilne \(Juncion trifidi\)/)
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('')
  })

  it('przykład Kopa Kondracka: wszystko FV jak w karcie, obserwator zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Kopa Kondracka' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    expect(screen.getByLabelText(/Podtyp siedliska/, FIELD)).toHaveValue('6150-1')
    await user.click(tab('Stan ochrony'))
    for (const id of ['grade-param-area', 'grade-param-structure', 'grade-overall']) expect(within(screen.getByTestId(id)).getByText('FV')).toBeInTheDocument()
    expect(screen.queryByText(/odbiega od progów/)).not.toBeInTheDocument()
  })

  it('kardynalne pogrubione: krzewy, gatunki charakterystyczne, ekspansywne, zniszczenia', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Ekspansja krzewów i podrostu drzew', 'Gatunki charakterystyczne', 'Gatunki ekspansywne', 'Zniszczenia mechaniczne'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of [
      'Ekspansja borówki czarnej Vaccinium myrtillus',
      'Obce gatunki inwazyjne',
      'Procent powierzchni zajęty przez siedlisko na transekcie',
      'Występowanie śmiałka pogiętego Deschampsia flexuosa',
    ])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /6150 – Wysokogórskie murawy acidofilne/ })
    expect(link).toHaveAttribute('href', '/6150')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 6150' })).toBeInTheDocument()
  })
})
