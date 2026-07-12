import React, { useRef, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockDb } from '../db/mockDb';

const menuItems = [
  { path: '/dashboard',     label: 'Dashboard'      },
  { path: '/fleet',         label: 'Fleet'           },
  { path: '/drivers',       label: 'Drivers'         },
  { path: '/trips',         label: 'Trips'           },
  { path: '/maintenance',   label: 'Maintenance'     },
  { path: '/fuel-expenses', label: 'Fuel & Expenses' },
  { path: '/analytics',     label: 'Analytics'       },
  // Settings removed from nav — accessed via username dropdown
];

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Sliding capsule state
  const [hoverStyle, setHoverStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const containerRef = useRef(null);

  // User dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMouseEnter = (e) => {
    if (!containerRef.current) return;
    const rect       = e.currentTarget.getBoundingClientRect();
    const parentRect = containerRef.current.getBoundingClientRect();
    setHoverStyle({ left: rect.left - parentRect.left, width: rect.width, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setHoverStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  const getInitials = (nameStr) => {
    if (!nameStr) return 'TO';
    return nameStr.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSignOut = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const handleResetDb = () => {
    if (window.confirm('Reset all data to default Indian seed values? You will be logged out.')) {
      mockDb.resetDatabase();
      logout();
      navigate('/login');
    }
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const displayRole = user?.role || 'Dispatcher';
  const displayEmail = user?.email || '';
  const initials    = getInitials(displayName);

  return (
    <header className="h-16 border-b border-[#1e2d38] flex items-center justify-between px-6 shrink-0 select-none bg-[#0a0f14] w-full z-50 relative">

      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="grid grid-cols-3 gap-[2px] w-6 h-6" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="bg-[#4ff7d1] rounded-[1px] opacity-90" />
            ))}
          </div>
          <h2 className="font-heading text-sm font-extrabold text-white tracking-tight">TransitOps</h2>
        </div>

        {/* Sliding Capsule Nav */}
        <nav
          ref={containerRef}
          onMouseLeave={handleMouseLeave}
          className="relative flex items-center bg-[#111820] border border-[#1e2d38] rounded-full p-1 gap-0.5"
        >
          {/* Sliding background capsule */}
          <div
            className="absolute top-1 bottom-1 bg-[#162129] border border-[#283945] rounded-full transition-all duration-300 ease-out z-0 pointer-events-none"
            style={{ left: `${hoverStyle.left}px`, width: `${hoverStyle.width}px`, opacity: hoverStyle.opacity }}
          />

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onMouseEnter={handleMouseEnter}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-full text-xs font-semibold tracking-tight relative z-10 transition-all duration-150 ${
                  isActive ? 'text-[#4ff7d1] font-bold' : 'text-[#b6b8ba] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-1 left-3.5 right-3.5 h-[2px] bg-[#4ff7d1] rounded-full animate-pulse-slow" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Right: Search + User Dropdown */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex items-center bg-[#111820] border border-[#1e2d38] rounded-full px-4 py-2 w-44 transition-all duration-200 hover:border-[#4ff7d1]/30">
          <input
            type="text"
            placeholder="Search console..."
            className="bg-transparent border-none outline-none text-xs text-white w-full placeholder:text-[#86898c]/50 p-0"
          />
        </div>

        {/* Username Dropdown Trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 bg-[#0a2820] border border-[#4ff7d1]/20 rounded-full pl-3.5 pr-1 py-1 transition-all duration-200 hover:border-[#4ff7d1]/50 hover:shadow-[0_0_14px_rgba(79,247,209,0.12)] cursor-pointer"
          >
            <span className="text-[9px] font-bold text-[#4ff7d1] uppercase tracking-wider hidden md:inline">{displayRole}</span>
            <span className="text-xs font-semibold text-white hidden md:inline">{displayName}</span>
            {/* Chevron */}
            <svg
              className={`w-3 h-3 text-[#4ff7d1] transition-transform duration-200 mr-1 ${dropdownOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-[#4ff7d1] text-[#0d1318] text-[11px] font-black flex items-center justify-center animate-pulse-slow flex-shrink-0">
              {initials}
            </div>
          </button>

          {/* Dropdown Panel */}
          {dropdownOpen && (
            <div className="absolute right-0 top-[calc(100%+10px)] w-72 glass-panel border border-[#1e2d38] rounded-2xl overflow-hidden z-[100] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              
              {/* Top shimmer */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-[#4ff7d1]/30 to-transparent" />

              {/* User Profile Card */}
              <div className="px-5 py-4 flex items-center gap-3 border-b border-[#1e2d38]">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#4ff7d1] to-[#0e342d] text-[#0d1318] text-sm font-black flex items-center justify-center flex-shrink-0 shadow-[0_0_14px_rgba(79,247,209,0.3)]">
                  {initials}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-bold text-sm text-white truncate">{displayName}</span>
                  <span className="font-mono text-[9px] text-[#4ff7d1] uppercase tracking-wider">{displayRole}</span>
                  <span className="font-mono text-[10px] text-[#86898c] truncate">{displayEmail}</span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2 px-2 flex flex-col gap-0.5">
                <button
                  onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#c5cace] hover:bg-[#162129] hover:text-white transition-all duration-150 cursor-pointer text-left"
                >
                  <span className="w-5 h-5 flex items-center justify-center text-[#4ff7d1]">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <span className="font-medium">Settings</span>
                </button>

                <button
                  onClick={handleResetDb}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#c5cace] hover:bg-[#162129] hover:text-white transition-all duration-150 cursor-pointer text-left"
                >
                  <span className="w-5 h-5 flex items-center justify-center text-[#86898c]">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </span>
                  <span className="font-medium">Reset Database</span>
                </button>
              </div>

              {/* Divider + Sign Out */}
              <div className="px-2 pb-2 border-t border-[#1e2d38] pt-2">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#ef4444] hover:bg-[rgba(239,68,68,0.08)] hover:border-[#ef4444]/20 transition-all duration-150 cursor-pointer text-left"
                >
                  <span className="w-5 h-5 flex items-center justify-center">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </span>
                  <span className="font-semibold">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
