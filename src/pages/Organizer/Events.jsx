import { useEffect, useMemo, useState } from 'react'
import { ROLES, STATUSES } from '../../contexts/AuthContext'
import { useAuth, useUserManagement } from '../../hooks/useAuth'
import { useEvents } from '../../hooks/useEventManagement'
import { useSportManagement } from '../../hooks/useSportManagement'
import { CirclePlus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { formatDate } from '../../utils/dateFormat'
import { toastSuccess, toastError } from '../../utils/toast'

const emptyEvent = { id: '', name: '', sportId: '', startDate: '', endDate: '', feePerTeam: '', facilitatorId: '', status: 'OPEN' }
const PAGE_SIZE = 10

function inputClass() {
  return 'px-4 py-2 border rounded-lg border-slate-200 bg-gray-50 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
}

function pickName(items, id) {
  return items.find((item) => item.id === id)?.name || ''
}

function formatSchedule(item) {
  const start = formatDate(item.startDate) || 'TBA'
  const end = formatDate(item.endDate) || 'TBA'
  if (start === end || !item.endDate) return start
  return `${start} to ${end}`
}

function getScheduleState(item) {
  const now = Date.now()
  const start = item.startDate ? new Date(item.startDate).getTime() : null
  const end = item.endDate ? new Date(item.endDate).getTime() : start
  if (!start) return 'UNKNOWN'
  if (start <= now && now <= end) return 'ACTIVE'
  if (now < start) return 'UPCOMING'
  return 'PAST'
}

function compareEventsBySchedule(a, b) {
  const now = Date.now()
  const aStart = a.startDate ? new Date(a.startDate).getTime() : Infinity
  const bStart = b.startDate ? new Date(b.startDate).getTime() : Infinity
  const aEnd = a.endDate ? new Date(a.endDate).getTime() : aStart
  const bEnd = b.endDate ? new Date(b.endDate).getTime() : bStart

  const aPast = aEnd < now
  const bPast = bEnd < now

  if (aPast !== bPast) {
    return aPast ? 1 : -1
  }

  return aStart - bStart
}

export default function OrganizerEventsPage() {
  const { currentUser } = useAuth()
  const { sports } = useSportManagement()
  const { users } = useUserManagement(currentUser?.uid)
  const events = useEvents()
  const [form, setForm] = useState(emptyEvent)
  const [modalOpen, setModalOpen] = useState(false)
  const [deletingEvent, setDeletingEvent] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('schedule')
  const [sortDir, setSortDir] = useState('asc')
  const [pageIndex, setPageIndex] = useState(0)

  const normalizedSearch = searchQuery.trim().toLowerCase()

  const filteredEvents = useMemo(() => {
    if (!normalizedSearch) return events.events
    return events.events.filter((item) => {
      const searchTarget = [item.name, item.sportName, item.facilitatorName, item.status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return searchTarget.includes(normalizedSearch)
    })
  }, [events.events, normalizedSearch])

  const sortedEvents = useMemo(() => {
    const results = filteredEvents.slice()
    results.sort((a, b) => {
      if (sortBy === 'schedule') {
        const order = compareEventsBySchedule(a, b)
        return sortDir === 'asc' ? order : -order
      }

      const aValue = sortBy === 'fee' ? Number(a.feePerTeam || 0) : (a[sortBy] || '').toString().toLowerCase()
      const bValue = sortBy === 'fee' ? Number(b.feePerTeam || 0) : (b[sortBy] || '').toString().toLowerCase()
      if (aValue < bValue) return sortDir === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return results
  }, [filteredEvents, sortBy, sortDir])

  const visibleEvents = useMemo(
    () => sortedEvents.slice(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE),
    [sortedEvents, pageIndex],
  )

  useEffect(() => {
    setPageIndex(0)
  }, [searchQuery, sortBy, sortDir])

  const pageCount = Math.max(1, Math.ceil(sortedEvents.length / PAGE_SIZE))
  const showingFrom = sortedEvents.length ? pageIndex * PAGE_SIZE + 1 : 0
  const showingTo = Math.min(sortedEvents.length, (pageIndex + 1) * PAGE_SIZE)

  const facilitators = users.filter((user) => user.role === ROLES.FACILITATOR && user.status === STATUSES.APPROVED)

  const submit = async (e) => {
    e.preventDefault()
    try {
      if (form.id) {
        await events.updateEvent(form.id, {
          name: form.name,
          sportId: form.sportId,
          sportName: pickName(sports, form.sportId),
          feePerTeam: Number(form.feePerTeam) || 0,
          facilitatorId: form.facilitatorId,
          facilitatorName: facilitators.find((f) => (f.uid || f.id) === form.facilitatorId)?.displayName || '',
          startDate: form.startDate,
          endDate: form.endDate,
          status: form.status || 'OPEN',
        })
        toastSuccess('Event updated.')
      } else {
        await events.createEvent({
          name: form.name,
          sportId: form.sportId,
          sportName: pickName(sports, form.sportId),
          feePerTeam: Number(form.feePerTeam) || 0,
          facilitatorId: form.facilitatorId,
          facilitatorName: facilitators.find((f) => (f.uid || f.id) === form.facilitatorId)?.displayName || '',
          startDate: form.startDate,
          endDate: form.endDate,
          status: form.status || 'OPEN',
        })
        toastSuccess('Event created.')
      }
      setForm(emptyEvent)
      setModalOpen(false)
    } catch (err) {
      toastError(err.message || 'Failed to save event.')
    }
  }

  const openCreate = () => {
    setForm(emptyEvent)
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setForm({
      id: item.id,
      name: item.name || '',
      sportId: item.sportId || '',
      feePerTeam: item.feePerTeam || '',
      facilitatorId: item.facilitatorId || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      status: item.status || 'OPEN',
    })
    setModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingEvent) return
    try {
      await events.deleteEvent(deletingEvent.id)
      toastSuccess('Event and related data deleted.')
      setDeletingEvent(null)
    } catch (err) {
      toastError(err.message || 'Failed to delete event.')
    }
  }

  return (
    <section className="space-y-4">

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Event Management</h2>
          <p className="mt-1 text-slate-600 text-sm max-w-3xl">Manage sports events, schedules, and event details in one place.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 cursor-pointer rounded-lg bg-green-500 hover:bg-green-600 px-4 py-2 !text-sm font-black text-white">
          <CirclePlus className='h-4 w-4' />
          Add event
        </button>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200  px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events, sport, facilitator, or status"
              className="w-full rounded-lg border border-slate-200 bg-white pl-11 pr-4 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
          <div className="flex items-center gap-2 ">
            <p className="text-xs text-slate-600">
                Showing {showingFrom} - {showingTo} of {sortedEvents.length}
              </p>
              <div className="inline-flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setPageIndex((current) => Math.max(current - 1, 0))}
                    disabled={pageIndex === 0}
                    className="rounded-xl border border-slate-200 bg-white p-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => setPageIndex((current) => Math.min(current + 1, pageCount - 1))}
                    disabled={pageIndex >= pageCount - 1}
                    className="rounded-xl border border-slate-200 bg-white p-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 border-b border-slate-200 text-blue-700">
                <th className="px-6 py-4 text-left font-semibold text-xs uppercase w-[30%]">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('name')
                      setSortDir(sortBy === 'name' && sortDir === 'asc' ? 'desc' : 'asc')
                    }}
                    className="inline-flex items-center gap-2 text-xs uppercase"
                  >
                    Event
                    {sortBy === 'name' ? (
                      sortDir === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4 opacity-40" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left font-semibold text-xs uppercase w-[10%]">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('fee')
                      setSortDir(sortBy === 'fee' && sortDir === 'asc' ? 'desc' : 'asc')
                    }}
                    className="inline-flex items-center gap-2 text-xs uppercase"
                  >
                    Fee
                    {sortBy === 'fee' ? (
                      sortDir === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4 opacity-40" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left font-semibold text-xs uppercase w-[20%]">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('facilitatorName')
                      setSortDir(sortBy === 'facilitatorName' && sortDir === 'asc' ? 'desc' : 'asc')
                    }}
                    className="inline-flex items-center gap-2 text-xs uppercase"
                  >
                    Facilitator
                    {sortBy === 'facilitatorName' ? (
                      sortDir === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4 opacity-40" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left font-semibold text-xs uppercase w-[20%]">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('schedule')
                      setSortDir(sortBy === 'schedule' && sortDir === 'asc' ? 'desc' : 'asc')
                    }}
                    className="inline-flex items-center gap-2 text-xs uppercase"
                  >
                    Schedule
                    {sortBy === 'schedule' ? (
                      sortDir === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4 opacity-40" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left font-semibold text-xs uppercase w-[10%]">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy('status')
                      setSortDir(sortBy === 'status' && sortDir === 'asc' ? 'desc' : 'asc')
                    }}
                    className="inline-flex items-center gap-2 text-xs uppercase"
                  >
                    Status
                    {sortBy === 'status' ? (
                      sortDir === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronsUpDown className="h-4 w-4 opacity-40" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-left font-semibold text-xs uppercase w-[10%]">Actions</th>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {events.loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="text-sm">
                    <td className="px-6 py-4"><div className="h-4 w-48 animate-pulse rounded bg-slate-100"/></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 animate-pulse rounded bg-slate-100"/></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 animate-pulse rounded bg-slate-100"/></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 animate-pulse rounded bg-slate-100"/></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 animate-pulse rounded bg-slate-100"/></td>
                    <td className="px-6 py-4"><div className="h-6 w-24 animate-pulse rounded bg-slate-100"/></td>
                  </tr>
                ))
              ) : (
                visibleEvents.map((item) => {
                  const scheduleState = getScheduleState(item)
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors text-sm ${scheduleState === 'ACTIVE' ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-slate-600 text-xs">{item.sportName}</p>
                      </td>

                      <td className="px-6 py-4 text-slate-600">₱ {item.feePerTeam || 0}</td>

                      <td className="px-6 py-4 text-slate-600">{item.facilitatorName || 'Unassigned'}</td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-700">{formatSchedule(item)}</span>
                          <span
                            className={`inline-flex rounded-full w-fit  px-2 py-1 text-xs font-semibold ${
                              scheduleState === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-700'
                                : scheduleState === 'UPCOMING'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {scheduleState === 'ACTIVE' ? 'Active now' : scheduleState === 'UPCOMING' ? 'Upcoming' : 'Past'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          className="w-full  rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none"
                          value={item.status}
                          onChange={(e) => events.updateEvent(item.id, { status: e.target.value })}
                        >
                          <option>OPEN</option>
                          <option>CLOSED</option>
                          <option>COMPLETED</option>
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => openEdit(item)} className="rounded-full p-1.5 text-slate-600 bg-slate-100 border border-slate-300 hover:bg-slate-200" title="Edit event">
                            <Pencil className='h-4 w-4' />
                          </button>
                          <button type="button" onClick={() => setDeletingEvent(item)} className="rounded-full p-1.5 text-slate-600 bg-slate-100 border border-slate-300 hover:bg-slate-200" title="Delete event">
                            <Trash2 className='h-4 w-4' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {!sortedEvents.length && !events.loading && (
            <div className="flex h-40 items-center justify-center">
              <p className="text-sm font-medium text-slate-500">No events match your search.</p>
            </div>
          )}
          
        </div>
      </section>

      {/* Create / Edit Event Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-950">{form.id ? 'Edit event' : 'Create event'}</h2>
            <p className="mt-1 text-sm text-slate-600">Fill in the details of the event and assign a facilitator.</p>

            <form className="mt-5 grid gap-4" onSubmit={submit}>
              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                Event name
                <input 
                    required 
                    className={inputClass()} 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    placeholder="Summer Basketball Tournament" /
                >
              </label>

              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                Sport
                <select required className={inputClass()} value={form.sportId} onChange={(e) => setForm({ ...form, sportId: e.target.value })}>
                  <option value="">Select sport</option>
                  {sports.filter((sport) => sport.status !== 'ARCHIVED').map((sport) => (
                    <option key={sport.id} value={sport.id}>{sport.name}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                Fee per team
                <input type="number" min="0" required className={inputClass()} value={form.feePerTeam} onChange={(e) => setForm({ ...form, feePerTeam: e.target.value })} placeholder="1500" />
              </label>

              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                Assigned facilitator
                <select required className={inputClass()} value={form.facilitatorId} onChange={(e) => setForm({ ...form, facilitatorId: e.target.value })}>
                  <option value="">Select facilitator</option>
                  {facilitators.map((facilitator) => (
                    <option key={facilitator.uid || facilitator.id} value={facilitator.uid || facilitator.id}>{facilitator.displayName}</option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                  Start date
                  <input type="date" required className={inputClass()} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </label>

              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                  End date
                  <input type="date" required className={inputClass()} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
                </label>
              </div>

              <div className="flex gap-2 pt-6">
                <button 
                    type="button" 
                    onClick={() => setModalOpen(false)} 
                    className="flex-1 rounded-lg border border-slate-200 px-4 py-2 !text-sm cursor-pointer font-bold text-slate-700 hover:bg-slate-50"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 cursor-pointer  !text-sm font-bold text-white hover:bg-blue-700"
                >
                    {form.id ? 'Update event' : 'Create event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deletingEvent && (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-red-600">Delete Event</h3>
            <p className="mt-3 text-sm text-slate-600">Are you sure you want to delete <strong>{deletingEvent.name}</strong> and all related data? This cannot be undone.</p>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setDeletingEvent(null)} className="flex-1 rounded-xl border cursor-pointer border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 rounded-xl bg-red-600 px-4 py-2 cursor-pointer text-sm font-semibold text-white">Delete</button>
            </div>
          </div>
        </div>
      )}

    </section>
  )
}
