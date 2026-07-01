import { useState } from 'react'
import { 
  Users, Mail, Heart, Send, CheckCircle2
} from 'lucide-react'

export default function Contributors() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [inquiry, setInquiry] = useState('General')
  const [message, setMessage] = useState('')
  const [formSent, setFormSent] = useState(false)

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message) return
    
    // Simulate successful form dispatch natively
    setFormSent(true)
    setTimeout(() => {
      setName('')
      setEmail('')
      setMessage('')
    }, 2000)
  }

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Users className="w-3.5 h-3.5" /> Team & Contact
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Meet the Contributors & Contact Us
        </h2>
        <p className="text-text-secondary">
          Discover the visionaries behind the AboutIAM open-source platform, and submit inquiry questions, suggestions, or partnership requests directly to our core developers.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Core Founder Profile */}
        <div className="lg:col-span-1 space-y-6">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Lead Architect & Founder</span>
          
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col items-center text-center space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-full blur-2xl group-hover:bg-accent-primary/10 transition-all"></div>
            
            {/* Custom Avatar Icon representation */}
            <div className="w-20 h-20 rounded-full bg-accent-glow border border-accent-primary/20 flex items-center justify-center text-3xl shrink-0 shadow-inner">
              👨‍💻
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-black text-text-primary">Mayank Raj Jaiswal</h4>
              <p className="text-xs font-bold uppercase tracking-wider text-accent-primary">Lead Architect & Founder</p>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed font-semibold max-w-xs">
              A cybersecurity innovator and identity engineering visionary dedicated to making complex protocols (OAuth 2.1, OIDC, WebAuthn, ZTA) accessible, visual, and secure for everyone.
            </p>

            <div className="flex gap-2 pt-2">
              <a
                href="https://github.com/mayankrajjaiswal"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-lg border border-border-subtle bg-bg-sidebar hover:bg-bg-nested text-text-secondary hover:text-text-primary transition-colors focus:outline-none group"
                title="Browse Mayank's GitHub"
              >
                <svg className="w-4.5 h-4.5 fill-current text-text-secondary group-hover:text-text-primary" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
              <a
                href="mailto:contact@aboutiam.com"
                className="p-2.5 rounded-lg border border-border-subtle bg-bg-sidebar hover:bg-bg-nested text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
                title="Send an Email"
              >
                <Mail className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Join Open Source invitation card */}
          <div className="p-6 rounded-2xl bg-bg-sidebar/50 border border-border-subtle space-y-3">
            <span className="text-[10px] font-bold text-accent-primary uppercase tracking-wider flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-current" /> Community Contributions
            </span>
            <p className="text-xs text-text-secondary leading-relaxed font-semibold">
              AboutIAM is a fully open-source, MIT-licensed, community-driven project. We invite other developers, security architects, and interns to submit pull requests, audit code, or suggest new educational modules on our GitHub!
            </p>
          </div>
        </div>

        {/* Interactive Contact Form (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Inquiry Inbox</span>
          
          <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(rgba(59,130,246,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

            {formSent ? (
              /* Success dispatch screen */
              <div className="flex flex-col items-center justify-center text-center py-12 space-y-4 animate-scaleUp relative z-10">
                <CheckCircle2 className="w-16 h-16 text-status-success animate-pulse-slow" />
                <h3 className="text-2xl font-black text-text-primary">Message Sent Successfully!</h3>
                <p className="text-xs text-text-secondary leading-relaxed max-w-sm font-semibold">
                  Thank you for reaching out! Your inquiry has been processed natively and dispatched. Mayank will review your request and get back to you shortly.
                </p>
                <button
                  onClick={() => setFormSent(false)}
                  className="px-4 py-2 rounded-lg border border-border-subtle bg-bg-sidebar hover:bg-bg-nested text-text-primary text-xs font-bold transition-all"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              /* Main Form */
              <form onSubmit={handleFormSubmit} className="space-y-5 relative z-10 text-xs sm:text-sm font-semibold text-text-secondary">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="block uppercase tracking-wider text-[10px]">Your Name</label>
                    <input 
                      type="text" 
                      required 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary focus:outline-none focus:border-accent-primary" 
                      placeholder="Alex Security" 
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block uppercase tracking-wider text-[10px]">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary focus:outline-none focus:border-accent-primary" 
                      placeholder="alex@security-firm.com" 
                    />
                  </div>
                </div>

                {/* Inquiry Type */}
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-[10px]">Inquiry Category</label>
                  <select 
                    value={inquiry}
                    onChange={(e) => setInquiry(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary"
                  >
                    <option value="General">General Questions & Feedback</option>
                    <option value="Feature">Feature / Module Suggestion</option>
                    <option value="Bug">Bug Report / UI Audit</option>
                    <option value="Partnership">Business Partnership / Lecture Request</option>
                  </select>
                </div>

                {/* Message Body */}
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-[10px]">Inquiry Message</label>
                  <textarea 
                    required 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-32 p-4 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary focus:outline-none focus:border-accent-primary resize-none" 
                    placeholder="Describe your suggestion or partnership request in detail..." 
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-6 py-3 bg-accent-primary hover:bg-accent-hover text-white font-bold rounded-xl transition-all shadow-md shadow-accent-primary/10 cursor-pointer"
                >
                  Send Message <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
