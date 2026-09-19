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
  },
  {
    id: 'internal_ticket_triage_agent',
    title: 'Enterprise Ticket Triage Agent',
    description: 'An internal Support Operations Orchestrator scans new support tickets and delegates completeness checking to a Ticket Policy Sub-Agent, which calls the internal Ticket Metadata API to flag missing required fields back to the submitter.',
    startingScopes: ['ticket:read', 'ticket:flag', 'ticket:policy-check', 'directory:admin'],
    targetTool: 'Ticket Metadata API',
    requiredToolScopes: ['ticket:policy-check'],
    trapScope: 'directory:admin',
    trapExplanation: 'Checking a ticket against a completeness policy never requires directory administration rights. Forwarding "directory:admin" gives a purely read-and-flag sub-agent the ability to modify the entire employee directory if compromised — classic silent privilege accumulation for an agent reused across adjacent internal tasks.'
  },
  {
    id: 'workforce_contract_review_agent',
    title: 'Workforce Contract Review Agent',
    description: 'An analyst\'s research agent reviews a batch of vendor contracts and delegates the actual document retrieval to a Contract Retrieval Sub-Agent, which queries the internal Contract Repository API and queues a risk summary for the analyst\'s approval.',
    startingScopes: ['contract:read', 'contract:draft-summary', 'contract:submit', 'vendor:payment-approve'],
    targetTool: 'Contract Repository API',
    requiredToolScopes: ['contract:read'],
    trapScope: 'vendor:payment-approve',
    trapExplanation: 'The retrieval sub-agent only needs to read contract documents to draft a summary for human review. Forwarding "vendor:payment-approve" would let a drafting-only agent authorize actual vendor payments — exactly the kind of scope creep from "draft" to "submit/approve" that defeats the human-in-the-loop checkpoint.'
  },
  {
    id: 'partner_claims_intake_agent',
    title: 'Partner Claims Intake Agent',
    description: 'A brokerage\'s claims-intake agent submits a new claim into an insurer\'s shared Claims Intake API on behalf of the brokerage\'s own client, delegating the actual API call to a Submission Sub-Agent.',
    startingScopes: ['claims:submit', 'claims:status-check', 'brokerage:client-data', 'insurer:underwriting-override'],
    targetTool: 'Insurer Claims Intake API',
    requiredToolScopes: ['claims:submit'],
    trapScope: 'insurer:underwriting-override',
    trapExplanation: 'A partner submitting a claim on a client\'s behalf never needs underwriting-override authority — that belongs solely to the insurer\'s own staff. Forwarding it is a confused-deputy failure: the insurer\'s API would be trusting the partner\'s agent far more broadly than the specific claims-submission delegation warrants.'
  },
  {
    id: 'consumer_lost_property_agent',
    title: 'Consumer Lost-Property Claim Agent',
    description: 'A consumer\'s personal assistant agent files a lost-property claim on the owner\'s behalf with a transit authority\'s public claims portal, delegating the form submission to a Claims Filing Sub-Agent.',
    startingScopes: ['claim:file', 'claim:track', 'profile:read', 'payment:autopay-setup'],
    targetTool: 'Transit Authority Claims Portal',
    requiredToolScopes: ['claim:file'],
    trapScope: 'payment:autopay-setup',
    trapExplanation: 'Filing a lost-property claim never requires the ability to configure automatic payments. Forwarding "payment:autopay-setup" hands a narrowly-scoped filing agent the power to set up recurring charges the consumer never consented to — well beyond what they asked the agent to do.'
  }
]
