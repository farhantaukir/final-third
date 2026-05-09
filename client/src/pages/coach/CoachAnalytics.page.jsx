import { useEffect, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';
import StatCard from '../../components/StatCard.component';
import * as statsService from '../../services/stats.service';

export default function CoachAnalyticsPage() {
  const [record, setRecord] = useState({
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    leaguePosition: null,
    leagueSize: 0,
  });
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await statsService.fetchCoachSquadStats();
        if (!response.success) {
          toast.error(response.message || 'Analytics unavailable');
          return;
        }
        const recordData = response.data.record ?? { played: 0, wins: 0, draws: 0, losses: 0 };
        setRecord({
          ...recordData,
          leaguePosition: response.data.leaguePosition ?? null,
          leagueSize: response.data.leagueSize ?? 0,
        });
        setLeaderboard(response.data.leaderboard ?? []);
      } catch {
        toast.error('Unable to load squad analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const piePieces = useMemo(
    () => [
      { name: 'Wins', value: record.wins ?? 0, fill: '#047857' },
      { name: 'Draws', value: record.draws ?? 0, fill: '#94a3b8' },
      { name: 'Losses', value: record.losses ?? 0, fill: '#e11d48' },
    ],
    [record],
  );

  return (
    <div className="space-y-8">
      <header className="ft-surface p-6 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl">
        <p className="text-xs uppercase tracking-wide text-emerald-700">Analytics</p>
        <h1 className="text-4xl font-extrabold text-slate-900">Squad performance</h1>
        <p className="text-sm text-slate-600">
          Club record from completed matches and per-player performance stats.
        </p>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Loading analytics…
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Played" value={record.played} />
            <StatCard label="Wins" value={record.wins} />
            <StatCard label="Draws" value={record.draws} />
            <StatCard
              label="League Position"
              value={
                record.leaguePosition
                  ? `${record.leaguePosition}${record.leagueSize ? ` / ${record.leagueSize}` : ''}`
                  : 'N/A'
              }
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="ft-surface p-6 border-l-4 border-l-green-500 rounded-2xl">
              <h2 className="text-lg font-extrabold text-slate-900">Win / Draw / Loss</h2>
              <div className="mt-6 h-[280px]">
                {!record.played ? (
                  <p className="text-sm text-slate-500">No completed matches yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={piePieces} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                        {piePieces.map((slice) => (
                          <Cell key={slice.name} fill={slice.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            <section className="ft-surface p-6 border-l-4 border-l-green-500 rounded-2xl">
              <h2 className="text-lg font-extrabold text-slate-900">League Position Snapshot</h2>
              <div className="mt-6 flex h-[280px] items-center justify-center">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Current Rank</p>
                  <p className="mt-2 text-5xl font-bold text-emerald-700">
                    {record.leaguePosition ?? '-'}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {record.leagueSize ? `Out of ${record.leagueSize} teams in your league` : 'No league standing data yet'}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    W-D-L: {record.wins}-{record.draws}-{record.losses}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <section className="ft-surface p-6 border-l-4 border-l-indigo-500 rounded-2xl">
            <h2 className="text-xl font-extrabold text-slate-900">Squad Leaderboard</h2>
            <p className="text-sm text-slate-600">Player contributions sorted by total goals scored.</p>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="ft-table-header">
                  <tr>
                    <th className="px-3 py-2">Player</th>
                    <th className="px-3 py-2">Goals</th>
                    <th className="px-3 py-2">Assists</th>
                    <th className="px-3 py-2 text-amber-700">Yellows</th>
                    <th className="px-3 py-2 text-rose-700">Reds</th>
                    <th className="px-3 py-2">Cards</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length ? (
                    leaderboard.map((row) => (
                      <tr key={row.playerId} className="ft-table-row">
                        <td className="px-3 py-2 font-extrabold text-slate-900">{row.name}</td>
                        <td className="px-3 py-2">{row.goals}</td>
                        <td className="px-3 py-2">{row.assists}</td>
                        <td className="px-3 py-2">{row.yellowCards}</td>
                        <td className="px-3 py-2">{row.redCards}</td>
                        <td className="px-3 py-2">{row.cards ?? row.yellowCards + row.redCards}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-3 py-6 text-sm text-slate-500" colSpan={6}>
                        No player statistics recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
