import type { TargetAttribute } from '../../data/hrAttributeMappingFixtures'

export type TransformType = 'direct' | 'concat' | 'regex' | 'lookup'

export interface TransformConfig {
  type: TransformType
  concatSeparator?: string
  regexPattern?: string
  lookupTable?: Record<string, string>
}

export interface AttributeConnection {
  sourceFieldId: string
  targetAttributeId: string
}

export const DEFAULT_TRANSFORM_CONFIG: TransformConfig = { type: 'direct' }

function groupConnectionsByTarget(connections: AttributeConnection[]): Map<string, string[]> {
  const byTarget = new Map<string, string[]>()
  for (const connection of connections) {
    byTarget.set(connection.targetAttributeId, [...(byTarget.get(connection.targetAttributeId) ?? []), connection.sourceFieldId])
  }
  return byTarget
}

export function applyTransform(config: TransformConfig, sourceFieldIds: string[], record: Record<string, string>): string {
  if (sourceFieldIds.length === 0) return ''

  switch (config.type) {
    case 'concat':
      return sourceFieldIds.map((id) => record[id] ?? '').join(config.concatSeparator ?? ' ')
    case 'regex': {
      const value = record[sourceFieldIds[0]] ?? ''
      if (!config.regexPattern) return value
      try {
        const match = value.match(new RegExp(config.regexPattern))
        return match?.[1] ?? match?.[0] ?? ''
      } catch {
        return value
      }
    }
    case 'lookup': {
      const value = record[sourceFieldIds[0]] ?? ''
      return config.lookupTable?.[value] ?? value
    }
    case 'direct':
    default:
      return record[sourceFieldIds[0]] ?? ''
  }
}

export function computeMappedRecord(
  connections: AttributeConnection[],
  transformConfigs: Record<string, TransformConfig>,
  sampleRecord: Record<string, string>,
): Record<string, string> {
  const byTarget = groupConnectionsByTarget(connections)
  const result: Record<string, string> = {}
  for (const [targetId, sourceFieldIds] of byTarget) {
    const config = transformConfigs[targetId] ?? DEFAULT_TRANSFORM_CONFIG
    result[targetId] = applyTransform(config, sourceFieldIds, sampleRecord)
  }
  return result
}

export interface MappingConflicts {
  /** Target ids with 2+ connected source fields under a non-concat transform — an ambiguous single-value mapping. */
  duplicateTargets: string[]
  /** Required target attribute ids with zero connected source fields. */
  missingRequired: string[]
}

export function findMappingConflicts(
  connections: AttributeConnection[],
  targetAttributes: TargetAttribute[],
  transformConfigs: Record<string, TransformConfig>,
): MappingConflicts {
  const byTarget = groupConnectionsByTarget(connections)

  const duplicateTargets = Array.from(byTarget.entries())
    .filter(([targetId, sourceFieldIds]) => sourceFieldIds.length > 1 && (transformConfigs[targetId] ?? DEFAULT_TRANSFORM_CONFIG).type !== 'concat')
    .map(([targetId]) => targetId)

  const missingRequired = targetAttributes
    .filter((target) => target.required && (byTarget.get(target.id) ?? []).length === 0)
    .map((target) => target.id)

  return { duplicateTargets, missingRequired }
}
