import { Clock, MapPin, Pencil, Trophy, X } from 'lucide-react'
import { useState } from 'react'
import { formatDate, formatTime, formatDateTime } from '../../utils/dateFormat'

export default function ScheduleBracket({ bracket, event, onEditMatch, highlightTeamIds = new Set() }) {
  const [editingMatch, setEditingMatch] = useState(null)
  const [editForm, setEditForm] = useState({ matchDate: '', startTime: '', venue: '' })
  const [confirmWinner, setConfirmWinner] = useState(null) // { match, winnerId, winnerName }
  
  const rounds = Object.keys(bracket).sort((a, b) => Number(a) - Number(b))
  const totalRounds = rounds.length
  
  // Determine team colors based on initial bracket position
  const getTeamColor = (match, isTeamA) => {
    // For first round, left side is pink, right side is blue
    if (match.round === 1 || match.round === '1') {
      return isTeamA ? 'pink' : 'blue'
    }
    // For later rounds, inherit from previous matches
    return match[isTeamA ? 'teamAColor' : 'teamBColor'] || (isTeamA ? 'pink' : 'blue')
  }

  if (!rounds.length) {
    return (
      <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
        <Trophy className="mx-auto h-12 w-12 text-slate-300" />
        <p className="mt-3 text-sm font-semibold text-slate-500">No matches scheduled yet.</p>
        <p className="mt-1 text-xs text-slate-400">Generate a bracket to start scheduling games.</p>
      </div>
    )
  }

  const handleWinnerSelect = (match, winner, winnerName) => {
    if (onEditMatch) {
      // If match already has a winner and user is selecting a different one, show confirmation
      if (match.winner && match.winner !== winner) {
        setConfirmWinner({ match, winnerId: winner, winnerName })
      } else if (!match.winner) {
        // If no winner yet, show confirmation too
        setConfirmWinner({ match, winnerId: winner, winnerName })
      }
    }
  }

  const confirmWinnerSelection = () => {
    if (confirmWinner && onEditMatch) {
      onEditMatch(confirmWinner.match.gameNumber, { 
        winner: confirmWinner.winnerId, 
        status: 'COMPLETED' 
      })
      setConfirmWinner(null)
    }
  }

  // Generate date options from event date range
  const getDateOptions = () => {
    if (!event?.startDate || !event?.endDate) return []
    
    const dates = []
    const start = new Date(event.startDate)
    const end = new Date(event.endDate)
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0])
    }
    
    return dates
  }

  const dateOptions = getDateOptions()

  const openEditModal = (match) => {
    setEditingMatch(match)
    setEditForm({
      matchDate: match.matchDate || '',
      startTime: match.startTime || '',
      venue: match.venue || '',
    })
  }

  const closeEditModal = () => {
    setEditingMatch(null)
    setEditForm({ matchDate: '', startTime: '', venue: '' })
  }

  const saveMatchDetails = () => {
    if (editingMatch && onEditMatch) {
      onEditMatch(editingMatch.gameNumber, editForm)
      closeEditModal()
    }
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-12 min-w-max items-center justify-center" style={{ minHeight: '500px' }}>
        {rounds.map((round, roundIndex) => {
          const isLastRound = roundIndex === rounds.length - 1
          
          return (
            <div key={round} className="relative flex flex-col justify-around" style={{ minWidth: '240px', gap: isLastRound ? '0' : '80px' }}>
              <div className="mb-4 text-center">
                <h3 className="inline-flex rounded-full bg-slate-100 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-slate-700">
                  {isLastRound ? 'Final' : `Round ${round}`}
                </h3>
              </div>
              
              <div className="flex flex-col justify-around" style={{ gap: isLastRound ? '0' : '80px' }}>
                {bracket[round].map((match, matchIndex) => {
                  const hasWinner = match.winner
                  const teamAWon = match.winner === match.teamAId
                  const teamBWon = match.winner === match.teamBId
                  const isTeamAHighlighted = highlightTeamIds.has(match.teamAId)
                  const isTeamBHighlighted = highlightTeamIds.has(match.teamBId)
                  
                  const teamAColor = getTeamColor(match, true)
                  const teamBColor = getTeamColor(match, false)

                  return (
                    <div key={match.gameNumber} className="relative" style={{ marginBottom: isLastRound ? 0 : matchIndex < bracket[round].length - 1 ? '0' : '0' }}>
                      {/* Bracket Lines - Connect to next round */}
                      {roundIndex < rounds.length - 1 && (
                        <>
                          {/* Horizontal line to the right */}
                          <div 
                            className="absolute bg-slate-400" 
                            style={{ 
                              right: '-48px',
                              top: '50%',
                              width: '48px',
                              height: '3px',
                              zIndex: 0
                            }} 
                          />
                          {/* Vertical connector for pairs */}
                          {matchIndex % 2 === 0 && matchIndex < bracket[round].length - 1 && (
                            <div 
                              className="absolute bg-slate-400" 
                              style={{ 
                                right: '-48px',
                                top: '50%',
                                width: '3px',
                                height: `${80 + 160}px`,
                                zIndex: 0
                              }} 
                            />
                          )}
                        </>
                      )}

                      <article className={`relative z-10 rounded-xl border-3 bg-white shadow-lg transition ${
                        isLastRound ? 'border-amber-400' : 'border-slate-300'
                      }`} style={{ borderWidth: isLastRound ? '3px' : '2px' }}>
                        <div className={`border-b px-3 py-2 ${
                          isLastRound ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-black ${
                              isLastRound ? 'text-amber-700' : 'text-slate-600'
                            }`}>Game {match.gameNumber}</span>
                            <div className="flex items-center gap-2">
                              {hasWinner && (
                                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                              )}
                              {onEditMatch && (
                                <button
                                  type="button"
                                  onClick={() => openEditModal(match)}
                                  className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-white hover:text-blue-600"
                                  aria-label="Edit match details"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          {(match.matchDate || match.startTime) && (
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                              <Clock className="h-3 w-3" />
                              <span>
                                {formatDateTime(match.matchDate || event?.startDate, match.startTime) || 'Date & Time TBA'}
                              </span>
                            </div>
                          )}
                          {match.venue && (
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                              <MapPin className="h-3 w-3" />
                              <span>{match.venue}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          {/* Team A */}
                          <button
                            type="button"
                            onClick={() => handleWinnerSelect(match, match.teamAId, match.teamAName)}
                            disabled={!onEditMatch}
                            className={`group relative w-full rounded-lg border-3 px-3 py-2 text-left transition ${
                              teamAWon
                                ? 'border-green-500 bg-green-50'
                                : hasWinner
                                ? 'border-slate-200 bg-slate-50 opacity-50'
                                : isTeamAHighlighted
                                ? `border-${teamAColor === 'pink' ? 'rose' : 'blue'}-400 bg-${teamAColor === 'pink' ? 'rose' : 'blue'}-50 ring-2 ring-${teamAColor === 'pink' ? 'rose' : 'blue'}-200`
                                : `border-${teamAColor === 'pink' ? 'rose' : 'blue'}-300 bg-${teamAColor === 'pink' ? 'rose' : 'blue'}-50 hover:border-${teamAColor === 'pink' ? 'rose' : 'blue'}-400`
                            } ${onEditMatch ? 'cursor-pointer' : 'cursor-default'}`}
                            style={{ 
                              borderWidth: '2px',
                              backgroundColor: teamAWon ? '#f0fdf4' : hasWinner ? '#f8fafc' : teamAColor === 'pink' ? '#ffe4e6' : '#dbeafe',
                              borderColor: teamAWon ? '#22c55e' : hasWinner ? '#e2e8f0' : isTeamAHighlighted ? (teamAColor === 'pink' ? '#fb7185' : '#60a5fa') : (teamAColor === 'pink' ? '#fda4af' : '#93c5fd')
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-black text-slate-950">{match.teamAName || 'TBD'}</span>
                              {isTeamAHighlighted && !teamAWon && !hasWinner && (
                                <span className={`rounded-full px-2 py-0.5 text-xs font-black text-white`}
                                  style={{ backgroundColor: teamAColor === 'pink' ? '#e11d48' : '#2563eb' }}>
                                  YOU
                                </span>
                              )}
                              {teamAWon && <span className="text-xl font-black text-green-600">✓</span>}
                            </div>
                          </button>

                          <div className="my-2 text-center text-xs font-bold text-slate-400">VS</div>

                          {/* Team B */}
                          <button
                            type="button"
                            onClick={() => handleWinnerSelect(match, match.teamBId, match.teamBName)}
                            disabled={!onEditMatch}
                            className={`group relative w-full rounded-lg border-3 px-3 py-2 text-left transition ${
                              teamBWon
                                ? 'border-green-500 bg-green-50'
                                : hasWinner
                                ? 'border-slate-200 bg-slate-50 opacity-50'
                                : isTeamBHighlighted
                                ? `border-${teamBColor === 'pink' ? 'rose' : 'blue'}-400 bg-${teamBColor === 'pink' ? 'rose' : 'blue'}-50 ring-2 ring-${teamBColor === 'pink' ? 'rose' : 'blue'}-200`
                                : `border-${teamBColor === 'pink' ? 'rose' : 'blue'}-300 bg-${teamBColor === 'pink' ? 'rose' : 'blue'}-50 hover:border-${teamBColor === 'pink' ? 'rose' : 'blue'}-400`
                            } ${onEditMatch ? 'cursor-pointer' : 'cursor-default'}`}
                            style={{ 
                              borderWidth: '2px',
                              backgroundColor: teamBWon ? '#f0fdf4' : hasWinner ? '#f8fafc' : teamBColor === 'pink' ? '#ffe4e6' : '#dbeafe',
                              borderColor: teamBWon ? '#22c55e' : hasWinner ? '#e2e8f0' : isTeamBHighlighted ? (teamBColor === 'pink' ? '#fb7185' : '#60a5fa') : (teamBColor === 'pink' ? '#fda4af' : '#93c5fd')
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-black text-slate-950">{match.teamBName || 'TBD'}</span>
                              {isTeamBHighlighted && !teamBWon && !hasWinner && (
                                <span className={`rounded-full px-2 py-0.5 text-xs font-black text-white`}
                                  style={{ backgroundColor: teamBColor === 'pink' ? '#e11d48' : '#2563eb' }}>
                                  YOU
                                </span>
                              )}
                              {teamBWon && <span className="text-xl font-black text-green-600">✓</span>}
                            </div>
                          </button>
                        </div>
                      </article>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Match Details Modal */}
      {editingMatch && (
        <div className="fixed inset-0 z-[120] grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-slate-950">Edit Match Details</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Game {editingMatch.gameNumber}: {editingMatch.teamAName} vs {editingMatch.teamBName}
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block text-sm font-bold text-slate-700">
                Match Date
                {dateOptions.length > 0 ? (
                  <select
                    value={editForm.matchDate}
                    onChange={(e) => setEditForm({ ...editForm, matchDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Select date</option>
                    {dateOptions.map((date) => (
                      <option key={date} value={date}>
                        {formatDate(date)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="date"
                    value={editForm.matchDate}
                    onChange={(e) => setEditForm({ ...editForm, matchDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                )}
              </label>

              <label className="block text-sm font-bold text-slate-700">
                Match Time
                <input
                  type="time"
                  value={editForm.startTime}
                  onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="block text-sm font-bold text-slate-700">
                Venue/Location
                <input
                  type="text"
                  value={editForm.venue}
                  onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                  placeholder="e.g., Court 1, Main Arena, Field A"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={closeEditModal}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveMatchDetails}
                className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Winner Confirmation Modal */}
      {confirmWinner && (
        <div className="fixed inset-0 z-[130] grid place-items-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Trophy className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="mt-4 text-xl font-black text-slate-950">Confirm Winner</h3>
              <p className="mt-2 text-sm text-slate-600">
                {confirmWinner.match.winner 
                  ? `Are you sure you want to change the winner to ${confirmWinner.winnerName}?`
                  : `Are you sure you want to set ${confirmWinner.winnerName} as the winner?`
                }
              </p>
              <p className="mt-2 text-xs font-bold text-slate-500">
                Game {confirmWinner.match.gameNumber}
              </p>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmWinner(null)}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmWinnerSelection}
                className="flex-1 rounded-2xl bg-green-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
