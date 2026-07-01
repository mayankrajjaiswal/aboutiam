import { useEffect } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { useThemeStore } from './store/themeStore'

// Layout Elements
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'

// Core Pages
import Home from './pages/Home'
import Learn from './pages/Learn'
import PlaygroundCatalog from './pages/PlaygroundCatalog'
import JWTStudio from './pages/Playgrounds/JWTStudio'
import OAuthVisualizer from './pages/Playgrounds/OAuthVisualizer'
import SAMLWorkbench from './pages/Playgrounds/SAMLWorkbench'
import FIDO2Lab from './pages/Playgrounds/FIDO2Lab'
import AccessControlLab from './pages/Playgrounds/AccessControlLab'
import LDAPTreeSimulator from './pages/Playgrounds/LDAPTreeSimulator'
import ZTAPlanner from './pages/Playgrounds/ZTAPlanner'
import Assess from './pages/Assess'
import Explore from './pages/Explore'
import Assistant from './pages/Assistant'

// Advanced Ecosystem Modules
import Encyclopedia from './pages/Encyclopedia'
import WallOfShame from './pages/WallOfShame'
import CheatSheets from './pages/CheatSheets'
import BeginnerPrimer from './pages/BeginnerPrimer'
import Contributors from './pages/Contributors'
import Roadmap from './pages/Roadmap'

// Phase 7: Next-Gen Modules
import AIThreatLab from './pages/Playgrounds/AIThreatLab'
import ZKPWallet from './pages/Playgrounds/ZKPWallet'
import AmbientTrust from './pages/Playgrounds/AmbientTrust'
import WorkloadMesh from './pages/Playgrounds/WorkloadMesh'
import AuthMatchmaker from './pages/Playgrounds/AuthMatchmaker'

export default function App() {
  const { initializeTheme } = useThemeStore()

  useEffect(() => {
    const cleanup = initializeTheme()
    return () => {
      if (typeof cleanup === 'function') cleanup()
    }
  }, [initializeTheme])

  return (
    <Router>
      <div className="min-h-screen bg-bg-base text-text-primary flex transition-all">
        {/* Persistent Desktop Sidebar */}
        <Sidebar />

        {/* Sliding Responsive Mobile Sidebar Drawer */}
        <Sidebar isMobile={true} />

        {/* Core Main Panel */}
        <div className="flex-grow min-h-screen lg:pl-64 flex flex-col relative">
          {/* Top Fixed Floating Header */}
          <Header />

          {/* Main Main Scroll Container */}
          <main className="flex-grow pt-20 pb-12 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto transition-all">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/primer" element={<BeginnerPrimer />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/playground" element={<PlaygroundCatalog />} />
              <Route path="/playground/jwt" element={<JWTStudio />} />
              <Route path="/playground/oauth" element={<OAuthVisualizer />} />
              <Route path="/playground/saml" element={<SAMLWorkbench />} />
              <Route path="/playground/fido2" element={<FIDO2Lab />} />
              <Route path="/playground/access" element={<AccessControlLab />} />
              <Route path="/playground/ldap" element={<LDAPTreeSimulator />} />
              <Route path="/playground/zta" element={<ZTAPlanner />} />
              
              {/* Phase 7 Paths */}
              <Route path="/playground/ai-threat-lab" element={<AIThreatLab />} />
              <Route path="/playground/zkp-wallet" element={<ZKPWallet />} />
              <Route path="/playground/ambient-trust" element={<AmbientTrust />} />
              <Route path="/playground/workload-mesh" element={<WorkloadMesh />} />
              <Route path="/explore/matchmaker" element={<AuthMatchmaker />} />

              <Route path="/assess" element={<Assess />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/encyclopedia" element={<Encyclopedia />} />
              <Route path="/wall-of-shame" element={<WallOfShame />} />
              <Route path="/cheat-sheets" element={<CheatSheets />} />
              <Route path="/contributors" element={<Contributors />} />
              {/* Fallback Redirection */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}
