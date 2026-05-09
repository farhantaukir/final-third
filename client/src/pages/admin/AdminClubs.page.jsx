import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as clubService from '../../services/club.service';

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    homeCity: '',
    homeVenue: '',
    foundingYear: '',
    leagueId: '',
  });
  const [leagueForm, setLeagueForm] = useState('');
  const [saving, setSaving] = useState(false);
  const [leagueSaving, setLeagueSaving] = useState(false);

  const loadClubs = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        homeCity: form.homeCity.trim(),
        homeVenue: form.homeVenue.trim(),
        foundingYear: Number(form.foundingYear),
        leagueId: form.leagueId,
      };
      const response = await clubService.createClub(payload);
      if (!response.success) {
        toast.error(response.message || 'Unable to create club');
        return;
      }

      toast.success('Club created successfully');
      setForm({ name: '', homeCity: '', homeVenue: '', foundingYear: '', leagueId: '' });
      await loadClubs();
    } catch {
      toast.error('Unable to create club');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateLeague = async (event) => {
    event.preventDefault();
    if (!leagueForm.trim()) {
      toast.error('League name is required');
      return;
    }
    setLeagueSaving(true);
    try {
      const response = await clubService.createLeague(leagueForm.trim());
      if (!response.success) {
        toast.error(response.message || 'Unable to create league');
        return;
      }
      toast.success('League created');
      setLeagueForm('');
      await loadClubs();
    } catch {
      toast.error('Unable to create league');
    } finally {
      setLeagueSaving(false);
    }
  };

  const handleDeleteLeague = async (leagueId) => {
    if (!window.confirm('Delete this league? Clubs in this league will become unassigned.')) {
      return;
    }
    try {
      const response = await clubService.deleteLeague(leagueId);
      if (!response.success) {
        toast.error(response.message || 'Unable to delete league');
        return;
      }
      toast.success('League deleted');
      await loadClubs();
    } catch {
      toast.error('Unable to delete league');
    }
  };

  const handleDeleteClub = async (clubId) => {
    if (!window.confirm('Delete this club and all dependent club data?')) {
      return;
    }
    try {
      const response = await clubService.deleteClub(clubId);
      if (!response.success) {
        toast.error(response.message || 'Unable to delete club');
        return;
      }
      toast.success('Club deleted');
      await loadClubs();
    } catch {
      toast.error('Unable to delete club');
    }
  };

  const sortedClubs = useMemo(
    () =>
      [...clubs].sort((left, right) =>
        String(left.name).localeCompare(String(right.name)),
      ),
    [clubs],
  );

  return (
    <div className="space-y-8">
      <header className="ft-surface p-6 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl">
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 mb-1">Admin</p>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Leagues, Clubs and Rosters</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage leagues and clubs from one place. Click any club to assign coach, league, and roster.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="ft-surface border-l-4 border-l-emerald-500 rounded-2xl border-t border-r border-b border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Manage Leagues</h2>
          <form className="mt-4 flex gap-2" onSubmit={handleCreateLeague}>
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              placeholder="League name"
              value={leagueForm}
              onChange={(event) => setLeagueForm(event.target.value)}
            />
            <button
              type="submit"
              disabled={leagueSaving}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
            >
              Add
            </button>
          </form>
          <div className="mt-4 space-y-2">
            {leagues.map((league) => (
              <div key={league._id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                <p className="text-sm font-medium text-slate-800">{league.name}</p>
                <button
                  type="button"
                  className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                  onClick={() => handleDeleteLeague(league._id)}
                >
                  Delete
                </button>
              </div>
            ))}
            {!leagues.length ? <p className="text-sm text-slate-500">No leagues created yet.</p> : null}
          </div>
        </section>

        <section className="ft-surface border-l-4 border-l-emerald-500 rounded-2xl border-t border-r border-b border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">Create New Club</h2>
          <p className="text-sm text-slate-600">
            A coach can be assigned after the club is created from the club detail page.
          </p>

          <form className="mt-4 space-y-4" onSubmit={handleCreate}>
            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="name">
                Club name
              </label>
              <input
                required
                id="name"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="homeCity">
                Home city
              </label>
              <input
                required
                id="homeCity"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                value={form.homeCity}
                onChange={(event) => setForm({ ...form, homeCity: event.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="homeVenue">
                Home venue
              </label>
              <input
                required
                id="homeVenue"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                value={form.homeVenue}
                onChange={(event) => setForm({ ...form, homeVenue: event.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="league">
                League
              </label>
              <select
                required
                id="league"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                value={form.leagueId}
                onChange={(event) => setForm({ ...form, leagueId: event.target.value })}
              >
                <option value="">Select league…</option>
                {leagues.map((league) => (
                  <option key={league._id} value={league._id}>
                    {league.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700" htmlFor="foundingYear">
                Founding year
              </label>
              <input
                required
                id="foundingYear"
                type="number"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                value={form.foundingYear}
                onChange={(event) => setForm({ ...form, foundingYear: event.target.value })}
              />
            </div>

            <button
              disabled={saving}
              type="submit"
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-70"
            >
              {saving ? 'Creating…' : 'Create Club'}
            </button>
          </form>
        </section>

        <section className="ft-surface border-l-4 border-l-emerald-500 rounded-2xl border-t border-r border-b border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">All Clubs</h2>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {loading ? 'Loading…' : `${sortedClubs.length} clubs`}
            </span>
          </div>

          <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-100">
            {loading ? (
              <div className="p-6 text-sm text-slate-500">Loading clubs…</div>
            ) : sortedClubs.length ? (
              sortedClubs.map((club) => (
                <Link
                  key={club._id}
                  className="flex flex-col gap-1 px-4 py-4 transition hover:bg-slate-50"
                  to={`/admin/clubs/${club._id}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-base font-semibold text-slate-900">{club.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-700">View →</span>
                      <button
                        type="button"
                        className="rounded-lg border border-rose-200 px-2 py-1 text-[10px] font-semibold text-rose-700 hover:bg-rose-50"
                        onClick={(event) => {
                          event.preventDefault();
                          handleDeleteClub(club._id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    {club.homeCity} · {club.homeVenue} · Est. {club.foundingYear}
                  </p>
                  <p className="text-xs text-slate-500">League: {club.league?.name ?? 'Unassigned'}</p>
                  <p className="text-xs text-slate-500">
                    Coach: {club.coach?.name ?? 'Unassigned'}
                  </p>
                </Link>
              ))
            ) : (
              <div className="p-6 text-sm text-slate-500">No clubs have been created yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
