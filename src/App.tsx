import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { RefreshCw } from 'lucide-react'
import { useThemeStore } from './store/themeStore'
import { usePreferenceStore } from './store/preferenceStore'
import { useLayoutStore } from './store/layoutStore'

// Layout Elements
import Sidebar from './components/Layout/Sidebar'
import Header from './components/Layout/Header'
import ScrollToTop from './components/Layout/ScrollToTop'
import BreadcrumbNav from './components/Layout/BreadcrumbNav'
import MobileBottomNav from './components/Layout/MobileBottomNav'

// Core Pages
const Home = lazy(() => import('./pages/Home'))
const Learn = lazy(() => import('./pages/Learn'))
const PlaygroundCatalog = lazy(() => import('./pages/PlaygroundCatalog'))
const ToolsCatalog = lazy(() => import('./pages/ToolsCatalog'))
const ArchitectureCenter = lazy(() => import('./pages/ArchitectureCenter'))
const KnowledgeGraph = lazy(() => import('./pages/KnowledgeGraph'))
const DailyPuzzle = lazy(() => import('./pages/DailyPuzzle'))
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
const Oauth21Auditor = lazy(() => import('./pages/Tools/Oauth21Auditor'))
const AnsibleVault = lazy(() => import('./pages/Tools/AnsibleVault'))
const SopsSimulator = lazy(() => import('./pages/Tools/SopsSimulator'))
const InterviewCareerCenter = lazy(() => import('./pages/InterviewCareerCenter'))
const KeyRingManager = lazy(() => import('./pages/Tools/KeyRingManager'))
const ConformanceChecker = lazy(() => import('./pages/Tools/ConformanceChecker'))
const Pbkdf2Generator = lazy(() => import('./pages/Tools/Pbkdf2Generator'))
const CertBundleSplitter = lazy(() => import('./pages/Tools/CertBundleSplitter'))
const DidDocumentValidator = lazy(() => import('./pages/Tools/DidDocumentValidator'))
const IdentitySbomAnalyzer = lazy(() => import('./pages/Tools/IdentitySbomAnalyzer'))
const IamTcoCalculator = lazy(() => import('./pages/Tools/IamTcoCalculator'))
const IamRfpGenerator = lazy(() => import('./pages/Tools/IamRfpGenerator'))
const IamSalaryCompass = lazy(() => import('./pages/Tools/IamSalaryCompass'))
const TabletopExerciseGenerator = lazy(() => import('./pages/Tools/TabletopExerciseGenerator'))
const RaciBuilder = lazy(() => import('./pages/Tools/RaciBuilder'))
const RiskRegisterBuilder = lazy(() => import('./pages/Tools/RiskRegisterBuilder'))
const CertificateVerifier = lazy(() => import('./pages/Tools/CertificateVerifier'))
const PqcReadinessAuditor = lazy(() => import('./pages/Tools/PqcReadinessAuditor'))
const CyberInsuranceReadiness = lazy(() => import('./pages/Tools/CyberInsuranceReadiness'))
const PrintablePoster = lazy(() => import('./pages/Tools/PrintablePoster'))
const OauthRiskAnalyzer = lazy(() => import('./pages/Tools/OauthRiskAnalyzer'))
const CspBuilder = lazy(() => import('./pages/Tools/CspBuilder'))
const X509ToJwksConverter = lazy(() => import('./pages/Tools/X509ToJwksConverter'))
const SamlMetadataAuditor = lazy(() => import('./pages/Tools/SamlMetadataAuditor'))
const DpopLab = lazy(() => import('./pages/Playgrounds/DpopLab'))
const LdapSchemaDesigner = lazy(() => import('./pages/Playgrounds/LdapSchemaDesigner'))
const HrAttributeMapper = lazy(() => import('./pages/Playgrounds/HrAttributeMapper'))
const IdentityFabricBuilder = lazy(() => import('./pages/Playgrounds/IdentityFabricBuilder'))
const LivenessInjectionLab = lazy(() => import('./pages/Playgrounds/LivenessInjectionLab'))
const OtIcsIdentityLab = lazy(() => import('./pages/Playgrounds/OtIcsIdentityLab'))
const TrustRegistryExplorer = lazy(() => import('./pages/Playgrounds/TrustRegistryExplorer'))
const CiemExplorer = lazy(() => import('./pages/Playgrounds/CiemExplorer'))
const LegacyFederationLab = lazy(() => import('./pages/Playgrounds/LegacyFederationLab'))
const SpatialIdentityLab = lazy(() => import('./pages/Playgrounds/SpatialIdentityLab'))
const IdentityBrokerSandbox = lazy(() => import('./pages/Playgrounds/IdentityBrokerSandbox'))
const JWTStudio = lazy(() => import('./pages/Playgrounds/JWTStudio'))
const OAuthVisualizer = lazy(() => import('./pages/Playgrounds/OAuthVisualizer'))
const SAMLWorkbench = lazy(() => import('./pages/Playgrounds/SAMLWorkbench'))
const FIDO2Lab = lazy(() => import('./pages/Playgrounds/FIDO2Lab'))
const Fido2ConditionalUi = lazy(() => import('./pages/Playgrounds/Fido2ConditionalUi'))
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
const GamingIdentityLab = lazy(() => import('./pages/Playgrounds/GamingIdentityLab'))
const StixTaxiiIocLab = lazy(() => import('./pages/Playgrounds/StixTaxiiIocLab'))
const DeviceTrust = lazy(() => import('./pages/Playgrounds/DeviceTrust'))
const OidcFederationLab = lazy(() => import('./pages/Playgrounds/OidcFederationLab'))
const PasskeyInternals = lazy(() => import('./pages/Playgrounds/PasskeyInternals'))
const CommunityForums = lazy(() => import('./pages/CommunityForums'))
const Assess = lazy(() => import('./pages/Assess'))
const CommandCenter = lazy(() => import('./pages/CommandCenter'))
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
const AgentIdentityLab = lazy(() => import('./pages/Playgrounds/AgentIdentityLab'))
const NhiSprawlLab = lazy(() => import('./pages/Playgrounds/NhiSprawlLab'))
const PasskeyRolloutStrategist = lazy(() => import('./pages/Playgrounds/PasskeyRolloutStrategist'))
const ModernizationBacklogGame = lazy(() => import('./pages/Playgrounds/ModernizationBacklogGame'))
const IncidentCommanderSim = lazy(() => import('./pages/Playgrounds/IncidentCommanderSim'))
const BuildYourIdp = lazy(() => import('./pages/Playgrounds/BuildYourIdp'))
const OpenId4VcWallet = lazy(() => import('./pages/Playgrounds/OpenId4VcWallet'))
const Fapi2Lab = lazy(() => import('./pages/Playgrounds/Fapi2Lab'))
const DeviceCodeFlowLab = lazy(() => import('./pages/Playgrounds/DeviceCodeFlowLab'))
const JitProvisioningLab = lazy(() => import('./pages/Playgrounds/JitProvisioningLab'))
const PhantomTokenLab = lazy(() => import('./pages/Playgrounds/PhantomTokenLab'))
const CaepEventStorm = lazy(() => import('./pages/Playgrounds/CaepEventStorm'))
const AttackPathGraph = lazy(() => import('./pages/Playgrounds/AttackPathGraph'))
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
const RoleMiningWorkbench = lazy(() => import('./pages/Playgrounds/RoleMiningWorkbench'))
const AccessRequestCart = lazy(() => import('./pages/Playgrounds/AccessRequestCart'))
const RiskEngine = lazy(() => import('./pages/Playgrounds/RiskEngine'))
const PamVaultingLab = lazy(() => import('./pages/Playgrounds/PamVaultingLab'))
const HybridAdSyncLab = lazy(() => import('./pages/Playgrounds/HybridAdSyncLab'))
const PqcHandshakeLab = lazy(() => import('./pages/Playgrounds/PqcHandshakeLab'))
const PasskeyPolicyLab = lazy(() => import('./pages/Playgrounds/PasskeyPolicyLab'))
const WorkloadIdentityFederation = lazy(() => import('./pages/Playgrounds/WorkloadIdentityFederation'))
const CloudPolicyEvaluator = lazy(() => import('./pages/Playgrounds/CloudPolicyEvaluator'))
const FederatedVpPlayground = lazy(() => import('./pages/Playgrounds/FederatedVpPlayground'))
const AutonomousAgentLab = lazy(() => import('./pages/Playgrounds/AutonomousAgentLab'))
const CaseStudyCenter = lazy(() => import('./pages/CaseStudyCenter'))
const IdentityDecisionMatrix = lazy(() => import('./pages/IdentityDecisionMatrix'))
const ThreatModelingStudio = lazy(() => import('./pages/ThreatModelingStudio'))
const DesignReviewAssistant = lazy(() => import('./pages/DesignReviewAssistant'))
const StandardsExplorer = lazy(() => import('./pages/StandardsExplorer'))
const EventsCalendar = lazy(() => import('./pages/EventsCalendar'))
const IamReports = lazy(() => import('./pages/IamReports'))

