import { useEffect, useMemo, useState } from 'react';
import * as statsService from '../../services/stats.service';
import * as clubService from '../../services/club.service';

export default function AdminStandingsPage() {
  const [standings, setStandings] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [leagueId, setLeagueId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [standingsResp, leaguesResp] = await Promise.all([
          statsService.fetchAdminStandings(leagueId || undefined),
          clubService.fetchLeagues(),
        ]);
        const response = standingsResp;
        if (response.success) {
          setStandings(response.data ?? []);
        }
        if (leaguesResp.success) {
          setLeagues(leaguesResp.data ?? []);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [leagueId]);

  const ordered = useMemo(
    () => [...standings].sort((left, right) => right.wins - left.wins),
    [standings],
  );

  return (
    <div className="space-y-6">
      <header className="ft-surface p-6 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl">
        <p className="text-xs uppercase tracking-wide text-emerald-700 font-bold mb-1">Standings</p>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">League Table</h1>
        <p className="mt-2 text-sm text-slate-600">
          Club standings calculated from completed match results.
        </p>
        <div className="mt-4 max-w-xs">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="league-filter">
            Filter by League
          </label>
          <select
            id="league-filter"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            value={leagueId}
            onChange={(event) => setLeagueId(event.target.value)}
          >
            <option value="">All leagues</option>
            {leagues.map((league) => (
              <option key={league._id} value={league._id}>
                {league.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="ft-surface overflow-x-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-500">Loading standings…</p>
        ) : ordered.length ? (
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="ft-table-header">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Club</th>
                <th className="px-3 py-2">League</th>
                <th className="px-3 py-2">P</th>
                <th className="px-3 py-2">W</th>
                <th className="px-3 py-2">D</th>
                <th className="px-3 py-2">L</th>
                <th className="px-3 py-2">GF</th>
                <th className="px-3 py-2">GA</th>
                <th className="px-3 py-2">GD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ordered.map((row) => (
                <tr key={row.clubId}>
                  <td className="px-3 py-2 font-semibold text-slate-900">{row.clubName}</td>
                  <td className="px-3 py-2">{row.leagueName}</td>
                  <td className="px-3 py-2">{row.played}</td>
                  <td className="px-3 py-2">{row.wins}</td>
                  <td className="px-3 py-2">{row.draws}</td>
                  <td className="px-3 py-2">{row.losses}</td>
                  <td className="px-3 py-2">{row.goalsFor}</td>
                  <td className="px-3 py-2">{row.goalsAgainst}</td>
                  <td className="px-3 py-2">{row.goalDifference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-slate-600">
            No completed matches yet. Record match results to generate the standings table.
          </p>
        )}
      </div>
    </div>
  );
}
