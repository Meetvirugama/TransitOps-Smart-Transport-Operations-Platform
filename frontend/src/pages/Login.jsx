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

  // Individual field error states (validation errors)
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
      'Admin':            { email: 'admin@transitops.in',      password: 'admin123'      },
      'Fleet Manager':   { email: 'manager@transitops.in',    password: 'manager123'    },
      'Dispatcher':      { email: 'dispatcher@transitops.in', password: 'dispatcher123' },
      'Safety Officer':  { email: 'safety@transitops.in',     password: 'safety123'     },
      'Financial Analyst':{ email: 'finance@transitops.in',   password: 'finance123'    }
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
    <div className="flex min-screen min-h-screen w-screen relative overflow-hidden bg-[#0d1318] text-[#ffffff] select-none font-sans">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .shake {
          animation: shake 0.4s ease-in-out;
        }
        .dot-grid {
          background-image: radial-gradient(rgba(79, 247, 209, 0.04) 1.5px, transparent 1.5px);
          background-size: 24px 24px;
        }
      `}</style>

      {/* Top-Right Status indicators (Unified Monochromatic/Clean colors) */}
      <div className="absolute top-6 right-6 flex gap-2.5 z-10 items-center">
        {/* Systems status dot + Operational message */}
        <div className="flex items-center gap-2 bg-[#111820] border border-[#1e2d38] px-3.5 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[10px] font-bold text-[#c5cace] uppercase tracking-wider">All systems operational</span>
        </div>
        <span className="bg-[#111820] border border-[#1e2d38] text-[#86898c] text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">Beta</span>
      </div>

      {/* Left Panel (Deep Space Branding + Grid Background + Live Stat) */}
      <div className="flex-1 hidden md:flex flex-col justify-between p-14 relative bg-[#0d1318] border-r border-[#1e2d38] overflow-hidden">
        {/* Faint Dot Grid Pattern overlay */}
        <div className="absolute inset-0 dot-grid pointer-events-none" />
        
        {/* Brand details */}
        <div className="flex flex-col gap-6 my-auto max-w-sm z-10">
          <div className="flex items-center gap-3">
            {/* SVG Path Route logo */}
            <svg width="48" height="48" viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 80 Q25 40 55 40 Q85 40 85 10" stroke="#4ff7d1" strokeWidth="8" fill="none" strokeLinecap="round"/>
              <circle cx="25" cy="80" r="8" fill="#4ff7d1"/>
              <circle cx="85" cy="10" r="8" fill="#4ff7d1"/>
            </svg>
            <h1 className="text-[52px] font-black text-white tracking-tightest leading-none">TransitOps</h1>
          </div>
          <p className="text-sm text-[#86898c] font-medium leading-relaxed">
            Smart Transport Operations Platform. High performance terminal dashboard built for fleet management.
          </p>
          
          {/* Faint live stat widget to add life */}
          <div className="flex items-center gap-3 border border-[#1e2d38] bg-[#111820]/40 rounded-xl p-3.5 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4ff7d1] animate-pulse flex-shrink-0" />
            <span className="text-xs text-[#c5cace] font-mono">142 active vehicles tracked today</span>
          </div>
        </div>

        <div className="font-mono text-[9px] tracking-widest text-[#86898c] shrink-0 z-10 uppercase">
          TRANSITOPS &copy; 2026 &middot; SECURE OPERATOR PORTAL
        </div>
      </div>

      {/* Right Panel (Solid and Opaque - Simple form style) */}
      <div className="flex-[1.1] bg-[#111820] flex items-center justify-center p-12 relative border-l border-[#1e2d38]">
        <div className={`w-full max-w-[390px] flex flex-col gap-8 transition-all-custom animate-page-fade ${shake ? 'shake' : ''}`}>
          <div>
            {/* Minimal Mobile Logo */}
            <div className="flex md:hidden items-center gap-3 mb-6">
              <svg width="32" height="32" viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 80 Q25 40 55 40 Q85 40 85 10" stroke="#4ff7d1" strokeWidth="8" fill="none" strokeLinecap="round"/>
                <circle cx="25" cy="80" r="8" fill="#4ff7d1"/>
                <circle cx="85" cy="10" r="8" fill="#4ff7d1"/>
              </svg>
              <h1 className="text-2xl font-black text-white">TransitOps</h1>
            </div>
            
            <h2 className="text-4xl font-extrabold text-[#ffffff] tracking-tight leading-none mb-3">Sign in</h2>
            <p className="text-sm text-[#86898c] font-medium">Enter credentials to open developer console</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-[#b6b8ba] font-bold tracking-widest uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailInput}
                className={`w-full bg-[#0d1318] border text-sm text-[#ffffff] py-3.5 px-4 rounded-xl outline-none transition-all duration-150 focus:border-[#4ff7d1] ${
                  emailError ? 'border-[#ef4444]' : 'border-[#1e2d38]'
                }`}
                placeholder="developer@transitops.in"
                required
              />
              {emailError && (
                <span className="text-xs text-[#ef4444] font-medium mt-0.5 leading-tight">{emailError}</span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-[#b6b8ba] font-bold tracking-widest uppercase">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                className={`w-full bg-[#0d1318] border text-sm text-[#ffffff] py-3.5 px-4 rounded-xl outline-none transition-all duration-150 focus:border-[#4ff7d1] ${
                  passwordError ? 'border-[#ef4444]' : 'border-[#1e2d38]'
                }`}
                placeholder="••••••••"
                required
              />
              {passwordError && (
                <span className="text-xs text-[#ef4444] font-medium mt-0.5 leading-tight">{passwordError}</span>
              )}
            </div>

            {/* Role scope dropdown */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-[#b6b8ba] font-bold tracking-widest uppercase">Sign In As (Demo Context)</label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className={`w-full bg-[#0d1318] border text-sm text-[#ffffff] py-3.5 px-4 rounded-xl cursor-pointer appearance-none pr-10 outline-none transition-all duration-150 focus:border-[#4ff7d1] ${
                  roleError ? 'border-[#ef4444]' : 'border-[#1e2d38]'
                }`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2386898c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1.25rem center',
                  backgroundSize: '1.1rem'
                }}
                required
              >
                <option value="" disabled>Select demo context...</option>
                <option value="Admin">Admin</option>
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
                <span className={`w-[18px] h-[18px] rounded border border-[#1e2d38] flex items-center justify-center transition-all ${rememberMe ? 'bg-[#4ff7d1] border-[#4ff7d1]' : 'bg-[#0d1318]'}`}>
                  {rememberMe && (
                    <span className="block w-1.5 h-2.5 border-r-2 border-b-2 border-[#0d1318] rotate-45 mb-[2px]"></span>
                  )}
                </span>
                Remember me
              </label>
              <a href="#" className="text-[#4ff7d1] hover:underline">Forgot password?</a>
            </div>

            {/* Flat Brand Button (No neon glows) */}
            <button
              type="submit"
              disabled={locked}
              className={`w-full text-sm font-bold rounded-full py-3.5 text-center transition-all duration-150 select-none cursor-pointer ${
                locked 
                  ? 'bg-red-950 border border-red-500/25 text-[#ef4444] cursor-not-allowed opacity-60' 
                  : 'bg-[#4ff7d1] hover:bg-[#3be0bd] text-[#0d1318]'
              }`}
            >
              {locked ? 'Console Locked' : 'Sign In'}
            </button>
          </form>

          {/* Quick Select Inline Demo Accounts */}
          <div className="flex flex-col gap-2 border-t border-[#1e2d38] pt-5">
            <span className="text-[10px] text-[#86898c] font-bold uppercase tracking-widest font-mono text-center">Quick Prefill Demo Accounts</span>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {[
                { role: 'Fleet Manager', email: 'manager@transitops.in', short: 'Manager' },
                { role: 'Dispatcher', email: 'dispatcher@transitops.in', short: 'Dispatcher' },
                { role: 'Safety Officer', email: 'safety@transitops.in', short: 'Safety' },
                { role: 'Financial Analyst', email: 'finance@transitops.in', short: 'Analyst' }
              ].map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => handleDemoClick(acc.email, acc.role)}
                  className="bg-[#0d1318] border border-[#1e2d38] hover:border-[#4ff7d1] hover:text-[#4ff7d1] text-xs font-semibold px-3 py-2 rounded-xl text-center text-[#c5cace] transition-all duration-150 whitespace-nowrap"
                >
                  {acc.short}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