// Horizon 3 Next-Gen Modules
const RagAuthorization = lazy(() => import('./pages/Playgrounds/RagAuthorization'))
const AiSwarmOrchestrator = lazy(() => import('./pages/Playgrounds/AiSwarmOrchestrator'))
const FheAuthSandbox = lazy(() => import('./pages/Playgrounds/FheAuthSandbox'))
const QkdSimulator = lazy(() => import('./pages/Playgrounds/QkdSimulator'))
const MdlProximity = lazy(() => import('./pages/Playgrounds/MdlProximity'))
const SpaceIdentityDtn = lazy(() => import('./pages/Playgrounds/SpaceIdentityDtn'))
const V2xPki = lazy(() => import('./pages/Playgrounds/V2xPki'))
const EbpfIdentityTracer = lazy(() => import('./pages/Playgrounds/EbpfIdentityTracer'))
const DigitalTwinBinding = lazy(() => import('./pages/Playgrounds/DigitalTwinBinding'))
const BciAuthBaseline = lazy(() => import('./pages/Playgrounds/BciAuthBaseline'))
const C2paProvenance = lazy(() => import('./pages/Tools/C2paProvenance'))
const EuAiActAssessor = lazy(() => import('./pages/Tools/EuAiActAssessor'))
const LogAnonymizer = lazy(() => import('./pages/Tools/LogAnonymizer'))

