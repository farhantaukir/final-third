import { useState } from 'react';

export default function FeedbackModal({ open, title, onClose, onSubmit, loading }) {
  const [message, setMessage] = useState('');

  if (!open) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    await onSubmit(trimmed);
    setMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-[1px]">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-600">Share constructive notes with this player.</p>
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-slate-500 hover:text-slate-800"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <textarea
            className="min-h-[140px] w-full rounded-xl border border-slate-200 bg-slate-50/40 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write your feedback..."
            required
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Sending…' : 'Send feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
