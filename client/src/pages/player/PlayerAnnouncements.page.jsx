import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as communicationService from '../../services/communication.service';

export default function PlayerAnnouncementsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runner = async () => {
      setLoading(true);
      try {
        const response = await communicationService.fetchClubAnnouncements();
        if (response.success) {
          setItems(response.data ?? []);
        }
      } catch {
        toast.error('Unable to load announcements');
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
        <h1 className="text-4xl font-extrabold text-slate-900">Club announcements</h1>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
          Loading announcements…
        </div>
      ) : items.length ? (
        <div className="space-y-4">
          {items.map((announcement) => (
            <article
              key={announcement._id}
              className="ft-surface p-6 border-l-4 border-l-indigo-500 rounded-2xl"
            >
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {announcement.coach?.name ?? 'Coach'} ·{' '}
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                }).format(new Date(announcement.createdAt))}
              </p>
              <p className="mt-4 whitespace-pre-wrap text-base text-slate-900">{announcement.message}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-10 py-12 text-center text-sm text-slate-600 shadow-sm">
          No announcements yet — your coach hasn\'t published anything new.
        </div>
      )}
    </div>
  );
}
