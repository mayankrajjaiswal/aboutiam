export interface VendorComponent {
  name: string
  role: string
}

export interface InterviewQuestion {
  q: string
  a: string
}

export interface VendorDetails {
  fullName: string
  category: string
  certifications: string[]
  strengths: string[]
  limitations: string[]
  components: VendorComponent[]
  deploymentChecklist: string[]
  licensingModel: string
  interviewQuestions: InterviewQuestion[]
  isFeatured?: boolean
  website?: string
  logo?: string
  marketPositioning?: string
  targetIndustries?: string[]
}

export interface ThalesProduct {
  id: string
  name: string
  tagline: string
  overview: string
  architectureAscii: string
  modules: { name: string; desc: string }[]
  standards: string[]
  deploymentModels: string[]
  useCases: string[]
  troubleshooting: { issue: string; resolution: string }[]
}

export type VendorType = 
  | 'entra_id' 
  | 'okta' 
  | 'ping_identity' 
  | 'forgerock' 
  | 'cyberark' 
  | 'sailpoint' 
  | 'saviynt' 
  | 'keycloak' 
  | 'wso2' 
  | 'ibm_security_verify' 
  | 'google_cloud_iam' 
  | 'aws_iam' 
  | 'oracle_iam' 
  | 'onelogin' 
  | 'fusionauth' 
  | 'auth0' 
  | 'jumpcloud' 
  | 'thales'

