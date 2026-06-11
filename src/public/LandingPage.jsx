import { useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Check,
  Mail,
  Network,
  PanelsTopLeft,
  Phone,
  Send,
  ShieldCheck,
  Share2,
  Trophy,
  Target,
  UserCheck,
  UsersRound,
  Workflow,
} from 'lucide-react'
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal'
import SignInModal from '../components/auth/SignInModal'
import SignUpModal from '../components/auth/SignUpModal'
import { useEmailVerificationHandler } from '../hooks/useEmailVerificationHandler'
import heroBackground from '../assets/hero-section.jpg'
import navLogo from '../assets/SportsHub.png'
import { PUBLIC_ROUTES } from '../routes/public-routes'

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' },
  { label: 'CTA', href: '#cta' },
]

const features = [
  {
    icon: UserCheck,
    title: 'Multi-Stage Player Registration',
    points: ['Player signup with skill level', 'Coach approval workflow', 'Team assignment system', 'Payment verification process'],
  },
  {
    icon: UsersRound,
    title: 'Team & Roster Management',
    points: ['Create and manage teams', 'Skill-based team assignment', 'Track team composition', 'Monitor member status'],
  },
  {
    icon: Workflow,
    title: 'Role-Based Access Control',
    points: ['Community organizer controls', 'Coach approval system', 'Facilitator payment verification', 'Player participation tracking'],
  },
  {
    icon: Trophy,
    title: 'Event & Sport Management',
    points: ['Create sports events', 'Set registration fees', 'Manage event dates and venues', 'Track event participation'],
  },
  {
    icon: BarChart3,
    title: 'Payment & Financial Tracking',
    points: ['Player payment submission', 'Multiple payment methods', 'Facilitator verification', 'Payment status tracking'],
  },
  {
    icon: ShieldCheck,
    title: 'Scheduling & Bracket System',
    points: ['Automated bracket generation', 'Status-based eligibility', 'Schedule management', 'Team readiness validation'],
  },
]

const benefits = [
  { title: 'Streamlined Registration Flow', text: 'Multi-stage approval process ensures only verified, payment-approved players participate in events.' },
  { title: 'Clear Role Responsibilities', text: 'Coaches approve players, facilitators verify payments, and organizers manage events with defined workflows.' },
  { title: 'Complete Payment Integration', text: 'Built-in payment tracking with multiple methods ensures financial accountability before scheduling.' },
]

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: 'easeOut' },
}

function Logo({ onHome }) {
  return (
    <button type="button" onClick={onHome} className="flex items-center gap-3 transition hover:opacity-80" aria-label="SportsHub home">
        <img src={navLogo} alt="SportsHub logo" className="h-10 w-10" />
      <span className="text-lg font-bold bg-gradient-to-r from-slate-950 to-cyan-600 bg-clip-text text-transparent">SportsHub</span>
    </button>
  )
}

