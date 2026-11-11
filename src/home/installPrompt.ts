// Instalacja PWA. Chrome/Edge/Samsung Internet wysyłają `beforeinstallprompt` raz, zwykle zanim React cokolwiek wyrenderuje –
// dlatego łapiemy go już przy imporcie modułu i trzymamy do chwili, aż ktoś kliknie „Zainstaluj”.
// Firefox i Safari tego zdarzenia nie mają: tam zostaje instrukcja ręczna.
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: BeforeInstallPromptEvent | null = null
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault() // bez tego Chrome pokazuje własny pasek w losowym momencie
    deferred = e as BeforeInstallPromptEvent
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    notify()
  })
}

export type Platform = 'ios' | 'android-firefox' | 'android' | 'desktop'

export function detectPlatform(ua = typeof navigator === 'undefined' ? '' : navigator.userAgent): Platform {
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1)) return 'ios'
  if (/Android/i.test(ua)) return /Firefox/i.test(ua) ? 'android-firefox' : 'android'
  return 'desktop'
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = navigator as Navigator & { standalone?: boolean }
  return Boolean(window.matchMedia?.('(display-mode: standalone)').matches || nav.standalone)
}

export function useInstallPrompt() {
  const [, rerender] = useState(0)
  useEffect(() => {
    const l = () => rerender((n) => n + 1)
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  }, [])
  const install = async () => {
    if (!deferred) return 'unavailable' as const
    const e = deferred
    await e.prompt()
    const { outcome } = await e.userChoice
    deferred = null
    notify()
    return outcome
  }
  return { canPrompt: deferred !== null, install, installed: isStandalone() }
}
