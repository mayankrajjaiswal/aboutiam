export interface ExploreProduct {
  id: string
  name: string
  type: 'Open Source' | 'Enterprise SaaS' | 'Workforce SaaS' | 'CIAM' | 'Secrets Engine' | 'PAM & Access' | 'Directory Service'
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  license: string
  deployment: string
  bestUse: string
  protocols: {
    oidc: boolean
    saml: boolean
    scim: boolean
    fido2: boolean
    ldap: boolean
  }
  tags: string[]
  integrationSnippet: string
}

export const EXPLORE_PRODUCTS: ExploreProduct[] = [
  {
    id: 'keycloak',
    name: 'Keycloak',
    type: 'Open Source',
    difficulty: 'Beginner',
    license: 'Apache-2.0',
    deployment: 'Self-hosted (Docker, Kubernetes, Bare-Metal)',
    bestUse: 'Best for standard, highly customizable, and fully self-hosted Open Source Identity Provider (IdP) infrastructures.',
    protocols: { oidc: true, saml: true, scim: false, fido2: true, ldap: true },
    tags: ['self-hosted', 'realm', 'admin console', 'open source idp'],
    integrationSnippet: `# Spring Security Configuration for Keycloak OIDC
spring:
  security:
    oauth2:
      client:
        registration:
          keycloak:
            client-id: aboutiam-spa
            client-secret: sec_keycloak_9922a
            scope: openid, profile, email
            authorization-grant-type: authorization_code
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
        provider:
          keycloak:
            issuer-uri: https://auth.company.com/realms/aboutiam`
  },
  {
    id: 'authentik',
    name: 'Authentik',
    type: 'Open Source',
    difficulty: 'Beginner',
    license: 'GPL-3.0',
    deployment: 'Self-hosted (Docker-Compose, Helm Chart)',
    bestUse: 'Ideal for tech-savvy DevOps teams wanting a modern, lightweight Open Source SSO portal with unified proxy outposts.',
    protocols: { oidc: true, saml: true, scim: true, fido2: true, ldap: true },
    tags: ['self-hosted', 'outpost', 'reverse proxy', 'open source idp'],
    integrationSnippet: `# Authentik Outpost Proxy Configuration
version: "3.4"
services:
  authentik-outpost:
    image: ghcr.io/goauthentik/proxy:2026.3.1
    ports:
      - "9000:9000"
    environment:
      AUTHENTIK_HOST: "https://auth.company.com"
      AUTHENTIK_TOKEN: "ak_outpost_token_99b82c..."
      AUTHENTIK_INSECURE: "false"`
  },
  {
    id: 'auth0-okta',
    name: 'Auth0 / Okta',
    type: 'Enterprise SaaS',
    difficulty: 'Beginner',
    license: 'Commercial SaaS',
    deployment: 'Cloud Multi-tenant SaaS / Private Cloud',
    bestUse: 'Premium customer identity (CIAM) integrations, providing instant social logins, analytics, and passwordless authentication.',
    protocols: { oidc: true, saml: true, scim: true, fido2: true, ldap: false },
    tags: ['ciam', 'social login', 'passwordless', 'universal login'],
    integrationSnippet: `// Auth0 React SPA Integration Script
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';

export function App() {
  return (
    <Auth0Provider
      domain="aboutiam.us.auth0.com"
      clientId="client_auth0_spa_9921"
      authorizationParams={{
        redirect_uri: window.location.origin,
        scope: "openid profile email"
      }}
    >
      <MainApp />
    </Auth0Provider>
  );
}`
  },
  {
    id: 'entra-id',
    name: 'Microsoft Entra ID',
    type: 'Workforce SaaS',
    difficulty: 'Intermediate',
    license: 'Enterprise Commercial',
    deployment: 'Microsoft Azure Cloud Native SaaS',
    bestUse: 'Defacto workforce employee management, offering tight integration with Office 365, Active Directory syncs, and heavy GPOs.',
    protocols: { oidc: true, saml: true, scim: true, fido2: true, ldap: true },
    tags: ['azure ad', 'workforce identity', 'conditional access', 'msal'],
    integrationSnippet: `// Microsoft MSAL.js OIDC Configuration
import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "entra-client-guid-002a3b",
    authority: "https://login.microsoftonline.com/entra-tenant-id",
    redirectUri: "https://aboutiam.com/callback"
  },
  cache: {
    cacheLocation: "sessionStorage"
  }
};

const msalInstance = new PublicClientApplication(msalConfig);`
  },
  {
    id: 'teleport',
    name: 'Teleport Access',
    type: 'PAM & Access',
    difficulty: 'Advanced',
    license: 'Apache-2.0 / Enterprise',
    deployment: 'Self-hosted Proxy / Managed Cloud',
    bestUse: 'Perfect for privileged access management (PAM), securing servers, databases, and Kubernetes clusters with session recordings.',
    protocols: { oidc: true, saml: true, scim: false, fido2: true, ldap: false },
    tags: ['pam', 'session recording', 'kubernetes', 'ssh'],
    integrationSnippet: `# Teleport SSH Role Resource Map
kind: role
metadata:
  name: infrastructure-db-admin
spec:
  allow:
    logins: [root, ec2-user]
    node_labels:
      'env': 'production'
    db_users: ['postgres', 'admin']
    db_names: ['*']
  options:
    max_session_ttl: 1h # Ephemeral Just-in-Time session limit`
  },
  {
    id: 'hashicorp-vault',
    name: 'HashiCorp Vault',
    type: 'Secrets Engine',
    difficulty: 'Intermediate',
    license: 'BSL 1.1 / Commercial',
    deployment: 'Self-hosted (Binary, Helm) / Managed Cloud',
    bestUse: 'The leading centralized secret engine, storing passwords, API keys, and dynamically issuing ephemeral database users.',
    protocols: { oidc: true, saml: false, scim: false, fido2: false, ldap: true },
    tags: ['secrets management', 'dynamic secrets', 'kv engine', 'transit'],
    integrationSnippet: `# Enable OIDC Auth Role in HashiCorp Vault CLI
vault auth enable oidc

vault write auth/oidc/config \\
    oidc_discovery_url="https://auth.company.com/realms/aboutiam" \\
    oidc_client_id="vault-client-id" \\
    oidc_client_secret="sec_vault_002"

vault write auth/oidc/role/developer \\
    user_claim="sub" \\
    allowed_redirect_uris="https://vault.company.com/ui/vault/auth/oidc/oidc/callback" \\
    policies="developer-policy" \\
    ttl="1h"`
  },
  {
    id: 'ory',
    name: 'Ory (Kratos + Hydra)',
    type: 'Open Source',
    difficulty: 'Advanced',
    license: 'Apache-2.0',
    deployment: 'Self-hosted (Docker, Kubernetes) / Ory Network Managed Cloud',
    bestUse: 'API-first, headless identity and OAuth2 server stack for teams building fully custom login UIs on top of a hardened backend.',
    protocols: { oidc: true, saml: false, scim: false, fido2: true, ldap: false },
    tags: ['headless', 'api-first', 'oauth2 server', 'kratos', 'hydra'],
    integrationSnippet: `# Ory Kratos self-service login flow (curl)
curl -s -X GET \\
  "https://playground.projects.oryapis.com/self-service/login/api" \\
  -H "Accept: application/json" | jq '.ui.nodes'

# Submit credentials to the returned action URL
curl -s -X POST "$ACTION_URL" \\
  -H "Content-Type: application/json" \\
  -d '{"method":"password","identifier":"user@aboutiam.com","password":"hunter2"}'`
  },
  {
    id: 'zitadel',
    name: 'Zitadel',
    type: 'Open Source',
    difficulty: 'Advanced',
    license: 'Apache-2.0',
    deployment: 'Self-hosted (Docker, Kubernetes) / Zitadel Cloud',
    bestUse: 'Modern, multi-tenant-native IAM platform built on event sourcing (CQRS/ES), good fit for B2B SaaS needing organization-scoped tenants out of the box.',
    protocols: { oidc: true, saml: true, scim: true, fido2: true, ldap: false },
    tags: ['multi-tenant', 'event sourcing', 'b2b saas', 'organizations'],
    integrationSnippet: `# Zitadel machine-to-machine JWT profile token request
curl -s -X POST "https://aboutiam.zitadel.cloud/oauth/v2/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer" \\
  -d "assertion=$SIGNED_JWT" \\
  -d "scope=openid profile urn:zitadel:iam:org:project:id:zitadel:aud"`
  },
  {
    id: 'okta-workforce',
    name: 'Okta Workforce Identity',
    type: 'Enterprise SaaS',
    difficulty: 'Intermediate',
    license: 'Commercial SaaS',
    deployment: 'Cloud Multi-tenant SaaS',
    bestUse: 'Market-leading dedicated workforce IdP with deep app-catalog SSO, lifecycle management, and adaptive MFA policies.',
    protocols: { oidc: true, saml: true, scim: true, fido2: true, ldap: true },
    tags: ['workforce identity', 'app catalog', 'lifecycle management', 'adaptive mfa'],
    integrationSnippet: `// Okta SDK for JavaScript OIDC config
import { OktaAuth } from '@okta/okta-auth-js';

const authClient = new OktaAuth({
  issuer: 'https://aboutiam.okta.com/oauth2/default',
  clientId: 'okta-client-id-77af2',
  redirectUri: 'https://aboutiam.com/callback',
  scopes: ['openid', 'profile', 'email'],
  pkce: true
});`
  },
  {
    id: 'ping-identity',
    name: 'Ping Identity (PingOne)',
    type: 'Enterprise SaaS',
    difficulty: 'Intermediate',
    license: 'Commercial SaaS',
    deployment: 'Cloud Multi-tenant SaaS / Private Cloud (PingFederate)',
    bestUse: 'Enterprise-grade federation broker of choice for large regulated organizations needing hybrid on-prem/cloud SSO and fine-grained policy orchestration.',
    protocols: { oidc: true, saml: true, scim: true, fido2: true, ldap: true },
    tags: ['federation', 'policy orchestration', 'hybrid', 'pingfederate'],
    integrationSnippet: `# PingOne OIDC discovery + authorization URL
GET https://auth.pingone.com/{envId}/as/.well-known/openid-configuration

GET https://auth.pingone.com/{envId}/as/authorize
  ?client_id=pingone-client-88c1
  &response_type=code
  &scope=openid profile email
  &redirect_uri=https://aboutiam.com/callback`
  },
  {
    id: 'jumpcloud',
    name: 'JumpCloud',
    type: 'Workforce SaaS',
    difficulty: 'Beginner',
    license: 'Commercial SaaS',
    deployment: 'Cloud Multi-tenant SaaS (Directory-as-a-Service)',
    bestUse: 'Cloud directory replacement for small-to-mid size teams that want unified device, LDAP, and SSO management without an on-prem domain controller.',
    protocols: { oidc: true, saml: true, scim: true, fido2: true, ldap: true },
    tags: ['directory as a service', 'cloud ldap', 'device management', 'radius'],
    integrationSnippet: `# JumpCloud SCIM 2.0 user provisioning endpoint
curl -s -X POST "https://scim.jumpcloud.com/v2/Users" \\
  -H "Authorization: Bearer $JC_SCIM_TOKEN" \\
  -H "Content-Type: application/scim+json" \\
  -d '{"schemas":["urn:ietf:params:scim:schemas:core:2.0:User"],"userName":"jane@aboutiam.com","active":true}'`
  },
  {
    id: 'onelogin',
    name: 'OneLogin',
    type: 'Enterprise SaaS',
    difficulty: 'Beginner',
    license: 'Commercial SaaS',
    deployment: 'Cloud Multi-tenant SaaS',
    bestUse: 'Straightforward, admin-friendly SSO and MFA portal well suited for mid-market companies rolling out their first centralized workforce IdP.',
    protocols: { oidc: true, saml: true, scim: true, fido2: false, ldap: true },
    tags: ['sso portal', 'mid-market', 'smart mfa'],
    integrationSnippet: `// OneLogin OIDC token exchange
POST https://aboutiam.onelogin.com/oidc/2/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=AUTH_CODE_HERE
&redirect_uri=https://aboutiam.com/callback
&client_id=onelogin-client-4471
&client_secret=sec_onelogin_002`
  },
  {
    id: 'workos',
    name: 'WorkOS',
    type: 'CIAM',
    difficulty: 'Intermediate',
    license: 'Commercial SaaS (API)',
    deployment: 'Cloud API — embeds into your own app, no hosted admin UI required',
    bestUse: 'Fastest path for a B2B SaaS product to ship Enterprise SSO (SAML/OIDC) and Directory Sync without building a federation stack in-house.',
    protocols: { oidc: true, saml: true, scim: true, fido2: false, ldap: false },
    tags: ['b2b saas', 'enterprise sso as a service', 'directory sync'],
    integrationSnippet: `// WorkOS SSO authorization URL generation (Node SDK)
const authorizationUrl = workos.sso.getAuthorizationUrl({
  organization: 'org_01H...',
  clientId: 'client_workos_9902',
  redirectUri: 'https://aboutiam.com/callback',
});`
  },
  {
    id: 'frontegg',
    name: 'Frontegg',
    type: 'CIAM',
    difficulty: 'Intermediate',
    license: 'Commercial SaaS',
    deployment: 'Cloud Multi-tenant SaaS with embeddable pre-built UI widgets',
    bestUse: 'Full self-service CIAM layer (login box, admin portal, entitlements) that product teams embed directly to skip building user management screens.',
    protocols: { oidc: true, saml: true, scim: true, fido2: true, ldap: false },
    tags: ['ciam', 'self-service admin portal', 'entitlements', 'embedded login'],
    integrationSnippet: `// Frontegg React embedded login provider
import { FronteggProvider } from '@frontegg/react';

<FronteggProvider
  contextOptions={{
    baseUrl: 'https://aboutiam-app.frontegg.com',
    clientId: 'frontegg-client-2201'
  }}
  hostedLoginBox={true}
>
  <MainApp />
</FronteggProvider>`
  },
  {
    id: 'cyberark',
    name: 'CyberArk Privilege Cloud',
    type: 'PAM & Access',
    difficulty: 'Advanced',
    license: 'Commercial SaaS / On-Prem',
    deployment: 'Managed Cloud (Privilege Cloud) / Self-hosted (Vault + PVWA)',
    bestUse: 'Industry-benchmark PAM suite for regulated enterprises, centered on the isolated Digital Vault, session isolation, and automated credential rotation.',
    protocols: { oidc: true, saml: true, scim: false, fido2: false, ldap: true },
    tags: ['pam', 'digital vault', 'credential rotation', 'session isolation'],
    integrationSnippet: `# CyberArk REST API — check out a privileged account password
curl -s -X POST "https://aboutiam.cyberark.cloud/PasswordVault/api/Accounts/{accountId}/Password/Retrieve" \\
  -H "Authorization: Bearer $CYBERARK_SESSION_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"reason":"scheduled-maintenance","TicketId":"CHG00123"}'`
  },
  {
    id: 'beyondtrust',
    name: 'BeyondTrust Password Safe',
    type: 'PAM & Access',
    difficulty: 'Advanced',
    license: 'Commercial On-Prem / Cloud',
    deployment: 'Self-hosted Appliance / Managed Cloud',
    bestUse: 'Endpoint-privilege-management-first PAM suite pairing vaulted credential check-out with granular Windows/Unix least-privilege session controls.',
    protocols: { oidc: true, saml: true, scim: false, fido2: false, ldap: true },
    tags: ['pam', 'least privilege', 'endpoint privilege management', 'session monitoring'],
    integrationSnippet: `# BeyondTrust Password Safe API — request a managed account password
curl -s -X POST "https://aboutiam.beyondtrustcloud.com/BeyondTrust/api/public/v3/Credentials" \\
  -H "Authorization: PS-Auth key=$API_KEY; runas=svc-automation;" \\
  -H "Content-Type: application/json" \\
  -d '{"SystemName":"db-prod-01","AccountName":"svc_backup"}'`
  },
  {
    id: 'hashicorp-boundary',
    name: 'HashiCorp Boundary',
    type: 'PAM & Access',
    difficulty: 'Advanced',
    license: 'MPL-2.0 / Enterprise',
    deployment: 'Self-hosted (Binary, Helm) / HCP Boundary Managed',
    bestUse: 'Identity-aware, session-brokered remote access to dynamic infrastructure — no VPN, no static bastion host, credentials injected just-in-time via Vault.',
    protocols: { oidc: true, saml: false, scim: false, fido2: false, ldap: false },
    tags: ['zero trust access', 'session brokering', 'just-in-time credentials', 'no vpn'],
    integrationSnippet: `# Boundary CLI — connect to a target through a brokered session
boundary connect \\
  -target-id ttcp_1a2b3c \\
  -auth-method-id ampw_oidc001 \\
  -exec /usr/bin/psql -- -h {{boundary.ip}} -p {{boundary.port}} -U app_user aboutiam_db`
  },
  {
    id: 'doppler',
    name: 'Doppler',
    type: 'Secrets Engine',
    difficulty: 'Beginner',
    license: 'Commercial SaaS',
    deployment: 'Cloud Multi-tenant SaaS with a lightweight local CLI agent',
    bestUse: 'Developer-friendly secrets manager for teams that want centralized env-var/secret sync across local dev, CI, and cloud runtimes with minimal setup.',
    protocols: { oidc: true, saml: false, scim: false, fido2: false, ldap: false },
    tags: ['secrets sync', 'env vars', 'developer experience', 'ci/cd secrets'],
    integrationSnippet: `# Doppler CLI — inject secrets directly into a process environment
doppler setup --project aboutiam --config prd
doppler run -- node server.js`
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace Identity',
    type: 'Workforce SaaS',
    difficulty: 'Beginner',
    license: 'Commercial SaaS',
    deployment: 'Cloud Multi-tenant SaaS (Google Cloud Identity)',
    bestUse: 'Turnkey workforce identity for organizations already standardized on Gmail/Docs — lightweight SSO app catalog and endpoint management bundled in.',
    protocols: { oidc: true, saml: true, scim: true, fido2: true, ldap: false },
    tags: ['google cloud identity', 'workspace sso', 'context-aware access'],
    integrationSnippet: `// Google Identity Services OIDC sign-in button
google.accounts.id.initialize({
  client_id: 'google-client-id.apps.googleusercontent.com',
  callback: handleCredentialResponse
});
google.accounts.id.renderButton(
  document.getElementById('signInDiv'),
  { theme: 'outline', size: 'large' }
);`
  },
  {
    id: 'openldap',
    name: 'OpenLDAP',
    type: 'Directory Service',
    difficulty: 'Intermediate',
    license: 'OLDAP-2.8',
    deployment: 'Self-hosted (slapd daemon, Docker)',
    bestUse: 'The classic, ubiquitous open-source LDAPv3 directory server — the on-prem foundation most legacy IAM stacks (Kerberos, RADIUS, apps) bind to.',
    protocols: { oidc: false, saml: false, scim: false, fido2: false, ldap: true },
    tags: ['ldap', 'slapd', 'directory server', 'on-prem'],
    integrationSnippet: `# OpenLDAP — add a user entry via ldapadd
cat <<EOF | ldapadd -x -D "cn=admin,dc=aboutiam,dc=com" -W
dn: uid=jane,ou=people,dc=aboutiam,dc=com
objectClass: inetOrgPerson
uid: jane
cn: Jane Doe
sn: Doe
mail: jane@aboutiam.com
EOF`
  },
  {
    id: 'freeipa',
    name: 'FreeIPA',
    type: 'Directory Service',
    difficulty: 'Advanced',
    license: 'GPL-3.0',
    deployment: 'Self-hosted (RHEL/CentOS-based Domain Controller)',
    bestUse: 'Integrated Linux identity management combining LDAP, Kerberos KDC, DNS, and a CA — the open-source analogue to Active Directory for Unix estates.',
    protocols: { oidc: false, saml: false, scim: false, fido2: false, ldap: true },
    tags: ['kerberos kdc', 'linux identity', 'certificate authority', 'active directory alternative'],
    integrationSnippet: `# FreeIPA — enroll a client host into the domain
ipa-client-install \\
  --domain=aboutiam.com \\
  --server=ipa.aboutiam.com \\
  --realm=ABOUTIAM.COM \\
  --mkhomedir`
  }
]

export const EXPLORE_TYPES: ExploreProduct['type'][] = Array.from(
  new Set(EXPLORE_PRODUCTS.map((p) => p.type))
)
