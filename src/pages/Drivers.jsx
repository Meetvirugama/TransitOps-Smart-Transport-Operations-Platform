import React, { useState, useMemo } from 'react';
import { mockDb } from '../db/mockDb';
import Modal from '../components/Modal';

export default function Drivers() {
  const [drivers, setDrivers] = useState(() => mockDb.getDrivers());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('All');

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
      const matchSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());
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
    setEditingIdx(idx);
    setName(d.name);
    setLicNo(d.licenseNumber);
    setCategory(d.licenseCategory);
    setExpiry(d.licenseExpiryDate);
    setContact(d.contactNumber);
    setSafetyScore(d.safetyScore);
    setStatus(d.status);
    setIsModalOpen(true);
  };

  const handleDelete = (idx) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      const updated = [...drivers];
      updated.splice(idx, 1);
      mockDb.saveDrivers(updated);
      setDrivers(updated);
    }
  };

  const handleInlineStatusChange = (idx, newStatus) => {
    const updated = [...drivers];
    updated[idx].status = newStatus;
    mockDb.saveDrivers(updated);
    setDrivers(updated);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const parsedSafety = parseInt(safetyScore, 10);

    if (!isEditing) {
      const newDriver = {
        name: name.trim(),
        licenseNumber: licNo.trim().toUpperCase(),
        licenseCategory: category.trim(),
        licenseExpiryDate: expiry,
        contactNumber: contact.trim(),
        safetyScore: parsedSafety,
        status
      };
      const updated = [...drivers, newDriver];
      mockDb.saveDrivers(updated);
      setDrivers(updated);
    } else {
      const updated = drivers.map((d, index) => {
        if (index === editingIdx) {
          return {
            ...d,
            name: name.trim(),
            licenseNumber: licNo.trim().toUpperCase(),
            licenseCategory: category.trim(),
            licenseExpiryDate: expiry,
            contactNumber: contact.trim(),
            safetyScore: parsedSafety,
            status
          };
        }
        return d;
      });
      mockDb.saveDrivers(updated);
      setDrivers(updated);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 select-none">
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
            className="bg-dark-card border border-dark-border rounded-md px-4 py-1.5 text-xs text-dark-text outline-none w-56 placeholder:text-dark-muted/50"
            placeholder="Search driver name or license..."
          />

          {/* Quick status filter pills matching mockup */}
          <div className="flex bg-dark-card border border-dark-border rounded-md p-1">
            {['All', 'Available', 'On Trip', 'Off Duty', 'Suspended'].map((st) => {
              const isActive = activeStatusFilter === st;
              let activeColor = 'text-dark-text bg-dark-bg shadow-md';
              if (isActive && st === 'Available') activeColor = 'text-accent-green bg-dark-bg shadow-md';
              if (isActive && st === 'On Trip') activeColor = 'text-accent-blue bg-dark-bg shadow-md';
              if (isActive && st === 'Off Duty') activeColor = 'text-dark-muted bg-dark-bg shadow-md';
              if (isActive && st === 'Suspended') activeColor = 'text-accent-orange bg-dark-bg shadow-md';

              return (
                <button
                  key={st}
                  onClick={() => setActiveStatusFilter(st)}
                  className={`text-[10px] font-semibold py-1 px-3.5 rounded cursor-pointer transition-all duration-150 ${
                    isActive ? activeColor : 'bg-transparent text-dark-muted hover:text-dark-text'
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
          className="bg-brand hover:bg-brand-hover text-dark-text border-none px-4 py-2 rounded-md text-xs font-semibold cursor-pointer shadow-[0_4px_12px_rgba(178,94,19,0.35)] transition-all duration-200 hover:-translate-y-[1px]"
        >
          + Add Driver
        </button>
      </div>

      {/* Drivers Profiles Table */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-dark-border font-mono text-[10px] text-dark-muted uppercase font-semibold">
              <th className="pb-3 px-4">Driver</th>
              <th className="pb-3 px-4">License No</th>
              <th className="pb-3 px-4">Category</th>
              <th className="pb-3 px-4">Expiry</th>
              <th className="pb-3 px-4">Contact</th>
              <th className="pb-3 px-4">Trip Compl.</th>
              <th className="pb-3 px-4">Safety</th>
              <th className="pb-3 px-4">Status</th>
              <th className="pb-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan="9" className="py-4 text-center text-dark-muted">No drivers registered.</td>
              </tr>
            ) : (
              filteredDrivers.map((d, index) => {
                // Expiry Check
                const expDate = new Date(d.licenseExpiryDate);
                const isExpired = expDate < new Date();
                const formattedExpiry = isExpired 
                  ? <span className="text-accent-red font-bold">{d.licenseExpiryDate.slice(5, 7)}/{d.licenseExpiryDate.slice(0, 4)} EXPIRED</span>
                  : `${d.licenseExpiryDate.slice(5, 7)}/${d.licenseExpiryDate.slice(0, 4)}`;

                // Contact Masking matching mockup (98765xxxxx)
                const maskedContact = d.contactNumber.length > 5 
                  ? `${d.contactNumber.slice(0, 5)}xxxxx`
                  : d.contactNumber;

                // Safety score color threshold
                let scoreColor = 'text-accent-green';
                if (d.safetyScore < 90) scoreColor = 'text-accent-orange';
                if (d.safetyScore < 80) scoreColor = 'text-accent-red';

                return (
                  <tr key={index} className="border-b border-white/[0.01] hover:bg-white/[0.01]">
                    <td className="py-3.5 px-4 font-semibold">{d.name}</td>
                    <td className="py-3.5 px-4 font-mono">{d.licenseNumber}</td>
                    <td className="py-3.5 px-4">{d.licenseCategory}</td>
                    <td className="py-3.5 px-4">{formattedExpiry}</td>
                    <td className="py-3.5 px-4">{maskedContact}</td>
                    <td className="py-3.5 px-4">96%</td>
                    <td className="py-3.5 px-4 font-semibold">
                      <span className={scoreColor}>{d.safetyScore}/100</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {/* Dynamic status selection dropdown */}
                      <select
                        value={d.status}
                        onChange={(e) => handleInlineStatusChange(index, e.target.value)}
                        className="bg-dark border border-dark-border rounded px-2 py-1 text-[11px] text-dark-text outline-none cursor-pointer"
                      >
                        <option value="Available">Available</option>
                        <option value="On Trip">On Trip</option>
                        <option value="Off Duty">Off Duty</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 flex gap-2">
                      <button 
                        onClick={() => handleOpenEditModal(d, index)}
                        className="bg-transparent border border-dark-border hover:border-brand hover:text-brand px-2.5 py-1 rounded text-[10px] cursor-pointer transition-all duration-150"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(index)}
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
        Rule: Expired license or Suspended status &rarr; blocked from trip assignment
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Driver Profile' : 'Add New Driver'}
      >
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Driver Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text"
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
              className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text"
              placeholder="DL-88213"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">License Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text"
              placeholder="LMV"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">License Expiry Date</label>
            <input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Contact Number</label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text"
              placeholder="9876543210"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Initial Safety Score (0-100)</label>
            <input
              type="number"
              value={safetyScore}
              onChange={(e) => setSafetyScore(e.target.value)}
              min="0"
              max="100"
              className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text"
              placeholder="95"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Initial Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text cursor-pointer"
            >
              <option value="Available">Available</option>
              <option value="Off Duty">Off Duty</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full bg-brand hover:bg-[#924C0D] text-dark-text py-3 rounded-md font-semibold text-center mt-3 cursor-pointer shadow-[0_4px_12px_rgba(178,94,19,0.35)] transition-all duration-150"
          >
            {isEditing ? 'Save Changes' : 'Register Driver'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