// Advanced Horizon 3 Next-Gen Playgrounds
const OpaWasmPlayground = lazy(() => import('./pages/Playgrounds/OpaWasmPlayground'))
const McpServerPlayground = lazy(() => import('./pages/Playgrounds/McpServerPlayground'))
const WebrtcP2pPlayground = lazy(() => import('./pages/Playgrounds/WebrtcP2pPlayground'))
const WarRoomPlayground = lazy(() => import('./pages/Playgrounds/WarRoomPlayground'))
const BiometricMeshPlayground = lazy(() => import('./pages/Playgrounds/BiometricMeshPlayground'))

function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <RefreshCw className="w-8 h-8 text-accent-primary animate-spin" />
    </div>
  )
}

export default function App() {
  const { initializeTheme } = useThemeStore()
  const initializeAccessibilityPreferences = usePreferenceStore((s) => s.initializeAccessibilityPreferences)
  const isDesktopSidebarCollapsed = useLayoutStore((s) => s.isDesktopSidebarCollapsed)
  const isZenMode = useLayoutStore((s) => s.isZenMode)
  const toggleZenMode = useLayoutStore((s) => s.toggleZenMode)

  useEffect(() => {
    const cleanup = initializeTheme()
    return () => {
      if (typeof cleanup === 'function') cleanup()
    }
  }, [initializeTheme])

  useEffect(() => {
    initializeAccessibilityPreferences()
  }, [initializeAccessibilityPreferences])

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-bg-base text-text-primary flex transition-all">
        {/* Persistent Desktop Sidebar */}
        {!isZenMode && <Sidebar />}

        {/* Sliding Responsive Mobile Sidebar Drawer */}
        {!isZenMode && <Sidebar isMobile={true} />}

        {/* Core Main Panel */}
        <div className={`flex-grow min-w-0 min-h-screen flex flex-col relative transition-[padding] duration-300 ${isZenMode ? 'pl-0 lg:pl-0' : isDesktopSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
          {/* Top Fixed Floating Header */}
          {!isZenMode && <Header />}

          {/* Main Main Scroll Container */}
          <main className={`flex-grow pb-20 lg:pb-12 px-4 sm:px-6 lg:px-8 w-full mx-auto transition-all duration-500 ${isZenMode ? 'pt-4 max-w-[96vw]' : 'pt-20 max-w-7xl'}`}>
            {!isZenMode && <BreadcrumbNav />}
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/primer" element={<BeginnerPrimer />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/architecture" element={<ArchitectureCenter />} />
              <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
              <Route path="/daily-puzzle" element={<DailyPuzzle />} />
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
              <Route path="/tools/identity-sbom-analyzer" element={<IdentitySbomAnalyzer />} />
              <Route path="/tools/iam-tco-calculator" element={<IamTcoCalculator />} />
              <Route path="/tools/iam-rfp-generator" element={<IamRfpGenerator />} />
              <Route path="/tools/iam-salary-compass" element={<IamSalaryCompass />} />
              <Route path="/tools/tabletop-exercise-generator" element={<TabletopExerciseGenerator />} />
              <Route path="/tools/raci-builder" element={<RaciBuilder />} />
              <Route path="/tools/risk-register-builder" element={<RiskRegisterBuilder />} />
              <Route path="/tools/certificate-verifier" element={<CertificateVerifier />} />
              <Route path="/tools/pqc-readiness-auditor" element={<PqcReadinessAuditor />} />
              <Route path="/tools/cyber-insurance-readiness" element={<CyberInsuranceReadiness />} />
              <Route path="/tools/oauth-2-1-auditor" element={<Oauth21Auditor />} />
              <Route path="/playground/oidc-federation" element={<OidcFederationLab />} />
              <Route path="/tools/print-poster" element={<PrintablePoster />} />
              <Route path="/tools/oauth-risk-analyzer" element={<OauthRiskAnalyzer />} />
              <Route path="/tools/csp-builder" element={<CspBuilder />} />
              <Route path="/tools/x509-to-jwks-converter" element={<X509ToJwksConverter />} />
              <Route path="/tools/saml-metadata-auditor" element={<SamlMetadataAuditor />} />
              <Route path="/playground/device-code-flow" element={<DeviceCodeFlowLab />} />
              <Route path="/playground/dpop" element={<DpopLab />} />
              <Route path="/playground/jit-provisioning" element={<JitProvisioningLab />} />
              <Route path="/playground/phantom-token" element={<PhantomTokenLab />} />
              <Route path="/playground/agent-identity" element={<AgentIdentityLab />} />
              <Route path="/playground/nhi-sprawl" element={<NhiSprawlLab />} />
              <Route path="/playground/passkey-rollout-strategist" element={<PasskeyRolloutStrategist />} />
              <Route path="/playground/modernization-backlog" element={<ModernizationBacklogGame />} />
              <Route path="/playground/incident-commander" element={<IncidentCommanderSim />} />
              <Route path="/playground/build-your-idp" element={<BuildYourIdp />} />
              <Route path="/playground/openid4vc-wallet" element={<OpenId4VcWallet />} />
              <Route path="/playground/fapi2" element={<Fapi2Lab />} />
              <Route path="/playground/caep-event-storm" element={<CaepEventStorm />} />
              <Route path="/playground/attack-path-graph" element={<AttackPathGraph />} />
              <Route path="/playground/jwt" element={<JWTStudio />} />
              <Route path="/playground/oauth" element={<OAuthVisualizer />} />
              <Route path="/playground/saml" element={<SAMLWorkbench />} />
              <Route path="/playground/fido2" element={<FIDO2Lab />} />
              <Route path="/playground/fido2-conditional-ui" element={<Fido2ConditionalUi />} />
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
              <Route path="/playground/gaming-identity" element={<GamingIdentityLab />} />
              <Route path="/playground/stix-taxii-ioc" element={<StixTaxiiIocLab />} />
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
              <Route path="/playground/role-mining" element={<RoleMiningWorkbench />} />
              <Route path="/playground/access-request-cart" element={<AccessRequestCart />} />
              <Route path="/playground/risk-engine" element={<RiskEngine />} />
              <Route path="/playground/pam-vaulting" element={<PamVaultingLab />} />
              <Route path="/playground/hybrid-ad-sync" element={<HybridAdSyncLab />} />
              <Route path="/playground/ldap-schema-designer" element={<LdapSchemaDesigner />} />
              <Route path="/playground/hr-attribute-mapper" element={<HrAttributeMapper />} />
              <Route path="/playground/identity-fabric" element={<IdentityFabricBuilder />} />
              <Route path="/playground/liveness-injection" element={<LivenessInjectionLab />} />
              <Route path="/playground/ot-ics-identity" element={<OtIcsIdentityLab />} />
              <Route path="/playground/trust-registry" element={<TrustRegistryExplorer />} />
              <Route path="/playground/ciem-explorer" element={<CiemExplorer />} />
              <Route path="/playground/legacy-federation" element={<LegacyFederationLab />} />
              <Route path="/playground/spatial-identity-lab" element={<SpatialIdentityLab />} />
              <Route path="/playground/pqc-handshake" element={<PqcHandshakeLab />} />
              <Route path="/playground/passkey-policy" element={<PasskeyPolicyLab />} />
              <Route path="/playground/workload-identity" element={<WorkloadIdentityFederation />} />
              <Route path="/playground/cloud-policy-evaluator" element={<CloudPolicyEvaluator />} />
              <Route path="/playground/federated-vp" element={<FederatedVpPlayground />} />
              <Route path="/playground/autonomous-agent" element={<AutonomousAgentLab />} />
              <Route path="/playground/rag-authorization" element={<RagAuthorization />} />
              <Route path="/playground/ai-swarm" element={<AiSwarmOrchestrator />} />
              <Route path="/playground/fhe-auth" element={<FheAuthSandbox />} />
              <Route path="/playground/qkd-simulator" element={<QkdSimulator />} />
              <Route path="/playground/mdl-proximity" element={<MdlProximity />} />
              <Route path="/playground/space-identity" element={<SpaceIdentityDtn />} />
              <Route path="/playground/v2x-pki" element={<V2xPki />} />
              <Route path="/playground/ebpf-tracer" element={<EbpfIdentityTracer />} />
              <Route path="/playground/digital-twin" element={<DigitalTwinBinding />} />
              <Route path="/playground/bci-auth" element={<BciAuthBaseline />} />
              <Route path="/tools/c2pa-provenance" element={<C2paProvenance />} />
              <Route path="/tools/eu-ai-act-assessor" element={<EuAiActAssessor />} />
              <Route path="/tools/log-anonymizer" element={<LogAnonymizer />} />
              <Route path="/playground/opa-wasm" element={<OpaWasmPlayground />} />
              <Route path="/playground/mcp-server" element={<McpServerPlayground />} />
              <Route path="/playground/webrtc-p2p" element={<WebrtcP2pPlayground />} />
              <Route path="/playground/war-room" element={<WarRoomPlayground />} />
              <Route path="/playground/biometric-mesh" element={<BiometricMeshPlayground />} />

              <Route path="/assess" element={<Assess />} />
              <Route path="/command-center" element={<CommandCenter />} />
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

        {/* Fixed Mobile Bottom Tab Bar (below lg breakpoint only) */}
        {!isZenMode && <MobileBottomNav />}

        {/* Floating Exit Zen Mode Button */}
        {isZenMode && (
          <button
            onClick={toggleZenMode}
            className="fixed bottom-6 right-6 z-50 bg-bg-card hover:bg-bg-sidebar border border-border-subtle p-3.5 rounded-full shadow-2xl flex items-center gap-2 hover-cyber-glow transition-all animate-bounce"
            title="Exit Zen Presentation Mode"
          >
            <span className="text-xs font-black text-accent-primary uppercase tracking-wider flex items-center gap-1.5 px-1.5">
              🖥️ Exit Presentation Mode
            </span>
          </button>
        )}
      </div>
    </Router>
  )
}
