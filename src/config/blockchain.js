const { ethers } = require('ethers');

const rpcUrl = process.env.RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

// One shared provider for the whole app (reuses the connection).
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

// Signer is optional: reads work without it, writes require it.
const signer = process.env.PRIVATE_KEY
  ? new ethers.Wallet(process.env.PRIVATE_KEY, provider)
  : null;

module.exports = { provider, signer };