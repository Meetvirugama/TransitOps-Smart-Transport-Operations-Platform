const BaseRepository = require('../../common/base.repository');

class VehicleTypeRepository extends BaseRepository {
  constructor() { super('vehicle_types'); }
  findByName(name) { return this.findOneWhere('name = $1', [name]); }
  create(name, description, maxDefaultCapacity) {
    return this.insert(['name', 'description', 'max_default_capacity'], [name, description, maxDefaultCapacity]);
  }
}

module.exports = new VehicleTypeRepository();
