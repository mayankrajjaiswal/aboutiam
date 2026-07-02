// Single source of truth for the /tools section. ToolsCatalog.tsx renders entirely
// from this array (see GEMINI.md §4A extension model). routeMeta.ts imports title/
// description from here too. scripts/postbuild-ssg.mjs keeps its own plain-JS copy
// per the documented convention (it deliberately never imports a .ts file) — update
// both when a tool ships. See FIXED_TODO.md §4.1.
import type { LucideIcon } from 'lucide-react'
import {
  ScanSearch, FileSignature, Binary, Hash, ShieldCheck, Shuffle, Lock, Link,
  Timer, ListTree, Users, KeySquare, LockKeyhole, FileKey, FileCheck, FileCode,
  Layers, Fingerprint, Wallet,
} from 'lucide-react'

export type ToolCategory =
  | 'Tokens & Assertions'
  | 'PKI & Certificates'
  | 'Hashing, Encoding & Secrets'
  | 'Auth & Directory Builders'
  | 'Emerging & Decentralized Identity'

export interface ToolFaq {
  q: string
  a: string
}

export interface ToolMeta {
  slug: string
  title: string
  description: string
  category: ToolCategory
  icon: LucideIcon
  phase: 1 | 2 | 3
  status: 'live' | 'planned'
  keywords: string[]
  analogy: string
  expert: string
  faqs: ToolFaq[]
  relatedLinks?: { label: string; href: string }[]
}

