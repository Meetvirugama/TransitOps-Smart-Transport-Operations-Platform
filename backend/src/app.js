const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const dbPool = require('./config/database');

const loggerMiddleware = require('./middleware/logger.middleware');
const errorHandler = require('./middleware/error.middleware');
const authRoutes = require('./auth/auth.routes');
const regionRoutes = require('./modules/regions/region.routes');
const vtRoutes = require('./modules/vehicle-types/vehicle-type.routes');
const lcRoutes = require('./modules/license-categories/license-category.routes');
const vehicleRoutes = require('./modules/vehicles/vehicle.routes');
const driverRoutes = require('./modules/drivers/driver.routes');
const profileRoutes = require('./modules/profiles/profile.routes');
const fleetRoutes = require('./modules/fleet/availability/availability.routes');
const tripRoutes = require('./modules/operations/trips/trip.routes');
const workshopRoutes = require('./modules/maintenance/workshops/workshop.routes');
const maintenanceRoutes = require('./modules/maintenance/records/maintenance.routes');
const fuelRoutes = require('./modules/finance/fuel/fuel.routes');
const expenseRoutes = require('./modules/finance/expenses/expense.routes');
const revenueRoutes = require('./modules/finance/revenue/revenue.routes');
const financeRoutes = require('./modules/finance/calculator/finance.routes');
const analyticsRoutes = require('./modules/analytics/dashboard/dashboard.routes');
const reportsRoutes = require('./modules/analytics/exports/reports.routes');

const app = express();

// Rate limiting — 10 requests per 15 minutes on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Global Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use(loggerMiddleware);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/vehicle-types', vtRoutes);
app.use('/api/license-categories', lcRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/revenues', revenueRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);

// Health Check
app.get('/health', async (req, res) => {
  try {
    const dbResult = await dbPool.query('SELECT 1');
    res.json({
      success: true,
      status: 'UP',
      dbConnected: dbResult.rowCount === 1,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'DOWN',
      message: error.message
    });
  }
});

// Error Handler Middleware (must be registered last)
app.use(errorHandler);

if (require.main === module) {
  app.listen(env.port, () => {
    console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
  });
}

module.exports = app;
