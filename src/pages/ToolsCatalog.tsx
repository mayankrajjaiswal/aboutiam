import { Wrench } from 'lucide-react'
import PrivacyNotice from '../components/Tools/PrivacyNotice'
import ToolCard from '../components/Tools/ToolCard'
import { getToolsByCategory } from '../data/toolsRegistry'

export default function ToolsCatalog() {
  const categories = getToolsByCategory()
  const liveCount = categories.reduce((sum, c) => sum + c.tools.filter((t) => t.status === 'live').length, 0)
  const totalCount = categories.reduce((sum, c) => sum + c.tools.length, 0)

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Wrench className="w-3.5 h-3.5" /> Security Tools
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Client-Side IAM & Security Tools
        </h2>
        <p className="text-text-secondary">
          {totalCount} free identity and security utilities — JWT, SAML, X.509, bcrypt, TOTP, PKCE, and more ({liveCount} live so far). Every tool runs entirely in your browser: no signup, no uploads, nothing leaves your device.
        </p>
      </div>

      <PrivacyNotice />

      {categories.map(({ category, tools }) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            {category}
            <span className="text-xs font-semibold text-text-muted bg-bg-sidebar px-2 py-0.5 rounded-full border border-border-subtle">
              {tools.length}
            </span>
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
