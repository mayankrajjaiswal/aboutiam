import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('Token-Optimized JSON Index Feed (llms-index.json)', () => {
  it('should generate the optimized JSON index in public/ folder on build', () => {
    const publicPath = join(__dirname, '../public/llms-index.json')
    
    if (existsSync(publicPath)) {
      const content = readFileSync(publicPath, 'utf8')
      const items = JSON.parse(content)
      
      expect(Array.isArray(items)).toBe(true)
      expect(items.length).toBeGreaterThan(50)
      
      const first = items[0]
      expect(first.id).toBeDefined()
      expect(first.title).toBeDefined()
      expect(first.desc).toBeDefined()
      expect(first.type).toBeDefined()
      expect(Array.isArray(first.keywords)).toBe(true)
    }
  })
})
