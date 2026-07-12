const BaseRepository = require('../../../common/base.repository');

class FuelRepository extends BaseRepository {
  constructor() { super('fuel_logs'); }
  create(data) {
    const cols = ['vehicle_id','trip_id','driver_id','fuel_station','quantity','price_per_liter','total_cost','odometer_reading','fuel_date','remarks','created_by'];
    const vals = cols.map(c => data[c] ?? null);
    return this.insert(cols, vals);
  }
  findAll(limit, offset, filters = {}) {
    const params = [];
    let cond = '';
    if (filters.vehicle_id) { cond += ` AND vehicle_id = $${params.length + 1}`; params.push(filters.vehicle_id); }
    if (filters.trip_id)    { cond += ` AND trip_id = $${params.length + 1}`;    params.push(filters.trip_id); }
    if (filters.driver_id)  { cond += ` AND driver_id = $${params.length + 1}`;  params.push(filters.driver_id); }
    return super.findAll(limit, offset, cond, params);
  }
}

module.exports = new FuelRepository();
