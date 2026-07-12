const profileService = require('./profile.service');
const { sendSuccess } = require('../../common/response');

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

const upsertMyProfile = catchAsync(async (req, res) => {
  const profile = await profileService.upsertProfile(req.user.id, req.body);
  return sendSuccess(res, profile, 'Profile updated successfully');
});

const getMyProfile = catchAsync(async (req, res) => {
  const profile = await profileService.getProfileByUserId(req.user.id);
  return sendSuccess(res, profile, 'Profile retrieved successfully');
});

const getProfileByUserId = catchAsync(async (req, res) => {
  const profile = await profileService.getProfileByUserId(req.params.userId);
  return sendSuccess(res, profile, 'Profile retrieved successfully');
});

const getProfiles = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const profiles = await profileService.getProfiles(page, limit);
  return sendSuccess(res, profiles, 'Profiles retrieved successfully');
});

module.exports = {
  upsertMyProfile,
  getMyProfile,
  getProfileByUserId,
  getProfiles
};
