import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  BookOpen, Cpu, Award, Compass, Bot, X, Home, ShieldAlert,
  CheckSquare, GraduationCap, Users, Map, Wrench, Network, Building,
  ScanSearch, Layers, History, ChevronDown, ChevronRight, CalendarDays, FileBarChart, Waypoints, Fingerprint, ClipboardList, KeyRound, Wallet, GitBranch, Puzzle, ShoppingCart, Folder, ArrowLeftRight, Glasses, Siren, Search, Share2, Gamepad2
} from 'lucide-react'
import { useLayoutStore } from '../../store/layoutStore'

interface SidebarProps {
  isMobile?: boolean
}

interface NavItem {
  name: string
  path: string
  icon: LucideIcon
  subGroup?: string
}

const OTHER_SUBGROUP = 'Other'
const SUBGROUP_STORAGE_KEY = 'aboutiam-sidebar-subgroups-open'

function readOpenSubGroups(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(SUBGROUP_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeOpenSubGroups(state: Record<string, boolean>) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SUBGROUP_STORAGE_KEY, JSON.stringify(state))
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
  filterQuery: string
}

function SubGroupSection({
  groupKey,
  subGroupName,
  items,
  collapsed,
  pathname,
  handleLinkClick,
  forceOpen,
}: {
  groupKey: string
  subGroupName: string
  items: NavItem[]
  collapsed: boolean
  pathname: string
  handleLinkClick: () => void
  forceOpen: boolean
}) {
  const storageKey = `${groupKey}::${subGroupName}`
  const [isOpen, setIsOpen] = useState(() => readOpenSubGroups()[storageKey] ?? true)

  const toggle = () => {
    setIsOpen((prev) => {
      const next = !prev
      writeOpenSubGroups({ ...readOpenSubGroups(), [storageKey]: next })
      return next
    })
  }

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')
  const open = forceOpen || isOpen

  return (
    <div>
      {!collapsed && (
        <button
          onClick={toggle}
          className="w-full flex items-center justify-between py-1.5 px-6 text-[10px] font-bold uppercase tracking-wider text-text-muted/80 hover:text-text-primary transition-colors text-left focus:outline-none"
        >
          <span>{subGroupName}</span>
          {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
      )}
      {(open || collapsed) && (
        <div className="space-y-0.5">
          {items.map((item) => {
            const active = isActive(item.path)
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={handleLinkClick}
                title={collapsed ? item.name : undefined}
                aria-label={item.name}
                className={`flex items-center gap-2.5 py-2 mx-2 rounded-lg text-[13px] font-bold transition-all group ${
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
        </div>
      )}
    </div>
  )
}

function AccordionGroup({
  title, groupKey, items, collapsed, pathname,
  handleLinkClick, isOpen, onToggle, filterQuery
}: AccordionGroupProps) {
  const filteredItems = useMemo(() => {
    const q = filterQuery.trim().toLowerCase()
    return q ? items.filter((item) => item.name.toLowerCase().includes(q)) : items
  }, [items, filterQuery])

  if (filterQuery.trim() && filteredItems.length === 0) return null

  const subGroupNames = Array.from(new Set(items.map((item) => item.subGroup ?? OTHER_SUBGROUP)))
  const hasSubGroups = subGroupNames.length > 1

  const forceOpen = isOpen || collapsed || Boolean(filterQuery.trim())

  return (
    <div className="border-b border-border-subtle/35 py-1">
      {/* Category Toggle Header */}
      {!collapsed ? (
        <button
          onClick={onToggle}
          className={`w-full flex items-center justify-between py-2.5 px-4 text-[11px] font-black uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors text-left focus:outline-none`}
        >
          <span className="flex items-center gap-1.5">
            {groupKey === 'core' ? '🚀' : groupKey === 'tools' ? '🛠️' : groupKey === 'architecture' ? '📊' : groupKey === 'ecosystem' ? '🏢' : '💬'} {title}
          </span>
          {forceOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      ) : null}

      {/* Accordion Content with Framer Motion Height Transition */}
      <AnimatePresence initial={false}>
        {(forceOpen) && (
          <motion.div
            initial={collapsed ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden space-y-0.5 mt-0.5"
          >
            {hasSubGroups ? (
              subGroupNames.map((subGroupName) => {
                const subItems = filteredItems.filter((item) => (item.subGroup ?? OTHER_SUBGROUP) === subGroupName)
                if (subItems.length === 0) return null
                return (
                  <SubGroupSection
                    key={subGroupName}
                    groupKey={groupKey}
                    subGroupName={subGroupName}
                    items={subItems}
                    collapsed={collapsed}
                    pathname={pathname}
                    handleLinkClick={handleLinkClick}
                    forceOpen={Boolean(filterQuery.trim())}
                  />
                )
              })
            ) : (
              filteredItems.map((item) => {
                const active = pathname === item.path || pathname.startsWith(item.path + '/')
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={handleLinkClick}
                    title={collapsed ? item.name : undefined}
                    aria-label={item.name}
                    className={`flex items-center gap-2.5 py-2 mx-2 rounded-lg text-[13px] font-bold transition-all group ${
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
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const coreItems = [
  { name: 'Overview Dashboard', path: '/', icon: Home },
  { name: 'Executive Command Center', path: '/command-center', icon: Compass },
  { name: "Beginner's Primer", path: '/primer', icon: GraduationCap },
  { name: 'Learning Pathways', path: '/roadmap', icon: Map },
  { name: 'IAM Academy', path: '/learn', icon: BookOpen },
  { name: 'Master A-Z Encyclopedia', path: '/encyclopedia', icon: BookOpen },
  { name: 'Interactive Playgrounds', path: '/playground', icon: Cpu },
  { name: 'Identity Labs Academy', path: '/labs', icon: Award },
  { name: 'Daily Identity Puzzle', path: '/daily-puzzle', icon: Puzzle },
]

const toolsItems = [
  { name: 'Security Utilities', path: '/tools', icon: Wrench },
  { name: 'Design Pattern Library', path: '/patterns', icon: Layers },
  { name: 'Living Standards Explorer', path: '/standards', icon: BookOpen },
]

const architectureItems: NavItem[] = [
  { name: 'Identity Scenario Builder', path: '/scenario-builder', icon: Layers, subGroup: 'Design & Assessment' },
  { name: 'Maturity Assessments', path: '/assess', icon: Award, subGroup: 'Design & Assessment' },
  { name: 'Identity Decision Matrix', path: '/decision-matrix', icon: Compass, subGroup: 'Design & Assessment' },
  { name: 'Threat Modeling Studio', path: '/threat-modeling', icon: ShieldAlert, subGroup: 'Design & Assessment' },
  { name: 'IAM Design Review', path: '/design-review', icon: CheckSquare, subGroup: 'Design & Assessment' },
  { name: 'Enterprise References', path: '/references', icon: Wrench, subGroup: 'Design & Assessment' },
  { name: 'Identity Case Studies', path: '/case-studies', icon: BookOpen, subGroup: 'Design & Assessment' },
  { name: 'Architecture Center', path: '/architecture', icon: Network, subGroup: 'Design & Assessment' },
  { name: 'Knowledge Graph', path: '/knowledge-graph', icon: Waypoints, subGroup: 'Design & Assessment' },
  { name: 'Modernization Backlog Game', path: '/playground/modernization-backlog', icon: ClipboardList, subGroup: 'Zero Trust & PAM Labs' },
  { name: 'Build-Your-Own-IdP Sandbox', path: '/playground/build-your-idp', icon: KeyRound, subGroup: 'Zero Trust & PAM Labs' },
  { name: 'FAPI 2.0 / Open Banking Lab', path: '/playground/fapi2', icon: ShieldAlert, subGroup: 'Zero Trust & PAM Labs' },
  { name: 'CAEP Event Storm Visualizer', path: '/playground/caep-event-storm', icon: Waypoints, subGroup: 'Zero Trust & PAM Labs' },
  { name: 'Attack-Path Graph Visualizer', path: '/playground/attack-path-graph', icon: GitBranch, subGroup: 'Zero Trust & PAM Labs' },
  { name: 'Incident Commander', path: '/playground/incident-commander', icon: Siren, subGroup: 'Zero Trust & PAM Labs' },
  { name: 'AD/LDAP OU & Schema Designer', path: '/playground/ldap-schema-designer', icon: Folder, subGroup: 'Infrastructure & Emerging' },
  { name: 'Identity Fabric Builder', path: '/playground/identity-fabric', icon: Waypoints, subGroup: 'Infrastructure & Emerging' },
  { name: 'OT/ICS Identity Simulator', path: '/playground/ot-ics-identity', icon: Cpu, subGroup: 'Infrastructure & Emerging' },
  { name: 'CIEM Explorer', path: '/playground/ciem-explorer', icon: GitBranch, subGroup: 'Infrastructure & Emerging' },
  { name: 'Legacy & Academic Federation Lab', path: '/playground/legacy-federation', icon: History, subGroup: 'Infrastructure & Emerging' },
  { name: 'Avatar & Spatial Identity Lab', path: '/playground/spatial-identity-lab', icon: Glasses, subGroup: 'Infrastructure & Emerging' },
]

const ecosystemItems: NavItem[] = [
  { name: 'Agentic Identity Lab', path: '/playground/agent-identity', icon: Bot, subGroup: 'Non-Human & Governance' },
  { name: 'NHI Sprawl Cleanup Game', path: '/playground/nhi-sprawl', icon: ScanSearch, subGroup: 'Non-Human & Governance' },
  { name: 'Role Mining Workbench', path: '/playground/role-mining', icon: Users, subGroup: 'Non-Human & Governance' },
  { name: 'Access Request Cart', path: '/playground/access-request-cart', icon: ShoppingCart, subGroup: 'Non-Human & Governance' },
  { name: 'HR-to-IdP Attribute Mapper', path: '/playground/hr-attribute-mapper', icon: ArrowLeftRight, subGroup: 'Non-Human & Governance' },
  { name: 'Passkey Rollout Strategist', path: '/playground/passkey-rollout-strategist', icon: Fingerprint, subGroup: 'Passwordless & Wallets' },
  { name: 'OpenID4VC Wallet Studio', path: '/playground/openid4vc-wallet', icon: Wallet, subGroup: 'Passwordless & Wallets' },
  { name: 'Trust Registry Explorer', path: '/playground/trust-registry', icon: Building, subGroup: 'Passwordless & Wallets' },
  { name: 'Liveness & Injection Attack Lab', path: '/playground/liveness-injection', icon: ScanSearch, subGroup: 'Passwordless & Wallets' },
  { name: 'Vendor Knowledge Center', path: '/vendor', icon: Building, subGroup: 'Vendor & Threat Intel' },
  { name: 'IAM Landscape Directory', path: '/explore', icon: Compass, subGroup: 'Vendor & Threat Intel' },
  { name: 'Certification Hub', path: '/certifications', icon: Award, subGroup: 'Vendor & Threat Intel' },
  { name: 'Research & CVE Tracker', path: '/research', icon: ScanSearch, subGroup: 'Vendor & Threat Intel' },
  { name: 'Security Bulletins & Crisis Game', path: '/bulletins', icon: ShieldAlert, subGroup: 'Vendor & Threat Intel' },
  { name: 'Vulnerability Museum', path: '/wall-of-shame', icon: ShieldAlert, subGroup: 'Vendor & Threat Intel' },
  { name: 'STIX/TAXII Identity-IOC Fan-Out', path: '/playground/stix-taxii-ioc', icon: Share2, subGroup: 'Vendor & Threat Intel' },
  { name: 'Gaming & Esports Identity Lab', path: '/playground/gaming-identity', icon: Gamepad2, subGroup: 'Emerging Verticals' },
  { name: 'Developer Playbooks', path: '/cheat-sheets', icon: CheckSquare, subGroup: 'Reference & AI' },
  { name: 'AI Knowledge Assistant', path: '/assistant', icon: Bot, subGroup: 'Reference & AI' },
]

const communityItems = [
  { name: 'Identity Timeline', path: '/timeline', icon: History },
  { name: 'Events & Conferences', path: '/events', icon: CalendarDays },
  { name: 'Industry Reports', path: '/reports', icon: FileBarChart },
  { name: 'Community Forums', path: '/community-forums', icon: Network },
  { name: 'Community Achievements', path: '/community', icon: Users },
  { name: 'Team & Bio Cards', path: '/contributors', icon: Users },
]

export default function Sidebar({ isMobile = false }: SidebarProps) {
  const location = useLocation()
  const { isMobileSidebarOpen, setMobileSidebarOpen, isDesktopSidebarCollapsed } = useLayoutStore()
  const collapsed = !isMobile && isDesktopSidebarCollapsed

  // "Jump To" filter — narrows entries across every group/sub-group by substring match
  const [filterQuery, setFilterQuery] = useState('')

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

      {/* "Jump To" Filter */}
      {!collapsed && (
        <div className="px-3 pt-2 pb-1 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Jump to..."
              aria-label="Filter sidebar navigation"
              className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>
      )}

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
          filterQuery={filterQuery}
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
          filterQuery={filterQuery}
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
          filterQuery={filterQuery}
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
          filterQuery={filterQuery}
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
          filterQuery={filterQuery}
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
