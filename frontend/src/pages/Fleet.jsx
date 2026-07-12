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
            {vehicleTypesList.map(vt => (
              <option key={vt.id} value={vt.name}>{vt.name}</option>
            ))}
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
                let pillColor = 'bg-white/8 text-dark-muted border-white/10';
                if (v.status === 'Available') pillColor = 'bg-accent-green/12 text-accent-green border-accent-green/25';
                if (v.status === 'On Trip') pillColor = 'bg-accent-blue/12 text-accent-blue border-accent-blue/25';
                if (v.status === 'In Shop') pillColor = 'bg-accent-orange/12 text-accent-orange border-accent-orange/25';
                if (v.status === 'Retired') pillColor = 'bg-accent-red/12 text-accent-red border-accent-red/25';

                return (
                  <tr key={v.id} className="border-b border-white/[0.01] hover:bg-white/[0.01]">
                    <td className="py-3.5 px-4 font-mono font-semibold">{v.registration_number}</td>
                    <td className="py-3.5 px-4">{v.name}</td>
                    <td className="py-3.5 px-4">{v.vehicle_type ? v.vehicle_type.name : 'Unknown'}</td>
                    <td className="py-3.5 px-4">{v.max_capacity} kg</td>
                    <td className="py-3.5 px-4 font-mono">{Number(v.odometer).toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-mono">${Number(v.acquisition_cost).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-semibold uppercase ${pillColor}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 flex gap-2">
                      <button 
                        onClick={() => handleOpenEditModal(v)}
                        className="bg-transparent border border-dark-border hover:border-brand hover:text-brand px-2.5 py-1 rounded text-[10px] cursor-pointer transition-all duration-150"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(v.id, v.registration_number)}
                        className="bg-transparent border border-dark-border hover:border-accent-red hover:text-accent-red px-2.5 py-1 rounded text-[10px] cursor-pointer transition-all duration-150"
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

      <div className="font-heading text-xs text-accent-orange font-medium mt-1 opacity-90 leading-none select-none">
        Rule: Registration No. must be unique &middot; Retired/In Shop vehicles are hidden from Trip Dispatcher
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
              {vehicleTypesList.map(vt => (
                <option key={vt.id} value={vt.name}>{vt.name}</option>
              ))}
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
