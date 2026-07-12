import React, { useState, useMemo, useEffect } from 'react';
import api from '../config/api';
import Modal from '../components/Modal';

export default function Trips() {
  // DB States
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // Form Fields
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedVehReg, setSelectedVehReg] = useState('');
  const [selectedDrvName, setSelectedDrvName] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDistance, setPlannedDistance] = useState('');

  // Validation warnings
  const [capacityWarning, setCapacityWarning] = useState(false);
  const [capacityLimit, setCapacityLimit] = useState(0);
  const [excessWeight, setExcessWeight] = useState(0);

  // Stepper Node Active
  const [activeStep, setActiveStep] = useState('Draft');

  // Complete Trip Modal states
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [compTripId, setCompTripId] = useState('');
  const [compOdometer, setCompOdometer] = useState('');
  const [compFuelLiters, setCompFuelLiters] = useState('');
  const [compFuelCost, setCompFuelCost] = useState('');
  const [compExpenses, setCompExpenses] = useState('0');
  const [odoError, setOdoError] = useState('');

  // Fetch Data
  const fetchData = async () => {
    try {
      const [tripsRes, vehRes, drvRes] = await Promise.all([
        api.get('/trips', { params: { limit: 100 } }),
        api.get('/vehicles', { params: { limit: 100 } }),
        api.get('/drivers', { params: { limit: 100 } })
      ]);
      if (tripsRes.success) setTrips(tripsRes.data);
      if (vehRes.success) setVehicles(vehRes.data);
      if (drvRes.success) setDrivers(drvRes.data);
    } catch (err) {
      console.error('Failed to fetch trip data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1. Populate Dropdown selectors
  // Available vehicles
  const availableVehicles = useMemo(() => {
    return vehicles.filter(v => v.status === 'Available');
  }, [vehicles]);

  // Available drivers (excluding expired licenses and suspended status)
  const availableDrivers = useMemo(() => {
    return drivers.filter(d => {
      const isAvailable = d.status === 'Available';
      let isExpired = false;
      if (d.license_expiry_date) {
        isExpired = new Date(d.license_expiry_date) < new Date();
      }
      const isSuspended = d.status === 'Suspended';
      return isAvailable && !isExpired && !isSuspended;
    });
  }, [drivers]);

  // 2. Keystroke weight check validator
  useEffect(() => {
    if (!selectedVehReg) {
      setCapacityWarning(false);
      return;
    }
    const veh = vehicles.find(v => v.id.toString() === selectedVehReg.toString());
    if (!veh) return;

    const weight = parseInt(cargoWeight, 10) || 0;
    if (weight > veh.max_capacity) {
      setCapacityWarning(true);
      setCapacityLimit(veh.max_capacity);
      setExcessWeight(weight - veh.max_capacity);
    } else {
      setCapacityWarning(false);
    }
  }, [cargoWeight, selectedVehReg, vehicles]);

  // Load selected trip details
  const handleSelectTrip = (tId) => {
    if (selectedTripId === tId) {
      handleResetForm();
      return;
    }
    setSelectedTripId(tId);

    const trip = trips.find(t => t.id === tId);
    if (!trip) return;

    setSource(trip.source);
    setDestination(trip.destination);
    setSelectedVehReg(trip.vehicle_id);
    setSelectedDrvName(trip.driver_id);
    setCargoWeight(trip.cargo_weight);
    setPlannedDistance(trip.planned_distance);
    setActiveStep(trip.status);
  };

  const handleResetForm = () => {
    setSelectedTripId(null);
    setSource('');
    setDestination('');
    setSelectedVehReg('');
    setSelectedDrvName('');
    setCargoWeight('');
    setPlannedDistance('');
    setActiveStep('Draft');
    setCapacityWarning(false);
  };

  // Submit Handler: Dispatch Trip
  const handleDispatchSubmit = async (e) => {
    e.preventDefault();

    if (selectedTripId) {
      // Trip is read-only when loaded, edits occur through stepper node clicks
      handleResetForm();
      return;
    }

    if (!source || !destination || !selectedVehReg || !selectedDrvName || !cargoWeight || !plannedDistance) {
      alert('All fields are required to dispatch a trip.');
      return;
    }

    // Generate TRIP Number
    const seq = trips.length + 1;
    const tripNumber = `TRIP-${(seq + 1000).toString()}`; // TRIP-1002 style

    const newTrip = {
      trip_number: tripNumber,
      source: source.trim(),
      destination: destination.trim(),
      cargo_weight: parseInt(cargoWeight, 10),
      planned_distance: parseInt(plannedDistance, 10),
      status: 'Draft'
    };

    try {
      // 1. Create Draft Trip
      const createRes = await api.post('/trips', newTrip);
      const createdTripId = createRes.data.id;

      // 2. Dispatch Trip
      await api.post(`/trips/${createdTripId}/dispatch`, {
        vehicle_id: parseInt(selectedVehReg, 10),
        driver_id: parseInt(selectedDrvName, 10)
      });

      // Refresh Data
      fetchData();
      handleResetForm();
    } catch (err) {
      alert(err.message || 'Failed to dispatch trip. Please check business rules (e.g. driver license).');
    }
  };

  // Lifecycle transitions: Cancel Trip
  const handleCancelTrip = async (trip) => {
    if (window.confirm("Are you sure you want to cancel this trip? Vehicle & Driver will return to Available.")) {
      try {
        await api.post(`/trips/${trip.id}/cancel`);
        fetchData();
        handleResetForm();
      } catch (err) {
        alert(err.message || 'Failed to cancel trip.');
      }
    }
  };

  // Lifecycle transitions: Open Complete modal
  const handleOpenCompleteModal = (trip) => {
    const veh = vehicles.find(v => v.id === trip.vehicle_id);
    const suggestedOdo = veh ? veh.odometer + trip.planned_distance : 0;

    setCompTripId(trip.id);
    setCompOdometer(suggestedOdo);
    setCompFuelLiters('');
    setCompFuelCost('');
    setCompExpenses('0');
    setOdoError('');
    setIsCompModalOpen(true);
  };

  // Complete Trip Form Submission
  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    setOdoError('');

    const parsedOdo = parseInt(compOdometer, 10);
    const parsedLiters = parseInt(compFuelLiters, 10);
    const parsedFuelCost = parseInt(compFuelCost, 10);
    const parsedTolls = parseInt(compExpenses, 10);

    const trip = trips.find(t => t.id === compTripId);
    const veh = vehicles.find(v => v.id === trip.vehicle_id);

    // Odometer Validation rule
    if (veh && parsedOdo <= veh.odometer) {
      setOdoError(`Must exceed current vehicle odometer (${veh.odometer.toLocaleString()} km)`);
      return;
    }

    try {
      // 1. Log Fuel (via Finance module if we had it mapped to frontend api, but let's just complete the trip for now)
      if (parsedLiters > 0 || parsedFuelCost > 0) {
        await api.post('/finance/fuel-logs', {
          vehicle_id: trip.vehicle_id,
          liters: parsedLiters,
          cost: parsedFuelCost,
          date: new Date().toISOString()
        }).catch(e => console.warn('Fuel log API error/missing', e));
      }

      // 2. Log Expenses
      if (parsedTolls > 0) {
        await api.post('/finance/expenses', {
          vehicle_id: trip.vehicle_id,
          description: 'Toll/Trip Taxes',
          amount: parsedTolls,
          date: new Date().toISOString(),
          category: 'Tolls'
        }).catch(e => console.warn('Expense API error/missing', e));
      }

      // 3. Complete Trip
      const actualDistance = veh ? (parsedOdo - veh.odometer) : trip.planned_distance;
      await api.post(`/trips/${compTripId}/complete`, {
        actual_distance: actualDistance
      });

      fetchData();
      setIsCompModalOpen(false);
      handleResetForm();
    } catch (err) {
      setOdoError(err.message || 'Failed to complete trip.');
    }
  };

  // Stepper dot click handler
  const handleStepClick = (step) => {
    if (!selectedTripId) return;
    const trip = trips.find(t => t.id === selectedTripId);
    if (!trip) return;

    if (trip.status === 'Completed' || trip.status === 'Cancelled') {
      alert(`This trip has already ended. Status is locked at ${trip.status}.`);
      return;
    }

    if (step === 'Cancelled') {
      handleCancelTrip(trip);
    } else if (step === 'Completed') {
      handleOpenCompleteModal(trip);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none h-[calc(100vh-120px)] animate-page-fade">
      <div className="flex justify-between items-center shrink-0">
        <h2 className="font-heading text-2xl font-bold text-dark-text">4. Trip Dispatcher</h2>
      </div>

      <div className="flex gap-6 h-full overflow-hidden items-stretch">
        
        {/* Left pane: Form */}
        <div className="flex-[1.2] bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col gap-5 overflow-y-auto">
          <div className="flex justify-between items-center border-b border-dark-border pb-4 flex-wrap gap-4 shrink-0">
            <h3 className="font-heading text-sm font-semibold">
              {selectedTripId ? `Active Trip: ${selectedTripId}` : 'Create Trip'}
            </h3>
            
            {/* Timeline Stepper */}
            <div className="flex items-center gap-1.5 select-none">
              {['Draft', 'Dispatched', 'Completed', 'Cancelled'].map((step, idx) => {
                const isActive = activeStep === step || 
                  (activeStep === 'Dispatched' && step === 'Draft') ||
                  (activeStep === 'Completed' && (step === 'Draft' || step === 'Dispatched'));

                let dotColor = 'bg-[#283945]';
                if (isActive && step === 'Draft') dotColor = 'bg-[#4ff7d1]';
                if (isActive && step === 'Dispatched') dotColor = 'bg-[#c5cace]';
                if (isActive && step === 'Completed') dotColor = 'bg-[#4ff7d1]';
                if (isActive && step === 'Cancelled') dotColor = 'bg-[#d946ef]';

                return (
                  <React.Fragment key={step}>
                    {idx > 0 && <span className="w-6 h-[2px] bg-[#283945]"></span>}
                    <div 
                      onClick={() => handleStepClick(step)}
                      className={`flex items-center gap-1.5 transition-all-custom ${
                        selectedTripId ? 'cursor-pointer' : 'cursor-default'
                      } ${isActive ? 'opacity-100' : 'opacity-35'}`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full inline-block ${dotColor} ${isActive && (step === 'Draft' || step === 'Completed') ? 'animate-signal-breathe' : ''}`}></span>
                      <span className="text-[11px] font-bold text-dark-text">{step}</span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleDispatchSubmit} className="flex flex-col gap-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-[#b6b8ba] font-bold tracking-wider uppercase">Source</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  disabled={selectedTripId !== null}
                  className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl transition-all-custom hover-glow disabled:opacity-50"
                  placeholder="Gandhinagar Depot"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-[#b6b8ba] font-bold tracking-wider uppercase">Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  disabled={selectedTripId !== null}
                  className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl transition-all-custom hover-glow disabled:opacity-50"
                  placeholder="Ahmedabad Hub"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-[#b6b8ba] font-bold tracking-wider uppercase">Vehicle (Available Only)</label>
                {selectedTripId ? (
                  <input
                    type="text"
                    value={selectedVehReg}
                    disabled
                    className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl opacity-50 font-mono"
                  />
                ) : (
                  <select
                    value={selectedVehReg}
                    onChange={(e) => setSelectedVehReg(e.target.value)}
                    className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl cursor-pointer appearance-none transition-all-custom hover-glow"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2386898c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1rem'
                    }}
                    required
                  >
                    <option value="" disabled>Select vehicle...</option>
                    {availableVehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.registration_number} - {v.name} ({v.max_capacity} kg capacity)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-[#b6b8ba] font-bold tracking-wider uppercase">Driver (Available Only)</label>
                {selectedTripId ? (
                  <input
                    type="text"
                    value={selectedDrvName}
                    disabled
                    className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl opacity-50"
                  />
                ) : (
                  <select
                    value={selectedDrvName}
                    onChange={(e) => setSelectedDrvName(e.target.value)}
                    className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl cursor-pointer appearance-none transition-all-custom hover-glow"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2386898c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1rem'
                    }}
                    required
                  >
                    <option value="" disabled>Select driver...</option>
                    {availableDrivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.full_name} ({d.license_category_name ? d.license_category_name : 'Unknown'})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-[#b6b8ba] font-bold tracking-wider uppercase">Cargo Weight (KG)</label>
                <input
                  type="number"
                  value={cargoWeight}
                  onChange={(e) => setCargoWeight(e.target.value)}
                  disabled={selectedTripId !== null}
                  className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl transition-all-custom hover-glow disabled:opacity-50"
                  placeholder="700"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-[#b6b8ba] font-bold tracking-wider uppercase">Planned Distance (KM)</label>
                <input
                  type="number"
                  value={plannedDistance}
                  onChange={(e) => setPlannedDistance(e.target.value)}
                  disabled={selectedTripId !== null}
                  className="w-full bg-[#121b1f] border border-[#283945] text-sm text-[#ffffff] py-2.5 px-4 rounded-xl transition-all-custom hover-glow disabled:opacity-50"
                  placeholder="38"
                  required
                />
              </div>
            </div>

            {/* Capacity Warning Alert box - Re-styled to Turso warning */}
            {capacityWarning && (
              <div className="bg-[#0d1318] border border-[#ef4444] p-4 rounded-xl flex flex-col gap-1 z-10 font-mono text-[11px] text-[#ef4444]">
                <div className="font-bold">SYSTEM STATUS: EXCEEDED</div>
                <div className="text-[#c5cace] mt-1">Vehicle Capacity Limit: {capacityLimit} kg</div>
                <div className="text-[#c5cace]">Cargo Weight Requested: {cargoWeight} kg</div>
                <div className="font-bold mt-1">Dispatch operation rejected by {excessWeight} kg</div>
              </div>
            )}

            <div className="flex gap-4 mt-3">
              {selectedTripId ? (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="flex-1 bg-transparent border border-[#283945] hover:bg-[#283945] text-[#ffffff] py-3.5 rounded-full font-bold text-sm text-center cursor-pointer transition-all duration-150"
                >
                  Close Detail View
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={capacityWarning}
                    className={`flex-[1.5] py-3.5 rounded-full font-bold text-sm text-center transition-all-custom cursor-pointer ${
                      capacityWarning
                        ? 'bg-[#283945] text-[#9ea1a3] cursor-not-allowed'
                        : 'bg-[#4ff7d1] hover:bg-[#3ee0be] text-[#0d1318]'
                    }`}
                  >
                    Dispatch
                  </button>
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="flex-1 bg-transparent border border-[#283945] hover:bg-[#283945] text-[#ffffff] py-3.5 rounded-full font-bold text-sm text-center cursor-pointer transition-all duration-150"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Right pane: Live Board */}
        <div className="flex-1 bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col gap-4 overflow-y-auto">
          <h3 className="font-heading text-sm font-semibold">Live Board</h3>
          
          <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1">
            {trips.length === 0 ? (
              <div className="text-center text-dark-muted text-xs py-8">No active trips dispatched.</div>
            ) : (
              trips.map((t) => {
                let eta = '—';
                let pillStyle = 'bg-[#162129] text-[#9ea1a3] border-[#283945]'; // default
                if (t.status === 'Dispatched') {
                  eta = '45 min';
                  pillStyle = 'bg-[#0e342d] text-[#4ff7d1] border-[#4ff7d1]/20';
                }
                if (t.status === 'Draft') {
                  eta = 'Awaiting vehicle';
                  pillStyle = 'bg-[#162129] text-[#86898c] border-[#283945]';
                }
                if (t.status === 'Completed') {
                  pillStyle = 'bg-[#0e342d] text-[#4ff7d1] border-[#4ff7d1]/20';
                }
                if (t.status === 'Cancelled') {
                  pillStyle = 'bg-[#0d1318] text-[#d946ef] border-[#d946ef]/20';
                }

                const isSelected = selectedTripId === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTrip(t.id)}
                    className={`bg-[#121b1f] border rounded-xl p-4 cursor-pointer flex flex-col gap-2 transition-all duration-150 ${
                      isSelected
                        ? 'border-[#4ff7d1] bg-[#162129]'
                        : 'border-[#283945] border-dashed hover:border-[#4ff7d1]'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-[#ffffff]">{t.id}</span>
                      <span className="font-medium text-dark-muted font-mono text-[10px]">{t.registration_number ? `${t.registration_number} / ${t.driver_name}` : 'Unassigned'}</span>
                    </div>
                    <div className="text-xs font-semibold text-[#ffffff] leading-tight">{t.source} &rarr; {t.destination}</div>
                    <div className="flex justify-between items-center pt-1 mt-0.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${pillStyle}`}>
                        {t.status}
                      </span>
                      <span className="font-mono text-[10px] text-dark-muted">{eta}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="font-mono text-[9px] text-[#86898c] mt-2 select-none uppercase tracking-wider text-center border-t border-[#283945] pt-3 shrink-0">
            On Complete: ODOMETER &rarr; FUEL LOGS &rarr; EXPENSES &rarr; AVAILABLE
          </div>
        </div>

      </div>

      {/* Complete Trip Modal */}
      <Modal
        isOpen={isCompModalOpen}
        onClose={() => setIsCompModalOpen(false)}
        title="Complete Trip Metrics"
      >
        <form onSubmit={handleCompleteSubmit} className="flex flex-col gap-4 text-xs">
          <div className="text-[11px] text-dark-muted leading-normal border-b border-[#283945] pb-3 mb-1">
            Provide actual trip details for trip <strong className="text-[#4ff7d1]">{compTripId}</strong> to restore vehicle and driver availability.
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Final Odometer (KM)</label>
            <input
              type="number"
              value={compOdometer}
              onChange={(e) => setCompOdometer(e.target.value)}
              className="w-full bg-[#121b1f] border border-[#283945] text-[#ffffff]"
              placeholder="74500"
              required
            />
            {odoError && <span className="text-[10px] text-[#d946ef] mt-1">{odoError}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Fuel Consumed (Liters)</label>
              <input
                type="number"
                value={compFuelLiters}
                onChange={(e) => setCompFuelLiters(e.target.value)}
                className="w-full bg-[#121b1f] border border-[#283945] text-[#ffffff]"
                placeholder="30"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Fuel Cost ($)</label>
              <input
                type="number"
                value={compFuelCost}
                onChange={(e) => setCompFuelCost(e.target.value)}
                className="w-full bg-[#121b1f] border border-[#283945] text-[#ffffff]"
                placeholder="60"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Additional Expenses (Tolls/Taxes in $)</label>
            <input
              type="number"
              value={compExpenses}
              onChange={(e) => setCompExpenses(e.target.value)}
              className="w-full bg-[#121b1f] border border-[#283945] text-[#ffffff]"
              placeholder="15"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#4ff7d1] hover:bg-[#3ee0be] text-[#0d1318] py-3 rounded-full font-bold text-center mt-3 cursor-pointer transition-all duration-150"
          >
            Complete Trip & Sync
          </button>
        </form>
      </Modal>
    </div>
  );
}
