import { useMemo, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { ROLES } from '../../contexts/AuthContext'
import { useAuth } from '../../hooks/useAuth.jsx'
import { JOIN_REQUEST_STATUS, useSportsSystem } from '../../hooks/useSportsSystem.jsx'

const emptySport = { name: '', description: '' }
const emptyEvent = { name: '', sportId: '', venue: '', eventDate: '', status: 'OPEN' }
const emptyStructure = {
  sportId: '',
  eventId: '',
  minTeams: 2,
  maxTeams: 4,
  minPlayersPerTeam: 5,
  maxPlayersPerTeam: 12,
  registrationType: 'PLAYER_REQUEST',
}
const emptyTeam = { name: '', sportId: '', eventId: '', minPlayers: 5, maxPlayers: 12, registrationType: 'PLAYER_REQUEST' }

function titleFromPath(path) {
  const labels = {
    '/sports': 'Sports Management',
    '/events': 'Event Management',
    '/team-structures': 'Team Structure Setup',
    '/teams': 'Teams',
    '/registrations': 'Registrations',
    '/profile': 'Player Profile',
    '/users': 'Users & Roles',
    '/facilitators': 'Facilitator Accounts',
    '/analytics': 'Sports Analytics',
    '/schedule': 'Scheduling',
    '/settings': 'Settings',
  }
  return labels[path] || 'SportsHub'
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1 text-sm font-bold text-slate-700">
      {label}
      {children}
    </label>
  )
}

function inputClass() {
  return 'min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
}

