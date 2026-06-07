import { useState } from 'react'
import { BookOpenText, FileText, Shield } from 'lucide-react'

const resources = [
  {
    title: 'Terms of Service',
    icon: FileText,
    sections: [
      {
        heading: 'Account Responsibilities',
        body: 'Users are responsible for keeping their SportsHub account details accurate and secure. Role-based access is provided to support community sports operations.',
      },
      {
        heading: 'Acceptable Use',
        body: 'SportsHub should be used for legitimate team coordination, event management, payment tracking, registrations, and related community sports activities.',
      },
      {
        heading: 'Future Updates',
        body: 'These sample terms are structured for replacement with final legal content before production rollout.',
      },
    ],
  },
  {
    title: 'Privacy Policy',
    icon: Shield,
    sections: [
      {
        heading: 'Data We Collect',
        body: 'SportsHub may store account details, role information, team membership records, event registrations, payment status, and support requests.',
      },
      {
        heading: 'How Data Is Used',
        body: 'Information is used to authenticate users, coordinate teams, manage approvals, prepare schedules, and support organizer operations.',
      },
      {
        heading: 'User Control',
        body: 'Profile and security pages are prepared so users can review and update account details as live Firestore integration expands.',
      },
    ],
  },
  {
    title: 'System Guide',
    icon: BookOpenText,
    sections: [
      {
        heading: 'Organizer',
        body: 'Organizers manage users, sports, events, teams, schedules, registrations, and analytics from the dashboard navigation.',
      },
      {
        heading: 'Coach',
        body: 'Coaches manage teams, review join requests, track schedules, and submit event registrations for assigned teams.',
      },
      {
        heading: 'Facilitator and Player',
        body: 'Facilitators support payments and schedule operations. Players can review teams, schedules, requests, and account information.',
      },
    ],
  },
]

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState(resources[0].title)
  const activeResource = resources.find((resource) => resource.title === activeTab) || resources[0]
  const ActiveIcon = activeResource.icon

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm font-bold uppercase tracking-wide text-blue-600">Resources</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">SportsHub policies and guide</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Reference content for all authenticated SportsHub roles. The sections below use placeholder copy and are ready for future content management.
        </p>
      </section>

      <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm md:grid-cols-3">
        {resources.map((resource) => {
          const Icon = resource.icon
          return (
            <button
              key={resource.title}
              type="button"
              onClick={() => setActiveTab(resource.title)}
              className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${
                activeTab === resource.title ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <Icon className="h-4 w-4" />
              {resource.title}
            </button>
          )
        })}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <ActiveIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-950">{activeResource.title}</h2>
            <p className="mt-1 text-sm text-slate-600">Sample content organized for simple future updates.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {activeResource.sections.map((section) => (
            <article key={section.heading} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-bold text-slate-950">{section.heading}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
