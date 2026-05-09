import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import * as matchService from '../../services/match.service';

function LineupReadOnly({ starters = [], substitutes = [] }) {
  const hasLineup = starters.length + substitutes.length > 0;
  if (!hasLineup) {
    return (
      <p className="text-sm text-amber-800">
        Lineup was not set for this match.
      </p>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 text-sm">
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500">Starters</p>
        <ul className="mt-2 space-y-1">
          {starters.map((player) => (
            <li key={player._id}>{player.name}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500">Bench</p>
        <ul className="mt-2 space-y-1">
          {substitutes.map((player) => (
            <li key={player._id}>{player.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function CoachMatchesHistoryPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [bundle, setBundle] = useState({ matches: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runner = async () => {
      setLoading(true);
      try {
        const response = await matchService.fetchClubMatchHistory({
          page,
          limit,
        });
        if (!response.success) {
          toast.error(response.message || 'Unable to retrieve history');
          return;
        }
        setBundle({
          matches: response.data.matches ?? [],
          total: response.data.total ?? 0,
        });
      } catch (error) {
        const message = error.response?.data?.message;
        if (message === 'No club assigned to this account') {
          setBundle({ matches: [], total: 0 });
          return;
        }
        toast.error(message || 'Unable to retrieve history');
      } finally {
        setLoading(false);
      }
    };

    runner();
  }, [limit, page]);

  const pages = Math.max(1, Math.ceil(bundle.total / limit));

  const rangeLabel = useMemo(() => {
    if (!bundle.total) return 'Showing 0 results';
    const start = (page - 1) * limit + 1;
    const end = Math.min(bundle.total, page * limit);
    return `Showing ${start}-${end} of ${bundle.total}`;
  }, [bundle.total, limit, page]);

  return (
    <div className="space-y-6">
      <header className="ft-surface p-6 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Matches</p>
        <h1 className="mt-2 text-4xl font-extrabold text-slate-900 tracking-tight">Match history</h1>
        <p className="mt-2 text-base text-slate-700 font-medium">{rangeLabel}</p>
      </header>

      <div className="space-y-4">
        {loading ? (
          <div className="ft-surface p-6 text-sm text-slate-500 font-medium shadow-sm">
            Loading match history…
          </div>
        ) : bundle.matches.length ? (
          bundle.matches.map((match) => (
            <div key={match._id} className="ft-surface p-6 border-l-4 border-l-green-500 hover:shadow-md transition-shadow rounded-2xl">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Completed</p>
                  <h3 className="font-extrabold text-2xl text-gray-900 mb-2">{match.opponent}</h3>
                  <div className="flex flex-col gap-1 mt-2">
                    <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      📅 {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
                        new Date(match.date),
                      )}
                    </p>
                  </div>
                  <p className="mt-3 inline-block px-4 py-1.5 rounded-full font-bold text-sm bg-green-100 text-green-800">
                    Score: {match.score?.own ?? '-'} · {match.score?.opponent ?? '-'}
                  </p>
                </div>
              </div>
              <div className="mt-4 border-t border-slate-100 pt-4">
                <LineupReadOnly starters={match.startingLineup} substitutes={match.substitutes} />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            No completed matches yet for your club.
          </div>
        )}
      </div>

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
