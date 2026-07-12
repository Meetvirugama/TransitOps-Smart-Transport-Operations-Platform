/**
 * Standardize successful API responses
 */
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Standardize paginated API responses with total count info
 */
const sendPaginatedSuccess = (res, data, total, page, limit, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
};

module.exports = {
  sendSuccess,
  sendPaginatedSuccess
};

