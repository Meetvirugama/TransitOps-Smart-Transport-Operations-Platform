const BaseRepository = require('../../common/base.repository');
const dbPool = require('../../config/database');

class VehicleRepository extends BaseRepository {
  constructor() { super('vehicles'); }

  create(data) {
    const cols = ['registration_number','name','model','vehicle_type_id','max_capacity','odometer','acquisition_cost','purchase_date','region_id','description'];
    return this.insert(cols, cols.map(c => data[c] ?? null));
  }

  async findById(id) {
    const { rows } = await dbPool.query(
      `SELECT v.*, vt.name as vehicle_type_name, r.name as region_name
       FROM vehicles v
       LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
       LEFT JOIN regions r ON v.region_id = r.id
       WHERE v.id = $1 AND v.is_deleted = false`,
      [id]
    );
    return rows[0];
  }

  async findAll(limit = 10, offset = 0, filters = {}) {
    const params = [];
    let cond = '';
    if (filters.status)          { cond += ` AND v.status = $${params.length + 1}`;          params.push(filters.status); }
    if (filters.region_id)       { cond += ` AND v.region_id = $${params.length + 1}`;       params.push(filters.region_id); }
    if (filters.vehicle_type_id) { cond += ` AND v.vehicle_type_id = $${params.length + 1}`; params.push(filters.vehicle_type_id); }

    const { rows } = await dbPool.query(
      `SELECT v.*, vt.name as vehicle_type_name, r.name as region_name
       FROM vehicles v
       LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
       LEFT JOIN regions r ON v.region_id = r.id
       WHERE v.is_deleted = false${cond} ORDER BY v.id ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    return rows;
  }

  findByRegistration(reg) { return this.findOneWhere('registration_number = $1', [reg]); }
}

module.exports = new VehicleRepository();
