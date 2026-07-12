import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import {
  Truck, Users, Route, Wrench, Fuel, TrendingUp,
  Clock, ChevronRight, AlertTriangle, CheckCircle2,
  Activity, Zap
} from 'lucide-react';
import OperationsBrief from '../components/OperationsBrief';

/* ─── helpers ─────────────────────────────────────────── */
function fmt(n) { return n?.toLocaleString('en-IN') ?? '0'; }

function AnimatedPct({ value, color }) {
  const [displayVal, setDisplayVal] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayVal(end);
      return;
    }
    const duration = 800; // ms
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / (end - start || 1)));
    const timer = setInterval(() => {
      start += increment;
      setDisplayVal(start);
      if (start === end) {
        clearInterval(timer);
      }
    }, Math.max(stepTime, 15));
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="stat-percent" style={{ color }}>
      {displayVal}%
    </span>
  );
}


/* ─── SVG Donut Chart ─────────────────────────────────── */
function DonutChart({ segments, size = 96, thickness = 14 }) {
  const r     = (size - thickness) / 2;
  const circ  = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset  = 0;
  const slices = segments.map((seg) => {
    const len   = (seg.value / total) * circ;
    const dash  = `${len} ${circ - len}`;
    const slice = { ...seg, dash, offset: circ * 0.25 - offset };
    offset += len;
    return slice;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e2d38" strokeWidth={thickness} />
      {slices.map(s => (
        <circle key={s.label} cx={size/2} cy={size/2} r={r} fill="none"
          stroke={s.color} strokeWidth={thickness}
          strokeDasharray={s.dash} strokeDashoffset={s.offset} strokeLinecap="butt"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      ))}
      <text x="50%" y="45%" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="800" fontFamily="Inter">{total}</text>
      <text x="50%" y="63%" textAnchor="middle" fill="#86898c" fontSize="8" fontFamily="Inter">total</text>
    </svg>
  );
}

/* ─── Activity Timeline entry ─────────────────────────── */
function TimelineItem({ time, label, icon: Icon, color, last }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border"
          style={{ background: `${color}15`, borderColor: `${color}40` }}>
          <Icon size={12} style={{ color }} />
        </div>
        {!last && <div className="w-px flex-1 min-h-[22px] bg-[#1e2d38] mt-1" />}
      </div>
      <div className="pb-3.5">
        <p className="text-sm font-medium text-[#c5cace] leading-snug">{label}</p>
        <p className="font-mono text-xs text-[#86898c] mt-0.5">{time}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export default function Dashboard() {
  const navigate = useNavigate();
  const [vehicleType, setVehicleType] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');

  const [vehicles,    setVehicles]    = useState([]);
  const [trips,       setTrips]       = useState([]);
  const [drivers,     setDrivers]     = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [fuelLogs,    setFuelLogs]    = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/vehicles',      { params: { limit: 200 } }),
      api.get('/trips',         { params: { limit: 200 } }),
      api.get('/drivers',       { params: { limit: 200 } }),
      api.get('/maintenance',   { params: { limit: 200 } }),
      api.get('/fuel',          { params: { limit: 200 } }),
    ]).then(([veh, trp, drv, maint, fuel]) => {
      if (veh.success)   setVehicles(veh.data || []);
      if (trp.success)   setTrips(trp.data || []);
      if (drv.success)   setDrivers(drv.data || []);
      if (maint.success) setMaintenance(maint.data || []);
      if (fuel.success)  setFuelLogs(fuel.data || []);
    }).catch(err => console.error('Dashboard fetch error', err));
  }, []);

  const filteredVehicles = useMemo(() => vehicles.filter(v => {
    const matchType   = vehicleType  === 'All' || v.type   === vehicleType;
    const matchStatus = statusFilter === 'All' || v.status === statusFilter;
    const matchRegion = regionFilter === 'All' || v.region === regionFilter;
    return matchType && matchStatus && matchRegion;
  }), [vehicles, vehicleType, statusFilter, regionFilter]);

  const kpis = useMemo(() => {
    const activeCount    = filteredVehicles.filter(v => v.status === 'On Trip').length;
    const availableCount = filteredVehicles.filter(v => v.status === 'Available').length;
    const inShopCount    = filteredVehicles.filter(v => v.status === 'In Shop').length;
    const retiredCount   = filteredVehicles.filter(v => v.status === 'Retired').length;
    const activeTrips    = trips.filter(t => t.status === 'Dispatched').length;
    const pendingTrips   = trips.filter(t => t.status === 'Draft').length;
    const completedTrips = trips.filter(t => t.status === 'Completed').length;
    const driversOnDuty  = drivers.filter(d => d.status === 'Available' || d.status === 'On Trip').length;
    const totalVehicles  = filteredVehicles.length || 1;
    const utilizationPct = Math.round((activeCount / totalVehicles) * 100);
    const fuelToday      = fuelLogs.reduce((s, f) => s + (f.cost || 0), 0);
    const maintAlerts    = maintenance.filter(m => m.status === 'Active').length;
    const totalTrips     = trips.length || 1;
    return { activeCount, availableCount, inShopCount, retiredCount, activeTrips, pendingTrips, completedTrips, driversOnDuty, totalVehicles, utilizationPct, fuelToday, maintAlerts, totalTrips };
  }, [filteredVehicles, trips, drivers, maintenance, fuelLogs]);

  const recentTrips = useMemo(() => [...trips].reverse().slice(0, 5), [trips]);

  const activityFeed = useMemo(() => {
    const items = [];
    trips.filter(t => t.status === 'Dispatched').forEach(t => {
      items.push({ time: '10:30 AM', label: `${t.vehicle} dispatched → ${t.destination || 'destination'}`, icon: Truck, color: '#4ff7d1' });
    });
    maintenance.filter(m => m.status === 'Active').forEach(m => {
      items.push({ time: '09:55 AM', label: `Maintenance scheduled for ${m.vehicle}`, icon: Wrench, color: '#f59e0b' });
    });
    fuelLogs.slice(0, 2).forEach(f => {
      items.push({ time: '09:20 AM', label: `Fuel log added for ${f.vehicle} — ${f.liters}L`, icon: Fuel, color: '#eab308' });
    });
    drivers.filter(d => d.status === 'Available').slice(0, 2).forEach(d => {
      items.push({ time: '08:45 AM', label: `${d.name} checked in`, icon: Users, color: '#a855f7' });
    });
    return items.slice(0, 5);
  }, [trips, maintenance, fuelLogs, drivers]);

  const statusPill = (status) => {
    const map = {
      Dispatched: { bg: '#0a2820', text: '#4ff7d1', border: 'rgba(79,247,209,0.25)' },
      Completed:  { bg: '#0b1f0f', text: '#22c55e', border: 'rgba(34,197,94,0.25)'  },
      Draft:      { bg: '#151f28', text: '#86898c', border: '#1e2d38'                },
      Cancelled:  { bg: '#160d1a', text: '#d946ef', border: 'rgba(217,70,239,0.25)' },
    };
    return map[status] || map.Draft;
  };

  const donutSegments = [
    { label: 'Available', value: kpis.availableCount, color: '#22c55e' },
    { label: 'On Trip',   value: kpis.activeCount,    color: '#4ff7d1' },
    { label: 'In Shop',   value: kpis.inShopCount,    color: '#f59e0b' },
    { label: 'Retired',   value: kpis.retiredCount,   color: '#6b7280' },
  ];

  const tiles = [
    { label: 'Active Vehicles',  value: kpis.activeCount,    sub: 'On trip now',       icon: Truck,         color: '#4ff7d1', path: '/fleet'       },
    { label: 'Available',        value: kpis.availableCount, sub: 'Ready to dispatch',  icon: CheckCircle2,  color: '#22c55e', path: '/fleet'       },
    { label: 'Active Trips',     value: kpis.activeTrips,    sub: 'Dispatched',         icon: Route,         color: '#3b82f6', path: '/trips'       },
    { label: 'Pending Trips',    value: kpis.pendingTrips,   sub: 'Awaiting vehicle',   icon: Clock,         color: '#f59e0b', path: '/trips'       },
    { label: 'Drivers On Duty',  value: kpis.driversOnDuty,  sub: 'Active personnel',   icon: Users,         color: '#a855f7', path: '/drivers'     },
    { label: 'Maintenance',      value: kpis.inShopCount,    sub: 'In shop / repair',   icon: Wrench,        color: '#f59e0b', path: '/maintenance' },
  ];

  const dispatchedPct  = Math.round((kpis.activeTrips    / kpis.totalTrips) * 100);
  const completedPct   = Math.round((kpis.completedTrips / kpis.totalTrips) * 100);
  const pendingPct     = Math.round((kpis.pendingTrips   / kpis.totalTrips) * 100);

  return (
    <div className="flex flex-col gap-6 select-none animate-page-fade max-w-[1600px]">

      {/* ── 1. Page Header: Title + Subtitle + Today's Summary (Horizontal) ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight">Dashboard</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#4ff7d1]/25 bg-[#4ff7d1]/10 text-[10px] font-bold text-[#4ff7d1] uppercase tracking-widest font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ff7d1] animate-signal-breathe" />
              Live
            </span>
          </div>
          <p className="text-sm text-[#86898c] mt-1 max-w-xl">
            Monitor fleet activity, dispatch operations, maintenance schedules, and operational health in real time.
          </p>
        </div>

        {/* Compact Horizontal Today's Summary */}
        <div className="flex flex-wrap items-center gap-4 bg-[#111820] border border-[#1e2d38] rounded-xl px-4 py-2">
          <div className="flex items-center gap-1.5 pr-3">
            <span className="font-mono text-[9px] text-[#86898c] uppercase tracking-widest font-bold">Today</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Truck size={13} className="text-[#22c55e]" />
              <span className="text-xs text-[#86898c]">Available:</span>
              <span className="font-mono text-xs font-bold text-white">{kpis.availableCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Route size={13} className="text-[#3b82f6]" />
              <span className="text-xs text-[#86898c]">Active:</span>
              <span className="font-mono text-xs font-bold text-white">{kpis.activeTrips}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-[#f59e0b]" />
              <span className="text-xs text-[#86898c]">Alerts:</span>
              <span className="font-mono text-xs font-bold text-white">{kpis.maintAlerts}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel size={13} className="text-[#eab308]" />
              <span className="text-xs text-[#86898c]">Fuel Cost:</span>
              <span className="font-mono text-xs font-bold text-white">₹{fmt(kpis.fuelToday)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex gap-3 flex-wrap items-center">
        {[
          { label: 'Vehicle Type', value: vehicleType,  onChange: setVehicleType,  options: ['All', 'Van', 'Truck', 'Mini'] },
          { label: 'Status',       value: statusFilter, onChange: setStatusFilter, options: ['All', 'Available', 'On Trip', 'In Shop', 'Retired'] },
          { label: 'Region',       value: regionFilter, onChange: setRegionFilter, options: ['All', 'North', 'South', 'East', 'West'] },
        ].map((f) => (
          <div key={f.label} className="flex flex-col gap-1">
            <label className="font-mono text-[9px] text-[#86898c] uppercase tracking-widest font-bold pl-1">{f.label}</label>
            <select
              value={f.value} onChange={(e) => f.onChange(e.target.value)}
              className="bg-[#111820] border border-[#1e2d38] rounded-xl px-4 py-2 text-sm text-white outline-none cursor-pointer appearance-none pr-9 transition-all duration-200 hover:border-[#4ff7d1]/40"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234ff7d1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem center', backgroundSize: '0.85rem'
              }}
            >
              {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* ── 2. Hero Section Layout: 12-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Shortened Fleet Utilization + 4 KPI Cards (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Shortened Fleet Utilization Card */}
          <div className="relative rounded-2xl border border-[#1e2d38] bg-[#111820] p-5 flex items-center justify-between overflow-hidden transition-all duration-180 hover:border-[#4ff7d1]/30 cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4ff7d1]/[0.02] to-transparent pointer-events-none rounded-2xl" />
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#4ff7d1]/20 to-transparent" />

            <div className="flex flex-col gap-1.5 z-10">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={14} className="text-[#4ff7d1]" />
                <span className="font-mono text-[9px] text-[#86898c] uppercase tracking-widest font-bold">Fleet Utilization</span>
              </div>
              <div className="text-4xl xl:text-5xl font-black tracking-tight leading-none mt-1" style={{ color: '#4ff7d1' }}>
                {kpis.utilizationPct}%
              </div>
              <p className="text-xs text-[#86898c] mt-0.5">{kpis.activeCount} of {kpis.totalVehicles} active vehicles</p>
              
              {/* Mini progress bar */}
              <div className="h-1.5 w-32 bg-[#0a0f14] rounded-full border border-[#1e2d38] overflow-hidden mt-1">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${kpis.utilizationPct}%`, background: 'linear-gradient(90deg, #4ff7d1aa, #4ff7d1)' }} />
              </div>

              <button onClick={() => navigate('/fleet')}
                className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#4ff7d1] hover:text-white transition-colors">
                View Fleet <ChevronRight size={12} />
              </button>
            </div>

            {/* Compact Donut Chart */}
            <div className="flex flex-col items-center gap-2 z-10">
              <DonutChart segments={donutSegments} size={85} thickness={12} />
              <div className="flex flex-col gap-0.5">
                {donutSegments.slice(0, 2).map(s => (
                  <div key={s.label} className="flex items-center gap-1.5 text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-[#86898c]">{s.label}:</span>
                    <span className="font-mono font-bold text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reintroduced 4 KPI tiles directly beneath Utilization Card */}
          <div className="grid grid-cols-2 gap-3">
            {tiles.slice(0, 4).map(t => (
              <div
                key={t.label}
                onClick={() => navigate(t.path)}
                className="group relative border border-[#1e2d38] rounded-xl p-4 bg-[#111820] flex flex-col gap-1.5 cursor-pointer transition-all duration-180 hover:-translate-y-0.5"
                onMouseEnter={e => e.currentTarget.style.borderColor = `${t.color}45`}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2d38'}
              >
                <div className="flex items-center justify-between">
                  <t.icon size={14} style={{ color: t.color }} />
                  <ChevronRight size={11} className="text-[#1e2d38] group-hover:text-[#86898c] transition-colors" />
                </div>
                <div className="text-3xl font-black text-white leading-none mt-1">{t.value}</div>
                <div className="text-xs font-bold text-[#c5cace] mt-1">{t.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Prominent Today's Dispatch Status Hero Widget + 2 remaining KPI tiles (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Today's Dispatch Status Hero Widget */}
          <div className="relative rounded-2xl border border-[#3b82f6]/25 bg-[#111820] p-5 overflow-hidden transition-all duration-180 hover:border-[#3b82f6]/45 flex-1 flex flex-col justify-between"
            style={{ background: 'linear-gradient(135deg, #111820 0%, #0d1420 100%)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/[0.04] to-transparent pointer-events-none rounded-2xl" />
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#3b82f6]/30 to-transparent" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-[#3b82f6]" />
                  <span className="font-mono text-[9px] text-[#86898c] uppercase tracking-widest font-bold">Today's Dispatch Status</span>
                </div>
                <button onClick={() => navigate('/trips')}
                  className="flex items-center gap-1 text-xs font-semibold text-[#3b82f6] hover:text-white transition-colors">
                  All Trips <ChevronRight size={11} />
                </button>
              </div>

              {/* 3 Prominent Numbers with Stronger Typography Emphasis */}
              <div className="grid grid-cols-3 gap-4 my-2">
                {[
                  { label: 'Dispatched',  value: kpis.activeTrips,    color: '#4ff7d1', pct: dispatchedPct,  accentColor: '#4ff7d1' },
                  { label: 'Completed',   value: kpis.completedTrips, color: '#22c55e', pct: completedPct,   accentColor: '#8a8a85' },
                  { label: 'Pending',     value: kpis.pendingTrips,   color: '#f59e0b', pct: pendingPct,     accentColor: '#f59e0b' },
                ].map(s => (
                  <div key={s.label} className="flex flex-col">
                    <div className="text-4xl xl:text-5xl font-black text-white leading-none mb-1">{s.value}</div>
                    <div className="stat-label mt-1">{s.label}</div>
                    <div className="flex items-baseline gap-1 mt-1 leading-normal">
                      <AnimatedPct value={s.pct} color={s.accentColor} />
                      <span className="stat-caption">of total</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress segment indicator */}
            <div className="flex flex-col gap-2 mt-3">
              <div className="flex h-3 rounded-full overflow-hidden bg-[#0a0f14] border border-[#1e2d38]">
                {[
                  { value: kpis.activeTrips,    color: '#4ff7d1' },
                  { value: kpis.completedTrips, color: '#22c55e' },
                  { value: kpis.pendingTrips,   color: '#f59e0b' },
                ].map((s, i) => {
                  const pct = Math.round((s.value / kpis.totalTrips) * 100);
                  return pct > 0 ? (
                    <div key={i} className="h-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: s.color, opacity: 0.85 }} />
                  ) : null;
                })}
              </div>
              <div className="flex items-center gap-4 text-xs text-[#86898c]">
                {[
                  { label: 'Dispatched', color: '#4ff7d1' },
                  { label: 'Completed',  color: '#22c55e' },
                  { label: 'Pending',    color: '#f59e0b' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: l.color }} />
                    <span>{l.label}</span>
                  </div>
                ))}
                <span className="ml-auto font-mono text-[10px]">{kpis.totalTrips} total trips</span>
              </div>
            </div>
          </div>

          {/* Remaining 2 KPI tiles directly beneath Today's Progress Widget */}
          <div className="grid grid-cols-2 gap-3">
            {tiles.slice(4).map(t => (
              <div
                key={t.label}
                onClick={() => navigate(t.path)}
                className="group relative border border-[#1e2d38] rounded-xl p-4 bg-[#111820] flex flex-col gap-1.5 cursor-pointer transition-all duration-180 hover:-translate-y-0.5"
                onMouseEnter={e => e.currentTarget.style.borderColor = `${t.color}45`}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2d38'}
              >
                <div className="flex items-center justify-between">
                  <t.icon size={14} style={{ color: t.color }} />
                  <ChevronRight size={11} className="text-[#1e2d38] group-hover:text-[#86898c] transition-colors" />
                </div>
                <div className="text-3xl font-black text-white leading-none mt-1">{t.value}</div>
                <div className="text-xs font-bold text-[#c5cace] mt-1">{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Operations Brief AI Component ── */}
      <OperationsBrief />

      {/* ── 3. Bottom Grid Layout: Trips | Fleet Status | Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-2">

        {/* Recent Trips — 7 cols */}
        <div className="lg:col-span-7 border border-[#1e2d38] rounded-2xl bg-[#111820] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#1e2d38]">
            <div className="flex items-center gap-2.5">
              <Route size={16} className="text-[#3b82f6]" />
              <h3 className="font-bold text-lg text-white">Recent Trips</h3>
            </div>
            <button onClick={() => navigate('/trips')}
              className="flex items-center gap-1 text-xs font-semibold text-[#86898c] hover:text-white transition-colors">
              View all <ChevronRight size={12} />
            </button>
          </div>

          {/* Column Headers with Increased Text Size */}
          <div className="grid px-6 py-3 font-mono text-[10px] text-[#86898c] uppercase tracking-widest border-b border-[#1e2d38]"
            style={{ gridTemplateColumns: '0.9fr 1.1fr 0.9fr 0.85fr 0.65fr' }}>
            <span>Trip ID</span><span>Route</span><span>Vehicle</span><span>Status</span><span>ETA</span>
          </div>

          {/* Taller Row Spacing and Increased Text Size */}
          <div className="flex flex-col divide-y divide-[#1e2d38]/50">
            {recentTrips.length === 0 ? (
              <div className="py-12 text-center text-[#86898c] text-sm font-mono">No trips recorded yet.</div>
            ) : recentTrips.map((t, idx) => {
              const pill = statusPill(t.status);
              const eta  = t.status === 'Dispatched' ? '45 min' : t.status === 'Draft' ? 'Queued' : '—';
              return (
                <div key={t.id}
                  className="grid items-center px-6 py-4.5 text-sm transition-colors duration-150 hover:bg-[#162129]/50"
                  style={{ gridTemplateColumns: '0.9fr 1.1fr 0.9fr 0.85fr 0.65fr', animationDelay: `${idx * 40}ms` }}
                >
                  <span className="font-mono font-bold text-white text-sm">{t.id}</span>
                  <span className="text-[#c5cace] text-sm truncate pr-3">{t.source && t.destination ? `${t.source} → ${t.destination}` : '—'}</span>
                  <span className="font-mono text-[#c5cace] text-sm">{t.vehicle || '—'}</span>
                  <span className="inline-flex w-fit px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: pill.bg, color: pill.text, borderColor: pill.border }}>
                    {t.status}
                  </span>
                  <span className="font-mono text-[#86898c] text-sm">{eta}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fleet Status — 3 cols */}
        <div className="lg:col-span-3 border border-[#1e2d38] rounded-2xl bg-[#111820] flex flex-col overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4.5 border-b border-[#1e2d38]">
            <Truck size={16} className="text-[#22c55e]" />
            <h3 className="font-bold text-lg text-white">Fleet Status</h3>
          </div>
          <div className="flex flex-col gap-5 p-6">
            {donutSegments.map(bar => {
              const pct = Math.round((bar.value / kpis.totalVehicles) * 100);
              return (
                <div key={bar.label} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: bar.color }} />
                      <span className="text-sm font-medium text-[#c5cace]">{bar.label}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs text-[#86898c]">{pct}%</span>
                      <span className="font-mono text-sm font-bold text-white w-5 text-right">{bar.value}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-[#0a0f14] rounded-full border border-[#1e2d38] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: bar.color, opacity: 0.88 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Feed — 2 cols */}
        <div className="lg:col-span-2 border border-[#1e2d38] rounded-2xl bg-[#111820] flex flex-col overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4.5 border-b border-[#1e2d38]">
            <Activity size={16} className="text-[#a855f7]" />
            <h3 className="font-bold text-lg text-white">Activity</h3>
          </div>
          <div className="flex flex-col px-4 pt-4 pb-2">
            {activityFeed.length === 0 ? (
              <p className="text-sm text-[#86898c] text-center py-8">No recent activity.</p>
            ) : activityFeed.map((item, idx) => (
              <TimelineItem key={idx} {...item} last={idx === activityFeed.length - 1} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
