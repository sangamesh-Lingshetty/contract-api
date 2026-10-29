const service = require('../services/contractService');
const httpError = require('../utils/httpError');

// Express 4 does not catch async errors by itself, so this wrapper forwards them.
const handle = (fn) => (req, res, next) => Promise.resolve(fn(req)).then((data) => res.json(data)).catch(next);

const parseArgs = (body) => {
  const args = body?.args ?? [];
  if (!Array.isArray(args)) throw httpError(400, '"args" must be an array');
  return args;
};

exports.list = handle(() => service.listContracts());
exports.read = handle((req) => service.read(req.params.name, req.params.method, parseArgs(req.body)));

exports.write = handle((req) => {
  const { value } = req.body ?? {};
  if (value !== undefined && !/^\d+(\.\d+)?$/.test(String(value))) {
    throw httpError(400, '"value" must be a positive number in ETH');
  }
  return service.write(req.params.name, req.params.method, parseArgs(req.body), value);
});

exports.txStatus = handle((req) => service.getTransactionStatus(req.params.hash));

exports.events = handle((req) => {
  const blocks = Math.min(parseInt(req.query.blocks, 10) || 500, 1000); // cap the range for RPC limits
  return service.getEvents(req.params.name, req.params.event, blocks);
});