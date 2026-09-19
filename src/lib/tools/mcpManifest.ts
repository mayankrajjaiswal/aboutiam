/**
 * Pure parsing/analysis logic for the MCP Manifest & Tool-Permission Auditor
 * (`/tools/mcp-manifest-auditor`). Parses an MCP tool-definition JSON
 * manifest and flags identity-relevant risks: unbounded parameters,
 * undistinguished write/destructive operations, missing scope declarations,
 * credential-accepting parameters, ambiguous descriptions, and over-broad
 * resource patterns. Entirely client-side, no network calls.
 */
export type ManifestFindingSeverity = 'Critical' | 'High' | 'Medium' | 'Info'

export interface ManifestFinding {
  toolName: string
  severity: ManifestFindingSeverity
  category: string
  message: string
}

export interface ParsedMcpTool {
  name: string
  description?: string
  parameters?: Record<string, unknown>
  /** Some manifests declare this explicitly; absence is itself a finding. */
  scopes?: string[]
  /** Some manifests annotate destructive/write tools explicitly. */
  destructive?: boolean
  readOnly?: boolean
}

export interface ManifestReport {
  generatedAt: string
  toolCount: number
  findings: ManifestFinding[]
  summary: Record<ManifestFindingSeverity, number>
  /** A conservative, suggested least-privilege scope list synthesized from tool names. */
  suggestedScopes: string[]
}

const DESTRUCTIVE_VERBS = ['delete', 'remove', 'drop', 'destroy', 'purge', 'wipe', 'reset', 'revoke', 'terminate']
const WRITE_VERBS = ['create', 'update', 'write', 'set', 'modify', 'edit', 'insert', 'send', 'transfer', 'execute', 'run', 'invoke', 'call', 'post', 'put', 'patch']
const CREDENTIAL_PARAM_NAMES = ['password', 'secret', 'token', 'apikey', 'api_key', 'credential', 'privatekey', 'private_key', 'accesskey', 'access_key']
const OVER_BROAD_PATTERNS = ['*', '**', '.*', 'all', 'any']

function classifyToolVerb(name: string): 'destructive' | 'write' | 'read' {
  const lower = name.toLowerCase()
  if (DESTRUCTIVE_VERBS.some((v) => lower.includes(v))) return 'destructive'
  if (WRITE_VERBS.some((v) => lower.includes(v))) return 'write'
  return 'read'
}

function flattenParamNames(params: unknown, depth = 0): string[] {
  if (depth > 5 || !params || typeof params !== 'object') return []
  const names: string[] = []
  const obj = params as Record<string, unknown>
  const properties = (obj.properties && typeof obj.properties === 'object') ? obj.properties as Record<string, unknown> : obj
  for (const [key, value] of Object.entries(properties)) {
    names.push(key)
    if (value && typeof value === 'object') {
      names.push(...flattenParamNames(value, depth + 1))
    }
  }
  return names
}

function hasUnboundedStringParam(params: unknown): boolean {
  if (!params || typeof params !== 'object') return false
  const obj = params as Record<string, unknown>
  const properties = (obj.properties && typeof obj.properties === 'object') ? obj.properties as Record<string, unknown> : {}
  for (const value of Object.values(properties)) {
    if (value && typeof value === 'object') {
      const paramDef = value as Record<string, unknown>
      if (paramDef.type === 'string' && paramDef.maxLength === undefined && paramDef.enum === undefined && paramDef.pattern === undefined) {
        return true
      }
    }
  }
  return false
}

/**
 * Parses raw manifest input. Accepts either a single tool-definition object,
 * an array of tool definitions, or an object with a `tools` array (common
 * MCP server manifest shape). Tolerant of missing optional fields.
 */
export function parseMcpManifest(input: string): ParsedMcpTool[] {
  const trimmed = input.trim()
  if (!trimmed) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    return []
  }

  let rawTools: unknown[] = []
  if (Array.isArray(parsed)) {
    rawTools = parsed
  } else if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>
    if (Array.isArray(obj.tools)) {
      rawTools = obj.tools
    } else if (typeof obj.name === 'string') {
      rawTools = [obj]
    }
  }

  return rawTools
    .filter((t): t is Record<string, unknown> => Boolean(t) && typeof t === 'object' && typeof (t as Record<string, unknown>).name === 'string')
    .map((t) => ({
      name: t.name as string,
      description: typeof t.description === 'string' ? t.description : undefined,
      parameters: (t.parameters && typeof t.parameters === 'object') ? t.parameters as Record<string, unknown> : undefined,
      scopes: Array.isArray(t.scopes) ? t.scopes.filter((s): s is string => typeof s === 'string') : undefined,
      destructive: typeof t.destructive === 'boolean' ? t.destructive : undefined,
      readOnly: typeof t.readOnly === 'boolean' ? t.readOnly : undefined,
    }))
}

