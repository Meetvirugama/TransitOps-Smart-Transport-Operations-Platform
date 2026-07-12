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
    <aside className="w-60 bg-[#121b1f] border-r border-[#283945] flex flex-col justify-between py-6 shrink-0 h-full">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-6 pb-6 border-b border-[#283945] select-none">
          <div className="grid grid-cols-3 gap-[3px] w-7 h-7" aria-hidden="true">
            <span className="bg-[#4ff7d1] rounded-[2px] opacity-85 rounded-tl-[4px]"></span>
            <span className="bg-[#4ff7d1] rounded-[2px] opacity-85"></span>
            <span className="bg-[#4ff7d1] rounded-[2px] opacity-85 rounded-tr-[4px]"></span>
            <span className="bg-[#4ff7d1] rounded-[2px] opacity-85"></span>
            <span className="bg-[#4ff7d1] rounded-[2px] opacity-85"></span>
            <span className="bg-[#4ff7d1] rounded-[2px] opacity-85"></span>
            <span className="bg-[#4ff7d1] rounded-[2px] opacity-85 rounded-bl-[4px]"></span>
            <span className="bg-[#4ff7d1] rounded-[2px] opacity-85"></span>
            <span className="bg-[#4ff7d1] rounded-[2px] opacity-85 rounded-br-[4px]"></span>
          </div>
          <h2 className="font-heading text-base font-extrabold text-[#ffffff] tracking-tight">TransitOps</h2>
        </div>

        {/* Menu Navigation */}
        <nav className="flex flex-col gap-1 py-6 overflow-y-auto max-h-[calc(100vh-200px)] px-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-150 ${
                  isActive
                    ? 'bg-[#162129] text-[#ffffff] border border-[#283945]'
                    : 'text-[#b6b8ba] hover:bg-[#162129]/50 hover:text-[#ffffff]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-sm inline-block text-center">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {/* Mint active indicator dot */}
                  <span className={`w-1.5 h-1.5 rounded-full bg-[#4ff7d1] transition-opacity duration-150 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}></span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Sign Out */}
      <div className="px-6 border-t border-[#283945] pt-6">
        <button
          onClick={handleSignOut}
          className="w-full bg-transparent border border-[#283945] hover:bg-[#283945] text-[#ffffff] text-xs font-semibold py-2.5 px-4 rounded-full transition-all duration-150 cursor-pointer text-center"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
