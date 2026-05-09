import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as communicationService from '../../services/communication.service';

export default function CoachCommunicationPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const response = await communicationService.fetchClubAnnouncements();
      if (response.success) {
        setAnnouncements(response.data ?? []);
      }
    } catch {
      toast.error('Unable to load bulletin items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const publish = async (event) => {
    event.preventDefault();
    if (!draft.trim()) {
      toast.error('Please write a message first');
      return;
    }

    setSubmitting(true);
    try {
      const response = await communicationService.postAnnouncement(draft.trim());
      if (!response.success) {
        toast.error(response.message || 'Unable to publish');
        return;
      }

      toast.success('Announcement posted successfully');
      setDraft('');
      await refresh();
    } catch {
      toast.error('Unable to publish');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="ft-surface p-6 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl">
        <p className="text-xs uppercase tracking-wide text-emerald-700">Communication</p>
        <h1 className="text-4xl font-extrabold text-slate-900">Team Announcements</h1>
        <p className="text-sm text-slate-600">
          Post announcements for your entire squad. Announcements are permanent and cannot be edited or deleted.
        </p>
      </header>

      <section className="ft-surface-soft p-6 rounded-2xl">
        <h2 className="text-lg font-extrabold text-slate-900">New Announcement</h2>
        <form className="mt-4 space-y-4" onSubmit={publish}>
          <textarea
            className="min-h-[160px] w-full ft-input rounded-2xl"
            placeholder="Write your announcement here…"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />

          <button
            disabled={submitting}
            type="submit"
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-70"
          >
            {submitting ? 'Posting…' : 'Post Announcement'}
          </button>
        </form>
      </section>

      <section className="ft-surface p-6 rounded-2xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold text-slate-900">Previous Announcements</h2>
          {!loading ? (
            <span className="text-xs uppercase tracking-wide text-slate-400">
              {announcements.length} announcements
            </span>
          ) : null}
        </div>

        <div className="mt-4 space-y-4">
          {loading ? (
            <p className="text-sm text-slate-500">Loading announcements…</p>
          ) : announcements.length ? (
            announcements.map((item) => (
              <article
                key={item._id}
                className="ft-surface p-4 border-l-4 border-l-indigo-500 rounded-xl"
              >
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(item.createdAt))}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-base text-slate-900">{item.message}</p>
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-600">
              You have not broadcast anything yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
