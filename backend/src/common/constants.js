module.exports = {
  // Roles
  ROLES: {
    ADMIN: 'Admin',
    FLEET_MANAGER: 'Fleet Manager',
    DISPATCHER: 'Dispatcher',
    SAFETY_OFFICER: 'Safety Officer',
    FINANCIAL_ANALYST: 'Financial Analyst'
  },
  
  // Statuses
  VEHICLE_STATUS: {
    AVAILABLE: 'Available',
    ON_TRIP: 'On Trip',
    IN_SHOP: 'In Shop',
    RETIRED: 'Retired'
  },

  DRIVER_STATUS: {
    AVAILABLE: 'Available',
    ON_TRIP: 'On Trip',
    OFF_DUTY: 'Off Duty',
    SUSPENDED: 'Suspended'
  },
  
  TRIP_STATUS: {
    DRAFT: 'Draft',
    DISPATCHED: 'Dispatched',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
  }
};
