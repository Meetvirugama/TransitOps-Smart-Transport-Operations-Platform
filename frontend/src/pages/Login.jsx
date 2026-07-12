import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, isLockedOut } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [shake, setShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [locked, setLocked] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  // Individual field error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [roleError, setRoleError] = useState('');

  // Prefill remembered credentials
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('transitops_remembered_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Handle role change - auto fills credentials
  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setRoleError('');
    if (!selectedRole) return;

    const roleCredentials = {
      'Fleet Manager': { email: 'manager@transitops.in', password: 'admin123' },
      'Dispatcher': { email: 'dispatcher@transitops.in', password: 'admin123' },
      'Safety Officer': { email: 'safety@transitops.in', password: 'admin123' },
      'Financial Analyst': { email: 'finance@transitops.in', password: 'admin123' }
    };

    const creds = roleCredentials[selectedRole];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.password);
      setEmailError('');
      setPasswordError('');
      setErrorMsg('');

      // Auto check lockout
      if (isLockedOut(creds.email)) {
        setEmailError('Account locked after 5 failed attempts.');
        setLocked(true);
      } else {
        setLocked(false);
      }
    }
  };

  // Keystroke check for lockout
  const handleEmailInput = (e) => {
    const val = e.target.value;
    setEmail(val);
    setEmailError('');
    if (isLockedOut(val.trim().toLowerCase())) {
      setEmailError('Account locked after 5 failed attempts.');
      setLocked(true);
    } else {
      setLocked(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setRoleError('');
    setErrorMsg('');

    let hasErrors = false;

    // Validate email
    if (!email.trim()) {
      setEmailError('Email address is required.');
      hasErrors = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError('Enter a valid email address.');
        hasErrors = true;
      }
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required.');
      hasErrors = true;
    }

    // Validate role
    if (!role) {
      setRoleError('Access scope (role) must be selected.');
      hasErrors = true;
    }

    if (hasErrors) {
      triggerShakeEffect();
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      if (rememberMe) {
        localStorage.setItem('transitops_remembered_email', email);
      } else {
        localStorage.removeItem('transitops_remembered_email');
      }
      navigate('/dashboard');
    } else {
      triggerShakeEffect();
      if (result.locked) {
        setLocked(true);
        setEmailError('Account locked after 5 failed attempts.');
      } else {
        setEmailError('Invalid email or password credentials.');
        setPasswordError('Invalid email or password credentials.');
      }
    }
  };

  const triggerShakeEffect = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  // Demo Helper Quick Select
  const handleDemoClick = (demEmail, demRole) => {
    setEmail(demEmail);
    setPassword('admin123');
    setRole(demRole);
    setShowDemo(false);
    setEmailError('');
    setPasswordError('');
    setRoleError('');
    setErrorMsg('');

    if (isLockedOut(demEmail)) {
      setEmailError('Account locked after 5 failed attempts.');
      setLocked(true);
    } else {
      setLocked(false);
    }
  };

  return (
    <div className="flex min-screen min-h-screen w-screen relative overflow-hidden bg-[#0d1318] text-[#ffffff] select-none">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .shake {
          animation: shake 0.4s ease-in-out;
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-toast-progress {
          animation: toastProgress 5s linear forwards;
        }
      `}</style>

      {/* Top-Right Mockup Indicator Badges */}
      <div className="absolute top-6 right-6 flex gap-2 z-10">
        <span className="bg-[#0e342d] border border-[#4ff7d1]/20 text-[#4ff7d1] text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Node: Active</span>
        <span className="bg-[#1c2b34] border border-[#d946ef]/20 text-[#d946ef] text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Beta</span>
      </div>

      {/* Left Panel (Deep Space Branding) */}
      <div className="flex-1 flex flex-col justify-between p-14 relative bg-[#0d1318] border-r border-[#283945]">
        <div className="flex flex-col gap-6 my-auto max-w-sm">
          <div className="flex items-center gap-4 select-none">
            <div className="grid grid-cols-3 gap-[3px] w-8 h-8" aria-hidden="true">
              <span className="bg-[#4ff7d1] rounded-[2px]"></span>
              <span className="bg-[#4ff7d1] rounded-[2px]"></span>
              <span className="bg-[#4ff7d1] rounded-[2px]"></span>
              <span className="bg-[#4ff7d1] rounded-[2px]"></span>
              <span className="bg-[#4ff7d1] rounded-[2px]"></span>
              <span className="bg-[#4ff7d1] rounded-[2px]"></span>
              <span className="bg-[#4ff7d1] rounded-[2px]"></span>
              <span className="bg-[#4ff7d1] rounded-[2px]"></span>
              <span className="bg-[#4ff7d1] rounded-[2px]"></span>
            </div>
          </div>
          <div>
            <h1 className="text-[72px] font-extrabold text-[#4ff7d1] tracking-tightest leading-[0.95] mb-4">TransitOps</h1>
            <p className="text-sm text-[#86898c] font-medium leading-relaxed">
              Smart Transport Operations Platform. High performance terminal dashboard built for fleet management.
            </p>
          </div>
        </div>

        <div className="font-mono text-[10px] tracking-wider text-[#86898c] shrink-0">
          TRANSITOPS &copy; 2026 &middot; SECURE CLIENT CONSOLE
        </div>
      </div>

      {/* Right Panel (Obsidian Panel - Unified Dark) */}
      <div className="flex-[1.1] bg-[#121b1f] flex items-center justify-center p-12 relative border-l border-[#283945]">
        <div className={`w-full max-w-[390px] flex flex-col gap-8 transition-all-custom animate-page-fade ${shake ? 'shake' : ''}`}>
          <div>
            <h2 className="text-4xl font-extrabold text-[#ffffff] tracking-tight leading-none mb-3">Sign in</h2>
            <p className="text-sm text-[#86898c] font-medium">Enter credentials to open developer console</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[11px] text-[#b6b8ba] font-bold tracking-wider uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailInput}
                className={`w-full bg-[#162129] border text-base text-[#ffffff] py-3.5 px-4 rounded-xl transition-all-custom hover-glow ${
                  emailError ? 'border-[#ef4444]' : 'border-[#283945]'
                }`}
                placeholder="developer@transitops.in"
                required
              />
              {emailError && (
                <span className="text-xs text-[#ef4444] font-medium mt-0.5 leading-tight">{emailError}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-[11px] text-[#b6b8ba] font-bold tracking-wider uppercase">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                className={`w-full bg-[#162129] border text-base text-[#ffffff] py-3.5 px-4 rounded-xl transition-all-custom hover-glow ${
                  passwordError ? 'border-[#ef4444]' : 'border-[#283945]'
                }`}
                placeholder="••••••••"
                required
              />
              {passwordError && (
                <span className="text-xs text-[#ef4444] font-medium mt-0.5 leading-tight">{passwordError}</span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-[11px] text-[#b6b8ba] font-bold tracking-wider uppercase">Role (RBAC Scope)</label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className={`w-full bg-[#162129] border text-base text-[#ffffff] py-3.5 px-4 rounded-xl cursor-pointer appearance-none pr-10 transition-all-custom hover-glow ${
                  roleError ? 'border-[#ef4444]' : 'border-[#283945]'
                }`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2386898c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1.25rem center',
                  backgroundSize: '1.1rem'
                }}
                required
              >
                <option value="" disabled>Select access scope...</option>
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Dispatcher">Dispatcher</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Financial Analyst">Financial Analyst</option>
              </select>
              {roleError && (
                <span className="text-xs text-[#ef4444] font-medium mt-0.5 leading-tight">{roleError}</span>
              )}
            </div>

            <div className="flex items-center justify-between text-sm font-semibold">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#ffffff]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="hidden"
                />
                <span className={`w-[18px] h-[18px] rounded border border-[#283945] flex items-center justify-center transition-all-custom ${rememberMe ? 'bg-[#4ff7d1] border-[#4ff7d1]' : 'bg-[#162129]'}`}>
                  {rememberMe && (
                    <span className="block w-1.5 h-2.5 border-r-2 border-b-2 border-[#0d1318] rotate-45 mb-[2px]"></span>
                  )}
                </span>
                Remember me
              </label>
              <a href="#" className="text-[#4ff7d1] hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={locked}
              className={`w-full text-sm font-bold rounded-full py-3.5 text-center transition-all-custom select-none cursor-pointer hover:scale-[1.01] ${
                locked 
                  ? 'bg-[#a21caf] text-[#ffffff] cursor-not-allowed opacity-60' 
                  : 'bg-[#4ff7d1] hover:bg-[#3ee0be] text-[#0d1318]'
              }`}
            >
              {locked ? 'Console Locked' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      <button 
        onClick={() => setShowDemo(!showDemo)} 
        className="fixed bottom-6 right-6 bg-[#162129] border border-[#283945] text-[#b6b8ba] hover:text-[#ffffff] hover:border-[#4ff7d1] text-sm font-semibold py-3 px-5 rounded-full shadow-none flex items-center gap-2 cursor-pointer z-50 transition-all-custom hover:scale-105"
      >
        Console Demo Accounts
      </button>

      {showDemo && (
        <div className="fixed bottom-18 right-6 w-80 bg-[#162129] border border-[#283945] rounded-xl p-5 shadow-none z-50 flex flex-col gap-4 animate-in slide-in-from-bottom-5 duration-150">
          <div className="flex justify-between items-center border-b border-[#283945] pb-2">
            <span className="font-heading text-sm font-bold text-[#ffffff]">Select Account Scope</span>
            <button onClick={() => setShowDemo(false)} className="text-lg text-[#86898c] hover:text-[#ffffff] cursor-pointer">&times;</button>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { role: 'Fleet Manager', email: 'manager@transitops.in' },
              { role: 'Dispatcher', email: 'dispatcher@transitops.in' },
              { role: 'Safety Officer', email: 'safety@transitops.in' },
              { role: 'Financial Analyst', email: 'finance@transitops.in' }
            ].map((acc) => (
              <div 
                key={acc.role} 
                onClick={() => handleDemoClick(acc.email, acc.role)}
                className="bg-[#121b1f] border border-[#283945] hover:border-[#4ff7d1] rounded-xl p-3.5 cursor-pointer transition-all-custom text-left relative overflow-hidden hover:scale-[1.02]"
              >
                <div className="text-xs font-bold text-[#4ff7d1] uppercase tracking-wider">{acc.role}</div>
                <div className="text-xs text-[#86898c] font-mono mt-1">{acc.email}</div>
                <div className="absolute right-3 top-3 text-[9px] font-extrabold text-[#d946ef] bg-[#0d1318] border border-[#d946ef]/10 rounded px-1.5 uppercase">BETA</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
