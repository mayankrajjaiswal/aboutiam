import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import LdapSchemaDesigner from '../../src/pages/Playgrounds/LdapSchemaDesigner'

describe('LdapSchemaDesigner page', () => {
  it('renders the heading and a default Offices OU', () => {
    renderWithProviders(<LdapSchemaDesigner />)
    expect(screen.getByRole('heading', { name: /ad\/ldap ou & schema designer/i })).toBeInTheDocument()
    expect(screen.getByText('Offices')).toBeInTheDocument()
  })

  it('adding a child OU under the selected node inserts it into the tree', () => {
    renderWithProviders(<LdapSchemaDesigner />)
    fireEvent.click(screen.getByRole('button', { name: /add child ou/i }))
    expect(screen.getByText('OU-2')).toBeInTheDocument()
  })

  it('applying a GPO to a parent OU cascades to a child OU', () => {
    renderWithProviders(<LdapSchemaDesigner />)
    // Select the root "Offices" OU (auto-selected by default is root; click Offices explicitly)
    fireEvent.click(screen.getByText('Offices'))
    fireEvent.click(screen.getByRole('button', { name: /add child ou/i }))
    fireEvent.click(screen.getByText('Offices'))

    const gpoSelect = screen.getByLabelText(/linked gpo/i)
    fireEvent.change(gpoSelect, { target: { value: 'Baseline Security Policy' } })

    // Select the newly created child OU and verify the GPO cascaded
    fireEvent.click(screen.getByText('OU-2'))
    expect(screen.getByText(/effective gpos: baseline security policy/i)).toBeInTheDocument()
  })

  it('blocking inheritance at a child stops the parent GPO from cascading', () => {
    renderWithProviders(<LdapSchemaDesigner />)
    fireEvent.click(screen.getByText('Offices'))
    fireEvent.click(screen.getByRole('button', { name: /add child ou/i }))
    fireEvent.click(screen.getByText('Offices'))
    fireEvent.change(screen.getByLabelText(/linked gpo/i), { target: { value: 'Baseline Security Policy' } })

    fireEvent.click(screen.getByText('OU-2'))
    fireEvent.click(screen.getByRole('checkbox', { name: /block gpo inheritance/i }))
    expect(screen.getByText(/effective gpos: none/i)).toBeInTheDocument()
  })
})
