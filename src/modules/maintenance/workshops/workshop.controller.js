const workshopService = require('./workshop.service');
const { sendSuccess } = require('../../../common/response');

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

const createWorkshop = catchAsync(async (req, res) => {
  const data = await workshopService.createWorkshop(req.body);
  return sendSuccess(res, data, 'Workshop created successfully', 201);
});

const getWorkshops = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;
  
  const data = await workshopService.getWorkshops(page, limit, status);
  return sendSuccess(res, data, 'Workshops retrieved');
});

const getWorkshopById = catchAsync(async (req, res) => {
  const data = await workshopService.getWorkshopById(req.params.id);
  return sendSuccess(res, data, 'Workshop retrieved');
});

const updateWorkshop = catchAsync(async (req, res) => {
  const data = await workshopService.updateWorkshop(req.params.id, req.body);
  return sendSuccess(res, data, 'Workshop updated');
});

const deleteWorkshop = catchAsync(async (req, res) => {
  await workshopService.deleteWorkshop(req.params.id);
  return sendSuccess(res, null, 'Workshop deleted');
});

module.exports = {
  createWorkshop,
  getWorkshops,
  getWorkshopById,
  updateWorkshop,
  deleteWorkshop
};
