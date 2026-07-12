import React, { useState, useMemo } from 'react';
import { mockDb } from '../db/mockDb';
import Modal from '../components/Modal';

export default function Fleet() {
  const [vehicles, setVehicles] = useState(() => mockDb.getVehicles());
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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
      const matchType = typeFilter === 'All' || v.type === typeFilter;
      const matchStatus = statusFilter === 'All' || v.status === statusFilter;
      const matchSearch = v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.name.toLowerCase().includes(searchQuery.toLowerCase());
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
    setEditingReg(veh.registrationNumber);
    setRegNo(veh.registrationNumber);
    setName(veh.name);
    setType(veh.type);
    setCapacity(veh.maxCapacity);
    setOdometer(veh.odometer);
    setCost(veh.acquisitionCost);
    setStatus(veh.status);
    setRegError('');
    setIsModalOpen(true);
  };

  const handleDelete = (reg) => {
    if (window.confirm(`Are you sure you want to remove vehicle ${reg}?`)) {
      const updated = vehicles.filter(v => v.registrationNumber !== reg);
      mockDb.saveVehicles(updated);
      setVehicles(updated);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setRegError('');

    const formattedReg = regNo.trim().toUpperCase();
    const parsedCapacity = parseInt(capacity, 10);
    const parsedOdo = parseInt(odometer, 10);
    const parsedCost = parseInt(cost, 10);

    if (!isEditing) {
      // Unique check
      if (vehicles.some(v => v.registrationNumber === formattedReg)) {
        setRegError('Registration number already exists.');
        return;
      }

      const newVeh = {
        registrationNumber: formattedReg,
        name: name.trim(),
        type,
        maxCapacity: parsedCapacity,
        odometer: parsedOdo,
        acquisitionCost: parsedCost,
        status,
        region: ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)]
      };

      const updated = [...vehicles, newVeh];
      mockDb.saveVehicles(updated);
      setVehicles(updated);
    } else {
      const updated = vehicles.map(v => {
        if (v.registrationNumber === editingReg) {
          return {
            ...v,
            name: name.trim(),
            type,
            maxCapacity: parsedCapacity,
            odometer: parsedOdo,
            acquisitionCost: parsedCost,
            status
          };
        }
        return v;
      });
      mockDb.saveVehicles(updated);
      setVehicles(updated);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-2xl font-bold text-dark-text">2. Vehicle Registry</h2>
      </div>

      {/* Controls row */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-3 items-center flex-wrap">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-md px-3.5 py-1.5 text-xs text-dark-text outline-none cursor-pointer appearance-none pr-8"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1rem'
            }}
          >
            <option value="All">Type: All</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Mini">Mini</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-md px-3.5 py-1.5 text-xs text-dark-text outline-none cursor-pointer appearance-none pr-8"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1rem'
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
            className="bg-dark-card border border-dark-border rounded-md px-4 py-1.5 text-xs text-dark-text outline-none w-52 placeholder:text-dark-muted/50"
            placeholder="Search reg. no..."
          />
        </div>

        <button 
          onClick={handleOpenAddModal}
          className="bg-brand hover:bg-brand-hover text-dark-text border-none px-4 py-2 rounded-md text-xs font-semibold cursor-pointer shadow-[0_4px_12px_rgba(178,94,19,0.35)] transition-all duration-200 hover:-translate-y-[1px]"
        >
          + Add Vehicle
        </button>
      </div>

      {/* Vehicles Registry Table */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-dark-border font-mono text-[10px] text-dark-muted uppercase font-semibold">
              <th className="pb-3 px-4">Reg. No. (Unique)</th>
              <th className="pb-3 px-4">Name/Model</th>
              <th className="pb-3 px-4">Type</th>
              <th className="pb-3 px-4">Capacity</th>
              <th className="pb-3 px-4">Odometer</th>
              <th className="pb-3 px-4">Acq. Cost</th>
              <th className="pb-3 px-4">Status</th>
              <th className="pb-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-4 text-center text-dark-muted">No vehicles registered.</td>
              </tr>
            ) : (
              filteredVehicles.map((v) => {
                let pillColor = 'bg-[#162129] text-[#9ea1a3] border-[#283945]';
                if (v.status === 'Available') pillColor = 'bg-[#0e342d] text-[#4ff7d1] border-[#4ff7d1]/20';
                if (v.status === 'On Trip') pillColor = 'bg-[#162129] text-[#c5cace] border-[#283945]';
                if (v.status === 'In Shop') pillColor = 'bg-[#0d1318] text-[#a21caf] border-[#a21caf]/20';
                if (v.status === 'Retired') pillColor = 'bg-[#0d1318] text-[#d946ef] border-[#d946ef]/20';

                return (
                  <tr key={v.registrationNumber} className="border-b border-white/[0.01]">
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#ffffff]">{v.registrationNumber}</td>
                    <td className="py-3.5 px-4 text-[#c5cace]">{v.name}</td>
                    <td className="py-3.5 px-4 text-[#c5cace]">{v.type}</td>
                    <td className="py-3.5 px-4 text-[#c5cace]">{v.maxCapacity} kg</td>
                    <td className="py-3.5 px-4 font-mono text-[#c5cace]">{v.odometer.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-mono text-[#c5cace]">${v.acquisitionCost.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${pillColor}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 flex gap-2">
                      <button 
                        onClick={() => handleOpenEditModal(v)}
                        className="bg-transparent border border-dark-border hover:border-brand hover:text-brand px-3 py-1 rounded-full text-[9px] cursor-pointer transition-all duration-150"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(v.registrationNumber)}
                        className="bg-transparent border border-dark-border hover:border-accent-red hover:text-accent-red px-3 py-1 rounded-full text-[9px] cursor-pointer transition-all duration-150"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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
              className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand disabled:opacity-50 text-dark-text"
              placeholder="GJ01AB4512"
              required
            />
            {regError && <span className="text-[10px] text-accent-red mt-1">{regError}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Vehicle Name/Model</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text"
              placeholder="VAN-05"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text cursor-pointer"
            >
              <option value="Van">Van</option>
              <option value="Truck">Truck</option>
              <option value="Mini">Mini</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Maximum Load Capacity (KG)</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text"
              placeholder="500"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Current Odometer (KM)</label>
            <input
              type="number"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text"
              placeholder="74000"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Acquisition Cost ($)</label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text"
              placeholder="620000"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text cursor-pointer"
            >
              <option value="Available">Available</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full bg-brand hover:bg-[#924C0D] text-dark-text py-3 rounded-md font-semibold text-center mt-3 cursor-pointer shadow-[0_4px_12px_rgba(178,94,19,0.35)] transition-all duration-150"
          >
            {isEditing ? 'Save Changes' : 'Register Vehicle'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
