import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Loading from './components/loading/Loading'
import { useAuth } from './hooks/useAuth'
import { useGlobalLoading } from './components/loading/Loading'
import { protectedRoutes } from './routes/ProtectedRoutes'
import { publicRoutes } from './routes/PublicRoutes'
import { PUBLIC_ROUTES } from './routes/public-routes'

function AppRoutes() {
  const { loading: authLoading } = useAuth()
  const { isGlobalLoading, loadingLabel } = useGlobalLoading()

  return (
    <>
      {(authLoading || isGlobalLoading) && (
        <Loading label={authLoading ? 'Checking your SportsHub session...' : loadingLabel} />
      )}
      <Routes>
        {publicRoutes}
        {protectedRoutes}
        <Route path="*" element={<Navigate to={PUBLIC_ROUTES.home} replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}
