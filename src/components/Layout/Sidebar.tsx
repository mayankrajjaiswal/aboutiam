import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { 
  BookOpen, Cpu, Award, Compass, Bot, X, Home, Book, ShieldAlert, 
  CheckSquare, GraduationCap, Users, Map, Wrench, Network, Building, ScanSearch, Layers,
  History
} from 'lucide-react'
import { useLayoutStore } from '../../store/layoutStore'

interface SidebarProps {
  isMobile?: boolean
}

interface NavGroupProps {
  title: string
  items: any[]
  collapsed: boolean
  pathname: string
  handleLinkClick: () => void
}

function NavGroup({ title, items, collapsed, pathname, handleLinkClick }: NavGroupProps) {
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  return (
    <div className="py-3">
      {!collapsed && (
        <span className="px-4 text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 block">{title}</span>
      )}
      <div className="space-y-1">
        {items.map((item) => {
          const active = isActive(item.path)
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={handleLinkClick}
              title={collapsed ? item.name : undefined}
              aria-label={item.name}
              className={`flex items-center gap-3 py-2.5 mx-2 rounded-lg text-sm font-semibold transition-all group ${
                collapsed ? 'justify-center px-2' : 'px-4'
              } ${
                active
                  ? 'bg-accent-glow text-accent-primary shadow-sm shadow-accent-primary/5'
                  : 'text-text-secondary hover:bg-bg-card hover:text-text-primary border border-transparent hover:border-border-subtle/50'
              }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 transition-colors ${
                active ? 'text-accent-primary' : 'text-text-muted group-hover:text-text-primary'
              }`} />
              {!collapsed && item.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default function Sidebar({ isMobile = false }: SidebarProps) {
  const location = useLocation()
  const { isMobileSidebarOpen, setMobileSidebarOpen, isDesktopSidebarCollapsed } = useLayoutStore()
  const collapsed = !isMobile && isDesktopSidebarCollapsed

  const coreItems = [
    { name: 'Overview Dashboard', path: '/', icon: Home },
    { name: "Beginner's Primer", path: '/primer', icon: GraduationCap },
    { name: 'Zero-to-Hero Pathway', path: '/roadmap', icon: Map },
    { name: 'IAM Academy', path: '/learn', icon: BookOpen },
    { name: 'Architecture Center', path: '/architecture', icon: Network },
    { name: 'Interactive Playgrounds', path: '/playground', icon: Cpu },
  ]

  const toolsItems = [
    { name: 'Security Tools', path: '/tools', icon: Wrench },
  ]

  const ecosystemItems = [
    { name: 'Master Encyclopedia', path: '/encyclopedia', icon: Book },
    { name: 'Identity Timeline', path: '/timeline', icon: History },
    { name: 'Community Achievements', path: '/community', icon: Users },
    { name: 'Community Forums', path: '/community-forums', icon: Network },
    { name: 'Design Patterns', path: '/patterns', icon: Layers },
    { name: 'Vulnerability Lab', path: '/wall-of-shame', icon: ShieldAlert },
    { name: 'Developer Playbooks', path: '/cheat-sheets', icon: CheckSquare },
  ]

  const exploreItems = [
    { name: 'Maturity Assessments', path: '/assess', icon: Award },
    { name: 'Landscape Directory', path: '/explore', icon: Compass },
    { name: 'Vendor Center', path: '/vendor', icon: Building },
    { name: 'Certification Hub', path: '/certifications', icon: Award },
    { name: 'Research & CVEs', path: '/research', icon: ScanSearch },
    { name: 'Security Bulletins', path: '/bulletins', icon: ShieldAlert },
    { name: 'AI Architect Chat', path: '/assistant', icon: Bot },
    { name: 'Team & Contact', path: '/contributors', icon: Users },
  ]

  const handleLinkClick = () => {
    if (isMobile) {
      setMobileSidebarOpen(false)
    }
  }

  // Purely inline sidebar content template
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-bg-sidebar border-r border-border-subtle">
      {/* Brand Header */}
      <div className={`h-16 flex items-center border-b border-border-subtle shrink-0 ${collapsed ? 'justify-center px-2' : 'justify-between px-6'}`}>
        <Link to="/" onClick={handleLinkClick} className="flex items-center gap-2 font-black text-lg tracking-wider text-text-primary uppercase" title={collapsed ? 'AboutIAM' : undefined}>
          <span className="text-xl">🔐</span>
          {!collapsed && <>About<span className="text-accent-primary">IAM</span></>}
        </Link>
        {isMobile && (
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            title="Close menu"
            aria-label="Close menu"
            className="p-1 rounded-md text-text-secondary hover:bg-bg-nested hover:text-text-primary transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        <NavGroup title="Core Platform" items={coreItems} collapsed={collapsed} pathname={location.pathname} handleLinkClick={handleLinkClick} />
        <div className="mx-6 border-t border-border-subtle/50 my-1"></div>
        <NavGroup title="Security Tools" items={toolsItems} collapsed={collapsed} pathname={location.pathname} handleLinkClick={handleLinkClick} />
        <div className="mx-6 border-t border-border-subtle/50 my-1"></div>
        <NavGroup title="Advanced Ecosystem" items={ecosystemItems} collapsed={collapsed} pathname={location.pathname} handleLinkClick={handleLinkClick} />
        <div className="mx-6 border-t border-border-subtle/50 my-1"></div>
        <NavGroup title="Governance & Tools" items={exploreItems} collapsed={collapsed} pathname={location.pathname} handleLinkClick={handleLinkClick} />
      </nav>

      {/* Footer Branding */}
      {!collapsed && (
        <div className="p-4 border-t border-border-subtle/50 text-center shrink-0">
          <p className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Open-Source Platform</p>
          <p className="text-[9px] text-text-muted mt-0.5">Version 1.0.0 (MIT)</p>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            {/* Slide-over Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="fixed inset-y-0 left-0 w-72 max-w-xs z-50 lg:hidden shadow-2xl"
            >
              {renderSidebarContent()}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  return (
    <div className={`hidden lg:block shrink-0 h-full fixed top-0 bottom-0 left-0 z-20 transition-[width] duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {renderSidebarContent()}
    </div>
  )
}
