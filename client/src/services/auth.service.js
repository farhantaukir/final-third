import api from './axios.instance';

export async function registerAccount(payload) {
  const { data } = await api.post('/users/register', payload);
  return data;
}

export async function loginMember(payload) {
  const { data } = await api.post('/users/login', payload);
  return data;
}

export async function loginAdmin(payload) {
  const { data } = await api.post('/users/admin/login', payload);
  return data;
}

export async function logout() {
  const { data } = await api.post('/users/logout');
  return data;
}

export async function logoutAdmin() {
  const { data } = await api.post('/users/admin/logout');
  return data;
}

export async function getProfile() {
  const { data } = await api.get('/users/profile');
  return data;
}

export async function getAdminProfile() {
  const { data } = await api.get('/users/admin/profile');
  return data;
}

export async function updateProfile(body) {
  const { data } = await api.patch('/users/profile', body);
  return data;
}

export async function updateAdminProfile(body) {
  const { data } = await api.patch('/users/admin/profile', body);
  return data;
}

export async function fetchManagedUsers() {
  const { data } = await api.get('/users/admin/manage-users');
  return data;
}

export async function deleteManagedUser(userId) {
  const { data } = await api.delete(`/users/admin/manage-users/${userId}`);
  return data;
}
