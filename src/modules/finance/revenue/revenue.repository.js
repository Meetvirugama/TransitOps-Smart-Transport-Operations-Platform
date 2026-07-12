const BaseRepository = require('../../../common/base.repository');

class RevenueRepository extends BaseRepository {
  constructor() { super('revenues'); }
  create(data) {
    const cols = ['trip_id','vehicle_id','customer_name','amount','payment_status','invoice_number','received_date','created_by'];
    return this.insert(cols, cols.map(c => data[c] ?? null));
  }
  findAll(limit, offset, filters = {}) {
    const params = [];
    let cond = '';
    if (filters.vehicle_id)     { cond += ` AND vehicle_id = $${params.length + 1}`;     params.push(filters.vehicle_id); }
    if (filters.trip_id)        { cond += ` AND trip_id = $${params.length + 1}`;         params.push(filters.trip_id); }
    if (filters.payment_status) { cond += ` AND payment_status = $${params.length + 1}`;  params.push(filters.payment_status); }
    return super.findAll(limit, offset, cond, params);
  }
}

module.exports = new RevenueRepository();
