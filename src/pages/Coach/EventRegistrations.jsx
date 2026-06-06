import { useState } from 'react'
import { CalendarPlus, Pencil, Trash2, X } from 'lucide-react'
import { PAYMENT_METHOD_LABELS, PAYMENT_METHODS } from '../../constants/registration'
import { useAuth } from '../../hooks/useAuth.jsx'
import { usePayment } from '../../hooks/usePayment'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'

const emptyRegistration = {
  teamId: '',
  eventId: '',
  status: 'PENDING',
  paymentMethod: PAYMENT_METHODS.GCASH,
  paymentProof: '',
}

const registrationStatuses = ['PENDING', 'CANCELLED']

function inputClass() {
  return 'min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
}

export default function CoachEventRegistrationsPage() {
  const { currentUser, userProfile } = useAuth()
  const system = useSportsSystem()
  const payment = usePayment()
  const [form, setForm] = useState(emptyRegistration)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRegistration, setEditingRegistration] = useState(null)

  const myTeams = system.teams.filter((team) => team.coachId === currentUser.uid && team.status === 'ACTIVE')
  const selectedTeam = myTeams.find((team) => team.id === form.teamId)
  const selectedEvent = system.events.find((event) => event.id === form.eventId)
  const availableEvents = system.events.filter(
    (event) => event.status === 'OPEN' && (!selectedTeam?.sportId || event.sportId === selectedTeam.sportId),
  )
  const registrations = payment.payments.filter((entry) => entry.coachId === currentUser.uid && entry.status !== 'CANCELLED')

  const closeModal = () => {
    setModalOpen(false)
    setEditingRegistration(null)
    setForm(emptyRegistration)
  }

  const openCreateModal = () => {
    setEditingRegistration(null)
    setForm(emptyRegistration)
    setModalOpen(true)
  }

  const openEditModal = (registration) => {
    setEditingRegistration(registration)
    setForm({
      teamId: registration.teamId || '',
      eventId: registration.eventId || '',
      status: registration.status || 'PENDING',
      paymentMethod: registration.paymentMethod || PAYMENT_METHODS.GCASH,
      paymentProof: registration.paymentProof || '',
    })
    setModalOpen(true)
  }

  const submit = async (event) => {
    event.preventDefault()
    const payload = {
      ...form,
      teamName: selectedTeam?.name || '',
      name: selectedTeam?.name || '',
      sportId: selectedTeam?.sportId || '',
      sportName: selectedTeam?.sportName || '',
      eventName: selectedEvent?.name || '',
      eventFacilitatorId: selectedEvent?.facilitatorId || '',
      fee: selectedEvent?.feePerTeam || 0,
      coachName: userProfile?.displayName,
    }

    if (editingRegistration?.id) {
      await system.updateEventRegistration(editingRegistration, payload)
    } else {
      await system.registerTeamForEvent(payload)
    }
    closeModal()
  }

  return (
    <section className="grid gap-4">


      <section>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-950">Event Registrations</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Register existing teams into organizer-created events and submit payment proof.</p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg cursor-pointer bg-green-500 hover:bg-green-600 px-4 py-2 !text-sm font-black text-white transition hover:bg-blue-700"
          >
            <CalendarPlus className="h-4 w-4" />
            Register team
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {registrations.map((registration) => (
            <article key={registration.id} className="rounded-2xl border bg-white border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-950">{registration.teamName}</h3>
                  <p className="mt-1 text-sm text-slate-600">{registration.eventName}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">Sport: {registration.sportName}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700">Registration: {registration.status || 'PENDING'}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-700 capitalize">Payment: {registration.paymentStatus || 'pending'} (PHP {registration.amount || 0})</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(registration)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                    aria-label={`Edit registration for ${registration.teamName}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => system.removeEventRegistration(registration)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                    aria-label={`Remove registration for ${registration.teamName}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
          {!registrations.length ? <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No event registrations yet.</p> : null}
        </div>
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-slate-950">{editingRegistration ? 'Edit registration' : 'Register team for event'}</h3>
                <p className="mt-1 text-sm text-slate-600">Choose one of your created teams, then submit event payment details.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                aria-label="Close registration modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submit} className="mt-5 grid gap-3">
              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Team
                <select required className={inputClass()} value={form.teamId} onChange={(event) => setForm({ ...form, teamId: event.target.value, eventId: '' })}>
                  <option value="">Select team</option>
                  {myTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} - {team.sportName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Event
                <select required className={inputClass()} value={form.eventId} onChange={(event) => setForm({ ...form, eventId: event.target.value })}>
                  <option value="">{form.teamId ? 'Select event' : 'Select a team first'}</option>
                  {availableEvents.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name} - PHP {event.feePerTeam || 0}
                    </option>
                  ))}
                </select>
              </label>


              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Payment method
                <select required className={inputClass()} value={form.paymentMethod} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-bold text-slate-700">
                Payment proof / reference
                <input required className={inputClass()} value={form.paymentProof} onChange={(event) => setForm({ ...form, paymentProof: event.target.value })} placeholder="Receipt URL, reference number, or cash note" />
              </label>

              <div className="flex gap-2 pt-3">
                <button type="button" onClick={closeModal} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700">
                  {editingRegistration ? 'Save changes' : 'Register team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}
