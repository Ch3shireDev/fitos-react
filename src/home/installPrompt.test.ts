import { describe, expect, it } from 'vitest'
import { detectPlatform } from './installPrompt'

describe('detectPlatform – która instrukcja instalacji', () => {
  it('rozpoznaje Firefoksa na Androidzie, Chrome na Androidzie, iPhone’a i komputer', () => {
    expect(detectPlatform('Mozilla/5.0 (Android 14; Mobile; rv:132.0) Gecko/132.0 Firefox/132.0')).toBe('android-firefox')
    expect(detectPlatform('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36')).toBe('android')
    expect(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1')).toBe('ios')
    expect(detectPlatform('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36')).toBe('desktop')
  })
})
