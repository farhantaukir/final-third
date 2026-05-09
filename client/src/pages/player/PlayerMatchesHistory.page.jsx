import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import * as matchService from '../../services/match.service';

export default function PlayerMatchesHistoryPage() {
  const [bundle, setBundle] = useState({ matches: [], total: 0 });
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runner = async () => {
      setLoading(true);
      try {
        const response = await matchService.fetchClubMatchHistory({ page, limit });
        if (response.success) {
          setBundle({
            matches: response.data.matches ?? [],
            total: response.data.total ?? 0,
          });
        }
      } catch (error) {
        const message = error.response?.data?.message;
        if (message === 'No club assigned to this account') {
          setBundle({ matches: [], total: 0 });
          return;
        }
        toast.error(message || 'Unable to load archived fixtures');
      } finally {
        setLoading(false);
      }
    };

    runner();
  }, [page, limit]);

  const pages = Math.max(1, Math.ceil(bundle.total / limit));

  const footerLabel = useMemo(() => {
    if (!bundle.total) return '';
    const start = (page - 1) * limit + 1;
    const end = Math.min(bundle.total, page * limit);
    return `${start}-${end} of ${bundle.total}`;
  }, [bundle.total, limit, page]);

  return (
    <div className="space-y-6">
      <header className="ft-surface p-6 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Matches</p>
        <h1 className="mt-2 text-4xl font-extrabold text-slate-900 tracking-tight">Match History</h1>
        <p className="mt-2 text-base text-slate-700 font-medium">{footerLabel}</p>
      </header>

      {loading ? (
        <div className="ft-surface p-6 text-sm text-slate-500 font-medium shadow-sm">
          Loading match history…
        </div>
      ) : bundle.matches.length ? (
        <div className="space-y-4">
          {bundle.matches.map((match) => (
            <div key={match._id} className="ft-surface p-6 border-l-4 border-l-green-500 hover:shadow-md transition-shadow rounded-2xl">
              <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Final vs {match.opponent}</p>
              <h3 className="font-extrabold text-2xl text-gray-900 mb-2">{match.club?.name || 'Match'}</h3>
              <div className="flex flex-col gap-1 mt-2">
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  📅 {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
                    new Date(match.date),
                  )}
                </p>
              </div>
              <p className="mt-3 inline-block px-4 py-1.5 rounded-full font-bold text-sm bg-green-100 text-green-800">
                Score: {match.score?.own ?? '-'} — {match.score?.opponent ?? '-'}
              </p>
              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-slate-500">XI</p>
                  <ul className="mt-2 space-y-1">
                    {match.startingLineup?.map((player) => (
                      <li key={player._id}>{player.name}</li>
                    )) ?? <li className="text-slate-500">Not captured</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-500">Bench</p>
                  <ul className="mt-2 space-y-1">
                    {match.substitutes?.map((player) => (
                      <li key={player._id}>{player.name}</li>
                    )) ?? <li className="text-slate-500">None</li>}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          No completed fixtures yet.
        </div>
      )}

      <div className="flex flex-wrap justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
        <button
          className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 disabled:opacity-40"
          disabled={page === 1}
          type="button"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
        >
          Previous
        </button>
        <p className="text-slate-600">
          Page {page} / {pages}
        </p>
        <button
          className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 disabled:opacity-40"
          disabled={page >= pages}
          type="button"
          onClick={() => setPage((prev) => Math.min(pages, prev + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
