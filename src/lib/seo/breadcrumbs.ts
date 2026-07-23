export interface BreadcrumbSegment {
  name: string
  path: string
}

/**
 * Single source of truth for the breadcrumb trail — consumed by both the
 * invisible BreadcrumbList JSON-LD (Header.tsx) and the visible BreadcrumbNav
 * UI, so the two can never drift apart the way other hand-duplicated lists
 * in this codebase historically have.
 */
export function getBreadcrumbTrail(pathname: string, pageTitle: string): BreadcrumbSegment[] {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length < 2) return []

  const segments: BreadcrumbSegment[] = [{ name: 'Home', path: '/' }]

  let currentPath = ''
  for (let i = 0; i < parts.length; i++) {
    currentPath += `/${parts[i]}`
    const isLast = i === parts.length - 1

    let name: string
    if (parts[i] === 'tools') {
      name = 'Security Tools'
    } else if (parts[i] === 'playground') {
      name = 'Playgrounds'
    } else if (parts[i] === 'explore') {
      name = 'Explore'
    } else if (isLast) {
      name = pageTitle.split(' — ')[0].split(' | ')[0]
    } else {
      name = parts[i].charAt(0).toUpperCase() + parts[i].slice(1)
    }

    segments.push({ name, path: `${currentPath}/` })
  }

  return segments
}
