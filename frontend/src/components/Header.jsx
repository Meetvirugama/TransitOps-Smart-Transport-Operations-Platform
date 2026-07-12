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
    <header className="h-16 border-b border-dark-border flex items-center justify-between px-8 shrink-0 select-none">
      {/* Search Input Box */}
      <div className="flex items-center gap-2 bg-dark-card border border-dark-border rounded-md px-3 py-1.5 w-64">
        <span className="text-sm text-dark-muted" role="img" aria-label="search">🔍</span>
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent border-none outline-none text-xs text-dark-text w-full placeholder:text-dark-muted/50"
        />
      </div>

      {/* User Identity badge */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-dark-text">{displayName}</span>
        
        {/* Role capsule matching mockups */}
        <div className="flex items-center bg-accent-blue/10 border border-accent-blue/20 rounded-full pl-3 pr-1 py-0.5 gap-2">
          <span className="text-[10px] font-bold text-accent-blue uppercase tracking-wider">{displayRole}</span>
          <div className="w-6 h-6 rounded-full bg-accent-blue text-dark-text text-[10px] font-bold flex items-center justify-content-center justify-center">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
