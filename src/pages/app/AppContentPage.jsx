import AppLayout from '../../components/layout/AppLayout'

const pageCopy = {
  '/projects': {
    title: 'Projects',
    description: 'View and manage sports projects according to your role permissions.',
    cards: ['Assigned sports projects', 'Community event records', 'Project monitoring'],
  },
  '/tasks': {
    title: 'Tasks',
    description: 'Track assignments, edit allowed tasks, and coordinate progress.',
    cards: ['Assigned tasks', 'Task status', 'Progress updates'],
  },
  '/updates': {
    title: 'Submit Updates',
    description: 'Submit participation updates and progress notes for assigned activities.',
    cards: ['Progress submission', 'Recent updates', 'Activity notes'],
  },
  '/notifications': {
    title: 'Notifications',
    description: 'View important event, schedule, task, and announcement notifications.',
    cards: ['Schedule alerts', 'Task reminders', 'Organizer announcements'],
  },
  '/teams': {
    title: 'Teams',
    description: 'Create, review, and coordinate teams based on your role access.',
    cards: ['Team rosters', 'Coach assignments', 'Player groups'],
  },
  '/progress': {
    title: 'Progress',
    description: 'Review sports activity progress dashboards and feedback.',
    cards: ['Completion trends', 'Player progress', 'Coach feedback'],
  },
  '/feedback': {
    title: 'Feedback',
    description: 'Comment on task output and provide guidance to players.',
    cards: ['Task comments', 'Player feedback', 'Coaching notes'],
  },
  '/analytics': {
    title: 'Analytics',
    description: 'View project analytics, participation trends, and performance records.',
    cards: ['Participation analytics', 'Project insights', 'Performance reports'],
  },
  '/schedule': {
    title: 'Scheduling',
    description: 'Oversee sports event schedules, calendars, and workflow timing.',
    cards: ['Event calendar', 'Game schedules', 'Workflow timeline'],
  },
  '/workflows': {
    title: 'Workflows',
    description: 'Monitor planning workflows and operational stages for sports events.',
    cards: ['Event workflow', 'Task pipeline', 'Coordination stages'],
  },
  '/users': {
    title: 'Users & Roles',
    description: 'Manage users, roles, approvals, and account access.',
    cards: ['User approvals', 'Role management', 'Access review'],
  },
  '/facilitators': {
    title: 'Facilitator Accounts',
    description: 'Seed and manage facilitator accounts for project monitoring support.',
    cards: ['Seed accounts', 'Facilitator assignments', 'Limited access review'],
  },
  '/settings': {
    title: 'Settings',
    description: 'Configure system preferences and administrative controls.',
    cards: ['System settings', 'Security controls', 'Account preferences'],
  },
}

export default function AppContentPage({ path }) {
  const content = pageCopy[path] || {
    title: 'Workspace',
    description: 'SportsHub role-based workspace.',
    cards: ['Overview', 'Activity', 'Records'],
  }

  return (
    <AppLayout title={content.title}>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-600">Role-based access</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-950">{content.title}</h2>
        <p className="mt-2 max-w-3xl text-slate-600">{content.description}</p>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {content.cards.map((card) => (
          <article key={card} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
            <h3 className="font-bold text-slate-950">{card}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This area is visible only to roles that are allowed to access this route.
            </p>
          </article>
        ))}
      </div>
    </AppLayout>
  )
}
