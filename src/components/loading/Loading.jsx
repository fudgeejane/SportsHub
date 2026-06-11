/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import navLogo from '../../assets/SportsHub.png'

const GlobalLoadingContext = createContext(null)
const MIN_VISIBLE_MS = 400

export function GlobalLoadingProvider({ children }) {
  const [pendingCount, setPendingCount] = useState(0)
  const [label, setLabel] = useState('Loading SportsHub...')
  const loadingIds = useRef(new Map())

  const removeLoadingId = useCallback((id) => {
    const entry = loadingIds.current.get(id)
    if (!entry) return

    if (entry.timeoutId) window.clearTimeout(entry.timeoutId)

    loadingIds.current.delete(id)
    setPendingCount(loadingIds.current.size)
  }, [])

  const startLoading = useCallback(
    (loadingLabel = 'Loading SportsHub...') => {
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

        const remaining = MIN_VISIBLE_MS - (Date.now() - entry.startedAt)
        if (remaining <= 0) {
          removeLoadingId(id)
          return
        }

        entry.timeoutId = window.setTimeout(() => removeLoadingId(id), remaining)
      }
    },
    [removeLoadingId],
  )

  const stopAllLoading = useCallback(() => {
    loadingIds.current.forEach((entry) => {
      if (entry.timeoutId) window.clearTimeout(entry.timeoutId)
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
  if (!context) throw new Error('useGlobalLoading must be used inside GlobalLoadingProvider.')
  return context
}

export default function Loading({ label = 'Loading SportsHub...' }) {
  return (
    <div
      className="fixed inset-0 z-[200] grid min-h-screen place-items-center bg-white px-6 text-center"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex w-full max-w-xs flex-col items-center">
        <div className="relative grid h-24 w-24 place-items-center">
          <span className="absolute inset-0 rounded-full border-4 border-cyan-100" />
          <span className="absolute inset-0 rounded-full border-4 border-transparent border-r-blue-500 border-t-cyan-500 motion-safe:animate-spin" />
          <img src={navLogo} alt="SportsHub" className="h-14 w-14 object-contain" />
        </div>
      </div>
    </div>
  )
}
