const BaseRepository = require('../../../common/base.repository');

class ExpenseRepository extends BaseRepository {
  constructor() { super('expenses'); }
  create(data) {
    const cols = ['vehicle_id','trip_id','expense_type','amount','expense_date','description','created_by'];
    return this.insert(cols, cols.map(c => data[c] ?? null));
  }
  findAll(limit, offset, filters = {}) {
    const params = [];
    let cond = '';
    if (filters.vehicle_id)   { cond += ` AND vehicle_id = $${params.length + 1}`;   params.push(filters.vehicle_id); }
    if (filters.trip_id)      { cond += ` AND trip_id = $${params.length + 1}`;       params.push(filters.trip_id); }
    if (filters.expense_type) { cond += ` AND expense_type = $${params.length + 1}`;  params.push(filters.expense_type); }
    return super.findAll(limit, offset, cond, params);
  }
}

module.exports = new ExpenseRepository();
