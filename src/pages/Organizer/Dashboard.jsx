import { ROLES } from '../../contexts/AuthContext'
import { useAuth, useUserManagement } from '../../hooks/useAuth.jsx'
import DashboardShell from '../../components/common/DashboardShell'

const roleOptions = [ROLES.ADMIN, ROLES.COMMUNITY_ORGANIZER, ROLES.COACH, ROLES.FACILITATOR, ROLES.PLAYER]

export default function OrganizerDashboard() {
  const { currentUser } = useAuth()
  const { users, loading, error, approveUser, rejectUser, changeRole } = useUserManagement(currentUser?.uid)

  return (
    <DashboardShell title="Organizer Dashboard" description="Approve users, reject users, and manage SportsHub roles.">
      {error ? <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p> : null}
      {loading ? <p className="mb-4 rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700">Loading users...</p> : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-xl font-bold text-slate-950">User Approval Queue</h2>
          <p className="mt-1 text-sm text-slate-600">Only Community Organizers can approve, reject, and change user roles.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Email Verified</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.uid}>
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-950">{user.displayName}</p>
                    <p className="text-slate-500">{user.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={user.role}
                      onChange={(event) => changeRole(user.uid, event.target.value)}
                      className="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 outline-none transition focus:border-blue-500"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-700">{user.status}</span>
                  </td>
                  <td className="px-5 py-4">{user.emailVerified ? 'Yes' : 'No'}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => approveUser(user.uid)}
                        className="rounded-xl bg-blue-600 px-3 py-2 font-bold text-white transition hover:bg-blue-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectUser(user.uid)}
                        className="rounded-xl border border-red-200 px-3 py-2 font-bold text-red-600 transition hover:bg-red-50"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  )
}
