import api from './axios.instance';

export async function fetchAdminClubs() {
  const { data } = await api.get('/clubs');
  return data;
}

export async function createClub(payload) {
  const { data } = await api.post('/clubs', payload);
  return data;
}

export async function deleteClub(clubId) {
  const { data } = await api.delete(`/clubs/${clubId}`);
  return data;
}

export async function fetchCoachOptions() {
  const { data } = await api.get('/clubs/coaches');
  return data;
}

export async function fetchLeagues() {
  const { data } = await api.get('/clubs/leagues');
  return data;
}

export async function createLeague(name) {
  const { data } = await api.post('/clubs/leagues', { name });
  return data;
}

export async function deleteLeague(leagueId) {
  const { data } = await api.delete(`/clubs/leagues/${leagueId}`);
  return data;
}

export async function fetchClubDetail(clubId) {
  const { data } = await api.get(`/clubs/${clubId}`);
  return data;
}

export async function assignCoachToClub(clubId, coachId) {
  const { data } = await api.patch(`/clubs/${clubId}/coach`, { coachId });
  return data;
}

export async function assignLeagueToClub(clubId, leagueId) {
  const { data } = await api.patch(`/clubs/${clubId}/league`, { leagueId });
  return data;
}

export async function updateClubHomeVenue(clubId, homeVenue) {
  const { data } = await api.patch(`/clubs/${clubId}/home-venue`, { homeVenue });
  return data;
}

export async function addPlayerToClubRoster(clubId, playerId) {
  const { data } = await api.post(`/clubs/${clubId}/players`, { playerId });
  return data;
}

export async function removePlayerFromClubRoster(clubId, playerId) {
  const { data } = await api.delete(`/clubs/${clubId}/players/${playerId}`);
  return data;
}

export async function updateClubPlayerPosition(clubId, playerId, position) {
  const { data } = await api.patch(`/clubs/${clubId}/players/${playerId}/position`, {
    position,
  });
  return data;
}
