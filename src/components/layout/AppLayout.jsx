import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LogOut, Menu, X } from 'lucide-react'
import defaultAvatar from '../../assets/default-avatar.svg'
import { useAuth } from '../../hooks/useAuth'
import { getAllowedNav, getRoleKey } from '../../routes/navConfig'
import { PUBLIC_ROUTES } from '../../routes/public-routes'

function SidebarContent({ collapsed, onNavigate, onLogout }) {
  const { signOut, userProfile } = useAuth()
  const navItems = getAllowedNav(userProfile?.role)

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-600 font-black text-white">S</div>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-black uppercase tracking-[0.18em] text-blue-600">SportsHub</p>
            <p className="truncate text-xs font-semibold text-slate-500">{getRoleKey(userProfile?.role)} workspace</p>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition ${
                  isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon size={19} />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          onClick={onLogout || signOut}
          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-600 transition hover:bg-red-50 hover:text-red-600 ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={19} />
          {!collapsed ? <span>Logout</span> : null}
        </button>
      </div>
    </div>
  )
}

export default function AppLayout({ title, children }) {
  const { currentUser, signOut, userProfile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const sidebarWidth = collapsed ? 'lg:pl-20' : 'lg:pl-72'
  const pageTitle =
    title ||
    getAllowedNav(userProfile?.role).find((item) => item.path === location.pathname)?.label ||
    'Dashboard'

  const handleLogout = async () => {
    await signOut()
    setMobileOpen(false)
    setUserMenuOpen(false)
    navigate(PUBLIC_ROUTES.home, { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden border-r border-slate-200 bg-white transition-all duration-200 lg:block ${
          collapsed ? 'w-20' : 'w-72'
        }`}
      >
        <SidebarContent collapsed={collapsed} onLogout={handleLogout} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/40" onClick={() => setMobileOpen(false)} aria-label="Close sidebar overlay" />
          <aside className="relative h-full w-80 max-w-[86vw] border-r border-slate-200 bg-white shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} onLogout={handleLogout} />
          </aside>
        </div>
      ) : null}

      <div className={`min-h-screen transition-all duration-200 ${sidebarWidth}`}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 text-slate-700 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setCollapsed((current) => !current)}
              className="hidden h-10 w-10 place-items-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 lg:grid"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">SportsHub</p>
              <h1 className="text-lg font-black text-slate-950 sm:text-xl">{pageTitle}</h1>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((current) => !current)}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-2 py-2 transition hover:bg-slate-50 sm:px-3"
            >
              <img src={currentUser?.photoURL || defaultAvatar} alt="" className="h-9 w-9 rounded-full object-cover" />
              <span className="hidden max-w-48 truncate text-sm font-bold text-slate-700 md:inline">{currentUser?.email}</span>
            </button>

            {userMenuOpen ? (
              <div className="absolute right-0 mt-2 w-72 rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="truncate text-sm font-bold text-slate-950">{userProfile?.displayName || 'SportsHub User'}</p>
                  <p className="truncate text-xs font-semibold text-slate-500">{currentUser?.email}</p>
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-blue-600">{userProfile?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <main className="h-[calc(100vh-4rem)] overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
