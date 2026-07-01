import { RefreshCw, Server, Globe, User, Play, ChevronRight } from 'lucide-react'

export default function OAuthVisualizer() {
  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <RefreshCw className="w-3.5 h-3.5" /> Flow Simulators
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          OAuth 2.0 & OIDC Flow Visualizer
        </h2>
        <p className="text-text-secondary">
          Step through complex client/server authentication handshakes, inspect raw parameters, and visualize structural network redirects.
        </p>
      </div>

      {/* Visual Workspace Stub */}
      <div className="grid lg:grid-cols-4 gap-8 pt-4">
        {/* Parameters Form Sidebar */}
        <div className="lg:col-span-1 p-6 rounded-xl bg-bg-card border border-border-subtle space-y-4 h-fit">
          <h4 className="font-bold text-text-primary flex items-center gap-2">Parameters Config</h4>
          <div className="space-y-3 text-sm">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-secondary uppercase">Grant Type</label>
              <select className="w-full p-2 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary">
                <option>Authorization Code (with PKCE)</option>
                <option>Implicit Flow</option>
                <option>Client Credentials</option>
                <option>Device Authorization</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-secondary uppercase">Client ID</label>
              <input type="text" className="w-full p-2 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-xs" defaultValue="aboutiam-client-889" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-text-secondary uppercase">Scopes</label>
              <input type="text" className="w-full p-2 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-xs" defaultValue="openid profile email" />
            </div>
          </div>
          <button className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-sm font-semibold transition-colors mt-2">
            Start Flow Simulation <Play className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>

        {/* Visual Map Workspace */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-8 rounded-xl bg-bg-card border border-border-subtle flex flex-col items-center justify-center min-h-[300px] border-dashed">
            {/* Visual Node Chain */}
            <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 w-full justify-around max-w-2xl relative">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/20">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-text-primary">User/Browser</span>
              </div>
              
              <div className="text-text-muted rotate-90 sm:rotate-0"><ChevronRight className="w-5 h-5" /></div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/20">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-text-primary">Client App</span>
              </div>

              <div className="text-text-muted rotate-90 sm:rotate-0"><ChevronRight className="w-5 h-5" /></div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/20">
                  <Server className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-text-primary">Authorization Server</span>
              </div>
            </div>

            <p className="text-xs text-text-muted mt-8 text-center">
              Configure parameters on the left and trigger flow to visualize step-by-step cryptographic redirects.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
