import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card2130 } from './Card2130'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card2130 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card2130', () => {
  it('ma kod *2130 (priorytetowe) i transekt 10×200 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 2130' })).toBeInTheDocument()
    expect(screen.getByText('*2130', { selector: 'strong' }).parentElement).toHaveTextContent(/^\*2130 Nadmorskie wydmy szare/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('10x200 m')
  })

  it('przykład Przebrno/Siekierki: wszystko FV, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Przebrno/Siekierki' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('FV')).toBeInTheDocument()
  })

  it('6 kardynalnych pogrubionych; dominujące i procesy eoliczne opisane jako poza oceną', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of [
      'Charakterystyczna kombinacja florystyczna',
      'Rodzime gatunki ekspansywne roślin zielnych',
      'Gatunki nitrofilne',
      'Obecność nalotu drzew',
      'Występowanie abrazji',
      'Zniszczenia mechaniczne',
    ])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Obce gatunki inwazyjne', 'Obecność krzewów i krzewinek', 'Gatunki dominujące', 'Występowanie procesów eolicznych'])
      expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
    expect(within(rowOf('Gatunki dominujące')).getByText(/nie liczy się do oceny struktury/)).toBeInTheDocument()
    expect(within(rowOf('Występowanie procesów eolicznych')).getByText(/nie liczy się do oceny struktury/)).toBeInTheDocument()
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /2130 – Nadmorskie wydmy szare/ })
    expect(link).toHaveAttribute('href', '/2130')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 2130' })).toBeInTheDocument()
  })
})
