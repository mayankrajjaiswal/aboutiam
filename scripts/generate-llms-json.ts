import { writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ENCYCLOPEDIA_TERMS } from '../src/data/encyclopediaData.ts'
import { STANDARDS } from '../src/data/standardsData.ts'
import { BULLETINS } from '../src/data/bulletinsData.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface IndexItem {
  id: string
  title: string
  desc: string
  type: string
  keywords: string[]
}

function generateIndexFeed(): IndexItem[] {
  const items: IndexItem[] = []

  STANDARDS.forEach(s => {
    items.push({
      id: `standard-${s.id}`,
      title: s.title,
      desc: s.summary,
      type: 'Standard',
      keywords: [s.category.toLowerCase(), ...s.vulnerabilities.map(v => v.toLowerCase())]
    })
  })

  ENCYCLOPEDIA_TERMS.forEach(t => {
    items.push({
      id: `term-${t.id || t.term.toLowerCase()}`,
      title: t.term,
      desc: t.analogy,
      type: 'GlossaryTerm',
      keywords: [t.category.toLowerCase()]
    })
  })

  BULLETINS.forEach(b => {
    items.push({
      id: `bulletin-${b.id}`,
      title: b.title,
      desc: b.description,
      type: 'IncidentBulletin',
      keywords: [b.category.toLowerCase(), b.vector.toLowerCase()]
    })
  })

  return items
}

try {
  const indexFeed = generateIndexFeed()
  const content = JSON.stringify(indexFeed, null, 2)
  
  const publicPath = join(__dirname, '../public/llms-index.json')
  writeFileSync(publicPath, content, 'utf8')
  console.log(`✓ llms-index.json generated successfully at: public/llms-index.json`)

  const distDir = join(__dirname, '../dist')
  if (existsSync(distDir)) {
    const distPath = join(distDir, 'llms-index.json')
    writeFileSync(distPath, content, 'utf8')
    console.log(`✓ llms-index.json copied to build output: dist/llms-index.json`)
  }
} catch (error) {
  console.error('💥 Failed to generate llms-index.json:', error)
  process.exit(1)
}
