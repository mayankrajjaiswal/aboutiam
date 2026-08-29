export interface AgentBattleStep {
  name: string
  redAction: string
  blueReaction: string
  result: 'SUCCESS' | 'BLOCKED'
  log: string
}

export interface AgentBattleScenario {
  id: string
  name: string
  attackVector: string
  defaultDefense: string
  hardenedDefense: string
  description: string
  steps: AgentBattleStep[]
}

export const AGENT_BATTLE_SCENARIOS: AgentBattleScenario[] = [
  {
    id: 'token_hijacking',
    name: 'Session Hijacking & Token Replay Battle',
    attackVector: 'Infostealer extracts active session tokens and replays them from an external host.',
    defaultDefense: 'Standard static token validation.',
    hardenedDefense: 'Enforce Sender-Constrained Tokens (DPoP / IP Binding)',
    description: 'A mock Red Team AI attempts to steal and replay user tokens. Watch the Blue Team AI detect, adapt, and deploy DPoP/IP-binding constraints to neutralize the threat.',
    steps: [
      {
        name: 'Phase 1: Token Acquisition',
        redAction: 'Red Team AI deploys a simulated infostealer malware on client workspace, successfully extracting raw Access Token: "eyJhbGci..."',
        blueReaction: 'Blue Team AI monitors login signals. Standard login state is healthy.',
        result: 'SUCCESS',
        log: '✓ Red Team AI successfully extracted active bearer session token.'
      },
      {
        name: 'Phase 2: Token Replay Attempt',
        redAction: 'Red Team AI replays the stolen bearer token from a malicious IP address (198.51.100.42) to trigger an API transaction.',
        blueReaction: 'Blue Team AI logs the request. Standard bearer token has no host-binding constraints.',
        result: 'SUCCESS',
        log: '⚠️ [COMPROMISE] Replayed bearer token successfully authorized! Stolen session hijacked by adversary.'
      },
      {
        name: 'Phase 3: Autonomous Defense Adaptation',
        redAction: 'Red Team AI attempts secondary transaction to exfiltrate financial spreadsheets.',
        blueReaction: 'Blue Team AI registers an anomalous IP jump (ITDR alert). Instantly triggers step-up defense: enforcers deploy DPoP (Demonstrating Proof-of-Possession).',
        result: 'BLOCKED',
        log: '✓ Blue Team AI dynamically activated DPoP. Server now requires client-side signed proof-of-possession headers binding tokens to the local keypair.'
      },
      {
        name: 'Phase 4: Attack Defeated',
        redAction: 'Red Team AI attempts to replay token again without the matching private key signature proof.',
        blueReaction: 'Blue Team AI validates incoming request, detects missing DPoP proof, and rejects the token exchange (HTTP 401 Unauthorized).',
        result: 'BLOCKED',
        log: '🎉 Attack completely neutralized. Stolen bearer token is useless without on-device private key enclaves.'
      }
    ]
  },
  {
    id: 'redirect_hijack',
    name: 'OAuth Redirect URI Hijacking Battle',
    attackVector: 'Red Team AI exploits a misconfigured wildcard redirect_uri (e.g., https://*.example.com) to steal auth codes.',
    defaultDefense: 'Wildcard redirect URI allowing any sub-domain.',
    hardenedDefense: 'Strict redirect URI matching (exact path mapping)',
    description: 'Red Team AI crafts a phishing authorization request pointing to a malicious sub-domain. Blue Team AI audits, refines, and restricts redirect URI boundaries to block code leaks.',
    steps: [
      {
        name: 'Phase 1: Malicious Link Formulation',
        redAction: 'Red Team AI crafts an OAuth Authorization URL with: "redirect_uri=https://evil.example.com/callback".',
        blueReaction: 'Blue Team AI matches wildcard rule "*.example.com" and approves the login challenge.',
        result: 'SUCCESS',
        log: '✓ Red Team AI successfully triggered OAuth login with wildcard redirect.'
      },
      {
        name: 'Phase 2: Authorization Code Leak',
        redAction: 'OAuth server issues an authorization code, redirecting the browser to "https://evil.example.com/callback?code=code_abc".',
        blueReaction: 'Wildcard rules satisfied. Standard server completes redirection.',
        result: 'SUCCESS',
        log: '⚠️ [COMPROMISE] Authorization code leaked to malicious sub-domain callback endpoint.'
      },
      {
        name: 'Phase 3: Dynamic Policy Hardening',
        redAction: 'Red Team AI attempts to exchange leaked code at the token endpoint.',
        blueReaction: 'Blue Team AI detects suspicious referral traffic. Dynamically rewrites Relying Party configuration to enforce strict, exact-path redirect_uri checks.',
        result: 'BLOCKED',
        log: '✓ Blue Team AI locked down redirect policies. Exact matching now active.'
      },
      {
        name: 'Phase 4: Transaction Aborted',
        redAction: 'Red Team AI attempts a second exploit link pointing to "https://evil.example.com/callback".',
        blueReaction: 'Relying Party detects mismatch with registered redirect list and instantly blocks the authorization transaction.',
        result: 'BLOCKED',
        log: '🎉 Attack neutralized. Wildcard redirects successfully banned from OAuth configurations.'
      }
    ]
  }
]
