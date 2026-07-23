import { CalendarDays, MapPin, ArrowUpRight, PartyPopper } from 'lucide-react'
import { getUpcomingEvents } from '../data/eventsRegistry'
import type { IamEvent } from '../data/eventsRegistry'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function formatDateRange(startDate: string, endDate?: string) {
  const start = new Date(`${startDate}T00:00:00`)
  const startMonth = MONTHS[start.getMonth()]
  const startDay = start.getDate()
  const year = start.getFullYear()

  if (!endDate) return `${startMonth} ${year}`

  const end = new Date(`${endDate}T00:00:00`)
  const endMonth = MONTHS[end.getMonth()]
  const endDay = end.getDate()

  if (startMonth === endMonth) return `${startMonth} ${startDay}–${endDay}, ${year}`
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`
}

function buildEventsJsonLd(events: IamEvent[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://www.aboutiam.com/events/',
    'name': 'AboutIAM IAM Events & Conferences',
    'description': "Chronologically sorted directory of major identity industry conferences and summits.",
    'hasPart': events.map((e) => ({
      '@type': 'Event',
      '@id': `https://www.aboutiam.com/events/#${e.slug}`,
      'name': e.name,
      'startDate': e.startDate,
      ...(e.endDate ? { endDate: e.endDate } : {}),
      'location': {
        '@type': 'Place',
        'name': e.venue ?? e.location,
        'address': e.location
      },
      'description': e.description,
      'url': e.link,
      'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
      'eventStatus': 'https://schema.org/EventScheduled'
    }))
  }
}

export default function EventsCalendar() {
  const events = getUpcomingEvents()

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildEventsJsonLd(events)).replace(/</g, '\\u003c') }}
      />
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-glow text-accent-primary text-xs font-semibold tracking-wider uppercase border border-accent-primary/20">
          <PartyPopper className="w-4 h-4" /> Where the IAM Community Meets
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          IAM Events & Conferences
        </h1>
        <p className="text-text-secondary text-lg">
          The industry's major identity conferences, summits, and standards gatherings — dates, locations, and direct links to the official agenda.
        </p>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const Icon = event.icon
          return (
            <a
              key={event.slug}
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
                    <Icon className="w-5 h-5" />
                  </div>
                  {event.type === 'recurring-series' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border bg-text-muted/10 border-border-subtle text-text-secondary">
                      Recurring
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                  {event.name}
                </h4>
                <div className="flex flex-col gap-1.5 text-sm text-text-secondary">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                    {formatDateRange(event.startDate, event.endDate)}
                    {!event.verified && <span className="text-[10px] text-status-danger font-semibold">(verify dates)</span>}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-accent-primary shrink-0" />
                    {event.venue ? `${event.venue}, ${event.location}` : event.location}
                  </span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{event.description}</p>
              </div>
              <div className="pt-6 mt-6 border-t border-border-subtle/50 flex items-center gap-1 text-xs font-semibold text-accent-primary">
                View Details <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </a>
          )
        })}
      </section>
    </div>
  )
}
