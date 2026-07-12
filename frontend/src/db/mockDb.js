/**
 * mockDb shim — kept for backward compatibility with Hari's UI components.
 * Real data comes from the API. This provides empty fallbacks so nothing crashes.
 */

const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem('transitops_local_users') || '[]');
  } catch {
    return [];
  }
};

const saveUsers = (users) => {
  localStorage.setItem('transitops_local_users', JSON.stringify(users));
};

const addUser = (user) => {
  const users = getUsers();
  users.push({ ...user, id: Date.now() });
  saveUsers(users);
};

const deleteUser = (email) => {
  const users = getUsers().filter(u => u.email !== email);
  saveUsers(users);
};

export const mockDb = {
  getUsers,
  addUser,
  deleteUser,
};
