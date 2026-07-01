import { useLocation } from 'react-router-dom'
import { Menu, Sun, Moon, Laptop } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'
import { useLayoutStore } from '../../store/layoutStore'

export default function Header() {
  const location = useLocation()
  const { theme, setTheme } = useThemeStore()
  const { toggleMobileSidebar } = useLayoutStore()

  // Get human-friendly page title from route
  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/') return 'Overview Dashboard'
    if (path.startsWith('/learn')) return 'IAM Academy Curriculum'
    if (path === '/playground') return 'Simulators & Playgrounds'
    if (path === '/playground/jwt') return 'JWT Studio & Exploit Arena'
    if (path === '/playground/oauth') return 'OAuth 2.0 / OIDC Handshake Visualizer'
    if (path === '/encyclopedia') return 'Master IAM Glossary'
    if (path === '/wall-of-shame') return 'Vulnerability Lab'
    if (path === '/cheat-sheets') return 'Developer Playbooks'
    if (path === '/assess') return 'GRC Maturity Assessments'
    if (path === '/explore') return 'IAM Landscape Directory'
    if (path === '/assistant') return 'AI IAM Architect Chat'
    return 'AboutIAM Secure Workspace'
  }

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  const renderThemeIcon = () => {
    if (theme === 'light') return <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
    if (theme === 'dark') return <Moon className="w-4 h-4 text-accent-primary" />
    return <Laptop className="w-4 h-4 text-text-secondary" />
  }

  const getThemeLabel = () => {
    if (theme === 'light') return 'Light'
    if (theme === 'dark') return 'Dark'
    return 'System'
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-bg-card border-b border-border-subtle fixed top-0 right-0 left-0 lg:left-64 z-30 transition-all">
      {/* Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileSidebar}
          className="p-1.5 rounded-lg text-text-secondary hover:bg-bg-sidebar hover:text-text-primary transition-colors focus:outline-none lg:hidden"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm font-bold text-text-primary tracking-wide">
          {getPageTitle()}
        </span>
      </div>

      {/* Persistent Theme and Repo Controls */}
      <div className="flex items-center gap-3">
        {/* Theme Cycling Selector */}
        <button
          onClick={cycleTheme}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-sidebar hover:bg-bg-nested text-text-secondary hover:text-text-primary text-xs font-semibold transition-colors focus:outline-none"
          title="Cycle appearance theme (Light -> Dark -> System)"
        >
          {renderThemeIcon()}
          <span className="hidden sm:inline">{getThemeLabel()}</span>
        </button>

        {/* GitHub Repository Reference Link */}
        <a
          href="https://github.com/mayankrajjaiswal/aboutiam"
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-lg border border-border-subtle bg-bg-sidebar hover:bg-bg-nested text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
          title="Browse on GitHub"
        >
          <svg className="w-4 h-4 fill-current text-text-secondary hover:text-text-primary" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
        </a>
      </div>
    </header>
  )
}
