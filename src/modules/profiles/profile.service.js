const profileRepo = require('./profile.repository');
const { NotFoundError } = require('../../common/exceptions');

const upsertProfile = async (userId, data) => {
  return profileRepo.createOrUpdate(userId, data);
};

const getProfileByUserId = async (userId) => {
  const profile = await profileRepo.findByUserId(userId);
  if (!profile) throw new NotFoundError('Profile not found');
  return profile;
};

const getProfiles = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return profileRepo.findAll(limit, offset);
};

module.exports = {
  upsertProfile,
  getProfileByUserId,
  getProfiles
};
