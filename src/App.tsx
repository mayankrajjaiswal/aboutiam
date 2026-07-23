import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { useThemeStore } from './store/themeStore'

// Layout Elements
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import ScrollToTop from './components/Layout/ScrollToTop'
import BreadcrumbNav from './components/Layout/BreadcrumbNav'

// Core Pages
const Home = lazy(() => import('./pages/Home'))
const Learn = lazy(() => import('./pages/Learn'))
const PlaygroundCatalog = lazy(() => import('./pages/PlaygroundCatalog'))
const ToolsCatalog = lazy(() => import('./pages/ToolsCatalog'))
const ArchitectureCenter = lazy(() => import('./pages/ArchitectureCenter'))
const VendorCenter = lazy(() => import('./pages/VendorCenter'))
const ResearchCenter = lazy(() => import('./pages/ResearchCenter'))
const DesignPatternLibrary = lazy(() => import('./pages/DesignPatternLibrary'))
const CertificationHub = lazy(() => import('./pages/CertificationHub'))
const SecurityBulletins = lazy(() => import('./pages/SecurityBulletins'))
const JwtDecoder = lazy(() => import('./pages/Tools/JwtDecoder'))
const JwtGenerator = lazy(() => import('./pages/Tools/JwtGenerator'))
const Base64EncoderDecoder = lazy(() => import('./pages/Tools/Base64EncoderDecoder'))
const Sha256HashGenerator = lazy(() => import('./pages/Tools/Sha256HashGenerator'))
const HmacGenerator = lazy(() => import('./pages/Tools/HmacGenerator'))
const UuidGenerator = lazy(() => import('./pages/Tools/UuidGenerator'))
const PasswordGenerator = lazy(() => import('./pages/Tools/PasswordGenerator'))
const OauthPkceGenerator = lazy(() => import('./pages/Tools/OauthPkceGenerator'))
const TotpGenerator = lazy(() => import('./pages/Tools/TotpGenerator'))
const LdapFilterBuilder = lazy(() => import('./pages/Tools/LdapFilterBuilder'))
const ScimPayloadValidator = lazy(() => import('./pages/Tools/ScimPayloadValidator'))
const BasicAuthDecoder = lazy(() => import('./pages/Tools/BasicAuthDecoder'))
const JwkPemConverter = lazy(() => import('./pages/Tools/JwkPemConverter'))
const X509CertificateDecoder = lazy(() => import('./pages/Tools/X509CertificateDecoder'))
const SamlDecoder = lazy(() => import('./pages/Tools/SamlDecoder'))
const SamlMetadataBuilder = lazy(() => import('./pages/Tools/SamlMetadataBuilder'))
const ScimDiffTool = lazy(() => import('./pages/Tools/ScimDiffTool'))
const CsrGenerator = lazy(() => import('./pages/Tools/CsrGenerator'))
const SdJwtDecoder = lazy(() => import('./pages/Tools/SdJwtDecoder'))
const WebauthnDecoder = lazy(() => import('./pages/Tools/WebauthnDecoder'))
const DidKeyGenerator = lazy(() => import('./pages/Tools/DidKeyGenerator'))
const BcryptGenerator = lazy(() => import('./pages/Tools/BcryptGenerator'))
const OauthRequestBuilder = lazy(() => import('./pages/Tools/OauthRequestBuilder'))
const JwksInspector = lazy(() => import('./pages/Tools/JwksInspector'))
const PolicyEvaluator = lazy(() => import('./pages/Tools/PolicyEvaluator'))
const PassphraseEntropy = lazy(() => import('./pages/Tools/PassphraseEntropy'))
const OidcDiscoveryAuditor = lazy(() => import('./pages/Tools/OidcDiscoveryAuditor'))
const AnsibleVault = lazy(() => import('./pages/Tools/AnsibleVault'))
const SopsSimulator = lazy(() => import('./pages/Tools/SopsSimulator'))
const InterviewCareerCenter = lazy(() => import('./pages/InterviewCareerCenter'))
const KeyRingManager = lazy(() => import('./pages/Tools/KeyRingManager'))
const ConformanceChecker = lazy(() => import('./pages/Tools/ConformanceChecker'))
const Pbkdf2Generator = lazy(() => import('./pages/Tools/Pbkdf2Generator'))
const CertBundleSplitter = lazy(() => import('./pages/Tools/CertBundleSplitter'))
const DidDocumentValidator = lazy(() => import('./pages/Tools/DidDocumentValidator'))
const IdentityBrokerSandbox = lazy(() => import('./pages/Playgrounds/IdentityBrokerSandbox'))
const JWTStudio = lazy(() => import('./pages/Playgrounds/JWTStudio'))
const OAuthVisualizer = lazy(() => import('./pages/Playgrounds/OAuthVisualizer'))
const SAMLWorkbench = lazy(() => import('./pages/Playgrounds/SAMLWorkbench'))
const FIDO2Lab = lazy(() => import('./pages/Playgrounds/FIDO2Lab'))
const AccessControlLab = lazy(() => import('./pages/Playgrounds/AccessControlLab'))
const LDAPTreeSimulator = lazy(() => import('./pages/Playgrounds/LDAPTreeSimulator'))
const ZTAPlanner = lazy(() => import('./pages/Playgrounds/ZTAPlanner'))
const SCIMLab = lazy(() => import('./pages/Playgrounds/SCIMLab'))
const OAuthAttackLab = lazy(() => import('./pages/Playgrounds/OAuthAttackLab'))
const KerberosLab = lazy(() => import('./pages/Playgrounds/KerberosLab'))
const IdentityCTFArena = lazy(() => import('./pages/Playgrounds/IdentityCTFArena'))
const IdentityArchitect = lazy(() => import('./pages/Playgrounds/IdentityArchitect'))
const JwtCracker = lazy(() => import('./pages/Playgrounds/JwtCracker'))
const CertChainValidator = lazy(() => import('./pages/Playgrounds/CertChainValidator'))
const GpoSimulator = lazy(() => import('./pages/Playgrounds/GpoSimulator'))
const ReferenceBuilder = lazy(() => import('./pages/Playgrounds/ReferenceBuilder'))
const SessionHijackingLab = lazy(() => import('./pages/Playgrounds/SessionHijackingLab'))
const ConditionalAccess = lazy(() => import('./pages/Playgrounds/ConditionalAccess'))
const OpaPlayground = lazy(() => import('./pages/Playgrounds/OpaPlayground'))
const TokenExchange = lazy(() => import('./pages/Playgrounds/TokenExchange'))
const ItdrLab = lazy(() => import('./pages/Playgrounds/ItdrLab'))
const DeviceTrust = lazy(() => import('./pages/Playgrounds/DeviceTrust'))
const PasskeyInternals = lazy(() => import('./pages/Playgrounds/PasskeyInternals'))
const CommunityForums = lazy(() => import('./pages/CommunityForums'))
const Assess = lazy(() => import('./pages/Assess'))
const Explore = lazy(() => import('./pages/Explore'))
const Assistant = lazy(() => import('./pages/Assistant'))
const ScenarioBuilder = lazy(() => import('./pages/ScenarioBuilder'))
const IdentityLabs = lazy(() => import('./pages/IdentityLabs'))
const ReferenceImplementations = lazy(() => import('./pages/ReferenceImplementations'))

