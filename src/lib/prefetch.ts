export const PREFETCH_MAP: Record<string, () => Promise<unknown>> = {
  '/learn': () => import('../pages/Learn'),
  '/playground': () => import('../pages/PlaygroundCatalog'),
  '/tools': () => import('../pages/ToolsCatalog'),
  '/architecture': () => import('../pages/ArchitectureCenter'),
  '/knowledge-graph': () => import('../pages/KnowledgeGraph'),
  '/daily-puzzle': () => import('../pages/DailyPuzzle'),
  '/vendor': () => import('../pages/VendorCenter'),
  '/research': () => import('../pages/ResearchCenter'),
  '/patterns': () => import('../pages/DesignPatternLibrary'),
  '/certifications': () => import('../pages/CertificationHub'),
  '/bulletins': () => import('../pages/SecurityBulletins'),
  '/career-center': () => import('../pages/InterviewCareerCenter'),
  '/assess': () => import('../pages/Assess'),
  '/command-center': () => import('../pages/CommandCenter'),
  '/scenario-builder': () => import('../pages/ScenarioBuilder'),
  '/labs': () => import('../pages/IdentityLabs'),
}

export function prefetchRoute(path: string) {
  // Strip query parameters for matching
  const basePath = path.split('?')[0]
  const preloader = PREFETCH_MAP[basePath]
  if (preloader) {
    preloader().catch(() => {})
  }
}