export function analyzeMcpManifest(input: string, generatedAt: string): ManifestReport {
  const tools = parseMcpManifest(input)
  const findings: ManifestFinding[] = []

  for (const tool of tools) {
    const verb = classifyToolVerb(tool.name)

    // 1. Undistinguished write/destructive operations
    if (verb === 'destructive' && tool.destructive !== true) {
      findings.push({
        toolName: tool.name,
        severity: 'Critical',
        category: 'Undistinguished Destructive Operation',
        message: `"${tool.name}" appears to perform a destructive action but is not marked \`destructive: true\` in the manifest, so a policy layer cannot distinguish it from a safe read.`,
      })
    } else if (verb === 'write' && tool.readOnly !== false && tool.destructive === undefined) {
      findings.push({
        toolName: tool.name,
        severity: 'Medium',
        category: 'Undistinguished Write Operation',
        message: `"${tool.name}" appears to write or change state but carries no explicit read/write annotation.`,
      })
    }

    // 2. Missing scope declaration
    if (!tool.scopes || tool.scopes.length === 0) {
      findings.push({
        toolName: tool.name,
        severity: verb === 'destructive' ? 'High' : 'Medium',
        category: 'Missing Scope Declaration',
        message: `"${tool.name}" declares no required scopes — an agent identity's authorization cannot be checked against this tool without one.`,
      })
    }

    // 3. Credential-accepting parameters
    const paramNames = flattenParamNames(tool.parameters).map((n) => n.toLowerCase())
    const credentialParams = paramNames.filter((n) => CREDENTIAL_PARAM_NAMES.some((c) => n.includes(c)))
    if (credentialParams.length > 0) {
      findings.push({
        toolName: tool.name,
        severity: 'Critical',
        category: 'Credential-Accepting Parameter',
        message: `"${tool.name}" accepts a parameter that looks like a raw credential (${credentialParams.join(', ')}) — this should be handled via a secure credential store, never passed as a tool argument.`,
      })
    }

    // 4. Unbounded string parameters
    if (hasUnboundedStringParam(tool.parameters)) {
      findings.push({
        toolName: tool.name,
        severity: 'Medium',
        category: 'Unbounded Parameter',
        message: `"${tool.name}" has a string parameter with no length limit, enum, or pattern constraint — a large or malformed value could be used for injection or resource exhaustion.`,
      })
    }

    // 5. Ambiguous descriptions
    if (!tool.description || tool.description.trim().length < 15) {
      findings.push({
        toolName: tool.name,
        severity: 'Medium',
        category: 'Ambiguous Description',
        message: `"${tool.name}" has no meaningful description — an agent (or a human reviewer) cannot judge intended use from the manifest alone.`,
      })
    }

    // 6. Over-broad resource patterns
    const paramValues = tool.parameters ? JSON.stringify(tool.parameters).toLowerCase() : ''
    if (OVER_BROAD_PATTERNS.some((p) => paramValues.includes(`"${p}"`))) {
      findings.push({
        toolName: tool.name,
        severity: 'High',
        category: 'Over-Broad Resource Pattern',
        message: `"${tool.name}" references a wildcard or "all" resource pattern in its parameter definition — this should be scoped to specific resources wherever possible.`,
      })
    }
  }

  const summary: Record<ManifestFindingSeverity, number> = { Critical: 0, High: 0, Medium: 0, Info: 0 }
  for (const f of findings) summary[f.severity]++

  const suggestedScopes = tools.map((t) => {
    const verb = classifyToolVerb(t.name)
    const resource = t.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')
    return verb === 'read' ? `${resource}:read` : verb === 'write' ? `${resource}:write` : `${resource}:admin`
  })

  return {
    generatedAt,
    toolCount: tools.length,
    findings,
    summary,
    suggestedScopes: Array.from(new Set(suggestedScopes)),
  }
}

export function buildManifestReportJson(report: ManifestReport): string {
  return JSON.stringify(report, null, 2)
}
