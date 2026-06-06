import { useState } from 'react'
import { ROLES, STATUSES } from '../../contexts/AuthContext'
import { useAuth, useUserManagement } from '../../hooks/useAuth.jsx'
import { useEvents } from '../../hooks/useEvents'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'
import { CirclePlus } from 'lucide-react'

const emptyEvent = { name: '', sportId: '', venue: '', startDate: '', endDate: '', feePerTeam: '', facilitatorId: '', status: 'OPEN' }

function inputClass() {
  return 'min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
}

function pickName(items, id) {
  return items.find((item) => item.id === id)?.name || ''
}

function formatSchedule(item) {
  const start = item.startDate || 'TBA'
  const end = item.endDate || 'TBA'
  if (start === end) return start
  return `${start} — ${end}`
}

export default function OrganizerEventsPage() {
  const { currentUser } = useAuth()
  const { sports } = useSportsSystem()
  const { users } = useUserManagement(currentUser?.uid)
  const events = useEvents()
  const [form, setForm] = useState(emptyEvent)
  const [modalOpen, setModalOpen] = useState(false)
  const facilitators = users.filter((user) => user.role === ROLES.FACILITATOR && user.status === STATUSES.APPROVED)

  const submit = async (event) => {
    event.preventDefault()
    await events.createEvent({
      ...form,
      sportName: pickName(sports, form.sportId),
      facilitatorName: facilitators.find((facilitator) => (facilitator.uid || facilitator.id) === form.facilitatorId)?.displayName || '',
    })
    setForm(emptyEvent)
    setModalOpen(false)
  }

  const openModal = () => {
    setForm(emptyEvent)
    setModalOpen(true)
  }

  return (
    <section className="grid gap-4">
    
      <div className="mb-5 flex items-start justify-between gap-3">
          <div className="">
        <h2 className="mt-2 text-2xl font-bold text-slate-950">Event Management</h2>
        <p className="mt-1 text-slate-600 text-sm max-w-3xl">  Manage sports events, schedules, and event details in one place.</p>
      </div>
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-2  cursor-pointer rounded-lg bg-green-500 hover:bg-green-600 px-4 py-2 !text-sm font-black text-white hover:bg-blue-700"
          >
            <CirclePlus className='h-4 w-4' />
            Add event
          </button>
        </div>

     <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 text-left font-semibold">Event</th>
              <th className="px-6 py-4 text-left font-semibold">Sport</th>
              <th className="px-6 py-4 text-left font-semibold">Venue</th>
              <th className="px-6 py-4 text-left font-semibold">Fee</th>
              <th className="px-6 py-4 text-left font-semibold">Facilitator</th>
              <th className="px-6 py-4 text-left font-semibold">Schedule</th>
              <th className="px-6 py-4 text-left font-semibold">Status</th>
              <th className="px-6 py-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {events.events.map((item) => (
              <tr
                key={item.id}
                className="transition-colors hover:bg-slate-50 text-sm"
              >
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-900">
                    {item.name}
                  </p>
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {item.sportName}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {item.venue || "TBA"}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  PHP {item.feePerTeam || 0}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {item.facilitatorName || 'Unassigned'}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {formatSchedule(item)}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      item.status === "OPEN"
                        ? "bg-emerald-100 text-emerald-700"
                        : item.status === "CLOSED"
                        ? "bg-amber-100 text-amber-700"
                        : item.status === "COMPLETED"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <select
                    className="w-full max-w-[180px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none"
                    value={item.status}
                    onChange={(e) =>
                      events.updateEvent(item.id, {
                        status: e.target.value,
                      })
                    }
                  >
                    <option>OPEN</option>
                    <option>CLOSED</option>
                    <option>COMPLETED</option>
                    <option>ARCHIVED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!events.events.length && (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm font-medium text-slate-500">
              No events yet.
            </p>
          </div>
        )}
      </div>
    </section>

      {/* Create Event Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-black text-slate-950">Create event</h2>

            <form className="mt-5 grid gap-3" onSubmit={submit}>
              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Event name
                <input required className={inputClass()} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Summer Basketball Tournament" />
              </label>

              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Sport
                <select required className={inputClass()} value={form.sportId} onChange={(e) => setForm({ ...form, sportId: e.target.value })}>
                  <option value="">Select sport</option>
                  {sports
                    .filter((sport) => sport.status !== 'ARCHIVED')
                    .map((sport) => (
                      <option key={sport.id} value={sport.id}>
                        {sport.name}
                      </option>
                    ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Venue
                <input className={inputClass()} value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="City Basketball Court" />
              </label>

              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Fee per team
                <input type="number" min="0" required className={inputClass()} value={form.feePerTeam} onChange={(e) => setForm({ ...form, feePerTeam: e.target.value })} placeholder="1500" />
              </label>

              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Assigned facilitator
                <select required className={inputClass()} value={form.facilitatorId} onChange={(e) => setForm({ ...form, facilitatorId: e.target.value })}>
                  <option value="">Select facilitator</option>
                  {facilitators.map((facilitator) => (
                    <option key={facilitator.uid || facilitator.id} value={facilitator.uid || facilitator.id}>
                      {facilitator.displayName}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  Start date
                  <input type="date" required className={inputClass()} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </label>

                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  End date
                  <input type="date" required className={inputClass()} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700">
                  Create event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
