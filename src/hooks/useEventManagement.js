import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './useAuth'
import { useGlobalLoading } from '../components/loading/Loading'

const EVENTS = 'events'
const EVENT_SCHEDULES = 'eventSchedules'
const REGISTRATIONS = 'registrations'
const TEAMS = 'teams'

function snapshotRows(snapshot) {
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }))
}

function normalizeEventPayload(data, currentUserId) {
  const eventName = data.eventName ?? data.name
  const facilitatorIds = data.facilitatorIds ?? (data.facilitatorId ? [data.facilitatorId] : [])

  return {
    eventName: eventName?.trim(),
    name: eventName?.trim(),
    description: data.description?.trim() || '',
    venue: data.venue?.trim() || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    facilitatorIds,
    facilitatorId: data.facilitatorId || facilitatorIds[0] || '',
    facilitatorName: data.facilitatorName || '',
    sportId: data.sportId || '',
    sportName: data.sportName || '',
    feePerTeam: Number.isFinite(Number(data.feePerTeam)) ? Number(data.feePerTeam) : 0,
    status: data.status || 'open',
    createdBy: data.createdBy || currentUserId || '',
  }
}

function normalizeSchedulePayload(data) {
  return {
    eventId: data.eventId,
    sportId: data.sportId || '',
    matchTitle: data.matchTitle ?? data.title ?? '',
    venue: data.venue || '',
    date: data.date || '',
    facilitatorId: data.facilitatorId || '',
    status: data.status || 'scheduled',
  }
}

export function useEventManagement() {
  const { currentUser } = useAuth()
  const { startLoading } = useGlobalLoading()
  const [events, setEvents] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [schedulesLoading, setSchedulesLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, EVENTS), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setEvents(snapshotRows(snapshot))
        setLoading(false)
        setError('')
      },
      (snapshotError) => {
        setError(snapshotError.message)
        setLoading(false)
      },
    )
    return unsubscribe
  }, [])

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, EVENT_SCHEDULES), orderBy('date', 'asc')),
      (snapshot) => {
        setSchedules(snapshotRows(snapshot))
        setSchedulesLoading(false)
      },
      (snapshotError) => {
        setError(snapshotError.message)
        setSchedulesLoading(false)
      },
    )
    return unsubscribe
  }, [])

  const runAction = useCallback(
    async (label, action) => {
      const stop = startLoading(label)
      try {
        return await action()
      } catch (actionError) {
        setError(actionError.message)
        throw actionError
      } finally {
        stop()
      }
    },
    [startLoading],
  )

  const createEvent = useCallback(
    (data) =>
      runAction('Saving event...', () => {
        const payload = normalizeEventPayload(data, currentUser?.uid)
        if (!payload.facilitatorIds.length) throw new Error('Assign a facilitator before creating the event.')
        if (payload.feePerTeam < 0) throw new Error('Enter a valid fee per team.')

        return addDoc(collection(db, EVENTS), {
          ...payload,
          schedule: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }),
    [currentUser, runAction],
  )

  const updateEvent = useCallback(
    (eventId, data) =>
      runAction('Updating event...', () =>
        updateDoc(doc(db, EVENTS, eventId), {
          ...data,
          eventName: data.eventName ?? data.name ?? data.eventName,
          name: data.name ?? data.eventName ?? data.name,
          updatedAt: serverTimestamp(),
        }),
      ),
    [runAction],
  )

  const deleteEvent = useCallback(
    (eventId) =>
      runAction('Deleting event...', async () => {
        if (!eventId) throw new Error('Event id required.')

        const schedulesSnapshot = await getDocs(query(collection(db, EVENT_SCHEDULES), where('eventId', '==', eventId)))
        await Promise.all(schedulesSnapshot.docs.map((entry) => deleteDoc(doc(db, EVENT_SCHEDULES, entry.id))))

        const registrationsSnapshot = await getDocs(query(collection(db, REGISTRATIONS), where('eventId', '==', eventId)))
        await Promise.all(registrationsSnapshot.docs.map((entry) => deleteDoc(doc(db, REGISTRATIONS, entry.id))))

        const teamsSnapshot = await getDocs(query(collection(db, TEAMS), where('eventId', '==', eventId)))
        await Promise.all(
          teamsSnapshot.docs.map((entry) =>
            updateDoc(doc(db, TEAMS, entry.id), {
              eventId: '',
              eventName: '',
              eventFacilitatorId: '',
              eventParticipationStatus: '',
              updatedAt: serverTimestamp(),
            }),
          ),
        )

        await deleteDoc(doc(db, EVENTS, eventId))
      }),
    [runAction],
  )

  const assignFacilitators = useCallback(
    (eventId, facilitatorIds) =>
      runAction('Assigning facilitators...', () =>
        updateDoc(doc(db, EVENTS, eventId), {
          facilitatorIds,
          facilitatorId: facilitatorIds[0] || '',
          updatedAt: serverTimestamp(),
        }),
      ),
    [runAction],
  )

  const createSchedule = useCallback(
    (data) =>
      runAction('Creating schedule...', () =>
        addDoc(collection(db, EVENT_SCHEDULES), {
          ...normalizeSchedulePayload(data),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }),
      ),
    [runAction],
  )

  const updateSchedule = useCallback(
    (scheduleId, data) =>
      runAction('Updating schedule...', () =>
        updateDoc(doc(db, EVENT_SCHEDULES, scheduleId), {
          ...data,
          updatedAt: serverTimestamp(),
        }),
      ),
    [runAction],
  )

  const deleteSchedule = useCallback(
    (scheduleId) => runAction('Deleting schedule...', () => deleteDoc(doc(db, EVENT_SCHEDULES, scheduleId))),
    [runAction],
  )

  const eventsBySport = useCallback((sportId) => events.filter((event) => event.sportId === sportId), [events])
  const schedulesByEvent = useCallback((eventId) => schedules.filter((schedule) => schedule.eventId === eventId), [schedules])

  return useMemo(
    () => ({
      events,
      schedules,
      loading: loading || schedulesLoading,
      error,
      createEvent,
      updateEvent,
      deleteEvent,
      assignFacilitators,
      createSchedule,
      updateSchedule,
      deleteSchedule,
      eventsBySport,
      schedulesByEvent,
    }),
    [
      assignFacilitators,
      createEvent,
      createSchedule,
      deleteEvent,
      deleteSchedule,
      error,
      events,
      eventsBySport,
      loading,
      schedules,
      schedulesByEvent,
      schedulesLoading,
      updateEvent,
      updateSchedule,
    ],
  )
}

export const useEvents = useEventManagement
