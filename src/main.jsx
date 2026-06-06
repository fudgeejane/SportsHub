import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { GlobalLoadingProvider } from './hooks/useGlobalLoading.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalLoadingProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GlobalLoadingProvider>
  </StrictMode>,
)
