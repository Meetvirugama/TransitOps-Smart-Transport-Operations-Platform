const BaseRepository = require('../../common/base.repository');

class LicenseCategoryRepository extends BaseRepository {
  constructor() { super('license_categories'); }
  findByName(name) { return this.findOneWhere('name = $1', [name]); }
  create(name, description) { return this.insert(['name', 'description'], [name, description]); }
}

module.exports = new LicenseCategoryRepository();
