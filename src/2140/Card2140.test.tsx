import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card2140 } from './Card2140'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card2140 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card2140', () => {
  it('ma kod *2140 (priorytetowe) i domyślne zbiorowisko', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 2140' })).toBeInTheDocument()
    expect(screen.getByText('*2140', { selector: 'strong' }).parentElement).toHaveTextContent(/^\*2140 Nadmorskie wrzosowiska bażynowe/)
    expect(screen.getByLabelText(/Zbiorowiska roślinne/, FIELD)).toHaveValue('Carici arenariae-Empetretum nigri')
  })

  it('przykład Czołpino: wszystko FV jak w przewodniku, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Czołpino' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    for (const id of ['grade-param-area', 'grade-param-structure', 'grade-overall'])
      expect(within(screen.getByTestId(id)).getByText('FV')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: 7 z 8 wskaźników struktury, poza obcymi inwazyjnymi', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of [
      'Charakterystyczna kombinacja florystyczna',
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Gatunki nitrofilne',
      'Występowanie abrazji',
      'Obecność nalotu drzew',
      'Zniszczenia mechaniczne',
    ])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    expect(rowOf('Obce gatunki inwazyjne')).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /2140 – Nadmorskie wrzosowiska bażynowe/ })
    expect(link).toHaveAttribute('href', '/2140')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 2140' })).toBeInTheDocument()
  })
})
