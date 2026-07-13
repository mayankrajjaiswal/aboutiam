/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * A highly resilient, lightweight client-side Rego policy evaluator.
 * Parses and executes subset OPA Rego rules directly in TypeScript.
 */

export interface RegoEvaluationResult {
  allowed: boolean
  logs: string[]
  bindings: Record<string, unknown>
}

/**
 * Parses and evaluates simple OPA Rego rules against a JSON input context.
 * Supports:
 * - default allow = true/false
 * - allow { condition1; condition2 } (Logical AND)
 * - Multiple allow blocks (Logical OR)
 * - Array element checking (e.g. input.user.roles[_] == "admin")
 * - Direct comparisons (==, !=, >, <, >=, <=)
 */
export function evaluateRego(policyCode: string, inputJson: unknown): RegoEvaluationResult {
  const logs: string[] = []
  const bindings: Record<string, unknown> = {}
  
  logs.push('[OPA Engine] Initiating policy parsing...')
  
  // Clean policy code and split by lines
  const lines = policyCode.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.startsWith('#'))
  
  // Extract default decision
  let defaultDecision = false
  const defaultLine = lines.find(l => l.startsWith('default allow_exchange') || l.startsWith('default allow') || l.startsWith('default allow_access'))
  if (defaultLine) {
    if (defaultLine.includes('true')) {
      defaultDecision = true
    }
    logs.push(`[OPA Engine] Detected baseline default: allow = ${defaultDecision}`)
  }

  // Parse rule blocks
  // Find all blocks starting with "allow {", "allow_exchange {", "allow_access {" etc.
  const ruleBlocks: string[][] = []
  let currentBlock: string[] | null = null
  let braceCount = 0

  for (const line of lines) {
    if (line.includes('{')) {
      currentBlock = [line]
      braceCount = 1
    } else if (currentBlock) {
      currentBlock.push(line)
      if (line.includes('}')) {
        braceCount--
        if (braceCount === 0) {
          ruleBlocks.push(currentBlock)
          currentBlock = null
        }
      }
    }
  }

  logs.push(`[OPA Engine] Identified ${ruleBlocks.length} active policy condition blocks.`)

  if (ruleBlocks.length === 0) {
    logs.push('[OPA Engine] No policy rules defined. Falling back to default decision.')
    return { allowed: defaultDecision, logs, bindings }
  }

  let finalDecision = defaultDecision

  // Evaluate each block (Logical OR between blocks)
  for (let bIdx = 0; bIdx < ruleBlocks.length; bIdx++) {
    const block = ruleBlocks[bIdx]
    logs.push(`[OPA Engine] Evaluating Condition Block #${bIdx + 1}...`)
    let blockPassed = true

    // Sift through conditions inside the block (Logical AND between conditions)
    for (let cIdx = 1; cIdx < block.length - 1; cIdx++) {
      const condition = block[cIdx].replace(/,$/, '').trim() // Strip trailing commas
      logs.push(`  ├─ Condition: "${condition}"`)

      try {
        // Evaluate condition
        const passed = evaluateCondition(condition, inputJson, logs, bindings)
        if (!passed) {
          blockPassed = false
          logs.push(`  └─ ❌ Failed Condition: "${condition}"`)
          break // Fail fast for this block
        } else {
          logs.push(`  ├─ 🟢 Passed`)
        }
      } catch (err: any) {
        blockPassed = false
        logs.push(`  └─ ❌ Syntax Error evaluating condition: ${err.message}`)
        break
      }
    }

    if (blockPassed) {
      logs.push(`[OPA Engine] 🟢 Block #${bIdx + 1} satisfied. Overriding final decision to TRUE.`)
      finalDecision = true
      break // Since blocks are ORed, one matching block is enough
    } else {
      logs.push(`[OPA Engine] 🔴 Block #${bIdx + 1} unsatisfied.`)
    }
  }

  logs.push(`[OPA Engine] Evaluation Complete. Authorization decision: ${finalDecision.toString().toUpperCase()}`)
  return { allowed: finalDecision, logs, bindings }
}

/**
 * Evaluates a single Rego condition line against the input context.
 */
function evaluateCondition(
  condition: string,
  input: unknown,
  _logs: string[],
  bindings: Record<string, unknown>
): boolean {
  // 1. Support Array Traversal e.g. input.user.roles[_] == "admin"
  if (condition.includes('[_]')) {
    const arrayMatch = condition.match(/([^\s[]+)\[_\]\s*(==|!=)\s*(.+)/)
    if (arrayMatch) {
      const [, arrayPath, operator, valStr] = arrayMatch
      const arr = resolvePath(arrayPath, input)
      if (!Array.isArray(arr)) {
        throw new Error(`Path ${arrayPath} is not an array`)
      }

      const cleanVal = cleanValue(valStr)
      if (operator === '==') {
        const matches = arr.some(item => String(item) === String(cleanVal))
        if (matches) {
          bindings[arrayPath] = cleanVal
        }
        return matches
      } else if (operator === '!=') {
        return arr.every(item => String(item) !== String(cleanVal))
      }
    }
  }

  // 2. Direct comparisons e.g. input.env.network == "internal"
  const compMatch = condition.match(/([^\s]+)\s*(==|!=|>=|<=|>|<)\s*(.+)/)
  if (compMatch) {
    const [, path, operator, valStr] = compMatch
    const leftVal = resolvePath(path, input)
    const rightVal = cleanValue(valStr)

    switch (operator) {
      case '==':
        return String(leftVal) === String(rightVal)
      case '!=':
        return String(leftVal) !== String(rightVal)
      case '>=':
        return Number(leftVal) >= Number(rightVal)
      case '<=':
        return Number(leftVal) <= Number(rightVal)
      case '>':
        return Number(leftVal) > Number(rightVal)
      case '<':
        return Number(leftVal) < Number(rightVal)
      default:
        return false
    }
  }

  // 3. Direct boolean flags e.g. input.user.mfa_active
  const booleanVal = resolvePath(condition, input)
  return booleanVal === true
}

/**
 * Resolves a nested JS object path. e.g. "input.user.roles" inside input object.
 */
function resolvePath(path: string, obj: any): any {
  const parts = path.replace(/^input\./, '').split('.')
  let current = obj
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined
    }
    current = current[part]
  }
  return current
}

/**
 * Strips quotes and coerces values from string representations.
 */
function cleanValue(valStr: string): any {
  const trimmed = valStr.trim()
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.substring(1, trimmed.length - 1)
  }
  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  if (!isNaN(Number(trimmed))) return Number(trimmed)
  return trimmed
}
