import React, { useState, useEffect, useMemo } from 'react';
import api from '../config/api';
import Modal from '../components/Modal';

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('All');
  const [categoriesList, setCategoriesList] = useState([]);

  const fetchDrivers = async () => {
    try {
      const [drvRes, catRes] = await Promise.all([
        api.get('/drivers', { params: { limit: 100 } }),
        api.get('/license-categories', { params: { limit: 100 } })
      ]);
      if (drvRes.success) setDrivers(drvRes.data);
      if (catRes.success) setCategoriesList(catRes.data);
    } catch (err) {
      console.error('Failed to fetch drivers', err);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Modal forms states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingIdx, setEditingIdx] = useState(-1);

  const [name, setName] = useState('');
  const [licNo, setLicNo] = useState('');
  const [category, setCategory] = useState('');
  const [expiry, setExpiry] = useState('');
  const [contact, setContact] = useState('');
  const [safetyScore, setSafetyScore] = useState('');
  const [status, setStatus] = useState('Available');

  // Filter Drivers
  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      const matchSearch = d.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.license_number?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = activeStatusFilter === 'All' || d.status === activeStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [drivers, searchQuery, activeStatusFilter]);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingIdx(-1);
    setName('');
    setLicNo('');
    setCategory('');
    setExpiry('');
    setContact('');
    setSafetyScore('');
    setStatus('Available');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (d, idx) => {
    setIsEditing(true);
    setEditingIdx(d.id); // store ID instead of idx
    setName(d.full_name);
    setLicNo(d.license_number);
    const defaultCatName = categoriesList.length > 0 ? categoriesList[0].name : '';
    setCategory(d.license_category_name ? d.license_category_name : defaultCatName);
    setExpiry(d.license_expiry_date ? d.license_expiry_date.substring(0, 10) : '');
    setContact(d.phone);
    setSafetyScore(d.safety_score);
    setStatus(d.status);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      try {
        await api.delete(`/drivers/${id}`);
        fetchDrivers();
      } catch (err) {
        alert(err.message || 'Failed to delete driver');
      }
    }
  };

  const handleInlineStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/drivers/${id}`, { status: newStatus });
      fetchDrivers();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const parsedSafety = parseInt(safetyScore, 10);

    const payload = {
      full_name: name.trim(),
      license_number: licNo.trim().toUpperCase(),
      license_category_id: categoriesList.find(c => c.name === category)?.id || 1,
      license_expiry_date: expiry,
      phone: contact.trim(),
      safety_score: parsedSafety,
      status
    };

    try {
      if (!isEditing) {
        await api.post('/drivers', payload);
      } else {
        await api.put(`/drivers/${editingIdx}`, payload);
      }
      fetchDrivers();
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message || 'An error occurred.');
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none animate-page-fade">
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-2xl font-bold text-dark-text">3. Drivers & Safety Profiles</h2>
      </div>

      {/* Controls row */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-4 items-center flex-wrap">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-sm text-dark-text outline-none w-64 placeholder:text-dark-muted/50 transition-all-custom hover-glow"
            placeholder="Search driver name or license..."
          />

          {/* Quick status filter pills matching mockup */}
          <div className="flex bg-dark-card border border-dark-border rounded-full p-1">
            {['All', 'Available', 'On Trip', 'Off Duty', 'Suspended'].map((st) => {
              const isActive = activeStatusFilter === st;
              let activeColor = 'text-dark-text bg-[#162129] border border-[#283945]';
              if (isActive && st === 'Available') activeColor = 'text-[#4ff7d1] bg-[#0e342d] border border-[#4ff7d1]/20';
              if (isActive && st === 'On Trip') activeColor = 'text-[#c5cace] bg-[#162129] border border-[#283945]';
              if (isActive && st === 'Off Duty') activeColor = 'text-dark-muted bg-[#121b1f] border border-[#283945]';
              if (isActive && st === 'Suspended') activeColor = 'text-[#d946ef] bg-[#0d1318] border border-[#d946ef]/10';

              return (
                <button
                  key={st}
                  onClick={() => setActiveStatusFilter(st)}
                  className={`text-[11px] font-bold py-1.5 px-4 rounded-full cursor-pointer transition-all-custom ${
                    isActive ? activeColor : 'bg-transparent text-[#86898c] hover:text-[#ffffff]'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        <button 
          onClick={handleOpenAddModal}
          className="bg-[#4ff7d1] hover:bg-[#3ee0be] text-[#0d1318] border-none px-4 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-all-custom hover:scale-[1.02]"
        >
          + Add Driver
        </button>
      </div>

      {/* Drivers Profiles — Glassmorphic card rows */}
      <div className="flex flex-col gap-2.5">
        {/* Header row — must match data row grid exactly */}
        <div
          className="grid items-center px-5 pb-2.5 border-b border-dark-border font-mono text-[10px] text-[#86898c] uppercase font-bold tracking-widest"
          style={{ gridTemplateColumns: '1.3fr 1.2fr 0.55fr 0.65fr 1fr 0.55fr 0.85fr 1.1fr 160px', gap: '1rem' }}
        >
          <span>Driver</span>
          <span>License No.</span>
          <span>Cat.</span>
          <span>Expiry</span>
          <span>Contact</span>
          <span>Compl.</span>
          <span>Safety</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {filteredDrivers.length === 0 ? (
          <div className="py-12 text-center text-dark-muted text-xs">No drivers registered.</div>
        ) : (
          filteredDrivers.map((d, index) => {
            // Expiry Check
            const expDate = new Date(d.license_expiry_date);
            const isExpired = expDate < new Date();
            const formattedExpiry = isExpired
              ? <span className="text-[#d946ef] font-bold font-mono">{d.license_expiry_date.slice(5, 7)}/{d.license_expiry_date.slice(0, 4)} EXP</span>
              : `${d.license_expiry_date.slice(5, 7)}/${d.license_expiry_date.slice(0, 4)}`;

            // Contact Masking
            const maskedContact = d.phone && d.phone.length > 5
              ? `${d.phone.slice(0, 5)}xxxxx`
              : d.phone || '—';

            // Safety score color threshold
            let scoreColor = 'text-[#4ff7d1]';
            let barColor = 'bg-[#4ff7d1]';
            if (d.safety_score < 90) { scoreColor = 'text-[#a21caf]'; barColor = 'bg-[#a21caf]'; }
            if (d.safety_score < 80) { scoreColor = 'text-[#d946ef]'; barColor = 'bg-[#d946ef]'; }

            // Status-based border glow
            let glowBorder = 'border-dark-border hover:border-[#4ff7d1]/30';
            if (d.status === 'Available')  glowBorder = 'border-[#4ff7d1]/20 hover:border-[#4ff7d1]/60';
            if (d.status === 'Suspended')  glowBorder = 'border-[#d946ef]/20 hover:border-[#d946ef]/50';
            if (d.status === 'Off Duty')   glowBorder = 'border-[#283945] hover:border-[#283945]/80';

            return (
              <div
                key={index}
                className={`glass-table-row grid items-center px-5 py-4 rounded-xl border bg-[#121b1f]/80 backdrop-blur-sm transition-all duration-300 hover:bg-[#162129]/90 hover:shadow-[0_0_18px_rgba(79,247,209,0.06)] ${glowBorder}`}
                style={{ gridTemplateColumns: '1.3fr 1.2fr 0.55fr 0.65fr 1fr 0.55fr 0.85fr 1.1fr 160px', gap: '1rem', animationDelay: `${index * 40}ms` }}
              >
                <span className="font-semibold text-[#ffffff] text-xs">{d.full_name}</span>
                <span className="font-mono text-[#c5cace] text-xs">{d.license_number}</span>
                <span className="text-[#86898c] text-xs">{d.license_category_name}</span>
                <span className="text-[#c5cace] text-xs">{formattedExpiry}</span>
                <span className="text-[#c5cace] text-xs font-mono">{maskedContact}</span>
                <span className="text-[#c5cace] text-xs">96%</span>
                <div className="flex flex-col gap-1">
                  <span className={`font-mono font-bold text-xs ${scoreColor}`}>{d.safety_score}/100</span>
                  <div className="w-full h-1 rounded-full bg-[#283945] overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${d.safety_score}%` }} />
                  </div>
                </div>
                {/* Dynamic status selection dropdown */}
                <select
                  value={d.status}
                  onChange={(e) => handleInlineStatusChange(d.id, e.target.value)}
                  className="bg-[#121b1f] border border-[#283945] rounded-full px-3 py-1.5 text-[10px] text-[#ffffff] outline-none cursor-pointer transition-all duration-150 hover:border-[#4ff7d1]/40"
                >
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="Off Duty">Off Duty</option>
                  <option value="Suspended">Suspended</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(d, index)}
                    className="btn-edit bg-transparent border border-[#1e2d38] px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
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
        Console Rule: Expired license or Suspended status &rarr; blocked from trip assignment
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Driver Profile' : 'Add New Driver'}
      >
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Driver Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0B0F19] border border-dark-border rounded-xl px-4 py-2.5 outline-none focus:border-[#4ff7d1] focus:shadow-[0_0_0_2px_rgba(79,247,209,0.1)] transition-all duration-200 text-dark-text"
                placeholder="Alex"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">License Number</label>
              <input
                type="text"
                value={licNo}
                onChange={(e) => setLicNo(e.target.value)}
                className="w-full bg-[#0B0F19] border border-dark-border rounded-xl px-4 py-2.5 outline-none focus:border-[#4ff7d1] focus:shadow-[0_0_0_2px_rgba(79,247,209,0.1)] transition-all duration-200 text-dark-text"
                placeholder="DL-88213"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">License Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0B0F19] border border-dark-border rounded-xl px-4 py-2.5 outline-none focus:border-[#4ff7d1] focus:shadow-[0_0_0_2px_rgba(79,247,209,0.1)] transition-all duration-200 text-dark-text"
                placeholder="LMV"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">License Expiry</label>
              <input
                type="date"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full bg-[#0B0F19] border border-dark-border rounded-xl px-4 py-2.5 outline-none focus:border-[#4ff7d1] focus:shadow-[0_0_0_2px_rgba(79,247,209,0.1)] transition-all duration-200 text-dark-text"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Contact Number</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full bg-[#0B0F19] border border-dark-border rounded-xl px-4 py-2.5 outline-none focus:border-[#4ff7d1] focus:shadow-[0_0_0_2px_rgba(79,247,209,0.1)] transition-all duration-200 text-dark-text"
                placeholder="9876543210"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Safety Score (0-100)</label>
              <input
                type="number"
                value={safetyScore}
                onChange={(e) => setSafetyScore(e.target.value)}
                min="0"
                max="100"
                className="w-full bg-[#0B0F19] border border-dark-border rounded-xl px-4 py-2.5 outline-none focus:border-[#4ff7d1] focus:shadow-[0_0_0_2px_rgba(79,247,209,0.1)] transition-all duration-200 text-dark-text"
                placeholder="95"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Initial Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#0B0F19] border border-dark-border rounded-xl px-4 py-2.5 outline-none focus:border-[#4ff7d1] transition-all duration-200 text-dark-text cursor-pointer"
            >
              <option value="Available">Available</option>
              <option value="Off Duty">Off Duty</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-[#4ff7d1] hover:bg-[#3ee0be] text-[#0d1318] py-3 rounded-full font-bold text-sm text-center mt-2 cursor-pointer shadow-[0_4px_20px_rgba(79,247,209,0.3)] hover:shadow-[0_4px_28px_rgba(79,247,209,0.45)] transition-all duration-200 hover:scale-[1.01]"
          >
            {isEditing ? 'Save Changes' : 'Register Driver'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
