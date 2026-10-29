module.exports = (err, req, res, next) => {
  // ethers errors (reverts, insufficient funds, network failures) carry a "code".
  const map = { INSUFFICIENT_FUNDS: 402, CALL_EXCEPTION: 422, NETWORK_ERROR: 502, SERVER_ERROR: 502 };
  const status = err.status || map[err.code] || 500;
  res.status(status).json({ error: err.reason || err.message, code: err.code });
};