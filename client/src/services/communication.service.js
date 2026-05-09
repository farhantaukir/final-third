import api from './axios.instance';

export async function fetchClubAnnouncements() {
  const { data } = await api.get('/announcements');
  return data;
}

export async function postAnnouncement(message) {
  const { data } = await api.post('/announcements', { message });
  return data;
}

export async function postFeedback(payload) {
  const { data } = await api.post('/feedback', payload);
  return data;
}

export async function fetchPlayerFeedbackFeed() {
  const { data } = await api.get('/feedback/me');
  return data;
}

export async function fetchCoachPlayerProfile(playerId) {
  const { data } = await api.get(`/coach/player/${playerId}`);
  return data;
}
