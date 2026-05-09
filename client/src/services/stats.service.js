import api from './axios.instance';

export async function fetchPlayerPersonalStats() {
  const { data } = await api.get('/stats/player/me');
  return data;
}

export async function fetchCoachSquadStats() {
  const { data } = await api.get('/stats/coach/squad');
  return data;
}

export async function fetchAdminLeaderboards() {
  const { data } = await api.get('/stats/admin/leaderboard');
  return data;
}

export async function fetchAdminStandings(leagueId) {
  const params = leagueId ? { leagueId } : undefined;
  const { data } = await api.get('/stats/admin/standings', { params });
  return data;
}
