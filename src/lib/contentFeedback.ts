const REPO = 'mayankrajjaiswal/aboutiam'

export type FeedbackKind = 'helpful' | 'flag'

export function buildIssueUrl(kind: FeedbackKind, id: string, title: string): string {
  const issueTitle = kind === 'flag' ? `Content flag: "${title}"` : `Content endorsement: "${title}"`
  const body =
    kind === 'flag'
      ? `I found something inaccurate or outdated on this page.\n\n- Item: ${title} (\`${id}\`)\n- What's wrong:\n\n<!-- describe the issue here -->`
      : `This content was helpful as-is.\n\n- Item: ${title} (\`${id}\`)`
  const params = new URLSearchParams({
    title: issueTitle,
    body,
    labels: kind === 'flag' ? 'content-feedback,flag' : 'content-feedback,endorsement',
  })
  return `https://github.com/${REPO}/issues/new?${params.toString()}`
}

export function feedbackStorageKey(id: string): string {
  return `aboutiam-feedback-${id}`
}
