import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../db/mockDb';
import { 
  User, Shield, Settings, Users, Database, 
  Save, RefreshCw, Plus, Check, ShieldAlert,
  Sliders, ToggleLeft, ToggleRight, Trash2
} from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Operations state (cached in localStorage or standard default state)
  const [speedLimit, setSpeedLimit] = useState(() => {
    return parseInt(localStorage.getItem('setting_speed_limit') || '80', 10);
  });
  const [maintAlerts, setMaintAlerts] = useState(() => {
    return localStorage.getItem('setting_maint_alerts') !== 'false';
  });
  const [autoDispatch, setAutoDispatch] = useState(() => {
    return localStorage.getItem('setting_auto_dispatch') === 'true';
  });
  const [rulesSuccess, setRulesSuccess] = useState(false);

  // Team management state
  const [team, setTeam] = useState(() => mockDb.getUsers());
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Dispatcher');
  const [newUserPassword, setNewUserPassword] = useState('admin123');
  const [teamSuccess, setTeamSuccess] = useState('');

  // Tab configuration
  const tabs = [
    { id: 'profile', label: 'Profile & Security', icon: User },
    { id: 'rules', label: 'Operations & Alerts', icon: Sliders },
    { id: 'team', label: 'Team Management', icon: Users },
    { id: 'db', label: 'Database Controls', icon: Database },
  ];

  // Save profile changes
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    const users = mockDb.getUsers();
    const updatedUsers = users.map(u => {
      if (u.email.toLowerCase() === user.email.toLowerCase()) {
        const updated = { ...u, name, email };
        if (newPassword) {
          if (u.password !== oldPassword) {
            throw new Error('Current password is incorrect.');
          }
          if (newPassword !== confirmPassword) {
            throw new Error('New passwords do not match.');
          }
          updated.password = newPassword;
        }
        return updated;
      }
      return u;
    });

    try {
      localStorage.setItem('transitops_users', JSON.stringify(updatedUsers));
      
      // Update active session storage
      const session = JSON.parse(sessionStorage.getItem('transitops_session') || '{}');
      session.name = name;
      session.email = email;
      sessionStorage.setItem('transitops_session', JSON.stringify(session));
      
      setProfileSuccess('Profile updated successfully! Relog to fully apply all session settings.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    }
  };

  // Save operational rules
  const handleRulesSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('setting_speed_limit', speedLimit.toString());
    localStorage.setItem('setting_maint_alerts', maintAlerts.toString());
    localStorage.setItem('setting_auto_dispatch', autoDispatch.toString());
    
    setRulesSuccess(true);
    setTimeout(() => setRulesSuccess(false), 3000);
  };

  // Add new user to team
  const handleAddUser = (e) => {
    e.preventDefault();
    setTeamSuccess('');
    
    const users = mockDb.getUsers();
    if (users.some(u => u.email.toLowerCase() === newUserEmail.toLowerCase())) {
      alert('A user with this email already exists.');
      return;
    }

    const newUser = {
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      password: newUserPassword
    };

    const updated = [...users, newUser];
    localStorage.setItem('transitops_users', JSON.stringify(updated));
    setTeam(updated);
    
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword('admin123');
    setTeamSuccess('New team member added successfully!');
    setTimeout(() => setTeamSuccess(''), 3000);
  };

  // Delete a user from team
  const handleDeleteUser = (emailToDelete) => {
    if (emailToDelete.toLowerCase() === user.email.toLowerCase()) {
      alert('You cannot delete your own account.');
      return;
    }
    if (window.confirm(`Are you sure you want to remove ${emailToDelete}?`)) {
      const updated = team.filter(u => u.email.toLowerCase() !== emailToDelete.toLowerCase());
      localStorage.setItem('transitops_users', JSON.stringify(updated));
      setTeam(updated);
    }
  };

  const handleResetDatabase = () => {
    if (window.confirm('Wipe all local storage and reseed default Indian database values? You will be logged out.')) {
      mockDb.resetDatabase();
      logout();
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none animate-page-fade max-w-[1280px]">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Portal Settings</h1>
        <p className="text-sm text-[#86898c] mt-1">
          Manage your account profile, configure fleet rules, manage operators, and control system databases.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Left Side Tab Navigation */}
        <div className="flex flex-col gap-1 border border-[#1e2d38] rounded-2xl p-2 bg-[#111820]">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 text-left ${
                activeTab === t.id 
                  ? 'bg-[#162129] text-[#4ff7d1] border border-[#283945]/30' 
                  : 'text-[#86898c] hover:bg-[#162129]/40 hover:text-white'
              }`}
            >
              <t.icon size={16} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Right Side Settings Panel */}
        <div className="md:col-span-3 border border-[#1e2d38] rounded-2xl bg-[#111820] p-6 min-h-[400px]">
          
          {/* Tab 1: Profile & Security */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-white mb-2">Profile & Security Settings</h2>
              
              {profileSuccess && (
                <div className="p-3.5 rounded-xl border border-[#22c55e]/20 bg-[#22c55e]/5 text-xs text-[#22c55e] font-medium">
                  {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-500 font-medium">
                  {profileError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[9px] text-[#86898c] uppercase tracking-widest font-bold">Display Name</label>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)} required
                    className="bg-[#0b0f14] border border-[#1e2d38] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#4ff7d1]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[9px] text-[#86898c] uppercase tracking-widest font-bold">Email Address</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="bg-[#0b0f14] border border-[#1e2d38] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#4ff7d1]"
                  />
                </div>
              </div>

              <div className="h-px bg-[#1e2d38] my-2" />

              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield size={14} className="text-[#4ff7d1]" /> Change Password (Leave blank to keep current)
              </h3>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-[9px] text-[#86898c] uppercase tracking-widest font-bold">Current Password</label>
                  <input
                    type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="bg-[#0b0f14] border border-[#1e2d38] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#4ff7d1] placeholder:text-[#86898c]/30"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-[#86898c] uppercase tracking-widest font-bold">New Password</label>
                    <input
                      type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="bg-[#0b0f14] border border-[#1e2d38] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#4ff7d1] placeholder:text-[#86898c]/30"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-mono text-[9px] text-[#86898c] uppercase tracking-widest font-bold">Confirm New Password</label>
                    <input
                      type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="bg-[#0b0f14] border border-[#1e2d38] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#4ff7d1] placeholder:text-[#86898c]/30"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary mt-4 flex items-center justify-center gap-2 px-5 py-2.5 w-fit text-sm font-semibold rounded-full bg-[#4ff7d1]"
              >
                <Save size={15} /> Save Profile Changes
              </button>
            </form>
          )}

          {/* Tab 2: Operations & Alerts */}
          {activeTab === 'rules' && (
            <form onSubmit={handleRulesSubmit} className="flex flex-col gap-6">
              <h2 className="text-xl font-bold text-white mb-2">Fleet Safety & Alerts Settings</h2>

              {rulesSuccess && (
                <div className="p-3.5 rounded-xl border border-[#22c55e]/20 bg-[#22c55e]/5 text-xs text-[#22c55e] font-medium flex items-center gap-2">
                  <Check size={14} /> Operational parameters saved successfully!
                </div>
              )}

              {/* Slider rule */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-[10px] text-[#86898c] uppercase tracking-widest font-bold">Overspeed Warning Limit</label>
                  <span className="font-mono text-sm font-bold text-[#4ff7d1]">{speedLimit} km/h</span>
                </div>
                <input
                  type="range" min="60" max="120" step="5" value={speedLimit} onChange={e => setSpeedLimit(parseInt(e.target.value, 10))}
                  className="w-full accent-[#4ff7d1] cursor-pointer bg-[#0b0f14] h-1.5 rounded-lg border border-[#1e2d38]"
                />
                <span className="text-[11px] text-[#86898c]">Flags speed violations on driver safety scorecards when exceeded.</span>
              </div>

              <div className="h-px bg-[#1e2d38]" />

              {/* Alert Toggle 1 */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-white">Maintenance Flag Notifications</span>
                  <span className="text-xs text-[#86898c]">Send real-time alerts when a vehicle is assigned to In Shop.</span>
                </div>
                <button
                  type="button" onClick={() => setMaintAlerts(!maintAlerts)}
                  className="text-[#4ff7d1] transition-all focus:outline-none"
                >
                  {maintAlerts ? <ToggleRight size={38} /> : <ToggleLeft size={38} className="text-[#86898c]" />}
                </button>
              </div>

              {/* Alert Toggle 2 */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-white">Automatic Dispatch Validation</span>
                  <span className="text-xs text-[#86898c]">Block dispatcher from assigning expired licenses or Suspended drivers.</span>
                </div>
                <button
                  type="button" onClick={() => setAutoDispatch(!autoDispatch)}
                  className="text-[#4ff7d1] transition-all focus:outline-none"
                >
                  {autoDispatch ? <ToggleRight size={38} /> : <ToggleLeft size={38} className="text-[#86898c]" />}
                </button>
              </div>

              <button
                type="submit"
                className="btn-primary mt-4 flex items-center justify-center gap-2 px-5 py-2.5 w-fit text-sm font-semibold rounded-full bg-[#4ff7d1]"
              >
                <Save size={15} /> Save Parameters
              </button>
            </form>
          )}

          {/* Tab 3: Team Management */}
          {activeTab === 'team' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-white mb-2">Team & Role Registrations</h2>

              {teamSuccess && (
                <div className="p-3.5 rounded-xl border border-[#22c55e]/20 bg-[#22c55e]/5 text-xs text-[#22c55e] font-medium flex items-center gap-2">
                  <Check size={14} /> {teamSuccess}
                </div>
              )}

              {/* Add user form */}
              <form onSubmit={handleAddUser} className="border border-[#1e2d38] rounded-xl p-4 bg-[#162129]/40 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-[#86898c] uppercase tracking-wider font-mono">Register New Account</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <input
                    type="text" placeholder="Full Name" value={newUserName} onChange={e => setNewUserName(e.target.value)} required
                    className="bg-[#0b0f14] border border-[#1e2d38] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#4ff7d1]"
                  />
                  <input
                    type="email" placeholder="Email Address" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} required
                    className="bg-[#0b0f14] border border-[#1e2d38] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#4ff7d1]"
                  />
                  <select
                    value={newUserRole} onChange={e => setNewUserRole(e.target.value)}
                    className="bg-[#0b0f14] border border-[#1e2d38] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#4ff7d1]"
                  >
                    <option value="Fleet Manager">Fleet Manager</option>
                    <option value="Dispatcher">Dispatcher</option>
                    <option value="Safety Officer">Safety Officer</option>
                    <option value="Financial Analyst">Financial Analyst</option>
                  </select>
                  <input
                    type="password" placeholder="Password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} required
                    className="bg-[#0b0f14] border border-[#1e2d38] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-[#4ff7d1]"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full bg-[#4ff7d1] w-fit mt-1 ml-auto"
                >
                  <Plus size={14} /> Register User
                </button>
              </form>

              {/* Team list */}
              <div className="flex flex-col gap-2 mt-2">
                <h3 className="text-xs font-bold text-[#86898c] uppercase tracking-wider font-mono">Registered Accounts</h3>
                <div className="flex flex-col divide-y divide-[#1e2d38]/50 border border-[#1e2d38] rounded-xl overflow-hidden bg-[#0b0f14]">
                  {team.map((t, idx) => (
                    <div key={idx} className="flex justify-between items-center px-4 py-3 text-sm">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{t.name}</span>
                        <span className="text-xs text-[#86898c]">{t.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-full border border-[#4ff7d1]/20 bg-[#4ff7d1]/5 text-[10px] font-bold text-[#4ff7d1] uppercase tracking-wider font-mono">
                          {t.role}
                        </span>
                        {t.email.toLowerCase() !== user.email.toLowerCase() ? (
                          <button
                            onClick={() => handleDeleteUser(t.email)}
                            className="p-1.5 text-[#86898c] hover:text-[#ef4444] rounded-lg hover:bg-red-500/5 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#86898c] font-mono select-none px-2">You</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Database Controls */}
          {activeTab === 'db' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-white mb-2">Danger & System Controls</h2>
              
              <div className="p-4 border border-[#ef4444]/35 bg-[#ef4444]/[0.02] rounded-xl flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="text-[#ef4444] flex-shrink-0 mt-0.5" size={18} />
                  <div>
                    <h3 className="text-sm font-bold text-white">Reset Database Registry</h3>
                    <p className="text-xs text-[#86898c] mt-1 leading-relaxed">
                      Wipes all customized operators, added vehicles, safety record logs, fuel expense inputs, and resets the portal to default Indian seed data state.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleResetDatabase}
                  className="bg-transparent border border-[#ef4444]/40 hover:border-[#ef4444] hover:bg-[#ef4444]/10 text-[#ef4444] text-xs font-bold px-4 py-2 w-fit rounded-full transition-all duration-200 mt-2"
                >
                  Confirm Factory Reset
                </button>
              </div>

              <div className="p-4 border border-[#1e2d38] rounded-xl flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-white">Export Mock Database State</span>
                  <span className="text-xs text-[#86898c]">Download all localStorage registries as a .json backup file.</span>
                </div>
                <button
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorage));
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", `transitops_backup_${new Date().toISOString().slice(0, 10)}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="bg-[#162129] border border-[#283945]/30 hover:border-[#4ff7d1] text-xs font-bold px-4 py-2 rounded-full text-white transition-all cursor-pointer"
                >
                  Export Data
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