export const VENDOR_CATALOG: Record<VendorType, VendorDetails> = {
  thales: {
    fullName: 'Thales IAM Portfolio (Featured Flagship Partner)',
    category: 'Enterprise Identity Security, CIAM Orchestration & Adaptive Access Management',
    isFeatured: true,
    website: 'https://www.thalesgroup.com/',
    logo: '🛡️',
    marketPositioning: 'Global technology giant with deep expertise in military-grade cryptography, Hardware Security Modules (HSMs), and enterprise-grade identity. Thales acquired SafeNet (securing cloud access) and OneWelcome (Europe’s leading CIAM & consent orchestrator) to form a unified identity powerhouse.',
    targetIndustries: ['Banking & Financial Services', 'Defense & Aerospace', 'Government & Public Sector', 'Critical Infrastructure', 'Healthcare', 'B2B Federated Ecosystems'],
    certifications: [
      'Thales Certified SafeNet Administrator',
      'Thales OneWelcome Certified CIAM Professional',
      'Thales Certified Access Management Expert'
    ],
    strengths: [
      'Military-grade cryptographic foundations linking Hardware Security Modules (HSM) with software controls.',
      'Europe’s leading CIAM platform (OneWelcome) specializing in complex GDPR user consent and delegated admin.',
      'Outstanding, adaptive, risk-based access control engine (SafeNet Trusted Access) supporting a range of token options.',
      'Sovereign cloud compliance, meeting strict EU, US Federal, and global privacy data standards.'
    ],
    limitations: [
      'Portfolio spans several acquired products, currently transitioning into a fully unified administration interface.',
      'Comprehensive custom configurations (particularly localized delegated administration) may require technical integration support.',
      'Heavy-duty security design may offer more complexity than needed for basic early-stage consumer startups.'
    ],
    components: [
      { name: 'OneWelcome Identity Orchestration', role: 'Visual, drag-and-drop workflow designer to orchestrate onboarding, verification, and logins.' },
      { name: 'SafeNet Trusted Access (STA) Policy Engine', role: 'Context-aware access gatekeeper evaluating network, device posture, and adaptive biometric risks.' },
      { name: 'IdCloud', role: 'Sovereign cloud platform built for highly-regulated banking and government operations.' }
    ],
    deploymentChecklist: [
      'Deploy Thales authentication agents to secure VPN/RADIUS and remote access nodes.',
      'Configure OIDC/SAML federated pathways within the OneWelcome portal.',
      'Enable risk-based, adaptive MFA rules (STA) using mobile push and passwordless FIDO2 keys.',
      'Map dynamic GDPR user consent flows for customer-facing registration portals.'
    ],
    licensingModel: 'Per-user active or monthly subscription tiers. CIAM (OneWelcome) scales based on active registered users, and Access Management (STA) scales by workforce licenses and MFA tokens.',
    interviewQuestions: [
      {
        q: 'How does Thales OneWelcome enable GDPR-compliant user consent management?',
        a: 'OneWelcome provides fine-grained Consent and Preference Management as a core module. It lets organizations define distinct consent levels (e.g. Terms of Service, Marketing, Profile-sharing), tracks user consents as audit-ready cryptographical events, and allows users to modify or withdraw consent at any time via a self-service portal, satisfying GDPR Article 7.'
      },
      {
        q: 'What role do Hardware Security Modules (HSMs) play in Thales SafeNet Trusted Access?',
        a: 'The cryptographic keypairs used to sign SAML assertions, OIDC ID tokens, and encrypt user directory states inside the Thales cloud are generated, backed up, and executed inside physical, FIPS 140-2 Level 3 validated SafeNet HSMs, rendering private keys immune to extraction or logical theft.'
      },
      {
        q: 'Explain the concept of "Delegated Administration" in Thales OneWelcome.',
        a: 'Delegated Administration allows enterprises to outsource user administration to business customers, partners, or sub-organizations. An administrator of a customer-tenant can self-provision, modify, and offboard their own employees or guest users without needing access to the global parent directory, reducing corporate helpdesk overhead.'
      }
    ]
  },
  entra_id: {
    fullName: 'Microsoft Entra ID (formerly Azure AD)',
    category: 'Workforce IAM & Cloud Security Infrastructure',
    website: 'https://entra.microsoft.com',
    logo: '🟦',
    certifications: ['SC-300: Microsoft Identity and Access Administrator', 'SC-100: Microsoft Cybersecurity Architect'],
    strengths: [
      'Incredible, native integration with Windows, Office 365, and Azure cloud ecosystems.',
      'Strong Conditional Access Policy engine integrating machine risk and location telemetry.',
      'Seamless multi-cloud governance and external identity (B2B/B2C) support.'
    ],
    limitations: [
      'Licensing structure is complex (Premium P1/P2/G5 tiers can become highly expensive).',
      'Requires Microsoft ecosystem alignment to unlock full native capabilities.',
      'SAML/OIDC custom policy customization via XML (Identity Experience Framework) is notoriously complex.'
    ],
    components: [
      { name: 'Conditional Access', role: 'Context-aware risk evaluation policy decision engine.' },
      { name: 'Identity Governance (ELM)', role: 'Automates user lifecycle states (Joiner-Mover-Leaver) and entitlements.' },
      { name: 'Privileged Identity Management (PIM)', role: 'Handles Just-In-Time (JIT) administrative credentials elevation.' }
    ],
    deploymentChecklist: [
      'Configure Microsoft Entra Connect / Cloud Sync for hybrid Active Directory replication.',
      'Enable security defaults or configure strict Conditional Access baselines.',
      'Configure emergency access (Break-glass) administrator accounts exempt from MFA.',
      'Set up authentication strength policies to mandate phishing-proof passkeys / FIDO2.'
    ],
    licensingModel: 'User-based monthly subscription. Divided into Free, Premium P1 (advanced security), Premium P2 (governance & PIM), and special enterprise bundles (E5/G5).',
    interviewQuestions: [
      {
        q: 'What is the purpose of emergency access accounts in Entra ID, and how should they be secured?',
        a: 'Emergency accounts ("break-glass") are highly-privileged administrator accounts used to access the tenant during global federation outages. They must have permanent cloud-only credentials (not federated to on-prem), be excluded from standard MFA policies (or bound to highly-secured physical hardware keys kept in a safe), and any login event on them must trigger active high-priority SIEM alerts.'
      },
      {
        q: 'How does Privileged Identity Management (PIM) reduce organizational security risks?',
        a: 'PIM enforces the principle of least privilege by removing permanent administrative roles. Instead, administrators must request Just-In-Time (JIT) activation, provide a business justification, complete step-up MFA, and receive optional manager approvals. Roles automatically expire after a set time (e.g. 2 hours), minimizing lateral attack surfaces.'
      }
    ]
  },
  okta: {
    fullName: 'Okta Workforce Identity Cloud & Customer Identity (CIAM)',
    category: 'Universal Single Sign-On (SSO) & Tenant Federation Platform',
    website: 'https://www.okta.com',
    logo: '🟣',
    certifications: ['Okta Certified Professional / Administrator', 'Okta Certified Consultant / Developer', 'Okta Certified Technical Architect'],
    strengths: [
      'Outstanding, vendor-neutral Integration Network (OIN) supporting thousands of pre-built apps.',
      'Highly intuitive, developer-friendly REST APIs and software development kits (SDKs).',
      'Ultra-fast user onboarding via robust Universal Directory metadata mapping.'
    ],
    limitations: [
      'Primarily cloud-native; on-premise Active Directory support requires installing local sync agents.',
      'Advanced orchestration (Okta Workflows) can quickly exceed baseline API rate limits.',
      'Has experienced high-profile support-portal social engineering breaches, necessitating strict admin session lockdowns.'
    ],
    components: [
      { name: 'Universal Directory', role: 'Centralized directory schema aggregation mapping meta-attributes.' },
      { name: 'Okta Workflows', role: 'No-code visual identity automation and API orchestration platform.' },
      { name: 'Okta Access Gateway (OAG)', role: 'Enforces header-based authentication for legacy on-premise apps.' }
    ],
    deploymentChecklist: [
      'Deploy Okta AD/LDAP Directory Agents on local server domains.',
      'Configure custom domain names (e.g. auth.company.com) to prevent third-party cookie tracking issues.',
      'Define sign-on security policies mapping network zones and risk scoring tiers.',
      'Implement SCIM provisioning linkages for cloud applications.'
    ],
    licensingModel: 'Per-user per-month tiered pricing. Core SSO, Multi-Factor Authentication, Universal Directory, Lifecycle Management, and Workflows are priced as separate add-on licenses.',
    interviewQuestions: [
      {
        q: 'What is Okta Access Gateway (OAG) and how does it integrate with legacy applications?',
        a: 'OAG acts as a reverse proxy PEP (Policy Enforcement Point) deployed inside the corporate network. It intercepts requests, handles OIDC single sign-on federation with Okta cloud, and forwards the authenticated user context to legacy on-premise apps utilizing HTTP header injection (e.g. injecting the username in an HTTP header) or Kerberos delegation.'
      },
      {
        q: 'How should an Okta administrator protect the tenant against support-portal compromise attacks?',
        a: 'Administrators must enforce strict Conditional Access rules requiring administrative actions to originate only from managed devices and compliant network zones. Admin accounts should use phishing-proof WebAuthn credentials, and tenant log auditing should actively track any changes made to support bypass configurations.'
      }
    ]
  },
  ping_identity: {
    fullName: 'Ping Identity (PingFederate & PingAccess)',
    category: 'Enterprise-Scale Single Sign-On, Federation & API Posture',
    website: 'https://www.pingidentity.com',
    logo: '🏓',
    certifications: ['Ping Identity Certified Professional / Specialist', 'Ping Identity Certified Expert'],
    strengths: [
      'Highly flexible, enterprise-grade architecture capable of scaling to hundreds of millions of users.',
      'Incredible, fine-grained access control policy evaluation at the API and transaction layer.',
      'Seamless support for hybrid legacy, cloud-native, and multi-tenant configurations.'
    ],
    limitations: [
      'The separate product modules (PingFederate, PingAccess, PingDirectory, PingOne) require integration and licensing sync.',
      'Steep learning curve for newer developers due to heavy, protocol-dense menus.',
      'Often requires dedicated on-premise infrastructure setup compared to pure SaaS Okta.'
    ],
    components: [
      { name: 'PingFederate', role: 'Highly scalable, enterprise protocol engine for SAML, WS-Fed, and OIDC.' },
      { name: 'PingAccess', role: 'Header-based and token-based secure reverse proxy and API security policy decisions.' },
      { name: 'PingDirectory', role: 'Extremely fast, high-performance LDAP directory storage for core enterprise attributes.' }
    ],
    deploymentChecklist: [
      'Deploy PingFederate clusters in high-performance load-balanced server zones.',
      'Configure data store connectors to Active Directory, SQL, or custom LDAP registries.',
      'Establish OAuth and OpenID Connect client registries with precise token lifecycle configurations.',
      'Deploy PingAccess agents inside corporate application servers to terminate header auth.'
    ],
    licensingModel: 'Enterprise licensing agreements tailored to user volume, application connections, and deployed proxy environments.',
    interviewQuestions: [
      {
        q: 'What is the difference between PingFederate and PingAccess, and how do they coordinate access control?',
        a: 'PingFederate is the **federation protocol engine**; it authenticates users, federates single sign-on across directories, and issues standard SAML or OIDC tokens. PingAccess is the **access gatekeeper (PEP)**; it intercepts application traffic, validates incoming tokens issued by PingFederate, evaluates fine-grained resource rules, and injects secure identity headers into backend enterprise applications.'
      },
      {
        q: 'How does PingDirectory achieve its high performance compared to standard relational databases?',
        a: 'PingDirectory is built strictly as a highly-optimized directory server (LDAP) rather than a relational database (SQL). It organizes user attributes in a hierarchical tree structure, uses specialized in-memory indexing algorithms, and optimizes specifically for heavy read-to-write ratios (e.g. 95% reads for logins vs 5% database modifications).'
      }
    ]
  },
  forgerock: {
    fullName: 'ForgeRock Identity Platform (ForgeRock IDM & AM)',
    category: 'Highly Customizable Customer Identity & Access Management (CIAM)',
    website: 'https://www.forgerock.com',
    logo: '⛰️',
    certifications: ['ForgeRock Certified Access Management Specialist', 'ForgeRock Certified Identity Management Specialist'],
    strengths: [
      'Outstanding, flowchart-style visual Authentication Trees allowing highly custom login paths.',
      'Strong support for unified, scalable profiles combining CIAM and device variables.',
      'Extremely flexible, developer-centric design backing microservices and headless SDK integrations.'
    ],
    limitations: [
      'High operational complexity; customizing trees requires deep understanding of Javascript nodes.',
      'Requires specialized deployment knowledge for clustered Kubernetes environments.',
      'Licensing is heavily skewed toward high-volume consumer models, which can scale up in cost.'
    ],
    components: [
      { name: 'Access Management (AM)', role: 'Core authentication engine running visual login trees.' },
      { name: 'Identity Management (IDM)', role: 'Manages User schemas, progressive profiling, and sync reconciliation.' },
      { name: 'Directory Services (DS)', role: 'Highly scalable, in-memory LDAP directory store.' }
    ],
    deploymentChecklist: [
      'Configure visual Authentication Trees handling WebAuthn passwordless and risk steps.',
      'Set up IDM sync mappings to reconcile cloud profiles against custom databases.',
      'Deploy DS replicas in clustered configurations across multi-region Kubernetes groups.'
    ],
    licensingModel: 'SaaS or local container nodes subscription pricing, typically scaled by active user volume and transaction throughput.',
    interviewQuestions: [
      {
        q: 'What are ForgeRock Authentication Trees, and how do they differ from static login rules?',
        a: 'Authentication Trees are visual flowcharts where each node represents a specific authentication decision, query, or API check (e.g. prompt OTP, query IP threat ledger, check browser compliance). Unlike static, linear rule chains, trees allow developers to branch journeys dynamically based on the outcomes of previous steps, creating adaptive security paths.'
      },
      {
        q: 'How does IDM sync reconciliation manage synchronization differences?',
        a: 'ForgeRock IDM sync uses structured data mappings to reconcile users between different directories. It compares attribute states, flags inserts/deletes/updates, and executes action scripts (like sending email webhooks or provisioning Slack profiles) based on configured sync rules.'
      }
    ]
  },
  cyberark: {
    fullName: 'CyberArk Privileged Access Manager (PAM) & Identity Security',
    category: 'Enterprise Privileged Account Security & Secrets Management',
    website: 'https://www.cyberark.com',
    logo: '🔴',
    certifications: ['CyberArk Certified Trustee / Defender / Sentry', 'CyberArk Certified Delivery Engineer (CDE)', 'CyberArk Certified Guardian'],
    strengths: [
      'The undisputed industry gold standard for securing privileged administrator accounts.',
      'Robust session recording, keystroke logging, and real-time administrative command audits.',
      'Secure, isolated credential vaulting with automatic password rotation.'
    ],
    limitations: [
      'Infrastructure is heavy and complex (Vault, Central Policy Manager, PVWA, PSM require significant setup).',
      'Licensing and implementation costs are exceptionally high.',
      'Requires change-management efforts to convince administrators to abandon direct credential access.'
    ],
    components: [
      { name: 'Enterprise Password Vault (EPV)', role: 'The highly-secured core vault protecting privileged credentials.' },
      { name: 'Central Policy Manager (CPM)', role: 'Automates privileged password generation, rotation, and health verification.' },
      { name: 'Privileged Session Manager (PSM)', role: 'Proxies administrative sessions (SSH, RDP) with active keystroke logging.' }
    ],
    deploymentChecklist: [
      'Install the Digital Vault on dedicated, hardened Windows servers with direct firewall lockouts.',
      'Deploy PVWA (Web Console) and CPM (Rotator) on distinct network servers.',
      'Onboard administrative credential targets (Active Directory Domain Admins, SQL sa, root keys).',
      'Define password rotation policies, dual-control approval workflows, and emergency access exceptions.'
    ],
    licensingModel: 'Enterprise pricing based on vaulted privileged accounts, concurrent session proxies, and deployed server nodes.',
    interviewQuestions: [
      {
        q: 'How does CyberArk Privileged Session Manager (PSM) prevent administrative credential exposure?',
        a: 'PSM acts as a secure session jump-server. When an administrator requests access, PSM establishes the remote connection (SSH/RDP) to the target server, retrieves the password from the vault, injects it directly into the session channel, and proxies the connection. The admin never sees, knows, or interacts with the raw credentials, eliminating credential theft from the client machine.'
      },
      {
        q: 'What is the role of the Central Policy Manager (CPM) in the CyberArk architecture?',
        a: 'The CPM is the automation engine. It is responsible for checking password health on target servers, generating secure cryptographical passwords according to corporate policy, changing them on the target servers, and updating the vault. If a password fails verification, CPM runs self-healing reconciliation scripts using privileged root accounts.'
      }
    ]
  },
  sailpoint: {
    fullName: 'SailPoint IdentityIQ & IdentityNow (SaaS IGA)',
    category: 'Market-Leading Identity Governance & Administration (IGA)',
    website: 'https://www.sailpoint.com',
    logo: '⛵',
    certifications: ['SailPoint Certified IdentityNow Professional', 'SailPoint Certified IdentityIQ Engineer'],
    strengths: [
      'Definitive, industry-leading platform for Access Certification campaigns and audit compliance.',
      'Extremely deep Segregation of Duties (SoD) analysis and access risk calculation rules.',
      'Seamless automatic role mining and birthright entitlement provisioning.'
    ],
    limitations: [
      'IdentityIQ (on-prem) requires heavy custom Java development to write rules and connectors.',
      'Implementation cycles are notoriously long, often requiring dedicated consulting agencies.',
      'Not an SSO or MFA engine; must integrate with Ping, Okta, or Entra ID to enforce runtime authorization.'
    ],
    components: [
      { name: 'Access Certifications', role: 'Orchestrates mandatory manager review campaigns to recertify user access.' },
      { name: 'Lifecycle Manager (LCM)', role: 'Handles self-service access requests, approvals, and birthright provisioning.' },
      { name: 'Compliance Manager', role: 'Enforces Segregation of Duties (SoD) policies and runs audit logs.' }
    ],
    deploymentChecklist: [
      'Map HR directory endpoints as the primary source of truth for employee lifecycles.',
      'Configure role structures to auto-assign Birthright access roles on user creation.',
      'Define Segregation of Duties (SoD) policy violations to block toxic privilege combinations.',
      'Launch annual Access Certification campaigns for all high-risk financial application groups.'
    ],
    licensingModel: 'Per-user active enterprise license, scaled by managed identities and integrated target directories.',
    interviewQuestions: [
      {
        q: 'What is an Access Certification campaign, and why is it critical for regulatory audits?',
        a: 'Access Certification is a mandated compliance process where managers review and sign off on their employees\' privileges. This prevents entitlement creep (where users retain old access as they move roles). It is critical for SOC2 and SOX audits to mathematically prove that only authorized personnel possess access to financial or sensitive production resources.'
      },
      {
        q: 'How does Segregation of Duties (SoD) prevent internal fraud?',
        a: 'SoD identifies and blocks toxic privilege combinations. For example, a policy might dictate that the same user cannot possess both the "Create Purchase Order" and "Approve Payments" entitlements. SailPoint analyzes these rules before granting access requests, preventing internal conflict of interest fraud.'
      }
    ]
  },
  saviynt: {
    fullName: 'Saviynt Enterprise Identity Cloud',
    category: 'SaaS Identity Governance & Administration (IGA) & Risk Analytics',
    website: 'https://www.saviynt.com',
    logo: '🟢',
    certifications: ['Saviynt Certified IGA Professional'],
    strengths: [
      'SaaS-native, cloud-first platform delivering instant governance without local server setup.',
      'Excellent, near real-time Segregation of Duties (SoD) risk analysis.',
      'Comprehensive out-of-the-box integrations for cloud applications like AWS, Salesforce, and Workday.'
    ],
    limitations: [
      'Highly complex user interface that can feel cluttered to standard business managers.',
      'Integrating customized, on-prem legacy databases requires specialized scripting brokers.',
      'Heavy operational dependencies on continuous background directory sync timers.'
    ],
    components: [
      { name: 'Access Governance', role: 'Orchestrates self-service access requests, approvals, and annual certifications.' },
      { name: 'SaaS Connectivity', role: 'Out-of-the-box API connectors syncing cloud application metadata.' },
      { name: 'SoD Risk Engine', role: 'Mathematically calculates role combinations to identify risk and SoD violations.' }
    ],
    deploymentChecklist: [
      'Configure SaaS API connectivity parameters to ingest user data from Target Apps.',
      'Set up Segregation of Duties (SoD) analysis boundaries to flag toxic roles.',
      'Schedule automated cert-campaign reviews for privileged financial accounts.'
    ],
    licensingModel: 'SaaS subscription, priced by active monitored identities and connected target platforms.',
    interviewQuestions: [
      {
        q: 'What makes Saviynt cloud-native IGA different from traditional on-premise governance platforms?',
        a: 'Saviynt is built strictly as a multi-tenant SaaS platform, meaning organizations can deploy directory syncs, certifications, and access controls immediately without installing or maintaining local Java servers. It leverages APIs directly for target integrations rather than heavy on-prem database brokers.'
      },
      {
        q: 'How does Saviynt identify active Segregation of Duties (SoD) violations?',
        a: 'Saviynt uses a centralized Risk Engine with pre-loaded rule books. When a user requests access, the engine simulates the grant, checks if they already possess conflicting scopes, and flags a violation before allowing the request to proceed.'
      }
    ]
  },
  keycloak: {
    fullName: 'Keycloak Open Source Identity and Access Management',
    category: 'Self-Hosted & Open-Source Identity Federation',
    website: 'https://www.keycloak.org',
    logo: '🔑',
    certifications: ['No official vendor exams; managed by Red Hat (Red Hat build of Keycloak)'],
    strengths: [
      '100% free, open-source, and highly customizable. No license fee overheads.',
      'Outstanding out-of-the-box support for modern protocols (OAuth 2.1, OIDC, SAML 2.0).',
      'Highly extensible via Custom SPIs (Service Provider Interfaces) written in Java.'
    ],
    limitations: [
      'Requires self-hosting, database management, patching, and horizontal scaling overhead.',
      'User administration interface is functional but can feel dated compared to commercial offerings.',
      'No native directory; typically requires backing with external LDAP/Active Directory engines.'
    ],
    components: [
      { name: 'Realms', role: 'Isolated tenant security boundaries separating users, clients, and policies.' },
      { name: 'User Federation Providers', role: 'Integrates on-the-fly user syncing with LDAP/Active Directory directories.' },
      { name: 'Custom Java SPIs', role: 'Developer plug-ins to customize login flows, database storage, or protocol tokens.' }
    ],
    deploymentChecklist: [
      'Deploy Keycloak containers in high-availability clustering mode behind a load balancer.',
      'Configure a production-grade external database (e.g. PostgreSQL) instead of default H2.',
      'Enable HTTPS/TLS termination at the reverse proxy layer (e.g. Traefik, NGINX).',
      'Isolate the Keycloak Admin Console (`/admin`) from external public internet access.'
    ],
    licensingModel: 'Free under Apache License 2.0. Optional enterprise commercial support is available through Red Hat build of Keycloak (RH-SSO).',
    interviewQuestions: [
      {
        q: 'What is a "Realm" in Keycloak, and how should it be used in multi-tenant SaaS?',
        a: 'A Realm is a completely isolated security domain inside Keycloak. It has its own users, client registries, security policies, and token configurations. In multi-tenant systems, you can create one Realm per corporate tenant, giving each tenant complete logical isolation, custom branding, and custom corporate SSO setups.'
      },
      {
        q: 'Why should you avoid using Keycloak\'s default H2 database in production, and how should database connections be scaled?',
        a: 'The default H2 database is an in-memory, single-instance file storage that cannot scale horizontally or handle server restarts without total data loss. For production, Keycloak must connect to external clustered databases (like Postgres, Oracle, or MariaDB) and leverage caching grids (Infinispan) to distribute active user sessions across multiple container instances.'
      }
    ]
  },
  wso2: {
    fullName: 'WSO2 Identity Server',
    category: 'Developer-First API-Driven Open Source Access Management',
    website: 'https://wso2.com/identity-server/',
    logo: '⚙️',
    certifications: ['WSO2 Certified Identity Server Developer'],
    strengths: [
      'Highly customizable, developer-centric open-source identity engine.',
      'Excellent support for standard authentication and federation protocols (OAuth, OIDC, SAML, SCIM).',
      'Excellent performance with tiny memory footprint, optimized for container and API-gateway clusters.'
    ],
    limitations: [
      'Requires custom XML/Java configurations and developer scripting; lacks simplified business user controls.',
      'Smaller commercial partner ecosystem compared to corporate giants like Okta or Microsoft.',
      'Support and security patches require paid enterprise subscriptions.'
    ],
    components: [
      { name: 'OAuth/OIDC Engine', role: 'Protocol engine issuing signed JWT tokens and validating PKCE challenges.' },
      { name: 'Claim Mapping Broker', role: 'Maps user claims dynamically between disparate LDAP, SQL, and AD stores.' },
      { name: 'User Management Ingress', role: 'SCIM 2.0-compliant endpoints managing CRUD operations.' }
    ],
    deploymentChecklist: [
      'Deploy WSO2 inside clustered Docker/Kubernetes container pods behind API gateways.',
      'Configure LDAP user store mappings to centralize customer profiles.',
      'Register OAuth 2.1 client registrations with strict whitelisted redirect URIs.'
    ],
    licensingModel: 'Apache 2.0 Open Source, with paid enterprise support and security update subscriptions.',
    interviewQuestions: [
      {
        q: 'Why do developers choose WSO2 Identity Server for API-driven architectures?',
        a: 'Developers select WSO2 because it is fully open-source, highly extensible, and lightweight. It provides comprehensive, standard-compliant protocol gateways (OAuth, OIDC, SCIM) right out of the box, letting teams secure APIs and build bespoke customer portals without proprietary licensing lock-ins.'
      },
      {
        q: 'How does WSO2 manage user attribute mapping between multiple directories?',
        a: 'WSO2 uses a Claim Mapping Broker. It abstracts local user directory fields (e.g. sAMAccountName in AD, mail in LDAP) and translates them dynamically into standard OIDC claims (e.g. sub, email) before packing them inside issued JSON Web Tokens.'
      }
    ]
  },
  ibm_security_verify: {
    fullName: 'IBM Security Verify',
    category: 'Enterprise SaaS Access Management & Decentralized Identity',
    website: 'https://www.ibm.com/security/identity-access-management',
    logo: '🔵',
    certifications: ['IBM Certified Associate / Professional - Security Verify'],
    strengths: [
      'Solid legacy enterprise architecture with modern, AI-powered threat detection.',
      'Decentralized identity capabilities including support for verifiable credentials.',
      'Highly scalable directory with powerful consumer privacy controls.'
    ],
    limitations: [
      'UI/UX dashboard transitions can occasionally feel inconsistent across different modules.',
      'Ecosystem integration requires heavy reliance on IBM software stacks.',
      'Documentation can feel dry and enterprise-dense, creating a learning curve for newer developers.'
    ],
    components: [
      { name: 'AI Access Risk Analytics', role: 'Scans login events and dynamically alters MFA requirements based on intelligence.' },
      { name: 'Verify Credentials', role: 'W3C-compliant verifiable credentials issuer and verifier engine.' }
    ],
    deploymentChecklist: [
      'Connect cloud directories to local LDAP servers using Verify Bridge.',
      'Define adaptive access security policies checking browser fingerprinting.',
      'Create verifiable credential configurations for corporate ID templates.'
    ],
    licensingModel: 'Subscription per active user per month, with options for B2E (Workforce) and B2C (Customer) volumes.',
    interviewQuestions: [
      {
        q: 'How does IBM Security Verify utilize AI in access authorization?',
        a: 'The platform evaluates risk dynamically during login handshakes, evaluating device metadata, geographic velocity, and historical access profiles, dynamically stepping-up MFA or locking sessions when anomalies are found.'
      }
    ]
  },
  google_cloud_iam: {
    fullName: 'Google Cloud Identity & IAM',
    category: 'Cloud Infrastructure Entitlement Management (CIEM) & Resource Authorization',
    website: 'https://cloud.google.com/iam',
    logo: '🟡',
    certifications: ['Google Cloud Professional Cloud Security Engineer'],
    strengths: [
      'Incredible, fine-grained access control bound directly to cloud projects, folders, and resources.',
      'Powerful Policy Troubleshooter for tracking complex inherited permissions.',
      'Secure, native integration with G-Suite, Chromebooks, and Android endpoints.'
    ],
    limitations: [
      'Highly specialized for GCP cloud services; extending to on-prem databases requires directory agents.',
      'No native on-prem directory; requires external synchronization bridges.',
      'Mistakes in group inheritance can quickly lead to over-privileged accounts across cloud clusters.'
    ],
    components: [
      { name: 'Resource Manager', role: 'Maintains project hierarchies, binding IAM roles to folders and entities.' },
      { name: 'Policy Troubleshooter', role: 'Automated tool diagnosing why a specific principal has or lacks access.' }
    ],
    deploymentChecklist: [
      'Enforce least-privilege using custom GCP roles instead of default Owner/Editor/Viewer roles.',
      'Audit inherited permissions using Google Cloud Policy Analyzer scans monthly.',
      'Bind Service Accounts to workloads natively via Workload Identity.'
    ],
    licensingModel: 'Free baseline IAM on GCP cloud resources. Google Cloud Identity Premium scales on a monthly subscription per seat.',
    interviewQuestions: [
      {
        q: 'What is Google Cloud Workload Identity, and how does it secure Kubernetes workloads?',
        a: 'Workload Identity links Kubernetes service accounts directly with GCP IAM roles. It eliminates the need to export and store static service account JSON keys inside containers, instead dynamically issuing short-lived Google OAuth access tokens to authorized pods.'
      }
    ]
  },
  aws_iam: {
    fullName: 'AWS Identity and Access Management (IAM)',
    category: 'Cloud Infrastructure Entitlement Management & Policy Evaluation',
    website: 'https://aws.amazon.com/iam/',
    logo: '🟠',
    certifications: ['AWS Certified Security - Specialty', 'AWS Certified Solutions Architect'],
    strengths: [
      'Extremely powerful, fine-grained JSON Policy Evaluation Engine supporting Resource-based, Identity-based, and Session policies.',
      'Seamless multi-account organization governance using AWS IAM Identity Center (successor to AWS SSO).',
      'Robust machine identity verification using IAM roles and AWS STS (Security Token Service).'
    ],
    limitations: [
      'JSON policy size limits (e.g. 20KB for roles) can require architectural gymnastics.',
      'Policy evaluations are incredibly complex; confusing ABAC conditions can create security loopholes.',
      'Primarily an infrastructure control system, not built for customer or application user management.'
    ],
    components: [
      { name: 'STS (Security Token Service)', role: 'Issues temporary, short-lived security credentials for IAM roles.' },
      { name: 'IAM Access Analyzer', role: 'Mathematically analyzes resource policies to flag public or cross-account access.' }
    ],
    deploymentChecklist: [
      'Enforce strict MFA on all Root Account logins, keeping them isolated and locked away.',
      'Replace static IAM User Access Keys with IAM Roles and AWS STS temporary tokens.',
      'Implement Permission Boundaries to restrict max permissions assignable to junior developers.'
    ],
    licensingModel: '100% free of charge. Integrated natively as a core security tier across all AWS cloud resources.',
    interviewQuestions: [
      {
        q: 'What is an AWS IAM Permission Boundary, and when should it be used?',
        a: 'A Permission Boundary is an advanced policy that limits the maximum permissions that an identity-based policy can grant to an IAM principal. It is used when delegating role creation to non-administrators, ensuring that created roles cannot exceed the permissions defined by the boundary.'
      }
    ]
  },
  oracle_iam: {
    fullName: 'Oracle Identity and Access Management (OCI IAM)',
    category: 'Enterprise Hybrid Identity & Cloud Access Security',
    website: 'https://www.oracle.com/security/cloud-security/identity-and-access-management/',
    logo: '🔴',
    certifications: ['Oracle Cloud Infrastructure Security Professional'],
    strengths: [
      'Excellent support for heritage enterprise databases (Oracle DB, WebLogic, ERP systems).',
      'Fully integrated SaaS-native governance and compliance inside OCI cloud.',
      'Incredible scalability for enterprise B2B federated pipelines.'
    ],
    limitations: [
      'Historically complex software footprint (OIM, OAM) requiring specialized on-prem server management.',
      'OCI-native IAM console has a rigid structure compared to modern agile platforms like Okta.',
      'Less developer mindshare/smaller community support compared to cloud-native platforms.'
    ],
    components: [
      { name: 'OCI Identity Domains', role: 'Logical partitions inside OCI managing users, SSO, and groups.' },
      { name: 'Oracle Identity Governance', role: 'Handles complex enterprise workflow provisioning and role audits.' }
    ],
    deploymentChecklist: [
      'Configure Identity Domains to isolate internal developers from external B2B clients.',
      'Deploy Oracle Directory Services for high-performance enterprise user attributes sync.',
      'Set up MFA baselines for database access and database schema managers.'
    ],
    licensingModel: 'Included with OCI cloud consumption. Advanced Identity Domains feature tiered user-based licensing.',
    interviewQuestions: [
      {
        q: 'How do Oracle Identity Domains simplify multi-tenant deployments?',
        a: 'Domains allow administrators to partition users and policies into logically isolated security boundaries within a single cloud account, providing custom OIDC and SAML configurations per business domain.'
      }
    ]
  },
  onelogin: {
    fullName: 'OneLogin by One Identity',
    category: 'Agile Cloud Single Sign-On & Lifecycle Management',
    website: 'https://www.onelogin.com',
    logo: '🔴',
    certifications: ['OneLogin Certified Administrator / Architect'],
    strengths: [
      'Extremely rapid active-directory integration setup using local sync agents.',
      'Intuitive user portal and simple administrative menus, reducing helpdesk onboarding times.',
      'Solid, lightweight provisioning (SCIM) connector catalog.'
    ],
    limitations: [
      'Lacks the highly-custom developer orchestration (like Okta Workflows or custom Java SPIs).',
      'Advanced API governance is limited compared to dedicated security brokers like Ping.',
      'Parent company transitions have caused some platform updates to compile slower.'
    ],
    components: [
      { name: 'Active Directory Connector', role: 'Real-time sync engine utilizing active local Windows agents.' },
      { name: 'OneLogin SmartFactor', role: 'Machine learning rules altering authentication difficulty based on context.' }
    ],
    deploymentChecklist: [
      'Deploy multiple ADC agents for high-availability directory sync.',
      'Configure custom domain names and branding templates.',
      'Create security policy groups mapping specific office networks.'
    ],
    licensingModel: 'Per user per month subscription. SSO, Advanced Directory, Provisioning, and MFA are tier-locked.',
    interviewQuestions: [
      {
        q: 'How does OneLogin ADC achieve real-time Active Directory syncing without heavy batch imports?',
        a: 'The Active Directory Connector (ADC) establishes an active, persistent connection to local AD domain controllers, subscribing to AD event logs. When an AD attribute changes, the change is pushed to OneLogin instantly.'
      }
    ]
  },
  fusionauth: {
    fullName: 'FusionAuth Developer CIAM',
    category: 'Developer-First, Self-Hosted or Cloud CIAM Platform',
    website: 'https://fusionauth.io',
    logo: '🟠',
    certifications: ['No official exams; supported directly by active community blueprints'],
    strengths: [
      'Developer-centric, fast, single-binary deployable on-premise, inside Docker, or in FusionAuth Cloud.',
      'Highly flexible user search engine backed by Elasticsearch.',
      'Excellent support for multi-tenant setups and custom themed login flows.'
    ],
    limitations: [
      'No official visual workflow orchestration tools out-of-the-box.',
      'On-prem directory support (LDAP) requires custom directory sync scripting.',
      'Advanced enterprise features (like Enterprise SSO and Breached Password detection) require commercial licenses.'
    ],
    components: [
      { name: 'FusionAuth Engine', role: 'Ultra-fast, Java-free lightweight application backend issuing JWTs.' },
      { name: 'Elasticsearch Ingress', role: 'High-speed, scalable user and profile searching indexing framework.' }
    ],
    deploymentChecklist: [
      'Deploy FusionAuth containers in clustering mode linked to highly-available PostgreSQL.',
      'Configure custom themes using the integrated Freemarker templates.',
      'Set up webhook endpoints to capture user login and registration events.'
    ],
    licensingModel: 'Free Community tier (self-hosted). Paid developer, enterprise, and cloud subscriptions unlock advanced SSO and active support.',
    interviewQuestions: [
      {
        q: 'Why does FusionAuth package its runtime as a single, compiled package instead of requiring an application server?',
        a: 'This reduces operational footprint and deployment overhead. Developers can spin up FusionAuth instantly in Docker or local machines without configuring heavy Java application runtimes or complex database brokers.'
      }
    ]
  },
  auth0: {
    fullName: 'Auth0 by Okta',
    category: 'Developer-First Identity-as-a-Service (IDaaS)',
    website: 'https://auth0.com',
    logo: '🔴',
    certifications: ['Auth0 Certified Professional / Specialist', 'Okta/Auth0 Technical Architect'],
    strengths: [
      'Outstanding, developer-centric documentation, quickstart code guides, and SDK packages.',
      'Extremely custom logic injection using Auth0 Actions (JavaScript code snippets executing in flow transitions).',
      'Frictionless integration for social logins (Google, Apple) and passwordless biometrics.'
    ],
    limitations: [
      'Pricing scales rapidly based on monthly active users (MAUs), becoming highly expensive for high-volume B2C.',
      'Lacks complex workforce security governance features (PIM, entitlement certifications) native to Entra or Okta.',
      'Highly reliant on SaaS cloud; no options for on-premise deployments or offline operations.'
    ],
    components: [
      { name: 'Auth0 Actions', role: 'Serverless Node.js execution environments running custom code during token generation, login, or registrations.' },
      { name: 'Universal Login', role: 'Secure, hosted login pages preventing login-origin bypass spoofing.' }
    ],
    deploymentChecklist: [
      'Integrate Auth0 client SDKs into React/mobile code projects.',
      'Configure custom domains to eliminate third-party cookie blocking issues.',
      'Write Auth0 Actions to validate customer email patterns and enrich JWT claims.',
      'Implement MFA step-up logic using rule-based prompts.'
    ],
    licensingModel: 'Tiered pricing based on Monthly Active Users (MAUs). Features a robust Free tier for up to 7,000 MAUs, moving to Professional and Enterprise levels.',
    interviewQuestions: [
      {
        q: 'What are Auth0 Actions, and how do they replace legacy Rules and Hooks?',
        a: 'Auth0 Actions are serverless JavaScript functions running inside isolated Node.js containers at critical transaction points (e.g., pre-registration, post-login). They replace Rules/Hooks by offering a modern visual editor, support for npm modules, version control, and multi-step execution debugging.'
      }
    ]
  },
  jumpcloud: {
    fullName: 'JumpCloud Directory Platform',
    category: 'Cloud-Native Open Directory & Device Management',
    website: 'https://jumpcloud.com',
    logo: '🔵',
    certifications: ['JumpCloud Core Certification', 'JumpCloud Advanced Certification'],
    strengths: [
      'Acts as an unified, cloud directory COMBINING workforce IAM with MDM device posture control.',
      'Outstanding management for Windows, macOS, and Linux endpoints natively.',
      'Built-in support for LDAP-as-a-Service, Cloud RADIUS, and standard SAML/OIDC SSO.'
    ],
    limitations: [
      'CIAM/Customer IAM capabilities are highly limited; built strictly for workforce security.',
      'Advanced enterprise role certifications and IGA campaigns require separate integrations.',
      'Lacks a visual, no-code automation designer (like Okta Workflows).'
    ],
    components: [
      { name: 'Cloud LDAP / RADIUS', role: 'Managed directory services enabling legacy systems or office routers to authenticate.' },
      { name: 'JumpCloud Agent', role: 'Endpoint MDM agent enforcing local firewall rules, password lockouts, and patching.' }
    ],
    deploymentChecklist: [
      'Deploy JumpCloud Agents to all corporate employee laptops.',
      'Configure Cloud RADIUS to secure office Wi-Fi and VPN access routes.',
      'Set up SAML/OIDC federations to SaaS business applications.',
      'Enforce device compliance requirements (e.g., FileVault active) before permitting login.'
    ],
    licensingModel: 'Per-user monthly subscription. Divided into directory, SSO, and complete system-management bundles.',
    interviewQuestions: [
      {
        q: 'How does JumpCloud unify IAM and MDM (Mobile Device Management)?',
        a: 'JumpCloud deploys local endpoint agents that communicate posture telemetry (e.g. disk encryption, OS updates) back to the cloud. When a user requests access, JumpCloud evaluates both directory permissions AND device compliance metrics before permitting access.'
      }
    ]
  }
}

