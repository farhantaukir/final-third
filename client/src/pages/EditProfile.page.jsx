import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth.hook';
import * as authService from '../services/auth.service';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100';

const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

export default function EditProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setName(user.name ?? '');
    setPosition(user.position ?? '');
  }, [user]);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setPreviewUrl(user?.profilePicture || '');
    return undefined;
  }, [file, user?.profilePicture]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      let body;

      if (file) {
        const payload = new FormData();
        payload.append('name', name.trim());
        if (user.role === 'player') {
          payload.append('position', position ?? '');
        }
        payload.append('profilePicture', file);
        body = payload;
      } else {
        body = {
          name: name.trim(),
        };

        if (user.role === 'player') {
          body.position = position ?? '';
        }
      }

      const response =
        user.role === 'admin'
          ? await authService.updateAdminProfile(body)
          : await authService.updateProfile(body);

      if (!response.success) {
        toast.error(response.message || 'Unable to update profile');
        return;
      }

      await refreshUser();
      setFile(null);
      toast.success('Profile updated successfully');
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Unable to update profile';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Profile</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Edit profile</h1>
        <p className="mt-2 text-sm text-slate-600">
          Update your name, profile picture, and other details.
        </p>
      </header>

      <form
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="md:w-1/3">
            <label className="text-sm font-medium text-slate-700">Profile picture</label>
            <div className="mt-3 flex flex-col items-start gap-3">
              <div className="h-32 w-32 overflow-hidden rounded-2xl border border-slate-100 bg-emerald-50">
                {previewUrl ? (
                  <img alt="Preview" className="h-full w-full object-cover" src={previewUrl} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
                    No image
                  </div>
                )}
              </div>
              <input
                accept="image/*"
                className="text-sm text-slate-600"
                type="file"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0];
                  setFile(nextFile ?? null);
                }}
              />
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                className={inputClass}
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            {user.role === 'player' ? (
              <div>
                <label
                  className="mb-1 block text-sm font-medium text-slate-700"
                  htmlFor="position"
                >
                  Position
                </label>
                <select
                  id="position"
                  className={inputClass}
                  value={position}
                  onChange={(event) => setPosition(event.target.value)}
                >
                  <option value="">Not set</option>
                  {POSITIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            disabled={submitting}
            type="submit"
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Saving changes…' : 'Save updates'}
          </button>
        </div>
      </form>
    </div>
  );
}
