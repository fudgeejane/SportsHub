import { useMemo, useState } from 'react'
import { Search, Filter, Users, Trophy } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'

export default function FacilitatorTeamsPage() {
  const { currentUser } = useAuth()
  const system = useSportsSystem()
  const [searchQuery, setSearchQuery] = useState('')
  const [sportFilter, setSportFilter] = useState('')
  const [eventFilter, setEventFilter] = useState('')
  const [selectedTeam, setSelectedTeam] = useState(null)

  // Get facilitator's events
  const myEvents = useMemo(
    () => system.events.filter((event) => event.facilitatorId === currentUser?.uid && event.status !== 'ARCHIVED'),
    [system.events, currentUser?.uid]
  )

  // Get sport IDs from facilitator's events
  const mySportIds = useMemo(
    () => new Set(myEvents.map(e => e.sportId)),
    [myEvents]
  )

  // Get all teams for sports in facilitator's events
  const allTeams = useMemo(() => {
    if (mySportIds.size === 0) {
      // If facilitator has no events, show all teams
      return system.teams.filter(team => team.status !== 'ARCHIVED')
    }
    // Show teams whose sport matches any of the facilitator's event sports
    return system.teams.filter(team => 
      team.status !== 'ARCHIVED' && mySportIds.has(team.sportId)
    )
  }, [system.teams, mySportIds])

  // Filter teams
  const filteredTeams = useMemo(() => {
    let teams = allTeams
    
    // Sport filter
    if (sportFilter) {
      teams = teams.filter(team => team.sportId === sportFilter)
    }
    
    // Event filter - filter by sport of the selected event
    if (eventFilter) {
      const selectedEvent = myEvents.find(e => e.id === eventFilter)
      if (selectedEvent) {
        teams = teams.filter(team => team.sportId === selectedEvent.sportId)
      }
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      teams = teams.filter(team =>
        team.name?.toLowerCase().includes(query) ||
        team.sportName?.toLowerCase().includes(query) ||
        team.coachName?.toLowerCase().includes(query)
      )
    }
    
    return teams
  }, [allTeams, sportFilter, eventFilter, searchQuery, myEvents])

  // Get unique sports
  const uniqueSports = useMemo(() => {
    const sports = new Map()
    system.sports.forEach(sport => {
      if (sport.status === 'ACTIVE' && allTeams.some(t => t.sportId === sport.id)) {
        sports.set(sport.id, sport.name)
      }
    })
    return Array.from(sports.entries())
  }, [system.sports, allTeams])

  return (
    <section className="grid gap-4">
      {system.error ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{system.error}</p>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-slate-950">Teams & Rosters</h2>
          <p className="mt-1 text-sm text-slate-600">View and monitor teams for your assigned events.</p>
        </div>

        {/* Filters */}
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search teams, sports, coaches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">All Sports</option>
            {uniqueSports.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">All Events</option>
            {myEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        {/* Teams Grid or Roster View */}
        {selectedTeam ? (
          <div>
            <button
              onClick={() => setSelectedTeam(null)}
              className="mb-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              ← Back to Teams
            </button>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-4">
                <h3 className="text-2xl font-black text-slate-950">{selectedTeam.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{selectedTeam.sportName}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Coach: {selectedTeam.coachName || 'Not assigned'}
                </p>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-black uppercase tracking-wider text-slate-600">Team Roster</p>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                    {system.members.filter(m => m.teamId === selectedTeam.id && m.status === 'ACTIVE').length}/{selectedTeam.maxPlayers || '∞'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-300 bg-slate-100 text-xs uppercase tracking-[0.12em] text-slate-600">
                      <tr>
                        <th className="px-4 py-3">Player</th>
                        <th className="px-4 py-3">Skill Level</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {system.members
                        .filter(m => m.teamId === selectedTeam.id && m.status === 'ACTIVE')
                        .map((member) => (
                          <tr key={member.id} className="transition hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-black text-white">
                                  {member.playerName?.charAt(0).toUpperCase() || 'P'}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-950">{member.playerName}</p>
                                  <p className="text-xs text-slate-500">{member.playerEmail}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                                {member.skillLevel?.replace(/_/g, ' ') || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                                {member.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {system.members.filter(m => m.teamId === selectedTeam.id && m.status === 'ACTIVE').length === 0 && (
                    <div className="rounded-xl bg-slate-50 px-4 py-8 text-center">
                      <Users className="mx-auto h-10 w-10 text-slate-300" />
                      <p className="mt-2 text-sm font-semibold text-slate-500">No team members yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : filteredTeams.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTeams.map((team) => {
              const roster = system.members.filter(
                (member) => member.teamId === team.id && member.status === 'ACTIVE'
              )

              return (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className="rounded-2xl border-2 border-slate-200 bg-white p-4 text-left transition hover:border-blue-400 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-black text-slate-950">{team.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{team.sportName}</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                      {roster.length}/{team.maxPlayers || '∞'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <Users className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-slate-600">{roster.length} players</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Trophy className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-slate-600">Coach: {team.coachName || 'Not assigned'}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
            <Filter className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-500">
              {searchQuery || sportFilter || eventFilter
                ? 'No teams match your filters'
                : 'No teams found for your events'}
            </p>
          </div>
        )}

        {/* Summary Stats */}
        {filteredTeams.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-200 pt-5">
            <div className="rounded-xl bg-blue-50 px-4 py-2">
              <p className="text-xs font-bold text-blue-600">TOTAL TEAMS</p>
              <p className="mt-1 text-2xl font-black text-blue-700">{filteredTeams.length}</p>
            </div>
            <div className="rounded-xl bg-green-50 px-4 py-2">
              <p className="text-xs font-bold text-green-600">TOTAL PLAYERS</p>
              <p className="mt-1 text-2xl font-black text-green-700">
                {filteredTeams.reduce((sum, team) => {
                  return sum + system.members.filter(m => m.teamId === team.id && m.status === 'ACTIVE').length
                }, 0)}
              </p>
            </div>
            <div className="rounded-xl bg-purple-50 px-4 py-2">
              <p className="text-xs font-bold text-purple-600">SPORTS</p>
              <p className="mt-1 text-2xl font-black text-purple-700">
                {new Set(filteredTeams.map(t => t.sportId)).size}
              </p>
            </div>
          </div>
        )}
      </section>
    </section>
  )
}
