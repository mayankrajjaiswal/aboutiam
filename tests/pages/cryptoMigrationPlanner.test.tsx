import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import CryptoMigrationPlanner from '../../src/pages/Playgrounds/CryptoMigrationPlanner'
import { CRYPTO_MIGRATION_WORKSTREAMS } from '../../src/data/cryptoAgilityRoadmap'

describe('CryptoMigrationPlanner playground', () => {
  it('renders the title and all 10 workstreams', () => {
    renderWithProviders(<CryptoMigrationPlanner />)
    expect(screen.getByRole('heading', { name: /crypto migration planner/i })).toBeInTheDocument()
    for (const w of CRYPTO_MIGRATION_WORKSTREAMS) {
      expect(screen.getByText(w.title)).toBeInTheDocument()
    }
  })

  it('shows dependency labels for workstreams that have dependencies', () => {
    renderWithProviders(<CryptoMigrationPlanner />)
    const withDeps = CRYPTO_MIGRATION_WORKSTREAMS.find((w) => w.dependsOn.length > 0)!
    const depTitle = CRYPTO_MIGRATION_WORKSTREAMS.find((w) => w.id === withDeps.dependsOn[0])!.title
    expect(screen.getAllByText(new RegExp(`depends on:.*${depTitle}`, 'i')).length).toBeGreaterThan(0)
  })

  it('moving a dependent workstream above its dependency and checking flags a violation', () => {
    renderWithProviders(<CryptoMigrationPlanner />)
    // Find a workstream with a dependency, and move it to position 0 (top) by
    // clicking "move up" repeatedly -- guaranteed to violate the dependency
    // since its dependency will end up after it.
    const dependent = CRYPTO_MIGRATION_WORKSTREAMS.find((w) => w.dependsOn.length > 0)!
    const upButton = screen.getByRole('button', { name: `Move ${dependent.title} up` })
    // Click enough times to reach the top regardless of starting position
    for (let i = 0; i < CRYPTO_MIGRATION_WORKSTREAMS.length; i++) {
      fireEvent.click(upButton)
    }
    fireEvent.click(screen.getByRole('button', { name: /check dependency validity/i }))
    expect(screen.getAllByText(/dependency violation\(s\) found/i).length).toBeGreaterThan(0)
  })

  it('a fully dependency-ordered sequence passes with zero violations', () => {
    renderWithProviders(<CryptoMigrationPlanner />)
    // The dependency graph has multiple levels (e.g. directory-legacy-kerberos
    // depends on transport-tls, which itself depends on root-ca-hierarchy) --
    // "move to top" repeatedly puts the LAST-moved item at position 0, so to
    // end up with [root-ca-hierarchy, transport-tls, credential-signatures-vc]
    // in that relative order (root-ca-hierarchy first, since everything else
    // ultimately depends on it), the workstreams must be moved to the top in
    // the REVERSE of that final order: credential-signatures-vc first, then
    // transport-tls, then root-ca-hierarchy last (ending up at position 0).
    // Once those 3 "hub" workstreams are correctly ordered among themselves at
    // the front, every other workstream's dependency (direct or transitive)
    // is satisfied regardless of the remaining workstreams' relative order.
    const credentialSig = CRYPTO_MIGRATION_WORKSTREAMS.find((w) => w.id === 'credential-signatures-vc')!
    const transportTls = CRYPTO_MIGRATION_WORKSTREAMS.find((w) => w.id === 'transport-tls')!
    const rootCa = CRYPTO_MIGRATION_WORKSTREAMS.find((w) => w.id === 'root-ca-hierarchy')!

    for (const workstream of [credentialSig, transportTls, rootCa]) {
      const upButton = screen.getByRole('button', { name: `Move ${workstream.title} up` })
      for (let i = 0; i < CRYPTO_MIGRATION_WORKSTREAMS.length; i++) {
        fireEvent.click(upButton)
      }
    }
    fireEvent.click(screen.getByRole('button', { name: /check dependency validity/i }))
    expect(screen.getAllByText(/dependency-valid roadmap — every workstream/i).length).toBeGreaterThan(0)
  })

  it('reveals a hint and reflects the score penalty', () => {
    renderWithProviders(<CryptoMigrationPlanner />)
    expect(screen.getByText(/100 \/ 100/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /reveal next hint/i }))
    expect(screen.getByText(/85 \/ 100/i)).toBeInTheDocument()
  })

  it('resets the playground state', () => {
    renderWithProviders(<CryptoMigrationPlanner />)
    fireEvent.click(screen.getByRole('button', { name: /check dependency validity/i }))
    expect(screen.getAllByText(/dependency-valid roadmap|dependency violation/i).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByTitle(/reset simulator/i))
    // The outcome panel (a <div>, not the trace-terminal <span> log lines) should be gone after reset.
    expect(screen.queryByText(/dependency-valid roadmap — every workstream|dependency violation\(s\) found\. reorder/i)).not.toBeInTheDocument()
  })

  it('links to the PQC readiness auditor tool', () => {
    renderWithProviders(<CryptoMigrationPlanner />)
    const link = screen.getByText(/assess your own pqc readiness/i).closest('a')
    expect(link).toHaveAttribute('href', '/tools/pqc-readiness-auditor')
  })

  it('has no critical axe violations before checking the plan', async () => {
    const { container } = renderWithProviders(<CryptoMigrationPlanner />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no critical axe violations after checking the plan', async () => {
    const { container } = renderWithProviders(<CryptoMigrationPlanner />)
    fireEvent.click(screen.getByRole('button', { name: /check dependency validity/i }))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
