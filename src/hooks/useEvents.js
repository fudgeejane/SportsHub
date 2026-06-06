import { useCallback, useEffect, useMemo, useState } from 'react'
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useGlobalLoading } from './useGlobalLoading.jsx'
import { useAuth } from './useAuth.jsx'

const EVENTS = 'events'

function snapshotRows(snapshot) {
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }))
}

export function useEvents() {
  const { currentUser } = useAuth()
  const { startLoading } = useGlobalLoading()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const eventsQuery = query(collection(db, EVENTS), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(
      eventsQuery,
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
      runAction('Saving event...', () =>
        {
          if (!data.facilitatorId) throw new Error('Assign a facilitator before creating the event.')
          const feePerTeam = Number(data.feePerTeam)
          if (!Number.isFinite(feePerTeam) || feePerTeam < 0) throw new Error('Enter a valid fee per team.')

          return addDoc(collection(db, EVENTS), {
            name: data.name?.trim(),
            sportId: data.sportId,
            sportName: data.sportName || '',
            venue: data.venue?.trim() || '',
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            feePerTeam,
            facilitatorId: data.facilitatorId,
            facilitatorName: data.facilitatorName || '',
            status: data.status || 'OPEN',
            schedule: [],
            createdBy: currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })
        },
      ),
    [currentUser, runAction],
  )

  const updateEvent = useCallback(
    (eventId, data) =>
      runAction('Updating event...', () =>
        updateDoc(doc(db, EVENTS, eventId), {
          ...data,
          updatedAt: serverTimestamp(),
        }),
      ),
    [runAction],
  )

  const eventsBySport = useCallback((sportId) => events.filter((event) => event.sportId === sportId), [events])

  return useMemo(
    () => ({
      events,
      loading,
      error,
      createEvent,
      updateEvent,
      eventsBySport,
    }),
    [createEvent, error, events, eventsBySport, loading, updateEvent],
  )
}
