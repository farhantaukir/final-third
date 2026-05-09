import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as communicationService from '../../services/communication.service';

export default function PlayerFeedbackPage() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runner = async () => {
      setLoading(true);
      try {
        const response = await communicationService.fetchPlayerFeedbackFeed();
        if (response.success) {
          setThreads(response.data ?? []);
        }
      } catch {
        toast.error('Unable to load coaching notes');
      } finally {
        setLoading(false);
      }
    };
    runner();
  }, []);

  return (
    <div className="space-y-6">
      <header className="ft-surface p-6 shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl">
        <p className="text-xs uppercase tracking-wide text-emerald-700">Communication</p>
        <h1 className="text-4xl font-extrabold text-slate-900">Coach feedback</h1>
        <p className="text-sm text-slate-600">Personal feedback and notes from your coaching staff.</p>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Loading feedback…
        </div>
      ) : threads.length ? (
        <div className="space-y-4">
          {threads.map((entry) => (
            <article
              key={entry._id}
              className="ft-surface p-6 border-l-4 border-l-emerald-500 rounded-2xl"
            >
              <p className="text-xs uppercase tracking-wide text-emerald-800">
                {entry.coach?.name ?? 'Coach'} ·{' '}
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(entry.createdAt))}
              </p>
              <p className="mt-4 whitespace-pre-wrap text-base text-slate-900">{entry.message}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-white px-10 py-12 text-center text-sm text-emerald-900 shadow-sm">
          No personal feedback logged yet — keep training sharp and check back soon.
        </div>
      )}
    </div>
  );
}
