/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const GlobalLoadingContext = createContext(null)
const MIN_VISIBLE_MS = 400

export function GlobalLoadingProvider({ children }) {
  const [pendingCount, setPendingCount] = useState(0)
  const [label, setLabel] = useState('Loading SportsHub...')
  const loadingIds = useRef(new Map())

  const removeLoadingId = useCallback((id) => {
    const entry = loadingIds.current.get(id)

    if (!entry) return

    if (entry.timeoutId) {
      window.clearTimeout(entry.timeoutId)
    }

    loadingIds.current.delete(id)
    setPendingCount(loadingIds.current.size)
  }, [])

  const startLoading = useCallback((loadingLabel = 'Loading SportsHub...') => {
    const id = Symbol('global-loading')
    loadingIds.current.set(id, {
      startedAt: Date.now(),
      timeoutId: null,
    })
    setLabel(loadingLabel)
    setPendingCount(loadingIds.current.size)

    let stopped = false

    return () => {
      if (stopped) return
      stopped = true

      const entry = loadingIds.current.get(id)
      if (!entry) return

      const elapsed = Date.now() - entry.startedAt
      const remaining = MIN_VISIBLE_MS - elapsed

      if (remaining <= 0) {
        removeLoadingId(id)
        return
      }

      entry.timeoutId = window.setTimeout(() => removeLoadingId(id), remaining)
    }
  }, [removeLoadingId])

  const stopAllLoading = useCallback(() => {
    loadingIds.current.forEach((entry) => {
      if (entry.timeoutId) {
        window.clearTimeout(entry.timeoutId)
      }
    })
    loadingIds.current.clear()
    setPendingCount(0)
  }, [])

  useEffect(() => stopAllLoading, [stopAllLoading])

  const value = useMemo(
    () => ({
      isGlobalLoading: pendingCount > 0,
      loadingLabel: label,
      startLoading,
      stopAllLoading,
    }),
    [label, pendingCount, startLoading, stopAllLoading],
  )

  return <GlobalLoadingContext.Provider value={value}>{children}</GlobalLoadingContext.Provider>
}

export function useGlobalLoading() {
  const context = useContext(GlobalLoadingContext)

  if (!context) {
    throw new Error('useGlobalLoading must be used inside GlobalLoadingProvider.')
  }

  return context
}
