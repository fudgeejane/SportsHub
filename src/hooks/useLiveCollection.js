import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

const EMPTY_CONSTRAINTS = []

function snapshotRows(snapshot) {
  return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }))
}

export function useLiveCollection(collectionName, constraints = EMPTY_CONSTRAINTS) {
  const itemsQuery = useMemo(
    () => query(collection(db, collectionName), ...constraints, orderBy('createdAt', 'desc')),
    [collectionName, constraints],
  )
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsubscribe = onSnapshot(
      itemsQuery,
      (snapshot) => {
        setItems(snapshotRows(snapshot))
        setLoading(false)
        setError('')
      },
      (snapshotError) => {
        setError(snapshotError.message)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [itemsQuery])

  return { items, loading, error }
}
