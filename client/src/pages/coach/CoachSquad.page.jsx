import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as matchService from '../../services/match.service';
import * as communicationService from '../../services/communication.service';
import FeedbackModal from '../../components/FeedbackModal.component';

export default function CoachSquadPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalPlayer, setModalPlayer] = useState(null);
  const [modalBusy, setModalBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await matchService.fetchCoachSquadOptions();
      if (response.success) {
        setPlayers(response.data ?? []);
      }
    } catch {
      toast.error('Unable to load squad roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const deliverFeedback = async (message) => {
    if (!modalPlayer) return;
    setModalBusy(true);
    try {
      const response = await communicationService.postFeedback({
        playerId: modalPlayer._id,
        message,
      });
      if (!response.success) {
        toast.error(response.message || 'Unable to send feedback');
        return;
      }
      toast.success('Feedback delivered');
      setModalPlayer(null);
    } catch {
      toast.error('Unable to send feedback');
    } finally {
      setModalBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="ft-surface p-6 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl">
        <p className="text-xs uppercase tracking-wide text-emerald-700">Squad</p>
        <h1 className="text-4xl font-extrabold text-slate-900">Squad Roster</h1>
        <p className="text-sm text-slate-600">
          View player profiles, check positions, and send individual feedback.
        </p>
      </header>

      <div className="ft-surface p-6 border-l-4 border-l-green-500 rounded-2xl">
        {loading ? (
          <p className="text-sm text-slate-500">Loading roster…</p>
        ) : players.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="ft-table-header">
                <tr>
                  <th className="px-3 py-2">Player</th>
                  <th className="px-3 py-2">Position</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr key={player._id} className="ft-table-row">
                    <td className="px-3 py-3">
                      <div className="font-extrabold text-slate-900">{player.name}</div>
                      <div className="text-xs text-slate-500">{player.email}</div>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{player.position || '—'}</td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          className="rounded-lg border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                          to={`/coach/squad/player/${player._id}`}
                        >
                          View Profile
                        </Link>
                        <button
                          type="button"
                          className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                          onClick={() => setModalPlayer(player)}
                        >
                          Send Feedback
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-600">No players assigned to your club yet.</p>
        )}
      </div>

      <FeedbackModal
        loading={modalBusy}
        open={Boolean(modalPlayer)}
        title={modalPlayer ? `Message ${modalPlayer.name}` : 'Send feedback'}
        onClose={() => setModalPlayer(null)}
        onSubmit={deliverFeedback}
      />
    </div>
  );
}
