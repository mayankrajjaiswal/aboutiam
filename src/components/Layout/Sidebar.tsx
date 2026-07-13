import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  BookOpen, Cpu, Award, Compass, Bot, X, Home, ShieldAlert,
  CheckSquare, GraduationCap, Users, Map, Wrench, Network, Building, 
  ScanSearch, Layers, History, ChevronDown, ChevronRight, Briefcase
} from 'lucide-react'
import { useLayoutStore } from '../../store/layoutStore'

interface SidebarProps {
  isMobile?: boolean
}

interface NavItem {
  name: string
  path: string
  icon: LucideIcon
}

interface AccordionGroupProps {
  title: string
  groupKey: string
  items: NavItem[]
  collapsed: boolean
  pathname: string
  handleLinkClick: () => void
  isOpen: boolean
  onToggle: () => void
}

function AccordionGroup({ 
  title, groupKey, items, collapsed, pathname, 
  handleLinkClick, isOpen, onToggle 
}: AccordionGroupProps) {
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname === path || pathname.startsWith(path + '/')
  }

  return (
    <div className="border-b border-border-subtle/35 py-1">
      {/* Category Toggle Header */}
      {!collapsed ? (
        <button
          onClick={onToggle}
          className={`w-full flex items-center justify-between py-2 px-4 text-[10px] font-black uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors text-left focus:outline-none`}
        >
          <span className="flex items-center gap-1.5">
            {groupKey === 'core' ? '🚀' : groupKey === 'tools' ? '🛠️' : groupKey === 'architecture' ? '📊' : groupKey === 'ecosystem' ? '🏢' : '💬'} {title}
          </span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      ) : null}

      {/* Accordion Content with Framer Motion Height Transition */}
      <AnimatePresence initial={false}>
        {(isOpen || collapsed) && (
          <motion.div
            initial={collapsed ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden space-y-0.5 mt-0.5"
          >
            {items.map((item) => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={handleLinkClick}
                  title={collapsed ? item.name : undefined}
                  aria-label={item.name}
                  className={`flex items-center gap-2.5 py-1.5 mx-2 rounded-lg text-xs font-bold transition-all group ${
                    collapsed ? 'justify-center px-2' : 'px-3.5 pl-5'
                  } ${
                    active
                      ? 'bg-accent-glow text-accent-primary shadow-sm shadow-accent-primary/5 font-black'
                      : 'text-text-secondary hover:bg-bg-card hover:text-text-primary border border-transparent hover:border-border-subtle/50'
                  }`}
                >
                  <item.icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                    active ? 'text-accent-primary' : 'text-text-muted group-hover:text-text-primary'
                  }`} />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const coreItems = [
  { name: 'Overview Dashboard', path: '/', icon: Home },
  { name: "Beginner's Primer", path: '/primer', icon: GraduationCap },
  { name: 'Learning Pathways', path: '/roadmap', icon: Map },
  { name: 'IAM Academy', path: '/learn', icon: BookOpen },
  { name: 'Interactive Playgrounds', path: '/playground', icon: Cpu },
  { name: 'Identity Labs Academy', path: '/labs', icon: Award },
]

const toolsItems = [
  { name: 'Security Utilities', path: '/tools', icon: Wrench },
  { name: 'Design Pattern Library', path: '/patterns', icon: Layers },
  { name: 'Living Standards Explorer', path: '/standards', icon: BookOpen },
]

const architectureItems = [
  { name: 'Identity Scenario Builder', path: '/scenario-builder', icon: Layers },
  { name: 'Maturity Assessments', path: '/assess', icon: Award },
  { name: 'Identity Decision Matrix', path: '/decision-matrix', icon: Compass },
  { name: 'Threat Modeling Studio', path: '/threat-modeling', icon: ShieldAlert },
  { name: 'IAM Design Review', path: '/design-review', icon: CheckSquare },
  { name: 'Enterprise References', path: '/references', icon: Wrench },
  { name: 'Identity Case Studies', path: '/case-studies', icon: BookOpen },
  { name: 'Architecture Center', path: '/architecture', icon: Network },
]

const ecosystemItems = [
  { name: 'Vendor Knowledge Center', path: '/vendor', icon: Building },
  { name: 'Certification Hub', path: '/certifications', icon: Award },
  { name: 'Interview & Career Center', path: '/career-center', icon: Briefcase },
  { name: 'Research & CVE Tracker', path: '/research', icon: ScanSearch },
  { name: 'Security Bulletins & Crisis Game', path: '/bulletins', icon: ShieldAlert },
  { name: 'Vulnerability Museum', path: '/wall-of-shame', icon: ShieldAlert },
  { name: 'Developer Playbooks', path: '/cheat-sheets', icon: CheckSquare },
  { name: 'AI Knowledge Assistant', path: '/assistant', icon: Bot },
]

const communityItems = [
  { name: 'Identity Timeline', path: '/timeline', icon: History },
  { name: 'Community Forums', path: '/community-forums', icon: Network },
  { name: 'Community Achievements', path: '/community', icon: Users },
  { name: 'Team & Bio Cards', path: '/contributors', icon: Users },
]

export default function Sidebar({ isMobile = false }: SidebarProps) {
  const location = useLocation()
  const { isMobileSidebarOpen, setMobileSidebarOpen, isDesktopSidebarCollapsed } = useLayoutStore()
  const collapsed = !isMobile && isDesktopSidebarCollapsed

  // Collapsible Navigation Groups state
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    core: true,          // Open by default
    tools: false,
    architecture: false,
    ecosystem: false,
    community: false,
  })

  // Auto-expand group on mount or navigation if it contains the active child route
  useEffect(() => {
    const isActive = (path: string) => {
      if (path === '/') return location.pathname === '/'
      return location.pathname === path || location.pathname.startsWith(path + '/')
    }

    const checkAndExpand = () => {
      const coreActive = coreItems.some(i => isActive(i.path))
      const toolsActive = toolsItems.some(i => isActive(i.path))
      const archActive = architectureItems.some(i => isActive(i.path))
      const ecoActive = ecosystemItems.some(i => isActive(i.path))
      const commActive = communityItems.some(i => isActive(i.path))

      if (coreActive || toolsActive || archActive || ecoActive || commActive) {
        setOpenGroups({
          core: coreActive,
          tools: toolsActive,
          architecture: archActive,
          ecosystem: ecoActive,
          community: commActive,
        })
      }
    }

    checkAndExpand()
  }, [location.pathname])

  const toggleGroup = (groupKey: string) => {
    setOpenGroups(prev => {
      const nextOpen = !prev[groupKey]
      return {
        core: groupKey === 'core' ? nextOpen : false,
        tools: groupKey === 'tools' ? nextOpen : false,
        architecture: groupKey === 'architecture' ? nextOpen : false,
        ecosystem: groupKey === 'ecosystem' ? nextOpen : false,
        community: groupKey === 'community' ? nextOpen : false,
      }
    })
  }



  const handleLinkClick = () => {
    if (isMobile) {
      setMobileSidebarOpen(false)
    }
  }

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-bg-sidebar border-r border-border-subtle select-none">
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
      <nav className="flex-1 py-2 overflow-y-auto custom-scrollbar scrollbar-thin">
        <AccordionGroup 
          title="Core Academy" 
          groupKey="core"
          items={coreItems} 
          collapsed={collapsed} 
          pathname={location.pathname} 
          handleLinkClick={handleLinkClick} 
          isOpen={openGroups.core}
          onToggle={() => toggleGroup('core')}
        />
        <AccordionGroup 
          title="Cryptographic Tools" 
          groupKey="tools"
          items={toolsItems} 
          collapsed={collapsed} 
          pathname={location.pathname} 
          handleLinkClick={handleLinkClick} 
          isOpen={openGroups.tools}
          onToggle={() => toggleGroup('tools')}
        />
        <AccordionGroup 
          title="Architecture & GRC" 
          groupKey="architecture"
          items={architectureItems} 
          collapsed={collapsed} 
          pathname={location.pathname} 
          handleLinkClick={handleLinkClick} 
          isOpen={openGroups.architecture}
          onToggle={() => toggleGroup('architecture')}
        />
        <AccordionGroup 
          title="Enterprise Ecosystem" 
          groupKey="ecosystem"
          items={ecosystemItems} 
          collapsed={collapsed} 
          pathname={location.pathname} 
          handleLinkClick={handleLinkClick} 
          isOpen={openGroups.ecosystem}
          onToggle={() => toggleGroup('ecosystem')}
        />
        <AccordionGroup 
          title="Community Hub" 
          groupKey="community"
          items={communityItems} 
          collapsed={collapsed} 
          pathname={location.pathname} 
          handleLinkClick={handleLinkClick} 
          isOpen={openGroups.community}
          onToggle={() => toggleGroup('community')}
        />
      </nav>

      {/* Footer Branding */}
      {!collapsed && (
        <div className="p-3 border-t border-border-subtle/50 text-center shrink-0">
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
