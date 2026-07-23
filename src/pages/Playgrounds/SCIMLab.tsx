import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, UserPlus, Trash2, ArrowRight, RefreshCw, 
  CheckCircle, Terminal, HelpCircle, FileJson, Layers, Settings, Play, Database
} from 'lucide-react'

interface SCIMUser {
  id: string
  userName: string
  givenName: string
  familyName: string
  email: string
  active: boolean
}

interface SCIMGroup {
  id: string
  displayName: string
  members: string[] // User IDs
}

interface SyncLog {
  id: string
  timestamp: string
  method: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  status: number
  requestBody: string
  responseBody: string
  message: string
}

export default function SCIMLab() {
  // IdP Directory State
  const [idpUsers, setIdpUsers] = useState<SCIMUser[]>([
    { id: 'usr-1', userName: 'alice.security', givenName: 'Alice', familyName: 'Smith', email: 'alice@company.com', active: true },
    { id: 'usr-2', userName: 'bob.identity', givenName: 'Bob', familyName: 'Jones', email: 'bob@company.com', active: true },
    { id: 'usr-3', userName: 'charlie.cloud', givenName: 'Charlie', familyName: 'Brown', email: 'charlie@company.com', active: false },
  ])

  const [idpGroups, setIdpGroups] = useState<SCIMGroup[]>([
    { id: 'grp-1', displayName: 'Security-Admins', members: ['usr-1'] },
    { id: 'grp-2', displayName: 'Engineering', members: ['usr-1', 'usr-2'] }
  ])

  // SP (SaaS Database) State
  const [spUsers, setSpUsers] = useState<SCIMUser[]>([
    { id: 'usr-1', userName: 'alice.security', givenName: 'Alice', familyName: 'Smith', email: 'alice@company.com', active: true },
    { id: 'usr-2', userName: 'bob.identity', givenName: 'Bob', familyName: 'Jones', email: 'bob@company.com', active: true }
  ])

  const [spGroups, setSpGroups] = useState<SCIMGroup[]>([
    { id: 'grp-1', displayName: 'Security-Admins', members: ['usr-1'] },
    { id: 'grp-2', displayName: 'Engineering', members: ['usr-1', 'usr-2'] }
  ])

  // Sync / Simulator Controls
  const [syncMode, setSyncMode] = useState<'perfect' | 'rate_limit' | 'conflict'>('perfect')
  const [syncQueue, setSyncQueue] = useState<{ id: string; action: () => void; description: string }[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [logs, setLogs] = useState<SyncLog[]>([])
  const [activeLog, setActiveLog] = useState<SyncLog | null>(null)
  
  // New User Form Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newGivenName, setNewGivenName] = useState('')
  const [newFamilyName, setNewFamilyName] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [newEmail, setNewEmail] = useState('')

  const processNextQueueItem = async () => {
    if (syncQueue.length === 0) return
    setIsSyncing(true)

    const nextItem = syncQueue[0]
    setSyncQueue(prev => prev.slice(1))

    // Visual transmission delay
    await new Promise(resolve => setTimeout(resolve, 800))
    nextItem.action()

    setIsSyncing(false)
  }

  // Auto-run Queue when items are added and not currently syncing
  useEffect(() => {
    if (syncQueue.length > 0 && !isSyncing) {
      setTimeout(() => processNextQueueItem(), 0)
    }
    // processNextQueueItem is an unmemoized async closure recreated every
    // render; it only reads syncQueue/isSyncing, both already listed below,
    // so including the function itself would just rerun this effect on every
    // unrelated render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncQueue, isSyncing])

  // Log Helper
  const addLog = (
    method: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    status: number,
    requestObj: unknown,
    responseObj: unknown,
    message: string
  ) => {
    const newLog: SyncLog = {
      // Log id only needs to be unique for the React key + display order, and addLog is
      // always invoked from event handlers or the async sync queue, never during render.
      // eslint-disable-next-line react-hooks/purity
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      method,
      path,
      status,
      requestBody: JSON.stringify(requestObj, null, 2),
      responseBody: JSON.stringify(responseObj, null, 2),
      message
    }
    setLogs(prev => [newLog, ...prev])
    setActiveLog(newLog)
  }

  // --- ACTIONS TRIGERRED FROM IDP DIRECTORY ---

  // Add User Operation
  const triggerAddUser = (given: string, family: string, uname: string, email: string) => {
    // Only ever invoked from the "Add User" form submit handler, never during render.
    // eslint-disable-next-line react-hooks/purity
    const userId = `usr-${Math.random().toString(36).substr(2, 4)}`
    const newUser: SCIMUser = {
      id: userId,
      userName: uname || `${given.toLowerCase()}.${family.toLowerCase()}`,
      givenName: given,
      familyName: family,
      email: email || `${given.toLowerCase()}@company.com`,
      active: true
    }

    // Add to IdP instantly
    setIdpUsers(prev => [...prev, newUser])

    // Push Sync Action to Queue
    const syncAction = () => {
      // SCIM RFC 7643 Request Payload Builder
      const scimRequestPayload = {
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
        userName: newUser.userName,
        name: {
          familyName: newUser.familyName,
          givenName: newUser.givenName
        },
        emails: [
          {
            value: newUser.email,
            type: "work",
            primary: true
          }
        ],
        active: newUser.active
      }

      // Conflict Simulation: Username already exists in SP Database
      if (syncMode === 'conflict' && spUsers.some(u => u.userName === newUser.userName)) {
        addLog(
          'POST',
          '/v2/Users',
          409,
          scimRequestPayload,
          {
            schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
            detail: `User with userName '${newUser.userName}' already exists.`,
            status: "409"
          },
          `❌ [Conflict] Provisioning of user '${newUser.userName}' failed on Target Database. Unique constraint violation.`
        )
        return
      }

      // Rate Limit Simulation
      if (syncMode === 'rate_limit') {
        addLog(
          'POST',
          '/v2/Users',
          429,
          scimRequestPayload,
          {
            schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
            detail: "Too many concurrent sync requests. Rate limit exceeded.",
            status: "429"
          },
          `⚠️ [Rate Limit] Request throttled with status 429. Re-queueing request for retry with exponential backoff...`
        )
        // Put back in queue to show retry
        setSyncQueue(prev => [...prev, { id: `retry-${Date.now()}`, action: syncAction, description: `Retry: Sync User ${newUser.userName}` }])
        return
      }

      // Successful creation
      const responsePayload = {
        schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
        id: userId,
        userName: newUser.userName,
        name: {
          familyName: newUser.familyName,
          givenName: newUser.givenName
        },
        emails: [
          {
            value: newUser.email,
            type: "work",
            primary: true
          }
        ],
        active: newUser.active,
        meta: {
          resourceType: "User",
          created: new Date().toISOString(),
          location: `https://api.saasapp.com/scim/v2/Users/${userId}`
        }
      }

      setSpUsers(prev => [...prev, newUser])
      addLog(
        'POST',
        '/v2/Users',
        201,
        scimRequestPayload,
        responsePayload,
        `✅ [Created] User '${newUser.userName}' successfully provisioned in SaaS Target Database.`
      )
    }

    setSyncQueue(prev => [...prev, { id: `add-${userId}`, action: syncAction, description: `Provision User: ${newUser.userName}` }])
  }

  // Toggle User Active Status (Joiner / Mover / Leaver scenario)
  const toggleUserStatus = (userId: string) => {
    let targetUser: SCIMUser | undefined
    setIdpUsers(prev => prev.map(u => {
      if (u.id === userId) {
        targetUser = { ...u, active: !u.active }
        return targetUser
      }
      return u
    }))

    if (!targetUser) return
    const updatedUser = targetUser as SCIMUser

    const syncAction = () => {
      // RFC 7644 PATCH payload to toggle status
      const patchRequestPayload = {
        schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
        Operations: [
          {
            op: "replace",
            value: {
              active: updatedUser.active
            }
          }
        ]
      }

      // Simulate API outcomes
      if (syncMode === 'rate_limit') {
        addLog('PATCH', `/v2/Users/${userId}`, 429, patchRequestPayload, { detail: "Rate limit reached." }, `⚠️ PATCH /Users/${userId} throttled. Re-queueing...`)
        setSyncQueue(prev => [...prev, { id: `retry-toggle-${userId}`, action: syncAction, description: `Retry: Update User Status ${updatedUser.userName}` }])
        return
      }

      // Check if user exists on SP
      const existsOnSp = spUsers.some(u => u.id === userId)
      if (!existsOnSp) {
        addLog(
          'PATCH',
          `/v2/Users/${userId}`,
          404,
          patchRequestPayload,
          { status: "404", detail: `Resource ${userId} not found` },
          `❌ [Not Found] Failed to disable user ${updatedUser.userName} on Target: User does not exist in target database.`
        )
        return
      }

      setSpUsers(prev => prev.map(u => u.id === userId ? { ...u, active: updatedUser.active } : u))
      addLog(
        'PATCH',
        `/v2/Users/${userId}`,
        200,
        patchRequestPayload,
        {
          schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
          id: userId,
          userName: updatedUser.userName,
          active: updatedUser.active
        },
        `🔄 [Updated] User status toggled on SaaS Target Database. Active: ${updatedUser.active ? 'TRUE (Enabled)' : 'FALSE (De-provisioned)'}.`
      )
    }

    setSyncQueue(prev => [...prev, { id: `patch-${userId}`, action: syncAction, description: `Sync Status: ${updatedUser.userName}` }])
  }

  // Delete User (Hard de-provisioning)
  const deleteUser = (userId: string) => {
    const userToDelete = idpUsers.find(u => u.id === userId)
    if (!userToDelete) return

    // Remove from IdP and groups instantly
    setIdpUsers(prev => prev.filter(u => u.id !== userId))
    setIdpGroups(prev => prev.map(g => ({ ...g, members: g.members.filter(id => id !== userId) })))

    const syncAction = () => {
      if (syncMode === 'rate_limit') {
        addLog('DELETE', `/v2/Users/${userId}`, 429, {}, { detail: "Rate limit reached" }, `⚠️ DELETE /Users/${userId} throttled. Re-queueing...`)
        setSyncQueue(prev => [...prev, { id: `retry-delete-${userId}`, action: syncAction, description: `Retry: Hard Delete ${userToDelete.userName}` }])
        return
      }

      const existsOnSp = spUsers.some(u => u.id === userId)
      if (!existsOnSp) {
        addLog('DELETE', `/v2/Users/${userId}`, 404, {}, { detail: "Not found" }, `❌ [Not Found] User '${userToDelete.userName}' already removed or never existed on Target.`)
        return
      }

      setSpUsers(prev => prev.filter(u => u.id !== userId))
      setSpGroups(prev => prev.map(g => ({ ...g, members: g.members.filter(id => id !== userId) })))

      addLog(
        'DELETE',
        `/v2/Users/${userId}`,
        204,
        {},
        {},
        `🗑️ [Deleted] Hard deletion completed for user '${userToDelete.userName}' on Target Database.`
      )
    }

    setSyncQueue(prev => [...prev, { id: `delete-${userId}`, action: syncAction, description: `Hard Delete User: ${userToDelete.userName}` }])
  }

  // Group Member Assignment Toggle
  const toggleGroupMember = (groupId: string, userId: string) => {
    let updatedGroup: SCIMGroup | undefined

    setIdpGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        const isMember = g.members.includes(userId)
        const members = isMember 
          ? g.members.filter(id => id !== userId)
          : [...g.members, userId]
        updatedGroup = { ...g, members }
        return updatedGroup
      }
      return g
    }))

    if (!updatedGroup) return
    const targetGroup = updatedGroup as SCIMGroup
    const userObj = idpUsers.find(u => u.id === userId) || spUsers.find(u => u.id === userId)
    const uName = userObj ? userObj.userName : userId

    const syncAction = () => {
      const isAdding = targetGroup.members.includes(userId)

      // RFC 7644 PATCH operations for Group Membership updates
      const patchRequestPayload = {
        schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
        Operations: [
          {
            op: isAdding ? "add" : "remove",
            path: "members",
            value: [
              {
                value: userId,
                display: uName
              }
            ]
          }
        ]
      }

      if (syncMode === 'rate_limit') {
        addLog('PATCH', `/v2/Groups/${groupId}`, 429, patchRequestPayload, { detail: "Rate limit reached" }, `⚠️ PATCH /Groups/${groupId} throttled. Re-queueing...`)
        setSyncQueue(prev => [...prev, { id: `retry-group-patch-${groupId}-${userId}`, action: syncAction, description: `Retry: Update members in ${targetGroup.displayName}` }])
        return
      }

      setSpGroups(prev => prev.map(g => {
        if (g.id === groupId) {
          return { ...g, members: isAdding ? [...g.members, userId] : g.members.filter(id => id !== userId) }
        }
        return g
      }))

      addLog(
        'PATCH',
        `/v2/Groups/${groupId}`,
        204,
        patchRequestPayload,
        {},
        `👥 [Membership Update] ${isAdding ? 'Added' : 'Removed'} member '${uName}' ${isAdding ? 'to' : 'from'} SaaS Group '${targetGroup.displayName}'.`
      )
    }

    setSyncQueue(prev => [...prev, { id: `group-patch-${groupId}-${userId}`, action: syncAction, description: `Update members in ${targetGroup.displayName}` }])
  }

  // Prepopulate standard form details
  const openModal = () => {
    setNewGivenName('')
    setNewFamilyName('')
    setNewUsername('')
    setNewEmail('')
    setShowAddUserModal(true)
  }

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGivenName || !newFamilyName) return
    triggerAddUser(newGivenName, newFamilyName, newUsername, newEmail)
    setShowAddUserModal(false)
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      {/* Upper Navigation/Shell */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="text-teal-400 w-6 h-6 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">SCIM Provisioning Lab</h1>
            <p className="text-xs text-text-muted">RFC 7643 & RFC 7644 client-side sync sandbox</p>
          </div>
        </div>
        <Link to="/playground" className="text-sm bg-bg-nested hover:bg-bg-nested/80 px-3 py-1.5 rounded text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Back to Catalog
        </Link>
      </div>

      {/* Main Container */}
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col: IdP Directory */}
        <div className="lg:col-span-4 bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Users className="text-blue-400 w-5 h-5" />
                <h2 className="font-semibold text-base text-slate-200">Identity Provider (IdP)</h2>
              </div>
              <button 
                onClick={openModal} 
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-2.5 py-1.5 rounded flex items-center gap-1 transition"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add User
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Acts as the central source of truth (e.g., Entra ID, Okta). Modifying states here triggers automated REST provisioning payloads over the sync bridge.
            </p>

            {/* Users List */}
            <div className="space-y-3 mb-6">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Users</h3>
              {idpUsers.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No users left in directory.</p>
              ) : (
                idpUsers.map(user => (
                  <div key={user.id} className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 flex justify-between items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        <span className="font-medium text-sm text-slate-200 truncate">{user.givenName} {user.familyName}</span>
                      </div>
                      <span className="block text-xs text-slate-400 truncate">{user.userName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 ml-2">
                      <button 
                        onClick={() => toggleUserStatus(user.id)}
                        className={`text-xs px-2 py-1 rounded font-medium transition ${user.active ? 'bg-slate-800 hover:bg-rose-950/45 text-slate-300' : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50'}`}
                        title={user.active ? "Simulate termination / de-provisioning" : "Simulate onboarding / enabling"}
                      >
                        {user.active ? 'Disable' : 'Enable'}
                      </button>
                      <button 
                        onClick={() => deleteUser(user.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition"
                        title="Hard Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Groups & Members Assignment */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Group Memberships</h3>
              {idpGroups.map(grp => (
                <div key={grp.id} className="bg-slate-900/40 border border-slate-800/50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-blue-300">{grp.displayName}</span>
                    <span className="text-xs bg-blue-950/40 text-blue-300 border border-blue-900/50 px-2 py-0.5 rounded-full">
                      {grp.members.length} members
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {idpUsers.map(user => {
                      const isMember = grp.members.includes(user.id)
                      return (
                        <button
                          key={user.id}
                          onClick={() => toggleGroupMember(grp.id, user.id)}
                          className={`text-left text-xs p-1.5 rounded border transition ${isMember ? 'bg-blue-950/35 border-blue-800/60 text-blue-200' : 'bg-slate-900/30 border-slate-800/50 text-slate-400 hover:border-slate-700'}`}
                        >
                          {isMember ? '✓ ' : '+ '} {user.givenName}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800/60 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-400 leading-normal">
                <span className="font-semibold text-slate-300 block mb-0.5">Analogy: The Sync Pipeline</span>
                SCIM is a multi-tenant corporate bouncer system: instead of manually updating employees on every site, SCIM pipes changes instantly over HTTP API requests.
              </div>
            </div>
          </div>
        </div>

        {/* Middle Col: Bridge, Queues, and Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Controls Box */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="text-teal-400 w-5 h-5" />
              <h2 className="font-semibold text-base text-slate-200">Simulation Settings</h2>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Sync Mode Policy</label>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={() => setSyncMode('perfect')}
                    className={`text-left p-2.5 rounded-lg border text-xs flex flex-col gap-0.5 transition ${syncMode === 'perfect' ? 'bg-emerald-950/30 border-emerald-500/55 text-emerald-300' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                  >
                    <span className="font-bold flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${syncMode === 'perfect' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
                      Perfect Sync (Standard)
                    </span>
                    <span>All REST requests succeed on target system with 200 OK or 201 Created.</span>
                  </button>

                  <button 
                    onClick={() => setSyncMode('rate_limit')}
                    className={`text-left p-2.5 rounded-lg border text-xs flex flex-col gap-0.5 transition ${syncMode === 'rate_limit' ? 'bg-amber-950/30 border-amber-500/55 text-amber-300' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                  >
                    <span className="font-bold flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${syncMode === 'rate_limit' ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`}></span>
                      Rate Limiting (HTTP 429)
                    </span>
                    <span>Generates 429 errors. Simulates automated queueing, backoff, and retries.</span>
                  </button>

                  <button 
                    onClick={() => setSyncMode('conflict')}
                    className={`text-left p-2.5 rounded-lg border text-xs flex flex-col gap-0.5 transition ${syncMode === 'conflict' ? 'bg-rose-950/30 border-rose-500/55 text-rose-300' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                  >
                    <span className="font-bold flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${syncMode === 'conflict' ? 'bg-rose-400 animate-pulse' : 'bg-slate-600'}`}></span>
                      Unique Conflicts (HTTP 409)
                    </span>
                    <span>Rejects username collisions to demonstrate active directory collision handling.</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sync Queue Monitor */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className={`text-blue-400 w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <h2 className="font-semibold text-base text-slate-200">Active Sync Queue</h2>
                </div>
                {syncQueue.length > 0 && (
                  <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono">
                    Pending: {syncQueue.length}
                  </span>
                )}
              </div>

              <div className="border border-slate-800 bg-slate-900/60 rounded-lg p-3 h-40 overflow-y-auto mb-4 font-mono text-xs">
                {isSyncing && (
                  <div className="flex items-center gap-2 text-blue-300 mb-2 p-1.5 bg-blue-950/20 border border-blue-900/45 rounded animate-pulse">
                    <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span>Transmitting REST payload to SP...</span>
                  </div>
                )}

                {syncQueue.length === 0 && !isSyncing ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-1 select-none text-center">
                    <CheckCircle className="w-6 h-6 text-slate-600" />
                    <span>Sync queue idle.</span>
                    <span className="text-[10px] text-slate-600 max-w-[200px]">Perform an action in the IdP to queue a new API transaction.</span>
                  </div>
                ) : (
                  syncQueue.map((item, index) => (
                    <div key={item.id} className="p-1.5 border-b border-slate-800 text-slate-400 flex items-center gap-1.5 last:border-0">
                      <span className="text-slate-600">[{index + 1}]</span>
                      <span className="truncate">{item.description}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sync Pipe Visual representation */}
            <div className="pt-2">
              <div className="relative border border-slate-800 bg-slate-950/45 rounded-lg p-4 flex justify-between items-center overflow-hidden">
                <div className="text-center shrink-0">
                  <span className="block font-bold text-slate-300 text-[10px] uppercase tracking-wider">IdP</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400 mx-auto mt-1"></div>
                </div>

                {/* Simulated flowing dots representing queue actions */}
                <div className="flex-1 px-4 relative flex justify-center">
                  <div className="w-full h-0.5 bg-slate-800 absolute top-1/2 left-0 -translate-y-1/2"></div>
                  {isSyncing && (
                    <div className="w-3 h-3 bg-teal-400 rounded-full absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex items-center justify-center animate-ping">
                      <span className="w-1.5 h-1.5 bg-teal-300 rounded-full"></span>
                    </div>
                  )}
                </div>

                <div className="text-center shrink-0">
                  <span className="block font-bold text-slate-300 text-[10px] uppercase tracking-wider">SaaS SP</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mx-auto mt-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: SP Database Target */}
        <div className="lg:col-span-4 bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database className="text-emerald-400 w-5 h-5" />
                <h2 className="font-semibold text-base text-slate-200">SaaS App Database</h2>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded">
                Target Service
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Target application database (e.g., Slack directory, Salesforce accounts). Receives REST calls and updates records locally.
            </p>

            {/* Synced Target Users */}
            <div className="space-y-3 mb-6">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Synced Records</h3>
              {spUsers.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No active database records.</p>
              ) : (
                spUsers.map(user => (
                  <div key={user.id} className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`w-2 h-2 rounded-full ${user.active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                        <span className="font-medium text-sm text-slate-200">{user.givenName} {user.familyName}</span>
                      </div>
                      <span className="block text-xs text-slate-400">{user.userName}</span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.active ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' : 'bg-rose-950/40 text-rose-400 border border-rose-800/40'}`}>
                      {user.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Target Synced Groups */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Group States</h3>
              {spGroups.map(grp => (
                <div key={grp.id} className="bg-slate-900/40 border border-slate-800/50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-teal-300 uppercase tracking-wide">{grp.displayName}</span>
                    <span className="text-xs bg-teal-950/30 text-teal-300 border border-teal-800/40 px-2 py-0.5 rounded-full">
                      {grp.members.length} Synced
                    </span>
                  </div>

                  {grp.members.length === 0 ? (
                    <span className="text-[10px] text-slate-500 italic">No members synced.</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {grp.members.map(memId => {
                        const targetUser = spUsers.find(u => u.id === memId)
                        return (
                          <span key={memId} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                            {targetUser ? targetUser.userName : memId}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800/60 flex items-start gap-2">
              <Terminal className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-400 leading-normal">
                <span className="font-semibold text-slate-300 block mb-0.5">REST API Execution Model</span>
                Target apps expose standard `/Users` and `/Groups` REST endpoints mapping HTTP methods to local DB operations.
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Under Section: Raw Payload Auditor & Log Tracker */}
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 pt-0">
        
        {/* Sync Transactions Log Stream */}
        <div className="lg:col-span-5 bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex flex-col h-[340px]">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="text-blue-400 w-5 h-5" />
              <h2 className="font-semibold text-sm text-slate-200">HTTP REST Transaction Stream</h2>
            </div>
            {logs.length > 0 && (
              <button 
                onClick={() => { setLogs([]); setActiveLog(null) }} 
                className="text-xs text-slate-500 hover:text-slate-300 transition"
              >
                Clear Log
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 font-mono text-[11px] pr-1.5">
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500 italic text-center">
                Transaction log stream is empty. Change any IdP state to generate HTTP sync events.
              </div>
            ) : (
              logs.map(log => {
                const isSuccess = log.status >= 200 && log.status < 300
                const isThrottled = log.status === 429
                return (
                  <div 
                    key={log.id} 
                    onClick={() => setActiveLog(log)}
                    className={`p-2.5 rounded border cursor-pointer transition ${activeLog?.id === log.id ? 'bg-slate-900 border-blue-500 text-slate-100 shadow' : 'bg-slate-950/40 border-slate-850 hover:bg-slate-900/60 text-slate-300'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded font-extrabold text-[9px] ${
                          log.method === 'POST' ? 'bg-blue-950/50 text-blue-400 border border-blue-900/40' :
                          log.method === 'PATCH' ? 'bg-teal-950/50 text-teal-400 border border-teal-900/45' :
                          log.method === 'DELETE' ? 'bg-rose-950/50 text-rose-400 border border-rose-900/45' :
                          'bg-slate-900 text-slate-400'
                        }`}>
                          {log.method}
                        </span>
                        <span className="font-semibold">{log.path}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${isSuccess ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/40' : isThrottled ? 'bg-amber-950/50 text-amber-400 border border-amber-900/40' : 'bg-rose-950/50 text-rose-400 border border-rose-900/40'}`}>
                        HTTP {log.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal truncate">{log.message}</p>
                    <span className="block text-[8px] text-slate-600 text-right mt-1">{log.timestamp}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Payload Inspector Panel */}
        <div className="lg:col-span-7 bg-bg-card border border-border-subtle rounded-xl p-5 shadow-lg flex flex-col h-[340px]">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <FileJson className="text-teal-400 w-5 h-5" />
              <h2 className="font-semibold text-sm text-slate-200">Raw SCIM REST Payload Inspector</h2>
            </div>
            {activeLog && (
              <span className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded text-teal-300 border border-slate-800">
                {activeLog.method} {activeLog.path} (HTTP {activeLog.status})
              </span>
            )}
          </div>

          {activeLog ? (
            <div className="grid grid-cols-2 gap-4 flex-1 min-h-0 text-[10px] font-mono">
              <div className="flex flex-col h-full min-h-0">
                <span className="text-[10px] font-bold text-slate-400 mb-1">HTTP REQUEST BODY</span>
                <pre className="flex-1 bg-slate-950/80 border border-slate-850 p-2.5 rounded-lg text-slate-300 overflow-y-auto leading-normal whitespace-pre-wrap font-mono select-all">
                  {activeLog.requestBody && activeLog.requestBody !== '{}' ? activeLog.requestBody : '/* Empty Payload */'}
                </pre>
              </div>

              <div className="flex flex-col h-full min-h-0">
                <span className="text-[10px] font-bold text-slate-400 mb-1">HTTP RESPONSE BODY</span>
                <pre className="flex-1 bg-slate-950/80 border border-slate-850 p-2.5 rounded-lg text-slate-300 overflow-y-auto leading-normal whitespace-pre-wrap font-mono select-all">
                  {activeLog.responseBody && activeLog.responseBody !== '{}' ? activeLog.responseBody : '/* Empty Payload (HTTP 204 No Content) */'}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center select-none gap-2">
              <FileJson className="w-8 h-8 text-slate-600 animate-pulse" />
              <span>Select an HTTP transaction on the left to inspect its raw JSON payload.</span>
              <span className="text-[10px] text-slate-600 max-w-sm">SCIM payloads enforce strict schema definitions, such as the `urn:ietf:params:scim:schemas:core:2.0:User` namespaces.</span>
            </div>
          )}
        </div>

      </div>

      {/* Info Explainer / Beginner-Expert Guide at the bottom */}
      <div className="p-6 max-w-7xl mx-auto pt-0">
        <div className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-lg">
          <h2 className="text-base font-bold text-slate-200 mb-3 flex items-center gap-1.5">
            <HelpCircle className="text-teal-400 w-5 h-5" /> SCIM 2.0 Architectural Primer & Interview Qs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300 leading-relaxed">
            <div>
              <h3 className="font-bold text-blue-300 mb-1 text-sm">Beginner & layman explanation</h3>
              <p className="mb-3">
                Imagine running a high-security office tower. Instead of hand-writing a guest pass at 5 different security desks every time a new employee joins, you write it once on your main administrative system. A pneumatic tube instantly shoots duplicates of the bouncer pass to the front door, the mailroom, and the parking garage. 
              </p>
              <p>
                In corporate systems, **SCIM (System for Cross-domain Identity Management)** is that pneumatic tube pipeline. It automatically syncs employee records from central directories (the IdP) to other SaaS programs (the SPs).
              </p>
            </div>

            <div>
              <h3 className="font-bold text-teal-300 mb-1 text-sm">Deep Technical Specs</h3>
              <p className="mb-3">
                SCIM 2.0 is based on a lightweight JSON REST API wrapper defined in **RFC 7643** (Schema Definitions) and **RFC 7644** (Protocol / REST Commands). Users are mapped to `/Users`, and groups to `/Groups`. 
              </p>
              <p>
                Instead of heavy synchronization databases, SCIM leverages REST operations: `POST` to create, `PUT` or `PATCH` to modify, and `DELETE` to clear. Group memberships use the `PATCH` verb with specific operations (`add`, `remove`, `replace`) referencing membership values directly for ultimate bandwidth efficiency.
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-800 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-850">
              <span className="font-bold text-blue-300 block mb-1">Interview Prep Q: What is the benefit of PATCH over PUT in SCIM?</span>
              <p className="text-slate-400 leading-normal">
                `PUT` updates the entire resource, requiring the full object representation to be sent. If a group has 50,000 users, adding 1 member via `PUT` requires transferring all 50,000 IDs, leading to immense performance and race-condition issues. `PATCH` allows fine-grained incremental changes—specifically targetting and appending just the single member block.
              </p>
            </div>

            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-850">
              <span className="font-bold text-teal-300 block mb-1">Interview Prep Q: How does SCIM handle rate-limiting and backoff?</span>
              <p className="text-slate-400 leading-normal">
                When a target service is overwhelmed by bulk sync actions (e.g. daily employee import), it returns an HTTP `429 Too Many Requests` status code. The IdP's sync engine must throttle traffic, place the failed request back into its internal retry queue, and execute an exponential backoff retry wait model before attempting transmission again.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Standard Modal for Adding User */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-bg-card border border-border-subtle rounded-xl p-5 max-w-md w-full shadow-2xl relative">
            <h3 className="text-base font-bold text-slate-200 mb-3">Add User to Identity Provider</h3>
            
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">First Name</label>
                <input 
                  type="text" 
                  value={newGivenName}
                  onChange={e => setNewGivenName(e.target.value)}
                  placeholder="e.g., Jane"
                  className="w-full bg-slate-900 border border-slate-850 rounded p-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Last Name</label>
                <input 
                  type="text" 
                  value={newFamilyName}
                  onChange={e => setNewFamilyName(e.target.value)}
                  placeholder="e.g., Doe"
                  className="w-full bg-slate-900 border border-slate-850 rounded p-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Username (Unique, optional)</label>
                <input 
                  type="text" 
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  placeholder="e.g., jane.doe"
                  className="w-full bg-slate-900 border border-slate-850 rounded p-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email (optional)</label>
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="e.g., jane@company.com"
                  className="w-full bg-slate-900 border border-slate-850 rounded p-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setShowAddUserModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium px-3 py-1.5 rounded transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-1.5 rounded transition"
                >
                  Onboard User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
