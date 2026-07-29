import { useState } from 'react'
import { Folder, User, Users, Download, ShieldCheck, Ban, Plus, Trash2 } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import {
  createRootTree, createOuNode, addChild, removeNode, applyGpo, removeGpo,
  toggleBlockInheritance, computeEffectiveGpos, buildDn,
} from '../../lib/tools/ldapSchemaTree'
import type { OuNode, OuNodeType } from '../../lib/tools/ldapSchemaTree'
import { exportTreeToLdif } from '../../lib/tools/ldifExport'

const SAMPLE_GPOS = ['Baseline Security Policy', 'Password Complexity Enforcement', 'Screen Lock After 5 Minutes']

function countOus(node: OuNode): number {
  return (node.type === 'ou' && node.id !== 'root' ? 1 : 0) + node.children.reduce((sum, c) => sum + countOus(c), 0)
}

export default function LdapSchemaDesigner() {
  const {
    score, hintsRevealed, logs, currentStep, isCompleted,
    log, revealHint, adjustScore, completeStep, finishPlayground, resetPlayground,
  } = usePlayground({ moduleId: 'ldap_schema_designer', initialScore: 100, maxHints: 3 })

  const [tree, setTree] = useState<OuNode>(() => addChild(createRootTree(), 'root', createOuNode('Offices', 'ou')))
  const [selectedId, setSelectedId] = useState<string>('root')

  const effectiveGpos = computeEffectiveGpos(tree)
  const ouCount = countOus(tree)

  const selectedNode = (() => {
    function find(node: OuNode): OuNode | null {
      if (node.id === selectedId) return node
      for (const child of node.children) {
        const found = find(child)
        if (found) return found
      }
      return null
    }
    return find(tree)
  })()

  const handleAddChild = (type: OuNodeType) => {
    const name = type === 'ou' ? `OU-${countOus(tree) + 1}` : type === 'group' ? `Group-${Date.now() % 1000}` : `user-${Date.now() % 1000}`
    const child = createOuNode(name, type)
    setTree((prev) => addChild(prev, selectedId, child))
    log('success', `Added ${type.toUpperCase()} "${name}" under ${selectedNode?.name ?? 'root'}.`)
    adjustScore(5)

    if (currentStep === 0 && type === 'ou') {
      completeStep(0, 'Checkpoint 1 verified: built a nested OU structure.')
    }
  }

  const handleRemove = (id: string) => {
    if (id === 'root') return
    setTree((prev) => removeNode(prev, id))
    if (selectedId === id) setSelectedId('root')
    log('info', 'Removed node and its descendants.')
  }

  const handleApplyGpo = (id: string, gpo: string) => {
    setTree((prev) => (gpo ? applyGpo(prev, id, gpo) : removeGpo(prev, id)))
    if (gpo) {
      log('success', `Linked GPO "${gpo}" to OU.`)
      if (currentStep === 1) completeStep(1, 'Checkpoint 2 verified: linked a GPO to an OU and watched it cascade.')
    }
  }

  const handleToggleBlock = (id: string) => {
    setTree((prev) => toggleBlockInheritance(prev, id))
    log('warning', 'Toggled GPO inheritance blocking on this OU.')
    if (currentStep === 2) completeStep(2, 'Checkpoint 3 verified: blocked inheritance and confirmed the parent GPO stopped cascading.')
  }

  const handleDownloadLdif = () => {
    const ldif = exportTreeToLdif(tree)
    const blob = new Blob([ldif], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'ldap-schema-export.ldif'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    log('success', 'Exported the constructed tree as LDIF.')
  }

  const handleRevealHint = () => {
    const hints = [
      'Select a node in the tree, then use "Add Child" to nest an OU, group, or user placeholder beneath it.',
      'Applying a GPO to a parent OU cascades it down to every child OU automatically — select a child to see the "Effective GPOs" list include it.',
      'Toggle "Block Inheritance" on a child OU to stop GPOs from ancestors above it from cascading down — a GPO applied directly on that same OU still applies.',
    ]
    revealHint(hints[hintsRevealed])
  }

  const canFinish = ouCount >= 3 && currentStep <= 2

  const handleFinish = () => {
    if (!canFinish) return
    finishPlayground(`🎉 Designed a ${ouCount}-OU schema and exported it as LDIF.`)
  }

  function renderNode(node: OuNode, depth = 0) {
    const isSelected = selectedId === node.id
    const effective = effectiveGpos.get(node.id) ?? []
    const Icon = node.type === 'ou' ? Folder : node.type === 'group' ? Users : User

    return (
      <div key={node.id} style={{ paddingLeft: `${depth * 16}px` }} className="space-y-1">
        <button
          type="button"
          onClick={() => setSelectedId(node.id)}
          className={`w-full text-left py-1.5 px-2.5 rounded-lg flex items-center gap-2 text-xs font-semibold transition-all ${
            isSelected ? 'bg-accent-glow border border-accent-primary/40 text-accent-primary' : 'border border-transparent hover:bg-bg-nested text-text-secondary'
          }`}
        >
          <Icon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{node.id === 'root' ? 'dc=aboutiam,dc=local' : node.name}</span>
          {node.type === 'ou' && node.blockInheritance && (
            <span title="Inheritance blocked"><Ban className="w-3 h-3 text-status-danger shrink-0" /></span>
          )}
          {node.type === 'ou' && effective.length > 0 && (
            <span className="ml-auto text-[8px] font-black uppercase bg-status-success/15 text-status-success px-1.5 py-0.5 rounded border border-status-success/20">
              {effective.length} GPO{effective.length > 1 ? 's' : ''}
            </span>
          )}
        </button>
        {node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    )
  }

  return (
    <PlaygroundShell
      title="AD/LDAP OU & Schema Designer"
      description="Build an Organizational Unit tree from scratch, apply GPOs that cascade down through inheritance (or block it), and export the result as valid LDIF."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={3}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={() => {
        setTree(addChild(createRootTree(), 'root', createOuNode('Offices', 'ou')))
        setSelectedId('root')
        resetPlayground()
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-2">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Directory Tree</span>
            <div className="space-y-1 max-h-72 overflow-y-auto">{renderNode(tree)}</div>
          </div>

          <div className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-3">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
              Selected: {selectedNode ? (selectedNode.id === 'root' ? 'Root Domain' : selectedNode.name) : 'None'}
            </span>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => handleAddChild('ou')} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-accent-glow border border-accent-primary/30 text-accent-primary text-[11px] font-bold">
                <Plus className="w-3 h-3" /> Add Child OU
              </button>
              <button type="button" onClick={() => handleAddChild('group')} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-text-secondary text-[11px] font-bold">
                <Plus className="w-3 h-3" /> Add Group
              </button>
              <button type="button" onClick={() => handleAddChild('user')} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-bg-card border border-border-subtle text-text-secondary text-[11px] font-bold">
                <Plus className="w-3 h-3" /> Add User
              </button>
              {selectedId !== 'root' && (
                <button type="button" onClick={() => handleRemove(selectedId)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-status-danger/10 border border-status-danger/30 text-status-danger text-[11px] font-bold">
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              )}
            </div>

            {selectedNode?.type === 'ou' && (
              <div className="space-y-2 pt-2 border-t border-border-subtle/50">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Linked GPO</label>
                <select
                  aria-label="Linked GPO"
                  value={selectedNode.gpoApplied ?? ''}
                  onChange={(e) => handleApplyGpo(selectedId, e.target.value)}
                  className="w-full p-2 rounded-lg bg-bg-card border border-border-subtle text-text-primary text-[11px]"
                >
                  <option value="">— No GPO linked —</option>
                  {SAMPLE_GPOS.map((gpo) => (
                    <option key={gpo} value={gpo}>{gpo}</option>
                  ))}
                </select>

                <label className="text-xs font-bold text-text-secondary flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={!!selectedNode.blockInheritance}
                    onChange={() => handleToggleBlock(selectedId)}
                  />
                  Block GPO Inheritance from ancestors
                </label>

                <div className="text-[10px] font-mono text-text-muted pt-1">
                  Effective GPOs: {(effectiveGpos.get(selectedId) ?? []).join(', ') || 'none'}
                </div>
              </div>
            )}

            <div className="text-[10px] font-mono text-text-muted pt-2 border-t border-border-subtle/50 truncate" title={buildDn(tree, selectedId) ?? ''}>
              DN: {selectedId === 'root' ? 'dc=aboutiam,dc=local' : buildDn(tree, selectedId)}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadLdif}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5" /> Export Tree as LDIF
        </button>

        <button
          type="button"
          onClick={handleFinish}
          disabled={!canFinish || isCompleted}
          className="w-full py-2.5 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          {ouCount >= 3 ? 'Finalize Schema Design' : `Build at least 3 OUs to finalize (${ouCount}/3)`}
        </button>
      </div>
    </PlaygroundShell>
  )
}
