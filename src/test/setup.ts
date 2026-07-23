import '@testing-library/jest-dom/vitest'
import { webcrypto } from 'node:crypto'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// jsdom ships window.crypto.getRandomValues but not crypto.subtle (Web Crypto's
// async digest/sign/derive API) — several tool pages call it eagerly on mount
// (key generation, hashing) rather than only from a click handler, so without
// this polyfill any such page would throw the moment it's rendered in a test.
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: true,
    configurable: true,
  })
}

// jsdom doesn't implement Element.scrollIntoView at all (by design — it has no
// layout engine) — several chat/log-style pages (e.g. Assistant.tsx) call it
// on every new message to auto-scroll, which would otherwise throw on mount.
if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

// themeStore reads window.matchMedia to detect the OS-level light/dark
// preference — jsdom doesn't implement it at all.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as MediaQueryList
}

// Every persisted Zustand store (theme, bookmarks, preferences, tour,
// disclaimer, layout, airplane mode — see GEMINI §3B/§4M/§4N) rehydrates from
// localStorage on import. Without a reset, one test file's "seen the tour" /
// "dark mode" / bookmark state leaks into the next test file's fresh render.
afterEach(() => {
  cleanup()
  window.localStorage.clear()
})
