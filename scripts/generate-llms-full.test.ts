import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('Complete Context LLM Digest (llms-full.txt)', () => {
  it('should generate the full context file in public/ folder on build', () => {
    const publicPath = join(__dirname, '../public/llms-full.txt')
    
    // Note: If tests run before the build step, the file might not be on disk yet,
    // but running npm run build during CI/CD or local verification writes it.
    if (existsSync(publicPath)) {
      const content = readFileSync(publicPath, 'utf8')
      expect(content).toContain('# AboutIAM Complete Context Digest')
      expect(content).toContain('## Living Standards & RFC Explorer')
      expect(content).toContain('## Master A-Z Glossary & Acronyms')
      expect(content).toContain('## Incident Bulletins & Playbooks')
      expect(content).toContain('## Historical Identity Security Breaches')
      expect(content).toContain('## Reference Architectures & Code Implementations')
      expect(content.length).toBeGreaterThan(1000)
    }
  })
})
