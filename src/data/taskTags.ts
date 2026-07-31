/**
 * A small, fixed set of task categories for the "I want to…" filter row on
 * ToolsCatalog.tsx and PlaygroundCatalog.tsx — curated, not per-entry free
 * text, so the filter row stays a manageable fixed width. Composes with the
 * existing category/status grouping (AND, not OR).
 */
export const TASK_TAGS = ['decode', 'generate', 'simulate-attack', 'validate-policy', 'build-diagram', 'check-compliance'] as const

export type TaskTag = (typeof TASK_TAGS)[number]

export const TASK_TAG_LABELS: Record<TaskTag, string> = {
  decode: 'Decode a Token',
  generate: 'Generate a Credential',
  'simulate-attack': 'Simulate an Attack',
  'validate-policy': 'Validate a Policy',
  'build-diagram': 'Build a Diagram',
  'check-compliance': 'Check Compliance',
}
