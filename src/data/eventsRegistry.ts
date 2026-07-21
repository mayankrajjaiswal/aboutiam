// Single source of truth for the /events page — hardcoded, hand-curated list of
// major IAM industry conferences/summits. Dates and venues change year to year;
// re-verify against each event's official site before updating. Entries whose
// last day has already passed are filtered out at render time by getUpcomingEvents.
import type { LucideIcon } from 'lucide-react'
import { Landmark, Globe2, ShieldCheck, Fingerprint, Building2, CalendarClock, Users, Network } from 'lucide-react'

export interface IamEvent {
  slug: string
  name: string
  shortName?: string
  description: string
  startDate: string
  endDate?: string
  location: string
  venue?: string
  link: string
  icon: LucideIcon
  type: 'conference' | 'summit' | 'recurring-series'
  verified: boolean
}

export const IAM_EVENTS: IamEvent[] = [
  {
    slug: 'eic-2027',
    name: 'European Identity and Cloud Conference',
    shortName: 'EIC 2027',
    description: 'KuppingerCole\'s flagship European gathering on digital identity, security, privacy, and governance, drawing 1,500+ attendees, 250+ speakers, and 230+ sessions.',
    startDate: '2027-05-11',
    endDate: '2027-05-14',
    location: 'Berlin, Germany',
    venue: 'bcc Berlin Congress Center',
    link: 'https://www.kuppingercole.com/events/eic2026/agenda',
    icon: Landmark,
    type: 'conference',
    verified: true,
  },
  {
    slug: 'identiverse-2027',
    name: 'Identiverse',
    shortName: 'Identiverse 2027',
    description: 'One of the largest independent identity-industry conferences, covering IAM, CIAM, and the future of digital trust across enterprise and consumer identity.',
    startDate: '2027-06-28',
    endDate: '2027-07-01',
    location: 'Las Vegas, Nevada, USA',
    venue: 'Mandalay Bay',
    link: 'https://identiverse.com/',
    icon: Globe2,
    type: 'conference',
    verified: true,
  },
  {
    slug: 'identity-fabric-impact-day-2026',
    name: 'Identity Fabric Impact Day',
    shortName: 'Impact Day: Identity Fabric',
    description: 'A KuppingerCole single-day deep dive on building a modern, composable Identity Fabric architecture.',
    startDate: '2026-09-09',
    location: 'Cologne, Germany',
    venue: 'Hilton Cologne',
    link: 'https://www.kuppingercole.com/events',
    icon: CalendarClock,
    type: 'recurring-series',
    verified: true,
  },
  {
    slug: 'oktane-2026',
    name: 'Oktane',
    shortName: 'Oktane 2026',
    description: "Okta's flagship user conference covering identity security, CIAM, and workforce identity product roadmaps.",
    startDate: '2026-09-22',
    endDate: '2026-09-24',
    location: 'Las Vegas, Nevada, USA',
    venue: 'Caesars Forum',
    link: 'https://www.okta.com/oktane/',
    icon: Building2,
    type: 'conference',
    verified: true,
  },
  {
    slug: 'ai-nhi-impact-day-2026',
    name: 'AIdentity & Non-Human Identity Impact Day',
    shortName: 'Impact Day: AI & NHI',
    description: 'A KuppingerCole single-day event focused on securing AI agents, service accounts, and other non-human identities.',
    startDate: '2026-10-06',
    location: 'Munich, Germany',
    venue: 'Marriott Hotel',
    link: 'https://www.kuppingercole.com/events',
    icon: CalendarClock,
    type: 'recurring-series',
    verified: true,
  },
  {
    slug: 'authenticate-2026',
    name: 'Authenticate',
    shortName: 'Authenticate 2026',
    description: 'The FIDO Alliance\'s dedicated conference on passkeys, passwordless authentication, and the FIDO2/WebAuthn ecosystem.',
    startDate: '2026-10-19',
    endDate: '2026-10-21',
    location: 'Carlsbad, California, USA',
    venue: 'Omni La Costa Resort',
    link: 'https://authenticatecon.com/',
    icon: Fingerprint,
    type: 'conference',
    verified: true,
  },
  {
    slug: 'ciam-impact-day-2026',
    name: 'Customer Identity & Access Management (CIAM) Impact Day',
    shortName: 'Impact Day: CIAM',
    description: 'A KuppingerCole single-day event dedicated to Customer IAM strategy, UX, and consent management.',
    startDate: '2026-11-18',
    location: 'Frankfurt, Germany',
    venue: 'Hilton Frankfurt City Center',
    link: 'https://www.kuppingercole.com/events',
    icon: CalendarClock,
    type: 'recurring-series',
    verified: true,
  },
  {
    slug: 'identity-centric-cybersecurity-summit-2026',
    name: 'Identity-Centric Cybersecurity Summit',
    shortName: 'Identity Cybersecurity Summit 2026',
    description: 'A KuppingerCole summit on building cybersecurity strategy around identity as the new perimeter.',
    startDate: '2026-11-26',
    location: 'Munich, Germany',
    link: 'https://www.kuppingercole.com/events',
    icon: ShieldCheck,
    type: 'summit',
    verified: true,
  },
  {
    slug: 'gartner-iam-summit-2026',
    name: 'Gartner Identity & Access Management Summit',
    shortName: 'Gartner IAM Summit 2026',
    description: 'Gartner\'s premier conference for IAM leaders and architects, covering program management, automation, identity threat detection, and governance.',
    startDate: '2026-12-07',
    endDate: '2026-12-09',
    location: 'Las Vegas, Nevada, USA',
    venue: 'Caesars Forum',
    link: 'https://www.gartner.com/en/conferences/na/identity-access-management-us',
    icon: Building2,
    type: 'summit',
    verified: true,
  },
  {
    slug: 'nordics-identity-impact-day-2027',
    name: 'Nordics Identity Impact Day',
    shortName: 'Impact Day: Nordics',
    description: 'A KuppingerCole single-day regional event covering Nordic enterprise identity strategy and governance.',
    startDate: '2027-02-09',
    location: 'Göteborg, Sweden',
    link: 'https://www.kuppingercole.com/events',
    icon: CalendarClock,
    type: 'recurring-series',
    verified: true,
  },
  {
    slug: 'rsa-conference-2027',
    name: 'RSA Conference',
    shortName: 'RSAC 2027',
    description: 'One of the world\'s largest cybersecurity conferences, with a major identity and access management track spanning zero trust, CIAM, and IAM engineering.',
    startDate: '2027-04-05',
    endDate: '2027-04-08',
    location: 'San Francisco, California, USA',
    venue: 'Moscone Center',
    link: 'https://www.rsaconference.com/',
    icon: ShieldCheck,
    type: 'conference',
    verified: false,
  },
  {
    slug: 'identity-week-america-2026',
    name: 'Identity Week America',
    shortName: 'Identity Week America 2026',
    description: 'A major North American conference on digital identity, biometrics, credentialing, and identity verification across government and enterprise.',
    startDate: '2026-09-02',
    endDate: '2026-09-03',
    location: 'Washington, D.C., USA',
    venue: 'Walter E. Washington Convention Center',
    link: 'https://identityweek.net/',
    icon: Users,
    type: 'conference',
    verified: true,
  },
  {
    slug: 'identity-week-europe-2027',
    name: 'Identity Week Europe',
    shortName: 'Identity Week Europe 2027',
    description: 'Europe\'s largest conference on digital identity, biometrics, and identity verification for government and enterprise.',
    startDate: '2027-06-15',
    endDate: '2027-06-16',
    location: 'Amsterdam, Netherlands',
    venue: 'RAI Exhibition Centre',
    link: 'https://identityweek.net/',
    icon: Network,
    type: 'conference',
    verified: true,
  },
]

export function getUpcomingEvents(): IamEvent[] {
  const today = new Date().toISOString().slice(0, 10)
  return IAM_EVENTS
    .filter((event) => (event.endDate ?? event.startDate) >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
}
