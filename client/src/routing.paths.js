export function dashboardPath(role) {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'coach':
      return '/coach/dashboard';
    case 'player':
      return '/player/dashboard';
    default:
      return '/login';
  }
}
