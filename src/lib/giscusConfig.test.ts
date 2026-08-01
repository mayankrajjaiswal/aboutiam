import { describe, it, expect, afterEach, vi } from 'vitest'
import { getGiscusConfig } from './giscusConfig'

describe('getGiscusConfig', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('returns null when nothing is configured', () => {
    vi.stubEnv('VITE_GISCUS_REPO', '')
    vi.stubEnv('VITE_GISCUS_REPO_ID', '')
    vi.stubEnv('VITE_GISCUS_CATEGORY', '')
    vi.stubEnv('VITE_GISCUS_CATEGORY_ID', '')
    expect(getGiscusConfig()).toBeNull()
  })

  it('returns null when only some values are configured', () => {
    vi.stubEnv('VITE_GISCUS_REPO', 'owner/repo')
    vi.stubEnv('VITE_GISCUS_REPO_ID', 'R_kgD')
    vi.stubEnv('VITE_GISCUS_CATEGORY', '')
    vi.stubEnv('VITE_GISCUS_CATEGORY_ID', '')
    expect(getGiscusConfig()).toBeNull()
  })

  it('returns the full config when every value is configured', () => {
    vi.stubEnv('VITE_GISCUS_REPO', 'owner/repo')
    vi.stubEnv('VITE_GISCUS_REPO_ID', 'R_kgD')
    vi.stubEnv('VITE_GISCUS_CATEGORY', 'Comments')
    vi.stubEnv('VITE_GISCUS_CATEGORY_ID', 'DIC_kwD')
    expect(getGiscusConfig()).toEqual({
      repo: 'owner/repo',
      repoId: 'R_kgD',
      category: 'Comments',
      categoryId: 'DIC_kwD',
    })
  })
})