export default function LandingPage({ authModal }) {
  const navigate = useNavigate()
  const location = useLocation()
  const heroSectionRef = useRef(null)
  useEmailVerificationHandler()

  const scrollToSection = useCallback((href, behavior = 'smooth') => {
    const target = document.querySelector(href)
    if (!target) return

    const headerHeight = document.querySelector('header')?.getBoundingClientRect().height ?? 0
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight

    window.scrollTo({ top: Math.max(0, top), behavior })
    window.history.pushState(null, '', href)
  }, [])

  const handleSectionNav = (event, href) => {
    event.preventDefault()
    scrollToSection(href)
  }

  const openAuthModal = (_event, route) => {
    navigate(route, { state: { restoreScrollY: window.scrollY } })
  }

  const navigateHome = () => {
    navigate(PUBLIC_ROUTES.home)
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  const closeAuthModal = () => {
    navigate(PUBLIC_ROUTES.home, {
      replace: true,
      state: { restoreScrollY: window.scrollY },
    })
  }

  const renderAuthModal = () => {
    if (authModal === 'sign-in') return <SignInModal onClose={closeAuthModal} />
    if (authModal === 'sign-up') return <SignUpModal onClose={closeAuthModal} />
    if (authModal === 'forgot-password') {
      return (
        <ForgotPasswordModal
          onBack={() => navigate(PUBLIC_ROUTES.signIn, { replace: true, state: { restoreScrollY: window.scrollY } })}
          onClose={closeAuthModal}
        />
      )
    }

    return null
  }

  useEffect(() => {
    if (!window.location.hash) return

    requestAnimationFrame(() => {
      scrollToSection(window.location.hash, 'auto')
    })
  }, [scrollToSection])

  useEffect(() => {
    if (typeof location.state?.restoreScrollY !== 'number') return

    requestAnimationFrame(() => {
      window.scrollTo({ top: location.state.restoreScrollY, behavior: 'auto' })
    })
  }, [location.state])

  const handleInquirySubmit = (event) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const inquiry = {
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      type: formData.get('type'),
      message: formData.get('message'),
    }
    const subject = encodeURIComponent(`SportsHub Inquiry: ${inquiry.type || 'General'}`)
    const body = encodeURIComponent(
      `Name: ${inquiry.name}\nEmail: ${inquiry.email}\nRole: ${inquiry.role}\nInquiry type: ${inquiry.type}\n\nMessage:\n${inquiry.message}`,
    )

    window.open(`mailto:organizers@sportshub.local?subject=${subject}&body=${body}`, '_self')
  }

  // GSAP animations removed; layout handled via CSS and Framer Motion

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-[#f7f9fc] text-slate-700">
   
      <header className="fixed inset-x-0 top-0 z-50 border-b border-cyan-100/50 bg-white/95 shadow-md shadow-slate-900/8 backdrop-blur-xl">
        <nav className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:flex-nowrap lg:px-8">
          <Logo onHome={navigateHome} />
          <div className="order-3 flex w-full items-center text-sm justify-center gap-4 overflow-x-auto text-nowrap border-t border-slate-100 pt-3 sm:gap-6 md:w-auto md:border-t-0 md:pt-0 lg:order-2 lg:gap-8" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <button
                type="button"
                key={link.label}
                onClick={(event) => handleSectionNav(event, link.href)}
                className="text-sm font-medium text-slate-600 transition hover:text-cyan-600 relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-cyan-600 group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </div>
          <div className="order-2 flex items-center gap-2 lg:order-3 lg:gap-3">
            <button
              type="button"
              onClick={(event) => openAuthModal(event, PUBLIC_ROUTES.signIn)}
              className="hidden cursor-pointer rounded-lg px-4 py-2.5 !text-sm font-semibold text-cyan-600 transition hover:bg-cyan-50 active:scale-95 sm:inline-flex"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={(event) => openAuthModal(event, PUBLIC_ROUTES.signUp)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 px-4 py-2.5 !text-sm !text-white font-semibold shadow-lg shadow-cyan-500/30 transition hover:shadow-xl active:scale-95"
            >
              Join Now <ArrowRight size={16} />
            </button>
          </div>
        </nav>
      </header>

      <main className="pt-[var(--header-height)]">
       <section
        ref={heroSectionRef}
        id="home"
        className="relative isolate min-h-[calc(100svh_-_var(--header-height))] overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
      >
        <div
          className="hero-bg absolute inset-0 -z-20 bg-cover bg-center will-change-transform"
          style={{ backgroundImage: `url(${heroBackground})` }}
          aria-hidden="true"
        />
        <div className="hero-overlay absolute inset-0 -z-10 bg-black/45" aria-hidden="true" />

        <div
          className="mx-auto flex min-h-[calc(100svh_-_var(--header-height)_-_6rem)] max-w-7xl items-center justify-center text-center sm:min-h-[calc(100svh_-_var(--header-height)_-_8rem)]"
        >
          <div className="relative z-10 max-w-4xl">

            <span className="hero-animate inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur">
              <Trophy size={16} /> Smart community sports management
            </span>

            <h1 className="hero-animate mx-auto mt-6 max-w-4xl text-4xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
              SportsHub: Complete Community Sports Management System
            </h1>

            <p className="hero-animate mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-100">
              A comprehensive platform managing the complete player lifecycle—from registration and coach approval to team assignment, payment verification, and automated scheduling with bracket generation.
            </p>

            <div className="hero-animate mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                type="button"
                onClick={(event) => openAuthModal(event, PUBLIC_ROUTES.signUp)}
                className="inline-flex items-center hover:-translate-y-0.5 gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 px-6 py-3 text-base !text-white font-semibold shadow-lg shadow-cyan-500/30 transition hover:shadow-xl active:scale-95"
              >
                Explore Platform <ArrowRight size={18} />
              </button>

              <button
                type="button"
                onClick={(event) => handleSectionNav(event, '#about')}
                className="hero-action inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 px-6 py-3 font-semibold !text-white shadow-lg shadow-cyan-900/20 backdrop-blur transition hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/20 active:scale-95"
              >
                <Target size={18} /> Learn About SportsHub
              </button>
            </div>

          </div>
        </div>
      </section>

        <section id="features" className="section-band bg-white">
          <SectionHeading eyebrow="Features" title="Key tools for better community sports management." />
          <div className="mx-auto mt-16 grid max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon
              return (
                <motion.article {...fadeUp} transition={{ duration: 0.45, delay: index * 0.04 }} key={feature.title} className="group rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50/30 p-6 shadow-sm transition hover:shadow-lg hover:border-cyan-200">
                  <div className="inline-flex rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 p-3 text-cyan-600 transition group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-cyan-100 group-hover:to-blue-100"><FeatureIcon size={24} /></div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <ul className="mt-3 space-y-2">
                    {feature.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-slate-600"><Check size={16} className="mt-0.5 flex-shrink-0 text-cyan-500" /> <span>{point}</span></li>
                    ))}
                  </ul>
                </motion.article>
              )
            })}
          </div>
        </section>

        <section id="about" className="section-band bg-gradient-to-b from-slate-50 to-white">
          <SectionHeading eyebrow="About SportsHub" title="End-to-end platform for municipal sports program management." />
          <div className="mx-auto mt-8 max-w-4xl px-4 text-center text-lg leading-8 text-slate-600 sm:px-6 lg:px-8">
            <p>
              SportsHub provides a complete workflow system for community sports management at the municipal level. The platform handles player registration with skill assessment, multi-stage approval workflows involving coaches and facilitators, team roster management, integrated payment tracking with verification, and automated bracket generation for scheduled events. Each role—from community organizers to players—has tailored access and responsibilities ensuring no incomplete teams, unpaid players, or unauthorized access.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
            {benefits.map((benefit) => (
              <motion.article {...fadeUp} key={benefit.title} className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-6 shadow-sm transition hover:shadow-md hover:border-cyan-200">
                <ShieldCheck size={28} className="text-cyan-600" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{benefit.title}</h3>
                <p className="mt-2 text-slate-600 leading-relaxed">{benefit.text}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="cta" className="flex min-h-[calc(100svh_-_var(--header-height))] items-center bg-slate-900 px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid w-full pt-20 max-w-7xl items-center gap-10 lg:gap-12 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div {...fadeUp} className="text-center lg:text-left">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-300">Inquiry</p>
              <h2 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
                Ready to streamline your municipal sports program?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 lg:mx-0">
                Contact us for municipal organizer access, coach and facilitator roles, player registration guidance, payment system integration, or scheduling and bracket generation support.
              </p>
              <div className="mt-7 grid gap-4 text-left sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 text-slate-100 backdrop-blur-sm transition hover:border-cyan-300/50 hover:from-white/15">
                  <Mail className="text-cyan-300" size={24} />
                  <p className="mt-3 text-sm font-semibold text-white">Email support</p>
                  <p className="mt-1 text-sm text-slate-300">organizers@sportshub.local</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 text-slate-200 backdrop-blur-sm transition hover:border-cyan-300/50 hover:from-white/15">
                  <Phone className="text-cyan-300" size={24} />
                  <p className="mt-3 text-sm font-semibold text-white">Community desk</p>
                  <p className="mt-1 text-sm text-slate-300">Event, team, and role inquiries</p>
                </div>
              </div>
            </motion.div>

            <motion.form {...fadeUp} onSubmit={handleInquirySubmit} className="rounded-3xl border border-white/10 bg-gradient-to-br from-white to-slate-50 p-6 shadow-2xl shadow-cyan-950/20 sm:p-8">
              <div className="grid gap-4 flex flex-col">
                <label className="grid gap-1 text-sm font-semibold text-slate-700">
                  Full name
                  <input 
                    required 
                    className="px-4 py-2 rounded-lg border border-slate-200 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" 
                    type="text"
                    name="name" 
                    placeholder="Your name" 
                  />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-slate-700">
                  Email
                  <input 
                    required 
                    className="px-4 py-2 rounded-lg border border-slate-200 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" 
                    type="email" 
                    name="email" 
                    placeholder="you@example.com" 
                  />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-slate-700">
                  Role
                  <select 
                    required 
                    className="px-4 py-2 rounded-lg border border-slate-200 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" 
                  >
                    <option value="" disabled>Select role</option>
                    <option>Community Organizer</option>
                    <option>Coach</option>
                    <option>Facilitator</option>
                    <option>Player</option>
                    <option>Researcher</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-semibold text-slate-700">
                  Inquiry type
                  <select required className="px-4 py-2 rounded-lg border border-slate-200 bg-white px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" name="type" defaultValue="">
                    <option value="" disabled>Select topic</option>
                    <option>Organizer access</option>
                    <option>Coach/Facilitator role</option>
                    <option>Player registration</option>
                    <option>Payment integration</option>
                    <option>Event & bracket system</option>
                    <option>System demo</option>
                  </select>
                </label>
              </div>
              <label className="mt-5 grid gap-2.5 text-sm font-semibold text-slate-700">
                Message
                <textarea 
                  required 
                  className="px-4 py-2 resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" 
                  name="message" 
                  rows="4"
                  placeholder="Tell us what you need help with." 
                />              
                </label>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button type="submit" className="inline-flex px-4 py-2.5 cursor-pointer flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:shadow-xl hover:from-cyan-600 hover:to-cyan-700 active:scale-95">
                  Send Inquiry <Send size={18} />
                </button>
             
              </div>
            </motion.form>
          </div>
                  </section>
      </main>

      <footer className="border-t border-slate-200 bg-gradient-to-b from-white to-slate-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <Logo onHome={navigateHome} />
          <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-600">
            {['Home', 'Features', 'About', 'CTA'].map((item) => (
              <button
                type="button"
                key={item}
                onClick={(event) => handleSectionNav(event, `#${item.toLowerCase()}`)}
                className="transition hover:text-cyan-600"
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            {[Share2, Network, PanelsTopLeft].map((SocialIcon, index) => (
              <button key={index} type="button" className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-600" aria-label="Social media profile">
                <SocialIcon size={18} />
              </button>
            ))}
          </div>
        </div>
      </footer>
      {renderAuthModal()}
    </div>
  )
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <motion.div {...fadeUp} className="mx-auto max-w-7xl px-4 text-left sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-600">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">{title}</h2>
      <p className="mt-5 text-lg leading-relaxed text-slate-600">
        {description}
      </p>
    </motion.div>
  )
}
