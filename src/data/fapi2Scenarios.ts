export type Fapi2ControlKey = 'par' | 'senderConstrainedToken' | 'signedResponse'

export interface Fapi2Scenario {
  id: string
  title: string
  controlName: string
  controlKey: Fapi2ControlKey
  attackDescription: string
  attackSuccessLog: string
  attackBlockedLog: string
}

export const FAPI2_SCENARIOS: Fapi2Scenario[] = [
  {
    id: 'par_url_tampering',
    title: 'Authorization Parameter Tampering',
    controlName: 'Pushed Authorization Requests (PAR)',
    controlKey: 'par',
    attackDescription: 'Attacker intercepts the browser redirect URL and rewrites the "scope" or "redirect_uri" query parameter before it reaches the authorization server.',
    attackSuccessLog: '🚨 Attack succeeded: authorization parameters traveled directly in the browser-visible redirect URL — the server had no way to distinguish the original request from the tampered one.',
    attackBlockedLog: '🛡️ Attack blocked: parameters were pushed server-to-server via PAR and exchanged for an opaque, short-lived request_uri — nothing tamperable ever appeared in the browser URL.'
  },
  {
    id: 'stolen_token_replay',
    title: 'Stolen Bearer Token Replay',
    controlName: 'Sender-Constrained Tokens (mTLS / DPoP)',
    controlKey: 'senderConstrainedToken',
    attackDescription: 'Attacker exfiltrates an access token from browser storage or a proxy log and replays it from their own machine.',
    attackSuccessLog: '🚨 Attack succeeded: the token was a plain bearer token — any holder can use it from anywhere, so the stolen token worked perfectly for the attacker.',
    attackBlockedLog: "🛡️ Attack blocked: the token was bound to the legitimate client's mTLS certificate / DPoP key — the resource server rejected the replay because the attacker doesn't hold the private key."
  },
  {
    id: 'unsigned_response_mitm',
    title: 'Man-in-the-Middle Response Tampering',
    controlName: 'Signed Authorization Responses (JARM/JAR)',
    controlKey: 'signedResponse',
    attackDescription: 'A network-level MITM intercepts the authorization response and swaps the returned "state" or "code" value before it reaches the client.',
    attackSuccessLog: "🚨 Attack succeeded: the response was protected only by TLS in transit — once intercepted, nothing prevented the values themselves from being altered undetected.",
    attackBlockedLog: "🛡️ Attack blocked: the authorization response was itself signed (JARM) — the client independently verifies the signature and rejects any response whose signature doesn't match the altered content."
  }
]
