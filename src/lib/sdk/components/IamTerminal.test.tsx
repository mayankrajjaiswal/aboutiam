import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../../test/renderWithProviders'
import { IamTerminal } from './IamTerminal'

describe('IamTerminal', () => {
  it('renders welcome lines and the prompt input', () => {
    renderWithProviders(<IamTerminal welcomeLines={['Type "help" to get started.']} />)
    expect(screen.getByText('Type "help" to get started.')).toBeInTheDocument()
    expect(screen.getByLabelText(/terminal command input/i)).toBeInTheDocument()
  })

  it('running a supported command echoes it and shows its output', async () => {
    renderWithProviders(<IamTerminal />)
    const input = screen.getByLabelText(/terminal command input/i)
    fireEvent.change(input, { target: { value: 'help' } })
    fireEvent.submit(input.closest('form')!)

    await waitFor(() => {
      expect(screen.getAllByText(/help/).length).toBeGreaterThan(0)
      expect(screen.getByText(/openssl x509/i)).toBeInTheDocument()
    })
  })

  it('an unsupported command shows a "command not found" error rather than crashing', async () => {
    renderWithProviders(<IamTerminal />)
    const input = screen.getByLabelText(/terminal command input/i)
    fireEvent.change(input, { target: { value: 'sudo rm -rf /' } })
    fireEvent.submit(input.closest('form')!)

    await waitFor(() => {
      expect(screen.getByText(/command not found/i)).toBeInTheDocument()
    })
  })

  it('"clear" empties the scrollback', async () => {
    renderWithProviders(<IamTerminal />)
    const input = screen.getByLabelText(/terminal command input/i)
    fireEvent.change(input, { target: { value: 'help' } })
    fireEvent.submit(input.closest('form')!)
    await waitFor(() => expect(screen.getByText(/openssl x509/i)).toBeInTheDocument())

    fireEvent.change(input, { target: { value: 'clear' } })
    fireEvent.submit(input.closest('form')!)
    await waitFor(() => expect(screen.queryByText(/openssl x509/i)).not.toBeInTheDocument())
  })

  it('pressing ArrowUp recalls the previous command into the input', async () => {
    renderWithProviders(<IamTerminal />)
    const input = screen.getByLabelText(/terminal command input/i) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'help' } })
    fireEvent.submit(input.closest('form')!)
    await waitFor(() => expect(screen.getByText(/openssl x509/i)).toBeInTheDocument())

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(input.value).toBe('help')
  })
})
