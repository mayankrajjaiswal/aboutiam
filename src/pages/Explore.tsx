import { Compass, Search, Filter } from 'lucide-react'

export default function Explore() {
  const vendors = [
    { name: "Keycloak", type: "Open Source", protocols: "OIDC, SAML 2.0, User Federation" },
    { name: "Authentik", type: "Open Source", protocols: "OIDC, SAML, LDAP, Outposts" },
    { name: "Okta / Auth0", type: "SaaS / Enterprise", protocols: "OIDC, SAML, FIDO2, SCIM" },
    { name: "Microsoft Entra ID", type: "SaaS / Workforce", protocols: "OIDC, SAML, LDAP, WS-Fed" },
    { name: "Teleport", type: "PAM / Access", protocols: "SSH, RDP, Database, OIDC" },
    { name: "HashiCorp Vault", type: "Secrets / Engine", protocols: "OIDC, AppRole, SSH, PKI" }
  ]

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Compass className="w-3.5 h-3.5" /> Directory Catalog
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          IAM Landscape Directory
        </h2>
        <p className="text-text-secondary">
          Review, filter, and compare top-tier open-source, enterprise SaaS, IGA, and PAM platforms. Evaluate licensing, protocol support, and deployment schemas.
        </p>
      </div>

      {/* Control Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <input type="text" className="w-full p-2.5 pl-10 rounded-lg bg-bg-card border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent-primary" placeholder="Search products (e.g. Keycloak)..." />
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-3.5" />
        </div>
        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-border-subtle bg-bg-card text-text-primary text-sm font-semibold hover:bg-bg-sidebar transition-colors">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Vendors Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {vendors.map((vendor, i) => (
          <div key={i} className="p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/20 hover:shadow-md transition-all space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-accent-glow text-accent-primary border border-accent-primary/10">
                {vendor.type}
              </span>
            </div>
            <h4 className="text-lg font-bold text-text-primary">{vendor.name}</h4>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-text-muted uppercase">Protocol Coverage:</span>
              <p className="text-xs text-text-secondary font-mono">{vendor.protocols}</p>
            </div>
            <button className="w-full text-xs font-bold text-accent-primary hover:text-accent-hover text-center pt-2">
              View Product Blueprint →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
