import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Card6410 } from './Card6410'

afterEach(cleanup)

const FIELD = { selector: 'input, select, textarea' }
const tab = (name: string | RegExp) => screen.getByRole('tab', { name })

describe('Card6410', () => {
  it('przykład Wędziszew: wykonawca zanonimizowany, oceny eksperta z karty', async () => {
    const user = userEvent.setup()
    render(<Card6410 />)
    expect(screen.getByRole('heading', { name: 'Karta 6410' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pobierz arkusz RDOŚ (.xlsx)' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Wędziszew' }))
    expect(screen.getByLabelText(/^Obserwator/, FIELD)).toHaveValue('Jan Kowalski')
    await user.click(tab('Stan ochrony'))
    expect(within(screen.getByTestId('grade-param-area')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-param-structure')).getByText('FV')).toBeInTheDocument()
    expect(within(screen.getByTestId('grade-overall')).getByText('FV')).toBeInTheDocument()
    expect(tab('Ocena referencyjna')).toBeInTheDocument()
    expect(tab('Działania ochronne')).toBeInTheDocument()
  })
})
