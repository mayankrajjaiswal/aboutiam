export interface AgentIdentityScenario {
  id: string
  title: string
  description: string
  startingScopes: string[]
  targetTool: string
  requiredToolScopes: string[]
  trapScope: string
  trapExplanation: string
}

export const AGENT_IDENTITY_SCENARIOS: AgentIdentityScenario[] = [
  {
    id: 'customer_support_refund',
    title: 'Customer Support Assistant',
    description: 'A customer requests a refund. The Customer Support Orchestrator Agent needs to delegate the task of initiating the refund request to a specialized Refund Sub-Agent, which executes the Refund API Tool.',
    startingScopes: ['support:read', 'support:write', 'refund:request', 'admin:all'],
    targetTool: 'Refund API Tool',
    requiredToolScopes: ['refund:request'],
    trapScope: 'admin:all',
    trapExplanation: 'The Refund Sub-Agent only requires "refund:request". Forwarding "admin:all" grants administrative rights over the entire system, creating a severe privilege-escalation risk if the agent is compromised.'
  },
  {
    id: 'ai_devops_assistant',
    title: 'AI DevOps CI/CD Pipeline',
    description: 'A developer asks the DevOps Orchestrator to deploy a new release. The Orchestrator delegates to a Cloud Deployer Sub-Agent to trigger the production cluster deployment.',
    startingScopes: ['repo:read', 'repo:write', 'deploy:trigger', 'secrets:read', 'org:admin'],
    targetTool: 'Production Kubernetes Cluster',
    requiredToolScopes: ['deploy:trigger'],
    trapScope: 'secrets:read',
    trapExplanation: 'The Cloud Deployer Sub-Agent only needs to trigger the deploy workflow. Granting it access to "secrets:read" allows a subverted sub-agent or LLM prompt-injection attack to extract database passwords or cluster signing keys.'
  },
  {
    id: 'ai_healthcare_assistant',
    title: 'AI Medical Research Assistant',
    description: 'A doctor asks a Clinical Research Agent to query a third-party Clinical Trials database. The agent delegates the query execution to a Database Search Sub-Agent.',
    startingScopes: ['patient:phi', 'clinical:read', 'trial:query', 'billing:admin'],
    targetTool: 'Clinical Trials Database',
    requiredToolScopes: ['trial:query'],
    trapScope: 'patient:phi',
    trapExplanation: 'The clinical database only needs anonymized query permissions. Forwarding the "patient:phi" (Protected Health Information) scope violates HIPAA/GDPR regulations and leaks sensitive patient identities to a third party.'
  }
]
