import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Building, ArrowRight, ShieldCheck, HelpCircle, 
  Settings, Award, AlertTriangle, Layers
} from 'lucide-react'

type VendorType = 'entra_id' | 'okta' | 'keycloak' | 'cyberark' | 'ping_identity' | 'forgerock' | 'sailpoint' | 'saviynt' | 'wso2' | 'one_identity' | 'beyondtrust' | 'delinea'

interface VendorDetails {
  fullName: string
  category: string
  certifications: string[]
  strengths: string[]
  limitations: string[]
  components: { name: string; role: string }[]
  deploymentChecklist: string[]
  licensingModel: string
  interviewQuestions: { q: string; a: string }[]
}

const VENDOR_DATA: Record<VendorType, VendorDetails> = {
  entra_id: {
    fullName: 'Microsoft Entra ID (formerly Azure AD)',
    category: 'Workforce IAM & Cloud Security Infrastructure',
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
  keycloak: {
    fullName: 'Keycloak Open Source Identity and Access Management',
    category: 'Self-Hosted & Open-Source Identity Federation',
    certifications: ['No official vendor exams; managed by Red Hat (as part of Red Hat Single Sign-On)'],
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
  cyberark: {
    fullName: 'CyberArk Privileged Access Manager (PAM) & Identity Security',
    category: 'Enterprise Privileged Account Security & Secrets Management',
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
  ping_identity: {
    fullName: 'Ping Identity (PingFederate & PingAccess)',
    category: 'Enterprise-Scale Single Sign-On, Federation & API Posture',
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
  sailpoint: {
    fullName: 'SailPoint IdentityIQ & IdentityNow (SaaS IGA)',
    category: 'Market-Leading Identity Governance & Administration (IGA)',
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
  wso2: {
    fullName: 'WSO2 Identity Server',
    category: 'Developer-First API-Driven Open Source Access Management',
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
  one_identity: {
    fullName: 'One Identity Manager & Safeguard',
    category: 'Heritage Enterprise Identity Governance (IGA) & Active Directory Security',
    certifications: ['One Identity Certified Manager Specialist'],
    strengths: [
      'Extremely deep, battle-tested integrations for Microsoft Active Directory and Exchange environments.',
      'Flexible, custom workflow design backing complex corporate joiner-mover-leaver cycles.',
      'Solid administrative interface with robust database audit controls.'
    ],
    limitations: [
      'Heavy on-prem Windows Server dependencies; high deployment and maintenance costs.',
      'Customization relies on proprietary vbScript-style code blocks and complex relational database schemas.',
      'Cloud-native integrations (SaaS APIs) can feel retrofitted compared to pure SaaS competitors.'
    ],
    components: [
      { name: 'Identity Manager', role: 'IGA engine orchestrating employee lifecycles and AD provisioning.' },
      { name: 'Safeguard PAM', role: 'Secure session vaulting and credential rotation platform.' },
      { name: 'Active Roles', role: 'Extends Active Directory controls, enforcing secure administrative boundaries.' }
    ],
    deploymentChecklist: [
      'Deploy One Identity Manager on dedicated Windows Server groups connected to local SQL databases.',
      'Establish AD synchronization connectors using Active Roles agents.',
      'Configure employee joiner-mover-leaver workflow triggers driven by local HR databases.'
    ],
    licensingModel: 'Traditional perpetual enterprise server software licenses combined with annual maintenance support.',
    interviewQuestions: [
      {
        q: 'How does One Identity Active Roles extend standard Active Directory security?',
        a: 'Active Roles acts as a secure administrative proxy layer. Instead of granting administrators direct, high-level AD permissions, administrators execute actions inside Active Roles. The proxy validates the request against strict policy rules and completes the action in AD on their behalf.'
      },
      {
        q: 'What language is used to customize One Identity Manager workflows, and what is its architecture?',
        a: 'One Identity Manager uses a relational database-centric architecture where all configurations are stored in SQL Server. Customizations, validation rules, and lifecycle workflows are programmed using a proprietary vbScript-style syntax or visual templates, executing directly inside the database queue.'
      }
    ]
  },
  beyondtrust: {
    fullName: 'BeyondTrust Privileged Access Management (PAM)',
    category: 'Enterprise Privileged Session Vaulting & Local Admin Rotation',
    certifications: ['BeyondTrust Certified Safeguard Professional'],
    strengths: [
      'Definitive leader in secure remote session recording and administrative console vaulting.',
      'Strong support for endpoint privilege management, completely eliminating local admin rights on employee laptops.',
      'Seamless automated rotation of administrative, database, and system-account credentials.'
    ],
    limitations: [
      'Managing cross-operating system endpoint agents requires significant endpoint coordination.',
      'High licensing overhead which can scale rapidly when securing large server environments.',
      'Integrating with cloud-native DevOps pipelines (container credentials) can require separate broker setups.'
    ],
    components: [
      { name: 'Privileged Remote Access', role: 'Secure proxy gateway vaulting and recording administrative SSH/RDP sessions.' },
      { name: 'Password Safe', role: 'Central, highly encrypted repository rotating administrative credentials.' },
      { name: 'Endpoint Privilege Management', role: 'Removes local administrative rights on laptops, elevating specific commands on-demand.' }
    ],
    deploymentChecklist: [
      'Deploy Password Safe vaults across redundant network segments connected to key infrastructure.',
      'Deploy Endpoint Privilege agents to corporate workstations to strip local admin access.',
      'Configure session recording retention rules to log all administrative shell commands.'
    ],
    licensingModel: 'Enterprise licensing scaled by managed servers, database hosts, and administrative seats.',
    interviewQuestions: [
      {
        q: 'How does BeyondTrust Endpoint Privilege Management reduce malware risk on corporate laptops?',
        a: 'By stripping local administrative rights from all employees. If a user downloads malware, it cannot install or modify system directories. If an employee needs to execute an administrative task, the BeyondTrust agent elevates only that specific command on-demand based on policy rules, keeping the user account unprivileged.'
      },
      {
        q: 'What is secure Remote Session Recording, and why is it critical for PAM audits?',
        a: 'Remote Session Recording proxies administrative SSH or RDP connections through a secure gateway, capturing full video and raw keystroke command logs. It is critical for SOC2 compliance to prove that administrative activities were audited, recorded, and can be forensically investigated during incident responses.'
      }
    ]
  },
  delinea: {
    fullName: 'Delinea Secret Server (formerly Thycotic)',
    category: 'Cloud-First Privileged Access Management (PAM) & Password Vaulting',
    certifications: ['Delinea Certified Secret Server Professional'],
    strengths: [
      'Highly optimized, cloud-first SaaS PAM with extremely rapid deployment cycles.',
      'Excellent discovery engines scanning local networks to find unmanaged service accounts.',
      'Clean, modern user experience for rotating active local administrative and API keys.'
    ],
    limitations: [
      'Legacy on-prem Unix session monitoring and SSH proxying can require separate engine bridges.',
      'Relies heavily on background sync agents for hybrid local directory integrations.',
      'Advanced DevOps pipeline secrets injection requires separate DevOps Secrets Vault additions.'
    ],
    components: [
      { name: 'Secret Server', role: 'The core vaulting repository securely rotating passwords and keys.' },
      { name: 'Account Discovery', role: 'Scans Active Directory, networks, and hypervisors to identify unmanaged local accounts.' },
      { name: 'Privilege Manager', role: 'Strips local administrative rights on endpoints, elevating processes on-demand.' }
    ],
    deploymentChecklist: [
      'Deploy Secret Server Cloud tenant linked to corporate Entra ID domains.',
      'Configure Discovery Scans to audit active network service account passwords.',
      'Establish automatic rotation schedules for high-privilege SQL and system admins.'
    ],
    licensingModel: 'SaaS user subscription or server node licenses scaled by vaulted privileged accounts.',
    interviewQuestions: [
      {
        q: 'What is automated Service Account Discovery, and why is it critical for PAM audits?',
        a: 'Discovery is an automated scanner that queries AD and domain networks to locate service accounts (e.g. background tasks, IIS app pools, SQL runners) that have legacy, non-rotated passwords. It is critical because unmanaged, static service accounts are a prime target for lateral movement exploits.'
      },
      {
        q: 'How does Delinea Secret Server rotate privileged credentials without interrupting running services?',
        a: 'Secret Server uses Dependency Rotators. When a password is changed in the vault and target server, CPM-like rotators automatically check dependencies (e.g. Windows services or scheduled tasks running under that account) and update the password there as well, avoiding service downtime.'
      }
    ]
  }
}

export default function VendorCenter() {
  const [activeVendor, setActiveVendor] = useState<VendorType>('entra_id')
  const vendor = VENDOR_DATA[activeVendor]

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      {/* Page Header */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building className="text-accent-primary w-6 h-6 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Vendor Knowledge Center</h1>
            <p className="text-xs text-text-secondary">Comprehensive enterprise architectures, deployment checklists, and certifications for top IAM vendors</p>
          </div>
        </div>
        <Link to="/" className="text-sm bg-bg-nested hover:bg-border-subtle px-3 py-1.5 rounded text-text-secondary flex items-center gap-1.5 transition">
          <ArrowRight className="rotate-180 w-4 h-4" /> Exit Center
        </Link>
      </div>

      {/* Main Grid Wrapper */}
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Vendor Selector Tabs */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md">
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1">
              Select Vendor Platform
            </span>
            
            <div className="flex flex-col gap-2">
              {(Object.keys(VENDOR_DATA) as VendorType[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveVendor(key)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold border transition flex items-center justify-between ${activeVendor === key ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold' : 'bg-bg-nested/40 border-border-subtle text-text-secondary hover:border-border-subtle'}`}
                >
                  <span>{key === 'entra_id' ? 'Entra ID' : key === 'okta' ? 'Okta' : key === 'keycloak' ? 'Keycloak (OS)' : key === 'cyberark' ? 'CyberArk' : key === 'forgerock' ? 'ForgeRock' : key === 'sailpoint' ? 'SailPoint IGA' : key === 'saviynt' ? 'Saviynt SaaS' : key === 'wso2' ? 'WSO2 IS' : key === 'one_identity' ? 'One Identity' : key === 'beyondtrust' ? 'BeyondTrust PAM' : 'Ping Identity'}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeVendor === key ? 'translate-x-0.5 text-accent-primary' : 'text-text-muted'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-bg-card border border-border-subtle rounded-xl p-4 shadow-md">
            <h3 className="text-xs font-bold text-text-primary mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-accent-primary" /> Certified Learning Paths
            </h3>
            <p className="text-[10px] text-text-secondary leading-normal mb-3">
              Want to establish yourself as an enterprise IAM engineer? These certifications are highly valued by corporate recruiters.
            </p>
            <div className="space-y-2">
              {vendor.certifications.map((cert) => (
                <div key={cert} className="p-2 bg-bg-nested/60 border border-border-subtle rounded-lg text-[10px] font-medium text-text-secondary">
                  🛡️ {cert}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Heavy Reference Content */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Main overview hero card */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-md space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
              <Building className="w-24 h-24 text-accent-primary" />
            </div>

            <div>
              <span className="text-[10px] text-accent-primary font-bold font-mono uppercase tracking-wider bg-accent-glow border border-accent-primary/20 px-2.5 py-1 rounded-full">
                {vendor.category}
              </span>
              <h2 className="text-xl font-black text-text-primary mt-2.5">{vendor.fullName}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border-subtle">
              
              <div className="space-y-2">
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-status-success" /> Platform Strengths
                </span>
                <ul className="space-y-1.5 text-xs text-text-secondary leading-relaxed list-disc list-inside">
                  {vendor.strengths.map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-status-danger" /> Hard Constraints & Limitations
                </span>
                <ul className="space-y-1.5 text-xs text-text-secondary leading-relaxed list-disc list-inside">
                  {vendor.limitations.map((lim, idx) => (
                    <li key={idx}>{lim}</li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* Tabular breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Components & Roles */}
            <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-accent-primary" /> Core Architectural Components
                </span>
                
                <div className="space-y-3">
                  {vendor.components.map((comp) => (
                    <div key={comp.name} className="p-3 bg-bg-nested/40 border border-border-subtle rounded-lg text-xs leading-normal">
                      <span className="font-bold text-accent-primary block mb-0.5">{comp.name}</span>
                      <span className="text-text-secondary">{comp.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border-subtle bg-bg-nested/20 p-2.5 rounded text-[10px] text-text-muted font-mono">
                Licensing Context: {vendor.licensingModel}
              </div>
            </div>

            {/* Deployment checklist */}
            <div className="bg-bg-card border border-border-subtle rounded-xl p-5 shadow-md">
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-accent-secondary" /> Enterprise Deployment Checklist
              </span>
              
              <div className="space-y-2.5">
                {vendor.deploymentChecklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs leading-normal text-text-secondary">
                    <span className="w-5 h-5 rounded bg-accent-glow border border-accent-primary/20 text-accent-primary flex items-center justify-center font-bold font-mono text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Interview Questions block */}
          <div className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-md">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-3 border-b border-border-subtle pb-1.5 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-accent-primary" /> Common Technical Interview Questions
            </span>

            <div className="space-y-4">
              {vendor.interviewQuestions.map((q, idx) => (
                <div key={idx} className="space-y-1.5">
                  <span className="block font-bold text-text-primary text-xs">
                    Q: {q.q}
                  </span>
                  <div className="bg-bg-nested/40 border border-border-subtle p-3.5 rounded-lg text-xs leading-relaxed text-text-secondary">
                    {q.a}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
}
