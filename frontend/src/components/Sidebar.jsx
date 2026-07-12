import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/fleet', label: 'Fleet', icon: '🚚' },
  { path: '/drivers', label: 'Drivers', icon: '👤' },
  { path: '/trips', label: 'Trips', icon: '🗺️' },
  { path: '/maintenance', label: 'Maintenance', icon: '🔧' },
  { path: '/fuel-expenses', label: 'Fuel & Expenses', icon: '💳' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/settings', label: 'Settings', icon: '⚙️' }
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-60 bg-[#070A12] border-r border-dark-border flex flex-col justify-between py-6 shrink-0 h-full">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-6 pb-6 border-b border-dark-border select-none">
          <div className="grid grid-cols-3 gap-[3px] w-7 h-7" aria-hidden="true">
            <span className="bg-brand rounded-[2px] opacity-85 rounded-tl-[4px]"></span>
            <span className="bg-brand rounded-[2px] opacity-85"></span>
            <span className="bg-brand rounded-[2px] opacity-85 rounded-tr-[4px]"></span>
            <span className="bg-brand rounded-[2px] opacity-85"></span>
            <span className="bg-brand rounded-[2px] opacity-85"></span>
            <span className="bg-brand rounded-[2px] opacity-85"></span>
            <span className="bg-brand rounded-[2px] opacity-85 rounded-bl-[4px]"></span>
            <span className="bg-brand rounded-[2px] opacity-85"></span>
            <span className="bg-brand rounded-[2px] opacity-85 rounded-br-[4px]"></span>
          </div>
          <h2 className="font-heading text-lg font-bold text-dark-text tracking-wide">TransitOps</h2>
        </div>

        {/* Menu Navigation */}
        <nav className="flex flex-col gap-1 py-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm font-medium border-l-[3px] transition-all duration-200 ${
                  isActive
                    ? 'border-brand bg-brand/5 text-dark-text font-semibold'
                    : 'border-transparent text-dark-muted hover:bg-white/2 hover:text-dark-text'
                }`
              }
            >
              <span className="text-base inline-block w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Sign Out */}
      <div className="px-6 border-t border-dark-border pt-6">
        <button
          onClick={handleSignOut}
          className="w-full bg-transparent border border-dark-border hover:border-accent-red hover:bg-accent-red/5 hover:text-dark-text text-dark-muted text-xs font-semibold py-2.5 px-4 rounded-md transition-all duration-200 cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
