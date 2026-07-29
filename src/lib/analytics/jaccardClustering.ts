export interface UserEntitlements {
  userId: string
  entitlements: string[]
}

export interface RoleCandidate {
  id: string
  memberUserIds: string[]
  /** Entitlements shared by every member of the cluster — the proposed role definition. */
  commonEntitlements: string[]
  avgSimilarity: number
}

export function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a)
  const setB = new Set(b)
  if (setA.size === 0 && setB.size === 0) return 0
  const intersectionSize = [...setA].filter((x) => setB.has(x)).length
  const unionSize = new Set([...setA, ...setB]).size
  return unionSize === 0 ? 0 : intersectionSize / unionSize
}

/**
 * Greedy union-find clustering: any two users with similarity >= threshold are merged
 * into the same cluster. Clusters of size 1 are not proposed as roles (a "role" shared
 * by exactly one person isn't a role, it's just that person's access).
 */
export function proposeRoleCandidates(users: UserEntitlements[], threshold = 0.6): RoleCandidate[] {
  const parent = new Map<string, string>()
  users.forEach((u) => parent.set(u.userId, u.userId))

  function find(id: string): string {
    let root = id
    while (parent.get(root) !== root) root = parent.get(root)!
    let cur = id
    while (parent.get(cur) !== root) {
      const next = parent.get(cur)!
      parent.set(cur, root)
      cur = next
    }
    return root
  }

  function union(a: string, b: string) {
    const rootA = find(a)
    const rootB = find(b)
    if (rootA !== rootB) parent.set(rootA, rootB)
  }

  const pairSimilarities: { a: string; b: string; sim: number }[] = []
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const sim = jaccardSimilarity(users[i].entitlements, users[j].entitlements)
      if (sim >= threshold) {
        union(users[i].userId, users[j].userId)
        pairSimilarities.push({ a: users[i].userId, b: users[j].userId, sim })
      }
    }
  }

  const clusters = new Map<string, string[]>()
  for (const u of users) {
    const root = find(u.userId)
    if (!clusters.has(root)) clusters.set(root, [])
    clusters.get(root)!.push(u.userId)
  }

  const byId = new Map(users.map((u) => [u.userId, u]))
  const candidates: RoleCandidate[] = []
  let clusterIndex = 0

  for (const memberIds of clusters.values()) {
    if (memberIds.length < 2) continue

    const memberSets = memberIds.map((id) => new Set(byId.get(id)!.entitlements))
    const commonEntitlements = [...memberSets[0]].filter((ent) => memberSets.every((s) => s.has(ent)))

    const relevantPairs = pairSimilarities.filter((p) => memberIds.includes(p.a) && memberIds.includes(p.b))
    const avgSimilarity = relevantPairs.length > 0
      ? relevantPairs.reduce((sum, p) => sum + p.sim, 0) / relevantPairs.length
      : 0

    candidates.push({
      id: `role-candidate-${clusterIndex++}`,
      memberUserIds: [...memberIds].sort(),
      commonEntitlements: commonEntitlements.sort(),
      avgSimilarity,
    })
  }

  return candidates.sort((a, b) => b.memberUserIds.length - a.memberUserIds.length)
}

export function computeOrphanEntitlements(users: UserEntitlements[], acceptedRoles: RoleCandidate[]): string[] {
  const allEntitlements = new Set(users.flatMap((u) => u.entitlements))
  const coveredEntitlements = new Set(acceptedRoles.flatMap((r) => r.commonEntitlements))
  return [...allEntitlements].filter((ent) => !coveredEntitlements.has(ent)).sort()
}
