import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card4080 } from './Card4080'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card4080 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card4080', () => {
  it('ma kod 4080 bez gwiazdki i pełną nazwę', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 4080' })).toBeInTheDocument()
    expect(screen.getByText('4080', { selector: 'strong' }).parentElement).toHaveTextContent(/^4080 Subalpejskie zarośla wierzby lapońskiej lub wierzby śląskiej/)
  })

  it('przykład Kocioł Wielkiego Stawu: wszystkie parametry i ocena ogólna FV, jak w karcie; koordynator zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Kocioł Wielkiego Stawu' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('FV')).toBeInTheDocument()
    expect(rowOf('Charakterystyczna kombinacja gatunków')).toHaveTextContent('nie liczy się do oceny struktury')
  })

  it('kardynalne pogrubione: wierzby, odnowienie, kombinacja, zniszczenia', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of [
      'Występowanie w warstwie krzewów wierzby lapońskiej lub wierzby śląskiej',
      'Naturalne odnowienie wierzby lapońskiej lub śląskiej',
      'Charakterystyczna kombinacja gatunków',
      'Zniszczenia mechaniczne',
    ])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Powierzchnia siedliska na stanowisku', 'Gatunki dominujące, w tym ekspansja borówki czarnej i śmiałka pogiętego', 'Ekspansja kosodrzewiny'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /4080 – Subalpejskie zarośla wierzby lapońskiej/ })
    expect(link).toHaveAttribute('href', '/4080')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 4080' })).toBeInTheDocument()
  })
})
