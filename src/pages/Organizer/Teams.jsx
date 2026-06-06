import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Search, Users } from 'lucide-react'
import { useSportsSystem } from '../../hooks/useSportsSystem.jsx'

export default function OrganizerTeamsPage() {
  const system = useSportsSystem()
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sportFilter, setSportFilter] = useState('')

  const activeTeams = useMemo(
    () => system.teams.filter((team) => team.status !== 'ARCHIVED'),
    [system.teams],
  )

  const filteredTeams = useMemo(() => {
    return activeTeams.filter((team) => {
      if (sportFilter && team.sportId !== sportFilter) return false
      return true
    })
  }, [activeTeams, sportFilter])

  const teamsPerPage = 3
  const totalPages = Math.ceil(filteredTeams.length / teamsPerPage)
  const startIndex = currentPage * teamsPerPage
  const visibleTeams = filteredTeams.slice(startIndex, startIndex + teamsPerPage)
  
  // Find selected team or default to first visible
  const selectedTeam = useMemo(() => {
    if (selectedTeamId) {
      const team = filteredTeams.find(t => t.id === selectedTeamId)
      if (team) return team
    }
    return visibleTeams[0] || null
  }, [selectedTeamId, filteredTeams, visibleTeams])

  const roster = useMemo(() => {
    if (!selectedTeam) return []
    return system.members.filter(
      (member) => member.teamId === selectedTeam.id && member.status === 'ACTIVE'
    )
  }, [selectedTeam, system.members])

  const filteredRoster = useMemo(() => {
    if (!searchQuery) return roster
    const query = searchQuery.toLowerCase()
    return roster.filter(
      (player) =>
        player.playerName?.toLowerCase().includes(query) ||
        player.playerEmail?.toLowerCase().includes(query)
    )
  }, [roster, searchQuery])

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
      setSelectedTeamId(null) // Reset selection when changing pages
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
      setSelectedTeamId(null) // Reset selection when changing pages
    }
  }

  const handleTeamClick = (team) => {
    setSelectedTeamId(team.id)
  }

  const uniqueSports = useMemo(() => {
    const sports = new Map()
    system.sports.forEach((sport) => {
      if (sport.status === 'ACTIVE') {
        sports.set(sport.id, sport.name)
      }
    })
    return Array.from(sports.entries())
  }, [system.sports])

  return (
    <section className="grid gap-4">

       <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
           <div >
            <h2 className="text-2xl font-bold text-slate-950">Teams & Rosters</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">Browse teams and manage player rosters.</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sportFilter}
              onChange={(e) => {
                setSportFilter(e.target.value)
                setCurrentPage(0)
                setSelectedTeamId(null) // Reset selection when changing filter
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="">All Sports</option>
              {uniqueSports.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
    
      {/* Teams Carousel Section */}
      <section className="">
       

        {filteredTeams.length > 0 ? (
          <div className="relative">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goToPrevPage}
                disabled={currentPage === 0}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="grid flex-1 gap-3 md:grid-cols-3">
                {visibleTeams.map((team) => {
                  const isSelected = selectedTeam?.id === team.id
                  const teamRoster = system.members.filter(
                    (member) => member.teamId === team.id && member.status === 'ACTIVE'
                  )

                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => handleTeamClick(team)}
                      className={`rounded-2xl border-2 p-4 text-left transition ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-black text-slate-950">{team.name}</h3>
                          <p className="mt-1 text-sm text-slate-600">{team.sportName}</p>
                        </div>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                          {teamRoster.length}/{team.maxPlayers}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <Users className="h-3.5 w-3.5" />
                        <span>{teamRoster.length} players</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={goToNextPage}
                disabled={currentPage === totalPages - 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

          
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm font-semibold text-slate-500">No teams found for the selected sport.</p>
          </div>
        )}
      </section>

      {/* Selected Team Roster Section */}
      {selectedTeam ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950">{selectedTeam.name} - Roster</h2>
              <p className="mt-1 text-sm text-slate-600">
                Coach: {selectedTeam.coachName || 'Not assigned'} • {roster.length} of {selectedTeam.maxPlayers} players
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          {filteredRoster.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Player</th>
                    <th className="px-4 py-3">Team</th>

                    <th className="px-4 py-3 text-center">Skill Level</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRoster.map((player) => (
                    <tr key={player.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-black text-white">
                            {player.playerName?.charAt(0).toUpperCase() || 'P'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-950">{player.playerName || 'Unknown Player'}</p>
                            <p className="text-xs text-slate-500">{player.playerEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-slate-200"></div>
                          <span className="text-slate-700">{player.teamName}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center">
                        {player.skillLevel ? (
                          <span className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                            {player.skillLevel}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                          {player.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : roster.length > 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
              <p className="text-sm font-semibold text-slate-500">No players match your search query.</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
              <p className="text-sm font-semibold text-slate-500">No players in this team yet.</p>
            </div>
          )}
        </section>
      ) : null}
    </section>
  )
}
