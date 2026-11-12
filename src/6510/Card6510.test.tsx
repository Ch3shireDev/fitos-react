import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card6510 } from './Card6510'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }
const setup = () => {
  const user = userEvent.setup()
  render(<Card6510 />)
  return user
}
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })

describe('Card6510', () => {
  it('ma zakładki RDOŚ: ocena referencyjna i działania ochronne oraz przycisk eksportu xlsx', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Karta 6510' })).toBeInTheDocument()
    expect(tab('Ocena referencyjna')).toBeInTheDocument()
    expect(tab('Działania ochronne')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pobierz arkusz RDOŚ (.xlsx)' })).toBeInTheDocument()
  })

  it('przykład 02: wykonawca zanonimizowany, powierzchnia U2, ocena ogólna U2', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: PLH020050_6510_02' }))
    expect(screen.getByLabelText(/^Obserwator/, FIELD)).toHaveValue('Jan Kowalski')
    expect(screen.getByLabelText(/Kod stanowiska/, FIELD)).toHaveValue('PLH020050_6510_02')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('U2')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('U2')).toBeInTheDocument()
  })

  it('działania ochronne: przykład ma dwa wiersze, przycisk dodaje trzeci', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: PLH020050_6510_02' }))
    await user.click(tab('Działania ochronne'))
    const rows = () => document.querySelectorAll('.hf-table-row').length
    expect(rows()).toBe(2)
    await user.click(screen.getByRole('button', { name: '+ Dodaj działanie' }))
    expect(rows()).toBe(3)
  })
})