function Panel({ title, description, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
      <div className="mb-5">
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

function EmptyState({ text }) {
  return <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">{text}</p>
}

function StatusMessage({ error, loading }) {
  return (
    <>
      {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p> : null}
      {loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading latest records...</p> : null}
    </>
  )
}

function pickName(items, id) {
  return items.find((item) => item.id === id)?.name || ''
}

function OrganizerSports({ system }) {
  const [form, setForm] = useState(emptySport)
  const [editingId, setEditingId] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    if (editingId) {
      await system.updateSport(editingId, form)
    } else {
      await system.createSport(form)
    }
    setForm(emptySport)
    setEditingId('')
  }

  return (
    <Panel title="Sports Management" description="Create, edit, and archive sports used by SportsHub events and teams.">
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-[1fr_1.4fr_auto]">
        <Field label="Sport name">
          <input required className={inputClass()} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </Field>
        <Field label="Description">
          <input className={inputClass()} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </Field>
        <button className="self-end rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700">
          {editingId ? 'Update' : 'Create'}
        </button>
      </form>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {system.sports.length ? (
          system.sports.map((sport) => (
            <article key={sport.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-950">{sport.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{sport.description || 'No description added.'}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{sport.status}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold" onClick={() => { setEditingId(sport.id); setForm({ name: sport.name, description: sport.description || '' }) }}>
                  Edit
                </button>
                <button className="rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-600" onClick={() => system.archiveSport(sport.id)}>
                  Archive
                </button>
              </div>
            </article>
          ))
        ) : (
          <EmptyState text="No sports yet. Create the first sport to start building events." />
        )}
      </div>
    </Panel>
  )
}

function OrganizerEvents({ system }) {
  const [form, setForm] = useState(emptyEvent)

  const submit = async (event) => {
    event.preventDefault()
    await system.createEvent({ ...form, sportName: pickName(system.sports, form.sportId) })
    setForm(emptyEvent)
  }

  return (
    <Panel title="Event Management" description="Create and manage sports events linked to active sports.">
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-5">
        <Field label="Event name">
          <input required className={inputClass()} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </Field>
        <Field label="Sport">
          <select required className={inputClass()} value={form.sportId} onChange={(event) => setForm({ ...form, sportId: event.target.value })}>
            <option value="">Select sport</option>
            {system.sports.filter((sport) => sport.status !== 'ARCHIVED').map((sport) => <option key={sport.id} value={sport.id}>{sport.name}</option>)}
          </select>
        </Field>
        <Field label="Venue">
          <input className={inputClass()} value={form.venue} onChange={(event) => setForm({ ...form, venue: event.target.value })} />
        </Field>
        <Field label="Date">
          <input type="date" className={inputClass()} value={form.eventDate} onChange={(event) => setForm({ ...form, eventDate: event.target.value })} />
        </Field>
        <button className="self-end rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700">Create</button>
      </form>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
            <tr><th className="px-4 py-3">Event</th><th className="px-4 py-3">Sport</th><th className="px-4 py-3">Venue</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {system.events.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-bold text-slate-950">{item.name}</td>
                <td className="px-4 py-3">{item.sportName}</td>
                <td className="px-4 py-3">{item.venue || 'TBA'}</td>
                <td className="px-4 py-3">{item.eventDate || 'TBA'}</td>
                <td className="px-4 py-3">{item.status}</td>
                <td className="px-4 py-3">
                  <select className={inputClass()} value={item.status} onChange={(event) => system.updateEvent(item.id, { status: event.target.value })}>
                    <option>OPEN</option><option>CLOSED</option><option>COMPLETED</option><option>ARCHIVED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!system.events.length ? <EmptyState text="No events yet." /> : null}
      </div>
    </Panel>
  )
}

function TeamStructureSetup({ system }) {
  const [form, setForm] = useState(emptyStructure)

  const submit = async (event) => {
    event.preventDefault()
    await system.saveTeamStructure({
      ...form,
      sportName: pickName(system.sports, form.sportId),
      eventName: pickName(system.events, form.eventId),
    })
    setForm(emptyStructure)
  }

  return (
    <Panel title="Team Structure Setup" description="Define max/min teams, roster size, and registration type for events.">
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
        <Field label="Sport">
          <select required className={inputClass()} value={form.sportId} onChange={(event) => setForm({ ...form, sportId: event.target.value })}>
            <option value="">Select sport</option>
            {system.sports.map((sport) => <option key={sport.id} value={sport.id}>{sport.name}</option>)}
          </select>
        </Field>
        <Field label="Event">
          <select required className={inputClass()} value={form.eventId} onChange={(event) => setForm({ ...form, eventId: event.target.value })}>
            <option value="">Select event</option>
            {system.events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}
          </select>
        </Field>
        {['minTeams', 'maxTeams', 'minPlayersPerTeam', 'maxPlayersPerTeam'].map((field) => (
          <Field key={field} label={field.replace(/([A-Z])/g, ' $1')}>
            <input type="number" min="1" className={inputClass()} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} />
          </Field>
        ))}
        <Field label="Registration">
          <select className={inputClass()} value={form.registrationType} onChange={(event) => setForm({ ...form, registrationType: event.target.value })}>
            <option value="PLAYER_REQUEST">Player requests coach approval</option>
            <option value="ORGANIZER_ASSIGN">Organizer assigns teams</option>
            <option value="OPEN">Open registration</option>
          </select>
        </Field>
        <button className="self-end rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700">Save</button>
      </form>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {system.structures.map((structure) => (
          <article key={structure.id} className="rounded-2xl border border-slate-200 p-4 text-sm">
            <h3 className="font-black text-slate-950">{structure.eventName}</h3>
            <p className="mt-1 text-slate-600">{structure.sportName}</p>
            <p className="mt-3 font-semibold text-slate-700">Teams: {structure.minTeams}-{structure.maxTeams} | Players: {structure.minPlayersPerTeam}-{structure.maxPlayersPerTeam}</p>
            <p className="mt-1 text-slate-500">{structure.registrationType}</p>
          </article>
        ))}
        {!system.structures.length ? <EmptyState text="No team structures configured yet." /> : null}
      </div>
    </Panel>
  )
}

function TeamsMonitor({ system, coachOnly = false }) {
  const { currentUser, userProfile } = useAuth()
  const [form, setForm] = useState(emptyTeam)
  const visibleTeams = coachOnly ? system.teams.filter((team) => team.coachId === currentUser.uid) : system.teams

  const submit = async (event) => {
    event.preventDefault()
    await system.createTeam({
      ...form,
      sportName: pickName(system.sports, form.sportId),
      eventName: pickName(system.events, form.eventId),
      coachName: userProfile?.displayName,
    })
    setForm(emptyTeam)
  }

  return (
    <Panel title={coachOnly ? 'My Teams' : 'Teams, Rosters, and Coaches'} description={coachOnly ? 'Create and manage your own teams.' : 'Monitor teams, rosters, coaches, and player registrations.'}>
      {coachOnly ? (
        <form onSubmit={submit} className="mb-5 grid gap-3 md:grid-cols-6">
          <Field label="Team name"><input required className={inputClass()} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
          <Field label="Sport"><select required className={inputClass()} value={form.sportId} onChange={(event) => setForm({ ...form, sportId: event.target.value })}><option value="">Select</option>{system.sports.map((sport) => <option key={sport.id} value={sport.id}>{sport.name}</option>)}</select></Field>
          <Field label="Event"><select required className={inputClass()} value={form.eventId} onChange={(event) => setForm({ ...form, eventId: event.target.value })}><option value="">Select</option>{system.events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</select></Field>
          <Field label="Min players"><input type="number" className={inputClass()} value={form.minPlayers} onChange={(event) => setForm({ ...form, minPlayers: event.target.value })} /></Field>
          <Field label="Max players"><input type="number" className={inputClass()} value={form.maxPlayers} onChange={(event) => setForm({ ...form, maxPlayers: event.target.value })} /></Field>
          <button className="self-end rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700">Create</button>
        </form>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {visibleTeams.map((team) => {
          const roster = system.members.filter((member) => member.teamId === team.id)
          return (
            <article key={team.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-950">{team.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{team.sportName} | {team.eventName}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">Coach: {team.coachName}</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{roster.length}/{team.maxPlayers}</span>
              </div>
              <div className="mt-4 grid gap-2">
                {roster.length ? roster.map((member) => <p key={member.id} className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold">{member.playerName} <span className="text-slate-400">({member.playerEmail})</span></p>) : <p className="text-sm font-semibold text-slate-500">No players yet.</p>}
              </div>
            </article>
          )
        })}
        {!visibleTeams.length ? <EmptyState text="No teams found." /> : null}
      </div>
    </Panel>
  )
}

function JoinRequests({ system, coachOnly = false, playerOnly = false }) {
  const { currentUser } = useAuth()
  const requests = system.requests.filter((request) => {
    if (coachOnly) return request.coachId === currentUser.uid
    if (playerOnly) return request.playerId === currentUser.uid
    return true
  })

  return (
    <Panel title="Player Join Requests" description="Review registration requests and roster outcomes.">
      <div className="grid gap-3">
        {requests.map((request) => (
          <article key={request.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-black text-slate-950">{request.playerName} to {request.teamName}</h3>
                <p className="mt-1 text-sm text-slate-600">{request.sportName} | {request.eventName}</p>
                {request.message ? <p className="mt-2 text-sm text-slate-500">{request.message}</p> : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{request.status}</span>
                {coachOnly && request.status === JOIN_REQUEST_STATUS.PENDING ? (
                  <>
                    <button onClick={() => system.acceptJoinRequest(request)} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-black text-white">Accept</button>
                    <button onClick={() => system.rejectJoinRequest(request.id)} className="rounded-xl border border-red-200 px-3 py-2 text-sm font-black text-red-600">Reject</button>
                  </>
                ) : null}
              </div>
            </div>
          </article>
        ))}
        {!requests.length ? <EmptyState text="No join requests found." /> : null}
      </div>
    </Panel>
  )
}

function PlayerProfile({ system }) {
  const { userProfile } = useAuth()
  const [form, setForm] = useState({
    displayName: userProfile?.displayName || '',
    age: userProfile?.age || '',
    gender: userProfile?.gender || '',
    contactNumber: userProfile?.contactNumber || '',
    preferredSport: userProfile?.preferredSport || '',
    skillLevel: userProfile?.skillLevel || '',
  })

  const submit = async (event) => {
    event.preventDefault()
    await system.updateProfile(form)
  }

  return (
    <Panel title="Player Profile" description="Keep your registration profile complete for team coaches and organizers.">
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
        <Field label="Name"><input required className={inputClass()} value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} /></Field>
        <Field label="Age"><input type="number" min="1" className={inputClass()} value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} /></Field>
        <Field label="Gender"><select className={inputClass()} value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })}><option value="">Select</option><option>Female</option><option>Male</option><option>Prefer not to say</option></select></Field>
        <Field label="Contact number"><input className={inputClass()} value={form.contactNumber} onChange={(event) => setForm({ ...form, contactNumber: event.target.value })} /></Field>
        <Field label="Preferred sport"><input className={inputClass()} value={form.preferredSport} onChange={(event) => setForm({ ...form, preferredSport: event.target.value })} /></Field>
        <Field label="Skill level"><select className={inputClass()} value={form.skillLevel} onChange={(event) => setForm({ ...form, skillLevel: event.target.value })}><option value="">Select</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Competitive</option></select></Field>
        <button className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 md:col-span-3">Save Profile</button>
      </form>
    </Panel>
  )
}

function PlayerTeams({ system }) {
  const [messages, setMessages] = useState({})

  return (
    <Panel title="Browse Teams" description="Find teams and submit join requests for coach approval.">
      <div className="grid gap-4 lg:grid-cols-2">
        {system.teams.filter((team) => team.status === 'ACTIVE').map((team) => {
          const roster = system.members.filter((member) => member.teamId === team.id)
          return (
            <article key={team.id} className="rounded-2xl border border-slate-200 p-4">
              <h3 className="font-black text-slate-950">{team.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{team.sportName} | {team.eventName}</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">Coach: {team.coachName}</p>
              <p className="mt-2 text-sm text-slate-500">Roster: {roster.length}/{team.maxPlayers}</p>
              <textarea className={`${inputClass()} mt-4 min-h-20 w-full py-3`} placeholder="Optional message to coach" value={messages[team.id] || ''} onChange={(event) => setMessages({ ...messages, [team.id]: event.target.value })} />
              <button onClick={() => system.createJoinRequest(team, messages[team.id] || '')} className="mt-3 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white hover:bg-blue-700">Request to Join</button>
            </article>
          )
        })}
        {!system.teams.length ? <EmptyState text="No teams are available yet." /> : null}
      </div>
    </Panel>
  )
}

function FacilitatorStatic({ path }) {
  return (
    <Panel title={titleFromPath(path)} description="Facilitator pages are static monitoring screens for this version.">
      <div className="grid gap-4 md:grid-cols-3">
        {['Schedule visibility', 'Participant coordination', 'Activity monitoring'].map((item) => (
          <article key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="font-black text-slate-950">{item}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Read-only operational view for facilitator workflows.</p>
          </article>
        ))}
      </div>
    </Panel>
  )
}

export default function AppContentPage({ path }) {
  const { userProfile } = useAuth()
  const system = useSportsSystem()
  const role = userProfile?.role
  const isOrganizer = role === ROLES.COMMUNITY_ORGANIZER || role === ROLES.ADMIN
  const isCoach = role === ROLES.COACH
  const isPlayer = role === ROLES.PLAYER
  const isFacilitator = role === ROLES.FACILITATOR

  const content = useMemo(() => {
    if (isFacilitator) return <FacilitatorStatic path={path} />
    if (isOrganizer && path === '/sports') return <OrganizerSports system={system} />
    if (isOrganizer && path === '/events') return <OrganizerEvents system={system} />
    if (isOrganizer && path === '/team-structures') return <TeamStructureSetup system={system} />
    if (isOrganizer && path === '/teams') return <TeamsMonitor system={system} />
    if (isOrganizer && path === '/registrations') return <JoinRequests system={system} />
    if (isCoach && path === '/teams') return <TeamsMonitor system={system} coachOnly />
    if (isCoach && path === '/registrations') return <JoinRequests system={system} coachOnly />
    if (isPlayer && path === '/profile') return <PlayerProfile system={system} />
    if (isPlayer && path === '/teams') return <PlayerTeams system={system} />
    if (isPlayer && path === '/registrations') return <JoinRequests system={system} playerOnly />
    return <Panel title={titleFromPath(path)} description="This SportsHub workspace uses live Firestore data where applicable."><EmptyState text="Select a sports management workflow from the sidebar." /></Panel>
  }, [isCoach, isFacilitator, isOrganizer, isPlayer, path, system])

  return (
    <AppLayout title={titleFromPath(path)}>
      <div className="grid gap-4">
        <StatusMessage error={system.error} loading={system.loading} />
        {content}
      </div>
    </AppLayout>
  )
}
