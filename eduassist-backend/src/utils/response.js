'use strict';

/**
 * Standard API response helpers.
 */

function success(res, data = {}, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
}

function created(res, data = {}, message = 'Created') {
  return success(res, data, message, 201);
}

function paginated(res, { data, total, page, limit }) {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
}

function error(res, message = 'Error', statusCode = 400, errors = null) {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
}

function notFound(res, resource = 'Resource') {
  return error(res, `${resource} not found`, 404);
}

function unauthorized(res, message = 'Unauthorized') {
  return error(res, message, 401);
}

function forbidden(res, message = 'Forbidden') {
  return error(res, message, 403);
}

/**
 * Async route wrapper — eliminates try/catch boilerplate.
 */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { success, created, paginated, error, notFound, unauthorized, forbidden, asyncHandler };
