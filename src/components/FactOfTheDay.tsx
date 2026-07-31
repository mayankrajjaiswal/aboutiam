import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'
import { getFactOfTheDay } from '../lib/home/factOfTheDay'

export default function FactOfTheDay() {
  const [today] = useState(() => new Date().toISOString().slice(0, 10))
  const fact = getFactOfTheDay(today)

  return (
    <section className="space-y-4 pt-6">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-accent-primary animate-pulse-slow" />
        <h3 className="text-2xl font-extrabold text-text-primary">Identity Fact of the Day</h3>
      </div>
      <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle hover:border-accent-primary/20 transition-all space-y-3 shadow-sm max-w-3xl">
        <span className="text-[10px] font-black text-accent-primary uppercase bg-accent-glow px-2 py-0.5 rounded border border-accent-primary/10 w-fit block">
          {fact.label}
        </span>
        <p className="text-sm text-text-secondary leading-relaxed font-semibold">{fact.text}</p>
        {fact.link && (
          <Link
            to={fact.link}
            className="inline-flex items-center gap-1.5 text-accent-primary hover:text-accent-hover text-xs font-bold transition-colors group"
          >
            Learn more in the Encyclopedia <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </section>
  )
}
