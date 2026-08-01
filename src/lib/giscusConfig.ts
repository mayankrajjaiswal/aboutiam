// Optional giscus (GitHub Discussions-backed comments) configuration. Same
// "opt-in, clearly disclosed, inert until configured" pattern as Google Drive
// Backup (src/lib/googleDrive.ts::getGoogleClientId) — comments are hidden/
// disabled for any deployment that hasn't set up a giscus GitHub App
// installation and filled in these values.
export interface GiscusConfig {
  repo: string
  repoId: string
  category: string
  categoryId: string
}

/** Reads the configured giscus repo/category mapping, or null if giscus hasn't been set up for this deployment. */
export function getGiscusConfig(): GiscusConfig | null {
  const repo = import.meta.env.VITE_GISCUS_REPO
  const repoId = import.meta.env.VITE_GISCUS_REPO_ID
  const category = import.meta.env.VITE_GISCUS_CATEGORY
  const categoryId = import.meta.env.VITE_GISCUS_CATEGORY_ID

  if (
    typeof repo !== 'string' || repo.length === 0 ||
    typeof repoId !== 'string' || repoId.length === 0 ||
    typeof category !== 'string' || category.length === 0 ||
    typeof categoryId !== 'string' || categoryId.length === 0
  ) {
    return null
  }

  return { repo, repoId, category, categoryId }
}
