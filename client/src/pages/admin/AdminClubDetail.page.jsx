import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as clubService from '../../services/club.service';

const POSITION_OPTIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

export default function AdminClubDetailPage() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [coachOptions, setCoachOptions] = useState([]);
  const [leagueOptions, setLeagueOptions] = useState([]);
  const [coachSelection, setCoachSelection] = useState('');
  const [leagueSelection, setLeagueSelection] = useState('');
  const [homeVenue, setHomeVenue] = useState('');
  const [playerSearch, setPlayerSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClub = async () => {
      setLoading(true);
      try {
        const response = await clubService.fetchClubDetail(clubId);
        if (!response.success || !response.data) {
          toast.error(response.message || 'Club not found');
          navigate('/admin/clubs');
          return;
        }
        setDetail(response.data);

        const coachesResp = await clubService.fetchCoachOptions();
        if (coachesResp.success) {
          setCoachOptions(coachesResp.data ?? []);
        }
        setLeagueOptions(response.data.leagues ?? []);
        setCoachSelection(response.data.club?.coach?._id ?? '');
        setLeagueSelection(response.data.club?.league?._id ?? '');
        setHomeVenue(response.data.club?.homeVenue ?? '');
      } catch {
        toast.error('Unable to load club detail');
        navigate('/admin/clubs');
      } finally {
        setLoading(false);
      }
    };

    loadClub();
  }, [clubId, navigate]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const response = await clubService.fetchClubDetail(clubId);
      if (!response.success || !response.data) {
        toast.error(response.message || 'Club details unavailable');
        return;
      }
      setDetail(response.data);
      const coachesResp = await clubService.fetchCoachOptions();
      if (coachesResp.success) {
        setCoachOptions(coachesResp.data ?? []);
      }
      setLeagueOptions(response.data.leagues ?? []);
      setCoachSelection(response.data.club?.coach?._id ?? '');
      setLeagueSelection(response.data.club?.league?._id ?? '');
      setHomeVenue(response.data.club?.homeVenue ?? '');
    } catch {
      toast.error('Unable to refresh club detail');
    } finally {
      setLoading(false);
    }
  };



  const filteredPlayers = useMemo(() => {
    const term = playerSearch.trim().toLowerCase();
    if (!detail?.unassignedPlayers) return [];
    if (!term) return detail.unassignedPlayers;
    return detail.unassignedPlayers.filter((player) =>
      `${player.name} ${player.email}`.toLowerCase().includes(term),
    );
  }, [detail, playerSearch]);

  const handleAssignCoach = async () => {
    if (!coachSelection) {
      toast.error('Select a coach first');
      return;
    }
    try {
      const response = await clubService.assignCoachToClub(clubId, coachSelection);
      if (!response.success) {
        toast.error(response.message || 'Unable to assign coach');
        return;
      }
      toast.success('Coach assigned');
      await loadDetail();
    } catch {
      toast.error('Unable to assign coach');
    }
  };

  const handleAddPlayer = async (playerId) => {
    try {
      const response = await clubService.addPlayerToClubRoster(clubId, playerId);
      if (!response.success) {
        toast.error(response.message || 'Unable to add player');
        return;
      }
      toast.success('Player added');
      await loadDetail();
    } catch {
      toast.error('Unable to add player');
    }
  };

  const handleAssignLeague = async () => {
    try {
      const response = await clubService.assignLeagueToClub(clubId, leagueSelection || null);
      if (!response.success) {
        toast.error(response.message || 'Unable to assign league');
        return;
      }
      toast.success('League assignment updated');
      await loadDetail();
    } catch {
      toast.error('Unable to assign league');
    }
  };

  const handleDeleteClub = async () => {
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
      navigate('/admin/clubs');
    } catch {
      toast.error('Unable to delete club');
    }
  };

  const handleSaveHomeVenue = async () => {
    if (!homeVenue.trim()) {
      toast.error('Home venue is required');
      return;
    }
    try {
      const response = await clubService.updateClubHomeVenue(clubId, homeVenue.trim());
      if (!response.success) {
        toast.error(response.message || 'Unable to update home venue');
        return;
      }
      toast.success('Home venue updated');
      await loadDetail();
    } catch {
      toast.error('Unable to update home venue');
    }
  };

  const handleRemovePlayer = async (playerId) => {
    if (!window.confirm('Remove this player from the club roster?')) {
      return;
    }
    try {
      const response = await clubService.removePlayerFromClubRoster(clubId, playerId);
      if (!response.success) {
        toast.error(response.message || 'Unable to remove player');
        return;
      }
      toast.success('Player removed');
      await loadDetail();
    } catch {
      toast.error('Unable to remove player');
    }
  };

  const handlePositionChange = async (playerId, position) => {
    try {
      const response = await clubService.updateClubPlayerPosition(clubId, playerId, position);
      if (!response.success) {
        toast.error(response.message || 'Unable to update position');
        return;
      }
      toast.success('Position updated');
      await loadDetail();
    } catch {
      toast.error('Unable to update position');
    }
  };

  if (loading || !detail) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        Loading club details…
      </div>
    );
  }

  const { club, roster } = detail;

  return (
    <div className="space-y-8">
      <header className="ft-surface p-6 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link className="text-sm font-semibold text-emerald-700 hover:text-emerald-900" to="/admin/clubs">
            ← All Clubs
          </Link>
          <h1 className="mt-2 text-4xl font-extrabold text-slate-900 tracking-tight">{club.name}</h1>
          <p className="text-sm font-medium text-slate-600 mt-2">
            <span className="font-semibold text-emerald-700">{club.league?.name ?? 'Unassigned'}</span> &bull; {club.homeCity} &bull; {club.homeVenue} &bull; Est. {club.foundingYear}
          </p>
        </div>
        <div className="text-right text-sm text-slate-600 space-y-2 bg-white/60 p-4 rounded-xl backdrop-blur-sm border border-emerald-100">
          <p className="font-bold text-slate-900 uppercase tracking-widest text-xs text-emerald-700">Head coach</p>
          <p className="font-semibold text-slate-800 text-lg">{club.coach?.name ?? 'Not assigned'}</p>
          <button
            type="button"
            className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-50 mt-2 transition"
            onClick={handleDeleteClub}
          >
            Delete Club
          </button>
        </div>
      </header>

      <section className="ft-surface rounded-2xl border-l-4 border-l-emerald-500 border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Home Venue</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            className="flex-1 min-w-[240px] rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            value={homeVenue}
            onChange={(event) => setHomeVenue(event.target.value)}
          />
          <button
            type="button"
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            onClick={handleSaveHomeVenue}
          >
            Save Venue
          </button>
        </div>
      </section>

      <section className="ft-surface rounded-2xl border-l-4 border-l-emerald-500 border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Assign League</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <select
            className="flex-1 min-w-[240px] rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            value={leagueSelection}
            onChange={(event) => setLeagueSelection(event.target.value)}
          >
            <option value="">Unassigned</option>
            {leagueOptions.map((league) => (
              <option key={league._id} value={league._id}>
                {league.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            onClick={handleAssignLeague}
          >
            Save League
          </button>
        </div>
      </section>

      <section className="ft-surface rounded-2xl border-l-4 border-l-emerald-500 border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Assign Coach</h2>
        <p className="mt-1 text-sm text-slate-600">
          If the selected coach is currently assigned to another club, they will be reassigned automatically.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <select
            className="flex-1 min-w-[240px] rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            value={coachSelection}
            onChange={(event) => setCoachSelection(event.target.value)}
          >
            <option value="">Select a coach…</option>
            {coachOptions.map((coach) => (
              <option key={coach._id} value={coach._id}>
                {coach.name}{' '}
                {coach.club?.name
                  ? `(currently • ${coach.club.name})`
                  : '(unassigned)'}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            onClick={handleAssignCoach}
          >
            Assign Coach
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Add Players</h2>
            <p className="text-sm text-slate-600">
              Only players not currently assigned to any club are shown below.
            </p>
          </div>
          <input
            className="w-full max-w-sm rounded-xl border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 md:w-72"
            placeholder="Search available players…"
            value={playerSearch}
            onChange={(event) => setPlayerSearch(event.target.value)}
          />
        </div>

        <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-100">
          {filteredPlayers.length ? (
            filteredPlayers.map((player) => (
              <div
                key={player._id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{player.name}</p>
                  <p className="text-xs text-slate-500">{player.email}</p>
                </div>
                <button
                  type="button"
                  className="rounded-xl border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                  onClick={() => handleAddPlayer(player._id)}
                >
                  Add to club
                </button>
              </div>
            ))
          ) : (
            <p className="px-4 py-6 text-sm text-slate-500">No available players found.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Current Roster</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Player</th>
                <th className="px-3 py-2">Position</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roster.length ? (
                roster.map((player) => (
                  <tr key={player._id}>
                    <td className="px-3 py-3">
                      <div className="font-semibold text-slate-900">{player.name}</div>
                      <div className="text-xs text-slate-500">{player.email}</div>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        value={player.position ?? ''}
                        onChange={(event) => {
                          const next = event.target.value;
                          if (!next) {
                            toast.error('Please select a position');
                            return;
                          }
                          handlePositionChange(player._id, next);
                        }}
                      >
                        <option value="">Select position…</option>
                        {POSITION_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                        onClick={() => handleRemovePlayer(player._id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-3 py-6 text-slate-500" colSpan={3}>
                    No players in this club. Use the section above to add players.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
