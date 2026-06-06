import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Check,
  Mail,
  MessageSquareText,
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
import AuthModal from '../components/auth/AuthModal'
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
    icon: UsersRound,
    title: 'Automated Scheduling',
    points: ['Create sports events', 'Organize dates and venues', 'Manage community activities', 'Reduce manual coordination'],
  },
  {
    icon: Workflow,
    title: 'Skill-Based Player Matching',
    points: ['Match suitable teammates', 'Find balanced opponents', 'Support fair teams', 'Improve participation quality'],
  },
  {
    icon: MessageSquareText,
    title: 'Communication Tools',
    points: ['Send activity updates', 'Share schedules', 'Notify participants', 'Support facilitators and organizers'],
  },
  {
    icon: UserCheck,
    title: 'Participant Accounts',
    points: ['User registration', 'Account management', 'Schedule access', 'Player activity records'],
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    points: ['Track participation', 'Monitor activity records', 'Support coaching decisions', 'Review player progress'],
  },
  {
    icon: ShieldCheck,
    title: 'Secure Event Management',
    points: ['Protected records', 'Reliable access', 'Organizer controls', 'Study-ready evaluation data'],
  },
]

const benefits = [
  { title: 'Improves Coordination', text: 'Automated scheduling and communication reduce manual work for community events.' },
  { title: 'Promotes Fair Participation', text: 'Skill-based matching helps balance teams, opponents, and recreational activities.' },
  { title: 'Supports Better Decisions', text: 'Performance tracking and activity analytics give organizers and coaches useful records.' },
]

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: 'easeOut' },
}

function Logo() {
  return (
    <a href={PUBLIC_ROUTES.home} className="flex items-center gap-3" aria-label="SportsHub home">
        <img src={navLogo} alt="SportsHub logo" className="h-10 w-10" />
      <span className="text-lg font-bold text-slate-950">SportsHub</span>
    </a>
  )
}

