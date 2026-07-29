import { describe, it, expect, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import JwtDecoder from '../../src/pages/Tools/JwtDecoder'

const RS256_LOOKING_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZWVwLWxpbmstdGVzdCJ9.sig'

describe('JwtDecoder page', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('populates the decoder from a ?token= deep-link query param', async () => {
    window.history.pushState({}, '', `/tools/jwt-decoder?token=${RS256_LOOKING_TOKEN}`)
    renderWithProviders(<JwtDecoder />)

    await waitFor(() => {
      expect(screen.getByLabelText(/jwt to decode/i)).toHaveValue(RS256_LOOKING_TOKEN)
    })
    expect(screen.getByText(/"sub": "deep-link-test"/i)).toBeInTheDocument()
  })

  it('falls back to the built-in sample token when no ?token= param is present', () => {
    renderWithProviders(<JwtDecoder />)
    const textarea = screen.getByLabelText(/jwt to decode/i) as HTMLTextAreaElement
    expect(textarea.value.length).toBeGreaterThan(0)
    expect(textarea.value).not.toBe(RS256_LOOKING_TOKEN)
  })
})
