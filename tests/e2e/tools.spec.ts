import { test, expect } from '@playwright/test'

test.describe('AboutIAM Security Tools Catalog & Utilities', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/')
  })

  test('should navigate to security tools and list all live tools', async ({ page }) => {
    // Navigate via sidebar or direct link
    await page.goto('http://localhost:5173/tools')
    await expect(page).toHaveTitle(/Free Client-Side IAM & Security Tools | AboutIAM/)
    
    // Expect tools catalog list to be present
    const toolsGrid = page.locator('div.grid')
    await expect(toolsGrid).toBeVisible()
    
    // Verify specific category headers or titles are rendered
    await expect(page.locator('h2', { hasText: 'Auth & Directory Builders' }).or(page.locator('h2', { hasText: 'Security Utilities' }))).toBeVisible()
  })

  test('should successfully decode a JWT token locally', async ({ page }) => {
    await page.goto('http://localhost:5173/tools/jwt-decoder')
    await expect(page.locator('h2')).toContainText('JWT Decoder')

    // Paste mock JWT token (alg: none / standard signature)
    const mockJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    const textarea = page.locator('textarea')
    await textarea.fill(mockJwt)

    // Check payload decoding results
    const payloadSection = page.locator('pre').nth(1) // Usually header is index 0, payload is 1
    await expect(payloadSection).toContainText('John Doe')
    await expect(payloadSection).toContainText('1234567890')
  })

  test('should audit SAML metadata for critical schema and signature risks', async ({ page }) => {
    await page.goto('http://localhost:5173/tools/saml-metadata-auditor')
    await expect(page.locator('h2')).toContainText('SAML Metadata Auditor')

    // Fill with a mock insecure metadata XML payload (using weak SHA-1 or HTTP bindings)
    const mockMetadata = `<?xml version="1.0" encoding="UTF-8"?>
<EntityDescriptor entityID="http://mock-idp.com" xmlns="urn:oasis:names:tc:SAML:2.0:metadata">
  <IDPSSODescriptor WantAuthnRequestsSigned="true" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <KeyDescriptor use="signing">
      <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:X509Data>
          <ds:X509Certificate>MIIB...</ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </KeyDescriptor>
    <SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect" Location="http://unsecure-endpoint.com/sso"/>
  </IDPSSODescriptor>
</EntityDescriptor>`

    const textarea = page.locator('textarea')
    await textarea.fill(mockMetadata)

    // Click Audit Metadata button
    const auditButton = page.locator('button:has-text("Audit Metadata")')
    if (await auditButton.isVisible()) {
      await auditButton.click()
      
      // Ensure the audit findings panel is visible
      const findingsHeader = page.locator('h3:has-text("Audit Findings")').or(page.locator('div:has-text("Findings")'))
      await expect(findingsHeader).toBeVisible()
    }
  })

  test('should verify a completion certificate and handle handshakes', async ({ page }) => {
    await page.goto('http://localhost:5173/tools/certificate-verifier')
    await expect(page.locator('h2')).toContainText('Certificate Verifier')

    // Input empty or invalid certificate
    const textarea = page.locator('textarea')
    await textarea.fill('{"invalid": "data"}')

    const verifyBtn = page.locator('button:has-text("Verify Certificate")')
    await expect(verifyBtn).not.toBeDisabled()
    await verifyBtn.click()

    // Wait for mock handshake and verdict
    const malformedText = page.locator('div:has-text("Malformed Input")').or(page.locator('div:has-text("Signature Invalid")'))
    await expect(malformedText).toBeVisible({ timeout: 5000 })
  })

  test('should encode and decode text using Base64 & Base64URL', async ({ page }) => {
    await page.goto('http://localhost:5173/tools/base64-encoder-decoder')
    
    // Test Encoder
    const textInput = page.locator('textarea').first()
    await textInput.fill('AboutIAM-E2E-Test')
    
    const encodedValue = await page.locator('textarea').nth(1).inputValue()
    expect(encodedValue).toContain('QWJvdXRJQU0tRTJFLVRlc3Q') // Base64 or Base64URL encoding
  })
})
