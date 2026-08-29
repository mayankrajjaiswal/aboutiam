export interface WorkloadScenario {
  id: string
  name: string
  provider: string
  cloud: string
  issuer: string
  audience: string
  trustSubject: string
  description: string
  trustPolicyYaml: string
  githubWorkflowYaml: string
}

export const WORKLOAD_SCENARIOS: WorkloadScenario[] = [
  {
    id: 'github_to_aws',
    name: 'GitHub Actions deploying to AWS S3',
    provider: 'GitHub Actions OIDC',
    cloud: 'AWS STS',
    issuer: 'https://token.actions.githubusercontent.com',
    audience: 'https://github.com/aboutiam',
    trustSubject: 'repo:aboutiam/academy:ref:refs/heads/main',
    description: 'Establish OIDC trust between GitHub and AWS. Eliminates long-lived IAM User Access Keys by exchanging ephemeral GitHub Actions JWTs for short-lived AWS session keys.',
    trustPolicyYaml: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "https://github.com/aboutiam",
          "token.actions.githubusercontent.com:sub": "repo:aboutiam/academy:ref:refs/heads/main"
        }
      }
    }
  ]
}`,
    githubWorkflowYaml: `name: Deploy to Production
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write # Required to request the OIDC JWT
      contents: read
    steps:
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GithubDeployer
          aws-region: us-east-1`
  },
  {
    id: 'gitlab_to_gcp',
    name: 'GitLab CI deploying to Google Cloud Storage',
    provider: 'GitLab OIDC',
    cloud: 'GCP Workload Identity',
    issuer: 'https://gitlab.com',
    audience: 'https://gcp.aboutiam.com',
    trustSubject: 'project_path:aboutiam/standards-explorer:ref_type:branch:ref:main',
    description: 'Federate GitLab CI/CD pipelines with GCP Service Accounts using WIF (Workload Identity Federation) pools. Allows secure pushes without static key files.',
    trustPolicyYaml: `bindings:
- members:
  - principalSet://iam.googleapis.com/projects/12345/locations/global/workloadIdentityPools/gitlab-pool/subject/project_path:aboutiam/standards-explorer:ref_type:branch:ref:main
  role: roles/iam.workloadIdentityUser`,
    githubWorkflowYaml: `# GitLab CI/CD config
deploy-to-gcp:
  stage: deploy
  id_tokens:
    GCP_ID_TOKEN:
      aud: https://gcp.aboutiam.com
  script:
    - echo "Exchanging GitLab JWT for GCP ephemeral OAuth tokens..."`
  }
]
