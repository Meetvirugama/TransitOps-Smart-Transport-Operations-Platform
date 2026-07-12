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

  // Prefill remembered credentials
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('transitops_remembered_email');
    const rememberedRole = localStorage.getItem('transitops_remembered_role');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
    if (rememberedRole) {
      setRole(rememberedRole);
    }
  }, []);

  // Auto dismiss flash error message after 5 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  // Handle role change - auto fills credentials
  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
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
      setErrorMsg('');

      // Auto check lockout
      if (isLockedOut(creds.email)) {
        setErrorMsg('Account locked after 5 failed attempts.');
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
    if (isLockedOut(val.trim().toLowerCase())) {
      setErrorMsg('Account locked after 5 failed attempts.');
      setLocked(true);
    } else {
      setErrorMsg('');
      setLocked(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password || !role) {
      setErrorMsg('Please fill out all fields and select your role.');
      triggerShakeEffect();
      return;
    }

    const result = login(email, password, role);

    if (result.success) {
      if (rememberMe) {
        localStorage.setItem('transitops_remembered_email', email);
        localStorage.setItem('transitops_remembered_role', role);
      } else {
        localStorage.removeItem('transitops_remembered_email');
        localStorage.removeItem('transitops_remembered_role');
      }
      navigate('/dashboard');
    } else {
      setErrorMsg(result.message);
      triggerShakeEffect();
      if (result.locked) {
        setLocked(true);
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
    setErrorMsg('');

    if (isLockedOut(demEmail)) {
      setErrorMsg('Account locked after 5 failed attempts.');
      setLocked(true);
    } else {
      setLocked(false);
    }
  };

  return (
    <div className="flex min-screen min-h-screen w-screen relative overflow-hidden bg-[#030712] text-dark-text select-none">
      {/* Background Aurora Blobs */}
      <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-orange-500/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute -bottom-[15%] -right-[10%] w-[600px] h-[600px] rounded-full bg-blue-500/15 blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute top-[30%] right-[20%] w-[400px] h-[400px] rounded-full bg-cyan-500/8 blur-[120px] pointer-events-none z-0"></div>
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
        <div className="w-6 h-6 rounded-full bg-accent-red text-dark-text text-[10px] font-bold flex items-center justify-center cursor-pointer opacity-85 hover:opacity-100" onClick={() => alert("Admin Control Enforced.")}>A</div>
        <div className="w-6 h-6 rounded-full bg-accent-red text-dark-text text-[10px] font-bold flex items-center justify-center cursor-pointer opacity-85 hover:opacity-100" onClick={() => alert("Compliance Check Active.")}>C</div>
      </div>

      {/* Left Panel (Light Theme) */}
      <div className="flex-1 bg-bg-light text-text-light flex flex-col justify-between p-14 relative bg-[#F1F5F9] text-[#0F172A]">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 select-none">
            <div className="grid grid-cols-3 gap-[3px] w-11 h-11" aria-hidden="true">
              <span className="bg-brand rounded-[2px] opacity-85 rounded-tl-[4px] bg-[#B25E13]"></span>
              <span className="bg-brand rounded-[2px] opacity-85 bg-[#B25E13]"></span>
              <span className="bg-brand rounded-[2px] opacity-85 rounded-tr-[4px] bg-[#B25E13]"></span>
              <span className="bg-brand rounded-[2px] opacity-85 bg-[#B25E13]"></span>
              <span className="bg-brand rounded-[2px] opacity-85 bg-[#B25E13]"></span>
              <span className="bg-brand rounded-[2px] opacity-85 bg-[#B25E13]"></span>
              <span className="bg-brand rounded-[2px] opacity-85 rounded-bl-[4px] bg-[#B25E13]"></span>
              <span className="bg-brand rounded-[2px] opacity-85 bg-[#B25E13]"></span>
              <span className="bg-brand rounded-[2px] opacity-85 rounded-br-[4px] bg-[#B25E13]"></span>
            </div>
          </div>
          <div>
            <h1 className="font-heading text-4xl font-extrabold text-[#0F172A] tracking-tight">TransitOps</h1>
            <p className="text-sm text-[#475569] font-medium mt-1">Smart Transport Operations Platform</p>
          </div>
        </div>

        <div className="my-auto">
          <h3 className="font-heading text-lg text-[#0F172A] font-semibold mb-5">One login, four roles:</h3>
          <ul className="flex flex-col gap-4">
            {['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'].map((r) => (
              <li key={r} className="flex items-center gap-3 text-sm font-semibold text-[#0F172A]">
                <span className="w-2 h-2 bg-[#B25E13] rounded-full shadow-[0_0_6px_#B25E13]"></span>
                {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="font-mono text-[10px] tracking-wider text-[#475569] opacity-80">
          TRANSITOPS &copy; 2026 &middot; RBAC ENFORCED
        </div>
      </div>

      {/* Right Panel (Dark Theme) - Transparent to allow blobs to show through */}
      <div className="flex-[1.2] flex items-center justify-center p-12 relative z-10">
        {/* Error Popup Box */}
        {errorMsg && (
          <div className="absolute top-6 right-6 w-[340px] bg-red-950/40 backdrop-blur-md border border-red-500/30 p-4 rounded-xl shadow-2xl flex gap-3 z-50 animate-in slide-in-from-top-4 duration-300 overflow-hidden">
            {/* Glow layer */}
            <div className="absolute -inset-1 bg-red-500/5 blur-lg rounded-xl pointer-events-none"></div>

            {/* Animated status alert icon */}
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 text-red-400 text-lg relative z-10 animate-pulse">
              ⚠️
            </div>

            {/* Text body */}
            <div className="flex flex-col gap-1 relative z-10 flex-1">
              <span className="font-mono text-[9px] text-red-400 font-bold uppercase tracking-wider leading-none">Security Alert</span>
              <span className="text-[11px] text-red-200/90 font-medium leading-relaxed mt-0.5">
                {errorMsg.includes('locked') 
                  ? <><strong>Access Denied:</strong> Account locked after 5 failed attempts.</>
                  : errorMsg
                }
              </span>
            </div>

            {/* Close Button */}
            <button 
              onClick={() => setErrorMsg('')} 
              className="text-red-400 hover:text-red-200 text-lg cursor-pointer leading-none relative z-10 self-start transition-transform hover:scale-110"
            >
              &times;
            </button>

            {/* Decreasing Progress Bar */}
            <div className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-red-500 to-orange-500 animate-toast-progress"></div>
          </div>
        )}

        <div className={`w-full max-w-[440px] flex flex-col gap-8 transition-transform duration-200 ${shake ? 'shake' : ''}`}>
          <div>
            <h2 className="font-heading text-3xl font-bold text-dark-text tracking-tight mb-1">Sign in to your account</h2>
            <p className="text-xs text-dark-muted font-medium">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-dark-muted font-semibold tracking-wider uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailInput}
                className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-brand focus:ring-2 focus:ring-brand/35 text-dark-text"
                placeholder="Raven.k@transitops.in"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-dark-muted font-semibold tracking-wider uppercase">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-brand focus:ring-2 focus:ring-brand/35 text-dark-text"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] text-dark-muted font-semibold tracking-wider uppercase">Role (RBAC)</label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 text-sm outline-none transition-all duration-200 focus:border-brand focus:ring-2 focus:ring-brand/35 text-dark-text cursor-pointer appearance-none pr-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1.2rem'
                }}
                required
              >
                <option value="" disabled>Select your role...</option>
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Dispatcher">Dispatcher</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Financial Analyst">Financial Analyst</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer select-none text-dark-text">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="hidden"
                />
                <span className={`w-[18px] h-[18px] rounded border border-dark-border flex items-center justify-center transition-all duration-200 ${rememberMe ? 'bg-brand border-brand' : 'bg-dark-card'}`}>
                  {rememberMe && (
                    <span className="block w-1.5 h-3 border-r-2 border-b-2 border-dark-text rotate-45 mb-[3px]"></span>
                  )}
                </span>
                Remember me
              </label>
              <a href="#" className="text-accent-blue hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={locked}
              className={`w-full text-sm font-semibold rounded-md py-3 text-center transition-all duration-200 select-none cursor-pointer ${
                locked 
                  ? 'bg-accent-red text-dark-text cursor-not-allowed opacity-60' 
                  : 'bg-brand hover:bg-[#924C0D] text-dark-text shadow-[0_4px_14px_rgba(178,94,19,0.35)] hover:-translate-y-[1px]'
              }`}
            >
              {locked ? 'Account Locked' : 'Sign In'}
            </button>
          </form>

          <div className="border-t border-dark-border pt-6 mt-1 flex flex-col gap-2">
            <p className="text-[10px] text-dark-muted font-medium">Access is scoped by role after login:</p>
            <ul className="flex flex-col gap-1 text-[10px] text-dark-muted font-semibold">
              <li>&bull; <strong className="text-dark-text">Fleet Manager</strong> &rarr; Fleet, Maintenance</li>
              <li>&bull; <strong className="text-dark-text">Dispatcher</strong> &rarr; Dashboard, Trips</li>
              <li>&bull; <strong className="text-dark-text">Safety Officer</strong> &rarr; Drivers, Compliance</li>
              <li>&bull; <strong className="text-dark-text">Financial Analyst</strong> &rarr; Fuel & Expenses, Analytics</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Demo Credentials Drawer helper */}
      <button 
        onClick={() => setShowDemo(!showDemo)} 
        className="fixed bottom-6 right-6 bg-[#0B0F19] border border-dark-border text-dark-muted hover:text-dark-text hover:border-brand text-xs font-semibold py-2 px-4 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer z-50 transition-all duration-200"
      >
        <span>💡</span> Quick Demo Credentials
      </button>

      {showDemo && (
        <div className="fixed bottom-16 right-6 w-80 bg-dark-card border border-dark-border rounded-xl p-5 shadow-2xl z-50 flex flex-col gap-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex justify-between items-center border-b border-dark-border pb-2">
            <span className="font-heading text-xs font-bold">Select Demo Account</span>
            <button onClick={() => setShowDemo(false)} className="text-base text-dark-muted hover:text-dark-text cursor-pointer">&times;</button>
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
                className="bg-dark-bg border border-dark-border hover:border-brand hover:bg-brand/5 rounded-lg p-3 cursor-pointer transition-all duration-150 text-left"
              >
                <div className="text-[10px] font-bold text-brand uppercase">{acc.role}</div>
                <div className="text-[10px] text-dark-muted mt-0.5">{acc.email} (admin123)</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
