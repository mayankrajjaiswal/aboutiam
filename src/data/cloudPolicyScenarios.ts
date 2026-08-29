export interface PolicyEvaluationContext {
  action: string
  resource: string
  clientIp: string
  region: string
  mfaAuthenticated: boolean
}

export interface PolicyDocument {
  name: string
  type: 'scp' | 'identity' | 'resource'
  yaml: string
  description: string
}

export const CLOUD_POLICIES: PolicyDocument[] = [
  {
    name: 'Organization SCP (Service Control Policy)',
    type: 'scp',
    description: 'Establishes the absolute security boundary. An explicit DENY here overrides all other permissions across the entire organization.',
    yaml: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyProductionDeletions",
      "Effect": "Deny",
      "Action": [
        "s3:DeleteBucket"
      ],
      "Resource": "arn:aws:s3:::production-financial-data"
    }
  ]
}`
  },
  {
    name: 'Identity-Based IAM Policy',
    type: 'identity',
    description: 'Granted directly to the IAM User or Role. Declares what actions this specific identity is permitted to perform.',
    yaml: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowFullS3Access",
      "Effect": "Allow",
      "Action": [
        "s3:*"
      ],
      "Resource": "*"
    }
  ]
}`
  },
  {
    name: 'Resource-Based S3 Bucket Policy',
    type: 'resource',
    description: 'Attached directly to the target S3 bucket. Limits connections to authorized networks and validates environmental attributes.',
    yaml: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "RestrictToCorporateNetwork",
      "Effect": "Deny",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::production-financial-data/*",
      "Condition": {
        "NotIpAddress": {
          "aws:SourceIp": "192.168.10.0/24"
        }
      }
    }
  ]
}`
  }
]

export interface EvaluationStep {
  policy: string
  decision: 'ALLOW' | 'DENY' | 'NEUTRAL'
  reason: string
}

export interface CloudEvaluationResult {
  allowed: boolean
  steps: EvaluationStep[]
}

export function evaluateCloudPolicies(
  context: PolicyEvaluationContext
): CloudEvaluationResult {
  const steps: EvaluationStep[] = []
  let allowed = false

  // 1. Evaluate Organization SCP
  if (context.action === 's3:DeleteBucket' && context.resource === 'arn:aws:s3:::production-financial-data') {
    steps.push({
      policy: 'Organization SCP',
      decision: 'DENY',
      reason: 'Rule [DenyProductionDeletions] explicitly denies s3:DeleteBucket on production bucket.'
    })
    return { allowed: false, steps }
  } else {
    steps.push({
      policy: 'Organization SCP',
      decision: 'NEUTRAL',
      reason: 'No matching DENY statements found in SCP. Evaluation proceeds to identity level.'
    })
  }

  // 2. Evaluate Resource-Based S3 Policy
  if (context.resource.startsWith('arn:aws:s3:::production-financial-data/')) {
    if (context.clientIp !== '192.168.10.25') { // Representing outside corp network
      steps.push({
        policy: 'Resource-Based Bucket Policy',
        decision: 'DENY',
        reason: 'Rule [RestrictToCorporateNetwork] explicitly denies S3 access because Source IP is not within corporate subnet 192.168.10.0/24.'
      })
      return { allowed: false, steps }
    } else {
      steps.push({
        policy: 'Resource-Based Bucket Policy',
        decision: 'NEUTRAL',
        reason: 'Source IP matches authorized corporate subnet. No explicit Deny matched. Moving to Identity Policy evaluation.'
      })
    }
  }

  // 3. Evaluate Identity-Based Policy
  if (context.action.startsWith('s3:')) {
    allowed = true
    steps.push({
      policy: 'Identity-Based IAM Policy',
      decision: 'ALLOW',
      reason: 'Rule [AllowFullS3Access] grants s3:* on all resources.'
    })
  } else {
    steps.push({
      policy: 'Identity-Based IAM Policy',
      decision: 'NEUTRAL',
      reason: 'No matching permissions found in Identity-Based Policy.'
    })
  }

  return {
    allowed,
    steps
  }
}
