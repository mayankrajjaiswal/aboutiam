export type CertDifficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export interface CertQuizQuestion {
  q: string
  options: string[]
  correct: number
  explanation: string
}

export interface Certification {
  id: string
  title: string
  vendor: string
  category: string
  difficulty: CertDifficulty
  cost: string
  examCode?: string
  officialLink: string
  domains: { name: string; weight: string }[]
  studyPath: string[]
  recommendedLabs: { name: string; path: string }[]
  /** Only the flagship, hand-verified certs carry a full mock quiz — see GEMINI.md §4U */
  quiz?: CertQuizQuestion[]
}

export const CERTIFICATION_CATEGORIES = [
  'Fundamentals',
  'Cloud & Workforce IAM',
  'Identity Governance (IGA)',
  'Privileged Access Management (PAM)',
  'Security Leadership & GRC',
  'Privacy & Data Protection',
  'Cloud-Native & DevSecOps'
] as const

export const CERTIFICATIONS: Certification[] = [
  // ───────────────────────── Fundamentals ─────────────────────────
  {
    id: 'sc900',
    title: 'SC-900: Microsoft Security, Compliance, and Identity Fundamentals',
    vendor: 'Microsoft',
    category: 'Fundamentals',
    difficulty: 'Beginner',
    cost: '$99 USD',
    examCode: 'SC-900',
    officialLink: 'https://learn.microsoft.com/en-us/credentials/certifications/security-compliance-and-identity-fundamentals/',
    domains: [
      { name: 'Concepts of security, compliance, and identity', weight: '10-15%' },
      { name: 'Capabilities of Microsoft Entra', weight: '25-30%' },
      { name: 'Capabilities of Microsoft security solutions', weight: '35-40%' },
      { name: 'Capabilities of Microsoft compliance solutions', weight: '20-25%' }
    ],
    studyPath: [
      'Learn the shared responsibility model and the Zero Trust guiding principles.',
      'Understand core Microsoft Entra ID concepts: identities, authentication methods, and Conditional Access basics.',
      'Survey Microsoft Defender and Sentinel at a conceptual level.',
      'Review Microsoft Purview compliance and information-protection capabilities.'
    ],
    recommendedLabs: [
      { name: 'Zero Trust Planner', path: '/playground/zta' },
      { name: 'Conditional Access Policy Simulator', path: '/playground/conditional-access' }
    ]
  },
  {
    id: 'security-plus',
    title: 'CompTIA Security+',
    vendor: 'CompTIA',
    category: 'Fundamentals',
    difficulty: 'Beginner',
    cost: '$392 USD',
    examCode: 'SY0-701',
    officialLink: 'https://www.comptia.org/certifications/security',
    domains: [
      { name: 'General Security Concepts', weight: '12%' },
      { name: 'Threats, Vulnerabilities, and Mitigations', weight: '22%' },
      { name: 'Security Architecture', weight: '18%' },
      { name: 'Security Operations', weight: '28%' },
      { name: 'Security Program Management and Oversight', weight: '20%' }
    ],
    studyPath: [
      'Master foundational cryptography, PKI, and AAA (Authentication, Authorization, Accounting) concepts.',
      'Learn identity and access management fundamentals: MFA, SSO, federation, and directory services.',
      'Study common attack vectors and vulnerability management processes.',
      'Understand governance, risk, and compliance basics.'
    ],
    recommendedLabs: [
      { name: 'LDAP Tree Simulator', path: '/playground/ldap' },
      { name: 'Password Generator', path: '/tools/password-generator' }
    ]
  },
  {
    id: 'cidpro',
    title: 'IDPro Certified Identity Professional (CIDPRO)',
    vendor: 'IDPro',
    category: 'Fundamentals',
    difficulty: 'Beginner',
    cost: '$300 USD',
    officialLink: 'https://idpro.org/cidpro/',
    domains: [
      { name: 'Identity Fundamentals & Terminology', weight: 'Core' },
      { name: 'Authentication & Authorization Models', weight: 'Core' },
      { name: 'Identity Lifecycle & Governance', weight: 'Core' },
      { name: 'Federation & Directory Services', weight: 'Core' }
    ],
    studyPath: [
      'Study the IDPro Body of Knowledge (BoK) articles on identity fundamentals.',
      'Learn the differences between authentication, authorization, and accounting.',
      'Understand joiner-mover-leaver identity lifecycle processes.',
      'Review directory services (LDAP/AD) and federation protocol basics (SAML, OIDC).'
    ],
    recommendedLabs: [
      { name: 'IAM Academy — Foundations Track', path: '/learn' },
      { name: 'Master A-Z Encyclopedia', path: '/encyclopedia' }
    ]
  },

  // ───────────────────────── Cloud & Workforce IAM ─────────────────────────
  {
    id: 'aws-cloud-practitioner',
    title: 'AWS Certified Cloud Practitioner',
    vendor: 'AWS',
    category: 'Cloud & Workforce IAM',
    difficulty: 'Beginner',
    cost: '$100 USD',
    examCode: 'CLF-C02',
    officialLink: 'https://aws.amazon.com/certification/certified-cloud-practitioner/',
    domains: [
      { name: 'Cloud Concepts', weight: '24%' },
      { name: 'Security and Compliance', weight: '30%' },
      { name: 'Cloud Technology and Services', weight: '34%' },
      { name: 'Billing, Pricing, and Support', weight: '12%' }
    ],
    studyPath: [
      'Learn the AWS shared responsibility model for security.',
      'Understand AWS IAM basics: users, groups, roles, and policies.',
      'Survey core AWS services at a conceptual level (compute, storage, networking).',
      'Review AWS support plans and the pricing model.'
    ],
    recommendedLabs: [
      { name: 'Policy Evaluator (ABAC/RBAC)', path: '/tools/policy-evaluator' }
    ]
  },
  {
    id: 'sc300',
    title: 'SC-300: Microsoft Identity and Access Administrator',
    vendor: 'Microsoft',
    category: 'Cloud & Workforce IAM',
    difficulty: 'Intermediate',
    cost: '$165 USD',
    examCode: 'SC-300',
    officialLink: 'https://learn.microsoft.com/en-us/credentials/certifications/identity-and-access-administrator/',
    domains: [
      { name: 'Implement an Identity Management Solution', weight: '25-30%' },
      { name: 'Implement an Authentication and Access Management Solution', weight: '25-30%' },
      { name: 'Implement Access Management for Apps', weight: '15-20%' },
      { name: 'Plan and Implement an Identity Governance Strategy', weight: '20-25%' }
    ],
    studyPath: [
      'Learn hybrid replication topologies using Microsoft Entra Connect & Cloud Sync.',
      'Master the Conditional Access Policy structure, utilizing user risk, device posture, and network locations.',
      'Configure administrative access lifecycles using Privileged Identity Management (PIM) JIT templates.',
      'Understand directory entitlement management, access reviews, and access packages.'
    ],
    recommendedLabs: [
      { name: 'Access Control ABAC/RBAC Lab', path: '/playground/access' },
      { name: 'Zero Trust Planner', path: '/playground/zta' },
      { name: 'Microsoft Entra Reference Guide', path: '/vendor' }
    ],
    quiz: [
      {
        q: 'You need to ensure that database administrators can only activate their high-privilege directory roles for a maximum of 2 hours, and must require manager approval before activation. Which Entra ID capability should you configure?',
        options: [
          'Microsoft Entra Conditional Access',
          'Microsoft Entra Identity Protection',
          'Microsoft Entra Privileged Identity Management (PIM)',
          'Microsoft Entra ID Protection Strengths'
        ],
        correct: 2,
        explanation: 'Privileged Identity Management (PIM) lets you configure role settings—such as maximum activation duration (e.g. 2 hours), mandatory business justification, and required manager approvals for role activations—satisfying least-privilege JIT governance rules.'
      },
      {
        q: 'Your organization mandates that all users connecting to Microsoft 365 from unmanaged devices must complete FIDO2 passwordless authentication, while managed device users can use standard passwords. What should you configure?',
        options: [
          'Entra ID Connect sync filtering rules',
          'Conditional Access policy with Authentication Strengths',
          'Entra ID Identity Governance Access Packages',
          'A custom XML policy inside the Identity Experience Framework'
        ],
        correct: 1,
        explanation: 'Conditional Access policies allow you to define conditions (such as device state = unmanaged) and enforce specific "Authentication Strengths" (such as mandating Phishing-resistant MFA / FIDO2) as a grant control, enforcing contextual adaptive security.'
      },
      {
        q: 'You are configuring a B2B collaboration environment with an external partner. You want to allow external guest users to access specific Microsoft Teams channels without creating separate accounts in your directory, while ensuring their access is reviewed monthly. What should you configure?',
        options: [
          'Direct Federation via SAML/OIDC',
          'Microsoft Entra Connect Cloud Sync',
          'Entitlement Management Access Packages with monthly Access Reviews',
          'Cross-tenant access settings with B2B direct connect'
        ],
        correct: 2,
        explanation: 'Entitlement Management allows you to pack resources (like Teams, SharePoint, and Apps) into "Access Packages" assigned to external guest partners. By pairing this with an Access Review schedule, the partner manager or internal leads must actively verify and approve the guests continued access monthly, automating account lifecycles.'
      },
      {
        q: 'Your security operations center (SOC) detects multiple "impossible travel" alerts for several corporate accounts. You need to configure an automated response that immediately prompts these users for step-up MFA and forces a password change. What Entra ID component should you configure?',
        options: [
          'Entra ID Protection Sign-in Risk and User Risk Policies',
          'Entra ID Privileged Identity Management Alert Settings',
          'Azure Key Vault secret rotational loops',
          'Custom Entra Connect Sync filtering attributes'
        ],
        correct: 0,
        explanation: 'Entra ID Protection (formerly Azure AD Identity Protection) evaluates real-time telemetry (impossible travel, leaked credentials, suspicious IPs) to calculate "Sign-in Risk" and "User Risk" scores. Conditional Access policies can leverage these scores to trigger automatic actions, such as blocking access, forcing MFA, or mandating password resets via Self-Service Password Reset (SSPR).'
      },
      {
        q: 'When implementing a hybrid identity model, what is the primary benefit of deploying Microsoft Entra Cloud Sync instead of traditional Microsoft Entra Connect Sync?',
        options: [
          'Cloud Sync supports larger file attachments inside user mailboxes.',
          'Cloud Sync runs entirely in the cloud and utilizes a lightweight on-prem agent, simplifying multi-forest directory consolidation and reducing local server footprints.',
          'Cloud Sync forces local Active Directory schemas to override all cloud policies.',
          'Cloud Sync is mandatory for setting up local hardware Kerberos keytabs.'
        ],
        correct: 1,
        explanation: 'Unlike traditional Entra Connect Sync which requires a heavy SQL database and synchronization engine installed on-premise, Entra Cloud Sync moves the heavy calculation sync engine to the cloud, utilizing a lightweight, highly-available local agent on-prem. It is highly optimized for organizations consolidating multiple disconnected Active Directory forests.'
      }
    ]
  },
  {
    id: 'okta_admin',
    title: 'Okta Certified Professional & Administrator',
    vendor: 'Okta',
    category: 'Cloud & Workforce IAM',
    difficulty: 'Intermediate',
    cost: '$150 USD',
    officialLink: 'https://www.okta.com/learn/certification/',
    domains: [
      { name: 'Identity & Access Management', weight: '20%' },
      { name: 'Directory Integration & Synchronization', weight: '25%' },
      { name: 'Okta Security Policies & Multi-Factor', weight: '25%' },
      { name: 'Application Provisioning (SCIM)', weight: '30%' }
    ],
    studyPath: [
      'Understand Universal Directory custom attribute schemas and metadata profile mappings.',
      'Master directory integration setups installing local Active Directory or LDAP Agents.',
      'Configure Okta Sign-On and MFA Enrollment Policies using Network Zones and Device Trust.',
      'Configure SaaS outbound SCIM provisioning with Attribute Mapping and sync triggers.'
    ],
    recommendedLabs: [
      { name: 'SCIM 2.0 Provisioning Lab', path: '/playground/scim' },
      { name: 'OAuth 2.0 Attack Lab', path: '/playground/oauth-attack' },
      { name: 'Okta Reference Guide', path: '/vendor' }
    ],
    quiz: [
      {
        q: 'When configuring SCIM 2.0 provisioning to a downstream SaaS application, what is the best REST method to add a single user as a member of a pre-existing group without overwriting other members?',
        options: [
          'HTTP PUT to the /Groups/{id} endpoint carrying the full roster payload',
          'HTTP POST to the /Groups/{id}/members endpoint carrying the user ID',
          'HTTP PATCH to the /Groups/{id} endpoint carrying an "add" operation targeting members path',
          'HTTP DELETE to clear the group, followed by a POST recreate'
        ],
        correct: 2,
        explanation: 'SCIM (RFC 7644) mandates using HTTP PATCH with the "add" operation on the "members" attribute path to append new members. This is extremely lightweight, preventing race-conditions or the overhead of transferring a full group roster.'
      },
      {
        q: 'You must secure a legacy, header-based on-premise application by federating its authentication with the Okta Cloud directory. Which component should you deploy?',
        options: [
          'Okta Universal Directory Agents',
          'Okta Workflows Orchestrator',
          'Okta Access Gateway (OAG)',
          'Okta API Access Management proxy'
        ],
        correct: 2,
        explanation: 'Okta Access Gateway (OAG) acts as a local reverse proxy PEP. It handles modern OIDC federation with Okta cloud and forwards the user session context to the legacy on-prem app using HTTP header injection.'
      },
      {
        q: 'You need to transform a user\'s department attribute from Okta Universal Directory before sending it to a downstream SAML Service Provider. If the department attribute is null, you want to send a default value of "General". What Okta Expression Language expression should you write?',
        options: [
          'user.department == null ? "General" : user.department',
          'if (user.department === "") then "General" else department',
          'String.coalesce(user.department, "General")',
          'user.department ? "General"'
        ],
        correct: 0,
        explanation: 'Okta Expression Language utilizes ternary operators (condition ? value_if_true : value_if_false) derived from standard programming syntax. The expression `user.department == null ? "General" : user.department` perfectly handles null checks during assertion compilation.'
      },
      {
        q: 'An attacker is attempting a password-spraying attack against your Okta portal from multiple global IP addresses, triggering lockouts. You want Okta to automatically identify and block these malicious IPs prior to any authentication attempt. What should you configure?',
        options: [
          'Okta ThreatInsight Policy',
          'Custom Okta Sign-On Policy with IP restrictions',
          'Okta Routing Rules using email domains',
          'Local Windows Active Directory lockout thresholds'
        ],
        correct: 0,
        explanation: 'Okta ThreatInsight evaluates global threat intelligence telemetry across thousands of Okta tenants. When active in "Block" mode, it automatically identifies and drops requests from suspicious, crawling IP addresses at the API gateway layer, before evaluating credentials, preventing local directory account lockouts.'
      },
      {
        q: 'A customer wants to sync employee profile attributes from an on-premise Active Directory to Okta. You install the Okta AD Agent. What is the correct operational model of this agent regarding network traffic security?',
        options: [
          'The agent acts as an inbound firewall listener opening port 389 directly to the internet.',
          'The agent is entirely outbound-only, polling Okta servers over port 443 (HTTPS), eliminating the need for inbound corporate firewall ports.',
          'The agent requires setting up a dedicated VPN tunnel between AD and Okta servers.',
          'The agent acts as a RADIUS proxy listening to local UDP ports.'
        ],
        correct: 1,
        explanation: 'The Okta Active Directory Agent is engineered as an outbound-only service. It communicates strictly via secure HTTPS polling over port 443 to fetch synchronization jobs queued in Okta cloud, completely removing the security risk of opening inbound corporate ports.'
      }
    ]
  },
  {
    id: 'ping_professional',
    title: 'Ping Identity Certified Professional (PingFederate)',
    vendor: 'Ping Identity',
    category: 'Cloud & Workforce IAM',
    difficulty: 'Intermediate',
    cost: '$150 USD',
    officialLink: 'https://www.pingidentity.com/en/services/training-certification.html',
    domains: [
      { name: 'PingFederate Server Configurations', weight: '25%' },
      { name: 'Protocol Handshakes (SAML 2.0 / OIDC)', weight: '40%' },
      { name: 'SAML Adapter & JWT Token Mappings', weight: '35%' }
    ],
    studyPath: [
      'Master SAML 2.0 Bindings (Redirect, POST) and XML metadata import configurations.',
      'Configure OpenID Connect policy registries, grant types, and JWT scopes.',
      'Design PingAccess gateway policies protecting backend API resources.',
      'Map LDAP and custom SQL data stores to dynamic token attribute schemas.'
    ],
    recommendedLabs: [
      { name: 'OAuth 2.0 / OIDC Handshake Visualizer', path: '/playground/oauth' },
      { name: 'SAML 2.0 XML Workbench', path: '/playground/saml' },
      { name: 'LDAP Tree Simulator', path: '/playground/ldap' }
    ],
    quiz: [
      {
        q: 'During a SAML 2.0 Single Sign-On federation loop, which HTTP binding transports the signed SAMLResponse assertion payload from the Identity Provider to the Service Provider via the user\'s browser using an HTTP POST body parameter?',
        options: [
          'HTTP Redirect Binding',
          'HTTP POST Binding',
          'HTTP Artifact Binding',
          'HTTP SOAP Binding'
        ],
        correct: 1,
        explanation: 'The HTTP POST Binding transfers the base64-encoded XML `<samlp:Response>` assertion inside an standard HTML form body POST parameter, communicating through the client\'s browser frontchannel.'
      },
      {
        q: 'A partner Service Provider reports that users are getting SAML assertion validation errors when attempting SSO. You discover that the system clocks of the PingFederate server and the partner SP server differ by 8 minutes. What parameter should you adjust to temporarily mitigate this issue?',
        options: [
          'SAML assertion validation interval',
          'SAML Adapter Attribute Mapping expressions',
          'Allowed Clock Skew tolerance threshold',
          'OIDC Session Timeout setting'
        ],
        correct: 2,
        explanation: 'Clock Drift is a common SAML federation issue. SAML assertions are stamped with an issue and expiration time. If server clocks differ beyond the default tolerance (typically 3-5 minutes), assertions fail validation. Temporarily increasing the Allowed Clock Skew tolerance (e.g., to 10 minutes) mitigates the block while server times are synchronized via NTP.'
      },
      {
        q: 'You are configuring PingAccess to protect on-premise backend APIs. You want PingAccess to intercept user requests, inspect the OIDC Access Token issued by PingFederate, and securely inject user profile attributes as HTTP header parameters to the backend APIs. What capability is this?',
        options: [
          'SAML Assertion Wrapping',
          'PingAccess Token Exchange and Header Injection',
          'LDAP directory routing rules',
          'PingFederate Client Credentials flow'
        ],
        correct: 1,
        explanation: 'PingAccess acts as an API gateway PEP. It validates incoming client-facing tokens and swaps/maps them for backend-facing HTTP headers containing validated claims. This hides token complexity from legacy on-prem APIs, enforcing centralized access management.'
      },
      {
        q: 'Your organization wants to dynamically route incoming employee login requests. Users connecting from the internal corporate network should authenticate via Kerberos (IWA), while external remote workers must use standard passwords + SMS MFA. What PingFederate feature should you configure?',
        options: [
          'AD Sync attribute filters',
          'PingFederate Authentication Policies and Adapter Selectors',
          'Custom SCIM payload schemas',
          'PingAccess Reverse Proxy Gateway rules'
        ],
        correct: 1,
        explanation: 'Authentication Policies in PingFederate allow you to construct complex, conditional decision trees. By utilizing "Adapter Selectors" (like an IP Range Selector or Device Selector), PingFederate dynamically routes requests to the correct authentication adapters (e.g. Kerberos on-premise or HTML Form + MFA externally).'
      },
      {
        q: 'Which OAuth 2.0 grant flow should be configured in PingFederate to authenticate a background server-to-server (Machine-to-Machine) service integration that does not involve any end-user interaction?',
        options: [
          'Implicit Grant Flow',
          'Authorization Code Flow with PKCE',
          'Client Credentials Grant Flow',
          'Resource Owner Password Credentials Flow'
        ],
        correct: 2,
        explanation: 'The Client Credentials Grant (RFC 6749) is engineered strictly for Machine-to-Machine (M2M) integrations. The calling background server authenticates directly against PingFederate using its client_id and client_secret to receive an access token, requiring no browser redirects or user inputs.'
      }
    ]
  },
  {
    id: 'az500',
    title: 'AZ-500: Microsoft Azure Security Engineer Associate',
    vendor: 'Microsoft',
    category: 'Cloud & Workforce IAM',
    difficulty: 'Intermediate',
    cost: '$165 USD',
    examCode: 'AZ-500',
    officialLink: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-security-engineer/',
    domains: [
      { name: 'Manage Identity and Access', weight: '25-30%' },
      { name: 'Secure Networking', weight: '20-25%' },
      { name: 'Secure Compute, Storage, and Databases', weight: '20-25%' },
      { name: 'Manage Security Operations', weight: '25-30%' }
    ],
    studyPath: [
      'Configure Entra ID Conditional Access, PIM, and Identity Protection at the platform-security level.',
      'Secure Azure Key Vault access policies, managed identities, and service principals.',
      'Implement network security groups, Azure Firewall, and private endpoints.',
      'Configure Microsoft Defender for Cloud and Sentinel security operations.'
    ],
    recommendedLabs: [
      { name: 'NHI Workload Mesh (SPIFFE)', path: '/playground/workload-mesh' },
      { name: 'Zero Trust Planner', path: '/playground/zta' }
    ]
  },
  {
    id: 'forgerock-ams',
    title: 'ForgeRock/Ping Access Management Specialist',
    vendor: 'ForgeRock (Ping Identity)',
    category: 'Cloud & Workforce IAM',
    difficulty: 'Intermediate',
    cost: 'Contact vendor',
    officialLink: 'https://www.pingidentity.com/en/services/training-certification.html',
    domains: [
      { name: 'Authentication Trees & Journeys', weight: 'Core' },
      { name: 'OAuth 2.0 / OIDC Authorization Server Configuration', weight: 'Core' },
      { name: 'Policy Agents & Session Management', weight: 'Core' }
    ],
    studyPath: [
      'Design authentication trees/journeys with adaptive risk nodes.',
      'Configure OAuth2/OIDC clients, scopes, and token lifetimes in AM.',
      'Deploy web/Java policy agents in front of protected resources.',
      'Understand CTS-backed session stores and session quotas.'
    ],
    recommendedLabs: [
      { name: 'OIDC / OAuth 2.0 Flow Visualizer', path: '/playground/oauth' },
      { name: 'Conditional Access Policy Simulator', path: '/playground/conditional-access' }
    ]
  },
  {
    id: 'okta-consultant',
    title: 'Okta Certified Consultant',
    vendor: 'Okta',
    category: 'Cloud & Workforce IAM',
    difficulty: 'Advanced',
    cost: '$200 USD',
    officialLink: 'https://www.okta.com/learn/certification/',
    domains: [
      { name: 'Advanced Provisioning Architectures', weight: 'Core' },
      { name: 'Custom Inline Hooks & Workflows', weight: 'Core' },
      { name: 'Multi-Org & B2B Federation Design', weight: 'Core' }
    ],
    studyPath: [
      'Design multi-org, multi-tenant Okta architectures for large enterprises.',
      'Build custom Inline Hooks (token, registration, password import) and Okta Workflows.',
      'Architect complex SCIM provisioning chains with custom attribute transformations.',
      'Plan B2B federation and Identity Provider routing rules at scale.'
    ],
    recommendedLabs: [
      { name: 'Identity Broker & Federation Sandbox', path: '/playground/identity-broker' },
      { name: 'SCIM Diff & Reconciliation Tool', path: '/tools/scim-diff' }
    ]
  },
  {
    id: 'aws-security-specialty',
    title: 'AWS Certified Security – Specialty',
    vendor: 'AWS',
    category: 'Cloud & Workforce IAM',
    difficulty: 'Advanced',
    cost: '$300 USD',
    examCode: 'SCS-C02',
    officialLink: 'https://aws.amazon.com/certification/certified-security-specialty/',
    domains: [
      { name: 'Threat Detection and Incident Response', weight: '14%' },
      { name: 'Security Logging and Monitoring', weight: '18%' },
      { name: 'Infrastructure Security', weight: '20%' },
      { name: 'Identity and Access Management', weight: '16%' },
      { name: 'Data Protection', weight: '18%' },
      { name: 'Management and Security Governance', weight: '14%' }
    ],
    studyPath: [
      'Master IAM policy evaluation logic: identity-based vs. resource-based policies, SCPs, and permission boundaries.',
      'Understand AWS Organizations, cross-account roles, and STS AssumeRole chains.',
      'Design KMS key policies and envelope encryption for data protection.',
      'Configure GuardDuty, Security Hub, and CloudTrail for detection and governance.'
    ],
    recommendedLabs: [
      { name: 'Policy Evaluator (ABAC/RBAC)', path: '/tools/policy-evaluator' },
      { name: 'Token Exchange Lab (RFC 8693)', path: '/playground/token-exchange' }
    ]
  },
  {
    id: 'gcp-security-engineer',
    title: 'Google Professional Cloud Security Engineer',
    vendor: 'Google Cloud',
    category: 'Cloud & Workforce IAM',
    difficulty: 'Advanced',
    cost: '$200 USD',
    officialLink: 'https://cloud.google.com/learn/certification/cloud-security-engineer',
    domains: [
      { name: 'Configure access within a cloud solution environment', weight: 'Core' },
      { name: 'Configure network security', weight: 'Core' },
      { name: 'Ensure data protection', weight: 'Core' },
      { name: 'Manage operations within a cloud solution environment', weight: 'Core' },
      { name: 'Ensure compliance', weight: 'Core' }
    ],
    studyPath: [
      'Master Google Cloud IAM: roles, custom roles, and resource hierarchy inheritance.',
      'Configure Workload Identity Federation for external/non-Google workloads.',
      'Design VPC Service Controls and network security perimeters.',
      'Understand Cloud KMS, Secret Manager, and DLP for data protection.'
    ],
    recommendedLabs: [
      { name: 'NHI Workload Mesh (SPIFFE)', path: '/playground/workload-mesh' },
      { name: 'Policy Evaluator (ABAC/RBAC)', path: '/tools/policy-evaluator' }
    ]
  },

  // ───────────────────────── Identity Governance (IGA) ─────────────────────────
  {
    id: 'sailpoint-identitynow',
    title: 'SailPoint IdentityNow Engineer',
    vendor: 'SailPoint',
    category: 'Identity Governance (IGA)',
    difficulty: 'Intermediate',
    cost: 'Contact vendor',
    officialLink: 'https://www.sailpoint.com/certification',
    domains: [
      { name: 'Identity Lifecycle & Source Configuration', weight: 'Core' },
      { name: 'Access Certifications & Access Modeling', weight: 'Core' },
      { name: 'Workflows & Provisioning', weight: 'Core' }
    ],
    studyPath: [
      'Configure identity sources, correlation rules, and identity profiles.',
      'Design access certification campaigns and Separation-of-Duties (SoD) policies.',
      'Build IdentityNow workflows for automated joiner-mover-leaver provisioning.',
      'Model roles and entitlements using access modeling tools.'
    ],
    recommendedLabs: [
      { name: 'Access Certification Campaign Simulator', path: '/playground/access-certification' },
      { name: 'SCIM 2.0 Provisioning Lab', path: '/playground/scim' }
    ]
  },
  {
    id: 'saviynt-admin',
    title: 'Saviynt Certified Administrator',
    vendor: 'Saviynt',
    category: 'Identity Governance (IGA)',
    difficulty: 'Intermediate',
    cost: 'Contact vendor',
    officialLink: 'https://saviynt.com/university',
    domains: [
      { name: 'Identity Warehouse & Application Onboarding', weight: 'Core' },
      { name: 'Access Requests & Certifications', weight: 'Core' },
      { name: 'Risk Analytics & SoD Rules', weight: 'Core' }
    ],
    studyPath: [
      'Onboard target applications into Saviynt\'s identity warehouse.',
      'Configure dynamic access request workflows and approval chains.',
      'Design Separation-of-Duties (SoD) risk rules and remediation actions.',
      'Schedule periodic access certification campaigns.'
    ],
    recommendedLabs: [
      { name: 'Access Certification Campaign Simulator', path: '/playground/access-certification' }
    ]
  },
  {
    id: 'one-identity-manager',
    title: 'One Identity Manager Certified Administrator',
    vendor: 'One Identity',
    category: 'Identity Governance (IGA)',
    difficulty: 'Intermediate',
    cost: 'Contact vendor',
    officialLink: 'https://www.oneidentity.com/community/identity-manager/',
    domains: [
      { name: 'Identity Data Model & Connectors', weight: 'Core' },
      { name: 'Business Roles & Attestation', weight: 'Core' },
      { name: 'Compliance Rules & Reporting', weight: 'Core' }
    ],
    studyPath: [
      'Understand the One Identity Manager unified data model and target system connectors.',
      'Configure business roles, IT Shop request workflows, and delegated administration.',
      'Design attestation policies and compliance rule violation handling.',
      'Build reports for auditors using the Report Editor.'
    ],
    recommendedLabs: [
      { name: 'Access Certification Campaign Simulator', path: '/playground/access-certification' }
    ]
  },

  // ───────────────────────── Privileged Access Management (PAM) ─────────────────────────
  {
    id: 'cyberark-trustee',
    title: 'CyberArk Trustee',
    vendor: 'CyberArk',
    category: 'Privileged Access Management (PAM)',
    difficulty: 'Beginner',
    cost: 'Free (foundational)',
    officialLink: 'https://university.cyberark.com/',
    domains: [
      { name: 'PAM Fundamentals & Terminology', weight: 'Core' },
      { name: 'CyberArk Vault Architecture Overview', weight: 'Core' },
      { name: 'Core Use Cases: Rotation, Session Isolation', weight: 'Core' }
    ],
    studyPath: [
      'Learn why privileged accounts are the highest-value attacker target.',
      'Understand the CyberArk Digital Vault, CPM, and PSM at a conceptual level.',
      'Review core PAM use cases: password rotation, session isolation, and least privilege.'
    ],
    recommendedLabs: [
      { name: 'PAM Vaulting & JIT Elevation Lab', path: '/playground/pam-vaulting' }
    ]
  },
  {
    id: 'cyberark_defender',
    title: 'CyberArk Certified Defender (PAM)',
    vendor: 'CyberArk',
    category: 'Privileged Access Management (PAM)',
    difficulty: 'Intermediate',
    cost: '$200 USD',
    officialLink: 'https://university.cyberark.com/',
    domains: [
      { name: 'Privileged Account Security Vault Architecture', weight: '30%' },
      { name: 'Credential Onboarding & CPM Rotation Policies', weight: '30%' },
      { name: 'Privileged Session Monitoring & Jump-Server Proxies', weight: '40%' }
    ],
    studyPath: [
      'Understand Enterprise Password Vault (EPV) hardware server isolation and firewall setups.',
      'Configure Central Policy Manager (CPM) automatic target password rotation intervals.',
      'Deploy Privileged Session Manager (PSM) proxies with keystroke logger integrations.',
      'Design Dual-Control master request workflows and emergency break-glass procedures.'
    ],
    recommendedLabs: [
      { name: 'Workload Mesh (Machine Identities)', path: '/playground/workload-mesh' },
      { name: 'CyberArk Reference Guide', path: '/vendor' }
    ],
    quiz: [
      {
        q: 'How does CyberArk Privileged Session Manager (PSM) mitigate the risk of administrative password theft from an operator\'s workstation?',
        options: [
          'By locally encrypting the password on the admin workstation',
          'By routing credentials through an email approval workflow',
          'By proxying remote connections and injecting vault credentials directly into the session channel',
          'By forcing administrators to memorize passwords that CPM rotates daily'
        ],
        correct: 2,
        explanation: 'PSM proxies all RDP/SSH sessions, retrieves the requested credential from the Vault, and injects it directly into the remote session stream. The administrator never sees, knows, or interacts with the password, preventing credential theft on untrusted workstations.'
      },
      {
        q: 'A Central Policy Manager (CPM) fails to rotate the password of a target administrative account on a local Windows Server because the CPM lacks permission to write to the domain controller directly. What PAM configuration should you implement to resolve this?',
        options: [
          'Configure a CyberArk Reconcile Account in the Safe settings',
          'Disable CPM automatic rotation and rely on manual rotation',
          'Assign local admin rights on the domain controller to the CPM server directly',
          'Increase the CPM server network polling timeout'
        ],
        correct: 0,
        explanation: 'When target account credentials fail rotation due to password expiration or missing administrative permissions, CyberArk utilizes a pre-configured "Reconcile Account". This high-privilege account is invoked to forcefully reset and synchronize the target account\'s password on the target machine, restoring automation.'
      },
      {
        q: 'You need to configure the highest level of security for the CyberArk Enterprise Password Vault (EPV) server. What is the standard deployment recommendation regarding the operating system and firewall of the Vault server?',
        options: [
          'Run on a shared Windows Server alongside Active Directory domain services.',
          'Install on a dedicated Windows Server, run the CyberArk hardening script to disable unnecessary OS services, and enforce a localized, highly restrictive firewall rejecting all non-vault traffic.',
          'Deploy on a Linux Kubernetes cluster exposed to corporate load balancers.',
          'None of the above; cloud databases handle EPV security natively.'
        ],
        correct: 1,
        explanation: 'The CyberArk EPV Vault server must be hardened strictly. The hardening process disables unnecessary OS services, removes non-essential Windows features, closes all generic network ports except the Vault communication port (TCP 1858), and ensures the server operates solely as a cryptographically isolated identity safe.'
      },
      {
        q: 'Your corporate security policy demands that any administrative session targeting critical financial servers must require manual approval from a security manager, except during emergency "break-glass" situations. What CyberArk feature should you configure?',
        options: [
          'CyberArk Privileged Threat Analytics (PTA)',
          'CyberArk Safe Dual-Control (Confirmation) workflows',
          'Okta Access Gateway proxy rules',
          'Central Policy Manager rotational intervals'
        ],
        correct: 1,
        explanation: 'Safe Dual-Control (or confirmation workflows) forces administrators to submit a formal request stating business justification and time windows before gaining access to a sensitive credential. This request must be manually authorized by one or more designated Safe Owners before the session can proceed.'
      },
      {
        q: 'A security engineer detects that a domain administrator is executing suspicious PowerShell scripts on a server. CyberArk immediately flags this anomaly and terminates their active SSH session automatically. What CyberArk component is responsible for this detection?',
        options: [
          'Central Policy Manager (CPM)',
          'Privileged Threat Analytics (PTA)',
          'Enterprise Password Vault (EPV)',
          'CyberArk Identity Broker'
        ],
        correct: 1,
        explanation: 'Privileged Threat Analytics (PTA) continuously monitors real-time session logs, command history, and credential usage anomalies. If it detects anomalous or malicious commands (like credential harvest attempts or un-vaulted logins), it can trigger automated remediation actions, such as notifying SOC analysts, rotating credentials, or instantly suspending the active session.'
      }
    ]
  },
  {
    id: 'beyondtrust-admin',
    title: 'BeyondTrust Certified Administrator',
    vendor: 'BeyondTrust',
    category: 'Privileged Access Management (PAM)',
    difficulty: 'Intermediate',
    cost: 'Contact vendor',
    officialLink: 'https://www.beyondtrust.com/services/education',
    domains: [
      { name: 'Password Safe Vaulting & Rotation', weight: 'Core' },
      { name: 'Endpoint Privilege Management Policies', weight: 'Core' },
      { name: 'Session Monitoring & Recording', weight: 'Core' }
    ],
    studyPath: [
      'Configure Password Safe managed systems, accounts, and smart rules.',
      'Design Endpoint Privilege Management (EPM) rules for least-privilege desktop policies.',
      'Set up session monitoring, recording, and real-time session locking.',
      'Understand approval workflows and just-in-time access requests.'
    ],
    recommendedLabs: [
      { name: 'PAM Vaulting & JIT Elevation Lab', path: '/playground/pam-vaulting' },
      { name: 'Device Posture & MDM Attestation Lab', path: '/playground/device-trust' }
    ]
  },
  {
    id: 'delinea-admin',
    title: 'Delinea Secret Server Certified Administrator',
    vendor: 'Delinea',
    category: 'Privileged Access Management (PAM)',
    difficulty: 'Intermediate',
    cost: 'Contact vendor',
    officialLink: 'https://delinea.com/services/education-training',
    domains: [
      { name: 'Secret Vaulting & Folder Permissions', weight: 'Core' },
      { name: 'Password Rotation & Heartbeat Checks', weight: 'Core' },
      { name: 'Session Recording & Approval Workflows', weight: 'Core' }
    ],
    studyPath: [
      'Configure Secret Server folder structures, role-based permissions, and secret templates.',
      'Set up automatic password changing (rotation) and heartbeat validation checks.',
      'Enable session recording for RDP/SSH launchers.',
      'Design approval workflows and check-out/check-in for shared secrets.'
    ],
    recommendedLabs: [
      { name: 'PAM Vaulting & JIT Elevation Lab', path: '/playground/pam-vaulting' }
    ]
  },
  {
    id: 'cyberark-sentry',
    title: 'CyberArk Sentry',
    vendor: 'CyberArk',
    category: 'Privileged Access Management (PAM)',
    difficulty: 'Advanced',
    cost: '$400 USD',
    officialLink: 'https://university.cyberark.com/',
    domains: [
      { name: 'Advanced Vault Installation & DR Architecture', weight: 'Core' },
      { name: 'Custom Connection Components (PSM)', weight: 'Core' },
      { name: 'PTA Threat Detection Tuning', weight: 'Core' }
    ],
    studyPath: [
      'Design highly-available, disaster-recovery Vault cluster architectures.',
      'Build custom PSM Connection Components for non-standard target platforms.',
      'Tune Privileged Threat Analytics (PTA) detection rules and integrate with SIEM.',
      'Implement advanced Just-In-Time provisioning integrations with directory services.'
    ],
    recommendedLabs: [
      { name: 'PAM Vaulting & JIT Elevation Lab', path: '/playground/pam-vaulting' },
      { name: 'NHI Workload Mesh (SPIFFE)', path: '/playground/workload-mesh' }
    ]
  },

  // ───────────────────────── Security Leadership & GRC ─────────────────────────
  {
    id: 'cissp',
    title: '(ISC)² CISSP: Certified Information Systems Security Professional',
    vendor: '(ISC)²',
    category: 'Security Leadership & GRC',
    difficulty: 'Advanced',
    cost: '$749 USD',
    officialLink: 'https://www.isc2.org/certifications/cissp',
    domains: [
      { name: 'Security and Risk Management', weight: '16%' },
      { name: 'Asset Security', weight: '10%' },
      { name: 'Security Architecture and Engineering', weight: '13%' },
      { name: 'Communication and Network Security', weight: '13%' },
      { name: 'Identity and Access Management (IAM)', weight: '13%' },
      { name: 'Security Assessment and Testing', weight: '12%' },
      { name: 'Security Operations', weight: '13%' },
      { name: 'Software Development Security', weight: '10%' }
    ],
    studyPath: [
      'Study the full 8-domain CBK, with special depth on the IAM domain (federation, SSO, provisioning, access control models).',
      'Understand risk management frameworks and security governance.',
      'Learn network security architecture and secure protocols.',
      'Practice with domain-weighted mock exams to identify weak domains.'
    ],
    recommendedLabs: [
      { name: 'Access Control ABAC/RBAC Lab', path: '/playground/access' },
      { name: 'GRC Maturity Wizard', path: '/assess' }
    ]
  },
  {
    id: 'ccsp',
    title: '(ISC)² CCSP: Certified Cloud Security Professional',
    vendor: '(ISC)²',
    category: 'Security Leadership & GRC',
    difficulty: 'Advanced',
    cost: '$599 USD',
    officialLink: 'https://www.isc2.org/certifications/ccsp',
    domains: [
      { name: 'Cloud Concepts, Architecture and Design', weight: '17%' },
      { name: 'Cloud Data Security', weight: '19%' },
      { name: 'Cloud Platform and Infrastructure Security', weight: '17%' },
      { name: 'Cloud Application Security', weight: '17%' },
      { name: 'Cloud Security Operations', weight: '16%' },
      { name: 'Legal, Risk and Compliance', weight: '14%' }
    ],
    studyPath: [
      'Understand cloud identity federation, IAM/CIEM (Cloud Infrastructure Entitlement Management) concepts.',
      'Learn cloud data lifecycle security controls and encryption/key management.',
      'Study shared responsibility models across IaaS, PaaS, and SaaS.',
      'Review cloud legal/compliance frameworks (GDPR, cross-border data flows).'
    ],
    recommendedLabs: [
      { name: 'NHI Workload Mesh (SPIFFE)', path: '/playground/workload-mesh' },
      { name: 'Policy Evaluator (ABAC/RBAC)', path: '/tools/policy-evaluator' }
    ]
  },
  {
    id: 'cism',
    title: 'ISACA CISM: Certified Information Security Manager',
    vendor: 'ISACA',
    category: 'Security Leadership & GRC',
    difficulty: 'Advanced',
    cost: '$575 USD (member)',
    officialLink: 'https://www.isaca.org/credentialing/cism',
    domains: [
      { name: 'Information Security Governance', weight: '17%' },
      { name: 'Information Security Risk Management', weight: '20%' },
      { name: 'Information Security Program', weight: '33%' },
      { name: 'Incident Management', weight: '30%' }
    ],
    studyPath: [
      'Learn how to align an information security program (including IAM controls) with business objectives.',
      'Study enterprise risk management methodology and reporting to executives.',
      'Understand incident management and response planning at the program level.',
      'Review security governance frameworks (COBIT, ISO 27001).'
    ],
    recommendedLabs: [
      { name: 'GRC Maturity Wizard', path: '/assess' },
      { name: 'Identity Threat Detection (ITDR) Lab', path: '/playground/itdr' }
    ]
  },
  {
    id: 'crisc',
    title: 'ISACA CRISC: Certified in Risk and Information Systems Control',
    vendor: 'ISACA',
    category: 'Security Leadership & GRC',
    difficulty: 'Advanced',
    cost: '$575 USD (member)',
    officialLink: 'https://www.isaca.org/credentialing/crisc',
    domains: [
      { name: 'Governance', weight: '26%' },
      { name: 'IT Risk Assessment', weight: '20%' },
      { name: 'Risk Response and Reporting', weight: '32%' },
      { name: 'Information Technology and Security', weight: '22%' }
    ],
    studyPath: [
      'Learn enterprise risk and control frameworks, including access control risk assessment.',
      'Study risk response strategies (accept/mitigate/transfer/avoid) applied to identity risk.',
      'Understand IT control design and monitoring, including IAM control testing.',
      'Practice mapping identified access risks (e.g. orphaned accounts, SoD conflicts) to formal risk registers.'
    ],
    recommendedLabs: [
      { name: 'GRC Maturity Wizard', path: '/assess' },
      { name: 'Access Certification Campaign Simulator', path: '/playground/access-certification' }
    ]
  },

  // ───────────────────────── Privacy & Data Protection ─────────────────────────
  {
    id: 'cipt',
    title: 'IAPP CIPT: Certified Information Privacy Technologist',
    vendor: 'IAPP',
    category: 'Privacy & Data Protection',
    difficulty: 'Intermediate',
    cost: '$550 USD',
    officialLink: 'https://iapp.org/certify/cipt/',
    domains: [
      { name: 'Foundational Privacy Technology Concepts', weight: 'Core' },
      { name: 'Privacy in Systems and Applications', weight: 'Core' },
      { name: 'Privacy Engineering & Techniques', weight: 'Core' }
    ],
    studyPath: [
      'Understand privacy-by-design principles applied to identity systems.',
      'Study data minimization, pseudonymization, and consent-management architectures.',
      'Review how identity/CIAM systems must implement data-subject access and deletion rights.'
    ],
    recommendedLabs: [
      { name: 'CIAM Consent & Progressive Profiling Sandbox', path: '/playground/ciam-consent' },
      { name: 'Zero-Knowledge Proof (ZKP) Age Wallet', path: '/playground/zkp-wallet' }
    ]
  },
  {
    id: 'cipm',
    title: 'IAPP CIPM: Certified Information Privacy Manager',
    vendor: 'IAPP',
    category: 'Privacy & Data Protection',
    difficulty: 'Advanced',
    cost: '$550 USD',
    officialLink: 'https://iapp.org/certify/cipm/',
    domains: [
      { name: 'Developing a Privacy Program Framework', weight: 'Core' },
      { name: 'Privacy Program Operational Life Cycle', weight: 'Core' },
      { name: 'Metrics, Assessment and Governance', weight: 'Core' }
    ],
    studyPath: [
      'Learn how to design and govern an organization-wide privacy program.',
      'Study privacy impact assessments (PIAs/DPIAs) covering identity and access data flows.',
      'Understand vendor/third-party risk management for identity data processors.',
      'Review privacy metrics and executive reporting practices.'
    ],
    recommendedLabs: [
      { name: 'GRC Maturity Wizard', path: '/assess' }
    ]
  },

  // ───────────────────────── Cloud-Native & DevSecOps ─────────────────────────
  {
    id: 'cks',
    title: 'CKS: Certified Kubernetes Security Specialist',
    vendor: 'Linux Foundation / CNCF',
    category: 'Cloud-Native & DevSecOps',
    difficulty: 'Advanced',
    cost: '$395 USD',
    officialLink: 'https://www.cncf.io/training/certification/cks/',
    domains: [
      { name: 'Cluster Setup', weight: '10%' },
      { name: 'Cluster Hardening', weight: '15%' },
      { name: 'System Hardening', weight: '15%' },
      { name: 'Minimize Microservice Vulnerabilities', weight: '20%' },
      { name: 'Supply Chain Security', weight: '20%' },
      { name: 'Monitoring, Logging and Runtime Security', weight: '20%' }
    ],
    studyPath: [
      'Master Kubernetes RBAC: Roles, ClusterRoles, RoleBindings, and service account tokens.',
      'Harden the API server, restrict admission control, and enforce Pod Security Standards.',
      'Configure network policies and mTLS between workloads (e.g. via a service mesh or SPIFFE/SPIRE).',
      'Practice image scanning, supply-chain attestation, and runtime threat detection (Falco).'
    ],
    recommendedLabs: [
      { name: 'NHI Workload Mesh (SPIFFE)', path: '/playground/workload-mesh' },
      { name: 'Open Policy Agent (OPA) & Rego Playground', path: '/playground/opa' }
    ]
  }
]
