import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

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

  const login = async (email, password) => {
    if (!email || !password) {
      return { success: false, message: 'Both Email and Password are required.' };
    }

    const emailLower = email.trim().toLowerCase();

    // Check Lockout
    if (isLockedOut(emailLower)) {
      return { success: false, message: 'Account locked after 5 failed attempts.', locked: true };
    }

    try {
      const response = await api.post('/auth/login', { email: emailLower, password });
      const { user: matchedUser, token } = response.data;

      // Success
      resetFailedAttempts(emailLower);
      const sessionUser = {
        id: matchedUser.id,
        email: matchedUser.email,
        name: matchedUser.name || matchedUser.email.split('@')[0], // Backend currently doesn't store 'name'
        role: matchedUser.role,
        loggedInAt: new Date().toISOString()
      };

      localStorage.setItem('transitops_token', token);
      sessionStorage.setItem('transitops_session', JSON.stringify(sessionUser));
      setUser(sessionUser);
      return { success: true, user: sessionUser };
    } catch (error) {
      const attempts = incrementFailedAttempts(emailLower);
      const remaining = Math.max(0, 5 - attempts);
      let message = error.message || 'Invalid credentials.';
      if (remaining === 0) {
        message += ' Account locked after 5 failed attempts.';
      } else {
        message += ` ${remaining} attempts remaining before lockout.`;
      }
      return { success: false, message, locked: remaining === 0 };
    }
  };

  const logout = () => {
    localStorage.removeItem('transitops_token');
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
