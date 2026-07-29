import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import IdentityFabricBuilder from '../../src/pages/Playgrounds/IdentityFabricBuilder'
import { IDENTITY_FABRIC_SCENARIOS } from '../../src/data/identityFabricScenarios'

const scenario = IDENTITY_FABRIC_SCENARIOS[0]

describe('IdentityFabricBuilder page', () => {
  it('renders the heading and the default scenario nodes', () => {
    renderWithProviders(<IdentityFabricBuilder />)
    expect(screen.getByRole('heading', { name: /identity fabric.*orchestration flow builder/i })).toBeInTheDocument()
    expect(screen.getByText(scenario.appName)).toBeInTheDocument()
    expect(screen.getByText(scenario.idpName)).toBeInTheDocument()
  })

  it('wiring App directly to IdP fails with a clear error and no translation log', () => {
    renderWithProviders(<IdentityFabricBuilder />)
    fireEvent.click(screen.getByText(scenario.appName))
    fireEvent.click(screen.getByText(scenario.idpName))
    expect(screen.getByText(/orchestration node is required/i)).toBeInTheDocument()
    expect(screen.queryByText(/translation steps/i)).not.toBeInTheDocument()
  })

  it('wiring App→Orchestration→IdP succeeds and shows every translation step in order', () => {
    renderWithProviders(<IdentityFabricBuilder />)
    fireEvent.click(screen.getByText(scenario.appName))
    fireEvent.click(screen.getByText('Orchestration Node'))
    fireEvent.click(screen.getByText('Orchestration Node'))
    fireEvent.click(screen.getByText(scenario.idpName))

    expect(screen.getByText(/wiring complete/i)).toBeInTheDocument()
    const listItems = screen.getAllByRole('listitem')
    expect(listItems.map((li) => li.textContent)).toEqual(scenario.translationSteps)
  })

  it('switching scenarios resets the wiring', () => {
    renderWithProviders(<IdentityFabricBuilder />)
    fireEvent.click(screen.getByText(scenario.appName))
    fireEvent.click(screen.getByText('Orchestration Node'))

    const otherScenario = IDENTITY_FABRIC_SCENARIOS[1]
    fireEvent.change(screen.getByLabelText(/scenario/i), { target: { value: otherScenario.id } })
    expect(screen.getByText(/none yet/i)).toBeInTheDocument()
  })
})
