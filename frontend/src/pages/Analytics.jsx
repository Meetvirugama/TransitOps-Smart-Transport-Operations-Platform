import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { TrendingUp, Fuel, Route, DollarSign, Download } from 'lucide-react';

function fmt(n) { return (n ?? 0).toLocaleString('en-IN'); }
function fmtDec(n) { return Number(n ?? 0).toFixed(1); }

export default function Analytics() {
  const [summary, setSummary]   = useState(null);
  const [topVeh, setTopVeh]     = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/dashboard'),
      api.get('/analytics/insights'),
      api.get('/analytics/expiring-licenses', { params: { days: 30 } }),
    ]).then(([sum, top, exp]) => {
      if (sum.success) setSummary(sum.data);
      if (top.success) setTopVeh(top.data?.topVehicles || []);
      if (exp.success) setExpiring(exp.data?.expiringSoon || []);
    }).catch(err => console.error('Analytics fetch error', err))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (type) => {
    try {
      const res = await api.get(`/reports/export/${type}`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export failed — try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-[#86898c] text-sm animate-pulse">
        Loading analytics…
      </div>
    );
  }

  const kpiCards = [
    { label: 'Total Trips',        value: fmt(summary?.trips?.total),        icon: Route,       color: '#3b82f6' },
    { label: 'Total Distance (km)',value: fmt(summary?.financials?.distance),   icon: TrendingUp,  color: '#4ff7d1' },
    { label: 'Total Fuel (L)',     value: fmtDec(summary?.financials?.fuelLiters),icon: Fuel,        color: '#eab308' },
    { label: 'Total Revenue (₹)', value: '₹'+fmt(summary?.financials?.revenue),  icon: DollarSign,  color: '#22c55e' },
    { label: 'Avg Fuel Efficiency',value: fmtDec(summary?.kpis?.avgFuelEfficiency)+' km/L', icon: Fuel, color: '#a855f7' },
  ];

  return (
    <div className="flex flex-col gap-6 animate-page-fade">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Analytics</h1>
          <p className="text-sm text-[#86898c] mt-1">Fleet performance, ROI, and operational insights</p>
        </div>
        <div className="flex gap-2">
          {['trips','vehicles','fuel-logs'].map(t => (
            <button
              key={t}
              onClick={() => handleExport(t)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#111820] border border-[#1e2d38] hover:border-[#4ff7d1]/40 rounded-lg text-xs text-[#c5cace] hover:text-white transition-all"
            >
              <Download size={12} />
              {t.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiCards.map(k => (
          <div key={k.label} className="bg-[#111820] border border-[#1e2d38] rounded-xl p-4 flex flex-col gap-2 hover:border-[#283945] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#86898c] font-mono uppercase tracking-wider">{k.label}</span>
              <k.icon size={14} style={{ color: k.color }} />
            </div>
            <span className="text-2xl font-extrabold text-white">{k.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Performers */}
        <div className="bg-[#111820] border border-[#1e2d38] rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider font-mono">Top Performing Vehicles</h3>
          {topVeh.length === 0 ? (
            <p className="text-[#86898c] text-sm text-center py-6">No data yet</p>
          ) : (
            <div className="flex flex-col divide-y divide-[#1e2d38]">
              {topVeh.map((v, i) => (
                <div key={v.id || i} className="flex justify-between items-center py-3">
                  <div>
                    <span className="text-sm font-semibold text-white">{v.registration_number || v.vehicle}</span>
                    <p className="text-xs text-[#86898c]">{v.vehicle_type || ''}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#4ff7d1]">{fmt(v.total_trips)} trips</span>
                    <p className="text-xs text-[#86898c]">{fmtDec(v.total_distance_km || 0)} km</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiring Licenses */}
        <div className="bg-[#111820] border border-[#1e2d38] rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider font-mono">
            <span className="text-[#f59e0b]">⚠</span> Expiring Licenses (30 days)
          </h3>
          {expiring.length === 0 ? (
            <p className="text-[#22c55e] text-sm text-center py-6">✓ All licenses are valid</p>
          ) : (
            <div className="flex flex-col divide-y divide-[#1e2d38]">
              {expiring.map((d, i) => (
                <div key={d.id || i} className="flex justify-between items-center py-3">
                  <div>
                    <span className="text-sm font-semibold text-white">{d.name || d.driver_name}</span>
                    <p className="text-xs text-[#86898c]">{d.license_number}</p>
                  </div>
                  <span className="text-xs font-bold text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-2 py-1 rounded">
                    Expires {d.license_expiry ? new Date(d.license_expiry).toLocaleDateString('en-IN') : 'soon'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
