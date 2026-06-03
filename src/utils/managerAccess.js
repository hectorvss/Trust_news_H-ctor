const PRIMARY_MANAGER_EMAIL = 'hectorvidal0411@gmail.com';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

export const isPrimaryManagerEmail = (email) => normalizeEmail(email) === PRIMARY_MANAGER_EMAIL;

export const hasManagerAccess = ({ user, profile }) => {
  if (profile?.role === 'manager' || profile?.role === 'admin_editor') return true;
  return isPrimaryManagerEmail(user?.email);
};

export const hasAdminEditorAccess = ({ user, profile }) => {
  if (profile?.role === 'admin_editor') return true;
  return isPrimaryManagerEmail(user?.email);
};

export const getEffectiveUserRole = ({ user, profile }) => {
  if (isPrimaryManagerEmail(user?.email)) return 'admin_editor';
  if (profile?.role) return profile.role;
  return 'reader';
};
