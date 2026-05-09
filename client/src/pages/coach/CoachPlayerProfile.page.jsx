import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as communicationService from '../../services/communication.service';
import FeedbackModal from '../../components/FeedbackModal.component';

export default function CoachPlayerProfilePage() {
  const { playerId } = useParams();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBusy, setModalBusy] = useState(false);
  const [note, setNote] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await communicationService.fetchCoachPlayerProfile(playerId);
      if (!response.success) {
        toast.error(response.message || 'Unable to load player profile');
        return;
      }
      setPayload(response.data);
    } catch {
      toast.error('Unable to load player profile');
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const initials = useMemo(() => {
    if (!payload?.player?.name) return '';
    return payload.player.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [payload]);

  const sendInlineFeedback = async (event) => {
    event.preventDefault();
    if (!note.trim()) {
      toast.error('Compose a note first');
      return;
    }

    setModalBusy(true);
    try {
      const response = await communicationService.postFeedback({
        playerId,
        message: note.trim(),
      });
      if (!response.success) {
        toast.error(response.message || 'Unable to send');
        return;
      }
      toast.success('Feedback logged');
      setNote('');
      await loadProfile();
    } catch {
      toast.error('Unable to send');
    } finally {
      setModalBusy(false);
    }
  };

  const sendModalFeedback = async (message) => {
    setModalBusy(true);
    try {
      const response = await communicationService.postFeedback({ playerId, message });
      if (!response.success) {
        toast.error(response.message || 'Unable to send');
        return;
      }
      toast.success('Feedback logged');
      setModalOpen(false);
      await loadProfile();
    } catch {
      toast.error('Unable to send');
    } finally {
      setModalBusy(false);
    }
  };

  if (loading || !payload) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
        Loading player profile…
      </div>
    );
  }

  const { player, careerSummary, participation, feedbackFromCoach } = payload;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
          to="/coach/squad"
        >
          ← Back to roster
        </Link>
        <button
          type="button"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          onClick={() => setModalOpen(true)}
        >
          Send Feedback
        </button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="h-28 w-28 overflow-hidden rounded-2xl border border-slate-100 bg-emerald-50">
            {player.profilePicture ? (
              <img alt={player.name} className="h-full w-full object-cover" src={player.profilePicture} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-emerald-800">
                {initials}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Player</p>
            <h1 className="text-3xl font-semibold text-slate-900">{player.name}</h1>
            <p className="text-sm text-slate-600">{player.email}</p>
            <span className="mt-3 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
              {player.position || 'Position TBD'}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Career Statistics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div>
            <p className="text-xs uppercase text-slate-500">Goals</p>
            <p className="text-2xl font-semibold text-slate-900">{careerSummary.goals}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Assists</p>
            <p className="text-2xl font-semibold text-slate-900">{careerSummary.assists}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-amber-700">Yellow cards</p>
            <p className="text-2xl font-semibold text-amber-900">{careerSummary.yellowCards}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-rose-700">Red cards</p>
            <p className="text-2xl font-semibold text-rose-900">{careerSummary.redCards}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Match History</h2>
        <div className="mt-4 space-y-4">
          {participation.length ? (
            participation.map((row) => (
              <article key={String(row.matchId)} className="rounded-xl border border-slate-100 px-4 py-3">
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <div>
                    <p className="font-semibold text-slate-900">vs {row.opponent}</p>
                    <p className="text-xs text-slate-500">
                      {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(
                        new Date(row.date),
                      )}
                      {' · '}
                      {row.role}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-800">
                    {row.score?.own ?? '?'} · {row.score?.opponent ?? '?'}
                  </p>
                </div>
                <p className="mt-3 text-xs text-slate-600">
                  Goals {row.stats.goals ?? 0} · Assists {row.stats.assists ?? 0} · Cards{' '}
                  {(row.stats.yellowCards ?? 0) + (row.stats.redCards ?? 0)}
                </p>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-500">No completed match appearances yet.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Feedback History</h2>
        <div className="mt-4 space-y-3">
          {feedbackFromCoach.length ? (
            feedbackFromCoach.map((entry) => (
              <div key={entry._id} className="rounded-xl border border-slate-50 bg-slate-50 px-4 py-3 text-sm">
                <p className="text-xs text-slate-500">
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(entry.createdAt))}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-slate-900">{entry.message}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No feedback has been sent to this player yet.</p>
          )}
        </div>

        <form className="mt-6 space-y-3" onSubmit={sendInlineFeedback}>
          <textarea
            className="min-h-[120px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            placeholder="Write your feedback here..."
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <button
            disabled={modalBusy}
            type="submit"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
          >
            {modalBusy ? 'Sending…' : 'Send Feedback'}
          </button>
        </form>
      </section>

      <FeedbackModal
        loading={modalBusy}
        open={modalOpen}
        title={`Send feedback to ${player.name}`}
        onClose={() => setModalOpen(false)}
        onSubmit={sendModalFeedback}
      />
    </div>
  );
}
