import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as matchService from '../../services/match.service';

export default function CoachMatchLineupPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [squad, setSquad] = useState([]);
  const [startingLineup, setStartingLineup] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);
  const [fixtureLabel, setFixtureLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const startersSet = useMemo(() => new Set(startingLineup.map(String)), [startingLineup]);
  const benchSet = useMemo(() => new Set(substitutes.map(String)), [substitutes]);

  const hydrate = useCallback(async () => {
    setLoading(true);
    try {
      const response = await matchService.fetchCoachLineupContext(matchId);
      if (!response.success || !response.data) {
        toast.error(response.message || 'Fixture unavailable');
        navigate('/coach/matches/upcoming');
        return;
      }

      const { match, squad: roster } = response.data;

      setSquad(roster);
      setStartingLineup(match.startingLineup?.map((player) => player._id ?? player) ?? []);
      setSubstitutes(match.substitutes?.map((player) => player._id ?? player) ?? []);

      const clubName =
        typeof match.club === 'object' && match.club?.name ? match.club.name : 'Your club';

      const title = `${clubName} vs ${match.opponent} · ${new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(match.date))}`;

      setFixtureLabel(title);
    } catch {
      toast.error('Unable to load lineup');
      navigate('/coach/matches/upcoming');
    } finally {
      setLoading(false);
    }
  }, [matchId, navigate]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const toggleStarter = (playerId) => {
    const idStr = String(playerId);
    if (benchSet.has(idStr)) {
      toast.error('This player is already on the bench. Remove them from substitutes first.');
      return;
    }

    setStartingLineup((prev) => {
      const exists = prev.map(String).includes(idStr);
      if (exists) {
        return prev.filter((candidate) => String(candidate) !== idStr);
      }
      if (prev.length >= 11) {
        toast.error('You can only name eleven starters');
        return prev;
      }
      return [...prev, playerId];
    });
  };

  const toggleBench = (playerId) => {
    const idStr = String(playerId);
    if (startersSet.has(idStr)) {
      toast.error('This player is already in the starting XI. Remove them from starters first.');
      return;
    }

    setSubstitutes((prev) => {
      const exists = prev.map(String).includes(idStr);
      if (exists) {
        return prev.filter((candidate) => String(candidate) !== idStr);
      }
      return [...prev, playerId];
    });
  };

  const handleSave = async () => {
    if (!startingLineup.length && !substitutes.length) {
      toast.error('Select at least one participant');
      return;
    }

    setSaving(true);
    try {
      const response = await matchService.updateMatchLineup(matchId, startingLineup, substitutes);
      if (!response.success) {
        toast.error(response.message || 'Unable to persist lineup');
        return;
      }
      toast.success('Lineup saved');
      navigate('/coach/matches/upcoming');
    } catch {
      toast.error('Unable to persist lineup');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
        Loading lineup…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <button
          type="button"
          className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
          onClick={() => navigate(-1)}
        >
          ← Back to Upcoming Matches
        </button>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Set Match Lineup</h1>
        <p className="text-sm text-slate-600">{fixtureLabel}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Available Players</h2>
          <p className="text-sm text-slate-600">
            Select players as starters (max 11) or substitutes for this match.
          </p>
          <div className="mt-4 space-y-3">
            {squad.map((player) => {
              const idStr = String(player._id);
              const isStarter = startersSet.has(idStr);
              const isBench = benchSet.has(idStr);

              return (
                <div
                  key={player._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{player.name}</p>
                    <p className="text-xs text-slate-500">{player.position || 'No position set'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isStarter
                          ? 'bg-emerald-600 text-white'
                          : 'border border-emerald-200 text-emerald-800'
                      }`}
                      onClick={() => toggleStarter(player._id)}
                    >
                      Starter
                    </button>
                    <button
                      type="button"
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isBench
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-200 text-slate-700'
                      }`}
                      onClick={() => toggleBench(player._id)}
                    >
                      Bench
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Starters ({startingLineup.length}/11)
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {startingLineup.length ? (
                startingLineup.map((id) => {
                  const rosterPlayer = squad.find((player) => String(player._id) === String(id));
                  return (
                    <li key={id} className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
                      <span>{rosterPlayer?.name ?? 'Athlete'}</span>
                      <button
                        type="button"
                        className="text-xs font-semibold text-emerald-800"
                        onClick={() =>
                          setStartingLineup((prev) =>
                            prev.filter((candidate) => String(candidate) !== String(id)),
                          )
                        }
                      >
                        Drop
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="text-sm text-slate-500">No starters selected yet.</li>
              )}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Substitutes
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {substitutes.length ? (
                substitutes.map((id) => {
                  const rosterPlayer = squad.find((player) => String(player._id) === String(id));
                  return (
                    <li key={id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <span>{rosterPlayer?.name ?? 'Athlete'}</span>
                      <button
                        type="button"
                        className="text-xs font-semibold text-slate-700"
                        onClick={() =>
                          setSubstitutes((prev) =>
                            prev.filter((candidate) => String(candidate) !== String(id)),
                          )
                        }
                      >
                        Drop
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="text-sm text-slate-500">No substitutes yet.</li>
              )}
            </ul>
          </div>

          <button
            disabled={saving}
            type="button"
            className="w-full rounded-2xl bg-emerald-600 py-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
            onClick={handleSave}
          >
            {saving ? 'Saving…' : 'Save Lineup'}
          </button>
        </section>
      </div>
    </div>
  );
}
