import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import HrAttributeMapper from '../../src/pages/Playgrounds/HrAttributeMapper'

describe('HrAttributeMapper page', () => {
  it('renders the heading and shows missing-required warnings by default', () => {
    renderWithProviders(<HrAttributeMapper />)
    expect(screen.getByRole('heading', { name: /hr-to-idp attribute mapper/i })).toBeInTheDocument()
    expect(screen.getByText(/missing required mapping/i)).toBeInTheDocument()
  })

  it('clicking an HR field then a target attribute connects them and updates the live preview', () => {
    renderWithProviders(<HrAttributeMapper />)
    fireEvent.click(screen.getByRole('button', { name: 'Legal_First_Name' }))
    fireEvent.click(screen.getByRole('button', { name: 'givenName*' }))
    expect(screen.getAllByText('Priya').length).toBeGreaterThan(0)
  })

  it('connecting two fields to one target without concat flags an ambiguous-mapping warning', () => {
    renderWithProviders(<HrAttributeMapper />)
    fireEvent.click(screen.getByRole('button', { name: 'Legal_First_Name' }))
    fireEvent.click(screen.getByRole('button', { name: 'givenName*' }))
    fireEvent.click(screen.getByRole('button', { name: 'Legal_Last_Name' }))
    fireEvent.click(screen.getByRole('button', { name: 'givenName*' }))
    expect(screen.getByText(/ambiguous mapping/i)).toBeInTheDocument()
  })

  it('switching that target\'s transform to Concatenate resolves the ambiguous-mapping warning', () => {
    renderWithProviders(<HrAttributeMapper />)
    fireEvent.click(screen.getByRole('button', { name: 'Legal_First_Name' }))
    fireEvent.click(screen.getByRole('button', { name: 'givenName*' }))
    fireEvent.click(screen.getByRole('button', { name: 'Legal_Last_Name' }))
    fireEvent.click(screen.getByRole('button', { name: 'givenName*' }))

    const transformSelect = screen.getByLabelText(/transform for givenname/i)
    fireEvent.change(transformSelect, { target: { value: 'concat' } })

    expect(screen.queryByText(/ambiguous mapping/i)).not.toBeInTheDocument()
    expect(screen.getAllByText('Priya Sharma').length).toBeGreaterThan(0)
  })

  it('switching scenarios resets connections and shows the new scenario\'s HR fields', () => {
    renderWithProviders(<HrAttributeMapper />)
    fireEvent.click(screen.getByRole('button', { name: 'Legal_First_Name' }))
    fireEvent.click(screen.getByRole('button', { name: 'givenName*' }))

    fireEvent.change(screen.getByLabelText(/hr system scenario/i), { target: { value: 'sap-ad' } })
    expect(screen.getByRole('button', { name: 'Vorname' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Legal_First_Name' })).not.toBeInTheDocument()
  })
})