export const THALES_PRODUCTS: ThalesProduct[] = [
  {
    id: 'onewelcome',
    name: 'Thales OneWelcome Identity Platform',
    tagline: 'Europe’s Leading Customer & Partner IAM Platform with Advanced Orchestration',
    overview: 'Thales OneWelcome is a cloud-native Customer and Partner IAM (CIAM & B2B) platform specializing in highly secure, frictionless digital user journeys. Designed specifically for complex regulatory environments, it features robust delegated administration, consent management, and visual identity orchestration, enabling organizations to secure customer, partner, and gig-worker identities effortlessly.',
    architectureAscii: `
+-------------------------------------------------------------+
|               THALES ONEWELCOME ARCHITECTURE                |
+-------------------------------------------------------------+

                     [ External User Journey ]
                                 | (HTTPS / OIDC + SAML)
                                 v
        +-----------------------------------------------+
        |           OneWelcome Portal Gateway           |
        |  - Visual Identity Orchestrator (No-Code Flow)|
        |  - Consent & Preference Management Portal    |
        |  - Delegated B2B/B2B2C Partner Admin          |
        +-----------------------------------------------+
                                 |
         +-----------------------+-----------------------+
         | (SCIM 2.0 / API)                              | (SAML / OIDC)
         v                                               v
  [ SaaS App SP ]                                 [ Federated IdP ]
`,
    modules: [
      { name: 'Identity Orchestration', desc: 'A drag-and-drop, visual designer to model authentication journeys, KYC checks, and risk steps dynamically without modifying application code.' },
      { name: 'Customer & B2B IAM', desc: 'Secure customer single sign-on (SSO), profile registration, social federation, and progressive profiling templates.' },
      { name: 'Consent & Preference Management', desc: 'GDPR-ready, fine-grained consent tracking. Users can view, grant, and revoke processing permissions in a self-service console.' },
      { name: 'Delegated Administration', desc: 'Empowers B2B customers and business partners to manage their own users, roles, and SSO federations within their isolated tenant boundaries.' },
      { name: 'Gig Worker Identity', desc: 'Specialized onboarding and lifecycle management for temporary, freelance, and contract workforce partners.' }
    ],
    standards: ['OAuth 2.0 / 2.1', 'OpenID Connect (OIDC)', 'SAML 2.0', 'SCIM 2.0', 'FIDO2 / Passkeys'],
    deploymentModels: ['Sovereign Cloud (Dedicated hosting zones in Europe, US, etc.)', 'Private Cloud Deployment', 'Hybrid Deployment'],
    useCases: [
      'Retail Banking & Financial Portals requiring compliance with PSD2 and strict KYC regulations.',
      'Healthcare and Patient Portals requiring complex consent management and HIPAA compliance.',
      'Retail and E-commerce seeking seamless social sign-on and biometric passkey onboardings.',
      'Enterprise Partner Networks outsourcing user administration to partner admins.'
    ],
    troubleshooting: [
      {
        issue: 'SCIM Provisioning Sync Fails with HTTP 409 (Conflict)',
        resolution: 'This occurs when a user is synchronized whose email or username already exists in the target directory. Set up a SCIM reconciliation mapping script inside OneWelcome to automatically match on attributes, merging duplicate entities.'
      },
      {
        issue: 'OIDC Handshake Fails on Custom Domain Names (Cookie Blocking)',
        resolution: 'Modern browsers block third-party cookies by default. Ensure the OneWelcome portal custom domain matches your application domain suffix (e.g. auth.company.com for app.company.com) so the browser treats OIDC cookies as first-party context.'
      }
    ]
  },
  {
    id: 'sta',
    name: 'SafeNet Trusted Access (STA)',
    tagline: 'Military-Grade Access Management, Adaptive MFA & Passwordless Authentication',
    overview: 'Thales SafeNet Trusted Access (STA) is a cloud-based access management service that secures workforce access to cloud applications, virtual networks, and legacy on-premises platforms. It combines adaptive authentication, context-aware policy decisions, and a wide array of multi-factor authentication (MFA) tokens to enforce strict least-privilege Zero Trust security boundaries.',
    architectureAscii: `
+-------------------------------------------------------------+
|              SAFENET TRUSTED ACCESS POLICY PIPELINE         |
+-------------------------------------------------------------+

                     [ Employee Request ]
                               |
                               v
         +---------------------------------------------+
         |            STA Policy Decision Engine       |
         |  Evaluates:                                 |
         |  - Network IP & Geolocation                 |
         |  - Device Posture (MDM attestation)         |
         |  - User Risk & Historical Profile           |
         +---------------------------------------------+
                               |
         +---------------------+---------------------+
         | (Approved - Risk Low)                      | (Action - Risk Medium)
         v                                            v
  [ Passkey Login ]                            [ Prompt Push MFA ]
`,
    modules: [
      { name: 'Adaptive Access Policy Engine', desc: 'Enforces Zero Trust boundaries, evaluating user IP, location, device compliance, and request frequency dynamically.' },
      { name: 'Broad Token Support', desc: 'Supports mobile push alerts, software and hardware TOTP tokens, grid patterns, SMS, and passwordless FIDO2 keys.' },
      { name: 'Identity Federation', desc: 'Acts as a central protocol hub, federating single sign-on across SaaS apps (Microsoft, Google, Salesforce) and VPNs via SAML and OIDC.' },
      { name: 'RADIUS & legacy Secure Gateway', desc: 'Maintains native RADIUS and TCP gateways to secure legacy remote infrastructure, SSH logins, and firewalls.' }
    ],
    standards: ['SAML 2.0', 'OpenID Connect (OIDC)', 'OAuth 2.0', 'FIDO2 / Passkeys', 'RADIUS'],
    deploymentModels: ['Cloud-Delivered Access Management (STA)', 'Hybrid Enterprise (Local RADIUS / AD synchronization agents)'],
    useCases: [
      'Workforce Protection securing employee remote work, VPN endpoints, and virtual desktop infrastructures.',
      'Defense and Government sectors mandating FIPS-compliant hardware OTP and smartcard authentications.',
      'Financial institutions enforcing strict device-posture checks before granting administrative cloud access.'
    ],
    troubleshooting: [
      {
        issue: 'RADIUS authentication timeout during remote VPN login',
        resolution: 'Verify network latency between the VPN firewall and the SafeNet RADIUS Gateway agent. Ensure firewall ports (default UDP 1812/1813) are whitelisted, and increase the VPN client timeout to at least 15 seconds to allow for mobile push MFA latency.'
      },
      {
        issue: 'Adaptive MFA bypass (Policy failing to prompt)',
        resolution: 'Review the policy evaluation order. SafeNet Trusted Access executes rules sequentially; a broad wildcard rule at the top of the pile can inadvertently match and permit access, skipping downstream risk-based steps.'
      }
    ]
  },
  {
    id: 'idcloud',
    name: 'Thales IdCloud',
    tagline: 'Sovereign Cloud Platform for Digital Banking and Public Sector Identity',
    overview: 'Thales IdCloud is a highly-compliant, sovereign cloud platform built specifically for financial institutions, banking portals, and public sector groups. It combines digital onboarding, document verification (using biometric passport checks), customer authentication, and transaction signing into a unified ecosystem, facilitating fully audited, high-security regulatory compliance.',
    architectureAscii: `
+-------------------------------------------------------------+
|                   THALES IDCLOUD SYSTEM FLOW                |
+-------------------------------------------------------------+

                     [ New Customer App ]
                               |
                               v
         +---------------------------------------------+
         |            Thales IdCloud Sovereign Hub     |
         |  - Digital Document Verification (AI)      |
         |  - Biometric Face-Matching                 |
         |  - Transaction Cryptographic Signing       |
         +---------------------------------------------+
                               |
              [ KYC / AML Database Match Verification ]
`,
    modules: [
      { name: 'Digital Document Verification', desc: 'Leverages AI and Optical Character Recognition (OCR) to verify identity documents (Passports, Driver Licenses) securely.' },
      { name: 'Biometric Verification', desc: 'Matches the user’s selfie image with their verified document photo, running anti-spoofing liveness checks.' },
      { name: 'Strong Customer Authentication (SCA)', desc: 'Facilitates cryptographically secured, PSD2-compliant mobile push transaction signing.' }
    ],
    standards: ['FIDO2', 'FIPS 140-2 Cryptography', 'Sovereign ID Models', 'PSD2 / RTS Standards'],
    deploymentModels: ['Sovereign Cloud (Localized hosting, data sovereignty)', 'Private Banking Clouds'],
    useCases: [
      'Digital Banking Onboarding requiring instant, secure customer identity validation.',
      'Online Government Services requiring secure digital passport or smart ID verification.',
      'High-Value Transaction Signing preventing wire transfer and payment fraud.'
    ],
    troubleshooting: [
      {
        issue: 'Document validation failures during OCR scans',
        resolution: 'Ensure document images are captured in high resolution with even lighting. Verify that the SDK has localized document libraries updated to support regional passport security features.'
      }
    ]
  }
]
