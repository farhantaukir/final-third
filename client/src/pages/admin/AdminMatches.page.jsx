import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import * as matchService from '../../services/match.service';
import * as clubService from '../../services/club.service';

const initialStatRow = () => ({
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
});

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleForm, setScheduleForm] = useState({
    leagueId: '',
    homeClubId: '',
    awayClubId: '',
    date: '',
    venue: '',
  });
  const [resultModal, setResultModal] = useState(null);
  const [statsModal, setStatsModal] = useState(null);
  const [statDraft, setStatDraft] = useState({});
  const [statsSubmitting, setStatsSubmitting] = useState(false);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const response = await matchService.fetchAdminMatches();
      if (response.success) {
        setMatches(response.data ?? []);
      }
    } catch {
      toast.error('Unable to load matches');
    } finally {
      setLoading(false);
    }
  };

  const loadClubs = async () => {
    try {
      const [clubsResponse, leaguesResponse] = await Promise.all([
        clubService.fetchAdminClubs(),
        clubService.fetchLeagues(),
      ]);
      if (clubsResponse.success) {
        setClubs(clubsResponse.data ?? []);
      }
      if (leaguesResponse.success) {
        setLeagues(leaguesResponse.data ?? []);
      }
    } catch {
      toast.error('Unable to load clubs and leagues');
    }
  };

  useEffect(() => {
    loadMatches();
    loadClubs();
  }, []);

  useEffect(() => {
    if (!scheduleForm.homeClubId) return;
    const homeClub = clubs.find((club) => club._id === scheduleForm.homeClubId);
    if (!homeClub) return;
    setScheduleForm((prev) => {
      if (prev.venue.trim()) return prev;
      return { ...prev, venue: homeClub.homeVenue ?? '' };
    });
  }, [scheduleForm.homeClubId, clubs]);

  const clubsInLeague = scheduleForm.leagueId
    ? clubs.filter((club) => club.league?._id === scheduleForm.leagueId)
    : [];

  const sortedMatches = useMemo(
    () => [...matches].sort((left, right) => new Date(right.date) - new Date(left.date)),
    [matches],
  );

  const handleScheduleSubmit = async (event) => {
    event.preventDefault();

    if (scheduleForm.homeClubId && scheduleForm.homeClubId === scheduleForm.awayClubId) {
      toast.error('Home and away clubs must be different');
      return;
    }

    try {
      const payload = {
        homeClubId: scheduleForm.homeClubId,
        awayClubId: scheduleForm.awayClubId,
        date: new Date(scheduleForm.date).toISOString(),
        venue: scheduleForm.venue.trim(),
      };

      const response = await matchService.createMatch(payload);
      if (!response.success) {
        toast.error(response.message || 'Unable to schedule fixture');
        return;
      }

      toast.success('Fixture scheduled');
      setScheduleForm({
        homeClubId: '',
        awayClubId: '',
        date: '',
        venue: '',
      });
      await loadMatches();
    } catch {
      toast.error('Unable to schedule fixture');
    }
  };

  const submitResult = async () => {
    if (!resultModal) return;
    try {
      const response = await matchService.recordMatchResult(
        resultModal.matchId,
        resultModal.homeScore,
        resultModal.awayScore,
      );

      if (!response.success) {
        toast.error(response.message || 'Unable to record scores');
        return;
      }

      toast.success('Result saved');
      setResultModal(null);
      await loadMatches();
    } catch {
      toast.error('Unable to record scores');
    }
  };

  const handleDeleteMatch = async (fixture) => {
    if (!window.confirm('Delete this match and any logged stats?')) {
      return;
    }
    try {
      const response = await matchService.deleteMatch(fixture._id);
      if (!response.success) {
        toast.error(response.message || 'Unable to delete match');
        return;
      }
      toast.success('Match deleted');
      await loadMatches();
    } catch {
      toast.error('Unable to delete match');
    }
  };

  const openStatsModal = async (matchId) => {
    try {
      const response = await matchService.fetchMatchStatsRoster(matchId);
      if (!response.success) {
        toast.error(response.message || 'Unable to fetch lineup');
        return;
      }

      const draft = {};
      for (const player of response.data.players ?? []) {
        draft[player._id] = initialStatRow();
      }

      const homeName = response.data.match?.homeClub?.name;
      const awayName = response.data.match?.awayClub?.name;
      const title = homeName && awayName ? `${homeName} vs ${awayName}` : 'Match';

      setStatDraft(draft);
      setStatsModal({ matchId, players: response.data.players ?? [], title });
    } catch {
      toast.error('Unable to fetch roster for stats logging');
    }
  };

  const updateStatDraft = (playerId, field, value) => {
    setStatDraft((prev) => ({
      ...prev,
      [playerId]: {
        ...initialStatRow(),
        ...(prev[playerId] || {}),
        [field]: Math.max(0, Number(value) || 0),
      },
    }));
  };

  const submitStats = async () => {
    if (!statsModal) return;
    const statsPayload = statsModal.players.map((player) => ({
      playerId: player._id,
      ...(statDraft[player._id] || initialStatRow()),
    }));

    setStatsSubmitting(true);
    try {
      const response = await matchService.submitMatchPlayerStats(statsModal.matchId, statsPayload);
      if (!response.success) {
        toast.error(response.message || 'Unable to persist stats');
        return;
      }
      toast.success('Player stats saved');
      setStatsModal(null);
      await loadMatches();
    } catch {
      toast.error('Unable to persist stats');
    } finally {
      setStatsSubmitting(false);
    }
  };

  const formatDateTime = (value) =>
    new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));

  return (
    <div className="space-y-10">
      <header className="ft-surface p-6 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">Matches</p>
        <h1 className="mt-2 text-4xl font-extrabold text-slate-900 tracking-tight">Match Management</h1>
        <p className="mt-2 text-base text-slate-700 font-medium">
          Schedule new fixtures, record final scores, and log individual player statistics.
        </p>
      </header>

      <section className="ft-surface p-6 shadow-sm rounded-2xl">
        <h2 className="text-lg font-semibold text-slate-900">Schedule New Match</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleScheduleSubmit}>
          <label className="text-sm font-medium text-slate-700 md:col-span-2">
            League
            <select
              required
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              value={scheduleForm.leagueId}
              onChange={(event) =>
                setScheduleForm({ ...scheduleForm, leagueId: event.target.value, homeClubId: '', awayClubId: '', venue: '' })
              }
            >
              <option value="">Select league…</option>
              {leagues.map((league) => (
                <option key={league._id} value={league._id}>
                  {league.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Home Club
            <select
              required
              disabled={!scheduleForm.leagueId}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
              value={scheduleForm.homeClubId}
              onChange={(event) =>
                setScheduleForm({ ...scheduleForm, homeClubId: event.target.value })
              }
            >
              <option value="">Select home club…</option>
              {clubsInLeague.map((club) => (
                <option key={club._id} value={club._id}>
                  {club.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Away Club
            <select
              required
              disabled={!scheduleForm.leagueId}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
              value={scheduleForm.awayClubId}
              onChange={(event) =>
                setScheduleForm({ ...scheduleForm, awayClubId: event.target.value })
              }
            >
              <option value="">Select away club…</option>
              {clubsInLeague
                .filter((club) => club._id !== scheduleForm.homeClubId)
                .map((club) => (
                  <option key={club._id} value={club._id}>
                    {club.name}
                  </option>
                ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Date & Time
            <input
              required
              type="datetime-local"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              value={scheduleForm.date}
              onChange={(event) => setScheduleForm({ ...scheduleForm, date: event.target.value })}
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Venue
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="Defaults to home club venue"
              value={scheduleForm.venue}
              onChange={(event) => setScheduleForm({ ...scheduleForm, venue: event.target.value })}
            />
          </label>

          <button
            type="submit"
            disabled={!scheduleForm.leagueId}
            className="md:col-span-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Schedule Match
          </button>
        </form>
      </section>

      <section className="ft-surface p-6 shadow-sm rounded-2xl mt-10">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">All Matches</h2>
            <p className="text-sm font-medium text-slate-600">{loading ? 'Loading…' : `${sortedMatches.length} matches`}</p>
          </div>
        </div>

        <div className="space-y-4">
          {sortedMatches.map((fixture) => (
            <div key={fixture._id} className="ft-surface p-6 shadow-sm border-l-4 border-l-indigo-500 rounded-xl grid gap-4 md:grid-cols-[2fr,1fr] hover:shadow-md transition-shadow">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest bg-indigo-100 text-indigo-800">
                    {fixture.status}
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 mb-2">
                  {fixture.homeClub?.name ?? 'Home Club'} <span className="text-slate-400 font-medium text-xl mx-1">vs</span> {fixture.awayClub?.name ?? 'Away Club'}
                </p>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">📅 {formatDateTime(fixture.date)}</p>
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">🏟️ {fixture.venue}</p>
                </div>
                {fixture.status === 'Completed' && fixture.score ? (
                  <div className="mt-3">
                    <span className="inline-block px-3 py-1 rounded-full font-bold text-xs bg-green-100 text-green-800">
                      Final score: {fixture.score.home} – {fixture.score.away}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 md:items-end justify-center">
                <button
                  type="button"
                  className="w-full rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 md:w-auto"
                  onClick={() => handleDeleteMatch(fixture)}
                >
                  Delete match
                </button>
                {fixture.status === 'Upcoming' ? (
                  <button
                    type="button"
                    className="w-full rounded-xl border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 md:w-auto"
                    onClick={() =>
                      setResultModal({
                        matchId: fixture._id,
                        homeScore: 0,
                        awayScore: 0,
                        label: `${fixture.homeClub?.name ?? 'Home Club'} vs ${fixture.awayClub?.name ?? 'Away Club'}`,
                      })
                    }
                  >
                    Record result
                  </button>
                ) : fixture.statsLogged ? (
                  <span className="w-full rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-500 md:w-auto">
                    Stats logged
                  </span>
                ) : (
                  <button
                    type="button"
                    className="w-full rounded-xl border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50 md:w-auto"
                    onClick={() => openStatsModal(fixture._id)}
                  >
                    Log stats
                  </button>
                )}
              </div>
            </div>
          ))}

          {!sortedMatches.length && !loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No matches scheduled yet. Use the form above to create a fixture.
            </div>
          ) : null}
        </div>
      </section>

      {resultModal ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Record final score</h3>
                <p className="text-sm text-slate-600">{resultModal.label}</p>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-slate-500 hover:text-slate-900"
                onClick={() => setResultModal(null)}
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-sm font-medium text-slate-700">
                Home goals
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  value={resultModal.homeScore}
                  onChange={(event) =>
                    setResultModal({ ...resultModal, homeScore: Number(event.target.value) })
                  }
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Away goals
                <input
                  type="number"
                  min="0"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  value={resultModal.awayScore}
                  onChange={(event) =>
                    setResultModal({ ...resultModal, awayScore: Number(event.target.value) })
                  }
                />
              </label>
            </div>

            <button
              type="button"
              className="mt-6 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              onClick={submitResult}
            >
              Save Result
            </button>
          </div>
        </div>
      ) : null}

      {statsModal ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-2 py-6">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-emerald-700">Player Statistics</p>
                <h3 className="text-2xl font-semibold text-slate-900">
                  Log Stats — {statsModal.title}
                </h3>
                <p className="text-sm text-slate-600">
                  Enter the individual performance stats for each player who participated in this match.
                </p>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-slate-500 hover:text-slate-900"
                onClick={() => setStatsModal(null)}
              >
                Close
              </button>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead>
                  <tr className="text-left font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-2 py-2">Player</th>
                    <th className="px-2 py-2">Goals</th>
                    <th className="px-2 py-2">Assists</th>
                    <th className="px-2 py-2 text-amber-600">Yellows</th>
                    <th className="px-2 py-2 text-rose-700">Reds</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {statsModal.players.map((player) => (
                    <tr key={player._id}>
                      <td className="px-2 py-2">
                        <p className="font-semibold text-slate-900">{player.name}</p>
                        <p className="text-[10px] text-slate-500">{player.club?.name ?? ''}</p>
                      </td>
                      {['goals', 'assists', 'yellowCards', 'redCards'].map((field) => (
                        <td key={`${player._id}-${field}`} className="px-2 py-2">
                          <input
                            type="number"
                            min="0"
                            className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-200"
                            value={(statDraft[player._id]?.[field] ?? 0)}
                            onChange={(event) =>
                              updateStatDraft(player._id, field, event.target.value)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              disabled={statsSubmitting}
              type="button"
              className="mt-6 w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-70"
              onClick={submitStats}
            >
              {statsSubmitting ? 'Saving…' : 'Save Statistics'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
