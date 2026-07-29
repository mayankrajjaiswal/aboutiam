// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import ReadAloudButton from './ReadAloudButton'

describe('ReadAloudButton', () => {
  describe('when speechSynthesis is unavailable', () => {
    it('renders nothing', () => {
      const original = (window as unknown as { speechSynthesis?: unknown }).speechSynthesis
      // @ts-expect-error simulate a browser without SpeechSynthesis support
      delete window.speechSynthesis
      const { container } = render(<ReadAloudButton text="Hello world" />)
      expect(container).toBeEmptyDOMElement()
      ;(window as unknown as { speechSynthesis?: unknown }).speechSynthesis = original
    })
  })

  describe('when speechSynthesis is available', () => {
    let speakMock: ReturnType<typeof vi.fn>
    let cancelMock: ReturnType<typeof vi.fn>
    let lastUtterance: SpeechSynthesisUtterance | undefined

    beforeEach(() => {
      speakMock = vi.fn((utterance: SpeechSynthesisUtterance) => {
        lastUtterance = utterance
      })
      cancelMock = vi.fn()
      Object.defineProperty(window, 'speechSynthesis', {
        value: { speak: speakMock, cancel: cancelMock },
        writable: true,
        configurable: true,
      })
      global.SpeechSynthesisUtterance = function (text: string) {
        return { text, onend: null, onerror: null }
      } as unknown as typeof SpeechSynthesisUtterance
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('renders a "Listen" button', () => {
      render(<ReadAloudButton text="JWT is a compact token format." />)
      expect(screen.getByRole('button', { name: /listen/i })).toBeInTheDocument()
    })

    it('calls speak with the correct text on click', () => {
      render(<ReadAloudButton text="JWT is a compact token format." />)
      fireEvent.click(screen.getByRole('button', { name: /listen/i }))
      expect(speakMock).toHaveBeenCalledOnce()
      expect(lastUtterance?.text).toBe('JWT is a compact token format.')
    })

    it('switches to a "Stop" button while speaking', () => {
      render(<ReadAloudButton text="Some text" />)
      fireEvent.click(screen.getByRole('button', { name: /listen/i }))
      expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
    })

    it('clicking "Stop" cancels speech and reverts to "Listen"', () => {
      render(<ReadAloudButton text="Some text" />)
      fireEvent.click(screen.getByRole('button', { name: /listen/i }))
      fireEvent.click(screen.getByRole('button', { name: /stop/i }))
      expect(cancelMock).toHaveBeenCalled()
      expect(screen.getByRole('button', { name: /listen/i })).toBeInTheDocument()
    })

    it('cancels any in-progress speech before starting a new utterance', () => {
      render(<ReadAloudButton text="Some text" />)
      fireEvent.click(screen.getByRole('button', { name: /listen/i }))
      expect(cancelMock).toHaveBeenCalled()
    })

    it('cancels speech on unmount', () => {
      const { unmount } = render(<ReadAloudButton text="Some text" />)
      unmount()
      expect(cancelMock).toHaveBeenCalled()
    })

    it('reverts to "Listen" when the utterance ends naturally', () => {
      render(<ReadAloudButton text="Some text" />)
      fireEvent.click(screen.getByRole('button', { name: /listen/i }))
      act(() => {
        lastUtterance?.onend?.(new Event('end') as never)
      })
      expect(screen.getByRole('button', { name: /listen/i })).toBeInTheDocument()
    })
  })
})
