import { useMemo, useState } from 'react'
import { Check, Copy, X } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'
import { serializeLdapNode } from '../../lib/tools/ldapFilter'
import type { LdapCondition, LdapGroup, LdapNode, LdapOperator } from '../../lib/tools/ldapFilter'

const tool = getToolBySlug('ldap-filter-builder')!

type UiCondition = LdapCondition & { id: string }
interface UiGroup {
  type: 'group'
  id: string
  connective: LdapGroup['connective']
  children: UiNode[]
}
type UiNode = UiCondition | UiGroup

function newCondition(): UiCondition {
  return { type: 'condition', id: crypto.randomUUID(), attribute: '', operator: '=', value: '' }
}

function newGroup(connective: LdapGroup['connective'] = 'AND'): UiGroup {
  return { type: 'group', id: crypto.randomUUID(), connective, children: [] }
}

function stripIds(node: UiNode): LdapNode {
  if (node.type === 'condition') {
    return { type: 'condition', attribute: node.attribute, operator: node.operator, value: node.value }
  }
  return { type: 'group', connective: node.connective, children: node.children.map(stripIds) }
}

function updateCondition(node: UiNode, id: string, patch: Partial<LdapCondition>): UiNode {
  if (node.type === 'condition') return node.id === id ? { ...node, ...patch } : node
  return { ...node, children: node.children.map((child) => updateCondition(child, id, patch)) }
}

function updateConnective(node: UiNode, id: string, connective: LdapGroup['connective']): UiNode {
  if (node.type === 'condition') return node
  const updated = node.id === id ? { ...node, connective } : node
  return { ...updated, children: updated.children.map((child) => updateConnective(child, id, connective)) }
}

function addChild(node: UiNode, groupId: string, child: UiNode): UiNode {
  if (node.type === 'condition') return node
  if (node.id === groupId) return { ...node, children: [...node.children, child] }
  return { ...node, children: node.children.map((c) => addChild(c, groupId, child)) }
}

function removeNode(node: UiNode, id: string): UiNode {
  if (node.type === 'condition') return node
  return { ...node, children: node.children.filter((c) => c.id !== id).map((c) => removeNode(c, id)) }
}

const INITIAL_ROOT: UiGroup = {
  type: 'group',
  id: 'root',
  connective: 'AND',
  children: [
    { type: 'condition', id: crypto.randomUUID(), attribute: 'objectClass', operator: '=', value: 'user' },
    { type: 'condition', id: crypto.randomUUID(), attribute: 'memberOf', operator: '=', value: 'cn=Admins,ou=Groups,dc=corp,dc=com' },
  ],
}

export default function LdapFilterBuilder() {
  const [root, setRoot] = useState<UiGroup>(INITIAL_ROOT)
  const { copy, copiedId } = useClipboardCopy()

  const filterString = useMemo(() => serializeLdapNode(stripIds(root)), [root])

  const applyUpdate = (updater: (root: UiNode) => UiNode) => {
    setRoot((prev) => updater(prev) as UiGroup)
  }

  return (
    <ToolPageShell tool={tool}>
      <GroupEditor node={root} onUpdate={applyUpdate} isRoot />

      <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-2 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">RFC 4515 Filter String</span>
          <button type="button" onClick={() => copy(filterString, 'filter')} aria-label="Copy filter string" className="text-text-muted hover:text-text-primary">
            {copiedId === 'filter' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <p className="text-xs font-mono text-text-primary break-all bg-bg-sidebar p-3 rounded border border-border-subtle/50">
          {filterString || '(empty filter — add a condition above)'}
        </p>
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}

function GroupEditor({
  node,
  onUpdate,
  onRemove,
  isRoot,
}: {
  node: UiGroup
  onUpdate: (updater: (root: UiNode) => UiNode) => void
  onRemove?: () => void
  isRoot?: boolean
}) {
  return (
    <div className="p-4 rounded-xl border border-border-subtle bg-bg-sidebar/40 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="inline-flex rounded-lg border border-border-subtle overflow-hidden">
          {(['AND', 'OR', 'NOT'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onUpdate((r) => updateConnective(r, node.id, c))}
              className={`px-3 py-1.5 text-[11px] font-bold transition-colors ${node.connective === c ? 'bg-accent-primary text-white' : 'bg-bg-card text-text-secondary hover:bg-bg-sidebar'}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => onUpdate((r) => addChild(r, node.id, newCondition()))} className="text-[11px] font-bold text-accent-primary">
            + Condition
          </button>
          <button type="button" onClick={() => onUpdate((r) => addChild(r, node.id, newGroup()))} className="text-[11px] font-bold text-accent-secondary">
            + Group
          </button>
          {!isRoot && onRemove && (
            <button type="button" onClick={onRemove} aria-label="Remove group" className="text-[11px] font-bold text-status-danger">
              Remove Group
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 pl-4 border-l-2 border-border-subtle/50">
        {node.children.length === 0 && <p className="text-[11px] text-text-muted italic">No conditions yet — add one above.</p>}
        {node.children.map((child) =>
          child.type === 'condition' ? (
            <ConditionRow
              key={child.id}
              condition={child}
              onChange={(patch) => onUpdate((r) => updateCondition(r, child.id, patch))}
              onRemove={() => onUpdate((r) => removeNode(r, child.id))}
            />
          ) : (
            <GroupEditor key={child.id} node={child} onUpdate={onUpdate} onRemove={() => onUpdate((r) => removeNode(r, child.id))} />
          )
        )}
      </div>
    </div>
  )
}

function ConditionRow({
  condition,
  onChange,
  onRemove,
}: {
  condition: UiCondition
  onChange: (patch: Partial<LdapCondition>) => void
  onRemove: () => void
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full min-w-0">
      <div className="flex gap-2 min-w-0 w-full sm:w-auto">
        <input
          value={condition.attribute}
          onChange={(e) => onChange({ attribute: e.target.value })}
          placeholder="attribute"
          aria-label="Attribute name"
          className="w-full sm:w-32 min-w-0 p-2 rounded-lg bg-bg-card border border-border-subtle text-xs font-mono focus:outline-none focus:border-accent-primary"
        />
        <select
          value={condition.operator}
          onChange={(e) => onChange({ operator: e.target.value as LdapOperator })}
          aria-label="Operator"
          className="w-16 shrink-0 p-2 rounded-lg bg-bg-card border border-border-subtle text-xs font-mono focus:outline-none focus:border-accent-primary"
        >
          <option value="=">=</option>
          <option value="~=">~=</option>
          <option value=">=">&gt;=</option>
          <option value="<=">&lt;=</option>
        </select>
      </div>
      <div className="flex gap-2 min-w-0 w-full sm:flex-1">
        <input
          value={condition.value}
          onChange={(e) => onChange({ value: e.target.value })}
          placeholder="value"
          aria-label="Value"
          className="flex-1 min-w-0 p-2 rounded-lg bg-bg-card border border-border-subtle text-xs font-mono focus:outline-none focus:border-accent-primary"
        />
        <button type="button" onClick={onRemove} aria-label="Remove condition" className="text-text-muted hover:text-status-danger shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