export default function LandingPage({ authModal }) {
  const navigate = useNavigate()
  const heroSectionRef = useRef(null)

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

    window.location.href = `mailto:organizers@sportshub.local?subject=${subject}&body=${body}`
  }

  // GSAP animations removed; layout handled via CSS and Framer Motion

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f9fc] text-slate-700">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/70 bg-white/90 shadow-sm shadow-slate-900/5 backdrop-blur-xl">
        <nav className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:px-8">
          <Logo />
          <div className="order-3 flex w-full items-center justify-center gap-4 overflow-x-auto text-nowrap border-t border-slate-100 pt-3 sm:gap-6 md:w-auto md:border-t-0 md:pt-0 lg:order-2 lg:gap-8" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="text-sm font-medium text-slate-600 transition hover:text-slate-950">
                {link.label}
              </a>
            ))}
          </div>
          <div className="order-2 flex items-center gap-2 lg:order-3 lg:gap-3">
            <a href={PUBLIC_ROUTES.signIn} className="hidden rounded-full px-4 py-2 text-sm font-semibold text-blue-500 transition hover:bg-slate-100 sm:inline-flex">
              Sign In
            </a>
            <a href={PUBLIC_ROUTES.signUp} className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-white text-sm">
              Join SportsHub <ArrowRight size={16} />
            </a>
          </div>
        </nav>
      </header>

      <main className="pt-[7.25rem] md:pt-16">
       <section
        ref={heroSectionRef}
        id="home"
        className="relative isolate min-h-[calc(100svh-7.25rem)] overflow-hidden px-4 py-12 sm:px-6 sm:py-16 md:min-h-[calc(100svh-4rem)] lg:px-8"
      >
        <div
          className="hero-bg absolute inset-0 -z-20 bg-cover bg-center will-change-transform"
          style={{ backgroundImage: `url(${heroBackground})` }}
          aria-hidden="true"
        />
        <div className="hero-overlay absolute inset-0 -z-10 bg-black/45" aria-hidden="true" />

        <div
          className="mx-auto flex min-h-[calc(100svh-13rem)] max-w-7xl items-center justify-center text-center sm:min-h-[calc(100svh-11rem)]"
        >
          <div className="relative z-10 max-w-4xl">

            <span className="hero-animate inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur">
              <Trophy size={16} /> Smart community sports management
            </span>

            <h1 className="hero-animate mx-auto mt-6 max-w-4xl text-4xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
              SportsHub: A Smarter Way to Manage Community Sports.
            </h1>

            <p className="hero-animate mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-100">
              SportsHub improves the management of community sports and recreational events through automated scheduling, fair player matching, communication tools, and performance tracking.
            </p>

            <div className="hero-animate mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={PUBLIC_ROUTES.signUp}
                className="hero-action inline-flex items-center justify-center gap-2 rounded-full bg-cyan-500 px-6 py-3 font-bold text-slate-950 shadow-xl shadow-cyan-500/25 transition hover:-translate-y-0.5 hover:bg-cyan-400"
              >
                Explore Platform <ArrowRight size={18} />
              </a>

              <a
                href="#about"
                className="hero-action inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 font-bold text-white shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                <Target size={18} /> Learn About SportsHub
              </a>
            </div>

          </div>
        </div>
      </section>

        <section id="features" className="section-band bg-white ">
          <SectionHeading eyebrow="Features" title="Key tools for better community sports management." />
          <div className="mx-auto mt-12 grid max-w-7xl gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon
              return (
                <motion.article {...fadeUp} transition={{ duration: 0.45, delay: index * 0.04 }} key={feature.title} className="feature-card">
                  <div className="icon-tile"><FeatureIcon size={22} /></div>
                  <h3>{feature.title}</h3>
                  <ul>
                    {feature.points.map((point) => (
                      <li key={point}><Check size={16} /> {point}</li>
                    ))}
                  </ul>
                </motion.article>
              )
            })}
          </div>
        </section>

        <section id="about" className="section-band">
          <SectionHeading eyebrow="About SportsHub" title="A study-driven platform for smarter local sports management." />
          <div className="mx-auto mt-8 max-w-4xl px-4 text-center text-lg leading-8 text-slate-600 sm:px-6 lg:px-8">
            SportsHub aims to improve the management of community sports and recreational events through technology. By automating scheduling, player matching, and performance tracking, the platform enhances coordination, fairness, and participation in local sports programs.
          </div>
          <div className="mx-auto mt-10 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
            {benefits.map((benefit) => (
              <motion.article {...fadeUp} key={benefit.title} className="benefit-card">
                <ShieldCheck size={26} />
                <h3>{benefit.title}</h3>
                <p>{benefit.text}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="cta" className="flex min-h-[calc(100svh-7.25rem)] items-center bg-slate-950 px-4 py-10 sm:px-6 md:min-h-[calc(100svh-4rem)] lg:px-8">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div {...fadeUp} className="text-center lg:text-left">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-300">Inquiry</p>
              <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
                Ready to make community sports more organized and inclusive?
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300 lg:mx-0">
                Send an inquiry for community events, organizer access, coaching tools, player matching, scheduling support, or SportsHub study details.
              </p>
              <div className="mt-7 grid gap-3 text-left sm:grid-cols-2 lg:max-w-2xl">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
                  <Mail className="text-cyan-300" size={22} />
                  <p className="mt-3 text-sm font-semibold text-white">Email support</p>
                  <p className="mt-1 text-sm text-slate-400">organizers@sportshub.local</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
                  <Phone className="text-cyan-300" size={22} />
                  <p className="mt-3 text-sm font-semibold text-white">Community desk</p>
                  <p className="mt-1 text-sm text-slate-400">Event, team, and role inquiries</p>
                </div>
              </div>
            </motion.div>

            <motion.form {...fadeUp} onSubmit={handleInquirySubmit} className="rounded-[1.75rem] border border-white/10 bg-white p-5 shadow-2xl shadow-cyan-950/30 sm:p-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  Full name
                  <input required className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" type="text" name="name" placeholder="Your name" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  Email
                  <input required className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" type="email" name="email" placeholder="you@example.com" />
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  Role
                  <select required className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" name="role" defaultValue="">
                    <option value="" disabled>Select role</option>
                    <option>Community Organizer</option>
                    <option>Coach</option>
                    <option>Facilitator</option>
                    <option>Player</option>
                    <option>Researcher</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-bold text-slate-700">
                  Inquiry type
                  <select required className="min-h-12 rounded-2xl border border-slate-200 bg-white px-4 text-base font-medium text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" name="type" defaultValue="">
                    <option value="" disabled>Select topic</option>
                    <option>Event scheduling</option>
                    <option>Player matching</option>
                    <option>Performance tracking</option>
                    <option>Organizer access</option>
                    <option>Study reference</option>
                  </select>
                </label>
              </div>
              <label className="mt-4 grid gap-2 text-sm font-bold text-slate-700">
                Message
                <textarea required className="min-h-32 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" name="message" placeholder="Tell us what you need help with." />              </label>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button type="submit" className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-cyan-500 px-6 font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:bg-cyan-400">
                  Send Inquiry <Send size={18} />
                </button>
                <a href={PUBLIC_ROUTES.signUp} className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-slate-200 px-6 font-bold text-slate-700 transition hover:border-cyan-300 hover:text-slate-950">
                  Create Account
                </a>
              </div>
            </motion.form>
          </div>
                  </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <Logo />
          <div className="flex flex-wrap gap-5 text-sm font-medium text-slate-600">
            {['Home', 'Features', 'About', 'CTA'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-slate-950">{item}</a>
            ))}
          </div>
          <div className="flex gap-3">
            {[Share2, Network, PanelsTopLeft].map((SocialIcon, index) => (
              <a key={index} href="#" className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-cyan-300 hover:text-slate-950" aria-label="Social media profile">
                <SocialIcon size={18} />
              </a>
            ))}
          </div>
        </div>
      </footer>
      {authModal ? <AuthModal mode={authModal} onClose={() => navigate(PUBLIC_ROUTES.home)} /> : null}
    </div>
  )
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <motion.div {...fadeUp} className="mx-auto max-w-7xl px-4 text-left sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-600">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">{title}</h2>
      <p className="mt-4 text-lg leading-8 text-slate-600">
        {description}
      </p>
    </motion.div>
  )
}
