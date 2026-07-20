import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Terminal, ShieldAlert, History, Sparkles, 
  Wrench, Book, Flame, CornerDownLeft, Command, X
} from 'lucide-react'
import { getSearchIndex, parseSlashCommand } from '../../lib/search/searchService'
import type { SearchItem } from '../../lib/search/searchService'
import { useSearchHistoryStore } from '../../lib/search/useSearchHistory'
import { useThemeStore } from '../../store/themeStore'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

interface CommandPaletteItem {
  id: string
  title: string
  fullName?: string
  description?: string
  category?: string
  link?: string
  keywords?: string[]
  isCommand?: boolean
  isHistory?: boolean
  isStarter?: boolean
  icon?: React.ComponentType<{ className?: string }>
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [results, setResults] = useState<CommandPaletteItem[]>([])
  
  const navigate = useNavigate()
  const { theme, setTheme } = useThemeStore()
  const { recentQueries, pushQuery, clearHistory } = useSearchHistoryStore()
  
  const inputRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({})

  // Initialize search index on mount (pre-warming)
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure modal is rendered and animations can execute cleanly
      const t = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  // Clear query and selection on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setQuery('')
        setSelectedIndex(0)
      }, 0)
    }
  }, [isOpen])

  // MiniSearch index search implementation
  useEffect(() => {
    if (!isOpen) return
    
    const trimmed = query.trim()
    if (!trimmed || trimmed.startsWith('/')) {
      setTimeout(() => {
        setResults([])
        setSelectedIndex(0)
      }, 0)
      return
    }

    let isCancelled = false
    const searchIndex = getSearchIndex()

    const searchResults = searchIndex.search(trimmed)
    
    if (!isCancelled) {
      // Map and type-assert matched items
      const mapped = searchResults.map(r => ({
        id: r.id,
        title: r.title as string,
        fullName: r.fullName as string | undefined,
        description: r.description as string,
        category: r.category as string,
        link: r.link as string,
        keywords: (r.keywords || []) as string[]
      })) as SearchItem[]
      
      setTimeout(() => {
        setResults(mapped)
        setSelectedIndex(0)
      }, 0)
    }

    return () => {
      isCancelled = true
    }
  }, [query, isOpen])

  // Handle slash commands
  const slashCommand = useMemo(() => {
    return parseSlashCommand(query)
  }, [query])

  // Group search results by category for categorized layout rendering
  const groupedResults = useMemo(() => {
    const groups: { [key: string]: CommandPaletteItem[] } = {}
    results.forEach(item => {
      const cat = item.category || 'Other'
      if (!groups[cat]) {
        groups[cat] = []
      }
      groups[cat].push(item)
    })
    return groups
  }, [results])

  // Flattened array of active items (either results or starters/history) to assist arrow navigation
  const flatSelectableItems = useMemo<CommandPaletteItem[]>(() => {
    if (slashCommand) {
      return [{ id: 'slash-command', title: query, link: '#', isCommand: true }]
    }

    if (query.trim() === '') {
      const items: CommandPaletteItem[] = []
      
      // Recent query tags
      recentQueries.forEach((q, idx) => {
        items.push({ id: `history-${idx}`, title: q, isHistory: true })
      })

      // Recommended starter links
      const starters = [
        { id: 'start-jwt', title: 'Decode & Sign JWTs Client-Side', desc: 'Surgical cryptographic generator & exploit sandbox.', link: '/playground/jwt', icon: Wrench },
        { id: 'start-oauth', title: 'OIDC / OAuth 2.0 Redirection Flows', desc: 'Clickable front/back-channel visual flowcharts.', link: '/playground/oauth', icon: Sparkles },
        { id: 'start-fido2', title: 'WebAuthn TPM Passkey Decoder', desc: 'Binary byte-offset authenticator decoder.', link: '/playground/fido2', icon: ShieldAlert },
        { id: 'start-saml', title: 'SAML Signature Wrapping (SSW) Attack Labs', desc: 'Historical XML attack vector sandboxes.', link: '/playground/saml', icon: Flame },
        { id: 'start-encyclopedia', title: 'Browse A-Z Security Acronym Encyclopedia', desc: 'Analogy and expert-grade technical specs.', link: '/encyclopedia', icon: Book }
      ]
      
      starters.forEach(s => {
        items.push({ id: s.id, title: s.title, description: s.desc, link: s.link, isStarter: true, icon: s.icon })
      })

      return items
    }

    return results
  }, [results, query, recentQueries, slashCommand])

  // Auto-scroll selection container into view
  useEffect(() => {
    const activeEl = itemRefs.current[selectedIndex]
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  // Close command palette on click outside or escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % Math.max(flatSelectableItems.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + flatSelectableItems.length) % Math.max(flatSelectableItems.length, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleSelectItem(flatSelectableItems[selectedIndex], e.metaKey || e.ctrlKey)
    }
  }

  // Handle selecting an item
  const handleSelectItem = (
    item: { id: string; title: string; link?: string; isCommand?: boolean; isHistory?: boolean; isStarter?: boolean } | null | undefined, 
    openInNewTab = false
  ) => {
    if (!item) return

    // Execute system slash commands
    if (item.isCommand) {
      if (slashCommand) {
        if (slashCommand.type === 'theme') {
          const nextTheme = theme === 'dark' ? 'light' : 'dark'
          setTheme(nextTheme)
          onClose()
        } else if (slashCommand.type === 'reset') {
          if (confirm('Are you sure you want to clear all learning modules, CTF completion badges, and high scores from local storage? This action is permanent.')) {
            localStorage.clear()
            window.location.reload()
          }
        } else if (slashCommand.type === 'redirect' && slashCommand.actionUrl) {
          navigate(slashCommand.actionUrl)
          onClose()
        }
      }
      return
    }

    // Trigger history tag searches
    if (item.isHistory) {
      setQuery(item.title)
      return
    }

    // Save search query into history
    if (query.trim() !== '') {
      pushQuery(query)
    }

    // Direct routing
    if (item.link) {
      if (openInNewTab) {
        window.open(item.link, '_blank', 'noopener,noreferrer')
      } else {
        navigate(item.link)
      }
      onClose()
    }
  }

  // Regex term highlighting
  const renderHighlighted = (text: string, searchVal: string) => {
    if (!searchVal.trim() || searchVal.startsWith('/')) return <span>{text}</span>
    const escaped = searchVal.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === searchVal.trim().toLowerCase() ? (
            <mark key={i} className="bg-accent-primary/20 text-accent-primary font-bold px-0.5 rounded font-sans">
              {part}
            </mark>
          ) : (
            <span key={i} className="font-sans">{part}</span>
          )
        )}
      </>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop Blur overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          <div className="flex min-h-screen items-start justify-center p-4 pt-[12vh]">
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
              onKeyDown={handleKeyDown}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border-subtle bg-bg-card shadow-2xl flex flex-col max-h-[75vh]"
            >
              {/* Terminal search inputs */}
              <div className="flex items-center gap-3 border-b border-border-subtle bg-bg-nested/40 px-4 py-3.5">
                <Search className="w-5 h-5 text-accent-primary shrink-0 animate-pulse" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search tools, glossary, simulators, or type '/' commands..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-text-primary text-sm focus:outline-none focus:ring-0 placeholder-text-muted font-sans"
                />
                
                {query && (
                  <button 
                    onClick={() => setQuery('')}
                    className="p-1 rounded-md hover:bg-bg-nested text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <div className="flex items-center gap-1 bg-bg-nested border border-border-subtle px-1.5 py-0.5 rounded text-[9px] font-bold text-text-muted shrink-0 font-mono">
                  ESC
                </div>
              </div>

              {/* Scrollable Result list pane */}
              <div className="flex-1 overflow-y-auto p-3 scrollbar-thin max-h-[50vh]">
                
                {/* 1. Slash Command Mode */}
                {slashCommand && (
                  <div className="space-y-2 py-1">
                    <span className="text-[10px] text-accent-secondary font-mono font-black uppercase tracking-wider block px-2.5 mb-1 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" /> Console Command Mode
                    </span>
                    <button
                      ref={el => { itemRefs.current[0] = el }}
                      onClick={() => handleSelectItem(flatSelectableItems[0])}
                      className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        selectedIndex === 0 
                          ? 'bg-accent-glow border-accent-secondary text-text-primary shadow-sm scale-[1.01]' 
                          : 'bg-bg-nested/10 border-border-subtle text-text-secondary hover:bg-bg-nested/30'
                      }`}
                    >
                      <div className="flex gap-3 items-start">
                        <Terminal className="w-5 h-5 text-accent-secondary shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <span className="font-mono font-bold text-xs text-text-primary block">{query}</span>
                          <span className="text-[11px] text-text-secondary font-semibold leading-normal block mt-1">{slashCommand.message}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[9px] font-bold text-text-muted bg-bg-nested/60 border border-border-subtle/50 px-2 py-0.5 rounded">
                        <span>EXECUTE</span> <CornerDownLeft className="w-3 h-3" />
                      </div>
                    </button>
                  </div>
                )}

                {/* 2. Empty Query State: Recent History & Starters */}
                {query.trim() === '' && !slashCommand && (
                  <div className="space-y-5 py-1">
                    {/* Recent Search Queries */}
                    {recentQueries.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between px-2.5">
                          <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block flex items-center gap-1">
                            <History className="w-3 h-3" /> Recent Queries
                          </span>
                          <button 
                            onClick={clearHistory}
                            className="text-[9px] text-status-danger hover:underline font-bold"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 px-2">
                          {recentQueries.map((q, idx) => {
                            const flatIdx = idx
                            return (
                              <button
                                key={idx}
                                ref={el => { itemRefs.current[flatIdx] = el }}
                                onClick={() => handleSelectItem(flatSelectableItems[flatIdx])}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                                  selectedIndex === flatIdx 
                                    ? 'bg-accent-glow border-accent-primary text-accent-primary scale-105' 
                                    : 'bg-bg-nested/20 border-border-subtle text-text-secondary hover:border-accent-primary/20'
                                }`}
                              >
                                <span>🔍</span> <span>{q}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Starter Launchers */}
                    <div className="space-y-2">
                      <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block px-2.5">
                        💡 Recomended Starter Launchers
                      </span>
                      <div className="space-y-1.5">
                        {flatSelectableItems
                          .filter(item => item.isStarter)
                          .map((item, idx) => {
                            const flatIdx = recentQueries.length + idx
                            const IconComp = item.icon || Sparkles
                            return (
                              <button
                                key={item.id}
                                ref={el => { itemRefs.current[flatIdx] = el }}
                                onClick={() => handleSelectItem(item)}
                                className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                                  selectedIndex === flatIdx 
                                    ? 'bg-accent-glow border-accent-primary text-text-primary shadow-sm scale-[1.01]' 
                                    : 'bg-bg-nested/10 border-transparent text-text-secondary hover:bg-bg-nested/30'
                                }`}
                              >
                                <div className="flex gap-3 items-center min-w-0">
                                  <IconComp className={`w-4 h-4 shrink-0 ${selectedIndex === flatIdx ? 'text-accent-primary animate-pulse' : 'text-text-muted'}`} />
                                  <div className="min-w-0">
                                    <span className="font-bold text-xs text-text-primary block truncate">{item.title}</span>
                                    <span className="text-[10px] text-text-muted font-semibold block truncate mt-0.5">{item.description}</span>
                                  </div>
                                </div>
                                <CornerDownLeft className={`w-3.5 h-3.5 shrink-0 ${selectedIndex === flatIdx ? 'text-accent-primary translate-x-0 opacity-100' : '-translate-x-2 opacity-0'} transition-all`} />
                              </button>
                            )
                          })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Search Results State */}
                {query.trim() !== '' && !slashCommand && results.length > 0 && (
                  <div className="space-y-4">
                    {(() => {
                      let globalItemCounter = -1
                      return Object.keys(groupedResults).map(category => {
                        const items = groupedResults[category]
                        return (
                          <div key={category} className="space-y-1.5">
                            <span className="text-[9px] text-text-muted font-black uppercase tracking-wider block px-2.5 mt-2">
                              {category} ({items.length})
                            </span>
                            
                            <div className="space-y-1">
                              {items.map(item => {
                                globalItemCounter++
                                const flatIdx = globalItemCounter
                                return (
                                  <button
                                    key={item.id}
                                    ref={el => { itemRefs.current[flatIdx] = el }}
                                    onClick={(e) => handleSelectItem(item, e.metaKey || e.ctrlKey)}
                                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                                      selectedIndex === flatIdx 
                                        ? 'bg-accent-glow border-accent-primary text-text-primary shadow-sm scale-[1.01]' 
                                        : 'bg-bg-nested/10 border-transparent text-text-secondary hover:bg-bg-nested/30'
                                    }`}
                                  >
                                    <div className="min-w-0 pr-4">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-xs text-text-primary block truncate">
                                          {renderHighlighted(item.title, query)}
                                        </span>
                                        {item.fullName && (
                                          <span className="text-[9px] text-text-muted font-bold font-mono uppercase truncate hidden sm:inline">
                                            {item.fullName}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-text-muted font-semibold block truncate mt-0.5 leading-normal">
                                        {item.description}
                                      </span>
                                    </div>
                                    <CornerDownLeft className={`w-3.5 h-3.5 shrink-0 ${selectedIndex === flatIdx ? 'text-accent-primary translate-x-0 opacity-100' : '-translate-x-2 opacity-0'} transition-all`} />
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                )}

                {/* 4. No Results State */}
                {query.trim() !== '' && !slashCommand && results.length === 0 && (
                  <div className="text-center py-12 px-4 space-y-2">
                    <div className="w-12 h-12 bg-bg-nested/50 border border-border-subtle rounded-xl flex items-center justify-center mx-auto text-text-muted text-lg">
                      ❓
                    </div>
                    <h4 className="text-xs font-black text-text-primary">No Matching Results found</h4>
                    <p className="text-[10px] text-text-muted max-w-sm mx-auto leading-normal">
                      We couldn't find any resources matching <strong className="text-text-secondary">"{query}"</strong>. Double check spelling or search for common acronyms like JWT, PKCE, or mTLS.
                    </p>
                  </div>
                )}

              </div>

              {/* Console control panel footer */}
              <div className="border-t border-border-subtle bg-bg-nested/50 px-4 py-3 flex items-center justify-between text-[10px] text-text-muted font-semibold">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1 font-sans">
                    <kbd className="bg-bg-card border border-border-subtle px-1.5 py-0.5 rounded font-mono text-[9px]">↑↓</kbd> navigate
                  </span>
                  <span className="flex items-center gap-1 font-sans">
                    <kbd className="bg-bg-card border border-border-subtle px-1.5 py-0.5 rounded font-mono text-[9px]">↵</kbd> open
                  </span>
                  <span className="flex items-center gap-1 font-sans">
                    <kbd className="bg-bg-card border border-border-subtle px-1.5 py-0.5 rounded font-mono text-[9px]">⌘↵</kbd> new tab
                  </span>
                </div>
                
                <div className="hidden sm:flex items-center gap-1 font-mono text-[9px]">
                  <Command className="w-3.5 h-3.5" /> <kbd className="bg-bg-card border border-border-subtle px-1.5 py-0.5 rounded">K</kbd> to toggle console
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
