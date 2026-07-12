const BaseRepository = require('../../../common/base.repository');
const dbPool = require('../../../config/database');

class MaintenanceRepository extends BaseRepository {
  constructor() { super('maintenance_records'); }

  create(data) {
    const cols = ['vehicle_id','maintenance_type','description','estimated_cost','created_by'];
    return this.insert(cols, cols.map(c => data[c] ?? null));
  }

  async findById(id) {
    const { rows } = await dbPool.query(
      `SELECT m.*, v.registration_number, w.name as workshop_name
       FROM maintenance_records m
       LEFT JOIN vehicles v ON m.vehicle_id = v.id
       LEFT JOIN workshops w ON m.workshop_id = w.id
       WHERE m.id = $1 AND m.is_deleted = false`,
      [id]
    );
    return rows[0];
  }

  async findAll(limit = 10, offset = 0, filters = {}) {
    const params = [];
    let cond = '';
    if (filters.status)      { cond += ` AND m.status = $${params.length + 1}`;      params.push(filters.status); }
    if (filters.vehicle_id)  { cond += ` AND m.vehicle_id = $${params.length + 1}`;  params.push(filters.vehicle_id); }
    if (filters.workshop_id) { cond += ` AND m.workshop_id = $${params.length + 1}`; params.push(filters.workshop_id); }

    const { rows } = await dbPool.query(
      `SELECT m.*, v.registration_number, w.name as workshop_name
       FROM maintenance_records m
       LEFT JOIN vehicles v ON m.vehicle_id = v.id
       LEFT JOIN workshops w ON m.workshop_id = w.id
       WHERE m.is_deleted = false${cond} ORDER BY m.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    return rows;
  }

  findActiveByVehicleId(vehicleId) {
    return this.findOneWhere(`vehicle_id = $1 AND status IN ('Scheduled', 'In Progress')`, [vehicleId]);
  }
}

module.exports = new MaintenanceRepository();
