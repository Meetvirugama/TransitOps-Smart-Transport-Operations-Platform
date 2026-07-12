const dbPool = require('../../../config/database');

/**
 * Convert an array of objects to a CSV string.
 */
const objectsToCSV = (rows) => {
  if (!rows || rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    const values = headers.map((h) => {
      const val = row[h] == null ? '' : String(row[h]);
      // Wrap in quotes if it contains comma, newline, or quote
      return val.includes(',') || val.includes('\n') || val.includes('"')
        ? `"${val.replace(/"/g, '""')}"`
        : val;
    });
    lines.push(values.join(','));
  }
  return lines.join('\n');
};

const sendCSV = (res, csvString, filename) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvString);
};

const exportTrips = async (res, filters = {}) => {
  let query = `
    SELECT t.id, t.trip_number, t.source, t.destination, t.status,
           t.cargo_weight, t.planned_distance, t.actual_distance,
           t.start_time, t.end_time, v.registration_number as vehicle,
           d.full_name as driver
    FROM trips t
    LEFT JOIN vehicles v ON t.vehicle_id = v.id
    LEFT JOIN drivers d ON t.driver_id = d.id
    WHERE t.is_deleted = false
  `;
  const params = [];
  let p = 1;

  if (filters.status) { query += ` AND t.status = $${p++}`; params.push(filters.status); }
  if (filters.vehicle_id) { query += ` AND t.vehicle_id = $${p++}`; params.push(filters.vehicle_id); }
  if (filters.from_date) { query += ` AND t.created_at >= $${p++}`; params.push(filters.from_date); }
  if (filters.to_date) { query += ` AND t.created_at <= $${p++}`; params.push(filters.to_date); }

  query += ' ORDER BY t.created_at DESC';
  const { rows } = await dbPool.query(query, params);
  return sendCSV(res, objectsToCSV(rows), 'trips_export.csv');
};

const exportVehicles = async (res, filters = {}) => {
  let query = `
    SELECT v.id, v.registration_number, v.name, v.model, v.status,
           v.max_capacity, v.odometer, v.acquisition_cost,
           vt.name as vehicle_type, r.name as region
    FROM vehicles v
    LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
    LEFT JOIN regions r ON v.region_id = r.id
    WHERE v.is_deleted = false
  `;
  const params = [];
  let p = 1;

  if (filters.status) { query += ` AND v.status = $${p++}`; params.push(filters.status); }
  if (filters.region_id) { query += ` AND v.region_id = $${p++}`; params.push(filters.region_id); }
  if (filters.vehicle_type_id) { query += ` AND v.vehicle_type_id = $${p++}`; params.push(filters.vehicle_type_id); }

  query += ' ORDER BY v.id ASC';
  const { rows } = await dbPool.query(query, params);
  return sendCSV(res, objectsToCSV(rows), 'vehicles_export.csv');
};

const exportFuelLogs = async (res, filters = {}) => {
  let query = `
    SELECT fl.id, fl.fuel_date, fl.fuel_station, fl.quantity, fl.price_per_liter,
           fl.total_cost, fl.odometer_reading, fl.remarks,
           v.registration_number as vehicle, d.full_name as driver
    FROM fuel_logs fl
    LEFT JOIN vehicles v ON fl.vehicle_id = v.id
    LEFT JOIN drivers d ON fl.driver_id = d.id
    WHERE fl.is_deleted = false
  `;
  const params = [];
  let p = 1;

  if (filters.vehicle_id) { query += ` AND fl.vehicle_id = $${p++}`; params.push(filters.vehicle_id); }
  if (filters.from_date) { query += ` AND fl.fuel_date >= $${p++}`; params.push(filters.from_date); }
  if (filters.to_date) { query += ` AND fl.fuel_date <= $${p++}`; params.push(filters.to_date); }

  query += ' ORDER BY fl.fuel_date DESC';
  const { rows } = await dbPool.query(query, params);
  return sendCSV(res, objectsToCSV(rows), 'fuel_logs_export.csv');
};

module.exports = { exportTrips, exportVehicles, exportFuelLogs };
