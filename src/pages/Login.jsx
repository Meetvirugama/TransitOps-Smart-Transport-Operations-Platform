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

      {/* Left Panel (Deep Space Developer Console) */}
      <div className="flex-1 flex flex-col justify-between p-14 relative bg-[#0d1318] border-r border-[#283945]">
        <div className="flex flex-col gap-6 mt-6">
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
            <p className="text-sm text-[#86898c] max-w-sm font-medium leading-relaxed">
              Smart Transport Operations Platform. High performance terminal dashboard built for fleet management.
            </p>
          </div>

          {/* Monospace Code Snippet Block */}
          <div className="bg-[#162129] border border-[#283945] rounded-xl p-4 font-mono text-[11px] leading-relaxed text-[#c5cace] max-w-sm mt-8 select-all relative group">
            <span className="text-[#d946ef]">$</span> transitops login --role=<span className="text-[#4ff7d1]">"Dispatcher"</span>
            <br />
            <span className="text-[#86898c]"># establishing connection to fleet-registry...</span>
            <br />
            <span className="text-[#4ff7d1]">success</span>: Authenticated session transitops_session
            <div className="absolute right-3 top-3 text-[9px] font-bold text-[#d946ef] bg-[#162129] border border-[#283945] px-2 py-0.5 rounded uppercase opacity-0 group-hover:opacity-100 transition-opacity">v1.2.0</div>
          </div>
        </div>

        <div className="my-10">
          <h3 className="font-heading text-xs uppercase tracking-wider text-[#b6b8ba] font-bold mb-4">Authorized Scopes:</h3>
          <ul className="flex flex-col gap-3">
            {['Fleet Manager &bull; Fleet, Maintenance', 'Dispatcher &bull; Dashboard, Trips', 'Safety Officer &bull; Drivers, Compliance', 'Financial Analyst &bull; Expenses, Analytics'].map((r, i) => (
              <li key={i} className="flex items-center gap-3 text-xs font-semibold text-[#c5cace]">
                <span className="w-1.5 h-1.5 bg-[#4ff7d1] rounded-full"></span>
                <span dangerouslySetInnerHTML={{ __html: r }}></span>
              </li>
            ))}
          </ul>
        </div>

        <div className="font-mono text-[10px] tracking-wider text-[#86898c]">
          TRANSITOPS &copy; 2026 &middot; SECURE CLIENT CONSOLE
        </div>
      </div>

      {/* Right Panel (Obsidian Panel - Unified Dark) */}
      <div className="flex-[1.1] bg-[#121b1f] flex items-center justify-center p-12 relative border-l border-[#283945]">
        {/* Error Popup Box */}
        {errorMsg && (
          <div className="absolute top-6 right-6 w-[340px] bg-[#0d1318] border border-[#d946ef] p-4 rounded-xl shadow-none flex gap-3 z-50 animate-in slide-in-from-top-4 duration-300 overflow-hidden">
            {/* Animated status alert icon */}
            <div className="w-9 h-9 rounded-lg bg-[#162129] border border-[#283945] flex items-center justify-center shrink-0 text-[#d946ef] text-sm font-mono font-bold">
              !
            </div>

            {/* Text body */}
            <div className="flex flex-col gap-0.5 flex-1 select-text">
              <span className="font-mono text-[9px] text-[#d946ef] font-bold uppercase tracking-wider">SYSTEM ALERT</span>
              <span className="text-[11px] text-[#c5cace] font-medium leading-normal mt-0.5">
                {errorMsg.includes('locked') 
                  ? <><strong>Access Denied:</strong> Console lockout active after 5 failed tries.</>
                  : errorMsg
                }
              </span>
            </div>

            {/* Close Button */}
            <button 
              onClick={() => setErrorMsg('')} 
              className="text-[#86898c] hover:text-[#ffffff] text-lg cursor-pointer leading-none self-start transition-transform hover:scale-110"
            >
              &times;
            </button>

            {/* Decreasing Progress Bar */}
            <div className="absolute bottom-0 left-0 h-[2px] bg-[#d946ef] animate-toast-progress"></div>
          </div>
        )}

        <div className={`w-full max-w-[380px] flex flex-col gap-8 transition-transform duration-200 ${shake ? 'shake' : ''}`}>
          <div>
            <h2 className="text-3xl font-extrabold text-[#ffffff] tracking-tight leading-none mb-2">Sign in</h2>
            <p className="text-xs text-[#86898c] font-medium">Enter credentials to open developer console</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[9px] text-[#b6b8ba] font-bold tracking-wider uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailInput}
                className="w-full bg-[#162129] border border-[#283945] text-sm text-[#ffffff]"
                placeholder="developer@transitops.in"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-[9px] text-[#b6b8ba] font-bold tracking-wider uppercase">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#162129] border border-[#283945] text-sm text-[#ffffff]"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-[9px] text-[#b6b8ba] font-bold tracking-wider uppercase">Role (RBAC Scope)</label>
              <select
                value={role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full bg-[#162129] border border-[#283945] text-sm text-[#ffffff] cursor-pointer appearance-none pr-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2386898c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  backgroundSize: '1rem'
                }}
                required
              >
                <option value="" disabled>Select access scope...</option>
                <option value="Fleet Manager">Fleet Manager</option>
                <option value="Dispatcher">Dispatcher</option>
                <option value="Safety Officer">Safety Officer</option>
                <option value="Financial Analyst">Financial Analyst</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#ffffff]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="hidden"
                />
                <span className={`w-[16px] h-[16px] rounded border border-[#283945] flex items-center justify-center transition-all duration-150 ${rememberMe ? 'bg-[#4ff7d1] border-[#4ff7d1]' : 'bg-[#162129]'}`}>
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
              className={`w-full text-xs font-bold rounded-full py-3 text-center transition-all duration-150 select-none cursor-pointer ${
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

      {/* Demo Credentials Drawer helper */}
      <button 
        onClick={() => setShowDemo(!showDemo)} 
        className="fixed bottom-6 right-6 bg-[#162129] border border-[#283945] text-[#b6b8ba] hover:text-[#ffffff] hover:border-[#4ff7d1] text-xs font-semibold py-2.5 px-4 rounded-full shadow-none flex items-center gap-2 cursor-pointer z-50 transition-all duration-150"
      >
        <span>💻</span> Console Demo Accounts
      </button>

      {showDemo && (
        <div className="fixed bottom-16 right-6 w-80 bg-[#162129] border border-[#283945] rounded-xl p-5 shadow-none z-50 flex flex-col gap-4 animate-in slide-in-from-bottom-5 duration-150">
          <div className="flex justify-between items-center border-b border-[#283945] pb-2">
            <span className="font-heading text-xs font-bold text-[#ffffff]">Select Account Scope</span>
            <button onClick={() => setShowDemo(false)} className="text-base text-[#86898c] hover:text-[#ffffff] cursor-pointer">&times;</button>
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
                className="bg-[#121b1f] border border-[#283945] hover:border-[#4ff7d1] rounded-xl p-3 cursor-pointer transition-all duration-150 text-left relative overflow-hidden"
              >
                <div className="text-[9px] font-bold text-[#4ff7d1] uppercase tracking-wider">{acc.role}</div>
                <div className="text-[10px] text-[#86898c] font-mono mt-0.5">{acc.email}</div>
                <div className="absolute right-3 top-3 text-[8px] font-extrabold text-[#d946ef] bg-[#0d1318] border border-[#d946ef]/10 rounded px-1.5 uppercase">BETA</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
