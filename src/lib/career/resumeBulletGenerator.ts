export interface ProgressSnapshot {
  completedModuleCount: number
  totalModuleCount: number
  completedLabCount: number
  passedCertTitles: string[]
}

export interface ResumeBullet {
  id: string
  text: string
}

export function generateResumeBullets(snapshot: ProgressSnapshot): ResumeBullet[] {
  const bullets: ResumeBullet[] = []

  if (snapshot.completedModuleCount > 0) {
    bullets.push({
      id: 'academy-tracks',
      text: `Completed ${snapshot.completedModuleCount} of ${snapshot.totalModuleCount} IAM Academy modules spanning identity fundamentals through Zero Trust architecture (AboutIAM Academy).`,
    })
  }

  if (snapshot.completedLabCount > 0) {
    bullets.push({
      id: 'playground-labs',
      text: `Completed ${snapshot.completedLabCount} interactive identity-security lab${snapshot.completedLabCount === 1 ? '' : 's'} covering protocol exploitation, defense, and governance workflows (AboutIAM Playgrounds).`,
    })
  }

  for (const certTitle of snapshot.passedCertTitles) {
    bullets.push({
      id: `cert-${certTitle}`,
      text: `Passed a practice certification assessment for ${certTitle} (AboutIAM Certification Hub).`,
    })
  }

  return bullets
}
