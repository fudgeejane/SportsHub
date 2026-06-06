import { useMemo, useState } from 'react'
import { isValidTeamStructure } from '../../constants/teamStructure'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'

function inputClass() {
  return 'min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
}

export default function PlayerProfilePage() {
  const { userProfile } = useAuth()
  const system = useSportsSystem()
  const [form, setForm] = useState({
    displayName: userProfile?.displayName || '',
    age: userProfile?.age || '',
    gender: userProfile?.gender || '',
    contactNumber: userProfile?.contactNumber || '',
    preferredSportId: userProfile?.preferredSportId || '',
    preferredSport: userProfile?.preferredSport || '',
    preferredSportTeamStructure: userProfile?.preferredSportTeamStructure || null,
    skillLevel: userProfile?.skillLevel || '',
  })

  const sports = useMemo(
    () => system.sports.filter((sport) => sport.status === 'ACTIVE' && sport.createdBy && isValidTeamStructure(sport.teamStructure)),
    [system.sports],
  )

  const selectSport = (sportId) => {
    const sport = sports.find((entry) => entry.id === sportId)
    setForm((current) => ({
      ...current,
      preferredSportId: sportId,
      preferredSport: sport?.name || '',
      preferredSportTeamStructure: sport?.teamStructure || null,
    }))
  }

  const submit = async (event) => {
    event.preventDefault()
    await system.updateProfile(form)
  }

  return (
    <section className="grid gap-4">
      {system.error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{system.error}</p> : null}
      {system.loading ? <p className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-700">Loading latest records...</p> : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5">
          <h2 className="text-xl font-black text-slate-950">Settings</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Keep your registration profile complete for team coaches and organizers.</p>
        </div>

        <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Name
            <input required className={inputClass()} value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Age
            <input type="number" min="1" className={inputClass()} value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Gender
            <select className={inputClass()} value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })}>
              <option value="">Select</option>
              <option>Female</option>
              <option>Male</option>
              <option>Prefer not to say</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Contact number
            <input className={inputClass()} value={form.contactNumber} onChange={(event) => setForm({ ...form, contactNumber: event.target.value })} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Preferred sport
            <select
              required
              className={inputClass()}
              value={form.preferredSportId}
              onChange={(event) => selectSport(event.target.value)}
            >
              <option value="">{sports.length ? 'Select sport' : 'No sports available'}</option>
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Skill level
            <select className={inputClass()} value={form.skillLevel} onChange={(event) => setForm({ ...form, skillLevel: event.target.value })}>
              <option value="">Select</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>Competitive</option>
            </select>
          </label>
          <button className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 md:col-span-3">Save Profile</button>
        </form>
      </section>
    </section>
  )
}
