const BaseRepository = require('../../common/base.repository');

class RegionRepository extends BaseRepository {
  constructor() { super('regions'); }
  findByName(name) { return this.findOneWhere('name = $1', [name]); }
  create(name, description) { return this.insert(['name', 'description'], [name, description]); }
}

module.exports = new RegionRepository();
