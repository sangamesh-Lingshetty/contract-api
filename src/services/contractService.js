const { ethers } = require('ethers');
const { provider, signer } = require('../config/blockchain');
const registry = require('../contracts/registry');
const httpError = require('../utils/httpError');

const READ_ONLY = ['view', 'pure'];

// BigNumbers cannot go into JSON directly, so convert them to strings.
const serialize = (value) =>
  JSON.parse(JSON.stringify(value, (_, v) => (v && v._isBigNumber ? v.toString() : v)));

function getContract(name, { write = false } = {}) {
  const entry = registry[name];
  if (!entry) throw httpError(404, `Contract "${name}" is not registered`);
  if (write && !signer) throw httpError(503, 'Write operations are disabled: no signer configured');
  return new ethers.Contract(entry.address, entry.abi, write ? signer : provider);
}

// Only methods that exist in the registered ABI can be called.
function getMethod(contract, method) {
  try {
    return contract.interface.getFunction(method);
  } catch {
    throw httpError(400, `Method "${method}" does not exist on this contract`);
  }
}

exports.listContracts = () =>
  Object.entries(registry).map(([name, c]) => ({ name, network: c.network, address: c.address }));

exports.read = async (name, method, args) => {
  const contract = getContract(name);
  const fn = getMethod(contract, method);
  if (!READ_ONLY.includes(fn.stateMutability)) throw httpError(400, `"${method}" is a write method`);
  return { result: serialize(await contract[method](...args)) };
};

exports.write = async (name, method, args, valueInEth) => {
  const contract = getContract(name, { write: true });
  const fn = getMethod(contract, method);
  if (READ_ONLY.includes(fn.stateMutability)) throw httpError(400, `"${method}" is a read method`);
  const overrides = valueInEth ? { value: ethers.utils.parseEther(String(valueInEth)) } : {};
  const tx = await contract[method](...args, overrides);
  // Return immediately. The client polls /tx/:hash for the result.
  return { txHash: tx.hash, status: 'pending' };
};

exports.getTransactionStatus = async (hash) => {
  if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) throw httpError(400, 'Invalid transaction hash');
  const receipt = await provider.getTransactionReceipt(hash);
  if (!receipt) return { txHash: hash, status: 'pending' };
  return {
    txHash: hash,
    status: receipt.status === 1 ? 'success' : 'failed',
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
  };
};

exports.getEvents = async (name, eventName, blocksBack) => {
  const contract = getContract(name);
  if (!contract.interface.events[Object.keys(contract.interface.events).find((e) => e.startsWith(`${eventName}(`))]) {
    throw httpError(400, `Event "${eventName}" does not exist on this contract`);
  }
  const latest = await provider.getBlockNumber();
  const logs = await contract.queryFilter(eventName, latest - blocksBack, latest);
  return serialize(
    logs.map((l) => ({ blockNumber: l.blockNumber, txHash: l.transactionHash, args: l.args }))
  );
};