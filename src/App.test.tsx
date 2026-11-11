import { it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import App from './App'

it('przechodzi ze strony głównej do karty 7120', async () => {
    render(<MemoryRouter><App /></MemoryRouter>)
    await userEvent.click(screen.getByRole('link', { name: /7120/ }))
    expect(screen.getByRole('heading', { name: 'Karta 7120' })).toBeInTheDocument()
})

