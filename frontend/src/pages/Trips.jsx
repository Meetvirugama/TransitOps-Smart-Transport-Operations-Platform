import React, { useState, useMemo, useEffect } from 'react';
import { mockDb } from '../db/mockDb';
import Modal from '../components/Modal';

export default function Trips() {
  // DB States
  const [trips, setTrips] = useState(() => mockDb.getTrips());
  const [vehicles, setVehicles] = useState(() => mockDb.getVehicles());
  const [drivers, setDrivers] = useState(() => mockDb.getDrivers());

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

  // 1. Populate Dropdown selectors
  // Available vehicles
  const availableVehicles = useMemo(() => {
    return vehicles.filter(v => v.status === 'Available');
  }, [vehicles]);

  // Available drivers (excluding expired licenses and suspended status)
  const availableDrivers = useMemo(() => {
    return drivers.filter(d => {
      const isAvailable = d.status === 'Available';
      const isExpired = new Date(d.licenseExpiryDate) < new Date();
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
    const veh = vehicles.find(v => v.registrationNumber === selectedVehReg);
    if (!veh) return;

    const weight = parseInt(cargoWeight, 10) || 0;
    if (weight > veh.maxCapacity) {
      setCapacityWarning(true);
      setCapacityLimit(veh.maxCapacity);
      setExcessWeight(weight - veh.maxCapacity);
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
    setSelectedVehReg(trip.vehicle);
    setSelectedDrvName(trip.driver);
    setCargoWeight(trip.cargoWeight);
    setPlannedDistance(trip.plannedDistance);
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
  const handleDispatchSubmit = (e) => {
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

    // Generate TRIP ID
    const seq = trips.length + 1;
    const tripId = `TRIP-${(seq + 1000).toString()}`; // TRIP-1002 style

    const newTrip = {
      id: tripId,
      source: source.trim(),
      destination: destination.trim(),
      vehicle: selectedVehReg,
      driver: selectedDrvName,
      cargoWeight: parseInt(cargoWeight, 10),
      plannedDistance: parseInt(plannedDistance, 10),
      status: 'Dispatched'
    };

    // Update statuses (Business rules enforcements)
    const updatedVehicles = vehicles.map(v => {
      if (v.registrationNumber === selectedVehReg) return { ...v, status: 'On Trip' };
      return v;
    });

    const updatedDrivers = drivers.map(d => {
      if (d.name === selectedDrvName) return { ...d, status: 'On Trip' };
      return d;
    });

    const updatedTrips = [...trips, newTrip];

    mockDb.saveTrips(updatedTrips);
    mockDb.saveVehicles(updatedVehicles);
    mockDb.saveDrivers(updatedDrivers);

    setTrips(updatedTrips);
    setVehicles(updatedVehicles);
    setDrivers(updatedDrivers);

    handleResetForm();
  };

  // Lifecycle transitions: Cancel Trip
  const handleCancelTrip = (trip) => {
    if (window.confirm("Are you sure you want to cancel this trip? Vehicle & Driver will return to Available.")) {
      const updatedTrips = trips.map(t => {
        if (t.id === trip.id) return { ...t, status: 'Cancelled' };
        return t;
      });

      const updatedVehicles = vehicles.map(v => {
        if (v.registrationNumber === trip.vehicle) return { ...v, status: 'Available' };
        return v;
      });

      const updatedDrivers = drivers.map(d => {
        if (d.name === trip.driver) return { ...d, status: 'Available' };
        return d;
      });

      mockDb.saveTrips(updatedTrips);
      mockDb.saveVehicles(updatedVehicles);
      mockDb.saveDrivers(updatedDrivers);

      setTrips(updatedTrips);
      setVehicles(updatedVehicles);
      setDrivers(updatedDrivers);

      handleResetForm();
    }
  };

  // Lifecycle transitions: Open Complete modal
  const handleOpenCompleteModal = (trip) => {
    const veh = vehicles.find(v => v.registrationNumber === trip.vehicle);
    const suggestedOdo = veh ? veh.odometer + trip.plannedDistance : 0;

    setCompTripId(trip.id);
    setCompOdometer(suggestedOdo);
    setCompFuelLiters('');
    setCompFuelCost('');
    setCompExpenses('0');
    setOdoError('');
    setIsCompModalOpen(true);
  };

  // Complete Trip Form Submission
  const handleCompleteSubmit = (e) => {
    e.preventDefault();
    setOdoError('');

    const parsedOdo = parseInt(compOdometer, 10);
    const parsedLiters = parseInt(compFuelLiters, 10);
    const parsedFuelCost = parseInt(compFuelCost, 10);
    const parsedTolls = parseInt(compExpenses, 10);

    const trip = trips.find(t => t.id === compTripId);
    const veh = vehicles.find(v => v.registrationNumber === trip.vehicle);

    // Odometer Validation rule
    if (veh && parsedOdo <= veh.odometer) {
      setOdoError(`Must exceed current vehicle odometer (${veh.odometer.toLocaleString()} km)`);
      return;
    }

    // 1. Update Trip, Driver, and Vehicle
    const updatedTrips = trips.map(t => {
      if (t.id === compTripId) return { ...t, status: 'Completed' };
      return t;
    });

    const updatedVehicles = vehicles.map(v => {
      if (v.registrationNumber === trip.vehicle) return { ...v, odometer: parsedOdo, status: 'Available' };
      return v;
    });

    const updatedDrivers = drivers.map(d => {
      if (d.name === trip.driver) return { ...d, status: 'Available' };
      return d;
    });

    // 2. Log Fuel
    const fuelLogs = mockDb.getFuelLogs();
    const fuelSeq = fuelLogs.length + 1;
    fuelLogs.push({
      id: `FUEL-${fuelSeq.toString().padStart(4, '0')}`,
      vehicle: trip.vehicle,
      liters: parsedLiters,
      cost: parsedFuelCost,
      date: new Date().toISOString().split('T')[0]
    });

    // 3. Log Expense
    const expenses = mockDb.getExpenses();
    if (parsedTolls > 0) {
      const expSeq = expenses.length + 1;
      expenses.push({
        id: `EXP-${expSeq.toString().padStart(4, '0')}`,
        vehicle: trip.vehicle,
        description: 'Toll/Trip Taxes',
        amount: parsedTolls,
        date: new Date().toISOString().split('T')[0],
        category: 'Tolls'
      });
    }

    mockDb.saveTrips(updatedTrips);
    mockDb.saveVehicles(updatedVehicles);
    mockDb.saveDrivers(updatedDrivers);
    mockDb.saveFuelLogs(fuelLogs);
    mockDb.saveExpenses(expenses);

    setTrips(updatedTrips);
    setVehicles(updatedVehicles);
    setDrivers(updatedDrivers);

    setIsCompModalOpen(false);
    handleResetForm();
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
    <div className="flex flex-col gap-6 select-none h-[calc(100vh-120px)]">
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

                let dotColor = 'bg-dark-muted';
                if (isActive && step === 'Draft') dotColor = 'bg-accent-green shadow-[0_0_6px_#22C55E]';
                if (isActive && step === 'Dispatched') dotColor = 'bg-accent-blue shadow-[0_0_6px_#3B82F6]';
                if (isActive && step === 'Completed') dotColor = 'bg-accent-green shadow-[0_0_6px_#22C55E]';
                if (isActive && step === 'Cancelled') dotColor = 'bg-accent-red shadow-[0_0_6px_#EF4444]';

                return (
                  <React.Fragment key={step}>
                    {idx > 0 && <span className="w-6 h-[2px] bg-dark-border"></span>}
                    <div 
                      onClick={() => handleStepClick(step)}
                      className={`flex items-center gap-1.5 transition-all duration-150 ${
                        selectedTripId ? 'cursor-pointer' : 'cursor-default'
                      } ${isActive ? 'opacity-100' : 'opacity-35'}`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full inline-block ${dotColor}`}></span>
                      <span className="text-[10px] font-bold text-dark-text">{step}</span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleDispatchSubmit} className="flex flex-col gap-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Source</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  disabled={selectedTripId !== null}
                  className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text disabled:opacity-50"
                  placeholder="Gandhinagar Depot"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  disabled={selectedTripId !== null}
                  className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text disabled:opacity-50"
                  placeholder="Ahmedabad Hub"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Vehicle (Available Only)</label>
                {selectedTripId ? (
                  <input
                    type="text"
                    value={selectedVehReg}
                    disabled
                    className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none text-dark-text opacity-50 font-mono"
                  />
                ) : (
                  <select
                    value={selectedVehReg}
                    onChange={(e) => setSelectedVehReg(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text cursor-pointer appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1.2rem'
                    }}
                    required
                  >
                    <option value="" disabled>Select vehicle...</option>
                    {availableVehicles.map(v => (
                      <option key={v.registrationNumber} value={v.registrationNumber}>
                        {v.registrationNumber} - {v.name} ({v.maxCapacity} kg capacity)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Driver (Available Only)</label>
                {selectedTripId ? (
                  <input
                    type="text"
                    value={selectedDrvName}
                    disabled
                    className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none text-dark-text opacity-50"
                  />
                ) : (
                  <select
                    value={selectedDrvName}
                    onChange={(e) => setSelectedDrvName(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text cursor-pointer appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1.2rem'
                    }}
                    required
                  >
                    <option value="" disabled>Select driver...</option>
                    {availableDrivers.map(d => (
                      <option key={d.name} value={d.name}>
                        {d.name} ({d.licenseCategory})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Cargo Weight (KG)</label>
                <input
                  type="number"
                  value={cargoWeight}
                  onChange={(e) => setCargoWeight(e.target.value)}
                  disabled={selectedTripId !== null}
                  className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text disabled:opacity-50"
                  placeholder="700"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Planned Distance (KM)</label>
                <input
                  type="number"
                  value={plannedDistance}
                  onChange={(e) => setPlannedDistance(e.target.value)}
                  disabled={selectedTripId !== null}
                  className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text disabled:opacity-50"
                  placeholder="38"
                  required
                />
              </div>
            </div>

            {/* Capacity Warning Alert box */}
            {capacityWarning && (
              <div className="bg-red-500/10 border border-dashed border-red-500 p-4 rounded-md flex flex-col gap-1 z-10">
                <div className="font-semibold text-red-500">Vehicle Capacity: {capacityLimit} kg</div>
                <div className="font-semibold text-red-500">Cargo Weight: {cargoWeight} kg</div>
                <div className="font-bold text-red-500 mt-1">❌ Capacity exceeded by {excessWeight} kg &mdash; dispatch blocked</div>
              </div>
            )}

            <div className="flex gap-4 mt-3">
              {selectedTripId ? (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="flex-1 bg-transparent border border-dark-border hover:border-dark-text hover:text-dark-text py-3 rounded-md font-semibold text-center cursor-pointer transition-all duration-150"
                >
                  Close Detail View
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={capacityWarning}
                    className={`flex-[1.5] py-3 rounded-md font-semibold text-center transition-all duration-150 cursor-pointer ${
                      capacityWarning
                        ? 'bg-dark-border text-dark-muted cursor-not-allowed shadow-none'
                        : 'bg-brand hover:bg-[#924C0D] text-dark-text shadow-[0_4px_12px_rgba(178,94,19,0.35)]'
                    }`}
                  >
                    Dispatch
                  </button>
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="flex-1 bg-transparent border border-dark-border hover:border-dark-text hover:text-dark-text py-3 rounded-md font-semibold text-center cursor-pointer transition-all duration-150"
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
                let pillColor = 'bg-white/8 text-dark-muted border-white/10';
                if (t.status === 'Dispatched') {
                  eta = '45 min';
                  pillColor = 'bg-accent-blue/12 text-accent-blue border-accent-blue/25';
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

                const isSelected = selectedTripId === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTrip(t.id)}
                    className={`bg-dark-bg border rounded-lg p-4 cursor-pointer flex flex-col gap-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-brand border-solid bg-brand/[0.04]'
                        : 'border-dark-border border-dashed hover:border-brand hover:bg-brand/[0.01]'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold">{t.id}</span>
                      <span className="font-medium text-dark-muted">{t.vehicle ? `${t.vehicle} / ${t.driver}` : 'Unassigned'}</span>
                    </div>
                    <div className="text-xs font-semibold text-dark-text leading-tight">{t.source} &rarr; {t.destination}</div>
                    <div className="flex justify-between items-center pt-1 mt-0.5">
                      <span className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-semibold uppercase ${pillColor}`}>
                        {t.status}
                      </span>
                      <span className="font-mono text-[10px] text-dark-muted">{eta}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="text-[10px] text-dark-muted font-medium italic text-center shrink-0 border-t border-dark-border pt-3">
            On Complete: odometer &rarr; fuel log &rarr; expenses &rarr; Vehicle & Driver Available
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
          <div className="text-[11px] text-dark-muted leading-normal border-b border-dark-border pb-3 mb-1">
            Provide actual trip details for trip <strong className="text-brand">{compTripId}</strong> to restore vehicle and driver availability.
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Final Odometer (KM)</label>
            <input
              type="number"
              value={compOdometer}
              onChange={(e) => setCompOdometer(e.target.value)}
              className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text"
              placeholder="74500"
              required
            />
            {odoError && <span className="text-[10px] text-accent-red mt-1">{odoError}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] text-dark-muted uppercase font-bold tracking-wider">Fuel Consumed (Liters)</label>
              <input
                type="number"
                value={compFuelLiters}
                onChange={(e) => setCompFuelLiters(e.target.value)}
                className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text"
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
                className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text"
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
              className="w-full bg-[#0B0F19] border border-dark-border rounded-md px-4 py-2.5 outline-none focus:border-brand text-dark-text"
              placeholder="15"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-brand hover:bg-[#924C0D] text-dark-text py-3 rounded-md font-semibold text-center mt-3 cursor-pointer shadow-[0_4px_12px_rgba(178,94,19,0.35)] transition-all duration-150"
          >
            Complete Trip & Sync
          </button>
        </form>
      </Modal>
    </div>
  );
}
