import { describe, it, expect } from 'vitest'
import { TASK_TAGS, TASK_TAG_LABELS } from './taskTags'
import { TOOLS } from './toolsRegistry'
import { PLAYGROUND_TASK_TAGS } from './playgroundTaskTags'

describe('TASK_TAGS', () => {
  it('every tag has a label', () => {
    for (const tag of TASK_TAGS) {
      expect(TASK_TAG_LABELS[tag]).toBeTruthy()
    }
  })

  it('every tool with taskTags only uses values from the fixed task-category list', () => {
    for (const tool of TOOLS) {
      for (const tag of tool.taskTags ?? []) {
        expect(TASK_TAGS).toContain(tag)
      }
    }
  })

  it('every playground taskTags entry only uses values from the fixed task-category list, keyed to a real link', () => {
    for (const [link, tags] of Object.entries(PLAYGROUND_TASK_TAGS)) {
      expect(link.startsWith('/playground/')).toBe(true)
      for (const tag of tags) {
        expect(TASK_TAGS).toContain(tag)
      }
    }
  })
})
