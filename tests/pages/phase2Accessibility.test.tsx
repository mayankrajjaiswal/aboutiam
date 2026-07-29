import { describe, it, expect } from 'vitest'
import { axe } from 'jest-axe'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import LdapSchemaDesigner from '../../src/pages/Playgrounds/LdapSchemaDesigner'
import HrAttributeMapper from '../../src/pages/Playgrounds/HrAttributeMapper'
import CiemExplorer from '../../src/pages/Playgrounds/CiemExplorer'
import IdentityFabricBuilder from '../../src/pages/Playgrounds/IdentityFabricBuilder'
import OtIcsIdentityLab from '../../src/pages/Playgrounds/OtIcsIdentityLab'
import TrustRegistryExplorer from '../../src/pages/Playgrounds/TrustRegistryExplorer'
import LegacyFederationLab from '../../src/pages/Playgrounds/LegacyFederationLab'
import LivenessInjectionLab from '../../src/pages/Playgrounds/LivenessInjectionLab'

// B11 accessibility sweep (GEMINI.md §4AA note): the newest, most complex
// interactive click/drag-free builders and playgrounds shipped in this Phase
// 2 pass, each asserted zero critical axe-core violations. This is what
// caught PlaygroundShell.tsx's shared h1->h3 heading-order skip (fixed in
// the same commit) affecting every playground built on the shell.
const PLAYGROUNDS = [
  ['LdapSchemaDesigner', LdapSchemaDesigner],
  ['HrAttributeMapper', HrAttributeMapper],
  ['CiemExplorer', CiemExplorer],
  ['IdentityFabricBuilder', IdentityFabricBuilder],
  ['OtIcsIdentityLab', OtIcsIdentityLab],
  ['TrustRegistryExplorer', TrustRegistryExplorer],
  ['LegacyFederationLab', LegacyFederationLab],
  ['LivenessInjectionLab', LivenessInjectionLab],
] as const

describe('Phase 2 playground accessibility sweep (B11)', () => {
  for (const [name, Component] of PLAYGROUNDS) {
    it(`${name} has no critical axe violations`, async () => {
      const { container } = renderWithProviders(<Component />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  }
})
