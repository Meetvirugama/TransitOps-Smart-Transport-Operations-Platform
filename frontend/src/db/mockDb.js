/**
 * TransitOps - Mock Database & Data Layer
 * Handles client-side storage of entities using localStorage.
 */

const DEFAULT_USERS = [
  {
    email: 'manager@transitops.in',
    password: 'admin123',
    role: 'Fleet Manager',
    name: 'Sarah Jenkins'
  },
  {
    email: 'dispatcher@transitops.in',
    password: 'admin123',
    role: 'Dispatcher',
    name: 'Marcus Vance'
  },
  {
    email: 'safety@transitops.in',
    password: 'admin123',
    role: 'Safety Officer',
    name: 'Elena Rostova'
  },
  {
    email: 'finance@transitops.in',
    password: 'admin123',
    role: 'Financial Analyst',
    name: 'David Cho'
  }
];

const DEFAULT_VEHICLES = [
  { registrationNumber: 'VAN-01', name: 'Ford Transit', type: 'Van', maxCapacity: 1200, odometer: 45000, acquisitionCost: 32000, status: 'Available', region: 'North' },
  { registrationNumber: 'VAN-02', name: 'Mercedes Sprinter', type: 'Van', maxCapacity: 1500, odometer: 12000, acquisitionCost: 45000, status: 'Available', region: 'South' },
  { registrationNumber: 'TRK-01', name: 'Volvo FH16', type: 'Truck', maxCapacity: 18000, odometer: 185000, acquisitionCost: 110000, status: 'On Trip', region: 'East' },
  { registrationNumber: 'TRK-02', name: 'Scania R500', type: 'Truck', maxCapacity: 20000, odometer: 98000, acquisitionCost: 125000, status: 'In Shop', region: 'West' },
  { registrationNumber: 'VAN-05', name: 'Toyota HiAce', type: 'Van', maxCapacity: 500, odometer: 5000, acquisitionCost: 28000, status: 'Available', region: 'North' }
];

const DEFAULT_DRIVERS = [
  { name: 'Alex Mercer', licenseNumber: 'DL-98231', licenseCategory: 'Commercial', licenseExpiryDate: '2027-12-31', contactNumber: '+1-555-0199', safetyScore: 92, status: 'Available' },
  { name: 'John Doe', licenseNumber: 'DL-45678', licenseCategory: 'Heavy Truck', licenseExpiryDate: '2028-06-15', contactNumber: '+1-555-0245', safetyScore: 88, status: 'On Trip' },
  { name: 'Jane Smith', licenseNumber: 'DL-12345', licenseCategory: 'Standard', licenseExpiryDate: '2024-05-20', contactNumber: '+1-555-0133', safetyScore: 95, status: 'Off Duty' },
  { name: 'Robert Vance', licenseNumber: 'DL-88771', licenseCategory: 'Commercial', licenseExpiryDate: '2029-01-10', contactNumber: '+1-555-0988', safetyScore: 74, status: 'Suspended' }
];

const DEFAULT_TRIPS = [
  { id: 'TRIP-1001', source: 'Warehouse A', destination: 'Distribution Center B', vehicle: 'TRK-01', driver: 'John Doe', cargoWeight: 15000, plannedDistance: 320, status: 'Dispatched' }
];

const DEFAULT_MAINTENANCE = [
  { id: 'MNT-2001', vehicle: 'TRK-02', description: 'Engine Oil & Filter Replacement', cost: 450, date: '2026-07-01', status: 'Active' }
];

const DEFAULT_FUEL_LOGS = [
  { id: 'FUEL-3001', vehicle: 'TRK-01', liters: 120, cost: 240, date: '2026-07-05' },
  { id: 'FUEL-3002', vehicle: 'TRK-02', liters: 80, cost: 160, date: '2026-06-28' }
];

const DEFAULT_EXPENSES = [
  { id: 'EXP-4001', vehicle: 'TRK-01', description: 'Highway Tolls', amount: 45, date: '2026-07-05', category: 'Tolls' }
];

export function initDatabase() {
  if (!localStorage.getItem('transitops_users')) {
    localStorage.setItem('transitops_users', JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem('transitops_vehicles')) {
    localStorage.setItem('transitops_vehicles', JSON.stringify(DEFAULT_VEHICLES));
  }
  if (!localStorage.getItem('transitops_drivers')) {
    localStorage.setItem('transitops_drivers', JSON.stringify(DEFAULT_DRIVERS));
  }
  if (!localStorage.getItem('transitops_trips')) {
    localStorage.setItem('transitops_trips', JSON.stringify(DEFAULT_TRIPS));
  }
  if (!localStorage.getItem('transitops_maintenance')) {
    localStorage.setItem('transitops_maintenance', JSON.stringify(DEFAULT_MAINTENANCE));
  }
  if (!localStorage.getItem('transitops_fuel_logs')) {
    localStorage.setItem('transitops_fuel_logs', JSON.stringify(DEFAULT_FUEL_LOGS));
  }
  if (!localStorage.getItem('transitops_expenses')) {
    localStorage.setItem('transitops_expenses', JSON.stringify(DEFAULT_EXPENSES));
  }
}

// Initial Call
initDatabase();

export const mockDb = {
  getUsers() {
    return JSON.parse(localStorage.getItem('transitops_users')) || [];
  },
  getVehicles() {
    return JSON.parse(localStorage.getItem('transitops_vehicles')) || [];
  },
  saveVehicles(vehicles) {
    localStorage.setItem('transitops_vehicles', JSON.stringify(vehicles));
  },
  getDrivers() {
    return JSON.parse(localStorage.getItem('transitops_drivers')) || [];
  },
  saveDrivers(drivers) {
    localStorage.setItem('transitops_drivers', JSON.stringify(drivers));
  },
  getTrips() {
    return JSON.parse(localStorage.getItem('transitops_trips')) || [];
  },
  saveTrips(trips) {
    localStorage.setItem('transitops_trips', JSON.stringify(trips));
  },
  getMaintenance() {
    return JSON.parse(localStorage.getItem('transitops_maintenance')) || [];
  },
  saveMaintenance(logs) {
    localStorage.setItem('transitops_maintenance', JSON.stringify(logs));
  },
  getFuelLogs() {
    return JSON.parse(localStorage.getItem('transitops_fuel_logs')) || [];
  },
  saveFuelLogs(logs) {
    localStorage.setItem('transitops_fuel_logs', JSON.stringify(logs));
  },
  getExpenses() {
    return JSON.parse(localStorage.getItem('transitops_expenses')) || [];
  },
  saveExpenses(expenses) {
    localStorage.setItem('transitops_expenses', JSON.stringify(expenses));
  },
  resetDatabase() {
    localStorage.removeItem('transitops_users');
    localStorage.removeItem('transitops_vehicles');
    localStorage.removeItem('transitops_drivers');
    localStorage.removeItem('transitops_trips');
    localStorage.removeItem('transitops_maintenance');
    localStorage.removeItem('transitops_fuel_logs');
    localStorage.removeItem('transitops_expenses');
    initDatabase();
  }
};
