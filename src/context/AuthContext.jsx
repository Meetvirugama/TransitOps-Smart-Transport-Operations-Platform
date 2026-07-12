import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDb } from '../db/mockDb';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If DB was reset (version bump), clear stale session so new names load on next login
    const currentDbVersion = localStorage.getItem('transitops_db_version');
    const sessionDbVersion = sessionStorage.getItem('transitops_session_db_version');
    if (currentDbVersion && sessionDbVersion !== currentDbVersion) {
      sessionStorage.removeItem('transitops_session');
      sessionStorage.setItem('transitops_session_db_version', currentDbVersion);
    }

    const session = sessionStorage.getItem('transitops_session');
    if (session) {
      setUser(JSON.parse(session));
    }
    setLoading(false);
  }, []);

  const getFailedAttempts = (email) => {
    const key = `transitops_failed_attempts_${email.toLowerCase()}`;
    return parseInt(localStorage.getItem(key) || '0', 10);
  };

  const isLockedOut = (email) => {
    if (!email) return false;
    return getFailedAttempts(email) >= 5;
  };

  const incrementFailedAttempts = (email) => {
    if (!email) return 0;
    const key = `transitops_failed_attempts_${email.toLowerCase()}`;
    const attempts = getFailedAttempts(email) + 1;
    localStorage.setItem(key, attempts.toString());
    return attempts;
  };

  const resetFailedAttempts = (email) => {
    if (!email) return;
    const key = `transitops_failed_attempts_${email.toLowerCase()}`;
    localStorage.removeItem(key);
  };

  const login = (email, password, role) => {
    if (!email || !password || !role) {
      return { success: false, message: 'All fields (Email, Password, Role) are required.' };
    }

    const emailLower = email.trim().toLowerCase();

    // Check Lockout
    if (isLockedOut(emailLower)) {
      return { success: false, message: 'Account locked after 5 failed attempts.', locked: true };
    }

    const users = mockDb.getUsers();
    const matchedUser = users.find(u => u.email.toLowerCase() === emailLower && u.password === password);

    if (!matchedUser) {
      const attempts = incrementFailedAttempts(emailLower);
      const remaining = Math.max(0, 5 - attempts);
      let message = 'Invalid credentials.';
      if (remaining === 0) {
        message += ' Account locked after 5 failed attempts.';
      } else {
        message += ` ${remaining} attempts remaining before lockout.`;
      }
      return { success: false, message, locked: remaining === 0 };
    }

    // Enforce RBAC
    if (matchedUser.role !== role) {
      const attempts = incrementFailedAttempts(emailLower);
      const remaining = Math.max(0, 5 - attempts);
      let message = `Invalid credentials for the selected role (${role}).`;
      if (remaining === 0) {
        message += ' Account locked after 5 failed attempts.';
      } else {
        message += ` ${remaining} attempts remaining before lockout.`;
      }
      return { success: false, message, locked: remaining === 0 };
    }

    // Success
    resetFailedAttempts(emailLower);
    const sessionUser = {
      email: matchedUser.email,
      name: matchedUser.name,
      role: matchedUser.role,
      loggedInAt: new Date().toISOString()
    };

    sessionStorage.setItem('transitops_session', JSON.stringify(sessionUser));
    setUser(sessionUser);
    return { success: true, user: sessionUser };
  };

  const logout = () => {
    sessionStorage.removeItem('transitops_session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLockedOut, getFailedAttempts }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
