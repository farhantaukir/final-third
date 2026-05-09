import { useEffect, useState } from 'react';
import * as statsService from '../../services/stats.service';

export default function AdminLeaderboardsPage() {
  const [data, setData] = useState({ topScorers: [], topAssisters: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBoards = async () => {
      setLoading(true);
      try {
        const response = await statsService.fetchAdminLeaderboards();
        if (response.success) {
          setData(response.data);
        }
      } finally {
        setLoading(false);
      }
    };
    loadBoards();
  }, []);

  const renderRows = (rows, valueKey, valueHeading) =>
    rows.length ? (
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-3 py-2">Player</th>
            <th className="px-3 py-2">Club</th>
            <th className="px-3 py-2">{valueHeading}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row) => (
            <tr key={row.playerId}>
              <td className="px-3 py-2 font-semibold text-slate-900">{row.playerName}</td>
              <td className="px-3 py-2 text-slate-600">{row.clubName ?? 'Unsigned'}</td>
              <td className="px-3 py-2">{row[valueKey]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div className="rounded-xl border border-dashed border-slate-200 px-6 py-8 text-center text-sm text-slate-500">
        No player statistics recorded yet. Log match stats to populate this leaderboard.
      </div>
    );

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-emerald-700">Leaderboard</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Top Performers{loading ? '' : ''}</h1>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Top Scorers</h2>
          {renderRows(data.topScorers, 'totalGoals', 'Goals')}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Top Assist Providers</h2>
          {renderRows(data.topAssisters, 'totalAssists', 'Assists')}
        </div>
      </div>
    </div>
  );
}
