const BaseRepository = require('../../../common/base.repository');

class WorkshopRepository extends BaseRepository {
  constructor() { super('workshops'); }
  create({ name, address, contact_number, manager }) {
    return this.insert(['name', 'address', 'contact_number', 'manager'], [name, address, contact_number, manager]);
  }
}

module.exports = new WorkshopRepository();
