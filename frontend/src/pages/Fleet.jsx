import React, { useState, useEffect, useMemo } from 'react';
import api from '../config/api';
import Modal from '../components/Modal';

export default function Fleet() {
  const [vehicles, setVehicles] = useState([]);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleTypesList, setVehicleTypesList] = useState([]);

  const fetchVehicles = async () => {
    try {
      const [vehRes, typeRes] = await Promise.all([
        api.get('/vehicles', { params: { limit: 100 } }),
        api.get('/vehicle-types', { params: { limit: 100 } })
      ]);
      if (vehRes.success) setVehicles(vehRes.data);
      if (typeRes.success) setVehicleTypesList(typeRes.data);
    } catch (err) {
      console.error('Failed to fetch vehicles', err);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Modal forms states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingReg, setEditingReg] = useState('');
  
  const [regNo, setRegNo] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('Van');
  const [capacity, setCapacity] = useState('');
  const [odometer, setOdometer] = useState('');
  const [cost, setCost] = useState('');
  const [status, setStatus] = useState('Available');
  const [regError, setRegError] = useState('');

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      // Backend returns vehicle_type object occasionally or string, assume name for now
      const vType = v.vehicle_type ? v.vehicle_type.name : v.type;
      const matchType = typeFilter === 'All' || vType === typeFilter;
      const matchStatus = statusFilter === 'All' || v.status === statusFilter;
      const matchSearch = v.registration_number?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchStatus && matchSearch;
    });
  }, [vehicles, typeFilter, statusFilter, searchQuery]);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingReg('');
    setRegNo('');
    setName('');
    setType('Van');
    setCapacity('');
    setOdometer('');
    setCost('');
    setStatus('Available');
    setRegError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (veh) => {
    setIsEditing(true);
    setEditingReg(veh.id); // store ID instead of registration_number for editing
    setRegNo(veh.registration_number);
    setName(veh.name);
    // Try to safely handle if backend sends an object or just ID. If object, use name. If missing, default.
    const defaultTypeName = vehicleTypesList.length > 0 ? vehicleTypesList[0].name : '';
    setType(veh.vehicle_type ? veh.vehicle_type.name : defaultTypeName);
    setCapacity(veh.max_capacity);
    setOdometer(veh.odometer);
    setCost(veh.acquisition_cost);
    setStatus(veh.status);
    setRegError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id, reg) => {
    if (window.confirm(`Are you sure you want to remove vehicle ${reg}?`)) {
      try {
        await api.delete(`/vehicles/${id}`);
        fetchVehicles();
      } catch (err) {
        alert(err.message || 'Failed to delete vehicle');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setRegError('');

    const formattedReg = regNo.trim().toUpperCase();
    const parsedCapacity = parseInt(capacity, 10);
    const parsedOdo = parseInt(odometer, 10);
    const parsedCost = parseInt(cost, 10);

    const payload = {
      registration_number: formattedReg,
      name: name.trim(),
      vehicle_type_id: vehicleTypesList.find(vt => vt.name === type)?.id || 1,
      max_capacity: parsedCapacity,
      odometer: parsedOdo,
      acquisition_cost: parsedCost,
      status,
      region_id: 1 // Defaulting to region 1 for now
    };

    try {
      if (!isEditing) {
        await api.post('/vehicles', payload);
      } else {
        await api.put(`/vehicles/${editingReg}`, payload);
      }
      fetchVehicles();
      setIsModalOpen(false);
    } catch (err) {
      if (err.message && err.message.includes('unique constraint')) {
        setRegError('Registration number already exists.');
      } else {
        setRegError(err.message || 'An error occurred.');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none animate-page-fade">
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-2xl font-bold text-dark-text">2. Vehicle Registry</h2>
      </div>

      {/* Controls row */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-3 items-center flex-wrap">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-sm text-dark-text outline-none cursor-pointer appearance-none pr-10 transition-all-custom hover-glow"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.85rem center',
              backgroundSize: '1.1rem'
            }}
          >
            <option value="All">Type: All</option>
            {vehicleTypesList.map(vt => (
              <option key={vt.id} value={vt.name}>{vt.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-sm text-dark-text outline-none cursor-pointer appearance-none pr-10 transition-all-custom hover-glow"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.85rem center',
              backgroundSize: '1.1rem'
            }}
          >
            <option value="All">Status: All</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-sm text-dark-text outline-none w-56 placeholder:text-dark-muted/50 transition-all-custom hover-glow"
            placeholder="Search reg. no..."
          />
        </div>

        <button 
          onClick={handleOpenAddModal}
          className="bg-[#4ff7d1] hover:bg-[#3ee0be] text-[#0d1318] border-none px-4 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-all-custom hover:scale-[1.02]"
        >
          + Add Vehicle
        </button>
      </div>

      {/* Vehicles Registry — Glassmorphic card rows */}
      <div className="flex flex-col gap-2.5">
        {/* Header row — must match data row grid exactly */}
        <div
          className="grid items-center px-5 pb-2.5 border-b border-dark-border font-mono text-[10px] text-[#86898c] uppercase font-bold tracking-widest"
          style={{ gridTemplateColumns: '1.5fr 1.4fr 0.65fr 0.75fr 1fr 1fr 1fr 160px', gap: '1rem' }}
        >
          <span>Reg. No.</span>
          <span>Name / Model</span>
          <span>Type</span>
          <span>Capacity</span>
          <span>Odometer</span>
          <span>Acq. Cost</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="py-12 text-center text-dark-muted text-xs">No vehicles registered.</div>
        ) : (
          filteredVehicles.map((v, idx) => {
            let pillColor = 'bg-[#162129] text-[#9ea1a3] border-[#283945]';
            let glowBorder = 'border-dark-border hover:border-[#4ff7d1]/30';
            if (v.status === 'Available') { pillColor = 'bg-[#0e342d] text-[#4ff7d1] border-[#4ff7d1]/20'; glowBorder = 'border-[#4ff7d1]/20 hover:border-[#4ff7d1]/60'; }
            if (v.status === 'On Trip')   { pillColor = 'bg-[#162129] text-[#c5cace] border-[#283945]'; }
            if (v.status === 'In Shop')   { pillColor = 'bg-[#1a0d1a] text-[#a21caf] border-[#a21caf]/20'; glowBorder = 'border-[#a21caf]/20 hover:border-[#a21caf]/50'; }
            if (v.status === 'Retired')   { pillColor = 'bg-[#0d1318] text-[#d946ef] border-[#d946ef]/20'; glowBorder = 'border-[#d946ef]/20 hover:border-[#d946ef]/50'; }

            return (
              <div
                key={v.id || v.registration_number}
                className={`glass-table-row grid items-center px-5 py-4 rounded-xl border bg-[#121b1f]/80 backdrop-blur-sm transition-all duration-300 hover:bg-[#162129]/90 hover:shadow-[0_0_18px_rgba(79,247,209,0.06)] ${glowBorder}`}
                style={{ gridTemplateColumns: '1.5fr 1.4fr 0.65fr 0.75fr 1fr 1fr 1fr 160px', gap: '1rem', animationDelay: `${idx * 40}ms` }}
              >
                <span className="font-mono font-bold text-[#ffffff] text-xs tracking-wide">{v.registration_number}</span>
                <span className="text-[#c5cace] text-xs">{v.name}</span>
                <span className="text-[#86898c] text-xs">{v.vehicle_type ? v.vehicle_type.name : v.type}</span>
                <span className="text-[#c5cace] text-xs">{v.max_capacity} kg</span>
                <span className="font-mono text-[#c5cace] text-xs">{v.odometer.toLocaleString()} km</span>
                <span className="font-mono text-[#c5cace] text-xs">&#8377;{v.acquisition_cost.toLocaleString('en-IN')}</span>
                <span className={`inline-flex w-fit px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${pillColor}`}>
                  {v.status}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(v)}
                    className="btn-edit bg-transparent border border-[#1e2d38] px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(v.id, v.registration_number)}
                    className="btn-delete bg-transparent border border-[#1e2d38] px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="font-mono text-[9px] text-[#86898c] mt-2 select-none uppercase tracking-wider">
        Console Rule: Registration No. must be unique &middot; Retired/In Shop vehicles are hidden from Trip Dispatcher
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
      >
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Registration Number (Unique)</label>
            <input
              type="text"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              disabled={isEditing}
              className={`w-full bg-[#0B0F19] border rounded-xl px-4 py-2.5 outline-none transition-all duration-200 disabled:opacity-50 text-dark-text ${regError ? 'border-[#ef4444] focus:border-[#ef4444] shadow-[0_0_0_2px_rgba(239,68,68,0.15)]' : 'border-dark-border focus:border-[#4ff7d1] focus:shadow-[0_0_0_2px_rgba(79,247,209,0.1)]'}`}
              placeholder="GJ01AB4512"
              required
            />
            {regError && <span className="text-[10px] text-[#ef4444] mt-0.5 font-mono">{regError}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Vehicle Name/Model</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0B0F19] border border-dark-border rounded-xl px-4 py-2.5 outline-none focus:border-[#4ff7d1] focus:shadow-[0_0_0_2px_rgba(79,247,209,0.1)] transition-all duration-200 text-dark-text"
              placeholder="VAN-05"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#0B0F19] border border-dark-border rounded-xl px-4 py-2.5 outline-none focus:border-[#4ff7d1] transition-all duration-200 text-dark-text cursor-pointer"
              >
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
                <option value="Mini">Mini</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#0B0F19] border border-dark-border rounded-xl px-4 py-2.5 outline-none focus:border-[#4ff7d1] transition-all duration-200 text-dark-text cursor-pointer"
              >
                <option value="Available">Available</option>
                <option value="In Shop">In Shop</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Max Capacity (KG)</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full bg-[#0B0F19] border border-dark-border rounded-xl px-4 py-2.5 outline-none focus:border-[#4ff7d1] focus:shadow-[0_0_0_2px_rgba(79,247,209,0.1)] transition-all duration-200 text-dark-text"
                placeholder="500"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Odometer (KM)</label>
              <input
                type="number"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                className="w-full bg-[#0B0F19] border border-dark-border rounded-xl px-4 py-2.5 outline-none focus:border-[#4ff7d1] focus:shadow-[0_0_0_2px_rgba(79,247,209,0.1)] transition-all duration-200 text-dark-text"
                placeholder="74000"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Acquisition Cost ($)</label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full bg-[#0B0F19] border border-dark-border rounded-xl px-4 py-2.5 outline-none focus:border-[#4ff7d1] focus:shadow-[0_0_0_2px_rgba(79,247,209,0.1)] transition-all duration-200 text-dark-text"
              placeholder="620000"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#4ff7d1] hover:bg-[#3ee0be] text-[#0d1318] py-3 rounded-full font-bold text-sm text-center mt-2 cursor-pointer shadow-[0_4px_20px_rgba(79,247,209,0.3)] hover:shadow-[0_4px_28px_rgba(79,247,209,0.45)] transition-all duration-200 hover:scale-[1.01]"
          >
            {isEditing ? 'Save Changes' : 'Register Vehicle'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
