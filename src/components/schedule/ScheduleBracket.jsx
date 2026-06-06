export default function ScheduleBracket({ bracket, eventDate, onEditMatch }) {
  const rounds = Object.keys(bracket).sort((a, b) => Number(a) - Number(b))

  if (!rounds.length) {
    return <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm font-semibold text-slate-500">No matches scheduled yet.</p>
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-2">
      {rounds.map((round) => (
        <div key={round} className="min-w-[220px] shrink-0">
          <h3 className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">Round {round}</h3>
          <div className="grid gap-3">
            {bracket[round].map((match) => (
              <article key={match.gameNumber} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-xs font-black text-blue-600">Game {match.gameNumber}</p>
                <p className="mt-2 text-sm font-bold text-slate-950">{match.teamAName}</p>
                <p className="text-center text-xs font-semibold text-slate-400">vs</p>
                <p className="text-sm font-bold text-slate-950">{match.teamBName}</p>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  {eventDate ? `${eventDate} ` : ''}
                  {match.startTime || 'TBA'}
                </p>
                {onEditMatch ? (
                  <input
                    type="time"
                    value={match.startTime || ''}
                    onChange={(e) => onEditMatch(match.gameNumber, { startTime: e.target.value })}
                    className="mt-2 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs"
                  />
                ) : null}
              </article>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
