/**
 * Simple logger wrapper.
 * In a real-world app, this might wrap Winston or Pino.
 */
const logger = {
  info: (msg, meta = {}) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, meta);
  },
  warn: (msg, meta = {}) => {
    console.warn(`[WARNING] ${new Date().toISOString()} - ${msg}`, meta);
  },
  error: (msg, meta = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, meta);
  },
  debug: (msg, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${msg}`, meta);
    }
  }
};

module.exports = logger;
