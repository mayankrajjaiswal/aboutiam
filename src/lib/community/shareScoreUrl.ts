// Manual-paste-only community leaderboard, deliberately NOT an automated aggregator —
// this generates a pre-filled GitHub Discussions post URL (same pre-fill pattern as
// contentFeedback.ts::buildIssueUrl); the visitor still has to click "Submit" on
// GitHub themselves. No AboutIAM-run server or scheduled compute is involved in
// either generating the URL or displaying the resulting leaderboard (the live
// Discussion thread on GitHub itself, not mirrored/embedded on AboutIAM).
const REPO = 'mayankrajjaiswal/aboutiam'
const LEADERBOARD_DISCUSSION_CATEGORY = 'leaderboard'

export interface ShareScoreInput {
  moduleName: string
  score: string
  date: string
}

export function buildDiscussionUrl(input: ShareScoreInput): string {
  const title = `Score share: ${input.moduleName} — ${input.score}`
  const body = [
    `- Module/Challenge: ${input.moduleName}`,
    `- Score: ${input.score}`,
    `- Date: ${input.date}`,
    '',
    'Posted via AboutIAM\'s "Share your score" button.',
  ].join('\n')

  const params = new URLSearchParams({
    category: LEADERBOARD_DISCUSSION_CATEGORY,
    title,
    body,
  })
  return `https://github.com/${REPO}/discussions/new?${params.toString()}`
}

export function buildLeaderboardBrowseUrl(): string {
  return `https://github.com/${REPO}/discussions/categories/${LEADERBOARD_DISCUSSION_CATEGORY}`
}
