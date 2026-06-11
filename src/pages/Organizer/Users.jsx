import { useEffect, useMemo, useState } from 'react'
import { ROLES, STATUSES } from '../../contexts/AuthContext'
import { useAuth, useUserManagement } from '../../hooks/useAuth.jsx'
import { Search, ChevronRight, ChevronLeft, Pencil, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

const roleOptions = [ROLES.COMMUNITY_ORGANIZER, ROLES.COACH, ROLES.FACILITATOR, ROLES.PLAYER]
const PAGE_SIZE = 10
const TABS = {
  USERS: 'USERS',
  PENDING: 'PENDING',
}

const formatLabel = (value) =>
  value
    ? value
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : ''

export default function OrganizerUsersPage() {
  const { currentUser } = useAuth()
  const { users, loading, approveUser, rejectUser, changeRole, deleteUser } = useUserManagement(currentUser?.uid)
  const [sortBy, setSortBy] = useState('displayName')
  const [sortDir, setSortDir] = useState('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [pendingSearchQuery, setPendingSearchQuery] = useState('')
  const [pendingRoleFilter, setPendingRoleFilter] = useState('ALL')
  const [pageIndex, setPageIndex] = useState(0)
  const [pendingPageIndex, setPendingPageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState(TABS.USERS)
  const [editingUser, setEditingUser] = useState(null)
  const [editRole, setEditRole] = useState('')
  const [editEmailConfirm, setEditEmailConfirm] = useState('')
  const [deletingUser, setDeletingUser] = useState(null)

  const normalizedSearch = searchQuery.trim().toLowerCase()

  const filteredUsers = useMemo(() => {
    const nonPendingUsers = users.filter((user) => user.status !== STATUSES.PENDING)

    let results = nonPendingUsers

    if (normalizedSearch) {
      results = nonPendingUsers.filter((user) => {
      const searchTarget = [user.displayName, user.email, user.role, user.status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchTarget.includes(normalizedSearch)
      })
    }

    // Sorting
    const dir = sortDir === 'asc' ? 1 : -1
    results = results.slice().sort((a, b) => {
      const va = (a[sortBy] || '').toString().toLowerCase()
      const vb = (b[sortBy] || '').toString().toLowerCase()
      if (va < vb) return -1 * dir
      if (va > vb) return 1 * dir
      return 0
    })

    return results
  }, [normalizedSearch, users, sortBy, sortDir])

  useEffect(() => {
    // Reset to first page when search or sorting changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPageIndex(0)
  }, [normalizedSearch, sortBy, sortDir])

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))

  useEffect(() => {
    if (pageIndex >= pageCount) {
      queueMicrotask(() => setPageIndex(0))
    }
  }, [pageCount, pageIndex])

  const currentPageUsers = useMemo(
    () => filteredUsers.slice(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE),
    [filteredUsers, pageIndex],
  )

  const pendingApprovalCount = users.filter(
    (user) => user.status === STATUSES.PENDING && (user.role === ROLES.COACH || user.role === ROLES.FACILITATOR),
  ).length

  const normalizedPendingSearch = pendingSearchQuery.trim().toLowerCase()

  const approvalQueue = useMemo(() => {
    const list = users.filter((user) => {
      const organizerManagedRole = user.role === ROLES.COACH || user.role === ROLES.FACILITATOR
      if (!organizerManagedRole || user.status !== STATUSES.PENDING) return false
      if (pendingRoleFilter !== 'ALL' && user.role !== pendingRoleFilter) return false
      return true
    })

    const searched = normalizedPendingSearch
      ? list.filter((user) =>
          [user.displayName, user.email, user.role, user.status]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(normalizedPendingSearch),
        )
      : list

    const dir = sortDir === 'asc' ? 1 : -1
    const sorted = searched.slice().sort((a, b) => {
      const va = (a[sortBy] || '').toString().toLowerCase()
      const vb = (b[sortBy] || '').toString().toLowerCase()
      if (va < vb) return -1 * dir
      if (va > vb) return 1 * dir
      return 0
    })

    return sorted
  }, [users, normalizedPendingSearch, pendingRoleFilter, sortBy, sortDir])

  const pendingPageCount = Math.max(1, Math.ceil(approvalQueue.length / PAGE_SIZE))

  useEffect(() => {
    if (pendingPageIndex >= pendingPageCount) {
      queueMicrotask(() => setPendingPageIndex(0))
    }
  }, [pendingPageCount, pendingPageIndex])

  const currentPendingPageUsers = useMemo(
    () => approvalQueue.slice(pendingPageIndex * PAGE_SIZE, pendingPageIndex * PAGE_SIZE + PAGE_SIZE),
    [approvalQueue, pendingPageIndex],
  )


  const handleEditUser = (user) => {
    setEditingUser(user)
    setEditRole(user.role)
    setEditEmailConfirm('')
  }

  const confirmEditRole = async () => {
    if (!editingUser) return
    try {
      await changeRole(editingUser.uid || editingUser.id, editRole)
      setEditingUser(null)
      setEditEmailConfirm('')
    } catch {
      // error handled in hook
    }
  }

  const confirmDeleteUser = async () => {
    if (!deletingUser) return
    try {
      await deleteUser(deletingUser.uid || deletingUser.id)
      setDeletingUser(null)
    } catch {
      // error handled in hook
    }
  }

  return (
    <section className='space-y-4'>
      <div>
        <h2 className="text-2xl font-bold text-slate-950">User Management</h2>
        <p className="mt-1 text-slate-600 text-sm max-w-3xl">Approve users, reject users, and manage SportsHub roles.</p>
      </div>
            
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab(TABS.USERS)}
          className={`rounded-lg px-4 py-2 !text-sm font-semibold transition ${
            activeTab === TABS.USERS
              ? 'bg-blue-500 text-white'
              : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 cursor-pointer'
          }`}
        >
          User Management
        </button>
        <button
          type="button"
          onClick={() => setActiveTab(TABS.PENDING)}
          className={`rounded-lg px-4 py-2 !text-sm font-semibold transition ${
            activeTab === TABS.PENDING
              ? 'bg-blue-500 text-white'
              : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 cursor-pointer'
          }`}
        >
          Pending Approval
          <span
            className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${
              activeTab === TABS.PENDING ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
            }`}
          >
            {pendingApprovalCount}
          </span>
        </button>
      </div>

      <div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
       

          {activeTab === TABS.USERS ? (
            <>
              <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              
               <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                 <div className="relative w-full sm:w-80">
                   {loading ? (
                     <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
                   ) : (
                     <>
                       <Search
                         size={18}
                         className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                       />
                       <input
                         value={searchQuery}
                         onChange={(event) => setSearchQuery(event.target.value)}
                         placeholder="Search users by name, email, role, or status"
                         className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                       />
                     </>
                   )}
                 </div>
              </div>

              <div className='flex items-center gap-2'>
                <p className="text-xs text-slate-600">
                  Showing {currentPageUsers.length ? pageIndex * PAGE_SIZE + 1 : 0} -{' '}
                  {currentPageUsers.length ? pageIndex * PAGE_SIZE + currentPageUsers.length : 0} of {filteredUsers.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPageIndex((current) => Math.max(current - 1, 0))}
                    disabled={pageIndex === 0}
                    className="rounded-xl border border-slate-200 bg-white p-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className='h-4 w-4'/>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageIndex((current) => Math.min(current + 1, pageCount - 1))}
                    disabled={pageIndex >= pageCount - 1}
                    className="rounded-xl border border-slate-200 bg-white p-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronRight className='h-4 w-4'/>
                  </button>
                </div>
              </div>
              
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                 <thead className="bg-slate-100 border-b border-slate-200 text-xs uppercase tracking-wider text-blue-700">
                  <tr>
                    <th className="px-4 py-2 w-[30%]">
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy('displayName')
                          setSortDir(sortBy === 'displayName' && sortDir === 'asc' ? 'desc' : 'asc')
                        }}
                        className="flex items-center gap-2 text-xs uppercase"
                      >
                        User
                        {sortBy === 'displayName' ? (
                          sortDir === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 opacity-40" />
                        )}
                      </button>
                    </th>

                    <th className="px-4 py-2 w-[30%]">
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy('email')
                          setSortDir(sortBy === 'email' && sortDir === 'asc' ? 'desc' : 'asc')
                        }}
                        className="flex items-center gap-2 text-xs uppercase"
                      >
                        Email
                        {sortBy === 'email' ? (
                          sortDir === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 opacity-40" />
                        )}
                      </button>
                    </th>

                    <th className="px-4 py-2 w-[20%]">
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy('role')
                          setSortDir(sortBy === 'role' && sortDir === 'asc' ? 'desc' : 'asc')
                        }}
                        className="flex items-center gap-2 text-xs uppercase"
                      >
                        Role
                        {sortBy === 'role' ? (
                          sortDir === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 opacity-40" />
                        )}
                      </button>
                    </th>

                    <th className="px-4 py-2 w-[20%] text-xs uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                  <tbody className="divide-y divide-slate-200">
                    {loading ? (
                      // skeleton rows
                      Array.from({ length: PAGE_SIZE }).map((_, i) => (
                        <tr key={`skeleton-${i}`}>
                          <td className="px-4 py-4"><div className="h-4 w-36 animate-pulse rounded bg-slate-100"/></td>
                          <td className="px-4 py-4"><div className="h-4 w-48 animate-pulse rounded bg-slate-100"/></td>
                          <td className="px-4 py-4"><div className="h-4 w-24 animate-pulse rounded bg-slate-100"/></td>
                          <td className="px-4 py-4"><div className="h-6 w-24 animate-pulse rounded bg-slate-100"/></td>
                        </tr>
                      ))
                    ) : currentPageUsers.length ? (
                      currentPageUsers.map((user) => (
                        <tr key={user.uid || user.id}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="px-4 py-2">{user.displayName}</td>
                          <td className="px-4 py-2">{user.email}</td>
                          <td className="px-4 py-2">{formatLabel(user.role)}</td>
                          <td className="px-4 py-2 ">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="rounded-full p-1.5 text-slate-600 bg-slate-100 border border-slate-300 hover:bg-slate-200 cursor-pointer"
                                title='Update User'
                              >
                                <Pencil className='h-3.5 w-3.5' />
                              </button>
                              <button
                                onClick={() => setDeletingUser(user)}
                                className="rounded-full p-1.5 text-slate-600 bg-slate-100 border border-slate-300 hover:bg-slate-200 cursor-pointer"
                                title='Delete User'
                              >
                                <Trash2 className='h-3.5 w-3.5' />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">
                          No users match your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

     
            </>
          ) : (
            <>
              <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative w-full sm:w-80">
                      <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        value={pendingSearchQuery}
                        onChange={(event) => setPendingSearchQuery(event.target.value)}
                        placeholder="Search pending users"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                      />
                    </div>
                {loading ? (
                  <div className="h-10 w-48 animate-pulse rounded bg-slate-100" />
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  
                      <div className="flex gap-4 items-center gap-2">
                <p className="text-xs text-slate-600">
                  Showing {approvalQueue.length ? pendingPageIndex * PAGE_SIZE + 1 : 0} -{' '}
                  {approvalQueue.length ? pendingPageIndex * PAGE_SIZE + currentPendingPageUsers.length : 0} of {approvalQueue.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPendingPageIndex((current) => Math.max(current - 1, 0))}
                    disabled={pendingPageIndex === 0}
                    className="rounded-xl border border-slate-200 bg-white p-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className='h-4 w-4' />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingPageIndex((current) => Math.min(current + 1, pendingPageCount - 1))}
                    disabled={pendingPageIndex >= pendingPageCount - 1}
                    className="rounded-xl border border-slate-200 bg-white p-1 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronRight className='h-4 w-4' />
                  </button>
                </div>
              </div>
                  </div>
                )}
              </div>

           

              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="bg-slate-100 border-b border-slate-200 text-xs uppercase tracking-wider text-blue-700">
                    <tr>
                      <th className="px-4 py-2 w-[30%]">
                        <button
                          type="button"
                          onClick={() => {
                            setSortBy('displayName')
                            setSortDir(sortBy === 'displayName' && sortDir === 'asc' ? 'desc' : 'asc')
                          }}
                          className="flex items-center gap-2 text-xs uppercase"
                        >
                          User
                          {sortBy === 'displayName' ? (sortDir === 'asc' ? <ChevronUp className='h-4 w-4'/> : <ChevronDown className='h-4 w-4'/>) : <ChevronsUpDown className='h-4 w-4 opacity-40'/>}
                        </button>
                      </th>

                      <th className="px-4 py-2 w-[30%]">
                        <button
                          type="button"
                          onClick={() => {
                            setSortBy('email')
                            setSortDir(sortBy === 'email' && sortDir === 'asc' ? 'desc' : 'asc')
                          }}
                          className="flex items-center gap-2 text-xs uppercase"
                        >
                          Email
                          {sortBy === 'email' ? (sortDir === 'asc' ? <ChevronUp className='h-4 w-4'/> : <ChevronDown className='h-4 w-4'/>) : <ChevronsUpDown className='h-4 w-4 opacity-40'/>}
                        </button>
                      </th>

                      <th className="px-4 py-2 w-[20%]">
                        <button
                          type="button"
                          onClick={() => {
                            setSortBy('role')
                            setSortDir(sortBy === 'role' && sortDir === 'asc' ? 'desc' : 'asc')
                          }}
                          className="flex items-center gap-2 text-xs uppercase"
                        >
                          Role
                          {sortBy === 'role' ? (sortDir === 'asc' ? <ChevronUp className='h-4 w-4'/> : <ChevronDown className='h-4 w-4'/>) : <ChevronsUpDown className='h-4 w-4 opacity-40'/>}
                        </button>
                      </th>

                      <th className="px-4 py-2 text-xs uppercase w-[20%]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {currentPendingPageUsers.length ? (
                      currentPendingPageUsers.map((user) => (
                        <tr key={user.uid || user.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2 text-slate-700 text-sm">{user.displayName}</td>
                          <td className="px-4 py-2 text-slate-700 text-sm">{user.email}</td>
                          <td className="px-4 py-2">
                            <select
                              value={user.role}
                              onChange={(event) => changeRole(user.uid || user.id, event.target.value)}
                              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500"
                            >
                              {roleOptions.map((role) => (
                                <option key={role} value={role}>
                                  {formatLabel(role)}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="px-4 py-2">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => approveUser(user.uid || user.id)}
                                className="rounded-lg cursor-pointer bg-green-500 px-4 py-2 !text-xs font-semibold text-white transition hover:bg-green-600"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => rejectUser(user.uid || user.id)}
                                className="rounded-lg cursor-pointer bg-red-500 px-4 py-2 !text-xs font-semibold text-white transition hover:bg-red-600"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-500">
                          No pending user approvals at the moment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {editingUser && (
        <div className="modal-overlay">
          <div className="max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-950">Edit User Role</h3>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Current Role</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatLabel(editingUser.role)}</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">New Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500"
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {formatLabel(role)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Enter User Email to Confirm</label>
                <input
                  type="email"
                  value={editEmailConfirm}
                  onChange={(e) => setEditEmailConfirm(e.target.value)}
                  placeholder={editingUser.email}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  setEditingUser(null)
                  setEditEmailConfirm('')
                  setEditRole('')
                }}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editEmailConfirm === editingUser?.email) {
                    confirmEditRole()
                  }
                }}
                disabled={editRole === editingUser.role || editEmailConfirm !== editingUser?.email}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingUser && (
        <div className="modal-overlay">
          <div className="max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-red-600">Delete User</h3>
            <p className="mt-3 text-sm text-slate-600">Are you sure you want to delete this user?</p>
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500">
                Name: <span className="text-slate-900">{deletingUser.displayName}</span>
              </p>
              <p className="text-xs font-semibold text-slate-500">
                Email: <span className="text-slate-900">{deletingUser.email}</span>
              </p>
            </div>
            <p className="mt-4 text-xs text-red-600">This action cannot be undone.</p>
            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
