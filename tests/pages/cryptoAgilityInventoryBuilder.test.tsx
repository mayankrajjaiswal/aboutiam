import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import CryptoAgilityInventoryBuilder from '../../src/pages/Tools/CryptoAgilityInventoryBuilder'

describe('CryptoAgilityInventoryBuilder tool page', () => {
  it('renders the title and starts with one entry', () => {
    renderWithProviders(<CryptoAgilityInventoryBuilder />)
    expect(screen.getByRole('heading', { name: /crypto agility inventory builder/i })).toBeInTheDocument()
    expect(screen.getByText(/entry 1/i)).toBeInTheDocument()
  })

  it('adds a new entry when "Add Entry" is clicked', () => {
    renderWithProviders(<CryptoAgilityInventoryBuilder />)
    fireEvent.click(screen.getByRole('button', { name: /add entry/i }))
    expect(screen.getByText(/entry 2/i)).toBeInTheDocument()
  })

  it('removes an entry when its remove button is clicked', () => {
    renderWithProviders(<CryptoAgilityInventoryBuilder />)
    fireEvent.click(screen.getByRole('button', { name: /add entry/i }))
    expect(screen.getByText(/entry 2/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /remove entry 2/i }))
    expect(screen.queryByText(/entry 2/i)).not.toBeInTheDocument()
  })

  it('disables removing the last remaining entry', () => {
    renderWithProviders(<CryptoAgilityInventoryBuilder />)
    const removeButton = screen.getByRole('button', { name: /remove entry 1/i })
    expect(removeButton).toBeDisabled()
  })

  it('updates the migration backlog when a component name is entered', () => {
    renderWithProviders(<CryptoAgilityInventoryBuilder />)
    fireEvent.change(screen.getByLabelText(/^component$/i), { target: { value: 'Root CA' } })
    expect(screen.getAllByText('Root CA').length).toBeGreaterThan(0)
  })

  it('updates the summary counts when HNDL exposure is set to high', () => {
    renderWithProviders(<CryptoAgilityInventoryBuilder />)
    fireEvent.change(screen.getByLabelText(/hndl exposure/i), { target: { value: 'high' } })
    expect(screen.getByText('1', { selector: '.text-status-danger' })).toBeInTheDocument()
  })

  it('marks not-rotatable entries in the summary', () => {
    renderWithProviders(<CryptoAgilityInventoryBuilder />)
    fireEvent.change(screen.getByLabelText(/rotation capability/i), { target: { value: 'not-rotatable' } })
    expect(screen.getByText(/not rotatable/i)).toBeInTheDocument()
  })

  it('has no critical axe violations with default (single empty entry) state', async () => {
    const { container } = renderWithProviders(<CryptoAgilityInventoryBuilder />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no critical axe violations after adding entries and filling fields', async () => {
    const { container } = renderWithProviders(<CryptoAgilityInventoryBuilder />)
    fireEvent.click(screen.getByRole('button', { name: /add entry/i }))
    fireEvent.change(screen.getAllByLabelText(/^component$/i)[0], { target: { value: 'Root CA' } })
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
