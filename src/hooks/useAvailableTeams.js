import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '../firebase'

function isSignupTeam(team, sportId) {
  return Boolean(
    team?.coachId &&
      team?.status === 'ACTIVE' &&
      team?.sportId &&
      (!sportId || team.sportId === sportId),
  )
}

export function useAvailableTeams(sportId) {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sportId) {
      setTeams([])
      setLoading(false)
      setError('')
      return undefined
    }

    setLoading(true)
    const teamsQuery = query(
      collection(db, 'teams'),
      where('sportId', '==', sportId),
      where('status', '==', 'ACTIVE'),
      orderBy('createdAt', 'desc'),
    )

    const unsubscribe = onSnapshot(
      teamsQuery,
      (snapshot) => {
        setTeams(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })).filter((team) => isSignupTeam(team, sportId)))
        setLoading(false)
        setError('')
      },
      (snapshotError) => {
        setTeams([])
        setLoading(false)
        setError(snapshotError.message)
      },
    )

    return unsubscribe
  }, [sportId])

  return { teams, loading, error }
}
