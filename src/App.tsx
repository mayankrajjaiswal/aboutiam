import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useThemeStore } from './store/themeStore'

// Layout Elements
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import ScrollToTop from './components/Layout/ScrollToTop'

// Core Pages
import Home from './pages/Home'
import Learn from './pages/Learn'
import PlaygroundCatalog from './pages/PlaygroundCatalog'
import ToolsCatalog from './pages/ToolsCatalog'
import ArchitectureCenter from './pages/ArchitectureCenter'
import VendorCenter from './pages/VendorCenter'
import ResearchCenter from './pages/ResearchCenter'
import DesignPatternLibrary from './pages/DesignPatternLibrary'
import CertificationHub from './pages/CertificationHub'
import JwtDecoder from './pages/Tools/JwtDecoder'
import JwtGenerator from './pages/Tools/JwtGenerator'
import Base64EncoderDecoder from './pages/Tools/Base64EncoderDecoder'
import Sha256HashGenerator from './pages/Tools/Sha256HashGenerator'
import HmacGenerator from './pages/Tools/HmacGenerator'
import UuidGenerator from './pages/Tools/UuidGenerator'
import PasswordGenerator from './pages/Tools/PasswordGenerator'
import OauthPkceGenerator from './pages/Tools/OauthPkceGenerator'
import TotpGenerator from './pages/Tools/TotpGenerator'
import LdapFilterBuilder from './pages/Tools/LdapFilterBuilder'
import ScimPayloadValidator from './pages/Tools/ScimPayloadValidator'
import BasicAuthDecoder from './pages/Tools/BasicAuthDecoder'
import JwkPemConverter from './pages/Tools/JwkPemConverter'
import X509CertificateDecoder from './pages/Tools/X509CertificateDecoder'
import SamlDecoder from './pages/Tools/SamlDecoder'
import SdJwtDecoder from './pages/Tools/SdJwtDecoder'
import WebauthnDecoder from './pages/Tools/WebauthnDecoder'
import DidKeyGenerator from './pages/Tools/DidKeyGenerator'
import BcryptGenerator from './pages/Tools/BcryptGenerator'
import OauthRequestBuilder from './pages/Tools/OauthRequestBuilder'
import JwksInspector from './pages/Tools/JwksInspector'
import PolicyEvaluator from './pages/Tools/PolicyEvaluator'
import JWTStudio from './pages/Playgrounds/JWTStudio'
import OAuthVisualizer from './pages/Playgrounds/OAuthVisualizer'
import SAMLWorkbench from './pages/Playgrounds/SAMLWorkbench'
import FIDO2Lab from './pages/Playgrounds/FIDO2Lab'
import AccessControlLab from './pages/Playgrounds/AccessControlLab'
import LDAPTreeSimulator from './pages/Playgrounds/LDAPTreeSimulator'
import ZTAPlanner from './pages/Playgrounds/ZTAPlanner'
import SCIMLab from './pages/Playgrounds/SCIMLab'
import OAuthAttackLab from './pages/Playgrounds/OAuthAttackLab'
import KerberosLab from './pages/Playgrounds/KerberosLab'
import IdentityCTFArena from './pages/Playgrounds/IdentityCTFArena'
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
      <ScrollToTop />
      <div className="min-h-screen bg-bg-base text-text-primary flex transition-all">
        {/* Persistent Desktop Sidebar */}
        <Sidebar />

        {/* Sliding Responsive Mobile Sidebar Drawer */}
        <Sidebar isMobile={true} />

        {/* Core Main Panel */}
        <div className="flex-grow min-w-0 min-h-screen lg:pl-64 flex flex-col relative">
          {/* Top Fixed Floating Header */}
          <Header />

          {/* Main Main Scroll Container */}
          <main className="flex-grow pt-20 pb-12 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto transition-all">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/primer" element={<BeginnerPrimer />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/architecture" element={<ArchitectureCenter />} />
              <Route path="/vendor" element={<VendorCenter />} />
              <Route path="/research" element={<ResearchCenter />} />
              <Route path="/patterns" element={<DesignPatternLibrary />} />
              <Route path="/certifications" element={<CertificationHub />} />
              <Route path="/playground" element={<PlaygroundCatalog />} />
              <Route path="/tools" element={<ToolsCatalog />} />
              <Route path="/tools/jwt-decoder" element={<JwtDecoder />} />
              <Route path="/tools/jwt-generator" element={<JwtGenerator />} />
              <Route path="/tools/base64-encoder-decoder" element={<Base64EncoderDecoder />} />
              <Route path="/tools/sha256-hash-generator" element={<Sha256HashGenerator />} />
              <Route path="/tools/hmac-generator" element={<HmacGenerator />} />
              <Route path="/tools/uuid-generator" element={<UuidGenerator />} />
              <Route path="/tools/password-generator" element={<PasswordGenerator />} />
              <Route path="/tools/oauth-pkce-generator" element={<OauthPkceGenerator />} />
              <Route path="/tools/totp-generator" element={<TotpGenerator />} />
              <Route path="/tools/ldap-filter-builder" element={<LdapFilterBuilder />} />
              <Route path="/tools/scim-payload-validator" element={<ScimPayloadValidator />} />
              <Route path="/tools/basic-auth-decoder" element={<BasicAuthDecoder />} />
              <Route path="/tools/jwk-pem-converter" element={<JwkPemConverter />} />
              <Route path="/tools/x509-certificate-decoder" element={<X509CertificateDecoder />} />
              <Route path="/tools/saml-decoder" element={<SamlDecoder />} />
              <Route path="/tools/sd-jwt-decoder" element={<SdJwtDecoder />} />
              <Route path="/tools/webauthn-decoder" element={<WebauthnDecoder />} />
              <Route path="/tools/did-key-generator" element={<DidKeyGenerator />} />
              <Route path="/tools/bcrypt-generator" element={<BcryptGenerator />} />
              <Route path="/tools/oauth-builder" element={<OauthRequestBuilder />} />
              <Route path="/tools/jwks-inspector" element={<JwksInspector />} />
              <Route path="/tools/policy-evaluator" element={<PolicyEvaluator />} />
              <Route path="/playground/jwt" element={<JWTStudio />} />
              <Route path="/playground/oauth" element={<OAuthVisualizer />} />
              <Route path="/playground/saml" element={<SAMLWorkbench />} />
              <Route path="/playground/fido2" element={<FIDO2Lab />} />
              <Route path="/playground/access" element={<AccessControlLab />} />
              <Route path="/playground/ldap" element={<LDAPTreeSimulator />} />
              <Route path="/playground/zta" element={<ZTAPlanner />} />
              <Route path="/playground/scim" element={<SCIMLab />} />
              <Route path="/playground/oauth-attack" element={<OAuthAttackLab />} />
              <Route path="/playground/kerberos" element={<KerberosLab />} />
              <Route path="/playground/ctf" element={<IdentityCTFArena />} />
              
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
