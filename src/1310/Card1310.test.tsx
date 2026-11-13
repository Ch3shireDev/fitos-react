import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { Card1310 } from './Card1310'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }

const setup = () => {
  const user = userEvent.setup()
  render(<Card1310 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })
const rowOf = (label: string) => screen.getByText(label, { selector: '.hf-ind-name' }).closest('tr')!

describe('Card1310', () => {
  it('ma kod 1310 bez gwiazdki, transekt 200×10 m i zespół z solirodem', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 1310' })).toBeInTheDocument()
    expect(screen.getByText('1310', { selector: 'strong' }).parentElement).toHaveTextContent(/^1310 Śródlądowe błotniste solniska z solirodkiem/)
    expect(screen.getByLabelText(/Wymiary transektu/, FIELD)).toHaveValue('200x10 m')
    expect(screen.getByLabelText(/Zbiorowiska roślinne/, FIELD)).toHaveValue('Puccinellio distantis-Salicornietum brachystachyae')
  })

  it('przykład Kołobrzeg-Budzistowo: powierzchnia, struktura i ocena ogólna U1, wykonawca zanonimizowany', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Kołobrzeg-Budzistowo' }))
    expect(screen.getByLabelText(/Wykonawca/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    for (const id of ['grade-param-area', 'grade-param-structure', 'grade-overall'])
      expect(within(screen.getByTestId(id)).getByText('U1')).toBeInTheDocument()
  })

  it('kardynalne pogrubione: charakterystyczne, ekspansywne, struktura przestrzenna, zasilanie', async () => {
    const user = setup()
    await user.click(tab('Stan ochrony'))
    for (const label of ['Gatunki charakterystyczne', 'Rodzime gatunki ekspansywne roślin zielnych', 'Struktura przestrzenna płatów siedliska', 'Zasilanie wodami słonymi'])
      expect(rowOf(label)).toHaveClass('hf-cardinal-row')
    for (const label of ['Gatunki dominujące', 'Obce gatunki inwazyjne']) expect(rowOf(label)).not.toHaveClass('hf-cardinal-row')
  })

  it('rejestruje się sama (meta.ts): kafelek na stronie głównej prowadzi do karty', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /1310 – Śródlądowe błotniste solniska/ })
    expect(link).toHaveAttribute('href', '/1310')
    await user.click(link)
    expect(screen.getByRole('heading', { name: 'Karta 1310' })).toBeInTheDocument()
  })
})
