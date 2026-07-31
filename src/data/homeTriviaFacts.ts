export interface HomeTriviaFact {
  id: string
  label: string
  text: string
}

/**
 * The site's original curated "Identity Trivia & Curious Cases" facts, extracted
 * verbatim from the former static Home.tsx grid so the Fact-of-the-Day widget
 * (src/lib/home/factOfTheDay.ts) can rotate through them instead of duplicating
 * the copy.
 */
export const HOME_TRIVIA_FACTS: HomeTriviaFact[] = [
  {
    id: 'trivia-first-password',
    label: '1961 | The First Password',
    text: "MIT's CTSS introduced the first computer password to limit mainframe terminal use. Fernando Corbató's team bypassed it immediately by printing out the master password file to share game terminal hours!",
  },
  {
    id: 'trivia-kerberos-mythology',
    label: 'Mythology | Kerberos',
    text: 'Kerberos is named after Cerberus, the Greek three-headed dog guarding the underworld. The three heads represent the Client, Server, and KDC—all must trust each other for trusted entry!',
  },
  {
    id: 'trivia-golden-saml',
    label: 'SolarWinds | Golden SAML',
    text: 'Attackers stole on-premises private token-signing certificates to forge SAML assertions offline, bypassing cloud-passwords, MFA, and conditional access policies completely undetected.',
  },
  {
    id: 'trivia-securid',
    label: '1986 | RSA SecurID Token',
    text: 'Patented by RSA Security, the hardware token revolutionized MFA by generating numeric, time-syncing passcodes from local internal crystal oscillators, introducing seed key synchronization.',
  },
  {
    id: 'trivia-captcha',
    label: '1997 | CAPTCHA Invention',
    text: 'CMU researchers invented Completely Automated Public Turing tests to tell Computers and Humans Apart (CAPTCHA) to block automated bot crawler scripts from registering spam accounts.',
  },
  {
    id: 'trivia-magnetic-stripe',
    label: '1960 | Magnetic Stripe Badges',
    text: 'IBM engineer Forrest Parry struggled to adhere magnetic tape to plastic badges. His wife Dorothea suggested ironing the tape directly onto the plastic—inventing the universal security badge standard!',
  },
  {
    id: 'trivia-smart-card',
    label: '1977 | The Smart Card',
    text: 'Patented by French inventor Roland Moreno, the smart card embedded a tiny silicon microchip into plastic, introducing tamper-resistant local cryptographic enclaves paving the way for SIM cards.',
  },
  {
    id: 'trivia-sts-broker',
    label: '2014 | STS Broker Inception',
    text: 'The Security Token Service (STS) broker decoupled identity federation, enabling enterprises to swap legacy AD Kerberos tickets for web-friendly cloud SAML/OIDC assertions on-the-fly.',
  },
]
