const httpError = require('../utils/httpError');

module.exports = (req, res, next) => {
  const expected = process.env.API_KEY;
  if (!expected) return next(httpError(503, 'API_KEY is not configured on the server'));
  if (req.get('x-api-key') !== expected) return next(httpError(401, 'Invalid or missing API key'));
  next();
};