export const TOOLS: ToolMeta[] = [
  {
    slug: 'jwt-decoder',
    title: 'JWT Decoder — Inspect & Verify Tokens Online',
    description: 'Paste any JSON Web Token to instantly decode its header, payload, and signature, check expiry, and flag insecure algorithms — 100% client-side, nothing is uploaded.',
    category: 'Tokens & Assertions',
    icon: ScanSearch,
    phase: 1,
    status: 'live',
    keywords: ['jwt decoder', 'decode jwt online', 'jwt parser', 'jwt viewer'],
    analogy: 'A JWT is a wax-sealed envelope — anyone can read what\'s written inside without breaking the seal, but only someone holding the matching stamp could have sealed it originally. Breaking it open and re-sealing it with a different stamp is exactly what this decoder helps you catch.',
    expert: 'RFC 7519. A JWT is three base64url segments (header.payload.signature). Decoding parses the header/payload as JSON and exposes the raw signature bytes — it does not verify the signature. Verification requires re-computing the signature with the correct key and comparing.',
    faqs: [
      { q: 'Is decoding a JWT the same as verifying it?', a: 'No. Decoding just reads the base64url-encoded JSON — anyone can do it without a key. Verifying proves the token wasn\'t tampered with, and requires the correct secret or public key.' },
      { q: 'Is my token uploaded anywhere?', a: 'No. Everything happens in your browser tab using JavaScript — open your Network tab and confirm no request fires while you decode.' },
      { q: 'Why does this tool warn about alg: none?', a: 'Some vulnerable server-side libraries historically accepted tokens with alg set to "none" and skipped signature checks entirely, letting an attacker forge any claim.' },
    ],
    relatedLinks: [{ label: 'Try the full JWT Studio & Exploit Arena →', href: '/playground/jwt' }],
  },
  {
    slug: 'jwt-generator',
    title: 'JWT Generator — Build & Sign Tokens (HS256/RS256)',
    description: 'Create and cryptographically sign JSON Web Tokens with custom claims using HS256, HS384, HS512, or RS256 — computed locally with the Web Crypto API.',
    category: 'Tokens & Assertions',
    icon: FileSignature,
    phase: 1,
    status: 'live',
    keywords: ['jwt generator', 'create jwt online', 'sign jwt', 'jwt encoder'],
    analogy: 'Signing a token is like signing a check rather than writing on a postcard: the claims are still readable by anyone, but your signature proves the check came from you and wasn\'t altered after you signed it.',
    expert: 'RFC 7515 (JWS). Signing base64url(header) + "." + base64url(payload) with HMAC (symmetric) or RSA/ECDSA (asymmetric) produces the third segment. This tool runs the signing operation via crypto.subtle entirely in-browser.',
    faqs: [
      { q: 'Can I use a token generated here in production?', a: 'Only for local testing. A token signed with a key generated in your browser isn\'t trusted by any real server unless that server was configured with the exact same key.' },
      { q: 'Does this tool send my secret key anywhere?', a: 'No — the signing key never leaves your browser tab; it is used only in a local crypto.subtle.sign() call.' },
    ],
    relatedLinks: [{ label: 'Decode an existing token →', href: '/tools/jwt-decoder' }, { label: 'Try the full JWT Studio →', href: '/playground/jwt' }],
  },
  {
    slug: 'base64-encoder-decoder',
    title: 'Base64 & Base64URL Encoder / Decoder',
    description: 'Encode or decode text, JSON, and files to Base64 or URL-safe Base64 (used by JWTs) instantly in your browser — no data ever leaves your device.',
    category: 'Hashing, Encoding & Secrets',
    icon: Binary,
    phase: 1,
    status: 'live',
    keywords: ['base64 encode', 'base64 decode online', 'base64url', 'base64 to text'],
    analogy: 'Base64 translates text into a universal alphabet of only 64 characters so it can safely travel through systems that don\'t understand raw binary or special symbols — like writing a phone number using only digits 0-9 instead of letters.',
    expert: 'RFC 4648. Base64 maps every 3 bytes of input to 4 printable characters from a 64-character alphabet. The URL-safe variant (Base64URL) replaces "+" and "/" with "-" and "_" and drops padding, which is exactly what JWT segments use.',
    faqs: [
      { q: 'What\'s the difference between Base64 and Base64URL?', a: 'Base64URL swaps two characters ("+"/"/") for URL-safe ones ("-"/"_") and omits "=" padding, so the result can be placed directly in a URL or a JWT without escaping.' },
      { q: 'Is Base64 encryption?', a: 'No. Base64 is a reversible encoding, not encryption — anyone can decode it instantly with no key. Never use it to "hide" secrets.' },
    ],
    relatedLinks: [{ label: 'Decode a JWT (uses Base64URL) →', href: '/tools/jwt-decoder' }],
  },
  {
    slug: 'sha256-hash-generator',
    title: 'SHA-256 & Hash Generator — Text and File Checksums',
    description: 'Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes for text or files directly in your browser using the Web Crypto API — no uploads, ever.',
    category: 'Hashing, Encoding & Secrets',
    icon: Hash,
    phase: 1,
    status: 'live',
    keywords: ['sha256 online', 'hash generator', 'file checksum', 'sha512 generator'],
    analogy: 'A hash is a tamper-evident fingerprint: the exact same input always produces the exact same fingerprint, and changing even one character produces a completely different one — so you can prove a file wasn\'t modified without comparing it byte-by-byte.',
    expert: 'FIPS 180-4. A cryptographic hash function is deterministic, one-way, and exhibits the avalanche effect. SHA-1 is included only for legacy checksum compatibility — it is not collision-resistant enough for security purposes.',
    faqs: [
      { q: 'Is SHA-1 safe to use?', a: 'Not for security purposes — SHA-1 has known collision attacks. It\'s kept here only so you can verify checksums against older systems that still publish SHA-1 sums.' },
      { q: 'Can I hash a whole file, not just text?', a: 'Yes — drop a file onto the upload zone or use the file picker; it\'s hashed entirely in-browser via File.arrayBuffer(), never uploaded.' },
    ],
    relatedLinks: [{ label: 'Need a keyed hash instead? Try HMAC Generator →', href: '/tools/hmac-generator' }],
  },
  {
    slug: 'hmac-generator',
    title: 'HMAC Generator & Verifier (SHA-256/SHA-1/SHA-512)',
    description: 'Compute and verify HMAC signatures with a shared secret key using SHA-1, SHA-256, or SHA-512 — the same primitive that signs your JWTs, run locally.',
    category: 'Hashing, Encoding & Secrets',
    icon: ShieldCheck,
    phase: 1,
    status: 'live',
    keywords: ['hmac generator', 'hmac sha256 online', 'hmac verifier'],
    analogy: 'HMAC is a shared secret handshake: both sides know a secret phrase, and only someone who knows it can produce the matching "proof" for a given message — anyone else\'s proof will look completely different.',
    expert: 'RFC 2104. HMAC combines a secret key with a hash function to produce a keyed digest resistant to length-extension attacks. This is exactly what powers HS256/HS384/HS512 JWT signatures.',
    faqs: [
      { q: 'Is HMAC the same as encryption?', a: 'No — HMAC proves authenticity and integrity (that the message came from someone who knows the key and wasn\'t altered), it does not hide the message content.' },
      { q: 'What\'s the connection to JWTs?', a: 'An HS256 JWT signature is exactly HMAC-SHA256 over the header and payload using your shared secret — try the JWT Generator to see it end-to-end.' },
    ],
    relatedLinks: [{ label: 'See HMAC power a real JWT signature →', href: '/tools/jwt-generator' }],
  },
  {
    slug: 'uuid-generator',
    title: 'UUID & ULID Generator (v4, v7, Bulk)',
    description: 'Generate cryptographically random UUIDv4, time-sortable UUIDv7, or ULID identifiers in bulk, with one-click copy — 100% client-side randomness.',
    category: 'Hashing, Encoding & Secrets',
    icon: Shuffle,
    phase: 1,
    status: 'live',
    keywords: ['uuid generator', 'guid generator', 'uuid v7', 'ulid generator'],
    analogy: 'A UUID is like a library issuing every book a unique barcode so no two books are ever confused — even across different libraries that never talk to each other or coordinate numbering.',
    expert: 'RFC 9562 (UUID) and the ULID spec. UUIDv4 is 122 bits of pure randomness. UUIDv7 and ULID both prefix a millisecond timestamp before the random bits, so identifiers generated later always sort after earlier ones — useful for database primary keys and index locality.',
    faqs: [
      { q: 'Why would I want UUIDv7 instead of v4?', a: 'UUIDv7 embeds a timestamp, so IDs generated later always sort after earlier ones — this keeps database indexes sequential instead of randomly scattered, which v4 causes.' },
      { q: 'Are these IDs guessable?', a: 'No — the random portion is generated with crypto.getRandomValues(), the same cryptographically secure source used for encryption keys.' },
    ],
  },
  {
    slug: 'password-generator',
    title: 'Password Generator & Entropy Strength Checker',
    description: 'Generate strong random passwords or passphrases with custom rules, and see the exact entropy bits and estimated crack time — computed locally.',
    category: 'Hashing, Encoding & Secrets',
    icon: Lock,
    phase: 1,
    status: 'live',
    keywords: ['password generator', 'strong password generator', 'passphrase generator', 'password entropy'],
    analogy: 'The more possible combinations a lock has, the longer a thief needs to try every one — entropy is just a precise way of counting how many combinations your password actually has.',
    expert: 'Password strength is measured in bits of Shannon entropy: log2(possible characters ^ length). NIST SP 800-63B recommends prioritizing length over forced complexity rules, which is why the passphrase mode exists alongside the classic character-set mode.',
    faqs: [
      { q: 'Is Math.random() used to generate these?', a: 'No — every character comes from crypto.getRandomValues(), a cryptographically secure random source. Math.random() is never used for anything presented as "secure".' },
      { q: 'What is a passphrase and why is it sometimes stronger?', a: 'A passphrase strings together several random dictionary words. A 5-word passphrase from a 7,776-word list has more entropy than most short "complex" passwords, and is far easier to remember.' },
    ],
  },
  {
    slug: 'oauth-pkce-generator',
    title: 'OAuth PKCE Code Generator (code_verifier / code_challenge)',
    description: 'Generate an RFC 7636-compliant PKCE code_verifier and S256 code_challenge, and build a full OAuth 2.0 authorization URL — no backend required.',
    category: 'Auth & Directory Builders',
    icon: Link,
    phase: 1,
    status: 'live',
    keywords: ['pkce generator', 'code_verifier code_challenge', 'oauth pkce online'],
    analogy: 'PKCE is like tearing a dollar bill in half at check-in: you keep one half (the code_verifier) and hand over proof of the other (the code_challenge). When you return to claim your key, you present the matching half, proving you\'re the same person who checked in.',
    expert: 'RFC 7636. Prevents authorization code interception on public clients. The client generates a random code_verifier, derives a code_challenge = base64url(SHA-256(code_verifier)), sends the challenge on the front-channel, and proves possession of the verifier on the back-channel token exchange.',
    faqs: [
      { q: 'Do I need PKCE if my app already uses a client secret?', a: 'PKCE is mandatory for public clients (SPAs, mobile apps) that cannot keep a secret confidential — it\'s recommended even for confidential clients under OAuth 2.1.' },
      { q: 'Why S256 and not "plain"?', a: 'The "plain" method sends the verifier unhashed as the challenge, offering no protection if the challenge is intercepted. S256 is the only method most modern authorization servers accept.' },
    ],
    relatedLinks: [{ label: 'Watch PKCE inside a full OAuth flow →', href: '/playground/oauth' }],
  },
  {
    slug: 'totp-generator',
    title: 'TOTP Generator & Verifier (RFC 6238 Authenticator Codes)',
    description: 'Generate live, time-based one-time passwords (TOTP) from any Base32 secret and verify 6-digit codes — the same algorithm behind Google Authenticator.',
    category: 'Auth & Directory Builders',
    icon: Timer,
    phase: 1,
    status: 'live',
    keywords: ['totp generator', 'totp verifier', 'authenticator code generator', 'rfc 6238'],
    analogy: 'TOTP is a bank vault code that changes every 30 seconds — both you and the bank share a secret starting point and the same clock, so you both compute the exact same code at the exact same second without ever talking to each other.',
    expert: 'RFC 6238 (built on RFC 4226\'s HOTP). A shared Base32 secret is combined with the current 30-second time step via HMAC-SHA1/256/512, then dynamically truncated to a 6-8 digit code. Verification checks the current step plus ±1 adjacent step to tolerate clock skew.',
    faqs: [
      { q: 'Does this connect to my real authenticator app?', a: 'No — you paste in a secret and it computes the code locally, identically to how your phone\'s app would. Nothing is transmitted anywhere.' },
      { q: 'Why isn\'t there a scannable QR code?', a: 'To avoid implying any pairing with a live third-party service, the otpauth:// URI is shown as copyable text only.' },
    ],
  },
  {
    slug: 'ldap-filter-builder',
    title: 'LDAP Filter Builder — Visual RFC 4515 Query Composer',
    description: 'Compose valid LDAP search filters visually with AND/OR/NOT groups, then copy the exact RFC 4515 filter string — no directory connection needed.',
    category: 'Auth & Directory Builders',
    icon: ListTree,
    phase: 1,
    status: 'live',
    keywords: ['ldap filter builder', 'ldap query generator', 'active directory filter syntax'],
    analogy: 'Searching a directory with an LDAP filter is like looking up a book in a library card catalog using a nested system: Floor → Aisle → Shelf → Subject → Book — except here you\'re nesting AND/OR/NOT conditions instead of physical shelves.',
    expert: 'RFC 4515. LDAP search filters are a fully-parenthesized prefix notation combining attribute=value comparisons with &, |, and ! operators, e.g. (&(objectClass=user)(memberOf=cn=Admins,ou=Groups,dc=corp,dc=com)).',
    faqs: [
      { q: 'Can this test my filter against a real directory?', a: 'No — this tool only builds the filter string. Use the LDAP Tree Simulator playground to test it against a mock Active Directory schema live.' },
    ],
    relatedLinks: [{ label: 'Test this filter against a simulated directory →', href: '/playground/ldap' }],
  },
  {
    slug: 'scim-payload-validator',
    title: 'SCIM Payload Validator & Builder (RFC 7643/7644)',
    description: 'Validate or scaffold SCIM 2.0 User and Group JSON payloads against the core schema, with inline errors for missing or malformed attributes.',
    category: 'Auth & Directory Builders',
    icon: Users,
    phase: 1,
    status: 'live',
    keywords: ['scim validator', 'scim payload example', 'scim json schema'],
    analogy: 'SCIM is an automated megaphone: when HR hires you, it yells to Slack, AWS, and Salesforce simultaneously to create your accounts using the exact same standard form — this tool checks that your form was filled out correctly.',
    expert: 'RFC 7643 (schema) and RFC 7644 (protocol). Every SCIM resource must declare its schemas URNs (e.g. urn:ietf:params:scim:schemas:core:2.0:User) and follow the core attribute structure for name, emails, and group memberships.',
    faqs: [
      { q: 'What\'s the most common SCIM mistake this catches?', a: 'Missing or mismatched "schemas" URNs, and malformed nested objects like "name" or "emails" that should be arrays/objects but are sent as flat strings.' },
    ],
  },
  {
    slug: 'basic-auth-decoder',
    title: 'Basic & Bearer Auth Header Decoder',
    description: 'Decode HTTP Basic Authentication headers to reveal the username/password, or inspect Bearer tokens — a quick, private, client-side debugging utility.',
    category: 'PKI & Certificates',
    icon: KeySquare,
    phase: 1,
    status: 'live',
    keywords: ['basic auth decoder', 'decode authorization header', 'bearer token decoder'],
    analogy: 'An ID badge you flash at the door is authorization by proof; Basic Auth is a password whispered through a slot, just spelled out in a different alphabet — it is not encrypted, only re-encoded.',
    expert: 'RFC 7617. The Authorization: Basic header is base64(username:password) sent in cleartext (protected only by the TLS transport, if present). Bearer tokens (RFC 6750) are opaque or JWT strings presented as-is.',
    faqs: [
      { q: 'Is Basic Auth encrypted?', a: 'No — it is base64-encoded, which is trivially reversible by anyone. It relies entirely on HTTPS/TLS for confidentiality in transit.' },
      { q: 'I pasted a real password to debug an issue — what should I do?', a: 'Rotate it immediately afterward. Treat anything pasted into any online tool, including this one, as potentially compromised.' },
    ],
  },
  {
    slug: 'bcrypt-generator',
    title: 'bcrypt Hash Generator & Verifier Online',
    description: 'Hash passwords with bcrypt at a custom cost factor, or verify a password against an existing bcrypt hash — computed entirely client-side, in pure JavaScript.',
    category: 'Hashing, Encoding & Secrets',
    icon: LockKeyhole,
    phase: 2,
    status: 'live',
    keywords: ['bcrypt generator', 'bcrypt hash online', 'bcrypt verify'],
    analogy: 'bcrypt is a lock that\'s deliberately slow to pick, on purpose — so that even if a thief steals the entire box of locks (your password database), trying every possible key against just one of them is impractically slow.',
    expert: 'bcrypt is a Blowfish-based adaptive hashing function with a tunable cost factor that doubles the work per increment. Unlike plain SHA-256, it is intentionally slow and salted per-hash, which is why it (or Argon2/scrypt) is the correct choice for password storage.',
    faqs: [
      { q: 'Why not just use SHA-256 for passwords?', a: 'SHA-256 is fast by design — great for checksums, terrible for password storage, since fast hashes let attackers try billions of guesses per second on stolen hashes. bcrypt\'s deliberate slowness defeats that.' },
      { q: 'What cost factor should I use?', a: 'This tool caps the UI at 12-14: high enough to be slow for attackers, low enough to compute in-browser without freezing the tab. Production systems typically tune this per their own hardware.' },
    ],
    relatedLinks: [{ label: 'Compare against a plain SHA-256 hash →', href: '/tools/sha256-hash-generator' }],
  },
  {
    slug: 'jwk-pem-converter',
    title: 'JWK to PEM Converter (and back) + Thumbprint',
    description: 'Convert RSA/EC JSON Web Keys (JWK) to PEM format and back, and compute the RFC 7638 JWK thumbprint — all cryptography runs in your browser.',
    category: 'PKI & Certificates',
    icon: FileKey,
    phase: 2,
    status: 'live',
    keywords: ['jwk to pem', 'pem to jwk', 'jwk thumbprint calculator'],
    analogy: 'Converting a key between JWK and PEM is like translating the same physical key between two different "key shapes" that different locksmiths accept — it\'s still the exact same key, just described in different paperwork.',
    expert: 'RFC 7517 (JWK) vs. PEM/DER (X.690, PKCS#1/PKCS#8). Conversion round-trips through crypto.subtle.importKey/exportKey. The RFC 7638 thumbprint canonicalizes the required JWK members into JSON and SHA-256 digests them for a stable key identifier.',
    faqs: [
      { q: 'Does this support both RSA and EC keys?', a: 'Yes — RSA and EC (P-256/P-384) keys convert in both directions using the browser\'s native Web Crypto key import/export.' },
    ],
  },
  {
    slug: 'x509-certificate-decoder',
    title: 'X.509 Certificate Decoder — Parse PEM Certs & CSRs',
    description: 'Decode X.509 certificates and PKCS#10 CSRs to view subject, issuer, validity dates, SANs, key usage, and fingerprints — parsed locally, never uploaded.',
    category: 'PKI & Certificates',
    icon: FileCheck,
    phase: 2,
    status: 'live',
    keywords: ['x509 decoder', 'certificate decoder online', 'csr decoder', 'view certificate details'],
    analogy: 'An X.509 certificate is a physical passport: the border control (a server) trusts you because a government (a Certificate Authority) already verified your identity and stamped the passport. A CSR is the application you filled out before that stamp existed.',
    expert: 'RFC 5280 (X.509) and RFC 2986 (PKCS#10). Certificates and CSRs are ASN.1 DER-encoded structures; this tool includes a minimal hand-rolled DER TLV walker to extract Subject/Issuer DN, validity window, SANs, key usage, basic constraints, and SHA-1/256 fingerprints of the raw DER.',
    faqs: [
      { q: 'Can I check if a certificate has expired?', a: 'Yes — the Validity panel shows Not Before/Not After dates plus a live "expires in N days" or "EXPIRED" badge.' },
      { q: 'What about a CSR — is it a trusted certificate?', a: 'No. A CSR is an unsigned request; this tool labels it clearly as such and shows only what was requested, not anything a CA has vouched for.' },
    ],
    relatedLinks: [{ label: 'See X.509 SVIDs issued live →', href: '/playground/workload-mesh' }],
  },
  {
    slug: 'saml-decoder',
    title: 'SAML Decoder — Inspect SAMLRequest/Response & Metadata',
    description: 'Decode Base64/deflate-encoded SAMLRequest and SAMLResponse parameters, or pretty-print SP/IdP metadata XML — no server round-trip, fully client-side.',
    category: 'Tokens & Assertions',
    icon: FileCode,
    phase: 2,
    status: 'live',
    keywords: ['saml decoder', 'decode samlresponse', 'saml metadata viewer'],
    analogy: 'A SAML assertion is a physical passport: the border control (Service Provider) lets you in because they trust the visa stamp (an XML Digital Signature) applied by your home government (the Identity Provider).',
    expert: 'SAML 2.0 Core/Bindings. POST-bound values are base64(XML). Redirect-bound values are base64(raw-deflate(XML)) and require inline inflate, handled here via the native DecompressionStream("deflate-raw") API where supported.',
    faqs: [
      { q: 'Why does Redirect-binding sometimes fail to decode?', a: 'It requires the DecompressionStream API, which isn\'t available in every browser. Paste the POST-binding value instead, or use a recent Chrome, Firefox, or Safari.' },
    ],
    relatedLinks: [{ label: 'Build and sign a full SAML assertion →', href: '/playground/saml' }],
  },
  {
    slug: 'sd-jwt-decoder',
    title: 'SD-JWT Decoder — Selective Disclosure JWT Inspector',
    description: 'Decode Selective Disclosure JWTs (SD-JWT), reveal individual disclosures, and verify each digest binding against the issuer-signed JWT — entirely in-browser.',
    category: 'Tokens & Assertions',
    icon: Layers,
    phase: 3,
    status: 'live',
    keywords: ['sd-jwt decoder', 'selective disclosure jwt', 'sd-jwt verifier'],
    analogy: 'An SD-JWT is a sealed report card where you can tear off and hand someone just the "GPA" strip without revealing your grade in every individual class — and they can still verify your torn-off strip genuinely came from the original sealed report.',
    expert: 'IETF SD-JWT draft. The compact serialization is <issuer-signed-JWT>~<disclosure>~...~[<KB-JWT>]. Each disclosure is base64url([salt, key, value]); the tool recomputes base64url(SHA-256(disclosure)) and checks it against the payload\'s _sd digest array.',
    faqs: [
      { q: 'How is this different from a plain JWT?', a: 'A plain JWT reveals every claim to whoever holds it. SD-JWT lets the holder disclose only a subset of claims per presentation, while the verifier can still cryptographically confirm the disclosed claims are genuine.' },
    ],
    relatedLinks: [{ label: 'Compare against a plain JWT →', href: '/tools/jwt-decoder' }],
  },
  {
    slug: 'webauthn-decoder',
    title: 'WebAuthn / Passkey Assertion & Attestation Decoder',
    description: 'Decode clientDataJSON, authenticatorData, and CBOR attestationObject from a WebAuthn credential to inspect flags, counters, and public keys.',
    category: 'Emerging & Decentralized Identity',
    icon: Fingerprint,
    phase: 3,
    status: 'live',
    keywords: ['webauthn decoder', 'passkey assertion decoder', 'authenticatordata parser'],
    analogy: 'Unlocking your computer with your face: instead of typing a secret password, your device signs a cryptographic message locally and proves you possess it — no secret ever transmitted, and this tool shows you exactly what got signed.',
    expert: 'WebAuthn Level 2/3. clientDataJSON is UTF-8 JSON; authenticatorData is a fixed binary layout (rpIdHash[32] + flags[1] + counter[4] + optional attested credential data); attestationObject is a CBOR map {fmt, attStmt, authData} decoded here with a minimal hand-rolled CBOR reader.',
    faqs: [
      { q: 'What do the UP/UV/BE/BS flags mean?', a: 'User Present, User Verified, Backup Eligible, and Backup State — bits packed into authenticatorData that tell a server how the ceremony was performed, decoded here into plain-English labels.' },
    ],
    relatedLinks: [{ label: 'Run a full WebAuthn ceremony →', href: '/playground/fido2' }],
  },
  {
    slug: 'did-key-generator',
    title: 'DID Generator — Create a did:key Identifier',
    description: 'Generate an Ed25519 keypair entirely in your browser and derive its did:key decentralized identifier and DID document — no wallet, no blockchain.',
    category: 'Emerging & Decentralized Identity',
    icon: Wallet,
    phase: 3,
    status: 'live',
    keywords: ['did:key generator', 'decentralized identifier generator', 'w3c did'],
    analogy: 'A did:key identifier is an identity you own outright, like a physical ID card, instead of one issued and revocable by a central office — the identifier is derived directly from your own public key, with no registry involved.',
    expert: 'The did:key method spec, W3C DID Core. The raw Ed25519 public key is prefixed with the multicodec varint (0xed01), base58btc-encoded, and prefixed with the multibase "z" character to form did:key:z6Mk....',
    faqs: [
      { q: 'Is my private key stored or sent anywhere?', a: 'No — it exists only in this page\'s memory for the current session and is never persisted or transmitted. This is a learning/prototyping tool, not a wallet.' },
      { q: 'My browser doesn\'t generate a key — why?', a: 'Ed25519 key generation in Web Crypto isn\'t available in every browser yet. Try a recent Chrome, Edge, or Safari.' },
    ],
    relatedLinks: [{ label: 'See decentralized identity in action →', href: '/playground/zkp-wallet' }],
  },
]

export function getToolBySlug(slug: string): ToolMeta | undefined {
  return TOOLS.find((t) => t.slug === slug)
}

export function getToolsByCategory(): { category: ToolCategory; tools: ToolMeta[] }[] {
  const order: ToolCategory[] = [
    'Tokens & Assertions',
    'PKI & Certificates',
    'Hashing, Encoding & Secrets',
    'Auth & Directory Builders',
    'Emerging & Decentralized Identity',
  ]
  return order.map((category) => ({
    category,
    tools: TOOLS.filter((t) => t.category === category),
  }))
}
