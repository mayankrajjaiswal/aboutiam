import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu, Sun, Moon, Laptop, PanelLeftClose, PanelLeftOpen, Search, Plane } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'
import { useLayoutStore } from '../../store/layoutStore'
import { getRouteMeta } from '../../routeMeta'
import CommandPalette from '../Search/CommandPalette'
import { useAirplaneModeStore } from '../../store/airplaneModeStore'
import AirplaneSelector from '../Search/AirplaneSelector'

const SITE_URL = 'https://www.aboutiam.com'

function setMetaContent(selector: string, content: string) {
  document.querySelector(selector)?.setAttribute('content', content)
}

function buildBreadcrumbJsonLd(pathname: string, pageTitle: string) {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length < 2) return null

  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${SITE_URL}/`,
    },
  ]

  let currentPath = ''
  for (let i = 0; i < parts.length; i++) {
    currentPath += `/${parts[i]}`
    const isLast = i === parts.length - 1

    let name: string
    if (parts[i] === 'tools') {
      name = 'Security Tools'
    } else if (parts[i] === 'playground') {
      name = 'Playgrounds'
    } else if (parts[i] === 'explore') {
      name = 'Explore'
    } else if (isLast) {
      name = pageTitle.split(' — ')[0].split(' | ')[0]
    } else {
      name = parts[i].charAt(0).toUpperCase() + parts[i].slice(1)
    }

    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name,
      item: `${SITE_URL}${currentPath}/`,
    })
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
}

export default function Header() {
  const location = useLocation()
  const { theme, setTheme } = useThemeStore()
  const { toggleMobileSidebar, isDesktopSidebarCollapsed, toggleDesktopSidebarCollapsed } = useLayoutStore()

  const pageMeta = getRouteMeta(location.pathname)
  const isHome = location.pathname === '/'

  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAirplaneOpen, setIsAirplaneOpen] = useState(false)
  const { isEnabled: isAirplaneEnabled } = useAirplaneModeStore()

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsSearchOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  useEffect(() => {
    // location.pathname already carries a trailing slash for every real
    // route — strip it before re-appending one, or this produces a
    // double-slash canonical URL (e.g. ".../playground/jwt//").
    const normalizedPath = location.pathname.length > 1 ? location.pathname.replace(/\/+$/, '') : ''
    const canonicalUrl = `${SITE_URL}${normalizedPath}/`
    document.title = isHome ? 'AboutIAM | The Interactive Identity Workspace' : `${pageMeta.title} | AboutIAM`

    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl)
    setMetaContent('meta[name="description"]', pageMeta.description)
    setMetaContent('meta[property="og:url"]', canonicalUrl)
    setMetaContent('meta[property="og:title"]', document.title)
    setMetaContent('meta[property="og:description"]', pageMeta.description)
    setMetaContent('meta[name="twitter:title"]', document.title)
    setMetaContent('meta[name="twitter:description"]', pageMeta.description)
  }, [isHome, location.pathname, pageMeta])

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

  const breadcrumbJsonLd = buildBreadcrumbJsonLd(location.pathname, pageMeta.title)

  return (
    <header className={`h-16 flex items-center justify-between px-6 bg-bg-card border-b border-border-subtle fixed top-0 right-0 left-0 z-30 transition-[left] duration-300 ${isDesktopSidebarCollapsed ? 'lg:left-20' : 'lg:left-64'}`}>
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      {/* Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="p-1.5 rounded-lg text-text-secondary hover:bg-bg-sidebar hover:text-text-primary transition-colors focus:outline-none lg:hidden"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={toggleDesktopSidebarCollapsed}
          className="hidden lg:flex p-1.5 rounded-lg text-text-secondary hover:bg-bg-sidebar hover:text-text-primary transition-colors focus:outline-none"
          title={isDesktopSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isDesktopSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isDesktopSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
        <span className="text-sm font-bold text-text-primary tracking-wide">
          {pageMeta.title}
        </span>
      </div>

      {/* Persistent Theme and Repo Controls */}
      <div className="flex items-center gap-3">
        {/* Search / Command Console button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-sidebar hover:bg-bg-nested text-text-secondary hover:text-text-primary text-xs font-semibold transition-colors focus:outline-none cursor-pointer"
          title="Search / Command Console (⌘K)"
        >
          <Search className="w-4 h-4 text-text-muted" />
          <span className="hidden md:inline">Search</span>
          <kbd className="hidden sm:inline bg-bg-card border border-border-subtle px-1 py-0.5 rounded font-mono text-[9px]">⌘K</kbd>
        </button>

        {/* Airplane Mode / Offline Resilience button */}
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => setIsAirplaneOpen(!isAirplaneOpen)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors focus:outline-none cursor-pointer ${
              isAirplaneEnabled
                ? 'bg-status-danger/10 border-status-danger/30 text-status-danger hover:bg-status-danger/20'
                : 'bg-bg-sidebar border-border-subtle hover:bg-bg-nested text-text-secondary hover:text-text-primary'
            }`}
            title="✈️ Air-Gap & Resilience Console (Verify 100% offline privacy)"
          >
            <Plane className={`w-4 h-4 ${isAirplaneEnabled ? 'animate-bounce text-status-danger' : ''}`} />
            {isAirplaneEnabled && <span className="hidden lg:inline text-[10px] uppercase font-black tracking-wider text-status-danger">Offline</span>}
          </button>
          
          <AirplaneSelector isOpen={isAirplaneOpen} onClose={() => setIsAirplaneOpen(false)} />
        </div>

        {/* Theme Cycling Selector */}
        <button
          onClick={cycleTheme}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-sidebar hover:bg-bg-nested text-text-secondary hover:text-text-primary text-xs font-semibold transition-colors focus:outline-none cursor-pointer"
          title="Cycle appearance theme (Light -> Dark -> System)"
        >
          {renderThemeIcon()}
          <span className="hidden sm:inline">{getThemeLabel()}</span>
        </button>

        {/* GitHub Repository Reference Link */}
        <a
          href="https://github.com/mayankrajjaiswal/aboutiam"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg border border-border-subtle bg-bg-sidebar hover:bg-bg-nested text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
          title="Browse on GitHub"
        >
          <svg className="w-4 h-4 fill-current text-text-secondary hover:text-text-primary" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
        </a>
      </div>

      {/* Global Search Command Palette overlay modal */}
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  )
}
