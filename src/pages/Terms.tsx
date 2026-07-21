import { Scale, ShieldAlert, FileWarning, BookOpen } from 'lucide-react'

export default function Terms() {
  return (
    <div className="space-y-8 py-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Scale className="w-3.5 h-3.5" /> Legal & Educational Use
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Terms, License & Disclaimer
        </h2>
        <p className="text-text-secondary">
          AboutIAM is a free, open-source, educational platform. This page summarizes the license under which the code is shared and the terms under which the site's interactive labs should be used.
        </p>
      </div>

      <div className="space-y-6">
        {/* MIT License */}
        <section className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <BookOpen className="w-4.5 h-4.5 text-accent-primary" /> MIT License
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            AboutIAM's source code is released under the permissive <span className="font-semibold text-text-primary">MIT License</span>. You are free to use, copy, modify, and redistribute it, including for commercial purposes, provided the original copyright notice and license text are retained. See the{' '}
            <a
              href="https://github.com/mayankrajjaiswal/aboutiam/blob/main/LICENSE"
              target="_blank"
              rel="noreferrer"
              className="text-accent-primary hover:text-accent-hover underline font-semibold"
            >
              LICENSE file on GitHub
            </a>{' '}
            for the full legal text.
          </p>
        </section>

        {/* Educational / Simulated Environment Disclaimer */}
        <section className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5 text-status-warning" /> Educational & Simulated Environment
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            The Identity Labs, CTF Arena, and other Playgrounds on this site simulate real-world attack techniques — including SAML Signature Wrapping, Golden/Silver SAML forgeries, JWT secret cracking, and OAuth redirect hijacks — purely for hands-on learning. Every simulation runs entirely inside your own browser against locally-generated mock data: no real identity provider, server, or third party is targeted, and per AboutIAM's zero-backend architecture, nothing you enter ever leaves your device. Techniques demonstrated here are intended solely for authorized security education, training, and portfolio practice — not for use against systems you do not own or lack explicit permission to test.
          </p>
        </section>

        {/* No Warranty */}
        <section className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <FileWarning className="w-4.5 h-4.5 text-status-danger" /> No Warranty
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            This software and its content are provided "AS IS", without warranty of any kind, express or implied, including but not limited to warranties of accuracy, completeness, fitness for a particular purpose, or security effectiveness. Nothing on AboutIAM constitutes professional security, legal, or compliance advice — always consult a qualified professional before making decisions for a production environment.
          </p>
        </section>
      </div>
    </div>
  )
}
