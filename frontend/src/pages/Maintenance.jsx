import React, { useState, useEffect, useMemo } from 'react';
import api from '../config/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function Maintenance() {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user } = useAuth();
  const canModify = user?.role === 'Admin' || (user?.permissions?.can_manage_maintenance);

  // Modal States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // Forms
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  
  // Schedule Form
  const [schedVehId, setSchedVehId] = useState('');
  const [schedType, setSchedType] = useState('Routine Service');
  const [schedDesc, setSchedDesc] = useState('');
  const [schedEstCost, setSchedEstCost] = useState('');

  // Start Form
  const [startWorkshopId, setStartWorkshopId] = useState('');
  const [startTech, setStartTech] = useState('');
  const [startDate, setStartDate] = useState('');

  // Complete Form
  const [compCost, setCompCost] = useState('');
  const [compRemarks, setCompRemarks] = useState('');

  const fetchData = async () => {
    try {
      const [recRes, vehRes, workRes] = await Promise.all([
        api.get('/maintenance', { params: { limit: 100 } }).catch(() => ({ success: false, data: [] })),
        api.get('/vehicles', { params: { limit: 100 } }).catch(() => ({ success: false, data: [] })),
        api.get('/workshops', { params: { limit: 100 } }).catch(() => ({ success: false, data: [] }))
      ]);
      if (recRes.success || recRes.data) setRecords(recRes.data || []);
      if (vehRes.success || vehRes.data) setVehicles(vehRes.data || []);
      if (workRes.success || workRes.data) setWorkshops(workRes.data || []);
    } catch (err) {
      console.error('Failed to fetch maintenance data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      const veh = vehicles.find(v => v.id === r.vehicle_id);
      const searchStr = `${r.maintenance_type} ${veh?.registration_number || ''} ${veh?.name || ''}`.toLowerCase();
      const matchSearch = searchStr.includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [records, statusFilter, searchQuery, vehicles]);

  // Handlers
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', {
        vehicle_id: parseInt(schedVehId, 10),
        maintenance_type: schedType,
        description: schedDesc,
        estimated_cost: schedEstCost ? parseInt(schedEstCost, 10) : undefined
      });
      fetchData();
      setIsScheduleModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to schedule maintenance.');
    }
  };

  const handleStartSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/maintenance/${selectedRecordId}/start`, {
        workshop_id: parseInt(startWorkshopId, 10),
        technician_name: startTech,
        expected_completion_date: startDate || undefined
      });
      fetchData();
      setIsStartModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to start maintenance.');
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/maintenance/${selectedRecordId}/complete`, {
        actual_cost: parseInt(compCost, 10),
        remarks: compRemarks
      });
      fetchData();
      setIsCompleteModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to complete maintenance.');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this maintenance?")) return;
    try {
      await api.post(`/maintenance/${id}/cancel`);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to cancel maintenance.');
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none animate-page-fade">
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-2xl font-bold text-dark-text">5. Maintenance Log</h2>
      </div>

      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex gap-4 items-center flex-wrap">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-sm text-dark-text outline-none w-56 placeholder:text-dark-muted/50 transition-all-custom hover-glow"
            placeholder="Search vehicle or type..."
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-sm text-dark-text outline-none cursor-pointer hover:border-[#4ff7d1]/50 transition-all-custom"
          >
            <option value="All">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {canModify && (
          <button 
            onClick={() => {
              setSchedVehId(vehicles[0]?.id || '');
              setSchedType('Routine Service');
              setSchedDesc('');
              setSchedEstCost('');
              setIsScheduleModalOpen(true);
            }}
            className="bg-[#4ff7d1] hover:bg-[#3ee0be] text-[#0d1318] border-none px-4 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-all-custom hover:scale-[1.02]"
          >
            + Schedule Maintenance
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <div
          className="grid items-center px-5 pb-2.5 border-b border-dark-border font-mono text-[10px] text-[#86898c] uppercase font-bold tracking-widest"
          style={{ gridTemplateColumns: `0.8fr 1.2fr 1.5fr 1fr 1fr 1fr ${canModify ? '140px' : ''}`, gap: '1rem' }}
        >
          <span>ID</span>
          <span>Vehicle</span>
          <span>Type & Desc</span>
          <span>Workshop/Tech</span>
          <span>Costs</span>
          <span>Status</span>
          {canModify && <span>Actions</span>}
        </div>

        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-dark-muted text-xs">No maintenance records found.</div>
        ) : (
          filteredRecords.map((r, idx) => {
            const veh = vehicles.find(v => v.id === r.vehicle_id);
            const wshop = workshops.find(w => w.id === r.workshop_id);
            
            let pillColor = 'bg-[#162129] text-[#9ea1a3] border-[#283945]';
            let glowBorder = 'border-dark-border hover:border-[#4ff7d1]/30';
            if (r.status === 'Scheduled') { pillColor = 'bg-[#1a140d] text-[#f59e0b] border-[#f59e0b]/20'; glowBorder = 'border-[#f59e0b]/20 hover:border-[#f59e0b]/50'; }
            if (r.status === 'In Progress') { pillColor = 'bg-[#0d141f] text-[#3b82f6] border-[#3b82f6]/20'; glowBorder = 'border-[#3b82f6]/20 hover:border-[#3b82f6]/50'; }
            if (r.status === 'Completed') { pillColor = 'bg-[#0e342d] text-[#4ff7d1] border-[#4ff7d1]/20'; glowBorder = 'border-[#4ff7d1]/20 hover:border-[#4ff7d1]/60'; }
            if (r.status === 'Cancelled') { pillColor = 'bg-[#1a0d1a] text-[#a21caf] border-[#a21caf]/20'; }

            return (
              <div
                key={r.id}
                className={`glass-table-row grid items-center px-5 py-4 rounded-xl border bg-[#121b1f]/80 backdrop-blur-sm transition-all duration-300 hover:bg-[#162129]/90 hover:shadow-[0_0_18px_rgba(79,247,209,0.06)] ${glowBorder}`}
                style={{ gridTemplateColumns: `0.8fr 1.2fr 1.5fr 1fr 1fr 1fr ${canModify ? '140px' : ''}`, gap: '1rem', animationDelay: `${idx * 40}ms` }}
              >
                <span className="font-mono font-bold text-[#ffffff] text-xs">MAINT-{r.id}</span>
                <div className="flex flex-col">
                  <span className="text-[#c5cace] text-xs font-semibold">{veh?.registration_number || 'Unknown'}</span>
                  <span className="text-dark-muted text-[10px]">{veh?.name || ''}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[#ffffff] text-xs">{r.maintenance_type}</span>
                  <span className="text-dark-muted text-[10px] truncate" title={r.description}>{r.description || '—'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[#c5cace] text-xs">{wshop?.name || '—'}</span>
                  <span className="text-dark-muted text-[10px]">{r.technician_name || '—'}</span>
                </div>
                <div className="flex flex-col font-mono">
                  <span className="text-[#c5cace] text-[10px]">Est: &#8377;{r.estimated_cost || 0}</span>
                  <span className="text-[#4ff7d1] text-xs font-bold">Act: &#8377;{r.actual_cost || 0}</span>
                </div>
                <span className={`inline-flex w-fit px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${pillColor}`}>
                  {r.status}
                </span>
                
                {canModify && (
                  <div className="flex gap-2">
                    {r.status === 'Scheduled' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedRecordId(r.id);
                            setStartWorkshopId(workshops[0]?.id || '');
                            setStartTech('');
                            setStartDate('');
                            setIsStartModalOpen(true);
                          }}
                          className="btn-edit bg-transparent border border-[#3b82f6]/40 hover:bg-[#3b82f6]/10 text-[#3b82f6] px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all"
                        >
                          Start
                        </button>
                        <button
                          onClick={() => handleCancel(r.id)}
                          className="btn-delete bg-transparent border border-[#a21caf]/40 hover:bg-[#a21caf]/10 text-[#a21caf] px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {r.status === 'In Progress' && (
                      <button
                        onClick={() => {
                          setSelectedRecordId(r.id);
                          setCompCost(r.estimated_cost || '');
                          setCompRemarks('');
                          setIsCompleteModalOpen(true);
                        }}
                        className="bg-transparent border border-[#4ff7d1]/40 hover:bg-[#4ff7d1]/10 text-[#4ff7d1] px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title="Schedule Maintenance">
        <form onSubmit={handleScheduleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Vehicle</label>
            <select
              value={schedVehId}
              onChange={(e) => setSchedVehId(e.target.value)}
              className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl"
              required
            >
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} - {v.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Type</label>
            <select
              value={schedType}
              onChange={(e) => setSchedType(e.target.value)}
              className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl"
            >
              <option value="Routine Service">Routine Service</option>
              <option value="Repair">Repair</option>
              <option value="Inspection">Inspection</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Estimated Cost</label>
            <input
              type="number"
              value={schedEstCost}
              onChange={(e) => setSchedEstCost(e.target.value)}
              className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Description</label>
            <input
              type="text"
              value={schedDesc}
              onChange={(e) => setSchedDesc(e.target.value)}
              className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl"
            />
          </div>
          <button type="submit" className="w-full bg-[#4ff7d1] hover:bg-[#3ee0be] text-[#0d1318] py-3 rounded-full font-bold mt-2">Schedule</button>
        </form>
      </Modal>

      <Modal isOpen={isStartModalOpen} onClose={() => setIsStartModalOpen(false)} title="Start Maintenance">
        <form onSubmit={handleStartSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Workshop</label>
            <select
              value={startWorkshopId}
              onChange={(e) => setStartWorkshopId(e.target.value)}
              className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl"
              required
            >
              {workshops.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Technician Name</label>
            <input
              type="text"
              value={startTech}
              onChange={(e) => setStartTech(e.target.value)}
              className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Expected Completion</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl"
            />
          </div>
          <button type="submit" className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-[#ffffff] py-3 rounded-full font-bold mt-2">Start Work</button>
        </form>
      </Modal>

      <Modal isOpen={isCompleteModalOpen} onClose={() => setIsCompleteModalOpen(false)} title="Complete Maintenance">
        <form onSubmit={handleCompleteSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Actual Cost</label>
            <input
              type="number"
              value={compCost}
              onChange={(e) => setCompCost(e.target.value)}
              className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Remarks</label>
            <textarea
              value={compRemarks}
              onChange={(e) => setCompRemarks(e.target.value)}
              className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl h-24 resize-none"
            />
          </div>
          <button type="submit" className="w-full bg-[#4ff7d1] hover:bg-[#3ee0be] text-[#0d1318] py-3 rounded-full font-bold mt-2">Complete</button>
        </form>
      </Modal>
    </div>
  );
}
