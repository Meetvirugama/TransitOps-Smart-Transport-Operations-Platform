import React, { useState, useEffect } from 'react';
import api from '../config/api';
import Modal from '../components/Modal';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Roles');
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);

  // Modals
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Form states
  const [roleName, setRoleName] = useState('');
  const [rolePermissions, setRolePermissions] = useState({
    can_view_dashboard: false,
    can_view_fleet: false,
    can_manage_fleet: false,
    can_view_drivers: false,
    can_manage_drivers: false,
    can_view_trips: false,
    can_manage_trips: false,
    can_view_maintenance: false,
    can_manage_maintenance: false,
    can_view_finance: false,
    can_manage_finance: false,
    can_view_analytics: false,
    can_manage_settings: false
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoleForUser, setSelectedRoleForUser] = useState('');

  const fetchData = async () => {
    try {
      const [rolesRes, usersRes] = await Promise.all([
        api.get('/settings/roles'),
        api.get('/settings/users')
      ]);
      setRoles(rolesRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Failed to fetch settings data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      await api.post('/settings/roles', { name: roleName, permissions: rolePermissions });
      setIsRoleModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create role', err);
    }
  };

  const handleUpdateUserRole = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/settings/users/${selectedUser.id}/role`, { roleId: parseInt(selectedRoleForUser, 10) });
      setIsUserModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to update user role', err);
    }
  };

  const togglePermission = (key) => {
    setRolePermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setSelectedRoleForUser(user.role_id || '');
    setIsUserModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <h2 className="text-2xl font-bold font-heading text-dark-text">8. Portal Settings</h2>

      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('Roles')}
          className={`px-4 py-2 rounded-full font-medium transition-all ${
            activeTab === 'Roles' ? 'bg-primary-dark/20 text-primary-light border border-primary-dark/30' : 'text-dark-muted hover:text-white'
          }`}
        >
          Roles & Permissions
        </button>
        <button
          onClick={() => setActiveTab('Users')}
          className={`px-4 py-2 rounded-full font-medium transition-all ${
            activeTab === 'Users' ? 'bg-primary-dark/20 text-primary-light border border-primary-dark/30' : 'text-dark-muted hover:text-white'
          }`}
        >
          Users
        </button>
      </div>

      {activeTab === 'Roles' && (
        <div className="bg-dark-surface p-6 rounded-2xl border border-white/5 shadow-glass">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">System Roles</h3>
            <button 
              onClick={() => {
                setRoleName('');
                setRolePermissions(Object.keys(rolePermissions).reduce((acc, key) => ({...acc, [key]: false}), {}));
                setIsRoleModalOpen(true);
              }}
              className="px-4 py-2 bg-primary-dark hover:bg-primary-dark/80 text-white rounded-lg font-medium transition-colors"
            >
              + Create Role
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase text-dark-muted border-b border-white/10">
                  <th className="pb-3 px-4 font-semibold">Role Name</th>
                  <th className="pb-3 px-4 font-semibold">Features Configured</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {roles.map(r => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-medium text-white">{r.name}</td>
                    <td className="py-4 px-4 text-dark-muted">
                      {Object.keys(r.permissions || {}).filter(k => r.permissions[k]).length} enabled features
                    </td>
                  </tr>
                ))}
                {roles.length === 0 && (
                  <tr>
                    <td colSpan="2" className="py-8 text-center text-dark-muted">No roles found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'Users' && (
        <div className="bg-dark-surface p-6 rounded-2xl border border-white/5 shadow-glass">
          <h3 className="text-lg font-semibold text-white mb-6">User Accounts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase text-dark-muted border-b border-white/10">
                  <th className="pb-3 px-4 font-semibold">Email</th>
                  <th className="pb-3 px-4 font-semibold">Current Role</th>
                  <th className="pb-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {users.map(u => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-medium text-white">{u.email}</td>
                    <td className="py-4 px-4 text-dark-muted">
                      <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs">
                        {u.role || 'No Role'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button 
                        onClick={() => openUserModal(u)}
                        className="text-primary-light hover:text-primary-dark transition-colors"
                      >
                        Change Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Creation Modal */}
      <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} title="Create Custom Role">
        <form onSubmit={handleCreateRole} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-dark-muted uppercase mb-1">Role Name</label>
            <input 
              required
              className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-dark"
              placeholder="e.g. Night Dispatcher"
              value={roleName}
              onChange={e => setRoleName(e.target.value)}
            />
          </div>
          
          <div className="mt-2">
            <label className="block text-xs font-semibold text-dark-muted uppercase mb-3">Feature Access Matrix</label>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2">
              {Object.keys(rolePermissions).map(key => (
                <label key={key} className="flex items-center gap-3 p-2 bg-dark-bg rounded-lg border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
                  <input 
                    type="checkbox"
                    checked={rolePermissions[key]}
                    onChange={() => togglePermission(key)}
                    className="accent-primary-dark w-4 h-4"
                  />
                  <span className="text-sm text-gray-300 capitalize">{key.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-dark-muted hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-dark hover:bg-primary-dark/80 text-white rounded-lg font-medium transition-colors">Save Role</button>
          </div>
        </form>
      </Modal>

      {/* User Role Change Modal */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="Change User Role">
        <form onSubmit={handleUpdateUserRole} className="flex flex-col gap-4">
          <p className="text-sm text-dark-muted">Assigning a new role to <strong className="text-white">{selectedUser?.email}</strong></p>
          
          <div>
            <label className="block text-xs font-semibold text-dark-muted uppercase mb-1">Select Role</label>
            <select 
              required
              className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-dark"
              value={selectedRoleForUser}
              onChange={e => setSelectedRoleForUser(e.target.value)}
            >
              <option value="" disabled>Select a role...</option>
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-dark-muted hover:text-white transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary-dark hover:bg-primary-dark/80 text-white rounded-lg font-medium transition-colors">Update User</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
