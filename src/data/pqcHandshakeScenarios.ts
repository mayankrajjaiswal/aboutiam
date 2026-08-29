export interface PqcHandshakeScenario {
  id: string
  name: string
  keyExchange: string
  signature: string
  keyExchangeSize: number // bytes
  signatureSize: number // bytes
  certSize: number // bytes
  vulnerable: boolean
  securityLevel: string
  description: string
  remediation: string
  steps: {
    name: string
    log: string
    desc: string
    packetSize: number // cumulative byte size
    wireHighlight: 'client' | 'server' | 'both'
  }[]
}

export const PQC_HANDSHAKE_SCENARIOS: PqcHandshakeScenario[] = [
  {
    id: 'classical',
    name: 'Classical (ECDHE + ECDSA)',
    keyExchange: 'X25519 (ECDH)',
    signature: 'ECDSA P-256',
    keyExchangeSize: 32, // bytes
    signatureSize: 64, // bytes
    certSize: 600, // bytes (typical small classical cert)
    vulnerable: true,
    securityLevel: '128-bit Classical (0-bit Quantum)',
    description: 'Standard modern elliptic-curve handshake. Highly efficient and widely supported, but completely vulnerable to Shor\'s algorithm on a cryptographically relevant quantum computer (CRQC).',
    remediation: 'Migrate to hybrid key exchanges (X25519 + ML-KEM-768) immediately to protect against "Harvest Now, Decrypt Later" adversaries.',
    steps: [
      {
        name: 'ClientHello',
        log: '[ClientHello] Sent client_key_share (32 bytes X25519 public key). Supporting TLS_AES_256_GCM_SHA384 cipher suite.',
        desc: 'The client initiates the handshake by offering X25519 key-agreement parameters and classical symmetric cipher preferences.',
        packetSize: 180,
        wireHighlight: 'client'
      },
      {
        name: 'ServerHello & Cert',
        log: '[ServerHello] Received server_key_share (32 bytes). Server certificate sent (600 bytes with 64-byte ECDSA signature).',
        desc: 'The server selects X25519, returns its classical public key, and sends its ECDSA-signed public key certificate.',
        packetSize: 850,
        wireHighlight: 'server'
      },
      {
        name: 'CertificateVerify',
        log: '[CertificateVerify] Verified server signature (64 bytes). Client computed shared DH secret (ECDHE).',
        desc: 'The client verifies the server\'s classical certificate signature, then computes the 256-bit symmetric master secret.',
        packetSize: 950,
        wireHighlight: 'both'
      },
      {
        name: 'Finished',
        log: '[Finished] TLS 1.3 session keys negotiated. Session established with AES-256-GCM symmetric encryption.',
        desc: 'Handshake completes. All subsequent traffic is encrypted using classical AES, which remains secure against Grover\'s algorithm.',
        packetSize: 1050,
        wireHighlight: 'both'
      }
    ]
  },
  {
    id: 'hybrid',
    name: 'Hybrid Transition (X25519 + ML-KEM-768)',
    keyExchange: 'X25519 + ML-KEM-768 (Dual-Key)',
    signature: 'ECDSA P-256 + ML-DSA-65 (Dual-Signed)',
    keyExchangeSize: 1216, // 32 (X25519) + 1184 (ML-KEM-768)
    signatureSize: 3357, // 64 (ECDSA) + 3293 (ML-DSA-65)
    certSize: 4200, // Large dual-signed certificate
    vulnerable: false,
    securityLevel: '128-bit Quantum + 128-bit Classical',
    description: 'The recommended transition path by NIST and IETF. Combines classical elliptic curves with lattice-based algorithms. Ensures that if either algorithm is broken, the connection remains secure.',
    remediation: 'This is the state-of-the-art secure standard for early-phase post-quantum migration across modern web browsers.',
    steps: [
      {
        name: 'ClientHello',
        log: '[ClientHello] Sent hybrid client_key_share (1,216 bytes: 32 bytes X25519 + 1,184 bytes ML-KEM-768 public key).',
        desc: 'The client sends a combined key share. The PQC key-agreement shares are concatenated within the standard key_shares extension.',
        packetSize: 1400,
        wireHighlight: 'client'
      },
      {
        name: 'ServerHello & Cert',
        log: '[ServerHello] Received hybrid server_key_share. Dual Server Certificate sent (4,200 bytes containing dual ECDSA + ML-DSA-65 public keys).',
        desc: 'The server accepts the hybrid agreement and responds with a dual-algorithm certificate supporting both old and new cryptographic trust chains.',
        packetSize: 5800,
        wireHighlight: 'server'
      },
      {
        name: 'CertificateVerify',
        log: '[CertificateVerify] Verified dual server signatures (3,357 bytes total). Computed combined master secret via dual-KDF concatenation.',
        desc: 'The client verifies both signatures. The shared secret is derived by running HMAC-KDF over the concatenated outputs of ECDH and ML-KEM decapsulation.',
        packetSize: 9300,
        wireHighlight: 'both'
      },
      {
        name: 'Finished',
        log: '[Finished] Hybrid TLS 1.3 session keys negotiated. Session established with quantum-resistant AES-256-GCM symmetric encryption.',
        desc: 'The session is fully secure against quantum decryption, while maintaining backwards-compatibility if the client only supports classical.',
        packetSize: 9400,
        wireHighlight: 'both'
      }
    ]
  },
  {
    id: 'pure_pqc',
    name: 'Pure Post-Quantum (ML-KEM + ML-DSA)',
    keyExchange: 'ML-KEM-768',
    signature: 'ML-DSA-65 (Lattice-Based)',
    keyExchangeSize: 1184, // ML-KEM-768 public key
    signatureSize: 3293, // ML-DSA-65 signature
    certSize: 3800, // Pure lattice public key certificate
    vulnerable: false,
    securityLevel: '128-bit Quantum-Secure (FIPS 203/204)',
    description: 'The ultimate target state. All classical asymmetric algorithms are completely removed. Minimizes overhead compared to the hybrid mode, but requires all network intermediaries to support large, fragmented TLS handshake packets.',
    remediation: 'Deploy this in private intranets and secure service meshes where full PQC protocol support is guaranteed across all proxies.',
    steps: [
      {
        name: 'ClientHello',
        log: '[ClientHello] Sent client_key_share (1,184 bytes ML-KEM-768 public key share). Classical cipher suites completely excluded.',
        desc: 'The client initiates a pure quantum-safe handshake. No legacy RSA or elliptic-curve elements are offered.',
        packetSize: 1350,
        wireHighlight: 'client'
      },
      {
        name: 'ServerHello & Cert',
        log: '[ServerHello] Received ML-KEM-768 server key share (1,088 bytes ciphertext). Pure PQC Certificate sent (3,800 bytes with ML-DSA-65 signature).',
        desc: 'The server encapsulates a secret key using the client\'s ML-KEM public share and returns the encapsulated ciphertext alongside its pure ML-DSA-65 certificate.',
        packetSize: 6400,
        wireHighlight: 'server'
      },
      {
        name: 'CertificateVerify',
        log: '[CertificateVerify] Verified server ML-DSA-65 certificate signature (3,293 bytes). Decapsulated ML-KEM ciphertext to compute symmetric secret.',
        desc: 'The client verifies the pure lattice signature. It decapsulates the server\'s ciphertext using its private ML-KEM key to arrive at the identical shared secret.',
        packetSize: 9800,
        wireHighlight: 'both'
      },
      {
        name: 'Finished',
        log: '[Finished] Pure PQC TLS 1.3 session established. Maximum security tier. Secure against future fault-tolerant quantum computer decryption.',
        desc: 'The handshake completes with 100% lattice-based cryptography. Ideal for post-quantum air-gapped workloads and secure communication networks.',
        packetSize: 9900,
        wireHighlight: 'both'
      }
    ]
  }
]