// Advanced Ecosystem Modules
const Encyclopedia = lazy(() => import('./pages/Encyclopedia'))
const IdentityTimeline = lazy(() => import('./pages/IdentityTimeline'))
const CommunityHub = lazy(() => import('./pages/CommunityHub'))
const WallOfShame = lazy(() => import('./pages/WallOfShame'))
const CheatSheets = lazy(() => import('./pages/CheatSheets'))
const BeginnerPrimer = lazy(() => import('./pages/BeginnerPrimer'))
const Contributors = lazy(() => import('./pages/Contributors'))
const Terms = lazy(() => import('./pages/Terms'))
const Roadmap = lazy(() => import('./pages/Roadmap'))

// Phase 7: Next-Gen Modules
const AIThreatLab = lazy(() => import('./pages/Playgrounds/AIThreatLab'))
const ZKPWallet = lazy(() => import('./pages/Playgrounds/ZKPWallet'))
const AmbientTrust = lazy(() => import('./pages/Playgrounds/AmbientTrust'))
const WorkloadMesh = lazy(() => import('./pages/Playgrounds/WorkloadMesh'))
const AuthMatchmaker = lazy(() => import('./pages/Playgrounds/AuthMatchmaker'))

// Content Gaps & Enhancements: Standards & Compliance Coverage
const XacmlPolicyEngine = lazy(() => import('./pages/Playgrounds/XacmlPolicyEngine'))
const GnapVisualizer = lazy(() => import('./pages/Playgrounds/GnapVisualizer'))
const CaepLab = lazy(() => import('./pages/Playgrounds/CaepLab'))
const VcDidLab = lazy(() => import('./pages/Playgrounds/VcDidLab'))

