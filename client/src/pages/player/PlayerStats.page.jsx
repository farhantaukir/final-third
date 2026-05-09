import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import toast from 'react-hot-toast';
import StatCard from '../../components/StatCard.component';
import * as statsService from '../../services/stats.service';

export default function PlayerStatsPage() {
  const [summary, setSummary] = useState({
    matchesPlayed: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
  });
  const [perMatch, setPerMatch] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await statsService.fetchPlayerPersonalStats();
        if (!response.success) {
          toast.error(response.message || 'Stats unavailable');
          return;
        }
        const body = response.data;
        setSummary(
          body.summary ?? {
            matchesPlayed: 0,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
          },
        );
        setPerMatch(body.perMatch ?? []);
      } catch {
        toast.error('Unable to retrieve stats dossier');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartData = useMemo(
    () =>
      perMatch.map((entry) => ({
        label: `${entry.opponent}`,
        goals: entry.goals,
        assists: entry.assists,
      })),
    [perMatch],
  );

  return (
    <div className="space-y-8">
      <header className="ft-surface p-6 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl">
        <p className="text-xs uppercase tracking-wide text-emerald-700">Performance</p>
        <h1 className="text-4xl font-extrabold text-slate-900">Personal stats</h1>
        <p className="text-sm text-slate-600">
          Your career statistics across all matches — totals, charts, and per-match breakdown.
        </p>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Loading statistics…
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Matches played" value={summary.matchesPlayed} />
            <StatCard label="Goals" value={summary.goals} />
            <StatCard label="Assists" value={summary.assists} />
            <StatCard label="Yellow cards" value={summary.yellowCards} />
            <StatCard label="Red cards" value={summary.redCards} />
          </div>

          <section className="ft-surface p-6 border-l-4 border-l-green-500 rounded-2xl">
            <h2 className="text-xl font-extrabold text-slate-900">Goals & Assists by Match</h2>
            <p className="text-sm text-slate-600">
              Performance breakdown for each match you have appeared in.
            </p>
            <div className="mt-6 h-[320px]">
              {!chartData.length ? (
                <p className="text-sm text-slate-500">Awaiting tracked matches.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="label" angle={-20} interval={0} height={75} tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="goals" fill="#047857" name="Goals" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="assists" fill="#0ea5e9" name="Assists" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <section className="ft-surface p-6 border-l-4 border-l-indigo-500 rounded-2xl">
            <h2 className="text-xl font-extrabold text-slate-900">Match-by-Match Breakdown</h2>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="ft-table-header">
                  <tr>
                    <th className="px-3 py-2">Opponent</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Goals</th>
                    <th className="px-3 py-2">Assists</th>
                    <th className="px-3 py-2 text-amber-700">Yellows</th>
                    <th className="px-3 py-2 text-rose-700">Reds</th>
                  </tr>
                </thead>
                <tbody>
                  {perMatch.length ? (
                    perMatch.map((entry) => (
                      <tr key={`${entry.opponent}-${entry.date}`} className="ft-table-row">
                        <td className="px-3 py-2 font-extrabold text-slate-900">{entry.opponent}</td>
                        <td className="px-3 py-2">
                          {new Intl.DateTimeFormat(undefined, {
                            dateStyle: 'medium',
                          }).format(new Date(entry.date))}
                        </td>
                        <td className="px-3 py-2">{entry.goals}</td>
                        <td className="px-3 py-2">{entry.assists}</td>
                        <td className="px-3 py-2">{entry.yellowCards}</td>
                        <td className="px-3 py-2">{entry.redCards}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={6}>
                        No statistics recorded yet. Stats will appear here once they are logged by an admin.
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
