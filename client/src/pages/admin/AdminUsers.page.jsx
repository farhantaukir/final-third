import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import * as authService from '../../services/auth.service';
import * as clubService from '../../services/club.service';

function UserTable({ title, users, onDelete }) {
  return (
    <div className="ft-surface rounded-2xl border-l-4 border-l-emerald-500 border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="ft-table-header">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Club</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.length ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td className="px-3 py-2 font-semibold text-slate-900">{user.name}</td>
                  <td className="px-3 py-2 text-slate-600">{user.email}</td>
                  <td className="px-3 py-2 text-slate-600">{user.club?.name ?? 'Unassigned'}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                      onClick={() => onDelete(user)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-3 py-5 text-slate-500" colSpan={4}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [data, setData] = useState({ coaches: [], players: [] });
  const [clubs, setClubs] = useState([]);
  const [clubFilter, setClubFilter] = useState('');
  const [leagueFilter, setLeagueFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [usersResp, clubsResp] = await Promise.all([
        authService.fetchManagedUsers(),
        clubService.fetchAdminClubs(),
      ]);
      if (usersResp.success) {
        setData(usersResp.data ?? { coaches: [], players: [] });
      }
      if (clubsResp.success) {
        setClubs(clubsResp.data ?? []);
      }
    } catch {
      toast.error('Unable to load coaches and players');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const leagueOptions = useMemo(() => {
    const byId = new Map();
    for (const club of clubs) {
      if (club.league?._id) byId.set(club.league._id, club.league.name);
    }
    return [...byId.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [clubs]);

  const leagueByClub = useMemo(() => {
    const map = new Map();
    for (const club of clubs) {
      map.set(club._id, club.league?._id ?? '');
    }
    return map;
  }, [clubs]);

  const filteredClubOptions = useMemo(() => {
    if (!leagueFilter) return clubs;
    return clubs.filter((club) => (club.league?._id ?? '') === leagueFilter);
  }, [clubs, leagueFilter]);

  useEffect(() => {
    if (!clubFilter) return;
    const stillValid = filteredClubOptions.some((club) => club._id === clubFilter);
    if (!stillValid) {
      setClubFilter('');
    }
  }, [clubFilter, filteredClubOptions]);

  const applyFilters = (users) =>
    users.filter((user) => {
      const currentClubId = user.club?._id ?? '';
      const currentLeagueId = currentClubId ? leagueByClub.get(currentClubId) ?? '' : '';
      if (clubFilter && currentClubId !== clubFilter) return false;
      if (leagueFilter && currentLeagueId !== leagueFilter) return false;
      return true;
    });

  const coaches = useMemo(() => {
    const base = [...(data.coaches ?? [])].sort((a, b) => a.name.localeCompare(b.name));
    return applyFilters(base);
  }, [data.coaches, clubFilter, leagueFilter, leagueByClub]);
  const players = useMemo(() => {
    const base = [...(data.players ?? [])].sort((a, b) => a.name.localeCompare(b.name));
    return applyFilters(base);
  }, [data.players, clubFilter, leagueFilter, leagueByClub]);

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name}? This action cannot be undone.`)) {
      return;
    }
    try {
      const response = await authService.deleteManagedUser(user._id);
      if (!response.success) {
        toast.error(response.message || 'Unable to delete user');
        return;
      }
      toast.success('User deleted');
      await loadUsers();
    } catch {
      toast.error('Unable to delete user');
    }
  };

  return (
    <div className="space-y-8">
      <header className="ft-surface p-6 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl">
        <p className="text-xs uppercase tracking-wide text-emerald-700 font-bold mb-1">Administration</p>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Manage Coaches and Players</h1>
        <p className="mt-2 text-sm text-slate-600">
          Superuser controls for reviewing and removing coach and player accounts.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            value={leagueFilter}
            onChange={(event) => setLeagueFilter(event.target.value)}
          >
            <option value="">All leagues</option>
            {leagueOptions.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            value={clubFilter}
            onChange={(event) => setClubFilter(event.target.value)}
          >
            <option value="">All clubs</option>
            {filteredClubOptions.map((club) => (
              <option key={club._id} value={club._id}>
                {club.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => {
              setLeagueFilter('');
              setClubFilter('');
            }}
          >
            Clear Filters
          </button>
        </div>
      </header>

      {loading ? (
        <div className="ft-surface rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Loading users...
        </div>
      ) : (
        <div className="grid gap-8">
          <UserTable title="Coaches" users={coaches} onDelete={handleDelete} />
          <UserTable title="Players" users={players} onDelete={handleDelete} />
        </div>
      )}
    </div>
  );
}