// IAM Curriculum Expansion: Beginner-to-Advanced Playground Coverage
const MagicLinkStepUp = lazy(() => import('./pages/Playgrounds/MagicLinkStepUp'))
const CredentialStuffingLab = lazy(() => import('./pages/Playgrounds/CredentialStuffingLab'))
const CiamConsentSandbox = lazy(() => import('./pages/Playgrounds/CiamConsentSandbox'))
const AccessCertificationLab = lazy(() => import('./pages/Playgrounds/AccessCertificationLab'))
const RiskEngine = lazy(() => import('./pages/Playgrounds/RiskEngine'))
const PamVaultingLab = lazy(() => import('./pages/Playgrounds/PamVaultingLab'))
const HybridAdSyncLab = lazy(() => import('./pages/Playgrounds/HybridAdSyncLab'))
const CaseStudyCenter = lazy(() => import('./pages/CaseStudyCenter'))
const IdentityDecisionMatrix = lazy(() => import('./pages/IdentityDecisionMatrix'))
const ThreatModelingStudio = lazy(() => import('./pages/ThreatModelingStudio'))
const DesignReviewAssistant = lazy(() => import('./pages/DesignReviewAssistant'))
const StandardsExplorer = lazy(() => import('./pages/StandardsExplorer'))
const EventsCalendar = lazy(() => import('./pages/EventsCalendar'))
const IamReports = lazy(() => import('./pages/IamReports'))

