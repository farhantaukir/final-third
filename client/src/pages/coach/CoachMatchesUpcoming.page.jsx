import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as matchService from '../../services/match.service';

function LineupBlock({ starters = [], substitutes = [] }) {
  const hasLineup =
    starters.length > 0 || substitutes.length > 0;

  if (!hasLineup) {
    return (
      <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Lineup has not been set yet. Use the "Set Lineup" button to select your starting XI and substitutes.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Starting XI</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-800">
          {starters.length
            ? starters.map((player) => <li key={player._id}>{player.name}</li>)
            : <li className="text-slate-500">Not configured</li>}
        </ul>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Substitutes</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-800">
          {substitutes.length
            ? substitutes.map((player) => <li key={player._id}>{player.name}</li>)
            : <li className="text-slate-500">None selected</li>}
        </ul>
      </div>
    </div>
  );
}

export default function CoachMatchesUpcomingPage() {
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
        toast.error(message || 'Unable to load fixtures');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatKickoff = (value) =>
    new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(value),
    );

  return (
    <div className="space-y-6">
      <header className="ft-surface p-6 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Matches</p>
        <h1 className="mt-2 text-4xl font-extrabold text-slate-900 tracking-tight">Upcoming Matches</h1>
        <p className="mt-2 text-base text-slate-700 font-medium">
          View and prepare for your club's upcoming fixtures. Set your starting XI and substitutes before matchday.
        </p>
      </header>

      {loading ? (
        <div className="ft-surface p-6 text-sm text-slate-500 font-medium shadow-sm">
          Loading matches…
        </div>
      ) : matches.length ? (
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match._id} className="ft-surface p-6 border-l-4 border-l-green-500 hover:shadow-md transition-shadow rounded-2xl">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">
                    vs {match.opponent}
                  </p>
                  <h2 className="font-extrabold text-2xl text-gray-900 mb-2">
                    {match.club?.name} ·{' '}
                    <span className="text-emerald-700">{match.designation}</span>
                  </h2>
                  <div className="flex flex-col gap-1 mt-2">
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">📅 {formatKickoff(match.date)}</p>
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">🏟️ {match.venue}</p>
                  </div>
                </div>
                <Link
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                  to={`/coach/matches/${match._id}/lineup`}
                >
                  Set Lineup
                </Link>
              </div>
              <div className="mt-4 border-t border-slate-100 pt-4">
                <LineupBlock starters={match.startingLineup} substitutes={match.substitutes} />
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
