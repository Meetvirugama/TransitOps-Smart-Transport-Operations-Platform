import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user } = useAuth();

  // Helper to extract initials
  const getInitials = (nameStr) => {
    if (!nameStr) return 'TO';
    return nameStr
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const displayRole = user?.role || 'Dispatcher';
  const initials = getInitials(displayName);
  return (
    <header className="h-16 border-b border-[#283945] flex items-center justify-between px-8 shrink-0 select-none bg-[#0d1318]">
      {/* Search Input Box */}
      <div className="flex items-center gap-2 bg-[#162129] border border-[#283945] rounded-full px-3.5 py-1.5 w-64">
        <span className="text-xs text-[#86898c]" role="img" aria-label="search">🔍</span>
        <input
          type="text"
          placeholder="Search console..."
          className="bg-transparent border-none outline-none text-xs text-[#ffffff] w-full placeholder:text-[#86898c]/50 p-0! focus:ring-0!"
        />
      </div>

      {/* User Identity badge */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-[#ffffff]">{displayName}</span>
        
        {/* Role capsule matching Turso Pill Badge */}
        <div className="flex items-center bg-[#0e342d] border border-[#4ff7d1]/20 rounded-full pl-3 pr-1 py-0.5 gap-2">
          <span className="text-[9px] font-bold text-[#4ff7d1] uppercase tracking-wider">{displayRole}</span>
          <div className="w-6 h-6 rounded-full bg-[#4ff7d1] text-[#0d1318] text-[9px] font-extrabold flex items-center justify-center">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
