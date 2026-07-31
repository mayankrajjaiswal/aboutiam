export interface HallOfFameProfile {
  id: string
  name: string
  contribution: string
  /** Cross-references a real STANDARDS entry id (see src/data/standardsData.ts). */
  standard: string
  year: number
  bio: string
  sourceLinks: string[]
}

/**
 * Short biographical profiles of the people behind foundational IAM specs —
 * sourced from public, citable material (Wikipedia, OASIS/IETF/W3C credits,
 * oauth.net history). No invented biographical claims. A companion to the
 * historical narrative already in IdentityTimeline.tsx, but about the humans
 * who wrote the standards rather than the eras/protocols themselves.
 */
export const IAM_HALL_OF_FAME: HallOfFameProfile[] = [
  {
    id: 'blaine-cook',
    name: 'Blaine Cook',
    contribution: "Twitter's lead architect who, in 2006, needed a way to let third-party apps access Twitter data without sharing passwords — the problem that became OAuth.",
    standard: 'oauth21',
    year: 2007,
    bio: 'Co-authored the original OAuth 1.0 specification alongside Chris Messina, Larry Halff, and others, drafting it in the open on a wiki rather than behind closed doors — a deliberate choice that shaped OAuth\'s community-driven development model.',
    sourceLinks: ['https://en.wikipedia.org/wiki/OAuth', 'https://oauth.net/core/1.0/'],
  },
  {
    id: 'chris-messina',
    name: 'Chris Messina',
    contribution: 'Convened the original OAuth discussions and championed an open, vendor-neutral specification process rather than a single-company standard.',
    standard: 'oauth21',
    year: 2007,
    bio: 'A longtime open-web advocate (also known for popularizing the Twitter hashtag), Messina helped organize the informal working group of engineers from Twitter, Ma.gnolia, and other early social platforms that produced OAuth 1.0.',
    sourceLinks: ['https://en.wikipedia.org/wiki/OAuth', 'https://chrismessina.substack.com/'],
  },
  {
    id: 'eran-hammer',
    name: 'Eran Hammer',
    contribution: 'Lead editor of the OAuth 2.0 specification at the IETF, then a vocal, public critic of the final result after resigning from the role in 2012.',
    standard: 'oauth21',
    year: 2012,
    bio: 'Hammer\'s widely-read blog post "OAuth 2.0 and the Road to Hell" argued the finished spec had become too complex and insufficiently interoperable compared to OAuth 1.0 — a genuinely contentious moment in IAM standards history, cited by later specs (including OAuth 2.1) as motivation to consolidate best practices.',
    sourceLinks: ['https://en.wikipedia.org/wiki/OAuth', 'https://web.archive.org/web/20130215104637/http://hueniverse.com/2012/07/26/oauth-2-0-and-the-road-to-hell/'],
  },
  {
    id: 'dick-hardt',
    name: 'Dick Hardt',
    contribution: "Presented an influential 2007 conference talk ('OAuth: Open Authorization for the Open Web') that popularized OAuth's core delegation model to a broad developer audience.",
    standard: 'oauth21',
    year: 2007,
    bio: 'As founder of Sxip Identity, Hardt was already working on federated identity delegation problems before OAuth existed, and his early advocacy helped OAuth spread beyond the small group that originally drafted it.',
    sourceLinks: ['https://en.wikipedia.org/wiki/OAuth'],
  },
  {
    id: 'eve-maler',
    name: 'Eve Maler',
    contribution: 'Co-authored SAML 1.0 and 2.0 at OASIS, and later led work on User-Managed Access (UMA) — an early precursor to modern consent/delegation models.',
    standard: 'saml2',
    year: 2005,
    bio: 'A longtime OASIS Security Services Technical Committee (SSTC) contributor, Maler helped shape SAML\'s core assertion and protocol model, then went on to chair UMA at the Kantara Initiative, connecting SAML-era federation thinking to modern consent-driven authorization.',
    sourceLinks: ['https://en.wikipedia.org/wiki/Security_Assertion_Markup_Language', 'https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=security'],
  },
  {
    id: 'scott-cantor',
    name: 'Scott Cantor',
    contribution: 'Long-serving co-editor of the SAML 2.0 core specification and a principal author of Shibboleth, the widely-deployed academic federation software.',
    standard: 'saml2',
    year: 2005,
    bio: 'As a member of the OASIS SSTC and a key Shibboleth architect at Internet2, Cantor bridged SAML\'s formal specification work with one of its largest real-world deployments — the international eduGAIN/Shibboleth federation used across higher education.',
    sourceLinks: ['https://en.wikipedia.org/wiki/Security_Assertion_Markup_Language', 'https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=security'],
  },
  {
    id: 'prateek-mishra',
    name: 'Prateek Mishra',
    contribution: 'Co-editor of the SAML 2.0 specification at OASIS, helping merge earlier competing federation proposals (including Liberty Alliance work) into the unified SAML 2.0 standard.',
    standard: 'saml2',
    year: 2005,
    bio: 'Mishra\'s editorial work at OASIS helped SAML 2.0 consolidate what had been a fragmented landscape of competing federated-identity proposals in the early 2000s into the single standard that still underpins enterprise SSO today.',
    sourceLinks: ['https://en.wikipedia.org/wiki/Security_Assertion_Markup_Language', 'https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=security'],
  },
  {
    id: 'steve-miller-clifford-neuman',
    name: 'Steve Miller & Clifford Neuman',
    contribution: "Designed Kerberos as part of MIT's Project Athena in the 1980s, creating the ticket-based authentication model still used by Active Directory today.",
    standard: 'kerberos',
    year: 1988,
    bio: 'Working within Project Athena — MIT\'s campus-wide distributed computing initiative — Miller and Neuman needed a way for students and staff to authenticate across many shared workstations without passwords crossing the network in the clear. The result, Kerberos (named for the three-headed dog of Greek mythology guarding the underworld), is the same ticket-granting model Microsoft adopted for Windows domain authentication.',
    sourceLinks: ['https://en.wikipedia.org/wiki/Kerberos_(protocol)', 'https://web.mit.edu/kerberos/'],
  },
  {
    id: 'jennifer-steiner',
    name: 'Jennifer Steiner',
    contribution: 'Co-author of the original 1988 Kerberos paper ("Kerberos: An Authentication Service for Open Network Systems") alongside Miller and Neuman.',
    standard: 'kerberos',
    year: 1988,
    bio: 'Steiner\'s work on the founding Kerberos paper documented the protocol\'s ticket-exchange design for the wider systems-research community, helping it spread beyond MIT into the broader distributed-systems and eventually enterprise-IT world.',
    sourceLinks: ['https://en.wikipedia.org/wiki/Kerberos_(protocol)'],
  },
  {
    id: 'dirk-balfanz',
    name: 'Dirk Balfanz',
    contribution: "Google security engineer who co-created U2F (FIDO's Universal 2nd Factor) and helped shape the WebAuthn specification's core design.",
    standard: 'webauthn',
    year: 2019,
    bio: 'Balfanz\'s work at Google on U2F hardware security keys directly informed the W3C WebAuthn standard\'s public-key credential model — the same asymmetric-key approach now underpinning passkeys.',
    sourceLinks: ['https://www.w3.org/TR/webauthn-2/', 'https://en.wikipedia.org/wiki/WebAuthn'],
  },
  {
    id: 'michael-b-jones',
    name: 'Michael B. Jones',
    contribution: 'A W3C WebAuthn and FIDO2 spec editor, and separately one of the primary authors of the JSON Web Token (JWT), JWS, and JWE specifications at the IETF.',
    standard: 'webauthn',
    year: 2019,
    bio: 'Few individuals show up as a named editor on as many widely-deployed identity standards as Jones — his IETF JOSE working-group work (JWT/JWS/JWE) and W3C WebAuthn editorship span two of the most-used cryptographic identity formats on the modern web.',
    sourceLinks: ['https://www.w3.org/TR/webauthn-2/', 'https://datatracker.ietf.org/doc/html/rfc7519'],
  },
  {
    id: 'jc-jones',
    name: 'J.C. Jones',
    contribution: "Mozilla's representative co-editor on the W3C WebAuthn specification, focused on browser-implementation interoperability across Firefox, Chrome, and Edge.",
    standard: 'webauthn',
    year: 2019,
    bio: 'As WebAuthn moved from draft to W3C Recommendation, cross-browser interoperability was as much the challenge as the cryptography itself — J.C. Jones\'s editorship helped keep Firefox\'s implementation aligned with Chrome and Edge as the spec matured.',
    sourceLinks: ['https://www.w3.org/TR/webauthn-2/'],
  },
]
