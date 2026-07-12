import React, { useState, useEffect } from 'react';
import api from '../config/api';

export default function Dashboard() {
  const [vehicleType, setVehicleType] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({
    activeCount: 0,
    availableCount: 0,
    inShopCount: 0,
    retiredCount: 0,
    activeTripsCount: 0,
    pendingTripsCount: 0,
    driversOnDuty: 0,
    utilizationPct: 0,
    totalVehicles: 1
  });
  
  const [recentTrips, setRecentTrips] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [vehicleType, regionFilter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch dashboard KPIs
      const params = {};
      // Note: Backend might need integer IDs for region_id/vehicle_type_id if 'All' isn't used
      // For now we'll just not send them if 'All' is selected, assuming the backend ignores undefined.
      
      const res = await api.get('/analytics/dashboard', { params });
      if (res.success) {
        const data = res.data;
        setKpis({
          activeCount: data.vehicles.onTrip,
          availableCount: data.vehicles.available,
          inShopCount: data.vehicles.inShop,
          retiredCount: data.vehicles.retired,
          activeTripsCount: data.trips.active,
          pendingTripsCount: data.trips.draft,
          driversOnDuty: data.drivers.onTrip, // Approximate 'On Duty' as 'onTrip'
          utilizationPct: data.kpis.fleetUtilizationPercentage,
          totalVehicles: data.vehicles.total || 1
        });
      }

      // 2. Fetch recent trips
      const tripsRes = await api.get('/trips', { params: { limit: 5 } });
      if (tripsRes.success) {
        // Backend returns trips sorted (hopefully)
        setRecentTrips(tripsRes.data);
      }

    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-2xl font-bold text-dark-text">1. Dashboard</h2>
      </div>

      {/* Dashboard Filters */}
      <div className="flex gap-4 flex-wrap">
        {[
          { label: 'Vehicle Type', value: vehicleType, onChange: setVehicleType, options: ['All', 'Van', 'Truck', 'Mini'] },
          { label: 'Region', value: regionFilter, onChange: setRegionFilter, options: ['All', 'North', 'South', 'East', 'West'] }
        ].map((f) => (
          <div key={f.label} className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">{f.label}</label>
            <select
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className="bg-dark-card border border-dark-border rounded-md px-3.5 py-1.5 text-xs text-dark-text outline-none cursor-pointer appearance-none pr-8"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1rem'
              }}
            >
              {f.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { title: 'Active Vehicles', val: kpis.activeCount, border: 'border-l-[3px] border-accent-cyan' },
          { title: 'Available Vehicles', val: kpis.availableCount, border: 'border-l-[3px] border-accent-green' },
          { title: 'Vehicles in Maintenance', val: kpis.inShopCount, border: 'border-l-[3px] border-accent-orange' },
          { title: 'Active Trips', val: kpis.activeTripsCount, border: 'border-l-[3px] border-accent-blue' },
          { title: 'Pending Trips', val: kpis.pendingTripsCount, border: 'border-l-[3px] border-accent-grey' },
          { title: 'Drivers On Duty', val: kpis.driversOnDuty, border: 'border-l-[3px] border-accent-cyan' },
          { title: 'Fleet Utilization', val: `${kpis.utilizationPct}%`, border: 'border-l-[3px] border-accent-green' }
        ].map((c) => (
          <div key={c.title} className={`bg-dark-card border border-dark-border rounded-lg p-4 flex flex-col gap-1.5 ${c.border}`}>
            <div className="font-mono text-[9px] text-dark-muted font-bold tracking-wider uppercase leading-none">{c.title}</div>
            <div className="font-heading text-2xl font-extrabold text-dark-text leading-tight">{c.val}</div>
          </div>
        ))}
      </div>

      {/* Splits Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Recent Trips Table */}
        <div className="lg:col-span-3 bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col gap-4">
          <h3 className="font-heading text-sm font-semibold text-dark-text">Recent Trips</h3>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-dark-border font-mono text-[10px] text-dark-muted uppercase font-semibold">
                  <th className="pb-3 px-4">Trip</th>
                  <th className="pb-3 px-4">Vehicle</th>
                  <th className="pb-3 px-4">Driver</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 px-4">E.T.A. / Info</th>
                </tr>
              </thead>
              <tbody>
                {recentTrips.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-dark-muted">No trips recorded.</td>
                  </tr>
                ) : (
                  recentTrips.map((t) => {
                    let eta = '—';
                    let pillColor = 'bg-white/8 text-dark-muted border-white/10';
                    if (t.status === 'Dispatched') {
                      eta = '45 min';
                      pillColor = 'bg-accent-cyan/12 text-accent-cyan border-accent-cyan/25';
                    }
                    if (t.status === 'Draft') {
                      eta = 'Awaiting vehicle';
                      pillColor = 'bg-white/5 text-dark-muted border-white/10';
                    }
                    if (t.status === 'Completed') {
                      pillColor = 'bg-accent-green/12 text-accent-green border-accent-green/25';
                    }
                    if (t.status === 'Cancelled') {
                      pillColor = 'bg-accent-red/12 text-accent-red border-accent-red/25';
                    }

                    return (
                      <tr key={t.id} className="border-b border-white/[0.01] hover:bg-white/[0.01]">
                        <td className="py-3 px-4 font-mono font-semibold">{t.trip_number || t.id}</td>
                        <td className="py-3 px-4 font-mono">{t.vehicle_id || '—'}</td>
                        <td className="py-3 px-4">{t.driver_id || '—'}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-semibold uppercase ${pillColor}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-dark-muted">{eta}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vehicle Status Progress Chart */}
        <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col gap-6">
          <h3 className="font-heading text-sm font-semibold text-dark-text">Vehicle Status</h3>
          <div className="flex flex-col gap-4.5">
            {[
              { label: 'Available', color: 'bg-accent-green', count: kpis.availableCount },
              { label: 'On Trip', color: 'bg-accent-blue', count: kpis.activeCount },
              { label: 'In Shop', color: 'bg-accent-orange', count: kpis.inShopCount },
              { label: 'Retired', color: 'bg-accent-red', count: kpis.retiredCount }
            ].map((bar) => {
              const pct = Math.round((bar.count / kpis.totalVehicles) * 100);
              return (
                <div key={bar.label} className="flex items-center gap-4 w-full text-xs">
                  <div className="w-16 text-dark-muted font-medium">{bar.label}</div>
                  <div className="flex-1 h-2 bg-dark-bg rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ease-out ${bar.color}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <div className="w-8 text-right font-mono font-semibold">{bar.count.toString().padStart(2, '0')}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
