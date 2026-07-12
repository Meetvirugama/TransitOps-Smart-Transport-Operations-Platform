import React, { useState, useEffect, useMemo } from 'react';
import api from '../config/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

export default function FuelExpenses() {
  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  
  const [activeTab, setActiveTab] = useState('Fuel'); // 'Fuel' or 'Expenses'
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user } = useAuth();
  const canModify = user?.role === 'Admin' || (user?.permissions?.can_manage_finance);

  // Modals
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Fuel Form
  const [fVehId, setFVehId] = useState('');
  const [fQty, setFQty] = useState('');
  const [fPrice, setFPrice] = useState('');
  const [fOdo, setFOdo] = useState('');
  const [fStation, setFStation] = useState('');

  // Expense Form
  const [eVehId, setEVehId] = useState('');
  const [eType, setEType] = useState('Tolls');
  const [eAmount, setEAmount] = useState('');
  const [eDesc, setEDesc] = useState('');

  const fetchData = async () => {
    try {
      const [fuelRes, expRes, vehRes] = await Promise.all([
        api.get('/fuel', { params: { limit: 100 } }).catch(() => ({ data: [] })),
        api.get('/expenses', { params: { limit: 100 } }).catch(() => ({ data: [] })),
        api.get('/vehicles', { params: { limit: 100 } }).catch(() => ({ data: [] }))
      ]);
      setFuelLogs(fuelRes.data || []);
      setExpenses(expRes.data || []);
      setVehicles(vehRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredFuelLogs = useMemo(() => {
    return fuelLogs.filter(f => {
      const veh = vehicles.find(v => v.id === f.vehicle_id);
      const searchStr = `${veh?.registration_number || ''} ${veh?.name || ''} ${f.fuel_station || ''}`.toLowerCase();
      return searchStr.includes(searchQuery.toLowerCase());
    });
  }, [fuelLogs, searchQuery, vehicles]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const veh = vehicles.find(v => v.id === e.vehicle_id);
      const searchStr = `${veh?.registration_number || ''} ${veh?.name || ''} ${e.expense_type || ''}`.toLowerCase();
      return searchStr.includes(searchQuery.toLowerCase());
    });
  }, [expenses, searchQuery, vehicles]);

  // Submit Handlers
  const handleFuelSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fuel', {
        vehicle_id: parseInt(fVehId, 10),
        quantity: parseFloat(fQty),
        price_per_liter: parseFloat(fPrice),
        odometer_reading: parseFloat(fOdo),
        fuel_station: fStation,
        fuel_date: new Date().toISOString()
      });
      fetchData();
      setIsFuelModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to add fuel log.');
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses', {
        vehicle_id: parseInt(eVehId, 10),
        expense_type: eType,
        amount: parseFloat(eAmount),
        description: eDesc,
        expense_date: new Date().toISOString()
      });
      fetchData();
      setIsExpenseModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to add expense.');
    }
  };

  const handleDeleteFuel = async (id) => {
    if (!window.confirm("Delete fuel log?")) return;
    await api.delete(`/fuel/${id}`).catch(err => alert(err.message));
    fetchData();
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Delete expense log?")) return;
    await api.delete(`/expenses/${id}`).catch(err => alert(err.message));
    fetchData();
  };

  return (
    <div className="flex flex-col gap-6 select-none animate-page-fade">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="font-heading text-2xl font-bold text-dark-text">6. Fuel & Expenses</h2>
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
          <div className="flex bg-[#121b1f] border border-[#283945] rounded-full p-1 cursor-pointer">
            <div
              onClick={() => setActiveTab('Fuel')}
              className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'Fuel' ? 'bg-[#283945] text-white' : 'text-dark-muted hover:text-white'}`}
            >
              Fuel Logs
            </div>
            <div
              onClick={() => setActiveTab('Expenses')}
              className={`px-6 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'Expenses' ? 'bg-[#283945] text-white' : 'text-dark-muted hover:text-white'}`}
            >
              Other Expenses
            </div>
          </div>
        </div>

        {canModify && (
          <button 
            onClick={() => {
              if (activeTab === 'Fuel') {
                setFVehId(vehicles[0]?.id || ''); setFQty(''); setFPrice(''); setFOdo(''); setFStation('');
                setIsFuelModalOpen(true);
              } else {
                setEVehId(vehicles[0]?.id || ''); setEType('Tolls'); setEAmount(''); setEDesc('');
                setIsExpenseModalOpen(true);
              }
            }}
            className="bg-[#4ff7d1] hover:bg-[#3ee0be] text-[#0d1318] border-none px-4 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-all-custom hover:scale-[1.02]"
          >
            + Add {activeTab === 'Fuel' ? 'Fuel Log' : 'Expense'}
          </button>
        )}
      </div>

      {activeTab === 'Fuel' ? (
        <div className="flex flex-col gap-2.5">
          <div
            className="grid items-center px-5 pb-2.5 border-b border-dark-border font-mono text-[10px] text-[#86898c] uppercase font-bold tracking-widest"
            style={{ gridTemplateColumns: `1fr 1.5fr 1fr 1fr 1.2fr ${canModify ? '100px' : ''}`, gap: '1rem' }}
          >
            <span>Date</span>
            <span>Vehicle</span>
            <span>Station</span>
            <span>Qty / Price</span>
            <span>Total Cost</span>
            {canModify && <span>Actions</span>}
          </div>

          {filteredFuelLogs.length === 0 ? (
            <div className="py-12 text-center text-dark-muted text-xs">No fuel logs found.</div>
          ) : (
            filteredFuelLogs.map((f, idx) => {
              const veh = vehicles.find(v => v.id === f.vehicle_id);
              const total = (f.quantity * f.price_per_liter).toFixed(2);
              const dateStr = new Date(f.fuel_date).toLocaleDateString();

              return (
                <div
                  key={f.id}
                  className="glass-table-row grid items-center px-5 py-4 rounded-xl border border-dark-border bg-[#121b1f]/80 backdrop-blur-sm transition-all duration-300 hover:bg-[#162129]/90 hover:border-[#4ff7d1]/30"
                  style={{ gridTemplateColumns: `1fr 1.5fr 1fr 1fr 1.2fr ${canModify ? '100px' : ''}`, gap: '1rem', animationDelay: `${idx * 40}ms` }}
                >
                  <span className="font-mono text-[#c5cace] text-xs">{dateStr}</span>
                  <div className="flex flex-col">
                    <span className="text-[#ffffff] text-xs font-semibold">{veh?.registration_number || '—'}</span>
                    <span className="text-dark-muted text-[10px]">{veh?.name || ''}</span>
                  </div>
                  <span className="text-[#c5cace] text-xs">{f.fuel_station || '—'}</span>
                  <div className="flex flex-col font-mono text-[10px]">
                    <span className="text-[#c5cace]">{f.quantity} L</span>
                    <span className="text-dark-muted">@ &#8377;{f.price_per_liter}/L</span>
                  </div>
                  <span className="font-mono text-[#4ff7d1] text-sm font-bold">&#8377;{total}</span>
                  
                  {canModify && (
                    <button
                      onClick={() => handleDeleteFuel(f.id)}
                      className="btn-delete bg-transparent border border-[#a21caf]/40 hover:bg-[#a21caf]/10 text-[#a21caf] px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all w-fit"
                    >
                      Delete
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <div
            className="grid items-center px-5 pb-2.5 border-b border-dark-border font-mono text-[10px] text-[#86898c] uppercase font-bold tracking-widest"
            style={{ gridTemplateColumns: `1fr 1.5fr 1fr 1.5fr 1fr ${canModify ? '100px' : ''}`, gap: '1rem' }}
          >
            <span>Date</span>
            <span>Vehicle</span>
            <span>Type</span>
            <span>Description</span>
            <span>Amount</span>
            {canModify && <span>Actions</span>}
          </div>

          {filteredExpenses.length === 0 ? (
            <div className="py-12 text-center text-dark-muted text-xs">No expenses found.</div>
          ) : (
            filteredExpenses.map((e, idx) => {
              const veh = vehicles.find(v => v.id === e.vehicle_id);
              const dateStr = new Date(e.expense_date).toLocaleDateString();

              return (
                <div
                  key={e.id}
                  className="glass-table-row grid items-center px-5 py-4 rounded-xl border border-dark-border bg-[#121b1f]/80 backdrop-blur-sm transition-all duration-300 hover:bg-[#162129]/90 hover:border-[#4ff7d1]/30"
                  style={{ gridTemplateColumns: `1fr 1.5fr 1fr 1.5fr 1fr ${canModify ? '100px' : ''}`, gap: '1rem', animationDelay: `${idx * 40}ms` }}
                >
                  <span className="font-mono text-[#c5cace] text-xs">{dateStr}</span>
                  <div className="flex flex-col">
                    <span className="text-[#ffffff] text-xs font-semibold">{veh?.registration_number || '—'}</span>
                    <span className="text-dark-muted text-[10px]">{veh?.name || ''}</span>
                  </div>
                  <span className="text-[#c5cace] text-xs font-bold">{e.expense_type}</span>
                  <span className="text-dark-muted text-xs truncate" title={e.description}>{e.description || '—'}</span>
                  <span className="font-mono text-[#d946ef] text-sm font-bold">&#8377;{e.amount}</span>
                  
                  {canModify && (
                    <button
                      onClick={() => handleDeleteExpense(e.id)}
                      className="btn-delete bg-transparent border border-[#a21caf]/40 hover:bg-[#a21caf]/10 text-[#a21caf] px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all w-fit"
                    >
                      Delete
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={isFuelModalOpen} onClose={() => setIsFuelModalOpen(false)} title="Log Fuel Fill">
        <form onSubmit={handleFuelSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Vehicle</label>
            <select value={fVehId} onChange={(e) => setFVehId(e.target.value)} className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl" required>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} - {v.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Quantity (L)</label>
              <input type="number" step="0.01" value={fQty} onChange={(e) => setFQty(e.target.value)} className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Price / L</label>
              <input type="number" step="0.01" value={fPrice} onChange={(e) => setFPrice(e.target.value)} className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl" required />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Odometer</label>
            <input type="number" value={fOdo} onChange={(e) => setFOdo(e.target.value)} className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Station Name</label>
            <input type="text" value={fStation} onChange={(e) => setFStation(e.target.value)} className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl" />
          </div>
          <button type="submit" className="w-full bg-[#4ff7d1] hover:bg-[#3ee0be] text-[#0d1318] py-3 rounded-full font-bold mt-2">Save Fuel Log</button>
        </form>
      </Modal>

      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Log Expense">
        <form onSubmit={handleExpenseSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Vehicle</label>
            <select value={eVehId} onChange={(e) => setEVehId(e.target.value)} className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl" required>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.registration_number} - {v.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Type</label>
              <select value={eType} onChange={(e) => setEType(e.target.value)} className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl" required>
                <option value="Tolls">Tolls</option>
                <option value="Taxes">Taxes</option>
                <option value="Fines">Fines</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Amount</label>
              <input type="number" step="0.01" value={eAmount} onChange={(e) => setEAmount(e.target.value)} className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl" required />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Description</label>
            <input type="text" value={eDesc} onChange={(e) => setEDesc(e.target.value)} className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl" />
          </div>
          <button type="submit" className="w-full bg-[#4ff7d1] hover:bg-[#3ee0be] text-[#0d1318] py-3 rounded-full font-bold mt-2">Save Expense</button>
        </form>
      </Modal>
    </div>
  );
}
