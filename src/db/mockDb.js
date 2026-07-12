/**
 * TransitOps - Mock Database & Data Layer
 * Handles client-side storage of entities using localStorage.
 */

// ---- Version stamp: bump this to force a data reset on next load ----
const DB_VERSION = 'v2-india';

const DEFAULT_USERS = [
  { email: 'manager@transitops.in',    password: 'admin123', role: 'Fleet Manager',     name: 'Rajesh Sharma'  },
  { email: 'dispatcher@transitops.in', password: 'admin123', role: 'Dispatcher',         name: 'Priya Patel'    },
  { email: 'safety@transitops.in',     password: 'admin123', role: 'Safety Officer',     name: 'Suresh Iyer'    },
  { email: 'finance@transitops.in',    password: 'admin123', role: 'Financial Analyst',  name: 'Anita Desai'    }
];

const DEFAULT_VEHICLES = [
  { registrationNumber: 'GJ01AB1234', name: 'Tata Ace Gold',        type: 'Mini',  maxCapacity: 750,   odometer: 38000,  acquisitionCost: 650000,  status: 'Available', region: 'North' },
  { registrationNumber: 'GJ05CD5678', name: 'Mahindra Supro Profit', type: 'Van',   maxCapacity: 1200,  odometer: 21000,  acquisitionCost: 820000,  status: 'Available', region: 'South' },
  { registrationNumber: 'GJ01EF9012', name: 'Ashok Leyland Dost',   type: 'Truck', maxCapacity: 16000, odometer: 142000, acquisitionCost: 1850000, status: 'On Trip',   region: 'East'  },
  { registrationNumber: 'GJ03GH3456', name: 'Tata LPT 1918',        type: 'Truck', maxCapacity: 19000, odometer: 87000,  acquisitionCost: 2200000, status: 'In Shop',   region: 'West'  },
  { registrationNumber: 'GJ07IJ7890', name: 'Eicher Pro 2049',      type: 'Van',   maxCapacity: 900,   odometer: 9500,   acquisitionCost: 1100000, status: 'Available', region: 'North' }
];

const DEFAULT_DRIVERS = [
  { name: 'Amit Verma',      licenseNumber: 'GJ01-20190034521', licenseCategory: 'LMV',  licenseExpiryDate: '2027-12-31', contactNumber: '9876543210', safetyScore: 92, status: 'Available' },
  { name: 'Ramesh Yadav',    licenseNumber: 'GJ05-20170098732', licenseCategory: 'HMV',  licenseExpiryDate: '2028-06-15', contactNumber: '9812345678', safetyScore: 88, status: 'On Trip'   },
  { name: 'Kavita Nair',     licenseNumber: 'GJ01-20160045891', licenseCategory: 'LMV',  licenseExpiryDate: '2024-05-20', contactNumber: '9988776655', safetyScore: 95, status: 'Off Duty'  },
  { name: 'Sunil Chaudhary', licenseNumber: 'GJ03-20210067234', licenseCategory: 'HGMV', licenseExpiryDate: '2029-01-10', contactNumber: '9123456789', safetyScore: 74, status: 'Suspended' }
];

const DEFAULT_TRIPS = [
  { id: 'TRIP-1001', source: 'Gandhinagar Depot', destination: 'Ahmedabad Hub', vehicle: 'GJ01EF9012', driver: 'Ramesh Yadav', cargoWeight: 14500, plannedDistance: 28, status: 'Dispatched' }
];

const DEFAULT_MAINTENANCE = [
  { id: 'MNT-2001', vehicle: 'GJ03GH3456', description: 'Engine Oil & Filter Replacement', cost: 4500, date: '2026-07-01', status: 'Active' }
];

const DEFAULT_FUEL_LOGS = [
  { id: 'FUEL-3001', vehicle: 'GJ01EF9012', liters: 120, cost: 10800, date: '2026-07-05' },
  { id: 'FUEL-3002', vehicle: 'GJ03GH3456', liters: 80,  cost: 7200,  date: '2026-06-28' }
];

const DEFAULT_EXPENSES = [
  { id: 'EXP-4001', vehicle: 'GJ01EF9012', description: 'NH-48 Toll Charges', amount: 280, date: '2026-07-05', category: 'Tolls' }
];

export function initDatabase() {
  // Force re-seed when DB version changes
  const storedVersion = localStorage.getItem('transitops_db_version');
  if (storedVersion !== DB_VERSION) {
    localStorage.removeItem('transitops_users');
    localStorage.removeItem('transitops_vehicles');
    localStorage.removeItem('transitops_drivers');
    localStorage.removeItem('transitops_trips');
    localStorage.removeItem('transitops_maintenance');
    localStorage.removeItem('transitops_fuel_logs');
    localStorage.removeItem('transitops_expenses');
    localStorage.setItem('transitops_db_version', DB_VERSION);
  }

  if (!localStorage.getItem('transitops_users'))       localStorage.setItem('transitops_users',       JSON.stringify(DEFAULT_USERS));
  if (!localStorage.getItem('transitops_vehicles'))    localStorage.setItem('transitops_vehicles',    JSON.stringify(DEFAULT_VEHICLES));
  if (!localStorage.getItem('transitops_drivers'))     localStorage.setItem('transitops_drivers',     JSON.stringify(DEFAULT_DRIVERS));
  if (!localStorage.getItem('transitops_trips'))       localStorage.setItem('transitops_trips',       JSON.stringify(DEFAULT_TRIPS));
  if (!localStorage.getItem('transitops_maintenance')) localStorage.setItem('transitops_maintenance', JSON.stringify(DEFAULT_MAINTENANCE));
  if (!localStorage.getItem('transitops_fuel_logs'))   localStorage.setItem('transitops_fuel_logs',   JSON.stringify(DEFAULT_FUEL_LOGS));
  if (!localStorage.getItem('transitops_expenses'))    localStorage.setItem('transitops_expenses',    JSON.stringify(DEFAULT_EXPENSES));
}

// Initial Call
initDatabase();

export const mockDb = {
  getUsers()              { return JSON.parse(localStorage.getItem('transitops_users'))       || []; },
  getVehicles()           { return JSON.parse(localStorage.getItem('transitops_vehicles'))    || []; },
  saveVehicles(vehicles)  { localStorage.setItem('transitops_vehicles',    JSON.stringify(vehicles));  },
  getDrivers()            { return JSON.parse(localStorage.getItem('transitops_drivers'))     || []; },
  saveDrivers(drivers)    { localStorage.setItem('transitops_drivers',     JSON.stringify(drivers));   },
  getTrips()              { return JSON.parse(localStorage.getItem('transitops_trips'))       || []; },
  saveTrips(trips)        { localStorage.setItem('transitops_trips',       JSON.stringify(trips));     },
  getMaintenance()        { return JSON.parse(localStorage.getItem('transitops_maintenance')) || []; },
  saveMaintenance(logs)   { localStorage.setItem('transitops_maintenance', JSON.stringify(logs));      },
  getFuelLogs()           { return JSON.parse(localStorage.getItem('transitops_fuel_logs'))   || []; },
  saveFuelLogs(logs)      { localStorage.setItem('transitops_fuel_logs',   JSON.stringify(logs));      },
  getExpenses()           { return JSON.parse(localStorage.getItem('transitops_expenses'))    || []; },
  saveExpenses(expenses)  { localStorage.setItem('transitops_expenses',    JSON.stringify(expenses));  },
  resetDatabase() {
    localStorage.removeItem('transitops_db_version');
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
