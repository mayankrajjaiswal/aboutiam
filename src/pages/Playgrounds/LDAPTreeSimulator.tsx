import { useState } from 'react'
import { 
  Server, Search, Terminal, Info, Folder, User, Network
} from 'lucide-react'

interface DirectoryNode {
  name: string
  type: 'domain' | 'ou' | 'group' | 'user'
  dn: string
  children?: DirectoryNode[]
}

export default function LDAPTreeSimulator() {
  const [filter, setFilter] = useState('(&(objectClass=user)(memberOf=Engineering_Grp))')
  const [selectedDn, setSelectedDn] = useState<string | null>(null)

  const directoryTree: DirectoryNode = {
    name: 'dc=aboutiam,dc=local',
    type: 'domain',
    dn: 'dc=aboutiam,dc=local',
    children: [
      {
        name: 'ou=Offices',
        type: 'ou',
        dn: 'ou=Offices,dc=aboutiam,dc=local',
        children: [
          {
            name: 'ou=Engineering',
            type: 'ou',
            dn: 'ou=Engineering,ou=Offices,dc=aboutiam,dc=local',
            children: [
              { name: 'cn=alex_developer', type: 'user', dn: 'cn=alex_developer,ou=Engineering,ou=Offices,dc=aboutiam,dc=local' },
              { name: 'cn=emily_architect', type: 'user', dn: 'cn=emily_architect,ou=Engineering,ou=Offices,dc=aboutiam,dc=local' }
            ]
          },
          {
            name: 'ou=Finance',
            type: 'ou',
            dn: 'ou=Finance,ou=Offices,dc=aboutiam,dc=local',
            children: [
              { name: 'cn=john_finance', type: 'user', dn: 'cn=john_finance,ou=Finance,ou=Offices,dc=aboutiam,dc=local' }
            ]
          }
        ]
      },
      {
        name: 'ou=Groups',
        type: 'ou',
        dn: 'ou=Groups,dc=aboutiam,dc=local',
        children: [
          { name: 'cn=Engineering_Grp', type: 'group', dn: 'cn=Engineering_Grp,ou=Groups,dc=aboutiam,dc=local' },
          { name: 'cn=Finance_Grp', type: 'group', dn: 'cn=Finance_Grp,ou=Groups,dc=aboutiam,dc=local' }
        ]
      }
    ]
  }

  // Determine if a node matches the active LDAP filter rule
  const doesNodeMatchFilter = (node: DirectoryNode): boolean => {
    const f = filter.trim().toLowerCase()
    const name = node.name.toLowerCase()

    if (f === '(objectclass=*)') return true
    if (f.includes('objectclass=user')) {
      if (node.type !== 'user') return false
      if (f.includes('memberof=engineering_grp')) return name.includes('alex') || name.includes('emily')
      if (f.includes('memberof=finance_grp')) return name.includes('john')
      return true
    }
    if (f.includes('ou=offices')) return node.dn.includes('ou=offices')
    if (f.includes('cn=alex_developer')) return name.includes('alex')
    if (f.includes('cn=john_finance')) return name.includes('john')
    
    return false
  }

  // Recursive tree node renderer
  const renderTreeNode = (node: DirectoryNode, depth = 0) => {
    const isMatched = doesNodeMatchFilter(node)
    const isSelected = selectedDn === node.dn

    return (
      <div key={node.dn} style={{ paddingLeft: `${depth * 14}px` }} className="space-y-1">
        <button
          onClick={() => setSelectedDn(node.dn)}
          className={`w-full text-left py-1.5 px-3 rounded-lg flex items-center gap-2.5 transition-all text-xs font-semibold ${
            isSelected 
              ? 'bg-accent-glow border border-accent-primary/20 text-accent-primary shadow-sm' 
              : isMatched 
                ? 'bg-status-success/5 border border-status-success/20 text-status-success scale-102 font-extrabold'
                : 'border border-transparent hover:bg-bg-sidebar/50 text-text-secondary'
          }`}
        >
          {node.type === 'domain' && <Network className="w-4 h-4 text-accent-primary shrink-0" />}
          {node.type === 'ou' && <Folder className="w-4 h-4 text-amber-500 shrink-0" />}
          {node.type === 'group' && <Folder className="w-4 h-4 text-accent-secondary shrink-0" />}
          {node.type === 'user' && <User className="w-4 h-4 text-text-muted shrink-0" />}
          
          <span className="truncate">{node.name}</span>
          
          {isMatched && (
            <span className="ml-auto text-[8px] font-black uppercase bg-status-success/15 px-1.5 py-0.5 rounded border border-status-success/20">
              Match
            </span>
          )}
        </button>
        {node.children && node.children.map(child => renderTreeNode(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Server className="w-3.5 h-3.5" /> Directory Services
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          LDAP Tree & Directory Simulator
        </h2>
        <p className="text-text-secondary">
          Visualize corporate organizational schemas. Build standardized LDAP query filters, and witness how LDAP search operations match, filter, and extract records in real-time.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-5 h-fit shadow-sm">
            <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 pb-3 border-b border-border-subtle">
              <Search className="w-4 h-4 text-accent-primary" /> Filter Configurator
            </h4>

            <div className="space-y-4 text-xs font-semibold text-text-secondary">
              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider">Pre-built LDAP Filter</label>
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-[10px]"
                >
                  <option value="(&(objectClass=user)(memberOf=Engineering_Grp))">Engineering Users ONLY</option>
                  <option value="(&(objectClass=user)(memberOf=Finance_Grp))">Finance Users ONLY</option>
                  <option value="(ou=Offices)">Filter Offices OU Subtree</option>
                  <option value="(cn=alex_developer)">Query specific User: Alex</option>
                  <option value="(objectClass=*)">Select ALL Objects (*)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block uppercase tracking-wider">Raw Filter String</label>
                <input 
                  type="text" 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-[10px]" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Directory Tree Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Interactive Tree */}
            <div className="p-6 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block border-b border-border-subtle/50 pb-2">Hierarchical LDAP Schema</span>
              <div className="space-y-1 overflow-y-auto max-h-[380px] custom-scrollbar">
                {renderTreeNode(directoryTree)}
              </div>
            </div>

            {/* Selected Node Inspector Terminal */}
            <div className="p-6 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-4 font-mono">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block border-b border-border-subtle/50 pb-2">Active Object Inspector</span>
              {selectedDn ? (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-accent-primary text-[10px] font-bold block">distinguishedName (DN):</span>
                    <p className="p-2 rounded bg-bg-sidebar border border-border-subtle text-text-primary truncate" title={selectedDn}>
                      {selectedDn}
                    </p>
                  </div>
                  <div className="space-y-2 text-[10px] font-bold text-text-secondary leading-normal">
                    <span className="text-accent-secondary text-[10px] uppercase block">OBJECT METADATA CLAIMS</span>
                    <p>✔ <span className="text-text-muted font-mono">objectClass:</span> {selectedDn.includes('cn=') ? 'user/group' : 'organizationalUnit'}</p>
                    <p>✔ <span className="text-text-muted font-mono">samAccountName:</span> {selectedDn.includes('cn=') ? selectedDn.split(',')[0].split('=')[1] : 'null'}</p>
                    <p>✔ <span className="text-text-muted font-mono">memberOf:</span> {selectedDn.includes('ou=Engineering') ? 'cn=Engineering_Grp,ou=Groups...' : selectedDn.includes('ou=Finance') ? 'cn=Finance_Grp,ou=Groups...' : 'null'}</p>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center p-6 text-xs leading-relaxed text-text-muted font-sans">
                  <Terminal className="w-8 h-8 mb-2 text-text-muted" />
                  <span>Click on any highlighted node in the directory tree on the left to inspect its active distinguished name (DN) and class claims.</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-bg-sidebar/50 border border-border-subtle flex gap-3 text-xs text-text-secondary leading-relaxed font-semibold">
            <Info className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
            <div className="space-y-1.5 font-sans">
              <span className="font-bold text-text-primary text-[10px] uppercase">Directories Concept</span>
              <p>
                In standard directories, LDAP filters query object indices recursively. Standard prefixes like \`cn=\` (Common Name), \`ou=\` (Organizational Unit), and \`dc=\` (Domain Component) parse the database in milliseconds, allowing SSO gateways to map employee groups easily.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