function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <RefreshCw className="w-8 h-8 text-accent-primary animate-spin" />
    </div>
  )
}

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
            <BreadcrumbNav />
            <Suspense fallback={<PageLoadingFallback />}>
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
              <Route path="/bulletins" element={<SecurityBulletins />} />
              <Route path="/career-center" element={<InterviewCareerCenter />} />
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
              <Route path="/tools/saml-metadata-builder" element={<SamlMetadataBuilder />} />
              <Route path="/tools/scim-diff" element={<ScimDiffTool />} />
              <Route path="/tools/csr-generator" element={<CsrGenerator />} />
              <Route path="/tools/sd-jwt-decoder" element={<SdJwtDecoder />} />
              <Route path="/tools/webauthn-decoder" element={<WebauthnDecoder />} />
              <Route path="/tools/did-key-generator" element={<DidKeyGenerator />} />
              <Route path="/tools/bcrypt-generator" element={<BcryptGenerator />} />
              <Route path="/tools/oauth-builder" element={<OauthRequestBuilder />} />
              <Route path="/tools/jwks-inspector" element={<JwksInspector />} />
              <Route path="/tools/policy-evaluator" element={<PolicyEvaluator />} />
              <Route path="/tools/passphrase-entropy" element={<PassphraseEntropy />} />
              <Route path="/tools/oidc-discovery" element={<OidcDiscoveryAuditor />} />
              <Route path="/tools/ansible-vault" element={<AnsibleVault />} />
              <Route path="/tools/sops-simulator" element={<SopsSimulator />} />
              <Route path="/tools/key-ring" element={<KeyRingManager />} />
              <Route path="/tools/conformance-checker" element={<ConformanceChecker />} />
              <Route path="/tools/pbkdf2-generator" element={<Pbkdf2Generator />} />
              <Route path="/tools/cert-bundle-splitter" element={<CertBundleSplitter />} />
              <Route path="/tools/did-document-validator" element={<DidDocumentValidator />} />
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
              <Route path="/playground/identity-architect" element={<IdentityArchitect />} />
              <Route path="/playground/jwt-cracker" element={<JwtCracker />} />
              <Route path="/playground/cert-chain" element={<CertChainValidator />} />
              <Route path="/playground/gpo-simulator" element={<GpoSimulator />} />
              <Route path="/playground/reference-builder" element={<ReferenceBuilder />} />
              <Route path="/playground/session-hijacking" element={<SessionHijackingLab />} />
              <Route path="/playground/conditional-access" element={<ConditionalAccess />} />
              <Route path="/playground/opa" element={<OpaPlayground />} />
              <Route path="/playground/token-exchange" element={<TokenExchange />} />
              <Route path="/playground/itdr" element={<ItdrLab />} />
              <Route path="/playground/device-trust" element={<DeviceTrust />} />
              <Route path="/playground/passkey-internals" element={<PasskeyInternals />} />
              <Route path="/playground/ai-threat-lab" element={<AIThreatLab />} />
              <Route path="/playground/zkp-wallet" element={<ZKPWallet />} />
              <Route path="/playground/ambient-trust" element={<AmbientTrust />} />
              <Route path="/playground/workload-mesh" element={<WorkloadMesh />} />
              <Route path="/explore/matchmaker" element={<AuthMatchmaker />} />
              <Route path="/playground/xacml" element={<XacmlPolicyEngine />} />
              <Route path="/playground/gnap" element={<GnapVisualizer />} />
              <Route path="/playground/caep" element={<CaepLab />} />
              <Route path="/playground/vc-did" element={<VcDidLab />} />
              <Route path="/playground/identity-broker" element={<IdentityBrokerSandbox />} />
              <Route path="/playground/magic-link-stepup" element={<MagicLinkStepUp />} />
              <Route path="/playground/credential-stuffing" element={<CredentialStuffingLab />} />
              <Route path="/playground/ciam-consent" element={<CiamConsentSandbox />} />
              <Route path="/playground/access-certification" element={<AccessCertificationLab />} />
              <Route path="/playground/risk-engine" element={<RiskEngine />} />
              <Route path="/playground/pam-vaulting" element={<PamVaultingLab />} />
              <Route path="/playground/hybrid-ad-sync" element={<HybridAdSyncLab />} />

              <Route path="/assess" element={<Assess />} />
              <Route path="/scenario-builder" element={<ScenarioBuilder />} />
              <Route path="/labs" element={<IdentityLabs />} />
              <Route path="/references" element={<ReferenceImplementations />} />
              <Route path="/case-studies" element={<CaseStudyCenter />} />
              <Route path="/decision-matrix" element={<IdentityDecisionMatrix />} />
              <Route path="/threat-modeling" element={<ThreatModelingStudio />} />
              <Route path="/design-review" element={<DesignReviewAssistant />} />
              <Route path="/standards" element={<StandardsExplorer />} />
              <Route path="/events" element={<EventsCalendar />} />
              <Route path="/reports" element={<IamReports />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/encyclopedia" element={<Encyclopedia />} />
              <Route path="/timeline" element={<IdentityTimeline />} />
              <Route path="/community" element={<CommunityHub />} />
              <Route path="/community-forums" element={<CommunityForums />} />
              <Route path="/wall-of-shame" element={<WallOfShame />} />
              <Route path="/cheat-sheets" element={<CheatSheets />} />
              <Route path="/contributors" element={<Contributors />} />
              <Route path="/terms" element={<Terms />} />
              {/* Fallback Redirection */}
              <Route path="*" element={<Home />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </Router>
  )
}
