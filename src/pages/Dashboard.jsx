import React, { useState, useMemo } from 'react';
import { mockDb } from '../db/mockDb';

export default function Dashboard() {
  const [vehicleType, setVehicleType] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');

  // Load database entities
  const vehicles = useMemo(() => mockDb.getVehicles(), []);
  const trips = useMemo(() => mockDb.getTrips(), []);
  const drivers = useMemo(() => mockDb.getDrivers(), []);

  // Filter vehicles dynamically based on selections
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchType = vehicleType === 'All' || v.type === vehicleType;
      const matchStatus = statusFilter === 'All' || v.status === statusFilter;
      const matchRegion = regionFilter === 'All' || v.region === regionFilter;
      return matchType && matchStatus && matchRegion;
    });
  }, [vehicles, vehicleType, statusFilter, regionFilter]);

  // Compute KPI values
  const kpis = useMemo(() => {
    const activeCount = filteredVehicles.filter(v => v.status === 'On Trip').length;
    const availableCount = filteredVehicles.filter(v => v.status === 'Available').length;
    const inShopCount = filteredVehicles.filter(v => v.status === 'In Shop').length;
    const retiredCount = filteredVehicles.filter(v => v.status === 'Retired').length;

    // Filter trips that match the vehicle criteria
    const activeTripsCount = trips.filter(t => {
      if (statusFilter !== 'All' && statusFilter !== 'On Trip') return false;
      const vehObj = vehicles.find(v => v.registrationNumber === t.vehicle);
      if (!vehObj) return true;
      const matchType = vehicleType === 'All' || vehObj.type === vehicleType;
      const matchRegion = regionFilter === 'All' || vehObj.region === regionFilter;
      return matchType && matchRegion && t.status === 'Dispatched';
    }).length;

    const pendingTripsCount = trips.filter(t => t.status === 'Draft').length;
    const driversOnDuty = drivers.filter(d => d.status === 'Available' || d.status === 'On Trip').length;
    
    const totalVehicles = filteredVehicles.length;
    const utilizationPct = totalVehicles > 0 ? Math.round((activeCount / totalVehicles) * 100) : 0;

    return {
      activeCount,
      availableCount,
      inShopCount,
      retiredCount,
      activeTripsCount,
      pendingTripsCount,
      driversOnDuty,
      utilizationPct,
      totalVehicles: totalVehicles || 1
    };
  }, [filteredVehicles, trips, drivers, vehicles, vehicleType, statusFilter, regionFilter]);

  // Take latest 5 trips for display
  const recentTrips = useMemo(() => {
    return [...trips].reverse().slice(0, 5);
  }, [trips]);

  return (
    <div className="flex flex-col gap-6 select-none">
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-2xl font-bold text-dark-text">1. Dashboard</h2>
      </div>

      {/* Dashboard Filters */}
      <div className="flex gap-4 flex-wrap">
        {[
          { label: 'Vehicle Type', value: vehicleType, onChange: setVehicleType, options: ['All', 'Van', 'Truck', 'Mini'] },
          { label: 'Status', value: statusFilter, onChange: setStatusFilter, options: ['All', 'Available', 'On Trip', 'In Shop', 'Retired'] },
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
                        <td className="py-3 px-4 font-mono font-semibold">{t.id}</td>
                        <td className="py-3 px-4 font-mono">{t.vehicle || '—'}</td>
                        <td className="py-3 px-4">{t.driver || '—'}</td>
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
