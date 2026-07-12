const BaseRepository = require('../../common/base.repository');
const dbPool = require('../../config/database');

class DriverRepository extends BaseRepository {
  constructor() { super('drivers'); }

  create(data) {
    const cols = ['full_name','license_number','license_category_id','license_expiry_date','phone','email','safety_score','address','joining_date'];
    return this.insert(cols, cols.map(c => data[c] ?? null));
  }

  async findById(id) {
    const { rows } = await dbPool.query(
      `SELECT d.*, lc.name as license_category_name
       FROM drivers d
       LEFT JOIN license_categories lc ON d.license_category_id = lc.id
       WHERE d.id = $1 AND d.is_deleted = false`,
      [id]
    );
    return rows[0];
  }

  async findAll(limit = 10, offset = 0, filters = {}) {
    const params = [];
    let cond = '';
    if (filters.status)              { cond += ` AND d.status = $${params.length + 1}`;              params.push(filters.status); }
    if (filters.license_category_id) { cond += ` AND d.license_category_id = $${params.length + 1}`; params.push(filters.license_category_id); }

    const { rows } = await dbPool.query(
      `SELECT d.*, lc.name as license_category_name
       FROM drivers d
       LEFT JOIN license_categories lc ON d.license_category_id = lc.id
       WHERE d.is_deleted = false${cond} ORDER BY d.id ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    return rows;
  }

  findByLicense(num) { return this.findOneWhere('license_number = $1', [num]); }
}

module.exports = new DriverRepository();
