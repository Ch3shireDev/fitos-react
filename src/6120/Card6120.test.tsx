import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card6120 } from './Card6120'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card6120 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card6120', () => {
  it('ma kod *6120 (priorytetowe) i transekt 10×200 m', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 6120' })).toBeInTheDocument()
    expect(screen.getByText('*6120', { selector: 'strong' }).parentElement).toHaveTextContent(/^\*6120 Ciepłolubne, śródlądowe murawy napiaskowe/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('10x200 m')
  })

  it('przykład Kalinik: wszystko FV jak w karcie, wykonawca zanonimizowany, rozjazd przy gatunkach charakterystycznych', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Kalinik' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('FV')).toBeInTheDocument()
    expect(screen.getByText(/Ocena FV odbiega od progów \(U1\)/)).toBeInTheDocument()
  })

  it('kardynalne pogrubione: wszystkie poza strefą ekotonową', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki charakterystyczne', 'Obce gatunki inwazyjne', 'Rodzime gatunki ekspansywne roślin zielnych', 'Ekspansja krzewów i podrostu drzew', 'Struktura przestrzenna płatów muraw'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    expect(rowOf('Zachowanie strefy ekotonowej')).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /6120 – Ciepłolubne, śródlądowe murawy napiaskowe/ })
    expect(link).toHaveAttribute('href', '/6120')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 6120' })).toBeInTheDocument()
  })
})
