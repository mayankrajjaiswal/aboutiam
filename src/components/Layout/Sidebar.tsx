import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Cpu, Award, Compass, Bot, X, Home, Book, ShieldAlert, CheckSquare, GraduationCap, Users } from 'lucide-react'
import { useLayoutStore } from '../../store/layoutStore'

interface SidebarProps {
  isMobile?: boolean
}

export default function Sidebar({ isMobile = false }: SidebarProps) {
  const location = useLocation()
  const { isMobileSidebarOpen, setMobileSidebarOpen } = useLayoutStore()

  const coreItems = [
    { name: 'Overview Dashboard', path: '/', icon: Home },
    { name: "Beginner's Primer", path: '/primer', icon: GraduationCap },
    { name: 'IAM Academy', path: '/learn', icon: BookOpen },
    { name: 'Interactive Playgrounds', path: '/playground', icon: Cpu },
  ]
  
  const ecosystemItems = [
    { name: 'Master Encyclopedia', path: '/encyclopedia', icon: Book },
    { name: 'Vulnerability Lab', path: '/wall-of-shame', icon: ShieldAlert },
    { name: 'Developer Playbooks', path: '/cheat-sheets', icon: CheckSquare },
  ]

  const exploreItems = [
    { name: 'Maturity Assessments', path: '/assess', icon: Award },
    { name: 'Landscape Directory', path: '/explore', icon: Compass },
    { name: 'AI Architect Chat', path: '/assistant', icon: Bot },
    { name: 'Team & Contact', path: '/contributors', icon: Users },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const handleLinkClick = () => {
    if (isMobile) {
      setMobileSidebarOpen(false)
    }
  }

  const NavGroup = ({ title, items }: { title: string, items: any[] }) => (
    <div className="py-3">
      <span className="px-4 text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2 block">{title}</span>
      <div className="space-y-1">
        {items.map((item) => {
          const active = isActive(item.path)
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-semibold transition-all group ${
                active
                  ? 'bg-accent-glow text-accent-primary shadow-sm shadow-accent-primary/5'
                  : 'text-text-secondary hover:bg-bg-card hover:text-text-primary border border-transparent hover:border-border-subtle/50'
              }`}
            >
              <item.icon className={`w-4 h-4 shrink-0 transition-colors ${
                active ? 'text-accent-primary' : 'text-text-muted group-hover:text-text-primary'
              }`} />
              {item.name}
            </Link>
          )
        })}
      </div>
    </div>
  )

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-bg-sidebar border-r border-border-subtle">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border-subtle shrink-0">
        <Link to="/" onClick={handleLinkClick} className="flex items-center gap-2 font-black text-lg tracking-wider text-text-primary uppercase">
          <span className="text-xl">🔐</span> About<span className="text-accent-primary">IAM</span>
        </Link>
        {isMobile && (
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1 rounded-md text-text-secondary hover:bg-bg-nested hover:text-text-primary transition-colors focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        <NavGroup title="Core Platform" items={coreItems} />
        <div className="mx-6 border-t border-border-subtle/50 my-1"></div>
        <NavGroup title="Advanced Ecosystem" items={ecosystemItems} />
        <div className="mx-6 border-t border-border-subtle/50 my-1"></div>
        <NavGroup title="Governance & Tools" items={exploreItems} />
      </nav>

      {/* Footer Branding */}
      <div className="p-4 border-t border-border-subtle/50 text-center shrink-0">
        <p className="text-[10px] text-text-muted font-bold tracking-wider uppercase">Open-Source Platform</p>
        <p className="text-[9px] text-text-muted mt-0.5">Version 1.0.0 (MIT)</p>
      </div>
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
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  return (
    <div className="hidden lg:block w-64 shrink-0 h-full fixed top-0 bottom-0 left-0 z-20">
      <SidebarContent />
    </div>
  )
}
