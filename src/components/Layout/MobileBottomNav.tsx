import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, Cpu, Wrench, Search } from 'lucide-react'
import { useCommandPaletteStore } from '../../store/commandPaletteStore'

interface BottomTab {
  name: string
  path?: string
  icon: typeof Home
  onClick?: () => void
}

export default function MobileBottomNav() {
  const location = useLocation()
  const toggleSearch = useCommandPaletteStore((s) => s.toggle)

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const tabs: BottomTab[] = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Learn', path: '/learn', icon: BookOpen },
    { name: 'Playgrounds', path: '/playground', icon: Cpu },
    { name: 'Tools', path: '/tools', icon: Wrench },
    { name: 'Search', icon: Search, onClick: toggleSearch },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex lg:hidden bg-bg-card border-t border-border-subtle pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary mobile navigation"
    >
      {tabs.map((tab) => {
        const active = tab.path ? isActive(tab.path) : false
        const className = `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-bold transition-colors ${
          active ? 'text-accent-primary' : 'text-text-secondary hover:text-text-primary'
        }`

        if (tab.path) {
          return (
            <Link key={tab.name} to={tab.path} className={className} aria-label={tab.name} aria-current={active ? 'page' : undefined}>
              <tab.icon className="w-5 h-5" />
              {tab.name}
            </Link>
          )
        }

        return (
          <button key={tab.name} type="button" onClick={tab.onClick} className={className} aria-label={tab.name}>
            <tab.icon className="w-5 h-5" />
            {tab.name}
          </button>
        )
      })}
    </nav>
  )
}
