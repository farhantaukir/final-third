import api from './axios.instance';

export async function fetchAdminMatches() {
  const { data } = await api.get('/matches');
  return data;
}

export async function createMatch(payload) {
  const { data } = await api.post('/matches', payload);
  return data;
}

export async function deleteMatch(matchId) {
  const { data } = await api.delete(`/matches/${matchId}`);
  return data;
}

export async function recordMatchResult(matchId, homeScore, awayScore) {
  const { data } = await api.patch(`/matches/${matchId}/result`, { homeScore, awayScore });
  return data;
}

export async function fetchMatchStatsRoster(matchId) {
  const { data } = await api.get(`/matches/${matchId}/stats/roster`);
  return data;
}

export async function submitMatchPlayerStats(matchId, stats) {
  const { data } = await api.post(`/matches/${matchId}/stats`, { stats });
  return data;
}

export async function fetchClubUpcomingMatches() {
  const { data } = await api.get('/matches/club/upcoming');
  return data;
}

export async function fetchClubMatchHistory(params = {}) {
  const { data } = await api.get('/matches/club/history', { params });
  return data;
}

export async function fetchCoachLineupContext(matchId) {
  const { data } = await api.get(`/matches/${matchId}/lineup/context`);
  return data;
}

export async function fetchCoachSquadOptions() {
  const { data } = await api.get('/matches/coach/squad/options');
  return data;
}

export async function updateMatchLineup(matchId, startingLineup, substitutes) {
  const { data } = await api.patch(`/matches/${matchId}/lineup`, {
    startingLineup,
    substitutes,
  });
  return data;
}
