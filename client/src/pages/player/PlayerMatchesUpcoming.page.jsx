import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as matchService from '../../services/match.service';

function LineupPreview({ starters = [], substitutes = [] }) {
  const hasData = starters.length + substitutes.length > 0;

  if (!hasData) {
    return (
      <p className="text-sm text-amber-900">
        Lineup not published yet — your coach is still deliberating.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 text-sm">
      <div>
        <p className="text-xs uppercase text-slate-500">Starters</p>
        <ul className="mt-2 space-y-1">
          {starters.map((player) => (
            <li key={player._id}>{player.name}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs uppercase text-slate-500">Bench</p>
        <ul className="mt-2 space-y-1">
          {substitutes.map((player) => (
            <li key={player._id}>{player.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function PlayerMatchesUpcomingPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await matchService.fetchClubUpcomingMatches();
        if (response.success) {
          setMatches(response.data ?? []);
        }
      } catch (error) {
        const message = error.response?.data?.message;
        if (message === 'No club assigned to this account') {
          setMatches([]);
          return;
        }
        toast.error(message || 'Unable to load schedule');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <header className="ft-surface p-6 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Matches</p>
        <h1 className="mt-2 text-4xl font-extrabold text-slate-900 tracking-tight">Upcoming Matches</h1>
        <p className="mt-2 text-base text-slate-700 font-medium">Your club's scheduled fixtures and published lineups.</p>
      </header>

      {loading ? (
        <div className="ft-surface p-6 text-sm text-slate-500 font-medium shadow-sm">
          Loading matches…
        </div>
      ) : matches.length ? (
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match._id} className="ft-surface p-6 border-l-4 border-l-green-500 hover:shadow-md transition-shadow rounded-2xl">
              <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">vs {match.opponent}</p>
              <h3 className="font-extrabold text-2xl text-gray-900 mb-2">{match.club?.name}</h3>
              <div className="flex flex-col gap-1 mt-2">
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  📅 {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
                    new Date(match.date),
                  )}
                </p>
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">🏟️ {match.venue}</p>
              </div>
              <div className="mt-4 border-t border-slate-100 pt-4">
                <LineupPreview starters={match.startingLineup} substitutes={match.substitutes} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          No upcoming matches scheduled for your club.
        </div>
      )}
    </div>
  );
}
