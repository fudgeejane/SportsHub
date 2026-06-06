import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { isValidTeamStructure } from '../constants/teamStructure'
import { db } from '../firebase'

function isSignupSport(sport) {
  return Boolean(sport?.createdBy && sport?.status === 'ACTIVE' && isValidTeamStructure(sport?.teamStructure))
}

export function useAvailableSports() {
  const [sports, setSports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const sportsQuery = query(collection(db, 'sports'), where('status', '==', 'ACTIVE'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(
      sportsQuery,
      (snapshot) => {
        setSports(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })).filter(isSignupSport))
        setLoading(false)
        setError('')
      },
      (snapshotError) => {
        setSports([])
        setLoading(false)
        setError(snapshotError.message)
      },
    )

    return unsubscribe
  }, [])

  return { sports, loading, error }
}
