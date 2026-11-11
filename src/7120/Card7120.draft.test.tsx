import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CardValues } from './habitats/types'

// Pamięć urządzenia podmieniona na mapę w pamięci – IndexedDB w testach nie ma.
const store = new Map<string, { values: CardValues; savedAt: string }>()
vi.mock('./components/habitat-form/draftStore', () => ({
  draftKey: (h: string) => `karta-${h}`,
  loadDraft: async (k: string) => store.get(k),
  saveDraft: async (k: string, values: CardValues) => void store.set(k, { values: structuredClone(values), savedAt: new Date().toISOString() }),
  deleteDraft: async (k: string) => void store.delete(k),
}))

const { Card7120 } = await import('./Card7120')
const FIELD = { selector: 'input, select, textarea' }
// happy-dom nie ma window.confirm
const mockConfirm = (answer?: boolean) => {
  const fn = vi.fn(() => answer ?? true)
  window.confirm = fn
  return fn
}

afterEach(() => {
  cleanup()
  store.clear()
  vi.restoreAllMocks()
})

describe('Card7120 – kopia robocza i potwierdzenia', () => {
  it('wpisane dane lądują w pamięci i wracają po ponownym otwarciu', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<Card7120 />)
    await user.type(screen.getByLabelText(/Nazwa stanowiska/, FIELD), 'Testowe bagno')
    await waitFor(() => expect(store.get('karta-7120')?.values.site.siteName).toBe('Testowe bagno'), { timeout: 2000 })
    unmount()
    render(<Card7120 />)
    expect(await screen.findByText(/Przywrócono kartę z pamięci urządzenia/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Nazwa stanowiska/, FIELD)).toHaveValue('Testowe bagno')
  })

  it('„Wyczyść” pyta o potwierdzenie; anulowanie zostawia dane, zgoda kasuje je także z pamięci', async () => {
    const user = userEvent.setup()
    render(<Card7120 />)
    const name = screen.getByLabelText(/Nazwa stanowiska/, FIELD)
    await user.type(name, 'Bagno')
    await waitFor(() => expect(store.has('karta-7120')).toBe(true), { timeout: 2000 })

    const confirm = mockConfirm(false)
    await user.click(screen.getByRole('button', { name: 'Wyczyść' }))
    expect(confirm).toHaveBeenCalledWith(expect.stringMatching(/Na pewno wyczyścić kartę/))
    expect(screen.getByLabelText(/Nazwa stanowiska/, FIELD)).toHaveValue('Bagno')

    confirm.mockImplementation(() => true)
    await user.click(screen.getByRole('button', { name: 'Wyczyść' }))
    expect(screen.getByLabelText(/Nazwa stanowiska/, FIELD)).toHaveValue('')
    await waitFor(() => expect(store.has('karta-7120')).toBe(false))
  })

  it('pusta karta: „Wyczyść” i przykłady nie pytają', async () => {
    const user = userEvent.setup()
    render(<Card7120 />)
    const confirm = mockConfirm()
    await user.click(screen.getByRole('button', { name: 'Wczytaj przykład: Reptowo 2' }))
    expect(confirm).not.toHaveBeenCalled()
  })

  it('cofnięcie (wstecz) z wpisanymi danymi pyta „czy na pewno chcesz się wycofać”', async () => {
    const user = userEvent.setup()
    render(<Card7120 />)
    await user.type(screen.getByLabelText(/Nazwa stanowiska/, FIELD), 'Bagno')
    const confirm = mockConfirm(false)
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(confirm).toHaveBeenCalledWith(expect.stringMatching(/Na pewno chcesz się wycofać/))
    expect(screen.getByLabelText(/Nazwa stanowiska/, FIELD)).toHaveValue('Bagno')
  })
})
